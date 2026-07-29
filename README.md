# Python for AI Consultants

A from-zero on-ramp to Python and the Anthropic Claude SDK, built as preparation
for the **Claude Certified Architect (CCAR-F)** exam. Works as a responsive study
companion alongside Anthropic's official Skilljar course.

**[Open the live course][live-course]** · [Wiki][wiki]

## What's Here

- **Modules 1–3:** Python syntax, data types, JSON handling
- **Module 4:** API calls, multi-turn conversations, system prompts, and prompt
  caching via the Anthropic SDK
- **Claude Code CLI:** non-interactive mode and CI/CD pipeline patterns
- **`consulting_assistant.py`:** a working assistant demonstrating system prompt
  design, multi-turn conversation state, and prompt caching
- **11 passing tests** across all modules

## Prerequisites

Python 3.9+, and Claude Code installed. You will also need an Anthropic API key,
available from [console.anthropic.com][console] or provided by your organization's
Anthropic Admin. New to the setup? See the [Environment Setup][env-setup] wiki
page for step-by-step instructions including VS Code and optional Jupyter support.

## How to Start

1. Open the [live course][live-course] — no download needed.
2. Work through the exercises; the lesson and test files in this repo are the
   output.
3. See [Using This Repo As A Study Companion][study-companion] for how to use
   Claude alongside the course as an on-demand instructor.

## CLAUDE.md

This repo ships a `CLAUDE.md` at the root that configures Claude Code as a tutor
for every session: test-driven workflow, surface broken tests rather than paper
over them, and never touch secrets. See [Build Your Own Study Companion][build-your-own]
for how to fork and personalize it.

## Adaptive Practice Exam

An adaptive, scenario-based practice exam for the CCAR-F. It tracks performance at
the individual task-statement level (the 30 skills the exam tests) and weights
future questions toward the areas where you are weakest. Performance persists
across sessions. Two ways to run it:

**Local desktop app (recommended).** Runs on your machine with no API key — question
generation goes through your own authenticated Claude Code CLI. Run these from the
repository root (the paths are relative to it):

```
cd Consulting-python
pip install pywebview
python3 practice-exam/exam_app.py
```

Fresh questions are generated on demand and your progress lives in a plain JSON
file. Without the Claude Code CLI the app still works, drawing from the reviewed
question bank instead. You can also open [`practice-exam/exam.html`][exam-live]
directly (or on the live site) with zero setup — bank questions, progress in
browser storage. Either way, a **Timed exam** mode runs a full 60-question,
120-minute simulation matching the real exam's domain weighting (27/18/20/20/15)
and its 4-of-6 scenario structure, with question skipping, mark-for-review,
backward navigation, an always-reachable review screen, and an approximate
scaled score against the 720 bar. In the
desktop app, **fresh questions generated live** carry the exam's difficulty
spread — mostly mid, a quarter harder, a ~15% hard tail — making it the faithful
readiness gate; the bank exam is instant but a standard-difficulty approximation
that runs easier. (That difficulty is calibrated to the exam guide's sample
questions — an inference to recalibrate after a real sitting; see the spec.) To
grow the question bank, run the committed `/exam-refill` skill in Claude Code —
it walks the generate → screen → review → merge pipeline. Design details:
[`practice-exam/local_practice_exam_spec.md`][local-spec].

Prefer a double-clickable app? Build one from the committed spec (binaries are
not checked in). Again from the repository root, using the project venv:

```
cd Consulting-python
.venv/bin/pip install pyinstaller   # first build only; skip if already installed
.venv/bin/pyinstaller practice-exam/exam_app.spec --noconfirm \
    --distpath practice-exam/dist --workpath practice-exam/build
```

That produces `practice-exam/dist/CCAR-F Practice Exam.app` with the question
bank frozen in and progress stored under your user data directory. Dynamic
generation still works — the app finds your system-installed Claude Code CLI
at runtime. Because the build is unsigned, macOS Gatekeeper blocks the first
launch: **right-click → Open → Open** once, and it runs normally after that.
Note the frozen bank doesn't update with `git pull` — rebuild to pick up new
questions.

**Claude.ai artifact.** The original variant: paste
[`practice-exam/practice_exam_build_prompt.md`][build-prompt] into a new Claude.ai
conversation and Claude builds the tool as a React artifact in four phases,
generating questions with the artifact environment's built-in API access.

Either way, the seed configuration (starting weights for every task statement)
lives in a single commented object — at the top of `exam.html` locally, or at the
top of the generated artifact. Edit it to keep the author's known weak areas, reset
everything to 1.0 for a blank slate, or set your own. The design rationale is in
[`practice-exam/practice_exam_spec.md`][exam-spec].

If a generated question looks wrong, flag it so it can't skew your weights — see
[When to flag a question](practice-exam/practice_exam_spec.md#when-to-flag-a-question)
for the three tells (invented specifics, two defensible answers, an outdated
pattern as the answer); flagging fully discards the question.

**Which to use, and when.** The two are stages of one progression. The artifact
is the on-ramp — zero-friction, weighted-random discovery — best for your first
30–50 questions while weights are still forming. Move to the local app once you
see perfect standard-difficulty streaks and high-weight statements the random
draw keeps missing: it adds coverage-first selection and difficulty tiering. The
handoff carries earned weights via a progress export into the local app's
`exam_progress.json` — shipped in the build prompt (Phase 5), so an artifact
built or rebuilt from the current prompt exports; one built earlier must be
rebuilt to gain it.

## Preparation Exercises

The [`exercises/`](exercises/README.md) folder expands the exam guide's four
recommended hands-on exercises into phased, gated builds — fixtures, mocks,
and test skeletons are scaffolded; you write everything the exam tests (the
agentic loop, the enforcement hook, the schemas, the coordinator, and every
test assertion). Start at `exercises/README.md`; recommended order 1 → 4 →
3 → 2.

---

[live-course]: https://tfurland-la.github.io/Consulting-python/python_course.html
[wiki]: https://github.com/tfurland-la/Consulting-python/wiki
[console]: https://console.anthropic.com
[env-setup]: https://github.com/tfurland-la/Consulting-python/wiki/Environment-Setup
[study-companion]: https://github.com/tfurland-la/Consulting-python/wiki/Using-This-Repo-As-A-Study-Companion
[build-your-own]: https://github.com/tfurland-la/Consulting-python/wiki/Build-Your-Own-Study-Companion
[build-prompt]: https://github.com/tfurland-la/Consulting-python/blob/main/practice-exam/practice_exam_build_prompt.md
[exam-spec]: https://github.com/tfurland-la/Consulting-python/blob/main/practice-exam/practice_exam_spec.md
[exam-live]: https://tfurland-la.github.io/Consulting-python/practice-exam/exam.html
[local-spec]: https://github.com/tfurland-la/Consulting-python/blob/main/practice-exam/local_practice_exam_spec.md
