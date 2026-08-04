# CCAR-F Adaptive Practice Exam — Build Prompt

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
Architect – Foundations (CCAR-F) exam, as a single React artifact. We will build
it in four phases. Build only the phase I ask for, then stop and let me confirm
it works before continuing. Do not jump ahead.

Key environment facts you must honor throughout:
- This runs as a React artifact. Use React state for in-session data.
- For cross-session persistence, use the artifact persistent storage API
  (`window.storage` with get/set/delete/list). NEVER use localStorage or
  sessionStorage — they are not supported and will fail.
- For question generation, call the Anthropic API from within the artifact:
  `fetch("https://api.anthropic.com/v1/messages", ...)` with model
  `claude-sonnet-5` and `max_tokens` set to 1000. Do NOT include an API key —
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
  generated questions will use, so the data shape is settled now.

  Their option text is quoted verbatim from the exam guide and must stay that
  way. An earlier revision of this document carried them compressed — unevenly,
  distractors cut harder than correct answers — which measured 80%
  longest-is-correct against the guide's own 58%. Because these same questions
  are the Phase 3 few-shot set, a build made from the compressed version did not
  merely display that tell, it learned to generate it. Do not paraphrase or
  shorten them:

  Question 1 (D1.4): Scenario — A customer support agent built on the Claude
  Agent SDK has MCP tools get_customer, lookup_order, process_refund,
  escalate_to_human. Production data shows that in 12% of cases the agent skips
  get_customer and calls lookup_order using only the customer's stated name,
  sometimes causing misidentified accounts and incorrect refunds.
  Question — What change would most effectively address this reliability issue?
  A) Add a programmatic prerequisite that blocks lookup_order and process_refund
  calls until get_customer has returned a verified customer ID.
  B) Enhance the system prompt to state that customer verification via
  get_customer is mandatory before any order operations.
  C) Add few-shot examples showing the agent always calling get_customer first,
  even when customers volunteer order details.
  D) Implement a routing classifier that analyzes each request and enables only
  the subset of tools appropriate for that request type.
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
  A) Add few-shot examples to the system prompt demonstrating correct tool
  selection patterns, with 5-8 examples showing order-related queries
  routing to lookup_order.
  B) Expand each tool's description to include input formats it handles, example
  queries, edge cases, and boundaries explaining when to use it versus
  similar tools.
  C) Implement a routing layer that parses user input before each turn and
  pre-selects the appropriate tool based on detected keywords and identifier
  patterns.
  D) Consolidate both tools into a single lookup_entity tool that accepts any
  identifier and internally determines which backend to query.
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
  A) Add explicit escalation criteria to your system prompt with few-shot
  examples demonstrating when to escalate versus resolve autonomously.
  B) Have the agent self-report a confidence score (1-10) before each response
  and automatically route requests to humans when confidence falls below a
  threshold.
  C) Deploy a separate classifier model trained on historical tickets to predict
  which requests need escalation before the main agent begins processing.
  D) Implement sentiment analysis to detect customer frustration levels and
  automatically escalate when negative sentiment exceeds a threshold.
  Correct: A.
  Explanations — A: addresses the root cause, unclear decision boundaries, and
  is the proportionate first step. B fails because LLM self-reported confidence
  is poorly calibrated — the agent is already confidently wrong on hard cases.
  C is over-engineered before prompt optimization is tried. D solves a different
  problem; sentiment doesn't correlate with case complexity.

  Question 4 (D2.1): Scenario — A multi-agent research system misroutes 45% of
  requests to the web-search agent's analyze_content tool instead of the document
  analysis agent's analyze_document tool. Both tools have nearly identical
  descriptions.
  Question — What is the most effective fix?
  A) Insert a pre-routing classifier that reads the incoming request text and
  predicts the correct agent before the coordinator evaluates tool descriptions.
  B) Rename the web-search tool to extract_web_results and update its description
  to reference web search and URLs specifically.
  C) Add several few-shot examples to the coordinator's system prompt, pairing
  sample requests with the correct agent so it can pattern-match new requests.
  D) Expand the analyze_document tool's description with detail on the document
  formats, file types, and content it is designed to process.
  Correct: B.
  Explanations — B: renaming removes semantic overlap at the source. A is
  over-engineered for a description problem. C adds overhead without fixing the
  root cause. D fixes only half the problem.

  Question 5 (D4.6): Scenario — A pull request touches 14 files. A single-pass
  review produces inconsistent depth, missed bugs, and contradictory feedback on
  identical patterns in different files.
  Question — How should you restructure the review?
  A) Run three independent review passes on the full PR and only flag issues that
  appear in at least two of the three runs.
  B) Split into focused passes: analyze each file individually for local issues,
  then run a separate integration-focused pass examining cross-file data
  flow.
  C) Require developers to split large PRs into smaller submissions of 3-4 files
  before the automated review runs.
  D) Switch to a higher-tier model with a larger context window to give all 14
  files adequate attention in one pass.
  Correct: B.
  Explanations — B: per-file passes fix attention dilution; the integration pass
  catches cross-file concerns. A suppresses real bugs by requiring consensus. C
  shifts burden without improving the system. D misunderstands the problem.

  Question 6 (D3.4): Scenario — A team is restructuring a monolithic application
  into microservices, involving changes across dozens of files and decisions about
  service boundaries and module dependencies.
  Question — Which approach should you take?
  A) Enter plan mode to explore the codebase, understand dependencies, and design
  an implementation approach before making changes.
  B) Start with direct execution and make changes incrementally, letting the
  implementation reveal the natural service boundaries.
  C) Use direct execution with comprehensive upfront instructions detailing
  exactly how each service should be structured.
  D) Begin in direct execution mode and only switch to plan mode if you encounter
  unexpected complexity during implementation.
  Correct: A.
  Explanations — A: plan mode is designed for architectural decisions, large-scale
  changes, and multiple valid approaches. B risks costly rework. C assumes you
  know the structure without exploring. D ignores that the complexity is already
  stated in requirements.

  Question 7 (D3.3): Scenario — A codebase has distinct coding conventions for
  React components, API handlers, and database models. Test files are spread
  throughout the codebase alongside the code they test (e.g., Button.test.tsx
  next to Button.tsx). The team wants all test files to follow the same
  conventions regardless of directory location.
  Question — What is the most maintainable way to ensure Claude automatically
  applies the correct conventions when generating code?
  A) Create rule files in .claude/rules/ with YAML frontmatter specifying glob
  patterns to conditionally apply conventions based on file paths
  B) Consolidate all conventions in the root CLAUDE.md file under headers for
  each area, relying on Claude to infer which section applies
  C) Create skills in .claude/skills/ for each code type that include the
  relevant conventions in their SKILL.md files
  D) Place a separate CLAUDE.md file in each subdirectory containing that area's
  specific conventions
  Correct: A.
  Explanations — A: .claude/rules/ with glob patterns (e.g., **/*.test.tsx)
  applies conventions based on file paths regardless of directory location —
  essential for test files spread throughout the codebase. B relies on
  inference rather than explicit matching, making it unreliable. C requires
  manual invocation or Claude choosing to load the skill, which contradicts the
  need for deterministic automatic application. D cannot handle files spread
  across many directories since CLAUDE.md files are directory-bound.

  Question 8 (D1.2): Scenario — A multi-agent research system runs on the topic
  "impact of AI on creative industries." Each subagent completes successfully:
  the web search agent finds articles, the document analysis agent summarizes
  papers, and the synthesis agent produces coherent output. However, the final
  report covers only visual arts — music, writing, and film are missing
  entirely. The coordinator's logs show it decomposed the topic into three
  subtasks: "AI in digital art creation," "AI in graphic design," and "AI in
  photography."
  Question — What is the most likely root cause?
  A) The synthesis agent lacks instructions for identifying coverage gaps in the
  findings it receives from other agents.
  B) The coordinator agent's task decomposition is too narrow, resulting in
  subagent assignments that don't cover all relevant domains of the topic.
  C) The web search agent's queries are not comprehensive enough and need to be
  expanded to cover more creative industry sectors.
  D) The document analysis agent is filtering out sources related to non-visual
  creative industries due to overly restrictive relevance criteria.
  Correct: B.
  Explanations — B: the coordinator's logs reveal the root cause directly — it
  decomposed "creative industries" into only visual arts subtasks, completely
  omitting music, writing, and film. The subagents executed their assigned tasks
  correctly; the problem is what they were assigned. A, C, and D incorrectly
  blame downstream agents that are working correctly within their assigned scope.

  Question 9 (D2.3): Scenario — During testing, a synthesis agent frequently
  needs to verify specific claims while combining findings. When verification is
  needed, the synthesis agent returns control to the coordinator, which invokes
  the web search agent, then re-invokes synthesis with results. This adds 2-3
  round trips per task and increases latency by 40%. Evaluation shows 85% of
  verifications are simple fact-checks (dates, names, statistics) while 15%
  require deeper investigation.
  Question — What is the most effective approach to reduce overhead while
  maintaining system reliability?
  A) Give the synthesis agent a scoped verify_fact tool for simple lookups, while
  complex verifications continue delegating to the web search agent through
  the coordinator.
  B) Have the synthesis agent accumulate all verification needs and return them
  as a batch to the coordinator at the end of its pass, which then sends
  them all to the web search agent at once.
  C) Give the synthesis agent access to all web search tools so it can handle any
  verification need directly without round-trips through the coordinator.
  D) Have the web search agent proactively cache extra context around each source
  during initial research, anticipating what the synthesis agent might need
  to verify.
  Correct: A.
  Explanations — A: applies the principle of least privilege — the synthesis
  agent gets only what it needs for the 85% common case while preserving the
  existing coordination pattern for complex cases. B creates blocking
  dependencies since synthesis steps may depend on earlier verified facts. C
  over-provisions the synthesis agent, violating separation of concerns. D
  relies on speculative caching that cannot reliably predict what will need
  verification.

  Question 10 (D4.5): Scenario — A team wants to reduce API costs for automated
  analysis. Two workflows currently use real-time Claude calls: (1) a blocking
  pre-merge check that must complete before developers can merge, and (2) a
  technical debt report generated overnight for review the next morning. The
  manager proposes switching both to the Message Batches API for its 50% cost
  savings.
  Question — How should you evaluate this proposal?
  A) Use batch processing for the technical debt reports only; keep real-time
  calls for pre-merge checks.
  B) Switch both workflows to batch processing with status polling to check for
  completion.
  C) Keep real-time calls for both workflows to avoid batch result ordering
  issues.
  D) Switch both to batch processing with a timeout fallback to real-time if
  batches take too long.
  Correct: A.
  Explanations — A: the Message Batches API offers 50% cost savings but has
  processing times up to 24 hours with no guaranteed latency SLA, making it
  unsuitable for blocking pre-merge checks but ideal for overnight reports. B
  is wrong because "often faster" completion is not acceptable for blocking
  workflows. C reflects a misconception — batch results can be correlated using
  custom_id fields, so ordering is not a real problem. D adds unnecessary
  complexity when the simpler solution is matching each API to its appropriate
  use case.

- UI: show one question at a time — scenario, stem, four options as clickable
  choices. The user selects one and submits. On submit, reveal correct/incorrect,
  highlight the correct option, and show all four explanations. A "Next question"
  button advances; for Phase 1 just cycle through the ten static questions.
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

Replace the static question set with on-demand generation. Keep the ten static
questions only as few-shot examples in the generation prompt.

Requirements:
- Weighted random selection of the next task statement: effective weight =
  task_statement_weight × domain_weight_factor, where the domain factor reflects
  the exam weighting (D1 1.8, D2 1.2, D3 1.33, D4 1.33, D5 1.0 — these are the
  domain percentages normalized to the smallest; you may recompute, the point is
  D1 heaviest, D5 lightest). Select one task statement by weighted random draw.
- Call the Anthropic API (model `claude-sonnet-5`, `max_tokens` 1000, no API
  key) to generate one scenario-based MCQ for the selected task statement. The
  generation prompt must:
  - State the exact task statement and domain.
  - Require a realistic production scenario (1-2 short paragraphs) in the style
    of the exam's use cases: customer support agents, multi-agent research
    pipelines, Claude Code in CI/CD, Developer Productivity with Claude
    (codebase exploration, legacy system understanding, boilerplate generation,
    task automation using built-in tools Read/Write/Bash/Grep/Glob and MCP
    servers), Structured Data Extraction (extracting information from
    unstructured documents, validating output using JSON schemas, handling edge
    cases, integrating with downstream systems).
  - Require exactly one correct answer and three plausible distractors that
    represent mistakes a partially-knowledgeable candidate would make.
    Single-answer matches the real exam. The exam guide describes
    multiple-response items, but a real sitting encountered none, so the guide
    overstates the format. Do not generate multiple-response items, and do not
    describe their absence as a gap in the built artifact.
  - Require an explanation for why the correct answer is right and why each
    distractor is wrong.
  - Control the OPTION-LENGTH TELL, and control it in two places, because one
    is not enough. Cap how far the correct option may exceed its longest rival
    (1.20x), and separately plan how OFTEN it is allowed to be longest at all
    (~35%, against a chance rate of 25% for four options). A cap alone does not
    work: generation settles just under it, so every question passes while the
    rate climbs. Measured on a real bank built with the cap and a prompt rule
    but no rate plan, the correct option was the longest in 81% of questions —
    a candidate who read nothing and picked the longest scored 81%, which makes
    the readiness estimate meaningless. Assign the posture per question up
    front from a shuffled plan, put it in the prompt, and reject a candidate
    that violates it. Do not drive the rate to zero: that teaches the candidate
    that the longest option is never right, which the real exam refutes.
  - When lengthening a distractor to even out the options, add concrete detail
    about what that option would involve — never the reason it is wrong.
    Clauses like "without addressing the root cause" trade a length tell for a
    worse one, because the correct answer becomes the only option not arguing
    against itself. A distractor's wrongness belongs in its explanation.
  - Include the ten Phase 1 sample questions as few-shot examples of STRUCTURE
    AND RIGOUR — a well-formed stem, four plausible options, exactly one correct
    answer per principle, near-miss distractors. They are NOT the difficulty
    target: someone who sat the real exam reports they read easy-to-moderate
    against it, and that they name their tools and techniques outright where the
    exam more often describes a mechanism by what it does. Tell the model to
    match their rigour and not their phrasing or their level, or the bank trains
    recognition of names rather than of mechanisms.
  - Instruct the model NOT to invent specific technical facts — flag names,
    environment variables, configuration behaviors, or claims about how a
    feature depends on configuration or deployment — unless grounded in the
    documented CCAR-F exam content provided in the prompt (the task statement
    descriptions and few-shot examples). If an explanation needs a technical
    detail to justify why an option is correct or incorrect, it must use only
    facts established in the provided exam content rather than fabricating
    plausible-sounding specifics. When in doubt, prefer an explanation
    grounded in the exam's stated principles (e.g., programmatic enforcement
    vs. probabilistic compliance, tool description quality, structured error
    categories) over one relying on an invented technical detail.
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
- Repeat prevention: when selecting the next task statement via weighted random
  draw, temporarily set effective weight to 0 for any of the last 5 task
  statements in the persisted history (ccaf:history). Cooldown is derived from
  stored history, not in-session state, so it survives reloads.
- Flag as flawed: after answer reveal, show a secondary button "Flag — don't
  count this question." If clicked before advancing: fully discard the question —
  revert the weight update, remove it from answered count and accuracy, remove it
  from history — as if it never happened. Increment a totalFlagged counter in
  ccaf:stats. Show confirmation: "Flagged and discarded. This question didn't
  affect your weights or accuracy." The button disappears after clicking or
  advancing.
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
- A "when to flag" note (in that panel, or near the flag control) giving the
  three signs a generated question is flawed and should be flagged rather than
  answered: (1) invented specifics — a flag, environment variable, or config
  behaviour not in the CCAR-F exam guide or course (e.g. `--non-interactive`
  when the documented flag is `-p`/`--print`); (2) two defensible answers —
  another option still looks correct and the explanation against it rests on a
  preference or an unverifiable caveat, not a real correctness gap; (3) an
  outdated pattern as the marked answer — a superseded mechanism (e.g.
  `CLAUDE.local.md` when home-directory imports via `@~/.claude/` paths are
  current). State that flagging fully discards the question — weights, accuracy,
  and history untouched, as if it never appeared — and "when in doubt, flag."
  Flags are local to the user; do not add or imply any upstream reporting.
- Visual polish: clear correct/incorrect states (green/red), readable typography
  for long study sessions, a clean dashboard, responsive layout.
- Graceful empty/error states: first-run with no history, storage unavailable,
  generation failure.
- A session counter showing how many questions answered this session vs all time.

Build Phase 4. Then give me a short summary of how to use the tool day to day
and how a colleague would fork and reseed it.

---

## PHASE 5 — Export progress for the companion CLI app

Add an export so a user can move their progress into the companion local CLI
app, which imports the same JSON state format. This is purely additive — do
NOT change any existing selection, scoring, flag, or persistence behaviour.
Export only reads the stored state and serializes it.

Requirements:
- Add an "Export progress" control to the dashboard area.
- On click, serialize the current stored state to a JSON object in EXACTLY
  this schema (key order not significant, shape is):

  {
    "version": 1,
    "weights": { "<taskStatement>": <number>, ... all 30 statements ... },
    "stats": {
      "totalAnswered": <number>,
      "totalCorrect": <number>,
      "totalFlagged": <number>,
      "perTask": { "<taskStatement>": { "seen": <n>, "correct": <n> }, ... }
    },
    "history": [ { "t": "<taskStatement>", "q": <questionId or null>,
                   "c": <boolean>, "at": <epoch ms> }, ... ],
    "seen": { "<questionId>": <epoch ms>, ... },
    "flagged": [ <questionIds> ],
    "examHistory": []
  }

- Field mapping from this tool's storage:
  - `weights` ← `ccaf:weights` directly. Include ALL 30 task statements even if
    unseen (export their current stored weight; seeded statements always have
    one).
  - `stats` ← `ccaf:stats` directly (totalAnswered, totalCorrect, totalFlagged,
    and perTask {seen, correct}).
  - `history` ← `ccaf:history`, mapping each entry to
    {t: taskStatement, q: null, c: correct, at: timestamp}. This tool's history
    entries carry no question ID (questions are generated, not banked), so `q`
    is ALWAYS null — the importer accepts null.
  - `seen` ← `{}`. This tool tracks repeat-prevention by task statement via
    history, not a per-question seen map, so there are no question IDs to
    export. Emit an empty object.
  - `flagged` ← `[]`. This tool tracks flagged-as-flawed only as the
    `totalFlagged` counter (flagged questions are discarded, not stored by ID),
    so there are no IDs to list. Keep `totalFlagged` accurate in `stats`; emit
    an empty array here.
  - `examHistory` ← `[]` always. Timed exam mode belongs to the companion app,
    not this tool.

- Presentation: render the JSON in a copyable code block inside a modal or
  expandable panel, with a "Copy to clipboard" button (use the clipboard API;
  wrap in try/catch and fall back to selecting the text if it fails). Do NOT
  attempt a file download — clipboard copy into a file the user saves as
  `exam_progress.json` is the reliable path in this environment. Show this
  one-line instruction above the JSON:
  "Save this as exam_progress.json and import it into the CLI app."

- Validation before display — a colleague debugging a bad import with no error
  context is the failure mode to avoid, so if the serialized object fails any
  check, show the error message in the panel INSTEAD of malformed JSON:
  - all 30 task statements present as keys in `weights`;
  - `stats.totalAnswered` equals the sum of `perTask[*].seen`, and
    `stats.totalCorrect` equals the sum of `perTask[*].correct`;
  - every `history` entry has a task-statement `t`, boolean `c`, numeric `at`,
    and `q` null-or-string.

Build Phase 5 only. Then show me the exported JSON from your current state and
tell me how to test the Copy-to-clipboard flow.

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
- The fabrication guardrail in the Phase 3 generation prompt exists because
  real use surfaced two generated questions that fabricated technical specifics
  to prop up their marked-correct answer: one invented a nonexistent CLI flag
  (--non-interactive), and another invented an unfounded claim that "strict
  JSON mode availability depends on deployment configuration." Neither was
  grounded in the actual CCAR-F exam content. The fix is a generation-prompt
  instruction rather than a post-hoc filter — preventing fabrication at
  generation time is more reliable than trying to detect it after the fact.
- The generation prompt's scenario type list explicitly includes "Structured
  Data Extraction" and "Developer Productivity with Claude" — two scenarios not
  covered by the 60-question static bank in paullarionov/claude-certified-
  architect. The tool will generate questions for these scenarios dynamically;
  few-shot examples for them come from the D2.1, D4.6, and D3.4 questions added
  in Phase 1 (Questions 4-6).
- The seed weights are the author's known weak areas as of build time. As you
  practice, the adaptive logic takes over from the seed — so the seed matters
  most in the first couple of dozen questions, then your actual performance
  drives the weighting.
- If you want a timed, full-length 60-question simulation later, that is a clean
  follow-on: add a mode that draws 60 questions matching the exam's domain
  distribution, hides explanations until the end, and runs a 120-minute timer.

---

## Two corrections from a real sitting (apply these if you fork this build)

Someone sat the real CCAR-F and came back with two things this build gets
wrong. Both are cheap to get right up front and awkward to retrofit.

**1. Do not tell the generator to match the samples' tone.** The instruction
above to include the sample questions as few-shot is right; framing them as a
tone to match is not. It pins generation to the exam guide's **official
terminology**, so drilling trains recognition of *named* mechanisms — and the
real exam frequently describes the same mechanism **functionally and unnamed**
("an automatic step that runs after each file edit and enforces a constraint
regardless of what the model decides", not "a PostToolUse hook"). Mapping an
abstracted description back to a mechanism is the actual difficulty.

Keep the samples — they carry real load on stem quality, four plausible
options, one-correct-per-principle, and near-miss distractors. Change what they
are *for*: models of **structure and difficulty**, with their phrasing named
explicitly as a floor to move away from. Then assign each question a register —
roughly 45% written functionally, the rest naming the mechanism — as a
generation **input**, so the mix is a fact rather than something the model
reports about itself. Assign it randomly per question, not on a repeating
pattern: a candidate who can predict which questions are abstracted is back to
pattern-matching.

The hard constraint: this varies how a **real** mechanism is described, never
**which** mechanisms are real. A functional-sounding invented mechanism is the
same fabrication failure the guardrail above already forbids, and it is easier
to hide inside a functional description — so any screening step must be able to
name the specific real mechanism a functional question resolves to, and flag it
when it cannot.

Raise difficulty through abstraction and near-miss distractors only — never
through ambiguity, obscurity, or invented specifics.

**2. The exam presents scenarios in blocks.** It draws 4 of 6 scenarios and
asks **15 consecutive questions against one scenario**, with the scenario held
persistently on the left and the branching question on the right — not
interleaved, and not re-read every question.

The trap: a "scenario type" is a *genre*, not shared content. If each question
invents its own scenario text, grouping by type gives you 15 questions that
merely feel related, and a "persistent" panel shows the wrong text for 14 of
them. Generate the block's scenario **once**, then pass it into each of that
block's 15 question calls as a fixed input, and overwrite whatever the model
returns with the supplied text so the 15 are byte-identical. Repaint the panel
when the scenario text differs from what is displayed — not on a block index,
which breaks the moment a question is substituted or the candidate jumps back
from a review screen.

Keep the global domain quotas exact and **weight** each block toward its
scenario's domains rather than restricting it: D1 alone needs 16 of 60, more
than one block holds, so a domain-pure block is impossible.

The same sitting is why the simulator gained **mark-through** — striking out
options you have eliminated, without committing an answer. Keep it distinct
from both the mark-for-review flag and any flag-as-flawed control; they are
three different things and conflating any two loses answers or questions.
