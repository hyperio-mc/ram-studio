'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'rove';
const NAME = 'ROVE';
const TAGLINE = 'Slow travel, beautifully remembered';
const HEARTBEAT = 42;

// ── Palette: warm editorial light theme ──────────────────────────────────────
const C = {
  bg:        '#FAF7F2',   // warm cream
  surface:   '#FFFFFF',
  card:      '#F4EFE7',   // paper card
  cardAlt:   '#EDE7DC',   // deeper paper
  text:      '#1C1916',   // near-black warm
  textSub:   '#6B6259',   // warm mid-gray
  textMuted: '#A89D93',   // muted
  accent:    '#C4703A',   // terracotta
  accentSoft:'#EDCFB8',   // light terracotta wash
  accent2:   '#5B7F5A',   // sage green
  accent2Soft:'#C8DBC7',  // light sage
  border:    '#E3DAD0',   // warm border
  white:     '#FFFFFF',
  dark:      '#1C1916',
};

const W = 390, H = 844;
const elements = [];

// ── Primitives ────────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, width: w, height: h, fill,
    rx: opts.rx ?? 0, opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none', strokeWidth: opts.sw ?? 0,
  };
}
function text(x, y, content, size, fill, opts = {}) {
  return {
    type: 'text', x, y, content, fontSize: size, fill,
    fontWeight: opts.fw ?? 400,
    fontFamily: opts.font ?? 'Georgia, serif',
    textAnchor: opts.anchor ?? 'start',
    letterSpacing: opts.ls ?? 0,
    opacity: opts.opacity ?? 1,
  };
}
function circle(cx, cy, r, fill, opts = {}) {
  return {
    type: 'circle', cx, cy, r, fill,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none', strokeWidth: opts.sw ?? 0,
  };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return { type: 'line', x1, y1, x2, y2, stroke, strokeWidth: opts.sw ?? 1, opacity: opts.opacity ?? 1 };
}

// ── Reusable UI components ────────────────────────────────────────────────────

function statusBar(els) {
  els.push(rect(0, 0, W, 44, C.bg));
  els.push(text(20, 29, '9:41', 13, C.text, { fw: 500, font: 'system-ui, sans-serif' }));
  els.push(text(W - 20, 29, '●●●', 11, C.text, { anchor: 'end', font: 'system-ui, sans-serif' }));
}

function navBar(els, active) {
  const tabs = [
    { id: 'home', label: 'Home', icon: '⌂' },
    { id: 'discover', label: 'Discover', icon: '◎' },
    { id: 'journal', label: 'Journal', icon: '✎' },
    { id: 'saved', label: 'Saved', icon: '♡' },
    { id: 'profile', label: 'Me', icon: '◉' },
  ];
  els.push(rect(0, H - 83, W, 83, C.surface));
  els.push(line(0, H - 83, W, H - 83, C.border, { sw: 1 }));
  tabs.forEach((tab, i) => {
    const x = (W / 5) * i + W / 10;
    const isActive = tab.id === active;
    els.push(text(x, H - 52, tab.icon, 20, isActive ? C.accent : C.textMuted, { anchor: 'middle', font: 'system-ui' }));
    els.push(text(x, H - 32, tab.label, 9, isActive ? C.accent : C.textMuted, { anchor: 'middle', fw: isActive ? 600 : 400, font: 'system-ui, sans-serif', ls: 0.3 }));
    if (isActive) els.push(rect(x - 14, H - 84, 28, 3, C.accent, { rx: 2 }));
  });
}

// ── SCREEN 1: Home / Journey Dashboard ────────────────────────────────────────
function buildScreen1() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));

  statusBar(els);

  // Header
  els.push(text(20, 76, 'Good morning,', 13, C.textSub, { font: 'system-ui, sans-serif' }));
  els.push(text(20, 102, 'Mia.', 38, C.text, { fw: 700, font: 'Georgia, serif' }));

  // Active journey hero card
  els.push(rect(20, 116, W - 40, 190, C.card, { rx: 16 }));
  els.push(rect(20, 116, W - 40, 190, '#8B6914', { rx: 16, opacity: 0.08 })); // warm tint
  // Fake landscape photo area (painted style)
  els.push(rect(20, 116, W - 40, 120, '#C4985A', { rx: 16, opacity: 0.3 }));
  els.push(rect(20, 156, W - 40, 80, '#8B6E3A', { opacity: 0.18 }));
  // Mountain silhouette shapes
  [
    [40, 190, 60, 236], [80, 176, 60, 236], [120, 185, 50, 236],
    [155, 195, 55, 236], [195, 178, 55, 236], [235, 188, 60, 236],
    [270, 182, 50, 236], [305, 191, 55, 236], [330, 186, 60, 236],
  ].forEach(([x, peakY, w, baseY]) => {
    els.push({
      type: 'polygon',
      points: `${x},${baseY} ${x + w / 2},${peakY} ${x + w},${baseY}`,
      fill: '#6B5339', opacity: 0.35,
    });
  });
  // Photo label
  els.push(rect(20, 116, 80, 22, C.accent, { rx: 0, opacity: 0 }));
  els.push(rect(28, 124, 64, 18, C.accent, { rx: 9 }));
  els.push(text(60, 137, 'ACTIVE', 8, C.white, { anchor: 'middle', fw: 700, font: 'system-ui, sans-serif', ls: 1.5 }));
  // Journey info below photo
  els.push(text(32, 256, 'Andalucia Slow Route', 16, C.text, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(32, 275, 'Spain · 14 days · Day 6 of 14', 11, C.textSub, { font: 'system-ui, sans-serif' }));
  // Progress bar
  els.push(rect(32, 285, W - 84, 5, C.border, { rx: 3 }));
  els.push(rect(32, 285, (W - 84) * 0.43, 5, C.accent, { rx: 3 }));
  els.push(text(W - 40, 291, '43%', 9, C.accent, { anchor: 'end', fw: 600, font: 'system-ui, sans-serif' }));
  // Arrow
  els.push(text(W - 28, 261, '→', 18, C.accent, { anchor: 'end', font: 'system-ui, sans-serif' }));

  // Section: Upcoming stops
  els.push(text(20, 333, 'Next stops', 13, C.text, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(W - 20, 333, 'See all', 12, C.accent, { anchor: 'end', font: 'system-ui, sans-serif' }));

  const stops = [
    { name: 'Ronda', type: 'Town', days: 'Tomorrow', icon: '◆', color: C.accent },
    { name: 'Zahara de la Sierra', type: 'Village', days: 'Day 8', icon: '◇', color: C.accent2 },
    { name: 'Jerez de la Frontera', type: 'City', days: 'Day 11', icon: '◆', color: C.accent },
  ];
  stops.forEach((stop, i) => {
    const y = 349 + i * 64;
    els.push(rect(20, y, W - 40, 56, C.surface, { rx: 12 }));
    els.push(circle(46, y + 28, 16, stop.color, { opacity: 0.12 }));
    els.push(text(46, y + 33, stop.icon, 12, stop.color, { anchor: 'middle', font: 'system-ui' }));
    els.push(text(72, y + 22, stop.name, 14, C.text, { fw: 600, font: 'Georgia, serif' }));
    els.push(text(72, y + 38, stop.type, 11, C.textSub, { font: 'system-ui, sans-serif' }));
    els.push(text(W - 32, y + 30, stop.days, 11, C.textMuted, { anchor: 'end', font: 'system-ui, sans-serif' }));
    if (i < stops.length - 1) els.push(line(72, y + 56, W - 20, y + 56, C.border, { sw: 1, opacity: 0.6 }));
  });

  // Quick stats row
  const stats = [
    { label: 'km walked', value: '42.8' },
    { label: 'photos', value: '317' },
    { label: 'entries', value: '18' },
  ];
  const statY = 547;
  els.push(rect(20, statY, W - 40, 68, C.card, { rx: 12 }));
  stats.forEach((s, i) => {
    const x = 20 + ((W - 40) / 3) * i + (W - 40) / 6;
    els.push(text(x, statY + 28, s.value, 18, C.text, { fw: 700, anchor: 'middle', font: 'Georgia, serif' }));
    els.push(text(x, statY + 46, s.label, 9, C.textSub, { anchor: 'middle', font: 'system-ui, sans-serif' }));
    if (i < 2) els.push(line(x + (W - 40) / 6, statY + 12, x + (W - 40) / 6, statY + 56, C.border, { sw: 1 }));
  });

  navBar(els, 'home');

  return { name: 'Home', elements: els };
}

// ── SCREEN 2: Discover ────────────────────────────────────────────────────────
function buildScreen2() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  statusBar(els);

  els.push(text(20, 76, 'Discover', 32, C.text, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(20, 102, 'Curated routes for slow travellers', 13, C.textSub, { font: 'system-ui, sans-serif' }));

  // Search bar
  els.push(rect(20, 116, W - 40, 44, C.surface, { rx: 22, stroke: C.border, sw: 1 }));
  els.push(text(44, 143, '◎', 14, C.textMuted, { font: 'system-ui' }));
  els.push(text(62, 143, 'Search destinations, routes…', 13, C.textMuted, { font: 'system-ui, sans-serif' }));

  // Filter chips
  const chips = ['All', 'Europe', 'Asia', 'Americas', 'On foot'];
  chips.forEach((chip, i) => {
    const x = 20 + i * 72;
    const active = i === 0;
    if (x + 60 > W) return;
    els.push(rect(x, 174, 65, 28, active ? C.accent : C.surface, { rx: 14, stroke: active ? 'none' : C.border, sw: 1 }));
    els.push(text(x + 32, 192, chip, 11, active ? C.white : C.textSub, { anchor: 'middle', fw: active ? 600 : 400, font: 'system-ui, sans-serif' }));
  });

  // Section label
  els.push(text(20, 225, 'Featured routes', 14, C.text, { fw: 700, font: 'Georgia, serif' }));

  // Large featured card
  els.push(rect(20, 237, W - 40, 168, C.card, { rx: 16 }));
  // Landscape gradient suggestion
  els.push(rect(20, 237, W - 40, 110, '#7BA3B8', { rx: 16, opacity: 0.35 }));
  els.push(rect(20, 307, W - 40, 40, '#7BA3B8', { opacity: 0.15 }));
  // Water horizon
  els.push({
    type: 'ellipse', cx: W / 2, cy: 320, rx: 210, ry: 35, fill: '#5B8FA8', opacity: 0.25,
  });
  els.push(rect(20, 237, 90, 22, 'none', {}));
  els.push(rect(28, 245, 75, 18, C.accent2, { rx: 9 }));
  els.push(text(65, 258, 'EDITOR\'S PICK', 7, C.white, { anchor: 'middle', fw: 700, font: 'system-ui, sans-serif', ls: 1 }));
  els.push(text(32, 362, 'Cinque Terre Coastal Path', 17, C.text, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(32, 381, 'Italy · 5 days · 48 km · Moderate', 11, C.textSub, { font: 'system-ui, sans-serif' }));
  els.push(text(W - 32, 381, '★ 4.9', 11, C.accent, { anchor: 'end', fw: 600, font: 'system-ui, sans-serif' }));
  els.push(text(32, 398, '⊙ 2,847 travellers · Updated Mar 2026', 10, C.textMuted, { font: 'system-ui, sans-serif' }));

  // Small cards row
  const routes = [
    { name: 'Camino del Norte', region: 'Spain · 820 km', rating: '4.8', color: '#D4956A' },
    { name: 'Via Francigena', region: 'Italy · 1,000 km', rating: '4.7', color: '#8FA87B' },
  ];
  routes.forEach((r, i) => {
    const x = 20 + i * (W / 2 - 10);
    const cardW = W / 2 - 28;
    const y = 420;
    els.push(rect(x, y, cardW, 120, C.surface, { rx: 12 }));
    els.push(rect(x, y, cardW, 68, r.color, { rx: 12, opacity: 0.28 }));
    // terrain silhouette
    els.push(rect(x, y + 44, cardW, 24, r.color, { opacity: 0.18 }));
    els.push(text(x + cardW / 2, y + 86, r.name, 12, C.text, { fw: 600, anchor: 'middle', font: 'Georgia, serif' }));
    els.push(text(x + cardW / 2, y + 102, r.region, 9, C.textSub, { anchor: 'middle', font: 'system-ui, sans-serif' }));
    els.push(text(x + cardW / 2, y + 116, `★ ${r.rating}`, 9, C.accent, { anchor: 'middle', fw: 600, font: 'system-ui, sans-serif' }));
  });

  // "Trending regions" label
  els.push(text(20, 558, 'Trending regions', 14, C.text, { fw: 700, font: 'Georgia, serif' }));
  const regions = ['Balkans', 'Patagonia', 'Oaxaca', 'Georgia'];
  regions.forEach((r, i) => {
    const x = 20 + i * 89;
    if (x + 80 > W) return;
    els.push(rect(x, 568, 78, 36, i === 0 ? C.accentSoft : C.card, { rx: 10 }));
    els.push(text(x + 39, 591, r, 11, i === 0 ? C.accent : C.textSub, { anchor: 'middle', fw: i === 0 ? 600 : 400, font: 'system-ui, sans-serif' }));
  });

  navBar(els, 'discover');
  return { name: 'Discover', elements: els };
}

// ── SCREEN 3: Journey Detail ──────────────────────────────────────────────────
function buildScreen3() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  statusBar(els);

  // Back nav
  els.push(text(20, 72, '← Andalucia Slow Route', 13, C.accent, { font: 'system-ui, sans-serif' }));

  // Day header
  els.push(text(20, 104, 'Day 6', 36, C.text, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(20, 128, 'Granada to Alhama de Granada', 14, C.textSub, { font: 'Georgia, serif' }));
  els.push(text(20, 148, 'Thursday, April 10 · 22.4 km · ⇑ 680m', 11, C.textMuted, { font: 'system-ui, sans-serif' }));
  els.push(line(20, 160, W - 20, 160, C.border, { sw: 1 }));

  // Elevation chart area
  els.push(text(20, 180, 'Elevation profile', 11, C.textSub, { fw: 600, font: 'system-ui, sans-serif', ls: 0.5 }));
  els.push(rect(20, 192, W - 40, 70, C.surface, { rx: 10 }));
  // Draw elevation shape
  const chartPoints = [
    [20, 252], [50, 248], [80, 240], [110, 228], [140, 218], [170, 210],
    [200, 214], [220, 235], [240, 240], [260, 232], [280, 222], [310, 215],
    [340, 220], [350, 230], [370, 248], [370, 262], [20, 262],
  ];
  els.push({
    type: 'polygon',
    points: chartPoints.map(([x, y]) => `${x},${y}`).join(' '),
    fill: C.accent, opacity: 0.15,
  });
  els.push({
    type: 'polyline',
    points: chartPoints.slice(0, -2).map(([x, y]) => `${x},${y}`).join(' '),
    stroke: C.accent, strokeWidth: 2, fill: 'none', opacity: 0.7,
  });
  // Chart labels
  els.push(text(22, 206, '1,150m', 9, C.textMuted, { font: 'system-ui, sans-serif' }));
  els.push(text(22, 260, '580m', 9, C.textMuted, { font: 'system-ui, sans-serif' }));

  // Waypoints timeline
  els.push(text(20, 284, 'Waypoints', 11, C.textSub, { fw: 600, font: 'system-ui, sans-serif', ls: 0.5 }));

  const waypoints = [
    { name: 'Granada Centro', dist: '0 km', note: 'Start point · Bus stop nearby', done: true },
    { name: 'Cenes de la Vega', dist: '4.2 km', note: 'Café Mirador · Fountain', done: true },
    { name: 'Quéntar Reservoir', dist: '10.8 km', note: 'Scenic stop · No facilities', done: false },
    { name: 'La Peza', dist: '16.4 km', note: 'Village · Bar La Fuente', done: false },
    { name: 'Alhama de Granada', dist: '22.4 km', note: 'Hotel Los Tendillas', done: false },
  ];

  waypoints.forEach((wp, i) => {
    const y = 300 + i * 70;
    // timeline line
    if (i < waypoints.length - 1) els.push(line(34, y + 20, 34, y + 70, wp.done ? C.accent : C.border, { sw: 2 }));
    // dot
    els.push(circle(34, y + 10, 8, wp.done ? C.accent : C.surface, { stroke: wp.done ? C.accent : C.border, sw: 2 }));
    if (wp.done) els.push(text(34, y + 14, '✓', 8, C.white, { anchor: 'middle', font: 'system-ui', fw: 700 }));
    els.push(text(52, y + 14, wp.name, 13, wp.done ? C.text : C.textSub, { fw: wp.done ? 600 : 400, font: 'Georgia, serif' }));
    els.push(text(52, y + 30, wp.note, 10, C.textMuted, { font: 'system-ui, sans-serif' }));
    els.push(text(W - 20, y + 14, wp.dist, 11, C.textMuted, { anchor: 'end', font: 'system-ui, sans-serif' }));
  });

  navBar(els, 'home');
  return { name: 'Journey Detail', elements: els };
}

// ── SCREEN 4: Journal Entry ───────────────────────────────────────────────────
function buildScreen4() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  statusBar(els);

  // Editorial journal header
  els.push(text(20, 68, 'Journal', 12, C.textMuted, { font: 'system-ui, sans-serif', fw: 600, ls: 2 }));
  els.push(line(20, 75, W - 20, 75, C.border, { sw: 1 }));

  // Entry date (big, editorial serif)
  els.push(text(20, 106, 'Thursday', 13, C.textSub, { font: 'Georgia, serif' }));
  els.push(text(20, 134, '10 April', 42, C.text, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(20, 156, 'Day 6 · Andalucia', 13, C.accent, { font: 'Georgia, serif' }));
  els.push(line(20, 168, W - 20, 168, C.border, { sw: 1 }));

  // Photo strip
  const photoColors = ['#C4985A', '#8FA87B', '#7BA3B8', '#D4956A'];
  photoColors.forEach((col, i) => {
    const x = 20 + i * 88;
    if (x + 80 > W) return;
    els.push(rect(x, 178, 80, 60, col, { rx: 8, opacity: 0.4 }));
    els.push(text(x + 40, 214, '▣', 16, col, { anchor: 'middle', font: 'system-ui', opacity: 0.8 }));
  });
  els.push(text(20, 256, '14 photos', 11, C.textMuted, { font: 'system-ui, sans-serif' }));
  els.push(text(W - 20, 256, '+ Add', 11, C.accent, { anchor: 'end', font: 'system-ui, sans-serif' }));

  // Journal body text (editorial)
  els.push(text(20, 282, 'Left Granada as the city woke up — the', 14, C.text, { font: 'Georgia, serif' }));
  els.push(text(20, 302, 'market vendors setting up in Bib-Rambla,', 14, C.text, { font: 'Georgia, serif' }));
  els.push(text(20, 322, 'the air still cool from the Sierra Nevada.', 14, C.text, { font: 'Georgia, serif' }));
  els.push(text(20, 350, 'The path climbed fast out of the city — olive', 14, C.textSub, { font: 'Georgia, serif', opacity: 0.8 }));
  els.push(text(20, 370, 'groves and cork oak, the occasional ruined', 14, C.textSub, { font: 'Georgia, serif', opacity: 0.8 }));
  els.push(text(20, 390, 'cortijo. By noon I reached Cenes…', 14, C.textSub, { font: 'Georgia, serif', opacity: 0.8 }));

  // Pull quote
  els.push(rect(20, 410, 4, 64, C.accent, { rx: 2 }));
  els.push(text(34, 430, '"The Alhambra behind me, the olive groves', 13, C.text, { font: 'Georgia, serif', fw: 600, opacity: 0.9 }));
  els.push(text(34, 450, 'ahead. Walking is just thinking slowly."', 13, C.text, { font: 'Georgia, serif', fw: 600, opacity: 0.9 }));
  els.push(text(34, 472, '— Journal note, 9:40am', 11, C.textMuted, { font: 'system-ui, sans-serif' }));

  // Tags & mood
  const tags = ['Granada', 'Hiking', 'Solitude', 'Sunrise'];
  tags.forEach((tag, i) => {
    const xPos = 20 + i * 76;
    if (xPos + 68 > W) return;
    els.push(rect(xPos, 490, 68, 24, C.card, { rx: 12 }));
    els.push(text(xPos + 34, 506, tag, 10, C.textSub, { anchor: 'middle', font: 'system-ui, sans-serif' }));
  });

  // Mood & weather
  els.push(rect(20, 525, W - 40, 48, C.surface, { rx: 12 }));
  els.push(text(36, 554, 'Mood: Content ◕', 13, C.text, { font: 'system-ui, sans-serif' }));
  els.push(text(W - 36, 554, '☀ 24°C · Sunny', 12, C.textSub, { anchor: 'end', font: 'system-ui, sans-serif' }));

  // Voice note
  els.push(rect(20, 585, W - 40, 48, C.accentSoft, { rx: 12 }));
  els.push(text(36, 614, '🎙 Voice note · 2:14', 13, C.accent, { font: 'system-ui, sans-serif', fw: 600 }));
  // Waveform dots
  const waveY = 609;
  for (let i = 0; i < 28; i++) {
    const barH = 4 + Math.sin(i * 0.9) * 8 + Math.random() * 4;
    els.push(rect(160 + i * 6, waveY - barH / 2, 3, barH, C.accent, { rx: 1, opacity: 0.6 }));
  }

  navBar(els, 'journal');
  return { name: 'Journal Entry', elements: els };
}

// ── SCREEN 5: Saved Places ────────────────────────────────────────────────────
function buildScreen5() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  statusBar(els);

  els.push(text(20, 76, 'Saved', 32, C.text, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(20, 102, '34 places · 6 routes', 13, C.textSub, { font: 'system-ui, sans-serif' }));

  // Tabs
  const tabs = ['Places', 'Routes', 'Lists'];
  tabs.forEach((t, i) => {
    const x = 20 + i * 100;
    const active = i === 0;
    els.push(text(x, 130, t, 14, active ? C.text : C.textMuted, { fw: active ? 700 : 400, font: 'Georgia, serif' }));
    if (active) els.push(rect(x, 134, t.length * 7.5, 2, C.accent, { rx: 1 }));
  });
  els.push(line(20, 142, W - 20, 142, C.border, { sw: 1 }));

  // Collection headers
  const collections = [
    {
      name: 'Dream Journeys',
      count: 12,
      items: [
        { name: 'Camino Primitivo', region: 'Spain', col: '#C4985A' },
        { name: 'Nakasendo Way', region: 'Japan', col: '#8FA87B' },
        { name: 'Tour du Mont Blanc', region: 'France/Italy/CH', col: '#7BA3B8' },
      ],
    },
    {
      name: 'Next Year',
      count: 8,
      items: [
        { name: 'Via degli Dei', region: 'Italy', col: '#D4956A' },
        { name: 'GR 20 Corsica', region: 'France', col: '#9B8AB0' },
      ],
    },
  ];

  let yPos = 158;
  collections.forEach((col) => {
    els.push(text(20, yPos + 14, col.name, 15, C.text, { fw: 700, font: 'Georgia, serif' }));
    els.push(text(W - 20, yPos + 14, `${col.count} places →`, 11, C.accent, { anchor: 'end', font: 'system-ui, sans-serif' }));
    yPos += 24;
    col.items.forEach((item) => {
      els.push(rect(20, yPos, W - 40, 52, C.surface, { rx: 10 }));
      els.push(rect(20, yPos, 6, 52, item.col, { rx: 10, opacity: 0.7 }));
      els.push(text(36, yPos + 22, item.name, 13, C.text, { fw: 600, font: 'Georgia, serif' }));
      els.push(text(36, yPos + 38, item.region, 11, C.textSub, { font: 'system-ui, sans-serif' }));
      els.push(text(W - 28, yPos + 30, '♡', 16, item.col, { anchor: 'end', font: 'system-ui', opacity: 0.8 }));
      yPos += 60;
    });
    yPos += 16;
  });

  // "Add new list" button
  els.push(rect(20, yPos, W - 40, 48, 'none', { rx: 12, stroke: C.border, sw: 1.5 }));
  els.push(text(W / 2, yPos + 28, '+ New collection', 13, C.textMuted, { anchor: 'middle', font: 'system-ui, sans-serif' }));

  navBar(els, 'saved');
  return { name: 'Saved Places', elements: els };
}

// ── SCREEN 6: Profile ─────────────────────────────────────────────────────────
function buildScreen6() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  statusBar(els);

  // Avatar + name header
  els.push(circle(W / 2, 100, 44, C.accentSoft));
  els.push(text(W / 2, 110, 'MR', 24, C.accent, { anchor: 'middle', fw: 700, font: 'Georgia, serif' }));
  els.push(text(W / 2, 158, 'Mia Rossi', 22, C.text, { anchor: 'middle', fw: 700, font: 'Georgia, serif' }));
  els.push(text(W / 2, 178, 'Slow traveller · Florence, Italy', 13, C.textSub, { anchor: 'middle', font: 'system-ui, sans-serif' }));

  // Travel stats bar
  els.push(rect(20, 196, W - 40, 76, C.surface, { rx: 14 }));
  const pStats = [
    { label: 'Journeys', value: '7' },
    { label: 'Countries', value: '14' },
    { label: 'km total', value: '2,847' },
    { label: 'Journal days', value: '94' },
  ];
  pStats.forEach((s, i) => {
    const x = 20 + ((W - 40) / 4) * i + (W - 40) / 8;
    els.push(text(x, 228, s.value, 18, C.text, { fw: 700, anchor: 'middle', font: 'Georgia, serif' }));
    els.push(text(x, 248, s.label, 9, C.textSub, { anchor: 'middle', font: 'system-ui, sans-serif' }));
    if (i < 3) els.push(line(x + (W - 40) / 8, 212, x + (W - 40) / 8, 260, C.border, { sw: 1 }));
  });

  // Section: Recent journeys
  els.push(text(20, 294, 'Journey history', 15, C.text, { fw: 700, font: 'Georgia, serif' }));
  const journeys = [
    { name: 'Andalucia Slow Route', year: '2026', duration: '14 days', col: '#C4985A', active: true },
    { name: 'Via Francigena', year: '2025', duration: '22 days', col: '#8FA87B' },
    { name: 'Camino Portugués', year: '2024', duration: '12 days', col: '#7BA3B8' },
    { name: 'Nakasendo Walk', year: '2023', duration: '8 days', col: '#D4956A' },
  ];
  journeys.forEach((j, i) => {
    const y = 308 + i * 62;
    els.push(rect(20, y, W - 40, 54, j.active ? C.accentSoft : C.surface, { rx: 12, stroke: j.active ? C.accent : 'none', sw: j.active ? 1 : 0, opacity: j.active ? 1 : 1 }));
    els.push(circle(42, y + 27, 14, j.col, { opacity: 0.25 }));
    els.push(text(42, y + 32, '◎', 12, j.col, { anchor: 'middle', font: 'system-ui' }));
    els.push(text(62, y + 22, j.name, 13, C.text, { fw: 600, font: 'Georgia, serif' }));
    els.push(text(62, y + 38, `${j.year} · ${j.duration}`, 11, C.textSub, { font: 'system-ui, sans-serif' }));
    if (j.active) els.push(rect(W - 68, y + 17, 44, 20, C.accent, { rx: 10 }));
    if (j.active) els.push(text(W - 46, y + 31, 'Active', 9, C.white, { anchor: 'middle', fw: 600, font: 'system-ui, sans-serif' }));
    if (!j.active) els.push(text(W - 28, y + 30, '→', 16, C.textMuted, { anchor: 'end', font: 'system-ui' }));
  });

  // Settings row
  els.push(rect(20, 562, W - 40, 44, C.surface, { rx: 12 }));
  els.push(text(36, 589, '⚙ Settings & preferences', 13, C.text, { font: 'system-ui, sans-serif' }));
  els.push(text(W - 28, 589, '→', 16, C.textMuted, { anchor: 'end', font: 'system-ui' }));

  navBar(els, 'profile');
  return { name: 'Profile', elements: els };
}

// ── Assemble & write ──────────────────────────────────────────────────────────
const screens = [
  buildScreen1(),
  buildScreen2(),
  buildScreen3(),
  buildScreen4(),
  buildScreen5(),
  buildScreen6(),
];

// Convert elements to SVG for each screen
function elementsToSVG(els, w, h) {
  const svgEls = els.map(el => {
    if (!el) return '';
    switch (el.type) {
      case 'rect':
        return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${el.rx || 0}" opacity="${el.opacity ?? 1}" stroke="${el.stroke || 'none'}" stroke-width="${el.strokeWidth || 0}"/>`;
      case 'text':
        return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${el.fontWeight || 400}" font-family="${el.fontFamily || 'Georgia, serif'}" text-anchor="${el.textAnchor || 'start'}" letter-spacing="${el.letterSpacing || 0}" opacity="${el.opacity ?? 1}">${String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
      case 'circle':
        return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity ?? 1}" stroke="${el.stroke || 'none'}" stroke-width="${el.strokeWidth || 0}"/>`;
      case 'line':
        return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}" opacity="${el.opacity ?? 1}"/>`;
      case 'polygon':
        return `<polygon points="${el.points}" fill="${el.fill}" opacity="${el.opacity ?? 1}"/>`;
      case 'polyline':
        return `<polyline points="${el.points}" stroke="${el.stroke}" stroke-width="${el.strokeWidth || 2}" fill="${el.fill || 'none'}" opacity="${el.opacity ?? 1}"/>`;
      case 'ellipse':
        return `<ellipse cx="${el.cx}" cy="${el.cy}" rx="${el.rx}" ry="${el.ry}" fill="${el.fill}" opacity="${el.opacity ?? 1}"/>`;
      default:
        return '';
    }
  }).join('\n  ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n  ${svgEls}\n</svg>`;
}

const totalElements = screens.reduce((sum, s) => sum + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    slug: SLUG,
    tagline: TAGLINE,
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'light',
    heartbeat: HEARTBEAT,
    elements: totalElements,
    screens: screens.length,
    palette: { bg: C.bg, surface: C.surface, text: C.text, accent: C.accent, accent2: C.accent2 },
    inspiration: 'minimal.gallery warm neo-minimalism + saaspo.com bold serif authority trend',
  },
  screens: screens.map(s => ({
    name: s.name,
    width: W,
    height: H,
    svg: elementsToSVG(s.elements, W, H),
    elements: s.elements,
  })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
