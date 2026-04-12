'use strict';
// vara-app.js
// VARA — know your biology
// Dark biomarker health intelligence app
// Inspired by: Superpower (godly.website) — "Unlock your new health intelligence"
//   Dark navy + warm orange, biomarker testing, longevity tech, clinical data
// Also informed by: MÁLÀ PROJECT (siteinspire) — dramatic dark entry, gold on black
// Theme: DARK

const fs   = require('fs');
const path = require('path');

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const P = {
  bg:       '#080C18',   // deep navy void
  surface:  '#0F1526',   // dark card
  surfaceB: '#192036',   // elevated element
  border:   '#243050',   // cool blue border
  text:     '#ECE8F8',   // cool off-white
  muted:    'rgba(236,232,248,0.38)',
  orange:   '#FF5A30',   // Superpower orange — primary CTA/alert
  blue:     '#3DA8F5',   // electric blue — data/science
  green:    '#2FC87A',   // healthy range
  amber:    '#F0A830',   // caution range
  red:      '#F04848',   // out-of-range flag
  violet:   '#9B80F0',   // AI/insight accent
};

const W = 375;
const H = 812;
const GAP = 80;

let _id = 1;
const uid = () => `n${_id++}`;

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'RECTANGLE', id: uid(), x, y, w, h, fill,
    cornerRadius: opts.r || 0,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
    ...(opts.stroke ? { stroke: opts.stroke, strokeWidth: opts.sw || 1 } : {}),
  };
}

function text(x, y, w, content, size, color, opts = {}) {
  return {
    type: 'TEXT', id: uid(), x, y, w, content,
    fontSize: size, color,
    fontWeight: opts.bold ? 700 : opts.medium ? 500 : opts.light ? 300 : 400,
    fontStyle: opts.italic ? 'italic' : 'normal',
    fontFamily: opts.mono ? 'JetBrains Mono' : opts.serif ? 'Playfair Display' : 'Inter',
    textAlign: opts.center ? 'center' : opts.right ? 'right' : 'left',
    lineHeight: opts.lh || (size <= 12 ? 1.5 : size <= 16 ? 1.5 : 1.2),
    letterSpacing: opts.ls || 0,
    opacity: opts.opacity || 1,
  };
}

function frame(x, y, w, h, children, opts = {}) {
  return {
    type: 'FRAME', id: uid(), x, y, w, h,
    fill: opts.fill || P.bg,
    clip: true,
    children: children.flat(Infinity).filter(Boolean),
  };
}

// ─── SHARED ───────────────────────────────────────────────────────────────────
function statusBar(x, y) {
  return [
    rect(x, y, W, 44, P.bg),
    text(x + 16, y + 14, 60, '9:41', 13, P.text, { medium: true, mono: true }),
    text(x + W - 64, y + 14, 52, '● ◆ ▮', 11, P.muted, { right: true }),
  ];
}

function topBar(x, y, title, sub, accentColor) {
  return [
    rect(x, y, W, 56, P.bg),
    text(x + 20, y + 8, W - 80, title, 22, P.text, { bold: true, ls: -0.02 }),
    sub ? text(x + 20, y + 34, W - 40, sub, 9, accentColor || P.muted, { ls: 0.12 }) : null,
  ];
}

function navBar(x, y, activeIdx) {
  const tabs = [
    { icon: '◎', label: 'Today'   },
    { icon: '▤', label: 'Labs'    },
    { icon: '◈', label: 'Trends'  },
    { icon: '◇', label: 'Insight' },
    { icon: '◌', label: 'Profile' },
  ];
  const tw = W / 5;
  return [
    rect(x, y, W, 80, P.surface, { stroke: P.border, sw: 1 }),
    rect(x + W / 2 - 60, y + 72, 120, 4, P.surfaceB, { r: 2 }),
    ...tabs.map((t, i) => {
      const tx = x + i * tw;
      const on = i === activeIdx;
      return [
        on ? rect(tx + tw / 2 - 18, y + 8, 36, 36, `${P.orange}18`, { r: 10 }) : null,
        text(tx, y + 14, tw, t.icon, 16, on ? P.orange : P.muted, { center: true }),
        text(tx, y + 38, tw, t.label, 8, on ? P.orange : P.muted, { center: true }),
      ];
    }),
  ];
}

function sectionLabel(x, y, label, color) {
  return text(x, y, 280, label, 9, color || P.muted, { ls: 0.12 });
}

function scoreRing(x, y, score, label, color) {
  // Simplified circular score indicator
  const size = 80;
  return [
    rect(x, y, size, size, `${color}12`, { r: size / 2, stroke: `${color}30`, sw: 3 }),
    text(x, y + 22, size, score.toString(), 24, color, { center: true, bold: true, mono: true }),
    text(x, y + 50, size, label, 8, P.muted, { center: true }),
  ];
}

function markerRow(x, y, name, value, unit, range, status, color) {
  const statusIcon = status === 'optimal' ? '●' : status === 'caution' ? '◑' : '○';
  return [
    rect(x, y, W - 32, 52, P.surface, { r: 12, stroke: P.border, sw: 1 }),
    text(x + 12, y + 10, W - 80, name, 12, P.text, { medium: true }),
    text(x + 12, y + 28, W - 80, range, 9, P.muted),
    text(x + W - 88, y + 12, 52, value, 16, color, { right: true, bold: true, mono: true }),
    text(x + W - 88, y + 32, 52, unit, 9, P.muted, { right: true }),
    text(x + W - 30, y + 16, 18, statusIcon, 12, color, { center: true }),
  ];
}

function trendBar(x, y, w, pct, color, prevPct) {
  return [
    rect(x, y, w, 8, P.surfaceB, { r: 4 }),
    rect(x, y, Math.round(w * pct), 8, color, { r: 4 }),
    // previous marker line
    prevPct ? rect(x + Math.round(w * prevPct) - 1, y - 2, 2, 12, `${P.muted}`, { r: 1, opacity: 0.5 }) : null,
  ];
}

// ─── SCREEN 1 — TODAY ─────────────────────────────────────────────────────────
// Daily health intelligence summary
function screenToday(ox, oy) {
  const x = ox, y = oy;

  return frame(x, y, W, H, [
    ...statusBar(x, y),
    ...topBar(x, y + 44, 'Good morning, Elena.', 'FRIDAY · MARCH 27 · LAST LABS: 8 DAYS AGO', P.blue),

    // Overall health score ring + summary
    ...scoreRing(x + 20, y + 106, 84, 'Health Score', P.green),
    text(x + 116, y + 106, W - 140, 'Your biology is strong.', 16, P.text, { bold: true, lh: 1.3 }),
    text(x + 116, y + 130, W - 140, '3 markers need attention.\n1 new flag vs last test.', 12, P.muted, { lh: 1.6 }),

    // Flag strip
    rect(x + 16, y + 200, W - 32, 44, `${P.orange}14`, { r: 12, stroke: `${P.orange}30`, sw: 1 }),
    text(x + 24, y + 213, W - 48, '⚑  Ferritin low (18 ng/mL) — new flag since January test', 11, P.orange, { lh: 1.4 }),

    // Category scores
    sectionLabel(x + 20, y + 258, 'BIOMARKER CATEGORIES'),
    ...[
      { cat: 'Metabolic',    score: 92, color: P.green, n: '22/22 markers' },
      { cat: 'Hormonal',     score: 78, color: P.amber, n: '14/18 markers' },
      { cat: 'Nutrients',    score: 71, color: P.amber, n: '11/16 markers' },
      { cat: 'Cardiovascular', score: 88, color: P.green, n: '10/10 markers' },
      { cat: 'Immune',       score: 94, color: P.green, n: '8/8 markers' },
    ].map((c, i) => {
      const cy = y + 276 + i * 54;
      const bw = W - 130;
      return [
        rect(x + 16, cy, W - 32, 42, P.surface, { r: 10, stroke: P.border, sw: 1 }),
        text(x + 26, cy + 7, 110, c.cat, 12, P.text, { medium: true }),
        text(x + 26, cy + 25, 110, c.n, 9, P.muted),
        ...trendBar(x + 140, cy + 18, bw - 50, c.score / 100, c.color, null),
        text(x + 140 + bw - 44, cy + 11, 36, `${c.score}`, 14, c.color, { right: true, bold: true, mono: true }),
      ];
    }),

    // Next test CTA
    rect(x + 16, y + 552, W - 32, 44, P.orange, { r: 14 }),
    text(x + 16, y + 568, W - 32, 'Schedule next labs →', 14, '#FFFFFF', { center: true, medium: true }),

    ...navBar(x, y + H - 80, 0),
  ]);
}

// ─── SCREEN 2 — LABS ──────────────────────────────────────────────────────────
// Full biomarker results list
function screenLabs(ox, oy) {
  const x = ox, y = oy;

  const markers = [
    { name: 'Testosterone (Total)', value: '642', unit: 'ng/dL', range: 'Optimal: 500–900', status: 'optimal', color: P.green },
    { name: 'DHEA-S',              value: '285', unit: 'μg/dL',  range: 'Optimal: 200–380', status: 'optimal', color: P.green },
    { name: 'Ferritin',            value: '18',  unit: 'ng/mL',  range: 'Optimal: 30–200',  status: 'low',     color: P.red  },
    { name: 'Vitamin D (25-OH)',   value: '44',  unit: 'ng/mL',  range: 'Optimal: 40–80',   status: 'optimal', color: P.green },
    { name: 'HbA1c',               value: '5.1', unit: '%',      range: 'Optimal: <5.7',    status: 'optimal', color: P.green },
    { name: 'hs-CRP',              value: '1.8', unit: 'mg/L',   range: 'Optimal: <1.0',    status: 'caution', color: P.amber },
  ];

  return frame(x, y, W, H, [
    ...statusBar(x, y),
    ...topBar(x, y + 44, 'Labs', 'MARCH 19, 2026 · 84 MARKERS', P.blue),

    // Filter chips
    ...[
      { l: 'All (84)', active: true },
      { l: 'Flagged (3)', active: false },
      { l: 'Hormonal', active: false },
    ].reduce((acc, chip, i) => {
      const cw = chip.l.length * 7.5 + 20;
      const cx = x + 16 + acc.offset;
      acc.nodes.push(
        rect(cx, y + 108, cw, 26, chip.active ? `${P.orange}22` : P.surface, { r: 13, stroke: chip.active ? P.orange : P.border, sw: 1 }),
        text(cx, y + 114, cw, chip.l, 10, chip.active ? P.orange : P.muted, { center: true, medium: true }),
      );
      acc.offset += cw + 8;
      return acc;
    }, { nodes: [], offset: 0 }).nodes,

    sectionLabel(x + 20, y + 146, 'HORMONAL (FLAGGED)'),

    ...markers.map((m, i) => [
      ...markerRow(x + 16, y + 164 + i * 58, m.name, m.value, m.unit, m.range, m.status, m.color),
    ]),

    sectionLabel(x + 20, y + 522, 'ALL CATEGORIES'),
    ...[ 'Metabolic', 'Cardiovascular', 'Nutrients', 'Immune', 'Thyroid', 'Kidney' ].map((cat, i) => {
      const cx = x + 16 + (i % 3) * ((W - 44) / 3 + 4);
      const cy = y + 538 + Math.floor(i / 3) * 42;
      return [
        rect(cx, cy, (W - 44) / 3, 34, P.surface, { r: 8, stroke: P.border, sw: 1 }),
        text(cx, cy + 10, (W - 44) / 3, cat, 10, P.muted, { center: true }),
      ];
    }),

    ...navBar(x, y + H - 80, 1),
  ]);
}

// ─── SCREEN 3 — TRENDS ────────────────────────────────────────────────────────
// Key biomarker trends over time
function screenTrends(ox, oy) {
  const x = ox, y = oy;

  const trendData = [
    { name: 'hs-CRP',         unit: 'mg/L', vals: [2.4, 2.1, 1.9, 1.8], target: 1.0, color: P.amber  },
    { name: 'Ferritin',       unit: 'ng/mL', vals: [28, 24, 20, 18],    target: 30,  color: P.red    },
    { name: 'Testosterone',   unit: 'ng/dL', vals: [580, 610, 628, 642], target: 700, color: P.green  },
    { name: 'Vitamin D',      unit: 'ng/mL', vals: [32, 38, 41, 44],     target: 60,  color: P.blue   },
  ];

  const labels = ['Jun', 'Sep', 'Jan', 'Mar'];

  return frame(x, y, W, H, [
    ...statusBar(x, y),
    ...topBar(x, y + 44, 'Trends', '4 TESTS · JUN 2025 – MAR 2026', P.violet),

    sectionLabel(x + 20, y + 106, 'KEY MARKERS OVER TIME'),

    ...trendData.map((td, i) => {
      const ty = y + 124 + i * 154;
      const chartW = W - 48;
      const chartH = 80;
      const maxV = Math.max(...td.vals) * 1.15;
      const minV = Math.min(Math.min(...td.vals) * 0.85, td.target * 0.85);
      const range = maxV - minV;

      // Chart background
      const chart = [
        rect(x + 16, ty, W - 32, 138, P.surface, { r: 14, stroke: P.border, sw: 1 }),
        text(x + 24, ty + 10, W - 80, td.name, 13, P.text, { medium: true }),
        text(x + 24, ty + 28, 100, `Target: ${td.target} ${td.unit}`, 9, P.muted),
        // Current value
        text(x + W - 52, ty + 10, 44, td.vals[td.vals.length - 1].toString(), 16, td.color, { right: true, bold: true, mono: true }),
        text(x + W - 52, ty + 30, 44, td.unit, 8, P.muted, { right: true }),
      ];

      // Chart dots and line
      const dotNodes = td.vals.map((v, j) => {
        const dx = x + 24 + j * Math.round(chartW / 3);
        const pct = (v - minV) / range;
        const dy = ty + 48 + Math.round(chartH * (1 - pct));
        const isLast = j === td.vals.length - 1;
        return [
          rect(dx - 4, dy - 4, 8, 8, td.color, { r: 4, opacity: isLast ? 1 : 0.6 }),
          text(dx - 16, dy - 18, 32, v.toString(), 9, isLast ? td.color : P.muted, { center: true, mono: true }),
          text(dx - 16, ty + 128, 32, labels[j], 8, P.muted, { center: true }),
        ];
      });

      // Target line
      const targetPct = (td.target - minV) / range;
      const targetY = ty + 48 + Math.round(chartH * (1 - targetPct));
      const targetLine = [
        rect(x + 24, Math.max(targetY, ty + 48), chartW, 1, `${P.muted}`, { opacity: 0.3 }),
        text(x + W - 48, Math.max(targetY - 8, ty + 44), 40, 'target', 7, P.muted, { right: true, opacity: 0.6 }),
      ];

      // Direction arrow
      const dir = td.vals[3] > td.vals[2] ? '↑' : '↓';
      const dirColor = td.name === 'Ferritin' || td.name === 'hs-CRP'
        ? (dir === '↓' ? P.green : P.red)
        : (dir === '↑' ? P.green : P.amber);

      return [...chart, ...dotNodes, ...targetLine,
        text(x + W - 52, ty + 50, 44, dir, 18, dirColor, { right: true, bold: true }),
      ];
    }),

    ...navBar(x, y + H - 80, 2),
  ]);
}

// ─── SCREEN 4 — INSIGHT ───────────────────────────────────────────────────────
// AI-powered health recommendations
function screenInsight(ox, oy) {
  const x = ox, y = oy;

  const insights = [
    {
      rank: '01', color: P.red, title: 'Address low ferritin urgently',
      body: 'Ferritin 18 ng/mL is below optimal and trending down over 4 tests. Iron deficiency affects energy, thyroid, and immunity. Prioritize an iron-rich diet or consider supplementation with your doctor.',
      tags: ['Iron-rich foods', 'Check hepcidin', 'Retest in 6 weeks'],
    },
    {
      rank: '02', color: P.amber, title: 'Reduce inflammatory load',
      body: 'hs-CRP 1.8 mg/L is improving but still elevated. Chronic low-grade inflammation accelerates aging. Anti-inflammatory diet, stress reduction, and sleep optimization are the highest-leverage levers.',
      tags: ['Omega-3s', 'Sleep >7h', 'Stress protocol'],
    },
    {
      rank: '03', color: P.violet, title: 'Optimize Vitamin D toward 60',
      body: 'Vitamin D at 44 ng/mL is in range but below the longevity-optimal 60-80 zone. You\'ve improved 12 points over 9 months — continue current supplementation and increase sun exposure.',
      tags: ['5000 IU/day', 'K2 co-factor', 'Retest in 3 months'],
    },
  ];

  return frame(x, y, W, H, [
    ...statusBar(x, y),
    ...topBar(x, y + 44, 'Insight', 'AI-POWERED · UPDATED MAR 27', P.violet),

    text(x + 20, y + 106, W - 40, 'Three actions with the highest impact on your longevity trajectory.', 12, P.muted, { lh: 1.6, light: true }),

    ...insights.map((ins, i) => {
      const iy = y + 138 + i * 202;
      return [
        rect(x + 16, iy, W - 32, 188, P.surface, { r: 16, stroke: `${ins.color}22`, sw: 1 }),
        // rank + title
        text(x + 24, iy + 12, 28, ins.rank, 11, ins.color, { mono: true, bold: true }),
        text(x + 24, iy + 28, W - 52, ins.title, 14, P.text, { medium: true }),
        // body
        text(x + 24, iy + 50, W - 52, ins.body, 11, P.muted, { lh: 1.65 }),
        // tags
        ...ins.tags.reduce((acc, tag) => {
          const tw = tag.length * 6.5 + 18;
          acc.nodes.push(
            rect(x + 24 + acc.offset, iy + 158, tw, 20, `${ins.color}14`, { r: 10, stroke: `${ins.color}28`, sw: 1 }),
            text(x + 24 + acc.offset, iy + 162, tw, tag, 8, ins.color, { center: true }),
          );
          acc.offset += tw + 6;
          return acc;
        }, { nodes: [], offset: 0 }).nodes,
      ];
    }),

    ...navBar(x, y + H - 80, 3),
  ]);
}

// ─── SCREEN 5 — PROFILE ───────────────────────────────────────────────────────
// Health profile, test schedule, connected data
function screenProfile(ox, oy) {
  const x = ox, y = oy;

  return frame(x, y, W, H, [
    ...statusBar(x, y),
    ...topBar(x, y + 44, 'Elena Vasquez', 'HEALTH PROFILE · MEMBER SINCE 2024', P.blue),

    // Avatar + core stats
    rect(x + 20, y + 106, 56, 56, `${P.blue}18`, { r: 28, stroke: `${P.blue}35`, sw: 2 }),
    text(x + 20, y + 126, 56, 'EV', 18, P.blue, { center: true, bold: true }),
    ...[ { l: 'Age', v: '34' }, { l: 'Tests', v: '4' }, { l: 'Markers', v: '84' } ]
      .map((s, i) => {
        const sx = x + 96 + i * 82;
        return [
          text(sx, y + 108, 70, s.v, 22, P.text, { bold: true, mono: true }),
          text(sx, y + 134, 70, s.l, 9, P.muted),
        ];
      }),

    // Score history
    sectionLabel(x + 20, y + 172, 'HEALTH SCORE HISTORY'),
    ...[
      { date: 'Jun 2025', score: 76, color: P.amber },
      { date: 'Sep 2025', score: 79, color: P.amber },
      { date: 'Jan 2026', score: 82, color: P.green },
      { date: 'Mar 2026', score: 84, color: P.green },
    ].map((s, i) => {
      const sy = y + 190 + i * 46;
      const bw = W - 160;
      return [
        rect(x + 16, sy, W - 32, 36, P.surface, { r: 10, stroke: P.border, sw: 1 }),
        text(x + 24, sy + 11, 80, s.date, 11, P.muted),
        ...trendBar(x + 110, sy + 15, bw, s.score / 100, s.color, null),
        text(x + 110 + bw + 6, sy + 8, 34, s.score.toString(), 16, s.color, { bold: true, mono: true }),
      ];
    }),

    // Connected sources
    sectionLabel(x + 20, y + 378, 'DATA SOURCES'),
    ...[
      { name: 'Oura Ring Gen3',  metric: 'Sleep · HRV · Readiness', color: P.violet, status: '✓ Linked' },
      { name: 'Apple Health',    metric: 'Activity · Steps · VO₂ Max', color: P.blue, status: '✓ Linked' },
      { name: 'Quest Diagnostics', metric: 'Blood labs · 84 markers',  color: P.green, status: '✓ Linked' },
    ].map((src, i) => {
      const sy = y + 396 + i * 58;
      return [
        rect(x + 16, sy, W - 32, 48, P.surface, { r: 12, stroke: P.border, sw: 1 }),
        rect(x + 28, sy + 12, 24, 24, `${src.color}18`, { r: 12 }),
        text(x + 28, sy + 17, 24, '◎', 10, src.color, { center: true }),
        text(x + 62, sy + 9, W - 140, src.name, 13, P.text, { medium: true }),
        text(x + 62, sy + 27, W - 140, src.metric, 10, P.muted),
        text(x + W - 68, sy + 16, 56, src.status, 9, src.color, { right: true }),
      ];
    }),

    // Next test
    rect(x + 16, y + 578, W - 32, 50, P.surface, { r: 14, stroke: `${P.orange}30`, sw: 1 }),
    text(x + 24, y + 591, W - 100, 'Next test due', 12, P.muted),
    text(x + 24, y + 608, W - 100, 'April 19, 2026 — 23 days', 13, P.text, { medium: true }),
    rect(x + W - 76, y + 590, 58, 28, P.orange, { r: 14 }),
    text(x + W - 76, y + 598, 58, 'Book', 12, '#FFF', { center: true, medium: true }),

    ...navBar(x, y + H - 80, 4),
  ]);
}

// ─── ASSEMBLE ─────────────────────────────────────────────────────────────────
const screens = [
  screenToday(0, 0),
  screenLabs(W + GAP, 0),
  screenTrends((W + GAP) * 2, 0),
  screenInsight((W + GAP) * 3, 0),
  screenProfile((W + GAP) * 4, 0),
];

const canvasW = W * 5 + GAP * 4;
const canvasH = H;

const pen = {
  version: '2.8',
  name:    'VARA — know your biology',
  width:   canvasW,
  height:  canvasH,
  fill:    P.bg,
  children: screens,
};

const total = JSON.stringify(pen).match(/"id"/g)?.length ?? 0;
fs.writeFileSync(path.join(__dirname, 'vara.pen'), JSON.stringify(pen, null, 2));
console.log(`✓ vara.pen saved (${canvasW}×${canvasH}, ${total} nodes)`);
