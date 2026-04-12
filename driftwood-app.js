'use strict';
// driftwood-app.js
// DRIFTWOOD — Slow Living Journal & Reflection App
//
// Challenge: Design a warm organic dark-mode journaling app inspired by:
// 1. "with.radiance" (awwwards.com nominees, March 2026) — natural materials,
//    bioluminescent glow, earthy textures pushing into digital interfaces
// 2. "Minimalism Life" (darkmodedesign.com, March 2026) — slow-living dark UI
//    with generous whitespace, serif typography, zero visual noise
// 3. "Kyn & Folk" handcrafted ceramic + "Zia Tile" artisanal craft aesthetic
//    (land-book.com) — translating artisan warmth into digital UI
//
// The synthesis: a journaling app that feels like a warm candlelit notebook.
// Deep forest bg, warm cream text, aged amber accent, organic rounded forms.
// 5 screens: Today / Write / Timeline / Insights / Profile
//
// Palette: organic dark with warm amber glow
//   bg:      #0E1209  (deep forest night)
//   surface: #161C10  (moss surface)
//   amber:   #C4843A  (aged amber — candlelight)
//   sage:    #4A7C59  (sage accent)
//   cream:   #F0E6C8  (aged parchment text)

const fs   = require('fs');
const path = require('path');

const P = {
  bg:       '#0E1209',
  surface:  '#161C10',
  surface2: '#1D2416',
  surface3: '#242D1B',
  border:   '#1F2919',
  border2:  '#2D3822',
  muted:    '#4A5840',
  muted2:   '#7A8A68',
  cream:    '#F0E6C8',
  cream2:   '#C8BCA0',
  amber:    '#C4843A',
  amberLo:  '#C4843A20',
  amberHi:  '#DFA060',
  sage:     '#4A7C59',
  sageLo:   '#4A7C5920',
  sageHi:   '#6FAF82',
  rust:     '#8B4A2F',
  rustLo:   '#8B4A2F20',
};

let _id = 0;
const uid = () => `dw${++_id}`;

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
  fontSize:   opts.size   || 13,
  fontWeight: String(opts.weight || 400),
  fill:       opts.fill   || P.cream,
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

// Warm glow halo behind a value
const Glow = (cx, cy, r, color, op = 0.18) =>
  E(cx - r, cy - r, r * 2, r * 2, color, { opacity: op });

// ── Screen: TODAY ─────────────────────────────────────────────────────────────
function makeToday(X, Y) {
  const W = 390, H = 844;
  const ch = [];

  // Warm ambient glow top-right
  ch.push(Glow(X + 310, Y + 80, 90, P.amber, 0.12));
  // Second glow bottom-left
  ch.push(Glow(X + 60, Y + 640, 70, P.sage, 0.10));

  // Status bar
  ch.push(T('9:41', X + 20, Y + 16, 60, 18, { size: 12, weight: 600, fill: P.cream2 }));
  ch.push(T('⬤ ⬤ ⬤', X + 300, Y + 16, 70, 18, { size: 10, fill: P.muted2, align: 'right' }));

  // Header
  ch.push(T('DRIFTWOOD', X + 20, Y + 52, 200, 22, { size: 10, weight: 700, fill: P.amber, ls: 2.5 }));
  ch.push(E(X + 350, Y + 50, 30, 30, P.surface2, { stroke: P.border2 }));
  ch.push(T('⊕', X + 358, Y + 57, 14, 14, { size: 13, fill: P.amber }));

  // Date hero
  ch.push(T('Sunday', X + 20, Y + 98, 300, 44, { size: 38, weight: 300, fill: P.cream, lh: 1.1 }));
  ch.push(T('March 22, 2026', X + 20, Y + 144, 250, 20, { size: 13, fill: P.muted2, ls: 0.3 }));

  // Streak badge
  ch.push(F(X + 260, Y + 100, 110, 36, P.amberLo, { r: 18, stroke: P.amber, sw: 1 }));
  ch.push(T('🔥 47 day streak', X + 272, Y + 110, 90, 16, { size: 11, weight: 600, fill: P.amberHi }));

  // Today's entry card — "tap to write"
  ch.push(F(X + 20, Y + 182, 350, 110, P.surface2, { r: 14, stroke: P.border2 }));
  // Amber left accent bar
  ch.push(F(X + 20, Y + 182, 3, 110, P.amber, { r: 14 }));
  ch.push(T("Today's entry", X + 36, Y + 198, 200, 16, { size: 11, weight: 600, fill: P.amber, ls: 0.5 }));
  ch.push(T("Start writing... the morning light\nfilters through the blinds, soft and\nunassuming.", X + 36, Y + 220, 310, 56, { size: 13, fill: P.cream2, lh: 1.6 }));
  ch.push(T('274 words · 12 min read', X + 36, Y + 278, 200, 14, { size: 10, fill: P.muted2, ls: 0.3 }));

  // Section: Recent entries
  ch.push(T('RECENT', X + 20, Y + 314, 120, 16, { size: 10, weight: 700, fill: P.muted, ls: 2 }));
  ch.push(T('See all', X + 320, Y + 314, 50, 16, { size: 11, fill: P.amberHi, align: 'right' }));

  const entries = [
    { date: 'Saturday · Mar 21', preview: 'Walked to the market. The peaches were perfectly ripe...', mood: '🌤', words: '412' },
    { date: 'Friday · Mar 20', preview: 'A difficult conversation I had been avoiding for weeks...', mood: '🌧', words: '681' },
    { date: 'Thursday · Mar 19', preview: 'Cooked soup from scratch. Something slow and grounding.', mood: '🌿', words: '203' },
  ];

  entries.forEach((e, i) => {
    const ey = Y + 342 + i * 88;
    ch.push(F(X + 20, ey, 350, 80, P.surface, { r: 10, stroke: P.border }));
    ch.push(T(e.date, X + 36, ey + 12, 220, 14, { size: 10, weight: 600, fill: P.muted2, ls: 0.3 }));
    ch.push(T(e.preview, X + 36, ey + 30, 280, 34, { size: 12, fill: P.cream2, lh: 1.5 }));
    ch.push(T(e.words + ' words', X + 36, ey + 62, 100, 12, { size: 10, fill: P.muted, ls: 0.2 }));
    ch.push(T(e.mood, X + 316, ey + 28, 30, 24, { size: 18, align: 'center' }));
  });

  // Nav bar
  const navY = Y + H - 80;
  ch.push(F(X, navY, W, 80, P.surface, { stroke: P.border }));
  const navItems = [
    { icon: '◎', label: 'Today',     active: true },
    { icon: '≡', label: 'Timeline',  active: false },
    { icon: '✦', label: 'Write',     active: false },
    { icon: '◈', label: 'Insights',  active: false },
    { icon: '○', label: 'Profile',   active: false },
  ];
  navItems.forEach((n, i) => {
    const nx = X + 16 + i * 72;
    ch.push(T(n.icon, nx, navY + 14, 52, 20, { size: 18, align: 'center', fill: n.active ? P.amber : P.muted }));
    ch.push(T(n.label, nx, navY + 38, 52, 14, { size: 9, align: 'center', weight: n.active ? 700 : 400, fill: n.active ? P.amber : P.muted2 }));
  });

  return F(X, Y, W, H, P.bg, { clip: true, ch });
}

// ── Screen: WRITE ─────────────────────────────────────────────────────────────
function makeWrite(X, Y) {
  const W = 390, H = 844;
  const ch = [];

  // Deep warm glow — writing ambience
  ch.push(Glow(X + 200, Y + 200, 140, P.amber, 0.08));

  // Status bar
  ch.push(T('9:41', X + 20, Y + 16, 60, 18, { size: 12, weight: 600, fill: P.cream2 }));

  // Header
  ch.push(T('← Back', X + 20, Y + 54, 70, 20, { size: 12, fill: P.amberHi }));
  ch.push(T('Sunday, Mar 22', X + 100, Y + 54, 190, 20, { size: 12, fill: P.cream2, align: 'center' }));
  ch.push(T('Save', X + 330, Y + 54, 40, 20, { size: 12, weight: 600, fill: P.amber, align: 'right' }));
  ch.push(Line(X, Y + 80, W, P.border));

  // Mood selector bar
  ch.push(F(X + 20, Y + 96, 350, 48, P.surface2, { r: 12, stroke: P.border2 }));
  ch.push(T('Mood:', X + 36, Y + 108, 44, 24, { size: 12, fill: P.muted2 }));
  const moods = ['😌', '🌤', '🌧', '⚡', '🌿'];
  moods.forEach((m, i) => {
    const isActive = i === 0;
    if (isActive) {
      ch.push(F(X + 86 + i * 46, Y + 102, 36, 36, P.amberLo, { r: 8, stroke: P.amber, sw: 1 }));
    }
    ch.push(T(m, X + 86 + i * 46, Y + 108, 36, 24, { size: 18, align: 'center' }));
  });

  // Writing area — full parchment feel
  ch.push(F(X + 20, Y + 160, 350, 380, P.surface, { r: 14, stroke: P.border }));

  // Faint ruled lines
  for (let l = 0; l < 9; l++) {
    ch.push(Line(X + 36, Y + 196 + l * 38, 310, P.border2));
  }

  // Body text content
  ch.push(T('The morning light filters through\nthe blinds, soft and unassuming.\nI lie still for a few minutes,\nlistening to the birds.', X + 36, Y + 178, 318, 90, { size: 14, fill: P.cream, lh: 1.75 }));
  ch.push(T('There is something about Sundays\nthat asks you to slow down. Not\nout of laziness — but reverence.', X + 36, Y + 276, 318, 68, { size: 14, fill: P.cream, lh: 1.75 }));
  ch.push(T('I made coffee slowly. Poured it\ninto the old ceramic mug. Sat by\nthe window and watched the street.', X + 36, Y + 352, 318, 68, { size: 14, fill: P.cream, lh: 1.75 }));
  // Cursor line
  ch.push(F(X + 36, Y + 428, 2, 20, P.amber, {}));
  ch.push(T('|', X + 38, Y + 428, 8, 20, { size: 14, fill: P.amber, opacity: 0 }));

  // Word count & toolbar
  ch.push(T('274 words', X + 36, Y + 552, 100, 16, { size: 11, fill: P.muted2 }));
  ch.push(T('12 min read', X + 160, Y + 552, 100, 16, { size: 11, fill: P.muted2 }));
  ch.push(T('Auto-saved', X + 280, Y + 552, 90, 16, { size: 11, fill: P.sage, align: 'right' }));

  // Formatting toolbar
  ch.push(F(X, Y + 582, W, 52, P.surface2, { stroke: P.border }));
  const fmtTools = ['B', 'I', '"', '—', '✦', '⌘'];
  fmtTools.forEach((t, i) => {
    ch.push(T(t, X + 24 + i * 58, Y + 596, 34, 24, { size: 14, weight: t === 'B' ? 700 : 400, fill: P.cream2, align: 'center' }));
    if (i < fmtTools.length - 1) {
      ch.push(F(X + 56 + i * 58, Y + 596, 1, 22, P.border2));
    }
  });

  // Keyboard placeholder
  ch.push(F(X, Y + 634, W, 210, P.surface3, {}));
  for (let row = 0; row < 4; row++) {
    const keys = row === 0 ? 'QWERTYUIOP'.split('') :
                 row === 1 ? 'ASDFGHJKL'.split('') :
                 row === 2 ? ['⇧', ...('ZXCVBNM'.split('')), '⌫'] :
                 ['123', ' ', 'return'];
    const baseX = X + (row === 1 ? 20 : row === 2 ? 10 : 5);
    const keyW  = row === 3 ? 70 : 32;
    const spacing = row === 3 ? 78 : 36;
    keys.forEach((k, j) => {
      ch.push(F(baseX + j * spacing, Y + 642 + row * 48, keyW, 40, P.surface2, { r: 6 }));
      ch.push(T(k, baseX + j * spacing, Y + 650 + row * 48, keyW, 24, { size: 13, fill: P.cream, align: 'center' }));
    });
  }

  return F(X, Y, W, H, P.bg, { clip: true, ch });
}

// ── Screen: TIMELINE ─────────────────────────────────────────────────────────
function makeTimeline(X, Y) {
  const W = 390, H = 844;
  const ch = [];

  ch.push(Glow(X + 60, Y + 300, 80, P.sage, 0.08));

  ch.push(T('9:41', X + 20, Y + 16, 60, 18, { size: 12, weight: 600, fill: P.cream2 }));
  ch.push(T('TIMELINE', X + 20, Y + 52, 180, 22, { size: 11, weight: 700, fill: P.amber, ls: 2 }));

  // Month header + nav
  ch.push(T('< March 2026 >', X + 110, Y + 52, 170, 22, { size: 13, fill: P.cream2, align: 'center' }));

  // Calendar grid
  const calY = Y + 86;
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  days.forEach((d, i) => {
    ch.push(T(d, X + 18 + i * 52, calY, 36, 20, { size: 11, fill: P.muted2, align: 'center', weight: 600 }));
  });

  // 5 weeks of March
  const calDays = [
    [null, null, null, null, null, null, 1],
    [2, 3, 4, 5, 6, 7, 8],
    [9, 10, 11, 12, 13, 14, 15],
    [16, 17, 18, 19, 20, 21, 22],
    [23, 24, 25, 26, 27, 28, 29],
  ];
  // entry intensity by day (0=none, 1=light, 2=medium, 3=strong)
  const hasEntry = { 1:2, 3:1, 5:3, 7:1, 8:2, 10:3, 12:2, 13:1, 14:2, 15:3, 17:1, 18:3, 19:2, 20:3, 21:2, 22:3 };

  calDays.forEach((week, wi) => {
    week.forEach((day, di) => {
      if (!day) return;
      const dx = X + 18 + di * 52;
      const dy = calY + 26 + wi * 52;
      const intensity = hasEntry[day] || 0;
      const isToday = day === 22;
      const dotColor = intensity === 3 ? P.amber : intensity === 2 ? P.amberHi : P.muted;
      const dotOp    = intensity === 1 ? 0.4 : 0.9;

      if (isToday) {
        ch.push(E(dx + 2, dy + 2, 32, 32, P.amber, {}));
        ch.push(T(String(day), dx + 2, dy + 7, 32, 18, { size: 13, weight: 700, fill: P.bg, align: 'center' }));
      } else {
        ch.push(T(String(day), dx + 2, dy + 7, 32, 18, { size: 13, fill: intensity > 0 ? P.cream : P.muted, align: 'center' }));
        if (intensity > 0) {
          ch.push(E(dx + 13, dy + 30, 8, 8, dotColor, { opacity: dotOp }));
        }
      }
    });
  });

  // Divider
  ch.push(Line(X + 20, Y + 366, 350, P.border2));

  // Selected week's entries list
  ch.push(T('THIS WEEK', X + 20, Y + 382, 150, 16, { size: 10, weight: 700, fill: P.muted, ls: 2 }));

  const weekEntries = [
    { day: 'Sunday, Mar 22', preview: 'The morning light filters through the blinds...', words: 274, mood: '😌', mins: 12 },
    { day: 'Saturday, Mar 21', preview: 'Walked to the market. The peaches were ripe.', words: 412, mood: '🌤', mins: 18 },
    { day: 'Friday, Mar 20', preview: 'A difficult conversation, finally had.', words: 681, mood: '🌧', mins: 31 },
    { day: 'Thursday, Mar 19', preview: 'Slow soup. Grounding presence in the kitchen.', words: 203, mood: '🌿', mins: 9 },
  ];

  weekEntries.forEach((e, i) => {
    const ey = Y + 406 + i * 82;
    ch.push(F(X + 20, ey, 350, 74, P.surface, { r: 10, stroke: P.border }));
    ch.push(T(e.mood, X + 32, ey + 14, 28, 28, { size: 20 }));
    ch.push(T(e.day, X + 68, ey + 12, 240, 14, { size: 11, weight: 600, fill: P.cream2 }));
    ch.push(T(e.preview, X + 68, ey + 30, 250, 28, { size: 12, fill: P.muted2, lh: 1.4 }));
    ch.push(T(e.words + 'w · ' + e.mins + 'min', X + 68, ey + 58, 140, 12, { size: 10, fill: P.muted }));
  });

  // Nav
  const navY = Y + H - 80;
  ch.push(F(X, navY, W, 80, P.surface, { stroke: P.border }));
  const navItems = [
    { icon: '◎', label: 'Today',    active: false },
    { icon: '≡', label: 'Timeline', active: true },
    { icon: '✦', label: 'Write',    active: false },
    { icon: '◈', label: 'Insights', active: false },
    { icon: '○', label: 'Profile',  active: false },
  ];
  navItems.forEach((n, i) => {
    const nx = X + 16 + i * 72;
    ch.push(T(n.icon, nx, navY + 14, 52, 20, { size: 18, align: 'center', fill: n.active ? P.amber : P.muted }));
    ch.push(T(n.label, nx, navY + 38, 52, 14, { size: 9, align: 'center', weight: n.active ? 700 : 400, fill: n.active ? P.amber : P.muted2 }));
  });

  return F(X, Y, W, H, P.bg, { clip: true, ch });
}

// ── Screen: INSIGHTS ─────────────────────────────────────────────────────────
function makeInsights(X, Y) {
  const W = 390, H = 844;
  const ch = [];

  ch.push(Glow(X + 200, Y + 200, 120, P.amber, 0.10));
  ch.push(Glow(X + 80, Y + 560, 80, P.sage, 0.08));

  ch.push(T('9:41', X + 20, Y + 16, 60, 18, { size: 12, weight: 600, fill: P.cream2 }));
  ch.push(T('INSIGHTS', X + 20, Y + 52, 180, 22, { size: 11, weight: 700, fill: P.amber, ls: 2 }));
  ch.push(T('March 2026', X + 270, Y + 52, 100, 22, { size: 12, fill: P.muted2, align: 'right' }));

  // Streak hero
  ch.push(F(X + 20, Y + 86, 350, 110, P.surface2, { r: 16, stroke: P.border2 }));
  ch.push(Glow(X + 90, Y + 130, 48, P.amber, 0.20));
  ch.push(T('47', X + 50, Y + 96, 100, 70, { size: 58, weight: 800, fill: P.cream, align: 'center' }));
  ch.push(T('day\nstreak', X + 50, Y + 168, 100, 24, { size: 10, fill: P.muted2, ls: 1, align: 'center' }));
  ch.push(F(X + 154, Y + 100, 1, 86, P.border2));
  ch.push(T('This Month', X + 172, Y + 100, 180, 16, { size: 10, fill: P.muted, ls: 1, weight: 600 }));
  const stats = [
    { label: 'Entries', value: '22' },
    { label: 'Total words', value: '14,284' },
    { label: 'Avg per entry', value: '649' },
    { label: 'Best day', value: 'Fri 20' },
  ];
  stats.forEach((s, i) => {
    const sx = i % 2 === 0 ? X + 172 : X + 286;
    const sy = Y + 120 + Math.floor(i / 2) * 38;
    ch.push(T(s.value, sx, sy, 100, 22, { size: 16, weight: 700, fill: P.cream }));
    ch.push(T(s.label, sx, sy + 20, 100, 14, { size: 10, fill: P.muted2 }));
  });

  // Mood distribution
  ch.push(T('MOOD DISTRIBUTION', X + 20, Y + 212, 200, 16, { size: 10, weight: 700, fill: P.muted, ls: 2 }));
  ch.push(F(X + 20, Y + 234, 350, 100, P.surface, { r: 12, stroke: P.border }));
  const moods2 = [
    { icon: '😌', label: 'Calm',  pct: 32, color: P.sage },
    { icon: '🌤', label: 'Good',  pct: 27, color: P.amberHi },
    { icon: '🌿', label: 'Grounded', pct: 23, color: P.sageHi },
    { icon: '🌧', label: 'Heavy', pct: 18, color: P.muted },
  ];
  moods2.forEach((m, i) => {
    const mx = X + 28 + i * 84;
    ch.push(T(m.icon, mx, Y + 244, 68, 28, { size: 22, align: 'center' }));
    // Bar
    ch.push(F(mx + 16, Y + 278, 36, 6, P.border2, { r: 3 }));
    ch.push(F(mx + 16, Y + 278, Math.round(36 * m.pct / 100), 6, m.color, { r: 3 }));
    ch.push(T(m.pct + '%', mx, Y + 292, 68, 14, { size: 10, fill: P.cream2, align: 'center' }));
    ch.push(T(m.label, mx, Y + 306, 68, 12, { size: 9, fill: P.muted2, align: 'center' }));
  });

  // Writing patterns
  ch.push(T('WRITING PATTERNS', X + 20, Y + 352, 200, 16, { size: 10, weight: 700, fill: P.muted, ls: 2 }));
  ch.push(F(X + 20, Y + 374, 350, 108, P.surface, { r: 12, stroke: P.border }));
  // Heatmap-style bar chart (7 days)
  const dayData = [
    { d: 'M', h: 0.4 }, { d: 'T', h: 0.8 }, { d: 'W', h: 0.6 },
    { d: 'T', h: 1.0 }, { d: 'F', h: 0.9 }, { d: 'S', h: 0.5 }, { d: 'S', h: 0.7 },
  ];
  const maxBarH = 54;
  dayData.forEach((d, i) => {
    const bx = X + 36 + i * 44;
    const bh = Math.round(maxBarH * d.h);
    ch.push(F(bx, Y + 406 + (maxBarH - bh), 28, bh, P.amberLo, { r: 6 }));
    ch.push(F(bx, Y + 406 + (maxBarH - bh), 28, Math.min(bh, 8), P.amber, { r: 6 }));
    ch.push(T(d.d, bx, Y + 466, 28, 14, { size: 9, fill: P.muted2, align: 'center' }));
  });
  ch.push(T('Best writing time: 7–9am', X + 36, Y + 388, 220, 14, { size: 11, fill: P.cream2 }));
  ch.push(T('Avg session: 18 min', X + 236, Y + 388, 120, 14, { size: 11, fill: P.amberHi, align: 'right' }));

  // Top themes
  ch.push(T('TOP THEMES', X + 20, Y + 498, 150, 16, { size: 10, weight: 700, fill: P.muted, ls: 2 }));
  ch.push(F(X + 20, Y + 520, 350, 92, P.surface, { r: 12, stroke: P.border }));
  const themes = [
    { tag: 'Nature', count: 14, color: P.sage },
    { tag: 'Relationships', count: 11, color: P.amberHi },
    { tag: 'Work', count: 9, color: P.muted2 },
    { tag: 'Gratitude', count: 8, color: P.sageHi },
    { tag: 'Body', count: 6, color: P.rust },
    { tag: 'Memory', count: 5, color: P.amber },
  ];
  themes.forEach((th, i) => {
    const tx = X + 28 + (i % 3) * 116;
    const ty = Y + 534 + Math.floor(i / 3) * 40;
    ch.push(F(tx, ty, 108, 28, P.surface2, { r: 14, stroke: th.color }));
    ch.push(T(`${th.tag}  ${th.count}`, tx + 4, ty + 6, 100, 16, { size: 11, fill: th.color, align: 'center' }));
  });

  // Nav
  const navY = Y + H - 80;
  ch.push(F(X, navY, W, 80, P.surface, { stroke: P.border }));
  const navItems = [
    { icon: '◎', label: 'Today',    active: false },
    { icon: '≡', label: 'Timeline', active: false },
    { icon: '✦', label: 'Write',    active: false },
    { icon: '◈', label: 'Insights', active: true },
    { icon: '○', label: 'Profile',  active: false },
  ];
  navItems.forEach((n, i) => {
    const nx = X + 16 + i * 72;
    ch.push(T(n.icon, nx, navY + 14, 52, 20, { size: 18, align: 'center', fill: n.active ? P.amber : P.muted }));
    ch.push(T(n.label, nx, navY + 38, 52, 14, { size: 9, align: 'center', weight: n.active ? 700 : 400, fill: n.active ? P.amber : P.muted2 }));
  });

  return F(X, Y, W, H, P.bg, { clip: true, ch });
}

// ── Screen: PROFILE ───────────────────────────────────────────────────────────
function makeProfile(X, Y) {
  const W = 390, H = 844;
  const ch = [];

  ch.push(Glow(X + 195, Y + 150, 120, P.amber, 0.10));

  ch.push(T('9:41', X + 20, Y + 16, 60, 18, { size: 12, weight: 600, fill: P.cream2 }));
  ch.push(T('PROFILE', X + 20, Y + 52, 180, 22, { size: 11, weight: 700, fill: P.amber, ls: 2 }));
  ch.push(T('⚙', X + 340, Y + 50, 30, 26, { size: 20, fill: P.muted2 }));

  // Avatar ring
  ch.push(E(X + 155, Y + 88, 80, 80, P.surface3, { stroke: P.amber, sw: 2 }));
  ch.push(T('S', X + 155, Y + 108, 80, 40, { size: 32, weight: 700, fill: P.amberHi, align: 'center' }));

  ch.push(T('Simone', X + 20, Y + 186, 350, 30, { size: 24, weight: 300, fill: P.cream, align: 'center' }));
  ch.push(T('Journaling since October 2023', X + 20, Y + 218, 350, 18, { size: 12, fill: P.muted2, align: 'center' }));

  // Milestone badges
  ch.push(F(X + 20, Y + 250, 350, 60, P.surface2, { r: 14, stroke: P.border2 }));
  const badges = [
    { icon: '🔥', label: '47 days' },
    { icon: '📝', label: '867 entries' },
    { icon: '✍️', label: '284K words' },
    { icon: '🌿', label: 'Season 3' },
  ];
  badges.forEach((b, i) => {
    const bx = X + 28 + i * 84;
    ch.push(T(b.icon, bx, Y + 262, 68, 24, { size: 18, align: 'center' }));
    ch.push(T(b.label, bx, Y + 284, 68, 14, { size: 9, fill: P.muted2, align: 'center' }));
  });

  // Intentions
  ch.push(T('MY INTENTIONS', X + 20, Y + 328, 180, 16, { size: 10, weight: 700, fill: P.muted, ls: 2 }));
  ch.push(F(X + 20, Y + 350, 350, 90, P.surface, { r: 12, stroke: P.border }));
  ch.push(T('"Write every day, even when there\nis nothing to say. Especially then."', X + 32, Y + 364, 318, 50, { size: 13, fill: P.cream2, lh: 1.65 }));
  ch.push(T('Set December 1, 2023', X + 32, Y + 418, 200, 14, { size: 10, fill: P.muted }));

  // Settings list
  ch.push(T('PREFERENCES', X + 20, Y + 458, 180, 16, { size: 10, weight: 700, fill: P.muted, ls: 2 }));
  const settings = [
    { label: 'Daily reminder', value: '8:00 AM', icon: '🔔' },
    { label: 'Writing font', value: 'Serif', icon: 'Aa' },
    { label: 'Theme', value: 'Forest Night', icon: '🌿' },
    { label: 'Backup & export', value: 'iCloud', icon: '☁' },
    { label: 'Prompts & seeds', value: 'On', icon: '✦' },
  ];
  settings.forEach((s, i) => {
    const sy = Y + 480 + i * 52;
    ch.push(F(X + 20, sy, 350, 44, P.surface, { r: 8, stroke: P.border }));
    ch.push(T(s.icon, X + 32, sy + 12, 26, 20, { size: 15, align: 'center' }));
    ch.push(T(s.label, X + 66, sy + 14, 180, 16, { size: 13, fill: P.cream }));
    ch.push(T(s.value + ' ›', X + 254, sy + 14, 100, 16, { size: 12, fill: P.muted2, align: 'right' }));
  });

  // Nav
  const navY = Y + H - 80;
  ch.push(F(X, navY, W, 80, P.surface, { stroke: P.border }));
  const navItems = [
    { icon: '◎', label: 'Today',    active: false },
    { icon: '≡', label: 'Timeline', active: false },
    { icon: '✦', label: 'Write',    active: false },
    { icon: '◈', label: 'Insights', active: false },
    { icon: '○', label: 'Profile',  active: true },
  ];
  navItems.forEach((n, i) => {
    const nx = X + 16 + i * 72;
    ch.push(T(n.icon, nx, navY + 14, 52, 20, { size: 18, align: 'center', fill: n.active ? P.amber : P.muted }));
    ch.push(T(n.label, nx, navY + 38, 52, 14, { size: 9, align: 'center', weight: n.active ? 700 : 400, fill: n.active ? P.amber : P.muted2 }));
  });

  return F(X, Y, W, H, P.bg, { clip: true, ch });
}

// ── Assemble document ─────────────────────────────────────────────────────────
function buildDocument() {
  const GAP = 60;
  const W = 390, H = 844;

  const screens = [
    makeToday(0,             0),
    makeWrite(W + GAP,       0),
    makeTimeline(2*(W+GAP),  0),
    makeInsights(3*(W+GAP),  0),
    makeProfile(4*(W+GAP),   0),
  ];

  return {
    version: '2.8',
    name: 'DRIFTWOOD',
    width: 5 * (W + GAP) - GAP,
    height: H,
    children: screens,
    meta: {
      appName:     'DRIFTWOOD',
      tagline:     'Slow living journal. A sanctuary for reflection.',
      archetype:   'health',
      description: 'Journaling app with a warm organic dark aesthetic.',
      palette: {
        bg:      P.bg,
        fg:      P.cream,
        accent:  P.amber,
        accent2: P.sage,
        muted:   P.muted2,
      },
    },
  };
}

const doc = buildDocument();
const outPath = path.join(__dirname, 'driftwood.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log(`✓ Written: ${outPath}`);
console.log(`  Screens: ${doc.children.length}`);
console.log(`  Canvas:  ${doc.width} × ${doc.height}`);
