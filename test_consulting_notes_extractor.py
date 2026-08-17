import os

import pytest
from dotenv import load_dotenv

# This test calls the real Anthropic API. Load the same .env the module does,
# then skip at module level when there is still no key. A learner who has cloned
# the repo but not yet added their key should be told exactly that, rather than
# shown an authentication traceback from inside the SDK.
load_dotenv()

if not os.environ.get("ANTHROPIC_API_KEY"):
    pytest.skip(
        "no ANTHROPIC_API_KEY — this test calls the real API. Create a .env "
        "file at the repo root containing ANTHROPIC_API_KEY=sk-... (it is "
        "gitignored); see the README for where to get a key.",
        allow_module_level=True,
    )

from consulting_notes_extractor import extract_engagement_findings  # noqa: E402 — must come after the skip above

SAMPLE_NOTES = """
Meeting with Riverside Health System operations team. Key issues identified:
- Patient discharge process averaging 4 hours, benchmark is 90 minutes
- Three separate EHR systems not integrated, staff manually reconciling records
- Nursing staff turnover at 34% annually, industry average is 22%
- Finance team estimates manual reconciliation costs 2.3M annually
- CEO wants a 90-day improvement roadmap
Priority appears to be EHR integration based on downstream impact on both discharge time and staff burden.
"""


def test_extract_returns_dict():
    result = extract_engagement_findings(SAMPLE_NOTES)
    assert isinstance(result, dict)


def test_extract_has_required_keys():
    result = extract_engagement_findings(SAMPLE_NOTES)
    assert "client" in result
    assert "top_priority" in result
    assert "actions" in result
    assert "problems" in result
    assert "kpis" in result


def test_actions_is_list():
    result = extract_engagement_findings(SAMPLE_NOTES)
    assert isinstance(result["actions"], list)
    assert len(result["actions"]) > 0


def test_problems_is_list():
    result = extract_engagement_findings(SAMPLE_NOTES)
    assert isinstance(result["problems"], list)
    assert len(result["problems"]) > 0


def test_kpis_have_current_and_target():
    result = extract_engagement_findings(SAMPLE_NOTES)
    assert isinstance(result["kpis"], list)
    assert len(result["kpis"]) > 0
    for kpi in result["kpis"]:
        assert "current" in kpi
        assert "target" in kpi


def test_client_is_string():
    result = extract_engagement_findings(SAMPLE_NOTES)
    assert isinstance(result["client"], str)
    assert len(result["client"]) > 0
