"""Tests for the CCAR-F practice exam question bank (practice-exam/questions.js).

The practice-exam directory name is hyphenated, so it cannot be imported as a
package; modules are loaded by file path instead (with the directory placed on
sys.path so their sibling imports resolve).
"""

import importlib.util
import sys
from pathlib import Path

import pytest

PRACTICE_EXAM_DIR = Path(__file__).parent / "practice-exam"


def load_practice_exam_module(filename):
    sys.path.insert(0, str(PRACTICE_EXAM_DIR))
    try:
        path = PRACTICE_EXAM_DIR / filename
        spec = importlib.util.spec_from_file_location(path.stem, path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module
    finally:
        sys.path.remove(str(PRACTICE_EXAM_DIR))


exam_lib = load_practice_exam_module("exam_lib.py")


@pytest.fixture(scope="module")
def bank():
    return exam_lib.load_bank()


def make_valid_question():
    question = {
        "taskStatement": "D1.2",
        "domain": "D1",
        "scenario": "A production scenario.",
        "question": "What should you do?",
        "options": {"A": "First", "B": "Second", "C": "Third", "D": "Fourth"},
        "correct": "B",
        "explanations": {"A": "Wrong", "B": "Right", "C": "Wrong", "D": "Wrong"},
        "provenance": {
            "source": "official-sample",
            "model": None,
            "generatedAt": None,
            "reviewed": True,
        },
    }
    question["id"] = exam_lib.question_id(question)
    return question


def test_bank_loads_and_has_the_seed_questions(bank):
    assert isinstance(bank, list)
    assert len(bank) >= 10


def test_every_bank_entry_passes_validation(bank):
    for entry in bank:
        exam_lib.validate_question(entry)


def test_bank_ids_are_unique(bank):
    ids = [entry["id"] for entry in bank]
    assert len(ids) == len(set(ids))


def test_every_bank_entry_is_reviewed(bank):
    for entry in bank:
        assert entry["provenance"]["reviewed"] is True


def test_per_task_statement_minimum(bank):
    counts = {ts: 0 for ts in exam_lib.TASK_STATEMENTS}
    for entry in bank:
        counts[entry["taskStatement"]] += 1
    short = {ts: n for ts, n in counts.items() if n < exam_lib.MIN_PER_TASK}
    assert not short, f"below MIN_PER_TASK={exam_lib.MIN_PER_TASK}: {short}"


def test_bank_covers_a_full_exam_form(bank):
    """Every domain must hold at least its 60-question exam-form quota."""
    assert sum(exam_lib.EXAM_FORM_QUOTAS.values()) == 60
    per_domain = {}
    for entry in bank:
        per_domain[entry["domain"]] = per_domain.get(entry["domain"], 0) + 1
    for domain, quota in exam_lib.EXAM_FORM_QUOTAS.items():
        assert per_domain.get(domain, 0) >= quota, (
            f"{domain} has {per_domain.get(domain, 0)} questions, "
            f"exam form needs {quota}"
        )


def test_render_bank_round_trips_the_committed_file(bank):
    source = (PRACTICE_EXAM_DIR / "questions.js").read_text()
    assert exam_lib.render_bank(bank) == source


def test_task_statement_catalog_is_complete():
    assert len(exam_lib.TASK_STATEMENTS) == 30
    assert set(exam_lib.DOMAINS) == {"D1", "D2", "D3", "D4", "D5"}
    for ts in exam_lib.TASK_STATEMENTS:
        assert ts.split(".")[0] in exam_lib.DOMAINS


def test_validate_accepts_a_well_formed_question():
    exam_lib.validate_question(make_valid_question())


def test_validate_rejects_unknown_task_statement():
    question = make_valid_question()
    question["taskStatement"] = "D9.9"
    with pytest.raises(ValueError):
        exam_lib.validate_question(question)


def test_validate_rejects_domain_mismatch():
    question = make_valid_question()
    question["domain"] = "D2"
    with pytest.raises(ValueError):
        exam_lib.validate_question(question)


def test_validate_rejects_bad_correct_key():
    question = make_valid_question()
    question["correct"] = "E"
    with pytest.raises(ValueError):
        exam_lib.validate_question(question)


def test_validate_rejects_missing_option():
    question = make_valid_question()
    del question["options"]["D"]
    with pytest.raises(ValueError):
        exam_lib.validate_question(question)


def test_validate_rejects_stale_id():
    question = make_valid_question()
    question["scenario"] = "An edited scenario that no longer matches the id."
    with pytest.raises(ValueError):
        exam_lib.validate_question(question)


def test_validate_rejects_unreviewed_entry():
    question = make_valid_question()
    question["provenance"]["reviewed"] = False
    with pytest.raises(ValueError):
        exam_lib.validate_question(question)


def test_validate_without_provenance_for_generated_candidates():
    candidate = make_valid_question()
    del candidate["id"]
    del candidate["provenance"]
    exam_lib.validate_question(candidate, require_provenance=False)


# ── Bank building (generate_bank.py + exam_lib helpers) ────────────────────

generate_bank = load_practice_exam_module("generate_bank.py")


def make_candidate_for(task_statement, marker="x"):
    candidate = make_valid_question()
    del candidate["id"]
    del candidate["provenance"]
    candidate["taskStatement"] = task_statement
    candidate["domain"] = task_statement.split(".")[0]
    candidate["scenario"] = f"A production scenario ({marker})."
    return candidate


def test_attach_provenance_builds_a_pending_entry():
    entry = exam_lib.attach_provenance(
        make_candidate_for("D1.2"),
        source="seed-generated",
        model="claude-sonnet-5",
        generated_at="2026-07-02",
    )
    assert entry["id"] == exam_lib.question_id(entry)
    assert entry["provenance"] == {
        "source": "seed-generated",
        "model": "claude-sonnet-5",
        "generatedAt": "2026-07-02",
        "reviewed": False,
    }


def test_remaining_targets_skips_covered_statements():
    pending = [
        exam_lib.attach_provenance(make_candidate_for("D1.1", "a"), source="seed-generated"),
        exam_lib.attach_provenance(make_candidate_for("D1.1", "b"), source="seed-generated"),
    ]
    targets = generate_bank.remaining_targets(pending, per_task=2, tasks=["D1.1", "D1.2"])
    assert targets == {"D1.2": 2}


def test_merge_pending_sets_reviewed_and_recomputes_edited_ids():
    entry = exam_lib.attach_provenance(make_candidate_for("D2.2"), source="seed-generated")
    entry["scenario"] = "Edited during human review."  # id is now stale on purpose
    merged = generate_bank.merge_pending(exam_lib.load_bank(), [entry])
    added = merged[-1]
    assert added["provenance"]["reviewed"] is True
    assert added["id"] == exam_lib.question_id(added)
    for question in merged:
        exam_lib.validate_question(question)


def test_merge_pending_rejects_duplicates_of_bank_content():
    bank = exam_lib.load_bank()
    duplicate = {
        key: bank[0][key]
        for key in ("taskStatement", "domain", "scenario", "question",
                    "options", "correct", "explanations")
    }
    entry = exam_lib.attach_provenance(duplicate, source="seed-generated")
    with pytest.raises(ValueError):
        generate_bank.merge_pending(bank, [entry])
