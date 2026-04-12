'use strict';
// sable-app.js
// SABLE — Personal Finance Bento-Grid Dashboard
//
// Challenge: Design a dark-mode personal finance app using a bento-grid layout,
// directly inspired by:
// 1. AuthKit (godly.website #991) — bento grid dark panels, gradient glows,
//    monochromatic Aeonik Pro depth, modular information architecture
// 2. Silencio (godly.website #964) — stark all-caps Neue Haas Grotesk,
//    black & white brutalist type hierarchy, disciplined negative space
// 3. DarkModeDesign.com — curated dark finance UIs trending March 2026:
//    Midday (editorial dark financial), Forge, Flomodia
//
// Trend: Finance apps moving from teal/blue to rich amber-gold on void black —
//   warmth signals wealth without the coldness of crypto blue palettes.
//   Bento grids are replacing dashboard "cards in a list" for info density.
//
// Palette: void black #080A0F + warm surface #0F1117 + electric amber #F59E0B
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#080A0F',   // void black — Silencio-deep
  surface:  '#0F1117',   // elevated surface
  surface2: '#161820',   // card surface
  surface3: '#1D2030',   // lighter card / bento panel
  border:   '#1E2030',   // subtle border
  border2:  '#2A2D42',   // visible border
  muted:    '#4A4E6A',   // muted blue-grey
  fg:       '#F0EFEB',   // warm white — Silencio-inspired
  fg2:      '#9698B2',   // secondary text
  amber:    '#F59E0B',   // electric amber (primary accent)
  amber2:   '#FCD34D',   // bright amber (highlight)
  amber3:   '#78350F',   // deep amber (subtle bg accent)
  green:    '#10B981',   // income green
  red:      '#EF4444',   // expense red
  violet:   '#8B5CF6',   // investment violet
};

let _id = 0;
const uid = () => `sb${++_id}`;

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

const Line = (x, y, w, fill = P.border) => F(x, y, w, 1, fill, {});

// ── Amber glow halo (Silencio-meets-AuthKit atmospheric depth) ────────────────
const AmberGlow = (cx, cy, r, baseOpacity = 0.07) => [
  E(cx - r * 2.5, cy - r * 2.5, r * 5, r * 5, P.amber, { opacity: baseOpacity * 0.3 }),
  E(cx - r * 1.5, cy - r * 1.5, r * 3, r * 3, P.amber, { opacity: baseOpacity * 0.6 }),
  E(cx - r, cy - r, r * 2, r * 2, P.amber, { opacity: baseOpacity }),
];

// ── Status bar ────────────────────────────────────────────────────────────────
const StatusBar = (ox) => F(ox, 0, 390, 44, P.bg, { ch: [
  T('9:41', 16, 14, 60, 16, { size: 15, weight: 600, fill: P.fg }),
  T('● ● ●', 320, 14, 60, 16, { size: 11, fill: P.fg2, align: 'right' }),
]});

// ── Bottom nav ────────────────────────────────────────────────────────────────
const BottomNav = (ox, active = 0) => {
  const labels = ['Home', 'Spend', 'History', 'Goals', 'Profile'];
  const icons  = ['⬡', '◈', '≡', '◎', '○'];
  const tabs = labels.map((lbl, i) => F(i * 78, 0, 78, 48, 'transparent', { ch: [
    T(icons[i], 29, 6,  20, 18, { size: 14, fill: i === active ? P.amber : P.muted, align: 'center' }),
    T(lbl,       8, 26, 62, 12, { size: 9, fill: i === active ? P.amber : P.muted, align: 'center', ls: 0.5 }),
  ]}));
  return F(ox, 796, 390, 48, P.surface, {
    stroke: P.border, sw: 1,
    ch: tabs,
  });
};

// ── Bento cell helper ─────────────────────────────────────────────────────────
const BentoCell = (x, y, w, h, children, opts = {}) =>
  F(x, y, w, h, opts.fill || P.surface2, {
    r: opts.r !== undefined ? opts.r : 16,
    stroke: opts.stroke || P.border2,
    sw: 1,
    ch: children,
  });

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Home Dashboard (Bento Grid)
// ══════════════════════════════════════════════════════════════════════════════
function screenHome(ox) {
  const glow = AmberGlow(ox + 195, 200, 110, 0.09);

  // Total balance — large hero bento cell (full width)
  const heroCell = BentoCell(ox + 16, 56, 358, 148, [
    T('TOTAL BALANCE', 20, 20, 200, 12, { size: 9, weight: 700, fill: P.muted, ls: 3 }),
    T('$24,801.50', 20, 40, 280, 52, { size: 44, weight: 700, fill: P.fg, ls: -1 }),
    T('+$312.40 this month', 20, 100, 200, 16, { size: 12, fill: P.green }),
    // Mini spark line
    ...[[0,0],[20,8],[40,-4],[60,12],[80,2],[100,16],[120,6],[140,20],[160,10],[180,18]].map(([dx, dy], i, arr) => {
      if (i === 0) return null;
      return F(220 + arr[i-1][0], 80 - arr[i-1][1], arr[i][0] - arr[i-1][0], 1, P.amber, { opacity: 0.7 });
    }).filter(Boolean),
    // Amber dot at end
    E(358, 58, 8, 8, P.amber),
  ], { fill: P.surface3 });

  // Quick stat row (2 × half-width bento cells)
  const statIncome = BentoCell(ox + 16, 216, 170, 90, [
    T('INCOME', 16, 16, 120, 12, { size: 9, weight: 700, fill: P.muted, ls: 2.5 }),
    T('$5,200', 16, 36, 140, 32, { size: 26, weight: 700, fill: P.green }),
    T('Mar 2026', 16, 74, 120, 12, { size: 10, fill: P.muted }),
  ]);

  const statExpense = BentoCell(ox + 204, 216, 170, 90, [
    T('EXPENSES', 16, 16, 130, 12, { size: 9, weight: 700, fill: P.muted, ls: 2.5 }),
    T('$3,418', 16, 36, 140, 32, { size: 26, weight: 700, fill: P.red }),
    T('Mar 2026', 16, 74, 120, 12, { size: 10, fill: P.muted }),
  ]);

  // Savings rate — amber accent cell
  const savingsCell = BentoCell(ox + 16, 318, 116, 116, [
    T('SAVINGS\nRATE', 12, 14, 90, 28, { size: 9, weight: 700, fill: P.muted, ls: 2, lh: 1.5 }),
    T('34%', 12, 52, 90, 44, { size: 36, weight: 800, fill: P.amber }),
    // Mini arc
    E(18, 90, 80, 80, 'transparent', { stroke: P.amber3, sw: 6, opacity: 0.5 }),
    E(28, 100, 60, 60, 'transparent', { stroke: P.amber, sw: 4, opacity: 0.9 }),
  ], { fill: P.surface3 });

  // Net worth trend cell
  const netWorthCell = BentoCell(ox + 148, 318, 226, 116, [
    T('NET WORTH TREND', 14, 14, 180, 12, { size: 9, weight: 700, fill: P.muted, ls: 2.5 }),
    T('+18.4%', 14, 36, 120, 28, { size: 22, weight: 700, fill: P.amber }),
    T('since Jan 2026', 14, 68, 180, 14, { size: 10, fill: P.muted }),
    // Miniature bar chart
    ...[42, 58, 35, 70, 62, 88, 75, 95].map((h, i) =>
      F(14 + i * 24, 116 - h * 0.55, 14, h * 0.55, P.amber, { r: 3, opacity: 0.3 + (i / 8) * 0.5 })
    ),
  ]);

  // Category grid — 3 × small bento
  const categories = [
    { label: 'FOOD',       amount: '$842', color: P.amber,  icon: '◆' },
    { label: 'TRANSPORT',  amount: '$315', color: P.violet, icon: '◈' },
    { label: 'HOUSING',    amount: '$1,200', color: P.green, icon: '⬡' },
  ];
  const categoryRow = categories.map((cat, i) =>
    BentoCell(ox + 16 + i * 122, 448, 110, 86, [
      T(cat.icon, 12, 12, 30, 20, { size: 16, fill: cat.color }),
      T(cat.label, 12, 36, 90, 12, { size: 8, weight: 700, fill: P.muted, ls: 2 }),
      T(cat.amount, 12, 54, 90, 24, { size: 18, weight: 700, fill: P.fg }),
    ])
  );

  // Recent transactions — list bento cell
  const txns = [
    { label: 'Spotify',    amount: '-$9.99',  color: P.red,   tag: 'MUSIC' },
    { label: 'Salary',     amount: '+$5,200', color: P.green, tag: 'INCOME' },
    { label: 'Whole Foods',amount: '-$68.40', color: P.red,   tag: 'FOOD' },
  ];
  const txnCell = BentoCell(ox + 16, 548, 358, 232, [
    T('RECENT ACTIVITY', 16, 16, 200, 12, { size: 9, weight: 700, fill: P.muted, ls: 3 }),
    ...txns.flatMap((tx, i) => [
      F(16, 40 + i * 62, 326, 50, P.surface3, { r: 12, ch: [
        // Icon circle
        E(14, 9, 32, 32, P.bg, { stroke: P.border2, sw: 1 }),
        T(tx.tag[0], 22, 12, 16, 20, { size: 12, fill: tx.color, align: 'center' }),
        T(tx.label, 56, 8, 160, 16, { size: 13, weight: 600, fill: P.fg }),
        T(tx.tag,   56, 28, 120, 12, { size: 9, fill: P.muted, ls: 1.5 }),
        T(tx.amount, 200, 15, 112, 20, { size: 14, weight: 700, fill: tx.color, align: 'right' }),
      ]}),
    ]),
    T('View all transactions →', 100, 224, 158, 14, { size: 11, fill: P.amber, align: 'center' }),
  ]);

  return F(ox, 0, 390, 844, P.bg, { ch: [
    ...glow,
    StatusBar(ox),
    // Header
    T('SABLE', 20, 52, 100, 20, { size: 13, weight: 900, fill: P.amber, ls: 6 }),
    T('↕', 350, 52, 24, 20, { size: 16, fill: P.muted }),
    heroCell,
    statIncome,
    statExpense,
    savingsCell,
    netWorthCell,
    ...categoryRow,
    txnCell,
    BottomNav(ox, 0),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Spending Breakdown
// ══════════════════════════════════════════════════════════════════════════════
function screenSpend(ox) {
  const glow = AmberGlow(ox + 195, 240, 90, 0.08);

  // Donut chart (simulated with concentric ellipses)
  const donutCx = ox + 195, donutCy = 200;
  const donut = [
    E(donutCx - 90, donutCy - 90, 180, 180, P.surface3, { stroke: P.border2, sw: 1 }),
    // Segments as colored arcs (approximated with overlapping ellipses)
    E(donutCx - 80, donutCy - 80, 160, 160, 'transparent', { stroke: P.amber,  sw: 22, opacity: 0.9 }),
    E(donutCx - 80, donutCy - 80, 160, 160, 'transparent', { stroke: P.violet, sw: 22, opacity: 0.6 }),
    E(donutCx - 80, donutCy - 80, 160, 160, 'transparent', { stroke: P.green,  sw: 22, opacity: 0.4 }),
    // Inner void
    E(donutCx - 58, donutCy - 58, 116, 116, P.bg),
    // Center text
    T('$3,418', donutCx - 50, donutCy - 20, 100, 24, { size: 19, weight: 800, fill: P.fg, align: 'center' }),
    T('TOTAL SPENT', donutCx - 50, donutCy + 6, 100, 14, { size: 8, fill: P.muted, ls: 2, align: 'center' }),
  ];

  // Legend
  const legendItems = [
    { label: 'Food & Dining',  pct: '32%', color: P.amber,  amount: '$1,094' },
    { label: 'Transport',      pct: '24%', color: P.violet, amount: '$820' },
    { label: 'Utilities',      pct: '20%', color: P.green,  amount: '$683' },
    { label: 'Entertainment',  pct: '14%', color: P.fg2,    amount: '$478' },
    { label: 'Other',          pct: '10%', color: P.muted,  amount: '$342' },
  ];
  const legend = legendItems.map((item, i) =>
    F(ox + 20, 316 + i * 56, 350, 46, P.surface2, { r: 12, stroke: P.border, sw: 1, ch: [
      F(14, 13, 4, 20, item.color, { r: 2 }),
      T(item.label, 28, 8, 180, 16, { size: 13, weight: 500, fill: P.fg }),
      T(item.pct, 28, 26, 60, 14, { size: 10, fill: P.muted }),
      T(item.amount, 260, 14, 80, 18, { size: 13, weight: 700, fill: item.color, align: 'right' }),
    ]})
  );

  return F(ox, 0, 390, 844, P.bg, { ch: [
    ...glow,
    StatusBar(ox),
    T('← Back', 16, 52, 70, 18, { size: 13, fill: P.muted }),
    T('SPENDING', 20, 80, 280, 22, { size: 20, weight: 900, fill: P.fg, ls: 4 }),
    T('MARCH 2026', 20, 108, 200, 14, { size: 9, fill: P.amber, ls: 3 }),
    ...donut,
    ...legend,
    BottomNav(ox, 1),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Transaction History
// ══════════════════════════════════════════════════════════════════════════════
function screenHistory(ox) {
  const transactions = [
    { date: 'MAR 19', label: 'Whole Foods', cat: 'FOOD',      amount: '-$68.40',  color: P.red },
    { date: 'MAR 19', label: 'Spotify',     cat: 'MUSIC',     amount: '-$9.99',   color: P.red },
    { date: 'MAR 18', label: 'Salary',      cat: 'INCOME',    amount: '+$5,200',  color: P.green },
    { date: 'MAR 17', label: 'Uber',        cat: 'TRANSPORT', amount: '-$24.80',  color: P.red },
    { date: 'MAR 16', label: 'Apple',       cat: 'SERVICES',  amount: '-$14.99',  color: P.red },
    { date: 'MAR 15', label: 'Dividends',   cat: 'INVEST',    amount: '+$312.40', color: P.amber },
    { date: 'MAR 14', label: 'Electric',    cat: 'UTILITY',   amount: '-$87.20',  color: P.red },
    { date: 'MAR 13', label: 'Pret',        cat: 'FOOD',      amount: '-$12.60',  color: P.red },
  ];

  // Search bar
  const searchBar = F(ox + 16, 104, 358, 44, P.surface2, { r: 12, stroke: P.border2, sw: 1, ch: [
    T('⌕  Search transactions…', 16, 13, 300, 18, { size: 13, fill: P.muted }),
  ]});

  // Filter pills
  const filters = ['ALL', 'INCOME', 'EXPENSE', 'INVEST'];
  const filterRow = filters.map((f, i) =>
    F(ox + 16 + i * 84, 160, 76, 28, i === 0 ? P.amber : P.surface2, {
      r: 14,
      stroke: i === 0 ? P.amber : P.border2,
      sw: 1,
      ch: [T(f, 0, 7, 76, 14, { size: 9, weight: 700, fill: i === 0 ? P.bg : P.muted, align: 'center', ls: 1.5 })]
    })
  );

  const txnList = transactions.map((tx, i) =>
    F(ox + 16, 204 + i * 68, 358, 58, P.surface2, { r: 14, stroke: P.border, sw: 1, ch: [
      // Date chip
      F(12, 14, 44, 28, P.surface3, { r: 8, ch: [
        T(tx.date.split(' ')[0], 0, 4, 44, 10, { size: 7, fill: P.muted, align: 'center', ls: 1 }),
        T(tx.date.split(' ')[1], 0, 14, 44, 14, { size: 10, weight: 700, fill: P.fg, align: 'center' }),
      ]}),
      T(tx.label, 68, 10, 170, 16, { size: 14, weight: 600, fill: P.fg }),
      T(tx.cat, 68, 30, 100, 12, { size: 9, fill: P.muted, ls: 1.5 }),
      T(tx.amount, 254, 18, 90, 20, { size: 14, weight: 700, fill: tx.color, align: 'right' }),
    ]})
  );

  return F(ox, 0, 390, 844, P.bg, { ch: [
    StatusBar(ox),
    T('← Back', 16, 52, 70, 18, { size: 13, fill: P.muted }),
    T('HISTORY', 20, 80, 280, 22, { size: 20, weight: 900, fill: P.fg, ls: 4 }),
    searchBar,
    ...filterRow,
    ...txnList,
    BottomNav(ox, 2),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Add Transaction
// ══════════════════════════════════════════════════════════════════════════════
function screenAddTxn(ox) {
  // Type toggle
  const typeToggle = F(ox + 16, 100, 358, 48, P.surface2, { r: 24, stroke: P.border2, sw: 1, ch: [
    F(0, 0, 179, 48, P.red, { r: 24, ch: [
      T('EXPENSE', 0, 16, 179, 16, { size: 11, weight: 700, fill: P.fg, align: 'center', ls: 2 }),
    ]}),
    F(179, 0, 179, 48, 'transparent', { r: 24, ch: [
      T('INCOME', 0, 16, 179, 16, { size: 11, weight: 700, fill: P.muted, align: 'center', ls: 2 }),
    ]}),
  ]});

  // Big amount input
  const amountInput = F(ox + 16, 164, 358, 100, P.surface3, { r: 16, stroke: P.border2, sw: 1, ch: [
    T('AMOUNT', 20, 14, 200, 12, { size: 8, weight: 700, fill: P.muted, ls: 3 }),
    T('$0.00', 20, 36, 300, 50, { size: 42, weight: 800, fill: P.fg }),
    T('USD', 320, 58, 30, 16, { size: 11, fill: P.muted }),
  ]});

  // Category picker grid
  const cats = [
    { label: 'FOOD',     icon: '◆', color: P.amber },
    { label: 'TRANSPORT',icon: '◈', color: P.violet },
    { label: 'HOUSING',  icon: '⬡', color: P.green },
    { label: 'MUSIC',    icon: '♪', color: P.red },
    { label: 'SERVICES', icon: '◎', color: P.fg2 },
    { label: 'OTHER',    icon: '+', color: P.muted },
  ];
  const catGrid = cats.map((cat, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    return F(ox + 16 + col * 118, 282 + row * 84, 110, 74, i === 0 ? P.surface3 : P.surface2, {
      r: 14,
      stroke: i === 0 ? P.amber : P.border,
      sw: i === 0 ? 1.5 : 1,
      ch: [
        T(cat.icon, 0, 10, 110, 26, { size: 20, fill: cat.color, align: 'center' }),
        T(cat.label, 0, 40, 110, 12, { size: 8, weight: 700, fill: i === 0 ? P.fg : P.muted, align: 'center', ls: 1.5 }),
      ]
    });
  });

  // Note input
  const noteInput = F(ox + 16, 458, 358, 48, P.surface2, { r: 12, stroke: P.border2, sw: 1, ch: [
    T('Add a note…', 16, 15, 300, 18, { size: 13, fill: P.muted }),
  ]});

  // Date selector
  const dateSel = F(ox + 16, 518, 358, 48, P.surface2, { r: 12, stroke: P.border2, sw: 1, ch: [
    T('📅  Today — March 19, 2026', 16, 15, 280, 18, { size: 13, fill: P.fg }),
    T('›', 338, 14, 16, 20, { size: 16, fill: P.muted }),
  ]});

  // CTA
  const cta = F(ox + 16, 584, 358, 54, P.amber, { r: 16, ch: [
    T('SAVE TRANSACTION', 0, 18, 358, 18, { size: 12, weight: 800, fill: P.bg, align: 'center', ls: 2 }),
  ]});

  // Numpad hint
  const numpad = [
    ['1','2','3'],
    ['4','5','6'],
    ['7','8','9'],
    ['.',  '0', '⌫'],
  ].flatMap((row, ri) =>
    row.map((key, ci) =>
      F(ox + 16 + ci * 118, 652 + ri * 44, 110, 36, P.surface2, { r: 10, ch: [
        T(key, 0, 9, 110, 18, { size: 14, weight: key === '⌫' ? 400 : 600, fill: P.fg, align: 'center' }),
      ]})
    )
  );

  return F(ox, 0, 390, 844, P.bg, { ch: [
    StatusBar(ox),
    T('× Cancel', 16, 52, 80, 18, { size: 13, fill: P.muted }),
    T('ADD TRANSACTION', 100, 52, 190, 18, { size: 11, weight: 700, fill: P.fg, align: 'center', ls: 2 }),
    typeToggle,
    amountInput,
    ...catGrid,
    noteInput,
    dateSel,
    cta,
    ...numpad,
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Budget Goals
// ══════════════════════════════════════════════════════════════════════════════
function screenGoals(ox) {
  const glow = AmberGlow(ox + 195, 160, 80, 0.07);

  // Net worth hero bento
  const nwCell = BentoCell(ox + 16, 56, 358, 100, [
    T('NET WORTH', 16, 14, 180, 12, { size: 9, weight: 700, fill: P.muted, ls: 3 }),
    T('$142,500', 16, 34, 240, 46, { size: 38, weight: 800, fill: P.fg }),
    T('+18.4% YTD', 260, 54, 82, 16, { size: 11, fill: P.amber, align: 'right' }),
  ], { fill: P.surface3 });

  // Goals
  const goals = [
    { label: 'EMERGENCY FUND',  target: '$15,000', current: '$11,200', pct: 75, color: P.amber },
    { label: 'VACATION EUROPE', target: '$4,000',  current: '$2,800',  pct: 70, color: P.violet },
    { label: 'NEW LAPTOP',      target: '$2,500',  current: '$800',    pct: 32, color: P.green },
    { label: 'INVESTMENT GOAL', target: '$50,000', current: '$38,100', pct: 76, color: P.amber2 },
  ];

  const goalCards = goals.map((g, i) =>
    BentoCell(ox + 16, 172 + i * 128, 358, 116, [
      T(g.label, 16, 14, 220, 12, { size: 9, weight: 700, fill: P.muted, ls: 2.5 }),
      T(g.current, 16, 34, 160, 28, { size: 24, weight: 800, fill: P.fg }),
      T(`of ${g.target}`, 16, 66, 120, 14, { size: 10, fill: P.muted }),
      T(`${g.pct}%`, 298, 34, 50, 28, { size: 22, weight: 800, fill: g.color, align: 'right' }),
      // Progress bar track
      F(16, 88, 326, 8, P.surface3, { r: 4 }),
      // Progress bar fill
      F(16, 88, Math.round(326 * g.pct / 100), 8, g.color, { r: 4 }),
    ])
  );

  // Add goal button
  const addGoal = F(ox + 16, 696, 358, 52, 'transparent', {
    r: 14,
    stroke: P.amber,
    sw: 1,
    ch: [T('+ NEW GOAL', 0, 17, 358, 18, { size: 11, weight: 700, fill: P.amber, align: 'center', ls: 2 })],
  });

  return F(ox, 0, 390, 844, P.bg, { ch: [
    ...glow,
    StatusBar(ox),
    T('← Back', 16, 52, 70, 18, { size: 13, fill: P.muted }),
    T('GOALS', 20, 80, 200, 22, { size: 20, weight: 900, fill: P.fg, ls: 4 }),
    nwCell,
    ...goalCards,
    addGoal,
    BottomNav(ox, 4),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// ASSEMBLE & SAVE
// ══════════════════════════════════════════════════════════════════════════════
const SCREEN_W = 390;
const GAP      = 80;

const doc = {
  version: '2.8',
  name: 'SABLE — Personal Finance Bento Dashboard',
  width:  5 * SCREEN_W + 6 * GAP,
  height: 844,
  fill:   '#080A0F',
  children: [
    screenHome   (GAP),
    screenSpend  (GAP + (SCREEN_W + GAP)),
    screenHistory(GAP + (SCREEN_W + GAP) * 2),
    screenAddTxn (GAP + (SCREEN_W + GAP) * 3),
    screenGoals  (GAP + (SCREEN_W + GAP) * 4),
  ],
};

const outPath = path.join(__dirname, 'sable.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log('✓ sable.pen written —', Math.round(fs.statSync(outPath).size / 1024) + 'KB');
console.log('  5 screens: Home Dashboard · Spending Breakdown · Transaction History · Add Transaction · Budget Goals');
console.log('  Palette: void black #080A0F · electric amber #F59E0B · income green #10B981 · expense red #EF4444');
