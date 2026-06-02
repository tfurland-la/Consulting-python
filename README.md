# Python for AI Consultants

A from-zero on-ramp to Python and the Anthropic Claude SDK, built as preparation
for the **Claude Certified Architect (CCA-F)** exam. Works as a responsive study
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

---

[live-course]: https://tfurland-la.github.io/Consulting-python/python_course.html
[wiki]: https://github.com/tfurland-la/Consulting-python/wiki
[console]: https://console.anthropic.com
[env-setup]: https://github.com/tfurland-la/Consulting-python/wiki/Environment-Setup
[study-companion]: https://github.com/tfurland-la/Consulting-python/wiki/Using-This-Repo-As-A-Study-Companion
[build-your-own]: https://github.com/tfurland-la/Consulting-python/wiki/Build-Your-Own-Study-Companion
