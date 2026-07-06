# Exercise 4 — Multi-Agent Research Pipeline

**Domains:** D1 (orchestration, context passing), D2.3, D5 (errors,
provenance)
**Task statements:** D1.2, D1.3, D1.6, D2.3, D5.3, D5.6
**Estimated effort:** 3–4 sessions

Build a coordinator with two subagents — "web search" and "document
analysis" — where each subagent is its own `messages.create` call with its
own system prompt and scoped tools. **No shared state: everything a
subagent knows arrives in its prompt.** That constraint, enforced by
construction, is the D1.3 lesson.

**Sources are mocked:** [fixtures/corpus.json](fixtures/corpus.json) holds
ten synthetic articles queried by keyword via
[mock_tools.py](mock_tools.py). Two articles report *different values for
the same statistic* with different publication dates — the D5.6 fixture.
No real web access; the Agent SDK with a real `Task` tool is the stretch,
not the base build.

**Yours:** the three system prompts and every function in
[research_pipeline.py](research_pipeline.py), plus every assertion in
`test_ex4_{delegation,context,parallel,failures,conflicts}.py`.

---

## Phase 1 — Coordinator and delegation

Implement `decompose`; log the decomposition before execution. Test with a
deliberately broad topic and check for the narrow-decomposition failure —
if your coordinator does to your topic what "creative industries" → three
visual-arts subtasks did, fix the coordinator prompt (goals and coverage
criteria, not step-by-step procedure). Assertions in
[test_ex4_delegation.py](test_ex4_delegation.py).

**Gate:** `.venv/bin/python exercises/exercise4/run_pipeline.py --show-prompts`
— subtasks span the topic, each names its subagent, each brief stands alone.

## Phase 2 — Structured findings and explicit context passing

Subagents return findings as structured objects: claim, source_name, url,
publication_date, excerpt. The synthesis step receives *only* what the
coordinator passes into its prompt. Assertions in
[test_ex4_context.py](test_ex4_context.py).

**Gate:** grep your own code and confirm there is no path by which synthesis
can see search results except through the prompt the coordinator built.
Then check the final report preserves attribution through synthesis.

## Phase 3 — Parallelism (D1.2/D1.3)

Run the two subagents concurrently (`asyncio` or threads) and measure
wall-clock vs. sequential. The mechanical insight to internalize: parallel
delegation is the coordinator issuing multiple Task calls in one turn —
your implementation mirrors that by dispatching both calls before awaiting
either. Assertions in [test_ex4_parallel.py](test_ex4_parallel.py).

**Gate:** `--parallel` prints both timings; parallel wins.

## Phase 4 — Failure injection and coverage annotations (D5.3)

`mock_tools.set_timeout_injection(...)` arms search timeouts (`times=2`
makes your one local retry fail too). Subagent: one local retry; on second
failure return structured error context (failure type, attempted query,
partial results, alternatives). Coordinator proceeds with what it has; the
report annotates affected sections FULL / PARTIAL (naming the missing
source) / NOT COVERED. Assertions in
[test_ex4_failures.py](test_ex4_failures.py).

**Gate:** run the same question with and without `--inject-timeout` and
diff the reports. The failed-run report must *look different* — visible
gaps, not silently complete. Anti-patterns absent: no empty result marked
success, no full-pipeline abort on one failure.

## Phase 5 — Conflicting statistics (D5.6)

`--conflict` asks the question that hits both conflicting articles. The
synthesis must preserve both values with attribution and dates, annotated
as a conflict — not averaged, not recency-picked, not silently dropped.
Assertions in [test_ex4_conflicts.py](test_ex4_conflicts.py).

**Gate:** the report shows both figures with sources and dates, and a
reader can tell whether it's a genuine conflict or temporal progression.
(This one is deliberately both: a definitional refinement AND a real
decline, per article_07 — your report should let a reader see that.)

**Stretch:** port the coordinator to the Claude Agent SDK with real `Task`
spawning and compare against your hand-rolled version.

---

Done? Fill in a copy of [../DEBRIEF_TEMPLATE.md](../DEBRIEF_TEMPLATE.md) and
hand-lower the settled task statements in the adaptive tool's seed.
