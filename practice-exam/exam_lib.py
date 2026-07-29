"""Shared library for the CCAR-F local practice exam.

Owns the question bank format (questions.js), question validation, and
question generation through the local Claude Code CLI (`claude -p`). The bank
file is machine-written: render_bank() is the only writer and load_bank() the
only reader, so the file layout is a private contract of this module.
"""

import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

PRACTICE_EXAM_DIR = Path(__file__).parent


def _resolve_resource_dir():
    """Read-only assets (exam.html, questions.js, the generation prompt) live
    next to this file in a checkout, but inside the PyInstaller bundle when
    the desktop app is frozen into an executable."""
    if getattr(sys, "frozen", False):
        return Path(sys._MEIPASS)
    return Path(__file__).parent


RESOURCE_DIR = _resolve_resource_dir()
BANK_PATH = RESOURCE_DIR / "questions.js"
PROMPT_PATH = RESOURCE_DIR / "generation_prompt.md"

BANK_HEADER = (
    "// CCAR-F practice exam question bank - machine-written by exam_lib.render_bank().\n"
    "// Do not hand-edit; add or change questions via generate_bank.py.\n"
)
BANK_MARKER = "window.CCARF_BANK ="

# Minimum committed questions per task statement, enforced by pytest so bank
# coverage cannot silently regress below three questions per statement.
MIN_PER_TASK = 3

# Domain quotas for a 60-question timed exam form, mirroring the real exam's
# weighting (27/18/20/20/15%). Matches EXAM_FORM_QUOTAS in adaptive.js
# (cross-checked by test_practice_exam_js.py).
EXAM_FORM_QUOTAS = {"D1": 16, "D2": 11, "D3": 12, "D4": 12, "D5": 9}

DOMAINS = {
    "D1": "Agentic Architecture & Orchestration",
    "D2": "Tool Design & MCP Integration",
    "D3": "Claude Code Configuration & Workflows",
    "D4": "Prompt Engineering & Structured Output",
    "D5": "Context Management & Reliability",
}

TASK_STATEMENTS = {
    "D1.1": "Design and implement agentic loops for autonomous task execution",
    "D1.2": "Orchestrate multi-agent systems with coordinator-subagent patterns",
    "D1.3": "Configure subagent invocation, context passing, and spawning",
    "D1.4": "Implement multi-step workflows with enforcement and handoff patterns",
    "D1.5": "Apply Agent SDK hooks for tool call interception and data normalization",
    "D1.6": "Design task decomposition strategies for complex workflows",
    "D1.7": "Manage session state, resumption, and forking",
    "D2.1": "Design effective tool interfaces with clear descriptions and boundaries",
    "D2.2": "Implement structured error responses for MCP tools",
    "D2.3": "Distribute tools appropriately across agents and configure tool choice",
    "D2.4": "Integrate MCP servers into Claude Code and agent workflows",
    "D2.5": "Select and apply built-in tools (Read, Write, Edit, Bash, Grep, Glob)",
    "D3.1": "Configure CLAUDE.md files with appropriate hierarchy, scoping, and modular organization",
    "D3.2": "Create and configure custom slash commands and skills",
    "D3.3": "Apply path-specific rules for conditional convention loading",
    "D3.4": "Determine when to use plan mode vs direct execution",
    "D3.5": "Apply iterative refinement techniques for progressive improvement",
    "D3.6": "Integrate Claude Code into CI/CD pipelines",
    "D4.1": "Design prompts with explicit criteria to improve precision and reduce false positives",
    "D4.2": "Apply few-shot prompting to improve output consistency and quality",
    "D4.3": "Enforce structured output using tool use and JSON schemas",
    "D4.4": "Implement validation, retry, and feedback loops for extraction quality",
    "D4.5": "Design efficient batch processing strategies",
    "D4.6": "Design multi-instance and multi-pass review architectures",
    "D5.1": "Manage conversation context to preserve critical information across long interactions",
    "D5.2": "Design effective escalation and ambiguity resolution patterns",
    "D5.3": "Implement error propagation strategies across multi-agent systems",
    "D5.4": "Manage context effectively in large codebase exploration",
    "D5.5": "Design human review workflows and confidence calibration",
    "D5.6": "Preserve information provenance and handle uncertainty in multi-source synthesis",
}

OPTION_KEYS = ("A", "B", "C", "D")
PROVENANCE_SOURCES = ("official-sample", "seed-generated", "refill")
PROVENANCE_FIELDS = {"source", "model", "generatedAt", "reviewed"}
CONTENT_FIELDS = {
    "taskStatement",
    "domain",
    "scenario",
    "question",
    "options",
    "correct",
    "explanations",
}


def canonical_content(question):
    """Canonical JSON of the fields that define a question's identity."""
    content = {
        "scenario": question["scenario"],
        "question": question["question"],
        "options": question["options"],
    }
    return json.dumps(content, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def question_id(question):
    digest = hashlib.sha256(canonical_content(question).encode("utf-8")).hexdigest()
    return f"{question['taskStatement']}-{digest[:8]}"


def validate_question(question, *, require_provenance=True):
    """Raise ValueError describing the first problem found; return None if valid.

    require_provenance=False validates a freshly generated candidate, which has
    no id or provenance yet (they are added when the question enters the bank).
    """
    if not isinstance(question, dict):
        raise ValueError("question must be a JSON object")

    required = set(CONTENT_FIELDS)
    if require_provenance:
        required |= {"id", "provenance"}
    missing = required - question.keys()
    if missing:
        raise ValueError(f"missing fields: {sorted(missing)}")
    extra = question.keys() - required
    if extra:
        raise ValueError(f"unexpected fields: {sorted(extra)}")

    ts = question["taskStatement"]
    if ts not in TASK_STATEMENTS:
        raise ValueError(f"unknown task statement: {ts!r}")
    if question["domain"] != ts.split(".")[0]:
        raise ValueError(f"domain {question['domain']!r} does not match task statement {ts!r}")

    for field in ("scenario", "question"):
        value = question[field]
        if not isinstance(value, str) or not value.strip():
            raise ValueError(f"{field} must be a non-empty string")

    for block_name in ("options", "explanations"):
        block = question[block_name]
        if not isinstance(block, dict) or tuple(sorted(block)) != OPTION_KEYS:
            raise ValueError(f"{block_name} must have exactly the keys A, B, C, D")
        for key, value in block.items():
            if not isinstance(value, str) or not value.strip():
                raise ValueError(f"{block_name}.{key} must be a non-empty string")

    if question["correct"] not in OPTION_KEYS:
        raise ValueError(f"correct must be one of {OPTION_KEYS}, got {question['correct']!r}")

    if require_provenance:
        if question["id"] != question_id(question):
            raise ValueError(f"id {question['id']!r} does not match content hash")
        prov = question["provenance"]
        if not isinstance(prov, dict) or set(prov) != PROVENANCE_FIELDS:
            raise ValueError(f"provenance must have exactly the fields {sorted(PROVENANCE_FIELDS)}")
        if prov["source"] not in PROVENANCE_SOURCES:
            raise ValueError(f"provenance.source must be one of {PROVENANCE_SOURCES}")
        if prov["reviewed"] is not True:
            raise ValueError("committed questions must have provenance.reviewed = true")


def load_bank(path=BANK_PATH):
    source = Path(path).read_text(encoding="utf-8")
    start = source.index(BANK_MARKER) + len(BANK_MARKER)
    end = source.rindex(";")
    return json.loads(source[start:end])


def render_bank(bank, path=None):
    """Render the bank to questions.js source; optionally write it to path."""
    body = json.dumps(bank, indent=2, ensure_ascii=False)
    source = f"{BANK_HEADER}{BANK_MARKER} {body};\n"
    if path is not None:
        Path(path).write_text(source, encoding="utf-8")
    return source


# ── Question generation via the local Claude Code CLI ──────────────────────
#
# `claude -p` rides the user's existing Claude Code authentication, so there
# is no API key anywhere in this tool. --bare is deliberately NOT used: it
# skips OAuth/keychain auth. The subprocess runs from a neutral temp directory
# so this repo's CLAUDE.md and hooks are not loaded into generation calls.

DEFAULT_MODEL = "claude-sonnet-5"
GENERATION_TIMEOUT_SECONDS = 120

# The exam's six scenario types (exam guide v1.0, "Exam Scenarios"). When
# generating several questions for one task statement, rotating through these
# prevents template reskinning.
SCENARIO_TYPES = (
    "Customer Support Resolution Agent",
    "Code Generation with Claude Code",
    "Multi-Agent Research System",
    "Developer Productivity with Claude",
    "Claude Code for Continuous Integration",
    "Structured Data Extraction",
)

_OPTION_BLOCK_SCHEMA = {
    "type": "object",
    "properties": {key: {"type": "string"} for key in OPTION_KEYS},
    "required": list(OPTION_KEYS),
    "additionalProperties": False,
}

QUESTION_JSON_SCHEMA = {
    "type": "object",
    "properties": {
        "taskStatement": {"type": "string"},
        "domain": {"type": "string"},
        "scenario": {"type": "string"},
        "question": {"type": "string"},
        "options": _OPTION_BLOCK_SCHEMA,
        "correct": {"type": "string", "enum": list(OPTION_KEYS)},
        "explanations": _OPTION_BLOCK_SCHEMA,
    },
    "required": [
        "taskStatement",
        "domain",
        "scenario",
        "question",
        "options",
        "correct",
        "explanations",
    ],
    "additionalProperties": False,
}


def attach_provenance(candidate, source, model=None, generated_at=None):
    """Turn a validated generation candidate into a pending bank entry.

    Pending entries carry reviewed=False; merge (generate_bank.py --merge)
    flips it after human review. The id is a content hash, so it must be
    recomputed if the reviewer edits the question.
    """
    entry = dict(candidate)
    entry["provenance"] = {
        "source": source,
        "model": model,
        "generatedAt": generated_at,
        "reviewed": False,
    }
    entry["id"] = question_id(entry)
    return entry


class GenerationError(Exception):
    """Question generation failed after the retry attempt."""


class ClaudeUnavailableError(Exception):
    """The `claude` CLI could not be located; generation cannot run at all."""


# GUI-launched apps (double-clicked, IDE run buttons) don't inherit the shell
# PATH — on macOS they get launchd's /usr/bin:/bin:… — so a plain PATH lookup
# misses the common ~/.local/bin install. Discovery order: explicit override,
# PATH, known install locations, then a login shell as the last resort.
CLAUDE_PATH_ENV = "CCARF_CLAUDE"
CLAUDE_PROBE_PATHS = (
    Path.home() / ".local" / "bin" / "claude",
    Path("/opt/homebrew/bin/claude"),
    Path("/usr/local/bin/claude"),
)


def find_claude():
    override = os.environ.get(CLAUDE_PATH_ENV)
    if override:
        return override if Path(override).exists() else None
    found = shutil.which("claude")
    if found:
        return found
    for candidate in CLAUDE_PROBE_PATHS:
        if candidate.exists():
            return str(candidate)
    try:
        shell = os.environ.get("SHELL", "/bin/zsh")
        completed = subprocess.run(
            [shell, "-lc", "command -v claude"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        path = completed.stdout.strip()
        if completed.returncode == 0 and path:
            return path
    except Exception:
        pass
    return None


def _few_shot_block(bank):
    """The official sample questions, as JSON examples for the prompt."""
    examples = []
    for entry in bank:
        if entry.get("provenance", {}).get("source") != "official-sample":
            continue
        example = {field: entry[field] for field in
                   ("taskStatement", "domain", "scenario", "question",
                    "options", "correct", "explanations")}
        examples.append(json.dumps(example, indent=2, ensure_ascii=False))
    return "\n\n".join(examples)


def summarize_for_avoid(question):
    """Compact summary of an existing question, for the generation avoid-list."""
    rationale = question["explanations"][question["correct"]]
    return (
        f"correct={question['correct']} | scenario: {question['scenario'][:160]} "
        f"| correct because: {rationale[:120]}"
    )


# Three timed-exam tiers reproduce the guide samples' spread. standard = mid
# (no block; guide Q1/Q10 register). harder = the graded middle. hard = the
# hard tail (guide Q9 register). All three bind every guardrail below — hard is
# a sharper principle distinction, never invented specifics or ambiguity.
DIFFICULTIES = ("standard", "harder", "hard")

# HARDER tier: the graded middle the real exam has — a single strong near-miss
# distractor, resolved once the candidate applies the right principle.
HARDER_DIFFICULTY_INSTRUCTIONS = (
    "- Make this a HARDER question (the graded middle, not the hard tail): "
    "include exactly ONE strong near-miss distractor that a partially-prepared "
    "candidate could pick, alongside two clearly-weaker options. The near-miss "
    "must be resolvable — once the candidate applies the right exam principle "
    "(e.g., root cause vs. symptom, proportionate first step, programmatic vs. "
    "probabilistic, scope matched to the problem), the correct answer is clear. "
    "It should read at the register of a mid-hard guide sample, not the Q9 hard "
    "tail. The distinction must be a real principle, never invented specifics.\n"
)

# HARD (hard-tail) tier: sharpen the principle distinction, never lean on
# invented specifics (the fabrication guardrail below still binds). Modeled on
# the exam guide's hardest sample (Q9, scoped verify_fact): two surface-
# plausible options where the decision turns on one exam principle.
HARD_DIFFICULTY_INSTRUCTIONS = (
    "- Make this a HARD-TAIL question. At least TWO of the four options must be "
    "defensible on the surface to a partially-knowledgeable candidate; the "
    "distinction between the best answer and the strongest distractor must turn "
    "on a single exam principle (e.g., programmatic enforcement vs. "
    "probabilistic compliance, root-cause fix vs. proportionate first step, "
    "least privilege, the exam-guide framing of the 'most effective FIRST "
    "step'). Model the option style on the official guide's scoped verify_fact "
    "question: plausible near-miss distractors, not obviously-wrong ones. "
    "Hard-tail means a sharper principle distinction, NOT reliance on invented "
    "technical specifics, ambiguity, or more than one genuinely correct answer "
    "— if a knowledgeable candidate still can't confidently choose, the "
    "question is broken, not hard.\n"
)


def build_prompt(task_statement, retry_feedback=None, bank=None, avoid=None,
                 scenario_type=None, difficulty="standard"):
    if task_statement not in TASK_STATEMENTS:
        raise ValueError(f"unknown task statement: {task_statement!r}")
    if scenario_type is not None and scenario_type not in SCENARIO_TYPES:
        raise ValueError(f"unknown scenario type: {scenario_type!r}")
    if difficulty not in DIFFICULTIES:
        raise ValueError(f"unknown difficulty: {difficulty!r}")
    domain = task_statement.split(".")[0]
    if bank is None:
        bank = load_bank()
    retry_block = ""
    if retry_feedback:
        retry_block = (
            "IMPORTANT: your previous attempt failed validation with this "
            f"error:\n{retry_feedback}\n"
            "Produce corrected strict JSON that fixes exactly this problem.\n\n"
        )
    scenario_block = ""
    if scenario_type:
        scenario_block = (
            f"- Set your scenario within this exam scenario type: "
            f"{scenario_type}. Do not use a different scenario type.\n"
        )
    avoid_block = ""
    if avoid:
        listing = "\n".join(f"- {summary}" for summary in avoid)
        avoid_block = (
            "Questions for this task statement already exist, summarized "
            "below. Your question must NOT reuse their scenario premise, "
            "option skeleton, or correct-answer rationale — test a different "
            "failure mode or decision angle within this task statement. Also "
            "prefer a correct-answer letter that is not already "
            "over-represented in the summaries:\n" + listing + "\n\n"
        )
    difficulty_block = {
        "harder": HARDER_DIFFICULTY_INSTRUCTIONS,
        "hard": HARD_DIFFICULTY_INSTRUCTIONS,
    }.get(difficulty, "")
    prompt = PROMPT_PATH.read_text(encoding="utf-8")
    for placeholder, value in (
        ("{{TASK_ID}}", task_statement),
        ("{{TASK_LABEL}}", TASK_STATEMENTS[task_statement]),
        ("{{DOMAIN_ID}}", domain),
        ("{{DOMAIN_LABEL}}", DOMAINS[domain]),
        ("{{FEW_SHOT_EXAMPLES}}", _few_shot_block(bank)),
        ("{{SCENARIO_TYPE}}", scenario_block),
        ("{{DIFFICULTY}}", difficulty_block),
        ("{{AVOID}}", avoid_block),
        ("{{RETRY_FEEDBACK}}", retry_block),
    ):
        prompt = prompt.replace(placeholder, value)
    return prompt


def strip_fences(text):
    text = text.strip()
    if text.startswith("```"):
        first_newline = text.index("\n")
        text = text[first_newline + 1 :]
        if text.rstrip().endswith("```"):
            text = text.rstrip()[:-3]
    return text.strip()


def extract_candidate(envelope):
    """Pull the question JSON out of a `claude -p --output-format json` reply.

    With --json-schema the CLI validates and returns the object in
    `structured_output`; older output lands as text in `result`.
    """
    structured = envelope.get("structured_output")
    if isinstance(structured, dict):
        return structured
    return json.loads(strip_fences(envelope.get("result", "")))


def run_claude(prompt):
    binary = find_claude()
    if binary is None:
        raise ClaudeUnavailableError(
            "the `claude` CLI could not be found — install Claude Code, or "
            f"set {CLAUDE_PATH_ENV} to its full path"
        )
    model = os.environ.get("CCARF_MODEL", DEFAULT_MODEL)
    try:
        completed = subprocess.run(
            [
                binary,
                "-p",
                "--output-format",
                "json",
                "--json-schema",
                json.dumps(QUESTION_JSON_SCHEMA),
                "--model",
                model,
            ],
            input=prompt,
            capture_output=True,
            text=True,
            timeout=GENERATION_TIMEOUT_SECONDS,
            cwd=tempfile.gettempdir(),
        )
    except subprocess.TimeoutExpired as err:
        raise GenerationError(
            f"claude -p timed out after {GENERATION_TIMEOUT_SECONDS}s"
        ) from err
    if completed.returncode != 0:
        raise GenerationError(
            f"claude -p exited {completed.returncode}: {completed.stderr.strip()[-500:]}"
        )
    return json.loads(completed.stdout)


def generate_question(task_statement, run=run_claude, avoid=None, scenario_type=None,
                      difficulty="standard"):
    """Generate and validate one question; retry once with error feedback.

    The retry-with-error-feedback loop is the exam's own D4.4 pattern applied
    to this tool. ClaudeUnavailableError propagates immediately — a missing
    CLI will not fix itself on retry. `avoid` lists summaries of existing
    questions for the task statement (see summarize_for_avoid), `scenario_type`
    pins one of SCENARIO_TYPES, and `difficulty` selects the standard or hard
    question tier — so repeated generations diversify instead of converging.
    """
    if task_statement not in TASK_STATEMENTS:
        raise ValueError(f"unknown task statement: {task_statement!r}")
    bank = load_bank()
    error = None
    for _ in range(2):
        prompt = build_prompt(
            task_statement,
            retry_feedback=error,
            bank=bank,
            avoid=avoid,
            scenario_type=scenario_type,
            difficulty=difficulty,
        )
        try:
            candidate = extract_candidate(run(prompt))
            validate_question(candidate, require_provenance=False)
            if candidate["taskStatement"] != task_statement:
                raise ValueError(
                    f"generated a question for {candidate['taskStatement']!r}, "
                    f"but {task_statement!r} was requested"
                )
            return candidate
        except (GenerationError, ValueError, KeyError, TypeError) as err:
            error = str(err)
    raise GenerationError(f"generation failed after retry: {error}")
