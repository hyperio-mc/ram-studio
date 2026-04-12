'use strict';
// hush-app.js
// HUSH — sleep intelligence for people who overthink
// Dark midnight violet palette — evidence-based sleep tracking
// Inspired by Dawn (lapa.ninja evidence-based sleep AI) + siteinspire typographic trend
// Theme: DARK

const fs   = require('fs');
const path = require('path');

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const P = {
  bg:       '#07080D',   // near-black midnight
  surface:  '#0F1117',   // deep navy card
  surfaceB: '#171B26',   // elevated element
  border:   '#1E2335',   // subtle border
  text:     '#E8E6F0',   // soft lavender-white
  muted:    'rgba(232,230,240,0.38)',
  violet:   '#8B7FFF',   // soft purple — sleep/dream
  amber:    '#F0A040',   // warm amber — wake light
  green:    '#3DD68C',   // good sleep
  rose:     '#FF6B8A',   // poor sleep / stress
  indigo:   '#4F6EFF',   // data / REM phase
};

const W = 375;
const H = 812;
const GAP = 80;

let _id = 1;
const uid = () => `n${_id++}`;

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'RECTANGLE', id: uid(), x, y, w, h, fill,
    cornerRadius: opts.r || 0,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
    ...(opts.stroke ? { stroke: opts.stroke, strokeWidth: opts.sw || 1 } : {}),
  };
}

function text(x, y, w, content, size, color, opts = {}) {
  return {
    type: 'TEXT', id: uid(), x, y, w, content,
    fontSize: size, color,
    fontWeight: opts.bold ? 700 : opts.medium ? 500 : opts.light ? 300 : 400,
    fontStyle: opts.italic ? 'italic' : 'normal',
    fontFamily: opts.mono ? 'JetBrains Mono' : opts.serif ? 'Playfair Display' : 'Inter',
    textAlign: opts.center ? 'center' : opts.right ? 'right' : 'left',
    lineHeight: opts.lh || (size <= 12 ? 1.5 : size <= 16 ? 1.5 : 1.3),
    letterSpacing: opts.ls || 0,
    opacity: opts.opacity || 1,
  };
}

function frame(x, y, w, h, children, opts = {}) {
  return {
    type: 'FRAME', id: uid(), x, y, w, h,
    fill: opts.fill || P.bg,
    clip: true,
    children: children.flat(Infinity).filter(Boolean),
  };
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
function statusBar(x, y) {
  return [
    rect(x, y, W, 44, P.bg),
    text(x + 16, y + 14, 60, '9:41', 13, P.text, { medium: true, mono: true }),
    text(x + W - 64, y + 14, 52, '● ◆ ▮', 11, P.muted, { right: true }),
  ];
}

function topBar(x, y, title, sub) {
  return [
    rect(x, y, W, 52, P.bg),
    text(x + 20, y + 8, W - 40, title, 20, P.text, { serif: true, bold: true }),
    sub ? text(x + 20, y + 32, W - 40, sub, 10, P.muted, { ls: 0.1 }) : null,
  ];
}

function navBar(x, y, activeIdx) {
  const tabs = [
    { icon: '🌙', label: 'Tonight' },
    { icon: '📊', label: 'Sleep' },
    { icon: '✏️', label: 'Journal' },
    { icon: '📈', label: 'Trends' },
    { icon: '⚙️', label: 'Profile' },
  ];
  const tw = W / 5;
  return [
    rect(x, y, W, 80, P.surface, { stroke: P.border, sw: 1 }),
    rect(x + W / 2 - 60, y + 68, 120, 4, P.surfaceB, { r: 2 }),
    ...tabs.map((t, i) => {
      const tx = x + i * tw;
      const on = i === activeIdx;
      return [
        on ? rect(tx + tw / 2 - 18, y + 8, 36, 36, `${P.violet}18`, { r: 10 }) : null,
        text(tx, y + 13, tw, t.icon, 18, on ? P.violet : P.muted, { center: true }),
        text(tx, y + 38, tw, t.label, 8, on ? P.violet : P.muted, { center: true }),
      ];
    }),
  ];
}

function card(x, y, w, h, children, color) {
  return [
    rect(x, y, w, h, P.surface, { r: 14, stroke: color || P.border, sw: 1 }),
    ...children.flat(Infinity).filter(Boolean),
  ];
}

function sectionLabel(x, y, label) {
  return text(x, y, 240, label, 9, P.muted, { ls: 0.12 });
}

// ─── SCREEN 1 — TONIGHT ──────────────────────────────────────────────────────
function screenTonight(ox, oy) {
  const x = ox, y = oy;
  return frame(x, y, W, H, [
    ...statusBar(x, y),
    ...topBar(x, y + 44, 'Tonight', 'THURSDAY · MARCH 26'),

    // Sleep window
    ...card(x + 16, y + 106, W - 32, 60, [
      text(x + 24, y + 116, 120, '🌙 Sleep', 10, P.muted),
      text(x + 24, y + 131, 120, '10:30 PM', 18, P.violet, { mono: true, bold: true }),
      text(x + W - 124, y + 116, 96, '⏰ Wake', 10, P.muted, { right: true }),
      text(x + W - 140, y + 131, 112, '6:30 AM', 18, P.amber, { mono: true, bold: true, right: true }),
    ]),

    // Wind-down countdown
    ...card(x + 16, y + 178, W - 32, 90, [
      sectionLabel(x + 24, y + 188, 'WIND-DOWN TIMER'),
      text(x + 24, y + 206, 180, '47:32', 36, P.text, { mono: true, bold: true }),
      text(x + 24, y + 250, 220, 'minutes until sleep window', 11, P.muted),
      rect(x + 16, y + 256, W - 32, 3, P.surfaceB),
      rect(x + 16, y + 256, Math.round((W - 32) * 0.61), 3, P.violet, { r: 2 }),
    ]),

    // Room conditions
    ...card(x + 16, y + 280, W - 32, 118, [
      sectionLabel(x + 24, y + 290, 'ROOM CONDITIONS'),
      ...[
        { icon: '🌡', label: 'Temperature', value: '18.5°C', color: P.green },
        { icon: '💧', label: 'Humidity', value: '52%', color: P.green },
        { icon: '🔇', label: 'Noise', value: '34 dB', color: P.green },
        { icon: '💡', label: 'Light', value: '8 lux', color: P.amber },
      ].map((row, i) => [
        text(x + 24, y + 308 + i * 20, 20, row.icon, 13, P.text),
        text(x + 48, y + 310 + i * 20, 140, row.label, 11, P.muted),
        text(x + W - 96, y + 310 + i * 20, 72, row.value, 12, row.color, { right: true, mono: true }),
      ]),
    ]),

    // Checklist
    ...card(x + 16, y + 410, W - 32, 124, [
      sectionLabel(x + 24, y + 420, 'WIND-DOWN CHECKLIST'),
      ...[
        ['No caffeine after 2pm', true],
        ['Phone face-down on desk', true],
        ['Dim lights to <50 lux', true],
        ['Room cooled below 19°C', false],
      ].map(([label, done], i) => [
        rect(x + 24, y + 440 + i * 22, 16, 16, done ? P.violet : 'transparent', { r: 4, stroke: done ? P.violet : P.muted, sw: 1 }),
        done ? text(x + 27, y + 440 + i * 22, 14, '✓', 10, P.bg, { center: true, bold: true }) : null,
        text(x + 48, y + 441 + i * 22, W - 72, label, 12, done ? P.muted : P.text, { opacity: done ? 0.55 : 1 }),
      ]),
    ]),

    // Sleep mode CTA
    rect(x + 16, y + 546, W - 32, 50, P.violet, { r: 14 }),
    text(x + 16, y + 560, W - 32, 'Start Sleep Mode', 15, '#ffffff', { center: true, bold: true }),

    // Insight
    rect(x + 16, y + 608, W - 32, 52, P.violet, { r: 12, opacity: 0.07 }),
    text(x + 24, y + 620, W - 48,
      'Your body temperature drops naturally around 10:20 PM — that\'s your optimal sleep onset.', 11, P.muted, { lh: 1.65 }),

    ...navBar(x, y + H - 80, 0),
  ]);
}

// ─── SCREEN 2 — LAST NIGHT ───────────────────────────────────────────────────
function screenSleep(ox, oy) {
  const x = ox, y = oy;
  return frame(x, y, W, H, [
    ...statusBar(x, y),
    ...topBar(x, y + 44, 'Last Night', 'WED, MARCH 25'),

    // Score card with ring
    ...card(x + 16, y + 106, W - 32, 156, [
      // Big score
      text(x + W / 2 - 40, y + 128, 80, '82', 52, P.green, { center: true, mono: true, bold: true }),
      text(x + W / 2 - 30, y + 184, 60, '/ 100', 11, P.muted, { center: true, mono: true }),
      text(x + W / 2 - 60, y + 202, 120, 'SLEEP QUALITY', 9, P.muted, { center: true, ls: 0.12 }),
      // Comparison
      text(x + 32, y + 144, 70, 'Your avg', 9, P.muted),
      text(x + 32, y + 160, 70, '76', 22, P.muted, { mono: true }),
      text(x + W - 110, y + 144, 78, 'This week', 9, P.muted, { right: true }),
      text(x + W - 100, y + 160, 68, '79', 22, P.muted, { mono: true, right: true }),
      text(x + W - 120, y + 184, 88, '↑ +6 pts', 11, P.green, { right: true }),
    ]),

    // Metrics row
    ...[
      { label: 'DURATION', value: '7h 24m', unit: 'goal: 8h', color: P.amber },
      { label: 'EFFICIENCY', value: '87%', unit: 'in bed 8h 30m', color: P.green },
      { label: 'WAKE-UPS', value: '2×', unit: 'avg 1.8×', color: P.rose },
    ].map((m, i) => [
      rect(x + 16 + i * 116, y + 274, 108, 62, P.surfaceB, { r: 10 }),
      text(x + 16 + i * 116, y + 284, 108, m.label, 8, P.muted, { center: true, ls: 0.1 }),
      text(x + 16 + i * 116, y + 300, 108, m.value, 18, m.color, { center: true, mono: true, bold: true }),
      text(x + 16 + i * 116, y + 322, 108, m.unit, 8, P.muted, { center: true }),
    ]),

    // Sleep phases
    ...card(x + 16, y + 348, W - 32, 148, [
      sectionLabel(x + 24, y + 358, 'SLEEP PHASES'),
      ...[
        { label: 'DEEP', pct: 0.28, color: P.violet },
        { label: 'REM', pct: 0.22, color: P.indigo },
        { label: 'LIGHT', pct: 0.44, color: P.green },
        { label: 'AWAKE', pct: 0.06, color: P.rose },
      ].map((ph, i) => [
        text(x + 24, y + 378 + i * 24, 52, ph.label, 9, P.muted, { ls: 0.08 }),
        rect(x + 80, y + 382 + i * 24, W - 104, 8, P.surfaceB, { r: 4 }),
        rect(x + 80, y + 382 + i * 24, Math.round((W - 104) * ph.pct), 8, ph.color, { r: 4 }),
        text(x + W - 56, y + 378 + i * 24, 44, `${Math.round(ph.pct * 100)}%`, 9, ph.color, { right: true, mono: true }),
      ]),
    ]),

    // Insight card
    rect(x + 16, y + 508, W - 32, 70, P.violet, { r: 14, opacity: 0.09 }),
    rect(x + 16, y + 508, W - 32, 70, 'transparent', { r: 14, stroke: P.violet, sw: 1, opacity: 0.25 }),
    text(x + 24, y + 520, 80, '✦ Insight', 9, P.violet, { ls: 0.1 }),
    text(x + 24, y + 538, W - 48,
      'Deep sleep was 12 min above your average — likely because you exercised yesterday afternoon.', 12, P.text, { lh: 1.65 }),

    ...navBar(x, y + H - 80, 1),
  ]);
}

// ─── SCREEN 3 — JOURNAL ──────────────────────────────────────────────────────
function screenJournal(ox, oy) {
  const x = ox, y = oy;
  const moods = ['😩', '😔', '😐', '🙂', '😄'];
  return frame(x, y, W, H, [
    ...statusBar(x, y),
    ...topBar(x, y + 44, 'Journal', 'BEFORE YOU SLEEP'),

    // Mood
    ...card(x + 16, y + 106, W - 32, 84, [
      sectionLabel(x + 24, y + 116, 'HOW ARE YOU FEELING?'),
      ...moods.map((e, i) => [
        rect(x + 24 + i * 62, y + 134, 54, 42, i === 3 ? `${P.violet}28` : P.surfaceB, { r: 10,
          stroke: i === 3 ? P.violet : 'transparent', sw: i === 3 ? 1 : 0 }),
        text(x + 24 + i * 62, y + 143, 54, e, 18, P.text, { center: true }),
      ]),
    ]),

    // Factors
    ...card(x + 16, y + 202, W - 32, 82, [
      sectionLabel(x + 24, y + 212, "TONIGHT'S FACTORS"),
      // Tag chips row 1
      ...[
        ['☕ caffeine', false, P.amber],
        ['🏃 exercise', true, P.green],
        ['😰 stress', false, P.rose],
        ['📱 screens', true, P.rose],
      ].reduce((acc, [label, on, color], i) => {
        const chipW = label.length * 7 + 18;
        const prevX = acc.nextX;
        acc.nextX += chipW + 8;
        return {
          nextX: acc.nextX,
          els: [...acc.els,
            rect(prevX, y + 230, chipW, 26, on ? `${color}22` : P.surfaceB, { r: 13,
              stroke: on ? color : 'transparent', sw: on ? 1 : 0 }),
            text(prevX + 4, y + 237, chipW - 8, label, 10, on ? color : P.muted, { center: true }),
          ],
        };
      }, { nextX: x + 24, els: [] }).els,
      // Row 2
      ...[
        ['🍷 alcohol', false, P.amber],
        ['🧘 meditation', false, P.indigo],
        ['💊 melatonin', false, P.violet],
      ].reduce((acc, [label, on, color], i) => {
        const chipW = label.length * 7 + 18;
        const prevX = acc.nextX;
        acc.nextX += chipW + 8;
        return {
          nextX: acc.nextX,
          els: [...acc.els,
            rect(prevX, y + 262, chipW, 26, on ? `${color}22` : P.surfaceB, { r: 13 }),
            text(prevX + 4, y + 269, chipW - 8, label, 10, P.muted, { center: true }),
          ],
        };
      }, { nextX: x + 24, els: [] }).els,
    ]),

    // Mind entry
    ...card(x + 16, y + 296, W - 32, 140, [
      sectionLabel(x + 24, y + 306, 'ONE THING ON YOUR MIND'),
      text(x + 24, y + 326, W - 48,
        'Presentation tomorrow is making me anxious. Kept going over the slides during dinner. Going to try the 4-7-8 breath before bed.',
        13, P.text, { lh: 1.75 }),
      rect(x + 24, y + 424, 2, 18, P.violet, { opacity: 0.85 }),
    ]),

    // Gratitude
    ...card(x + 16, y + 448, W - 32, 72, [
      sectionLabel(x + 24, y + 458, 'ONE GOOD THING TODAY'),
      text(x + 24, y + 476, W - 48,
        "Coffee with Mia at noon — hadn't laughed like that in weeks.", 13, P.text, { lh: 1.65, italic: true }),
    ]),

    // Breathing prompt
    rect(x + 16, y + 532, W - 32, 50, P.indigo, { r: 14, opacity: 0.1 }),
    rect(x + 16, y + 532, W - 32, 50, 'transparent', { r: 14, stroke: P.indigo, sw: 1, opacity: 0.25 }),
    text(x + 24, y + 545, 220, '🌬  4-7-8 breathing — tap to start', 13, P.indigo, { medium: true }),
    text(x + 24, y + 565, W - 48, '5-minute guided session to quiet your mind', 10, P.muted),

    // Save
    rect(x + 16, y + 596, W - 32, 48, P.violet, { r: 14 }),
    text(x + 16, y + 610, W - 32, 'Save Entry', 15, '#ffffff', { center: true, bold: true }),

    ...navBar(x, y + H - 80, 2),
  ]);
}

// ─── SCREEN 4 — TRENDS ───────────────────────────────────────────────────────
function screenTrends(ox, oy) {
  const x = ox, y = oy;
  const scores = [71, 68, 82, 79, 75, 84, 82];
  const days   = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const maxS = Math.max(...scores), minS = Math.min(...scores);
  const chartW = W - 48, chartH = 52;

  return frame(x, y, W, H, [
    ...statusBar(x, y),
    ...topBar(x, y + 44, 'Trends', 'LAST 7 NIGHTS'),

    // Average highlight
    ...card(x + 16, y + 106, W - 32, 58, [
      sectionLabel(x + 24, y + 116, '7-DAY AVERAGE'),
      text(x + 24, y + 132, 60, '77', 30, P.green, { mono: true, bold: true }),
      text(x + 90, y + 148, 50, '/ 100', 10, P.muted, { mono: true }),
      text(x + W - 136, y + 132, 112, '↑ +4 vs prior week', 12, P.green, { right: true }),
    ]),

    // Line chart
    ...card(x + 16, y + 176, W - 32, 106, [
      sectionLabel(x + 24, y + 186, 'SLEEP QUALITY SCORE'),
      // Chart grid lines
      ...[0.25, 0.5, 0.75].map(f =>
        rect(x + 24, y + 204 + f * chartH, chartW, 1, P.surfaceB)
      ),
      // Dots + connecting lines approx
      ...scores.map((v, i) => {
        const cx2 = x + 24 + (i / (scores.length - 1)) * chartW;
        const cy2 = y + 204 + chartH - ((v - minS) / (maxS - minS)) * chartH;
        return [
          rect(cx2 - 3, cy2 - 3, 6, 6, P.violet, { r: 3 }),
          i === scores.length - 1
            ? [
                rect(cx2 - 5, cy2 - 5, 10, 10, P.violet, { r: 5 }),
                text(cx2 - 15, cy2 - 18, 30, String(v), 9, P.violet, { center: true, mono: true }),
              ]
            : null,
        ];
      }),
      // Day labels
      ...days.map((d, i) =>
        text(x + 24 + (i / (days.length - 1)) * chartW - 8, y + 264, 16, d, 9, P.muted, { center: true })
      ),
    ]),

    // Correlations
    ...card(x + 16, y + 294, W - 32, 168, [
      sectionLabel(x + 24, y + 304, 'WHAT SHAPES YOUR SLEEP'),
      ...[
        { icon: '🏃', factor: 'Exercise day', impact: '+8 pts avg', color: P.green, pct: 0.85 },
        { icon: '📱', factor: 'Screen time >2h', impact: '−6 pts avg', color: P.rose, pct: 0.65 },
        { icon: '☕', factor: 'Caffeine after 2pm', impact: '−5 pts avg', color: P.amber, pct: 0.55 },
        { icon: '🧘', factor: 'Meditation', impact: '+4 pts avg', color: P.indigo, pct: 0.45 },
        { icon: '🍷', factor: 'Alcohol', impact: '−7 pts avg', color: P.rose, pct: 0.75 },
      ].map((item, i) => [
        text(x + 24, y + 324 + i * 24, 20, item.icon, 13, P.text),
        text(x + 48, y + 326 + i * 24, 170, item.factor, 12, P.text),
        text(x + W - 108, y + 326 + i * 24, 84, item.impact, 11, item.color, { right: true, mono: true }),
        rect(x + 24, y + 342 + i * 24, Math.round(chartW * item.pct * 0.88), 2, item.color, { r: 1, opacity: 0.4 }),
      ]),
    ]),

    // Sleep debt
    ...card(x + 16, y + 474, W - 32, 56, [
      text(x + 24, y + 486, 160, '😴 Sleep debt', 12, P.rose, { medium: true }),
      text(x + 24, y + 506, W - 48,
        '2h 24m accumulated this week — 3 full 8h nights to clear it', 11, P.muted),
    ]),

    // Streak
    rect(x + 16, y + 542, W - 32, 46, P.amber, { r: 14, opacity: 0.1 }),
    text(x + 24, y + 556, W - 48, '🔥  5-day streak of 7+ hour nights — your best run this month', 12, P.amber, { lh: 1.6 }),

    ...navBar(x, y + H - 80, 3),
  ]);
}

// ─── SCREEN 5 — PROFILE / SETTINGS ───────────────────────────────────────────
function screenProfile(ox, oy) {
  const x = ox, y = oy;
  return frame(x, y, W, H, [
    ...statusBar(x, y),
    ...topBar(x, y + 44, 'Your Profile', 'SLEEP SETTINGS'),

    // Sleep goal
    ...card(x + 16, y + 106, W - 32, 72, [
      sectionLabel(x + 24, y + 116, 'SLEEP GOAL'),
      text(x + 24, y + 134, 180, '8 hours / night', 16, P.text, { medium: true }),
      text(x + 24, y + 156, W - 100, 'Avg: 7h 18m — 42 min below target', 11, P.rose),
      rect(x + W - 96, y + 128, 76, 30, P.surfaceB, { r: 8 }),
      text(x + W - 96, y + 133, 76, '− 8h +', 13, P.text, { center: true }),
    ]),

    // Smart alarm
    ...card(x + 16, y + 190, W - 32, 72, [
      sectionLabel(x + 24, y + 200, 'SMART ALARM'),
      text(x + 24, y + 218, 220, '6:30 AM  ±20 min window', 15, P.text),
      text(x + 24, y + 240, W - 80, 'Wakes you in lightest sleep phase', 11, P.muted),
      rect(x + W - 60, y + 212, 44, 24, P.violet, { r: 12 }),
      rect(x + W - 36, y + 214, 20, 20, '#ffffff', { r: 10 }),
    ]),

    // Wind-down
    ...card(x + 16, y + 274, W - 32, 72, [
      sectionLabel(x + 24, y + 284, 'WIND-DOWN ROUTINE'),
      text(x + 24, y + 302, 220, '60 min before sleep window', 15, P.text),
      text(x + 24, y + 324, W - 80, 'Begins 9:30 PM · Includes journal prompt', 11, P.muted),
      rect(x + W - 96, y + 296, 76, 30, P.surfaceB, { r: 8 }),
      text(x + W - 96, y + 301, 76, '− 60 +', 13, P.text, { center: true }),
    ]),

    // Connected sources
    ...card(x + 16, y + 358, W - 32, 148, [
      sectionLabel(x + 24, y + 368, 'CONNECTED SOURCES'),
      ...[
        { icon: '❤️', name: 'Apple Health', status: 'Connected', color: P.green },
        { icon: '💍', name: 'Oura Ring Gen3', status: 'Connected', color: P.green },
        { icon: '🌡', name: 'Nest Thermostat', status: 'Connected', color: P.green },
        { icon: '📡', name: 'Whoop 4.0', status: 'Link device', color: P.muted },
      ].map((d, i) => [
        text(x + 24, y + 390 + i * 26, 20, d.icon, 14, P.text),
        text(x + 50, y + 392 + i * 26, 170, d.name, 13, P.text),
        text(x + W - 110, y + 392 + i * 26, 86, d.status, 11, d.color, { right: true }),
      ]),
    ]),

    // Notification toggle
    ...card(x + 16, y + 518, W - 32, 44, [
      text(x + 24, y + 532, 220, '🔔  Wind-down reminder', 13, P.text),
      rect(x + W - 60, y + 528, 44, 24, P.violet, { r: 12 }),
      rect(x + W - 36, y + 530, 20, 20, '#ffffff', { r: 10 }),
    ]),

    // Sleep science note
    rect(x + 16, y + 574, W - 32, 60, P.violet, { r: 14, opacity: 0.07 }),
    text(x + 24, y + 586, W - 48,
      'HUSH uses CBT-I (Cognitive Behavioural Therapy for Insomnia) principles — clinically proven to outperform sleep medication long-term.',
      11, P.muted, { lh: 1.65 }),

    ...navBar(x, y + H - 80, 4),
  ]);
}

// ─── COMPOSE ─────────────────────────────────────────────────────────────────
const screens = [
  screenTonight(0, 0),
  screenSleep(W + GAP, 0),
  screenJournal((W + GAP) * 2, 0),
  screenTrends((W + GAP) * 3, 0),
  screenProfile((W + GAP) * 4, 0),
];

const totalW = W * 5 + GAP * 4;
const pen = {
  version: '2.8',
  name: 'HUSH — sleep intelligence',
  width: totalW,
  height: H,
  fill: P.bg,
  children: screens,
};

const out = path.join(__dirname, 'hush.pen');
fs.writeFileSync(out, JSON.stringify(pen, null, 2));
const n = (JSON.stringify(pen).match(/"type"/g) || []).length;
console.log(`✓ Written: ${out}`);
console.log(`  Screens: 5`);
console.log(`  Canvas:  ${totalW} × ${H}`);
console.log(`  Nodes:   ~${n}`);
