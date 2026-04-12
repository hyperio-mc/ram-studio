'use strict';
// haze-app.js
// HAZE — focus deep, drift less
// Dark ambient focus & session intelligence app for independent creatives
// Inspired by:
//   - Midday.ai (darkmodedesign.com) — floating white dashboard on grainy dark bg,
//     "prose data" widgets with natural language summaries ("Strong week! Revenue…")
//   - Evervault (godly.website) — ultra-dark navy #010314, glowing surface cards
//   - Obsidian OS (darkmodedesign.com) — deep dark + emergent bottom UI card, big serif
//   - 108 Supply (darkmodedesign.com) — editorial mixed-weight type on dark
// Theme: DARK
// Novel patterns for this run:
//   1. "Prose data" widgets — natural language summaries inside metric cards (new to gallery)
//   2. Ambient glow rings behind timer (immersive focus state)
//   3. 2-column soundscape grid with active-state highlight
//   4. Heatmap calendar with 5-level color scale

const fs   = require('fs');
const path = require('path');

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const P = {
  bg:        '#07080F',   // near-black with cool blue tint (inspired by Evervault #010314)
  surface:   '#111827',   // deep blue-gray card
  surfaceB:  '#161E2E',   // slightly elevated card
  surfaceC:  '#1C2539',   // border / raised element
  border:    '#1F2A42',   // subtle border
  text:      '#E8EAFF',   // cool white with blue tint
  textMid:   '#9AA3C5',   // mid blue-gray
  muted:     'rgba(232,234,255,0.35)',
  accent:    '#7C5CFC',   // electric violet (primary)
  accentGlow:'rgba(124,92,252,0.14)',
  teal:      '#2DD4BF',   // mint-teal (secondary)
  tealGlow:  'rgba(45,212,191,0.12)',
  amber:     '#F59E0B',   // warm amber for streaks
  white:     '#FFFFFF',
};

// ─── GEOMETRY ────────────────────────────────────────────────────────────────
const W = 390, H = 844;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
let _id = 1;
const uid = () => `n${_id++}`;

const node = (type, props = {}, children = []) => ({
  id: uid(), type, ...props,
  children: children.length ? children : undefined,
});

const hexToRgb = hex => {
  if (hex.startsWith('rgba')) {
    const m = hex.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (m) return { r: +m[1]/255, g: +m[2]/255, b: +m[3]/255 };
  }
  const h = hex.replace('#','');
  const n = parseInt(h, 16);
  return { r:((n>>16)&255)/255, g:((n>>8)&255)/255, b:(n&255)/255 };
};

const rect = (x, y, w, h, fill, extra = {}) =>
  node('RECTANGLE', {
    x, y, width: w, height: h,
    fills: fill ? [{ type:'SOLID', color: hexToRgb(fill), opacity: extra.opacity ?? 1 }] : [],
    cornerRadius: extra.r ?? 0,
    ...extra,
  });

const txt = (x, y, w, h, content, s = {}) =>
  node('TEXT', {
    x, y, width: w, height: h,
    characters: content,
    fills: [{ type:'SOLID', color: hexToRgb(s.color ?? P.text) }],
    style: {
      fontFamily:  s.font   ?? 'Inter',
      fontWeight:  s.weight ?? 400,
      fontSize:    s.size   ?? 13,
      lineHeight:  s.lh     ?? { value: (s.size ?? 13) * 1.45, unit:'PIXELS' },
      letterSpacing: s.ls   ?? { value: 0, unit:'PIXELS' },
      textAlignHorizontal: s.align ?? 'LEFT',
      italic: s.italic ?? false,
    },
  });

const ellipse = (x, y, w, h, fill, opacity = 1) =>
  node('ELLIPSE', { x, y, width: w, height: h,
    fills: [{ type:'SOLID', color: hexToRgb(fill), opacity }],
  });

const frame = (x, y, w, h, children = [], extra = {}) =>
  node('FRAME', {
    x, y, width: w, height: h,
    fills: [],
    clipsContent: false,
    layoutMode: 'NONE',
    ...extra,
  }, children);

const bar = (x, y, w, th, pct, track, fill, r = 3) =>
  frame(x, y, w, th, [
    rect(0, 0, w, th, track, { r }),
    rect(0, 0, Math.max(4, Math.round(w * pct)), th, fill, { r }),
  ]);

// ─── STATUS BAR ──────────────────────────────────────────────────────────────
const statusBar = () => frame(0, 0, W, 44, [
  txt(20, 14, 60, 16, '9:41', { size: 15, weight: 600, color: P.text }),
  txt(W - 80, 14, 76, 16, '●●● ▲ ■', { size: 9, color: P.textMid, align:'RIGHT' }),
]);

// ─── NAV BAR ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = ['Home','Session','Library','History','Insights'];
const NAV_ICONS = ['◉','▷','♪','◷','⊹'];

const navBar = (active) => {
  const NAV_H = 80, IW = W / 5;
  const kids = [
    rect(0, 0, W, NAV_H, P.surface),
    rect(0, 0, W, 1,     P.border),
  ];
  NAV_ITEMS.forEach((label, i) => {
    const cx = i * IW + IW / 2;
    const on = i === active;
    if (on) kids.push(rect(cx - 28, 6, 56, 54, P.accentGlow, { r: 14 }));
    kids.push(txt(cx - 15, 14, 30, 22, NAV_ICONS[i], { size: 17, align:'CENTER', color: on ? P.accent : P.textMid }));
    kids.push(txt(cx - 24, 40, 48, 14, label, { size: 9, weight: on ? 600 : 400, align:'CENTER', color: on ? P.accent : P.muted }));
  });
  return frame(0, H - NAV_H, W, NAV_H, kids);
};

// ─── SCREEN 1 — HOME ─────────────────────────────────────────────────────────
// Midday-style: prose widgets + "Good evening" greeting + floating card on dark
const s1_home = () => frame(0, 0, W, H, [
  rect(0, 0, W, H, P.bg),
  // Ambient glows
  ellipse(-60, -40, 260, 260, P.accent, 0.07),
  ellipse(W - 130, H - 270, 230, 230, P.teal, 0.06),

  statusBar(),

  // ── Greeting
  txt(24, 54, 260, 36, 'Good evening, Alex', { size: 26, weight: 700, lh:{value:36,unit:'PIXELS'} }),
  txt(24, 93, 240, 16, 'Thursday, March 27', { size: 13, color: P.textMid }),

  // ── Today snapshot (Midday-inspired prose card)
  rect(20, 120, W-40, 134, P.surface, { r: 16 }),
  rect(20, 120, 4, 134, P.accent, { r: 3 }),  // accent left bar
  txt(36, 134, 160, 14, 'TODAY\'S FOCUS', { size: 10, weight: 600, color: P.textMid, ls:{value:1.2,unit:'PIXELS'} }),
  txt(36, 152, 160, 46, '4h 22m', { size: 38, weight: 700, lh:{value:46,unit:'PIXELS'} }),
  // Prose summary — the key Midday pattern
  txt(36, 202, W-80, 36,
    'Your deepest session was 87 min — a personal best. Flow state detected twice today.',
    { size: 12, color: P.textMid, lh:{value:18,unit:'PIXELS'} }
  ),
  txt(36, 240, 80, 14, '3 sessions', { size: 11, weight: 500, color: P.teal }),
  txt(130, 240, 80, 14, '92 score',   { size: 11, weight: 500, color: P.accent }),
  txt(218, 240, 80, 14, '↑ 14%',      { size: 11, weight: 500, color: P.amber }),

  // ── Active now prompt
  rect(20, 266, W-40, 72, P.surfaceB, { r: 14 }),
  ellipse(34, 282, 10, 10, P.accent, 0.9),
  txt(56, 280, 200, 18, 'Ready to focus', { size: 14, weight: 600 }),
  txt(56, 300, 220, 14, 'Last session 2h ago · Pomodoro mode', { size: 11, color: P.textMid }),
  rect(W-106, 276, 72, 30, P.accent, { r: 10 }),
  txt(W-106, 276, 72, 30, 'Start →', { size: 12, weight: 600, color: P.white, align:'CENTER', lh:{value:30,unit:'PIXELS'} }),

  // ── Mood check-in
  txt(24, 354, 180, 18, 'How are you feeling?', { size: 14, weight: 600 }),
  ...['🔥 Flow','😌 Calm','🌫 Foggy','⚡ Wired'].map((m, i) => {
    const x = 20 + i * 87;
    const on = i === 0;
    return frame(x, 378, 80, 28, [
      rect(0, 0, 80, 28, on ? P.accentGlow : P.surfaceC, { r: 14 }),
      txt(0, 0, 80, 28, m, { size: 11, weight: on ? 600 : 400, color: on ? P.text : P.textMid, align:'CENTER', lh:{value:28,unit:'PIXELS'} }),
    ], { cornerRadius: 14 });
  }),

  // ── Recent sessions
  txt(24, 422, 160, 18, 'Recent sessions', { size: 14, weight: 600 }),
  txt(W-76, 422, 56, 18, 'See all', { size: 12, color: P.accent, align:'RIGHT' }),

  ...[
    { label:'Deep work block', sub:'Today · 87 min',     icon:'⊛', score:'96', color: P.teal   },
    { label:'Writing sprint',  sub:'Today · 45 min',     icon:'✦', score:'88', color: P.accent },
    { label:'Planning',        sub:'Yesterday · 30 min', icon:'◎', score:'74', color: P.amber  },
  ].map((s, i) => frame(20, 448 + i * 60, W-40, 52, [
    rect(0, 0, W-40, 52, P.surface, { r: 12 }),
    ellipse(14, 12, 28, 28, P.surfaceC, 1),
    txt(14, 12, 28, 28, s.icon, { size: 14, align:'CENTER', color: s.color, lh:{value:28,unit:'PIXELS'} }),
    txt(54, 8,  200, 18, s.label, { size: 13, weight: 600 }),
    txt(54, 28, 200, 14, s.sub,   { size: 11, color: P.textMid }),
    rect(W-86, 14, 36, 22, P.surfaceC, { r: 8 }),
    txt(W-86, 14, 36, 22, s.score, { size: 12, weight: 700, color: s.color, align:'CENTER', lh:{value:22,unit:'PIXELS'} }),
  ], { cornerRadius: 12 })),

  navBar(0),
]);

// ─── SCREEN 2 — ACTIVE SESSION ───────────────────────────────────────────────
// Big immersive timer with ambient glow ring — new pattern for gallery
const s2_session = () => frame(0, 0, W, H, [
  rect(0, 0, W, H, P.bg),
  // Glow ring (layered ellipses — depth effect)
  ellipse(W/2 - 170, 120, 340, 340, P.accent, 0.07),
  ellipse(W/2 - 140, 150, 280, 280, P.accent, 0.06),
  ellipse(W/2 - 110, 180, 220, 220, P.accent, 0.05),

  statusBar(),

  txt(20, 54, 40, 24, '‹', { size: 24, color: P.textMid }),
  txt(60, 56, W-120, 18, 'FOCUS SESSION', { size: 10, weight: 600, color: P.textMid, ls:{value:1.5,unit:'PIXELS'}, align:'CENTER' }),
  txt(W-54, 54, 34, 24, '⋮', { size: 20, color: P.textMid }),

  // Session type badge
  frame(W/2 - 55, 88, 110, 26, [
    rect(0, 0, 110, 26, P.accentGlow, { r: 13 }),
    txt(0, 0, 110, 26, '⊛  Deep Work', { size: 11, weight: 600, color: P.accent, align:'CENTER', lh:{value:26,unit:'PIXELS'} }),
  ], { cornerRadius: 13 }),

  // Timer ring outlines
  node('ELLIPSE', { x: W/2-112, y: 128, width: 224, height: 224,
    fills: [], strokes:[{ type:'SOLID', color: hexToRgb(P.surfaceC) }], strokeWeight: 5 }),
  node('ELLIPSE', { x: W/2-104, y: 136, width: 208, height: 208,
    fills: [], strokes:[{ type:'SOLID', color: hexToRgb(P.accent) }], strokeWeight: 3 }),

  // Timer numbers
  txt(W/2 - 62, 200, 124, 58, '23:41', { size: 50, weight: 700, align:'CENTER', lh:{value:58,unit:'PIXELS'} }),
  txt(W/2 - 48, 260, 96, 16, 'remaining', { size: 12, color: P.textMid, align:'CENTER' }),

  // Flow state badge
  frame(W/2 - 52, 284, 104, 24, [
    rect(0, 0, 104, 24, P.tealGlow, { r: 12 }),
    txt(0, 0, 104, 24, '✦ Flow state', { size: 11, weight: 600, color: P.teal, align:'CENTER', lh:{value:24,unit:'PIXELS'} }),
  ], { cornerRadius: 12 }),

  // Controls
  ellipse(W/2 - 38, 324, 76, 76, P.accent),
  txt(W/2 - 38, 324, 76, 76, '⏸', { size: 28, align:'CENTER', color: P.white, lh:{value:76,unit:'PIXELS'} }),
  ellipse(W/2 - 104, 340, 46, 46, P.surfaceB),
  txt(W/2 - 104, 340, 46, 46, '↩', { size: 18, align:'CENTER', color: P.textMid, lh:{value:46,unit:'PIXELS'} }),
  ellipse(W/2 + 58,  340, 46, 46, P.surfaceB),
  txt(W/2 + 58,  340, 46, 46, '⤵', { size: 18, align:'CENTER', color: P.textMid, lh:{value:46,unit:'PIXELS'} }),

  // ── Sound card
  rect(20, 412, W-40, 78, P.surface, { r: 16 }),
  txt(36, 426, 140, 14, 'AMBIENT SOUND', { size: 10, weight: 600, color: P.textMid, ls:{value:1.2,unit:'PIXELS'} }),
  txt(36, 444, 200, 20, '🌧  Rain on Glass', { size: 15, weight: 600 }),
  txt(36, 466, 200, 14, 'Spatial · 44Hz', { size: 11, color: P.textMid }),
  bar(36, 474, W-96, 4, 0.68, P.surfaceC, P.teal, 2),
  txt(W-56, 470, 36, 14, '68%', { size: 10, color: P.textMid, align:'RIGHT' }),

  // ── Session stats mini-row
  rect(20, 502, W-40, 64, P.surfaceB, { r: 14 }),
  ...[
    { label:'Elapsed',  val:'36m'   },
    { label:'Distract.', val:'2'     },
    { label:'HR avg',   val:'62bpm' },
  ].map((s, i) => frame(36 + i * 110, 508, 100, 52, [
    txt(0, 2, 100, 16, s.label, { size: 10, color: P.muted }),
    txt(0, 20, 100, 28, s.val,   { size: 18, weight: 700 }),
  ])),

  // Notes prompt
  rect(20, 578, W-40, 46, P.surface, { r: 12 }),
  txt(36, 590, 240, 22, '+ Add a thought or note…', { size: 13, color: P.muted, italic: true }),

  navBar(1),
]);

// ─── SCREEN 3 — LIBRARY ──────────────────────────────────────────────────────
// 2-col soundscape grid — new layout pattern
const s3_library = () => {
  const sounds = [
    { name:'Rain on Glass', sub:'Spatial · Focus', icon:'🌧', color: P.teal,   active: true  },
    { name:'Brown Noise',   sub:'Pure · 40Hz',     icon:'〰', color: P.accent, active: false },
    { name:'Forest Dawn',   sub:'Binaural · Nat.', icon:'🌿', color:'#4ADE80', active: false },
    { name:'Lo-fi Studio',  sub:'Music · 90 BPM',  icon:'♪', color: P.amber,  active: false },
    { name:'Deep Ocean',    sub:'Spatial · Sleep', icon:'🌊', color:'#60A5FA', active: false },
    { name:'White Noise',   sub:'Pure · Masking',  icon:'◌', color: P.textMid,active: false },
  ];
  const filters = ['All','Deep Work','Creative','Calm','Wind Down'];
  const filterWidths = [36, 90, 82, 50, 96];
  let fx = 20;

  const CW = (W - 52) / 2;

  return frame(0, 0, W, H, [
    rect(0, 0, W, H, P.bg),
    ellipse(W - 100, -60, 200, 200, P.teal, 0.07),

    statusBar(),
    txt(24, 54, 200, 30, 'Library', { size: 26, weight: 700 }),
    txt(24, 86, 260, 16, '24 soundscapes · curated for focus', { size: 13, color: P.textMid }),

    // Search
    rect(20, 112, W-40, 40, P.surface, { r: 12 }),
    txt(44, 112, 230, 40, '🔍  Search soundscapes…', { size: 13, color: P.muted, lh:{value:40,unit:'PIXELS'} }),

    // Filter chips
    ...filters.map((f, i) => {
      const fw = filterWidths[i];
      const x = fx; fx += fw + 8;
      const on = i === 0;
      return frame(x, 164, fw, 28, [
        rect(0, 0, fw, 28, on ? P.accent : P.surfaceB, { r: 14 }),
        txt(0, 0, fw, 28, f, { size: 11, weight: on ? 600 : 400, color: on ? P.white : P.textMid, align:'CENTER', lh:{value:28,unit:'PIXELS'} }),
      ], { cornerRadius: 14 });
    }),

    // 2-col grid
    ...sounds.map((s, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = 20 + col * (CW + 12);
      const y = 208 + row * 108;
      return frame(x, y, CW, 98, [
        rect(0, 0, CW, 98, s.active ? P.surfaceB : P.surface, { r: 14 }),
        // active ring
        ...(s.active ? [node('RECTANGLE', { x:0, y:0, width:CW, height:98,
          fills:[],
          strokes:[{ type:'SOLID', color: hexToRgb(P.accent) }],
          strokeWeight: 1.5,
          cornerRadius: 14,
        })] : []),
        txt(14, 14, 30, 28, s.icon, { size: 20, color: s.color }),
        ...(s.active ? [ellipse(CW-20, 12, 10, 10, P.teal)] : []),
        txt(14, 48, CW-28, 18, s.name, { size: 12, weight: 600 }),
        txt(14, 68, CW-28, 14, s.sub,  { size: 10, color: P.textMid }),
      ], { cornerRadius: 14 });
    }),

    navBar(2),
  ]);
};

// ─── SCREEN 4 — HISTORY ──────────────────────────────────────────────────────
// Heatmap calendar — new visualization pattern for gallery
const s4_history = () => {
  const heatData = [
    [0,1,2,3,2,1,0],
    [1,3,4,3,2,2,1],
    [2,4,3,2,3,4,1],
    [1,2,3,4,2,1,0],
    [0,1,2,3,4,3,2],
  ];
  const heatColors = [P.surfaceC, '#2D3A5C', '#3D4F80', P.accent, P.teal];
  const CELL = 36, GAP = 8;
  const sessions = [
    { day:'Today',     info:'3 sessions · 4h 22m', score: 92, color: P.teal   },
    { day:'Yesterday', info:'2 sessions · 2h 10m', score: 88, color: P.accent },
    { day:'Tuesday',   info:'4 sessions · 6h 05m', score: 95, color: P.teal   },
    { day:'Monday',    info:'1 session  · 45m',    score: 70, color: P.amber  },
  ];

  return frame(0, 0, W, H, [
    rect(0, 0, W, H, P.bg),
    ellipse(-40, 170, 180, 180, P.accent, 0.06),

    statusBar(),
    txt(24, 54, 200, 30, 'History', { size: 26, weight: 700 }),
    txt(24, 86, 260, 16, '35-day activity map', { size: 13, color: P.textMid }),

    txt(24, 112, 120, 18, 'March 2026', { size: 14, weight: 600 }),
    ...['M','T','W','T','F','S','S'].map((d, i) =>
      txt(20 + i*(CELL+GAP) + CELL/2 - 8, 132, 16, 14, d, { size: 10, color: P.textMid, align:'CENTER' })
    ),
    // Heatmap cells
    ...heatData.flatMap((row, ri) =>
      row.map((val, ci) =>
        rect(20 + ci*(CELL+GAP), 152 + ri*(CELL+GAP), CELL, CELL, heatColors[val], { r: 8 })
      )
    ),
    // Legend
    txt(20, 416, 44, 14, 'Low', { size: 10, color: P.muted }),
    ...heatColors.map((c, i) => rect(62 + i*22, 412, 16, 16, c, { r: 4 })),
    txt(180, 416, 40, 14, 'High', { size: 10, color: P.muted }),

    // Weekly stats
    rect(20, 440, W-40, 70, P.surface, { r: 14 }),
    txt(36, 452, W-80, 14, 'THIS WEEK', { size: 10, weight: 600, color: P.textMid, ls:{value:1.2,unit:'PIXELS'} }),
    ...[
      { label:'Sessions', val:'12'  },
      { label:'Total',    val:'18h' },
      { label:'Avg',      val:'89'  },
      { label:'Streak',   val:'6d🔥'},
    ].map((s, i) => frame(36 + i*80, 470, 72, 32, [
      txt(0, 0,  72, 18, s.val,   { size: 15, weight: 700 }),
      txt(0, 18, 72, 14, s.label, { size: 9,  color: P.muted }),
    ])),

    // Log
    txt(24, 524, 160, 18, 'Daily log', { size: 14, weight: 600 }),
    ...sessions.map((s, i) => frame(20, 548 + i*54, W-40, 46, [
      rect(0, 0, W-40, 46, P.surface, { r: 12 }),
      rect(0, 0, 3, 46, s.color, { r: 2 }),
      txt(16, 6,  200, 18, s.day,  { size: 13, weight: 600 }),
      txt(16, 26, 220, 14, s.info, { size: 11, color: P.textMid }),
      txt(W-82, 6, 54, 34, s.score.toString(), { size: 20, weight: 700, color: s.color, align:'RIGHT', lh:{value:34,unit:'PIXELS'} }),
    ], { cornerRadius: 12 })),

    navBar(3),
  ]);
};

// ─── SCREEN 5 — INSIGHTS ─────────────────────────────────────────────────────
// "Midday prose brief" — the signature weekly summary card with AI-written narrative
const s5_insights = () => {
  const barVals = [72, 88, 95, 70, 89, 85, 92];
  return frame(0, 0, W, H, [
    rect(0, 0, W, H, P.bg),
    ellipse(W/2 - 120, 56, 240, 140, P.accent, 0.08),

    statusBar(),
    txt(24, 54, 220, 30, 'Insights', { size: 26, weight: 700 }),
    txt(24, 86, 260, 16, 'Week of Mar 24 – 30', { size: 13, color: P.textMid }),

    // ── Weekly brief — CORE "prose data" widget (Midday-inspired)
    rect(20, 114, W-40, 152, P.surface, { r: 16 }),
    rect(20, 114, W-40, 3,   P.accent,  { r: 2 }),
    txt(36, 126, 140, 14, 'WEEKLY BRIEF', { size: 10, weight: 600, color: P.accent, ls:{value:1.2,unit:'PIXELS'} }),
    txt(36, 146, W-80, 96,
      'Solid week. You logged 18 hours across 12 sessions — up 23% from last week. Your peak window holds at 9–11am. Tuesday\'s marathon 6h day powered your streak. Watch your evening sessions: they score 18 points lower on average.',
      { size: 12.5, color: P.text, lh:{value:20,unit:'PIXELS'} }
    ),
    txt(36, 248, 160, 14, 'Generated by Haze AI', { size: 10, color: P.muted, italic: true }),

    // ── Trend pair
    ...([
      { label:'Peak window', val:'9–11am', icon:'☀', color: P.amber, sub:'3 weeks consistent' },
      { label:'Top sound',   val:'Rain',   icon:'🌧', color: P.teal,  sub:'8.4h this week'    },
    ]).map((c, i) => {
      const CW2 = (W-52)/2;
      const x = 20 + i * (CW2 + 12);
      return frame(x, 278, CW2, 88, [
        rect(0, 0, CW2, 88, P.surfaceB, { r: 14 }),
        txt(14, 14, 26, 26, c.icon,  { size: 18, color: c.color }),
        txt(14, 42, CW2-28, 18, c.val,   { size: 15, weight: 700 }),
        txt(14, 62, CW2-28, 14, c.label, { size: 10, color: P.textMid }),
        txt(14, 76, CW2-28, 12, c.sub,   { size: 9,  color: c.color }),
      ], { cornerRadius: 14 });
    }),

    // ── Bar chart
    txt(24, 382, 200, 18, 'Focus quality trend', { size: 14, weight: 600 }),
    rect(20, 406, W-40, 90, P.surface, { r: 14 }),
    ...barVals.map((val, i) => {
      const bh = Math.round((val/100)*56);
      const bw = 28;
      const x = 36 + i*44;
      const y = 486 - bh;
      const on = i === 6;
      return rect(x, y, bw, bh, on ? P.accent : P.surfaceC, { r: 5 });
    }),
    ...['M','T','W','T','F','S','T'].map((d, i) =>
      txt(36 + i*44, 488, 28, 12, d, { size: 9, color: P.textMid, align:'CENTER' })
    ),

    // ── Recommendation
    rect(20, 508, W-40, 66, P.accentGlow, { r: 14 }),
    txt(36, 524, 22, 22, '⚡', { size: 18, color: P.accent }),
    txt(66, 520, W-106, 16, 'Try a 90-min ultradian session', { size: 13, weight: 600 }),
    txt(66, 538, W-106, 30,
      'Your flow data suggests you consistently peak past the standard 25-min block.',
      { size: 11, color: P.textMid, lh:{value:16,unit:'PIXELS'} }
    ),

    navBar(4),
  ]);
};

// ─── BUILD PEN ───────────────────────────────────────────────────────────────
const screens = [
  { name: '01 · Home',     content: s1_home()    },
  { name: '02 · Session',  content: s2_session() },
  { name: '03 · Library',  content: s3_library() },
  { name: '04 · History',  content: s4_history() },
  { name: '05 · Insights', content: s5_insights()},
];

const GAP = 60;
const pages = screens.map((s, i) => ({
  ...s.content,
  id:   `screen_${i}`,
  name: s.name,
  x:    i * (W + GAP),
  y:    0,
}));

const pen = {
  version:  '2.8',
  name:     'HAZE — focus deep, drift less',
  width:    screens.length * W + (screens.length - 1) * GAP,
  height:   H,
  fill:     P.bg,
  children: pages,
};

const outPath = path.join(__dirname, 'haze.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ haze.pen written — ${(fs.statSync(outPath).size / 1024).toFixed(1)} KB`);
