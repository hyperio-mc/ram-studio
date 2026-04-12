// gild-app.js
// GILD — wealth, observed.
//
// Challenge: Design a dark-mode personal wealth intelligence app where
// portfolio data is presented as editorial typography — large serif-scale
// numbers as the hero element, ambient sparklines as texture, minimal
// chrome, treating financial figures the way a luxury magazine treats
// a pull-quote.
//
// Inspired by:
// 1. Old Tom Capital (minimal.gallery, Apr 2026) — restrained editorial
//    finance aesthetic; type hierarchy doing heavy lifting; almost no
//    decorative chrome; monochromatic palette with strategic whitespace.
// 2. Phantom (Godly, Apr 2026) — dark crypto wallet; cinematic dark bg;
//    large hero number; sleek minimal nav; data as ambient texture.
// 3. KOMETA Typefaces (minimal.gallery, Apr 2026) — type foundry aesthetic
//    applied to UI; letter-spacing as design intent; typographic hierarchy
//    replacing visual chrome almost entirely.
//
// Innovation: Treating net worth / returns as editorial pull-quotes;
// sparklines rendered as ambient background texture (not chart-above-fold);
// gold accent used sparingly like a ruling line in print design;
// ledger-style transaction list with editorial dating conventions.
//
// Theme: DARK (herald was LIGHT → this run DARK)
// Screens: 5 mobile (390×844)

'use strict';
const fs   = require('fs');
const path = require('path');

// ── Palette ────────────────────────────────────────────────────────────────────
const BG      = '#0C0C0A';   // near-black, warm undertone
const S1      = '#141410';   // card surface
const S2      = '#1D1D19';   // elevated card
const S3      = '#242420';   // divider / subtle bg
const TEXT    = '#E8E4DC';   // warm off-white
const MUTED   = '#7A7870';   // warm muted
const MUTED2  = '#2A2A25';   // progress tracks / empty
const GOLD    = '#C9A96E';   // gold — wealth accent
const GOLD_D  = '#8A6E3A';   // darker gold for dimmed states
const SAGE    = '#5A8A6A';   // sage green — positive returns
const ROSE    = '#8A5050';   // muted rose — negative returns
const BORDER  = 'rgba(232,228,220,0.07)'; // ultra-subtle border

// ── Primitives ─────────────────────────────────────────────────────────────────
function R(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, width: w, height: h, fill,
    radius:  opts.radius  ?? 0,
    opacity: opts.opacity ?? 1,
    ...(opts.stroke ? { stroke: opts.stroke, strokeWidth: opts.sw ?? 1 } : {}),
  };
}
function T(x, y, text, opts = {}) {
  return {
    type: 'text', x, y, text: String(text),
    fontSize:   opts.size   ?? 13,
    fontWeight: opts.weight ?? 'regular',
    color:      opts.color  ?? TEXT,
    align:      opts.align  ?? 'left',
    opacity:    opts.opacity ?? 1,
    ...(opts.mono ? { fontFamily: 'monospace' } : {}),
    ...(opts.ls   ? { letterSpacing: opts.ls } : {}),
    ...(opts.italic ? { fontStyle: 'italic' } : {}),
  };
}
function C(x, y, r, fill, opts = {}) {
  return { type: 'circle', x, y, radius: r, fill, opacity: opts.opacity ?? 1 };
}
function L(x1, y1, x2, y2, color, opts = {}) {
  return { type: 'line', x1, y1, x2, y2, color, width: opts.w ?? 1, opacity: opts.opacity ?? 1 };
}

// ── Sparkline helper (ambient texture) ────────────────────────────────────────
function sparkline(els, x, y, w, h, data, color, opts = {}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step  = w / (data.length - 1);
  for (let i = 0; i < data.length - 1; i++) {
    const x1 = x + i * step;
    const y1 = y + h - ((data[i]  - min) / range) * h;
    const x2 = x + (i + 1) * step;
    const y2 = y + h - ((data[i+1] - min) / range) * h;
    els.push(L(x1, y1, x2, y2, color, { w: opts.w ?? 1, opacity: opts.opacity ?? 1 }));
  }
}

// ── Shared helpers ─────────────────────────────────────────────────────────────
const navH = 68;

function statusBar(els, W) {
  els.push(T(24, 18, '9:41', { size: 13, weight: 'semibold', color: TEXT }));
  els.push(T(W - 24, 18, '●●● ▲ 🔋', { size: 10, color: MUTED, align: 'right' }));
}

function goldRule(els, x, y, w) {
  // Editorial gold ruling line — the key design motif
  els.push(L(x, y, x + w, y, GOLD, { w: 0.75, opacity: 0.6 }));
}

function bottomNav(els, W, H, active) {
  els.push(R(0, H - navH, W, navH, S1, { stroke: BORDER, sw: 1 }));
  const items = [
    { icon: '◎', label: 'Portfolio' },
    { icon: '◰', label: 'Assets'    },
    { icon: '◈', label: 'Markets'   },
    { icon: '◇', label: 'Returns'   },
    { icon: '◻', label: 'Ledger'    },
  ];
  items.forEach((item, i) => {
    const nx = 39 + i * 78;
    const isActive = i === active;
    els.push(T(nx, H - navH + 14, item.icon, { size: 16, color: isActive ? GOLD : MUTED, align: 'center' }));
    els.push(T(nx, H - navH + 36, item.label, { size: 7.5, color: isActive ? GOLD : MUTED, align: 'center', ls: 0.5, weight: isActive ? 'semibold' : 'regular' }));
    if (isActive) els.push(R(nx - 14, H - navH, 28, 1.5, GOLD, { radius: 1 }));
  });
}

// ── Ambient sparkline texture (full-width, very faint) ────────────────────────
const AMBIENT_DATA = [
  100, 103, 101, 107, 104, 109, 108, 114, 112, 118, 115, 122, 119,
  124, 121, 128, 125, 131, 129, 135, 133, 138, 136, 141, 139, 145
];
const AMBIENT_DATA2 = [
  80, 83, 79, 86, 84, 88, 85, 91, 89, 94, 92, 97, 95,
  100, 98, 104, 101, 107, 105, 109, 106, 112, 110, 114, 113, 117
];

// ── SCREEN 1: Portfolio ────────────────────────────────────────────────────────
function screenPortfolio() {
  const W = 390, H = 844;
  const els = [];
  els.push(R(0, 0, W, H, BG));
  statusBar(els, W);

  // Ambient sparkline texture — very faint, decorative
  sparkline(els, 0, 280, W, 180, AMBIENT_DATA,  GOLD, { w: 0.5, opacity: 0.06 });
  sparkline(els, 0, 300, W, 180, AMBIENT_DATA2, GOLD, { w: 0.5, opacity: 0.04 });

  // Wordmark
  els.push(T(24, 56, 'GILD', { size: 18, weight: 'bold', ls: 5, color: GOLD }));
  els.push(T(24, 76, 'wealth, observed', { size: 10, color: MUTED, ls: 1.5 }));

  // Date / period toggle
  els.push(T(W - 24, 68, 'Apr 2026', { size: 11, color: MUTED, align: 'right' }));

  goldRule(els, 24, 94, W - 48);

  // Hero net worth — editorial pull-quote treatment
  els.push(T(24, 124, 'NET WORTH', { size: 8.5, weight: 'bold', color: MUTED, ls: 3.5 }));
  els.push(T(24, 182, '$847,240', { size: 56, weight: 'bold', color: TEXT }));
  els.push(T(24, 210, '.12', { size: 24, weight: 'regular', color: MUTED, opacity: 0.7 }));

  // Return badge
  els.push(R(24, 224, 120, 28, S2, { radius: 6, stroke: SAGE + '40', sw: 1 }));
  els.push(T(36, 232, '↑  +$14,820  (+1.78%)', { size: 10, color: SAGE, weight: 'semibold' }));
  els.push(T(W - 24, 230, '30-day', { size: 10, color: MUTED, align: 'right' }));

  goldRule(els, 24, 266, W - 48);

  // Allocation summary — type-driven, no pie chart
  els.push(T(24, 286, 'ALLOCATION', { size: 8.5, weight: 'bold', color: MUTED, ls: 3.5 }));

  const allocs = [
    { label: 'Equities',      pct: 62, value: '$525,289' },
    { label: 'Fixed Income',  pct: 18, value: '$152,503' },
    { label: 'Private Alts',  pct: 12, value: '$101,669' },
    { label: 'Cash & Other',  pct:  8, value: '$67,779'  },
  ];
  allocs.forEach((a, i) => {
    const ay = 310 + i * 52;
    els.push(T(24, ay, a.label, { size: 13, weight: 'semibold', color: TEXT }));
    els.push(T(W - 24, ay, a.value, { size: 13, weight: 'regular', color: MUTED, align: 'right' }));
    // Bar
    els.push(R(24, ay + 16, W - 48, 4, MUTED2, { radius: 2 }));
    els.push(R(24, ay + 16, (W - 48) * (a.pct / 100), 4, GOLD, { radius: 2, opacity: 0.7 }));
    // Pct
    els.push(T(24, ay + 26, `${a.pct}%`, { size: 9, color: MUTED, ls: 0.5 }));
  });

  goldRule(els, 24, 520, W - 48);

  // Quick stats row
  const stats = [
    { label: 'YTDRETURN', value: '+22.4%',  color: SAGE },
    { label: 'DIVIDEND',  value: '$2,140',  color: TEXT },
    { label: 'CASH FLOW', value: '+$810',   color: SAGE },
  ];
  stats.forEach((s, i) => {
    const sx = 24 + i * ((W - 48) / 3);
    els.push(T(sx + (W - 48) / 6, 538, s.label, { size: 7.5, color: MUTED, ls: 1.5, weight: 'bold', align: 'center' }));
    els.push(T(sx + (W - 48) / 6, 562, s.value, { size: 18, weight: 'bold', color: s.color, align: 'center' }));
  });

  // Sparkline chart (visible, portfolio curve)
  els.push(T(24, 594, 'PORTFOLIO CURVE', { size: 8.5, weight: 'bold', color: MUTED, ls: 3 }));
  const chartData = [720, 731, 728, 745, 739, 756, 762, 771, 768, 784, 779, 795, 801, 812, 808, 823, 830, 825, 838, 847];
  els.push(R(24, 608, W - 48, 80, S2, { radius: 8 }));
  sparkline(els, 30, 616, W - 60, 64, chartData, GOLD, { w: 1.5, opacity: 0.8 });

  // Axis labels
  els.push(T(30, 688, 'May \'25', { size: 8, color: MUTED, mono: true }));
  els.push(T(W - 30, 688, 'Apr \'26', { size: 8, color: MUTED, mono: true, align: 'right' }));

  els.push(T(30, 704, '+$127,240  (+17.7%) since inception', { size: 10, color: SAGE }));

  bottomNav(els, W, H, 0);
  return { name: 'Portfolio', width: W, height: H, elements: els };
}

// ── SCREEN 2: Assets ──────────────────────────────────────────────────────────
function screenAssets() {
  const W = 390, H = 844;
  const els = [];
  els.push(R(0, 0, W, H, BG));
  statusBar(els, W);

  sparkline(els, 0, 200, W, 160, AMBIENT_DATA, GOLD, { w: 0.5, opacity: 0.05 });

  els.push(T(24, 56, 'ASSETS', { size: 18, weight: 'bold', ls: 5, color: TEXT }));
  els.push(T(24, 76, '12 holdings across 4 classes', { size: 10, color: MUTED }));
  goldRule(els, 24, 94, W - 48);

  // Holdings list — editorial typographic treatment
  const holdings = [
    { ticker: 'AAPL',  name: 'Apple Inc.',         value: '$142,880', chg: '+2.3%',  pos: true,  weight: 16.9 },
    { ticker: 'MSFT',  name: 'Microsoft Corp.',    value: '$98,440',  chg: '+1.8%',  pos: true,  weight: 11.6 },
    { ticker: 'BRK.B', name: 'Berkshire Hathaway', value: '$87,220',  chg: '-0.4%',  pos: false, weight: 10.3 },
    { ticker: 'VTI',   name: 'Vanguard Total Mkt', value: '$76,540',  chg: '+0.9%',  pos: true,  weight: 9.0  },
    { ticker: 'AGG',   name: 'iShares Bond ETF',   value: '$64,300',  chg: '+0.2%',  pos: true,  weight: 7.6  },
    { ticker: 'SCHD',  name: 'Schwab Dividend',    value: '$55,780',  chg: '-0.1%',  pos: false, weight: 6.6  },
    { ticker: 'QQQ',   name: 'Invesco Nasdaq-100', value: '$49,120',  chg: '+3.1%',  pos: true,  weight: 5.8  },
  ];

  holdings.forEach((h, i) => {
    const hy = 110 + i * 80;
    // Row bg on hover / alternate
    if (i % 2 === 0) els.push(R(0, hy, W, 72, S2, { opacity: 0.35 }));
    // Gold ruling line between items
    if (i > 0) els.push(L(24, hy, W - 24, hy, BORDER, { w: 1 }));

    // Ticker — editorial weight
    els.push(T(24, hy + 16, h.ticker, { size: 15, weight: 'bold', color: GOLD, ls: 1.5 }));
    els.push(T(24, hy + 38, h.name,   { size: 10, color: MUTED }));

    // Weight bar
    els.push(R(24, hy + 54, (W - 48) * (h.weight / 20), 2, GOLD, { radius: 1, opacity: 0.35 }));
    els.push(T(24 + (W - 48) * (h.weight / 20) + 6, hy + 53, `${h.weight}%`, { size: 8, color: MUTED }));

    // Value + change
    els.push(T(W - 24, hy + 16, h.value, { size: 15, weight: 'semibold', align: 'right', color: TEXT }));
    els.push(T(W - 24, hy + 38, h.chg, {
      size: 11, weight: 'semibold', align: 'right',
      color: h.pos ? SAGE : ROSE,
    }));
  });

  // "View all" footer
  goldRule(els, 24, 676, W - 48);
  els.push(T(W / 2, 698, '+ 5 more holdings', { size: 12, color: GOLD, align: 'center', ls: 0.5 }));

  bottomNav(els, W, H, 1);
  return { name: 'Assets', width: W, height: H, elements: els };
}

// ── SCREEN 3: Markets ─────────────────────────────────────────────────────────
function screenMarkets() {
  const W = 390, H = 844;
  const els = [];
  els.push(R(0, 0, W, H, BG));
  statusBar(els, W);

  sparkline(els, 0, 250, W, 200, AMBIENT_DATA2, GOLD, { w: 0.5, opacity: 0.05 });

  els.push(T(24, 56, 'MARKETS', { size: 18, weight: 'bold', ls: 5, color: TEXT }));
  els.push(T(24, 76, 'Apr 4, 2026 · 9:41 AM EDT', { size: 10, color: MUTED, mono: true }));
  goldRule(els, 24, 94, W - 48);

  // Index overview — large editorial numbers
  const indices = [
    { name: 'S&P 500',    val: '5,842.30', chg: '+0.34%', pts: '+19.80', pos: true  },
    { name: 'NASDAQ',     val: '18,241.18',chg: '-0.12%', pts: '-21.60', pos: false },
    { name: 'DOW',        val: '43,108.42',chg: '+0.22%', pts: '+94.50', pos: true  },
  ];

  indices.forEach((idx, i) => {
    const iy = 110 + i * 74;
    els.push(R(24, iy, W - 48, 64, S2, { radius: 10, stroke: BORDER, sw: 1 }));
    els.push(T(38, iy + 14, idx.name, { size: 10, weight: 'bold', color: MUTED, ls: 2 }));
    els.push(T(38, iy + 40, idx.val, { size: 20, weight: 'bold', color: TEXT }));
    els.push(T(W - 36, iy + 14, idx.pts,  { size: 11, color: idx.pos ? SAGE : ROSE, align: 'right' }));
    els.push(T(W - 36, iy + 40, idx.chg, { size: 16, weight: 'semibold', color: idx.pos ? SAGE : ROSE, align: 'right' }));
    // Micro sparkline
    const sd = idx.pos
      ? [50,52,51,55,53,57,55,59,58,61,60,63]
      : [63,61,60,59,62,58,57,60,56,55,57,54];
    sparkline(els, 38, iy + 48, 120, 10, sd, idx.pos ? SAGE : ROSE, { w: 1, opacity: 0.5 });
  });

  goldRule(els, 24, 342, W - 48);

  // Top movers for my portfolio
  els.push(T(24, 358, 'YOUR MOVERS TODAY', { size: 8.5, weight: 'bold', color: MUTED, ls: 3 }));

  const movers = [
    { ticker: 'QQQ',  name: 'Invesco Nasdaq-100', chg: '+3.1%', impact: '+$1,524', pos: true  },
    { ticker: 'AAPL', name: 'Apple Inc.',          chg: '+2.3%', impact: '+$3,286', pos: true  },
    { ticker: 'MSFT', name: 'Microsoft Corp.',     chg: '+1.8%', impact: '+$1,772', pos: true  },
    { ticker: 'SCHD', name: 'Schwab Dividend',     chg: '-0.1%', impact: '-$55',    pos: false },
    { ticker: 'BRK.B',name: 'Berkshire Hathaway',  chg: '-0.4%', impact: '-$349',   pos: false },
  ];

  movers.forEach((m, i) => {
    const my = 378 + i * 66;
    if (i > 0) els.push(L(24, my, W - 24, my, BORDER, { w: 1 }));
    els.push(T(24, my + 12, m.ticker, { size: 14, weight: 'bold', color: GOLD, ls: 1 }));
    els.push(T(24, my + 32, m.name, { size: 10, color: MUTED }));
    els.push(T(W - 24, my + 12, m.impact, { size: 13, weight: 'semibold', align: 'right', color: m.pos ? SAGE : ROSE }));
    els.push(T(W - 24, my + 32, m.chg, { size: 11, align: 'right', color: m.pos ? SAGE : ROSE }));
  });

  // Today's P&L summary
  goldRule(els, 24, 712, W - 48);
  els.push(T(24, 728, "TODAY'S P&L", { size: 8.5, weight: 'bold', color: MUTED, ls: 3 }));
  els.push(T(W - 24, 728, '+$6,178  (+0.73%)', { size: 13, weight: 'semibold', color: SAGE, align: 'right' }));

  bottomNav(els, W, H, 2);
  return { name: 'Markets', width: W, height: H, elements: els };
}

// ── SCREEN 4: Returns ─────────────────────────────────────────────────────────
function screenReturns() {
  const W = 390, H = 844;
  const els = [];
  els.push(R(0, 0, W, H, BG));
  statusBar(els, W);

  sparkline(els, 0, 300, W, 150, AMBIENT_DATA, GOLD, { w: 0.5, opacity: 0.04 });

  els.push(T(24, 56, 'RETURNS', { size: 18, weight: 'bold', ls: 5, color: TEXT }));
  els.push(T(24, 76, 'Performance attribution', { size: 10, color: MUTED }));
  goldRule(els, 24, 94, W - 48);

  // Period selector
  const periods = ['1M', '3M', 'YTD', '1Y', '3Y', 'ALL'];
  periods.forEach((p, i) => {
    const px = 24 + i * 58;
    const active = p === '1Y';
    els.push(R(px, 104, 44, 24, active ? S2 : 'transparent', { radius: 12, stroke: active ? GOLD + '60' : 'transparent', sw: 1 }));
    els.push(T(px + 22, 110, p, { size: 10, weight: active ? 'bold' : 'regular', color: active ? GOLD : MUTED, align: 'center', ls: 0.5 }));
  });

  // Hero return — editorial
  els.push(T(24, 158, '1-YEAR RETURN', { size: 8.5, weight: 'bold', color: MUTED, ls: 3.5 }));
  els.push(T(24, 210, '+22.4%', { size: 60, weight: 'bold', color: SAGE }));
  els.push(T(24, 240, 'vs S&P 500 +18.2% · outperforming by 4.2%', { size: 10, color: MUTED }));

  goldRule(els, 24, 260, W - 48);

  // Benchmark comparison bars — horizontal, editorial
  els.push(T(24, 278, 'BENCHMARK COMPARISON', { size: 8.5, weight: 'bold', color: MUTED, ls: 3 }));

  const benchmarks = [
    { label: 'Your Portfolio', pct: 22.4, color: GOLD   },
    { label: 'S&P 500',        pct: 18.2, color: MUTED  },
    { label: 'NASDAQ 100',     pct: 26.1, color: MUTED  },
    { label: 'Bonds (AGG)',    pct:  4.8, color: MUTED  },
  ];
  const maxPct = 30;
  benchmarks.forEach((b, i) => {
    const by = 298 + i * 44;
    const barW = (W - 120) * (b.pct / maxPct);
    els.push(T(24, by + 6, b.label, { size: 10, color: b.color, weight: b.color === GOLD ? 'semibold' : 'regular' }));
    els.push(R(24, by + 22, W - 120, 6, MUTED2, { radius: 3 }));
    els.push(R(24, by + 22, barW, 6, b.color, { radius: 3, opacity: b.color === GOLD ? 0.85 : 0.35 }));
    els.push(T(W - 88, by + 6, `+${b.pct}%`, { size: 11, weight: 'semibold', color: b.color, align: 'right' }));
  });

  goldRule(els, 24, 482, W - 48);

  // Attribution breakdown
  els.push(T(24, 500, 'RETURN ATTRIBUTION', { size: 8.5, weight: 'bold', color: MUTED, ls: 3 }));

  const attrs = [
    { label: 'Capital Appreciation', val: '+18.6%', note: 'Growth in holdings' },
    { label: 'Dividend Income',       val: '+2.8%',  note: 'Yield on cost 3.1%' },
    { label: 'Rebalancing Alpha',     val: '+1.0%',  note: '3 rebalances YTD'  },
  ];
  attrs.forEach((a, i) => {
    const ay = 520 + i * 60;
    els.push(T(24, ay, a.label, { size: 12, weight: 'semibold', color: TEXT }));
    els.push(T(24, ay + 20, a.note, { size: 10, color: MUTED }));
    els.push(T(W - 24, ay + 6, a.val, { size: 16, weight: 'bold', color: SAGE, align: 'right' }));
    if (i < attrs.length - 1) els.push(L(24, ay + 46, W - 24, ay + 46, BORDER, { w: 1 }));
  });

  goldRule(els, 24, 706, W - 48);
  els.push(T(24, 724, 'Risk-adjusted (Sharpe 1.42)', { size: 10, color: MUTED }));
  els.push(T(W - 24, 724, 'Max Drawdown -6.8%', { size: 10, color: MUTED, align: 'right' }));

  bottomNav(els, W, H, 3);
  return { name: 'Returns', width: W, height: H, elements: els };
}

// ── SCREEN 5: Ledger ──────────────────────────────────────────────────────────
function screenLedger() {
  const W = 390, H = 844;
  const els = [];
  els.push(R(0, 0, W, H, BG));
  statusBar(els, W);

  els.push(T(24, 56, 'LEDGER', { size: 18, weight: 'bold', ls: 5, color: TEXT }));
  els.push(T(24, 76, 'Transaction history', { size: 10, color: MUTED }));
  goldRule(els, 24, 94, W - 48);

  // Filter chips
  const chips = ['All', 'Buys', 'Sells', 'Dividends', 'Cash'];
  let cx = 24;
  chips.forEach((chip, i) => {
    const active = i === 0;
    const cw = chip.length * 8 + 20;
    els.push(R(cx, 104, cw, 24, active ? S2 : 'transparent', { radius: 12, stroke: active ? GOLD + '60' : BORDER, sw: 1 }));
    els.push(T(cx + cw / 2, 110, chip, { size: 10, color: active ? GOLD : MUTED, weight: active ? 'semibold' : 'regular', align: 'center' }));
    cx += cw + 8;
  });

  // Ledger entries — editorial dating style (month as chapter heading)
  const transactions = [
    { date: 'APR 3', day: 'Thu', type: 'DIV',  ticker: 'SCHD',  desc: 'Dividend reinvested',     amount: '+$142.80',  pos: true  },
    { date: 'APR 1', day: 'Tue', type: 'BUY',  ticker: 'VTI',   desc: '4 shares @ $242.50',      amount: '-$970.00',  pos: false },
    { date: 'MAR 28',day: 'Fri', type: 'DIV',  ticker: 'AGG',   desc: 'Bond interest',            amount: '+$88.40',   pos: true  },
    { date: 'MAR 25',day: 'Tue', type: 'SELL', ticker: 'BRK.B', desc: '2 shares @ $448.20',      amount: '+$896.40',  pos: true  },
    { date: 'MAR 22',day: 'Sat', type: 'BUY',  ticker: 'AAPL',  desc: '3 shares @ $172.90',      amount: '-$518.70',  pos: false },
    { date: 'MAR 18',day: 'Tue', type: 'BUY',  ticker: 'MSFT',  desc: '2 shares @ $409.60',      amount: '-$819.20',  pos: false },
    { date: 'MAR 15',day: 'Sat', type: 'DIV',  ticker: 'VTI',   desc: 'Quarterly distribution',  amount: '+$210.50',  pos: true  },
    { date: 'MAR 10',day: 'Mon', type: 'BUY',  ticker: 'QQQ',   desc: '1 share @ $476.40',       amount: '-$476.40',  pos: false },
  ];

  // April header
  els.push(T(24, 142, 'APRIL 2026', { size: 8.5, weight: 'bold', color: GOLD, ls: 3, mono: true }));
  els.push(L(24, 154, W - 24, 154, GOLD, { w: 0.5, opacity: 0.3 }));

  let ty = 162;
  transactions.forEach((t, i) => {
    // Month divider
    if (i === 2) {
      ty += 8;
      els.push(T(24, ty, 'MARCH 2026', { size: 8.5, weight: 'bold', color: MUTED, ls: 3, mono: true }));
      els.push(L(24, ty + 12, W - 24, ty + 12, BORDER, { w: 1 }));
      ty += 22;
    }

    const rowH = 62;
    if (i > 0 && i !== 2) els.push(L(24, ty, W - 24, ty, BORDER, { w: 1 }));

    // Type badge
    const typeColor = t.type === 'DIV' ? GOLD : t.type === 'BUY' ? TEXT : SAGE;
    els.push(R(24, ty + 10, 36, 16, S2, { radius: 4 }));
    els.push(T(42, ty + 12, t.type, { size: 8, weight: 'bold', color: typeColor, ls: 0.5, align: 'center' }));

    // Date — editorial
    els.push(T(70, ty + 10, t.date, { size: 12, weight: 'semibold', color: TEXT, mono: true }));
    els.push(T(70, ty + 28, t.day, { size: 9, color: MUTED }));

    // Description
    els.push(T(128, ty + 10, t.ticker, { size: 13, weight: 'bold', color: GOLD, ls: 1 }));
    els.push(T(128, ty + 28, t.desc, { size: 10, color: MUTED }));

    // Amount
    els.push(T(W - 24, ty + 16, t.amount, { size: 14, weight: 'semibold', color: t.pos ? SAGE : TEXT, align: 'right' }));

    ty += rowH;
  });

  bottomNav(els, W, H, 4);
  return { name: 'Ledger', width: W, height: H, elements: els };
}

// ── BUILD ──────────────────────────────────────────────────────────────────────
const screens = [
  screenPortfolio(),
  screenAssets(),
  screenMarkets(),
  screenReturns(),
  screenLedger(),
];

const pen = {
  version: '2.8',
  name:    'GILD — wealth, observed.',
  screens,
};

fs.writeFileSync(path.join(__dirname, 'gild.pen'), JSON.stringify(pen, null, 2));
console.log('✓ gild.pen written —', screens.length, 'screens');
