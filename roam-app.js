'use strict';
// roam-app.js
// ROAM — Digital Nomad Finance Intelligence
//
// Challenge: A warm, LIGHT-mode personal finance app for location-independent
// workers who juggle multiple currencies and need to know their "runway" —
// how long they can stay somewhere at current spend rates.
//
// Inspired by:
// 1. Midday.ai (darkmodedesign.com) — "pre-accounting" passive financial intelligence,
//    embedded AI assistant with "1 hour per week" clarity promise. Typography:
//    "Hedvig Letters Sans" humanist warmth. Palette: #18181B near-black + #E6E4E0
//    warm off-white. The concept: automation watching your back so you don't have to.
// 2. land-book.com recent nominees — Tracebit's "Assume Breach" framing reapplied:
//    "Assume Overspend" — proactive monitoring of your burn rate before it surprises you.
// 3. lapa.ninja — Dawn (health fitness) UI borrowing physiological data viz language:
//    "runway pulse", vitals view of your financial health across cities.
//
// Theme: LIGHT — warm parchment cream + sky travel blue + savings green
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#F5F1E8',   // warm parchment
  surface:  '#FDFAF3',   // soft warm near-white
  surface2: '#FFFFFF',   // pure white elevated cards
  surface3: '#ECE8DE',   // warm sand for accented areas
  border:   '#DDD8CC',   // warm separator
  muted:    '#9C9486',   // muted warm text
  fg:       '#1E1A12',   // warm ink black
  fg2:      '#3D3830',   // secondary warm text
  accent:   '#2557D6',   // sky travel blue
  accent2:  '#0D9B6C',   // savings/positive green
  red:      '#D63B2F',   // overspend warning red
  amber:    '#C98C2A',   // caution/currency gold
  tagBg:    '#EEF3FF',
  tagFg:    '#2557D6',
  greenBg:  '#EDFBF4',
  greenFg:  '#0D9B6C',
  amberBg:  '#FFF8E8',
  amberFg:  '#C98C2A',
};

let _id = 0;
const uid = () => `r${++_id}`;

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
  ...(opts.font !== undefined ? { fontFamily: opts.font } : {}),
});

const Rect = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'rectangle', x, y, width: w, height: h, fill,
  ...(opts.r !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Ellipse = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

// ── Sparkline path ────────────────────────────────────────────────────────────
const sparkline = (x, y, w, h, data, color, sw = 2) => {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => {
    const px = (i * step).toFixed(1);
    const py = (h - ((v - min) / range) * h).toFixed(1);
    return `${i === 0 ? 'M' : 'L'} ${px} ${py}`;
  }).join(' ');
  return { id: uid(), type: 'vector', x, y, width: w, height: h,
    fill: 'transparent', stroke: { align: 'center', thickness: sw, fill: color }, path: pts };
};

const areaFill = (x, y, w, h, data, color) => {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const linePts = data.map((v, i) => {
    const px = (i * step).toFixed(1);
    const py = (h - ((v - min) / range) * h).toFixed(1);
    return `${i === 0 ? 'M' : 'L'} ${px} ${py}`;
  }).join(' ');
  return { id: uid(), type: 'vector', x, y, width: w, height: h,
    fill: color, opacity: 0.1,
    stroke: { align: 'center', thickness: 0, fill: 'transparent' },
    path: linePts + ` L ${w} ${h} L 0 ${h} Z` };
};

// ── Status bar ────────────────────────────────────────────────────────────────
const statusBar = (bg = P.bg) => F(0, 0, 390, 50, bg, { ch: [
  T('9:41', 14, 16, 60, 18, { size: 13, weight: 600, fill: P.fg }),
  T('◼ ▶ ▮▮▮', 294, 16, 82, 18, { size: 10, fill: P.fg2, align: 'right' }),
]});

// ── Bottom nav ────────────────────────────────────────────────────────────────
const bottomNav = (active) => {
  const items = [
    { label: 'Runway', icon: '◈', id: 0 },
    { label: 'Spend',  icon: '↓↑', id: 1 },
    { label: 'Cities', icon: '◎', id: 2 },
    { label: 'Budget', icon: '◐', id: 3 },
    { label: 'Goals',  icon: '◑', id: 4 },
  ];
  return F(0, 796, 390, 48, P.surface2, {
    ch: [
      Rect(0, 0, 390, 1, P.border),
      ...items.map((it, i) => {
        const x = i * 78;
        const on = it.id === active;
        return F(x, 0, 78, 48, 'transparent', { ch: [
          T(it.icon, x + 23, 5, 32, 20, { size: 14, fill: on ? P.accent : P.muted, align: 'center', weight: on ? 700 : 400 }),
          T(it.label, x + 5, 26, 68, 14, { size: 9, fill: on ? P.accent : P.muted, align: 'center', weight: on ? 700 : 400 }),
        ]});
      })
    ]
  });
};

// ── Chip helper ───────────────────────────────────────────────────────────────
const chip = (text, x, y, opts = {}) => {
  const bg = opts.bg || P.tagBg;
  const fg = opts.fg || P.tagFg;
  const w  = opts.w  || Math.round(text.replace(/[^\x00-\x7F]/g, '##').length * 7.2 + 18);
  return F(x, y, w, 22, bg, { r: 11, ch: [
    T(text, 9, 4, w - 18, 14, { size: 10, weight: 600, fill: fg }),
  ]});
};

// ── Screen 1: RUNWAY ─────────────────────────────────────────────────────────
function screenRunway() {
  const W = 390, H = 844;
  const spendData = [78, 64, 91, 55, 103, 87, 70, 62, 96, 79, 57, 73, 88, 75, 60];
  const ch = [];

  ch.push(Rect(0, 0, W, H, P.bg));
  ch.push(statusBar());

  // Header row
  ch.push(T('roam', 20, 58, 90, 30, { size: 24, weight: 700, fill: P.accent, font: 'Georgia' }));
  ch.push(F(20, 90, 170, 22, P.tagBg, { r: 11, ch: [
    T('📍 Lisbon, Portugal', 10, 4, 150, 14, { size: 10, weight: 600, fill: P.accent }),
  ]}));
  ch.push(Ellipse(348, 56, 36, 36, P.surface3, { stroke: P.border, sw: 2 }));
  ch.push(T('AS', 348, 66, 36, 16, { size: 11, weight: 700, fill: P.fg2, align: 'center' }));

  // Hero runway card
  const hero = F(20, 122, 350, 182, P.surface2, { r: 22, stroke: P.border, sw: 1, ch: [] });
  hero.children.push(T('Your runway', 20, 18, 180, 16, { size: 11, weight: 500, fill: P.muted }));
  hero.children.push(T('127', 20, 36, 110, 80, { size: 72, weight: 700, fill: P.fg, font: 'Georgia' }));
  hero.children.push(T('days', 136, 78, 70, 36, { size: 26, weight: 300, fill: P.fg2, font: 'Georgia' }));
  hero.children.push(T('at Lisbon pace · ~$77/day', 20, 120, 220, 16, { size: 11, fill: P.muted }));
  hero.children.push(F(254, 14, 80, 26, P.greenBg, { r: 8, ch: [
    T('↑ +12 days', 10, 6, 62, 14, { size: 11, weight: 700, fill: P.accent2 }),
  ]}));
  // Micro sparkline in card
  hero.children.push(areaFill(234, 66, 100, 50, spendData, P.accent));
  hero.children.push(sparkline(234, 66, 100, 50, spendData, P.accent, 2));
  ch.push(hero);

  // Three metric chips
  const mets = [
    { label: 'Daily avg', v: '$77', sub: 'last 30d' },
    { label: 'Monthly',   v: '$2,310', sub: 'Mar 2026' },
    { label: 'Balance',   v: '$9,817', sub: 'total' },
  ];
  mets.forEach((m, i) => {
    const mx = 20 + i * 118;
    const mc = F(mx, 318, 110, 68, P.surface2, { r: 14, stroke: P.border, sw: 1, ch: [] });
    mc.children.push(T(m.v, 12, 12, 86, 24, { size: 17, weight: 700, fill: P.fg }));
    mc.children.push(T(m.label, 12, 36, 86, 14, { size: 10, fill: P.muted }));
    mc.children.push(T(m.sub, 12, 50, 86, 12, { size: 9, fill: P.muted }));
    ch.push(mc);
  });

  // Spend chart
  ch.push(T('Daily spend — past 15 days', 20, 402, 240, 16, { size: 13, weight: 600, fill: P.fg }));
  ch.push(T('USD', 358, 402, 32, 16, { size: 11, fill: P.muted, align: 'right' }));
  const chartCard = F(20, 424, 350, 98, P.surface2, { r: 16, stroke: P.border, sw: 1, ch: [] });
  chartCard.children.push(areaFill(14, 14, 322, 58, spendData, P.red));
  chartCard.children.push(sparkline(14, 14, 322, 58, spendData, P.red, 2));
  chartCard.children.push(Rect(14, 14, 322, 1, P.muted));
  chartCard.children.push(T('$100 budget', 14, 4, 100, 12, { size: 9, fill: P.muted }));
  ch.push(chartCard);

  // AI insight
  ch.push(T('Roam insight', 20, 538, 130, 16, { size: 13, weight: 600, fill: P.fg }));
  const ins = F(20, 560, 350, 72, P.surface3, { r: 14, ch: [] });
  ins.children.push(T('✦', 14, 14, 24, 24, { size: 17, fill: P.accent }));
  ins.children.push(T("You've spent $340 less than Bangkok last month. Your runway extends 12 days at this pace — keep it up.", 42, 12, 295, 48, { size: 12, fill: P.fg2, lh: 1.55 }));
  ch.push(ins);

  // Live rates
  ch.push(T('Live rates', 20, 648, 100, 16, { size: 13, weight: 600, fill: P.fg }));
  const rates = [
    { code: 'EUR', flag: '🇪🇺', rate: '0.92', up: false },
    { code: 'THB', flag: '🇹🇭', rate: '35.40', up: true },
    { code: 'GEL', flag: '🇬🇪', rate: '2.71', up: false },
  ];
  rates.forEach((r, i) => {
    const rx = 20 + i * 118;
    const rc = F(rx, 670, 110, 54, P.surface2, { r: 12, stroke: P.border, sw: 1, ch: [] });
    rc.children.push(T(`${r.flag} ${r.code}`, 10, 8, 90, 16, { size: 11, weight: 600, fill: P.fg }));
    rc.children.push(T(`${r.up ? '▲' : '▼'} ${r.rate}`, 10, 28, 90, 16, { size: 13, weight: 700, fill: r.up ? P.red : P.accent2 }));
    ch.push(rc);
  });

  ch.push(bottomNav(0));
  return { id: uid(), name: 'Runway', width: W, height: H, children: ch };
}

// ── Screen 2: TRANSACTIONS ────────────────────────────────────────────────────
function screenTransactions() {
  const W = 390, H = 844;
  const ch = [];

  ch.push(Rect(0, 0, W, H, P.bg));
  ch.push(statusBar());

  ch.push(T('Transactions', 20, 60, 250, 28, { size: 22, weight: 700, fill: P.fg }));

  // Filter chips
  const filters = ['All', 'Food', 'Transport', 'Work', 'Fun'];
  let fx = 20;
  filters.forEach((f, i) => {
    const fw = Math.round(f.length * 8 + 24);
    const on = i === 0;
    ch.push(F(fx, 96, fw, 28, on ? P.accent : P.surface2, { r: 14, stroke: on ? 'transparent' : P.border, sw: 1, ch: [
      T(f, 12, 6, fw - 24, 16, { size: 11, weight: on ? 700 : 400, fill: on ? '#FFF' : P.fg2 }),
    ]}));
    fx += fw + 8;
  });

  // Search bar
  const sb = F(20, 136, 350, 40, P.surface2, { r: 12, stroke: P.border, sw: 1, ch: [] });
  sb.children.push(T('⌕ Search transactions...', 14, 11, 300, 18, { size: 13, fill: P.muted }));
  ch.push(sb);

  const groups = [
    { label: 'TODAY', items: [
      { e: '☕', name: 'Hello, Kristof!',   cat: 'Food',      amt: '–€3.50',  usd: '–$3.81',  flag: false },
      { e: '🏋️', name: 'Gimnasio Urban',   cat: 'Health',    amt: '–€35.00', usd: '–$38.15', flag: false },
      { e: '💻', name: 'Figma Annual',      cat: 'Work',      amt: '–$15.00', usd: '–$15.00', flag: false },
    ]},
    { label: 'YESTERDAY', items: [
      { e: '🛵', name: 'Bolt Ride',          cat: 'Transport', amt: '–€8.20',  usd: '–$8.94',  flag: false },
      { e: '🛒', name: 'Pingo Doce',         cat: 'Food',      amt: '–€42.10', usd: '–$45.89', flag: true },
      { e: '☀️', name: 'LX Factory Market',  cat: 'Fun',       amt: '–€22.00', usd: '–$23.98', flag: false },
      { e: '📶', name: 'NOS Mobile',         cat: 'Utilities', amt: '–€10.00', usd: '–$10.90', flag: false },
    ]},
  ];

  let y = 190;
  groups.forEach(({ label, items }) => {
    ch.push(T(label, 20, y, 200, 14, { size: 10, weight: 700, fill: P.muted, ls: 1 }));
    y += 22;
    items.forEach(tx => {
      const row = F(20, y, 350, 62, P.surface2, { r: 14,
        stroke: tx.flag ? P.amber : P.border, sw: tx.flag ? 1.5 : 1, ch: [] });
      row.children.push(F(12, 10, 40, 40, P.surface3, { r: 12, ch: [
        T(tx.e, 8, 8, 24, 24, { size: 20 }),
      ]}));
      row.children.push(T(tx.name, 62, 10, 180, 16, { size: 13, weight: 600, fill: P.fg }));
      row.children.push(chip(tx.cat, 62, 30, { bg: P.surface3, fg: P.fg2 }));
      if (tx.flag) row.children.push(chip('⚠ Unusual', 62 + tx.cat.length * 7.2 + 28, 30, { bg: P.amberBg, fg: P.amberFg, w: 84 }));
      row.children.push(T(tx.amt, 252, 10, 86, 16, { size: 13, weight: 700, fill: P.red, align: 'right' }));
      row.children.push(T(tx.usd, 252, 30, 86, 14, { size: 10, fill: P.muted, align: 'right' }));
      ch.push(row);
      y += 70;
    });
    y += 8;
  });

  ch.push(bottomNav(1));
  return { id: uid(), name: 'Transactions', width: W, height: H, children: ch };
}

// ── Screen 3: CITIES ─────────────────────────────────────────────────────────
function screenCities() {
  const W = 390, H = 844;
  const ch = [];

  ch.push(Rect(0, 0, W, H, P.bg));
  ch.push(statusBar());

  ch.push(T('City Compare', 20, 60, 220, 28, { size: 22, weight: 700, fill: P.fg }));
  ch.push(T('Monthly cost of living — USD equivalent', 20, 90, 310, 16, { size: 12, fill: P.muted }));

  const cities = [
    { name: 'Lisbon',     flag: '🇵🇹', cost: 2310, note: 'Here now',   pct: 77, color: P.accent,  active: true  },
    { name: 'Bangkok',    flag: '🇹🇭', cost: 1680, note: '–$630/mo',   pct: 56, color: P.accent2, active: false },
    { name: 'Tbilisi',    flag: '🇬🇪', cost: 1420, note: '–$890/mo',   pct: 47, color: P.accent2, active: false },
    { name: 'Medellín',   flag: '🇨🇴', cost: 1550, note: '–$760/mo',   pct: 52, color: P.amber,   active: false },
    { name: 'Chiang Mai', flag: '🇹🇭', cost: 1230, note: '–$1,080/mo', pct: 41, color: P.accent2, active: false },
    { name: 'Bali',       flag: '🇮🇩', cost: 1780, note: '–$530/mo',   pct: 59, color: P.amber,   active: false },
  ];

  const maxCost = Math.max(...cities.map(c => c.cost));
  const barW = 252;
  let y = 122;

  cities.forEach(city => {
    const row = F(20, y, 350, 70, city.active ? P.surface3 : P.surface2, {
      r: 14, stroke: city.active ? P.accent : P.border, sw: city.active ? 1.5 : 1, ch: [] });
    row.children.push(T(`${city.flag} ${city.name}`, 14, 10, 160, 18, { size: 13, weight: city.active ? 700 : 500, fill: P.fg }));
    row.children.push(T(`$${city.cost.toLocaleString()}`, 14, 30, 100, 18, { size: 15, weight: 700, fill: P.fg }));
    row.children.push(T('/mo', 14 + city.cost.toLocaleString().length * 9, 35, 30, 13, { size: 10, fill: P.muted }));
    // Note chip
    const noteBg = city.active ? P.tagBg : P.greenBg;
    const noteFg = city.active ? P.accent : P.accent2;
    const noteW  = city.active ? 80 : Math.round(city.note.length * 7.5 + 18);
    row.children.push(F(334 - noteW, 10, noteW, 22, noteBg, { r: 11, ch: [
      T(city.active ? '📍 Here' : city.note, 8, 4, noteW - 16, 14, { size: 10, weight: 600, fill: noteFg }),
    ]}));
    // Bar
    const filled = Math.round(city.pct / 100 * barW);
    row.children.push(Rect(14, 54, barW, 7, P.border, { r: 4 }));
    if (filled > 0) row.children.push(Rect(14, 54, filled, 7, city.color, { r: 4 }));
    ch.push(row);
    y += 78;
  });

  // Insight
  const ins = F(20, y + 4, 350, 58, P.surface2, { r: 14, stroke: P.border, sw: 1, ch: [] });
  ins.children.push(T('✦ Roam insight', 14, 10, 200, 14, { size: 12, weight: 600, fill: P.accent }));
  ins.children.push(T('Moving to Chiang Mai would extend your runway by 89 days.', 14, 28, 322, 22, { size: 12, fill: P.fg2, lh: 1.45 }));
  ch.push(ins);

  ch.push(bottomNav(2));
  return { id: uid(), name: 'Cities', width: W, height: H, children: ch };
}

// ── Screen 4: BUDGET ─────────────────────────────────────────────────────────
function screenBudget() {
  const W = 390, H = 844;
  const ch = [];

  ch.push(Rect(0, 0, W, H, P.bg));
  ch.push(statusBar());

  ch.push(T('Budget', 20, 60, 160, 28, { size: 22, weight: 700, fill: P.fg }));
  ch.push(T('March 2026', 20, 90, 160, 16, { size: 13, fill: P.muted }));

  // Period toggle
  ch.push(F(224, 60, 146, 30, P.surface2, { r: 15, stroke: P.border, sw: 1, ch: [
    F(4, 4, 68, 22, P.accent, { r: 11, ch: [
      T('Monthly', 10, 3, 48, 16, { size: 10, weight: 700, fill: '#FFF' }),
    ]}),
    T('Weekly', 80, 6, 60, 18, { size: 10, fill: P.muted }),
  ]}));

  // Ring visualization — layered ellipses
  const cx = 195, cy = 256, r = 82, sw = 20;
  ch.push(Ellipse(cx - r, cy - r, r * 2, r * 2, 'transparent', { stroke: P.border, sw }));
  // Simulate fill arc (partial)
  ch.push(Ellipse(cx - r, cy - r, r * 2, r * 2, 'transparent', { stroke: P.accent, sw, opacity: 0.85 }));
  ch.push(Ellipse(cx - r + sw * 0.5, cy - r + sw * 0.5, (r - sw * 0.5) * 2, (r - sw * 0.5) * 2, P.bg));
  // Center labels
  ch.push(T('$2,310', cx - 55, cy - 20, 110, 26, { size: 20, weight: 700, fill: P.fg, align: 'center' }));
  ch.push(T('of $3,000', cx - 45, cy + 8, 90, 16, { size: 11, fill: P.muted, align: 'center' }));
  ch.push(T('77%', cx - 26, cy + 26, 52, 20, { size: 15, weight: 700, fill: P.accent, align: 'center' }));

  const cats = [
    { icon: '🏠', label: 'Housing',   spent: 850, budget: 900, pct: 94 },
    { icon: '🍜', label: 'Food',      spent: 420, budget: 600, pct: 70 },
    { icon: '🚌', label: 'Transport', spent: 180, budget: 200, pct: 90 },
    { icon: '💼', label: 'Work',      spent: 620, budget: 800, pct: 78 },
    { icon: '🎉', label: 'Fun',       spent: 240, budget: 300, pct: 80 },
    { icon: '🏥', label: 'Health',    spent: 0,   budget: 200, pct: 0  },
  ];

  let y = 354;
  ch.push(T('Categories', 20, y, 200, 16, { size: 13, weight: 600, fill: P.fg }));
  y += 24;

  cats.forEach(cat => {
    const row = F(20, y, 350, 56, P.surface2, { r: 14, stroke: P.border, sw: 1, ch: [] });
    row.children.push(T(cat.icon, 10, 12, 30, 30, { size: 20 }));
    row.children.push(T(cat.label, 48, 8, 120, 16, { size: 13, weight: 600, fill: P.fg }));
    row.children.push(T(`$${cat.spent} / $${cat.budget}`, 48, 28, 120, 14, { size: 10, fill: P.muted }));
    const bw = 162;
    row.children.push(Rect(178, 20, bw, 8, P.border, { r: 4 }));
    const barColor = cat.pct >= 90 ? P.red : cat.pct >= 75 ? P.amber : P.accent2;
    const filled = Math.round(cat.pct / 100 * bw);
    if (filled > 0) row.children.push(Rect(178, 20, filled, 8, barColor, { r: 4 }));
    row.children.push(T(`${cat.pct}%`, 308, 16, 36, 16, { size: 11, weight: 700, fill: barColor, align: 'right' }));
    ch.push(row);
    y += 64;
  });

  ch.push(bottomNav(3));
  return { id: uid(), name: 'Budget', width: W, height: H, children: ch };
}

// ── Screen 5: GOALS ──────────────────────────────────────────────────────────
function screenGoals() {
  const W = 390, H = 844;
  const ch = [];

  ch.push(Rect(0, 0, W, H, P.bg));
  ch.push(statusBar());

  ch.push(T('Goals', 20, 60, 160, 28, { size: 22, weight: 700, fill: P.fg }));
  ch.push(T('Financial milestones', 20, 90, 240, 16, { size: 12, fill: P.muted }));

  const goals = [
    { icon: '🛡️', title: 'Emergency Fund', cur: 6800,  tgt: 10000, pct: 68,  note: '$3,200 to go · 6.4 months at $500/mo', color: P.accent },
    { icon: '✈️', title: 'SE Asia Trip',   cur: 1200,  tgt: 2500,  pct: 48,  note: '$1,300 to go · on track for October',   color: P.amber },
    { icon: '💡', title: 'Freelance Cushion', cur: 3400, tgt: 4000, pct: 85, note: '$600 to go · almost there!',             color: P.accent2 },
    { icon: '📷', title: 'Camera Setup',   cur: 220,   tgt: 1800,  pct: 12,  note: '$1,580 to go · starting out',           color: P.muted },
  ];

  let y = 118;
  goals.forEach(g => {
    const card = F(20, y, 350, 116, P.surface2, { r: 18, stroke: P.border, sw: 1, ch: [] });
    // Icon
    card.children.push(F(14, 14, 44, 44, P.surface3, { r: 14, ch: [
      T(g.icon, 8, 8, 28, 28, { size: 22 }),
    ]}));
    // Title + amount
    card.children.push(T(g.title, 68, 13, 188, 18, { size: 14, weight: 700, fill: P.fg }));
    card.children.push(T(`$${g.cur.toLocaleString()}`, 68, 34, 110, 17, { size: 13, fill: P.fg2 }));
    card.children.push(T(`/ $${g.tgt.toLocaleString()}`, 68 + 70, 37, 80, 13, { size: 10, fill: P.muted }));
    // Pct badge
    const badgeBg = g.pct >= 80 ? P.greenBg : P.tagBg;
    const badgeFg = g.pct >= 80 ? P.accent2 : P.accent;
    card.children.push(F(292, 13, 46, 22, badgeBg, { r: 11, ch: [
      T(`${g.pct}%`, 8, 4, 30, 14, { size: 11, weight: 700, fill: badgeFg }),
    ]}));
    // Progress bar
    const bw = 322;
    card.children.push(Rect(14, 66, bw, 9, P.surface3, { r: 5 }));
    const filled = Math.round(g.pct / 100 * bw);
    if (filled > 0) card.children.push(Rect(14, 66, filled, 9, g.color, { r: 5 }));
    // Milestone dots
    [25, 50, 75].forEach(ms => {
      const dx = 14 + Math.round(ms / 100 * bw);
      card.children.push(Ellipse(dx - 4, 63, 9, 9, g.pct >= ms ? '#FFF' : P.border,
        { stroke: g.pct >= ms ? g.color : P.border, sw: 1.5 }));
    });
    // Note
    card.children.push(T(g.note, 14, 84, 322, 14, { size: 10, fill: P.muted }));
    ch.push(card);
    y += 126;
  });

  // Add goal CTA
  ch.push(F(20, y + 6, 350, 46, P.accent, { r: 14, ch: [
    T('+ Add new goal', 115, 12, 120, 22, { size: 14, weight: 700, fill: '#FFF', align: 'center' }),
  ]}));

  ch.push(bottomNav(4));
  return { id: uid(), name: 'Goals', width: W, height: H, children: ch };
}

// ── Assemble Pen ──────────────────────────────────────────────────────────────
const screens = [
  screenRunway(),
  screenTransactions(),
  screenCities(),
  screenBudget(),
  screenGoals(),
];

const pen = {
  version: '2.8',
  name: 'Roam — Nomad Finance Intelligence',
  screens,
};

const outPath = path.join(__dirname, 'roam.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ Wrote ${outPath} (${screens.length} screens, ${JSON.stringify(pen).length} bytes)`);
