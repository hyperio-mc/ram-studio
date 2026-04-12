'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'vita';
const NAME = 'VITA';
const TAGLINE = 'Daily longevity, made ritual';
const W = 390, H = 844;

// Palette — warm cream light theme
// Inspired by health tech + longevity surge on lapa.ninja / land-book
// Editorial minimalism from minimal.gallery: warm off-whites, sage + terracotta
const C = {
  bg:       '#FAF7F2',  // warm cream
  surf:     '#FFFFFF',  // card surface
  card:     '#F0EDE8',  // secondary card
  text:     '#1C1917',  // warm near-black
  sub:      '#78716C',  // muted brown-gray
  muted:    '#A8A29E',  // lighter muted
  accent:   '#5A7A5A',  // sage green — longevity/nature
  accent2:  '#B87350',  // terracotta — warmth/earth
  gold:     '#C9973E',  // warm gold — achievement
  divider:  '#E8E4DE',  // subtle divider
  tag:      '#EAE6E0',  // tag background
  prog:     '#E8F0E8',  // progress track (light sage)
  ring:     '#D4EDD4',  // ring track
  sleep:    '#8B9FBE',  // sleep blue
  sleepBg:  '#EEF1F7',  // sleep background
};

let elementCount = 0;

function rect(x, y, w, h, fill, opts = {}) {
  elementCount++;
  const rx = opts.rx ?? 0;
  const opacity = opts.opacity ?? 1;
  const stroke = opts.stroke ?? 'none';
  const sw = opts.sw ?? 0;
  const extra = opts.extra ?? '';
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" rx="${rx}" opacity="${opacity}"${stroke !== 'none' ? ` stroke="${stroke}" stroke-width="${sw}"` : ''} ${extra}/>`;
}

function text(x, y, content, size, fill, opts = {}) {
  elementCount++;
  const fw = opts.fw ?? '400';
  const anchor = opts.anchor ?? 'start';
  const opacity = opts.opacity ?? 1;
  const ls = opts.ls ?? '0';
  const font = opts.font ?? 'system-ui, -apple-system, sans-serif';
  const style = opts.style ?? '';
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${fw}" text-anchor="${anchor}" opacity="${opacity}" letter-spacing="${ls}" font-family="${font}" style="${style}">${content}</text>`;
}

function circle(cx, cy, r, fill, opts = {}) {
  elementCount++;
  const opacity = opts.opacity ?? 1;
  const stroke = opts.stroke ?? 'none';
  const sw = opts.sw ?? 0;
  const extra = opts.extra ?? '';
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${opacity}"${stroke !== 'none' ? ` stroke="${stroke}" stroke-width="${sw}"` : ''} ${extra}/>`;
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  elementCount++;
  const sw = opts.sw ?? 1;
  const opacity = opts.opacity ?? 1;
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}" stroke-linecap="round"/>`;
}

function arc(cx, cy, r, startDeg, endDeg, stroke, sw) {
  elementCount++;
  const toRad = d => (d - 90) * Math.PI / 180;
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(endDeg));
  const y2 = cy + r * Math.sin(toRad(endDeg));
  const large = (endDeg - startDeg) > 180 ? 1 : 0;
  return `<path d="M${x1.toFixed(2)} ${y1.toFixed(2)} A${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}" stroke="${stroke}" stroke-width="${sw}" fill="none" stroke-linecap="round"/>`;
}

function pill(x, y, w, h, fill, textContent, textColor, opts = {}) {
  elementCount++;
  const rx = opts.rx ?? (h / 2);
  const fs = opts.fs ?? 11;
  const fw = opts.fw ?? '500';
  return rect(x, y, w, h, fill, { rx }) + text(x + w/2, y + h/2 + fs*0.35, textContent, fs, textColor, { anchor: 'middle', fw });
}

// ── STATUS BAR ────────────────────────────────────────────────────────────────
function statusBar(timeStr = '9:41') {
  return [
    rect(0, 0, W, 44, C.bg),
    text(20, 28, timeStr, 14, C.text, { fw: '600' }),
    // battery icon
    rect(348, 16, 28, 14, 'none', { rx: 3, stroke: C.text, sw: 1.5, opacity: 0.5 }),
    rect(376, 20, 3, 6, C.text, { rx: 1, opacity: 0.5 }),
    rect(350, 18, 22, 10, C.accent, { rx: 2, opacity: 0.7 }),
    // signal dots
    circle(334, 23, 2, C.text, { opacity: 0.5 }),
    circle(326, 23, 2, C.text, { opacity: 0.35 }),
    circle(318, 23, 2, C.text, { opacity: 0.2 }),
  ].join('');
}

// ── BOTTOM NAV ────────────────────────────────────────────────────────────────
function bottomNav(active) {
  const tabs = [
    { id: 'today', label: 'Today', icon: 'sun', x: 39 },
    { id: 'rituals', label: 'Rituals', icon: 'ritual', x: 117 },
    { id: 'nourish', label: 'Nourish', icon: 'leaf', x: 195 },
    { id: 'sleep', label: 'Sleep', icon: 'moon', x: 273 },
    { id: 'insights', label: 'Insights', icon: 'chart', x: 351 },
  ];

  const navIcons = {
    sun: (x, y, c) => [
      circle(x, y-3, 5, c),
      ...[0,45,90,135,180,225,270,315].map(d => {
        const r = d * Math.PI / 180;
        return line(x + Math.cos(r)*7, y-3 + Math.sin(r)*7, x + Math.cos(r)*9, y-3 + Math.sin(r)*9, c, { sw: 1.5 });
      })
    ].join(''),
    ritual: (x, y, c) => [
      rect(x-7, y-10, 14, 16, c, { rx: 2, opacity: 0.9 }),
      line(x-4, y-6, x+4, y-6, C.surf, { sw: 1.5 }),
      line(x-4, y-2, x+4, y-2, C.surf, { sw: 1.5 }),
      line(x-4, y+2, x+2, y+2, C.surf, { sw: 1.5 }),
    ].join(''),
    leaf: (x, y, c) => {
      elementCount += 2;
      return `<path d="M${x} ${y+6} C${x-10} ${y-4} ${x-8} ${y-12} ${x} ${y-12} C${x+8} ${y-12} ${x+10} ${y-4} ${x} ${y+6}Z" fill="${c}"/>` +
             `<line x1="${x}" y1="${y+6}" x2="${x}" y2="${y-8}" stroke="${C.surf}" stroke-width="1.5"/>`;
    },
    moon: (x, y, c) => {
      elementCount++;
      return `<path d="M${x-5} ${y-3} A7 7 0 0 0 ${x+5} ${y-3} A4 4 0 0 1 ${x-5} ${y-3}Z" fill="${c}"/>`;
    },
    chart: (x, y, c) => [
      rect(x-7, y+2, 4, 4, c),
      rect(x-2, y-2, 4, 8, c),
      rect(x+3, y-6, 4, 12, c),
    ].join(''),
  };

  const parts = [
    rect(0, H-80, W, 80, C.surf),
    line(0, H-80, W, H-80, C.divider, { sw: 0.5 }),
  ];

  tabs.forEach(tab => {
    const isActive = tab.id === active;
    const col = isActive ? C.accent : C.muted;
    parts.push(navIcons[tab.icon](tab.x, H-52, col));
    parts.push(text(tab.x, H-28, tab.label, 10, col, { anchor: 'middle', fw: isActive ? '600' : '400' }));
    if (isActive) {
      parts.push(rect(tab.x - 16, H-80, 32, 3, C.accent, { rx: 1.5 }));
    }
  });

  return parts.join('');
}

// ── SCREEN 1: TODAY ────────────────────────────────────────────────────────────
function screenToday() {
  const els = [];
  // Background
  els.push(rect(0, 0, W, H, C.bg));
  els.push(statusBar('9:41'));

  // Header
  els.push(text(20, 76, 'Good morning, Mara', 13, C.sub, { fw: '400' }));
  els.push(text(20, 100, 'Thursday, April 9', 20, C.text, { fw: '300', font: 'Georgia, "Times New Roman", serif' }));

  // Vitality Ring — main score
  const cx = 195, cy = 230, R = 70;
  // Ring track
  els.push(circle(cx, cy, R, 'none', { stroke: C.ring, sw: 10 }));
  // 78% progress arc
  els.push(arc(cx, cy, R, 0, 281, C.accent, 10));
  // Score
  els.push(text(cx, cy - 12, '78', 44, C.text, { anchor: 'middle', fw: '300', font: 'Georgia, serif' }));
  els.push(text(cx, cy + 12, 'Vitality', 12, C.sub, { anchor: 'middle' }));
  els.push(text(cx, cy + 30, 'Score', 12, C.sub, { anchor: 'middle' }));

  // Small metric rings below main score
  const miniRings = [
    { label: 'Movement', pct: 65, cx: 80, color: C.accent2 },
    { label: 'Sleep', pct: 82, cx: 195, color: C.sleep },
    { label: 'Nourish', pct: 71, cx: 310, color: C.gold },
  ];
  miniRings.forEach(m => {
    const mr = 24;
    els.push(circle(m.cx, cy + 110, mr, 'none', { stroke: C.ring, sw: 6 }));
    const deg = m.pct / 100 * 360;
    els.push(arc(m.cx, cy + 110, mr, 0, deg, m.color, 6));
    els.push(text(m.cx, cy + 114, `${m.pct}%`, 10, C.text, { anchor: 'middle', fw: '600' }));
    els.push(text(m.cx, cy + 148, m.label, 9, C.sub, { anchor: 'middle' }));
  });

  // Today's rituals section
  const rY = 395;
  els.push(text(20, rY, 'Today\'s Rituals', 13, C.text, { fw: '600', ls: '0.03em' }));
  els.push(text(W - 20, rY, '4 / 6', 12, C.sub, { anchor: 'end' }));
  els.push(line(20, rY + 10, W - 20, rY + 10, C.divider, { sw: 0.5 }));

  const rituals = [
    { name: 'Morning breathwork', time: '8:00 AM', done: true },
    { name: 'Cold exposure', time: '8:15 AM', done: true },
    { name: '30 min movement', time: '9:00 AM', done: true },
    { name: 'Protein breakfast', time: '9:30 AM', done: true },
    { name: 'Afternoon walk', time: '2:00 PM', done: false },
    { name: 'Evening journal', time: '9:00 PM', done: false },
  ];

  rituals.forEach((r, i) => {
    const ry = rY + 25 + i * 52;
    els.push(rect(16, ry, W - 32, 44, r.done ? C.prog : C.surf, { rx: 10 }));

    // Checkbox
    if (r.done) {
      els.push(rect(28, ry + 14, 16, 16, C.accent, { rx: 4 }));
      // checkmark
      els.push(line(31, ry + 22, 34, ry + 26, C.surf, { sw: 2 }));
      els.push(line(34, ry + 26, 40, ry + 18, C.surf, { sw: 2 }));
    } else {
      els.push(rect(28, ry + 14, 16, 16, 'none', { rx: 4, stroke: C.muted, sw: 1.5 }));
    }

    els.push(text(54, ry + 20, r.name, 13, r.done ? C.text : C.sub, { fw: r.done ? '500' : '400' }));
    els.push(text(54, ry + 34, r.time, 10, C.muted));
  });

  // Streak badge
  els.push(rect(W - 96, rY - 28, 76, 24, C.gold, { rx: 12, opacity: 0.15 }));
  els.push(text(W - 58, rY - 11, '🔥 14 day streak', 10, C.gold, { anchor: 'middle', fw: '600' }));

  els.push(bottomNav('today'));
  return els.join('');
}

// ── SCREEN 2: RITUALS ──────────────────────────────────────────────────────────
function screenRituals() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  els.push(statusBar());

  // Header
  els.push(text(20, 80, 'Your Ritual Stack', 22, C.text, { fw: '300', font: 'Georgia, serif' }));
  els.push(text(20, 102, '6 morning · 3 evening', 12));

  // Filter pills
  const filters = ['All', 'Morning', 'Evening', 'Weekly'];
  filters.forEach((f, i) => {
    const px = 20 + i * 76;
    const isActive = i === 0;
    els.push(rect(px, 115, 68, 26, isActive ? C.accent : C.tag, { rx: 13 }));
    els.push(text(px + 34, 132, f, 11, isActive ? C.surf : C.sub, { anchor: 'middle', fw: isActive ? '600' : '400' }));
  });

  // Ritual cards
  const rituals = [
    {
      icon: '◎', name: 'Breathwork', desc: 'Box breathing · 4-4-4-4',
      duration: '5 min', streak: 21, color: C.accent, tag: 'Morning',
    },
    {
      icon: '❄', name: 'Cold Exposure', desc: 'Cold shower or ice bath',
      duration: '3 min', streak: 14, color: C.sleep, tag: 'Morning',
    },
    {
      icon: '◉', name: 'Zone 2 Cardio', desc: 'Low-intensity aerobic',
      duration: '30 min', streak: 9, color: C.accent2, tag: 'Morning',
    },
    {
      icon: '✦', name: 'Sunlight', desc: '10 min outdoor light exposure',
      duration: '10 min', streak: 18, color: C.gold, tag: 'Morning',
    },
    {
      icon: '◈', name: 'Journaling', desc: 'Reflection + gratitude log',
      duration: '10 min', streak: 6, color: C.accent, tag: 'Evening',
    },
  ];

  rituals.forEach((r, i) => {
    const cy = 160 + i * 96;
    // Card
    els.push(rect(16, cy, W - 32, 84, C.surf, { rx: 14 }));
    // Color accent bar
    els.push(rect(16, cy, 4, 84, r.color, { rx: 2 }));

    // Icon circle
    els.push(circle(52, cy + 42, 20, r.color, { opacity: 0.12 }));
    els.push(text(52, cy + 47, r.icon, 14, r.color, { anchor: 'middle' }));

    // Text
    els.push(text(80, cy + 28, r.name, 15, C.text, { fw: '600' }));
    els.push(text(80, cy + 46, r.desc, 11));

    // Tags row
    els.push(rect(80, cy + 56, 46, 18, C.tag, { rx: 9 }));
    els.push(text(103, cy + 69, r.tag, 9, C.sub, { anchor: 'middle' }));
    els.push(rect(132, cy + 56, 46, 18, C.prog, { rx: 9 }));
    els.push(text(155, cy + 69, r.duration, 9, C.accent, { anchor: 'middle', fw: '500' }));

    // Streak
    els.push(text(W - 28, cy + 36, `${r.streak}`, 18, r.color, { anchor: 'end', fw: '700' }));
    els.push(text(W - 28, cy + 52, 'days', 9, C.muted, { anchor: 'end' }));
  });

  // Add new ritual button
  els.push(rect(16, 648, W - 32, 44, C.tag, { rx: 12 }));
  els.push(text(W/2, 675, '+ Add New Ritual', 13, C.accent, { anchor: 'middle', fw: '500' }));

  els.push(bottomNav('rituals'));
  return els.join('');
}

// ── SCREEN 3: NOURISH ─────────────────────────────────────────────────────────
function screenNourish() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  els.push(statusBar());

  els.push(text(20, 80, 'Nourishment', 22, C.text, { fw: '300', font: 'Georgia, serif' }));
  els.push(text(20, 102, 'Thursday · 1,840 kcal logged', 12));

  // Macro circles row
  const macros = [
    { name: 'Protein', val: 142, goal: 180, unit: 'g', pct: 79, color: C.accent2 },
    { name: 'Carbs', val: 168, goal: 220, unit: 'g', pct: 76, color: C.gold },
    { name: 'Fat', val: 72, goal: 80, unit: 'g', pct: 90, color: C.accent },
  ];

  const macroY = 142;
  els.push(rect(16, macroY, W - 32, 100, C.surf, { rx: 14 }));

  macros.forEach((m, i) => {
    const mcx = 78 + i * 90;
    const mr = 28;
    els.push(circle(mcx, macroY + 50, mr, 'none', { stroke: C.tag, sw: 7 }));
    const deg = m.pct / 100 * 360;
    els.push(arc(mcx, macroY + 50, mr, 0, deg > 0 ? deg : 1, m.color, 7));
    els.push(text(mcx, macroY + 44, `${m.val}`, 13, C.text, { anchor: 'middle', fw: '700' }));
    els.push(text(mcx, macroY + 58, m.unit, 9, C.muted, { anchor: 'middle' }));
    els.push(text(mcx, macroY + 90, m.name, 10, C.sub, { anchor: 'middle' }));
  });

  // Hydration bar
  els.push(text(20, 265, 'Hydration', 12, C.text, { fw: '600' }));
  els.push(text(W - 20, 265, '6 / 8 glasses', 11, C.sub, { anchor: 'end' }));
  els.push(rect(20, 274, W - 40, 8, C.tag, { rx: 4 }));
  els.push(rect(20, 274, (W - 40) * 0.75, 8, C.sleep, { rx: 4 }));
  // Water drop icons
  for (let i = 0; i < 8; i++) {
    const filled = i < 6;
    els.push(circle(34 + i * 42, 300, 10, filled ? C.sleep : C.tag, { opacity: filled ? 0.8 : 1 }));
    els.push(text(34 + i * 42, 304, '◆', 8, filled ? C.surf : C.muted, { anchor: 'middle' }));
  }

  // Meal log
  els.push(text(20, 335, 'Meals Today', 12, C.text, { fw: '600', ls: '0.03em' }));
  els.push(line(20, 345, W - 20, 345, C.divider, { sw: 0.5 }));

  const meals = [
    { time: '8:30', name: 'Breakfast', desc: 'Greek yogurt, berries, granola', kcal: 420, icon: '☀' },
    { time: '12:15', name: 'Lunch', desc: 'Salmon bowl, quinoa, avocado', kcal: 680, icon: '◑' },
    { time: '15:00', name: 'Snack', desc: 'Almonds + apple', kcal: 210, icon: '◇' },
    { time: '18:30', name: 'Dinner', desc: 'Chicken, sweet potato, greens', kcal: 530, icon: '◐' },
  ];

  meals.forEach((m, i) => {
    const my = 358 + i * 68;
    els.push(rect(16, my, W - 32, 60, C.surf, { rx: 12 }));

    // Time indicator
    els.push(text(32, my + 22, m.time, 10));
    els.push(text(32, my + 36, m.icon, 9, C.gold, { anchor: 'start' }));

    // Divider
    els.push(line(68, my + 12, 68, my + 48, C.divider, { sw: 1 }));

    els.push(text(80, my + 22, m.name, 13, C.text, { fw: '600' }));
    els.push(text(80, my + 38, m.desc, 10));
    els.push(text(W - 28, my + 30, `${m.kcal}`, 14, C.accent2, { anchor: 'end', fw: '700' }));
    els.push(text(W - 28, my + 44, 'kcal', 9, C.muted, { anchor: 'end' }));
  });

  // Log meal button
  els.push(rect(16, 634, W - 32, 44, C.accent2, { rx: 12, opacity: 0.12 }));
  els.push(text(W/2, 661, '+ Log Meal', 13, C.accent2, { anchor: 'middle', fw: '600' }));

  els.push(bottomNav('nourish'));
  return els.join('');
}

// ── SCREEN 4: SLEEP ────────────────────────────────────────────────────────────
function screenSleep() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  els.push(statusBar());

  els.push(text(20, 80, 'Sleep & Recovery', 22, C.text, { fw: '300', font: 'Georgia, serif' }));
  els.push(text(20, 102, 'Last night · Apr 8', 12));

  // Sleep score card
  els.push(rect(16, 118, W - 32, 100, C.surf, { rx: 16 }));
  // Big score
  els.push(text(80, 168, '84', 52, C.text, { anchor: 'middle', fw: '200', font: 'Georgia, serif' }));
  els.push(text(80, 190, '/100', 12, C.muted, { anchor: 'middle' }));
  els.push(text(130, 148, 'Sleep Score', 12));
  els.push(text(130, 167, '7h 22min', 22, C.text, { fw: '300' }));
  els.push(text(130, 184, 'Total sleep', 10));

  // Quality metrics row
  const sleepMetrics = [
    { label: 'Efficiency', val: '91%', color: C.accent },
    { label: 'Deep Sleep', val: '1h 48m', color: C.sleep },
    { label: 'REM', val: '1h 56m', color: C.accent2 },
    { label: 'Awake', val: '12 min', color: C.muted },
  ];
  els.push(rect(16, 228, W - 32, 58, C.card, { rx: 12 }));
  sleepMetrics.forEach((m, i) => {
    const mx = 42 + i * 88;
    els.push(text(mx, 252, m.val, 13, m.color, { anchor: 'middle', fw: '700' }));
    els.push(text(mx, 270, m.label, 9, C.muted, { anchor: 'middle' }));
    if (i < 3) els.push(line(mx + 44, 240, mx + 44, 278, C.divider, { sw: 0.5 }));
  });

  // Sleep stages graph
  els.push(text(20, 312, 'Sleep Stages', 13, C.text, { fw: '600' }));
  els.push(text(W - 20, 312, '11:00 PM → 6:22 AM', 10, C.muted, { anchor: 'end' }));

  const graphY = 326, graphH = 90, graphW = W - 40;
  els.push(rect(20, graphY, graphW, graphH, C.sleepBg, { rx: 10 }));

  // Stage bars — simulated sleep hypnogram
  const stages = [
    // [x_start, width, stage_height, color]
    [0, 35, 0.2, C.sleep],   // awake
    [35, 50, 0.7, C.sleep],  // light
    [85, 40, 0.95, '#5870A8'], // deep
    [125, 45, 0.75, C.sleep], // light
    [170, 35, 0.9, '#5870A8'], // deep
    [205, 55, 0.6, C.accent2], // REM
    [260, 40, 0.7, C.sleep], // light
    [300, 30, 0.5, C.accent2], // REM
  ];

  stages.forEach(([xr, wr, h, col]) => {
    const bh = graphH * h * 0.7;
    const by = graphY + (graphH - bh) / 2 + graphH * 0.05;
    els.push(rect(20 + xr, by, wr - 2, bh, col, { rx: 3, opacity: 0.7 }));
  });

  // Stage labels
  ['Awake', 'Light', 'Deep', 'REM'].forEach((s, i) => {
    const col = [C.muted, C.sleep, '#5870A8', C.accent2][i];
    els.push(circle(40 + i * 84, graphY + graphH + 18, 4, col));
    els.push(text(50 + i * 84, graphY + graphH + 22, s, 9));
  });

  // Recovery insights
  els.push(text(20, graphY + graphH + 50, 'Recovery Insights', 13, C.text, { fw: '600' }));
  els.push(line(20, graphY + graphH + 60, W - 20, graphY + graphH + 60, C.divider, { sw: 0.5 }));

  const insights = [
    { icon: '↑', text: 'HRV 52ms — Above your 7-day average', good: true },
    { icon: '→', text: 'Resting HR 58 bpm — Consistent', good: null },
    { icon: '↓', text: 'Late sleep onset — Try shifting by 30 min', good: false },
  ];

  insights.forEach((ins, i) => {
    const iy = graphY + graphH + 76 + i * 52;
    const col = ins.good === true ? C.accent : ins.good === false ? C.accent2 : C.muted;
    els.push(rect(16, iy, W - 32, 44, C.surf, { rx: 10 }));
    els.push(circle(38, iy + 22, 14, col, { opacity: 0.12 }));
    els.push(text(38, iy + 27, ins.icon, 14, col, { anchor: 'middle', fw: '700' }));
    els.push(text(60, iy + 26, ins.text, 11));
  });

  els.push(bottomNav('sleep'));
  return els.join('');
}

// ── SCREEN 5: INSIGHTS ─────────────────────────────────────────────────────────
function screenInsights() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  els.push(statusBar());

  els.push(text(20, 80, 'Longevity Insights', 22, C.text, { fw: '300', font: 'Georgia, serif' }));
  els.push(text(20, 102, 'Week of Apr 7 – 13', 12));

  // Weekly score trend line chart
  const chartY = 120, chartH = 100, chartW = W - 40;
  els.push(rect(16, chartY, W - 32, 120, C.surf, { rx: 14 }));
  els.push(text(30, chartY + 22, 'Vitality Trend', 12, C.text, { fw: '600' }));
  els.push(text(W - 30, chartY + 22, '↑ 8%', 12, C.accent, { anchor: 'end', fw: '600' }));

  // Chart bars
  const scores = [62, 71, 68, 75, 78, 73, 78];
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const barW = 28, barGap = (chartW - barW * 7) / 8;

  scores.forEach((s, i) => {
    const bx = 20 + barGap + i * (barW + barGap);
    const maxH = 60;
    const bh = (s / 100) * maxH;
    const by = chartY + 90 - bh;
    const isToday = i === 4;
    els.push(rect(bx, by, barW, bh, isToday ? C.accent : C.prog, { rx: 4 }));
    if (isToday) {
      els.push(rect(bx, by, barW, bh, C.accent, { rx: 4 }));
      els.push(text(bx + barW/2, by - 6, `${s}`, 9, C.accent, { anchor: 'middle', fw: '700' }));
    }
    els.push(text(bx + barW/2, chartY + 108, days[i], 9, isToday ? C.text : C.muted, { anchor: 'middle', fw: isToday ? '700' : '400' }));
  });

  // Biomarker cards 2x2
  const biomarkers = [
    { label: 'HRV', val: '52 ms', delta: '+6%', good: true, desc: 'Heart rate variability' },
    { label: 'Resting HR', val: '58 bpm', delta: '−2', good: true, desc: 'Beats per minute' },
    { label: 'VO2 Est.', val: '44.2', delta: '+0.8', good: true, desc: 'Aerobic capacity' },
    { label: 'Recovery', val: '76%', delta: '+4%', good: true, desc: 'Readiness score' },
  ];

  els.push(text(20, 262, 'Key Biomarkers', 13, C.text, { fw: '600', ls: '0.03em' }));

  biomarkers.forEach((b, i) => {
    const col = i % 2 === 0 ? 16 : W / 2 + 4;
    const row = Math.floor(i / 2);
    const by = 276 + row * 90;
    els.push(rect(col, by, W / 2 - 20, 80, C.surf, { rx: 12 }));
    els.push(text(col + 14, by + 22, b.label, 10));
    els.push(text(col + 14, by + 46, b.val, 20, C.text, { fw: '600' }));
    els.push(text(col + 14, by + 64, b.desc, 9));
    // Delta badge
    const badgeW = 36;
    els.push(rect(col + W/2 - 36 - 14, by + 12, badgeW, 18, C.prog, { rx: 9 }));
    els.push(text(col + W/2 - 36 - 14 + 18, by + 24, b.delta, 9, C.accent, { anchor: 'middle', fw: '600' }));
  });

  // Recommendations
  els.push(text(20, 470, 'This Week\'s Priorities', 13, C.text, { fw: '600', ls: '0.03em' }));
  els.push(line(20, 480, W - 20, 480, C.divider, { sw: 0.5 }));

  const recs = [
    { icon: '◎', title: 'Zone 2 Cardio', sub: '2 more sessions this week for VO2 gain', color: C.accent },
    { icon: '◑', title: 'Sleep Timing', sub: 'Aim for 10:30 PM bedtime consistently', color: C.sleep },
    { icon: '✦', title: 'Protein Intake', sub: 'Hit 160g+ today and tomorrow', color: C.accent2 },
  ];

  recs.forEach((r, i) => {
    const ry = 492 + i * 58;
    els.push(rect(16, ry, W - 32, 50, C.surf, { rx: 12 }));
    els.push(circle(38, ry + 25, 14, r.color, { opacity: 0.12 }));
    els.push(text(38, ry + 30, r.icon, 12, r.color, { anchor: 'middle' }));
    els.push(text(60, ry + 20, r.title, 13, C.text, { fw: '600' }));
    els.push(text(60, ry + 36, r.sub, 10));
  });

  els.push(bottomNav('insights'));
  return els.join('');
}

// ── SCREEN 6: PROFILE ─────────────────────────────────────────────────────────
function screenProfile() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  els.push(statusBar());

  // Avatar header
  els.push(rect(0, 44, W, 160, C.surf));
  // Warm gradient bar at top of profile
  els.push(rect(0, 44, W, 5, C.accent, { opacity: 0.6 }));
  els.push(rect(0, 44, W * 0.6, 5, C.gold, { opacity: 0.5 }));

  // Avatar circle
  els.push(circle(195, 110, 40, C.prog));
  els.push(circle(195, 110, 40, 'none', { stroke: C.accent, sw: 2.5, opacity: 0.4 }));
  els.push(text(195, 118, 'M', 28, C.accent, { anchor: 'middle', fw: '300', font: 'Georgia, serif' }));

  els.push(text(195, 168, 'Mara Holloway', 16, C.text, { anchor: 'middle', fw: '600' }));
  els.push(text(195, 186, 'Longevity Protocol · Week 12', 11, C.sub, { anchor: 'middle' }));

  // Stats row
  const stats = [
    { label: 'Day Streak', val: '14' },
    { label: 'Rituals Done', val: '83' },
    { label: 'Avg Score', val: '74' },
  ];
  const statY = 208;
  els.push(rect(16, statY, W - 32, 56, C.card, { rx: 12 }));
  stats.forEach((s, i) => {
    const sx = 65 + i * 106;
    els.push(text(sx, statY + 22, s.val, 20, C.text, { anchor: 'middle', fw: '700' }));
    els.push(text(sx, statY + 40, s.label, 9, C.sub, { anchor: 'middle' }));
    if (i < 2) els.push(line(sx + 52, statY + 12, sx + 52, statY + 44, C.divider, { sw: 0.5 }));
  });

  // Current Protocol
  els.push(text(20, 285, 'Active Protocol', 13, C.text, { fw: '600', ls: '0.03em' }));
  els.push(rect(16, 298, W - 32, 64, C.surf, { rx: 12 }));
  els.push(rect(16, 298, 4, 64, C.accent, { rx: 2 }));
  els.push(text(30, 322, 'Longevity Foundation', 14, C.text, { fw: '600' }));
  els.push(text(30, 340, '12 weeks · Intermediate · Dr. Attia Protocol', 10));
  els.push(text(W - 28, 316, '68%', 16, C.accent, { anchor: 'end', fw: '700' }));
  els.push(text(W - 28, 332, 'complete', 9, C.muted, { anchor: 'end' }));
  // Progress bar
  els.push(rect(28, 348, W - 60, 6, C.prog, { rx: 3 }));
  els.push(rect(28, 348, (W - 60) * 0.68, 6, C.accent, { rx: 3 }));

  // Goal tags
  els.push(text(20, 383, 'Goals', 13, C.text, { fw: '600', ls: '0.03em' }));
  const goals = ['Longevity', 'VO2 Max', 'Sleep Quality', 'Metabolic Health', 'Stress Resilience'];
  let gx = 20, gy = 396;
  goals.forEach((g, i) => {
    const gw = g.length * 7 + 20;
    if (gx + gw > W - 16) { gx = 20; gy += 32; }
    els.push(rect(gx, gy, gw, 24, i === 0 ? C.accent : C.tag, { rx: 12 }));
    els.push(text(gx + gw/2, gy + 16, g, 10, i === 0 ? C.surf : C.sub, { anchor: 'middle', fw: i === 0 ? '600' : '400' }));
    gx += gw + 8;
  });

  // Settings rows
  const rows = [
    { label: 'Notifications', sub: 'Daily reminders · 8:00 AM', icon: '◎' },
    { label: 'Connected Devices', sub: 'Apple Watch · Oura Ring', icon: '◈' },
    { label: 'Data & Privacy', sub: 'Manage your health data', icon: '◇' },
    { label: 'Share Progress', sub: 'Export weekly report', icon: '◉' },
  ];

  const rowsY = gy + 40;
  rows.forEach((r, i) => {
    const ry = rowsY + i * 56;
    els.push(rect(16, ry, W - 32, 48, C.surf, { rx: 12 }));
    els.push(text(34, ry + 28, r.icon, 14, C.muted, { anchor: 'middle' }));
    els.push(text(52, ry + 22, r.label, 13, C.text, { fw: '500' }));
    els.push(text(52, ry + 36, r.sub, 10));
    // Chevron
    els.push(line(W - 32, ry + 20, W - 26, ry + 24, C.muted, { sw: 1.5 }));
    els.push(line(W - 26, ry + 24, W - 32, ry + 28, C.muted, { sw: 1.5 }));
  });

  els.push(bottomNav('insights'));
  return els.join('');
}

// ── BUILD ALL SCREENS ─────────────────────────────────────────────────────────
const before = elementCount;
const screens = [
  { name: 'Today',    svg: screenToday() },
  { name: 'Rituals',  svg: screenRituals() },
  { name: 'Nourish',  svg: screenNourish() },
  { name: 'Sleep',    svg: screenSleep() },
  { name: 'Insights', svg: screenInsights() },
  { name: 'Profile',  svg: screenProfile() },
];

const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    tagline: TAGLINE,
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'light',
    heartbeat: 'auto',
    elements: elementCount,
    archetype: 'health-longevity',
    inspiration: 'Health tech + longevity surge on lapa.ninja and land-book; warm editorial minimalism from minimal.gallery',
    palette: {
      bg: C.bg, surface: C.surf, card: C.card,
      accent: C.accent, accent2: C.accent2,
      text: C.text, muted: C.muted,
    },
  },
  screens: screens.map(s => ({
    name: s.name,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${s.svg}</svg>`,
    elements: [],
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${elementCount} elements`);
console.log(`Written: ${SLUG}.pen`);
