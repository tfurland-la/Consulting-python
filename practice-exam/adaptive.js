// Adaptive core for the CCAR-F local practice exam. Pure logic, no DOM and no
// I/O, so the same file runs in the browser (window.CCARF_ADAPTIVE) and under
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

// ── Coverage-first + difficulty tiering ───────────────────────────────────
// A statement seeded/weighted high but barely tested is a blind spot the pure
// weighted-random draw can starve for many questions. Coverage-first
// guarantees every statement at weight >= 2.0 is seen at least twice before
// selection reverts to weighted-random. Difficulty escalates once a statement
// is demonstrably mastered at standard tier, and a conditional floor keeps
// mastered statements selectable so hard variants actually get asked before
// their earned decay is allowed to suppress them.
const COVERAGE_WEIGHT_THRESHOLD = 2.0;
const COVERAGE_TARGET_SEEN = 2;
const HARD_MASTERY_SEEN = 3; // seen >= this and 100% -> hard variants
const HARD_FLOOR = 1.0; // effective-weight floor for hard-eligible statements
const HARD_FLOOR_RELEASE = 2; // hard answers after which the floor releases

// Per-statement counters with the tier fields defaulted, so imported state
// (which only carries {seen, correct}) reads cleanly.
function taskStat(state, ts) {
  const p = (state.stats.perTask || {})[ts] || {};
  return {
    seen: p.seen || 0,
    correct: p.correct || 0,
    stdSeen: p.stdSeen || 0,
    stdCorrect: p.stdCorrect || 0,
    hardSeen: p.hardSeen || 0,
    hardCorrect: p.hardCorrect || 0,
  };
}

// Statements owed coverage: weight >= 2.0 and not yet seen twice. Optionally
// intersected with an availability map (static bank mode).
function coverageOwed(state, availability) {
  const owed = [];
  for (const ts of Object.keys(TASK_STATEMENTS)) {
    if ((state.weights[ts] || 0) < COVERAGE_WEIGHT_THRESHOLD) continue;
    if (taskStat(state, ts).seen >= COVERAGE_TARGET_SEEN) continue;
    if (availability && !((availability[ts] || 0) > 0)) continue;
    owed.push(ts);
  }
  return owed;
}

function inCoveragePhase(state) {
  return coverageOwed(state).length > 0;
}

// Difficulty tier for the next question on a statement. seen==0 -> standard
// (first exposure). seen>=3 with a perfect record -> hard (mastery bar). One
// correct STANDARD answer earned in-app -> hard (second-pass escalation).
// Imported correct answers carry no tier tag, so they raise the mastery-bar
// counts but do not by themselves trigger second-pass escalation.
function difficultyFor(state, ts) {
  const p = taskStat(state, ts);
  if (p.seen === 0) return "standard";
  if (p.seen >= HARD_MASTERY_SEEN && p.correct === p.seen) return "hard";
  if (p.stdCorrect >= 1) return "hard";
  return "standard";
}

function hardEligible(state, ts) {
  return difficultyFor(state, ts) === "hard";
}

// A 60-question exam form mirroring the real exam's domain weighting
// (27/18/20/20/15% -> 16/11/12/12/9). Matches EXAM_FORM_QUOTAS in exam_lib.py.
const EXAM_FORM_QUOTAS = { D1: 16, D2: 11, D3: 12, D4: 12, D5: 9 };
const EXAM_MINUTES = 120;
const PASSING_SCALED_SCORE = 720;

// Timed-mode difficulty spread over the 60-question form: ~60% standard (mid),
// 25% harder, 15% hard-tail — reproducing the guide samples' spread, not a
// uniform hard level. Standard is the remainder (60 - 15 - 9 = 36).
const EXAM_HARDER = 15;
const EXAM_HARD_TAIL = 9;

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
    if (!available || cooled.has(ts)) {
      eff[ts] = 0; // never floored: the floor must not resurrect an excluded statement
      continue;
    }
    let base = state.weights[ts] * DOMAIN_FACTORS[ts.split(".")[0]];
    // Conditional floor: keep a mastered (hard-eligible) statement selectable
    // at eff >= 1.0 until it has answered HARD_FLOOR_RELEASE hard variants,
    // then release it to its earned decay. A floor, not a boost — it lifts
    // only what sits below 1.0 and preserves the ordering of everything above.
    if (hardEligible(state, ts) && taskStat(state, ts).hardSeen < HARD_FLOOR_RELEASE) {
      base = Math.max(base, HARD_FLOOR);
    }
    eff[ts] = base;
  }
  return eff;
}

// Coverage-first pick: strictly least-seen owed statement (so the never-tested
// ones come first), effective weight then task-statement id as tiebreaks, the
// standard cooldown to prevent repeats, and a domain-interleave nudge so equal-
// priority picks don't stack the same domain back-to-back (which would
// telegraph the answer category).
function coveragePick(state, owed) {
  const cooled = cooldownSet(state);
  let pool = owed.filter((ts) => !cooled.has(ts));
  if (!pool.length) pool = owed.slice(); // everything cooled -> ignore cooldown
  const seenOf = (ts) => taskStat(state, ts).seen;
  const minSeen = Math.min(...pool.map(seenOf));
  const metric = (ts) => state.weights[ts] * DOMAIN_FACTORS[ts.split(".")[0]];
  const top = pool
    .filter((ts) => seenOf(ts) === minSeen)
    .sort((a, b) => metric(b) - metric(a) || (a < b ? -1 : a > b ? 1 : 0));
  const prev = state.history[state.history.length - 1];
  const prevDomain = prev ? prev.t.split(".")[0] : null;
  if (prevDomain && top[0].split(".")[0] === prevDomain) {
    const alt = top.find((ts) => ts.split(".")[0] !== prevDomain);
    if (alt) return alt; // same-seen, different-domain alternative exists
  }
  return top[0];
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
  // `exclude` removes the statement currently on screen: render-time prefetch
  // draws before that question is graded, so without this the same statement
  // (still showing seen<target) would be drawn back-to-back. Best-effort — if
  // excluding it would leave nothing to draw, the exclusion is dropped.
  const exclude = options.exclude || null;

  // Coverage-first phase takes precedence over weighted-random until every
  // weight>=2 statement has been seen twice.
  const owed = coverageOwed(state, options.availability);
  if (owed.length) {
    const pool = exclude && owed.some((ts) => ts !== exclude)
      ? owed.filter((ts) => ts !== exclude)
      : owed;
    return coveragePick(state, pool);
  }
  const drawWith = (ignoreCooldown) => {
    const eff = effectiveWeights(state, {
      availability: options.availability,
      ignoreCooldown,
    });
    if (exclude && Object.keys(eff).some((ts) => ts !== exclude && eff[ts] > 0)) {
      eff[exclude] = 0;
    }
    return weightedDraw(eff, options.rng);
  };
  let ts = drawWith(false);
  if (ts === null) ts = drawWith(true); // cooldown emptied the pool; redraw
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
  const difficulty = answer.difficulty === "hard" ? "hard" : "standard";
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
  // Per-tier counters drive difficulty escalation and the floor release, and
  // survive history trimming (unlike counting from the rolling history).
  const seenKey = difficulty === "hard" ? "hardSeen" : "stdSeen";
  const correctKey = difficulty === "hard" ? "hardCorrect" : "stdCorrect";
  perTask[seenKey] = (perTask[seenKey] || 0) + 1;
  // Always a number (0 when this answer was wrong), so an exported record
  // shows the tier's correct count explicitly rather than by omission.
  perTask[correctKey] = (perTask[correctKey] || 0) + (answer.correct ? 1 : 0);
  state.stats.perTask[ts] = perTask;

  // `d` tags each history entry with its difficulty tier so an exported /
  // re-imported record distinguishes which tier an answer was earned at.
  state.history.push({ t: ts, q: answer.questionId, c: answer.correct, at: answer.at, d: difficulty });
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

// Draw a 60-question form from the BANK as 4 runs of 15, one scenario each.
//
// Grouped by genre, not a true block: a banked question carries its own
// scenario text, so 15 questions sharing a scenarioType do not share a
// scenario. The fresh-generation path produces real shared-scenario blocks;
// this is the fallback when generation is unavailable, and the UI says so.
//
// Returns null when the labelled bank cannot support it — a short or
// quota-violating form would be worse than falling back to drawExamForm.
function drawExamBlockedForm(bank, state, opts) {
  const options = opts || {};
  const rng = options.rng || Math.random;
  const blocked = new Set(state.flagged);

  // Index the labelled, unflagged bank by scenario then domain.
  const byScenario = {};
  for (const question of bank) {
    const type = question.scenarioType;
    if (!type || blocked.has(question.id)) continue;
    const domains = (byScenario[type] = byScenario[type] || {});
    (domains[question.domain] = domains[question.domain] || []).push(question);
  }

  // Only scenarios that could fill a whole block are worth drawing.
  const eligible = Object.keys(byScenario).filter((type) => {
    const total = Object.values(byScenario[type]).reduce((s, qs) => s + qs.length, 0);
    return total >= EXAM_BLOCK_SIZE;
  });
  if (eligible.length < EXAM_BLOCKS) return null;

  // Try every 4-subset before giving up, in random order. Whether a subset can
  // be filled depends on the domains inside it, not just its totals — and
  // sampling subsets at random repeats some while never reaching others. With
  // six eligible types there are only fifteen subsets, so the chance of
  // missing a given one across 24 random draws was (14/15)^24, about 19%.
  // Against the committed bank — three of six types sitting at exactly
  // EXAM_BLOCK_SIZE — that measured as a 24% fallback rate, and the fallback
  // is silent: the sitting simply stops being blocked. Enumerating is both
  // cheaper and complete, so a form exists whenever one is possible.
  //
  // Per subset the outcome is deterministic: scenario types own disjoint
  // question sets, so `used` never collides across blocks and the shuffle
  // changes which questions are drawn, never how many are available. One
  // attempt each is therefore enough.
  for (const types of shuffled(combinations(eligible, EXAM_BLOCKS), rng)) {
    const plan = planBlockedDomains(types, byScenario);
    if (!plan) continue;

    const used = new Set();
    const form = [];
    let ok = true;
    for (let b = 0; b < types.length && ok; b++) {
      const picks = [];
      for (const [domain, n] of Object.entries(plan[b])) {
        const pool = (byScenario[types[b]][domain] || []).filter((q) => !used.has(q.id));
        // Unseen first, exactly as the flat draw does, then least-recently-seen.
        const unseen = shuffled(pool.filter((q) => state.seen[q.id] === undefined), rng);
        const seen = pool
          .filter((q) => state.seen[q.id] !== undefined)
          .sort((x, y) => state.seen[x.id] - state.seen[y.id]);
        const ordered = unseen.concat(seen);
        if (ordered.length < n) { ok = false; break; }
        for (let i = 0; i < n; i++) {
          used.add(ordered[i].id);
          picks.push(ordered[i]);
        }
      }
      if (ok) form.push(...shuffled(picks, rng)); // shuffle WITHIN the block only
    }
    if (ok && form.length === EXAM_BLOCKS * EXAM_BLOCK_SIZE) return form;
  }
  return null;
}

// Every way to choose `k` of `items`, order-insensitive.
function combinations(items, k) {
  if (k > items.length) return [];
  const out = [];
  const walk = (start, picked) => {
    if (picked.length === k) { out.push(picked.slice()); return; }
    for (let i = start; i < items.length; i++) {
      picked.push(items[i]);
      walk(i + 1, picked);
      picked.pop();
    }
  };
  walk(0, []);
  return out;
}

// How many questions of each domain each block should contribute, so that the
// blocks total exactly EXAM_FORM_QUOTAS. Same round-robin dealing as
// drawExamBlocks, but additionally capped by what the bank actually holds for
// that scenario. Returns null when the chosen scenarios cannot cover the quotas.
function planBlockedDomains(types, byScenario) {
  const stock = { ...EXAM_FORM_QUOTAS };
  const plan = types.map(() => ({}));
  const taken = types.map(() => 0);
  const capacity = (b, domain) =>
    (byScenario[types[b]][domain] || []).length - (plan[b][domain] || 0);

  const claim = (b, domain) => {
    stock[domain] -= 1;
    plan[b][domain] = (plan[b][domain] || 0) + 1;
    taken[b] += 1;
  };

  // Pass 1: primary domains, round-robin so no block starves another, and
  // capped at the primary TARGET rather than run to 15. Filling a block
  // entirely from its primaries strands whatever domain is primary nowhere in
  // this draw — D4 is primary for only two of the six scenarios — leaving a
  // later block owed slots it has no stock for, and the whole draw fails.
  // Stopping at the target keeps 7 slots per block free to absorb them.
  let dealt = true;
  while (dealt) {
    dealt = false;
    for (let b = 0; b < types.length; b++) {
      if (taken[b] >= EXAM_BLOCK_PRIMARY_TARGET) continue;
      const primary = (SCENARIO_PRIMARY_DOMAINS[types[b]] || [])
        .filter((d) => stock[d] > 0 && capacity(b, d) > 0)
        .sort((x, y) => stock[y] - stock[x]);
      if (!primary.length) continue;
      claim(b, primary[0]);
      dealt = true;
    }
  }

  // Pass 2: anything still owed, also round-robin. Filling blocks one at a
  // time instead lets an earlier block take the last of a domain that a later
  // block is the only one still able to absorb — the later block then ends a
  // slot short with stock left on the table, and the whole draw fails.
  let filling = true;
  while (filling) {
    filling = false;
    for (let b = 0; b < types.length; b++) {
      if (taken[b] >= EXAM_BLOCK_SIZE) continue;
      const domain = Object.keys(stock)
        .filter((d) => stock[d] > 0 && capacity(b, d) > 0)
        .sort((x, y) => stock[y] - stock[x])[0];
      if (!domain) continue;
      claim(b, domain);
      filling = true;
    }
  }
  const filled = taken.every((n) => n === EXAM_BLOCK_SIZE);
  return filled && Object.values(stock).every((n) => n === 0) ? plan : null;
}

// Choose n distinct items from a list, spread-free random. Returns all items
// (shuffled) when n >= length. Used to draw 4 of the 6 exam scenario types.
function sampleN(items, n, rng) {
  return shuffled(items, rng).slice(0, Math.min(n, items.length));
}

// Pick `count` positions from `positions`, one per evenly-sized bucket, so the
// choices spread across the range instead of clustering.
function pickPerBucket(positions, count, rng) {
  const draw = rng || Math.random;
  const chosen = [];
  for (let i = 0; i < count; i++) {
    const lo = Math.floor((i * positions.length) / count);
    const hi = Math.floor(((i + 1) * positions.length) / count);
    const span = Math.max(1, hi - lo);
    chosen.push(positions[lo + Math.floor(draw() * span)]);
  }
  return chosen;
}

// The exam's six scenarios, reproduced verbatim from the Claude Certified
// Architect – Foundations Exam Guide v1.0, section 5 ("Exam Scenarios"), for
// personal exam preparation. Anthropic's text, not ours. © Anthropic PBC.
// This tool is not an official Anthropic product and is not affiliated with,
// sponsored by or endorsed by Anthropic.
//
// Mirrors EXAM_SCENARIOS in exam_lib.py — duplicated because the bank exam
// runs with no bridge and still has to show the scenario. A test asserts the
// two stay byte-identical. Do not paraphrase or reword: the fidelity IS the
// wording, which is the whole reason these are stored rather than generated.
// What the scenario panel shows for one question, and what its branch is.
//
// The panel carries the exam's FIXED scenario and must hold still for a whole
// block — that persistence is what the split layout is for. So this keys off
// scenarioType alone and never off provenance: an earlier version gave the
// guide's own sample questions their standalone scenario in the panel, to
// avoid restating context. Reasonable per question, wrong in aggregate — the
// bank's samples are scattered, so 61% of blocks flipped the panel mid-run and
// back. Their scenario is shown as the branch instead, which is where a
// question's own situation belongs.
//
// The single exception is an off-scenario substitute: a bank question dropped
// into a block when generation fails may belong to a different scenario
// entirely, so the block's fixed text would simply be wrong for it. That flip
// is declared degradation rather than a silent one.
function scenarioPanelFor(question) {
  const fixed = question.offScenario ? null : EXAM_SCENARIOS[question.scenarioType];
  return {
    panel: fixed || question.scenario || "",
    fork: fixed ? question.scenario || "" : "",
  };
}

const EXAM_SCENARIOS = {
  "Customer Support Resolution Agent":
    "You are building a customer support resolution agent using the Claude Agent SDK. The agent handles high-ambiguity requests like returns, billing disputes, and account issues. It has access to your backend systems through custom Model Context Protocol (MCP) tools (get_customer, lookup_order, process_refund, escalate_to_human). Your target is 80%+ first-contact resolution while knowing when to escalate.",
  "Code Generation with Claude Code":
    "You are using Claude Code to accelerate software development. Your team uses it for code generation, refactoring, debugging, and documentation. You need to integrate it into your development workflow with custom slash commands, CLAUDE.md configurations, and understand when to use plan mode vs direct execution.",
  "Multi-Agent Research System":
    "You are building a multi-agent research system using the Claude Agent SDK. A coordinator agent delegates to specialized subagents: one searches the web, one analyzes documents, one synthesizes findings, and one generates reports. The system researches topics and produces comprehensive, cited reports.",
  "Developer Productivity with Claude":
    "You are building developer productivity tools using the Claude Agent SDK. The agent helps engineers explore unfamiliar codebases, understand legacy systems, generate boilerplate code, and automate repetitive tasks. It uses the built-in tools (Read, Write, Bash, Grep, Glob) and integrates with Model Context Protocol (MCP) servers.",
  "Claude Code for Continuous Integration":
    "You are integrating Claude Code into your Continuous Integration/Continuous Deployment (CI/CD) pipeline. The system runs automated code reviews, generates test cases, and provides feedback on pull requests. You need to design prompts that provide actionable feedback and minimize false positives.",
  "Structured Data Extraction":
    "You are building a structured data extraction system using Claude. The system extracts information from unstructured documents, validates the output using JavaScript Object Notation (JSON) schemas, and maintains high accuracy. It must handle edge cases gracefully and integrate with downstream systems.",
};

// The exam's six scenario types. Mirrors SCENARIO_TYPES in exam_lib.py — the
// bridge also reports them via health(), but block assembly has to work offline
// (the bank exam has no bridge), so they are duplicated here and a test asserts
// the two lists stay identical.
const SCENARIO_TYPES = [
  "Customer Support Resolution Agent",
  "Code Generation with Claude Code",
  "Multi-Agent Research System",
  "Developer Productivity with Claude",
  "Claude Code for Continuous Integration",
  "Structured Data Extraction",
];

// Which domains each scenario exercises. TRANSCRIBED from the CCAR-F exam
// guide v1.0 section 5, which states "Primary domains:" under each scenario —
// not inferred. An earlier version of this table was authored from the
// scenario prose and had 4 of the 6 wrong; do not re-derive it by reading the
// descriptions, read the guide's own line.
//
// Note the counts differ: three scenarios name three domains, three name only
// two. That asymmetry is the guide's, not an omission here.
//
// Used to WEIGHT a block, never to restrict it: D1 alone needs 16 of 60, more
// than one block holds, so no assignment can be domain-pure. Some 4-of-6 draws
// also leave a domain primary in no drawn block at all — which drawExamBlocks
// reports rather than hides.
const SCENARIO_PRIMARY_DOMAINS = {
  // Agentic Architecture & Orchestration, Tool Design & MCP, Context Mgmt
  "Customer Support Resolution Agent": ["D1", "D2", "D5"],
  // Claude Code Configuration & Workflows, Context Management & Reliability
  "Code Generation with Claude Code": ["D3", "D5"],
  // Agentic Architecture & Orchestration, Tool Design & MCP, Context Mgmt
  "Multi-Agent Research System": ["D1", "D2", "D5"],
  // Tool Design & MCP, Claude Code Config & Workflows, Agentic Architecture
  "Developer Productivity with Claude": ["D2", "D3", "D1"],
  // Claude Code Configuration & Workflows, Prompt Engineering & Structured Output
  "Claude Code for Continuous Integration": ["D3", "D4"],
  // Prompt Engineering & Structured Output, Context Management & Reliability
  "Structured Data Extraction": ["D4", "D5"],
};

const EXAM_BLOCKS = 4;
const EXAM_BLOCK_SIZE = 15;

// Share of generated questions phrased FUNCTIONALLY — the mechanism described
// by what it does rather than named. Mirrors FUNCTIONAL_FRACTION in exam_lib.py;
// the two must agree or a form and a bank refill train different things.
const FUNCTIONAL_FRACTION = 0.45;

// One register for one question. Used by the practice drill, which generates a
// question at a time and so has no plan to index into.
function drawRegister(rng, fraction) {
  const draw = rng || Math.random;
  const share = fraction === undefined ? FUNCTIONAL_FRACTION : fraction;
  return draw() < share ? "functional" : "named";
}

// A per-question register plan for the timed form: exactly the target share,
// SHUFFLED rather than bucket-spread.
//
// Bucket-spreading is right for the difficulty tiers — 9 hard over 60 gives
// ~7-wide buckets and a guaranteed spread. At a 45% share the buckets are
// barely 2 wide, so one functional per bucket lands a functional question
// every 2-3 positions: a runs test on that version scored z=6.4, far more
// regular than chance. A candidate who spots the rhythm can predict the
// register, which is the pattern-matching this change exists to defeat.
function examRegisterPlan(rng) {
  const draw = rng || Math.random;
  const total = Object.values(EXAM_FORM_QUOTAS).reduce((s, n) => s + n, 0);
  const wanted = Math.round(total * FUNCTIONAL_FRACTION);
  const labels = new Array(total)
    .fill("named")
    .fill("functional", 0, wanted);
  return shuffled(labels, draw);
}

// Share of questions in which the correct option is ALLOWED to be the longest.
// Mirrors LENGTH_LONGEST_FRACTION in exam_lib.py; the two must agree or a live
// form reinstates the shortcut the bank suppresses.
//
// The margin cap (LENGTH_TELL_MAX_RATIO) bounds how far the correct option may
// outrun its rivals on ONE question. It says nothing about how often, and
// generation settles just under it — so every question passes while the rate
// climbs. Planning the posture is what fixes the rate. 0.35 against a chance
// rate of 0.25 leaves "pick the longest" worth ~9 points over guessing: not a
// strategy worth playing, but not zero either, since a bank with no tell at all
// teaches that the longest option is never right, which the real exam refutes.
const LENGTH_LONGEST_FRACTION = 0.35;

// One posture for one question. Used by the practice drill, which generates a
// question at a time and so has no plan to index into.
function drawLengthPosture(rng, fraction) {
  const draw = rng || Math.random;
  const share = fraction === undefined ? LENGTH_LONGEST_FRACTION : fraction;
  return draw() < share ? "longest" : "not-longest";
}

// A per-question length-posture plan for the timed form: exactly the target
// share, shuffled for the same reason the register plan is — a posture a
// candidate can predict is a stretch of form where the shortcut pays.
function examLengthPlan(rng) {
  const draw = rng || Math.random;
  const total = Object.values(EXAM_FORM_QUOTAS).reduce((s, n) => s + n, 0);
  const wanted = Math.round(total * LENGTH_LONGEST_FRACTION);
  const labels = new Array(total)
    .fill("not-longest")
    .fill("longest", 0, wanted);
  return shuffled(labels, draw);
}

// A per-question difficulty plan for the 60-question timed form: EXAM_HARD_TAIL
// hard-tail and EXAM_HARDER harder questions, each bucket-spread across the
// sequence (so the hard tail is distributed, never clustered), the rest
// standard. Returns an array of 60 labels in presentation order.
function examDifficultyPlan(rng) {
  const draw = rng || Math.random;
  const total = Object.values(EXAM_FORM_QUOTAS).reduce((s, n) => s + n, 0);
  const labels = new Array(total).fill("standard");
  const all = Array.from({ length: total }, (_, i) => i);
  const hardTail = pickPerBucket(all, EXAM_HARD_TAIL, draw);
  const htSet = new Set(hardTail);
  const remaining = all.filter((i) => !htSet.has(i));
  const harder = pickPerBucket(remaining, EXAM_HARDER, draw);
  for (const i of hardTail) labels[i] = "hard";
  for (const i of harder) labels[i] = "harder";
  return labels;
}

// Draw the timed form as 4 blocks of 15, one scenario each.
//
// The hard part is that two constraints pull against each other: the global
// domain quotas are exact (16/11/12/12/9), while each block wants to lean on
// its own scenario's domains. Domains are therefore dealt to blocks
// round-robin — every block takes one primary-domain slot at a time before any
// block takes a second — so no block is starved by an earlier one exhausting a
// shared domain. Whatever the primary pass cannot place is filled from what
// remains, which is what keeps the global quotas exact.
function drawExamBlocks(opts) {
  const options = opts || {};
  const rng = options.rng || Math.random;
  const types = options.scenarioTypes || sampleN(SCENARIO_TYPES, EXAM_BLOCKS, rng);

  // Remaining slots per domain, straight from the quotas.
  const stock = { ...EXAM_FORM_QUOTAS };
  const blockDomains = types.map(() => []);

  // Pass 1: deal primary-domain slots round-robin across blocks.
  let dealt = true;
  while (dealt) {
    dealt = false;
    for (let b = 0; b < types.length; b++) {
      if (blockDomains[b].length >= EXAM_BLOCK_SIZE) continue;
      const primary = SCENARIO_PRIMARY_DOMAINS[types[b]] || [];
      // Take from whichever primary domain has the most left, so a block does
      // not drain a scarce domain another block also needs.
      const pick = primary
        .filter((d) => stock[d] > 0)
        .sort((x, y) => stock[y] - stock[x])[0];
      if (!pick) continue;
      stock[pick] -= 1;
      blockDomains[b].push(pick);
      dealt = true;
    }
  }

  // Pass 2: fill the rest from what is left, so global quotas stay exact.
  const leftovers = [];
  for (const [domain, n] of Object.entries(stock)) {
    for (let i = 0; i < n; i++) leftovers.push(domain);
  }
  const spare = shuffled(leftovers, rng);
  for (let b = 0; b < types.length; b++) {
    while (blockDomains[b].length < EXAM_BLOCK_SIZE) blockDomains[b].push(spare.pop());
  }

  // Turn domain slots into concrete task statements, round-robin within each
  // domain so one statement cannot dominate a block.
  const cursors = {};
  const byDomain = {};
  for (const domain of Object.keys(EXAM_FORM_QUOTAS)) {
    byDomain[domain] = shuffled(
      Object.keys(TASK_STATEMENTS).filter((ts) => ts.split(".")[0] === domain),
      rng
    );
    cursors[domain] = 0;
  }
  return types.map((scenarioType, b) => {
    const primary = SCENARIO_PRIMARY_DOMAINS[scenarioType] || [];
    const statements = shuffled(blockDomains[b], rng).map((domain) => {
      const pool = byDomain[domain];
      return pool[cursors[domain]++ % pool.length];
    });
    const hits = statements.filter((ts) => primary.includes(ts.split(".")[0])).length;
    return {
      scenarioType,
      statements,
      // Surfaced, not swallowed: a draw where a domain is primary nowhere
      // forces off-primary questions, and the caller should be able to say so.
      primaryShortfall: Math.max(0, EXAM_BLOCK_PRIMARY_TARGET - hits),
    };
  });
}

// The assertable bar for "weighted toward primary domains". Not 15: the exact
// global quotas make a domain-pure block impossible.
const EXAM_BLOCK_PRIMARY_TARGET = 8;

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

// ── Per-question timing (diagnostic only) ────────────────────────────────
// Timing never touches scoring, selection, or the pass threshold. An incorrect
// answer under this threshold reads as a rushed miss rather than a knowledge
// gap — the diagnostic the summary is for.
const FAST_INCORRECT_MS = 45000;

// elapsed: map of question id -> cumulative dwell ms (may be null/absent when
// a start stamp was missing, or for runs saved before timing existed).
// excludedIds: flagged-as-flawed ids, excluded here exactly as they are from
// discountedScore. Every mean is null rather than NaN when its side is empty.
function summarizeExamTiming(form, answers, elapsed, excludedIds) {
  const excluded = new Set(excludedIds || []);
  const times = elapsed || {};
  let totalMs = 0;
  let counted = 0;
  let untimed = 0;
  let correctMs = 0;
  let correctN = 0;
  let incorrectMs = 0;
  let incorrectN = 0;
  let fastIncorrect = 0;
  for (const question of form) {
    if (!question || excluded.has(question.id)) continue;
    const ms = times[question.id];
    if (typeof ms !== "number" || !isFinite(ms)) {
      untimed += 1;
      continue;
    }
    totalMs += ms;
    counted += 1;
    if (answers[question.id] === question.correct) {
      correctMs += ms;
      correctN += 1;
    } else {
      incorrectMs += ms;
      incorrectN += 1;
      if (ms < FAST_INCORRECT_MS) fastIncorrect += 1;
    }
  }
  return {
    totalMs,
    counted,
    untimed,
    meanMs: counted ? totalMs / counted : null,
    meanCorrectMs: correctN ? correctMs / correctN : null,
    meanIncorrectMs: incorrectN ? incorrectMs / incorrectN : null,
    fastIncorrect,
  };
}

// Fold an exam attempt into the adaptive state: weights, stats, and seen
// update exactly like drill answers, and the attempt lands in examHistory.
// Drill `history` is deliberately untouched — it drives the cooldown and
// trend display, and 60 batch entries would wipe it.
// totalElapsedMs is the run's cumulative dwell time, or null when unavailable
// (including every run saved before timing existed).
function applyExamResults(state, form, answers, at, totalElapsedMs) {
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
    elapsedMs: typeof totalElapsedMs === "number" ? totalElapsedMs : null,
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
    const difficulty = lastAnswer.difficulty === "hard" ? "hard" : "standard";
    const seenKey = difficulty === "hard" ? "hardSeen" : "stdSeen";
    const correctKey = difficulty === "hard" ? "hardCorrect" : "stdCorrect";
    perTask.seen -= 1;
    if (lastAnswer.correct) perTask.correct -= 1;
    perTask[seenKey] = (perTask[seenKey] || 0) - 1;
    if (lastAnswer.correct) perTask[correctKey] = (perTask[correctKey] || 0) - 1;
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

/* ── Exam form navigation ──────────────────────────────────────────────────
   Pure helpers for moving through a fixed exam form. The real exam lets a
   candidate leave a question blank, move on, and return to it later, so
   nothing here requires an answer to advance — the DOM layer calls these to
   decide what to render and whether a submit needs confirming.

   A form slot can be sparse: form[i] may still be undefined while its question
   sits in prep.buffer[i], materialized on first render. Every helper resolves
   ids through both, so a still-loading slot is never mistaken for a blank one
   that the candidate chose to skip — or worse, for an answered one. */

function resolveFormIds(form, prep) {
  const buffer = (prep && prep.buffer) || [];
  return (form || []).map((q, i) => {
    if (q && q.id != null) return q.id;
    const buffered = buffer[i];
    return buffered && buffered.id != null ? buffered.id : null;
  });
}

function navIsAnswered(answers, id) {
  return id != null && !!answers && answers[id] !== undefined;
}

function unansweredIndices(form, answers, prep) {
  return resolveFormIds(form, prep).reduce((out, id, i) => {
    if (!navIsAnswered(answers, id)) out.push(i);
    return out;
  }, []);
}

function markedIndices(form, marked, prep) {
  return resolveFormIds(form, prep).reduce((out, id, i) => {
    if (id != null && marked && marked[id]) out.push(i);
    return out;
  }, []);
}

// Returns a new map rather than mutating, so callers can't accidentally share
// review state between an exam in progress and a restored one.
function toggleMarked(marked, id) {
  const next = Object.assign({}, marked);
  if (next[id]) delete next[id];
  else next[id] = true;
  return next;
}

// Mark-through: options the candidate has eliminated. A third, independent
// kind of per-question state — `answers` commits a choice, `marked` says come
// back to this, and this one only crosses options out. Nested by question id
// then option key. Returns a new map, and copies the inner map too, so an exam
// in progress can never share strike state with a restored one.
function toggleStruck(struck, id, key) {
  const next = Object.assign({}, struck);
  const forQuestion = Object.assign({}, next[id]);
  if (forQuestion[key]) delete forQuestion[key];
  else forQuestion[key] = true;
  if (Object.keys(forQuestion).length) next[id] = forQuestion;
  else delete next[id];
  return next;
}

function isStruck(struck, id, key) {
  return !!(struck && struck[id] && struck[id][key]);
}

function examProgress(form, answers, marked, prep) {
  const ids = resolveFormIds(form, prep);
  const unanswered = unansweredIndices(form, answers, prep);
  return {
    total: ids.length,
    answered: ids.length - unanswered.length,
    unanswered,
    marked: markedIndices(form, marked, prep),
    complete: unanswered.length === 0,
  };
}

function needsSubmitConfirmation(form, answers, prep) {
  return unansweredIndices(form, answers, prep).length > 0;
}

// True once a form slot has a real question, or is guaranteed to get one on the
// next render — either it is already buffered, or generation failed for it and a
// bank question will be substituted. False only for the paused "still
// generating" state, where advancing would race ahead of the generator and
// quietly turn a fresh-question exam into bank substitutes. A bank exam has no
// prep at all and is always ready.
function slotIsResolved(form, prep, index) {
  if ((form || [])[index]) return true;
  if (!prep) return true;
  if ((prep.buffer || [])[index]) return true;
  return !!(prep.failedSlots && prep.failedSlots.has(index));
}

// Next blank after the cursor, wrapping past the end. The cursor's own slot is
// checked LAST rather than never: moving elsewhere is preferred, but if the
// cursor is the only blank left, returning it beats reporting the form complete.
function nextUnansweredFrom(index, form, answers, prep) {
  const ids = resolveFormIds(form, prep);
  const n = ids.length;
  if (n === 0) return null;
  for (let step = 1; step <= n; step++) {
    const i = (index + step) % n;
    if (!navIsAnswered(answers, ids[i])) return i;
  }
  return null;
}

const NAV = {
  resolveFormIds,
  isAnswered: navIsAnswered,
  unansweredIndices,
  markedIndices,
  toggleMarked,
  toggleStruck,
  isStruck,
  examProgress,
  needsSubmitConfirmation,
  nextUnansweredFrom,
  slotIsResolved,
};

const CCARF_ADAPTIVE = {
  nav: NAV,
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
  EXAM_HARDER,
  EXAM_HARD_TAIL,
  COVERAGE_WEIGHT_THRESHOLD,
  COVERAGE_TARGET_SEEN,
  HARD_MASTERY_SEEN,
  HARD_FLOOR,
  HARD_FLOOR_RELEASE,
  makeSeedWeights,
  initialState,
  effectiveWeights,
  drawTaskStatement,
  coverageOwed,
  inCoveragePhase,
  difficultyFor,
  hardEligible,
  availabilityFromBank,
  pickBankQuestion,
  applyAnswer,
  applyFlag,
  drawExamForm,
  drawExamBlockedForm,
  planBlockedDomains,
  drawExamStatements,
  drawExamBlocks,
  SCENARIO_TYPES,
  EXAM_SCENARIOS,
  scenarioPanelFor,
  SCENARIO_PRIMARY_DOMAINS,
  EXAM_BLOCKS,
  EXAM_BLOCK_SIZE,
  EXAM_BLOCK_PRIMARY_TARGET,
  examDifficultyPlan,
  examRegisterPlan,
  drawLengthPosture,
  examLengthPlan,
  LENGTH_LONGEST_FRACTION,
  drawRegister,
  FUNCTIONAL_FRACTION,
  sampleN,
  scoreExam,
  discountedScore,
  applyExamResults,
  summarizeExamTiming,
  FAST_INCORRECT_MS,
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = CCARF_ADAPTIVE;
}
if (typeof window !== "undefined") {
  window.CCARF_ADAPTIVE = CCARF_ADAPTIVE;
}
