"""Phase 2 skeletons — the agentic loop. YOU write every assertion.

Setup plumbing (scripted FakeClients) is provided; each test ends in
pytest.fail("SCAFFOLD-TODO: ...") until you replace it. Run with:
    .venv/bin/python -m pytest exercises/exercise1/test_ex1_loop.py -v
"""

import pytest

from mocks import FakeClient, make_message, make_text_block, make_tool_use_block
import support_agent  # noqa: F401 — used by the assertions you will write


def test_loop_terminates_on_end_turn():
    """GATE (Phase 2): a lone end_turn response ends the loop after exactly
    one API call, and the final assistant text is in the returned history."""
    fake = FakeClient(scripted=[
        make_message("end_turn", [make_text_block("Hello! How can I help?")]),
    ])
    pytest.fail("SCAFFOLD-TODO: run_agent(...) returns after one call; history holds the text")


def test_loop_continues_on_tool_use():
    """GATE (Phase 2): a tool_use response triggers tool execution and a
    second API call; the loop ends on the following end_turn."""
    fake = FakeClient(scripted=[
        make_message("tool_use", [
            make_text_block("Let me look that up."),
            make_tool_use_block("get_customer", {"customer_id": "CUST-1001"}, "tu_1"),
        ]),
        make_message("end_turn", [make_text_block("Found Sarah Chen's account.")]),
    ])
    pytest.fail("SCAFFOLD-TODO: two create() calls made; loop returned after end_turn")


def test_tool_result_id_matches_tool_use_id():
    """GATE (Phase 2): the tool_result block sent back carries the exact
    tool_use_id from the tool_use block it answers."""
    fake = FakeClient(scripted=[
        make_message("tool_use", [
            make_tool_use_block("lookup_order", {"order_id": "ORD-1002"}, "tu_ABC123"),
        ]),
        make_message("end_turn", [make_text_block("Order found.")]),
    ])
    pytest.fail("SCAFFOLD-TODO: inspect fake.requests[1] messages; tool_result id == 'tu_ABC123'")


def test_tool_result_sent_as_user_message():
    """GATE (Phase 2): tool results are appended to the conversation as a
    USER-role turn (that's how the model receives them), and the full
    assistant content (text + tool_use blocks) was appended before it."""
    fake = FakeClient(scripted=[
        make_message("tool_use", [
            make_tool_use_block("get_customer", {"customer_id": "CUST-1002"}, "tu_2"),
        ]),
        make_message("end_turn", [make_text_block("Done.")]),
    ])
    pytest.fail("SCAFFOLD-TODO: fake.requests[1] messages end with role='user' tool_result turn")


def test_max_iterations_raises():
    """GATE (Phase 2): a model that keeps returning tool_use past the ceiling
    raises MaxIterationsExceeded — a loud, distinct error, never a silent
    stop with a partial answer."""
    endless = make_message("tool_use", [
        make_tool_use_block("get_customer", {"customer_id": "CUST-1001"}, "tu_loop"),
    ])
    fake = FakeClient(scripted=[endless] * 6)
    pytest.fail("SCAFFOLD-TODO: run_agent(..., max_iterations=3) raises MaxIterationsExceeded")
