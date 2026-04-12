'use strict';
// helix-app.js
// HELIX — AI Drug Discovery & Molecular Research Platform
//
// Design Heartbeat — Mar 20, 2026
//
// Research Sources:
//   • Dribbble Popular (Mar 20, 2026): "AI Drug Discovery Website — Molecular Data
//     Visualization" by Fulcrum Rocks (dribbble.com/shots/27201363) — trending #3 on
//     popular, dark navy UI with molecular network graphs, compound libraries,
//     gradient glow effects on biomarker data
//   • darkmodedesign.com: Superset.sh — AI coding tool, deep near-black +
//     glassmorphism gradient overlays (#070B14-class bg, frosted glass surfaces)
//   • darkmodedesign.com: Belka.ai — industrial AI dark (#181818), monospaced
//     data density, scientific precision in UI copy + layout
//   • Dribbble Popular: Nova Post Parcel Tracking — multi-step progress pipelines,
//     stage-by-stage status flows (adapted for clinical trial stages)
//   • Godly #964 SILENCIO — large editorial display type, radical white space,
//     single-hero visual per screen approach
//
// Challenge:
//   Design a dark-mode biotech AI dashboard for molecular research teams.
//   Push into scientific data visualization territory — molecular network graphs
//   (nodes + edges rendered in SVG/paths), hexagonal compound indicators,
//   spectral gradient data bars, clinical pipeline stages, AI probability curves.
//   A style I haven't used before: the "bioluminescent dark" aesthetic —
//   everything glows faintly from within against true deep navy.
//
// Screens (3 mobile 390×844 + 3 desktop 1440×900):
//   M1: Pipeline Overview — active compounds, AI confidence, trial status summary
//   M2: Molecular Network — compound relationship graph (nodes + edges)
//   M3: Compound Detail — structure viz, biomarker scores, AI prediction
//   D1: Research Hub — full molecular network + compound library sidebar
//   D2: Clinical Pipeline — compound screening stages (waterfall)
//   D3: AI Insights — success probability curves + biomarker correlation matrix
//
// Palette: "Bioluminescent Dark"
//   bg      #050A18  — deep ocean void
//   surface #0A1428  — navy surface
//   surface2 #0F1C38 — elevated card
//   border  #1A2E52  — subtle navy border
//   fg      #D0E8FF  — cool blue-white (clinical precision)
//   accent  #3D8EFF  — electric blue (selection/primary)
//   violet  #7B5AFF  — AI/ML indicator
//   bio     #00FFB2  — bioluminescent teal (confirmed/active)
//   amber   #FFB340  — caution/pending
//   red     #FF4D6A  — failed/critical

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:        '#050A18',   // deep ocean void
  surface:   '#0A1428',   // navy surface
  surface2:  '#0F1C38',   // elevated card
  surface3:  '#152244',   // highlight state
  border:    '#1A2E52',   // subtle navy border
  border2:   '#243D6B',   // stronger border
  muted:     '#2D4470',   // muted mid-tone
  muted2:    '#4A6599',   // lighter muted
  fg:        '#D0E8FF',   // primary text (cool blue-white)
  fg2:       '#7090BC',   // secondary text
  fg3:       '#3A5880',   // tertiary / very muted
  accent:    '#3D8EFF',   // electric blue — primary
  accentDim: '#0D1E3A',   // dim blue bg
  violet:    '#8B6BFF',   // AI/ML / advanced
  violetDim: '#1A1040',   // dim violet bg
  bio:       '#00FFB2',   // bioluminescent teal — confirmed/active
  bioDim:    '#003D2A',   // dim bio bg
  amber:     '#FFB340',   // caution / pending
  amberDim:  '#2A1E00',   // dim amber bg
  red:       '#FF4D6A',   // failed / critical
  redDim:    '#2A0014',   // dim red bg
  white:     '#FFFFFF',
  black:     '#000000',
};

let _id = 0;
const uid = () => `hx${++_id}`;

// ── Core Primitives ───────────────────────────────────────────────────────────
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

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const HR  = (x, y, w, fill = P.border) => F(x, y, w, 1, fill);
const VR  = (x, y, h, fill = P.border) => F(x, y, 1, h, fill);

// Status pill (compact)
const Pill = (x, y, label, color, dim) => {
  const w = label.length * 6.2 + 22;
  return F(x, y, w, 20, dim || P.accentDim, {
    r: 10,
    stroke: color + '44',
    sw: 1,
    ch: [
      E(8, 6, 8, 8, color, { opacity: 0.9 }),
      T(label, 20, 3, w - 24, 14, { size: 9, fill: color, weight: 700, ls: 0.8 }),
    ],
  });
};

// Score badge — circular score indicator
const ScoreBadge = (x, y, score, label, color) => F(x, y, 56, 56, P.surface2, {
  r: 28, stroke: color + '55', sw: 2,
  ch: [
    T(String(score), 8, 10, 40, 22, { size: 18, fill: color, weight: 800, align: 'center' }),
    T(label, 4, 34, 48, 12, { size: 8, fill: P.fg2, weight: 600, ls: 0.5, align: 'center' }),
  ],
});

// Glow dot node for molecular network
const GlowNode = (x, y, r, color, label) => ({
  id: uid(), type: 'group', x: x - r, y: y - r, width: r * 2, height: r * 2,
  children: [
    E(0, 0, r * 2, r * 2, color + '22'),
    E(r / 2 - 1, r / 2 - 1, r + 2, r + 2, color + '44'),
    E(r * 0.6, r * 0.6, r * 0.8, r * 0.8, color, { opacity: 0.9 }),
    ...(label ? [T(label, -20, r * 2 + 2, r * 2 + 40, 12, { size: 8, fill: P.fg2, align: 'center' })] : []),
  ],
});

// Line (edge) between nodes
const Edge = (x1, y1, x2, y2, color = P.border2, opacity = 0.5) => {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  return {
    id: uid(), type: 'frame',
    x: x1, y: y1, width: len, height: 1,
    fill: color,
    opacity,
    rotation: angle,
    children: [],
  };
};

// Mini bar (for charts)
const Bar = (x, y, w, h, color, opacity = 1) => F(x, y, w, h, color, { r: 2, opacity });

// Data row
const DataRow = (x, y, w, label, value, color = P.fg, pct = null) => {
  const children = [
    T(label, 0, 2, w - 80, 14, { size: 11, fill: P.fg2 }),
    T(value, w - 76, 2, 76, 14, { size: 11, fill: color, weight: 600, align: 'right' }),
  ];
  if (pct !== null) {
    children.push(
      F(0, 20, w, 3, P.surface3, { r: 2 }),
      F(0, 20, Math.round(w * pct), 3, color, { r: 2, opacity: 0.7 }),
    );
  }
  return { id: uid(), type: 'group', x, y, width: w, height: pct !== null ? 26 : 18, children };
};

// ── Mobile Screen 1: Pipeline Overview ───────────────────────────────────────
function buildMobile1() {
  const W = 390, H = 844;
  const ch = [];

  // bg gradient glow (top center)
  ch.push(F(95, -80, 200, 200, P.accent + '18', { r: 100 }));

  // Status bar
  ch.push(T('9:41', 16, 14, 60, 16, { size: 12, fill: P.fg, weight: 600 }));
  ch.push(T('●●●', 320, 14, 54, 16, { size: 10, fill: P.fg2, align: 'right' }));

  // Header
  ch.push(T('HELIX', 20, 46, 100, 20, { size: 11, fill: P.accent, weight: 800, ls: 3 }));
  ch.push(T('Research Hub', 20, 68, 200, 22, { size: 18, fill: P.fg, weight: 700 }));
  ch.push(T('Mar 20, 2026  ·  Lab A-7', 20, 94, 220, 14, { size: 11, fill: P.fg2 }));

  // AI confidence strip
  ch.push(F(20, 118, 350, 52, P.surface, {
    r: 12, stroke: P.border, sw: 1,
    ch: [
      F(14, 14, 4, 24, P.violet, { r: 2 }),
      T('AI CONFIDENCE', 24, 10, 120, 12, { size: 9, fill: P.violet, weight: 700, ls: 1.2 }),
      T('87.4%', 24, 24, 80, 18, { size: 16, fill: P.fg, weight: 800 }),
      T('↑ 2.1% from last run', 110, 28, 160, 12, { size: 10, fill: P.bio }),
      // mini confidence bar
      F(260, 20, 74, 12, P.surface3, { r: 6 }),
      F(260, 20, 64, 12, P.violet, { r: 6, opacity: 0.8 }),
    ],
  }));

  // 3-stat row
  const stats = [
    { label: 'ACTIVE', value: '142', sub: 'compounds', color: P.accent },
    { label: 'IN TRIAL', value: '18', sub: 'candidates', color: P.bio },
    { label: 'APPROVED', value: '3', sub: 'this cycle', color: P.amber },
  ];
  stats.forEach((s, i) => {
    const x = 20 + i * 118;
    ch.push(F(x, 184, 110, 72, P.surface, {
      r: 12, stroke: P.border, sw: 1,
      ch: [
        T(s.label, 10, 10, 90, 11, { size: 8, fill: P.fg3, weight: 700, ls: 1.2 }),
        T(s.value, 10, 24, 80, 28, { size: 24, fill: s.color, weight: 800 }),
        T(s.sub, 10, 52, 90, 12, { size: 10, fill: P.fg2 }),
      ],
    }));
  });

  // HR
  ch.push(HR(20, 272, 350));

  // Section: Top Compounds
  ch.push(T('TOP COMPOUNDS', 20, 284, 160, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.5 }));
  ch.push(T('By AI Score', 310, 284, 60, 12, { size: 9, fill: P.accent, align: 'right' }));

  const compounds = [
    { id: 'HLX-4429', score: 94, stage: 'PHASE II', color: P.bio, pct: 0.94 },
    { id: 'HLX-3871', score: 88, stage: 'PHASE I',  color: P.accent, pct: 0.88 },
    { id: 'HLX-5103', score: 81, stage: 'SCREEN',   color: P.violet, pct: 0.81 },
    { id: 'HLX-2294', score: 76, stage: 'SCREEN',   color: P.violet, pct: 0.76 },
    { id: 'HLX-6618', score: 69, stage: 'PENDING',  color: P.amber,  pct: 0.69 },
  ];

  compounds.forEach((c, i) => {
    const y = 308 + i * 68;
    ch.push(F(20, y, 350, 60, P.surface, {
      r: 10, stroke: P.border, sw: 1,
      ch: [
        // Score circle
        E(14, 12, 36, 36, c.color + '22'),
        E(18, 16, 28, 28, c.color + '55'),
        T(String(c.score), 18, 19, 28, 18, { size: 13, fill: c.color, weight: 800, align: 'center' }),
        // Name and stage
        T(c.id, 60, 10, 120, 14, { size: 13, fill: P.fg, weight: 700 }),
        Pill(60, 30, c.stage, c.color, c.color + '22'),
        // Progress bar
        F(200, 22, 132, 4, P.surface3, { r: 2 }),
        F(200, 22, Math.round(132 * c.pct), 4, c.color, { r: 2, opacity: 0.7 }),
        T(Math.round(c.pct * 100) + '%', 284, 14, 48, 12, { size: 10, fill: c.color, align: 'right' }),
      ],
    }));
  });

  // Bottom nav
  ch.push(F(0, 790, 390, 54, P.surface, {
    stroke: P.border, sw: 1,
    ch: [
      HR(0, 0, 390, P.border),
      ...[
        { icon: '⬡', label: 'Overview', active: true },
        { icon: '◈', label: 'Network', active: false },
        { icon: '⬣', label: 'Compounds', active: false },
        { icon: '◉', label: 'Insights', active: false },
      ].map((n, i) => F(i * 98, 0, 98, 54, 'transparent', {
        ch: [
          T(n.icon, 39, 8, 20, 20, { size: 16, fill: n.active ? P.accent : P.fg3, align: 'center' }),
          T(n.label, 14, 30, 70, 12, { size: 9, fill: n.active ? P.accent : P.fg3, align: 'center', weight: n.active ? 600 : 400 }),
        ],
      })),
    ],
  }));

  return { id: uid(), name: 'M1 – Pipeline Overview', width: W, height: H, fill: P.bg, children: ch };
}

// ── Mobile Screen 2: Molecular Network ───────────────────────────────────────
function buildMobile2() {
  const W = 390, H = 844;
  const ch = [];

  // Deep bg glow
  ch.push(F(80, 160, 230, 230, P.bio + '0C', { r: 115 }));
  ch.push(F(160, 280, 180, 180, P.violet + '10', { r: 90 }));

  // Status bar
  ch.push(T('9:41', 16, 14, 60, 16, { size: 12, fill: P.fg, weight: 600 }));
  ch.push(T('●●●', 320, 14, 54, 16, { size: 10, fill: P.fg2, align: 'right' }));

  // Header
  ch.push(T('HELIX', 20, 46, 100, 20, { size: 11, fill: P.accent, weight: 800, ls: 3 }));
  ch.push(T('Molecular Network', 20, 68, 240, 22, { size: 18, fill: P.fg, weight: 700 }));
  ch.push(T('142 nodes  ·  386 bonds', 20, 94, 240, 14, { size: 11, fill: P.fg2 }));

  // Network visualization area
  const netX = 20, netY = 120, netW = 350, netH = 310;
  ch.push(F(netX, netY, netW, netH, P.surface, { r: 16, stroke: P.border, sw: 1 }));

  // Molecular network edges (relative to container 0,0)
  const nodes = [
    { x: 175, y: 155, r: 14, color: P.bio,    label: 'HLX-4429' },
    { x: 100, y: 100, r: 10, color: P.accent,  label: 'HLX-3871' },
    { x: 255, y: 98,  r: 10, color: P.accent,  label: 'HLX-5103' },
    { x: 65,  y: 190, r: 8,  color: P.violet,  label: 'HLX-0831' },
    { x: 290, y: 195, r: 8,  color: P.violet,  label: 'HLX-2294' },
    { x: 130, y: 248, r: 7,  color: P.amber,   label: 'HLX-6618' },
    { x: 228, y: 255, r: 7,  color: P.amber,   label: 'HLX-7714' },
    { x: 175, y: 60,  r: 6,  color: P.fg3,     label: '' },
    { x: 70,  y: 270, r: 5,  color: P.fg3,     label: '' },
    { x: 310, y: 260, r: 5,  color: P.fg3,     label: '' },
  ];

  // Draw edges first
  const edges = [
    [0,1],[0,2],[0,5],[0,6],[1,3],[1,7],[2,4],[2,7],[3,5],[4,6],[5,8],[6,9],[3,8],[4,9],
  ];
  edges.forEach(([a, b]) => {
    const na = nodes[a], nb = nodes[b];
    const dx = nb.x - na.x, dy = nb.y - na.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const edgeColor = (na.color === P.bio || nb.color === P.bio) ? P.bio
      : (na.color === P.accent || nb.color === P.accent) ? P.accent : P.border2;
    ch.push({
      id: uid(), type: 'frame',
      x: netX + na.x, y: netY + na.y, width: len, height: 1,
      fill: edgeColor, opacity: 0.25, rotation: angle, children: [],
    });
  });

  // Draw glow rings + nodes
  nodes.forEach(n => {
    // outer glow halo
    ch.push(E(netX + n.x - n.r * 2.2, netY + n.y - n.r * 2.2, n.r * 4.4, n.r * 4.4, n.color + '10'));
    ch.push(E(netX + n.x - n.r * 1.5, netY + n.y - n.r * 1.5, n.r * 3, n.r * 3, n.color + '20'));
    ch.push(E(netX + n.x - n.r, netY + n.y - n.r, n.r * 2, n.r * 2, n.color, { opacity: 0.85 }));
    if (n.label) {
      ch.push(T(n.label, netX + n.x - 30, netY + n.y + n.r + 4, 60, 12,
        { size: 8, fill: n.color, align: 'center', opacity: 0.8 }));
    }
  });

  // Legend row
  const legendItems = [
    { color: P.bio, label: 'Phase II' },
    { color: P.accent, label: 'Phase I' },
    { color: P.violet, label: 'Screening' },
    { color: P.amber, label: 'Pending' },
  ];
  legendItems.forEach((l, i) => {
    const lx = 20 + i * 88;
    ch.push(E(netX + lx + 2, netY + netH - 28, 8, 8, l.color));
    ch.push(T(l.label, netX + lx + 14, netY + netH - 28, 70, 12, { size: 9, fill: P.fg2 }));
  });

  // Selected compound panel
  ch.push(F(20, 448, 350, 140, P.surface2, {
    r: 14, stroke: P.bio + '55', sw: 1,
    ch: [
      F(0, 0, 350, 4, P.bio, { r: 14, opacity: 0.6 }),
      T('SELECTED COMPOUND', 16, 18, 180, 11, { size: 9, fill: P.bio, weight: 700, ls: 1.2 }),
      T('HLX-4429', 16, 34, 200, 22, { size: 19, fill: P.fg, weight: 800 }),
      T('Kinase Inhibitor  ·  MW: 482.3 g/mol', 16, 60, 280, 13, { size: 11, fill: P.fg2 }),
      ScoreBadge(276, 24, 94, 'AI SCR', P.bio),
      Pill(16, 80, 'PHASE II', P.bio, P.bioDim),
      Pill(90, 80, 'SELECTIVE', P.accent, P.accentDim),
      Pill(168, 80, 'LOW TOX', P.violet, P.violetDim),
      T('Target binding affinity: Kd = 0.8 nM', 16, 108, 280, 13, { size: 11, fill: P.fg }),
    ],
  }));

  // Similarity search row
  ch.push(T('SIMILAR COMPOUNDS', 20, 606, 180, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.5 }));
  const sim = [
    { id: 'HLX-3871', pct: '91%', color: P.accent },
    { id: 'HLX-5103', pct: '78%', color: P.accent },
    { id: 'HLX-9002', pct: '65%', color: P.violet },
    { id: 'HLX-0414', pct: '58%', color: P.fg3 },
  ];
  sim.forEach((s, i) => {
    const sx = 20 + i * 88;
    ch.push(F(sx, 624, 80, 52, P.surface, {
      r: 10, stroke: P.border, sw: 1,
      ch: [
        T(s.pct, 8, 8, 64, 18, { size: 16, fill: s.color, weight: 800, align: 'center' }),
        T(s.id, 8, 30, 64, 12, { size: 9, fill: P.fg2, align: 'center' }),
      ],
    }));
  });

  // Bottom nav
  ch.push(F(0, 790, 390, 54, P.surface, {
    stroke: P.border, sw: 1,
    ch: [
      HR(0, 0, 390, P.border),
      ...[
        { icon: '⬡', label: 'Overview', active: false },
        { icon: '◈', label: 'Network', active: true },
        { icon: '⬣', label: 'Compounds', active: false },
        { icon: '◉', label: 'Insights', active: false },
      ].map((n, i) => F(i * 98, 0, 98, 54, 'transparent', {
        ch: [
          T(n.icon, 39, 8, 20, 20, { size: 16, fill: n.active ? P.accent : P.fg3, align: 'center' }),
          T(n.label, 14, 30, 70, 12, { size: 9, fill: n.active ? P.accent : P.fg3, align: 'center', weight: n.active ? 600 : 400 }),
        ],
      })),
    ],
  }));

  return { id: uid(), name: 'M2 – Molecular Network', width: W, height: H, fill: P.bg, children: ch };
}

// ── Mobile Screen 3: Compound Detail ─────────────────────────────────────────
function buildMobile3() {
  const W = 390, H = 844;
  const ch = [];

  // glow bg
  ch.push(F(100, 50, 190, 190, P.bio + '12', { r: 95 }));

  // Status bar
  ch.push(T('9:41', 16, 14, 60, 16, { size: 12, fill: P.fg, weight: 600 }));
  ch.push(T('●●●', 320, 14, 54, 16, { size: 10, fill: P.fg2, align: 'right' }));

  // Back nav
  ch.push(T('← Pipeline', 20, 44, 100, 16, { size: 12, fill: P.accent }));

  // Compound header
  ch.push(T('HLX-4429', 20, 68, 280, 30, { size: 26, fill: P.fg, weight: 800 }));
  ch.push(T('Kinase Inhibitor  ·  MW: 482.3 g/mol', 20, 102, 280, 14, { size: 11, fill: P.fg2 }));
  ch.push(Pill(20, 122, 'PHASE II', P.bio, P.bioDim));
  ch.push(Pill(98, 122, 'ACTIVE', P.accent, P.accentDim));

  // Structure visualization (hexagonal molecular diagram)
  const cx = 195, cy = 242, radius = 72;
  // Draw hexagon rings (molecular structure approximation)
  for (let ring = 0; ring < 3; ring++) {
    const r = (ring + 1) * 22;
    const opacity = 0.15 - ring * 0.04;
    ch.push(E(cx - r, cy - r, r * 2, r * 2, P.bio, { opacity }));
  }

  // Hexagonal structure nodes (6-vertex benzene-style rings)
  const hexRing = (cx, cy, radius, color, nodeR = 5) => {
    const nodes = [];
    const edges = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3 - Math.PI / 6;
      const nx = cx + radius * Math.cos(angle);
      const ny = cy + radius * Math.sin(angle);
      const next = i < 5 ? i + 1 : 0;
      const na = (next * Math.PI) / 3 - Math.PI / 6;
      const nnx = cx + radius * Math.cos(na);
      const nny = cy + radius * Math.sin(na);
      const dx = nnx - nx, dy = nny - ny;
      const len = Math.sqrt(dx * dx + dy * dy);
      const angle2 = Math.atan2(dy, dx) * 180 / Math.PI;
      edges.push({ id: uid(), type: 'frame', x: nx, y: ny, width: len, height: 1.5,
        fill: color, opacity: 0.6, rotation: angle2, children: [] });
      nodes.push(E(nx - nodeR, ny - nodeR, nodeR * 2, nodeR * 2, color, { opacity: 0.9 }));
    }
    return [...edges, ...nodes];
  };

  // Main ring + two attached rings
  hexRing(cx, cy, radius * 0.55, P.bio, 5).forEach(e => ch.push(e));
  hexRing(cx - 48, cy, radius * 0.38, P.accent, 4).forEach(e => ch.push(e));
  hexRing(cx + 48, cy, radius * 0.38, P.accent, 4).forEach(e => ch.push(e));
  // Central atom
  ch.push(E(cx - 10, cy - 10, 20, 20, P.bio + 'CC'));
  ch.push(E(cx - 6, cy - 6, 12, 12, P.bio));

  // Structure label
  ch.push(T('3D STRUCTURE  ·  AB-KINASE INHIBITOR', 20, 330, 350, 12, { size: 9, fill: P.fg3, weight: 600, ls: 1 }));

  // Biomarker scores
  ch.push(HR(20, 350, 350));
  ch.push(T('BIOMARKER SCORES', 20, 362, 200, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.5 }));

  const biomarkers = [
    { label: 'Binding Affinity', value: '9.2 nM', pct: 0.92, color: P.bio },
    { label: 'Selectivity Index', value: '94.1', pct: 0.94, color: P.bio },
    { label: 'ADME Score', value: '82.3', pct: 0.82, color: P.accent },
    { label: 'Toxicity Risk', value: 'LOW', pct: 0.12, color: P.amber },
    { label: 'BBB Permeability', value: '71.0', pct: 0.71, color: P.violet },
  ];

  biomarkers.forEach((b, i) => {
    const y = 382 + i * 38;
    ch.push(T(b.label, 20, y, 180, 14, { size: 12, fill: P.fg }));
    ch.push(T(b.value, 290, y, 80, 14, { size: 12, fill: b.color, weight: 700, align: 'right' }));
    ch.push(F(20, y + 18, 350, 4, P.surface3, { r: 2 }));
    ch.push(F(20, y + 18, Math.round(350 * b.pct), 4, b.color, { r: 2, opacity: 0.7 }));
  });

  // AI Prediction panel
  ch.push(F(20, 586, 350, 96, P.surface, {
    r: 14, stroke: P.violet + '55', sw: 1,
    ch: [
      F(0, 0, 4, 96, P.violet, { r: 14 }),
      T('AI PREDICTION', 18, 14, 180, 11, { size: 9, fill: P.violet, weight: 700, ls: 1.2 }),
      T('87.4% approval probability', 18, 30, 250, 18, { size: 15, fill: P.fg, weight: 700 }),
      T('Based on 12,400 comparable trial outcomes', 18, 52, 280, 13, { size: 10, fill: P.fg2 }),
      T('Model: HELIX-GPT v4.2  ·  ±4.2% CI', 18, 70, 280, 13, { size: 10, fill: P.fg3 }),
    ],
  }));

  // Action buttons
  ch.push(F(20, 700, 168, 44, P.accent, { r: 10,
    ch: [T('Add to Trial', 0, 13, 168, 18, { size: 13, fill: P.white, weight: 700, align: 'center' })],
  }));
  ch.push(F(202, 700, 168, 44, P.surface2, { r: 10, stroke: P.border2, sw: 1,
    ch: [T('Share Report', 0, 13, 168, 18, { size: 13, fill: P.fg, weight: 600, align: 'center' })],
  }));

  // Bottom nav
  ch.push(F(0, 790, 390, 54, P.surface, {
    stroke: P.border, sw: 1,
    ch: [
      HR(0, 0, 390, P.border),
      ...[
        { icon: '⬡', label: 'Overview', active: false },
        { icon: '◈', label: 'Network', active: false },
        { icon: '⬣', label: 'Compounds', active: true },
        { icon: '◉', label: 'Insights', active: false },
      ].map((n, i) => F(i * 98, 0, 98, 54, 'transparent', {
        ch: [
          T(n.icon, 39, 8, 20, 20, { size: 16, fill: n.active ? P.accent : P.fg3, align: 'center' }),
          T(n.label, 14, 30, 70, 12, { size: 9, fill: n.active ? P.accent : P.fg3, align: 'center', weight: n.active ? 600 : 400 }),
        ],
      })),
    ],
  }));

  return { id: uid(), name: 'M3 – Compound Detail', width: W, height: H, fill: P.bg, children: ch };
}

// ── Desktop Screen 1: Research Hub Dashboard ─────────────────────────────────
function buildDesktop1() {
  const W = 1440, H = 900;
  const ch = [];

  // Bg glow
  ch.push(F(400, 100, 400, 400, P.bio + '08', { r: 200 }));
  ch.push(F(900, 200, 300, 300, P.violet + '0A', { r: 150 }));

  // Sidebar
  ch.push(F(0, 0, 220, 900, P.surface, { stroke: P.border, sw: 1, ch: [
    // Logo
    F(24, 24, 100, 32, 'transparent', { ch: [
      T('HELIX', 0, 6, 60, 20, { size: 16, fill: P.accent, weight: 900, ls: 3 }),
    ]}),
    T('AI RESEARCH', 24, 50, 140, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.5 }),
    HR(0, 72, 220, P.border),

    // Nav items
    ...[
      { icon: '⬡', label: 'Hub', active: true },
      { icon: '◈', label: 'Network', active: false },
      { icon: '⬣', label: 'Compounds', active: false },
      { icon: '◉', label: 'Insights', active: false },
      { icon: '⬙', label: 'Trials', active: false },
      { icon: '◷', label: 'Reports', active: false },
    ].map((n, i) => F(12, 88 + i * 48, 196, 40, n.active ? P.surface2 : 'transparent', {
      r: 8,
      stroke: n.active ? P.border2 : 'transparent', sw: 1,
      ch: [
        T(n.icon, 14, 11, 20, 18, { size: 14, fill: n.active ? P.accent : P.fg3 }),
        T(n.label, 40, 12, 140, 16, { size: 13, fill: n.active ? P.fg : P.fg2, weight: n.active ? 600 : 400 }),
        ...(n.active ? [F(176, 12, 4, 16, P.accent, { r: 2 })] : []),
      ],
    })),

    // Lab info
    HR(0, 460, 220, P.border),
    T('ACTIVE LAB', 24, 476, 140, 11, { size: 8, fill: P.fg3, weight: 700, ls: 1.5 }),
    T('Lab A-7 · Oncology', 24, 492, 172, 14, { size: 12, fill: P.fg }),
    T('Dr. Elara Voss', 24, 510, 172, 14, { size: 11, fill: P.fg2 }),
    E(24, 534, 32, 32, P.accent + '40'),
    T('EV', 24, 540, 32, 20, { size: 11, fill: P.accent, weight: 700, align: 'center' }),

    VR(220, 0, 900, P.border),
  ]}));

  // Topbar
  ch.push(F(220, 0, 1220, 60, P.surface, { stroke: P.border, sw: 1, ch: [
    T('Research Hub', 24, 18, 200, 22, { size: 18, fill: P.fg, weight: 700 }),
    T('Mar 20, 2026  ·  Cycle 12', 230, 22, 200, 16, { size: 12, fill: P.fg2 }),
    F(900, 14, 200, 32, P.surface2, { r: 8, stroke: P.border2, sw: 1, ch: [
      T('🔍  Search compounds...', 12, 8, 176, 16, { size: 12, fill: P.fg3 }),
    ]}),
    F(1112, 14, 90, 32, P.accent, { r: 8, ch: [
      T('+ New Run', 0, 8, 90, 16, { size: 12, fill: P.white, weight: 700, align: 'center' }),
    ]}),
    HR(0, 60, 1220, P.border),
  ]}));

  // KPI strip
  const kpis = [
    { label: 'COMPOUNDS',   value: '142',   sub: 'active in pipeline', color: P.accent },
    { label: 'AI CONFIDENCE', value: '87.4%', sub: 'avg this cycle',  color: P.violet },
    { label: 'IN TRIAL',    value: '18',    sub: 'candidates',         color: P.bio },
    { label: 'CYCLE HITS',  value: '6',     sub: 'new this month',     color: P.amber },
  ];
  kpis.forEach((k, i) => {
    ch.push(F(236 + i * 302, 76, 294, 80, P.surface, {
      r: 12, stroke: P.border, sw: 1,
      ch: [
        T(k.label, 20, 14, 180, 11, { size: 9, fill: P.fg3, weight: 700, ls: 1.5 }),
        T(k.value, 20, 30, 160, 36, { size: 30, fill: k.color, weight: 800 }),
        T(k.sub, 20, 66, 200, 12, { size: 10, fill: P.fg2 }),
        F(222, 14, 50, 50, k.color + '18', { r: 25, ch: [
          T('●', 16, 14, 18, 22, { size: 16, fill: k.color, align: 'center' }),
        ]}),
      ],
    }));
  });

  // Molecular Network (main panel)
  const netX = 236, netY = 172, netW = 680, netH = 480;
  ch.push(F(netX, netY, netW, netH, P.surface, {
    r: 16, stroke: P.border, sw: 1,
    ch: [
      T('MOLECULAR NETWORK', 20, 20, 200, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.5 }),
      T('142 nodes · 386 bonds · live sync', 230, 20, 200, 12, { size: 10, fill: P.fg2 }),
      Pill(520, 12, 'LIVE', P.bio, P.bioDim),
    ],
  }));

  // Network nodes (in absolute coords)
  const bigNodes = [
    { x: netX + 340, y: netY + 240, r: 22, color: P.bio },
    { x: netX + 200, y: netY + 160, r: 16, color: P.accent },
    { x: netX + 470, y: netY + 155, r: 16, color: P.accent },
    { x: netX + 130, y: netY + 290, r: 12, color: P.violet },
    { x: netX + 530, y: netY + 305, r: 12, color: P.violet },
    { x: netX + 240, y: netY + 380, r: 11, color: P.amber },
    { x: netX + 430, y: netY + 390, r: 11, color: P.amber },
    { x: netX + 340, y: netY + 100, r: 10, color: P.fg3 },
    { x: netX + 100, y: netY + 180, r: 8,  color: P.fg3 },
    { x: netX + 590, y: netY + 200, r: 8,  color: P.fg3 },
    { x: netX + 160, y: netY + 420, r: 7,  color: P.fg3 },
    { x: netX + 540, y: netY + 430, r: 7,  color: P.fg3 },
  ];

  const bigEdges = [
    [0,1],[0,2],[0,5],[0,6],[1,3],[1,7],[2,4],[2,7],[3,5],[4,6],[5,10],[6,11],[3,8],[4,9],[7,2],[0,3],[0,4],
  ];
  bigEdges.forEach(([a, b]) => {
    const na = bigNodes[a], nb = bigNodes[b];
    const dx = nb.x - na.x, dy = nb.y - na.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    const edgeColor = (na.color === P.bio || nb.color === P.bio) ? P.bio
      : (na.color === P.accent || nb.color === P.accent) ? P.accent : P.border2;
    ch.push({
      id: uid(), type: 'frame',
      x: na.x, y: na.y, width: len, height: 1.5,
      fill: edgeColor, opacity: 0.2, rotation: angle, children: [],
    });
  });

  bigNodes.forEach((n, idx) => {
    ch.push(E(n.x - n.r * 2.5, n.y - n.r * 2.5, n.r * 5, n.r * 5, n.color + '08'));
    ch.push(E(n.x - n.r * 1.6, n.y - n.r * 1.6, n.r * 3.2, n.r * 3.2, n.color + '18'));
    ch.push(E(n.x - n.r, n.y - n.r, n.r * 2, n.r * 2, n.color, { opacity: 0.85 }));
  });

  // Compound library sidebar
  const libX = 928, libY = 172, libW = 512, libH = 480;
  ch.push(F(libX, libY, libW, libH, P.surface, {
    r: 16, stroke: P.border, sw: 1,
    ch: [
      T('COMPOUND LIBRARY', 20, 20, 200, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.5 }),
      T('Top scored  ↑', 400, 20, 90, 12, { size: 10, fill: P.accent, align: 'right' }),
      HR(0, 44, libW, P.border),
    ],
  }));

  const libCompounds = [
    { id: 'HLX-4429', score: 94, stage: 'PHASE II',  target: 'AB-Kinase',   color: P.bio },
    { id: 'HLX-3871', score: 88, stage: 'PHASE I',   target: 'ERK1/2',      color: P.accent },
    { id: 'HLX-5103', score: 81, stage: 'SCREEN',    target: 'CDK4',        color: P.violet },
    { id: 'HLX-2294', score: 76, stage: 'SCREEN',    target: 'VEGFR-2',     color: P.violet },
    { id: 'HLX-6618', score: 69, stage: 'PENDING',   target: 'mTOR',        color: P.amber },
    { id: 'HLX-7714', score: 63, stage: 'PENDING',   target: 'EGFR',        color: P.amber },
    { id: 'HLX-9002', score: 57, stage: 'QUEUED',    target: 'PI3K',        color: P.fg3 },
  ];
  libCompounds.forEach((c, i) => {
    const ry = libY + 52 + i * 60;
    ch.push(F(libX + 16, ry, libW - 32, 52, i === 0 ? P.surface2 : 'transparent', {
      r: 8,
      stroke: i === 0 ? P.bio + '44' : 'transparent', sw: 1,
      ch: [
        // Score circle
        E(14, 10, 32, 32, c.color + '25'),
        E(18, 14, 24, 24, c.color + '55'),
        T(String(c.score), 18, 17, 24, 18, { size: 12, fill: c.color, weight: 800, align: 'center' }),
        // Compound info
        T(c.id, 58, 8, 120, 15, { size: 13, fill: P.fg, weight: 700 }),
        T(c.target, 58, 28, 100, 13, { size: 11, fill: P.fg2 }),
        Pill(180, 8, c.stage, c.color, c.color + '22'),
        // Arrow
        T('→', 420, 17, 20, 18, { size: 14, fill: P.fg3 }),
      ],
    }));
    ch.push(HR(libX + 16, ry + 52, libW - 32, P.border));
  });

  // Bottom: recent activity + AI summary
  ch.push(F(236, 668, 680, 216, P.surface, {
    r: 12, stroke: P.border, sw: 1,
    ch: [
      T('RECENT ACTIVITY', 20, 16, 200, 11, { size: 9, fill: P.fg3, weight: 700, ls: 1.5 }),
      HR(0, 38, 680, P.border),
      ...[
        { time: '14:22', text: 'HLX-4429 advanced to Phase II · AI score confirmed 94', color: P.bio },
        { time: '13:05', text: 'Batch run #1847 complete · 24 compounds screened', color: P.accent },
        { time: '11:30', text: 'HLX-6618 flagged — toxicity threshold exceeded', color: P.amber },
        { time: '09:14', text: 'New ADME model deployed · HELIX-GPT v4.2', color: P.violet },
      ].map((a, i) => ({
        id: uid(), type: 'group', x: 0, y: 46 + i * 42, width: 680, height: 38,
        children: [
          T(a.time, 20, 10, 50, 14, { size: 11, fill: P.fg3 }),
          F(82, 12, 4, 14, a.color, { r: 2 }),
          T(a.text, 94, 10, 568, 14, { size: 12, fill: P.fg }),
        ],
      })),
    ],
  }));

  ch.push(F(928, 668, 512, 216, P.surface, {
    r: 12, stroke: P.border, sw: 1,
    ch: [
      T('AI CYCLE SUMMARY', 20, 16, 200, 11, { size: 9, fill: P.fg3, weight: 700, ls: 1.5 }),
      Pill(380, 10, 'GPT v4.2', P.violet, P.violetDim),
      HR(0, 38, 512, P.border),
      T('Cycle 12 shows strong binding activity in AB-kinase class.', 20, 50, 468, 28, { size: 13, fill: P.fg, lh: 1.6, weight: 500 }),
      T('HLX-4429 is the lead candidate with 94% AI confidence. Recommend advancing to Phase IIb.', 20, 82, 468, 36, { size: 12, fill: P.fg2, lh: 1.6 }),
      T('3 compounds flagged for toxicity review · 6 queued for re-screening', 20, 128, 468, 14, { size: 11, fill: P.amber }),
      F(20, 152, 160, 36, P.accent, { r: 8, ch: [
        T('Full AI Report →', 0, 10, 160, 16, { size: 12, fill: P.white, weight: 700, align: 'center' }),
      ]}),
      F(194, 152, 120, 36, P.surface2, { r: 8, stroke: P.border2, sw: 1, ch: [
        T('Export Data', 0, 10, 120, 16, { size: 12, fill: P.fg, weight: 600, align: 'center' }),
      ]}),
    ],
  }));

  return { id: uid(), name: 'D1 – Research Hub', width: W, height: H, fill: P.bg, children: ch };
}

// ── Desktop Screen 2: Clinical Pipeline ──────────────────────────────────────
function buildDesktop2() {
  const W = 1440, H = 900;
  const ch = [];

  // bg glows
  ch.push(F(300, 0, 500, 300, P.bio + '07', { r: 250 }));
  ch.push(F(900, 400, 300, 300, P.accent + '08', { r: 150 }));

  // Sidebar (same as D1)
  ch.push(F(0, 0, 220, 900, P.surface, { stroke: P.border, sw: 1, ch: [
    F(24, 24, 100, 32, 'transparent', { ch: [
      T('HELIX', 0, 6, 60, 20, { size: 16, fill: P.accent, weight: 900, ls: 3 }),
    ]}),
    T('AI RESEARCH', 24, 50, 140, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.5 }),
    HR(0, 72, 220, P.border),
    ...[
      { icon: '⬡', label: 'Hub', active: false },
      { icon: '◈', label: 'Network', active: false },
      { icon: '⬣', label: 'Compounds', active: false },
      { icon: '◉', label: 'Insights', active: false },
      { icon: '⬙', label: 'Trials', active: true },
      { icon: '◷', label: 'Reports', active: false },
    ].map((n, i) => F(12, 88 + i * 48, 196, 40, n.active ? P.surface2 : 'transparent', {
      r: 8,
      stroke: n.active ? P.border2 : 'transparent', sw: 1,
      ch: [
        T(n.icon, 14, 11, 20, 18, { size: 14, fill: n.active ? P.accent : P.fg3 }),
        T(n.label, 40, 12, 140, 16, { size: 13, fill: n.active ? P.fg : P.fg2, weight: n.active ? 600 : 400 }),
        ...(n.active ? [F(176, 12, 4, 16, P.accent, { r: 2 })] : []),
      ],
    })),
    VR(220, 0, 900, P.border),
  ]}));

  // Topbar
  ch.push(F(220, 0, 1220, 60, P.surface, { stroke: P.border, sw: 1, ch: [
    T('Clinical Pipeline', 24, 18, 240, 22, { size: 18, fill: P.fg, weight: 700 }),
    T('Cycle 12  ·  18 active candidates', 274, 22, 260, 16, { size: 12, fill: P.fg2 }),
    F(980, 14, 120, 32, P.surface2, { r: 8, stroke: P.border2, sw: 1, ch: [
      T('Filter ↓', 0, 8, 120, 16, { size: 12, fill: P.fg2, align: 'center' }),
    ]}),
    F(1112, 14, 110, 32, P.accent, { r: 8, ch: [
      T('Export CSV', 0, 8, 110, 16, { size: 12, fill: P.white, weight: 700, align: 'center' }),
    ]}),
    HR(0, 60, 1220, P.border),
  ]}));

  // Stage header row
  const stages = [
    { label: 'DISCOVERY',  count: 62, color: P.fg3,   x: 0 },
    { label: 'SCREENING',  count: 38, color: P.violet, x: 1 },
    { label: 'PHASE I',    count: 12, color: P.accent, x: 2 },
    { label: 'PHASE II',   count: 8,  color: P.bio,    x: 3 },
    { label: 'PHASE III',  count: 3,  color: P.bio,    x: 4 },
    { label: 'APPROVED',   count: 3,  color: '#FFD700',x: 5 },
  ];

  const colW = 196, colGap = 12, colY = 76;
  stages.forEach((s, i) => {
    const x = 236 + i * (colW + colGap);
    ch.push(F(x, colY, colW, 52, P.surface, {
      r: 10, stroke: s.color + '44', sw: 1,
      ch: [
        F(0, 0, colW, 3, s.color, { r: 10, opacity: 0.7 }),
        T(s.label, 14, 14, colW - 28, 12, { size: 9, fill: s.color, weight: 700, ls: 1.2 }),
        T(String(s.count), 14, 28, 60, 20, { size: 16, fill: P.fg, weight: 800 }),
        T('compounds', 68, 33, 100, 12, { size: 10, fill: P.fg2 }),
      ],
    }));

    // Arrow between stages (not after last)
    if (i < 5) {
      ch.push(T('→', x + colW + 2, colY + 19, 14, 14, { size: 12, fill: P.fg3, align: 'center' }));
    }
  });

  // Compound rows (kanban-style, show top 4 in each stage)
  const compounds = {
    DISCOVERY: [
      { id: 'HLX-9044', score: 52, target: 'BRAF' },
      { id: 'HLX-8831', score: 48, target: 'CDK6' },
      { id: 'HLX-8120', score: 44, target: 'FLT3' },
      { id: 'HLX-7890', score: 41, target: 'ALK' },
    ],
    SCREENING: [
      { id: 'HLX-7714', score: 63, target: 'EGFR' },
      { id: 'HLX-6618', score: 69, target: 'mTOR' },
      { id: 'HLX-5501', score: 72, target: 'HER2' },
      { id: 'HLX-5103', score: 81, target: 'CDK4' },
    ],
    'PHASE I': [
      { id: 'HLX-3871', score: 88, target: 'ERK1/2' },
      { id: 'HLX-3210', score: 85, target: 'AKT1' },
      { id: 'HLX-2900', score: 80, target: 'MEK1' },
    ],
    'PHASE II': [
      { id: 'HLX-4429', score: 94, target: 'AB-Kin' },
      { id: 'HLX-4100', score: 91, target: 'KRAS' },
      { id: 'HLX-3650', score: 87, target: 'RAS' },
    ],
    'PHASE III': [
      { id: 'HLX-1820', score: 96, target: 'PI3Kα' },
      { id: 'HLX-1100', score: 93, target: 'SOS1' },
    ],
    APPROVED: [
      { id: 'HLX-0991', score: 98, target: 'BCR-ABL' },
      { id: 'HLX-0872', score: 97, target: 'ALK' },
      { id: 'HLX-0600', score: 95, target: 'EGFR' },
    ],
  };

  const stageKeys = ['DISCOVERY', 'SCREENING', 'PHASE I', 'PHASE II', 'PHASE III', 'APPROVED'];
  stageKeys.forEach((key, i) => {
    const s = stages[i];
    const x = 236 + i * (colW + colGap);
    const list = compounds[key] || [];
    list.forEach((c, j) => {
      const cy2 = colY + 70 + j * 72;
      ch.push(F(x, cy2, colW, 64, P.surface, {
        r: 10, stroke: s.color + '22', sw: 1,
        ch: [
          E(12, 14, 36, 36, s.color + '22'),
          E(16, 18, 28, 28, s.color + '50'),
          T(String(c.score), 16, 22, 28, 18, { size: 12, fill: s.color, weight: 800, align: 'center' }),
          T(c.id, 58, 10, 124, 14, { size: 11, fill: P.fg, weight: 700 }),
          T(c.target, 58, 28, 80, 12, { size: 10, fill: P.fg2 }),
          Pill(58, 44, key, s.color, s.color + '22'),
        ],
      }));
    });

    // "... X more" footer
    const moreCount = s.count - list.length;
    if (moreCount > 0) {
      const footY = colY + 70 + list.length * 72 + 2;
      ch.push(F(x, footY, colW, 28, 'transparent', {
        ch: [T(`+ ${moreCount} more`, 0, 6, colW, 16, { size: 11, fill: s.color, align: 'center', opacity: 0.6 })],
      }));
    }
  });

  // Bottom: timeline summary chart
  const chartY = 740;
  ch.push(F(236, chartY, 1184, 124, P.surface, {
    r: 12, stroke: P.border, sw: 1,
    ch: [
      T('MONTHLY ADVANCEMENT RATE', 20, 14, 250, 11, { size: 9, fill: P.fg3, weight: 700, ls: 1.5 }),
      T('Compounds advancing stage per month', 280, 14, 260, 11, { size: 10, fill: P.fg2 }),
      HR(0, 36, 1184, P.border),
    ],
  }));

  // Monthly bars (12 months)
  const months = ['A','M','J','J','A','S','O','N','D','J','F','M'];
  const vals = [8, 12, 7, 14, 9, 11, 16, 10, 13, 8, 15, 18];
  const maxV = 20;
  months.forEach((m, i) => {
    const bx = 256 + i * 92;
    const barH = Math.round(60 * (vals[i] / maxV));
    const isLast = i === 11;
    ch.push(F(bx, chartY + 96 - barH, 52, barH, isLast ? P.bio : P.accent, { r: 3, opacity: isLast ? 0.9 : 0.5 }));
    ch.push(T(m, bx, chartY + 100, 52, 12, { size: 9, fill: P.fg3, align: 'center' }));
    ch.push(T(String(vals[i]), bx, chartY + 96 - barH - 16, 52, 12, { size: 9, fill: isLast ? P.bio : P.fg2, align: 'center' }));
  });

  return { id: uid(), name: 'D2 – Clinical Pipeline', width: W, height: H, fill: P.bg, children: ch };
}

// ── Desktop Screen 3: AI Insights ────────────────────────────────────────────
function buildDesktop3() {
  const W = 1440, H = 900;
  const ch = [];

  // bg glows
  ch.push(F(600, 100, 500, 500, P.violet + '08', { r: 250 }));
  ch.push(F(200, 400, 350, 350, P.accent + '07', { r: 175 }));

  // Sidebar
  ch.push(F(0, 0, 220, 900, P.surface, { stroke: P.border, sw: 1, ch: [
    F(24, 24, 100, 32, 'transparent', { ch: [
      T('HELIX', 0, 6, 60, 20, { size: 16, fill: P.accent, weight: 900, ls: 3 }),
    ]}),
    T('AI RESEARCH', 24, 50, 140, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.5 }),
    HR(0, 72, 220, P.border),
    ...[
      { icon: '⬡', label: 'Hub', active: false },
      { icon: '◈', label: 'Network', active: false },
      { icon: '⬣', label: 'Compounds', active: false },
      { icon: '◉', label: 'Insights', active: true },
      { icon: '⬙', label: 'Trials', active: false },
      { icon: '◷', label: 'Reports', active: false },
    ].map((n, i) => F(12, 88 + i * 48, 196, 40, n.active ? P.surface2 : 'transparent', {
      r: 8,
      stroke: n.active ? P.border2 : 'transparent', sw: 1,
      ch: [
        T(n.icon, 14, 11, 20, 18, { size: 14, fill: n.active ? P.accent : P.fg3 }),
        T(n.label, 40, 12, 140, 16, { size: 13, fill: n.active ? P.fg : P.fg2, weight: n.active ? 600 : 400 }),
        ...(n.active ? [F(176, 12, 4, 16, P.accent, { r: 2 })] : []),
      ],
    })),
    VR(220, 0, 900, P.border),
  ]}));

  // Topbar
  ch.push(F(220, 0, 1220, 60, P.surface, { stroke: P.border, sw: 1, ch: [
    T('AI Insights', 24, 18, 200, 22, { size: 18, fill: P.fg, weight: 700 }),
    T('Predictive analytics · Cycle 12', 234, 22, 240, 16, { size: 12, fill: P.fg2 }),
    Pill(870, 18, 'HELIX-GPT v4.2', P.violet, P.violetDim),
    F(986, 14, 140, 32, P.surface2, { r: 8, stroke: P.border2, sw: 1, ch: [
      T('Date Range ↓', 0, 8, 140, 16, { size: 12, fill: P.fg2, align: 'center' }),
    ]}),
    F(1138, 14, 94, 32, P.accent, { r: 8, ch: [
      T('Export', 0, 8, 94, 16, { size: 12, fill: P.white, weight: 700, align: 'center' }),
    ]}),
    HR(0, 60, 1220, P.border),
  ]}));

  // Success Probability Curve (main chart)
  const curveX = 236, curveY = 76, curveW = 740, curveH = 380;
  ch.push(F(curveX, curveY, curveW, curveH, P.surface, {
    r: 16, stroke: P.border, sw: 1,
    ch: [
      T('APPROVAL PROBABILITY CURVES', 20, 18, 320, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.5 }),
      T('AI-predicted probability over trial phases', 340, 18, 280, 12, { size: 10, fill: P.fg2 }),
      HR(0, 42, curveW, P.border),
    ],
  }));

  // Y-axis labels
  [100, 75, 50, 25, 0].forEach((v, i) => {
    const y = curveY + 60 + i * 60;
    ch.push(T(v + '%', curveX + 8, y, 36, 12, { size: 9, fill: P.fg3, align: 'right' }));
    ch.push(HR(curveX + 50, y + 6, curveW - 60, P.border));
  });

  // Curve lines (3 compounds)
  const phases = ['Discovery', 'Screen', 'Phase I', 'Phase II', 'Phase III'];
  const curveData = [
    { id: 'HLX-4429', color: P.bio,    vals: [0.52, 0.74, 0.82, 0.87, 0.94] },
    { id: 'HLX-3871', color: P.accent, vals: [0.44, 0.64, 0.72, 0.80, 0.88] },
    { id: 'HLX-5103', color: P.violet, vals: [0.38, 0.52, 0.63, 0.72, 0.81] },
  ];

  const plotX = curveX + 56, plotW = curveW - 70;
  const plotY = curveY + 66, plotH = 240;
  const phaseSpacing = plotW / 4;

  // Phase labels
  phases.forEach((p, i) => {
    ch.push(T(p, plotX + i * phaseSpacing - 30, curveY + curveH - 32, 80, 12,
      { size: 9, fill: P.fg3, align: 'center' }));
  });

  curveData.forEach((c) => {
    // Draw line segments
    c.vals.forEach((v, i) => {
      if (i === 0) return;
      const x1 = plotX + (i - 1) * phaseSpacing;
      const y1 = plotY + plotH - Math.round(plotH * c.vals[i - 1]);
      const x2 = plotX + i * phaseSpacing;
      const y2 = plotY + plotH - Math.round(plotH * v);
      const dx = x2 - x1, dy = y2 - y1;
      const len = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      ch.push({
        id: uid(), type: 'frame',
        x: x1, y: y1, width: len, height: 2,
        fill: c.color, opacity: 0.8, rotation: angle, children: [],
      });
    });
    // Dot at each point
    c.vals.forEach((v, i) => {
      const px = plotX + i * phaseSpacing;
      const py = plotY + plotH - Math.round(plotH * v);
      ch.push(E(px - 5, py - 5, 10, 10, c.color));
      ch.push(E(px - 3, py - 3, 6, 6, P.bg));
    });
  });

  // Legend
  curveData.forEach((c, i) => {
    const lx = curveX + 80 + i * 200;
    ch.push(F(lx, curveY + curveH - 52, 180, 20, 'transparent', { ch: [
      E(0, 5, 10, 10, c.color),
      T(c.id, 16, 2, 160, 16, { size: 11, fill: P.fg }),
    ]}));
  });

  // Biomarker Correlation Matrix
  const matX = 988, matY = 76, matW = 416, matH = 380;
  const markers = ['Binding', 'ADME', 'Selectivity', 'Toxicity', 'BBB', 'Solubility'];
  const matData = [
    [1.0,  0.74, 0.88, -0.62, 0.51, 0.43],
    [0.74, 1.0,  0.65, -0.48, 0.72, 0.81],
    [0.88, 0.65, 1.0,  -0.55, 0.49, 0.38],
    [-0.62,-0.48,-0.55,1.0,  -0.40,-0.52],
    [0.51, 0.72, 0.49, -0.40, 1.0,  0.64],
    [0.43, 0.81, 0.38, -0.52, 0.64, 1.0 ],
  ];

  ch.push(F(matX, matY, matW, matH, P.surface, {
    r: 16, stroke: P.border, sw: 1,
    ch: [
      T('BIOMARKER CORRELATION MATRIX', 20, 18, 280, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.5 }),
      HR(0, 42, matW, P.border),
    ],
  }));

  const cellSize = 52, gridOffX = matX + 56, gridOffY = matY + 56;
  // Row labels
  markers.forEach((m, i) => {
    ch.push(T(m, matX + 8, gridOffY + i * cellSize + 18, 44, 12, { size: 8, fill: P.fg2, align: 'right' }));
  });
  // Col labels
  markers.forEach((m, i) => {
    ch.push(T(m, gridOffX + i * cellSize + 4, matY + 44, cellSize - 4, 10,
      { size: 7, fill: P.fg2, align: 'center' }));
  });

  matData.forEach((row, ri) => {
    row.forEach((val, ci) => {
      const cx2 = gridOffX + ci * cellSize + 3;
      const cy2 = gridOffY + ri * cellSize + 3;
      const cellW = cellSize - 6;
      const cellH = cellSize - 6;
      const color = val > 0 ? P.bio : P.red;
      const intensity = Math.abs(val);
      ch.push(F(cx2, cy2, cellW, cellH, color + Math.round(intensity * 200).toString(16).padStart(2,'0'), { r: 4 }));
      ch.push(T(val.toFixed(1), cx2, cy2 + 8, cellW, 14,
        { size: 10, fill: intensity > 0.5 ? P.white : P.fg2, weight: 600, align: 'center' }));
    });
  });

  // Bottom row: 3 metric cards
  const metrics = [
    { label: 'MODEL ACCURACY', value: '91.3%', sub: 'Cross-validated AUC', color: P.bio },
    { label: 'DATASET SIZE', value: '2.4M', sub: 'training compounds', color: P.accent },
    { label: 'PREDICTION SPEED', value: '1.2s', sub: 'per compound / avg', color: P.violet },
    { label: 'CYCLE SUCCESS RATE', value: '18.4%', sub: 'vs 11.2% industry avg', color: P.amber },
  ];
  metrics.forEach((m, i) => {
    ch.push(F(236 + i * 302, 472, 294, 136, P.surface, {
      r: 12, stroke: m.color + '44', sw: 1,
      ch: [
        F(0, 0, 294, 4, m.color, { r: 12, opacity: 0.6 }),
        T(m.label, 20, 18, 220, 11, { size: 9, fill: P.fg3, weight: 700, ls: 1.5 }),
        T(m.value, 20, 34, 200, 48, { size: 40, fill: m.color, weight: 900 }),
        T(m.sub, 20, 88, 240, 13, { size: 11, fill: P.fg2 }),
      ],
    }));
  });

  // Feature importance chart
  ch.push(F(236, 624, 742, 240, P.surface, {
    r: 12, stroke: P.border, sw: 1,
    ch: [
      T('FEATURE IMPORTANCE', 20, 16, 200, 11, { size: 9, fill: P.fg3, weight: 700, ls: 1.5 }),
      T('Top predictors for approval', 230, 16, 200, 11, { size: 10, fill: P.fg2 }),
      HR(0, 38, 742, P.border),
    ],
  }));

  const features = [
    { label: 'Binding Affinity (Kd)', pct: 0.89, color: P.bio },
    { label: 'Selectivity Index', pct: 0.84, color: P.bio },
    { label: 'ADME Score', pct: 0.76, color: P.accent },
    { label: 'Structural Novelty', pct: 0.71, color: P.accent },
    { label: 'Toxicity Risk (inverse)', pct: 0.67, color: P.amber },
    { label: 'BBB Permeability', pct: 0.58, color: P.violet },
  ];
  features.forEach((f, i) => {
    const fy = 624 + 50 + i * 30;
    ch.push(T(f.label, 256, fy, 220, 14, { size: 11, fill: P.fg }));
    ch.push(F(490, fy + 2, 400, 10, P.surface3, { r: 5 }));
    ch.push(F(490, fy + 2, Math.round(400 * f.pct), 10, f.color, { r: 5, opacity: 0.75 }));
    ch.push(T(Math.round(f.pct * 100) + '%', 900, fy, 56, 14, { size: 11, fill: f.color, weight: 600, align: 'right' }));
  });

  // AI narrative panel
  ch.push(F(990, 624, 414, 240, P.surface, {
    r: 12, stroke: P.violet + '44', sw: 1,
    ch: [
      F(0, 0, 4, 240, P.violet, { r: 12 }),
      T('MODEL NARRATIVE', 18, 16, 200, 11, { size: 9, fill: P.violet, weight: 700, ls: 1.5 }),
      HR(0, 38, 414, P.border),
      T('"Binding affinity remains the dominant predictor at 89% importance. The current cycle shows an emerging correlation between structural novelty and selectivity — compounds with novel scaffolds are 2.3× more likely to pass Phase II."', 18, 50, 376, 80, { size: 11, fill: P.fg, lh: 1.7 }),
      T('Recommended: Increase screening throughput for novel CDK4/6 inhibitor class.', 18, 140, 376, 36, { size: 11, fill: P.violet, lh: 1.6 }),
      T('Confidence: 87.4% ± 4.2%', 18, 184, 200, 13, { size: 10, fill: P.fg2 }),
      T('Updated: 14:22 today', 18, 200, 200, 13, { size: 10, fill: P.fg3 }),
    ],
  }));

  return { id: uid(), name: 'D3 – AI Insights', width: W, height: H, fill: P.bg, children: ch };
}

// ── Assemble & Write ──────────────────────────────────────────────────────────
const doc = {
  version: '2.8',
  width:   1440,
  height:  900,
  children: [
    buildMobile1(),
    buildMobile2(),
    buildMobile3(),
    buildDesktop1(),
    buildDesktop2(),
    buildDesktop3(),
  ],
};

const outPath = path.join(__dirname, 'helix-app.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log(`✓ helix-app.pen written — ${doc.children.length} screens`);
doc.children.forEach(s => console.log(`  ${s.name}  ${s.width}×${s.height}`));
