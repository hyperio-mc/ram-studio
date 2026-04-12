'use strict';
// finch-app.js
// FINCH — Personal Spend Intelligence
//
// Challenge: Design a warm, joyful, LIGHT-mode personal finance dashboard
// that makes money management feel approachable — not clinical.
//
// Inspired by:
// 1. Capchase (land-book.com — latest batch Mar 2026) — "Modern vendor financing
//    for B2B software and hardware purchases." Clean financial data hierarchy,
//    soft card grids, single bold accent on warm near-white. The way large
//    dollar figures are set in heavy numerals against muted category labels
//    is a pattern I'm lifting directly.
//
// 2. Amie (godly.website featured) — calendar/productivity app with warm cream
//    (#F5F3EF-ish) backgrounds, bento-style info architecture, generous white
//    space between data zones. Amie proved that data apps don't need cold white.
//
// 3. Equals / GTM analytics (land-book.com) — financial analytics SaaS with
//    clean table-and-chart layouts on near-white, bold monospace numerals,
//    muted section headers. The "analytics-meets-spreadsheet" aesthetic.
//
// TREND: SaaS data products shifting from cold #FFFFFF → warm cream/bone tones.
//   Makes financial data feel human and approachable. Saw this on 4+ sites.
//
// LIGHT THEME (last run "zero" was dark)
// Screens (390×844): Dashboard · Categories · Transactions · Budget · Insights

const fs   = require('fs');
const path = require('path');

// ── Palette ────────────────────────────────────────────────────────────────────
const P = {
  bg:        '#F5F3EF',   // warm cream — key trend
  surface:   '#FFFFFF',   // card white
  surface2:  '#FDFCFA',   // slightly warm card
  border:    'rgba(28,25,23,0.08)',
  borderMd:  'rgba(28,25,23,0.13)',
  fg:        '#1C1917',   // warm near-black
  muted:     'rgba(28,25,23,0.42)',
  accent:    '#FF5C35',   // warm coral (Finch brand)
  accent2:   '#6366F1',   // indigo for charts
  green:     '#16A34A',
  amber:     '#D97706',
  red:       '#DC2626',
  greenSoft: 'rgba(22,163,74,0.10)',
  accentSoft:'rgba(255,92,53,0.10)',
  a2Soft:    'rgba(99,102,241,0.10)',
  amberSoft: 'rgba(217,119,6,0.10)',
};

// ── ID counter ─────────────────────────────────────────────────────────────────
let _id = 0;
const uid = () => `f${++_id}`;

// ── Primitives ─────────────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill || P.bg,
  clip: opts.clip !== undefined ? opts.clip : false,
  ...(opts.r   !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke            ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.ch || [],
});

const T = (text, x, y, w, h, opts = {}) => ({
  id: uid(), type: 'text', x, y, width: w, height: h, text,
  fontSize:     opts.size   || 13,
  fontWeight:   opts.weight || 400,
  fill:         opts.fill   || P.fg,
  letterSpacing:opts.ls     || 0,
  lineHeight:   opts.lh     || 1.4,
  textAlign:    opts.align  || 'left',
  fontFamily:   opts.mono   ? 'JetBrains Mono' : 'Inter',
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1.5, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Line = (x, y, len, fill, opts = {}) => ({
  id: uid(), type: 'frame',
  x, y, width: opts.vert ? 1 : len, height: opts.vert ? len : 1,
  fill,
});

const Pill = (x, y, label, color, opts = {}) =>
  F(x, y, opts.w || 70, opts.h || 22, color + (opts.bgAlpha || '18'), {
    r: 99, ch: [
      T(label, 0, 3, opts.w || 70, 16, { size: opts.size || 9, fill: color, align: 'center', weight: 600, ls: 0.2 }),
    ],
  });

const Card = (x, y, w, h, opts = {}) =>
  F(x, y, w, h, opts.bg || P.surface, {
    r: opts.r || 16, stroke: P.border, sw: 1, ch: opts.ch || [],
  });

const BarH = (x, y, len, h, pct, fill, bg, opts = {}) =>
  F(x, y, len, h, bg || P.border, {
    r: opts.r || 3, clip: true, ch: [
      F(0, 0, Math.max(2, Math.round(len * Math.min(pct / 100, 1))), h, fill, { r: opts.r || 3 }),
    ],
  });

const IconBadge = (x, y, emoji, bg) => F(x, y, 36, 36, bg, {
  r: 10, ch: [ T(emoji, 0, 7, 36, 22, { size: 15, align: 'center' }) ],
});

// ── Status Bar ─────────────────────────────────────────────────────────────────
const StatusBar = () => F(0, 0, 390, 44, P.surface, { ch: [
  T('9:41', 20, 14, 60, 16, { size: 13, weight: 600, fill: P.fg }),
  T('● ▲ ⊟', 302, 14, 68, 16, { size: 10, fill: P.muted, align: 'right' }),
]});

// ── Bottom Nav ─────────────────────────────────────────────────────────────────
const BottomNav = (active = 0) => {
  const tabs = [['⌂','Home'],['◈','Spend'],['⇄','Txns'],['◎','Budget'],['✦','Insights']];
  return F(0, 764, 390, 80, P.surface, { ch: [
    Line(0, 0, 390, P.borderMd),
    ...tabs.map(([ic, lb], i) => {
      const nx = 8 + i * 75;
      const on = i === active;
      return [
        on ? F(nx + 14, 6, 46, 46, P.accent + '14', { r: 23 }) : null,
        T(ic, nx + 16, 12, 42, 22, { size: 16, fill: on ? P.accent : P.muted, align: 'center' }),
        T(lb, nx + 4, 38, 66, 13, { size: 8, fill: on ? P.accent : P.muted, align: 'center', weight: on ? 600 : 400 }),
      ].filter(Boolean);
    }).flat(),
  ]});
};

// ══════════════════════════════════════════════════════════════════════════════
// S1 — Dashboard
// ══════════════════════════════════════════════════════════════════════════════
function s1Dashboard(ox) {
  return F(ox, 0, 390, 844, P.bg, { ch: [
    StatusBar(),

    // Header
    T('Good morning, Zara ✦', 20, 52, 300, 22, { size: 16, weight: 600, fill: P.fg }),
    T('March 2026', 20, 76, 180, 16, { size: 12, fill: P.muted }),

    // Bell icon
    F(344, 52, 34, 34, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      T('◬', 7, 7, 20, 20, { size: 13, fill: P.fg }),
      E(26, 6, 8, 8, P.accent),
    ]}),

    // ── Hero spend card ────────────────────────────────────────────────────────
    F(20, 108, 350, 128, P.accent, { r: 22, ch: [
      T('TOTAL SPENT · MARCH', 16, 16, 280, 11, { size: 8, fill: '#fff', ls: 1.8, weight: 700, opacity: 0.70 }),
      T('$3,241', 16, 34, 230, 50, { size: 46, weight: 800, fill: '#fff' }),
      T('of $4,500 budget  ·  72%', 16, 86, 240, 15, { size: 10, fill: '#fff', opacity: 0.78 }),
      F(16, 108, 318, 7, 'rgba(255,255,255,0.28)', { r: 4, ch: [
        F(0, 0, Math.round(318 * 0.72), 7, '#fff', { r: 4 }),
      ]}),
      Pill(262, 14, '↑ 4.2%', '#D97706', { w: 68, h: 22, size: 9, bgAlpha: '30' }),
    ]}),

    // ── Bento mini-row ─────────────────────────────────────────────────────────
    // Left: Days left
    Card(20, 254, 162, 78, { r: 14, ch: [
      T('DAYS LEFT', 14, 12, 140, 11, { size: 8, fill: P.muted, ls: 1.2, weight: 600 }),
      T('16', 14, 28, 90, 36, { size: 32, weight: 800, fill: P.fg }),
      T('in March', 14, 64, 120, 11, { size: 9, fill: P.muted }),
    ]}),
    // Right: Daily avg
    Card(194, 254, 176, 78, { r: 14, ch: [
      T('DAILY AVG', 14, 12, 150, 11, { size: 8, fill: P.muted, ls: 1.2, weight: 600 }),
      T('$104', 14, 28, 130, 36, { size: 32, weight: 800, fill: P.fg }),
      T('target: $91 / day', 14, 64, 152, 11, { size: 9, fill: P.amber }),
    ]}),

    // ── Top Categories ─────────────────────────────────────────────────────────
    T('TOP CATEGORIES', 20, 348, 200, 13, { size: 9, fill: P.muted, weight: 600, ls: 1.5 }),
    T('View all →', 286, 348, 84, 13, { size: 9, fill: P.accent, weight: 600 }),

    ...[
      ['🏠', 'Housing',      '$1,200', 82, P.accent2],
      ['🍽️', 'Food & Drink', '$486',   67, P.accent],
      ['🚗', 'Transport',    '$218',   30, P.green],
      ['🛍️', 'Shopping',     '$198',   28, P.amber],
    ].map(([icon, name, amt, pct, color], i) =>
      Card(20, 370 + i * 60, 350, 50, { r: 12, ch: [
        IconBadge(12, 7, icon, color + '14'),
        T(name, 58, 8, 165, 15, { size: 12, weight: 600, fill: P.fg }),
        T(`${pct}% of budget`, 58, 26, 165, 13, { size: 9, fill: P.muted }),
        T(amt, 262, 8, 76, 16, { size: 13, weight: 700, fill: P.fg, align: 'right' }),
        BarH(58, 43, 232, 4, pct, color, P.border, { r: 2 }),
      ]}),
    ),

    // ── Quick Actions ──────────────────────────────────────────────────────────
    T('QUICK ACTIONS', 20, 622, 200, 13, { size: 9, fill: P.muted, weight: 600, ls: 1.5 }),
    ...[
      ['＋', 'Add',    P.accent],
      ['◷', 'Split',  P.accent2],
      ['⧉', 'Export', P.green],
      ['⊛', 'Goals',  P.amber],
    ].map(([ic, lb, color], i) =>
      F(20 + i * 86, 642, 76, 70, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
        F(20, 8, 36, 36, color + '12', { r: 10, ch: [
          T(ic, 0, 7, 36, 22, { size: 15, fill: color, align: 'center' }),
        ]}),
        T(lb, 0, 50, 76, 13, { size: 10, fill: P.fg, align: 'center', weight: 500 }),
      ]}),
    ),

    BottomNav(0),
  ].flat() });
}

// ══════════════════════════════════════════════════════════════════════════════
// S2 — Categories
// ══════════════════════════════════════════════════════════════════════════════
function s2Categories(ox) {
  const cats = [
    ['🏠', 'Housing',       1200, 1200, P.accent2,  'Rent + utilities'],
    ['🍽️', 'Food & Drink',   486,  600, P.accent,   'Dining + delivery'],
    ['🚗', 'Transport',      218,  400, P.green,    'Uber + Metro'],
    ['🛍️', 'Shopping',       198,  300, P.amber,    'Clothing + home'],
    ['💊', 'Health',          92,  200, P.green,    'Gym + pharmacy'],
    ['🎬', 'Entertainment',   47,  150, P.accent2,  'Streaming + events'],
    ['☕', 'Coffee',          82,   80, P.red,      'Over budget!'],
  ];

  return F(ox, 0, 390, 844, P.bg, { ch: [
    StatusBar(),
    T('Spending', 20, 52, 240, 26, { size: 22, weight: 800, fill: P.fg }),
    T('March 2026', 20, 82, 200, 16, { size: 12, fill: P.muted }),

    // Sort tabs
    F(20, 108, 350, 34, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      F(2, 2, 110, 30, P.accent, { r: 8, ch: [
        T('By Amount', 0, 7, 110, 16, { size: 10, fill: '#fff', align: 'center', weight: 600 }),
      ]}),
      T('By Category', 118, 9, 110, 16, { size: 10, fill: P.muted, align: 'center' }),
      T('By Date', 236, 9, 90, 16, { size: 10, fill: P.muted, align: 'center' }),
    ]}),

    T('$2,323 spent', 20, 156, 200, 18, { size: 14, weight: 700, fill: P.fg }),
    T('across 7 categories', 20, 176, 200, 14, { size: 11, fill: P.muted }),
    Pill(278, 154, '↑ from Feb', P.amber, { w: 90, h: 24, size: 9 }),

    ...cats.map(([icon, name, spent, budget, color, sub], i) => {
      const pct = Math.round((spent / budget) * 100);
      const over = pct >= 100;
      return Card(20, 206 + i * 72, 350, 62, { r: 12, ch: [
        IconBadge(12, 13, icon, color + '12'),
        T(name, 58, 8, 160, 15, { size: 12, weight: 600, fill: P.fg }),
        T(sub, 58, 25, 160, 13, { size: 9, fill: P.muted }),
        T(`$${spent}`, 262, 8, 76, 16, { size: 13, weight: 700, fill: over ? P.red : P.fg, align: 'right' }),
        T(`of $${budget}`, 262, 26, 76, 13, { size: 9, fill: P.muted, align: 'right' }),
        BarH(58, 50, 280, 5, pct, over ? P.red : color, P.border, { r: 3 }),
        over ? Pill(262, 44, '● OVER', P.red, { w: 60, h: 18, size: 8 }) : null,
      ].filter(Boolean)});
    }),

    BottomNav(1),
  ].flat() });
}

// ══════════════════════════════════════════════════════════════════════════════
// S3 — Transactions
// ══════════════════════════════════════════════════════════════════════════════
function s3Transactions(ox) {
  const txns = [
    { icon:'🍕', name:"Domino's Pizza",    cat:'Food',       amt:-34.50, date:'Today',     color:P.accent  },
    { icon:'🚇', name:'Metro Card',         cat:'Transport',  amt:-33.00, date:'Today',     color:P.green   },
    { icon:'📦', name:'Amazon',             cat:'Shopping',   amt:-67.99, date:'Yesterday', color:P.amber   },
    { icon:'☕', name:'Blue Bottle Coffee', cat:'Coffee',     amt:-7.25,  date:'Yesterday', color:P.amber   },
    { icon:'💰', name:'Paycheck',           cat:'Income',     amt:+3200,  date:'Mar 28',    color:P.green   },
    { icon:'🏋', name:'Equinox',            cat:'Health',     amt:-185,   date:'Mar 27',    color:P.green   },
    { icon:'🎬', name:'Netflix',            cat:'Entertain.', amt:-15.99, date:'Mar 26',    color:P.accent2 },
    { icon:'🍽', name:'Nobu Restaurant',    cat:'Food',       amt:-142,   date:'Mar 25',    color:P.accent  },
  ];

  const groups = {};
  txns.forEach(t => { if (!groups[t.date]) groups[t.date] = []; groups[t.date].push(t); });

  let yPos = 128;
  const rows = [];
  for (const [date, items] of Object.entries(groups)) {
    const dayTotal = items.reduce((s, t) => s + t.amt, 0);
    rows.push({ type:'header', date, dayTotal, y: yPos }); yPos += 30;
    items.forEach(txn => { rows.push({ type:'txn', txn, y: yPos }); yPos += 60; });
  }

  return F(ox, 0, 390, 844, P.bg, { ch: [
    StatusBar(),
    T('Transactions', 20, 52, 240, 26, { size: 22, weight: 800, fill: P.fg }),
    T('March 2026', 20, 82, 200, 16, { size: 12, fill: P.muted }),

    F(20, 106, 350, 36, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      T('🔍', 10, 9, 24, 18, { size: 13 }),
      T('Search transactions...', 38, 10, 250, 16, { size: 11, fill: P.muted }),
      Pill(282, 7, '⊞ Filter', P.accent2, { w: 60, h: 22, size: 9 }),
    ]}),

    ...rows.map(r => {
      if (r.type === 'header') {
        const pos = r.dayTotal >= 0;
        return [
          T(r.date, 20, r.y, 180, 15, { size: 10, fill: P.muted, weight: 600 }),
          T(pos ? `+$${r.dayTotal.toFixed(2)}` : `-$${Math.abs(r.dayTotal).toFixed(2)}`, 250, r.y, 100, 15, {
            size: 10, fill: pos ? P.green : P.muted, weight: 500, align: 'right',
          }),
        ];
      }
      const { txn } = r;
      const income = txn.amt > 0;
      return Card(20, r.y, 350, 50, { r: 12, ch: [
        F(12, 7, 36, 36, txn.color + '12', { r: 10, ch: [
          T(txn.icon, 0, 7, 36, 22, { size: 14, align: 'center' }),
        ]}),
        T(txn.name, 58, 8, 180, 15, { size: 12, weight: 600, fill: P.fg }),
        T(txn.cat, 58, 26, 120, 13, { size: 9, fill: P.muted }),
        T(income ? `+$${txn.amt.toFixed(2)}` : `-$${Math.abs(txn.amt).toFixed(2)}`, 246, 10, 92, 16, {
          size: 13, weight: 700, fill: income ? P.green : P.fg, align: 'right',
        }),
        T('›', 334, 17, 14, 16, { size: 16, fill: P.muted }),
      ]});
    }).flat(),

    BottomNav(2),
  ].flat() });
}

// ══════════════════════════════════════════════════════════════════════════════
// S4 — Budget
// ══════════════════════════════════════════════════════════════════════════════
function s4Budget(ox) {
  const allocs = [
    ['🏠','Housing',    1200,1200,P.accent2],
    ['🍽️','Food',        486, 600,P.accent],
    ['🚗','Transport',   218, 400,P.green],
    ['🛍️','Shopping',    198, 300,P.amber],
    ['💊','Health',       92, 200,P.green],
    ['🎬','Entertain.',   47, 150,P.accent2],
  ];

  return F(ox, 0, 390, 844, P.bg, { ch: [
    StatusBar(),
    T('Budget', 20, 52, 240, 26, { size: 22, weight: 800, fill: P.fg }),
    T('March 2026  ·  $4,500 total', 20, 82, 280, 16, { size: 12, fill: P.muted }),

    // Ring card
    Card(20, 106, 350, 196, { r: 20, ch: [
      // Ring track + fill (visual approximation)
      E(100, 22, 148, 148, 'transparent', { stroke: P.border, sw: 13 }),
      E(100, 22, 148, 148, 'transparent', { stroke: P.accent, sw: 13 }),
      // Center labels
      T('$3,241', 100, 62, 148, 34, { size: 24, weight: 800, fill: P.fg, align: 'center' }),
      T('of $4,500', 100, 98, 148, 15, { size: 10, fill: P.muted, align: 'center' }),
      T('72% used', 100, 116, 148, 15, { size: 10, fill: P.accent, align: 'center', weight: 600 }),

      // Right stats
      T('Remaining', 268, 48, 72, 13, { size: 9, fill: P.muted }),
      T('$1,259', 268, 62, 72, 20, { size: 15, weight: 700, fill: P.green }),
      Line(268, 88, 70, P.border),
      T('Days Left', 268, 96, 72, 13, { size: 9, fill: P.muted }),
      T('16', 268, 110, 72, 20, { size: 22, weight: 800, fill: P.fg }),
      T('in March', 268, 132, 72, 13, { size: 9, fill: P.muted }),
    ]}),

    T('ALLOCATION', 20, 316, 200, 13, { size: 9, fill: P.muted, weight: 600, ls: 1.5 }),
    T('Edit →', 290, 316, 80, 13, { size: 9, fill: P.accent, weight: 600 }),

    ...allocs.map(([icon, name, spent, budget, color], i) => {
      const pct = Math.round((spent / budget) * 100);
      const over = pct >= 100;
      return F(20, 336 + i * 56, 350, 46, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
        T(icon, 12, 9, 28, 28, { size: 15, align: 'center' }),
        T(name, 50, 8, 140, 15, { size: 11, weight: 600, fill: P.fg }),
        BarH(50, 29, 202, 5, pct, over ? P.red : color, P.border, { r: 3 }),
        T(`$${spent} / $${budget}`, 264, 8, 74, 13, { size: 9, fill: over ? P.red : P.muted, weight: 500, align: 'right' }),
        T(`${pct}%`, 264, 25, 74, 15, { size: 11, weight: 700, fill: over ? P.red : P.fg, align: 'right' }),
      ]});
    }),

    BottomNav(3),
  ].flat() });
}

// ══════════════════════════════════════════════════════════════════════════════
// S5 — Insights
// ══════════════════════════════════════════════════════════════════════════════
function s5Insights(ox) {
  const barVals = [84, 127, 56, 98, 210, 34, 0];
  const barDays = ['M','T','W','T','F','S','S'];

  return F(ox, 0, 390, 844, P.bg, { ch: [
    StatusBar(),
    T('Insights', 20, 52, 240, 26, { size: 22, weight: 800, fill: P.fg }),
    T('Personalized for you', 20, 82, 200, 16, { size: 12, fill: P.muted }),

    // AI hero card
    F(20, 106, 350, 114, P.accent, { r: 20, ch: [
      F(14, 14, 42, 42, 'rgba(255,255,255,0.18)', { r: 11, ch: [
        T('✦', 0, 8, 42, 26, { size: 18, fill: '#fff', align: 'center' }),
      ]}),
      T('Finch AI', 66, 14, 200, 15, { size: 11, fill: '#fff', weight: 700, opacity: 0.9 }),
      T('Weekly insight · high confidence', 66, 30, 250, 13, { size: 9, fill: '#fff', opacity: 0.65 }),
      T("You're spending $48 more on coffee\nthis month vs. last. Brewing at home\n3x/week could save $576 per year.", 14, 56, 322, 52, {
        size: 11, fill: '#fff', lh: 1.55,
      }),
    ]}),

    // Weekly cash flow mini chart
    T('THIS WEEK', 20, 234, 200, 13, { size: 9, fill: P.muted, weight: 600, ls: 1.5 }),
    Card(20, 254, 350, 124, { r: 16, ch: [
      T('Daily spend vs. target', 16, 12, 240, 14, { size: 10, weight: 600, fill: P.fg }),
      T('$91 / day goal', 16, 28, 200, 13, { size: 9, fill: P.muted }),
      // Target line
      Line(16, 64, 318, P.borderMd),
      T('— $91', 288, 55, 46, 13, { size: 8, fill: P.muted }),
      // Bars
      ...barVals.map((val, i) => {
        const barH = val === 0 ? 2 : Math.max(3, Math.round((val / 220) * 62));
        const color = val > 91 ? P.accent : P.green;
        const bx = 16 + i * 46;
        return [
          F(bx, 95 - barH, 36, barH, val === 0 ? P.border : color + 'CC', { r: 4 }),
          T(barDays[i], bx, 100, 36, 13, { size: 8, fill: P.muted, align: 'center' }),
        ];
      }).flat(),
    ]}),

    // Coaching cards
    T('COACHING TIPS', 20, 392, 200, 13, { size: 9, fill: P.muted, weight: 600, ls: 1.5 }),

    ...[
      { icon:'☕', color:P.amber,   title:'Coffee Habit',     body:'Brew at home 3×/week → save $82/mo', badge:'Save $984/yr', bc:P.green   },
      { icon:'🛍️', color:P.accent2, title:'Weekend Spending', body:"You shop 40% more on Saturdays",      badge:'Pattern',     bc:P.accent2 },
      { icon:'🎯', color:P.green,   title:'Budget Win!',      body:'Health is 54% under budget this month',badge:'✓ On track', bc:P.green   },
    ].map((tip, i) =>
      Card(20, 412 + i * 88, 350, 76, { r: 14, ch: [
        F(12, 12, 40, 40, tip.color + '12', { r: 10, ch: [
          T(tip.icon, 0, 8, 40, 24, { size: 15, align: 'center' }),
        ]}),
        T(tip.title, 62, 10, 200, 15, { size: 12, weight: 700, fill: P.fg }),
        T(tip.body, 62, 28, 212, 13, { size: 9, fill: P.muted, lh: 1.4 }),
        Pill(248, 44, tip.badge, tip.bc, { w: 90, h: 22, size: 8 }),
        T('›', 326, 24, 14, 28, { size: 18, fill: P.muted }),
      ]}),
    ),

    BottomNav(4),
  ].flat() });
}

// ══════════════════════════════════════════════════════════════════════════════
// ASSEMBLE & SAVE
// ══════════════════════════════════════════════════════════════════════════════
const W   = 390;
const GAP = 80;

const doc = {
  version: '2.8',
  name: 'FINCH — Personal Spend Intelligence',
  width:  5 * W + 6 * GAP,
  height: 844,
  fill:   P.bg,
  children: [
    s1Dashboard   (GAP),
    s2Categories  (GAP + (W + GAP)),
    s3Transactions(GAP + (W + GAP) * 2),
    s4Budget      (GAP + (W + GAP) * 3),
    s5Insights    (GAP + (W + GAP) * 4),
  ],
};

const outPath = path.join(__dirname, 'finch.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log('✓ finch.pen written —', Math.round(fs.statSync(outPath).size / 1024) + 'KB');
console.log('  5 screens: Dashboard · Categories · Transactions · Budget · Insights');
console.log('  Palette: cream #F5F3EF · coral #FF5C35 · indigo #6366F1 · green #16A34A');
