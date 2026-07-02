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


def test_health_reports_claude_availability(exam_app, monkeypatch):
    monkeypatch.setattr(exam_app.shutil, "which", lambda name: "/usr/local/bin/claude")
    assert exam_app.ExamApi().health() == {"ok": True, "claude": "available"}
    monkeypatch.setattr(exam_app.shutil, "which", lambda name: None)
    assert exam_app.ExamApi().health() == {"ok": True, "claude": "missing"}


def test_generate_wraps_success(exam_app, monkeypatch):
    candidate = make_candidate("D5.1")
    monkeypatch.setattr(
        exam_app.exam_lib, "generate_question", lambda ts, avoid=None: candidate
    )
    assert exam_app.ExamApi().generate("D5.1") == {"question": candidate}


def test_generate_wraps_errors_instead_of_raising(exam_app, monkeypatch):
    def boom(ts, avoid=None):
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
