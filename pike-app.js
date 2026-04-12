'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'pike';
const NAME = 'PIKE';
const TAGLINE = 'Know your body daily';
const HEARTBEAT = 13;

// ─── PALETTE ─────────────────────────────────────────────────────────────────
// Inspired by NoGood studio on minimal.gallery:
// warm off-white bg (#FAF9F3), electric lime accent (#C9F53A), 4-color constraint
const P = {
  bg:      '#FAF9F3',   // warm off-white — NoGood studio's rgba(251,250,243)
  surf:    '#FFFFFF',
  card:    '#F0EFEA',   // slightly deeper warm card
  text:    '#1C1C18',   // warm near-black
  textMid: '#5A5A54',   // mid warm gray
  textFaint: '#9A9A92', // faint warm gray
  accent:  '#C9F53A',   // electric lime — adapted from NoGood's rgba(216,255,124)
  accentD: '#2D3A1E',   // deep forest green — pairs with lime
  border:  '#E8E7DF',   // warm border
  borderL: '#F0EFEA',   // light border
  red:     '#E94736',   // alert/negative — NoGood's interactive red
  yellow:  '#F5D53A',   // warm yellow for secondary metric
};

// ─── ELEMENT HELPERS ─────────────────────────────────────────────────────────
const els = [];
let screenIdx = 0;
const screens = [];

function startScreen(name) {
  if (screenIdx > 0) finalizeScreen();
  screenIdx++;
  els.length = 0;
  currentScreen = { name, elements: [] };
}

let currentScreen = null;
function finalizeScreen() {
  if (currentScreen) {
    currentScreen.elements = [...els];
    screens.push(currentScreen);
  }
}

function R(x, y, w, h, fill, opts = {}) {
  return { type: 'rect', x, y, w, h, fill,
    rx: opts.rx ?? 0, opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none', sw: opts.sw ?? 0 };
}
function T(x, y, content, size, fill, opts = {}) {
  return { type: 'text', x, y, content: String(content), size,
    fill, fw: opts.fw ?? 400, font: opts.font ?? 'system-ui',
    anchor: opts.anchor ?? 'start', ls: opts.ls ?? '-0.02em', opacity: opts.opacity ?? 1 };
}
function C(cx, cy, r, fill, opts = {}) {
  return { type: 'circle', cx, cy, r, fill, opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none', sw: opts.sw ?? 0 };
}
function L(x1, y1, x2, y2, stroke, opts = {}) {
  return { type: 'line', x1, y1, x2, y2, stroke, sw: opts.sw ?? 1, opacity: opts.opacity ?? 1 };
}

// Canvas size
const W = 390;
const H = 844;

// ─── REUSABLE COMPONENTS ──────────────────────────────────────────────────────

function statusBar(elArr) {
  elArr.push(R(0, 0, W, 44, P.bg));
  elArr.push(T(20, 30, '9:41', 12, P.text, { fw: 600 }));
  // battery & signal right side
  for (let i = 0; i < 3; i++) {
    elArr.push(R(336 + i * 8, 18, 5, 8, P.text, { rx: 1, opacity: 0.6 - i * 0.2 }));
  }
  elArr.push(R(356, 16, 12, 11, 'none', { stroke: P.text, sw: 1, rx: 2, opacity: 0.5 }));
  elArr.push(R(358, 18, 8, 7, P.text, { rx: 1, opacity: 0.5 }));
  elArr.push(R(368, 20, 2, 4, P.text, { rx: 1, opacity: 0.5 }));
}

function bottomNav(elArr, activeIdx) {
  const navItems = ['Today', 'Sleep', 'Activity', 'Vitals', 'Goals'];
  const icons = ['◈', '◗', '◎', '♡', '◇'];
  elArr.push(R(0, H - 78, W, 78, P.bg));
  elArr.push(L(0, H - 78, W, H - 78, P.border, { sw: 1 }));
  const itemW = W / navItems.length;
  navItems.forEach((label, i) => {
    const cx = itemW * i + itemW / 2;
    const isActive = i === activeIdx;
    if (isActive) {
      elArr.push(R(cx - 26, H - 70, 52, 28, P.accent, { rx: 14 }));
      elArr.push(T(cx, H - 52, icons[i], 13, P.accentD, { anchor: 'middle', fw: 600 }));
      elArr.push(T(cx, H - 36, label, 9, P.text, { anchor: 'middle', fw: 600 }));
    } else {
      elArr.push(T(cx, H - 52, icons[i], 13, P.textFaint, { anchor: 'middle' }));
      elArr.push(T(cx, H - 36, label, 9, P.textMid, { anchor: 'middle' }));
    }
  });
}

function sectionHeader(elArr, y, label, actionLabel) {
  elArr.push(T(20, y, label, 13, P.text, { fw: 700, ls: '0.04em' }));
  if (actionLabel) {
    elArr.push(T(W - 20, y, actionLabel, 12, P.accentD, { anchor: 'end', fw: 500 }));
  }
}

// ─── SCREEN 1: TODAY ─────────────────────────────────────────────────────────
{
  const e = [];
  e.push(R(0, 0, W, H, P.bg));   // BG
  statusBar(e);

  // Header row
  e.push(T(20, 70, 'Good morning,', 13, P.textMid, { fw: 400 }));
  e.push(T(20, 90, 'Jordan', 26, P.text, { fw: 700, ls: '-0.04em' }));

  // Date chip
  e.push(R(W - 100, 62, 80, 28, P.card, { rx: 14 }));
  e.push(T(W - 60, 81, 'Fri, Apr 11', 10, P.textMid, { anchor: 'middle', fw: 500 }));

  // ── Headline Ring Card ──────────────────────────────────────────────────────
  e.push(R(16, 106, W - 32, 162, P.accentD, { rx: 20 }));
  // Decorative lime ring (SVG arc approximated with arcs/circles)
  // Outer ring placeholder circles
  e.push(C(195, 187, 55, 'none', { stroke: P.accent, sw: 8, opacity: 0.2 }));
  e.push(C(195, 187, 55, 'none', { stroke: P.accent, sw: 8, opacity: 0.9 })); // filled arc via clip trick
  // Score text
  e.push(T(195, 180, '82', 38, P.accent, { anchor: 'middle', fw: 700, ls: '-0.05em' }));
  e.push(T(195, 197, 'Body Score', 11, P.accent, { anchor: 'middle', fw: 400, opacity: 0.7 }));
  // Side stats on card
  e.push(T(48, 148, 'Sleep', 10, P.accent, { fw: 500, opacity: 0.6 }));
  e.push(T(48, 164, '7h 32m', 16, P.accent, { fw: 700 }));
  e.push(T(48, 180, 'vs 7h avg', 10, P.accent, { fw: 400, opacity: 0.5 }));

  e.push(T(288, 148, 'Steps', 10, P.accent, { fw: 500, opacity: 0.6 }));
  e.push(T(288, 164, '8,241', 16, P.accent, { fw: 700 }));
  e.push(T(288, 180, '82% of goal', 10, P.accent, { fw: 400, opacity: 0.5 }));

  // Lime indicator bar on ring card
  e.push(R(16, 244, W - 32, 24, P.accent, { rx: 0 }));
  e.push(R(16, 244, (W - 32) * 0.82, 24, P.accent, { rx: 0, opacity: 0 }));
  e.push(T(32, 260, 'TODAY\'S PROGRESS', 9, P.accentD, { fw: 700, ls: '0.08em' }));
  e.push(T(W - 32, 260, '82%', 9, P.accentD, { anchor: 'end', fw: 700 }));

  // ── 4 Quick Stats Grid ──────────────────────────────────────────────────────
  const stats = [
    { label: 'Heart Rate', val: '68', unit: 'bpm', icon: '♡', color: P.red, trend: '↓2' },
    { label: 'Calories', val: '1,847', unit: 'kcal', icon: '◎', color: P.yellow, trend: '+12%' },
    { label: 'Hydration', val: '1.8', unit: 'L', icon: '◇', color: '#74C2FF', trend: '72%' },
    { label: 'HRV', val: '54', unit: 'ms', icon: '◈', color: P.accent, trend: '+8' },
  ];
  const cardW = (W - 48) / 2;
  stats.forEach((s, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = 16 + col * (cardW + 16);
    const cy = 282 + row * 96;
    e.push(R(cx, cy, cardW, 84, P.surf, { rx: 16, stroke: P.border, sw: 1 }));
    // Icon circle
    e.push(C(cx + 22, cy + 22, 12, s.color, { opacity: 0.15 }));
    e.push(T(cx + 22, cy + 27, s.icon, 11, s.color, { anchor: 'middle', fw: 600 }));
    e.push(T(cx + 42, cy + 19, s.label, 10, P.textMid, { fw: 500 }));
    e.push(T(cx + 14, cy + 51, s.val, 22, P.text, { fw: 700, ls: '-0.04em' }));
    e.push(T(cx + 14 + s.val.length * 12, cy + 61, s.unit, 10, P.textMid, { fw: 400 }));
    // Trend badge
    e.push(R(cx + cardW - 46, cy + 58, 36, 18, P.card, { rx: 9 }));
    e.push(T(cx + cardW - 28, cy + 71, s.trend, 10, P.textMid, { anchor: 'middle', fw: 600 }));
  });

  // ── Today's Log section ─────────────────────────────────────────────────────
  const logY = 478;
  sectionHeader(e, logY, 'TODAY\'S LOG', 'See all');

  const logItems = [
    { time: '7:00 AM', label: 'Morning run', detail: '3.2 km · 24 min', tag: 'Activity', dot: P.accent },
    { time: '8:30 AM', label: 'Breakfast logged', detail: '620 kcal · 32g protein', tag: 'Nutrition', dot: P.yellow },
    { time: '12:45 PM', label: 'Resting HR check', detail: '68 bpm · Low zone', tag: 'Vitals', dot: P.red },
  ];
  logItems.forEach((item, i) => {
    const iy = logY + 18 + i * 60;
    e.push(R(16, iy, W - 32, 52, P.surf, { rx: 14, stroke: P.border, sw: 1 }));
    e.push(C(38, iy + 26, 6, item.dot));
    e.push(T(52, iy + 21, item.label, 13, P.text, { fw: 600 }));
    e.push(T(52, iy + 37, item.detail, 11, P.textMid, { fw: 400 }));
    // Tag chip
    const tagW = item.tag.length * 6.5 + 12;
    e.push(R(W - 32 - tagW, iy + 18, tagW, 18, P.card, { rx: 9 }));
    e.push(T(W - 32 - tagW / 2, iy + 31, item.tag, 9, P.textMid, { anchor: 'middle', fw: 600 }));
    e.push(T(W - 40, iy + 21, item.time, 10, P.textFaint, { anchor: 'end', fw: 400 }));
  });

  // Nudge banner
  const nudgeY = 662;
  e.push(R(16, nudgeY, W - 32, 40, P.accent, { rx: 14 }));
  e.push(T(38, nudgeY + 25, '◎  Time for your afternoon water check!', 12, P.accentD, { fw: 600 }));

  bottomNav(e, 0);

  screens.push({ name: 'Today', elements: e });
}

// ─── SCREEN 2: SLEEP ─────────────────────────────────────────────────────────
{
  const e = [];
  e.push(R(0, 0, W, H, P.bg));
  statusBar(e);

  // Back arrow + title
  e.push(T(20, 75, '←', 18, P.text, { fw: 500 }));
  e.push(T(W / 2, 78, 'Sleep', 18, P.text, { anchor: 'middle', fw: 700, ls: '-0.03em' }));
  e.push(T(W - 20, 75, 'Week', 13, P.accentD, { anchor: 'end', fw: 600 }));

  // Date strip
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const dates = ['7', '8', '9', '10', '11', '12', '13'];
  const dayW = (W - 32) / 7;
  days.forEach((d, i) => {
    const dx = 16 + i * dayW + dayW / 2;
    const isToday = i === 4;
    if (isToday) {
      e.push(C(dx, 112, 18, P.text));
      e.push(T(dx, 107, d, 10, P.bg, { anchor: 'middle', fw: 700 }));
      e.push(T(dx, 120, dates[i], 10, P.bg, { anchor: 'middle', fw: 600 }));
    } else {
      e.push(T(dx, 107, d, 10, P.textFaint, { anchor: 'middle', fw: 500 }));
      e.push(T(dx, 120, dates[i], 10, P.textMid, { anchor: 'middle', fw: 400 }));
    }
  });
  e.push(L(16, 132, W - 16, 132, P.border, { sw: 1 }));

  // Sleep duration headline
  e.push(T(20, 164, '7h 32m', 42, P.text, { fw: 700, ls: '-0.05em' }));
  e.push(T(176, 164, 'last night', 14, P.textMid, { fw: 400 }));
  e.push(T(20, 185, '↑ 12 min more than average · Good', 12, P.accent, { fw: 600 }));

  // Sleep stage chart ——————————————————————————————————————————————————————————
  // A horizontal stacked bar visualization
  const chartY = 204;
  const chartH = 56;
  const chartW = W - 32;
  e.push(R(16, chartY, chartW, chartH, P.card, { rx: 14 }));
  e.push(T(20, chartY + 14, '10:45 PM', 9, P.textFaint, { fw: 400 }));
  e.push(T(W - 20, chartY + 14, '6:17 AM', 9, P.textFaint, { anchor: 'end', fw: 400 }));

  // Stage bars (stacked horizontal)
  const stages = [
    { label: 'Awake', pct: 0.05, color: P.textFaint, y: chartY + 22 },
    { label: 'REM', pct: 0.20, color: P.accent, y: chartY + 22 },
    { label: 'Light', pct: 0.45, color: '#B3E070', y: chartY + 22 },
    { label: 'Deep', pct: 0.30, color: P.accentD, y: chartY + 22 },
  ];
  let stageX = 16;
  stages.forEach(s => {
    const sw2 = chartW * s.pct;
    e.push(R(stageX, s.y, sw2, 28, s.color, { rx: 0 }));
    stageX += sw2;
  });
  // Round the stacked bar ends
  e.push(R(16, chartY + 22, 8, 28, P.card)); // left cap
  e.push(R(W - 24, chartY + 22, 8, 28, P.card)); // right cap

  // Stage legend
  const legendY = chartY + 70;
  stages.forEach((s, i) => {
    const lx = 16 + i * 90;
    e.push(R(lx, legendY, 10, 10, s.color, { rx: 3 }));
    e.push(T(lx + 14, legendY + 9, s.label, 10, P.textMid, { fw: 500 }));
    e.push(T(lx + 14, legendY + 21, `${Math.round(s.pct * 100)}%`, 10, P.text, { fw: 700 }));
  });

  // Sleep Metrics Grid ————————————————————————————————————————————————————————
  const metricsY = legendY + 40;
  sectionHeader(e, metricsY, 'SLEEP METRICS', null);
  const metrics = [
    { label: 'Sleep Score', val: '84', icon: '◈', sub: 'Excellent', color: P.accent },
    { label: 'REM Cycles', val: '4', icon: '◗', sub: 'Good', color: P.accentD },
    { label: 'Restlessness', val: 'Low', icon: '◎', sub: '3 movements', color: P.yellow },
    { label: 'Resting HR', val: '58', icon: '♡', sub: 'bpm avg', color: P.red },
  ];
  metrics.forEach((m, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const mx = 16 + col * (179);
    const my = metricsY + 18 + row * 88;
    const mw = 163;
    e.push(R(mx, my, mw, 76, P.surf, { rx: 16, stroke: P.border, sw: 1 }));
    e.push(T(mx + 14, my + 26, m.icon, 18, m.color, { fw: 600 }));
    e.push(T(mx + 38, my + 20, m.label, 10, P.textMid, { fw: 500 }));
    e.push(T(mx + 38, my + 37, m.val, 20, P.text, { fw: 700, ls: '-0.04em' }));
    e.push(T(mx + 14, my + 60, m.sub, 10, P.textMid, { fw: 400 }));
  });

  // Weekly bar chart ——————————————————————————————————————————————————————————
  const barY = metricsY + 208;
  sectionHeader(e, barY, 'THIS WEEK', 'Avg 7h 18m');
  const sleepHrs = [6.5, 7.2, 8.0, 6.8, 7.5, 7.9, 7.3];
  const maxHr = 9;
  const barChartH = 70;
  const barChartW = (W - 48) / 7;
  sleepHrs.forEach((h, i) => {
    const bx = 16 + i * ((W - 32) / 7);
    const bh = (h / maxHr) * barChartH;
    const by = barY + 20 + (barChartH - bh);
    const isToday = i === 4;
    e.push(R(bx + 2, by, barChartW - 6, bh, isToday ? P.accent : P.card, { rx: 5 }));
    e.push(T(bx + barChartW / 2, barY + 104, days[i], 9, isToday ? P.text : P.textFaint, { anchor: 'middle', fw: isToday ? 700 : 400 }));
  });

  // 8h reference line
  const refLineY = barY + 20 + (barChartH - (8 / maxHr) * barChartH);
  e.push(L(16, refLineY, W - 16, refLineY, P.accent, { sw: 1, opacity: 0.4 }));
  e.push(T(W - 14, refLineY - 4, '8h', 8, P.accent, { anchor: 'end', fw: 600, opacity: 0.6 }));

  bottomNav(e, 1);
  screens.push({ name: 'Sleep', elements: e });
}

// ─── SCREEN 3: ACTIVITY ──────────────────────────────────────────────────────
{
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const e = [];
  e.push(R(0, 0, W, H, P.bg));
  statusBar(e);

  // Header
  e.push(T(20, 78, 'Activity', 24, P.text, { fw: 700, ls: '-0.04em' }));
  e.push(T(W - 20, 78, '+ Log', 13, P.accentD, { anchor: 'end', fw: 600 }));

  // Active calories ring ————————————————————————————————————————————————————————
  const ringCX = W / 2;
  const ringCY = 192;
  const ringR = 66;
  // Outer ring bg
  e.push(C(ringCX, ringCY, ringR, 'none', { stroke: P.border, sw: 14 }));
  // Progress (72%)
  e.push(C(ringCX, ringCY, ringR, 'none', { stroke: P.accent, sw: 14, opacity: 0.9 }));
  // Middle ring
  e.push(C(ringCX, ringCY, ringR - 20, 'none', { stroke: P.border, sw: 10 }));
  e.push(C(ringCX, ringCY, ringR - 20, 'none', { stroke: P.yellow, sw: 10, opacity: 0.8 }));
  // Inner ring
  e.push(C(ringCX, ringCY, ringR - 38, 'none', { stroke: P.border, sw: 10 }));
  e.push(C(ringCX, ringCY, ringR - 38, 'none', { stroke: P.red, sw: 10, opacity: 0.5 }));
  // Center text
  e.push(T(ringCX, ringCY - 10, '520', 28, P.text, { anchor: 'middle', fw: 700, ls: '-0.05em' }));
  e.push(T(ringCX, ringCY + 12, 'Active cal', 11, P.textMid, { anchor: 'middle', fw: 400 }));
  // Ring legend
  const ringLegend = [
    { label: 'Move', val: '520 / 720 cal', color: P.accent, cx: 46 },
    { label: 'Exercise', val: '24 / 30 min', color: P.yellow, cx: 195 },
    { label: 'Stand', val: '9 / 12 hr', color: P.red, cx: 300 },
  ];
  ringLegend.forEach(l => {
    e.push(C(l.cx, ringCY + 86, 5, l.color));
    e.push(T(l.cx + 10, ringCY + 82, l.label, 10, P.textMid, { fw: 600 }));
    e.push(T(l.cx + 10, ringCY + 96, l.val, 9, P.textFaint, { fw: 400 }));
  });

  // Step counter ————————————————————————————————————————————————————————————————
  const stepY = ringCY + 116;
  e.push(R(16, stepY, W - 32, 54, P.surf, { rx: 16, stroke: P.border, sw: 1 }));
  e.push(T(20, stepY + 20, '◎', 16, P.accent, { fw: 600 }));
  e.push(T(44, stepY + 20, '8,241 steps', 16, P.text, { fw: 700 }));
  e.push(T(44, stepY + 36, 'Goal: 10,000  ·  2.4 km distance', 11, P.textMid, { fw: 400 }));
  // Step progress bar
  e.push(R(W - 80, stepY + 16, 60, 8, P.card, { rx: 4 }));
  e.push(R(W - 80, stepY + 16, 60 * 0.82, 8, P.accent, { rx: 4 }));

  // Workouts list ———————————————————————————————————————————————————————————————
  const woY = stepY + 74;
  sectionHeader(e, woY, 'WORKOUTS', 'History');
  const workouts = [
    { icon: '◎', type: 'Morning Run', meta: '24 min · 3.2 km · 286 cal', time: '7:00 AM', color: P.accent },
    { icon: '◈', type: 'Yoga Flow', meta: '35 min · Flexibility · 110 cal', time: '12:15 PM', color: P.yellow },
    { icon: '◗', type: 'Evening Walk', meta: '18 min · 1.4 km · 68 cal', time: '6:30 PM', color: '#74C2FF' },
  ];
  workouts.forEach((w, i) => {
    const wy = woY + 18 + i * 70;
    e.push(R(16, wy, W - 32, 60, P.surf, { rx: 16, stroke: P.border, sw: 1 }));
    e.push(C(46, wy + 30, 18, w.color, { opacity: 0.15 }));
    e.push(T(46, wy + 35, w.icon, 14, w.color, { anchor: 'middle', fw: 700 }));
    e.push(T(74, wy + 24, w.type, 14, P.text, { fw: 700 }));
    e.push(T(74, wy + 40, w.meta, 11, P.textMid, { fw: 400 }));
    e.push(T(W - 20, wy + 24, w.time, 11, P.textFaint, { anchor: 'end', fw: 400 }));
    // Lime check badge
    e.push(R(W - 56, wy + 34, 28, 18, P.accent, { rx: 9 }));
    e.push(T(W - 42, wy + 47, '✓', 11, P.accentD, { anchor: 'middle', fw: 700 }));
  });

  // Weekly activity bar chart
  const actBarY = woY + 232;
  sectionHeader(e, actBarY, 'WEEKLY ACTIVE CALORIES', null);
  const actVals = [480, 620, 390, 540, 520, 0, 0];
  actVals.forEach((v, i) => {
    const bx = 20 + i * 50;
    const bh = v > 0 ? (v / 700) * 50 : 3;
    const by = actBarY + 18 + (50 - bh);
    e.push(R(bx, by, 34, bh, v > 0 ? (i === 4 ? P.accent : '#DCEFB0') : P.card, { rx: 6 }));
    e.push(T(bx + 17, actBarY + 82, days[i], 9, i === 4 ? P.text : P.textFaint, { anchor: 'middle', fw: i === 4 ? 700 : 400 }));
    if (v > 0) e.push(T(bx + 17, by - 4, `${Math.round(v)}`, 8, P.textMid, { anchor: 'middle', fw: 500 }));
  });

  bottomNav(e, 2);
  screens.push({ name: 'Activity', elements: e });
}

// ─── SCREEN 4: VITALS ────────────────────────────────────────────────────────
{
  const e = [];
  e.push(R(0, 0, W, H, P.bg));
  statusBar(e);

  // Header
  e.push(T(20, 78, 'Vitals', 24, P.text, { fw: 700, ls: '-0.04em' }));
  e.push(R(W - 88, 60, 68, 28, P.card, { rx: 14 }));
  e.push(T(W - 54, 79, 'Today', 11, P.textMid, { anchor: 'middle', fw: 600 }));
  e.push(T(W - 26, 79, '▾', 10, P.textMid, { anchor: 'end' }));

  // Heart Rate featured card
  const hrY = 96;
  e.push(R(16, hrY, W - 32, 128, P.accentD, { rx: 20 }));
  // Heartbeat waveform (simplified)
  const wavePoints = [
    [20, 56], [40, 56], [52, 34], [60, 72], [70, 40], [80, 58], [100, 58], [120, 58],
    [132, 40], [140, 72], [150, 42], [158, 58], [178, 58], [200, 58], [212, 38], [220, 72],
    [230, 42], [238, 58], [260, 58], [280, 58], [292, 42], [300, 72], [310, 42], [318, 58],
    [338, 58],
  ];
  // Draw waveform as connected lines
  for (let i = 0; i < wavePoints.length - 1; i++) {
    const [x1, y1] = wavePoints[i];
    const [x2, y2] = wavePoints[i + 1];
    e.push(L(16 + x1, hrY + y1, 16 + x2, hrY + y2, P.accent, { sw: 2, opacity: 0.6 }));
  }
  // Overlay text
  e.push(T(32, hrY + 26, 'Heart Rate', 12, P.accent, { fw: 500, opacity: 0.7 }));
  e.push(T(32, hrY + 50, '68', 36, P.accent, { fw: 700, ls: '-0.05em' }));
  e.push(T(88, hrY + 62, 'bpm', 14, P.accent, { fw: 400, opacity: 0.7 }));
  // Stats
  e.push(T(32, hrY + 112, 'Resting avg', 10, P.accent, { fw: 400, opacity: 0.6 }));
  e.push(T(140, hrY + 112, '↓ from 72 bpm last week', 10, P.accent, { fw: 500, opacity: 0.8 }));
  // Zones bar
  const zoneColors = [P.accent, '#FDFD8D', P.yellow, P.red, '#E43030'];
  const zoneW = (W - 52) / 5;
  zoneColors.forEach((col, i) => {
    e.push(R(16 + i * (zoneW + 2), hrY + 100, zoneW, 4, col, { rx: 2 }));
  });
  const cursorX = 16 + 0 * (zoneW + 2) + 8;
  e.push(C(cursorX, hrY + 102, 5, P.surf));

  // Vitals grid ————————————————————————————————————————————————————————————————
  const vitalY = hrY + 148;
  sectionHeader(e, vitalY, 'ALL VITALS', null);
  const vitalItems = [
    { label: 'HRV', val: '54', unit: 'ms', trend: '↑ 8ms', tColor: P.accent, icon: '◈' },
    { label: 'SpO₂', val: '98', unit: '%', trend: 'Normal', tColor: P.accent, icon: '◎' },
    { label: 'Skin Temp', val: '+0.2', unit: '°C', trend: 'Baseline', tColor: P.textMid, icon: '◗' },
    { label: 'Resp Rate', val: '14', unit: 'brpm', trend: 'Normal', tColor: P.accent, icon: '◇' },
    { label: 'Stress', val: '28', unit: '', trend: 'Low', tColor: P.accent, icon: '♡' },
    { label: 'Blood Glucose', val: '94', unit: 'mg/dL', trend: '↓ 2', tColor: P.yellow, icon: '◈' },
  ];
  vitalItems.forEach((v, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const vx = 16 + col * 183;
    const vy = vitalY + 18 + row * 84;
    const vw = 171;
    e.push(R(vx, vy, vw, 72, P.surf, { rx: 16, stroke: P.border, sw: 1 }));
    e.push(T(vx + 12, vy + 20, v.icon, 14, P.textFaint, { fw: 500 }));
    e.push(T(vx + 32, vy + 20, v.label, 11, P.textMid, { fw: 500 }));
    e.push(T(vx + 12, vy + 44, v.val, 22, P.text, { fw: 700, ls: '-0.04em' }));
    const valW = v.val.length * 12 + 14;
    e.push(T(vx + valW, vy + 52, v.unit, 10, P.textMid, { fw: 400 }));
    // Trend badge
    e.push(R(vx + vw - 58, vy + 50, 46, 16, v.tColor === P.accent ? '#EBF9C0' : P.card, { rx: 8 }));
    e.push(T(vx + vw - 35, vy + 61, v.trend, 9, v.tColor === P.accent ? P.accentD : P.textMid, { anchor: 'middle', fw: 600 }));
  });

  // Wearable status ——————————————————————————————————————————————————————————
  const wearY = vitalY + 282;
  e.push(R(16, wearY, W - 32, 48, P.surf, { rx: 16, stroke: P.border, sw: 1 }));
  e.push(C(42, wearY + 24, 14, P.accent, { opacity: 0.15 }));
  e.push(T(42, wearY + 28, '◈', 12, P.accent, { anchor: 'middle', fw: 700 }));
  e.push(T(64, wearY + 20, 'Apple Watch Ultra 2', 13, P.text, { fw: 600 }));
  e.push(T(64, wearY + 36, 'Connected · 84% battery', 11, P.textMid, { fw: 400 }));
  e.push(R(W - 50, wearY + 16, 30, 16, P.accent, { rx: 8 }));
  e.push(T(W - 35, wearY + 28, 'Live', 10, P.accentD, { anchor: 'middle', fw: 700 }));

  bottomNav(e, 3);
  screens.push({ name: 'Vitals', elements: e });
}

// ─── SCREEN 5: GOALS ─────────────────────────────────────────────────────────
{
  const e = [];
  e.push(R(0, 0, W, H, P.bg));
  statusBar(e);

  // Header
  e.push(T(20, 78, 'Goals', 24, P.text, { fw: 700, ls: '-0.04em' }));
  e.push(R(W - 70, 60, 50, 28, P.accent, { rx: 14 }));
  e.push(T(W - 45, 79, '+ New', 11, P.accentD, { anchor: 'middle', fw: 700 }));

  // Stats banner
  e.push(R(16, 96, W - 32, 52, P.card, { rx: 16, stroke: P.border, sw: 1 }));
  const statSummary = [
    { label: 'Active', val: '4' },
    { label: 'Completed', val: '12' },
    { label: 'Streak', val: '18d' },
  ];
  statSummary.forEach((s, i) => {
    const sx = 16 + i * ((W - 32) / 3) + (W - 32) / 6;
    e.push(T(sx, 124, s.val, 22, P.text, { anchor: 'middle', fw: 700, ls: '-0.04em' }));
    e.push(T(sx, 140, s.label, 10, P.textMid, { anchor: 'middle', fw: 500 }));
    if (i < 2) e.push(L(sx + (W - 32) / 6, 108, sx + (W - 32) / 6, 144, P.border, { sw: 1 }));
  });

  // Goal cards ————————————————————————————————————————————————————————————————
  const goalsData = [
    {
      title: '10K Steps Daily',
      desc: 'Build a daily movement habit',
      pct: 82,
      streak: '14-day streak',
      category: 'Activity',
      color: P.accent,
      icon: '◎',
    },
    {
      title: '8 Hours Sleep',
      desc: 'Improve sleep consistency',
      pct: 62,
      streak: '5 of 7 days',
      category: 'Sleep',
      color: P.accentD,
      icon: '◗',
    },
    {
      title: 'Resting HR < 60',
      desc: 'Cardiovascular fitness goal',
      pct: 87,
      streak: 'Best: 58 bpm',
      category: 'Vitals',
      color: P.red,
      icon: '♡',
    },
    {
      title: '2.5L Hydration',
      desc: 'Daily water intake target',
      pct: 72,
      streak: 'Today: 1.8L',
      category: 'Nutrition',
      color: '#74C2FF',
      icon: '◇',
    },
  ];
  const cardStartY = 162;
  goalsData.forEach((g, i) => {
    const gy = cardStartY + i * 120;
    e.push(R(16, gy, W - 32, 108, P.surf, { rx: 20, stroke: P.border, sw: 1 }));

    // Color band on left
    e.push(R(16, gy, 6, 108, g.color, { rx: 3 }));

    // Icon
    e.push(C(46, gy + 36, 18, g.color, { opacity: 0.12 }));
    e.push(T(46, gy + 41, g.icon, 15, g.color, { anchor: 'middle', fw: 700 }));

    // Title + desc
    e.push(T(74, gy + 28, g.title, 15, P.text, { fw: 700 }));
    e.push(T(74, gy + 45, g.desc, 11, P.textMid, { fw: 400 }));

    // Category chip
    const catW = g.category.length * 6.5 + 12;
    e.push(R(W - 32 - catW, gy + 18, catW, 18, P.card, { rx: 9 }));
    e.push(T(W - 32 - catW / 2, gy + 31, g.category, 9, P.textMid, { anchor: 'middle', fw: 600 }));

    // Progress bar
    const barY2 = gy + 64;
    e.push(R(74, barY2, W - 108, 6, P.card, { rx: 3 }));
    e.push(R(74, barY2, (W - 108) * (g.pct / 100), 6, g.color, { rx: 3 }));

    // Pct + streak
    e.push(T(74, barY2 + 22, g.streak, 10, P.textMid, { fw: 500 }));
    e.push(T(W - 32, barY2 + 22, `${g.pct}%`, 12, P.text, { anchor: 'end', fw: 700 }));
  });

  // Completed goal teaser ———————————————————————————————————————————————————
  const completedY = cardStartY + 4 * 120 + 8;
  e.push(R(16, completedY, W - 32, 40, P.card, { rx: 14 }));
  e.push(T(38, completedY + 25, '✓  View 12 completed goals', 13, P.textMid, { fw: 500 }));
  e.push(T(W - 24, completedY + 25, '→', 14, P.textMid, { anchor: 'end' }));

  bottomNav(e, 4);
  screens.push({ name: 'Goals', elements: e });
}

// ─── SCREEN 6: INSIGHTS / PROFILE ────────────────────────────────────────────
{
  const e = [];
  e.push(R(0, 0, W, H, P.bg));
  statusBar(e);

  // Avatar + name
  e.push(C(W / 2, 92, 36, P.card));
  e.push(T(W / 2, 97, '◈', 28, P.accentD, { anchor: 'middle', fw: 700 }));
  e.push(T(W / 2, 140, 'Jordan Kim', 20, P.text, { anchor: 'middle', fw: 700, ls: '-0.03em' }));
  e.push(T(W / 2, 158, '28 · Austin, TX', 12, P.textMid, { anchor: 'middle', fw: 400 }));

  // Health summary bar
  const hBarY = 174;
  e.push(R(16, hBarY, W - 32, 56, P.accentD, { rx: 18 }));
  const hStats = [
    { val: '7.2', unit: 'HRS', label: 'Avg Sleep' },
    { val: '9.2K', unit: 'STEPS', label: 'Daily avg' },
    { val: '68', unit: 'BPM', label: 'Resting HR' },
  ];
  hStats.forEach((hs, i) => {
    const hx = 16 + i * ((W - 32) / 3) + (W - 32) / 6;
    e.push(T(hx, hBarY + 24, hs.val, 18, P.accent, { anchor: 'middle', fw: 700, ls: '-0.04em' }));
    e.push(T(hx, hBarY + 38, hs.label, 9, P.accent, { anchor: 'middle', fw: 400, opacity: 0.6 }));
    if (i < 2) e.push(L(hx + (W - 32) / 6, hBarY + 14, hx + (W - 32) / 6, hBarY + 46, P.accent, { sw: 1, opacity: 0.2 }));
  });

  // Body metrics row ——————————————————————————————————————————————————————————
  const bodyY = hBarY + 70;
  sectionHeader(e, bodyY, 'BODY METRICS', 'Edit');
  const bodyMetrics = [
    { label: 'Weight', val: '71.2 kg', trend: '-0.8 kg', color: P.accent },
    { label: 'BMI', val: '22.4', trend: 'Normal', color: P.accent },
    { label: 'Body Fat', val: '14.2%', trend: '-0.3%', color: P.yellow },
    { label: 'Muscle', val: '43.1 kg', trend: '+0.5 kg', color: P.accentD },
  ];
  bodyMetrics.forEach((b, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const bx = 16 + col * 183;
    const by = bodyY + 18 + row * 70;
    e.push(R(bx, by, 171, 58, P.surf, { rx: 14, stroke: P.border, sw: 1 }));
    e.push(T(bx + 14, by + 22, b.label, 10, P.textMid, { fw: 500 }));
    e.push(T(bx + 14, by + 42, b.val, 18, P.text, { fw: 700, ls: '-0.03em' }));
    e.push(R(bx + 114, by + 32, 44, 16, P.card, { rx: 8 }));
    e.push(T(bx + 136, by + 44, b.trend, 9, P.textMid, { anchor: 'middle', fw: 600 }));
  });

  // 30-day trend overview
  const trendY = bodyY + 170;
  sectionHeader(e, trendY, '30-DAY HEALTH TREND', null);
  // Sparkline-style bars for each metric
  const trendBars = Array.from({ length: 30 }, (_, i) => 40 + Math.sin(i / 4) * 20 + Math.random() * 10);
  const tbW = (W - 40) / 30;
  trendBars.forEach((val, i) => {
    const tx = 20 + i * tbW;
    const tbH = (val / 70) * 44;
    const isRecent = i > 25;
    e.push(R(tx, trendY + 18 + (44 - tbH), tbW - 1, tbH, isRecent ? P.accent : '#DCEFB0', { rx: 1 }));
  });
  e.push(T(20, trendY + 78, 'Mar 12', 9, P.textFaint, { fw: 400 }));
  e.push(T(W - 20, trendY + 78, 'Apr 11', 9, P.textFaint, { anchor: 'end', fw: 400 }));

  // Settings + app info
  const settingsY = trendY + 100;
  const settingsItems = [
    { icon: '◈', label: 'Devices & Sensors', sub: 'Apple Watch, iPhone' },
    { icon: '◎', label: 'Notification Settings', sub: '3 active alerts' },
    { icon: '◗', label: 'Privacy & Data', sub: 'HIPAA-compliant storage' },
  ];
  settingsItems.forEach((s, i) => {
    const sy = settingsY + i * 58;
    e.push(R(16, sy, W - 32, 50, P.surf, { rx: 14, stroke: P.border, sw: 1 }));
    e.push(C(40, sy + 25, 14, P.card));
    e.push(T(40, sy + 29, s.icon, 11, P.textMid, { anchor: 'middle' }));
    e.push(T(64, sy + 21, s.label, 13, P.text, { fw: 600 }));
    e.push(T(64, sy + 37, s.sub, 11, P.textMid, { fw: 400 }));
    e.push(T(W - 24, sy + 25, '›', 16, P.textFaint, { anchor: 'end' }));
  });

  bottomNav(e, 4);
  screens.push({ name: 'Profile', elements: e });
}

// ─── ASSEMBLE & WRITE PEN ────────────────────────────────────────────────────
const totalElements = screens.reduce((s, sc) => s + sc.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    tagline: TAGLINE,
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'light',
    heartbeat: HEARTBEAT,
    elements: totalElements,
    screens: screens.length,
    slug: SLUG,
    inspiration: 'NoGood studio / minimal.gallery — warm off-white bg, electric lime accent, 4-color constraint',
    archetype: 'health-biometrics',
  },
  screens: screens.map(sc => ({
    name: sc.name,
    width: W,
    height: H,
    elements: sc.elements,
  })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
