You are generating one practice question for the Claude Certified Architect –
Foundations (CCAR-F) exam: a single scenario-based multiple-choice question.

Everything down to the THIS QUESTION divider is identical on every call — it is
the standing brief, and it is deliberately placed first. Prompt caching matches
on a prefix, so the first byte that varies ends the reusable span; the sample
questions below are the bulk of this prompt and must sit ahead of anything
per-question. Keep new per-question material below the divider.

Requirements:

- Write a realistic production scenario (1-2 short paragraphs) in the style of
  the exam's six scenario types: Customer Support Resolution Agent;
  Code Generation with Claude Code; Multi-Agent Research System; Developer
  Productivity with Claude (codebase exploration, legacy system understanding,
  boilerplate generation, task automation using built-in tools
  Read/Write/Bash/Grep/Glob and MCP servers); Claude Code for Continuous
  Integration; Structured Data Extraction (extracting information from
  unstructured documents, validating output using JSON schemas, handling edge
  cases, integrating with downstream systems).
- Vary the surface situation within whichever scenario type you are given —
  industry, system, team size, and failure context — rather than reusing the
  canonical framing. The task statement and the scenario type are fixed; the
  dressing around them should not be. A bank where every Customer Support
  question opens on a refund pipeline teaches the premise, not the principle.
- Provide exactly one correct answer and three plausible distractors. The
  distractors must represent the kinds of mistakes a candidate with incomplete
  knowledge would make.
  (Single-answer is a deliberate constraint, not exam fidelity: the real exam
  also has multiple-response items, but the guide publishes no worked example of
  one, so their option count and scoring are unknown. Do not invent
  multiple-response items. See "Known fidelity gaps" in
  local_practice_exam_spec.md.)
- Keep all four options within roughly the same length — no option more than about
  1.3x the longest of the others. This is a scoring-integrity rule, not a style
  preference: measured on the committed bank, the correct option was the longest in
  92 of 103 questions, so a candidate who simply picks the longest option scores
  about 89% without knowing any of the material. The failure mode is writing the
  correct answer as a fully-qualified statement ("...because X, which ensures Y
  under condition Z") while the distractors stay short flat assertions. Give the
  distractors the same specificity and hedging as the correct answer, so length
  carries no signal. If the correct answer genuinely needs the extra words, add
  comparable substance to the distractors rather than trimming the correct one.
- Provide an explanation of why the correct answer is right and why each
  distractor is wrong.
- You are NOT to invent specific technical facts — flag names, environment
  variables, configuration behaviors, or claims about how a feature depends on
  configuration or deployment — unless grounded in the documented CCAR-F exam
  content provided in this prompt (the task statement descriptions and the
  example questions below). If an explanation needs a technical detail to
  justify why an option is correct or incorrect, it must use only facts
  established in the provided exam content rather than fabricating
  plausible-sounding specifics. When in doubt, prefer an explanation grounded
  in the exam's stated principles (e.g., programmatic enforcement vs.
  probabilistic compliance, tool description quality, structured error
  categories) over one relying on an invented technical detail.
- Do not present deprecated or superseded patterns as correct answers. If a
  mechanism exists but has been replaced by a current best practice (e.g.,
  CLAUDE.local.md superseded by home-directory imports via @~/.claude/ paths),
  the correct answer must use the current pattern. When uncertain whether a
  pattern is current, prefer mechanisms explicitly named in the CCAR-F exam
  guide v1.0 (its task statement knowledge and skills lists are the canonical
  inventory). A deprecated pattern may appear as a distractor only if the
  explanation identifies it as deprecated and names the current replacement.

Here are official sample questions from the exam guide. Use them as models of
structure and difficulty: a well-formed stem, four plausible options, exactly one
correct answer per principle, and near-miss distractors a partially-prepared
candidate would genuinely pick.

Their wording is a floor to move away from, not a template to match. They lean on
the exam guide's official terminology, and a bank that mirrors that wording trains
candidates to recognise names rather than mechanisms — which is the gap this bank
exists to close. Match their rigour; do not match their phrasing.

{{FEW_SHOT_EXAMPLES}}

FUNCTIONAL-REGISTER EXAMPLES — how to describe a real mechanism without naming it.
These are phrasing models, not questions, and they are not exam-guide samples.
Each names a genuine mechanism, then shows the functional phrasing to use instead:

- A hook that fires after a file edit → "an automatic step that runs after every
  file modification and enforces the constraint regardless of what the model
  decides to do next"
- A tool with a declared input schema → "an interface that rejects a call whose
  arguments do not match a declared shape, before any of the tool's work begins"
- A subagent with its own context window → "delegating the search to a worker that
  reports back only its conclusion, so the intermediate reading never enters the
  main transcript"

Note what these do NOT do: they never invent a mechanism. Each describes something
real by its behaviour, its guarantee, when it fires, and what it operates on. A
functional description that does not resolve to a real, guide-grounded mechanism is
a fabrication, and the fabrication rule above applies to it in full.

────────────────────────────────────────────────────────────────────────────────
THIS QUESTION — everything below here varies per call.

- Task statement: {{TASK_ID}} — {{TASK_LABEL}}
- Domain: {{DOMAIN_ID}} — {{DOMAIN_LABEL}}
{{SCENARIO_TYPE}}{{DIFFICULTY}}{{REGISTER}}
Before you answer, re-check the two rules most often lost at this distance —
the standing brief above is long, and these are the two whose violation is
invisible in the finished question:

- OPTION LENGTH. Count the characters of all four options. If the correct one
  is the longest, rewrite until it is not, by adding substance to the
  distractors rather than trimming the correct answer. Measured on the
  committed bank, the correct option was the longest in 85% of questions — a
  candidate who reads nothing and picks the longest option scores 85%. This is
  a scoring-integrity failure, not a style nit.
- NO INVENTED SPECIFICS. Every flag, environment variable, file path, and
  configuration behaviour must be one you can point to in the exam content
  above. If you need a detail you are not certain of, describe the behaviour
  instead of naming the thing.

{{AVOID}}{{RETRY_FEEDBACK}}Respond with STRICT JSON only — no preamble, no markdown fences — in exactly
this shape:

{"taskStatement": "{{TASK_ID}}", "domain": "{{DOMAIN_ID}}", "scenario": "...",
 "question": "...", "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
 "correct": "A|B|C|D",
 "explanations": {"A": "...", "B": "...", "C": "...", "D": "..."}}
