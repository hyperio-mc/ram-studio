'use strict';
// bask-app.js — BASK: Ambient Work Rhythm Companion
//
// Inspired by:
//   • Amie.so on godly.website — "AI Note Taker without a bot" — the site's
//     clean LIGHT theme uses warm whites, restrained typography, and frames AI
//     as invisible and helpful rather than chatbot-intrusive. Core concept:
//     a focus tracker that surfaces AI rhythm insights without any bot UI.
//   • AuthKit (workos.com) on godly.website — ultra-minimal card UI with
//     soft box shadows, white cards on off-white bg, gentle border radii.
//     That surface/card pattern drives the entire system.
//   • land-book.com (Voy, Sanity trend): warm off-white linen bg (#F5F1EC),
//     hero numerals as primary UI element, thin-weight supporting labels.
//
// Challenge: Design a 5-screen LIGHT productivity app where AI insight is
// ambient — no chat UI, no bots, no popups. Warm linen bg (#F5F1EC), white
// cards, terracotta amber accent (#C47A40), forest-green success (#3D8B5F).
//
// Screens: Today · Focus · Insights · Log · Settings

const fs   = require('fs');
const path = require('path');

// ── Palette ─────────────────────────────────────────────────────────────────
const P = {
  bg:        '#F5F1EC',
  bg2:       '#EDE9E1',
  surface:   '#FFFFFF',
  surface2:  '#FAF8F5',
  border:    '#E4DED5',
  border2:   '#CFC8BE',
  fg:        '#1C1917',
  fg2:       '#695F56',
  fg3:       '#A89E96',
  amber:     '#C47A40',
  amberLo:   '#C47A4015',
  amberMid:  '#C47A4030',
  green:     '#3D8B5F',
  greenLo:   '#3D8B5F15',
  blue:      '#4674B8',
  blueLo:    '#4674B815',
  rose:      '#C45050',
  roseLo:    '#C4505015',
  white:     '#FFFFFF',
};

let _id = 0;
const uid = () => `bk${++_id}`;

const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill || P.bg,
  clip: opts.clip !== undefined ? opts.clip : false,
  ...(opts.r  !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.shadow ? { shadow: opts.shadow } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.ch || [],
});

const T = (content, x, y, w, h, opts = {}) => ({
  id: uid(), type: 'text', content, x, y, width: w, height: h,
  textGrowth: 'fixed-width-height',
  fontSize:   opts.size   || 13,
  fontWeight: String(opts.weight || 400),
  fill:       opts.fill   || P.fg,
  textAlign:  opts.align  || 'left',
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh !== undefined ? { lineHeight: opts.lh }   : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
});

const Line = (x, y, w, fill = P.border, h = 1) => F(x, y, w, h, fill);

const cardShadow   = { x: 0, y: 2, blur: 12, spread: 0, fill: 'rgba(28,25,23,0.07)' };
const subtleShadow = { x: 0, y: 1, blur:  6, spread: 0, fill: 'rgba(28,25,23,0.05)' };

const Card = (x, y, w, h, children = [], opts = {}) =>
  F(x, y, w, h, P.surface, {
    r: opts.r !== undefined ? opts.r : 12,
    stroke: P.border, sw: 1,
    shadow: cardShadow,
    ch: children,
  });

const Pill = (x, y, w, h, bg, text, textFill, size = 9) =>
  F(x, y, w, h, bg, {
    r: h / 2,
    ch: [T(text, 0, (h - size - 1) / 2, w, size + 2, {
      size, fill: textFill, align: 'center', weight: 600, ls: 0.3,
    })],
  });

const NAV_H = 64;
const NAV_ITEMS = [
  { label: 'Today',    icon: '◈' },
  { label: 'Focus',    icon: '◎' },
  { label: 'Insights', icon: '◇' },
  { label: 'Log',      icon: '≡' },
  { label: 'Settings', icon: '⊙' },
];

function bottomNav(W, H, activeIdx) {
  const itemW = W / NAV_ITEMS.length;
  const items = NAV_ITEMS.map((item, i) => {
    const isActive  = i === activeIdx;
    const iconFill  = isActive ? P.amber : P.fg3;
    const labelFill = isActive ? P.amber : P.fg3;
    return F(i * itemW, 0, itemW, NAV_H, P.surface, { ch: [
      T(item.icon,  i * itemW + (itemW - 20) / 2, 10, 20, 20,
        { size: 16, fill: iconFill, align: 'center', weight: isActive ? 700 : 400 }),
      T(item.label, i * itemW + (itemW - 48) / 2, 33, 48, 12,
        { size: 9,  fill: labelFill, align: 'center', weight: isActive ? 600 : 400, ls: 0.2 }),
    ]});
  });
  const dotX = activeIdx * itemW + (itemW - 24) / 2;
  return F(0, H - NAV_H, W, NAV_H, P.surface, {
    stroke: P.border, sw: 1,
    shadow: { x: 0, y: -2, blur: 8, spread: 0, fill: 'rgba(28,25,23,0.05)' },
    ch: [...items, F(dotX, 0, 24, 3, P.amber, { r: 2 })],
  });
}

function statusBar(W) {
  return F(0, 0, W, 44, P.surface, { ch: [
    T('9:41', 16, 14, 50, 16, { size: 13, fill: P.fg, weight: 600 }),
    T('●●●  ▲  ▮▮▮', W - 82, 14, 72, 16, { size: 10, fill: P.fg2, align: 'right' }),
  ]});
}

// ── Screen A — TODAY ─────────────────────────────────────────────────────────
function screenToday(W, H) {
  const pad = 20;
  const ch  = [];

  ch.push(statusBar(W));

  // Header
  ch.push(F(0, 44, W, 72, P.bg, { ch: [
    T('Good morning, Kai ☀', pad, 16, 260, 20,
      { size: 16, fill: P.fg, weight: 600 }),
    T('Monday, March 23', pad, 40, 200, 14,
      { size: 11, fill: P.fg3, weight: 400, ls: 0.2 }),
    E(W - pad - 34, 12, 34, 34, P.amberMid),
    T('K', W - pad - 20, 20, 14, 22,
      { size: 14, fill: P.amber, weight: 700, align: 'center' }),
  ]}));

  // Intention banner
  ch.push(Card(pad, 124, W - pad * 2, 68, [
    F(0, 0, 3, 68, P.amber, { r: 2 }),
    T('✦  TODAY\'S INTENTION', 14, 10, 200, 12,
      { size: 8, fill: P.fg3, weight: 600, ls: 0.8 }),
    T('Ship the design system handoff', 14, 26, W - pad * 2 - 28, 16,
      { size: 13, fill: P.fg, weight: 600, lh: 1.4 }),
    T('Set by Bask  ·  quiet mode', 14, 46, 180, 11,
      { size: 9, fill: P.fg3, weight: 400 }),
  ]));

  // Focus blocks section label
  ch.push(T('TODAY\'S RHYTHM', pad, 206, 160, 12,
    { size: 8, fill: P.fg3, weight: 600, ls: 1 }));

  const blocks = [
    { label: 'Deep Work',     dur: '1 h 40 m', time: '8:15–9:55',   done: true,  active: false, clr: P.green },
    { label: 'Review & Plan', dur: '25 m',      time: '10:10–10:35', done: true,  active: false, clr: P.green },
    { label: 'Design Sprint', dur: '2 h',        time: '11:00–1:00',  done: false, active: true,  clr: P.amber },
    { label: 'Buffer',        dur: '30 m',        time: '2:00–2:30',   done: false, active: false, clr: P.border2 },
  ];

  blocks.forEach((b, i) => {
    const y = 226 + i * 62;
    ch.push(Card(pad, y, W - pad * 2, 54, [
      F(0, 0, 3, 54, b.clr, { r: 2 }),
      T(b.label, 14, 8, 180, 14,
        { size: 12, fill: b.done ? P.fg2 : P.fg, weight: b.active ? 700 : 500 }),
      T(b.time,  14, 26, 160, 11, { size: 9, fill: P.fg3, ls: 0.2 }),
      Pill(W - pad * 2 - 62, 17, 54, 20,
        b.active ? P.amberLo : b.done ? P.greenLo : 'transparent',
        b.dur,
        b.active ? P.amber : b.done ? P.green : P.fg3, 8),
      ...(b.done ? [
        E(W - pad * 2 - 76, 16, 18, 18, P.greenLo),
        T('✓', W - pad * 2 - 72, 18, 10, 14, { size: 9, fill: P.green, weight: 700, align: 'center' }),
      ] : b.active ? [
        E(W - pad * 2 - 76, 16, 18, 18, P.amberLo),
        T('▶', W - pad * 2 - 72, 19, 10, 12, { size: 8, fill: P.amber, weight: 700, align: 'center' }),
      ] : []),
    ], { r: 10 }));
  });

  // Daily score strip
  ch.push(F(pad, 478, W - pad * 2, 52, P.surface2, {
    r: 12, stroke: P.border, sw: 1,
    ch: [
      T('FLOW SCORE', 14, 8,   100, 10, { size: 7, fill: P.fg3, weight: 600, ls: 0.5 }),
      T('Focused',   14, 22,   100, 16, { size: 14, fill: P.fg, weight: 700 }),
      Line(116, 10, 1, P.border, 32),
      T('SESSIONS',  130, 8,   80, 10, { size: 7, fill: P.fg3, weight: 600, ls: 0.5 }),
      T('3 / 4',     130, 22,  80, 16, { size: 14, fill: P.fg, weight: 700 }),
      Line(218, 10, 1, P.border, 32),
      T('DEEP HRS',  232, 8,   80, 10, { size: 7, fill: P.fg3, weight: 600, ls: 0.5 }),
      T('4 h 5 m',   232, 22,  90, 16, { size: 14, fill: P.fg, weight: 700 }),
    ],
  }));

  ch.push(bottomNav(W, H, 0));
  return F(0, 0, W, H, P.bg, { clip: true, ch });
}

// ── Screen B — FOCUS (active session) ───────────────────────────────────────
function screenFocus(W, H) {
  const pad = 20;
  const ch  = [];

  ch.push(F(0, 0, W, 44, P.surface, { ch: [
    T('9:41', 16, 14, 50, 16, { size: 13, fill: P.fg, weight: 600 }),
    Pill(W - pad - 62, 13, 58, 20, P.amberLo, '◎  FOCUS', P.amber, 8),
  ]}));

  ch.push(T('Design Sprint', 0, 62, W, 18,
    { size: 14, fill: P.fg2, weight: 500, align: 'center', ls: 0.4 }));

  const cx = W / 2, cy = 218, R = 108;

  // Outer ring bg
  ch.push(E(cx - R, cy - R, R * 2, R * 2, P.surface, { stroke: P.border, sw: 2 }));
  // Inner bg
  ch.push(E(cx - R + 10, cy - R + 10, (R - 10) * 2, (R - 10) * 2, P.bg));
  // Progress ring (amber, ~52%)
  ch.push(E(cx - R + 7, cy - R + 7, (R - 7) * 2, (R - 7) * 2, 'transparent', {
    stroke: P.amber, sw: 9, opacity: 0.9,
  }));
  // Half-mask to simulate arc progress
  ch.push(F(cx, cy - R - 2, R + 4, R * 2 + 4, P.bg, { opacity: 0.55 }));

  // Timer text
  ch.push(T('1:02:17', cx - 74, cy - 28, 148, 38,
    { size: 34, fill: P.fg, weight: 700, align: 'center' }));
  ch.push(T('of 2:00:00', cx - 60, cy + 14, 120, 14,
    { size: 10, fill: P.fg3, weight: 400, align: 'center', ls: 0.3 }));
  // Session tag
  ch.push(Pill(cx - 80, cy + 34, 160, 22, P.amberLo, '✦  Ship handoff design', P.amber, 9));

  // Controls
  const ctrlY = cy + R + 28;
  ch.push(Card(pad, ctrlY, W - pad * 2, 68, [
    // Pause
    F(16, 14, 44, 40, P.amberLo, { r: 10, ch: [
      T('⏸', 13, 11, 18, 20, { size: 16, fill: P.amber, align: 'center' }),
    ]}),
    T('Pause', 16, 57, 44, 11, { size: 8, fill: P.fg3, weight: 500, align: 'center', ls: 0.3 }),
    // Note
    F((W - pad * 2) / 2 - 22, 14, 44, 40, P.blueLo, { r: 10, ch: [
      T('✎', 13, 11, 18, 20, { size: 15, fill: P.blue, align: 'center' }),
    ]}),
    T('Note', (W - pad * 2) / 2 - 22, 57, 44, 11, { size: 8, fill: P.fg3, weight: 500, align: 'center', ls: 0.3 }),
    // End
    F(W - pad * 2 - 60, 14, 44, 40, P.roseLo, { r: 10, ch: [
      T('■', 13, 12, 18, 19, { size: 14, fill: P.rose, align: 'center' }),
    ]}),
    T('End', W - pad * 2 - 60, 57, 44, 11, { size: 8, fill: P.fg3, weight: 500, align: 'center', ls: 0.3 }),
  ], { r: 14 }));

  // AI ambient whisper — no bot, just a gentle nudge
  ch.push(F(pad, ctrlY + 84, W - pad * 2, 52, P.surface2, {
    r: 12, stroke: P.border, sw: 1,
    ch: [
      T('✦', 14, 16, 16, 20, { size: 13, fill: P.amber, weight: 700 }),
      T('You\'re 8 min ahead of your usual pace.', 34, 10, W - pad * 2 - 48, 14,
        { size: 11, fill: P.fg, weight: 500, lh: 1.4 }),
      T('Bask  ·  ambient nudge', 34, 28, 180, 12, { size: 9, fill: P.fg3 }),
    ],
  }));

  // Blocked distractions
  ch.push(F(pad, ctrlY + 146, W - pad * 2, 34, P.greenLo, { r: 10, ch: [
    T('⊘  17 distractions quietly blocked', 0, 10, W - pad * 2, 13,
      { size: 10, fill: P.green, weight: 500, align: 'center', ls: 0.2 }),
  ]}));

  ch.push(bottomNav(W, H, 1));
  return F(0, 0, W, H, P.bg, { clip: true, ch });
}

// ── Screen C — INSIGHTS ──────────────────────────────────────────────────────
function screenInsights(W, H) {
  const pad = 20;
  const ch  = [];

  ch.push(statusBar(W));
  ch.push(T('Insights', pad, 56, 200, 22, { size: 18, fill: P.fg, weight: 700 }));
  ch.push(T('Week of Mar 17–23', pad, 82, 200, 14,
    { size: 10, fill: P.fg3, weight: 400, ls: 0.3 }));

  // Bar chart
  ch.push(Card(pad, 104, W - pad * 2, 132, [
    T('DAILY DEEP WORK (HRS)', 14, 10, 200, 10, { size: 7, fill: P.fg3, weight: 600, ls: 0.8 }),
    ...[
      { d: 'M', v: 3.2 }, { d: 'T', v: 4.5 }, { d: 'W', v: 2.8 },
      { d: 'T', v: 5.1 }, { d: 'F', v: 4.2 }, { d: 'S', v: 1.0 }, { d: 'S', v: 0.3 },
    ].flatMap(({ d, v }, i) => {
      const maxH = 62, maxV = 6;
      const bH   = Math.round((v / maxV) * maxH);
      const bW   = 24, gap = 8;
      const bX   = 12 + i * (bW + gap);
      const bY   = 28 + (maxH - bH);
      const isToday = i === 6;
      const bFill   = isToday ? P.amber : v >= 4 ? P.green : P.border2;
      return [
        F(bX, bY, bW, bH, bFill, { r: 4, opacity: isToday ? 1 : 0.9 }),
        T(d, bX + 2, 98, bW, 11, { size: 8, fill: P.fg3, weight: 500, align: 'center' }),
        T(String(v), bX, 112, bW, 11, { size: 7, fill: P.fg3, align: 'center' }),
      ];
    }),
    // Avg line
    F(12, 28 + 62 - Math.round((3.7/6)*62), W - pad*2 - 24, 1, P.amber, { opacity: 0.3 }),
    T('avg 3.7h', W-pad*2-52, 28+62-Math.round((3.7/6)*62)-14, 42, 10,
      { size: 7, fill: P.amber, weight: 500, align: 'right', opacity: 0.7 }),
  ]));

  // Pattern metric cards
  const patterns = [
    { label: 'Peak hours',   val: '9–11 AM',  sub: 'Sharpest window',  icon: '◈', clr: P.amber, bg: P.amberLo  },
    { label: 'Avg session',  val: '47 min',   sub: 'Up 6 min this wk', icon: '◎', clr: P.blue,  bg: P.blueLo   },
    { label: 'Best day',     val: 'Thursday', sub: '5.1 hrs deep work', icon: '◇', clr: P.green, bg: P.greenLo  },
    { label: 'Distractions', val: '−28%',     sub: 'vs last week',      icon: '⊘', clr: P.rose,  bg: P.roseLo   },
  ];

  const colW = (W - pad * 2 - 10) / 2;
  patterns.forEach((p, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x   = pad + col * (colW + 10);
    const y   = 248 + row * 78;
    ch.push(Card(x, y, colW, 68, [
      F(12, 12, 26, 26, p.bg, { r: 8, ch: [
        T(p.icon, 5, 5, 16, 18, { size: 13, fill: p.clr, align: 'center' }),
      ]}),
      T(p.label, 12, 44, colW - 24, 11, { size: 8, fill: P.fg3, weight: 500, ls: 0.3 }),
      T(p.val, colW/2 - 8, 12, colW - 18, 18,
        { size: 14, fill: P.fg, weight: 700, align: 'right' }),
      T(p.sub, colW/2 - 8, 30, colW - 18, 11,
        { size: 8, fill: P.fg3, weight: 400, align: 'right' }),
    ], { r: 12 }));
  });

  // AI observation
  ch.push(F(pad, 410, W - pad * 2, 60, P.amberLo, { r: 12, ch: [
    T('✦  Bask noticed', 14, 10, 180, 12, { size: 9, fill: P.amber, weight: 600, ls: 0.3 }),
    T('You focus 22% deeper when you skip Slack until 11 AM.', 14, 26,
      W - pad*2 - 28, 28, { size: 10, fill: P.fg, weight: 400, lh: 1.5 }),
  ]}));

  // Streak
  ch.push(Card(pad, 482, W - pad * 2, 50, [
    T('🔥', 14, 12, 24, 24, { size: 18 }),
    T('12-day deep work streak', 44, 12, 200, 14, { size: 12, fill: P.fg, weight: 600 }),
    T('Best this month', 44, 30, 160, 12, { size: 9, fill: P.fg3 }),
    Pill(W - pad*2 - 52, 15, 44, 20, P.greenLo, 'Record', P.green, 8),
  ], { r: 12 }));

  ch.push(bottomNav(W, H, 2));
  return F(0, 0, W, H, P.bg, { clip: true, ch });
}

// ── Screen D — LOG ───────────────────────────────────────────────────────────
function screenLog(W, H) {
  const pad = 20;
  const ch  = [];

  ch.push(statusBar(W));
  ch.push(T('Work Log', pad, 56, 200, 22, { size: 18, fill: P.fg, weight: 700 }));
  ch.push(T('Session history', pad, 82, 220, 14, { size: 10, fill: P.fg3, ls: 0.3 }));

  // Filter tabs
  const tabs = ['All', 'Deep Work', 'Review', 'Breaks'];
  ch.push(F(pad, 104, W - pad * 2, 34, P.surface2, { r: 10, stroke: P.border, sw: 1,
    ch: tabs.map((t, i) => {
      const tw = (W - pad * 2) / tabs.length;
      return F(i * tw, 0, tw, 34, i === 0 ? P.amber : 'transparent', {
        r: i === 0 ? 10 : 0,
        ch: [T(t, 0, 9, tw, 16, {
          size: 10, fill: i === 0 ? P.white : P.fg3,
          weight: i === 0 ? 700 : 400, align: 'center', ls: 0.2,
        })],
      });
    }),
  }));

  const entries = [
    { date: 'Today',     time: '11:00 AM', dur: '1 h 2 m',  label: 'Design Sprint',         note: 'Handoff screens progressing well.', clr: P.amber },
    { date: 'Today',     time: '10:10 AM', dur: '25 m',     label: 'Review & Plan',          note: 'Scoped Q2 milestones.',              clr: P.green },
    { date: 'Today',     time: '8:15 AM',  dur: '1 h 40 m', label: 'Deep Work',              note: 'Finished brand guidelines v2.',      clr: P.green },
    { date: 'Yesterday', time: '2:30 PM',  dur: '58 m',     label: 'Component library',      note: 'Token system complete.',             clr: P.blue  },
    { date: 'Yesterday', time: '9:00 AM',  dur: '2 h 8 m',  label: 'Deep Work',              note: 'Best session this week.',            clr: P.green },
  ];

  let ey = 150; let lastDate = '';
  for (const e of entries) {
    if (ey > H - NAV_H - 82) break;
    if (e.date !== lastDate) {
      ch.push(T(e.date.toUpperCase(), pad, ey, 200, 12,
        { size: 8, fill: P.fg3, weight: 600, ls: 0.8 }));
      ey += 20; lastDate = e.date;
    }
    ch.push(Card(pad, ey, W - pad * 2, 64, [
      F(0, 0, 3, 64, e.clr, { r: 2 }),
      T(e.label, 14, 9,  W - pad*2 - 80, 14, { size: 12, fill: P.fg, weight: 600 }),
      T(e.note,  14, 27, W - pad*2 - 90, 22, { size: 10, fill: P.fg2, lh: 1.4 }),
      T(e.time,  14, 50, 80, 10, { size: 8, fill: P.fg3 }),
      Pill(W - pad*2 - 60, 9, 52, 18,
        e.clr === P.amber ? P.amberLo : e.clr === P.green ? P.greenLo : P.blueLo,
        e.dur, e.clr, 8),
    ], { r: 10 }));
    ey += 74;
  }

  ch.push(bottomNav(W, H, 3));
  return F(0, 0, W, H, P.bg, { clip: true, ch });
}

// ── Screen E — SETTINGS ──────────────────────────────────────────────────────
function screenSettings(W, H) {
  const pad = 20;
  const ch  = [];

  ch.push(statusBar(W));
  ch.push(T('Settings', pad, 56, 200, 22, { size: 18, fill: P.fg, weight: 700 }));

  // Profile
  ch.push(Card(pad, 88, W - pad * 2, 72, [
    E(14, 16, 40, 40, P.amberMid),
    T('K', 27, 24, 14, 24, { size: 18, fill: P.amber, weight: 700, align: 'center' }),
    T('Kai Nakamura', 68, 14, 180, 16, { size: 13, fill: P.fg, weight: 700 }),
    T('kai@studio.io',  68, 34, 180, 13, { size: 10, fill: P.fg3 }),
    Pill(W - pad*2 - 58, 24, 50, 20, P.greenLo, 'Pro Plan', P.green, 8),
  ]));

  // BASK AI section
  ch.push(T('BASK AI', pad, 174, 120, 12, { size: 8, fill: P.fg3, weight: 600, ls: 1.2 }));

  const aiOpts = [
    { label: 'Ambient nudges',    sub: 'Subtle tips during sessions',            on: true  },
    { label: 'Morning brief',     sub: 'Day plan quietly set at 8 AM',           on: true  },
    { label: 'Weekly patterns',   sub: 'Rhythm review every Sunday',             on: true  },
    { label: 'Distraction block', sub: 'Auto-block apps during focus sessions',  on: false },
  ];

  ch.push(Card(pad, 192, W - pad * 2, aiOpts.length * 54 + 4, [
    ...aiOpts.flatMap((s, i) => [
      T(s.label, 14, i*54+14, 200, 14, { size: 12, fill: P.fg, weight: 500 }),
      T(s.sub,   14, i*54+31, W-pad*2-80, 12, { size: 9, fill: P.fg3 }),
      F(W-pad*2-48, i*54+17, 34, 18, s.on ? P.amber : P.border2, { r: 9, ch: [
        E(s.on ? 18 : 2, 2, 14, 14, P.white),
      ]}),
      ...(i < aiOpts.length - 1 ? [Line(14, (i+1)*54, W-pad*2-28, P.border)] : []),
    ]),
  ]));

  // QUIET HOURS
  const qhY = 192 + aiOpts.length * 54 + 20;
  ch.push(T('QUIET HOURS', pad, qhY, 120, 12, { size: 8, fill: P.fg3, weight: 600, ls: 1.2 }));

  ch.push(Card(pad, qhY + 18, W - pad * 2, 78, [
    T('No distractions', 14, 12, 200, 14, { size: 12, fill: P.fg, weight: 500 }),
    T('10:00 PM – 7:30 AM', 14, 30, 180, 13, { size: 11, fill: P.fg2 }),
    T('All notifications silenced.', 14, 47, W-pad*2-28, 20, { size: 9, fill: P.fg3, lh: 1.4 }),
    T('Edit →', W - pad*2 - 44, 12, 36, 14, { size: 10, fill: P.amber, weight: 500, align: 'right' }),
  ]));

  ch.push(bottomNav(W, H, 4));
  return F(0, 0, W, H, P.bg, { clip: true, ch });
}

// ── Build ────────────────────────────────────────────────────────────────────
const W = 390, H = 844, GAP = 40;
const screens = [
  { fn: screenToday,    name: 'Today'    },
  { fn: screenFocus,    name: 'Focus'    },
  { fn: screenInsights, name: 'Insights' },
  { fn: screenLog,      name: 'Log'      },
  { fn: screenSettings, name: 'Settings' },
];

const root = {
  version: '2.8',
  name: 'BASK — Ambient Work Rhythm Companion',
  width:  screens.length * W + (screens.length - 1) * GAP + 80,
  height: H + 80,
  fill:   '#E8E3D8',
  children: screens.map((s, i) => {
    const fr = s.fn(W, H);
    fr.x = 40 + i * (W + GAP);
    fr.y = 40;
    fr.name = s.name;
    return fr;
  }),
};

const outPath = path.join(__dirname, 'bask.pen');
fs.writeFileSync(outPath, JSON.stringify(root, null, 2));
console.log(`✓  Saved ${outPath}  (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
