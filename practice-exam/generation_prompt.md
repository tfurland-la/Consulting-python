You are generating one practice question for the Claude Certified Architect –
Foundations (CCAR-F) exam. Produce a single scenario-based multiple-choice
question targeting exactly this task statement:

- Task statement: {{TASK_ID}} — {{TASK_LABEL}}
- Domain: {{DOMAIN_ID}} — {{DOMAIN_LABEL}}

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
{{SCENARIO_TYPE}}
- Provide exactly one correct answer and three plausible distractors. The
  distractors must represent the kinds of mistakes a candidate with incomplete
  knowledge would make.
- Provide an explanation of why the correct answer is right and why each
  distractor is wrong.
{{DIFFICULTY}}- You are NOT to invent specific technical facts — flag names, environment
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

{{AVOID}}Here are official sample questions showing the desired style and difficulty.
Match their tone, scenario realism, and distractor quality:

{{FEW_SHOT_EXAMPLES}}

{{RETRY_FEEDBACK}}Respond with STRICT JSON only — no preamble, no markdown fences — in exactly
this shape:

{"taskStatement": "{{TASK_ID}}", "domain": "{{DOMAIN_ID}}", "scenario": "...",
 "question": "...", "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
 "correct": "A|B|C|D",
 "explanations": {"A": "...", "B": "...", "C": "...", "D": "..."}}
