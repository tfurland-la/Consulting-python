// Tests for adaptive.js — run with `node --test practice-exam/adaptive.test.js`.
// Uses only node built-ins (node:test, node:assert); no npm dependencies.
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const A = require("./adaptive.js");

// Deterministic RNG stub: returns the given values in order.
function rngOf(...values) {
  let i = 0;
  return () => values[i++ % values.length];
}

function freshState(seed) {
  return A.initialState(seed || {});
}

test("TASK_STATEMENTS covers all 30 statements across 5 domains", () => {
  const ids = Object.keys(A.TASK_STATEMENTS);
  assert.equal(ids.length, 30);
  const domains = new Set(ids.map((id) => id.split(".")[0]));
  assert.deepEqual([...domains].sort(), ["D1", "D2", "D3", "D4", "D5"]);
});

test("makeSeedWeights defaults to 1.0 and honors seed overrides", () => {
  const weights = A.makeSeedWeights({ "D4.3": 3.0, "D2.3": 2.0 });
  assert.equal(Object.keys(weights).length, 30);
  assert.equal(weights["D4.3"], 3.0);
  assert.equal(weights["D2.3"], 2.0);
  assert.equal(weights["D3.5"], 1.0);
});

test("initialState starts empty with seeded weights", () => {
  const state = freshState({ "D1.1": 3.0 });
  assert.equal(state.version, 1);
  assert.equal(state.weights["D1.1"], 3.0);
  assert.equal(state.stats.totalAnswered, 0);
  assert.equal(state.stats.totalFlagged, 0);
  assert.deepEqual(state.history, []);
  assert.deepEqual(state.flagged, []);
});

test("correct answer multiplies weight by 0.7 with floor 0.5", () => {
  const state = freshState();
  A.applyAnswer(state, { taskStatement: "D1.1", questionId: "q1", correct: true, at: 1000 });
  assert.equal(state.weights["D1.1"], 0.7);
  state.weights["D1.1"] = 0.55;
  A.applyAnswer(state, { taskStatement: "D1.1", questionId: "q2", correct: true, at: 2000 });
  assert.equal(state.weights["D1.1"], 0.5); // floored
});

test("incorrect answer multiplies weight by 1.5 with cap 5.0", () => {
  const state = freshState({ "D4.3": 3.0 });
  A.applyAnswer(state, { taskStatement: "D4.3", questionId: "q1", correct: false, at: 1000 });
  assert.equal(state.weights["D4.3"], 4.5);
  A.applyAnswer(state, { taskStatement: "D4.3", questionId: "q2", correct: false, at: 2000 });
  assert.equal(state.weights["D4.3"], 5.0); // capped
});

test("applyAnswer updates stats, history, and seen", () => {
  const state = freshState();
  A.applyAnswer(state, { taskStatement: "D2.1", questionId: "q9", correct: true, at: 1234 });
  assert.equal(state.stats.totalAnswered, 1);
  assert.equal(state.stats.totalCorrect, 1);
  assert.equal(state.stats.perTask["D2.1"].seen, 1);
  assert.equal(state.stats.perTask["D2.1"].correct, 1);
  assert.deepEqual(state.history, [{ t: "D2.1", q: "q9", c: true, at: 1234, d: "standard" }]);
  assert.equal(state.seen["q9"], 1234);
});

test("history is trimmed to the last 50 entries", () => {
  const state = freshState();
  for (let i = 0; i < 55; i++) {
    A.applyAnswer(state, { taskStatement: "D1.1", questionId: `q${i}`, correct: true, at: i });
  }
  assert.equal(state.history.length, 50);
  assert.equal(state.history[0].q, "q5");
});

test("effectiveWeights applies domain factors", () => {
  const state = freshState();
  const eff = A.effectiveWeights(state, {});
  assert.equal(eff["D1.1"], 1.8); // 1.0 x D1 factor
  assert.equal(eff["D5.1"], 1.0); // 1.0 x D5 factor
});

test("effectiveWeights zeroes the last 5 task statements from history (cooldown)", () => {
  const state = freshState();
  ["D1.1", "D1.2", "D1.3", "D1.4", "D1.5"].forEach((ts, i) => {
    A.applyAnswer(state, { taskStatement: ts, questionId: `q${i}`, correct: true, at: i });
  });
  const eff = A.effectiveWeights(state, {});
  for (const ts of ["D1.1", "D1.2", "D1.3", "D1.4", "D1.5"]) {
    assert.equal(eff[ts], 0);
  }
  assert.ok(eff["D1.6"] > 0);
});

test("effectiveWeights restricts to available statements when availability given", () => {
  const state = freshState();
  const availability = { "D1.1": 2, "D5.2": 1 }; // everything else unavailable
  const eff = A.effectiveWeights(state, { availability });
  assert.ok(eff["D1.1"] > 0);
  assert.ok(eff["D5.2"] > 0);
  assert.equal(eff["D3.1"], 0);
});

test("drawTaskStatement picks by weighted random draw", () => {
  const state = freshState();
  // Force everything to 0 except two statements with known weights.
  for (const ts of Object.keys(state.weights)) state.weights[ts] = 0;
  state.weights["D1.1"] = 1.0; // effective 1.8
  state.weights["D5.6"] = 1.0; // effective 1.0
  // Total effective = 2.8; rng below 1.8/2.8 lands on D1.1 (iteration order).
  assert.equal(A.drawTaskStatement(state, { rng: rngOf(0.1) }), "D1.1");
  assert.equal(A.drawTaskStatement(state, { rng: rngOf(0.99) }), "D5.6");
});

test("drawTaskStatement ignores cooldown when it would exclude everything", () => {
  const state = freshState();
  const availability = { "D2.2": 1 };
  A.applyAnswer(state, { taskStatement: "D2.2", questionId: "q1", correct: true, at: 1 });
  // D2.2 is both the only available statement and in cooldown.
  assert.equal(A.drawTaskStatement(state, { rng: rngOf(0.5), availability }), "D2.2");
});

test("drawTaskStatement returns null when nothing is available at all", () => {
  const state = freshState();
  assert.equal(A.drawTaskStatement(state, { rng: rngOf(0.5), availability: {} }), null);
});

test("availabilityFromBank counts unflagged questions per statement", () => {
  const bank = [
    { id: "a", taskStatement: "D1.1" },
    { id: "b", taskStatement: "D1.1" },
    { id: "c", taskStatement: "D2.5" },
  ];
  const counts = A.availabilityFromBank(bank, ["b"]);
  assert.equal(counts["D1.1"], 1);
  assert.equal(counts["D2.5"], 1);
  assert.equal(counts["D3.1"] || 0, 0);
});

test("pickBankQuestion prefers unseen questions and skips flagged ones", () => {
  const bank = [
    { id: "a", taskStatement: "D1.1" },
    { id: "b", taskStatement: "D1.1" },
    { id: "c", taskStatement: "D1.1" },
  ];
  const state = freshState();
  state.seen["a"] = 100;
  state.flagged.push("c");
  const picked = A.pickBankQuestion(bank, "D1.1", state, { rng: rngOf(0) });
  assert.equal(picked.id, "b"); // only unseen, unflagged candidate
});

test("pickBankQuestion falls back to least-recently-seen when all are seen", () => {
  const bank = [
    { id: "a", taskStatement: "D1.1" },
    { id: "b", taskStatement: "D1.1" },
  ];
  const state = freshState();
  state.seen["a"] = 100;
  state.seen["b"] = 50;
  const picked = A.pickBankQuestion(bank, "D1.1", state, { rng: rngOf(0) });
  assert.equal(picked.id, "b");
});

// ── Timed exam mode ─────────────────────────────────────────────────────

function syntheticBank() {
  // 3 questions per statement, ids ts-0..2, correct always "B"
  const bank = [];
  for (const ts of Object.keys(A.TASK_STATEMENTS)) {
    for (let i = 0; i < 3; i++) {
      bank.push({ id: `${ts}-${i}`, taskStatement: ts, domain: ts.split(".")[0], correct: "B" });
    }
  }
  return bank;
}

test("EXAM_FORM_QUOTAS mirror the exam's domain weighting over 60 questions", () => {
  assert.deepEqual(A.EXAM_FORM_QUOTAS, { D1: 16, D2: 11, D3: 12, D4: 12, D5: 9 });
  const total = Object.values(A.EXAM_FORM_QUOTAS).reduce((s, n) => s + n, 0);
  assert.equal(total, 60);
});

test("examDifficultyPlan yields the 36/15/9 standard/harder/hard-tail spread", () => {
  const plan = A.examDifficultyPlan(rngOf(0.5));
  assert.equal(plan.length, 60);
  const n = (label) => plan.filter((d) => d === label).length;
  assert.equal(n("standard"), 36);
  assert.equal(n("harder"), 15);
  assert.equal(n("hard"), 9);
});

test("examDifficultyPlan spreads the 9 hard-tail across the sequence, not clustered", () => {
  // With one hard-tail per even bucket of ~6.67, every 20-question third of
  // the exam should hold roughly 3 — and no third should hold more than 4.
  for (const seed of [0.1, 0.5, 0.9, 0.33]) {
    const plan = A.examDifficultyPlan(rngOf(seed));
    const positions = plan.map((d, i) => (d === "hard" ? i : -1)).filter((i) => i >= 0);
    assert.equal(positions.length, 9);
    const thirds = [0, 0, 0];
    for (const p of positions) thirds[Math.floor(p / 20)] += 1;
    for (const t of thirds) assert.ok(t >= 1 && t <= 4, `third had ${t} hard-tail (seed ${seed})`);
    // no two hard-tail adjacent
    for (let i = 1; i < positions.length; i++) {
      assert.ok(positions[i] - positions[i - 1] >= 2, `adjacent hard-tail at ${positions[i]}`);
    }
  }
});

test("sampleN picks n distinct items, all from the source", () => {
  const six = ["a", "b", "c", "d", "e", "f"];
  const four = A.sampleN(six, 4, rngOf(0.2, 0.7, 0.4, 0.9));
  assert.equal(four.length, 4);
  assert.equal(new Set(four).size, 4);
  for (const x of four) assert.ok(six.includes(x));
});

test("sampleN returns all items (shuffled) when n >= length", () => {
  const three = ["a", "b", "c"];
  const out = A.sampleN(three, 5, rngOf(0.5));
  assert.equal(new Set(out).size, 3);
});

test("drawExamForm fills every domain quota from the bank", () => {
  const form = A.drawExamForm(syntheticBank(), freshState(), { rng: rngOf(0.42) });
  assert.equal(form.length, 60);
  const byDomain = {};
  const ids = new Set();
  for (const q of form) {
    byDomain[q.domain] = (byDomain[q.domain] || 0) + 1;
    ids.add(q.id);
  }
  assert.deepEqual(byDomain, A.EXAM_FORM_QUOTAS);
  assert.equal(ids.size, 60); // no repeats within a form
});

test("drawExamForm spreads questions across task statements", () => {
  const form = A.drawExamForm(syntheticBank(), freshState(), { rng: rngOf(0.1) });
  const perStatement = {};
  for (const q of form) {
    perStatement[q.taskStatement] = (perStatement[q.taskStatement] || 0) + 1;
  }
  // 16 D1 questions over 7 statements: round-robin keeps every statement <= 3
  for (const [ts, n] of Object.entries(perStatement)) {
    assert.ok(n <= 3, `${ts} over-represented: ${n}`);
  }
});

test("drawExamForm excludes flagged questions and prefers unseen", () => {
  const bank = syntheticBank();
  const state = freshState();
  state.flagged.push("D1.1-0");
  state.seen["D1.1-1"] = 5;
  const form = A.drawExamForm(bank, state, { rng: rngOf(0.3) });
  const ids = form.map((q) => q.id);
  assert.ok(!ids.includes("D1.1-0"), "flagged question drawn");
  // D1 quota 16 < 20 unseen unflagged D1 questions, so the seen one is not needed
  assert.ok(!ids.includes("D1.1-1"), "seen question drawn while unseen available");
});

test("drawExamForm returns null when the bank cannot fill a quota", () => {
  const tiny = syntheticBank().filter((q) => q.domain !== "D5");
  assert.equal(A.drawExamForm(tiny, freshState(), { rng: rngOf(0.5) }), null);
});

test("drawExamStatements fills domain quotas with statements spread evenly", () => {
  const statements = A.drawExamStatements({ rng: rngOf(0.37) });
  assert.equal(statements.length, 60);
  const byDomain = {};
  const byStatement = {};
  for (const ts of statements) {
    byDomain[ts.split(".")[0]] = (byDomain[ts.split(".")[0]] || 0) + 1;
    byStatement[ts] = (byStatement[ts] || 0) + 1;
  }
  assert.deepEqual(byDomain, A.EXAM_FORM_QUOTAS);
  // 16 D1 slots over 7 statements: round-robin keeps every statement <= 3,
  // and every statement of every domain appears at least once.
  for (const ts of Object.keys(A.TASK_STATEMENTS)) {
    assert.ok(byStatement[ts] >= 1, `${ts} missing from the form`);
    assert.ok(byStatement[ts] <= 3, `${ts} over-represented: ${byStatement[ts]}`);
  }
});

test("applyExamResults does not mark ephemeral (generated) questions as seen", () => {
  const state = freshState();
  const form = [
    { id: "gen-0", ephemeral: true, taskStatement: "D1.1", domain: "D1", correct: "B" },
    { id: "D1.2-real", taskStatement: "D1.2", domain: "D1", correct: "B" },
  ];
  A.applyExamResults(state, form, { "gen-0": "B", "D1.2-real": "B" }, 777);
  assert.equal(state.seen["gen-0"], undefined);
  assert.equal(state.seen["D1.2-real"], 777);
  assert.equal(state.stats.totalCorrect, 2); // scoring still counts both
});

test("scoreExam computes totals, domain breakdown, and approximate scaled score", () => {
  const form = A.drawExamForm(syntheticBank(), freshState(), { rng: rngOf(0.7) });
  const answers = {};
  form.forEach((q, i) => {
    answers[q.id] = i < 45 ? "B" : "A"; // 45 right, 15 wrong
  });
  const score = A.scoreExam(form, answers);
  assert.equal(score.total, 60);
  assert.equal(score.correct, 45);
  assert.equal(score.scaled, Math.round(100 + (900 * 45) / 60)); // 775
  assert.equal(score.passed, true);
  const domainTotal = Object.values(score.byDomain).reduce((s, d) => s + d.total, 0);
  assert.equal(domainTotal, 60);
});

test("scoreExam counts unanswered questions as wrong", () => {
  const form = A.drawExamForm(syntheticBank(), freshState(), { rng: rngOf(0.2) });
  const score = A.scoreExam(form, {}); // nothing answered
  assert.equal(score.correct, 0);
  assert.equal(score.scaled, 100);
  assert.equal(score.passed, false);
});

test("applyExamResults updates weights, stats, seen, examHistory — but not history", () => {
  const bank = syntheticBank();
  const state = freshState();
  A.applyAnswer(state, { taskStatement: "D1.1", questionId: "drill-q", correct: true, at: 1 });
  const drillHistoryLen = state.history.length;
  const form = A.drawExamForm(bank, state, { rng: rngOf(0.6) });
  const answers = {};
  form.forEach((q) => { answers[q.id] = "B"; }); // all correct
  A.applyExamResults(state, form, answers, 9999);
  assert.equal(state.stats.totalAnswered, 1 + 60);
  assert.equal(state.stats.totalCorrect, 1 + 60);
  assert.equal(state.history.length, drillHistoryLen); // cooldown history untouched
  assert.equal(state.examHistory.length, 1);
  assert.equal(state.examHistory[0].correct, 60);
  assert.equal(state.examHistory[0].at, 9999);
  assert.equal(state.seen[form[0].id], 9999);
  // a correct exam answer moves the weight down like a drill answer
  const ts = form[0].taskStatement;
  assert.ok(state.weights[ts] < A.makeSeedWeights({})[ts] || state.weights[ts] === A.WEIGHT_FLOOR);
});

test("initialState includes an empty examHistory", () => {
  assert.deepEqual(freshState().examHistory, []);
});

test("discountedScore rescores with flagged questions removed entirely", () => {
  const form = A.drawExamForm(syntheticBank(), freshState(), { rng: rngOf(0.5) });
  const answers = {};
  form.forEach((q, i) => {
    answers[q.id] = i < 45 ? "B" : "A"; // 45 right, 15 wrong
  });
  // Discount one the user got right and one they got wrong.
  const excluded = [form[0].id, form[59].id];
  const score = A.discountedScore(form, answers, excluded);
  assert.equal(score.total, 58);
  assert.equal(score.correct, 44);
  assert.equal(score.scaled, Math.round(100 + (900 * 44) / 58));
  const domainTotal = Object.values(score.byDomain).reduce((s, d) => s + d.total, 0);
  assert.equal(domainTotal, 58);
});

test("discountedScore with nothing excluded matches scoreExam", () => {
  const form = A.drawExamForm(syntheticBank(), freshState(), { rng: rngOf(0.9) });
  const answers = {};
  form.forEach((q) => { answers[q.id] = "B"; });
  assert.deepEqual(A.discountedScore(form, answers, []), A.scoreExam(form, answers));
});

// ── Per-question timing (diagnostic only — never affects scoring) ────────

test("summarizeExamTiming totals and means over answered questions", () => {
  const form = A.drawExamForm(syntheticBank(), freshState(), { rng: rngOf(0.5) });
  const answers = {};
  const elapsed = {};
  form.forEach((q, i) => {
    answers[q.id] = i < 40 ? "B" : "A"; // 40 correct, 20 incorrect
    elapsed[q.id] = i < 40 ? 60000 : 30000; // correct slower than incorrect
  });
  const t = A.summarizeExamTiming(form, answers, elapsed, []);
  assert.equal(t.totalMs, 40 * 60000 + 20 * 30000);
  assert.equal(t.counted, 60);
  assert.equal(t.meanMs, t.totalMs / 60);
  assert.equal(t.meanCorrectMs, 60000);
  assert.equal(t.meanIncorrectMs, 30000);
});

test("summarizeExamTiming counts fast misses under the 45s threshold", () => {
  const form = A.drawExamForm(syntheticBank(), freshState(), { rng: rngOf(0.3) });
  const answers = {};
  const elapsed = {};
  form.forEach((q, i) => {
    answers[q.id] = "A"; // every one wrong (bank fixture's correct is "B")
    elapsed[q.id] = i < 5 ? 20000 : 90000; // 5 rushed, rest deliberate
  });
  const t = A.summarizeExamTiming(form, answers, elapsed, []);
  assert.equal(t.fastIncorrect, 5);
  assert.equal(A.FAST_INCORRECT_MS, 45000);
});

test("summarizeExamTiming excludes discounted questions from every aggregate", () => {
  const form = A.drawExamForm(syntheticBank(), freshState(), { rng: rngOf(0.7) });
  const answers = {};
  const elapsed = {};
  form.forEach((q) => {
    answers[q.id] = "A"; // wrong
    elapsed[q.id] = 10000; // fast miss
  });
  const excluded = [form[0].id, form[1].id];
  const t = A.summarizeExamTiming(form, answers, elapsed, excluded);
  assert.equal(t.counted, 58);
  assert.equal(t.totalMs, 58 * 10000);
  assert.equal(t.fastIncorrect, 58);
});

test("summarizeExamTiming returns null means when a side has no questions", () => {
  const form = A.drawExamForm(syntheticBank(), freshState(), { rng: rngOf(0.5) });
  const answers = {};
  const elapsed = {};
  form.forEach((q) => {
    answers[q.id] = "B"; // all correct — no incorrect side
    elapsed[q.id] = 5000;
  });
  const t = A.summarizeExamTiming(form, answers, elapsed, []);
  assert.equal(t.meanCorrectMs, 5000);
  assert.equal(t.meanIncorrectMs, null); // dash in the UI, never NaN
  assert.equal(t.fastIncorrect, 0);
});

test("summarizeExamTiming tolerates missing and null elapsed entries", () => {
  const form = A.drawExamForm(syntheticBank(), freshState(), { rng: rngOf(0.5) });
  const answers = {};
  form.forEach((q) => { answers[q.id] = "B"; });
  const elapsed = { [form[0].id]: 12000, [form[1].id]: null }; // rest absent
  const t = A.summarizeExamTiming(form, answers, elapsed, []);
  assert.equal(t.counted, 1); // only the timed one participates
  assert.equal(t.totalMs, 12000);
  assert.equal(t.meanMs, 12000);
  assert.equal(t.untimed, 59);
});

test("summarizeExamTiming with no timing data at all yields nulls, not NaN", () => {
  const form = A.drawExamForm(syntheticBank(), freshState(), { rng: rngOf(0.5) });
  const answers = {};
  form.forEach((q) => { answers[q.id] = "B"; });
  const t = A.summarizeExamTiming(form, answers, {}, []);
  assert.equal(t.counted, 0);
  assert.equal(t.totalMs, 0);
  assert.equal(t.meanMs, null);
  assert.equal(t.meanCorrectMs, null);
  assert.equal(t.meanIncorrectMs, null);
});

test("applyExamResults stores the run's total elapsed on the examHistory entry", () => {
  const state = freshState();
  const form = A.drawExamForm(syntheticBank(), state, { rng: rngOf(0.5) });
  const answers = {};
  form.forEach((q) => { answers[q.id] = "B"; });
  A.applyExamResults(state, form, answers, 4242, 123456);
  assert.equal(state.examHistory[0].elapsedMs, 123456);
});

test("applyExamResults leaves elapsedMs null when timing is unavailable", () => {
  const state = freshState();
  const form = A.drawExamForm(syntheticBank(), state, { rng: rngOf(0.5) });
  const answers = {};
  form.forEach((q) => { answers[q.id] = "B"; });
  A.applyExamResults(state, form, answers, 4242); // pre-timing call shape
  assert.equal(state.examHistory[0].elapsedMs, null);
  assert.equal(state.examHistory[0].scaled, A.scoreExam(form, answers).scaled);
});

test("applyFlag fully discards the last answer", () => {
  const state = freshState({ "D4.3": 3.0 });
  const prevWeight = state.weights["D4.3"];
  A.applyAnswer(state, { taskStatement: "D4.3", questionId: "q1", correct: false, at: 1000 });
  A.applyFlag(state, { taskStatement: "D4.3", questionId: "q1", correct: false, at: 1000, prevWeight });
  assert.equal(state.weights["D4.3"], 3.0);
  assert.equal(state.stats.totalAnswered, 0);
  assert.equal(state.stats.totalCorrect, 0);
  assert.equal(state.stats.perTask["D4.3"].seen, 0);
  assert.equal(state.stats.perTask["D4.3"].correct, 0);
  assert.deepEqual(state.history, []);
  assert.equal(state.seen["q1"], undefined);
  assert.deepEqual(state.flagged, ["q1"]);
  assert.equal(state.stats.totalFlagged, 1);
});

// ── Coverage-first draw + difficulty tiering + HARD floor ─────────────────

// Mirrors Tom's imported Claude.ai progress: three seeded-high unseen
// statements, four seeded-high seen-once, three mastered (seen>=3, 100%).
function importedState() {
  const s = A.initialState({});
  const set = (ts, weight, seen, correct) => {
    s.weights[ts] = weight;
    if (seen) s.stats.perTask[ts] = { seen, correct };
  };
  set("D2.2", 3.0, 0, 0);
  set("D4.3", 3.0, 0, 0);
  set("D4.5", 3.0, 0, 0);
  set("D1.2", 2.1, 1, 1);
  set("D3.1", 2.1, 1, 1);
  set("D5.1", 2.1, 1, 1);
  set("D5.2", 2.1, 1, 1);
  set("D1.1", 0.72, 4, 4);
  set("D1.5", 1.03, 3, 3);
  set("D2.4", 1.03, 3, 3);
  return s;
}

test("coverageOwed lists weight>=2.0 statements not yet seen twice", () => {
  const owed = new Set(A.coverageOwed(importedState()));
  assert.deepEqual(
    [...owed].sort(),
    ["D1.2", "D2.2", "D3.1", "D4.3", "D4.5", "D5.1", "D5.2"].sort()
  );
  // D1.1/D1.5/D2.4 are weight<2 -> never owed regardless of seen.
  assert.ok(!owed.has("D1.1"));
});

test("inCoveragePhase is true until every weight>=2 statement reaches seen>=2", () => {
  const s = importedState();
  assert.equal(A.inCoveragePhase(s), true);
  // Force every owed statement to seen>=2.
  for (const ts of A.coverageOwed(s)) s.stats.perTask[ts] = { seen: 2, correct: 2 };
  assert.equal(A.inCoveragePhase(s), false);
});

test("ACCEPTANCE: first coverage draw from the imported state is D4.3", () => {
  // Least-seen first (the three seen==0), tie broken by effective weight
  // desc (D4.3 & D4.5 both 3.99), then task-statement id asc -> D4.3.
  assert.equal(A.drawTaskStatement(importedState(), { rng: rngOf(0.5) }), "D4.3");
});

test("coverage draw guarantees the three unseen statements before the seen-once ones", () => {
  const s = importedState();
  const order = [];
  for (let i = 0; i < 3; i++) {
    const ts = A.drawTaskStatement(s, { rng: rngOf(0.5) });
    order.push(ts);
    A.applyAnswer(s, { taskStatement: ts, questionId: null, correct: true, at: i, difficulty: "standard" });
  }
  assert.deepEqual(order.sort(), ["D2.2", "D4.3", "D4.5"]); // all three unseen, first
});

test("coverage draw does not place the same statement consecutively", () => {
  const s = importedState();
  let prev = null;
  for (let i = 0; i < 10; i++) {
    const ts = A.drawTaskStatement(s, { rng: rngOf(0.3) });
    assert.notEqual(ts, prev, `statement ${ts} repeated at draw ${i}`);
    A.applyAnswer(s, { taskStatement: ts, questionId: null, correct: true, at: i, difficulty: "standard" });
    prev = ts;
  }
});

test("selection reverts to weighted-random once coverage is satisfied", () => {
  const s = A.initialState({});
  // No weight>=2 statement -> not in coverage -> pure weighted random.
  for (const ts of Object.keys(s.weights)) s.weights[ts] = 0;
  s.weights["D1.1"] = 1.0; // eff 1.8
  s.weights["D5.6"] = 1.0; // eff 1.0
  assert.equal(A.inCoveragePhase(s), false);
  assert.equal(A.drawTaskStatement(s, { rng: rngOf(0.1) }), "D1.1");
});

test("drawTaskStatement excludes the on-screen statement so prefetch can't repeat it", () => {
  // Render-time prefetch draws before the current question is graded; without
  // excluding it, coverage-first would re-pick the same unseen statement.
  const s = importedState();
  const first = A.drawTaskStatement(s, {}); // D4.3
  assert.equal(first, "D4.3");
  const next = A.drawTaskStatement(s, { exclude: "D4.3" });
  assert.notEqual(next, "D4.3"); // a different owed statement
  assert.ok(A.coverageOwed(s).includes(next));
});

test("drawTaskStatement ignores exclude when it would empty the pool", () => {
  const s = importedState();
  // Collapse coverage to a single owed statement, then exclude it.
  for (const ts of A.coverageOwed(s)) {
    if (ts !== "D4.3") s.stats.perTask[ts] = { seen: 2, correct: 2 };
  }
  assert.deepEqual(A.coverageOwed(s), ["D4.3"]);
  assert.equal(A.drawTaskStatement(s, { exclude: "D4.3" }), "D4.3"); // best-effort
});

test("difficultyFor: unseen is standard, mastered (seen>=3 & 100%) is hard", () => {
  const s = importedState();
  assert.equal(A.difficultyFor(s, "D4.3"), "standard"); // seen 0
  assert.equal(A.difficultyFor(s, "D1.2"), "standard"); // imported seen1, no in-app tier evidence
  assert.equal(A.difficultyFor(s, "D1.1"), "hard"); // seen4/4
  assert.equal(A.difficultyFor(s, "D1.5"), "hard"); // seen3/3
});

test("difficultyFor escalates to hard after one correct in-app standard answer", () => {
  const s = importedState();
  assert.equal(A.difficultyFor(s, "D4.3"), "standard");
  A.applyAnswer(s, { taskStatement: "D4.3", questionId: null, correct: true, at: 1, difficulty: "standard" });
  assert.equal(A.difficultyFor(s, "D4.3"), "hard"); // second pass after correct standard
});

test("applyAnswer records the difficulty tier and per-tier counters", () => {
  const s = A.initialState({});
  A.applyAnswer(s, { taskStatement: "D4.3", questionId: "q1", correct: true, at: 1, difficulty: "standard" });
  assert.equal(s.history[0].d, "standard");
  assert.equal(s.stats.perTask["D4.3"].stdSeen, 1);
  assert.equal(s.stats.perTask["D4.3"].stdCorrect, 1);
  A.applyAnswer(s, { taskStatement: "D4.3", questionId: "q2", correct: false, at: 2, difficulty: "hard" });
  assert.equal(s.history[1].d, "hard");
  assert.equal(s.stats.perTask["D4.3"].hardSeen, 1);
  assert.equal(s.stats.perTask["D4.3"].hardCorrect, 0);
});

test("applyAnswer defaults difficulty to standard when unspecified", () => {
  const s = A.initialState({});
  A.applyAnswer(s, { taskStatement: "D4.3", questionId: "q1", correct: true, at: 1 });
  assert.equal(s.history[0].d, "standard");
});

test("HARD floor lifts a mastered statement's effective weight to 1.0", () => {
  const s = importedState();
  // D1.1 decayed to eff 0.72*1.8 = 1.296 already >1; use a lower one.
  s.weights["D1.5"] = 0.5; // eff 0.5*1.8 = 0.9 (<1.0), hard-eligible (seen3/3)
  const eff = A.effectiveWeights(s, {});
  assert.ok(eff["D1.5"] >= 1.0, `expected floor, got ${eff["D1.5"]}`);
});

test("HARD floor releases after two hard answers, restoring earned decay", () => {
  const s = importedState();
  s.weights["D1.5"] = 0.5;
  s.stats.perTask["D1.5"] = { seen: 3, correct: 3, hardSeen: 2, hardCorrect: 2 };
  const eff = A.effectiveWeights(s, {});
  assert.ok(Math.abs(eff["D1.5"] - 0.9) < 1e-9, `floor should have released, got ${eff["D1.5"]}`);
});

test("HARD floor never resurrects a coverage-excluded statement", () => {
  const s = importedState();
  s.weights["D1.5"] = 0.5;
  // In coverage phase, only owed statements are available; D1.5 (mastered,
  // weight<2) must stay at 0 despite being hard-eligible.
  const eff = A.effectiveWeights(s, { availability: { "D4.3": 1 } });
  assert.equal(eff["D1.5"], 0);
});

// ── Exam form navigation (A.nav) ──────────────────────────────────────────
// The real exam permits skipping a question and returning to it later, so the
// form must tolerate blanks mid-exam. These cover the sparse-form case too:
// a slot can still be materializing from prep.buffer, in which case form[i] is
// undefined but the question (and its id) already exist in the buffer.

function navForm(n) {
  return Array.from({ length: n }, (_, i) => ({ id: `q${i}` }));
}

test("nav.resolveFormIds reads ids from the form", () => {
  assert.deepEqual(A.nav.resolveFormIds(navForm(3), null), ["q0", "q1", "q2"]);
});

test("nav.resolveFormIds falls back to prep.buffer for unmaterialized slots", () => {
  const form = [{ id: "q0" }, undefined, null];
  const prep = { buffer: [null, { id: "q1" }, { id: "q2" }] };
  assert.deepEqual(A.nav.resolveFormIds(form, prep), ["q0", "q1", "q2"]);
});

test("nav.resolveFormIds yields null for a slot with no question anywhere", () => {
  assert.deepEqual(A.nav.resolveFormIds([undefined], { buffer: [] }), [null]);
});

test("nav.unansweredIndices lists only the blanks, in order", () => {
  const answers = { q0: ["B"], q2: ["A"] };
  assert.deepEqual(A.nav.unansweredIndices(navForm(4), answers, null), [1, 3]);
});

test("nav.unansweredIndices treats an unmaterialized slot as unanswered", () => {
  const form = [{ id: "q0" }, undefined];
  const prep = { buffer: [null, { id: "q1" }] };
  assert.deepEqual(A.nav.unansweredIndices(form, { q0: ["A"] }, prep), [1]);
});

test("nav.markedIndices lists slots flagged for review", () => {
  const marked = { q1: true, q3: true, q0: false };
  assert.deepEqual(A.nav.markedIndices(navForm(4), marked, null), [1, 3]);
});

test("nav.toggleMarked flips a question on and off without mutating input", () => {
  const before = { q1: true };
  const on = A.nav.toggleMarked(before, "q2");
  assert.deepEqual(before, { q1: true }, "input must not be mutated");
  assert.equal(on.q2, true);
  assert.equal(A.nav.toggleMarked(on, "q2").q2, undefined);
});

test("nav.examProgress summarizes answered, unanswered and marked", () => {
  const p = A.nav.examProgress(navForm(5), { q0: ["A"], q4: ["C"] }, { q2: true }, null);
  assert.equal(p.total, 5);
  assert.equal(p.answered, 2);
  assert.deepEqual(p.unanswered, [1, 2, 3]);
  assert.deepEqual(p.marked, [2]);
  assert.equal(p.complete, false);
});

test("nav.examProgress reports complete once nothing is blank", () => {
  const answers = { q0: ["A"], q1: ["B"], q2: ["C"] };
  const p = A.nav.examProgress(navForm(3), answers, {}, null);
  assert.equal(p.complete, true);
  assert.deepEqual(p.unanswered, []);
});

test("nav.needsSubmitConfirmation is true only while blanks remain", () => {
  assert.equal(A.nav.needsSubmitConfirmation(navForm(2), { q0: ["A"] }, null), true);
  assert.equal(A.nav.needsSubmitConfirmation(navForm(2), { q0: ["A"], q1: ["B"] }, null), false);
});

test("nav.nextUnansweredFrom finds the next blank after the cursor", () => {
  const answers = { q0: ["A"], q1: ["B"] };
  assert.equal(A.nav.nextUnansweredFrom(0, navForm(4), answers, null), 2);
});

test("nav.nextUnansweredFrom wraps past the end to an earlier blank", () => {
  // Cursor on the last slot, the only blank is q1 — must wrap, not give up.
  const answers = { q0: ["A"], q2: ["C"], q3: ["D"] };
  assert.equal(A.nav.nextUnansweredFrom(3, navForm(4), answers, null), 1);
});

test("nav.nextUnansweredFrom returns null when the form is complete", () => {
  const answers = { q0: ["A"], q1: ["B"] };
  assert.equal(A.nav.nextUnansweredFrom(0, navForm(2), answers, null), null);
});

test("nav.nextUnansweredFrom skips the cursor's own slot even when blank", () => {
  // Standing on a blank q1, "next unanswered" should move on to q3, not sit still.
  const answers = { q0: ["A"], q2: ["C"] };
  assert.equal(A.nav.nextUnansweredFrom(1, navForm(4), answers, null), 3);
});

test("nav.slotIsResolved: a populated form slot is ready", () => {
  assert.equal(A.nav.slotIsResolved(navForm(2), null, 0), true);
});

test("nav.slotIsResolved: a bank exam with no prep is always ready", () => {
  assert.equal(A.nav.slotIsResolved(navForm(2), undefined, 1), true);
});

test("nav.slotIsResolved: a buffered question counts as ready", () => {
  // renderExamQuestion materializes form[i] from the buffer on arrival.
  const prep = { buffer: [null, { id: "q1" }], failedSlots: new Set() };
  assert.equal(A.nav.slotIsResolved([{ id: "q0" }, undefined], prep, 1), true);
});

test("nav.slotIsResolved: a failed slot counts as ready (bank substitutes it)", () => {
  const prep = { buffer: [null, null], failedSlots: new Set([1]) };
  assert.equal(A.nav.slotIsResolved([{ id: "q0" }, undefined], prep, 1), true);
});

test("nav.slotIsResolved: false while the generator is still working", () => {
  // This is the paused "Generating this question…" state. Advancing off it
  // would race ahead of the generator and quietly draw bank substitutes.
  const prep = { buffer: [null, null], failedSlots: new Set() };
  assert.equal(A.nav.slotIsResolved([{ id: "q0" }, undefined], prep, 1), false);
});

test("nav.nextUnansweredFrom returns the cursor itself when it is the last blank", () => {
  // The cursor's slot is checked last, not never: if it is the only blank left,
  // returning null would wrongly report the form complete.
  const answers = { q0: ["A"], q2: ["C"] };
  assert.equal(A.nav.nextUnansweredFrom(1, navForm(3), answers, null), 1);
});
