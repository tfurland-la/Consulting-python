"""Phase 4 skeletons — confidence routing and the aggregate trap. YOU write
every assertion. Fully offline: fixtures/synthetic_results.json is a
pre-corrupted result set where the aggregate looks healthy while one
stratum is bad — because the corpus was engineered, you can PROVE which.
"""

import pytest

import data
import extractor_pipeline  # noqa: F401 — used by the assertions you will write
import scoring  # noqa: F401 — used by the assertions you will write


def test_low_confidence_routed_to_review():
    """GATE (Phase 4): items below threshold land on the review list."""
    pytest.fail("SCAFFOLD-TODO: below-threshold extraction appears in route_for_review output")


def test_high_confidence_skips_review():
    """GATE (Phase 4): items above threshold do NOT consume reviewer
    capacity — the point of calibration is spending humans where they pay."""
    pytest.fail("SCAFFOLD-TODO: above-threshold extraction absent from review list")


def test_review_items_name_doc_and_field():
    """GATE (Phase 4): a review item is actionable — it names the document,
    the field, and enough context to check it without re-running anything."""
    pytest.fail("SCAFFOLD-TODO: review entries carry doc id + field + context")


def test_stratified_view_exposes_weak_stratum():
    """GATE (Phase 4, the payoff): on synthetic_results.json, the aggregate
    accuracy is high while one (doc_type, field) stratum is poor. Your
    stratified view must EXPOSE it; your assertion must NAME it. This is
    the 97%-hides-40% trap, built by your own hands."""
    results = data.load_synthetic_results()
    key = data.load_answer_key()
    pytest.fail("SCAFFOLD-TODO: aggregate high AND the weak stratum named + poor")
