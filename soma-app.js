'use strict';
// soma-app.js
// SOMA — Flow State Intelligence
//
// Challenge: Design a dark-mode flow state tracker inspired by:
// 1. Flomodia (darkmodedesign.com, March 2026) — flow-state dark UI with
//    purposeful minimal chrome and immersive session design
// 2. NNG "The Most Exciting Development in GenUI: Buttons and Checkboxes" —
//    AI-generated contextual UI components that reduce cognitive load
// 3. Land-book AI tool UI patterns (LangChain, Runlayer, Capacity) —
//    lean, intentional interfaces for intelligent systems
// 4. Godly.website — bold typographic hierarchy, organic motion, restraint
//
// The synthesis: an app that learns when you're in flow and helps you get
// back there. Bold indigo + mint palette. Ultra-clean dark surfaces.
// 5 screens: Now / Session / Patterns / Insights / Profile
//
// Palette: deep indigo dark with electric accents
//   bg:       #090B14  (deep void)
//   surface:  #111420  (midnight surface)
//   indigo:   #6366F1  (electric indigo — flow state)
//   mint:     #34D399  (fresh mint — active/positive)
//   gold:     #FBBF24  (amber gold — streak/reward)
//   text:     #F1F5F9  (cool bright white)

const fs   = require('fs');
const path = require('path');

const P = {
  bg:        '#090B14',
  surface:   '#111420',
  surface2:  '#171B2C',
  surface3:  '#1E2236',
  border:    '#1A1E30',
  border2:   '#252A40',
  muted:     '#3A4060',
  muted2:    '#6B7494',
  text:      '#F1F5F9',
  text2:     '#CBD5E1',
  indigo:    '#6366F1',
  indigoLo:  '#6366F118',
  indigoMid: '#6366F140',
  indigoHi:  '#818CF8',
  mint:      '#34D399',
  mintLo:    '#34D39918',
  mintHi:    '#6EE7B7',
  gold:      '#FBBF24',
  goldLo:    '#FBBF2418',
  goldHi:    '#FCD34D',
  rose:      '#F472B6',
  roseLo:    '#F472B618',
  violet:    '#A78BFA',
  violetLo:  '#A78BFA18',
};

let _id = 0;
const uid = () => `sm${++_id}`;

// ── Primitives ─────────────────────────────────────────────────────────────────
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
  fontSize:   opts.size   || 13,
  fontWeight: String(opts.weight || 400),
  fill:       opts.fill   || P.text,
  textAlign:  opts.align  || 'left',
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh !== undefined ? { lineHeight:    opts.lh } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Line = (x, y, w, fill = P.border, opts = {}) => F(x, y, w, 1, fill, opts);

// ── Component helpers ──────────────────────────────────────────────────────────
// Status bar
const statusBar = () => F(0, 0, 390, 48, P.bg, { ch: [
  T('9:41', 16, 14, 80, 20, { size: 14, weight: 600, fill: P.text }),
  T('◈ SOMA', 155, 14, 80, 20, { size: 11, weight: 700, fill: P.indigoHi, align: 'center', ls: 2 }),
  T('●●● ▲', 290, 14, 84, 20, { size: 11, fill: P.text2, align: 'right' }),
]});

// Tab bar
const tabBar = (active) => {
  const tabs = ['Now', 'Session', 'Patterns', 'Insights', 'Profile'];
  const icons = ['◉', '▷', '⌇⌇', '✦', '○'];
  const W = 390 / tabs.length;
  return F(0, 796, 390, 48, P.surface, {
    stroke: P.border,
    ch: tabs.map((label, i) => {
      const isActive = label === active;
      const cx = i * W + W / 2;
      return F(i * W, 0, W, 48, 'transparent', { ch: [
        T(icons[i], cx - 10, 6, 20, 20, {
          size: 14, fill: isActive ? P.indigo : P.muted2, align: 'center',
          weight: isActive ? '700' : '400',
        }),
        T(label, cx - W/2 + 2, 26, W - 4, 14, {
          size: 9, fill: isActive ? P.indigoHi : P.muted2,
          align: 'center', ls: 0.5, weight: isActive ? '700' : '400',
        }),
        ...(isActive ? [F(cx - 12, 44, 24, 2, P.indigo, { r: 1 })] : []),
      ]});
    }),
  });
};

// Section header
const sectionHeader = (label, y) => T(label, 20, y, 200, 14, {
  size: 9, fill: P.indigoHi, weight: 700, ls: 2.5,
});

// Card wrapper
const card = (x, y, w, h, opts = {}) => F(x, y, w, h, P.surface, {
  r: opts.r || 14, stroke: P.border2, ch: opts.ch || [], ...opts,
});

// ── Screen 1: NOW ─────────────────────────────────────────────────────────────
function buildNow() {
  const screen = F(0, 0, 390, 844, P.bg, { clip: true, ch: [] });

  // Background glow — indigo
  screen.children.push(E(-60, 60, 260, 200, P.indigo, { opacity: 0.06 }));
  // Background glow — mint
  screen.children.push(E(190, 160, 200, 140, P.mint, { opacity: 0.05 }));

  screen.children.push(statusBar());

  // Date chip
  screen.children.push(F(20, 56, 170, 24, P.surface2, { r: 12, stroke: P.border2, ch: [
    T('● SUNDAY, MARCH 22', 12, 5, 148, 14, { size: 9, fill: P.indigoHi, weight: 600, ls: 1.5 }),
  ]}));

  // Flow score hero
  screen.children.push(T('Flow', 20, 96, 200, 48, { size: 42, weight: 800, fill: P.text, ls: -2 }));
  screen.children.push(T('Score', 20, 142, 200, 30, { size: 22, weight: 200, fill: P.text2 }));

  // Giant score ring background
  screen.children.push(E(230, 80, 130, 130, P.indigoLo, { stroke: P.border2 }));
  screen.children.push(E(244, 94, 102, 102, P.indigo, { opacity: 0.12 }));
  // Score number
  screen.children.push(T('82', 252, 116, 64, 56, { size: 48, weight: 800, fill: P.text, align: 'center', ls: -2 }));
  screen.children.push(T('/ 100', 267, 168, 50, 16, { size: 10, fill: P.muted2, align: 'center' }));

  // Status badge
  screen.children.push(F(230, 90, 110, 20, P.indigoMid, { r: 10, ch: [
    T('↑ IN FLOW', 8, 4, 94, 12, { size: 8, fill: P.indigoHi, weight: 700, ls: 1.5, align: 'center' }),
  ]}));

  // Quick state cards row
  const stateCards = [
    { label: 'ENERGY', val: '87%', icon: '⚡', color: P.gold, colorLo: P.goldLo },
    { label: 'FOCUS',  val: '78%', icon: '◎',  color: P.indigo, colorLo: P.indigoLo },
    { label: 'MOOD',   val: 'High', icon: '✦',  color: P.mint, colorLo: P.mintLo },
  ];
  stateCards.forEach((sc, i) => {
    const cx = 20 + i * 120;
    screen.children.push(F(cx, 232, 110, 80, P.surface, { r: 14, stroke: P.border2, ch: [
      T(sc.icon, 12, 10, 20, 20, { size: 16, fill: sc.color }),
      T(sc.val,  12, 32, 80, 24, { size: 20, weight: 700, fill: P.text }),
      T(sc.label, 12, 56, 86, 12, { size: 9, fill: P.muted2, ls: 1.5, weight: 600 }),
      F(0, 76, Math.round(110 * 0.65), 4, sc.color, { r: 2, opacity: 0.6 }),
      F(0, 76, 110, 4, sc.colorLo, { r: 2 }),
    ]}));
  });

  // Today's session summary
  screen.children.push(sectionHeader('TODAY\'S FLOW', 336));
  screen.children.push(card(20, 356, 350, 100, { ch: [
    E(16, 16, 32, 32, P.indigoLo, { stroke: P.border2 }),
    T('▷', 23, 20, 18, 24, { size: 14, fill: P.indigoHi, align: 'center' }),
    T('Morning Deep Work', 60, 16, 200, 18, { size: 14, weight: 600, fill: P.text }),
    T('2h 34m · Ended 9:15am · Peak: 87', 60, 36, 240, 14, { size: 11, fill: P.muted2 }),
    F(60, 56, 200, 8, P.surface3, { r: 4, ch: [
      F(0, 0, 148, 8, P.indigo, { r: 4, opacity: 0.8 }),
    ]}),
    T('74%', 270, 56, 60, 14, { size: 11, fill: P.indigoHi, weight: 600 }),
    T('Total today: 3h 12m', 60, 74, 200, 14, { size: 11, fill: P.muted2 }),
    T('✦', 308, 22, 24, 24, { size: 18, fill: P.gold }),
  ]}));

  // Streak + goal
  screen.children.push(F(20, 470, 350, 60, P.surface, { r: 14, stroke: P.border2, ch: [
    T('🔥', 14, 16, 30, 28, { size: 22 }),
    T('14 day streak', 50, 14, 160, 18, { size: 14, weight: 600, fill: P.text }),
    T('Personal best!  Keep it going', 50, 34, 220, 14, { size: 11, fill: P.muted2 }),
    F(300, 14, 34, 34, P.goldLo, { r: 10, stroke: P.border2, ch: [
      T('↗', 8, 6, 18, 22, { size: 16, fill: P.gold, align: 'center' }),
    ]}),
  ]}));

  // Recent sessions list header
  screen.children.push(sectionHeader('RECENT SESSIONS', 554));
  const sessions = [
    { name: 'Deep Work', time: 'Yesterday · 2h 05m', score: 79, color: P.indigo },
    { name: 'Creative Writing', time: 'Yesterday · 45m',  score: 91, color: P.mint  },
    { name: 'Research',        time: '2 days ago · 1h 20m', score: 65, color: P.violet },
  ];
  sessions.forEach((s, i) => {
    screen.children.push(F(20, 574 + i * 58, 350, 50, P.surface, { r: 12, stroke: P.border, ch: [
      F(14, 14, 4, 22, s.color, { r: 2 }),
      T(s.name, 28, 10, 200, 18, { size: 13, weight: 600, fill: P.text }),
      T(s.time, 28, 28, 200, 14, { size: 11, fill: P.muted2 }),
      T(String(s.score), 300, 16, 36, 18, { size: 14, weight: 700, fill: s.color, align: 'center' }),
    ]}));
  });

  screen.children.push(tabBar('Now'));
  return screen;
}

// ── Screen 2: SESSION ─────────────────────────────────────────────────────────
function buildSession() {
  const screen = F(0, 0, 390, 844, P.bg, { clip: true, ch: [] });

  // bg glows
  screen.children.push(E(-40, 100, 300, 300, P.indigo, { opacity: 0.05 }));
  screen.children.push(E(200, 400, 220, 220, P.mint, { opacity: 0.04 }));

  screen.children.push(statusBar());

  // Header
  screen.children.push(T('Start a', 20, 56, 240, 38, { size: 32, weight: 800, fill: P.text, ls: -1 }));
  screen.children.push(T('Flow Session', 20, 92, 300, 38, { size: 32, weight: 200, fill: P.indigoHi, ls: -1 }));

  // Session type selector
  screen.children.push(sectionHeader('SESSION TYPE', 148));
  const types = [
    { label: 'Deep Work',  icon: '◎', color: P.indigo, colorLo: P.indigoLo, active: true },
    { label: 'Creative',   icon: '✦', color: P.mint,   colorLo: P.mintLo,   active: false },
    { label: 'Learning',   icon: '◈', color: P.violet, colorLo: P.violetLo, active: false },
    { label: 'Other',      icon: '○', color: P.muted2, colorLo: P.surface3, active: false },
  ];
  types.forEach((t, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const cx = 20 + col * 180, cy = 168 + row * 80;
    screen.children.push(F(cx, cy, 165, 66, t.active ? P.indigoMid : P.surface, {
      r: 14, stroke: t.active ? P.indigo : P.border2,
      ch: [
        T(t.icon, 14, 14, 24, 24, { size: 18, fill: t.color }),
        T(t.label, 44, 14, 100, 18, { size: 13, weight: t.active ? 700 : 500, fill: t.active ? P.text : P.text2 }),
        ...(t.active ? [F(130, 18, 20, 20, P.indigo, { r: 10, ch: [
          T('✓', 4, 3, 12, 14, { size: 10, fill: P.bg, align: 'center', weight: 700 }),
        ]})] : []),
      ],
    }));
  });

  // Duration picker
  screen.children.push(sectionHeader('DURATION', 340));
  const durations = ['25m', '50m', '90m', '∞'];
  screen.children.push(F(20, 360, 350, 48, P.surface, { r: 12, stroke: P.border2, ch:
    durations.map((d, i) => F(4 + i * 86, 4, 82, 40, i === 1 ? P.indigo : 'transparent', {
      r: 10, ch: [
        T(d, 0, 10, 82, 20, { size: 14, weight: 700, fill: i === 1 ? P.bg : P.text2, align: 'center' }),
      ],
    })),
  }));

  // Ambient mood
  screen.children.push(sectionHeader('AMBIENT SOUND', 432));
  const sounds = [
    { icon: '♦', label: 'Rain',     active: true },
    { icon: '♩', label: 'Lo-fi',    active: false },
    { icon: '◈', label: 'Nature',   active: false },
    { icon: '○', label: 'Silence',  active: false },
  ];
  sounds.forEach((s, i) => {
    screen.children.push(F(20 + i * 86, 452, 76, 68, s.active ? P.surface2 : P.surface, {
      r: 14, stroke: s.active ? P.indigo : P.border,
      ch: [
        T(s.icon, 8, 10, 60, 28, { size: 22, fill: s.active ? P.indigoHi : P.muted2, align: 'center' }),
        T(s.label, 4, 42, 68, 14, { size: 10, fill: s.active ? P.text : P.muted2, align: 'center' }),
      ],
    }));
  });

  // Intention input
  screen.children.push(sectionHeader('INTENTION', 544));
  screen.children.push(F(20, 564, 350, 52, P.surface, { r: 12, stroke: P.indigo, ch: [
    T('What do you want to accomplish?', 16, 16, 280, 20, { size: 13, fill: P.muted, italic: true }),
    T('|', 280, 16, 20, 20, { size: 16, fill: P.indigo }),
  ]}));

  // AI suggestion chip
  screen.children.push(F(20, 628, 350, 40, P.indigoLo, { r: 12, stroke: P.indigoMid, ch: [
    T('✦', 12, 10, 20, 20, { size: 14, fill: P.indigoHi }),
    T('AI suggests: Your peak flow window is now', 36, 11, 270, 18, { size: 12, fill: P.text2 }),
    T('→', 322, 11, 20, 18, { size: 14, fill: P.indigoHi }),
  ]}));

  // Start button
  screen.children.push(F(20, 688, 350, 56, P.indigo, { r: 16, ch: [
    T('▷  Start Flow Session', 0, 16, 350, 24, { size: 16, weight: 700, fill: P.bg, align: 'center' }),
  ]}));

  screen.children.push(tabBar('Session'));
  return screen;
}

// ── Screen 3: PATTERNS ─────────────────────────────────────────────────────────
function buildPatterns() {
  const screen = F(0, 0, 390, 844, P.bg, { clip: true, ch: [] });
  screen.children.push(E(200, 0, 240, 200, P.indigo, { opacity: 0.05 }));
  screen.children.push(statusBar());

  screen.children.push(T('Your', 20, 56, 200, 36, { size: 32, weight: 800, fill: P.text, ls: -1 }));
  screen.children.push(T('Patterns', 20, 90, 260, 36, { size: 32, weight: 200, fill: P.indigoHi, ls: -1 }));

  // Week summary
  screen.children.push(sectionHeader('THIS WEEK', 144));
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weekVals = [0.9, 0.6, 0.85, 0.4, 0.95, 0.3, 0.7];
  const maxH = 52;
  screen.children.push(F(20, 164, 350, 80, P.surface, { r: 14, stroke: P.border2, ch:
    weekDays.map((d, i) => {
      const barH = Math.round(weekVals[i] * maxH);
      const isToday = i === 6;
      return F(20 + i * 44, 4, 36, 72, 'transparent', { ch: [
        F(10, 4 + (maxH - barH), 16, barH, isToday ? P.indigo : P.indigoMid, {
          r: 4, opacity: isToday ? 1 : 0.7,
        }),
        T(d, 0, 60, 36, 12, { size: 9, fill: isToday ? P.indigoHi : P.muted2, align: 'center', weight: isToday ? 700 : 400 }),
      ]});
    }),
  }));

  // Stats row
  const stats = [
    { val: '12h 44m', label: 'This Week',   color: P.indigo },
    { val: '82',       label: 'Avg Score',   color: P.mint   },
    { val: '4.3',      label: 'Sessions',    color: P.gold   },
  ];
  stats.forEach((s, i) => {
    screen.children.push(F(20 + i * 120, 258, 108, 68, P.surface, { r: 12, stroke: P.border2, ch: [
      T(s.val, 10, 10, 88, 24, { size: 18, weight: 700, fill: s.color }),
      T(s.label, 10, 38, 88, 16, { size: 10, fill: P.muted2, weight: 600, ls: 0.5 }),
    ]}));
  });

  // Flow heatmap calendar
  screen.children.push(sectionHeader('FLOW HEATMAP · MARCH', 348));
  // 7 cols × 5 rows = 35 days
  const heatData = [
    0,0,0,0,0,0.3,0.7,
    0.5,0.9,0.4,0.8,0.6,0.2,0.7,
    0.4,0.85,0.3,0.9,0.95,0.4,0.6,
    0.7,0.5,0.8,0.4,0.85,0.3,0.9,
    0.6,0.8,0.7,0.4,0,0,0,
  ];
  const cellW = 42, cellH = 34, startX = 20, startY = 368;
  screen.children.push(F(startX, startY, 350, 182, P.surface, { r: 14, stroke: P.border2, ch: [
    ...['M','T','W','T','F','S','S'].map((d, i) => T(d, 8 + i*44, 8, 36, 12, { size: 8, fill: P.muted2, align: 'center', ls: 1 })),
    ...heatData.map((v, idx) => {
      const col = idx % 7, row = Math.floor(idx / 7);
      const isToday = idx === 28;
      const alpha = v === 0 ? 0 : 0.15 + v * 0.85;
      const fill = v === 0 ? P.surface3 : P.indigo;
      return F(8 + col * 44, 26 + row * 30, 36, 22, fill, {
        r: 6, opacity: alpha,
        ...(isToday ? { stroke: P.indigoHi } : {}),
        ch: [T(String(row * 7 + col + 1), 0, 4, 36, 14, {
          size: 9, fill: v > 0.5 ? P.text : P.muted2, align: 'center',
        })],
      });
    }),
  ]}));

  // Peak windows insight
  screen.children.push(sectionHeader('PEAK WINDOWS', 566));
  const peaks = [
    { range: '9am – 11am',  label: 'Deep Work Peak',   pct: 88, color: P.indigo },
    { range: '2pm – 4pm',   label: 'Creative Peak',    pct: 72, color: P.mint  },
    { range: '7pm – 9pm',   label: 'Learning Window',  pct: 61, color: P.violet },
  ];
  peaks.forEach((pk, i) => {
    screen.children.push(F(20, 586 + i * 60, 350, 50, P.surface, { r: 12, stroke: P.border, ch: [
      T(pk.range, 14, 8, 130, 18, { size: 14, weight: 700, fill: pk.color }),
      T(pk.label, 14, 28, 180, 14, { size: 11, fill: P.muted2 }),
      F(190, 16, 110, 8, P.surface3, { r: 4, ch: [
        F(0, 0, Math.round(110 * pk.pct / 100), 8, pk.color, { r: 4, opacity: 0.8 }),
      ]}),
      T(`${pk.pct}%`, 310, 12, 30, 18, { size: 12, weight: 700, fill: pk.color }),
    ]}));
  });

  screen.children.push(tabBar('Patterns'));
  return screen;
}

// ── Screen 4: INSIGHTS ─────────────────────────────────────────────────────────
function buildInsights() {
  const screen = F(0, 0, 390, 844, P.bg, { clip: true, ch: [] });
  screen.children.push(E(100, 40, 300, 260, P.indigo, { opacity: 0.06 }));
  screen.children.push(statusBar());

  screen.children.push(T('AI', 20, 56, 60, 40, { size: 36, weight: 800, fill: P.text, ls: -1 }));
  screen.children.push(T('Insights', 20, 94, 280, 32, { size: 28, weight: 200, fill: P.indigoHi, ls: -1 }));

  // Main AI insight card
  screen.children.push(F(20, 142, 350, 120, P.surface2, { r: 16, stroke: P.border2, ch: [
    F(20, 20, 310, 80, P.indigoLo, { r: 12, ch: [
      T('✦', 14, 14, 24, 24, { size: 18, fill: P.indigoHi }),
      T('Your most productive hours are 9–11am.\nYou\'re 40% more focused after a 7hr sleep.', 44, 12, 250, 44, {
        size: 12, fill: P.text, lh: 1.6,
      }),
    ]}),
    T('Based on 14 sessions this month', 20, 100, 240, 14, { size: 10, fill: P.muted2 }),
  ]}));

  // Insight cards grid
  screen.children.push(sectionHeader('CORRELATIONS', 280));
  const insights = [
    { title: 'Sleep → Flow',    body: '7+ hrs sleep boosts\nyour flow score by 31%', icon: '◑', color: P.mint  },
    { title: 'Best Day',        body: 'Tuesdays are your\nhighest flow days', icon: '✦',  color: P.gold  },
    { title: 'Music Effect',    body: 'Lo-fi adds 18min to\naverage session length', icon: '♩',  color: P.violet },
    { title: 'Recovery',        body: '25min break after\n90min session is ideal', icon: '○',  color: P.rose  },
  ];
  insights.forEach((ins, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    screen.children.push(F(20 + col * 178, 300 + row * 130, 164, 116, P.surface, { r: 14, stroke: P.border2, ch: [
      F(12, 12, 32, 32, `${ins.color}18`, { r: 10, ch: [
        T(ins.icon, 6, 6, 20, 20, { size: 14, fill: ins.color, align: 'center' }),
      ]}),
      T(ins.title, 12, 50, 140, 18, { size: 13, weight: 700, fill: P.text }),
      T(ins.body, 12, 68, 140, 34, { size: 11, fill: P.muted2, lh: 1.6 }),
    ]}));
  });

  // Score trend
  screen.children.push(sectionHeader('30-DAY TREND', 574));
  screen.children.push(F(20, 594, 350, 80, P.surface, { r: 14, stroke: P.border2, ch: [
    // Simple sparkline using bars
    ...[42,55,60,52,70,65,78,72,82,79,85,88].map((v, i) => {
      const bh = Math.round((v / 100) * 48);
      return F(14 + i * 27, 56 - bh, 18, bh, P.indigo, { r: 3, opacity: 0.6 + (i / 20) });
    }),
    T('+23pts this month', 14, 60, 180, 14, { size: 10, fill: P.mint, weight: 600 }),
    T('↗ Trending up', 260, 60, 80, 14, { size: 10, fill: P.mint, weight: 600 }),
  ]}));

  // Flow triggers
  screen.children.push(sectionHeader('FLOW TRIGGERS', 694));
  const triggers = ['Deep Work', 'Lo-fi music', 'Morning window', '7hrs sleep', 'Cold start'];
  screen.children.push(F(20, 714, 350, 40, 'transparent', { ch:
    triggers.map((t, i) => {
      const w = t.length * 7 + 20;
      let offset = 0;
      for (let j = 0; j < i; j++) offset += triggers[j].length * 7 + 28;
      return F(offset, 0, w + 8, 32, P.indigoLo, { r: 8, stroke: P.indigoMid, ch: [
        T(t, 8, 8, w, 16, { size: 11, fill: P.indigoHi, weight: 500 }),
      ]});
    }),
  }));

  screen.children.push(tabBar('Insights'));
  return screen;
}

// ── Screen 5: PROFILE ─────────────────────────────────────────────────────────
function buildProfile() {
  const screen = F(0, 0, 390, 844, P.bg, { clip: true, ch: [] });
  screen.children.push(E(-20, 60, 200, 200, P.indigo, { opacity: 0.07 }));
  screen.children.push(statusBar());

  // Avatar area
  screen.children.push(E(155, 60, 80, 80, P.indigoMid, { stroke: P.indigo }));
  screen.children.push(T('A', 155, 60, 80, 80, { size: 32, weight: 700, fill: P.text, align: 'center' }));
  screen.children.push(T('Alex Rivera', 110, 148, 170, 24, { size: 18, weight: 700, fill: P.text, align: 'center' }));
  screen.children.push(T('Flow practitioner · 14 day streak 🔥', 60, 172, 270, 16, { size: 11, fill: P.muted2, align: 'center' }));

  // Level badge
  screen.children.push(F(155, 196, 80, 24, P.goldLo, { r: 12, stroke: P.gold, ch: [
    T('✦ LEVEL 7', 0, 5, 80, 14, { size: 9, fill: P.gold, weight: 700, ls: 1.5, align: 'center' }),
  ]}));

  // Stats row
  screen.children.push(sectionHeader('ALL TIME STATS', 240));
  const profileStats = [
    { val: '247h', label: 'In Flow' },
    { val: '184',  label: 'Sessions' },
    { val: '79',   label: 'Avg Score' },
    { val: '14',   label: 'Best Streak' },
  ];
  screen.children.push(F(20, 260, 350, 60, P.surface, { r: 14, stroke: P.border2, ch:
    profileStats.map((s, i) => F(i * 87, 0, 86, 60, 'transparent', { ch: [
      T(s.val, 5, 10, 76, 22, { size: 18, weight: 700, fill: P.text, align: 'center' }),
      T(s.label, 5, 34, 76, 14, { size: 9, fill: P.muted2, align: 'center', ls: 0.5 }),
      ...(i < 3 ? [F(86, 10, 1, 40, P.border, {})] : []),
    ]})),
  }));

  // Milestone badges
  screen.children.push(sectionHeader('MILESTONES', 342));
  const badges = [
    { icon: '⚡', label: '7 Day\nStreak',   color: P.gold,   earned: true },
    { icon: '◎',  label: '100h\nIn Flow',   color: P.indigo, earned: true },
    { icon: '✦',  label: 'Flow\nMaster',    color: P.violet, earned: true },
    { icon: '○',  label: '365\nDays',       color: P.muted2, earned: false },
    { icon: '◈',  label: 'Peak\nPerfect',   color: P.muted2, earned: false },
  ];
  badges.forEach((b, i) => {
    screen.children.push(F(20 + i * 72, 362, 64, 72, b.earned ? P.surface : P.surface, {
      r: 12, stroke: b.earned ? b.color : P.border,
      opacity: b.earned ? 1 : 0.5,
      ch: [
        T(b.icon, 0, 10, 64, 24, { size: 18, fill: b.earned ? b.color : P.muted, align: 'center' }),
        T(b.label, 4, 36, 56, 28, { size: 9, fill: b.earned ? P.text2 : P.muted2, align: 'center', lh: 1.5 }),
      ],
    }));
  });

  // Flow goal
  screen.children.push(sectionHeader('FLOW GOAL', 454));
  screen.children.push(F(20, 474, 350, 56, P.surface, { r: 12, stroke: P.border2, ch: [
    T('◎', 14, 14, 24, 28, { size: 20, fill: P.indigoHi }),
    T('10 hours of deep flow per week', 46, 12, 240, 18, { size: 13, weight: 600, fill: P.text }),
    T('Currently at 12h 44m ↗ ahead of goal', 46, 32, 240, 14, { size: 11, fill: P.mint }),
    T('✎', 322, 16, 20, 24, { size: 16, fill: P.muted2 }),
  ]}));

  // Settings list
  screen.children.push(sectionHeader('SETTINGS', 550));
  const settings = [
    { label: 'Notifications',      sub: 'Session reminders, streaks', icon: '♦' },
    { label: 'Integrations',       sub: 'Calendar, Spotify, Health',  icon: '◈' },
    { label: 'Export Data',        sub: 'CSV, JSON backup',            icon: '↓' },
    { label: 'AI Preferences',     sub: 'How SOMA learns about you',   icon: '✦' },
  ];
  settings.forEach((s, i) => {
    screen.children.push(F(20, 570 + i * 54, 350, 46, P.surface, {
      r: 12, stroke: i === 0 ? P.border2 : P.border,
      ch: [
        F(12, 10, 26, 26, P.surface3, { r: 8, ch: [
          T(s.icon, 3, 4, 20, 18, { size: 12, fill: P.indigoHi, align: 'center' }),
        ]}),
        T(s.label, 50, 6, 200, 18, { size: 13, weight: 600, fill: P.text }),
        T(s.sub,   50, 24, 220, 14, { size: 11, fill: P.muted2 }),
        T('›', 322, 12, 16, 22, { size: 18, fill: P.muted2 }),
      ],
    }));
  });

  screen.children.push(tabBar('Profile'));
  return screen;
}

// ── Assemble doc ───────────────────────────────────────────────────────────────
const doc = {
  id:       'soma-doc',
  type:     'document',
  name:     'SOMA — Flow State Intelligence',
  version:  '2.8',
  width:    390,
  height:   844,
  children: [
    buildNow(),
    buildSession(),
    buildPatterns(),
    buildInsights(),
    buildProfile(),
  ],
};

fs.writeFileSync(path.join(__dirname, 'soma.pen'), JSON.stringify(doc, null, 2));
console.log('✓ soma.pen written — screens:', doc.children.length);
console.log('  Palette: deep void #090B14 + electric indigo #6366F1 + mint #34D399');
