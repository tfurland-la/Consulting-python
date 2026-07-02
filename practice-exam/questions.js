// CCA-F practice exam question bank - machine-written by exam_lib.render_bank().
// Do not hand-edit; add or change questions via generate_bank.py.
window.CCAF_BANK = [
  {
    "taskStatement": "D1.4",
    "domain": "D1",
    "scenario": "A customer support agent built on the Claude Agent SDK has MCP tools get_customer, lookup_order, process_refund, and escalate_to_human. Production data shows that in 12% of cases the agent skips get_customer and calls lookup_order using only the customer's stated name, sometimes causing misidentified accounts and incorrect refunds.",
    "question": "What change would most effectively address this reliability issue?",
    "options": {
      "A": "Add a programmatic prerequisite that blocks lookup_order and process_refund until get_customer has returned a verified customer ID.",
      "B": "Enhance the system prompt to state that customer verification via get_customer is mandatory before any order operations.",
      "C": "Add few-shot examples showing the agent always calling get_customer first.",
      "D": "Implement a routing classifier that enables only the subset of tools appropriate for each request type."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. When a specific tool sequence is required for critical business logic, programmatic enforcement gives deterministic guarantees that prompt-based approaches cannot.",
      "B": "Relies on probabilistic LLM compliance, which is insufficient when errors have financial consequences.",
      "C": "Few-shot examples also rely on probabilistic compliance - they raise the odds of the right sequence but cannot guarantee it when refunds are at stake.",
      "D": "Addresses tool availability, not tool ordering, which is the actual problem."
    },
    "provenance": {
      "source": "official-sample",
      "model": null,
      "generatedAt": null,
      "reviewed": true
    },
    "id": "D1.4-f3508828"
  },
  {
    "taskStatement": "D2.1",
    "domain": "D2",
    "scenario": "Production logs show the agent frequently calls get_customer when users ask about orders (e.g., \"check my order #12345\") instead of lookup_order. Both tools have minimal descriptions (\"Retrieves customer information\" / \"Retrieves order details\") and accept similar identifier formats.",
    "question": "What is the most effective first step to improve tool selection reliability?",
    "options": {
      "A": "Add 5-8 few-shot examples to the system prompt showing order queries routing to lookup_order.",
      "B": "Expand each tool's description to include input formats, example queries, edge cases, and boundaries explaining when to use it versus similar tools.",
      "C": "Implement a routing layer that parses input and pre-selects the tool.",
      "D": "Consolidate both tools into a single lookup_entity tool."
    },
    "correct": "B",
    "explanations": {
      "A": "Adds token overhead without fixing the root cause - the tool descriptions remain ambiguous.",
      "B": "Correct. Tool descriptions are the primary mechanism for tool selection; minimal descriptions are the root cause, and this is the low-effort, high-leverage fix.",
      "C": "Over-engineered and bypasses the model's language understanding.",
      "D": "A valid architecture but heavier than a \"first step\" warrants."
    },
    "provenance": {
      "source": "official-sample",
      "model": null,
      "generatedAt": null,
      "reviewed": true
    },
    "id": "D2.1-3346db93"
  },
  {
    "taskStatement": "D5.2",
    "domain": "D5",
    "scenario": "An agent achieves 55% first-contact resolution against an 80% target. Logs show it escalates straightforward cases (standard damage replacements with photo evidence) while attempting to autonomously handle complex situations requiring policy exceptions.",
    "question": "What is the most effective way to improve escalation calibration?",
    "options": {
      "A": "Add explicit escalation criteria to the system prompt with few-shot examples demonstrating when to escalate versus resolve.",
      "B": "Have the agent self-report a 1-10 confidence score and route to humans below a threshold.",
      "C": "Deploy a separate classifier trained on historical tickets.",
      "D": "Add sentiment analysis and escalate on negative sentiment."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. This addresses the root cause - unclear decision boundaries - and is the proportionate first step.",
      "B": "LLM self-reported confidence is poorly calibrated; the agent is already confidently wrong on hard cases.",
      "C": "Over-engineered before prompt optimization has been tried.",
      "D": "Solves a different problem; sentiment does not correlate with case complexity."
    },
    "provenance": {
      "source": "official-sample",
      "model": null,
      "generatedAt": null,
      "reviewed": true
    },
    "id": "D5.2-fd32f26f"
  },
  {
    "taskStatement": "D2.1",
    "domain": "D2",
    "scenario": "A multi-agent research system misroutes 45% of requests to the web-search agent's analyze_content tool instead of the document analysis agent's analyze_document tool. Both tools have nearly identical descriptions.",
    "question": "What is the most effective fix?",
    "options": {
      "A": "Add a pre-routing classifier before the coordinator decides on delegation.",
      "B": "Rename the web-search tool to extract_web_results and update its description to reference web search and URLs specifically.",
      "C": "Add few-shot examples to the coordinator prompt showing correct routing.",
      "D": "Expand the document analysis tool description while leaving the web-search tool unchanged."
    },
    "correct": "B",
    "explanations": {
      "A": "Over-engineered for what is fundamentally a description problem.",
      "B": "Correct. Renaming removes the semantic overlap at its source.",
      "C": "Adds overhead without fixing the root cause.",
      "D": "Fixes only half the problem - the web-search tool's description stays ambiguous."
    },
    "provenance": {
      "source": "official-sample",
      "model": null,
      "generatedAt": null,
      "reviewed": true
    },
    "id": "D2.1-6abca49a"
  },
  {
    "taskStatement": "D4.6",
    "domain": "D4",
    "scenario": "A pull request touches 14 files. A single-pass review produces inconsistent depth, missed bugs, and contradictory feedback on identical patterns in different files.",
    "question": "How should you restructure the review?",
    "options": {
      "A": "Run three independent full-PR passes and flag issues appearing in at least two runs.",
      "B": "Split into per-file passes for local issues plus a separate integration pass for cross-file data flows.",
      "C": "Require developers to split large PRs into smaller submissions.",
      "D": "Switch to a larger model with a bigger context window."
    },
    "correct": "B",
    "explanations": {
      "A": "Suppresses real bugs by requiring consensus across passes.",
      "B": "Correct. Per-file passes fix attention dilution; the integration pass catches cross-file concerns.",
      "C": "Shifts the burden to developers without improving the review system.",
      "D": "Misunderstands the problem - the issue is attention dilution, not context capacity."
    },
    "provenance": {
      "source": "official-sample",
      "model": null,
      "generatedAt": null,
      "reviewed": true
    },
    "id": "D4.6-43e15088"
  },
  {
    "taskStatement": "D3.4",
    "domain": "D3",
    "scenario": "A team is restructuring a monolithic application into microservices, involving changes across dozens of files and decisions about service boundaries and module dependencies.",
    "question": "Which approach should you take?",
    "options": {
      "A": "Enter plan mode to explore the codebase and design before making changes.",
      "B": "Start with direct execution and let implementation reveal service boundaries.",
      "C": "Use direct execution with upfront instructions detailing each service.",
      "D": "Begin in direct execution and switch to plan mode only if unexpected complexity emerges."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Plan mode is designed for architectural decisions, large-scale changes, and situations with multiple valid approaches.",
      "B": "Risks costly rework once service boundaries emerge mid-implementation.",
      "C": "Assumes you already know the structure without exploring it.",
      "D": "Ignores that the complexity is already stated in the requirements."
    },
    "provenance": {
      "source": "official-sample",
      "model": null,
      "generatedAt": null,
      "reviewed": true
    },
    "id": "D3.4-6452f902"
  },
  {
    "taskStatement": "D3.3",
    "domain": "D3",
    "scenario": "A codebase has distinct coding conventions for React components, API handlers, and database models. Test files are spread throughout the codebase alongside the code they test (e.g., Button.test.tsx next to Button.tsx). The team wants all test files to follow the same conventions regardless of directory location.",
    "question": "What is the most maintainable way to ensure Claude automatically applies the correct conventions when generating code?",
    "options": {
      "A": "Create rule files in .claude/rules/ with YAML frontmatter specifying glob patterns to conditionally apply conventions based on file paths.",
      "B": "Consolidate all conventions in the root CLAUDE.md file under headers for each area, relying on Claude to infer which section applies.",
      "C": "Create skills in .claude/skills/ for each code type that include the relevant conventions in their SKILL.md files.",
      "D": "Place a separate CLAUDE.md file in each subdirectory containing that area's specific conventions."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. .claude/rules/ with glob patterns (e.g., **/*.test.tsx) applies conventions based on file paths regardless of directory location - essential for test files spread throughout the codebase.",
      "B": "Relies on inference rather than explicit matching, making it unreliable.",
      "C": "Requires manual invocation or Claude choosing to load the skill, which contradicts the need for deterministic automatic application.",
      "D": "Cannot handle files spread across many directories since CLAUDE.md files are directory-bound."
    },
    "provenance": {
      "source": "official-sample",
      "model": null,
      "generatedAt": null,
      "reviewed": true
    },
    "id": "D3.3-afbc171c"
  },
  {
    "taskStatement": "D1.2",
    "domain": "D1",
    "scenario": "A multi-agent research system runs on the topic \"impact of AI on creative industries.\" Each subagent completes successfully: the web search agent finds articles, the document analysis agent summarizes papers, and the synthesis agent produces coherent output. However, the final report covers only visual arts - music, writing, and film are missing entirely. The coordinator's logs show it decomposed the topic into three subtasks: \"AI in digital art creation,\" \"AI in graphic design,\" and \"AI in photography.\"",
    "question": "What is the most likely root cause?",
    "options": {
      "A": "The synthesis agent lacks instructions for identifying coverage gaps in the findings it receives from other agents.",
      "B": "The coordinator agent's task decomposition is too narrow, resulting in subagent assignments that don't cover all relevant domains of the topic.",
      "C": "The web search agent's queries are not comprehensive enough and need to be expanded to cover more creative industry sectors.",
      "D": "The document analysis agent is filtering out sources related to non-visual creative industries due to overly restrictive relevance criteria."
    },
    "correct": "B",
    "explanations": {
      "A": "Incorrectly blames a downstream agent; the synthesis agent worked correctly within the scope it was given.",
      "B": "Correct. The coordinator's logs reveal the root cause directly - it decomposed \"creative industries\" into only visual arts subtasks, omitting music, writing, and film. The subagents executed their assigned tasks correctly.",
      "C": "The web search agent only searched within the subtasks it was assigned; broader queries were never requested of it.",
      "D": "There is no evidence of filtering - the missing sectors were never assigned to any agent in the first place."
    },
    "provenance": {
      "source": "official-sample",
      "model": null,
      "generatedAt": null,
      "reviewed": true
    },
    "id": "D1.2-df48ecd0"
  },
  {
    "taskStatement": "D2.3",
    "domain": "D2",
    "scenario": "During testing, a synthesis agent frequently needs to verify specific claims while combining findings. When verification is needed, the synthesis agent returns control to the coordinator, which invokes the web search agent, then re-invokes synthesis with results. This adds 2-3 round trips per task and increases latency by 40%. Evaluation shows 85% of verifications are simple fact-checks (dates, names, statistics) while 15% require deeper investigation.",
    "question": "What is the most effective approach to reduce overhead while maintaining system reliability?",
    "options": {
      "A": "Give the synthesis agent a scoped verify_fact tool for simple lookups, while complex verifications continue delegating to the web search agent through the coordinator.",
      "B": "Have the synthesis agent accumulate all verification needs and return them as a batch to the coordinator at the end of its pass, which then sends them all to the web search agent at once.",
      "C": "Give the synthesis agent access to all web search tools so it can handle any verification need directly without round-trips through the coordinator.",
      "D": "Have the web search agent proactively cache extra context around each source during initial research, anticipating what the synthesis agent might need to verify."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Applies the principle of least privilege - the synthesis agent gets only what it needs for the 85% common case while preserving the existing coordination pattern for complex cases.",
      "B": "Creates blocking dependencies since synthesis steps may depend on earlier verified facts.",
      "C": "Over-provisions the synthesis agent, violating separation of concerns.",
      "D": "Relies on speculative caching that cannot reliably predict what will need verification."
    },
    "provenance": {
      "source": "official-sample",
      "model": null,
      "generatedAt": null,
      "reviewed": true
    },
    "id": "D2.3-dfdcd017"
  },
  {
    "taskStatement": "D4.5",
    "domain": "D4",
    "scenario": "A team wants to reduce API costs for automated analysis. Two workflows currently use real-time Claude calls: (1) a blocking pre-merge check that must complete before developers can merge, and (2) a technical debt report generated overnight for review the next morning. The manager proposes switching both to the Message Batches API for its 50% cost savings.",
    "question": "How should you evaluate this proposal?",
    "options": {
      "A": "Use batch processing for the technical debt reports only; keep real-time calls for pre-merge checks.",
      "B": "Switch both workflows to batch processing with status polling to check for completion.",
      "C": "Keep real-time calls for both workflows to avoid batch result ordering issues.",
      "D": "Switch both to batch processing with a timeout fallback to real-time if batches take too long."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. The Message Batches API offers 50% cost savings but has processing times up to 24 hours with no guaranteed latency SLA - unsuitable for blocking pre-merge checks, ideal for overnight reports.",
      "B": "\"Often faster\" completion is not acceptable for blocking workflows.",
      "C": "Reflects a misconception - batch results can be correlated using custom_id fields, so ordering is not a real problem.",
      "D": "Adds unnecessary complexity when the simpler solution is matching each API to its appropriate use case."
    },
    "provenance": {
      "source": "official-sample",
      "model": null,
      "generatedAt": null,
      "reviewed": true
    },
    "id": "D4.5-a3122d57"
  },
  {
    "taskStatement": "D1.1",
    "domain": "D1",
    "scenario": "A team builds an autonomous CI/CD agent using Claude Code to fix failing unit tests on pull requests. The agent runs an agentic loop: read the test failure output, edit the relevant source file, re-run the test suite via Bash, and repeat until the tests pass, at which point it commits the fix and reports success. After deployment, engineers notice that roughly 1 in 5 \\\"fixed\\\" pull requests still have failing tests in the actual CI run, even though the agent reported the task as complete and exited its loop.\\n\\nInvestigation of the agent's transcripts shows that in the failure cases, the agent's final loop iteration edited the code, then reasoned in natural language that \\\"this change should resolve the test failure\\\" and reported success without re-invoking the Bash tool to re-run the test suite and inspect the actual output.",
    "question": "What is the most effective change to the agentic loop's design to prevent this failure mode?",
    "options": {
      "A": "Require the loop to terminate only after a Bash call re-runs the test suite and the loop code programmatically checks the exit code/output for a pass before allowing a success report.",
      "B": "Add an instruction to the system prompt stating that the agent must always re-run tests before declaring success.",
      "C": "Have the agent self-report a confidence score after each edit and only exit the loop once its stated confidence exceeds a fixed threshold.",
      "D": "Increase the maximum number of loop iterations so the agent has more chances to converge on a passing state."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. The loop's termination condition should be a programmatic, ground-truth check (actual test suite output) rather than the model's own judgment, giving a deterministic guarantee that success is only reported when tests genuinely pass.",
      "B": "Relies on probabilistic LLM compliance with a prompt instruction; the model can still skip the verification step under the same reasoning pattern that caused the original failures.",
      "C": "LLM self-reported confidence is poorly calibrated - the agent was already confidently wrong when it judged its own fix would work without evidence.",
      "D": "Addresses how many attempts the agent gets, not the root cause: the loop is exiting on unverified self-assessment rather than a checked outcome."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.1-d8f79384"
  },
  {
    "taskStatement": "D1.1",
    "domain": "D1",
    "scenario": "A developer productivity team built an autonomous \"fix failing tests\" agent using Claude Code in CI. The agentic loop repeatedly runs the test suite via Bash, reads the failure output, edits the relevant file with Edit, and reruns the tests - continuing until the suite passes or a fixed cap of 50 iterations is reached. Reviewing a week of CI runs, the team finds several runs hit the full 50-iteration cap on the same failing test: from iteration 10 onward, the agent repeatedly applies a fix, reverts it when a different assertion breaks, then reapplies the original fix, cycling between the same two states for 40 more iterations before the run is terminated by the cap, consuming significant API spend with zero progress after iteration 10.",
    "question": "What is the most effective change to the design of this agentic loop?",
    "options": {
      "A": "Add a stagnation check that compares the error signature across consecutive iterations and terminates the loop early (e.g., escalating to a human) once the same failure repeats without new progress, rather than relying solely on the fixed iteration cap.",
      "B": "Raise the iteration cap from 50 to 100 so the agent has more attempts to converge on a fix.",
      "C": "Switch the loop to a larger, more capable model so it is more likely to produce a correct fix on each attempt.",
      "D": "Add few-shot examples to the loop's prompt showing successful multi-step test-fix sequences."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. The loop's actual defect is that its only termination condition is a raw iteration count, which cannot detect that the agent is oscillating between the same two states rather than making progress. A progress/stagnation check gives the loop a way to recognize and exit a non-productive cycle deterministically, which is the core design responsibility for an autonomous loop meant to run without supervision.",
      "B": "A higher cap does not address the oscillation - the agent would simply cycle between the same two states for longer, wasting more spend before termination.",
      "C": "A stronger model may reduce the odds of the oscillation occurring, but it does not fix the structural problem that the loop has no way to recognize non-progress and stop; the same failure mode remains possible.",
      "D": "Few-shot examples rely on probabilistic compliance and address the quality of individual fix attempts, not the loop's lack of a mechanism to detect that it is stuck and should stop or escalate."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.1-50fbde4d"
  },
  {
    "taskStatement": "D1.1",
    "domain": "D1",
    "scenario": "A team is building an autonomous data-pipeline monitoring agent using the Claude Agent SDK. Each night, the agent must investigate failed ETL jobs by reading logs, querying a metadata database via MCP tools, identifying root causes, and applying safe remediations (e.g., restarting a job, re-triggering an upstream dependency). The team implements this as a single Claude call per failed job: one large prompt containing all failure context, followed by one tool call selection, with no mechanism for the agent to observe the tool's result before producing its final answer.\n\nIn testing, the agent frequently misdiagnoses issues because it \"commits\" to a remediation before it can see whether an earlier diagnostic tool call actually returned useful data. For example, it calls query_job_metadata, but its final answer is generated without incorporating that tool's actual output, since the loop terminates after a single model turn regardless of tool results.",
    "question": "What is the most important structural change needed to make this agent capable of reliable autonomous task execution?",
    "options": {
      "A": "Implement an actual agentic loop: after each tool call, feed the tool result back to the model and let it continue reasoning and calling tools across multiple turns until the task is complete, rather than stopping after one turn.",
      "B": "Increase the context window so the entire failure history and all possible remediation options can be included in the single prompt.",
      "C": "Add more detailed few-shot examples to the prompt showing correct diagnosis-then-remediation reasoning chains.",
      "D": "Switch to a larger, more capable model so it can infer the correct remediation from the initial context without needing tool results."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. The defining property of an agentic loop is that tool results are returned to the model and incorporated into subsequent reasoning across multiple turns, continuing until the task is actually complete. Without this feedback loop, the agent cannot ground its final action in real tool output, which is precisely the failure observed.",
      "B": "A bigger context window does not solve the problem: the root cause is that tool results never re-enter the model's reasoning at all, not that there isn't room for more upfront information.",
      "C": "Few-shot examples only shape the model's response pattern within a single turn; they cannot make the model incorporate a tool result that the architecture never feeds back to it.",
      "D": "A larger model still cannot know the actual outcome of a tool call it hasn't seen - this misdiagnoses the issue as a capability problem rather than an architectural one."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.1-19775e80"
  },
  {
    "taskStatement": "D1.2",
    "domain": "D1",
    "scenario": "A coordinator agent orchestrates three subagents in a codebase-modernization pipeline: a code-search subagent (using Grep/Glob to locate all usages of a deprecated API), a refactor subagent (using Read/Edit to rewrite call sites), and a test-runner subagent (using Bash to run the test suite and report results). Each subagent currently returns its complete raw output to the coordinator: the code-search subagent returns the full contents of every matching file, and the test-runner subagent returns the entire raw test log, including all passing test output. After only a few files, the coordinator's context window fills up, it loses track of earlier findings, and it starts producing inconsistent refactor plans.",
    "question": "What is the most effective change to fix this problem?",
    "options": {
      "A": "Have each subagent return a condensed, task-relevant summary of its findings (e.g., file paths and matched line ranges, or a list of failing tests with error messages) rather than its full raw tool output.",
      "B": "Switch the coordinator to a model with a larger context window so it can hold the full raw output from all three subagents.",
      "C": "Remove the coordinator and let the code-search, refactor, and test-runner subagents call each other directly in sequence.",
      "D": "Have the coordinator persist all raw subagent outputs to an external memory store and reload them in full whenever a new decision is needed."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. A core benefit of the coordinator-subagent pattern is that each subagent isolates context-heavy work and returns only the distilled, decision-relevant result to the coordinator. Returning condensed findings instead of raw tool output is what keeps the coordinator's context focused on synthesis and cross-subagent tracking, directly addressing the root cause of the context exhaustion and inconsistent planning.",
      "B": "Treats the symptom, not the cause. Unfiltered raw output from every file and every test run will eventually exhaust any context window as the codebase modernization proceeds - it only delays the failure.",
      "C": "Removes the coordination layer entirely, eliminating the central agent that tracks overall progress and maintains a consistent plan across subagents - this would make inconsistent planning worse, not better.",
      "D": "Persisting and reloading full raw outputs still forces the coordinator to process the same context-heavy data at decision time; an external store doesn't reduce what the coordinator has to reason over."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.2-02e12edf"
  },
  {
    "taskStatement": "D1.2",
    "domain": "D1",
    "scenario": "A coordinator agent orchestrates a legal-document review pipeline with three subagents: a clause-extraction agent, a risk-analysis agent, and a redline-drafting agent. The coordinator delegates each incoming contract to clause-extraction first, then passes its output to risk-analysis, then to redline-drafting, waiting for each subagent to fully complete before invoking the next. Contracts average 40 pages, and each subagent takes 60-90 seconds, so a single contract takes 4-5 minutes end-to-end even though the subagents partly operate on independent sections of the contract (e.g., risk-analysis of standard boilerplate liability clauses doesn't require clause-extraction's output at all, while risk-analysis of custom negotiated terms does depend on it). The team wants to cut latency without changing what each subagent produces.",
    "question": "The team profiles the pipeline and confirms that risk-analysis on standard boilerplate sections does not depend on clause-extraction's output, while risk-analysis on custom negotiated terms does. What is the most effective change to the coordinator's orchestration pattern?",
    "options": {
      "A": "Have the coordinator split the contract by section type, dispatching clause-extraction and boilerplate risk-analysis concurrently at the start, then running negotiated-terms risk-analysis and redline-drafting once their actual input dependencies are satisfied.",
      "B": "Merge all three subagents into a single agent with one combined system prompt covering extraction, risk analysis, and drafting, eliminating coordination overhead entirely.",
      "C": "Keep the strict sequential pipeline but shorten each subagent's system prompt so each step completes faster.",
      "D": "Have the coordinator dispatch all three subagents concurrently at the start of every contract, since running subagents in parallel always reduces end-to-end latency regardless of data dependencies."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. This restructures the orchestration around the true data dependencies: work that doesn't depend on another subagent's output runs concurrently, while work that genuinely depends on prior output still waits for it. This cuts latency without changing what any subagent produces.",
      "B": "Collapsing distinct responsibilities into one agent trades a latency problem for a separation-of-concerns problem, and does not address the actual bottleneck (unnecessary sequential waiting), since a single agent would still have to perform the steps that depend on each other.",
      "C": "Treats the symptom (slow steps) rather than the cause (unnecessary sequencing of independent work), and risks degrading each subagent's output quality by trimming its instructions.",
      "D": "Ignores the confirmed dependency: negotiated-terms risk-analysis and redline-drafting need clause-extraction's output, so running everything concurrently would use stale or missing input and produce incorrect results."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.2-957ccfd4"
  },
  {
    "taskStatement": "D1.2",
    "domain": "D1",
    "scenario": "A multi-agent customer support system uses a coordinator agent that receives incoming tickets and delegates to three subagents: a billing agent, a technical-troubleshooting agent, and a shipping agent. Each subagent has its own scoped toolset and returns a structured result to the coordinator, which then composes the final customer reply. During a product launch, ticket volume triples, and engineers notice the coordinator invokes the billing agent and technical agent sequentially even for tickets that clearly require both (e.g., \"I was charged twice and the app still won't sync after my refund\"), roughly doubling response latency for these mixed tickets compared to single-topic tickets.",
    "question": "What is the most effective change to reduce latency for tickets that require multiple independent subagents, without compromising reliability?",
    "options": {
      "A": "Modify the coordinator to detect when a ticket requires multiple independent subagents and invoke those subagents concurrently, then synthesize their results once all have returned.",
      "B": "Merge the billing and technical-troubleshooting agents into a single subagent with a combined toolset so one invocation can handle mixed tickets.",
      "C": "Add few-shot examples to the coordinator's prompt showing it responding faster on mixed-topic tickets.",
      "D": "Give the billing agent direct access to the technical-troubleshooting agent's tools so it can resolve mixed tickets without involving the coordinator."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. When the required subtasks are independent of each other, the coordinator can dispatch them in parallel instead of sequentially, cutting latency while preserving each subagent's scoped tools and the coordinator's role of synthesizing the final response.",
      "B": "Merging agents collapses the scoped-tool separation that keeps each subagent's responsibilities and permissions narrow, trading a sequencing problem for a broader-permission, harder-to-maintain agent.",
      "C": "Few-shot examples only influence the model's probabilistic behavior around phrasing and reasoning; they cannot make sequential tool invocations execute faster or concurrently.",
      "D": "Bypassing the coordinator by granting cross-agent tool access breaks separation of concerns and removes the coordinator's ability to reliably synthesize and reconcile results from multiple domains."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.2-2ef3fb45"
  },
  {
    "taskStatement": "D1.2",
    "domain": "D1",
    "scenario": "A coordinator agent orchestrates a codebase migration assessment by dispatching four subagents in parallel: one to inventory frontend components, one to map backend API routes, one to document the database schema, and one to review infrastructure configs. Each subagent is instructed to \"report everything you find,\" so each returns its full raw output directly into the coordinator's context - complete file contents, unfiltered grep results, and verbose logs. By the time all four subagents finish, the coordinator's context is nearly exhausted, and the final migration plan it produces is noticeably shallow, omitting details that were clearly present in the subagents' raw output.",
    "question": "What change to the coordinator-subagent pattern would most effectively fix this problem?",
    "options": {
      "A": "Instruct each subagent to return a concise, structured summary of its key findings rather than raw output, so the coordinator's context is used for synthesis rather than storing unprocessed data.",
      "B": "Switch from parallel to sequential subagent execution so the coordinator only holds one subagent's output in context at a time.",
      "C": "Have each subagent write its raw output to a shared file and have the coordinator read all four files before synthesizing the plan.",
      "D": "Remove the subagents and have the coordinator perform the frontend, backend, database, and infrastructure exploration itself."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. The root cause is that subagents are dumping unprocessed data into the coordinator's context. Having each subagent condense its findings into a structured summary before returning preserves the coordinator's limited context for the synthesis work it actually needs to do, which is the core value of the coordinator-subagent pattern.",
      "B": "Sequential execution reduces how many subagents run at once but does not reduce the total volume of raw data eventually loaded into the coordinator's context - the same unfiltered output still accumulates by the end.",
      "C": "Moving the raw data to files and having the coordinator read all of them back still floods the coordinator's context with unprocessed data; it just delays when the bloat occurs rather than fixing it.",
      "D": "Eliminates the context problem by eliminating the coordinator-subagent pattern entirely, discarding the parallelization and separation-of-concerns benefits subagents provide instead of fixing how they report back."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.2-1f190c52"
  },
  {
    "taskStatement": "D1.3",
    "domain": "D1",
    "scenario": "A multi-agent research pipeline uses a coordinator agent that spawns a separate subagent for each subtopic in a report (e.g., \\\"market sizing,\\\" \\\"competitive landscape,\\\" \\\"regulatory risk\\\"). The engineering team configures every subagent invocation to receive the coordinator's entire conversation history up to that point, including all prior tool calls and the outputs of subagents spawned earlier for unrelated subtopics. As the pipeline scales to reports with 8-10 subtopics, later subagents run noticeably slower and more expensively, and their outputs occasionally drift off-topic, echoing details from earlier, unrelated subtopics.",
    "question": "What change to subagent invocation would most directly fix this problem?",
    "options": {
      "A": "Pass each subagent only the specific task description and inputs it needs for its own subtopic, rather than the coordinator's full conversation history.",
      "B": "Keep passing the full conversation history, but instruct each subagent's system prompt to ignore content unrelated to its assigned subtopic.",
      "C": "Have all subagents share one persistent session so state accumulates once instead of being recomputed per spawn.",
      "D": "Keep the full history but raise each subagent's max output tokens so it has more room to produce a focused answer."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Subagents should be spawned with context scoped to their own task. Passing only the relevant task description and inputs keeps each invocation fast, cheap, and focused, and prevents unrelated prior findings from bleeding into its output.",
      "B": "Relies on probabilistic instruction-following to filter irrelevant context rather than removing it at the source, so drift and cost overhead both persist.",
      "C": "A shared persistent session across subagents defeats the purpose of isolated, parallel spawning and would compound the same context-bloat and cross-contamination problem rather than fixing it.",
      "D": "Increasing output tokens addresses response length, not the root cause, which is an oversized and irrelevant input context being passed at spawn time."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.3-6d6d521c"
  },
  {
    "taskStatement": "D1.3",
    "domain": "D1",
    "scenario": "A developer productivity platform uses a lead Claude agent to triage incoming bug reports. For each report, the lead agent spawns a fresh subagent to reproduce the bug: the subagent receives only the bug report text plus a scoped Bash/Read/Grep toolset, with no memory of other bug reports or prior conversation turns. The team wants the reproduction subagent's findings to feed into a second \"fix-writing\" subagent, but currently the lead agent copies the first subagent's entire raw transcript into the second subagent's prompt. This inflates token usage and occasionally passes along irrelevant exploratory dead-ends, such as files opened and discarded during the search.\n\nEngineering wants every subagent invocation to start with a clean, isolated context, while still carrying forward only the essential findings between the reproduction subagent and the fix-writing subagent.",
    "question": "What is the most effective way to pass context from the reproduction subagent to the fix-writing subagent?",
    "options": {
      "A": "Have the lead agent instruct the reproduction subagent to return a concise, structured summary (root cause, affected files, repro steps) as its final output, and pass only that summary into the fix-writing subagent's prompt.",
      "B": "Give both subagents access to the same shared conversation history so the fix-writing subagent can read the reproduction subagent's full transcript directly.",
      "C": "Merge both steps into a single subagent invocation so that no context ever needs to be passed between subagents.",
      "D": "Have the lead agent forward the full raw transcript every time, since subagents need complete history to avoid missing details."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Subagents run in isolated context windows and communicate with the orchestrator only through their final output. Directing the subagent to distill its work into a compact, structured result and forwarding just that summary keeps each invocation's context clean while preserving the essential findings needed downstream.",
      "B": "Subagents are designed to run with isolated context, not shared conversation history; sharing the full transcript reintroduces the token bloat and irrelevant exploratory detail the team is trying to eliminate.",
      "C": "Collapsing the two roles removes the benefit of a fresh, scoped context for each task and doesn't address the underlying question of how to hand off findings between agent invocations; it also loses the isolation and separation of concerns the two-subagent design was providing.",
      "D": "This is the current, problematic approach - it inflates token usage and carries forward irrelevant dead-ends instead of the essential findings, which is exactly the issue engineering wants fixed."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.3-03873dce"
  },
  {
    "taskStatement": "D1.3",
    "domain": "D1",
    "scenario": "A developer productivity team builds a coordinator agent that explores a legacy codebase and spawns a separate subagent for each file to write unit tests. The coordinator's prompt to each subagent is simply \"Write unit tests for this file,\" passing only the file path. Reviewing the outputs, the team finds many subagents generate tests that ignore project-specific conventions discussed earlier in the main session (e.g., the mocking library to use, naming patterns for test files, and a decision to skip integration-style tests), even though the coordinator itself clearly \"knows\" these decisions from earlier in the conversation.",
    "question": "Why are the subagents producing tests that ignore these conventions, and what is the correct fix?",
    "options": {
      "A": "Subagents run in their own isolated context and do not automatically inherit the coordinator's conversation history; the fix is to explicitly include the relevant conventions and decisions in each subagent's invocation prompt.",
      "B": "The subagents' context window is too small to hold the conventions; the fix is to configure a larger context window for each subagent.",
      "C": "There is a shared-memory setting that automatically propagates the full parent conversation to subagents; the fix is to enable it so every subagent sees everything the coordinator has discussed.",
      "D": "The subagents lack a system prompt; the fix is to have the coordinator replay the entire conversation transcript as part of each subagent's prompt to guarantee full alignment."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Subagents are spawned with isolated context and only receive what is explicitly passed to them at invocation. Since the coordinator's per-file prompt never included the conventions, the subagents had no way to know about them; the fix is to pass the specific, relevant context each subagent actually needs.",
      "B": "Misdiagnoses the problem as a capacity limit rather than a context-passing gap - the conventions were never sent to the subagent at all, so window size is irrelevant.",
      "C": "No such automatic full-conversation propagation mechanism exists between coordinator and subagent; context passing must be done explicitly by the coordinator, not assumed to happen implicitly.",
      "D": "Over-provisions each subagent with the entire transcript, adding unnecessary token overhead and irrelevant information when only a few specific conventions actually need to be passed."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.3-58b67f58"
  },
  {
    "taskStatement": "D1.3",
    "domain": "D1",
    "scenario": "A developer is using Claude Code to refactor a legacy billing module. Over several turns in the main conversation, they explore the codebase, identify that InvoiceCalculator.compute() double-applies a discount when a promo code and a loyalty tier overlap, and confirm the fix should live in discount_engine.py. They then spawn a subagent via the Task tool with the prompt: \"Fix the bug we just found and add a regression test.\" The subagent responds by asking which file contains the bug and what the bug actually is, then starts re-exploring the entire repository from scratch, burning several minutes before it can even locate the relevant code.",
    "question": "What is the root cause of the subagent's behavior, and what should the developer do differently?",
    "options": {
      "A": "Subagents start with a fresh, isolated context window and have no access to the parent conversation's history; the invoking prompt must explicitly carry over the necessary context, such as the file path, the specific bug description, and the intended fix location.",
      "B": "The subagent was spawned without the Read and Grep tools enabled, so it had to fall back on asking clarifying questions instead of exploring the codebase directly.",
      "C": "The main conversation's context window was full, causing the earlier exploration turns to be silently dropped before the subagent could inherit them.",
      "D": "The Task tool defaults to routing prompts to a general-purpose subagent type, which lacks the domain knowledge needed to understand references like \"the bug we just found.\""
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Subagent invocation spawns a new, isolated context — it does not automatically inherit the parent conversation's history. Context must be explicitly passed in the invocation prompt (relevant file paths, findings, and the exact task) for the subagent to act without re-deriving what the main thread already knows.",
      "B": "Tool availability isn't the issue here — the subagent successfully used its tools to re-explore the repository; the problem is that it had no starting context telling it where to look or what the bug was.",
      "C": "There is no evidence the parent context window was full, and even if it were, the described symptom (subagent asking for basic clarification) is explained directly by context isolation, not by dropped history.",
      "D": "The subagent's confusion is fully explained by missing context in the prompt; nothing in the scenario indicates a domain-knowledge gap tied to subagent type selection."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.3-7595a276"
  },
  {
    "taskStatement": "D1.4",
    "domain": "D1",
    "scenario": "A CI/CD pipeline uses a \"fix\" agent (built on Claude Code with Read/Write/Bash tools) to patch failing unit tests, then hands off to a separate \"deploy\" agent that pushes the change to staging. The orchestrator decides whether to invoke the deploy agent by parsing the fix agent's final natural-language summary for a phrase like \"all tests pass.\" Post-incident review shows that in 8% of runs the deploy agent was invoked even though the test suite had actually failed with a nonzero exit code - the fix agent had read truncated log output and written a summary claiming success.",
    "question": "What is the most effective way to correct the handoff between the fix agent and the deploy agent?",
    "options": {
      "A": "Have the orchestrator programmatically re-run the test suite and check its exit code or structured test report directly, gating the deploy agent invocation on that result rather than on the fix agent's summary text.",
      "B": "Update the fix agent's system prompt to instruct it to only claim success when it has verified the full test output before summarizing.",
      "C": "Have the deploy agent ask the fix agent a follow-up question to confirm the tests passed before proceeding with deployment.",
      "D": "Add few-shot examples to the fix agent's prompt showing correctly worded pass/fail summaries so its natural-language reporting is more consistent."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. The handoff decision has real consequences (deploying broken code), so it should rely on a programmatic, deterministic check of the actual test result rather than an LLM-generated summary. This is the enforcement pattern: gate the next step on verifiable system state, not on probabilistic natural-language compliance.",
      "B": "Still relies on the fix agent correctly self-reporting in natural language, which is exactly the probabilistic mechanism that already failed - a clearer instruction does not guarantee correct behavior on truncated or ambiguous logs.",
      "C": "Asking the same agent to re-confirm its own claim does not introduce an independent, verifiable check - it just repeats the same probabilistic reporting step that produced the wrong summary.",
      "D": "Few-shot examples may improve the phrasing of summaries on average but cannot guarantee correctness in every case, which is required when an incorrect handoff leads to deploying broken code to staging."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.4-228551df"
  },
  {
    "taskStatement": "D1.4",
    "domain": "D1",
    "scenario": "A multi-agent loan-application pipeline uses an orchestrator to hand off work between three agents: an intake agent that extracts applicant data from submitted documents, a verification agent that checks the applicant against a credit bureau API, and an approval agent that issues the final decision. The intended workflow is strictly sequential: intake produces structured data, verification must confirm the applicant's identity and credit standing, and only then does approval run. The orchestrator's system prompt states this order explicitly and includes examples of correct handoffs.\n\nAn audit of production traces finds that in roughly 8% of applications, the orchestrator hands the approval agent intake data directly, skipping the verification agent entirely, resulting in several loans approved for applicants who were never credit-checked. The orchestrator's logs show no error or exception in these cases - it simply proceeded to approval without invoking verification.",
    "question": "What change would most effectively prevent this failure from recurring?",
    "options": {
      "A": "Add a programmatic gate so the approval agent cannot be invoked unless it receives a verification result object (e.g., a verified credit-check token) produced by the verification agent, with the orchestration layer blocking the handoff if that input is missing.",
      "B": "Strengthen the orchestrator's system prompt with more explicit, emphatic language mandating that verification must always precede approval.",
      "C": "Add additional few-shot examples to the orchestrator's prompt demonstrating the correct intake-verification-approval handoff sequence.",
      "D": "Implement a routing classifier that inspects each incoming application and selects which agent should handle it first."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Because the verification step is a hard compliance requirement, deterministic guarantees are needed. A programmatic gate that requires proof of verification before approval can run enforces the sequence structurally, rather than relying on the orchestrator choosing to comply.",
      "B": "Still relies on probabilistic LLM compliance with prompt instructions - the original prompt already stated the required order explicitly, and that was insufficient to prevent the skip.",
      "C": "Few-shot examples also rely on probabilistic compliance; they raise the likelihood of correct sequencing but cannot guarantee it, which is inadequate when a missed credit check carries financial and compliance risk.",
      "D": "Addresses which agent handles a request, not the enforcement of a required sequence between agents - it does not prevent approval from being reached without verification."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.4-f2348a5e"
  },
  {
    "taskStatement": "D1.4",
    "domain": "D1",
    "scenario": "A loan-processing workflow uses three stages: an intake agent extracts applicant data from submitted documents, an underwriting agent computes a risk score and recommendation, and a disbursement step transfers approved funds. Company policy requires that any loan recommendation above $50,000 be reviewed and explicitly approved by a human loan officer before disbursement proceeds. The underwriting agent's system prompt states: \"If the recommended loan amount exceeds $50,000, pause and wait for human approval before calling the disburse_funds tool.\" Post-launch auditing finds that in 9% of large-loan cases, the agent invoked disburse_funds immediately after generating its recommendation, without any human ever reviewing the case.",
    "question": "What change would most reliably close this gap between policy and actual behavior?",
    "options": {
      "A": "Make disburse_funds programmatically unavailable for loans above $50,000 until a separate, verified human-approval signal has been recorded for that case, so the agent has no code path to invoke it without that handoff.",
      "B": "Rewrite the system prompt instruction in stronger, more explicit language (e.g., \"You must never call disburse_funds above $50,000 without approval - this is a strict requirement\") to increase compliance.",
      "C": "Add several few-shot examples to the prompt showing the agent correctly pausing and requesting human approval on large-loan cases before proceeding.",
      "D": "Have the underwriting agent self-report a confidence score for its recommendation and only pause for human review when confidence falls below a set threshold."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. A mandatory human handoff before a high-stakes, hard-to-reverse action needs to be enforced programmatically - by removing the agent's ability to call disburse_funds until an external, verified approval signal exists for that case - rather than left to the model's judgment. This gives a deterministic guarantee instead of a probabilistic one.",
      "B": "Stronger wording still relies on the model choosing to comply every time; it does not change the fact that the agent retains the technical ability to call disburse_funds without approval, so the same failure mode can recur.",
      "C": "Few-shot examples raise the odds of correct pausing behavior but remain probabilistic compliance - insufficient when an unauthorized large disbursement is the failure mode being prevented.",
      "D": "Misapplies a confidence-based escalation pattern to a problem that isn't about the model's uncertainty - the policy requires human sign-off on ALL large loans regardless of how confident the agent is in its recommendation, so a confidence threshold would still let confidently-wrong or confidently-right large loans bypass required human review."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.4-f237d37a"
  },
  {
    "taskStatement": "D1.4",
    "domain": "D1",
    "scenario": "A document-processing pipeline built on the Claude Agent SDK handles insurance claims: an intake agent extracts claim data, a validation agent checks it against policy rules, and a payout agent issues approvals. The workflow requires validation to complete and return an explicit \"status: approved\" before the payout agent may run. During a review of production traces, engineers find that in a small but nonzero number of runs, the payout agent executed even though the validation agent's output contained \"status: pending_review\" rather than \"status: approved\" — the intake agent had passed the claim forward after a timeout, and the orchestration logic relied solely on the payout agent's system prompt instructions (\"only proceed if the prior agent approved the claim\") to catch this.",
    "question": "What is the most effective change to prevent unapproved claims from reaching the payout agent?",
    "options": {
      "A": "Add a programmatic gate in the orchestration layer that checks the validation agent's status field and blocks invocation of the payout agent unless it equals \"approved\".",
      "B": "Strengthen the payout agent's system prompt with more explicit and emphatic wording about verifying approval status before acting.",
      "C": "Add few-shot examples to the payout agent's prompt demonstrating refusal when the status is \"pending_review\".",
      "D": "Instruct the intake agent's system prompt to never forward a claim unless validation is complete."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. This handoff is a critical business-logic checkpoint with financial consequences. A programmatic check in the orchestration layer that inspects the status field and blocks the handoff unless it is exactly \"approved\" gives a deterministic guarantee, unlike relying on any agent's prompt-based judgment.",
      "B": "Relies on probabilistic LLM compliance - the payout agent already had an instruction to verify status and it still proceeded incorrectly in some runs; stronger wording only raises the odds, it does not eliminate the failure.",
      "C": "Few-shot examples also rely on probabilistic compliance; they can improve the payout agent's behavior on similar inputs but cannot guarantee the handoff is blocked when money is at stake.",
      "D": "Addresses only one failure path (the intake agent forwarding early) and still depends on the intake agent's probabilistic compliance with a prompt instruction; it does not add a deterministic check at the actual handoff point between validation and payout."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.4-9cde48a1"
  },
  {
    "taskStatement": "D1.5",
    "domain": "D1",
    "scenario": "A structured data extraction agent built on the Claude Agent SDK reads scanned vendor invoices and calls a submit_to_accounting tool that pushes extracted fields (vendor name, invoice date, line-item amounts) into a downstream accounting system. The downstream system requires invoice_date in strict ISO 8601 format and rejects any payload where it isn't, but the model extracts dates in whatever format appears on the source document (MM/DD/YYYY, DD-MM-YYYY, \\\"March 3, 2026\\\", etc.), and roughly 20% of submissions fail downstream validation or, worse, silently post an ambiguous date (e.g., 03/04/2026) as the wrong calendar date.\n\nThe team wants a fix that guarantees every payload reaching submit_to_accounting has a correctly normalized, schema-valid invoice_date, without depending on the model reliably following formatting instructions.",
    "question": "What is the most effective way to guarantee this?",
    "options": {
      "A": "Register a PreToolUse hook on submit_to_accounting that parses and normalizes the invoice_date field to ISO 8601 and validates the full payload against a JSON schema, blocking the call if normalization or validation fails.",
      "B": "Update the system prompt with explicit instructions and a worked example showing invoice dates must be converted to ISO 8601 before calling submit_to_accounting.",
      "C": "Add several few-shot examples to the prompt demonstrating correct ISO 8601 conversion from various source date formats.",
      "D": "Register a PostToolUse hook on submit_to_accounting that logs the submitted payload and flags any non-ISO 8601 dates for a human to review afterward."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. A PreToolUse hook intercepts the tool call before it executes, so date normalization and schema validation can be applied deterministically and the call can be blocked outright if the data doesn't conform - a programmatic guarantee rather than reliance on the model's behavior.",
      "B": "Relies on probabilistic LLM compliance with formatting instructions; the same ambiguity in source documents that causes today's 20% failure rate will continue to cause misformatted or misread dates.",
      "C": "Few-shot examples raise the odds of correct formatting but cannot guarantee it, which is insufficient when a wrong calendar date can silently post to accounting.",
      "D": "A PostToolUse hook runs after the tool call has already executed, so the bad payload has already reached the downstream accounting system by the time it's flagged - this catches problems after the fact rather than preventing them."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.5-60bb82c4"
  },
  {
    "taskStatement": "D1.5",
    "domain": "D1",
    "scenario": "A structured-data-extraction agent built on the Claude Agent SDK uses an MCP tool, fetch_vendor_record, to pull invoice records from twelve different vendor procurement systems. Each vendor returns dates and currency values in a different raw format (e.g., \\\"03/14/2026\\\" vs \\\"14-03-2026\\\" vs \\\"2026-03-14\\\"; \\\"$1,204.50\\\" vs \\\"1204.5 USD\\\" vs \\\"USD 1204,50\\\"). The downstream finance system requires every record to be normalized to ISO 8601 dates and integer USD cents before it is written to the final JSON output.\\n\\nThe team's current approach is a system prompt instruction telling the agent to \\\"always normalize dates to ISO 8601 and currency to integer cents before including a field in the output.\\\" Post-deployment validation shows 18% of extracted records still contain malformed dates or currency values, concentrated in ambiguous formats like \\\"03/04/2026\\\" where the agent guesses month-first vs day-first inconsistently.",
    "question": "What is the most effective way to fix the normalization failures?",
    "options": {
      "A": "Implement a PostToolUse hook on fetch_vendor_record that programmatically parses each vendor's known date and currency format and rewrites the tool result into ISO 8601 dates and integer cents before the data ever reaches the agent's context.",
      "B": "Expand the system prompt with detailed few-shot examples covering each vendor's specific date and currency format.",
      "C": "Instruct the agent to validate its own extracted output against the JSON schema after extraction and self-correct any fields that look malformed.",
      "D": "Add a separate normalize_data tool the agent can call on the raw fetch_vendor_record output, and update the system prompt to say this tool must always be invoked before finalizing a record."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Since each vendor's raw format is known in advance, the normalization logic is deterministic and can be enforced programmatically. A PostToolUse hook intercepts the tool call result and rewrites it before the agent ever reasons over it, eliminating the ambiguity the LLM was guessing at (e.g., month-first vs day-first) rather than hoping the model applies the rule correctly every time.",
      "B": "Still relies on probabilistic LLM compliance. More examples may reduce the error rate somewhat but cannot guarantee correct handling of every ambiguous format, especially truly ambiguous cases like \"03/04/2026\" where no amount of prompting resolves the underlying ambiguity without knowing the source vendor.",
      "C": "Self-review is still performed by the same probabilistic model that made the original normalization error, and a malformed date or currency value can easily still look well-formed to the agent, so this does not provide a reliable fix.",
      "D": "This introduces a second point of probabilistic failure: the agent must remember to call the normalization tool and must correctly pass the right raw values to it. Nothing prevents the agent from skipping the call or invoking it on the wrong field, so the 18% error rate is unlikely to be resolved."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.5-a5567809"
  },
  {
    "taskStatement": "D1.5",
    "domain": "D1",
    "scenario": "A Claude Agent SDK pipeline extracts structured data from scanned invoices and calls a submit_invoice_record tool to write each record into a downstream accounts-payable database. The database column for invoice_date requires strict ISO 8601 format (YYYY-MM-DD), but the model sometimes emits dates as \"03/14/2026\", \"March 14, 2026\", or \"14-03-2026\" depending on how the date appeared on the source document. These malformed values pass the model's own reasoning but fail the database's schema constraint, causing roughly 8% of submissions to silently fail and get dropped from the accounts-payable queue.",
    "question": "What is the most effective way to eliminate these downstream failures?",
    "options": {
      "A": "Register a hook that intercepts the submit_invoice_record tool call and deterministically parses/reformats the invoice_date field to ISO 8601 (or blocks the call with a corrective error) before it reaches the database.",
      "B": "Update the system prompt to explicitly instruct the model to always format dates as YYYY-MM-DD before calling submit_invoice_record.",
      "C": "Add several few-shot examples to the prompt showing invoices with varied date formats being correctly converted to YYYY-MM-DD in the tool call.",
      "D": "Lower the model's temperature to make its date formatting more consistent across invoices."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. A tool-call hook intercepts the call before it executes and can programmatically normalize or validate the data, giving a deterministic guarantee that malformed dates never reach the database - something prompt-based instructions cannot guarantee.",
      "B": "Relies on probabilistic LLM compliance. The model isn't reasoning incorrectly about the date's meaning, it's just inconsistent in output formatting, and restating the instruction doesn't eliminate that inconsistency.",
      "C": "Few-shot examples raise the odds of correct formatting but still depend on probabilistic compliance, which is insufficient when malformed data breaks a strict downstream schema constraint.",
      "D": "Temperature affects sampling randomness in general text generation but does not provide a deterministic guarantee on structured field formatting, and does not address the root cause of inconsistent date normalization."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.5-b21d0e8a"
  },
  {
    "taskStatement": "D1.6",
    "domain": "D1",
    "scenario": "A team is building an agentic workflow to process quarterly vendor contract renewals. The single-agent design is given one instruction: \"review the contract packet (terms sheet, redline history, and compliance checklist) and produce a renewal recommendation.\" In testing, the agent produces inconsistent recommendations - sometimes it thoroughly checks compliance but skims the redline history, other times it does the reverse. Output quality varies significantly across runs of the same contract, and the agent occasionally fails to flag known compliance red flags that are clearly present in the checklist.\n\nThe team is deciding how to restructure this into a more reliable workflow before scaling it to hundreds of contracts per quarter.",
    "question": "What is the most effective task decomposition strategy for this workflow?",
    "options": {
      "A": "Decompose the work into discrete subtasks - compliance checklist review, redline history analysis, and terms extraction - each with a clearly scoped objective, then combine their outputs in a final synthesis step that produces the recommendation.",
      "B": "Keep the single-agent design but increase the model's output token budget so it has more room to reason through all three areas thoroughly in one pass.",
      "C": "Run the same single, undecomposed instruction three times in parallel and have a fourth agent pick whichever recommendation looks the most complete.",
      "D": "Rewrite the single instruction into a longer, more detailed prompt that lists all three review areas in one paragraph, without changing the single-pass structure."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Decomposing the broad, multi-concern task into discrete, well-scoped subtasks prevents attention dilution across dissimilar review areas and ensures each area receives focused effort, with a dedicated synthesis step combining results into a coherent recommendation.",
      "B": "A larger token budget does not address the root cause - the task bundles unrelated review concerns into one instruction, causing inconsistent attention across runs regardless of how much output space is available.",
      "C": "Running the identical undecomposed instruction multiple times in parallel does not fix the underlying decomposition problem - each run still suffers from the same attention dilution across compliance, redline, and terms review, so the best of three flawed outputs is still unreliable.",
      "D": "A longer single-pass prompt still asks one agent to juggle three distinct review concerns simultaneously; it does not create the scoped, separable subtasks needed for consistent depth across all three areas."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.6-a9a1a061"
  },
  {
    "taskStatement": "D1.6",
    "domain": "D1",
    "scenario": "A team is building a multi-agent workflow to produce quarterly competitive analysis reports. The coordinator decomposes the task into a fixed pipeline of three sequential subtasks: \"gather competitor pricing data,\" \"gather competitor feature data,\" and \"write the final report.\" In practice, some competitors have just launched new products (requiring a product-launch analysis subtask), others have had recent executive changes (requiring a leadership-analysis subtask), and some have neither. Because the decomposition is fixed regardless of input, the pipeline either wastes time running irrelevant subtasks for simple competitors or omits highly relevant analysis for competitors with major recent news, and the coordinator has no mechanism to adjust the subtask list once a run begins.",
    "question": "What change to the task decomposition strategy would most effectively address this problem?",
    "options": {
      "A": "Have the coordinator first assess each competitor's available signals and dynamically generate the set of subtasks needed for that specific competitor, rather than always running the same fixed three-step pipeline.",
      "B": "Add a fourth fixed subtask, \"check for major recent news,\" to the pipeline so every competitor is evaluated for product launches and leadership changes.",
      "C": "Instruct the report-writing subagent to note in the final report when pricing or feature data seems incomplete, so gaps are flagged to the reader.",
      "D": "Run all possible subtasks - pricing, features, product-launch analysis, and leadership analysis - for every competitor in parallel to guarantee no relevant analysis is ever missed."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. The right decomposition depends on characteristics of each competitor that aren't known in advance, so the coordinator should assess the input and adaptively generate the subtask set per case rather than apply one static plan to every input.",
      "B": "Still a fixed decomposition - it adds one more always-run subtask instead of tailoring the subtask set to what each competitor actually needs, so simple competitors still run unnecessary work and the underlying rigidity remains.",
      "C": "Addresses the symptom (incomplete-looking output) after the fact rather than the root cause, which is that the decomposition never generated the needed subtasks in the first place.",
      "D": "Avoids missing relevant analysis but at the cost of running irrelevant subtasks for every competitor, which is the same waste problem the scenario describes, just applied universally instead of solved."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.6-1afdecfa"
  },
  {
    "taskStatement": "D1.6",
    "domain": "D1",
    "scenario": "A team is using Claude Code to migrate a 300-file codebase from a legacy ORM to a new one. The migration involves a small set of shared base model classes that many files depend on, plus a long tail of independent leaf files (simple data models with no cross-file dependencies). An engineer's first attempt spawned one subagent per file, all running in parallel with a shared prompt describing the migration rules. The result was chaos: subagents working on leaf files imported from base classes mid-migration, producing files that mixed old and new ORM APIs, and several subagents made conflicting edits to the same shared base class file at once.",
    "question": "What task decomposition strategy would best resolve this failure?",
    "options": {
      "A": "Decompose along the codebase's dependency structure: migrate the shared base classes first in a sequential (or single-owner) step, then fan out the independent leaf files to parallel subagents once the base classes are stable.",
      "B": "Keep one subagent per file, but add a shared system prompt instructing subagents to check whether the base classes have already been migrated before editing.",
      "C": "Abandon decomposition entirely and have a single agent process all 300 files sequentially in one long-running session to avoid any cross-file conflicts.",
      "D": "Split the 300 files into 10 equal-sized alphabetical batches of 30 files each, assigning one subagent per batch to run in parallel."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Sound decomposition follows the workflow's actual dependency structure rather than an arbitrary split: components with shared, load-bearing dependencies (the base classes) must be resolved in a controlled sequential or single-owner step before independent work is safely fanned out in parallel. This removes both the race condition on the shared file and the inconsistent partial-migration state in leaf files.",
      "B": "Relies on probabilistic prompt compliance to enforce an ordering constraint across many concurrently running subagents - it does not prevent the race condition on the shared base class file and does not guarantee subagents check at the right moment.",
      "C": "Discards decomposition altogether, sacrificing the parallelism available for the genuinely independent leaf files and making the migration far slower than necessary; the problem was the decomposition strategy, not the presence of parallelism itself.",
      "D": "Batches by an arbitrary criterion (alphabetical order) that ignores the codebase's actual dependency boundaries, so shared base classes can still end up split across batches or edited concurrently by different subagents."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.6-d94300fe"
  },
  {
    "taskStatement": "D1.6",
    "domain": "D1",
    "scenario": "A team uses Claude Code to rename a widely-used function signature across a 200-file legacy codebase. The function is overloaded, and roughly 15% of call sites are ambiguous about which overload applies, requiring a judgment call. To parallelize the work, they split the 200 files into 10 batches of 20 files each based purely on file count, then run one agent per batch concurrently with Read/Grep/Edit access. After merging, review finds that files sharing the identical ambiguous call pattern were resolved differently depending on which batch they landed in - one batch's agent treated the pattern as overload A, while another batch's agent treated the same pattern as overload B - producing inconsistent, incompatible edits that fail the build.",
    "question": "What change to the decomposition strategy would most directly prevent this kind of inconsistency?",
    "options": {
      "A": "Group files by shared dependency/decision context - files containing the same ambiguous call pattern go into the same subtask - so each judgment call is made once, consistently, within a single agent's context, then parallelize across those groups instead of arbitrary file-count batches.",
      "B": "Reduce the number of parallel batches from 10 to 4 so each agent sees more files, lowering the chance of a conflicting decision.",
      "C": "Abandon decomposition entirely and process all 200 files sequentially in a single agent to guarantee global consistency.",
      "D": "Keep the arbitrary file-count batches but add a final consolidation agent that reviews all diffs afterward and reconciles any inconsistent overload resolutions it finds."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Effective decomposition splits work along boundaries where subtasks are genuinely independent. Here, all call sites sharing the same ambiguous pattern form one decision unit - decomposing by raw file count severed that unit across batches, so the same judgment got made twice, differently. Grouping by shared decision context keeps each judgment call inside a single agent's context while still allowing safe parallelism across groups.",
      "B": "Only shrinks the odds of a collision, it does not eliminate the root cause - files with the same ambiguous pattern can still land in different batches, and the fix does not scale as the codebase grows.",
      "C": "Sacrifices the parallelism the task decomposition was designed to provide, when the actual problem is the axis of decomposition, not decomposition itself.",
      "D": "Treats a decomposition design flaw as a downstream reconciliation problem; detecting inconsistent overload resolutions after the fact requires re-deriving the same judgment calls the batches already got wrong, and reconciling incompatible edits is far more costly than preventing the conflict at decomposition time."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.6-7a9991b2"
  },
  {
    "taskStatement": "D1.7",
    "domain": "D1",
    "scenario": "A developer productivity team uses the Claude Agent SDK to power a long-running coding assistant. A session has already spent significant time exploring a large legacy codebase with Read/Grep/Glob, building up substantial context about module boundaries and dependencies. At this point, the developer wants to try two competing refactoring strategies (extract-service vs. extract-library) and compare their outcomes before committing to one, without losing the exploration work already done or letting the two attempts interfere with each other.",
    "question": "What is the most effective way to manage session state for this comparison?",
    "options": {
      "A": "Fork the current session at this point into two child sessions, each inheriting the accumulated exploration context, and let each pursue one refactoring strategy independently.",
      "B": "Start two brand-new sessions from scratch, one per strategy, so each gets a clean slate unaffected by prior exploration.",
      "C": "Continue in the single existing session, trying the extract-service strategy first, then instructing the agent to disregard those changes before attempting extract-library.",
      "D": "Resume the existing session and run both strategies sequentially within it, relying on the conversation history to keep the two attempts separate."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Forking branches a session at a shared point of accumulated context into independent paths, letting each strategy be explored in isolation without redoing prior exploration or letting one attempt's state contaminate the other.",
      "B": "Discards the already-built context from codebase exploration, forcing redundant re-exploration and wasting the investment already made in understanding the legacy system.",
      "C": "Relies on the agent probabilistically 'disregarding' prior instructions and changes rather than a clean, deterministic separation - state and side effects from the first strategy can still leak into the second attempt.",
      "D": "Running both strategies sequentially in one continuous session mixes their histories together, so context and changes from the first strategy can bleed into the second instead of keeping the two attempts cleanly separate."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.7-954bda21"
  },
  {
    "taskStatement": "D1.7",
    "domain": "D1",
    "scenario": "A developer productivity team uses the Claude Agent SDK to build an internal \"migration assistant\" agent for a legacy monolith. Each session begins with a costly 20-minute exploration phase: the agent reads dozens of files with Read/Grep/Glob, maps module dependencies, and builds up conversational context before proposing any changes. After this exploration phase completes for a given module, an engineer wants to try two different migration strategies (e.g., extracting a service vs. wrapping the module with an adapter) starting from that same explored state, without paying the exploration cost twice.\n\nThe team also wants to guarantee that if both strategies turn out to be dead ends, they can still return to the original session exactly as it stood right after exploration, rather than losing that context or having it polluted by either strategy's changes.",
    "question": "What is the most effective way to structure session state management for this workflow?",
    "options": {
      "A": "Fork the session at the checkpoint immediately after exploration, producing two independent session copies that each proceed with a different migration strategy, while the original session remains untouched and resumable.",
      "B": "Resume the original session and have the agent attempt both migration strategies sequentially within the same conversation history, then compare the two outcomes at the end.",
      "C": "Use session resumption twice on the same session ID, running one strategy after the other, and re-run the exploration phase each time to reset the agent's context.",
      "D": "Manually export the conversation transcript to a text file after exploration, then paste it into two newly started sessions to seed each strategy."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Forking a session at a specific checkpoint creates independent copies that inherit the accumulated state up to that point, so each branch can pursue a different strategy in isolation without re-doing the exploration work, while the original session is left unmodified and can still be resumed later.",
      "B": "Running both strategies in a single conversation history mixes their state together - later decisions and file changes from one strategy become part of the context the other strategy reasons over, and the original pre-branch state is no longer separately recoverable.",
      "C": "Re-running the expensive exploration phase for each strategy defeats the goal of avoiding duplicated work, and reusing the same session ID sequentially still leaves only one linear history rather than two isolated, independently resumable branches.",
      "D": "Manually copying a transcript is a brittle, unnecessary workaround - it does not reliably reconstruct the agent's internal session state, and it still requires re-establishing two sessions by hand instead of using a mechanism designed to branch state at a specific point."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.7-ce87b269"
  },
  {
    "taskStatement": "D2.1",
    "domain": "D2",
    "scenario": "A developer productivity agent built on the Claude Agent SDK has two MCP tools for locating code: search_codebase (\"Searches the codebase\") and grep_files (\"Searches files for matches\"). In production usage, the agent calls search_codebase for nearly every lookup, including simple, exact-string searches like finding a specific function name or config key. search_codebase performs a slower semantic embedding search, so these calls add unnecessary latency and cost for tasks a fast literal grep_files match would resolve in milliseconds.",
    "question": "What is the most effective first step to fix this tool selection problem?",
    "options": {
      "A": "Rewrite both tool descriptions to specify what each tool does well, the input types it expects, and explicit boundaries distinguishing exact/literal matching (grep_files) from conceptual/semantic queries (search_codebase).",
      "B": "Remove search_codebase entirely so the agent has no choice but to use grep_files for all lookups.",
      "C": "Add several few-shot examples to the system prompt showing exact-string queries being paired with grep_files calls.",
      "D": "Insert a pre-processing classifier that labels each query as \"exact\" or \"semantic\" before the agent sees it, and exposes only the matching tool."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. The root cause is that both descriptions are minimal and fail to communicate each tool's strengths, expected inputs, and boundaries relative to the other. Rewriting the descriptions to make those boundaries explicit is the low-effort, high-leverage fix that lets the model choose correctly on its own.",
      "B": "Eliminates the misuse but also removes semantic search capability entirely, which the agent legitimately needs for conceptual queries - an overcorrection that discards functionality instead of fixing the underlying description problem.",
      "C": "Few-shot examples rely on probabilistic compliance and add token overhead on every call without fixing the ambiguous descriptions that caused the misrouting in the first place.",
      "D": "Over-engineered for what is fundamentally a description problem, and bypasses the model's own language understanding by hard-coding a classification step outside the agent's reasoning."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.1-f642bbd3"
  },
  {
    "taskStatement": "D2.1",
    "domain": "D2",
    "scenario": "A structured data extraction pipeline processes scanned vendor documents using two MCP tools, extract_purchase_order and extract_invoice, each returning JSON matching a schema required by the downstream accounts-payable system. Their descriptions read \"Extracts structured data from a purchase order\" and \"Extracts structured data from an invoice,\" with no further guidance. Production monitoring shows the agent frequently calls extract_invoice on scanned purchase orders that lack a clear header, and downstream schema validation rejects roughly 18% of records because the extracted schema's document_type field doesn't match what the accounts system expects for that document.",
    "question": "What is the most effective first step to reduce these tool-selection errors?",
    "options": {
      "A": "Expand both tool descriptions to name the distinguishing document features (e.g., PO number vs. invoice number, presence of payment terms) and give explicit guidance on which tool to use when a document is ambiguous.",
      "B": "Add several few-shot examples to the system prompt showing correct routing between the two tools on ambiguous scans.",
      "C": "Merge both tools into a single extract_document tool fronted by an upstream routing classifier that pre-selects document type before extraction.",
      "D": "Add a downstream JSON schema validation step that automatically retries with the other extraction tool whenever the first attempt's output fails validation."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. The tool descriptions are ambiguous and give the model no way to distinguish the two document types on hard cases; this is the low-effort, high-leverage root-cause fix and the appropriate first step before considering heavier changes.",
      "B": "Adds token overhead and relies on probabilistic compliance rather than fixing the ambiguous descriptions that are the root cause.",
      "C": "A valid architecture for a harder version of this problem, but over-engineered as a first step when a simpler fix (better descriptions and boundaries) hasn't been tried.",
      "D": "Treats the symptom rather than the cause - it masks misrouted calls with retries, adding latency and cost on every ambiguous document instead of improving the agent's ability to select the right tool."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.1-cc7889a0"
  },
  {
    "taskStatement": "D2.1",
    "domain": "D2",
    "scenario": "A structured data extraction pipeline processes incoming vendor invoices using an MCP server with two tools: parse_document, described as \"Parses a document and returns its contents,\" and extract_line_items, described as \"Extracts line items from a document.\" Both tools accept a raw document string and return JSON. Log review shows that for invoices with multi-page itemized tables, the agent frequently calls only parse_document and passes its generic output straight to the downstream billing system, omitting the structured per-item quantities and unit prices that extract_line_items would have produced. This causes 20% of downstream billing records to be missing itemized detail required for reconciliation.",
    "question": "What is the most effective first step to fix this tool selection problem?",
    "options": {
      "A": "Rewrite both tool descriptions to state their distinct purposes, input expectations, and when to use one versus the other (e.g., parse_document for general text/metadata, extract_line_items specifically for itemized tables with quantities and unit prices), so the agent can distinguish them from the tool description alone.",
      "B": "Merge parse_document and extract_line_items into a single extract_document_data tool that always returns both generic contents and any line items found.",
      "C": "Add a JSON schema requiring a line_items field on the billing system's input so malformed records are rejected before reconciliation.",
      "D": "Add few-shot examples to the agent's system prompt showing invoices with tables being routed to extract_line_items."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. The root cause is that both tool descriptions are minimal and don't explain their distinct purpose, inputs, or when to use one over the other. Rewriting the descriptions to state clear boundaries is the low-effort, high-leverage fix that lets the agent select correctly from the tool interface alone.",
      "B": "A valid architecture change, but heavier than a first step warrants, and it papers over the real problem (ambiguous, undifferentiated tool descriptions) rather than fixing it.",
      "C": "Addresses the downstream symptom (bad billing records) by rejecting them, not the root cause of why the agent chose the wrong tool during extraction.",
      "D": "Few-shot examples rely on probabilistic compliance and add token overhead without resolving the underlying ambiguity in the tool descriptions themselves."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.1-05b64583"
  },
  {
    "taskStatement": "D2.2",
    "domain": "D2",
    "scenario": "A Developer Productivity agent uses an MCP tool run_migration to apply database schema migrations during automated task execution. When a migration fails, the tool currently returns a bare string: \"Error: exit code 1\". Logs show the agent's downstream behavior is inconsistent — sometimes it retries the same failing migration in a loop, sometimes it tells the user the database is unreachable when the real cause was a syntax error in the migration file, and sometimes it silently proceeds to the next task as if the migration succeeded.\n\nThe team wants the agent to reliably distinguish between transient failures (worth retrying), user-fixable errors (like SQL syntax mistakes, which should stop and surface a clear message), and permission errors (which should escalate rather than retry), without relying on the model to infer intent from a free-text string.",
    "question": "What is the most effective change to the run_migration tool's error handling to fix this?",
    "options": {
      "A": "Return a structured error response with a machine-readable category field (e.g., transient, validation, permission) plus a human-readable message, so the agent's next action is determined by the category rather than by interpreting free text.",
      "B": "Keep the string-based error format but make the message longer and more descriptive, including the full stack trace, so the model has more context to reason from.",
      "C": "Add a line to the system prompt instructing the agent to classify migration errors as transient, validation, or permission issues before deciding whether to retry.",
      "D": "Have the tool automatically retry failed migrations up to three times internally before returning any result to the agent, so the agent never sees a raw failure."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. A structured error category field gives the agent a deterministic, machine-readable signal to branch on (retry vs. stop vs. escalate), rather than requiring it to probabilistically infer intent from prose - the same programmatic-enforcement principle that makes structured tool outputs more reliable than free text.",
      "B": "Adds token overhead without fixing the root cause - the agent still has to infer the error category from unstructured prose, so misclassification remains just as likely.",
      "C": "Relies on probabilistic LLM compliance to correctly parse and classify a free-text string every time; this is the same failure mode already occurring and does not guarantee consistent behavior.",
      "D": "Masks the underlying problem: a validation error (like bad SQL syntax) is not transient and will fail identically on every retry, wasting three attempts before the agent ever learns the real cause, and permission errors still need to escalate rather than be retried."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.2-038ec24d"
  },
  {
    "taskStatement": "D2.1",
    "domain": "D2",
    "scenario": "A Claude Code agent used for developer productivity has two MCP database tools: query_database and run_migration. Both descriptions simply read \"Executes SQL against the application database.\" Logs show that when engineers ask things like \"how many rows are in the orders table right now?\" or \"check if the users table has a status column,\" the agent sometimes calls run_migration instead of query_database, running schema-inspection statements through the migration pathway. No data has been lost yet, but the migration tool logs each call as a schema change event, corrupting the migration history and once triggering a lock on the orders table during a deploy window. A human-approval gate already fronts every run_migration call - which is how these stray calls keep getting caught before damage is done - but the misrouted attempts continue.",
    "question": "What is the most effective fix to stop the agent from routing read-only requests to run_migration?",
    "options": {
      "A": "Rewrite each tool's description to state its exact purpose, expected inputs, and explicit boundaries (e.g., query_database is for read-only lookups and must never be used for schema changes; run_migration is only for applying versioned schema changes and must never be used for ad hoc queries).",
      "B": "Set tool_choice to \"any\" so the model is always required to call one of the two tools rather than answering in free text.",
      "C": "Add few-shot examples to the system prompt showing read-only questions being answered with query_database.",
      "D": "Remove run_migration from the agent's toolset and require engineers to run migrations manually outside the agent."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. The root cause is that both tool descriptions are generic and don't distinguish purpose or boundaries. Rewriting them to clearly state what each tool is for, and explicitly is not for, gives the model the information it needs to select correctly, and is the low-effort, high-leverage first step.",
      "B": "tool_choice \"any\" forces some tool call on every turn but has no effect on which tool gets selected - the misrouting between query_database and run_migration is untouched.",
      "C": "Few-shot examples rely on probabilistic compliance and add token overhead without fixing the ambiguous descriptions that are the actual root cause.",
      "D": "Over-corrects by eliminating a needed capability instead of fixing the tool descriptions that caused the misrouting."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.1-e0d64509"
  },
  {
    "taskStatement": "D2.2",
    "domain": "D2",
    "scenario": "An insurance claims agent uses an MCP tool, lookup_policy, to retrieve policy details before processing a claim. Currently, any failure in the tool — an invalid policy ID format, a policy that doesn't exist, or a timeout from the backend policy database — returns the same plain-text string: \"Error: could not complete request.\" Logs show the agent behaves inconsistently across these cases: sometimes it tells the customer their policy doesn't exist when the real cause was a transient database timeout, sometimes it asks the customer to resubmit a validly formatted ID because it misreads a not-found error as a formatting issue, and sometimes it retries indefinitely on a permanent not-found error.\n\nThe team wants the agent to react appropriately and consistently to each distinct failure mode without guessing at the cause from a generic message.",
    "question": "What is the most effective way to fix this?",
    "options": {
      "A": "Update the tool to return structured error responses with distinct machine-readable categories (e.g., invalid_input, not_found, transient_error) so the agent can deterministically select the correct next action for each case.",
      "B": "Add a system prompt instruction telling the agent to infer the likely cause of a lookup_policy failure from the wording of the error message before deciding how to respond.",
      "C": "Wrap all tool failures in a single friendly message, \"Something went wrong, please try again,\" so the agent always gives the customer a consistent response.",
      "D": "Add automatic retry logic inside the tool so it retries up to three times before returning any error to the agent."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Distinct, structured error categories give the agent the information it needs to deterministically branch its behavior - surface not_found to the customer, retry or wait on transient_error, request corrected input on invalid_input - instead of guessing at the failure mode from free text.",
      "B": "Relies on the agent probabilistically parsing an ambiguous string rather than receiving an explicit, structured signal - this is the same root cause that produced the inconsistent behavior in the first place.",
      "C": "Makes the response uniform but destroys the information needed to act correctly - the agent (and the customer) can no longer distinguish a permanent not-found from a transient timeout.",
      "D": "Only addresses the transient-error case and does so by masking failures inside the tool; it does nothing to help the agent distinguish invalid_input from not_found, and retrying a permanent not-found error wastes calls without resolving the underlying ambiguity."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.2-6eb7bcc8"
  },
  {
    "taskStatement": "D2.3",
    "domain": "D2",
    "scenario": "A structured data extraction pipeline processes scanned invoices. Claude has two tools available: extract_invoice_data (for well-formed invoices, populating a JSON schema for the billing system) and flag_for_review (for illegible, non-invoice, or incomplete documents, routing them to a human queue). The pipeline currently uses the default tool_choice setting. Logs show that on roughly 8% of documents, Claude responds with a plain-text explanation of why the document is problematic instead of calling either tool, which crashes the downstream parser expecting a tool call.",
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
    "id": "D2.3-a61fb467"
  },
  {
    "taskStatement": "D2.3",
    "domain": "D2",
    "scenario": "A customer support pipeline has two agents: a triage agent that must categorize every incoming ticket by calling categorize_ticket before anything else happens, and a resolution agent with five tools (lookup_order, process_refund, update_shipping, send_email, escalate_to_human) that handles the actual customer request after triage. Production logs show the triage agent works correctly for straightforward tickets but roughly 8% of the time responds directly with a conversational message instead of calling categorize_ticket, causing those tickets to skip categorization and enter the resolution agent unclassified.",
    "question": "What is the most effective way to guarantee the triage agent always invokes categorize_ticket before producing any other output, while keeping the resolution agent's tool usage flexible?",
    "options": {
      "A": "Set the triage agent's tool_choice to force the categorize_ticket tool specifically, while leaving the resolution agent's tool_choice set to auto across its five tools.",
      "B": "Add a system prompt instruction to the triage agent stating that calling categorize_ticket is mandatory before responding to the user.",
      "C": "Give the triage agent access to all six tools (categorize_ticket plus the resolution agent's five tools) so it has full context to decide whether categorization is needed.",
      "D": "Remove every tool from the triage agent except categorize_ticket and leave tool_choice set to auto, relying on the fact that it is the only tool available."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Forcing tool_choice to a specific tool guarantees that tool is invoked before any text response, giving deterministic control exactly where it is needed. The resolution agent, which must choose among several valid tools depending on the request, is correctly left on auto - this distributes both tools and tool_choice configuration appropriately across the two agents.",
      "B": "Relies on probabilistic instruction-following. The logs already show the model sometimes ignores instructions and responds conversationally instead of calling the tool, so a stronger prompt does not eliminate the failure mode.",
      "C": "Over-provisions the triage agent with tools that belong to the resolution agent's responsibility, violating separation of concerns and least privilege without addressing the actual problem, which is that the triage agent isn't reliably calling its own tool.",
      "D": "With tool_choice still set to auto, the model can still choose to respond with plain text and call no tool at all, even if only one tool is available - auto never guarantees invocation, so this does not fix the 8% failure rate."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.3-765b677b"
  },
  {
    "taskStatement": "D2.2",
    "domain": "D2",
    "scenario": "A Structured Data Extraction pipeline uses an MCP tool submit_invoice to push validated invoice records to an accounting system. Currently, any failure - a malformed field, an expired auth token, or a downstream service timeout - is returned to the agent as the same generic string: \\\"Error: could not submit invoice.\\\" Production logs show the agent responds inconsistently: sometimes it retries a permission failure a dozen times (which can never succeed without human intervention), and sometimes it gives up immediately on a transient timeout that a simple retry would have resolved.\\n\\nThe team wants the agent to make the correct decision - fix the input, retry, or escalate to a human - based on the type of failure, without a person manually reading logs for every case.",
    "question": "What is the most effective way to fix submit_invoice so the agent can reliably choose the right recovery action?",
    "options": {
      "A": "Return a structured error response with a distinct category (e.g., validation_error, auth_error, transient_error) plus a descriptive message, so the agent can programmatically map each category to the appropriate action.",
      "B": "Wrap every failure in a single generic \"Tool execution failed\" message and rely on system prompt instructions telling the agent how to generally handle tool failures.",
      "C": "Have the tool itself automatically retry every failure up to three times internally, and only report an error to the agent after retries are exhausted.",
      "D": "Keep detailed error information in server-side logs only, and return a simple boolean success/failure flag to the agent to keep the tool response minimal."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Structured error categories give the agent the machine-readable signal it needs to deterministically choose between fixing input, retrying, or escalating, instead of guessing from an opaque message.",
      "B": "Relies on the agent probabilistically inferring the right response from a generic message and prompt wording - it cannot reliably distinguish a permission failure from a transient one, which is exactly the failure mode observed.",
      "C": "Masks the distinction between transient and permanent failures inside the tool itself - a non-retryable auth error would still be retried three times before failing, wasting calls, while the agent never learns why it failed.",
      "D": "Removes the very information the agent needs to decide how to proceed; a bare boolean cannot distinguish a fixable input error from a permission problem or a transient outage."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.2-00985fd8"
  },
  {
    "taskStatement": "D2.3",
    "domain": "D2",
    "scenario": "A structured data extraction pipeline processes scanned invoices. The agent has two tools: extract_line_items (parses vendor, amounts, and line items into a JSON schema) and validate_schema (checks the extracted JSON against downstream system requirements). Tool choice is currently left at the default \"auto\" setting. Logs show that on roughly 20% of invoices, the model responds with a prose summary of the invoice contents instead of calling extract_line_items, especially when the invoice has an unusual layout - breaking the downstream parser, which expects a tool call every time.",
    "question": "What is the most effective way to guarantee that extract_line_items is invoked on every invoice, regardless of layout?",
    "options": {
      "A": "Set tool_choice to force the model to call extract_line_items specifically, rather than leaving it on \"auto.\"",
      "B": "Set tool_choice to \"any\" so the model must call some tool rather than responding with plain text.",
      "C": "Add few-shot examples to the prompt showing extract_line_items being called on invoices with unusual layouts.",
      "D": "Rewrite extract_line_items's description to more clearly state that it should be used for all invoice types, including unusual layouts."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. When a specific tool must run every time with no acceptable alternative, forcing tool_choice to that exact tool gives a deterministic guarantee, unlike \"auto,\" which leaves it to the model to decide whether and which tool to call.",
      "B": "Forcing \"any\" only guarantees that some tool is called, not which one - with two tools available, the model could still call validate_schema instead of or before extract_line_items, so the parser could still fail to receive extracted line items first.",
      "C": "Few-shot examples raise the odds of the desired behavior but still rely on probabilistic compliance, which the scenario shows is already failing on 20% of unusual-layout invoices.",
      "D": "A description rewrite also relies on the model probabilistically choosing to call the tool; it does not change the fact that \"auto\" permits a text-only response instead of a tool call."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.3-1649d551"
  },
  {
    "taskStatement": "D2.4",
    "domain": "D2",
    "scenario": "A platform team configures a Claude Code-based incident investigation agent for their developer productivity workflow. They connect an MCP server for their observability platform, which exposes four tools: query_logs, query_metrics, restart_service, and scale_deployment. The investigation agent's job is limited to helping engineers understand \"what happened\" during an incident by reading logs and metrics - any remediation (restarting or scaling services) is handled by a separate, human-approved on-call runbook process that is not part of this agent's workflow.\n\nDuring review, the team notices the investigation agent occasionally calls restart_service when an engineer phrases a question ambiguously (e.g., \"can we fix the crash loop?\"), even though remediation was never intended to be part of this workflow.",
    "question": "What is the most effective way to configure the MCP integration to prevent this?",
    "options": {
      "A": "Connect the MCP server but enable only query_logs and query_metrics for the investigation agent's configuration, leaving restart_service and scale_deployment available exclusively to the separate, approved runbook workflow.",
      "B": "Connect the full MCP server with all four tools, and add a system prompt instruction telling the agent it must never call restart_service or scale_deployment without explicit human approval.",
      "C": "Connect the full MCP server with all four tools, and rely on the MCP server's existing tool descriptions, which already note that restart_service and scale_deployment are destructive actions.",
      "D": "Connect the full MCP server with all four tools, and add few-shot examples to the system prompt showing the agent using only query_logs and query_metrics when investigating incidents."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. When integrating an MCP server into a specific agent workflow, only the tools that workflow actually needs should be enabled. Scoping the investigation agent to query_logs and query_metrics programmatically removes the possibility of calling restart_service or scale_deployment at all, matching the tool's role to the workflow it serves rather than depending on the model to self-restrict.",
      "B": "Relies on probabilistic LLM compliance with a prompt instruction. As the observed failure shows, ambiguous phrasing can still lead the agent to call a tool the instruction told it not to use.",
      "C": "Tool descriptions inform tool selection, but a description alone does not prevent the tool from being called - it only makes the mutating action easier to distinguish once already present among the agent's options.",
      "D": "Few-shot examples raise the odds of correct behavior but, like the system prompt instruction in B, are a probabilistic mitigation and do not guarantee the agent will never invoke the mutating tools given the wrong phrasing."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.4-fabe71d0"
  },
  {
    "taskStatement": "D2.4",
    "domain": "D2",
    "scenario": "A finance operations team is extending an internal agent workflow that already has tools for sending customer emails and processing refunds, built on the Claude Agent SDK. An engineer finds a community-published MCP server that wraps their accounting platform's API, exposing tools like create_invoice, void_transaction, and export_ledger. Because the MCP server would let the agent close a gap in the current workflow (reconciling refunds against the ledger automatically), the engineer wants to wire it directly into the production agent so it can be used on the next deploy.",
    "question": "What should happen before this third-party MCP server is integrated into the production agent workflow?",
    "options": {
      "A": "Review the server's source code and the permissions its tools require, test it in an isolated environment first, and grant it only the minimum tool scope the workflow actually needs before adding it to production.",
      "B": "Integrate it directly into production, since any MCP server exposing a well-defined tool schema can be trusted the same way built-in tools are.",
      "C": "Add it to production now, but write a system prompt instructing the agent to only use void_transaction and export_ledger in appropriate situations.",
      "D": "Skip the new MCP server and instead have the agent reach the accounting platform through its existing email tool, since adding a new external integration expands the attack surface."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Third-party MCP servers can execute arbitrary code and request broad permissions; integrating one into a workflow that already touches money and customer communication warrants source review, sandboxed testing, and scoping to least privilege before it is trusted with production access.",
      "B": "A well-defined tool schema only describes the interface, not the server's implementation or trustworthiness - following the MCP protocol does not mean the server's code or access requests have been vetted.",
      "C": "Relies on probabilistic prompt compliance to restrict a tool that already has production access; it does not prevent the agent from calling create_invoice or void_transaction incorrectly, and the underlying server is still unreviewed.",
      "D": "Misapplies the email tool to a task it was not built for, and doesn't actually solve the stated need (automated reconciliation) - it avoids the integration decision rather than evaluating it."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.4-64575b79"
  },
  {
    "taskStatement": "D2.4",
    "domain": "D2",
    "scenario": "A platform team wants every engineer on a 40-person team to have consistent access to an internal Jira MCP server from Claude Code, so agents can look up and update tickets while exploring the codebase. The team needs the same server available to everyone who clones the repo, without engineers manually reconfiguring their own machines, and without an API token ending up readable by anyone who checks out the repository.\n\nA junior engineer proposes committing an .mcp.json file to the repo root with the server's command and a hardcoded Jira API token in the args, reasoning this guarantees every teammate gets the exact same working configuration the moment they clone the repo.",
    "question": "What is the most effective way to integrate this MCP server for the team while addressing the credential-exposure risk?",
    "options": {
      "A": "Commit a project-scoped .mcp.json that defines the Jira server and references the token via an environment variable rather than a literal value, so the configuration is shared through version control while each engineer supplies their own credential locally.",
      "B": "Have each engineer run the CLI command to add the Jira MCP server to their personal user-level configuration with their own token, since user-level configuration is the mechanism intended for keeping credentials out of the repo.",
      "C": "Commit the .mcp.json with the hardcoded token as proposed, then add .mcp.json to .gitignore afterward so future edits to the file are no longer tracked.",
      "D": "Keep the Jira server configuration entirely local to each engineer's machine and document the manual setup steps in a README so new engineers can replicate it themselves."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. A project-scoped .mcp.json checked into version control gives the whole team the identical server definition automatically on clone, while referencing the credential through an environment variable keeps the secret itself out of the committed file - satisfying both the consistency requirement and the credential-exposure concern.",
      "B": "Keeps tokens out of the repo but sacrifices the consistency requirement - each engineer must manually configure the server themselves, and the team has no shared, version-controlled definition that new engineers get automatically.",
      "C": "Does not solve the problem: the token was already committed to git history before the .gitignore entry was added, so it remains exposed to anyone with access to the repository's history.",
      "D": "Manual, undocumented-in-config setup reintroduces the per-engineer inconsistency the team is trying to avoid, and relies on every new engineer correctly following README steps rather than getting a working setup automatically."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.4-7a9c2696"
  },
  {
    "taskStatement": "D2.5",
    "domain": "D2",
    "scenario": "A developer asks Claude Code to deprecate an internal helper function, formatLegacyDate(), and replace all call sites across a 400-file TypeScript monorepo with the new formatDate() utility, which takes the same arguments. The function name is unique enough that a text search won't produce false positives, but call sites are scattered across many directories, and each file also contains unrelated code that must be preserved exactly as-is.",
    "question": "Which combination of built-in tools is the most appropriate way for Claude to carry out this task?",
    "options": {
      "A": "Use Grep to locate every file and line referencing formatLegacyDate, then use Edit on each file to replace the exact matched text with formatDate.",
      "B": "Use Bash to run a recursive grep and sed -i command that finds and replaces all occurrences of formatLegacyDate with formatDate in a single shell pipeline.",
      "C": "Use Glob to list every .ts file in the repo, then use Write to rewrite each file in full with the updated function name substituted in.",
      "D": "Use Read to load the entire repository into context, then use Bash to execute a custom find-and-replace script generated from that context."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Grep is purpose-built for locating matches across many files, and Edit performs precise, targeted string replacement without touching the rest of each file's content - the right combination for a scoped, reviewable text substitution.",
      "B": "Shelling out to sed -i bypasses Claude's built-in Edit mechanism entirely, turning a precise, auditable operation into an unreviewed bulk shell transformation - a common shortcut that trades safety and traceability for speed.",
      "C": "Write is meant for creating new files or full-file rewrites, not small targeted changes - rewriting each file from scratch risks losing or corrupting unrelated content that Edit would leave untouched.",
      "D": "Loading the entire repository into context via Read is unnecessary and wasteful when Grep can identify exactly which files and lines matter, and running an ad hoc Bash script for replacement again bypasses Edit's precise, exact-match safety."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.5-8572e635"
  },
  {
    "taskStatement": "D2.4",
    "domain": "D2",
    "scenario": "A developer productivity team configures Claude Code with three MCP servers — GitHub, Jira, and Confluence — to support engineers doing codebase exploration, ticket triage, and documentation lookups. Every engineer's Claude Code session and every subagent spawned in multi-agent workflows is given access to all tools from all three servers by default, regardless of the task at hand. Engineers report that Claude increasingly hesitates or picks the wrong tool when several servers expose similarly named actions (e.g., search_issues from Jira vs. search_content from Confluence), and that simple codebase-exploration tasks now involve unnecessary tool-selection overhead.",
    "question": "What is the most effective way to address this tool-selection problem?",
    "options": {
      "A": "Scope each session or subagent's available MCP tools to only the servers relevant to its current task (e.g., GitHub tools only for codebase exploration), rather than exposing every connected server's tools by default.",
      "B": "Consolidate the GitHub, Jira, and Confluence MCP servers into a single combined server so there is only one set of tool names to choose from.",
      "C": "Add few-shot examples to the system prompt showing which server's tool to use for each type of request.",
      "D": "Switch to a larger-context model so Claude can reason more carefully before selecting among the larger combined tool set."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. This applies the principle of least privilege to MCP integration: granting a session or subagent only the tools relevant to its task removes the ambiguity and overhead caused by unrelated, similarly named tools being available at once, and is a low-effort, high-leverage fix.",
      "B": "Merging external servers is a heavy, often infeasible restructuring that doesn't address the root cause — over-provisioning unrelated tools to every task — and naming collisions could still arise within a merged server.",
      "C": "Few-shot examples rely on probabilistic compliance and add token overhead without removing the unnecessary tools causing the ambiguity in the first place.",
      "D": "Misdiagnoses the problem as a context-capacity limitation rather than tool-selection overhead caused by over-scoped access; a larger model does not resolve ambiguity between similarly named tools it shouldn't have been offered."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.4-7e17eeda"
  },
  {
    "taskStatement": "D3.1",
    "domain": "D3",
    "scenario": "A platform engineering team maintains a monorepo containing a Python backend (services/api), a React frontend (apps/web), and a shared component library (packages/ui). Each area has distinct conventions: the API uses a strict internal error-handling pattern, the frontend follows a specific state-management approach, and the UI library has its own accessibility and prop-naming standards. There is also a small set of organization-wide rules (commit message format, license header, security review requirements) that must apply no matter which part of the repo Claude is working in.\n\nCurrently there is a single root-level CLAUDE.md that tries to describe all three areas' conventions in one long file. Engineers report that Claude frequently applies frontend state-management conventions when editing backend code, and misses the org-wide commit and license rules when working deep inside packages/ui.",
    "question": "What is the most maintainable way to restructure the CLAUDE.md configuration to fix these cross-contamination and coverage problems?",
    "options": {
      "A": "Keep the org-wide rules in the root CLAUDE.md, and add a separate CLAUDE.md in each of services/api, apps/web, and packages/ui containing only that area's specific conventions, relying on the hierarchy so nested CLAUDE.md files supplement the root file when Claude works in that subdirectory.",
      "B": "Delete the root CLAUDE.md and create one comprehensive CLAUDE.md in each subdirectory that fully restates the org-wide rules plus that area's conventions, so every directory is self-contained.",
      "C": "Keep the single root CLAUDE.md but reorganize its content into clearly labeled sections (API, Web, UI, Org-Wide) with headers, so Claude can infer which section applies based on the files it is currently editing.",
      "D": "Keep the single root CLAUDE.md for org-wide rules, and move the area-specific conventions into three separate skills in .claude/skills/, one per area, so Claude only loads the relevant skill on demand."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. CLAUDE.md files form a hierarchy where nested files are loaded alongside the root file based on directory location, so scoping org-wide rules at the root and area-specific conventions in each subdirectory ensures both are automatically applied together without manual selection or duplication, and eliminates the cross-contamination caused by mixing all conventions into one flat file.",
      "B": "Duplicating the org-wide rules across three files creates a maintenance burden - any change to commit format, license header, or security requirements must be updated in three places, and the files can drift out of sync over time.",
      "C": "Relying on Claude to infer which section applies from unstructured prose is exactly the probabilistic approach that caused the original cross-contamination problem; headers alone don't guarantee the right section is applied and the wrong one is ignored.",
      "D": "Skills require explicit invocation or Claude deciding to load them, which is not deterministic the way directory-scoped CLAUDE.md files are, and doesn't solve the org-wide rules being missed deep in the directory tree."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D3.1-6746ea9f"
  },
  {
    "taskStatement": "D3.2",
    "domain": "D3",
    "scenario": "A platform team is packaging a repository-analysis workflow for Claude Code: it walks the dependency graph, reads dozens of files, and produces a long architectural report. Trial runs surfaced two problems: the exploration's verbose intermediate output floods the main conversation, crowding out the task the engineer was working on, and during one run the workflow modified a build file while \"tidying\" something it noticed. Engineers should keep invoking the analysis on demand, by name.",
    "question": "Which configuration best addresses both problems?",
    "options": {
      "A": "Package the workflow as a skill in .claude/skills/ whose SKILL.md frontmatter sets context: fork, so it runs in an isolated sub-agent context, and allowed-tools restricting it to read-only tools.",
      "B": "Package the workflow as a skill, and add instructions in the SKILL.md body telling Claude to keep its output brief and avoid editing any files.",
      "C": "Move the workflow's instructions into the project CLAUDE.md so they are always loaded, with a rule stating that analysis runs must not modify files.",
      "D": "Split the workflow into several smaller skills so each produces less output, and rely on engineers to invoke them in sequence."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. context: fork runs the skill in an isolated sub-agent context, so verbose exploration output never pollutes the main conversation, and allowed-tools programmatically restricts the skill to read-only tools - a guarantee, not a request.",
      "B": "Prompt-level instructions are probabilistic: they lower the odds of verbose output and stray edits but guarantee neither. The isolation and tool-restriction frontmatter exist precisely for this.",
      "C": "CLAUDE.md is for always-loaded universal standards, not an on-demand workflow; it adds permanent context weight without isolating output, and a prose rule against edits is not an enforcement mechanism.",
      "D": "Splitting the workflow does not isolate output - the fragments still land in the main conversation - and adds invocation burden without addressing the file-modification risk."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D3.2-ca2f6290"
  },
  {
    "taskStatement": "D3.3",
    "domain": "D3",
    "scenario": "A platform engineering team maintains a monorepo containing Python microservices, a shared Terraform module directory, and a Next.js frontend. Database migration files follow a strict naming and rollback-safety convention, but these migration files live inside each microservice's own directory (e.g., services/billing/migrations/, services/inventory/migrations/), interspersed with regular application code that follows different conventions. Developers report that Claude Code frequently generates new migration files without the required rollback block, even though it correctly applies each service's general coding style.",
    "question": "What is the most maintainable way to ensure Claude reliably applies the migration-specific convention whenever it edits a migration file, regardless of which service directory it lives in?",
    "options": {
      "A": "Add a rule file in .claude/rules/ with YAML frontmatter targeting a glob pattern like **/migrations/*.py, describing the required rollback-safety convention.",
      "B": "Add a CLAUDE.md file inside each service's migrations/ subdirectory documenting the rollback-safety convention for that service.",
      "C": "Expand the root CLAUDE.md with a dedicated \"Migrations\" section describing the convention and trust Claude to recognize when it is editing a migration file.",
      "D": "Create a migration-convention skill in .claude/skills/ that Claude can invoke when it determines it is working on a database migration."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. A glob pattern such as **/migrations/*.py matches every migration file across every service directory, so the convention loads whenever a matching migration file is being edited, regardless of where in the monorepo it lives, with no per-directory duplication and no reliance on inference.",
      "B": "Requires manually creating and maintaining a duplicate convention file in every service's migrations/ subdirectory; a new service added later would silently lack the rule until someone remembers to copy it over.",
      "C": "Relies on Claude inferring from a general description which files count as migrations, which is the same probabilistic-matching failure already causing the rollback block to be omitted.",
      "D": "Requires Claude to decide on its own to invoke the skill, which contradicts the need for the convention to apply automatically and deterministically every time a migration file is touched."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D3.3-2959b9dd"
  },
  {
    "taskStatement": "D3.3",
    "domain": "D3",
    "scenario": "A data engineering team uses Claude Code to maintain a monorepo where Python ETL scripts, SQL migration files, and Terraform infrastructure definitions are all interleaved within the same directories (e.g., a single pipelines/orders/ folder contains .py, .sql, and .tf files side by side). Each file type has its own established conventions: Python scripts must use a specific logging wrapper, SQL migrations must include a rollback block, and Terraform files must use a shared naming prefix. Because directory structure does not correspond to file type, the team cannot rely on folder-level placement to scope these conventions.",
    "question": "What is the most maintainable way to ensure Claude automatically applies the correct convention set based on which file type it is editing, regardless of directory?",
    "options": {
      "A": "Create separate rule files in .claude/rules/ with YAML frontmatter glob patterns (e.g., **/*.py, **/*.sql, **/*.tf) so the matching convention set loads based on file extension rather than directory location.",
      "B": "Write one comprehensive root CLAUDE.md with a section per file type and instruct Claude to determine which section applies before editing any file.",
      "C": "Add a PreToolUse hook on the Write and Edit tools that blocks the operation unless the file already matches its convention, forcing Claude to self-correct through repeated denials.",
      "D": "Place a CLAUDE.md file in each subdirectory (e.g., pipelines/orders/CLAUDE.md) describing all three conventions, since CLAUDE.md files are automatically loaded for any file Claude touches within that directory tree."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. .claude/rules/ files with glob-pattern frontmatter scope conventions to file paths/extensions rather than directory location - exactly what's needed when files with different conventions are interleaved in the same folders.",
      "B": "Relies on Claude inferring which section applies rather than explicit, deterministic path matching, making it unreliable as the codebase grows.",
      "C": "Misuses hooks: this enforces conventions after the fact through denial loops rather than loading the correct convention content upfront, which is a roundabout, unreliable substitute for conditional convention loading.",
      "D": "Does not solve the problem: a single directory contains all three file types, so a directory-scoped CLAUDE.md cannot distinguish which convention applies to which file within that same directory."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D3.3-9904f3eb"
  },
  {
    "taskStatement": "D3.4",
    "domain": "D3",
    "scenario": "A developer asks Claude Code to fix a bug where a REST API endpoint returns a 500 error for a specific malformed request payload. The error message and stack trace point to a single validation function in one file, and the developer has already identified the line where an unguarded field access throws when the payload is missing an optional key.",
    "question": "Which approach is most appropriate for this task?",
    "options": {
      "A": "Use direct execution, since the fix is localized to a known file and line with a clear, low-ambiguity change.",
      "B": "Enter plan mode first to explore the codebase and weigh alternative validation architectures before touching the file.",
      "C": "Enter plan mode so Claude can present a step-by-step plan for review, since any production code change carries risk.",
      "D": "Use direct execution, but instruct Claude to first search the entire codebase for every other endpoint with similar validation logic before making any change."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Plan mode is suited to architectural decisions, large-scale changes, and situations with multiple valid approaches. A single-file, single-line fix with a known root cause and no design ambiguity is the case for direct execution.",
      "B": "Over-engineered - there is no architectural decision or multiple valid design approach to weigh; the fix is a scoped, already-diagnosed bug.",
      "C": "Treats risk of touching production code as the deciding factor rather than scope and ambiguity - plan mode is warranted by architectural complexity or multiple valid approaches, not by the mere fact that code is being changed.",
      "D": "Introduces unrequested scope (a codebase-wide audit) into what should be a surgical fix - a separate mistake from the plan-mode-vs-direct-execution decision the question is testing."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D3.4-d7c84fb5"
  },
  {
    "taskStatement": "D3.5",
    "domain": "D3",
    "scenario": "A developer asks Claude Code to convert a 3,000-line legacy jQuery module to React hooks. In the first attempt, the developer writes one exhaustive prompt describing every component, state variable, and edge case up front, then lets Claude Code run to completion before looking at any output. The resulting diff compiles but has several state-management bugs that trace back to a misunderstanding formed early in the conversion, and by the time the developer reviews the work, that misunderstanding has propagated through dozens of files, making the fix nearly as costly as starting over.",
    "question": "What change to the workflow would most effectively prevent this kind of compounding error going forward?",
    "options": {
      "A": "Break the migration into small increments (e.g., one component or state slice at a time), reviewing and confirming correctness after each step before Claude Code proceeds to the next.",
      "B": "Write an even more detailed single prompt covering every component and edge case so nothing is left to inference.",
      "C": "Let Claude Code complete the entire migration in one pass again, then rely on a final comprehensive review pass to catch and fix all bugs at once.",
      "D": "Switch to plan mode so Claude Code designs the full migration up front, then execute the entire plan in a single uninterrupted run."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Iterative refinement - working in small, checkpointed increments with review between steps - surfaces a wrong assumption right after it is introduced, before it can propagate through the rest of the codebase, and lets feedback from each step inform the next.",
      "B": "More upfront detail cannot substitute for checkpoints during execution: it does not create a moment to catch a bad assumption before it propagates, and issues in a large migration often only become visible once code is actually produced and inspected.",
      "C": "This repeats the original mistake. A single large uninterrupted pass still lets an early misunderstanding compound across dozens of files, and a final review pass must untangle far more than it would have at an earlier checkpoint.",
      "D": "Planning up front helps with design, but executing the entire plan in one uninterrupted run still removes the incremental checkpoints needed to catch an early error before it spreads."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D3.5-943ad6d4"
  },
  {
    "taskStatement": "D3.5",
    "domain": "D3",
    "scenario": "A developer uses Claude Code to generate a script that migrates records from a legacy CSV export into a new database schema, using Read to inspect sample rows and Write to produce the migration script. The first version Claude generates fails on 30 of 500 sample records: some have malformed date fields, others have currency values with inconsistent formatting. The developer wants the script corrected without starting over, since 94% of records already migrate correctly.",
    "question": "What is the most effective way to refine the script toward full correctness?",
    "options": {
      "A": "Run the script against the full sample set, capture the specific failing records and their error messages, and feed that concrete output back to Claude so it can target fixes for those exact cases, repeating the run-capture-fix cycle until all records pass.",
      "B": "Ask Claude to re-read the script and identify any bugs it can find on its own, then apply whatever fixes it suggests before re-running.",
      "C": "Discard the current script and re-prompt Claude from scratch with a more detailed description of the CSV format, hoping the new attempt avoids the same errors.",
      "D": "Have Claude generate three independent versions of the script in parallel and manually pick whichever one looks cleanest."
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
    "id": "D3.5-6ae70eee"
  },
  {
    "taskStatement": "D3.5",
    "domain": "D3",
    "scenario": "A developer productivity team maintains a CLAUDE.md-driven workflow that generates TypeScript API client boilerplate from OpenAPI specs. Initial testing against 40 sample specs shows the generated code compiles correctly only 65% of the time, with failures spanning several distinct causes: missing null checks on optional fields, incorrect enum handling, and wrong import paths for nested schemas.\n\nTo reach their 90% target, the team plans a series of refinement passes on the CLAUDE.md instructions and re-runs the 40-spec test set after each pass.",
    "question": "What is the most effective way to structure this refinement process?",
    "options": {
      "A": "Rewrite the CLAUDE.md instructions from scratch each pass, incorporating everything learned so far, to avoid compounding earlier mistakes.",
      "B": "Make one targeted instruction change addressing the highest-impact failure cause, re-run the test set, confirm the change improved results without introducing new failures, then move to the next cause.",
      "C": "Add instructions addressing all three known failure causes in a single pass, then re-run the test set once to check the combined effect.",
      "D": "Skip further prompt changes and re-run the existing workflow against the 40 specs multiple times, keeping the run with the highest compile-success rate."
    },
    "correct": "B",
    "explanations": {
      "A": "Discards a validated baseline and re-introduces risk of losing previously-fixed behavior; progressive improvement builds on confirmed gains rather than restarting each cycle.",
      "B": "Correct. Iterative refinement means isolating one change, measuring its effect against the test set, and confirming it before proceeding to the next issue - this attributes improvement or regression to a specific change and prevents fixes from masking or interacting with each other.",
      "C": "Bundling multiple changes into one pass makes it impossible to tell which instruction caused which effect, so a regression from one change could be hidden by gains from another, or a failing change could go undetected.",
      "D": "Rerunning an unchanged workflow and cherry-picking the best result does not fix the underlying causes and treats run-to-run variance as if it were genuine improvement."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D3.5-9a5bac6e"
  },
  {
    "taskStatement": "D3.6",
    "domain": "D3",
    "scenario": "An engineering team adds a Claude Code step to their CI pipeline that runs on every pull request to flag critical issues before merge. The pipeline invokes Claude Code non-interactively, captures its free-text response, and pipes it into a shell script that greps for the word \"approved\" to decide whether to pass or fail the build. Over several weeks, the team notices the gate is unreliable: some PRs with real critical issues still pass because Claude phrased its conclusion differently (\"this looks fine to merge\" instead of \"approved\"), and some clean PRs fail because the grep pattern doesn't match Claude's wording.",
    "question": "What is the most effective way to make the CI gate reliably reflect Claude's review verdict?",
    "options": {
      "A": "Have Claude emit a structured result (e.g., a JSON object with an explicit pass/fail field) and have the pipeline parse that field programmatically to set the build's exit status, instead of pattern-matching free-text prose.",
      "B": "Add few-shot examples to the prompt showing Claude consistently ending its review with the word \"approved\" when there are no critical issues.",
      "C": "Lower the model's temperature to make its wording more deterministic across runs.",
      "D": "Keep the free-text grep approach but have a human review Claude's output before the merge is finalized."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. A CI gate needs a deterministic, machine-parseable signal. Requiring structured output with an explicit field and using it to drive the build's exit status replaces probabilistic text-matching with programmatic enforcement, eliminating the phrasing-dependent failures.",
      "B": "Few-shot examples only raise the odds Claude uses a particular word - they still rely on probabilistic compliance with exact phrasing, which is the root cause of the flaky gate in the first place.",
      "C": "Lowering temperature may reduce wording variation somewhat, but it does not guarantee a specific parseable token appears in the output, so the underlying free-text matching problem remains.",
      "D": "Inserting a manual review step defeats the purpose of automating the gate in CI and does not fix the unreliable signal - it just papers over it with human effort on every PR."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D3.6-2a4872ea"
  },
  {
    "taskStatement": "D3.6",
    "domain": "D3",
    "scenario": "A platform team wants pull requests to receive an automated Claude Code review before a human reviewer looks at them. The pipeline runs on every PR event on a shared CI runner: Claude Code checks out the PR diff, has no memory of prior runs, and must post its findings as a PR comment, then exit so the pipeline can report success or failure to the merge gate. The team also wants the check to fail the build (blocking merge) only when Claude Code finds a genuine correctness bug, not for style nits.",
    "question": "Which CI/CD integration design correctly matches how Claude Code should be invoked in this non-interactive pipeline context?",
    "options": {
      "A": "Invoke Claude Code non-interactively per run with the diff and review instructions as input, capture its output and exit status, and have the pipeline script decide the build's pass/fail outcome based on that captured result.",
      "B": "Run Claude Code in its normal interactive mode inside the CI job so it can prompt for confirmation before deciding whether to fail the build.",
      "C": "Rely on Claude Code to remember prior PR reviews from earlier CI runs so it can compare the current diff against past feedback without the pipeline passing in any state.",
      "D": "Have Claude Code directly set the CI job's exit code and merge-gate status itself based on its own judgment of severity, without the pipeline script inspecting its output."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. CI/CD integration uses non-interactive (headless) invocation because each run is stateless; the pipeline script captures Claude Code's output and translates it into the pass/fail merge-gate decision, letting the team apply its own rule (block only on genuine bugs, not style nits).",
      "B": "CI jobs run unattended with no one to respond to prompts - interactive mode would hang the pipeline, which is exactly why non-interactive invocation is required for automation.",
      "C": "Each CI invocation is stateless and has no memory of prior runs; expecting it to recall past reviews without the pipeline supplying that context is a misunderstanding of how the integration works.",
      "D": "The pipeline script, not Claude Code itself, is responsible for owning the merge-gate decision - it must inspect the captured output/exit status rather than letting the invocation unilaterally control CI status."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D3.6-6b14dd8e"
  },
  {
    "taskStatement": "D4.1",
    "domain": "D4",
    "scenario": "A team built a Claude-based content moderation prompt that flags user-submitted product reviews for \"policy violations\" before they are published. The prompt simply says: \"Review the following text and flag it if it violates our content policy.\" In production, the flag rate is far higher than expected — the model frequently flags reviews that merely contain strong negative sentiment (\"this product is garbage\") or mention competitor brand names, neither of which actually violates the policy (which prohibits hate speech, personal attacks on named individuals, and spam links). The false-positive rate is causing legitimate reviews to be held for manual review, creating a growing backlog.",
    "question": "What is the most effective change to the prompt to reduce these false positives?",
    "options": {
      "A": "Replace the vague instruction with explicit, enumerated criteria defining exactly what counts as a violation (hate speech, personal attacks on named individuals, spam links), and explicitly state that negative sentiment or brand mentions alone do not qualify.",
      "B": "Lower the model's temperature to make its flagging decisions more consistent.",
      "C": "Add an instruction telling the model to \"be less strict\" and \"only flag serious violations.\"",
      "D": "Ask the model to output a numeric confidence score alongside its flag decision, and only route to manual review when confidence is high."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. The root cause is that \"violates content policy\" is undefined, so the model is left to guess the boundary and defaults to over-flagging anything negative-sounding. Enumerating the specific violation categories and explicitly excluding sentiment/brand mentions gives the model concrete, checkable criteria, directly targeting the false-positive cause.",
      "B": "Temperature affects output randomness, not the model's understanding of what the policy covers. It would not stop the model from flagging sentiment or brand mentions it wrongly believes are violations.",
      "C": "A vague directive to \"be less strict\" is just another ambiguous instruction - it doesn't tell the model which specific categories matter, so it doesn't reliably fix the precision problem and could unpredictably suppress real violations too.",
      "D": "Confidence scoring adds a routing mechanism on top of the same underlying ambiguity; if the model's concept of \"violation\" is wrong, its confidence in that wrong judgment doesn't help distinguish true from false positives."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.1-60f6a282"
  },
  {
    "taskStatement": "D4.1",
    "domain": "D4",
    "scenario": "A structured data extraction pipeline uses Claude to pull \"adverse event severity\" from clinical trial intake forms, classifying each as MILD, MODERATE, or SEVERE for downstream reporting to a safety database. The current prompt simply says: \"Extract the adverse event severity from the form text.\" Audit results show the model frequently labels ambiguous cases as SEVERE (e.g., a patient reporting \"some discomfort\" is flagged SEVERE), triggering unnecessary safety escalations and a manual review backlog. The team has confirmed the source documents are not the problem — the same ambiguous phrasing is handled correctly and consistently by human reviewers who use a written severity rubric.",
    "question": "What change to the prompt would most directly reduce these false-positive SEVERE classifications?",
    "options": {
      "A": "Replace the vague instruction with explicit criteria defining what qualifies as MILD, MODERATE, and SEVERE (drawn from the human rubric), and instruct the model to select the level supported by explicit textual evidence, flagging genuinely ambiguous cases as \"needs review\" rather than defaulting to SEVERE.",
      "B": "Lower the model's temperature to 0 so that classifications become more deterministic and repeatable across runs.",
      "C": "Instruct the model to always err on the side of caution and classify ambiguous cases as SEVERE, since under-flagging a true adverse event is costlier than an unnecessary escalation.",
      "D": "Add one few-shot example showing a clear-cut SEVERE case so the model has a concrete pattern to match against."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. The root cause is that the prompt supplies no explicit decision criteria, so the model is guessing at a boundary that humans apply consistently via a written rubric. Encoding that rubric's explicit criteria, tied to an evidence requirement and a defined fallback for ambiguity, directly targets the source of the false positives.",
      "B": "Temperature affects randomness in token sampling, not the model's understanding of what distinguishes severity levels - it would not fix a classification bias rooted in missing criteria, only make the same biased behavior more repeatable.",
      "C": "This hard-codes the exact failure mode the audit is complaining about - it institutionalizes over-flagging of ambiguous cases as SEVERE instead of giving the model criteria to distinguish genuine severe cases from ambiguous ones.",
      "D": "A single example of an unambiguous SEVERE case does nothing to teach the model where the boundary lies for ambiguous cases, which is precisely where the errors are occurring."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.1-848b300b"
  },
  {
    "taskStatement": "D4.1",
    "domain": "D4",
    "scenario": "A support triage system uses Claude to read incoming tickets and flag those that need immediate escalation to on-call engineers. The current prompt simply says: \"Read the ticket and flag it as urgent if it seems important.\" In production, 38% of tickets are flagged urgent, but a manual audit finds that only about 9% actually warrant escalation — tickets like \"my dashboard font looks slightly off\" are being flagged alongside genuine outages, overwhelming the on-call rotation with false positives.",
    "question": "What is the most effective change to the prompt to reduce these false positives?",
    "options": {
      "A": "Replace \"seems important\" with explicit, objective criteria defining urgency (e.g., active service outage, data loss, security incident, or revenue-impacting bug affecting multiple customers), paired with examples of tickets that look severe but should NOT be flagged.",
      "B": "Lower the model's temperature setting so that classification decisions become more deterministic and consistent across similar tickets.",
      "C": "Add several few-shot examples of correctly flagged urgent tickets, without changing the underlying instruction text.",
      "D": "Change the instruction to \"only flag a ticket as urgent if you are very confident it truly needs escalation.\""
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. The root cause is that \"seems important\" is subjective, leaving the definition of urgency to the model's guesswork. Explicit, objective criteria plus counter-examples of severe-looking but non-urgent tickets give the model a concrete boundary to apply, directly reducing false positives.",
      "B": "Temperature affects sampling randomness, not the model's understanding of what \"urgent\" means. It would make the same ambiguous judgment more repeatable, not more accurate, so false positives would persist.",
      "C": "Few-shot examples of only correctly flagged urgent tickets show what urgent looks like but don't establish the boundary against tickets that look severe but aren't - the ambiguous criteria remain the root problem.",
      "D": "Asking the model to be \"very confident\" adds a vague qualitative hedge rather than concrete criteria, so it still relies on the model's own undefined notion of importance and does not reliably reduce false positives."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.1-14a6914e"
  },
  {
    "taskStatement": "D4.2",
    "domain": "D4",
    "scenario": "A structured data extraction pipeline uses Claude to pull line items (product code, quantity, unit price, discount) from vendor invoices and emit JSON consumed directly by an accounting system. The zero-shot prompt with a JSON schema works well for simple single-line invoices, but on invoices with multi-line discounts, bundled products, or handwritten annotations, the model inconsistently applies discounts at the line level versus the invoice total level, and sometimes omits the discount field entirely rather than setting it to zero.",
    "question": "What is the most effective change to improve consistency on these edge cases?",
    "options": {
      "A": "Add 3-5 few-shot examples in the prompt that show fully worked input-output pairs covering the ambiguous cases (multi-line discounts, bundles, discount = 0), demonstrating the exact field-level convention to apply.",
      "B": "Lower the temperature to 0 so the model produces more deterministic output across invoices.",
      "C": "Rewrite the system prompt with a longer, more detailed natural-language explanation of how discounts should be allocated across line items.",
      "D": "Add a JSON schema field description clarifying that discount is a required numeric field."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Few-shot examples that concretely demonstrate the desired input-output behavior on the specific ambiguous cases teach the model the exact convention (e.g., always populate discount, allocate at line level) far more reliably than abstract instructions, directly improving consistency on the edge cases causing errors.",
      "B": "Temperature affects randomness in token sampling, not the model's underlying interpretation of ambiguous business logic - it would not resolve inconsistent discount allocation or missing fields caused by an underspecified task.",
      "C": "More prose instructions describing the desired behavior in the abstract are less effective than concrete worked examples at conveying an exact convention, and risk adding ambiguity rather than resolving it.",
      "D": "Schema validation can enforce that a field is present and numeric, but it cannot teach the model which allocation convention to use or guarantee the model fills the field with the semantically correct value rather than a placeholder."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.2-31b7b4e4"
  },
  {
    "taskStatement": "D4.3",
    "domain": "D4",
    "scenario": "A finance team built a pipeline that extracts vendor name, invoice amount, due date, and line items from scanned PDF invoices and feeds the result into an accounts-payable system that parses the response as JSON. The current prompt asks Claude to \"respond only with JSON matching this schema\" and includes the schema as text in the instructions. In production, roughly 8% of extractions fail downstream parsing because Claude prepends a short explanatory sentence before the JSON, wraps the payload in markdown code fences, or leaves trailing commentary after the closing brace.",
    "question": "What is the most effective way to eliminate these parsing failures?",
    "options": {
      "A": "Define an extraction tool whose input schema describes the required fields and types, and force the model to call it with tool_choice, so the extraction arrives as a structured tool_use block instead of free text.",
      "B": "Add several few-shot examples to the prompt showing correctly formatted JSON with no leading text, so the model learns the expected output pattern.",
      "C": "Set temperature to 0 so the model's output becomes deterministic and therefore always matches the schema.",
      "D": "Keep the current prompt-based JSON instructions, but add a post-processing step that strips leading prose and markdown fences with a regex before parsing."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Tool use with a JSON schema turns output format into a programmatically enforced contract: the extraction arrives as a structured tool_use block, never as prose - eliminating JSON syntax errors, preamble, and markdown wrapping at the source. Semantic errors (values in the wrong field, line items that don't sum) still require downstream validation.",
      "B": "Few-shot examples raise the odds of clean output, but compliance stays probabilistic - the same class of formatting failure continues at some rate.",
      "C": "Temperature affects sampling variability, not structural conformance; a deterministic model can still deterministically produce a preamble or fences.",
      "D": "Treats a structural enforcement problem as text cleanup: regex stripping is brittle against variation in fences, nested code blocks, and commentary placement, and does nothing to prevent malformed JSON itself."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.3-a74f3201"
  },
  {
    "taskStatement": "D4.4",
    "domain": "D4",
    "scenario": "A document-processing pipeline uses Claude to extract structured line-item data (SKU, quantity, unit price, total) from scanned vendor invoices into a JSON schema, which then feeds an accounts-payable system. In production, roughly 8% of extractions fail downstream: some outputs are missing required fields, some have line-item totals that don't match quantity × unit price, and a few contain SKUs that don't exist in the vendor catalog. Currently the pipeline accepts whatever Claude returns and forwards it directly to accounts payable, where mismatches surface days later as payment errors.",
    "question": "What is the most effective way to reduce the rate of bad extractions reaching accounts payable?",
    "options": {
      "A": "Add a validation stage that checks schema conformance, arithmetic consistency (quantity × unit price = total), and SKU existence against the catalog; on failure, send the document and the specific error back to Claude for a bounded number of retries before routing to human review.",
      "B": "Expand the system prompt with more detailed instructions and examples emphasizing accuracy on totals and SKUs, so Claude is less likely to make these errors on the first pass.",
      "C": "Lower the model's temperature to reduce output variance, since inconsistent field values are a sign of excessive randomness in generation.",
      "D": "Have a second Claude call independently re-extract the same invoice and simply overwrite the first result whenever the two outputs differ."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Programmatic checks (schema conformance, arithmetic consistency, catalog lookup) can deterministically catch exactly these failure modes rather than hoping the model avoids them. Feeding the specific validation error back to Claude gives it the information needed to self-correct, a bounded retry count prevents infinite loops, and routing persistent failures to human review ensures bad data never silently reaches accounts payable.",
      "B": "Prompt refinement relies on probabilistic compliance and cannot guarantee arithmetic consistency or catalog membership - it may reduce the error rate somewhat but provides no deterministic backstop, so bad extractions will still reach accounts payable undetected.",
      "C": "Misdiagnoses the problem: missing fields, arithmetic mismatches, and invalid SKUs are extraction accuracy failures, not sampling-variance artifacts, so reducing temperature would not reliably fix them and offers no way to catch the ones that still occur.",
      "D": "Running a second extraction and blindly overwriting on disagreement has no way to determine which of the two outputs (if either) is actually correct, and it still lacks any programmatic validation against the schema, arithmetic, or catalog - so invalid results can still pass through."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.4-ad1532a3"
  },
  {
    "taskStatement": "D4.4",
    "domain": "D4",
    "scenario": "A document processing pipeline uses Claude to extract structured invoice data (vendor, line items, totals, due date) from scanned PDFs into a JSON schema required by the downstream accounts-payable system. Validation against the schema currently fails on about 18% of documents — most commonly totals that don't sum from line items, dates in inconsistent formats, and missing required fields on multi-page invoices. The current implementation validates the output once and, on failure, simply re-sends the identical extraction prompt with the same document and discards the first attempt.",
    "question": "The retry success rate on the second attempt is nearly the same as the first (identical failures recur most of the time). What change would most effectively improve extraction quality on retry?",
    "options": {
      "A": "On validation failure, send a follow-up turn that includes the original output, the specific schema validation error (e.g., which field failed and why, such as \"totals field does not equal sum of line items\"), and a request to correct only that issue.",
      "B": "On validation failure, resend the same extraction prompt up to three times and accept whichever attempt passes validation first.",
      "C": "Lower the temperature to 0 for all extraction calls so retries are more likely to converge on a valid result.",
      "D": "Skip retries entirely and route every validation failure to a human reviewer queue for manual correction."
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
    "id": "D4.4-4e033f39"
  },
  {
    "taskStatement": "D4.5",
    "domain": "D4",
    "scenario": "A data engineering team uses Claude to classify and tag 200,000 support tickets each night into categories (billing, technical, account) for a downstream analytics dashboard. The dashboard is refreshed once per day at 9 AM, so the classification job only needs to finish sometime before then. The team currently sends each ticket as a separate synchronous API call, which costs roughly $4,000/month and occasionally causes the team to hit rate limits when the queue backs up.",
    "question": "What is the most effective change to reduce cost while still reliably meeting the 9 AM dashboard deadline?",
    "options": {
      "A": "Submit the 200,000 tickets as a single Message Batches API job with a custom_id per ticket, kicked off with enough lead time before 9 AM, and poll for batch completion.",
      "B": "Keep real-time synchronous calls but add exponential backoff and retry logic to handle rate limits more gracefully.",
      "C": "Switch to the Message Batches API, but submit tickets in many small batches throughout the night to guarantee low latency per batch.",
      "D": "Move the job to the Message Batches API and set a strict 30-minute timeout that falls back to real-time calls for any tickets not yet processed."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. This is a non-blocking, deadline-tolerant overnight workload, exactly the profile suited to the Message Batches API's 50% cost savings. Batch results are correlated via custom_id, so the full set of tickets can be submitted as one job with sufficient lead time and polled for completion well before the 9 AM refresh, without per-ticket real-time calls or rate-limit pressure.",
      "B": "Backoff and retry logic addresses rate-limit symptoms but does nothing to reduce the underlying per-call cost, which is the actual problem the team wants to solve.",
      "C": "Splitting into many small batches adds unnecessary complexity and operational overhead for no benefit - the workload has no per-item latency requirement, so one larger batch submitted with lead time is simpler and achieves the same cost savings.",
      "D": "A short timeout with real-time fallback reintroduces the very synchronous calls (and their cost and rate-limit issues) the switch to batching was meant to eliminate, and is unnecessary given batch jobs can be started well ahead of the non-urgent 9 AM deadline."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.5-9f5665f2"
  },
  {
    "taskStatement": "D4.5",
    "domain": "D4",
    "scenario": "A data platform team runs a structured extraction pipeline that pulls line-item details from vendor invoices using Claude, validates the output against a JSON schema, and loads it into an accounts payable system. Two categories of work feed this pipeline: (1) a nightly ingestion of roughly 8,000 archived invoices scanned from a backlog of paper records, which has no deadline beyond \"done before the next morning's finance reconciliation,\" and (2) invoices submitted through a live vendor portal that must be parsed and validated within seconds so the portal can immediately confirm receipt to the vendor. A newly hired engineer proposes routing both workloads through the Message Batches API to cut costs, since both ultimately call the same extraction prompt and schema.",
    "question": "How should this proposal be evaluated?",
    "options": {
      "A": "Route the nightly archive backlog through the Message Batches API, since it only needs to finish before the next business day, while keeping the live vendor-portal submissions on real-time API calls that return confirmation immediately.",
      "B": "Route both workloads through the Message Batches API and have the portal poll the batch status endpoint before confirming receipt to the vendor.",
      "C": "Keep both workloads on real-time calls, since batch results cannot be reliably matched back to their source invoice records.",
      "D": "Route both workloads through the Message Batches API and add a fallback that reissues any request as a real-time call if the batch has not completed within a few seconds."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. The Message Batches API offers meaningful cost savings but has processing times without a guaranteed low-latency SLA, making it well suited to the nightly backlog's overnight deadline. The vendor portal needs to confirm receipt within seconds, which requires real-time calls instead.",
      "B": "Polling a batch for a workload that must confirm receipt within seconds does not meet the portal's latency requirement - batches are not designed to complete quickly enough for that use case.",
      "C": "Reflects a misconception - batch results can be correlated back to their originating requests using custom identifiers, so matching output to source records is not a real obstacle to using batch processing where it fits.",
      "D": "A few-seconds timeout is far shorter than realistic batch processing windows, so this fallback would fire on essentially every request, making the batch routing pointless overhead for the portal workload while still failing to use batching appropriately for the backlog."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.5-7cf75b2f"
  },
  {
    "taskStatement": "D4.5",
    "domain": "D4",
    "scenario": "A financial services company extracts structured data (income, employment history, debt ratios) from roughly 40,000 scanned loan application PDFs each month, feeding the JSON output into an underwriting system for review by analysts the following business day. The team's current pipeline sends each document as a synchronous real-time API call, looping through the batch sequentially. This regularly trips rate limits, requires manual retry logic, and the per-request pricing has become the largest line item in the pipeline's operating budget. No part of this workflow blocks a user-facing action or requires sub-minute turnaround.",
    "question": "What is the most effective change to this pipeline's processing strategy?",
    "options": {
      "A": "Submit the documents through the Message Batches API, assigning each request a custom_id to correlate extracted output back to its source document once the batch completes.",
      "B": "Keep the synchronous real-time calls but add exponential backoff and retry logic to handle rate-limit errors more gracefully.",
      "C": "Submit the documents through the Message Batches API, but poll the batch status every few seconds so analysts can start reviewing extracted records as soon as possible.",
      "D": "Add prompt caching for the shared extraction instructions on the existing real-time calls to reduce token costs without changing the request pattern."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. The workload is high-volume with no real-time latency requirement, which is exactly the profile the Message Batches API is designed for, and its cost savings directly addresses the budget problem. custom_id fields let each result be correlated back to its source document, so results can be matched up regardless of the order they complete in.",
      "B": "Treats the symptom (rate-limit errors) rather than the root cause. It keeps per-request real-time pricing and captures none of the batch cost savings, while the underlying workload still has no need for real-time processing.",
      "C": "Misunderstands the Message Batches API's operating model - it is designed for asynchronous completion, not sub-minute turnaround, and next-business-day review does not require frequent status polling. Aggressive polling adds unnecessary overhead without changing when results are actually ready.",
      "D": "Prompt caching can reduce token costs but is a separate lever from request pattern; it does not resolve the rate-limit issues or capture the larger savings available from batching a workload that has no real-time requirement."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.5-84ff6580"
  },
  {
    "taskStatement": "D4.6",
    "domain": "D4",
    "scenario": "A legal-tech company uses Claude to extract indemnification, liability-cap, and termination clauses from 80-page vendor contracts into a structured JSON schema that feeds a downstream contract database. A single-pass review over the full contract text reliably catches clauses in the main body but misses clauses embedded in appendices and exhibits, and produces inconsistent extractions when a clause in the body is modified or superseded by language in a later exhibit - sometimes the original body clause is extracted, sometimes the exhibit override, and occasionally both are returned as conflicting entries with no indication of which governs.",
    "question": "How should the review architecture be redesigned to address these failures?",
    "options": {
      "A": "Run per-section passes (body, appendices, exhibits) for local clause extraction, followed by a separate reconciliation pass that resolves cross-references and determines which of any conflicting clauses governs.",
      "B": "Run three independent full-document extraction passes and keep only the clauses that appear identically in at least two of the three outputs.",
      "C": "Switch to a model with a larger context window so the entire contract, including appendices and exhibits, can be processed in a single pass.",
      "D": "Keep the single full-document pass but instruct it to flag any clause it is uncertain about, leaving conflict resolution to the downstream contract database."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Splitting by section prevents attention dilution across a long document so appendix and exhibit clauses are no longer missed, and a dedicated reconciliation pass is needed because determining which of two conflicting clauses governs requires comparing outputs across sections - something no single per-section pass can do on its own.",
      "B": "Majority voting across identical full-document passes would suppress the exhibit-override clauses precisely because they appear inconsistently - the real signal (a conflict that needs resolving) looks like noise to a voting scheme and gets discarded rather than resolved.",
      "C": "Misdiagnoses the problem as a context-capacity limitation. The scenario shows the failure is inconsistent attention and unresolved cross-references, not that the document doesn't fit in context - a bigger window does not add a reconciliation step.",
      "D": "Pushes a task that requires document understanding (deciding which clause legally governs) onto a downstream system that only has the flagged output, not the contract structure needed to adjudicate the conflict."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.6-5ea3be8b"
  },
  {
    "taskStatement": "D4.6",
    "domain": "D4",
    "scenario": "A structured data extraction pipeline uses Claude to pull line items, subtotals, and vendor tax IDs from scanned vendor invoices before loading them into an accounts-payable system. A single-pass extraction prompt performs well on simple one-page invoices, but on multi-page invoices with itemized tables spanning several pages, per-page subtotals, and handwritten annotations, the model frequently drops line items from page 2 onward, miscomputes the grand total, and occasionally hallucinates a tax ID when the field is illegible. Accuracy on these complex multi-page invoices is around 61%, well below the 95% threshold required for automated downstream posting.",
    "question": "Which architecture change would most effectively raise extraction reliability on the complex multi-page invoices?",
    "options": {
      "A": "Run three independent full-document extraction passes and accept only field values that appear identically in at least two of the three outputs.",
      "B": "Split extraction into a per-page pass that captures line items and subtotals from each page independently, followed by a separate aggregation pass that sums subtotals and reconciles the grand total and tax ID against the assembled per-page data.",
      "C": "Keep the single-pass design but lengthen the prompt with more detailed field-by-field extraction instructions and additional few-shot examples of correctly extracted invoices.",
      "D": "Replace the single Claude call with a larger-context-window model so the entire multi-page invoice, including annotations, fits comfortably within the context limit in one pass."
    },
    "correct": "B",
    "explanations": {
      "A": "Majority voting across full-document passes does not fix the underlying issue: attention dilution across a long, table-heavy document tends to produce the same kind of errors (dropped page-2 items, hallucinated illegible fields) in each independent run, so consensus can still converge on an incomplete or wrong answer while tripling cost.",
      "B": "Correct. Per-page passes reduce the amount of content each call must attend to, addressing the attention dilution causing dropped line items and hallucinated fields, while a dedicated aggregation pass handles the cross-page reconciliation (summing subtotals, computing the grand total, resolving the tax ID) that a single page-level pass cannot see on its own.",
      "C": "More detailed instructions and few-shot examples rely on the model correctly attending to every item across a long, complex document in a single pass - they do not address the root cause of dropped items and miscomputed totals on multi-page inputs.",
      "D": "Misdiagnoses the problem as a context-capacity limitation rather than attention dilution and error accumulation over a long, complex, table-heavy input; fitting more content into one pass does not prevent the model from missing items or hallucinating illegible fields."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.6-3d2e3465"
  },
  {
    "taskStatement": "D4.6",
    "domain": "D4",
    "scenario": "A security team uses Claude to review a 40-file pull request that touches authentication, database access, and third-party dependency updates before it can merge to production. Their current process runs one review pass over the entire diff with a general prompt asking Claude to \"check for security vulnerabilities.\" Post-merge incident analysis shows the reviews consistently miss the same categories of issues (a SQL injection pattern repeated across five files, a hardcoded secret in a config file, an outdated dependency with a known CVE) even though the issues that are found are usually accurate.",
    "question": "The team wants to restructure the review to catch more of these missed vulnerability categories without suppressing the valid findings the current process already produces. Which architecture should they adopt?",
    "options": {
      "A": "Run the same full-diff security review prompt three independent times and only surface an issue if it is flagged in at least two of the three runs.",
      "B": "Run separate review passes each scoped to a distinct vulnerability category (e.g., injection flaws, authentication/authorization, secrets exposure, dependency risk), then merge the findings across passes.",
      "C": "Keep a single review pass over the full diff but raise the model's temperature to encourage it to surface a more diverse set of issues in that one pass.",
      "D": "Split the review into one pass per file across all 40 files, with each pass using the same general \"check for security vulnerabilities\" instruction."
    },
    "correct": "B",
    "explanations": {
      "A": "Requiring agreement across identical runs suppresses genuine findings instead of catching more of them - identical passes tend to share the same blind spots, so consensus filtering discards true positives that only one run happens to catch, worsening the exact problem the team is trying to fix.",
      "B": "Correct. Scoping each pass to a distinct vulnerability category narrows what that pass has to attend to, reducing the attention dilution that caused the single general pass to miss cross-cutting issues like a repeated injection pattern or a stray secret. Merging findings across category-focused passes catches issues a single broad pass, or passes split only by file, would overlook.",
      "C": "Raising temperature does not address attention dilution across a large diff; it only makes a single pass's output less consistent without systematically expanding what categories of issues get checked.",
      "D": "Per-file passes can help with issues local to one file, but the missed issues here are cross-cutting (an injection pattern repeated across five files, a dependency-wide CVE) - splitting by file with the same generic instruction does not give any pass a focused lens for these categories."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.6-1f937824"
  },
  {
    "taskStatement": "D5.1",
    "domain": "D5",
    "scenario": "A customer support agent handles a single chat session that runs for over 200 turns as it walks a customer through a complex billing dispute. In turn 4, the customer states they are on a grandfathered legacy pricing plan with a contractual 48-hour SLA for refunds. By turn 150, the raw conversation history has grown large enough that the platform's context window management has begun dropping or summarizing the oldest turns to stay within limits. The agent then proposes a resolution that applies standard (non-legacy) pricing rules and quotes the standard 5-day refund timeline, contradicting facts established early in the conversation.",
    "question": "What is the most effective way to prevent this loss of critical information across the long conversation?",
    "options": {
      "A": "Maintain an explicit, periodically-updated summary or structured state object containing critical facts (e.g., plan type, SLA terms), and re-inject it into context so it survives truncation or summarization of the raw turn history.",
      "B": "Increase the max_tokens parameter on each API call so the model can generate longer responses.",
      "C": "Rely on the platform's default automatic context summarization to retain whatever information is most relevant as the conversation grows.",
      "D": "Add a single reminder in the initial system prompt instructing the agent to remember the customer's plan type and SLA for the rest of the conversation."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Explicitly extracting and persisting critical facts into a structured, periodically-refreshed summary ensures they remain available regardless of how the raw transcript is truncated or compressed as the conversation grows.",
      "B": "max_tokens controls the length of a single generated response, not how much prior conversation context is retained - it does not address information loss from truncation or summarization.",
      "C": "Default automatic summarization is lossy and not guaranteed to prioritize the specific critical details (like a one-off contractual SLA) that matter for this case - it caused the problem in the first place.",
      "D": "A one-time instruction at the start of a long conversation is a probabilistic approach; as the conversation grows and earlier turns are truncated or de-prioritized, there is no guarantee the model retains or re-applies that early reminder."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.1-29c66f9b"
  },
  {
    "taskStatement": "D5.2",
    "domain": "D5",
    "scenario": "A structured data extraction pipeline processes 10,000 commercial lease contracts per day, extracting fields (rent amount, renewal terms, termination date, indemnification clauses) into a JSON schema for a lease-management system. The agent has a flag_for_review field it can set when it cannot confidently populate a value. Audit logs show two failure patterns: contracts using unfamiliar but valid boilerplate (e.g., an indemnification clause worded differently than the training examples but semantically standard) are flagged for review at a high rate, burying the human review queue in false positives. Meanwhile, contracts with genuine internal conflicts - such as a termination date stated as \"March 1\" in the summary section but \"March 31\" in the body - are extracted and passed downstream without any flag, silently choosing one value over the other.",
    "question": "What is the most effective way to fix the agent's escalation calibration?",
    "options": {
      "A": "Add explicit escalation criteria to the extraction prompt that distinguish genuine data conflicts (contradictory values for the same field within a document) from merely unfamiliar phrasing of a standard clause, with few-shot examples of each category.",
      "B": "Have the agent assign a numeric self-reported confidence score to each extracted field and escalate any field scoring below a fixed threshold.",
      "C": "Train a separate classifier on past human review decisions to pre-filter which contracts are routed to the extraction agent versus straight to human review.",
      "D": "Lower the overall sensitivity of the flag_for_review logic so fewer contracts are escalated, reducing reviewer workload."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. The root cause is an undefined decision boundary - the agent has no criteria to distinguish 'novel phrasing of a known concept' from 'actual conflicting data.' Explicit criteria plus few-shot examples of each category directly target this, the same low-effort, high-leverage fix as clarifying any other ambiguous decision boundary in a prompt.",
      "B": "LLM self-reported confidence is poorly calibrated - the agent is already confidently wrong on the conflicting-date cases, so a self-reported score would not reliably catch what it currently misses, and would not fix why unfamiliar-but-valid phrasing gets over-flagged.",
      "C": "Over-engineered as a first step. It also does not address the underlying issue: the extraction agent itself lacks criteria for what counts as ambiguous, so a pre-filter trained on the same noisy signal would inherit the same miscalibration.",
      "D": "Misdiagnoses the problem as one of overall sensitivity rather than criteria. Uniformly lowering sensitivity would reduce false positives on unfamiliar phrasing but worsen the more serious failure - genuine conflicts like the mismatched termination dates already going undetected."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.2-3b0e23b5"
  },
  {
    "taskStatement": "D5.3",
    "domain": "D5",
    "scenario": "A multi-agent customer support system has a coordinator that delegates billing questions to a billing subagent, which calls an external payment-processor tool. That tool sometimes fails with a transient timeout (the request can simply be retried) and sometimes fails with a permanent \"account not found\" error (retrying will never succeed and the case needs a human). Currently the billing subagent catches every failure the same way and returns the string \"Sorry, I couldn't process that\" to the coordinator.",
    "question": "Because the coordinator receives identical, unstructured error text for both failure types, it cannot decide whether to retry or escalate, so it currently just relays a generic apology to the customer in both cases. What is the most effective way to fix the error propagation between the billing subagent and the coordinator?",
    "options": {
      "A": "Have the billing subagent return structured error information that categorizes each failure as transient/retryable or permanent/non-retryable, so the coordinator can retry transient failures and escalate permanent ones appropriately.",
      "B": "Wrap the payment-processor tool call in a fixed retry loop that automatically retries every failure up to three times before giving up.",
      "C": "Have the billing subagent retry internally without ever informing the coordinator, and only report back a final success or failure.",
      "D": "Update the billing subagent's system prompt to instruct it to phrase error messages to the customer more empathetically."
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
    "id": "D5.3-6f1da2f8"
  },
  {
    "taskStatement": "D5.2",
    "domain": "D5",
    "scenario": "An SRE team deploys a Claude Agent SDK-based incident-response agent with MCP tools query_metrics, restart_service, scale_replicas, and page_oncall. The agent is meant to handle routine remediation autonomously and page a human for anything with material blast radius. After a month in production, logs show the opposite pattern: the agent pages on-call engineers at 2 a.m. for well-understood, low-risk issues (e.g., a single pod restart loop with a known fix already documented in the runbook), while for an actual incident — a primary database connection pool exhausting during a traffic spike — it autonomously ran scale_replicas and restart_service against the production database tier without paging anyone, causing a brief but customer-visible outage.",
    "question": "What is the most effective way to fix the agent's escalation calibration?",
    "options": {
      "A": "Replace human paging with a self-reported confidence score (1-10) from the agent, routing to on-call only when confidence falls below a set threshold.",
      "B": "Define explicit escalation criteria in the system prompt, grounded in the blast radius and reversibility of the action rather than symptom type, with few-shot examples distinguishing routine pre-approved fixes from actions on shared production infrastructure that require paging first.",
      "C": "Train a separate classifier on historical incident tickets to predict whether a given alert should be auto-remediated or escalated.",
      "D": "Remove restart_service and scale_replicas from the agent's toolset entirely, so all remediation requires a human to act."
    },
    "correct": "B",
    "explanations": {
      "A": "LLM self-reported confidence is poorly calibrated - the agent was confidently wrong on the highest-stakes case (the database incident), so a confidence gate would not have caught it.",
      "B": "Correct. The root cause is unclear decision boundaries: the agent is escalating based on symptom familiarity rather than the actual risk of the action it is about to take. Explicit criteria tied to blast radius/reversibility, reinforced with few-shot examples, is the proportionate first step to recalibrate when to escalate.",
      "C": "Over-engineered before simpler prompt-level fixes have been tried, and still doesn't address that the agent is reasoning about the wrong signal (symptom type instead of action risk).",
      "D": "Solves the immediate danger but is disproportionate - it eliminates all autonomous remediation, including the routine low-risk cases the agent should legitimately handle, rather than fixing the miscalibrated escalation logic."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.2-240d6e43"
  },
  {
    "taskStatement": "D5.3",
    "domain": "D5",
    "scenario": "A structured data extraction pipeline processes scanned insurance claim forms through three agents: an extraction agent parses each PDF into JSON fields (policy_number, claim_amount, incident_date), a validation agent checks the JSON against a schema, and an integration agent submits validated claims to the downstream claims-processing system. When the extraction agent cannot confidently read a field - for example, a smudged or handwritten policy number - it currently substitutes an empty string rather than signaling a problem. Because the schema does not require policy_number to be non-empty, the validation agent lets these records pass through unchanged, and the integration agent submits claims with blank policy numbers. Days later, hundreds of claims are found rejected or misassigned to the wrong policyholder, even though every agent in the pipeline reported success at the time.",
    "question": "What is the most effective way to fix the error propagation strategy across this pipeline?",
    "options": {
      "A": "Have the extraction agent emit a structured error object identifying which field failed and why (e.g., \"policy_number: extraction_failed - illegible\") instead of silently substituting an empty string, so downstream agents can distinguish a genuine failure from a legitimately empty field and branch accordingly.",
      "B": "Have the integration agent add defensive null-checks immediately before submission, rejecting any claim whose critical fields are missing.",
      "C": "Increase the extraction agent's retry count and add exponential backoff so it makes more attempts before returning a result.",
      "D": "Update the extraction agent's system prompt to instruct it to leave fields blank when it cannot confidently extract them, and to mention any low-confidence fields in a prose summary at the end of its response."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. The root cause is that a real failure (illegible field) is indistinguishable from a legitimate value once it becomes a silent empty string. A structured, explicit error signal preserves that distinction as the result moves between agents, letting the validation and integration agents make correct, deterministic decisions instead of inheriting an ambiguous default.",
      "B": "Only catches the symptom at the last stage, after the validation agent has already been misled into approving the record. It does not fix the propagation problem for any other consumer of the extraction agent's output, and provides no context about why the field is missing.",
      "C": "Retries address transient failures (e.g., a flaky OCR call), not a genuinely illegible field. Retrying more times will not produce a correct policy number and does nothing to communicate the failure to downstream agents.",
      "D": "Still relies on probabilistic compliance and buries the error signal in unstructured prose that downstream agents are not guaranteed to parse or act on, rather than propagating it as a structured, checkable condition."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.3-069c4642"
  },
  {
    "taskStatement": "D5.4",
    "domain": "D5",
    "scenario": "A developer asks Claude Code to explain how authentication and session handling work across a 15-year-old monolith with over 6,000 files, most of which are unrelated to auth. The first attempt has Claude read files sequentially starting from the repository root, and it runs out of context budget partway through the services/ directory without ever reaching the auth/ or middleware/ folders where the relevant logic actually lives.",
    "question": "What is the most effective way to restructure this exploration so Claude reliably finds and explains the relevant auth logic?",
    "options": {
      "A": "First use Glob/Grep to locate files and directories matching auth-related terms (e.g., \"session\", \"login\", \"authenticate\"), then Read only the specific files or code sections those searches surface, expanding scope only as needed.",
      "B": "Switch to a model with a larger context window so the entire 6,000-file repository can be loaded in one pass.",
      "C": "Have Claude read every file in the repository sequentially but summarize each file immediately after reading it to keep prior context small.",
      "D": "Spawn one subagent that reads the entire repository in a single pass and returns a full summary, avoiding grep since keyword search might miss relevant files."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Targeted search tools (Glob/Grep) narrow exploration to relevant files before spending context on Read, letting Claude reach the actual auth/middleware code instead of exhausting its context budget on unrelated directories encountered first.",
      "B": "A bigger window doesn't fix the root inefficiency - reading thousands of irrelevant files still wastes context and attention on content unrelated to the question, and the relevant files may still be reached too late or at the cost of a much more expensive call.",
      "C": "Still requires reading the full content of every file at least once, which is unnecessary and slow when the relevant code is confined to a few directories; summarizing after the fact doesn't solve the problem of not finding the right files first.",
      "D": "Discards the fastest way to narrow scope (search) in favor of brute-force reading, and having a single agent read the entire repository in one pass reintroduces the same context-budget exhaustion problem the scenario describes, just inside a subagent instead."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.4-0db584d8"
  },
  {
    "taskStatement": "D5.5",
    "domain": "D5",
    "scenario": "A logistics company uses Claude to extract structured fields (SKU, quantity, unit price, delivery date) from photographed supplier packing slips into JSON records that feed their ERP system. To limit manual review load, the pipeline has Claude emit a self-reported confidence score (1-100) alongside each extraction, and anything below 70 is routed to a human review queue while everything else auto-posts to the ERP.\n\nA quarterly audit finds that overpayments from bad data are concentrated in extractions where Claude reported confidence above 90. Nearly all of these involve packing slips with handwritten quantity corrections or non-standard units of measure (e.g., \"cs\" vs \"case,\" or a quantity written over a crossed-out printed value) - cases where the model's output looked structurally complete and well-formed, but the underlying values were wrong.",
    "question": "What change would most effectively fix the confidence calibration problem driving these overpayments?",
    "options": {
      "A": "Replace the self-reported confidence score with a programmatic risk score built from objective signals - schema/field-completeness validation, detection of handwritten annotations, and unit-of-measure normalization failures - and route to human review based on that score.",
      "B": "Lower the auto-post threshold from 70 to 50 so more extractions are routed to human review.",
      "C": "Add few-shot examples to the prompt showing Claude assigning lower confidence scores when a packing slip contains handwritten corrections.",
      "D": "Have a second Claude call independently re-score the confidence of each extraction, and route to human review only when the two self-reported scores disagree by more than 20 points."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. The root problem is that the routing signal (LLM self-reported confidence) doesn't correlate with actual accuracy - it's high precisely on the cases with hidden risk factors like handwriting and nonstandard units. Grounding routing in objective, checkable signals rather than the model's probabilistic self-assessment gives a reliable trigger for exactly the failure modes observed.",
      "B": "Shifts the threshold but keeps relying on the same uncalibrated metric; the overpayment cases were already scoring above 90, well above even a lowered cutoff, so this does not catch them.",
      "C": "Still relies on self-reported confidence, which is a probabilistic behavior the model may not reliably reproduce across varied real-world slip formats - it doesn't fix the underlying calibration problem.",
      "D": "Still uses self-reported confidence as the underlying signal; two LLM calls are likely to share the same blind spots (e.g., both missing that a value was overwritten by hand), so agreement between them doesn't indicate correctness."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.5-17f664e7"
  },
  {
    "taskStatement": "D5.6",
    "domain": "D5",
    "scenario": "A structured data extraction pipeline builds a medication reconciliation record for a hospital's care coordination system. For each patient, Claude extracts medication names and dosages from three sources: the hospital EHR export, an OCR'd scanned discharge summary, and a faxed pharmacy record. For one patient, the EHR lists a medication dose as 10mg while the discharge summary lists the same medication at 20mg; the faxed pharmacy record is illegible for that field. The pipeline must emit a single JSON object per medication for downstream ingestion, and the care team relies on this output to decide what to administer.",
    "question": "How should the extraction pipeline handle this dosage discrepancy in its JSON output?",
    "options": {
      "A": "Emit a record for the medication that includes both conflicting dosage values, tags each with its source document, and sets a needs_review flag so the discrepancy is surfaced to a human rather than silently resolved.",
      "B": "Emit a single dosage value taken from whichever source document has the most recent timestamp, since the newer record is more likely to reflect the current prescription.",
      "C": "Emit a single dosage value taken from the EHR export by default, since it is the institution's system of record and should always take precedence over other document types.",
      "D": "Have Claude reason about which dosage is more clinically plausible for the medication in question and emit that single value, since the downstream schema only has room for one dosage field."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. When sources genuinely conflict on a high-stakes field, the pipeline should preserve provenance (which source reported which value) and flag the conflict explicitly rather than collapsing it into a single silent value. This lets a human resolve the discrepancy instead of the system guessing, which matters most when a wrong guess could affect patient safety.",
      "B": "Recency is a plausible-sounding tiebreaker, but applying it automatically silently discards the conflict and the provenance information - the downstream system sees one clean value with no indication that the sources disagreed at all.",
      "C": "Always trusting one source type by default may be reasonable as a tiebreaker in low-stakes cases, but applying it unconditionally here again hides the conflict from the people who need to know it exists, rather than surfacing it for review.",
      "D": "This asks Claude to resolve a factual conflict between source documents using general plausibility reasoning rather than the actual source data, and it discards provenance entirely - the schema constraint (one dosage field) should be solved by adding structure for conflicts, not by forcing a guess."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.6-3656904e"
  },
  {
    "taskStatement": "D1.7",
    "domain": "D1",
    "scenario": "A structured-data-extraction service uses the Claude Agent SDK to pull line items, coverage limits, and exclusions from insurance claim PDFs into a JSON schema for a downstream claims system. Each claim runs through a multi-step session: the agent reads the PDF, extracts candidate fields, and cross-checks them against policy tables. For roughly 10% of claims, one clause is genuinely ambiguous (e.g., a coverage limit that could be read as either a per-incident or an aggregate cap), and the team wants to try two different extraction strategies on that clause to see which one produces output that validates cleanly against the JSON schema and downstream reconciliation rules.",
    "question": "The team wants to test both extraction strategies on the ambiguous clause without letting a failed attempt contaminate the reasoning that carries forward into the rest of the claim's processing. What is the best way to structure this?",
    "options": {
      "A": "At the point where the ambiguity is detected, fork the session into two independent branches, run each strategy to completion, then continue the workflow only from the branch whose output passes schema validation, discarding the other branch's transcript.",
      "B": "Have the agent try the first strategy, then in the same session try the second strategy as a follow-up turn, and instruct it via the system prompt to disregard the first attempt when producing final output.",
      "C": "Restart the session from the beginning for each strategy so that every attempt starts from a clean, unbiased state.",
      "D": "After each claim, write the full transcript to a file, then reload that file as the starting point for a fresh session each time a new strategy needs to be attempted."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Forking the session at the checkpoint preserves the exploration already completed up to that point while giving each strategy its own isolated continuation, so neither branch's reasoning or tool output leaks into the other. The workflow then keeps only the winning branch's state and cleanly drops the rest.",
      "B": "Both attempts remain in the same context history, so the model's later reasoning is still exposed to the discarded attempt. Relying on an instruction to 'disregard' it is probabilistic compliance, not a guarantee of isolation.",
      "C": "Restarting from scratch throws away the exploration work already done before the ambiguous clause was reached, which is unnecessary - only the point of divergence needs to branch, not the entire session.",
      "D": "This manually reimplements forking through file save/reload, adding operational overhead and failure points without providing anything a native fork wouldn't provide directly."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D1.7-a8e5f669"
  },
  {
    "taskStatement": "D3.2",
    "domain": "D3",
    "scenario": "You want to create a custom /review slash command that runs your team's standard code review checklist. This command should be available to every developer when they clone or pull the repository.",
    "question": "Where should you create this command file?",
    "options": {
      "A": "In the .claude/commands/ directory in the project repository.",
      "B": "In ~/.claude/commands/ in each developer's home directory.",
      "C": "In the CLAUDE.md file at the project root.",
      "D": "In a .claude/config.json file with a commands array."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Project-scoped custom slash commands are stored in the .claude/commands/ directory within the repository - version-controlled and automatically available to all developers when they clone or pull the repo.",
      "B": "~/.claude/commands/ is for personal commands that are not shared via version control.",
      "C": "CLAUDE.md is for project instructions and context, not command definitions.",
      "D": "Describes a configuration mechanism that does not exist in Claude Code."
    },
    "provenance": {
      "source": "official-sample",
      "model": null,
      "generatedAt": null,
      "reviewed": true
    },
    "id": "D3.2-482ddb44"
  },
  {
    "taskStatement": "D5.3",
    "domain": "D5",
    "scenario": "The web search subagent times out while researching a complex topic. You need to design how this failure information flows back to the coordinator agent.",
    "question": "Which error propagation approach best enables intelligent recovery?",
    "options": {
      "A": "Return structured error context to the coordinator including the failure type, the attempted query, any partial results, and potential alternative approaches.",
      "B": "Implement automatic retry logic with exponential backoff within the subagent, returning a generic \"search unavailable\" status only after all retries are exhausted.",
      "C": "Catch the timeout within the subagent and return an empty result set marked as successful.",
      "D": "Propagate the timeout exception directly to a top-level handler that terminates the entire research workflow."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Structured error context gives the coordinator the information it needs to make intelligent recovery decisions - whether to retry with a modified query, try an alternative approach, or proceed with partial results.",
      "B": "A generic status hides valuable context from the coordinator, preventing informed decisions.",
      "C": "Suppresses the error by marking failure as success, which prevents any recovery and risks incomplete research outputs.",
      "D": "Terminates the entire workflow unnecessarily when recovery strategies could succeed."
    },
    "provenance": {
      "source": "official-sample",
      "model": null,
      "generatedAt": null,
      "reviewed": true
    },
    "id": "D5.3-4fb5b88b"
  },
  {
    "taskStatement": "D3.6",
    "domain": "D3",
    "scenario": "Your pipeline script runs claude \"Analyze this pull request for security issues\" but the job hangs indefinitely. Logs indicate Claude Code is waiting for interactive input.",
    "question": "What's the correct approach to run Claude Code in an automated pipeline?",
    "options": {
      "A": "Add the -p flag: claude -p \"Analyze this pull request for security issues\".",
      "B": "Set the environment variable CLAUDE_HEADLESS=true before running the command.",
      "C": "Redirect stdin from /dev/null: claude \"Analyze this pull request for security issues\" < /dev/null.",
      "D": "Add the --batch flag: claude --batch \"Analyze this pull request for security issues\"."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. The -p (or --print) flag is the documented way to run Claude Code in non-interactive mode. It processes the prompt, outputs the result to stdout, and exits without waiting for user input - exactly what CI/CD pipelines require.",
      "B": "References a non-existent feature: there is no CLAUDE_HEADLESS environment variable.",
      "C": "A Unix workaround that does not properly address Claude Code's command syntax for non-interactive runs.",
      "D": "References a non-existent feature: there is no --batch flag."
    },
    "provenance": {
      "source": "official-sample",
      "model": null,
      "generatedAt": null,
      "reviewed": true
    },
    "id": "D3.6-1082288f"
  },
  {
    "taskStatement": "D2.5",
    "domain": "D2",
    "scenario": "A developer is using Claude Code to fix a single incorrect timeout value in a 300-line `config/production.yaml` file that also contains dozens of other service settings, inline comments explaining historical incidents, and precise indentation that downstream deployment tooling depends on. The developer asks Claude Code to change `request_timeout_ms: 3000` to `request_timeout_ms: 8000` and nothing else.",
    "question": "Which approach best accomplishes this change while minimizing risk to the rest of the file?",
    "options": {
      "A": "Use Bash with a `sed -i` command to substitute the value in place, since it avoids invoking the model's file tools entirely.",
      "B": "Use Write to regenerate the entire file with the corrected value, reconstructing the other settings and comments from what Claude has seen of the file so far.",
      "C": "Read the file to see the exact current line and surrounding context, then use Edit to replace only that line's old string with the new value.",
      "D": "Use Glob to confirm the file's location, then use Write to submit the full corrected file content in one call."
    },
    "correct": "C",
    "explanations": {
      "A": "Bash/sed can work for simple substitutions, but it bypasses Claude's verified view of the file's exact current content, and a loosely scoped pattern risks matching unintended lines elsewhere in a 300-line config with similar keys.",
      "B": "Write replaces the entire file. Reconstructing 300 lines of comments, historical notes, and exact indentation from memory risks silently dropping or altering content that was never meant to change - a poor fit for a single-line edit.",
      "C": "Correct. Read establishes the exact current content so the old string can be matched precisely, and Edit performs a targeted, surgical replacement of only that line - leaving every other setting, comment, and indentation untouched.",
      "D": "Glob only locates files by path pattern; it does not show file contents, so this path still risks reconstructing (and thus corrupting) the file's other content via Write."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.5-f9c1f56a"
  },
  {
    "taskStatement": "D2.5",
    "domain": "D2",
    "scenario": "A multi-agent research system investigating \"regulatory risk in fintech lending\" has a coordinator that dispatches dozens of subagents, each of which writes its findings to a timestamped file like fintech_lending_20260614_0912.md inside a shared /workspace/findings/ directory. Filenames only reflect the general research topic and timestamp — they don't indicate which specific subtopics each file discusses. The synthesis agent's job is to identify only the ~12 files (out of 50+) that actually discuss \"regulatory risk\" specifically, then combine their content into a new consolidated report at /workspace/report.md, which does not yet exist.",
    "question": "Which combination of built-in tools is the most effective and correct way for the synthesis agent to accomplish this task?",
    "options": {
      "A": "Use Glob with a pattern like *regulatory* to locate the relevant files in /workspace/findings/, then Read each match and Write the combined content to report.md.",
      "B": "Use Read to open every file in /workspace/findings/ one by one, checking each for mentions of \"regulatory risk,\" then Write the combined content to report.md.",
      "C": "Use Grep to search file contents in /workspace/findings/ for \"regulatory risk,\" Read the files that match, and then Write the combined content to a new report.md.",
      "D": "Use Bash to run a shell pipeline like cat /workspace/findings/*.md | grep \"regulatory risk\", then use Edit to insert the piped output into report.md."
    },
    "correct": "C",
    "explanations": {
      "A": "Glob matches file paths and names, not file contents. Since \"regulatory risk\" is not encoded in the filenames (which only reflect the general topic and a timestamp), a name-based pattern like *regulatory* would fail to find the relevant files at all.",
      "B": "This would eventually surface the right content, but it is the wrong tool choice for the task: it forces the agent to load all 50+ files into context just to filter them, instead of using a tool built specifically for content search across many files first. This wastes context and time as the number of findings files grows.",
      "C": "Correct. Grep is the purpose-built tool for searching file contents across a directory of files, which is exactly what's needed since the relevant subtopic isn't reflected in filenames. Read then retrieves only the matched files, and Write is correct because report.md does not yet exist and needs to be created.",
      "D": "Shelling out through Bash duplicates functionality the Grep tool already provides more reliably and with structured output, and is a less appropriate tool choice here. It also misapplies Edit, which performs a targeted string replacement in an existing file with unique matching text - since report.md does not yet exist, there is nothing for Edit to match against, so this would fail."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D2.5-9d105d7e"
  },
  {
    "taskStatement": "D3.1",
    "domain": "D3",
    "scenario": "A backend team relies on Claude Code to generate service code across a repo with a root CLAUDE.md covering shared build commands, lint rules, and test framework conventions. Six months ago, an engineer setting up the payments service copied the entire root CLAUDE.md into services/payments/CLAUDE.md and appended payment-specific rules (PCI-related validation, a stricter error-handling pattern) at the bottom. Since then, the root file has been updated twice — the lint command changed and the team migrated test frameworks — but nobody updated the payments copy. Now, whenever Claude Code generates code inside services/payments, it produces test files using the old test framework and references the outdated lint command, contradicting the conventions used everywhere else in the repo.",
    "question": "What is the most maintainable way to fix this drift while still preserving the payments team's directory-specific rules?",
    "options": {
      "A": "Delete services/payments/CLAUDE.md entirely and instruct engineers to paste the PCI validation and error-handling rules into their prompts manually whenever they work in that directory.",
      "B": "Trim services/payments/CLAUDE.md down to only the payment-specific rules, removing the duplicated shared content — since nested CLAUDE.md files are loaded alongside the root file based on directory location, the shared standards only need to live in the root file.",
      "C": "Set up a script that runs on a schedule to copy the current contents of the root CLAUDE.md into every subdirectory CLAUDE.md so they stay synchronized.",
      "D": "Move the PCI validation and error-handling rules into the root CLAUDE.md under a \"Payments\" header, then delete services/payments/CLAUDE.md, so every rule lives in one file."
    },
    "correct": "B",
    "explanations": {
      "A": "Removes the drift risk but sacrifices the reliability of persistent, file-based configuration — manually re-pasting rules into prompts is inconsistent, easy to forget, and reintroduces the exact problem CLAUDE.md files exist to solve.",
      "B": "Correct. CLAUDE.md files form a hierarchy where nested files are loaded alongside the root file based on directory location, so content doesn't need to be duplicated to apply within a subdirectory. Trimming the payments file to only its unique rules eliminates the duplicated content that caused drift, while the hierarchy still ensures both files apply when working in services/payments.",
      "C": "Solves the immediate symptom but adds unnecessary tooling and infrastructure to compensate for a modular-organization problem the hierarchy already solves natively; it also fails to scale as more subdirectories accumulate their own copies.",
      "D": "Eliminates the drift but sacrifices modular organization by folding directory-specific concerns back into the shared root file — as more services add their own sections this way, the root file grows unwieldy again, which is the bloat problem scoped CLAUDE.md files are meant to prevent."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D3.1-e8fc697a"
  },
  {
    "taskStatement": "D4.2",
    "domain": "D4",
    "scenario": "A team uses Claude Code to auto-generate unit tests for newly added API endpoint handlers as part of their local dev workflow. The system prompt gives detailed natural-language instructions: \"use descriptive test names, mock external dependencies, assert on both status code and response body, and group related tests in describe blocks.\" Despite this, generated test files vary widely in practice - some use inline mocks while others use fixture files, assertion styles mix expect(res.body).toEqual() with expect(res.body).toMatchObject() inconsistently, and describe-block nesting depth differs from file to file. Developers spend significant time reformatting generated tests to match the codebase's established conventions before merging.",
    "question": "What change would most effectively reduce this style inconsistency across generated test files?",
    "options": {
      "A": "Expand the natural-language instructions in the system prompt with more granular rules covering mocking approach, assertion method, and nesting depth.",
      "B": "Include 2-3 few-shot examples of complete, existing test files from the codebase that demonstrate the exact mocking approach, assertion style, and describe-block structure the team wants replicated.",
      "C": "Lower the temperature setting to reduce output variability between generation runs.",
      "D": "Split the task into separate prompts, one per structural concern (mocking, assertions, grouping), run sequentially and merge the results."
    },
    "correct": "B",
    "explanations": {
      "A": "Natural-language rules describe style abstractly; precise stylistic choices like exact assertion method or nesting depth are hard to fully pin down in words and still leave room for divergent interpretation across files - this is the approach already tried without success.",
      "B": "Correct. Concrete few-shot examples show the model the exact desired mocking approach, assertion style, and structure to replicate, rather than describing it abstractly - this directly targets the ambiguity that abstract instructions left unresolved and drives consistent output across files.",
      "C": "Temperature affects randomness in token sampling, not the model's understanding of which style convention to follow; lowering it does not communicate which mocking approach or assertion method is correct, so inconsistency driven by ambiguous instructions would persist.",
      "D": "Fragmenting the task across separate prompts addresses workflow structure, not the underlying ambiguity about which conventions to use, and introduces new risk of inconsistency between the merged pieces."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.2-13107945"
  },
  {
    "taskStatement": "D4.2",
    "domain": "D4",
    "scenario": "A multi-agent research system assigns a document-analysis agent to summarize each source (academic papers, blog posts, press releases) found by the web-search agent before passing summaries to a synthesis agent. QA review finds the summaries are wildly inconsistent: some are three sentences focused only on conclusions, others are dense paragraphs quoting methodology and statistics, and a few omit publication dates or author affiliations entirely. The system prompt tells the agent to \"summarize each source clearly and consistently,\" and a JSON schema already enforces fields for title, summary, and key_findings, but the free-text content inside those fields still varies enormously in depth and framing from one source to the next. The synthesis agent's output quality suffers because it receives summaries that are not comparable to one another.",
    "question": "What change would most directly fix the inconsistency in summary depth and framing?",
    "options": {
      "A": "Increase the max_tokens parameter for the document-analysis agent so it has room to write longer, more thorough summaries.",
      "B": "Tighten the JSON schema further by adding more required fields (e.g., methodology, sample_size) so the structure captures more of each source.",
      "C": "Add a small set of few-shot examples showing complete summaries for representative source types (a dense academic paper, a short blog post, a press release), each demonstrating the target length, level of technical detail, and framing.",
      "D": "Set the document-analysis agent's temperature to 0 to make its outputs deterministic across runs."
    },
    "correct": "C",
    "explanations": {
      "A": "More tokens only gives the agent room to be verbose; it does not tell the agent what a consistent depth or framing should look like, so variation across source types would persist.",
      "B": "The schema already constrains which fields exist, but the problem is inconsistent content within those free-text fields, not missing fields - adding more required fields would not standardize depth or tone within the existing ones.",
      "C": "Correct. Concrete few-shot examples covering the different source types the agent actually encounters demonstrate the desired length, technical depth, and framing directly, which is far more effective than an abstract instruction like \"summarize clearly and consistently.\"",
      "D": "Temperature 0 only makes a given input produce the same output on repeated runs; it does nothing to make summaries of a paper and a press release converge on comparable depth and framing, since the underlying instruction is still ambiguous."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.2-d5bd0df9"
  },
  {
    "taskStatement": "D5.1",
    "domain": "D5",
    "scenario": "A multi-agent research system investigates a technology policy question over many hours. A coordinator agent delegates to a rotating pool of web-search and document-analysis subagents, each returning findings that the coordinator folds into a running research log before spawning the next subagent. Partway through, the engineering team notices the coordinator's context window is approaching its limit, so they configure automatic conversation compaction to summarize older turns once a token threshold is hit.\n\nAfter compaction runs for the first time, the synthesis agent produces a final report that contradicts an early methodological constraint the user specified at the very start of the session (\"exclude any sources published before 2020\"). Investigation shows the constraint was stated once in an early turn and never restated, and compaction's summary of that turn dropped it while preserving later, less critical search results.",
    "question": "What is the most effective way to prevent this class of failure going forward?",
    "options": {
      "A": "Extract critical constraints like this one into a structured, persistent artifact (e.g., a standing research-brief section) that is carried forward verbatim and excluded from summarization, rather than relying on generic compaction to retain it.",
      "B": "Increase the token threshold at which compaction triggers so it runs less frequently.",
      "C": "Instruct the coordinator's system prompt to \"pay close attention to constraints stated early in the conversation\" so compaction weighs them more heavily.",
      "D": "Disable compaction entirely and let the coordinator operate with the full, uncompacted conversation history for the remainder of the session."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Generic summarization cannot reliably distinguish a business-critical constraint from incidental detail. Pulling critical facts into a separate, structured record that persists outside the summarization process guarantees they survive regardless of how compaction handles the rest of the conversation.",
      "B": "Delays the failure rather than fixing it - compaction will still eventually run and can still drop the same unflagged constraint, and in the meantime the context window risks overflowing.",
      "C": "Relies on probabilistic compliance from a summarization step to correctly prioritize information it has no structural way of knowing is critical - the same class of unreliable fix as trusting prompt wording for enforcement.",
      "D": "Trades one failure mode for another; without compaction the session will eventually exceed the context window, which is the original problem the team was trying to solve."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.1-e13cac0a"
  },
  {
    "taskStatement": "D5.4",
    "domain": "D5",
    "scenario": "A developer uses Claude Code to add a new discount-eligibility rule to a shared PricingEngine module inside an 8,000-file monorepo used by a dozen internal services. Before making any edit, the developer tells Claude in the main session to \\\"explore thoroughly so you understand every place PricingEngine is used.\\\" Claude proceeds to Read dozens of service files inline, one after another, in the same conversation. By the time exploration finishes, the context window is nearly full, and the subsequent multi-file edit is inconsistent - it correctly updates the PricingEngine module but misses two call sites that were surfaced early in the exploration, as if that earlier context had faded.",
    "question": "What is the most effective way to restructure this workflow to manage context?",
    "options": {
      "A": "Break the task into many small prompts, each editing one file, and skip upfront exploration entirely.",
      "B": "Instruct Claude to Read every file in every service directory before starting any edit, to guarantee full coverage.",
      "C": "Delegate the exploration phase to a subagent (e.g., Explore) that searches the monorepo and returns a condensed summary of relevant usages, then perform the edit in the main session using that summary.",
      "D": "Let exploration continue in the main session as before, and rely on automatic context compaction to summarize findings once the window fills before proceeding with the edit."
    },
    "correct": "C",
    "explanations": {
      "A": "Removing upfront exploration entirely means the edits happen without shared understanding of all call sites, which is likely to reproduce the same missed-call-site problem for a different reason.",
      "B": "Reading every file in every service directory inline is the root cause of the problem, not a fix - it maximizes the amount of exploration content competing for space in the same context window used for the edit.",
      "C": "Correct. Isolating exploration in a subagent keeps the bulk of file-reading out of the main conversation; the subagent returns only a condensed summary of findings, leaving the main session's context available and intact for the implementation pass.",
      "D": "Compaction is a reactive fallback that summarizes after the window is already saturated with exploration content, so the degradation (fading early findings) has already occurred by the time it triggers - it does not prevent the problem the scenario describes."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.4-9d10c34e"
  },
  {
    "taskStatement": "D5.4",
    "domain": "D5",
    "scenario": "A multi-agent research system is tasked with explaining how the billing pipeline works across a 40,000-file monorepo. The coordinator spawns five subagents, each assigned a different module (invoicing, payments, tax calculation, dunning, and reporting), and instructs each to \"read all relevant files and report back everything you find.\" Each subagent dutifully reads dozens of full files and returns the complete raw file contents to the coordinator so it can write the final explanation.\n\nBy the time the fourth subagent's results arrive, the coordinator's context is dominated by raw source code from the first three modules, and it begins losing track of earlier findings and truncating parts of the conversation. The final synthesized explanation omits key details about the invoicing module even though that subagent's report was accurate and complete when it was submitted.",
    "question": "What change would most effectively fix this context management problem?",
    "options": {
      "A": "Increase the coordinator's model to one with a larger context window so it can hold all five modules' raw file contents at once.",
      "B": "Instruct each subagent to keep detailed file exploration within its own context and return only a synthesized summary of key findings to the coordinator, rather than raw file contents.",
      "C": "Reduce the system to a single agent that explores all five modules sequentially so there is only one context to manage.",
      "D": "Have subagents use Grep instead of Read for all file exploration so they never load full file contents into their own context."
    },
    "correct": "B",
    "explanations": {
      "A": "Treats context capacity as the bottleneck rather than the actual problem, which is that raw, unsynthesized content is being passed upstream at all; a larger window only delays the same failure and adds unnecessary cost.",
      "B": "Correct. Each subagent's context is disposable after it finishes its work - detailed exploration should stay isolated there, and only condensed, relevant findings should cross back to the coordinator. This keeps the coordinator's context focused on synthesis rather than raw source code, preventing earlier findings from being crowded out.",
      "C": "Eliminates the parallelism benefit of the multi-agent design and still accumulates the same volume of raw content in a single context over time, just more slowly.",
      "D": "Grep alone cannot support the deep understanding needed to explain how a pipeline works across modules; the problem is not the exploration tool but what is returned to the coordinator afterward."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.4-7baf433a"
  },
  {
    "taskStatement": "D5.5",
    "domain": "D5",
    "scenario": "A multi-agent research system produces investment due-diligence briefs. The synthesis agent tags each claim in its output with a self-reported confidence score (1-100) generated by asking Claude to rate its own certainty. Claims scoring above 70 are published directly to analysts; claims scoring 70 or below are routed to a human reviewer queue. After three months, an audit compares the self-reported scores against analyst-verified outcomes: claims the system rated 85+ were wrong nearly as often as claims rated in the 50s, and several high-confidence claims that turned out to be fabricated financial figures were never queued for review.",
    "question": "What is the most effective fix for the review-routing failure?",
    "options": {
      "A": "Raise the publish threshold from 70 to 90 so fewer claims bypass human review.",
      "B": "Replace the self-reported confidence score with routing criteria grounded in objective, verifiable signals (e.g., claim type, presence of corroborating sources, numeric/financial content) rather than the model's own certainty rating.",
      "C": "Have a second Claude call independently re-score the same claim's confidence and average the two scores before routing.",
      "D": "Add a system prompt instruction telling the synthesis agent to be more conservative and assign lower confidence scores to financial figures."
    },
    "correct": "B",
    "explanations": {
      "A": "Doesn't address the root cause - the audit shows the score itself doesn't correlate with actual accuracy, so moving the cutoff still lets confidently-wrong claims slip through and pushes more correct claims into the queue unnecessarily.",
      "B": "Correct. The audit demonstrates that self-reported LLM confidence is poorly calibrated against real-world accuracy. Routing should instead key off objective, verifiable signals (source corroboration, claim category, presence of specific numeric/financial data) that are known risk indicators, rather than trusting the model's own certainty judgment.",
      "C": "Averaging two instances of the same unreliable signal does not fix the underlying miscalibration - both scores come from the same flawed self-assessment mechanism and can be confidently wrong together.",
      "D": "Relies on probabilistic prompt compliance to fix what is fundamentally a measurement problem; the model being told to 'be more conservative' does not make its self-reported confidence correlate with actual correctness."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.5-513f67ae"
  },
  {
    "taskStatement": "D5.5",
    "domain": "D5",
    "scenario": "An engineering team uses Claude Code to automatically generate small bug-fix PRs across a monorepo. To manage reviewer load, they route PRs by diff size: fixes under 10 changed lines auto-merge without human review, while anything 10 lines or more is queued for a human reviewer. A post-incident review finds that a 3-line auto-merged change to the payment authorization module silently disabled a fraud check, causing a week of unvalidated transactions, while that same week a 40-line refactor of a logging utility (with no behavioral risk) sat in the human review queue for two days, consuming reviewer time.",
    "question": "What is the most effective way to redesign the review routing?",
    "options": {
      "A": "Route based on the criticality of the files/paths touched (e.g., always require human review for changes in auth, payment, or security-sensitive modules), reserving size-based auto-merge for lower-risk areas of the codebase.",
      "B": "Raise the auto-merge threshold to 20 lines so more small fixes bypass review, reducing reviewer backlog.",
      "C": "Have Claude self-report a confidence score for each generated fix and auto-merge only those above a chosen threshold, regardless of diff size.",
      "D": "Require every Claude-generated PR to go through human review regardless of size or location, eliminating auto-merge entirely."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. The incident shows diff size is a poor proxy for risk — a tiny change to a critical module caused real harm while a large but low-risk change wasted reviewer time. Routing on the actual risk signal (which code paths are touched) targets human review where it matters and preserves automation elsewhere.",
      "B": "Widens the auto-merge window without addressing why the routing signal is wrong, making it more likely that another small, high-impact change to a critical path slips through unreviewed.",
      "C": "Substitutes one weak proxy (diff size) for another (self-reported LLM confidence); confidence scores are not reliably calibrated to actual correctness and would not reliably catch a small change that silently breaks a fraud check.",
      "D": "Eliminates the size-vs-risk mismatch but overcorrects by removing automation entirely, reintroducing the reviewer bottleneck the routing system was meant to solve, including for genuinely low-risk changes."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.5-34e2f541"
  },
  {
    "taskStatement": "D5.6",
    "domain": "D5",
    "scenario": "A developer asks Claude Code to generate a migration script for upgrading an internal library from v2 to v3. To scope the change, Claude reads the vendor's CHANGELOG.md (fetched via WebFetch), which states that the function `fetchLegacyToken()` was removed in v3. It then greps the actual vendored source under `node_modules/`, which shows `fetchLegacyToken()` still defined and exported. A linked GitHub issue thread has two conflicting maintainer comments: one says the function was fully removed, the other says it was kept behind a compatibility flag for one more major version.",
    "question": "Given these conflicting sources, what is the best way for Claude Code to produce the migration script and its accompanying summary?",
    "options": {
      "A": "Trust the changelog as the official source of truth, write the migration script assuming `fetchLegacyToken()` is gone, and omit any mention of the source code or issue thread from the summary.",
      "B": "Trust the grepped source code as ground truth over the documentation, and silently proceed as if the function is still safe to call, without noting the changelog's claim.",
      "C": "Write the migration script to feature-detect `fetchLegacyToken()` at runtime rather than assuming either outcome, and include a summary that names each source (changelog, vendored source, issue thread comments) and states explicitly that they disagree, so the developer can confirm before merging.",
      "D": "Since two of the three sources (changelog and one maintainer comment) indicate the function was removed, proceed on that majority view and generate the script without flagging the disagreement."
    },
    "correct": "C",
    "explanations": {
      "A": "Privileges one source (the changelog) and discards contradicting evidence found directly in the vendored source code, hiding the conflict from the developer who will merge the change.",
      "B": "Makes the opposite error of A - it discards the official documentation and one maintainer's comment in favor of the source code snapshot, which could be stale or represent an unreleased state, again hiding a real disagreement.",
      "C": "Correct. When sources genuinely conflict, the safest path is to avoid committing to an unverified assumption in the generated code and to preserve provenance - stating which source said what - so the developer can resolve the ambiguity with full context before merging.",
      "D": "Treating source disagreement as a vote to be tallied is not a valid resolution method - a maintainer's direct clarification about a compatibility flag is qualitatively different from a changelog entry, and averaging away the disagreement hides genuine uncertainty from the developer instead of surfacing it."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.6-7cac8c66"
  },
  {
    "taskStatement": "D5.6",
    "domain": "D5",
    "scenario": "A multi-agent research system investigates a company's projected 2027 revenue growth for an investment memo. Three subagents return figures from different sources: the SEC filings agent extracts 8% from the company's official guidance, the analyst-reports agent finds a 14% consensus estimate from sell-side analysts, and the news agent surfaces a 22% figure from a single optimistic op-ed. The synthesis agent currently outputs one sentence: \"The company is projected to grow revenue by approximately 14% in 2027,\" with no mention of the other two figures or where any number came from.",
    "question": "What is the most effective way to fix how the synthesis agent handles this conflicting information?",
    "options": {
      "A": "Instruct the synthesis agent to average the three figures (8%, 14%, and 22%) and report the mean as the projected growth rate.",
      "B": "Instruct the synthesis agent to always defer to the SEC filings agent's figure, since official filings are the most authoritative source type.",
      "C": "Instruct the synthesis agent to report each growth figure alongside its source and note the disagreement between them, rather than presenting a single unattributed number.",
      "D": "Have the coordinator re-run the news and analyst-reports agents until their figures converge with the SEC filing before synthesis proceeds."
    },
    "correct": "C",
    "explanations": {
      "A": "Manufactures a precise-looking number that none of the sources actually reported and erases the fact that the sources meaningfully disagree - the opposite of preserving provenance.",
      "B": "Silently discards two sources without surfacing the conflict; collapsing to one figure without attribution or acknowledgment of disagreement hides information the reader needs to judge confidence, even if official filings are often the most reliable source type.",
      "C": "Correct. When sources genuinely conflict, synthesis should preserve provenance (which source reported which figure) and explicitly flag the disagreement and its magnitude, so downstream readers can judge confidence and weigh the claims themselves rather than receiving a single number stripped of its origin and uncertainty.",
      "D": "Re-running agents until they converge doesn't resolve a real underlying disagreement between sources - it just discards genuine divergence, and there's no guarantee independent sources with different methodologies will ever agree."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.6-0533c289"
  },
  {
    "taskStatement": "D3.4",
    "domain": "D3",
    "scenario": "A multi-agent research system has a coordinator, a web-search agent, a document-analysis agent, and a synthesis agent, each defined in its own well-documented file with a stable interface. A developer needs to add a single new parameter, max_results, to the web-search agent's existing search_web tool, clamp it to a documented range, and update the one call site in the coordinator that invokes it. The change touches two files, the tool's input schema is already well-specified, and there is exactly one correct way to wire the parameter through.",
    "question": "Which approach should the developer take with Claude Code?",
    "options": {
      "A": "Enter plan mode first so Claude can explore the entire multi-agent system before touching any file.",
      "B": "Use direct execution, since the change is small, localized, and has a single clear implementation path.",
      "C": "Enter plan mode and require Claude to produce a written design document covering all four agents before making the edit.",
      "D": "Use direct execution, but first ask Claude to draft several alternative architectures for passing the parameter and pick one."
    },
    "correct": "B",
    "explanations": {
      "A": "Plan mode is intended for architectural decisions, large-scale changes, and situations with multiple valid approaches; a two-file, single-path parameter addition doesn't need upfront exploration of the whole system.",
      "B": "Correct. When a change is small in scope, well-specified, and has one clear implementation path, direct execution is appropriate - plan mode's exploration and design overhead adds no value here.",
      "C": "Requiring a full system-wide design document for a two-file change misapplies plan mode's purpose and adds unnecessary overhead disproportionate to the task.",
      "D": "There is only one correct way to wire the parameter through, so generating and choosing among alternative architectures is unnecessary busywork that doesn't fit the situation."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D3.4-bcde6fbf"
  },
  {
    "taskStatement": "D3.2",
    "domain": "D3",
    "scenario": "A multi-agent research system has a coordinator, a web-search agent, a document-analysis agent, and a synthesis agent that compiles the final report. Only during the final compilation step, the synthesis agent needs to apply a lengthy internal citation style guide (source ranking rules, quote-attribution format, footnote numbering) — a capability that is irrelevant to every other stage of the pipeline. The team wants this applied consistently without bloating every agent's system prompt with formatting rules it will rarely need.",
    "question": "Which approach best fits this situation?",
    "options": {
      "A": "Create a project-scoped slash command, /format-citations, that a user runs manually after the synthesis agent has already produced the report.",
      "B": "Create a skill (e.g., citation-style/SKILL.md) with a description referencing citation formatting and report compilation, so the synthesis agent can discover and invoke it only when it reaches that step.",
      "C": "Paste the full citation style guide directly into the synthesis agent's system prompt so it is always available with no lookup needed.",
      "D": "Create a slash command, /format-citations, and add it as a required tool call the coordinator must invoke on every research run before finishing."
    },
    "correct": "B",
    "explanations": {
      "A": "Requires a human to remember a manual, separate step after the fact, defeating the goal of consistent, built-in application as part of the agent's own workflow.",
      "B": "Correct. A skill with a description matching the relevant context lets the agent discover and load the capability on demand, exactly when synthesis reaches the compilation step, instead of carrying the detail everywhere it isn't needed.",
      "C": "Permanently inflates the synthesis agent's context with detail needed only during one narrow step, the exact overhead an on-demand skill avoids.",
      "D": "Forces a rigid, unconditional invocation every single run regardless of whether the report is actually at the citation-formatting step, and misuses a user-facing slash command as a mandatory pipeline dependency."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D3.2-52e16661"
  },
  {
    "taskStatement": "D4.4",
    "domain": "D4",
    "scenario": "A multi-agent research system assigns a claim-extraction subagent to pull structured findings (claim_text, source_url, supporting_quote) from web pages into a JSON schema that a synthesis agent later cites in its report. The extraction subagent's output passes JSON schema validation on nearly every run — all required fields are present and correctly typed. However, a manual audit of last week's reports found that in roughly 20% of extracted records, the supporting_quote field does not actually appear anywhere in the source page at source_url; the model fabricated a plausible-sounding quote and attached it to a real URL. Because these records are schema-valid, the pipeline's current retry loop — which only re-invokes the extraction subagent when JSON parsing or schema validation fails — never flags them, and the fabricated citations flow straight into published reports.",
    "question": "What change would most effectively catch this failure mode before reports are published?",
    "options": {
      "A": "Increase the retry count on schema validation failures so the extraction subagent gets more attempts to produce a well-formed record.",
      "B": "Add a verification step that checks each supporting_quote against the actual text of the page at source_url, and feeds any mismatch back to the extraction subagent as the reason for a retry.",
      "C": "Set the extraction subagent's temperature to 0 to make its outputs more deterministic and consistent across runs.",
      "D": "Tighten the JSON schema by adding a regex pattern requiring source_url to be a well-formed URL."
    },
    "correct": "B",
    "explanations": {
      "A": "Schema validation already passes on these records — the fabricated quotes are syntactically valid, correctly-typed JSON, so more retries triggered by schema checks will never fire on this failure mode.",
      "B": "Correct. Schema validation only enforces structure, not semantic accuracy. Catching a fabricated-but-well-formed quote requires a separate grounding check that compares the extracted content against the actual source, then routes any mismatch back into the retry loop with the specific discrepancy identified.",
      "C": "Lowering temperature may reduce variance but does not verify content against a source; the model can still confidently and deterministically fabricate a quote that sounds plausible.",
      "D": "A URL-format regex only confirms source_url is syntactically a URL — it says nothing about whether the quote attributed to that URL actually exists on the page, so the fabrication passes unchanged."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-sonnet-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.4-b996a34d"
  },
  {
    "taskStatement": "D3.1",
    "domain": "D3",
    "scenario": "A platform team maintains a modular Claude Code setup: the root CLAUDE.md uses @import to pull in three standards files (api-standards.md, testing.md, security.md), and several packages have their own CLAUDE.md files. One developer reports that Claude Code applies the security conventions inconsistently across sessions - sometimes citing the rules verbatim, other times behaving as if they don't exist. The standards files themselves have not changed.",
    "question": "What is the most effective first step to diagnose why the instructions are applied inconsistently?",
    "options": {
      "A": "Run the /memory command to verify which memory files are actually loaded in the session and confirm the @import chain resolves to the expected files.",
      "B": "Consolidate the three imported standards files back into a single monolithic CLAUDE.md so there are fewer moving parts to load.",
      "C": "Add a rule at the top of every package CLAUDE.md instructing Claude to always apply the security standards.",
      "D": "Duplicate the security conventions in both the root CLAUDE.md and every package-level CLAUDE.md so they load either way."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. /memory shows exactly which memory files are loaded, which is the direct way to verify whether the @import chain resolved and to diagnose inconsistent behavior across sessions before changing any configuration.",
      "B": "Reverses a recommended modular organization without diagnosing anything - if an import isn't resolving, consolidation hides the cause rather than revealing it.",
      "C": "Adds prompt-level emphasis without establishing whether the security file is loaded at all; instructions cannot apply if the file never enters context.",
      "D": "Duplication creates the drift and maintenance problems modular organization exists to avoid, and still doesn't explain the inconsistency."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-fable-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D3.1-c4bc59a9"
  },
  {
    "taskStatement": "D4.3",
    "domain": "D4",
    "scenario": "A structured data extraction pipeline uses a schema-defined extraction tool to pull purchase-order fields (vendor, PO number, delivery date, payment terms) from supplier emails. The schema marks every field as required. QA sampling finds that when an email genuinely omits payment terms, the extraction still returns a plausible-looking value such as \"Net 30\" - fabricated to satisfy the schema - and these invented values are flowing into the ERP system.",
    "question": "Which schema change most directly prevents the fabricated values?",
    "options": {
      "A": "Make fields that may legitimately be absent from the source optional and nullable, so the model can return null when the information is not present.",
      "B": "Keep all fields required but add a system-prompt instruction telling the model never to guess values.",
      "C": "Lower the temperature so the extraction is more deterministic and less likely to invent values.",
      "D": "Add a second required field asking the model to rate its confidence in each extracted value."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. A required field forces the model to produce something even when the source has nothing. Making absent-able fields optional and nullable removes the structural pressure to fabricate, so a missing value can be represented honestly as null.",
      "B": "The schema still requires a value, so the structural pressure to produce one remains; a prompt instruction competes with - and loses to - the required-field constraint.",
      "C": "Temperature changes variability, not the requirement to fill the field; a deterministic model will deterministically fabricate a value when the schema demands one.",
      "D": "Self-reported confidence is poorly calibrated and does nothing to stop the fabricated value from being produced in the first place."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-fable-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.3-a58cb0c0"
  },
  {
    "taskStatement": "D4.3",
    "domain": "D4",
    "scenario": "A document intake system receives a mixed stream of contracts, invoices, and resumes. Claude has three schema-defined extraction tools (extract_contract, extract_invoice, extract_resume), and the document type is not known in advance. In production, some runs return a conversational reply (\"This appears to be an employment contract...\") instead of calling any extraction tool, and downstream automation fails on those runs.",
    "question": "Which tool_choice configuration fixes the failures while preserving correct routing across document types?",
    "options": {
      "A": "Set tool_choice to \"any\", requiring the model to call one of the extraction tools while leaving it free to choose the tool matching the document type.",
      "B": "Force extract_contract with tool_choice {\"type\": \"tool\", \"name\": \"extract_contract\"}, since contracts are the most common document type.",
      "C": "Keep tool_choice on \"auto\" and add a system-prompt instruction that a tool must always be called.",
      "D": "Replace the three tools with a single generic extract_document tool so no routing decision is needed."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. \"any\" guarantees a tool call on every run - eliminating the conversational-reply failure - while preserving the model's choice among the three schemas, which is exactly what an unknown document type requires.",
      "B": "Forcing one named tool guarantees a call but destroys routing - invoices and resumes would be extracted through the contract schema.",
      "C": "\"auto\" permits text-only replies by design; a prompt instruction reduces but cannot eliminate them, so the failure mode persists at some rate.",
      "D": "Collapsing the schemas sacrifices the per-type field definitions that make the extractions useful downstream, trading a routing non-problem for a data-quality one."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-fable-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D4.3-cf8b34c1"
  },
  {
    "taskStatement": "D5.1",
    "domain": "D5",
    "scenario": "A customer support agent handles long multi-issue conversations. Each order lookup returns a record with more than 40 fields (shipping history, warehouse codes, internal flags), of which only a handful matter for the customer's return question. After several lookups, sessions degrade: the agent starts losing track of amounts and dates the customer stated earlier, and context usage balloons.",
    "question": "Which change most directly addresses the degradation?",
    "options": {
      "A": "Trim each tool result to only the fields relevant to the current issue before it enters conversation context, so lookups stop consuming tokens disproportionate to their relevance.",
      "B": "Switch to a model with a larger context window so the full records fit comfortably.",
      "C": "Instruct the agent to re-ask the customer for amounts and dates whenever it is unsure.",
      "D": "Reduce the number of order lookups the agent is allowed to make per conversation."
    },
    "correct": "A",
    "explanations": {
      "A": "Correct. Verbose tool results accumulate in context and consume tokens far out of proportion to their relevance; trimming to the relevant fields stops the accumulation at its source and preserves room for the facts the customer actually stated.",
      "B": "A larger window delays the ceiling but does not fix disproportionate accumulation, and recall issues on long inputs remain.",
      "C": "Pushes the cost of context mismanagement onto the customer and erodes trust; the stated amounts were already in the conversation.",
      "D": "Caps a legitimate capability instead of fixing the waste per lookup - the agent may need every one of those lookups in a multi-issue session."
    },
    "provenance": {
      "source": "seed-generated",
      "model": "claude-fable-5",
      "generatedAt": "2026-07-02",
      "reviewed": true
    },
    "id": "D5.1-d8169ff7"
  }
];
