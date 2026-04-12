'use strict';
// sanctum-app.js — SANCTUM: A dark deep-work focus companion
//
// Inspiration:
//   • Linear.app — "UI refresh: Introducing a calmer, more consistent interface"
//     (Mar 11, 2026) — the philosophy of reducing cognitive noise while keeping
//     information density. Clean dark system with purposeful whitespace and
//     subtle border-only surfaces instead of fills.
//   • Flomodia.com (via godly.website) — editorial spaced typography:
//     "I n s p i r e  a n d  e d u c a t e" — using letter-spacing as a
//     stylistic device for labels and headings in a quiet, contemplative UI.
//   • darkmodedesign.com gallery — the pattern of dark tools that feel
//     like a calm space rather than a feature checklist.
//
// Challenge: Design a 5-screen DARK deep-work companion with zero gamification
// noise. Inspiration from Linear's "calm" philosophy — fewer visual cues,
// more intentional space. Use spaced editorial typography for labels (ls: 1.5+)
// contrasted with bold numerals. Candlelight gold (#D4A853) + deep violet (#8B6FD4)
// duality: gold for presence/warmth, violet for depth/focus.
//
// Screens: Sanctuary (home) · Ritual (setup) · Chamber (active) · Harvest (done) · Codex (history)

const fs   = require('fs');
const path = require('path');

// ── Palette ─────────────────────────────────────────────────────────────────
const P = {
  bg:        '#09090E',
  bg2:       '#0E0E16',
  surface:   '#13141C',
  surface2:  '#1A1B26',
  border:    '#23243A',
  border2:   '#2E3050',
  fg:        '#E8E6F0',
  fg2:       '#9B99B0',
  fg3:       '#5C5A70',
  gold:      '#D4A853',
  goldLo:    '#D4A85320',
  goldMid:   '#D4A85340',
  violet:    '#8B6FD4',
  violetLo:  '#8B6FD420',
  violetMid: '#8B6FD440',
  rose:      '#E06B6B',
  roseLo:    '#E06B6B20',
  sage:      '#68A882',
  sageLo:    '#68A88220',
  white:     '#FFFFFF',
};

let _id = 0;
const uid = () => `sn${++_id}`;

// Core builder helpers
const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill || 'transparent',
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
  ...(opts.stroke ? { stroke: { align: opts.strokeAlign || 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.shadow ? { shadow: opts.shadow } : {}),
  children: [],
});

const Line = (x, y, w, fill = P.border, h = 1) => F(x, y, w, h, fill);

const cardShadow   = { x: 0, y: 2, blur: 16, spread: -2, fill: 'rgba(0,0,0,0.4)' };
const glowGold     = { x: 0, y: 0, blur: 20, spread: -4, fill: 'rgba(212,168,83,0.15)' };
const glowViolet   = { x: 0, y: 0, blur: 24, spread: -4, fill: 'rgba(139,111,212,0.2)' };

const Card = (x, y, w, h, children = [], opts = {}) =>
  F(x, y, w, h, opts.fill || P.surface, {
    r: opts.r !== undefined ? opts.r : 12,
    stroke: opts.stroke !== undefined ? opts.stroke : P.border, sw: 1,
    shadow: opts.shadow !== undefined ? opts.shadow : cardShadow,
    ch: children,
  });

const Pill = (x, y, w, h, bg, text, textFill, size = 9) =>
  F(x, y, w, h, bg, {
    r: h / 2,
    ch: [T(text, 0, (h - size - 1) / 2, w, size + 2, {
      size, fill: textFill, align: 'center', weight: 600, ls: 0.6,
    })],
  });

// Spaced editorial label (key stylistic device — from Flomodia's spaced typography)
const SpacedLabel = (text, x, y, w, h, opts = {}) =>
  T(text, x, y, w, h, {
    size:   opts.size || 8,
    fill:   opts.fill || P.fg3,
    weight: opts.weight || 600,
    ls:     opts.ls !== undefined ? opts.ls : 1.8,
    ...opts,
  });

// ── Layout constants ─────────────────────────────────────────────────────────
const W      = 390;
const H      = 844;
const NAV_H  = 72;
const STATUS = 44;
const PAD    = 20;

const NAV_ITEMS = [
  { label: 'SANCTUARY', icon: '⌂' },
  { label: 'RITUAL',    icon: '◈' },
  { label: 'CHAMBER',   icon: '◎' },
  { label: 'HARVEST',   icon: '✦' },
  { label: 'CODEX',     icon: '≡' },
];

function statusBar() {
  return F(0, 0, W, STATUS, P.bg, { ch: [
    T('9:41', 16, 14, 50, 16, { size: 13, fill: P.fg2, weight: 500 }),
    T('●●●  ▲  ▮▮', W - 72, 14, 64, 16, { size: 9, fill: P.fg3, align: 'right' }),
  ]});
}

function bottomNav(activeIdx) {
  const itemW = W / NAV_ITEMS.length;
  const items = NAV_ITEMS.map((item, i) => {
    const isActive  = i === activeIdx;
    const iconFill  = isActive ? P.gold : P.fg3;
    const labelFill = isActive ? P.gold : P.fg3;
    return F(i * itemW, 0, itemW, NAV_H, 'transparent', { ch: [
      T(item.icon, i * itemW + (itemW - 20) / 2, 10, 20, 20,
        { size: 14, fill: iconFill, align: 'center', weight: isActive ? 700 : 400 }),
      T(item.label, i * itemW + (itemW - 56) / 2, 32, 56, 10,
        { size: 6, fill: labelFill, align: 'center', weight: isActive ? 700 : 400, ls: 1.2 }),
    ]});
  });
  const dotX = activeIdx * itemW + (itemW - 20) / 2;
  return F(0, H - NAV_H, W, NAV_H, P.surface, {
    stroke: P.border, sw: 1,
    shadow: { x: 0, y: -4, blur: 16, spread: 0, fill: 'rgba(0,0,0,0.3)' },
    ch: [...items, F(dotX, 0, 20, 3, P.gold, { r: 1 })],
  });
}

// ────────────────────────────────────────────────────────────────────────────
// SCREEN A — SANCTUARY (home)
// ────────────────────────────────────────────────────────────────────────────
function screenSanctuary() {
  const ch = [];

  // Background ambient glow top-right
  ch.push(E(W - 60, -40, 200, 200, P.violetLo, { opacity: 0.5 }));
  ch.push(E(-40, H * 0.5, 180, 180, P.goldLo, { opacity: 0.4 }));

  ch.push(statusBar());

  // ── Header
  ch.push(T('S A N C T U M', PAD, 56, 180, 16,
    { size: 11, fill: P.fg3, weight: 600, ls: 3.5 }));
  ch.push(T('Your deep work space.', PAD, 76, 260, 20,
    { size: 17, fill: P.fg, weight: 300, lh: 1.3 }));

  // ── Streak card
  ch.push(Card(PAD, 108, W - PAD * 2, 82, [
    F(0, 0, 4, 82, P.gold, { r: 3 }),
    SpacedLabel('CURRENT STREAK', 14, 12, 200, 10),
    T('14', 14, 28, 60, 40, { size: 38, fill: P.gold, weight: 700, lh: 1 }),
    T('days', 56, 44, 50, 16, { size: 11, fill: P.fg3, weight: 400, ls: 0.2 }),
    Line(128, 20, 1, P.border, 42),
    SpacedLabel('BEST STREAK', 140, 12, 140, 10),
    T('21 days', 140, 28, 140, 18, { size: 14, fill: P.fg2, weight: 500 }),
    SpacedLabel('THIS WEEK', 140, 52, 140, 10),
    T('6 sessions', 140, 62, 140, 14, { size: 11, fill: P.fg3, weight: 400 }),
    SpacedLabel('TOTAL HOURS', 248, 12, 120, 10),
    T('312 h', 248, 28, 120, 18, { size: 14, fill: P.fg2, weight: 500 }),
    SpacedLabel('DEPTH AVG', 248, 52, 120, 10),
    T('82%', 248, 62, 120, 14, { size: 11, fill: P.sage, weight: 600 }),
  ], { shadow: glowGold }));

  // ── Today section label
  ch.push(SpacedLabel('T O D A Y', PAD, 204, 120, 12, { size: 8 }));
  ch.push(Line(PAD, 219, W - PAD * 2, P.border));

  // ── Today sessions
  const sessions = [
    { label: 'Morning Block',   time: '7:30 – 9:15',   dur: '1h 45m', depth: 94, done: true,  active: false },
    { label: 'Design Sprint',   time: '10:00 – 12:00', dur: '2h',     depth: 78, done: false, active: true  },
    { label: 'Evening Review',  time: '4:00 – 4:45',   dur: '45m',    depth: null, done: false, active: false },
  ];

  sessions.forEach((s, i) => {
    const y = 228 + i * 64;
    const clr = s.active ? P.gold : s.done ? P.sage : P.border2;
    ch.push(Card(PAD, y, W - PAD * 2, 56, [
      F(0, 0, 3, 56, clr, { r: 2 }),
      T(s.label, 14, 9, 200, 14,
        { size: 12, fill: s.active ? P.fg : s.done ? P.fg2 : P.fg3, weight: s.active ? 600 : 500 }),
      T(s.time, 14, 27, 160, 11, { size: 9, fill: P.fg3, ls: 0.2 }),
      Pill(W - PAD * 2 - 64, 18, 56, 20,
        s.active ? P.goldMid : s.done ? P.sageLo : 'transparent',
        s.dur,
        s.active ? P.gold : s.done ? P.sage : P.fg3, 8),
      ...(s.done ? [
        SpacedLabel(String(s.depth) + '%', W - PAD * 2 - 102, 9, 32, 10,
          { size: 7, fill: P.sage }),
        SpacedLabel('DEPTH', W - PAD * 2 - 102, 22, 32, 9, { size: 6, fill: P.fg3 }),
      ] : s.active ? [
        E(W - PAD * 2 - 106, 20, 12, 12, P.goldMid),
        T('▶', W - PAD * 2 - 102, 21, 12, 10, { size: 7, fill: P.gold, weight: 700, align: 'center' }),
      ] : []),
    ], { r: 10 }));
  });

  // ── Begin session CTA
  ch.push(F(PAD, 428, W - PAD * 2, 52, P.gold, {
    r: 12,
    shadow: glowGold,
    ch: [
      T('+ Begin New Session', 0, 0, W - PAD * 2, 52,
        { size: 14, fill: P.bg, weight: 700, align: 'center', lh: 52 / 14 }),
    ],
  }));

  // ── Intention card
  ch.push(Card(PAD, 494, W - PAD * 2, 68, [
    SpacedLabel('TODAY\'S INTENTION', 14, 11, 220, 10),
    T('"Finish the component library and', 14, 27, W - PAD * 2 - 28, 15,
      { size: 11, fill: P.fg2, weight: 400, lh: 1.5 }),
    T('ship the design review."', 14, 43, W - PAD * 2 - 28, 14,
      { size: 11, fill: P.fg2, weight: 400, lh: 1.5 }),
  ]));

  // ── Depth rhythm chart (mini bar chart)
  ch.push(SpacedLabel('T H I S  W E E K', PAD, 576, 160, 12, { size: 8 }));
  ch.push(Line(PAD, 591, W - PAD * 2, P.border));

  const days  = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const vals  = [0.85, 0.92, 0.70, 0.88, 0.60, 0, 0];
  const barW  = Math.floor((W - PAD * 2 - 6 * 6) / 7);
  const maxH  = 64;
  const barY0 = 600;

  days.forEach((d, i) => {
    const bx   = PAD + i * (barW + 6);
    const bh   = Math.round(vals[i] * maxH);
    const clr  = i === 1 ? P.gold : vals[i] > 0 ? P.violetMid : P.border;
    if (bh > 0) {
      ch.push(F(bx, barY0 + maxH - bh, barW, bh, clr, { r: 3 }));
    } else {
      ch.push(F(bx, barY0 + maxH - 4, barW, 4, P.border, { r: 2 }));
    }
    ch.push(T(d, bx, barY0 + maxH + 4, barW, 10,
      { size: 8, fill: P.fg3, weight: 400, align: 'center' }));
  });

  ch.push(bottomNav(0));
  return F(0, 0, W, H, P.bg, { ch: ch });
}

// ────────────────────────────────────────────────────────────────────────────
// SCREEN B — RITUAL (session setup)
// ────────────────────────────────────────────────────────────────────────────
function screenRitual() {
  const ch = [];

  ch.push(E(-20, -40, 220, 220, P.goldLo, { opacity: 0.35 }));
  ch.push(statusBar());

  // Header
  ch.push(SpacedLabel('N E W  S E S S I O N', PAD, 56, 240, 12, { size: 9 }));
  ch.push(T('Set your ritual.', PAD, 74, 260, 24,
    { size: 22, fill: P.fg, weight: 600, lh: 1.2 }));
  ch.push(T('Intention shapes depth.', PAD, 100, 260, 16,
    { size: 12, fill: P.fg3, weight: 300 }));

  // ── Project selector
  ch.push(SpacedLabel('P R O J E C T', PAD, 132, 140, 10));
  const projects = [
    { name: 'Sanctum Design System', clr: P.violet, active: true },
    { name: 'Client Proposal',       clr: P.gold,   active: false },
    { name: 'Personal Writing',      clr: P.sage,   active: false },
  ];
  projects.forEach((p, i) => {
    const y = 148 + i * 50;
    ch.push(Card(PAD, y, W - PAD * 2, 42, [
      E(12, 12, 14, 14, p.active ? p.clr : P.border2),
      T(p.name, 34, 12, W - PAD * 2 - 54, 14,
        { size: 12, fill: p.active ? P.fg : P.fg3, weight: p.active ? 600 : 400 }),
      ...(p.active ? [
        T('✓', W - PAD * 2 - 26, 12, 16, 14,
          { size: 10, fill: p.clr, weight: 700, align: 'center' }),
      ] : []),
    ], {
      fill: p.active ? P.surface2 : P.surface,
      stroke: p.active ? p.clr : P.border, sw: p.active ? 1 : 1,
    }));
  });

  // ── Duration picker
  ch.push(SpacedLabel('D U R A T I O N', PAD, 304, 140, 10));
  const durations = ['25 m', '45 m', '1 h', '1.5 h', '2 h'];
  const dW = Math.floor((W - PAD * 2 - 4 * 8) / 5);
  durations.forEach((d, i) => {
    const x = PAD + i * (dW + 8);
    const isActive = i === 2; // 1h selected
    ch.push(F(x, 320, dW, 38, isActive ? P.goldMid : P.surface, {
      r: 8,
      stroke: isActive ? P.gold : P.border, sw: 1,
      ch: [
        T(d, 0, 0, dW, 38,
          { size: 11, fill: isActive ? P.gold : P.fg3, weight: isActive ? 700 : 400, align: 'center', lh: 38 / 11 }),
      ],
    }));
  });

  // ── Intention input
  ch.push(SpacedLabel('I N T E N T I O N', PAD, 372, 160, 10));
  ch.push(Card(PAD, 388, W - PAD * 2, 76, [
    T('What do you want to finish in this session?', 14, 12, W - PAD * 2 - 28, 30,
      { size: 11, fill: P.fg3, weight: 400, lh: 1.6 }),
    Line(14, 46, W - PAD * 2 - 28, P.border),
    T('🎯  Ship the component tokens PR', 14, 54, W - PAD * 2 - 28, 16,
      { size: 12, fill: P.fg, weight: 500 }),
  ]));

  // ── Mode toggle
  ch.push(SpacedLabel('A M B I E N T  M O D E', PAD, 478, 220, 10));
  const modes = [
    { label: 'Silent', icon: '◌', active: false },
    { label: 'Ember',  icon: '◉', active: true  },
    { label: 'Rain',   icon: '⧖', active: false },
  ];
  const mW = Math.floor((W - PAD * 2 - 2 * 10) / 3);
  modes.forEach((m, i) => {
    const x = PAD + i * (mW + 10);
    const isActive = m.active;
    ch.push(F(x, 494, mW, 52, isActive ? P.goldLo : P.surface, {
      r: 10,
      stroke: isActive ? P.gold : P.border, sw: 1,
      ch: [
        T(m.icon, 0, 8, mW, 18,
          { size: 14, fill: isActive ? P.gold : P.fg3, align: 'center' }),
        T(m.label, 0, 30, mW, 14,
          { size: 10, fill: isActive ? P.gold : P.fg3, align: 'center', weight: isActive ? 600 : 400 }),
      ],
    }));
  });

  // ── Enter Sanctum CTA
  ch.push(F(PAD, 560, W - PAD * 2, 56, P.violet, {
    r: 12,
    shadow: glowViolet,
    ch: [
      T('Enter the Chamber', 0, 0, W - PAD * 2, 56,
        { size: 15, fill: P.white, weight: 700, align: 'center', lh: 56 / 15, ls: 0.3 }),
    ],
  }));

  ch.push(bottomNav(1));
  return F(0, 0, W, H, P.bg, { ch });
}

// ────────────────────────────────────────────────────────────────────────────
// SCREEN C — CHAMBER (active focus session)
// Key design: large centered orbital timer. Editorial calm. Minimal chrome.
// ────────────────────────────────────────────────────────────────────────────
function screenChamber() {
  const ch = [];

  // Ambient bg glow centered
  ch.push(E(W / 2 - 120, H * 0.28, 240, 240, P.violetLo, { opacity: 0.5 }));
  ch.push(E(W / 2 - 80, H * 0.25, 160, 160, P.goldLo, { opacity: 0.3 }));

  ch.push(statusBar());

  // Back / project context
  ch.push(T('← Sanctum Design System', PAD, 56, 280, 16,
    { size: 11, fill: P.fg3, weight: 400, ls: 0.1 }));
  ch.push(SpacedLabel('D E E P  W O R K', PAD, 74, 180, 10));

  // ── Central orbit clock
  const cx = W / 2;
  const cy = 280;
  const R  = 100;

  // Outer orbit ring (track)
  ch.push(E(cx - R - 12, cy - R - 12, (R + 12) * 2, (R + 12) * 2,
    'transparent', { stroke: P.border, sw: 1, strokeAlign: 'inside' }));

  // Progress arc — simulated with overlapping filled ellipses/wedge approach
  // Use a tinted ring for 62% elapsed
  ch.push(E(cx - R - 12, cy - R - 12, (R + 12) * 2, (R + 12) * 2,
    'transparent', { stroke: P.violetMid, sw: 3, strokeAlign: 'inside', opacity: 0.7 }));

  // Inner circles for depth layers
  ch.push(E(cx - R + 8, cy - R + 8, (R - 8) * 2, (R - 8) * 2,
    'transparent', { stroke: P.border, sw: 1 }));
  ch.push(E(cx - R + 22, cy - R + 22, (R - 22) * 2, (R - 22) * 2,
    'transparent', { stroke: P.goldLo, sw: 1 }));

  // Orbit dot position (progress indicator)
  const angle  = -Math.PI / 2 + 0.62 * 2 * Math.PI;
  const dotX   = Math.round(cx + (R + 12) * Math.cos(angle));
  const dotY   = Math.round(cy + (R + 12) * Math.sin(angle));
  ch.push(E(dotX - 8, dotY - 8, 16, 16, P.violet, {
    shadow: { x: 0, y: 0, blur: 10, spread: 2, fill: P.violetMid },
  }));

  // Time display — large editorial numerals
  ch.push(T('37:22', cx - 70, cy - 30, 140, 56,
    { size: 48, fill: P.fg, weight: 700, align: 'center', lh: 1.1, ls: -1 }));
  ch.push(T('remaining', cx - 50, cy + 26, 100, 14,
    { size: 9, fill: P.fg3, weight: 400, align: 'center', ls: 1.5 }));

  // Depth pulse
  ch.push(SpacedLabel('D E P T H', cx - 30, cy + 48, 60, 10, { align: 'center' }));
  ch.push(T('91%', cx - 28, cy + 62, 56, 20,
    { size: 16, fill: P.sage, weight: 700, align: 'center' }));

  // ── Session controls
  const btnY = 432;
  const btnW = 56;
  // Note button
  ch.push(F(PAD + 20, btnY, btnW, btnW, P.surface, {
    r: btnW / 2, stroke: P.border, sw: 1,
    ch: [T('✎', 0, 0, btnW, btnW,
      { size: 18, fill: P.fg3, align: 'center', lh: btnW / 18 })],
  }));
  // Pause button
  ch.push(F(W / 2 - 36, btnY, 72, 72, P.surface2, {
    r: 36, stroke: P.border2, sw: 1,
    shadow: cardShadow,
    ch: [T('⏸', 0, 0, 72, 72,
      { size: 22, fill: P.fg2, align: 'center', lh: 72 / 22 })],
  }));
  // End button
  ch.push(F(W - PAD - 20 - btnW, btnY, btnW, btnW, P.surface, {
    r: btnW / 2, stroke: P.border, sw: 1,
    ch: [T('□', 0, 0, btnW, btnW,
      { size: 18, fill: P.rose, align: 'center', lh: btnW / 18 })],
  }));

  // ── Session intent reminder
  ch.push(Card(PAD, 528, W - PAD * 2, 58, [
    SpacedLabel('I N T E N T I O N', 14, 10, 220, 10),
    T('"Ship the component tokens PR"', 14, 26, W - PAD * 2 - 28, 16,
      { size: 12, fill: P.fg, weight: 400, lh: 1.4 }),
  ]));

  // ── Floating note input
  ch.push(Card(PAD, 600, W - PAD * 2, 54, [
    SpacedLabel('Q U I C K  N O T E', 14, 10, 200, 10),
    T('Tokenized spacing: 4/8/16/24/32px scale', 14, 26, W - PAD * 2 - 44, 14,
      { size: 11, fill: P.fg2, weight: 400 }),
    T('+', W - PAD * 2 - 28, 16, 20, 20,
      { size: 16, fill: P.violet, weight: 400, align: 'center' }),
  ]));

  ch.push(bottomNav(2));
  return F(0, 0, W, H, P.bg, { ch });
}

// ────────────────────────────────────────────────────────────────────────────
// SCREEN D — HARVEST (session complete)
// ────────────────────────────────────────────────────────────────────────────
function screenHarvest() {
  const ch = [];

  ch.push(E(W / 2 - 130, -60, 260, 260, P.goldLo, { opacity: 0.4 }));
  ch.push(statusBar());

  // Celebration header
  ch.push(SpacedLabel('S E S S I O N  C O M P L E T E', PAD, 56, W - PAD * 2, 10,
    { align: 'center', size: 9 }));
  ch.push(T('✦', PAD, 76, W - PAD * 2, 36,
    { size: 30, fill: P.gold, align: 'center', weight: 700 }));
  ch.push(T('Deep work done.', PAD, 116, W - PAD * 2, 28,
    { size: 24, fill: P.fg, weight: 600, align: 'center', lh: 1.1 }));

  // ── Depth score card (hero)
  ch.push(Card(PAD, 158, W - PAD * 2, 100, [
    SpacedLabel('S E S S I O N  D E P T H', 0, 14, W - PAD * 2, 12,
      { align: 'center', size: 9 }),
    T('87', 0, 32, W - PAD * 2, 52,
      { size: 48, fill: P.gold, weight: 700, align: 'center', lh: 1.1 }),
    T('out of 100', 0, 80, W - PAD * 2, 14,
      { size: 9, fill: P.fg3, align: 'center', ls: 0.5 }),
  ], { shadow: glowGold }));

  // ── Stats row
  const stats = [
    { label: 'FOCUSED', value: '1h 00m' },
    { label: 'NOTES',   value: '4' },
    { label: 'FLOW',    value: 'Entered' },
  ];
  const sW = Math.floor((W - PAD * 2 - 2 * 10) / 3);
  stats.forEach((s, i) => {
    const x = PAD + i * (sW + 10);
    ch.push(Card(x, 272, sW, 58, [
      T(s.value, 0, 10, sW, 22,
        { size: 16, fill: i === 2 ? P.sage : P.fg, weight: 700, align: 'center' }),
      SpacedLabel(s.label, 0, 36, sW, 10, { align: 'center', size: 7 }),
    ]));
  });

  // ── Reflection prompt
  ch.push(Card(PAD, 344, W - PAD * 2, 78, [
    SpacedLabel('R E F L E C T I O N', 14, 10, 200, 10),
    T('What did you complete?', 14, 26, W - PAD * 2 - 28, 14,
      { size: 11, fill: P.fg3, weight: 400 }),
    T('✅  Shipped component tokens PR', 14, 44, W - PAD * 2 - 28, 18,
      { size: 12, fill: P.fg, weight: 500 }),
  ]));

  // ── Session notes recap
  ch.push(SpacedLabel('S E S S I O N  N O T E S', PAD, 436, W - PAD * 2, 10));
  const notes = [
    'Tokenized spacing: 4/8/16/24/32px scale',
    'Need to review dark surface hierarchy',
    'Export tokens as CSS vars + JSON',
    'Follow up with Tomas re: naming conv.',
  ];
  notes.forEach((n, i) => {
    const y = 452 + i * 34;
    ch.push(Card(PAD, y, W - PAD * 2, 28, [
      E(12, 7, 8, 8, P.violetMid),
      T(n, 28, 5, W - PAD * 2 - 44, 16,
        { size: 10, fill: P.fg2, weight: 400 }),
    ], { r: 8 }));
  });

  // ── CTAs
  ch.push(F(PAD, 600, W - PAD * 2, 52, P.gold, {
    r: 12, shadow: glowGold,
    ch: [T('Begin Next Session', 0, 0, W - PAD * 2, 52,
      { size: 14, fill: P.bg, weight: 700, align: 'center', lh: 52 / 14 })],
  }));
  ch.push(F(PAD, 662, W - PAD * 2, 48, 'transparent', {
    r: 12, stroke: P.border, sw: 1,
    ch: [T('Return to Sanctuary', 0, 0, W - PAD * 2, 48,
      { size: 13, fill: P.fg3, weight: 400, align: 'center', lh: 48 / 13 })],
  }));

  ch.push(bottomNav(3));
  return F(0, 0, W, H, P.bg, { ch });
}

// ────────────────────────────────────────────────────────────────────────────
// SCREEN E — CODEX (history & patterns)
// ────────────────────────────────────────────────────────────────────────────
function screenCodex() {
  const ch = [];

  ch.push(E(W - 80, -30, 200, 200, P.violetLo, { opacity: 0.4 }));
  ch.push(statusBar());

  ch.push(SpacedLabel('C O D E X', PAD, 56, 120, 12, { size: 9 }));
  ch.push(T('Your patterns.', PAD, 74, 260, 24,
    { size: 22, fill: P.fg, weight: 600, lh: 1.2 }));

  // ── Monthly heatmap
  ch.push(SpacedLabel('M A R C H  2 0 2 6', PAD, 110, W - PAD * 2, 10));

  const days30 = Array.from({ length: 31 }, (_, i) => ({
    depth: i < 23 ? [0.9, 0.7, 0.5, 1.0, 0.85, 0, 0, 0.88, 0.75, 0.65, 0.95, 1.0, 0, 0, 0.78, 0.82, 0.9, 0.6, 0.88, 0.5, 1.0, 0.85, 0.92][i] : 0,
  }));
  const cellS = 16;
  const gapS  = 4;
  const cols  = 7;
  days30.forEach((d, i) => {
    const col   = i % cols;
    const row   = Math.floor(i / cols);
    const x     = PAD + col * (cellS + gapS);
    const y     = 126 + row * (cellS + gapS);
    const alpha = d.depth;
    const clr   = alpha > 0.7 ? P.gold
                : alpha > 0.4 ? P.violetMid
                : alpha > 0   ? P.border2
                : P.border;
    ch.push(F(x, y, cellS, cellS, clr, { r: 3 }));
  });

  // legend
  ch.push(SpacedLabel('LESS', PAD + 7 * (cellS + gapS) + 4, 138, 28, 10,
    { size: 6, fill: P.fg3 }));
  ch.push(SpacedLabel('MORE', PAD + 7 * (cellS + gapS) + 58, 138, 30, 10,
    { size: 6, fill: P.fg3 }));
  ['#23243A', P.violetMid, P.goldLo, P.gold].forEach((clr, i) => {
    ch.push(F(PAD + 7 * (cellS + gapS) + 34 + i * (cellS + 2), 136, cellS, cellS, clr, { r: 3 }));
  });

  // ── Insights
  ch.push(SpacedLabel('I N S I G H T S', PAD, 228, 160, 10));
  const insights = [
    { icon: '◎', text: 'You focus deepest between 7–9 AM', clr: P.gold },
    { icon: '◈', text: 'Sessions over 90m drop depth by 18%', clr: P.violet },
    { icon: '✦', text: 'Monday is your highest-depth day', clr: P.sage },
  ];
  insights.forEach((ins, i) => {
    const y = 244 + i * 52;
    ch.push(Card(PAD, y, W - PAD * 2, 44, [
      E(12, 12, 20, 20, ins.clr + '30'),
      T(ins.icon, 12, 12, 20, 20,
        { size: 10, fill: ins.clr, align: 'center', weight: 700 }),
      T(ins.text, 42, 12, W - PAD * 2 - 62, 18,
        { size: 11, fill: P.fg2, weight: 400, lh: 1.4 }),
    ], { r: 10 }));
  });

  // ── Recent sessions
  ch.push(SpacedLabel('R E C E N T', PAD, 404, 160, 10));
  const hist = [
    { date: 'Today',     label: 'Design Sprint',      dur: '1h 00m', depth: 87 },
    { date: 'Today',     label: 'Morning Block',       dur: '1h 45m', depth: 94 },
    { date: 'Yesterday', label: 'Strategy Review',     dur: '45m',    depth: 78 },
    { date: 'Sat Mar 22',label: 'Deep Reading',        dur: '2h 10m', depth: 91 },
  ];
  hist.forEach((h, i) => {
    const y = 420 + i * 52;
    ch.push(Card(PAD, y, W - PAD * 2, 44, [
      T(h.label, 14, 8, W - PAD * 2 - 96, 14,
        { size: 11, fill: P.fg, weight: 500 }),
      T(h.date + '  ·  ' + h.dur, 14, 26, W - PAD * 2 - 96, 11,
        { size: 9, fill: P.fg3, ls: 0.2 }),
      T(String(h.depth) + '%', W - PAD * 2 - 68, 8, 60, 18,
        { size: 14, fill: h.depth >= 90 ? P.gold : P.violet, weight: 700, align: 'right' }),
      SpacedLabel('DEPTH', W - PAD * 2 - 68, 28, 60, 10,
        { size: 6, fill: P.fg3, align: 'right' }),
    ], { r: 10 }));
  });

  ch.push(bottomNav(4));
  return F(0, 0, W, H, P.bg, { ch });
}

// ────────────────────────────────────────────────────────────────────────────
// ASSEMBLE .PEN FILE
// ────────────────────────────────────────────────────────────────────────────
const SCREEN_GAP = 64;

const screens = [
  { name: 'Sanctuary',  fn: screenSanctuary },
  { name: 'Ritual',     fn: screenRitual    },
  { name: 'Chamber',    fn: screenChamber   },
  { name: 'Harvest',    fn: screenHarvest   },
  { name: 'Codex',      fn: screenCodex     },
];

const nodes = screens.map((s, i) => {
  const frame = s.fn();
  frame.x = i * (W + SCREEN_GAP);
  frame.y = 0;
  frame.name = s.name;
  return frame;
});

const pen = {
  version:  '2.8',
  name:     'SANCTUM — Deep Work Companion',
  metadata: {
    description: 'A dark, calm deep-work focus ritual app. 5 screens: Sanctuary · Ritual · Chamber · Harvest · Codex.',
    created:     new Date().toISOString(),
    theme:       'dark',
    palette:     { bg: P.bg, accent: P.gold, accent2: P.violet, fg: P.fg },
  },
  canvas: {
    width:  screens.length * (W + SCREEN_GAP) - SCREEN_GAP,
    height: H,
    fill:   '#050508',
  },
  nodes,
};

const OUT = path.join(__dirname, 'sanctum.pen');
fs.writeFileSync(OUT, JSON.stringify(pen, null, 2));
console.log(`✓ sanctum.pen written (${(fs.statSync(OUT).size / 1024).toFixed(1)} KB)`);
