'use strict';
// meter-app.js
// METER — AI Token Cost Intelligence Platform
// Heartbeat #13 — Inspired by:
//   1. Polar.sh (land-book.com) — "Turn Usage Into Revenue" — terminal code blocks as hero UI,
//      live event stream feeds, numbered pipeline sections (— 01, — 02, — 03),
//      near-black + electric blue, developer-first billing platform aesthetic
//   2. Obsidian OS (darkmodedesign.com) — dark finance SaaS, sidebar nav, clean metric tiles,
//      "AI-powered practice management" — structured feature grid
//   3. TRIONN (darkmodedesign.com) — bold counter-stat numerics, geometric precision on dark
//
// Challenge: Design a dark developer-first AI cost intelligence platform — featuring a
// terminal-style live event stream, token usage pipeline visualization, cost anomaly detection,
// and budget allocation bento grid. First time pushing terminal/code-as-UI aesthetic.
//
// Palette: near-black zinc #09090b, electric blue #3b82f6, indigo #6366f1, emerald #10b981,
// amber #f59e0b, warm white #fafafa

const fs   = require('fs');
const path = require('path');

// ── IDs ───────────────────────────────────────────────────────────────────────
let _id = 0;
const uid = (p = 'm') => `${p}${++_id}`;

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:         '#09090b',   // zinc-950 (Polar-inspired near-black)
  surface:    '#111113',   // raised surface
  surface2:   '#18181b',   // card bg (zinc-900)
  surface3:   '#27272a',   // elevated card
  border:     '#3f3f46',   // zinc-700
  border2:    '#52525b',   // zinc-600
  muted:      '#71717a',   // zinc-500
  fg:         '#fafafa',   // near-white
  fg2:        '#a1a1aa',   // zinc-400
  blue:       '#3b82f6',   // electric blue (primary)
  blueDim:    '#1e3a5f',   // blue dim bg
  bluePale:   '#93c5fd',   // blue-300 (light)
  indigo:     '#6366f1',   // indigo accent
  indigoDim:  '#1e1b4b',   // indigo dim bg
  emerald:    '#10b981',   // positive / savings
  emeraldDim: '#064e3b',   // emerald dim bg
  amber:      '#f59e0b',   // warning
  amberDim:   '#451a03',   // amber dim bg
  red:        '#ef4444',   // danger / anomaly
  redDim:     '#450a0a',   // red dim bg
  mono:       '#22c55e',   // terminal green
  monoDim:    '#052e16',   // terminal bg
};

// ── Primitives ────────────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill || C.bg,
  clip: opts.clip !== undefined ? opts.clip : false,
  ...(opts.r !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.ch || [],
});

const T = (content, x, y, w, h, opts = {}) => ({
  id: uid(), type: 'text', content, x, y, width: w, height: h,
  textGrowth: 'fixed-width-height',
  fontSize: opts.size || 12,
  fontWeight: String(opts.weight || 400),
  fill: opts.fill || C.fg,
  textAlign: opts.align || 'left',
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh !== undefined ? { lineHeight: opts.lh } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  ...(opts.mono ? { fontFamily: 'monospace' } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h,
  fill: fill || C.fg,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

// Hairline rule
const Rule = (x, y, w, opacity = 0.25) =>
  F(x, y, w, 1, C.border, { opacity });

// Label (overline / section heading)
const Label = (text, x, y, w, color) =>
  T(text, x, y, w, 14, { size: 9, fill: color || C.muted, weight: 500, ls: 2 });

// Pill badge
const Pill = (label, x, y, bg, fg, w) => {
  const pw = w || (label.length * 6.2 + 18);
  return F(x, y, pw, 20, bg, {
    r: 10,
    ch: [T(label, 9, 4, pw - 18, 12, { size: 8, fill: fg, weight: 600, ls: 0.5 })],
  });
};

// Numbered section marker (Polar style "— 01")
const SectionNum = (num, x, y, color) => [
  T('—', x, y, 16, 16, { size: 11, fill: color || C.muted, weight: 300 }),
  T(String(num).padStart(2, '0'), x + 16, y, 28, 16, { size: 11, fill: color || C.muted, weight: 500 }),
];

// Metric stat tile
const StatTile = (x, y, w, h, label, value, unit, change, trend, accentColor) =>
  F(x, y, w, h, C.surface2, {
    r: 10,
    stroke: C.border,
    sw: 1,
    ch: [
      Label(label, 16, 14, w - 32, accentColor),
      T(value, 16, 32, w - 32, 44, { size: 32, fill: C.fg, weight: 700 }),
      T(unit, 16 + value.length * 18, 46, 60, 14, { size: 11, fill: C.fg2, weight: 400 }),
      T(change, 16, h - 28, w - 32, 14, { size: 10, fill: trend === 'up' ? C.red : C.emerald, weight: 500 }),
    ],
  });

// Terminal row (code line)
const TermRow = (x, y, w, timestamp, event, user, tokens, color) => [
  T(timestamp, x, y, 68, 16, { size: 9, fill: C.muted, weight: 400, mono: true }),
  Pill(event, x + 72, y + 1, color + '20', color, 80),
  T(user, x + 160, y, 80, 16, { size: 9, fill: C.fg2, mono: true }),
  T(tokens, x + w - 70, y, 70, 16, { size: 9, fill: color, weight: 600, align: 'right', mono: true }),
];

// Mini bar chart column
const Bar = (x, y, maxH, value, maxVal, color) => {
  const h = Math.round((value / maxVal) * maxH);
  return F(x, y + (maxH - h), 20, h, color, { r: 3, opacity: 0.8 });
};

// ── MOBILE SCREENS (390 × 844) ────────────────────────────────────────────────
const MW = 390, MH = 844;

// ── M1: Cost Overview (Home) ──────────────────────────────────────────────────
function mHome() {
  // Status bar
  const statusBar = F(0, 0, MW, 44, C.bg, { ch: [
    T('9:41', 16, 14, 60, 16, { size: 11, fill: C.fg, weight: 600 }),
    T('● LIVE', MW - 80, 14, 64, 16, { size: 9, fill: C.emerald, weight: 600, ls: 1 }),
  ]});

  // Header
  const logoText = T('METER', 20, 52, 80, 20, { size: 11, fill: C.blue, weight: 700, ls: 4 });
  const alertBtn = F(MW - 52, 48, 32, 32, C.surface2, {
    r: 8, stroke: C.border, sw: 1,
    ch: [T('◎', 8, 6, 16, 18, { size: 13, fill: C.amber })],
  });

  // Period selector
  const periods = ['1H', '24H', '7D', '30D'];
  const periodRow = periods.map((p, i) => F(20 + i * 84, 92, 78, 28, i === 2 ? C.blue : C.surface2, {
    r: 7,
    stroke: i === 2 ? 'none' : C.border, sw: 1,
    ch: [T(p, 0, 7, 78, 14, { size: 10, fill: i === 2 ? C.bg : C.muted, weight: i === 2 ? 700 : 400, align: 'center', ls: 0.5 })],
  }));

  // Main cost number
  const totalLabel = Label('TOTAL SPEND — LAST 7 DAYS', 20, 136, 220);
  const totalCost  = T('$2,847', 20, 152, 260, 60, { size: 52, fill: C.fg, weight: 800 });
  const costChange = T('↑ +18% vs prior period', 20, 216, 200, 16, { size: 10, fill: C.red, weight: 500 });
  const budgetLine = T('Budget: $4,000 · 71% used', 20, 234, 200, 14, { size: 10, fill: C.muted });

  // Budget bar
  const budgetBg   = F(20, 255, MW - 40, 4, C.surface3, { r: 2 });
  const budgetFill = F(20, 255, (MW - 40) * 0.71, 4, C.blue, { r: 2 });
  const budgetDanger = F(20 + (MW - 40) * 0.9, 253, 2, 8, C.red, {});

  // Model breakdown mini-tiles
  const r1 = Rule(20, 276, MW - 40);
  const modelLabel = Label('BY MODEL', 20, 290, 100);
  const models = [
    { name: 'GPT-4o', cost: '$1,204', pct: 0.42, color: C.blue },
    { name: 'Claude 3.5', cost: '$896', pct: 0.31, color: C.indigo },
    { name: 'Gemini 1.5', cost: '$518', pct: 0.18, color: C.emerald },
    { name: 'o1-mini', cost: '$229', pct: 0.09, color: C.amber },
  ];
  const modelTiles = models.map((m, i) => F(20, 308 + i * 56, MW - 40, 48, C.surface2, {
    r: 8, stroke: C.border, sw: 1,
    ch: [
      F(12, 16, 4, 18, m.color, { r: 2 }),  // color stripe
      T(m.name, 24, 9, 100, 14, { size: 10, fill: C.fg, weight: 500 }),
      T(`${Math.round(m.pct * 100)}% of total`, 24, 27, 120, 12, { size: 9, fill: C.muted }),
      T(m.cost, MW - 80, 16, 60, 16, { size: 13, fill: C.fg, weight: 600, align: 'right' }),
      // Mini progress bar
      F(24, 41, MW - 84, 3, C.surface3, { r: 2 }),
      F(24, 41, (MW - 84) * m.pct, 3, m.color, { r: 2, opacity: 0.7 }),
    ],
  }));

  // Live event pulse
  const r2 = Rule(20, 540, MW - 40);
  const liveLabel = F(20, 553, 100, 18, C.monoDim, { r: 4, ch: [
    E(10, 5, 8, 8, C.mono),
    T('LIVE', 24, 4, 60, 10, { size: 8, fill: C.mono, weight: 700, ls: 1.5 }),
  ]});
  const events = [
    { ts: '14:52:01', ev: 'INFERENCE', user: 'api/chat', tokens: '+4.2k tok', color: C.blue },
    { ts: '14:51:58', ev: 'INFERENCE', user: 'api/embed', tokens: '+892 tok', color: C.indigo },
    { ts: '14:51:44', ev: 'ALERT', user: 'sys/budget', tokens: '90% warn', color: C.amber },
  ];
  const eventRows = events.map((ev, i) => {
    const y = 580 + i * 40;
    return [
      ...TermRow(20, y, MW - 40, ev.ts, ev.ev, ev.user, ev.tokens, ev.color),
      Rule(20, y + 32, MW - 40, 0.15),
    ];
  }).flat();

  // Nav
  const nav = F(0, MH - 80, MW, 80, C.surface, {
    stroke: C.border, sw: 1,
    ch: [
      ...['◈', '≋', '⚡', '⊛'].map((ic, i) => [
        T(ic, 35 + i * 80, 14, 40, 22, { size: 18, fill: i === 0 ? C.blue : C.muted, align: 'center' }),
        T(['HOME', 'USAGE', 'ALERTS', 'TEAMS'][i], 23 + i * 80, 36, 64, 10,
          { size: 7, fill: i === 0 ? C.blue : C.muted, weight: i === 0 ? 700 : 400, ls: 0.8, align: 'center' }),
      ]).flat(),
    ],
  });

  return F(0, 0, MW, MH, C.bg, { ch: [
    statusBar, logoText, alertBtn,
    ...periodRow, totalLabel, totalCost, costChange, budgetLine,
    budgetBg, budgetFill, budgetDanger,
    r1, modelLabel, ...modelTiles,
    r2, liveLabel, ...eventRows,
    nav,
  ]});
}

// ── M2: Usage Breakdown ───────────────────────────────────────────────────────
function mUsage() {
  const header = F(0, 0, MW, 44, C.bg, { ch: [
    T('9:41', 16, 14, 60, 16, { size: 11, fill: C.fg, weight: 600 }),
  ]});
  const logoText = T('METER', 20, 52, 80, 20, { size: 11, fill: C.blue, weight: 700, ls: 4 });
  const pageTitle = T('Usage', 20, 72, MW - 40, 32, { size: 26, fill: C.fg, weight: 700 });
  const sub = T('By feature · Last 7 days', 20, 108, MW - 40, 14, { size: 11, fill: C.muted });

  // Bar chart — top features
  const chartBg = F(20, 132, MW - 40, 160, C.surface2, {
    r: 10, stroke: C.border, sw: 1,
    ch: [
      Label('DAILY TOKENS (M)', 16, 14, 200, C.blue),
      // Grid lines
      ...[0, 1, 2].map(i => F(16, 38 + i * 34, MW - 72, 1, C.border, { opacity: 0.3 })),
      // Bars — 7 days
      ...[4.2, 5.8, 3.9, 6.1, 7.4, 5.2, 8.1].map((v, i) => {
        const maxH = 78;
        const h = Math.round((v / 9) * maxH);
        const x = 16 + i * 36;
        const dayColor = i === 6 ? C.blue : C.indigo;
        return [
          F(x, 140 - h, 26, h, dayColor, { r: 3, opacity: i === 6 ? 1 : 0.4 }),
          T(['M', 'T', 'W', 'T', 'F', 'S', 'S'][i], x + 3, 142, 20, 10, { size: 7, fill: C.muted, align: 'center' }),
        ];
      }).flat(),
    ],
  });

  // Feature breakdown list
  const r1 = Rule(20, 308, MW - 40);
  const featLabel = Label('TOP FEATURES BY COST', 20, 322, 200);
  const features = [
    { name: 'Chat Completion', model: 'GPT-4o', cost: '$1,204', tokens: '8.2B', pct: 0.42, color: C.blue },
    { name: 'Document Q&A', model: 'Claude 3.5', cost: '$896', tokens: '6.1B', pct: 0.31, color: C.indigo },
    { name: 'Code Review', model: 'GPT-4o', cost: '$388', tokens: '2.6B', pct: 0.14, color: C.blue },
    { name: 'Embeddings', model: 'Gemini 1.5', cost: '$229', tokens: '15.2B', pct: 0.08, color: C.emerald },
    { name: 'Summarization', model: 'o1-mini', cost: '$130', tokens: '890M', pct: 0.05, color: C.amber },
  ];
  const featureRows = features.map((f, i) => F(20, 340 + i * 66, MW - 40, 58, C.surface2, {
    r: 8, stroke: C.border, sw: 1,
    ch: [
      F(12, 0, MW - 64, 3, f.color, { r: [2, 2, 0, 0], opacity: 0.6 }), // top accent bar
      T(f.name, 16, 10, 160, 16, { size: 12, fill: C.fg, weight: 600 }),
      T(f.model, 16, 28, 100, 12, { size: 9, fill: C.muted }),
      T(f.tokens, 16, 42, 80, 12, { size: 9, fill: f.color }),
      T(f.cost, MW - 80, 14, 60, 18, { size: 15, fill: C.fg, weight: 700, align: 'right' }),
      T(`${Math.round(f.pct * 100)}%`, MW - 80, 36, 60, 12, { size: 9, fill: C.muted, align: 'right' }),
    ],
  }));

  const nav = F(0, MH - 80, MW, 80, C.surface, {
    stroke: C.border, sw: 1,
    ch: [
      ...['◈', '≋', '⚡', '⊛'].map((ic, i) => [
        T(ic, 35 + i * 80, 14, 40, 22, { size: 18, fill: i === 1 ? C.blue : C.muted, align: 'center' }),
        T(['HOME', 'USAGE', 'ALERTS', 'TEAMS'][i], 23 + i * 80, 36, 64, 10,
          { size: 7, fill: i === 1 ? C.blue : C.muted, weight: i === 1 ? 700 : 400, ls: 0.8, align: 'center' }),
      ]).flat(),
    ],
  });

  return F(0, 0, MW, MH, C.bg, { ch: [
    header, logoText, pageTitle, sub,
    chartBg, r1, featLabel, ...featureRows, nav,
  ]});
}

// ── M3: Alert Center ──────────────────────────────────────────────────────────
function mAlerts() {
  const header = F(0, 0, MW, 44, C.bg, { ch: [
    T('9:41', 16, 14, 60, 16, { size: 11, fill: C.fg, weight: 600 }),
  ]});
  const logoText = T('METER', 20, 52, 80, 20, { size: 11, fill: C.blue, weight: 700, ls: 4 });
  const pageTitle = T('Alerts', 20, 72, MW - 40, 32, { size: 26, fill: C.fg, weight: 700 });

  // Alert summary chips
  const chips = [
    { label: '2 CRITICAL', color: C.red },
    { label: '3 WARNING', color: C.amber },
    { label: '1 INFO', color: C.blue },
  ];
  const chipRow = chips.map((c, i) => F(20 + i * 120, 108, 112, 28, c.color + '18', {
    r: 7, stroke: c.color + '60', sw: 1,
    ch: [T(c.label, 10, 7, 92, 14, { size: 9, fill: c.color, weight: 700, ls: 0.5, align: 'center' })],
  }));

  // Alert cards
  const alerts = [
    {
      type: 'CRITICAL', icon: '⚠', color: C.red,
      title: 'Daily spend limit reached',
      body: 'Team "ML-Infra" hit $500/day cap at 14:52. API calls are being throttled.',
      time: '2 min ago',
      action: 'INCREASE LIMIT',
    },
    {
      type: 'CRITICAL', icon: '⚠', color: C.red,
      title: 'Cost anomaly detected',
      body: 'GPT-4o usage spiked 340% in last 30min. Possible prompt injection or loop.',
      time: '8 min ago',
      action: 'INVESTIGATE',
    },
    {
      type: 'WARNING', icon: '◎', color: C.amber,
      title: '90% monthly budget used',
      body: 'You\'ve consumed $3,600 of your $4,000 monthly budget with 12 days remaining.',
      time: '1 hr ago',
      action: 'VIEW BUDGET',
    },
    {
      type: 'WARNING', icon: '◎', color: C.amber,
      title: 'Slow model requests detected',
      body: 'P95 latency for "claude-3-5-sonnet" is 8.4s. Consider model downgrade for batch jobs.',
      time: '3 hr ago',
      action: 'VIEW TRACES',
    },
    {
      type: 'INFO', icon: '⊕', color: C.blue,
      title: 'Embedding cache saving $42/day',
      body: 'Semantic cache hit rate improved to 68%. Estimated monthly savings: $1,260.',
      time: 'Yesterday',
      action: 'VIEW SAVINGS',
    },
  ];

  const alertCards = alerts.map((a, i) => {
    const cardH = a.type === 'INFO' ? 90 : 110;
    return F(20, 148 + i * (cardH + 10), MW - 40, cardH, C.surface2, {
      r: 10, stroke: a.color + '40', sw: 1,
      ch: [
        F(0, 0, 3, cardH, a.color, { r: [2, 0, 0, 2] }),   // left accent bar
        Pill(a.type, 16, 10, a.color + '20', a.color),
        T(a.time, MW - 80, 12, 60, 12, { size: 8, fill: C.muted, align: 'right' }),
        T(a.title, 16, 34, MW - 72, 16, { size: 12, fill: C.fg, weight: 600 }),
        T(a.body, 16, 52, MW - 72, 36, { size: 10, fill: C.fg2, lh: 1.5 }),
        ...(a.type !== 'INFO' ? [
          F(16, cardH - 28, 110, 20, a.color + '20', {
            r: 5, stroke: a.color + '40', sw: 1,
            ch: [T(a.action, 8, 5, 94, 10, { size: 7, fill: a.color, weight: 700, ls: 0.8 })],
          }),
        ] : []),
      ],
    });
  });

  const nav = F(0, MH - 80, MW, 80, C.surface, {
    stroke: C.border, sw: 1,
    ch: [
      ...['◈', '≋', '⚡', '⊛'].map((ic, i) => [
        T(ic, 35 + i * 80, 14, 40, 22, { size: 18, fill: i === 2 ? C.blue : C.muted, align: 'center' }),
        T(['HOME', 'USAGE', 'ALERTS', 'TEAMS'][i], 23 + i * 80, 36, 64, 10,
          { size: 7, fill: i === 2 ? C.blue : C.muted, weight: i === 2 ? 700 : 400, ls: 0.8, align: 'center' }),
      ]).flat(),
    ],
  });

  return F(0, 0, MW, MH, C.bg, { ch: [
    header, logoText, pageTitle,
    ...chipRow, ...alertCards.flat(), nav,
  ]});
}

// ── M4: Live Event Stream ─────────────────────────────────────────────────────
function mEventStream() {
  const header = F(0, 0, MW, 44, C.bg, { ch: [
    T('9:41', 16, 14, 60, 16, { size: 11, fill: C.fg, weight: 600 }),
  ]});
  const logoText = T('METER', 20, 52, 80, 20, { size: 11, fill: C.blue, weight: 700, ls: 4 });

  // Terminal header bar
  const termHeader = F(20, 76, MW - 40, 36, C.monoDim, {
    r: [8, 8, 0, 0], stroke: C.border, sw: 1,
    ch: [
      E(16, 13, 10, 10, C.red),
      E(32, 13, 10, 10, C.amber),
      E(48, 13, 10, 10, C.emerald),
      T('event-stream --live --tail 20', 68, 11, 220, 14, { size: 10, fill: C.mono, mono: true }),
      T('● 847 events/min', MW - 160, 11, 140, 14, { size: 8, fill: C.mono, align: 'right', mono: true }),
    ],
  });

  // Event stream terminal body
  const termBody = F(20, 111, MW - 40, MH - 260, C.monoDim, {
    r: [0, 0, 8, 8], stroke: C.border, sw: 1,
    ch: [
      // Individual event rows
      ...([
        { ts: '14:52:01.234', type: 'INF', user: 'api/chat/user_42', cost: '$0.0021', color: C.blue },
        { ts: '14:52:01.189', type: 'INF', user: 'api/chat/user_17', cost: '$0.0018', color: C.blue },
        { ts: '14:52:00.967', type: 'EMB', user: 'api/embed/batch', cost: '$0.0002', color: C.indigo },
        { ts: '14:52:00.831', type: 'ERR', user: 'api/chat/user_99', cost: 'TIMEOUT', color: C.red },
        { ts: '14:52:00.712', type: 'INF', user: 'api/code/user_5', cost: '$0.0044', color: C.blue },
        { ts: '14:51:59.445', type: 'ALT', user: 'sys/budget/ml', cost: 'WARN 90%', color: C.amber },
        { ts: '14:51:59.302', type: 'INF', user: 'api/doc/user_23', cost: '$0.0034', color: C.indigo },
        { ts: '14:51:58.891', type: 'EMB', user: 'api/embed/rt', cost: '$0.0001', color: C.indigo },
        { ts: '14:51:58.556', type: 'INF', user: 'api/chat/user_8', cost: '$0.0029', color: C.blue },
        { ts: '14:51:57.223', type: 'INF', user: 'api/chat/user_61', cost: '$0.0015', color: C.blue },
        { ts: '14:51:56.891', type: 'INF', user: 'api/sum/batch', cost: '$0.0008', color: C.emerald },
        { ts: '14:51:56.445', type: 'CAC', user: 'cache/semantic', cost: 'HIT $0', color: C.emerald },
        { ts: '14:51:55.112', type: 'INF', user: 'api/chat/user_3', cost: '$0.0033', color: C.blue },
        { ts: '14:51:54.778', type: 'CAC', user: 'cache/semantic', cost: 'HIT $0', color: C.emerald },
        { ts: '14:51:54.123', type: 'INF', user: 'api/code/user_12', cost: '$0.0051', color: C.blue },
      ]).map((ev, i) => {
        const y = 10 + i * 30;
        const typeColor = ev.type === 'ERR' ? C.red : ev.type === 'ALT' ? C.amber : ev.type === 'CAC' ? C.emerald : ev.color;
        return [
          T(ev.ts, 10, y, 100, 14, { size: 8, fill: C.muted, mono: true }),
          F(112, y, 30, 16, typeColor + '25', { r: 3, ch: [T(ev.type, 4, 3, 22, 10, { size: 7, fill: typeColor, weight: 700, mono: true })] }),
          T(ev.user, 148, y, MW - 260, 14, { size: 8, fill: C.fg2, mono: true }),
          T(ev.cost, MW - 110, y, 80, 14, { size: 8, fill: typeColor, mono: true, align: 'right' }),
          ev.type === 'ERR' ? F(10, y + 17, MW - 60, 1, C.red, { opacity: 0.2 }) : F(10, y + 17, MW - 60, 1, C.border, { opacity: 0.12 }),
        ];
      }).flat(),
    ],
  });

  // Stats row below terminal
  const statsRow = [
    { label: 'TOTAL EVENTS', val: '38,471', color: C.blue },
    { label: 'EST. COST', val: '$1.84', color: C.fg },
    { label: 'CACHE HITS', val: '68%', color: C.emerald },
    { label: 'ERRORS', val: '0.4%', color: C.red },
  ].map((s, i) => F(20 + i * 88, MH - 160, 82, 52, C.surface2, {
    r: 8, stroke: C.border, sw: 1,
    ch: [
      Label(s.label, 8, 8, 66, s.color),
      T(s.val, 8, 24, 66, 20, { size: 14, fill: C.fg, weight: 700 }),
    ],
  }));

  const nav = F(0, MH - 80, MW, 80, C.surface, {
    stroke: C.border, sw: 1,
    ch: [
      ...['◈', '≋', '⚡', '⊛'].map((ic, i) => [
        T(ic, 35 + i * 80, 14, 40, 22, { size: 18, fill: i === 0 ? C.blue : C.muted, align: 'center' }),
        T(['HOME', 'USAGE', 'ALERTS', 'TEAMS'][i], 23 + i * 80, 36, 64, 10,
          { size: 7, fill: i === 0 ? C.blue : C.muted, weight: i === 0 ? 700 : 400, ls: 0.8, align: 'center' }),
      ]).flat(),
    ],
  });

  return F(0, 0, MW, MH, C.bg, { ch: [
    header, logoText, termHeader, termBody, ...statsRow, nav,
  ]});
}

// ── DESKTOP SCREENS (1440 × 900) ──────────────────────────────────────────────
const DW = 1440, DH = 900;
const SB = 220;  // sidebar width
const CO = 48;   // content padding

// Shared sidebar
function Sidebar(active) {
  const navItems = ['Dashboard', 'Cost Explorer', 'Usage Breakdown', 'Alert Center', 'Budget Planner', 'Event Stream', 'Teams', 'Settings'];
  const icons    = ['◈', '≈', '≋', '⚡', '◼', '⊡', '⊛', '⚙'];

  return F(0, 0, SB, DH, C.surface, {
    stroke: C.border, sw: 1,
    ch: [
      // Logo
      T('METER', 24, 28, 80, 18, { size: 11, fill: C.blue, weight: 800, ls: 5 }),
      T('AI COST INTELLIGENCE', 24, 46, 160, 10, { size: 7, fill: C.muted, ls: 1.5 }),
      Rule(16, 66, SB - 32, 0.4),
      // Nav
      ...navItems.map((item, i) => {
        const isActive = i === active;
        return F(12, 80 + i * 44, SB - 24, 36, isActive ? C.blue + '18' : 'none', {
          r: 6,
          ch: [
            T(icons[i], 12, 9, 20, 18, { size: 14, fill: isActive ? C.blue : C.muted }),
            T(item, 36, 10, SB - 60, 16, { size: 11, fill: isActive ? C.fg : C.fg2, weight: isActive ? 600 : 400 }),
          ],
        });
      }),
      // Status pulse
      Rule(16, DH - 78, SB - 32, 0.4),
      F(12, DH - 62, SB - 24, 30, C.monoDim, {
        r: 6,
        ch: [
          E(12, 11, 8, 8, C.mono),
          T('Live • 847 events/min', 28, 9, 140, 12, { size: 9, fill: C.mono, mono: true }),
        ],
      }),
    ],
  });
}

// ── D1: Main Dashboard ────────────────────────────────────────────────────────
function dDashboard() {
  const sidebar = Sidebar(0);
  const main = SB + CO;
  const mw   = DW - SB - CO * 2;

  // Header
  const hdr   = T('DASHBOARD', main, 30, 300, 12, { size: 9, fill: C.muted, weight: 500, ls: 2 });
  const title = T('Cost Intelligence', main, 46, 500, 36, { size: 30, fill: C.fg, weight: 700 });
  const dateT = T('March 19 · Last 7 days', main, 84, 300, 16, { size: 11, fill: C.muted });
  const filterBtn = F(DW - CO - 120, 44, 120, 32, C.surface2, {
    r: 8, stroke: C.border, sw: 1,
    ch: [T('⇅ 7D vs 14D', 14, 9, 92, 14, { size: 10, fill: C.fg2 })],
  });

  // Top stat tiles (4 across)
  const tw = (mw - 36) / 4;
  const stats = [
    { label: 'TOTAL SPEND', val: '$2,847', unit: '7d', change: '↑ +18%', trend: 'up', accent: C.blue },
    { label: 'TOKEN VOLUME', val: '42.3', unit: 'B tok', change: '↓ −4%', trend: 'down', accent: C.indigo },
    { label: 'CACHE SAVINGS', val: '$1,260', unit: 'est/mo', change: '↑ +22%', trend: 'down', accent: C.emerald },
    { label: 'ALERT EVENTS', val: '6', unit: 'active', change: '↑ +2 new', trend: 'up', accent: C.amber },
  ];
  const statTiles = stats.map((s, i) =>
    StatTile(main + i * (tw + 12), 112, tw, 100, s.label, s.val, s.unit, s.change, s.trend, s.accent)
  );

  // Main chart — daily spend by model (large bento)
  const chartW = mw * 0.62;
  const chartCard = F(main, 228, chartW, 240, C.surface2, {
    r: 10, stroke: C.border, sw: 1,
    ch: [
      Label('DAILY SPEND BY MODEL — 7 DAYS', 20, 16, 280, C.blue),
      // Grid lines
      ...[0, 1, 2, 3].map(i => F(20, 40 + i * 44, chartW - 40, 1, C.border, { opacity: 0.25 })),
      // Stacked bars (GPT-4o, Claude, Gemini, o1) per day
      ...['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => {
        const bx = 20 + i * ((chartW - 40) / 7);
        const bw = 44;
        const vals = [
          [0.38, 0.28, 0.20, 0.10, 0.04].map(v => v * [340, 420, 290, 450, 520, 380, 590][i]),
        ][0];
        let ys = 218;
        const bars = vals.map((v, j) => {
          const h = Math.round(v * 0.52);
          const colors = [C.blue, C.indigo, C.emerald, C.amber, C.muted];
          const bar = F(bx, ys - h, bw, h, colors[j], { r: j === 0 ? [0, 0, 2, 2] : (j === vals.length - 1 ? [2, 2, 0, 0] : 0), opacity: 0.75 });
          ys -= h;
          return bar;
        });
        return [
          ...bars,
          T(day, bx + 12, 222, 20, 10, { size: 8, fill: C.muted, align: 'center' }),
        ];
      }).flat(),
      // Legend
      ...[C.blue, C.indigo, C.emerald, C.amber].map((col, i) => [
        F(20 + i * 100, 235, 10, 10, col, { r: 3 }),
        T(['GPT-4o', 'Claude 3.5', 'Gemini 1.5', 'o1-mini'][i], 34 + i * 100, 234, 62, 12, { size: 9, fill: C.fg2 }),
      ]).flat(),
    ],
  });

  // Right column — top models + pipeline
  const rw = mw - chartW - 20;
  const rx = main + chartW + 20;

  // Model cost share donut (simplified as ring segments)
  const donutCard = F(rx, 228, rw, 116, C.surface2, {
    r: 10, stroke: C.border, sw: 1,
    ch: [
      Label('MODEL SHARE', 16, 14, 120, C.blue),
      // Simplified: horizontal bar segments
      F(16, 36, rw - 32, 18, C.blue, { r: 4 }),
      F(16 + (rw - 32) * 0.42, 36, (rw - 32) * 0.31, 18, C.indigo, { r: 0 }),
      F(16 + (rw - 32) * 0.73, 36, (rw - 32) * 0.18, 18, C.emerald, { r: 0 }),
      F(16 + (rw - 32) * 0.91, 36, (rw - 32) * 0.09, 18, C.amber, { r: [0, 4, 4, 0] }),
      // Labels
      ...[
        { label: 'GPT-4o', val: '42%', x: 16, color: C.blue },
        { label: 'Claude', val: '31%', x: rw * 0.33, color: C.indigo },
        { label: 'Gemini', val: '18%', x: rw * 0.6, color: C.emerald },
        { label: 'o1', val: '9%', x: rw * 0.82, color: C.amber },
      ].map(item => T(`${item.label} ${item.val}`, item.x, 62, 80, 12, { size: 8, fill: item.color })),
      Rule(16, 80, rw - 32),
      T('$2,847 total · 7 days', 16, 92, rw - 32, 14, { size: 10, fill: C.muted }),
    ],
  });

  // Pipeline visualization (Polar-style)
  const pipeCard = F(rx, 356, rw, 112, C.surface2, {
    r: 10, stroke: C.border, sw: 1,
    ch: [
      Label('BILLING PIPELINE', 16, 14, 160, C.blue),
      // Pipeline steps
      ...['INGEST', 'METER', 'BUDGET', 'ALERT'].map((step, i) => {
        const sw = (rw - 32 - 30) / 4;
        const sx = 16 + i * (sw + 10);
        const colors = [C.blue, C.indigo, C.amber, C.red];
        return [
          F(sx, 34, sw, 42, colors[i] + '18', {
            r: 6, stroke: colors[i] + '50', sw: 1,
            ch: [
              T(step, 0, 10, sw, 12, { size: 8, fill: colors[i], weight: 700, ls: 1.5, align: 'center' }),
              T(['38.4k', '42.3B', '$4,000', '6 live'][i], 0, 24, sw, 14, { size: 12, fill: C.fg, weight: 700, align: 'center' }),
            ],
          }),
          i < 3 ? T('→', sx + sw + 1, 52, 10, 12, { size: 10, fill: C.muted }) : F(0, 0, 1, 1, 'none'),
        ];
      }).flat(),
      T('Events/hr → Tokens → Monthly cap → Live rules', 16, 84, rw - 32, 12, { size: 8, fill: C.muted }),
    ],
  });

  // Alert summary bento
  const alertCard = F(rx, 480, rw, 90, C.redDim, {
    r: 10, stroke: C.red + '40', sw: 1,
    ch: [
      Label('ACTIVE ALERTS', 16, 14, 130, C.red),
      T('2 Critical', 16, 32, 100, 20, { size: 16, fill: C.red, weight: 700 }),
      T('GPT-4o spike +340% · Spend cap hit', 16, 54, rw - 32, 14, { size: 10, fill: C.red, opacity: 0.7 }),
      F(rw - 100, 30, 84, 28, C.red + '25', {
        r: 7, stroke: C.red + '60', sw: 1,
        ch: [T('RESOLVE →', 12, 9, 60, 10, { size: 8, fill: C.red, weight: 700, ls: 0.5 })],
      }),
    ],
  });

  // Bottom: live event stream strip
  const streamCard = F(main, 484, chartW, 86, C.monoDim, {
    r: 10, stroke: C.border, sw: 1,
    ch: [
      F(16, 12, 80, 18, 'none', { ch: [
        E(4, 5, 8, 8, C.mono),
        T('LIVE STREAM', 16, 4, 70, 10, { size: 7, fill: C.mono, weight: 700, ls: 1.5 }),
      ]}),
      ...[
        { ts: '14:52:01', ev: 'INF', user: 'api/chat/user_42', cost: '$0.0021', color: C.blue },
        { ts: '14:52:00', ev: 'ERR', user: 'api/chat/user_99', cost: 'TIMEOUT', color: C.red },
        { ts: '14:51:59', ev: 'ALT', user: 'sys/budget/ml',    cost: 'WARN',    color: C.amber },
      ].map((ev, i) => {
        const typeCol = ev.ev === 'ERR' ? C.red : ev.ev === 'ALT' ? C.amber : C.blue;
        return [
          T(ev.ts, 16, 36 + i * 16, 68, 12, { size: 8, fill: C.muted, mono: true }),
          F(88, 34 + i * 16, 26, 14, typeCol + '25', { r: 3, ch: [T(ev.ev, 2, 3, 22, 8, { size: 6, fill: typeCol, weight: 700, mono: true })] }),
          T(ev.user, 120, 36 + i * 16, 200, 12, { size: 8, fill: C.fg2, mono: true }),
          T(ev.cost, 340, 36 + i * 16, 80, 12, { size: 8, fill: typeCol, mono: true }),
        ];
      }).flat(),
    ],
  });

  return F(0, 0, DW, DH, C.bg, { ch: [
    sidebar, hdr, title, dateT, filterBtn,
    ...statTiles, chartCard, donutCard, pipeCard, alertCard, streamCard,
  ]});
}

// ── D2: Cost Explorer ─────────────────────────────────────────────────────────
function dCostExplorer() {
  const sidebar = Sidebar(1);
  const main = SB + CO;
  const mw   = DW - SB - CO * 2;

  const hdr   = T('COST EXPLORER', main, 30, 300, 12, { size: 9, fill: C.muted, weight: 500, ls: 2 });
  const title = T('Drill into every dollar.', main, 46, 500, 36, { size: 30, fill: C.fg, weight: 700 });

  // Dimension selector
  const dims = ['By Model', 'By Feature', 'By Team', 'By User', 'By Region'];
  const dimRow = dims.map((d, i) => F(main + i * 140, 92, 134, 30, i === 1 ? C.blue : C.surface2, {
    r: 8, stroke: i === 1 ? 'none' : C.border, sw: 1,
    ch: [T(d, 0, 8, 134, 14, { size: 10, fill: i === 1 ? C.bg : C.fg2, weight: i === 1 ? 700 : 400, align: 'center' })],
  }));

  // Large bar chart — cost by feature
  const lw = mw * 0.6;
  const chartCard = F(main, 138, lw, 460, C.surface2, {
    r: 10, stroke: C.border, sw: 1,
    ch: [
      Label('COST BY FEATURE — LAST 30 DAYS', 20, 16, 280, C.blue),
      // Horizontal bar chart
      ...[
        { name: 'Chat Completion', cost: '$4,820', pct: 1.0, color: C.blue },
        { name: 'Document Q&A', cost: '$3,584', pct: 0.74, color: C.indigo },
        { name: 'Code Review', cost: '$1,552', pct: 0.32, color: C.blue },
        { name: 'Embeddings', cost: '$916', pct: 0.19, color: C.emerald },
        { name: 'Summarization', cost: '$520', pct: 0.11, color: C.indigo },
        { name: 'Image Gen', cost: '$388', pct: 0.08, color: C.amber },
        { name: 'Audio Trans.', cost: '$208', pct: 0.043, color: C.muted },
        { name: 'Structured Ext.', cost: '$164', pct: 0.034, color: C.muted },
      ].map((f, i) => {
        const bw = (lw - 200) * f.pct;
        const y = 44 + i * 50;
        return [
          T(f.name, 20, y + 2, 120, 16, { size: 10, fill: C.fg2 }),
          F(145, y, bw, 24, f.color, { r: 4, opacity: 0.75 }),
          T(f.cost, 145 + bw + 8, y + 4, 80, 16, { size: 11, fill: C.fg, weight: 600 }),
          Rule(20, y + 38, lw - 40, 0.15),
        ];
      }).flat(),
    ],
  });

  // Right panel — model comparison table
  const rw = mw - lw - 20;
  const rx = main + lw + 20;

  const compareCard = F(rx, 138, rw, 300, C.surface2, {
    r: 10, stroke: C.border, sw: 1,
    ch: [
      Label('MODEL COMPARISON', 16, 16, 180, C.blue),
      Rule(16, 36, rw - 32),
      // Table header
      T('MODEL', 16, 46, 100, 12, { size: 8, fill: C.muted, weight: 600, ls: 1 }),
      T('$/1K TOK', rw - 140, 46, 60, 12, { size: 8, fill: C.muted, weight: 600, ls: 0.5, align: 'right' }),
      T('30D COST', rw - 70, 46, 54, 12, { size: 8, fill: C.muted, weight: 600, ls: 0.5, align: 'right' }),
      Rule(16, 62, rw - 32),
      // Models
      ...[
        { name: 'GPT-4o', rate: '$0.015', cost: '$4,200', color: C.blue, badge: 'PRICIEST' },
        { name: 'Claude 3.5', rate: '$0.012', cost: '$3,120', color: C.indigo, badge: '' },
        { name: 'GPT-4o-mini', rate: '$0.0006', cost: '$420', color: C.blue, badge: 'EFFICIENT' },
        { name: 'Gemini 1.5', rate: '$0.0035', cost: '$1,050', color: C.emerald, badge: '' },
        { name: 'o1-mini', rate: '$0.004', cost: '$980', color: C.amber, badge: '' },
        { name: 'Claude Haiku', rate: '$0.00025', cost: '$156', color: C.indigo, badge: 'CHEAPEST' },
      ].map((m, i) => [
        T(m.name, 16, 72 + i * 34, 110, 14, { size: 11, fill: C.fg }),
        m.badge ? Pill(m.badge, 128, 72 + i * 34, m.badge === 'CHEAPEST' ? C.emeraldDim : m.badge === 'PRICIEST' ? C.redDim : C.blueDim,
          m.badge === 'CHEAPEST' ? C.emerald : m.badge === 'PRICIEST' ? C.red : C.blue) : F(0, 0, 1, 1, 'none'),
        T(m.rate, rw - 140, 72 + i * 34, 60, 14, { size: 10, fill: C.fg2, align: 'right', mono: true }),
        T(m.cost, rw - 70, 72 + i * 34, 54, 14, { size: 11, fill: m.color, weight: 600, align: 'right' }),
        Rule(16, 98 + i * 34, rw - 32, 0.12),
      ]).flat(),
    ],
  });

  // Savings opportunity card
  const savingsCard = F(rx, 450, rw, 148, C.emeraldDim, {
    r: 10, stroke: C.emerald + '40', sw: 1,
    ch: [
      Label('SAVINGS OPPORTUNITY', 16, 14, 200, C.emerald),
      T('Switch to Claude Haiku', 16, 32, rw - 32, 20, { size: 16, fill: C.fg, weight: 700 }),
      T('for batch jobs + summarization', 16, 54, rw - 32, 14, { size: 11, fill: C.fg2 }),
      T('Estimated monthly savings', 16, 78, rw - 32, 12, { size: 9, fill: C.muted }),
      T('$1,847 /mo', 16, 96, rw - 32, 28, { size: 22, fill: C.emerald, weight: 800 }),
      F(16, 126, 120, 28, C.emerald, {
        r: 8,
        ch: [T('APPLY RULE', 12, 8, 96, 12, { size: 9, fill: C.bg, weight: 700, ls: 1 })],
      }),
    ],
  });

  return F(0, 0, DW, DH, C.bg, { ch: [
    sidebar, hdr, title, ...dimRow,
    chartCard, compareCard, savingsCard,
  ]});
}

// ── Assemble doc ──────────────────────────────────────────────────────────────
const screens = [
  mHome(), mUsage(), mAlerts(), mEventStream(),
  dDashboard(), dCostExplorer(),
];

const doc = {
  version: '2.8',
  children: screens,
};

const penPath = path.join(__dirname, 'meter.pen');
fs.writeFileSync(penPath, JSON.stringify(doc, null, 2));
console.log(`✓ meter.pen written — ${screens.length} screens`);
console.log(`  Mobile:  ${screens.filter(s => s.width < 500).length} screens (390×844)`);
console.log(`  Desktop: ${screens.filter(s => s.width >= 500).length} screens (1440×900)`);
console.log(`  Palette: near-black zinc + electric blue + indigo + emerald`);
console.log(`  Inspired by: Polar.sh (land-book.com) + Obsidian OS (darkmodedesign.com)`);
