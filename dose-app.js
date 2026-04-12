// dose-app.js — DOSE: Precision Skincare Intelligence
//
// Inspiration:
//   1. Overlay (lapa.ninja, Apr 2026) — "Beauty is Automated" — ultra-clean white bg,
//      radial/orbital diagnostic labels floating around a central face/product image.
//      Clinical precision applied to cosmetics: medical-grade aesthetic, thin hairline
//      rules, monospaced data labels orbiting a focal point.
//   2. VAST SOTD (awwwards.com, Apr 1 2026) by Antinomy Studio — 2-color editorial
//      maximalism: deep charcoal + blazing orange. Huge display type, near-zero clutter.
//      Imported: the "mono-accent on pale ground" principle.
//   3. Isa de Burgh & KOMETA (minimal.gallery, Apr 2026) — Editorial white,
//      stacked service listing, crisp sans-serif, no decoration except structural rules.
//
// Challenge: Design a precision skincare formulation OS for skin-obsessed founders.
//   Style push: "Orbital/satellite UI in mobile" — central circular focal element
//   with diagnostic labels orbiting it at calculated angles. Clinical-white ground,
//   teal precision accent, zero gradients, thin structural hairlines. Inspired by
//   Overlay's radial diagnostic pattern — never used this in a mobile design before.
//
// Theme: LIGHT — #F5F3EF off-white + #1A1A1F ink + #00A896 clinical teal
// Screens: 5 — Analyze, Formula, Routine, Lab, Progress

'use strict';
const fs = require('fs');
const W = 390, H = 844;
let idC = 1;
const uid = () => `c${idC++}`;

const p = {
  bg:          '#F5F3EF',
  surface:     '#FFFFFF',
  surfaceAlt:  '#F0EDE8',
  text:        '#1A1A1F',
  textSub:     '#6B6F78',
  textFaint:   '#AEAFB3',
  accent:      '#00A896',
  accentLight: '#E5F6F4',
  accentDark:  '#007A6C',
  ink:         '#1A1A1F',
  border:      '#E2DDD7',
  borderLight: '#EDE9E4',
  white:       '#FFFFFF',
  warm:        '#D4B896',   // warm skin tone for scan elements
  warmLight:   '#F7EDE3',
  red:         '#E05252',
  yellow:      '#F5C842',
};

const el = (type, x, y, w, h, props = {}) =>
  ({ id: uid(), type, x, y, width: w, height: h, ...props });

const rect = (x, y, w, h, fill, r = 0, props = {}) =>
  el('rectangle', x, y, w, h, { fill, cornerRadius: r, strokeWidth: 0, ...props });

const text = (x, y, w, h, content, size, weight, color, align = 'left', props = {}) =>
  el('text', x, y, w, h, {
    content, fontSize: size, fontWeight: weight, color,
    textAlign: align, strokeWidth: 0, ...props
  });

const line = (x1, y1, x2, y2, color, thick = 0.5) =>
  el('line', x1, y1, Math.abs(x2 - x1) || 1, Math.abs(y2 - y1) || 1, {
    strokeColor: color, strokeWidth: thick,
    points: [{ x: 0, y: 0 }, { x: x2 - x1, y: y2 - y1 }],
    fill: 'transparent'
  });

const circle = (cx, cy, r, fill, stroke, strokeW = 0) =>
  el('ellipse', cx - r, cy - r, r * 2, r * 2, {
    fill, strokeColor: stroke || 'transparent', strokeWidth: strokeW
  });

// Orbital satellite: a pill/tag at a given angle + radius from center
const orbitTag = (cx, cy, radius, angleDeg, label, value, color = p.accent) => {
  const a = angleDeg * Math.PI / 180;
  const tx = cx + radius * Math.cos(a);
  const ty = cy + radius * Math.sin(a);
  // connector line from center to tag
  const connLen = radius - 30;
  const lx2 = cx + connLen * Math.cos(a);
  const ly2 = cy + connLen * Math.sin(a);
  const tagW = 80, tagH = 28;
  return [
    // hairline from orbit edge to tag
    {
      id: uid(), type: 'line',
      x: cx + 26 * Math.cos(a), y: cy + 26 * Math.sin(a),
      width: Math.abs(lx2 - (cx + 26 * Math.cos(a))) || 1,
      height: Math.abs(ly2 - (cy + 26 * Math.sin(a))) || 1,
      strokeColor: p.border, strokeWidth: 0.75, fill: 'transparent',
      points: [{ x: 0, y: 0 }, {
        x: lx2 - (cx + 26 * Math.cos(a)),
        y: ly2 - (cy + 26 * Math.sin(a))
      }]
    },
    // tag pill
    rect(tx - tagW / 2, ty - tagH / 2, tagW, tagH, p.white, 14,
      { strokeColor: color, strokeWidth: 1 }),
    text(tx - tagW / 2 + 4, ty - 10, tagW - 8, 10, value,
      9, 700, color, 'center'),
    text(tx - tagW / 2 + 4, ty + 1, tagW - 8, 10, label,
      7.5, 400, p.textSub, 'center'),
  ];
};

const screen = (name, children) => ({
  id: uid(), name,
  width: W, height: H,
  backgroundColor: p.bg,
  children
});

// ─── STATUS BAR ────────────────────────────────────────────
const statusBar = () => [
  text(20, 14, 80, 18, '9:41', 12, 600, p.text, 'left'),
  text(W - 70, 14, 60, 18, '●●● ▲', 10, 400, p.text, 'right'),
];

// ─── NAV BAR ───────────────────────────────────────────────
const navBar = () => {
  const items = [
    { icon: '◎', label: 'Analyze' },
    { icon: '◈', label: 'Formula' },
    { icon: '◷', label: 'Routine' },
    { icon: '◻', label: 'Lab' },
    { icon: '◉', label: 'Progress' },
  ];
  const iW = W / 5;
  return [
    rect(0, H - 72, W, 72, p.white, 0,
      { strokeColor: p.border, strokeWidth: 0.5 }),
    ...items.flatMap((item, i) => [
      text(i * iW, H - 52, iW, 18, item.icon, 16, 400,
        i === 0 ? p.accent : p.textFaint, 'center'),
      text(i * iW, H - 32, iW, 14, item.label, 8, 400,
        i === 0 ? p.accent : p.textFaint, 'center'),
    ]),
    // active dot
    rect(iW * 0 + iW / 2 - 2, H - 68, 4, 4, p.accent, 2),
  ];
};

// ═══════════════════════════════════════════════════════════
// SCREEN 1 — ANALYZE
// ═══════════════════════════════════════════════════════════
const screen1 = () => {
  const cx = W / 2, cy = 310;

  // orbital satellites
  const tags = [
    ...orbitTag(cx, cy, 130, -80,  'Moisture',  '68%',  p.accent),
    ...orbitTag(cx, cy, 130, -15,  'Elastin',   'A+',   p.accent),
    ...orbitTag(cx, cy, 130,  50,  'Texture',   '74%',  p.accentDark),
    ...orbitTag(cx, cy, 130, 120,  'UV Index',  '34',   p.warm),
    ...orbitTag(cx, cy, 130, 185,  'Oil-Water', '52:48', p.accentDark),
    ...orbitTag(cx, cy, 130, 250,  'Pores',     '0.3mm', p.textSub),
  ];

  return screen('Analyze', [
    ...statusBar(),
    // header
    text(20, 48, 200, 22, 'DOSE', 18, 800, p.text, 'left'),
    text(20, 72, 200, 14, 'Skin Intelligence OS', 10, 400, p.textSub, 'left'),
    // scan label
    text(W - 120, 48, 110, 22, '↻  RE-SCAN', 10, 600, p.accent, 'right'),

    // Thin rule
    rect(20, 94, W - 40, 0.5, p.border),

    // Scan CTA label
    text(20, 106, W - 40, 16, 'SKIN ANALYSIS  ·  LAST SCAN 2H AGO', 8, 600, p.textFaint, 'center'),

    // Outer orbit ring
    circle(cx, cy, 118, 'transparent', p.border, 0.75),
    circle(cx, cy, 90, 'transparent', p.borderLight, 0.5),
    // Core face circle — warm skin tone disc
    circle(cx, cy, 60, p.warmLight, p.warm, 1.5),
    // Inner initials / scan indicator
    text(cx - 20, cy - 14, 40, 28, '◎', 22, 400, p.warm, 'center'),
    text(cx - 40, cy + 12, 80, 12, 'SCANNING', 7, 700, p.accent, 'center'),

    // Satellite tags
    ...tags,

    // Score card row
    rect(20, cy + 160, W - 40, 68, p.white, 16,
      { strokeColor: p.border, strokeWidth: 1 }),
    text(36, cy + 175, 60, 14, 'SCORE', 8, 600, p.textFaint, 'left'),
    text(36, cy + 191, 120, 22, '8.4 / 10', 20, 800, p.accent, 'left'),
    // divider
    rect(164, cy + 178, 0.5, 38, p.border),
    text(178, cy + 175, W - 200, 14, 'TREND', 8, 600, p.textFaint, 'left'),
    text(178, cy + 191, W - 200, 22, '↑ +0.6 / 30d', 14, 700, p.text, 'left'),

    // CTA
    rect(20, cy + 244, W - 40, 44, p.accent, 22),
    text(20, cy + 252, W - 40, 28, 'Generate Formula  →', 12, 700, p.white, 'center'),

    ...navBar(),
  ]);
};

// ═══════════════════════════════════════════════════════════
// SCREEN 2 — FORMULA
// ═══════════════════════════════════════════════════════════
const screen2 = () => {
  const cx = W / 2, cy = 290;

  const ingredients = [
    { name: 'Retinol',       pct: '0.1%',  angle: -100, r: 124, color: p.accent },
    { name: 'Niacinamide',   pct: '5%',    angle: -40,  r: 128, color: p.accent },
    { name: 'Hyaluronic A.', pct: '2%',    angle: 20,   r: 120, color: p.accentDark },
    { name: 'Ceramide NP',   pct: '0.5%',  angle: 80,   r: 126, color: p.accentDark },
    { name: 'Peptide CK',    pct: '1%',    angle: 145,  r: 118, color: p.warm },
    { name: 'Squalane',      pct: '3%',    angle: 205,  r: 124, color: p.textSub },
  ];

  const orbs = ingredients.flatMap(ing =>
    orbitTag(cx, cy, ing.r, ing.angle, ing.name, ing.pct, ing.color)
  );

  return screen('Formula', [
    ...statusBar(),
    text(20, 48, W - 80, 22, 'Your Formula', 18, 800, p.text, 'left'),
    text(20, 72, W - 80, 14, 'Personalized · 6 actives', 10, 400, p.textSub, 'left'),
    text(W - 100, 50, 90, 20, 'EDIT', 10, 600, p.accent, 'right'),
    rect(20, 94, W - 40, 0.5, p.border),

    // Outer orbit
    circle(cx, cy, 112, 'transparent', p.border, 0.75),
    circle(cx, cy, 88, 'transparent', p.borderLight, 0.5),
    // Core — formula capsule
    circle(cx, cy, 58, p.accentLight, p.accent, 2),
    text(cx - 30, cy - 18, 60, 14, 'FORM', 12, 800, p.accent, 'center'),
    text(cx - 30, cy - 3, 60, 14, '·026·', 9, 400, p.accentDark, 'center'),
    text(cx - 30, cy + 10, 60, 12, '6 actives', 7.5, 400, p.textSub, 'center'),

    ...orbs,

    // Potency bar row
    rect(20, cy + 150, W - 40, 60, p.white, 14,
      { strokeColor: p.border, strokeWidth: 1 }),
    text(32, cy + 162, 120, 12, 'FORMULA POTENCY', 7.5, 600, p.textFaint, 'left'),
    // bar track
    rect(32, cy + 180, W - 80, 10, p.borderLight, 5),
    rect(32, cy + 180, (W - 80) * 0.78, 10, p.accent, 5),
    text(W - 56, cy + 178, 40, 14, '78%', 10, 700, p.accent, 'right'),

    // 3 quick stats
    rect(20, cy + 226, (W - 52) / 3, 54, p.white, 12,
      { strokeColor: p.border, strokeWidth: 1 }),
    rect(20 + (W - 52) / 3 + 8, cy + 226, (W - 52) / 3, 54, p.white, 12,
      { strokeColor: p.border, strokeWidth: 1 }),
    rect(20 + ((W - 52) / 3 + 8) * 2, cy + 226, (W - 52) / 3, 54, p.white, 12,
      { strokeColor: p.border, strokeWidth: 1 }),

    text(32, cy + 240, (W - 52) / 3 - 16, 14, 'pH', 8, 600, p.textFaint, 'center'),
    text(32, cy + 255, (W - 52) / 3 - 16, 18, '5.5', 16, 800, p.accent, 'center'),

    text(32 + (W - 52) / 3 + 8, cy + 240, (W - 52) / 3 - 16, 14, 'Texture', 8, 600, p.textFaint, 'center'),
    text(32 + (W - 52) / 3 + 8, cy + 255, (W - 52) / 3 - 16, 18, 'Serum', 11, 800, p.text, 'center'),

    text(32 + ((W - 52) / 3 + 8) * 2, cy + 240, (W - 52) / 3 - 16, 14, 'AM/PM', 8, 600, p.textFaint, 'center'),
    text(32 + ((W - 52) / 3 + 8) * 2, cy + 255, (W - 52) / 3 - 16, 18, 'PM', 16, 800, p.text, 'center'),

    ...navBar(),
  ]);
};

// ═══════════════════════════════════════════════════════════
// SCREEN 3 — ROUTINE
// ═══════════════════════════════════════════════════════════
const screen3 = () => {
  const steps_am = [
    { step: '01', name: 'Gentle Cleanse',    time: '90s',  note: 'Lukewarm water, pH-balanced' },
    { step: '02', name: 'DOSE Formula',      time: '60s',  note: 'Apply to damp skin, 2 pumps' },
    { step: '03', name: 'SPF 50+ Screen',    time: '30s',  note: 'Last step, don\'t forget neck' },
  ];
  const steps_pm = [
    { step: '01', name: 'Oil Cleanse',       time: '2m',   note: 'Break down SPF + sebum' },
    { step: '02', name: 'Active Serum',      time: '60s',  note: 'Retinol 0.1% — 3x/week only' },
    { step: '03', name: 'Barrier Repair',    time: '30s',  note: 'Ceramide + Squalane layer' },
  ];

  const stepRow = (s, yOffset, isAM) => {
    const acColor = isAM ? p.accent : p.accentDark;
    return [
      rect(20, yOffset, W - 40, 56, p.white, 12,
        { strokeColor: p.border, strokeWidth: 1 }),
      // Step number — small teal badge
      rect(32, yOffset + 18, 22, 22, p.accentLight, 11),
      text(32, yOffset + 22, 22, 14, s.step, 9, 700, acColor, 'center'),
      // Name + note
      text(62, yOffset + 14, W - 130, 16, s.name, 12, 700, p.text, 'left'),
      text(62, yOffset + 32, W - 130, 13, s.note, 9, 400, p.textSub, 'left'),
      // Time pill
      rect(W - 70, yOffset + 19, 40, 18, p.accentLight, 9),
      text(W - 70, yOffset + 22, 40, 14, s.time, 9, 600, acColor, 'center'),
    ];
  };

  return screen('Routine', [
    ...statusBar(),
    text(20, 48, W - 40, 22, 'Routine', 18, 800, p.text, 'left'),
    text(20, 72, W - 40, 14, 'Optimized for your skin type', 10, 400, p.textSub, 'left'),
    rect(20, 94, W - 40, 0.5, p.border),

    // AM block
    rect(20, 106, W - 40, 24, p.accentLight, 8),
    text(32, 111, 100, 14, '☀  MORNING', 9, 700, p.accent, 'left'),
    text(W - 120, 111, 100, 14, '4 MIN TOTAL', 9, 600, p.textFaint, 'right'),

    ...steps_am.flatMap((s, i) => stepRow(s, 138 + i * 66, true)),

    // PM block
    rect(20, 342, W - 40, 24, p.surfaceAlt, 8),
    text(32, 347, 100, 14, '◑  EVENING', 9, 700, p.accentDark, 'left'),
    text(W - 120, 347, 100, 14, '5 MIN TOTAL', 9, 600, p.textFaint, 'right'),

    ...steps_pm.flatMap((s, i) => stepRow(s, 374 + i * 66, false)),

    // Compliance streak
    rect(20, 578, W - 40, 72, p.white, 16,
      { strokeColor: p.accent, strokeWidth: 1.5 }),
    text(36, 593, W - 80, 14, 'CONSISTENCY STREAK', 8, 600, p.textFaint, 'left'),
    text(36, 610, 120, 28, '11 days', 22, 800, p.accent, 'left'),
    // mini calendar dots
    ...[0,1,2,3,4,5,6].map(d => 
      circle(W - 100 + d * 12, 624, 4,
        d < 4 ? p.accent : (d === 4 ? p.accentLight : p.borderLight),
        d === 4 ? p.accent : 'transparent', d === 4 ? 1 : 0)
    ),
    text(W - 106, 634, 90, 12, '← this week', 8, 400, p.textFaint, 'right'),

    // Tip card
    rect(20, 662, W - 40, 52, p.warmLight, 12),
    text(36, 673, W - 80, 14, 'TIP', 8, 700, p.warm, 'left'),
    text(36, 688, W - 80, 24, 'Retinol is PM only. Skip on exfoliation nights.', 10, 400, p.text, 'left'),

    ...navBar(),
  ]);
};

// ═══════════════════════════════════════════════════════════
// SCREEN 4 — LAB  (Ingredient Explorer)
// ═══════════════════════════════════════════════════════════
const screen4 = () => {
  const ings = [
    { name: 'Retinol',        class: 'Vitamin A',    conc: '0.1%', benefit: 'Renewal',  compat: '●●●○○', risk: 'Low' },
    { name: 'Niacinamide',    class: 'Vitamin B3',   conc: '5%',   benefit: 'Barrier',  compat: '●●●●○', risk: 'Low' },
    { name: 'Hyaluronic A.',  class: 'Humectant',    conc: '2%',   benefit: 'Hydrate',  compat: '●●●●●', risk: 'None' },
    { name: 'Ceramide NP',    class: 'Lipid',        conc: '0.5%', benefit: 'Repair',   compat: '●●●●●', risk: 'None' },
    { name: 'Squalane',       class: 'Emollient',    conc: '3%',   benefit: 'Seal',     compat: '●●●●○', risk: 'None' },
  ];

  const ingRow = (ing, y) => [
    rect(20, y, W - 40, 64, p.white, 12,
      { strokeColor: p.border, strokeWidth: 1 }),
    // left accent bar
    rect(20, y + 8, 3, 48, p.accent, 1.5),
    // name + class
    text(32, y + 12, W - 140, 16, ing.name, 12, 700, p.text, 'left'),
    text(32, y + 30, W - 140, 12, ing.class, 9, 400, p.textSub, 'left'),
    // benefit pill
    rect(32, y + 44, 56, 14, p.accentLight, 7),
    text(32, y + 46, 56, 12, ing.benefit, 8, 600, p.accent, 'center'),
    // right: concentration
    text(W - 100, y + 12, 80, 16, ing.conc, 14, 800, p.accentDark, 'right'),
    // compat dots
    text(W - 100, y + 32, 80, 12, ing.compat, 9, 400,
      ing.risk === 'None' ? p.accent : ing.risk === 'Low' ? p.warm : p.red, 'right'),
    text(W - 100, y + 46, 80, 12, 'risk: ' + ing.risk, 8, 400, p.textFaint, 'right'),
  ];

  return screen('Lab', [
    ...statusBar(),
    text(20, 48, W - 80, 22, 'Lab', 18, 800, p.text, 'left'),
    text(20, 72, W - 80, 14, 'Ingredient intelligence', 10, 400, p.textSub, 'left'),
    // Search pill
    rect(20, 94, W - 40, 36, p.white, 18,
      { strokeColor: p.border, strokeWidth: 1 }),
    text(44, 105, 20, 16, '⌕', 12, 400, p.textFaint, 'left'),
    text(64, 105, 200, 16, 'Search ingredients…', 12, 400, p.textFaint, 'left'),

    // Filter row
    ...['All', 'Active', 'Humectant', 'Emollient'].map((f, i) => {
      const fw = [36, 54, 78, 66][i];
      const fx = [20, 64, 126, 212][i];
      return [
        rect(fx, 140, fw, 24, i === 0 ? p.accent : p.white, 12,
          i === 0 ? {} : { strokeColor: p.border, strokeWidth: 1 }),
        text(fx, 144, fw, 16, f, 9, 600, i === 0 ? p.white : p.textSub, 'center'),
      ];
    }).flat(),

    ...ings.flatMap((ing, i) => ingRow(ing, 176 + i * 74)),

    ...navBar(),
  ]);
};

// ═══════════════════════════════════════════════════════════
// SCREEN 5 — PROGRESS
// ═══════════════════════════════════════════════════════════
const screen5 = () => {
  const cx = W / 2, cy = 270;

  // Radial progress arcs approximated as concentric partial circles
  // We'll simulate with arc-like ellipses + labels

  const metrics = [
    { label: 'Moisture',  pct: 68, prev: 54, color: p.accent,     r: 80 },
    { label: 'Elastin',   pct: 74, prev: 62, color: p.accentDark, r: 96 },
    { label: 'Texture',   pct: 60, prev: 48, color: p.warm,       r: 112 },
  ];

  // Simulate rings as colored arcs (use wide-stroke ellipses)
  const arc = (cx, cy, r, color) => [
    circle(cx, cy, r, 'transparent', p.borderLight, 6),
    // "filled" portion as a small arc rect overlay (simplified)
    circle(cx, cy, r, 'transparent', color, 6),
  ];

  return screen('Progress', [
    ...statusBar(),
    text(20, 48, W - 80, 22, 'Progress', 18, 800, p.text, 'left'),
    text(20, 72, W - 80, 14, '30-day skin journey', 10, 400, p.textSub, 'left'),
    text(W - 110, 52, 100, 16, '30 DAYS  ↓', 10, 600, p.accent, 'right'),
    rect(20, 94, W - 40, 0.5, p.border),

    // Orbital progress rings (concentric)
    circle(cx, cy, 118, 'transparent', p.borderLight, 8),
    circle(cx, cy, 96, 'transparent', p.borderLight, 8),
    circle(cx, cy, 74, 'transparent', p.borderLight, 8),

    // Progress overlays (tinted partial fill simulated with colored circle + clip)
    circle(cx, cy, 118, 'transparent', p.warm, 8),
    circle(cx, cy, 96, 'transparent', p.accentDark, 8),
    circle(cx, cy, 74, 'transparent', p.accent, 8),

    // Center score
    circle(cx, cy, 52, p.white, p.accent, 2),
    text(cx - 30, cy - 18, 60, 14, '+23%', 16, 800, p.accent, 'center'),
    text(cx - 30, cy - 2, 60, 12, 'Overall', 8, 400, p.textSub, 'center'),
    text(cx - 30, cy + 10, 60, 12, 'Improvement', 8, 400, p.textSub, 'center'),

    // Ring labels
    ...orbitTag(cx, cy, 130, -60, 'Moisture', '+14pt', p.accent),
    ...orbitTag(cx, cy, 130, 60, 'Elastin', '+12pt', p.accentDark),
    ...orbitTag(cx, cy, 130, 180, 'Texture', '+12pt', p.warm),

    // Metric cards
    rect(20, cy + 148, W - 40, 96, p.white, 16,
      { strokeColor: p.border, strokeWidth: 1 }),
    text(36, cy + 162, W - 80, 12, 'METRIC BREAKDOWN', 8, 600, p.textFaint, 'left'),
    rect(36, cy + 178, W - 80, 0.5, p.border),

    ...metrics.flatMap((m, i) => {
      const y = cy + 184 + i * 18;
      const barW = W - 170;
      return [
        text(36, y, 80, 14, m.label, 9, 600, p.text, 'left'),
        rect(120, y + 2, barW, 8, p.borderLight, 4),
        rect(120, y + 2, barW * (m.pct / 100), 8, m.color, 4),
        text(120 + barW + 6, y, 40, 14, m.pct + '%', 9, 700, m.color, 'left'),
        text(120 + barW + 36, y, 50, 14, '↑' + (m.pct - m.prev), 9, 400, p.textFaint, 'left'),
      ];
    }),

    // Timeline month labels
    rect(20, cy + 258, W - 40, 28, p.surfaceAlt, 8),
    ...['Jan', 'Feb', 'Mar', 'Apr'].map((m, i) =>
      text(36 + i * 72, cy + 264, 60, 16, m, 9, 400,
        i === 3 ? p.accent : p.textFaint, 'left')
    ),

    // Next milestone card
    rect(20, cy + 298, W - 40, 52, p.accentLight, 12),
    text(36, cy + 308, W - 80, 14, 'NEXT MILESTONE', 8, 700, p.accent, 'left'),
    text(36, cy + 323, W - 80, 20, 'Pore refinement target: 14 days', 11, 600, p.text, 'left'),

    ...navBar(),
  ]);
};

// ─── COMPOSE ───────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'DOSE — Precision Skincare OS',
  screens: [screen1(), screen2(), screen3(), screen4(), screen5()],
};

fs.writeFileSync('dose.pen', JSON.stringify(pen, null, 2));
console.log('✓ dose.pen written —', pen.screens.length, 'screens');
