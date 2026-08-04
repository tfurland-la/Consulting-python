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


def register_mix(entries):
    """Realized register counts over a set of entries.

    Realized, not assigned: a batch asks for a fraction, but failures, dedup
    discards and review deletions all move it, and functional questions carry
    the most fabrication risk so deletions plausibly correlate with register.
    Reporting the assigned fraction would be reporting an intention.
    """
    functional = sum(1 for e in entries if e.get("register") == "functional")
    named = sum(1 for e in entries if e.get("register") == "named")
    unlabelled = len(entries) - functional - named
    return {
        "functional": functional,
        "named": named,
        "unlabelled": unlabelled,
        "fraction": (functional / len(entries)) if entries else 0.0,
    }


def plan_registers(count, pending, fraction=None):
    """Registers for `count` new candidates, given what is already pending.

    Planning each run in isolation lets a bank drift lopsided one partial batch
    at a time: a run that dies after its named questions leaves the functional
    share owed, and the next run — starting fresh — never repays it. So aim the
    fraction at the combined total and ask this run for the shortfall.
    Unlabelled pending entries count as named; they predate the field, and
    reading absence as functional would invert the shortfall.
    """
    share = exam_lib.FUNCTIONAL_FRACTION if fraction is None else fraction
    have = register_mix(pending)["functional"]
    wanted = round((len(pending) + count) * share)
    owed = max(0, min(count, wanted - have))
    return exam_lib.register_plan(count, fraction=owed / count if count else 0)


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


def build_work_list(targets, existing, scenario=None):
    """(task statement, scenario type) pairs for this run.

    By default each question for a statement gets a DIFFERENT scenario type,
    rotating from however many already exist, so a batch cannot reskin one
    template. `scenario` overrides that and pins every question to one type —
    the rotation is right for diversity and useless when a specific
    (scenario, domain) cell in the bank has to be filled, which is what topping
    up a thin scenario means.
    """
    if scenario is not None and scenario not in exam_lib.SCENARIO_TYPES:
        raise ValueError(f"unknown scenario type: {scenario!r}")
    work = []
    for ts, needed in targets.items():
        for k in range(needed):
            rotated = exam_lib.SCENARIO_TYPES[
                (existing.get(ts, 0) + k) % len(exam_lib.SCENARIO_TYPES)
            ]
            work.append((ts, scenario or rotated))
    return work


def statement_work_queues(work):
    """Group a flat work list into one ordered queue per task statement.

    The unit of concurrency: a whole statement goes to one worker, which walks
    its queue in order. Concurrency across statements is free — their
    avoid-lists never overlap — while concurrency within one is what produced
    near-duplicate pairs and forced --workers 1.
    """
    queues = {}
    for item in work:
        queues.setdefault(item[0], []).append(item)
    return queues


def generate(per_task, tasks, workers, functional_fraction=None, scenario=None):
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
    work = build_work_list(targets, existing, scenario)
    if not work:
        print("Nothing to generate — all targeted task statements are covered.")
        return
    # Registers are spread across the batch, aimed at the fraction over pending
    # + this run so a resumed batch repays whatever the failed one left owed.
    registers = plan_registers(len(work), pending, fraction=functional_fraction)
    work = [(ts, scenario_type, registers[i])
            for i, (ts, scenario_type) in enumerate(work)]
    print(f"Generating {len(work)} questions across {len(targets)} task statements "
          f"({workers} workers, model {model}, "
          f"{registers.count('functional')} functional / {registers.count('named')} named)…")

    def one(item):
        ts, scenario_type, register = item
        # Summaries of existing questions steer generation away from reusing
        # a premise, option skeleton, or correct-answer rationale.
        avoid = [exam_lib.summarize_for_avoid(b) for b in bank if b["taskStatement"] == ts]
        with lock:
            avoid += [exam_lib.summarize_for_avoid(p) for p in pending if p["taskStatement"] == ts]
        candidate = exam_lib.generate_question(
            ts, avoid=avoid, scenario_type=scenario_type, register=register
        )
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
    # Account-wide cap: once it trips, every remaining call fails identically,
    # so stop rather than grind through the batch collecting the same error.
    stop = threading.Event()

    def record(item, reason, error):
        ts, scenario_type, register = item
        failed.append({"taskStatement": ts, "scenarioType": scenario_type,
                       "register": register, "reason": reason, "error": error})

    def one_statement(ts, queue):
        """Walk one statement's queue in order.

        Sequential by construction: each question's avoid-list is rebuilt from
        `pending`, which the previous one has already been appended to, so the
        Nth question sees all N-1 of its predecessors plus everything banked.
        """
        lines = []
        for item in queue:
            if stop.is_set():
                record(item, "deferred: usage limit",
                       "not attempted — batch stopped at the cap")
                continue
            try:
                lines.append(one(item))
            except exam_lib.RateLimitedError as err:
                if not stop.is_set():
                    stop.set()
                    print(f"\n  USAGE LIMIT reached — {err}", file=sys.stderr)
                    print("  Stopping queued generations; the cap is account-wide, "
                          "so retrying now would fail identically.", file=sys.stderr)
                record(item, "rate-limited", str(err))
            except Exception as err:
                record(item, type(err).__name__, str(err))
                print(f"  {ts} ({item[1]}): FAILED — {err}", file=sys.stderr)
        return lines

    queues = statement_work_queues(work)
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = [pool.submit(one_statement, ts, q) for ts, q in queues.items()]
        for future in as_completed(futures):
            for line in future.result():
                print(" ", line)

    if failed:
        save_failures(failed)

    print(f"\nPending file now has {len(pending)} candidates ({len(failed)} not produced).")
    if failed:
        print(f"  Unproduced items recorded in {FAILURES_PATH.name} — "
              f"re-run to attempt them again.")
    if stop.is_set():
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
    # What was actually banked, not what the batch asked for. Review deletions
    # land here and nowhere else, so this is the only honest read on the mix.
    batch = register_mix(pending)
    whole = register_mix(merged)
    print(f"  Register mix, this batch: {batch['functional']} functional / "
          f"{batch['named']} named ({batch['fraction']:.0%} functional)")
    print(f"  Register mix, whole bank: {whole['functional']} functional / "
          f"{whole['named']} named, {whole['unlabelled']} unlabelled "
          f"(target {exam_lib.FUNCTIONAL_FRACTION:.0%} of labelled)")


def merge_classifications(bank, labels):
    """Apply reviewed scenarioType labels to bank entries.

    Ids are NOT recomputed and must not change: canonical_content hashes only
    scenario/question/options, so labelling is invisible to identity. A changed
    id here would mean the label edited the question, which it must never do.
    """
    merged = []
    applied = 0
    for entry in bank:
        label = labels.get(entry["id"])
        if label is None:
            merged.append(entry)
            continue
        if label not in exam_lib.SCENARIO_TYPES:
            raise ValueError(f"{entry['id']}: unknown scenario type {label!r}")
        before = entry["id"]
        entry = dict(entry, scenarioType=label)
        if exam_lib.question_id(entry) != before:
            raise ValueError(f"{before}: labelling changed the content hash")
        exam_lib.validate_question(entry)
        merged.append(entry)
        applied += 1
    return merged, applied


def merge_classification_labels():
    """Merge classify_scenarios.py's reviewed labels into the bank.

    Lives here rather than in classify_scenarios.py so this file stays the only
    writer of question content — an invariant the refill workflow depends on.
    """
    labels_path = exam_lib.PRACTICE_EXAM_DIR / "scenario_labels_pending.json"
    if not labels_path.exists():
        print(f"{labels_path.name} not found — run classify_scenarios.py --classify first.")
        return
    labels = json.loads(labels_path.read_text(encoding="utf-8"))
    if not labels:
        print(f"{labels_path.name} is empty — nothing to merge.")
        return
    bank = exam_lib.load_bank()
    merged, applied = merge_classifications(bank, labels)
    exam_lib.render_bank(merged, exam_lib.BANK_PATH)
    labels_path.unlink()
    labelled = sum(1 for q in merged if q.get("scenarioType"))
    print(f"Applied {applied} labels; {labelled} of {len(merged)} questions now "
          f"carry a scenarioType. Labels file removed.")
    print("Run classify_scenarios.py (no arguments) for the scenario x domain "
          "matrix, and pytest before committing.")


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
    parser.add_argument(
        "--merge-classifications",
        action="store_true",
        help="merge reviewed scenarioType labels from classify_scenarios.py",
    )
    parser.add_argument(
        "--scenario",
        help=(
            "pin every question to one exam scenario type instead of rotating "
            "(use when topping up a thin scenario)"
        ),
    )
    parser.add_argument(
        "--functional-fraction",
        type=float,
        default=None,
        help=(
            "share of candidates phrased functionally rather than by naming the "
            f"mechanism (default {exam_lib.FUNCTIONAL_FRACTION})"
        ),
    )
    args = parser.parse_args()

    if args.merge:
        merge()
    elif args.merge_classifications:
        merge_classification_labels()
    elif args.per_task:
        tasks = args.tasks.split(",") if args.tasks else None
        generate(args.per_task, tasks, args.workers, args.functional_fraction,
                 args.scenario)
    else:
        status()


if __name__ == "__main__":
    main()
