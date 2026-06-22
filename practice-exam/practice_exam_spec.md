# CCA-F Adaptive Practice Exam — Specification

This document specifies an adaptive practice exam tool for the Claude Certified
Architect – Foundations (CCA-F) exam. It is the durable reference for what the
tool does and why. The companion build prompt (`practice_exam_build_prompt.md`)
is what you paste into Claude to generate the working tool as a React artifact.

This is a personal study tool. Each person builds their own copy in their own
Claude account, where the Anthropic API and persistent storage work without any
key handling or infrastructure.

---

## What the tool does

The tool presents scenario-based multiple-choice questions in the format of the
real CCA-F exam, tracks performance at the level of individual task statements,
and weights future questions toward the areas where the user is weakest. It
generates questions dynamically using the Anthropic API rather than drawing from
a fixed bank, so there is no question-count ceiling.

After each question, the tool shows whether the answer was correct, explains why
the correct answer is right, and explains why each distractor is wrong. It
remembers performance across sessions so the adaptive weighting persists.

---

## The exam being modeled

The CCA-F exam is 60 scenario-based multiple-choice questions, 120 minutes,
passing score 720 of 1000. Each question has one correct answer and three
distractors. Questions are grounded in production scenarios.

### Domains and weightings

| Domain | Weight |
|--------|--------|
| D1 — Agentic Architecture & Orchestration | 27% |
| D2 — Tool Design & MCP Integration | 18% |
| D3 — Claude Code Configuration & Workflows | 20% |
| D4 — Prompt Engineering & Structured Output | 20% |
| D5 — Context Management & Reliability | 15% |

### Task statements (the tracking grain)

The tool tracks performance at the task-statement level, not just the domain
level. This is what lets it tell the difference between "weak on Domain 1
generally" and "weak specifically on multi-agent orchestration but solid on the
agentic loop." The task statements:

**D1 — Agentic Architecture & Orchestration**
- D1.1 Design and implement agentic loops for autonomous task execution
- D1.2 Orchestrate multi-agent systems with coordinator-subagent patterns
- D1.3 Configure subagent invocation, context passing, and spawning
- D1.4 Implement multi-step workflows with enforcement and handoff patterns
- D1.5 Apply Agent SDK hooks for tool call interception and data normalization
- D1.6 Design task decomposition strategies for complex workflows
- D1.7 Manage session state, resumption, and forking

**D2 — Tool Design & MCP Integration**
- D2.1 Design effective tool interfaces with clear descriptions and boundaries
- D2.2 Implement structured error responses for MCP tools
- D2.3 Distribute tools appropriately across agents and configure tool choice
- D2.4 Integrate MCP servers into Claude Code and agent workflows
- D2.5 Select and apply built-in tools (Read, Write, Edit, Bash, Grep, Glob)

**D3 — Claude Code Configuration & Workflows**
- D3.1 Configure CLAUDE.md files with appropriate hierarchy, scoping, and modular organization
- D3.2 Create and configure custom slash commands and skills
- D3.3 Apply path-specific rules for conditional convention loading
- D3.4 Determine when to use plan mode vs direct execution
- D3.5 Apply iterative refinement techniques for progressive improvement
- D3.6 Integrate Claude Code into CI/CD pipelines

**D4 — Prompt Engineering & Structured Output**
- D4.1 Design prompts with explicit criteria to improve precision and reduce false positives
- D4.2 Apply few-shot prompting to improve output consistency and quality
- D4.3 Enforce structured output using tool use and JSON schemas
- D4.4 Implement validation, retry, and feedback loops for extraction quality
- D4.5 Design efficient batch processing strategies
- D4.6 Design multi-instance and multi-pass review architectures

**D5 — Context Management & Reliability**
- D5.1 Manage conversation context to preserve critical information across long interactions
- D5.2 Design effective escalation and ambiguity resolution patterns
- D5.3 Implement error propagation strategies across multi-agent systems
- D5.4 Manage context effectively in large codebase exploration
- D5.5 Design human review workflows and confidence calibration
- D5.6 Preserve information provenance and handle uncertainty in multi-source synthesis

---

## Adaptive logic

The core idea: every task statement carries a weight that determines how likely
it is to be the subject of the next generated question. Weights start from a
seed, move up when the user gets a question wrong, and move down when the user
gets a question right. The next question's topic is chosen by weighted random
selection across all task statements.

### Starting weights (the seed)

Each task statement starts with a base weight. The seed reflects known weak
areas identified during study so the tool bears down on them from the first
question rather than waiting to discover them.

Seed tiers and their starting weights:

| Tier | Starting weight | Meaning |
|------|-----------------|---------|
| High-priority weak area | 3.0 | Known weak — test heavily from the start |
| Medium-priority weak area | 2.0 | Some exposure, not yet solid |
| Standard | 1.0 | Default for everything else |

The specific seeded weak areas for the tool's author (set these as the defaults
in the build; a colleague forking the tool can clear them or set their own):

**High priority (weight 3.0):**
- D4.3 — output_config / tool-use schema structure (the json_schema wrapper, the
  name key, additionalProperties on nested objects, required-list exact matching)
- D1.1 — agentic loop (zero prior exposure before study)
- D1.2 — multi-agent orchestration (zero prior exposure)
- D1.3 — subagent context passing (zero prior exposure)
- D1.5 — Agent SDK hooks (zero prior exposure)
- D2.2 — structured MCP error responses (zero prior exposure)
- D2.4 — MCP config files .mcp.json / ~/.claude.json (zero prior exposure)
- D3.1 — CLAUDE.md advanced: @import, .claude/rules/, /memory (partial exposure)
- D4.5 — Message Batches API (zero prior exposure)
- D5.1 — context management patterns (zero prior exposure)
- D5.2 — escalation patterns (zero prior exposure)

**Medium priority (weight 2.0):**
- D2.3 — tool_choice options as a standalone decision (auto / any / forced)
- D1.4 — programmatic enforcement vs prompt-based guidance across scenarios

**Standard (weight 1.0):** everything else.

### Weight adjustment after each answer

- Correct answer: multiply that task statement's weight by 0.7 (floor at 0.5)
- Incorrect answer: multiply that task statement's weight by 1.5 (cap at 5.0)

These multipliers make weights responsive without letting any single task
statement dominate or disappear entirely. The floor of 0.5 ensures even mastered
topics resurface occasionally; the cap of 5.0 prevents one weak area from
crowding out everything else.

### Domain weight overlay

Within the weighted random selection, also bias by the exam's domain weightings
so the practice distribution roughly mirrors the real exam (D1 heaviest at 27%,
D5 lightest at 15%). Combine the task-statement weight with the domain weight:
effective weight = task_statement_weight × domain_weight_factor. This keeps the
overall practice mix exam-realistic while still concentrating on weak spots
within each domain.

---

## Question generation

Questions are generated on demand by calling the Anthropic API
(model `claude-sonnet-4-6`) from within the artifact. The artifact environment
provides API access with no key handling.

### Generation request

When the tool needs a new question, it selects a target task statement via the
weighted random selection, then prompts the API to generate a scenario-based MCQ
for that specific task statement. The generation prompt must:

- Specify the exact task statement and its domain
- Require a realistic production scenario (1-2 short paragraphs) drawn from the
  kinds of use cases the exam uses: customer support agents, multi-agent
  research pipelines, Claude Code in CI/CD, developer productivity tools,
  structured data extraction
- Require exactly one correct answer and three plausible distractors, where the
  distractors represent the kinds of mistakes a candidate with incomplete
  knowledge would make
- Require an explanation of why the correct answer is right and why each
  distractor is wrong
- Require output as strict JSON only, no preamble, no markdown fences

### Expected JSON shape

```json
{
  "taskStatement": "D1.2",
  "domain": "D1",
  "scenario": "Two short paragraphs of production context...",
  "question": "The question stem...",
  "options": {
    "A": "First option",
    "B": "Second option",
    "C": "Third option",
    "D": "Fourth option"
  },
  "correct": "B",
  "explanations": {
    "A": "Why A is wrong...",
    "B": "Why B is correct...",
    "C": "Why C is wrong...",
    "D": "Why D is wrong..."
  }
}
```

The tool parses this, renders the scenario/question/options, accepts the user's
answer, then reveals correctness and the explanations.

### Quality grounding

The generation prompt should include 1-2 of the official sample questions as
few-shot examples so generated questions match the exam's style and difficulty.
The build prompt includes sample questions for this purpose. This is itself an
application of D4.2 (few-shot prompting for output consistency) — the tool uses
the technique it tests.

The generation prompt explicitly lists six scenario types including "Structured
Data Extraction" and "Developer Productivity with Claude" — these two are not
covered by the initial static question set and are addressed via the additional
few-shot examples (D2.1, D4.6, D3.4) added to the Phase 1 seed questions.

### Reliability

- Generation is non-deterministic; if JSON parsing fails, retry once with the
  parse error appended to the prompt (an application of D4.4, retry-with-error-
  feedback), then surface a friendly error if it still fails.
- Pre-generate the next question in the background while the user reads the
  current explanation, so there is no wait between questions.
- Repeat prevention: the last 5 task statements in persisted history are
  temporarily excluded from the weighted draw, preventing the same topic from
  appearing in a short run. Because cooldown is derived from stored history
  rather than in-session state, it survives reloads.
- Flag as flawed: a per-question control performs full discard — the question
  affects nothing: weight, accuracy, or history. This protects both adaptive
  weighting and score integrity when a generated question is ambiguous or has a
  defensible second answer.

---

## Persistence

Performance and weights persist across sessions using the artifact persistent
storage API (`window.storage`). Do not use localStorage or sessionStorage —
they are not supported in the artifact environment.

### What to store

- Current weight for every task statement
- Per-task-statement counts: questions seen, questions correct
- Per-domain rollups (derived, but cached for the dashboard)
- Total questions answered, total correct
- A rolling history of the last N results (task statement, correct/incorrect,
  timestamp) for trend display

Store under a small number of hierarchical keys (e.g. `ccaf:weights`,
`ccaf:stats`, `ccaf:history`) rather than one key per task statement, to keep
storage operations few. Wrap all storage calls in try/catch and show a clear
message if storage is unavailable, degrading to in-memory-only for the session.

### Reset

Include a clearly labelled reset control that clears stored progress and
restores the seed weights, with a confirmation step so it is not triggered
accidentally.

---

## Interface and feedback

- One question on screen at a time: scenario, stem, four options.
- The user selects an option and submits.
- On submit: reveal correct/incorrect, highlight the correct option, and show
  the explanation for the chosen option and the correct option (showing all
  four explanations is fine and preferred for study value).
- A "next question" control advances; the next question is already pre-generated.
- A persistent progress dashboard shows: overall accuracy, accuracy by domain,
  and the task statements currently weighted highest (i.e. the current weak
  spots). This makes the adaptive behaviour visible — the user can see what the
  tool thinks they should work on.
- Feedback mode is per-question (explanation after every question), not
  end-of-set. There is no fixed set length; the user practices until they stop.

---

## Seeding options for colleagues (design for reuse)

The tool is built so a colleague can take it and make it their own with minimal
friction. The seed configuration lives in a single, clearly commented object at
the top of the component. Three intended uses:

1. **As-is** — build with the author's seeded weak areas (the defaults above).
2. **Blank slate** — set every task statement to weight 1.0 for a colleague who
   wants the tool to discover their weak areas purely from their answers.
3. **Custom seed** — a colleague edits the seed object to reflect their own known
   weak areas before building.

The build prompt instructs Claude to put this seed object at the very top of the
file with comments explaining each option, so editing it requires no
understanding of the rest of the code.

---

## Explicit non-goals

- No backend, no server, no API key handling. The artifact environment provides
  API access; persistence is via `window.storage`.
- No shared/multiplayer state. Each person's tool is private to their artifact.
- No fixed question bank to maintain. Questions are generated on demand.
- Not a timed exam simulator in this version. The focus is adaptive practice
  with immediate feedback, not replicating the 120-minute timed condition. A
  timed full-length mode could be a later addition.
