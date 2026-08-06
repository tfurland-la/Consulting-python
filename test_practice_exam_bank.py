"""Tests for the CCAR-F practice exam question bank (practice-exam/questions.js).

The practice-exam directory name is hyphenated, so it cannot be imported as a
package; modules are loaded by file path instead (with the directory placed on
sys.path so their sibling imports resolve).
"""

import importlib.util
import json
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
        # Long enough to clear the substance floors in exam_lib.stub_problem.
        # The fixture used to read "A production scenario." / "First" / "Wrong",
        # which is indistinguishable from the placeholder responses that floor
        # exists to reject — so a fixture that short would have made the check
        # untestable against anything realistic.
        "scenario": (
            "A support agent built on the Agent SDK calls its tools out of order "
            "in a measurable share of production conversations."
        ),
        "question": "What change would most effectively address this?",
        "options": {
            "A": "First option, written at the length a real option runs to.",
            "B": "Second option, written at the length a real option runs to.",
            "C": "Third option, written at the length a real option runs to.",
            "D": "Fourth option, written at the length a real option runs to.",
        },
        "correct": "B",
        "explanations": {
            "A": "Wrong, for a reason stated at realistic length.",
            "B": "Right, for a reason stated at realistic length.",
            "C": "Wrong, for a reason stated at realistic length.",
            "D": "Wrong, for a reason stated at realistic length.",
        },
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


# ── Optional generation-metadata fields ────────────────────────────────────
# scenarioType and register record how a question was generated: which of the
# six exam scenario genres it was written for, and whether it names its
# mechanism or describes it functionally. Both are optional so the committed
# bank stays valid while scenarioType is backfilled onto it.


def test_validate_accepts_optional_generation_metadata():
    question = make_valid_question()
    question["scenarioType"] = exam_lib.SCENARIO_TYPES[0]
    question["register"] = "functional"
    exam_lib.validate_question(question)


def test_validate_accepts_questions_without_the_optional_fields():
    """The committed bank predates both fields; absence must stay valid."""
    exam_lib.validate_question(make_valid_question())


def test_validate_rejects_unknown_scenario_type():
    question = make_valid_question()
    question["scenarioType"] = "Underwater Basket Weaving Agent"
    with pytest.raises(ValueError):
        exam_lib.validate_question(question)


def test_validate_rejects_unknown_register():
    question = make_valid_question()
    question["register"] = "interpretive-dance"
    with pytest.raises(ValueError):
        exam_lib.validate_question(question)


def test_validate_still_rejects_genuinely_unknown_fields():
    """Widening for two named fields must not turn into accepting anything."""
    question = make_valid_question()
    question["difficulty"] = "hard"
    with pytest.raises(ValueError):
        exam_lib.validate_question(question)


def test_optional_fields_do_not_change_the_question_id():
    """The whole scenarioType backfill rests on this: canonical_content hashes
    only scenario/question/options, so labelling 103 committed questions must
    not churn a single id."""
    question = make_valid_question()
    before = exam_lib.question_id(question)
    question["scenarioType"] = exam_lib.SCENARIO_TYPES[2]
    question["register"] = "named"
    assert exam_lib.question_id(question) == before
    exam_lib.validate_question(question)  # id still matches after labelling


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


# ── Register mix on the refill path ────────────────────────────────────────
# The mix is exact at ASSIGNMENT, never at merge: generation failures, dedup
# discards and screening deletions all skew it, and functional questions are
# the highest-fabrication-risk category so deletions likely correlate with
# register. Assignment therefore accounts for what is already pending, and the
# merge reports what was actually realized rather than what was asked for.


def test_plan_registers_accounts_for_what_is_already_pending():
    """A re-run after a partial batch must not restart the mix from scratch —
    that is how a bank ends up lopsided one failed run at a time."""
    pending = [{"register": "functional"} for _ in range(9)]
    plan = generate_bank.plan_registers(11, pending, fraction=0.45)
    assert len(plan) == 11
    # 20 total at 45% wants 9 functional; 9 already exist, so none are owed.
    assert plan.count("functional") == 0


def test_plan_registers_asks_for_the_shortfall_when_pending_is_named_heavy():
    pending = [{"register": "named"} for _ in range(10)]
    plan = generate_bank.plan_registers(10, pending, fraction=0.5)
    # 20 total at 50% wants 10 functional; none exist, so all 10 new ones are.
    assert plan.count("functional") == 10


def test_plan_registers_treats_unlabelled_pending_as_named():
    """The committed bank predates the field; absence must not read as
    functional or the shortfall maths inverts."""
    plan = generate_bank.plan_registers(10, [{} for _ in range(10)], fraction=0.5)
    assert plan.count("functional") == 10


def test_register_mix_reports_realized_counts():
    entries = (
        [{"register": "functional"}] * 3 + [{"register": "named"}] * 5 + [{}] * 2
    )
    mix = generate_bank.register_mix(entries)
    assert mix["functional"] == 3
    assert mix["named"] == 5
    assert mix["unlabelled"] == 2
    assert mix["fraction"] == pytest.approx(0.3)


def test_register_mix_of_nothing_is_not_a_division_error():
    assert generate_bank.register_mix([])["fraction"] == 0.0


# ── scenarioType backfill (classify_scenarios.py + the merge subcommand) ───

classify_scenarios = load_practice_exam_module("classify_scenarios.py")


def test_merge_classifications_labels_without_changing_ids():
    """The whole backfill rests on this: labelling 103 committed questions must
    not churn a single id, or every seen-marker and exam-history entry breaks."""
    bank = exam_lib.load_bank()[:3]
    labels = {q["id"]: exam_lib.SCENARIO_TYPES[i % 6] for i, q in enumerate(bank)}
    merged, applied = generate_bank.merge_classifications(bank, labels)
    assert applied == 3
    for before, after in zip(bank, merged):
        assert after["id"] == before["id"]
        assert after["scenarioType"] == labels[before["id"]]
        exam_lib.validate_question(after)


def test_merge_classifications_leaves_unlabelled_questions_alone():
    # Synthetic, not the real bank: every committed question now carries a
    # scenarioType, so the real bank can no longer supply an unlabelled one.
    bank = []
    for marker in ("a", "b", "c"):
        entry = exam_lib.attach_provenance(
            make_candidate_for("D1.2", marker=marker), source="seed-generated"
        )
        entry["provenance"]["reviewed"] = True
        bank.append(entry)
    merged, applied = generate_bank.merge_classifications(
        bank, {bank[0]["id"]: "Structured Data Extraction"}
    )
    assert applied == 1
    assert merged[0]["scenarioType"] == "Structured Data Extraction"
    assert "scenarioType" not in merged[1]
    assert "scenarioType" not in merged[2]


def test_merge_classifications_rejects_an_unknown_label():
    bank = exam_lib.load_bank()[:1]
    with pytest.raises(ValueError):
        generate_bank.merge_classifications(bank, {bank[0]["id"]: "Underwater Basket Weaving"})


def test_unlabelled_skips_what_is_already_labelled_or_proposed():
    bank = [
        {"id": "a", "scenario": "x"},
        {"id": "b", "scenario": "y", "scenarioType": exam_lib.SCENARIO_TYPES[0]},
        {"id": "c", "scenario": "z"},
    ]
    todo = classify_scenarios.unlabelled(bank, {"c": exam_lib.SCENARIO_TYPES[1]})
    assert [q["id"] for q in todo] == ["a"]


def test_classify_one_rejects_a_label_outside_the_six():
    def fake_run(prompt, schema=None, timeout=None):
        return {"structured_output": {"scenarioType": "Space Exploration"}}

    # Against the module's OWN exam_lib: load_practice_exam_module execs a fresh
    # copy per call and never registers it in sys.modules, so a module that does
    # `import exam_lib` gets a second one whose exception classes are distinct
    # objects. Only a harness artifact — production imports exam_lib once.
    with pytest.raises(classify_scenarios.exam_lib.GenerationError):
        classify_scenarios.classify_one({"scenario": "..."}, run=fake_run)


def test_classify_one_returns_a_known_label():
    def fake_run(prompt, schema=None, timeout=None):
        assert "Structured Data Extraction" in prompt  # the six are offered
        return {"structured_output": {"scenarioType": "Structured Data Extraction"}}

    got = classify_scenarios.classify_one({"scenario": "..."}, run=fake_run)
    assert got == "Structured Data Extraction"


def test_scenario_domain_matrix_is_the_viability_metric():
    """A per-scenario histogram is the wrong number: a scenario holding 15+
    questions is useless if they are all the wrong domain for the quota."""
    bank = [
        {"id": "1", "domain": "D1", "scenarioType": exam_lib.SCENARIO_TYPES[0]},
        {"id": "2", "domain": "D1", "scenarioType": exam_lib.SCENARIO_TYPES[0]},
        {"id": "3", "domain": "D3", "scenarioType": exam_lib.SCENARIO_TYPES[1]},
        {"id": "4", "domain": "D3"},  # unlabelled, must not be counted
    ]
    matrix = classify_scenarios.scenario_domain_matrix(bank)
    assert matrix[exam_lib.SCENARIO_TYPES[0]]["D1"] == 2
    assert matrix[exam_lib.SCENARIO_TYPES[1]]["D3"] == 1
    assert sum(sum(row.values()) for row in matrix.values()) == 3


# ── Statement-sharded concurrency ──────────────────────────────────────────
# The avoid-list is what stops a batch reskinning one template, and it is
# filtered per task statement. So concurrency is safe ACROSS statements and
# unsafe WITHIN one: two workers on the same statement both start from the
# same near-empty list and converge. Serialize within, parallelize across.


def test_statement_queues_group_work_without_losing_any():
    work = [("D1.1", "s1", "named"), ("D2.2", "s2", "functional"), ("D1.1", "s3", "named")]
    queues = generate_bank.statement_work_queues(work)
    assert set(queues) == {"D1.1", "D2.2"}
    assert len(queues["D1.1"]) == 2
    assert sum(len(v) for v in queues.values()) == len(work)


def test_each_question_for_a_statement_sees_its_predecessors(tmp_path, monkeypatch):
    """The Nth question for a statement must see bank_count + (N-1) avoid
    summaries: everything already banked for it, plus everything this run has
    produced for it so far. A bare N-1 would mean the bank half is missing."""
    monkeypatch.setattr(generate_bank, "PENDING_PATH", tmp_path / "pending.json")
    monkeypatch.setattr(generate_bank, "FAILURES_PATH", tmp_path / "failed.json")

    bank = exam_lib.load_bank()
    banked = {ts: sum(1 for q in bank if q["taskStatement"] == ts) for ts in ("D1.1", "D2.2")}
    seen = []
    counter = {"n": 0}

    def fake_generate_question(ts, avoid=None, scenario_type=None,
                               difficulty="standard", register="named", scenario=None, length_posture=None):
        seen.append((ts, len(avoid or [])))
        counter["n"] += 1
        candidate = make_candidate_for(ts, marker=f"m{counter['n']}")
        candidate["register"] = register
        return candidate

    monkeypatch.setattr(exam_lib, "generate_question", fake_generate_question)
    monkeypatch.setattr(generate_bank.exam_lib, "generate_question", fake_generate_question)
    generate_bank.generate(per_task=3, tasks=["D1.1", "D2.2"], workers=2)

    for ts in ("D1.1", "D2.2"):
        counts = [n for statement, n in seen if statement == ts]
        assert counts == [banked[ts] + k for k in range(3)], (
            f"{ts}: avoid list did not grow one per predecessor: {counts}"
        )


def test_a_rate_limit_stops_the_whole_run(tmp_path, monkeypatch):
    """The cap is account-wide, so grinding through the rest of the batch just
    collects identical errors."""
    monkeypatch.setattr(generate_bank, "PENDING_PATH", tmp_path / "pending.json")
    monkeypatch.setattr(generate_bank, "FAILURES_PATH", tmp_path / "failed.json")
    calls = {"n": 0}

    def rate_limited(ts, **kwargs):
        calls["n"] += 1
        # generate_bank catches ITS OWN exam_lib's class; see the note on
        # test_classify_one_rejects_a_label_outside_the_six.
        raise generate_bank.exam_lib.RateLimitedError("usage window exhausted")

    monkeypatch.setattr(generate_bank.exam_lib, "generate_question", rate_limited)
    generate_bank.generate(per_task=5, tasks=["D1.1", "D2.2", "D3.3"], workers=3)
    # Far fewer than the 15 the batch wanted: the breaker cut it short.
    assert calls["n"] < 15
    failures = json.loads((tmp_path / "failed.json").read_text())
    assert any(f["reason"] in ("rate-limited", "deferred: usage limit") for f in failures)


# ── Automated judgment screen (screen_semantic.py) ─────────────────────────

screen_semantic = load_practice_exam_module("screen_semantic.py")


def test_screen_prompt_asks_a_functional_question_what_it_resolves_to():
    """This is the abstraction-vs-fabrication guardrail: a functional
    description that resolves to nothing specific is either invented or too
    vague to have one defensible answer."""
    question = dict(make_candidate_for("D1.1"), register="functional")
    prompt = screen_semantic.build_screen_prompt(question, "SCREENING RULES")
    assert "SCREENING RULES" in prompt
    assert "FUNCTIONAL register" in prompt
    assert "UNRESOLVED" in prompt
    assert "Do not resolve the ambiguity charitably" in prompt


def test_screen_prompt_does_not_demand_resolution_for_named_questions():
    question = dict(make_candidate_for("D1.1"), register="named")
    prompt = screen_semantic.build_screen_prompt(question, "SCREENING RULES")
    assert "NAMED register" in prompt
    assert "Do not resolve the ambiguity charitably" not in prompt


def test_screen_one_returns_a_structured_verdict():
    def fake_run(prompt, schema=None, timeout=None):
        return {"structured_output": {
            "verdict": "concern",
            "concerns": ["distractor B is equally defensible"],
            "resolvesTo": "PostToolUse hook",
        }}

    question = dict(make_candidate_for("D1.1"), id="q1", register="functional")
    got = screen_semantic.screen_one(question, "rules", run=fake_run)
    assert got["verdict"] == "concern"
    assert got["resolvesTo"] == "PostToolUse hook"
    assert got["id"] == "q1"


def test_screen_one_rejects_a_missing_verdict():
    def fake_run(prompt, schema=None, timeout=None):
        return {"structured_output": {"concerns": [], "resolvesTo": "x"}}

    with pytest.raises(screen_semantic.exam_lib.GenerationError):
        screen_semantic.screen_one(make_candidate_for("D1.1"), "rules", run=fake_run)


def test_summary_singles_out_unresolved_functional_questions():
    verdicts = [
        {"id": "a", "register": "functional", "verdict": "pass", "resolvesTo": "a hook"},
        {"id": "b", "register": "functional", "verdict": "concern", "resolvesTo": "UNRESOLVED"},
        {"id": "c", "register": "functional", "verdict": "pass", "resolvesTo": ""},
        {"id": "d", "register": "named", "verdict": "pass", "resolvesTo": "n/a"},
    ]
    stats = screen_semantic.summarize(verdicts)
    assert stats["total"] == 4
    assert stats["functional"] == 3
    # Both the explicit UNRESOLVED and the blank one count — a reviewer that
    # said nothing has not identified a mechanism either.
    assert stats["unresolved"] == 2
    assert sorted(stats["unresolvedIds"]) == ["b", "c"]


def test_a_failed_reviewer_is_recorded_as_a_concern_not_a_pass(tmp_path, monkeypatch):
    """A reviewer that fell over must not read as screened-and-clean."""
    pending = [dict(make_candidate_for("D1.1"), id="q1", register="functional")]
    monkeypatch.setattr(screen_semantic, "PENDING_PATH", tmp_path / "pending.json")
    monkeypatch.setattr(screen_semantic, "VERDICTS_PATH", tmp_path / "verdicts.json")
    (tmp_path / "pending.json").write_text(json.dumps(pending))

    def boom(question, screening_prompt, run=None):
        raise RuntimeError("CLI unavailable")

    monkeypatch.setattr(screen_semantic, "screen_one", boom)
    screen_semantic.screen(workers=1)
    verdicts = json.loads((tmp_path / "verdicts.json").read_text())
    assert verdicts[0]["verdict"] == "concern"
    assert "screening failed" in verdicts[0]["concerns"][0]


def test_scenario_override_pins_every_question_in_a_run():
    """Topping up a thin scenario needs targeting. The default rotation spreads
    scenario types across a statement's questions, which is right for diversity
    and useless when a specific (scenario, domain) cell has to be filled."""
    work = generate_bank.build_work_list(
        {"D1.1": 2, "D2.1": 1}, existing={}, scenario="Multi-Agent Research System"
    )
    assert len(work) == 3
    assert {item[1] for item in work} == {"Multi-Agent Research System"}


def test_the_default_still_rotates_scenario_types():
    work = generate_bank.build_work_list({"D1.1": 3}, existing={}, scenario=None)
    assert len({item[1] for item in work}) == 3, "a statement's questions must vary"


def test_scenario_override_rejects_an_unknown_scenario():
    with pytest.raises(ValueError):
        generate_bank.build_work_list({"D1.1": 1}, existing={}, scenario="Space Opera")
