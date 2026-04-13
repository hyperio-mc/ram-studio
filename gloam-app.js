'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'gloam';
const NAME = 'GLOAM';
const TAGLINE = 'sleep where the light goes soft';

// Palette — deep blue-tinted near-black + amber glow
// Inspired by darkmodedesign.com "ambient glow over hard shadow" trend
const C = {
  bg:      '#090B12',   // deep blue-tinted near-black
  surf:    '#0F1220',   // card surface
  card:    '#141829',   // elevated card
  border:  '#1E2438',   // subtle borders
  amber:   '#F59E0B',   // warm amber accent (glow source)
  amber2:  '#D97706',   // amber deep
  amberDim:'rgba(245,158,11,0.15)',  // ambient glow fill
  amberGlow:'rgba(245,158,11,0.08)', // very subtle glow
  teal:    '#2DD4BF',   // secondary accent
  tealDim: 'rgba(45,212,191,0.12)',
  text:    '#EEF0F6',   // primary text (slightly warm white)
  sub:     '#8090B4',   // secondary text (blue-shifted gray)
  muted:   '#3D4A6B',   // muted elements
  dim:     'rgba(238,240,246,0.35)', // dimmed text
  white:   '#FFFFFF',
  danger:  '#F87171',
};

const W = 390;
const H = 844;

let allElements = [];
let allScreens = [];

function rect(x, y, w, h, fill, opts = {}) {
  const el = { type: 'rect', x, y, w, h, fill };
  if (opts.rx !== undefined) el.rx = opts.rx;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  if (opts.stroke) el.stroke = opts.stroke;
  if (opts.sw !== undefined) el.strokeWidth = opts.sw;
  return el;
}

function text(x, y, content, size, fill, opts = {}) {
  const el = { type: 'text', x, y, content, fontSize: size, fill };
  if (opts.fw) el.fontWeight = opts.fw;
  if (opts.font) el.fontFamily = opts.font;
  if (opts.anchor) el.textAnchor = opts.anchor;
  if (opts.ls) el.letterSpacing = opts.ls;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  return el;
}

function circle(cx, cy, r, fill, opts = {}) {
  const el = { type: 'circle', cx, cy, r, fill };
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  if (opts.stroke) el.stroke = opts.stroke;
  if (opts.sw !== undefined) el.strokeWidth = opts.sw;
  return el;
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  const el = { type: 'line', x1, y1, x2, y2, stroke };
  if (opts.sw !== undefined) el.strokeWidth = opts.sw;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  return el;
}

// Arc path helper
function arcPath(cx, cy, r, startDeg, endDeg, stroke, sw, opts = {}) {
  const s = (startDeg - 90) * Math.PI / 180;
  const e = (endDeg - 90) * Math.PI / 180;
  const x1 = cx + r * Math.cos(s);
  const y1 = cy + r * Math.sin(s);
  const x2 = cx + r * Math.cos(e);
  const y2 = cy + r * Math.sin(e);
  const large = (endDeg - startDeg) > 180 ? 1 : 0;
  const el = {
    type: 'path',
    d: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`,
    stroke, strokeWidth: sw, fill: 'none',
  };
  if (opts.cap) el.strokeLinecap = opts.cap;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  return el;
}

function statusBar(els) {
  els.push(rect(0, 0, W, 44, C.bg));
  els.push(text(20, 16, '9:41', 14, C.text, { fw: '600' }));
  // Signal dots
  for (let i = 0; i < 4; i++) {
    els.push(rect(W - 70 + i * 10, 20, 7, 8 + i * 2, C.text, { rx: 1.5, opacity: i < 3 ? 1 : 0.35 }));
  }
  els.push(text(W - 26, 16, 'WiFi', 10, C.sub));
  els.push(rect(W - 42, 18, 24, 10, 'none', { rx: 3, stroke: C.text, sw: 1.5 }));
  els.push(rect(W - 40, 20, 18, 6, C.text, { rx: 2, opacity: 0.8 }));
}

function navBar(els, active) {
  const items = [
    { label: 'Tonight', icon: '◑', id: 0 },
    { label: 'Log',     icon: '✎', id: 1 },
    { label: 'Schedule',icon: '▦', id: 2 },
    { label: 'Insights',icon: '⌁', id: 3 },
    { label: 'Wind Down',icon: '❋', id: 4 },
  ];
  els.push(rect(0, H - 80, W, 80, C.surf));
  els.push(line(0, H - 80, W, H - 80, C.border, { sw: 0.5 }));
  items.forEach((item, i) => {
    const x = 39 + i * 62;
    const isActive = i === active;
    if (isActive) {
      els.push(rect(x - 24, H - 76, 48, 32, C.amberDim, { rx: 10 }));
    }
    els.push(text(x, H - 55, item.icon, 18, isActive ? C.amber : C.muted, { anchor: 'middle' }));
    els.push(text(x, H - 34, item.label, 9, isActive ? C.amber : C.muted, { anchor: 'middle', fw: isActive ? '600' : '400' }));
  });
  els.push(rect(W / 2 - 67, H - 12, 134, 4, C.muted, { rx: 2, opacity: 0.6 }));
}

// ─── SCREEN 1: TONIGHT ───────────────────────────────────────────────────────
function buildTonight() {
  const els = [];
  statusBar(els);

  // Background glow halo behind main ring
  els.push(circle(W / 2, 290, 110, C.amberDim, { opacity: 0.6 }));
  els.push(circle(W / 2, 290, 80, C.amberDim, { opacity: 0.4 }));

  // Header
  els.push(text(20, 68, 'Tonight', 26, C.text, { fw: '700', ls: '-0.5' }));
  els.push(text(20, 90, 'Sunday, April 12', 13));

  // Sleep score ring
  els.push(arcPath(W / 2, 270, 90, 0, 360, C.muted, 6, { opacity: 0.25 }));
  els.push(arcPath(W / 2, 270, 90, 0, 295, C.amber, 6, { cap: 'round' }));
  // Inner ring
  els.push(arcPath(W / 2, 270, 70, 0, 360, C.muted, 3, { opacity: 0.15 }));
  els.push(arcPath(W / 2, 270, 70, 0, 260, C.teal, 3, { cap: 'round', opacity: 0.8 }));
  // Score text
  els.push(text(W / 2, 255, '82', 42, C.text, { fw: '700', anchor: 'middle' }));
  els.push(text(W / 2, 275, 'Sleep Score', 11, C.sub, { anchor: 'middle' }));
  // Small amber dot on ring end
  const endAngle = (295 - 90) * Math.PI / 180;
  els.push(circle(W / 2 + 90 * Math.cos(endAngle), 270 + 90 * Math.sin(endAngle), 7, C.amber));

  // Sleep window countdown
  els.push(rect(20, 380, W - 40, 72, C.card, { rx: 16 }));
  els.push(rect(20, 380, W - 40, 72, C.amberGlow, { rx: 16 })); // glow overlay
  els.push(rect(20, 380, 3, 72, C.amber, { rx: 2 })); // left accent bar
  els.push(text(36, 403, 'SLEEP WINDOW OPENS', 9, C.amber, { fw: '700', ls: '1' }));
  els.push(text(36, 425, 'in 2h 14m', 22, C.text, { fw: '600' }));
  els.push(text(36, 444, 'Bedtime: 10:30 PM · Wake: 6:30 AM', 11));

  // Sleep plan row
  els.push(rect(20, 464, (W - 48) / 2, 72, C.card, { rx: 14 }));
  els.push(circle(44, 490, 12, C.amberDim));
  els.push(text(44, 494, '☾', 14, C.amber, { anchor: 'middle' }));
  els.push(text(64, 486, 'Bedtime', 10));
  els.push(text(64, 502, '10:30 PM', 15, C.text, { fw: '600' }));
  els.push(text(44, 520, '−30 min', 9, C.amber, { anchor: 'middle' }));

  const rx2 = 20 + (W - 48) / 2 + 8;
  els.push(rect(rx2, 464, (W - 48) / 2, 72, C.card, { rx: 14 }));
  els.push(circle(rx2 + 24, 490, 12, C.tealDim));
  els.push(text(rx2 + 24, 494, '☀', 14, C.teal, { anchor: 'middle' }));
  els.push(text(rx2 + 44, 486, 'Wake time', 10));
  els.push(text(rx2 + 44, 502, '6:30 AM', 15, C.text, { fw: '600' }));
  els.push(text(rx2 + 24, 520, '+8h 0m', 9, C.teal, { anchor: 'middle' }));

  // Habit rings row
  els.push(text(20, 556, 'TONIGHTS HABITS', 9, C.sub, { fw: '600', ls: '1' }));
  const habits = [
    { label: 'Caffeine', icon: '☕', pct: 100, color: C.amber },
    { label: 'Exercise', icon: '⚡', pct: 75, color: C.teal },
    { label: 'Screens', icon: '◉', pct: 40, color: C.danger },
  ];
  habits.forEach((h, i) => {
    const hx = 55 + i * 100;
    els.push(arcPath(hx, 600, 28, 0, 360, C.muted, 4, { opacity: 0.2 }));
    els.push(arcPath(hx, 600, 28, 0, h.pct * 3.6, h.color, 4, { cap: 'round' }));
    els.push(text(hx, 603, h.icon, 16, h.color, { anchor: 'middle' }));
    els.push(text(hx, 643, h.label, 10, C.sub, { anchor: 'middle' }));
  });

  // Last night card
  els.push(rect(20, 664, W - 40, 58, C.card, { rx: 14 }));
  els.push(text(36, 682, 'LAST NIGHT', 9, C.sub, { fw: '600', ls: '1' }));
  els.push(text(36, 702, '7h 12m · Good', 14, C.text, { fw: '500' }));
  els.push(text(W - 40, 695, 'View →', 12, C.amber, { anchor: 'end' }));

  navBar(els, 0);
  return els;
}

// ─── SCREEN 2: LOG ───────────────────────────────────────────────────────────
function buildLog() {
  const els = [];
  statusBar(els);

  els.push(rect(0, 0, W, H, C.bg));

  // Header
  els.push(text(20, 68, 'Tonight\'s Log', 24, C.text, { fw: '700' }));
  els.push(text(20, 90, 'How are you feeling right now?', 13));

  // Mood wheel — 6 emotion nodes
  const moods = [
    { label: 'Calm',      color: C.teal,   angle: 270 },
    { label: 'Content',   color: '#A78BFA', angle: 330 },
    { label: 'Anxious',   color: C.danger,  angle: 30  },
    { label: 'Wired',     color: C.amber,   angle: 90  },
    { label: 'Tired',     color: C.sub,     angle: 150 },
    { label: 'Gloomy',    color: '#60A5FA', angle: 210 },
  ];
  const mCx = W / 2, mCy = 200;
  els.push(circle(mCx, mCy, 55, C.amberDim, { opacity: 0.5 }));
  els.push(text(mCx, mCy + 5, 'Mood', 12, C.sub, { anchor: 'middle' }));
  moods.forEach(m => {
    const rad = m.angle * Math.PI / 180;
    const mx = mCx + 75 * Math.cos(rad);
    const my = mCy + 75 * Math.sin(rad);
    const isSelected = m.label === 'Calm';
    els.push(circle(mx, my, isSelected ? 24 : 20, isSelected ? m.color : C.card));
    if (isSelected) els.push(circle(mx, my, 28, m.color, { opacity: 0.2 }));
    els.push(text(mx, my + 4, m.label === 'Calm' ? '○' : '·', 18, m.color, { anchor: 'middle' }));
    els.push(text(mx, my + 32, m.label, 9, isSelected ? m.color : C.sub, { anchor: 'middle' }));
  });

  // Energy slider
  els.push(text(20, 310, 'ENERGY LEVEL', 9, C.sub, { fw: '600', ls: '1' }));
  els.push(rect(20, 322, W - 40, 6, C.muted, { rx: 3, opacity: 0.4 }));
  els.push(rect(20, 322, (W - 40) * 0.35, 6, C.teal, { rx: 3 }));
  els.push(circle(20 + (W - 40) * 0.35, 325, 9, C.white));
  els.push(circle(20 + (W - 40) * 0.35, 325, 6, C.teal));
  els.push(text(20, 345, 'Low', 10, C.muted));
  els.push(text(W - 20, 345, 'High', 10, C.muted, { anchor: 'end' }));

  // Notes field
  els.push(text(20, 368, 'NOTES', 9, C.sub, { fw: '600', ls: '1' }));
  els.push(rect(20, 378, W - 40, 68, C.card, { rx: 12, stroke: C.border, sw: 1 }));
  els.push(text(36, 400, 'Feeling a bit restless after the late meeting...', 12));

  // Toggle row
  const toggles = [
    { label: 'Caffeine after 2pm', on: false },
    { label: 'Exercise today',     on: true  },
    { label: 'Alcohol',            on: false },
    { label: 'Screen-free hour',   on: true  },
  ];
  toggles.forEach((t, i) => {
    const ty = 460 + i * 44;
    els.push(rect(20, ty, W - 40, 36, C.card, { rx: 10 }));
    els.push(text(36, ty + 23, t.label, 13));
    const tonX = W - 60;
    els.push(rect(tonX, ty + 10, 36, 18, t.on ? C.amber : C.muted, { rx: 9, opacity: t.on ? 1 : 0.3 }));
    els.push(circle(t.on ? tonX + 26 : tonX + 10, ty + 19, 7, C.white));
  });

  // Submit button
  els.push(rect(20, 642, W - 40, 50, C.amber, { rx: 14 }));
  els.push(rect(20, 642, W - 40, 50, 'none', { rx: 14 })); // glow
  els.push(text(W / 2, 673, 'Save Tonight\'s Log', 15, C.bg, { fw: '700', anchor: 'middle' }));

  navBar(els, 1);
  return els;
}

// ─── SCREEN 3: SCHEDULE ──────────────────────────────────────────────────────
function buildSchedule() {
  const els = [];
  statusBar(els);

  els.push(text(20, 68, 'Schedule', 24, C.text, { fw: '700' }));
  els.push(text(20, 90, 'Apr 6 – Apr 12', 13));

  // Tab row
  ['Week', 'Month', 'All Time'].forEach((t, i) => {
    const tx = 20 + i * 90;
    if (i === 0) els.push(rect(tx, 102, 72, 26, C.amberDim, { rx: 8 }));
    els.push(text(tx + 36, 119, t, 12, i === 0 ? C.amber : C.sub, { anchor: 'middle', fw: i === 0 ? '600' : '400' }));
  });

  // Weekly bar chart
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const hours = [7.2, 6.5, 7.8, 8.1, 6.0, 9.2, 8.4];
  const maxH = 10;
  const barW = 30, barX0 = 28, chartY = 295, chartH = 110;

  // Grid lines
  [0, 0.25, 0.5, 0.75, 1].forEach(f => {
    const gy = chartY - f * chartH;
    els.push(line(20, gy, W - 20, gy, C.muted, { sw: 0.5, opacity: 0.2 }));
    const hr = (f * maxH).toFixed(0);
    if (f > 0) els.push(text(16, gy + 4, hr + 'h', 8, C.muted, { anchor: 'end' }));
  });

  days.forEach((d, i) => {
    const bx = barX0 + i * 50;
    const bh = (hours[i] / maxH) * chartH;
    const isToday = i === 6;
    const color = isToday ? C.amber : C.teal;
    // Shadow bar
    els.push(rect(bx, chartY - chartH, barW, chartH, C.muted, { rx: 6, opacity: 0.08 }));
    // Actual bar
    els.push(rect(bx, chartY - bh, barW, bh, color, { rx: 6, opacity: isToday ? 1 : 0.65 }));
    if (isToday) {
      // Glow cap
      els.push(rect(bx, chartY - bh - 4, barW, 8, color, { rx: 4, opacity: 0.5 }));
    }
    els.push(text(bx + barW / 2, chartY + 14, d, 10, isToday ? C.amber : C.sub, { anchor: 'middle', fw: isToday ? '700' : '400' }));
    els.push(text(bx + barW / 2, chartY - bh - 8, hours[i].toFixed(1), 9, isToday ? C.amber : C.dim, { anchor: 'middle' }));
  });

  // Average line
  const avg = hours.reduce((a, b) => a + b) / hours.length;
  const avgY = chartY - (avg / maxH) * chartH;
  els.push(line(20, avgY, W - 20, avgY, C.amber, { sw: 1, opacity: 0.4 }));
  els.push(text(W - 18, avgY - 4, 'avg', 8, C.amber, { anchor: 'end' }));

  // Stats row
  const stats = [
    { label: 'Avg Duration', value: '7h 37m', color: C.amber },
    { label: 'Consistency',  value: '86%',    color: C.teal },
    { label: 'Sleep Debt',   value: '−22m',   color: C.sub },
  ];
  stats.forEach((s, i) => {
    const sx = 20 + i * 118;
    els.push(rect(sx, 326, 110, 56, C.card, { rx: 12 }));
    els.push(text(sx + 12, 346, s.label, 9));
    els.push(text(sx + 12, 366, s.value, 16, s.color, { fw: '700' }));
  });

  // Sleep window timeline
  els.push(text(20, 406, 'SLEEP WINDOWS', 9, C.sub, { fw: '600', ls: '1' }));
  days.forEach((d, i) => {
    const ry = 416 + i * 40;
    els.push(text(20, ry + 14, d, 11, i === 6 ? C.amber : C.sub));
    // Timeline track
    els.push(rect(40, ry + 6, W - 60, 16, C.muted, { rx: 8, opacity: 0.12 }));
    // Sleep bar (scaled to 10pm-8am window)
    const sleepStart = 0.6 + Math.random() * 0.1;
    const sleepLen   = 0.35 + Math.random() * 0.1;
    const bcolor = i === 6 ? C.amber : C.teal;
    els.push(rect(40 + (W - 60) * sleepStart, ry + 6, (W - 60) * sleepLen, 16, bcolor, { rx: 8, opacity: i === 6 ? 0.9 : 0.5 }));
  });

  navBar(els, 2);
  return els;
}

// ─── SCREEN 4: INSIGHTS ──────────────────────────────────────────────────────
function buildInsights() {
  const els = [];
  statusBar(els);

  els.push(text(20, 68, 'Insights', 24, C.text, { fw: '700' }));
  els.push(text(20, 90, 'Last 30 days', 13));

  // Big 3 metric cards
  const metrics = [
    { label: 'Avg Duration',  value: '7h 41m', delta: '+18m',  color: C.amber,  positive: true  },
    { label: 'Quality Score', value: '84',     delta: '+6pts', color: C.teal,   positive: true  },
    { label: 'Consistency',   value: '79%',    delta: '−3%',   color: C.danger, positive: false },
  ];
  metrics.forEach((m, i) => {
    const mx = 20 + i * 118;
    els.push(rect(mx, 104, 110, 72, C.card, { rx: 14 }));
    // Top glow bar
    els.push(rect(mx + 10, 104, 90, 3, m.color, { rx: 2, opacity: 0.7 }));
    els.push(text(mx + 10, 122, m.label, 9));
    els.push(text(mx + 10, 148, m.value, 18, m.color, { fw: '700' }));
    els.push(rect(mx + 10, 159, 44, 14, m.positive ? C.tealDim : 'rgba(248,113,113,0.12)', { rx: 4 }));
    els.push(text(mx + 32, 170, m.delta, 9, m.positive ? C.teal : C.danger, { anchor: 'middle' }));
  });

  // 30-day trend sparkline
  els.push(text(20, 200, '30-DAY SLEEP TREND', 9, C.sub, { fw: '600', ls: '1' }));
  els.push(rect(20, 210, W - 40, 90, C.card, { rx: 14 }));
  // Ambient glow underneath
  els.push(rect(20, 260, W - 40, 40, C.amberGlow, { rx: 14 }));

  // Sparkline data
  const sparkData = [6.5,7,7.2,6.8,8,7.5,7.8,6.2,7,7.4,8.1,7.6,7.2,7.9,8.3,7.4,6.8,7.1,7.5,8,7.8,7.2,6.9,7.3,7.8,8.2,7.5,7.7,8.1,7.4];
  const sparkMinH = 5.5, sparkMaxH = 8.8;
  const sparkW = W - 60, sparkH = 55, sparkX0 = 40, sparkY0 = 290;

  // Area fill (simplified — just a set of stacked rects)
  const segW = sparkW / (sparkData.length - 1);
  sparkData.forEach((v, i) => {
    if (i < sparkData.length - 1) {
      const x1 = sparkX0 + i * segW;
      const y1 = sparkY0 - ((v - sparkMinH) / (sparkMaxH - sparkMinH)) * sparkH;
      els.push(rect(x1, y1, segW, sparkY0 - y1, C.amber, { opacity: 0.06 }));
    }
  });
  // Sparkline dots
  sparkData.forEach((v, i) => {
    const sx = sparkX0 + i * segW;
    const sy = sparkY0 - ((v - sparkMinH) / (sparkMaxH - sparkMinH)) * sparkH;
    els.push(circle(sx, sy, i === sparkData.length - 1 ? 4 : 2, C.amber, { opacity: i === sparkData.length - 1 ? 1 : 0.5 }));
  });
  els.push(text(40, 305, '6h', 8, C.muted, { anchor: 'start' }));
  els.push(text(40, 225, '9h', 8, C.muted, { anchor: 'start' }));
  els.push(text(W - 30, 225, 'Now', 8, C.amber, { anchor: 'end' }));

  // Sleep phase breakdown
  els.push(text(20, 322, 'SLEEP PHASES', 9, C.sub, { fw: '600', ls: '1' }));
  els.push(rect(20, 332, W - 40, 64, C.card, { rx: 14 }));
  const phases = [
    { label: 'Awake',    pct: 0.08, color: C.danger  },
    { label: 'Light',    pct: 0.30, color: C.sub     },
    { label: 'Deep',     pct: 0.22, color: C.teal    },
    { label: 'REM',      pct: 0.40, color: C.amber   },
  ];
  let px = 36;
  phases.forEach(p => {
    const pw = (W - 68) * p.pct;
    els.push(rect(px, 346, pw, 16, p.color, { rx: 3, opacity: 0.8 }));
    px += pw + 1;
  });
  phases.forEach((p, i) => {
    const lx = 36 + i * 80;
    els.push(rect(lx, 374, 8, 8, p.color, { rx: 2 }));
    els.push(text(lx + 12, 382, `${p.label} ${(p.pct * 100).toFixed(0)}%`, 9));
  });

  // Insight callout
  els.push(rect(20, 410, W - 40, 64, C.amberDim, { rx: 14, stroke: C.amber, sw: 0.5, opacity: 0.6 }));
  els.push(circle(42, 428, 10, C.amberDim));
  els.push(text(42, 432, '✦', 12, C.amber, { anchor: 'middle' }));
  els.push(text(62, 428, 'Insight', 10, C.amber, { fw: '700' }));
  els.push(text(62, 444, 'Your best nights follow a 9pm wind-down start.', 11));
  els.push(text(62, 459, 'Try moving your routine 30 min earlier.', 11));

  // Best/worst nights
  els.push(text(20, 494, 'NOTABLE NIGHTS', 9, C.sub, { fw: '600', ls: '1' }));
  const nights = [
    { label: 'Best night',  date: 'Apr 8',  value: '9h 12m',  score: '96', color: C.teal  },
    { label: 'Worst night', date: 'Apr 3',  value: '5h 44m',  score: '54', color: C.danger },
  ];
  nights.forEach((n, i) => {
    const ny = 504 + i * 52;
    els.push(rect(20, ny, W - 40, 44, C.card, { rx: 12 }));
    els.push(rect(20, ny, 4, 44, n.color, { rx: 2 }));
    els.push(text(36, ny + 15, n.label, 10));
    els.push(text(36, ny + 32, `${n.date} · ${n.value}`, 13, C.text, { fw: '500' }));
    els.push(rect(W - 66, ny + 10, 42, 24, n.color, { rx: 8, opacity: 0.15 }));
    els.push(text(W - 45, ny + 26, n.score, 13, n.color, { fw: '700', anchor: 'middle' }));
  });

  navBar(els, 3);
  return els;
}

// ─── SCREEN 5: WIND DOWN ─────────────────────────────────────────────────────
function buildWindDown() {
  const els = [];
  statusBar(els);

  // Full amber glow corona at top
  els.push(circle(W / 2, 0, 220, C.amberDim, { opacity: 0.18 }));

  els.push(text(20, 68, 'Wind Down', 24, C.text, { fw: '700' }));
  els.push(text(20, 90, 'Starting now · 42 min remaining', 13));

  // Progress ring
  const prx = W / 2, pry = 210, prR = 76;
  els.push(arcPath(prx, pry, prR, 0, 360, C.muted, 8, { opacity: 0.15 }));
  els.push(arcPath(prx, pry, prR, 0, 145, C.amber, 8, { cap: 'round' }));
  // Outer glow ring
  els.push(arcPath(prx, pry, prR + 8, 0, 145, C.amber, 2, { cap: 'round', opacity: 0.25 }));
  els.push(text(prx, pry - 8, '40%', 32, C.text, { fw: '700', anchor: 'middle' }));
  els.push(text(prx, pry + 14, 'complete', 12, C.sub, { anchor: 'middle' }));
  // End dot
  const edAngle = (145 - 90) * Math.PI / 180;
  els.push(circle(prx + prR * Math.cos(edAngle), pry + prR * Math.sin(edAngle), 8, C.amber));
  els.push(circle(prx + prR * Math.cos(edAngle), pry + prR * Math.sin(edAngle), 12, C.amber, { opacity: 0.25 }));

  // Active step card
  els.push(rect(20, 304, W - 40, 80, C.card, { rx: 16 }));
  els.push(rect(20, 304, W - 40, 80, C.amberGlow, { rx: 16 }));
  els.push(rect(20, 304, W - 40, 2, C.amber, { rx: 2 })); // top glow bar
  els.push(text(36, 326, 'NOW', 9, C.amber, { fw: '700', ls: '1.5' }));
  els.push(text(36, 347, 'Dim your lights', 18, C.text, { fw: '600' }));
  els.push(text(36, 366, 'Switch to warm bulbs or candlelight', 12));
  els.push(text(W - 30, 350, '8 min', 13, C.amber, { anchor: 'end', fw: '600' }));

  // Upcoming steps
  els.push(text(20, 402, 'UPCOMING', 9, C.sub, { fw: '600', ls: '1' }));
  const steps = [
    { label: 'Put your phone away',       dur: '10 min', done: false },
    { label: 'Breathing exercise',         dur: '5 min',  done: false },
    { label: 'Read (physical book only)',  dur: '15 min', done: false },
    { label: 'Final screen check',         dur: '2 min',  done: false },
  ];
  steps.forEach((s, i) => {
    const sy = 412 + i * 48;
    els.push(rect(20, sy, W - 40, 40, C.surf, { rx: 10 }));
    els.push(circle(44, sy + 20, 10, C.muted, { opacity: 0.15 }));
    els.push(text(44, sy + 24, (i + 2).toString(), 11, C.muted, { anchor: 'middle' }));
    els.push(text(62, sy + 24, s.label, 12));
    els.push(text(W - 30, sy + 24, s.dur, 11, C.sub, { anchor: 'end' }));
  });

  // Skip / Done buttons
  els.push(rect(20, 612, (W - 48) / 2, 46, C.surf, { rx: 12, stroke: C.border, sw: 1 }));
  els.push(text(20 + (W - 48) / 4, 641, 'Skip Step', 13, C.sub, { anchor: 'middle' }));

  const btnX = 20 + (W - 48) / 2 + 8;
  els.push(rect(btnX, 612, (W - 48) / 2, 46, C.amber, { rx: 12 }));
  els.push(text(btnX + (W - 48) / 4, 641, 'Mark Done ✓', 13, C.bg, { anchor: 'middle', fw: '700' }));

  navBar(els, 4);
  return els;
}

// ─── SCREEN 6: SETTINGS ──────────────────────────────────────────────────────
function buildSettings() {
  const els = [];
  statusBar(els);

  els.push(text(20, 68, 'Settings', 24, C.text, { fw: '700' }));

  // Profile card
  els.push(rect(20, 84, W - 40, 64, C.card, { rx: 16 }));
  els.push(circle(56, 116, 22, C.amberDim));
  els.push(circle(56, 116, 22, 'none', { stroke: C.amber, sw: 1.5 }));
  els.push(text(56, 121, 'A', 18, C.amber, { anchor: 'middle', fw: '700' }));
  els.push(text(88, 108, 'Alex Rivera', 15, C.text, { fw: '600' }));
  els.push(text(88, 126, 'Premium · 14-day streak 🔥', 11));
  els.push(text(W - 30, 116, '›', 18, C.muted, { anchor: 'end' }));

  // Sleep goals section
  els.push(text(20, 166, 'SLEEP GOALS', 9, C.sub, { fw: '600', ls: '1' }));

  const goalItems = [
    { label: 'Target duration',  value: '8 hours',    icon: '⏱' },
    { label: 'Bedtime target',   value: '10:30 PM',   icon: '☾' },
    { label: 'Wake target',      value: '6:30 AM',    icon: '☀' },
    { label: 'Wind-down length', value: '42 min',     icon: '❋' },
  ];
  goalItems.forEach((g, i) => {
    const gy = 176 + i * 44;
    els.push(rect(20, gy, W - 40, 36, C.card, { rx: 10 }));
    els.push(circle(42, gy + 18, 12, C.amberDim));
    els.push(text(42, gy + 22, g.icon, 12, C.amber, { anchor: 'middle' }));
    els.push(text(62, gy + 23, g.label, 12));
    els.push(text(W - 30, gy + 23, g.value, 12, C.amber, { anchor: 'end', fw: '500' }));
    els.push(text(W - 18, gy + 23, '›', 13, C.muted, { anchor: 'end' }));
  });

  // Toggles section
  els.push(text(20, 360, 'SMART FEATURES', 9, C.sub, { fw: '600', ls: '1' }));
  const toggleItems = [
    { label: 'Smart Alarm',         sub: 'Wakes at lightest sleep phase', on: true  },
    { label: 'Gloam Score',         sub: 'Daily sleep quality scoring',   on: true  },
    { label: 'Wind-down reminder',  sub: '45 min before bedtime',         on: true  },
    { label: 'Caffeine tracking',   sub: 'Log drinks that affect sleep',  on: false },
  ];
  toggleItems.forEach((t, i) => {
    const ty = 370 + i * 54;
    els.push(rect(20, ty, W - 40, 46, C.card, { rx: 10 }));
    els.push(text(36, ty + 17, t.label, 13, C.text, { fw: '500' }));
    els.push(text(36, ty + 33, t.sub, 10));
    const tonX = W - 60;
    els.push(rect(tonX, ty + 13, 36, 18, t.on ? C.amber : C.muted, { rx: 9, opacity: t.on ? 1 : 0.25 }));
    els.push(circle(t.on ? tonX + 27 : tonX + 9, ty + 22, 7, C.white));
  });

  // Version footer
  els.push(text(W / 2, 598, 'GLOAM v1.4.2', 10, C.muted, { anchor: 'middle' }));
  els.push(text(W / 2, 614, 'Sleep where the light goes soft', 10, C.muted, { anchor: 'middle', opacity: 0.6 }));

  navBar(els, 4);
  return els;
}

// ─── ASSEMBLE ─────────────────────────────────────────────────────────────────
const screenBuilders = [
  { name: 'Tonight',    fn: buildTonight  },
  { name: 'Log',        fn: buildLog      },
  { name: 'Schedule',   fn: buildSchedule },
  { name: 'Insights',   fn: buildInsights },
  { name: 'Wind Down',  fn: buildWindDown },
  { name: 'Settings',   fn: buildSettings },
];

const screens = screenBuilders.map(({ name, fn }) => {
  const elements = fn();
  allElements.push(...elements);
  return {
    name,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"/>`,
    elements,
  };
});

const pen = {
  version: '2.8',
  metadata: {
    name:      NAME,
    tagline:   TAGLINE,
    author:    'RAM',
    date:      new Date().toISOString().split('T')[0],
    theme:     'dark',
    heartbeat: 'gloam',
    elements:  allElements.length,
    palette: {
      bg:      C.bg,
      surface: C.surf,
      card:    C.card,
      accent:  C.amber,
      accent2: C.teal,
      text:    C.text,
    },
    inspiration: 'darkmodedesign.com — ambient glow over hard shadow + component-level spotlight lighting trend',
  },
  screens,
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
const total = screens.reduce((s, sc) => s + sc.elements.length, 0);
console.log(`${NAME}: ${screens.length} screens, ${total} elements`);
console.log(`Written: ${SLUG}.pen`);
