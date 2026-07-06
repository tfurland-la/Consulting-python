# Exercise 1 — Multi-Tool Agent with Escalation Logic

**Domains:** D1 (agentic loop, enforcement, hooks), D2 (tool design,
structured errors), D5 (escalation)
**Task statements:** D1.1, D1.4, D1.5, D2.1, D2.2, D5.2
**Estimated effort:** 3–4 sessions

Build the customer support agent from Exam Scenario 1: `get_customer`,
`lookup_order`, `process_refund`, `escalate_to_human`, backed by the mock
in-memory backend in [mock_backend.py](mock_backend.py) — no real services.
Tools are defined via the API `tools=` parameter; a real MCP server is an
optional stretch goal, not required — the exam tests tool *design*, not MCP
server hosting.

**What's scaffolded vs yours:** the backend, SDK fakes, integrity tests, and
live harnesses are written. [support_agent.py](support_agent.py) is all
stubs — schemas, prompt, loop, error wrapping, hook, handoff are yours, and
so is every assertion in `test_ex1_{loop,errors,hook,escalation}.py`.

⚠️ Two deliberate scaffold properties, don't "fix" them:
- The backend refunds **any** amount. The $500 limit belongs only in your
  Phase-4 hook — if the backend enforced it, the adversarial gate would
  prove nothing.
- `get_customer` and `lookup_order` accept similar identifier formats.
  That's the exam's tool-confusion setup; your descriptions carry the load.

---

## Phase 1 — Tool schemas and the description discipline

Define all four tool schemas in `TOOLS`. Write descriptions that answer four
questions: what it does, expected inputs, what it returns, and when to use
it versus the similar tool.

**Gate:** `.venv/bin/python exercises/exercise1/check_p1_routing.py` — five
ambiguous prompts, single calls, `tool_choice: auto`. Correct tool picked
each time. If routing fails, fix descriptions — not the prompt.

## Phase 2 — The agentic loop (TDD)

Write your assertions in [test_ex1_loop.py](test_ex1_loop.py) first (the
scripted fakes are provided), then implement `run_agent`: call → append full
`response.content` → check `stop_reason` → execute tools → append
`tool_result` blocks with matching `tool_use_id` as a user turn → repeat.
Terminate only on `end_turn`; `max_iterations` raises `MaxIterationsExceeded`
— never a silent stop.

**Gate:** loop tests green; then one live run end-to-end ("I'd like a refund
on order ORD-1002") produces a correct multi-tool trace you can narrate
turn by turn.

## Phase 3 — Structured error responses

Assertions in [test_ex1_errors.py](test_ex1_errors.py), then implement
`execute_tool`: catch each typed backend exception and return a structured
`tool_result` — `isError`, `errorCategory`, `isRetryable`, human-readable
description. Arm failures with `mock_backend.set_failure_mode(...)` (one
shot, then clears).

**Gate:** trigger each category in a live conversation and verify the
agent's behavior differentiates: retries the transient once, corrects input
on validation, explains the business rule without retrying, escalates on
permission. And the empty-result case: CUST-1006 has no orders — success
with empty data, not an error.

## Phase 4 — The enforcement hook

Assertions in [test_ex1_hook.py](test_ex1_hook.py), then implement
`enforcement_hook` and call it from your loop before executing
`process_refund`: over $500, block and inject a redirect result steering the
agent to `escalate_to_human`. Pure Python in your executor — the Agent SDK
hook pattern implemented at loop level.

**Gate:** the adversarial test —
`.venv/bin/python exercises/exercise1/check_p4_enforcement.py`. No refund
limit appears in any prompt; the $742 request gets blocked anyway.

## Phase 5 — Multi-concern requests

Assertions in [test_ex1_escalation.py](test_ex1_escalation.py), then
implement `build_escalation_handoff`.

**Gate:** `.venv/bin/python exercises/exercise1/check_p5_handoff.py` — one
message with three concerns, one failing mid-flight; the agent decomposes,
handles each, and the handoff (customer ID, root cause, what was attempted,
amounts, recommended action) stands alone without transcript access.

**Stretch:** wrap the mock backend as an actual MCP server and connect it to
Claude Code via `.mcp.json`.

---

Done? Fill in a copy of [../DEBRIEF_TEMPLATE.md](../DEBRIEF_TEMPLATE.md) and
hand-lower the settled task statements in the adaptive tool's seed.
