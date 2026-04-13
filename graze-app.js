'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'graze';
const NAME = 'GRAZE';
const TAGLINE = 'Eat with intention';

const W = 390, H = 844;

// Warm linen light palette (inspired by minimal.gallery's warm neutral trend)
const C = {
  bg:       '#FAF7F2',   // warm linen background
  bgDeep:   '#F2EDE3',   // slightly deeper sand
  card:     '#FFFFFF',   // pure white cards
  cardWarm: '#FDF5EB',   // warm cream card
  text:     '#1A1818',   // near-black text
  textMid:  '#5C5550',   // mid-tone
  textMute: '#9E978F',   // muted/tertiary
  accent:   '#C4714F',   // terracotta accent
  accent2:  '#7B9B6B',   // sage green
  border:   '#E8E0D5',   // warm border
  white:    '#FFFFFF',
};

function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, width: w, height: h, fill,
    rx: opts.rx ?? 0,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none',
    strokeWidth: opts.sw ?? 0,
  };
}

function text(x, y, content, size, fill, opts = {}) {
  return {
    type: 'text', x, y, content, fontSize: size, fill,
    fontWeight: opts.fw ?? 400,
    fontFamily: opts.font ?? 'Inter, sans-serif',
    textAnchor: opts.anchor ?? 'start',
    letterSpacing: opts.ls ?? 0,
    opacity: opts.opacity ?? 1,
  };
}

function circle(cx, cy, r, fill, opts = {}) {
  return {
    type: 'circle', cx, cy, r, fill,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none',
    strokeWidth: opts.sw ?? 0,
  };
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  return {
    type: 'line', x1, y1, x2, y2, stroke,
    strokeWidth: opts.sw ?? 1,
    opacity: opts.opacity ?? 1,
  };
}

// ── SVG Builder ──────────────────────────────────────────────────────────────
function buildSVG(elements) {
  const items = elements.map(el => {
    if (el.type === 'rect') {
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${el.rx}" opacity="${el.opacity}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}"/>`;
    }
    if (el.type === 'text') {
      return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${el.fontWeight}" font-family="${el.fontFamily}" text-anchor="${el.textAnchor}" letter-spacing="${el.letterSpacing}" opacity="${el.opacity}">${el.content}</text>`;
    }
    if (el.type === 'circle') {
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}"/>`;
    }
    if (el.type === 'line') {
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" opacity="${el.opacity}"/>`;
    }
    return '';
  }).join('\n    ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n    ${items}\n</svg>`;
}

// ── SCREEN 1: Discover (type-first hero + bento grid) ─────────────────────
function screenDiscover() {
  const els = [];

  // Background
  els.push(rect(0, 0, W, H, C.bg));

  // Status bar
  els.push(text(20, 22, '9:41', 13, C.text, { fw: 500 }));
  els.push(text(330, 22, '●●● 100%', 11, C.textMid, { anchor: 'start' }));

  // Nav: Logo + search icon
  els.push(text(20, 58, 'GRAZE', 18, C.text, { fw: 700, ls: 3, font: 'Georgia, serif' }));
  circle(357, 51, 16, C.text, { opacity: 0.08 });
  // search icon approximation
  circle(355, 49, 7, 'none', { stroke: C.text, sw: 1.5 });
  line(360, 54, 365, 59, C.text, { sw: 1.5 });

  // Hero editorial serif headline — TYPE FIRST
  els.push(text(20, 108, 'What are', 44, C.text, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(20, 158, 'we eating', 44, C.text, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(20, 208, 'tonight?', 44, C.accent, { fw: 700, font: 'Georgia, serif' }));

  // Subtle subline
  els.push(text(20, 232, 'Season-led recipes for every occasion', 13, C.textMid));

  // Horizontal tag pills
  const tags = ['Seasonal', 'Vegetarian', 'Quick', '< 30 min', 'Family'];
  let tx = 20;
  tags.forEach(tag => {
    const tw = tag.length * 7.5 + 18;
    els.push(rect(tx, 246, tw, 24, C.border, { rx: 12 }));
    els.push(text(tx + tw / 2, 262, tag, 11, C.textMid, { anchor: 'middle' }));
    tx += tw + 8;
  });

  // BENTO GRID — asymmetric meal cards
  // Card A: large (featured) — 230w x 165h
  els.push(rect(12, 282, 230, 165, C.cardWarm, { rx: 14 }));
  // photo placeholder with warm gradient feel
  els.push(rect(12, 282, 230, 110, C.bgDeep, { rx: 14 }));
  // organic shape suggestion
  els.push(circle(90, 327, 38, C.accent, { opacity: 0.15 }));
  els.push(circle(140, 340, 28, C.accent2, { opacity: 0.12 }));
  els.push(text(22, 308, '🌿', 26, C.white));
  els.push(rect(12, 372, 230, 40, C.cardWarm)); // bottom of card
  els.push(text(22, 395, 'Lemon Herb Roast Chicken', 12, C.text, { fw: 600 }));
  els.push(text(22, 415, '1h 20m  ·  4 servings', 10, C.textMute));

  // Tag on card A
  els.push(rect(22, 290, 56, 18, C.accent, { rx: 9 }));
  els.push(text(50, 302, 'Feature', 9, C.white, { anchor: 'middle', fw: 600 }));

  // Card B: small tall — 112w x 80h
  els.push(rect(250, 282, 128, 78, C.cardWarm, { rx: 14 }));
  els.push(rect(250, 282, 128, 50, C.bgDeep, { rx: 14 }));
  els.push(circle(310, 305, 18, C.accent2, { opacity: 0.18 }));
  els.push(text(262, 302, '🥗', 18, C.white));
  els.push(text(258, 345, 'Summer Grain', 10, C.text, { fw: 600 }));
  els.push(text(258, 358, 'Bowl', 10, C.text, { fw: 600 }));

  // Card C: small — 112w x 80h
  els.push(rect(250, 368, 128, 78, C.cardWarm, { rx: 14 }));
  els.push(rect(250, 368, 128, 50, C.bgDeep, { rx: 14 }));
  els.push(circle(314, 391, 18, C.accent, { opacity: 0.15 }));
  els.push(text(262, 388, '🍝', 18, C.white));
  els.push(text(258, 430, 'Walnut Pesto', 10, C.text, { fw: 600 }));
  els.push(text(258, 443, 'Pasta', 10, C.text, { fw: 600 }));

  // Section label
  els.push(text(20, 465, 'THIS WEEK', 10, C.textMute, { ls: 2, fw: 600 }));
  els.push(text(340, 465, 'See all', 11, C.accent, { anchor: 'end' }));

  // Horizontal scroll cards — 3 peek cards
  const wkMeals = [
    { emoji: '🥦', name: 'Broccoli Cheddar Soup', time: '25 min', color: C.accent2 },
    { emoji: '🐟', name: 'Miso Glazed Salmon', time: '20 min', color: C.accent },
    { emoji: '🫘', name: 'Tuscan White Bean Stew', time: '35 min', color: '#8B7355' },
  ];
  wkMeals.forEach((m, i) => {
    const cx = 20 + i * 130;
    els.push(rect(cx, 476, 120, 132, C.white, { rx: 12, stroke: C.border, sw: 1 }));
    els.push(rect(cx, 476, 120, 75, m.color, { rx: 12, opacity: 0.12 }));
    circle(cx + 60, 514, 22, m.color, { opacity: 0.2 });
    els.push(text(cx + 60, 520, m.emoji, 20, C.text, { anchor: 'middle' }));
    // name wrap
    const words = m.name.split(' ');
    const half = Math.ceil(words.length / 2);
    els.push(text(cx + 10, 561, words.slice(0, half).join(' '), 10, C.text, { fw: 600 }));
    els.push(text(cx + 10, 574, words.slice(half).join(' '), 10, C.text, { fw: 600 }));
    els.push(text(cx + 10, 598, m.time, 9, C.textMute));
  });

  // Bottom nav bar
  els.push(rect(0, 750, W, 94, C.white, { stroke: C.border, sw: 0.5 }));
  const navItems = [
    { label: 'Discover', icon: '◉', active: true },
    { label: 'Plan', icon: '▦', active: false },
    { label: 'Saved', icon: '♥', active: false },
    { label: 'Me', icon: '◎', active: false },
  ];
  navItems.forEach((n, i) => {
    const nx = 49 + i * 98;
    const col = n.active ? C.accent : C.textMute;
    els.push(text(nx, 783, n.icon, 20, col, { anchor: 'middle' }));
    els.push(text(nx, 800, n.label, 10, col, { anchor: 'middle', fw: n.active ? 600 : 400 }));
    if (n.active) {
      els.push(rect(nx - 16, 753, 32, 3, C.accent, { rx: 1.5 }));
    }
  });

  return { name: 'Discover', elements: els };
}

// ── SCREEN 2: Recipe Detail ───────────────────────────────────────────────
function screenRecipeDetail() {
  const els = [];

  // Full-bleed photo area (warm tone)
  els.push(rect(0, 0, W, 300, C.bgDeep));
  // Photo texture / abstract
  els.push(circle(160, 140, 80, C.accent, { opacity: 0.12 }));
  els.push(circle(240, 180, 55, C.accent2, { opacity: 0.10 }));
  els.push(circle(90, 200, 40, C.accent, { opacity: 0.08 }));
  // Large emoji food
  els.push(text(195, 160, '🍋🌿🐓', 52, C.text, { anchor: 'middle' }));

  // Back arrow
  els.push(circle(28, 52, 18, C.white, { opacity: 0.9 }));
  els.push(text(28, 57, '←', 16, C.text, { anchor: 'middle', fw: 700 }));
  // Favorite
  els.push(circle(362, 52, 18, C.white, { opacity: 0.9 }));
  els.push(text(362, 58, '♥', 15, C.accent, { anchor: 'middle' }));

  // White content sheet
  els.push(rect(0, 280, W, H - 280, C.white, { rx: 20 }));

  // Recipe title — big serif type-first
  els.push(text(24, 330, 'Lemon Herb', 28, C.text, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(24, 363, 'Roast Chicken', 28, C.text, { fw: 700, font: 'Georgia, serif' }));

  // Meta row
  els.push(circle(8, 0, 3, C.accent2)); // dot
  // Replace with actual positioned elements
  const metas = [
    { icon: '⏱', val: '1h 20m' },
    { icon: '👥', val: '4 servings' },
    { icon: '★', val: '4.8 (312)' },
  ];
  metas.forEach((m, i) => {
    const mx = 24 + i * 120;
    els.push(text(mx, 388, m.icon + ' ' + m.val, 12, C.textMid));
  });

  // Thin divider
  els.push(line(24, 402, W - 24, 402, C.border));

  // Tab row
  els.push(text(24, 426, 'Ingredients', 13, C.text, { fw: 700 }));
  els.push(rect(24, 430, 90, 2, C.accent, { rx: 1 }));
  els.push(text(130, 426, 'Method', 13, C.textMute));
  els.push(text(210, 426, 'Notes', 13, C.textMute));

  // Ingredients list
  const ingredients = [
    { qty: '1 whole', item: 'free-range chicken (1.8kg)' },
    { qty: '2', item: 'unwaxed lemons, zested and halved' },
    { qty: '40g', item: 'unsalted butter, softened' },
    { qty: '4 cloves', item: 'garlic, crushed' },
    { qty: '1 bunch', item: 'fresh thyme' },
    { qty: '2 tbsp', item: 'olive oil, extra virgin' },
    { qty: '1 tsp', item: 'sea salt flakes' },
  ];
  ingredients.forEach((ing, i) => {
    const iy = 448 + i * 42;
    els.push(rect(24, iy, W - 48, 36, i % 2 === 0 ? C.bg : C.white, { rx: 8 }));
    els.push(text(32, iy + 22, ing.qty, 11, C.accent, { fw: 700 }));
    els.push(text(90, iy + 22, ing.item, 12, C.text));
    // checkbox
    els.push(rect(W - 56, iy + 8, 20, 20, C.border, { rx: 4 }));
  });

  // Add to list button
  els.push(rect(24, 756, W - 48, 48, C.accent, { rx: 24 }));
  els.push(text(W / 2, 785, 'Add to Grocery List', 14, C.white, { fw: 600, anchor: 'middle' }));

  // Bottom home indicator
  els.push(rect(155, 818, 80, 4, C.border, { rx: 2 }));

  return { name: 'Recipe Detail', elements: els };
}

// ── SCREEN 3: Meal Plan ──────────────────────────────────────────────────
function screenMealPlan() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));

  // Header
  els.push(text(20, 22, '9:41', 13, C.text, { fw: 500 }));
  els.push(text(20, 58, 'This Week', 26, C.text, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(20, 80, 'April 7 – 13, 2026', 13, C.textMid));

  // Share icon
  els.push(circle(357, 58, 18, C.border, { }));
  els.push(text(357, 64, '↗', 14, C.textMid, { anchor: 'middle' }));

  // Week day tabs
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const dates = ['7', '8', '9', '10', '11', '12', '13'];
  days.forEach((d, i) => {
    const dx = 20 + i * 51;
    const active = i === 6; // Sunday = today (April 13)
    if (active) {
      els.push(rect(dx - 8, 95, 36, 46, C.accent, { rx: 10 }));
      els.push(text(dx + 10, 116, d, 11, C.white, { anchor: 'middle', fw: 700 }));
      els.push(text(dx + 10, 132, dates[i], 13, C.white, { anchor: 'middle', fw: 700 }));
    } else {
      els.push(text(dx + 10, 116, d, 11, C.textMute, { anchor: 'middle' }));
      els.push(text(dx + 10, 132, dates[i], 13, C.text, { anchor: 'middle', fw: i === 0 ? 400 : 400 }));
    }
  });

  // Meal slots
  const mealSlots = [
    { meal: 'Breakfast', name: 'Avocado Toast with Poached Eggs', time: '10 min', emoji: '🥑', filled: true },
    { meal: 'Lunch', name: '', time: '', emoji: '', filled: false },
    { meal: 'Dinner', name: 'Lemon Herb Roast Chicken', time: '1h 20m', emoji: '🍋', filled: true },
    { meal: 'Snack', name: 'Greek Yoghurt & Honey', time: '2 min', emoji: '🍯', filled: true },
  ];

  mealSlots.forEach((slot, i) => {
    const sy = 158 + i * 148;
    // Section label
    els.push(text(20, sy, slot.meal.toUpperCase(), 10, C.textMute, { ls: 2, fw: 600 }));

    if (slot.filled) {
      // Filled meal card
      els.push(rect(20, sy + 10, W - 40, 118, C.white, { rx: 14, stroke: C.border, sw: 1 }));
      // Emoji panel
      els.push(rect(20, sy + 10, 90, 118, C.bgDeep, { rx: 14 }));
      els.push(text(65, sy + 75, slot.emoji, 32, C.text, { anchor: 'middle' }));
      // Meal info
      els.push(text(122, sy + 45, slot.name.split(' ').slice(0, 3).join(' '), 13, C.text, { fw: 700 }));
      els.push(text(122, sy + 63, slot.name.split(' ').slice(3).join(' '), 13, C.text, { fw: 700 }));
      els.push(text(122, sy + 84, '⏱ ' + slot.time, 11, C.textMid));
      // Nutrition pills
      const pills = ['P 38g', 'C 12g', 'F 22g'];
      pills.forEach((p, j) => {
        els.push(rect(122 + j * 56, sy + 96, 50, 20, C.bg, { rx: 10 }));
        els.push(text(147 + j * 56, sy + 110, p, 10, C.textMid, { anchor: 'middle' }));
      });
      // Replace button
      els.push(text(W - 36, sy + 30, '↺', 16, C.textMute, { anchor: 'middle' }));
    } else {
      // Empty slot — add meal
      els.push(rect(20, sy + 10, W - 40, 86, C.bg, { rx: 14, stroke: C.border, sw: 1.5 }));
      // Dashed border approximation (just border)
      els.push(text(W / 2, sy + 52, '+ Add a meal', 13, C.textMute, { anchor: 'middle' }));
      els.push(text(W / 2, sy + 70, 'Tap to pick from your favourites', 11, C.textMute, { anchor: 'middle' }));
    }
  });

  // Bottom nav
  els.push(rect(0, 750, W, 94, C.white, { stroke: C.border, sw: 0.5 }));
  const navItems = [
    { label: 'Discover', icon: '◉', active: false },
    { label: 'Plan', icon: '▦', active: true },
    { label: 'Saved', icon: '♥', active: false },
    { label: 'Me', icon: '◎', active: false },
  ];
  navItems.forEach((n, i) => {
    const nx = 49 + i * 98;
    const col = n.active ? C.accent : C.textMute;
    els.push(text(nx, 783, n.icon, 20, col, { anchor: 'middle' }));
    els.push(text(nx, 800, n.label, 10, col, { anchor: 'middle', fw: n.active ? 600 : 400 }));
    if (n.active) els.push(rect(nx - 16, 753, 32, 3, C.accent, { rx: 1.5 }));
  });

  return { name: 'Meal Plan', elements: els };
}

// ── SCREEN 4: Grocery List ─────────────────────────────────────────────────
function screenGrocery() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));

  // Header
  els.push(text(20, 22, '9:41', 13, C.text, { fw: 500 }));
  els.push(text(20, 58, 'Grocery List', 26, C.text, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(20, 78, '14 items · This week\'s meals', 13, C.textMid));

  // Progress bar
  els.push(rect(20, 90, W - 40, 6, C.border, { rx: 3 }));
  els.push(rect(20, 90, (W - 40) * 0.57, 6, C.accent2, { rx: 3 }));
  els.push(text(20, 108, '8 of 14 in cart', 11, C.textMute));

  // Share button
  els.push(rect(W - 100, 44, 80, 32, C.accent, { rx: 16 }));
  els.push(text(W - 60, 64, 'Share list', 11, C.white, { anchor: 'middle', fw: 600 }));

  // Category: Produce
  els.push(text(20, 128, 'PRODUCE', 10, C.textMute, { ls: 2, fw: 600 }));
  const produce = [
    { name: 'Lemons (2)', sub: 'For roast chicken', done: true },
    { name: 'Fresh thyme', sub: 'Bunch, for roast chicken', done: true },
    { name: 'Avocado (3)', sub: 'Ripe, for breakfast', done: false },
    { name: 'Cherry tomatoes', sub: '250g punnet', done: false },
  ];
  produce.forEach((item, i) => {
    const iy = 140 + i * 54;
    els.push(rect(20, iy, W - 40, 46, C.white, { rx: 10 }));
    // Checkbox
    if (item.done) {
      els.push(rect(30, iy + 13, 20, 20, C.accent2, { rx: 5 }));
      els.push(text(40, iy + 27, '✓', 12, C.white, { anchor: 'middle', fw: 700 }));
      els.push(text(62, iy + 24, item.name, 13, C.textMute, { fw: 400 })); // crossed-through effect via muted
      els.push(text(62, iy + 38, item.sub, 10, C.textMute, { opacity: 0.7 }));
    } else {
      els.push(rect(30, iy + 13, 20, 20, 'none', { rx: 5, stroke: C.border, sw: 1.5 }));
      els.push(text(62, iy + 24, item.name, 13, C.text, { fw: 600 }));
      els.push(text(62, iy + 38, item.sub, 10, C.textMid));
    }
  });

  // Category: Protein
  els.push(text(20, 366, 'PROTEIN', 10, C.textMute, { ls: 2, fw: 600 }));
  const protein = [
    { name: 'Whole chicken (1.8kg)', sub: 'Free-range preferred', done: true },
    { name: 'Eggs (6 pack)', sub: 'Free-range, for breakfast', done: false },
    { name: 'Salmon fillets (x4)', sub: '180g each', done: false },
  ];
  protein.forEach((item, i) => {
    const iy = 378 + i * 54;
    els.push(rect(20, iy, W - 40, 46, C.white, { rx: 10 }));
    if (item.done) {
      els.push(rect(30, iy + 13, 20, 20, C.accent2, { rx: 5 }));
      els.push(text(40, iy + 27, '✓', 12, C.white, { anchor: 'middle', fw: 700 }));
      els.push(text(62, iy + 24, item.name, 13, C.textMute));
      els.push(text(62, iy + 38, item.sub, 10, C.textMute, { opacity: 0.7 }));
    } else {
      els.push(rect(30, iy + 13, 20, 20, 'none', { rx: 5, stroke: C.border, sw: 1.5 }));
      els.push(text(62, iy + 24, item.name, 13, C.text, { fw: 600 }));
      els.push(text(62, iy + 38, item.sub, 10, C.textMid));
    }
  });

  // Category: Pantry
  els.push(text(20, 548, 'PANTRY', 10, C.textMute, { ls: 2, fw: 600 }));
  const pantry = [
    { name: 'Olive oil (extra virgin)', sub: 'Top up, 500ml bottle', done: false },
    { name: 'Sea salt flakes', sub: 'Maldon preferred', done: true },
    { name: 'Greek yoghurt', sub: '500g tub, full fat', done: false },
  ];
  pantry.forEach((item, i) => {
    const iy = 560 + i * 54;
    els.push(rect(20, iy, W - 40, 46, C.white, { rx: 10 }));
    if (item.done) {
      els.push(rect(30, iy + 13, 20, 20, C.accent2, { rx: 5 }));
      els.push(text(40, iy + 27, '✓', 12, C.white, { anchor: 'middle', fw: 700 }));
      els.push(text(62, iy + 24, item.name, 13, C.textMute));
      els.push(text(62, iy + 38, item.sub, 10, C.textMute, { opacity: 0.7 }));
    } else {
      els.push(rect(30, iy + 13, 20, 20, 'none', { rx: 5, stroke: C.border, sw: 1.5 }));
      els.push(text(62, iy + 24, item.name, 13, C.text, { fw: 600 }));
      els.push(text(62, iy + 38, item.sub, 10, C.textMid));
    }
  });

  // Add item button
  els.push(rect(20, 730, W - 40, 44, C.border, { rx: 22 }));
  els.push(text(W / 2, 757, '+ Add item manually', 13, C.textMid, { anchor: 'middle' }));

  // Bottom nav
  els.push(rect(0, 750, W, 94, C.white, { stroke: C.border, sw: 0.5 }));
  const navItems = [
    { label: 'Discover', icon: '◉', active: false },
    { label: 'Plan', icon: '▦', active: false },
    { label: 'Saved', icon: '♥', active: false },
    { label: 'Me', icon: '◎', active: false },
  ];
  navItems.forEach((n, i) => {
    const nx = 49 + i * 98;
    els.push(text(nx, 783, n.icon, 20, C.textMute, { anchor: 'middle' }));
    els.push(text(nx, 800, n.label, 10, C.textMute, { anchor: 'middle' }));
  });

  return { name: 'Grocery List', elements: els };
}

// ── SCREEN 5: Saved (Cookbook) ─────────────────────────────────────────────
function screenSaved() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));

  // Header
  els.push(text(20, 22, '9:41', 13, C.text, { fw: 500 }));
  els.push(text(20, 58, 'My Cookbook', 26, C.text, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(20, 80, '47 saved recipes', 13, C.textMid));

  // Search bar
  els.push(rect(20, 92, W - 40, 40, C.white, { rx: 20, stroke: C.border, sw: 1 }));
  els.push(text(48, 116, '🔍  Search your saved recipes…', 12, C.textMute));

  // Filter chips
  const chips = ['All', 'Quick', 'Vegetarian', 'Family'];
  let cx = 20;
  chips.forEach((chip, i) => {
    const cw = chip.length * 8 + 24;
    const isActive = i === 0;
    els.push(rect(cx, 142, cw, 28, isActive ? C.accent : C.white, { rx: 14, stroke: isActive ? 'none' : C.border, sw: 1 }));
    els.push(text(cx + cw / 2, 161, chip, 12, isActive ? C.white : C.textMid, { anchor: 'middle', fw: isActive ? 600 : 400 }));
    cx += cw + 8;
  });

  // Collection section
  els.push(text(20, 188, 'COLLECTIONS', 10, C.textMute, { ls: 2, fw: 600 }));
  const collections = [
    { name: 'Weeknight Dinners', count: '12 recipes', emoji: '🌙', color: C.accent },
    { name: 'Sunday Roasts', count: '8 recipes', emoji: '☀️', color: '#8B7355' },
  ];
  collections.forEach((col, i) => {
    const cy = 200 + i * 66;
    els.push(rect(20, cy, W - 40, 56, C.white, { rx: 12, stroke: C.border, sw: 1 }));
    els.push(rect(20, cy, 56, 56, col.color, { rx: 12, opacity: 0.15 }));
    els.push(text(48, cy + 34, col.emoji, 24, C.text, { anchor: 'middle' }));
    els.push(text(84, cy + 26, col.name, 14, C.text, { fw: 700 }));
    els.push(text(84, cy + 43, col.count, 12, C.textMid));
    els.push(text(W - 32, cy + 34, '›', 20, C.textMute, { anchor: 'middle' }));
  });

  // Recently saved
  els.push(text(20, 340, 'RECENTLY SAVED', 10, C.textMute, { ls: 2, fw: 600 }));

  const saved = [
    { name: 'Miso Glazed Salmon', tag: 'Quick', emoji: '🐟', time: '20 min', color: C.accent },
    { name: 'Ricotta & Spinach Gnudi', tag: 'Vegetarian', emoji: '🌿', time: '45 min', color: C.accent2 },
    { name: 'Braised Short Ribs', tag: 'Slow cook', emoji: '🥩', time: '3h', color: '#A0522D' },
    { name: 'Brown Butter Financiers', tag: 'Dessert', emoji: '🧈', time: '30 min', color: '#D4A017' },
  ];

  saved.forEach((s, i) => {
    const sy = 352 + i * 84;
    els.push(rect(20, sy, W - 40, 74, C.white, { rx: 12 }));
    // Image area
    els.push(rect(20, sy, 74, 74, s.color, { rx: 12, opacity: 0.13 }));
    els.push(text(57, sy + 44, s.emoji, 28, C.text, { anchor: 'middle' }));
    // Text
    els.push(text(106, sy + 24, s.name, 13, C.text, { fw: 700 }));
    // Tag pill
    els.push(rect(106, sy + 34, s.tag.length * 7 + 14, 18, C.bg, { rx: 9 }));
    els.push(text(106 + (s.tag.length * 7 + 14) / 2, sy + 47, s.tag, 9, C.textMid, { anchor: 'middle' }));
    els.push(text(106, sy + 63, '⏱ ' + s.time, 11, C.textMute));
    // Heart (saved)
    els.push(text(W - 36, sy + 38, '♥', 18, C.accent, { anchor: 'middle' }));
  });

  // Bottom nav
  els.push(rect(0, 750, W, 94, C.white, { stroke: C.border, sw: 0.5 }));
  const navItems = [
    { label: 'Discover', icon: '◉', active: false },
    { label: 'Plan', icon: '▦', active: false },
    { label: 'Saved', icon: '♥', active: true },
    { label: 'Me', icon: '◎', active: false },
  ];
  navItems.forEach((n, i) => {
    const nx = 49 + i * 98;
    const col = n.active ? C.accent : C.textMute;
    els.push(text(nx, 783, n.icon, 20, col, { anchor: 'middle' }));
    els.push(text(nx, 800, n.label, 10, col, { anchor: 'middle', fw: n.active ? 600 : 400 }));
    if (n.active) els.push(rect(nx - 16, 753, 32, 3, C.accent, { rx: 1.5 }));
  });

  return { name: 'Saved', elements: els };
}

// ── SCREEN 6: Profile / Preferences ───────────────────────────────────────
function screenProfile() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));

  // Warm tone header area
  els.push(rect(0, 0, W, 200, C.bgDeep));
  els.push(text(20, 22, '9:41', 13, C.text, { fw: 500 }));

  // Avatar — large, generous whitespace
  els.push(circle(W / 2, 100, 46, C.white));
  els.push(circle(W / 2, 100, 44, C.accent, { opacity: 0.18 }));
  els.push(text(W / 2, 115, '👩', 42, C.text, { anchor: 'middle' }));

  // Name + stats — type-first editorial layout
  els.push(text(W / 2, 165, 'Emma Clarke', 22, C.text, { fw: 700, anchor: 'middle', font: 'Georgia, serif' }));
  els.push(text(W / 2, 184, 'Home cook · London', 12, C.textMid, { anchor: 'middle' }));

  // Stats row
  const stats = [
    { val: '47', label: 'Saved' },
    { val: '6', label: 'This week' },
    { val: '3', label: 'Collections' },
  ];
  stats.forEach((s, i) => {
    const sx = 65 + i * 130;
    if (i > 0) els.push(line(sx - 20, 210, sx - 20, 250, C.border));
    els.push(text(sx, 228, s.val, 22, C.text, { anchor: 'middle', fw: 700, font: 'Georgia, serif' }));
    els.push(text(sx, 245, s.label, 11, C.textMide, { anchor: 'middle' }));
  });

  // Divider
  els.push(line(20, 260, W - 20, 260, C.border));

  // Preferences section
  els.push(text(20, 286, 'PREFERENCES', 10, C.textMute, { ls: 2, fw: 600 }));

  const prefs = [
    { label: 'Dietary', value: 'No restrictions', icon: '🥗' },
    { label: 'Skill level', value: 'Intermediate', icon: '👨‍🍳' },
    { label: 'Serves', value: '2–3 people', icon: '👥' },
    { label: 'Max cook time', value: '1 hour', icon: '⏱' },
  ];
  prefs.forEach((p, i) => {
    const py = 298 + i * 56;
    els.push(rect(20, py, W - 40, 48, C.white, { rx: 10 }));
    els.push(text(36, py + 28, p.icon, 16, C.text));
    els.push(text(62, py + 22, p.label, 11, C.textMid));
    els.push(text(62, py + 38, p.value, 13, C.text, { fw: 600 }));
    els.push(text(W - 36, py + 30, '›', 18, C.textMute, { anchor: 'middle' }));
  });

  // Seasonal inspiration widget
  els.push(text(20, 530, 'IN SEASON NOW', 10, C.textMute, { ls: 2, fw: 600 }));
  els.push(rect(20, 544, W - 40, 92, C.cardWarm, { rx: 14, stroke: C.border, sw: 1 }));
  const seasonal = ['🌱 Asparagus', '🥕 Carrots', '🌿 Wild garlic', '🥬 Spring greens', '🍓 Strawberries'];
  let stx = 32;
  seasonal.forEach(s => {
    const sw = s.length * 7.4 + 14;
    if (stx + sw > W - 32) { stx = 32; }
    els.push(rect(stx, 554, sw, 24, C.bg, { rx: 12 }));
    els.push(text(stx + sw / 2, 570, s, 10, C.textMid, { anchor: 'middle' }));
    stx += sw + 8;
  });
  els.push(text(32, 608, '🌷 Spring is here — update your preferences?', 12, C.accent));

  // Log out
  els.push(rect(20, 654, W - 40, 44, C.white, { rx: 22, stroke: C.border, sw: 1 }));
  els.push(text(W / 2, 681, 'Sign out', 13, C.textMid, { anchor: 'middle' }));

  // Bottom nav
  els.push(rect(0, 750, W, 94, C.white, { stroke: C.border, sw: 0.5 }));
  const navItems = [
    { label: 'Discover', icon: '◉', active: false },
    { label: 'Plan', icon: '▦', active: false },
    { label: 'Saved', icon: '♥', active: false },
    { label: 'Me', icon: '◎', active: true },
  ];
  navItems.forEach((n, i) => {
    const nx = 49 + i * 98;
    const col = n.active ? C.accent : C.textMute;
    els.push(text(nx, 783, n.icon, 20, col, { anchor: 'middle' }));
    els.push(text(nx, 800, n.label, 10, col, { anchor: 'middle', fw: n.active ? 600 : 400 }));
    if (n.active) els.push(rect(nx - 16, 753, 32, 3, C.accent, { rx: 1.5 }));
  });

  return { name: 'Profile', elements: els };
}

// ── Assemble Pen ─────────────────────────────────────────────────────────
const screens = [
  screenDiscover(),
  screenRecipeDetail(),
  screenMealPlan(),
  screenGrocery(),
  screenSaved(),
  screenProfile(),
];

const totalElements = screens.reduce((acc, s) => acc + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    tagline: TAGLINE,
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'light',
    heartbeat: 481,
    screens: screens.length,
    elements: totalElements,
    palette: {
      bg: C.bg,
      surface: C.white,
      text: C.text,
      accent: C.accent,
      accent2: C.accent2,
      muted: C.textMute,
    },
    inspiration: 'minimal.gallery warm neutrals + land-book bento grid trend',
    archetype: 'food-lifestyle',
  },
  screens: screens.map(s => ({
    name: s.name,
    svg: buildSVG(s.elements),
    elements: s.elements,
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
