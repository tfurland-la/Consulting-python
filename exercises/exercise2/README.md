# Exercise 2 — Claude Code Team Configuration

**Domains:** D3 (all of it), D2.4
**Task statements:** D3.1, D3.2, D3.3, D3.4, D2.4
**Estimated effort:** 1–2 sessions

This exercise is configuration and observation, not a Python build — so it
runs in a **separate scratch repo** at `~/claude-config-lab`, already created
with a token monorepo shape (`frontend/`, `backend/`, `infra/`, test files
colocated with source). Experiments there can't pollute either working repo.
The stub files are near-empty by design: the exercise is the configuration.

Everything below happens *in that repo*, driving Claude Code interactively.
Nothing in this folder needs code.

---

## Phase 1 — CLAUDE.md hierarchy

Write a root `CLAUDE.md` with repo-wide conventions; a subdirectory
`backend/CLAUDE.md` with stack-specific rules; something personal in
`~/.claude/CLAUDE.md` (use a harmless, clearly-labeled experiment line you
can remove afterward).

Run `/memory` from different working directories and confirm which files
load where. Then deliberately reproduce the exam's diagnostic scenario: put
a "team" rule in the user-level file, clone the repo to a second directory,
and observe the rule doesn't travel. Move it to project level and re-verify.

**Gate:** you can say, without looking it up, which level loads when — and
why the new-teammate-missing-instructions bug points at user-level config.

## Phase 2 — Path-scoped rules

Create `.claude/rules/testing.md` with frontmatter `paths: ["**/*.test.*"]`.
Edit a test file and a non-test file; confirm the rule loads only for the
match (`/memory` again, or observe behavior).

**Gate:** you've seen the conditional load happen once — the D3.3 mechanism
the exam contrasts against directory-bound CLAUDE.md files.

## Phase 3 — A skill with frontmatter

Build a `census` skill in `.claude/skills/` that inventories the repo
(verbose by design). Run it **without** `context: fork` and watch the output
land in your session; add `context: fork` and observe the difference. Add
`allowed-tools: Read, Grep, Glob` and verify it can't write. Add
`argument-hint` and invoke with no arguments.

Note while you're here: current product docs have merged commands into
skills, and `disable-model-invocation: true` is the explicit-only lever. The
exam guide still frames commands vs. skills as distinct — know the guide's
framing for the exam, but see the merged behavior for yourself so the
product doesn't surprise you.

**Gate:** you can name what each frontmatter key changed, from observation.

## Phase 4 — MCP scoping

Configure a shared server in `.mcp.json` using `${ENV_VAR}` expansion (the
filesystem or GitHub community server is fine), and a second, personal one
in `~/.claude.json`. Verify both are available simultaneously in one
session.

**Gate:** you can articulate which file a teammate gets on clone and which
stays yours — and where the credential lives in each case.

## Phase 5 — Plan mode calibration

Three tasks against the scratch repo:
1. a one-line bug fix (direct execution),
2. a rename touching many files (plan mode),
3. a "restructure this layout" request with multiple valid approaches
   (plan mode — and read the plan critically before approving).

**Gate:** noticing *when plan mode earned its overhead*. That judgment is
D3.4 — the exam gives you scenarios and asks exactly this.

---

When done: fill in a copy of [../DEBRIEF_TEMPLATE.md](../DEBRIEF_TEMPLATE.md),
and clean the experiment line out of your real `~/.claude/CLAUDE.md`.
