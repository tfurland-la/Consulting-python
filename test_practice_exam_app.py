"""Tests for question generation (exam_lib) and the desktop app bridge (exam_app).

All `claude` CLI interaction is mocked — these tests run offline. The real
end-to-end path is exercised manually via `python3 practice-exam/exam_app.py`.
"""

import json
import random
import re

import pytest

from test_practice_exam_bank import (
    PRACTICE_EXAM_DIR,
    exam_lib,
    load_practice_exam_module,
    make_valid_question,
)


def make_candidate(task_statement="D1.2"):
    """A generation candidate: the question JSON before id/provenance exist."""
    candidate = make_valid_question()
    del candidate["id"]
    del candidate["provenance"]
    candidate["taskStatement"] = task_statement
    candidate["domain"] = task_statement.split(".")[0]
    return candidate


# ── Prompt construction ────────────────────────────────────────────────────


def test_build_prompt_names_the_task_statement():
    prompt = exam_lib.build_prompt("D4.3")
    assert "D4.3" in prompt
    assert exam_lib.TASK_STATEMENTS["D4.3"] in prompt
    assert exam_lib.DOMAINS["D4"] in prompt


def test_build_prompt_contains_fabrication_guardrail():
    prompt = exam_lib.build_prompt("D1.1")
    assert "NOT to invent specific technical facts" in prompt


def test_build_prompt_embeds_official_samples_as_few_shot():
    prompt = exam_lib.build_prompt("D1.1")
    # A distinctive string from the official sample set (Question 1).
    assert "process_refund" in prompt


def test_build_prompt_leaves_no_placeholders():
    prompt = exam_lib.build_prompt("D5.6")
    assert "{{" not in prompt


def test_scenario_types_match_the_exam_guide():
    assert exam_lib.SCENARIO_TYPES == (
        "Customer Support Resolution Agent",
        "Code Generation with Claude Code",
        "Multi-Agent Research System",
        "Developer Productivity with Claude",
        "Claude Code for Continuous Integration",
        "Structured Data Extraction",
    )


def test_build_prompt_pins_scenario_type_only_when_given():
    pinned = exam_lib.build_prompt("D1.4", scenario_type="Structured Data Extraction")
    clean = exam_lib.build_prompt("D1.4")
    assert "Set your scenario within this exam scenario type: Structured Data Extraction" in pinned
    assert "Set your scenario within this exam scenario type" not in clean


def test_build_prompt_rejects_unknown_scenario_type():
    with pytest.raises(ValueError):
        exam_lib.build_prompt("D1.4", scenario_type="Space Exploration")


def test_build_prompt_adds_hard_instructions_only_for_hard_difficulty():
    hard = exam_lib.build_prompt("D1.4", difficulty="hard")
    standard = exam_lib.build_prompt("D1.4", difficulty="standard")
    default = exam_lib.build_prompt("D1.4")
    assert "HARD" in hard and "two" in hard  # two defensible options
    assert "single exam principle" in hard
    assert "HARD" not in standard
    assert standard == default  # standard is the unmarked default
    # The fabrication guardrail must persist at the hard tier.
    assert "NOT to invent specific technical facts" in hard


def test_build_prompt_harder_tier_is_a_milder_block_than_hard():
    harder = exam_lib.build_prompt("D1.4", difficulty="harder")
    hard = exam_lib.build_prompt("D1.4", difficulty="hard")
    standard = exam_lib.build_prompt("D1.4", difficulty="standard")
    # harder carries its own instruction, distinct from standard and hard
    assert "HARDER" in harder and "near-miss" in harder
    assert harder != standard and harder != hard
    assert "HARDER" not in hard and "HARDER" not in standard
    # guardrail binds at the harder tier too
    assert "NOT to invent specific technical facts" in harder


def test_build_prompt_rejects_unknown_difficulty():
    with pytest.raises(ValueError):
        exam_lib.build_prompt("D1.4", difficulty="brutal")


def _seeded_rng(seed=20260803):
    """A deterministic rng callable, so spread assertions can't flake."""
    return random.Random(seed).random


# ── Register: named vs functional phrasing ─────────────────────────────────
# The register is ASSIGNED as a generation input, never self-reported, so the
# mix is a fact about what we asked for rather than a claim the model makes
# about itself. It is stamped in generate_question because that is the only
# seam all three call paths share (bank refill, fresh timed exam, drill).


def test_build_prompt_adds_functional_block_only_for_the_functional_register():
    functional = exam_lib.build_prompt("D1.4", register="functional")
    named = exam_lib.build_prompt("D1.4", register="named")
    default = exam_lib.build_prompt("D1.4")
    # Discriminate on the instruction block, not on the functional EXEMPLARS,
    # which are static prompt text present under both registers.
    assert "in the FUNCTIONAL register" in functional
    assert "in the FUNCTIONAL register" not in named
    assert named == default  # named is the unmarked default


def test_build_prompt_rejects_unknown_register():
    with pytest.raises(ValueError):
        exam_lib.build_prompt("D1.4", register="haiku")


def test_fabrication_guardrail_binds_under_both_registers():
    """Abstraction must not become fabrication: varying how a mechanism is
    DESCRIBED must never vary WHICH mechanisms are real."""
    for register in exam_lib.REGISTERS:
        prompt = exam_lib.build_prompt("D1.4", register=register)
        assert "NOT to invent specific technical facts" in prompt
        assert "deprecated or superseded patterns" in prompt


def test_generate_question_passes_register_to_the_prompt():
    seen = {}

    def fake_run(prompt):
        seen["prompt"] = prompt
        return {"structured_output": make_candidate("D1.4")}

    exam_lib.generate_question("D1.4", run=fake_run, register="functional")
    assert "in the FUNCTIONAL register" in seen["prompt"]


def test_generate_question_stamps_the_assigned_register():
    def fake_run(prompt):
        return {"structured_output": make_candidate("D1.4")}

    got = exam_lib.generate_question("D1.4", run=fake_run, register="functional")
    assert got["register"] == "functional"


def test_generate_question_overwrites_a_self_reported_register():
    """A1 widened validation for both modes, so a register arriving via the
    result-text fallback would otherwise validate cleanly and silently revert
    'assigned, not self-reported'."""

    def fake_run(prompt):
        candidate = make_candidate("D1.4")
        candidate["register"] = "named"  # model claims otherwise
        return {"structured_output": candidate}

    got = exam_lib.generate_question("D1.4", run=fake_run, register="functional")
    assert got["register"] == "functional"


def test_generate_question_stamps_the_pinned_scenario_type():
    def fake_run(prompt):
        return {"structured_output": make_candidate("D1.4")}

    got = exam_lib.generate_question(
        "D1.4", run=fake_run, scenario_type="Structured Data Extraction"
    )
    assert got["scenarioType"] == "Structured Data Extraction"


def test_register_plan_hits_the_target_fraction():
    plan = exam_lib.register_plan(20, fraction=0.45, rng=_seeded_rng())
    assert len(plan) == 20
    assert plan.count("functional") == 9  # round(20 * 0.45)
    assert set(plan) <= set(exam_lib.REGISTERS)


def test_register_plan_spreads_rather_than_clustering():
    """A guessable register defeats the point — a candidate who can predict
    which questions are abstracted is back to pattern-matching."""
    plan = exam_lib.register_plan(20, fraction=0.5, rng=_seeded_rng())
    first_half = plan[:10].count("functional")
    assert 3 <= first_half <= 7, f"clustered: {plan}"


def test_register_plan_handles_the_degenerate_fractions():
    assert exam_lib.register_plan(10, fraction=0.0) == ["named"] * 10
    assert exam_lib.register_plan(10, fraction=1.0) == ["functional"] * 10


# ── What the few-shot examples are FOR ─────────────────────────────────────
# A real sitting showed the bank was too easy, and the cause was language, not
# principles: "Match their tone" pinned the generator to the exam guide's
# official terminology, so drilling trained recognition of named mechanisms.
# The samples still do real work on form and rigour — they stay, but as
# exemplars of structure and difficulty, with their phrasing named as a floor
# to move away from rather than a template to match.


def test_few_shot_examples_are_not_framed_as_a_tone_to_match():
    prompt = exam_lib.build_prompt("D1.4")
    assert "Match their tone" not in prompt


def test_few_shot_examples_are_framed_as_structure_and_difficulty():
    prompt = exam_lib.build_prompt("D1.4")
    assert "structure and difficulty" in prompt


def test_prompt_names_official_terminology_as_a_floor_to_move_away_from():
    prompt = exam_lib.build_prompt("D1.4")
    assert "floor to move away from" in prompt


def test_prompt_carries_functional_register_exemplars():
    """Thirteen named-register samples with only prose arguing against them
    leaves the functional register unmodelled. Show it, don't just describe it."""
    prompt = exam_lib.build_prompt("D1.4")
    assert "FUNCTIONAL-REGISTER EXAMPLES" in prompt


def test_prompt_prefix_is_identical_across_task_statements():
    """Prompt caching is a prefix match: the first byte that differs ends the
    reusable span. The few-shot block is 81% of the prompt and identical on
    every call, so it has to sit BEFORE anything per-question or it is re-sent
    in full every time."""
    import os.path

    a = exam_lib.build_prompt("D1.4")
    b = exam_lib.build_prompt("D2.3")
    shared = os.path.commonprefix([a, b])
    assert exam_lib._few_shot_block(exam_lib.load_bank()) in shared
    assert len(shared) / len(a) > 0.8, (
        f"only {len(shared) / len(a):.0%} of the prompt is a shared prefix"
    )


def test_prompt_prefix_survives_the_per_question_parameters():
    """Difficulty, register, scenario type and the avoid-list all vary per
    call; every one of them must land after the static block."""
    base = exam_lib.build_prompt("D1.4")
    variants = [
        exam_lib.build_prompt("D1.4", difficulty="hard"),
        exam_lib.build_prompt("D1.4", register="functional"),
        exam_lib.build_prompt("D1.4", scenario_type="Multi-Agent Research System"),
        exam_lib.build_prompt("D1.4", avoid=["correct=A | scenario: something"]),
        exam_lib.build_prompt("D1.4", retry_feedback="correct must be one of ..."),
    ]
    few_shot = exam_lib._few_shot_block(exam_lib.load_bank())
    for variant in variants:
        import os.path

        shared = os.path.commonprefix([base, variant])
        assert few_shot in shared


def test_functional_exemplars_are_not_drawn_from_the_bank():
    """They are literal prompt text. Routing them through _few_shot_block would
    mean tagging hand-written examples `official-sample`, which is a provenance
    lie the bank's own validation could not catch."""
    bank = exam_lib.load_bank()
    few_shot = exam_lib._few_shot_block(bank)
    assert "FUNCTIONAL-REGISTER EXAMPLES" not in few_shot
    assert all(
        entry.get("provenance", {}).get("source") == "official-sample"
        for entry in bank
        if entry["scenario"] in few_shot
    )


def test_generate_question_passes_difficulty_to_prompt(monkeypatch):
    seen = {}

    def fake_run(prompt):
        seen["prompt"] = prompt
        return {"structured_output": make_candidate("D1.4")}

    exam_lib.generate_question("D1.4", run=fake_run, difficulty="hard")
    assert "HARD" in seen["prompt"]


def test_build_prompt_includes_avoid_list_only_when_given():
    existing = exam_lib.summarize_for_avoid(
        {
            "correct": "B",
            "scenario": "A support agent misroutes refund requests during peak load.",
            "explanations": {"B": "Programmatic enforcement beats prompt guidance."},
        }
    )
    with_avoid = exam_lib.build_prompt("D1.4", avoid=[existing])
    clean = exam_lib.build_prompt("D1.4")
    assert "misroutes refund requests" in with_avoid
    assert "correct=B" in with_avoid
    assert "different failure mode or decision angle" in with_avoid
    assert "option skeleton" in with_avoid
    assert "correct-answer letter" in with_avoid
    assert "misroutes refund requests" not in clean


def test_build_prompt_injects_retry_feedback_only_when_given():
    clean = exam_lib.build_prompt("D2.2")
    retry = exam_lib.build_prompt("D2.2", retry_feedback="options must have exactly A-D")
    assert "options must have exactly A-D" in retry
    assert "options must have exactly A-D" not in clean
    assert "previous attempt" in retry.lower()


# ── Frozen-bundle path resolution (PyInstaller) ─────────────────────────────


def test_resource_dir_is_the_source_dir_when_not_frozen():
    assert exam_lib._resolve_resource_dir() == PRACTICE_EXAM_DIR
    assert exam_lib.RESOURCE_DIR == PRACTICE_EXAM_DIR


def test_resource_dir_is_the_bundle_dir_when_frozen(monkeypatch, tmp_path):
    monkeypatch.setattr(exam_lib.sys, "frozen", True, raising=False)
    monkeypatch.setattr(exam_lib.sys, "_MEIPASS", str(tmp_path), raising=False)
    assert exam_lib._resolve_resource_dir() == tmp_path


def test_progress_path_stays_in_repo_when_not_frozen(exam_app):
    assert exam_app._resolve_progress_path() == PRACTICE_EXAM_DIR / "exam_progress.json"


def test_progress_path_moves_to_user_data_dir_when_frozen(exam_app, monkeypatch, tmp_path):
    monkeypatch.setattr(exam_app.sys, "frozen", True, raising=False)
    monkeypatch.setattr(exam_app, "_user_data_dir", lambda: tmp_path / "ccaf")
    resolved = exam_app._resolve_progress_path()
    assert resolved == tmp_path / "ccaf" / "exam_progress.json"
    assert resolved.parent.is_dir()  # created on resolution


def test_window_url_percent_encodes_spaces_in_the_bundle_path(exam_app, monkeypatch, tmp_path):
    # Reproduces the packaged-app white screen: a bundle name with spaces
    # (e.g. "CCAR-F Practice Exam.app") produces an invalid file:// URI if
    # built by naive string interpolation. WKWebView fails to load it
    # silently — no exception, no console output, just a blank window.
    spaced_dir = tmp_path / "CCAR-F Practice Exam.app" / "Contents" / "Frameworks"
    spaced_dir.mkdir(parents=True)
    monkeypatch.setattr(exam_app.exam_lib, "RESOURCE_DIR", spaced_dir)
    url = exam_app.window_url()
    assert " " not in url
    assert "%20" in url
    assert url.endswith("#desktop")
    assert url.startswith("file://")


def test_window_url_still_works_for_unfrozen_paths_without_spaces(exam_app):
    url = exam_app.window_url()
    assert url == exam_app.exam_lib.RESOURCE_DIR.joinpath("exam.html").as_uri() + "#desktop"


def test_window_url_resolves_symlinks_before_building_the_uri(exam_app, monkeypatch, tmp_path):
    # PyInstaller's .app BUNDLE step places real files under Contents/Resources
    # and symlinks them from Contents/Frameworks (Apple's bundle convention).
    # WKWebView's local-file loader silently refuses to follow that symlink —
    # no exception, no console output, just a permanent white window — so the
    # URL must point at the resolved, real path.
    real_dir = tmp_path / "Contents" / "Resources"
    real_dir.mkdir(parents=True)
    (real_dir / "exam.html").write_text("<html></html>")
    linked_dir = tmp_path / "Contents" / "Frameworks"
    linked_dir.mkdir(parents=True)
    (linked_dir / "exam.html").symlink_to(real_dir / "exam.html")
    monkeypatch.setattr(exam_app.exam_lib, "RESOURCE_DIR", linked_dir)
    url = exam_app.window_url()
    assert url == (real_dir / "exam.html").as_uri() + "#desktop"


def test_selfcheck_prints_parseable_json(exam_app, capsys):
    exam_app.selfcheck()
    payload = json.loads(capsys.readouterr().out)
    assert payload["frozen"] is False
    assert payload["resources"]["exam.html"] is True
    assert payload["resources"]["questions.js"] is True
    assert "claude" in payload and "progress_path" in payload


# ── Claude CLI discovery ────────────────────────────────────────────────────
# GUI-launched apps don't inherit the shell PATH, so discovery must not rely
# on shutil.which alone.


def test_find_claude_env_override_wins(monkeypatch, tmp_path):
    fake = tmp_path / "claude"
    fake.touch()
    monkeypatch.setenv("CCARF_CLAUDE", str(fake))
    assert exam_lib.find_claude() == str(fake)
    monkeypatch.setenv("CCARF_CLAUDE", str(tmp_path / "missing"))
    assert exam_lib.find_claude() is None  # explicit override never falls through


def test_find_claude_uses_path_lookup_first(monkeypatch):
    monkeypatch.delenv("CCARF_CLAUDE", raising=False)
    monkeypatch.setattr(exam_lib.shutil, "which", lambda name: "/somewhere/claude")
    assert exam_lib.find_claude() == "/somewhere/claude"


def test_find_claude_probes_known_install_locations(monkeypatch, tmp_path):
    monkeypatch.delenv("CCARF_CLAUDE", raising=False)
    monkeypatch.setattr(exam_lib.shutil, "which", lambda name: None)
    fake = tmp_path / "claude"
    fake.touch()
    monkeypatch.setattr(exam_lib, "CLAUDE_PROBE_PATHS", (tmp_path / "nope", fake))
    assert exam_lib.find_claude() == str(fake)


def test_find_claude_falls_back_to_login_shell(monkeypatch, tmp_path):
    monkeypatch.delenv("CCARF_CLAUDE", raising=False)
    monkeypatch.setattr(exam_lib.shutil, "which", lambda name: None)
    monkeypatch.setattr(exam_lib, "CLAUDE_PROBE_PATHS", ())

    class FakeCompleted:
        returncode = 0
        stdout = "/from/login/shell/claude\n"

    monkeypatch.setattr(exam_lib.subprocess, "run", lambda *a, **k: FakeCompleted())
    assert exam_lib.find_claude() == "/from/login/shell/claude"


def test_find_claude_returns_none_when_nothing_works(monkeypatch):
    monkeypatch.delenv("CCARF_CLAUDE", raising=False)
    monkeypatch.setattr(exam_lib.shutil, "which", lambda name: None)
    monkeypatch.setattr(exam_lib, "CLAUDE_PROBE_PATHS", ())

    def boom(*a, **k):
        raise OSError("no shell")

    monkeypatch.setattr(exam_lib.subprocess, "run", boom)
    assert exam_lib.find_claude() is None


# ── Response handling ──────────────────────────────────────────────────────


def test_strip_fences_removes_markdown_fences():
    fenced = '```json\n{"a": 1}\n```'
    assert exam_lib.strip_fences(fenced) == '{"a": 1}'
    assert exam_lib.strip_fences('{"a": 1}') == '{"a": 1}'


def test_extract_candidate_prefers_structured_output():
    candidate = make_candidate()
    envelope = {"structured_output": candidate, "result": "ignored"}
    assert exam_lib.extract_candidate(envelope) == candidate


def test_extract_candidate_falls_back_to_result_text():
    candidate = make_candidate()
    envelope = {"result": "```json\n" + json.dumps(candidate) + "\n```"}
    assert exam_lib.extract_candidate(envelope) == candidate


# ── generate_question with a mocked runner ─────────────────────────────────


def test_generate_question_success():
    candidate = make_candidate("D1.2")
    calls = []

    def runner(prompt):
        calls.append(prompt)
        return {"structured_output": candidate}

    result = exam_lib.generate_question("D1.2", run=runner)
    assert result == candidate
    assert len(calls) == 1


def test_generate_question_retries_once_with_error_feedback():
    good = make_candidate("D3.6")
    bad = dict(good)
    bad["correct"] = "E"
    responses = [{"structured_output": bad}, {"structured_output": good}]
    prompts = []

    def runner(prompt):
        prompts.append(prompt)
        return responses[len(prompts) - 1]

    result = exam_lib.generate_question("D3.6", run=runner)
    assert result == good
    assert len(prompts) == 2
    assert "correct" in prompts[1]  # the validation error is fed back


def test_generate_question_rejects_wrong_task_statement():
    # The model generated a valid question, but for a different statement.
    candidate = make_candidate("D1.1")
    responses = [{"structured_output": candidate}, {"structured_output": candidate}]
    prompts = []

    def runner(prompt):
        prompts.append(prompt)
        return responses[len(prompts) - 1]

    with pytest.raises(exam_lib.GenerationError):
        exam_lib.generate_question("D2.4", run=runner)
    assert len(prompts) == 2


def test_generate_question_fails_after_two_bad_attempts():
    def runner(prompt):
        return {"result": "I cannot produce JSON today."}

    with pytest.raises(exam_lib.GenerationError):
        exam_lib.generate_question("D1.2", run=runner)


def test_generate_question_rejects_unknown_task_statement_before_calling():
    def runner(prompt):  # pragma: no cover - must not be reached
        raise AssertionError("runner should not be called")

    with pytest.raises(ValueError):
        exam_lib.generate_question("D9.9", run=runner)


# ── Desktop app bridge (ExamApi) ───────────────────────────────────────────


@pytest.fixture()
def exam_app(monkeypatch):
    monkeypatch.syspath_prepend(str(PRACTICE_EXAM_DIR))
    pytest.importorskip("webview", reason="pywebview is not installed")
    return load_practice_exam_module("exam_app.py")


def test_health_reports_claude_availability_and_scenario_types(exam_app, monkeypatch):
    monkeypatch.setattr(exam_app.exam_lib, "find_claude", lambda: "/usr/local/bin/claude")
    healthy = exam_app.ExamApi().health()
    assert healthy["ok"] is True
    assert healthy["claude"] == "available"
    assert healthy["scenarioTypes"] == list(exam_lib.SCENARIO_TYPES)
    assert healthy["progressPath"] == str(exam_app.PROGRESS_PATH)
    monkeypatch.setattr(exam_app.exam_lib, "find_claude", lambda: None)
    assert exam_app.ExamApi().health()["claude"] == "missing"


def test_generate_passes_scenario_type_through(exam_app, monkeypatch):
    calls = {}

    def fake_generate(
        ts, avoid=None, scenario_type=None, difficulty="standard", register="named",
        scenario=None,
    ):
        calls["ts"] = ts
        calls["scenario_type"] = scenario_type
        calls["difficulty"] = difficulty
        return make_candidate(ts)

    monkeypatch.setattr(exam_app.exam_lib, "generate_question", fake_generate)
    result = exam_app.ExamApi().generate("D2.4", [], "Structured Data Extraction")
    assert "question" in result
    assert calls["ts"] == "D2.4"
    assert calls["scenario_type"] == "Structured Data Extraction"
    # scenario_type stays optional — drill mode calls with one argument
    exam_app.ExamApi().generate("D2.4")
    assert calls["scenario_type"] is None


def test_generate_passes_difficulty_through(exam_app, monkeypatch):
    calls = {}

    def fake_generate(
        ts, avoid=None, scenario_type=None, difficulty="standard", register="named",
        scenario=None,
    ):
        calls["difficulty"] = difficulty
        return make_candidate(ts)

    monkeypatch.setattr(exam_app.exam_lib, "generate_question", fake_generate)
    exam_app.ExamApi().generate("D1.1", [], None, "hard")
    assert calls["difficulty"] == "hard"
    exam_app.ExamApi().generate("D1.1")  # defaults to standard
    assert calls["difficulty"] == "standard"


def test_generate_passes_register_through(exam_app, monkeypatch):
    """Without this the fresh timed exam and the drill — the two paths a
    candidate actually practises on — would generate 100% named-register
    questions forever, which is the over-fitting this change exists to fix."""
    calls = {}

    def fake_generate(
        ts, avoid=None, scenario_type=None, difficulty="standard", register="named",
        scenario=None,
    ):
        calls["register"] = register
        return make_candidate(ts)

    monkeypatch.setattr(exam_app.exam_lib, "generate_question", fake_generate)
    exam_app.ExamApi().generate("D1.1", [], None, "standard", "functional")
    assert calls["register"] == "functional"
    exam_app.ExamApi().generate("D1.1")  # defaults to named
    assert calls["register"] == "named"


def test_generate_rejects_unknown_register(exam_app, monkeypatch):
    result = exam_app.ExamApi().generate("D1.1", [], None, "standard", "haiku")
    assert "error" in result


def test_generate_wraps_success(exam_app, monkeypatch):
    candidate = make_candidate("D5.1")
    monkeypatch.setattr(
        exam_app.exam_lib,
        "generate_question",
        lambda ts, avoid=None, scenario_type=None, difficulty="standard",
        register="named", scenario=None: candidate,
    )
    assert exam_app.ExamApi().generate("D5.1") == {"question": candidate}


def test_generate_appends_extra_avoid_to_bank_summaries(exam_app, monkeypatch):
    captured = {}

    def fake_generate(
        ts, avoid=None, scenario_type=None, difficulty="standard", register="named",
        scenario=None,
    ):
        captured["avoid"] = avoid
        return make_candidate(ts)

    monkeypatch.setattr(exam_app.exam_lib, "generate_question", fake_generate)
    exam_app.ExamApi().generate("D1.2", ["correct=B | scenario: an in-form sibling"])
    assert captured["avoid"][-1] == "correct=B | scenario: an in-form sibling"
    # bank summaries for the statement still come first
    assert len(captured["avoid"]) > 1


def test_generate_rejects_non_string_extra_avoid(exam_app, monkeypatch):
    monkeypatch.setattr(
        exam_app.exam_lib,
        "generate_question",
        lambda ts, avoid=None, scenario_type=None, difficulty="standard",
        register="named", scenario=None: make_candidate(ts),
    )
    result = exam_app.ExamApi().generate("D1.2", [{"not": "a string"}])
    assert "error" in result


def test_generate_wraps_errors_instead_of_raising(exam_app, monkeypatch):
    def boom(ts, avoid=None, scenario_type=None, difficulty="standard", register="named", scenario=None):
        raise exam_lib.GenerationError("still not valid JSON")

    monkeypatch.setattr(exam_app.exam_lib, "generate_question", boom)
    result = exam_app.ExamApi().generate("D5.1")
    assert result["error"] == "GenerationError"
    assert "still not valid JSON" in result["detail"]


def test_state_round_trips_through_progress_file(exam_app, monkeypatch, tmp_path):
    monkeypatch.setattr(exam_app, "PROGRESS_PATH", tmp_path / "exam_progress.json")
    api = exam_app.ExamApi()
    assert api.load_state() is None
    state = {"version": 1, "weights": {"D1.1": 2.5}}
    api.save_state(state)
    assert api.load_state() == state


# ── Exam navigation contract (skip / return / mark for review) ──────────────
# The real exam lets a candidate leave a question blank, move on, and come back.
# The pure logic lives in adaptive.js (A.nav, covered by adaptive.test.js); these
# guard the DOM and packaging side, which no JS test reaches — including the
# desktop app, whose window loads this same exam.html out of the bundle.

EXAM_HTML = (PRACTICE_EXAM_DIR / "exam.html").read_text(encoding="utf-8")
EXAM_SPEC = (PRACTICE_EXAM_DIR / "exam_app.spec").read_text(encoding="utf-8")


def test_drill_generation_draws_a_register():
    """The drill is the highest-volume practice path — every question after the
    first is generated. Leaving it register-less would keep daily practice 100%
    named-register, which is exactly the over-fitting being fixed."""
    body = EXAM_HTML.split("async function generateFor(")[1].split("\n  async function ")[0]
    assert "A.drawRegister(" in body
    assert "register" in body.split("bridge.generate(")[1].split(")")[0]


def test_fresh_exam_assigns_a_register_to_every_slot():
    body = EXAM_HTML.split("function startFreshExam()")[1].split("\nasync function ")[0]
    assert "A.examRegisterPlan(" in body
    assert "register:" in body


def test_prep_worker_forwards_the_assigned_register():
    body = EXAM_HTML.split("async function prepWorker(prep)")[1].split("\nfunction ")[0]
    assert "register" in body.split("bridge.generate(")[1].split(")")[0]


def test_exam_offers_skip_and_mark_controls():
    for element_id in ("btn-exam-skip", "btn-exam-mark", "btn-exam-next-blank"):
        assert f'id="{element_id}"' in EXAM_HTML, f"{element_id} missing from markup"
        assert f'el("{element_id}").addEventListener' in EXAM_HTML, (
            f"{element_id} exists but is never wired to a handler"
        )


def test_forward_motion_no_longer_requires_an_answer():
    """The old guard refused to advance on a blank; skipping must be allowed."""
    assert "no skip-to-blank" not in EXAM_HTML
    assert "function examSkip()" in EXAM_HTML
    # Skip must not be gated on a selection the way committing an answer is.
    # Split on the next top-level `function` rather than a bare "}" so adding a
    # braced block inside examSkip can't silently truncate the captured body.
    skip_body = EXAM_HTML.split("function examSkip()")[1].split("\nfunction ")[0]
    assert "if (!app.selected) return" not in skip_body
    # But it must refuse to advance off a question that hasn't generated yet —
    # otherwise a fresh-question exam quietly fills with bank substitutes.
    assert "A.nav.slotIsResolved" in skip_body


def test_review_screen_is_reachable_before_the_form_is_complete():
    """Review is how you find your skipped questions, so it can't be gated."""
    assert "examAllAnswered" not in EXAM_HTML, (
        "the all-answered gate should be gone; use A.nav.examProgress instead"
    )
    assert 'el("btn-exam-review").hidden = false;' in EXAM_HTML


def test_submit_warns_before_scoring_an_incomplete_form():
    submit_body = EXAM_HTML.split("function submitExam()")[1].split("\nfunction ")[0]
    assert "A.nav.needsSubmitConfirmation" in submit_body
    assert "confirm(" in submit_body
    assert "still unanswered" in submit_body


def test_mark_for_review_is_distinct_from_the_discard_flag():
    """`marked` is exam-session navigation state; `state.flagged` permanently
    discards a flawed bank question. Conflating them would silently drop
    questions a candidate merely wanted to revisit."""
    mark_body = EXAM_HTML.split("function toggleExamMark()")[1].split("\nfunction ")[0]
    assert "A.nav.toggleMarked" in mark_body
    assert "flagged" not in mark_body, "mark-for-review must not touch state.flagged"
    assert "marked: {}," in EXAM_HTML, "exam state must initialize a marked map"


def test_exam_only_controls_are_hidden_when_leaving_exam_mode():
    """Otherwise the exam's skip/mark buttons leak into the practice drill."""
    exit_body = EXAM_HTML.split("function exitExamLayout()")[1].split("\n}")[0]
    for element_id in ("btn-exam-skip", "btn-exam-mark"):
        assert f'el("{element_id}").hidden = true;' in exit_body


def test_spec_bundles_every_script_exam_html_loads():
    """A <script src> that isn't in the PyInstaller DATAS list loads fine in a
    browser and silently breaks the frozen desktop app."""
    sources = set(re.findall(r'<script[^>]*src="([^"]+)"', EXAM_HTML))
    assert sources, "expected exam.html to load at least one external script"
    bundled = set(re.findall(r'"([^"]+\.(?:js|html|md))"', EXAM_SPEC))
    missing = sorted(sources - bundled)
    assert not missing, f"scripts loaded but not bundled in exam_app.spec: {missing}"


def test_every_el_lookup_in_exam_html_resolves():
    """Catches a typo'd or renamed element id before it reaches the app, where
    el() returns null and the next property access throws."""
    static_ids = set(re.findall(r'\bid="([^"]+)"', EXAM_HTML))
    js_ids = set(re.findall(r'\.id\s*=\s*"([^"]+)"', EXAM_HTML))  # lazily created
    referenced = set(re.findall(r'\bel\("([^"]+)"\)', EXAM_HTML))
    missing = sorted(referenced - static_ids - js_ids)
    assert not missing, f"el() references elements that are never created: {missing}"


def test_generation_wait_screen_hides_skip_and_mark():
    """In fresh-question mode the exam parks on a paused "Generating this
    question…" screen when the candidate outpaces the generator. Skip and mark
    must not carry over visible from the previous question's render: skipping
    there races ahead of the generator and silently fills the form with bank
    substitutes, defeating the point of the readiness gate."""
    wait_branch = EXAM_HTML.split("Generating this question")[1].split("return;")[0]
    for element_id in ("btn-exam-skip", "btn-exam-mark"):
        assert f'el("{element_id}").hidden = true;' in wait_branch, (
            f"{element_id} stays visible on the generation-wait screen"
        )


# ── Usage limits are not content failures ───────────────────────────────────
#
# Of 767 recorded generation calls, 220 returned the CLI's own "You've hit your
# session limit" instead of a question. The code treated every one as a content
# failure: it burned the retry feeding the limit message back as "error feedback",
# then dropped the item with no record of why. These pin the separation.


def test_looks_rate_limited_matches_the_real_cli_message():
    real = "You've hit your session limit · resets 3pm (America/New_York)"
    assert exam_lib.looks_rate_limited(real)


def test_looks_rate_limited_ignores_ordinary_content_about_limits():
    """Rate limiting is itself an exam topic here, so the matcher must not fire on
    a legitimately generated question that discusses it."""
    assert not exam_lib.looks_rate_limited(
        "Which approach best handles a provider rate limit with exponential backoff?"
    )
    assert not exam_lib.looks_rate_limited("The token limit was exceeded.")
    assert not exam_lib.looks_rate_limited("")
    assert not exam_lib.looks_rate_limited(None)


def test_rate_limit_does_not_consume_a_retry(monkeypatch):
    """The whole point: a cap must propagate on the FIRST call, not be retried."""
    calls = []

    def fake_run(prompt):
        calls.append(prompt)
        raise exam_lib.RateLimitedError("usage window exhausted: hit your session limit")

    with pytest.raises(exam_lib.RateLimitedError):
        exam_lib.generate_question("D1.4", run=fake_run)
    assert len(calls) == 1, "a usage cap must not spend a second call to be told twice"


def test_content_failure_still_retries_once(monkeypatch):
    """Guard the other side: the retry loop must still work for real content errors."""
    calls = []

    def fake_run(prompt):
        calls.append(prompt)
        if len(calls) == 1:
            # wrong task statement — generate_question rejects this explicitly
            return {"structured_output": make_candidate("D2.2")}
        return {"structured_output": make_candidate("D1.4")}

    got = exam_lib.generate_question("D1.4", run=fake_run)
    assert len(calls) == 2, "a content failure should still get its one retry"
    assert got["taskStatement"] == "D1.4"


def test_rate_limited_error_is_not_a_generation_error():
    """If it ever subclassed GenerationError it would be swallowed by the retry
    tuple in generate_question and this whole separation would silently revert."""
    assert not issubclass(exam_lib.RateLimitedError, exam_lib.GenerationError)


# ── run_claude is the shared CLI transport ─────────────────────────────────
# It used to hardwire the question schema and the question-sized timeout, which
# made it unusable for anything but generating one question: classifying a
# banked question, writing a block scenario, and screening a candidate each
# return a different shape, and a scenario call has its own latency profile.


def _capture_run_claude_call(monkeypatch):
    """Run run_claude against a stubbed subprocess; return the recorded call."""
    seen = {}

    class FakeCompleted:
        returncode = 0
        stdout = '{"structured_output": {}}'
        stderr = ""

    def fake_subprocess_run(argv, **kwargs):
        seen["argv"] = argv
        seen["kwargs"] = kwargs
        return FakeCompleted()

    monkeypatch.setattr(exam_lib.subprocess, "run", fake_subprocess_run)
    monkeypatch.setattr(exam_lib, "find_claude", lambda: "/usr/bin/claude")
    return seen


def _schema_arg(argv):
    return json.loads(argv[argv.index("--json-schema") + 1])


def test_run_claude_defaults_to_the_question_schema_and_timeout(monkeypatch):
    seen = _capture_run_claude_call(monkeypatch)
    exam_lib.run_claude("a prompt")
    assert _schema_arg(seen["argv"]) == exam_lib.QUESTION_JSON_SCHEMA
    assert seen["kwargs"]["timeout"] == exam_lib.GENERATION_TIMEOUT_SECONDS


def test_run_claude_accepts_an_alternate_schema(monkeypatch):
    """B1 classification and C3 screening return {id, ...}, not a question."""
    seen = _capture_run_claude_call(monkeypatch)
    other = {
        "type": "object",
        "properties": {"id": {"type": "string"}, "verdict": {"type": "string"}},
        "required": ["id", "verdict"],
        "additionalProperties": False,
    }
    exam_lib.run_claude("a prompt", schema=other)
    assert _schema_arg(seen["argv"]) == other


def test_run_claude_accepts_an_alternate_timeout(monkeypatch):
    seen = _capture_run_claude_call(monkeypatch)
    exam_lib.run_claude("a prompt", timeout=45)
    assert seen["kwargs"]["timeout"] == 45


def test_run_claude_timeout_message_reports_the_timeout_actually_used(monkeypatch):
    """A hardcoded '120s' in the error would misreport every non-default call."""

    def fake_subprocess_run(argv, **kwargs):
        raise exam_lib.subprocess.TimeoutExpired(cmd=argv, timeout=kwargs["timeout"])

    monkeypatch.setattr(exam_lib.subprocess, "run", fake_subprocess_run)
    monkeypatch.setattr(exam_lib, "find_claude", lambda: "/usr/bin/claude")
    with pytest.raises(exam_lib.GenerationError) as err:
        exam_lib.run_claude("a prompt", timeout=7)
    assert "7s" in str(err.value)


# ── Shared-scenario blocks ─────────────────────────────────────────────────
# The real exam draws 4 of 6 scenarios and asks 15 consecutive questions
# against ONE scenario each. Our questions each invented their own scenario —
# 103 questions, 103 distinct scenarios — so "grouping by scenario type" would
# group by GENRE, not by content, and a persistent scenario panel would show
# the wrong text. A block therefore generates its scenario once and passes it
# in as a fixed input to the ordinary per-question calls.


def test_scenario_schema_asks_only_for_a_scenario():
    schema = exam_lib.SCENARIO_JSON_SCHEMA
    assert schema["required"] == ["scenario"]
    assert schema["additionalProperties"] is False


def test_generate_scenario_returns_the_text():
    def fake_run(prompt, schema=None, timeout=None):
        assert schema is exam_lib.SCENARIO_JSON_SCHEMA
        return {"structured_output": {"scenario": "A CI pipeline fails on flaky tests."}}

    got = exam_lib.generate_scenario(
        "Claude Code for Continuous Integration", run=fake_run
    )
    assert got == "A CI pipeline fails on flaky tests."


def test_generate_scenario_rejects_an_unknown_scenario_type():
    with pytest.raises(ValueError):
        exam_lib.generate_scenario("Underwater Basket Weaving", run=lambda *a, **k: {})


def test_generate_scenario_rejects_an_empty_scenario():
    def fake_run(prompt, schema=None, timeout=None):
        return {"structured_output": {"scenario": "   "}}

    with pytest.raises(exam_lib.GenerationError):
        exam_lib.generate_scenario("Multi-Agent Research System", run=fake_run)


def test_build_prompt_supplies_a_fixed_scenario_instead_of_asking_for_one():
    fixed = "A nightly ETL job silently drops malformed rows."
    prompt = exam_lib.build_prompt("D1.4", scenario=fixed)
    assert fixed in prompt
    # The standing brief tells it to WRITE a scenario; with one supplied that
    # instruction has to be overridden or the model invents a second one.
    assert "Do not write a new scenario" in prompt


def test_generate_question_forces_the_supplied_scenario_verbatim():
    """Block-mates must share BYTE-IDENTICAL scenario text: the panel decides
    when to repaint by comparing the text, and a model that paraphrases its
    input would make the panel flicker mid-block."""
    fixed = "A nightly ETL job silently drops malformed rows."

    def fake_run(prompt):
        candidate = make_candidate("D1.4")
        candidate["scenario"] = "A nightly ETL job drops bad rows."  # paraphrased
        return {"structured_output": candidate}

    got = exam_lib.generate_question("D1.4", run=fake_run, scenario=fixed)
    assert got["scenario"] == fixed


# ── Fresh-exam blocks (exam.html DOM/wiring contract) ──────────────────────


def test_fresh_exam_draws_blocks_rather_than_a_flat_form():
    body = EXAM_HTML.split("async function startFreshExam()")[1].split("\n// Generate one")[0]
    assert "A.drawExamBlocks(" in body
    assert "A.drawExamStatements(" not in body, "the flat 60-draw is the old shape"
    assert "blockIndex" in body


def test_fresh_exam_generates_one_scenario_per_block_before_questions():
    """Four cheap calls first: discovering a scenario failure after 15 question
    calls have been spent against it wastes the whole block."""
    body = EXAM_HTML.split("async function prepareBlockScenarios(prep)")[1].split("\nfunction ")[0]
    assert "bridge.generateScenario(" in body
    start = EXAM_HTML.split("async function startFreshExam()")[1].split("\n// Generate one")[0]
    assert "await prepareBlockScenarios(prep)" in start


def test_prep_worker_retries_against_the_same_scenario_before_giving_up():
    """A bank substitute carries a different scenario and punches a hole in the
    block, so one retry is worth spending to avoid it."""
    body = EXAM_HTML.split("async function prepWorker(prep)")[1].split("\nfunction ")[0]
    assert "attempt < 2" in body
    assert "scenario" in body.split("bridge.generate(")[1].split(")")[0]


def test_bank_substitutes_inside_a_block_are_marked_off_scenario():
    """Otherwise the form would silently claim 4x15 shared-scenario blocks it
    no longer has, and the panel would not repaint for the odd one out."""
    body = EXAM_HTML.split("function substituteFromBank(exam, slot)")[1].split("\nfunction ")[0]
    assert "offScenario" in body


def test_avoid_summary_carries_the_question_stem():
    """Block-mates share a scenario, so the scenario prefix is identical for
    all 15 and carries no signal about what has already been asked."""
    body = EXAM_HTML.split("function summarizeForAvoid(question)")[1].split("\n//")[0]
    assert "question.question" in body


def test_generate_scenario_bridge_wraps_errors(exam_app, monkeypatch):
    def boom(scenario_type):
        raise RuntimeError("no CLI")

    monkeypatch.setattr(exam_app.exam_lib, "generate_scenario", boom)
    result = exam_app.ExamApi().generate_scenario("Multi-Agent Research System")
    assert result["error"] == "RuntimeError"


def test_generate_scenario_bridge_wraps_success(exam_app, monkeypatch):
    monkeypatch.setattr(
        exam_app.exam_lib, "generate_scenario", lambda st: "A shared scenario."
    )
    assert exam_app.ExamApi().generate_scenario("Structured Data Extraction") == {
        "scenario": "A shared scenario."
    }


# ── Scenario panel + mark-through (exam.html contract) ─────────────────────


def test_scenario_panel_split_is_scoped_to_blocked_forms_only():
    """The bank exam is also exam-active but its 60 scenarios are all
    different — splitting there costs stem width to hold text that repaints
    every question anyway."""
    assert "body.exam-blocked #question-card" in EXAM_HTML
    assert "body.exam-active #question-card {" not in EXAM_HTML
    assert 'classList.toggle("exam-blocked"' in EXAM_HTML


def test_blocked_layout_widens_the_exam_column():
    """body.exam-active caps the column at 780px, which a side-by-side split
    cannot live inside."""
    assert "body.exam-blocked .layout { max-width: 1120px; }" in EXAM_HTML


def test_scenario_repaints_on_text_change_not_on_block_index():
    body = EXAM_HTML.split("function setExamScenario(text)")[1].split("\nfunction ")[0]
    assert "app.displayedScenario === text" in body
    assert "blockIndex" not in body


def test_generation_wait_screen_goes_through_the_scenario_setter():
    """A direct write would leave the panel believing the wait text is the
    current scenario, so the real one would never repaint."""
    assert 'el("q-scenario").textContent =\n        "Generating' not in EXAM_HTML
    assert 'setExamScenario("Generating this question' in EXAM_HTML


def test_exam_state_initialises_a_struck_map():
    assert "struck: {}," in EXAM_HTML


def test_strike_control_is_a_sibling_of_the_option_not_a_child():
    """A <button> inside a <button> is invalid HTML with unreliable clicks and
    assistive-tech behaviour."""
    body = EXAM_HTML.split("function renderExamQuestion()")[1].split("\n// Progress over")[0]
    assert "option-row" in body
    assert "row.append(btn, strike)" in body


def test_striking_touches_no_answer_or_flag_state():
    """Crossing an option out is thinking, not deciding: it must not reach
    answers (commits a choice), marked (revisit later), or state.flagged
    (permanently discard a question)."""
    body = EXAM_HTML.split("function renderExamQuestion()")[1].split("\n// Progress over")[0]
    strike_handler = body.split('strike.addEventListener("click", () => {')[1].split("});")[0]
    # Assert on code, not on the comment that explains the code.
    code = "\n".join(
        line for line in strike_handler.splitlines() if not line.strip().startswith("//")
    )
    assert "A.nav.toggleStruck" in code
    for forbidden in ("answers", "marked", "flagged"):
        assert forbidden not in code, f"strike handler reaches {forbidden}"


def test_struck_options_stay_selectable():
    """Elimination is an aid, not a commitment — a struck option must still be
    choosable, so the strike styling may not disable the button."""
    assert ".option.struck .opt-text { text-decoration: line-through" in EXAM_HTML
    assert ".option.struck { pointer-events: none" not in EXAM_HTML
    assert "btn.disabled = true" not in EXAM_HTML.split("function renderExamQuestion()")[1].split(
        "\n// Progress over"
    )[0]


def test_blocked_class_is_cleared_when_leaving_exam_mode():
    exit_body = EXAM_HTML.split("function exitExamLayout()")[1].split("\n}")[0]
    assert 'classList.remove("exam-blocked")' in exit_body


# ── Prepared forms (bridge storage) ────────────────────────────────────────
# A whole 60-question exam generated ahead of time, so a sitting never waits on
# the generator. Written after every question because preparing one is ~64
# calls over 15-30 minutes and losing it to a crash would make it not worth
# using.


@pytest.fixture
def forms_api(exam_app, tmp_path, monkeypatch):
    monkeypatch.setattr(exam_app, "FORMS_PATH", tmp_path / "exam_forms.json")
    return exam_app.ExamApi()


def _form(fid="form-1", ready=2, total=60, **extra):
    return dict(
        {
            "id": fid,
            "createdAt": "2026-08-03T10:00:00",
            "satAt": None,
            "total": total,
            "complete": ready == total,
            "blocks": [{"scenarioType": "Multi-Agent Research System", "scenario": "s"}],
            "questions": [{"id": f"{fid}-slot{i}"} for i in range(ready)]
            + [None] * (total - ready),
        },
        **extra,
    )


def test_forms_round_trip_through_the_bridge(forms_api):
    forms_api.save_form(_form())
    assert forms_api.load_form("form-1")["id"] == "form-1"
    assert forms_api.load_form("nope") is None


def test_list_forms_returns_metadata_not_sixty_questions(forms_api):
    forms_api.save_form(_form("form-1", ready=60))
    listed = forms_api.list_forms()
    assert listed == [
        {
            "id": "form-1",
            "createdAt": "2026-08-03T10:00:00",
            "satAt": None,
            "ready": 60,
            "total": 60,
            "complete": True,
            "scenarioTypes": ["Multi-Agent Research System"],
        }
    ]
    assert "questions" not in listed[0]


def test_saving_a_form_twice_updates_rather_than_duplicates(forms_api):
    forms_api.save_form(_form("form-1", ready=2))
    forms_api.save_form(_form("form-1", ready=17))
    assert [f["ready"] for f in forms_api.list_forms()] == [17]


def test_forms_are_kept_separate_from_each_other(forms_api):
    forms_api.save_form(_form("form-1"))
    forms_api.save_form(_form("form-2"))
    assert sorted(f["id"] for f in forms_api.list_forms()) == ["form-1", "form-2"]
    forms_api.delete_form("form-1")
    assert [f["id"] for f in forms_api.list_forms()] == ["form-2"]


def test_marking_a_form_sat_is_what_stops_a_rerun_inflating_the_score(forms_api):
    """Prepared-form questions are ephemeral, so sitting one leaves no
    seen-marks — nothing else would stop a candidate re-sitting the same 60
    memorised questions and reading the result as readiness."""
    forms_api.save_form(_form("form-1", ready=60))
    assert forms_api.list_forms()[0]["satAt"] is None
    forms_api.mark_form_sat("form-1", "2026-08-03T12:30:00")
    assert forms_api.list_forms()[0]["satAt"] == "2026-08-03T12:30:00"


def test_marking_an_unknown_form_is_a_no_op(forms_api):
    assert forms_api.mark_form_sat("ghost", "2026-08-03T12:30:00") is True
    assert forms_api.list_forms() == []


def test_forms_store_is_separate_from_progress(exam_app):
    """Progress and prepared forms must not share a file — a corrupt or
    deleted form store must never take adaptive history with it."""
    assert exam_app.FORMS_PATH != exam_app.PROGRESS_PATH
    assert exam_app.FORMS_PATH.name == "exam_forms.json"


# ── Prepared forms (exam.html contract) ────────────────────────────────────


def test_prepared_form_job_has_its_own_holder():
    """closeExamSetup cancels app.freshPrep, so leaving the setup card is how
    you cancel a fresh exam. A background job reachable by that path could
    never survive the user navigating away, which is the whole point."""
    close_body = EXAM_HTML.split("function closeExamSetup()")[1].split("\n}")[0]
    # Code only — the comment above it names formJob to explain the omission.
    code = "\n".join(
        line for line in close_body.splitlines() if not line.strip().startswith("//")
    )
    assert "app.freshPrep" in code
    assert "app.formJob" not in code, "closeExamSetup must not cancel a form job"
    assert "app.formJob = job" in EXAM_HTML


def test_prepared_form_persists_after_every_question():
    """~64 calls over 15-30 minutes; losing it to a crash would make the
    feature not worth using."""
    body = EXAM_HTML.split("async function prepareForm()")[1].split(
        "\nasync function generateFormQuestion"
    )[0]
    per_question = body.split("for (let i = 0; i < form.assignments.length")[1]
    assert "save_form(form)" in per_question


def test_prepared_form_stops_on_a_usage_cap():
    """The cap is account-wide — the rest of the form would fail identically."""
    body = EXAM_HTML.split("async function generateFormQuestion")[1].split("\nfunction ")[0]
    assert "RateLimited" in body
    assert "throw new Error" in body


def test_prepared_form_ids_are_form_scoped():
    """gen-<slot> collides across every stored form, so two prepared forms
    would look like the same 60 questions."""
    body = EXAM_HTML.split("async function generateFormQuestion")[1].split("\nfunction ")[0]
    assert "${form.id}-slot${slot}" in body
    assert "`gen-${slot}`" not in body


def test_regenerating_a_question_mints_a_new_id():
    """Reusing the slot id would give the same id different content, so any
    review state recorded against it silently goes stale."""
    body = EXAM_HTML.split("async function regenerateFormQuestion(")[1].split(
        "\nasync function "
    )[0]
    assert "idSuffix" in EXAM_HTML.split("async function generateFormQuestion")[1][:400]
    assert "-r${Date.now()" in body


def test_sitting_a_prepared_form_stamps_it_and_warns_on_a_rerun():
    body = EXAM_HTML.split("async function sitPreparedForm(meta)")[1].split("\nasync function ")[0]
    assert "mark_form_sat" in body
    assert "meta.satAt && !confirm(" in body
    assert "recall rather than readiness" in body


def test_sitting_a_prepared_form_turns_on_the_scenario_panel():
    body = EXAM_HTML.split("async function sitPreparedForm(meta)")[1].split("\nasync function ")[0]
    assert "blocks: form.blocks" in body


def test_unload_guard_covers_a_prepared_form_job():
    guard = EXAM_HTML.split('window.addEventListener("beforeunload"')[1].split("});")[0]
    assert "app.formJob" in guard


def test_a_partly_generated_form_can_be_resumed():
    """An ordinary per-slot failure leaves nulls in the form. Without a resume
    path that form is permanently unsittable — sitPreparedForm refuses anything
    incomplete — so the persisted work is stranded rather than saved."""
    assert "async function resumeForm(" in EXAM_HTML
    body = EXAM_HTML.split("async function resumeForm(")[1].split("\nasync function ")[0]
    assert "load_form" in body
    assert "runFormJob" in body


def test_resume_fills_only_the_missing_slots():
    body = EXAM_HTML.split("async function runFormJob(form)")[1].split("\nasync function ")[0]
    assert "form.questions[i]" in body
    assert "continue" in body, "already-generated slots must not be regenerated"


def test_any_question_can_be_regenerated_before_sitting():
    assert "async function regenerateFormQuestion(" in EXAM_HTML
    body = EXAM_HTML.split("async function regenerateFormQuestion(")[1].split(
        "\nasync function "
    )[0]
    assert "save_form" in body


def test_the_form_list_offers_resume_and_review_not_just_sit_and_delete():
    body = EXAM_HTML.split("async function refreshPreparedForms()")[1].split(
        "\nasync function "
    )[0]
    for label in ("Resume", "Review"):
        assert label in body, f"the form list offers no {label} control"


def test_prepare_and_resume_share_one_generation_loop():
    """Two copies of a 64-call loop is two places for the persistence and
    rate-limit handling to drift apart."""
    prepare = EXAM_HTML.split("async function prepareForm()")[1].split(
        "\nasync function "
    )[0]
    assert "runFormJob(" in prepare


def test_highest_risk_rules_are_restated_next_to_the_task():
    """C4 moved the standing brief 22k chars ahead of the task statement for
    prompt-cache reuse. That distance plausibly costs instruction adherence —
    the first real batch came back 6/6 longest-is-correct — so the two rules
    whose violation is invisible in the finished question are restated in the
    volatile tail. Costs nothing to cache: everything after the first
    placeholder is uncached already."""
    prompt = exam_lib.build_prompt("D1.4")
    divider = prompt.index("─" * 10)
    tail = prompt[divider:]
    assert "OPTION LENGTH" in tail
    assert "NO INVENTED SPECIFICS" in tail
    # And the full rules must still be in the cached prefix, not moved.
    head = prompt[:divider]
    assert "Keep all four options within roughly the same length" in head
    assert "NOT to invent specific technical facts" in head


def test_restating_the_rules_does_not_break_the_cached_prefix():
    import os.path

    a = exam_lib.build_prompt("D1.4")
    b = exam_lib.build_prompt("D2.3", difficulty="hard", register="functional")
    shared = os.path.commonprefix([a, b])
    assert exam_lib._few_shot_block(exam_lib.load_bank()) in shared
    assert len(shared) / len(a) > 0.8


# ── Length tell: rejected at generation, not merely discouraged ────────────
# The prompt has asked for option-length parity since the bank was seeded, and
# the bank is 85% longest-is-correct; restating the rule next to the task moved
# the MARGIN (mean ratio 1.24 -> 1.08) but not the ORDERING (still 6/6). The
# rule was also mis-specified: "no option more than 1.3x the others" is fully
# satisfied by a correct answer that is longest by one character, which is
# still 100% exploitable. So it is enforced in code instead.


def _with_option_lengths(lengths):
    candidate = make_candidate("D1.4")
    candidate["options"] = {k: "x" * n for k, n in lengths.items()}
    candidate["correct"] = "B"
    return candidate


def test_longest_option_is_correct_detects_the_tell():
    assert exam_lib.longest_option_is_correct(
        _with_option_lengths({"A": 50, "B": 90, "C": 40, "D": 60})
    )
    assert not exam_lib.longest_option_is_correct(
        _with_option_lengths({"A": 50, "B": 60, "C": 90, "D": 40})
    )


def test_a_tie_for_longest_is_not_a_tell():
    """Picking 'the longest' is ambiguous at a tie, so it carries no signal."""
    assert not exam_lib.longest_option_is_correct(
        _with_option_lengths({"A": 90, "B": 90, "C": 40, "D": 60})
    )


def test_generation_retries_when_the_correct_option_is_longest():
    """Routed through the existing retry-with-error-feedback loop — the exam's
    own D4.4 pattern applied to this tool."""
    prompts = []

    def fake_run(prompt):
        prompts.append(prompt)
        if len(prompts) == 1:
            return {"structured_output": _with_option_lengths(
                {"A": 50, "B": 90, "C": 40, "D": 60})}
        return {"structured_output": _with_option_lengths(
            {"A": 90, "B": 60, "C": 40, "D": 50})}

    got = exam_lib.generate_question("D1.4", run=fake_run)
    assert len(prompts) == 2, "the tell must cost a retry, not pass"
    assert not exam_lib.longest_option_is_correct(got)
    # The feedback has to say what to fix, or the retry is a coin flip.
    assert "longest" in prompts[1]
    assert "distractor" in prompts[1]


def test_a_question_that_keeps_the_tell_twice_is_not_banked():
    def fake_run(prompt):
        return {"structured_output": _with_option_lengths(
            {"A": 50, "B": 90, "C": 40, "D": 60})}

    with pytest.raises(exam_lib.GenerationError):
        exam_lib.generate_question("D1.4", run=fake_run)


def test_a_clean_question_still_costs_only_one_call():
    calls = []

    def fake_run(prompt):
        calls.append(prompt)
        return {"structured_output": _with_option_lengths(
            {"A": 90, "B": 60, "C": 40, "D": 50})}

    exam_lib.generate_question("D1.4", run=fake_run)
    assert len(calls) == 1
