'use strict';
// mesa-app.js
// MESA — Revenue clarity for solopreneur founders
//
// Challenge: Design a warm, editorial LIGHT-themed revenue intelligence
// dashboard for indie founders — inverting the dominant dark fintech aesthetic
// into airy cream + indigo + coral. Directly inspired by:
//
// 1. Midday.ai (darkmodedesign.com, 2026) — "The business stack for modern
//    founders." Featured prominently with "Let agents run your business."
//    Dark financial dashboard → INVERTED to warm editorial light.
//
// 2. Cardless + GTM Analytics/Equals (land-book.com) — embedded fintech &
//    data-first analytics landing pages. Understated authority, data density.
//
// 3. Awwwards nominees (The Lookback, GQ & AP Extraordinary Lab) — editorial
//    grid layouts, strong typographic hierarchy, magazine-feel structure.
//
// Push: warm cream (#F7F4EE base), editorial type contrast, AI agent status
// strips, dense financial data that breathes. WSJ meets Linear meets Notion.
//
// Screens (5 mobile 390×844):
// 1. Overview  — revenue snapshot, AI agent activity feed
// 2. Clients   — client roster with billing tier + status
// 3. Invoice   — single invoice detail + payment timeline
// 4. Insights  — AI revenue trends + monthly bar chart
// 5. Settings  — integrations + AI agent toggles

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#F7F4EE',   // warm cream — editorial base
  surface:  '#FFFFFF',   // pure white card
  surface2: '#F1EDE5',   // warm inset
  surface3: '#E9E4DA',   // sunken panel / divider
  border:   '#DDD9CF',   // warm subtle border
  border2:  '#C4BFB3',   // stronger border
  muted:    '#9A9288',   // warm medium grey
  fg:       '#1A1612',   // warm near-black headline
  fg2:      '#3C3630',   // secondary body text
  accent:   '#3D35F0',   // electric indigo — 2025/26 SaaS trend
  accent2:  '#FF5F38',   // warm coral
  green:    '#16A865',   // income / paid
  amber:    '#E87C30',   // pending / warning
  dim:      '#EBE7DE',
};

let _id = 0;
const uid = () => `m${++_id}`;

// ── Primitives ────────────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill || P.bg,
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
  ...(opts.italic ? { italic: true } : {}),
});

const Line = (x, y, w, fill, opts = {}) =>
  F(x, y, w, opts.h || 1, fill, {});

const E = (x, y, w, h, fill, opts = {}) =>
  ({ id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
     ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}) });

const Pill = (x, y, label, color, opts = {}) =>
  F(x, y, opts.w || 76, opts.h || 22, opts.solid ? color : color + '1E', {
    r: 11, ch: [
      T(label, 0, opts.solid ? 4 : 4, opts.w || 76, 14,
        { size: opts.size || 9, fill: opts.solid ? '#fff' : color,
          align: 'center', weight: 600, ls: 0.4 }),
    ],
  });

// ── Status bar ────────────────────────────────────────────────────────────────
const StatusBar = () =>
  F(0, 0, 390, 48, P.surface, { ch: [
    T('9:41', 20, 16, 60, 16, { size: 13, weight: 600, fill: P.fg }),
    T('● ▲ ▊▊', 290, 16, 80, 16, { size: 10, fill: P.muted, align: 'right' }),
  ]});

// ── Bottom nav ────────────────────────────────────────────────────────────────
const BottomNav = (active) => {
  const items = [
    ['◉', 'Home'],
    ['◈', 'Clients'],
    ['⊕', 'Invoice'],
    ['◎', 'Insights'],
    ['⚙', 'Settings'],
  ];
  return F(0, 764, 390, 80, P.surface, { ch: [
    Line(0, 0, 390, P.border),
    ...items.flatMap(([ic, lb], j) => {
      const nx = 8 + j * 75;
      const on = j === active;
      return [
        on ? F(nx + 12, 6, 50, 50, P.accent + '14', { r: 14 }) : null,
        T(ic, nx + 16, 12, 42, 22, { size: 16, fill: on ? P.accent : P.muted, align: 'center' }),
        T(lb, nx + 4, 36, 68, 12, { size: 7, fill: on ? P.accent : P.muted,
          align: 'center', weight: on ? 700 : 400, ls: 0.3 }),
      ].filter(Boolean);
    }),
  ]});
};

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — OVERVIEW
// ════════════════════════════════════════════════════════════════════════════
function screenOverview(ox) {
  const agentFeed = [
    { msg: 'Invoice #INV-052 sent → Bolder Co.',    time: '2m ago',  color: P.accent, icon: '⚡' },
    { msg: '$3,200 payment reconciled — Nexo Labs',  time: '18m ago', color: P.green,  icon: '✓' },
    { msg: 'Follow-up email queued → Aria Inc.',     time: '1h ago',  color: P.amber,  icon: '◎' },
    { msg: 'Monthly report exported to Drive',       time: '3h ago',  color: P.muted,  icon: '↑' },
  ];

  return F(ox, 0, 390, 844, P.bg, { ch: [
    StatusBar(),

    // wordmark + live badge
    T('MESA', 20, 56, 160, 30, { size: 24, weight: 900, fill: P.accent, ls: 3.5 }),
    T('March 2026', 20, 90, 160, 16, { size: 11, fill: P.muted }),
    Pill(290, 58, '● LIVE', P.green, { w: 72, h: 26 }),

    // hero revenue card — indigo
    F(20, 114, 350, 148, P.accent, { r: 20, ch: [
      T('Total Revenue', 20, 18, 220, 14, { size: 11, fill: '#FFFFFF99', ls: 0.6, weight: 600 }),
      T('$18,420', 20, 38, 260, 52, { size: 46, weight: 900, fill: '#FFFFFF', ls: -1 }),
      T('.00', 0, 58, 340, 22, { size: 22, weight: 700, fill: '#FFFFFF50', align: 'right' }),
      T('↑ 23% vs February', 20, 98, 200, 16, { size: 11, fill: '#FFFFFFAA' }),
      T('12 invoices · 8 paid', 20, 116, 250, 14, { size: 10, fill: '#FFFFFF55' }),
    ]}),

    // 2-col quick stats
    ...[['Outstanding', '$4,200', P.amber], ['Overdue', '$1,150', P.accent2]].map(([lbl, val, col], i) =>
      F(20 + i * 178, 278, 166, 72, P.surface, { r: 14, stroke: P.border, ch: [
        T(lbl,    14, 12, 140, 13, { size: 9, fill: P.muted, ls: 0.8 }),
        T(val,    14, 30, 140, 28, { size: 24, weight: 800, fill: col }),
        T('unpaid', 14, 56, 80, 12, { size: 8, fill: P.muted }),
      ]})
    ),

    // agent activity
    T('AI AGENT ACTIVITY', 20, 364, 240, 12, { size: 9, fill: P.muted, ls: 1.5, weight: 600 }),
    T('3 running', 288, 364, 82, 12, { size: 9, fill: P.accent, align: 'right' }),

    ...agentFeed.map((a, i) =>
      F(20, 384 + i * 62, 350, 54, P.surface, { r: 12,
        stroke: i === 0 ? P.accent + '40' : P.border, ch: [
          F(0, 0, 4, 54, a.color + 'CC', { r: 2 }),
          E(16, 15, 24, 24, a.color + '22'),
          T(a.icon, 16, 15, 24, 24, { size: 11, fill: a.color, align: 'center' }),
          T(a.msg,  50, 10, 272, 16, { size: 11, fill: P.fg2, weight: 500 }),
          T(a.time, 50, 30, 200, 12, { size: 9, fill: P.muted }),
          T('›', 326, 18, 14, 18, { size: 14, fill: P.muted }),
        ]}
      )
    ),

    BottomNav(0),
  ]});
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — CLIENTS
// ════════════════════════════════════════════════════════════════════════════
function screenClients(ox) {
  const clients = [
    { name: 'Bolder Co.',   ini: 'BC', tier: 'Retainer', amount: '$4,800/mo', next: 'Apr 1',  status: 'Active',  col: P.accent  },
    { name: 'Nexo Labs',    ini: 'NL', tier: 'Project',  amount: '$12,000',   next: 'Apr 15', status: 'Active',  col: P.green   },
    { name: 'Aria Inc.',    ini: 'AI', tier: 'Retainer', amount: '$2,400/mo', next: 'Apr 1',  status: 'Pending', col: P.amber   },
    { name: 'Forge Studio', ini: 'FS', tier: 'Project',  amount: '$6,500',    next: 'Apr 22', status: 'Overdue', col: P.accent2 },
    { name: 'Mira Health',  ini: 'MH', tier: 'Advisory', amount: '$900/mo',   next: 'Apr 1',  status: 'Active',  col: P.green   },
  ];

  return F(ox, 0, 390, 844, P.bg, { ch: [
    StatusBar(),

    T('Clients', 20, 58, 200, 30, { size: 26, weight: 800, fill: P.fg }),
    T('5 active · $26,600 ARR', 20, 92, 260, 16, { size: 11, fill: P.muted }),
    F(300, 58, 70, 32, P.accent, { r: 10, ch: [
      T('+ New', 0, 8, 70, 16, { size: 11, fill: '#fff', align: 'center', weight: 600 }),
    ]}),

    // search bar
    F(20, 118, 350, 38, P.surface, { r: 12, stroke: P.border, ch: [
      T('⊘', 14, 10, 20, 18, { size: 13, fill: P.muted }),
      T('Search clients…', 42, 11, 280, 16, { size: 12, fill: P.muted, italic: true }),
    ]}),

    // client cards
    ...clients.map((c, i) =>
      F(20, 170 + i * 106, 350, 96, P.surface, {
        r: 16, stroke: c.status === 'Overdue' ? P.accent2 + '50' : P.border, ch: [
          E(16, 20, 52, 52, c.col + '1E'),
          T(c.ini, 16, 30, 52, 32, { size: 16, weight: 800, fill: c.col, align: 'center' }),
          T(c.name, 80, 16, 180, 18, { size: 15, weight: 700, fill: P.fg }),
          T(c.tier, 80, 38, 100, 14, { size: 10, fill: P.muted, ls: 0.5 }),
          T('Next: ' + c.next, 80, 56, 140, 14, { size: 10, fill: P.fg2 }),
          T(c.amount, 210, 16, 130, 18, { size: 13, weight: 700, fill: P.fg, align: 'right' }),
          Pill(222, 40, c.status, c.col, { w: 80 }),
          T('›', 328, 36, 12, 22, { size: 14, fill: P.muted }),
        ]}
      )
    ),

    BottomNav(1),
  ]});
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — INVOICE DETAIL
// ════════════════════════════════════════════════════════════════════════════
function screenInvoice(ox) {
  const lineItems = [
    ['Brand Strategy Workshop',    '1×', '$2,400'],
    ['UX Research & Synthesis',    '2×', '$1,600'],
    ['Prototype Development',      '3×', '$3,000'],
    ['Project Management (20hrs)', '1×', '$1,200'],
  ];

  const timeline = [
    ['Invoice created',    'Mar 12, 2026',   P.muted,  false],
    ['Sent to client',     'Mar 13, 2026',   P.accent,  true],
    ['Viewed by client',   'Mar 14, 2026',   P.accent,  true],
    ['Payment pending',    'Today',          P.amber,   true],
    ['Payment received',   'Expected Apr 1', P.border2, false],
  ];

  return F(ox, 0, 390, 844, P.bg, { ch: [
    StatusBar(),

    T('← Invoices', 20, 56, 110, 16, { size: 11, fill: P.accent }),
    T('INV-047', 20, 76, 200, 28, { size: 24, weight: 900, fill: P.fg }),
    Pill(248, 78, 'SENT', P.accent, { w: 68, h: 26 }),

    // client summary card
    F(20, 116, 350, 72, P.surface, { r: 14, stroke: P.border, ch: [
      T('Bolder Co.',         16, 12, 200, 18, { size: 14, weight: 700, fill: P.fg }),
      T('billing@bolder.co',  16, 34, 200, 14, { size: 10, fill: P.muted }),
      T('Due: Apr 1, 2026',   16, 52, 200, 14, { size: 10, fill: P.amber }),
      T('$8,200', 210, 22, 124, 30, { size: 26, weight: 900, fill: P.accent, align: 'right' }),
    ]}),

    // line items
    T('LINE ITEMS', 20, 202, 200, 12, { size: 9, fill: P.muted, ls: 1.5, weight: 600 }),
    ...lineItems.map(([desc, qty, price], i) =>
      F(20, 222 + i * 48, 350, 40, i % 2 === 0 ? P.surface : P.dim, { r: 8, ch: [
        T(desc,  14, 12, 220, 16, { size: 11, fill: P.fg2 }),
        T(qty,   232, 12, 30, 16, { size: 10, fill: P.muted, align: 'center' }),
        T(price, 266, 12, 72, 16, { size: 12, weight: 700, fill: P.fg, align: 'right' }),
      ]})
    ),
    F(20, 414, 350, 40, P.accent + '14', { r: 8, ch: [
      T('TOTAL', 14, 12, 200, 16, { size: 11, weight: 700, fill: P.accent, ls: 1 }),
      T('$8,200', 264, 12, 72, 16, { size: 14, weight: 900, fill: P.accent, align: 'right' }),
    ]}),

    // timeline
    T('TIMELINE', 20, 468, 200, 12, { size: 9, fill: P.muted, ls: 1.5, weight: 600 }),
    ...timeline.map(([lbl, date, col, active], i) =>
      F(20, 488 + i * 46, 350, 38, 'transparent', { ch: [
        E(0, 9, 20, 20, active ? col + '2A' : P.border + '50'),
        T(active ? '●' : '○', 0, 9, 20, 20, { size: 9, fill: active ? col : P.border, align: 'center' }),
        T(lbl,   32, 11, 200, 14, { size: 11, fill: active ? P.fg2 : P.muted }),
        T(date, 240, 11, 100, 14, { size: 10, fill: active ? col : P.muted, align: 'right' }),
      ]})
    ),

    // CTA
    F(20, 736, 350, 44, P.accent, { r: 14, ch: [
      T('Send Reminder', 0, 12, 350, 20, { size: 13, fill: '#fff', align: 'center', weight: 700 }),
    ]}),

    BottomNav(2),
  ]});
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — INSIGHTS
// ════════════════════════════════════════════════════════════════════════════
function screenInsights(ox) {
  const bars = [
    { mo: 'Oct', pct: 50 },
    { mo: 'Nov', pct: 59 },
    { mo: 'Dec', pct: 40 },
    { mo: 'Jan', pct: 68 },
    { mo: 'Feb', pct: 81 },
    { mo: 'Mar', pct: 100 },
  ];
  const insightCards = [
    { icon: '⚡', text: 'March is your best month yet — 23% above February.', col: P.accent },
    { icon: '◎', text: 'Retainer revenue is 61% of total. Healthy stability.', col: P.green  },
    { icon: '⚠', text: 'Forge Studio invoice is overdue — send a nudge.', col: P.accent2 },
  ];
  const CHART_H = 108;
  const BAR_W   = 40;

  return F(ox, 0, 390, 844, P.bg, { ch: [
    StatusBar(),

    T('Insights', 20, 58, 200, 30, { size: 26, weight: 800, fill: P.fg }),
    T('AI-powered · Q1 2026', 20, 92, 200, 16, { size: 11, fill: P.muted }),
    Pill(278, 60, '✦ AI Active', P.accent, { w: 96, h: 26 }),

    // bar chart card
    F(20, 116, 350, 192, P.surface, { r: 18, stroke: P.border, ch: [
      T('Monthly Revenue', 16, 14, 200, 14, { size: 11, fill: P.muted, weight: 600 }),
      T('$18,420', 16, 32, 280, 32, { size: 28, weight: 900, fill: P.fg }),
      T('Mar', 278, 40, 56, 14, { size: 10, fill: P.muted, align: 'right' }),
      ...bars.map((b, i) => {
        const bh = Math.round((b.pct / 100) * CHART_H);
        const bx = 16 + i * (BAR_W + 11);
        const by = 82 + CHART_H - bh;
        const isLast = i === bars.length - 1;
        return [
          F(bx, 82, BAR_W, CHART_H, P.surface3, { r: 6 }),
          F(bx, by, BAR_W, bh, isLast ? P.accent : P.accent + '55', { r: 6 }),
          T(b.mo, bx, 200, BAR_W, 12, { size: 9, fill: P.muted, align: 'center' }),
        ];
      }).flat(),
    ]}),

    // insight cards
    T('AI OBSERVATIONS', 20, 322, 280, 12, { size: 9, fill: P.muted, ls: 1.5, weight: 600 }),
    ...insightCards.map((c, i) =>
      F(20, 342 + i * 74, 350, 64, P.surface, {
        r: 14, stroke: i === 0 ? P.accent + '30' : P.border, ch: [
          E(14, 14, 36, 36, c.col + '1E'),
          T(c.icon, 14, 14, 36, 36, { size: 14, fill: c.col, align: 'center' }),
          T(c.text, 62, 12, 274, 40, { size: 11, fill: P.fg2, lh: 18 }),
        ]}
      )
    ),

    // revenue mix bars
    T('REVENUE MIX', 20, 572, 200, 12, { size: 9, fill: P.muted, ls: 1.5, weight: 600 }),
    F(20, 592, 350, 108, P.surface, { r: 14, stroke: P.border, ch: [
      ...[ ['Retainer', P.accent, 92], ['Project', P.green, 56], ['Advisory', P.amber, 10] ]
        .map(([lbl, col, w], i) => [
          T(lbl, 16, 14 + i * 32, 90, 14, { size: 11, fill: P.fg2 }),
          F(112, 19 + i * 32, 150, 10, col + '20', { r: 5, ch: [F(0, 0, w, 10, col, { r: 5 })] }),
          T(Math.round(w / 150 * 100) + '%', 270, 14 + i * 32, 60, 14,
            { size: 12, weight: 800, fill: col, align: 'right' }),
        ]).flat(),
    ]}),

    BottomNav(3),
  ]});
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — SETTINGS / INTEGRATIONS
// ════════════════════════════════════════════════════════════════════════════
function screenSettings(ox) {
  const integrations = [
    { name: 'Stripe',     desc: 'Payments & payouts',   status: 'Connected', col: P.green,  icon: '◈' },
    { name: 'Notion',     desc: 'Project tracking',     status: 'Connected', col: P.green,  icon: '◉' },
    { name: 'Gmail',      desc: 'Email automation',     status: 'Connected', col: P.green,  icon: '⬤' },
    { name: 'QuickBooks', desc: 'Accounting export',    status: 'Connect',   col: P.accent, icon: '◎' },
    { name: 'Calendly',   desc: 'Meeting scheduling',   status: 'Connect',   col: P.accent, icon: '⊕' },
  ];

  return F(ox, 0, 390, 844, P.bg, { ch: [
    StatusBar(),

    T('Settings', 20, 58, 200, 30, { size: 26, weight: 800, fill: P.fg }),

    // profile card
    F(20, 100, 350, 88, P.surface, { r: 16, stroke: P.border, ch: [
      E(16, 18, 52, 52, P.accent + '1A'),
      T('JR', 16, 28, 52, 32, { size: 18, weight: 900, fill: P.accent, align: 'center' }),
      T('Jamie Rivera', 82, 18, 200, 18, { size: 15, weight: 700, fill: P.fg }),
      T('jamie@mesafounder.io', 82, 40, 220, 14, { size: 10, fill: P.muted }),
      Pill(82, 60, 'Pro Plan', P.accent, { w: 76, h: 22 }),
      T('›', 328, 30, 12, 26, { size: 16, fill: P.muted }),
    ]}),

    // integrations list
    T('INTEGRATIONS', 20, 202, 280, 12, { size: 9, fill: P.muted, ls: 1.5, weight: 600 }),
    ...integrations.map((intg, i) =>
      F(20, 222 + i * 66, 350, 58, P.surface, { r: 14, stroke: P.border, ch: [
        E(14, 12, 34, 34, intg.col + '1E'),
        T(intg.icon, 14, 12, 34, 34, { size: 13, fill: intg.col, align: 'center' }),
        T(intg.name, 60, 12, 180, 16, { size: 13, weight: 700, fill: P.fg }),
        T(intg.desc, 60, 32, 200, 14, { size: 10, fill: P.muted }),
        Pill(246, 16, intg.status, intg.col, {
          w: 90, h: 24, solid: intg.status === 'Connect',
        }),
      ]})
    ),

    // AI agent toggles
    T('AI AGENTS', 20, 578, 200, 12, { size: 9, fill: P.muted, ls: 1.5, weight: 600 }),
    ...[
      ['Autonomous Mode',     'Agents run invoicing & follow-ups', true],
      ['Notification Digest', 'Daily summary at 8:00 AM',         false],
    ].map(([title, sub, on], i) =>
      F(20, 598 + i * 64, 350, 56, P.surface, { r: 14, stroke: P.border, ch: [
        T(title, 16, 12, 240, 16, { size: 13, weight: 600, fill: P.fg }),
        T(sub,   16, 32, 240, 14, { size: 10, fill: P.muted }),
        F(290, 16, 46, 24, on ? P.accent : P.surface3, {
          r: 12, stroke: on ? '' : P.border, sw: 1, ch: [
            E(on ? 24 : 6, 4, 16, 16, '#fff'),
          ],
        }),
      ]})
    ),

    // sign out
    F(20, 732, 350, 44, P.surface, { r: 14, stroke: P.border, ch: [
      T('Sign Out', 0, 12, 350, 20, { size: 12, fill: P.muted, align: 'center', ls: 0.5 }),
    ]}),

    BottomNav(4),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════
// ASSEMBLE & SAVE
// ══════════════════════════════════════════════════════════════════════════
const SCREEN_W = 390;
const GAP      = 80;

const doc = {
  version: '2.8',
  name: 'MESA — Revenue clarity for solopreneur founders',
  width:  5 * SCREEN_W + 6 * GAP,
  height: 844,
  fill:   '#EBE7DC',
  children: [
    screenOverview (GAP),
    screenClients  (GAP + (SCREEN_W + GAP)),
    screenInvoice  (GAP + (SCREEN_W + GAP) * 2),
    screenInsights (GAP + (SCREEN_W + GAP) * 3),
    screenSettings (GAP + (SCREEN_W + GAP) * 4),
  ],
};

const outPath = path.join(__dirname, 'mesa.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log('✓ mesa.pen written —', Math.round(fs.statSync(outPath).size / 1024) + 'KB');
console.log('  5 screens: Overview · Clients · Invoice · Insights · Settings');
console.log('  Palette: warm cream #F7F4EE · electric indigo #3D35F0 · coral #FF5F38');
