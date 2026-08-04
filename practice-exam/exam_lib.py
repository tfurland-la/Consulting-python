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
    "//\n"
    "// ATTRIBUTION. Entries whose provenance.source is \"official-sample\" are the\n"
    "// sample questions published in the Claude Certified Architect - Foundations\n"
    "// Exam Guide v1.0, section 9 (\"Sample Questions\"). Their scenario, question and\n"
    "// option text is Anthropic's, quoted verbatim and unaltered, for study and\n"
    "// commentary in a personal exam-preparation tool. (c) Anthropic PBC. This tool\n"
    "// is not an official Anthropic product and is not affiliated with, sponsored by\n"
    "// or endorsed by Anthropic. Every other entry is generated practice material\n"
    "// written for this tool and is not exam content.\n"
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
# The exam's six scenarios, reproduced verbatim from the Claude Certified
# Architect – Foundations Exam Guide v1.0, section 5 ("Exam Scenarios"), for
# personal exam preparation. Anthropic's text, not ours. © Anthropic PBC.
# This tool is not an official Anthropic product and is not affiliated with,
# sponsored by or endorsed by Anthropic.
#
# These are FIXED. The exam draws 4 of the 6 and shows the chosen scenario as
# standing context while its questions branch from it — so a practice tool that
# invents its own scenarios is drifting from the exam in the same way the
# official-terminology over-fit was: plausible, but not what a candidate sees.
# Do not paraphrase, reword or "improve" them; the fidelity IS the wording.
EXAM_SCENARIOS = {
    "Customer Support Resolution Agent": (
        "You are building a customer support resolution agent using the Claude "
        "Agent SDK. The agent handles high-ambiguity requests like returns, "
        "billing disputes, and account issues. It has access to your backend "
        "systems through custom Model Context Protocol (MCP) tools "
        "(get_customer, lookup_order, process_refund, escalate_to_human). Your "
        "target is 80%+ first-contact resolution while knowing when to escalate."
    ),
    "Code Generation with Claude Code": (
        "You are using Claude Code to accelerate software development. Your team "
        "uses it for code generation, refactoring, debugging, and documentation. "
        "You need to integrate it into your development workflow with custom "
        "slash commands, CLAUDE.md configurations, and understand when to use "
        "plan mode vs direct execution."
    ),
    "Multi-Agent Research System": (
        "You are building a multi-agent research system using the Claude Agent "
        "SDK. A coordinator agent delegates to specialized subagents: one "
        "searches the web, one analyzes documents, one synthesizes findings, and "
        "one generates reports. The system researches topics and produces "
        "comprehensive, cited reports."
    ),
    "Developer Productivity with Claude": (
        "You are building developer productivity tools using the Claude Agent "
        "SDK. The agent helps engineers explore unfamiliar codebases, understand "
        "legacy systems, generate boilerplate code, and automate repetitive "
        "tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and "
        "integrates with Model Context Protocol (MCP) servers."
    ),
    "Claude Code for Continuous Integration": (
        "You are integrating Claude Code into your Continuous "
        "Integration/Continuous Deployment (CI/CD) pipeline. The system runs "
        "automated code reviews, generates test cases, and provides feedback on "
        "pull requests. You need to design prompts that provide actionable "
        "feedback and minimize false positives."
    ),
    "Structured Data Extraction": (
        "You are building a structured data extraction system using Claude. The "
        "system extracts information from unstructured documents, validates the "
        "output using JavaScript Object Notation (JSON) schemas, and maintains "
        "high accuracy. It must handle edge cases gracefully and integrate with "
        "downstream systems."
    ),
}

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


# How much longer than its longest rival the correct option may be.
#
# Calibrated against the exam guide's own 12 sample questions, not invented.
# Measured on their verbatim text: the correct answer is the longest in 7 of 12,
# ratios 0.76, 0.87, 0.89, 0.97, 0.98, 1.01, 1.02, 1.04, 1.05, 1.06, 1.06, 1.29,
# mean exactly 1.00. So the real exam has a mild length tell, and a bank with
# none is as unrepresentative as a bank with a strong one: it would teach a
# candidate that the longest option is never right, which is false where it
# counts.
#
# 1.20 is deliberately BELOW the guide's worst case, and sits in the empty gap
# between its second-worst (1.06) and its single outlier (1.29). It therefore
# admits every margin the guide actually exhibits bar one. Do not read it as
# "the guide's maximum" — an earlier revision of this comment did, quoting a max
# of 1.18 and a mean of 0.96. Those came from our own transcription of the
# samples, which had silently compressed the options (distractors harder than
# correct answers) and so understated the guide's spread. The transcription was
# restored to verbatim; these numbers are from that.
#
# Enforced on generation only. The one official sample that exceeds this is the
# guide's own wording and is left alone.
LENGTH_TELL_MAX_RATIO = 1.20


def length_tell_ratio(question):
    """The correct option's length over its longest rival's. >1 means longest."""
    options = question.get("options") or {}
    correct = question.get("correct")
    if correct not in options:
        return 0.0
    lengths = {key: len(value) for key, value in options.items()}
    others = [n for key, n in lengths.items() if key != correct]
    if not others or max(others) == 0:
        return 0.0
    return lengths[correct] / max(others)


def longest_option_is_correct(question):
    """True when the correct option is strictly the longest of the four.

    Reported, not enforced — see LENGTH_TELL_MAX_RATIO for what is rejected.
    A tie is not a tell: "pick the longest" has no answer at a tie.
    """
    return length_tell_ratio(question) > 1.0


def has_exploitable_length_tell(question):
    """True when the correct option is longer than the exam ever makes it."""
    return length_tell_ratio(question) > LENGTH_TELL_MAX_RATIO


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

# Share of generated questions in which the correct option is ALLOWED to be the
# longest. This is the aggregate control that LENGTH_TELL_MAX_RATIO is not: the
# ratio caps one question's margin, this caps how often the tell appears at all.
#
# 0.35 against a chance rate of 0.25 (four options, one correct) leaves the
# "pick the longest" shortcut worth about nine points over blind guessing —
# far below what knowing the material scores, so it is not a strategy worth
# playing, and the practice score goes back to measuring competence. Set
# deliberately below the guide's own observed 58%: reproducing that rate would
# reinstate a shortcut that scores 58% without reading, which is the defect the
# bank repair removed. Set deliberately above 0 because a bank with no tell
# teaches that the longest option is never right, which is false on the real
# exam.
LENGTH_LONGEST_FRACTION = 0.35

# How the correct option's length is planned for one question. Assigned as a
# generation input, never stamped: unlike the register, posture is recoverable
# from the option text by measuring it, so a stored field could only disagree
# with the content it describes.
LENGTH_POSTURES = ("longest", "not-longest")

# Stated as a requirement on THIS question rather than as a statistic about the
# bank. The bank-wide framing is what failed before: the model reads "the
# correct option is longest in 85% of questions", agrees it is bad, and then
# writes one more question in which the correct option is longest, because
# nothing in the instruction bites on the question in front of it.
NOT_LONGEST_POSTURE_INSTRUCTIONS = (
    "- OPTION LENGTH FOR THIS QUESTION: the correct option must NOT be the "
    "longest of the four. Count the characters of all four before you answer. "
    "At least one distractor must be longer than the correct option. Achieve "
    "that by giving the distractors the same specificity, qualification and "
    "hedging the correct answer has — never by trimming the correct answer, "
    "whose qualifying clauses are what make it correct.\n"
    "  Do NOT pad a distractor with the reason it is wrong. Clauses like "
    "\"without addressing the root cause\" or \"rather than verifying the "
    "result\" give the answer away more cheaply than length does, because the "
    "correct option becomes the only one not arguing against itself. Every "
    "distractor must read as a confident proposal by someone who believes it "
    "is right; its wrongness belongs in the explanation, never in the option "
    "text.\n"
)

LONGEST_POSTURE_INSTRUCTIONS = (
    "- OPTION LENGTH FOR THIS QUESTION: the correct option MUST be the longest "
    "of the four, but by no more than "
    f"{LENGTH_TELL_MAX_RATIO}x the longest distractor. Count the characters "
    "before you answer. Achieve it by extending the correct option, NEVER by "
    "trimming or shortening the distractors — they still need full "
    "specificity, and a short flat assertion beside a fully-qualified "
    "correct answer is the defect this bank exists to remove.\n"
)

# Used when no posture was planned for this call. Callers that plan one get a
# rate; callers that do not still get the margin cap, which is what the code
# enforces either way.
UNPLANNED_LENGTH_INSTRUCTIONS = (
    "- OPTION LENGTH. Count the characters of all four options. The correct "
    f"option must not exceed {LENGTH_TELL_MAX_RATIO}x the longest distractor, "
    "and preferably should not be the longest at all. Fix any excess by adding "
    "substance to the distractors, never by trimming the correct answer. A "
    "candidate who picks the longest option without reading must not score by "
    "doing so; this is a scoring-integrity rule, not a style nit.\n"
)


def _shuffled_plan(count, fraction, marked, rest, rng=None):
    """`count` labels, exactly `fraction` of them `marked`, shuffled.

    Shuffled rather than bucket-spread. Bucket-spreading is right for the
    difficulty tiers, where 9 hard questions over 60 need a guaranteed spread
    and the buckets are ~7 wide. At a 45% share the buckets are barely 2 wide,
    so one marked item per bucket produces a near-perfect alternation — a runs
    test on the bucket-spread version scored z=6.4, i.e. far MORE regular than
    chance. A candidate who notices the rhythm can predict the next label,
    which is the pattern-matching this whole change exists to defeat. A shuffle
    keeps the count exact and the sequence unguessable.
    """
    draw = rng or random.random
    wanted = max(0, min(count, round(count * fraction)))
    plan = [marked] * wanted + [rest] * (count - wanted)
    # Fisher-Yates against the supplied rng, so tests stay deterministic.
    for i in range(len(plan) - 1, 0, -1):
        j = int(draw() * (i + 1))
        plan[i], plan[j] = plan[j], plan[i]
    return plan


def register_plan(count, fraction=None, rng=None):
    """`count` register labels, exactly `fraction` of them functional, shuffled."""
    if fraction is None:
        fraction = FUNCTIONAL_FRACTION
    return _shuffled_plan(count, fraction, "functional", "named", rng)


def length_plan(count, fraction=None, rng=None):
    """`count` length postures, exactly `fraction` of them "longest", shuffled.

    This is the control on the batch RATE. LENGTH_TELL_MAX_RATIO bounds how far
    the correct option may outrun its rivals on one question; it says nothing
    about how often the correct option is longest, and generation drifts to sit
    just under the cap — every question passes while the rate climbs. Assigning
    the posture up front makes the rate a property of the plan instead.
    """
    if fraction is None:
        fraction = LENGTH_LONGEST_FRACTION
    return _shuffled_plan(count, fraction, "longest", "not-longest", rng)


def build_prompt(task_statement, retry_feedback=None, bank=None, avoid=None,
                 scenario_type=None, difficulty="standard", register="named",
                 length_posture=None):
    if task_statement not in TASK_STATEMENTS:
        raise ValueError(f"unknown task statement: {task_statement!r}")
    if scenario_type is not None and scenario_type not in SCENARIO_TYPES:
        raise ValueError(f"unknown scenario type: {scenario_type!r}")
    if difficulty not in DIFFICULTIES:
        raise ValueError(f"unknown difficulty: {difficulty!r}")
    if register not in REGISTERS:
        raise ValueError(f"unknown register: {register!r}")
    if length_posture is not None and length_posture not in LENGTH_POSTURES:
        raise ValueError(f"unknown length posture: {length_posture!r}")
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
        # The exam's scenarios are FIXED text, shown as standing context while
        # each question branches from them. So the model is given the real
        # scenario and asked for a BRANCH — the specific situation inside it —
        # not for a scenario of its own. `scenario` in the output is that
        # branch. The standing brief above tells it to write a scenario, so
        # that has to be countermanded explicitly.
        scenario_block = (
            "- IGNORE the instruction above to write your own scenario. This "
            "question belongs to a fixed exam scenario, reproduced here, which "
            "the candidate already has in front of them as standing context:\n\n"
            f"    {EXAM_SCENARIOS[scenario_type]}\n\n"
            "  Write a BRANCH of it instead: one or two sentences of specific "
            "situation inside that scenario — a symptom, a measurement, a "
            "decision point — that this task statement covers. Put ONLY the "
            "branch in the `scenario` field.\n"
            "  Do not restate or summarise the fixed scenario; the candidate is "
            "reading it already, and repeating it wastes their time. Do not "
            "invent a different system, company or product — the branch happens "
            "inside the scenario above. Fifteen questions branch from this same "
            "scenario at different points, so cover one point, not all of it.\n"
            "  Example of the shape: \"Production data shows that in 12% of "
            "cases, your agent skips get_customer entirely and calls "
            "lookup_order using only the customer's stated name.\"\n"
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
    length_block = {
        "longest": LONGEST_POSTURE_INSTRUCTIONS,
        "not-longest": NOT_LONGEST_POSTURE_INSTRUCTIONS,
    }.get(length_posture, UNPLANNED_LENGTH_INSTRUCTIONS)
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
        ("{{LENGTH_POSTURE}}", length_block),
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
                      difficulty="standard", register="named",
                      length_posture=None):
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
            length_posture=length_posture,
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
            if has_exploitable_length_tell(candidate):
                lengths = {k: len(v) for k, v in candidate["options"].items()}
                raise ValueError(
                    f"option {candidate['correct']} is the correct answer and is "
                    f"{length_tell_ratio(candidate):.2f}x the longest distractor "
                    f"({lengths}), so a candidate can score by picking the longest "
                    f"option without reading anything. The real exam keeps this "
                    f"under {LENGTH_TELL_MAX_RATIO}x. Add matching specificity and hedging "
                    "to a distractor rather than trimming the correct answer — "
                    "being marginally longest is fine, being conspicuously "
                    "longest is not."
                )
            # Planned to carry the tell and does not. Enforced in both
            # directions deliberately: a one-sided rule is not a rate control,
            # because an unenforced permission can only lose "longest" slots,
            # never gain them, leaving the realized rate below the plan by
            # however often generation declines to comply. A live run declined
            # once in two.
            if (length_posture == "longest"
                    and not longest_option_is_correct(candidate)):
                lengths = {k: len(v) for k, v in candidate["options"].items()}
                raise ValueError(
                    f"option {candidate['correct']} is the correct answer and is "
                    f"NOT the longest of the four ({lengths}). This question was "
                    "planned to be one where the correct option is longest, so "
                    "that the bank keeps the mild length tell the real exam has "
                    "rather than teaching that the longest option is never "
                    f"right. Extend the correct option past its rivals, by up to "
                    f"{LENGTH_TELL_MAX_RATIO}x the longest of them. Do NOT trim "
                    "or shorten the distractors to achieve it — short flat "
                    "distractors beside a qualified correct answer are the "
                    "defect this bank exists to remove."
                )
            # The margin gate above passes a correct option that is longest by
            # a hair, which is how the batch rate climbed while every single
            # question stayed legal. When this slot was planned not-longest,
            # being longest at all is the failure.
            if (length_posture == "not-longest"
                    and longest_option_is_correct(candidate)):
                lengths = {k: len(v) for k, v in candidate["options"].items()}
                raise ValueError(
                    f"option {candidate['correct']} is the correct answer and is "
                    "the longest of the four "
                    f"({lengths}) — this question was planned to have a correct "
                    "option that is NOT the longest, so that the bank as a whole "
                    "does not reward picking the longest option. Lengthen a "
                    "distractor past it by adding matching specificity, rather "
                    "than trimming the correct answer, and do not pad a "
                    "distractor with the reason it is wrong."
                )
            candidate["register"] = register
            if scenario_type is not None:
                candidate["scenarioType"] = scenario_type
            return candidate
        except (GenerationError, ValueError, KeyError, TypeError) as err:
            error = str(err)
    raise GenerationError(f"generation failed after retry: {error}")
