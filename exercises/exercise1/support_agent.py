"""Exercise 1 — YOUR module. Every stub below is exam-tested material.

The scaffolding gives you a mock backend (mock_backend.py) and offline SDK
fakes (mocks.py). What connects them — schemas, prompt, loop, error
wrapping, enforcement, handoff — is yours. See README.md for the phase
gates; each stub names its phase.
"""

# ── Phase 1: tool schemas and the description discipline ──────────────────
# Define all four tools (get_customer, lookup_order, process_refund,
# escalate_to_human) in Anthropic tools= format. get_customer and
# lookup_order deliberately accept similar identifier formats — your
# descriptions must carry the disambiguation: what it does, expected inputs,
# what it returns, and when to use it versus the similar tool.
TOOLS = []  # YOU WRITE THIS — see README phase 1

# Keep workflow-ordering *guidance* here if you like, but remember phase 4's
# gate: the $500 refund limit must NOT be expressed in this prompt.
SYSTEM_PROMPT = ""  # YOU WRITE THIS — see README phase 1


class MaxIterationsExceeded(RuntimeError):
    """Raised (never silently swallowed) when the loop hits its ceiling."""


def enforcement_hook(name, tool_input):
    """Phase 4 — intercept BEFORE execution. Return None to allow the call,
    or a dict (your redirect payload) to block it and steer the agent
    toward escalate_to_human. The $500 refund limit lives here and ONLY
    here — programmatic enforcement vs. probabilistic compliance.
    """
    raise NotImplementedError("YOU WRITE THIS — see README phase 4")


def execute_tool(name, tool_input):
    """Phases 2–3 — dispatch to mock_backend and wrap the outcome as a
    tool_result payload. Catch each typed backend exception and return
    structured error content: isError, errorCategory, isRetryable, and a
    human-readable description. An empty lookup is a SUCCESS with empty
    data, not an error.
    """
    raise NotImplementedError("YOU WRITE THIS — see README phases 2-3")


def run_agent(user_message, client=None, max_iterations=10):
    """Phase 2 — the agentic loop. call → append full response.content →
    check stop_reason → execute tools → append tool_result blocks (matching
    tool_use_id) as a user turn → repeat. Terminate only on end_turn;
    exceeding max_iterations raises MaxIterationsExceeded.

    Returns the full message history (list of {role, content} dicts) so
    tests and harnesses can inspect the trace.
    """
    raise NotImplementedError("YOU WRITE THIS — see README phase 2")


def build_escalation_handoff(history):
    """Phase 5 — from a conversation history, build the structured handoff
    for a human agent. Gate: a human with NO transcript access can act on
    it alone. What fields that requires is your design decision.
    """
    raise NotImplementedError("YOU WRITE THIS — see README phase 5")
