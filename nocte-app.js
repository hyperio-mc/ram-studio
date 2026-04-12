'use strict';
// nocte-app.js
// NOCTE — Dark-mode AI journaling companion with memory threading
//
// Challenge: Design a minimal, editorial AI journaling app inspired by:
// 1. "Minimalism Life" (darkmodedesign.com) — extreme restraint, generous
//    whitespace, near-black bg with warm off-white text, zero decoration
// 2. Locomotive.ca (godly.website) — oversized bold editorial wordmarks,
//    tight tracking, full typographic hierarchy as the only visual language
// 3. "Amie" calendar app (godly.website) — temporal organisation, soft
//    pastel-ish accents on dark, warm productive feeling
// 4. Awwwards SOTD "Darknode" by Qream (awwwards.com, Mar 21 2026) — node
//    graph aesthetic on deep dark backgrounds, subtle radial glows
//
// Trend: "Warm dark mode" — moving away from cold #000/blue-tinted dark
// toward organic near-blacks (#0C0B09) with warm off-whites (#F0EDE8) and
// sand/amber accents. Feels human, not machine.
//
// Palette: organic near-black + warm off-white + amber + clay/rust
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#0C0B09',   // organic near-black (warm dark, not cold)
  surface:  '#141210',   // lifted surface
  surface2: '#1C1A17',   // card surface
  surface3: '#242018',   // lighter card
  border:   '#2A261F',   // subtle warm border
  border2:  '#3A3528',   // visible border
  muted:    '#5C5445',   // warm muted text
  muted2:   '#8C7E6E',   // lighter warm muted
  fg:       '#F0EDE8',   // warm off-white (organic, human)
  fg2:      '#C8C0B4',   // secondary warm text
  accent:   '#D4A853',   // amber/sand (primary — warm, editorial)
  accent2:  '#C4776A',   // clay/rust (emotion — secondary)
  green:    '#7BAE7F',   // muted sage (success)
  violet:   '#8B7BA8',   // muted purple (AI/memory)
  dim:      '#0F0E0C',   // darkened surface for overlays
};

let _id = 0;
const uid = () => `nc${++_id}`;

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

// ── Ambient glow (warm) ───────────────────────────────────────────────────────
const Glow = (cx, cy, r, color) => [
  E(cx - r * 2.2, cy - r * 2.2, r * 4.4, r * 4.4, color + '04'),
  E(cx - r * 1.5, cy - r * 1.5, r * 3.0, r * 3.0, color + '09'),
  E(cx - r,       cy - r,       r * 2,   r * 2,   color + '12'),
  E(cx - r * 0.5, cy - r * 0.5, r,       r,       color + '1A'),
];

// ── Pill badge ────────────────────────────────────────────────────────────────
const Pill = (x, y, label, color, dark = false) => {
  const w = Math.max(label.length * 6.2 + 20, 38);
  return F(x, y, w, 20, dark ? color + '18' : color + '25', {
    r: 10,
    ch: [T(label, 0, 4, w, 12, { size: 9, fill: color, weight: 700, ls: 0.6, align: 'center' })],
  });
};

// ── Status bar ────────────────────────────────────────────────────────────────
const StatusBar = () => [
  T('9:41', 20, 14, 60, 16, { size: 12, weight: 600, fill: P.fg }),
  T('●●●', 320, 15, 50, 14, { size: 7, fill: P.muted }),
];

// ── Entry card ────────────────────────────────────────────────────────────────
const EntryCard = (x, y, date, preview, mood, moodColor, hasAI = false) => {
  const w = 350;
  const ch = [
    T(date.toUpperCase(), 14, 14, 200, 10, { size: 8, fill: P.muted, ls: 1.5, weight: 600 }),
    T(preview, 14, 30, w - 80, 36, { size: 13, fill: P.fg2, lh: 1.55, weight: 400 }),
    Pill(14, 72, mood, moodColor),
  ];
  if (hasAI) {
    ch.push(F(w - 36, 14, 22, 14, P.violet + '22', { r: 7, ch: [T('AI', 0, 3, 22, 8, { size: 7, fill: P.violet, weight: 700, align: 'center', ls: 0.5 })] }));
  }
  return F(x, y, w, 100, P.surface, { r: 14, stroke: P.border, sw: 1, ch });
};

// ── Node dot (Darknode-inspired) ──────────────────────────────────────────────
const NodeDot = (x, y, r, color, hasPulse = false) => {
  const ch = [
    ...(hasPulse ? [E(x - r * 2, y - r * 2, r * 4, r * 4, color + '15')] : []),
    E(x - r * 1.4, y - r * 1.4, r * 2.8, r * 2.8, color + '28'),
    E(x - r, y - r, r * 2, r * 2, color),
  ];
  return ch;
};

// ── Connection line between nodes ─────────────────────────────────────────────
const ConnLine = (x1, y1, x2, y2, color = P.border2) => {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  // Approximate as a thin rotated frame
  return {
    id: uid(), type: 'frame', x: x1, y: y1 - 1,
    width: len, height: 2, fill: color + '60',
    clip: false,
    children: [],
    // We can't do rotation in pen format easily, so use horizontal bars approximation
  };
};

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Today (minimal journal entry)
// ══════════════════════════════════════════════════════════════════════════════
function screenToday(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    // Warm amber glow top-right (minimalism life — single accent, nothing more)
    ...Glow(340, 60, 70, P.accent),

    ...StatusBar(),

    // Editorial wordmark (Locomotive style: massive, tracked)
    T('NOCTE', 20, 44, 300, 44, { size: 38, weight: 900, ls: 8, fill: P.fg }),
    T('JOURNAL', 20, 92, 200, 14, { size: 10, fill: P.muted, ls: 3, weight: 400 }),

    // Date — large, editorial
    Line(20, 118, 350, P.border2),
    T('FRIDAY', 20, 128, 120, 12, { size: 9, fill: P.muted, ls: 2, weight: 700 }),
    T('21', 238, 120, 80, 28, { size: 28, fill: P.accent, weight: 900, ls: -1, align: 'right' }),
    T('MARCH · 2026', 20, 144, 220, 12, { size: 9, fill: P.muted2, ls: 1.5, weight: 400 }),
    Line(20, 160, 350, P.border),

    // Entry body — the main content, lots of breathing room
    T('Today felt like the kind of morning that\nasks you to slow down. Coffee cold before\nI even touched it.', 20, 178, 350, 72, { size: 15, fill: P.fg, lh: 1.72, weight: 300 }),

    // Blinking cursor simulation
    F(20, 256, 2, 20, P.accent, { r: 1 }),

    // Word count / writing stats bar
    F(20, 284, 350, 32, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      T('48 words', 14, 9, 90, 14, { size: 10, fill: P.muted2, weight: 500 }),
      T('3 min read', 110, 9, 90, 14, { size: 10, fill: P.muted, weight: 400 }),
      F(310, 9, 28, 14, P.accent + '22', { r: 7, ch: [T('↑', 0, 2, 28, 10, { size: 9, fill: P.accent, align: 'center' })] }),
    ]}),

    // Mood tags
    T('HOW DO YOU FEEL', 20, 330, 200, 10, { size: 8, fill: P.muted, ls: 2, weight: 700 }),
    ...([
      ['Reflective', P.violet],
      ['Calm', P.green],
      ['Tired', P.muted2],
      ['Curious', P.accent],
    ].map(([label, color], i) => Pill(20 + i * 84, 346, label, color))),

    // AI Insight card
    F(20, 382, 350, 90, P.surface2, { r: 14, stroke: P.violet + '40', sw: 1, ch: [
      F(14, 14, 22, 14, P.violet + '22', { r: 7, ch: [T('AI', 0, 3, 22, 8, { size: 7, fill: P.violet, weight: 700, align: 'center', ls: 0.5 })] }),
      T('MEMORY THREAD', 44, 16, 200, 10, { size: 8, fill: P.violet, ls: 1.5, weight: 700 }),
      T('"You wrote about mornings feeling slow\non Nov 14. Something shifted then too."', 14, 34, 322, 40, { size: 12, fill: P.fg2, lh: 1.6, weight: 400 }),
      T('→ Open thread', 14, 70, 120, 12, { size: 10, fill: P.violet, weight: 600 }),
    ]}),

    // Recent entries (compact)
    T('RECENT', 20, 490, 100, 10, { size: 8, fill: P.muted, ls: 2, weight: 700 }),
    EntryCard(20, 508, 'Thursday, Mar 20', 'Spent the afternoon untangling something I wrote six months ago...', 'Productive', P.green, true),
    EntryCard(20, 618, 'Wednesday, Mar 19', 'The meeting left me with more questions than I started with...', 'Restless', P.accent2, false),

    // Bottom action bar
    F(0, 780, 390, 64, P.surface, { ch: [
      Line(0, 0, 390, P.border),
      // Nav icons (symbolic text chars)
      ...([['◎', 'Today', 0, true], ['⊞', 'Memory', 1, false], ['○', 'Threads', 2, false], ['◫', 'Insights', 3, false]]).map(([ic, lb, j, active]) => {
        const nx = 10 + j * 93;
        return [
          active ? F(nx + 18, 4, 56, 44, P.accent + '15', { r: 22 }) : null,
          T(ic, nx + 22, 8, 48, 24, { size: 20, fill: active ? P.accent : P.muted, align: 'center' }),
          T(lb, nx + 4, 36, 84, 12, { size: 8, fill: active ? P.accent : P.muted, align: 'center', weight: active ? 700 : 400, ls: 0.2 }),
        ].filter(Boolean);
      }).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Memory Web (node graph, Darknode-inspired)
// ══════════════════════════════════════════════════════════════════════════════
function screenMemoryWeb(ox) {
  // Centre node (today) with radiating past-entry nodes
  const cx = 195, cy = 370;
  const nodes = [
    { x: cx,       y: cy,       label: 'TODAY',      date: 'Mar 21', color: P.accent,  r: 28, main: true },
    { x: cx - 120, y: cy - 90,  label: 'Nov 14',     date: 'Mornings', color: P.violet, r: 18 },
    { x: cx + 130, y: cy - 70,  label: 'Jan 06',     date: 'Coffee',  color: P.violet, r: 14 },
    { x: cx - 140, y: cy + 80,  label: 'Sep 30',     date: 'Slowing', color: P.accent2, r: 16 },
    { x: cx + 110, y: cy + 100, label: 'Aug 12',     date: 'Quiet',   color: P.green,   r: 14 },
    { x: cx,       y: cy - 160, label: 'Feb 28',     date: 'Reset',   color: P.muted2,  r: 12 },
    { x: cx - 60,  y: cy + 160, label: 'Jul 03',     date: 'Tired',   color: P.accent2, r: 10 },
    { x: cx + 60,  y: cy + 170, label: 'Oct 21',     date: 'Curious', color: P.violet,  r: 10 },
  ];

  // Connection lines as thin horizontal approximations between nodes
  const lines = nodes.slice(1).map(n => {
    const dx = n.x - cx, dy = n.y - cy;
    return F(
      Math.min(cx, n.x), Math.min(cy, n.y) - 1,
      Math.abs(dx) || 2, Math.abs(dy) || 2,
      P.border2 + '80',
    );
  });

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    // Warm glow at centre
    ...Glow(cx, cy, 100, P.accent),
    ...Glow(cx - 120, cy - 90, 50, P.violet),

    ...StatusBar(),

    T('MEMORY', 20, 44, 240, 26, { size: 22, weight: 900, ls: 5, fill: P.fg }),
    T('WEB', 20, 70, 140, 22, { size: 22, weight: 900, ls: 5, fill: P.accent }),
    T('87 entries · 14 threads', 20, 96, 220, 14, { size: 11, fill: P.muted2 }),

    // Connection lines (simplified as rectangular paths)
    ...nodes.slice(1).flatMap(n => {
      const x1 = cx, y1 = cy, x2 = n.x, y2 = n.y;
      // Draw a thin dashed line approximation
      const steps = 5;
      const segments = [];
      for (let s = 0; s < steps; s++) {
        const t0 = s / steps, t1 = (s + 0.6) / steps;
        const px = x1 + (x2 - x1) * ((t0 + t1) / 2);
        const py = y1 + (y2 - y1) * ((t0 + t1) / 2);
        const len = Math.sqrt((x2-x1)**2 + (y2-y1)**2) / steps * 0.6;
        segments.push(E(px - 2, py - 2, 4, 4, n.color + '40'));
      }
      return segments;
    }),

    // Nodes
    ...nodes.flatMap(n => {
      const ch = [
        ...NodeDot(n.x, n.y, n.r, n.color, n.main),
        T(n.label, n.x - 40, n.y + n.r + 6, 80, 12, { size: n.main ? 9 : 8, fill: n.color, weight: 700, align: 'center', ls: 0.5 }),
        T(n.date, n.x - 40, n.y + n.r + 18, 80, 12, { size: 8, fill: P.muted, align: 'center' }),
      ];
      return ch;
    }),

    // Insight panel at bottom
    F(20, 660, 350, 100, P.surface, { r: 16, stroke: P.accent + '30', sw: 1, ch: [
      T('STRONGEST CONNECTION', 14, 14, 280, 10, { size: 8, fill: P.accent, ls: 1.5, weight: 700 }),
      T('Nov 14, 2025', 14, 30, 200, 14, { size: 13, fill: P.fg, weight: 700 }),
      T('"Both entries share themes of deliberate\nslowing and morning rituals."', 14, 48, 322, 32, { size: 11, fill: P.muted2, lh: 1.55 }),
      Pill(14, 80, '94% similar', P.accent),
    ]}),

    // Bottom nav
    F(0, 780, 390, 64, P.surface, { ch: [
      Line(0, 0, 390, P.border),
      ...([['◎', 'Today', 0, false], ['⊞', 'Memory', 1, true], ['○', 'Threads', 2, false], ['◫', 'Insights', 3, false]]).map(([ic, lb, j, active]) => {
        const nx = 10 + j * 93;
        return [
          active ? F(nx + 18, 4, 56, 44, P.accent + '15', { r: 22 }) : null,
          T(ic, nx + 22, 8, 48, 24, { size: 20, fill: active ? P.accent : P.muted, align: 'center' }),
          T(lb, nx + 4, 36, 84, 12, { size: 8, fill: active ? P.accent : P.muted, align: 'center', weight: active ? 700 : 400, ls: 0.2 }),
        ].filter(Boolean);
      }).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Thread (conversation with past self)
// ══════════════════════════════════════════════════════════════════════════════
function screenThread(ox) {
  const msgs = [
    { from: 'past', date: 'Nov 14, 2025', text: 'The morning feels borrowed somehow.\nLike I woke inside someone else\'s\nschedule and forgot to leave.', mood: 'Reflective', color: P.violet },
    { from: 'ai',   date: '',              text: 'You\'ve written about "borrowed mornings"\n3 times this year. The feeling always\nprecedes a creative shift.' },
    { from: 'past', date: 'Jan 6, 2026',  text: 'Coffee cold again. The cup is a monument\nto all the things I mean to do.', mood: 'Tired', color: P.accent2 },
    { from: 'today', date: 'Mar 21, 2026', text: 'Today felt like the kind of morning\nthat asks you to slow down.\nCoffee cold before I even touched it.', mood: 'Calm', color: P.green },
  ];

  let y = 140;
  const msgNodes = msgs.flatMap(msg => {
    const isToday = msg.from === 'today';
    const isAI = msg.from === 'ai';
    const bx = isToday ? 40 : 20;
    const bw = 310;
    const bg = isToday ? P.accent + '18' : isAI ? P.violet + '14' : P.surface2;
    const border = isToday ? P.accent + '40' : isAI ? P.violet + '35' : P.border;
    const textColor = isToday ? P.fg : isAI ? P.fg2 : P.fg2;
    const lineH = msg.text.split('\n').length * 18 + (msg.date ? 34 : 20) + (msg.mood ? 28 : 0);

    const ch = [];
    if (msg.date) {
      ch.push(T(msg.date.toUpperCase(), 14, 12, bw - 28, 10, { size: 8, fill: isToday ? P.accent : P.muted, ls: 1.2, weight: 700 }));
    }
    ch.push(T(msg.text, 14, msg.date ? 28 : 12, bw - 28, msg.text.split('\n').length * 18, { size: 12, fill: textColor, lh: 1.6 }));
    if (msg.mood) {
      ch.push(Pill(14, lineH - 22, msg.mood, msg.color));
    }

    const card = F(bx, y, bw, lineH, bg, { r: 12, stroke: border, sw: 1, ch });
    y += lineH + 12;
    return [card];
  });

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(195, 400, 80, P.violet),

    ...StatusBar(),

    // Header
    T('← MEMORY THREAD', 20, 50, 240, 12, { size: 10, fill: P.muted, ls: 1, weight: 600 }),
    T('Mornings', 20, 68, 280, 28, { size: 24, weight: 900, ls: -0.5, fill: P.fg }),
    T('4 entries · 5 months', 20, 100, 220, 14, { size: 11, fill: P.muted2 }),
    Line(20, 120, 350, P.border2),

    ...msgNodes,

    // Reply hint
    F(20, y + 8, 350, 44, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
      T('Continue this thread...', 14, 14, 280, 16, { size: 13, fill: P.muted, weight: 300 }),
      F(318, 12, 20, 20, P.accent + '22', { r: 10, ch: [T('↑', 0, 5, 20, 10, { size: 10, fill: P.accent, align: 'center' })] }),
    ]}),

    // Bottom nav
    F(0, 780, 390, 64, P.surface, { ch: [
      Line(0, 0, 390, P.border),
      ...([['◎', 'Today', 0, false], ['⊞', 'Memory', 1, false], ['○', 'Threads', 2, true], ['◫', 'Insights', 3, false]]).map(([ic, lb, j, active]) => {
        const nx = 10 + j * 93;
        return [
          active ? F(nx + 18, 4, 56, 44, P.accent + '15', { r: 22 }) : null,
          T(ic, nx + 22, 8, 48, 24, { size: 20, fill: active ? P.accent : P.muted, align: 'center' }),
          T(lb, nx + 4, 36, 84, 12, { size: 8, fill: active ? P.accent : P.muted, align: 'center', weight: active ? 700 : 400, ls: 0.2 }),
        ].filter(Boolean);
      }).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Insights (patterns, emotional rhythm)
// ══════════════════════════════════════════════════════════════════════════════
function screenInsights(ox) {
  // Weekly writing streak bar chart
  const weekData = [
    { day: 'M', words: 280, mood: P.green },
    { day: 'T', words: 0,   mood: P.border2 },
    { day: 'W', words: 150, mood: P.accent2 },
    { day: 'T', words: 420, mood: P.accent },
    { day: 'F', words: 48,  mood: P.violet },
    { day: 'S', words: 0,   mood: P.border2 },
    { day: 'S', words: 0,   mood: P.border2 },
  ];
  const maxW = 420;
  const barH = 100;

  const bars = weekData.map((d, i) => {
    const bx = 20 + i * 50;
    const bh = d.words ? Math.max(Math.round((d.words / maxW) * barH), 4) : 4;
    const isToday = i === 4;
    return [
      F(bx, 260 + (barH - bh), 40, bh, isToday ? d.mood : d.mood + (d.words ? '99' : '44'), { r: 6 }),
      T(d.day, bx, 366, 40, 12, { size: 9, fill: isToday ? P.accent : P.muted, weight: isToday ? 700 : 400, align: 'center' }),
      d.words ? T(d.words.toString(), bx, 248, 40, 12, { size: 8, fill: P.muted2, align: 'center' }) : null,
    ].filter(Boolean);
  });

  // Mood distribution rings (simplified as colored arcs using layered ellipses)
  const moods = [
    { label: 'Reflective', pct: 38, color: P.violet },
    { label: 'Calm',       pct: 24, color: P.green },
    { label: 'Curious',    pct: 22, color: P.accent },
    { label: 'Tired',      pct: 16, color: P.accent2 },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(195, 200, 80, P.accent),

    ...StatusBar(),

    T('INSIGHTS', 20, 44, 300, 28, { size: 24, weight: 900, ls: 5, fill: P.fg }),
    T('Last 30 days', 20, 76, 180, 14, { size: 11, fill: P.muted2 }),

    // Key stats row
    ...[
      ['87', 'Entries'],
      ['23.4k', 'Words'],
      ['34', 'Streak'],
    ].map(([val, label], i) =>
      F(20 + i * 118, 104, 108, 60, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
        T(val, 0, 10, 108, 28, { size: 24, fill: P.accent, weight: 900, align: 'center', ls: -1 }),
        T(label.toUpperCase(), 0, 40, 108, 12, { size: 8, fill: P.muted, align: 'center', ls: 1.5 }),
      ]})
    ),

    // Writing rhythm chart
    T('WRITING RHYTHM', 20, 180, 200, 10, { size: 8, fill: P.muted, ls: 2, weight: 700 }),
    T('This week', 20, 194, 120, 12, { size: 10, fill: P.muted2 }),
    F(20, 246, 350, 144, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
      // Bars inside the container
      ...bars.flat().map(b => ({ ...b, x: (b.x || 0) - 20, y: (b.y || 0) - 246 })),
    ]}),

    // Mood breakdown
    T('EMOTIONAL RHYTHM', 20, 408, 200, 10, { size: 8, fill: P.muted, ls: 2, weight: 700 }),
    ...moods.map((m, i) =>
      F(20, 426 + i * 50, 350, 42, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
        // Color bar
        F(14, 13, Math.round(m.pct / 100 * 280), 16, m.color + '44', { r: 6 }),
        F(14, 13, Math.round(m.pct / 100 * 280), 16, m.color + '00', { r: 6 }),  // overlay
        // Label + pct
        T(m.label, 14, 14, 160, 14, { size: 12, fill: P.fg2, weight: 500 }),
        T(m.pct + '%', 316, 14, 30, 14, { size: 12, fill: m.color, weight: 700, align: 'right' }),
      ]})
    ),

    // Insight card
    F(20, 636, 350, 76, P.surface2, { r: 14, stroke: P.accent + '30', sw: 1, ch: [
      F(14, 14, 22, 14, P.accent + '22', { r: 7, ch: [T('AI', 0, 3, 22, 8, { size: 7, fill: P.accent, weight: 700, align: 'center', ls: 0.5 })] }),
      T('PATTERN DETECTED', 44, 16, 220, 10, { size: 8, fill: P.accent, ls: 1.5, weight: 700 }),
      T('You write 3× more on Thursdays. Your longest\nentries correlate with reflective moods.', 14, 34, 322, 32, { size: 11, fill: P.muted2, lh: 1.55 }),
    ]}),

    // Bottom nav
    F(0, 780, 390, 64, P.surface, { ch: [
      Line(0, 0, 390, P.border),
      ...([['◎', 'Today', 0, false], ['⊞', 'Memory', 1, false], ['○', 'Threads', 2, false], ['◫', 'Insights', 3, true]]).map(([ic, lb, j, active]) => {
        const nx = 10 + j * 93;
        return [
          active ? F(nx + 18, 4, 56, 44, P.accent + '15', { r: 22 }) : null,
          T(ic, nx + 22, 8, 48, 24, { size: 20, fill: active ? P.accent : P.muted, align: 'center' }),
          T(lb, nx + 4, 36, 84, 12, { size: 8, fill: active ? P.accent : P.muted, align: 'center', weight: active ? 700 : 400, ls: 0.2 }),
        ].filter(Boolean);
      }).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Entry editor (distraction-free, minimal)
// ══════════════════════════════════════════════════════════════════════════════
function screenEditor(ox) {
  const bodyLines = [
    'The morning comes in parts.',
    '',
    'First: the sound of birds (or maybe traffic,',
    'it\'s hard to tell anymore). Then the light,',
    'thin and cautious through the blinds.',
    '',
    'I\'ve been meaning to fix those blinds for',
    'three months. There\'s a list somewhere.',
    'There are several lists.',
    '',
    'But right now: coffee, and this.',
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    // Very subtle warm glow — barely there (minimalism life)
    ...Glow(195, 300, 120, P.accent).map(g => ({ ...g, opacity: (g.opacity || 1) * 0.5 })),

    // Minimal top bar
    T('◀', 20, 20, 30, 20, { size: 16, fill: P.muted }),
    T('EDITING', 170, 22, 100, 14, { size: 9, fill: P.muted, ls: 2, weight: 600, align: 'center' }),
    T('Save', 342, 20, 40, 20, { size: 13, fill: P.accent, weight: 600 }),
    Line(0, 48, 390, P.border),

    // Date header — very minimal
    T('FRIDAY, MARCH 21', 24, 64, 280, 12, { size: 9, fill: P.muted, ls: 2, weight: 600 }),

    // Title field (unfocused, placeholder)
    T('Untitled', 24, 84, 340, 32, { size: 28, fill: P.muted + '80', weight: 700, ls: -0.5 }),
    Line(24, 118, 342, P.border),

    // Body text — generous leading, warm
    ...bodyLines.map((line, i) =>
      T(line || ' ', 24, 132 + i * 22, 342, 20, {
        size: 15,
        fill: line ? P.fg2 : P.bg,
        weight: 300,
        lh: 1.6,
      })
    ),

    // Cursor after last line
    F(24, 132 + bodyLines.length * 22, 2, 18, P.accent, { r: 1 }),

    // Floating toolbar (bottom, minimal)
    F(40, 730, 310, 44, P.surface2, { r: 22, stroke: P.border2, sw: 1, ch: [
      T('B', 22, 12, 20, 20, { size: 14, fill: P.muted2, weight: 700, align: 'center' }),
      T('I', 50, 12, 20, 20, { size: 14, fill: P.muted2, weight: 400, align: 'center' }),
      T('/', 74, 14, 20, 16, { size: 10, fill: P.border2 }),
      T('#', 92, 12, 20, 20, { size: 14, fill: P.muted2, align: 'center' }),
      T('@', 118, 12, 20, 20, { size: 14, fill: P.muted2, align: 'center' }),
      T('/', 138, 14, 20, 16, { size: 10, fill: P.border2 }),
      // AI suggest button
      F(158, 8, 80, 28, P.violet + '20', { r: 14, stroke: P.violet + '40', sw: 1, ch: [
        T('◈ AI Tag', 0, 8, 80, 12, { size: 10, fill: P.violet, weight: 600, align: 'center' }),
      ]}),
      T('/', 242, 14, 20, 16, { size: 10, fill: P.border2 }),
      T('⌃', 260, 12, 20, 20, { size: 16, fill: P.muted2, align: 'center' }),
      T('⌘', 284, 12, 20, 20, { size: 14, fill: P.muted2, align: 'center' }),
    ]}),

    // Tag suggestions (AI generated)
    F(20, 680, 350, 40, P.surface, { r: 10, stroke: P.violet + '30', sw: 1, ch: [
      T('AI TAGS', 14, 12, 60, 10, { size: 8, fill: P.violet, ls: 1.5, weight: 700 }),
      Pill(72, 12, 'Morning ritual', P.accent),
      Pill(170, 12, 'Procrastination', P.muted2),
      Pill(288, 12, '+ more', P.muted2),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// ASSEMBLE & SAVE
// ══════════════════════════════════════════════════════════════════════════════
const SCREEN_W = 390;
const GAP      = 80;

const doc = {
  version: '2.8',
  name: 'NOCTE — AI Journaling Companion',
  width:  5 * SCREEN_W + 6 * GAP,
  height: 844,
  fill:   P.bg,
  children: [
    screenToday     (GAP),
    screenMemoryWeb (GAP + (SCREEN_W + GAP)),
    screenThread    (GAP + (SCREEN_W + GAP) * 2),
    screenInsights  (GAP + (SCREEN_W + GAP) * 3),
    screenEditor    (GAP + (SCREEN_W + GAP) * 4),
  ],
};

const outPath = path.join(__dirname, 'nocte.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log('✓ nocte.pen written —', Math.round(fs.statSync(outPath).size / 1024) + 'KB');
console.log('  5 screens: Today · Memory Web · Thread · Insights · Editor');
console.log('  Palette: organic #0C0B09 · amber #D4A853 · clay #C4776A · violet #8B7BA8');
