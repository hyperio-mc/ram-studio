'use strict';
// olia-app.js — OLIA: Skincare Intelligence & Ritual Companion
// Inspired by:
//   1. lapa.ninja (Mar 24, 2026): "The Future of Beauty is Automated" — floating scattered
//      rotated portrait/product photo cards arranged in an arc on a warm lavender-to-peach
//      gradient. Immediately arresting layout no other app type uses.
//   2. godly.website: Superpower ("A new era of personal health") — warm amber glow,
//      cinematic portrait lighting, editorial tone that positions health as aspirational.
//   3. awwwards.com: Aventura Dental Arts — warm professional aesthetic proving healthcare
//      can be beautiful, not clinical.
// Theme: LIGHT — warm cream, blush, soft terracotta — counters the dark tech aesthetic.
// Design push: Scattered rotated card grid (rotation prop) for product library screen.
//   Typography-led hero moments. Ritual tracking as an intentional, calm experience.

const fs   = require('fs');
const path = require('path');

// ─── palette ─────────────────────────────────────────────────────────────────
const C = {
  bg:       '#FAF7F4',   // warm cream
  surface:  '#FFFFFF',
  surface2: '#F3EDE6',   // parchment
  surface3: '#EDE4D8',   // warm sand
  text:     '#2A1F1A',   // warm espresso
  muted:    'rgba(42,31,26,0.42)',
  accent:   '#C4826A',   // soft terracotta
  accent2:  '#8B6B5C',   // deeper umber
  blush:    '#F0D9CF',   // light blush
  rose:     '#D4A89A',   // rose
  sage:     '#8A9E8A',   // sage green
  gold:     '#C8A96E',   // warm gold
  border:   'rgba(42,31,26,0.09)',
  border2:  'rgba(42,31,26,0.15)',
};

// ─── pen helpers ─────────────────────────────────────────────────────────────
let _id = 1;
const uid = () => `olia-${_id++}`;

const rect = (x, y, w, h, fill, extra = {}) =>
  ({ id: uid(), type: 'rect', x, y, width: w, height: h, fill, ...extra });

const text = (x, y, w, h, content, fontSize, color, weight = '400', align = 'left', family = 'Georgia') =>
  ({ id: uid(), type: 'text', x, y, width: w, height: h, content, fontSize, color,
     fontWeight: weight, textAlign: align, fontFamily: family });

const sans = (x, y, w, h, content, fontSize, color, weight = '400', align = 'left') =>
  text(x, y, w, h, content, fontSize, color, weight, align, 'Inter');

const circle = (cx, cy, r, fill, extra = {}) =>
  ({ id: uid(), type: 'ellipse', x: cx - r, y: cy - r, width: r * 2, height: r * 2, fill, ...extra });

const frame = (x, y, w, h, fill, children, extra = {}) =>
  ({ id: uid(), type: 'frame', x, y, width: w, height: h, fill, clip: true, children, ...extra });

const FW = 390;
const FH = 844;

// ─── shared components ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'Today',    icon: '◎' },
  { label: 'Diary',    icon: '◇' },
  { label: 'Products', icon: '⬡' },
  { label: 'Insights', icon: '∿' },
  { label: 'Routine',  icon: '≋' },
];

function navBar(active) {
  const els = [];
  const w = FW / NAV_ITEMS.length;
  NAV_ITEMS.forEach((item, i) => {
    const nx = Math.round(i * w);
    const nw = Math.round(w);
    const isAct = i === active;
    if (isAct) {
      els.push(rect(nx + 12, FH - 68, nw - 24, 2, C.accent));
    }
    els.push(sans(nx, FH - 52, nw, 14, item.icon,   14, isAct ? C.accent : C.muted, '400', 'center'));
    els.push(sans(nx, FH - 36, nw, 14, item.label,   9, isAct ? C.accent : C.muted, isAct ? '600' : '400', 'center'));
  });
  return els;
}

function statusBar() {
  return [
    sans(20, 14, 80, 14, '9:41', 11, C.muted, '600'),
    sans(FW - 80, 14, 72, 14, '●●●', 10, C.muted, '400', 'right'),
  ];
}

// ─── SCREEN 1: Today ─────────────────────────────────────────────────────────
function screenToday() {
  const steps = [
    { name: 'Cleanse',    brand: 'Cetaphil',     status: 'done',    time: '6:32am' },
    { name: 'Vitamin C',  brand: 'Skinceuticals', status: 'done',    time: '6:35am' },
    { name: 'Moisturise', brand: 'La Roche-Posay',status: 'active',  time: 'Now' },
    { name: 'SPF 50+',    brand: 'Ultra Violette', status: 'pending', time: '—' },
  ];

  const stepEls = [];
  steps.forEach((s, i) => {
    const y = 298 + i * 72;
    const isDone   = s.status === 'done';
    const isActive = s.status === 'active';
    stepEls.push(rect(20, y, FW - 40, 64, C.surface));
    stepEls.push(rect(20, y, FW - 40, 64, C.border, { opacity: 0.5 }));  // border sim

    // step dot
    const dotFill = isDone ? C.accent : isActive ? C.blush : C.surface2;
    stepEls.push(circle(46, y + 32, 14, dotFill));
    stepEls.push(sans(46 - 5, y + 25, 11, 14,
      isDone ? '✓' : isActive ? '○' : '·', 11,
      isDone ? C.surface : isActive ? C.accent : C.muted, '700', 'center'));

    // vertical connector (not last)
    if (i < steps.length - 1) {
      stepEls.push(rect(46, y + 46, 1, 72 - 14, C.border));
    }

    stepEls.push(text(72, y + 12, 200, 20, s.name, 15, s.status === 'pending' ? C.muted : C.text, '400', 'left', 'Georgia'));
    stepEls.push(sans(72, y + 34, 180, 16, s.brand, 11, C.muted, '400'));
    stepEls.push(sans(FW - 80, y + 12, 60, 16, s.time, 10, isActive ? C.accent : C.muted, isActive ? '600' : '400', 'right'));
    if (isActive) {
      stepEls.push(rect(20, y + 62, FW - 40, 2, C.accent));
    }
  });

  // skin condition today
  const conditions = [
    { label: 'Hydration', pct: 74, color: C.sage },
    { label: 'Barrier',   pct: 62, color: C.gold },
    { label: 'Glow',      pct: 81, color: C.rose },
  ];
  const condEls = [];
  conditions.forEach((c, i) => {
    const cx2 = 20 + i * 120;
    condEls.push(rect(cx2, 610, 104, 56, C.surface2));
    condEls.push(sans(cx2 + 8, 618, 88, 14, c.label, 9, C.muted, '600'));
    condEls.push(text(cx2 + 8, 632, 88, 26, `${c.pct}%`, 20, c.color, '400', 'left', 'Georgia'));
  });

  const children = [
    rect(0, 0, FW, FH, C.bg),
    ...statusBar(),

    // warm gradient header band
    rect(0, 0, FW, 200, C.surface2),
    rect(0, 180, FW, 60, C.bg),  // fade

    // OLIA wordmark
    text(20, 36, 120, 36, 'OLIA', 28, C.accent, '400', 'left', 'Georgia'),
    sans(FW - 80, 40, 64, 18, 'MON 24', 10, C.muted, '600', 'right'),

    // hero greeting
    text(20, 82, FW - 40, 40, 'Your morning ritual', 28, C.text, '400', 'left', 'Georgia'),
    sans(20, 124, FW - 40, 18, '3 of 4 steps complete · Skin score 72%', 12, C.muted, '400'),

    // progress arc (simplified as a bar)
    rect(20, 148, FW - 40, 4, C.surface3),
    rect(20, 148, Math.round((FW - 40) * 0.75), 4, C.accent),
    sans(20, 158, 80, 14, '75% done', 10, C.accent, '600'),
    sans(FW - 80, 158, 64, 14, '1 left', 10, C.muted, '400', 'right'),

    rect(20, 180, FW - 40, 1, C.border),
    sans(20, 192, 200, 16, 'MORNING STEPS', 10, C.muted, '700'),

    ...stepEls,

    sans(20, 598, 200, 16, 'TODAY\'S SKIN', 10, C.muted, '700'),
    ...condEls,

    // skin note
    rect(20, 678, FW - 40, 52, C.blush),
    sans(32, 688, FW - 64, 16, '✦ Barrier slightly stressed — wind exposure noted', 12, C.accent2, '500'),
    sans(32, 708, FW - 64, 16, 'Try a richer moisturiser this evening', 11, C.muted, '400'),

    rect(0, FH - 74, FW, 74, C.surface),
    rect(0, FH - 74, FW, 1, C.border),
    ...navBar(0),
  ];
  return frame(0, 0, FW, FH, C.bg, children);
}

// ─── SCREEN 2: Skin Diary ────────────────────────────────────────────────────
function screenDiary() {
  // Scattered photo-card tiles — key layout motif from Lapa beauty AI
  // Simulated with rotated rect frames at varying angles
  const photos = [
    { x: 18,  y: 110, w: 108, h: 142, angle: -3.5, label: 'Today',   badge: '72', badgeC: C.accent },
    { x: 138, y: 100, w: 112, h: 148, angle:  1.5, label: 'Fri 21',  badge: '68', badgeC: C.gold },
    { x: 258, y: 116, w: 106, h: 138, angle: -2,   label: 'Thu 20',  badge: '75', badgeC: C.sage },
    { x: 22,  y: 268, w: 110, h: 140, angle:  2,   label: 'Wed 19',  badge: '61', badgeC: C.rose },
    { x: 140, y: 258, w: 114, h: 144, angle: -1.5, label: 'Mon 17',  badge: '70', badgeC: C.gold },
    { x: 260, y: 272, w: 104, h: 138, angle:  3,   label: 'Sun 16',  badge: '66', badgeC: C.accent2 },
  ];

  const photoEls = [];
  photos.forEach(p => {
    // card backing (shadow sim)
    photoEls.push(rect(p.x + 2, p.y + 3, p.w, p.h, 'rgba(42,31,26,0.07)', { rotation: p.angle }));
    // card face (warm photo sim)
    const fills = [C.surface2, C.blush, C.surface3];
    const fillIdx = Math.abs(Math.round(p.angle)) % fills.length;
    photoEls.push(rect(p.x, p.y, p.w, p.h, fills[fillIdx], { rotation: p.angle }));
    // photo placeholder gradient tones
    photoEls.push(rect(p.x, p.y, p.w, p.h * 0.7, 'rgba(196,130,106,0.12)', { rotation: p.angle }));
    // label strip
    photoEls.push(rect(p.x, p.y + p.h - 28, p.w, 28, C.surface, { rotation: p.angle }));
    photoEls.push(sans(p.x + 8, p.y + p.h - 20, p.w - 40, 14, p.label, 10, C.text, '500'));
    // score badge
    photoEls.push(circle(p.x + p.w - 18, p.y + 14, 13, C.surface));
    photoEls.push(sans(p.x + p.w - 30, p.y + 7, 24, 14, p.badge, 9, p.badgeC, '700', 'center'));
  });

  // streak info
  const children = [
    rect(0, 0, FW, FH, C.bg),
    ...statusBar(),

    text(20, 36, 200, 32, 'Skin Diary', 26, C.text, '400', 'left', 'Georgia'),
    sans(FW - 90, 42, 76, 16, '21-day log', 11, C.accent, '600', 'right'),
    sans(20, 70, FW - 40, 16, '24 entries · avg score 70 · longest streak 9 days', 11, C.muted, '400'),
    rect(20, 90, FW - 40, 1, C.border),

    ...photoEls,

    // Summary strip
    rect(0, 422, FW, 88, C.surface),
    rect(0, 422, FW, 1, C.border),
    sans(20, 432, 200, 14, 'WEEKLY TREND', 9, C.muted, '700'),
    // mini sparkline sim
    ...[68, 61, 75, 70, 66, 72, 72].map((v, i) => {
      const bx = 20 + i * 44;
      const bh = Math.round((v - 55) / 25 * 36);
      return rect(bx, 494 - bh, 32, bh, v >= 70 ? C.accent : C.surface3);
    }),
    ...[68, 61, 75, 70, 66, 72, 72].map((v, i) => {
      const bx = 20 + i * 44;
      return sans(bx, 496, 32, 12, String(v), 9, C.muted, '400', 'center');
    }),
    sans(FW - 80, 468, 64, 16, '+4 pts ↑', 13, C.sage, '700', 'right'),

    // add photo CTA
    rect(0, 510, FW, 88, C.bg),
    rect(20, 524, FW - 40, 60, C.accent),
    text(0, 540, FW, 28, 'Log today\'s skin →', 17, C.surface, '400', 'center', 'Georgia'),

    // insights strip
    rect(0, 598, FW, 100, C.surface2),
    rect(0, 598, FW, 1, C.border),
    sans(20, 608, 200, 14, 'PATTERNS NOTICED', 9, C.muted, '700'),
    sans(20, 624, FW - 40, 18, '· Skin peaks mid-week after rest days', 12, C.text, '400'),
    sans(20, 642, FW - 40, 18, '· Wind & low humidity correlate to -6 pts', 12, C.text, '400'),
    sans(20, 660, FW - 40, 18, '· Vitamin C streak = +9% average glow', 12, C.accent, '500'),

    rect(0, FH - 74, FW, 74, C.surface),
    rect(0, FH - 74, FW, 1, C.border),
    ...navBar(1),
  ];
  return frame(390, 0, FW, FH, C.bg, children);
}

// ─── SCREEN 3: Products ──────────────────────────────────────────────────────
function screenProducts() {
  // Scattered product card grid — the hero layout moment
  // Cards at varying rotations, overlapping slightly
  const products = [
    { x: 16,  y: 108, w: 156, h: 194, angle: -4,   name: 'C E Ferulic', brand: 'Skinceuticals',   tag: 'Vitamin C',  color: C.gold },
    { x: 216, y:  96, w: 154, h: 198, angle:  3,   name: 'Toleriane',   brand: 'La Roche-Posay', tag: 'Moisturiser',color: C.sage },
    { x: 20,  y: 316, w: 150, h: 188, angle:  2.5, name: 'Gentle Foam', brand: 'Cetaphil',        tag: 'Cleanser',   color: C.blush },
    { x: 210, y: 308, w: 160, h: 192, angle: -3,   name: 'Sunrise Oil', brand: 'Ultra Violette',  tag: 'SPF 50+',    color: C.accent },
    { x: 60,  y: 512, w: 130, h: 166, angle: -2,   name: 'B5 Gel',      brand: 'The Ordinary',    tag: 'Hydration',  color: C.rose },
    { x: 218, y: 506, w: 134, h: 170, angle:  1.5, name: 'Peptide Mist',brand: 'Augustinus Bader',tag: 'Treatment',  color: C.accent2 },
  ];

  const cardEls = [];
  products.forEach(p => {
    // shadow
    cardEls.push(rect(p.x + 3, p.y + 5, p.w, p.h, 'rgba(42,31,26,0.08)', { rotation: p.angle }));
    // card body
    cardEls.push(rect(p.x, p.y, p.w, p.h, C.surface, { rotation: p.angle }));
    // top color band (product colour identity)
    cardEls.push(rect(p.x, p.y, p.w, p.h * 0.55, p.color + '22', { rotation: p.angle }));
    // product name area
    cardEls.push(rect(p.x, p.y + p.h - 70, p.w, 70, C.surface, { rotation: p.angle }));
    cardEls.push(rect(p.x, p.y + p.h - 70, p.w, 1, C.border, { rotation: p.angle }));

    // Tag pill
    cardEls.push(rect(p.x + 8, p.y + 8, 70, 18, p.color + '33', { rotation: p.angle }));
    cardEls.push(sans(p.x + 10, p.y + 9, 68, 14, p.tag, 8, p.color, '700'));

    cardEls.push(sans(p.x + 8, p.y + p.h - 60, p.w - 16, 18, p.name, 12, C.text, '600'));
    cardEls.push(sans(p.x + 8, p.y + p.h - 42, p.w - 16, 16, p.brand, 10, C.muted, '400'));

    // small rating
    cardEls.push(sans(p.x + 8, p.y + p.h - 22, p.w - 16, 16, '★★★★☆  4.2', 10, C.gold, '600'));
  });

  const children = [
    rect(0, 0, FW, FH, C.bg),
    ...statusBar(),

    text(20, 36, 200, 32, 'My Products', 26, C.text, '400', 'left', 'Georgia'),
    sans(FW - 84, 44, 70, 16, '+ Add', 11, C.accent, '600', 'right'),
    sans(20, 70, 300, 16, '6 products · AM & PM sorted · last updated today', 11, C.muted, '400'),
    rect(20, 88, FW - 40, 1, C.border),

    ...cardEls,

    // Search/filter bar at bottom above nav
    rect(0, FH - 130, FW, 56, C.bg),
    rect(20, FH - 122, FW - 40, 36, C.surface2),
    sans(36, FH - 112, 200, 18, '🔍  Search products…', 12, C.muted, '400'),

    rect(0, FH - 74, FW, 74, C.surface),
    rect(0, FH - 74, FW, 1, C.border),
    ...navBar(2),
  ];
  return frame(780, 0, FW, FH, C.bg, children);
}

// ─── SCREEN 4: Insights ──────────────────────────────────────────────────────
function screenInsights() {
  // 30-day skin score graph (bar chart, warm tones)
  const scores = [65,68,63,71,74,70,72,66,60,58,64,69,74,76,73,71,68,72,75,77,74,72,76,80,78,75,74,72,73,72];
  const graphEls = [];
  const gx = 20, gy = 200, gw = FW - 40, gh = 100;
  scores.forEach((v, i) => {
    const bx = gx + i * (gw / scores.length);
    const bw = Math.floor(gw / scores.length) - 1;
    const bh = Math.round((v - 50) / 40 * gh);
    const fill = v >= 75 ? C.accent : v >= 65 ? C.rose : C.surface3;
    graphEls.push(rect(Math.round(bx), gy + gh - bh, bw, bh, fill));
  });

  // Ingredient analysis
  const ingredients = [
    { name: 'Vitamin C',       pct: 88, color: C.gold,    note: 'Brightening & antioxidant' },
    { name: 'Niacinamide',     pct: 71, color: C.sage,    note: 'Barrier + pore refinement' },
    { name: 'Hyaluronic Acid', pct: 64, color: C.rose,    note: 'Deep hydration layers' },
    { name: 'Retinol',         pct: 32, color: C.accent,  note: 'Renewal — increase gradually' },
  ];

  const ingEls = [];
  ingredients.forEach((ing, i) => {
    const iy = 360 + i * 72;
    const barW = Math.round((FW - 80) * ing.pct / 100);
    ingEls.push(sans(20, iy, 200, 16, ing.name, 12, C.text, '600'));
    ingEls.push(sans(FW - 56, iy, 48, 16, `${ing.pct}%`, 12, ing.color, '700', 'right'));
    ingEls.push(rect(20, iy + 20, FW - 40, 6, C.surface2));
    ingEls.push(rect(20, iy + 20, barW, 6, ing.color));
    ingEls.push(sans(20, iy + 32, FW - 40, 16, ing.note, 10, C.muted, '400'));
  });

  const children = [
    rect(0, 0, FW, FH, C.bg),
    ...statusBar(),

    text(20, 36, 200, 32, 'Insights', 26, C.text, '400', 'left', 'Georgia'),
    sans(20, 70, 300, 16, '30-day skin health analysis · 4 trends identified', 11, C.muted, '400'),
    rect(20, 90, FW - 40, 1, C.border),

    // Score metrics row
    rect(20, 100, 106, 72, C.surface),
    text(32, 108, 90, 32, '72', 30, C.accent, '400', 'left', 'Georgia'),
    sans(32, 142, 90, 16, 'Avg Score', 10, C.muted, '400'),

    rect(136, 100, 106, 72, C.surface),
    text(148, 108, 90, 32, '+7', 30, C.sage, '400', 'left', 'Georgia'),
    sans(148, 142, 90, 16, 'vs. last month', 10, C.muted, '400'),

    rect(252, 100, 118, 72, C.surface),
    text(264, 108, 90, 32, '21', 30, C.gold, '400', 'left', 'Georgia'),
    sans(264, 142, 90, 16, 'Day streak', 10, C.muted, '400'),

    // graph label
    sans(20, 180, 200, 14, '30-DAY SKIN SCORE', 9, C.muted, '700'),
    sans(FW - 80, 180, 64, 14, 'Max 80', 9, C.accent, '700', 'right'),
    rect(20, 194, FW - 40, 1, C.border),

    ...graphEls,

    // X axis labels
    sans(20, 305, 40, 12, '1 Mar', 8, C.muted, '400'),
    sans(FW / 2 - 20, 305, 40, 12, '15', 8, C.muted, '400', 'center'),
    sans(FW - 60, 305, 40, 12, 'Today', 8, C.muted, '400', 'right'),

    sans(20, 322, 200, 16, 'INGREDIENT COVERAGE', 9, C.muted, '700'),
    rect(20, 338, FW - 40, 1, C.border),

    ...ingEls,

    // OLIA tip
    rect(20, 648, FW - 40, 72, C.blush),
    rect(20, 648, 4, 72, C.accent),
    sans(32, 656, FW - 52, 18, '✦ OLIA suggests', 10, C.accent, '700'),
    sans(32, 672, FW - 52, 18, 'Add a retinol 2× per week to reach 45%+', 12, C.text, '500'),
    sans(32, 692, FW - 52, 16, 'View recommended products →', 11, C.accent, '600'),

    rect(0, FH - 74, FW, 74, C.surface),
    rect(0, FH - 74, FW, 1, C.border),
    ...navBar(3),
  ];
  return frame(1170, 0, FW, FH, C.bg, children);
}

// ─── SCREEN 5: Routine Builder ────────────────────────────────────────────────
function screenRoutine() {
  const amSteps = [
    { name: 'Cleanse',      sub: 'Cetaphil Gentle Foam',     step: '01', done: true },
    { name: 'Tone',         sub: 'Optional · skip if rushed', step: '02', done: false, optional: true },
    { name: 'Vitamin C',    sub: 'Skinceuticals C E Ferulic', step: '03', done: true },
    { name: 'Eye Cream',    sub: 'RoC Retinol Correxion',     step: '04', done: false },
    { name: 'Moisturise',   sub: 'La Roche-Posay Toleriane',  step: '05', done: false },
    { name: 'SPF',          sub: 'Ultra Violette Sunrise',    step: '06', done: false },
  ];

  const stepEls = [];
  amSteps.forEach((s, i) => {
    const sy = 178 + i * 72;
    const isDone     = s.done;
    const isOptional = s.optional;
    stepEls.push(rect(20, sy, FW - 40, 64,
      isDone ? C.surface2 : isOptional ? C.bg : C.surface));
    stepEls.push(rect(20, sy, 4, 64, isDone ? C.accent : C.surface3));

    // step number circle
    stepEls.push(circle(50, sy + 32, 16, isDone ? C.accent : C.surface3));
    stepEls.push(sans(43, sy + 25, 14, 14, s.step, 10, isDone ? C.surface : C.muted, '700', 'center'));

    // drag handle
    stepEls.push(sans(FW - 36, sy + 20, 20, 24, '⋮⋮', 12, C.border2, '400', 'center'));

    stepEls.push(text(70, sy + 12, 230, 22, s.name, 15, isDone ? C.muted : C.text, isDone ? '400' : '400', 'left', 'Georgia'));
    stepEls.push(sans(70, sy + 36, 260, 16, s.sub, 11, isOptional ? C.rose : C.muted, '400'));
  });

  // timing estimates
  const timings = [
    { label: 'AM Routine', time: '~8 min', color: C.gold },
    { label: 'PM Routine', time: '~12 min', color: C.rose },
  ];

  const children = [
    rect(0, 0, FW, FH, C.bg),
    ...statusBar(),

    text(20, 36, 200, 32, 'Routine', 26, C.text, '400', 'left', 'Georgia'),

    // AM / PM toggle
    rect(20, 72, 172, 32, C.accent),
    sans(20, 80, 172, 16, 'AM', 12, C.surface, '700', 'center'),
    rect(196, 72, 172, 32, C.surface2),
    sans(196, 80, 172, 16, 'PM', 12, C.muted, '500', 'center'),

    rect(20, 112, FW - 40, 1, C.border),

    // timing info
    sans(20, 120, 240, 16, `${timings[0].label}  ·  ${timings[0].time}  ·  6 steps`, 11, C.muted, '400'),
    sans(FW - 80, 120, 64, 16, 'Edit', 11, C.accent, '600', 'right'),

    rect(20, 138, FW - 40, 1, C.border),

    // step label
    sans(20, 150, 200, 16, 'STEP SEQUENCE  (drag to reorder)', 9, C.muted, '700'),
    sans(FW - 80, 150, 64, 16, '4 of 6 ✓', 10, C.accent, '600', 'right'),

    ...stepEls,

    // save button
    rect(20, 618, FW - 40, 48, C.accent),
    text(0, 626, FW, 28, 'Save routine', 16, C.surface, '400', 'center', 'Georgia'),

    // OLIA insight
    rect(20, 678, FW - 40, 64, C.surface2),
    sans(32, 686, FW - 52, 14, '✦ Routine score: 8.4 / 10', 11, C.accent, '700'),
    sans(32, 702, FW - 52, 16, 'Layering order is correct. Consider adding a retinol 2×/week in PM.', 11, C.muted, '400'),

    rect(0, FH - 74, FW, 74, C.surface),
    rect(0, FH - 74, FW, 1, C.border),
    ...navBar(4),
  ];
  return frame(1560, 0, FW, FH, C.bg, children);
}

// ─── ASSEMBLE PEN ────────────────────────────────────────────────────────────
const pen = {
  version:  '2.8',
  name:     'OLIA — Skincare Intelligence & Ritual Companion',
  width:    FW * 5,
  height:   FH,
  fill:     '#E8E2DA',
  children: [
    screenToday(),
    screenDiary(),
    screenProducts(),
    screenInsights(),
    screenRoutine(),
  ],
};

const outPath = path.join(__dirname, 'olia.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ olia.pen written (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
