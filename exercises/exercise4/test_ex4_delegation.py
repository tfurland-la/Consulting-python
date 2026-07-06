"""Phase 1 skeletons — decomposition and delegation. YOU write every
assertion. Offline: decompose() runs against a FakeClient scripted with a
plausible coordinator reply — the assertions probe YOUR handling of it.
"""

import pytest

from mocks import FakeClient, make_message, make_text_block  # noqa: F401
import research_pipeline  # noqa: F401 — used by the assertions you will write

BROAD_QUESTION = "How has flexible work reshaped the economy?"


def test_decompose_returns_scoped_subtasks():
    """GATE (Phase 1): decompose() yields subtasks that each name a target
    subagent and carry a self-contained brief (a subagent sees nothing
    else)."""
    pytest.fail("SCAFFOLD-TODO: each subtask names its subagent + a self-contained brief")


def test_no_over_decomposition():
    """GATE (Phase 1): the deliberately broad question does NOT collapse
    into subtasks covering a single narrow slice (the 'creative industries
    → three visual-arts subtasks' failure). Assert coverage breadth in
    whatever terms your subtask shape supports."""
    pytest.fail("SCAFFOLD-TODO: subtasks span multiple facets of the broad topic")


def test_subagents_use_distinct_system_prompts():
    """GATE (Phase 1): search and doc subagents run under different, role-
    scoped system prompts — inspect the FakeClient's recorded requests."""
    pytest.fail("SCAFFOLD-TODO: recorded requests show SEARCH vs DOC system prompts")


def test_subagent_tools_are_scoped():
    """GATE (Phase 1/D2.3): the search subagent's request never carries the
    doc agent's tools and vice versa — least privilege by construction."""
    pytest.fail("SCAFFOLD-TODO: per-subagent tool lists are disjoint and role-scoped")
