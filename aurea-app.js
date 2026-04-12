'use strict';
// aurea-app.js
// AUREA — Personal Wealth Intelligence, Editorial Clarity
//
// Challenge: Design a personal finance / portfolio tracker in a WSJ/newspaper
// editorial aesthetic — warm cream background, serif-weight display numbers,
// brick-red + forest-green accent system, hairline dividers, uppercase spaced
// editorial labels.
//
// Directly inspired by:
// 1. ISA De Burgh (minimal.gallery) — editorial stacked typography on off-white,
//    portrait + typography as the only two elements, strong vertical rhythm.
// 2. Old Tom Capital (minimal.gallery) — "Golf's Institutional Platform" —
//    institutional clean, prestige serif typography on pure white, understated.
// 3. Cardless (land-book.com) — "The credit platform built for flexibility and
//    control" — financial SaaS with editorial section breaks, clean light UI.
//
// Theme: LIGHT · Palette: warm newsprint cream + brick red + forest green
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#F4F0E6',   // warm newsprint cream
  surface:  '#FEFCF8',   // near white card
  surface2: '#EDE9DE',   // slightly darker cream for nested
  border:   'rgba(18,14,7,0.10)',
  borderMid:'rgba(18,14,7,0.16)',
  fg:       '#120E07',   // warm near-black
  fg2:      '#4A3F30',   // mid-tone brown
  muted:    'rgba(18,14,7,0.38)',
  accent:   '#B8400E',   // brick red — editorial headline
  accentDim:'rgba(184,64,14,0.10)',
  green:    '#2D6B4E',   // forest green — gains
  greenDim: 'rgba(45,107,78,0.12)',
  red:      '#B8400E',   // losses = brick red
  gold:     '#A8822A',   // tertiary gold
  goldDim:  'rgba(168,130,42,0.12)',
};

let _id = 0;
const uid = () => `a${++_id}`;

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
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Line  = (x, y, w, fill = P.border) => F(x, y, w, 1, fill);
const VLine = (x, y, h, fill = P.border) => F(x, y, 1, h, fill);

// ── Label style (editorial caption) ──────────────────────────────────────────
const Label = (text, x, y, w, opts = {}) =>
  T(text.toUpperCase(), x, y, w, 16, {
    size: opts.size || 9, weight: 600, fill: P.muted, ls: 1.2, ...opts,
  });

// ── Status pill ───────────────────────────────────────────────────────────────
const Pill = (text, x, y, color, bg, r = 4) => {
  const w = text.length * 6.5 + 16;
  return F(x, y, w, 20, bg, { r, ch: [
    T(text, 8, 3, w - 16, 14, { size: 10, weight: 700, fill: color }),
  ]});
};

// ── Hairline row divider ──────────────────────────────────────────────────────
const Divider = (x, y, w) => Line(x, y, w, P.border);

// ── Status bar ────────────────────────────────────────────────────────────────
const StatusBar = (ox, oy) => F(ox, oy, 390, 44, P.bg, { ch: [
  T('9:41', 14, 13, 60, 18, { size: 13, weight: 600, fill: P.fg }),
  T('▶ ⣿⣿⣿⣿', 310, 13, 70, 18, { size: 11, fill: P.muted, align: 'right' }),
]});

// ── Bottom nav ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: '◈', label: 'Overview' },
  { icon: '⊞', label: 'Portfolio' },
  { icon: '↕', label: 'Activity' },
  { icon: '⌖', label: 'Insights' },
  { icon: '◎', label: 'Goals' },
];

const BottomNav = (ox, oy, activeIdx) => {
  const ch = [];
  // Background
  ch.push(F(0, 0, 390, 82, P.surface, {
    stroke: P.border, sw: 1,
    ch: [Line(0, 0, 390, P.borderMid)],
  }));
  NAV_ITEMS.forEach((item, i) => {
    const nx = 12 + i * 74;
    const isActive = i === activeIdx;
    const col = isActive ? P.accent : P.muted;
    // Icon bg pill for active
    if (isActive) {
      ch.push(F(nx + 14, 8, 44, 26, P.accentDim, { r: 13 }));
    }
    ch.push(T(item.icon, nx + 18, 12, 36, 18, { size: 17, fill: col, align: 'center' }));
    ch.push(T(item.label, nx, 34, 72, 13, { size: 9, weight: isActive ? 700 : 400, fill: col, align: 'center', ls: 0.3 }));
  });
  return F(ox, oy, 390, 82, 'transparent', { clip: false, ch });
};

// ── Donut segment helper (arc approximation via overlapping elipses) ───────────
const DonutRing = (cx, cy, r, thick, segments) => {
  // Just use colored arcs approximated as thick rectangles for pen format
  // We'll use a series of filled ellipses masked by white center
  const items = [];
  segments.forEach(seg => {
    // Approximate segment with a colored ellipse sliver — use small wedge frames
    items.push(E(cx - r, cy - r, r*2, r*2, seg.color, { opacity: seg.pct / 100 * 0.9 + 0.1 }));
  });
  // White center punch
  items.push(E(cx - r + thick, cy - r + thick, (r - thick)*2, (r - thick)*2, P.surface));
  return items;
};

// ── Screen helpers ────────────────────────────────────────────────────────────
const SW = 390, SH = 844, GAP = 80;
const sx = i => 80 + i * (SW + GAP);

// ── SCREEN 0: Overview ────────────────────────────────────────────────────────
function buildOverview(ox) {
  const ch = [];
  ch.push(StatusBar(0, 0));

  // ── Nav header
  ch.push(T('AUREA', 20, 50, 120, 22, { size: 14, weight: 800, fill: P.fg, ls: 3 }));
  ch.push(T('Mar 2026', 240, 52, 130, 18, { size: 11, fill: P.muted, align: 'right' }));
  ch.push(Divider(20, 76, 350));

  // ── Hero net worth block (editorial display number)
  ch.push(Label('Total Net Worth', 20, 92, 200));
  ch.push(T('$284,710', 20, 110, 350, 52, { size: 44, weight: 800, fill: P.fg, ls: -1.5 }));
  // Day change chip
  ch.push(F(20, 166, 90, 22, P.greenDim, { r: 3, ch: [
    T('▲ +$1,204', 8, 4, 74, 14, { size: 10, weight: 700, fill: P.green }),
  ]}));
  ch.push(T('+0.43% today', 118, 168, 120, 16, { size: 11, fill: P.muted }));
  ch.push(Divider(20, 194, 350));

  // ── Key metrics row
  ch.push(Label('Breakdown', 20, 204, 200));
  const metrics = [
    { label: 'Investments', val: '$198.4K', chg: '+2.1%', pos: true },
    { label: 'Cash', val: '$54.2K', chg: '—', pos: null },
    { label: 'Real Estate', val: '$32.1K', chg: '+0.8%', pos: true },
  ];
  metrics.forEach((m, i) => {
    const mx = 20 + i * 118;
    if (i > 0) ch.push(VLine(mx - 4, 218, 52, P.border));
    ch.push(T(m.val, mx, 218, 112, 20, { size: 15, weight: 700, fill: P.fg }));
    ch.push(T(m.label, mx, 240, 112, 14, { size: 10, fill: P.muted }));
    if (m.chg !== '—') {
      ch.push(T(m.chg, mx, 256, 80, 12, { size: 10, weight: 600, fill: m.pos ? P.green : P.red }));
    }
  });
  ch.push(Divider(20, 276, 350));

  // ── Top holdings preview (editorial list)
  ch.push(Label('Top Holdings', 20, 284, 200));
  const holdings = [
    { ticker: 'AAPL', name: 'Apple Inc.',        alloc: '22%', chg: '+1.2%', pos: true  },
    { ticker: 'BTC',  name: 'Bitcoin',            alloc: '18%', chg: '+3.4%', pos: true  },
    { ticker: 'VOO',  name: 'Vanguard S&P 500',   alloc: '15%', chg: '+0.6%', pos: true  },
    { ticker: 'AMZN', name: 'Amazon.com',          alloc: '11%', chg: '-0.8%', pos: false },
  ];
  holdings.forEach((h, i) => {
    const hy = 300 + i * 58;
    // Ticker circle
    ch.push(E(20, hy + 4, 36, 36, h.pos ? P.greenDim : P.accentDim));
    ch.push(T(h.ticker, 20, hy + 10, 36, 22, { size: 9, weight: 800, fill: h.pos ? P.green : P.accent, align: 'center', ls: 0.3 }));
    // Name + allocation
    ch.push(T(h.name, 64, hy + 4, 180, 16, { size: 13, weight: 600, fill: P.fg }));
    ch.push(T(h.alloc + ' of portfolio', 64, hy + 22, 180, 14, { size: 10, fill: P.muted }));
    // Change
    ch.push(T(h.chg, 280, hy + 10, 70, 18, { size: 13, weight: 700, fill: h.pos ? P.green : P.red, align: 'right' }));
    if (i < holdings.length - 1) ch.push(Divider(64, hy + 48, 306));
  });

  // ── Pulse bar (tiny sparkline-like) ──
  ch.push(Divider(20, 534, 350));
  ch.push(Label('30-Day Trend', 20, 542, 200));
  const sparkH = [42, 45, 41, 44, 43, 46, 48, 47, 50, 49, 52, 51, 53, 54, 52, 55, 57, 56, 58, 59, 61, 60, 62, 64, 63, 65, 64, 66, 67, 68];
  const sparkW = 350 / sparkH.length;
  sparkH.forEach((v, i) => {
    const barH = Math.round((v - 40) * 3.5);
    const col = i === sparkH.length - 1 ? P.accent : (i > sparkH.length * 0.7 ? P.green : P.border + '60');
    ch.push(F(20 + i * sparkW, 600 - barH, Math.max(sparkW - 1, 6), barH, i > sparkH.length * 0.6 ? P.green : P.surface2, { r: 1, opacity: 0.7 + i/sparkH.length*0.3 }));
  });
  ch.push(T('+6.2% this period', 20, 608, 200, 14, { size: 10, fill: P.green, weight: 600 }));
  ch.push(T('Mar 1 – Mar 28', 250, 608, 120, 14, { size: 10, fill: P.muted, align: 'right' }));

  // ── Recent activity teaser
  ch.push(Divider(20, 628, 350));
  ch.push(Label('Recent Activity', 20, 636, 200));
  ch.push(T('View all →', 290, 636, 80, 16, { size: 10, fill: P.accent, weight: 600, align: 'right' }));
  const recents = [
    { type: 'BUY',  desc: 'Apple Inc.',    amt: '+25 shares', date: 'Mar 27' },
    { type: 'DIVD', desc: 'Vanguard VOO',  amt: '+$84.20',    date: 'Mar 25' },
  ];
  recents.forEach((r, i) => {
    const ry = 652 + i * 44;
    const isGreen = r.type === 'DIVD';
    ch.push(Pill(r.type, 20, ry, isGreen ? P.green : P.fg2, isGreen ? P.greenDim : P.surface2));
    ch.push(T(r.desc, 70, ry + 1, 170, 16, { size: 12, weight: 600, fill: P.fg }));
    ch.push(T(r.date, 240, ry + 1, 50, 14, { size: 10, fill: P.muted, align: 'right' }));
    ch.push(T(r.amt, 20, ry + 20, 120, 14, { size: 11, fill: isGreen ? P.green : P.fg2, weight: 500 }));
  });

  ch.push(BottomNav(0, 762, 0));
  return F(ox, 0, SW, SH, P.bg, { clip: true, ch });
}

// ── SCREEN 1: Portfolio ───────────────────────────────────────────────────────
function buildPortfolio(ox) {
  const ch = [];
  ch.push(StatusBar(0, 0));

  ch.push(T('Portfolio', 20, 50, 200, 26, { size: 20, weight: 800, fill: P.fg }));
  ch.push(T('12 positions', 20, 78, 200, 16, { size: 12, fill: P.muted }));
  ch.push(Divider(20, 98, 350));

  // Category filter tabs
  const tabs = ['All', 'Stocks', 'Crypto', 'ETFs', 'Cash'];
  tabs.forEach((tab, i) => {
    const tx = 20 + i * 68;
    const isActive = i === 0;
    ch.push(F(tx, 106, 60, 24, isActive ? P.fg : 'transparent', { r: 12, ch: [
      T(tab, 0, 4, 60, 16, { size: 10, weight: isActive ? 700 : 400, fill: isActive ? P.surface : P.muted, align: 'center' }),
    ]}));
  });
  ch.push(Divider(20, 134, 350));

  // Holdings list (editorial row format)
  const allHoldings = [
    { ticker: 'AAPL', name: 'Apple Inc.',         val: '$56,230', alloc: 0.22, day: '+1.2%',  total: '+18.4%', pos: true  },
    { ticker: 'BTC',  name: 'Bitcoin',             val: '$51,180', alloc: 0.18, day: '+3.4%',  total: '+84.2%', pos: true  },
    { ticker: 'VOO',  name: 'Vanguard S&P 500',    val: '$42,810', alloc: 0.15, day: '+0.6%',  total: '+24.1%', pos: true  },
    { ticker: 'AMZN', name: 'Amazon.com',           val: '$31,350', alloc: 0.11, day: '-0.8%',  total: '+9.3%',  pos: false },
    { ticker: 'MSFT', name: 'Microsoft Corp.',      val: '$28,480', alloc: 0.10, day: '+0.4%',  total: '+22.7%', pos: true  },
    { ticker: 'CASH', name: 'Cash & Equivalents',   val: '$54,200', alloc: 0.19, day: '—',     total: '—',      pos: null  },
  ];
  allHoldings.forEach((h, i) => {
    const hy = 144 + i * 82;
    // Allocation bar
    ch.push(F(20, hy, 350, 70, P.surface, { r: 4, stroke: P.border, sw: 1, ch: [
      // Left color bar
      F(0, 0, 4, 70, h.pos === true ? P.green : h.pos === false ? P.accent : P.gold, { r: 4 }),
      // Ticker
      T(h.ticker, 16, 10, 50, 18, { size: 12, weight: 800, fill: P.fg, ls: 0.5 }),
      // Name
      T(h.name, 16, 30, 170, 15, { size: 11, fill: P.muted }),
      // Allocation pct
      T(Math.round(h.alloc * 100) + '%', 16, 48, 40, 14, { size: 10, weight: 600, fill: P.fg2 }),
      // Value
      T(h.val, 200, 10, 140, 18, { size: 14, weight: 700, fill: P.fg, align: 'right' }),
      // Day change
      T(h.day, 200, 32, 140, 14, { size: 11, weight: 600, fill: h.pos === true ? P.green : h.pos === false ? P.red : P.muted, align: 'right' }),
      // Total return
      T('Total: ' + h.total, 200, 50, 140, 12, { size: 9, fill: P.muted, align: 'right' }),
      // Alloc bar bg
      F(16, 64, 160, 3, P.surface2, { r: 2 }),
      // Alloc bar fill
      F(16, 64, Math.round(160 * h.alloc), 3, h.pos === true ? P.green : h.pos === false ? P.accent : P.gold, { r: 2 }),
    ]}));
  });

  ch.push(BottomNav(0, 762, 1));
  return F(ox, 0, SW, SH, P.bg, { clip: true, ch });
}

// ── SCREEN 2: Activity ────────────────────────────────────────────────────────
function buildActivity(ox) {
  const ch = [];
  ch.push(StatusBar(0, 0));

  ch.push(T('Activity', 20, 50, 200, 26, { size: 20, weight: 800, fill: P.fg }));
  ch.push(Divider(20, 80, 350));

  // Month group header
  const drawMonth = (label, y) => {
    ch.push(F(20, y, 350, 22, P.surface2, { r: 3, ch: [
      T(label, 12, 3, 200, 16, { size: 10, weight: 700, fill: P.fg2, ls: 0.5 }),
    ]}));
  };

  const txns = [
    { group: 'MARCH 2026', items: [
      { type: 'BUY',  icon: '+', ticker: 'AAPL', desc: 'Apple Inc.',        detail: '25 shares @ $224.88',  amt: '-$5,622', pos: false },
      { type: 'DIVD', icon: '↓', ticker: 'VOO',  desc: 'Dividend',          detail: 'Vanguard S&P 500 ETF', amt: '+$84.20', pos: true  },
      { type: 'SELL', icon: '-', ticker: 'AMZN', desc: 'Amazon.com',         detail: '5 shares @ $192.40',  amt: '+$962',   pos: true  },
      { type: 'BUY',  icon: '+', ticker: 'BTC',  desc: 'Bitcoin',            detail: '0.12 BTC @ $87,200',  amt: '-$10,464', pos: false },
    ]},
    { group: 'FEBRUARY 2026', items: [
      { type: 'DIVD', icon: '↓', ticker: 'AAPL', desc: 'Dividend',           detail: 'Apple Inc.',           amt: '+$22.40', pos: true  },
      { type: 'BUY',  icon: '+', ticker: 'MSFT', desc: 'Microsoft Corp.',    detail: '10 shares @ $414.20',  amt: '-$4,142', pos: false },
      { type: 'DEP',  icon: '→', ticker: 'CASH', desc: 'Deposit',            detail: 'Bank transfer',        amt: '+$2,500', pos: true  },
    ]},
  ];

  let ycur = 88;
  txns.forEach(grp => {
    drawMonth(grp.group, ycur);
    ycur += 28;
    grp.items.forEach((t, i) => {
      // Row card
      const rowColor = t.type === 'DIVD' || t.type === 'DEP' || t.type === 'SELL' ? P.green : P.accent;
      const rowBg = t.type === 'DIVD' || t.type === 'DEP' || t.type === 'SELL' ? P.greenDim : P.accentDim;
      ch.push(F(20, ycur, 350, 56, P.surface, { r: 3, ch: [
        // Left accent bar
        F(0, 0, 3, 56, rowColor, { r: 2 }),
        // Type pill
        F(12, 14, 34, 18, rowBg, { r: 3, ch: [
          T(t.type, 2, 2, 30, 14, { size: 8, weight: 800, fill: rowColor, align: 'center', ls: 0.3 }),
        ]}),
        // Ticker
        T(t.ticker, 54, 10, 50, 16, { size: 12, weight: 800, fill: P.fg }),
        T(t.desc, 54, 28, 160, 14, { size: 10, fill: P.muted }),
        T(t.detail, 54, 42, 200, 12, { size: 9, fill: P.muted, opacity: 0.7 }),
        // Amount
        T(t.amt, 260, 18, 82, 18, { size: 14, weight: 700, fill: t.pos ? P.green : P.red, align: 'right' }),
      ]}));
      ycur += 62;
    });
    ycur += 4;
  });

  ch.push(BottomNav(0, 762, 2));
  return F(ox, 0, SW, SH, P.bg, { clip: true, ch });
}

// ── SCREEN 3: Insights ────────────────────────────────────────────────────────
function buildInsights(ox) {
  const ch = [];
  ch.push(StatusBar(0, 0));

  ch.push(T('Insights', 20, 50, 200, 26, { size: 20, weight: 800, fill: P.fg }));
  ch.push(T('Portfolio intelligence', 20, 78, 250, 16, { size: 12, fill: P.muted }));
  ch.push(Divider(20, 98, 350));

  // ── Allocation donut (editorial style)
  ch.push(Label('Asset Allocation', 20, 108, 200));
  // Simplified donut via layered ellipses
  const segments = [
    { label: 'Stocks',      pct: 43, color: P.fg      },
    { label: 'Crypto',      pct: 18, color: P.accent   },
    { label: 'ETFs',        pct: 15, color: P.green     },
    { label: 'Cash',        pct: 19, color: P.gold      },
    { label: 'Real Estate', pct: 5,  color: P.fg2       },
  ];
  // Draw editorial donut as layered rings
  const cx = 195, cy = 210, outerR = 72, innerR = 44;
  // Background ring
  ch.push(E(cx - outerR, cy - outerR, outerR*2, outerR*2, P.surface2, { stroke: P.border, sw: 1 }));
  ch.push(E(cx - innerR, cy - innerR, innerR*2, innerR*2, P.surface));
  // Segments approximated as colored wedge overlays
  let cumAngle = -Math.PI / 2;
  segments.forEach((seg, si) => {
    const angle = (seg.pct / 100) * Math.PI * 2;
    // Use a semi-transparent colored rect rotated approximation
    // For pen format, use overlapping ellipse opacity
    ch.push(E(cx - outerR + si * 2, cy - outerR + si * 2, (outerR - si)*2, (outerR - si)*2, seg.color, { opacity: 0.12 + si * 0.03 }));
    cumAngle += angle;
  });
  ch.push(E(cx - innerR, cy - innerR, innerR*2, innerR*2, P.surface)); // punch hole
  // Center label
  ch.push(T('100%', cx - 28, cy - 14, 56, 28, { size: 20, weight: 800, fill: P.fg, align: 'center' }));
  ch.push(T('Allocated', cx - 30, cy + 8, 60, 14, { size: 9, fill: P.muted, align: 'center' }));

  // Legend
  const legendY = 290;
  segments.forEach((seg, i) => {
    const lx = i % 2 === 0 ? 20 : 200;
    const ly = legendY + Math.floor(i / 2) * 28;
    ch.push(F(lx, ly, 8, 8, seg.color, { r: 2 }));
    ch.push(T(seg.label, lx + 14, ly - 1, 120, 14, { size: 11, fill: P.fg }));
    ch.push(T(seg.pct + '%', lx + 14, ly + 13, 120, 12, { size: 10, weight: 600, fill: P.fg2 }));
  });
  ch.push(Divider(20, 374, 350));

  // ── Performance metrics
  ch.push(Label('Performance', 20, 382, 200));
  const perf = [
    { label: 'YTD Return',      val: '+14.2%', sub: 'vs. S&P 8.4%',  pos: true  },
    { label: '1-Year Return',   val: '+28.6%', sub: 'vs. S&P 21.3%', pos: true  },
    { label: 'Sharpe Ratio',    val: '1.82',   sub: 'Risk-adjusted',  pos: true  },
    { label: 'Volatility',      val: '12.4%',  sub: '30-day rolling', pos: null  },
  ];
  perf.forEach((p, i) => {
    const px = 20 + (i % 2) * 178;
    const py = 398 + Math.floor(i / 2) * 72;
    ch.push(F(px, py, 162, 62, P.surface, { r: 4, stroke: P.border, sw: 1, ch: [
      T(p.val, 12, 8, 138, 26, { size: 22, weight: 800, fill: p.pos ? P.green : P.fg }),
      T(p.label, 12, 36, 138, 14, { size: 10, fill: P.muted }),
      T(p.sub, 12, 48, 138, 12, { size: 9, fill: p.pos ? P.green : P.muted, opacity: 0.7 }),
    ]}));
  });
  ch.push(Divider(20, 546, 350));

  // ── AI insight callout (editorial pull quote style)
  ch.push(F(20, 554, 350, 68, P.accentDim, { r: 4, stroke: P.accent + '30', sw: 1, ch: [
    F(0, 0, 3, 68, P.accent, { r: 2 }),
    T('Market Insight', 14, 8, 200, 14, { size: 9, weight: 700, fill: P.accent, ls: 1 }),
    T('Your crypto position is 18% of AUM — approaching the\n20% rebalance threshold you set.', 14, 24, 326, 38, { size: 11, fill: P.fg, lh: 1.5 }),
  ]}));

  ch.push(BottomNav(0, 762, 3));
  return F(ox, 0, SW, SH, P.bg, { clip: true, ch });
}

// ── SCREEN 4: Goals ───────────────────────────────────────────────────────────
function buildGoals(ox) {
  const ch = [];
  ch.push(StatusBar(0, 0));

  ch.push(T('Goals', 20, 50, 200, 26, { size: 20, weight: 800, fill: P.fg }));
  ch.push(T('4 active goals', 20, 78, 200, 16, { size: 12, fill: P.muted }));
  ch.push(Divider(20, 98, 350));

  const goals = [
    {
      icon: '⌂', name: 'House Down Payment',
      target: '$60,000', saved: '$38,400',
      pct: 64, deadline: 'Dec 2026',
      color: P.green, status: 'On track',
    },
    {
      icon: '✈', name: 'Japan Trip Fund',
      target: '$8,000', saved: '$6,200',
      pct: 78, deadline: 'Sep 2026',
      color: P.accent, status: 'Ahead',
    },
    {
      icon: '⊙', name: 'Emergency Reserve',
      target: '$25,000', saved: '$12,500',
      pct: 50, deadline: 'Ongoing',
      color: P.gold, status: 'Building',
    },
    {
      icon: '◈', name: 'Retirement — Roth IRA',
      target: '$200,000', saved: '$84,710',
      pct: 42, deadline: '2040',
      color: P.fg2, status: 'Long-term',
    },
  ];

  goals.forEach((g, i) => {
    const gy = 108 + i * 148;
    const barW = 310;
    const filledW = Math.round(barW * g.pct / 100);

    ch.push(F(20, gy, 350, 134, P.surface, { r: 6, stroke: P.border, sw: 1, ch: [
      // Color accent top bar
      F(0, 0, 350, 3, g.color, { r: 4 }),
      // Icon circle
      E(16, 14, 30, 30, g.color + '20'),
      T(g.icon, 16, 18, 30, 22, { size: 14, fill: g.color, align: 'center' }),
      // Goal name
      T(g.name, 56, 14, 210, 18, { size: 13, weight: 700, fill: P.fg }),
      // Status pill
      F(266, 13, 72, 20, g.color + '18', { r: 3, ch: [
        T(g.status, 4, 3, 64, 14, { size: 9, weight: 700, fill: g.color, align: 'center' }),
      ]}),
      // Progress text
      T(g.saved, 16, 42, 160, 20, { size: 16, weight: 800, fill: P.fg }),
      T('of ' + g.target, 16, 64, 160, 14, { size: 10, fill: P.muted }),
      // Deadline
      T('By ' + g.deadline, 280, 52, 60, 14, { size: 10, fill: P.muted, align: 'right' }),
      T(g.pct + '%', 280, 38, 60, 18, { size: 14, weight: 700, fill: g.color, align: 'right' }),
      // Progress bar bg
      F(16, 86, barW, 6, P.surface2, { r: 3 }),
      // Progress bar fill
      F(16, 86, filledW, 6, g.color, { r: 3 }),
      // Monthly contribution note
      T('+$400/mo needed to stay on track', 16, 100, 320, 14, { size: 9, fill: P.muted, opacity: 0.8 }),
      // Projected label
      T('Projected to reach ' + g.target + ' by ' + g.deadline, 16, 114, 320, 14, { size: 9, fill: g.color, opacity: 0.85 }),
    ]}));
  });

  ch.push(BottomNav(0, 762, 4));
  return F(ox, 0, SW, SH, P.bg, { clip: true, ch });
}

// ── Assemble ──────────────────────────────────────────────────────────────────
const numScreens = 5;
const totalW = 80 + numScreens * (SW + GAP) - GAP + 80;  // 2430

const pen = {
  version: '2.8',
  name: 'AUREA — Personal Wealth Intelligence',
  width: totalW,
  height: SH,
  fill: '#E8E4D8',
  children: [
    buildOverview(sx(0)),
    buildPortfolio(sx(1)),
    buildActivity(sx(2)),
    buildInsights(sx(3)),
    buildGoals(sx(4)),
  ],
};

fs.writeFileSync(path.join(__dirname, 'aurea.pen'), JSON.stringify(pen, null, 2));
console.log('✓ aurea.pen written (' + Math.round(JSON.stringify(pen).length / 1024) + ' KB)');
