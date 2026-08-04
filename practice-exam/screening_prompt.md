# Screening Prompt — Generated Question Review Assist

Machine-generated questions are adversarially screened before human review.
This file is the durable screening prompt: paste it (or reference it) when
running screening agents over `questions_pending.json`. Screening assists the
human pass — it never replaces it, and it cannot merge anything
(`provenance.reviewed` is only flipped by `generate_bank.py --merge`).

---

## Grounding rule — which source wins

**The CCAR-F exam guide (v1.0) is the authoritative grounding source for
correctness.** Current Anthropic product docs are the secondary source. Apply
them in this order:

1. A claim supported by the exam guide is **correct for screening purposes**,
   even where current product docs have moved past the guide (e.g., slash
   commands merged into skills, `disable-model-invocation`). Where the two
   diverge, annotate the finding as **"product-docs divergence — verify
   against exam guide"** rather than treating it as a disqualifying
   fabrication.
2. A claim appearing in **neither** the exam guide **nor** current docs — an
   invented CLI flag, environment variable, API parameter, numeric limit, or
   configuration-dependent behavior — remains a **disqualifying fabrication**
   (historical examples: a `--non-interactive` flag; "strict JSON mode
   availability depends on deployment configuration").

## Per-question checks

For each assigned question:

1. **FABRICATION** — does the scenario, any option, or any explanation assert
   a specific technical fact you cannot confirm? If a specific claim is
   load-bearing for the marked-correct answer, verify it first against the
   exam guide, then against https://docs.claude.com or
   https://code.claude.com/docs. Apply the grounding rule above to decide
   between "fabrication" and "product-docs divergence."
2. **SINGLE ANSWER** — is the marked-correct option clearly the best answer?
   Every bank question is single-answer, which matches the real exam — the
   guide describes multiple-response items but a real sitting found none. Reject
   any candidate that expects more than one selection.
   Argue *for* each distractor: does any have a defensible case of being
   equally or more correct given the scenario? If yes, flag it.
3. **QUALITY** — realistic production scenario in one of the exam's six
   scenario types; four parallel, plausible options; non-circular
   explanations. Flag stub/placeholder content. Flag near-duplicates of other
   questions in the file (same premise, option skeleton, or correct-answer
   rationale).
4. **ABSTRACTION, NOT FABRICATION** — applies to every question carrying
   `"register": "functional"`. These deliberately describe the mechanism under
   test by its behaviour rather than naming it, because the real exam does and
   a bank written only in official terminology trains name-recognition instead.
   That freedom is over *phrasing only*: varying how a real mechanism is
   described is the point; varying **which** mechanisms are real is the
   fabrication failure mode check 1 already forbids, and a functional
   description is the easiest place to hide one.

   For each such question, **name the specific real mechanism the description
   resolves to** (e.g. "an automatic step that runs after every file
   modification and enforces the constraint" → a PostToolUse hook). Then check
   it against the exam guide's task-statement knowledge/skills inventory, as in
   check 1.

   **Flag as a concern when you cannot identify which real mechanism the
   description points to.** Not being able to name it is the finding — a
   description that resolves to nothing specific is either a fabrication or too
   vague to have one defensible answer, and both are disqualifying. Do not
   resolve the ambiguity charitably by picking the closest plausible mechanism;
   record what is ambiguous and let the human decide.

5. **PATTERN CURRENCY** — does the marked-correct answer rely on a mechanism
   not present in the exam guide's task-statement knowledge/skills inventory?
   A real-but-superseded pattern presented as the recommended answer is the
   failure mode here (e.g., `CLAUDE.local.md`, which functions but is
   superseded by home-directory imports via `@~/.claude/` paths and is absent
   from the D3.1 inventory). Annotate such a finding **"verify pattern
   currency"** and treat it with the same severity as the product-docs
   divergence category — **not auto-disqualifying**, since the guide's
   inventory is not exhaustive. A deprecated pattern is acceptable as a
   distractor when the explanation names it deprecated and gives the current
   replacement.

Default to **pass** when the question is grounded in the exam's stated
principles (programmatic enforcement vs. probabilistic compliance, tool
description quality, structured error categories, least privilege, escalation
criteria). Reserve **concern** for problems a human reviewer must look at —
one concrete sentence each, naming the option or claim at fault.

Output shape per question:
`{id, verdict: pass|concern, concerns: [string], resolvesTo: string}`.

`resolvesTo` names the real mechanism the question turns on — required by
check 4 above. For a functional-register question that is the mechanism its
description resolves to, or `"UNRESOLVED"` when you cannot identify one; for a
named-register question it is the mechanism it names, or `"n/a"` when the
question turns on a principle rather than a named mechanism.
