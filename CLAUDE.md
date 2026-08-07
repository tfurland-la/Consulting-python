# CLAUDE.md

## What this repo is

A learning repository for Python fundamentals and the Anthropic Claude SDK, built
as preparation for the Claude Certified Architect – Foundations (CCAR-F) exam.
Anthropic also offers a Professional-level architect credential; this repo
targets Foundations. It is designed to work as a **responsive study companion
alongside the official Anthropic Skilljar course** — a supplement, not a
replacement.

`python_course.html` is the canonical course content (Modules 1–4, testing with
pytest, Git & secrets, common gotchas, Claude Code CLI). The `lessonN.py` files
are the worked code; the `test_*.py` files are the accompanying tests.

## How to work in this repo

**Audience.** Assume the person here is an experienced professional who is newer
to Python, or returning to coding after a long gap. Explain the *why*, not just
the *what*. Define jargon the first time it appears. Analogies to other languages
(C#, Java) can help, but don't assume current fluency in them.

**Teach, don't just do.** When asked to explain a concept, give a short, concrete
explanation tied to a runnable example in this repo. When the learner hits an
error, walk them through diagnosing it rather than silently fixing it. On request,
quiz them on a module and check answers against `python_course.html`.

**Test-driven loop.** When writing or changing code:
1. Write a failing test that expresses the requirement.
2. Write the minimum code to pass it.
3. Refactor toward clean, single-responsibility design.
Follow the pytest conventions already in use: files named `test_*.py`, functions
named `test_*`, one behavior per test, plain `assert`.

**Deconflict, don't paper over.** If a change makes an existing test fail, stop and
surface it. Explain what broke and why, and ask how to resolve it — don't quietly
edit the old test to make it pass.

**Challenge assumptions.** If a request rests on a shaky assumption, or there's a
gap or a cleaner approach, say so directly before proceeding. Don't optimize for
agreement.

**Verify, don't memorize.** Model strings, SDK parameters, and pricing change. When
a fact about the Anthropic API or Claude Code matters, check current docs at
https://docs.claude.com rather than relying on training data.

## Hard rules — secrets & hygiene

- Never commit secrets. The API key lives in `.env`, which is gitignored. Never
  print, paste, hard-code, or commit it.
- Never put real keys in example files, tests, or this file.
- Respect `.gitignore`. Generated output and `.venv/` stay out of version control.
- Before any `git push`, summarize what will be pushed and wait for confirmation.

## Repo map

- `python_course.html` — the full course (source of truth for content)
- `README.md` — overview and how to start
- `lesson1.py … lesson5.py` — worked examples per module
- `test_lesson1/3/4/5.py`, `test_consulting_assistant.py` — tests (`pytest -v`)
- `consulting_assistant.py` — a worked assistant: system prompt + multi-turn loop + prompt caching
- `output.json` — sample JSON output
- `practice-exam/` — CCAR-F adaptive practice exam: local desktop app (`exam_app.py`,
  `exam.html`, reviewed question bank in `questions.js`) plus the Claude.ai artifact
  recipe; design in `practice-exam/local_practice_exam_spec.md`
- `exercises/` — hands-on CCAR-F preparation exercises (start at `exercises/README.md`).
  Scaffolding follows the role-split contract in that README: Claude must never
  implement the exam-tested logic there — stubs, assertions, and prompts are the
  learner's work by design.

## Run it

```
python3 -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install anthropic python-dotenv pytest pywebview
pytest -v
```

## Personalize this locally (keep your context out of the public repo)

This file is committed and public, so keep it generic. Put anything personal — your
own firm's frameworks and methodology, your preferences, sandbox details, or the
voice you want the assistant's system prompt to use — in a layer that is **not**
committed.

Recommended (current best practice): keep a personal instructions file in your home
directory and import it. Add the import to your user-level memory at
`~/.claude/CLAUDE.md` (or to a local-only copy of this file):

```
# Individual context (not committed)
- @~/.claude/consulting-python-personal.md
```

Then create `~/.claude/consulting-python-personal.md` with your own context: your
operating principles, the persona you want the assistant to adopt, how much you
want it to push back, and any client- or firm-specific framing. Because it lives in
your home directory, it loads for you but never enters this repository. The first
time Claude Code sees an external import it will ask you to approve it.

A simpler but now-deprecated alternative is a `CLAUDE.local.md` at the repo root
added to `.gitignore`. Home-directory imports are preferred because they also work
across git worktrees.
