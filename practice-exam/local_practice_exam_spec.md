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
*for*: exemplars of structure and difficulty, with their phrasing named
explicitly as a floor to move away from. The register mix (above) is the
mechanism. The hard constraint is that this varies how a **real** mechanism is
described, never **which** mechanisms are real — a functional-sounding invented
mechanism is the fabrication failure mode the guardrails already forbid, which
is why `screen_semantic.py` must resolve every functional question to a
specific real mechanism or flag it.

Difficulty is raised through abstraction and near-miss distractors only — never
through ambiguity, obscurity, or invented specifics. The real exam was harder
because principles were described indirectly, not because questions were tricky.

**2. The exam presents scenarios in blocks, not interleaved.** It draws 4 of 6
scenarios and asks 15 consecutive questions against **one** scenario each, with
the scenario held on the left and the branching question on the right. The tool
had the 4-of-6 draw but interleaved the scenarios across the 60. Fixing it
needed a content change, not just a presentation one: a "scenario type" here is
a *genre*, and every question used to invent its own scenario text — 103 banked
questions, 103 distinct scenarios — so grouping by type alone would have left a
"persistent" panel showing the wrong text.

The same sitting is why the simulator has **mark-through** (strike out options
you have eliminated, without committing an answer). Note that the exam's
mark-for-review flag and the drill's *"Flag — don't count this question"*
control are different mechanisms and must stay that way: one marks a question
to return to, the other permanently discards a flawed bank question.

---

## Two ways to run

**Desktop app (dynamic — the primary mode).** Requires Python, `pip install
pywebview`, and an authenticated Claude Code CLI:

```
python3 practice-exam/exam_app.py
```

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

**The length tell is rejected, not requested.** If the correct option is
strictly the longest of the four, `generate_question` raises and the candidate
goes back through the retry-with-error-feedback loop with the measured lengths
and a concrete instruction. This is enforced in code because asking failed
twice: the prompt has carried an option-length rule since the bank was seeded
and the bank is **85% longest-is-correct** (a candidate who reads nothing and
picks the longest scores 85%), and restating the rule immediately beside the
task moved the *margin* (mean ratio 1.24 → 1.08) but not the *ordering* (still
6/6). The prompt rule was also mis-specified: "no option more than 1.3× the
others" is fully satisfied by a correct answer that is longest by one
character. Ordering is what the exploit needs, so ordering is what is checked.

Measured on a 6-question batch: 0/6 longest-is-correct, correct answers landing
at rank 2–4 of 4, at a cost of ~1.5 calls per question (half the batch needs
the retry, and a question that keeps the tell twice is recorded as a failure
and re-run rather than banked). A tie is not treated as a tell — "pick the
longest" has no answer at a tie.

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

  Blocks satisfy the global domain quotas exactly, and each block's 15 are
  **weighted** toward its scenario's primary domains (`SCENARIO_PRIMARY_DOMAINS`,
  target ≥8 of 15) rather than restricted to them — D1 alone needs 16 of 60,
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

**Multiple-response items are not modeled.** Exam guide v1.0 §3 states the item
format is "multiple-choice and multiple-response items; each item states how many
responses to select." Every question in this tool is single-answer: `correct` is
one option key, options render mutually exclusive, and scoring is an equality
check. All 103 banked questions are single-answer, and `generation_prompt.md`
asks for one correct answer and three distractors by design.

*Why it is not built:* the guide publishes no worked multiple-response example —
all 12 sample questions in §9 are single-answer — so three parameters are simply
unknown: how many options such items carry, how many are correct, and whether
scoring is all-or-nothing or partial credit. An implementation would have to
invent all three, and a practice exam that invents its own scoring
misrepresents readiness in the one direction that matters.

*Effect on you:* a scored result here reflects single-answer performance only.
Treat it as a floor rather than a calibrated prediction, since multiple-response
items are usually harder than single-answer ones on the same content.

*What would close it:* an authoritative example — a multiple-response sample in a
future guide revision, or a first-hand account of the item format after a real
sitting. With that in hand the change is contained: `correct` becomes an array
normalized at bank load, a `selectCount` field drives a "Select N" stem and an
N-selection gate in the UI, and the equality check becomes set equality.

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
