'use strict';
// quark-app.js
// QUARK — AI Drug Discovery & Molecular Synthesis Platform
//
// Challenge: Design a dark-mode AI molecular research companion, inspired by:
// 1. "AI Drug Discovery Website — Molecular Data Visualization" (Dribbble popular,
//    March 2026) — scientific data beauty, molecular graph UI, glowing node networks
// 2. Linear.app (darkmodedesign.com) — "designed for the AI era" — clean dark UI
//    with subtle purple accents, AI-first workflows, dense-but-breathable layouts
// 3. Silencio.es (godly.website) — catalog reference numbering (REF: SHH-0001),
//    brutalist precision, catalog-style data grids, monospace identifiers
// 4. Evervault Customers page (godly.website) — ultra-dark cosmic bg, glow halos,
//    glassmorphism panels, encrypted/security-adjacent aesthetic
//
// Trend: Scientific + AI interfaces moving toward "cosmic dark" with electric
// cyan/teal molecular glows, replacing sterile white lab UIs with dramatic deep
// navy backgrounds and neon data visualisations.
//
// Palette: deep space navy #050B14 + electric cyan #06EFC5 + violet #7B61FF
// Screens: 5 mobile (390×844) — Discover · Compound · Synthesis · Binding · Lab

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#050B14',   // deep space navy
  surface:  '#0A1628',   // elevated surface
  surface2: '#0F2040',   // card surface
  surface3: '#142855',   // lighter card
  border:   '#1A3560',   // subtle border
  border2:  '#25487A',   // visible border
  muted:    '#3A6090',   // muted blue-grey
  muted2:   '#6A90B8',   // lighter muted
  fg:       '#E8F4FF',   // cool off-white
  fg2:      '#A8C8E8',   // secondary text
  accent:   '#06EFC5',   // electric cyan-teal (molecular glow)
  accent2:  '#7B61FF',   // violet purple (AI/secondary)
  warn:     '#FFB020',   // amber (caution data)
  danger:   '#FF4560',   // red (toxicity)
  gold:     '#F0C040',   // gold (high-confidence)
};

let _id = 0;
const uid = () => `qk${++_id}`;

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

// ── Reusable Components ───────────────────────────────────────────────────────

// Molecular glow corona
const Glow = (cx, cy, r, color, base = 0.07) => [
  E(cx - r * 2.5, cy - r * 2.5, r * 5,   r * 5,   color, { opacity: base * 0.3 }),
  E(cx - r * 1.6, cy - r * 1.6, r * 3.2, r * 3.2, color, { opacity: base * 0.6 }),
  E(cx - r,       cy - r,       r * 2,   r * 2,   color, { opacity: base }),
  E(cx - r * 0.4, cy - r * 0.4, r * 0.8, r * 0.8, color, { opacity: base * 1.8 }),
];

// Reference tag — Silencio-inspired catalog numbering
const RefTag = (x, y, ref) => F(x, y, ref.length * 7.2 + 16, 20, P.surface2, {
  r: 4, stroke: P.border2, sw: 1,
  ch: [T(ref, 8, 4, ref.length * 7.2, 12, { size: 9, fill: P.muted2, weight: 600, ls: 1 })],
});

// Confidence badge
const ConfBadge = (x, y, score, color) => F(x, y, 56, 24, color + '1A', {
  r: 12, stroke: color + '44', sw: 1,
  ch: [
    T(score + '%', 0, 5, 56, 14, { size: 10, fill: color, weight: 700, align: 'center' }),
  ],
});

// Stat card
const StatCard = (x, y, w, h, label, value, sub, color) => F(x, y, w, h, P.surface2, {
  r: 12, stroke: P.border, sw: 1,
  ch: [
    T(label, 12, 10, w - 24, 10, { size: 8, fill: P.muted2, ls: 1.5, weight: 700 }),
    T(value, 12, 24, w - 24, 28, { size: 22, fill: color, weight: 800 }),
    T(sub,   12, 54, w - 24, 12, { size: 9, fill: P.fg2 }),
  ],
});

// Molecule node (the visualisation building block)
const MolNode = (cx, cy, r, symbol, color, filled = true) => [
  E(cx - r, cy - r, r * 2, r * 2, filled ? color : P.surface2, {
    stroke: color, sw: filled ? 0 : 1.5, opacity: filled ? 0.9 : 1,
  }),
  T(symbol, cx - r, cy - r + r * 0.55, r * 2, r * 0.9, {
    size: Math.max(8, r * 0.7), fill: filled ? P.bg : color, weight: 800, align: 'center',
  }),
];

// Bond line between two nodes
const Bond = (x1, y1, x2, y2, color = P.muted2, alpha = '88') =>
  F(Math.min(x1, x2), Math.min(y1, y2) - 1,
    Math.max(1, Math.abs(x2 - x1)), Math.max(1, Math.abs(y2 - y1)) + 2,
    color + alpha, {});

// Thin connecting line (using frame approximation)
const BondLine = (x1, y1, x2, y2, color = P.border2) => {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 2) return F(x1, y1, 2, 1, color, {});
  // Use horizontal line at midpoint as approximation
  return F(Math.min(x1, x2), Math.min(y1, y2), Math.abs(dx) || 2, Math.max(Math.abs(dy), 1), color, { opacity: 0.5 });
};

// Bottom nav
const BottomNav = (activeIdx) => F(0, 764, 390, 80, P.surface, {
  ch: [
    Line(0, 0, 390, P.border2),
    ...[
      ['◈', 'Discover', 0],
      ['⬡', 'Compound', 1],
      ['⚗', 'Synthesis', 2],
      ['⊕', 'Binding', 3],
      ['✦', 'Lab', 4],
    ].map(([ic, lb, j]) => {
      const nx = j * 78;
      const isActive = j === activeIdx;
      return [
        isActive ? F(nx + 14, 4, 50, 56, P.accent + '14', { r: 14 }) : null,
        T(ic, nx + 18, 12, 42, 22, { size: 16, fill: isActive ? P.accent : P.muted, align: 'center' }),
        T(lb, nx + 2, 38, 74, 12, { size: 8, fill: isActive ? P.accent : P.muted, align: 'center', weight: isActive ? 700 : 400, ls: 0.3 }),
      ].filter(Boolean);
    }).flat(),
  ],
});

// Status bar
const StatusBar = (title, ref) => F(0, 0, 390, 64, P.bg, {
  ch: [
    T('QUARK', 20, 18, 80, 16, { size: 12, fill: P.accent, weight: 900, ls: 3 }),
    T(ref || '', 110, 21, 160, 12, { size: 9, fill: P.muted2, ls: 1 }),
    F(334, 14, 36, 36, P.surface2, { r: 18, stroke: P.border, sw: 1, ch: [
      T('AI', 7, 10, 22, 16, { size: 10, fill: P.accent2, weight: 800, ls: 1 }),
    ]}),
    Line(0, 63, 390, P.border),
  ],
});

// ── Screen 1: Discover ────────────────────────────────────────────────────────
function screenDiscover(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(195, 180, 130, P.accent, 0.05),
    ...Glow(50, 600, 80, P.accent2, 0.04),

    // Fine dot grid
    ...[60, 120, 180, 240, 300, 360, 420, 480, 540, 600, 660, 720].map(y =>
      F(0, y, 390, 1, P.border + '18', {})
    ),

    StatusBar('Discover', 'MOLECULAR DISCOVERY ENGINE'),

    // Hero search
    T('DISCOVER', 20, 76, 300, 40, { size: 34, fill: P.fg, weight: 900, ls: 2 }),
    T('AI-powered drug target identification', 20, 118, 320, 16, { size: 12, fill: P.fg2 }),

    // Search input
    F(20, 144, 350, 48, P.surface2, {
      r: 12, stroke: P.accent + '44', sw: 1.5,
      ch: [
        T('◈', 14, 14, 20, 20, { size: 15, fill: P.accent }),
        T('Search compounds, targets, pathways...', 40, 14, 260, 20, { size: 13, fill: P.muted2 }),
        F(318, 10, 28, 28, P.accent + '22', { r: 8, ch: [
          T('⌘K', 4, 7, 20, 14, { size: 9, fill: P.accent, weight: 700, ls: 0.5 }),
        ]}),
      ],
    }),

    // Quick filter pills
    ...[
      ['All', true],
      ['FDA Approved', false],
      ['Phase III', false],
      ['Oncology', false],
    ].map(([label, active], i) =>
      F(20 + i * 88, 204, 80, 26, active ? P.accent : P.surface2, {
        r: 13, stroke: active ? P.accent : P.border,
        ch: [T(label, 0, 6, 80, 14, { size: 10, fill: active ? P.bg : P.fg2, weight: active ? 700 : 400, align: 'center' })],
      })
    ),

    // AI insight card
    F(20, 244, 350, 68, P.accent2 + '0F', {
      r: 12, stroke: P.accent2 + '33', sw: 1,
      ch: [
        T('✦ AI INSIGHT', 14, 10, 140, 12, { size: 9, fill: P.accent2, weight: 800, ls: 2 }),
        T('17 new compounds match your EGFR inhibitor\nresearch profile from last session', 14, 26, 322, 32, { size: 12, fill: P.fg, lh: 1.5 }),
      ],
    }),

    // Recent / Trending compounds
    T('TRENDING TARGETS', 20, 328, 200, 12, { size: 9, fill: P.muted2, ls: 2, weight: 700 }),
    T('Updated 4m ago →', 266, 328, 104, 12, { size: 9, fill: P.accent, align: 'right' }),

    ...[
      { ref: 'QRK-2847', name: 'Lorlatinib Variant 7', target: 'ALK/ROS1 inhibitor', phase: 'Phase II', conf: 94, color: P.accent },
      { ref: 'QRK-2201', name: 'Compound SX-441B', target: 'CDK4/6 cell cycle', phase: 'Preclinical', conf: 87, color: P.accent },
      { ref: 'QRK-1994', name: 'EGFR-T790M Blocker', target: 'Lung cancer EGFR mutant', phase: 'Phase III', conf: 99, color: P.gold },
      { ref: 'QRK-3102', name: 'BCL-2 Modulator', target: 'Apoptosis pathway', phase: 'Preclinical', conf: 71, color: P.accent2 },
    ].map(({ ref, name, target, phase, conf, color }, i) =>
      F(20, 350 + i * 82, 350, 70, P.surface2, {
        r: 12, stroke: i === 2 ? P.gold + '44' : P.border, sw: 1,
        ch: [
          RefTag(12, 10, ref),
          T(name, 12, 36, 220, 15, { size: 13, fill: P.fg, weight: 700 }),
          T(target, 12, 54, 230, 13, { size: 11, fill: P.fg2 }),
          ConfBadge(280, 10, conf, color),
          F(280, 36, 62, 20, P.surface3, { r: 10, ch: [
            T(phase, 4, 4, 54, 12, { size: 8, fill: P.fg2, weight: 600, ls: 0.3, align: 'center' }),
          ]}),
        ],
      })
    ),

    BottomNav(0),
  ]});
}

// ── Screen 2: Compound Detail ─────────────────────────────────────────────────
function screenCompound(ox) {
  // Molecule visualization: draw EGFR-T790M Blocker structural formula
  const MC = 195; // center x
  const MY = 240; // center y

  // Atoms: [cx, cy, symbol, color, filled, size]
  const atoms = [
    [MC,      MY,      'N',  P.accent2,  true,  16],
    [MC+50,   MY-30,   'C',  P.fg2,      false, 14],
    [MC+90,   MY,      'N',  P.accent2,  true,  14],
    [MC+80,   MY+44,   'C',  P.fg2,      false, 14],
    [MC+30,   MY+60,   'C',  P.fg2,      false, 14],
    [MC-30,   MY+60,   'O',  P.danger,   true,  14],
    [MC-80,   MY+44,   'C',  P.fg2,      false, 12],
    [MC-90,   MY,      'F',  P.accent,   true,  14],
    [MC-50,   MY-30,   'C',  P.fg2,      false, 14],
    [MC,      MY-70,   'C',  P.fg2,      false, 12],
    [MC+30,   MY-80,   'Cl', P.warn,     true,  14],
    [MC-30,   MY-80,   'H',  P.muted2,   false, 10],
  ];

  // Bond lines (pairs of atom indices)
  const bondPairs = [
    [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,0],
    [0,9],[9,10],[9,11],[1,9],[3,6],[4,8],
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(MC, MY, 110, P.accent, 0.06),
    ...Glow(MC, MY, 60, P.accent2, 0.04),

    // Back + header
    F(0, 0, 390, 64, P.bg, { ch: [
      T('← Back', 20, 22, 60, 20, { size: 13, fill: P.accent }),
      T('Compound', 110, 22, 170, 20, { size: 14, fill: P.fg, weight: 700, align: 'center' }),
      RefTag(264, 22, 'QRK-1994'),
      Line(0, 63, 390, P.border),
    ]}),

    // Compound name + classification
    T('EGFR-T790M\nBLOCKER', 20, 76, 270, 52, { size: 22, fill: P.fg, weight: 900, ls: 0.5, lh: 1.2 }),
    ConfBadge(300, 80, 99, P.gold),
    F(300, 108, 68, 20, P.gold + '1A', { r: 10, ch: [
      T('PHASE III', 4, 4, 60, 12, { size: 8, fill: P.gold, weight: 700, ls: 0.5, align: 'center' }),
    ]}),

    // Molecule canvas
    F(20, 140, 350, 200, P.surface2, { r: 16, stroke: P.border2, sw: 1, ch: [
      // Subtle molecular grid
      ...[40, 80, 120, 160].map(y => F(0, y, 350, 1, P.border + '33', {})),
      ...[70, 140, 210, 280].map(x => F(x, 0, 1, 200, P.border + '33', {})),

      // Bond lines (simple connecting rectangles)
      ...bondPairs.map(([a, b]) => {
        const [x1, y1] = [atoms[a][0] - 20 - 0, atoms[a][1] - 140];
        const [x2, y2] = [atoms[b][0] - 20 - 0, atoms[b][1] - 140];
        const mx = Math.min(x1, x2), my = Math.min(y1, y2);
        const mw = Math.max(Math.abs(x2 - x1), 2);
        const mh = Math.max(Math.abs(y2 - y1), 2);
        return F(mx, my, mw, mh, P.muted2, { opacity: 0.3 });
      }),

      // Atom nodes
      ...atoms.flatMap(([cx, cy, sym, color, filled, r]) =>
        MolNode(cx - 20, cy - 140, r, sym, color, filled)
      ),

      // Label
      T('3D STRUCTURE PREVIEW', 0, 180, 350, 12, { size: 8, fill: P.muted, weight: 700, ls: 2, align: 'center' }),
    ]}),

    // Properties grid
    T('MOLECULAR PROPERTIES', 20, 356, 260, 12, { size: 9, fill: P.muted2, ls: 2, weight: 700 }),

    ...[
      ['MW', '412.4 g/mol', P.fg2],
      ['LogP', '3.21',       P.accent2],
      ['TPSA', '87.3 Å²',   P.accent],
      ['HBD', '2',           P.fg2],
      ['HBA', '6',           P.fg2],
      ['RB',  '4',           P.fg2],
    ].reduce((rows, item, i) => {
      if (i % 3 === 0) rows.push([]);
      rows[rows.length - 1].push(item);
      return rows;
    }, []).map((row, ri) =>
      row.map(([label, value, color], ci) =>
        F(20 + ci * 118, 374 + ri * 56, 110, 48, P.surface2, {
          r: 10, stroke: P.border, sw: 1,
          ch: [
            T(label, 10, 8, 90, 11, { size: 8, fill: P.muted2, ls: 1.5, weight: 700 }),
            T(value, 10, 22, 90, 16, { size: 14, fill: color, weight: 700 }),
          ],
        })
      )
    ).flat(),

    // Bioactivity
    T('BIOACTIVITY', 20, 494, 200, 12, { size: 9, fill: P.muted2, ls: 2, weight: 700 }),
    ...[
      ['IC₅₀ (EGFR T790M)', '0.8 nM', P.accent, 95],
      ['IC₅₀ (EGFR WT)',    '82 nM',  P.warn,   30],
      ['Selectivity index',  '102×',   P.gold,   85],
    ].map(([label, value, color, pct], i) =>
      F(20, 512 + i * 56, 350, 46, P.surface, {
        r: 10, stroke: P.border, sw: 1,
        ch: [
          T(label, 12, 8, 200, 13, { size: 11, fill: P.fg }),
          T(value, 280, 8, 60, 13, { size: 12, fill: color, weight: 700, align: 'right' }),
          F(12, 28, 326, 6, P.surface3, { r: 3, ch: [
            F(0, 0, Math.round(326 * pct / 100), 6, color, { r: 3 }),
          ]}),
        ],
      })
    ),

    // Action buttons
    F(20, 688, 167, 48, P.accent, { r: 12, ch: [
      T('⚗ Run Synthesis', 0, 15, 167, 18, { size: 12, fill: P.bg, weight: 800, align: 'center', ls: 0.5 }),
    ]}),
    F(203, 688, 167, 48, P.accent2 + '22', { r: 12, stroke: P.accent2 + '55', sw: 1, ch: [
      T('⊕ Add to Lab', 0, 15, 167, 18, { size: 12, fill: P.accent2, weight: 700, align: 'center' }),
    ]}),

    BottomNav(1),
  ]});
}

// ── Screen 3: Synthesis Route ─────────────────────────────────────────────────
function screenSynthesis(ox) {
  const steps = [
    { step: '01', reagent: 'Starting Material', desc: '2-Amino-4-chloro-5-fluoropyrimidine', type: 'SM', color: P.fg2 },
    { step: '02', reagent: 'Suzuki Coupling',   desc: 'Pd(PPh₃)₄, Na₂CO₃, DMF 80°C 12h',  type: 'RXN', color: P.accent },
    { step: '03', reagent: 'Boc Protection',    desc: '(Boc)₂O, DMAP, TEA, DCM rt 2h',     type: 'PRO', color: P.accent2 },
    { step: '04', reagent: 'SNAr Amination',    desc: 'Morpholine, DIPEA, NMP 120°C 8h',   type: 'RXN', color: P.accent },
    { step: '05', reagent: 'Deprotection',      desc: 'TFA/DCM 1:1 rt 1h → free amine',    type: 'DEP', color: P.warn },
    { step: '06', reagent: 'Final Product',     desc: 'EGFR-T790M Blocker QRK-1994',       type: 'PROD', color: P.gold },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(195, 100, 100, P.accent2, 0.05),

    F(0, 0, 390, 64, P.bg, { ch: [
      T('← Back', 20, 22, 60, 20, { size: 13, fill: P.accent }),
      T('Synthesis Route', 110, 22, 170, 20, { size: 14, fill: P.fg, weight: 700, align: 'center' }),
      Line(0, 63, 390, P.border),
    ]}),

    T('SYNTHESIS', 20, 76, 260, 28, { size: 24, fill: P.fg, weight: 900, ls: 3 }),
    T('6-step route · AI-optimised · 31% overall yield', 20, 108, 300, 14, { size: 11, fill: P.fg2 }),

    // AI yield optimisation card
    F(20, 130, 350, 52, P.accent + '0D', { r: 12, stroke: P.accent + '2A', sw: 1, ch: [
      T('✦ AI OPTIMISATION', 14, 8, 180, 11, { size: 8, fill: P.accent, weight: 800, ls: 2 }),
      T('Swap Step 02 reagent → Pd₂(dba)₃ to increase yield +12%', 14, 24, 320, 13, { size: 11, fill: P.fg }),
      T('Apply →', 302, 24, 40, 13, { size: 10, fill: P.accent, weight: 700 }),
    ]}),

    // Step-by-step synthesis route
    ...steps.map(({ step, reagent, desc, type, color }, i) => [
      // Arrow connector (except last)
      i < steps.length - 1 ? [
        F(31, 200 + i * 96 + 66, 2, 14, P.muted2, { opacity: 0.5 }),
        T('↓', 26, 200 + i * 96 + 74, 12, 14, { size: 12, fill: P.muted2, opacity: 0.7 }),
      ] : [],

      // Step card
      F(20, 200 + i * 96, 350, 64, i === 5 ? P.gold + '0A' : P.surface2, {
        r: 12, stroke: i === 5 ? P.gold + '44' : i === 4 ? P.warn + '33' : P.border, sw: 1,
        ch: [
          // Step number
          F(12, 18, 28, 28, color + '1A', { r: 8, ch: [
            T(step, 0, 6, 28, 16, { size: 11, fill: color, weight: 800, align: 'center', ls: 0.5 }),
          ]}),
          T(reagent, 50, 10, 210, 14, { size: 12, fill: P.fg, weight: 700 }),
          T(desc, 50, 28, 242, 13, { size: 10, fill: P.fg2 }),
          F(300, 14, 36, 18, color + '1A', { r: 9, ch: [
            T(type, 4, 3, 28, 12, { size: 8, fill: color, weight: 700, ls: 0.5, align: 'center' }),
          ]}),
          // Temperature/time pill for reactions
          ['RXN', 'PRO', 'DEP'].includes(type) ? F(300, 36, 36, 16, P.surface3, { r: 8, ch: [
            T(i === 1 ? '80°C' : i === 2 ? 'rt' : i === 3 ? '120°' : 'rt', 2, 3, 32, 10, { size: 8, fill: P.muted2, align: 'center' }),
          ]}) : null,
        ].filter(Boolean),
      }),
    ]).flat(2),

    BottomNav(2),
  ]});
}

// ── Screen 4: Binding Analysis ────────────────────────────────────────────────
function screenBinding(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(195, 320, 140, P.accent, 0.06),
    ...Glow(195, 320, 70, P.accent2, 0.04),

    StatusBar('Binding', 'PROTEIN-LIGAND DOCKING'),

    // Title
    T('BINDING\nANALYSIS', 20, 76, 270, 52, { size: 22, fill: P.fg, weight: 900, ls: 1, lh: 1.15 }),
    T('EGFR kinase domain · T790M mutation', 20, 132, 310, 14, { size: 11, fill: P.fg2 }),

    // Docking score display
    F(20, 156, 350, 100, P.surface2, { r: 16, stroke: P.accent + '33', sw: 1, ch: [
      ...Glow(175, 50, 55, P.accent, 0.08),
      T('DOCKING SCORE', 0, 14, 350, 12, { size: 9, fill: P.muted2, weight: 700, ls: 2, align: 'center' }),
      T('−9.4', 0, 28, 350, 48, { size: 44, fill: P.accent, weight: 900, align: 'center', ls: 2 }),
      T('kcal/mol · Excellent binding affinity', 0, 76, 350, 14, { size: 11, fill: P.fg2, align: 'center' }),
    ]}),

    // Radar / binding chart — simplified as bars
    T('INTERACTION PROFILE', 20, 274, 260, 12, { size: 9, fill: P.muted2, ls: 2, weight: 700 }),

    ...[
      ['Hydrogen bonds',   8,  12, P.accent],
      ['Hydrophobic',      10, 12, P.accent2],
      ['π-π stacking',     5,  12, P.gold],
      ['Van der Waals',    14, 16, P.accent],
      ['Electrostatic',    3,  12, P.danger],
      ['Water-mediated',   4,  10, P.warn],
    ].map(([label, count, max, color], i) =>
      F(20, 294 + i * 44, 350, 36, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
        T(label, 12, 11, 162, 14, { size: 11, fill: P.fg }),
        T(String(count), 320, 11, 20, 14, { size: 12, fill: color, weight: 700 }),
        F(12, 28, 290, 5, P.surface3, { r: 3, ch: [
          F(0, 0, Math.round(290 * count / max), 5, color, { r: 3 }),
        ]}),
      ]})
    ),

    // Key residues
    T('KEY BINDING RESIDUES', 20, 574, 260, 12, { size: 9, fill: P.muted2, ls: 2, weight: 700 }),
    F(20, 592, 350, 64, P.surface2, { r: 12, stroke: P.border, sw: 1, ch: [
      T('Met790', 12, 10, 60, 13, { size: 10, fill: P.accent, weight: 700 }),
      T('Thr854', 82, 10, 60, 13, { size: 10, fill: P.accent2, weight: 700 }),
      T('Lys745', 152, 10, 60, 13, { size: 10, fill: P.gold, weight: 700 }),
      T('Asp855', 222, 10, 60, 13, { size: 10, fill: P.warn, weight: 700 }),
      T('Cys797', 292, 10, 60, 13, { size: 10, fill: P.fg2, weight: 700 }),
      T('HB donor · gatekeeper residue · covalent anchor candidate', 12, 30, 326, 14, { size: 10, fill: P.fg2, lh: 1.4 }),
      T('Binding pocket volume: 418 Å³', 12, 48, 200, 12, { size: 10, fill: P.muted2 }),
    ]}),

    // Compare button
    F(20, 674, 350, 52, P.accent, { r: 12, ch: [
      T('Compare 3 Selected Compounds', 0, 16, 350, 20, { size: 13, fill: P.bg, weight: 800, align: 'center' }),
    ]}),

    BottomNav(3),
  ]});
}

// ── Screen 5: Research Lab ────────────────────────────────────────────────────
function screenLab(ox) {
  const entries = [
    { ref: 'QRK-1994', tag: 'BREAKTHROUGH', note: 'T790M selectivity confirmed in cellular assay. 102× window over WT EGFR. Schedule IND-enabling tox.', ts: '09:14', color: P.gold },
    { ref: 'QRK-2847', tag: 'HYPOTHESIS',   note: 'ALK variant 7 shows unusual DFG-out binding. May explain resistance mechanism in 2nd-gen inhibitors.', ts: '08:30', color: P.accent2 },
    { ref: 'QRK-2201', tag: 'SYNTHESIS',    note: 'Step 3 yield improved to 78% using Pd₂(dba)₃. AI suggestion validated. Scaling to 50g batch next.', ts: '07:55', color: P.accent },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(340, 120, 90, P.accent2, 0.05),

    StatusBar('Lab Notes', 'RESEARCH LOG'),

    // Header
    T('RESEARCH\nLAB', 20, 76, 240, 52, { size: 22, fill: P.fg, weight: 900, ls: 1, lh: 1.15 }),
    T('FRIDAY, MARCH 21, 2026', 20, 130, 260, 13, { size: 9, fill: P.muted2, weight: 700, ls: 1.5 }),

    // Active compounds strip
    T('ACTIVE COMPOUNDS', 20, 154, 200, 11, { size: 8, fill: P.muted2, ls: 2, weight: 700 }),
    ...[
      ['QRK-1994', P.gold],
      ['QRK-2847', P.accent2],
      ['QRK-2201', P.accent],
      ['QRK-3102', P.warn],
    ].map(([ref, color], i) =>
      F(20 + i * 84, 170, 76, 28, color + '18', {
        r: 14, stroke: color + '44', sw: 1,
        ch: [T(ref, 0, 7, 76, 14, { size: 9, fill: color, weight: 700, align: 'center', ls: 0.5 })],
      })
    ),

    // New note input
    F(20, 212, 350, 64, P.surface2, {
      r: 12, stroke: P.accent + '44', sw: 1.5,
      ch: [
        T('+ Add research note or observation...', 14, 10, 300, 16, { size: 12, fill: P.muted }),
        T('Tag compound ↗', 14, 34, 140, 16, { size: 10, fill: P.muted }),
        T('AI assist ✦', 204, 34, 80, 16, { size: 10, fill: P.accent2 }),
        T('Save', 298, 32, 40, 18, { size: 11, fill: P.accent, weight: 700 }),
      ],
    }),

    // Research log entries
    T('TODAY\'S LOG', 20, 292, 180, 11, { size: 8, fill: P.muted2, ls: 2, weight: 700 }),

    ...entries.map(({ ref, tag, note, ts, color }, i) =>
      F(20, 312 + i * 120, 350, 108, P.surface2, {
        r: 14, stroke: i === 0 ? color + '44' : P.border, sw: 1,
        ch: [
          RefTag(12, 12, ref),
          F(86, 12, tag.length * 6.8 + 16, 20, color + '1A', { r: 10, ch: [
            T(tag, 8, 4, tag.length * 6.8, 12, { size: 9, fill: color, weight: 700, ls: 0.5 }),
          ]}),
          T(note, 12, 38, 326, 52, { size: 12, fill: P.fg, lh: 1.55 }),
          T(ts, 12, 90, 50, 11, { size: 9, fill: P.muted }),
          T('✦ AI generated 2 connections', 70, 90, 200, 11, { size: 9, fill: P.accent2 }),
        ],
      })
    ),

    // FAB new note
    F(306, 692, 64, 64, P.accent, { r: 32, ch: [
      T('+', 0, 14, 64, 36, { size: 28, fill: P.bg, weight: 900, align: 'center' }),
    ]}),

    BottomNav(4),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// ASSEMBLE & SAVE
// ══════════════════════════════════════════════════════════════════════════════
const SCREEN_W = 390;
const GAP      = 80;

const doc = {
  version: '2.8',
  name: 'QUARK — AI Drug Discovery Platform',
  width:  5 * SCREEN_W + 6 * GAP,
  height: 844,
  fill:   '#050B14',
  children: [
    screenDiscover   (GAP),
    screenCompound   (GAP + (SCREEN_W + GAP)),
    screenSynthesis  (GAP + (SCREEN_W + GAP) * 2),
    screenBinding    (GAP + (SCREEN_W + GAP) * 3),
    screenLab        (GAP + (SCREEN_W + GAP) * 4),
  ],
};

const outPath = path.join(__dirname, 'quark.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log('✓ quark.pen written —', Math.round(fs.statSync(outPath).size / 1024) + 'KB');
console.log('  5 screens: Discover · Compound · Synthesis · Binding · Lab');
console.log('  Palette: deep navy #050B14 · electric cyan #06EFC5 · violet #7B61FF');
