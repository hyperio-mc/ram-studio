'use strict';
// solo-app.js
// SOLO — AI Expense Intelligence for Independents
//
// Design Heartbeat — Mar 21, 2026
// Inspired by:
//   • Atlas Card (atlascard.com via godly.website): pure #000 base, electric navy blue,
//     editorial minimal typography — ultra-dark fintech identity
//   • Obsidian (obsidianos.com via darkmodedesign.com): near-black #0D0D10,
//     neon lime green accent (rgb(103,210,67)) — fintech SaaS with electric data punch
//   • Midday.ai (darkmodedesign.com): "For the new wave of one-person companies"
//     — the solo-founder financial dashboard that inspired the product vision
//
// Challenge: Merge Atlas Card's pure-black ultra-minimalism with Obsidian's
// neon-lime data accent into an AI expense intelligence app for independent
// professionals. Pure black base · neon lime data layer · electric blue interaction.
// 5 mobile + 2 desktop = 7 screens total.

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:      '#050507',   // pure near-black (Atlas Card inspired)
  surface: '#0C0C10',   // lifted surface
  card:    '#111117',   // card background
  card2:   '#0E0E14',   // alt card
  border:  '#1C1C24',   // subtle border
  border2: '#282832',   // stronger border
  muted:   '#3A3A48',   // muted ui
  fg:      '#F0F0FF',   // primary text — cool white
  fg2:     '#7878A0',   // secondary text
  fg3:     '#3C3C52',   // dimmed
  lime:    '#5EFF6B',   // neon lime (Obsidian-inspired, primary accent)
  lime2:   '#A8FFB0',   // lime highlight
  lime3:   '#1DB827',   // lime dark
  blue:    '#1A3BFF',   // electric blue (Atlas Card navy, electrified)
  blue2:   '#6080FF',   // lighter blue
  blue3:   '#0A1A80',   // blue dark
  red:     '#FF4560',   // overspend / negative
  red2:    '#FF8093',   // light red
  amber:   '#FFB830',   // warning / pending
  white:   '#FFFFFF',
};

let _id = 0;
const uid = () => `s${++_id}`;

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
  fontSize: opts.size || 12,
  fontWeight: String(opts.weight || 400),
  fill: opts.fill || P.fg,
  textAlign: opts.align || 'left',
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh !== undefined ? { lineHeight: opts.lh } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const R = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'rectangle', x, y, width: w, height: h, fill,
  ...(opts.r !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const HLine = (x, y, w, fill = P.border) => R(x, y, w, 1, fill);

// Status dot
const Dot = (x, y, color, size = 6) => E(x, y, size, size, color);

// Pill badge
const Pill = (x, y, text, bg, fg, opts = {}) => {
  const w = Math.round(text.length * 5.5 + 16);
  return F(x, y, w, 18, bg, {
    r: opts.r !== undefined ? opts.r : 3,
    ch: [T(text, 8, 2.5, w - 16, 13, { size: 9, fill: fg, weight: 700, ls: 0.8 })],
  });
};

// Lime accent line at very top of screen
const LimeBar = (w) => R(0, 0, w, 2, P.lime, { opacity: 0.85 });

// Progress bar pair (track + fill)
const ProgressBar = (x, y, w, h, pct, color, bg = P.surface) => [
  R(x, y, w, h, bg, { r: h / 2 }),
  R(x, y, Math.max(4, Math.round(w * Math.min(1, pct))), h, color, { r: h / 2 }),
];

// Category icon box
const CatIcon = (x, y, emoji, bg) => F(x, y, 32, 32, bg, {
  r: 8,
  ch: [T(emoji, 6, 7, 20, 18, { size: 14, align: 'center' })],
});

// Full transaction row
const TxRow = (x, y, w, emoji, catBg, merchant, category, amount, isExpense, date) =>
  F(x, y, w, 38, 'transparent', {
    ch: [
      CatIcon(0, 3, emoji, catBg),
      T(merchant, 42, 4, w - 130, 16, { size: 13, weight: 600, fill: P.fg }),
      T(category, 42, 22, w - 130, 12, { size: 10, fill: P.fg3, ls: 0.5 }),
      T(amount, w - 68, 4, 66, 16, { size: 13, weight: 700, fill: isExpense ? P.red2 : P.lime, align: 'right' }),
      T(date, w - 68, 22, 66, 12, { size: 10, fill: P.fg3, align: 'right' }),
    ],
  });

// Bottom nav bar for mobile
const BottomNav = (activeIndex, W, H) => {
  const items = [
    { icon: '⌂', label: 'Home' },
    { icon: '◎', label: 'Insights' },
    { icon: '◫', label: 'Budget' },
    { icon: '◷', label: 'Invoices' },
  ];
  const ch = [
    R(0, 0, W, 68, P.surface),
    HLine(0, 0, W, P.border),
  ];
  items.forEach((n, i) => {
    const nx = i * (W / 4) + (W / 8) - 20;
    const active = i === activeIndex;
    ch.push(T(n.icon, nx, 12, 40, 22, { size: 18, align: 'center', fill: active ? P.lime : P.fg3 }));
    ch.push(T(n.label, nx - 5, 38, 50, 14, { size: 9, align: 'center', fill: active ? P.lime : P.fg3, weight: active ? 700 : 400 }));
    if (active) ch.push(R(nx + 12, 65, 16, 3, P.lime, { r: 2 }));
  });
  return F(0, H - 68, W, 68, P.surface, { ch });
};

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE SCREENS  375 × 812
// ─────────────────────────────────────────────────────────────────────────────
const MW = 375, MH = 812;
const MP = 20;  // mobile padding

// ── M1: Home / Transaction Feed ───────────────────────────────────────────────
function mobileHome(sx) {
  const ch = [];
  ch.push(R(0, 0, MW, MH, P.bg));
  ch.push(LimeBar(MW));

  // Status bar
  ch.push(T('9:41', MP, 14, 60, 16, { size: 12, weight: 600, fill: P.fg, ls: 0.5 }));
  ch.push(T('◼ ◼ ▲', MW - 68, 14, 66, 16, { size: 10, fill: P.fg2, align: 'right', ls: 1 }));

  // App header
  ch.push(T('SOLO', MP, 44, 100, 28, { size: 22, weight: 900, fill: P.fg, ls: 3 }));
  ch.push(E(MW - 50, 40, 36, 36, P.card, { stroke: P.lime + '50', sw: 1 }));
  ch.push(T('JR', MW - 41, 48, 24, 20, { size: 12, weight: 800, fill: P.lime, align: 'center' }));

  // Balance hero
  ch.push(T('TOTAL BALANCE', MP, 92, 200, 14, { size: 9, weight: 700, fill: P.fg3, ls: 2.5 }));
  ch.push(T('$24,180', MP, 108, 220, 52, { size: 46, weight: 900, fill: P.white, ls: -1.5 }));
  ch.push(T('.42', MP + 192, 128, 44, 28, { size: 22, weight: 300, fill: P.fg2 }));

  // Trend pill
  ch.push(Pill(MP, 168, '+$840 this month', P.lime3 + '30', P.lime));
  ch.push(T('↑ 3.6% vs last month', MP + 158, 169, 170, 14, { size: 11, fill: P.fg3 }));

  ch.push(HLine(MP, 196, MW - MP * 2, P.border));

  // Quick stats
  const statW = Math.floor((MW - MP * 2 - 16) / 3);
  const stats = [
    { label: 'SPENT',  value: '$3,240', color: P.red2  },
    { label: 'EARNED', value: '$4,080', color: P.lime  },
    { label: 'SAVED',  value: '$840',   color: P.blue2 },
  ];
  stats.forEach((s, i) => {
    const cx = MP + i * (statW + 8);
    ch.push(F(cx, 208, statW, 60, P.card, {
      r: 10, stroke: P.border,
      ch: [
        T(s.label, 10, 10, statW - 20, 12, { size: 8, weight: 700, fill: P.fg3, ls: 1.5 }),
        T(s.value, 10, 28, statW - 20, 22, { size: 17, weight: 900, fill: s.color }),
      ],
    }));
  });

  // AI insight strip
  ch.push(F(MP, 284, MW - MP * 2, 50, P.card2, {
    r: 12, stroke: P.lime + '28',
    ch: [
      R(0, 0, 3, 50, P.lime, { r: 2 }),
      T('✦', 12, 13, 20, 24, { size: 16, fill: P.lime }),
      T('AI Insight', 36, 8, 110, 14, { size: 10, weight: 700, fill: P.lime, ls: 1 }),
      T('12% under your dining budget this week.', 36, 26, MW - MP * 2 - 48, 16, { size: 11, fill: P.fg2, lh: 1.4 }),
    ],
  }));

  // Transactions
  ch.push(T('RECENT', MP, 350, 100, 14, { size: 9, weight: 700, fill: P.fg3, ls: 2 }));
  ch.push(T('See all →', MW - 70, 350, 62, 14, { size: 11, fill: P.blue2, align: 'right' }));

  const txs = [
    { emoji: '☕', bg: '#2A1800', merchant: 'Blue Bottle Coffee', cat: 'DINING',   amt: '-$8.50',     exp: true,  date: 'Today' },
    { emoji: '✈', bg: '#001440', merchant: 'United Airlines',     cat: 'TRAVEL',   amt: '-$340.00',   exp: true,  date: 'Yesterday' },
    { emoji: '💻', bg: '#001A08', merchant: 'Adobe Creative',      cat: 'SOFTWARE', amt: '-$54.99',    exp: true,  date: 'Mar 19' },
    { emoji: '💰', bg: '#001A08', merchant: 'Stripe Payment',      cat: 'INCOME',   amt: '+$2,400.00', exp: false, date: 'Mar 18' },
    { emoji: '🏠', bg: '#1A0020', merchant: 'Airbnb NYC',          cat: 'TRAVEL',   amt: '-$210.00',   exp: true,  date: 'Mar 17' },
    { emoji: '⚡', bg: '#202000', merchant: 'Figma Pro',           cat: 'SOFTWARE', amt: '-$15.00',    exp: true,  date: 'Mar 17' },
    { emoji: '💰', bg: '#001A08', merchant: 'PayPal — Consulting', cat: 'INCOME',   amt: '+$1,680.00', exp: false, date: 'Mar 16' },
  ];
  txs.forEach((tx, i) => {
    const ty = 374 + i * 52;
    if (ty + 52 > MH - 76) return;
    ch.push(TxRow(MP, ty, MW - MP * 2, tx.emoji, tx.bg, tx.merchant, tx.cat, tx.amt, tx.exp, tx.date));
    if (i < txs.length - 1) ch.push(HLine(MP + 42, ty + 46, MW - MP * 2 - 42, P.border + '50'));
  });

  ch.push(BottomNav(0, MW, MH));

  return F(sx, 0, MW, MH, P.bg, { clip: true, ch });
}

// ── M2: Spending Insights ─────────────────────────────────────────────────────
function mobileInsights(sx) {
  const ch = [];
  ch.push(R(0, 0, MW, MH, P.bg));
  ch.push(LimeBar(MW));

  ch.push(T('9:41', MP, 14, 60, 16, { size: 12, weight: 600, fill: P.fg, ls: 0.5 }));
  ch.push(T('◼ ◼ ▲', MW - 68, 14, 66, 16, { size: 10, fill: P.fg2, align: 'right', ls: 1 }));

  ch.push(T('INSIGHTS', MP, 44, 200, 24, { size: 20, weight: 900, fill: P.fg, ls: 1.5 }));
  ch.push(T('March 2026', MP, 72, 120, 16, { size: 12, fill: P.fg3 }));

  // Big donut
  const cx = MW / 2, cy = 178, r = 70;
  // Background ring
  ch.push(E(cx - r - 10, cy - r - 10, (r + 10) * 2, (r + 10) * 2, 'transparent', { stroke: P.surface, sw: 18 }));
  // Filled arc ring (approximate with thick stroke ellipse)
  ch.push(E(cx - r - 10, cy - r - 10, (r + 10) * 2, (r + 10) * 2, 'transparent', { stroke: P.lime, sw: 8 }));
  // Center
  ch.push(T('$3,240', cx - 50, cy - 24, 100, 30, { size: 24, weight: 900, fill: P.white, align: 'center' }));
  ch.push(T('SPENT', cx - 28, cy + 10, 56, 14, { size: 9, weight: 700, fill: P.fg3, ls: 2, align: 'center' }));
  ch.push(T('of $4,500', cx - 36, cy + 28, 72, 14, { size: 10, fill: P.fg3, align: 'center' }));

  // % ring indicator
  ch.push(Pill(cx - 56, cy + 50, '72% used  ·  $1,260 left', P.lime3 + '25', P.lime));

  // Category bars
  ch.push(T('BY CATEGORY', MP, 276, 200, 14, { size: 9, weight: 700, fill: P.fg3, ls: 2 }));

  const cats = [
    { label: 'Software & Tools', emoji: '💻', amt: '$840', pct: 0.26, color: P.blue2 },
    { label: 'Travel',           emoji: '✈',  amt: '$680', pct: 0.21, color: P.amber },
    { label: 'Marketing',        emoji: '📣',  amt: '$900', pct: 0.28, color: P.lime  },
    { label: 'Dining',           emoji: '☕',  amt: '$320', pct: 0.10, color: P.red2  },
    { label: 'Office',           emoji: '🖨',  amt: '$500', pct: 0.15, color: P.muted },
  ];
  cats.forEach((c, i) => {
    const cy2 = 298 + i * 68;
    ch.push(F(MP, cy2, MW - MP * 2, 60, P.card, {
      r: 10, stroke: P.border,
      ch: [
        T(c.emoji, 12, 14, 24, 24, { size: 18 }),
        T(c.label, 44, 10, 160, 16, { size: 12, weight: 600, fill: P.fg }),
        T(c.amt, MW - MP * 2 - 56, 10, 52, 16, { size: 13, weight: 800, fill: c.color, align: 'right' }),
        ...ProgressBar(44, 34, MW - MP * 2 - 64, 5, c.pct, c.color),
        T(Math.round(c.pct * 100) + '%', MW - MP * 2 - 50, 42, 46, 12, { size: 9, fill: P.fg3, align: 'right' }),
      ],
    }));
  });

  ch.push(BottomNav(1, MW, MH));

  return F(sx, 0, MW, MH, P.bg, { clip: true, ch });
}

// ── M3: Budget Tracker ────────────────────────────────────────────────────────
function mobileBudget(sx) {
  const ch = [];
  ch.push(R(0, 0, MW, MH, P.bg));
  ch.push(LimeBar(MW));

  ch.push(T('9:41', MP, 14, 60, 16, { size: 12, weight: 600, fill: P.fg, ls: 0.5 }));
  ch.push(T('◼ ◼ ▲', MW - 68, 14, 66, 16, { size: 10, fill: P.fg2, align: 'right', ls: 1 }));

  ch.push(T('BUDGET', MP, 44, 180, 24, { size: 20, weight: 900, fill: P.fg, ls: 1.5 }));

  // Month tabs
  const months = ['JAN', 'FEB', 'MAR', 'APR'];
  months.forEach((m, i) => {
    const active = m === 'MAR';
    ch.push(F(MP + i * 74, 76, 66, 24, active ? P.lime3 + '35' : P.card, {
      r: 6, stroke: active ? P.lime : P.border,
      ch: [T(m, 0, 4, 66, 16, { size: 10, weight: 700, fill: active ? P.lime : P.fg3, align: 'center', ls: 1 })],
    }));
  });

  // Overview card
  ch.push(F(MP, 112, MW - MP * 2, 76, P.card, {
    r: 12, stroke: P.border,
    ch: [
      T('MARCH OVERVIEW', 16, 12, 200, 12, { size: 8, weight: 700, fill: P.fg3, ls: 2 }),
      HLine(16, 28, MW - MP * 2 - 32),
      T('Budget', 16, 40, 80, 16, { size: 11, fill: P.fg3 }),
      T('$4,500', 16, 56, 80, 18, { size: 16, weight: 800, fill: P.fg }),
      T('Spent', (MW - MP * 2) / 3, 40, 80, 16, { size: 11, fill: P.fg3 }),
      T('$3,240', (MW - MP * 2) / 3, 56, 80, 18, { size: 16, weight: 800, fill: P.red2 }),
      T('Left', (MW - MP * 2) * 2 / 3 + 4, 40, 80, 16, { size: 11, fill: P.fg3 }),
      T('$1,260', (MW - MP * 2) * 2 / 3 + 4, 56, 80, 18, { size: 16, weight: 800, fill: P.lime }),
    ],
  }));

  ch.push(T('CATEGORIES', MP, 204, 200, 14, { size: 9, weight: 700, fill: P.fg3, ls: 2 }));

  const budgets = [
    { label: 'Software & Tools', budget: 1000, spent: 840,  color: P.blue2 },
    { label: 'Travel',           budget: 800,  spent: 680,  color: P.amber },
    { label: 'Marketing',        budget: 1200, spent: 900,  color: P.lime  },
    { label: 'Dining',           budget: 500,  spent: 320,  color: P.red2  },
    { label: 'Office Supplies',  budget: 500,  spent: 500,  color: P.red   },
    { label: 'Subscriptions',    budget: 500,  spent: 0,    color: P.muted },
  ];
  const bCW = MW - MP * 2;
  budgets.forEach((b, i) => {
    const by = 224 + i * 72;
    const pct = Math.min(1, b.spent / b.budget);
    const over = b.spent >= b.budget;
    ch.push(F(MP, by, bCW, 64, P.card, {
      r: 10, stroke: over ? P.red + '35' : P.border,
      ch: [
        T(b.label, 16, 10, 190, 16, { size: 12, weight: 600, fill: P.fg }),
        T('$' + b.spent.toLocaleString(), bCW - 70, 10, 54, 16, { size: 12, weight: 800, fill: over ? P.red : b.color, align: 'right' }),
        T('/ $' + b.budget.toLocaleString(), bCW - 16, 24, 0, 14, { size: 9, fill: P.fg3, align: 'right' }),
        ...ProgressBar(16, 36, bCW - 32, 6, pct, over ? P.red : b.color),
        T(over ? '⚠ At limit' : Math.round(pct * 100) + '% of budget', 16, 48, 180, 12, { size: 9, fill: over ? P.red2 : P.fg3 }),
      ],
    }));
  });

  ch.push(BottomNav(2, MW, MH));

  return F(sx, 0, MW, MH, P.bg, { clip: true, ch });
}

// ── M4: Invoice Matcher ───────────────────────────────────────────────────────
function mobileInvoice(sx) {
  const ch = [];
  ch.push(R(0, 0, MW, MH, P.bg));
  ch.push(LimeBar(MW));

  ch.push(T('9:41', MP, 14, 60, 16, { size: 12, weight: 600, fill: P.fg, ls: 0.5 }));
  ch.push(T('◼ ◼ ▲', MW - 68, 14, 66, 16, { size: 10, fill: P.fg2, align: 'right', ls: 1 }));

  ch.push(T('INVOICES', MP, 44, 200, 24, { size: 20, weight: 900, fill: P.fg, ls: 1.5 }));
  ch.push(T('AI expense-to-invoice linking', MP, 72, MW - MP * 2, 16, { size: 11, fill: P.fg3 }));

  // Summary strip
  const sW = Math.floor((MW - MP * 2 - 12) / 3);
  const sums = [
    { label: 'MATCHED', value: '18', color: P.lime  },
    { label: 'PENDING', value: '4',  color: P.amber },
    { label: 'UNLINKED', value: '7', color: P.red2  },
  ];
  sums.forEach((s, i) => {
    ch.push(F(MP + i * (sW + 6), 96, sW, 52, P.card, {
      r: 10, stroke: P.border,
      ch: [
        T(s.value, 0, 8, sW, 22, { size: 20, weight: 900, fill: s.color, align: 'center' }),
        T(s.label, 0, 32, sW, 14, { size: 8, weight: 700, fill: P.fg3, align: 'center', ls: 1 }),
      ],
    }));
  });

  // AI suggestion
  ch.push(F(MP, 162, MW - MP * 2, 72, P.card2, {
    r: 12, stroke: P.lime + '28',
    ch: [
      R(0, 0, 3, 72, P.lime, { r: 2 }),
      T('✦ AI MATCH SUGGESTION', 14, 10, 250, 14, { size: 9, weight: 700, fill: P.lime, ls: 1.5 }),
      T('Adobe Creative ($54.99) matches', 14, 28, MW - MP * 2 - 22, 14, { size: 11, fill: P.fg, weight: 600 }),
      T('INV-2024-031 · Design Software line item', 14, 44, MW - MP * 2 - 80, 14, { size: 11, fill: P.fg2 }),
      T('ACCEPT', MW - MP * 2 - 62, 52, 52, 16, { size: 9, weight: 800, fill: P.lime, align: 'right', ls: 1 }),
    ],
  }));

  ch.push(T('INVOICES', MP, 250, 200, 14, { size: 9, weight: 700, fill: P.fg3, ls: 2 }));

  const invoices = [
    { num: 'INV-2026-041', client: 'Vortex Labs',     amt: '$4,200', status: 'PAID',    color: P.lime,  matched: 12 },
    { num: 'INV-2026-040', client: 'North Quarter',   amt: '$2,800', status: 'PENDING', color: P.amber, matched: 6  },
    { num: 'INV-2026-039', client: 'Hollow Earth Co', amt: '$1,600', status: 'DRAFT',   color: P.fg3,   matched: 3  },
    { num: 'INV-2026-038', client: 'Rogue Studio',    amt: '$3,100', status: 'PAID',    color: P.lime,  matched: 9  },
  ];
  invoices.forEach((inv, i) => {
    const iy = 272 + i * 82;
    ch.push(F(MP, iy, MW - MP * 2, 74, P.card, {
      r: 10, stroke: P.border,
      ch: [
        T(inv.num, 16, 10, 180, 14, { size: 10, weight: 600, fill: P.fg2, ls: 0.3 }),
        Pill(MW - MP * 2 - 70, 10, inv.status, inv.color + '20', inv.color),
        T(inv.client, 16, 28, 180, 16, { size: 13, weight: 700, fill: P.fg }),
        T(inv.amt, MW - MP * 2 - 68, 28, 52, 16, { size: 14, weight: 900, fill: P.fg, align: 'right' }),
        T(inv.matched + ' expenses matched', 16, 52, 200, 14, { size: 10, fill: P.fg3 }),
        T('View →', MW - MP * 2 - 48, 52, 36, 14, { size: 10, fill: P.blue2, align: 'right' }),
      ],
    }));
  });

  ch.push(BottomNav(3, MW, MH));

  return F(sx, 0, MW, MH, P.bg, { clip: true, ch });
}

// ── M5: AI Weekly Report ──────────────────────────────────────────────────────
function mobileAIReport(sx) {
  const ch = [];
  ch.push(R(0, 0, MW, MH, P.bg));
  ch.push(LimeBar(MW));

  // Subtle lime glow blob at top
  ch.push(E(MW / 2 - 100, -100, 200, 200, P.lime, { opacity: 0.04 }));

  ch.push(T('9:41', MP, 14, 60, 16, { size: 12, weight: 600, fill: P.fg, ls: 0.5 }));
  ch.push(T('◼ ◼ ▲', MW - 68, 14, 66, 16, { size: 10, fill: P.fg2, align: 'right', ls: 1 }));

  ch.push(T('✦ AI REPORT', MP, 44, 210, 24, { size: 20, weight: 900, fill: P.lime, ls: 1 }));
  ch.push(T('Week of Mar 17–21, 2026', MP, 72, 240, 16, { size: 12, fill: P.fg3 }));

  // Health score card
  ch.push(F(MP, 100, MW - MP * 2, 90, P.card, {
    r: 14, stroke: P.lime + '22',
    ch: [
      R(0, 0, 4, 90, P.lime, { r: 2 }),
      T('FINANCIAL HEALTH SCORE', 20, 14, 220, 12, { size: 8, weight: 700, fill: P.fg3, ls: 2 }),
      T('87', 20, 28, 60, 46, { size: 42, weight: 900, fill: P.lime }),
      T('/100', 76, 52, 36, 20, { size: 13, weight: 400, fill: P.fg3 }),
      T('↑ +6 pts from last week', 122, 56, 190, 14, { size: 10, fill: P.lime2, weight: 600 }),
      T('Strong income-to-expense ratio. Excellent\ncost discipline this week.', 20, 76, MW - MP * 2 - 36, 24, { size: 10, fill: P.fg2, lh: 1.5 }),
    ],
  }));

  // Daily spend chart
  ch.push(T('DAILY SPENDING — THIS WEEK', MP, 206, 260, 14, { size: 9, weight: 700, fill: P.fg3, ls: 2 }));

  const chartH = 76;
  const chartW = MW - MP * 2;
  const chartY = 226;
  const days   = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const vals   = [0.4, 0.9, 0.2, 0.65, 1.0, 0.3, 0.15];
  const dBarW  = Math.floor(chartW / days.length) - 4;

  days.forEach((d, i) => {
    const bx = MP + i * (dBarW + 4);
    const bH = Math.max(3, Math.round(chartH * vals[i]));
    const today = d === 'FRI';
    ch.push(R(bx, chartY + chartH - bH, dBarW, bH, today ? P.lime : P.blue2, { r: 3, opacity: today ? 1 : 0.6 }));
    ch.push(T(d, bx - 2, chartY + chartH + 6, dBarW + 4, 12, { size: 8, fill: today ? P.lime : P.fg3, align: 'center', weight: today ? 700 : 400 }));
  });
  ch.push(HLine(MP, chartY + chartH, chartW, P.border));

  // AI observations
  ch.push(T('OBSERVATIONS', MP, 332, 200, 14, { size: 9, weight: 700, fill: P.fg3, ls: 2 }));

  const obs = [
    { icon: '↑', color: P.lime,  text: 'Income up 18% vs prior week.',     tag: 'STRONG'   },
    { icon: '⚠', color: P.amber, text: 'Travel spiked 42% — 1 flight.',    tag: 'WATCH'    },
    { icon: '✓', color: P.lime,  text: 'All software costs on invoices.',   tag: 'MATCHED'  },
    { icon: '◎', color: P.blue2, text: 'Dining well within budget.',        tag: 'ON TRACK' },
    { icon: '↓', color: P.red2,  text: 'Office supplies trending upward.', tag: 'REVIEW'   },
  ];
  obs.forEach((o, i) => {
    const oy = 352 + i * 62;
    if (oy + 56 > MH - 76) return;
    ch.push(F(MP, oy, MW - MP * 2, 54, P.card, {
      r: 10, stroke: P.border,
      ch: [
        F(0, 0, 34, 54, o.color + '12', { r: 10, ch: [T(o.icon, 0, 17, 34, 20, { size: 13, fill: o.color, align: 'center', weight: 700 })] }),
        T(o.text, 44, 14, MW - MP * 2 - 108, 28, { size: 11, fill: P.fg, lh: 1.5 }),
        Pill(MW - MP * 2 - 68, 34, o.tag, o.color + '20', o.color),
      ],
    }));
  });

  ch.push(BottomNav(-1, MW, MH)); // no active tab

  return F(sx, 0, MW, MH, P.bg, { clip: true, ch });
}

// ─────────────────────────────────────────────────────────────────────────────
// DESKTOP SCREENS  1440 × 900
// ─────────────────────────────────────────────────────────────────────────────
const DW = 1440, DH = 900;
const DSide = 220;
const DP = 28;  // desktop content padding

// Desktop sidebar
function sidebar(activeId) {
  const items = [
    { icon: '⌂', label: 'Dashboard', id: 0 },
    { icon: '◎', label: 'Insights',  id: 1 },
    { icon: '◫', label: 'Budget',    id: 2 },
    { icon: '◷', label: 'Invoices',  id: 3 },
    { icon: '⊞', label: 'Analytics', id: 4 },
    { icon: '⚙', label: 'Settings',  id: 5 },
  ];
  const ch = [
    R(0, 0, DSide, DH, P.surface),
    R(DSide - 1, 0, 1, DH, P.border),
    LimeBar(DSide),
    T('SOLO', 24, 36, 100, 26, { size: 20, weight: 900, fill: P.fg, ls: 3 }),
    T('expense intelligence', 24, 64, 170, 14, { size: 9, fill: P.fg3, ls: 1 }),
    HLine(24, 86, DSide - 48, P.border),
  ];

  items.forEach((item) => {
    const iy = 106 + item.id * 48;
    const active = item.id === activeId;
    if (active) {
      ch.push(R(16, iy - 4, DSide - 20, 40, P.lime + '0E', { r: 8 }));
      ch.push(R(DSide - 3, iy - 4, 3, 40, P.lime, { r: 2 }));
    }
    ch.push(T(item.icon, 24, iy + 8, 22, 22, { size: 15, fill: active ? P.lime : P.fg3 }));
    ch.push(T(item.label, 52, iy + 9, 150, 20, { size: 13, weight: active ? 700 : 400, fill: active ? P.lime : P.fg2 }));
  });

  // User
  ch.push(HLine(24, DH - 76, DSide - 48, P.border));
  ch.push(E(24, DH - 60, 34, 34, P.card, { stroke: P.lime + '50', sw: 1 }));
  ch.push(T('JR', 28, DH - 52, 26, 18, { size: 12, weight: 800, fill: P.lime, align: 'center' }));
  ch.push(T('Jamie Reyes', 66, DH - 58, 140, 16, { size: 12, weight: 600, fill: P.fg }));
  ch.push(T('Solo Pro', 66, DH - 40, 80, 14, { size: 10, fill: P.fg3 }));

  return ch;
}

// ── D1: Desktop Dashboard ─────────────────────────────────────────────────────
function desktopDashboard(sx) {
  const ch = [];
  ch.push(R(0, 0, DW, DH, P.bg));
  ch.push(...sidebar(0));

  const CX = DSide + DP;
  const CW = DW - CX - DP;

  // Page header
  ch.push(T('Good morning, Jamie', CX, 30, 420, 28, { size: 22, weight: 700, fill: P.fg }));
  ch.push(T('March 21, 2026  ·  Week 12 of 52', CX, 60, 340, 16, { size: 12, fill: P.fg3 }));

  // Search
  ch.push(R(DW - 288, 26, 252, 36, P.card, { r: 10, stroke: P.border }));
  ch.push(T('⌕  Search transactions…', DW - 276, 36, 232, 18, { size: 12, fill: P.fg3 }));

  ch.push(HLine(CX, 80, CW, P.border));

  // KPI cards (4)
  const kpiW = Math.floor((CW - 24) / 4);
  const kpis = [
    { label: 'TOTAL BALANCE', value: '$24,180', sub: '+$840 this month',    color: P.lime,  trend: '↑' },
    { label: 'MTD SPENDING',  value: '$3,240',  sub: '72% of $4,500 budget', color: P.red2,  trend: '↓' },
    { label: 'MTD INCOME',    value: '$4,080',  sub: '2 payments received',  color: P.blue2, trend: '↑' },
    { label: 'SAVINGS RATE',  value: '20.6%',   sub: 'Target: 20.0% ✓',     color: P.lime,  trend: '↑' },
  ];
  kpis.forEach((k, i) => {
    const kx = CX + i * (kpiW + 8);
    ch.push(F(kx, 94, kpiW, 88, P.card, {
      r: 12, stroke: P.border,
      ch: [
        T(k.label, 16, 14, kpiW - 32, 12, { size: 8, weight: 700, fill: P.fg3, ls: 2 }),
        T(k.value, 16, 32, kpiW - 32, 32, { size: 26, weight: 900, fill: k.color }),
        T(k.trend + ' ' + k.sub, 16, 68, kpiW - 32, 14, { size: 10, fill: k.trend === '↑' ? P.lime2 : P.red2 }),
      ],
    }));
  });

  // Layout: left 60% + right 40%
  const contentY = 196;
  const lW = Math.round(CW * 0.6) - 12;
  const rW = CW - lW - 12;

  // ── Left: Spend bar chart card ─────────────────────────────────────────────
  ch.push(F(CX, contentY, lW, 248, P.card, {
    r: 12, stroke: P.border,
    ch: [
      T('DAILY SPENDING — MARCH', 20, 16, 300, 14, { size: 9, weight: 700, fill: P.fg3, ls: 2 }),
      T('$3,240 of $4,500 budget', lW - 176, 16, 156, 14, { size: 10, fill: P.fg2, align: 'right' }),
      HLine(20, 38, lW - 40),
    ],
  }));

  // Bar chart (21 days)
  const bcX = CX + 24, bcY = contentY + 50;
  const bcW = lW - 48, bcH = 160;
  const dayVals21 = [0.1,0.4,0.7,0.2,0.9,0.3,0.1, 0.5,0.8,0.4,0.2,0.6,0.3,0.1, 0.4,0.9,0.2,0.65,1.0,0.3,0.15];
  const dBW = Math.floor((bcW - 10) / 21) - 2;

  // Grid lines
  [0.25, 0.5, 0.75, 1.0].forEach(f => {
    const gy = bcY + bcH - Math.round(bcH * f);
    ch.push(HLine(bcX, gy, bcW, P.border + '60'));
    ch.push(T(['$100','$200','$300','$400'][Math.round(f*4)-1], bcX - 4, gy - 8, 36, 14, { size: 8, fill: P.fg3, align: 'right' }));
  });

  dayVals21.forEach((v, i) => {
    const bx = bcX + i * (dBW + 2);
    const bH = Math.max(3, Math.round(bcH * v * 0.85));
    const today = i === 20;
    const wknd = i % 7 >= 5;
    ch.push(R(bx, bcY + bcH - bH, dBW, bH, today ? P.lime : P.blue2, { r: 2, opacity: today ? 1 : wknd ? 0.35 : 0.65 }));
  });
  ch.push(HLine(bcX, bcY + bcH, bcW, P.border));
  ch.push(T('Today', bcX + 20 * (dBW + 2) + dBW / 2 - 14, bcY + bcH + 6, 28, 12, { size: 8, fill: P.lime }));
  ['1','7','14'].forEach((l, i) => {
    ch.push(T(l, bcX + [0,6,13][i] * (dBW + 2), bcY + bcH + 6, 14, 12, { size: 8, fill: P.fg3 }));
  });

  // ── Left bottom: Transactions table ───────────────────────────────────────
  ch.push(F(CX, contentY + 260, lW, 316, P.card, {
    r: 12, stroke: P.border,
    ch: [
      T('RECENT TRANSACTIONS', 20, 16, 300, 14, { size: 9, weight: 700, fill: P.fg3, ls: 2 }),
      HLine(20, 36, lW - 40),
    ],
  }));

  const hdrY = contentY + 260 + 44;
  ch.push(T('MERCHANT',  CX + 20, hdrY, 220, 12, { size: 8, weight: 700, fill: P.fg3, ls: 1.5 }));
  ch.push(T('CATEGORY',  CX + 286, hdrY, 100, 12, { size: 8, weight: 700, fill: P.fg3, ls: 1.5 }));
  ch.push(T('DATE',      CX + lW - 210, hdrY, 100, 12, { size: 8, weight: 700, fill: P.fg3, ls: 1.5 }));
  ch.push(T('AMOUNT',    CX + lW - 78, hdrY, 58, 12, { size: 8, weight: 700, fill: P.fg3, ls: 1.5, align: 'right' }));
  ch.push(HLine(CX + 20, hdrY + 18, lW - 40));

  const dTxs = [
    { emoji: '☕', bg: '#2A1800', merchant: 'Blue Bottle Coffee',      cat: 'Dining',   amt: '-$8.50',     exp: true,  date: 'Today 8:22am' },
    { emoji: '✈', bg: '#001440', merchant: 'United Airlines',          cat: 'Travel',   amt: '-$340.00',   exp: true,  date: 'Yesterday' },
    { emoji: '💻', bg: '#001A08', merchant: 'Adobe Creative Cloud',     cat: 'Software', amt: '-$54.99',    exp: true,  date: 'Mar 19' },
    { emoji: '💰', bg: '#001A08', merchant: 'Stripe — Client payment',  cat: 'Income',   amt: '+$2,400.00', exp: false, date: 'Mar 18' },
    { emoji: '🏠', bg: '#1A0020', merchant: 'Airbnb NYC Conference',    cat: 'Travel',   amt: '-$210.00',   exp: true,  date: 'Mar 17' },
  ];
  dTxs.forEach((tx, i) => {
    const ty = hdrY + 26 + i * 50;
    ch.push(CatIcon(CX + 20, ty + 6, tx.emoji, tx.bg));
    ch.push(T(tx.merchant, CX + 60, ty + 10, 216, 16, { size: 12, weight: 600, fill: P.fg }));
    ch.push(Pill(CX + 286, ty + 10, tx.cat.toUpperCase(), P.surface, P.fg2));
    ch.push(T(tx.date, CX + lW - 210, ty + 10, 130, 16, { size: 11, fill: P.fg3 }));
    ch.push(T(tx.amt, CX + lW - 74, ty + 10, 58, 16, { size: 13, weight: 800, fill: tx.exp ? P.red2 : P.lime, align: 'right' }));
    if (i < dTxs.length - 1) ch.push(HLine(CX + 20, ty + 46, lW - 40, P.border + '40'));
  });

  // ── Right: Category breakdown ──────────────────────────────────────────────
  ch.push(F(CX + lW + 12, contentY, rW, 248, P.card, {
    r: 12, stroke: P.border,
    ch: [
      T('CATEGORY SPLIT', 20, 16, rW - 40, 14, { size: 9, weight: 700, fill: P.fg3, ls: 2 }),
      HLine(20, 38, rW - 40),
    ],
  }));

  const rCats = [
    { label: 'Marketing',  pct: 0.28, amt: '$900',  color: P.lime  },
    { label: 'Software',   pct: 0.26, amt: '$840',  color: P.blue2 },
    { label: 'Travel',     pct: 0.21, amt: '$680',  color: P.amber },
    { label: 'Office',     pct: 0.15, amt: '$500',  color: P.muted },
    { label: 'Dining',     pct: 0.10, amt: '$320',  color: P.red2  },
  ];
  rCats.forEach((c, i) => {
    const ry = contentY + 56 + i * 38;
    ch.push(T(c.label, CX + lW + 32, ry, 120, 16, { size: 12, fill: P.fg }));
    ch.push(T(c.amt, CX + lW + 12 + rW - 16, ry, 0, 16, { size: 12, weight: 800, fill: c.color, align: 'right' }));
    ch.push(...ProgressBar(CX + lW + 32, ry + 22, rW - 52, 5, c.pct, c.color));
  });

  // ── Right bottom: AI digest ────────────────────────────────────────────────
  ch.push(F(CX + lW + 12, contentY + 260, rW, 316, P.card, {
    r: 12, stroke: P.lime + '22',
    ch: [
      R(0, 0, 4, 316, P.lime, { r: 2 }),
      T('✦  AI WEEKLY DIGEST', 20, 16, rW - 40, 14, { size: 9, weight: 700, fill: P.lime, ls: 2 }),
      HLine(20, 38, rW - 40, P.lime + '20'),
    ],
  }));

  const aiItems = [
    { icon: '↑', color: P.lime,  text: 'Net income up 18% this week',      tag: 'STRONG'  },
    { icon: '⚠', color: P.amber, text: 'Travel spike: 42% of weekly budget', tag: 'ALERT'   },
    { icon: '✓', color: P.lime,  text: 'All software matched to invoices',  tag: 'CLEAN'   },
    { icon: '◎', color: P.blue2, text: 'Office on pace, no anomalies',      tag: 'STABLE'  },
    { icon: '↓', color: P.red2,  text: 'Office supplies trending up',       tag: 'WATCH'   },
  ];
  aiItems.forEach((item, i) => {
    const ay = contentY + 260 + 56 + i * 48;
    ch.push(Dot(CX + lW + 32, ay + 6, item.color, 8));
    ch.push(T(item.text, CX + lW + 48, ay + 2, rW - 104, 14, { size: 11, fill: P.fg }));
    ch.push(Pill(CX + lW + 12 + rW - 68, ay, item.tag, item.color + '18', item.color));
    if (i < aiItems.length - 1) ch.push(HLine(CX + lW + 32, ay + 28, rW - 56, P.border + '40'));
  });

  return F(sx, 0, DW, DH, P.bg, { clip: true, ch });
}

// ── D2: Expense Analytics ─────────────────────────────────────────────────────
function desktopAnalytics(sx) {
  const ch = [];
  ch.push(R(0, 0, DW, DH, P.bg));
  ch.push(...sidebar(4));

  const CX = DSide + DP;
  const CW = DW - CX - DP;

  ch.push(T('Expense Analytics', CX, 30, 420, 28, { size: 22, weight: 700, fill: P.fg }));
  ch.push(T('Detailed breakdown  ·  Q1 2026  ·  Jan–Mar', CX, 60, 380, 16, { size: 12, fill: P.fg3 }));

  // Period tabs
  const tabs = ['This Week', 'This Month', 'Q1 2026', 'YTD', 'Custom'];
  tabs.forEach((t, i) => {
    const active = t === 'Q1 2026';
    ch.push(F(CX + i * 112, 78, 104, 28, active ? P.lime3 + '28' : P.card, {
      r: 8, stroke: active ? P.lime : P.border,
      ch: [T(t, 0, 5, 104, 18, { size: 11, fill: active ? P.lime : P.fg3, align: 'center', weight: active ? 700 : 400 })],
    }));
  });

  ch.push(HLine(CX, 116, CW, P.border));

  // KPI strip (5)
  const kW = Math.floor((CW - 32) / 5);
  const q1 = [
    { label: 'TOTAL SPENT',  value: '$9,820',   delta: '+8% vs Q4',   up: false, color: P.red2  },
    { label: 'TOTAL INCOME', value: '$14,400',  delta: '+22% vs Q4',  up: true,  color: P.lime  },
    { label: 'NET SAVINGS',  value: '$4,580',   delta: '32% rate',    up: true,  color: P.lime  },
    { label: 'TOP CATEGORY', value: 'Software', delta: '$2,800 Q1',   up: null,  color: P.blue2 },
    { label: 'TRANSACTIONS', value: '247',      delta: '8.3/day avg', up: null,  color: P.fg2   },
  ];
  q1.forEach((k, i) => {
    ch.push(F(CX + i * (kW + 8), 126, kW, 74, P.card, {
      r: 10, stroke: P.border,
      ch: [
        T(k.label, 14, 12, kW - 28, 12, { size: 7.5, weight: 700, fill: P.fg3, ls: 2 }),
        T(k.value, 14, 28, kW - 28, 26, { size: 20, weight: 900, fill: k.color }),
        T(k.up === null ? k.delta : (k.up ? '↑ ' : '↓ ') + k.delta, 14, 56, kW - 28, 14, { size: 9, fill: k.up === null ? P.fg3 : k.up ? P.lime2 : P.red2 }),
      ],
    }));
  });

  const mcY = 212;

  // Main chart: grouped monthly bars
  const mcW = Math.round(CW * 0.55) - 12;
  const mcH = 240;

  ch.push(F(CX, mcY, mcW, mcH + 60, P.card, {
    r: 12, stroke: P.border,
    ch: [
      T('MONTHLY SPEND BY CATEGORY', 20, 16, mcW - 40, 14, { size: 9, weight: 700, fill: P.fg3, ls: 2 }),
      HLine(20, 36, mcW - 40),
    ],
  }));

  const catColors  = [P.lime, P.blue2, P.amber, P.red2, P.muted];
  const catLabels  = ['Marketing', 'Software', 'Travel', 'Dining', 'Office'];
  const monthNames = ['JAN', 'FEB', 'MAR'];
  const mData = [
    [0.60, 0.70, 0.50, 0.30, 0.60],
    [0.80, 0.75, 0.60, 0.40, 0.70],
    [0.75, 0.84, 0.68, 0.32, 1.00],
  ];
  const gW = Math.floor((mcW - 80) / 3);
  const cBW = Math.floor((gW - 20) / 5);

  mData.forEach((month, mi) => {
    const gx = CX + 44 + mi * gW;
    month.forEach((val, ci) => {
      const bH = Math.round(mcH * 0.78 * val);
      ch.push(R(gx + ci * (cBW + 2), mcY + 48 + mcH * 0.78 - bH, cBW, bH, catColors[ci], { r: 2, opacity: 0.75 + val * 0.25 }));
    });
    ch.push(HLine(gx, mcY + 48 + mcH * 0.78, gW - 8, P.border));
    ch.push(T(monthNames[mi], gx + (gW - 8) / 2 - 12, mcY + 48 + mcH * 0.78 + 8, 24, 12, { size: 9, weight: 700, fill: P.fg3, align: 'center' }));
  });

  // Legend row
  catColors.forEach((c, i) => {
    const lx = CX + 20 + i * (mcW / 5);
    ch.push(R(lx, mcY + mcH + 22, 8, 8, c, { r: 2 }));
    ch.push(T(catLabels[i], lx + 12, mcY + mcH + 20, 90, 14, { size: 9, fill: P.fg3 }));
  });

  // Right: Split + top merchants
  const rcX = CX + mcW + 12;
  const rcW = CW - mcW - 12;

  ch.push(F(rcX, mcY, rcW, 148, P.card, {
    r: 12, stroke: P.border,
    ch: [
      T('Q1 CATEGORY SPLIT', 20, 16, rcW - 40, 14, { size: 9, weight: 700, fill: P.fg3, ls: 2 }),
      HLine(20, 36, rcW - 40),
    ],
  }));
  const splits = [
    { label: 'Software', pct: 0.285, color: P.blue2 },
    { label: 'Marketing', pct: 0.255, color: P.lime  },
    { label: 'Travel',    pct: 0.225, color: P.amber },
    { label: 'Office',    pct: 0.145, color: P.muted },
    { label: 'Dining',    pct: 0.09,  color: P.red2  },
  ];
  splits.forEach((s, i) => {
    const sy = mcY + 46 + i * 20;
    ch.push(T(s.label, rcX + 20, sy, 100, 16, { size: 11, fill: P.fg }));
    ch.push(...ProgressBar(rcX + 110, sy + 4, rcW - 152, 5, s.pct, s.color));
    ch.push(T(Math.round(s.pct * 100) + '%', rcX + rcW - 16, sy, 0, 16, { size: 11, fill: s.color, weight: 700, align: 'right' }));
  });

  // Top merchants
  ch.push(F(rcX, mcY + 156, rcW, 116, P.card, {
    r: 12, stroke: P.border,
    ch: [
      T('TOP MERCHANTS', 20, 14, rcW - 40, 12, { size: 9, weight: 700, fill: P.fg3, ls: 2 }),
      HLine(20, 32, rcW - 40),
    ],
  }));
  const merchants = [
    { name: 'Adobe Creative',  amt: '$165', color: P.blue2 },
    { name: 'Figma Pro',        amt: '$135', color: P.blue2 },
    { name: 'United Airlines',  amt: '$680', color: P.amber },
    { name: 'Google Ads',       amt: '$420', color: P.lime  },
  ];
  merchants.forEach((m, i) => {
    const my2 = mcY + 156 + 40 + i * 20;
    ch.push(Dot(rcX + 20, my2 + 4, m.color, 6));
    ch.push(T(m.name, rcX + 32, my2, rcW - 84, 14, { size: 10, fill: P.fg }));
    ch.push(T(m.amt, rcX + rcW - 20, my2, 0, 14, { size: 11, fill: P.fg, weight: 700, align: 'right' }));
  });

  // Bottom transactions (full width table)
  const ttY = mcY + 288;
  const tableH = DH - ttY - DP;
  ch.push(F(CX, ttY, CW, tableH, P.card, {
    r: 12, stroke: P.border,
    ch: [
      T('TOP TRANSACTIONS — Q1 2026', 20, 16, 400, 14, { size: 9, weight: 700, fill: P.fg3, ls: 2 }),
      T('Sorted by amount', CW - 160, 16, 140, 14, { size: 10, fill: P.fg3, align: 'right' }),
      HLine(20, 36, CW - 40),
    ],
  }));

  const topTxs = [
    { merchant: 'Adobe Creative Cloud — Annual Renewal',    cat: 'SOFTWARE',  amt: '$659.88', date: 'Jan 15', color: P.blue2 },
    { merchant: 'United Airlines — JFK→LAX Round Trip',     cat: 'TRAVEL',    amt: '$680.00', date: 'Mar 14', color: P.amber },
    { merchant: 'Airbnb — NYC Conference Suite',            cat: 'TRAVEL',    amt: '$420.00', date: 'Feb 22', color: P.amber },
    { merchant: 'Google Ads — Q1 Campaign',                cat: 'MARKETING', amt: '$400.00', date: 'Jan 31', color: P.lime  },
    { merchant: 'Figma Organization Plan — Annual',         cat: 'SOFTWARE',  amt: '$396.00', date: 'Feb 01', color: P.blue2 },
    { merchant: 'WeWork Monthly Membership',               cat: 'OFFICE',    amt: '$350.00', date: 'Mar 01', color: P.muted },
  ];
  topTxs.forEach((tx, i) => {
    const ty = ttY + 46 + i * 38;
    ch.push(T(String(i + 1).padStart(2, '0'), CX + 20, ty + 9, 24, 16, { size: 11, fill: P.fg3, weight: 700 }));
    ch.push(T(tx.merchant, CX + 52, ty + 9, 520, 16, { size: 12, fill: P.fg, weight: 500 }));
    ch.push(Pill(CX + 580, ty + 9, tx.cat, tx.color + '18', tx.color));
    ch.push(T(tx.date, CX + CW - 152, ty + 9, 100, 16, { size: 11, fill: P.fg3 }));
    ch.push(T('-$' + tx.amt, CX + CW - 20, ty + 9, 0, 16, { size: 13, weight: 900, fill: P.red2, align: 'right' }));
    if (i < topTxs.length - 1) ch.push(HLine(CX + 20, ty + 34, CW - 40, P.border + '40'));
  });

  return F(sx, 0, DW, DH, P.bg, { clip: true, ch });
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSEMBLE .pen FILE
// ─────────────────────────────────────────────────────────────────────────────
const GAP = 40;

const m1 = mobileHome(0);
const m2 = mobileInsights(MW + GAP);
const m3 = mobileBudget((MW + GAP) * 2);
const m4 = mobileInvoice((MW + GAP) * 3);
const m5 = mobileAIReport((MW + GAP) * 4);

const desktopOffsetY = MH + GAP;
const d1 = desktopDashboard(0);
const d2 = desktopAnalytics(DW + GAP);

[d1, d2].forEach(s => { s.y = desktopOffsetY; });

const canvasW = Math.max((MW + GAP) * 5 - GAP, (DW + GAP) * 2 - GAP);
const canvasH = desktopOffsetY + DH;

const doc = {
  version: '2.8',
  title: 'SOLO — AI Expense Intelligence for Independents',
  width:  canvasW,
  height: canvasH,
  background: P.bg,
  children: [m1, m2, m3, m4, m5, d1, d2],
};

const outPath = path.join(__dirname, 'solo-app.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log('✓ Wrote', outPath);
console.log('  Screens:', doc.children.length, '(5 mobile + 2 desktop)');
console.log('  Canvas:', canvasW, '×', canvasH);

function countEl(n) {
  if (!n) return 0;
  let c = 1;
  if (n.children) n.children.forEach(k => { c += countEl(k); });
  return c;
}
const total = countEl(doc);
console.log('  Elements:', total);
