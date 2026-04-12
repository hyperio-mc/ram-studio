'use strict';
// tendril-app.js
// TENDRIL — Personal Growth & Habit Intelligence
//
// Challenge: Design a LIGHT-theme wellness habit tracker inspired by:
// 1. Shapify (lapa.ninja) — soft lavender/purple gradient over imagery,
//    beauty-tech elegance with "The Future of Beauty is Automated" aesthetic.
//    Translated: warm parchment white + muted lavender accent + editorial hierarchy.
// 2. Console (land-book.com) — clean light SaaS analytics: soft area charts,
//    team photography in rounded cards, whisper-light surface tones.
//    Translated: gentle area-chart progress visualization on white cards.
// 3. Ysabella Nicole Alvarez (minimal.gallery) — sticker/tape whimsy elements
//    on white background, "Crafting intuitive experiences with a dash of whimsy."
//    Translated: pill tags and soft badge elements with playful typography.
//
// Theme: LIGHT (previous vigil.pen was dark)
// Palette: warm parchment bg + lavender accent + sage green + terracotta warmth
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#F5F3EF',   // warm parchment (Console-inspired warm white)
  surface:  '#FFFFFF',   // pure card white
  surface2: '#EEE9E4',   // warm grey for inset areas
  surface3: '#E8E2DB',   // slightly deeper warm surface
  border:   '#DDD7CF',   // warm border
  muted:    '#9E978E',   // warm grey muted text
  fg:       '#1C1917',   // warm near-black
  accent:   '#7C6EAD',   // soft lavender (Shapify-inspired purple)
  accent2:  '#5A9E78',   // sage green (growth / nature)
  warm:     '#C97B52',   // terracotta warm accent
  sky:      '#8AAFCA',   // muted sky blue
  lavLight: '#EDE9F8',   // lavender tint for backgrounds
  sageLight:'#E2F0E9',   // sage tint for backgrounds
  warmLight:'#F7EAE0',   // terracotta tint
};

let _id = 0;
const uid = () => `td${++_id}`;

// ── Primitives ────────────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill || P.bg,
  clip: opts.clip !== undefined ? opts.clip : false,
  ...(opts.r !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.ch || [],
});

const T = (content, x, y, w, h, opts = {}) => ({
  id: uid(), type: 'text', content, x, y, width: w, height: h,
  textGrowth: 'fixed-width-height',
  fontSize: opts.size || 13,
  fontWeight: String(opts.weight || 400),
  fill: opts.fill || P.fg,
  textAlign: opts.align || 'left',
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh !== undefined ? { lineHeight: opts.lh } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Line  = (x, y, w, fill = P.border) => F(x, y, w, 1, fill, {});

// ── Lavender gradient wash (Shapify-inspired) ─────────────────────────────────
const LavGradient = (x, y, w, h, opacity = 0.18) => [
  F(x, y, w, h, P.lavLight, { opacity }),
];

// ── Area chart (Console-inspired soft analytics) ──────────────────────────────
const AreaChart = (x, y, w, h, values, color, label) => {
  const items = [];
  const maxV = Math.max(...values, 1);
  const barW = Math.floor((w - 8) / values.length) - 2;

  // Soft background area
  items.push(F(x, y, w, h, color + '10', { r: 10 }));

  // Chart bars as soft pillars
  values.forEach((v, i) => {
    const bh = Math.round((v / maxV) * (h - 20));
    const bx = x + 4 + i * (barW + 2);
    const by = y + (h - 10) - bh;
    const isLast = i === values.length - 1;
    items.push(F(bx, by, barW, bh, isLast ? color : color + '60', { r: 3 }));
  });

  // Label
  if (label) {
    items.push(T(label, x + 8, y + 6, w - 16, 12,
      { size: 9, fill: color, weight: 700, ls: 1.0 }));
  }
  return items;
};

// ── Streak ring ────────────────────────────────────────────────────────────────
const StreakRing = (cx, cy, streak, color) => {
  const items = [];
  // Outer ring background
  items.push(E(cx - 42, cy - 42, 84, 84, color + '18'));
  items.push(E(cx - 36, cy - 36, 72, 72, P.surface, { stroke: color + '30', sw: 2 }));
  // Inner colored ring
  items.push(E(cx - 30, cy - 30, 60, 60, color + '25'));
  items.push(E(cx - 22, cy - 22, 44, 44, P.surface));
  // Streak number
  items.push(T(String(streak), cx - 18, cy - 16, 36, 32,
    { size: 24, fill: color, weight: 800, align: 'center', ls: -1 }));
  items.push(T('day', cx - 12, cy + 16, 24, 12,
    { size: 8, fill: P.muted, align: 'center', weight: 600, ls: 1 }));
  return items;
};

// ── Habit row ─────────────────────────────────────────────────────────────────
const HabitRow = (x, y, w, emoji, label, sub, pct, color, done = false) => {
  const ch = [];
  // Emoji circle
  ch.push(F(0, 0, 44, 44, color + '18', { r: 12 }));
  ch.push(T(emoji, 10, 8, 24, 28, { size: 20, align: 'center' }));
  // Text
  ch.push(T(label, 54, 4, w - 130, 18, { size: 14, weight: 600, fill: P.fg }));
  ch.push(T(sub, 54, 24, w - 130, 14, { size: 11, fill: P.muted }));
  // Progress bar
  ch.push(F(54, 40, w - 130, 4, P.surface2, { r: 2 }));
  ch.push(F(54, 40, Math.round((w - 130) * pct / 100), 4, color, { r: 2 }));
  // Pct
  ch.push(T(`${pct}%`, w - 68, 14, 36, 16,
    { size: 12, fill: color, weight: 700, align: 'right' }));
  // Done check
  const checkFill = done ? color : P.surface2;
  ch.push(F(w - 50, 10, 24, 24, checkFill, {
    r: 12,
    stroke: done ? color : P.border,
    sw: 1.5,
    ch: done ? [
      T('✓', 4, 4, 16, 16, { size: 11, fill: '#fff', align: 'center', weight: 700 })
    ] : [],
  }));
  return F(x, y, w, 56, P.surface, { r: 14, stroke: P.border, sw: 1, ch });
};

// ── Mood button ───────────────────────────────────────────────────────────────
const MoodBtn = (x, y, emoji, label, selected, color) => {
  const bg = selected ? color + '22' : P.surface;
  const border = selected ? color : P.border;
  return F(x, y, 64, 72, bg, {
    r: 14, stroke: border, sw: selected ? 1.5 : 1,
    ch: [
      T(emoji, 16, 8, 32, 32, { size: 24, align: 'center' }),
      T(label, 4, 44, 56, 14, { size: 10, fill: selected ? color : P.muted, align: 'center', weight: selected ? 600 : 400 }),
    ],
  });
};

// ── Insight card ──────────────────────────────────────────────────────────────
const InsightCard = (x, y, w, h, title, value, sub, color, icon) => F(x, y, w, h, P.surface, {
  r: 16, stroke: P.border, sw: 1,
  ch: [
    F(0, 0, w, 4, color, { r: 16 }),   // color top bar
    T(icon, 14, 14, 24, 24, { size: 18 }),
    T(title.toUpperCase(), 44, 18, w - 58, 12,
      { size: 8, fill: P.muted, ls: 1.2, weight: 700 }),
    T(value, 14, 42, w - 28, 36,
      { size: 26, fill: color, weight: 800, ls: -1 }),
    T(sub, 14, 80, w - 28, 14,
      { size: 11, fill: P.muted }),
  ],
});

// ── Friend streak card ────────────────────────────────────────────────────────
const FriendCard = (x, y, name, handle, streak, habits, color) => {
  const initials = name.split(' ').map(n => n[0]).join('');
  return F(x, y, 350, 68, P.surface, {
    r: 16, stroke: P.border, sw: 1,
    ch: [
      // Avatar circle
      E(14, 14, 40, 40, color + '30'),
      T(initials, 14, 20, 40, 28, { size: 15, fill: color, weight: 700, align: 'center' }),
      // Name + handle
      T(name, 66, 10, 160, 18, { size: 14, weight: 600, fill: P.fg }),
      T('@' + handle, 66, 30, 160, 14, { size: 11, fill: P.muted }),
      T(`${habits} habits`, 66, 46, 160, 14, { size: 10, fill: P.muted }),
      // Streak
      F(244, 14, 92, 40, color + '14', { r: 12, ch: [
        T('🔥', 8, 6, 24, 28, { size: 18 }),
        T(`${streak}d`, 32, 8, 40, 20, { size: 15, fill: color, weight: 800 }),
        T('streak', 30, 26, 50, 12, { size: 9, fill: P.muted }),
      ]}),
    ],
  });
};

// ── Tag pill ──────────────────────────────────────────────────────────────────
const Tag = (x, y, label, color) => F(x, y, label.length * 7 + 22, 26, color + '18', {
  r: 13,
  ch: [T(label, 10, 5, label.length * 7 + 4, 16, { size: 11, fill: color, weight: 600 })],
});

// ── Bottom nav ────────────────────────────────────────────────────────────────
const BottomNav = (active) => {
  const tabs = [
    { icon: '◉', label: 'Today', id: 0 },
    { icon: '⬡', label: 'Garden', id: 1 },
    { icon: '◎', label: 'Reflect', id: 2 },
    { icon: '◈', label: 'Insights', id: 3 },
    { icon: '⬟', label: 'Circles', id: 4 },
  ];
  const ch = [
    F(0, 0, 390, 1, P.border),
  ];
  tabs.forEach((tab, i) => {
    const isActive = i === active;
    const tx = 16 + i * 74;
    ch.push(F(tx, 8, 62, 52, 'transparent', {
      ch: [
        T(tab.icon, 16, 4, 30, 22, { size: 18, fill: isActive ? P.accent : P.muted, align: 'center' }),
        T(tab.label, 2, 26, 58, 14, { size: 9, fill: isActive ? P.accent : P.muted, align: 'center', weight: isActive ? 700 : 400 }),
      ],
    }));
  });
  return F(0, 776, 390, 68, P.surface, { stroke: P.border, sw: 0, ch });
};

// ── Status bar ────────────────────────────────────────────────────────────────
const StatusBar = () => F(0, 0, 390, 44, 'transparent', {
  ch: [
    T('9:41', 20, 14, 60, 16, { size: 13, weight: 600, fill: P.fg }),
    T('●●● ▲ ▌▌▌ ⬡', 280, 14, 100, 16, { size: 10, fill: P.fg, align: 'right' }),
  ],
});

// ── SCREEN 1: TODAY (Morning Check-in) ───────────────────────────────────────
const Screen1 = () => {
  const ch = [];

  // Warm background
  ch.push(F(0, 0, 390, 844, P.bg));

  // Lavender gradient wash at top (Shapify-inspired)
  ch.push(F(0, 0, 390, 220, P.lavLight, { opacity: 0.6 }));
  ch.push(E(-40, -60, 300, 280, P.accent + '0A'));

  ch.push(StatusBar());

  // Greeting header
  ch.push(T('Good morning,', 24, 52, 260, 22, { size: 15, fill: P.muted, weight: 400 }));
  ch.push(T('Mia ✦', 24, 72, 280, 36, { size: 28, fill: P.fg, weight: 800, ls: -0.8 }));

  // Date pill
  ch.push(Tag(24, 112, 'Thu, Mar 26', P.accent));

  // Streak ring
  ch.push(...StreakRing(314, 100, 18, P.accent));

  // Daily intention card (editorial quote, Console-inspired card)
  const intentionCard = F(20, 148, 350, 106, P.surface, {
    r: 18, stroke: P.border, sw: 1,
    ch: [
      F(0, 0, 4, 106, P.accent, { r: 4 }),   // accent left border
      T('TODAY`S INTENTION', 20, 14, 260, 12, { size: 9, fill: P.muted, ls: 1.5, weight: 700 }),
      T('"Small roots grow the deepest.', 20, 32, 310, 20, { size: 14, fill: P.fg, weight: 600, ls: -0.3, lh: 1.4 }),
      T('Show up for just one habit."', 20, 52, 310, 20, { size: 14, fill: P.fg, weight: 600, ls: -0.3, lh: 1.4 }),
      T('— Tendril Daily', 20, 80, 200, 14, { size: 11, fill: P.accent, weight: 600 }),
    ],
  });
  ch.push(intentionCard);

  // Section label
  ch.push(T("TODAY`S HABITS", 24, 266, 200, 14, { size: 10, fill: P.muted, ls: 1.5, weight: 700 }));
  ch.push(T('4 of 6 done', 280, 266, 90, 14, { size: 10, fill: P.accent2, align: 'right', weight: 600 }));

  // Habit rows
  ch.push(HabitRow(20, 288, 350, '🧘', 'Morning Meditation', '10 min · 7-day streak', 100, P.accent, true));
  ch.push(HabitRow(20, 352, 350, '💧', 'Hydration', '6 of 8 glasses', 75, P.sky, false));
  ch.push(HabitRow(20, 416, 350, '📖', 'Evening Reading', '20 min · in progress', 60, P.accent2, false));
  ch.push(HabitRow(20, 480, 350, '🌿', 'Walk Outside', '30 min · not started', 0, P.warm, false));

  // Quick add
  ch.push(F(20, 548, 350, 48, P.surface, {
    r: 14, stroke: P.border, sw: 1,
    ch: [
      T('+', 20, 10, 20, 28, { size: 22, fill: P.muted, weight: 300 }),
      T('Add a habit for today', 50, 14, 240, 20, { size: 14, fill: P.muted }),
    ],
  }));

  // Progress summary strip
  ch.push(F(20, 610, 350, 62, P.lavLight, {
    r: 16,
    ch: [
      T('Weekly pace', 16, 10, 140, 14, { size: 11, fill: P.accent, weight: 700 }),
      T('You`re 12% ahead of last week ✦', 16, 28, 310, 16, { size: 12, fill: P.fg, weight: 500 }),
      ...AreaChart(16, 10, 310, 42, [55, 62, 70, 68, 80, 74, 88], P.accent, ''),
    ],
  }));

  ch.push(BottomNav(0));

  return {
    id: uid(), name: 'Today', width: 390, height: 844,
    background: P.bg, children: ch,
  };
};

// ── SCREEN 2: GARDEN (Habit Progress) ────────────────────────────────────────
const Screen2 = () => {
  const ch = [];
  ch.push(F(0, 0, 390, 844, P.bg));

  // Sage green gradient wash at top
  ch.push(F(0, 0, 390, 180, P.sageLight, { opacity: 0.7 }));
  ch.push(E(60, -30, 260, 220, P.accent2 + '08'));

  ch.push(StatusBar());

  // Header
  ch.push(T('Habit Garden', 24, 54, 250, 32, { size: 26, fill: P.fg, weight: 800, ls: -0.7 }));
  ch.push(T('Your growth, week by week', 24, 90, 260, 18, { size: 13, fill: P.muted }));

  // Week selector pills
  const weeks = ['W10', 'W11', 'W12 ✦', 'W13'];
  weeks.forEach((w, i) => {
    const isActive = i === 2;
    ch.push(F(24 + i * 78, 118, 68, 26, isActive ? P.accent : P.surface, {
      r: 13, stroke: isActive ? P.accent : P.border, sw: 1,
      ch: [T(w, 4, 5, 60, 16, { size: 11, fill: isActive ? '#fff' : P.muted, align: 'center', weight: isActive ? 700 : 400 })],
    }));
  });

  // Habit charts
  const habits = [
    { emoji: '🧘', label: 'Meditation', color: P.accent,  vals: [1,1,1,0,1,1,1,0,1,1,1,1,1,0] },
    { emoji: '💧', label: 'Hydration',  color: P.sky,    vals: [6,7,5,8,7,6,6,8,7,5,8,7,6,8] },
    { emoji: '📖', label: 'Reading',    color: P.accent2, vals: [0,1,1,1,0,1,1,1,0,1,1,0,1,1] },
    { emoji: '🌿', label: 'Walking',    color: P.warm,    vals: [1,0,1,1,1,0,0,1,1,1,0,1,1,1] },
  ];

  habits.forEach((h, i) => {
    const cy = 162 + i * 142;
    // Card
    ch.push(F(20, cy, 350, 130, P.surface, { r: 18, stroke: P.border, sw: 1, ch: [
      // Header row
      F(0, 0, 350, 46, h.color + '0C', { r: 16, ch: [
        T(h.emoji, 14, 8, 28, 30, { size: 20 }),
        T(h.label, 50, 12, 180, 20, { size: 14, weight: 700, fill: P.fg }),
        T(i === 0 ? '100%' : i === 1 ? '82%' : i === 2 ? '71%' : '64%',
          280, 12, 56, 20, { size: 13, fill: h.color, weight: 800, align: 'right' }),
      ]}),
      // Chart
      ...AreaChart(14, 50, 322, 64, h.vals, h.color, null),
      // Days row
      ...['M','T','W','T','F','S','S','M','T','W','T','F','S','S'].map((d, di) =>
        T(d, 14 + di * 23, 116, 20, 12, { size: 8, fill: P.muted, align: 'center' })
      ),
    ]}));
  });

  ch.push(BottomNav(1));
  return { id: uid(), name: 'Garden', width: 390, height: 844, background: P.bg, children: ch };
};

// ── SCREEN 3: REFLECT (Journal & Mood) ───────────────────────────────────────
const Screen3 = () => {
  const ch = [];
  ch.push(F(0, 0, 390, 844, P.bg));

  // Warm terracotta wash (evening reflection tone)
  ch.push(F(0, 0, 390, 200, P.warmLight, { opacity: 0.65 }));
  ch.push(E(200, -20, 240, 200, P.warm + '08'));

  ch.push(StatusBar());

  // Header
  ch.push(T('Evening Reflect', 24, 54, 280, 32, { size: 26, fill: P.fg, weight: 800, ls: -0.7 }));
  ch.push(T('March 26 · 8:42 PM', 24, 90, 200, 16, { size: 12, fill: P.muted }));

  // Mood check-in
  ch.push(T('HOW ARE YOU FEELING?', 24, 118, 260, 12, { size: 9, fill: P.muted, ls: 1.5, weight: 700 }));

  const moods = [
    { emoji: '😌', label: 'Calm' },
    { emoji: '🌟', label: 'Great' },
    { emoji: '😐', label: 'Okay' },
    { emoji: '😴', label: 'Tired' },
    { emoji: '😤', label: 'Tense' },
  ];
  moods.forEach((m, i) =>
    ch.push(MoodBtn(20 + i * 72, 136, m.emoji, m.label, i === 0, P.accent))
  );

  // Journal prompt card
  ch.push(F(20, 228, 350, 52, P.lavLight, {
    r: 14,
    ch: [
      T('✦ Prompt', 14, 10, 80, 14, { size: 10, fill: P.accent, weight: 700 }),
      T('What one small win are you proud of today?', 14, 28, 320, 16, { size: 12, fill: P.fg, lh: 1.4 }),
    ],
  }));

  // Journal entry area
  ch.push(F(20, 290, 350, 200, P.surface, {
    r: 18, stroke: P.border, sw: 1,
    ch: [
      T('I managed to meditate this morning even though\nI felt rushed. It only took 10 minutes but it set\na calm tone for the whole day. I also remembered\nto drink more water — small wins adding up.\n\nThe reading habit is still inconsistent, but I\'m\nnot being hard on myself about it...', 20, 16, 310, 168,
        { size: 13, fill: P.fg, lh: 1.7 }),
      // Cursor
      F(20, 168, 2, 18, P.accent, {}),
    ],
  }));

  // Word count + tags
  ch.push(T('142 words', 24, 500, 80, 14, { size: 11, fill: P.muted }));
  ch.push(T('✓ Auto-saved', 280, 500, 90, 14, { size: 11, fill: P.accent2, align: 'right' }));

  // Tag suggestions
  ch.push(T('TAG THIS ENTRY', 24, 526, 200, 12, { size: 9, fill: P.muted, ls: 1.5, weight: 700 }));
  const tags = [['self-compassion', P.accent], ['growth', P.accent2], ['mindfulness', P.warm], ['progress', P.sky]];
  let tx2 = 24;
  tags.forEach(([label, color]) => {
    ch.push(Tag(tx2, 546, label, color));
    tx2 += label.length * 7 + 32;
  });

  // Yesterday comparison
  ch.push(F(20, 584, 350, 60, P.surface, {
    r: 14, stroke: P.border, sw: 1,
    ch: [
      T('YESTERDAY`S NOTE', 14, 10, 240, 12, { size: 9, fill: P.muted, ls: 1.5, weight: 700 }),
      T('"Feeling scattered but grateful for the walk."', 14, 28, 318, 16, { size: 12, fill: P.muted, lh: 1.4 }),
    ],
  }));

  // Save button
  ch.push(F(20, 658, 350, 50, P.accent, {
    r: 16,
    ch: [
      T('Save Reflection', 80, 14, 190, 22, { size: 16, fill: '#fff', weight: 700, align: 'center' }),
    ],
  }));

  ch.push(BottomNav(2));
  return { id: uid(), name: 'Reflect', width: 390, height: 844, background: P.bg, children: ch };
};

// ── SCREEN 4: INSIGHTS (Weekly Analytics) ────────────────────────────────────
const Screen4 = () => {
  const ch = [];
  ch.push(F(0, 0, 390, 844, P.bg));

  // Lavender + sage dual wash
  ch.push(F(0, 0, 390, 160, P.lavLight, { opacity: 0.5 }));

  ch.push(StatusBar());

  // Header
  ch.push(T('Insights', 24, 54, 240, 32, { size: 26, fill: P.fg, weight: 800, ls: -0.7 }));
  ch.push(T('Week 12 — Your growth snapshot', 24, 90, 280, 16, { size: 12, fill: P.muted }));

  // Range pills
  ['7d', '30d', '90d', '1y'].forEach((r, i) => {
    const isActive = i === 0;
    ch.push(F(24 + i * 72, 116, 62, 26, isActive ? P.accent : P.surface, {
      r: 13, stroke: isActive ? P.accent : P.border, sw: 1,
      ch: [T(r, 4, 5, 54, 16, { size: 11, fill: isActive ? '#fff' : P.muted, align: 'center', weight: isActive ? 700 : 400 })],
    }));
  });

  // Metric cards row
  ch.push(InsightCard(20,  152, 162, 110, 'Completion', '84%', '+12% vs last week', P.accent, '◎'));
  ch.push(InsightCard(196, 152, 174, 110, 'Best Streak', '18 days', 'Meditation · ongoing', P.accent2, '🔥'));

  ch.push(InsightCard(20,  272, 162, 110, 'Habits Done', '47', 'out of 56 scheduled', P.sky, '◈'));
  ch.push(InsightCard(196, 272, 174, 110, 'Journaled', '6 / 7', 'days this week', P.warm, '✦'));

  // Main area chart — overall completion rate
  ch.push(F(20, 392, 350, 140, P.surface, {
    r: 18, stroke: P.border, sw: 1,
    ch: [
      T('COMPLETION RATE — 7 DAYS', 16, 14, 280, 12, { size: 9, fill: P.muted, ls: 1.5, weight: 700 }),
      T('84%', 290, 10, 44, 20, { size: 14, fill: P.accent, weight: 800, align: 'right' }),
      ...AreaChart(14, 34, 322, 88, [70, 75, 82, 68, 90, 84, 84], P.accent, null),
      ...['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d, i) =>
        T(d, 14 + i * 46, 124, 40, 12, { size: 8, fill: P.muted, align: 'center' })
      ),
    ],
  }));

  // Habit breakdown
  ch.push(T('HABIT BREAKDOWN', 24, 544, 200, 12, { size: 9, fill: P.muted, ls: 1.5, weight: 700 }));

  const habits = [
    { label: 'Meditation', pct: 100, color: P.accent },
    { label: 'Hydration',  pct: 82,  color: P.sky    },
    { label: 'Reading',    pct: 71,  color: P.accent2 },
    { label: 'Walking',    pct: 64,  color: P.warm   },
  ];
  habits.forEach((h, i) => {
    const by = 566 + i * 34;
    ch.push(T(h.label, 24, by + 2, 120, 14, { size: 12, fill: P.fg, weight: 500 }));
    ch.push(F(148, by + 4, 186, 8, P.surface2, { r: 4 }));
    ch.push(F(148, by + 4, Math.round(186 * h.pct / 100), 8, h.color, { r: 4 }));
    ch.push(T(`${h.pct}%`, 342, by, 32, 16, { size: 12, fill: h.color, weight: 700, align: 'right' }));
  });

  ch.push(BottomNav(3));
  return { id: uid(), name: 'Insights', width: 390, height: 844, background: P.bg, children: ch };
};

// ── SCREEN 5: CIRCLES (Community Accountability) ─────────────────────────────
const Screen5 = () => {
  const ch = [];
  ch.push(F(0, 0, 390, 844, P.bg));

  // Sky blue wash
  ch.push(F(0, 0, 390, 180, P.sky + '18', { opacity: 0.6 }));
  ch.push(E(280, -20, 200, 180, P.sky + '0A'));

  ch.push(StatusBar());

  // Header
  ch.push(T('Your Circles', 24, 54, 240, 32, { size: 26, fill: P.fg, weight: 800, ls: -0.7 }));
  ch.push(T('Accountability makes habits stick', 24, 90, 280, 16, { size: 12, fill: P.muted }));

  // Community streak banner
  ch.push(F(20, 118, 350, 76, P.surface, {
    r: 18, stroke: P.border, sw: 1,
    ch: [
      F(0, 0, 350, 76, P.accent + '0C', { r: 18 }),
      T('🔥', 18, 16, 40, 44, { size: 32 }),
      T('Group Streak: 12 Days!', 66, 14, 240, 22, { size: 16, weight: 800, fill: P.fg }),
      T('Your pod hasn\'t missed a day this week', 66, 38, 270, 16, { size: 12, fill: P.muted }),
      F(306, 22, 32, 32, P.accent + '20', { r: 10, ch: [
        T('✦', 6, 5, 20, 22, { size: 16, fill: P.accent, align: 'center' }),
      ]}),
    ],
  }));

  // Section label
  ch.push(T('YOUR POD — MORNING RISERS', 24, 210, 270, 12, { size: 9, fill: P.muted, ls: 1.5, weight: 700 }));
  ch.push(T('4 members', 310, 210, 60, 12, { size: 9, fill: P.accent, align: 'right', weight: 600 }));

  // Friend cards
  ch.push(FriendCard(20, 232, 'Priya Sharma',  'priya_s', 18, 5, P.accent));
  ch.push(FriendCard(20, 310, 'James Okafor',  'jamezo',  14, 4, P.accent2));
  ch.push(FriendCard(20, 388, 'Luna Park',     'lunapark',  7, 3, P.warm));
  ch.push(FriendCard(20, 466, 'Raj Mehta',     'raj_m',   12, 6, P.sky));

  // Send nudge button
  ch.push(F(20, 546, 350, 48, P.surface, {
    r: 14, stroke: P.border, sw: 1,
    ch: [
      T('💬', 18, 10, 28, 28, { size: 20 }),
      T('Send a nudge to your pod', 52, 14, 220, 20, { size: 14, fill: P.muted }),
      T('→', 316, 14, 16, 20, { size: 14, fill: P.muted }),
    ],
  }));

  // Discover pods
  ch.push(T('DISCOVER NEW PODS', 24, 610, 200, 12, { size: 9, fill: P.muted, ls: 1.5, weight: 700 }));

  const pods = [
    { name: 'Night Readers', members: 12, color: P.accent },
    { name: 'Hydration Club', members: 8, color: P.sky },
  ];
  pods.forEach((pod, i) => {
    ch.push(F(20 + i * 174, 630, 164, 60, P.surface, {
      r: 16, stroke: P.border, sw: 1,
      ch: [
        F(0, 0, 164, 4, pod.color, { r: 4 }),
        T(pod.name, 14, 14, 130, 18, { size: 13, weight: 700, fill: P.fg }),
        T(`${pod.members} members`, 14, 34, 130, 14, { size: 11, fill: P.muted }),
        T('+ Join', 110, 34, 44, 14, { size: 11, fill: pod.color, weight: 700, align: 'right' }),
      ],
    }));
  });

  ch.push(BottomNav(4));
  return { id: uid(), name: 'Circles', width: 390, height: 844, background: P.bg, children: ch };
};

// ── Build pen ────────────────────────────────────────────────────────────────
const screens = [Screen1(), Screen2(), Screen3(), Screen4(), Screen5()];
let gx = 0;
const canvasChildren = screens.map(s => {
  const node = { ...s, x: gx, y: 0 };
  gx += s.width + 60;
  return node;
});

const pen = {
  version: '2.8',
  meta: {
    name: 'Tendril',
    description: 'Personal growth & habit intelligence — warm parchment + lavender + sage',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    theme: 'light',
    palette: {
      bg:      P.bg,
      surface: P.surface,
      text:    P.fg,
      accent:  P.accent,
      accent2: P.accent2,
      muted:   'rgba(28,25,23,0.45)',
    },
  },
  canvas: {
    x: 0, y: 0,
    backgroundColor: '#E8E4DC',
    children: canvasChildren,
  },
};

const out = path.join(__dirname, 'tendril.pen');
fs.writeFileSync(out, JSON.stringify(pen, null, 2));
console.log(`✓ tendril.pen written (${(fs.statSync(out).size / 1024).toFixed(1)} KB)`);
console.log(`  Screens: ${screens.map(s => s.name).join(', ')}`);
console.log(`  Theme: LIGHT — warm parchment + lavender + sage green`);
