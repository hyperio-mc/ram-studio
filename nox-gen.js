#!/usr/bin/env node
// LUNE — AI Sleep Intelligence
// Dark theme inspired by:
//   - Lapa Ninja: "Dawn" AI mental health (warm+dark palette fusion, evidence-based)
//   - Lapa Ninja: Air agent dashboard ("run beloved agents side by side" — dark terminal aesthetic)
//   - Lapa Ninja: "Build software that never breaks" — dark ui with electric accent
//   - Dark Mode Design: Midday — sleek dark SaaS with editorial type hierarchy
//
// Challenge: Midnight-navy sleep dashboard with periwinkle + warm coral dual-accent,
// editorial large-number hierarchy, wave SVG sleep stage viz, and a calm but data-rich
// dark aesthetic that feels at home at 11pm.

const fs = require('fs');
const path = require('path');

const SLUG = 'nox';

// ── Palette ────────────────────────────────────────────────────────────────
const P = {
  bg:       '#070B14',   // deep midnight
  surface:  '#0D1426',   // dark navy card
  surface2: '#111B30',   // slightly lighter surface
  surface3: '#162038',   // hover/active state
  text:     '#E4E9F5',   // cool near-white
  textMid:  '#8A94B5',   // muted blue-gray
  textFaint:'#485270',   // very faint label
  accent:   '#6C7EFF',   // periwinkle electric blue
  accent2:  '#FF8A6B',   // warm coral (warmth, heat, body)
  accent3:  '#44D9A4',   // soft teal-mint (REM, refresh)
  deep:     '#3A4FCC',   // deep sleep indigo
  border:   'rgba(108,126,255,0.15)',
};

// ── Helpers ────────────────────────────────────────────────────────────────
let uid = 0;
const id = () => `e${++uid}`;

function screen(label, children, opts = {}) {
  return {
    id: id(),
    type: 'screen',
    label,
    bg: opts.bg || P.bg,
    children,
  };
}

function rect(x, y, w, h, fill, opts = {}) {
  return {
    id: id(), type: 'rect',
    x, y, w, h, fill,
    rx: opts.rx ?? 0,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke,
    strokeWidth: opts.strokeWidth ?? 1,
  };
}

function text(x, y, content, opts = {}) {
  return {
    id: id(), type: 'text',
    x, y, content,
    fontSize: opts.size ?? 14,
    fill: opts.fill ?? P.text,
    fontWeight: opts.weight ?? 'normal',
    align: opts.align ?? 'left',
    opacity: opts.opacity ?? 1,
    fontFamily: opts.font ?? 'Inter',
    letterSpacing: opts.ls ?? 0,
  };
}

function circle(cx, cy, r, fill, opts = {}) {
  return {
    id: id(), type: 'ellipse',
    x: cx - r, y: cy - r,
    w: r * 2, h: r * 2,
    fill,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke,
    strokeWidth: opts.strokeWidth ?? 2,
  };
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  return {
    id: id(), type: 'line',
    x1, y1, x2, y2,
    stroke,
    strokeWidth: opts.w ?? 1,
    opacity: opts.opacity ?? 1,
  };
}

function pill(x, y, w, h, fill, label, labelColor, opts = {}) {
  return {
    id: id(), type: 'group',
    x, y, w, h,
    children: [
      rect(0, 0, w, h, fill, { rx: h / 2 }),
      text(w / 2, h / 2 + 5, label, {
        size: opts.labelSize ?? 12,
        fill: labelColor,
        weight: '600',
        align: 'center',
      }),
    ],
  };
}

function card(x, y, w, h, children, opts = {}) {
  return {
    id: id(), type: 'group',
    x, y, w, h,
    children: [
      rect(0, 0, w, h, opts.fill ?? P.surface, { rx: opts.rx ?? 16, stroke: P.border, strokeWidth: 1 }),
      ...children,
    ],
  };
}

// ── Sleep Stage Wave SVG ───────────────────────────────────────────────────
function sleepWave(x, y, w, h) {
  // Represents: awake → light sleep → deep sleep → REM cycles
  // Using path approximation with nested rects as wave bands
  const bandH = Math.floor(h / 4);
  const stages = [
    { label: 'Awake',  fill: P.accent2, pct: 0.05, y: 0 },
    { label: 'Light',  fill: P.accent,  pct: 0.45, y: bandH },
    { label: 'Deep',   fill: P.deep,    pct: 0.20, y: bandH * 2 },
    { label: 'REM',    fill: P.accent3, pct: 0.30, y: bandH * 3 },
  ];

  const elems = [];

  // Background track
  elems.push(rect(0, 0, w, h, P.surface2, { rx: 8 }));

  // Stage bands (simplified visualization)
  // Time slots: 22:00 → 06:30 = 8.5h → divide into 17 half-hour slots
  const slots = 17;
  const slotW = Math.floor(w / slots);

  // Simulated sleep stage data per slot (0=awake,1=light,2=deep,3=rem)
  const stageData = [0,1,1,2,2,2,3,2,1,3,2,1,3,1,1,3,0];
  const stageColors = [P.accent2, P.accent, P.deep, P.accent3];
  const stageLabels = ['Awake','Light','Deep','REM'];

  stageData.forEach((stage, i) => {
    const bx = i * slotW;
    const bh = stage === 0 ? 8 : stage === 1 ? Math.floor(h * 0.35) : stage === 2 ? h : Math.floor(h * 0.55);
    const by = h - bh;
    elems.push(rect(bx, by, slotW - 2, bh, stageColors[stage], { rx: 3, opacity: 0.85 }));
  });

  // Time labels
  const times = ['10pm','12am','2am','4am','6am'];
  times.forEach((t, i) => {
    elems.push(text(Math.floor((i / 4) * w), h + 16, t, {
      size: 9, fill: P.textFaint, align: 'left',
    }));
  });

  return { id: id(), type: 'group', x, y, w, h: h + 20, children: elems };
}

// ── Score Ring ─────────────────────────────────────────────────────────────
function scoreRing(cx, cy, r, score, label) {
  const elems = [];
  // Outer ring track
  elems.push(circle(cx, cy, r, 'transparent', { stroke: P.surface2, strokeWidth: 8 }));
  // Progress arc (simplified as colored ring segment)
  elems.push(circle(cx, cy, r, 'transparent', { stroke: P.accent, strokeWidth: 8 }));
  // Score number
  elems.push(text(cx, cy + 10, String(score), {
    size: 38, fill: P.text, weight: '700', align: 'center', font: 'Inter',
  }));
  elems.push(text(cx, cy + 26, label, {
    size: 11, fill: P.textMid, align: 'center', ls: 1.5,
  }));
  return { id: id(), type: 'group', x: 0, y: 0, w: cx * 2, h: cy * 2 + 20, children: elems };
}

// ── Navigation Bar ─────────────────────────────────────────────────────────
function navBar(activeIdx) {
  const W = 390, H = 72;
  const tabs = [
    { icon: '◐', label: 'Tonight' },
    { icon: '◑', label: 'Analysis' },
    { icon: '✦', label: 'Insights' },
    { icon: '◈', label: 'Routine' },
    { icon: '◉', label: 'History' },
  ];
  const tabW = Math.floor(W / tabs.length);
  const elems = [
    rect(0, 0, W, H, P.surface, { stroke: P.border, strokeWidth: 1 }),
    // top divider line
    rect(0, 0, W, 1, P.border),
  ];

  tabs.forEach((tab, i) => {
    const tx = i * tabW + tabW / 2;
    const isActive = i === activeIdx;
    elems.push(text(tx, 18, tab.icon, {
      size: 18, fill: isActive ? P.accent : P.textFaint, align: 'center',
    }));
    elems.push(text(tx, 36, tab.label, {
      size: 10, fill: isActive ? P.accent : P.textFaint, align: 'center', weight: isActive ? '600' : 'normal',
    }));
    if (isActive) {
      elems.push(rect(i * tabW + tabW / 2 - 16, 62, 32, 3, P.accent, { rx: 2 }));
    }
  });

  return { id: id(), type: 'group', x: 0, y: 780, w: W, h: H, children: elems };
}

// ── Status Bar ─────────────────────────────────────────────────────────────
function statusBar() {
  return {
    id: id(), type: 'group', x: 0, y: 0, w: 390, h: 44,
    children: [
      rect(0, 0, 390, 44, P.bg),
      text(20, 28, '11:42', { size: 15, fill: P.text, weight: '600' }),
      text(370, 28, '●●●  ▲  ▋', { size: 10, fill: P.textMid, align: 'right' }),
    ],
  };
}

// ══════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Tonight (Sleep Readiness)
// ══════════════════════════════════════════════════════════════════════════
function screenTonight() {
  const W = 390;
  const elems = [];

  elems.push(rect(0, 0, W, 852, P.bg));
  elems.push(statusBar());

  // Header
  elems.push(text(20, 66, 'Tonight', { size: 28, fill: P.text, weight: '700' }));
  elems.push(text(20, 94, 'Saturday, March 28', { size: 13, fill: P.textMid }));

  // Readiness score card with large ring
  const scoreCard = card(16, 110, 358, 220, [
    // Ambient glow behind ring
    circle(179, 110, 70, P.accent, { opacity: 0.06 }),
    scoreRing(179, 110, 60, 84, 'SLEEP SCORE'),
    // Label
    text(179, 196, 'Excellent readiness tonight', {
      size: 12, fill: P.textMid, align: 'center',
    }),
  ], { rx: 20 });
  elems.push(scoreCard);

  // Bedtime recommendation strip
  elems.push(card(16, 342, 358, 68, [
    text(16, 22, '◐', { size: 22, fill: P.accent2 }),
    text(50, 16, 'Recommended bedtime', { size: 11, fill: P.textMid }),
    text(50, 33, '10:45 PM', { size: 18, fill: P.text, weight: '700' }),
    text(340, 22, '→', { size: 20, fill: P.accent, align: 'right' }),
  ], { rx: 14 }));

  // Wake time
  elems.push(card(16, 422, 170, 68, [
    text(12, 16, 'Wake target', { size: 11, fill: P.textMid }),
    text(12, 33, '6:45 AM', { size: 20, fill: P.text, weight: '700' }),
    text(12, 52, '8h sleep', { size: 10, fill: P.accent3 }),
  ], { rx: 14 }));

  // Sleep debt
  elems.push(card(204, 422, 170, 68, [
    text(12, 16, 'Sleep debt', { size: 11, fill: P.textMid }),
    text(12, 33, '−23 min', { size: 20, fill: P.accent2, weight: '700' }),
    text(12, 52, '↓ improving', { size: 10, fill: P.accent3 }),
  ], { rx: 14 }));

  // AI insight strip
  elems.push(card(16, 502, 358, 78, [
    text(14, 16, '✦', { size: 16, fill: P.accent }),
    text(36, 16, 'AI Insight', { size: 11, fill: P.accent, weight: '600' }),
    text(14, 36, 'Your HRV recovered well today. Blue light\nexposure is low — ideal for deep sleep tonight.', {
      size: 12, fill: P.textMid,
    }),
  ], { rx: 14 }));

  // Factors row
  const factors = [
    { label: 'HRV', val: '↑ High', col: P.accent3 },
    { label: 'Steps', val: '8,204', col: P.text },
    { label: 'Caffeine', val: 'None after 2pm', col: P.text },
  ];
  elems.push(text(20, 598, 'Contributing factors', { size: 13, fill: P.textMid, weight: '600' }));
  factors.forEach((f, i) => {
    elems.push(card(16 + i * 122, 618, 114, 54, [
      text(10, 14, f.label, { size: 10, fill: P.textMid }),
      text(10, 32, f.val, { size: 12, fill: f.col, weight: '600' }),
    ], { rx: 12 }));
  });

  // Bottom nav
  elems.push(navBar(0));

  return screen('Tonight', elems);
}

// ══════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Sleep Analysis (Last Night)
// ══════════════════════════════════════════════════════════════════════════
function screenAnalysis() {
  const W = 390;
  const elems = [];

  elems.push(rect(0, 0, W, 852, P.bg));
  elems.push(statusBar());

  // Header
  elems.push(text(20, 66, 'Last Night', { size: 28, fill: P.text, weight: '700' }));
  elems.push(text(20, 94, 'Fri → Sat  ·  10:58 PM – 6:42 AM', { size: 13, fill: P.textMid }));

  // Top metrics row
  const topMetrics = [
    { label: 'Duration', val: '7h 44m', sub: '+12m vs avg', col: P.accent3 },
    { label: 'Efficiency', val: '91%', sub: 'excellent', col: P.accent },
    { label: 'Interruptions', val: '2', sub: 'low', col: P.text },
  ];
  topMetrics.forEach((m, i) => {
    elems.push(card(16 + i * 120, 110, 112, 72, [
      text(10, 14, m.label, { size: 10, fill: P.textMid }),
      text(10, 36, m.val, { size: 20, fill: m.col, weight: '700' }),
      text(10, 54, m.sub, { size: 10, fill: P.textFaint }),
    ], { rx: 14 }));
  });

  // Sleep stage wave
  elems.push(text(20, 202, 'Sleep Stages', { size: 14, fill: P.text, weight: '600' }));
  elems.push(card(16, 222, 358, 120, [
    sleepWave(12, 12, 334, 72),
  ], { rx: 16 }));

  // Stage breakdown
  elems.push(text(20, 362, 'Stage breakdown', { size: 14, fill: P.text, weight: '600' }));
  const stages = [
    { label: 'Deep Sleep', pct: 20, duration: '1h 33m', fill: P.deep },
    { label: 'REM', pct: 30, duration: '2h 19m', fill: P.accent3 },
    { label: 'Light Sleep', pct: 45, duration: '3h 29m', fill: P.accent },
    { label: 'Awake', pct: 5, duration: '23m', fill: P.accent2 },
  ];
  stages.forEach((s, i) => {
    const y = 384 + i * 56;
    elems.push(card(16, y, 358, 48, [
      // Color dot
      circle(18, 24, 6, s.fill),
      text(34, 18, s.label, { size: 13, fill: P.text, weight: '600' }),
      text(34, 34, s.duration, { size: 11, fill: P.textMid }),
      // Progress bar
      rect(130, 20, 160, 6, P.surface3, { rx: 3 }),
      rect(130, 20, Math.floor(160 * s.pct / 100), 6, s.fill, { rx: 3, opacity: 0.9 }),
      text(300, 18, `${s.pct}%`, { size: 13, fill: P.textMid, align: 'right' }),
    ], { rx: 12 }));
  });

  // Heart rate through night
  elems.push(text(20, 614, 'Heart rate', { size: 14, fill: P.text, weight: '600' }));
  elems.push(card(16, 634, 358, 64, [
    text(14, 18, 'Resting avg', { size: 11, fill: P.textMid }),
    text(14, 40, '52 bpm', { size: 24, fill: P.accent2, weight: '700' }),
    text(200, 18, 'Range', { size: 11, fill: P.textMid }),
    text(200, 40, '46 – 61', { size: 24, fill: P.text, weight: '700' }),
  ], { rx: 14 }));

  elems.push(navBar(1));
  return screen('Analysis', elems);
}

// ══════════════════════════════════════════════════════════════════════════
// SCREEN 3 — AI Insights
// ══════════════════════════════════════════════════════════════════════════
function screenInsights() {
  const W = 390;
  const elems = [];

  elems.push(rect(0, 0, W, 852, P.bg));
  elems.push(statusBar());

  elems.push(text(20, 66, 'Insights', { size: 28, fill: P.text, weight: '700' }));
  elems.push(text(20, 94, 'Patterns Lune has learned about you', { size: 13, fill: P.textMid }));

  // Weekly score trend mini chart
  elems.push(text(20, 126, 'Your sleep score · 7 days', { size: 13, fill: P.text, weight: '600' }));
  const scores = [72, 68, 80, 77, 83, 79, 84];
  const days = ['S','M','T','W','T','F','S'];
  elems.push(card(16, 144, 358, 96, [
    ...scores.map((s, i) => {
      const bx = 16 + i * 46;
      const bh = Math.floor((s / 100) * 56);
      return {
        id: id(), type: 'group', x: 0, y: 0, w: 358, h: 96,
        children: [
          rect(bx, 64 - bh, 28, bh, i === 6 ? P.accent : P.surface3, { rx: 4, opacity: i === 6 ? 1 : 0.8 }),
          text(bx + 14, 78, days[i], { size: 9, fill: P.textFaint, align: 'center' }),
          i === 6 ? text(bx + 14, 62 - bh, String(s), { size: 9, fill: P.accent, align: 'center' }) : { id: id(), type: 'group', children: [] },
        ],
      };
    }),
  ], { rx: 16 }));

  // Insight cards
  const insights = [
    {
      icon: '◑',
      color: P.accent,
      title: 'Consistent bedtime = deeper sleep',
      body: 'On the 4 nights you slept before 11pm, deep sleep averaged 22% — 8pts above your baseline.',
    },
    {
      icon: '◐',
      color: P.accent2,
      title: 'Evening exercise shortens REM',
      body: 'Workouts after 7pm correlate with 14% less REM on average in your data.',
    },
    {
      icon: '✦',
      color: P.accent3,
      title: 'Weekend recovery is working',
      body: 'Your Saturday sleep quality has improved 3 weeks in a row. Keep it up.',
    },
  ];

  insights.forEach((ins, i) => {
    elems.push(card(16, 258 + i * 144, 358, 130, [
      circle(22, 26, 14, ins.color, { opacity: 0.15 }),
      text(22, 30, ins.icon, { size: 16, fill: ins.color, align: 'center' }),
      pill(270, 10, 68, 24, ins.color + '22', 'NEW INSIGHT', ins.color, { labelSize: 9 }),
      text(46, 18, ins.title, { size: 14, fill: P.text, weight: '600' }),
      text(16, 50, ins.body, { size: 12, fill: P.textMid }),
      // Divider
      rect(16, 98, 326, 1, P.border),
      text(16, 112, 'See related nights →', { size: 11, fill: ins.color }),
    ], { rx: 16 }));
  });

  elems.push(navBar(2));
  return screen('Insights', elems);
}

// ══════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Evening Routine
// ══════════════════════════════════════════════════════════════════════════
function screenRoutine() {
  const W = 390;
  const elems = [];

  elems.push(rect(0, 0, W, 852, P.bg));
  elems.push(statusBar());

  elems.push(text(20, 66, 'Wind-Down', { size: 28, fill: P.text, weight: '700' }));
  elems.push(text(20, 94, 'Start 60–90 min before bed', { size: 13, fill: P.textMid }));

  // Progress strip
  elems.push(card(16, 112, 358, 60, [
    text(14, 14, 'Tonight\'s routine', { size: 12, fill: P.textMid }),
    text(14, 34, '3 of 6 complete', { size: 16, fill: P.text, weight: '600' }),
    rect(14, 48, 330, 4, P.surface3, { rx: 2 }),
    rect(14, 48, 165, 4, P.accent, { rx: 2 }),
  ], { rx: 14 }));

  // Routine items
  const routineItems = [
    { icon: '◉', label: 'Dim lights to 20%', sub: 'Blue light filter on', done: true },
    { icon: '◉', label: 'No screens after 10pm', sub: 'Set reminder', done: true },
    { icon: '◉', label: '5-min breathing exercise', sub: '4-7-8 technique', done: true },
    { icon: '○', label: 'Body temperature drop', sub: 'Cool room to 67°F', done: false },
    { icon: '○', label: 'Sleep sounds on', sub: 'White noise or rain', done: false },
    { icon: '○', label: 'Gratitude journal', sub: '3 things from today', done: false },
  ];

  routineItems.forEach((item, i) => {
    const y = 186 + i * 78;
    const fill = item.done ? P.surface : P.surface;
    elems.push(card(16, y, 358, 66, [
      // Checkbox
      rect(14, 18, 28, 28, item.done ? P.accent : 'transparent', { rx: 8, stroke: item.done ? P.accent : P.surface3, strokeWidth: 2 }),
      item.done ? text(28, 36, '✓', { size: 14, fill: '#000', align: 'center' }) : { id: id(), type: 'group', children: [] },
      text(56, 22, item.label, { size: 14, fill: item.done ? P.textMid : P.text, weight: '600' }),
      text(56, 40, item.sub, { size: 11, fill: P.textFaint }),
      text(340, 24, item.done ? '' : '→', { size: 16, fill: P.accent, align: 'right' }),
    ], { rx: 14 }));
  });

  // Lune tip
  elems.push(card(16, 660, 358, 70, [
    text(14, 18, '✦ Lune tip', { size: 12, fill: P.accent, weight: '600' }),
    text(14, 38, 'Your HRV drops fastest when you skip\nthe breathing exercise. It matters most.', { size: 12, fill: P.textMid }),
  ], { rx: 14 }));

  elems.push(navBar(3));
  return screen('Routine', elems);
}

// ══════════════════════════════════════════════════════════════════════════
// SCREEN 5 — History (30-day trend)
// ══════════════════════════════════════════════════════════════════════════
function screenHistory() {
  const W = 390;
  const elems = [];

  elems.push(rect(0, 0, W, 852, P.bg));
  elems.push(statusBar());

  elems.push(text(20, 66, 'History', { size: 28, fill: P.text, weight: '700' }));
  elems.push(text(20, 94, 'March 2026', { size: 13, fill: P.textMid }));

  // Period tabs
  const periods = ['Week', '30 Days', '3 Months'];
  periods.forEach((p, i) => {
    const active = i === 1;
    elems.push(pill(20 + i * 98, 112, 86, 30, active ? P.accent : P.surface, p, active ? '#fff' : P.textMid, { labelSize: 12 }));
  });

  // Monthly summary metrics
  const monthMetrics = [
    { label: 'Avg score', val: '78', trend: '↑ 6pts', col: P.accent },
    { label: 'Avg sleep', val: '7h 21m', trend: '↑ 18min', col: P.accent3 },
    { label: 'Best night', val: '92', trend: 'Mar 14', col: P.text },
    { label: 'Worst night', val: '54', trend: 'Mar 3', col: P.accent2 },
  ];

  monthMetrics.forEach((m, i) => {
    elems.push(card(16 + (i % 2) * 180, 154 + Math.floor(i / 2) * 76, 166, 64, [
      text(12, 14, m.label, { size: 11, fill: P.textMid }),
      text(12, 36, m.val, { size: 22, fill: m.col, weight: '700' }),
      text(12, 52, m.trend, { size: 10, fill: P.accent3 }),
    ], { rx: 14 }));
  });

  // 30-day mini heatmap
  elems.push(text(20, 322, '30-day sleep quality', { size: 14, fill: P.text, weight: '600' }));

  // Heatmap grid (5 rows × 7 cols = 35 days, show 30)
  const scores30 = [54,60,72,68,75,80,77,71,65,78,82,84,79,73,70,76,83,85,80,74,69,77,82,88,84,78,72,75,79,84];
  const cellW = 46, cellH = 36;
  const dayLetters = ['S','M','T','W','T','F','S'];

  dayLetters.forEach((d, i) => {
    elems.push(text(20 + i * cellW + 16, 342, d, { size: 9, fill: P.textFaint, align: 'center' }));
  });

  scores30.forEach((sc, idx) => {
    const row = Math.floor(idx / 7);
    const col = idx % 7;
    const cx = 20 + col * cellW;
    const cy = 352 + row * cellH;
    const intensity = (sc - 50) / 50; // 0 to 1
    const fill = sc >= 80 ? P.accent : sc >= 70 ? P.deep : sc >= 60 ? P.surface3 : P.accent2;
    elems.push(rect(cx + 2, cy + 2, cellW - 6, cellH - 6, fill, { rx: 6, opacity: 0.7 + intensity * 0.3 }));
    elems.push(text(cx + cellW / 2 - 2, cy + 14, String(sc), { size: 9, fill: P.text, align: 'center' }));
  });

  // Legend
  elems.push(text(20, 540, '◼ 80+', { size: 10, fill: P.accent }));
  elems.push(text(68, 540, '◼ 70-79', { size: 10, fill: P.deep }));
  elems.push(text(124, 540, '◼ 60-69', { size: 10, fill: P.surface3 }));
  elems.push(text(184, 540, '◼ <60', { size: 10, fill: P.accent2 }));

  // Personal records section
  elems.push(text(20, 566, 'Personal records', { size: 14, fill: P.text, weight: '600' }));
  const records = [
    { label: 'Longest streak of 80+ nights', val: '5 days', icon: '✦' },
    { label: 'Most deep sleep in one night', val: '2h 4m', icon: '◑' },
    { label: 'Best HRV recovery', val: '94ms', icon: '◐' },
  ];
  records.forEach((r, i) => {
    elems.push(card(16, 586 + i * 60, 358, 50, [
      text(14, 17, r.icon, { size: 16, fill: P.accent }),
      text(36, 14, r.label, { size: 12, fill: P.textMid }),
      text(36, 32, r.val, { size: 14, fill: P.text, weight: '700' }),
      text(340, 22, '★', { size: 14, fill: P.accent2, align: 'right' }),
    ], { rx: 12 }));
  });

  elems.push(navBar(4));
  return screen('History', elems);
}

// ══════════════════════════════════════════════════════════════════════════
// Assemble & Write
// ══════════════════════════════════════════════════════════════════════════
const screens = [
  screenTonight(),
  screenAnalysis(),
  screenInsights(),
  screenRoutine(),
  screenHistory(),
];

const pen = {
  version: '2.8',
  meta: {
    name: 'Lune — AI Sleep Intelligence',
    slug: SLUG,
    theme: 'dark',
    palette: {
      bg: P.bg,
      surface: P.surface,
      accent: P.accent,
      accent2: P.accent2,
      text: P.text,
    },
    created: new Date().toISOString(),
    description: 'AI sleep intelligence app. Midnight navy + periwinkle + warm coral. 5 screens: Tonight, Analysis, Insights, Routine, History.',
  },
  screens,
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ Written: ${outPath}`);
console.log(`  Screens: ${screens.length}`);
console.log(`  Elements: ${uid} total`);
