'use strict';
// evalpro-app.js
// EVALPRO — AI Model Evaluation & Regression Testing Platform
//
// Challenge: Design a dark-mode AI model evaluation dashboard using Linear.app's
// EXACT near-black aesthetic (#08090A background, #F7F8F8 text, #5E6AD2 accent)
// as featured prominently on darkmodedesign.com — lifted directly, no paraphrase.
// Inspired also by the AI-agents SaaS wave on land-book.com (Runlayer MCPs,
// Anchor AI, bakedwith) and Haptic's precision-instrument aesthetic on godly.website.
//
// The deliberate design challenge: can "functional dark" feel as premium as
// "cosmic dark"? No glow coronas. No glass panels. Pure Linear-style structure.
//
// Screens (5 mobile 390×844):
//   1. Dashboard     — bento metric grid + eval run feed + regression CTA
//   2. Run Detail    — score breakdown bars + failed example list
//   3. Model Compare — split-view category delta table + winner callout
//   4. New Eval      — 3-step config: dataset → models → metrics
//   5. Regression    — before/after scores, heatmap, diff cause, triage actions

const fs   = require('fs');
const path = require('path');
const https = require('https');

// ── Config ────────────────────────────────────────────────────────────────────
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN || '';
const GITHUB_REPO  = config.GITHUB_REPO  || '';
const SLUG         = 'evalpro-eval';
const PROMPT       = 'Design a dark-mode AI model evaluation and regression testing platform called EVALPRO — using Linear.app\'s exact near-black aesthetic (#08090A, #F7F8F8, #5E6AD2) as featured on darkmodedesign.com, inspired by the AI-agents tooling wave on land-book.com (Runlayer, Anchor AI, bakedwith) and Haptic\'s precision-instrument feel on godly.website. No decorative glows — pure function over form. Dashboard, run detail, model comparison, new eval setup, regression alert.';

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:        '#08090A',   // Linear exact background
  surface:   '#111214',   // first level surface
  surface2:  '#181A1E',   // card surface
  surface3:  '#1E2126',   // lighter card
  border:    '#252830',   // subtle divider
  border2:   '#303540',   // visible border
  fg:        '#F7F8F8',   // Linear exact foreground
  fg2:       '#8A8F98',   // secondary text (Linear)
  fg3:       '#545C6B',   // muted label
  accent:    '#5E6AD2',   // Linear purple-blue
  accentDim: '#5E6AD218', // tinted bg
  accentLt:  '#8890E8',   // lighter accent
  pass:      '#22C55E',   // pass / success
  passD:     '#22C55E18', // pass dim
  fail:      '#EF4444',   // fail / error
  failD:     '#EF444418', // fail dim
  warn:      '#F59E0B',   // warn / degraded
  warnD:     '#F59E0B18', // warn dim
  diff:      '#A78BFA',   // diff highlight
};

// ── Primitives ────────────────────────────────────────────────────────────────
let _id = 0;
const uid = () => `ep${++_id}`;

const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h, fill: fill || P.bg,
  clip: opts.clip !== undefined ? opts.clip : false,
  ...(opts.r !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.ch || [],
});

const T = (content, x, y, w, h, opts = {}) => ({
  id: uid(), type: 'text', content, x, y, width: w, height: h,
  textGrowth: 'fixed-width-height',
  fontSize: opts.size || 13,
  fontWeight: String(opts.weight || 400),
  fill: opts.fill || P.fg,
  textAlign: opts.align || 'left',
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh !== undefined ? { lineHeight: opts.lh } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Line = (x, y, w, fill = P.border) => F(x, y, w, 1, fill);

// ── Components ────────────────────────────────────────────────────────────────
const Dot = (x, y, color, size = 8) => E(x, y, size, size, color);

const ScoreBadge = (x, y, label, variant) => {
  const map = { PASS: [P.pass, P.passD], FAIL: [P.fail, P.failD], WARN: [P.warn, P.warnD], NEW: [P.accent, P.accentDim] };
  const [fg, bg] = map[variant] || [P.fg2, P.surface2];
  return F(x, y, label.length * 6.8 + 20, 22, bg, {
    r: 11, stroke: fg + '44',
    ch: [T(label, 10, 4, label.length * 6.8, 14, { size: 10, fill: fg, weight: 700, ls: 0.5 })],
  });
};

const ScoreBar = (x, y, w, pct, color) => [
  F(x, y, w, 4, P.surface3, { r: 2 }),
  F(x, y, Math.max(4, Math.round(w * pct)), 4, color, { r: 2 }),
];

const MetricCard = (x, y, w, h, label, value, sub, color) => F(x, y, w, h, P.surface, {
  r: 10, stroke: P.border,
  ch: [
    T(label, 14, 12, w - 28, 11, { size: 9, fill: P.fg3, ls: 1.5, weight: 700 }),
    T(value, 14, 28, w - 28, 32, { size: 27, fill: color, weight: 800 }),
    T(sub,   14, 62, w - 28, 13, { size: 11, fill: P.fg3 }),
  ],
});

const RunRow = (x, y, runId, model, score, variant) => {
  const color = variant === 'PASS' ? P.pass : variant === 'FAIL' ? P.fail : P.warn;
  return F(x, y, 350, 52, P.surface, { r: 8, stroke: P.border, ch: [
    F(0, 0, 3, 52, color, { r: 0 }),
    T(runId, 14, 8, 220, 13, { size: 11, fill: P.fg, weight: 600, ls: 0.2 }),
    T(model, 14, 26, 220, 12, { size: 11, fill: P.fg2 }),
    T(score, 296, 8, 50, 13, { size: 12, fill: color, weight: 700, align: 'right' }),
    T('›', 340, 18, 8, 16, { size: 14, fill: P.fg3 }),
  ]});
};

const TopBar = (title) => F(0, 0, 390, 56, P.bg, {
  ch: [
    T('◈ EVALPRO', 20, 17, 110, 16, { size: 12, fill: P.accent, weight: 800, ls: 2 }),
    title ? T(title, 140, 19, 130, 14, { size: 11, fill: P.fg2 }) : null,
    F(344, 14, 28, 28, P.surface, { r: 14, stroke: P.border, ch: [
      T('A', 7, 5, 14, 18, { size: 13, fill: P.accentLt, weight: 700, align: 'center' }),
    ]}),
    Line(0, 55, 390),
  ].filter(Boolean),
});

const BottomNav = (active) => F(0, 764, 390, 80, P.surface, {
  ch: [
    Line(0, 0, 390, P.border2),
    ...[['⊞','Runs',0],['◈','Evals',1],['↔','Compare',2],['⊕','New',3]].map(([ic,lb,i]) => {
      const nx = 14 + i * 91;
      const on = i === active;
      return [
        on ? F(nx+12, 6, 66, 52, P.accentDim, { r: 14 }) : null,
        T(ic, nx+22, 14, 46, 20, { size: 17, fill: on ? P.accent : P.fg3, align: 'center' }),
        T(lb, nx+6, 36, 78, 12, { size: 9, fill: on ? P.accent : P.fg3, align: 'center', weight: on ? 700 : 400, ls: 0.3 }),
      ].filter(Boolean);
    }).flat(),
  ],
});

// ── Screen 1: Dashboard ───────────────────────────────────────────────────────
function screenDashboard(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    TopBar('Overview'),

    T('All Evaluations', 20, 68, 250, 22, { size: 18, fill: P.fg, weight: 700 }),
    T('14 runs · last 30 days', 20, 94, 200, 14, { size: 12, fill: P.fg2 }),

    // 2×2 bento metric grid
    MetricCard(20,  118, 174, 88, 'AVG SCORE',    '87.4%', '↑ 2.1% vs prior',   P.pass),
    MetricCard(202, 118, 168, 88, 'REGRESSIONS',  '2',     '↓ from 5 last week', P.warn),
    MetricCard(20,  214, 174, 88, 'TOTAL RUNS',   '14',    'across 3 models',    P.accent),
    MetricCard(202, 214, 168, 88, 'FAIL RATE',    '8.3%',  'target < 5%',        P.fail),

    T('RECENT RUNS', 20, 316, 180, 12, { size: 9, fill: P.fg3, ls: 2, weight: 700 }),
    T('View all →', 302, 316, 68, 12, { size: 9, fill: P.accent, align: 'right' }),

    RunRow(20, 336, 'run-0320-a', 'claude-3-7 vs gpt-4o',   '91.2%', 'PASS'),
    RunRow(20, 396, 'run-0319-b', 'claude-3-7 vs baseline', '79.4%', 'WARN'),
    RunRow(20, 456, 'run-0318-c', 'gemini-2 vs gpt-4o',     '62.1%', 'FAIL'),
    RunRow(20, 516, 'run-0317-a', 'claude-3-7 vs baseline', '88.7%', 'PASS'),
    RunRow(20, 576, 'run-0316-b', 'gpt-4o vs baseline',     '85.3%', 'PASS'),

    F(20, 644, 350, 52, P.warnD, { r: 10, stroke: P.warn + '40', ch: [
      T('⚠', 14, 15, 22, 22, { size: 18, fill: P.warn }),
      T('2 regressions need triage', 44, 12, 260, 14, { size: 12, fill: P.warn, weight: 600 }),
      T('coding-bench · math-reasoning', 44, 30, 260, 12, { size: 11, fill: P.warn, opacity: 0.7 }),
      T('Review →', 306, 18, 40, 16, { size: 11, fill: P.warn, weight: 700 }),
    ]}),

    BottomNav(0),
  ]});
}

// ── Screen 2: Run Detail ──────────────────────────────────────────────────────
function screenRunDetail(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    F(0, 0, 390, 56, P.bg, { ch: [
      T('← Runs', 20, 18, 70, 20, { size: 12, fill: P.accent }),
      T('Run Detail', 100, 18, 190, 20, { size: 13, fill: P.fg, weight: 700, align: 'center' }),
      ScoreBadge(300, 16, 'PASS', 'PASS'),
      Line(0, 55, 390),
    ]}),

    T('run-0320-a', 20, 68, 260, 20, { size: 16, fill: P.fg, weight: 700, ls: 0.3 }),
    T('claude-3-7 vs gpt-4o · coding-bench-v2', 20, 92, 350, 14, { size: 11, fill: P.fg2 }),

    // Overall score block
    F(20, 116, 350, 72, P.surface, { r: 10, stroke: P.border, ch: [
      T('OVERALL', 14, 12, 100, 11, { size: 9, fill: P.fg3, ls: 1.5, weight: 700 }),
      T('91.2%', 14, 26, 120, 34, { size: 28, fill: P.pass, weight: 800 }),
      T('↑ 3.8pp vs gpt-4o', 14, 58, 180, 12, { size: 11, fill: P.pass, opacity: 0.8 }),
      T('109 / 119 passed', 250, 26, 90, 14, { size: 12, fill: P.fg2, align: 'right' }),
      T('10 / 119 failed', 250, 44, 90, 13, { size: 11, fill: P.fail, align: 'right' }),
    ]}),

    T('CATEGORY SCORES', 20, 206, 220, 12, { size: 9, fill: P.fg3, ls: 2, weight: 700 }),

    ...[
      ['Code Generation', 0.94, P.pass],
      ['Debugging',       0.89, P.pass],
      ['Refactoring',     0.87, P.pass],
      ['Documentation',   0.91, P.pass],
      ['Test Writing',    0.76, P.warn],
      ['Security Review', 0.62, P.fail],
    ].map(([cat, pct, color], i) => [
      T(cat, 20, 226 + i * 40, 170, 13, { size: 11, fill: P.fg }),
      T(`${Math.round(pct * 100)}%`, 334, 226 + i * 40, 36, 13, { size: 11, fill: color, weight: 700, align: 'right' }),
      ...ScoreBar(20, 244 + i * 40, 350, pct, color),
    ]).flat(),

    T('FAILED EXAMPLES', 20, 474, 220, 12, { size: 9, fill: P.fg3, ls: 2, weight: 700 }),

    ...[
      ['#047', 'SQL injection detection', 'missed pattern'],
      ['#089', 'XSS sanitization',        'false negative'],
      ['#103', 'Test coverage edge case',  'assertion error'],
    ].map(([id, title, reason], i) =>
      F(20, 494 + i * 58, 350, 50, P.surface, { r: 8, stroke: P.fail + '30', ch: [
        F(0, 0, 3, 50, P.fail, { r: 0 }),
        T(id, 14, 8, 40, 13, { size: 11, fill: P.fail, weight: 700 }),
        T(title,  60, 8,  240, 13, { size: 12, fill: P.fg,  weight: 500 }),
        T(reason, 60, 26, 240, 13, { size: 11, fill: P.fg2 }),
        T('›', 332, 18, 10, 14, { size: 14, fill: P.fg3 }),
      ]})
    ),

    BottomNav(1),
  ]});
}

// ── Screen 3: Model Compare ───────────────────────────────────────────────────
function screenCompare(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    F(0, 0, 390, 56, P.bg, { ch: [
      T('← Back', 20, 18, 60, 20, { size: 12, fill: P.accent }),
      T('Model Compare', 80, 18, 230, 20, { size: 13, fill: P.fg, weight: 700, align: 'center' }),
      Line(0, 55, 390),
    ]}),

    // Column headers
    F(0, 56, 194, 40, P.surface2, { ch: [
      Dot(14, 16, P.pass), T('claude-3-7', 28, 14, 150, 14, { size: 12, fill: P.fg, weight: 700 }),
    ]}),
    F(196, 56, 194, 40, P.surface2, { ch: [
      Dot(14, 16, P.fg3), T('gpt-4o', 28, 14, 150, 14, { size: 12, fill: P.fg2, weight: 700 }),
    ]}),
    F(194, 56, 2, 40, P.border2),
    Line(0, 96, 390),

    // Top scores
    F(0, 97, 194, 48, P.bg, { ch: [
      T('91.2%', 14, 10, 120, 26, { size: 22, fill: P.pass, weight: 800 }),
      T('↑ 3.8% ahead', 14, 36, 150, 12, { size: 10, fill: P.pass }),
    ]}),
    F(196, 97, 194, 48, P.bg, { ch: [
      T('87.4%', 14, 10, 120, 26, { size: 22, fill: P.fg2, weight: 800 }),
      T('baseline', 14, 36, 150, 12, { size: 10, fill: P.fg3 }),
    ]}),
    F(194, 97, 2, 48, P.border),
    Line(0, 145, 390),

    T('CATEGORY COMPARISON', 20, 158, 280, 12, { size: 9, fill: P.fg3, ls: 2, weight: 700 }),

    ...[
      ['Code Gen',    0.94, 0.88],
      ['Debugging',   0.89, 0.91],
      ['Refactoring', 0.87, 0.85],
      ['Doc Writing', 0.91, 0.90],
      ['Test Writing',0.76, 0.80],
      ['Security',    0.62, 0.58],
    ].map(([cat, a, b], i) => {
      const diff  = a - b;
      const color = diff > 0.02 ? P.pass : diff < -0.02 ? P.fail : P.fg2;
      return [
        F(0, 180 + i*52, 390, 44, i % 2 === 0 ? P.surface+'55' : P.bg, {}),
        T(cat, 14, 192 + i*52, 120, 13, { size: 11, fill: P.fg }),
        T(`${Math.round(a*100)}%`, 14, 206+i*52, 80, 12, { size: 11, fill: a>b?P.pass:P.fg2, weight: 600 }),
        F(170, 184+i*52, 50, 20, diff>0.02?P.passD:diff<-0.02?P.failD:P.surface2, { r: 10, ch: [
          T(diff>=0?`+${Math.round(diff*100)}`:`${Math.round(diff*100)}`, 0, 4, 50, 12, { size: 10, fill: color, weight: 700, align: 'center' }),
        ]}),
        T(`${Math.round(b*100)}%`, 310, 206+i*52, 66, 12, { size: 11, fill: b>a?P.pass:P.fg2, weight: 600, align: 'right' }),
        Line(0, 223+i*52, 390, P.border+'44'),
      ];
    }).flat(),

    F(20, 498, 350, 48, P.accentDim, { r: 10, stroke: P.accent+'40', ch: [
      T('◈', 14, 14, 20, 20, { size: 18, fill: P.accent }),
      T('claude-3-7 wins 4 of 6 categories', 42, 12, 260, 14, { size: 12, fill: P.accent, weight: 600 }),
      T('Largest gap: Code Generation (+6pp)', 42, 30, 260, 13, { size: 11, fill: P.accentLt, opacity: 0.8 }),
    ]}),

    F(20, 556, 168, 44, P.accent, { r: 10, ch: [
      T('Promote claude-3-7', 0, 13, 168, 18, { size: 12, fill: P.fg, weight: 700, align: 'center' }),
    ]}),
    F(202, 556, 168, 44, P.surface2, { r: 10, stroke: P.border, ch: [
      T('Export Report', 0, 13, 168, 18, { size: 12, fill: P.fg2, weight: 600, align: 'center' }),
    ]}),

    BottomNav(2),
  ]});
}

// ── Screen 4: New Eval ────────────────────────────────────────────────────────
function screenNewEval(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    F(0, 0, 390, 56, P.bg, { ch: [
      T('✕ Cancel', 20, 18, 70, 20, { size: 12, fill: P.fg2 }),
      T('New Evaluation', 90, 18, 210, 20, { size: 13, fill: P.fg, weight: 700, align: 'center' }),
      T('Run →', 320, 18, 50, 20, { size: 12, fill: P.accent, weight: 700, align: 'right' }),
      Line(0, 55, 390),
    ]}),

    F(20, 64, 350, 3, P.surface2, { r: 2 }),
    F(20, 64, 116, 3, P.accent,   { r: 2 }),
    T('STEP 1 OF 3 — CONFIGURE', 20, 74, 220, 11, { size: 9, fill: P.accent, ls: 1.5, weight: 700 }),

    T('DATASET', 20, 96, 100, 11, { size: 9, fill: P.fg3, ls: 2, weight: 700 }),
    F(20, 112, 350, 48, P.surface, { r: 10, stroke: P.accent+'60', sw: 1.5, ch: [
      T('coding-bench-v2', 14, 14, 260, 18, { size: 13, fill: P.fg, weight: 600 }),
      T('119 prompts · code · updated Mar 18', 14, 34, 290, 12, { size: 10, fill: P.fg2 }),
    ]}),

    T('MODELS', 20, 172, 100, 11, { size: 9, fill: P.fg3, ls: 2, weight: 700 }),
    T('Model A (test)', 20, 188, 160, 12, { size: 10, fill: P.fg2 }),
    F(20, 204, 350, 44, P.surface, { r: 10, stroke: P.border, ch: [
      Dot(14, 18, P.pass),
      T('claude-3-7-sonnet-20250219', 30, 14, 290, 16, { size: 13, fill: P.fg, weight: 600 }),
      T('↓', 332, 14, 14, 16, { size: 14, fill: P.fg3, align: 'center' }),
    ]}),
    T('Model B (baseline)', 20, 260, 160, 12, { size: 10, fill: P.fg2 }),
    F(20, 276, 350, 44, P.surface, { r: 10, stroke: P.border, ch: [
      Dot(14, 18, P.fg3),
      T('gpt-4o-2024-11-20', 30, 14, 290, 16, { size: 13, fill: P.fg, weight: 600 }),
      T('↓', 332, 14, 14, 16, { size: 14, fill: P.fg3, align: 'center' }),
    ]}),

    T('EVAL METRICS', 20, 334, 120, 11, { size: 9, fill: P.fg3, ls: 2, weight: 700 }),

    ...[
      ['Correctness', true], ['Code Quality', true], ['Security', true],
      ['Style Match', false], ['Latency', false],
    ].map(([label, on], i) =>
      F(20, 352 + i*44, 350, 36, on ? P.accentDim : P.surface, {
        r: 8, stroke: on ? P.accent+'50' : P.border, ch: [
          F(10, 10, 16, 16, on ? P.accent : P.surface2, { r: 4, ch: [
            on ? T('✓', 2, 1, 12, 14, { size: 11, fill: P.fg, weight: 700 }) : null,
          ].filter(Boolean) }),
          T(label, 34, 10, 290, 16, { size: 12, fill: on ? P.fg : P.fg2 }),
        ],
      })
    ),

    F(20, 580, 350, 44, P.surface2, { r: 10, stroke: P.border, ch: [
      T('Estimated cost: ~$0.43', 14, 12, 200, 14, { size: 12, fill: P.fg2 }),
      T('~3 min run time', 14, 28, 200, 12, { size: 11, fill: P.fg3 }),
      T('3 metrics', 286, 12, 64, 14, { size: 12, fill: P.accent, align: 'right' }),
    ]}),

    F(20, 634, 350, 52, P.accent, { r: 12, ch: [
      T('RUN EVALUATION', 0, 15, 350, 22, { size: 14, fill: P.fg, weight: 800, align: 'center', ls: 2 }),
    ]}),

    BottomNav(3),
  ]});
}

// ── Screen 5: Regression Alert ────────────────────────────────────────────────
function screenRegression(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    F(0, 0, 390, 56, P.bg, { ch: [
      T('← Back', 20, 18, 60, 20, { size: 12, fill: P.accent }),
      T('Regression Alert', 80, 18, 230, 20, { size: 13, fill: P.fg, weight: 700, align: 'center' }),
      ScoreBadge(286, 16, 'REGRESSED', 'FAIL'),
      Line(0, 55, 390),
    ]}),

    // Alert banner
    F(0, 56, 390, 52, P.failD, { ch: [
      T('⚠  Score dropped 11.2pp vs last run', 20, 16, 320, 14, { size: 12, fill: P.fail, weight: 600 }),
      T('coding-bench-v2 · claude-3-7 · Mar 20', 20, 34, 300, 12, { size: 11, fill: P.fail, opacity: 0.7 }),
      Line(0, 51, 390, P.fail+'30'),
    ]}),

    // Before / After
    T('SCORE CHANGE', 20, 122, 180, 11, { size: 9, fill: P.fg3, ls: 2, weight: 700 }),
    F(20, 138, 164, 72, P.surface, { r: 10, stroke: P.border, ch: [
      T('BEFORE', 14, 10, 80, 10, { size: 9, fill: P.fg3, ls: 1.5 }),
      T('91.2%', 14, 26, 120, 32, { size: 24, fill: P.pass, weight: 800 }),
      T('run-03-17', 14, 58, 100, 11, { size: 9, fill: P.fg3 }),
    ]}),
    T('→', 190, 162, 16, 28, { size: 20, fill: P.fg3, align: 'center' }),
    F(212, 138, 158, 72, P.surface, { r: 10, stroke: P.fail+'40', ch: [
      T('AFTER', 14, 10, 80, 10, { size: 9, fill: P.fail, ls: 1.5 }),
      T('80.0%', 14, 26, 120, 32, { size: 24, fill: P.fail, weight: 800 }),
      T('run-03-20', 14, 58, 100, 11, { size: 9, fill: P.fg3 }),
    ]}),

    T('AFFECTED CATEGORIES', 20, 226, 240, 11, { size: 9, fill: P.fg3, ls: 2, weight: 700 }),

    ...[
      ['Security Review', 0.62, 0.48, P.fail],
      ['Test Writing',    0.76, 0.63, P.fail],
      ['Debugging',       0.89, 0.84, P.warn],
      ['Code Generation', 0.94, 0.93, P.fg3],
    ].map(([cat, before, after, color], i) => [
      F(20, 244 + i*50, 350, 42, P.surface, { r: 8, stroke: color !== P.fg3 ? color+'30' : P.border, ch: [
        T(cat, 14, 8, 160, 13, { size: 11, fill: P.fg }),
        T(`${Math.round(before*100)}% → ${Math.round(after*100)}%`, 14, 26, 180, 12, { size: 10, fill: color }),
        T(`−${Math.round((before-after)*100)}pp`, 290, 8, 56, 13, { size: 12, fill: color, weight: 700, align: 'right' }),
        ...ScoreBar(14, 38, 322, after, color),
      ]}),
    ]).flat(),

    T('LIKELY CAUSE', 20, 450, 180, 11, { size: 9, fill: P.fg3, ls: 2, weight: 700 }),
    F(20, 466, 350, 72, P.surface, { r: 10, stroke: P.border, ch: [
      T('System prompt change detected', 14, 12, 290, 14, { size: 12, fill: P.fg, weight: 600 }),
      T('commit 7a3f9e · "tighten safety rules"', 14, 30, 300, 13, { size: 11, fill: P.diff, weight: 500 }),
      Line(14, 48, 322),
      T('Changed 2 days before regression', 14, 58, 290, 12, { size: 11, fill: P.fg2 }),
    ]}),

    F(20, 552, 164, 44, P.failD, { r: 10, stroke: P.fail+'40', ch: [
      T('Revert Prompt', 0, 13, 164, 18, { size: 12, fill: P.fail, weight: 700, align: 'center' }),
    ]}),
    F(200, 552, 170, 44, P.accent, { r: 10, ch: [
      T('Investigate Diff', 0, 13, 170, 18, { size: 12, fill: P.fg, weight: 700, align: 'center' }),
    ]}),

    F(20, 606, 350, 44, P.surface2, { r: 10, stroke: P.border, ch: [
      T('Mark as expected — suppress future alerts', 14, 14, 300, 16, { size: 12, fill: P.fg2 }),
      T('›', 334, 14, 8, 16, { size: 14, fill: P.fg3 }),
    ]}),

    BottomNav(0),
  ]});
}

// ── Assemble ──────────────────────────────────────────────────────────────────
const SCREEN_W = 390, GAP = 80;
const doc = {
  version: '2.8', name: 'EVALPRO — AI Model Evaluation Platform',
  width: 5 * SCREEN_W + 6 * GAP, height: 844, fill: P.bg,
  children: [
    screenDashboard(GAP),
    screenRunDetail(GAP + (SCREEN_W + GAP)),
    screenCompare  (GAP + (SCREEN_W + GAP) * 2),
    screenNewEval  (GAP + (SCREEN_W + GAP) * 3),
    screenRegression(GAP + (SCREEN_W + GAP) * 4),
  ],
};

const penPath = path.join(__dirname, 'evalpro.pen');
fs.writeFileSync(penPath, JSON.stringify(doc, null, 2));
console.log(`✓ evalpro.pen — ${Math.round(fs.statSync(penPath).size / 1024)} KB`);
console.log('  Screens: Dashboard · Run Detail · Model Compare · New Eval · Regression Alert');
console.log('  Palette: Linear-exact #08090A · #5E6AD2 · #22C55E · #EF4444');

const penJson = fs.readFileSync(penPath, 'utf8');

// ── CSS Tokens ────────────────────────────────────────────────────────────────
const CSS_TOKENS = `:root {
  /* Color Scale */
  --color-bg:        ${P.bg};
  --color-surface:   ${P.surface};
  --color-surface2:  ${P.surface2};
  --color-surface3:  ${P.surface3};
  --color-border:    ${P.border};
  --color-border2:   ${P.border2};
  --color-fg:        ${P.fg};
  --color-fg2:       ${P.fg2};
  --color-fg3:       ${P.fg3};

  /* Brand */
  --color-accent:    ${P.accent};
  --color-accent-lt: ${P.accentLt};
  --color-accent-dim:${P.accentDim};

  /* Semantic */
  --color-pass:      ${P.pass};
  --color-fail:      ${P.fail};
  --color-warn:      ${P.warn};
  --color-diff:      ${P.diff};

  /* Typography */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
  --font-mono: 'SF Mono', 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;

  /* Spacing (4px base) */
  --sp-1:4px; --sp-2:8px; --sp-3:12px; --sp-4:16px;
  --sp-5:20px; --sp-6:24px; --sp-7:32px; --sp-8:48px;

  /* Radius */
  --r-sm:4px; --r-md:8px; --r-lg:10px; --r-full:9999px;
}`;

const PALETTE = [
  { name:'Background', hex:P.bg }, { name:'Surface',    hex:P.surface },
  { name:'Surface 2',  hex:P.surface2 }, { name:'Fg Primary', hex:P.fg },
  { name:'Fg Muted',   hex:P.fg2 }, { name:'Accent',    hex:P.accent },
  { name:'Pass',       hex:P.pass }, { name:'Fail',      hex:P.fail },
  { name:'Warn',       hex:P.warn }, { name:'Diff',      hex:P.diff },
];

// ── Hero HTML ─────────────────────────────────────────────────────────────────
function buildHeroHTML() {
  const encoded = Buffer.from(penJson).toString('base64');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>EVALPRO — AI Model Evaluation · RAM Design Studio</title>
<meta name="description" content="Dark-mode AI eval platform using Linear's exact palette. 5 screens + brand spec + CSS tokens.">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:${P.bg};color:${P.fg};font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif;min-height:100vh;-webkit-font-smoothing:antialiased}
a{text-decoration:none}
nav{padding:18px 40px;border-bottom:1px solid ${P.border};display:flex;justify-content:space-between;align-items:center}
.logo{font-size:13px;font-weight:700;letter-spacing:3px;color:${P.accent}}
.nav-r{font-size:11px;color:${P.fg3}}
.hero{padding:72px 40px 48px;max-width:880px}
.badge{display:inline-flex;align-items:center;gap:8px;background:${P.accentDim};border:1px solid ${P.accent}50;border-radius:999px;padding:5px 14px;font-size:11px;font-weight:600;letter-spacing:1px;color:${P.accentLt};margin-bottom:24px}
.dot{width:7px;height:7px;border-radius:50%;background:${P.pass};animation:pulse 2s ease-in-out infinite;display:inline-block}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
h1{font-size:clamp(52px,9vw,96px);font-weight:700;letter-spacing:-3px;line-height:1;margin-bottom:16px}
.accent{color:${P.accent}}
.sub{font-size:17px;line-height:1.65;color:${P.fg2};max-width:520px;margin-bottom:36px}
.meta{display:flex;gap:28px;margin-bottom:36px;flex-wrap:wrap}
.mi{font-size:12px}
.mi span{display:block;font-size:9px;color:${P.fg3};letter-spacing:1.5px;margin-bottom:4px}
.mi strong{color:${P.accentLt}}
.actions{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:64px}
.btn{padding:11px 22px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:none;transition:all .15s;font-family:inherit;display:inline-flex;align-items:center;gap:6px}
.btn-p{background:${P.accent};color:#fff}.btn-p:hover{background:${P.accentLt}}
.btn-s{background:${P.surface};color:${P.fg};border:1px solid ${P.border}}.btn-s:hover{border-color:${P.accent}}
.sec-lbl{font-size:10px;letter-spacing:2.5px;color:${P.fg3};font-weight:700;padding:0 40px 18px}
.strip{display:flex;gap:14px;overflow-x:auto;padding:0 40px 40px;scrollbar-width:thin;scrollbar-color:${P.border} transparent}
.sthumb{flex:0 0 210px;background:${P.surface};border:1px solid ${P.border};border-radius:10px;overflow:hidden;cursor:pointer;transition:border-color .2s,transform .2s}
.sthumb:hover{border-color:${P.accent};transform:translateY(-2px)}
.svis{height:155px;position:relative;overflow:hidden;background:${P.surface2}}
.sv-top{position:absolute;top:0;left:0;right:0;height:13px;background:${P.surface};border-bottom:1px solid ${P.border}}
.sv-card{position:absolute;background:${P.surface3};border:1px solid ${P.border};border-radius:3px}
.sv-bar{position:absolute;height:3px;border-radius:2px}
.sinfo{padding:11px 13px}
.sinfo strong{display:block;font-size:13px;color:${P.fg};margin-bottom:3px}
.sinfo span{font-size:11px;color:${P.fg2}}
.brand{padding:0 40px 56px}
.spec-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px}
.spec-card{background:${P.surface};border:1px solid ${P.border};border-radius:10px;padding:22px}
.spec-card h3{font-size:10px;font-weight:700;letter-spacing:2px;color:${P.fg3};margin-bottom:16px}
.palette{display:flex;flex-wrap:wrap;gap:12px}
.sw{display:flex;align-items:center;gap:8px}
.sw-dot{width:26px;height:26px;border-radius:6px;border:1px solid ${P.border2};flex-shrink:0}
.sw-name{font-size:10px;color:${P.fg2};display:block}
.sw-hex{font-size:10px;color:${P.fg3};font-family:monospace}
.type-rows{display:flex;flex-direction:column;gap:10px}
.tr{display:flex;align-items:baseline;gap:12px}
.tl{font-size:9px;color:${P.fg3};width:34px;flex-shrink:0;letter-spacing:.5px}
.sp-rows{display:flex;flex-direction:column;gap:7px}
.sp-row{display:flex;align-items:center;gap:10px}
.sp-bar{height:5px;background:${P.accent};border-radius:3px;opacity:.65}
.sp-lbl{font-size:10px;color:${P.fg3}}
.principles{display:flex;gap:10px;flex-wrap:wrap}
.principle{background:${P.accentDim};border:1px solid ${P.accent}40;border-radius:8px;padding:8px 13px;font-size:12px;color:${P.accentLt}}
.tokens{padding:0 40px 56px}
.tk-block{background:#050608;border:1px solid ${P.border};border-radius:10px;padding:22px;overflow-x:auto;position:relative}
.tk-block pre{font-family:'SF Mono','JetBrains Mono',monospace;font-size:12px;color:${P.fg2};line-height:1.8;white-space:pre}
.copy-btn{position:absolute;top:14px;right:14px;background:${P.accentDim};border:1px solid ${P.accent}50;color:${P.accentLt};padding:5px 13px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit}
.copy-btn:hover{background:${P.accent};color:#fff}
.prompt-sec{padding:0 40px 56px}
.plbl{font-size:10px;letter-spacing:2px;color:${P.accent};font-weight:700;margin-bottom:14px}
.ptext{font-size:17px;font-style:italic;color:${P.fg2};line-height:1.7;border-left:2px solid ${P.accent};padding-left:22px;max-width:680px}
.prd{padding:0 40px 56px}
.prd-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
@media(max-width:680px){.prd-grid{grid-template-columns:1fr}}
.prd-card{background:${P.surface};border:1px solid ${P.border};border-radius:10px;padding:22px}
.prd-card h3{font-size:12px;font-weight:700;color:${P.accent};margin-bottom:10px}
.prd-card p,.prd-card li{font-size:13px;color:${P.fg2};line-height:1.75}
.prd-card ul{padding-left:16px}
.prd-card li{margin-bottom:5px}
footer{padding:28px 40px;border-top:1px solid ${P.border};display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;font-size:11px;color:${P.fg3}}
.toast{position:fixed;bottom:22px;right:22px;background:${P.surface};border:1px solid ${P.accent};color:${P.fg};padding:10px 18px;border-radius:8px;font-size:12px;opacity:0;pointer-events:none;transition:opacity .25s;z-index:9999}
.toast.show{opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">◈ RAM DESIGN STUDIO</div>
  <div class="nav-r">HEARTBEAT · ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}).toUpperCase()}</div>
</nav>

<section class="hero">
  <div class="badge"><span class="dot"></span>RAM DESIGN STUDIO · HEARTBEAT</div>
  <h1>EVAL<span class="accent">PRO</span></h1>
  <p class="sub">AI Model Evaluation &amp; Regression Testing — Linear's exact palette, no decorative glows. Pure function.</p>
  <div class="meta">
    <div class="mi"><span>SCREENS</span><strong>5 MOBILE</strong></div>
    <div class="mi"><span>INSPIRATION</span><strong>LINEAR × LAND-BOOK</strong></div>
    <div class="mi"><span>BG PALETTE</span><strong>#08090A + #5E6AD2</strong></div>
    <div class="mi"><span>CSS TOKENS</span><strong>✓ INCLUDED</strong></div>
  </div>
  <div class="actions">
    <button class="btn btn-p" onclick="openViewer()">☰ Open in Viewer</button>
    <button class="btn btn-s" onclick="downloadPen()">↓ Download .pen</button>
    <button class="btn btn-s" onclick="copyTokens()">◈ Copy Tokens</button>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ Copy Prompt</button>
    <button class="btn btn-s" onclick="shareOnX()">𝕏 Share</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<p class="sec-lbl">SCREENS · 5 MOBILE · 390 × 844</p>
<div class="strip">
  <!-- 1: Dashboard -->
  <div class="sthumb" onclick="openViewer()">
    <div class="svis">
      <div class="sv-top"></div>
      <div class="sv-card" style="left:8px;top:17px;right:8px;height:9px;"></div>
      <div class="sv-card" style="left:8px;top:30px;width:82px;height:38px;"></div>
      <div class="sv-card" style="right:8px;top:30px;width:76px;height:38px;"></div>
      <div class="sv-card" style="left:8px;top:72px;width:82px;height:38px;"></div>
      <div class="sv-card" style="right:8px;top:72px;width:76px;height:38px;"></div>
      <div class="sv-card" style="left:8px;top:114px;right:8px;height:12px;"></div>
      <div class="sv-card" style="left:8px;top:130px;right:8px;height:9px;"></div>
      <div class="sv-bar" style="left:8px;bottom:10px;width:180px;background:${P.warn}"></div>
    </div>
    <div class="sinfo"><strong>Eval Dashboard</strong><span>Bento metrics + run feed</span></div>
  </div>
  <!-- 2: Run Detail -->
  <div class="sthumb" onclick="openViewer()">
    <div class="svis">
      <div class="sv-top"></div>
      <div class="sv-card" style="left:8px;top:17px;right:8px;height:28px;"></div>
      ${[94,89,87,91,76,62].map((v,i)=>`<div style="position:absolute;left:8px;top:${50+i*16}px;right:8px;height:4px;background:${P.surface3};border-radius:2px;"><div style="position:absolute;left:0;top:0;width:${v}%;height:100%;border-radius:2px;background:${v>=85?P.pass:v>=75?P.warn:P.fail};opacity:.8;"></div></div>`).join('')}
      <div class="sv-card" style="left:8px;bottom:8px;right:8px;height:32px;"></div>
    </div>
    <div class="sinfo"><strong>Run Detail</strong><span>Category scores + fails</span></div>
  </div>
  <!-- 3: Compare -->
  <div class="sthumb" onclick="openViewer()">
    <div class="svis">
      <div class="sv-top"></div>
      <div class="sv-card" style="left:0;top:13px;width:104px;height:16px;border-radius:0;"></div>
      <div class="sv-card" style="right:0;top:13px;width:104px;height:16px;border-radius:0;"></div>
      ${[0,1,2,3,4,5].map(i=>`<div style="position:absolute;left:0;right:0;top:${34+i*19}px;height:17px;background:${i%2===0?P.surface+'55':'transparent'};"><div style="position:absolute;left:6px;top:7px;width:${48+i*2}px;height:3px;background:${P.pass};border-radius:2px;opacity:.7;"></div><div style="position:absolute;right:6px;top:7px;width:${36+i*2}px;height:3px;background:${P.fg3};border-radius:2px;opacity:.5;"></div></div>`).join('')}
    </div>
    <div class="sinfo"><strong>Model Compare</strong><span>Category delta table</span></div>
  </div>
  <!-- 4: New Eval -->
  <div class="sthumb" onclick="openViewer()">
    <div class="svis">
      <div class="sv-top"></div>
      <div class="sv-bar" style="left:8px;top:17px;width:50px;background:${P.accent}"></div>
      <div class="sv-card" style="left:8px;top:24px;right:8px;height:19px;border-color:${P.accent}50;"></div>
      <div class="sv-card" style="left:8px;top:47px;right:8px;height:17px;"></div>
      <div class="sv-card" style="left:8px;top:68px;right:8px;height:17px;"></div>
      ${[0,1,2,3,4].map(i=>`<div class="sv-card" style="left:8px;top:${90+i*13}px;right:8px;height:10px;background:${i<3?P.accentDim:P.surface3};border-color:${i<3?P.accent+'30':P.border};"></div>`).join('')}
      <div class="sv-card" style="left:8px;bottom:8px;right:8px;height:18px;background:${P.accent}30;border-color:${P.accent}50;"></div>
    </div>
    <div class="sinfo"><strong>New Evaluation</strong><span>Dataset + model config</span></div>
  </div>
  <!-- 5: Regression -->
  <div class="sthumb" onclick="openViewer()">
    <div class="svis">
      <div class="sv-top"></div>
      <div class="sv-card" style="left:0;top:13px;right:0;height:18px;background:${P.failD};border-radius:0;border-color:${P.fail}30;"></div>
      <div style="position:absolute;left:8px;top:35px;display:flex;gap:4px;">
        <div class="sv-card" style="position:relative;width:78px;height:26px;"></div>
        <div class="sv-card" style="position:relative;width:78px;height:26px;border-color:${P.fail}40;"></div>
      </div>
      ${[P.fail,P.fail,P.warn,P.fg3].map((c,i)=>`<div class="sv-card" style="position:absolute;left:8px;top:${67+i*17}px;right:8px;height:13px;border-color:${c}30;border-left:2px solid ${c};"></div>`).join('')}
      <div style="position:absolute;left:8px;bottom:8px;right:8px;display:flex;gap:4px;">
        <div class="sv-card" style="position:relative;flex:1;height:15px;background:${P.failD};border-color:${P.fail}40;"></div>
        <div class="sv-card" style="position:relative;flex:1;height:15px;background:${P.accentDim};"></div>
      </div>
    </div>
    <div class="sinfo"><strong>Regression Alert</strong><span>Score drop triage</span></div>
  </div>
</div>

<p class="sec-lbl">BRAND SPECIFICATION</p>
<div class="brand">
  <div class="spec-grid">
    <div class="spec-card" style="grid-column:1/-1;">
      <h3>COLOR PALETTE</h3>
      <div class="palette">
        ${PALETTE.map(c=>`<div class="sw"><div class="sw-dot" style="background:${c.hex};"></div><div><span class="sw-name">${c.name}</span><span class="sw-hex">${c.hex}</span></div></div>`).join('')}
      </div>
    </div>
    <div class="spec-card">
      <h3>TYPE SCALE</h3>
      <div class="type-rows">
        <div class="tr"><span class="tl">DISP</span><span style="font-size:34px;font-weight:700;letter-spacing:-1px;line-height:1">EVALPRO</span></div>
        <div class="tr"><span class="tl">H1</span><span style="font-size:20px;font-weight:700">Model Evaluation</span></div>
        <div class="tr"><span class="tl">H2</span><span style="font-size:15px;font-weight:600">Run Detail</span></div>
        <div class="tr"><span class="tl">BODY</span><span style="font-size:13px;color:${P.fg2}">Category scores and failures</span></div>
        <div class="tr"><span class="tl">SM</span><span style="font-size:11px;color:${P.fg2}">Eval metric label</span></div>
        <div class="tr"><span class="tl">LABEL</span><span style="font-size:9px;color:${P.fg3};letter-spacing:2px;font-weight:700">EVAL METRICS</span></div>
        <div class="tr"><span class="tl">MONO</span><span style="font-size:11px;font-family:monospace;color:${P.accent}">run-0320-a</span></div>
      </div>
    </div>
    <div class="spec-card">
      <h3>SPACING · 4PX BASE</h3>
      <div class="sp-rows">
        ${[4,8,12,16,20,24,32,48].map(s=>`<div class="sp-row"><div class="sp-bar" style="width:${s*3}px;"></div><span class="sp-lbl">${s}px</span></div>`).join('')}
      </div>
    </div>
    <div class="spec-card" style="grid-column:1/-1;">
      <h3>DESIGN PRINCIPLES</h3>
      <div class="principles">
        <div class="principle">◈ Function before decoration</div>
        <div class="principle">↔ Comparative clarity</div>
        <div class="principle">⚠ Semantic: pass / fail / warn / diff</div>
        <div class="principle">⊞ Bento grid density</div>
        <div class="principle">→ Linear's exact palette — no glows</div>
        <div class="principle">↺ Regression-first mental model</div>
      </div>
    </div>
  </div>
</div>

<p class="sec-lbl">CSS DESIGN TOKENS</p>
<div class="tokens">
  <div class="tk-block">
    <button class="copy-btn" id="copyBtn" onclick="copyTokens()">COPY TOKENS</button>
    <pre>${CSS_TOKENS.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
  </div>
</div>

<p class="sec-lbl">ORIGINAL PROMPT</p>
<div class="prompt-sec">
  <div class="plbl">WHAT I SET OUT TO DESIGN</div>
  <p class="ptext">"${PROMPT}"</p>
</div>

<p class="sec-lbl">PRODUCT BRIEF</p>
<div class="prd">
  <div class="prd-grid">
    <div class="prd-card">
      <h3>Overview</h3>
      <p>EVALPRO is a mobile-first AI model evaluation platform for teams shipping LLMs in production. It tracks eval runs, surfaces regressions before they ship, and enables fast model comparison — so engineers know exactly when and why quality degraded.</p>
    </div>
    <div class="prd-card">
      <h3>Target Users</h3>
      <ul>
        <li>ML engineers running A/B model comparisons</li>
        <li>Platform teams maintaining eval benchmarks</li>
        <li>Product engineers triaging quality regressions</li>
        <li>AI safety reviewers auditing model behavior</li>
      </ul>
    </div>
    <div class="prd-card">
      <h3>Core Features</h3>
      <ul>
        <li>Eval dashboard with bento-grid metric summary</li>
        <li>Per-run score breakdown by category with bars</li>
        <li>Side-by-side model delta comparison table</li>
        <li>Regression alerts with diff-to-cause tracing</li>
        <li>New eval config with cost + time estimation</li>
      </ul>
    </div>
    <div class="prd-card">
      <h3>Design Language</h3>
      <ul>
        <li>Linear.app exact: #08090A · #F7F8F8 · #5E6AD2</li>
        <li>No decorative glows — pure structural contrast</li>
        <li>Semantic: green/yellow/red/violet for eval states</li>
        <li>Inter sans for UI; monospace for run IDs</li>
        <li>4px base grid, 10px card radius, 8px input radius</li>
      </ul>
    </div>
    <div class="prd-card">
      <h3>Inspiration</h3>
      <ul>
        <li><strong>Linear.app</strong> — from darkmodedesign.com (2026-03-20)</li>
        <li><strong>land-book.com</strong> — AI-SaaS wave: Runlayer MCPs, Anchor, bakedwith</li>
        <li><strong>godly.website</strong> — Haptic precision-instrument aesthetic</li>
        <li>Trend: "functional dark" overtaking "cosmic dark" in dev tools</li>
      </ul>
    </div>
    <div class="prd-card">
      <h3>Screen Architecture</h3>
      <ul>
        <li><strong>Dashboard</strong> — 4-cell bento + run feed + regression CTA</li>
        <li><strong>Run Detail</strong> — category score bars + failed example list</li>
        <li><strong>Model Compare</strong> — split-view per-category delta table</li>
        <li><strong>New Eval</strong> — 3-step: dataset → models → metrics</li>
        <li><strong>Regression</strong> — before/after + heatmap + cause + triage</li>
      </ul>
    </div>
  </div>
</div>

<footer>
  <span>RAM Design Studio · Heartbeat — ${new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</span>
  <a href="https://ram.zenbin.org/gallery" style="color:${P.fg3};opacity:.6;">ram.zenbin.org/gallery</a>
</footer>

<script>
const PEN_B64=${JSON.stringify(encoded)};
const PROMPT_STR=${JSON.stringify(PROMPT)};
const TOKENS_STR=${JSON.stringify(CSS_TOKENS)};
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2000)}
function openViewer(){try{const j=atob(PEN_B64);JSON.parse(j);localStorage.setItem('pv_pending',JSON.stringify({json:j,name:'evalpro.pen'}));window.open('https://zenbin.org/p/pen-viewer-3','_blank')}catch(e){alert(e.message)}}
function downloadPen(){const b=new Blob([atob(PEN_B64)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='evalpro.pen';a.click();URL.revokeObjectURL(a.href)}
function copyTokens(){navigator.clipboard.writeText(TOKENS_STR).then(()=>toast('Tokens copied ✓')).catch(()=>toast('Copy failed'))}
function copyPrompt(){navigator.clipboard.writeText(PROMPT_STR).then(()=>toast('Prompt copied ✓')).catch(()=>toast('Copy failed'))}
function shareOnX(){const t=encodeURIComponent('EVALPRO — AI Model Evaluation Platform. Linear-exact dark palette. 5 screens + CSS tokens by @RAM_Design_Studio');const u=encodeURIComponent(window.location.href);window.open('https://x.com/intent/tweet?text='+t+'&url='+u,'_blank')}
</script>
</body>
</html>`;
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function httpReq(opts, body) {
  return new Promise((res, rej) => {
    const r = https.request(opts, response => {
      const chunks = [];
      response.on('data', d => chunks.push(d));
      response.on('end', () => res({ status: response.statusCode, body: Buffer.concat(chunks).toString() }));
    });
    r.on('error', rej);
    if (body) r.write(body);
    r.end();
  });
}

function publish(slug, title, html) {
  const body = JSON.stringify({ title, html });
  return httpReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), 'X-Subdomain': 'ram' },
  }, body);
}

async function pushToGallery(heroUrl) {
  try {
    const qRes = await httpReq({
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/contents/queue.json`,
      method: 'GET',
      headers: { 'User-Agent': 'RAM-Design-Bot', 'Authorization': `token ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' },
    });
    const qData = JSON.parse(qRes.body);
    const queue = JSON.parse(Buffer.from(qData.content, 'base64').toString());
    queue.submissions = queue.submissions || [];
    queue.submissions.push({
      id: `hb-evalpro-${Date.now()}`, prompt: PROMPT.slice(0, 200),
      app_name: 'EVALPRO', archetype: 'developer-tools', credit: 'RAM Studio Heartbeat',
      submitted_at: new Date().toISOString(), status: 'done',
      design_url: heroUrl, published_at: new Date().toISOString(),
    });
    const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
    const upRes = await httpReq({
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/contents/queue.json`,
      method: 'PUT',
      headers: { 'User-Agent': 'RAM-Design-Bot', 'Authorization': `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json', 'Accept': 'application/vnd.github.v3+json' },
    }, JSON.stringify({ message: 'heartbeat: EVALPRO eval platform published', content, sha: qData.sha }));
    console.log(`  ${upRes.status < 300 ? '✓' : '⚠'} Gallery HTTP ${upRes.status}`);
  } catch (e) {
    console.log(`  ⚠ Gallery push failed: ${e.message}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('\n🎨 EVALPRO — Design Discovery Pipeline');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const heroHtml = buildHeroHTML();
  console.log(`  Hero HTML: ${(heroHtml.length / 1024).toFixed(1)} KB`);

  const viewerPath = path.join(__dirname, 'penviewer-app.html');
  let viewerHtml = fs.readFileSync(viewerPath, 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

  console.log(`\n  📤 Hero   → ram.zenbin.org/${SLUG}`);
  const r1 = await publish(SLUG, 'EVALPRO — AI Model Evaluation · RAM Design Studio', heroHtml);
  console.log(`  ${r1.status < 300 ? '✓' : '✗'} HTTP ${r1.status}`);

  console.log(`  📤 Viewer → ram.zenbin.org/${SLUG}-viewer`);
  const r2 = await publish(`${SLUG}-viewer`, 'EVALPRO — Viewer · RAM Design Studio', viewerHtml);
  console.log(`  ${r2.status < 300 ? '✓' : '✗'} HTTP ${r2.status}`);

  const heroUrl = `https://ram.zenbin.org/${SLUG}`;
  console.log('\n  📋 Pushing to gallery...');
  await pushToGallery(heroUrl);

  console.log('\n🔗 Live URLs:');
  console.log(`   Hero:   ${heroUrl}`);
  console.log(`   Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log('\n✅ Pipeline complete');
})();
