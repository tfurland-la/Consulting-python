# CCAR-F Preparation Exercises

The four hands-on exercises recommended by the CCAR-F Exam Guide (v0.2),
expanded into phased, testable builds. Each folder scaffolds one exercise:
fixtures, mocks, stub signatures, and skeleton tests are provided; **the
learner writes everything the exam actually tests**. The friction is the
point.

**Recommended order: 1 → 4 → 3 → 2.** Exercises 1 and 4 cover Domains 1+2
(45% of the exam) with real code. Exercise 3 finishes what the structured
output work already started. Exercise 2 is lighter-touch configuration and
verification (it runs in a separate scratch repo — see its README).

| Exercise | Focus | Task statements | Effort |
|---|---|---|---|
| [exercise1](exercise1/README.md) | Multi-tool agent with escalation logic | D1.1, D1.4, D1.5, D2.1, D2.2, D5.2 | 3–4 sessions |
| [exercise2](exercise2/README.md) | Claude Code team configuration | D3.1, D3.2, D3.3, D3.4, D2.4 | 1–2 sessions |
| [exercise3](exercise3/README.md) | Structured data extraction pipeline | D4.2, D4.4, D4.5, D5.5 | 2–3 sessions |
| [exercise4](exercise4/README.md) | Multi-agent research pipeline | D1.2, D1.3, D1.6, D2.3, D5.3, D5.6 | 3–4 sessions |

---

## The role split (the contract)

You write the core logic; Claude Code scaffolds boilerplate, reviews
completed phases, and debugs. Having Claude Code write the agentic loop or
the enforcement hook defeats the purpose of the exercise.

**Rule of thumb:** Claude Code can write anything you could already write
without thinking (fixtures, mock data, file scaffolding); you write anything
the exam tests.

Concretely, in these scaffolds:

- **Claude-owned (already written, should stay green):** mock backends and
  fixtures, mocked SDK response objects, `test_ex*_fixtures.py` integrity
  tests, live-gate `check_*.py` / `run_*.py` harnesses, these READMEs.
- **Yours (stubbed, waiting):** tool schemas and descriptions, system
  prompts, the agentic loop, error categorization, the enforcement hook,
  few-shot examples, batch mechanics, confidence routing, coordinator
  decomposition, synthesis — and **every test assertion**.

If you catch Claude Code implementing anything in the "yours" column inside
`exercises/`, stop it. That includes "helpful" test assertions.

## Marker conventions

- Stub functions have exactly one body line:
  `raise NotImplementedError("YOU WRITE THIS — see README phase N")`.
- Skeleton tests end with `pytest.fail("SCAFFOLD-TODO: <the gate>")`. The
  docstring states the phase gate; the setup lines (mock plumbing) are
  provided. Replace the `pytest.fail` with your assertions.
- Progress meter: `grep -rc "SCAFFOLD-TODO" exercises/exercise1/` — zero
  means the exercise's offline tests are fully yours.

## Running things

```
# Per-exercise test runs (from the repo root):
.venv/bin/python -m pytest exercises/exercise1 -v

# Live gates (need ANTHROPIC_API_KEY in the repo-root .env):
.venv/bin/python exercises/exercise1/check_p1_routing.py
```

Notes:
- The repo's TDD stop-gate deliberately ignores `exercises/` — your
  in-progress tests are *supposed* to be red mid-phase. Run them per-folder.
- Offline tests (`test_ex*.py`) never call the API; they use the mocked
  response objects in each folder's `mocks.py`. The `check_*.py` /
  `run_*.py` harnesses DO make live calls — each costs cents at most, and
  says so at the top.
- Model strings: harnesses read the model from one constant at the top of
  the file. Verify against current docs before a session; never trust a
  memorized string.

## The debrief loop

After each exercise, fill in a copy of [DEBRIEF_TEMPLATE.md](DEBRIEF_TEMPLATE.md).
The last step is the payoff: hand-lower the `CCARF_SEED` weights in
[../practice-exam/exam.html](../practice-exam/exam.html) for the task
statements the build settled. Building is the fastest way to move a
statement from "recognized" to "reasoned" — make the adaptive tool believe
it.
