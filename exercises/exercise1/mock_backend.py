"""Mock in-memory backend for Exercise 1 — Claude-owned scaffolding.

Six customers, ten orders, and typed failure switches. This module raises
typed exceptions and returns raw dicts; it contains NO error categorization
and NO policy enforcement. Wrapping failures into structured tool_result
payloads is the learner's job (support_agent.execute_tool), and the $500
refund limit belongs ONLY in the learner's enforcement hook — the backend
happily refunds any amount, by design.
"""


class TransientBackendError(Exception):
    """Simulates a timeout / temporarily unavailable backend."""


class ValidationBackendError(Exception):
    """Simulates rejection of malformed input (bad ID format)."""


class BusinessRuleError(Exception):
    """Simulates a policy refusal (e.g., refund window expired)."""


class PermissionDeniedError(Exception):
    """Simulates an authorization failure for the calling principal."""


CUSTOMERS = {
    "CUST-1001": {
        "customer_id": "CUST-1001",
        "name": "Sarah Chen",
        "email": "sarah.chen@example.com",
        "tier": "standard",
        "order_ids": ["ORD-1001", "ORD-1002"],
    },
    "CUST-1002": {
        "customer_id": "CUST-1002",
        "name": "Marcus Webb",
        "email": "marcus.webb@example.com",
        "tier": "premium",
        "order_ids": ["ORD-1003", "ORD-1004", "ORD-1005"],
    },
    "CUST-1003": {
        "customer_id": "CUST-1003",
        "name": "Priya Natarajan",
        "email": "priya.n@example.com",
        "tier": "standard",
        "order_ids": ["ORD-1006"],
    },
    "CUST-1004": {
        "customer_id": "CUST-1004",
        "name": "Diego Alvarez",
        "email": "d.alvarez@example.com",
        "tier": "premium",
        "order_ids": ["ORD-1007", "ORD-1008"],
    },
    "CUST-1005": {
        "customer_id": "CUST-1005",
        "name": "Amara Okafor",
        "email": "amara.okafor@example.com",
        "tier": "standard",
        "order_ids": ["ORD-1009", "ORD-1010"],
    },
    # Deliberately order-less: the "empty result is success, not error" case.
    "CUST-1006": {
        "customer_id": "CUST-1006",
        "name": "Tomas Lindqvist",
        "email": "t.lindqvist@example.com",
        "tier": "standard",
        "order_ids": [],
    },
}

ORDERS = {
    "ORD-1001": {
        "order_id": "ORD-1001",
        "customer_id": "CUST-1001",
        "items": [
            {"sku": "SKU-88", "description": "Wireless keyboard", "qty": 1, "unit_price": 89.00},
        ],
        "total": 89.00,
        "status": "delivered",
        "order_date": "2026-06-02",
        "refund_eligible": True,
    },
    "ORD-1002": {
        "order_id": "ORD-1002",
        "customer_id": "CUST-1001",
        "items": [
            {"sku": "SKU-12", "description": "Ergonomic chair", "qty": 1, "unit_price": 180.00},
        ],
        "total": 180.00,
        "status": "delivered",
        "order_date": "2026-06-15",
        "refund_eligible": True,
    },
    "ORD-1003": {
        "order_id": "ORD-1003",
        "customer_id": "CUST-1002",
        "items": [
            {"sku": "SKU-43", "description": "Standing desk", "qty": 1, "unit_price": 649.00},
            {"sku": "SKU-77", "description": "Cable tray", "qty": 2, "unit_price": 46.50},
        ],
        "total": 742.00,
        "status": "delivered",
        "order_date": "2026-06-20",
        # Eligible AND over $500 — the enforcement-hook test case.
        "refund_eligible": True,
    },
    "ORD-1004": {
        "order_id": "ORD-1004",
        "customer_id": "CUST-1002",
        "items": [
            {"sku": "SKU-05", "description": "USB-C dock", "qty": 1, "unit_price": 129.00},
        ],
        "total": 129.00,
        "status": "shipped",
        "order_date": "2026-06-28",
        "refund_eligible": False,
    },
    "ORD-1005": {
        "order_id": "ORD-1005",
        "customer_id": "CUST-1002",
        "items": [
            {"sku": "SKU-91", "description": "Monitor arm", "qty": 1, "unit_price": 75.00},
        ],
        "total": 75.00,
        "status": "refunded",
        "order_date": "2026-05-11",
        "refund_eligible": False,
    },
    "ORD-1006": {
        "order_id": "ORD-1006",
        "customer_id": "CUST-1003",
        "items": [
            {"sku": "SKU-33", "description": "Noise-cancelling headset", "qty": 1, "unit_price": 249.00},
        ],
        "total": 249.00,
        "status": "delivered",
        "order_date": "2026-06-25",
        "refund_eligible": True,
    },
    "ORD-1007": {
        "order_id": "ORD-1007",
        "customer_id": "CUST-1004",
        "items": [
            {"sku": "SKU-58", "description": "Webcam", "qty": 1, "unit_price": 119.00},
        ],
        "total": 119.00,
        "status": "processing",
        "order_date": "2026-07-01",
        "refund_eligible": False,
    },
    "ORD-1008": {
        "order_id": "ORD-1008",
        "customer_id": "CUST-1004",
        "items": [
            {"sku": "SKU-21", "description": "Laptop stand", "qty": 2, "unit_price": 54.00},
        ],
        "total": 108.00,
        "status": "delivered",
        "order_date": "2026-06-10",
        "refund_eligible": True,
    },
    "ORD-1009": {
        "order_id": "ORD-1009",
        "customer_id": "CUST-1005",
        "items": [
            {"sku": "SKU-14", "description": "Desk lamp", "qty": 1, "unit_price": 42.00},
        ],
        "total": 42.00,
        "status": "delivered",
        "order_date": "2026-06-18",
        "refund_eligible": True,
    },
    "ORD-1010": {
        "order_id": "ORD-1010",
        "customer_id": "CUST-1005",
        "items": [
            {"sku": "SKU-67", "description": "Whiteboard", "qty": 1, "unit_price": 96.00},
        ],
        "total": 96.00,
        "status": "delivered",
        "order_date": "2026-07-02",
        "refund_eligible": True,
    },
}

# Escalations land here so tests and harnesses can inspect them.
ESCALATIONS = []

# One failure switch, four modes. set_failure_mode("transient") makes the
# NEXT backend call raise TransientBackendError, then the switch clears —
# so "retry once succeeds" is directly testable.
_FAILURE_MODE = {"mode": None}

_FAILURES = {
    "transient": TransientBackendError("backend timeout — request may be retried"),
    "validation": ValidationBackendError("malformed identifier"),
    "business": BusinessRuleError("refund window expired for this order"),
    "permission": PermissionDeniedError("caller is not authorized for this operation"),
}


def set_failure_mode(mode):
    """Arm a one-shot failure: the next backend call raises, then clears.

    mode: 'transient' | 'validation' | 'business' | 'permission' | None
    """
    if mode is not None and mode not in _FAILURES:
        raise ValueError(f"unknown failure mode: {mode!r}")
    _FAILURE_MODE["mode"] = mode


def _maybe_fail():
    mode = _FAILURE_MODE["mode"]
    if mode is not None:
        _FAILURE_MODE["mode"] = None
        raise _FAILURES[mode]


def get_customer(customer_id):
    """Return the customer record, or None if no such customer."""
    _maybe_fail()
    return CUSTOMERS.get(customer_id)


def lookup_order(order_id):
    """Return the order record, or None if no such order."""
    _maybe_fail()
    return ORDERS.get(order_id)


def process_refund(order_id, amount, reason):
    """Refund any amount against an eligible order. NO limit checks here —
    policy enforcement is the learner's hook, not the backend's."""
    _maybe_fail()
    order = ORDERS.get(order_id)
    if order is None:
        raise ValidationBackendError(f"no such order: {order_id}")
    if not order["refund_eligible"]:
        raise BusinessRuleError(f"order {order_id} is not refund-eligible")
    return {
        "refund_id": f"REF-{order_id[-4:]}",
        "order_id": order_id,
        "amount": amount,
        "reason": reason,
        "status": "processed",
    }


def escalate_to_human(customer_id, summary):
    """Record an escalation; returns a ticket stub."""
    _maybe_fail()
    ticket = {"ticket_id": f"TICK-{len(ESCALATIONS) + 1:04d}", "customer_id": customer_id, "summary": summary}
    ESCALATIONS.append(ticket)
    return ticket
