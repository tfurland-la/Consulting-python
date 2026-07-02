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
