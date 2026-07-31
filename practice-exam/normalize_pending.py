"""Randomize option order across generated questions.

Why this exists as a step rather than a prompt instruction: a generator has a
positional habit, and asking is weaker than enforcing. Permuting the options after
generation removes positional bias regardless of what the model did.

The habit is real and severe here. Measured on the committed 103-question bank:
**77% of correct answers sit on A, and D is never correct at all.** Someone who
always picks A scores 77% without reading a word, and D is a free elimination. (The
CCAO-F fork this came from measured 68% on B, which is what motivated the tool.)

Permuting is safe because the options are independent alternatives: remap options,
explanations and the correct key together and the item is unchanged apart from which
letter carries which text.

Seeded, so a rerun on the same file gives the same result and a review is not
invalidated by re-running the tool.

    python3 practice-exam/normalize_pending.py [--seed N]
    python3 practice-exam/normalize_pending.py --bank --dry-run   # see the effect

NOTE ON --bank. Permuting the committed bank rewrites every `id`, because
`question_id` hashes the option block. Anything referencing an id by value goes
stale. So --bank requires --write to actually do it, and --dry-run is the default
there; use it to see what the fix would achieve before deciding.
"""

import argparse
import json
import random
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import exam_lib  # noqa: E402

PENDING_PATH = exam_lib.PRACTICE_EXAM_DIR / "questions_pending.json"


def correct_keys(question):
    """`correct` as a list. Single-response credential; kept as the one place to
    change if that ever stops being true. See screen_mechanical.py."""
    raw = question["correct"]
    return sorted(raw) if isinstance(raw, list) else [raw]


def permute(question, rng):
    keys = sorted(question["options"])
    shuffled = keys[:]
    rng.shuffle(shuffled)
    mapping = dict(zip(shuffled, keys))          # old key -> new key
    question["options"] = {mapping[k]: question["options"][k] for k in keys}
    question["explanations"] = {mapping[k]: question["explanations"][k] for k in keys}
    raw = question["correct"]
    if isinstance(raw, list):
        question["correct"] = sorted(mapping[k] for k in raw)
    else:
        question["correct"] = mapping[raw]
    question["id"] = exam_lib.question_id(question)   # id hashes the option block
    return question


def spread(counter):
    return "  ".join(f"{k}={counter.get(k, 0)}" for k in exam_lib.OPTION_KEYS)


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--seed", type=int, default=20260731)
    ap.add_argument("--bank", action="store_true",
                    help="operate on the committed bank instead of the pending file")
    ap.add_argument("--write", action="store_true",
                    help="with --bank, actually write (rewrites every id)")
    args = ap.parse_args()

    if args.bank:
        items = exam_lib.load_bank()
        target, label = exam_lib.BANK_PATH, "committed bank"
    else:
        if not PENDING_PATH.exists():
            print(f"no pending file at {PENDING_PATH.name}")
            return 1
        items = json.loads(PENDING_PATH.read_text(encoding="utf-8"))
        target, label = PENDING_PATH, PENDING_PATH.name

    before = Counter(k for q in items for k in correct_keys(q))
    rng = random.Random(args.seed)
    for q in items:
        permute(q, rng)
        # A permutation must not change what the item asks or how it scores.
        content = {k: v for k, v in q.items() if k not in ("id", "provenance")}
        exam_lib.validate_question(content, require_provenance=False)
    after = Counter(k for q in items for k in correct_keys(q))

    write = (not args.bank) or args.write
    if write:
        if args.bank:
            # render_bank(bank) with no path RETURNS the source and writes nothing —
            # passing the path is what makes --write actually write.
            exam_lib.render_bank(items, path=exam_lib.BANK_PATH)
        else:
            target.write_text(
                json.dumps(items, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"permuted {len(items)} items in the {label} (seed {args.seed})"
          + ("" if write else "  [DRY RUN — nothing written]"))
    print(f"  before: {spread(before)}")
    print(f"  after : {spread(after)}")
    tb, ta = sum(before.values()), sum(after.values())
    if tb and ta:
        print(f"  worst position: {max(before.values()) / tb:.0%} -> "
              f"{max(after.values()) / ta:.0%}")
        gone = [k for k in exam_lib.OPTION_KEYS if not after.get(k)]
        print(f"  never-correct positions: "
              f"{', '.join(k for k in exam_lib.OPTION_KEYS if not before.get(k)) or 'none'}"
              f" -> {', '.join(gone) or 'none'}")
    if args.bank and not write:
        print("\n  Re-run with --write to apply. That rewrites every question id,\n"
              "  because question_id hashes the option block.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
