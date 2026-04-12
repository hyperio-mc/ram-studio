// flint-app.js — FLINT: PR review load, made legible
//
// Inspiration:
//   1. Factory (minimal.gallery SAAS, Mar 25 2026) — "factory.ai": crisp white
//      developer tooling UI, structured tabular data with color-coded status rows,
//      no-chrome interface where whitespace IS the design language.
//   2. Sort (minimal.gallery SAAS, Mar 25 2026) — clean tabular list UI with
//      left-edge colored status rules per row — imported directly as the PR row
//      pattern. Data-dense but never noisy.
//   3. Lucci Lambrusco (siteinspire.com, Mar 25 2026) — Bold all-caps editorial
//      typography stacked confidently. "BUBBLY. BALANCED. FRUIT-FORWARD." style
//      headline treatment applied to metrics — big numbers, no apology.
//   4. JetBrains Air (lapa.ninja top, Mar 25 2026) — Airy dev-tool aesthetic:
//      generous whitespace, Swiss grid, type as primary visual element.
//
// Challenge: Design a PR review workload tracker for engineering leads.
//   Style push: TABULAR EDITORIAL — master/detail list with left-rule status
//   indicators, large metric typography, and heat-strip capacity bars.
//   Breaking from card-stack defaults into structured, row-based data UI.
//   No design-y illustrations: all information graphics.
//
// Theme: LIGHT — #F6F4F0 warm paper + #141210 near-black + #2C5EE8 engineer blue
// Screens: 5 — Dashboard, Queue, Team, Velocity, Blockers

'use strict';
const fs = require('fs');
const W = 390, H = 844;
let idC = 1;
const uid = () => `c${idC++}`;

const p = {
  bg:         '#F6F4F0',
  surface:    '#FFFFFF',
  surfaceAlt: '#F0EDE8',
  text:       '#141210',
  textSub:    '#7A7670',
  textFaint:  '#C2BEB8',
  accent:     '#2C5EE8',
  accentLt:   '#EEF2FD',
  coral:      '#E05C3A',
  coralLt:    '#FDF0EC',
  green:      '#2BAD7B',
  greenLt:    '#E8F7F2',
  yellow:     '#D4870A',
  yellowLt:   '#FEF7E8',
  border:     '#E4E0DA',
};

const el = (type, x, y, w, h, props = {}) =>
  ({ id: uid(), type, x, y, width: w, height: h, ...props });

const rect = (x, y, w, h, fill, r = 0, props = {}) =>
  el('rectangle', x, y, w, h, { fill, cornerRadius: r, strokeWidth: 0, ...props });

const text = (x, y, w, h, content, size, weight, color, align = 'left', props = {}) =>
  el('text', x, y, w, h, {
    content, fontSize: size, fontWeight: weight, fill: color,
    textAlignHorizontal: align, ...props
  });

const hline = (x, y, w, color, opacity = 1) =>
  el('rectangle', x, y, w, 1, { fill: color, strokeWidth: 0, opacity });

const vline = (x, y, h, color, opacity = 1) =>
  el('rectangle', x, y, 1, h, { fill: color, strokeWidth: 0, opacity });

const screens = [];

function makeScreen(name, children) {
  const screen = {
    id: uid(), type: 'frame', name,
    x: 0, y: 0, width: W, height: H,
    fill: p.bg, children: children.filter(Boolean),
  };
  screens.push(screen);
  return screen;
}

function statusBar() {
  return [
    rect(0, 0, W, 44, p.surface),
    text(20, 14, 100, 16, '9:41', 12, '500', p.textSub),
    text(W - 80, 14, 70, 16, '●●● WiFi', 11, '400', p.textSub, 'right'),
  ];
}

// Left-rule status pill for PR rows
function prRow(y, { title, repo, author, age, status, size, isActive }) {
  const statusColor = {
    blocked:  p.coral,
    review:   p.accent,
    approved: p.green,
    stale:    p.yellow,
  }[status] || p.textSub;

  const statusLabel = {
    blocked:  'BLOCKED',
    review:   'IN REVIEW',
    approved: 'APPROVED',
    stale:    'STALE',
  }[status] || status.toUpperCase();

  const statusBg = {
    blocked:  p.coralLt,
    review:   p.accentLt,
    approved: p.greenLt,
    stale:    p.yellowLt,
  }[status] || p.surfaceAlt;

  const bg = isActive ? p.accentLt : p.surface;

  return [
    rect(20, y, W - 40, 72, bg, 8),
    rect(20, y, 3, 72, statusColor, 2),        // left-rule accent — Sort-inspired
    text(34, y + 10, 220, 14, title, 12, '600', p.text),
    text(34, y + 26, 200, 13, `${repo} · ${author}`, 10, '400', p.textSub),
    rect(34, y + 44, 0, 0, 'transparent'),      // spacer
    // Status chip
    rect(34, y + 44, 70, 18, statusBg, 9),
    text(34, y + 47, 70, 12, statusLabel, 8, '700', statusColor, 'center'),
    // Age
    text(W - 90, y + 10, 60, 13, age, 10, '400', p.textSub, 'right'),
    // Size dot
    rect(W - 35, y + 46, 0, 0, 'transparent'),
    text(W - 50, y + 44, 40, 18, size, 10, '500', p.textSub, 'right'),
    hline(20, y + 72, W - 40, p.border, 0.5),
  ];
}

// Horizontal stacked bar for team capacity
function capacityBar(y, { name, open, reviewing, mergeReady, total }) {
  const barW = W - 120;
  const openW   = Math.round(barW * open / total);
  const revW    = Math.round(barW * reviewing / total);
  const readyW  = Math.round(barW * mergeReady / total);

  return [
    text(20, y + 4, 80, 14, name, 11, '600', p.text),
    // stacked bar
    rect(110, y, barW, 22, p.surfaceAlt, 4),
    rect(110, y, openW, 22, p.accent, 4),
    rect(110 + openW, y, revW, 22, p.green, 0),
    rect(110 + openW + revW, y, readyW, 22, p.yellow, 0),
    text(110 + barW + 8, y + 4, 28, 14, `${total}`, 11, '700', p.text, 'right'),
  ];
}

// ============================================================
// SCREEN 1 — DASHBOARD
// ============================================================
makeScreen('Dashboard', [
  ...statusBar(),

  rect(0, 44, W, H - 44, p.bg),

  // Header
  text(20, 54, 240, 22, 'FLINT', 18, '800', p.text),
  text(20, 78, 200, 14, 'Pull request workload', 11, '400', p.textSub),

  // Date chip
  rect(W - 110, 58, 90, 22, p.accentLt, 11),
  text(W - 110, 62, 90, 14, 'Mar 25, 2026', 9, '600', p.accent, 'center'),

  hline(20, 106, W - 40, p.border),

  // Big metric row — Lucci Lambrusco editorial number treatment
  rect(20, 118, W - 40, 96, p.surface, 12),
  // Open PRs
  text(36, 130, 80, 48, '34', 42, '800', p.text),
  text(36, 178, 80, 13, 'Open PRs', 9, '500', p.textSub),
  vline(140, 130, 64, p.border),
  // Avg age
  text(156, 130, 80, 48, '3.2', 42, '800', p.accent),
  text(156, 178, 80, 13, 'Avg days', 9, '500', p.textSub),
  vline(260, 130, 64, p.border),
  // Blocked
  text(276, 130, 80, 48, '6', 42, '800', p.coral),
  text(276, 178, 80, 13, 'Blocked', 9, '500', p.textSub),

  // Status breakdown label
  text(20, 228, 200, 13, 'BY STATUS', 8, '700', p.textFaint),
  hline(20, 243, W - 40, p.border),

  // 4 status tiles
  ...[
    { label: 'Waiting Review', count: 18, color: p.accent, bg: p.accentLt },
    { label: 'Approved',       count: 10, color: p.green,  bg: p.greenLt  },
    { label: 'Changes Req.',   count: 6,  color: p.coral,  bg: p.coralLt  },
    { label: 'Stale (7d+)',    count: 4,  color: p.yellow, bg: p.yellowLt },
  ].map((s, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 20 + col * ((W - 52) / 2 + 12);
    const y = 252 + row * 84;
    const w = (W - 52) / 2;
    return [
      rect(x, y, w, 72, s.bg, 10),
      rect(x, y, 3, 72, s.color, 2),
      text(x + 14, y + 12, w - 20, 36, `${s.count}`, 30, '800', s.color),
      text(x + 14, y + 50, w - 20, 13, s.label, 9, '500', p.textSub),
    ];
  }).flat(),

  // Merge rate section
  text(20, 432, 200, 13, 'MERGE THROUGHPUT', 8, '700', p.textFaint),
  hline(20, 447, W - 40, p.border),

  rect(20, 456, W - 40, 60, p.surface, 10),
  // Weekly merge bars (7 days)
  ...[14, 9, 17, 12, 21, 8, 11].map((v, i) => {
    const maxH = 36;
    const bH   = Math.round(maxH * v / 21);
    const x    = 36 + i * 46;
    const days = ['M','T','W','T','F','S','S'];
    return [
      rect(x, 456 + maxH - bH + 8, 30, bH, i === 4 ? p.accent : p.accentLt, 3),
      text(x, 504, 30, 12, days[i], 9, '500', i === 4 ? p.text : p.textFaint, 'center'),
    ];
  }).flat(),
  rect(W - 80, 460, 0, 0, 'transparent'),
  text(W - 90, 460, 70, 13, '↑ 24%', 11, '700', p.green, 'right'),
  text(W - 90, 475, 70, 13, 'vs last wk', 9, '400', p.textSub, 'right'),

  // Reviewer load label
  text(20, 530, 200, 13, 'REVIEWER LOAD', 8, '700', p.textFaint),
  hline(20, 545, W - 40, p.border),

  ...[
    { name: 'Priya',   open: 8, reviewing: 3, mergeReady: 1, total: 12 },
    { name: 'Carlos',  open: 5, reviewing: 4, mergeReady: 2, total: 11 },
    { name: 'Mei',     open: 4, reviewing: 2, mergeReady: 0, total: 6  },
    { name: 'Jordan',  open: 3, reviewing: 1, mergeReady: 1, total: 5  },
  ].map((r, i) => capacityBar(554 + i * 38, r)).flat(),

  // Legend
  ...[
    { label: 'Open', color: p.accent },
    { label: 'Reviewing', color: p.green },
    { label: 'Ready', color: p.yellow },
  ].map((l, i) => [
    rect(20 + i * 80, 714, 8, 8, l.color, 2),
    text(32 + i * 80, 712, 60, 12, l.label, 9, '400', p.textSub),
  ]).flat(),

  // Bottom nav
  rect(0, H - 80, W, 80, p.surface),
  hline(0, H - 80, W, p.border),
  ...['Overview', 'Queue', 'Team', 'Velocity'].map((label, i) => {
    const x = i * (W / 4);
    const isActive = i === 0;
    return [
      rect(x, H - 80, W / 4, 80, isActive ? p.accentLt : 'transparent'),
      text(x, H - 52, W / 4, 13, label, 10, isActive ? '700' : '500',
           isActive ? p.accent : p.textSub, 'center'),
    ];
  }).flat(),
]);

// ============================================================
// SCREEN 2 — QUEUE (tabular PR list)
// ============================================================
makeScreen('Queue', [
  ...statusBar(),
  rect(0, 44, W, H - 44, p.bg),

  rect(0, 44, W, 48, p.surface),
  hline(0, 92, W, p.border),
  text(20, 56, 200, 20, 'PR Queue', 16, '700', p.text),
  // Filter chips
  ...['All 34','Review 18','Blocked 6'].map((label, i) => {
    const isActive = i === 0;
    return [
      rect(W - 240 + i * 78, 58, 72, 22, isActive ? p.accent : p.surfaceAlt, 11),
      text(W - 240 + i * 78, 62, 72, 14, label, 9, '600',
           isActive ? p.surface : p.textSub, 'center'),
    ];
  }).flat(),

  // Sort header row
  rect(20, 96, W - 40, 24, p.surfaceAlt, 4),
  text(26, 101, 160, 13, 'PULL REQUEST', 8, '700', p.textFaint),
  text(W - 90, 101, 60, 13, 'AGE', 8, '700', p.textFaint, 'right'),
  text(W - 40, 101, 30, 13, 'SZ', 8, '700', p.textFaint, 'right'),

  // PR rows
  ...[
    { title: 'refactor: auth middleware cleanup',    repo: 'api-core',  author: 'priya',  age: '4d', status: 'blocked',  size: 'L',  isActive: true  },
    { title: 'feat: webhook retry with backoff',     repo: 'events',    author: 'carlos', age: '2d', status: 'review',   size: 'M',  isActive: false },
    { title: 'fix: race condition in job queue',     repo: 'workers',   author: 'mei',    age: '6d', status: 'stale',    size: 'S',  isActive: false },
    { title: 'feat: multi-tenant org switching',     repo: 'app',       author: 'jordan', age: '1d', status: 'review',   size: 'XL', isActive: false },
    { title: 'chore: update eslint to v9',           repo: 'shared',    author: 'priya',  age: '3d', status: 'approved', size: 'S',  isActive: false },
    { title: 'feat: dashboard metric caching',       repo: 'api-core',  author: 'carlos', age: '5d', status: 'blocked',  size: 'M',  isActive: false },
    { title: 'test: add e2e for billing flow',       repo: 'app',       author: 'mei',    age: '1d', status: 'review',   size: 'M',  isActive: false },
  ].map((pr, i) => prRow(124 + i * 80, pr)).flat(),

  // Bottom nav
  rect(0, H - 80, W, 80, p.surface),
  hline(0, H - 80, W, p.border),
  ...['Overview', 'Queue', 'Team', 'Velocity'].map((label, i) => {
    const isActive = i === 1;
    return [
      rect(i * (W / 4), H - 80, W / 4, 80, isActive ? p.accentLt : 'transparent'),
      text(i * (W / 4), H - 52, W / 4, 13, label, 10, isActive ? '700' : '500',
           isActive ? p.accent : p.textSub, 'center'),
    ];
  }).flat(),
]);

// ============================================================
// SCREEN 3 — TEAM CAPACITY
// ============================================================
makeScreen('Team', [
  ...statusBar(),
  rect(0, 44, W, H - 44, p.bg),

  rect(0, 44, W, 48, p.surface),
  hline(0, 92, W, p.border),
  text(20, 56, 200, 20, 'Team Capacity', 16, '700', p.text),
  text(W - 80, 64, 60, 12, 'This week', 10, '400', p.textSub, 'right'),

  // Team load overview card
  rect(20, 100, W - 40, 88, p.surface, 12),
  text(34, 112, 180, 13, 'TEAM BANDWIDTH', 8, '700', p.textFaint),
  hline(34, 127, W - 68, p.border),
  // Big utilisation number
  text(34, 136, 80, 40, '73%', 32, '800', p.accent),
  text(34, 176, 120, 13, 'overall utilisation', 9, '400', p.textSub),
  // Mini trend
  text(W - 100, 136, 80, 40, '↑4pp', 20, '700', p.green, 'right'),
  text(W - 100, 174, 80, 14, 'vs last wk', 9, '400', p.textSub, 'right'),

  // Individual capacity bars
  text(20, 200, 200, 13, 'INDIVIDUAL LOAD', 8, '700', p.textFaint),
  hline(20, 215, W - 40, p.border),

  rect(20, 222, W - 40, 380, p.surface, 12),
  ...[
    { name: 'Priya K.',  open: 8, reviewing: 3, mergeReady: 1, total: 12, pct: 0.92 },
    { name: 'Carlos M.', open: 5, reviewing: 4, mergeReady: 2, total: 11, pct: 0.84 },
    { name: 'Mei L.',    open: 4, reviewing: 2, mergeReady: 0, total: 6,  pct: 0.46 },
    { name: 'Jordan T.', open: 3, reviewing: 1, mergeReady: 1, total: 5,  pct: 0.38 },
    { name: 'Aisha R.',  open: 6, reviewing: 2, mergeReady: 0, total: 8,  pct: 0.62 },
    { name: 'Dev P.',    open: 2, reviewing: 0, mergeReady: 0, total: 2,  pct: 0.15 },
  ].map((reviewer, i) => {
    const y = 236 + i * 60;
    const barW = W - 180;
    const alertColor = reviewer.pct > 0.85 ? p.coral : reviewer.pct > 0.65 ? p.yellow : p.green;
    return [
      // Avatar circle
      rect(34, y, 28, 28, reviewer.pct > 0.85 ? p.coralLt : p.accentLt, 14),
      text(34, y + 6, 28, 16, reviewer.name.charAt(0), 13, '700', reviewer.pct > 0.85 ? p.coral : p.accent, 'center'),
      // Name & PR count
      text(72, y + 2, 120, 14, reviewer.name, 12, '600', p.text),
      text(72, y + 18, 80, 13, `${reviewer.total} PRs`, 10, '400', p.textSub),
      // Utilisation bar
      rect(72, y + 36, barW, 8, p.surfaceAlt, 4),
      rect(72, y + 36, Math.round(barW * reviewer.pct), 8, alertColor, 4),
      // % label
      text(W - 56, y + 2, 40, 14, `${Math.round(reviewer.pct * 100)}%`, 12, '700', alertColor, 'right'),
      // Row divider
      hline(34, y + 52, W - 68, p.border, 0.5),
    ];
  }).flat(),

  // Overload alert
  rect(20, 616, W - 40, 56, p.coralLt, 10),
  rect(20, 616, 3, 56, p.coral, 2),
  text(34, 626, W - 60, 14, '⚠ Priya + Carlos above 80% load', 11, '600', p.coral),
  text(34, 642, W - 60, 13, 'Consider redistributing 3 PRs from Priya', 10, '400', p.textSub),

  // Legend
  ...[
    { label: 'OK (<65%)', color: p.green },
    { label: 'High (65–85%)', color: p.yellow },
    { label: 'Over (85%+)', color: p.coral },
  ].map((l, i) => [
    rect(20 + i * 115, 686, 8, 8, l.color, 2),
    text(32 + i * 115, 684, 90, 12, l.label, 9, '400', p.textSub),
  ]).flat(),

  // Bottom nav
  rect(0, H - 80, W, 80, p.surface),
  hline(0, H - 80, W, p.border),
  ...['Overview', 'Queue', 'Team', 'Velocity'].map((label, i) => {
    const isActive = i === 2;
    return [
      rect(i * (W / 4), H - 80, W / 4, 80, isActive ? p.accentLt : 'transparent'),
      text(i * (W / 4), H - 52, W / 4, 13, label, 10, isActive ? '700' : '500',
           isActive ? p.accent : p.textSub, 'center'),
    ];
  }).flat(),
]);

// ============================================================
// SCREEN 4 — VELOCITY (cycle time)
// ============================================================
makeScreen('Velocity', [
  ...statusBar(),
  rect(0, 44, W, H - 44, p.bg),

  rect(0, 44, W, 48, p.surface),
  hline(0, 92, W, p.border),
  text(20, 56, 200, 20, 'Velocity', 16, '700', p.text),
  // Period selector
  ...['4W', '8W', '12W'].map((label, i) => {
    const isActive = i === 0;
    return [
      rect(W - 140 + i * 46, 58, 40, 22, isActive ? p.accent : p.surfaceAlt, 11),
      text(W - 140 + i * 46, 62, 40, 14, label, 9, '600',
           isActive ? p.surface : p.textSub, 'center'),
    ];
  }).flat(),

  // Key metrics
  rect(20, 100, W - 40, 72, p.surface, 12),
  text(34, 110, 180, 13, 'CYCLE TIME — LAST 4 WEEKS', 8, '700', p.textFaint),
  hline(34, 125, W - 68, p.border),
  // Three KPIs
  ...[
    { label: 'Median',  value: '2.1d', color: p.accent  },
    { label: 'p75',     value: '4.8d', color: p.yellow  },
    { label: 'p95',     value: '11d',  color: p.coral   },
  ].map((k, i) => {
    const x = 34 + i * 110;
    return [
      text(x, 130, 100, 32, k.value, 24, '800', k.color),
      text(x, 162, 100, 13, k.label, 9, '500', p.textSub),
    ];
  }).flat(),

  // Scatter chart — cycle time dots
  text(20, 184, 200, 13, 'CYCLE TIME PER PR', 8, '700', p.textFaint),
  hline(20, 199, W - 40, p.border),
  rect(20, 207, W - 40, 200, p.surface, 10),

  // Chart axes
  hline(50, 390, W - 80, p.border, 0.5),
  // Y axis labels (days)
  ...['14d','7d','3d','1d'].map((label, i) => {
    const y = 220 + i * 44;
    return [
      text(24, y - 6, 24, 12, label, 8, '400', p.textFaint, 'right'),
      hline(50, y, W - 80, p.border, 0.3),
    ];
  }).flat(),

  // Scatter dots — PR cycle times over 4 weeks
  ...[
    { x: 0.05, y: 0.92, status: 'approved' },
    { x: 0.12, y: 0.78, status: 'approved' },
    { x: 0.18, y: 0.55, status: 'review'   },
    { x: 0.25, y: 0.88, status: 'approved' },
    { x: 0.30, y: 0.42, status: 'approved' },
    { x: 0.35, y: 0.72, status: 'review'   },
    { x: 0.42, y: 0.95, status: 'blocked'  },
    { x: 0.48, y: 0.60, status: 'approved' },
    { x: 0.55, y: 0.35, status: 'approved' },
    { x: 0.60, y: 0.80, status: 'review'   },
    { x: 0.65, y: 0.25, status: 'approved' },
    { x: 0.70, y: 0.90, status: 'blocked'  },
    { x: 0.75, y: 0.50, status: 'approved' },
    { x: 0.80, y: 0.65, status: 'review'   },
    { x: 0.88, y: 0.45, status: 'approved' },
    { x: 0.93, y: 0.30, status: 'approved' },
  ].map(d => {
    const dotX = 50 + Math.round(d.x * (W - 100));
    const dotY = 220 + Math.round(d.y * 160);
    const col = d.status === 'blocked' ? p.coral
              : d.status === 'review'  ? p.accent : p.green;
    return rect(dotX - 5, dotY - 5, 10, 10, col, 5, { opacity: 0.85 });
  }),

  // Trend line annotation
  text(W - 90, 232, 70, 13, 'trend ↓', 9, '600', p.green, 'right'),

  // Weekly breakdown
  text(20, 422, 200, 13, 'WEEKLY MERGED', 8, '700', p.textFaint),
  hline(20, 437, W - 40, p.border),
  rect(20, 445, W - 40, 100, p.surface, 10),
  ...[
    { wk: 'W4',  merged: 12, opened: 15, net: -3  },
    { wk: 'W3',  merged: 16, opened: 11, net: 5   },
    { wk: 'W2',  merged: 14, opened: 13, net: 1   },
    { wk: 'W1',  merged: 21, opened: 9,  net: 12  },
  ].map((row, i) => {
    const y = 458 + i * 22;
    const isPos = row.net > 0;
    return [
      text(34, y,  30, 14, row.wk, 10, '600', p.text),
      text(76, y, 60, 14, `${row.merged} merged`, 10, '400', p.textSub),
      text(180, y, 60, 14, `${row.opened} opened`, 10, '400', p.textSub),
      text(W - 54, y, 40, 14, `${isPos ? '+' : ''}${row.net}`, 10, '700',
           isPos ? p.green : p.coral, 'right'),
    ];
  }).flat(),

  // Time-to-first-review
  rect(20, 558, W - 40, 56, p.greenLt, 10),
  rect(20, 558, 3, 56, p.green, 2),
  text(34, 568, W - 60, 14, 'Avg. time to first review: 3.4 hrs', 11, '600', p.green),
  text(34, 584, W - 60, 13, 'Down from 5.1 hrs last cycle — great response time', 10, '400', p.textSub),

  // Bottom nav
  rect(0, H - 80, W, 80, p.surface),
  hline(0, H - 80, W, p.border),
  ...['Overview', 'Queue', 'Team', 'Velocity'].map((label, i) => {
    const isActive = i === 3;
    return [
      rect(i * (W / 4), H - 80, W / 4, 80, isActive ? p.accentLt : 'transparent'),
      text(i * (W / 4), H - 52, W / 4, 13, label, 10, isActive ? '700' : '500',
           isActive ? p.accent : p.textSub, 'center'),
    ];
  }).flat(),
]);

// ============================================================
// SCREEN 5 — BLOCKERS (urgent attention)
// ============================================================
makeScreen('Blockers', [
  ...statusBar(),
  rect(0, 44, W, H - 44, p.bg),

  rect(0, 44, W, 48, p.surface),
  hline(0, 92, W, p.border),
  text(20, 56, 220, 20, 'Blockers', 16, '700', p.text),
  // Alert badge
  rect(W - 56, 58, 36, 22, p.coralLt, 11),
  text(W - 56, 62, 36, 14, '6', 10, '700', p.coral, 'center'),

  // Editorial bold header — Lucci Lambrusco influence
  rect(20, 100, W - 40, 70, p.coral, 10),
  text(34, 114, W - 60, 22, '6 PRs BLOCKING', 17, '800', p.surface),
  text(34, 138, W - 60, 14, 'Holding back 3 team members', 10, '400', 'rgba(255,255,255,0.8)'),

  // Blocked PRs — detailed list
  text(20, 182, 200, 13, 'REQUIRES IMMEDIATE ACTION', 8, '700', p.textFaint),
  hline(20, 197, W - 40, p.border),

  ...[
    { title: 'refactor: auth middleware cleanup', author: 'priya',  blocker: 'Waiting on security review',    age: '4d', repo: 'api-core'  },
    { title: 'feat: billing webhook retry',       author: 'carlos', blocker: 'Merge conflicts with main',     age: '3d', repo: 'events'    },
    { title: 'fix: race condition in workers',    author: 'mei',    blocker: 'CI failing — flaky test in e2e', age: '6d', repo: 'workers'   },
    { title: 'chore: upgrade postgres client',    author: 'jordan', blocker: 'Breaking change in migration',  age: '5d', repo: 'shared'    },
    { title: 'feat: org-level API keys',          author: 'aisha',  blocker: 'Design review pending',          age: '2d', repo: 'api-core'  },
  ].map((pr, i) => {
    const y = 206 + i * 102;
    return [
      rect(20, y, W - 40, 92, p.surface, 8),
      rect(20, y, 3, 92, p.coral, 2),
      // PR title
      text(34, y + 10, W - 60, 14, pr.title, 11, '600', p.text),
      // Repo + author
      text(34, y + 26, 200, 13, `${pr.repo} · @${pr.author}`, 9, '400', p.textSub),
      // Blocker reason chip
      rect(34, y + 44, W - 60, 22, p.coralLt, 6),
      text(46, y + 50, W - 80, 12, `⚠ ${pr.blocker}`, 9, '500', p.coral),
      // Age
      text(W - 54, y + 10, 40, 13, `${pr.age}`, 9, '700', p.coral, 'right'),
      hline(20, y + 92, W - 40, p.border, 0.5),
    ];
  }).flat(),

  // Quick action strip
  rect(20, 722, W - 40, 44, p.accent, 10),
  text(20, 734, W - 40, 20, 'Notify reviewers for all blocked PRs', 11, '600', p.surface, 'center'),

  // Bottom nav
  rect(0, H - 80, W, 80, p.surface),
  hline(0, H - 80, W, p.border),
  ...['Overview', 'Queue', 'Team', 'Velocity'].map((label, i) => [
    text(i * (W / 4), H - 52, W / 4, 13, label, 10, '500', p.textSub, 'center'),
  ]).flat(),
]);

// ============================================================
// ASSEMBLE PEN
// ============================================================
const pen = {
  version: '2.8',
  meta: {
    name: 'FLINT',
    description: 'PR review load, made legible',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
  },
  canvas: {
    width: W * screens.length + 40 * (screens.length + 1),
    height: H + 80,
    background: '#E4E0DA',
  },
  screens: screens.map((screen, i) => ({
    ...screen,
    x: 40 + i * (W + 40),
    y: 40,
  })),
};

fs.writeFileSync('flint.pen', JSON.stringify(pen, null, 2));
const totalEls = pen.screens.reduce((n, s) => n + (s.children?.length || 0), 0);
console.log(`✓ flint.pen written — ${screens.length} screens, ${totalEls} elements`);
