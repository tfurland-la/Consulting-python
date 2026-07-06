"""Exercise 4 — YOUR module. Coordinator, two subagents, synthesis.

Architecture constraint, enforced by construction: each subagent is its own
messages.create call with its own system prompt and scoped tools. NO shared
state — everything a subagent knows arrives in its prompt. That constraint
IS the D1.3 lesson.

The scaffolding gives you mock_tools (keyword search + timeout injection)
and mocks.py (offline SDK fakes). Decomposition strategy, context passing,
parallelism, error recovery, and conflict-preserving synthesis are yours.
See README.md for phase gates.
"""

# ── System prompts: goals and coverage criteria, not step-by-step scripts.
# Phase 1's gate probes for the narrow-decomposition failure mode — the
# coordinator prompt is where you prevent it.
COORDINATOR_SYSTEM = ""  # YOU WRITE THIS — see README phase 1
SEARCH_AGENT_SYSTEM = ""  # YOU WRITE THIS — see README phase 1
DOC_AGENT_SYSTEM = ""  # YOU WRITE THIS — see README phase 1


def decompose(question, client=None):
    """Phase 1 — coordinator turns a research question into subtasks. Log
    the decomposition BEFORE executing anything. Returns a list of subtask
    dicts (your shape — but each must say which subagent it targets)."""
    raise NotImplementedError("YOU WRITE THIS — see README phase 1")


def run_search_subagent(subtask, client=None):
    """Phase 2 — its own messages.create call, SEARCH_AGENT_SYSTEM, and only
    the search tools. Returns structured findings; the spec fixes the
    finding shape: claim, source_name, url, publication_date, excerpt.
    On repeated timeout (phase 4): one local retry, then a structured error
    context — failure type, attempted query, partial results, alternatives."""
    raise NotImplementedError("YOU WRITE THIS — see README phases 2 and 4")


def run_doc_subagent(subtask, client=None):
    """Phase 2 — document-analysis twin of the search subagent: own call,
    own system prompt, only get_article. Same finding shape."""
    raise NotImplementedError("YOU WRITE THIS — see README phase 2")


def synthesize(question, findings, client=None):
    """Phases 2/4/5 — receives ONLY what the coordinator passes in. The
    final report preserves attribution (source, date) through synthesis,
    annotates coverage per section (FULL / PARTIAL naming the missing
    source / NOT COVERED), and presents conflicting statistics side by side
    with dates — never averaged, recency-picked, or dropped."""
    raise NotImplementedError("YOU WRITE THIS — see README phases 2, 4, 5")


def run_pipeline(question, client=None, parallel=False):
    """Phases 1-5 — the whole flow: decompose → delegate (concurrently when
    parallel=True: dispatch both subagent calls before awaiting either) →
    synthesize. Returns the final report string."""
    raise NotImplementedError("YOU WRITE THIS — see README phases 1-5")
