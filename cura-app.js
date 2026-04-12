// cura-app.js — CURA: Your longevity OS, distilled
//
// Inspiration:
//   1. Superpower (via godly.website, Mar 25 2026) — "A new era of personal health."
//      Dark editorial, dramatic amber photography, intimate direct copy. Personal
//      health treated as editorial experience rather than clinical UI.
//   2. SIRNIK Portfolio (land-book.com, Mar 25 2026) — "Design as balance between
//      structure and emotion." Swiss editorial confidence: bold type hierarchy,
//      thin dividers as structural elements, jet-black foundation.
//   3. Echelon® (land-book.com scroll, Mar 25 2026) — Dark project grid with
//      accent-colored left-edge rules per row — imported as the metric row pattern.
//
// Challenge: Design a personal longevity OS for health-obsessed founders & creators.
//   Style push: "Warm dark editorial" — not cold tech dark (#0A0A0A) but a rich
//   near-black with warm undertone (#0F0E0C), terracotta/amber accent, Swiss
//   editorial weight contrast. Echelon's left-rule accent-line pattern for metrics.
//   Zero health-app clichés: no pill icons, no green gradients, no activity rings.
//
// Theme: DARK — #0F0E0C + amber #E8821A + warm cream #F5F0E8
// Screens: 5 — Today, Body, Mind, Nourish, Goals

'use strict';
const fs = require('fs');
const W = 390, H = 844;
let idC = 1;
const uid = () => `c${idC++}`;

const p = {
  bg:         '#0F0E0C',
  surface:    '#1C1A17',
  surfaceAlt: '#252219',
  text:       '#F5F0E8',
  textSub:    '#A89E8C',
  textFaint:  '#5C5448',
  accent:     '#E8821A',
  accentSoft: '#2A1E0F',
  green:      '#4ADE80',
  red:        '#EF4444',
  blue:       '#60A5FA',
  purple:     '#A78BFA',
  border:     '#2A2620',
};

const el = (type, x, y, w, h, props = {}) =>
  ({ id: uid(), type, x, y, width: w, height: h, ...props });

const rect = (x, y, w, h, fill, r = 0, props = {}) =>
  el('rectangle', x, y, w, h, { fill, cornerRadius: r, strokeWidth: 0, ...props });

const text = (x, y, w, h, content, size, weight, color, align = 'left', props = {}) =>
  el('text', x, y, w, h, { content, fontSize: size, fontWeight: weight, fill: color, textAlignHorizontal: align, ...props });

const hline = (x, y, w, color, opacity = 1) =>
  el('rectangle', x, y, w, 1, { fill: color, strokeWidth: 0, opacity });

const screens = [];

function makeScreen(name, children) {
  const screen = {
    id: uid(), type: 'frame', name,
    x: 0, y: 0, width: W, height: H,
    fill: p.bg, children: children.filter(Boolean),
  };
  screens.push(screen);
  return screen;
}

function statusBar() {
  return [
    text(20, 14, 100, 16, '9:41', 12, '500', p.textSub),
    text(W - 80, 14, 70, 16, '●●● WiFi', 11, '400', p.textSub, 'right'),
  ];
}

const navItems = [
  { label: 'Today', icon: '◈' },
  { label: 'Body',  icon: '○' },
  { label: 'Mind',  icon: '◇' },
  { label: 'Nourish', icon: '△' },
  { label: 'Goals', icon: '□' },
];

function bottomNav(active = 0) {
  const navH = 72, navY = H - navH;
  const itemW = W / navItems.length;
  const els = [
    rect(0, navY, W, navH, p.surface),
    hline(0, navY, W, p.border),
  ];
  navItems.forEach((item, i) => {
    const x = i * itemW;
    const isActive = i === active;
    const col = isActive ? p.accent : p.textFaint;
    els.push(
      text(x, navY + 10, itemW, 20, item.icon, 18, '400', col, 'center'),
      text(x, navY + 32, itemW, 14, item.label, 9, isActive ? '600' : '400', col, 'center'),
    );
    if (isActive) {
      els.push(rect(x + Math.round(itemW / 2) - 10, navY + 1, 20, 2, p.accent, 1));
    }
  });
  return els;
}

// Small donut-style score display using concentric rectangles
function scoreDisplay(cx, cy, score, label) {
  const r = 44;
  return [
    el('ellipse', cx - r, cy - r, r * 2, r * 2, { fill: p.surfaceAlt, strokeWidth: 0 }),
    el('ellipse', cx - r + 6, cy - r + 6, (r - 6) * 2, (r - 6) * 2, { fill: p.bg, strokeWidth: 0 }),
    text(cx - 30, cy - 18, 60, 36, String(score), 32, '700', p.text, 'center'),
    text(cx - 30, cy + 18, 60, 14, label, 9, '600', p.textSub, 'center'),
  ];
}

// Echelon-inspired metric row: 2px left accent rule + label/value
function metricRow(x, y, w, label, value, badge, accentColor = p.accent) {
  const els = [
    rect(x, y, 2, 40, accentColor),
    text(x + 14, y + 4,  w * 0.55, 15, label, 11, '400', p.textSub),
    text(x + 14, y + 21, w * 0.55, 18, value, 15, '600', p.text),
  ];
  if (badge) {
    els.push(text(x + w - 80, y + 12, 80, 14, badge, 10, '400', p.textSub, 'right'));
  }
  return els;
}

function card(x, y, w, h, children = []) {
  return [rect(x, y, w, h, p.surface, 12), ...children];
}

function progressBar(x, y, w, pct, color, label, valueLabel) {
  const els = [];
  if (label)      els.push(text(x, y - 20, w * 0.6,  15, label, 10, '400', p.textSub));
  if (valueLabel) els.push(text(x + w - 90, y - 20, 90, 15, valueLabel, 10, '500', p.text, 'right'));
  els.push(rect(x, y, w, 4, p.surfaceAlt, 2));
  els.push(rect(x, y, Math.round(w * pct), 4, color, 2));
  return els;
}

// ============================================================
// SCREEN 1 — TODAY
// ============================================================
makeScreen('Today', [
  rect(0, 0, W, H, p.bg),
  ...statusBar(),

  text(20, 44, 200, 18, 'Good morning', 14, '400', p.textSub),
  text(20, 64, 280, 36, 'Your vitals.', 30, '700', p.text),

  // Date pill
  rect(W - 104, 52, 90, 26, p.surfaceAlt, 13),
  text(W - 104, 56, 90, 18, 'Tue Mar 25', 10, '500', p.textSub, 'center'),

  // Health score card
  ...card(20, 110, W - 40, 132, [
    ...scoreDisplay(76, 178, 87, 'SCORE'),

    text(148, 124, 210, 16, 'Today\'s Health', 12, '600', p.text),
    text(148, 143, 210, 14, '↑ +4 pts vs yesterday', 11, '400', p.green),

    text(148, 166, 88, 13, 'Recovery', 9, '400', p.textSub),
    text(148, 179, 60, 16, '92%',      13, '700', p.green),

    text(222, 166, 88, 13, 'Readiness', 9, '400', p.textSub),
    text(222, 179, 70, 16, '84%',       13, '700', p.accent),

    text(296, 166, 80, 13, 'Stress', 9, '400', p.textSub),
    text(296, 179, 60, 16, 'Low',    13, '700', p.blue),

    hline(148, 208, W - 40 - 148 + 20, p.border),
    text(148, 214, 220, 13, 'HRV 68ms · RHR 52bpm · Sleep 7h32m', 9, '400', p.textFaint),
  ]),

  // AI insight strip
  ...card(20, 254, W - 40, 76, [
    rect(20, 254, 3, 76, p.accent),
    text(36, 266, 30, 18, '✦', 13, '400', p.accent),
    text(58, 266, W - 98, 14, 'CURA INSIGHT', 8, '700', p.accent),
    text(58, 282, W - 98, 34, 'Your HRV is 12% above baseline — ideal conditions for high-intensity training today.', 11, '400', p.text),
  ]),

  // Metrics section
  text(20, 346, 200, 13, 'TODAY\'S METRICS', 8, '700', p.textFaint),
  hline(20, 361, W - 40, p.border),

  ...metricRow(20, 367, W - 40, 'Heart Rate', '58 bpm', 'Resting', p.accent),
  hline(20, 411, W - 40, p.border),
  ...metricRow(20, 417, W - 40, 'Sleep Quality', '82 / 100', '7h 32m', p.blue),
  hline(20, 461, W - 40, p.border),
  ...metricRow(20, 467, W - 40, 'Glucose', '94 mg/dL', 'Stable', p.green),
  hline(20, 511, W - 40, p.border),
  ...metricRow(20, 517, W - 40, 'Steps', '4,210', '56% goal', p.textSub),
  hline(20, 561, W - 40, p.border),
  ...metricRow(20, 567, W - 40, 'Hydration', '1.4 L', '56% goal', p.blue),

  ...bottomNav(0),
]);

// ============================================================
// SCREEN 2 — BODY
// ============================================================
makeScreen('Body', [
  rect(0, 0, W, H, p.bg),
  ...statusBar(),

  text(20, 44, 200, 14, 'BODY', 8, '700', p.accent),
  text(20, 58, 280, 36, 'Physical', 30, '700', p.text),
  text(20, 92, 280, 32, 'metrics.', 30, '700', p.textFaint),

  // HR + HRV cards side by side
  ...card(20, 136, 165, 116, [
    text(32, 150, 100, 12, 'HEART RATE', 8, '700', p.accent),
    text(32, 166, 100, 44, '58', 42, '700', p.text),
    text(32, 210, 60, 14, 'bpm', 10, '400', p.textSub),
    ...[8, 20, 12, 34, 10, 22, 15, 8].map((h, i) =>
      rect(96 + i * 9, 232 - h, 5, h, i === 3 ? p.accent : p.surfaceAlt, 1)
    ),
  ]),
  ...card(197, 136, 173, 116, [
    text(210, 150, 100, 12, 'HRV', 8, '700', p.blue),
    text(210, 166, 100, 44, '68', 42, '700', p.text),
    text(210, 210, 60, 14, 'ms', 10, '400', p.textSub),
    text(210, 226, 150, 13, '↑ +8ms vs 30d avg', 10, '400', p.green),
  ]),

  // Recovery banner
  ...card(20, 264, W - 40, 72, [
    text(32, 276, 160, 13, 'RECOVERY SCORE', 8, '700', p.textFaint),
    text(32, 292, 80, 32, '92%', 26, '700', p.green),
    text(112, 302, 150, 14, 'Full recovery · Green zone', 11, '400', p.textSub),
    rect(W - 40 - 20 - 160, 280, 156, 6, p.surfaceAlt, 3),
    rect(W - 40 - 20 - 160, 280, 143, 6, p.green, 3),
  ]),

  text(20, 350, 200, 13, 'ACTIVITY', 8, '700', p.textFaint),
  hline(20, 365, W - 40, p.border),

  ...metricRow(20, 371, W - 40, 'Active Calories', '381 kcal', '76% goal', p.accent),
  hline(20, 415, W - 40, p.border),
  ...metricRow(20, 421, W - 40, 'Exercise Time', '28 min', 'Goal: 30m', p.blue),
  hline(20, 465, W - 40, p.border),
  ...metricRow(20, 471, W - 40, 'Stand Hours', '8 / 12', '67%', p.green),
  hline(20, 515, W - 40, p.border),
  ...metricRow(20, 521, W - 40, 'Resting HR', '52 bpm', '↓ improving', p.accent),
  hline(20, 565, W - 40, p.border),
  ...metricRow(20, 571, W - 40, 'VO2 Estimate', '46.2', 'Excellent', p.purple),

  ...bottomNav(1),
]);

// ============================================================
// SCREEN 3 — MIND
// ============================================================
makeScreen('Mind', [
  rect(0, 0, W, H, p.bg),
  ...statusBar(),

  text(20, 44, 200, 14, 'MIND', 8, '700', p.accent),
  text(20, 58, 280, 36, 'Cognitive', 30, '700', p.text),
  text(20, 92, 280, 32, 'clarity.', 30, '700', p.textFaint),

  // Focus score card
  ...card(20, 136, W - 40, 96, [
    text(32, 150, 200, 13, 'FOCUS SCORE TODAY', 8, '700', p.textFaint),
    text(32, 166, 120, 48, '78', 46, '700', p.text),
    text(94, 198, 54, 16, '/ 100', 13, '400', p.textSub),
    text(32, 216, 200, 14, 'Above average — blue zone', 11, '400', p.blue),

    rect(220, 146, 138, 72, p.surfaceAlt, 8),
    text(230, 156, 100, 12, 'MOOD', 8, '700', p.textFaint),
    text(230, 172, 118, 20, 'Focused', 15, '600', p.text),
    text(230, 195, 118, 14, 'Low cortisol ↓', 11, '400', p.green),
  ]),

  // Sleep architecture
  text(20, 248, 260, 13, 'SLEEP ARCHITECTURE', 8, '700', p.textFaint),
  hline(20, 263, W - 40, p.border),

  ...[
    { label: 'Awake', mins: 12,  pct: 0.05, color: p.red    },
    { label: 'Light', mins: 148, pct: 0.41, color: p.blue   },
    { label: 'Deep',  mins: 110, pct: 0.30, color: p.accent },
    { label: 'REM',   mins: 92,  pct: 0.25, color: p.purple },
  ].flatMap((s, i) => [
    text(20, 271 + i * 38,  72, 14, s.label, 11, '400', p.textSub),
    rect(86, 279 + i * 38, 226, 5, p.surfaceAlt, 2),
    rect(86, 279 + i * 38, Math.round(226 * s.pct), 5, s.color, 2),
    text(318, 271 + i * 38, 56, 14, `${s.mins}m`, 11, '500', p.text, 'right'),
  ]),

  text(20, 430, 260, 13, 'MENTAL WELLNESS', 8, '700', p.textFaint),
  hline(20, 445, W - 40, p.border),

  ...metricRow(20, 451, W - 40, 'Stress Level', 'Low', '28 / 100', p.green),
  hline(20, 495, W - 40, p.border),
  ...metricRow(20, 501, W - 40, 'Meditation', '12 min', 'Today', p.purple),
  hline(20, 545, W - 40, p.border),
  ...metricRow(20, 551, W - 40, 'Mindfulness Streak', '14 days', '🔥', p.accent),
  hline(20, 595, W - 40, p.border),
  ...metricRow(20, 601, W - 40, 'Deep Work Sessions', '3', '4h 10m', p.blue),

  ...bottomNav(2),
]);

// ============================================================
// SCREEN 4 — NOURISH
// ============================================================
makeScreen('Nourish', [
  rect(0, 0, W, H, p.bg),
  ...statusBar(),

  text(20, 44, 200, 14, 'NOURISH', 8, '700', p.accent),
  text(20, 58, 280, 36, 'Fuel your', 30, '700', p.text),
  text(20, 92, 280, 32, 'longevity.', 30, '700', p.textFaint),

  // Calorie summary card
  ...card(20, 136, W - 40, 108, [
    ...scoreDisplay(72, 196, 1840, 'kcal'),

    text(140, 148, 220, 13, 'CALORIES TODAY', 8, '700', p.textFaint),
    text(140, 164, 200, 24, '1,840 / 2,400', 19, '600', p.text),
    text(140, 190, 180, 14, '560 remaining', 11, '400', p.green),
    hline(140, 208, W - 40 - 140 + 20, p.border),
    text(140, 214, 220, 13, 'On track with longevity protocol', 10, '400', p.textFaint),
  ]),

  // Macros
  text(20, 258, 200, 13, 'MACRONUTRIENTS', 8, '700', p.textFaint),
  hline(20, 273, W - 40, p.border),

  ...[
    { label: 'Protein', g: 112, goal: 150, pct: 0.75, color: p.accent },
    { label: 'Fat',     g: 68,  goal: 80,  pct: 0.85, color: p.blue   },
    { label: 'Carbs',   g: 180, goal: 200, pct: 0.90, color: p.green  },
    { label: 'Fiber',   g: 24,  goal: 30,  pct: 0.80, color: p.purple },
  ].flatMap((m, i) =>
    progressBar(20, 300 + i * 46, W - 40, m.pct, m.color, m.label, `${m.g}g / ${m.goal}g`)
  ),

  // Recent meals
  text(20, 492, 200, 13, 'RECENT MEALS', 8, '700', p.textFaint),
  hline(20, 507, W - 40, p.border),

  ...card(20, 513, W - 40, 50, [
    rect(32, 523, 34, 30, p.surfaceAlt, 6),
    text(33, 530, 32, 16, '🍳', 16, '400', p.text, 'center'),
    text(78, 521, 190, 15, 'Eggs & avocado toast', 12, '500', p.text),
    text(78, 538, 170, 13, '7:42 AM · 480 kcal', 10, '400', p.textSub),
    text(W - 56, 527, 48, 14, 'P +32g', 9, '600', p.accent, 'right'),
  ]),
  ...card(20, 571, W - 40, 50, [
    rect(32, 581, 34, 30, p.surfaceAlt, 6),
    text(33, 588, 32, 16, '🥗', 16, '400', p.text, 'center'),
    text(78, 579, 190, 15, 'Grilled chicken salad', 12, '500', p.text),
    text(78, 596, 170, 13, '1:15 PM · 620 kcal', 10, '400', p.textSub),
    text(W - 56, 585, 48, 14, 'P +54g', 9, '600', p.green, 'right'),
  ]),
  ...card(20, 629, W - 40, 50, [
    rect(32, 639, 34, 30, p.surfaceAlt, 6),
    text(33, 646, 32, 16, '🫐', 16, '400', p.text, 'center'),
    text(78, 637, 190, 15, 'Greek yogurt & berries', 12, '500', p.text),
    text(78, 654, 170, 13, '4:00 PM · 210 kcal', 10, '400', p.textSub),
    text(W - 56, 643, 48, 14, 'P +14g', 9, '600', p.blue, 'right'),
  ]),

  ...bottomNav(3),
]);

// ============================================================
// SCREEN 5 — GOALS
// ============================================================
makeScreen('Goals', [
  rect(0, 0, W, H, p.bg),
  ...statusBar(),

  text(20, 44, 200, 14, 'GOALS', 8, '700', p.accent),
  text(20, 58, 280, 36, 'Longevity', 30, '700', p.text),
  text(20, 92, 280, 32, 'protocol.', 30, '700', p.textFaint),

  // Week summary
  rect(20, 136, W - 40, 60, p.surfaceAlt, 12),
  text(32, 148, 240, 13, 'WEEK 12 OF 52', 8, '700', p.textFaint),
  text(32, 164, 240, 20, '4 of 7 goals on track', 14, '500', p.text),
  rect(W - 80, 148, 56, 28, p.accent, 14),
  text(W - 80, 154, 56, 16, '57%', 12, '700', p.bg, 'center'),

  text(20, 212, 200, 13, 'ACTIVE GOALS', 8, '700', p.textFaint),
  hline(20, 227, W - 40, p.border),

  ...[
    { label: 'VO2 Max: 50+',       sub: 'Cardio endurance',  pct: 0.72, val: '46.2 / 50',   color: p.accent },
    { label: 'Body Comp 18%',      sub: 'Fat percentage',    pct: 0.85, val: '20.1% → 18%', color: p.blue   },
    { label: 'Sleep Quality 85+',  sub: 'Average score',     pct: 0.96, val: '82 / 85',     color: p.purple },
    { label: 'Daily Steps 10K',    sub: 'Avg over 30 days',  pct: 0.62, val: '6,200 avg',   color: p.textSub },
  ].flatMap((goal, i) => {
    const y = 235 + i * 84;
    return [
      rect(20, y, 2, 66, goal.color),
      text(34, y + 8,  252, 16, goal.label, 13, '600', p.text),
      text(34, y + 26, 200, 13, goal.sub,   10, '400', p.textSub),
      rect(W - 82, y + 6, 68, 22, p.surfaceAlt, 11),
      text(W - 82, y + 10, 68, 14,
        goal.pct >= 0.95 ? 'Almost' : goal.pct >= 0.70 ? 'On track' : 'Behind',
        10, '500', goal.pct >= 0.70 ? goal.color : p.textSub, 'center'),
      rect(34, y + 44, W - 60, 4, p.surfaceAlt, 2),
      rect(34, y + 44, Math.round((W - 60) * goal.pct), 4, goal.color, 2),
      text(W - 92, y + 32, 84, 13, goal.val, 10, '400', p.textSub, 'right'),
      hline(20, y + 66, W - 40, p.border),
    ];
  }),

  ...bottomNav(4),
]);

// ============================================================
// ASSEMBLE PEN
// ============================================================
const pen = {
  version: '2.8',
  meta: {
    name: 'CURA',
    description: 'Your longevity OS, distilled',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
  },
  canvas: {
    width: W * screens.length + 40 * (screens.length + 1),
    height: H + 80,
    background: '#080806',
  },
  screens: screens.map((screen, i) => ({
    ...screen,
    x: 40 + i * (W + 40),
    y: 40,
  })),
};

fs.writeFileSync('cura.pen', JSON.stringify(pen, null, 2));
const totalEls = pen.screens.reduce((n, s) => n + (s.children?.length || 0), 0);
console.log(`✓ cura.pen written — ${screens.length} screens, ${totalEls} elements`);
