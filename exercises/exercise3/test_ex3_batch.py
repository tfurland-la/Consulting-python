"""Phase 3 skeletons — batch lifecycle mechanics. YOU write every assertion.

Offline: these test request CONSTRUCTION and result HANDLING; the live
submit/poll cycle is your phase gate, run manually.
"""

import pytest

import data
import batch_runner  # noqa: F401 — used by the assertions you will write


def test_batch_requests_have_unique_custom_ids():
    """GATE (Phase 3): build_batch_requests over all 21 docs yields one
    request per doc with unique custom_ids — the correlation mechanism the
    exam tests (and the reason result ordering doesn't matter)."""
    doc_ids = sorted(data.load_docs())
    pytest.fail("SCAFFOLD-TODO: len==21, custom_ids unique and doc-correlatable")


def test_results_keyed_by_custom_id():
    """GATE (Phase 3): whatever submit_and_wait returns, results are
    addressable by custom_id, successes and failures both."""
    pytest.fail("SCAFFOLD-TODO: results indexable by custom_id incl. failures")


def test_oversized_doc_reported_failed():
    """GATE (Phase 3): the doc_21_oversized entry surfaces as a FAILURE in
    your result handling (fixture key marks expected_batch_failure), not as
    a silent absence."""
    pytest.fail("SCAFFOLD-TODO: find_failed(...) includes doc_21's custom_id")


def test_resubmission_targets_only_failed():
    """GATE (Phase 3): resubmit_failed builds requests for exactly the
    failed ids — never the 20 that succeeded."""
    pytest.fail("SCAFFOLD-TODO: resubmission set == failed set")
