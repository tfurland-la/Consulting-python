"""Exercise 3 — YOUR module: extraction, few-shot, confidence routing.

The Phase-0 baseline (baseline_extractor.py) proved the output_config /
json_schema pattern on consulting notes. This pipeline points it at the
contract corpus in fixtures/ — schema design, few-shot content, and
confidence logic are yours. See README.md for the phase gates.
"""

# ── Phase 2: the contract schema ───────────────────────────────────────────
# Target fields (the answer key uses exactly these names): client_name,
# contract_value, currency, start_date, duration_weeks, jurisdiction,
# payment_terms, deliverables. Which of these must be NULLABLE — and why —
# is the design decision the phase gate tests. A required field that
# pressures the model into fabricating is the D4.3/D4.4 boundary.
CONTRACT_SCHEMA = {}  # YOU WRITE THIS — see README phase 2

# 2–4 targeted examples for the formats that fail zero-shot (run the
# harness first; let the failures tell you which formats need examples).
FEW_SHOT_EXAMPLES = []  # YOU WRITE THIS — see README phase 2


def extract_contract_fields(doc_text, client=None, use_few_shot=False):
    """Phase 2 — one document in, one schema-shaped dict out. Honors
    use_few_shot so the harness can compare zero-shot vs few-shot runs."""
    raise NotImplementedError("YOU WRITE THIS — see README phase 2")


def assign_confidence(extraction, doc_text):
    """Phase 4 — per-field confidence scores attached to an extraction.
    How you derive them (schema echo, model self-report, heuristics on the
    source text) is your design; the gate is what routing does with them."""
    raise NotImplementedError("YOU WRITE THIS — see README phase 4")


def route_for_review(scored, threshold):
    """Phase 4 — given a confidence-scored extraction set, return the
    human-review list: which documents, which fields, and why."""
    raise NotImplementedError("YOU WRITE THIS — see README phase 4")
