'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'sprout';
const NAME = 'SPROUT';
const W = 390, H = 844;

// Palette — dark warm botanical
// Inspired by DarkModeDesign.com: Frames (Apple-style layered dark surfaces)
// and the warm dark palette trend (Format Podcasts burgundy → adapted to earthy botanical)
const C = {
  bg:      '#080C07',
  surf:    '#0F1510',
  card:    '#172016',
  card2:   '#1E2A1B',
  accent:  '#5EC945',   // herb green
  accent2: '#D4A94A',   // harvest amber
  accent3: '#4FA8D4',   // morning dew blue
  text:    '#E2DFCF',   // warm cream
  textDim: '#9A9884',   // muted sage
  border:  '#2A3426',
  red:     '#E05C4A',   // wilt warning
};

let elements = [];
let totalElements = 0;

function el(type, props) {
  elements.push({ type, ...props });
  totalElements++;
}

function rect(x, y, w, h, fill, opts = {}) {
  el('rect', { x, y, width: w, height: h, fill,
    rx: opts.rx || 0, opacity: opts.opacity || 1,
    stroke: opts.stroke || 'none', strokeWidth: opts.sw || 0 });
}

function text(x, y, content, size, fill, opts = {}) {
  el('text', { x, y, content, fontSize: size, fill,
    fontWeight: opts.fw || 400, fontFamily: opts.font || 'Inter',
    textAnchor: opts.anchor || 'start', letterSpacing: opts.ls || 0,
    opacity: opts.opacity || 1 });
}

function circle(cx, cy, r, fill, opts = {}) {
  el('circle', { cx, cy, r, fill, opacity: opts.opacity || 1,
    stroke: opts.stroke || 'none', strokeWidth: opts.sw || 0 });
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  el('line', { x1, y1, x2, y2, stroke, strokeWidth: opts.sw || 1, opacity: opts.opacity || 1 });
}

// ─── Status bar ───────────────────────────────────────────────────
function statusBar(time = '9:41') {
  text(20, 22, time, 12, C.text, { fw: 600 });
  // signal dots
  for (let i = 0; i < 3; i++) circle(310 + i * 7, 16, 3, C.text, { opacity: i === 2 ? 0.3 : 1 });
  circle(332, 16, 3, C.text);
  circle(345, 16, 5, C.text, { opacity: 0 });
  // battery
  rect(350, 11, 24, 11, 'none', { rx: 2, stroke: C.text, sw: 1.5, opacity: 0.6 });
  rect(374, 14, 2, 5, C.text, { opacity: 0.6 });
  rect(352, 13, 16, 7, C.text, { rx: 1 });
}

// ─── Bottom nav ───────────────────────────────────────────────────
function bottomNav(active = 0) {
  rect(0, H - 70, W, 70, C.surf);
  line(0, H - 70, W, H - 70, C.border, { sw: 0.5 });
  const tabs = ['Garden', 'Log', 'Harvest', 'Discover', 'Profile'];
  const icons = ['⬡', '◎', '✦', '◈', '◯'];
  const iw = W / 5;
  tabs.forEach((tab, i) => {
    const cx = iw * i + iw / 2;
    const isActive = i === active;
    const col = isActive ? C.accent : C.textDim;
    text(cx, H - 44, icons[i], isActive ? 18 : 16, col, { anchor: 'middle', opacity: isActive ? 1 : 0.7 });
    text(cx, H - 24, tab, 9, col, { anchor: 'middle', fw: isActive ? 600 : 400, opacity: isActive ? 1 : 0.6 });
    if (isActive) {
      circle(cx, H - 66, 3, C.accent);
    }
  });
}

// ─── Leaf icon (simple geometric) ─────────────────────────────────
function leafIcon(x, y, size, color) {
  // Simplified leaf as ellipse
  el('ellipse', { cx: x, cy: y, rx: size * 0.6, ry: size, fill: color, opacity: 0.85,
    transform: `rotate(-30, ${x}, ${y})` });
  line(x, y - size, x, y + size * 0.5, C.bg, { sw: 1.5, opacity: 0.6 });
}

// ─── Watering drop icon ────────────────────────────────────────────
function dropIcon(x, y, size, color, opacity = 1) {
  circle(x, y + size * 0.2, size * 0.7, color, { opacity });
  el('polygon', { points: `${x},${y - size} ${x - size * 0.6},${y + size * 0.1} ${x + size * 0.6},${y + size * 0.1}`,
    fill: color, opacity });
}

// ════════════════════════════════════════════════════════════════
// SCREEN 1 — Garden Dashboard
// ════════════════════════════════════════════════════════════════
function screen1() {
  elements = [];
  rect(0, 0, W, H, C.bg);
  statusBar();

  // Header
  text(20, 52, 'My Garden', 24, C.text, { fw: 700, ls: -0.5 });
  text(20, 72, 'Saturday, Apr 11', 12, C.textDim);
  // Settings icon
  circle(358, 58, 18, C.card2, { rx: 18 });
  text(358, 63, '⚙', 14, C.textDim, { anchor: 'middle' });

  // ── Top summary strip ──
  rect(20, 88, W - 40, 72, C.card, { rx: 14 });
  // 3 stats
  const stats = [
    { label: 'Plants', val: '12', icon: '⬡', col: C.accent },
    { label: 'Watering', val: '3', icon: '◎', col: C.accent3 },
    { label: 'Harvest', val: '2 days', icon: '✦', col: C.accent2 },
  ];
  stats.forEach((s, i) => {
    const bx = 20 + (W - 40) / 3 * i;
    const cx = bx + (W - 40) / 3 / 2;
    if (i > 0) line(bx, 98, bx, 150, C.border, { sw: 0.5 });
    text(cx, 115, s.icon, 16, s.col, { anchor: 'middle' });
    text(cx, 138, s.val, 16, s.col, { anchor: 'middle', fw: 700 });
    text(cx, 154, s.label, 10, C.textDim, { anchor: 'middle' });
  });

  // ── Section title ──
  text(20, 184, 'Your Plants', 14, C.text, { fw: 600 });
  text(W - 20, 184, 'See all →', 11, C.accent, { anchor: 'end' });

  // ── Plant cards (2 col grid) ──
  const plants = [
    { name: 'Basil', variety: 'Genovese', days: 12, health: 92, status: 'Thriving', col: C.accent, icon: '🌿', water: 85 },
    { name: 'Mint', variety: 'Spearmint', days: 28, health: 78, status: 'Good', col: C.accent2, icon: '🌱', water: 60 },
    { name: 'Thyme', variety: 'Common', days: 45, health: 95, status: 'Thriving', col: C.accent, icon: '🍃', water: 40 },
    { name: 'Lavender', variety: 'Hidcote', days: 67, health: 61, status: 'Needs water', col: C.red, icon: '💧', water: 20 },
  ];

  const cols = 2;
  const cardW = (W - 48) / 2;
  const cardH = 140;
  const startY = 196;

  plants.forEach((p, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = 20 + col * (cardW + 8);
    const cy = startY + row * (cardH + 8);

    rect(cx, cy, cardW, cardH, C.card, { rx: 14 });

    // Top accent bar
    rect(cx, cy, cardW, 3, p.col, { rx: 2 });

    // Plant icon
    circle(cx + 24, cy + 30, 18, C.card2);
    text(cx + 24, cy + 36, p.icon, 16, C.text, { anchor: 'middle' });

    // Status badge
    const badgeX = cx + cardW - 8;
    rect(badgeX - 56, cy + 16, 56, 18, p.health > 80 ? '#1A2E16' : p.health > 60 ? '#2A2010' : '#2E1A16', { rx: 9 });
    text(badgeX - 28, cy + 28, p.status, 8.5, p.col, { anchor: 'middle', fw: 500 });

    text(cx + 16, cy + 60, p.name, 14, C.text, { fw: 700 });
    text(cx + 16, cy + 76, p.variety, 10, C.textDim);

    text(cx + 16, cy + 94, 'Day ' + p.days, 10, C.textDim);
    text(cx + cardW - 16, cy + 94, 'Health', 9, C.textDim, { anchor: 'end' });

    // Health bar
    const barW = cardW - 32;
    rect(cx + 16, cy + 102, barW, 4, C.border, { rx: 2 });
    rect(cx + 16, cy + 102, barW * p.health / 100, 4, p.col, { rx: 2 });

    // Moisture indicator
    text(cx + 16, cy + 122, '💧', 10, C.accent3, { opacity: 0.8 });
    const mbarW = cardW - 42;
    rect(cx + 30, cy + 117, mbarW, 4, C.border, { rx: 2 });
    rect(cx + 30, cy + 117, mbarW * p.water / 100, 4, C.accent3, { rx: 2, opacity: p.water < 30 ? 1 : 0.7 });
  });

  // ── Today's tasks ──
  rect(20, 494, W - 40, 90, C.card, { rx: 14 });
  text(32, 516, "Today's Tasks", 13, C.text, { fw: 600 });
  text(W - 32, 516, '2 due', 11, C.accent2, { anchor: 'end' });

  const tasks = [
    { t: 'Water Lavender — overdue', done: false, col: C.red },
    { t: 'Prune Basil tips', done: false, col: C.textDim },
    { t: 'Fertilise Mint', done: true, col: C.textDim },
  ];
  tasks.forEach((task, i) => {
    const ty = 534 + i * 20;
    circle(34, ty + 4, 5, task.done ? C.accent : 'none', { stroke: task.done ? C.accent : C.border, sw: 1.5 });
    if (task.done) {
      line(30, ty + 4, 33, ty + 7, C.bg, { sw: 1.5 });
      line(33, ty + 7, 38, ty + 1, C.bg, { sw: 1.5 });
    }
    text(46, ty + 8, task.t, 11, task.done ? C.textDim : task.col, { opacity: task.done ? 0.5 : 1 });
  });

  // ── Seasonal tip ──
  rect(20, 594, W - 40, 54, C.card2, { rx: 14, opacity: 0.8 });
  circle(38, 621, 12, C.card);
  text(38, 625, '☀', 12, C.accent2, { anchor: 'middle' });
  text(58, 612, 'Seasonal Tip', 10, C.accent2, { fw: 600 });
  text(58, 628, 'Longer days ahead — increase watering frequency', 10, C.textDim);
  text(58, 642, 'for sun-loving herbs like basil.', 10, C.textDim);

  bottomNav(0);

  return { name: 'Garden Dashboard', elements: [...elements] };
}

// ════════════════════════════════════════════════════════════════
// SCREEN 2 — Plant Detail (Basil)
// ════════════════════════════════════════════════════════════════
function screen2() {
  elements = [];
  rect(0, 0, W, H, C.bg);
  statusBar();

  // Header with back
  text(20, 54, '←', 20, C.text, { fw: 300 });
  text(W / 2, 56, 'Basil', 16, C.text, { fw: 600, anchor: 'middle' });
  text(W - 20, 54, '⋯', 20, C.textDim, { anchor: 'end' });

  // ── Large plant card ──
  rect(20, 68, W - 40, 200, C.card, { rx: 20 });
  // gradient top band
  rect(20, 68, W - 40, 60, C.accent, { rx: 20, opacity: 0.12 });
  rect(20, 108, W - 40, 20, C.card);

  // Big plant icon
  circle(W / 2, 148, 48, C.card2);
  text(W / 2, 158, '🌿', 36, C.text, { anchor: 'middle' });

  // Botanical badge
  rect(W / 2 - 48, 202, 96, 20, C.card2, { rx: 10 });
  text(W / 2, 215, 'Ocimum basilicum', 9, C.textDim, { anchor: 'middle', fw: 500 });

  text(W / 2, 240, 'Genovese Basil', 20, C.text, { fw: 700, anchor: 'middle', ls: -0.3 });
  text(W / 2, 258, 'Growing since Day 1 · Indoor pot · South window', 10, C.textDim, { anchor: 'middle' });

  // ── Key metrics row ──
  const metrics = [
    { val: '12', unit: 'days', label: 'Age', col: C.text },
    { val: '92%', unit: '', label: 'Health', col: C.accent },
    { val: '18°C', unit: '', label: 'Ideal temp', col: C.accent3 },
    { val: '6.5', unit: 'pH', label: 'Soil pH', col: C.accent2 },
  ];
  rect(20, 270, W - 40, 68, C.card2, { rx: 14 });
  metrics.forEach((m, i) => {
    const mx = 20 + (W - 40) / 4 * i + (W - 40) / 8;
    if (i > 0) line(20 + (W - 40) / 4 * i, 280, 20 + (W - 40) / 4 * i, 328, C.border, { sw: 0.5 });
    text(mx, 295, m.val + m.unit, 15, m.col, { anchor: 'middle', fw: 700 });
    text(mx, 328, m.label, 9, C.textDim, { anchor: 'middle' });
  });

  // ── Radar-style gauge (simplified) ──
  text(20, 360, 'Care Status', 13, C.text, { fw: 600 });
  text(W - 20, 360, 'Last checked 2h ago', 10, C.textDim, { anchor: 'end', opacity: 0.7 });

  const gauges = [
    { label: 'Water', pct: 85, col: C.accent3 },
    { label: 'Light', pct: 72, col: C.accent2 },
    { label: 'Nutrients', pct: 90, col: C.accent },
    { label: 'Humidity', pct: 58, col: '#9B7DE8' },
  ];
  rect(20, 370, W - 40, 100, C.card, { rx: 14 });
  gauges.forEach((g, i) => {
    const gy = 388 + i * 22;
    text(36, gy + 8, g.label, 11, C.textDim);
    const barX = 110, barW = W - 150;
    rect(barX, gy, barW, 8, C.border, { rx: 4 });
    rect(barX, gy, barW * g.pct / 100, 8, g.col, { rx: 4 });
    text(barX + barW + 8, gy + 8, g.pct + '%', 10, g.col, { fw: 600 });
  });

  // ── Next care actions ──
  text(20, 486, 'Next Actions', 13, C.text, { fw: 600 });

  const actions = [
    { icon: '💧', label: 'Water', time: 'Tomorrow · 7am', col: C.accent3, bg: '#0D1E2E' },
    { icon: '✂', label: 'Prune Tips', time: 'In 3 days', col: C.accent, bg: '#0E1E0D' },
    { icon: '🌱', label: 'Fertilise', time: 'Next week', col: C.accent2, bg: '#241E0D' },
  ];
  actions.forEach((a, i) => {
    const ay = 498 + i * 56;
    rect(20, ay, W - 40, 48, C.card, { rx: 12 });
    circle(46, ay + 24, 18, a.bg);
    text(46, ay + 29, a.icon, 14, a.col, { anchor: 'middle' });
    text(72, ay + 20, a.label, 13, C.text, { fw: 600 });
    text(72, ay + 36, a.time, 10, C.textDim);
    circle(W - 34, ay + 24, 12, C.card2);
    text(W - 34, ay + 28, '→', 12, C.textDim, { anchor: 'middle' });
  });

  // ── Journal entry preview ──
  rect(20, 672, W - 40, 58, C.card2, { rx: 14, opacity: 0.7 });
  text(32, 692, '📖 Last journal entry', 11, C.accent2, { fw: 500 });
  text(32, 708, '"Noticed new growth at the third node — looking', 10, C.textDim, { opacity: 0.85 });
  text(32, 722, 'vigorous. Added mulch layer today."', 10, C.textDim, { opacity: 0.85 });

  bottomNav(0);

  return { name: 'Plant Detail', elements: [...elements] };
}

// ════════════════════════════════════════════════════════════════
// SCREEN 3 — Watering Log
// ════════════════════════════════════════════════════════════════
function screen3() {
  elements = [];
  rect(0, 0, W, H, C.bg);
  statusBar();

  text(20, 52, 'Watering Log', 22, C.text, { fw: 700, ls: -0.4 });
  text(20, 70, 'Track hydration · Build habits', 12, C.textDim );

  // ── Streak card ──
  rect(20, 84, W - 40, 90, C.card, { rx: 16 });
  // Subtle accent stripe
  rect(20, 84, 4, 90, C.accent3, { rx: 2 });
  circle(65, 129, 28, C.card2);
  text(65, 121, '💧', 22, C.text, { anchor: 'middle' });
  text(65, 138, 'streak', 8, C.textDim, { anchor: 'middle' });
  text(130, 113, '11', 34, C.accent3, { fw: 800, ls: -1 });
  text(130, 135, 'day streak', 11, C.textDim);
  text(130, 151, 'Personal best: 18 days', 10, C.textDim, { opacity: 0.6 });
  // Progress to next milestone
  text(W - 32, 113, '18', 11, C.accent2, { anchor: 'end', fw: 600 });
  text(W - 32, 127, 'next', 9, C.textDim, { anchor: 'end' });
  const pbarW = 90, pbarX = W - 40 - pbarW;
  rect(pbarX, 138, pbarW, 5, C.border, { rx: 3 });
  rect(pbarX, 138, pbarW * 11 / 18, 5, C.accent3, { rx: 3 });

  // ── Weekly calendar strip ──
  text(20, 196, 'This Week', 13, C.text, { fw: 600 });
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const watered = [true, true, true, false, true, true, false];
  const today = 5; // Saturday index
  const dayW = (W - 40) / 7;
  days.forEach((d, i) => {
    const dx = 20 + dayW * i + dayW / 2;
    const dy = 208;
    const isToday = i === today;
    circle(dx, dy + 16, 16, isToday ? C.accent3 : watered[i] ? C.card2 : C.card, { opacity: isToday ? 0.2 : 1 });
    if (isToday) circle(dx, dy + 16, 16, 'none', { stroke: C.accent3, sw: 1.5 });
    text(dx, dy + 8, d, 10, isToday ? C.accent3 : C.textDim, { anchor: 'middle', fw: isToday ? 600 : 400 });
    if (watered[i]) {
      text(dx, dy + 21, '✓', 10, isToday ? C.accent3 : C.accent, { anchor: 'middle', fw: 700 });
    } else if (i < today) {
      text(dx, dy + 21, '✗', 10, C.red, { anchor: 'middle', opacity: 0.6 });
    }
  });

  // ── Water log entries ──
  text(20, 262, 'Recent Waterings', 13, C.text, { fw: 600 });
  text(W - 20, 262, 'Filter ▾', 11, C.textDim, { anchor: 'end' });

  const entries = [
    { plant: 'Basil', time: 'Today · 8:12am', ml: '180ml', photo: true, note: 'Looking vibrant' },
    { plant: 'Thyme', time: 'Today · 8:14am', ml: '80ml', photo: false, note: '' },
    { plant: 'Mint', time: 'Yesterday · 7:45am', ml: '160ml', photo: true, note: 'Added liquid feed' },
    { plant: 'Lavender', time: 'Thursday', ml: '100ml', photo: false, note: 'Soil very dry' },
    { plant: 'Rosemary', time: 'Thursday', ml: '60ml', photo: false, note: '' },
    { plant: 'Chives', time: 'Wednesday', ml: '140ml', photo: true, note: '' },
  ];

  entries.forEach((e, i) => {
    const ey = 274 + i * 62;
    rect(20, ey, W - 40, 54, C.card, { rx: 12 });
    // Drop icon area
    rect(20, ey, 4, 54, C.accent3, { rx: 2 });
    circle(46, ey + 27, 16, C.card2);
    text(46, ey + 32, '💧', 12, C.accent3, { anchor: 'middle' });

    text(68, ey + 19, e.plant, 13, C.text, { fw: 600 });
    text(68, ey + 35, e.time, 10, C.textDim);
    if (e.note) text(68, ey + 47, e.note, 9, C.textDim, { opacity: 0.7 });

    text(W - 28, ey + 19, e.ml, 13, C.accent3, { anchor: 'end', fw: 600 });
    if (e.photo) {
      rect(W - 40 - 28, ey + 28, 28, 16, C.card2, { rx: 8 });
      text(W - 40 - 14, ey + 38, '📷', 9, C.textDim, { anchor: 'middle' });
    }
  });

  // FAB
  circle(W - 32, H - 90, 24, C.accent3);
  text(W - 32, H - 84, '+', 22, C.bg, { anchor: 'middle', fw: 700 });

  bottomNav(1);

  return { name: 'Watering Log', elements: [...elements] };
}

// ════════════════════════════════════════════════════════════════
// SCREEN 4 — Grow Journal
// ════════════════════════════════════════════════════════════════
function screen4() {
  elements = [];
  rect(0, 0, W, H, C.bg);
  statusBar();

  text(20, 52, 'Grow Journal', 22, C.text, { fw: 700, ls: -0.4 });
  text(20, 70, 'Document · Observe · Learn', 12, C.textDim);

  // ── Month nav ──
  rect(20, 84, W - 40, 36, C.card, { rx: 18 });
  text(W / 2, 107, 'April 2026', 13, C.text, { anchor: 'middle', fw: 600 });
  text(36, 107, '‹', 16, C.textDim, { anchor: 'middle' });
  text(W - 36, 107, '›', 16, C.accent, { anchor: 'middle' });

  // ── Journal entries ──
  const journals = [
    {
      date: 'Sat 11 Apr', plant: 'Basil', tag: 'Growth',
      text: 'New growth at nodes 3 and 4. Tips looking bright green and healthy. Smell is strong — a good sign.',
      tagCol: C.accent, photo: true,
    },
    {
      date: 'Thu 9 Apr', plant: 'Lavender', tag: 'Concern',
      text: 'Lower leaves yellowing. May be overwatering or nitrogen deficiency. Will hold watering for 3 days and observe.',
      tagCol: C.red, photo: false,
    },
    {
      date: 'Mon 6 Apr', plant: 'Mint', tag: 'Harvest',
      text: 'First harvest of the season — cut 8 stems for tea. Left 60% of growth. Smells incredible.',
      tagCol: C.accent2, photo: true,
    },
    {
      date: 'Fri 3 Apr', plant: 'Thyme', tag: 'Repotted',
      text: 'Moved to a 6" pot. Roots were visibly circling. Used terracotta pot for better drainage.',
      tagCol: C.accent3, photo: true,
    },
  ];

  journals.forEach((j, i) => {
    const jy = 134 + i * 152;
    const cardH = j.photo ? 140 : 110;
    rect(20, jy, W - 40, cardH, C.card, { rx: 14 });

    // Date + plant
    text(32, jy + 20, j.date, 10, C.textDim);
    text(32, jy + 36, j.plant, 14, C.text, { fw: 700 });
    // Tag badge
    rect(W - 32 - 60, jy + 24, 60, 18, j.tagCol, { rx: 9, opacity: 0.15 });
    text(W - 32 - 30, jy + 35, j.tag, 9, j.tagCol, { anchor: 'middle', fw: 600 });

    line(32, jy + 46, W - 32, jy + 46, C.border, { sw: 0.5 });
    text(32, jy + 60, j.text, 10.5, C.textDim, { opacity: 0.9 });
    // Wrap text (simple 2nd line)
    if (j.text.length > 55) {
      const line2 = j.text.substring(55);
      text(32, jy + 74, line2.substring(0, 55), 10.5, C.textDim, { opacity: 0.9 });
      if (line2.length > 55) {
        text(32, jy + 88, line2.substring(55, 80) + '...', 10.5, C.textDim, { opacity: 0.7 });
      }
    }

    if (j.photo) {
      // Photo thumbnail placeholder
      rect(32, jy + cardH - 36, 60, 28, C.card2, { rx: 6 });
      text(62, jy + cardH - 20, '📷 Photo', 9, C.textDim, { anchor: 'middle' });
    }
  });

  // FAB
  circle(W - 32, H - 90, 24, C.accent);
  text(W - 32, H - 84, '+', 22, C.bg, { anchor: 'middle', fw: 700 });

  bottomNav(1);
  return { name: 'Grow Journal', elements: [...elements] };
}

// ════════════════════════════════════════════════════════════════
// SCREEN 5 — Harvest Tracker
// ════════════════════════════════════════════════════════════════
function screen5() {
  elements = [];
  rect(0, 0, W, H, C.bg);
  statusBar();

  text(20, 52, 'Harvest', 24, C.text, { fw: 700, ls: -0.5 });
  text(20, 70, 'Track your yields', 12, C.textDim);

  // ── Season total card ──
  rect(20, 84, W - 40, 100, C.card, { rx: 16 });
  rect(20, 84, W - 40, 3, C.accent2, { rx: 2 });

  text(36, 108, 'Season Total', 11, C.textDim, { fw: 500 });
  text(36, 136, '847g', 38, C.accent2, { fw: 800, ls: -1 });
  text(36, 158, 'harvested across 5 herbs this season', 11, C.textDim);

  // Mini bar chart
  const months = ['Jan','Feb','Mar','Apr'];
  const yields = [0, 120, 380, 347];
  const barArea = { x: W - 130, y: 90, w: 110, h: 80 };
  const maxY = Math.max(...yields);
  months.forEach((m, i) => {
    const bx = barArea.x + i * 28;
    const bh = yields[i] / maxY * barArea.h * 0.75;
    const by = barArea.y + barArea.h - bh;
    rect(bx, by, 18, bh, i === 3 ? C.accent2 : C.card2, { rx: 4 });
    text(bx + 9, barArea.y + barArea.h + 12, m, 8, C.textDim, { anchor: 'middle', opacity: 0.7 });
  });

  // ── Upcoming harvests ──
  text(20, 202, 'Ready Soon', 13, C.text, { fw: 600 });

  const upcoming = [
    { plant: 'Basil', type: 'Leaf harvest', days: 2, est: '~60g', icon: '🌿', urgency: 'soon' },
    { plant: 'Chives', type: 'Tip harvest', days: 5, est: '~30g', icon: '🌱', urgency: 'upcoming' },
    { plant: 'Mint', type: 'Stem harvest', days: 8, est: '~80g', icon: '🍃', urgency: 'upcoming' },
  ];

  upcoming.forEach((u, i) => {
    const uy = 214 + i * 62;
    rect(20, uy, W - 40, 54, C.card, { rx: 12 });
    const urgCol = u.urgency === 'soon' ? C.accent2 : C.accent;
    rect(20, uy, 4, 54, urgCol, { rx: 2 });
    circle(46, uy + 27, 16, C.card2);
    text(46, uy + 32, u.icon, 14, C.text, { anchor: 'middle' });
    text(68, uy + 19, u.plant, 13, C.text, { fw: 600 });
    text(68, uy + 35, u.type, 10, C.textDim);
    text(W - 28, uy + 19, 'in ' + u.days + 'd', 12, urgCol, { anchor: 'end', fw: 700 });
    text(W - 28, uy + 35, 'est. ' + u.est, 10, C.textDim, { anchor: 'end' });
  });

  // ── Harvest history ──
  text(20, 412, 'Past Harvests', 13, C.text, { fw: 600 });
  text(W - 20, 412, 'All →', 11, C.accent, { anchor: 'end' });

  const history = [
    { plant: 'Mint', date: 'Mon 6 Apr', amount: '60g', use: 'Tea & cooking', icon: '🍃' },
    { plant: 'Basil', date: 'Sat 28 Mar', amount: '45g', use: 'Pesto batch', icon: '🌿' },
    { plant: 'Chives', date: 'Wed 23 Mar', amount: '25g', use: 'Garnish', icon: '🌱' },
    { plant: 'Thyme', date: 'Thu 17 Mar', amount: '18g', use: 'Roast chicken', icon: '🍃' },
  ];

  history.forEach((h, i) => {
    const hy = 426 + i * 52;
    rect(20, hy, W - 40, 44, i % 2 === 0 ? C.card : C.surf, { rx: 10 });
    text(34, hy + 16, h.icon, 14);
    text(56, hy + 16, h.plant, 12, C.text, { fw: 600 });
    text(56, hy + 30, h.date + ' · ' + h.use, 10, C.textDim);
    text(W - 28, hy + 16, h.amount, 12, C.accent2, { anchor: 'end', fw: 600 });
    rect(W - 60, hy + 24, 32, 14, C.card2, { rx: 7 });
    text(W - 44, hy + 33, 'logged', 8, C.textDim, { anchor: 'middle' });
  });

  bottomNav(2);
  return { name: 'Harvest Tracker', elements: [...elements] };
}

// ════════════════════════════════════════════════════════════════
// SCREEN 6 — Discover (Seasonal Guide)
// ════════════════════════════════════════════════════════════════
function screen6() {
  elements = [];
  rect(0, 0, W, H, C.bg);
  statusBar();

  text(20, 52, 'Discover', 24, C.text, { fw: 700, ls: -0.5 });
  text(20, 70, 'Spring growing guide', 12, C.accent, { fw: 500 });

  // ── Featured seasonal card ──
  rect(20, 84, W - 40, 140, C.card, { rx: 20 });
  // Background gradient blocks
  rect(20, 84, W - 40, 140, C.accent, { rx: 20, opacity: 0.08 });
  rect(20, 84, W - 40, 60, C.accent, { rx: 20, opacity: 0.04 });

  // Big seasonal icon
  circle(W - 60, 114, 40, C.card2);
  text(W - 60, 122, '🌸', 32, C.text, { anchor: 'middle' });

  text(36, 108, 'SPRING 2026', 9, C.accent, { fw: 700, ls: 1.5 });
  text(36, 130, 'Best herbs to', 16, C.text, { fw: 700 });
  text(36, 150, 'plant right now', 16, C.text, { fw: 700 });
  text(36, 172, 'Warm days ahead — ideal for basil,', 10, C.textDim );
  text(36, 186, 'coriander, and summer savory.', 10, C.textDim);
  rect(36, 198, 80, 22, C.accent, { rx: 11 });
  text(76, 212, 'Read guide →', 10, C.bg, { anchor: 'middle', fw: 600 });

  // ── Category filters ──
  const cats = ['All', 'Herbs', 'Vegetables', 'Flowers', 'Care'];
  let catX = 20;
  cats.forEach((cat, i) => {
    const cw = cat.length * 7 + 20;
    rect(catX, 240, cw, 28, i === 0 ? C.accent : C.card, { rx: 14 });
    text(catX + cw / 2, 257, cat, 11, i === 0 ? C.bg : C.textDim, { anchor: 'middle', fw: i === 0 ? 600 : 400 });
    catX += cw + 8;
  });

  // ── Herb cards ──
  const herbs = [
    { name: 'Coriander', difficulty: 'Easy', days: '21–28 days', tip: 'Sow direct, hates transplanting. Keep moist.', icon: '🌿', col: C.accent },
    { name: 'Dill', difficulty: 'Easy', days: '10–14 days', tip: 'Full sun, well-draining soil. Grows tall.', icon: '🌱', col: C.accent2 },
    { name: 'Summer Savory', difficulty: 'Medium', days: '14–21 days', tip: 'Warm germination needed. Pairs with beans.', icon: '🍃', col: C.accent3 },
    { name: 'Lemon Balm', difficulty: 'Easy', days: '7–14 days', tip: 'Spreads quickly — consider containers.', icon: '🌿', col: C.accent },
  ];

  herbs.forEach((h, i) => {
    const hx = i % 2 === 0 ? 20 : W / 2 + 4;
    const hy = 282 + Math.floor(i / 2) * 148;
    const hw = (W - 48) / 2;
    rect(hx, hy, hw, 136, C.card, { rx: 14 });
    rect(hx, hy, hw, 3, h.col, { rx: 2 });

    circle(hx + hw / 2, hy + 30, 22, C.card2);
    text(hx + hw / 2, hy + 37, h.icon, 18, C.text, { anchor: 'middle' });

    text(hx + 12, hy + 58, h.name, 13, C.text, { fw: 700 });
    rect(hx + 12, hy + 64, 36, 14, h.col, { rx: 7, opacity: 0.15 });
    text(hx + 30, hy + 73, h.difficulty, 8, h.col, { anchor: 'middle', fw: 600 });

    text(hx + 12, hy + 84, '⏱ ' + h.days, 9, C.textDim);
    text(hx + 12, hy + 98, h.tip, 9, C.textDim, { opacity: 0.8 });
    text(hx + 12, hy + 110, h.tip.length > 38 ? h.tip.substring(38) : '', 9, C.textDim, { opacity: 0.8 });

    // Add button
    rect(hx + 12, hy + 118, hw - 24, 12, C.card2, { rx: 6 });
    text(hx + hw / 2, hy + 128, '+ Add to garden', 8, h.col, { anchor: 'middle', fw: 500 });
  });

  bottomNav(3);
  return { name: 'Discover', elements: [...elements] };
}

// ════════════════════════════════════════════════════════════════
// Compose and write pen file
// ════════════════════════════════════════════════════════════════
const screens = [screen1(), screen2(), screen3(), screen4(), screen5(), screen6()];
const totalEl = screens.reduce((sum, s) => sum + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'SPROUT — Home Herb Garden Tracker',
    author: 'RAM',
    date: new Date().toISOString(),
    theme: 'dark',
    heartbeat: 464,
    elements: totalEl,
    description: 'A warm-dark herb & plant growing tracker for urban home farmers. Inspired by DarkModeDesign.com warm dark palette trend (Format Podcasts burgundy + Frames Apple-style layered surfaces) and the analog creative hobby app niche.',
    palette: {
      bg: C.bg, surface: C.surf, card: C.card,
      accent: C.accent, accent2: C.accent2, text: C.text,
    },
  },
  screens: screens.map(s => ({
    name: s.name,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"></svg>`,
    elements: s.elements,
  })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalEl} elements`);
console.log(`Written: ${SLUG}.pen`);
