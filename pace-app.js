'use strict';
// pace-app.js
// PACE — Precision Nutrition for Endurance Athletes
//
// Challenge: Design a LIGHT-mode endurance athlete nutrition tracker, inspired by:
//
// 1. Athleats (land-book.com, March 31 2026) — "Healthy, performance driven
//    recipes for athletes" — clean editorial food card layouts, warm off-white
//    backgrounds, bold category headers, health-forward green/amber palette.
//
// 2. Atlas Card (godly.website) — editorial full-bleed photography sections,
//    premium section-scroll layout, each feature gets its own immersive screen.
//    Invite-only positioning = elevated brand feel for serious athletes.
//
// 3. Midday.ai (darkmodedesign.com) — dense data dashboard with clear hierarchy,
//    "business stack for founders" → adapted as "performance stack for athletes".
//    Clean metric cards, tight typographic scales, progress tracking.
//
// Palette: warm parchment white + deep forest green + saffron amber accent
// Theme: LIGHT (last design "zero" was dark → rotate to light)
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:        '#F7F4EF',   // warm parchment — Athleats editorial warmth
  surface:   '#FFFFFF',   // pure white card surfaces
  surface2:  '#EFF0EB',   // off-white secondary surface
  border:    '#E2DED8',   // warm grey border
  text:      '#1A1C18',   // near-black text
  textMid:   '#4A4D45',   // mid-tone body text
  muted:     '#9A9B93',   // muted label text
  accent:    '#2D6A4F',   // deep forest green — performance/health
  accent2:   '#F4A621',   // saffron amber — energy/fuel
  accent3:   '#E8F5E9',   // pale green tint — background wash
  warn:      '#D64C3A',   // warm red — deficit alert
  white:     '#FFFFFF',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const W = 390, H = 844;

function el(type, attrs = {}, children = []) {
  return { type, attrs, children };
}
function rect(x, y, w, h, fill, extra = {}) {
  return el('rect', { x, y, width: w, height: h, fill, ...extra });
}
function text(str, x, y, opts = {}) {
  const {
    size = 14, fill = P.text, weight = '400', anchor = 'start',
    ls = 0, opacity = 1, family = 'Inter',
  } = opts;
  return el('text', {
    x, y,
    'font-size': size,
    'font-family': family,
    'font-weight': weight,
    fill,
    'text-anchor': anchor,
    'letter-spacing': ls,
    opacity,
  }, [{ type: '__text__', value: str }]);
}
function circle(cx, cy, r, fill) {
  return el('circle', { cx, cy, r, fill });
}
function line(x1, y1, x2, y2, stroke, sw = 1, opacity = 1) {
  return el('line', { x1, y1, x2, y2, stroke, 'stroke-width': sw, opacity });
}
function rrect(x, y, w, h, rx, fill, extra = {}) {
  return el('rect', { x, y, width: w, height: h, rx, ry: rx, fill, ...extra });
}

// ── Nav bar helper (bottom) ───────────────────────────────────────────────────
function navBar(activeIdx) {
  const tabs = [
    { icon: 'home',     label: 'Today' },
    { icon: 'chart',   label: 'Macros' },
    { icon: 'search',  label: 'Recipes' },
    { icon: 'activity',label: 'Training' },
    { icon: 'user',    label: 'Profile' },
  ];
  const items = [];
  items.push(rrect(0, H - 80, W, 80, 0, P.surface, { opacity: 1 }));
  items.push(line(0, H - 80, W, H - 80, P.border));
  tabs.forEach((tab, i) => {
    const cx = 39 + i * 78;
    const isActive = i === activeIdx;
    const iconColor = isActive ? P.accent : P.muted;
    const labelColor = isActive ? P.accent : P.muted;
    // icon circle indicator
    if (isActive) items.push(rrect(cx - 18, H - 70, 36, 24, 12, P.accent3));
    // icon (simplified geometry)
    drawNavIcon(items, tab.icon, cx, H - 58, iconColor);
    items.push(text(tab.label, cx, H - 30, { size: 9, fill: labelColor, weight: isActive ? '600' : '400', anchor: 'middle' }));
  });
  return items;
}

function drawNavIcon(items, icon, cx, cy, color) {
  switch(icon) {
    case 'home':
      items.push(el('path', { d: `M${cx-8},${cy+4} L${cx},${cy-6} L${cx+8},${cy+4} L${cx+8},${cy+8} L${cx-8},${cy+8} Z`, fill: color }));
      break;
    case 'chart':
      items.push(rect(cx-8, cy+2, 5, 6, color));
      items.push(rect(cx-2, cy-2, 5, 10, color));
      items.push(rect(cx+4, cy-6, 5, 14, color));
      break;
    case 'search':
      items.push(el('circle', { cx: cx-2, cy: cy, r: 5, fill: 'none', stroke: color, 'stroke-width': 2 }));
      items.push(el('line', { x1: cx+2, y1: cy+4, x2: cx+7, y2: cy+8, stroke: color, 'stroke-width': 2 }));
      break;
    case 'activity':
      items.push(el('polyline', { points: `${cx-8},${cy} ${cx-4},${cy-5} ${cx},${cy+5} ${cx+4},${cy-3} ${cx+8},${cy}`, fill: 'none', stroke: color, 'stroke-width': 2 }));
      break;
    case 'user':
      items.push(el('circle', { cx, cy: cy-2, r: 4, fill: color }));
      items.push(el('path', { d: `M${cx-7},${cy+8} C${cx-7},${cy+3} ${cx+7},${cy+3} ${cx+7},${cy+8}`, fill: color }));
      break;
  }
}

// ── Status Bar ────────────────────────────────────────────────────────────────
function statusBar() {
  return [
    rect(0, 0, W, 44, P.bg),
    text('9:41', 20, 28, { size: 13, fill: P.text, weight: '600' }),
    text('●●●', W - 72, 28, { size: 10, fill: P.text, weight: '600' }),
    text('WiFi', W - 46, 28, { size: 10, fill: P.text }),
    text('⬜', W - 20, 28, { size: 11, fill: P.text }),
  ];
}

// ── Macro Pill ────────────────────────────────────────────────────────────────
function macroPill(x, y, label, pct, color) {
  const bw = 100, bh = 6;
  return [
    text(label, x, y - 4, { size: 9, fill: P.muted, weight: '500' }),
    rrect(x, y, bw, bh, 3, P.border),
    rrect(x, y, Math.round(bw * pct), bh, 3, color),
  ];
}

// ──────────────────────────────────────────────────────────────────────────────
// SCREEN 1 — Today's Fuel Dashboard
// ──────────────────────────────────────────────────────────────────────────────
function screen1() {
  const nodes = [];
  nodes.push(rect(0, 0, W, H, P.bg));
  nodes.push(...statusBar());

  // Header
  nodes.push(text('Good morning, Alex', 20, 68, { size: 13, fill: P.muted }));
  nodes.push(text("Today's Fuel", 20, 96, { size: 26, fill: P.text, weight: '700' }));

  // Date chip
  nodes.push(rrect(W - 100, 74, 82, 28, 14, P.accent3));
  nodes.push(text('Tue, 31 Mar', W - 59, 92, { size: 11, fill: P.accent, weight: '600', anchor: 'middle' }));

  // Hero calorie ring card
  nodes.push(rrect(20, 114, W - 40, 180, 16, P.surface));
  nodes.push(line(20, 114, W - 20, 114, P.border, 1, 0.5));

  // Ring (calories)
  const rx = 100, ry = 204, rr = 56;
  // background ring
  nodes.push(el('circle', { cx: rx, cy: ry, r: rr, fill: 'none', stroke: P.border, 'stroke-width': 10 }));
  // progress arc ~73% = 263 degrees
  nodes.push(el('path', {
    d: `M${rx},${ry - rr} A${rr},${rr} 0 1 1 ${rx + Math.sin(Math.PI * 1.46) * rr},${ry - Math.cos(Math.PI * 1.46) * rr}`,
    fill: 'none', stroke: P.accent, 'stroke-width': 10, 'stroke-linecap': 'round'
  }));
  nodes.push(text('1,847', rx, ry - 10, { size: 22, fill: P.text, weight: '700', anchor: 'middle' }));
  nodes.push(text('kcal eaten', rx, ry + 12, { size: 9, fill: P.muted, anchor: 'middle' }));
  nodes.push(text('of 2,520', rx, ry + 28, { size: 11, fill: P.accent, weight: '600', anchor: 'middle' }));

  // Macro breakdown (right side of ring card)
  const mx = 196, my = 156;
  nodes.push(text('MACROS', mx, my, { size: 9, fill: P.muted, weight: '600', ls: 1 }));

  // Carbs
  nodes.push(...macroPill(mx, my + 14, 'Carbs', 0.81, P.accent2));
  nodes.push(text('243g', mx + 108, my + 18, { size: 10, fill: P.text, weight: '600' }));

  // Protein
  nodes.push(...macroPill(mx, my + 42, 'Protein', 0.66, P.accent));
  nodes.push(text('118g', mx + 108, my + 46, { size: 10, fill: P.text, weight: '600' }));

  // Fat
  nodes.push(...macroPill(mx, my + 70, 'Fat', 0.58, '#C0A870'));
  nodes.push(text('54g', mx + 108, my + 74, { size: 10, fill: P.text, weight: '600' }));

  // Water strip
  nodes.push(rrect(mx, my + 90, 168, 30, 8, P.accent3));
  nodes.push(text('💧 Water', mx + 8, my + 109, { size: 10, fill: P.accent, weight: '600' }));
  nodes.push(text('2.1 / 3L', mx + 108, my + 109, { size: 10, fill: P.accent, weight: '700', anchor: 'end' }));
  nodes.push(rrect(mx + 6, my + 114, 156, 4, 2, P.border));
  nodes.push(rrect(mx + 6, my + 114, 112, 4, 2, '#74B5E4'));

  // Upcoming meal section
  nodes.push(text('NEXT MEAL', 20, 318, { size: 9, fill: P.muted, weight: '600', ls: 1.5 }));
  nodes.push(text('Pre-Ride Lunch  ·  In 1h 40m', 20, 336, { size: 14, fill: P.text, weight: '600' }));

  // Meal card
  nodes.push(rrect(20, 344, W - 40, 76, 12, P.surface));
  nodes.push(rrect(20, 344, 76, 76, 12, P.accent2, { opacity: 0.15 })); // photo placeholder
  nodes.push(text('🍝', 42, 392, { size: 28 }));
  nodes.push(text('Pasta Primavera Bowl', 112, 370, { size: 14, fill: P.text, weight: '600' }));
  nodes.push(text('580 kcal  ·  72g carbs  ·  24g protein', 112, 389, { size: 10, fill: P.muted }));
  nodes.push(rrect(112, 397, 64, 20, 10, P.accent3));
  nodes.push(text('High Carb', 144, 411, { size: 9, fill: P.accent, weight: '600', anchor: 'middle' }));
  nodes.push(rrect(182, 397, 48, 20, 10, '#FFF3DB'));
  nodes.push(text('Pre-ride', 206, 411, { size: 9, fill: '#B07D20', weight: '600', anchor: 'middle' }));

  // Today's log
  nodes.push(text("TODAY'S LOG", 20, 446, { size: 9, fill: P.muted, weight: '600', ls: 1.5 }));
  nodes.push(text('See all', W - 20, 446, { size: 11, fill: P.accent, weight: '600', anchor: 'end' }));

  const meals = [
    { emoji: '🥣', name: 'Oat & Banana Bowl', time: '7:15', kcal: '410', tag: 'Breakfast' },
    { emoji: '🍌', name: 'Banana + Peanut Butter', time: '10:00', kcal: '230', tag: 'Snack' },
    { emoji: '🍗', name: 'Chicken Rice Bowl', time: '12:30', kcal: '620', tag: 'Lunch' },
  ];
  meals.forEach((m, i) => {
    const my2 = 458 + i * 56;
    nodes.push(rrect(20, my2, W - 40, 50, 10, P.surface));
    nodes.push(text(m.emoji, 38, my2 + 32, { size: 20 }));
    nodes.push(text(m.name, 66, my2 + 22, { size: 13, fill: P.text, weight: '500' }));
    nodes.push(text(m.time, 66, my2 + 38, { size: 10, fill: P.muted }));
    nodes.push(rrect(134, my2 + 30, 46, 16, 8, P.accent3));
    nodes.push(text(m.tag, 157, my2 + 42, { size: 8, fill: P.accent, weight: '600', anchor: 'middle' }));
    nodes.push(text(m.kcal + ' kcal', W - 30, my2 + 30, { size: 12, fill: P.text, weight: '600', anchor: 'end' }));
  });

  nodes.push(...navBar(0));
  return nodes;
}

// ──────────────────────────────────────────────────────────────────────────────
// SCREEN 2 — Macro Analysis Dashboard (Midday-inspired dense data)
// ──────────────────────────────────────────────────────────────────────────────
function screen2() {
  const nodes = [];
  nodes.push(rect(0, 0, W, H, P.bg));
  nodes.push(...statusBar());

  // Header
  nodes.push(text('Macro Breakdown', 20, 84, { size: 24, fill: P.text, weight: '700' }));
  nodes.push(text('7-day performance view', 20, 106, { size: 13, fill: P.muted }));

  // Period selector
  ['3D','7D','2W','1M'].forEach((period, i) => {
    const active = i === 1;
    const x = 20 + i * 72;
    nodes.push(rrect(x, 118, 60, 28, 14, active ? P.accent : P.surface));
    nodes.push(text(period, x + 30, 136, { size: 11, fill: active ? P.white : P.muted, weight: '600', anchor: 'middle' }));
  });

  // Macro summary cards (4 cards)
  const cards = [
    { label: 'Calories', val: '2,284', unit: 'avg/day', pct: '+4%', up: true, color: P.accent },
    { label: 'Protein',  val: '142g',  unit: 'avg/day', pct: '+11%', up: true, color: P.accent },
    { label: 'Carbs',    val: '287g',  unit: 'avg/day', pct: '-3%',  up: false, color: P.accent2 },
    { label: 'Fat',      val: '71g',   unit: 'avg/day', pct: '+2%',  up: true, color: '#C0A870' },
  ];
  const cw = 166, ch = 86;
  cards.forEach((c, i) => {
    const cx = 20 + (i % 2) * (cw + 18);
    const cy = 160 + Math.floor(i / 2) * (ch + 12);
    nodes.push(rrect(cx, cy, cw, ch, 12, P.surface));
    nodes.push(text(c.label, cx + 12, cy + 22, { size: 10, fill: P.muted, weight: '500' }));
    nodes.push(text(c.val, cx + 12, cy + 50, { size: 22, fill: P.text, weight: '700' }));
    nodes.push(text(c.unit, cx + 12, cy + 66, { size: 9, fill: P.muted }));
    const pctColor = c.up ? P.accent : P.warn;
    nodes.push(rrect(cx + cw - 44, cy + 10, 34, 18, 9, c.up ? P.accent3 : '#FDE8E6'));
    nodes.push(text(c.pct, cx + cw - 27, cy + 22, { size: 9, fill: pctColor, weight: '700', anchor: 'middle' }));
    // mini sparkline
    const sparkY = cy + 74, sparkX = cx + cw - 60;
    const points = [0, 0.4, 0.2, 0.7, 0.5, 0.9, 0.8];
    for (let j = 0; j < points.length - 1; j++) {
      nodes.push(line(sparkX + j * 8, sparkY - points[j] * 12, sparkX + (j+1) * 8, sparkY - points[j+1] * 12, c.color, 1.5));
    }
  });

  // Weekly bar chart
  nodes.push(text('CALORIE TREND', 20, 380, { size: 9, fill: P.muted, weight: '600', ls: 1.5 }));
  nodes.push(rrect(20, 390, W - 40, 160, 12, P.surface));
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const vals = [0.76, 0.82, 0.95, 0.88, 0.72, 1.0, 0.91];
  const barW = 28, chartH = 100, chartY = 470;
  days.forEach((d, i) => {
    const bx = 36 + i * 46;
    const bh = Math.round(vals[i] * chartH);
    const isToday = i === 5;
    nodes.push(rrect(bx, chartY - bh, barW, bh, 4, isToday ? P.accent : P.accent3));
    if (isToday) nodes.push(rrect(bx, chartY - bh - 16, barW, 14, 7, P.accent));
    if (isToday) nodes.push(text('2,520', bx + barW/2, chartY - bh - 5, { size: 7, fill: P.white, anchor: 'middle', weight: '700' }));
    nodes.push(text(d, bx + barW/2, chartY + 16, { size: 9, fill: isToday ? P.accent : P.muted, anchor: 'middle', weight: isToday ? '700' : '400' }));
  });

  // Goal adherence section
  nodes.push(text('GOAL ADHERENCE', 20, 574, { size: 9, fill: P.muted, weight: '600', ls: 1.5 }));
  const goals = [
    { label: 'Calorie Target',  pct: 0.87, note: '6/7 days' },
    { label: 'Protein Goal',    pct: 0.71, note: '5/7 days' },
    { label: 'Hydration',       pct: 0.57, note: '4/7 days' },
  ];
  goals.forEach((g, i) => {
    const gy = 590 + i * 50;
    nodes.push(rrect(20, gy, W - 40, 42, 10, P.surface));
    nodes.push(text(g.label, 32, gy + 16, { size: 12, fill: P.text, weight: '500' }));
    nodes.push(text(g.note, W - 30, gy + 16, { size: 10, fill: P.muted, anchor: 'end' }));
    const bw = W - 80;
    nodes.push(rrect(32, gy + 26, bw, 6, 3, P.border));
    nodes.push(rrect(32, gy + 26, Math.round(bw * g.pct), 6, 3, g.pct >= 0.8 ? P.accent : P.accent2));
    nodes.push(text(`${Math.round(g.pct * 100)}%`, W - 30, gy + 32, { size: 9, fill: P.accent, weight: '700', anchor: 'end' }));
  });

  nodes.push(...navBar(1));
  return nodes;
}

// ──────────────────────────────────────────────────────────────────────────────
// SCREEN 3 — Recipe Discovery (Atlas Card editorial photography influence)
// ──────────────────────────────────────────────────────────────────────────────
function screen3() {
  const nodes = [];
  nodes.push(rect(0, 0, W, H, P.bg));
  nodes.push(...statusBar());

  // Header
  nodes.push(text('Recipes', 20, 84, { size: 26, fill: P.text, weight: '700' }));

  // Search bar
  nodes.push(rrect(20, 98, W - 40, 42, 21, P.surface));
  nodes.push(line(20, 98, W - 20, 98, P.border, 1, 0.8));
  nodes.push(text('🔍', 38, 124, { size: 14 }));
  nodes.push(text('Search recipes, ingredients…', 60, 124, { size: 13, fill: P.muted }));

  // Category pills
  const cats = ['All', 'Pre-Ride', 'Recovery', 'Race Day', 'Snacks'];
  cats.forEach((c, i) => {
    const active = i === 0;
    const cw = c.length * 7.5 + 22;
    const cx = 20 + cats.slice(0, i).reduce((a, b) => a + b.length * 7.5 + 30, 0);
    nodes.push(rrect(cx, 150, cw, 28, 14, active ? P.accent : P.surface));
    nodes.push(text(c, cx + cw/2, 168, { size: 11, fill: active ? P.white : P.muted, weight: active ? '600' : '400', anchor: 'middle' }));
  });

  // Featured hero recipe card (Atlas Card full-bleed influence)
  nodes.push(rrect(20, 192, W - 40, 180, 16, P.accent2, { opacity: 0.12 }));
  nodes.push(rrect(20, 192, W - 40, 180, 16, P.surface));
  // photo area (editorial warmth)
  nodes.push(rrect(20, 192, W - 40, 110, 16, '#F0E8D6'));
  nodes.push(rrect(20, 248, W - 40, 44, 0, '#F0E8D6')); // remove bottom radius
  nodes.push(text('🍲', W/2 - 20, 264, { size: 48, anchor: 'middle' }));
  // label badge
  nodes.push(rrect(32, 204, 72, 20, 10, P.accent));
  nodes.push(text('FEATURED', 68, 218, { size: 8, fill: P.white, weight: '700', ls: 1, anchor: 'middle' }));
  nodes.push(text('Beetroot & Lentil Power Bowl', 32, 330, { size: 16, fill: P.text, weight: '700' }));
  nodes.push(text('620 kcal  ·  38g protein  ·  52g carbs  ·  18g fat', 32, 350, { size: 10, fill: P.muted }));
  nodes.push(rrect(32, 358, 56, 18, 9, P.accent3));
  nodes.push(text('Recovery', 60, 371, { size: 9, fill: P.accent, weight: '600', anchor: 'middle' }));
  nodes.push(rrect(96, 358, 60, 18, 9, '#FFF3DB'));
  nodes.push(text('High Protein', 126, 371, { size: 9, fill: '#B07D20', weight: '600', anchor: 'middle' }));
  nodes.push(text('View Recipe →', W - 30, 371, { size: 11, fill: P.accent, weight: '600', anchor: 'end' }));

  // Grid: 4 recipe cards 2x2
  nodes.push(text('FOR YOUR TRAINING', 20, 396, { size: 9, fill: P.muted, weight: '600', ls: 1.5 }));

  const recipes = [
    { emoji: '🥑', name: 'Avocado Toast Stack', kcal: '390', tag: 'Pre-Ride' },
    { emoji: '🍌', name: 'Banana Recovery Shake', kcal: '280', tag: 'Recovery' },
    { emoji: '🥗', name: 'Quinoa Salad Bowl', kcal: '440', tag: 'Lunch' },
    { emoji: '🍫', name: 'Dark Choc Energy Bites', kcal: '160', tag: 'Snack' },
  ];
  const rw = 162, rh = 90;
  recipes.forEach((r, i) => {
    const rx = 20 + (i % 2) * (rw + 14);
    const ry = 408 + Math.floor(i / 2) * (rh + 12);
    nodes.push(rrect(rx, ry, rw, rh, 12, P.surface));
    nodes.push(rrect(rx, ry, rw, 42, 12, i % 2 === 0 ? P.accent3 : '#FFF3DB'));
    nodes.push(rrect(rx, ry + 26, rw, 16, 0, i % 2 === 0 ? P.accent3 : '#FFF3DB')); // fill corner
    nodes.push(text(r.emoji, rx + rw/2, ry + 30, { size: 22, anchor: 'middle' }));
    nodes.push(text(r.name, rx + 10, ry + 58, { size: 11, fill: P.text, weight: '600' }));
    nodes.push(text(r.kcal + ' kcal', rx + 10, ry + 74, { size: 9, fill: P.muted }));
    nodes.push(rrect(rx + rw - 58, ry + 64, 48, 16, 8, P.accent3));
    nodes.push(text(r.tag, rx + rw - 34, ry + 76, { size: 7.5, fill: P.accent, weight: '600', anchor: 'middle' }));
  });

  nodes.push(...navBar(2));
  return nodes;
}

// ──────────────────────────────────────────────────────────────────────────────
// SCREEN 4 — Training Sync (link between nutrition and workouts)
// ──────────────────────────────────────────────────────────────────────────────
function screen4() {
  const nodes = [];
  nodes.push(rect(0, 0, W, H, P.bg));
  nodes.push(...statusBar());

  // Header
  nodes.push(text('Training Sync', 20, 84, { size: 24, fill: P.text, weight: '700' }));
  nodes.push(text('Fuel matched to your workouts', 20, 106, { size: 13, fill: P.muted }));

  // Today's workout card — hero
  nodes.push(rrect(20, 120, W - 40, 148, 16, P.accent));
  nodes.push(text("TODAY'S RIDE", 32, 148, { size: 9, fill: 'rgba(255,255,255,0.6)', weight: '600', ls: 1.5 }));
  nodes.push(text('Long Endurance Ride', 32, 174, { size: 18, fill: P.white, weight: '700' }));
  nodes.push(text('4h 30m  ·  ~2,800 kcal burn', 32, 196, { size: 12, fill: 'rgba(255,255,255,0.75)' }));

  // Divider
  nodes.push(line(32, 210, W - 32, 210, 'rgba(255,255,255,0.2)'));

  // Stats row
  const stats = [['Pre-Ride', '580 kcal'], ['During', '960 kcal'], ['Post-Ride', '620 kcal']];
  stats.forEach((s, i) => {
    const sx = 32 + i * 112;
    nodes.push(text(s[0], sx, 230, { size: 9, fill: 'rgba(255,255,255,0.6)' }));
    nodes.push(text(s[1], sx, 250, { size: 13, fill: P.white, weight: '700' }));
  });

  // Fuel plan section
  nodes.push(text('FUEL PLAN', 20, 290, { size: 9, fill: P.muted, weight: '600', ls: 1.5 }));
  nodes.push(text('Recommended intake today', 20, 308, { size: 15, fill: P.text, weight: '600' }));

  const fuelItems = [
    { time: '7:00 AM', desc: 'Oat + Banana Pre-Ride Bowl', kcal: '580 kcal', phase: 'Pre-Ride', done: true },
    { time: '10:30 AM', desc: 'Gel + Banana (every 45m)', kcal: '240 kcal', phase: 'During', done: true },
    { time: '1:00 PM', desc: 'Isotonic drink + dates', kcal: '180 kcal', phase: 'During', done: false },
    { time: '3:30 PM', desc: 'Recovery Protein Shake', kcal: '360 kcal', phase: 'Post-Ride', done: false },
    { time: '7:00 PM', desc: 'Pasta + Salmon Dinner', kcal: '720 kcal', phase: 'Post-Ride', done: false },
  ];
  fuelItems.forEach((fi, i) => {
    const fy = 320 + i * 72;
    nodes.push(rrect(20, fy, W - 40, 64, 10, fi.done ? P.surface2 : P.surface));
    if (fi.done) {
      nodes.push(circle(36, fy + 32, 10, P.accent));
      nodes.push(text('✓', 36, fy + 37, { size: 11, fill: P.white, anchor: 'middle', weight: '700' }));
    } else {
      nodes.push(circle(36, fy + 32, 10, P.border));
      nodes.push(circle(36, fy + 32, 4, P.muted));
    }
    nodes.push(text(fi.time, 56, fy + 22, { size: 10, fill: P.muted }));
    nodes.push(text(fi.desc, 56, fy + 40, { size: 13, fill: fi.done ? P.muted : P.text, weight: '500' }));
    nodes.push(text(fi.kcal, W - 30, fy + 32, { size: 12, fill: fi.done ? P.muted : P.text, weight: '600', anchor: 'end' }));
    const phaseColor = fi.phase === 'Pre-Ride' ? P.accent3 : fi.phase === 'During' ? '#FFF3DB' : '#F0EBF8';
    const phaseText  = fi.phase === 'Pre-Ride' ? P.accent : fi.phase === 'During' ? '#B07D20' : '#7B5EA7';
    nodes.push(rrect(W - 30 - fi.phase.length * 6 - 18, fy + 10, fi.phase.length * 6 + 18, 18, 9, phaseColor));
    nodes.push(text(fi.phase, W - 21, fy + 22, { size: 8, fill: phaseText, weight: '600', anchor: 'end' }));
  });

  nodes.push(...navBar(3));
  return nodes;
}

// ──────────────────────────────────────────────────────────────────────────────
// SCREEN 5 — Weekly Review (Atlas Card immersive section feel)
// ──────────────────────────────────────────────────────────────────────────────
function screen5() {
  const nodes = [];
  nodes.push(rect(0, 0, W, H, P.bg));
  nodes.push(...statusBar());

  // Header
  nodes.push(text('Weekly Review', 20, 84, { size: 24, fill: P.text, weight: '700' }));
  nodes.push(text('Mar 24 – Mar 30, 2026', 20, 106, { size: 13, fill: P.muted }));

  // Hero summary band — editorial warmth
  nodes.push(rrect(20, 120, W - 40, 100, 16, '#F0E8D6'));
  nodes.push(text('PERFORMANCE SCORE', 32, 144, { size: 9, fill: '#8A7040', weight: '600', ls: 1.5 }));
  nodes.push(text('87', 32, 196, { size: 52, fill: P.text, weight: '800' }));
  nodes.push(text('/100', 94, 196, { size: 20, fill: P.muted, weight: '400' }));
  nodes.push(text('↑ +6 from last week', 32, 214, { size: 12, fill: P.accent, weight: '600' }));

  // Score breakdown
  nodes.push(rrect(200, 130, 144, 76, 12, P.surface));
  const scores = [
    { label: 'Nutrition',  val: 91, color: P.accent },
    { label: 'Hydration',  val: 74, color: '#74B5E4' },
    { label: 'Consistency', val: 84, color: P.accent2 },
  ];
  scores.forEach((s, i) => {
    const sy = 144 + i * 22;
    nodes.push(text(s.label, 212, sy, { size: 9, fill: P.muted }));
    nodes.push(rrect(272, sy - 9, 62, 7, 3.5, P.border));
    nodes.push(rrect(272, sy - 9, Math.round(62 * s.val / 100), 7, 3.5, s.color));
    nodes.push(text(s.val + '', 338, sy, { size: 9, fill: P.text, weight: '700', anchor: 'end' }));
  });

  // Insights
  nodes.push(text('AI INSIGHTS', 20, 246, { size: 9, fill: P.muted, weight: '600', ls: 1.5 }));

  const insights = [
    { emoji: '🏆', head: 'Best protein week yet', body: 'Averaged 142g/day — 18% above your goal', color: P.accent3, tcolor: P.accent },
    { emoji: '⚡', head: 'Pre-ride fueling optimized', body: 'Carb loading 90m before rides improved your HR response', color: '#FFF3DB', tcolor: '#B07D20' },
    { emoji: '💧', head: 'Hydration needs work', body: 'Hit 3L target only 4 of 7 days — focus on morning hydration', color: '#EBF4FB', tcolor: '#2E7DBB' },
  ];
  insights.forEach((ins, i) => {
    const iy = 260 + i * 82;
    nodes.push(rrect(20, iy, W - 40, 74, 12, P.surface));
    nodes.push(rrect(20, iy, 6, 74, 3, ins.tcolor));
    nodes.push(rrect(34, iy + 12, 42, 42, 8, ins.color));
    nodes.push(text(ins.emoji, 55, iy + 40, { size: 22, anchor: 'middle' }));
    nodes.push(text(ins.head, 86, iy + 28, { size: 13, fill: P.text, weight: '700' }));
    nodes.push(text(ins.body, 86, iy + 46, { size: 10, fill: P.muted }));
    nodes.push(text(ins.body.length > 42 ? ins.body.slice(0, 44) + '…' : ins.body, 86, iy + 58, { size: 10, fill: P.muted }));
  });

  // Next week plan teaser
  nodes.push(rrect(20, 512, W - 40, 56, 12, P.accent));
  nodes.push(text('Next Week -  Taper Phase', 32, 534, { size: 14, fill: P.white, weight: '700' }));
  nodes.push(text('Lower volume → higher carb ratio. Plan ready.', 32, 554, { size: 11, fill: 'rgba(255,255,255,0.75)' }));
  nodes.push(text('View Plan →', W - 30, 544, { size: 12, fill: P.white, weight: '600', anchor: 'end' }));

  // Weekly stats strip
  nodes.push(text('WEEKLY TOTALS', 20, 588, { size: 9, fill: P.muted, weight: '600', ls: 1.5 }));
  const totals = [
    { label: 'Avg Calories', val: '2,284', unit: 'kcal/day' },
    { label: 'Total Protein', val: '994g', unit: '7-day total' },
    { label: 'Ride Fueling', val: '6/7', unit: 'rides logged' },
    { label: 'Avg Water', val: '2.7L', unit: 'per day' },
  ];
  totals.forEach((t, i) => {
    const tw = (W - 40) / 2 - 8;
    const tx = 20 + (i % 2) * (tw + 16);
    const ty = 600 + Math.floor(i / 2) * 60;
    nodes.push(rrect(tx, ty, tw, 52, 10, P.surface));
    nodes.push(text(t.label, tx + 10, ty + 18, { size: 9, fill: P.muted }));
    nodes.push(text(t.val, tx + 10, ty + 40, { size: 18, fill: P.text, weight: '700' }));
    nodes.push(text(t.unit, tx + 10 + t.val.length * 10, ty + 40, { size: 9, fill: P.muted }));
  });

  nodes.push(...navBar(4));
  return nodes;
}

// ── SVG serializer ────────────────────────────────────────────────────────────
function serialize(node) {
  if (node.type === '__text__') return node.value;
  const attrs = Object.entries(node.attrs || {})
    .map(([k, v]) => `${k}="${String(v).replace(/"/g, '&quot;')}"`)
    .join(' ');
  const children = (node.children || []).map(serialize).join('');
  return `<${node.type}${attrs ? ' ' + attrs : ''}>${children}</${node.type}>`;
}

function toSVG(nodes, w = W, h = H) {
  const inner = nodes.map(serialize).join('\n  ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n  <defs><style>text{font-family:'Inter',system-ui,sans-serif;}</style></defs>\n  ${inner}\n</svg>`;
}

// ── Build screens ─────────────────────────────────────────────────────────────
const screens = [
  { id: 'today',    label: "Today's Fuel",     nodes: screen1() },
  { id: 'macros',   label: 'Macro Analysis',   nodes: screen2() },
  { id: 'recipes',  label: 'Recipe Discovery', nodes: screen3() },
  { id: 'training', label: 'Training Sync',    nodes: screen4() },
  { id: 'review',   label: 'Weekly Review',    nodes: screen5() },
];

// ── Assemble .pen file ────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  meta: {
    name:        'PACE',
    tagline:     'Precision fuel for endurance athletes',
    description: 'A LIGHT-mode performance nutrition tracker built for endurance athletes. Inspired by Athleats on land-book.com and Atlas Card editorial photography. Warm parchment palette with forest green and saffron amber accents.',
    author:      'RAM Design Heartbeat',
    created:     new Date().toISOString(),
    theme:       'light',
    platform:    'mobile',
    dimensions:  { width: W, height: H },
    palette: {
      bg:      P.bg,
      surface: P.surface,
      text:    P.text,
      accent:  P.accent,
      accent2: P.accent2,
      muted:   P.muted,
    },
  },
  screens: screens.map(s => ({
    id:    s.id,
    label: s.label,
    svg:   toSVG(s.nodes),
  })),
};

const outPath = path.join(__dirname, 'pace.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log('✓ pace.pen written');
console.log(`  Screens: ${pen.screens.length}`);
console.log(`  Theme: LIGHT — warm parchment #F7F4EF`);
console.log(`  Accent: forest green #2D6A4F + saffron amber #F4A621`);
console.log(`  Inspired by: Athleats (land-book), Atlas Card (godly.website), Midday.ai (darkmodedesign)`);
