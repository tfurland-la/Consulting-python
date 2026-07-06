# Exercise 3 — Structured Data Extraction Pipeline (completion)

**Domains:** D4, D5.5
**Task statements:** D4.2, D4.4, D4.5, D5.5
**Estimated effort:** 2–3 sessions

Steps 1–2 of the guide's version are already done — the
`consulting_notes_extractor` work covered schema design and
validation-with-retry, including the real `BadRequestError` cycles. That
baseline is copied here as [baseline_extractor.py](baseline_extractor.py)
(verify it once with
`.venv/bin/python -m pytest exercises/exercise3/live_baseline_extractor_checks.py -v`
— live API, deliberately named out of automatic collection so folder runs
stay fast and free). This exercise covers the remaining steps against a
purpose-built corpus.

**The corpus is the test fixture.** `fixtures/docs/` holds 21 synthetic
contract documents with engineered variety — inline vs table-only values,
informal durations ("roughly six weeks"), missing jurisdictions, two
internally inconsistent documents, one deliberately oversized — and
`fixtures/answer_key.json` records ground truth plus each doc's quirk tags.
`test_ex3_fixtures.py` (green, Claude-owned) locks the variety counts.

**Yours:** `CONTRACT_SCHEMA`, `FEW_SHOT_EXAMPLES`, and every function in
[extractor_pipeline.py](extractor_pipeline.py),
[batch_runner.py](batch_runner.py), [scoring.py](scoring.py) — plus every
assertion in `test_ex3_{fewshot,batch,confidence}.py`.

---

## Phase 1 — Corpus (done, scaffolded)

Already generated with the variety counts locked by fixtures tests. Skim
two or three docs and the answer key before Phase 2 so you know what the
extractor is up against.

## Phase 2 — Few-shot for heterogeneous formats (D4.2)

Write your schema (decide nullability deliberately — the corpus has
legitimate nulls), then run
`.venv/bin/python exercises/exercise3/run_p2_fewshot.py` zero-shot and log
failures BY FORMAT. Add 2–4 targeted few-shot examples for the failing
formats (informal measurement → structured approximate value; absent field
→ null, not fabricated). Re-run and compare. Assertions in
[test_ex3_fewshot.py](test_ex3_fewshot.py).

**Gate:** measurable improvement on the failing formats, and — critically —
null on absent fields both before and after. If a required field pressured
the model into fabricating, make it nullable. That's the D4.3/D4.4 boundary.

## Phase 3 — Batch API run (D4.5)

**Do the SLA arithmetic on paper first:** results due 30 hours after
documents arrive, batch takes up to 24 — what's the submission window?
Record the answer in your debrief. (You've slipped on this subtraction once
— do it again cold.)

Then implement [batch_runner.py](batch_runner.py): submit all 21 documents
with `custom_id` per document, poll for completion, watch doc_21 fail,
resubmit only the failure, chunked. Assertions in
[test_ex3_batch.py](test_ex3_batch.py).

**Gate:** full batch lifecycle observed — submit, poll, partial failure,
selective resubmission — and total cost noted (it will be cents; the point
is the mechanics).

## Phase 4 — Confidence routing and the aggregate trap (D5.5)

Add per-field confidence to the schema; implement `assign_confidence`,
`route_for_review`, and both accuracy views in [scoring.py](scoring.py).
`fixtures/synthetic_results.json` is a pre-corrupted result set so this
phase works offline before your own batch results exist: aggregate accuracy
looks healthy; one (doc_type, field) stratum is bad. Find it with your
stratified view. Assertions in [test_ex3_confidence.py](test_ex3_confidence.py).

**Gate:** produce the two-view accuracy table and identify which segment the
aggregate hides. You'll have personally built the 97%-hides-40% trap — the
weakest of the seven new topics, so this phase is the one that pays for the
exercise.

---

Done? Fill in a copy of [../DEBRIEF_TEMPLATE.md](../DEBRIEF_TEMPLATE.md) —
including your SLA arithmetic — and hand-lower the settled task statements
in the adaptive tool's seed.
