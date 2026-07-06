"""Phase 4 skeletons — failure injection and coverage annotations. YOU
write every assertion. mock_tools.set_timeout_injection arms one-shot
timeouts; your subagent's retry makes "fails once, retry succeeds" and
"retries exhausted" both constructible.
"""

import pytest

import mock_tools  # noqa: F401
import research_pipeline  # noqa: F401 — used by the assertions you will write


def test_timeout_triggers_exactly_one_retry():
    """GATE (Phase 4): on SearchTimeoutError the subagent retries locally
    exactly once. Inject on call 1: call 2 (the retry) succeeds — count the
    search calls."""
    pytest.fail("SCAFFOLD-TODO: one timeout -> exactly one retry -> success")


def test_exhausted_retry_returns_structured_error_context():
    """GATE (Phase 4/D5.3): when the retry also times out, the subagent
    returns structured error context — failure type, attempted query,
    partial results, alternatives — NOT an exception, NOT an empty success."""
    pytest.fail("SCAFFOLD-TODO: error context carries type/query/partials/alternatives")


def test_report_annotates_partial():
    """GATE (Phase 4): with one source lost, the report marks affected
    sections PARTIAL and NAMES the missing source. Diff against a clean
    run: the failed-run report must look different."""
    pytest.fail("SCAFFOLD-TODO: PARTIAL annotation present, missing source named")


def test_report_annotates_not_covered():
    """GATE (Phase 4): a subtask with nothing recoverable surfaces as NOT
    COVERED — visible gap, not silent completeness. Also assert the two
    anti-patterns are absent: no empty-marked-success, no full-pipeline
    abort on one failure."""
    pytest.fail("SCAFFOLD-TODO: NOT COVERED visible; pipeline still returned a report")
