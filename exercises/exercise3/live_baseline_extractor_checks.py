from baseline_extractor import extract_engagement_findings

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
