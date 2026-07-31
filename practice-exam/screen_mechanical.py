"""Deterministic pre-screen over generated questions.

Runs the checks a script can decide, so the LLM screening pass (and the human
review after it) only spends attention on judgment: whether a claim is fabricated
and whether a distractor is defensible.

Reports; never deletes. The author decides what goes.

    python3 practice-exam/screen_mechanical.py           # questions_pending.json
    python3 practice-exam/screen_mechanical.py --bank     # the committed bank

Ported from the CCAO-F fork, which had these checks and this repo did not — 103
questions were sitting behind schema validation alone. Three deliberate divergences
from that copy, so the two do not silently drift:

  * `correct_keys` is local, not imported. This credential is single-response:
    exam_lib's schema pins `correct` to a string and every banked item is one. The
    fork needed a helper because it supports list answers. Kept as a function so
    that, if multi-response is ever added here, this is the single place to change.
  * The fork's DEVELOPER CONTENT check is NOT ported. It flags terms like "mcp
    server", "tool_use", "codebase" because its credential is explicitly not for
    people who build against APIs. This one is the Architect credential, where that
    vocabulary is the subject matter. Porting it would flag every good question.
  * No multiple-response reporting: the schema forbids it here, so the count would
    always be zero.
"""

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from difflib import SequenceMatcher
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import exam_lib  # noqa: E402

PENDING_PATH = exam_lib.PRACTICE_EXAM_DIR / "questions_pending.json"

# Shape-valid stub content the generator emits when it gives up. Matched on word
# boundaries: plain substring matching fires on "adoption anywhere" (containing
# "option a"), and "tbd" would hit inside ordinary words too.
#
# A bare "placeholder" was on this list and was removed: it fired on a legitimate
# explanation — "fills the field with the semantically correct value rather than a
# placeholder" — which is real content about a real failure mode. That is the same
# trap the "option a" comment above describes, and the same rule applies: a term an
# author would plausibly write in ordinary prose does not belong here, however
# stub-like it sounds. The unambiguous forms are kept.
STUB_MARKERS = ["test scenario", "lorem ipsum", "option a", "tbd", "xxx",
                "example.com", "placeholder text", "[placeholder]",
                "your text here", "insert scenario"]


def stub_pattern(marker):
    r"""Word-boundary match, but only where a boundary is meaningful.

    `\b` asserts a word/non-word transition, so `\b\[placeholder\]\b` can only match
    if a word character sits immediately before the `[` — which is never. Anchor only
    the ends that actually start or end with a word character.
    """
    body = re.escape(marker)
    left = r"\b" if marker[:1].isalnum() else ""
    right = r"\b" if marker[-1:].isalnum() else ""
    return left + body + right

SKEW_LIMIT = 0.40        # one answer position holding more than this is exploitable
LENGTH_TELL_RATIO = 1.6  # correct option this much longer than the runner-up
DUPE_LIMIT = 0.62        # same-objective scenario similarity
CIRCULAR_LIMIT = 0.72    # rationale that just restates its option


def correct_keys(question):
    """`correct` as a list. Single-response credential — see the module docstring."""
    raw = question["correct"]
    return sorted(raw) if isinstance(raw, list) else [raw]


def norm(text):
    return re.sub(r"\W+", " ", (text or "").lower()).strip()


def similarity(a, b):
    return SequenceMatcher(None, norm(a), norm(b)).ratio()


def screen(items, bank, source):
    findings = defaultdict(list)

    for i, q in enumerate(items):
        ts = q.get("taskStatement", "?")
        tag = f"[{i}] {ts}"
        blob = json.dumps(q).lower()

        # 1. Content shape. Neither validate_question mode fits a pending entry:
        #    require_provenance=True demands reviewed=true (false by definition
        #    until a human passes it), and False rejects the id/provenance that
        #    generate_bank.py does attach on write. So validate the content on a
        #    stripped copy, which is the part worth checking at this stage.
        content = {k: v for k, v in q.items() if k not in ("id", "provenance")}
        try:
            exam_lib.validate_question(content, require_provenance=False)
        except ValueError as err:
            findings["INVALID SCHEMA"].append(f"{tag}: {err}")
        else:
            if q.get("id") and q["id"] != exam_lib.question_id(q):
                findings["STALE ID"].append(f"{tag}: id does not match content hash")

        # 2. Literal escape sequences. A backslash-n that survived into the text
        #    renders as the characters "\n" in the exam UI. Similarity and stub
        #    checks both miss it because the question is otherwise fine.
        for field in ("scenario", "question"):
            if re.search(r"\\[nt]", q.get(field, "")):
                findings["LITERAL ESCAPE"].append(
                    f"{tag}: {field} contains a literal escape sequence")
        for key, val in q.get("options", {}).items():
            if re.search(r"\\[nt]", val):
                findings["LITERAL ESCAPE"].append(
                    f"{tag}: option {key} contains a literal escape sequence")

        # 3. Stub / placeholder content.
        stubs = sorted({m for m in STUB_MARKERS
                        if re.search(stub_pattern(m), blob)})
        if stubs:
            findings["STUB CONTENT"].append(f"{tag}: {', '.join(stubs)}")

        # 4. Circular explanations: the rationale just restates the option.
        for key in correct_keys(q):
            opt = q.get("options", {}).get(key, "")
            exp = q.get("explanations", {}).get(key, "")
            if opt and exp and similarity(opt, exp) > CIRCULAR_LIMIT:
                findings["CIRCULAR RATIONALE"].append(
                    f"{tag} option {key}: rationale restates the option "
                    f"(similarity {similarity(opt, exp):.2f})")

        # 5. Option-length tell: the longest option being correct is a giveaway a
        #    test-wise candidate can exploit without knowing the content.
        lengths = {k: len(v) for k, v in q.get("options", {}).items()}
        if len(lengths) > 1:
            longest = max(lengths, key=lengths.get)
            if longest in correct_keys(q):
                second = sorted(lengths.values())[-2]
                if lengths[longest] > second * LENGTH_TELL_RATIO:
                    findings["LENGTH TELL"].append(
                        f"{tag}: correct option {longest} is {lengths[longest]} chars "
                        f"vs {second} for the next longest")

    # 6. Near-duplicates within the batch and against the committed bank.
    #
    #    KNOWN BLIND SPOT, measured in the fork this came from: this compares
    #    scenario *text*, and text similarity does not find the duplication that
    #    matters. On a 95-question batch it reported nothing (highest same-objective
    #    similarity 0.15) while an LLM reviewer rejected 38 of 95 as near-duplicates
    #    — questions that swap the persona and surface details but teach one
    #    identical lesson with the same distractor skeleton. So "none" here means
    #    only "no copied wording". Lesson-level convergence needs the judgment
    #    screen; do not read a clean run as diversity.
    for i, q in enumerate(items):
        for j in range(i + 1, len(items)):
            r = items[j]
            if q.get("taskStatement") != r.get("taskStatement"):
                continue
            sim = similarity(q.get("scenario", ""), r.get("scenario", ""))
            if sim > DUPE_LIMIT:
                findings["NEAR-DUPLICATE (batch)"].append(
                    f"[{i}] vs [{j}] {q['taskStatement']}: scenario similarity {sim:.2f}")
        if bank is not items:
            for b in bank:
                if b.get("taskStatement") != q.get("taskStatement"):
                    continue
                sim = similarity(q.get("scenario", ""), b.get("scenario", ""))
                if sim > DUPE_LIMIT:
                    findings["NEAR-DUPLICATE (bank)"].append(
                        f"[{i}] {q['taskStatement']}: {sim:.2f} vs banked {b.get('id')}")

    # ── Report ────────────────────────────────────────────────────────────
    if bank is items:
        print(f"screened the committed bank: {len(items)} questions ({source})\n")
    else:
        print(f"screened {len(items)} candidates against {len(bank)} banked "
              f"({source})\n")

    per_ts = Counter(q.get("taskStatement") for q in items)
    missing = [ts for ts in exam_lib.TASK_STATEMENTS if ts not in per_ts]
    print(f"objectives covered : {len(per_ts)}/{len(exam_lib.TASK_STATEMENTS)}"
          + (f"  MISSING: {', '.join(missing)}" if missing else ""))

    # Aggregate: is the correct option systematically the longest? The per-question
    # LENGTH TELL check above uses a 1.6x threshold and so only catches the extremes.
    # It reported 19 on a bank where the correct option was the longest in 92 of 103
    # — a candidate picking the longest option would have scored ~89%. A per-item
    # threshold cannot see that; only the aggregate can.
    longest_correct = 0
    comparable = 0
    for q in items:
        lengths = {k: len(v) for k, v in q.get("options", {}).items()}
        if len(lengths) < 2:
            continue
        comparable += 1
        keys = correct_keys(q)
        others = [v for k, v in lengths.items() if k not in keys]
        if others and max(lengths[k] for k in keys if k in lengths) > max(others):
            longest_correct += 1
    if comparable:
        share = longest_correct / comparable
        print(f"longest-is-correct : {longest_correct}/{comparable} = {share:.0%}"
              + ("  (chance is ~25%)" if share else ""))
        if share > 0.50:
            print(f"  ^ EXPLOITABLE: picking the longest option scores ~{share:.0%} "
                  f"without reading the material. Fix by giving distractors the same "
                  f"specificity, not by trimming correct answers.")

    positions = Counter(k for q in items for k in correct_keys(q))
    total_keys = sum(positions.values())
    spread = "  ".join(f"{k}={positions.get(k, 0)}" for k in exam_lib.OPTION_KEYS)
    print(f"answer positions   : {spread}")
    if total_keys:
        worst_key, worst_n = positions.most_common(1)[0]
        share = worst_n / total_keys
        never = [k for k in exam_lib.OPTION_KEYS if not positions.get(k)]
        if share > SKEW_LIMIT:
            print(f"  ^ SKEWED: {worst_key} holds {share:.0%} of correct answers "
                  f"(expect ~{1 / len(exam_lib.OPTION_KEYS):.0%} each). "
                  f"A test-wise candidate can exploit this.")
        if never:
            print(f"  ^ NEVER CORRECT: {', '.join(never)} — that position is a free "
                  f"elimination for anyone who notices.")
    print()

    if not findings:
        print("MECHANICAL SCREEN CLEAN — nothing for a script to object to.")
        print("Judgment checks (fabricated claims, defensible distractors) still needed.")
        return 0

    flagged = set()
    for category in sorted(findings):
        entries = findings[category]
        print(f"── {category} ({len(entries)}) ──")
        for line in entries[:14]:
            print(f"  {line}")
            m = re.match(r"\[(\d+)\]", line)
            if m:
                flagged.add(int(m.group(1)))
        if len(entries) > 14:
            print(f"  … and {len(entries) - 14} more")
        print()
    print(f"items with at least one mechanical flag: {len(flagged)} of {len(items)}")
    return 0


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--bank", action="store_true",
                    help="screen the committed bank instead of questions_pending.json")
    args = ap.parse_args()

    bank = exam_lib.load_bank()
    if args.bank:
        return screen(bank, bank, "questions.js")
    if not PENDING_PATH.exists():
        print(f"no pending file at {PENDING_PATH.name} — use --bank to screen "
              f"the committed bank")
        return 1
    pending = json.loads(PENDING_PATH.read_text(encoding="utf-8"))
    return screen(pending, bank, PENDING_PATH.name)


if __name__ == "__main__":
    sys.exit(main())
