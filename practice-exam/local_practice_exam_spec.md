# CCAR-F Practice Exam — Local Variant Specification

This document specifies the **local** practice exam: the version that runs on
your own computer, outside Claude Chat, with no API key anywhere. It is a
companion to [`practice_exam_spec.md`](practice_exam_spec.md), which specifies
the original Claude.ai-artifact variant.

The following sections of the original spec are **normative here by
reference** — they apply unchanged:

- *The exam being modeled* (domains, weightings, all 30 task statements)
- *Adaptive logic* (seed tiers, ×0.7 / ×1.5 multipliers, floor 0.5 / cap 5.0,
  domain weight overlay)
- *Question generation → Expected JSON shape*
- *Interface and feedback* (one question at a time, per-question explanations,
  progress dashboard)

This document specifies only what differs, plus the local-only **timed exam
mode** (the original spec listed it as a possible later addition; it exists
here).

## Attribution

This tool quotes material from the **Claude Certified Architect – Foundations
Exam Guide v1.0**, published by Anthropic:

- the **six exam scenarios** (section 5), held verbatim in `EXAM_SCENARIOS` in
  both `exam_lib.py` and `adaptive.js`;
- the **twelve sample questions** (section 9), held verbatim as the bank entries
  tagged `provenance.source == "official-sample"`.

That text is Anthropic's, quoted unaltered and attributed at each site, for
study and commentary in a personal exam-preparation tool. © Anthropic PBC. This
tool is **not** an official Anthropic product and is not affiliated with,
sponsored by or endorsed by Anthropic. Everything else in the bank is generated
practice material written for this tool and is not exam content.

Fidelity to the quoted text is load-bearing, not incidental — see *the length
tell* below for what happened when the sample questions were paraphrased rather
than quoted. Do not paraphrase them back.

---

## Why a local variant exists

The artifact variant depends on two capabilities that exist only inside
Claude.ai: keyless Anthropic API access and `window.storage`. The local
variant replaces them:

| Artifact variant | Local variant |
|---|---|
| Keyless API access in the artifact | The local **Claude Code CLI** (`claude -p`), riding your existing Claude Code authentication |
| `window.storage` | A plain JSON file (`exam_progress.json`) in desktop mode; `localStorage` + export/import as a static page |
| Questions always generated | Generated in desktop mode; drawn from a **reviewed committed bank** (`questions.js`) otherwise |

There is still no API key handling and no server. Local LLMs are explicitly
out of scope (firm policy prohibits them).

---

## Changes driven by a real sitting

Two of this variant's behaviours exist because someone sat the real CCAR-F and
came back with observations the tool did not match. Both are worth keeping in
mind before "simplifying" them away.

**1. The bank was too easy, and the cause was language, not principles.** The
generation prompt used to end with *"Match their tone"* over the 13 official
samples. That, plus the samples themselves, pinned the generator to the exam
guide's **official terminology** — so drilling trained recognition of *named*
mechanisms. The real exam frequently describes the same mechanism
**functionally and unnamed**: "an automatic step that runs after each file edit
and enforces a constraint regardless of what the model decides" rather than "a
PostToolUse hook". Mapping an abstracted description back to a mechanism is the
difficulty delta.

The samples stayed — they do real work on form and rigour, and dropping them
would have regressed quality to fix diversity. What changed is what they are
*for*: exemplars of structure and rigour — **not** of difficulty. Someone who
sat the real exam reports the guide's samples read easy-to-moderate against it,
and that they name their tools and techniques outright where the exam describes
mechanisms by behaviour. So the samples set the form; the difficulty tiers and
the register set the level. Their phrasing is named explicitly as a floor to
move away from. The register mix (above) is the
mechanism. The hard constraint is that this varies how a **real** mechanism is
described, never **which** mechanisms are real — a functional-sounding invented
mechanism is the fabrication failure mode the guardrails already forbid, which
is why `screen_semantic.py` must resolve every functional question to a
specific real mechanism or flag it.

Difficulty is raised through abstraction and near-miss distractors only — never
through ambiguity, obscurity, or invented specifics. The real exam was harder
because principles were described indirectly, not because questions were tricky.

**2. The exam presents six FIXED scenarios in blocks, not interleaved.** Exam
guide v1.0 section 5: it draws 4 of 6 and asks 15 consecutive questions against
**one** scenario each, with the scenario held on the left and the branching
question on the right. The tool had the 4-of-6 draw but interleaved them across
the 60.

Fixing it took two passes, and the first was wrong in an instructive way. The
first attempt generated a shared scenario per block — which does give 15
questions one scenario, but an *invented* one. That is the same class of drift
as the terminology over-fit: plausible text that is not what a candidate sees.
The guide supplies the six verbatim, so `EXAM_SCENARIOS` now holds them and
generation is asked for a **branch** instead — the specific situation inside
the fixed scenario, which is what the exam's own sample questions are ("Production
data shows that in 12% of cases, your agent skips get_customer entirely…"
sitting under a fixed *Customer Support Resolution Agent* heading).

The distinction that made this confusing: a "scenario type" is a *genre*, and
every banked question invents its own scenario text — 103 questions, 103
distinct scenarios. Grouping by genre alone would leave a "persistent" panel
showing the wrong text. Grouping by a fixed scenario does not.

The **primary domains** per scenario come from the guide's own "Primary
domains:" lines. A version authored by reading the scenario prose instead had
four of the six wrong — the guide states them, so read them.

The same sitting is why the simulator has **mark-through** (strike out options
you have eliminated, without committing an answer). Note that the exam's
mark-for-review flag and the drill's *"Flag — don't count this question"*
control are different mechanisms and must stay that way: one marks a question
to return to, the other permanently discards a flawed bank question.

---

## Two ways to run

**Desktop app (dynamic — the primary mode).** Requires a project venv with
pywebview installed, and an authenticated Claude Code CLI:

```
python3 -m venv .venv && .venv/bin/pip install pywebview   # first run only
.venv/bin/python practice-exam/exam_app.py
```

Run it with the venv's interpreter, not a bare `python3`. This is the one entry
point that needs a third-party package — `generate_bank.py` and both screeners
import only the standard library through `exam_lib`, so system Python runs those
fine, which is exactly why a bare `python3` looks like it works right up until
the app fails with `ModuleNotFoundError: No module named 'webview'`.
`--selfcheck` reports resource paths and CLI discovery without opening a window.

`exam.html` opens in a native window. Questions are generated on demand by
shelling out to `claude -p` with a JSON-schema-constrained prompt; progress
persists to `practice-exam/exam_progress.json` (gitignored). The session's
first question comes from the unseen bank so the app starts instantly; the
next question is always pre-generated while you read the current explanation.
If the `claude` CLI is missing, the app silently runs bank-only.

**Static page (zero setup).** Open `practice-exam/exam.html` directly — by
double-click, or via the GitHub Pages copy published next to the course.
Questions come from the committed bank; progress lives in `localStorage` with
Export / Import buttons as the portable path. The three static origins
(`file://`, localhost, Pages) have separate `localStorage` — pick one, or move
progress with Export/Import.

The page detects the desktop bridge at runtime (`pywebviewready`) and upgrades
itself; the same HTML file serves both modes with no build step.

**Packaged executable (optional third form).** `exam_app.spec` builds the
desktop app into a standalone bundle (`pyinstaller practice-exam/exam_app.spec
--noconfirm --distpath practice-exam/dist --workpath practice-exam/build`).
Frozen builds resolve read-only assets from the bundle
(`exam_lib.RESOURCE_DIR` → `sys._MEIPASS`) and write progress to the
platform user-data directory instead of the bundle
(`~/Library/Application Support/ccaf-practice-exam/` on macOS). Dynamic
generation is unaffected: the claude CLI is never bundled — `find_claude()`
locates the system installation (PATH → known install dirs → login shell →
`CCARF_CLAUDE` override) even under the minimal PATH GUI launches receive.
`--selfcheck` prints bundle/environment diagnostics as JSON for verification
without opening the window. Builds are unsigned (Gatekeeper: right-click →
Open on first launch), per-platform, gitignored, and freeze the bank at build
time — the Python script stays the primary, always-current way to run.

Two traps produce an identical symptom — a permanently blank white window,
no exception, nothing in stderr — so `window_url()` guards against both:
(1) a bundle name with spaces (e.g. "CCAR-F Practice Exam.app") left unencoded
by naive f-string interpolation makes an invalid `file://` URI; (2)
PyInstaller's `.app` BUNDLE step places real files under `Contents/Resources`
and symlinks them from `Contents/Frameworks` per Apple's bundle convention,
but WKWebView's local-file loader silently refuses to follow that symlink.
`window_url()` handles both: `Path.as_uri()` percent-encodes the path, and
`.resolve()` dereferences the symlink before the URI is built. Regression
tests construct both failure shapes directly (`test_practice_exam_app.py`).

---

## Architecture and file responsibilities

```
practice-exam/
  exam.html             UI + mode detection; CCARF_SEED config object at the top
  adaptive.js           pure adaptive core (browser global + node-testable)
  questions.js          committed question bank — machine-written, human-reviewed
  generation_prompt.md  the single source of the generation prompt (placeholders)
  exam_lib.py           bank I/O, validation, claude -p invocation
  exam_app.py           pywebview desktop window + JS↔Python bridge
  generate_bank.py      author-side bank growth: generate → review → merge
```

Key implementation constraints, and why:

- **`claude -p` is invoked without `--bare`** — bare mode skips OAuth/keychain
  auth and would require an API key. Plain `-p` uses whatever authentication
  your Claude Code already has.
- **The subprocess runs from a neutral temp directory** so a repository's
  CLAUDE.md and hooks are not loaded into every generation call (this repo's
  TDD Stop hook would otherwise run pytest per question).
- **`--json-schema` constrains the output** to the question JSON shape; the
  result is validated locally as well, and one retry with the validation error
  fed back (the exam's own D4.4 pattern) precedes a friendly failure. On
  generation failure the app falls back to the bank.
- The model defaults to `claude-sonnet-5`; override with the `CCARF_MODEL`
  environment variable.

---

## The question bank

`questions.js` is machine-written (`exam_lib.render_bank()` is the only
writer). Each entry is the spec's question JSON plus:

- `id` — task statement + an 8-hex content hash over scenario/question/options;
  duplicate content is rejected at merge time.
- `provenance` — `{source, model, generatedAt, reviewed}` where `source` is
  `official-sample`, `seed-generated`, or `refill`.

**Every committed entry must have `reviewed: true`; pytest enforces this**, so
nothing machine-generated can land in the bank without a human pass. The
review hunts specifically for invented technical facts (flag names,
environment variables, configuration claims) — the fabrication failure mode
the generation prompt guards against.

Growing the bank:

```
python3 practice-exam/generate_bank.py --per-task 4        # resumable; gitignored pending file
python3 practice-exam/screen_mechanical.py                 # deterministic: shape, tells, dupes, mix
python3 practice-exam/screen_semantic.py                   # judgment: one reviewer per candidate
# … human review pass over questions_pending.json …
python3 practice-exam/generate_bank.py --merge             # flips reviewed, dedupes, rewrites bank
```

Concurrency is sharded by task statement: a whole statement goes to one worker
which walks its questions in order, so each generation still sees summaries of
all its predecessors for that statement, while different statements run in
parallel. Concurrency *within* a statement is what produced near-duplicate
pairs and previously forced `--workers 1`.

`screen_semantic.py` applies `screening_prompt.md` with one reviewer per
candidate and writes gitignored `questions_verdicts.json`. Fan-out is safe
there and unsafe in generation for the same reason: reviewers are independent
readers sharing no diversity state. Its most important output is the
**UNRESOLVED** list — functionally-phrased questions whose description no
reviewer could tie to a real mechanism, which is the
abstraction-became-fabrication failure mode. Verdicts annotate only; nothing
is deleted or merged automatically.

**Question register.** Each generated question is written in a `named` or
`functional` register, assigned as a generation input (never self-reported) and
stamped in `generate_question` — the only seam the bank refill, the fresh timed
exam, and the practice drill all share. `FUNCTIONAL_FRACTION` (0.45) sets the
share; `--functional-fraction` overrides it. Assignment aims the fraction at
pending + this run, so a batch resumed after failures repays what the failed
one left owed, and `--merge` reports the **realized** mix, not the assigned one
— generation failures, dedup discards and review deletions all move it.

**The length tell is bounded, not banned.** If the correct option is more than
`LENGTH_TELL_MAX_RATIO` (1.20x) the length of its longest rival,
`generate_question` raises and the candidate goes back through the
retry-with-error-feedback loop with the measured lengths.

The threshold is calibrated against the exam guide's own 12 sample questions,
not invented. Measured on their **verbatim** text, the correct answer is the
longest in **7 of 12**, with ratios 0.76, 0.87, 0.89, 0.97, 0.98, 1.01, 1.02,
1.04, 1.05, 1.06, 1.06, 1.29 and a mean of exactly 1.00. So the real exam has a
mild length tell, and a bank with *none* is as unrepresentative as one with a
strong tell: it would teach a candidate that the longest option is never right,
which is false where it counts. An earlier version rejected the tell outright
and drove the rate to 0/6 — over-corrected in the opposite direction.

1.20 sits deliberately **below** the guide's worst case, in the empty gap
between its second-worst (1.06) and its single outlier (1.29), so it admits
every margin the guide actually exhibits bar one.

> **Why an earlier revision of this section was wrong.** It quoted a guide max
> of 1.18 and a mean of 0.96. Those were measured on *our transcription* of the
> samples, which had silently compressed the options — unevenly, distractors
> harder than correct answers, some to 56% of the guide's length. Since these 12
> are the few-shot examples every generated question learns from, the
> transcription was not merely a bad measurement, it was plausibly a **cause** of
> the generated bank's tell. The options were restored verbatim from the guide
> (matched by content, not letter — `normalize_pending` permutes letters), which
> also removed PDF page-footer text that had bled into two options.

This is enforced in code because asking failed twice: the prompt has carried an
option-length rule since the bank was seeded, and restating the rule immediately
beside the task moved the *margin* (mean ratio 1.24 → 1.08) but not the
*ordering*. The prompt rule was also mis-specified: "no option more than 1.3× the
others" is fully satisfied by a correct answer that is longest by one
character. Ordering is what the exploit needs, so ordering is what is checked.
A tie is not a tell — "pick the longest" has no answer at a tie.

**The seeded bank was repaired, not just gated.** The gate binds new generation;
it did nothing for the 111 questions already banked at **81% longest-is-correct**
(mean 1.20, max 1.59). Each of the 53 over-threshold questions was rewritten by
adding substance to its *distractors* — never trimming the correct answer, whose
qualifying clauses are what make it correct — leaving the scenario, the question
and the correct letter untouched. Result: **34% longest-is-correct, mean 0.97,
max 1.19, none over threshold.** Chance is 25%, so neither "pick the longest"
(34%) nor "pick the shortest" (28%) is now worth playing.

> **The trap that repair walks into.** The first attempt padded distractors with
> the *reason they were wrong* — "…without addressing the overlapping tool
> descriptions", "…relying on the model rather than a checked result". That trades
> the length tell for a strictly worse one: the correct answer becomes the only
> option not arguing against itself. Padding must be concrete detail about what
> the option would *involve*, written as a confident proposal. A distractor's
> wrongness belongs in its explanation, never in its option text. The repair
> script gated on this mechanically as well as instructing it.

One official sample exceeds the threshold at 1.29. That is the guide's own
wording, so it is left alone; the gate is enforced on generation only.

**The rate is controlled separately from the margin.** `LENGTH_TELL_MAX_RATIO`
bounds how far the correct option may outrun its rivals on *one* question. It
says nothing about how *often* the correct option is longest, and that gap is not
theoretical: generation settles just under the cap, so every question passes
while the batch rate climbs. A margin gate alone cannot hold a rate, because it
only ever says "not this much", never "not this often".

So the posture is planned, not filtered. Each question is assigned `"longest"` or
`"not-longest"` up front from a shuffled plan with an exact count
(`length_plan`), the assignment goes into the prompt, and `generate_question`
rejects a candidate that violates it — feeding the retry loop that already
exists. The rate is then a property of the plan rather than of whatever
generation drifts to. `LENGTH_LONGEST_FRACTION` is **0.35**.

**Enforced in both directions, which is not optional.** The first build only
rejected a `"longest"` result in a `"not-longest"` slot, leaving `"longest"`
as a permission the model could decline. That is not a rate control: an
unenforced permission can only ever *lose* longest-is-correct slots, never gain
them, so the realized rate is bounded above by the plan and sits below it by
however often generation declines. A live run declined once in two. Both
directions now raise. The `"longest"` rejection says explicitly not to shorten
the distractors to comply — the cheap fix would reinstate the short-flat-
distractor defect the whole exercise removes. Measured on a live run after the
change, four of four completed generations honoured the posture with distractors
still full (a `"longest"` question at 370 chars correct against distractors of
297/319/342).

Three properties of that shape are load-bearing:

- **Shuffled, not bucket-spread**, for the same reason as the register: a
  predictable posture is its own tell, since a candidate who works out which
  stretch of the form rewards the shortcut can play it there.
- **Concurrency-safe.** The plan is computed up front, so each worker carries its
  own assignment. A running-rate feedback loop would need shared state and would
  break under the statement-sharded parallelism.
- **Never stamped on the question.** Unlike the register — a generation intent
  not recoverable from the text — posture is measurable from the options, so a
  stored field could only ever disagree with the content it describes. Nothing
  was added to the schema and no ids moved.

Reaches all three generation paths, as the register does: refill
(`plan_length_postures`, which repays a partial batch's shortfall rather than
restarting the mix), the fresh timed form (`examLengthPlan`), and the drill
(`drawLengthPosture`, drawn per question because a drill has no sequence to
spread a plan across, so its rate holds in expectation rather than exactly).
`generate_bank.py --merge` reports the realized rate on the merged bank, not just
the batch — a batch can sit on target while the bank it joins does not.

**Why 0.35 and not 0.25 or 0.58.** Chance is 25% (four options, one correct), so
at 0.35 the "pick the longest" shortcut is worth about nine points over blind
guessing — far below what knowing the material scores, and therefore not a
strategy worth playing. Deliberately *below* the guide's own 58%: reproducing
that would reinstate a shortcut scoring 58% without reading, which is the defect
the repair removed. Deliberately *above* 0, because a bank with no tell teaches
that the longest option is never right, which the real exam refutes.

**Still open:** the plan aims at the batch, not at the bank's history. A batch
held on target converges the bank on it, but a bank already off-target is not
actively corrected — that was a deliberate choice, since correcting history from
one batch would swing a small batch to all-one-posture. If the bank drifts
(screening deletions correlating with posture would do it), the merge report
surfaces it and a repair pass, not the plan, is the remedy.

**`scenarioType` backfill.** `classify_scenarios.py --classify` proposes a
scenario genre for every unlabelled banked question into a gitignored file for
review; `generate_bank.py --merge-classifications` applies them. Labelling
cannot change an id (`canonical_content` hashes only scenario/question/options),
which is what makes backfilling 103 committed questions safe. Run
`classify_scenarios.py` with no arguments for the **scenario × domain matrix** —
that, not a per-scenario histogram, is what decides whether a grouped bank form
can be drawn, since a draw must find each domain's full quota inside its four
scenarios.

When a batch generates several questions for one task statement, each is
pinned to a different exam scenario type and the prompt carries summaries of
that statement's existing questions (premise, option skeleton, correct-answer
rationale) with instructions not to reuse them — preventing the
template-reskinning failure mode observed in the first seed run.
`screening_prompt.md` is the standing prompt for the pre-review screening
pass; its grounding rule makes the CCAR-F exam guide authoritative over
product docs, with genuine fabrications (facts in neither source) remaining
disqualifying.

The committed **`/exam-refill` skill** (`.claude/skills/exam-refill/` — the
one path un-ignored inside `.claude/`) walks this whole pipeline in Claude
Code: status → targeted single-worker generation → screening → the required
human review → merge + pytest.

Static-mode selection prefers unseen questions within the drawn task
statement, falling back to least-recently-seen; questions flagged as flawed go
on a persistent blocklist and never return.

---

## Timed exam mode

The **Timed exam (60 Q)** control runs a full-length simulation. Two question
sources, chosen at start:

- **From the question bank** (both runtimes, instant): 60 questions drawn to
  the real exam's domain weighting (`EXAM_FORM_QUOTAS`: D1 16, D2 11, D3 12,
  D4 12, D5 9 — mirrored in `adaptive.js` and `exam_lib.py`, sync-tested).
  Within each domain the draw round-robins across task statements, takes
  unseen questions before repeats, and excludes flagged ids. pytest guards
  that the bank can always fill a form.
- **Fresh questions** (desktop app with Claude Code only): live generation
  instead — never the same exam twice, and the faithful readiness gate (the
  bank exam is a standard-difficulty approximation, since the bank is
  single-tier). Presented as **4 blocks of 15 consecutive questions, each block
  sharing ONE scenario** (`drawExamBlocks`), mirroring the real exam. The
  block's scenario is generated once up front (`generate_scenario`, 4 calls)
  and then handed to each of its 15 question calls as a fixed input;
  `generate_question` overwrites the returned scenario with the supplied text,
  so block-mates are byte-identical rather than merely similar. Two concurrent
  workers generate through the bridge; each question carries summaries of its
  within-block siblings (including the question stem, since the shared scenario
  carries no signal within a block) so the 15 diversify. The exam begins once
  the first 10 questions are ready (a progress gate; the 120-minute clock
  starts at Begin, not during preparation) and the rest keep generating in the
  background. If the user ever reaches an unready slot, the clock freezes until
  it arrives; a slot whose generation fails twice falls back to a bank question
  for the same statement, stamped `offScenario` because it brings its own
  scenario and so breaks the block's shared text. Generated questions are
  ephemeral: no ids in `seen`, nothing persisted beyond the attempt record. A
  fresh exam makes ~64 Claude Code calls.

  A block's scenario is **not generated**. The exam has six fixed scenarios
  (exam guide v1.0 section 5) and shows the drawn one as standing context while
  its questions branch from it, so `EXAM_SCENARIOS` holds them verbatim and a
  block simply looks its own up. Generation is asked for a **branch** — one or
  two sentences of specific situation inside that scenario, which lands in the
  question's `scenario` field and is rendered with the stem, not in the panel.
  This removed four generation calls per form, but the reason for it is
  fidelity: inventing a scenario the exam never uses is the same class of drift
  as the official-terminology over-fit.

  **The panel keys off `scenarioType` alone, never off provenance**
  (`scenarioPanelFor` in `adaptive.js`). Holding still for a whole block is the
  entire point of the split, so anything that can move it mid-run defeats it.
  A version that gave the guide's own sample questions their standalone
  scenario in the panel — to avoid restating context for a question that never
  was a branch — read fine on any single question and was wrong in aggregate:
  the bank's 13 samples are scattered, so **61% of blocks flipped the panel
  mid-run and back**, observed live as the scenario changing between questions
  4, 5 and 6. Their scenario shows as the branch instead. The one exception is
  an `offScenario` substitute, whose scenario may genuinely belong to a
  different block — that flip is declared degradation, not a silent one.

  The rule lives in `adaptive.js` rather than in the page because it is pure
  logic, so it is asserted against real inputs instead of by grepping `exam.html`.

  Blocks satisfy the global domain quotas exactly, and each block's 15 are
  **weighted** toward its scenario's primary domains (`SCENARIO_PRIMARY_DOMAINS`,
  target ≥8 of 15) rather than restricted to them. The primary-domain map is
  **transcribed from the guide's own "Primary domains:" lines**, not inferred —
  an earlier version authored from the scenario prose had four of the six
  wrong. Note three scenarios name three domains and three name only two; that
  asymmetry is the guide's — D1 alone needs 16 of 60,
  more than one block holds, so a domain-pure block is impossible. Some 4-of-6
  draws leave a domain primary in no drawn block at all (D4 is primary for only
  two scenarios); the assembler reports the shortfall rather than hiding it.
  Difficulty tiers stay spread across all 60 (1–3 hard per block), not
  clustered.

  The bank exam gets a **grouped** approximation of the same shape
  (`drawExamBlockedForm`): 4 runs of 15 sharing a scenario *type*. Banked
  questions each carry their own scenario, so a run shares a genre, not a
  scenario — the UI says so. It needs a scenario-labelled bank
  (`classify_scenarios.py`) and falls back to the interleaved draw otherwise.

- **Prepared forms** (desktop app): build a whole form in the background from
  the setup card, sit it later with no wait and no mid-exam pause. Persisted
  after every question (`exam_forms.json`, gitignored) so a 15–30 minute run
  survives a crash or a usage cap; question ids are form-scoped
  (`form-<id>-slot<N>`) because `gen-<slot>` would collide across stored forms.

  A form that stopped part-way is **resumable** — `runFormJob` is shared by
  prepare and resume and skips slots that already hold a question, so it fills
  only the gaps. This matters more than it looks: a usage cap aborts the run and
  an ordinary content failure leaves that one slot null, and since a form must
  be complete to sit, without resume the persisted work would be stranded
  rather than saved. **Review** opens the form block by block — scenario plus
  each question's statement, tier and register — and any question can be
  regenerated in place. Regeneration mints a new slot id rather than reusing the
  old one, so the same id never comes to mean different content.
  The job holder is `app.formJob`, deliberately separate from `app.freshPrep`
  — leaving the setup card cancels a fresh-exam prep, and a background job
  reachable by that path could not survive the user navigating away. Sitting a
  form stamps `satAt`; re-sitting warns, because prepared-form questions are
  ephemeral and leave no `seen` marks, so a second sitting scores recall rather
  than readiness. Prepared forms never flow into `questions.js`.

**Difficulty spread (fresh exam).** `examDifficultyPlan` assigns each of the 60
slots a tier — **36 standard / 15 harder / 9 hard-tail** (60/25/15) — with the
9 hard-tail bucket-spread across the sequence so they never cluster. The tiers
map to generation instructions: standard = mid (guide Q1/Q10 register); harder
= one strong near-miss resolved by applying the right principle; hard-tail =
two-plus surface-defensible options split by a single exam principle (guide Q9
register). Hard comes only from subtle-but-real discriminators; the fabrication,
deprecated-pattern, and exam-guide-grounding guardrails bind at every tier and
hardest at the tail. **Calibration caveat — read before retuning:** this spread
and the hard-tail register are calibrated to the exam guide v1.0's 12 sample
questions, which is an *inference*, not a measurement against the real exam. It
is a known, accepted limitation. After a real exam sitting, the hard tail is
the first thing to recalibrate against actual difficulty data — treat the
guide-inferred level as the starting hypothesis, not ground truth.

Because generated questions skip human review, the results screen lets any
question be **flagged as flawed and discounted**: the attempt is rescored as if
the question was never on the form (out of 59, 58, …), shown as a clearly-
labeled post-discount estimate *beside* the raw estimate — never replacing it.
The persisted `examHistory` record always keeps the **raw** scaled score, so a
discount cannot quietly inflate the readiness signal. Flawed bank questions
additionally join the permanent blocklist. Already-applied weight updates are
kept (a single ×1.5 on one statement self-corrects through drilling).

Delivery, scoring, and state effects (shared by both sources):
- **Delivery:** 120-minute countdown, no task-statement labels, no feedback
  until scored. **Skipping is allowed**, matching the real exam: `Skip →` moves
  on without committing an answer, leaving the question blank. Backward
  navigation revisits any earlier question and its answer stays changeable
  within the window. `Mark for review` tags a question as worth revisiting —
  session-only navigation state, deliberately distinct from the practice-mode
  "Flag — don't count this question" control, which permanently discards a
  flawed bank question. The **review screen** is reachable at any time (it is
  how skipped questions get found), showing all 60 with a dashed border on
  blanks, a bar on marked questions, an answered/skipped/marked tally, and a
  "Go to next unanswered" jump that wraps. Scoring happens only on final submit
  or clock expiry; submitting with blanks remaining asks for confirmation first,
  and unanswered questions score as incorrect. The attempt lives in memory only
  — closing the page abandons it (the page warns).

  The pure navigation logic lives in `adaptive.js` under `A.nav` (form-id
  resolution across a sparse form, unanswered/marked indices, progress summary,
  next-unanswered search), unit-tested in `adaptive.test.js`. `exam.html` holds
  only the DOM wiring, guarded by text-level contract tests in
  `test_practice_exam_app.py` — including one asserting `exam_app.spec` bundles
  every script `exam.html` loads, since a missing entry there breaks the frozen
  desktop app while the browser build keeps working.
- **Scoring:** the headline is the **raw** correct-out-of-60 and an
  *approximate* scaled score (linear 100–1000 map; the real exam uses
  equating) against the 720 bar, with a per-domain breakdown and a full
  expandable review with all explanations. A post-discount estimate appears
  beside the raw number only when questions have been discounted; raw always
  stays visible.
- **State effects:** results update weights, accuracy stats, and seen marks
  exactly like drill answers, and append one record to `examHistory` (capped
  at 20). Drill `history` is deliberately untouched — it drives the cooldown
  and would be wiped by 60 batch entries.

## Coverage-first selection and difficulty tiering

Pure weighted-random selection can starve a high-weight statement for many
questions and, once a learner is answering everything correctly at the base
difficulty, stops discriminating. Two mechanisms in `adaptive.js` address this;
both are durable app behavior driven by the persisted state, not session
context.

**Coverage-first draw.** Before weighted-random runs, `drawTaskStatement`
checks for statements at weight ≥ 2.0 not yet seen twice (`coverageOwed`).
While any exist, the draw is restricted to that owed set: strictly least-seen
first (so never-tested statements lead), effective weight then task-statement
id as tiebreaks, the standard 5-statement cooldown, and a domain-interleave
nudge so equal-priority picks don't stack the same domain and telegraph the
answer category. Only once every weight ≥ 2.0 statement has reached seen ≥ 2
does selection revert to pure weighted-random. Render-time prefetch draws
before the on-screen question is graded, so the draw takes an `exclude` for the
current statement to prevent a back-to-back repeat.

**Difficulty tiering.** `difficultyFor` returns `standard` on a statement's
first exposure; `hard` once it is mastered — seen ≥ 3 with a perfect record
(the mastery bar), or after one correct **standard** answer earned in-app (the
second-pass escalation). Hard questions instruct the generator to make two
options surface-defensible with the distinction turning on a single exam
principle (modeled on the exam guide's scoped-verify_fact sample); the
fabrication guardrail still binds — harder means a sharper principle, never
invented specifics. Imported correct answers carry no tier tag, so they raise
the mastery-bar counts but do not by themselves trigger second-pass escalation.

**Conditional hard floor.** A hard-eligible statement's effective weight is
floored at 1.0 (a floor, not a boost — it lifts only what sits below 1.0 and
preserves the ordering above) so earned decay cannot suppress the statements
most in need of stress-testing at the hard tier. The floor releases once the
statement has answered two hard variants, after which true earned decay
resumes. It never resurrects a statement excluded by coverage or availability.

**Import.** Weights load from the state file as-is — decays below 1.0 are
earned evidence and are never re-seeded. If the file omits a statement it
defaults to 1.0; nothing else is reset.

## State

One schema everywhere (desktop file, localStorage, exports):

```json
{ "version": 1,
  "weights":  { "D1.1": 3.0, "…": 1.0 },
  "stats":    { "totalAnswered": 0, "totalCorrect": 0, "totalFlagged": 0,
                "perTask": { "D1.1": { "seen": 0, "correct": 0,
                                       "stdSeen": 0, "stdCorrect": 0,
                                       "hardSeen": 0, "hardCorrect": 0 } } },
  "history":  [ { "t": "D1.2", "q": "D1.2-a3f9c2b1", "c": true, "at": 0, "d": "standard" } ],
  "seen":     { "<questionId>": 0 },
  "flagged":  [ "<questionId>" ],
  "examHistory": [ { "at": 0, "correct": 42, "total": 60, "scaled": 730 } ] }
```

`history` keeps the last 50 answers and drives the 5-statement cooldown; each
entry's `d` records the difficulty tier it was earned at, so an exported /
re-imported record is unambiguous about which tier a streak came from. The
per-tier `perTask` counters (`stdSeen`/`stdCorrect`/`hardSeen`/`hardCorrect`)
drive difficulty escalation and the floor release and survive history trimming;
imported entries carry only `seen`/`correct` and the tier counters default to
0. Import validates the version and task-statement keys and never destroys
existing state on a bad file. Reset restores the seed; the **Blank slate**
button sets every weight to 1.0 without touching accuracy history (use #2 of
the seed configuration, no code edit required).

---

## Known fidelity gaps

Places where this tool knowingly diverges from the real exam. Each is recorded
with what would close it, so a gap is never mistaken for a bug or for fidelity.

**~~Multiple-response items are not modeled.~~ CLOSED — single-answer is
fidelity, not a gap.** Exam guide v1.0 §3 states the item format is
"multiple-choice and multiple-response items; each item states how many responses
to select." This section used to record that as a gap, and named its own closing
condition: *"a first-hand account of the item format after a real sitting."*

That account now exists. **A real sitting encountered no multiple-response items
at all.** So the guide overstates the format, every question here being
single-answer is correct behaviour, and a score is no longer a floor for this
reason. Nothing to build.

*Reopen if:* a later sitting does encounter them, or a guide revision publishes a
worked example. The two traps below are kept because they are the expensive part
and would otherwise have to be rediscovered — not because anything is pending.

*Two traps, learned from implementing this in the Associate repo.* Both come from
changing the answer's data shape and missing a consumer, and neither is caught by
any existing test — the option-count one in particular is invisible while every
item still has four options:

1. **Four loops hard-code `["A", "B", "C", "D"]`** — the practice-mode option
   render, the exam-mode option render, the results review's explanation list, and
   the immediate-reveal explanation list. A five-option item silently loses option
   E: never rendered, never selectable, explanation never shown. Drive all four
   from the item's own option keys.
2. **Three sites compare against a bare answer string** — `key === chosen` in the
   results review, and the review grid's `"  " + committed` and
   `` `answered ${committed}` ``. Once an answer is an array these break
   *for single-answer items too*: a string is never `===` an array, and `+`
   coercion prints `"D,B"` in click order rather than a sorted, spaced label.

Ship the shape change and every consumer together, and add a test asserting a
five-option item actually renders five options.
(The adjacent CCAO-F exam has the same item format, and one observed authored
practice set for it runs ~17% multiple-response with 5 options on those items —
but that is a different exam and a third party's inference, so it is calibration
input for CCAO-F, not evidence about CCAR-F.)

---

## Testing

`pytest -v` covers the bank format and validation (`test_practice_exam_bank.py`),
generation with a mocked CLI and the desktop bridge (`test_practice_exam_app.py`),
and the adaptive core via `node --test` (`test_practice_exam_js.py`, which also
locks the JS and Python task-statement catalogs together). All tests run
offline; the real `claude -p` path is verified manually by running the app.
