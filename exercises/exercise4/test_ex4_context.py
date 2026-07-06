"""Phase 2 skeletons — structured findings and explicit context passing.
YOU write every assertion.

Companion manual gate (not a test): grep your own code and confirm there is
no path by which synthesize() can see search results except through the
prompt the coordinator built.
"""

import pytest

from mocks import FakeClient, make_message, make_text_block  # noqa: F401
import research_pipeline  # noqa: F401 — used by the assertions you will write


def test_findings_carry_required_fields():
    """GATE (Phase 2): every finding a subagent returns has exactly the
    spec'd shape: claim, source_name, url, publication_date, excerpt."""
    pytest.fail("SCAFFOLD-TODO: finding dicts carry all five fields, non-empty")


def test_synthesis_prompt_contains_findings_verbatim():
    """GATE (Phase 2): the synthesis call's prompt (inspect the FakeClient
    request) contains the findings the coordinator passed — attribution
    included — and nothing else smuggled from module state."""
    pytest.fail("SCAFFOLD-TODO: synthesis request embeds the findings, with sources")


def test_no_shared_mutable_state():
    """GATE (Phase 2): running two pipelines back to back leaks nothing
    between them — second run's synthesis prompt contains no first-run
    findings. (The docstring gate above is the grep; this is the runtime
    version.)"""
    pytest.fail("SCAFFOLD-TODO: run twice; second synthesis prompt is clean of run one")
