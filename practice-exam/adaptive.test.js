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
  assert.deepEqual(state.stats.perTask["D2.1"], { seen: 1, correct: 1 });
  assert.deepEqual(state.history, [{ t: "D2.1", q: "q9", c: true, at: 1234 }]);
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

test("applyFlag fully discards the last answer", () => {
  const state = freshState({ "D4.3": 3.0 });
  const prevWeight = state.weights["D4.3"];
  A.applyAnswer(state, { taskStatement: "D4.3", questionId: "q1", correct: false, at: 1000 });
  A.applyFlag(state, { taskStatement: "D4.3", questionId: "q1", correct: false, at: 1000, prevWeight });
  assert.equal(state.weights["D4.3"], 3.0);
  assert.equal(state.stats.totalAnswered, 0);
  assert.equal(state.stats.totalCorrect, 0);
  assert.deepEqual(state.stats.perTask["D4.3"], { seen: 0, correct: 0 });
  assert.deepEqual(state.history, []);
  assert.equal(state.seen["q1"], undefined);
  assert.deepEqual(state.flagged, ["q1"]);
  assert.equal(state.stats.totalFlagged, 1);
});
