'use strict';
// SLOE — Circadian Health & Sleep Intelligence
// Heartbeat #49 | Theme: DARK | Warm Terminal palette
// Inspired by: "Warm Terminal" dark palettes from Saaspo/DarkModeDesign research —
// amber/brown on near-black, almost unused in mobile wellness, chosen for irony:
// a sleep app that avoids the cold-blue palette that disrupts circadian rhythm.

const fs = require('fs');
const path = require('path');

const SLUG = 'sloe';
const NAME = 'SLOE';
const W = 390, H = 844;

// ── Warm Terminal palette ─────────────────────────────────────────────────────
const C = {
  bg:       '#0C0B09',   // warm near-black
  surf:     '#191410',   // warm dark surface
  surf2:    '#231A13',   // elevated card
  surf3:    '#2E2218',   // high-elevated card
  acc:      '#D4845A',   // burnt amber / terracotta
  acc2:     '#5B9BAA',   // muted teal (cortisol/cool contrast)
  acc3:     '#E8C46A',   // warm gold (highlight)
  text:     '#EDE0D0',   // warm white
  textSec:  '#B89E8A',   // warm gray secondary
  textDim:  'rgba(237,224,208,0.35)',  // tertiary
  border:   'rgba(212,132,90,0.12)',   // warm border
  borderDim:'rgba(237,224,208,0.06)',
  glow:     'rgba(212,132,90,0.15)',   // amber glow
};

// ── Primitives ────────────────────────────────────────────────────────────────
const els = [];

function rect(x, y, w, h, fill, opts = {}) {
  const el = { type: 'rect', x, y, width: w, height: h, fill };
  if (opts.rx)      el.rx = opts.rx;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  if (opts.stroke)  { el.stroke = opts.stroke; el.strokeWidth = opts.sw || 1; }
  return el;
}
function text(x, y, content, size, fill, opts = {}) {
  const el = { type: 'text', x, y, content: String(content), fontSize: size, fill };
  if (opts.fw)      el.fontWeight = opts.fw;
  if (opts.font)    el.fontFamily = opts.font;
  if (opts.anchor)  el.textAnchor = opts.anchor;
  if (opts.ls)      el.letterSpacing = opts.ls;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  return el;
}
function circle(cx, cy, r, fill, opts = {}) {
  const el = { type: 'circle', cx, cy, r, fill };
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  if (opts.stroke)  { el.stroke = opts.stroke; el.strokeWidth = opts.sw || 1; }
  return el;
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  const el = { type: 'line', x1, y1, x2, y2, stroke };
  el.strokeWidth = opts.sw || 1;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  return el;
}
function pathEl(d, fill, opts = {}) {
  const el = { type: 'path', d, fill };
  if (opts.stroke)  { el.stroke = opts.stroke; el.strokeWidth = opts.sw || 1; }
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  if (opts.fillRule) el.fillRule = opts.fillRule;
  return el;
}

// ── Reusable UI components ────────────────────────────────────────────────────
function statusBar(elements) {
  elements.push(rect(0, 0, W, 44, C.bg));
  elements.push(text(20, 28, '9:41', 13, C.textSec, { fw: '500' }));
  elements.push(text(370, 28, '●●●', 10, C.textSec, { anchor: 'end' }));
}

function navBar(elements, activeIdx) {
  const tabs = ['Rise', 'Tonight', 'Body Clock', 'Journal', 'Insights'];
  const icons = ['◐', '◑', '◎', '◫', '◈'];
  const tabW = W / tabs.length;
  elements.push(rect(0, H - 72, W, 72, C.surf));
  elements.push(line(0, H - 72, W, H - 72, C.border, { sw: 1 }));
  tabs.forEach((label, i) => {
    const cx = tabW * i + tabW / 2;
    const isActive = i === activeIdx;
    const col = isActive ? C.acc : C.textDim;
    elements.push(text(cx, H - 42, icons[i], 18, col, { anchor: 'middle' }));
    elements.push(text(cx, H - 22, label, 9, col, { anchor: 'middle', fw: isActive ? '600' : '400' }));
    if (isActive) {
      elements.push(rect(cx - 16, H - 72, 32, 3, C.acc, { rx: 2 }));
    }
  });
}

function scoreArc(elements, cx, cy, score, radius = 90) {
  // Background arc (full circle track)
  const angleStart = -220 * Math.PI / 180;
  const angleEnd   =   40 * Math.PI / 180;
  const span = angleEnd - angleStart;
  // Track
  for (let t = 0; t <= 60; t++) {
    const a = angleStart + (span * t / 60);
    const a2 = angleStart + (span * (t + 1) / 60);
    const x1 = cx + radius * Math.cos(a);
    const y1 = cy + radius * Math.sin(a);
    const x2 = cx + radius * Math.cos(a2);
    const y2 = cy + radius * Math.sin(a2);
    elements.push(line(x1, y1, x2, y2, C.borderDim, { sw: 10, opacity: 0.8 }));
  }
  // Filled arc (score proportion)
  const scoreFrac = score / 100;
  const filledEnd = angleStart + (span * scoreFrac);
  for (let t = 0; t <= Math.round(60 * scoreFrac); t++) {
    const a  = angleStart + (span * t / 60);
    const a2 = angleStart + (span * (t + 1) / 60);
    if (a2 > filledEnd) break;
    const x1 = cx + radius * Math.cos(a);
    const y1 = cy + radius * Math.sin(a);
    const x2 = cx + radius * Math.cos(a2);
    const y2 = cy + radius * Math.sin(a2);
    // gradient color shift
    const progress = t / (60 * scoreFrac);
    elements.push(line(x1, y1, x2, y2, progress < 0.6 ? C.acc : C.acc3, { sw: 10 }));
  }
  // Center dot
  elements.push(circle(cx, cy, 6, C.acc, { opacity: 0.6 }));
  elements.push(circle(cx, cy, 3, C.acc));
}

function tag(elements, x, y, label, active = false) {
  const pad = 10;
  const w = label.length * 6.5 + pad * 2;
  elements.push(rect(x, y - 14, w, 24, active ? C.acc : C.surf3, { rx: 12, stroke: active ? 'none' : C.border, sw: 1 }));
  elements.push(text(x + w/2, y + 4, label, 11, active ? '#0C0B09' : C.textSec, { anchor: 'middle', fw: active ? '600' : '400' }));
  return w + 8;
}

function sleepBar(elements, x, y, h, pct, w = 18) {
  elements.push(rect(x, y, w, h, C.surf3, { rx: w/2 }));
  const fillH = h * pct;
  elements.push(rect(x, y + h - fillH, w, fillH, C.acc, { rx: w/2 }));
}

function progressPill(elements, x, y, w, pct, label, valueLabel) {
  elements.push(rect(x, y, w, 8, C.surf3, { rx: 4 }));
  elements.push(rect(x, y, Math.round(w * pct), 8, C.acc, { rx: 4 }));
  elements.push(text(x, y - 6, label, 11, C.textSec));
  elements.push(text(x + w, y - 6, valueLabel, 11, C.acc, { anchor: 'end' }));
}

function insightCard(elements, x, y, w, h, icon, title, body, accentCol) {
  elements.push(rect(x, y, w, h, C.surf2, { rx: 16, stroke: C.borderDim, sw: 1 }));
  // accent top bar
  elements.push(rect(x, y, w, 3, accentCol || C.acc, { rx: 2 }));
  elements.push(text(x + 16, y + 26, icon, 18, accentCol || C.acc));
  elements.push(text(x + 42, y + 26, title, 13, C.text, { fw: '600' }));
  // wrap body text approx
  const words = body.split(' ');
  let line1 = '', line2 = '';
  for (const w of words) {
    if ((line1 + ' ' + w).trim().length <= 34) line1 = (line1 + ' ' + w).trim();
    else line2 = (line2 + ' ' + w).trim();
  }
  elements.push(text(x + 16, y + 48, line1, 11, C.textSec));
  if (line2) elements.push(text(x + 16, y + 64, line2, 11, C.textSec));
}

// ── Screen 1: Rise (Morning Dashboard) ───────────────────────────────────────
function buildRise() {
  const e = [];
  statusBar(e);

  // Ambient glow behind arc
  e.push(circle(W/2, 220, 130, C.acc, { opacity: 0.06 }));
  e.push(circle(W/2, 220, 100, C.acc, { opacity: 0.05 }));

  // Greeting
  e.push(text(W/2, 72, 'Good Morning, Mara', 14, C.textSec, { anchor: 'middle' }));
  e.push(text(W/2, 96, 'Thursday, April 10', 12, C.textDim, { anchor: 'middle' }));

  // Sleep score arc
  scoreArc(e, W/2, 220, 87);
  e.push(text(W/2, 208, '87', 52, C.text, { anchor: 'middle', fw: '700', font: 'serif' }));
  e.push(text(W/2, 234, 'Sleep Score', 12, C.textSec, { anchor: 'middle' }));
  e.push(text(W/2, 310, 'Great — top 18% this week', 12, C.acc, { anchor: 'middle' }));

  // Stats row
  e.push(rect(20, 334, W - 40, 80, C.surf2, { rx: 16, stroke: C.border, sw: 1 }));
  const stats = [['7h 22m', 'Duration'], ['96%', 'Efficiency'], ['22:47', 'Fell asleep'], ['6:09', 'Woke up']];
  stats.forEach(([val, lbl], i) => {
    const x = 20 + (W - 40) / 4 * i + (W - 40) / 8;
    e.push(text(x, 365, val, 15, C.text, { anchor: 'middle', fw: '700' }));
    e.push(text(x, 384, lbl, 10, C.textSec, { anchor: 'middle' }));
    if (i < 3) e.push(line(20 + (W-40)/4*(i+1), 350, 20 + (W-40)/4*(i+1), 398, C.borderDim));
  });

  // Circadian position
  e.push(text(20, 438, 'Your Circadian Position', 13, C.textSec, { fw: '500' }));
  e.push(text(W - 20, 438, 'Peak energy', 11, C.acc3, { anchor: 'end' }));

  // 24hr bar
  const barX = 20, barY = 450, barW = W - 40, barH = 28;
  e.push(rect(barX, barY, barW, barH, C.surf3, { rx: 14 }));
  // zones
  const zones = [
    { start: 0, end: 0.25, col: C.surf3, label: '12am' },       // midnight
    { start: 0.25, end: 0.42, col: C.acc, opacity: 0.5, label: '6am' },  // dawn rise
    { start: 0.42, end: 0.7, col: C.acc3, opacity: 0.6 },                // peak day
    { start: 0.7, end: 0.85, col: C.acc, opacity: 0.35 },                // wind down
    { start: 0.85, end: 1.0, col: C.surf3 },                             // sleep
  ];
  zones.forEach(z => {
    if (z.opacity) {
      e.push(rect(barX + barW * z.start, barY, barW * (z.end - z.start), barH, z.col, { rx: z.start === 0 || z.end === 1 ? 14 : 0, opacity: z.opacity }));
    }
  });
  // Current time indicator (~6:09am = ~0.256)
  const nowX = barX + barW * 0.256;
  e.push(circle(nowX, barY + barH/2, 12, C.acc, { stroke: C.bg, sw: 3 }));
  e.push(text(nowX, barY + barH/2 + 4, '●', 6, '#0C0B09', { anchor: 'middle' }));
  e.push(text(barX, barY + barH + 14, '12am', 9, C.textDim));
  e.push(text(barX + barW * 0.25, barY + barH + 14, '6am', 9, C.textDim, { anchor: 'middle' }));
  e.push(text(barX + barW * 0.5, barY + barH + 14, 'Noon', 9, C.textDim, { anchor: 'middle' }));
  e.push(text(barX + barW * 0.75, barY + barH + 14, '6pm', 9, C.textDim, { anchor: 'middle' }));
  e.push(text(barX + barW, barY + barH + 14, '12am', 9, C.textDim, { anchor: 'end' }));

  // Today's tips
  e.push(text(20, 520, "Today's Recommendations", 13, C.textSec, { fw: '500' }));
  const tips = [
    ['☀', 'Get sunlight now', 'Anchor your cortisol peak — go outside within 30 min'],
    ['◷', 'Best focus window', '9:30 – 11:45 am — ride your morning alertness peak'],
  ];
  tips.forEach(([icon, title, body], i) => {
    const ty = 536 + i * 82;
    insightCard(e, 20, ty, W - 40, 72, icon, title, body, i === 0 ? C.acc3 : C.acc);
  });

  navBar(e, 0);
  return e;
}

// ── Screen 2: Tonight (Wind-Down Planner) ────────────────────────────────────
function buildTonight() {
  const e = [];
  statusBar(e);

  e.push(text(20, 72, 'Tonight', 28, C.text, { fw: '700', font: 'serif' }));
  e.push(text(20, 96, 'Wind-down plan for better sleep', 13, C.textSec));

  // Sleep window card
  e.push(rect(20, 112, W - 40, 110, C.surf2, { rx: 18, stroke: C.border, sw: 1 }));
  e.push(rect(20, 112, W - 40, 3, C.acc, { rx: 2 }));
  e.push(text(36, 140, 'Target Sleep Window', 12, C.textSec));
  e.push(text(36, 170, '10:30 PM', 32, C.text, { fw: '700' }));
  e.push(text(36, 194, '→', 18, C.textSec));
  e.push(text(60, 194, '6:15 AM', 18, C.acc3, { fw: '600' }));
  e.push(text(W - 36, 170, '7h 45m', 22, C.acc, { anchor: 'end', fw: '700' }));
  e.push(text(W - 36, 194, 'optimal window', 11, C.textSec, { anchor: 'end' }));

  // Countdown
  e.push(text(W/2, 256, '2h 47m until wind-down', 14, C.acc, { anchor: 'middle' }));
  e.push(text(W/2, 274, 'Start your routine at 9:43 PM', 12, C.textDim, { anchor: 'middle' }));

  // Wind-down checklist
  e.push(text(20, 302, 'Wind-Down Checklist', 14, C.text, { fw: '600' }));
  const checks = [
    [true,  '◉', 'Blue light filter on', 'Activated 2h ago'],
    [true,  '◉', 'Last caffeine taken', 'Before 2pm — good'],
    [false, '○', 'Dim lights to 20%', 'In 2h 47m'],
    [false, '○', 'No screens 30min before', 'In 3h 17m'],
    [false, '○', 'Bedroom temp set', '65–68°F for optimal sleep'],
  ];
  checks.forEach(([done, icon, title, sub], i) => {
    const ry = 316 + i * 58;
    e.push(rect(20, ry, W - 40, 50, C.surf2, { rx: 12, stroke: done ? C.border : C.borderDim, sw: 1 }));
    e.push(text(40, ry + 30, icon, 16, done ? C.acc : C.textDim));
    e.push(text(64, ry + 22, title, 13, done ? C.text : C.textSec, { fw: done ? '600' : '400' }));
    e.push(text(64, ry + 38, sub, 11, done ? C.acc3 : C.textDim));
    if (done) e.push(text(W - 36, ry + 30, '✓', 14, C.acc3, { anchor: 'end' }));
    else      e.push(text(W - 36, ry + 30, '→', 12, C.textDim, { anchor: 'end' }));
  });

  // Blue light score
  e.push(rect(20, 622, W - 40, 60, C.surf2, { rx: 14, stroke: C.border, sw: 1 }));
  e.push(text(36, 648, 'Blue Light Exposure', 13, C.text, { fw: '500' }));
  e.push(text(36, 666, 'Today: low exposure — great for melatonin onset', 11, C.textSec));
  e.push(text(W - 36, 652, '12%', 20, C.acc3, { anchor: 'end', fw: '700' }));
  e.push(text(W - 36, 668, 'of limit', 10, C.textDim, { anchor: 'end' }));

  navBar(e, 1);
  return e;
}

// ── Screen 3: Body Clock (Circadian Visualization) ───────────────────────────
function buildBodyClock() {
  const e = [];
  statusBar(e);

  e.push(text(20, 72, 'Body Clock', 28, C.text, { fw: '700', font: 'serif' }));
  e.push(text(20, 96, 'Your 24-hour circadian rhythm', 13, C.textSec));

  // Large 24hr clock wheel
  const cx = W/2, cy = 310, r = 130;
  // Background circle
  e.push(circle(cx, cy, r + 20, C.surf2, { stroke: C.borderDim, sw: 1 }));
  e.push(circle(cx, cy, r + 20, C.bg, { opacity: 0.3 }));
  // Outer track
  e.push(circle(cx, cy, r, 'none', { stroke: C.borderDim, sw: 1 }));
  // Inner circle
  e.push(circle(cx, cy, 50, C.surf3));

  // Hour marks
  for (let h = 0; h < 24; h++) {
    const angle = (h / 24) * Math.PI * 2 - Math.PI / 2;
    const rOut = r + 14, rIn = r + 6;
    const x1 = cx + rIn * Math.cos(angle);
    const y1 = cy + rIn * Math.sin(angle);
    const x2 = cx + rOut * Math.cos(angle);
    const y2 = cy + rOut * Math.sin(angle);
    e.push(line(x1, y1, x2, y2, h % 6 === 0 ? C.textSec : C.borderDim, { sw: h % 6 === 0 ? 2 : 1 }));
    if (h % 6 === 0) {
      const labels = { 0: '12AM', 6: '6AM', 12: 'Noon', 18: '6PM' };
      const tx = cx + (r + 28) * Math.cos(angle);
      const ty = cy + (r + 28) * Math.sin(angle);
      e.push(text(tx, ty + 4, labels[h], 9, C.textSec, { anchor: 'middle' }));
    }
  }

  // Rhythm zones (energy/alertness as segments)
  const zones24 = [
    { start: 0,    end: 0.25, col: C.surf3, label: 'Sleep', opacity: 0.9 },
    { start: 0.25, end: 0.35, col: C.acc,   label: 'Rise', opacity: 0.7 },
    { start: 0.35, end: 0.6,  col: C.acc3,  label: 'Peak', opacity: 0.65 },
    { start: 0.6,  end: 0.75, col: C.acc,   label: 'Afternoon', opacity: 0.45 },
    { start: 0.75, end: 0.9,  col: C.acc2,  label: 'Wind-down', opacity: 0.55 },
    { start: 0.9,  end: 1.0,  col: C.surf3, label: 'Sleep', opacity: 0.9 },
  ];

  // Draw arc segments as wedge shapes (approximated with many thin lines at radius 60-120)
  zones24.forEach(z => {
    const steps = Math.round((z.end - z.start) * 48);
    for (let s = 0; s < steps; s++) {
      const frac = z.start + (z.end - z.start) * s / steps;
      const angle = frac * Math.PI * 2 - Math.PI / 2;
      const x1 = cx + 55 * Math.cos(angle);
      const y1 = cy + 55 * Math.sin(angle);
      const x2 = cx + r * Math.cos(angle);
      const y2 = cy + r * Math.sin(angle);
      e.push(line(x1, y1, x2, y2, z.col, { sw: 7, opacity: z.opacity }));
    }
  });

  // Now hand (6:09 AM = 6.15/24 of day)
  const nowAngle = (6.15 / 24) * Math.PI * 2 - Math.PI / 2;
  const hx = cx + (r - 10) * Math.cos(nowAngle);
  const hy = cy + (r - 10) * Math.sin(nowAngle);
  e.push(line(cx, cy, hx, hy, C.acc, { sw: 3 }));
  e.push(circle(hx, hy, 7, C.acc, { stroke: C.bg, sw: 2 }));

  // Center label
  e.push(text(cx, cy - 8, 'NOW', 9, C.acc, { anchor: 'middle', ls: 2 }));
  e.push(text(cx, cy + 10, '6:09', 14, C.text, { anchor: 'middle', fw: '700' }));
  e.push(text(cx, cy + 26, 'AM', 10, C.textSec, { anchor: 'middle' }));

  // Hormone timing strip
  e.push(text(20, 476, 'Hormone Timing', 13, C.text, { fw: '600' }));
  const hormones = [
    { label: 'Cortisol', peak: '8:30 AM', dir: '↑', col: C.acc3, note: 'Morning peak — now' },
    { label: 'Melatonin', peak: '10:45 PM', dir: '↓', col: C.acc2, note: 'Onset in ~16h' },
  ];
  hormones.forEach((h, i) => {
    const hx2 = 20 + i * ((W-40)/2 + 8);
    e.push(rect(hx2, 490, (W-48)/2, 68, C.surf2, { rx: 14, stroke: C.borderDim, sw: 1 }));
    e.push(text(hx2 + 14, 510, h.label, 11, C.textSec));
    e.push(text(hx2 + 14, 534, h.peak, 17, h.col, { fw: '700' }));
    e.push(text(hx2 + 14, 550, h.note, 10, C.textDim));
  });

  // Chronotype badge
  e.push(rect(20, 574, W-40, 52, C.surf2, { rx: 14, stroke: C.border, sw: 1 }));
  e.push(text(36, 598, '◐', 18, C.acc));
  e.push(text(62, 598, 'Intermediate chronotype', 14, C.text, { fw: '600' }));
  e.push(text(62, 614, 'Slightly evening-leaning — flexible schedule works best', 11, C.textSec));

  navBar(e, 2);
  return e;
}

// ── Screen 4: Journal (Sleep Log) ────────────────────────────────────────────
function buildJournal() {
  const e = [];
  statusBar(e);

  e.push(text(20, 72, 'Sleep Journal', 28, C.text, { fw: '700', font: 'serif' }));
  e.push(text(20, 96, 'Last 7 days', 13, C.textSec));

  // Weekly bar chart
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const scores = [72, 85, 68, 91, 88, 95, 87];
  const durations = [6.2, 7.1, 5.8, 7.7, 7.4, 8.1, 7.4]; // hours
  const chartX = 20, chartY = 180, chartW = W - 40, chartH = 100;
  const barW = chartW / days.length - 6;

  // Average line
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const avgY = chartY + chartH * (1 - avg / 100);
  e.push(line(chartX, avgY, chartX + chartW, avgY, C.acc, { sw: 1, opacity: 0.3 }));
  e.push(text(chartX + chartW + 4, avgY + 4, 'avg', 9, C.acc, { opacity: 0.6 }));

  days.forEach((day, i) => {
    const bx = chartX + i * (chartW / days.length) + 3;
    const bh = chartH * (scores[i] / 100);
    const by = chartY + chartH - bh;
    const isToday = i === 6;
    e.push(rect(bx, chartY, barW, chartH, C.surf3, { rx: 6 }));
    e.push(rect(bx, by, barW, bh, isToday ? C.acc : C.acc, { rx: 6, opacity: isToday ? 1 : 0.55 }));
    e.push(text(bx + barW/2, chartY + chartH + 16, day, 10, isToday ? C.acc : C.textDim, { anchor: 'middle' }));
    e.push(text(bx + barW/2, by - 5, scores[i], 10, isToday ? C.acc3 : C.textSec, { anchor: 'middle', fw: isToday ? '700' : '400' }));
  });

  // Avg stat
  e.push(text(20, 316, `7-day average: ${Math.round(avg)}`, 13, C.textSec));
  e.push(text(W - 20, 316, `↑ 8 pts vs last week`, 12, C.acc3, { anchor: 'end' }));

  // Log entries
  e.push(text(20, 348, 'Recent Logs', 14, C.text, { fw: '600' }));

  const entries = [
    { date: 'Today · Thu Apr 10', score: 87, sleep: '10:47 PM', wake: '6:09 AM', mood: 'Energized', tags: ['Calm', 'No alcohol'] },
    { date: 'Yesterday · Wed Apr 9', score: 88, sleep: '11:02 PM', wake: '6:30 AM', mood: 'Good', tags: ['Evening walk', 'Low stress'] },
    { date: 'Tue Apr 8', score: 68, sleep: '12:15 AM', wake: '6:45 AM', mood: 'Groggy', tags: ['Late screen', 'Wine'] },
  ];

  entries.forEach((entry, i) => {
    const ey = 362 + i * 112;
    e.push(rect(20, ey, W - 40, 100, C.surf2, { rx: 14, stroke: C.borderDim, sw: 1 }));
    // Score badge
    const scoreCol = entry.score >= 85 ? C.acc3 : entry.score >= 70 ? C.acc : '#E05252';
    e.push(circle(W - 46, ey + 28, 20, C.surf3));
    e.push(text(W - 46, ey + 33, entry.score, 15, scoreCol, { anchor: 'middle', fw: '700' }));
    e.push(text(36, ey + 24, entry.date, 11, C.textDim));
    e.push(text(36, ey + 42, `${entry.sleep}  →  ${entry.wake}`, 13, C.text, { fw: '500' }));
    e.push(text(36, ey + 58, `Mood: ${entry.mood}`, 11, C.textSec));
    // tags
    let tx = 36;
    entry.tags.forEach(tg => {
      const tw = tg.length * 6 + 18;
      e.push(rect(tx, ey + 72, tw, 20, C.surf3, { rx: 10, stroke: C.borderDim, sw: 1 }));
      e.push(text(tx + tw/2, ey + 85, tg, 9, C.textSec, { anchor: 'middle' }));
      tx += tw + 6;
    });
  });

  navBar(e, 3);
  return e;
}

// ── Screen 5: Insights (Weekly Intelligence) ─────────────────────────────────
function buildInsights() {
  const e = [];
  statusBar(e);

  e.push(text(20, 72, 'Insights', 28, C.text, { fw: '700', font: 'serif' }));
  e.push(text(20, 96, 'Personalized analysis · this week', 13, C.textSec));

  // Top insight hero card
  e.push(rect(20, 112, W - 40, 100, C.surf2, { rx: 18, stroke: C.border, sw: 1 }));
  e.push(rect(20, 112, W - 40, 4, C.acc3, { rx: 2 }));
  e.push(circle(W - 46, 162, 32, C.surf3));
  e.push(text(W - 46, 168, '◎', 22, C.acc3, { anchor: 'middle' }));
  e.push(text(36, 136, 'Your optimal sleep window', 12, C.textSec));
  e.push(text(36, 158, '10:45 PM – 6:30 AM', 19, C.text, { fw: '700' }));
  e.push(text(36, 178, 'Based on 30-day chronotype learning', 12, C.textDim));
  e.push(text(36, 196, 'Stick within ±30 min for best recovery', 11, C.acc3));

  // Progress section
  e.push(text(20, 234, 'Weekly Goals', 14, C.text, { fw: '600' }));
  e.push(rect(20, 248, W - 40, 120, C.surf2, { rx: 16, stroke: C.borderDim, sw: 1 }));
  const goals = [
    ['Sleep consistency', 0.82, '82%'],
    ['7+ hour nights', 0.71, '5/7 nights'],
    ['Wind-down routine', 0.90, '6/7 days'],
  ];
  goals.forEach(([label, pct, valLabel], i) => {
    const gy = 272 + i * 32;
    progressPill(e, 36, gy, W - 92, pct, label, valLabel);
  });

  // Correlation cards
  e.push(text(20, 390, 'What improves your sleep', 14, C.text, { fw: '600' }));
  const correlations = [
    ['◈', '+12 pts', 'Evening walk', 'Walking after 5pm correlates with better sleep onset', C.acc3],
    ['◎', '+9 pts', 'No alcohol', 'Alcohol-free nights average 14% higher efficiency', C.acc],
    ['◑', '−8 pts', 'Late screen', 'Screens after 10pm delay your sleep by ~22 min', '#E05252'],
    ['◷', '+7 pts', 'Same wake time', 'Consistent wake times anchor your circadian anchor', C.acc2],
  ];
  correlations.forEach(([icon, delta, title, body, col], i) => {
    const cy2 = 406 + i * 74;
    e.push(rect(20, cy2, W - 40, 66, C.surf2, { rx: 14, stroke: C.borderDim, sw: 1 }));
    e.push(text(36, cy2 + 28, icon, 16, col));
    e.push(text(58, cy2 + 28, title, 13, C.text, { fw: '600' }));
    e.push(text(W - 36, cy2 + 28, delta, 15, col, { anchor: 'end', fw: '700' }));
    // wrap body
    const words = body.split(' ');
    let l1 = '', l2 = '';
    words.forEach(w => {
      if ((l1 + ' ' + w).trim().length <= 38) l1 = (l1 + ' ' + w).trim();
      else l2 = (l2 + ' ' + w).trim();
    });
    e.push(text(58, cy2 + 44, l1, 10, C.textSec));
    if (l2) e.push(text(58, cy2 + 56, l2, 10, C.textSec));
  });

  navBar(e, 4);
  return e;
}

// ── Screen 6: Profile ─────────────────────────────────────────────────────────
function buildProfile() {
  const e = [];
  statusBar(e);

  // Hero avatar area
  e.push(rect(0, 44, W, 160, C.surf, { opacity: 0.5 }));
  e.push(circle(W/2, 108, 44, C.surf3, { stroke: C.border, sw: 2 }));
  e.push(text(W/2, 114, 'M', 36, C.acc, { anchor: 'middle', fw: '700', font: 'serif' }));
  e.push(text(W/2, 172, 'Mara Okonkwo', 18, C.text, { anchor: 'middle', fw: '600' }));
  e.push(text(W/2, 190, 'Member since March 2024', 12, C.textSec, { anchor: 'middle' }));

  // Chronotype card
  e.push(rect(20, 210, W - 40, 80, C.surf2, { rx: 16, stroke: C.border, sw: 1 }));
  e.push(rect(20, 210, W - 40, 3, C.acc, { rx: 2 }));
  e.push(text(36, 236, 'Chronotype', 12, C.textSec));
  e.push(text(36, 262, '◐  Intermediate', 20, C.text, { fw: '700' }));
  e.push(text(W - 36, 262, 'Eve-leaning', 13, C.acc, { anchor: 'end' }));
  e.push(text(36, 280, 'Flexible — can adapt to early or late schedules', 11, C.textDim));

  // Streak
  e.push(rect(20, 306, W - 40, 64, C.surf2, { rx: 14, stroke: C.borderDim, sw: 1 }));
  e.push(text(36, 330, '🔥  Sleep Streak', 13, C.text, { fw: '600' }));
  e.push(text(36, 352, '14 nights of 80+ sleep score', 12, C.textSec));
  e.push(text(W - 36, 340, '14', 28, C.acc3, { anchor: 'end', fw: '700' }));

  // Settings groups
  const sections = [
    ['Goals', [['Target sleep duration', '7h 30m'], ['Wake time', '6:30 AM'], ['Sleep time', '11:00 PM']]],
    ['Notifications', [['Wind-down reminder', '9:30 PM'], ['Morning report', 'On wake'], ['Weekly summary', 'Sunday 8 AM']]],
    ['Integrations', [['Apple Health', 'Connected'], ['Oura Ring', 'Not connected']]],
  ];

  let sy = 386;
  sections.forEach(([title, items]) => {
    e.push(text(20, sy, title, 13, C.textSec, { fw: '500' }));
    sy += 16;
    items.forEach(([label, val]) => {
      e.push(rect(20, sy, W - 40, 48, C.surf2, { rx: 12, stroke: C.borderDim, sw: 1 }));
      e.push(text(36, sy + 28, label, 13, C.text));
      e.push(text(W - 36, sy + 28, val, 12, C.textSec, { anchor: 'end' }));
      e.push(text(W - 22, sy + 28, '›', 14, C.textDim, { anchor: 'end' }));
      sy += 52;
    });
    sy += 12;
  });

  navBar(e, 4);
  return e;
}

// ── Assemble pen file ─────────────────────────────────────────────────────────
const screens = [
  { name: 'Rise — Morning Dashboard', elements: buildRise() },
  { name: 'Tonight — Wind-Down Planner', elements: buildTonight() },
  { name: 'Body Clock — Circadian View', elements: buildBodyClock() },
  { name: 'Sleep Journal', elements: buildInsights() },    // swapped order
  { name: 'Insights — Weekly Analysis', elements: buildJournal() },
  { name: 'Profile', elements: buildProfile() },
];

const totalElements = screens.reduce((sum, s) => sum + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'SLOE — Circadian Health & Sleep Intelligence',
    author: 'RAM',
    date: new Date().toISOString(),
    theme: 'dark',
    heartbeat: 49,
    elements: totalElements,
    palette: {
      bg: C.bg, surface: C.surf, text: C.text,
      accent: C.acc, accent2: C.acc2, accent3: C.acc3,
    },
    inspiration: 'Warm Terminal dark palette from Saaspo/DarkModeDesign — amber/brown on near-black, almost unused in mobile wellness. Circadian health app using warm amber tones to avoid the ironic cold-blue screens that disrupt the very sleep the app tracks.',
  },
  canvas: { width: W, height: H },
  screens: screens.map(s => ({
    name: s.name,
    width: W,
    height: H,
    elements: s.elements,
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
