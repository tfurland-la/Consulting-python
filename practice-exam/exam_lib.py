"""Shared library for the CCAR-F local practice exam.

Owns the question bank format (questions.js), question validation, and
question generation through the local Claude Code CLI (`claude -p`). The bank
file is machine-written: render_bank() is the only writer and load_bank() the
only reader, so the file layout is a private contract of this module.
"""

import hashlib
import json
import os
import random
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

# Two ways to phrase the mechanism a question tests. "named" uses the exam
# guide's own terminology; "functional" describes what the mechanism does, its
# guarantee, when it fires, and what it operates on, without naming it — the
# indirection the real exam uses and the bank was missing.
REGISTERS = ("named", "functional")

# Generation metadata: which exam scenario genre a question was written for,
# and which register it was written in. Optional, not part of CONTENT_FIELDS,
# because the committed bank predates both — a question without them is valid.
# Neither is hashed by canonical_content, so adding them to an existing
# question cannot change its id (see question_id).
OPTIONAL_FIELDS = {"scenarioType", "register"}


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
    extra = question.keys() - required - OPTIONAL_FIELDS
    if extra:
        raise ValueError(f"unexpected fields: {sorted(extra)}")

    # Optional fields are validated when present, never required. Anything
    # outside OPTIONAL_FIELDS still fails above, so widening the schema for
    # two named fields does not become accepting arbitrary keys.
    if "scenarioType" in question and question["scenarioType"] not in SCENARIO_TYPES:
        raise ValueError(f"unknown scenario type: {question['scenarioType']!r}")
    if "register" in question and question["register"] not in REGISTERS:
        raise ValueError(
            f"register must be one of {REGISTERS}, got {question['register']!r}"
        )

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


# A block's scenario is generated on its own, once, then handed to each of the
# block's 15 question calls as a fixed input. Its own tiny output shape.
SCENARIO_JSON_SCHEMA = {
    "type": "object",
    "properties": {"scenario": {"type": "string"}},
    "required": ["scenario"],
    "additionalProperties": False,
}

SCENARIO_PROMPT = (
    "You are writing ONE production scenario for the Claude Certified Architect "
    "– Foundations (CCAR-F) practice exam. Fifteen separate multiple-choice "
    "questions will be written against this single scenario, so it must be rich "
    "enough to branch from — several distinct things can plausibly go wrong or "
    "need deciding — without itself asking or answering any question.\n\n"
    "Scenario type: {scenario_type}\n\n"
    "Write 1-2 short paragraphs describing a realistic production situation: the "
    "system, what it does, who runs it, and the observable problem or decision "
    "point. Vary the surface details — industry, scale, team, failure mode — "
    "rather than reaching for the canonical framing of this scenario type.\n\n"
    "Do not invent specific technical facts about Claude, Claude Code, or the "
    "Agent SDK — no flag names, environment variables, or configuration "
    "behaviours. Describe the situation, not the fix. Do not include a question, "
    "options, or any recommendation.\n\n"
    "Respond with STRICT JSON only, no preamble and no markdown fences:\n"
    '{{"scenario": "..."}}'
)

# A scenario is one short paragraph, not a full question with four options and
# four explanations, so it does not need the question timeout.
SCENARIO_TIMEOUT_SECONDS = 60


def generate_scenario(scenario_type, run=None):
    """One shared scenario for a block of questions.

    Generated separately rather than taken from the first question so that all
    15 questions in the block are peers of one text, none of them privileged,
    and so a failure here fails the block before 15 calls have been spent.

    `run` defaults to run_claude, resolved at call time — this lives above
    run_claude in the file, and a def-time default would not exist yet.
    """
    if scenario_type not in SCENARIO_TYPES:
        raise ValueError(f"unknown scenario type: {scenario_type!r}")
    run = run or run_claude
    envelope = run(
        SCENARIO_PROMPT.format(scenario_type=scenario_type),
        schema=SCENARIO_JSON_SCHEMA,
        timeout=SCENARIO_TIMEOUT_SECONDS,
    )
    structured = envelope.get("structured_output")
    scenario = (structured or {}).get("scenario") if isinstance(structured, dict) else None
    if scenario is None:
        scenario = json.loads(strip_fences(envelope.get("result", "{}"))).get("scenario")
    if not isinstance(scenario, str) or not scenario.strip():
        raise GenerationError("scenario generation returned no scenario text")
    return scenario.strip()


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


class RateLimitedError(Exception):
    """The account's usage window is exhausted — not a problem with the question.

    Separated from GenerationError because the two need opposite handling. A bad
    answer is worth retrying with the error fed back into the prompt; a usage cap is
    not. Retrying spends a second call to be told the same thing, and the feedback
    loop is meaningless because nothing about the prompt caused it.

    This mattered: of 767 recorded generation calls, 220 came back with the CLI's
    own "You've hit your session limit" rather than a question, and the code treated
    every one as a content failure — burning the retry, then dropping the item with
    no record of why.
    """


# The CLI reports an exhausted usage window in prose, not a status code, so this is
# a text match. Kept narrow and lowercase-compared: broad terms like "limit" alone
# would swallow legitimate content failures about rate limiting, which is itself an
# exam topic here.
RATE_LIMIT_SIGNALS = (
    "hit your session limit",
    "hit your weekly limit",
    "hit your opus limit",
    "usage limit reached",
    "resets at",
)


def looks_rate_limited(text):
    """True if `text` carries the CLI's usage-cap message."""
    low = (text or "").lower()
    return any(signal in low for signal in RATE_LIMIT_SIGNALS)


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


def longest_option_is_correct(question):
    """True when the correct option is strictly the longest of the four.

    The exploitable form of the length tell. Note it is about ORDERING, not
    margin: the prompt's "no option more than 1.3x the others" rule is fully
    satisfied by a correct answer that is longest by one character, and a
    candidate who reads nothing and picks the longest still scores. Measured on
    the committed bank, that strategy scores 85%.

    A tie is not a tell — "pick the longest" has no answer at a tie.
    """
    options = question.get("options") or {}
    correct = question.get("correct")
    if correct not in options:
        return False
    lengths = {key: len(value) for key, value in options.items()}
    others = [n for key, n in lengths.items() if key != correct]
    return bool(others) and lengths[correct] > max(others)


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

# FUNCTIONAL register: describe the mechanism under test by what it DOES, never
# by its name. A real sitting showed the difficulty gap was language, not
# principles — the exam describes mechanisms indirectly and the candidate has to
# map behaviour back to mechanism. "named" needs no block; it is the default the
# few-shot examples already demonstrate.
FUNCTIONAL_REGISTER_INSTRUCTIONS = (
    "- Write this question in the FUNCTIONAL register: describe the mechanism "
    "under test WITHOUT naming it. Give what it does, the guarantee it provides, "
    "when it fires, and what it operates on, so the candidate has to recognise "
    "the mechanism from its behaviour. Do not name it in the scenario, the stem, "
    "or the options; the explanations may name it once the answer is settled. "
    "This changes only HOW a real mechanism is described — never WHICH "
    "mechanisms are real. The description must resolve to a genuine mechanism "
    "grounded in the exam content above; a functional-sounding invented "
    "mechanism is a fabrication and is forbidden by the rule above.\n"
)

# Share of generated questions written in the functional register. The rest use
# official terminology, so the bank trains both named- and functional-recognition.
FUNCTIONAL_FRACTION = 0.45


def register_plan(count, fraction=None, rng=None):
    """`count` register labels, exactly `fraction` of them functional, shuffled.

    Shuffled rather than bucket-spread. Bucket-spreading is right for the
    difficulty tiers, where 9 hard questions over 60 need a guaranteed spread
    and the buckets are ~7 wide. At a 45% share the buckets are barely 2 wide,
    so one functional per bucket produces a near-perfect alternation — a runs
    test on the bucket-spread version scored z=6.4, i.e. far MORE regular than
    chance. A candidate who notices the rhythm can predict the register, which
    is the pattern-matching this whole change exists to defeat. A shuffle keeps
    the count exact and the sequence unguessable.
    """
    if fraction is None:
        fraction = FUNCTIONAL_FRACTION
    draw = rng or random.random
    wanted = max(0, min(count, round(count * fraction)))
    plan = ["functional"] * wanted + ["named"] * (count - wanted)
    # Fisher-Yates against the supplied rng, so tests stay deterministic.
    for i in range(len(plan) - 1, 0, -1):
        j = int(draw() * (i + 1))
        plan[i], plan[j] = plan[j], plan[i]
    return plan


def build_prompt(task_statement, retry_feedback=None, bank=None, avoid=None,
                 scenario_type=None, difficulty="standard", register="named",
                 scenario=None):
    if task_statement not in TASK_STATEMENTS:
        raise ValueError(f"unknown task statement: {task_statement!r}")
    if scenario_type is not None and scenario_type not in SCENARIO_TYPES:
        raise ValueError(f"unknown scenario type: {scenario_type!r}")
    if difficulty not in DIFFICULTIES:
        raise ValueError(f"unknown difficulty: {difficulty!r}")
    if register not in REGISTERS:
        raise ValueError(f"unknown register: {register!r}")
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
    if scenario:
        # A block supplies its scenario. The standing brief above tells the
        # model to WRITE one, so that has to be countermanded explicitly or it
        # writes a second scenario and the block loses its shared text.
        scenario_block = (
            "- Use this EXACT scenario, reproduced verbatim in the `scenario` "
            "field. Do not write a new scenario, and do not reword, shorten, or "
            "extend this one — fifteen questions share it:\n\n"
            f"{scenario}\n\n"
            "  Write a question that branches from this situation: pick one "
            "decision or failure within it that this task statement covers. "
            "Other questions branch from the same scenario at other points, so "
            "do not try to address all of it.\n"
        )
    elif scenario_type:
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
    register_block = (
        FUNCTIONAL_REGISTER_INSTRUCTIONS if register == "functional" else ""
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
        ("{{REGISTER}}", register_block),
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


def run_claude(prompt, schema=None, timeout=None):
    """One `claude -p` call. `schema` and `timeout` default to the
    question-generation values but are overridable: classifying a banked
    question, writing a block scenario, and screening a candidate each return a
    different shape, and a scenario call is far cheaper than a question call.
    Both defaults resolve at call time so the module constants stay the single
    place to change the generation defaults.
    """
    binary = find_claude()
    if binary is None:
        raise ClaudeUnavailableError(
            "the `claude` CLI could not be found — install Claude Code, or "
            f"set {CLAUDE_PATH_ENV} to its full path"
        )
    if schema is None:
        schema = QUESTION_JSON_SCHEMA
    if timeout is None:
        timeout = GENERATION_TIMEOUT_SECONDS
    model = os.environ.get("CCARF_MODEL", DEFAULT_MODEL)
    try:
        completed = subprocess.run(
            [
                binary,
                "-p",
                "--output-format",
                "json",
                "--json-schema",
                json.dumps(schema),
                "--model",
                model,
            ],
            input=prompt,
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=tempfile.gettempdir(),
        )
    except subprocess.TimeoutExpired as err:
        raise GenerationError(
            f"claude -p timed out after {timeout}s"
        ) from err
    # A usage cap can surface either way: a non-zero exit with the message on
    # stderr, or a clean exit whose payload carries the prose instead of a question.
    # Check both, and check before the returncode branch so the more specific
    # diagnosis wins.
    if looks_rate_limited(completed.stderr) or looks_rate_limited(completed.stdout):
        detail = (completed.stderr.strip() or completed.stdout.strip())[-300:]
        raise RateLimitedError(f"usage window exhausted: {detail}")
    if completed.returncode != 0:
        raise GenerationError(
            f"claude -p exited {completed.returncode}: {completed.stderr.strip()[-500:]}"
        )
    return json.loads(completed.stdout)


def generate_question(task_statement, run=run_claude, avoid=None, scenario_type=None,
                      difficulty="standard", register="named", scenario=None):
    """Generate and validate one question; retry once with error feedback.

    The retry-with-error-feedback loop is the exam's own D4.4 pattern applied
    to this tool. ClaudeUnavailableError propagates immediately — a missing
    CLI will not fix itself on retry, and neither will RateLimitedError: a usage
    cap is not caused by the prompt, so feeding it back as "error feedback" just
    spends a second call to learn the same thing. `avoid` lists summaries of existing
    questions for the task statement (see summarize_for_avoid), `scenario_type`
    pins one of SCENARIO_TYPES, and `difficulty` selects the standard or hard
    question tier — so repeated generations diversify instead of converging.
    `register` selects named or functional phrasing.

    The generation parameters are stamped onto the returned candidate, always
    overwriting whatever the model reported. This is the only seam every caller
    shares — the bank refill, the fresh timed exam, and the practice drill all
    come through here — so it is where "assigned, not self-reported" has to be
    enforced. Without the overwrite a model-supplied register would validate
    cleanly (both are optional schema fields) and the mix would silently become
    a claim the model makes about itself.
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
            register=register,
            scenario=scenario,
        )
        try:
            candidate = extract_candidate(run(prompt))
            validate_question(candidate, require_provenance=False)
            if candidate["taskStatement"] != task_statement:
                raise ValueError(
                    f"generated a question for {candidate['taskStatement']!r}, "
                    f"but {task_statement!r} was requested"
                )
            # Enforced here rather than asked for in the prompt, because asking
            # has failed: the bank is 85% longest-is-correct after 103
            # questions, and restating the rule beside the task moved the
            # margin but not the ordering. Raising feeds the existing
            # retry-with-error-feedback loop, so the model gets one concrete
            # correction rather than a rule it has already read once.
            if longest_option_is_correct(candidate):
                lengths = {k: len(v) for k, v in candidate["options"].items()}
                raise ValueError(
                    f"option {candidate['correct']} is the correct answer AND the "
                    f"longest ({lengths}), so a candidate can score by picking the "
                    "longest option without reading anything. Rewrite so the "
                    "correct answer is NOT the longest — add matching "
                    "specificity and hedging to a distractor rather than "
                    "trimming the correct answer."
                )
            candidate["register"] = register
            if scenario_type is not None:
                candidate["scenarioType"] = scenario_type
            if scenario is not None:
                # Byte-identical, not merely equivalent: the exam panel decides
                # whether to repaint by comparing scenario text, so a model that
                # tightened a clause would make the panel flicker mid-block.
                candidate["scenario"] = scenario
            return candidate
        except (GenerationError, ValueError, KeyError, TypeError) as err:
            error = str(err)
    raise GenerationError(f"generation failed after retry: {error}")
