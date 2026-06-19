# CCA-F Adaptive Practice Exam — Build Prompt

Paste this entire document into a new conversation with Claude (Claude.ai, where
artifacts run). It instructs Claude to build the adaptive practice exam as a
React artifact in four phases. Run the phases in order — confirm each works
before saying "continue" to move to the next.

The companion specification (`practice_exam_spec.md`) has the full rationale.
This prompt embeds everything needed to build without it, but keep the spec handy
if you want to understand a design decision or change the seed.

---

## START OF PROMPT — paste everything below into Claude

I want you to build an adaptive practice exam tool for the Claude Certified
Architect – Foundations (CCA-F) exam, as a single React artifact. We will build
it in four phases. Build only the phase I ask for, then stop and let me confirm
it works before continuing. Do not jump ahead.

Key environment facts you must honor throughout:
- This runs as a React artifact. Use React state for in-session data.
- For cross-session persistence, use the artifact persistent storage API
  (`window.storage` with get/set/delete/list). NEVER use localStorage or
  sessionStorage — they are not supported and will fail.
- For question generation, call the Anthropic API from within the artifact:
  `fetch("https://api.anthropic.com/v1/messages", ...)` with model
  `claude-sonnet-4-6` and `max_tokens` set to 1000. Do NOT include an API key —
  the artifact environment handles authentication.
- Do not use HTML `<form>` tags; use onClick/onChange handlers.
- Wrap all storage and API calls in try/catch.

### The exam structure (reference data for the whole build)

Five domains with weightings: D1 Agentic Architecture & Orchestration (27%),
D2 Tool Design & MCP Integration (18%), D3 Claude Code Configuration & Workflows
(20%), D4 Prompt Engineering & Structured Output (20%), D5 Context Management &
Reliability (15%).

Task statements (the tracking grain):
- D1.1 Design and implement agentic loops for autonomous task execution
- D1.2 Orchestrate multi-agent systems with coordinator-subagent patterns
- D1.3 Configure subagent invocation, context passing, and spawning
- D1.4 Implement multi-step workflows with enforcement and handoff patterns
- D1.5 Apply Agent SDK hooks for tool call interception and data normalization
- D1.6 Design task decomposition strategies for complex workflows
- D1.7 Manage session state, resumption, and forking
- D2.1 Design effective tool interfaces with clear descriptions and boundaries
- D2.2 Implement structured error responses for MCP tools
- D2.3 Distribute tools appropriately across agents and configure tool choice
- D2.4 Integrate MCP servers into Claude Code and agent workflows
- D2.5 Select and apply built-in tools (Read, Write, Edit, Bash, Grep, Glob)
- D3.1 Configure CLAUDE.md files with hierarchy, scoping, and modular organization
- D3.2 Create and configure custom slash commands and skills
- D3.3 Apply path-specific rules for conditional convention loading
- D3.4 Determine when to use plan mode vs direct execution
- D3.5 Apply iterative refinement techniques for progressive improvement
- D3.6 Integrate Claude Code into CI/CD pipelines
- D4.1 Design prompts with explicit criteria to reduce false positives
- D4.2 Apply few-shot prompting to improve output consistency and quality
- D4.3 Enforce structured output using tool use and JSON schemas
- D4.4 Implement validation, retry, and feedback loops for extraction quality
- D4.5 Design efficient batch processing strategies
- D4.6 Design multi-instance and multi-pass review architectures
- D5.1 Manage conversation context to preserve critical information
- D5.2 Design effective escalation and ambiguity resolution patterns
- D5.3 Implement error propagation strategies across multi-agent systems
- D5.4 Manage context effectively in large codebase exploration
- D5.5 Design human review workflows and confidence calibration
- D5.6 Preserve information provenance and handle uncertainty in multi-source synthesis

---

## PHASE 1 — Core quiz engine with a small static question set

Build the foundational UI and quiz loop using a handful of hardcoded questions.
No API, no persistence yet. Goal: a working question/answer/explanation loop I
can click through.

Requirements:
- A seed configuration object at the very TOP of the file, clearly commented,
  mapping each task statement to a starting weight. Use these defaults:
  - Weight 3.0: D4.3, D1.1, D1.2, D1.3, D1.5, D2.2, D2.4, D3.1, D4.5, D5.1, D5.2
  - Weight 2.0: D2.3, D1.4
  - Weight 1.0: every other task statement
  Comment this object so a future user can clear it to all-1.0 (blank slate) or
  edit it to their own weak areas without touching the rest of the code.
- Embed these official sample questions as the Phase 1 static set (also reused
  as few-shot examples in Phase 3). Render them through the same UI the
  generated questions will use, so the data shape is settled now:

  Question 1 (D1.4): Scenario — A customer support agent built on the Claude
  Agent SDK has MCP tools get_customer, lookup_order, process_refund,
  escalate_to_human. Production data shows that in 12% of cases the agent skips
  get_customer and calls lookup_order using only the customer's stated name,
  sometimes causing misidentified accounts and incorrect refunds.
  Question — What change would most effectively address this reliability issue?
  A) Add a programmatic prerequisite that blocks lookup_order and process_refund
  until get_customer has returned a verified customer ID.
  B) Enhance the system prompt to state that customer verification via
  get_customer is mandatory before any order operations.
  C) Add few-shot examples showing the agent always calling get_customer first.
  D) Implement a routing classifier that enables only the subset of tools
  appropriate for each request type.
  Correct: A.
  Explanations — A: when a specific tool sequence is required for critical
  business logic, programmatic enforcement gives deterministic guarantees that
  prompt-based approaches cannot. B and C rely on probabilistic LLM compliance,
  insufficient when errors have financial consequences. D addresses tool
  availability, not tool ordering, which is the actual problem.

  Question 2 (D2.1): Scenario — Production logs show the agent frequently calls
  get_customer when users ask about orders (e.g., "check my order #12345")
  instead of lookup_order. Both tools have minimal descriptions ("Retrieves
  customer information" / "Retrieves order details") and accept similar
  identifier formats.
  Question — What is the most effective first step to improve tool selection
  reliability?
  A) Add 5-8 few-shot examples to the system prompt showing order queries
  routing to lookup_order.
  B) Expand each tool's description to include input formats, example queries,
  edge cases, and boundaries explaining when to use it versus similar tools.
  C) Implement a routing layer that parses input and pre-selects the tool.
  D) Consolidate both tools into a single lookup_entity tool.
  Correct: B.
  Explanations — B: tool descriptions are the primary mechanism for tool
  selection; minimal descriptions are the root cause, and this is the
  low-effort high-leverage fix. A adds token overhead without fixing the root
  cause. C is over-engineered and bypasses the model's language understanding.
  D is a valid architecture but heavier than a "first step" warrants.

  Question 3 (D5.2): Scenario — An agent achieves 55% first-contact resolution
  against an 80% target. Logs show it escalates straightforward cases (standard
  damage replacements with photo evidence) while attempting to autonomously
  handle complex situations requiring policy exceptions.
  Question — What is the most effective way to improve escalation calibration?
  A) Add explicit escalation criteria to the system prompt with few-shot
  examples demonstrating when to escalate versus resolve.
  B) Have the agent self-report a 1-10 confidence score and route to humans
  below a threshold.
  C) Deploy a separate classifier trained on historical tickets.
  D) Add sentiment analysis and escalate on negative sentiment.
  Correct: A.
  Explanations — A: addresses the root cause, unclear decision boundaries, and
  is the proportionate first step. B fails because LLM self-reported confidence
  is poorly calibrated — the agent is already confidently wrong on hard cases.
  C is over-engineered before prompt optimization is tried. D solves a different
  problem; sentiment doesn't correlate with case complexity.

- UI: show one question at a time — scenario, stem, four options as clickable
  choices. The user selects one and submits. On submit, reveal correct/incorrect,
  highlight the correct option, and show all four explanations. A "Next question"
  button advances; for Phase 1 just cycle through the three static questions.
- Use a clean, readable layout. Tailwind core utility classes only. Make the
  scenario text comfortably readable (this is a study tool used for long sessions).

Build Phase 1 only. Then stop and tell me how to test it.

---

## PHASE 2 — Persistence and the progress dashboard

Add cross-session persistence with `window.storage` and a progress dashboard.
Still using the static questions from Phase 1.

Requirements:
- On load, read stored state from `window.storage`. If none exists, initialize
  from the seed weights. Keys: `ccaf:weights`, `ccaf:stats`, `ccaf:history`.
  Wrap all reads in try/catch; if storage is unavailable, run in-memory for the
  session and show a small notice.
- After each answered question, update and persist:
  - The answered task statement's weight: correct → multiply by 0.7 (floor 0.5);
    incorrect → multiply by 1.5 (cap 5.0).
  - Per-task-statement counts (seen, correct).
  - Total answered, total correct.
  - Append to a rolling history (keep last 50): {taskStatement, correct,
    timestamp}.
- A dashboard panel showing: overall accuracy, accuracy by domain (rolled up
  from task statements), and the five task statements currently weighted highest
  (the current weak spots), each with its label and weight.
- A reset control with a confirmation step that clears storage and restores seed
  weights.
- Show loading state while reading storage; display data progressively.

Build Phase 2 only. Then stop and tell me how to test it, including how to
confirm persistence survives a reload.

---

## PHASE 3 — Dynamic question generation via the Anthropic API

Replace the static question set with on-demand generation. Keep the three static
questions only as few-shot examples in the generation prompt.

Requirements:
- Weighted random selection of the next task statement: effective weight =
  task_statement_weight × domain_weight_factor, where the domain factor reflects
  the exam weighting (D1 1.8, D2 1.2, D3 1.33, D4 1.33, D5 1.0 — these are the
  domain percentages normalized to the smallest; you may recompute, the point is
  D1 heaviest, D5 lightest). Select one task statement by weighted random draw.
- Call the Anthropic API (model `claude-sonnet-4-6`, `max_tokens` 1000, no API
  key) to generate one scenario-based MCQ for the selected task statement. The
  generation prompt must:
  - State the exact task statement and domain.
  - Require a realistic production scenario (1-2 short paragraphs) in the style
    of the exam's use cases: customer support agents, multi-agent research
    pipelines, Claude Code in CI/CD, developer productivity tools, structured
    data extraction.
  - Require exactly one correct answer and three plausible distractors that
    represent mistakes a partially-knowledgeable candidate would make.
  - Require an explanation for why the correct answer is right and why each
    distractor is wrong.
  - Include the three Phase 1 sample questions as few-shot examples of the
    desired style and difficulty.
  - Require STRICT JSON output only — no preamble, no markdown fences — in this
    exact shape:
    {"taskStatement","domain","scenario","question",
     "options":{"A","B","C","D"},"correct","explanations":{"A","B","C","D"}}
- Parse the response: strip any accidental markdown fences before JSON.parse.
  If parsing fails, retry once with the parse error appended to the prompt; if it
  still fails, show a friendly error and a "try again" button.
- Pre-generate the NEXT question in the background while the user reads the
  current explanation, so advancing is instant. Show a subtle generating
  indicator if the next question isn't ready yet.
- Everything from Phases 1-2 (UI, persistence, dashboard, weight updates) keeps
  working with generated questions.

Build Phase 3 only. Then stop and tell me how to test it, including how to
confirm generated questions vary and target weighted task statements.

---

## PHASE 4 — Polish and reuse affordances

Final pass for study usability and for colleagues who will fork this.

Requirements:
- Confirm the seed configuration object at the top of the file is clearly
  commented with the three documented uses: (1) build as-is with these defaults,
  (2) set all weights to 1.0 for a blank slate, (3) edit to a colleague's own
  weak areas. A non-coder should be able to make these changes by editing only
  that object.
- A brief "how this works" panel in the UI explaining the adaptive behaviour:
  questions are generated and weighted toward task statements you miss, progress
  persists across sessions, and the dashboard shows current weak spots.
- Visual polish: clear correct/incorrect states (green/red), readable typography
  for long study sessions, a clean dashboard, responsive layout.
- Graceful empty/error states: first-run with no history, storage unavailable,
  generation failure.
- A session counter showing how many questions answered this session vs all time.

Build Phase 4. Then give me a short summary of how to use the tool day to day
and how a colleague would fork and reseed it.

## END OF PROMPT

---

## Notes for the person running this (not part of the prompt)

- Run the phases in order. After each phase, actually click through the tool in
  the artifact preview before continuing. Bugs are far easier to localize when
  you confirm phase by phase.
- Phase 3 is where API behaviour enters. If generated questions feel off in style
  or difficulty, that is a prompt-quality issue in the generation prompt — ask
  Claude to add more few-shot examples or tighten the instructions. This is the
  same few-shot technique the exam tests in D4.2.
- The seed weights are the author's known weak areas as of build time. As you
  practice, the adaptive logic takes over from the seed — so the seed matters
  most in the first couple of dozen questions, then your actual performance
  drives the weighting.
- If you want a timed, full-length 60-question simulation later, that is a clean
  follow-on: add a mode that draws 60 questions matching the exam's domain
  distribution, hides explanations until the end, and runs a 120-minute timer.
