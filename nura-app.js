'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'nura';
const NAME = 'NURA';
const TAGLINE = 'Neural state, in focus';
const W = 390, H = 844;

// --- Primitives ---
function rect(x, y, w, h, fill, opts = {}) {
  return { type: 'rect', x, y, w, h, fill, rx: opts.rx || 0, opacity: opts.opacity ?? 1, stroke: opts.stroke || null, sw: opts.sw || 1 };
}
function text(x, y, content, size, fill, opts = {}) {
  return { type: 'text', x, y, content: String(content), size, fill, fw: opts.fw || 400, font: opts.font || 'Inter', anchor: opts.anchor || 'start', ls: opts.ls || 0, opacity: opts.opacity ?? 1 };
}
function circle(cx, cy, r, fill, opts = {}) {
  return { type: 'circle', cx, cy, r, fill, opacity: opts.opacity ?? 1, stroke: opts.stroke || null, sw: opts.sw || 1 };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return { type: 'line', x1, y1, x2, y2, stroke, sw: opts.sw || 1, opacity: opts.opacity ?? 1 };
}

// Palette - Electric Bioluminescence (dark)
const P = {
  bg:      '#070B12',
  surf:    '#0C1220',
  card:    '#111A2E',
  card2:   '#0F1628',
  acc:     '#00F5C3',  // bioluminescent teal
  acc2:    '#A855F7',  // electric violet
  acc3:    '#F59E0B',  // amber glow
  text:    '#E2EBF9',
  muted:   '#6B7FA6',
  border:  '#1E2E4A',
  glow:    '#00F5C3',
  warn:    '#F87171',
};

// --- Screen helpers ---
function statusBar(elements) {
  elements.push(rect(0, 0, W, 44, P.bg));
  elements.push(text(20, 28, '9:41', 14, P.text, { fw: 600 }));
  elements.push(text(340, 28, '●●●', 14, P.muted, { anchor: 'end' }));
}

function navBar(elements, activeIdx = 0) {
  const icons = ['⌂', '◎', '⟳', '⚡', '◉'];
  const labels = ['State', 'Focus', 'Rest', 'Flow', 'You'];
  elements.push(rect(0, H - 80, W, 80, P.surf));
  elements.push(line(0, H - 80, W, H - 80, P.border, { sw: 1 }));
  icons.forEach((icon, i) => {
    const x = 39 + i * 78;
    const isActive = i === activeIdx;
    if (isActive) {
      elements.push(rect(x - 24, H - 78, 48, 36, P.acc + '18', { rx: 12 }));
    }
    elements.push(text(x, H - 52, icon, 18, isActive ? P.acc : P.muted, { anchor: 'middle' }));
    elements.push(text(x, H - 28, labels[i], 10, isActive ? P.acc : P.muted, { anchor: 'middle', fw: isActive ? 600 : 400 }));
  });
}

function screenBg(elements) {
  elements.push(rect(0, 0, W, H, P.bg));
  // ambient glows
  elements.push(circle(195, 280, 160, P.acc, { opacity: 0.04 }));
  elements.push(circle(320, 480, 120, P.acc2, { opacity: 0.05 }));
  elements.push(circle(60, 600, 80, P.acc3, { opacity: 0.04 }));
}

function card(elements, x, y, w, h, opts = {}) {
  elements.push(rect(x, y, w, h, P.card, { rx: opts.rx ?? 16, opacity: opts.opacity ?? 1, stroke: opts.border ? P.border : null, sw: 1 }));
  if (opts.glowColor) {
    elements.push(rect(x, y, w, 2, opts.glowColor, { rx: 0, opacity: 0.9 }));
  }
}

// --- SCREEN 1: Neural State (Dashboard) ---
function screen1() {
  const els = [];
  screenBg(els);
  statusBar(els);

  // Header
  els.push(text(20, 68, 'NURA', 13, P.acc, { fw: 700, ls: 4 }));
  els.push(text(W - 20, 68, '✦', 16, P.muted, { anchor: 'end' }));
  els.push(text(20, 92, 'Neural State', 22, P.text, { fw: 700 }));
  els.push(text(20, 114, 'Thursday, Apr 10', 13, P.muted));

  // Big neural score ring
  els.push(circle(195, 226, 82, P.card, { opacity: 1 }));
  els.push(circle(195, 226, 82, 'none', { stroke: P.border, sw: 2 }));
  // arc fill (teal glow arc) - simulate with overlapping arcs
  for (let i = 0; i < 6; i++) {
    els.push(circle(195, 226, 72, 'none', { stroke: P.acc, sw: 4, opacity: 0.15 + i * 0.04 }));
  }
  els.push(circle(195, 226, 72, 'none', { stroke: P.acc, sw: 4, opacity: 0.9 }));
  els.push(text(195, 218, '87', 36, P.text, { fw: 800, anchor: 'middle' }));
  els.push(text(195, 238, 'FOCUS', 10, P.acc, { fw: 700, anchor: 'middle', ls: 3 }));
  els.push(text(195, 254, 'Excellent', 12, P.muted, { anchor: 'middle' }));

  // Outer ring glow dots
  els.push(circle(195, 144, 6, P.acc, { opacity: 0.9 }));
  els.push(circle(277, 226, 6, P.acc2, { opacity: 0.7 }));
  els.push(circle(113, 226, 6, P.acc3, { opacity: 0.7 }));

  // State pillars row
  const pillars = [
    { label: 'COGNITION', val: '91', color: P.acc },
    { label: 'ENERGY', val: '74', color: P.acc3 },
    { label: 'STRESS', val: '23', color: P.warn },
  ];
  pillars.forEach((p, i) => {
    const x = 20 + i * 120;
    card(els, x, 328, 110, 72, { rx: 14, glowColor: p.color });
    els.push(text(x + 14, 358, p.val, 24, p.color, { fw: 800 }));
    els.push(text(x + 14, 378, p.label, 9, P.muted, { fw: 600, ls: 1 }));
  });

  // Active session card
  card(els, 20, 416, W - 40, 90, { rx: 16, glowColor: P.acc });
  els.push(text(36, 444, '● ACTIVE SESSION', 11, P.acc, { fw: 700, ls: 2 }));
  els.push(text(36, 466, 'Deep Work · Design Review', 15, P.text, { fw: 600 }));
  els.push(text(36, 486, 'Started 1h 24m ago', 12, P.muted));
  els.push(text(W - 36, 466, '►', 20, P.acc, { anchor: 'end' }));

  // Today's rhythm section
  els.push(text(20, 526, "Today's Rhythm", 14, P.text, { fw: 700 }));
  // Bars
  const hours = [0.3, 0.5, 0.9, 0.85, 0.7, 0.4, 0.6, 0.8, 0.92, 0.75, 0.55, 0.3];
  const now = 8; // current hour index
  hours.forEach((h, i) => {
    const bx = 20 + i * 29;
    const bh = h * 60;
    const isNow = i === now;
    const col = isNow ? P.acc : i < now ? P.acc + '80' : P.border;
    els.push(rect(bx, 540 + (60 - bh), 20, bh, col, { rx: 4, opacity: isNow ? 1 : 0.7 }));
    if (i % 3 === 0) {
      els.push(text(bx + 10, 612, `${7 + i}a`, 8, P.muted, { anchor: 'middle' }));
    }
  });
  if (hours[now]) {
    els.push(circle(20 + now * 29 + 10, 540 + (60 - hours[now] * 60), 4, P.acc));
  }

  // Insights strip
  card(els, 20, 630, W - 40, 56, { rx: 12 });
  els.push(text(36, 655, '✦', 14, P.acc2));
  els.push(text(56, 655, 'Your peak focus hits at 10–11am', 13, P.text, { fw: 500 }));
  els.push(text(56, 671, 'Schedule deep work then', 11, P.muted));

  navBar(els, 0);

  return { name: 'Neural State', elements: els };
}

// --- SCREEN 2: Focus Session ---
function screen2() {
  const els = [];
  screenBg(els);
  statusBar(els);

  els.push(text(20, 68, '← Back', 13, P.muted));
  els.push(text(195, 68, 'FOCUS SESSION', 12, P.acc, { fw: 700, anchor: 'middle', ls: 3 }));

  // Timer ring (large)
  els.push(circle(195, 220, 100, P.card));
  els.push(circle(195, 220, 100, 'none', { stroke: P.border, sw: 2 }));
  // progress arc
  for (let i = 0; i < 5; i++) {
    els.push(circle(195, 220, 88, 'none', { stroke: P.acc, sw: 6, opacity: 0.1 + i * 0.05 }));
  }
  els.push(circle(195, 220, 88, 'none', { stroke: P.acc, sw: 6, opacity: 0.95 }));
  // inner
  els.push(circle(195, 220, 72, P.bg));
  els.push(text(195, 210, '24:18', 32, P.text, { fw: 800, anchor: 'middle' }));
  els.push(text(195, 234, 'remaining', 12, P.muted, { anchor: 'middle' }));

  // Session label
  els.push(text(195, 344, 'Deep Work', 18, P.text, { fw: 700, anchor: 'middle' }));
  els.push(text(195, 366, 'Interval 2 of 4 · 90 min total', 12, P.muted, { anchor: 'middle' }));

  // Live biometrics
  const metrics = [
    { label: 'HRV', val: '58ms', sub: '↑ Optimal', col: P.acc },
    { label: 'FLOW', val: '94%', sub: 'In the zone', col: P.acc2 },
    { label: 'DRIFT', val: 'Low', sub: 'Attention stable', col: P.acc3 },
  ];
  metrics.forEach((m, i) => {
    const x = 20 + i * 118;
    card(els, x, 390, 108, 80, { rx: 14, glowColor: m.col });
    els.push(text(x + 14, 418, m.val, 20, m.col, { fw: 800 }));
    els.push(text(x + 14, 436, m.label, 10, P.muted, { fw: 600, ls: 1 }));
    els.push(text(x + 14, 454, m.sub, 10, P.muted));
  });

  // Distraction log
  els.push(text(20, 492, 'Distraction Log', 14, P.text, { fw: 700 }));
  const distractions = [
    { time: '10:14am', label: 'Phone pickup', dur: '8s' },
    { time: '10:31am', label: 'Tab switch', dur: '22s' },
    { time: '10:47am', label: 'Notification glance', dur: '3s' },
  ];
  distractions.forEach((d, i) => {
    const y = 514 + i * 46;
    card(els, 20, y, W - 40, 38, { rx: 10 });
    els.push(circle(36, y + 19, 4, P.warn, { opacity: 0.8 }));
    els.push(text(52, y + 22, d.label, 13, P.text));
    els.push(text(W - 36, y + 16, d.time, 10, P.muted, { anchor: 'end' }));
    els.push(text(W - 36, y + 30, d.dur, 10, P.warn, { anchor: 'end' }));
  });

  // Focus wave (sparkline)
  els.push(text(20, 658, 'Focus Intensity', 13, P.muted, { fw: 600 }));
  const wave = [0.5, 0.6, 0.75, 0.88, 0.92, 0.9, 0.87, 0.93, 0.89, 0.84, 0.9, 0.94];
  wave.forEach((v, i) => {
    if (i < wave.length - 1) {
      const x1 = 20 + i * 29, y1 = 700 - v * 40;
      const x2 = 20 + (i + 1) * 29, y2 = 700 - wave[i + 1] * 40;
      els.push(line(x1, y1, x2, y2, P.acc, { sw: 2, opacity: 0.9 }));
      els.push(circle(x1, y1, 3, P.acc, { opacity: 0.8 }));
    }
  });

  // End session button
  card(els, 20, 722, W - 40, 46, { rx: 23, glowColor: P.acc });
  els.push(text(195, 750, '⏸ Pause Session', 14, P.text, { fw: 600, anchor: 'middle' }));

  navBar(els, 1);

  return { name: 'Focus Session', elements: els };
}

// --- SCREEN 3: Rest & Recovery ---
function screen3() {
  const els = [];
  screenBg(els);
  statusBar(els);

  els.push(text(20, 68, 'NURA', 13, P.acc, { fw: 700, ls: 4 }));
  els.push(text(20, 92, 'Rest & Recovery', 22, P.text, { fw: 700 }));
  els.push(text(20, 114, 'Last night · 7h 34m', 13, P.muted));

  // Sleep quality score
  card(els, 20, 130, W - 40, 120, { rx: 18, glowColor: P.acc2 });
  // Moon icon area
  els.push(circle(70, 190, 32, P.acc2 + '22'));
  els.push(text(70, 197, '☽', 28, P.acc2, { anchor: 'middle' }));
  els.push(text(130, 170, 'Sleep Score', 12, P.muted));
  els.push(text(130, 196, '82', 34, P.text, { fw: 800 }));
  els.push(text(130, 220, 'Good · +4 from avg', 12, P.acc, { fw: 500 }));
  // mini bar
  const stages = [
    { w: 30, col: P.border },   // awake
    { w: 60, col: P.acc2 + '60' },  // light
    { w: 100, col: P.acc2 },   // deep
    { w: 80, col: P.acc },     // REM
    { w: 40, col: P.acc2 + '60' },
    { w: 30, col: P.border },
  ];
  let bx = 130;
  stages.forEach(s => {
    els.push(rect(bx, 232, s.w, 8, s.col, { rx: 4 }));
    bx += s.w + 2;
  });

  // Sleep stages breakdown
  els.push(text(20, 272, 'Sleep Stages', 14, P.text, { fw: 700 }));
  const stageData = [
    { name: 'Deep Sleep', dur: '1h 48m', pct: 24, col: P.acc2 },
    { name: 'REM', dur: '1h 56m', pct: 26, col: P.acc },
    { name: 'Light', dur: '3h 12m', pct: 42, col: P.acc2, opacity: 0.5 },
    { name: 'Awake', dur: '38m', pct: 8, col: P.warn },
  ];
  stageData.forEach((s, i) => {
    const y = 292 + i * 52;
    card(els, 20, y, W - 40, 44, { rx: 12 });
    els.push(rect(20, y, 4, 44, s.col, { rx: 2, opacity: s.opacity || 1 }));
    els.push(text(36, y + 18, s.name, 13, P.text, { fw: 600 }));
    els.push(text(36, y + 34, s.dur, 11, P.muted));
    // mini progress
    els.push(rect(W - 120, y + 20, 80, 6, P.border, { rx: 3 }));
    els.push(rect(W - 120, y + 20, s.pct * 0.8, 6, s.col, { rx: 3, opacity: s.opacity || 1 }));
    els.push(text(W - 30, y + 26, `${s.pct}%`, 11, P.muted, { anchor: 'end' }));
  });

  // Recovery recommendations
  els.push(text(20, 512, 'Recovery Actions', 14, P.text, { fw: 700 }));
  const recs = [
    { icon: '⚡', text: 'Take a 20-min power nap at 2pm', tag: 'Today' },
    { icon: '◎', text: 'Start wind-down routine by 10pm', tag: 'Tonight' },
    { icon: '✦', text: 'Hydrate +500ml before deep work', tag: 'Now' },
  ];
  recs.forEach((r, i) => {
    const y = 532 + i * 58;
    card(els, 20, y, W - 40, 50, { rx: 14, glowColor: i === 0 ? P.acc : null });
    els.push(text(38, y + 22, r.icon, 16, i === 0 ? P.acc : P.muted));
    els.push(text(62, y + 20, r.text, 13, P.text, { fw: 500 }));
    els.push(text(62, y + 36, r.tag, 11, P.muted));
    const tagCol = i === 0 ? P.acc : P.muted;
    els.push(rect(W - 70, y + 14, 42, 20, tagCol + '22', { rx: 10 }));
    els.push(text(W - 49, y + 28, r.tag, 10, tagCol, { anchor: 'middle', fw: 600 }));
  });

  // HRV trend
  els.push(text(20, 710, '7-day HRV Trend', 13, P.muted, { fw: 600 }));
  const hrv = [52, 55, 48, 58, 61, 57, 58];
  hrv.forEach((v, i) => {
    if (i < hrv.length - 1) {
      const x1 = 20 + i * 50, y1 = 750 - (v - 45) * 3;
      const x2 = 20 + (i + 1) * 50, y2 = 750 - (hrv[i + 1] - 45) * 3;
      els.push(line(x1, y1, x2, y2, P.acc2, { sw: 2 }));
      els.push(circle(x1, y1, 4, P.acc2, { opacity: 0.8 }));
    }
    els.push(text(20 + i * 50, 765, hrv[i], 10, P.muted, { anchor: 'middle' }));
  });

  navBar(els, 2);

  return { name: 'Rest & Recovery', elements: els };
}

// --- SCREEN 4: Flow Intelligence ---
function screen4() {
  const els = [];
  screenBg(els);
  statusBar(els);

  els.push(text(20, 68, 'NURA', 13, P.acc, { fw: 700, ls: 4 }));
  els.push(text(20, 92, 'Flow Intelligence', 22, P.text, { fw: 700 }));
  els.push(text(20, 114, 'AI patterns from 42 sessions', 13, P.muted));

  // Flow score hero card
  card(els, 20, 130, W - 40, 106, { rx: 18, glowColor: P.acc });
  els.push(text(36, 158, 'Flow Frequency', 12, P.muted));
  els.push(text(36, 188, '3.2×', 38, P.acc, { fw: 900 }));
  els.push(text(36, 212, 'flow states / week · Top 8% of users', 12, P.muted));
  // sparkline inline
  const spk = [0.4, 0.6, 0.5, 0.8, 0.7, 0.9, 0.85, 0.95, 1.0, 0.88];
  spk.forEach((v, i) => {
    if (i < spk.length - 1) {
      els.push(line(W - 130 + i * 13, 200 - v * 30, W - 130 + (i + 1) * 13, 200 - spk[i + 1] * 30, P.acc, { sw: 2 }));
    }
  });

  // Top flow conditions
  els.push(text(20, 256, 'Your Flow Triggers', 14, P.text, { fw: 700 }));
  const triggers = [
    { rank: '01', label: '10–11am sessions', score: 94, icon: '☀' },
    { rank: '02', label: 'Music on, no notifications', score: 88, icon: '♪' },
    { rank: '03', label: 'After 20-min warm-up', score: 82, icon: '⟳' },
    { rank: '04', label: '90-min blocks only', score: 76, icon: '◎' },
  ];
  triggers.forEach((t, i) => {
    const y = 276 + i * 58;
    card(els, 20, y, W - 40, 50, { rx: 14 });
    els.push(text(36, y + 20, t.rank, 11, P.acc, { fw: 700, ls: 2 }));
    els.push(text(36, y + 36, t.icon, 18, P.acc));
    els.push(text(68, y + 22, t.label, 14, P.text, { fw: 600 }));
    els.push(text(68, y + 38, `${t.score}% correlation`, 11, P.muted));
    els.push(rect(W - 80, y + 20, 52, 14, P.acc + '22', { rx: 7 }));
    els.push(text(W - 54, y + 30, `${t.score}%`, 11, P.acc, { anchor: 'middle', fw: 700 }));
  });

  // AI Recommendation
  card(els, 20, 516, W - 40, 90, { rx: 16, glowColor: P.acc2 });
  els.push(text(36, 540, '✦ AI INSIGHT', 11, P.acc2, { fw: 700, ls: 2 }));
  els.push(text(36, 562, 'Schedule deep work at 10am', 16, P.text, { fw: 700 }));
  els.push(text(36, 582, 'with music and 90-min blocks for', 13, P.muted));
  els.push(text(36, 598, 'maximum flow probability (91%).', 13, P.muted));

  // Weekly heatmap
  els.push(text(20, 626, 'Flow Heatmap', 14, P.text, { fw: 700 }));
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const timeSlots = 6;
  days.forEach((d, di) => {
    els.push(text(28 + di * 50, 648, d, 11, P.muted, { anchor: 'middle' }));
    for (let ti = 0; ti < timeSlots; ti++) {
      const intensity = Math.random();
      const col = intensity > 0.7 ? P.acc : intensity > 0.4 ? P.acc + '66' : P.border;
      els.push(rect(10 + di * 50, 656 + ti * 14, 38, 11, col, { rx: 3, opacity: 0.8 }));
    }
  });
  els.push(text(20, 750, '6am', 9, P.muted));
  els.push(text(20, 736, '8am', 9, P.muted));
  els.push(text(20, 722, '10am', 9, P.muted));
  els.push(text(20, 708, '12pm', 9, P.muted));
  els.push(text(20, 694, '2pm', 9, P.muted));
  els.push(text(20, 680, '4pm', 9, P.muted));

  navBar(els, 3);

  return { name: 'Flow Intelligence', elements: els };
}

// --- SCREEN 5: Insights Feed ---
function screen5() {
  const els = [];
  screenBg(els);
  statusBar(els);

  els.push(text(20, 68, 'NURA', 13, P.acc, { fw: 700, ls: 4 }));
  els.push(text(20, 92, 'Insights', 22, P.text, { fw: 700 }));
  els.push(text(20, 114, 'AI-generated from your data', 13, P.muted));

  // Featured insight (large card)
  card(els, 20, 130, W - 40, 150, { rx: 20, glowColor: P.acc2 });
  els.push(rect(20, 130, W - 40, 60, P.acc2 + '18', { rx: 20 }));
  els.push(text(36, 160, '✦ WEEKLY PATTERN', 11, P.acc2, { fw: 700, ls: 2 }));
  els.push(text(36, 185, 'You do 40% better work', 20, P.text, { fw: 800 }));
  els.push(text(36, 207, 'after a recovery break', 20, P.text, { fw: 800 }));
  els.push(text(36, 232, 'Sessions after 15min rest → avg 91 focus vs 64 without.', 12, P.muted));
  els.push(text(36, 248, 'Try building in micro-breaks every 90 mins.', 12, P.muted));
  els.push(rect(36, 260, 74, 12, P.acc + '33', { rx: 6 }));
  els.push(text(73, 269, 'Performance', 9, P.acc, { anchor: 'middle' }));
  els.push(rect(118, 260, 60, 12, P.acc2 + '33', { rx: 6 }));
  els.push(text(148, 269, 'Recovery', 9, P.acc2, { anchor: 'middle' }));

  // Insight cards feed
  const insights = [
    {
      type: 'TREND', col: P.acc,
      title: 'Peak hours shifting later',
      body: 'Your best focus window moved from 9am → 10:30am this month.',
      tags: ['Circadian', 'Focus'],
    },
    {
      type: 'ALERT', col: P.warn,
      title: 'Stress spike on Fridays',
      body: 'HRV drops 18% on Fridays. Consider lighter scheduling.',
      tags: ['Stress', 'Recovery'],
    },
    {
      type: 'WIN', col: P.acc3,
      title: 'New personal best',
      body: '4.1h of flow this week — your longest streak in 3 months.',
      tags: ['Flow', 'Milestone'],
    },
  ];
  insights.forEach((ins, i) => {
    const y = 298 + i * 138;
    card(els, 20, y, W - 40, 128, { rx: 16, glowColor: ins.col });
    els.push(rect(36, y + 16, 50, 14, ins.col + '33', { rx: 7 }));
    els.push(text(61, y + 26, ins.type, 9, ins.col, { anchor: 'middle', fw: 700, ls: 1 }));
    els.push(text(36, y + 46, ins.title, 15, P.text, { fw: 700 }));
    els.push(text(36, y + 66, ins.body, 12, P.muted));
    els.push(text(36, y + 84, ins.body.length > 50 ? '' : '', 12, P.muted));
    ins.tags.forEach((tag, ti) => {
      const tx = 36 + ti * 72;
      els.push(rect(tx, y + 102, 64, 16, P.border, { rx: 8 }));
      els.push(text(tx + 32, y + 113, tag, 9, P.muted, { anchor: 'middle' }));
    });
  });

  navBar(els, 0);

  return { name: 'Insights', elements: els };
}

// --- SCREEN 6: Profile & Goals ---
function screen6() {
  const els = [];
  screenBg(els);
  statusBar(els);

  els.push(text(20, 68, 'NURA', 13, P.acc, { fw: 700, ls: 4 }));
  els.push(text(20, 92, 'Profile', 22, P.text, { fw: 700 }));

  // Avatar + stats
  card(els, 20, 114, W - 40, 100, { rx: 18 });
  els.push(circle(68, 164, 32, P.acc + '22'));
  els.push(text(68, 171, 'A', 28, P.acc, { fw: 800, anchor: 'middle' }));
  els.push(text(116, 154, 'Alex Rivera', 17, P.text, { fw: 700 }));
  els.push(text(116, 172, 'Cognitive Athlete · Level 7', 12, P.acc));
  els.push(text(116, 190, '42 sessions · 164h logged', 11, P.muted));
  // XP bar
  els.push(rect(116, 200, W - 156, 6, P.border, { rx: 3 }));
  els.push(rect(116, 200, (W - 156) * 0.72, 6, P.acc2, { rx: 3 }));
  els.push(text(W - 36, 207, 'Lv8', 10, P.muted, { anchor: 'end' }));

  // Weekly goals
  els.push(text(20, 236, 'Weekly Goals', 14, P.text, { fw: 700 }));
  const goals = [
    { label: 'Deep work hours', current: 11.2, target: 15, unit: 'h', col: P.acc },
    { label: 'Flow sessions', current: 3, target: 4, unit: '', col: P.acc2 },
    { label: 'Sleep score avg', current: 79, target: 85, unit: '', col: P.acc3 },
    { label: 'Stress-free days', current: 4, target: 5, unit: '', col: P.warn },
  ];
  goals.forEach((g, i) => {
    const y = 256 + i * 62;
    card(els, 20, y, W - 40, 54, { rx: 14 });
    els.push(text(36, y + 20, g.label, 13, P.text, { fw: 600 }));
    els.push(text(36, y + 38, `${g.current}${g.unit} of ${g.target}${g.unit}`, 11, P.muted));
    const pct = Math.min(g.current / g.target, 1);
    els.push(rect(W - 150, y + 21, 110, 6, P.border, { rx: 3 }));
    els.push(rect(W - 150, y + 21, 110 * pct, 6, g.col, { rx: 3 }));
    els.push(text(W - 34, y + 28, `${Math.round(pct * 100)}%`, 11, g.col, { anchor: 'end', fw: 700 }));
  });

  // Streaks
  els.push(text(20, 510, 'Streaks', 14, P.text, { fw: 700 }));
  const streaks = [
    { icon: '🔥', label: 'Focus streak', val: '14 days' },
    { icon: '⚡', label: 'Sleep consistency', val: '6 days' },
    { icon: '✦', label: 'Flow sessions', val: '4 weeks' },
  ];
  streaks.forEach((s, i) => {
    const x = 20 + i * 118;
    card(els, x, 530, 108, 80, { rx: 14 });
    els.push(text(x + 54, 558, s.icon, 20, P.acc, { anchor: 'middle' }));
    els.push(text(x + 54, 578, s.val, 14, P.text, { fw: 800, anchor: 'middle' }));
    els.push(text(x + 54, 596, s.label, 9, P.muted, { anchor: 'middle' }));
  });

  // Settings row
  const settings = ['Integrations', 'Notifications', 'Data Export', 'About NURA'];
  settings.forEach((s, i) => {
    const y = 628 + i * 44;
    card(els, 20, y, W - 40, 36, { rx: 10 });
    els.push(text(36, y + 22, s, 13, P.text));
    els.push(text(W - 36, y + 22, '›', 16, P.muted, { anchor: 'end' }));
    if (i < settings.length - 1) {
      els.push(line(36, y + 36, W - 36, y + 36, P.border, { sw: 0.5 }));
    }
  });

  navBar(els, 4);

  return { name: 'Profile', elements: els };
}

// --- Assemble ---
const screens = [screen1(), screen2(), screen3(), screen4(), screen5(), screen6()];
const totalElements = screens.reduce((sum, s) => sum + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    tagline: TAGLINE,
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'dark',
    heartbeat: 'Apr-10-2026',
    palette: 'Electric Bioluminescence',
    inspiration: 'Godly.website — frosted glassmorphism + bioluminescent teal/violet palettes',
    elements: totalElements,
    screens: screens.length,
  },
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
