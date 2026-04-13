'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG  = 'dawn';
const NAME  = 'Dawn';
const DATE  = new Date().toISOString().slice(0, 10);
const W = 390, H = 844;

// ─── Palette (Light — warm cream / sage / dusty rose) ───────────────────────
const P = {
  bg:      '#F9F4EC',   // warm parchment
  bg2:     '#F2EBE0',   // slightly deeper cream
  surf:    '#FFFFFF',
  card:    '#FDFAF5',
  cardB:   '#EDE5D8',   // card border — warm tan
  ink:     '#2A2118',   // deep warm brown (text)
  ink2:    '#6B5A48',   // muted warm brown (secondary text)
  sage:    '#6E9B72',   // sage green (primary accent)
  sage2:   '#A8C7AA',   // sage light
  rose:    '#C17B72',   // dusty rose (secondary accent)
  gold:    '#B08A4A',   // brass / gold
  goldL:   '#D4B07A',   // light gold
  divider: 'rgba(42,33,24,0.12)',
};

// ─── Helpers ────────────────────────────────────────────────────────────────
let eid = 1;
function id() { return `e${eid++}`; }

function rect(x, y, w, h, fill, opts = {}) {
  return {
    id: id(), type: 'rect',
    x, y, width: w, height: h, fill,
    rx: opts.rx ?? 0,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none',
    strokeWidth: opts.sw ?? 0,
  };
}

function text(x, y, content, size, fill, opts = {}) {
  return {
    id: id(), type: 'text',
    x, y, content, fontSize: size, fill,
    fontWeight: opts.fw ?? 400,
    fontFamily: opts.font ?? 'Georgia, serif',
    textAnchor: opts.anchor ?? 'start',
    letterSpacing: opts.ls ?? 0,
    opacity: opts.opacity ?? 1,
  };
}

function circle(cx, cy, r, fill, opts = {}) {
  return {
    id: id(), type: 'circle',
    cx, cy, r, fill,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none',
    strokeWidth: opts.sw ?? 0,
  };
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  return {
    id: id(), type: 'line',
    x1, y1, x2, y2, stroke,
    strokeWidth: opts.sw ?? 1,
    opacity: opts.opacity ?? 1,
  };
}

// ─── Composite Components ───────────────────────────────────────────────────
function statusBar(els) {
  els.push(rect(0, 0, W, 44, P.bg));
  els.push(text(20, 28, '9:41', 14, P.ink, { fw: 600, font: 'system-ui, sans-serif' }));
  // Battery + signal dots
  els.push(rect(330, 16, 36, 14, 'none', { rx: 3, stroke: P.ink2, sw: 1.5 }));
  els.push(rect(366, 20, 3, 6, P.ink2, { rx: 1 }));
  els.push(rect(332, 18, 28, 10, P.ink, { rx: 2 }));
  for (let i = 0; i < 3; i++) {
    els.push(circle(302 + i * 8, 23, 2.5, P.ink2));
  }
}

function navBar(els, activeIdx) {
  const items = ['Home', 'Journal', 'Energy', 'Rituals', 'You'];
  const icons = ['○', '✦', '◈', '◇', '◉'];
  els.push(rect(0, H - 80, W, 80, P.surf));
  els.push(line(0, H - 80, W, H - 80, P.divider));
  items.forEach((label, i) => {
    const x = 195 / 5 + i * (W / 5);
    const isActive = i === activeIdx;
    els.push(text(x, H - 46, icons[i], 18, isActive ? P.sage : P.ink2,
      { anchor: 'middle', font: 'system-ui' }));
    els.push(text(x, H - 26, label, 10, isActive ? P.sage : P.ink2,
      { anchor: 'middle', fw: isActive ? 600 : 400, font: 'system-ui, sans-serif' }));
    if (isActive) els.push(circle(x, H - 66, 3, P.sage));
  });
}

function screenBg(els) {
  els.push(rect(0, 0, W, H, P.bg));
  // Subtle grain texture overlay via repeated tiny rects
  for (let gx = 0; gx < W; gx += 40) {
    for (let gy = 0; gy < H; gy += 40) {
      els.push(rect(gx, gy, 40, 40, P.bg2, { opacity: 0.25 }));
    }
  }
}

// ─── Screen 1: Morning Dashboard ────────────────────────────────────────────
function screen1() {
  const els = [];
  screenBg(els);
  statusBar(els);

  // Header area
  els.push(text(20, 80, 'Good Morning,', 14, P.ink2,
    { font: 'system-ui, sans-serif', ls: 0.5 }));
  els.push(text(20, 112, 'Maya.', 34, P.ink,
    { fw: 700, font: 'Georgia, serif' }));

  // Date badge
  els.push(rect(20, 126, 130, 26, P.cardB, { rx: 13 }));
  els.push(text(85, 143, 'Sunday, Apr 13', 11, P.ink2,
    { anchor: 'middle', font: 'system-ui, sans-serif', fw: 500 }));

  // ── Bento Row 1: Energy ring + Mood ─────────────────────────────────────
  // Energy card (large, left)
  els.push(rect(20, 164, 170, 170, P.surf, { rx: 20, stroke: P.cardB, sw: 1 }));
  els.push(text(35, 188, 'Energy', 11, P.ink2,
    { font: 'system-ui, sans-serif', fw: 500, ls: 0.8 }));
  // Ring
  const rx = 105, ry = 268, rOuter = 52, rInner = 38;
  els.push(circle(rx, ry, rOuter, 'none', { stroke: P.cardB, sw: 10 }));
  els.push(circle(rx, ry, rOuter, 'none', { stroke: P.sage, sw: 10, opacity: 0.9 }));
  // Inner
  els.push(circle(rx, ry, rInner, P.bg));
  els.push(text(rx, ry - 8, '78', 24, P.ink, { anchor: 'middle', fw: 700, font: 'Georgia, serif' }));
  els.push(text(rx, ry + 10, '/ 100', 11, P.ink2, { anchor: 'middle', font: 'system-ui, sans-serif' }));
  // Trend arrows
  els.push(text(35, 322, '↑ +6 vs yesterday', 10, P.sage,
    { font: 'system-ui, sans-serif', fw: 500 }));

  // Mood card (right column, top)
  els.push(rect(200, 164, 170, 80, P.surf, { rx: 20, stroke: P.cardB, sw: 1 }));
  els.push(text(215, 188, 'Mood', 11, P.ink2,
    { font: 'system-ui, sans-serif', fw: 500, ls: 0.8 }));
  const moods = ['😴','😐','🙂','😄','🔥'];
  moods.forEach((m, i) => {
    const mx = 218 + i * 30;
    const active = i === 3;
    if (active) els.push(circle(mx + 7, 225, 12, P.sage2));
    els.push(text(mx, 232, m, 14, P.ink, { anchor: 'middle', font: 'system-ui' }));
  });

  // Sleep card (right column, bottom)
  els.push(rect(200, 254, 170, 80, P.surf, { rx: 20, stroke: P.cardB, sw: 1 }));
  els.push(text(215, 278, 'Sleep', 11, P.ink2,
    { font: 'system-ui, sans-serif', fw: 500, ls: 0.8 }));
  els.push(text(215, 308, '7h 24m', 22, P.ink, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(290, 308, 'Deep 32%', 10, P.sage,
    { font: 'system-ui, sans-serif', fw: 500 }));

  // ── Bento Row 2: Today's Rituals ────────────────────────────────────────
  els.push(rect(20, 346, 350, 34, 'transparent'));
  els.push(text(20, 368, "Today's Rituals", 16, P.ink,
    { fw: 700, font: 'Georgia, serif' }));
  els.push(text(330, 368, '3 of 5', 11, P.sage,
    { anchor: 'end', font: 'system-ui, sans-serif', fw: 600 }));

  const rituals = [
    { name: 'Morning Pages', time: '7:00 AM', done: true,  icon: '✦' },
    { name: 'Cold Shower',   time: '7:30 AM', done: true,  icon: '◈' },
    { name: 'Walk 20 min',   time: '8:00 AM', done: true,  icon: '○' },
    { name: 'Meditate',      time: '8:30 AM', done: false, icon: '◇' },
    { name: 'Read 30 min',   time: '9:00 AM', done: false, icon: '◉' },
  ];

  rituals.forEach((r, i) => {
    const ry2 = 386 + i * 50;
    els.push(rect(20, ry2, 350, 44, r.done ? P.bg2 : P.surf,
      { rx: 14, stroke: P.cardB, sw: 1 }));
    // Checkmark or circle
    els.push(circle(44, ry2 + 22, 11, r.done ? P.sage : 'none',
      { stroke: r.done ? P.sage : P.cardB, sw: 2 }));
    if (r.done) els.push(text(44, ry2 + 27, '✓', 12, P.surf,
      { anchor: 'middle', font: 'system-ui', fw: 700 }));
    els.push(text(64, ry2 + 20, r.name, 13, r.done ? P.ink2 : P.ink,
      { font: 'system-ui, sans-serif', fw: r.done ? 400 : 500 }));
    els.push(text(64, ry2 + 34, r.time, 10, P.ink2,
      { font: 'system-ui, sans-serif' }));
    els.push(text(357, ry2 + 25, r.icon, 14, r.done ? P.sage2 : P.gold,
      { anchor: 'end', font: 'system-ui' }));
  });

  navBar(els, 0);

  return { name: 'Morning Dashboard', elements: els };
}

// ─── Screen 2: Morning Journal ───────────────────────────────────────────────
function screen2() {
  const els = [];
  screenBg(els);
  statusBar(els);

  els.push(text(20, 80, '← Back', 13, P.sage, { font: 'system-ui, sans-serif', fw: 500 }));
  els.push(text(195, 80, 'Journal', 16, P.ink,
    { anchor: 'middle', fw: 700, font: 'Georgia, serif' }));

  // Date selector
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const dates = ['7', '8', '9', '10', '11', '12', '13'];
  days.forEach((d, i) => {
    const dx = 24 + i * 50;
    const active = i === 6;
    if (active) els.push(rect(dx - 4, 98, 34, 48, P.sage, { rx: 16 }));
    else els.push(rect(dx - 4, 98, 34, 48, P.surf, { rx: 16, stroke: P.cardB, sw: 1 }));
    els.push(text(dx + 13, 119, d, 10, active ? P.surf : P.ink2,
      { anchor: 'middle', font: 'system-ui, sans-serif', fw: 500 }));
    els.push(text(dx + 13, 136, dates[i], 13, active ? P.surf : P.ink,
      { anchor: 'middle', font: 'system-ui, sans-serif', fw: active ? 700 : 400 }));
  });

  // Prompt card
  els.push(rect(20, 158, 350, 90, P.card, { rx: 20, stroke: P.cardB, sw: 1 }));
  els.push(text(40, 180, "Today's Prompt", 10, P.gold,
    { font: 'system-ui, sans-serif', fw: 600, ls: 1.2 }));
  els.push(text(40, 202, '"What would make today', 15, P.ink,
    { fw: 600, font: 'Georgia, serif' }));
  els.push(text(40, 222, 'feel truly complete?"', 15, P.ink,
    { fw: 600, font: 'Georgia, serif' }));
  els.push(text(314, 238, '✦', 11, P.gold, { anchor: 'end', font: 'system-ui' }));

  // Journal entry area
  els.push(rect(20, 260, 350, 250, P.surf, { rx: 20, stroke: P.cardB, sw: 1 }));
  const lines2 = [
    'Today I want to finish the proposal',
    'draft and finally get that 30-min',
    'walk in before noon. Feeling restless',
    'but the morning pages helped clear',
    'my head. Grateful for quiet mornings',
    'and the coffee ritual...',
  ];
  lines2.forEach((l, i) => {
    els.push(text(38, 290 + i * 26, l, 14, i < 3 ? P.ink : P.ink2,
      { font: 'Georgia, serif' }));
  });
  // Writing cursor
  els.push(rect(38, 454, 2, 18, P.sage));

  // Horizontal dividers (lined paper feel)
  for (let li = 0; li < 6; li++) {
    els.push(line(36, 302 + li * 26, 354, 302 + li * 26, P.divider, { sw: 0.5 }));
  }

  // Tags row
  els.push(text(20, 526, 'Themes:', 11, P.ink2,
    { font: 'system-ui, sans-serif', fw: 500 }));
  const tags = ['Clarity', 'Productivity', 'Gratitude'];
  let tx = 74;
  tags.forEach(tag => {
    const tw = tag.length * 7 + 20;
    els.push(rect(tx, 514, tw, 24, P.bg2, { rx: 12, stroke: P.cardB, sw: 1 }));
    els.push(text(tx + tw / 2, 530, tag, 10, P.ink2,
      { anchor: 'middle', font: 'system-ui, sans-serif', fw: 500 }));
    tx += tw + 8;
  });

  // Insight strip
  els.push(rect(20, 550, 350, 60, P.bg2, { rx: 16, stroke: P.cardB, sw: 1 }));
  els.push(text(38, 572, '◈  Pattern detected', 11, P.gold,
    { font: 'system-ui, sans-serif', fw: 600 }));
  els.push(text(38, 592, 'You write most productively on Sundays.', 12, P.ink2,
    { font: 'system-ui, sans-serif' }));

  // Word count
  els.push(text(195, 632, '142 words · 3 min read', 11, P.ink2,
    { anchor: 'middle', font: 'system-ui, sans-serif' }));

  navBar(els, 1);

  return { name: 'Morning Journal', elements: els };
}

// ─── Screen 3: Energy Tracker ────────────────────────────────────────────────
function screen3() {
  const els = [];
  screenBg(els);
  statusBar(els);

  els.push(text(20, 80, 'Energy', 28, P.ink, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(330, 76, 'Weekly ↓', 12, P.sage,
    { anchor: 'end', font: 'system-ui, sans-serif', fw: 500 }));

  // Weekly bar chart
  els.push(rect(20, 100, 350, 180, P.surf, { rx: 20, stroke: P.cardB, sw: 1 }));
  els.push(text(36, 124, 'Energy Levels — This Week', 11, P.ink2,
    { font: 'system-ui, sans-serif', fw: 500, ls: 0.5 }));

  const days3 = ['M', 'T', 'W', 'T', 'F', 'Sa', 'Su'];
  const vals = [65, 72, 58, 80, 74, 68, 78];
  const maxH = 90, barW = 28;
  days3.forEach((d, i) => {
    const bx = 42 + i * 46;
    const bh = (vals[i] / 100) * maxH;
    const by = 245 - bh;
    const active = i === 6;
    // Bar background
    els.push(rect(bx, 155, barW, maxH, P.bg2, { rx: 8 }));
    // Bar fill
    els.push(rect(bx, by, barW, bh,
      active ? P.sage : P.sage2, { rx: 8 }));
    // Value label
    els.push(text(bx + barW / 2, by - 6, `${vals[i]}`,
      active ? 11 : 10, active ? P.ink : P.ink2,
      { anchor: 'middle', font: 'system-ui, sans-serif', fw: active ? 600 : 400 }));
    // Day label
    els.push(text(bx + barW / 2, 264, d, 10, active ? P.sage : P.ink2,
      { anchor: 'middle', font: 'system-ui, sans-serif', fw: active ? 600 : 400 }));
  });

  // Today breakdown cards
  els.push(text(20, 300, "Today's Breakdown", 16, P.ink,
    { fw: 700, font: 'Georgia, serif' }));

  const factors = [
    { label: 'Sleep Quality', val: 82, icon: '◉', color: P.sage },
    { label: 'Nutrition',     val: 74, icon: '○', color: P.gold },
    { label: 'Movement',      val: 91, icon: '◈', color: P.rose },
    { label: 'Mindset',       val: 65, icon: '◇', color: P.goldL },
  ];

  factors.forEach((f, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const fx = 20 + col * 182, fy = 316 + row * 110;
    els.push(rect(fx, fy, 168, 98, P.surf, { rx: 18, stroke: P.cardB, sw: 1 }));
    els.push(text(fx + 16, fy + 26, f.icon, 16, f.color, { font: 'system-ui' }));
    els.push(text(fx + 16, fy + 46, f.label, 11, P.ink2,
      { font: 'system-ui, sans-serif', fw: 500 }));
    els.push(text(fx + 16, fy + 74, `${f.val}`, 28, P.ink,
      { fw: 700, font: 'Georgia, serif' }));
    // Mini progress bar
    els.push(rect(fx + 16, fy + 82, 136, 5, P.cardB, { rx: 3 }));
    els.push(rect(fx + 16, fy + 82, Math.round(136 * f.val / 100), 5, f.color, { rx: 3 }));
  });

  // Insight
  els.push(rect(20, 540, 350, 60, P.bg2, { rx: 16, stroke: P.cardB, sw: 1 }));
  els.push(text(38, 562, '✦  Best energy window:', 11, P.ink2,
    { font: 'system-ui, sans-serif', fw: 500 }));
  els.push(text(38, 582, '9–11 AM on movement days (+18 avg)', 13, P.ink,
    { fw: 600, font: 'Georgia, serif' }));

  // Log button
  els.push(rect(60, 614, 270, 48, P.sage, { rx: 24 }));
  els.push(text(195, 643, "Log Today's Energy", 15, P.surf,
    { anchor: 'middle', fw: 600, font: 'system-ui, sans-serif' }));

  navBar(els, 2);

  return { name: 'Energy Tracker', elements: els };
}

// ─── Screen 4: Ritual Builder ─────────────────────────────────────────────────
function screen4() {
  const els = [];
  screenBg(els);
  statusBar(els);

  els.push(text(20, 80, 'Rituals', 28, P.ink, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(330, 76, '+ Add', 13, P.sage,
    { anchor: 'end', font: 'system-ui, sans-serif', fw: 600 }));

  // Active streak
  els.push(rect(20, 100, 350, 76, P.sage, { rx: 20 }));
  els.push(text(40, 130, '◉  Streak Active', 11, P.surf,
    { font: 'system-ui, sans-serif', fw: 500, opacity: 0.85 }));
  els.push(text(40, 158, '22 days', 28, P.surf, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(330, 158, 'Best: 34', 12, P.surf,
    { anchor: 'end', font: 'system-ui, sans-serif', opacity: 0.85 }));

  // Ritual stack
  els.push(text(20, 196, 'Morning Stack', 16, P.ink,
    { fw: 700, font: 'Georgia, serif' }));

  const stack = [
    { name: 'Morning Pages',  dur: '20 min', streak: 22, pct: 94 },
    { name: 'Cold Shower',    dur: '5 min',  streak: 18, pct: 82 },
    { name: 'Walk 20 min',    dur: '20 min', streak: 22, pct: 94 },
    { name: 'Meditate',       dur: '10 min', streak: 12, pct: 68 },
    { name: 'Read 30 min',    dur: '30 min', streak: 8,  pct: 52 },
  ];

  stack.forEach((s, i) => {
    const ry = 214 + i * 70;
    els.push(rect(20, ry, 350, 62, P.surf, { rx: 16, stroke: P.cardB, sw: 1 }));
    // Color left strip
    els.push(rect(20, ry, 5, 62, P.sage, { rx: 3 }));
    els.push(text(40, ry + 22, s.name, 14, P.ink,
      { fw: 600, font: 'system-ui, sans-serif' }));
    els.push(text(40, ry + 40, `${s.dur}  ·  ${s.streak} day streak`, 11, P.ink2,
      { font: 'system-ui, sans-serif' }));
    // Completion pct
    els.push(text(360, ry + 22, `${s.pct}%`, 13, s.pct >= 80 ? P.sage : P.gold,
      { anchor: 'end', font: 'system-ui, sans-serif', fw: 600 }));
    // Mini bar
    els.push(rect(200, ry + 38, 148, 5, P.cardB, { rx: 3 }));
    els.push(rect(200, ry + 38, Math.round(148 * s.pct / 100), 5,
      s.pct >= 80 ? P.sage : P.gold, { rx: 3 }));
  });

  // Evening section label
  els.push(text(20, 572, 'Evening Stack', 16, P.ink,
    { fw: 700, font: 'Georgia, serif' }));

  const evening = [
    { name: 'Wind-down Read', dur: '20 min', pct: 76 },
    { name: 'No-screen 9 PM', dur: 'from 9', pct: 60 },
  ];

  evening.forEach((s, i) => {
    const ry = 590 + i * 66;
    els.push(rect(20, ry, 350, 56, P.surf, { rx: 16, stroke: P.cardB, sw: 1 }));
    els.push(rect(20, ry, 5, 56, P.gold, { rx: 3 }));
    els.push(text(40, ry + 20, s.name, 14, P.ink,
      { fw: 600, font: 'system-ui, sans-serif' }));
    els.push(text(40, ry + 38, s.dur, 11, P.ink2, { font: 'system-ui, sans-serif' }));
    els.push(text(360, ry + 20, `${s.pct}%`, 13, P.gold,
      { anchor: 'end', font: 'system-ui, sans-serif', fw: 600 }));
  });

  navBar(els, 3);

  return { name: 'Ritual Builder', elements: els };
}

// ─── Screen 5: Reflection / Weekly Review ────────────────────────────────────
function screen5() {
  const els = [];
  screenBg(els);
  statusBar(els);

  els.push(text(20, 80, 'Weekly', 28, P.ink, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(20, 110, 'Review', 28, P.ink, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(20, 134, 'Apr 7 – 13', 13, P.ink2,
    { font: 'system-ui, sans-serif', fw: 500 }));

  // Score card row
  const scores = [
    { label: 'Energy',    val: '74', delta: '+8', color: P.sage },
    { label: 'Rituals',   val: '86%', delta: '+12%', color: P.gold },
    { label: 'Focus',     val: '68', delta: '-3', color: P.rose },
  ];
  scores.forEach((s, i) => {
    const sx = 20 + i * 120;
    els.push(rect(sx, 150, 112, 90, P.surf, { rx: 18, stroke: P.cardB, sw: 1 }));
    els.push(text(sx + 56, 178, s.label, 10, P.ink2,
      { anchor: 'middle', font: 'system-ui, sans-serif', fw: 500, ls: 0.8 }));
    els.push(text(sx + 56, 212, s.val, 26, P.ink,
      { anchor: 'middle', fw: 700, font: 'Georgia, serif' }));
    const dPos = s.delta.startsWith('+');
    els.push(text(sx + 56, 230, s.delta, 10, dPos ? P.sage : P.rose,
      { anchor: 'middle', font: 'system-ui, sans-serif', fw: 600 }));
  });

  // Wins & challenges
  els.push(text(20, 260, 'Wins this week', 15, P.ink,
    { fw: 700, font: 'Georgia, serif' }));
  const wins = [
    'Completed morning rituals 6/7 days',
    'Best energy score in 3 weeks (78)',
    'Wrote 1,200 words in journals',
  ];
  wins.forEach((w, i) => {
    const wy = 278 + i * 42;
    els.push(rect(20, wy, 350, 36, P.surf, { rx: 12, stroke: P.cardB, sw: 1 }));
    els.push(circle(38, wy + 18, 8, P.sage2));
    els.push(text(44, wy + 14, '✓', 9, P.sage, { font: 'system-ui', fw: 700 }));
    els.push(text(54, wy + 22, w, 12, P.ink, { font: 'system-ui, sans-serif', fw: 500 }));
  });

  els.push(text(20, 410, 'Focus areas', 15, P.ink,
    { fw: 700, font: 'Georgia, serif' }));
  const focus = [
    'Evening screen cutoff slipping',
    'Meditation consistency needs work',
  ];
  focus.forEach((f, i) => {
    const fy = 428 + i * 42;
    els.push(rect(20, fy, 350, 36, P.surf, { rx: 12, stroke: P.cardB, sw: 1 }));
    els.push(circle(38, fy + 18, 8, '#F0D5C8'));
    els.push(text(44, fy + 14, '→', 10, P.rose, { font: 'system-ui', fw: 700 }));
    els.push(text(54, fy + 22, f, 12, P.ink, { font: 'system-ui, sans-serif', fw: 500 }));
  });

  // Intention setter
  els.push(rect(20, 522, 350, 90, P.card, { rx: 20, stroke: P.cardB, sw: 1 }));
  els.push(text(40, 546, 'Intention for next week', 11, P.gold,
    { font: 'system-ui, sans-serif', fw: 600, ls: 0.8 }));
  els.push(text(40, 568, '"Prioritise deep focus in', 14, P.ink,
    { fw: 600, font: 'Georgia, serif' }));
  els.push(text(40, 588, 'the first two hours."', 14, P.ink,
    { fw: 600, font: 'Georgia, serif' }));
  els.push(text(340, 600, 'Edit →', 11, P.sage,
    { anchor: 'end', font: 'system-ui, sans-serif', fw: 500 }));

  // Next week CTA
  els.push(rect(60, 628, 270, 48, P.sage, { rx: 24 }));
  els.push(text(195, 657, "Set Next Week's Focus", 15, P.surf,
    { anchor: 'middle', fw: 600, font: 'system-ui, sans-serif' }));

  navBar(els, 4);

  return { name: 'Weekly Review', elements: els };
}

// ─── Screen 6: Profile / Settings ────────────────────────────────────────────
function screen6() {
  const els = [];
  screenBg(els);
  statusBar(els);

  // Avatar area
  els.push(circle(195, 116, 52, P.sage2));
  els.push(circle(195, 104, 20, P.surf));
  els.push(rect(171, 118, 48, 34, P.surf, { rx: 24 }));
  els.push(text(195, 110, 'M', 22, P.sage, { anchor: 'middle', fw: 700, font: 'Georgia, serif' }));
  els.push(text(195, 184, 'Maya Chen', 20, P.ink,
    { anchor: 'middle', fw: 700, font: 'Georgia, serif' }));
  els.push(text(195, 204, 'Member since March 2024', 12, P.ink2,
    { anchor: 'middle', font: 'system-ui, sans-serif' }));

  // Stats row
  const stats = [{ v: '22', l: 'Day Streak' }, { v: '247', l: 'Journal\nEntries' }, { v: '94%', l: 'Best Week' }];
  stats.forEach((s, i) => {
    const sx = 40 + i * 110;
    els.push(rect(sx, 220, 100, 68, P.surf, { rx: 16, stroke: P.cardB, sw: 1 }));
    els.push(text(sx + 50, 252, s.v, 22, P.ink,
      { anchor: 'middle', fw: 700, font: 'Georgia, serif' }));
    els.push(text(sx + 50, 270, s.l.replace('\n', ' '), 9, P.ink2,
      { anchor: 'middle', font: 'system-ui, sans-serif' }));
  });

  // Section header
  els.push(text(20, 312, 'Preferences', 14, P.ink2,
    { font: 'system-ui, sans-serif', fw: 600, ls: 1 }));

  const prefs = [
    { label: 'Wake-up time',     value: '6:45 AM', icon: '○' },
    { label: 'Reminder style',   value: 'Gentle', icon: '◇' },
    { label: 'Theme',            value: 'Warm Cream', icon: '◈' },
    { label: 'Weekly review day', value: 'Sunday', icon: '✦' },
  ];

  prefs.forEach((p, i) => {
    const py = 328 + i * 60;
    els.push(rect(20, py, 350, 52, P.surf, { rx: 14, stroke: P.cardB, sw: 1 }));
    els.push(text(42, py + 20, p.icon, 14, P.sage, { font: 'system-ui' }));
    els.push(text(64, py + 22, p.label, 13, P.ink,
      { fw: 500, font: 'system-ui, sans-serif' }));
    els.push(text(356, py + 22, p.value + '  ›', 12, P.ink2,
      { anchor: 'end', font: 'system-ui, sans-serif' }));
    if (i < prefs.length - 1) {
      els.push(line(64, py + 52, 356, py + 52, P.divider, { sw: 0.5 }));
    }
  });

  // Export section
  els.push(text(20, 576, 'Data', 14, P.ink2,
    { font: 'system-ui, sans-serif', fw: 600, ls: 1 }));
  els.push(rect(20, 592, 350, 52, P.surf, { rx: 14, stroke: P.cardB, sw: 1 }));
  els.push(text(42, 618, '↑', 16, P.gold, { font: 'system-ui', fw: 600 }));
  els.push(text(64, 622, 'Export my data', 13, P.ink,
    { fw: 500, font: 'system-ui, sans-serif' }));
  els.push(text(356, 622, 'PDF / CSV  ›', 12, P.ink2,
    { anchor: 'end', font: 'system-ui, sans-serif' }));

  // Logout
  els.push(rect(20, 656, 350, 48, P.bg2, { rx: 24, stroke: P.cardB, sw: 1 }));
  els.push(text(195, 685, 'Sign out', 14, P.rose,
    { anchor: 'middle', fw: 600, font: 'system-ui, sans-serif' }));

  navBar(els, 4);

  return { name: 'Profile & Settings', elements: els };
}

// ─── Assemble & Write ────────────────────────────────────────────────────────
const screens = [screen1(), screen2(), screen3(), screen4(), screen5(), screen6()];
const totalEls = screens.reduce((a, s) => a + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name:       NAME,
    slug:       SLUG,
    author:     'RAM',
    date:       DATE,
    theme:      'light',
    heartbeat:  'dawn',
    elements:   totalEls,
    palette: {
      bg:      P.bg,
      surface: P.surf,
      text:    P.ink,
      accent:  P.sage,
      accent2: P.rose,
      muted:   P.ink2,
      gold:    P.gold,
    },
    description: 'Morning ritual & energy tracking app. Warm cream + sage + editorial serif aesthetic inspired by Land-book pastel/earthy-tech trend.',
    tags: ['light', 'wellness', 'daily', 'bento', 'serif', 'earthy', 'ritual'],
  },
  screens: screens.map(s => ({
    name:     s.name,
    width:    W,
    height:   H,
    svg:      `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"></svg>`,
    elements: s.elements,
  })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalEls} elements`);
console.log(`Written: ${SLUG}.pen`);
