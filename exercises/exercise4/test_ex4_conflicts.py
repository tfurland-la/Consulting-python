"""Phase 5 skeletons — conflicting statistics preserved through synthesis.
YOU write every assertion. The corpus plants the conflict: article_03
(2024-05) says 42%, article_07 (2025-11) says 31%, same statistic, same
panel, different waves — partly definitional change, partly real decline,
and the report must let a reader see that.
"""

import pytest

import research_pipeline  # noqa: F401 — used by the assertions you will write

CONFLICT_QUESTION = "What share of knowledge workers are remote?"


def test_both_conflicting_values_present():
    """GATE (Phase 5): the final report contains BOTH figures — 42% and
    31% — not one, not a blend."""
    pytest.fail("SCAFFOLD-TODO: report contains '42%' and '31%'")


def test_conflict_attributed_with_source_and_date():
    """GATE (Phase 5/D5.6): each figure is attributed (source name) and
    dated (publication date), so temporal progression is distinguishable
    from genuine contradiction."""
    pytest.fail("SCAFFOLD-TODO: both figures carry source + date in the report")


def test_values_not_averaged_or_dropped():
    """GATE (Phase 5): no synthetic middle number (e.g., '36.5%') appears,
    and neither source's figure is missing — the classic wrong answers
    (average it, pick the newer one, drop the outlier) are all absent."""
    pytest.fail("SCAFFOLD-TODO: no averaged value; both originals survive")
