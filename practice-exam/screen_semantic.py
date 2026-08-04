"""Author-side CLI that runs the judgment screen over pending candidates.

screen_mechanical.py is deterministic — shape, stubs, length tells, text
similarity. It cannot judge whether a claim is invented, whether a distractor
is defensible, or whether a functionally-phrased question resolves to a real
mechanism. That judgment lived only in screening_prompt.md as an instruction to
paste somewhere, which was tolerable while the checks were stylistic.

It stopped being tolerable when generation started phrasing ~45% of questions
functionally. "Does this description resolve to a real, guide-grounded
mechanism?" is the guardrail standing between abstraction and fabrication, and
a guardrail that depends on someone remembering to paste a prompt is not one.

  python3 practice-exam/screen_semantic.py [--workers 4] [--only ID,ID]

Verdicts land in questions_verdicts.json (gitignored). They ANNOTATE — nothing
here deletes a candidate or merges one. The human review pass and
`generate_bank.py --merge` remain the only gates.

Fan-out is safe here, unlike question generation: reviewers are independent
readers that share no diversity state, so a reviewer blind to its siblings
loses nothing. (Generation is the opposite — see the note in generate_bank.py.)
"""

import argparse
import json
import sys
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed

import exam_lib

PENDING_PATH = exam_lib.PRACTICE_EXAM_DIR / "questions_pending.json"
VERDICTS_PATH = exam_lib.PRACTICE_EXAM_DIR / "questions_verdicts.json"
SCREENING_PROMPT_PATH = exam_lib.PRACTICE_EXAM_DIR / "screening_prompt.md"

VERDICT_JSON_SCHEMA = {
    "type": "object",
    "properties": {
        "verdict": {"type": "string", "enum": ["pass", "concern"]},
        "concerns": {"type": "array", "items": {"type": "string"}},
        "resolvesTo": {"type": "string"},
    },
    "required": ["verdict", "concerns", "resolvesTo"],
    "additionalProperties": False,
}

SCREEN_TIMEOUT_SECONDS = 120


def build_screen_prompt(question, screening_prompt):
    """The durable screening prompt plus the one candidate under review."""
    content = {
        field: question[field]
        for field in sorted(exam_lib.CONTENT_FIELDS)
        if field in question
    }
    register = question.get("register", "named")
    resolves_instruction = (
        "This question is in the FUNCTIONAL register: it describes its "
        "mechanism by behaviour rather than naming it. Name the specific real "
        "mechanism the description resolves to, in `resolvesTo`. If you cannot "
        "identify one, that is itself the finding — return verdict `concern`, "
        "say so in `concerns`, and put \"UNRESOLVED\" in `resolvesTo`. Do not "
        "resolve the ambiguity charitably by picking the nearest plausible "
        "mechanism."
        if register == "functional"
        else "This question is in the NAMED register. Put the mechanism it "
             "tests in `resolvesTo`, or \"n/a\" if it turns on a principle "
             "rather than a named mechanism."
    )
    return (
        f"{screening_prompt}\n\n"
        f"{'=' * 70}\nCANDIDATE UNDER REVIEW (register: {register})\n{'=' * 70}\n\n"
        f"{json.dumps(content, indent=2, ensure_ascii=False)}\n\n"
        f"{resolves_instruction}\n\n"
        "Respond with STRICT JSON only, no preamble and no markdown fences:\n"
        '{"verdict": "pass|concern", "concerns": ["..."], "resolvesTo": "..."}'
    )


def screen_one(question, screening_prompt, run=None):
    """One reviewer, one candidate. Returns the verdict dict."""
    run = run or exam_lib.run_claude
    envelope = run(
        build_screen_prompt(question, screening_prompt),
        schema=VERDICT_JSON_SCHEMA,
        timeout=SCREEN_TIMEOUT_SECONDS,
    )
    structured = envelope.get("structured_output")
    if not isinstance(structured, dict):
        structured = json.loads(exam_lib.strip_fences(envelope.get("result", "{}")))
    if structured.get("verdict") not in ("pass", "concern"):
        raise exam_lib.GenerationError(f"no usable verdict: {structured!r}")
    return {
        "id": question.get("id"),
        "taskStatement": question.get("taskStatement"),
        "register": question.get("register", "named"),
        "verdict": structured["verdict"],
        "concerns": structured.get("concerns") or [],
        "resolvesTo": structured.get("resolvesTo", ""),
    }


def summarize(verdicts):
    """Counts a human needs before deciding where to spend review time."""
    by_verdict = Counter(v["verdict"] for v in verdicts)
    functional = [v for v in verdicts if v["register"] == "functional"]
    unresolved = [
        v for v in functional
        if not v["resolvesTo"] or v["resolvesTo"].strip().upper() == "UNRESOLVED"
    ]
    return {
        "total": len(verdicts),
        "pass": by_verdict.get("pass", 0),
        "concern": by_verdict.get("concern", 0),
        "functional": len(functional),
        "unresolved": len(unresolved),
        "unresolvedIds": [v["id"] for v in unresolved],
    }


def screen(workers, only=None):
    if not PENDING_PATH.exists():
        print(f"{PENDING_PATH.name} not found — nothing to screen.")
        return
    pending = json.loads(PENDING_PATH.read_text(encoding="utf-8"))
    if only:
        wanted = set(only)
        pending = [q for q in pending if q.get("id") in wanted]
    if not pending:
        print("Nothing to screen.")
        return
    screening_prompt = SCREENING_PROMPT_PATH.read_text(encoding="utf-8")

    print(f"Screening {len(pending)} candidates ({workers} reviewers)…")
    verdicts = []
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {
            pool.submit(screen_one, q, screening_prompt): q for q in pending
        }
        for future in as_completed(futures):
            question = futures[future]
            try:
                verdict = future.result()
            except Exception as err:
                # A reviewer that fell over is not a pass. Record it as a
                # concern so it cannot slip through as screened-and-clean.
                verdict = {
                    "id": question.get("id"),
                    "taskStatement": question.get("taskStatement"),
                    "register": question.get("register", "named"),
                    "verdict": "concern",
                    "concerns": [f"screening failed: {type(err).__name__}: {err}"],
                    "resolvesTo": "",
                }
                print(f"  {verdict['id']}: FAILED — {err}", file=sys.stderr)
            verdicts.append(verdict)
            VERDICTS_PATH.write_text(
                json.dumps(verdicts, indent=2, ensure_ascii=False) + "\n",
                encoding="utf-8",
            )
            mark = "ok " if verdict["verdict"] == "pass" else "!! "
            print(f"  {mark}{verdict['id']} [{verdict['register']}] "
                  f"-> {verdict['resolvesTo'] or '(none)'}")
            for concern in verdict["concerns"]:
                print(f"       - {concern}")

    stats = summarize(verdicts)
    print(f"\n{stats['pass']} pass / {stats['concern']} concern "
          f"of {stats['total']}.")
    print(f"Functional-register candidates: {stats['functional']}, of which "
          f"{stats['unresolved']} could not be resolved to a real mechanism.")
    if stats["unresolvedIds"]:
        print("  UNRESOLVED — the abstraction-became-fabrication failure mode. "
              "Read these first:")
        for qid in stats["unresolvedIds"]:
            print(f"    {qid}")
    print(f"\nVerdicts written to {VERDICTS_PATH.name}. They annotate only — "
          f"nothing was deleted or merged.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--workers", type=int, default=4,
                        help="concurrent reviewers (default 4)")
    parser.add_argument("--only", help="comma-separated question ids to screen")
    args = parser.parse_args()
    screen(args.workers, args.only.split(",") if args.only else None)


if __name__ == "__main__":
    main()
