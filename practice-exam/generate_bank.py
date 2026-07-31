"""Author-side CLI that grows the committed question bank (questions.js).

Workflow:
  1. Generate candidates into questions_pending.json (resumable, gitignored):
       python3 practice-exam/generate_bank.py --per-task 4 [--tasks D1.1,D4.3] [--workers 4]
  2. Human review pass over questions_pending.json: edit or delete entries.
     Hunt specifically for invented flags, environment variables, or
     configuration claims — the known fabrication failure mode.
  3. Merge the reviewed file into the bank and clear it:
       python3 practice-exam/generate_bank.py --merge

Run with no arguments to see per-task-statement coverage.
"""

import argparse
import datetime
import json
import os
import sys
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed

import exam_lib

PENDING_PATH = exam_lib.PRACTICE_EXAM_DIR / "questions_pending.json"
FAILURES_PATH = exam_lib.PRACTICE_EXAM_DIR / "questions_failed.json"


def load_pending():
    if PENDING_PATH.exists():
        return json.loads(PENDING_PATH.read_text(encoding="utf-8"))
    return []


def save_pending(pending):
    PENDING_PATH.write_text(
        json.dumps(pending, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


def save_failures(failed):
    """Record the items a run did not produce, and why.

    Overwritten per run, not appended: the useful question is "what did THIS run
    fail to produce", and a growing file of stale entries answers a different one.
    """
    FAILURES_PATH.write_text(
        json.dumps(failed, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


def remaining_targets(pending, per_task, tasks=None):
    """How many candidates each targeted task statement still needs."""
    targets = tasks if tasks else list(exam_lib.TASK_STATEMENTS)
    for ts in targets:
        if ts not in exam_lib.TASK_STATEMENTS:
            raise ValueError(f"unknown task statement: {ts!r}")
    have = {}
    for entry in pending:
        have[entry["taskStatement"]] = have.get(entry["taskStatement"], 0) + 1
    return {ts: per_task - have.get(ts, 0) for ts in targets if per_task > have.get(ts, 0)}


def merge_pending(bank, pending):
    """Reviewed pending entries -> committed bank entries.

    Recomputes each id (review edits change the content hash), marks entries
    reviewed, validates them fully, and rejects duplicates of existing bank
    content. Returns the new bank; the caller writes it.
    """
    merged = list(bank)
    known_ids = {entry["id"] for entry in bank}
    for entry in pending:
        entry = dict(entry)
        entry["provenance"] = dict(entry["provenance"], reviewed=True)
        entry["id"] = exam_lib.question_id(entry)
        if entry["id"] in known_ids:
            raise ValueError(f"duplicate question content: {entry['id']}")
        exam_lib.validate_question(entry)
        known_ids.add(entry["id"])
        merged.append(entry)
    return merged


def generate(per_task, tasks, workers):
    bank = exam_lib.load_bank()
    bank_ids = {entry["id"] for entry in bank}
    pending = load_pending()
    lock = threading.Lock()
    model = os.environ.get("CCARF_MODEL", exam_lib.DEFAULT_MODEL)
    today = datetime.date.today().isoformat()

    targets = remaining_targets(pending, per_task, tasks)
    # Each question for a statement gets a DIFFERENT exam scenario type,
    # rotating from however many already exist (bank + pending), so a batch
    # cannot reskin one template even when workers run concurrently.
    existing = {}
    for entry in bank + pending:
        existing[entry["taskStatement"]] = existing.get(entry["taskStatement"], 0) + 1
    work = [
        (ts, exam_lib.SCENARIO_TYPES[(existing.get(ts, 0) + k) % len(exam_lib.SCENARIO_TYPES)])
        for ts, needed in targets.items()
        for k in range(needed)
    ]
    if not work:
        print("Nothing to generate — all targeted task statements are covered.")
        return
    print(f"Generating {len(work)} questions across {len(targets)} task statements "
          f"({workers} workers, model {model})…")

    def one(item):
        ts, scenario_type = item
        # Summaries of existing questions steer generation away from reusing
        # a premise, option skeleton, or correct-answer rationale.
        avoid = [exam_lib.summarize_for_avoid(b) for b in bank if b["taskStatement"] == ts]
        with lock:
            avoid += [exam_lib.summarize_for_avoid(p) for p in pending if p["taskStatement"] == ts]
        candidate = exam_lib.generate_question(ts, avoid=avoid, scenario_type=scenario_type)
        entry = exam_lib.attach_provenance(
            candidate, source="seed-generated", model=model, generated_at=today
        )
        with lock:
            pending_ids = {p["id"] for p in pending}
            if entry["id"] in bank_ids or entry["id"] in pending_ids:
                return f"{ts}: duplicate content, discarded"
            pending.append(entry)
            save_pending(pending)  # written after every question: resumable
        return f"{ts} ({scenario_type}): ok"

    # Failures used to go to stderr and nowhere else, so a batch that lost items
    # left no record of which ones or why — nothing to resume from, and no way to
    # tell a content failure from an exhausted usage window after the fact.
    failed = []
    rate_limited = False
    cancelled = set()

    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = {pool.submit(one, item): item for item in work}
        for future in as_completed(futures):
            ts, scenario_type = futures[future]

            # as_completed still yields futures we cancelled, and result() on one
            # raises CancelledError. Record those here, once, with a reason that
            # says what actually happened — calling result() would log them a
            # second time under a meaningless "CancelledError".
            if future in cancelled:
                failed.append({"taskStatement": ts, "scenarioType": scenario_type,
                               "reason": "deferred: usage limit",
                               "error": "not attempted — batch stopped at the cap"})
                continue

            try:
                print(" ", future.result())
            except exam_lib.RateLimitedError as err:
                # Circuit-breaker: the cap is account-level, so every queued call
                # will fail the same way. Cancel what has not started rather than
                # grinding through the rest of the batch to collect identical errors.
                if not rate_limited:
                    rate_limited = True
                    print(f"\n  USAGE LIMIT reached — {err}", file=sys.stderr)
                    print("  Cancelling queued generations; the cap is account-wide, "
                          "so retrying now would fail identically.", file=sys.stderr)
                    cancelled.update(f for f in futures if f.cancel())
                failed.append({"taskStatement": ts, "scenarioType": scenario_type,
                               "reason": "rate-limited", "error": str(err)})
            except Exception as err:
                failed.append({"taskStatement": ts, "scenarioType": scenario_type,
                               "reason": type(err).__name__, "error": str(err)})
                print(f"  {ts} ({scenario_type}): FAILED — {err}", file=sys.stderr)

    if failed:
        save_failures(failed)

    print(f"\nPending file now has {len(pending)} candidates ({len(failed)} not produced).")
    if failed:
        print(f"  Unproduced items recorded in {FAILURES_PATH.name} — "
              f"re-run to attempt them again.")
    if rate_limited:
        print("  Some were deferred by a usage limit, not by a content problem. "
              "Re-run once the window resets.")
    print(f"Review {PENDING_PATH.name}, then run: generate_bank.py --merge")


def merge():
    pending = load_pending()
    if not pending:
        print("questions_pending.json is empty — nothing to merge.")
        return
    bank = exam_lib.load_bank()
    merged = merge_pending(bank, pending)
    exam_lib.render_bank(merged, exam_lib.BANK_PATH)
    PENDING_PATH.unlink()
    print(f"Merged {len(pending)} questions; bank now has {len(merged)}. "
          "Pending file removed. Run pytest before committing.")


def status():
    bank = exam_lib.load_bank()
    pending = load_pending()
    counts = {ts: [0, 0] for ts in exam_lib.TASK_STATEMENTS}
    for entry in bank:
        counts[entry["taskStatement"]][0] += 1
    for entry in pending:
        counts[entry["taskStatement"]][1] += 1
    print(f"{'statement':<10}{'bank':>6}{'pending':>9}")
    for ts, (in_bank, in_pending) in counts.items():
        print(f"{ts:<10}{in_bank:>6}{in_pending:>9}")
    print(f"\nTotal: {len(bank)} committed, {len(pending)} pending review.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--per-task", type=int, help="generate until each task statement has this many pending candidates")
    parser.add_argument("--tasks", help="comma-separated task statements (default: all 30)")
    parser.add_argument("--workers", type=int, default=4, help="concurrent claude -p calls (default 4)")
    parser.add_argument("--merge", action="store_true", help="merge reviewed pending questions into the bank")
    args = parser.parse_args()

    if args.merge:
        merge()
    elif args.per_task:
        tasks = args.tasks.split(",") if args.tasks else None
        generate(args.per_task, tasks, args.workers)
    else:
        status()


if __name__ == "__main__":
    main()
