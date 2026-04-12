'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG = 'kelp';
const NAME = 'KELP';
const TAGLINE = 'grow quietly, one habit at a time';
const HEARTBEAT = 22;
const DATE = new Date().toISOString().split('T')[0];

// ── Palette (Light · warm linen + deep teal) ──────────────────────────────
const P = {
  bg:      '#F4F1EC',
  surf:    '#FFFFFF',
  card:    '#E8E3D9',
  card2:   '#DEDAD2',
  text:    '#1A1915',
  muted:   '#7A7668',
  acc:     '#1B6B5C',    // deep ocean teal
  acc2:    '#C97B3C',    // warm amber
  acc3:    '#5C3F8F',    // muted violet
  border:  '#D4CFC4',
  green:   '#2E8B6A',
  red:     '#C0432F',
};

const W = 390, H = 844;

// ── Primitives ─────────────────────────────────────────────────────────────
const els = [];

function rect(x, y, w, h, fill, opts = {}) {
  const e = { type: 'rect', x, y, w, h, fill };
  if (opts.rx    !== undefined) e.rx = opts.rx;
  if (opts.ry    !== undefined) e.ry = opts.ry;
  if (opts.opacity !== undefined) e.opacity = opts.opacity;
  if (opts.stroke) { e.stroke = opts.stroke; e.strokeWidth = opts.sw || 1; }
  els.push(e); return e;
}

function text(x, y, content, size, fill, opts = {}) {
  const e = { type: 'text', x, y, content, fontSize: size, fill };
  if (opts.fw)     e.fontWeight = opts.fw;
  if (opts.font)   e.fontFamily = opts.font;
  if (opts.anchor) e.textAnchor = opts.anchor;
  if (opts.ls)     e.letterSpacing = opts.ls;
  if (opts.opacity !== undefined) e.opacity = opts.opacity;
  els.push(e); return e;
}

function circle(cx, cy, r, fill, opts = {}) {
  const e = { type: 'circle', cx, cy, r, fill };
  if (opts.opacity !== undefined) e.opacity = opts.opacity;
  if (opts.stroke) { e.stroke = opts.stroke; e.strokeWidth = opts.sw || 1; }
  els.push(e); return e;
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  const e = { type: 'line', x1, y1, x2, y2, stroke };
  e.strokeWidth = opts.sw || 1;
  if (opts.opacity !== undefined) e.opacity = opts.opacity;
  els.push(e); return e;
}

// ── Shared Components ──────────────────────────────────────────────────────
function statusBar(y = 0) {
  rect(0, y, W, 44, P.bg);
  text(20, y + 28, '9:41', 13, P.text, { fw: 600 });
  // battery + signal
  rect(W - 55, y + 16, 22, 10, 'none', { stroke: P.muted, sw: 1.5, rx: 2 });
  rect(W - 54, y + 17, 16, 8, P.text, { rx: 1 });
  rect(W - 33, y + 19, 3, 6, P.text, { rx: 1 });
  circle(W - 80, y + 21, 4, P.muted, { opacity: 0.5 });
  circle(W - 93, y + 21, 4, P.muted, { opacity: 0.3 });
}

function bottomNav(y, active) {
  rect(0, y, W, 84, P.surf, { stroke: P.border, sw: 0.5 });
  const tabs = [
    { id: 'home',    label: 'Today',    icon: 'leaf' },
    { id: 'habits',  label: 'Habits',   icon: 'check' },
    { id: 'journal', label: 'Reflect',  icon: 'edit' },
    { id: 'stats',   label: 'Progress', icon: 'bar' },
    { id: 'profile', label: 'Me',       icon: 'user' },
  ];
  tabs.forEach((tab, i) => {
    const cx = 39 + i * 78;
    const isActive = tab.id === active;
    const col = isActive ? P.acc : P.muted;
    // icon placeholder
    drawIcon(cx, y + 22, tab.icon, col, isActive);
    text(cx, y + 58, tab.label, 10, col, { anchor: 'middle', fw: isActive ? 600 : 400 });
    if (isActive) {
      rect(cx - 14, y + 5, 28, 3, P.acc, { rx: 2 });
    }
  });
}

function drawIcon(cx, cy, type, col, bold = false) {
  const sw = bold ? 2.2 : 1.8;
  if (type === 'leaf') {
    // leaf shape via bezier-ish via lines
    circle(cx, cy, 8, 'none', { stroke: col, sw });
    line(cx, cy - 8, cx, cy + 8, col, { sw: sw * 0.8 });
  } else if (type === 'check') {
    rect(cx - 7, cy - 7, 14, 14, 'none', { stroke: col, sw, rx: 3 });
    line(cx - 3, cy, cx, cy + 3, col, { sw: sw * 0.9 });
    line(cx, cy + 3, cx + 4, cy - 2, col, { sw: sw * 0.9 });
  } else if (type === 'edit') {
    rect(cx - 6, cy - 6, 11, 11, 'none', { stroke: col, sw, rx: 1 });
    line(cx + 4, cy - 7, cx + 8, cy - 3, col, { sw: sw * 0.9 });
    line(cx + 8, cy - 3, cx + 5, cy, col, { sw: sw * 0.9 });
  } else if (type === 'bar') {
    rect(cx - 7, cy + 1, 4, 6, col, { rx: 1 });
    rect(cx - 2, cy - 2, 4, 9, col, { rx: 1, opacity: 0.7 });
    rect(cx + 3, cy - 5, 4, 12, col, { rx: 1, opacity: 0.5 });
  } else if (type === 'user') {
    circle(cx, cy - 3, 5, 'none', { stroke: col, sw });
    // arc for shoulders
    rect(cx - 7, cy + 4, 14, 6, 'none', { stroke: col, sw, rx: 7 });
  }
}

// ── SCREEN 1: Today Dashboard (Bento Grid) ─────────────────────────────────
function screen1() {
  // bg
  rect(0, 0, W, H, P.bg);
  statusBar(0);

  // header
  text(20, 72, 'Good morning', 13, P.muted, { fw: 400 });
  text(20, 97, 'Wednesday, Apr 9', 22, P.text, { fw: 700, font: 'Georgia', ls: '-0.3' });

  // ── BENTO GRID ──────────────────────────────────────────────────────────
  // Row A: large streak card + small water card
  // Streak card (large, 2/3 width)
  rect(14, 114, 228, 136, P.acc, { rx: 18 });
  // subtle grain-like inner texture dots
  circle(30, 130, 40, P.surf, { opacity: 0.06 });
  circle(200, 220, 60, P.surf, { opacity: 0.04 });
  text(30, 144, '🔥', 22, P.surf);
  text(30, 172, '18', 46, P.surf, { fw: 800, font: 'Georgia', ls: '-1' });
  text(30, 193, 'day streak', 12, P.surf, { opacity: 0.8, fw: 400 });
  text(30, 215, 'Keep it going!', 11, P.surf, { opacity: 0.65 });
  // mini streak bar
  const streakDays = [1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1];
  streakDays.slice(-7).forEach((v, i) => {
    rect(30 + i * 28, 225, 20, 12, v ? P.acc2 : P.surf, { rx: 4, opacity: v ? 1 : 0.25 });
  });

  // Water card (small)
  rect(248, 114, 128, 136, P.surf, { rx: 18, stroke: P.border, sw: 1 });
  text(262, 140, '💧', 18, P.text);
  text(262, 166, '6 / 8', 24, P.text, { fw: 700 });
  text(262, 183, 'glasses', 11, P.muted);
  // water progress bar
  rect(262, 196, 100, 8, P.card, { rx: 4 });
  rect(262, 196, 75, 8, '#4AACCC', { rx: 4 });
  text(262, 224, 'Tap to log', 11, P.muted, { opacity: 0.7 });
  text(345, 224, '+1', 11, P.acc, { fw: 600, anchor: 'end' });

  // Row B: Three small cards
  const cards = [
    { x: 14,  label: 'Meditate', val: '✓', sub: '10 min', fill: P.card, acc: P.green },
    { x: 148, label: 'Read',     val: '✓', sub: '25 min', fill: P.card2, acc: P.green },
    { x: 282, label: 'Journal',  val: '—', sub: 'pending', fill: P.surf, acc: P.muted },
  ];
  cards.forEach(c => {
    rect(c.x, 260, 120, 96, c.fill, { rx: 16, stroke: P.border, sw: 0.5 });
    circle(c.x + 60, 300, 18, c.acc, { opacity: 0.15 });
    text(c.x + 60, 305, c.val, 16, c.acc, { anchor: 'middle', fw: 700 });
    text(c.x + 60, 326, c.label, 11, P.text, { anchor: 'middle', fw: 600 });
    text(c.x + 60, 344, c.sub, 10, P.muted, { anchor: 'middle' });
  });

  // Row C: wide habit progress card
  rect(14, 366, 362, 100, P.surf, { rx: 18, stroke: P.border, sw: 1 });
  text(30, 390, 'Today\'s score', 13, P.muted, { fw: 500 });
  text(30, 418, '4 of 6', 28, P.text, { fw: 800, font: 'Georgia' });
  text(30, 436, 'habits complete', 12, P.muted);
  // large progress arc suggestion (bar)
  rect(30, 448, 302, 8, P.card, { rx: 4 });
  rect(30, 448, 201, 8, P.acc, { rx: 4 });
  text(352, 422, '67%', 20, P.acc, { fw: 700, anchor: 'end' });

  // Row D: mini focus + mood
  rect(14, 476, 174, 80, P.acc2, { rx: 16, opacity: 0.12 });
  rect(14, 476, 174, 80, 'none', { stroke: P.acc2, sw: 1.5, rx: 16 });
  text(28, 500, 'Focus', 11, P.muted, { fw: 500 });
  text(28, 522, '2h 14m', 18, P.text, { fw: 700 });
  text(28, 540, 'deep work today', 10, P.muted);

  rect(202, 476, 174, 80, P.card, { rx: 16 });
  text(216, 500, 'Mood', 11, P.muted, { fw: 500 });
  text(216, 518, '😌', 22, P.text);
  text(216, 540, 'Calm', 12, P.text, { fw: 600 });

  // quick add CTA
  rect(14, 566, 362, 50, P.acc, { rx: 14 });
  text(195, 597, '+ Add today\'s entry', 14, P.surf, { anchor: 'middle', fw: 600, ls: '0.2' });

  // habit ring preview strip
  text(20, 636, 'Up next', 13, P.text, { fw: 600 });
  const upNext = ['Evening walk', 'No screens 9pm', 'Vitamins'];
  upNext.forEach((h, i) => {
    rect(14, 650 + i * 46, 362, 38, P.surf, { rx: 10, stroke: P.border, sw: 0.5 });
    circle(32, 669 + i * 46, 10, P.card2, { stroke: P.border, sw: 1 });
    text(52, 673 + i * 46, h, 13, P.text, { fw: 500 });
    text(372, 673 + i * 46, '›', 18, P.muted, { anchor: 'end' });
  });

  bottomNav(760, 'home');
}

// ── SCREEN 2: Habits Library ────────────────────────────────────────────────
function screen2() {
  rect(0, 0, W, H, P.bg);
  statusBar(0);

  text(20, 72, 'My Habits', 26, P.text, { fw: 800, font: 'Georgia', ls: '-0.5' });
  text(W - 20, 72, '+ New', 14, P.acc, { anchor: 'end', fw: 600 });

  // filter chips
  const chips = ['All', 'Morning', 'Evening', 'Health', 'Mind'];
  chips.forEach((c, i) => {
    const cx = 20 + i * 72;
    const active = i === 0;
    rect(cx, 86, c.length * 8.2 + 16, 28, active ? P.acc : P.surf, {
      rx: 14, stroke: active ? P.acc : P.border, sw: 1
    });
    text(cx + (c.length * 8.2 + 16) / 2, 104, c, 12,
      active ? P.surf : P.muted, { anchor: 'middle', fw: active ? 600 : 400 });
  });

  // habit rows
  const habits = [
    { name: 'Morning meditation', cat: 'Mind',   streak: 18, freq: 'Daily',   done: true,  icon: '🧘', color: P.acc3 },
    { name: 'Read 20 pages',      cat: 'Mind',   streak: 7,  freq: 'Daily',   done: true,  icon: '📖', color: P.acc },
    { name: 'Drink 8 glasses',    cat: 'Health', streak: 12, freq: 'Daily',   done: false, icon: '💧', color: '#4AACCC' },
    { name: 'Evening walk',       cat: 'Health', streak: 5,  freq: 'Daily',   done: false, icon: '🚶', color: P.green },
    { name: 'Journal entry',      cat: 'Mind',   streak: 3,  freq: 'Daily',   done: false, icon: '✏️', color: P.acc2 },
    { name: 'Cold shower',        cat: 'Health', streak: 21, freq: 'Daily',   done: true,  icon: '🚿', color: '#3B9ECC' },
    { name: 'Gratitude log',      cat: 'Mind',   streak: 8,  freq: 'Daily',   done: true,  icon: '🌿', color: P.green },
    { name: 'Digital detox',      cat: 'Mind',   streak: 2,  freq: 'Evening', done: false, icon: '📵', color: P.acc2 },
  ];

  habits.forEach((h, i) => {
    const y = 126 + i * 70;
    rect(14, y, 362, 60, P.surf, { rx: 14, stroke: P.border, sw: 0.5 });
    // colored left accent bar
    rect(14, y, 4, 60, h.color, { rx: 2 });
    // icon circle
    circle(44, y + 30, 16, h.color, { opacity: 0.12 });
    text(44, y + 35, h.icon, 14, h.color, { anchor: 'middle' });
    text(68, y + 22, h.name, 13, P.text, { fw: 600 });
    text(68, y + 40, `${h.streak} day streak · ${h.freq}`, 11, P.muted);
    // checkmark / pending
    if (h.done) {
      circle(356, y + 30, 13, h.color, { opacity: 0.15 });
      circle(356, y + 30, 13, 'none', { stroke: h.color, sw: 1.5 });
      text(356, y + 35, '✓', 12, h.color, { anchor: 'middle', fw: 700 });
    } else {
      circle(356, y + 30, 13, 'none', { stroke: P.border, sw: 1.5 });
    }
  });

  bottomNav(760, 'habits');
}

// ── SCREEN 3: Habit Detail / Streak Calendar ───────────────────────────────
function screen3() {
  rect(0, 0, W, H, P.bg);
  statusBar(0);

  // back
  text(20, 70, '‹', 22, P.acc, { fw: 300 });
  text(195, 70, 'Morning meditation', 15, P.text, { anchor: 'middle', fw: 600 });

  // hero streak badge
  rect(20, 86, W - 40, 120, P.acc, { rx: 20 });
  circle(40, 106, 40, P.surf, { opacity: 0.05 });
  circle(W - 30, 196, 80, P.surf, { opacity: 0.04 });
  text(195, 124, '🧘', 32, P.surf, { anchor: 'middle' });
  text(195, 158, '18', 42, P.surf, { anchor: 'middle', fw: 800, font: 'Georgia', ls: '-1' });
  text(195, 177, 'day streak', 13, P.surf, { anchor: 'middle', opacity: 0.8 });
  text(195, 198, 'Personal best: 24 days', 11, P.surf, { anchor: 'middle', opacity: 0.55 });

  // stats row
  const stats = [
    { label: 'This week', val: '7/7' },
    { label: 'This month', val: '27/30' },
    { label: 'All time', val: '156' },
  ];
  stats.forEach((s, i) => {
    const x = 20 + i * 120;
    rect(x, 216, 110, 64, P.surf, { rx: 12, stroke: P.border, sw: 0.5 });
    text(x + 55, 241, s.val, 18, P.acc, { anchor: 'middle', fw: 700 });
    text(x + 55, 258, s.label, 10, P.muted, { anchor: 'middle' });
  });

  // Habit streak calendar (month view)
  text(20, 302, 'April 2026', 14, P.text, { fw: 700 });
  text(370, 302, 'March ›', 11, P.muted, { anchor: 'end' });
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  days.forEach((d, i) => {
    text(30 + i * 48, 322, d, 11, P.muted, { anchor: 'middle' });
  });

  // calendar grid - April 2026 starts Wednesday (offset 2)
  const completedDays = new Set([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]);
  const skippedDays = new Set([7, 14]); // skipped on Sundays
  for (let d = 1; d <= 30; d++) {
    const offset = 2; // April starts Wednesday
    const slot = d + offset - 1;
    const col = slot % 7;
    const row = Math.floor(slot / 7);
    const cx = 30 + col * 48;
    const cy = 342 + row * 44;
    const done = completedDays.has(d);
    const today = d === 9;
    if (today) {
      circle(cx, cy, 15, P.acc, {});
      text(cx, cy + 5, d.toString(), 11, P.surf, { anchor: 'middle', fw: 700 });
    } else if (done) {
      circle(cx, cy, 14, P.acc, { opacity: 0.15 });
      text(cx, cy + 5, d.toString(), 11, P.acc, { anchor: 'middle', fw: 600 });
    } else {
      text(cx, cy + 5, d.toString(), 11, P.muted, { anchor: 'middle', opacity: 0.6 });
    }
  }

  // session log
  text(20, 560, 'Recent sessions', 14, P.text, { fw: 700 });
  const sessions = [
    { day: 'Today', time: '7:03 AM', dur: '10 min', note: 'Body scan' },
    { day: 'Yesterday', time: '6:58 AM', dur: '15 min', note: 'Breathing' },
    { day: 'Apr 7', time: '7:11 AM', dur: '10 min', note: 'Visualization' },
  ];
  sessions.forEach((s, i) => {
    const y = 576 + i * 52;
    rect(14, y, 362, 44, P.surf, { rx: 10, stroke: P.border, sw: 0.5 });
    circle(36, y + 22, 12, P.acc, { opacity: 0.15 });
    text(36, y + 26, '🧘', 10, P.acc, { anchor: 'middle' });
    text(58, y + 18, s.day, 12, P.text, { fw: 600 });
    text(58, y + 32, `${s.time} · ${s.dur}`, 10, P.muted);
    text(370, y + 24, s.note, 11, P.muted, { anchor: 'end' });
  });

  // log today CTA
  rect(14, 724, 362, 48, P.acc, { rx: 14 });
  text(195, 753, 'Log today\'s session', 14, P.surf, { anchor: 'middle', fw: 600 });

  bottomNav(760, 'habits');
}

// ── SCREEN 4: Reflection / Journal ─────────────────────────────────────────
function screen4() {
  rect(0, 0, W, H, P.bg);
  statusBar(0);

  text(20, 72, 'Reflect', 26, P.text, { fw: 800, font: 'Georgia', ls: '-0.5' });
  text(W - 20, 72, 'Apr 9', 13, P.muted, { anchor: 'end' });

  // mood selector
  text(20, 100, 'How are you feeling today?', 13, P.muted);
  const moods = ['😔', '😐', '😊', '😌', '🤩'];
  const moodLabels = ['Low', 'Meh', 'Good', 'Calm', 'Great'];
  moods.forEach((m, i) => {
    const cx = 40 + i * 64;
    const active = i === 3;
    rect(cx - 22, 112, 44, 52, active ? P.acc : P.surf, {
      rx: 12, stroke: active ? P.acc : P.border, sw: active ? 0 : 1
    });
    text(cx, 134, m, 22, active ? P.surf : P.text, { anchor: 'middle' });
    text(cx, 155, moodLabels[i], 9, active ? P.surf : P.muted, { anchor: 'middle', opacity: active ? 0.85 : 0.7 });
  });

  // prompt card
  rect(14, 174, 362, 68, P.acc2, { rx: 16, opacity: 0.1 });
  rect(14, 174, 362, 68, 'none', { stroke: P.acc2, sw: 1.5, rx: 16 });
  text(30, 195, '✦ Today\'s prompt', 11, P.acc2, { fw: 600 });
  text(30, 215, 'What\'s one thing you did today', 13, P.text, { fw: 500 });
  text(30, 232, 'that your future self will thank you for?', 13, P.text);

  // journal entry area
  rect(14, 252, 362, 180, P.surf, { rx: 16, stroke: P.border, sw: 1 });
  text(30, 276, 'I meditated for the 18th day in a row…', 13, P.text, { opacity: 0.9 });
  text(30, 296, 'Even though I almost skipped it, I showed', 13, P.text, { opacity: 0.7 });
  text(30, 316, 'up for 10 minutes. That\'s what matters.', 13, P.text, { opacity: 0.7 });
  text(30, 336, '', 13, P.text);
  text(30, 356, 'Also got a walk in during lunch. The sun', 13, P.text, { opacity: 0.5 });
  text(30, 376, 'helped my mood a lot…', 13, P.text, { opacity: 0.5 });
  // cursor line
  rect(30, 386, 2, 14, P.acc, { opacity: 0.7 });
  // word count
  text(370, 428, '87 words', 11, P.muted, { anchor: 'end', opacity: 0.6 });

  // gratitude section
  text(20, 450, 'Grateful for', 14, P.text, { fw: 700 });
  const grats = ['Sunlight through the window', 'A productive morning', 'Good tea ☕'];
  grats.forEach((g, i) => {
    rect(14, 466 + i * 46, 362, 38, P.surf, { rx: 10, stroke: P.border, sw: 0.5 });
    text(34, 490 + i * 46, '✦', 12, P.acc2, { opacity: 0.7 });
    text(50, 490 + i * 46, g, 13, P.text);
  });

  // tags
  text(20, 612, 'Tag this entry', 13, P.muted, { fw: 500 });
  const tags = ['clarity', 'growth', 'energy', '+ add'];
  tags.forEach((t, i) => {
    const x = 20 + [0, 60, 118, 186][i];
    const active = i < 3;
    rect(x, 626, t.length * 7.5 + 14, 26, active ? P.acc : 'none', {
      rx: 13, opacity: active ? 0.12 : 1, stroke: active ? P.acc : P.border, sw: 1
    });
    text(x + (t.length * 7.5 + 14) / 2, 643, t, 11, active ? P.acc : P.muted, { anchor: 'middle', fw: 500 });
  });

  // save button
  rect(14, 662, 362, 50, P.acc, { rx: 14 });
  text(195, 692, 'Save reflection', 14, P.surf, { anchor: 'middle', fw: 600 });

  bottomNav(760, 'journal');
}

// ── SCREEN 5: Progress Analytics ───────────────────────────────────────────
function screen5() {
  rect(0, 0, W, H, P.bg);
  statusBar(0);

  text(20, 72, 'Progress', 26, P.text, { fw: 800, font: 'Georgia', ls: '-0.5' });

  // period toggle
  const periods = ['Week', 'Month', 'Year'];
  rect(14, 82, 220, 30, P.card, { rx: 8 });
  periods.forEach((p, i) => {
    const active = i === 1;
    if (active) rect(14 + i * 73, 82, 73, 30, P.surf, { rx: 8, stroke: P.border, sw: 0.5 });
    text(50 + i * 73, 101, p, 12, active ? P.acc : P.muted, { anchor: 'middle', fw: active ? 600 : 400 });
  });

  // overall score card
  rect(14, 122, 362, 104, P.acc, { rx: 18 });
  circle(320, 140, 60, P.surf, { opacity: 0.05 });
  text(30, 150, 'Monthly score', 12, P.surf, { opacity: 0.8 });
  text(30, 186, '81%', 46, P.surf, { fw: 800, font: 'Georgia', ls: '-1' });
  text(30, 208, '↑ 12% from last month', 12, P.surf, { opacity: 0.7 });
  // ring visual on right
  circle(310, 174, 38, 'none', { stroke: P.surf, sw: 1, opacity: 0.2 });
  circle(310, 174, 38, 'none', { stroke: P.surf, sw: 5, opacity: 0.9 });
  text(310, 179, '81%', 12, P.surf, { anchor: 'middle', fw: 700 });

  // habit completion bars
  text(20, 242, 'Habit completion', 14, P.text, { fw: 700 });
  const habits = [
    { name: 'Meditate',   pct: 93, col: P.acc3 },
    { name: 'Read',       pct: 79, col: P.acc },
    { name: 'Water',      pct: 87, col: '#4AACCC' },
    { name: 'Walk',       pct: 71, col: P.green },
    { name: 'Journal',    pct: 60, col: P.acc2 },
    { name: 'Cold shower',pct: 97, col: '#3B9ECC' },
  ];
  habits.forEach((h, i) => {
    const y = 260 + i * 46;
    text(20, y, h.name, 12, P.text, { fw: 500 });
    text(370, y, `${h.pct}%`, 12, h.col, { anchor: 'end', fw: 600 });
    rect(20, y + 8, 350, 6, P.card, { rx: 3 });
    rect(20, y + 8, 350 * h.pct / 100, 6, h.col, { rx: 3, opacity: 0.85 });
  });

  // week heatmap strip
  text(20, 546, 'This week', 14, P.text, { fw: 700 });
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weekScores = [100, 83, 67, 100, 83, 50, 0];
  weekDays.forEach((d, i) => {
    const cx = 36 + i * 46;
    const pct = weekScores[i];
    const opacity = pct === 0 ? 0.12 : pct / 100;
    rect(cx - 18, 560, 36, 48, P.acc, { rx: 8, opacity });
    text(cx, 580, d, 10, pct > 50 ? P.surf : P.muted, { anchor: 'middle', fw: 600, opacity: pct > 50 ? 1 : 0.8 });
    text(cx, 598, pct > 0 ? `${pct}%` : '—', 9, pct > 50 ? P.surf : P.muted, { anchor: 'middle', opacity: 0.8 });
  });

  // best habit + needs work
  rect(14, 620, 173, 72, P.surf, { rx: 14, stroke: P.border, sw: 0.5 });
  rect(14, 620, 4, 72, P.green, { rx: 2 });
  text(28, 640, '🏆 Best habit', 11, P.muted);
  text(28, 660, 'Cold shower', 14, P.text, { fw: 700 });
  text(28, 678, '97% · 21 day streak', 10, P.muted);

  rect(203, 620, 173, 72, P.surf, { rx: 14, stroke: P.border, sw: 0.5 });
  rect(203, 620, 4, 72, P.acc2, { rx: 2 });
  text(217, 640, '📈 Needs work', 11, P.muted);
  text(217, 660, 'Journal', 14, P.text, { fw: 700 });
  text(217, 678, '60% · 3 day streak', 10, P.muted);

  bottomNav(760, 'stats');
}

// ── SCREEN 6: Profile / Settings ───────────────────────────────────────────
function screen6() {
  rect(0, 0, W, H, P.bg);
  statusBar(0);

  // avatar + name
  circle(195, 108, 50, P.acc, { opacity: 0.12 });
  circle(195, 108, 50, 'none', { stroke: P.acc, sw: 2 });
  text(195, 114, '🌿', 34, P.text, { anchor: 'middle' });
  text(195, 172, 'Alex Chen', 20, P.text, { anchor: 'middle', fw: 700, font: 'Georgia' });
  text(195, 190, 'Growing steadily since Jan 2026', 12, P.muted, { anchor: 'middle' });

  // streak badge row
  const badges = [
    { icon: '🔥', label: '18 days',  sub: 'current' },
    { icon: '🏆', label: '24 days',  sub: 'best streak' },
    { icon: '⭐', label: '156',      sub: 'habits done' },
  ];
  badges.forEach((b, i) => {
    const x = 20 + i * 120;
    rect(x, 200, 110, 72, P.surf, { rx: 14, stroke: P.border, sw: 0.5 });
    text(x + 55, 224, b.icon, 20, P.text, { anchor: 'middle' });
    text(x + 55, 244, b.label, 13, P.text, { anchor: 'middle', fw: 700 });
    text(x + 55, 258, b.sub, 10, P.muted, { anchor: 'middle' });
  });

  // settings sections
  const sections = [
    { title: 'Account', items: ['Edit profile', 'Notifications', 'Reminders'] },
    { title: 'App', items: ['Theme', 'Widget settings', 'Export data'] },
    { title: 'Community', items: ['Friend challenges', 'Share progress'] },
  ];
  let y = 288;
  sections.forEach(sec => {
    text(20, y, sec.title, 12, P.muted, { fw: 600, ls: '0.5' });
    y += 18;
    sec.items.forEach(item => {
      rect(14, y, 362, 46, P.surf, { rx: 12, stroke: P.border, sw: 0.5 });
      text(30, y + 27, item, 13, P.text, { fw: 500 });
      text(370, y + 27, '›', 18, P.muted, { anchor: 'end', opacity: 0.6 });
      y += 54;
    });
    y += 10;
  });

  // theme toggle
  rect(14, 524, 362, 54, P.surf, { rx: 12, stroke: P.border, sw: 0.5 });
  text(30, 555, 'Theme', 13, P.text, { fw: 500 });
  // pill toggle
  rect(280, 536, 78, 28, P.card, { rx: 14 });
  rect(280, 536, 42, 28, P.acc, { rx: 14 });
  text(300, 554, '☀', 13, P.surf, { anchor: 'middle' });
  text(340, 554, '◑', 13, P.muted, { anchor: 'middle' });

  // sign out
  rect(14, 720, 362, 48, 'none', { stroke: P.border, sw: 1, rx: 14 });
  text(195, 749, 'Sign out', 14, P.red, { anchor: 'middle', fw: 500 });

  bottomNav(760, 'profile');
}

// ── Build all screens ──────────────────────────────────────────────────────
const screens = [];

function buildScreen(name, fn) {
  els.length = 0;
  fn();
  screens.push({ name, elements: JSON.parse(JSON.stringify(els)) });
}

buildScreen('Today',    screen1);
buildScreen('Habits',   screen2);
buildScreen('Streak',   screen3);
buildScreen('Reflect',  screen4);
buildScreen('Progress', screen5);
buildScreen('Profile',  screen6);

const totalEls = screens.reduce((s, sc) => s + sc.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name:      NAME,
    tagline:   TAGLINE,
    author:    'RAM',
    date:      DATE,
    theme:     'light',
    heartbeat: HEARTBEAT,
    elements:  totalEls,
    palette:   P,
    inspiration: 'Bento grid layout trend (land-book.com) + Earth-tone restraint (minimal.gallery)',
  },
  screens,
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalEls} elements`);
console.log(`Written: ${SLUG}.pen`);
