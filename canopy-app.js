'use strict';
// canopy-app.js
// CANOPY — Enterprise Carbon Intelligence Platform
//
// Challenge: Design a warm-light editorial dashboard for enterprise carbon tracking,
// directly inspired by:
//
// 1. Relace.ai (lapa.ninja featured, March 2026) — warm cream background #FAF7F0,
//    large condensed display sans-serif, amber/golden CTAs, sparse editorial layout,
//    ALL CAPS navigation labels. "Models built for coding agents" — analog warmth
//    in a digital-infrastructure product.
//
// 2. The Footprint Firm (siteinspire SOTD March 23, 2026) — sustainability advisory
//    "We make sustainable change possible", clean minimal corporate, deep forested
//    color language, editorial type over clean surfaces.
//
// 3. KOMETA Typefaces (minimal.gallery featured) — clean white editorial, metric
//    display as hero content, ultra-spare layout with type doing all the work.
//
// Theme: LIGHT — warm ivory bg, deep forest green accent, terracotta secondary
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#FAF8F2',   // warm ivory (Relace.ai inspired)
  surface:  '#F5F2EA',   // parchment surface card
  surface2: '#EDE9DF',   // deeper card
  border:   '#DDD8CC',   // warm divider
  border2:  '#C8C3B5',   // stronger border
  fg:       '#1C1A14',   // near-black warm ink
  fg2:      '#4A4538',   // secondary text
  muted:    '#8C8472',   // muted warm grey
  accent:   '#1C3D2B',   // deep forest green (Footprint Firm)
  accent2:  '#C25C2A',   // terracotta/amber (Relace CTA inspired)
  green:    '#2A6B42',   // mid green
  greenLt:  '#E8F0EB',   // light green tint
  terra:    '#F2E8E2',   // terracotta tint
  yellow:   '#F5A623',   // amber
  yellowLt: '#FEF5E4',   // amber tint
  white:    '#FFFFFF',
};

let _id = 0;
const uid = () => `c${++_id}`;

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

const Line  = (x, y, w, fill = P.border) => F(x, y, w, 1, fill, {});
const VLine = (x, y, h, fill = P.border) => F(x, y, 1, h, fill, {});

// ── Progress bar ─────────────────────────────────────────────────────────────
const Bar = (x, y, w, pct, color, bg) => [
  F(x, y, w, 4, bg || P.border, { r: 2 }),
  F(x, y, Math.max(4, Math.round(w * pct / 100)), 4, color, { r: 2 }),
];

// ── Status tag ────────────────────────────────────────────────────────────────
const Tag = (x, y, label, color, bg) => {
  const w = label.length * 6.5 + 18;
  return F(x, y, w, 20, bg || color + '18', {
    r: 4, stroke: color + '44', sw: 1,
    ch: [T(label, 0, 3, w, 14, { size: 9, fill: color, weight: 700, ls: 0.8, align: 'center' })],
  });
};

// ── Trend chip ────────────────────────────────────────────────────────────────
const Trend = (x, y, val, down) => F(x, y, 54, 18, down ? P.greenLt : P.terra, {
  r: 4,
  ch: [T((down ? '↓ ' : '↑ ') + val, 0, 2, 54, 14, { size: 9, fill: down ? P.green : P.accent2, weight: 700, align: 'center' })],
});

// ── Status dot ────────────────────────────────────────────────────────────────
const Dot = (x, y, color) => E(x, y, 8, 8, color);

// ── Mini sparkline ────────────────────────────────────────────────────────────
const Spark = (x, y, data, w, h, color) => {
  const max = Math.max(...data);
  const bw = Math.floor((w - (data.length - 1) * 2) / data.length);
  return data.map((v, i) => {
    const bh = Math.max(2, Math.round((v / max) * h));
    return F(x + i * (bw + 2), y + (h - bh), bw, bh, color, { r: 1 });
  });
};

// ── Screen shell ──────────────────────────────────────────────────────────────
const Shell = (ox, ch) => F(ox, 0, 390, 844, P.bg, {
  clip: true,
  ch: [
    F(0, 0, 390, 44, P.bg, { ch: [
      T('9:41', 16, 14, 60, 16, { size: 12, weight: 600, fill: P.fg }),
      T('●●●  ▲▲  ▊', 310, 15, 64, 14, { size: 9, fill: P.muted, align: 'right' }),
    ]}),
    ...ch,
  ],
});

// ── Bottom nav ────────────────────────────────────────────────────────────────
const Nav = (active) => F(0, 764, 390, 80, P.surface, { ch: [
  Line(0, 0, 390, P.border),
  ...[['◈','HOME',0],['⊘','CHAIN',1],['◎','SCOPES',2],['◇','OFFSETS',3],['☰','REPORT',4]].map(([ic,lb,j]) => {
    const nx = 8 + j * 75;
    const on = j === active;
    return [
      on ? F(nx + 12, 8, 50, 50, P.accent + '0E', { r: 10 }) : null,
      T(ic, nx + 16, 10, 40, 22, { size: 16, fill: on ? P.accent : P.muted, align: 'center' }),
      T(lb, nx + 2, 36, 72, 11, { size: 7, fill: on ? P.accent : P.muted, align: 'center', weight: on ? 700 : 400, ls: 0.6 }),
    ].filter(Boolean);
  }).flat(),
]});

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — OVERVIEW
// ══════════════════════════════════════════════════════════════════════════════
function s1(ox) {
  return Shell(ox, [
    // wordmark
    T('CANOPY', 20, 52, 140, 28, { size: 15, weight: 700, fill: P.accent, ls: 3.5 }),
    T('Carbon Intelligence', 20, 78, 200, 14, { size: 10, fill: P.muted, ls: 0.4 }),
    F(342, 50, 32, 32, P.accent, { r: 16, ch: [
      T('JM', 0, 7, 32, 18, { size: 11, weight: 700, fill: P.bg, align: 'center' }),
    ]}),

    // ── Score card (Relace.ai editorial large number + KOMETA metric display) ──
    F(20, 104, 350, 120, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
      T('CARBON SCORE  ·  Q1 2026', 18, 14, 260, 11, { size: 9, fill: P.muted, ls: 1.5, weight: 600 }),
      // huge display number — editorial core of the design
      T('74', 18, 28, 100, 68, { size: 62, weight: 800, fill: P.accent, lh: 1 }),
      T('/100', 108, 72, 52, 18, { size: 13, fill: P.muted }),
      // grade tile
      F(216, 14, 118, 92, P.accent, { r: 8, ch: [
        T('GRADE', 0, 12, 118, 11, { size: 8, fill: P.bg + 'BB', align: 'center', ls: 1.5, weight: 600 }),
        T('B+', 0, 24, 118, 46, { size: 42, weight: 800, fill: P.bg, align: 'center', lh: 1 }),
        T('Top 18% of peers', 0, 70, 118, 12, { size: 8, fill: P.bg + 'AA', align: 'center' }),
      ]}),
      Trend(18, 97, '4.2%', true),
      T('vs last quarter', 78, 100, 140, 11, { size: 9, fill: P.muted }),
    ]}),

    // ── Emissions breakdown ───────────────────────────────────────────────
    T('EMISSIONS BREAKDOWN', 20, 240, 240, 11, { size: 9, fill: P.muted, ls: 1.5, weight: 600 }),
    T('tCO₂e', 322, 240, 48, 11, { size: 9, fill: P.muted, align: 'right' }),

    ...[
      ['Scope 1', 'Direct emissions',     '1,240', 12, P.accent,  P.greenLt,  'ON TRACK'],
      ['Scope 2', 'Purchased energy',     '3,880', 38, P.yellow,  P.yellowLt, 'REVIEW'],
      ['Scope 3', 'Value chain',          '5,080', 50, P.accent2, P.terra,    'ACTION'],
    ].map(([title, sub, val, pct, col, bg, tag], i) =>
      F(20, 256 + i * 64, 350, 56, P.surface, { r: 8, ch: [
        T(title, 14, 8, 100, 14, { size: 11, weight: 600, fill: P.fg }),
        T(sub, 14, 24, 180, 11, { size: 9, fill: P.muted }),
        T(val, 254, 6, 82, 18, { size: 14, weight: 700, fill: P.fg, align: 'right' }),
        T(pct + '% of total', 254, 24, 82, 11, { size: 9, fill: P.muted, align: 'right' }),
        ...Bar(14, 43, 270, pct, col, P.border),
        Tag(300, 36, tag, col, bg),
      ]}),
    ),

    // ── 12-month trend ─────────────────────────────────────────────────────
    T('12-MONTH TREND', 20, 454, 200, 11, { size: 9, fill: P.muted, ls: 1.5, weight: 600 }),
    F(20, 470, 350, 76, P.surface, { r: 8, ch: [
      ...Spark(14, 12, [88,85,83,86,82,79,81,77,76,74,73,74], 322, 44, P.accent + 'AA'),
      ...['J','F','M','A','M','J','J','A','S','O','N','D'].map((m, i) =>
        T(m, 14 + i * 27, 58, 24, 11, { size: 7, fill: P.muted, align: 'center' })
      ),
    ]}),

    // ── Quick actions ──────────────────────────────────────────────────────
    T('QUICK ACTIONS', 20, 562, 200, 11, { size: 9, fill: P.muted, ls: 1.5, weight: 600 }),
    F(20, 578, 168, 46, P.accent, { r: 10, ch: [
      T('◈  Submit Report', 0, 12, 168, 22, { size: 12, weight: 600, fill: P.bg, align: 'center' }),
    ]}),
    F(202, 578, 168, 46, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      T('◎  Buy Offsets', 0, 12, 168, 22, { size: 12, weight: 600, fill: P.fg, align: 'center' }),
    ]}),

    // ── Activity ──────────────────────────────────────────────────────────
    T('RECENT ACTIVITY', 20, 640, 200, 11, { size: 9, fill: P.muted, ls: 1.5, weight: 600 }),
    ...[
      [P.accent,  'Data import complete',   'Scope 3 — 1,240 records',   '2h ago'],
      [P.green,   'Offset certificate',     'VCS-1842 · 200 tCO₂e',     '1d ago'],
      [P.accent2, 'Supplier flagged',       'Nexus Freight — high risk', '2d ago'],
    ].map(([col, title, sub, time], i) =>
      F(20, 656 + i * 30, 350, 26, 'transparent', { ch: [
        Dot(0, 9, col),
        T(title, 18, 0, 220, 14, { size: 11, fill: P.fg, weight: 500 }),
        T(sub, 18, 16, 220, 10, { size: 9, fill: P.muted }),
        T(time, 300, 7, 50, 12, { size: 9, fill: P.muted, align: 'right' }),
      ]}),
    ),

    Nav(0),
  ]);
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — SUPPLY CHAIN
// ══════════════════════════════════════════════════════════════════════════════
function s2(ox) {
  const suppliers = [
    { name:'Nexus Freight',     cat:'Logistics',      co2:'2,140', risk:'HIGH', rc:P.accent2, rbg:P.terra,    pct:82 },
    { name:'Verdant Packaging', cat:'Materials',      co2:'890',   risk:'LOW',  rc:P.green,   rbg:P.greenLt,  pct:22 },
    { name:'Acme Components',   cat:'Manufacturing',  co2:'1,560', risk:'MED',  rc:P.yellow,  rbg:P.yellowLt, pct:55 },
    { name:'SolarFab Ltd',      cat:'Energy',         co2:'310',   risk:'LOW',  rc:P.green,   rbg:P.greenLt,  pct:18 },
    { name:'Global Ports Inc',  cat:'Shipping',       co2:'4,210', risk:'CRIT', rc:'#C0392B', rbg:'#FDECEA',  pct:95 },
  ];

  return Shell(ox, [
    T('SUPPLY CHAIN', 20, 52, 240, 22, { size: 18, weight: 700, fill: P.fg, ls: -0.5 }),
    T('Supplier Emissions Intelligence', 20, 76, 280, 13, { size: 10, fill: P.muted }),

    // search
    F(20, 100, 350, 34, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      T('⊘', 12, 7, 24, 20, { size: 14, fill: P.muted }),
      T('Search suppliers…', 40, 10, 270, 14, { size: 11, fill: P.muted }),
    ]}),

    // stat strip
    F(20, 146, 350, 48, P.accent, { r: 10, ch: [
      VLine(116, 10, 28, P.bg + '33'),
      VLine(233, 10, 28, P.bg + '33'),
      T('24',    14,  6, 100, 22, { size: 18, weight: 700, fill: P.bg, align: 'center' }),
      T('SUPPLIERS', 14, 29, 100, 10, { size: 7, fill: P.bg + 'BB', align: 'center', ls: 1 }),
      T('3',    117, 6, 114, 22, { size: 18, weight: 700, fill: P.bg, align: 'center' }),
      T('AT RISK', 117, 29, 114, 10, { size: 7, fill: P.bg + 'BB', align: 'center', ls: 1 }),
      T('10.2K',234, 6, 110, 22, { size: 18, weight: 700, fill: P.bg, align: 'center' }),
      T('tCO₂e', 234, 29, 110, 10, { size: 7, fill: P.bg + 'BB', align: 'center', ls: 1 }),
    ]}),

    T('SORTED BY EMISSIONS ▾', 20, 208, 240, 11, { size: 9, fill: P.muted, ls: 1.5, weight: 600 }),
    F(284, 202, 86, 20, P.surface, { r: 5, stroke: P.border, sw: 1, ch: [
      T('Filter ▾', 0, 3, 86, 14, { size: 9, fill: P.fg2, align: 'center' }),
    ]}),

    ...suppliers.map((s, i) =>
      F(20, 224 + i * 96, 350, 88, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
        T(s.name, 14, 10, 200, 15, { size: 12, weight: 600, fill: P.fg }),
        Tag(258, 8, s.risk, s.rc, s.rbg),
        T(s.cat, 14, 28, 160, 11, { size: 9, fill: P.muted }),
        T(s.co2 + ' tCO₂e', 200, 28, 136, 11, { size: 10, fill: P.fg, weight: 600, align: 'right' }),
        ...Bar(14, 48, 274, s.pct, s.rc, P.border),
        T(s.pct + '% of budget', 14, 56, 160, 11, { size: 9, fill: P.muted }),
        F(298, 44, 38, 22, P.accent + '14', { r: 5, stroke: P.accent + '33', sw: 1, ch: [
          T('VIEW →', 0, 5, 38, 12, { size: 8, fill: P.accent, weight: 700, align: 'center' }),
        ]}),
      ]}),
    ),

    Nav(1),
  ]);
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — SCOPE DETAIL
// ══════════════════════════════════════════════════════════════════════════════
function s3(ox) {
  return Shell(ox, [
    T('SCOPE DETAIL', 20, 52, 240, 22, { size: 18, weight: 700, fill: P.fg, ls: -0.5 }),
    T('Full emissions breakdown · Q1 2026', 20, 76, 300, 13, { size: 10, fill: P.muted }),

    // scope toggle
    F(20, 100, 350, 30, P.surface, { r: 8, stroke: P.border, sw: 1, ch: [
      F(0, 0, 118, 30, P.accent, { r: 8, ch: [
        T('SCOPE 1', 0, 7, 118, 16, { size: 9, weight: 700, fill: P.bg, align: 'center', ls: 1 }),
      ]}),
      T('SCOPE 2', 118, 7, 116, 16, { size: 9, fill: P.muted, align: 'center', ls: 1 }),
      T('SCOPE 3', 234, 7, 116, 16, { size: 9, fill: P.muted, align: 'center', ls: 1 }),
    ]}),

    // Large editorial number — Relace.ai style hero stat
    F(20, 142, 350, 88, P.accent, { r: 12, ch: [
      T('SCOPE 1  ·  DIRECT EMISSIONS', 18, 11, 310, 11, { size: 9, fill: P.bg + 'AA', ls: 1.5, weight: 600 }),
      T('1,240', 18, 24, 180, 48, { size: 44, weight: 800, fill: P.bg, lh: 1 }),
      T('tCO₂e', 178, 56, 60, 16, { size: 11, fill: P.bg + 'BB' }),
      F(244, 18, 90, 52, P.bg + '18', { r: 8, ch: [
        T('TARGET', 0, 8, 90, 10, { size: 7, fill: P.bg + 'BB', align: 'center', ls: 1 }),
        T('1,100', 0, 20, 90, 18, { size: 15, weight: 700, fill: P.bg, align: 'center' }),
        T('+140 over', 0, 38, 90, 12, { size: 8, fill: '#FFD0A8', align: 'center' }),
      ]}),
    ]}),

    // category breakdown
    T('BY CATEGORY', 20, 244, 200, 11, { size: 9, fill: P.muted, ls: 1.5, weight: 600 }),
    ...[
      ['Combustion (fleet)', 680, 55, P.accent],
      ['Fugitive emissions', 340, 27, P.green],
      ['On-site heating',    150, 12, P.yellow],
      ['Process emissions',   70,  6, P.muted],
    ].map(([label, val, pct, col], i) =>
      F(20, 260 + i * 58, 350, 50, P.surface, { r: 8, stroke: P.border, sw: 1, ch: [
        E(14, 18, 12, 12, col),
        T(label, 34, 4, 200, 13, { size: 10, weight: 500, fill: P.fg }),
        T(val + ' tCO₂e', 34, 20, 200, 11, { size: 9, fill: P.muted }),
        T(pct + '%', 300, 4, 36, 13, { size: 11, weight: 700, fill: P.fg, align: 'right' }),
        ...Bar(34, 37, 300, pct, col, P.border),
      ]}),
    ),

    // YoY comparison
    T('YEAR-OVER-YEAR', 20, 500, 200, 11, { size: 9, fill: P.muted, ls: 1.5, weight: 600 }),
    F(20, 516, 350, 64, P.surface, { r: 8, stroke: P.border, sw: 1, ch: [
      T('2024', 14, 8,  60, 13, { size: 10, fill: P.muted }),
      T('1,640 tCO₂e', 100, 6, 180, 17, { size: 13, weight: 600, fill: P.fg }),
      Trend(285, 8, '24.4%', true),
      T('2025', 14, 28, 60, 13, { size: 10, fill: P.muted }),
      T('1,380 tCO₂e', 100, 26, 180, 17, { size: 13, weight: 600, fill: P.fg }),
      Trend(285, 28, '15.9%', true),
      T('2026 Q1', 14, 46, 70, 13, { size: 10, fill: P.accent, weight: 600 }),
      T('1,240 tCO₂e', 100, 44, 180, 17, { size: 13, weight: 700, fill: P.accent }),
      Trend(285, 46, '10.1%', true),
    ]}),

    // CTA
    F(20, 596, 350, 46, P.accent2, { r: 10, ch: [
      T('⊘  Create Reduction Plan', 0, 12, 350, 22, { size: 13, weight: 600, fill: P.bg, align: 'center' }),
    ]}),

    Nav(2),
  ]);
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — OFFSET MARKETPLACE
// ══════════════════════════════════════════════════════════════════════════════
function s4(ox) {
  const credits = [
    { name:'Amazon Reforestation', type:'Nature-Based',    loc:'Brazil',
      price:18.40, avail:'50K',   cert:'VCS',          rating:4.8, col:P.green,   cbg:P.greenLt },
    { name:'Kenyan Cookstoves',    type:'Community',       loc:'Kenya',
      price:12.20, avail:'200K',  cert:'Gold Standard', rating:4.9, col:P.yellow,  cbg:P.yellowLt},
    { name:'Wind Farm Rajasthan',  type:'Renewable Energy',loc:'India',
      price:8.60,  avail:'1M',    cert:'VCS',           rating:4.5, col:P.accent,  cbg:P.greenLt },
  ];

  return Shell(ox, [
    T('OFFSET MARKET', 20, 52, 260, 22, { size: 18, weight: 700, fill: P.fg, ls: -0.5 }),
    T('Verified carbon credits', 20, 76, 240, 13, { size: 10, fill: P.muted }),

    // budget strip
    F(20, 100, 350, 46, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      VLine(174, 8, 30, P.border),
      T('OFFSET BUDGET', 14, 6, 152, 10, { size: 8, fill: P.muted, ls: 1, weight: 600 }),
      T('$24,000', 14, 20, 152, 18, { size: 15, weight: 700, fill: P.accent }),
      T('OUTSTANDING', 184, 6, 152, 10, { size: 8, fill: P.muted, ls: 1, weight: 600 }),
      T('3,200 tCO₂e', 184, 20, 152, 18, { size: 15, weight: 700, fill: P.accent2 }),
    ]}),

    // filter chips
    ...['ALL', 'NATURE', 'COMMUNITY', 'RENEWABLE'].map((label, i) =>
      F(20 + i * 82, 158, 78, 22, i === 0 ? P.accent : P.surface, {
        r: 5, stroke: i === 0 ? 'transparent' : P.border, sw: 1,
        ch: [T(label, 0, 4, 78, 14, { size: 8, fill: i === 0 ? P.bg : P.muted, align: 'center', weight: 600, ls: 0.5 })],
      })
    ),

    ...credits.map((c, i) =>
      F(20, 192 + i * 170, 350, 162, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
        // accent band
        F(0, 0, 350, 5, c.col, { r: 12 }),
        F(0, 2, 350, 3, c.col),
        // cert + rating
        Tag(14, 16, c.cert, c.col, c.cbg),
        T('★ ' + c.rating, 286, 18, 50, 11, { size: 10, fill: P.yellow, weight: 600, align: 'right' }),
        // name
        T(c.name, 14, 42, 280, 15, { size: 12, weight: 700, fill: P.fg }),
        T(c.type + ' · ' + c.loc, 14, 60, 260, 11, { size: 9, fill: P.muted }),
        // price
        T('$' + c.price.toFixed(2), 14, 80, 100, 22, { size: 19, weight: 700, fill: P.fg }),
        T('per tCO₂e', 14, 103, 120, 11, { size: 9, fill: P.muted }),
        T(c.avail + ' available', 210, 83, 126, 13, { size: 10, fill: P.muted, align: 'right' }),
        // buttons
        F(14, 122, 196, 24, c.col, { r: 6, ch: [
          T('PURCHASE CREDITS →', 0, 5, 196, 14, { size: 9, weight: 700, fill: '#FFF', align: 'center', ls: 0.5 }),
        ]}),
        F(218, 122, 118, 24, 'transparent', { r: 6, stroke: P.border, sw: 1, ch: [
          T('LEARN MORE', 0, 5, 118, 14, { size: 9, fill: P.fg2, align: 'center', ls: 0.5 }),
        ]}),
      ]}),
    ),

    Nav(3),
  ]);
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — REPORT
// ══════════════════════════════════════════════════════════════════════════════
function s5(ox) {
  return Shell(ox, [
    T('REPORTS', 20, 52, 200, 22, { size: 18, weight: 700, fill: P.fg, ls: -0.5 }),
    T('Compliance & export center', 20, 76, 260, 13, { size: 10, fill: P.muted }),

    // report type
    T('REPORT TYPE', 20, 102, 200, 11, { size: 9, fill: P.muted, ls: 1.5, weight: 600 }),
    F(20, 118, 350, 80, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      F(0, 0, 350, 40, P.accent + '10', { r: 10, stroke: P.accent + '44', sw: 1, ch: [
        E(14, 13, 14, 14, P.accent),
        T('GHG Protocol · Full Report', 38, 5, 240, 15, { size: 11, weight: 600, fill: P.accent }),
        T('Scope 1, 2 & 3 — ISO 14064', 38, 22, 240, 11, { size: 9, fill: P.accent + 'BB' }),
        T('●', 322, 13, 16, 14, { size: 10, fill: P.accent, align: 'center' }),
      ]}),
      T('CDP Disclosure', 14, 48, 160, 13, { size: 10, fill: P.fg2 }),
      T('CSRD Compliance', 198, 48, 150, 13, { size: 10, fill: P.fg2 }),
    ]}),

    // config
    T('CONFIGURATION', 20, 212, 200, 11, { size: 9, fill: P.muted, ls: 1.5, weight: 600 }),
    F(20, 228, 350, 76, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      T('Reporting Period', 14, 11, 160, 13, { size: 10, fill: P.fg, weight: 500 }),
      F(198, 7, 140, 22, P.bg, { r: 5, stroke: P.border, sw: 1, ch: [
        T('Jan – Mar 2026  ▾', 0, 4, 140, 14, { size: 9, fill: P.fg, align: 'center' }),
      ]}),
      Line(14, 36, 322, P.border),
      T('Boundary', 14, 46, 160, 13, { size: 10, fill: P.fg, weight: 500 }),
      F(198, 42, 140, 22, P.bg, { r: 5, stroke: P.border, sw: 1, ch: [
        T('Operational Control ▾', 0, 4, 140, 14, { size: 9, fill: P.fg, align: 'center' }),
      ]}),
    ]}),

    // preview
    T('REPORT PREVIEW', 20, 318, 200, 11, { size: 9, fill: P.muted, ls: 1.5, weight: 600 }),
    F(20, 334, 350, 124, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      T('CANOPY CARBON REPORT', 16, 11, 280, 11, { size: 8, fill: P.accent, weight: 700, ls: 1.5 }),
      T('Meridian Industries LLC', 16, 26, 240, 15, { size: 13, weight: 700, fill: P.fg }),
      T('GHG Protocol · Q1 2026 · ISO 14064 Verified', 16, 44, 314, 11, { size: 9, fill: P.muted }),
      Line(16, 59, 318, P.border),
      T('Total Gross Emissions', 16, 68, 220, 11, { size: 9, fill: P.fg }),
      T('10,200 tCO₂e', 228, 68, 106, 11, { size: 9, weight: 700, fill: P.fg, align: 'right' }),
      T('Scope 1  Direct', 16, 83, 220, 11, { size: 9, fill: P.muted }),
      T('1,240', 228, 83, 106, 11, { size: 9, fill: P.muted, align: 'right' }),
      T('Scope 2  Energy', 16, 96, 220, 11, { size: 9, fill: P.muted }),
      T('3,880', 228, 96, 106, 11, { size: 9, fill: P.muted, align: 'right' }),
      T('Scope 3  Value Chain', 16, 109, 220, 11, { size: 9, fill: P.muted }),
      T('5,080', 228, 109, 106, 11, { size: 9, fill: P.muted, align: 'right' }),
    ]}),

    // verification badge
    F(20, 470, 350, 36, P.greenLt, { r: 8, stroke: P.green + '55', sw: 1, ch: [
      T('✓', 14, 9, 20, 18, { size: 13, fill: P.green, weight: 700 }),
      T('Third-party verified · Bureau Veritas · ISO 14064-3', 40, 11, 296, 14, { size: 9, fill: P.green, weight: 500 }),
    ]}),

    // export formats
    T('EXPORT FORMAT', 20, 520, 200, 11, { size: 9, fill: P.muted, ls: 1.5, weight: 600 }),
    ...['PDF Report', 'Excel (.xlsx)', 'CDP XML', 'JSON API'].map((fmt, i) =>
      F(20 + (i%2)*178, 536 + Math.floor(i/2)*46, 168, 38, P.surface, {
        r: 8, stroke: P.border, sw: 1,
        ch: [
          T(['📄','📊','🌐','⚡'][i], 12, 10, 24, 18, { size: 13 }),
          T(fmt, 40, 11, 120, 16, { size: 10, fill: P.fg, weight: 500 }),
        ],
      })
    ),

    // generate button
    F(20, 638, 350, 48, P.accent, { r: 12, ch: [
      T('◈  Generate Report', 0, 12, 350, 24, { size: 14, weight: 700, fill: P.bg, align: 'center' }),
    ]}),

    Nav(4),
  ]);
}

// ══════════════════════════════════════════════════════════════════════════════
// ASSEMBLE & SAVE
// ══════════════════════════════════════════════════════════════════════════════
const SCREEN_W = 390;
const GAP      = 80;

const doc = {
  version: '2.8',
  name: 'CANOPY — Enterprise Carbon Intelligence',
  width:  5 * SCREEN_W + 6 * GAP,
  height: 844,
  fill:   '#E8E4DC',
  children: [
    s1(GAP),
    s2(GAP + (SCREEN_W + GAP)),
    s3(GAP + (SCREEN_W + GAP) * 2),
    s4(GAP + (SCREEN_W + GAP) * 3),
    s5(GAP + (SCREEN_W + GAP) * 4),
  ],
};

const outPath = path.join(__dirname, 'canopy.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log('✓ canopy.pen written —', Math.round(fs.statSync(outPath).size / 1024) + 'KB');
console.log('  5 screens: Overview · Supply Chain · Scope Detail · Offset Market · Report');
console.log('  Palette: warm ivory #FAF8F2 · forest green #1C3D2B · terracotta #C25C2A');
