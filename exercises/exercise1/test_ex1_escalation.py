"""Phase 5 skeletons — multi-concern decomposition and the handoff. YOU
write every assertion.

The scripted conversation below simulates a three-concern request where one
concern fails mid-flight; your loop produces the history, and your
build_escalation_handoff() digests it.
"""

import pytest

from mocks import FakeClient, make_message, make_text_block, make_tool_use_block
import support_agent  # noqa: F401 — used by the assertions you will write


def _three_concern_script():
    """A plausible scripted trace: refund + address update + complaint,
    with the refund path going through and the complaint escalating."""
    return FakeClient(scripted=[
        make_message("tool_use", [
            make_text_block("I'll handle each of these."),
            make_tool_use_block("get_customer", {"customer_id": "CUST-1001"}, "tu_1"),
        ]),
        make_message("tool_use", [
            make_tool_use_block("lookup_order", {"order_id": "ORD-1002"}, "tu_2"),
            make_tool_use_block("process_refund", {"order_id": "ORD-1002", "amount": 180.00, "reason": "damaged"}, "tu_3"),
        ]),
        make_message("tool_use", [
            make_tool_use_block("escalate_to_human", {"customer_id": "CUST-1001", "summary": "repeat delivery complaints"}, "tu_4"),
        ]),
        make_message("end_turn", [make_text_block("Refund processed; complaint escalated; note: address updates need the account portal.")]),
    ])


def test_multi_concern_yields_multiple_tool_calls():
    """GATE (Phase 5): one multi-concern message produces tool calls for
    each concern (not just the first one)."""
    fake = _three_concern_script()
    pytest.fail("SCAFFOLD-TODO: history shows >=3 distinct tool calls across the concerns")


def test_handoff_is_structured():
    """GATE (Phase 5): build_escalation_handoff(history) returns a dict a
    human can act on WITHOUT the transcript. Design the fields; assert the
    ones your design promises."""
    fake = _three_concern_script()
    pytest.fail("SCAFFOLD-TODO: handoff carries identity, cause, and recommendation fields")


def test_handoff_includes_attempted_actions():
    """GATE (Phase 5): the handoff records what was already attempted (and
    amounts involved) so the human doesn't redo or contradict it."""
    fake = _three_concern_script()
    pytest.fail("SCAFFOLD-TODO: handoff lists the processed refund and its amount")
