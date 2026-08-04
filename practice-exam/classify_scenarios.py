"""Author-side CLI that labels committed bank questions with a scenarioType.

The bank predates the field: 103 questions, each with its own scenario and no
record of which of the exam's six scenario genres it belongs to. The timed
exam's blocked presentation needs that label to group a bank form by genre.

Workflow (mirrors generate_bank.py deliberately — same review gate):
  1. Propose labels into scenario_labels_pending.json (resumable, gitignored):
       python3 practice-exam/classify_scenarios.py --classify [--workers 4]
  2. Human review pass over that file: fix any label that reads wrong.
  3. Merge the reviewed labels into the bank:
       python3 practice-exam/generate_bank.py --merge-classifications

Merging goes through generate_bank.py on purpose. It is the only writer of new
or changed question content, and a second writer would make that invariant
unenforceable.

Run with no arguments to see how much of the bank is labelled, and the
scenario x domain matrix that decides whether a blocked bank form is even
drawable.
"""

import argparse
import json
import sys
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed

import exam_lib

LABELS_PATH = exam_lib.PRACTICE_EXAM_DIR / "scenario_labels_pending.json"

CLASSIFY_JSON_SCHEMA = {
    "type": "object",
    "properties": {
        "scenarioType": {"type": "string", "enum": list(exam_lib.SCENARIO_TYPES)},
    },
    "required": ["scenarioType"],
    "additionalProperties": False,
}

CLASSIFY_PROMPT = (
    "The Claude Certified Architect – Foundations (CCAR-F) exam sets its "
    "questions in six scenario types:\n\n{types}\n\n"
    "Read the practice-exam scenario below and say which ONE of those six it "
    "belongs to. Choose by the situation being described — the system and the "
    "work being done — not by which Claude feature the question happens to "
    "test. If it could plausibly sit in two, pick the one the scenario's "
    "SETTING matches most closely.\n\n"
    "Scenario:\n{scenario}\n\n"
    "Respond with STRICT JSON only, no preamble and no markdown fences:\n"
    '{{"scenarioType": "..."}}'
)

CLASSIFY_TIMEOUT_SECONDS = 60


def load_labels():
    if LABELS_PATH.exists():
        return json.loads(LABELS_PATH.read_text(encoding="utf-8"))
    return {}


def save_labels(labels):
    LABELS_PATH.write_text(
        json.dumps(labels, indent=2, ensure_ascii=False, sort_keys=True) + "\n",
        encoding="utf-8",
    )


def unlabelled(bank, labels):
    """Bank entries still needing a scenarioType, skipping any already proposed."""
    return [q for q in bank if not q.get("scenarioType") and q["id"] not in labels]


def classify_one(question, run=None):
    """Propose one scenarioType. Raises on anything it cannot resolve."""
    run = run or exam_lib.run_claude
    prompt = CLASSIFY_PROMPT.format(
        types="\n".join(f"- {t}" for t in exam_lib.SCENARIO_TYPES),
        scenario=question["scenario"],
    )
    envelope = run(prompt, schema=CLASSIFY_JSON_SCHEMA, timeout=CLASSIFY_TIMEOUT_SECONDS)
    structured = envelope.get("structured_output")
    label = structured.get("scenarioType") if isinstance(structured, dict) else None
    if label is None:
        label = json.loads(
            exam_lib.strip_fences(envelope.get("result", "{}"))
        ).get("scenarioType")
    if label not in exam_lib.SCENARIO_TYPES:
        raise exam_lib.GenerationError(f"not a known scenario type: {label!r}")
    return label


def scenario_domain_matrix(bank):
    """Labelled questions per (scenarioType, domain).

    This — not a per-scenario histogram — is what decides whether a blocked
    bank form can be drawn. A draw has to find each domain's full quota inside
    the four scenarios it drew, so a scenario count of 15+ means nothing if the
    domains inside it are the wrong ones.
    """
    matrix = {t: Counter() for t in exam_lib.SCENARIO_TYPES}
    for question in bank:
        label = question.get("scenarioType")
        if label in matrix:
            matrix[label][question["domain"]] += 1
    return matrix


def print_status(bank, labels):
    labelled = sum(1 for q in bank if q.get("scenarioType"))
    print(f"Bank: {len(bank)} questions, {labelled} labelled, "
          f"{len(labels)} proposed and awaiting review.\n")

    matrix = scenario_domain_matrix(bank)
    domains = list(exam_lib.DOMAINS)
    header = "scenario".ljust(42) + "".join(d.rjust(6) for d in domains) + "   total"
    print(header)
    print("-" * len(header))
    for scenario_type in exam_lib.SCENARIO_TYPES:
        row = matrix[scenario_type]
        total = sum(row.values())
        cells = "".join(str(row.get(d, 0)).rjust(6) for d in domains)
        print(f"{scenario_type[:40].ljust(42)}{cells}{str(total).rjust(8)}")

    print("\nA blocked bank form draws 4 of 6 scenarios and needs each domain's")
    print("full quota inside those four:")
    for domain, quota in exam_lib.EXAM_FORM_QUOTAS.items():
        per_scenario = sorted(
            (matrix[t].get(domain, 0) for t in exam_lib.SCENARIO_TYPES), reverse=True
        )
        best_four = sum(per_scenario[:4])
        worst_four = sum(per_scenario[2:])  # the four scarcest scenarios
        flag = "" if worst_four >= quota else "  <-- some draws cannot fill this"
        print(f"  {domain}: quota {quota:>2}   best 4-draw {best_four:>3}   "
              f"worst 4-draw {worst_four:>3}{flag}")


def classify(workers):
    bank = exam_lib.load_bank()
    labels = load_labels()
    todo = unlabelled(bank, labels)
    if not todo:
        print("Nothing to classify — every question is labelled or proposed.")
        return
    print(f"Classifying {len(todo)} questions ({workers} workers)…")

    # Fan-out is safe here, unlike question generation: classifiers are
    # independent readers and share no diversity state, so a worker that
    # cannot see its siblings loses nothing.
    failed = []
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {pool.submit(classify_one, q): q for q in todo}
        for future in as_completed(futures):
            question = futures[future]
            try:
                labels[question["id"]] = future.result()
                save_labels(labels)  # after each: resumable
                print(f"  {question['id']}: {labels[question['id']]}")
            except Exception as err:
                failed.append(question["id"])
                print(f"  {question['id']}: FAILED — {err}", file=sys.stderr)

    print(f"\n{len(labels)} labels proposed ({len(failed)} failed). "
          f"Review {LABELS_PATH.name}, then run:\n"
          f"  python3 practice-exam/generate_bank.py --merge-classifications")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--classify", action="store_true",
                        help="propose a scenarioType for every unlabelled question")
    parser.add_argument("--workers", type=int, default=4,
                        help="concurrent claude -p calls (default 4)")
    args = parser.parse_args()

    if args.classify:
        classify(args.workers)
    else:
        print_status(exam_lib.load_bank(), load_labels())


if __name__ == "__main__":
    main()
