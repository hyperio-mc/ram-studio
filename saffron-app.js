'use strict';
// SAFFRON — Recipe & Meal Planning App
// RAM Design Heartbeat #45
// Theme: Light
// Inspiration: Land-book earthy/sustainable palette (sage green, terracotta, warm cream)
//              + Minimal.gallery "typography-as-brand" trend from KOMETA Typefaces
// Palette: Warm Parchment base, Paprika accent, Herb Green accent2

const fs   = require('fs');
const path = require('path');

const SLUG = 'saffron';
const NAME = 'SAFFRON';
const HB   = 45;
const W    = 390;
const H    = 844;

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#FAF6EE',   // warm cream / parchment
  surf:     '#FFFFFF',   // pure white surfaces
  card:     '#F2EBD9',   // warm parchment card
  card2:    '#EEF4EC',   // sage-tinted card
  text:     '#1E1712',   // dark brown-black
  textMed:  '#5C4A3A',   // medium brown
  textMut:  '#9E8878',   // muted warm gray
  accent:   '#C4420F',   // paprika / spice orange-red
  accent2:  '#3B6B4A',   // herb green
  accentLt: '#F5D5C5',   // light paprika tint
  greenLt:  '#C8DFC0',   // light herb green
  stroke:   '#E8DFD0',   // warm border
  tag1:     '#F9E4B7',   // saffron/yellow tag bg
  tag1t:    '#7A5A00',   // saffron tag text
  tag2:     '#D4EDD4',   // green tag bg
  tag2t:    '#1E4D2B',   // green tag text
  tag3:     '#FCE3D8',   // paprika tag bg
  tag3t:    '#7A2200',   // paprika tag text
  white:    '#FFFFFF',
  star:     '#E8A020',
};

// ── Primitives ────────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, o = {}) {
  return { type: 'rect', x, y, width: w, height: h, fill,
    rx: o.rx || 0, opacity: o.opacity ?? 1,
    stroke: o.stroke || 'none', strokeWidth: o.sw || 0 };
}
function text(x, y, content, size, fill, o = {}) {
  return { type: 'text', x, y, content: String(content), fontSize: size, fill,
    fontWeight: o.fw || 400, fontFamily: o.font || 'Georgia, serif',
    textAnchor: o.anchor || 'start', letterSpacing: o.ls || 0,
    opacity: o.opacity ?? 1 };
}
function circle(cx, cy, r, fill, o = {}) {
  return { type: 'circle', cx, cy, r, fill,
    opacity: o.opacity ?? 1, stroke: o.stroke || 'none', strokeWidth: o.sw || 0 };
}
function line(x1, y1, x2, y2, stroke, o = {}) {
  return { type: 'line', x1, y1, x2, y2, stroke,
    strokeWidth: o.sw || 1, opacity: o.opacity ?? 1 };
}
function pill(x, y, w, h, fill, o = {}) {
  return rect(x, y, w, h, fill, { ...o, rx: h / 2 });
}

// ── Status Bar ────────────────────────────────────────────────────────────────
function statusBar() {
  return [
    text(20, 52, '9:41', 15, P.text, { fw: 600, font: 'system-ui' }),
    text(320, 52, '●●●  WiFi  ⬛', 12, P.text, { opacity: 0.6, font: 'system-ui' }),
  ];
}

// ── Bottom Nav ────────────────────────────────────────────────────────────────
function bottomNav(active) {
  const tabs = ['Today', 'Recipes', 'Pantry', 'Discover', 'List'];
  const icons = ['◎', '⊞', '⊟', '✦', '☑'];
  const els = [];
  els.push(rect(0, H - 80, W, 80, P.surf, { stroke: P.stroke, sw: 1 }));
  tabs.forEach((t, i) => {
    const x = 39 + i * 62;
    const isAct = i === active;
    const fill = isAct ? P.accent : P.textMut;
    els.push(circle(x + 7, H - 55, isAct ? 14 : 0, P.accentLt));
    els.push(text(x, H - 48, icons[i], 18, fill, { anchor: 'middle', fw: isAct ? 700 : 400, font: 'system-ui' }));
    els.push(text(x, H - 26, t, 10, fill, { anchor: 'middle', fw: isAct ? 700 : 400, font: 'system-ui' }));
  });
  return els;
}

// ── SCREEN 1: TODAY'S PLAN ────────────────────────────────────────────────────
function screen1() {
  const els = [];
  // Background
  els.push(rect(0, 0, W, H, P.bg));

  // Status bar
  els.push(...statusBar());

  // Header
  els.push(text(20, 96, 'Good morning, Alex', 14, P.textMut, { font: 'Georgia, serif', ls: 0.3 }));
  els.push(text(20, 124, "Today's Plan", 28, P.text, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(20, 148, 'Saturday, April 11', 13, P.textMut, { font: 'system-ui' }));

  // Macro ring summary card
  els.push(rect(20, 164, W - 40, 110, P.surf, { rx: 16, stroke: P.stroke, sw: 1 }));
  els.push(circle(68, 219, 36, P.card2));
  // Ring arcs as circles with stroke
  els.push(circle(68, 219, 30, 'none', { stroke: P.accentLt, sw: 7 }));
  els.push(circle(68, 219, 30, 'none', { stroke: P.accent, sw: 7, opacity: 0.85 }));
  els.push(text(68, 215, '1,840', 11, P.text, { fw: 700, anchor: 'middle', font: 'system-ui' }));
  els.push(text(68, 229, 'kcal', 9, P.textMut, { anchor: 'middle', font: 'system-ui' }));
  // Macro bars
  const macros = [
    { label: 'Carbs', val: '210g', pct: 0.68, fill: P.tag1, text: P.tag1t },
    { label: 'Protein', val: '88g', pct: 0.55, fill: P.greenLt, text: P.tag2t },
    { label: 'Fat', val: '54g', pct: 0.40, fill: P.accentLt, text: P.tag3t },
  ];
  macros.forEach((m, i) => {
    const bx = 126, by = 178 + i * 30, bw = 200, bh = 14;
    els.push(text(bx, by + 11, m.label, 11, P.textMed, { fw: 600, font: 'system-ui' }));
    els.push(rect(bx + 54, by + 2, bw - 90, bh, P.card, { rx: 7 }));
    els.push(rect(bx + 54, by + 2, Math.round((bw - 90) * m.pct), bh, m.fill, { rx: 7 }));
    els.push(text(bx + bw - 30, by + 11, m.val, 11, P.textMed, { anchor: 'end', font: 'system-ui' }));
  });

  // Meal cards
  const meals = [
    { label: 'Breakfast', time: '8:00 AM', name: 'Avocado Toast & Egg', cal: '420 kcal', color: P.tag1, ct: P.tag1t, done: true },
    { label: 'Lunch', time: '12:30 PM', name: 'Lemon Herb Quinoa Bowl', cal: '580 kcal', color: P.tag2, ct: P.tag2t, done: true },
    { label: 'Dinner', time: '7:00 PM', name: 'Salmon with Roasted Veg', cal: '640 kcal', color: P.card, ct: P.textMed, done: false },
    { label: 'Snack', time: '3:00 PM', name: 'Greek Yogurt & Berries', cal: '200 kcal', color: P.tag3, ct: P.tag3t, done: false },
  ];
  meals.forEach((m, i) => {
    const cy = 290 + i * 100;
    els.push(rect(20, cy, W - 40, 90, P.surf, { rx: 14, stroke: P.stroke, sw: 1 }));
    // Meal color tab
    els.push(rect(20, cy, 6, 90, m.done ? P.accent2 : P.stroke, { rx: 3 }));
    // Pill tag
    els.push(pill(34, cy + 14, 68, 20, m.color));
    els.push(text(68, cy + 27, m.label, 10, m.ct, { anchor: 'middle', fw: 600, font: 'system-ui' }));
    els.push(text(34, cy + 48, m.name, 13, P.text, { fw: 600, font: 'Georgia, serif' }));
    els.push(text(34, cy + 66, m.time + '  ·  ' + m.cal, 11, P.textMut, { font: 'system-ui' }));
    // Check / add icon
    const icFill = m.done ? P.accent2 : P.stroke;
    els.push(circle(W - 48, cy + 45, 14, icFill));
    els.push(text(W - 48, cy + 50, m.done ? '✓' : '+', 14, m.done ? P.white : P.textMut, { anchor: 'middle', fw: 700, font: 'system-ui' }));
  });

  // Bottom nav
  els.push(...bottomNav(0));

  return { name: "Today's Plan", elements: els };
}

// ── SCREEN 2: RECIPES BROWSE ─────────────────────────────────────────────────
function screen2() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  els.push(...statusBar());

  // Header
  els.push(text(20, 96, 'RECIPES', 11, P.textMut, { fw: 700, font: 'system-ui', ls: 2.5 }));
  els.push(text(20, 124, 'What to cook?', 26, P.text, { fw: 700, font: 'Georgia, serif' }));

  // Search bar
  els.push(rect(20, 138, W - 40, 40, P.surf, { rx: 20, stroke: P.stroke, sw: 1 }));
  els.push(text(44, 163, '⌕', 16, P.textMut, { font: 'system-ui' }));
  els.push(text(66, 163, 'Search 4,200+ recipes', 13, P.textMut, { font: 'system-ui' }));

  // Filter pills
  const filters = ['All', 'Quick (<30m)', 'Vegetarian', 'High Protein', 'Seasonal'];
  let fx = 20;
  filters.forEach((f, i) => {
    const pw = f.length * 7.5 + 20;
    const isAct = i === 0;
    els.push(pill(fx, 192, pw, 28, isAct ? P.accent : P.surf, { stroke: isAct ? 'none' : P.stroke, sw: 1 }));
    els.push(text(fx + pw / 2, 210, f, 11, isAct ? P.white : P.textMed, { anchor: 'middle', fw: isAct ? 700 : 400, font: 'system-ui' }));
    fx += pw + 8;
  });

  // Category label
  els.push(text(20, 246, 'Spring Seasonal', 13, P.textMed, { fw: 700, font: 'system-ui' }));
  els.push(text(W - 20, 246, 'See all →', 12, P.accent, { anchor: 'end', font: 'system-ui' }));

  // Featured recipe card (large)
  els.push(rect(20, 258, W - 40, 140, P.card, { rx: 16 }));
  // Color block as "image" — editorial style (typography-as-image, Minimal.gallery trend)
  els.push(rect(20, 258, 130, 140, P.accent2, { rx: 16 }));
  els.push(rect(130, 258, 10, 140, P.accent2)); // fill gap
  els.push(text(85, 325, '🌿', 32, P.white, { anchor: 'middle', font: 'system-ui' }));
  els.push(text(150, 282, 'SPRING SPECIAL', 9, P.textMut, { fw: 700, ls: 1.8, font: 'system-ui' }));
  els.push(text(150, 302, 'Asparagus &', 16, P.text, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(150, 320, 'Pea Risotto', 16, P.text, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(150, 342, '45 min  ·  4 servings', 11, P.textMut, { font: 'system-ui' }));
  // Stars
  [0,1,2,3,4].forEach(s => {
    els.push(text(150 + s * 16, 360, '★', 12, P.star, { font: 'system-ui' }));
  });
  els.push(text(232, 360, '4.9 (312)', 11, P.textMut, { font: 'system-ui' }));
  // Tags
  els.push(pill(150, 370, 60, 18, P.tag2));
  els.push(text(180, 382, 'Vegetarian', 9, P.tag2t, { anchor: 'middle', fw: 600, font: 'system-ui' }));
  els.push(pill(216, 370, 48, 18, P.tag1));
  els.push(text(240, 382, 'Seasonal', 9, P.tag1t, { anchor: 'middle', fw: 600, font: 'system-ui' }));

  // Row of smaller recipe cards
  const sRecipes = [
    { name: 'Herb Lamb Chops', time: '25 min', cal: '480', bg: P.accentLt, icon: '🍖' },
    { name: 'Mango Salsa Bowl', time: '15 min', cal: '310', bg: P.tag1, icon: '🥭' },
    { name: 'Baked Salmon', time: '30 min', cal: '520', bg: P.greenLt, icon: '🐟' },
  ];
  sRecipes.forEach((r, i) => {
    const cx = 20 + i * 122;
    els.push(rect(cx, 414, 112, 140, P.surf, { rx: 12, stroke: P.stroke, sw: 1 }));
    els.push(rect(cx, 414, 112, 60, r.bg, { rx: 12 }));
    els.push(rect(cx, 454, 112, 20, r.bg)); // fill bottom gap
    els.push(text(cx + 56, 450, r.icon, 24, P.white, { anchor: 'middle', font: 'system-ui' }));
    els.push(text(cx + 10, 490, r.name, 11, P.text, { fw: 700, font: 'Georgia, serif' }));
    els.push(text(cx + 10, 508, r.time + ' · ' + r.cal + ' kcal', 10, P.textMut, { font: 'system-ui' }));
    els.push(circle(cx + 90, 530, 12, P.accentLt));
    els.push(text(cx + 90, 535, '+', 14, P.accent, { anchor: 'middle', fw: 700, font: 'system-ui' }));
    // Rating
    els.push(text(cx + 10, 524, '★ 4.' + (7 + i), 11, P.star, { font: 'system-ui' }));
  });

  // Section: Recently Saved
  els.push(text(20, 576, 'Recently Saved', 13, P.textMed, { fw: 700, font: 'system-ui' }));
  const saved = [
    { name: 'Shakshuka', detail: 'Medium · 35 min · 380 kcal' },
    { name: 'Thai Green Curry', detail: 'Easy · 40 min · 620 kcal' },
    { name: 'Mushroom Risotto', detail: 'Medium · 50 min · 540 kcal' },
  ];
  saved.forEach((s, i) => {
    const sy = 594 + i * 56;
    els.push(rect(20, sy, W - 40, 48, P.surf, { rx: 10, stroke: P.stroke, sw: 1 }));
    els.push(rect(20, sy, 4, 48, P.accent2, { rx: 2 }));
    els.push(text(34, sy + 16, s.name, 13, P.text, { fw: 700, font: 'Georgia, serif' }));
    els.push(text(34, sy + 33, s.detail, 11, P.textMut, { font: 'system-ui' }));
    els.push(text(W - 30, sy + 25, '♥', 16, P.accentLt, { anchor: 'end', font: 'system-ui' }));
  });

  els.push(...bottomNav(1));
  return { name: 'Recipes', elements: els };
}

// ── SCREEN 3: RECIPE DETAIL ──────────────────────────────────────────────────
function screen3() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  els.push(...statusBar());

  // Hero color block (editorial / no-stock-photo style)
  els.push(rect(0, 62, W, 200, P.accent2));
  // Typographic hero inside color block
  els.push(text(20, 110, 'RECIPE', 10, P.greenLt, { fw: 700, ls: 3, font: 'system-ui', opacity: 0.8 }));
  els.push(text(20, 150, 'Asparagus &', 30, P.white, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(20, 182, 'Pea Risotto', 30, P.white, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(20, 208, 'By Marco Rossi  ·  Spring Collection', 12, P.white, { opacity: 0.75, font: 'system-ui' }));
  els.push(text(W - 24, 86, '←', 20, P.white, { anchor: 'end', fw: 700, font: 'system-ui' }));
  els.push(text(W - 24, 113, '♥', 20, P.accentLt, { anchor: 'end', font: 'system-ui' }));

  // Stats strip
  els.push(rect(0, 262, W, 56, P.surf, { stroke: P.stroke, sw: 1 }));
  const stats = [
    { v: '45', l: 'minutes' }, { v: '4', l: 'servings' },
    { v: '540', l: 'calories' }, { v: '4.9', l: 'rating' },
  ];
  stats.forEach((s, i) => {
    const sx = 48 + i * 76;
    els.push(text(sx, 286, s.v, 16, P.text, { fw: 700, anchor: 'middle', font: 'Georgia, serif' }));
    els.push(text(sx, 302, s.l, 10, P.textMut, { anchor: 'middle', font: 'system-ui' }));
    if (i < 3) els.push(line(sx + 38, 272, sx + 38, 310, P.stroke, { sw: 1 }));
  });

  // Tab bar
  const tabs2 = ['Ingredients', 'Steps', 'Nutrition'];
  tabs2.forEach((t, i) => {
    const tx = 20 + i * 120;
    const isAct = i === 0;
    els.push(text(tx + 40, 338, t, 13, isAct ? P.accent : P.textMut, { fw: isAct ? 700 : 400, anchor: 'middle', font: 'system-ui' }));
    if (isAct) els.push(rect(tx, 342, 80, 2, P.accent));
  });
  els.push(line(0, 344, W, 344, P.stroke, { sw: 1 }));

  // Section: Ingredients
  els.push(text(20, 368, 'For the Risotto', 12, P.textMut, { fw: 600, ls: 0.5, font: 'system-ui' }));
  const ingredients = [
    { name: 'Arborio rice', amount: '300g', have: true },
    { name: 'Asparagus', amount: '250g', have: true },
    { name: 'Fresh peas', amount: '150g', have: false },
    { name: 'Vegetable stock', amount: '1L', have: true },
    { name: 'White wine', amount: '150ml', have: false },
    { name: 'Parmesan', amount: '60g', have: true },
    { name: 'Onion (diced)', amount: '1 large', have: true },
    { name: 'Olive oil', amount: '3 tbsp', have: true },
  ];
  ingredients.forEach((ing, i) => {
    const iy = 388 + i * 44;
    if (i < 7) {
      els.push(rect(20, iy, W - 40, 36, P.surf, { rx: 8, stroke: ing.have ? P.stroke : P.accentLt, sw: 1 }));
      els.push(circle(38, iy + 18, 8, ing.have ? P.greenLt : P.accentLt));
      els.push(text(38, iy + 23, ing.have ? '✓' : '!', 9, ing.have ? P.tag2t : P.accent, { anchor: 'middle', fw: 700, font: 'system-ui' }));
      els.push(text(52, iy + 21, ing.name, 13, P.text, { fw: ing.have ? 400 : 600, font: 'Georgia, serif' }));
      els.push(text(W - 30, iy + 21, ing.amount, 12, P.textMed, { anchor: 'end', fw: 600, font: 'system-ui' }));
    }
  });

  // Add to shopping list button
  els.push(rect(20, H - 92, W - 40, 44, P.accent, { rx: 22 }));
  els.push(text(W / 2, H - 63, '+ Add Missing to Shopping List', 13, P.white, { anchor: 'middle', fw: 700, font: 'system-ui' }));

  els.push(...bottomNav(1));
  return { name: 'Recipe Detail', elements: els };
}

// ── SCREEN 4: GROCERY LIST ───────────────────────────────────────────────────
function screen4() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  els.push(...statusBar());

  els.push(text(20, 96, 'SHOPPING LIST', 11, P.textMut, { fw: 700, ls: 2.5, font: 'system-ui' }));
  els.push(text(20, 124, '14 items needed', 26, P.text, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(20, 148, 'For 3 upcoming meals', 13, P.textMut, { font: 'system-ui' }));

  // Progress
  els.push(rect(20, 160, W - 40, 4, P.card, { rx: 2 }));
  els.push(rect(20, 160, Math.round((W - 40) * 0.57), 4, P.accent2, { rx: 2 }));
  els.push(text(W - 20, 154, '8/14 checked', 11, P.textMut, { anchor: 'end', font: 'system-ui' }));

  // Category sections
  const categories = [
    { name: 'Produce', items: [
      { n: 'Asparagus', q: '250g', done: false, tag: null },
      { n: 'Fresh peas', q: '150g', done: false, tag: 'Salmon' },
      { n: 'Baby spinach', q: '100g', done: true, tag: null },
      { n: 'Lemons', q: '3', done: false, tag: null },
    ]},
    { name: 'Pantry', items: [
      { n: 'Arborio rice', q: '300g', done: true, tag: null },
      { n: 'Olive oil', q: '3 tbsp', done: true, tag: null },
      { n: 'White wine', q: '150ml', done: false, tag: null },
    ]},
    { name: 'Dairy', items: [
      { n: 'Parmesan', q: '60g', done: false, tag: 'Risotto' },
      { n: 'Greek yogurt', q: '200g', done: true, tag: null },
    ]},
  ];
  let cy = 180;
  categories.forEach(cat => {
    els.push(text(20, cy + 14, cat.name.toUpperCase(), 10, P.textMut, { fw: 700, ls: 2, font: 'system-ui' }));
    cy += 26;
    cat.items.forEach(item => {
      els.push(rect(20, cy, W - 40, 42, P.surf, { rx: 10, stroke: P.stroke, sw: 1, opacity: item.done ? 0.65 : 1 }));
      // Checkbox
      els.push(rect(30, cy + 13, 16, 16, item.done ? P.accent2 : P.white, { rx: 4, stroke: item.done ? P.accent2 : P.stroke, sw: 2 }));
      if (item.done) els.push(text(38, cy + 25, '✓', 10, P.white, { anchor: 'middle', fw: 700, font: 'system-ui' }));
      // Name + tag
      els.push(text(54, cy + 24, item.n, 13, item.done ? P.textMut : P.text, { fw: 600, font: 'Georgia, serif', opacity: item.done ? 0.7 : 1 }));
      if (item.tag) {
        const tw = item.tag.length * 6.5 + 14;
        els.push(pill(W - 70, cy + 12, tw, 18, P.tag1));
        els.push(text(W - 70 + tw/2, cy + 24, item.tag, 9, P.tag1t, { anchor: 'middle', fw: 600, font: 'system-ui' }));
      }
      els.push(text(W - 28, cy + 24, item.q, 12, P.textMut, { anchor: 'end', font: 'system-ui' }));
      cy += 50;
    });
  });

  // Store estimate card
  els.push(rect(20, cy, W - 40, 52, P.card2, { rx: 12, stroke: P.greenLt, sw: 1 }));
  els.push(text(36, cy + 20, 'Estimated total', 12, P.textMed, { fw: 600, font: 'system-ui' }));
  els.push(text(36, cy + 36, '~$34–42 at Whole Foods', 11, P.textMut, { font: 'system-ui' }));
  els.push(text(W - 30, cy + 28, '$38', 20, P.accent2, { anchor: 'end', fw: 700, font: 'Georgia, serif' }));

  els.push(...bottomNav(4));
  return { name: 'Grocery List', elements: els };
}

// ── SCREEN 5: PANTRY ─────────────────────────────────────────────────────────
function screen5() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  els.push(...statusBar());

  els.push(text(20, 96, 'PANTRY', 11, P.textMut, { fw: 700, ls: 2.5, font: 'system-ui' }));
  els.push(text(20, 124, 'What you have', 26, P.text, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(20, 148, '62 items tracked', 13, P.textMut, { font: 'system-ui' }));

  // Add button
  els.push(rect(W - 56, 110, 44, 28, P.accent, { rx: 14 }));
  els.push(text(W - 34, 128, '+ Add', 11, P.white, { anchor: 'middle', fw: 700, font: 'system-ui' }));

  // Status summary
  const statusCards = [
    { label: 'Expiring Soon', count: 4, color: P.tag3, tc: P.tag3t, icon: '⚠' },
    { label: 'Well Stocked', count: 48, color: P.tag2, tc: P.tag2t, icon: '✓' },
    { label: 'Running Low', count: 10, color: P.tag1, tc: P.tag1t, icon: '↓' },
  ];
  statusCards.forEach((s, i) => {
    const sx = 20 + i * 117;
    els.push(rect(sx, 162, 107, 66, s.color, { rx: 12 }));
    els.push(text(sx + 16, 186, s.icon, 16, s.tc, { font: 'system-ui' }));
    els.push(text(sx + 16, 208, String(s.count), 18, s.tc, { fw: 700, font: 'Georgia, serif' }));
    els.push(text(sx + 40, 208, s.label, 9, s.tc, { font: 'system-ui' }));
  });

  // Expiring section
  els.push(text(20, 254, '⚠  Expiring within 3 days', 12, P.accent, { fw: 700, font: 'system-ui' }));
  const expiring = [
    { name: 'Organic Spinach', expire: 'Apr 13', img: P.greenLt },
    { name: 'Whole Milk', expire: 'Apr 12', img: P.accentLt },
    { name: 'Greek Yogurt', expire: 'Apr 14', img: P.tag1 },
    { name: 'Cherry Tomatoes', expire: 'Apr 13', img: P.tag3 },
  ];
  expiring.forEach((e, i) => {
    const ey = 270 + i * 52;
    els.push(rect(20, ey, W - 40, 44, P.surf, { rx: 10, stroke: P.accentLt, sw: 1.5 }));
    els.push(rect(20, ey, 4, 44, P.accent, { rx: 2 }));
    els.push(rect(30, ey + 8, 28, 28, e.img, { rx: 6 }));
    els.push(text(66, ey + 20, e.name, 13, P.text, { fw: 600, font: 'Georgia, serif' }));
    els.push(text(66, ey + 35, 'Best before ' + e.expire, 11, P.accent, { fw: 600, font: 'system-ui' }));
    els.push(text(W - 28, ey + 26, '→', 14, P.textMut, { anchor: 'end', font: 'system-ui' }));
  });

  // Pantry items grid
  els.push(text(20, 486, 'All Pantry Items', 13, P.textMed, { fw: 700, font: 'system-ui' }));
  const items = [
    { n: 'Olive Oil', q: '80%', bg: P.tag1 },
    { n: 'Arborio Rice', q: '300g', bg: P.card },
    { n: 'Pasta', q: '500g', bg: P.card },
    { n: 'Parmesan', q: '120g', bg: P.accentLt },
    { n: 'Canned Tom.', q: '4 cans', bg: P.tag3 },
    { n: 'Honey', q: '250g', bg: P.tag1 },
  ];
  items.forEach((item, i) => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const ix = 20 + col * 118, iy = 502 + row * 88;
    els.push(rect(ix, iy, 108, 78, P.surf, { rx: 12, stroke: P.stroke, sw: 1 }));
    els.push(rect(ix + 8, iy + 8, 32, 32, item.bg, { rx: 8 }));
    els.push(text(ix + 10, iy + 56, item.n, 11, P.text, { fw: 600, font: 'Georgia, serif' }));
    els.push(text(ix + 10, iy + 70, item.q, 10, P.textMut, { font: 'system-ui' }));
  });

  els.push(...bottomNav(2));
  return { name: 'Pantry', elements: els };
}

// ── SCREEN 6: DISCOVER ───────────────────────────────────────────────────────
function screen6() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  els.push(...statusBar());

  els.push(text(20, 96, 'DISCOVER', 11, P.textMut, { fw: 700, ls: 2.5, font: 'system-ui' }));
  els.push(text(20, 124, 'Trending now', 26, P.text, { fw: 700, font: 'Georgia, serif' }));

  // Hero editorial card — full-width, monochromatic, typography-heavy
  els.push(rect(20, 142, W - 40, 140, P.accent, { rx: 16 }));
  els.push(text(36, 168, 'EDITOR\'S PICK', 9, P.white, { fw: 700, ls: 2.5, font: 'system-ui', opacity: 0.75 }));
  els.push(text(36, 196, 'Mediterranean', 26, P.white, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(36, 220, 'Spring Series', 26, P.white, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(36, 244, '12 recipes · Curated by Chef Nadia', 12, P.white, { opacity: 0.8, font: 'system-ui' }));
  els.push(pill(W - 100, 260, 72, 22, P.white));
  els.push(text(W - 64, 275, 'Explore →', 11, P.accent, { anchor: 'middle', fw: 700, font: 'system-ui' }));

  // Trending tags
  els.push(text(20, 306, 'Trending Tags', 13, P.textMed, { fw: 700, font: 'system-ui' }));
  const tags = ['#spring', '#asparagus', '#highprotein', '#30min', '#vegetarian', '#dairyfree'];
  let tx2 = 20, ty2 = 320;
  tags.forEach(t => {
    const tw = t.length * 7.2 + 18;
    if (tx2 + tw > W - 20) { tx2 = 20; ty2 += 34; }
    els.push(pill(tx2, ty2, tw, 26, P.surf, { stroke: P.stroke, sw: 1 }));
    els.push(text(tx2 + tw / 2, ty2 + 17, t, 11, P.accent2, { anchor: 'middle', font: 'system-ui' }));
    tx2 += tw + 8;
  });

  // Cuisine columns
  els.push(text(20, 400, 'By Cuisine', 13, P.textMed, { fw: 700, font: 'system-ui' }));
  const cuisines = [
    { name: 'Italian', count: '284', bg: P.tag3 },
    { name: 'Asian', count: '312', bg: P.tag1 },
    { name: 'Mexican', count: '197', bg: P.tag3 },
    { name: 'Mediterranean', count: '226', bg: P.tag2 },
    { name: 'Indian', count: '178', bg: P.accentLt },
    { name: 'French', count: '143', bg: P.greenLt },
  ];
  cuisines.forEach((c, i) => {
    const row = Math.floor(i / 2), col = i % 2;
    const cx2 = 20 + col * 175, cy2 = 418 + row * 66;
    els.push(rect(cx2, cy2, 165, 58, P.surf, { rx: 10, stroke: P.stroke, sw: 1 }));
    els.push(rect(cx2, cy2, 6, 58, c.bg === P.tag3 ? P.accent : P.accent2, { rx: 3 }));
    els.push(rect(cx2 + 14, cy2 + 8, 42, 42, c.bg, { rx: 8 }));
    els.push(text(cx2 + 66, cy2 + 25, c.name, 13, P.text, { fw: 700, font: 'Georgia, serif' }));
    els.push(text(cx2 + 66, cy2 + 42, c.count + ' recipes', 11, P.textMut, { font: 'system-ui' }));
  });

  // Chef spotlight
  els.push(text(20, 626, 'Chef Spotlight', 13, P.textMed, { fw: 700, font: 'system-ui' }));
  els.push(rect(20, 642, W - 40, 70, P.card2, { rx: 12, stroke: P.greenLt, sw: 1 }));
  els.push(circle(52, 677, 22, P.accent2));
  els.push(text(52, 681, 'N', 16, P.white, { anchor: 'middle', fw: 700, font: 'Georgia, serif' }));
  els.push(text(84, 664, 'Chef Nadia Kowalski', 13, P.text, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(84, 680, 'Mediterranean specialist · 48 recipes', 11, P.textMut, { font: 'system-ui' }));
  els.push(text(84, 696, '★ 4.8 · 12.4k followers', 11, P.star, { font: 'system-ui' }));
  els.push(pill(W - 92, 660, 66, 28, P.accent2));
  els.push(text(W - 59, 678, 'Follow', 12, P.white, { anchor: 'middle', fw: 700, font: 'system-ui' }));

  // Quick-start section
  els.push(text(20, 728, 'Quick Starts', 13, P.textMed, { fw: 700, font: 'system-ui' }));
  const qs = ['5-min Breakfast', 'Easy Weeknight', 'Meal Prep Sunday'];
  qs.forEach((q, i) => {
    const qx = 20 + i * 120;
    els.push(pill(qx, 742, 110, 26, i === 0 ? P.accentLt : P.card, { stroke: P.stroke, sw: 1 }));
    els.push(text(qx + 55, 759, q, 10, i === 0 ? P.accent : P.textMed, { anchor: 'middle', fw: 600, font: 'system-ui' }));
  });

  els.push(...bottomNav(3));
  return { name: 'Discover', elements: els };
}

// ── BUILD PEN ─────────────────────────────────────────────────────────────────
const screens = [screen1(), screen2(), screen3(), screen4(), screen5(), screen6()];
const totalEls = screens.reduce((s, sc) => s + sc.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name:        'SAFFRON — Recipe & Meal Planning',
    author:      'RAM',
    date:        new Date().toISOString(),
    theme:       'light',
    heartbeat:   HB,
    elements:    totalEls,
    inspiration: 'Land-book earthy/sustainable palette trend (sage green, terracotta, warm cream) + Minimal.gallery typography-as-brand trend from KOMETA Typefaces featured site — editorial color blocks instead of stock photography',
    palette: {
      bg:       P.bg,
      surface:  P.surf,
      card:     P.card,
      text:     P.text,
      accent:   P.accent,
      accent2:  P.accent2,
    },
  },
  screens: screens.map(s => ({
    name:     s.name,
    width:    W,
    height:   H,
    elements: s.elements,
    svg:      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"></svg>`,
  })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalEls} elements`);
console.log(`Written: ${SLUG}.pen`);
