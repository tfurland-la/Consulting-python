"""Tests for question generation (exam_lib) and the desktop app bridge (exam_app).

All `claude` CLI interaction is mocked — these tests run offline. The real
end-to-end path is exercised manually via `python3 practice-exam/exam_app.py`.
"""

import json

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

    def fake_generate(ts, avoid=None, scenario_type=None, difficulty="standard"):
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

    def fake_generate(ts, avoid=None, scenario_type=None, difficulty="standard"):
        calls["difficulty"] = difficulty
        return make_candidate(ts)

    monkeypatch.setattr(exam_app.exam_lib, "generate_question", fake_generate)
    exam_app.ExamApi().generate("D1.1", [], None, "hard")
    assert calls["difficulty"] == "hard"
    exam_app.ExamApi().generate("D1.1")  # defaults to standard
    assert calls["difficulty"] == "standard"


def test_generate_wraps_success(exam_app, monkeypatch):
    candidate = make_candidate("D5.1")
    monkeypatch.setattr(
        exam_app.exam_lib,
        "generate_question",
        lambda ts, avoid=None, scenario_type=None, difficulty="standard": candidate,
    )
    assert exam_app.ExamApi().generate("D5.1") == {"question": candidate}


def test_generate_appends_extra_avoid_to_bank_summaries(exam_app, monkeypatch):
    captured = {}

    def fake_generate(ts, avoid=None, scenario_type=None, difficulty="standard"):
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
        lambda ts, avoid=None, scenario_type=None, difficulty="standard": make_candidate(ts),
    )
    result = exam_app.ExamApi().generate("D1.2", [{"not": "a string"}])
    assert "error" in result


def test_generate_wraps_errors_instead_of_raising(exam_app, monkeypatch):
    def boom(ts, avoid=None, scenario_type=None, difficulty="standard"):
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
