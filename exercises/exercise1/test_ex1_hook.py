"""Phase 4 skeletons — the enforcement hook. YOU write every assertion.

The exam's single most-tested principle made physical: programmatic
enforcement vs. probabilistic compliance. The backend refunds any amount;
the ONLY thing standing between the agent and a $742 refund is your hook.
"""

import pytest
import support_agent  # noqa: F401 — used by the assertions you will write



def test_hook_blocks_refund_over_500():
    """GATE (Phase 4): enforcement_hook('process_refund', {... amount>500 ...})
    returns a blocking payload (not None)."""
    pytest.fail("SCAFFOLD-TODO: hook returns a block/redirect for amount=742.00")


def test_hook_allows_refund_under_500():
    """GATE (Phase 4): amounts under the limit pass through — hook returns
    None and the call proceeds."""
    pytest.fail("SCAFFOLD-TODO: hook returns None for amount=180.00")


def test_hook_injects_escalation_redirect():
    """GATE (Phase 4): the blocking payload steers the agent to
    escalate_to_human — it tells the model what to do instead, not just 'no'."""
    pytest.fail("SCAFFOLD-TODO: block payload references escalation")


def test_limit_not_in_system_prompt():
    """GATE (Phase 4, adversarial): the $500 limit exists ONLY in code.
    If '500' appears in SYSTEM_PROMPT, the adversarial gate is invalid —
    you'd be testing prompt compliance, not enforcement."""
    pytest.fail("SCAFFOLD-TODO: assert '500' not in support_agent.SYSTEM_PROMPT")
