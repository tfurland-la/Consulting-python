---
name: exam-refill
description: Grow the CCAR-F practice exam question bank. Use when the user asks to refill the exam bank, add or regenerate practice questions, or top up thin task statements. Runs the generate → screen → human review → merge pipeline around practice-exam/generate_bank.py.
---

# Exam Bank Refill

Grow `practice-exam/questions.js` through the reviewed pipeline. Never edit
`questions.js` directly — `generate_bank.py --merge` is the only writer, and
every committed question must survive screening AND the user's review.

## 1. Status and targets

Run `python3 practice-exam/generate_bank.py` (no arguments) to show
per-statement coverage. Pick targets:

- If the user named task statements, use those.
- Otherwise propose the statements with the lowest counts, and — if
  `practice-exam/exam_progress.json` exists — the user's highest-weight
  (weakest) statements from its `weights` map. Confirm targets with the user.

## 2. Generate

```
python3 practice-exam/generate_bank.py --per-task <N> --tasks <TS1,TS2,…> --workers 1
```

Use `--workers 1`: each generation then sees summaries of all its
predecessors, which is what prevents template reskinning. Concurrent workers
start blind to each other and produce near-duplicate pairs. Candidates land
in gitignored `questions_pending.json` (resumable — rerun after failures).

## 3. Screen

Apply `practice-exam/screening_prompt.md` to every pending candidate — via
subagents for large batches, or directly for a handful. Honor its grounding
rule: the CCAR-F exam guide is authoritative; product-docs divergence is an
annotation, not a disqualifier; invented flags/env-vars/limits disqualify.
Known failure modes to hunt: near-duplicates of existing same-statement
questions (compare premise, option skeleton, correct-answer rationale — not
just topic), and shape-valid stub content ("Test scenario?", options a/b/c/d).

Delete failing candidates from the pending file. If a statement's
regenerations keep converging on one lesson, hand-author from unused
Knowledge/Skills bullets in the exam guide instead, and have the authored
question screened independently.

## 4. Human review — required

Walk the user through the surviving candidates (grouped per statement, with
any screening notes). The user edits or deletes entries in
`questions_pending.json`. Do not merge without their explicit go-ahead:
merge mechanically flips `provenance.reviewed` to true, and that flag is the
repo's claim that a human approved the question.

## 5. Merge and verify

```
python3 practice-exam/generate_bank.py --merge
.venv/bin/python -m pytest -q --ignore=test_lesson5.py --ignore=test_consulting_assistant.py --ignore=test_consulting_notes_extractor.py
```

Merge recomputes content-hash ids (review edits change them), dedupes, and
rewrites `questions.js`. pytest enforces the bank format, per-statement
minimum (`MIN_PER_TASK` in `exam_lib.py`), and exam-form domain quotas.
Commit only after the suite is green.
