// Adaptive core for the CCA-F local practice exam. Pure logic, no DOM and no
// I/O, so the same file runs in the browser (window.CCAF_ADAPTIVE) and under
// `node --test` (module.exports). Numbers mirror practice_exam_spec.md:
// correct x0.7 (floor 0.5), incorrect x1.5 (cap 5.0), domain overlay, and a
// cooldown on the last 5 task statements in history.
"use strict";

const TASK_STATEMENTS = {
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
};

const DOMAINS = {
  D1: "Agentic Architecture & Orchestration",
  D2: "Tool Design & MCP Integration",
  D3: "Claude Code Configuration & Workflows",
  D4: "Prompt Engineering & Structured Output",
  D5: "Context Management & Reliability",
};

// Exam weightings (27/18/20/20/15) normalized to the smallest domain.
const DOMAIN_FACTORS = { D1: 1.8, D2: 1.2, D3: 1.33, D4: 1.33, D5: 1.0 };

const CORRECT_MULTIPLIER = 0.7;
const INCORRECT_MULTIPLIER = 1.5;
const WEIGHT_FLOOR = 0.5;
const WEIGHT_CAP = 5.0;
const COOLDOWN_SIZE = 5;
const HISTORY_LIMIT = 50;
const EXAM_HISTORY_LIMIT = 20;

// A 60-question exam form mirroring the real exam's domain weighting
// (27/18/20/20/15% -> 16/11/12/12/9). Matches EXAM_FORM_QUOTAS in exam_lib.py.
const EXAM_FORM_QUOTAS = { D1: 16, D2: 11, D3: 12, D4: 12, D5: 9 };
const EXAM_MINUTES = 120;
const PASSING_SCALED_SCORE = 720;

function makeSeedWeights(seed) {
  const weights = {};
  for (const ts of Object.keys(TASK_STATEMENTS)) {
    weights[ts] = seed && seed[ts] !== undefined ? seed[ts] : 1.0;
  }
  return weights;
}

function initialState(seed) {
  return {
    version: 1,
    weights: makeSeedWeights(seed),
    stats: { totalAnswered: 0, totalCorrect: 0, totalFlagged: 0, perTask: {} },
    history: [],
    seen: {},
    flagged: [],
    examHistory: [],
  };
}

function cooldownSet(state) {
  const recent = state.history.slice(-COOLDOWN_SIZE);
  return new Set(recent.map((entry) => entry.t));
}

// availability (optional): map of taskStatement -> question count; statements
// absent or 0 are excluded from the draw. Omit it in dynamic mode, where any
// statement can be generated.
function effectiveWeights(state, opts) {
  const options = opts || {};
  const cooled = options.ignoreCooldown ? new Set() : cooldownSet(state);
  const eff = {};
  for (const ts of Object.keys(TASK_STATEMENTS)) {
    const available = !options.availability || (options.availability[ts] || 0) > 0;
    eff[ts] =
      available && !cooled.has(ts)
        ? state.weights[ts] * DOMAIN_FACTORS[ts.split(".")[0]]
        : 0;
  }
  return eff;
}

function weightedDraw(eff, rng) {
  const total = Object.values(eff).reduce((sum, w) => sum + w, 0);
  if (total <= 0) return null;
  let cursor = (rng || Math.random)() * total;
  for (const ts of Object.keys(eff)) {
    cursor -= eff[ts];
    if (cursor < 0) return ts;
  }
  return null; // unreachable barring floating-point edge; caller treats as no-draw
}

function drawTaskStatement(state, opts) {
  const options = opts || {};
  let ts = weightedDraw(effectiveWeights(state, options), options.rng);
  if (ts === null) {
    // Cooldown excluded everything that is available; redraw without it.
    ts = weightedDraw(
      effectiveWeights(state, { availability: options.availability, ignoreCooldown: true }),
      options.rng
    );
  }
  return ts;
}

function availabilityFromBank(bank, flagged) {
  const blocked = new Set(flagged || []);
  const counts = {};
  for (const question of bank) {
    if (blocked.has(question.id)) continue;
    counts[question.taskStatement] = (counts[question.taskStatement] || 0) + 1;
  }
  return counts;
}

function pickBankQuestion(bank, taskStatement, state, opts) {
  const options = opts || {};
  const blocked = new Set(state.flagged);
  const candidates = bank.filter(
    (q) => q.taskStatement === taskStatement && !blocked.has(q.id)
  );
  if (candidates.length === 0) return null;
  const unseen = candidates.filter((q) => state.seen[q.id] === undefined);
  if (unseen.length > 0) {
    return unseen[Math.floor((options.rng || Math.random)() * unseen.length)];
  }
  return candidates.reduce((oldest, q) =>
    state.seen[q.id] < state.seen[oldest.id] ? q : oldest
  );
}

function applyAnswer(state, answer) {
  const ts = answer.taskStatement;
  const multiplier = answer.correct ? CORRECT_MULTIPLIER : INCORRECT_MULTIPLIER;
  const updated = state.weights[ts] * multiplier;
  state.weights[ts] = answer.correct
    ? Math.max(WEIGHT_FLOOR, updated)
    : Math.min(WEIGHT_CAP, updated);

  state.stats.totalAnswered += 1;
  if (answer.correct) state.stats.totalCorrect += 1;
  const perTask = state.stats.perTask[ts] || { seen: 0, correct: 0 };
  perTask.seen += 1;
  if (answer.correct) perTask.correct += 1;
  state.stats.perTask[ts] = perTask;

  state.history.push({ t: ts, q: answer.questionId, c: answer.correct, at: answer.at });
  if (state.history.length > HISTORY_LIMIT) {
    state.history.splice(0, state.history.length - HISTORY_LIMIT);
  }
  if (answer.questionId) state.seen[answer.questionId] = answer.at;
  return state;
}

// ── Timed exam mode ──────────────────────────────────────────────────────

function shuffled(items, rng) {
  const draw = rng || Math.random;
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(draw() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Draw a 60-question exam form: domain quotas per EXAM_FORM_QUOTAS,
// round-robin across a domain's task statements (unseen questions first
// within each statement), flagged questions excluded. Returns null if the
// bank cannot fill a quota.
function drawExamForm(bank, state, opts) {
  const options = opts || {};
  const rng = options.rng || Math.random;
  const blocked = new Set(state.flagged);
  const form = [];
  for (const [domain, quota] of Object.entries(EXAM_FORM_QUOTAS)) {
    // Two round-robin phases: every statement's unseen questions first
    // (globally — no repeat is drawn while any unseen remains in the
    // domain), then seen questions as filler.
    const unseenQueues = {};
    const seenQueues = {};
    for (const question of bank) {
      if (question.domain !== domain || blocked.has(question.id)) continue;
      const target = state.seen[question.id] === undefined ? unseenQueues : seenQueues;
      (target[question.taskStatement] = target[question.taskStatement] || []).push(question);
    }
    const statements = new Set([...Object.keys(unseenQueues), ...Object.keys(seenQueues)]);
    const order = shuffled([...statements], rng);
    for (const ts of order) {
      if (unseenQueues[ts]) unseenQueues[ts] = shuffled(unseenQueues[ts], rng);
      if (seenQueues[ts]) seenQueues[ts] = shuffled(seenQueues[ts], rng);
    }
    const picked = [];
    for (const queues of [unseenQueues, seenQueues]) {
      let exhausted = false;
      while (picked.length < quota && !exhausted) {
        exhausted = true;
        for (const ts of order) {
          if (picked.length >= quota) break;
          const next = queues[ts] && queues[ts].shift();
          if (next) {
            picked.push(next);
            exhausted = false;
          }
        }
      }
      if (picked.length >= quota) break;
    }
    if (picked.length < quota) return null; // domain exhausted below quota
    form.push(...picked);
  }
  return shuffled(form, rng);
}

// Draw 60 task statements matching the exam-form quotas — the target list
// for a freshly GENERATED exam form (no bank questions involved). Round-robin
// across each domain's statements so every statement appears 1-3 times.
function drawExamStatements(opts) {
  const rng = (opts || {}).rng || Math.random;
  const statements = [];
  for (const [domain, quota] of Object.entries(EXAM_FORM_QUOTAS)) {
    const order = shuffled(
      Object.keys(TASK_STATEMENTS).filter((ts) => ts.split(".")[0] === domain),
      rng
    );
    for (let k = 0; k < quota; k++) {
      statements.push(order[k % order.length]);
    }
  }
  return shuffled(statements, rng);
}

// answers: map of question id -> chosen letter. Unanswered counts as wrong.
// The scaled score is a linear approximation of the exam's 100-1000 scale;
// the real exam uses equating, so treat this as directional only.
function scoreExam(form, answers) {
  let correct = 0;
  const byDomain = {};
  for (const question of form) {
    const d = (byDomain[question.domain] = byDomain[question.domain] || {
      correct: 0,
      total: 0,
    });
    d.total += 1;
    if (answers[question.id] === question.correct) {
      correct += 1;
      d.correct += 1;
    }
  }
  const scaled = Math.round(100 + (900 * correct) / form.length);
  return {
    correct,
    total: form.length,
    scaled,
    passed: scaled >= PASSING_SCALED_SCORE,
    byDomain,
  };
}

// Rescore an exam with flagged-as-flawed questions removed entirely — scored
// out of the remaining count, exactly as if they had never been on the form.
// Weights already applied by applyExamResults are NOT reverted (a single
// x1.5 on one statement self-corrects through normal drilling).
function discountedScore(form, answers, excludedIds) {
  const excluded = new Set(excludedIds || []);
  return scoreExam(form.filter((q) => !excluded.has(q.id)), answers);
}

// Fold an exam attempt into the adaptive state: weights, stats, and seen
// update exactly like drill answers, and the attempt lands in examHistory.
// Drill `history` is deliberately untouched — it drives the cooldown and
// trend display, and 60 batch entries would wipe it.
function applyExamResults(state, form, answers, at) {
  const score = scoreExam(form, answers);
  for (const question of form) {
    const ts = question.taskStatement;
    const isCorrect = answers[question.id] === question.correct;
    const multiplier = isCorrect ? CORRECT_MULTIPLIER : INCORRECT_MULTIPLIER;
    const updated = state.weights[ts] * multiplier;
    state.weights[ts] = isCorrect
      ? Math.max(WEIGHT_FLOOR, updated)
      : Math.min(WEIGHT_CAP, updated);
    state.stats.totalAnswered += 1;
    if (isCorrect) state.stats.totalCorrect += 1;
    const perTask = state.stats.perTask[ts] || { seen: 0, correct: 0 };
    perTask.seen += 1;
    if (isCorrect) perTask.correct += 1;
    state.stats.perTask[ts] = perTask;
    if (!question.ephemeral) {
      state.seen[question.id] = at; // generated questions leave no seen-mark
    }
  }
  state.examHistory = state.examHistory || [];
  state.examHistory.push({
    at,
    correct: score.correct,
    total: score.total,
    scaled: score.scaled,
  });
  if (state.examHistory.length > EXAM_HISTORY_LIMIT) {
    state.examHistory.splice(0, state.examHistory.length - EXAM_HISTORY_LIMIT);
  }
  return score;
}

// Full discard of the most recent answer (spec: "flag as flawed"). The caller
// keeps {taskStatement, questionId, correct, at, prevWeight} for the question
// on screen; the control is only offered before advancing.
function applyFlag(state, lastAnswer) {
  const ts = lastAnswer.taskStatement;
  state.weights[ts] = lastAnswer.prevWeight;

  state.stats.totalAnswered -= 1;
  if (lastAnswer.correct) state.stats.totalCorrect -= 1;
  const perTask = state.stats.perTask[ts];
  if (perTask) {
    perTask.seen -= 1;
    if (lastAnswer.correct) perTask.correct -= 1;
  }

  const last = state.history[state.history.length - 1];
  if (last && last.q === lastAnswer.questionId && last.at === lastAnswer.at) {
    state.history.pop();
  }
  if (lastAnswer.questionId) {
    delete state.seen[lastAnswer.questionId];
    state.flagged.push(lastAnswer.questionId);
  }
  state.stats.totalFlagged += 1;
  return state;
}

const CCAF_ADAPTIVE = {
  TASK_STATEMENTS,
  DOMAINS,
  DOMAIN_FACTORS,
  CORRECT_MULTIPLIER,
  INCORRECT_MULTIPLIER,
  WEIGHT_FLOOR,
  WEIGHT_CAP,
  COOLDOWN_SIZE,
  HISTORY_LIMIT,
  EXAM_FORM_QUOTAS,
  EXAM_MINUTES,
  PASSING_SCALED_SCORE,
  makeSeedWeights,
  initialState,
  effectiveWeights,
  drawTaskStatement,
  availabilityFromBank,
  pickBankQuestion,
  applyAnswer,
  applyFlag,
  drawExamForm,
  drawExamStatements,
  scoreExam,
  discountedScore,
  applyExamResults,
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = CCAF_ADAPTIVE;
}
if (typeof window !== "undefined") {
  window.CCAF_ADAPTIVE = CCAF_ADAPTIVE;
}
