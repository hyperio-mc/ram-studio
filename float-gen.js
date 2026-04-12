'use strict';
// float-gen.js
// FLOAT — Financial nerve center for lean teams
//
// Challenge: Design a LIGHT-theme "financial operating system" for micro-companies
// and indie founders, inspired by:
//
// 1. Cardless.com (featured on land-book.com, March 2026) — "Build credit in your
//    world." Embedded credit card platform with modular, document-like editorial
//    layout. Professional typography mixing heavy headers with clean tabular data.
//
// 2. Midday.ai (on Godly.website + Dark Mode Design) — "Let agents run your
//    business." Transaction auto-reconciliation, clean table-based financial data,
//    agent-driven bookkeeping. "All your transactions, unified."
//
// 3. Paperclip (Lapa Ninja, March 2026) — "Open-source orchestration for zero-human
//    companies." The idea of autonomous financial agents handling entire workflows.
//
// Style I haven't used before: TABULAR EDITORIAL — mix of newspaper-weight large
// numerals (thin/light weight), small-caps labels, and data table rows. Financial
// document meets modern SaaS. Warm cream background.
//
// Palette: Warm cream (#F6F3EE) + cobalt blue + amber gold + clean white cards
// Screens: 6 mobile (390×844), light theme

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#F6F3EE',   // warm cream — quality paper
  bgAlt:    '#EEE9E0',   // slightly deeper cream
  surface:  '#FFFFFF',   // clean white card
  surface2: '#FAFAF8',   // off-white secondary
  border:   '#E5E0D8',   // warm grey border
  border2:  '#D4CEC5',   // slightly stronger border
  text:     '#151210',   // near-black warm
  textSub:  '#6B6560',   // secondary text
  muted:    '#A09A93',   // muted / placeholder
  accent:   '#1B4ED8',   // cobalt blue — financial trust
  accentBg: '#EEF2FF',   // blue tint bg
  amber:    '#D97706',   // amber — revenue / income
  amberBg:  '#FEF3C7',   // amber tint bg
  green:    '#059669',   // positive / paid
  greenBg:  '#ECFDF5',   // green tint bg
  red:      '#DC2626',   // negative / overdue
  redBg:    '#FEF2F2',   // red tint bg
  purple:   '#7C3AED',   // agent / AI
  purpleBg: '#F5F3FF',   // purple tint bg
  orange:   '#EA580C',   // pending
  orangeBg: '#FFF7ED',   // orange tint bg
};

let _id = 0;
const uid = () => `f${++_id}`;

// ── Primitives ─────────────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill || P.bg,
  clip: opts.clip !== undefined ? opts.clip : false,
  ...(opts.r !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke ? { stroke: { align: opts.strokeAlign || 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.ch || [],
});

const T = (content, x, y, w, h, opts = {}) => ({
  id: uid(), type: 'text', content, x, y, width: w, height: h,
  textGrowth: 'fixed-width-height',
  fontSize: opts.size || 13,
  fontWeight: String(opts.weight || 400),
  fill: opts.fill || P.text,
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

const Line  = (x, y, w, fill = P.border) => F(x, y, w, 1, fill, {});
const VLine = (x, y, h, fill = P.border) => F(x, y, 1, h, fill, {});

// ── Label (small caps uppercase helper) ────────────────────────────────────────
const Label = (text, x, y, opts = {}) => T(text.toUpperCase(), x, y,
  opts.w || 160, 14, { size: 9, weight: 600, fill: opts.fill || P.muted, ls: 0.8, ...opts });

// ── Pill ───────────────────────────────────────────────────────────────────────
const Pill = (x, y, text, bg, fg, opts = {}) => {
  const w = opts.w || (text.length * 6.2 + 16);
  return F(x, y, w, 20, bg, {
    r: 10,
    ch: [T(text, 0, 3, w, 14, { size: 9, weight: 600, fill: fg, align: 'center', ls: 0.4 })],
  });
};

// ── Card ───────────────────────────────────────────────────────────────────────
const Card = (x, y, w, h, opts = {}) => F(x, y, w, h, opts.fill || P.surface, {
  r: opts.r !== undefined ? opts.r : 14,
  stroke: opts.stroke || P.border,
  sw: opts.sw || 1,
  ch: opts.ch || [],
});

// ── Progress bar ──────────────────────────────────────────────────────────────
const Bar = (x, y, w, pct, color, opts = {}) => [
  F(x, y, w, opts.h || 4, P.border, { r: 2 }),
  F(x, y, Math.max(4, Math.round(w * pct / 100)), opts.h || 4, color, { r: 2 }),
];

// ── Sparkline (bar chart) ──────────────────────────────────────────────────────
const Spark = (x, y, data, color, opts = {}) => {
  const maxVal = Math.max(...data);
  const barW = opts.barW || 5;
  const gap  = opts.gap  || 3;
  const maxH = opts.maxH || 28;
  return data.map((v, i) => {
    const h = Math.max(3, Math.round(v / maxVal * maxH));
    return F(x + i * (barW + gap), y + (maxH - h), barW, h, color, { r: 1 });
  });
};

// ── Amount text (right-aligned) ───────────────────────────────────────────────
const Amount = (val, x, y, opts = {}) => T(val, x, y, opts.w || 90, opts.h || 18,
  { size: opts.size || 13, weight: opts.weight || 500, fill: opts.fill || P.text,
    align: 'right', ls: -0.2, ...opts });

// ── Transaction row ────────────────────────────────────────────────────────────
const TxRow = (x, y, w, icon, name, cat, amount, isPos, date, opts = {}) => {
  const dotColor = isPos ? P.green : (opts.pending ? P.orange : P.red);
  return F(x, y, w, 54, 'transparent', {
    ch: [
      // Icon circle
      E(0, 8, 36, 36, opts.iconBg || P.bgAlt),
      T(icon, 4, 14, 28, 24, { size: 14, align: 'center', fill: P.textSub }),
      // Name + category
      T(name, 46, 8, 200, 16, { size: 13, weight: 500 }),
      T(cat, 46, 27, 160, 14, { size: 11, fill: P.muted }),
      // Amount
      Amount(amount, w - 94, 8, { size: 13, fill: dotColor }),
      T(date, w - 94, 27, 90, 13, { size: 10, fill: P.muted, align: 'right' }),
      // Bottom divider
      ...(opts.noLine ? [] : [Line(46, 53, w - 46, P.border)]),
    ],
  });
};

// ── Screen ────────────────────────────────────────────────────────────────────
const W = 390, H = 844;
const Screen = (x, children) => F(x, 0, W, H, P.bg, { clip: true, ch: children });

// ── Status bar ────────────────────────────────────────────────────────────────
const StatusBar = (x = 0) => F(x, 0, W, 44, 'transparent', {
  ch: [
    T('9:41', 16, 14, 60, 16, { size: 13, weight: 600 }),
    T('●●●', W - 82, 16, 70, 14, { size: 10, fill: P.muted, align: 'right' }),
  ],
});

// ── Bottom nav ────────────────────────────────────────────────────────────────
const NAV_ICONS = ['◈', '↕', '⊟', '◎', '⊕'];
const NAV_LABELS = ['Overview', 'Transactions', 'Invoices', 'Agents', 'Reports'];
const BottomNav = (activeIdx, screenX = 0) => {
  const tabW = W / 5;
  const tabs = NAV_ICONS.map((icon, i) => {
    const isActive = i === activeIdx;
    return F(screenX + i * tabW, 0, tabW, 56, 'transparent', {
      ch: [
        T(icon, 0, 8, tabW, 18, { size: 18, align: 'center', fill: isActive ? P.accent : P.muted }),
        T(NAV_LABELS[i], 0, 30, tabW, 12, { size: 9, align: 'center', weight: isActive ? 600 : 400,
          fill: isActive ? P.accent : P.muted, ls: 0.2 }),
      ],
    });
  });
  return F(screenX, H - 80, W, 80, P.surface, {
    stroke: P.border,
    sw: 1,
    ch: [
      ...tabs,
      // Active indicator dot
      F(activeIdx * tabW + tabW/2 - 12, 0, 24, 2, P.accent, { r: 1 }),
    ],
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 0 — Overview
// ─────────────────────────────────────────────────────────────────────────────
const makeOverview = (sx) => {
  const sparkData = [32, 41, 28, 55, 47, 62, 44, 58, 71, 48, 65, 78, 53, 67, 82, 60, 74, 55, 88, 70];

  // Balance hero card
  const heroCard = Card(16, 60, W - 32, 148, {
    fill: P.accent,
    stroke: 'transparent',
    ch: [
      Label('total cash balance', 20, 20, { fill: 'rgba(255,255,255,0.6)' }),
      T('$48,320', 20, 36, 300, 52, { size: 44, weight: 300, fill: '#FFFFFF', ls: -2, lh: 1.0 }),
      T('.14', 20, 88, 80, 20, { size: 14, weight: 400, fill: 'rgba(255,255,255,0.55)', ls: -0.3 }),
      // Runway
      F(W - 32 - 110, 20, 94, 52, 'rgba(255,255,255,0.12)', {
        r: 10,
        ch: [
          T('RUNWAY', 0, 10, 94, 12, { size: 8, weight: 700, fill: 'rgba(255,255,255,0.5)', align: 'center', ls: 0.8 }),
          T('8.2 mo', 0, 24, 94, 20, { size: 18, weight: 600, fill: '#FFFFFF', align: 'center', ls: -0.5 }),
        ],
      }),
      // Mini spark bars inside hero
      ...sparkData.slice(10).map((v, i) => {
        const maxV = Math.max(...sparkData.slice(10));
        const barH = Math.max(3, Math.round(v / maxV * 16));
        return F(20 + i * 8, 148 - 16 - 10 - barH + 16, 5, barH, 'rgba(255,255,255,0.3)', { r: 1 });
      }),
      T('+12.4% this month', 20 + 10 * 8 + 8, 148 - 10 - 13 + 6, 120, 12,
        { size: 10, fill: 'rgba(255,255,255,0.65)' }),
    ],
  });

  // 3-metric row
  const metrics = [
    { label: 'INCOME', val: '$12.4K', sub: 'this month', color: P.amber, bg: P.amberBg },
    { label: 'EXPENSES', val: '$6.8K', sub: 'this month', color: P.red, bg: P.redBg },
    { label: 'SAVED', val: '$5.6K', sub: 'net flow', color: P.green, bg: P.greenBg },
  ];
  const metricW = (W - 32 - 12) / 3;
  const metricCards = metrics.map((m, i) =>
    Card(16 + i * (metricW + 6), 224, metricW, 74, {
      stroke: m.color + '22',
      ch: [
        Label(m.label, 10, 10, { fill: m.color, w: metricW - 20 }),
        T(m.val, 10, 26, metricW - 20, 26, { size: 20, weight: 600, fill: m.color, ls: -0.5 }),
        T(m.sub, 10, 54, metricW - 20, 12, { size: 9, fill: P.muted }),
      ],
    })
  );

  // Cash flow sparkline section
  const flowCard = Card(16, 310, W - 32, 96, {
    ch: [
      Label('WEEKLY CASH FLOW', 16, 14),
      T('Trend →  up 22% vs last month', W - 32 - 16 - 160, 13, 160, 14,
        { size: 10, fill: P.green, align: 'right' }),
      ...Spark(16, 36, sparkData, P.accent + 'BB', { barW: 12, gap: 4, maxH: 36 }),
    ],
  });

  // Agents summary
  const agentCard = Card(16, 418, W - 32, 76, {
    fill: P.purpleBg,
    stroke: P.purple + '22',
    ch: [
      E(14, 14, 38, 38, P.purple + '1A'),
      T('⚡', 14, 19, 38, 28, { size: 14, align: 'center', fill: P.purple }),
      T('3 agents working', 62, 14, 200, 16, { size: 13, weight: 600, fill: P.purple }),
      T('Reconciled 14 txns · Matched 2 invoices · 1 alert', 62, 33, 280, 13,
        { size: 10, fill: P.purple, opacity: 0.7 }),
      Pill(62, 52, 'VIEW LOG', P.purple + '15', P.purple, { w: 70 }),
    ],
  });

  // Recent transactions preview
  const txCard = Card(16, 506, W - 32, 200, {
    ch: [
      T('Recent Activity', 16, 14, 200, 16, { size: 13, weight: 600 }),
      T('See all →', W - 32 - 16 - 60, 15, 60, 14, { size: 11, fill: P.accent, align: 'right' }),
      Line(0, 40, W - 32),
      TxRow(16, 44, W - 32 - 32, '☁', 'AWS Services', 'Infrastructure', '-$189.00', false, 'Today'),
      TxRow(16, 98, W - 32 - 32, '↑', 'Client Payment', 'Income', '+$3,500', true, 'Yesterday'),
      TxRow(16, 152, W - 32 - 32, '✦', 'Figma', 'Software', '-$45.00', false, 'Mar 27', { noLine: true }),
    ],
  });

  return Screen(sx, [
    StatusBar(0),
    F(0, 44, W, 16, 'transparent', {}),
    // Header
    T('Float', 20, 50, 100, 28, { size: 22, weight: 700, ls: -0.5 }),
    T('Mar 2026', W - 100, 57, 84, 16, { size: 12, fill: P.textSub, align: 'right' }),
    heroCard,
    ...metricCards,
    flowCard,
    agentCard,
    txCard,
    BottomNav(0, 0),
  ]);
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 1 — Transactions
// ─────────────────────────────────────────────────────────────────────────────
const makeTxScreen = (sx) => {
  const txns = [
    { icon: '↑', name: 'Client Payment — Relay', cat: 'Income', amt: '+$4,200.00', pos: true, date: 'Mar 29' },
    { icon: '☁', name: 'AWS Services', cat: 'Infrastructure', amt: '-$189.50', pos: false, date: 'Mar 29' },
    { icon: '✦', name: 'Figma Pro', cat: 'Software', amt: '-$45.00', pos: false, date: 'Mar 28' },
    { icon: '⌂', name: 'WeWork — Office', cat: 'Facilities', amt: '-$680.00', pos: false, date: 'Mar 27' },
    { icon: '↑', name: 'Retainer — Acme Co.', cat: 'Income', amt: '+$2,800.00', pos: true, date: 'Mar 26' },
    { icon: '◎', name: 'OpenAI API', cat: 'AI/Software', amt: '-$112.40', pos: false, date: 'Mar 25' },
    { icon: '↑', name: 'Consulting Fee', cat: 'Income', amt: '+$1,500.00', pos: true, date: 'Mar 24' },
    { icon: '⊗', name: 'Stripe Fees', cat: 'Payment Processing', amt: '-$34.80', pos: false, date: 'Mar 24', pending: true },
  ];

  // Filter chips
  const filters = ['All', 'Income', 'Expenses', 'Pending'];
  const filterChips = filters.map((f, i) =>
    F(16 + i * 78, 0, 70, 28, i === 0 ? P.accent : P.surface, {
      r: 14,
      stroke: i === 0 ? 'transparent' : P.border,
      ch: [T(f, 0, 7, 70, 14, { size: 11, align: 'center', weight: i === 0 ? 600 : 400,
        fill: i === 0 ? '#FFF' : P.textSub })],
    })
  );

  // Summary header
  const summaryRow = F(16, 116, W - 32, 48, P.surface, {
    r: 10,
    stroke: P.border,
    ch: [
      T('28 transactions', 14, 8, 160, 14, { size: 11, weight: 600 }),
      T('Mar 2026', 14, 26, 100, 12, { size: 10, fill: P.muted }),
      VLine(W - 32 - 130, 8, 32),
      T('+$12,400', W - 32 - 124, 6, 80, 16, { size: 12, weight: 600, fill: P.green, align: 'right' }),
      T('-$6,820', W - 32 - 124, 26, 80, 13, { size: 11, fill: P.red, align: 'right' }),
    ],
  });

  // Transaction list
  const txList = txns.map((t, i) =>
    TxRow(16, 180 + i * 54, W - 32, t.icon, t.name, t.cat, t.amt, t.pos, t.date,
      { noLine: i === txns.length - 1, pending: t.pending })
  );

  return Screen(sx, [
    StatusBar(0),
    T('Transactions', 20, 54, 240, 24, { size: 20, weight: 700, ls: -0.5 }),
    T('↓ Export', W - 100, 60, 84, 16, { size: 12, fill: P.accent, align: 'right' }),
    // Filter
    F(0, 90, W, 28, 'transparent', { ch: filterChips }),
    summaryRow,
    // List
    Card(16, 172, W - 32, txns.length * 54 + 16, {
      ch: txList,
    }),
    BottomNav(1, 0),
  ]);
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 2 — Invoices
// ─────────────────────────────────────────────────────────────────────────────
const makeInvoiceScreen = (sx) => {
  const invoices = [
    { id: 'INV-2043', client: 'Relay Digital', amt: '$4,200.00', due: 'Mar 31', status: 'DUE SOON', sc: P.amber, sb: P.amberBg },
    { id: 'INV-2042', client: 'Acme Co.', amt: '$2,800.00', due: 'Apr 5', status: 'SENT', sc: P.accent, sb: P.accentBg },
    { id: 'INV-2041', client: 'Northfield Inc.', amt: '$1,500.00', due: 'Apr 12', status: 'DRAFT', sc: P.muted, sb: P.bgAlt },
    { id: 'INV-2040', client: 'Petra Labs', amt: '$8,500.00', due: 'Mar 15', status: 'PAID', sc: P.green, sb: P.greenBg },
    { id: 'INV-2039', client: 'Solaris Co.', amt: '$3,200.00', due: 'Mar 10', status: 'PAID', sc: P.green, sb: P.greenBg },
    { id: 'INV-2038', client: 'Venom Media', amt: '$950.00', due: 'Feb 28', status: 'OVERDUE', sc: P.red, sb: P.redBg },
  ];

  // AR summary cards
  const arSummary = [
    { label: 'OUTSTANDING', val: '$8,500', count: '3 invoices', color: P.amber },
    { label: 'PAID (MTD)', val: '$11,700', count: '2 invoices', color: P.green },
  ];
  const arCards = arSummary.map((a, i) => Card(16 + i * ((W - 32 - 8) / 2 + 8), 84,
    (W - 32 - 8) / 2, 66, {
      stroke: a.color + '22',
      ch: [
        Label(a.label, 12, 10, { fill: a.color }),
        T(a.val, 12, 26, 140, 26, { size: 22, weight: 600, fill: a.color, ls: -0.5 }),
        T(a.count, 12, 52, 140, 12, { size: 9, fill: P.muted }),
      ],
    })
  );

  const invRows = invoices.map((inv, i) => {
    const isLast = i === invoices.length - 1;
    return F(0, i * 74, W - 32, 74, 'transparent', {
      ch: [
        T(inv.id, 16, 12, 100, 14, { size: 11, weight: 600, fill: P.textSub }),
        T(inv.client, 16, 28, 200, 16, { size: 13, weight: 500 }),
        T(`Due ${inv.due}`, 16, 48, 120, 12, { size: 10, fill: P.muted }),
        // Amount
        T(inv.amt, W - 32 - 16 - 100, 12, 100, 16, { size: 14, weight: 600, align: 'right' }),
        Pill(W - 32 - 16 - 74, 34, inv.status, inv.sb, inv.sc),
        ...(isLast ? [] : [Line(16, 73, W - 32 - 32)]),
      ],
    });
  });

  // + New Invoice button
  const newBtn = F(16, 72 + 84 + invoices.length * 74 + 16, W - 32, 44, P.accentBg, {
    r: 10,
    stroke: P.accent + '33',
    ch: [
      T('+ New Invoice', 0, 13, W - 32, 18, { size: 13, weight: 600, fill: P.accent, align: 'center' }),
    ],
  });

  return Screen(sx, [
    StatusBar(0),
    T('Invoices', 20, 54, 200, 24, { size: 20, weight: 700, ls: -0.5 }),
    T('Filter ▾', W - 90, 60, 74, 16, { size: 12, fill: P.textSub, align: 'right' }),
    ...arCards,
    Card(16, 164, W - 32, invoices.length * 74, {
      ch: invRows,
    }),
    newBtn,
    BottomNav(2, 0),
  ]);
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 3 — Agent Log
// ─────────────────────────────────────────────────────────────────────────────
const makeAgentScreen = (sx) => {
  const agents = [
    { name: 'Reconciler', desc: 'Auto-matching bank transactions', status: 'RUNNING', color: P.purple, tasks: 14, total: 14 },
    { name: 'Invoice Tracker', desc: 'Monitoring payment due dates', status: 'IDLE', color: P.green, tasks: 6, total: 6 },
    { name: 'Tax Prep', desc: 'Categorizing Q1 deductibles', status: 'RUNNING', color: P.amber, tasks: 38, total: 62 },
    { name: 'Cash Forecast', desc: 'Projecting 90-day runway', status: 'QUEUED', color: P.orange, tasks: 0, total: 1 },
  ];

  const log = [
    { time: '9:41', agent: 'Reconciler', msg: 'Matched INV-2043 → AWS payment $189.50', type: 'match' },
    { time: '9:39', agent: 'Tax Prep', msg: 'Tagged 8 SaaS expenses as deductible', type: 'tag' },
    { time: '9:35', agent: 'Reconciler', msg: 'Auto-categorized "WeWork" → Facilities', type: 'cat' },
    { time: '9:28', agent: 'Invoice Tracker', msg: 'Sent reminder: INV-2043 due in 2 days', type: 'alert' },
    { time: '9:14', agent: 'Tax Prep', msg: 'Imported Q1 receipts: 23 items', type: 'import' },
  ];

  const agentTypeColors = { match: P.green, tag: P.purple, cat: P.accent, alert: P.amber, import: P.textSub };

  const agentCards = agents.map((a, i) => {
    const pct = a.tasks / (a.total || 1) * 100;
    const statusText = a.status === 'RUNNING' ? '● ' + a.status : a.status;
    return Card(16, 72 + i * 84, W - 32, 76, {
      ch: [
        E(14, 14, 36, 36, a.color + '18'),
        T('⚡', 14, 20, 36, 24, { size: 12, align: 'center', fill: a.color }),
        T(a.name, 60, 12, 200, 16, { size: 13, weight: 600 }),
        T(a.desc, 60, 30, W - 32 - 60 - 80, 13, { size: 10, fill: P.muted }),
        Pill(W - 32 - 14 - 72, 14, statusText, a.color + '15', a.color),
        ...Bar(60, 52, W - 32 - 60 - 14, pct, a.color, { h: 3 }),
        T(`${a.tasks}/${a.total} tasks`, 60, 60, 80, 11, { size: 9, fill: P.muted }),
      ],
    });
  });

  const logCard = Card(16, 72 + agents.length * 84 + 8, W - 32, log.length * 52 + 24, {
    ch: [
      T('Activity Log', 16, 12, 200, 16, { size: 12, weight: 600 }),
      Line(0, 34, W - 32),
      ...log.map((l, i) => F(16, 38 + i * 52, W - 32 - 32, 48, 'transparent', {
        ch: [
          T(l.time, 0, 2, 36, 12, { size: 9, fill: P.muted }),
          T(l.agent, 0, 16, 100, 12, { size: 10, weight: 600, fill: agentTypeColors[l.type] }),
          T(l.msg, 0, 32, W - 32 - 32 - 36 - 12, 14, { size: 10, fill: P.textSub }),
          F(W - 32 - 32 - 12, 2, 6, 6, agentTypeColors[l.type], { r: 3 }),
          ...(i < log.length - 1 ? [Line(0, 50, W - 32 - 32)] : []),
        ],
      })),
    ],
  });

  return Screen(sx, [
    StatusBar(0),
    T('Agents', 20, 54, 160, 24, { size: 20, weight: 700, ls: -0.5 }),
    Pill(W - 110, 59, '3 ACTIVE', P.purpleBg, P.purple, { w: 74 }),
    ...agentCards,
    logCard,
    BottomNav(3, 0),
  ]);
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 4 — Reports
// ─────────────────────────────────────────────────────────────────────────────
const makeReportScreen = (sx) => {
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const incomeData  = [8200, 9400, 11200, 7800, 10600, 12400];
  const expenseData = [4100, 5200, 6800, 5400, 6200, 6820];

  // Dual-bar chart
  const chartH = 80;
  const maxVal = Math.max(...incomeData);
  const chartBars = months.map((m, i) => {
    const iH = Math.round(incomeData[i] / maxVal * chartH);
    const eH = Math.round(expenseData[i] / maxVal * chartH);
    const barW = 20;
    const gapBetween = 4;
    const groupW = barW * 2 + gapBetween;
    const startX = 16 + i * (groupW + 8);
    return [
      F(startX, chartH - iH, barW, iH, P.amber + 'CC', { r: 3 }),
      F(startX + barW + gapBetween, chartH - eH, barW, eH, P.red + '99', { r: 3 }),
      T(m, startX - 2, chartH + 4, groupW + 4, 12, { size: 8, align: 'center', fill: P.muted }),
    ];
  });

  const chartCard = Card(16, 72, W - 32, chartH + 58, {
    ch: [
      T('Revenue vs Expenses', 16, 12, 240, 16, { size: 13, weight: 600 }),
      // Legend
      F(W - 32 - 130, 10, 10, 10, P.amber + 'CC', { r: 2 }),
      T('Income', W - 32 - 116, 11, 50, 12, { size: 9, fill: P.textSub }),
      F(W - 32 - 62, 10, 10, 10, P.red + '99', { r: 2 }),
      T('Expenses', W - 32 - 48, 11, 55, 12, { size: 9, fill: P.textSub }),
      Line(0, 32, W - 32),
      // Bar chart
      F(0, 36, W - 32, chartH + 18, 'transparent', { ch: chartBars.flat() }),
    ],
  });

  // Expense categories
  const cats = [
    { name: 'Infrastructure', pct: 28, amt: '$1,909', color: P.accent },
    { name: 'Software & Tools', pct: 22, amt: '$1,500', color: P.purple },
    { name: 'Facilities', pct: 20, amt: '$1,364', color: P.amber },
    { name: 'Marketing', pct: 18, amt: '$1,228', color: P.orange },
    { name: 'Other', pct: 12, amt: '$819', color: P.muted },
  ];

  const catCard = Card(16, 72 + chartH + 72, W - 32, 24 + cats.length * 44, {
    ch: [
      T('Expense Breakdown', 16, 12, 240, 16, { size: 13, weight: 600 }),
      T('Mar 2026', W - 32 - 16 - 60, 13, 60, 14, { size: 10, fill: P.muted, align: 'right' }),
      Line(0, 32, W - 32),
      ...cats.map((c, i) => F(16, 36 + i * 44, W - 32 - 32, 40, 'transparent', {
        ch: [
          T(c.name, 0, 2, 180, 14, { size: 12, weight: 500 }),
          T(c.amt, W - 32 - 32 - 60, 2, 60, 14, { size: 12, align: 'right', fill: P.textSub }),
          ...Bar(0, 22, W - 32 - 32 - 60 - 8, c.pct, c.color, { h: 3 }),
          T(`${c.pct}%`, W - 32 - 32 - 60, 19, 60, 11, { size: 9, fill: P.muted, align: 'right' }),
          ...(i < cats.length - 1 ? [Line(0, 39, W - 32 - 32)] : []),
        ],
      })),
    ],
  });

  // Net summary
  const netCard = Card(16, 72 + chartH + 72 + cats.length * 44 + 40, W - 32, 56, {
    fill: P.greenBg,
    stroke: P.green + '22',
    ch: [
      Label('NET CASHFLOW — MAR 2026', 16, 10, { fill: P.green }),
      T('+$5,580', 16, 26, 180, 26, { size: 26, weight: 300, fill: P.green, ls: -1 }),
      T('↑ vs $4,400 last month', W - 32 - 16 - 160, 32, 160, 16,
        { size: 11, fill: P.green, align: 'right' }),
    ],
  });

  return Screen(sx, [
    StatusBar(0),
    T('Reports', 20, 54, 160, 24, { size: 20, weight: 700, ls: -0.5 }),
    T('Export PDF', W - 110, 60, 94, 16, { size: 12, fill: P.accent, align: 'right' }),
    chartCard,
    catCard,
    netCard,
    BottomNav(4, 0),
  ]);
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 5 — Invoice Detail (tap into an invoice)
// ─────────────────────────────────────────────────────────────────────────────
const makeInvoiceDetail = (sx) => {
  const lineItems = [
    { desc: 'Brand Strategy Sprint', qty: '1×', amt: '$2,000.00' },
    { desc: 'UX Research & Wireframes', qty: '1×', amt: '$1,400.00' },
    { desc: 'Visual Identity System', qty: '1×', amt: '$600.00' },
    { desc: 'Delivery & Revisions', qty: '2×', amt: '$200.00' },
  ];

  const detailCard = Card(16, 68, W - 32, 420, {
    ch: [
      // Invoice header
      F(0, 0, W - 32, 80, P.accent, { r: 14, ch: [
        T('INVOICE', 20, 14, 200, 12, { size: 9, weight: 700, fill: 'rgba(255,255,255,0.6)', ls: 1 }),
        T('INV-2043', 20, 28, 200, 24, { size: 20, weight: 700, fill: '#FFFFFF', ls: -0.3 }),
        T('Due Mar 31, 2026', 20, 56, 200, 14, { size: 11, fill: 'rgba(255,255,255,0.65)' }),
        Pill(W - 32 - 96, 28, 'DUE SOON', P.amberBg, P.amber, { w: 80 }),
      ]}),
      // Client info
      T('BILLED TO', 20, 94, 100, 12, { size: 9, weight: 600, fill: P.muted, ls: 0.8 }),
      T('Relay Digital Inc.', 20, 108, 240, 16, { size: 14, weight: 600 }),
      T('accounts@relay.co', 20, 128, 240, 14, { size: 11, fill: P.textSub }),
      Line(0, 150, W - 32, P.border),
      // Line items
      T('LINE ITEMS', 20, 160, 200, 12, { size: 9, weight: 600, fill: P.muted, ls: 0.8 }),
      ...lineItems.map((l, i) => F(20, 178 + i * 36, W - 32 - 40, 32, 'transparent', {
        ch: [
          T(l.desc, 0, 2, W - 32 - 40 - 100, 14, { size: 12 }),
          T(l.qty, W - 32 - 40 - 98, 2, 30, 14, { size: 11, fill: P.muted }),
          T(l.amt, W - 32 - 40 - 90, 2, 90, 14, { size: 12, weight: 500, align: 'right' }),
          Line(0, 30, W - 32 - 40),
        ],
      })),
      // Total
      F(20, 178 + lineItems.length * 36 + 8, W - 32 - 40, 36, 'transparent', {
        ch: [
          T('TOTAL', 0, 10, 100, 14, { size: 10, weight: 700, fill: P.textSub, ls: 0.6 }),
          T('$4,200.00', W - 32 - 40 - 90, 6, 90, 22, { size: 18, weight: 700, align: 'right', fill: P.accent }),
        ],
      }),
    ],
  });

  // Action buttons
  const sendBtn = F(16, 500, W - 32, 44, P.accent, {
    r: 12,
    ch: [T('Send Reminder', 0, 13, W - 32, 18, { size: 13, weight: 600, fill: '#FFF', align: 'center' })],
  });
  const markBtn = F(16, 552, (W - 32 - 8) / 2, 40, P.greenBg, {
    r: 12,
    stroke: P.green + '33',
    ch: [T('Mark Paid', 0, 12, (W - 32 - 8) / 2, 16, { size: 12, weight: 600, fill: P.green, align: 'center' })],
  });
  const editBtn = F(16 + (W - 32 - 8) / 2 + 8, 552, (W - 32 - 8) / 2, 40, P.surface, {
    r: 12,
    stroke: P.border,
    ch: [T('Edit Draft', 0, 12, (W - 32 - 8) / 2, 16, { size: 12, weight: 500, fill: P.textSub, align: 'center' })],
  });

  return Screen(sx, [
    StatusBar(0),
    // Back nav
    T('← Invoices', 20, 52, 100, 16, { size: 13, fill: P.accent }),
    T('INV-2043', 130, 52, W - 130 - 20, 16, { size: 13, weight: 600, align: 'right' }),
    detailCard,
    sendBtn,
    markBtn,
    editBtn,
    BottomNav(2, 0),
  ]);
};

// ─────────────────────────────────────────────────────────────────────────────
// ASSEMBLE
// ─────────────────────────────────────────────────────────────────────────────
const SCREENS = [
  makeOverview(0),
  makeTxScreen(W + 40),
  makeInvoiceScreen((W + 40) * 2),
  makeAgentScreen((W + 40) * 3),
  makeReportScreen((W + 40) * 4),
  makeInvoiceDetail((W + 40) * 5),
];

const pen = {
  version: '2.8',
  name: 'FLOAT — Financial nerve center for lean teams',
  width:  SCREENS.length * (W + 40),
  height: H,
  fill: '#EDEBE6',
  children: SCREENS,
};

const OUT = path.join(__dirname, 'float.pen');
fs.writeFileSync(OUT, JSON.stringify(pen, null, 2));
console.log(`✓ float.pen written — ${(fs.statSync(OUT).size / 1024).toFixed(1)} KB`);
