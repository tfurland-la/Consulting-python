"""Scaffold-integrity tests — Claude-owned, and they should stay GREEN.

If these fail, the scaffolding is broken (not your work). Everything the
learner writes is tested in the other test_ex1_*.py files.
"""

import pytest

import mock_backend
from mocks import FakeClient, make_message, make_text_block, make_tool_use_block


def test_every_order_belongs_to_its_customer():
    for order in mock_backend.ORDERS.values():
        customer = mock_backend.CUSTOMERS[order["customer_id"]]
        assert order["order_id"] in customer["order_ids"]


def test_every_customer_order_id_exists():
    for customer in mock_backend.CUSTOMERS.values():
        for order_id in customer["order_ids"]:
            assert order_id in mock_backend.ORDERS


def test_fixture_contains_the_special_cases():
    # An eligible refund over $500 (the enforcement-hook case) …
    assert any(
        o["total"] > 500 and o["refund_eligible"] for o in mock_backend.ORDERS.values()
    )
    # … and a customer with zero orders (the empty-result-is-success case).
    assert any(not c["order_ids"] for c in mock_backend.CUSTOMERS.values())


def test_failure_switch_raises_each_type_once_then_clears():
    cases = {
        "transient": mock_backend.TransientBackendError,
        "validation": mock_backend.ValidationBackendError,
        "business": mock_backend.BusinessRuleError,
        "permission": mock_backend.PermissionDeniedError,
    }
    for mode, exc_type in cases.items():
        mock_backend.set_failure_mode(mode)
        with pytest.raises(exc_type):
            mock_backend.get_customer("CUST-1001")
        # One-shot: the next call succeeds.
        assert mock_backend.get_customer("CUST-1001") is not None


def test_backend_refunds_any_amount_by_design():
    """The $500 limit must live in the learner's hook, nowhere else."""
    result = mock_backend.process_refund("ORD-1003", 742.00, "defective")
    assert result["status"] == "processed"
    assert result["amount"] == 742.00


def test_fake_client_replays_in_order_and_records_requests():
    first = make_message("tool_use", [make_tool_use_block("get_customer", {"customer_id": "CUST-1001"}, "tu_1")])
    second = make_message("end_turn", [make_text_block("done")])
    fake = FakeClient(scripted=[first, second])
    assert fake.messages.create(model="m", messages=[]) is first
    assert fake.messages.create(model="m", messages=[]) is second
    assert len(fake.requests) == 2
    with pytest.raises(IndexError):
        fake.messages.create(model="m", messages=[])
