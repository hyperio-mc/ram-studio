'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG    = 'hale';
const NAME    = 'HALE';
const TAGLINE = 'Mindful health, beautifully kept';
const DATE    = new Date().toISOString().slice(0, 10);
const HB      = 490;

// Canvas
const W = 390, H = 844;

// Warm editorial palette (light — Aesop / Kinfolk inspired)
const C = {
  bg:      '#FAF7F2',   // warm parchment
  surf:    '#FFFFFF',   // card surface
  cream:   '#F5EFE4',   // warm cream card
  border:  '#E8DFD0',   // soft warm border
  text:    '#1C1714',   // deep warm brown-black
  sub:     '#6B5A4E',   // warm medium brown
  muted:   '#A89A8E',   // muted warm tone
  accent:  '#5C4033',   // earthy terracotta-brown
  sage:    '#7B9B6B',   // sage green
  sage2:   '#E8F0E3',   // light sage background
  amber:   '#C4843C',   // warm amber
  amber2:  '#FDF3E3',   // soft amber background
  divider: '#DDD4C6',   // warm divider
  white:   '#FFFFFF',
};

let elements = [];
let totalElements = 0;

function el(type, props) {
  elements.push({ type, ...props });
  totalElements++;
}

// Primitives
function rect(x, y, w, h, fill, opts = {}) {
  el('rect', { x, y, width: w, height: h, fill,
    rx: opts.rx || 0, opacity: opts.opacity || 1,
    stroke: opts.stroke || 'none', strokeWidth: opts.sw || 0 });
}
function text(x, y, content, size, fill, opts = {}) {
  el('text', { x, y, content: String(content), fontSize: size, fill,
    fontWeight: opts.fw || 400,
    fontFamily: opts.font || 'Georgia, serif',
    textAnchor: opts.anchor || 'start',
    letterSpacing: opts.ls || 0,
    opacity: opts.opacity || 1 });
}
function circle(cx, cy, r, fill, opts = {}) {
  el('circle', { cx, cy, r, fill,
    opacity: opts.opacity || 1,
    stroke: opts.stroke || 'none', strokeWidth: opts.sw || 0 });
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  el('line', { x1, y1, x2, y2, stroke,
    strokeWidth: opts.sw || 1, opacity: opts.opacity || 1 });
}

// ─── Shared Components ──────────────────────────────────────────────────────

function statusBar(y = 0) {
  rect(0, y, W, 44, C.bg);
  text(20, y + 28, '9:41', 14, C.text, { fw: 500, font: 'Georgia, serif' });
  text(W - 20, y + 28, '●●● ▲ 100%', 11, C.sub, { anchor: 'end', font: 'sans-serif' });
}

function bottomNav(y, activeId) {
  rect(0, y, W, 84, C.surf, { rx: 0 });
  line(0, y, W, y, C.divider, { sw: 0.5 });

  const tabs = [
    { id: 'home',    label: 'Today',    icon: '◈' },
    { id: 'log',     label: 'Log',      icon: '✦' },
    { id: 'trends',  label: 'Trends',   icon: '◉' },
    { id: 'journal', label: 'Journal',  icon: '◻' },
    { id: 'profile', label: 'Profile',  icon: '○' },
  ];
  const tw = W / tabs.length;
  tabs.forEach((tab, i) => {
    const tx = tw * i + tw / 2;
    const isActive = tab.id === activeId;
    const col = isActive ? C.accent : C.muted;
    text(tx, y + 28, tab.icon, isActive ? 20 : 17, col, { anchor: 'middle', fw: isActive ? 700 : 400 });
    text(tx, y + 48, tab.label, 10, col, { anchor: 'middle', fw: isActive ? 600 : 400, font: 'sans-serif' });
    if (isActive) {
      rect(tx - 18, y + 2, 36, 2, C.accent, { rx: 1 });
    }
  });
}

function sectionLabel(x, y, label) {
  text(x, y, label.toUpperCase(), 9, C.muted, { fw: 600, ls: 2, font: 'sans-serif' });
  line(x, y + 8, x + 60, y + 8, C.divider, { sw: 0.5 });
}

// ─── SCREEN 1: Today Overview ────────────────────────────────────────────────

function screen1() {
  elements = []; totalElements = 0;

  // Background
  rect(0, 0, W, H, C.bg);

  // Status bar
  statusBar(0);

  // Header area
  rect(0, 44, W, 110, C.bg);
  text(24, 80, 'HALE', 13, C.accent, { fw: 700, ls: 3, font: 'sans-serif' });
  text(24, 116, 'Sunday, April 12', 28, C.text, { fw: 300, font: 'Georgia, serif', ls: -0.5 });
  text(24, 144, 'A quiet morning awaits.', 14, C.sub, { fw: 400, font: 'Georgia, serif' });

  // Thin decorative line
  line(24, 160, W - 24, 160, C.divider, { sw: 0.5 });

  // Daily intention card
  rect(20, 172, W - 40, 80, C.cream, { rx: 4 });
  rect(20, 172, 3, 80, C.accent, { rx: 1 });
  sectionLabel(32, 182, 'Today\'s intention');
  text(32, 204, '"Rest is not idleness, but the pause', 13, C.text, { fw: 400, font: 'Georgia, serif' });
  text(32, 222, ' that sharpens the blade."', 13, C.text, { fw: 400, font: 'Georgia, serif' });
  text(32, 242, '— John Lubbock', 11, C.muted, { fw: 400, font: 'Georgia, serif' });

  // Vitals row
  sectionLabel(24, 272, 'Morning vitals');

  // Three metric cards
  const metrics = [
    { label: 'Resting HR', value: '58', unit: 'bpm', icon: '♡', color: C.accent },
    { label: 'Sleep', value: '7h 42m', unit: '', icon: '◑', color: C.sage },
    { label: 'HRV', value: '64', unit: 'ms', icon: '◈', color: C.amber },
  ];
  const mw = (W - 48) / 3;
  metrics.forEach((m, i) => {
    const mx = 20 + i * (mw + 4);
    rect(mx, 288, mw, 82, C.surf, { rx: 4, stroke: C.border, sw: 0.5 });
    text(mx + mw / 2, 310, m.icon, 16, m.color, { anchor: 'middle' });
    text(mx + mw / 2, 336, m.value, 18, C.text, { anchor: 'middle', fw: 600, font: 'Georgia, serif' });
    if (m.unit) text(mx + mw / 2, 350, m.unit, 9, C.muted, { anchor: 'middle', font: 'sans-serif' });
    text(mx + mw / 2, 362, m.label, 9, C.sub, { anchor: 'middle', font: 'sans-serif' });
  });

  // Wellness rings
  sectionLabel(24, 390, 'Daily rings');
  rect(20, 406, W - 40, 96, C.surf, { rx: 4, stroke: C.border, sw: 0.5 });

  // Movement ring
  const rings = [
    { label: 'Movement', pct: 72, color: C.accent, cx: 62 },
    { label: 'Mindfulness', pct: 45, color: C.sage, cx: 145 },
    { label: 'Nourishment', pct: 88, color: C.amber, cx: 228 },
    { label: 'Rest', pct: 92, color: '#A278B5', cx: 311 },
  ];
  rings.forEach(r => {
    circle(r.cx, 446, 22, 'none', { stroke: C.divider, sw: 4 });
    // Arc approximation using partial circle
    const pct = r.pct / 100;
    const angle = pct * 2 * Math.PI;
    const startX = r.cx;
    const startY = 424;
    circle(r.cx, 446, 22, 'none', { stroke: r.color, sw: 4, opacity: 0.9 });
    text(r.cx, 450, `${r.pct}%`, 10, C.text, { anchor: 'middle', fw: 600, font: 'sans-serif' });
    text(r.cx, 492, r.label, 8, C.muted, { anchor: 'middle', font: 'sans-serif' });
  });

  // Today's log entries
  sectionLabel(24, 520, 'Logged today');

  const logs = [
    { time: '7:12 AM', entry: 'Morning walk, 28 min', tag: 'Move', tagColor: C.accent, tagBg: '#F3EBE6' },
    { time: '8:30 AM', entry: 'Matcha + overnight oats', tag: 'Eat', tagColor: C.sage, tagBg: C.sage2 },
    { time: '9:15 AM', entry: '10 min breathing exercise', tag: 'Mind', tagColor: C.amber, tagBg: C.amber2 },
  ];

  logs.forEach((log, i) => {
    const ly = 536 + i * 52;
    rect(20, ly, W - 40, 44, C.surf, { rx: 4, stroke: C.border, sw: 0.5 });
    circle(40, ly + 22, 3, C.divider);
    text(55, ly + 16, log.time, 10, C.muted, { font: 'sans-serif' });
    text(55, ly + 32, log.entry, 13, C.text, { fw: 400, font: 'Georgia, serif' });
    rect(W - 64, ly + 12, 44, 20, log.tagBg, { rx: 10 });
    text(W - 42, ly + 26, log.tag, 10, log.tagColor, { anchor: 'middle', fw: 600, font: 'sans-serif' });
  });

  // Quick log FAB
  rect(W - 72, H - 160, 52, 52, C.accent, { rx: 26 });
  text(W - 46, H - 128, '+', 28, C.white, { anchor: 'middle', fw: 300 });

  // Bottom nav
  bottomNav(H - 84, 'home');

  return { name: 'Today', elements: [...elements] };
}

// ─── SCREEN 2: Log Entry ─────────────────────────────────────────────────────

function screen2() {
  elements = []; totalElements = 0;

  rect(0, 0, W, H, C.bg);
  statusBar(0);

  // Header
  rect(0, 44, W, 60, C.bg);
  rect(16, 58, 32, 32, C.cream, { rx: 16 });
  text(32, 80, '‹', 20, C.text, { anchor: 'middle' });
  text(W / 2, 82, 'Add Entry', 17, C.text, { anchor: 'middle', fw: 400, font: 'Georgia, serif' });

  line(24, 108, W - 24, 108, C.divider, { sw: 0.5 });

  // Category selector
  sectionLabel(24, 124, 'Category');
  const cats = [
    { label: 'Move', icon: '◈', active: false, color: C.accent, bg: '#F3EBE6' },
    { label: 'Eat', icon: '✦', active: true, color: C.sage, bg: C.sage2 },
    { label: 'Mind', icon: '◉', active: false, color: C.amber, bg: C.amber2 },
    { label: 'Rest', icon: '◑', active: false, color: '#A278B5', bg: '#F0EAF5' },
    { label: 'Body', icon: '○', active: false, color: C.sub, bg: C.cream },
  ];
  cats.forEach((cat, i) => {
    const cx = 24 + i * 70;
    rect(cx, 140, 60, 60, cat.active ? cat.bg : C.surf, { rx: 8, stroke: cat.active ? cat.color : C.border, sw: cat.active ? 1 : 0.5 });
    text(cx + 30, 168, cat.icon, cat.active ? 22 : 18, cat.color, { anchor: 'middle' });
    text(cx + 30, 186, cat.label, 10, cat.active ? cat.color : C.sub, { anchor: 'middle', fw: cat.active ? 600 : 400, font: 'sans-serif' });
  });

  // What did you have
  sectionLabel(24, 220, 'What did you have?');
  rect(20, 236, W - 40, 52, C.surf, { rx: 4, stroke: C.accent, sw: 1 });
  text(32, 260, 'Avocado toast with poached eggs', 14, C.text, { fw: 400, font: 'Georgia, serif' });
  text(32, 278, 'and a side of sliced fruit', 14, C.text, { fw: 400, font: 'Georgia, serif' });
  // Cursor blink
  rect(W - 40, 252, 2, 20, C.accent, { rx: 1 });

  // Quick tags
  sectionLabel(24, 306, 'Quick tags');
  const qtags = ['Homemade', 'Protein-rich', 'Balanced', 'Slow-food'];
  let qx = 24;
  qtags.forEach(tag => {
    const tw = tag.length * 7 + 24;
    rect(qx, 322, tw, 28, C.sage2, { rx: 14 });
    text(qx + tw / 2, 341, tag, 11, C.sage, { anchor: 'middle', fw: 500, font: 'sans-serif' });
    qx += tw + 8;
  });

  // How did it make you feel
  sectionLabel(24, 370, 'How did it feel?');
  const moods = ['😊 Energised', '😌 Content', '😐 Neutral', '😴 Heavy'];
  moods.forEach((mood, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const mx = 20 + col * ((W - 44) / 2 + 4);
    const my = 386 + row * 52;
    const active = i === 0;
    rect(mx, my, (W - 44) / 2, 44, active ? C.sage2 : C.surf, { rx: 4, stroke: active ? C.sage : C.border, sw: active ? 1 : 0.5 });
    text(mx + (W - 44) / 4, my + 26, mood, 13, active ? C.sage : C.sub, { anchor: 'middle', fw: active ? 500 : 400, font: 'sans-serif' });
  });

  // Portion size
  sectionLabel(24, 498, 'Portion');
  rect(20, 514, W - 40, 44, C.surf, { rx: 4, stroke: C.border, sw: 0.5 });
  const portions = ['Small', 'Medium', 'Large'];
  portions.forEach((p, i) => {
    const pw = (W - 52) / 3;
    const px = 24 + i * (pw + 4);
    rect(px, 518, pw, 36, i === 1 ? C.cream : 'none', { rx: 3, stroke: i === 1 ? C.border : 'none' });
    text(px + pw / 2, 541, p, 13, i === 1 ? C.accent : C.muted, { anchor: 'middle', fw: i === 1 ? 600 : 400, font: 'sans-serif' });
  });

  // Note field
  sectionLabel(24, 578, 'Note (optional)');
  rect(20, 594, W - 40, 68, C.surf, { rx: 4, stroke: C.border, sw: 0.5 });
  text(32, 616, 'Felt really nourishing. Took time to', 13, C.text, { fw: 400, font: 'Georgia, serif' });
  text(32, 634, 'eat slowly and enjoy…', 13, C.muted, { fw: 400, font: 'Georgia, serif' });

  // Save button
  rect(20, 678, W - 40, 52, C.accent, { rx: 4 });
  text(W / 2, 710, 'Save Entry', 16, C.white, { anchor: 'middle', fw: 500, font: 'sans-serif' });

  // Bottom nav
  bottomNav(H - 84, 'log');

  return { name: 'Log Entry', elements: [...elements] };
}

// ─── SCREEN 3: Trends ────────────────────────────────────────────────────────

function screen3() {
  elements = []; totalElements = 0;

  rect(0, 0, W, H, C.bg);
  statusBar(0);

  // Header
  rect(0, 44, W, 60, C.bg);
  text(24, 82, 'Trends', 28, C.text, { fw: 300, font: 'Georgia, serif' });
  rect(W - 80, 58, 60, 28, C.cream, { rx: 14 });
  text(W - 50, 77, 'This week', 10, C.sub, { anchor: 'middle', font: 'sans-serif' });

  line(24, 108, W - 24, 108, C.divider, { sw: 0.5 });

  // Week selector
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dw = (W - 48) / 7;
  days.forEach((d, i) => {
    const dx = 24 + i * dw;
    const isToday = i === 6;
    rect(dx, 118, dw - 4, 40, isToday ? C.accent : 'none', { rx: 4 });
    text(dx + (dw - 4) / 2, 132, d, 9, isToday ? C.white : C.muted, { anchor: 'middle', font: 'sans-serif' });
    text(dx + (dw - 4) / 2, 148, `${12 + i}`, 12, isToday ? C.white : C.sub, { anchor: 'middle', fw: isToday ? 600 : 400, font: 'sans-serif' });
  });

  // Movement chart
  sectionLabel(24, 176, 'Movement — steps');
  rect(20, 192, W - 40, 120, C.surf, { rx: 4, stroke: C.border, sw: 0.5 });

  const stepData = [4200, 7800, 6100, 9200, 8400, 5600, 3200];
  const maxSteps = 10000;
  const barW = 28;
  const chartH = 80;
  const chartBase = 292;
  const chartLeft = 36;
  const barSpacing = (W - 80) / 7;

  // Grid lines
  [0.25, 0.5, 0.75, 1].forEach(pct => {
    const ly = chartBase - chartH * pct;
    line(chartLeft, ly, W - 36, ly, C.divider, { sw: 0.3 });
    text(chartLeft - 4, ly + 4, `${Math.round(maxSteps * pct / 1000)}k`, 8, C.muted, { anchor: 'end', font: 'sans-serif' });
  });

  stepData.forEach((val, i) => {
    const bh = (val / maxSteps) * chartH;
    const bx = chartLeft + i * barSpacing + barSpacing / 2 - barW / 2;
    const by = chartBase - bh;
    const isToday = i === 6;
    rect(bx, by, barW, bh, isToday ? C.accent : C.sage2, { rx: 2, opacity: isToday ? 1 : 0.8 });
    text(bx + barW / 2, chartBase + 12, days[i], 8, C.muted, { anchor: 'middle', font: 'sans-serif' });
  });

  text(W - 36, 208, 'avg 6,357', 10, C.muted, { anchor: 'end', font: 'sans-serif' });
  text(W - 36, 222, '↑ 12% vs last wk', 10, C.sage, { anchor: 'end', font: 'sans-serif' });

  // Sleep quality
  sectionLabel(24, 320, 'Sleep quality');
  rect(20, 336, W - 40, 100, C.surf, { rx: 4, stroke: C.border, sw: 0.5 });

  const sleepData = [82, 74, 89, 91, 68, 85, 92];
  sleepData.forEach((score, i) => {
    const sh = (score / 100) * 64;
    const sx = 36 + i * barSpacing + barSpacing / 2 - 10;
    const sy = 400 - sh;
    const isToday = i === 6;
    rect(sx, sy, 20, sh, isToday ? C.amber : C.amber2, { rx: 2 });
    text(sx + 10, 414, days[i], 8, C.muted, { anchor: 'middle', font: 'sans-serif' });
    if (isToday) text(sx + 10, sy - 4, `${score}`, 9, C.amber, { anchor: 'middle', fw: 600, font: 'sans-serif' });
  });

  text(W - 36, 352, 'avg 83/100', 10, C.muted, { anchor: 'end', font: 'sans-serif' });

  // HRV trend line
  sectionLabel(24, 450, 'Heart rate variability');
  rect(20, 466, W - 40, 90, C.surf, { rx: 4, stroke: C.border, sw: 0.5 });

  const hrvData = [58, 62, 55, 67, 64, 60, 64];
  const minHRV = 50, maxHRV = 75;
  const lineLeft = 36, lineRight = W - 36;
  const lineW = lineRight - lineLeft;
  const lineBase = 544, lineTop = 480;

  // Draw line segments
  for (let i = 0; i < hrvData.length - 1; i++) {
    const x1 = lineLeft + (i / (hrvData.length - 1)) * lineW;
    const y1 = lineBase - ((hrvData[i] - minHRV) / (maxHRV - minHRV)) * (lineBase - lineTop);
    const x2 = lineLeft + ((i + 1) / (hrvData.length - 1)) * lineW;
    const y2 = lineBase - ((hrvData[i + 1] - minHRV) / (maxHRV - minHRV)) * (lineBase - lineTop);
    line(x1, y1, x2, y2, C.accent, { sw: 2 });
  }
  // Dots
  hrvData.forEach((val, i) => {
    const cx2 = lineLeft + (i / (hrvData.length - 1)) * lineW;
    const cy2 = lineBase - ((val - minHRV) / (maxHRV - minHRV)) * (lineBase - lineTop);
    circle(cx2, cy2, 3, C.accent);
    if (i === 6) {
      circle(cx2, cy2, 6, C.accent, { opacity: 0.2 });
      text(cx2, cy2 - 10, `${val}ms`, 9, C.accent, { anchor: 'middle', fw: 600, font: 'sans-serif' });
    }
  });

  text(W - 36, 482, 'Range: 55–67ms', 10, C.muted, { anchor: 'end', font: 'sans-serif' });

  // Insight strip
  rect(20, 574, W - 40, 56, C.cream, { rx: 4 });
  rect(20, 574, 3, 56, C.sage, { rx: 1 });
  text(32, 596, '✦  Weekly insight', 10, C.sage, { fw: 600, font: 'sans-serif' });
  text(32, 616, 'Your HRV peaks mid-week — consider', 12, C.text, { font: 'Georgia, serif' });
  text(32, 632, 'harder workouts on Tuesday & Wednesday.', 12, C.text, { font: 'Georgia, serif' });

  // Bottom nav
  bottomNav(H - 84, 'trends');

  return { name: 'Trends', elements: [...elements] };
}

// ─── SCREEN 4: Journal ───────────────────────────────────────────────────────

function screen4() {
  elements = []; totalElements = 0;

  rect(0, 0, W, H, C.bg);
  statusBar(0);

  // Header
  rect(0, 44, W, 60, C.bg);
  text(24, 82, 'Journal', 28, C.text, { fw: 300, font: 'Georgia, serif' });
  rect(W - 52, 62, 32, 28, C.cream, { rx: 4 });
  text(W - 36, 81, '✦', 16, C.accent, { anchor: 'middle' });

  line(24, 108, W - 24, 108, C.divider, { sw: 0.5 });

  // Current entry - editorial style
  text(24, 136, 'April 12, 2026', 11, C.muted, { font: 'sans-serif', ls: 1 });
  text(24, 170, 'A morning of unhurried', 26, C.text, { fw: 300, font: 'Georgia, serif' });
  text(24, 200, 'things', 26, C.text, { fw: 300, font: 'Georgia, serif' });

  // Body text - editorial layout
  const bodyLines = [
    'Woke at 6:42 without the alarm. The light',
    'through the curtains was soft and unhurried.',
    '',
    'I made matcha slowly today — the kind of',
    'slowness that feels like a decision, not an',
    'accident. There\'s something to that.',
    '',
    'Body felt rested. HRV says 64ms. The',
    'numbers sometimes confirm what we already',
    'know but haven\'t named yet.',
  ];
  bodyLines.forEach((line2, i) => {
    text(24, 228 + i * 20, line2, 13.5, line2 === '' ? C.bg : (i > 5 ? C.sub : C.text), { font: 'Georgia, serif', fw: 400 });
  });

  // Tags attached to entry
  const jTags = ['Mindful', 'Low-intensity', 'Reflective'];
  let jtx = 24;
  jTags.forEach(tag => {
    const tw = tag.length * 7 + 20;
    rect(jtx, 450, tw, 24, C.cream, { rx: 12, stroke: C.border, sw: 0.5 });
    text(jtx + tw / 2, 467, tag, 10, C.sub, { anchor: 'middle', font: 'sans-serif' });
    jtx += tw + 8;
  });

  // Mood indicator
  rect(24, 488, W - 48, 52, C.surf, { rx: 4, stroke: C.border, sw: 0.5 });
  text(36, 510, 'Mood', 10, C.muted, { font: 'sans-serif' });
  text(36, 530, '😌  Content & grounded', 13, C.text, { font: 'Georgia, serif' });
  const moodPct = 72;
  rect(W - 120, 506, 80, 6, C.divider, { rx: 3 });
  rect(W - 120, 506, 80 * moodPct / 100, 6, C.sage, { rx: 3 });
  text(W - 34, 514, `${moodPct}%`, 10, C.sage, { anchor: 'end', font: 'sans-serif', fw: 600 });

  // Divider
  line(24, 556, W - 24, 556, C.divider, { sw: 0.5 });

  // Past entries
  sectionLabel(24, 568, 'Recent entries');

  const pastEntries = [
    { date: 'April 11', title: 'On effort and its cousin, rest', tags: ['Active', 'Processing'], mood: '😊' },
    { date: 'April 10', title: 'Rainy evening, unexpected calm', tags: ['Reflective'], mood: '😌' },
  ];

  pastEntries.forEach((entry, i) => {
    const ey = 584 + i * 76;
    rect(20, ey, W - 40, 68, C.surf, { rx: 4, stroke: C.border, sw: 0.5 });
    text(32, ey + 18, entry.date, 10, C.muted, { font: 'sans-serif' });
    text(32, ey + 38, entry.title, 14, C.text, { fw: 400, font: 'Georgia, serif' });
    text(32, ey + 56, entry.tags.join(' · '), 10, C.sub, { font: 'sans-serif' });
    text(W - 36, ey + 38, entry.mood, 18, C.text, { anchor: 'end' });
  });

  // Write new button
  rect(20, H - 150, W - 40, 48, C.accent, { rx: 4 });
  text(W / 2, H - 119, '✦  Write today\'s entry', 14, C.white, { anchor: 'middle', fw: 400, font: 'sans-serif' });

  // Bottom nav
  bottomNav(H - 84, 'journal');

  return { name: 'Journal', elements: [...elements] };
}

// ─── SCREEN 5: Profile / Insights ────────────────────────────────────────────

function screen5() {
  elements = []; totalElements = 0;

  rect(0, 0, W, H, C.bg);
  statusBar(0);

  // Header
  rect(0, 44, W, 60, C.bg);
  text(24, 82, 'Your profile', 22, C.text, { fw: 300, font: 'Georgia, serif' });

  line(24, 108, W - 24, 108, C.divider, { sw: 0.5 });

  // Avatar + name area
  rect(20, 120, W - 40, 96, C.surf, { rx: 4, stroke: C.border, sw: 0.5 });
  circle(64, 168, 28, C.cream, { stroke: C.border, sw: 1 });
  text(64, 174, 'E', 22, C.accent, { anchor: 'middle', fw: 300, font: 'Georgia, serif' });
  text(108, 156, 'Eleanor M.', 18, C.text, { fw: 400, font: 'Georgia, serif' });
  text(108, 176, 'Member since January 2026', 11, C.muted, { font: 'sans-serif' });
  text(108, 196, '🌿 Steady practitioner', 11, C.sage, { fw: 500, font: 'sans-serif' });

  // Streak
  rect(W - 92, 130, 64, 76, C.amber2, { rx: 4, stroke: C.amber, sw: 0.5 });
  text(W - 60, 172, '24', 28, C.amber, { anchor: 'middle', fw: 600, font: 'Georgia, serif' });
  text(W - 60, 192, 'day streak', 9, C.amber, { anchor: 'middle', font: 'sans-serif' });

  // Life stats
  sectionLabel(24, 236, 'Your numbers');
  const stats = [
    { label: 'Total entries', value: '312', icon: '✦' },
    { label: 'Avg sleep', value: '7h 18m', icon: '◑' },
    { label: 'Best HRV', value: '72ms', icon: '♡' },
    { label: 'Active days', value: '91%', icon: '◈' },
  ];
  const sw2 = (W - 48) / 2;
  stats.forEach((s, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const sx = 20 + col * (sw2 + 8);
    const sy = 252 + row * 64;
    rect(sx, sy, sw2, 56, C.surf, { rx: 4, stroke: C.border, sw: 0.5 });
    text(sx + 14, sy + 22, s.icon, 14, C.accent, { font: 'Georgia, serif' });
    text(sx + 36, sy + 24, s.value, 18, C.text, { fw: 600, font: 'Georgia, serif' });
    text(sx + 14, sy + 42, s.label, 10, C.muted, { font: 'sans-serif' });
  });

  // Monthly progress
  sectionLabel(24, 394, 'This month — April');
  rect(20, 410, W - 40, 108, C.surf, { rx: 4, stroke: C.border, sw: 0.5 });

  const progItems = [
    { label: 'Daily movement goal', pct: 83, color: C.accent },
    { label: 'Mindfulness sessions', pct: 60, color: C.sage },
    { label: 'Journal consistency', pct: 92, color: C.amber },
    { label: 'Sleep quality target', pct: 76, color: '#A278B5' },
  ];
  progItems.forEach((p, i) => {
    const py = 424 + i * 24;
    text(32, py + 12, p.label, 11, C.sub, { font: 'sans-serif' });
    text(W - 36, py + 12, `${p.pct}%`, 11, p.color, { anchor: 'end', fw: 600, font: 'sans-serif' });
    rect(32, py + 16, W - 72, 4, C.divider, { rx: 2 });
    rect(32, py + 16, (W - 72) * p.pct / 100, 4, p.color, { rx: 2, opacity: 0.8 });
  });

  // Settings links
  sectionLabel(24, 538, 'Preferences');
  const settings = [
    { label: 'Notification schedule', icon: '◉' },
    { label: 'Connected devices', icon: '◈' },
    { label: 'Data & privacy', icon: '○' },
    { label: 'Appearance', icon: '◑' },
  ];
  settings.forEach((s, i) => {
    const sy2 = 554 + i * 44;
    line(24, sy2 + 40, W - 24, sy2 + 40, C.divider, { sw: 0.3 });
    text(24, sy2 + 20, s.icon, 14, C.sub, { font: 'Georgia, serif' });
    text(48, sy2 + 22, s.label, 14, C.text, { fw: 400, font: 'Georgia, serif' });
    text(W - 24, sy2 + 22, '›', 18, C.muted, { anchor: 'end' });
  });

  // Bottom nav
  bottomNav(H - 84, 'profile');

  return { name: 'Profile', elements: [...elements] };
}

// ─── SCREEN 6: Onboarding / Intro ────────────────────────────────────────────

function screen6() {
  elements = []; totalElements = 0;

  rect(0, 0, W, H, C.bg);
  statusBar(0);

  // Large editorial hero
  rect(20, 80, W - 40, 220, C.cream, { rx: 8 });

  // Decorative top strip
  rect(20, 80, W - 40, 8, C.accent, { rx: 4 });

  // Big serif headline
  text(48, 150, 'Health is not a', 32, C.text, { fw: 300, font: 'Georgia, serif' });
  text(48, 188, 'destination.', 32, C.accent, { fw: 300, font: 'Georgia, serif' });
  text(48, 240, 'It is the practice', 18, C.sub, { fw: 300, font: 'Georgia, serif' });
  text(48, 264, 'of showing up.', 18, C.sub, { fw: 300, font: 'Georgia, serif' });

  // Decorative element
  circle(W - 56, 160, 32, C.sage2, { stroke: C.sage, sw: 0.5 });
  text(W - 56, 156, '♡', 20, C.sage, { anchor: 'middle', font: 'Georgia, serif' });
  text(W - 56, 174, 'vitality', 9, C.sage, { anchor: 'middle', font: 'sans-serif' });

  // Subtext
  text(24, 330, 'HALE helps you track what matters —', 14, C.sub, { font: 'Georgia, serif' });
  text(24, 352, 'movement, nourishment, rest, and', 14, C.sub, { font: 'Georgia, serif' });
  text(24, 374, 'the words in between.', 14, C.sub, { font: 'Georgia, serif' });

  // Three pillars
  const pillars = [
    { icon: '◈', title: 'Log anything', body: 'Meals, movement, mood — in seconds', color: C.accent },
    { icon: '◉', title: 'See patterns', body: 'Gentle charts reveal what matters', color: C.sage },
    { icon: '◑', title: 'Write it down', body: 'A journal that connects to your data', color: C.amber },
  ];
  pillars.forEach((p, i) => {
    const py = 404 + i * 68;
    rect(20, py, W - 40, 60, C.surf, { rx: 4, stroke: C.border, sw: 0.5 });
    rect(20, py, 3, 60, p.color, { rx: 1 });
    text(38, py + 28, p.icon, 20, p.color, { font: 'Georgia, serif' });
    text(68, py + 22, p.title, 14, C.text, { fw: 500, font: 'Georgia, serif' });
    text(68, py + 40, p.body, 12, C.sub, { font: 'Georgia, serif' });
  });

  // CTA
  rect(20, 618, W - 40, 52, C.accent, { rx: 4 });
  text(W / 2, 650, 'Begin your practice', 16, C.white, { anchor: 'middle', fw: 400, font: 'Georgia, serif' });

  // Sub link
  text(W / 2, 690, 'Sign in to existing account', 13, C.sub, { anchor: 'middle', font: 'sans-serif' });

  // Bottom indicator dots
  [0, 1, 2].forEach(i => {
    circle(W / 2 + (i - 1) * 16, 720, i === 0 ? 4 : 3, i === 0 ? C.accent : C.divider);
  });

  // Wordmark
  text(W / 2, 760, 'HALE', 12, C.muted, { anchor: 'middle', fw: 600, ls: 4, font: 'sans-serif' });
  text(W / 2, 778, 'Mindful health, beautifully kept', 10, C.divider, { anchor: 'middle', font: 'sans-serif' });

  return { name: 'Welcome', elements: [...elements] };
}

// ─── Assemble ────────────────────────────────────────────────────────────────

const screens = [screen6(), screen1(), screen2(), screen3(), screen4(), screen5()];

const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    tagline: TAGLINE,
    author: 'RAM',
    date: DATE,
    theme: 'light',
    heartbeat: HB,
    archetype: 'health-wellness',
    palette: {
      bg: C.bg, surf: C.surf, text: C.text,
      accent: C.accent, accent2: C.sage, muted: C.muted,
    },
    elements: screens.reduce((a, s) => a + s.elements.length, 0),
    inspiration: 'Aesop / Kinfolk editorial aesthetic via minimal.gallery — warm ivory, expressive serif, museum whitespace',
  },
  screens: screens.map(s => ({
    name: s.name,
    width: W, height: H,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"/>`,
    elements: s.elements,
  })),
};

const totalEl = screens.reduce((a, s) => a + s.elements.length, 0);
console.log(`${NAME}: ${screens.length} screens, ${totalEl} elements`);

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`Written: ${SLUG}.pen`);
