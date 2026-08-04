// CCAR-F practice exam question bank - machine-written by exam_lib.render_bank().
// Do not hand-edit; add or change questions via generate_bank.py.
//
// ATTRIBUTION. Entries whose provenance.source is "official-sample" are the
// sample questions published in the Claude Certified Architect - Foundations
// Exam Guide v1.0, section 9 ("Sample Questions"). Their scenario, question and
// option text is Anthropic's, quoted verbatim and unaltered, for study and
// commentary in a personal exam-preparation tool. (c) Anthropic PBC. This tool
// is not an official Anthropic product and is not affiliated with, sponsored by
// or endorsed by Anthropic. Every other entry is generated practice material
// written for this tool and is not exam content.
window.CCARF_BANK = [
  {
    "taskStatement": "D1.4",
    "domain": "D1",
    "scenario": "A customer support agent built on the Claude Agent SDK has MCP tools get_customer, lookup_order, process_refund, and escalate_to_human. Production data shows that in 12% of cases the agent skips get_customer and calls lookup_order using only the customer's stated name, sometimes causing misidentified accounts and incorrect refunds.",
    "question": "What change would most effectively address this reliability issue?",
    "options": {
      "C": "Enhance the system prompt to state that customer verification via get_customer is mandatory before any order operations.",
      "D": "Add a programmatic prerequisite that blocks lookup_order and process_refund calls until get_customer has returned a verified customer ID.",
      "B": "Implement a routing classifier that analyzes each request and enables only the subset of tools appropriate for that request type.",
      "A": "Add few-shot examples showing the agent always calling get_customer first, even when customers volunteer order details."
    },
    "correct": "D",
    "explanations": {
      "D": "Correct. When a specific tool sequence is required for critical business logic, programmatic enforcement gives deterministic guarantees that prompt-based approaches cannot.",
      "C": "Relies on probabilistic LLM compliance, which is insufficient when errors have financial consequences.",
      "A": "Few-shot examples also rely on probabilistic compliance - they raise the odds of the right sequence but cannot guarantee it when refunds are at stake.",
      "B": "Addresses tool availability, not tool ordering, which is the actual problem."
    },
    "provenance": {
      "source": "official-sample",
      "model": null,
      "generatedAt": null,
      "reviewed": true
    },
    "id": "D1.4-63729811",
    "scenarioType": "Customer Support Resolution Agent"
  },
  {
    "taskStatement": "D2.1",
    "domain": "D2",
    "scenario": "Production logs show the agent frequently calls get_customer when users ask about orders (e.g., \"check my order #12345\") instead of lookup_order. Both tools have minimal descriptions (\"Retrieves customer information\" / \"Retrieves order details\") and accept similar identifier formats.",
    "question": "What is the most effective first step to improve tool selection reliability?",
    "options": {
      "D": "Expand each tool's description to include input formats it handles, example queries, edge cases, and boundaries explaining when to use it versus similar tools.",
      "C": "Add few-shot examples to the system prompt demonstrating correct tool selection patterns, with 5-8 examples showing order-related queries routing to lookup_order.",
      "A": "Implement a routing layer that parses user input before each turn and pre-selects the appropriate tool based on detected keywords and identifier patterns.",
      "B": "Consolidate both tools into a single lookup_entity tool that accepts any identifier and internally determines which backend to query."
    },
    "correct": "D",
    "explanations": {
      "C": "Adds token overhead without fixing the root cause - the tool descriptions remain ambiguous.",
      "D": "Correct. Tool descriptions are the primary mechanism for tool selection; minimal descriptions are the root cause, and this is the low-effort, high-leverage fix.",
      "A": "Over-engineered and bypasses the model's language understanding.",
      "B": "A valid architecture but heavier than a \"first step\" warrants."
    },
    "provenance": {
      "source": "official-sample",
      "model": null,
      "generatedAt": null,
      "reviewed": true
    },
    "id": "D2.1-84cf013a",
    "scenarioType": "Customer Support Resolution Agent"
  },
  {
    "taskStatement": "D5.2",
    "domain": "D5",
    "scenario": "An agent achieves 55% first-contact resolution against an 80% target. Logs show it escalates straightforward cases (standard damage replacements with photo evidence) while attempting to autonomously handle complex situations requiring policy exceptions.",
    "question": "What is the most effective way to improve escalation calibration?",
    "options": {
      "B": "Add explicit escalation criteria to your system prompt with few-shot examples demonstrating when to escalate versus resolve autonomously.",
      "D": "Have the agent self-report a confidence score (1-10) before each response and automatically route requests to humans when confidence falls below a threshold.",
      "A": "Deploy a separate classifier model trained on historical tickets to predict which requests need escalation before the main agent begins processing.",
      "C": "Implement sentiment analysis to detect customer frustration levels and automatically escalate when negative sentiment exceeds a threshold."
    },
    "correct": "B",
    "explanations": {
      "B": "Correct. This addresses the root cause - unclear decision boundaries - and is the proportionate first step.",
      "D": "LLM self-reported confidence is poorly calibrated; the agent is already confidently wrong on hard cases.",
      "A": "Over-engineered before prompt optimization has been tried.",
      "C": "Solves a different problem; sentiment does not correlate with case complexity."
    },
    "provenance": {
      "source": "official-sample",
      "model": null,
      "generatedAt": null,
      "reviewed": true
    },
    "id": "D5.2-5e1f193c",
    "scenarioType": "Customer Support Resolution Agent"
  },
  {
    "taskStatement": "D2.1",
    "domain": "D2",
    "scenario": "A multi-agent research system misroutes 45% of requests to the web-search agent's analyze_content tool instead of the document analysis agent's analyze_document tool. Both tools have nearly identical descriptions.",
    "question": "What is the most effective fix?",
    "options": {
      "A": "Rename the web-search tool to extract_web_results and update its description to reference web search and URLs specifically.",
      "B": "Insert a pre-routing classifier that reads the incoming request text and predicts the correct agent before the coordinator evaluates tool descriptions.",
      "C": "Add several few-shot examples to the coordinator's system prompt, pairing sample requests with the correct agent so it can pattern-match new requests.",
      "D": "Expand the analyze_document tool's description with detail on the document formats, file types, and content it is designed to process."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Renaming removes the semantic overlap at its source, since routing decisions are driven by tool name and description text — giving the two tools clearly distinct names and descriptions eliminates the ambiguity directly.",
      "B": "Over-engineered for what is fundamentally a description problem. Adding a separate classification stage introduces a new component to build and maintain, but it doesn't touch why the coordinator confuses the two tools in the first place.",
      "C": "Adds overhead without fixing the root cause. The coordinator still sees the same two overlapping tool descriptions at decision time, so examples only coach around the ambiguity rather than removing it.",
      "D": "Fixes only half the problem. The web-search tool's description stays just as ambiguous as before, so the coordinator can still route requests to it by mistake."
    },
    "provenance": {
      "source": "official-sample",
      "model": null,
      "generatedAt": null,
      "reviewed": true
    },
    "id": "D2.1-9ec6a97f",
    "scenarioType": "Multi-Agent Research System"
  },
  {
    "taskStatement": "D4.6",
    "domain": "D4",
    "scenario": "A pull request touches 14 files. A single-pass review produces inconsistent depth, missed bugs, and contradictory feedback on identical patterns in different files.",
    "question": "How should you restructure the review?",
    "options": {
      "C": "Run three independent review passes on the full PR and only flag issues that appear in at least two of the three runs.",
      "A": "Require developers to split large PRs into smaller submissions of 3-4 files before the automated review runs.",
      "D": "Split into focused passes: analyze each file individually for local issues, then run a separate integration-focused pass examining cross-file data flow.",
      "B": "Switch to a higher-tier model with a larger context window to give all 14 files adequate attention in one pass."
    },
    "correct": "D",
    "explanations": {
      "C": "Suppresses real bugs by requiring consensus across passes.",
      "D": "Correct. Per-file passes fix attention dilution; the integration pass catches cross-file concerns.",
      "A": "Shifts the burden to developers without improving the review system.",
      "B": "Misunderstands the problem - the issue is attention dilution, not context capacity."
    },
    "provenance": {
      "source": "official-sample",
      "model": null,
      "generatedAt": null,
      "reviewed": true
    },
    "id": "D4.6-b93aa7bc",
    "scenarioType": "Multi-Agent Research System"
  },
  {
    "taskStatement": "D3.4",
    "domain": "D3",
    "scenario": "A team is restructuring a monolithic application into microservices, involving changes across dozens of files and decisions about service boundaries and module dependencies.",
    "question": "Which approach should you take?",
    "options": {
      "C": "Start with direct execution and make changes incrementally, letting the implementation reveal the natural service boundaries.",
      "A": "Begin in direct execution mode and only switch to plan mode if you encounter unexpected complexity during implementation.",
      "D": "Use direct execution with comprehensive upfront instructions detailing exactly how each service should be structured.",
      "B": "Enter plan mode to explore the codebase, understand dependencies, and design an implementation approach before making changes."
    },
    "correct": "B",
    "explanations": {
      "B": "Correct. Plan mode is designed for architectural decisions, large-scale changes, and situations with multiple valid approaches.",
      "C": "Risks costly rework once service boundaries emerge mid-implementation.",
      "D": "Assumes you already know the structure without exploring it.",
      "A": "Ignores that the complexity is already stated in the requirements."
    },
    "provenance": {
      "source": "official-sample",
      "model": null,
      "generatedAt": null,
      "reviewed": true
    },
    "id": "D3.4-7d83e2d8",
    "scenarioType": "Code Generation with Claude Code"
  },
  {
    "taskStatement": "D3.3",
    "domain": "D3",
    "scenario": "A codebase has distinct coding conventions for React components, API handlers, and database models. Test files are spread throughout the codebase alongside the code they test (e.g., Button.test.tsx next to Button.tsx). The team wants all test files to follow the same conventions regardless of directory location.",
    "question": "What is the most maintainable way to ensure Claude automatically applies the correct conventions when generating code?",
    "options": {
      "A": "Create rule files in .claude/rules/ with YAML frontmatter specifying glob patterns to conditionally apply conventions based on file paths",
      "D": "Consolidate all conventions in the root CLAUDE.md file under headers for each area, relying on Claude to infer which section applies",
      "B": "Create skills in .claude/skills/ for each code type that include the relevant conventions in their SKILL.md files",
      "C": "Place a separate CLAUDE.md file in each subdirectory containing that area's specific conventions"
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. .claude/rules/ with glob patterns (e.g., **/*.test.tsx) applies conventions based on file paths regardless of directory location - essential for test files spread throughout the codebase.",
      "D": "Relies on inference rather than explicit matching, making it unreliable.",
      "B": "Requires manual invocation or Claude choosing to load the skill, which contradicts the need for deterministic automatic application.",
      "C": "Cannot handle files spread across many directories since CLAUDE.md files are directory-bound."
    },
    "provenance": {
      "source": "official-sample",
      "model": null,
      "generatedAt": null,
      "reviewed": true
    },
    "id": "D3.3-1799f801",
    "scenarioType": "Claude Code for Continuous Integration"
  },
  {
    "taskStatement": "D1.2",
    "domain": "D1",
    "scenario": "A multi-agent research system runs on the topic \"impact of AI on creative industries.\" Each subagent completes successfully: the web search agent finds articles, the document analysis agent summarizes papers, and the synthesis agent produces coherent output. However, the final report covers only visual arts - music, writing, and film are missing entirely. The coordinator's logs show it decomposed the topic into three subtasks: \"AI in digital art creation,\" \"AI in graphic design,\" and \"AI in photography.\"",
    "question": "What is the most likely root cause?",
    "options": {
      "D": "The synthesis agent lacks instructions for identifying coverage gaps in the findings it receives from other agents.",
      "C": "The coordinator agent's task decomposition is too narrow, resulting in subagent assignments that don't cover all relevant domains of the topic.",
      "A": "The web search agent's queries are not comprehensive enough and need to be expanded to cover more creative industry sectors.",
      "B": "The document analysis agent is filtering out sources related to non-visual creative industries due to overly restrictive relevance criteria."
    },
    "correct": "C",
    "explanations": {
      "D": "Incorrectly blames a downstream agent; the synthesis agent worked correctly within the scope it was given.",
      "C": "Correct. The coordinator's logs reveal the root cause directly - it decomposed \"creative industries\" into only visual arts subtasks, omitting music, writing, and film. The subagents executed their assigned tasks correctly.",
      "A": "The web search agent only searched within the subtasks it was assigned; broader queries were never requested of it.",
      "B": "There is no evidence of filtering - the missing sectors were never assigned to any agent in the first place."
    },
    "provenance": {
      "source": "official-sample",
      "model": null,
      "generatedAt": null,
      "reviewed": true
    },
    "id": "D1.2-5d5ae0ac",
    "scenarioType": "Multi-Agent Research System"
  },
  {
    "taskStatement": "D2.3",
    "domain": "D2",
    "scenario": "During testing, a synthesis agent frequently needs to verify specific claims while combining findings. When verification is needed, the synthesis agent returns control to the coordinator, which invokes the web search agent, then re-invokes synthesis with results. This adds 2-3 round trips per task and increases latency by 40%. Evaluation shows 85% of verifications are simple fact-checks (dates, names, statistics) while 15% require deeper investigation.",
    "question": "What is the most effective approach to reduce overhead while maintaining system reliability?",
    "options": {
      "B": "Give the synthesis agent a scoped verify_fact tool for simple lookups, while complex verifications continue delegating to the web search agent through the coordinator.",
      "A": "Have the synthesis agent accumulate all verification needs and return them as a batch to the coordinator at the end of its pass, which then sends them all to the web search agent at once.",
      "D": "Give the synthesis agent access to all web search tools so it can handle any verification need directly without round-trips through the coordinator.",
      "C": "Have the web search agent proactively cache extra context around each source during initial research, anticipating what the synthesis agent might need to verify."
    },
    "correct": "B",
    "explanations": {
      "B": "Correct. Applies the principle of least privilege - the synthesis agent gets only what it needs for the 85% common case while preserving the existing coordination pattern for complex cases.",
      "A": "Creates blocking dependencies since synthesis steps may depend on earlier verified facts.",
      "D": "Over-provisions the synthesis agent, violating separation of concerns.",
      "C": "Relies on speculative caching that cannot reliably predict what will need verification."
    },
    "provenance": {
      "source": "official-sample",
      "model": null,
      "generatedAt": null,
      "reviewed": true
    },
    "id": "D2.3-f32f295e",
    "scenarioType": "Multi-Agent Research System"
  },
  {
    "taskStatement": "D4.5",
    "domain": "D4",
    "scenario": "A team wants to reduce API costs for automated analysis. Two workflows currently use real-time Claude calls: (1) a blocking pre-merge check that must complete before developers can merge, and (2) a technical debt report generated overnight for review the next morning. The manager proposes switching both to the Message Batches API for its 50% cost savings.",
    "question": "How should you evaluate this proposal?",
    "options": {
      "D": "Use batch processing for the technical debt reports only; keep real-time calls for pre-merge checks.",
      "C": "Switch both workflows to batch processing with status polling to check for completion.",
      "A": "Keep real-time calls for both workflows to avoid batch result ordering issues.",
      "B": "Switch both to batch processing with a timeout fallback to real-time if batches take too long."
    },
    "correct": "D",
    "explanations": {
      "D": "Correct. The Message Batches API offers 50% cost savings but has processing times up to 24 hours with no guaranteed latency SLA - unsuitable for blocking pre-merge checks, ideal for overnight reports.",
      "C": "\"Often faster\" completion is not acceptable for blocking workflows.",
      "A": "Reflects a misconception - batch results can be correlated using custom_id fields, so ordering is not a real problem.",
      "B": "Adds unnecessary complexity when the simpler solution is matching each API to its appropriate use case."
    },
    "provenance": {
      "source": "official-sample",
      "model": null,
      "generatedAt": null,
      "reviewed": true
    },
    "id": "D4.5-b0cdd790",
    "scenarioType": "Claude Code for Continuous Integration"
  },
  {
    "taskStatement": "D1.1",
    "domain": "D1",
    "scenario": "One such agent autonomously fixes failing unit tests: it reads test failure output, edits the source file, re-runs the suite via Bash, and repeats until tests pass, then commits and reports success. In roughly 1 in 5 \"fixed\" pull requests, the actual CI run still fails even though the agent reported success — transcripts show its final iteration edited the code, reasoned \"this should resolve the test failure,\" and reported success without re-invoking Bash to re-run the suite.",
    "question": "What is the most effective change to the agentic loop's design to prevent this failure mode?",
    "options": {
      "A": "Require the loop to terminate only after a Bash call re-runs the test suite and the loop code checks the exit code and output for a pass before allowing a success report.",
      "B": "Add an instruction to the system prompt, placed alongside the tool-use guidelines, directing the agent to always invoke the Bash tool to re-run the full suite and read its output before declaring the fix successful.",
      "C": "Raise the loop's maximum iteration count so the agent has more read-edit-test cycles and more Bash invocations available before it must produce a final report on the pull request.",
      "D": "After each edit, have the agent output a numeric confidence score for its fix and change the loop's exit condition to check that score against a fixed threshold before allowing termination."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. The loop's termination condition should be a programmatic, ground-truth check (actual test suite output) rather than the model's own judgment, giving a deterministic guarantee that success is only reported when tests genuinely pass.",
      "B": "Relies on probabilistic LLM compliance with a prompt instruction; the model can still skip the verification step under the same reasoning pattern that caused the original failures.",
      "C": "Addresses how many attempts the agent gets, not the root cause: the loop is exiting on unverified self-assessment rather than a checked outcome, regardless of how many iterations are available.",
      "D": "LLM self-reported confidence is poorly calibrated - the agent was already confidently wrong when it judged its own fix would work without evidence, and a numeric score doesn't change what that judgment is based on."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.1-e0ef1c84",
    "scenarioType": "Claude Code for Continuous Integration"
  },
  {
    "taskStatement": "D1.1",
    "domain": "D1",
    "scenario": "Your automated fix-failing-tests reviewer runs a loop capped at 50 iterations: run the suite via Bash, read the failure, Edit the file, rerun. Auditing a week of runs, you find several hit the full 50-iteration cap on the same test, oscillating between the same two patches from iteration 10 onward - each fix breaks a different assertion, gets reverted, then reapplied - burning significant API spend with zero progress after iteration 10 until the cap terminates the run.",
    "question": "What is the most effective change to the design of this agentic loop?",
    "options": {
      "C": "Add a stagnation check that compares the error signature across consecutive iterations and terminates the loop early (e.g., escalating to a human) once the same failure repeats without new progress, rather than relying solely on the fixed iteration cap.",
      "A": "Raise the iteration cap from 50 to 100 so the agent has more attempts to converge on a fix, on the assumption that the oscillation between the two candidate patches will eventually resolve itself if the loop is simply allowed to run longer before giving up.",
      "D": "Switch the loop to a larger, more capable model so it is more likely to produce a correct fix on each attempt, reducing the chance that any single iteration produces a patch that reintroduces the failure the previous iteration had already resolved.",
      "B": "Add few-shot examples to the loop's prompt showing successful multi-step test-fix sequences, so the model has concrete patterns for what productive progress looks like and is more likely to choose a better edit on each individual iteration of the loop."
    },
    "correct": "C",
    "explanations": {
      "C": "Correct. The loop's actual defect is that its only termination condition is a raw iteration count, which cannot detect that the agent is oscillating between the same two states rather than making progress. A progress/stagnation check gives the loop a way to recognize and exit a non-productive cycle deterministically, which is the core design responsibility for an autonomous loop meant to run without supervision.",
      "A": "A higher cap does not address the oscillation - the agent would simply cycle between the same two states for longer, wasting more spend before termination.",
      "D": "A stronger model may reduce the odds of the oscillation occurring, but it does not fix the structural problem that the loop has no way to recognize non-progress and stop; the same failure mode remains possible.",
      "B": "Few-shot examples rely on probabilistic compliance and address the quality of individual fix attempts, not the loop's lack of a mechanism to detect that it is stuck and should stop or escalate."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.1-bd025aca",
    "scenarioType": "Claude Code for Continuous Integration"
  },
  {
    "taskStatement": "D1.1",
    "domain": "D1",
    "scenario": "In load testing, one agent's ETL-remediation loop is implemented as a single Claude call per failed job—one prompt, one tool call, no re-invocation—and logs show it calls query_job_metadata but generates its final remediation before that call's result is available to incorporate.",
    "question": "What is the most important structural change needed to make this agent capable of reliable autonomous task execution?",
    "options": {
      "B": "Implement an actual agentic loop: after each tool call, feed the tool result back to the model and let it continue reasoning and calling tools across multiple turns until the task is complete, rather than stopping after one turn.",
      "C": "Increase the context window so the entire failure history and all possible remediation options can be included in the single prompt, giving the model everything it might need upfront instead of discovering it through tool calls.",
      "D": "Add more detailed few-shot examples to the prompt showing correct diagnosis-then-remediation reasoning chains, so the model reproduces that whole sequence of steps inside its single response rather than stopping after the first tool call.",
      "A": "Switch to a larger, more capable model so it can infer the correct remediation from the initial context without needing tool results, relying on stronger reasoning to predict what the diagnostic command would most likely have returned."
    },
    "correct": "B",
    "explanations": {
      "B": "Correct. The defining property of an agentic loop is that tool results are returned to the model and incorporated into subsequent reasoning across multiple turns, continuing until the task is actually complete. Without this feedback loop, the agent cannot ground its final action in real tool output, which is precisely the failure observed.",
      "C": "A bigger context window does not solve the problem: the root cause is that tool results never re-enter the model's reasoning at all, not that there isn't room for more upfront information.",
      "D": "Few-shot examples only shape the model's response pattern within a single turn; they cannot make the model incorporate a tool result that the architecture never feeds back to it.",
      "A": "A larger model still cannot know the actual outcome of a tool call it hasn't seen - this misdiagnoses the issue as a capability problem rather than an architectural one."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.1-66ecfa50",
    "scenarioType": "Claude Code for Continuous Integration"
  },
  {
    "taskStatement": "D1.2",
    "domain": "D1",
    "scenario": "For a codebase-modernization run, the code-search subagent returns full file contents for every match of a deprecated API, and the test-runner subagent returns the entire raw test log including passing output; after a few files the coordinator's context fills up and it starts producing inconsistent refactor plans.",
    "question": "What is the most effective change to fix this problem?",
    "options": {
      "A": "Have the coordinator persist all raw subagent output, including full file contents and the complete test log, to an external memory store and reload it in full before each new decision.",
      "B": "Remove the coordinator and have the code-search subagent hand its matching files to the refactor subagent, which edits the call sites and passes the code to the test-runner subagent to run the suite.",
      "C": "Switch the coordinator to a model with a larger context window so it can hold the full file contents from the code-search subagent and the complete test log from the test-runner subagent for every file in the pipeline.",
      "D": "Have each subagent return a condensed, task-relevant summary of its findings (e.g., file paths and matched line ranges, or a list of failing tests with error messages) rather than its full raw tool output."
    },
    "correct": "D",
    "explanations": {
      "A": "Persisting and reloading full raw outputs still forces the coordinator to process the same context-heavy data at decision time; writing file contents and test logs to an external store and pulling them back in full doesn't reduce what the coordinator has to reason over.",
      "B": "Removes the coordination layer entirely, eliminating the central agent that tracks overall progress and maintains a consistent plan as findings, edits, and test results pass from subagent to subagent - this would make inconsistent planning worse, not better.",
      "C": "Treats the symptom, not the cause. Holding the full raw file contents and complete raw test logs for every file processed will eventually exhaust even a larger context window as the codebase modernization proceeds - it only delays the failure.",
      "D": "Correct. A core benefit of the coordinator-subagent pattern is that each subagent isolates context-heavy work and returns only the distilled, decision-relevant result to the coordinator. Returning condensed findings instead of raw tool output is what keeps the coordinator's context focused on synthesis and cross-subagent tracking, directly addressing the root cause of the context exhaustion and inconsistent planning."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.2-ba1e8cc3",
    "scenarioType": "Multi-Agent Research System"
  },
  {
    "taskStatement": "D1.2",
    "domain": "D1",
    "scenario": "The coordinator delegates each 40-page contract to clause-extraction first, then risk-analysis, then redline-drafting, waiting for each subagent to fully complete before invoking the next, so a single contract takes 4-5 minutes end-to-end even though the subagents partly operate on independent sections of the contract.",
    "question": "The team profiles the pipeline and confirms that risk-analysis on standard boilerplate sections does not depend on clause-extraction's output, while risk-analysis on custom negotiated terms does. What is the most effective change to the coordinator's orchestration pattern?",
    "options": {
      "A": "Have the coordinator dispatch all three subagents concurrently at the start of every contract, sending each subagent the full 40-page contract as input and having the coordinator merge their three completed outputs together before finalizing the review.",
      "B": "Keep the strict sequential pipeline order intact — clause-extraction, then risk-analysis, then redline-drafting — but shorten each subagent's system prompt and trim its instructions and examples so each of the three steps completes faster.",
      "C": "Have the coordinator split the contract by section type, dispatching clause-extraction and boilerplate risk-analysis concurrently at the start, then running negotiated-terms risk-analysis and redline-drafting once their actual input dependencies are satisfied.",
      "D": "Merge all three subagents into a single agent with one combined system prompt covering clause-extraction, risk-analysis, and redline-drafting instructions, having it read the full 40-page contract once and produce extraction results, risk findings, and redlines together in one pass."
    },
    "correct": "C",
    "explanations": {
      "A": "Ignores the confirmed dependency: negotiated-terms risk-analysis and redline-drafting need clause-extraction's output, so dispatching all three concurrently and only merging outputs afterward would feed them stale or missing input and produce incorrect results.",
      "B": "Treats the symptom (slow steps) rather than the cause (unnecessary sequencing of independent work): keeping the same three-step waterfall order and merely trimming each prompt still forces boilerplate risk-analysis to wait on clause-extraction needlessly, and risks degrading each subagent's output quality by cutting its instructions and examples.",
      "C": "Correct. This restructures the orchestration around the true data dependencies: work that doesn't depend on another subagent's output runs concurrently, while work that genuinely depends on prior output still waits for it. This cuts latency without changing what any subagent produces.",
      "D": "Collapsing distinct responsibilities into one agent trades a latency problem for a separation-of-concerns problem: having a single agent read the contract once and produce extraction, risk analysis, and drafting together does not address the actual bottleneck (unnecessary sequential waiting), since the negotiated-terms-analysis and drafting portions of that single pass would still depend on the extraction portion finishing first."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.2-a1dc0727",
    "scenarioType": "Structured Data Extraction"
  },
  {
    "taskStatement": "D1.2",
    "domain": "D1",
    "scenario": "Production logs show the coordinator agent invokes the billing agent and technical-troubleshooting agent sequentially even for mixed tickets, roughly doubling response latency for these tickets during the launch traffic spike.",
    "question": "What is the most effective change to reduce latency for tickets that require multiple independent subagents, without compromising reliability?",
    "options": {
      "A": "Modify the coordinator to detect when a ticket requires multiple independent subagents and invoke those subagents concurrently, then synthesize their results once all have returned.",
      "B": "Merge the billing and technical-troubleshooting agents into a single subagent with a combined toolset covering billing records and diagnostic checks, handling mixed tickets in one invocation.",
      "C": "Give the billing agent direct access to the technical-troubleshooting agent's tools, letting it call diagnostic and sync-repair functions itself and return one combined result straight to the coordinator.",
      "D": "Add few-shot examples to the coordinator's prompt showing it producing a single fast, combined reply that addresses both the billing and technical parts of a mixed ticket in one pass."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. When the required subtasks are independent of each other, the coordinator can dispatch them in parallel instead of sequentially, cutting latency while preserving each subagent's scoped tools and the coordinator's role of synthesizing the final response.",
      "B": "Merging agents so one subagent's toolset covers both billing records and diagnostic checks collapses the scoped-tool separation that keeps each subagent's responsibilities and permissions narrow, trading a sequencing problem for a broader-permission, harder-to-maintain agent.",
      "C": "Letting the billing agent call the technical agent's diagnostic and sync-repair functions directly bypasses the coordinator, breaking separation of concerns and removing the coordinator's ability to reliably synthesize and reconcile results from multiple domains.",
      "D": "Few-shot examples only influence the model's probabilistic behavior around phrasing and reasoning; showing the coordinator producing a single fast combined reply in examples cannot make its underlying sequential tool invocations actually execute faster or concurrently."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.2-be12c694",
    "scenarioType": "Customer Support Resolution Agent"
  },
  {
    "taskStatement": "D1.2",
    "domain": "D1",
    "scenario": "You dispatch the web-search, document-analysis, synthesis, and report-generation subagents in parallel for a single research run, instructing each to \"report everything you find\" back to you directly. By the time all four finish, your context is nearly exhausted with their raw output, and the final report you produce is noticeably shallow, omitting details clearly present in what the subagents returned.",
    "question": "What change to the coordinator-subagent pattern would most effectively fix this problem?",
    "options": {
      "A": "Have each subagent write its complete raw findings, full file contents and unfiltered grep results, to a shared file, then have the coordinator read all four files before drafting the migration plan.",
      "B": "Switch from parallel to sequential subagent execution, running the frontend, backend, database, and infrastructure subagents one after another, so the coordinator holds one subagent's raw output at a time.",
      "C": "Remove the subagents and have the coordinator itself perform the frontend inventory, backend route mapping, schema documentation, and infrastructure review, running each exploration step directly.",
      "D": "Instruct each subagent to return a concise, structured summary of its key findings rather than raw output, so the coordinator's context is used for synthesis rather than storing unprocessed data."
    },
    "correct": "D",
    "explanations": {
      "A": "Writing the raw findings, full file contents and unfiltered grep results, to a shared file and then having the coordinator read all four files back still floods the coordinator's context with unprocessed data; it just delays when the bloat occurs rather than fixing it.",
      "B": "Running the frontend, backend, database, and infrastructure subagents one after another reduces how many subagents run at once but does not reduce the total volume of raw data eventually loaded into the coordinator's context - the same unfiltered output for each area still accumulates by the end.",
      "C": "Having the coordinator perform the frontend inventory, backend route mapping, schema documentation, and infrastructure review itself eliminates the context problem by eliminating the coordinator-subagent pattern entirely, discarding the parallelization and separation-of-concerns benefits subagents provide instead of fixing how they report back.",
      "D": "Correct. The root cause is that subagents are dumping unprocessed data into the coordinator's context. Having each subagent condense its findings into a structured summary before returning preserves the coordinator's limited context for the synthesis work it actually needs to do, which is the core value of the coordinator-subagent pattern."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.2-ae1433a1",
    "scenarioType": "Multi-Agent Research System"
  },
  {
    "taskStatement": "D1.3",
    "domain": "D1",
    "scenario": "As reports scale to 8-10 subtopics like \"market sizing,\" \"competitive landscape,\" and \"regulatory risk,\" you have the coordinator spawn a separate subagent per subtopic, each receiving the coordinator's full conversation history including earlier subagents' outputs; later subagents run noticeably slower and pricier, occasionally echoing unrelated earlier subtopics.",
    "question": "What change to subagent invocation would most directly fix this problem?",
    "options": {
      "B": "Pass each subagent only the specific task description and inputs it needs for its own subtopic, rather than the coordinator's full conversation history.",
      "A": "Keep passing the full conversation history, but instruct each subagent's system prompt to ignore content unrelated to its assigned subtopic.",
      "C": "Have all subagents share one persistent session so state accumulates once instead of being recomputed per spawn.",
      "D": "Keep the full history but raise each subagent's max output tokens so it has more room to produce a focused answer."
    },
    "correct": "B",
    "explanations": {
      "B": "Correct. Subagents should be spawned with context scoped to their own task. Passing only the relevant task description and inputs keeps each invocation fast, cheap, and focused, and prevents unrelated prior findings from bleeding into its output.",
      "A": "Relies on probabilistic instruction-following to filter irrelevant context rather than removing it at the source, so drift and cost overhead both persist.",
      "C": "A shared persistent session across subagents defeats the purpose of isolated, parallel spawning and would compound the same context-bloat and cross-contamination problem rather than fixing it.",
      "D": "Increasing output tokens addresses response length, not the root cause, which is an oversized and irrelevant input context being passed at spawn time."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.3-4eb717c7",
    "scenarioType": "Multi-Agent Research System"
  },
  {
    "taskStatement": "D1.3",
    "domain": "D1",
    "scenario": "The lead agent triages incoming bug reports by spawning a fresh reproduction subagent per report, scoped to Bash/Read/Grep with no memory of prior turns, then copying its entire raw transcript into a second fix-writing subagent's prompt — inflating tokens and dragging in discarded exploratory dead-ends.",
    "question": "What is the most effective way to pass context from the reproduction subagent to the fix-writing subagent?",
    "options": {
      "A": "Give both subagents access to the same shared conversation history by configuring the lead agent to launch the fix-writing subagent inside the reproduction subagent's existing session, so it can read the full transcript directly, including every file opened and command run during the search.",
      "B": "Have the lead agent instruct the reproduction subagent to return a concise, structured summary (root cause, affected files, repro steps) as its final output, and pass only that summary into the fix-writing subagent's prompt.",
      "C": "Merge both steps into a single subagent invocation, combining the Bash/Read/Grep reproduction toolset and the fix-writing step into one Claude call that reproduces the bug and drafts the patch within the same context window, so no context ever needs to be passed between subagents.",
      "D": "Have the lead agent forward the full raw transcript every time, capturing every tool call, file read, and command output the reproduction subagent produced verbatim, and pasting that complete history into the fix-writing subagent's prompt so it has all available detail."
    },
    "correct": "B",
    "explanations": {
      "A": "Subagents are designed to run with isolated context, not shared conversation history; keeping both subagents in the same session so one can read the other's full transcript reintroduces the token bloat and irrelevant exploratory detail the team is trying to eliminate.",
      "B": "Correct. Subagents run in isolated context windows and communicate with the orchestrator only through their final output. Directing the subagent to distill its work into a compact, structured result and forwarding just that summary keeps each invocation's context clean while preserving the essential findings needed downstream.",
      "C": "Collapsing the two roles into one call that both reproduces the bug and drafts the patch removes the benefit of a fresh, scoped context for each task and doesn't address the underlying question of how to hand off findings between agent invocations; it also loses the isolation and separation of concerns the two-subagent design was providing.",
      "D": "This is the current, problematic approach - capturing and pasting the reproduction subagent's entire verbatim tool history into the fix-writing subagent's prompt inflates token usage and carries forward irrelevant dead-ends instead of the essential findings, which is exactly the issue engineering wants fixed."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.3-5a3594c5",
    "scenarioType": "Developer Productivity with Claude"
  },
  {
    "taskStatement": "D1.3",
    "domain": "D1",
    "scenario": "The coordinator spawns one subagent per file in the legacy codebase with the sole instruction \"Write unit tests for this file\" plus the file path. Across the run, most of the resulting test files use the wrong mocking library, don't follow the project's file-naming pattern, and include integration-style tests — all conventions the coordinator itself had already settled on earlier in the conversation.",
    "question": "Why are the subagents producing tests that ignore these conventions, and what is the correct fix?",
    "options": {
      "D": "Subagents run in their own isolated context and do not automatically inherit the coordinator's conversation history; the fix is to explicitly include the relevant conventions and decisions in each subagent's invocation prompt.",
      "B": "The subagents' context window is too small to hold the conventions; the fix is to configure a larger context window for each subagent.",
      "C": "There is a shared-memory setting that automatically propagates the full parent conversation to subagents; the fix is to enable it so every subagent sees everything the coordinator has discussed.",
      "A": "The subagents lack a system prompt; the fix is to have the coordinator replay the entire conversation transcript as part of each subagent's prompt to guarantee full alignment."
    },
    "correct": "D",
    "explanations": {
      "D": "Correct. Subagents are spawned with isolated context and only receive what is explicitly passed to them at invocation. Since the coordinator's per-file prompt never included the conventions, the subagents had no way to know about them; the fix is to pass the specific, relevant context each subagent actually needs.",
      "B": "Misdiagnoses the problem as a capacity limit rather than a context-passing gap - the conventions were never sent to the subagent at all, so window size is irrelevant.",
      "C": "No such automatic full-conversation propagation mechanism exists between coordinator and subagent; context passing must be done explicitly by the coordinator, not assumed to happen implicitly.",
      "A": "Over-provisions each subagent with the entire transcript, adding unnecessary token overhead and irrelevant information when only a few specific conventions actually need to be passed."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.3-801e8326",
    "scenarioType": "Developer Productivity with Claude"
  },
  {
    "taskStatement": "D1.3",
    "domain": "D1",
    "scenario": "Reviewing a session log, you see the developer's main-thread turns identify the double-discount bug in InvoiceCalculator.compute() and confirm the fix belongs in discount_engine.py, then spawn a subagent via the Task tool with only \"Fix the bug we just found and add a regression test.\" The subagent's transcript shows it immediately asking which file and what bug, then issuing fresh Grep/Glob calls across the whole repo before finding discount_engine.py.",
    "question": "What is the root cause of the subagent's behavior, and what should the developer do differently?",
    "options": {
      "A": "The subagent was spawned via the Task tool without the Read and Grep tools enabled in its configuration; the developer should explicitly grant Read, Grep, and Glob access when invoking the Task tool so the subagent can search file contents and directory listings to locate discount_engine.py.",
      "B": "Subagents start with a fresh, isolated context window and have no access to the parent conversation's history; the invoking prompt must explicitly carry over the necessary context, such as the file path, the specific bug description, and the intended fix location.",
      "C": "The Task tool routed the prompt to a general-purpose subagent type; the developer should specify a custom subagent type configured with a domain-specific system prompt covering the billing module and discount logic when invoking the Task tool for this refactor.",
      "D": "The main conversation's context window had filled up, silently dropping the earlier exploration turns; the developer should compact the conversation and re-run the discovery steps so the discount_engine.py findings are captured fresh before spawning the subagent."
    },
    "correct": "B",
    "explanations": {
      "A": "Tool availability isn't the issue here — the subagent successfully used its tools (Read, Grep, Glob) to re-explore the repository from scratch; the problem is that it had no starting context telling it where to look or what the bug was, not a missing tool grant.",
      "B": "Correct. Subagent invocation spawns a new, isolated context — it does not automatically inherit the parent conversation's history. Context must be explicitly passed in the invocation prompt (relevant file paths, findings, and the exact task) for the subagent to act without re-deriving what the main thread already knows.",
      "C": "The subagent's confusion is fully explained by missing context in the prompt, not by which subagent type handled it; even a subagent configured with a billing-domain system prompt would still need to be told which file and which bug, since 'the bug we just found' carries no information outside the parent conversation.",
      "D": "There is no evidence the parent context window was full, and even if it were, the described symptom (subagent asking for basic clarification, then re-exploring the whole repo) is explained directly by context isolation between parent and subagent, not by dropped history within the main thread."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.3-d9e4aea9",
    "scenarioType": "Developer Productivity with Claude"
  },
  {
    "taskStatement": "D1.4",
    "domain": "D1",
    "scenario": "Here, the \"fix\" agent patches failing unit tests, then a separate \"deploy\" agent pushes to staging; the orchestrator decides whether to invoke deploy by parsing the fix agent's final summary for a phrase like \"all tests pass.\" In 8% of runs, deploy was invoked even though the suite exited nonzero, because the fix agent had read truncated log output and written a summary falsely claiming success.",
    "question": "What is the most effective way to correct the handoff between the fix agent and the deploy agent?",
    "options": {
      "A": "Have the deploy agent send the fix agent a follow-up prompt asking it to re-check the test logs line by line and explicitly restate, in its own words, whether every test passed before the orchestrator triggers the deployment step.",
      "B": "Add a set of few-shot examples to the fix agent's system prompt showing precisely worded pass/fail summaries, including exact phrasing like 'all tests pass' versus failure language, so its natural-language reports become standardized.",
      "C": "Update the fix agent's system prompt to instruct it to open the full, untruncated test output, count the reported pass and fail totals itself, and only include a success phrase once it has verified those totals directly.",
      "D": "Have the orchestrator programmatically re-run the test suite and check its exit code or structured test report directly, gating the deploy agent invocation on that result rather than on the fix agent's summary text."
    },
    "correct": "D",
    "explanations": {
      "A": "Asking the fix agent to re-check its own logs and restate its conclusion still routes the decision through the same probabilistic natural-language reporting step that produced the wrong summary in the first place - it does not introduce an independent, verifiable check.",
      "B": "Few-shot examples of correctly worded summaries may make the fix agent's phrasing more consistent on average, but the agent is still generating a natural-language claim about test results from logs it may have read incorrectly - this cannot guarantee correctness in every case, which is required when an incorrect handoff leads to deploying broken code to staging.",
      "C": "Instructing the fix agent to count pass/fail totals itself before summarizing still relies on the fix agent correctly self-reporting in natural language, which is exactly the probabilistic mechanism that already failed - a clearer instruction does not guarantee correct behavior on truncated or ambiguous logs.",
      "D": "Correct. The handoff decision has real consequences (deploying broken code), so it should rely on a programmatic, deterministic check of the actual test result rather than an LLM-generated summary. This is the enforcement pattern: gate the next step on verifiable system state, not on probabilistic natural-language compliance."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.4-a73bbd3b",
    "scenarioType": "Claude Code for Continuous Integration"
  },
  {
    "taskStatement": "D1.4",
    "domain": "D1",
    "scenario": "Repurposed for a loan-application pipeline, the coordinator hands off between an intake agent (extracts applicant data), a verification agent (checks identity/credit via a bureau API), and an approval agent, with system-prompt-specified sequential order. An audit finds that in roughly 8% of applications, the coordinator hands intake data directly to the approval agent, skipping verification, with no error in the logs.",
    "question": "What change would most effectively prevent this failure from recurring?",
    "options": {
      "B": "Add a programmatic gate so the approval agent cannot be invoked unless it receives a verification result object (e.g., a verified credit-check token) produced by the verification agent, with the orchestration layer blocking the handoff if that input is missing.",
      "C": "Strengthen the orchestrator's system prompt with more explicit, emphatic language mandating that verification must always precede approval, restating the compliance requirement and the financial consequences of approving an unverified applicant.",
      "D": "Add additional few-shot examples to the orchestrator's prompt demonstrating the correct intake-verification-approval handoff sequence, covering both the standard path and cases where an applicant's credit record is already partially populated.",
      "A": "Implement a routing classifier that inspects each incoming application and selects which agent should handle it first, so that in the normal case applications are directed to the verification agent before they ever reach the approval agent."
    },
    "correct": "B",
    "explanations": {
      "B": "Correct. Because the verification step is a hard compliance requirement, deterministic guarantees are needed. A programmatic gate that requires proof of verification before approval can run enforces the sequence structurally, rather than relying on the orchestrator choosing to comply.",
      "C": "Still relies on probabilistic LLM compliance with prompt instructions - the original prompt already stated the required order explicitly, and that was insufficient to prevent the skip.",
      "D": "Few-shot examples also rely on probabilistic compliance; they raise the likelihood of correct sequencing but cannot guarantee it, which is inadequate when a missed credit check carries financial and compliance risk.",
      "A": "Addresses which agent handles a request, not the enforcement of a required sequence between agents - it does not prevent approval from being reached without verification."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.4-1c2cb7bd",
    "scenarioType": "Multi-Agent Research System"
  },
  {
    "taskStatement": "D1.4",
    "domain": "D1",
    "scenario": "The underwriting subagent is given the same policy in its system prompt: pause and wait for human approval before calling disburse_funds when its recommended loan amount exceeds $50,000. Post-launch auditing of the multi-agent system finds that in 9% of large-loan cases, the underwriting agent invoked disburse_funds immediately after generating its recommendation, without any human ever reviewing the case.",
    "question": "What change would most reliably close this gap between policy and actual behavior?",
    "options": {
      "C": "Make disburse_funds programmatically unavailable for loans above $50,000 until a separate, verified human-approval signal has been recorded for that case, so the agent has no code path to invoke it without that handoff.",
      "D": "Rewrite the system prompt instruction in stronger, more explicit language (e.g., \"You must never call disburse_funds above $50,000 without approval - this is a strict requirement\") to increase compliance.",
      "B": "Add several few-shot examples to the prompt showing the agent correctly pausing and requesting human approval on large-loan cases before proceeding.",
      "A": "Have the underwriting agent self-report a confidence score for its recommendation and only pause for human review when confidence falls below a set threshold."
    },
    "correct": "C",
    "explanations": {
      "C": "Correct. A mandatory human handoff before a high-stakes, hard-to-reverse action needs to be enforced programmatically - by removing the agent's ability to call disburse_funds until an external, verified approval signal exists for that case - rather than left to the model's judgment. This gives a deterministic guarantee instead of a probabilistic one.",
      "D": "Stronger wording still relies on the model choosing to comply every time; it does not change the fact that the agent retains the technical ability to call disburse_funds without approval, so the same failure mode can recur.",
      "B": "Few-shot examples raise the odds of correct pausing behavior but remain probabilistic compliance - insufficient when an unauthorized large disbursement is the failure mode being prevented.",
      "A": "Misapplies a confidence-based escalation pattern to a problem that isn't about the model's uncertainty - the policy requires human sign-off on ALL large loans regardless of how confident the agent is in its recommendation, so a confidence threshold would still let confidently-wrong or confidently-right large loans bypass required human review."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.4-b94ecaa9",
    "scenarioType": "Multi-Agent Research System"
  },
  {
    "taskStatement": "D1.4",
    "domain": "D1",
    "scenario": "You repurpose the pipeline for insurance claims: the intake agent extracts claim data, the validation agent checks policy rules, and the payout agent issues approvals only after validation returns \"status: approved.\" Traces show a nonzero fraction of runs where intake forwards a claim after a timeout, and the payout agent fires even though validation's output reads \"status: pending_review,\" with orchestration relying only on the payout agent's system prompt to catch this.",
    "question": "What is the most effective change to prevent unapproved claims from reaching the payout agent?",
    "options": {
      "A": "Update the intake agent's system prompt to withhold forwarding until it detects an explicit validation-complete marker, adding a check step before passing the claim along.",
      "B": "Add a programmatic gate in the orchestration layer that checks the validation agent's status field and blocks invocation of the payout agent unless it equals \"approved\".",
      "C": "Strengthen the payout agent's system prompt with more explicit, emphatic wording instructing it to parse the status field and confirm the value is exactly \"approved\" before acting.",
      "D": "Add few-shot examples to the payout agent's prompt demonstrating refusal whenever the status field reads \"pending_review\", reinforcing recognition of that value."
    },
    "correct": "B",
    "explanations": {
      "A": "Addresses only one failure path (the intake agent forwarding early) and still depends on the intake agent's probabilistic compliance with a prompt instruction to detect and check for a completion marker; it does not add a deterministic check at the actual handoff point between validation and payout.",
      "B": "Correct. This handoff is a critical business-logic checkpoint with financial consequences. A programmatic check in the orchestration layer that inspects the status field and blocks the handoff unless it is exactly \"approved\" gives a deterministic guarantee, unlike relying on any agent's prompt-based judgment.",
      "C": "Relies on probabilistic LLM compliance - the payout agent already had an instruction to verify status and it still proceeded incorrectly in some runs; more explicit and emphatic wording asking it to parse and confirm the field only raises the odds of correct behavior, it does not eliminate the failure.",
      "D": "Few-shot examples also rely on probabilistic compliance; demonstrating the refusal pattern can improve the payout agent's behavior on similar inputs but cannot guarantee the handoff is blocked when money is at stake."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.4-71eb367f",
    "scenarioType": "Multi-Agent Research System"
  },
  {
    "taskStatement": "D1.5",
    "domain": "D1",
    "scenario": "Reviewing the accounting integration logs, you find that this month's submit_to_accounting calls for scanned vendor invoices show invoice_date arriving in whatever format appeared on the source document — MM/DD/YYYY, DD-MM-YYYY, or written dates like \"March 3, 2026\" — and 20% of these submissions either fail the downstream system's strict ISO 8601 validation or silently post an ambiguous date like 03/04/2026 under the wrong calendar date.",
    "question": "What is the most effective way to guarantee this?",
    "options": {
      "A": "Update the system prompt with explicit instructions and a worked example showing how MM/DD/YYYY, DD-MM-YYYY, and written dates like March 3, 2026 should each be converted to ISO 8601 before the model calls submit_to_accounting.",
      "B": "Add several few-shot examples to the prompt demonstrating correct ISO 8601 conversion from ambiguous source formats such as 03/04/2026, plus a reminder to double-check the converted date before calling submit_to_accounting.",
      "C": "Register a PostToolUse hook on submit_to_accounting that parses the submitted payload, logs any invoice_date that is not valid ISO 8601 against the schema, and flags those entries in a queue for a human reviewer to correct afterward.",
      "D": "Register a PreToolUse hook on submit_to_accounting that parses and normalizes the invoice_date field to ISO 8601 and validates the full payload against a JSON schema, blocking the call if normalization or validation fails."
    },
    "correct": "D",
    "explanations": {
      "A": "Relies on probabilistic LLM compliance with formatting instructions; the same ambiguity in source documents (MM/DD/YYYY vs DD-MM-YYYY vs written dates) that causes today's 20% failure rate will continue to cause misformatted or misread dates no matter how explicit or well-illustrated the instructions are.",
      "B": "Few-shot examples covering more source formats raise the odds of correct formatting but cannot guarantee it, which is insufficient when a wrong calendar date can silently post to accounting.",
      "C": "A PostToolUse hook runs after the tool call has already executed, so even with payload parsing and schema logging in place, the bad payload has already reached the downstream accounting system by the time it's flagged for human review - this catches problems after the fact rather than preventing them.",
      "D": "Correct. A PreToolUse hook intercepts the tool call before it executes, so date normalization and schema validation can be applied deterministically and the call can be blocked outright if the data doesn't conform - a programmatic guarantee rather than reliance on the model's behavior."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.5-77e05840",
    "scenarioType": "Structured Data Extraction"
  },
  {
    "taskStatement": "D1.5",
    "domain": "D1",
    "scenario": "Your extraction agent calls an MCP tool, fetch_vendor_record, to pull invoice data from twelve vendor procurement systems, each returning dates and currency in different raw formats (e.g., \"03/14/2026\" vs \"14-03-2026\"; \"$1,204.50\" vs \"1204.5 USD\"). Post-deployment validation shows 18% of records still have malformed ISO 8601 dates or non-integer-cent currency, concentrated in ambiguous formats like \"03/04/2026\" where the agent guesses month-first vs day-first inconsistently.",
    "question": "What is the most effective way to fix the normalization failures?",
    "options": {
      "A": "Instruct the agent to validate its extracted output against the JSON schema, checking that each date matches the ISO 8601 pattern and each currency value is an integer, and self-correct any malformed fields before finalizing the record.",
      "B": "Add a separate normalize_data tool that accepts each field's raw date and currency string, parses them per the twelve known vendor formats, and update the system prompt so the agent always invokes this tool before finalizing a record.",
      "C": "Expand the system prompt with detailed few-shot examples showing the exact raw input and the expected ISO 8601 date and integer-cent output for each of the twelve vendors' specific formats, including examples of the ambiguous month-first and day-first date patterns.",
      "D": "Implement a PostToolUse hook on fetch_vendor_record that programmatically parses each vendor's known date and currency format and rewrites the tool result into ISO 8601 dates and integer cents before the data ever reaches the agent's context."
    },
    "correct": "D",
    "explanations": {
      "A": "Self-review is still performed by the same probabilistic model that made the original normalization error, and a malformed date or currency value can easily still look well-formed to the agent, so this does not provide a reliable fix.",
      "B": "This introduces a second point of probabilistic failure: the agent must remember to call the normalization tool and must correctly pass the right raw values to it. Nothing prevents the agent from skipping the call or invoking it on the wrong field, so the 18% error rate is unlikely to be resolved.",
      "C": "Still relies on probabilistic LLM compliance. More examples may reduce the error rate somewhat but cannot guarantee correct handling of every ambiguous format, especially truly ambiguous cases like \"03/04/2026\" where no amount of prompting resolves the underlying ambiguity without knowing the source vendor.",
      "D": "Correct. Since each vendor's raw format is known in advance, the normalization logic is deterministic and can be enforced programmatically. A PostToolUse hook intercepts the tool call result and rewrites it before the agent ever reasons over it, eliminating the ambiguity the LLM was guessing at (e.g., month-first vs day-first) rather than hoping the model applies the rule correctly every time."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.5-cc1a9e10",
    "scenarioType": "Structured Data Extraction"
  },
  {
    "taskStatement": "D1.5",
    "domain": "D1",
    "scenario": "Reviewing submit_invoice_record calls for scanned invoices, you find that the invoice_date field arrives as \"03/14/2026\", \"March 14, 2026\", or \"14-03-2026\" depending on the source document, and roughly 8% of submissions silently fail the downstream database's strict ISO 8601 (YYYY-MM-DD) constraint and get dropped from the accounts-payable queue, even though the model's own reasoning about the date is correct.",
    "question": "What is the most effective way to eliminate these downstream failures?",
    "options": {
      "A": "Update the system prompt to explicitly instruct the model to always format dates as YYYY-MM-DD before calling submit_invoice_record, adding a formatting rule with an example conversion and a reminder to double-check the invoice_date field against the ISO 8601 pattern before submission.",
      "B": "Lower the model's temperature setting so its date formatting becomes more consistent across invoices, reducing sampling randomness in the generation step and applying that same reduced-temperature setting uniformly across every submit_invoice_record tool call the pipeline makes.",
      "C": "Add several few-shot examples to the prompt showing invoices with varied date formats like MM/DD/YYYY, written month names, and DD-MM-YYYY all being converted to YYYY-MM-DD in the tool call, demonstrating the conversion pattern across a range of source document date styles.",
      "D": "Register a hook that intercepts the submit_invoice_record tool call and deterministically parses/reformats the invoice_date field to ISO 8601 (or blocks the call with a corrective error) before it reaches the database."
    },
    "correct": "D",
    "explanations": {
      "A": "Relies on probabilistic LLM compliance. The model isn't reasoning incorrectly about the date's meaning, it's just inconsistent in output formatting, and restating the instruction (even with an added example and a self-check reminder) doesn't eliminate that inconsistency, since the model still has no deterministic mechanism enforcing the pattern.",
      "B": "Temperature affects sampling randomness in general text generation but does not provide a deterministic guarantee on structured field formatting. Applying a lower, uniform temperature setting across every tool call may nudge outputs toward more typical phrasings, but it does not address the root cause of inconsistent date normalization.",
      "C": "Few-shot examples covering multiple source date styles raise the odds of correct formatting by giving the model more patterns to imitate, but the model is still generating the reformatted date from learned patterns rather than a fixed procedure, which remains insufficient when malformed data breaks a strict downstream schema constraint.",
      "D": "Correct. A tool-call hook intercepts the call before it executes and can programmatically normalize or validate the data, giving a deterministic guarantee that malformed dates never reach the database - something prompt-based instructions cannot guarantee."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.5-8fe81b92",
    "scenarioType": "Structured Data Extraction"
  },
  {
    "taskStatement": "D1.6",
    "domain": "D1",
    "scenario": "You repurpose this pipeline for quarterly vendor contract renewals: one agent must review the terms sheet, redline history, and compliance checklist and produce a renewal recommendation. Testing shows output quality swings run to run - sometimes redline history gets skimmed, sometimes the compliance checklist does - and known compliance red flags in the checklist are occasionally missed entirely.",
    "question": "What is the most effective task decomposition strategy for this workflow?",
    "options": {
      "A": "Rewrite the single instruction into a longer, more detailed prompt that explicitly lists all three review areas—compliance checklist, redline history, and terms sheet—with guidance for each, while still asking one agent to produce the full recommendation in a single pass.",
      "B": "Keep the single-agent design but increase the model's output token budget and reasoning space, giving it more room to work through the compliance checklist, redline history, and terms sheet in sequence before producing its final recommendation in one continuous pass.",
      "C": "Decompose the work into discrete subtasks - compliance checklist review, redline history analysis, and terms extraction - each with a clearly scoped objective, then combine their outputs in a final synthesis step that produces the recommendation.",
      "D": "Run the same single, undecomposed instruction three times in parallel, each pass covering compliance, redline history, and terms sheet review together, then have a fourth agent compare the three full recommendations and select the one that looks most complete."
    },
    "correct": "C",
    "explanations": {
      "A": "A longer single-pass prompt still asks one agent to juggle three distinct review concerns simultaneously, even when the prompt spells out each area and offers guidance for it; it does not create the scoped, separable subtasks needed for consistent depth across all three areas.",
      "B": "A larger token and reasoning budget does not address the root cause - the task still bundles unrelated review concerns (compliance, redline, terms) into one instruction, causing inconsistent attention across runs regardless of how much space the model has to work through them.",
      "C": "Correct. Decomposing the broad, multi-concern task into discrete, well-scoped subtasks prevents attention dilution across dissimilar review areas and ensures each area receives focused effort, with a dedicated synthesis step combining results into a coherent recommendation.",
      "D": "Running the identical undecomposed instruction multiple times in parallel, even with a comparison step at the end, does not fix the underlying decomposition problem - each run still suffers from the same attention dilution across compliance, redline, and terms review, so the best of three flawed outputs is still unreliable."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.6-1d1f89c0",
    "scenarioType": "Multi-Agent Research System"
  },
  {
    "taskStatement": "D1.6",
    "domain": "D1",
    "scenario": "For a quarterly competitive analysis run, the coordinator's system prompt fixes a three-step pipeline per competitor - \"gather pricing data,\" \"gather feature data,\" \"write the report\" - but some competitors have just launched new products or had executive changes, and the coordinator cannot add subtasks once a run starts.",
    "question": "What change to the task decomposition strategy would most effectively address this problem?",
    "options": {
      "A": "Have the coordinator first assess each competitor's available signals and dynamically generate the set of subtasks needed for that specific competitor, rather than always running the same fixed three-step pipeline.",
      "C": "Add a fourth fixed subtask, \"check for major recent news,\" to the pipeline so every competitor is evaluated for product launches and leadership changes.",
      "D": "Instruct the report-writing subagent to note in the final report when pricing or feature data seems incomplete, so gaps are flagged to the reader.",
      "B": "Run all possible subtasks - pricing, features, product-launch analysis, and leadership analysis - for every competitor in parallel to guarantee no relevant analysis is ever missed."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. The right decomposition depends on characteristics of each competitor that aren't known in advance, so the coordinator should assess the input and adaptively generate the subtask set per case rather than apply one static plan to every input.",
      "C": "Still a fixed decomposition - it adds one more always-run subtask instead of tailoring the subtask set to what each competitor actually needs, so simple competitors still run unnecessary work and the underlying rigidity remains.",
      "D": "Addresses the symptom (incomplete-looking output) after the fact rather than the root cause, which is that the decomposition never generated the needed subtasks in the first place.",
      "B": "Avoids missing relevant analysis but at the cost of running irrelevant subtasks for every competitor, which is the same waste problem the scenario describes, just applied universally instead of solved."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.6-0b615ff3",
    "scenarioType": "Multi-Agent Research System"
  },
  {
    "taskStatement": "D1.6",
    "domain": "D1",
    "scenario": "Your team's first attempt at migrating the 300-file legacy-ORM codebase spawned one subagent per file, all in parallel with a shared prompt; leaf files imported from base classes mid-migration, mixing old and new ORM APIs, and several subagents made conflicting edits to the same shared base class file at once.",
    "question": "What task decomposition strategy would best resolve this failure?",
    "options": {
      "A": "Split the 300 files into 10 equal-sized alphabetical batches of 30 files each, assigning one subagent per batch to run in parallel, with each subagent updating the imports, base class references, and ORM method calls across its own batch of files.",
      "B": "Keep one subagent per file, but add a shared system prompt instructing every subagent to first check whether the base classes have already been migrated, then proceed to update its assigned file's imports and ORM method calls to match the new API.",
      "C": "Abandon decomposition entirely and have a single agent process all 300 files sequentially in one long-running session, migrating each file's imports, base class references, and ORM method calls one at a time before moving to the next file.",
      "D": "Decompose along the codebase's dependency structure: migrate the shared base classes first in a sequential (or single-owner) step, then fan out the independent leaf files to parallel subagents once the base classes are stable."
    },
    "correct": "D",
    "explanations": {
      "A": "Batches by an arbitrary criterion (alphabetical order) that ignores the codebase's actual dependency boundaries, so shared base classes can still end up split across batches or edited concurrently by different subagents even though each subagent is diligently updating imports and ORM calls within its own batch.",
      "B": "Relies on probabilistic prompt compliance to enforce an ordering constraint across many concurrently running subagents - having each subagent check base-class status before updating its own file's imports and ORM calls does not prevent the race condition on the shared base class file and does not guarantee the check happens at the right moment relative to other subagents.",
      "C": "Discards decomposition altogether, sacrificing the parallelism available for the genuinely independent leaf files and making the migration far slower than necessary, since every file's imports, base class references, and ORM calls must be updated one at a time by a single agent; the problem was the decomposition strategy, not the presence of parallelism itself.",
      "D": "Correct. Sound decomposition follows the workflow's actual dependency structure rather than an arbitrary split: components with shared, load-bearing dependencies (the base classes) must be resolved in a controlled sequential or single-owner step before independent work is safely fanned out in parallel. This removes both the race condition on the shared file and the inconsistent partial-migration state in leaf files."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.6-9a651851",
    "scenarioType": "Code Generation with Claude Code"
  },
  {
    "taskStatement": "D1.6",
    "domain": "D1",
    "scenario": "Tasked with renaming an overloaded function signature across a 200-file legacy codebase, you split the files into 10 batches of 20 by file count alone and run one agent per batch with Read/Grep/Edit access; roughly 15% of call sites are ambiguous about which overload applies. Post-merge review shows the identical ambiguous pattern was resolved as overload A in one batch and overload B in another, breaking the build.",
    "question": "What change to the decomposition strategy would most directly prevent this kind of inconsistency?",
    "options": {
      "D": "Group files by shared dependency/decision context - files containing the same ambiguous call pattern go into the same subtask - so each judgment call is made once, consistently, within a single agent's context, then parallelize across those groups instead of arbitrary file-count batches.",
      "B": "Reduce the number of parallel batches from 10 to 4 so each agent sees more files, lowering the chance of a conflicting decision, on the reasoning that a larger share of any given ambiguous call pattern's call sites will then fall inside one agent's context.",
      "C": "Abandon decomposition entirely and process all 200 files sequentially in a single agent to guarantee global consistency, accepting the much longer runtime in exchange for one continuous context in which every judgment call the agent makes is visible to it.",
      "A": "Keep the arbitrary file-count batches but add a final consolidation agent that reviews all diffs afterward and reconciles any inconsistent overload resolutions it finds, re-deriving the correct choice for each conflicting call site and rewriting the affected diffs before the change is merged."
    },
    "correct": "D",
    "explanations": {
      "D": "Correct. Effective decomposition splits work along boundaries where subtasks are genuinely independent. Here, all call sites sharing the same ambiguous pattern form one decision unit - decomposing by raw file count severed that unit across batches, so the same judgment got made twice, differently. Grouping by shared decision context keeps each judgment call inside a single agent's context while still allowing safe parallelism across groups.",
      "B": "Only shrinks the odds of a collision, it does not eliminate the root cause - files with the same ambiguous pattern can still land in different batches, and the fix does not scale as the codebase grows.",
      "C": "Sacrifices the parallelism the task decomposition was designed to provide, when the actual problem is the axis of decomposition, not decomposition itself.",
      "A": "Treats a decomposition design flaw as a downstream reconciliation problem; detecting inconsistent overload resolutions after the fact requires re-deriving the same judgment calls the batches already got wrong, and reconciling incompatible edits is far more costly than preventing the conflict at decomposition time."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.6-8373a628",
    "scenarioType": "Developer Productivity with Claude"
  },
  {
    "taskStatement": "D1.7",
    "domain": "D1",
    "scenario": "Metrics on this session show the agent has already burned through dozens of turns using Read/Grep/Glob to map module boundaries and dependencies across the legacy codebase. The developer now wants to try two competing refactoring strategies — extract-service vs. extract-library — and compare their outcomes before committing to one, without losing the exploration work already done or letting the two attempts interfere with each other.",
    "question": "What is the most effective way to manage session state for this comparison?",
    "options": {
      "D": "Fork the current session at this point into two child sessions, each inheriting the accumulated exploration context, and let each pursue one refactoring strategy independently.",
      "B": "Start two brand-new sessions from scratch, one per strategy, so each gets a clean slate unaffected by prior exploration.",
      "A": "Continue in the single existing session, trying the extract-service strategy first, then instructing the agent to disregard those changes before attempting extract-library.",
      "C": "Resume the existing session and run both strategies sequentially within it, relying on the conversation history to keep the two attempts separate."
    },
    "correct": "D",
    "explanations": {
      "D": "Correct. Forking branches a session at a shared point of accumulated context into independent paths, letting each strategy be explored in isolation without redoing prior exploration or letting one attempt's state contaminate the other.",
      "B": "Discards the already-built context from codebase exploration, forcing redundant re-exploration and wasting the investment already made in understanding the legacy system.",
      "A": "Relies on the agent probabilistically 'disregarding' prior instructions and changes rather than a clean, deterministic separation - state and side effects from the first strategy can still leak into the second attempt.",
      "C": "Running both strategies sequentially in one continuous session mixes their histories together, so context and changes from the first strategy can bleed into the second instead of keeping the two attempts cleanly separate."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.7-fbf9aaee",
    "scenarioType": "Developer Productivity with Claude"
  },
  {
    "taskStatement": "D1.7",
    "domain": "D1",
    "scenario": "On one legacy module, the agent has just wrapped up a 20-minute exploration phase — dozens of Read/Grep/Glob calls mapping dependencies — before proposing any changes. The engineer now wants to try both extracting the module into a standalone service and wrapping it with an adapter, starting from that same explored state each time, and wants a guaranteed fallback to the original post-exploration session untouched if both attempts turn out to be dead ends.",
    "question": "What is the most effective way to structure session state management for this workflow?",
    "options": {
      "A": "Use the SDK's session resumption feature to reload the same session ID for each strategy attempt, re-running the Read/Grep/Glob exploration and dependency mapping each time so the agent rebuilds context before proposing either approach.",
      "B": "Have the agent summarize its exploration findings into a transcript, then start two fresh SDK sessions and paste that transcript as the opening message in each, directing one toward service extraction and the other toward the adapter wrapper.",
      "C": "Resume the original session once and, within that same conversation, have the agent implement the service-extraction strategy, evaluate it, then implement the adapter-wrapping strategy in turn, keeping both attempts in one continuous history.",
      "D": "Fork the session at the checkpoint immediately after exploration, producing two independent session copies that each proceed with a different migration strategy, while the original session remains untouched and resumable."
    },
    "correct": "D",
    "explanations": {
      "A": "Re-running the expensive exploration phase for each strategy defeats the goal of avoiding duplicated work, and reusing the same session ID sequentially still leaves only one linear history rather than two isolated, independently resumable branches.",
      "B": "Manually copying a transcript is a brittle, unnecessary workaround - it does not reliably reconstruct the agent's internal session state, and it still requires re-establishing two sessions by hand instead of using a mechanism designed to branch state at a specific point.",
      "C": "Running both strategies in a single conversation history mixes their state together - later decisions and file changes from one strategy become part of the context the other strategy reasons over, and the original pre-branch state is no longer separately recoverable.",
      "D": "Correct. Forking a session at a specific checkpoint creates independent copies that inherit the accumulated state up to that point, so each branch can pursue a different strategy in isolation without re-doing the exploration work, while the original session is left unmodified and can still be resumed later."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.7-85cb5772",
    "scenarioType": "Developer Productivity with Claude"
  },
  {
    "taskStatement": "D2.1",
    "domain": "D2",
    "scenario": "You wired grep_files and search_codebase into the agent's MCP toolset for codebase lookups. A production trace review finds that on exact-string queries, such as function names and config keys, the agent calls search_codebase's slower embedding search 9 times out of 10 instead of grep_files.",
    "question": "What is the most effective first step to fix this tool selection problem?",
    "options": {
      "A": "Insert a pre-processing classifier that labels each incoming query as \"exact\" or \"semantic\" by checking for quoted literals, identifier casing such as camelCase or snake_case, or file-path syntax, then exposes only the matching tool to the agent for that call.",
      "B": "Remove search_codebase entirely from the MCP server's tool registry so every lookup, whether a config key, a function name, or a broader conceptual question about the codebase's design, is routed through grep_files's literal pattern matching.",
      "C": "Rewrite both tool descriptions to specify what each tool does well, the input types it expects, and explicit boundaries distinguishing exact/literal matching (grep_files) from conceptual/semantic queries (search_codebase).",
      "D": "Add several few-shot examples to the system prompt showing exact-string queries, such as function names and configuration keys, being paired with grep_files calls, alongside conceptual queries paired with search_codebase calls."
    },
    "correct": "C",
    "explanations": {
      "A": "Over-engineered for what is fundamentally a description problem: building a separate pattern-based classifier to detect quoted literals, identifier casing, or file-path syntax bypasses the model's own language understanding by hard-coding a classification step outside the agent's reasoning.",
      "B": "Eliminates the misuse but also removes semantic search capability entirely, which the agent legitimately needs for conceptual queries about the codebase's design - routing every lookup through grep_files's literal matching is an overcorrection that discards functionality instead of fixing the underlying description problem.",
      "C": "Correct. The root cause is that both descriptions are minimal and fail to communicate each tool's strengths, expected inputs, and boundaries relative to the other. Rewriting the descriptions to make those boundaries explicit is the low-effort, high-leverage fix that lets the model choose correctly on its own.",
      "D": "Pairing exact-string queries with grep_files and conceptual queries with search_codebase in few-shot examples relies on probabilistic compliance and adds token overhead on every call, without fixing the ambiguous descriptions that caused the misrouting in the first place."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.1-7557c555",
    "scenarioType": "Developer Productivity with Claude"
  },
  {
    "taskStatement": "D2.1",
    "domain": "D2",
    "scenario": "Among your MCP tools are extract_purchase_order and extract_invoice, described only as \"Extracts structured data from a purchase order\" and \"Extracts structured data from an invoice.\" Monitoring shows the agent frequently calls extract_invoice on scanned purchase orders lacking a clear header, and 18% of resulting records are rejected because the extracted document_type field doesn't match what the accounts-payable system expects.",
    "question": "What is the most effective first step to reduce these tool-selection errors?",
    "options": {
      "A": "Add a downstream JSON schema validation step keyed on the document_type field that automatically detects a mismatch and retries the extraction by invoking the other tool, logging each correction for the monitoring dashboard.",
      "B": "Add several few-shot examples to the system prompt that walk through selecting between extract_purchase_order and extract_invoice based on visible cues like a PO number or invoice number on ambiguous scans.",
      "C": "Merge both tools into a single extract_document tool fronted by an upstream routing classifier that inspects layout features like header text and line-item structure to pre-select the document type before extraction runs.",
      "D": "Expand both tool descriptions to name the distinguishing document features (e.g., PO number vs. invoice number, presence of payment terms) and give explicit guidance on which tool to use when a document is ambiguous."
    },
    "correct": "D",
    "explanations": {
      "A": "Treats the symptom rather than the cause - it masks misrouted calls with retries, adding latency and cost on every ambiguous document instead of improving the agent's ability to select the right tool.",
      "B": "Adds token overhead and relies on probabilistic compliance rather than fixing the ambiguous descriptions that are the root cause.",
      "C": "A valid architecture for a harder version of this problem, but over-engineered as a first step when a simpler fix (better descriptions and boundaries) hasn't been tried.",
      "D": "Correct. The tool descriptions are ambiguous and give the model no way to distinguish the two document types on hard cases; this is the low-effort, high-leverage root-cause fix and the appropriate first step before considering heavier changes."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.1-9a4377fc",
    "scenarioType": "Structured Data Extraction"
  },
  {
    "taskStatement": "D2.1",
    "domain": "D2",
    "scenario": "Among the system's MCP tools are parse_document, described as \"Parses a document and returns its contents,\" and extract_line_items, described as \"Extracts line items from a document.\" Log review shows the agent frequently calls only parse_document on multi-page itemized invoices, passing generic output to billing and omitting per-item quantities and unit prices, leaving 20% of records missing itemized detail.",
    "question": "What is the most effective first step to fix this tool selection problem?",
    "options": {
      "A": "Rewrite both tool descriptions to state their distinct purposes, input expectations, and when to use one versus the other (e.g., parse_document for general text/metadata, extract_line_items specifically for itemized tables with quantities and unit prices), so the agent can distinguish them from the tool description alone.",
      "B": "Add a set of few-shot examples to the agent's system prompt, each pairing a sample multi-page itemized invoice with the correct tool call to extract_line_items and its expected JSON output containing per-item quantities and unit prices, giving the model concrete precedent to follow the next time it encounters a table-bearing document.",
      "C": "Merge parse_document and extract_line_items into a single extract_document_data tool that accepts the same raw document string and always returns both a generic contents field and a line_items array populated with any quantities and unit prices detected, removing the selection decision from the agent entirely so it always produces both outputs in one call.",
      "D": "Add a JSON schema to the billing system's input contract requiring a line_items array with quantity and unit_price fields on every record, validated at the point of ingestion, with any record failing the check routed to an error queue for manual correction before it reaches reconciliation."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. The root cause is that both tool descriptions are minimal and don't explain their distinct purpose, inputs, or when to use one over the other. Rewriting the descriptions to state clear boundaries is the low-effort, high-leverage fix that lets the agent select correctly from the tool interface alone.",
      "B": "Few-shot examples rely on probabilistic compliance and add token overhead without resolving the underlying ambiguity in the tool descriptions themselves — the model can still generalize incorrectly on invoice layouts unlike the examples shown.",
      "C": "A valid architecture change, but heavier than a first step warrants, and it papers over the real problem (ambiguous, undifferentiated tool descriptions) rather than fixing it — it also changes tool interfaces the rest of the pipeline may depend on.",
      "D": "Addresses the downstream symptom (bad billing records) by rejecting them, not the root cause of why the agent chose the wrong tool during extraction — invoices would still fail validation and require rework instead of being extracted correctly the first time."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.1-7e94c6ba",
    "scenarioType": "Structured Data Extraction"
  },
  {
    "taskStatement": "D2.2",
    "domain": "D2",
    "scenario": "Metrics show your run_migration MCP tool returns the bare string \"Error: exit code 1\" on failure, and downstream the agent inconsistently retries in a loop, blames an unreachable database for what was actually a SQL syntax error, or silently moves on as if the migration succeeded.",
    "question": "What is the most effective change to the run_migration tool's error handling to fix this?",
    "options": {
      "A": "Add a line to the system prompt instructing the agent to classify migration errors as transient, validation, or permission issues by scanning the returned error string for keywords such as timeout, syntax, or denied, then choosing to retry, stop, or escalate based on that inferred category.",
      "B": "Have the tool automatically retry any failed migration up to three times internally, re-invoking the same migration file against the database and only returning a result to the agent once the retries are exhausted or the migration succeeds, so the agent never sees a raw failure or intermediate attempts.",
      "C": "Keep the string-based error format but make the message longer and more descriptive, appending the full stack trace, the database connection details, and the exact SQL statement that failed, so the model has substantially more context to reason from when deciding its next action.",
      "D": "Return a structured error response with a machine-readable category field (e.g., transient, validation, permission) plus a human-readable message, so the agent's next action is determined by the category rather than by interpreting free text."
    },
    "correct": "D",
    "explanations": {
      "A": "Relies on probabilistic LLM compliance to correctly parse and classify a free-text string every time by pattern-matching keywords; this is the same failure mode already occurring in the logs and does not guarantee consistent behavior across different phrasings of the same underlying error.",
      "B": "Masks the underlying problem: a validation error (like bad SQL syntax) is not transient and will fail identically on every re-invocation of the same migration file, wasting three attempts before the agent ever learns the real cause, and permission errors still need to escalate rather than be retried.",
      "C": "Adds token overhead without fixing the root cause - even with a stack trace, connection details, and the failing SQL statement included, the agent still has to infer the error category from unstructured prose, so misclassification remains just as likely.",
      "D": "Correct. A structured error category field gives the agent a deterministic, machine-readable signal to branch on (retry vs. stop vs. escalate), rather than requiring it to probabilistically infer intent from prose - the same programmatic-enforcement principle that makes structured tool outputs more reliable than free text."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.2-65e21cf7",
    "scenarioType": "Developer Productivity with Claude"
  },
  {
    "taskStatement": "D2.1",
    "domain": "D2",
    "scenario": "Your query_database and run_migration MCP tools both carry the description \"Executes SQL against the application database.\" Logs show read-only requests like row counts or column checks are sometimes routed to run_migration, corrupting migration history and once locking the orders table during a deploy window.",
    "question": "What is the most effective fix to stop the agent from routing read-only requests to run_migration?",
    "options": {
      "A": "Remove run_migration from the agent's toolset and require engineers to run migrations manually outside the agent, using the deploy pipeline's existing schema-migration command so every schema change still goes through version control and the human-approval gate before touching the application database.",
      "B": "Add few-shot examples to the system prompt showing read-only questions like row counts and column checks being answered by invoking query_database with the matching SQL statement, giving the model concrete precedent it can pattern-match against when routing similar read-only requests to a tool.",
      "C": "Rewrite each tool's description to state its exact purpose, expected inputs, and explicit boundaries (e.g., query_database is for read-only lookups and must never be used for schema changes; run_migration is only for applying versioned schema changes and must never be used for ad hoc queries).",
      "D": "Set tool_choice to \"any\" on every request so the model must invoke either query_database or run_migration for each incoming question, pairing that setting with a fixed evaluation order that checks the query_database branch first before falling through to run_migration for schema requests."
    },
    "correct": "C",
    "explanations": {
      "A": "Over-corrects by eliminating a needed capability instead of fixing the tool descriptions that caused the misrouting; routing manual migrations through the deploy pipeline's own command preserves version control and approval, but at the cost of the agent's ability to run migrations at all.",
      "B": "Few-shot examples rely on probabilistic compliance and add token overhead without fixing the ambiguous descriptions that are the actual root cause; the model can still generalize incorrectly to phrasings the examples didn't cover.",
      "C": "Correct. The root cause is that both tool descriptions are generic and don't distinguish purpose or boundaries. Rewriting them to clearly state what each tool is for, and explicitly is not for, gives the model the information it needs to select correctly, and is the low-effort, high-leverage first step.",
      "D": "tool_choice \"any\" forces some tool call on every turn, and a fixed evaluation order is not a real control over which tool the model selects internally - the misrouting between query_database and run_migration is untouched."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.1-6aaa4c2e",
    "scenarioType": "Developer Productivity with Claude"
  },
  {
    "taskStatement": "D2.2",
    "domain": "D2",
    "scenario": "Your escalate_to_human tool is fine, but your lookup_policy MCP tool sits behind the same insurance claims backend, and logs show it collapses invalid policy ID formats, not-found policies, and database timeouts into one string, \"Error: could not complete request,\" causing the agent to misdiagnose the failure and sometimes retry a permanent not-found error indefinitely.",
    "question": "What is the most effective way to fix this?",
    "options": {
      "A": "Wrap all tool failures in a single friendly JSON payload with one message field, \"Something went wrong, please try again,\" produced by a catch-all exception handler in the tool's response layer so every invalid-input, not-found, and timeout case returns identical text to the agent and customer.",
      "B": "Add automatic retry logic inside the tool's request handler so it retries the backend policy database lookup up to three times with a short delay between attempts before returning any error string to the agent, regardless of whether the original failure was a formatting issue or a missing record.",
      "C": "Add a system prompt instruction telling the agent to infer the likely cause of a lookup_policy failure from the wording of the error message, then choose among asking for a corrected ID, retrying the call, or telling the customer the policy was not found based on keywords it detects in that text.",
      "D": "Update the tool to return structured error responses with distinct machine-readable categories (e.g., invalid_input, not_found, transient_error) so the agent can deterministically select the correct next action for each case."
    },
    "correct": "D",
    "explanations": {
      "A": "A catch-all handler that collapses every exception into one message field makes the response uniform but destroys the information needed to act correctly - the agent (and the customer) can no longer distinguish a permanent not-found from a transient timeout.",
      "B": "Automatic retries inside the tool's request handler only address the transient-error case, and do so by masking failures before the agent ever sees them; it does nothing to help the agent distinguish invalid_input from not_found, and retrying a permanent not-found error wastes calls without resolving the underlying ambiguity.",
      "C": "Having the agent infer the cause from keywords in the error message relies on probabilistically parsing an ambiguous string rather than receiving an explicit, structured signal - this is the same root cause that produced the inconsistent behavior in the first place.",
      "D": "Correct. Distinct, structured error categories give the agent the information it needs to deterministically branch its behavior - surface not_found to the customer, retry or wait on transient_error, request corrected input on invalid_input - instead of guessing at the failure mode from free text."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.2-390a4269",
    "scenarioType": "Customer Support Resolution Agent"
  },
  {
    "taskStatement": "D2.3",
    "domain": "D2",
    "scenario": "For the invoice-extraction pipeline, Claude has two tools, extract_invoice_data and flag_for_review, with tool_choice left on its default setting. Logs show that on roughly 8% of documents Claude instead returns a plain-text explanation of the problem, calling neither tool, which crashes the downstream parser expecting a tool call.",
    "question": "What is the most effective way to configure tool_choice to fix this failure mode while preserving the correct extract vs. flag routing decision?",
    "options": {
      "A": "Set tool_choice to force the specific extract_invoice_data tool on every request, since that is the primary business-critical path.",
      "B": "Set tool_choice so the model must call some tool (any of the available tools) rather than respond in plain text, letting it still choose between extract_invoice_data and flag_for_review.",
      "C": "Leave tool_choice on its default auto setting and add few-shot examples showing the model always calling a tool instead of explaining in text.",
      "D": "Expand the descriptions of extract_invoice_data and flag_for_review to state that a tool must always be called, while keeping tool_choice on its default auto setting."
    },
    "correct": "B",
    "explanations": {
      "A": "Forcing one specific tool removes the model's ability to route problematic documents to flag_for_review, breaking the routing logic the pipeline depends on - it trades one failure mode for another.",
      "B": "Correct. Configuring tool_choice to require that some tool be called (rather than leaving it on auto, which permits a plain-text reply) programmatically eliminates the plain-text failure path, while still letting the model decide which of the two tools is appropriate for a given document.",
      "C": "Few-shot examples only raise the probability of correct behavior; they do not programmatically guarantee a tool call, so the 8% failure rate would likely persist.",
      "D": "Relies on the model reading and following an instruction embedded in a tool description under the default auto setting - this is still probabilistic compliance rather than an enforced constraint."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.3-c8e39de6",
    "scenarioType": "Structured Data Extraction"
  },
  {
    "taskStatement": "D2.3",
    "domain": "D2",
    "scenario": "Logs show your triage step, which calls categorize_ticket before the resolution agent's five tools run, skips that call and returns a conversational reply instead in roughly 8% of incoming tickets.",
    "question": "What is the most effective way to guarantee the triage agent always invokes categorize_ticket before producing any other output, while keeping the resolution agent's tool usage flexible?",
    "options": {
      "C": "Set the triage agent's tool_choice to force the categorize_ticket tool specifically, while leaving the resolution agent's tool_choice set to auto across its five tools.",
      "A": "Add a system prompt instruction to the triage agent stating that calling categorize_ticket is mandatory before responding to the user.",
      "D": "Give the triage agent access to all six tools (categorize_ticket plus the resolution agent's five tools) so it has full context to decide whether categorization is needed.",
      "B": "Remove every tool from the triage agent except categorize_ticket and leave tool_choice set to auto, relying on the fact that it is the only tool available."
    },
    "correct": "C",
    "explanations": {
      "C": "Correct. Forcing tool_choice to a specific tool guarantees that tool is invoked before any text response, giving deterministic control exactly where it is needed. The resolution agent, which must choose among several valid tools depending on the request, is correctly left on auto - this distributes both tools and tool_choice configuration appropriately across the two agents.",
      "A": "Relies on probabilistic instruction-following. The logs already show the model sometimes ignores instructions and responds conversationally instead of calling the tool, so a stronger prompt does not eliminate the failure mode.",
      "D": "Over-provisions the triage agent with tools that belong to the resolution agent's responsibility, violating separation of concerns and least privilege without addressing the actual problem, which is that the triage agent isn't reliably calling its own tool.",
      "B": "With tool_choice still set to auto, the model can still choose to respond with plain text and call no tool at all, even if only one tool is available - auto never guarantees invocation, so this does not fix the 8% failure rate."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.3-df5007a3",
    "scenarioType": "Customer Support Resolution Agent"
  },
  {
    "taskStatement": "D2.2",
    "domain": "D2",
    "scenario": "The pipeline's submit_invoice tool, used to push validated records downstream, returns the same generic \"Error: could not submit invoice.\" string whether the failure is a malformed field, an expired auth token, or a service timeout. Logs show the agent sometimes retries an auth failure a dozen times and sometimes abandons a timeout immediately, with no one manually reading logs to sort cases.",
    "question": "What is the most effective way to fix submit_invoice so the agent can reliably choose the right recovery action?",
    "options": {
      "A": "Wrap every failure in a single generic \"Tool execution failed\" message, and add system prompt instructions telling the agent to retry a fixed number of times before escalating any unresolved failure to a human.",
      "B": "Keep detailed error information - failure category, downstream service response, and request timestamp - in server-side logs only, and return a simple boolean success/failure flag to the agent to keep the tool response minimal.",
      "C": "Return a structured error response with a distinct category (e.g., validation_error, auth_error, transient_error) plus a descriptive message, so the agent can programmatically map each category to the appropriate action.",
      "D": "Have the tool itself automatically retry every failure up to three times internally, using exponential backoff between attempts, and only report an error to the agent after all three retries are exhausted."
    },
    "correct": "C",
    "explanations": {
      "A": "Relies on the agent probabilistically inferring the right response from a generic message and prompt wording - even with a fixed retry-then-escalate rule, it cannot reliably distinguish a permission failure from a transient one, which is exactly the failure mode observed.",
      "B": "Removes the very information the agent needs to decide how to proceed; a bare boolean cannot distinguish a fixable input error from a permission problem or a transient outage, no matter how much detail is captured in the logs the agent never sees.",
      "C": "Correct. Structured error categories give the agent the machine-readable signal it needs to deterministically choose between fixing input, retrying, or escalating, instead of guessing from an opaque message.",
      "D": "Masks the distinction between transient and permanent failures inside the tool itself - a non-retryable auth error would still be retried three times with backoff before failing, wasting calls, while the agent never learns why it failed."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.2-9f2b349f",
    "scenarioType": "Structured Data Extraction"
  },
  {
    "taskStatement": "D2.3",
    "domain": "D2",
    "scenario": "Monitoring the invoice-extraction pipeline, whose extract_line_items tool is left at the default \"auto\" tool_choice, you find that on roughly 20% of scanned invoices the model returns a prose summary instead of calling extract_line_items, especially when the invoice layout is unusual — breaking the downstream parser, which expects a tool call every time.",
    "question": "What is the most effective way to guarantee that extract_line_items is invoked on every invoice, regardless of layout?",
    "options": {
      "A": "Set tool_choice to force the model to call extract_line_items specifically, rather than leaving it on \"auto.\"",
      "C": "Set tool_choice to \"any\" so the model must call some tool rather than responding with plain text.",
      "D": "Add few-shot examples to the prompt showing extract_line_items being called on invoices with unusual layouts.",
      "B": "Rewrite extract_line_items's description to more clearly state that it should be used for all invoice types, including unusual layouts."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. When a specific tool must run every time with no acceptable alternative, forcing tool_choice to that exact tool gives a deterministic guarantee, unlike \"auto,\" which leaves it to the model to decide whether and which tool to call.",
      "C": "Forcing \"any\" only guarantees that some tool is called, not which one - with two tools available, the model could still call validate_schema instead of or before extract_line_items, so the parser could still fail to receive extracted line items first.",
      "D": "Few-shot examples raise the odds of the desired behavior but still rely on probabilistic compliance, which the scenario shows is already failing on 20% of unusual-layout invoices.",
      "B": "A description rewrite also relies on the model probabilistically choosing to call the tool; it does not change the fact that \"auto\" permits a text-only response instead of a tool call."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.3-3427b321",
    "scenarioType": "Structured Data Extraction"
  },
  {
    "taskStatement": "D2.4",
    "domain": "D2",
    "scenario": "Connected via MCP, the observability server exposes query_logs, query_metrics, restart_service, and scale_deployment. Reviewing the investigation agent's transcript, you find that when an engineer asks \"can we fix the crash loop?\" it calls restart_service, even though remediation was meant to stay with the human-approved on-call runbook.",
    "question": "What is the most effective way to configure the MCP integration to prevent this?",
    "options": {
      "D": "Connect the MCP server but enable only query_logs and query_metrics for the investigation agent's configuration, leaving restart_service and scale_deployment available exclusively to the separate, approved runbook workflow.",
      "B": "Connect the full MCP server with all four tools, and add a system prompt instruction telling the agent it must never call restart_service or scale_deployment without explicit human approval.",
      "A": "Connect the full MCP server with all four tools, and rely on the MCP server's existing tool descriptions, which already note that restart_service and scale_deployment are destructive actions.",
      "C": "Connect the full MCP server with all four tools, and add few-shot examples to the system prompt showing the agent using only query_logs and query_metrics when investigating incidents."
    },
    "correct": "D",
    "explanations": {
      "D": "Correct. When integrating an MCP server into a specific agent workflow, only the tools that workflow actually needs should be enabled. Scoping the investigation agent to query_logs and query_metrics programmatically removes the possibility of calling restart_service or scale_deployment at all, matching the tool's role to the workflow it serves rather than depending on the model to self-restrict.",
      "B": "Relies on probabilistic LLM compliance with a prompt instruction. As the observed failure shows, ambiguous phrasing can still lead the agent to call a tool the instruction told it not to use.",
      "A": "Tool descriptions inform tool selection, but a description alone does not prevent the tool from being called - it only makes the mutating action easier to distinguish once already present among the agent's options.",
      "C": "Few-shot examples raise the odds of correct behavior but, like the system prompt instruction in B, are a probabilistic mitigation and do not guarantee the agent will never invoke the mutating tools given the wrong phrasing."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.4-b89ed1ca",
    "scenarioType": "Developer Productivity with Claude"
  },
  {
    "taskStatement": "D2.4",
    "domain": "D2",
    "scenario": "While extending the agent so it can automatically reconcile refunds against the ledger, an engineer finds a community-published MCP server wrapping the accounting platform's API, exposing tools like create_invoice, void_transaction, and export_ledger. Because wiring it in would close this reconciliation gap, the engineer wants to add it directly to the production agent's toolset alongside the existing customer-email and refund-processing tools for the next deploy.",
    "question": "What should happen before this third-party MCP server is integrated into the production agent workflow?",
    "options": {
      "D": "Review the server's source code and the permissions its tools require, test it in an isolated environment first, and grant it only the minimum tool scope the workflow actually needs before adding it to production.",
      "B": "Integrate it directly into production, since any MCP server exposing a well-defined tool schema can be trusted the same way built-in tools are.",
      "A": "Add it to production now, but write a system prompt instructing the agent to only use void_transaction and export_ledger in appropriate situations.",
      "C": "Skip the new MCP server and instead have the agent reach the accounting platform through its existing email tool, since adding a new external integration expands the attack surface."
    },
    "correct": "D",
    "explanations": {
      "D": "Correct. Third-party MCP servers can execute arbitrary code and request broad permissions; integrating one into a workflow that already touches money and customer communication warrants source review, sandboxed testing, and scoping to least privilege before it is trusted with production access.",
      "B": "A well-defined tool schema only describes the interface, not the server's implementation or trustworthiness - following the MCP protocol does not mean the server's code or access requests have been vetted.",
      "A": "Relies on probabilistic prompt compliance to restrict a tool that already has production access; it does not prevent the agent from calling create_invoice or void_transaction incorrectly, and the underlying server is still unreviewed.",
      "C": "Misapplies the email tool to a task it was not built for, and doesn't actually solve the stated need (automated reconciliation) - it avoids the integration decision rather than evaluating it."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.4-2444fe4c",
    "scenarioType": "Developer Productivity with Claude"
  },
  {
    "taskStatement": "D2.4",
    "domain": "D2",
    "scenario": "While using the SDK to help engineers explore an internal codebase, your 40-person platform team wants everyone to get the same Jira MCP server access on clone, without manual per-machine setup or an API token becoming readable to anyone who checks out the repo. A junior engineer proposes committing an .mcp.json file to the repo root with the server's command and a hardcoded Jira API token in the args.",
    "question": "What is the most effective way to integrate this MCP server for the team while addressing the credential-exposure risk?",
    "options": {
      "B": "Commit a project-scoped .mcp.json that defines the Jira server and references the token via an environment variable rather than a literal value, so the configuration is shared through version control while each engineer supplies their own credential locally.",
      "A": "Have each engineer run the CLI command to add the Jira MCP server to their personal user-level configuration with their own token, since user-level configuration is the mechanism intended for keeping credentials out of the repo.",
      "C": "Commit the .mcp.json with the hardcoded token as proposed, then add .mcp.json to .gitignore afterward so future edits to the file are no longer tracked.",
      "D": "Keep the Jira server configuration entirely local to each engineer's machine and document the manual setup steps in a README so new engineers can replicate it themselves."
    },
    "correct": "B",
    "explanations": {
      "B": "Correct. A project-scoped .mcp.json checked into version control gives the whole team the identical server definition automatically on clone, while referencing the credential through an environment variable keeps the secret itself out of the committed file - satisfying both the consistency requirement and the credential-exposure concern.",
      "A": "Keeps tokens out of the repo but sacrifices the consistency requirement - each engineer must manually configure the server themselves, and the team has no shared, version-controlled definition that new engineers get automatically.",
      "C": "Does not solve the problem: the token was already committed to git history before the .gitignore entry was added, so it remains exposed to anyone with access to the repository's history.",
      "D": "Manual, undocumented-in-config setup reintroduces the per-engineer inconsistency the team is trying to avoid, and relies on every new engineer correctly following README steps rather than getting a working setup automatically."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.4-a9ff6caf",
    "scenarioType": "Developer Productivity with Claude"
  },
  {
    "taskStatement": "D2.5",
    "domain": "D2",
    "scenario": "Test coverage logs show that on the ongoing effort to deprecate the internal helper formatLegacyDate() and replace all call sites with the new formatDate() utility (same argument signature) across the 400-file TypeScript monorepo, call sites are scattered across many directories, and each affected file also contains unrelated code that must be preserved exactly as-is. The function name is unique enough that a plain text search won't produce false positives.",
    "question": "Which combination of built-in tools is the most appropriate way for Claude to carry out this task?",
    "options": {
      "A": "Use Grep to locate every file and line referencing formatLegacyDate, then use Edit on each file to replace the exact matched text with formatDate.",
      "D": "Use Bash to run a recursive grep and sed -i command that finds and replaces all occurrences of formatLegacyDate with formatDate in a single shell pipeline.",
      "B": "Use Glob to list every .ts file in the repo, then use Write to rewrite each file in full with the updated function name substituted in.",
      "C": "Use Read to load the entire repository into context, then use Bash to execute a custom find-and-replace script generated from that context."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Grep is purpose-built for locating matches across many files, and Edit performs precise, targeted string replacement without touching the rest of each file's content - the right combination for a scoped, reviewable text substitution.",
      "D": "Shelling out to sed -i bypasses Claude's built-in Edit mechanism entirely, turning a precise, auditable operation into an unreviewed bulk shell transformation - a common shortcut that trades safety and traceability for speed.",
      "B": "Write is meant for creating new files or full-file rewrites, not small targeted changes - rewriting each file from scratch risks losing or corrupting unrelated content that Edit would leave untouched.",
      "C": "Loading the entire repository into context via Read is unnecessary and wasteful when Grep can identify exactly which files and lines matter, and running an ad hoc Bash script for replacement again bypasses Edit's precise, exact-match safety."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.5-a103e406",
    "scenarioType": "Developer Productivity with Claude"
  },
  {
    "taskStatement": "D2.4",
    "domain": "D2",
    "scenario": "When a subagent is spawned to explore an unfamiliar codebase, it is still handed every tool from the GitHub, Jira, and Confluence MCP servers by default. Reviewing its transcript, you see it stall between search_issues (Jira) and search_content (Confluence) before finally calling one, adding unnecessary tool-selection overhead to a task that only ever needed GitHub's tools.",
    "question": "What is the most effective way to address this tool-selection problem?",
    "options": {
      "A": "Add few-shot examples to the system prompt showing which server's tool to use for each type of request, pairing example queries with the correct tool name across GitHub, Jira, and Confluence so Claude can pattern-match before calling it.",
      "B": "Scope each session or subagent's available MCP tools to only the servers relevant to its current task (e.g., GitHub tools only for codebase exploration), rather than exposing every connected server's tools by default.",
      "C": "Switch every session to a larger-context model, giving Claude more tokens to reason step by step through the full list of GitHub, Jira, and Confluence tool descriptions before committing to a tool call.",
      "D": "Consolidate the GitHub, Jira, and Confluence MCP servers into a single combined server with one unified namespace, merging their tool definitions so engineers and subagents query one consistent set of tool names."
    },
    "correct": "B",
    "explanations": {
      "A": "Few-shot examples rely on probabilistic compliance and add token overhead to every session's system prompt without removing the unnecessary tools causing the ambiguity in the first place.",
      "B": "Correct. This applies the principle of least privilege to MCP integration: granting a session or subagent only the tools relevant to its task removes the ambiguity and overhead caused by unrelated, similarly named tools being available at once, and is a low-effort, high-leverage fix.",
      "C": "Misdiagnoses the problem as a context-capacity limitation rather than tool-selection overhead caused by over-scoped access; a larger model with more tokens to reason over the same combined tool list does not resolve ambiguity between similarly named tools it shouldn't have been offered.",
      "D": "Merging external servers into a single namespace is a heavy, often infeasible restructuring that doesn't address the root cause — over-provisioning unrelated tools to every task — and naming collisions could still arise within the merged tool definitions."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.4-c634417f",
    "scenarioType": "Developer Productivity with Claude"
  },
  {
    "taskStatement": "D3.1",
    "domain": "D3",
    "scenario": "While using the agent to work across the monorepo's services/api, apps/web, and packages/ui, engineers tracking Claude's edit history find that the single root CLAUDE.md's combined conventions leak across boundaries: edits to services/api's error-handling code frequently follow apps/web's state-management pattern instead, and commits made deep inside packages/ui repeatedly omit the org-wide commit message format, license header, and security review requirements.",
    "question": "What is the most maintainable way to restructure the CLAUDE.md configuration to fix these cross-contamination and coverage problems?",
    "options": {
      "A": "Keep the single root CLAUDE.md but reorganize its content into clearly labeled sections (API, Web, UI, Org-Wide) with markdown headers and directory-name anchors under each section, so Claude reads the whole file and matches the current working path to the right heading before applying conventions.",
      "B": "Delete the root CLAUDE.md and create one comprehensive CLAUDE.md in each of services/api, apps/web, and packages/ui that fully restates the org-wide commit, license, and security rules alongside that area's specific conventions, so every directory is entirely self-contained and can be read in isolation.",
      "C": "Keep the org-wide rules in the root CLAUDE.md, and add a separate CLAUDE.md in each of services/api, apps/web, and packages/ui containing only that area's specific conventions, relying on the hierarchy so nested CLAUDE.md files supplement the root file when Claude works in that subdirectory.",
      "D": "Keep the single root CLAUDE.md for org-wide rules, and move the area-specific conventions into three separate skills in .claude/skills/, one per area, each invoked by name so Claude loads the API, Web, or UI skill on demand when working in that part of the repo."
    },
    "correct": "C",
    "explanations": {
      "A": "Relying on Claude to infer which section applies from headers and path-matching within one flat file is exactly the probabilistic approach that caused the original cross-contamination problem; labeling sections and adding anchors doesn't guarantee the right section is applied and the wrong one is ignored, since Claude still has to read and select from a single undifferentiated document.",
      "B": "Restating the org-wide commit, license, and security rules inside each of the three area CLAUDE.md files creates a maintenance burden - any change to those rules must now be updated in three separate places, and the copies can drift out of sync over time, reintroducing the coverage gaps the fix was meant to solve.",
      "C": "Correct. CLAUDE.md files form a hierarchy where nested files are loaded alongside the root file based on directory location, so scoping org-wide rules at the root and area-specific conventions in each subdirectory ensures both are automatically applied together without manual selection or duplication, and eliminates the cross-contamination caused by mixing all conventions into one flat file.",
      "D": "Skills that are invoked by name require Claude to decide to load them, which is not deterministic the way directory-scoped CLAUDE.md files are; even with one skill per area, Claude can still fail to invoke the matching skill while editing that area, and this restructuring does nothing to fix org-wide rules being missed deep in the directory tree."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D3.1-e0738897",
    "scenarioType": "Developer Productivity with Claude"
  },
  {
    "taskStatement": "D3.2",
    "domain": "D3",
    "scenario": "You package one such repository-analysis workflow to walk the dependency graph, read dozens of files, and produce a long architectural report. Trial runs show the exploration's verbose intermediate output floods the main conversation, crowding out the task the engineer was working on, and in one run the workflow modified a build file while \"tidying\" something it noticed. Engineers should keep invoking the analysis on demand, by name.",
    "question": "Which configuration best addresses both problems?",
    "options": {
      "A": "Move the workflow's instructions into the project CLAUDE.md so they load automatically, and add a rule stating that analysis runs must treat all files as read-only and never modify build files.",
      "B": "Split the workflow into several smaller skills, each covering one stage of the dependency-graph walk and producing a shorter chunk of output, with engineers invoking each skill by name in sequence.",
      "C": "Package the workflow as a skill in .claude/skills/ whose SKILL.md frontmatter sets context: fork, so it runs in an isolated sub-agent context, and allowed-tools restricting it to read-only tools.",
      "D": "Package the workflow as a skill in .claude/skills/, and write instructions in the SKILL.md body directing Claude to keep its exploration output brief and to only read files, never editing or writing to them."
    },
    "correct": "C",
    "explanations": {
      "A": "CLAUDE.md is for always-loaded universal standards, not an on-demand workflow the team wants invoked by name; loading these instructions into every session adds permanent context weight and does nothing to isolate the exploration's verbose output from the main conversation, and a prose rule against modifying build files is a request Claude can still ignore, not an enforcement mechanism.",
      "B": "Splitting the workflow into per-stage skills does not isolate output - each stage's exploration still runs and reports into the main conversation, so the fragments still accumulate there - and requiring engineers to invoke each stage in sequence adds invocation burden while still leaving no mechanism that stops any stage from modifying a build file it notices.",
      "C": "Correct. context: fork runs the skill in an isolated sub-agent context, so verbose exploration output never pollutes the main conversation, and allowed-tools programmatically restricts the skill to read-only tools - a guarantee, not a request.",
      "D": "Prompt-level instructions in the SKILL.md body are probabilistic: telling Claude to keep output brief and to only read files lowers the odds of verbose output and stray edits but guarantees neither, since Claude is still free to write and still free to elaborate if it judges that useful. The isolation and tool-restriction frontmatter exist precisely to make these guarantees instead of requests."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D3.2-7f451062",
    "scenarioType": "Developer Productivity with Claude"
  },
  {
    "taskStatement": "D3.3",
    "domain": "D3",
    "scenario": "On this monorepo, migration files under services/billing/migrations/ and services/inventory/migrations/ must follow a strict rollback-safety convention distinct from the surrounding application code. Developers report Claude Code matches each service's general style correctly but repeatedly omits the required rollback block when generating new migration files.",
    "question": "What is the most maintainable way to ensure Claude reliably applies the migration-specific convention whenever it edits a migration file, regardless of which service directory it lives in?",
    "options": {
      "A": "Add a rule file in .claude/rules/ with YAML frontmatter targeting a glob pattern like **/migrations/*.py, describing the required rollback-safety convention.",
      "C": "Add a CLAUDE.md file inside each service's migrations/ subdirectory documenting the rollback-safety convention for that service.",
      "B": "Expand the root CLAUDE.md with a dedicated \"Migrations\" section describing the convention and trust Claude to recognize when it is editing a migration file.",
      "D": "Create a migration-convention skill in .claude/skills/ that Claude can invoke when it determines it is working on a database migration."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. A glob pattern such as **/migrations/*.py matches every migration file across every service directory, so the convention loads whenever a matching migration file is being edited, regardless of where in the monorepo it lives, with no per-directory duplication and no reliance on inference.",
      "C": "Requires manually creating and maintaining a duplicate convention file in every service's migrations/ subdirectory; a new service added later would silently lack the rule until someone remembers to copy it over.",
      "B": "Relies on Claude inferring from a general description which files count as migrations, which is the same probabilistic-matching failure already causing the rollback block to be omitted.",
      "D": "Requires Claude to decide on its own to invoke the skill, which contradicts the need for the convention to apply automatically and deterministically every time a migration file is touched."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D3.3-ba06196b",
    "scenarioType": "Code Generation with Claude Code"
  },
  {
    "taskStatement": "D3.3",
    "domain": "D3",
    "scenario": "While working in pipelines/orders/, engineers reviewing Claude's edit history notice its convention application is inconsistent purely by file type: a Python script it touched was missing the required logging wrapper, a SQL migration it edited lacked the rollback block, and a Terraform file it wrote used an inconsistent naming prefix — even though the directory itself was correct in every case.",
    "question": "What is the most maintainable way to ensure Claude automatically applies the correct convention set based on which file type it is editing, regardless of directory?",
    "options": {
      "A": "Create separate rule files in .claude/rules/ with YAML frontmatter glob patterns (e.g., **/*.py, **/*.sql, **/*.tf) so the matching convention set loads based on file extension rather than directory location.",
      "D": "Write one comprehensive root CLAUDE.md with a section per file type and instruct Claude to determine which section applies before editing any file.",
      "C": "Add a PreToolUse hook on the Write and Edit tools that blocks the operation unless the file already matches its convention, forcing Claude to self-correct through repeated denials.",
      "B": "Place a CLAUDE.md file in each subdirectory (e.g., pipelines/orders/CLAUDE.md) describing all three conventions, since CLAUDE.md files are automatically loaded for any file Claude touches within that directory tree."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. .claude/rules/ files with glob-pattern frontmatter scope conventions to file paths/extensions rather than directory location - exactly what's needed when files with different conventions are interleaved in the same folders.",
      "D": "Relies on Claude inferring which section applies rather than explicit, deterministic path matching, making it unreliable as the codebase grows.",
      "C": "Misuses hooks: this enforces conventions after the fact through denial loops rather than loading the correct convention content upfront, which is a roundabout, unreliable substitute for conditional convention loading.",
      "B": "Does not solve the problem: a single directory contains all three file types, so a directory-scoped CLAUDE.md cannot distinguish which convention applies to which file within that same directory."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D3.3-88e3ae4b",
    "scenarioType": "Developer Productivity with Claude"
  },
  {
    "taskStatement": "D3.4",
    "domain": "D3",
    "scenario": "A developer asks Claude Code to fix a bug where a REST API endpoint returns a 500 error for a specific malformed request payload. Error monitoring shows this same 500 error has fired for 8% of requests hitting that endpoint over the past week, and the stack trace points to a single validation function in one file, where the developer has already identified the line where an unguarded field access throws when the payload is missing an optional key.",
    "question": "Which approach is most appropriate for this task?",
    "options": {
      "A": "Use direct execution, since the fix is localized to a known file and line with a clear, low-ambiguity change.",
      "D": "Enter plan mode first to explore the codebase and weigh alternative validation architectures before touching the file.",
      "C": "Enter plan mode so Claude can present a step-by-step plan for review, since any production code change carries risk.",
      "B": "Use direct execution, but instruct Claude to first search the entire codebase for every other endpoint with similar validation logic before making any change."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Plan mode is suited to architectural decisions, large-scale changes, and situations with multiple valid approaches. A single-file, single-line fix with a known root cause and no design ambiguity is the case for direct execution.",
      "D": "Over-engineered - there is no architectural decision or multiple valid design approach to weigh; the fix is a scoped, already-diagnosed bug.",
      "C": "Treats risk of touching production code as the deciding factor rather than scope and ambiguity - plan mode is warranted by architectural complexity or multiple valid approaches, not by the mere fact that code is being changed.",
      "B": "Introduces unrequested scope (a codebase-wide audit) into what should be a surgical fix - a separate mistake from the plan-mode-vs-direct-execution decision the question is testing."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D3.4-c311af0c",
    "scenarioType": "Code Generation with Claude Code"
  },
  {
    "taskStatement": "D3.5",
    "domain": "D3",
    "scenario": "A developer asks Claude Code to convert a 3,000-line legacy jQuery module to React hooks. In the first attempt, the developer writes one exhaustive prompt describing every component, state variable, and edge case, then lets Claude Code run to completion before reviewing anything; the resulting diff compiles but has state-management bugs traced to an early misunderstanding that propagated through dozens of files.",
    "question": "What change to the workflow would most effectively prevent this kind of compounding error going forward?",
    "options": {
      "A": "Write an even more detailed single prompt that enumerates every component, prop, state variable, hook dependency, and edge case, then let Claude Code run the entire conversion to completion.",
      "B": "Switch to plan mode so Claude Code designs the full component tree, state architecture, and hook boundaries up front, then execute that entire plan in a single uninterrupted run.",
      "C": "Let Claude Code complete the entire migration in one pass, then run a comprehensive review pass checking every converted file's props, state, and hooks against the original for parity.",
      "D": "Break the migration into small increments (e.g., one component or state slice at a time), reviewing and confirming correctness after each step before Claude Code proceeds to the next."
    },
    "correct": "D",
    "explanations": {
      "A": "More upfront detail — even enumerating every component, prop, state variable, hook dependency, and edge case — cannot substitute for checkpoints during execution: it does not create a moment to catch a bad assumption before it propagates, and issues in a large migration often only become visible once code is actually produced and inspected.",
      "B": "Planning up front, including designing the full component tree, state architecture, and hook boundaries, helps with design, but executing that entire plan in one uninterrupted run still removes the incremental checkpoints needed to catch an early error before it spreads.",
      "C": "This repeats the original mistake. A single large uninterrupted pass still lets an early misunderstanding compound across dozens of files, and even a thorough final review pass checking every file's props, state, and hooks against the original must untangle far more than it would have at an earlier checkpoint.",
      "D": "Correct. Iterative refinement - working in small, checkpointed increments with review between steps - surfaces a wrong assumption right after it is introduced, before it can propagate through the rest of the codebase, and lets feedback from each step inform the next."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D3.5-5f1b3fa7",
    "scenarioType": "Code Generation with Claude Code"
  },
  {
    "taskStatement": "D3.5",
    "domain": "D3",
    "scenario": "A developer on your team uses Claude Code with Read to inspect sample rows and Write to produce a script that migrates records from a legacy CSV export into a new database schema. Running the generated script against 500 sample records, 30 fail — some have malformed date fields, others have currency values with inconsistent formatting — while the remaining 94% migrate correctly, and the developer wants the script refined rather than regenerated from scratch.",
    "question": "What is the most effective way to refine the script toward full correctness?",
    "options": {
      "A": "Run the script against the full sample set, capture the specific failing records and their error messages, and feed that concrete output back to Claude so it can target fixes for those exact cases, repeating the run-capture-fix cycle until all records pass.",
      "B": "Ask Claude to re-read the script and identify any bugs it can find on its own, then apply whatever fixes it suggests before re-running, on the assumption that a careful second reading will surface the date and currency handling gaps.",
      "C": "Discard the current script and re-prompt Claude from scratch with a more detailed description of the CSV format, including the date and currency variations, in the hope that a fresh attempt avoids the errors the first attempt made.",
      "D": "Have Claude generate three independent versions of the script in parallel and manually pick whichever one looks cleanest, on the reasoning that at least one of three attempts is likely to handle the remaining edge cases correctly."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Effective iterative refinement is grounded in concrete execution feedback - the actual failing records and error messages - so each cycle targets the real remaining gap and converges toward full correctness rather than guessing.",
      "B": "Relies on Claude probabilistically spotting bugs by inspection alone, without the ground-truth evidence from actually running the script against the failing records, making it unlikely to catch the specific date and currency formatting issues.",
      "C": "Discards the working 94% and all diagnostic information already gathered, restarting from zero instead of progressively narrowing in on the known failure cases - a wasteful, unfocused way to iterate.",
      "D": "Generating parallel variants and picking one by inspection doesn't use the concrete failure data at all, and provides no guarantee any variant actually handles the 30 known edge cases correctly."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D3.5-abf63221",
    "scenarioType": "Code Generation with Claude Code"
  },
  {
    "taskStatement": "D3.5",
    "domain": "D3",
    "scenario": "One recurring CLAUDE.md-driven workflow generates TypeScript API client boilerplate from OpenAPI specs. Against a 40-sample-spec test set, generated code compiles correctly only 65% of the time, with failures spanning missing null checks on optional fields, incorrect enum handling, and wrong import paths for nested schemas; the target is 90%.",
    "question": "What is the most effective way to structure this refinement process?",
    "options": {
      "A": "Rewrite the CLAUDE.md instructions from scratch each pass, drafting a full new instruction set covering null checks, enum handling, and import paths, then re-run the 40-spec test set.",
      "B": "Add instructions addressing all three known failure causes - null checks on optional fields, enum handling, and nested-schema import paths - together in a single pass, then re-run the full 40-spec test set.",
      "C": "Skip further prompt changes and re-run the existing workflow against the same 40 specs several times, recording the compile-success rate each run and keeping the run that produced the highest rate.",
      "D": "Make one targeted instruction change addressing the highest-impact failure cause, re-run the test set, confirm the change improved results without introducing new failures, then move to the next cause."
    },
    "correct": "D",
    "explanations": {
      "A": "Discards a validated baseline and re-introduces risk of losing previously-fixed behavior; progressive improvement builds on confirmed gains rather than restarting each cycle with a full rewrite covering every known failure at once.",
      "B": "Bundling instructions for null checks, enum handling, and import paths into one pass makes it impossible to tell which instruction caused which effect, so a regression from one change could be hidden by gains from another, or a failing change could go undetected.",
      "C": "Rerunning an unchanged workflow multiple times and cherry-picking the run with the highest compile-success rate does not fix the underlying causes and treats run-to-run variance as if it were genuine improvement.",
      "D": "Correct. Iterative refinement means isolating one change, measuring its effect against the test set, and confirming it before proceeding to the next issue - this attributes improvement or regression to a specific change and prevents fixes from masking or interacting with each other."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D3.5-2f9b4beb",
    "scenarioType": "Developer Productivity with Claude"
  },
  {
    "taskStatement": "D3.6",
    "domain": "D3",
    "scenario": "On this PR-gating step, the shell script decides pass/fail by grepping Claude's free-text output for the word \"approved.\" Over several weeks you find PRs with real critical issues still pass because Claude wrote \"this looks fine to merge\" instead of \"approved,\" while some clean PRs fail because their wording never matches the grep pattern.",
    "question": "What is the most effective way to make the CI gate reliably reflect Claude's review verdict?",
    "options": {
      "A": "Lower the model's temperature setting to a low value in the CI invocation so Claude produces more consistent wording across runs, then keep matching the same free-text grep pattern against that steadier output to decide pass or fail.",
      "B": "Keep the pipeline invoking Claude non-interactively as before, but route its free-text review output to a human reviewer who reads the full response and manually approves or blocks the merge in the pull request UI before the build completes.",
      "C": "Have Claude emit a structured result (e.g., a JSON object with an explicit pass/fail field) and have the pipeline parse that field programmatically to set the build's exit status, instead of pattern-matching free-text prose.",
      "D": "Add several few-shot examples to the system prompt showing Claude ending its review with the exact word \"approved\" on clean code and a distinct exact word on code with critical issues, so the CI grep pattern matches the modeled wording."
    },
    "correct": "C",
    "explanations": {
      "A": "Lowering temperature and rerunning the same grep against the resulting output may reduce wording variation somewhat, but it does not guarantee a specific parseable token appears in the output, so the underlying free-text matching problem remains.",
      "B": "Inserting a manual review step into the pipeline defeats the purpose of automating the gate in CI and does not fix the unreliable signal - it just papers over it with human effort on every PR.",
      "C": "Correct. A CI gate needs a deterministic, machine-parseable signal. Requiring structured output with an explicit field and using it to drive the build's exit status replaces probabilistic text-matching with programmatic enforcement, eliminating the phrasing-dependent failures.",
      "D": "Adding few-shot examples that model the exact word only raises the odds Claude uses that particular word - it still relies on probabilistic compliance with exact phrasing, which is the root cause of the flaky gate in the first place."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D3.6-376ddfca",
    "scenarioType": "Claude Code for Continuous Integration"
  },
  {
    "taskStatement": "D3.6",
    "domain": "D3",
    "scenario": "The gate posts Claude Code's findings as a PR comment and then the job must exit for the merge gate to read a pass/fail signal, but on-call notes that last week Claude Code sat attached to the CI job's terminal in interactive mode, printing each finding and waiting on a typed confirmation before deciding whether to fail the build — so the job hung until it was manually killed.",
    "question": "Which CI/CD integration design correctly matches how Claude Code should be invoked in this non-interactive pipeline context?",
    "options": {
      "A": "Have Claude Code load a saved session log from the previous CI run for this PR, so it can recall which lines it already flagged and compare the current diff's changed hunks against that stored review history without the pipeline passing in any state.",
      "B": "Have Claude Code classify each finding it makes as blocking or non-blocking and write that severity judgment directly into the CI job's exit code, updating the PR's merge-gate status itself so the job succeeds or fails based on its own assessment.",
      "C": "Run Claude Code in its normal interactive mode inside the CI job, attached to the job's terminal, so it walks through each finding one at a time and waits for a typed confirmation at the prompt before deciding whether to fail the build.",
      "D": "Invoke Claude Code non-interactively per run with the diff and review instructions as input, capture its output and exit status, and have the pipeline script decide the build's pass/fail outcome based on that captured result."
    },
    "correct": "D",
    "explanations": {
      "A": "Each CI invocation is stateless and has no memory of prior runs; expecting it to load a session log or compare against stored review history without the pipeline supplying that context is a misunderstanding of how the integration works.",
      "B": "The pipeline script, not Claude Code itself, is responsible for owning the merge-gate decision - it must inspect the captured output/exit status rather than letting the invocation classify severity and write its own verdict into the CI job's exit code and merge-gate status.",
      "C": "CI jobs run unattended with no one to respond to prompts - interactive mode, with Claude Code waiting on a typed confirmation at the terminal, would hang the pipeline, which is exactly why non-interactive invocation is required for automation.",
      "D": "Correct. CI/CD integration uses non-interactive (headless) invocation because each run is stateless; the pipeline script captures Claude Code's output and translates it into the pass/fail merge-gate decision, letting the team apply its own rule (block only on genuine bugs, not style nits)."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D3.6-2ce01be8",
    "scenarioType": "Claude Code for Continuous Integration"
  },
  {
    "taskStatement": "D4.1",
    "domain": "D4",
    "scenario": "Your extraction pipeline also runs a content-moderation prompt—\"Review the following text and flag it if it violates our content policy\"—on customer-submitted document notes before routing them downstream. Production shows a high flag rate, mostly reviews with strong negative sentiment (\"this product is garbage\") or competitor brand mentions, neither of which violates the policy (hate speech, personal attacks on named individuals, spam links), backlogging manual review.",
    "question": "What is the most effective change to the prompt to reduce these false positives?",
    "options": {
      "B": "Replace the vague instruction with explicit, enumerated criteria defining exactly what counts as a violation (hate speech, personal attacks on named individuals, spam links), and explicitly state that negative sentiment or brand mentions alone do not qualify.",
      "D": "Lower the model's temperature to make its flagging decisions more consistent, so that the same comment receives the same verdict across runs and the borderline cases stop drifting between flagged and unflagged.",
      "A": "Add an instruction telling the model to \"be less strict\" and \"only flag serious violations,\" so it applies a higher bar before escalating a comment and stops routing merely negative-sounding posts into the manual review queue.",
      "C": "Ask the model to output a numeric confidence score alongside its flag decision, and only route to manual review when confidence is high, so that borderline judgments are filtered out before a human ever has to look at them."
    },
    "correct": "B",
    "explanations": {
      "B": "Correct. The root cause is that \"violates content policy\" is undefined, so the model is left to guess the boundary and defaults to over-flagging anything negative-sounding. Enumerating the specific violation categories and explicitly excluding sentiment/brand mentions gives the model concrete, checkable criteria, directly targeting the false-positive cause.",
      "D": "Temperature affects output randomness, not the model's understanding of what the policy covers. It would not stop the model from flagging sentiment or brand mentions it wrongly believes are violations.",
      "A": "A vague directive to \"be less strict\" is just another ambiguous instruction - it doesn't tell the model which specific categories matter, so it doesn't reliably fix the precision problem and could unpredictably suppress real violations too.",
      "C": "Confidence scoring adds a routing mechanism on top of the same underlying ambiguity; if the model's concept of \"violation\" is wrong, its confidence in that wrong judgment doesn't help distinguish true from false positives."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.1-b2ff7677",
    "scenarioType": "Structured Data Extraction"
  },
  {
    "taskStatement": "D4.1",
    "domain": "D4",
    "scenario": "One extraction field asks Claude to classify \"adverse event severity\" as MILD, MODERATE, or SEVERE from clinical trial intake forms for downstream safety-database reporting, using only the instruction \"Extract the adverse event severity from the form text.\" Audits show ambiguous phrasing like \"some discomfort\" is frequently labeled SEVERE even though human reviewers, using a written rubric, consistently call such cases MILD or MODERATE.",
    "question": "What change to the prompt would most directly reduce these false-positive SEVERE classifications?",
    "options": {
      "A": "Add three few-shot examples to the prompt, one demonstrating a MILD case, one a MODERATE case, and one a SEVERE case, each pairing a short excerpt of form text with its correct label, so the model has a labeled example spanning the full severity range to pattern-match new intake narratives against.",
      "B": "Lower the model's temperature to 0 and add an instruction to re-run the same extraction twice, comparing the two outputs and reconciling any mismatch before the final label is written to the safety database, so that classifications become fully deterministic and repeatable across runs.",
      "C": "Replace the vague instruction with explicit criteria defining what qualifies as MILD, MODERATE, and SEVERE (drawn from the human rubric), and instruct the model to select the level supported by explicit textual evidence, flagging genuinely ambiguous cases as \"needs review\" rather than defaulting to SEVERE.",
      "D": "Instruct the model to treat any case lacking a clear, explicit statement of mild or moderate symptoms as SEVERE by default, and to route every such classification directly into the safety database for downstream reporting, since under-flagging a true adverse event carries a higher clinical cost than an unnecessary escalation."
    },
    "correct": "C",
    "explanations": {
      "A": "Three labeled examples still only show the model what unambiguous MILD, MODERATE, and SEVERE cases look like — none of them models an ambiguous case like 'some discomfort,' which is precisely where the boundary is unclear and where the errors are occurring.",
      "B": "Re-running the extraction and reconciling mismatches only catches variation introduced by sampling; if the model's criteria for SEVERE are themselves biased toward over-flagging ambiguous language, running it twice and reconciling will just converge on the same biased label both times.",
      "C": "Correct. The root cause is that the prompt supplies no explicit decision criteria, so the model is guessing at a boundary that humans apply consistently via a written rubric. Encoding that rubric's explicit criteria, tied to an evidence requirement and a defined fallback for ambiguity, directly targets the source of the false positives.",
      "D": "This hard-codes the exact failure mode the audit is complaining about: routing every case lacking an explicit mild/moderate statement straight to SEVERE and into the safety database institutionalizes over-flagging of ambiguous cases rather than giving the model criteria to distinguish genuine severe cases from ambiguous ones."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.1-0c28a0ae",
    "scenarioType": "Structured Data Extraction"
  },
  {
    "taskStatement": "D4.1",
    "domain": "D4",
    "scenario": "Your resolution agent's prompt tells it to call escalate_to_human whenever a request \"seems important.\" In production the agent invokes escalate_to_human on 38% of tickets, but a manual audit finds only about 9% actually warranted a human handoff — tickets like \"my dashboard font looks slightly off\" are escalated alongside genuine billing disputes and account lockouts, overwhelming the on-call queue with false positives.",
    "question": "What is the most effective change to the prompt to reduce these false positives?",
    "options": {
      "D": "Replace \"seems important\" with explicit, objective criteria defining urgency (e.g., active service outage, data loss, security incident, or revenue-impacting bug affecting multiple customers), paired with examples of tickets that look severe but should NOT be flagged.",
      "C": "Lower the model's temperature setting so that classification decisions become more deterministic and consistent across similar tickets, removing the run-to-run variation that currently lets near-identical tickets be routed differently.",
      "A": "Add several few-shot examples of correctly flagged urgent tickets, without changing the underlying instruction text, so the model has concrete precedent for what has previously warranted escalation and can pattern-match against it.",
      "B": "Change the instruction to \"only flag a ticket as urgent if you are very confident it truly needs escalation,\" raising the bar the model applies before escalating so that marginal tickets are left for normal-queue handling."
    },
    "correct": "D",
    "explanations": {
      "D": "Correct. The root cause is that \"seems important\" is subjective, leaving the definition of urgency to the model's guesswork. Explicit, objective criteria plus counter-examples of severe-looking but non-urgent tickets give the model a concrete boundary to apply, directly reducing false positives.",
      "C": "Temperature affects sampling randomness, not the model's understanding of what \"urgent\" means. It would make the same ambiguous judgment more repeatable, not more accurate, so false positives would persist.",
      "A": "Few-shot examples of only correctly flagged urgent tickets show what urgent looks like but don't establish the boundary against tickets that look severe but aren't - the ambiguous criteria remain the root problem.",
      "B": "Asking the model to be \"very confident\" adds a vague qualitative hedge rather than concrete criteria, so it still relies on the model's own undefined notion of importance and does not reliably reduce false positives."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.1-20213870",
    "scenarioType": "Customer Support Resolution Agent"
  },
  {
    "taskStatement": "D4.2",
    "domain": "D4",
    "scenario": "Monitoring the line-item extraction step, you find that on vendor invoices with multi-line discounts, bundled products, or handwritten annotations, Claude inconsistently applies discounts at the line-item level versus the invoice-total level, and sometimes omits the discount field entirely rather than setting it to zero, before the JSON reaches the accounting system.",
    "question": "What is the most effective change to improve consistency on these edge cases?",
    "options": {
      "A": "Add a JSON schema field description clarifying that discount is a required numeric field, and update the extraction call to pass that revised schema so the model validates each line item against the stricter field constraint before the output reaches the accounting system.",
      "B": "Lower the temperature to 0 so the model samples the highest-probability token at each decoding step, producing more deterministic output across repeated runs on the same invoice text and stabilizing which value it selects when the schema field is ambiguous.",
      "C": "Rewrite the system prompt with a longer, more detailed natural-language explanation of how discounts should be allocated across line items, walking through the bundling and multi-line discount cases step by step ahead of the extraction instructions.",
      "D": "Add 3-5 few-shot examples in the prompt that show fully worked input-output pairs covering the ambiguous cases (multi-line discounts, bundles, discount = 0), demonstrating the exact field-level convention to apply."
    },
    "correct": "D",
    "explanations": {
      "A": "Schema validation can enforce that a field is present and numeric, and passing the revised schema on every extraction call will reject a response missing the field, but it cannot teach the model which allocation convention to use or guarantee the model fills the field with the semantically correct value rather than a placeholder like 0.",
      "B": "Temperature affects randomness in token sampling, not the model's underlying interpretation of ambiguous business logic - forcing deterministic decoding at each step would make the model consistently repeat whatever convention it defaults to, but would not resolve inconsistent discount allocation or missing fields caused by an underspecified task.",
      "C": "More prose instructions describing the desired behavior in the abstract, even walked through step by step for each case, are less effective than concrete worked examples at conveying an exact convention, and risk adding ambiguity rather than resolving it.",
      "D": "Correct. Few-shot examples that concretely demonstrate the desired input-output behavior on the specific ambiguous cases teach the model the exact convention (e.g., always populate discount, allocate at line level) far more reliably than abstract instructions, directly improving consistency on the edge cases causing errors."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.2-d09b51ec",
    "scenarioType": "Structured Data Extraction"
  },
  {
    "taskStatement": "D4.3",
    "domain": "D4",
    "scenario": "For the invoice-extraction pipeline, the prompt asks Claude to \"respond only with JSON matching this schema,\" with the schema given as text, and the downstream accounts-payable system parses the response directly as JSON. Logs show 8% of extractions fail that parse because Claude prepends an explanatory sentence, wraps the JSON in markdown code fences, or adds trailing commentary after the closing brace.",
    "question": "What is the most effective way to eliminate these parsing failures?",
    "options": {
      "A": "Set the temperature parameter to 0 in the API call, forcing deterministic sampling that always selects the highest-probability token, so the same invoice input produces the same output every time.",
      "B": "Keep the prompt-based JSON instructions, but add a post-processing step that runs a regex over the response to strip leading prose, markdown fences, and trailing text after the closing brace before parsing.",
      "C": "Define an extraction tool whose input schema describes the required fields and types, and force the model to call it with tool_choice, so the extraction arrives as a structured tool_use block instead of free text.",
      "D": "Add several few-shot examples to the prompt, each pairing a sample invoice with correctly formatted JSON containing no leading text or trailing commentary, so the model learns the expected output pattern from the demonstrations."
    },
    "correct": "C",
    "explanations": {
      "A": "Temperature affects sampling variability, not structural conformance; a deterministic model can still deterministically produce a preamble or fences on every run.",
      "B": "Treats a structural enforcement problem as text cleanup: regex stripping is brittle against variation in fence placement, nested code blocks, and where trailing commentary appears, and does nothing to prevent malformed JSON itself.",
      "C": "Correct. Tool use with a JSON schema turns output format into a programmatically enforced contract: the extraction arrives as a structured tool_use block, never as prose - eliminating JSON syntax errors, preamble, and markdown wrapping at the source. Semantic errors (values in the wrong field, line items that don't sum) still require downstream validation.",
      "D": "Few-shot examples raise the odds of clean output, but compliance stays probabilistic - the same class of formatting failure continues at some rate no matter how many demonstrations are added."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.3-a7b681af",
    "scenarioType": "Structured Data Extraction"
  },
  {
    "taskStatement": "D4.4",
    "domain": "D4",
    "scenario": "Reviewing accuracy metrics for the JSON extraction of vendor invoice line items (SKU, quantity, unit price, total), you find the pipeline forwards every extraction straight to accounts payable without checks, and roughly 8% fail downstream: some are missing required fields, some have totals that don't equal quantity × unit price, and a few carry SKUs absent from the vendor catalog — surfacing days later as payment errors.",
    "question": "What is the most effective way to reduce the rate of bad extractions reaching accounts payable?",
    "options": {
      "A": "Rewrite the system prompt with expanded instructions and worked examples that walk through computing quantity × unit price and cross-checking each SKU against a sample catalog listing, so Claude internalizes the correct extraction pattern before generating any output.",
      "B": "Set the model's temperature parameter to 0 for every extraction call, since sampling randomness is what produces inconsistent field values, and a fixed low-temperature setting will make Claude's token selection deterministic enough that totals and SKUs converge on one stable output per invoice.",
      "C": "Route each invoice through a second, independent Claude call that re-extracts the same fields from scratch, then automatically overwrite the first JSON result with the second call's values whenever any field differs, treating the second pass as a fresh, more considered attempt at the document.",
      "D": "Add a validation stage that checks schema conformance, arithmetic consistency (quantity × unit price = total), and SKU existence against the catalog; on failure, send the document and the specific error back to Claude for a bounded number of retries before routing to human review."
    },
    "correct": "D",
    "explanations": {
      "A": "Prompt refinement, even with worked examples and step-by-step arithmetic walkthroughs, relies on probabilistic compliance and cannot guarantee arithmetic consistency or catalog membership - it may reduce the error rate somewhat but provides no deterministic backstop, so bad extractions will still reach accounts payable undetected.",
      "B": "Misdiagnoses the problem: missing fields, arithmetic mismatches, and invalid SKUs are extraction accuracy failures, not sampling-variance artifacts, so forcing deterministic token selection via temperature=0 would not reliably fix them and offers no way to catch the ones that still occur.",
      "C": "Running a second extraction and blindly overwriting on disagreement has no way to determine which of the two outputs (if either) is actually correct, and it still lacks any programmatic validation against the schema, arithmetic, or catalog - so invalid results can still pass through.",
      "D": "Correct. Programmatic checks (schema conformance, arithmetic consistency, catalog lookup) can deterministically catch exactly these failure modes rather than hoping the model avoids them. Feeding the specific validation error back to Claude gives it the information needed to self-correct, a bounded retry count prevents infinite loops, and routing persistent failures to human review ensures bad data never silently reaches accounts payable."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.4-ae411e5a",
    "scenarioType": "Structured Data Extraction"
  },
  {
    "taskStatement": "D4.4",
    "domain": "D4",
    "scenario": "For invoice extraction, validation fails on 18% of documents — mostly totals not summing from line items, inconsistent date formats, and missing required fields on multi-page invoices — and the near-identical retry prompt matches the original error rate.",
    "question": "The retry success rate on the second attempt is nearly the same as the first (identical failures recur most of the time). What change would most effectively improve extraction quality on retry?",
    "options": {
      "A": "On validation failure, send a follow-up turn that includes the original output, the specific schema validation error (e.g., which field failed and why, such as \"totals field does not equal sum of line items\"), and a request to correct only that issue.",
      "B": "On validation failure, resend the same extraction prompt up to three times and accept whichever attempt passes validation first, relying on sampling variation across attempts to eventually produce an output that satisfies the schema.",
      "C": "Lower the temperature to 0 for all extraction calls so retries are more likely to converge on a valid result, removing the sampling randomness that lets the same document produce different field values on different attempts.",
      "D": "Skip retries entirely and route every validation failure to a human reviewer queue for manual correction, accepting the review cost in exchange for a guarantee that no invalid extraction is ever accepted automatically."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Feeding the specific validation error back to the model gives it concrete information about what actually failed, turning the retry into a targeted correction rather than a repeat of the same blind attempt.",
      "B": "This is what the pipeline already does, and the scenario shows it doesn't work - without feedback about what failed, the model has no new information and tends to repeat the same mistake.",
      "C": "Temperature controls sampling randomness, not whether the model knows which field was wrong; it does not address the root cause of repeated identical failures.",
      "D": "Discards the opportunity to let the model self-correct with targeted feedback, and is disproportionate for a large share of documents when many failures (e.g., formatting or arithmetic mismatches) are the kind a corrective retry could resolve without human effort."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.4-818e17ca",
    "scenarioType": "Structured Data Extraction"
  },
  {
    "taskStatement": "D4.5",
    "domain": "D4",
    "scenario": "One extraction stage classifies and tags 200,000 support-ticket documents each night into categories (billing, technical, account) for a downstream analytics dashboard that refreshes once at 9 AM, so the job only needs to finish before then. The team currently sends each ticket as a separate synchronous API call, which costs roughly $4,000/month and occasionally hits rate limits when the queue backs up.",
    "question": "What is the most effective change to reduce cost while still reliably meeting the 9 AM dashboard deadline?",
    "options": {
      "D": "Submit the 200,000 tickets as a single Message Batches API job with a custom_id per ticket, kicked off with enough lead time before 9 AM, and poll for batch completion.",
      "B": "Keep real-time synchronous calls but add exponential backoff and retry logic to handle rate limits more gracefully.",
      "C": "Switch to the Message Batches API, but submit tickets in many small batches throughout the night to guarantee low latency per batch.",
      "A": "Move the job to the Message Batches API and set a strict 30-minute timeout that falls back to real-time calls for any tickets not yet processed."
    },
    "correct": "D",
    "explanations": {
      "D": "Correct. This is a non-blocking, deadline-tolerant overnight workload, exactly the profile suited to the Message Batches API's 50% cost savings. Batch results are correlated via custom_id, so the full set of tickets can be submitted as one job with sufficient lead time and polled for completion well before the 9 AM refresh, without per-ticket real-time calls or rate-limit pressure.",
      "B": "Backoff and retry logic addresses rate-limit symptoms but does nothing to reduce the underlying per-call cost, which is the actual problem the team wants to solve.",
      "C": "Splitting into many small batches adds unnecessary complexity and operational overhead for no benefit - the workload has no per-item latency requirement, so one larger batch submitted with lead time is simpler and achieves the same cost savings.",
      "A": "A short timeout with real-time fallback reintroduces the very synchronous calls (and their cost and rate-limit issues) the switch to batching was meant to eliminate, and is unnecessary given batch jobs can be started well ahead of the non-urgent 9 AM deadline."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.5-e7e74253",
    "scenarioType": "Structured Data Extraction"
  },
  {
    "taskStatement": "D4.5",
    "domain": "D4",
    "scenario": "The vendor invoice extraction pipeline handles two workloads: an 8,000-invoice nightly archive backlog needing only \"done before next morning's finance reconciliation,\" and live vendor-portal submissions needing sub-second parsing so the portal can confirm receipt instantly. A new engineer proposes routing both through the Message Batches API since they share the same extraction prompt and schema.",
    "question": "How should this proposal be evaluated?",
    "options": {
      "A": "Keep both workloads on real-time calls, processing each invoice synchronously through the standard Messages endpoint so the extraction output and schema validation result return within the same request-response cycle that submitted the invoice.",
      "B": "Route the nightly archive backlog through the Message Batches API, since it only needs to finish before the next business day, while keeping the live vendor-portal submissions on real-time API calls that return confirmation immediately.",
      "C": "Route both workloads through the Message Batches API, submitting each portal invoice as its own batch request and having the portal poll the batch status endpoint at short intervals until the results field populates, then confirm receipt to the vendor.",
      "D": "Route both workloads through the Message Batches API, and add a fallback that reissues any request as a real-time call to the standard Messages endpoint once a timer set to a few seconds after batch submission elapses without a completed result."
    },
    "correct": "B",
    "explanations": {
      "A": "Reflects a misconception - batch results can be correlated back to their originating requests using custom identifiers, so matching output to source records is not a real obstacle to using batch processing where it fits.",
      "B": "Correct. The Message Batches API offers meaningful cost savings but has processing times without a guaranteed low-latency SLA, making it well suited to the nightly backlog's overnight deadline. The vendor portal needs to confirm receipt within seconds, which requires real-time calls instead.",
      "C": "Polling a batch for a workload that must confirm receipt within seconds does not meet the portal's latency requirement - batches are not designed to complete quickly enough for that use case, so this polling loop would routinely still be waiting when the portal needs to respond to the vendor.",
      "D": "A few-seconds timeout is far shorter than realistic batch processing windows, so this fallback would fire on essentially every portal request, making the batch routing pointless overhead for the portal workload while still failing to use batching appropriately for the backlog."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.5-3d248b7e",
    "scenarioType": "Structured Data Extraction"
  },
  {
    "taskStatement": "D4.5",
    "domain": "D4",
    "scenario": "Monitoring the 40,000-document monthly loan-application batch, you find the team's synchronous, sequential per-document API calls regularly trip rate limits, require manual retry logic, and have made per-request pricing the largest line item in the pipeline's operating budget—despite the extracted JSON only needing to be ready for analyst review the following business day.",
    "question": "What is the most effective change to this pipeline's processing strategy?",
    "options": {
      "B": "Submit the documents through the Message Batches API, assigning each request a custom_id to correlate extracted output back to its source document once the batch completes.",
      "A": "Keep the synchronous real-time calls but add exponential backoff and retry logic to handle rate-limit errors more gracefully.",
      "D": "Submit the documents through the Message Batches API, but poll the batch status every few seconds so analysts can start reviewing extracted records as soon as possible.",
      "C": "Add prompt caching for the shared extraction instructions on the existing real-time calls to reduce token costs without changing the request pattern."
    },
    "correct": "B",
    "explanations": {
      "B": "Correct. The workload is high-volume with no real-time latency requirement, which is exactly the profile the Message Batches API is designed for, and its cost savings directly addresses the budget problem. custom_id fields let each result be correlated back to its source document, so results can be matched up regardless of the order they complete in.",
      "A": "Treats the symptom (rate-limit errors) rather than the root cause. It keeps per-request real-time pricing and captures none of the batch cost savings, while the underlying workload still has no need for real-time processing.",
      "D": "Misunderstands the Message Batches API's operating model - it is designed for asynchronous completion, not sub-minute turnaround, and next-business-day review does not require frequent status polling. Aggressive polling adds unnecessary overhead without changing when results are actually ready.",
      "C": "Prompt caching can reduce token costs but is a separate lever from request pattern; it does not resolve the rate-limit issues or capture the larger savings available from batching a workload that has no real-time requirement."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.5-8270f040",
    "scenarioType": "Structured Data Extraction"
  },
  {
    "taskStatement": "D4.6",
    "domain": "D4",
    "scenario": "For an 80-page vendor contract, the extraction schema's indemnification, liability-cap, and termination clause fields sometimes pull the original body clause, sometimes the exhibit's superseding language, and occasionally both as conflicting entries with no indication of which governs, while clauses embedded only in appendices are frequently missed entirely.",
    "question": "How should the review architecture be redesigned to address these failures?",
    "options": {
      "A": "Run three independent full-document extraction passes and retain only the clauses that appear identically in at least two of the three outputs, tagging each with a confidence score.",
      "B": "Run per-section passes (body, appendices, exhibits) for local clause extraction, followed by a separate reconciliation pass that resolves cross-references and determines which of any conflicting clauses governs.",
      "C": "Keep the single full-document pass but have it emit a confidence flag for any clause it is uncertain about, then route those flagged clauses to the downstream contract database for resolution.",
      "D": "Switch to a model with a larger context window and raise the maximum output token limit so the entire contract, including all appendices and exhibits, fits into a single processing pass that extracts every clause directly into the schema."
    },
    "correct": "B",
    "explanations": {
      "A": "Majority voting across identical full-document passes, even with a per-clause confidence score attached, would suppress the exhibit-override clauses precisely because they appear inconsistently - the real signal (a conflict that needs resolving) looks like noise to a voting scheme and gets discarded rather than resolved.",
      "B": "Correct. Splitting by section prevents attention dilution across a long document so appendix and exhibit clauses are no longer missed, and a dedicated reconciliation pass is needed because determining which of two conflicting clauses governs requires comparing outputs across sections - something no single per-section pass can do on its own.",
      "C": "Pushes a task that requires document understanding (deciding which clause legally governs) onto a downstream system that only receives a confidence flag and the flagged clause text, not the contract structure or cross-referenced exhibit language needed to adjudicate the conflict.",
      "D": "Misdiagnoses the problem as a context-capacity or token-limit constraint. The scenario shows the failure is inconsistent attention and unresolved cross-references, not that the document doesn't fit in context - fitting everything into one extraction call does not add a reconciliation step for competing clauses."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.6-4739092d",
    "scenarioType": "Structured Data Extraction"
  },
  {
    "taskStatement": "D4.6",
    "domain": "D4",
    "scenario": "The pipeline's invoice-extraction accuracy sits at 61% on multi-page invoices with itemized tables spanning several pages, per-page subtotals, and handwritten annotations, versus near-perfect on simple one-page invoices: line items from page 2 onward get dropped, the grand total is miscomputed, and illegible tax IDs are sometimes hallucinated.",
    "question": "Which architecture change would most effectively raise extraction reliability on the complex multi-page invoices?",
    "options": {
      "A": "Keep the single-pass design but lengthen the prompt with highly detailed field-by-field extraction rules, explicit instructions for handling multi-page tables, and several additional few-shot examples of correctly extracted invoices with subtotals and tax IDs.",
      "B": "Split extraction into a per-page pass that captures line items and subtotals from each page independently, followed by a separate aggregation pass that sums subtotals and reconciles the grand total and tax ID against the assembled per-page data.",
      "C": "Replace the single Claude call with a larger-context-window model so the entire multi-page invoice, including annotations, itemized tables, and per-page subtotals, fits comfortably within the context limit and is extracted in one pass.",
      "D": "Run three independent full-document extraction passes over the line items, subtotals, and tax ID, then accept only the field values that appear identically across at least two of the three separately generated outputs."
    },
    "correct": "B",
    "explanations": {
      "A": "More detailed instructions, explicit table-handling rules, and additional few-shot examples rely on the model correctly attending to every item across a long, complex document in a single pass - they do not address the root cause of dropped items and miscomputed totals on multi-page inputs.",
      "B": "Correct. Per-page passes reduce the amount of content each call must attend to, addressing the attention dilution causing dropped line items and hallucinated fields, while a dedicated aggregation pass handles the cross-page reconciliation (summing subtotals, computing the grand total, resolving the tax ID) that a single page-level pass cannot see on its own.",
      "C": "Misdiagnoses the problem as a context-capacity limitation rather than attention dilution and error accumulation over a long, complex, table-heavy input; fitting more content into one pass does not prevent the model from missing items or hallucinating illegible fields.",
      "D": "Majority voting across full-document passes does not fix the underlying issue: attention dilution across a long, table-heavy document tends to produce the same kind of errors (dropped page-2 items, hallucinated illegible fields) in each independent run, so consensus can still converge on an incomplete or wrong answer while tripling cost."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.6-1c6cb123",
    "scenarioType": "Structured Data Extraction"
  },
  {
    "taskStatement": "D4.6",
    "domain": "D4",
    "scenario": "Post-merge incident analysis of this PR review process shows recurring blind spots: a SQL injection pattern repeated across five files, a hardcoded secret in a config file, and an outdated dependency with a known CVE all slipped through, even though this 40-file pull request also touches authentication and database access and the findings the process does surface are usually accurate.",
    "question": "The team wants to restructure the review to catch more of these missed vulnerability categories without suppressing the valid findings the current process already produces. Which architecture should they adopt?",
    "options": {
      "A": "Split the review into one pass per file across all 40 files, feeding each file diff and its surrounding context to the model, with every pass using the same general check for security vulnerabilities instruction.",
      "B": "Run separate review passes each scoped to a distinct vulnerability category (e.g., injection flaws, authentication/authorization, secrets exposure, dependency risk), then merge the findings across passes.",
      "C": "Run the same full-diff security review prompt three independent times over all 40 files, tally which issues each run flags across authentication, database, and dependency code, and surface an issue only if it is flagged in at least two of the three runs.",
      "D": "Keep a single review pass over the full diff spanning authentication, database access, and dependency changes, but raise the model sampling temperature parameter to encourage it to surface a more diverse set of issues within that one pass."
    },
    "correct": "B",
    "explanations": {
      "A": "Per-file passes can help with issues local to one file, but the missed issues here are cross-cutting (an injection pattern repeated across five files, a dependency-wide CVE) - splitting by file while feeding each pass the same generic instruction does not give any pass a focused lens for these categories.",
      "B": "Correct. Scoping each pass to a distinct vulnerability category narrows what that pass has to attend to, reducing the attention dilution that caused the single general pass to miss cross-cutting issues like a repeated injection pattern or a stray secret. Merging findings across category-focused passes catches issues a single broad pass, or passes split only by file, would overlook.",
      "C": "Requiring agreement across identical runs suppresses genuine findings instead of catching more of them - identical passes tend to share the same blind spots, so tallying overlap across three runs of the same prompt discards true positives that only one run happens to catch, worsening the exact problem the team is trying to fix.",
      "D": "Raising the sampling temperature does not address attention dilution across a large diff; it only makes a single pass's output less consistent without systematically expanding what categories of issues get checked across the authentication, database, and dependency code it spans."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.6-9f30f3b0",
    "scenarioType": "Claude Code for Continuous Integration"
  },
  {
    "taskStatement": "D5.1",
    "domain": "D5",
    "scenario": "In the same billing dispute conversation, the customer states in turn 4 that they hold a grandfathered legacy plan with a contractual 48-hour refund SLA; by turn 150 the platform's context window management has begun dropping or summarizing early turns, and the agent then proposes standard (non-legacy) pricing with the standard 5-day refund timeline via process_refund.",
    "question": "What is the most effective way to prevent this loss of critical information across the long conversation?",
    "options": {
      "A": "Rely on the platform's default automatic context summarization, which compresses older turns into a condensed narrative and drops or de-prioritizes turns it scores as less relevant, to retain whatever information is most relevant as the conversation grows.",
      "B": "Add a single reminder in the initial system prompt, framed as a bulleted list of the customer's plan type and SLA terms, instructing the agent to remember and reapply those facts for the rest of the conversation.",
      "C": "Increase the max_tokens parameter on each API call so the model can generate longer, more detailed responses that restate the customer's plan type and SLA terms alongside its proposed resolution.",
      "D": "Maintain an explicit, periodically-updated summary or structured state object containing critical facts (e.g., plan type, SLA terms), and re-inject it into context so it survives truncation or summarization of the raw turn history."
    },
    "correct": "D",
    "explanations": {
      "A": "Default automatic summarization is lossy and not guaranteed to prioritize the specific critical details (like a one-off contractual SLA) that matter for this case - its scoring and compression process caused the problem in the first place.",
      "B": "A one-time instruction at the start of a long conversation is a probabilistic approach; even framed as a bulleted list, as the conversation grows and earlier turns are truncated or de-prioritized, there is no guarantee the model retains or re-applies that early reminder 150+ turns later.",
      "C": "max_tokens controls the length of a single generated response, not how much prior conversation context is retained - generating longer output does not cause the model to recall facts from turns that have already been truncated or summarized out of the context window.",
      "D": "Correct. Explicitly extracting and persisting critical facts into a structured, periodically-refreshed summary ensures they remain available regardless of how the raw transcript is truncated or compressed as the conversation grows."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.1-1ae10339",
    "scenarioType": "Customer Support Resolution Agent"
  },
  {
    "taskStatement": "D5.2",
    "domain": "D5",
    "scenario": "Applied to commercial lease contracts at 10,000/day, extracting rent amount, renewal terms, termination date, and indemnification clauses, the flag_for_review field is flagging unfamiliar-but-valid indemnification boilerplate at a high false-positive rate while silently passing through genuine conflicts, like a termination date stated as \"March 1\" in the summary but \"March 31\" in the body, with no flag at all.",
    "question": "What is the most effective way to fix the agent's escalation calibration?",
    "options": {
      "A": "Add explicit escalation criteria to the extraction prompt that distinguish genuine data conflicts (contradictory values for the same field within a document) from merely unfamiliar phrasing of a standard clause, with few-shot examples of each category.",
      "B": "Have the agent assign a numeric self-reported confidence score to each extracted field and escalate any field scoring below a fixed threshold, so that the agent's own uncertainty becomes the trigger for human review.",
      "D": "Train a separate classifier on past human review decisions to pre-filter which contracts are routed to the extraction agent versus straight to human review, using the reviewers' own historical judgments as the routing signal.",
      "C": "Lower the overall sensitivity of the flag_for_review logic so fewer contracts are escalated, reducing reviewer workload and keeping the queue focused on the contracts most likely to contain a genuine problem."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. The root cause is an undefined decision boundary - the agent has no criteria to distinguish 'novel phrasing of a known concept' from 'actual conflicting data.' Explicit criteria plus few-shot examples of each category directly target this, the same low-effort, high-leverage fix as clarifying any other ambiguous decision boundary in a prompt.",
      "B": "LLM self-reported confidence is poorly calibrated - the agent is already confidently wrong on the conflicting-date cases, so a self-reported score would not reliably catch what it currently misses, and would not fix why unfamiliar-but-valid phrasing gets over-flagged.",
      "D": "Over-engineered as a first step. It also does not address the underlying issue: the extraction agent itself lacks criteria for what counts as ambiguous, so a pre-filter trained on the same noisy signal would inherit the same miscalibration.",
      "C": "Misdiagnoses the problem as one of overall sensitivity rather than criteria. Uniformly lowering sensitivity would reduce false positives on unfamiliar phrasing but worsen the more serious failure - genuine conflicts like the mismatched termination dates already going undetected."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.2-d5f2fb8d",
    "scenarioType": "Structured Data Extraction"
  },
  {
    "taskStatement": "D5.3",
    "domain": "D5",
    "scenario": "Your resolution agent's billing subagent calls an external payment-processor tool through process_refund; that tool sometimes fails with a transient timeout and sometimes with a permanent \"account not found\" error, but the subagent catches both the same way and returns \"Sorry, I couldn't process that\" to the coordinator either way.",
    "question": "Because the coordinator receives identical, unstructured error text for both failure types, it cannot decide whether to retry or escalate, so it currently just relays a generic apology to the customer in both cases. What is the most effective way to fix the error propagation between the billing subagent and the coordinator?",
    "options": {
      "A": "Have the billing subagent return structured error information that categorizes each failure as transient/retryable or permanent/non-retryable, so the coordinator can retry transient failures and escalate permanent ones appropriately.",
      "B": "Wrap the payment-processor tool call in a fixed retry loop that automatically retries every failure up to three times before giving up, so transient processor timeouts clear themselves without the coordinator being involved at all.",
      "C": "Have the billing subagent retry internally without ever informing the coordinator, and only report back a final success or failure, keeping the retry logic local to the subagent that actually understands the payment processor.",
      "D": "Update the billing subagent's system prompt to instruct it to phrase error messages to the customer more empathetically, so that the generic apology the coordinator currently relays lands better with the customer receiving it."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Propagating structured, categorized error information (transient vs. permanent) up to the coordinator gives it the information it needs to apply the right strategy to each failure type, rather than treating all failures identically.",
      "B": "Blindly retrying every failure wastes attempts on the permanent 'account not found' error, which will never succeed, and delays the escalation the customer actually needs.",
      "C": "Hiding retries and failure detail from the coordinator removes the information the coordinator needs to make a routing decision, and risks the subagent retrying a non-retryable error indefinitely without anyone noticing.",
      "D": "Changes only the wording shown to the customer; it does nothing to fix the underlying problem that the coordinator cannot distinguish retryable from non-retryable failures."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.3-b64e597d",
    "scenarioType": "Customer Support Resolution Agent"
  },
  {
    "taskStatement": "D5.2",
    "domain": "D5",
    "scenario": "In one deployment, engineers building an incident-response agent give it MCP tools query_metrics, restart_service, scale_replicas, and page_oncall. A month of production logs shows it paging on-call at 2 a.m. for a routine, runbook-documented pod restart loop, while during an actual primary database connection pool exhaustion under traffic, it silently ran scale_replicas and restart_service against the production database tier and caused a brief customer-visible outage.",
    "question": "What is the most effective way to fix the agent's escalation calibration?",
    "options": {
      "A": "Train a separate classifier on historical incident tickets, using features such as alert type, affected service tier, and time of day, to predict whether a given alert should be auto-remediated or escalated, and feed that prediction into the agent's routing step ahead of any tool execution.",
      "B": "Remove restart_service and scale_replicas from the agent's toolset entirely, requiring a human operator to invoke those actions manually via the on-call runbook, and restrict the agent to read-only tools such as query_metrics plus the page_oncall escalation path for production changes.",
      "C": "Define explicit escalation criteria in the system prompt, grounded in the blast radius and reversibility of the action rather than symptom type, with few-shot examples distinguishing routine pre-approved fixes from actions on shared production infrastructure that require paging first.",
      "D": "Replace human paging with a self-reported confidence score from one to ten that the agent computes after evaluating the alert against the runbook, routing to on-call only when that score falls below a configured threshold, and logging the score alongside every remediation action it takes."
    },
    "correct": "C",
    "explanations": {
      "A": "Over-engineered before simpler prompt-level fixes have been tried, and still doesn't address that the agent is reasoning about the wrong signal (symptom type instead of action risk).",
      "B": "Solves the immediate danger but is disproportionate - it eliminates all autonomous remediation, including the routine low-risk cases the agent should legitimately handle, rather than fixing the miscalibrated escalation logic.",
      "C": "Correct. The root cause is unclear decision boundaries: the agent is escalating based on symptom familiarity rather than the actual risk of the action it is about to take. Explicit criteria tied to blast radius/reversibility, reinforced with few-shot examples, is the proportionate first step to recalibrate when to escalate.",
      "D": "LLM self-reported confidence is poorly calibrated - the agent was confidently wrong on the highest-stakes case (the database incident), so a confidence gate would not have caught it."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.2-2de587b7",
    "scenarioType": "Developer Productivity with Claude"
  },
  {
    "taskStatement": "D5.3",
    "domain": "D5",
    "scenario": "A structured data extraction pipeline processes scanned insurance claim forms through three agents: an extraction agent parses each PDF into JSON fields (policy_number, claim_amount, incident_date), a validation agent checks the JSON against a schema, and an integration agent submits validated claims to the downstream claims-processing system. When the extraction agent cannot confidently read a field - for example, a smudged or handwritten policy number - it currently substitutes an empty string rather than signaling a problem. Because the schema does not require policy_number to be non-empty, the validation agent lets these records pass through unchanged, and the integration agent submits claims with blank policy numbers. Days later, hundreds of claims are found rejected or misassigned to the wrong policyholder, even though every agent in the pipeline reported success at the time.",
    "question": "What is the most effective way to fix the error propagation strategy across this pipeline?",
    "options": {
      "A": "Have the extraction agent emit a structured error object identifying which field failed and why (e.g., \"policy_number: extraction_failed - illegible\") instead of silently substituting an empty string, so downstream agents can distinguish a genuine failure from a legitimately empty field and branch accordingly.",
      "B": "Update the extraction agent's system prompt to instruct it to leave fields blank when it cannot confidently extract them, and to append a prose summary at the end of its response naming any low-confidence fields, which the validation agent can read alongside the JSON payload and cross-reference against blank fields before the integration agent submits the claim.",
      "C": "Have the integration agent add defensive null-checks immediately before submission, scanning each claim's policy_number, claim_amount, and incident_date for missing or blank values and rejecting any claim whose critical fields are empty, routing rejected claims to a separate queue for manual review before they reach the claims-processing system.",
      "D": "Increase the extraction agent's retry count and add exponential backoff so it makes more attempts to re-parse the PDF and re-run OCR on the policy_number field before returning a result, resubmitting the same document image to the extraction model multiple times until a non-empty value is produced or the retry budget is exhausted."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. The root cause is that a real failure (illegible field) is indistinguishable from a legitimate value once it becomes a silent empty string. A structured, explicit error signal preserves that distinction as the result moves between agents, letting the validation and integration agents make correct, deterministic decisions instead of inheriting an ambiguous default.",
      "B": "Still relies on probabilistic compliance with a prompt instruction, and the error signal lives only in unstructured prose. The validation agent would have to reliably parse free text and match field names against the JSON every time to catch the problem, which is not a dependable mechanism compared to a structured, checkable error field.",
      "C": "Only catches the symptom at the last stage, after the validation agent has already been misled into approving the record. Scanning for blank fields immediately before submission does not tell you whether a blank is a genuine extraction failure or a legitimately empty field, and it does nothing for any other consumer of the extraction agent's output earlier in the pipeline.",
      "D": "Retries and backoff address transient failures, such as a flaky OCR call that might succeed on a second pass. Repeatedly re-running OCR on a genuinely illegible policy_number will not produce a correct value no matter how many attempts are made, and this approach does nothing to communicate the failure to downstream agents once the retry budget is exhausted."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.3-f0bb8acc",
    "scenarioType": "Structured Data Extraction"
  },
  {
    "taskStatement": "D5.4",
    "domain": "D5",
    "scenario": "While helping a developer trace how authentication and session handling work across the monolith, Claude reads files sequentially starting from the repository root and runs out of context budget partway through the services/ directory — over 6,000 files exist in the repo, most unrelated to auth, and Claude never reaches the auth/ or middleware/ folders where the relevant logic actually lives.",
    "question": "What is the most effective way to restructure this exploration so Claude reliably finds and explains the relevant auth logic?",
    "options": {
      "A": "Switch to a model with a larger context window, sized to fit the full 6,000-file repository in a single pass, loading every file's contents so the services/, auth/, and middleware/ directories are all analyzed together for auth logic.",
      "B": "Have Claude read every file in the repository sequentially in file-system order, generating a running summary immediately after each file to keep accumulated context small, continuing through services/, auth/, and middleware/ until all files are summarized.",
      "C": "Spawn one subagent tasked with reading the entire repository in a single continuous pass and compiling a full summary of every directory, including services/, auth/, and middleware/, using sequential Read calls to gather each file's content.",
      "D": "First use Glob/Grep to locate files and directories matching auth-related terms (e.g., \"session\", \"login\", \"authenticate\"), then Read only the specific files or code sections those searches surface, expanding scope only as needed."
    },
    "correct": "D",
    "explanations": {
      "A": "A bigger window doesn't fix the root inefficiency - loading every file's contents, including the thousands unrelated to auth, still spends context and attention on irrelevant code, and the relevant files may still be reached too late or at the cost of a much more expensive call.",
      "B": "Still requires reading the full content of every file in file-system order at least once before summarizing it, which is unnecessary and slow when the relevant code is confined to a few directories; summarizing after the fact doesn't solve the problem of not finding the right files first.",
      "C": "Discards the fastest way to narrow scope (search) in favor of brute-force reading, and having a single agent work through the entire repository's directories via sequential Read calls in one pass reintroduces the same context-budget exhaustion problem the scenario describes, just inside a subagent instead.",
      "D": "Correct. Targeted search tools (Glob/Grep) narrow exploration to relevant files before spending context on Read, letting Claude reach the actual auth/middleware code instead of exhausting its context budget on unrelated directories encountered first."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.4-54d531f5",
    "scenarioType": "Developer Productivity with Claude"
  },
  {
    "taskStatement": "D5.5",
    "domain": "D5",
    "scenario": "In your extraction pipeline, packing-slip fields feeding the ERP get a self-reported 1-100 confidence score, with anything below 70 routed to human review and the rest auto-posted; a quarterly audit finds overpayments concentrated in extractions Claude scored above 90, nearly all involving handwritten quantity corrections or non-standard units of measure (e.g., \"cs\" vs \"case,\" or a quantity written over a crossed-out printed value) where the JSON looked structurally complete but the underlying values were wrong.",
    "question": "What change would most effectively fix the confidence calibration problem driving these overpayments?",
    "options": {
      "A": "Have a second, independent Claude call review the same packing-slip photograph and the first call's JSON output, producing its own 1-100 confidence score for each of the four extracted fields, and route an extraction to human review whenever the two self-reported scores diverge by more than 20 points.",
      "B": "Lower the auto-post threshold from 70 to 50, so that any extraction scoring below the new cutoff on any of its four extracted fields is diverted from the ERP posting step into the human review queue, applied uniformly across the SKU, quantity, unit price, and delivery date fields on every packing slip processed.",
      "C": "Replace the self-reported confidence score with a programmatic risk score built from objective signals - schema/field-completeness validation, detection of handwritten annotations, and unit-of-measure normalization failures - and route to human review based on that score.",
      "D": "Curate a larger set of few-shot examples showing packing slips with handwritten quantity corrections and crossed-out printed values, each example paired with a low confidence score, and insert them into the extraction prompt so Claude learns to generalize the pattern and assign lower scores on similar slips going forward."
    },
    "correct": "C",
    "explanations": {
      "A": "Still uses self-reported confidence as the underlying signal; two LLM calls independently re-scoring the same image and JSON output are likely to share the same blind spots (e.g., both missing that a value was overwritten by hand), so agreement between them doesn't indicate correctness.",
      "B": "Shifts the threshold but keeps relying on the same uncalibrated metric applied field-by-field; the overpayment cases were already scoring above 90, well above even a lowered cutoff, so widening the net this way does not catch them.",
      "C": "Correct. The root problem is that the routing signal (LLM self-reported confidence) doesn't correlate with actual accuracy - it's high precisely on the cases with hidden risk factors like handwriting and nonstandard units. Grounding routing in objective, checkable signals rather than the model's probabilistic self-assessment gives a reliable trigger for exactly the failure modes observed.",
      "D": "Still relies on self-reported confidence, which is a probabilistic behavior the model may not reliably reproduce across varied real-world slip formats and layouts it wasn't shown examples of - it doesn't fix the underlying calibration problem."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.5-e08e62fb",
    "scenarioType": "Structured Data Extraction"
  },
  {
    "taskStatement": "D5.6",
    "domain": "D5",
    "scenario": "Reconciling one patient's record, the pipeline extracts a medication dose as 10mg from the EHR export and 20mg from the OCR'd discharge summary, while the faxed pharmacy record is illegible for that field.",
    "question": "How should the extraction pipeline handle this dosage discrepancy in its JSON output?",
    "options": {
      "D": "Emit a record for the medication that includes both conflicting dosage values, tags each with its source document, and sets a needs_review flag so the discrepancy is surfaced to a human rather than silently resolved.",
      "C": "Emit a single dosage value taken from whichever source document has the most recent timestamp, since the newer record is more likely to reflect the current prescription.",
      "A": "Emit a single dosage value taken from the EHR export by default, since it is the institution's system of record and should always take precedence over other document types.",
      "B": "Have Claude reason about which dosage is more clinically plausible for the medication in question and emit that single value, since the downstream schema only has room for one dosage field."
    },
    "correct": "D",
    "explanations": {
      "D": "Correct. When sources genuinely conflict on a high-stakes field, the pipeline should preserve provenance (which source reported which value) and flag the conflict explicitly rather than collapsing it into a single silent value. This lets a human resolve the discrepancy instead of the system guessing, which matters most when a wrong guess could affect patient safety.",
      "C": "Recency is a plausible-sounding tiebreaker, but applying it automatically silently discards the conflict and the provenance information - the downstream system sees one clean value with no indication that the sources disagreed at all.",
      "A": "Always trusting one source type by default may be reasonable as a tiebreaker in low-stakes cases, but applying it unconditionally here again hides the conflict from the people who need to know it exists, rather than surfacing it for review.",
      "B": "This asks Claude to resolve a factual conflict between source documents using general plausibility reasoning rather than the actual source data, and it discards provenance entirely - the schema constraint (one dosage field) should be solved by adding structure for conflicts, not by forcing a guess."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.6-7fc78684",
    "scenarioType": "Structured Data Extraction"
  },
  {
    "taskStatement": "D1.7",
    "domain": "D1",
    "scenario": "While extracting insurance claim line items, coverage limits, and exclusions from PDFs into your JSON schema, you find that for roughly 10% of claims one clause is genuinely ambiguous (e.g., a per-incident vs. aggregate coverage limit), and the team wants to trial two extraction strategies on that clause to see which validates cleanly.",
    "question": "The team wants to test both extraction strategies on the ambiguous clause without letting a failed attempt contaminate the reasoning that carries forward into the rest of the claim's processing. What is the best way to structure this?",
    "options": {
      "A": "After the ambiguous clause is reached, serialize the full session transcript to a file on disk, then for each strategy spin up a fresh session that reloads that saved transcript as its starting context, appends the strategy-specific extraction turn, and writes the resulting output back to its own file for schema validation.",
      "B": "For each strategy, restart the session from the very beginning of the claim: re-open the PDF, re-run the full extraction and policy cross-check pipeline from scratch, then apply that strategy to the ambiguous clause and validate the resulting JSON against the schema and reconciliation rules.",
      "C": "At the point where the ambiguity is detected, fork the session into two independent branches, run each strategy to completion, then continue the workflow only from the branch whose output passes schema validation, discarding the other branch's transcript.",
      "D": "Within the same session, have the agent apply the first strategy to the ambiguous clause, then in a follow-up turn apply the second strategy, add a system-prompt instruction directing it to disregard the first attempt's reasoning and tool output, and have it emit final field values for schema validation based only on the second attempt."
    },
    "correct": "C",
    "explanations": {
      "A": "This manually reimplements forking through file save/reload: writing the transcript out and reloading it into a new session for each strategy adds operational overhead and failure points (serialization format, reload fidelity) without providing anything a native fork wouldn't provide directly.",
      "B": "Restarting from scratch and re-running the full extraction and policy cross-check pipeline before even reaching the ambiguous clause throws away the exploration work already done up to that point, which is unnecessary - only the point of divergence needs to branch, not the entire claim.",
      "C": "Correct. Forking the session at the checkpoint preserves the exploration already completed up to that point while giving each strategy its own isolated continuation, so neither branch's reasoning or tool output leaks into the other. The workflow then keeps only the winning branch's state and cleanly drops the rest.",
      "D": "Both attempts remain in the same context history, so the model's later reasoning is still exposed to the discarded first attempt's tool output and reasoning trace. Relying on a system-prompt instruction to disregard it is probabilistic compliance, not a guarantee of isolation, even when the agent is told to base final output only on the second attempt."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.7-7d83fcef",
    "scenarioType": "Structured Data Extraction"
  },
  {
    "taskStatement": "D3.2",
    "domain": "D3",
    "scenario": "You want to create a custom /review slash command that runs your team's standard code review checklist. This command should be available to every developer when they clone or pull the repository.",
    "question": "Where should you create this command file?",
    "options": {
      "A": "In the .claude/commands/ directory in the project repository",
      "C": "In ~/.claude/commands/ in each developer's home directory",
      "B": "In a .claude/config.json file with a commands array",
      "D": "In the CLAUDE.md file at the project root"
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Project-scoped custom slash commands are stored in the .claude/commands/ directory within the repository - version-controlled and automatically available to all developers when they clone or pull the repo.",
      "C": "~/.claude/commands/ is for personal commands that are not shared via version control.",
      "D": "CLAUDE.md is for project instructions and context, not command definitions.",
      "B": "Describes a configuration mechanism that does not exist in Claude Code."
    },
    "provenance": {
      "source": "official-sample",
      "model": null,
      "generatedAt": null,
      "reviewed": true
    },
    "id": "D3.2-a6d4b794",
    "scenarioType": "Developer Productivity with Claude"
  },
  {
    "taskStatement": "D5.3",
    "domain": "D5",
    "scenario": "The web search subagent times out while researching a complex topic. You need to design how this failure information flows back to the coordinator agent.",
    "question": "Which error propagation approach best enables intelligent recovery?",
    "options": {
      "B": "Return structured error context to the coordinator including the failure type, the attempted query, any partial results, and potential alternative approaches.",
      "D": "Implement automatic retry logic with exponential backoff within the subagent, returning a generic \"search unavailable\" status only after all retries are exhausted.",
      "A": "Catch the timeout within the subagent and return an empty result set marked as successful.",
      "C": "Propagate the timeout exception directly to a top-level handler that terminates the entire research workflow."
    },
    "correct": "B",
    "explanations": {
      "B": "Correct. Structured error context gives the coordinator the information it needs to make intelligent recovery decisions - whether to retry with a modified query, try an alternative approach, or proceed with partial results.",
      "D": "A generic status hides valuable context from the coordinator, preventing informed decisions.",
      "A": "Suppresses the error by marking failure as success, which prevents any recovery and risks incomplete research outputs.",
      "C": "Terminates the entire workflow unnecessarily when recovery strategies could succeed."
    },
    "provenance": {
      "source": "official-sample",
      "model": null,
      "generatedAt": null,
      "reviewed": true
    },
    "id": "D5.3-a9d6b63b",
    "scenarioType": "Multi-Agent Research System"
  },
  {
    "taskStatement": "D3.6",
    "domain": "D3",
    "scenario": "Your pipeline script runs claude \"Analyze this pull request for security issues\" but the job hangs indefinitely. Logs indicate Claude Code is waiting for interactive input.",
    "question": "What's the correct approach to run Claude Code in an automated pipeline?",
    "options": {
      "D": "Redirect stdin from /dev/null: claude \"Analyze this pull request for security issues\" < /dev/null",
      "B": "Add the --batch flag: claude --batch \"Analyze this pull request for security issues\"",
      "A": "Set the environment variable CLAUDE_HEADLESS=true before running the command",
      "C": "Add the -p flag: claude -p \"Analyze this pull request for security issues\""
    },
    "correct": "C",
    "explanations": {
      "C": "Correct. The -p (or --print) flag is the documented way to run Claude Code in non-interactive mode. It processes the prompt, outputs the result to stdout, and exits without waiting for user input - exactly what CI/CD pipelines require.",
      "A": "References a non-existent feature: there is no CLAUDE_HEADLESS environment variable.",
      "D": "A Unix workaround that does not properly address Claude Code's command syntax for non-interactive runs.",
      "B": "References a non-existent feature: there is no --batch flag."
    },
    "provenance": {
      "source": "official-sample",
      "model": null,
      "generatedAt": null,
      "reviewed": true
    },
    "id": "D3.6-31e90992",
    "scenarioType": "Claude Code for Continuous Integration"
  },
  {
    "taskStatement": "D2.5",
    "domain": "D2",
    "scenario": "A developer asks Claude Code to fix a single incorrect timeout value in `config/production.yaml`, changing `request_timeout_ms: 3000` to `request_timeout_ms: 8000` and nothing else. The 300-line file also holds dozens of other service settings, inline comments explaining historical incidents, and precise indentation that downstream deployment tooling depends on.",
    "question": "Which approach best accomplishes this change while minimizing risk to the rest of the file?",
    "options": {
      "A": "Use Bash with a `sed -i` command to substitute the value in place, since it avoids invoking the model's file tools entirely.",
      "D": "Use Write to regenerate the entire file with the corrected value, reconstructing the other settings and comments from what Claude has seen of the file so far.",
      "C": "Read the file to see the exact current line and surrounding context, then use Edit to replace only that line's old string with the new value.",
      "B": "Use Glob to confirm the file's location, then use Write to submit the full corrected file content in one call."
    },
    "correct": "C",
    "explanations": {
      "A": "Bash/sed can work for simple substitutions, but it bypasses Claude's verified view of the file's exact current content, and a loosely scoped pattern risks matching unintended lines elsewhere in a 300-line config with similar keys.",
      "D": "Write replaces the entire file. Reconstructing 300 lines of comments, historical notes, and exact indentation from memory risks silently dropping or altering content that was never meant to change - a poor fit for a single-line edit.",
      "C": "Correct. Read establishes the exact current content so the old string can be matched precisely, and Edit performs a targeted, surgical replacement of only that line - leaving every other setting, comment, and indentation untouched.",
      "B": "Glob only locates files by path pattern; it does not show file contents, so this path still risks reconstructing (and thus corrupting) the file's other content via Write."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.5-fdac9985",
    "scenarioType": "Developer Productivity with Claude"
  },
  {
    "taskStatement": "D2.5",
    "domain": "D2",
    "scenario": "Running dozens of subagents on \"regulatory risk in fintech lending,\" each writes findings to a timestamped file like fintech_lending_20260614_0912.md in a shared /workspace/findings/ directory, with filenames reflecting only the general topic and timestamp. The synthesis agent must identify the ~12 of 50+ files actually discussing regulatory risk and consolidate them into a new /workspace/report.md.",
    "question": "Which combination of built-in tools is the most effective and correct way for the synthesis agent to accomplish this task?",
    "options": {
      "D": "Use Glob with a pattern like *regulatory* to locate the relevant files in /workspace/findings/, then Read each match and Write the combined content to report.md.",
      "B": "Use Read to open every file in /workspace/findings/ one by one, checking each for mentions of \"regulatory risk,\" then Write the combined content to report.md.",
      "A": "Use Grep to search file contents in /workspace/findings/ for \"regulatory risk,\" Read the files that match, and then Write the combined content to a new report.md.",
      "C": "Use Bash to run a shell pipeline like cat /workspace/findings/*.md | grep \"regulatory risk\", then use Edit to insert the piped output into report.md."
    },
    "correct": "A",
    "explanations": {
      "D": "Glob matches file paths and names, not file contents. Since \"regulatory risk\" is not encoded in the filenames (which only reflect the general topic and a timestamp), a name-based pattern like *regulatory* would fail to find the relevant files at all.",
      "B": "This would eventually surface the right content, but it is the wrong tool choice for the task: it forces the agent to load all 50+ files into context just to filter them, instead of using a tool built specifically for content search across many files first. This wastes context and time as the number of findings files grows.",
      "A": "Correct. Grep is the purpose-built tool for searching file contents across a directory of files, which is exactly what's needed since the relevant subtopic isn't reflected in filenames. Read then retrieves only the matched files, and Write is correct because report.md does not yet exist and needs to be created.",
      "C": "Shelling out through Bash duplicates functionality the Grep tool already provides more reliably and with structured output, and is a less appropriate tool choice here. It also misapplies Edit, which performs a targeted string replacement in an existing file with unique matching text - since report.md does not yet exist, there is nothing for Edit to match against, so this would fail."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.5-5ba84a40",
    "scenarioType": "Multi-Agent Research System"
  },
  {
    "taskStatement": "D3.1",
    "domain": "D3",
    "scenario": "Your root CLAUDE.md covers shared build, lint, and test conventions. Six months ago an engineer bootstrapping services/payments copied the entire root file into services/payments/CLAUDE.md and appended PCI validation and error-handling rules; the root has since had its lint command and test framework updated twice, but the payments copy wasn't, so Claude Code now generates payments code with the old test framework and stale lint command.",
    "question": "What is the most maintainable way to fix this drift while still preserving the payments team's directory-specific rules?",
    "options": {
      "A": "Move the PCI validation and error-handling rules into the root CLAUDE.md under a \"Payments\" header, consolidating the lint command and test framework references there too, then delete services/payments/CLAUDE.md so every rule for every service lives in one shared file going forward.",
      "B": "Delete services/payments/CLAUDE.md entirely and set up a shared onboarding doc instructing engineers to paste the current PCI validation and error-handling rules into their prompts manually at the start of each session whenever they work inside that directory.",
      "C": "Set up a script that runs on a schedule, such as a cron job, to diff and copy the current contents of the root CLAUDE.md into every subdirectory CLAUDE.md file across the repo, including services/payments, keeping the build, lint, and test conventions synchronized automatically.",
      "D": "Trim services/payments/CLAUDE.md down to only the payment-specific rules, removing the duplicated shared content — since nested CLAUDE.md files are loaded alongside the root file based on directory location, the shared standards only need to live in the root file."
    },
    "correct": "D",
    "explanations": {
      "A": "Eliminates the drift but sacrifices modular organization by folding directory-specific concerns — and now even more shared content — back into the root file; as more services consolidate this way, the root file grows unwieldy again, which is the bloat problem scoped CLAUDE.md files are meant to prevent.",
      "B": "Removes the drift risk but sacrifices the reliability of persistent, file-based configuration — manually re-pasting rules into prompts each session is inconsistent, easy to forget, and reintroduces the exact problem CLAUDE.md files exist to solve.",
      "C": "Solves the immediate symptom but adds unnecessary tooling and infrastructure to compensate for a modular-organization problem the hierarchy already solves natively; it also fails to scale as more subdirectories accumulate their own copies to keep in sync.",
      "D": "Correct. CLAUDE.md files form a hierarchy where nested files are loaded alongside the root file based on directory location, so content doesn't need to be duplicated to apply within a subdirectory. Trimming the payments file to only its unique rules eliminates the duplicated content that caused drift, while the hierarchy still ensures both files apply when working in services/payments."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D3.1-04a15995",
    "scenarioType": "Code Generation with Claude Code"
  },
  {
    "taskStatement": "D4.2",
    "domain": "D4",
    "scenario": "Auto-generated unit test files for newly added API endpoint handlers pass CLAUDE.md's natural-language instructions, but still vary widely: some use inline mocks while others use fixture files, assertions mix `expect(res.body).toEqual()` with `expect(res.body).toMatchObject()`, and describe-block nesting depth differs by file, forcing reformatting before merge.",
    "question": "What change would most effectively reduce this style inconsistency across generated test files?",
    "options": {
      "A": "Lower the temperature setting toward zero to reduce sampling randomness, producing more deterministic token choices and consistent output across repeated generation runs of the same prompt.",
      "B": "Expand the natural-language instructions in the system prompt with more granular rules specifying the exact mocking library and pattern, the precise assertion method for response bodies, and a fixed maximum describe-block nesting depth.",
      "C": "Include 2-3 few-shot examples of complete, existing test files from the codebase that demonstrate the exact mocking approach, assertion style, and describe-block structure the team wants replicated.",
      "D": "Split the task into separate prompts, one per structural concern such as mocking setup, assertion style, and describe-block grouping, run them sequentially in that order, and merge the resulting code segments into one final test file."
    },
    "correct": "C",
    "explanations": {
      "A": "Temperature affects randomness in token sampling, not the model's understanding of which style convention to follow; even with near-deterministic sampling toward the same prompt, the model still lacks a concrete signal for which mocking approach or assertion method is correct, so inconsistency driven by ambiguous instructions would persist across different prompts and files.",
      "B": "Natural-language rules describe style abstractly; even specifying the mocking library, assertion method, and a nesting-depth limit in words is hard to pin down precisely and still leaves room for divergent interpretation across files - this is the approach already tried without success.",
      "C": "Correct. Concrete few-shot examples show the model the exact desired mocking approach, assertion style, and structure to replicate, rather than describing it abstractly - this directly targets the ambiguity that abstract instructions left unresolved and drives consistent output across files.",
      "D": "Fragmenting the task across separate sequential prompts and merging the segments addresses workflow structure, not the underlying ambiguity about which conventions to use for mocking, assertions, or nesting, and introduces new risk of inconsistency between the merged pieces."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.2-4997a9a6",
    "scenarioType": "Code Generation with Claude Code"
  },
  {
    "taskStatement": "D4.2",
    "domain": "D4",
    "scenario": "QA review of the document-analysis agent's output finds that summaries of academic papers, blog posts, and press releases are wildly inconsistent: some are three sentences on conclusions only, others dense paragraphs quoting methodology and statistics, and a few omit publication dates or author affiliations, despite a JSON schema enforcing title, summary, and key_findings fields.",
    "question": "What change would most directly fix the inconsistency in summary depth and framing?",
    "options": {
      "A": "Increase the max_tokens parameter for the document-analysis agent so it has room to write longer, more thorough summaries, removing the output ceiling that may be truncating the denser sources into shallower summaries.",
      "B": "Tighten the JSON schema further by adding more required fields (e.g., methodology, sample_size) so the structure captures more of each source, forcing the agent to address the same dimensions for every document type.",
      "D": "Add a small set of few-shot examples showing complete summaries for representative source types (a dense academic paper, a short blog post, a press release), each demonstrating the target length, level of technical detail, and framing.",
      "C": "Set the document-analysis agent's temperature to 0 to make its outputs deterministic across runs, so the same source no longer yields summaries of differing depth and framing on repeated passes over the corpus."
    },
    "correct": "D",
    "explanations": {
      "A": "More tokens only gives the agent room to be verbose; it does not tell the agent what a consistent depth or framing should look like, so variation across source types would persist.",
      "B": "The schema already constrains which fields exist, but the problem is inconsistent content within those free-text fields, not missing fields - adding more required fields would not standardize depth or tone within the existing ones.",
      "D": "Correct. Concrete few-shot examples covering the different source types the agent actually encounters demonstrate the desired length, technical depth, and framing directly, which is far more effective than an abstract instruction like \"summarize clearly and consistently.\"",
      "C": "Temperature 0 only makes a given input produce the same output on repeated runs; it does nothing to make summaries of a paper and a press release converge on comparable depth and framing, since the underlying instruction is still ambiguous."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.2-43307c72",
    "scenarioType": "Multi-Agent Research System"
  },
  {
    "taskStatement": "D5.1",
    "domain": "D5",
    "scenario": "During an hours-long run investigating a technology policy question, the coordinator's context window nears its limit, so the team enables automatic compaction to summarize older turns; after it first fires, the synthesis agent's report contradicts the user's early constraint (\"exclude sources published before 2020\"), stated once and never restated, because compaction's summary dropped it while keeping later, less critical search results.",
    "question": "What is the most effective way to prevent this class of failure going forward?",
    "options": {
      "C": "Increase the token threshold at which compaction triggers so it runs less frequently, leaving the original constraint in the uncompacted conversation history for far longer before any summarization step can drop it.",
      "A": "Extract critical constraints like this one into a structured, persistent artifact (e.g., a standing research-brief section) that is carried forward verbatim and excluded from summarization, rather than relying on generic compaction to retain it.",
      "B": "Instruct the coordinator's system prompt to \"pay close attention to constraints stated early in the conversation\" so compaction weighs them more heavily and is less likely to discard them when it summarizes the earlier turns.",
      "D": "Disable compaction entirely and let the coordinator operate with the full, uncompacted conversation history for the remainder of the session, so no constraint stated at any point can ever be lost to summarization."
    },
    "correct": "A",
    "explanations": {
      "C": "Delays the failure rather than fixing it - compaction will still eventually run and can still drop the same unflagged constraint, and in the meantime the context window risks overflowing.",
      "A": "Correct. Generic summarization cannot reliably distinguish a business-critical constraint from incidental detail. Pulling critical facts into a separate, structured record that persists outside the summarization process guarantees they survive regardless of how compaction handles the rest of the conversation.",
      "B": "Relies on probabilistic compliance from a summarization step to correctly prioritize information it has no structural way of knowing is critical - the same class of unreliable fix as trusting prompt wording for enforcement.",
      "D": "Trades one failure mode for another; without compaction the session will eventually exceed the context window, which is the original problem the team was trying to solve."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.1-ceaed194",
    "scenarioType": "Multi-Agent Research System"
  },
  {
    "taskStatement": "D5.4",
    "domain": "D5",
    "scenario": "Before letting Claude touch the shared PricingEngine module, the developer tells it in the main session to \"explore thoroughly so you understand every place PricingEngine is used,\" and Claude Reads dozens of service files inline in that same conversation until the context window is nearly full; the subsequent edit correctly updates PricingEngine but misses two call sites surfaced early in the exploration.",
    "question": "What is the most effective way to restructure this workflow to manage context?",
    "options": {
      "A": "Break the task into many small prompts, each editing one file, and skip upfront exploration entirely.",
      "B": "Instruct Claude to Read every file in every service directory before starting any edit, to guarantee full coverage.",
      "D": "Delegate the exploration phase to a subagent (e.g., Explore) that searches the monorepo and returns a condensed summary of relevant usages, then perform the edit in the main session using that summary.",
      "C": "Let exploration continue in the main session as before, and rely on automatic context compaction to summarize findings once the window fills before proceeding with the edit."
    },
    "correct": "D",
    "explanations": {
      "A": "Removing upfront exploration entirely means the edits happen without shared understanding of all call sites, which is likely to reproduce the same missed-call-site problem for a different reason.",
      "B": "Reading every file in every service directory inline is the root cause of the problem, not a fix - it maximizes the amount of exploration content competing for space in the same context window used for the edit.",
      "D": "Correct. Isolating exploration in a subagent keeps the bulk of file-reading out of the main conversation; the subagent returns only a condensed summary of findings, leaving the main session's context available and intact for the implementation pass.",
      "C": "Compaction is a reactive fallback that summarizes after the window is already saturated with exploration content, so the degradation (fading early findings) has already occurred by the time it triggers - it does not prevent the problem the scenario describes."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.4-08da07bd",
    "scenarioType": "Developer Productivity with Claude"
  },
  {
    "taskStatement": "D5.4",
    "domain": "D5",
    "scenario": "Applied to the monorepo research task, telemetry shows that by the time the fourth of the five subagents (invoicing, payments, tax calculation, dunning, reporting) reports back, the coordinator's token usage has spiked and it starts dropping earlier turns from context — the invoicing subagent's report, submitted first and verified accurate at the time, is the one that goes missing from the final write-up.",
    "question": "What change would most effectively fix this context management problem?",
    "options": {
      "A": "Have subagents use Grep instead of Read for all file exploration, searching each module for matching function definitions, call sites, and configuration keys, then passing the raw matched lines and snippets forward to the coordinator to assemble into the final explanation.",
      "B": "Reduce the system to a single agent that explores all five modules sequentially, reading through each module's files in turn and appending its notes to one running document that carries forward as it moves on to the next module.",
      "C": "Increase the coordinator's model to one with a larger context window, configured to hold each subagent's full raw file contents simultaneously so all five modules' source code remains available while the coordinator drafts the final explanation.",
      "D": "Instruct each subagent to keep detailed file exploration within its own context and return only a synthesized summary of key findings to the coordinator, rather than raw file contents."
    },
    "correct": "D",
    "explanations": {
      "A": "Grep alone cannot support the deep understanding needed to explain how a pipeline works across modules, and matched lines and snippets are still raw, unsynthesized content; the problem is not the exploration tool but the fact that unsynthesized material keeps being passed to the coordinator.",
      "B": "Eliminates the parallelism benefit of the multi-agent design, and a single running document that keeps accumulating notes from five modules in one context still grows to the same volume of unsynthesized material over time, just more slowly.",
      "C": "Treats context capacity as the bottleneck rather than the actual problem, which is that raw, unsynthesized content is being passed upstream at all; holding all five modules' raw file contents at once only delays the same failure and adds unnecessary cost.",
      "D": "Correct. Each subagent's context is disposable after it finishes its work - detailed exploration should stay isolated there, and only condensed, relevant findings should cross back to the coordinator. This keeps the coordinator's context focused on synthesis rather than raw source code, preventing earlier findings from being crowded out."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.4-e490c188",
    "scenarioType": "Multi-Agent Research System"
  },
  {
    "taskStatement": "D5.5",
    "domain": "D5",
    "scenario": "You adapt the system to produce investment due-diligence briefs, having the report-generation agent tag each claim with a self-reported confidence score (1-100), publishing scores above 70 directly and routing 70-or-below to human review. A three-month audit finds claims rated 85+ were wrong nearly as often as those rated in the 50s, and several fabricated financial figures scored high enough to bypass review entirely.",
    "question": "What is the most effective fix for the review-routing failure?",
    "options": {
      "A": "Raise the publish threshold from 70 to 90 so fewer claims bypass human review, tightening the cutoff so that only the claims the model rates most confidently are published without a reviewer seeing them first.",
      "D": "Replace the self-reported confidence score with routing criteria grounded in objective, verifiable signals (e.g., claim type, presence of corroborating sources, numeric/financial content) rather than the model's own certainty rating.",
      "C": "Have a second Claude call independently re-score the same claim's confidence and average the two scores before routing, so a single anomalously high self-rating cannot on its own push a claim past the publish threshold.",
      "B": "Add a system prompt instruction telling the synthesis agent to be more conservative and assign lower confidence scores to financial figures, so numeric claims fall below the publish threshold more often and reach review."
    },
    "correct": "D",
    "explanations": {
      "A": "Doesn't address the root cause - the audit shows the score itself doesn't correlate with actual accuracy, so moving the cutoff still lets confidently-wrong claims slip through and pushes more correct claims into the queue unnecessarily.",
      "D": "Correct. The audit demonstrates that self-reported LLM confidence is poorly calibrated against real-world accuracy. Routing should instead key off objective, verifiable signals (source corroboration, claim category, presence of specific numeric/financial data) that are known risk indicators, rather than trusting the model's own certainty judgment.",
      "C": "Averaging two instances of the same unreliable signal does not fix the underlying miscalibration - both scores come from the same flawed self-assessment mechanism and can be confidently wrong together.",
      "B": "Relies on probabilistic prompt compliance to fix what is fundamentally a measurement problem; the model being told to 'be more conservative' does not make its self-reported confidence correlate with actual correctness."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.5-2f2fab7e",
    "scenarioType": "Multi-Agent Research System"
  },
  {
    "taskStatement": "D5.5",
    "domain": "D5",
    "scenario": "A post-incident review of your diff-size routing rule finds that a 3-line auto-merged fix (under the 10-line threshold) silently disabled a fraud check in the payment authorization module, leading to a week of unvalidated transactions, while a 40-line logging-utility refactor with no behavioral risk sat in the human review queue for two days that same week, tying up reviewer time.",
    "question": "What is the most effective way to redesign the review routing?",
    "options": {
      "A": "Reconfigure the CI diff-size gate to raise the auto-merge threshold from 10 to 20 changed lines, so fixes in that expanded range skip the review queue and merge automatically across every package in the monorepo, cutting reviewer backlog.",
      "B": "Route based on the criticality of the files/paths touched (e.g., always require human review for changes in auth, payment, or security-sensitive modules), reserving size-based auto-merge for lower-risk areas of the codebase.",
      "C": "Remove the auto-merge path entirely and route every Claude-generated PR, regardless of diff size or which files it touches, into the human reviewer queue with a mandatory sign-off step before the merge button unlocks.",
      "D": "Have Claude emit a numeric self-reported confidence score alongside each generated diff, then have the CI gate compare that score to a configured threshold and auto-merge any fix whose score clears it, regardless of line count."
    },
    "correct": "B",
    "explanations": {
      "A": "Widens the auto-merge window by moving the CI diff-size gate's cutoff from 10 to 20 lines, without addressing why the routing signal is wrong, making it more likely that another small, high-impact change to a critical path slips through unreviewed.",
      "B": "Correct. The incident shows diff size is a poor proxy for risk — a tiny change to a critical module caused real harm while a large but low-risk change wasted reviewer time. Routing on the actual risk signal (which code paths are touched) targets human review where it matters and preserves automation elsewhere.",
      "C": "Eliminates the size-vs-risk mismatch by sending every PR through mandatory sign-off, but overcorrects by removing automation entirely, reintroducing the reviewer bottleneck the routing system was meant to solve, including for genuinely low-risk changes like the logging refactor.",
      "D": "Substitutes one weak proxy (diff size) for another (a numeric self-reported confidence score compared against a configured threshold); confidence scores are not reliably calibrated to actual correctness and would not reliably catch a small change that silently breaks a fraud check."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.5-14e2e85b",
    "scenarioType": "Claude Code for Continuous Integration"
  },
  {
    "taskStatement": "D5.6",
    "domain": "D5",
    "scenario": "While scoping a migration script to upgrade an internal library from v2 to v3, Claude Code fetches the vendor's CHANGELOG.md via WebFetch, which states that `fetchLegacyToken()` was removed in v3, then greps the vendored source under `node_modules/`, which still shows `fetchLegacyToken()` defined and exported, and a linked GitHub issue thread has two maintainer comments disagreeing on whether the function was fully removed or kept behind a compatibility flag.",
    "question": "Given these conflicting sources, what is the best way for Claude Code to produce the migration script and its accompanying summary?",
    "options": {
      "A": "Trust the grepped source code in node_modules as ground truth over the documentation, and write the migration script to leave every call site invoking fetchLegacyToken() untouched exactly as it appears in v2, with a summary stating plainly that the function remains available and that no further changes are required for the v3 upgrade.",
      "B": "Write the migration script to feature-detect fetchLegacyToken() at runtime rather than assuming either outcome, and include a summary that names each source (changelog, vendored source, issue thread comments) and states explicitly that they disagree, so the developer can confirm before merging.",
      "C": "Trust the changelog as the official source of truth, write the migration script to remove every call site that invokes fetchLegacyToken() and replace each one with the documented v3 replacement function, and present the summary as a straightforward, fully resolved removal that needs no further caveats.",
      "D": "Tally the three sources, note that two of the three, the changelog and one maintainer comment, agree the function was removed, and write the migration script to drop every fetchLegacyToken call site on that majority basis, presenting the summary as a fully resolved, majority-backed decision that is ready to merge as-is."
    },
    "correct": "B",
    "explanations": {
      "A": "Makes the opposite error of C - it discards the official documentation and one maintainer's comment in favor of the source code snapshot, which could be stale or represent an unreleased state, again hiding a real disagreement from the developer by presenting the code-as-written as settled fact.",
      "B": "Correct. When sources genuinely conflict, the safest path is to avoid committing to an unverified assumption in the generated code and to preserve provenance - stating which source said what - so the developer can resolve the ambiguity with full context before merging.",
      "C": "Privileges one source (the changelog) and discards contradicting evidence found directly in the vendored source code and the issue thread, hiding the conflict from the developer by presenting a clean removal as though no ambiguity existed.",
      "D": "Treating source disagreement as a vote to be tallied is not a valid resolution method - a maintainer's direct clarification about a compatibility flag is qualitatively different from a changelog entry, and averaging away the disagreement hides genuine uncertainty from the developer instead of surfacing it."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.6-80104be3",
    "scenarioType": "Code Generation with Claude Code"
  },
  {
    "taskStatement": "D5.6",
    "domain": "D5",
    "scenario": "While researching a company's projected 2027 revenue growth for an investment memo, the document-analysis subagent extracts 8% from SEC filings, the web-search subagent surfaces a 14% sell-side consensus and a 22% figure from a single op-ed, and the synthesis agent outputs only: \"The company is projected to grow revenue by approximately 14% in 2027,\" with no sourcing.",
    "question": "What is the most effective way to fix how the synthesis agent handles this conflicting information?",
    "options": {
      "A": "Instruct the synthesis agent to defer to the SEC filings agent's figure and present it as the projected growth rate, since official regulatory filings are the most authoritative source for guidance figures.",
      "B": "Instruct the synthesis agent to report each growth figure alongside its source and note the disagreement between them, rather than presenting a single unattributed number.",
      "C": "Have the coordinator re-run the news and analyst-reports agents with adjusted prompts until their figures converge with the SEC filing's 8%, then pass only the converged number to the synthesis agent.",
      "D": "Instruct the synthesis agent to average the three figures (8%, 14%, and 22%) into a single blended growth rate and present that computed mean as the projected 2027 revenue growth figure in the memo."
    },
    "correct": "B",
    "explanations": {
      "A": "Silently discards two sources without surfacing the conflict; collapsing to one figure without attribution or acknowledgment of disagreement hides information the reader needs to judge confidence, even though official filings are often the most reliable source type.",
      "B": "Correct. When sources genuinely conflict, synthesis should preserve provenance (which source reported which figure) and explicitly flag the disagreement and its magnitude, so downstream readers can judge confidence and weigh the claims themselves rather than receiving a single number stripped of its origin and uncertainty.",
      "C": "Re-running agents with adjusted prompts until they converge doesn't resolve a real underlying disagreement between sources - it just discards genuine divergence, and there's no guarantee independent sources with different methodologies and different inputs will ever agree.",
      "D": "Manufactures a precise-looking blended number that none of the sources actually reported and erases the fact that the sources meaningfully disagree - the opposite of preserving provenance."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.6-077e334f",
    "scenarioType": "Multi-Agent Research System"
  },
  {
    "taskStatement": "D3.4",
    "domain": "D3",
    "scenario": "The web-search agent's search_web tool needs a new max_results parameter, clamped to a documented range, wired through the tool's already-specified input schema and the coordinator's one existing call site that invokes it — the change touches only those two files, and there is exactly one correct way to pass the parameter through.",
    "question": "Which approach should the developer take with Claude Code?",
    "options": {
      "D": "Enter plan mode first so Claude can explore the entire multi-agent system before touching any file.",
      "A": "Use direct execution, since the change is small, localized, and has a single clear implementation path.",
      "C": "Enter plan mode and require Claude to produce a written design document covering all four agents before making the edit.",
      "B": "Use direct execution, but first ask Claude to draft several alternative architectures for passing the parameter and pick one."
    },
    "correct": "A",
    "explanations": {
      "D": "Plan mode is intended for architectural decisions, large-scale changes, and situations with multiple valid approaches; a two-file, single-path parameter addition doesn't need upfront exploration of the whole system.",
      "A": "Correct. When a change is small in scope, well-specified, and has one clear implementation path, direct execution is appropriate - plan mode's exploration and design overhead adds no value here.",
      "C": "Requiring a full system-wide design document for a two-file change misapplies plan mode's purpose and adds unnecessary overhead disproportionate to the task.",
      "B": "There is only one correct way to wire the parameter through, so generating and choosing among alternative architectures is unnecessary busywork that doesn't fit the situation."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D3.4-7f3c3097",
    "scenarioType": "Multi-Agent Research System"
  },
  {
    "taskStatement": "D3.2",
    "domain": "D3",
    "scenario": "The synthesis agent's report-compilation step also needs to apply a lengthy internal citation style guide - source ranking rules, quote-attribution format, footnote numbering - a capability irrelevant to the coordinator's delegation, the web-search agent, or the document-analysis agent. The team wants it applied consistently at that one step without bloating every agent's system prompt with formatting rules it will rarely need.",
    "question": "Which approach best fits this situation?",
    "options": {
      "A": "Create a skill (e.g., citation-style/SKILL.md) with a description referencing citation formatting and report compilation, so the synthesis agent can discover and invoke it only when it reaches that step.",
      "B": "Create a project-scoped slash command, /format-citations, that applies the source ranking rules, quote-attribution format, and footnote numbering to the compiled report, run manually by a user after the synthesis agent produces the draft.",
      "C": "Paste the full citation style guide, including source ranking rules, quote-attribution format, and footnote numbering, directly into the synthesis agent's system prompt so every rule is always loaded and available for every task.",
      "D": "Create a slash command, /format-citations, covering source ranking rules, quote-attribution format, and footnote numbering, and add it as a required tool call the coordinator must invoke on every research run before finishing."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. A skill with a description matching the relevant context lets the agent discover and load the capability on demand, exactly when synthesis reaches the compilation step, instead of carrying the detail everywhere it isn't needed.",
      "B": "Requires a human to remember a manual, separate step after the fact, defeating the goal of consistent, built-in application as part of the agent's own workflow.",
      "C": "Permanently inflates the synthesis agent's context with detail needed only during one narrow step, the exact overhead an on-demand skill avoids.",
      "D": "Forces a rigid, unconditional invocation every single run regardless of whether the report is actually at the citation-formatting step, and misuses a user-facing slash command as a mandatory pipeline dependency."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D3.2-8274553f",
    "scenarioType": "Multi-Agent Research System"
  },
  {
    "taskStatement": "D4.4",
    "domain": "D4",
    "scenario": "The claim-extraction subagent pulls claim_text, source_url, and supporting_quote into a JSON schema the synthesis agent cites from. A manual audit finds that in roughly 20% of records, supporting_quote never appears on the page at source_url — the retry loop only fires on schema validation failure, so these schema-valid fabrications reach published reports.",
    "question": "What change would most effectively catch this failure mode before reports are published?",
    "options": {
      "A": "Add a verification step that checks each supporting_quote against the actual text of the page at source_url, and feeds any mismatch back to the extraction subagent as the reason for a retry.",
      "B": "Set the extraction subagent's temperature to 0 and pin a fixed seed, so repeated calls on the same page produce identical claim_text, source_url, and supporting_quote values.",
      "C": "Increase the retry count on schema validation failures to a higher number, so the extraction subagent gets more attempts to produce a well-formed claim_text, source_url, and supporting_quote record.",
      "D": "Tighten the JSON schema by adding a regex pattern requiring source_url to be a well-formed URL and requiring supporting_quote to be a non-empty string above a minimum character length."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Schema validation only enforces structure, not semantic accuracy. Catching a fabricated-but-well-formed quote requires a separate grounding check that compares the extracted content against the actual source, then routes any mismatch back into the retry loop with the specific discrepancy identified.",
      "B": "Lowering temperature and fixing the seed may make the extraction subagent's outputs more deterministic and repeatable across runs, but determinism does not verify content against a source; the model can still confidently and consistently fabricate the same plausible-sounding quote every time.",
      "C": "Schema validation already passes on these records — the fabricated quotes are syntactically valid, correctly-typed claim_text, source_url, and supporting_quote fields, so giving the extraction subagent more attempts triggered by schema checks will never fire on this failure mode.",
      "D": "A URL-format regex and a minimum-length check on supporting_quote only confirm source_url is syntactically a URL and that a quote string of adequate size is present — neither checks whether that quote actually appears on the page it's attributed to, so the fabrication passes unchanged."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.4-58631487",
    "scenarioType": "Multi-Agent Research System"
  },
  {
    "taskStatement": "D3.1",
    "domain": "D3",
    "scenario": "For this tool, the platform team maintains a modular Claude Code setup: the root CLAUDE.md uses @import to pull in three standards files (api-standards.md, testing.md, security.md), and several packages have their own CLAUDE.md files. One developer reports that Claude Code applies the security conventions inconsistently across sessions—sometimes citing the rules verbatim, other times behaving as if they don't exist—even though the standards files themselves have not changed.",
    "question": "What is the most effective first step to diagnose why the instructions are applied inconsistently?",
    "options": {
      "A": "Run the /memory command to verify which memory files are actually loaded in the session and confirm the @import chain resolves to the expected files.",
      "B": "Consolidate the three imported standards files back into a single monolithic CLAUDE.md so there are fewer moving parts to load.",
      "D": "Add a rule at the top of every package CLAUDE.md instructing Claude to always apply the security standards.",
      "C": "Duplicate the security conventions in both the root CLAUDE.md and every package-level CLAUDE.md so they load either way."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. /memory shows exactly which memory files are loaded, which is the direct way to verify whether the @import chain resolved and to diagnose inconsistent behavior across sessions before changing any configuration.",
      "B": "Reverses a recommended modular organization without diagnosing anything - if an import isn't resolving, consolidation hides the cause rather than revealing it.",
      "D": "Adds prompt-level emphasis without establishing whether the security file is loaded at all; instructions cannot apply if the file never enters context.",
      "C": "Duplication creates the drift and maintenance problems modular organization exists to avoid, and still doesn't explain the inconsistency."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-fable-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D3.1-71407301",
    "scenarioType": "Developer Productivity with Claude"
  },
  {
    "taskStatement": "D4.3",
    "domain": "D4",
    "scenario": "The extraction tool's schema pulls vendor, PO number, delivery date, and payment terms from supplier emails, with every field marked required. QA sampling finds that when an email genuinely omits payment terms, the tool still returns a plausible-looking value such as \"Net 30\" — fabricated to satisfy the schema — and these invented values are flowing into the downstream ERP system.",
    "question": "Which schema change most directly prevents the fabricated values?",
    "options": {
      "A": "Keep all fields required, but add a system-prompt instruction telling the model to write 'unknown' as a placeholder when a field like payment terms is missing from the email.",
      "B": "Lower the model's temperature toward zero and add a few-shot example showing correct extraction, so extractions become deterministic and less likely to invent plausible values.",
      "C": "Add a second required field asking the model to output a numeric confidence score alongside each extracted value, flagging low-confidence fields like a fabricated payment term.",
      "D": "Make fields that may legitimately be absent from the source optional and nullable, so the model can return null when the information is not present."
    },
    "correct": "D",
    "explanations": {
      "A": "The schema still requires a value, so the structural pressure to produce one remains; a prompt instruction to write 'unknown' as a placeholder competes with - and loses to - the required-field constraint, and 'unknown' is itself just another fabricated string filling a slot that should be empty.",
      "B": "Temperature changes variability, not the requirement to fill the field; a deterministic model guided by a few-shot example will deterministically fabricate a value like 'Net 30' when the schema still demands one.",
      "C": "Self-reported confidence is poorly calibrated and does nothing to stop the fabricated value from being produced in the first place - the pipeline still writes 'Net 30' into the ERP system alongside a confidence score.",
      "D": "Correct. A required field forces the model to produce something even when the source has nothing. Making absent-able fields optional and nullable removes the structural pressure to fabricate, so a missing value can be represented honestly as null."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-fable-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.3-35d6887a",
    "scenarioType": "Structured Data Extraction"
  },
  {
    "taskStatement": "D4.3",
    "domain": "D4",
    "scenario": "One extraction stage handles a mixed intake stream of contracts, invoices, and resumes using three schema-defined tools — extract_contract, extract_invoice, extract_resume — where the document type is not known in advance. Production logs show that in some runs Claude instead returns a conversational reply, such as \"This appears to be an employment contract...\", without calling any extraction tool, causing downstream automation to fail on those runs.",
    "question": "Which tool_choice configuration fixes the failures while preserving correct routing across document types?",
    "options": {
      "D": "Set tool_choice to \"any\", requiring the model to call one of the extraction tools while leaving it free to choose the tool matching the document type.",
      "A": "Force extract_contract with tool_choice {\"type\": \"tool\", \"name\": \"extract_contract\"}, since contracts are the most common document type.",
      "C": "Keep tool_choice on \"auto\" and add a system-prompt instruction that a tool must always be called.",
      "B": "Replace the three tools with a single generic extract_document tool so no routing decision is needed."
    },
    "correct": "D",
    "explanations": {
      "D": "Correct. \"any\" guarantees a tool call on every run - eliminating the conversational-reply failure - while preserving the model's choice among the three schemas, which is exactly what an unknown document type requires.",
      "A": "Forcing one named tool guarantees a call but destroys routing - invoices and resumes would be extracted through the contract schema.",
      "C": "\"auto\" permits text-only replies by design; a prompt instruction reduces but cannot eliminate them, so the failure mode persists at some rate.",
      "B": "Collapsing the schemas sacrifices the per-type field definitions that make the extractions useful downstream, trading a routing non-problem for a data-quality one."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-fable-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.3-e8f58662",
    "scenarioType": "Structured Data Extraction"
  },
  {
    "taskStatement": "D5.1",
    "domain": "D5",
    "scenario": "During a long returns conversation, the customer states specific refund amounts and order dates across several turns; after multiple lookup_order calls each returning records with 40+ fields of shipping history, warehouse codes, and internal flags, you notice the agent begins misstating amounts and dates the customer gave earlier, and the conversation's context usage keeps climbing.",
    "question": "Which change most directly addresses the degradation?",
    "options": {
      "C": "Instruct the agent to re-ask the customer for amounts and dates whenever it is unsure, so that any detail lost from context is recovered directly from the customer rather than misremembered.",
      "B": "Switch to a model with a larger context window so the full records fit comfortably, giving the conversation enough headroom that the accumulated lookups no longer crowd out the earlier turns.",
      "D": "Trim each tool result to only the fields relevant to the current issue before it enters conversation context, so lookups stop consuming tokens disproportionate to their relevance.",
      "A": "Reduce the number of order lookups the agent is allowed to make per conversation, capping how much verbose tool output can accumulate in context over the course of a long multi-issue session."
    },
    "correct": "D",
    "explanations": {
      "C": "Pushes the cost of context mismanagement onto the customer and erodes trust; the stated amounts were already in the conversation.",
      "B": "A larger window delays the ceiling but does not fix disproportionate accumulation, and recall issues on long inputs remain.",
      "D": "Correct. Verbose tool results accumulate in context and consume tokens far out of proportion to their relevance; trimming to the relevant fields stops the accumulation at its source and preserves room for the facts the customer actually stated.",
      "A": "Caps a legitimate capability instead of fixing the waste per lookup - the agent may need every one of those lookups in a multi-issue session."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-fable-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.1-7933e256",
    "scenarioType": "Customer Support Resolution Agent"
  },
  {
    "taskStatement": "D3.3",
    "domain": "D3",
    "scenario": "While using rule files under .claude/rules/ to scope Python, SQL, and Terraform conventions by glob pattern, an engineer adds a new rule file with frontmatter matching **/*.py, intending it to apply only within the payments service subdirectory, but Claude silently applies its conventions to Python files across every service in the monorepo.",
    "question": "What is the most effective fix so this rule applies only within the payments service?",
    "options": {
      "A": "Narrow the glob pattern to a path-anchored form such as services/payments/**/*.py so the match is scoped by directory as well as file extension.",
      "B": "Move the rule's content into the payments service's own CLAUDE.md file, since directory-level CLAUDE.md files are the mechanism for scoping conventions to a single subdirectory.",
      "C": "Keep the **/*.py pattern but add a second glob excluding the other service directories by name, since path-specific rules require an explicit exclusion list to avoid matching unrelated directories.",
      "D": "Convert the rule into a skill under .claude/skills/, since skills load conditionally based on directory context in a way that rule files do not."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. The glob pattern is the entire targeting mechanism for a rule file; **/*.py matches every Python file regardless of directory, so anchoring the pattern to the payments path is what restricts the match to that subdirectory.",
      "B": "Directory-level CLAUDE.md files apply broadly to everything under that directory rather than being filtered by file type, and this abandons the glob-based rule mechanism the team already relies on for the other conventions instead of simply fixing the pattern.",
      "C": "Misdiagnoses the mechanism: glob matching does not require a separate exclusion list to stay scoped, since a correctly anchored include pattern already excludes everything outside it.",
      "D": "Skills are loaded by invocation, not automatically matched against the file paths being edited, so converting the rule to a skill would lose the deterministic, path-based application the team needs."
    },
    "register": "named",
    "scenarioType": "Developer Productivity with Claude",
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-08-03",
      "reviewed": true
    },
    "id": "D3.3-906ae9ae"
  },
  {
    "taskStatement": "D3.2",
    "domain": "D3",
    "scenario": "Investigating why the legacy billing module's dependency chains keep getting misread, one engineer builds a personal grep-and-read sequence that traces the chains correctly; the workflow is specific to their debugging style, unused by the rest of the team, and they want it available whenever they open the repo without it showing up in teammates' command lists after a pull.",
    "question": "Where should this developer store the command file so it stays available only in their own environment and never reaches teammates through version control?",
    "options": {
      "A": "In .claude/commands/ inside the project repository, so version control keeps it available to everyone who clones or pulls.",
      "B": "In the project's CLAUDE.md file, documented under a workflow heading so Claude recognizes it as a callable command.",
      "C": "In ~/.claude/commands/ within the developer's own home directory, so the command is scoped to that individual and never checked into the repo.",
      "D": "In .claude/skills/ inside the project repository, so Claude can discover and invoke the workflow automatically without a slash command."
    },
    "correct": "C",
    "explanations": {
      "A": "This is the project-scoped location: anything placed here is version-controlled and distributed to every developer who clones or pulls the repo, which is the opposite of what's wanted.",
      "B": "CLAUDE.md carries project instructions and context for Claude to read, not a mechanism for defining an invocable slash command, and it would still live in the shared repo.",
      "C": "Correct. Commands placed in the user's home directory are personal-scoped: they're available across that individual's projects but are not part of the repository, so they never propagate to teammates via version control.",
      "D": "Skills in .claude/skills/ within the repo are both project-shared (committed and visible to the whole team) and model-invoked by description match rather than an explicit personal command — it solves neither the scoping nor the invocation requirement here."
    },
    "register": "named",
    "scenarioType": "Developer Productivity with Claude",
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-08-03",
      "reviewed": true
    },
    "id": "D3.2-891f252b"
  },
  {
    "taskStatement": "D3.5",
    "domain": "D3",
    "scenario": "The developer is using this agent to generate integration tests for a legacy billing API endpoint. Across six consecutive turns of \"improve this\" requests — each bundling error handling, mock setup, assertion coverage, and naming together — the error handling fixed in turn two has silently broken again by turn six, and the developer can't tell which of the intervening turns reintroduced it.",
    "question": "Which approach to structuring these follow-up turns would have prevented the regression from going unnoticed?",
    "options": {
      "A": "Bundle all four requested improvements into a single detailed follow-up turn so the agent has the complete target state up front and needs only one revision pass.",
      "B": "Each turn, target one specific aspect of the output, and before moving to the next aspect, check that the change made in the prior turn is still intact.",
      "C": "When quality seems to be slipping, discard the current output and regenerate from the original turn-one prompt with all desired improvements listed at once.",
      "D": "Ask the agent to rate its own output's quality after each turn on a numeric scale, and keep iterating until it reports a high score."
    },
    "correct": "B",
    "explanations": {
      "A": "Bundling multiple changes into one turn is what caused the problem: with several aspects moving at once, there is no checkpoint where a regression in an already-fixed aspect gets caught before further changes bury it.",
      "B": "Correct. Isolating one change per round and confirming the prior fix still holds before adding the next gives each turn a clear, checkable outcome - a regression surfaces immediately, at the turn that caused it, rather than being discovered three turns later with no way to tell which change broke it.",
      "C": "Restarting from the original prompt with everything requested at once reproduces the same bundling problem in one larger step and discards the progress already validated in earlier turns.",
      "D": "Self-reported quality scores are not grounded in actual verification of the prior fix, so the agent can report a high score even while a previously fixed issue has silently regressed."
    },
    "register": "functional",
    "scenarioType": "Developer Productivity with Claude",
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-08-03",
      "reviewed": true
    },
    "id": "D3.5-06155ce0"
  },
  {
    "taskStatement": "D3.4",
    "domain": "D3",
    "scenario": "A developer working with this agent on the legacy billing service reports that request latency during peak hours has degraded over the past month, and a profiling pass shows the database is repeatedly serving identical reads for the same customer records because several subsystems query overlapping data through different paths — no caching layer exists anywhere in the service today.",
    "question": "Given that the request names a goal but not a mechanism, and multiple viable implementations exist with different tradeoffs across the service's query paths, which approach should the developer take?",
    "options": {
      "A": "Use direct execution, having the agent implement an in-memory caching layer immediately, since caching is a common pattern the model already understands well and can apply without further design.",
      "B": "Use direct execution, having the agent begin implementing broadly, but instruct it to stop and ask for guidance only if it discovers the service's architecture differs from what was assumed.",
      "C": "Have the agent implement all three caching approaches as parallel branches, then benchmark each against production-like load before deciding which implementation to keep in the final codebase.",
      "D": "Have the agent first explore the query paths and existing architecture, propose a caching strategy with its tradeoffs, and require explicit approval of that plan before any file is modified."
    },
    "correct": "D",
    "explanations": {
      "A": "Treats the request as if the mechanism were already decided, when the real decision point is which of several viable caching strategies fits this service's query paths - skipping that choice risks building the wrong one across many files.",
      "B": "Defers the multiple-valid-approaches decision until the agent hits a surprise mid-implementation, rather than surfacing and resolving it before any file is touched, which is exactly what an exploration-and-approval step exists to do.",
      "C": "Wastes effort building three full implementations when the ambiguity is a design decision, not an empirical question best resolved by shipping all options and measuring after the fact.",
      "D": "Correct. The situation has multiple valid approaches and unclear existing architecture, which is precisely when exploring first and getting approval on a proposed approach before any changes are made prevents costly rework."
    },
    "register": "functional",
    "scenarioType": "Developer Productivity with Claude",
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-08-03",
      "reviewed": true
    },
    "id": "D3.4-b3d38f9d"
  },
  {
    "taskStatement": "D3.6",
    "domain": "D3",
    "scenario": "The team also wires this agent into CI as a headless reviewer, invoking it via the Claude Agent SDK against the same repository checkout for every open pull request. With five PRs open simultaneously, the pipeline launches five concurrent headless runs, and reviewers start seeing feedback that references code changes from a different PR than the one actually under review.",
    "question": "What change would most directly fix this cross-PR contamination?",
    "options": {
      "A": "Before each headless invocation, check out an isolated working-tree copy of the repository for that run, so concurrent jobs never share the same files on disk.",
      "B": "Reduce the CI runner's job concurrency limit to two, assuming a smaller number of simultaneous jobs will make file collisions rare enough to ignore in practice.",
      "C": "Queue every pull request review job so only one headless invocation runs against the shared repository checkout at any given time, trading parallelism for consistency.",
      "D": "Add the non-interactive flag to each invocation, since headless mode is documented as keeping concurrent runs isolated from each other's file state automatically."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Concurrent CI jobs sharing one checkout can read partially-written files or overwrite each other's edits mid-run; giving each run its own isolated copy of the working tree removes the shared mutable state that caused the cross-PR contamination.",
      "B": "Lowering concurrency shrinks the odds of collision without eliminating it, and it sacrifices throughput to work around a race condition instead of removing the shared state that causes it.",
      "C": "Serializing all jobs would stop the contamination, but it forces every PR to wait behind the others and discards the concurrency the pipeline was built for, when isolating each run's files preserves both correctness and parallelism.",
      "D": "The non-interactive flag controls whether Claude Code prompts for input rather than waiting on a terminal; it says nothing about file isolation between concurrent processes, so it doesn't address jobs sharing a checkout."
    },
    "register": "functional",
    "scenarioType": "Developer Productivity with Claude",
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-08-03",
      "reviewed": true
    },
    "id": "D3.6-51917cfe"
  },
  {
    "taskStatement": "D3.1",
    "domain": "D3",
    "scenario": "While using the agent to explore the legacy codebase, one engineer wants Claude Code to always append extra verbose debug logging instructions to its exploration steps, but only for their own sessions; teammates who check out the same repository and load the same project instructions do not want that verbose logging behavior applied when they explore the codebase.",
    "question": "What is the current best-practice way to apply this one developer's personal instructions without changing the shared, version-controlled CLAUDE.md that every teammate loads?",
    "options": {
      "A": "Add an @import line to the shared project CLAUDE.md that points to a path inside the developer's home directory, so the personal file loads for everyone who has that path present.",
      "B": "Create a CLAUDE.local.md file in the project root to hold the developer's personal instructions, keeping the main CLAUDE.md file focused on shared team conventions.",
      "C": "Place the personal instructions in the developer's own ~/.claude/CLAUDE.md file, which Claude Code loads automatically for that user without touching the shared, version-controlled project file.",
      "D": "Add the personal instructions directly into the shared project CLAUDE.md, marked with a comment noting they are optional for other developers."
    },
    "correct": "C",
    "explanations": {
      "A": "Unnecessary and still edits the file every teammate loads - it also requires each developer's machine to have a matching path, when the home-directory CLAUDE.md is already loaded automatically with no import needed.",
      "B": "CLAUDE.local.md was an older pattern for machine- or user-specific overrides that has been superseded by user-level home-directory configuration, and it still sits inside the project tree rather than being cleanly separated from it.",
      "C": "Correct. The home-directory CLAUDE.md is a separate level of the memory hierarchy, loaded automatically for that user across projects, so personal instructions apply only to them and the shared repository file stays untouched.",
      "D": "Puts machine-specific content into the one file every teammate loads and relies on each developer noticing and manually ignoring a comment, which is a probabilistic fix for what should be scoped by the hierarchy itself."
    },
    "register": "named",
    "scenarioType": "Developer Productivity with Claude",
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-08-03",
      "reviewed": true
    },
    "id": "D3.1-83f035e2"
  },
  {
    "taskStatement": "D5.1",
    "domain": "D5",
    "scenario": "In one such billing-dispute conversation now around turn 60, an engineer reviewing the transcript notices the agent's recent replies no longer reference the customer's account tier — a fact the customer stated once, early on, that determines whether a fee waiver is permitted — even though nothing in the pipeline has removed that line from the raw transcript.",
    "question": "The account tier fact is still present verbatim in the raw transcript, yet the agent's recent responses behave as if it doesn't know it. What is the most likely explanation, and what should the fix target?",
    "options": {
      "D": "The agent is deliberately withholding the account tier because escalate_to_human was never invoked, treating tier-based waivers as out of its scope; the fix is to add an account tier field to the escalate_to_human tool schema so a human reviewer receives it.",
      "C": "The system prompt does not repeat the account tier on every turn, so the model treats the fact as stale; the fix is to have get_customer re-run automatically before every single response regardless of whether new customer data is actually needed.",
      "A": "The MCP tool results exchanged between turns 1 and 60 have overwritten the conversation buffer, silently dropping the account tier line; the fix is to enlarge the context window so no turns are evicted before the conversation ends.",
      "B": "The model's attention degrades over very long contexts, so critical early facts effectively become invisible as more turns accumulate; the fix is to periodically re-surface such facts into a structured, refreshed summary rather than relying on raw transcript position."
    },
    "correct": "B",
    "explanations": {
      "D": "Invents an intentional scoping decision with no supporting evidence; the observed symptom is the agent forgetting a fact, not the agent correctly declining to act on it pending escalation.",
      "C": "Relies on a nonexistent staleness mechanism, and re-running get_customer on every turn addresses tool-call frequency, not the actual problem of a fact losing salience across a long transcript.",
      "A": "Describes a mechanism inconsistent with the evidence given: the fact is confirmed still present verbatim, so no eviction or overwrite occurred, and enlarging the window would not fix an attention problem happening within an already-intact context.",
      "B": "Correct. Presence in the raw transcript does not guarantee the model weighs a fact correctly once many turns have accumulated after it; explicitly extracting critical facts into a structured, periodically-refreshed summary counters this degradation without depending on where the fact sits in the transcript."
    },
    "register": "named",
    "scenarioType": "Customer Support Resolution Agent",
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-08-03",
      "reviewed": true
    },
    "id": "D5.1-81918e6b"
  },
  {
    "taskStatement": "D2.5",
    "domain": "D2",
    "scenario": "Before shipping a fix to the escalation criteria used by escalate_to_human, an engineer wants to confirm test coverage exists by enumerating every test file whose filename matches the pattern *escalation*.test.ts across the agent's monorepo of hundreds of nested packages, without opening or inspecting any file's contents yet.",
    "question": "Which built-in capability should the engineer reach for to complete this filename-enumeration step, before any file is opened?",
    "options": {
      "C": "A general-purpose shell command execution capability that can run arbitrary operating-system commands, including its own file-listing utilities, to produce a comparable listing of paths.",
      "D": "A pattern-matching lookup that returns the paths of files whose names match a wildcard pattern across nested directories, without opening or reading any file's contents.",
      "A": "An operation that opens one specified file at a time and returns its full contents, intended for viewing a file whose path is already known rather than discovering unknown ones.",
      "B": "A content-search operation that scans the text inside every file for a matching string or expression, returning matching lines together with each file's path."
    },
    "correct": "D",
    "explanations": {
      "C": "This is Bash, which could shell out to an OS listing utility to approximate the same result, but reaching for general-purpose command execution when a purpose-built pattern-matching lookup already exists is unnecessary indirection for a simple filename query.",
      "D": "Correct. This is Glob: a purpose-built name-pattern matcher that resolves filenames across nested directories without touching file contents, which is exactly what a filename-only inventory step needs.",
      "A": "This is Read, which requires a specific known file path and returns that file's contents. It cannot discover files matching a pattern in the first place, since discovery is the exact step still needed here.",
      "B": "This is Grep, which searches inside file contents for a match. The engineer hasn't opened any files yet and only cares about filenames, so a content scan solves a different problem than the one described."
    },
    "register": "functional",
    "scenarioType": "Customer Support Resolution Agent",
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-08-03",
      "reviewed": true
    },
    "id": "D2.5-0f4c57b5"
  },
  {
    "taskStatement": "D2.2",
    "domain": "D2",
    "scenario": "Log review of process_refund calls shows the tool returns the identical generic failure message string regardless of cause: in cases where the refund had already been issued earlier that same day, the agent re-attempts the refund (risking a duplicate payout), while in cases where the payment gateway simply timed out, the agent immediately escalates instead of retrying.",
    "question": "What change to how process_refund reports failure would let the agent tell these two cases apart and choose the correct next action for each, without relying on the model's judgment to parse a free-text message?",
    "options": {
      "B": "Have process_refund retry internally with exponential backoff before returning a failure, so that only failures which persist after several attempts are ever surfaced to the agent for a decision at all.",
      "D": "Have process_refund return a machine-readable failure category, such as already_processed versus transient_timeout, alongside its message, so the agent can branch its next action on that field instead of parsing free text.",
      "A": "Add few-shot examples to the system prompt showing the agent how to word its reply to the customer differently depending on which of the two failure messages process_refund happens to return in a given case.",
      "C": "Have process_refund raise one generic exception for every kind of failure and route each occurrence straight to escalate_to_human, letting a person sort out which failures were transient and which were not."
    },
    "correct": "D",
    "explanations": {
      "B": "Internal retries only address the transient_timeout case, and they do nothing to stop the agent from re-attempting a refund that already succeeded, since that failure is not transient and retrying it internally would itself risk a duplicate payout.",
      "D": "Correct. A distinct, machine-readable field for the failure's cause gives the agent a deterministic signal to branch on — stop and report for already_processed, retry or wait for transient_timeout — without depending on the model correctly interpreting a message string.",
      "A": "Relies on the model correctly parsing and generalizing from free-text examples every time, which is probabilistic and insufficient when a wrong branch causes a duplicate refund.",
      "C": "Collapses both failure types into the same generic path and sends every case to a human, which forfeits the retry that the transient_timeout case actually calls for and adds unnecessary escalation volume."
    },
    "register": "functional",
    "scenarioType": "Customer Support Resolution Agent",
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-08-03",
      "reviewed": true
    },
    "id": "D2.2-9695bd09"
  },
  {
    "taskStatement": "D1.1",
    "domain": "D1",
    "scenario": "Reviewing a batch of billing dispute transcripts, you find that whenever the customer's message reads as frustrated, the agent's very first action is calling escalate_to_human — it never attempts get_customer or lookup_order first. Checking the underlying account and order data for those same cases afterward shows it was retrievable in most of them, and many disputes could plausibly have been resolved without a human.",
    "question": "Which change to the loop's design would most reliably prevent this premature escalation?",
    "options": {
      "B": "Add a sentiment-detection step that suppresses the escalation trigger whenever the customer's measured frustration score falls below a preset numeric threshold.",
      "A": "Restructure the loop so escalate_to_human only becomes available once the model has completed at least one get_customer or lookup_order call for the case, rather than on tone alone.",
      "C": "Add several few-shot examples to the system prompt showing the agent attempting get_customer and lookup_order before it escalates on a frustrated customer tone.",
      "D": "Add an explicit system prompt instruction that the agent must attempt available information-gathering tools before escalating, regardless of the customer's tone."
    },
    "correct": "A",
    "explanations": {
      "B": "Tunes the wrong signal: it adjusts when tone triggers escalation but does nothing to ensure get_customer or lookup_order are actually attempted first, so a case could still reach escalation with no data gathered.",
      "A": "Correct. Making escalate_to_human's availability conditional on the loop's recorded state - at least one completed information-gathering call - is a programmatic gate the model cannot bypass by tone or wording, giving a deterministic guarantee that prompt-based fixes cannot.",
      "C": "Few-shot examples raise the odds of the right order of operations but still rely on probabilistic compliance; the model can still choose to escalate first on a sufficiently frustrated message.",
      "D": "A system prompt instruction is the same probabilistic mechanism as A - reasonable as a supplement, but it does not prevent the model from skipping tool calls under emotional pressure in the input."
    },
    "register": "named",
    "scenarioType": "Customer Support Resolution Agent",
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-08-03",
      "reviewed": true
    },
    "id": "D1.1-1e80b42f"
  },
  {
    "taskStatement": "D5.4",
    "domain": "D5",
    "scenario": "While debugging your warehouse management system, a developer asks Claude Code to trace how inventory reservations flow across the 3,200 files spanning a dozen services. Midway through the session, the transcript already holds the full contents of several large files that turned out to be irrelevant, and the developer notices response quality degrading as the conversation continues.",
    "question": "The developer wants to keep exploring the codebase without the irrelevant file contents continuing to crowd every subsequent turn. Given that the harness offers a way to condense the conversation into a summary and discard the bulk of what generated it, which action best addresses the problem right now, mid-session?",
    "options": {
      "C": "Ask Claude to re-read the irrelevant files a second time and write an inline summary, reasoning that a summary placed later in the transcript will outweigh the original content earlier in it.",
      "D": "Manually trigger conversation condensation so the irrelevant file reads are reduced to a summary and their bulk is dropped, then keep exploring with the freed-up space.",
      "A": "Open a second terminal running a fresh session and re-ask the original question there, abandoning the degraded session and its accumulated file-structure knowledge entirely.",
      "B": "Instruct Claude to mentally disregard the irrelevant files it already read, since once content lands in the transcript the harness has no mechanism for removing it."
    },
    "correct": "D",
    "explanations": {
      "C": "Adds more tokens rather than fewer - it re-reads the same irrelevant files and appends new content, worsening the crowding it's meant to fix instead of discarding the original bulk.",
      "D": "Correct. Manually condensing the conversation summarizes what's been learned and discards the bulky original file contents, directly freeing context that the irrelevant reads were occupying while preserving useful progress.",
      "A": "Discards the file-structure knowledge and progress already built up in the current session, and doesn't actually solve the underlying crowding problem for the remainder of a long exploration task.",
      "B": "Incorrect: an instruction to disregard content doesn't remove it from the transcript, so the irrelevant tokens keep consuming context and degrading response quality regardless of what Claude is told."
    },
    "register": "functional",
    "scenarioType": "Code Generation with Claude Code",
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-08-03",
      "reviewed": true
    },
    "id": "D5.4-a8ea8ee1"
  },
  {
    "taskStatement": "D3.1",
    "domain": "D3",
    "scenario": "A developer on your team recently upgraded Claude Code and notices their personal CLAUDE.local.md file at the project root — previously gitignored and used to hold their own unshared instructions — is no longer being picked up. They ask how to restore personal, unshared instructions going forward without committing them to the shared repo.",
    "question": "What is the current, correct way to configure this developer's personal instructions going forward?",
    "options": {
      "B": "Recreate a CLAUDE.local.md file at the project root, since adding it to .gitignore is enough to keep it personal to each developer.",
      "C": "Move the personal preferences directly into the home-directory CLAUDE.md and drop any reference to them from the project, since that file already loads automatically for that user.",
      "D": "Create a .claude/personal/ folder inside the repo and add just that folder to .gitignore, so Claude Code keeps loading it without the content being committed.",
      "A": "In the project's CLAUDE.md, add an @import line pointing to a file under the developer's home directory, so the reference lives in the repo but the personal content never does."
    },
    "correct": "A",
    "explanations": {
      "B": "CLAUDE.local.md is a deprecated pattern that Claude Code no longer loads; gitignoring it does not restore that behavior, which is exactly the symptom in the scenario.",
      "C": "The home-directory CLAUDE.md does load automatically for that user, but it applies across every project rather than being scoped to this one, and removing the project-side reference loses the connection to this specific repo's context.",
      "D": "Invents an undocumented loading mechanism; Claude Code's memory hierarchy is not defined by ad hoc gitignored subdirectories inside the repo.",
      "A": "Correct. This is the current replacement for CLAUDE.local.md: the project's CLAUDE.md carries a home-directory @import, so the personal file lives outside the repo entirely while still being pulled in whenever this project is opened."
    },
    "register": "named",
    "scenarioType": "Code Generation with Claude Code",
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-08-03",
      "reviewed": true
    },
    "id": "D3.1-f6981813"
  },
  {
    "taskStatement": "D3.2",
    "domain": "D3",
    "scenario": "A subset of your team wants docstring generation to fire automatically the moment Claude Code is editing any Python file in the repo, with no developer typing a slash command to invoke it, and they're deciding whether to build this as a custom slash command or package it as a skill.",
    "question": "Which approach correctly achieves automatic, hands-free triggering?",
    "options": {
      "A": "Build it as a slash command stored in the project's commands directory, since project-scoped commands become the automatic default behavior applied to every file edit in that repository.",
      "D": "Build it as a skill but document its purpose only in CLAUDE.md, since CLAUDE.md content loads once per session and is applied automatically without needing a separate description field to match against.",
      "B": "Build it as a skill, since Claude discovers and loads skills automatically when their description matches the current context, while slash commands only run when a developer explicitly types the command name.",
      "C": "Build it as a slash command with a default argument, since a default argument lets the command run on its own without the developer supplying extra input each time it's invoked."
    },
    "correct": "B",
    "explanations": {
      "A": "Project-scoping controls who can access a command (every developer who clones the repo), not whether it fires automatically - a slash command still requires an explicit typed invocation regardless of where it's stored.",
      "D": "This inverts the mechanism: it is the skill's own description field that enables automatic, context-matched discovery. Relying on CLAUDE.md instead removes the very matching mechanism that makes automatic triggering possible.",
      "B": "Correct. Skills are discovered and loaded automatically when their description matches the current context, so a skill can trigger on a Python-file edit with no typed command. Slash commands are explicit-invocation only.",
      "C": "A default argument only changes what value a command receives if invoked - it does not change the trigger. Slash commands still require the developer to type the command name."
    },
    "register": "named",
    "scenarioType": "Code Generation with Claude Code",
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-08-03",
      "reviewed": true
    },
    "id": "D3.2-987b09ef"
  },
  {
    "taskStatement": "D5.2",
    "domain": "D5",
    "scenario": "Last week, one engineer let the agent run a large database-migration task in direct execution without pausing for review. Midway through, it hit two conflicting existing patterns in the codebase for handling nullable foreign keys, silently picked one, and applied that change across 20 files before anyone noticed the inconsistency — triggering a full rework cycle.",
    "question": "Which workflow change would most reliably prevent this kind of costly rework when the agent encounters a genuine ambiguity in requirements or existing conventions?",
    "options": {
      "D": "Have the agent proceed with its best guess and leave a comment in the diff noting the assumption, so reviewers can catch it during code review.",
      "C": "Add explicit instructions to the project's shared configuration file telling the agent to always ask before resolving ambiguous conventions, then continue with direct execution as before.",
      "A": "For changes touching ambiguous or conflicting conventions, require the agent to first explore the codebase and present its planned approach for confirmation before any files are edited.",
      "B": "Have the agent default to whichever convention appears in the most recently modified file, on the theory that recent code reflects current team practice."
    },
    "correct": "A",
    "explanations": {
      "D": "Detects the problem only after the change has already been applied across 20 files — catching an assumption in review is not the same as preventing the rework it already caused.",
      "C": "Written instructions still rely on the model choosing to comply in the moment; nothing about direct execution actually stops file edits from happening before the ambiguity is surfaced to anyone.",
      "A": "Correct. This describes the behavior of exploring and proposing an approach before any edits land: for large or ambiguous changes, it turns a silent guess into a checkpoint the user can correct before 20 files are touched instead of after.",
      "B": "An arbitrary heuristic with no basis in which convention is actually correct; it resolves the ambiguity by guessing differently, not by surfacing it for a decision."
    },
    "register": "functional",
    "scenarioType": "Code Generation with Claude Code",
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-08-03",
      "reviewed": true
    },
    "id": "D5.2-d7351fed"
  },
  {
    "taskStatement": "D5.3",
    "domain": "D5",
    "scenario": "Your team's custom /audit-deps slash command uses the Task tool to spawn a subagent per legacy service directory to scan for outdated dependencies. On the last run, one subagent hit a directory it lacked read permissions for, and the main session only saw a bare \"subtask failed\" message, with no indication of which service was skipped or which dependency checks never ran.",
    "question": "How should the subagent's failure information be structured so the orchestrating session can respond intelligently?",
    "options": {
      "B": "Have the subagent return structured output naming the failed directory, the permission error type, and which services were already audited, so the session can decide how to proceed.",
      "A": "Configure the subagent to keep retrying the same directory with the same credentials until the permission error resolves, then report success once access is granted.",
      "D": "Have the orchestrating session catch the generic failure and abort the entire slash command run immediately, rather than surface any partial audit results.",
      "C": "Have the subagent silently treat the inaccessible directory as fully audited and report the run as complete, since permission gaps are common in legacy repos."
    },
    "correct": "B",
    "explanations": {
      "B": "Correct. Structured error context - the specific directory, the permission error type, and which services were already audited before the failure - gives the orchestrating session the information it needs to decide whether to retry, skip that directory and continue, or ask the user for access, rather than guessing from a generic failure message.",
      "A": "Retrying with the same credentials cannot resolve a permission error that requires different access, so this either loops indefinitely or falsely reports success without ever fixing the underlying access problem.",
      "D": "Aborting the whole run over one inaccessible directory throws away the audits already completed successfully for other services, when a targeted retry or skip-and-continue could preserve that partial progress.",
      "C": "Masking the failure as success discards the fact that a real error occurred, so the orchestrating session has no way to know the audit is incomplete or to flag the skipped service for review."
    },
    "register": "named",
    "scenarioType": "Code Generation with Claude Code",
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-08-03",
      "reviewed": true
    },
    "id": "D5.3-b04007e4"
  },
  {
    "taskStatement": "D3.3",
    "domain": "D3",
    "scenario": "Your team's GraphQL resolver files carry a shared `.resolver.ts` extension but live scattered across a dozen unrelated service directories with no common parent, and developers want resolver conventions to load automatically whenever Claude opens any of them.",
    "question": "What is the most maintainable way to make resolver conventions load automatically for any .resolver.ts file, regardless of which directory it lives in?",
    "options": {
      "D": "Create a new convention file whose header declares a pattern matching the .resolver.ts extension, so it loads automatically for any matching file, regardless of directory.",
      "C": "Add the resolver conventions to the root-level project instruction file, since it is the only mechanism guaranteed to load into context on every turn regardless of which file is being edited.",
      "A": "Package the conventions into an invocable reference document that a developer must explicitly request before Claude edits any resolver file, so the conventions load only when asked for.",
      "B": "Place a directory-level instruction file in every directory that contains resolver files, so each file inherits the conventions defined for its containing directory."
    },
    "correct": "D",
    "explanations": {
      "D": "Correct. A path-scoped convention file is matched by its declared pattern, not by folder location, so a pattern targeting the .resolver.ts extension loads the conventions for every matching file no matter which of the scattered service directories it sits in — the same mechanism already producing the models/-only behavior the team observed.",
      "C": "The root-level instruction file is the mechanism that loads on every turn for every file type; putting resolver conventions there works but reintroduces the exact always-on behavior the team is trying to avoid, adding irrelevant content when Claude is editing unrelated files.",
      "A": "An invocable reference document only loads when a developer explicitly requests it, so conventions would be silently skipped any time someone edits a resolver file without remembering to ask for it first.",
      "B": "A directory-level file only covers files inside that one directory, so it would need to be duplicated and kept in sync across every unrelated service directory that happens to contain a resolver file — the opposite of matching by extension regardless of location."
    },
    "register": "functional",
    "scenarioType": "Code Generation with Claude Code",
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-08-03",
      "reviewed": true
    },
    "id": "D3.3-f6e29013"
  },
  {
    "taskStatement": "D4.1",
    "domain": "D4",
    "scenario": "Two weeks after deployment, reviewers report that Claude's error-handling flags on pull requests are technically correct but useless: a renamed exception variable is flagged with the same \"significant\" label as a removed try/catch block around a database write, so the team has stopped reading the flags in severity order.",
    "question": "What is the most effective way to reduce this noise and restore reviewers' trust in the flagged output?",
    "options": {
      "A": "Instruct the prompt to only flag changes over a minimum line-count threshold, since larger diffs are more likely to contain the changes reviewers actually care about.",
      "B": "Lower the temperature setting used for the review call, since more deterministic output will apply the existing \"significant\" standard more consistently across similar diffs.",
      "D": "Replace \"significant\" with a defined severity rubric (e.g., criteria distinguishing changes that alter failure behavior from cosmetic renames) and require each flag to state which criterion it met.",
      "C": "Add a second review pass that re-ranks the first pass's flags by severity, so reviewers see the reordered list instead of the original flat one."
    },
    "correct": "D",
    "explanations": {
      "A": "Line count does not track behavioral significance - a one-line removed try/catch is exactly the high-severity case being missed, while a large cosmetic diff would still get flagged under this rule.",
      "B": "Determinism only makes the same undefined guess more repeatable across runs; it does not supply the missing criteria needed to distinguish cosmetic renames from behavior-altering changes.",
      "D": "Correct. \"Significant\" is undefined, so the model is guessing at a boundary between cosmetic and behavior-changing edits; replacing it with explicit criteria tied to failure behavior gives the model a real boundary to apply and lets reviewers see which criterion justified each flag.",
      "C": "Reordering flags produced by a pass that never had a severity definition just relabels the same undifferentiated judgments; it does not fix the root cause of the model guessing at what \"significant\" means."
    },
    "register": "functional",
    "scenarioType": "Claude Code for Continuous Integration",
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-08-03",
      "reviewed": true
    },
    "id": "D4.1-0309001d"
  },
  {
    "taskStatement": "D3.5",
    "domain": "D3",
    "scenario": "Two weeks of production data show your review prompt correctly flags SQL injection risks in the automated PR feedback, but roughly a third of PRs also get flagged for trivial style preferences—variable naming, import ordering—that the team never asked the pipeline to surface. The team wants those style false positives gone without touching the security detection that's already working correctly.",
    "question": "Before making any further changes to the review prompt, what is the most effective refinement approach?",
    "options": {
      "C": "Run the existing prompt five times per PR and average the flags across runs, on the assumption that variation across runs will cancel out the style false positives.",
      "A": "Rewrite the review prompt from scratch in one pass, folding in every suspected fix for style flagging and security wording at once, then measure the aggregate false-positive rate on the next batch of live PRs.",
      "D": "Ask Claude to self-evaluate which of its own flags were false positives, then strip out any instruction category it identifies as unreliable.",
      "B": "Narrow the style-flagging instruction alone, then re-run the prompt against a fixed set of past PRs to confirm the style false-positive rate drops while the security flags remain intact before changing anything else."
    },
    "correct": "B",
    "explanations": {
      "C": "Averaging across repeated runs of an unchanged prompt does not address the root cause, which is that the instruction itself is too broad; it only adds inference cost without narrowing what gets flagged.",
      "A": "Bundling multiple changes into one rewrite means that if the false-positive rate shifts, there is no way to attribute the effect to a specific instruction change, and a regression in security detection could be masked by an improvement in style flagging.",
      "D": "LLM self-assessment of its own past outputs is unreliable for the same reason confidence self-scoring is - it substitutes probabilistic self-judgment for measurement against known outcomes.",
      "B": "Correct. Iterative refinement means isolating one change - here, the style-flagging instruction - and measuring its effect against a fixed test set before layering on the next change, so each step's impact is verifiable and regressions in the working security detection are caught immediately."
    },
    "register": "named",
    "scenarioType": "Claude Code for Continuous Integration",
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-08-03",
      "reviewed": true
    },
    "id": "D3.5-ddb09ce5"
  },
  {
    "taskStatement": "D3.4",
    "domain": "D3",
    "scenario": "This particular pull request in the pipeline bumps a test timeout value in a CI config file from 30 seconds to 90 seconds, citing one named flaky test as the reason; the change touches that single file and there is no alternative implementation under consideration.",
    "question": "Before the agent modifies the file, which approach should it take to decide how to proceed?",
    "options": {
      "B": "Have the agent first request a risk classifier to categorize the change before deciding whether an exploratory pass or a direct edit is warranted, deferring the choice to that classifier's output.",
      "C": "Have the agent proceed directly to editing the value, since the task names one file, one value, and one clear rationale, leaving no competing implementation paths for an exploratory pass to weigh.",
      "D": "Have the agent proceed straight to editing the value and applying the change, then explain its reasoning afterward in a PR comment so reviewers can check the choice retroactively rather than beforehand.",
      "A": "Route the agent into an exploratory planning pass that maps out several possible timeout values and configuration locations, since any CI file change is inherently risky and merits upfront investigation."
    },
    "correct": "C",
    "explanations": {
      "B": "Introduces an extra classification step before a decision that the task description already resolves - the scope and rationale given leave nothing for a risk classifier to determine.",
      "C": "Correct. An exploration-first mode is warranted when there are multiple valid approaches or unclear scope to weigh; here the file, the value, and the rationale are all already fixed, so there is nothing left to explore and direct execution is the appropriate, proportionate choice.",
      "D": "Skips the actual decision by making the edit first and rationalizing afterward; explaining a choice after the fact does not substitute for deciding, before editing, whether exploration was needed at all.",
      "A": "Treats every CI-adjacent change as equally deserving of upfront investigation regardless of whether alternatives actually exist, which turns a single-path, well-specified edit into unneeded overhead."
    },
    "register": "functional",
    "scenarioType": "Claude Code for Continuous Integration",
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-08-03",
      "reviewed": true
    },
    "id": "D3.4-cc0a4a36"
  },
  {
    "taskStatement": "D4.2",
    "domain": "D4",
    "scenario": "Two weeks of production data on this automated code review step show a 30% false-positive rate isolated to pull requests that only rename variables or reformat whitespace, with the model repeatedly flagging these cosmetic diffs as logic changes worth review.",
    "question": "Which change would most effectively reduce this specific false-positive pattern while preserving genuine bug detection on other pull requests?",
    "options": {
      "D": "Add a system prompt instruction stating that purely cosmetic changes such as variable renames or reformatting should never be flagged as logic issues, leaving the rest of the prompt unchanged.",
      "C": "Add few-shot examples pairing cosmetic-only diffs, such as renames and reformatting, with a no-issue verdict, alongside logic-changing diffs paired with a substantive flag, so the boundary is demonstrated directly.",
      "B": "Lower the model's temperature setting to 0, since deterministic sampling is commonly assumed to fix inconsistent classification of a diff as cosmetic versus substantive across repeated runs.",
      "A": "Add a diff-size threshold so pull requests below a set number of changed lines skip automated review entirely, on the assumption that small diffs are the ones most often misclassified as bugs."
    },
    "correct": "C",
    "explanations": {
      "D": "Relies on probabilistic compliance with a general instruction rather than demonstrating the boundary with concrete cases, so it is less reliable at correcting a specific, already-observed misclassification pattern.",
      "C": "Correct. Concrete few-shot examples that demonstrate the exact boundary the model is missing - showing cosmetic-only diffs paired with a no-issue verdict alongside logic-changing diffs paired with a flag - calibrate the distinction directly, which is more reliable than an abstract instruction.",
      "B": "Temperature affects sampling variance, not the model's underlying classification boundary between cosmetic and substantive changes; it would not resolve a systematic misclassification pattern.",
      "A": "Bypasses review for an entire class of diffs by size rather than by content, which would also skip genuine small bugs and does not address why the model misclassifies cosmetic changes when it does review them."
    },
    "register": "named",
    "scenarioType": "Claude Code for Continuous Integration",
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-08-03",
      "reviewed": true
    },
    "id": "D4.2-53fe438c"
  },
  {
    "taskStatement": "D1.2",
    "domain": "D1",
    "scenario": "Production data shows that in 12% of cases, your agent skips get_customer entirely and calls lookup_order using only the customer's stated name.",
    "question": "Given these constraints, what is the most appropriate architectural decision?",
    "options": {
      "C": "Keep the single-agent design: get_customer, lookup_order, and the refund decision all depend on the same customer and order state within one continuous turn, so splitting into subagents would only fragment that shared context and add coordination overhead with no resolution benefit.",
      "D": "Split into a billing subagent, a returns subagent, and an escalation subagent so each can carry a specialized system prompt tuned to its case type, since specialized prompts reliably raise first-contact resolution regardless of whether the subtasks share underlying context.",
      "B": "Split into subagents but have the coordinator forward the full conversation transcript to each one on every turn, which preserves the shared customer and order context that the subagents would otherwise lose once they are separated out.",
      "A": "Split into subagents and let each one independently call get_customer and lookup_order rather than sharing a single fetch, since duplicating these tool calls per subagent is preferable to routing shared context through a coordinator."
    },
    "correct": "C",
    "explanations": {
      "C": "Correct. The coordinator-subagent pattern pays off when subtasks are separable and benefit from isolated context; here the subtasks are tightly coupled, sequential, and share one customer/order state within a single turn, so splitting them only adds coordination overhead without isolating anything useful.",
      "D": "Assumes specialization always helps, but the benefit of separate subagents comes from isolating independent work, not from prompt specialization alone — and it ignores that these subtasks aren't actually independent.",
      "B": "Forwarding the full transcript to every subagent defeats the main reason to isolate subagents in the first place and adds the overhead of multiple agents without any of the context-isolation benefit.",
      "A": "Duplicating get_customer and lookup_order calls across subagents multiplies tool calls and risks the same customer resolving to inconsistent state across subagents, which is worse than the coordination overhead it claims to avoid."
    },
    "register": "named",
    "scenarioType": "Customer Support Resolution Agent",
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-08-03",
      "reviewed": true
    },
    "id": "D1.2-9225ae75"
  }
];
