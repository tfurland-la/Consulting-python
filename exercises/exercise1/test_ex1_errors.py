"""Phase 3 skeletons — structured error responses. YOU write every assertion.

These test execute_tool() directly (no loop, no API): arm a backend failure
switch, call the tool, inspect the structured payload you return.
"""

import pytest

import mock_backend
import support_agent  # noqa: F401 — used by the assertions you will write


def test_transient_error_is_retryable():
    """GATE (Phase 3): a transient backend failure comes back as a structured
    error with errorCategory 'transient' and isRetryable True."""
    mock_backend.set_failure_mode("transient")
    pytest.fail("SCAFFOLD-TODO: execute_tool('get_customer', ...) -> isError, transient, retryable")


def test_validation_error_not_retryable():
    """GATE (Phase 3): a validation failure is structured, categorized
    'validation', and NOT retryable — retrying malformed input wastes calls;
    the agent should correct the input instead."""
    mock_backend.set_failure_mode("validation")
    pytest.fail("SCAFFOLD-TODO: categorized validation, isRetryable False")


def test_business_error_category():
    """GATE (Phase 3): a business-rule refusal is categorized 'business',
    not retryable, and carries a human-readable description the agent can
    relay to the customer."""
    mock_backend.set_failure_mode("business")
    pytest.fail("SCAFFOLD-TODO: categorized business; description present")


def test_permission_error_category():
    """GATE (Phase 3): a permission failure is categorized 'permission' and
    not retryable — the recovery path is escalation, not retry."""
    mock_backend.set_failure_mode("permission")
    pytest.fail("SCAFFOLD-TODO: categorized permission, isRetryable False")


def test_error_result_sets_is_error():
    """GATE (Phase 3): every failure payload marks isError truthy, so the
    model can distinguish failure from data."""
    mock_backend.set_failure_mode("transient")
    pytest.fail("SCAFFOLD-TODO: isError is set on the returned payload")


def test_empty_result_is_success_not_error():
    """GATE (Phase 3): CUST-1006 exists and has zero orders. Looking up a
    real customer with no orders is a SUCCESSFUL query with empty data —
    if your executor reports it as an error, the agent will retry or
    escalate a non-problem."""
    pytest.fail("SCAFFOLD-TODO: get_customer('CUST-1006') -> success payload, no isError")
