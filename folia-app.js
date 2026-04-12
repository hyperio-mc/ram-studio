'use strict';
// folia-app.js
// FOLIA — AI-Powered Freelance Finance Intelligence App
//
// Design Heartbeat — Mar 20, 2026
// Inspired by:
//   • Midday.ai (darkmodedesign.com) — dark professional finance surface,
//     AI-assistant "Ask anything" bar, bento feature grid, clean transaction lists
//   • OWO (lapa.ninja) — "Send money on WhatsApp" — ultra-clean minimal dark UI,
//     no-frills data hierarchy, subtle brand color only on CTAs
//   • MoMoney / Moneda (lapa.ninja) — personal finance dark cards, emerald/amber
//     palette signalling growth + income simultaneously
//   • Stripe Sessions 2026 (godly.website) — editorial typography rhythm,
//     high-contrast section dividers, clear visual hierarchy at scale

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#080E0B',   // deep forest dark
  surface:  '#0F1A14',   // elevated surface
  surface2: '#162110',   // higher surface / input bg
  surface3: '#1C2B18',   // highest surface
  border:   '#1E2E1E',   // subtle border
  border2:  '#2A3E28',   // stronger / active border
  emerald:  '#2ECC8A',   // primary brand — income, growth, confirmed
  emeraldHi:'#4FFAAA',   // lighter emerald — hover, glow
  amber:    '#E8A832',   // secondary — warnings, draft, pending
  amberHi:  '#FFBE4A',   // lighter amber
  red:      '#F87171',   // expense, overdue, negative
  blue:     '#6BCFFF',   // AI responses, data highlights
  fg:       '#EEF0EC',   // warm off-white body
  fg2:      '#8A9A88',   // muted secondary
  fg3:      '#4A5648',   // very muted tertiary
  mono:     '#A8BCA8',   // monospace / data labels
};

let _id = 0;
const uid = () => `fol${++_id}`;

// ── Core primitives ───────────────────────────────────────────────────────────
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
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  ...(opts.font ? { fontFamily: opts.font } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Line = (x, y, w, fill = P.border) => F(x, y, w, 1, fill, {});

const Pill = (x, y, text, bg, fg, opts = {}) => {
  const w = Math.max(text.length * 6.5 + 20, 40);
  return F(x, y, w, 20, bg, {
    r: 10,
    ch: [T(text, 0, 4, w, 13, { size: 9, weight: 700, fill: fg, align: 'center', ls: 1 })],
  });
};

const BentoCard = (x, y, w, h, children, opts = {}) => F(x, y, w, h, P.surface, {
  r: 12,
  stroke: P.border,
  sw: 1,
  ch: children,
  ...opts,
});

// Status bar (14px tall, minimal)
const StatusBar = (y = 16) => F(0, y, 375, 14, 'transparent', {
  ch: [
    T('9:41', 16, 0, 40, 14, { size: 11, weight: 600, fill: P.fg }),
    T('●●●●◌', 295, 1, 50, 12, { size: 9, fill: P.fg2 }),
    T('█▌', 349, 1, 26, 12, { size: 9, fill: P.fg }),
  ],
});

// ── SCREEN 1: Dashboard ───────────────────────────────────────────────────────
function screen1() {
  const ch = [];

  // Background
  ch.push(F(0, 0, 375, 812, P.bg, {}));
  // Subtle radial glow at top-right (emerald)
  ch.push(E(280, -40, 200, 200, P.emerald, { opacity: 0.07 }));

  // Status bar
  ch.push(StatusBar(16));

  // ── Header ────────────────────────────────────────────────────────────────
  ch.push(T('FOLIA', 20, 46, 80, 18, { size: 14, weight: 800, fill: P.emerald, ls: 4 }));
  ch.push(T('March 2026', 20, 66, 100, 14, { size: 11, fill: P.fg3, ls: 1 }));
  // Avatar
  ch.push(E(335, 44, 32, 32, P.surface2, { stroke: P.emerald, sw: 1.5 }));
  ch.push(T('AK', 335, 55, 32, 14, { size: 10, weight: 700, fill: P.emerald, align: 'center' }));

  // ── Net Income Hero Card ───────────────────────────────────────────────────
  ch.push(BentoCard(16, 102, 343, 110, [
    T('NET INCOME', 16, 12, 140, 11, { size: 9, weight: 700, fill: P.fg3, ls: 2 }),
    T('+$14,280', 16, 28, 200, 40, { size: 36, weight: 800, fill: P.emerald }),
    T('↑ 23% vs last month', 16, 72, 180, 14, { size: 11, fill: P.fg2 }),
    // Sparkline bars (simplified)
    F(240, 20, 88, 60, 'transparent', { ch: [
      F(0,  40, 10, 20, P.emerald, { r: 2, opacity: 0.4 }),
      F(14, 28, 10, 32, P.emerald, { r: 2, opacity: 0.6 }),
      F(28, 20, 10, 40, P.emerald, { r: 2, opacity: 0.7 }),
      F(42, 32, 10, 28, P.emerald, { r: 2, opacity: 0.5 }),
      F(56, 12, 10, 48, P.emerald, { r: 2 }),
      F(70, 18, 10, 42, P.emerald, { r: 2, opacity: 0.8 }),
      F(84, 8,  4,  52, P.emeraldHi, { r: 2 }),
    ]}),
  ]));

  // ── AI Insight Strip ──────────────────────────────────────────────────────
  ch.push(F(16, 222, 343, 52, P.surface2, { r: 10, stroke: P.emerald, sw: 1, ch: [
    // AI pulse dot
    E(16, 18, 14, 14, P.emerald, { opacity: 0.9 }),
    E(20, 22, 6, 6, P.bg, {}),
    T('FOLIA AI', 38, 8, 80, 11, { size: 8, weight: 700, fill: P.emerald, ls: 1.5 }),
    T('Your best month yet — invoices to 3 clients still unpaid ($4,200). Send reminders now?', 38, 22, 285, 24, { size: 10, fill: P.fg2, lh: 1.4 }),
  ]}));

  // ── 2-col bento grid ──────────────────────────────────────────────────────
  // Invoiced
  ch.push(BentoCard(16, 284, 163, 90, [
    T('INVOICED', 12, 10, 100, 10, { size: 8, weight: 700, fill: P.fg3, ls: 2 }),
    T('$22,500', 12, 26, 130, 28, { size: 24, weight: 700, fill: P.fg }),
    T('6 invoices sent', 12, 58, 130, 12, { size: 10, fill: P.fg2 }),
    Pill(12, 72, 'MARCH', P.border2, P.fg3),
  ]));

  // Expenses
  ch.push(BentoCard(188, 284, 171, 90, [
    T('EXPENSES', 12, 10, 110, 10, { size: 8, weight: 700, fill: P.fg3, ls: 2 }),
    T('$8,220', 12, 26, 130, 28, { size: 24, weight: 700, fill: P.red }),
    T('14 transactions', 12, 58, 130, 12, { size: 10, fill: P.fg2 }),
    Pill(12, 72, '↓ 8%', P.emerald + '22', P.emerald),
  ]));

  // Tax Reserve
  ch.push(BentoCard(16, 384, 163, 90, [
    T('TAX RESERVE', 12, 10, 120, 10, { size: 8, weight: 700, fill: P.fg3, ls: 2 }),
    T('$3,570', 12, 26, 120, 28, { size: 24, weight: 700, fill: P.amber }),
    T('25% of net auto-set', 12, 58, 140, 12, { size: 10, fill: P.fg2 }),
  ]));

  // Hours Tracked
  ch.push(BentoCard(188, 384, 171, 90, [
    T('HOURS LOGGED', 12, 10, 130, 10, { size: 8, weight: 700, fill: P.fg3, ls: 2 }),
    T('148h', 12, 26, 110, 28, { size: 24, weight: 700, fill: P.blue }),
    T('$96.49 effective rate', 12, 58, 150, 12, { size: 10, fill: P.fg2 }),
  ]));

  // ── Recent Transactions ───────────────────────────────────────────────────
  ch.push(T('RECENT', 20, 490, 100, 11, { size: 9, weight: 700, fill: P.fg3, ls: 2 }));
  ch.push(T('See all →', 300, 490, 60, 11, { size: 9, fill: P.emerald, align: 'right' }));

  const txns = [
    { name: 'Webflow Invoice — Acme Co',  amt: '+$4,500', color: P.emerald, sub: 'Paid · Mar 18' },
    { name: 'Adobe CC Subscription',       amt: '-$59.99', color: P.red,     sub: 'Expense · Mar 17' },
    { name: 'Figma — Annual Plan',         amt: '-$144',   color: P.red,     sub: 'Expense · Mar 16' },
    { name: 'Retainer — Studio Nine',      amt: '+$3,200', color: P.emerald, sub: 'Paid · Mar 15' },
  ];
  txns.forEach((tx, i) => {
    const y = 510 + i * 58;
    ch.push(F(16, y, 343, 50, P.surface, { r: 8, ch: [
      T(tx.name, 12, 10, 220, 14, { size: 12, weight: 500, fill: P.fg }),
      T(tx.sub,  12, 28, 160, 12, { size: 10, fill: P.fg3 }),
      T(tx.amt, 220, 14, 110, 16, { size: 14, weight: 700, fill: tx.color, align: 'right' }),
    ]}));
  });

  // Bottom nav
  ch.push(F(0, 750, 375, 62, P.surface, { ch: [
    Line(0, 0, 375, P.border),
    T('⌂', 30, 16, 30, 28, { size: 20, fill: P.emerald, align: 'center' }),
    T('HOME', 15, 40, 60, 10, { size: 7, weight: 700, fill: P.emerald, align: 'center', ls: 1 }),
    T('◷', 103, 16, 30, 28, { size: 18, fill: P.fg3, align: 'center' }),
    T('FLOW', 88, 40, 60, 10, { size: 7, weight: 700, fill: P.fg3, align: 'center', ls: 1 }),
    T('⊡', 180, 16, 30, 28, { size: 18, fill: P.fg3, align: 'center' }),
    T('INVOICES', 158, 40, 74, 10, { size: 7, weight: 700, fill: P.fg3, align: 'center', ls: 1 }),
    T('✦', 258, 16, 30, 28, { size: 16, fill: P.fg3, align: 'center' }),
    T('ASK AI', 243, 40, 60, 10, { size: 7, weight: 700, fill: P.fg3, align: 'center', ls: 1 }),
    T('◈', 330, 16, 30, 28, { size: 18, fill: P.fg3, align: 'center' }),
    T('TAX', 315, 40, 60, 10, { size: 7, weight: 700, fill: P.fg3, align: 'center', ls: 1 }),
  ]}));

  return {
    id: uid(), type: 'frame', name: 'S1 · Dashboard',
    x: 0, y: 0, width: 375, height: 812,
    fill: P.bg, children: ch,
  };
}

// ── SCREEN 2: Cash Flow ────────────────────────────────────────────────────────
function screen2() {
  const ch = [];
  ch.push(F(0, 0, 375, 812, P.bg, {}));
  ch.push(StatusBar(16));

  // Header
  ch.push(T('← Back', 16, 46, 60, 14, { size: 12, fill: P.fg2 }));
  ch.push(T('Cash Flow', 16, 66, 200, 24, { size: 22, weight: 800, fill: P.fg }));
  ch.push(T('March 2026', 16, 92, 120, 14, { size: 11, fill: P.fg3 }));

  // Month toggle pills
  ['JAN','FEB','MAR','APR'].forEach((m, i) => {
    const active = m === 'MAR';
    ch.push(F(16 + i * 80, 116, 70, 26, active ? P.emerald : P.surface2, {
      r: 13,
      stroke: active ? P.emeraldHi : P.border,
      ch: [T(m, 0, 7, 70, 12, { size: 10, weight: 700, fill: active ? P.bg : P.fg3, align: 'center', ls: 2 })],
    }));
  });

  // ── Waterfall Chart ───────────────────────────────────────────────────────
  ch.push(BentoCard(16, 154, 343, 200, [
    T('INCOME VS EXPENSES', 12, 10, 200, 10, { size: 8, weight: 700, fill: P.fg3, ls: 2 }),
    // Waterfall bars (simplified visual)
    // X-axis labels
    ...['W1','W2','W3','W4'].map((w, i) => T(w, 14 + i * 76, 178, 40, 10, { size: 8, fill: P.fg3, align: 'center' })),
    // Income bars (emerald)
    F(14,  78, 34, 90, P.emerald, { r: 4, opacity: 0.8 }),
    F(90,  60, 34, 108, P.emerald, { r: 4 }),
    F(166, 90, 34, 78, P.emerald, { r: 4, opacity: 0.7 }),
    F(242, 50, 34, 118, P.emerald, { r: 4, opacity: 0.9 }),
    // Expense bars (red, offset)
    F(50,  120, 22, 48, P.red, { r: 3, opacity: 0.6 }),
    F(126, 110, 22, 58, P.red, { r: 3, opacity: 0.6 }),
    F(202, 115, 22, 52, P.red, { r: 3, opacity: 0.5 }),
    F(278, 98,  22, 70, P.red, { r: 3, opacity: 0.6 }),
    // Zero line
    F(12, 168, 318, 1, P.border2, {}),
    // Legend
    F(170, 10, 8, 8, P.emerald, { r: 2 }),
    T('Income', 182, 10, 50, 10, { size: 8, fill: P.fg2 }),
    F(230, 10, 8, 8, P.red, { r: 2 }),
    T('Expenses', 242, 10, 55, 10, { size: 8, fill: P.fg2 }),
  ]));

  // ── AI Narrative ──────────────────────────────────────────────────────────
  ch.push(F(16, 364, 343, 90, P.surface2, { r: 10, stroke: P.border, ch: [
    E(14, 14, 16, 16, P.emerald + '33', {}),
    E(18, 18, 8, 8, P.emerald, {}),
    T('FOLIA AI SUMMARY', 38, 10, 200, 10, { size: 8, weight: 700, fill: P.emerald, ls: 1.5 }),
    T('Week 2 was your strongest — $9,800 from Studio Nine + Acme retainers landing same week. Week 4 projection shows +$6,400 incoming. Tax reserve topped up automatically.', 14, 28, 318, 52, { size: 10, fill: P.fg2, lh: 1.5 }),
  ]}));

  // ── Breakdown list ────────────────────────────────────────────────────────
  ch.push(T('CATEGORY BREAKDOWN', 20, 466, 200, 11, { size: 9, weight: 700, fill: P.fg3, ls: 2 }));

  const cats = [
    { name: 'Client Invoices',  pct: 78, amt: '$22,500', color: P.emerald },
    { name: 'Design Tools',     pct: 15, amt: '-$2,180',  color: P.red    },
    { name: 'Contractors',      pct: 20, amt: '-$3,400',  color: P.amber  },
    { name: 'Infrastructure',   pct: 9,  amt: '-$640',    color: P.fg3    },
  ];
  cats.forEach((c, i) => {
    const y = 484 + i * 56;
    ch.push(F(16, y, 343, 46, P.surface, { r: 8, ch: [
      T(c.name, 12, 10, 180, 14, { size: 12, weight: 500, fill: P.fg }),
      // Progress bar
      F(12, 30, 200, 4, P.border, { r: 2, ch: [
        F(0, 0, Math.floor(200 * c.pct / 100), 4, c.color, { r: 2 }),
      ]}),
      T(c.amt, 250, 14, 80, 16, { size: 13, weight: 700, fill: c.color, align: 'right' }),
    ]}));
  });

  // Bottom nav
  ch.push(F(0, 750, 375, 62, P.surface, { ch: [
    Line(0, 0, 375, P.border),
    T('⌂', 30, 16, 30, 28, { size: 20, fill: P.fg3, align: 'center' }),
    T('HOME', 15, 40, 60, 10, { size: 7, weight: 700, fill: P.fg3, align: 'center', ls: 1 }),
    T('◷', 103, 16, 30, 28, { size: 18, fill: P.emerald, align: 'center' }),
    T('FLOW', 88, 40, 60, 10, { size: 7, weight: 700, fill: P.emerald, align: 'center', ls: 1 }),
    T('⊡', 180, 16, 30, 28, { size: 18, fill: P.fg3, align: 'center' }),
    T('INVOICES', 158, 40, 74, 10, { size: 7, weight: 700, fill: P.fg3, align: 'center', ls: 1 }),
    T('✦', 258, 16, 30, 28, { size: 16, fill: P.fg3, align: 'center' }),
    T('ASK AI', 243, 40, 60, 10, { size: 7, weight: 700, fill: P.fg3, align: 'center', ls: 1 }),
    T('◈', 330, 16, 30, 28, { size: 18, fill: P.fg3, align: 'center' }),
    T('TAX', 315, 40, 60, 10, { size: 7, weight: 700, fill: P.fg3, align: 'center', ls: 1 }),
  ]}));

  return {
    id: uid(), type: 'frame', name: 'S2 · Cash Flow',
    x: 0, y: 0, width: 375, height: 812,
    fill: P.bg, children: ch,
  };
}

// ── SCREEN 3: Invoice Tracker ─────────────────────────────────────────────────
function screen3() {
  const ch = [];
  ch.push(F(0, 0, 375, 812, P.bg, {}));
  ch.push(StatusBar(16));

  // Header
  ch.push(T('Invoices', 20, 46, 180, 24, { size: 22, weight: 800, fill: P.fg }));
  // New invoice button
  ch.push(F(290, 44, 68, 28, P.emerald, { r: 14, ch: [
    T('+ New', 0, 7, 68, 14, { size: 11, weight: 700, fill: P.bg, align: 'center' }),
  ]}));

  // Filter tabs
  const tabs = ['ALL', 'PAID', 'PENDING', 'DRAFT'];
  tabs.forEach((tab, i) => {
    const active = tab === 'PENDING';
    ch.push(F(16 + i * 82, 84, 72, 24, active ? P.surface2 : 'transparent', {
      r: 12,
      stroke: active ? P.emerald : 'transparent',
      ch: [T(tab, 0, 6, 72, 12, { size: 9, weight: 700, fill: active ? P.emerald : P.fg3, align: 'center', ls: 1.5 })],
    }));
  });

  // Summary bar
  ch.push(F(16, 118, 343, 44, P.surface2, { r: 8, ch: [
    T('3 pending', 12, 14, 90, 14, { size: 12, weight: 600, fill: P.amber }),
    T('$11,400 outstanding', 105, 14, 160, 14, { size: 12, fill: P.fg2 }),
    T('Send reminders →', 254, 14, 90, 14, { size: 10, fill: P.emerald, align: 'right' }),
  ]}));

  // Invoice cards
  const invoices = [
    {
      num: 'INV-2026-041', client: 'Acme Co',
      desc: 'Website Redesign — Phase 2',
      amt: '$4,200', due: 'Due Mar 24, 2026',
      status: 'OVERDUE', statusColor: P.red,
    },
    {
      num: 'INV-2026-040', client: 'Studio Nine',
      desc: 'Monthly Retainer — March',
      amt: '$3,200', due: 'Due Mar 28, 2026',
      status: 'PENDING', statusColor: P.amber,
    },
    {
      num: 'INV-2026-039', client: 'Folio Creative',
      desc: 'Brand Identity System',
      amt: '$4,000', due: 'Due Mar 30, 2026',
      status: 'SENT', statusColor: P.blue,
    },
    {
      num: 'INV-2026-038', client: 'NovaTech Inc',
      desc: 'UX Audit + Report',
      amt: '$2,800', due: 'Paid Mar 15, 2026',
      status: 'PAID', statusColor: P.emerald,
    },
    {
      num: 'INV-2026-037', client: 'Parallax Labs',
      desc: 'App UI Design — Sprint 3',
      amt: '$6,000', due: 'Paid Mar 10, 2026',
      status: 'PAID', statusColor: P.emerald,
    },
  ];

  invoices.forEach((inv, i) => {
    const y = 174 + i * 106;
    const isPaid = inv.status === 'PAID';
    ch.push(BentoCard(16, y, 343, 96, [
      T(inv.num, 12, 10, 160, 11, { size: 9, fill: P.fg3, font: 'monospace' }),
      Pill(220, 8, inv.status, inv.statusColor + '22', inv.statusColor),
      T(inv.client, 12, 26, 200, 16, { size: 14, weight: 700, fill: isPaid ? P.fg2 : P.fg }),
      T(inv.desc, 12, 44, 230, 12, { size: 10, fill: P.fg3 }),
      T(inv.amt, 240, 28, 90, 20, { size: 18, weight: 800, fill: isPaid ? P.fg2 : P.fg, align: 'right' }),
      T(inv.due, 12, 62, 220, 12, { size: 10, fill: isPaid ? P.emerald : inv.statusColor }),
      // Action strip
      ...(isPaid ? [
        T('Download PDF', 240, 62, 90, 12, { size: 9, fill: P.fg3, align: 'right' }),
      ] : [
        F(194, 62, 70, 22, P.border, { r: 11, ch: [T('Remind', 0, 5, 70, 12, { size: 9, weight: 600, fill: P.fg2, align: 'center' })] }),
        F(272, 62, 60, 22, inv.statusColor, { r: 11, ch: [T('View', 0, 5, 60, 12, { size: 9, weight: 700, fill: inv.status === 'OVERDUE' ? '#fff' : P.bg, align: 'center' })] }),
      ]),
    ]));
  });

  // Bottom nav
  ch.push(F(0, 750, 375, 62, P.surface, { ch: [
    Line(0, 0, 375, P.border),
    T('⌂', 30, 16, 30, 28, { size: 20, fill: P.fg3, align: 'center' }),
    T('HOME', 15, 40, 60, 10, { size: 7, weight: 700, fill: P.fg3, align: 'center', ls: 1 }),
    T('◷', 103, 16, 30, 28, { size: 18, fill: P.fg3, align: 'center' }),
    T('FLOW', 88, 40, 60, 10, { size: 7, weight: 700, fill: P.fg3, align: 'center', ls: 1 }),
    T('⊡', 180, 16, 30, 28, { size: 18, fill: P.emerald, align: 'center' }),
    T('INVOICES', 158, 40, 74, 10, { size: 7, weight: 700, fill: P.emerald, align: 'center', ls: 1 }),
    T('✦', 258, 16, 30, 28, { size: 16, fill: P.fg3, align: 'center' }),
    T('ASK AI', 243, 40, 60, 10, { size: 7, weight: 700, fill: P.fg3, align: 'center', ls: 1 }),
    T('◈', 330, 16, 30, 28, { size: 18, fill: P.fg3, align: 'center' }),
    T('TAX', 315, 40, 60, 10, { size: 7, weight: 700, fill: P.fg3, align: 'center', ls: 1 }),
  ]}));

  return {
    id: uid(), type: 'frame', name: 'S3 · Invoices',
    x: 0, y: 0, width: 375, height: 812,
    fill: P.bg, children: ch,
  };
}

// ── SCREEN 4: Ask FOLIA (AI Chat) ─────────────────────────────────────────────
function screen4() {
  const ch = [];
  ch.push(F(0, 0, 375, 812, P.bg, {}));
  // AI glow
  ch.push(E(188, 40, 300, 220, P.emerald, { opacity: 0.04 }));
  ch.push(StatusBar(16));

  // Header
  ch.push(T('Ask FOLIA', 20, 46, 200, 24, { size: 22, weight: 800, fill: P.fg }));
  ch.push(T('AI money intelligence', 20, 72, 200, 14, { size: 11, fill: P.fg3 }));

  // AI avatar / status
  ch.push(E(314, 44, 44, 44, P.surface2, { stroke: P.emerald, sw: 1.5 }));
  ch.push(E(321, 51, 30, 30, P.emerald, { opacity: 0.12 }));
  ch.push(T('AI', 314, 58, 44, 16, { size: 11, weight: 800, fill: P.emerald, align: 'center' }));
  ch.push(E(348, 76, 8, 8, P.emerald, {}));

  // Quick action chips
  const chips = ['Cash this month?', 'Tax estimate', 'Best paying client', 'Compare to Feb'];
  chips.forEach((chip, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const w = 155;
    ch.push(F(16 + col * 168, 100 + row * 38, w, 28, P.surface2, {
      r: 14,
      stroke: P.border2,
      ch: [T(chip, 0, 7, w, 14, { size: 10, fill: P.fg2, align: 'center' })],
    }));
  });

  // Chat messages
  const msgs = [
    { from: 'user', text: 'Which client made me the most money this quarter?' },
    { from: 'ai', text: 'Studio Nine is your top client this Q1 — $9,600 across 3 projects (retainer + Brand System + App UI). They account for 42% of your Q1 revenue. Acme Co is second at $7,200.' },
    { from: 'user', text: 'Should I raise my rates for Q2?' },
    { from: 'ai', text: 'Based on your utilization (148h/month, $96 effective rate), you\'re at 94% capacity. The market rate for senior product designers is $120–$140/hr. A 25% increase to $120/hr would generate an additional $3,552/month at current hours. I\'d recommend starting with new clients only.' },
    { from: 'user', text: 'Can you draft a rate increase email to Acme?' },
    { from: 'ai', text: 'Sure! I\'ll draft it in the next screen. I know your project history with them and their current contract terms. Want a formal or conversational tone?' },
  ];

  let yOff = 184;
  msgs.forEach(msg => {
    const isUser = msg.from === 'user';
    const maxW = 260;
    const lines = Math.ceil(msg.text.length / 38);
    const h = 20 + lines * 16;
    const bubbleColor = isUser ? P.surface3 : P.surface2;
    const bubbleStroke = isUser ? P.border2 : P.emerald + '44';
    const textColor = isUser ? P.fg : P.fg;
    const x = isUser ? 375 - 16 - maxW : 16;

    ch.push(F(x, yOff, maxW, h, bubbleColor, {
      r: isUser ? 12 : 12,
      stroke: bubbleStroke,
      ch: [T(msg.text, 12, 10, maxW - 24, h - 16, { size: 11, fill: textColor, lh: 1.45 })],
    }));
    if (!isUser) {
      ch.push(E(16, yOff - 4, 8, 8, P.emerald, {}));
    }
    yOff += h + 12;
  });

  // Input bar
  ch.push(F(0, 744, 375, 68, P.surface, { ch: [
    Line(0, 0, 375, P.border),
    F(16, 12, 299, 42, P.surface2, { r: 21, stroke: P.border2, ch: [
      T('Ask about your money...', 16, 13, 220, 16, { size: 12, fill: P.fg3 }),
    ]}),
    // Send button
    F(322, 12, 42, 42, P.emerald, { r: 21, ch: [
      T('↑', 0, 6, 42, 28, { size: 18, weight: 800, fill: P.bg, align: 'center' }),
    ]}),
  ]}));

  return {
    id: uid(), type: 'frame', name: 'S4 · Ask FOLIA',
    x: 0, y: 0, width: 375, height: 812,
    fill: P.bg, children: ch,
  };
}

// ── SCREEN 5: Tax Prep ────────────────────────────────────────────────────────
function screen5() {
  const ch = [];
  ch.push(F(0, 0, 375, 812, P.bg, {}));
  ch.push(StatusBar(16));

  // Header
  ch.push(T('Tax Prep', 20, 46, 180, 24, { size: 22, weight: 800, fill: P.fg }));
  ch.push(T('2026 Quarterly Estimate', 20, 72, 220, 14, { size: 11, fill: P.fg3 }));

  // AI confidence badge
  ch.push(F(248, 58, 112, 22, P.emerald + '18', { r: 11, stroke: P.emerald + '44', ch: [
    E(12, 6, 10, 10, P.emerald, {}),
    T('AI ESTIMATED', 26, 5, 82, 12, { size: 8, weight: 700, fill: P.emerald, ls: 1 }),
  ]}));

  // Tax summary hero
  ch.push(BentoCard(16, 100, 343, 110, [
    T('ESTIMATED Q1 TAX DUE', 16, 12, 200, 10, { size: 9, weight: 700, fill: P.fg3, ls: 2 }),
    T('$3,570', 16, 30, 180, 40, { size: 34, weight: 800, fill: P.amber }),
    T('Due April 15, 2026', 16, 74, 160, 14, { size: 11, fill: P.fg3 }),
    T('Auto-reserve: ON', 220, 74, 120, 14, { size: 11, fill: P.emerald, align: 'right' }),
    // Mini dial
    E(270, 18, 66, 66, P.surface2, { stroke: P.border, sw: 8 }),
    E(270, 18, 66, 66, 'transparent', { stroke: P.amber, sw: 8, opacity: 0.7 }),
    T('25%', 258, 43, 90, 16, { size: 13, weight: 700, fill: P.amber, align: 'center' }),
    T('RATE', 258, 60, 90, 10, { size: 7, fill: P.fg3, align: 'center', ls: 1 }),
  ]));

  // ── Category breakdown ────────────────────────────────────────────────────
  ch.push(T('DEDUCTIBLE EXPENSES', 20, 224, 220, 11, { size: 9, weight: 700, fill: P.fg3, ls: 2 }));
  ch.push(T('$8,220 total', 280, 224, 80, 11, { size: 9, fill: P.emerald, align: 'right' }));

  const deductions = [
    { cat: 'Software & Tools',   amt: '$2,180', pct: '26%', auto: true  },
    { cat: 'Contractor Fees',    amt: '$3,400', pct: '41%', auto: true  },
    { cat: 'Infrastructure',     amt: '$640',   pct: '8%',  auto: true  },
    { cat: 'Equipment',          amt: '$1,200', pct: '15%', auto: false },
    { cat: 'Travel & Transport', amt: '$480',   pct: '6%',  auto: false },
    { cat: 'Professional Dev',   amt: '$320',   pct: '4%',  auto: false },
  ];

  deductions.forEach((d, i) => {
    const y = 244 + i * 52;
    ch.push(F(16, y, 343, 42, P.surface, { r: 8, ch: [
      T(d.cat, 12, 11, 190, 14, { size: 12, weight: 500, fill: P.fg }),
      T(d.auto ? '✦ AUTO' : 'MANUAL', 12, 27, 80, 10, { size: 8, weight: 700, fill: d.auto ? P.emerald : P.fg3, ls: 1 }),
      T(d.pct, 230, 5, 50, 32, { size: 11, fill: P.fg3, align: 'right' }),
      T(d.amt, 282, 5, 50, 32, { size: 14, weight: 700, fill: P.fg, align: 'right' }),
    ]}));
  });

  // Export CTA
  ch.push(F(16, 568, 343, 48, P.emerald, { r: 12, ch: [
    T('Export Tax Report — PDF & CSV', 0, 15, 343, 18, { size: 13, weight: 700, fill: P.bg, align: 'center' }),
  ]}));

  // Connect accountant
  ch.push(F(16, 626, 343, 44, P.surface2, { r: 10, stroke: P.border, ch: [
    T('Share with your accountant', 12, 14, 220, 16, { size: 12, fill: P.fg2 }),
    T('Invite →', 290, 14, 50, 16, { size: 11, fill: P.emerald, align: 'right' }),
  ]}));

  // Disclaimer
  ch.push(T('Estimates based on self-employment tax rate (SE 15.3% + income bracket). Consult a CPA for final figures.', 20, 682, 335, 32, { size: 9, fill: P.fg3, lh: 1.5 }));

  // Bottom nav
  ch.push(F(0, 750, 375, 62, P.surface, { ch: [
    Line(0, 0, 375, P.border),
    T('⌂', 30, 16, 30, 28, { size: 20, fill: P.fg3, align: 'center' }),
    T('HOME', 15, 40, 60, 10, { size: 7, weight: 700, fill: P.fg3, align: 'center', ls: 1 }),
    T('◷', 103, 16, 30, 28, { size: 18, fill: P.fg3, align: 'center' }),
    T('FLOW', 88, 40, 60, 10, { size: 7, weight: 700, fill: P.fg3, align: 'center', ls: 1 }),
    T('⊡', 180, 16, 30, 28, { size: 18, fill: P.fg3, align: 'center' }),
    T('INVOICES', 158, 40, 74, 10, { size: 7, weight: 700, fill: P.fg3, align: 'center', ls: 1 }),
    T('✦', 258, 16, 30, 28, { size: 16, fill: P.fg3, align: 'center' }),
    T('ASK AI', 243, 40, 60, 10, { size: 7, weight: 700, fill: P.fg3, align: 'center', ls: 1 }),
    T('◈', 330, 16, 30, 28, { size: 18, fill: P.emerald, align: 'center' }),
    T('TAX', 315, 40, 60, 10, { size: 7, weight: 700, fill: P.emerald, align: 'center', ls: 1 }),
  ]}));

  return {
    id: uid(), type: 'frame', name: 'S5 · Tax Prep',
    x: 0, y: 0, width: 375, height: 812,
    fill: P.bg, children: ch,
  };
}

// ── Build & save ───────────────────────────────────────────────────────────────
const doc = {
  version: '2.8',
  name: 'FOLIA — AI Finance Intelligence',
  children: [screen1(), screen2(), screen3(), screen4(), screen5()],
};

const outPath = path.join(__dirname, 'folia.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log(`✅ folia.pen written — ${doc.children.length} screens`);
console.log(`   Palette: Forest Dark #080E0B · Emerald #2ECC8A · Amber #E8A832 · AI Blue #6BCFFF`);
