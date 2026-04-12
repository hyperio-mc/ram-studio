'use strict';
// croft-generator.js
// CROFT — Personal Reading Tracker
// Design Heartbeat — Mar 23, 2026
// Inspired by:
//   • Searchable.com warm off-white + rust/terracotta palette
//   • Span.app bento metrics card layout
//   • Cadmus.io warm academic cream palette with dark accents
//   • OWO word-block pill typography
//   • Scroll storytelling with section contrast

const fs   = require('fs');
const path = require('path');

// ── Palette (Light — primary) ────────────────────────────────────────────────
const P = {
  bg:        '#F8F4EE',   // warm cream — Searchable/Cadmus inspired
  surface:   '#FFFFFF',   // pure white surface cards
  surface2:  '#F0EBE3',   // slightly warmer surface
  surface3:  '#E8DDD2',   // warm tan — subtle depth
  border:    'rgba(26,15,9,0.10)',
  border2:   'rgba(26,15,9,0.18)',
  accent:    '#C15F3C',   // rust/terracotta — Searchable.com
  accentDim: '#F5E8E0',   // dimmed accent bg
  accentHi:  '#E8965A',   // lighter rust/amber
  accent2:   '#8B4513',   // dark sienna
  fg:        '#1A0F09',   // near-black warm dark
  fg2:       '#5C3D2A',   // warm mid-brown
  fg3:       '#9C7A68',   // warm muted
  green:     '#4A8C5C',   // warm forest green
  amber:     '#D4962A',   // warm amber
  cream:     '#FCF7EF',   // Cadmus editorial cream
};

// ── Pen structure helpers ─────────────────────────────────────────────────────
function frame(name, x, y, w, h, fill, children = []) {
  return { type: 'frame', name, x, y, width: w, height: h, fill: fill || P.bg, children };
}
function rect(x, y, w, h, fill, opts = {}) {
  return { type: 'frame', x, y, width: w, height: h, fill, cornerRadius: opts.r || 0,
    opacity: opts.o || 1, children: opts.children || [] };
}
function text(x, y, w, h, fill, opts = {}) {
  return { type: 'text', x, y, width: w, height: h, fill, opacity: opts.o || 1 };
}
function ellipse(x, y, w, h, fill, opts = {}) {
  return { type: 'ellipse', x, y, width: w, height: h, fill, opacity: opts.o || 1 };
}

// ── Screen 1: Library ─────────────────────────────────────────────────────────
function libraryScreen() {
  const W = 390, H = 844;
  const ch = [];

  // Warm ambient background glow
  ch.push(ellipse(-60, -40, 280, 280, P.accent, { o: 0.05 }));
  ch.push(ellipse(200, 600, 220, 220, P.accentHi, { o: 0.04 }));

  // Status bar
  ch.push(rect(0, 0, W, 44, 'transparent', { children: [
    text(16, 14, 40, 14, P.fg3),
    text(300, 14, 74, 14, P.fg3),
  ]}));

  // Header
  ch.push(rect(0, 44, W, 60, 'transparent', { children: [
    // App name — word-block pill style (OWO inspired)
    rect(16, 14, 84, 32, P.accent, { r: 8, children: [
      text(12, 8, 60, 16, P.surface),
    ]}),
    text(112, 20, 140, 20, P.fg),
    // Avatar circle
    ellipse(330, 14, 36, 36, P.accentDim),
    text(338, 22, 20, 20, P.accent),
  ]}));

  // Section label
  ch.push(text(16, 116, 160, 12, P.fg3));

  // ── Bento grid: big stats card ───────────────────────────────────────────
  // Hero metric — Books Read
  ch.push(rect(16, 134, W - 32, 110, P.accent, { r: 16, children: [
    text(20, 18, 160, 11, P.surface), // "BOOKS READ THIS YEAR"
    text(20, 36, 80, 48, P.surface),  // "47"
    text(20, 86, 180, 13, P.surface), // "on pace for 68 books"
    // Mini chart bars
    ...[0.3, 0.5, 0.6, 0.4, 0.7, 0.8, 0.9, 1.0, 0.85, 0.7].map((v, i) => {
      const bH = Math.round(v * 36);
      return rect(W - 32 - 130 + i * 13, 84 - bH, 9, bH, 'rgba(255,255,255,0.35)', { r: 2 });
    }),
  ]}));

  // ── 3-cell metric row ──────────────────────────────────────────────────────
  const metrics = [
    { val: '14.2K', label: 'Pages' },
    { val: '23d',   label: 'Streak' },
    { val: '4.1★',  label: 'Avg Rating' },
  ];
  metrics.forEach((m, i) => {
    const x = 16 + i * (W - 32 + 8) / 3;
    const mW = (W - 32 - 16) / 3;
    ch.push(rect(x, 256, mW, 72, P.surface, { r: 12, children: [
      text(12, 12, mW - 24, 10, P.fg3),  // label
      text(12, 28, mW - 24, 26, P.accent), // value
    ]}));
  });

  // ── Currently Reading label ────────────────────────────────────────────────
  ch.push(text(16, 344, 200, 12, P.fg3));

  // ── Book list items ─────────────────────────────────────────────────────────
  const books = [
    { pct: 80, badge: P.accent },
    { pct: 100, badge: P.green },
    { pct: 34, badge: P.accentHi },
  ];
  books.forEach((b, i) => {
    const y = 364 + i * 82;
    ch.push(rect(16, y, W - 32, 74, P.surface, { r: 14, children: [
      // Book cover placeholder
      rect(14, 12, 42, 50, P.accentDim, { r: 6, children: [
        text(10, 14, 22, 22, P.accent),
      ]}),
      // Title and author
      text(70, 14, 180, 15, P.fg),
      text(70, 32, 180, 12, P.fg3),
      // Progress bar
      rect(70, 50, 180, 4, P.surface3, { r: 2, children: [
        rect(0, 0, Math.round(180 * (b.pct / 100)), 4, b.pct === 100 ? P.green : P.accent, { r: 2 }),
      ]}),
      // Badge
      rect(W - 32 - 68, 18, 52, 22, b.pct === 100 ? '#E8F5EE' : P.accentDim, { r: 11, children: [
        text(8, 5, 36, 12, b.pct === 100 ? P.green : P.accent),
      ]}),
    ]}));
  });

  // ── Goal progress ──────────────────────────────────────────────────────────
  ch.push(rect(16, 616, W - 32, 66, P.surface, { r: 12, children: [
    text(14, 14, 180, 12, P.fg),
    text(W - 32 - 60, 14, 50, 12, P.accent),
    rect(14, 38, W - 32 - 28, 8, P.surface3, { r: 4, children: [
      rect(0, 0, Math.round((W - 32 - 28) * 0.67), 8, P.accent, { r: 4 }),
    ]}),
  ]}));

  // ── Bottom tab bar ─────────────────────────────────────────────────────────
  ch.push(rect(0, H - 82, W, 82, P.surface, { children: [
    rect(0, 0, W, 1, P.border, {}),
    ...[
      { fill: P.accent }, { fill: P.fg3 }, { fill: P.fg3 }, { fill: P.fg3 }, { fill: P.fg3 },
    ].map((n, i) => {
      const x = 16 + i * 72;
      return rect(x, 10, 52, 52, 'transparent', { children: [
        ellipse(12, 4, 28, 28, i === 0 ? P.accentDim : 'transparent'),
        text(14, 6, 24, 24, n.fill),
        text(6, 32, 40, 12, i === 0 ? P.accent : P.fg3),
      ]});
    }),
  ]}));

  return frame('Library', 0, 0, W, H, P.bg, ch);
}

// ── Screen 2: Book Detail ─────────────────────────────────────────────────────
function bookDetailScreen() {
  const W = 390, H = 844;
  const ch = [];

  ch.push(ellipse(240, -60, 240, 240, P.accentHi, { o: 0.06 }));

  // Status bar
  ch.push(rect(0, 0, W, 44, 'transparent', { children: [
    text(16, 14, 40, 14, P.fg3),
    text(300, 14, 74, 14, P.fg3),
  ]}));

  // Back nav + actions
  ch.push(rect(0, 44, W, 52, 'transparent', { children: [
    rect(16, 12, 32, 28, P.surface2, { r: 8, children: [text(8, 6, 16, 16, P.fg3)] }),
    text(60, 18, 200, 16, P.fg),
    rect(W - 52, 12, 36, 28, P.accentDim, { r: 8, children: [text(8, 6, 20, 16, P.accent)] }),
  ]}));

  // Book hero card
  ch.push(rect(16, 104, W - 32, 148, P.surface, { r: 16, children: [
    // Book cover
    rect(14, 14, 80, 120, P.accentDim, { r: 10, children: [
      text(22, 30, 36, 60, P.accent),
      text(10, 92, 60, 10, P.fg3),
    ]}),
    // Title block
    text(108, 18, W - 32 - 122, 20, P.fg),
    text(108, 42, W - 32 - 122, 14, P.fg3),
    // Star rating
    ...[0, 1, 2, 3, 4].map(s => rect(108 + s * 22, 62, 18, 18, P.accentDim, { r: 9, children: [
      text(3, 2, 12, 14, P.accent),
    ]})),
    // Progress
    text(108, 90, 60, 12, P.fg3),
    text(108, 106, 100, 22, P.accent),
    // Page count
    text(108, 130, 180, 11, P.fg3),
  ]}));

  // Stats row — bento cells
  const stats = [
    { v: '12', l: 'Sessions' },
    { v: '8.4h', l: 'Total' },
    { v: '41p/h', l: 'Pace' },
  ];
  stats.forEach((s, i) => {
    const sW = (W - 32 - 16) / 3;
    ch.push(rect(16 + i * (sW + 8), 264, sW, 68, P.surface, { r: 12, children: [
      text(12, 12, sW - 24, 10, P.fg3),
      text(12, 26, sW - 24, 24, P.accent),
    ]}));
  });

  // Progress bars
  ch.push(rect(16, 348, W - 32, 86, P.surface, { r: 14, children: [
    text(14, 14, 200, 12, P.fg),
    text(W - 32 - 60, 14, 50, 12, P.accent),
    rect(14, 34, W - 32 - 28, 6, P.surface3, { r: 3, children: [
      rect(0, 0, Math.round((W - 32 - 28) * 0.80), 6, P.accent, { r: 3 }),
    ]}),
    text(14, 54, 200, 12, P.fg),
    text(W - 32 - 60, 54, 50, 12, P.green),
    rect(14, 70, W - 32 - 28, 6, P.surface3, { r: 3, children: [
      rect(0, 0, Math.round((W - 32 - 28) * 0.92), 6, P.green, { r: 3 }),
    ]}),
  ]}));

  // Session log
  ch.push(text(16, 446, 160, 12, P.fg3));
  const sessions = [
    { badge: '+39p' },
    { badge: '+47p' },
  ];
  sessions.forEach((s, i) => {
    ch.push(rect(16, 466 + i * 72, W - 32, 64, P.surface, { r: 12, children: [
      ellipse(14, 14, 36, 36, P.accentDim),
      text(20, 22, 22, 20, P.accent),
      text(62, 14, 180, 14, P.fg),
      text(62, 32, 180, 12, P.fg3),
      rect(W - 32 - 56, 18, 48, 22, P.accentDim, { r: 11, children: [
        text(8, 5, 32, 12, P.accent),
      ]}),
    ]}));
  });

  // Genre tags
  ch.push(rect(16, 618, W - 32, 72, P.surface, { r: 12, children: [
    text(14, 12, 80, 11, P.fg3),
    ...['Sci-fi', 'Literary', 'Philosophy', 'Classic'].map((t, i) => {
      const tw = [46, 54, 74, 52][i];
      const tx = 14 + [0, 54, 116, 198][i];
      return rect(tx, 30, tw, 24, P.accentDim, { r: 12, children: [
        text(8, 6, tw - 16, 12, P.accent),
      ]});
    }),
  ]}));

  // Bottom nav
  ch.push(rect(0, H - 82, W, 82, P.surface, { children: [
    rect(0, 0, W, 1, P.border, {}),
    ...[
      { fill: P.accent }, { fill: P.fg3 }, { fill: P.fg3 }, { fill: P.fg3 }, { fill: P.fg3 },
    ].map((n, i) => {
      const x = 16 + i * 72;
      return rect(x, 10, 52, 52, 'transparent', { children: [
        ellipse(12, 4, 28, 28, i === 0 ? P.accentDim : 'transparent'),
        text(14, 6, 24, 24, n.fill),
        text(6, 32, 40, 12, i === 0 ? P.accent : P.fg3),
      ]});
    }),
  ]}));

  return frame('Book Detail', 0, 0, W, H, P.bg, ch);
}

// ── Screen 3: Add Book ────────────────────────────────────────────────────────
function addBookScreen() {
  const W = 390, H = 844;
  const ch = [];

  // Status bar
  ch.push(rect(0, 0, W, 44, 'transparent', { children: [
    text(16, 14, 40, 14, P.fg3),
    text(300, 14, 74, 14, P.fg3),
  ]}));

  // Header
  ch.push(rect(0, 44, W, 52, 'transparent', { children: [
    rect(16, 12, 32, 28, P.surface2, { r: 8, children: [text(8, 6, 16, 16, P.fg3)] }),
    text(60, 18, 200, 16, P.fg),
  ]}));

  // Search bar
  ch.push(rect(16, 106, W - 32, 48, P.surface, { r: 24, children: [
    ellipse(16, 12, 24, 24, P.accentDim),
    text(20, 18, 14, 12, P.accent),    // search icon
    text(52, 16, W - 32 - 80, 16, P.fg3), // placeholder
    rect(W - 32 - 48, 10, 36, 28, P.accent, { r: 14, children: [
      text(8, 6, 20, 16, P.surface),
    ]}),
  ]}));

  // Filter pills
  ch.push(rect(16, 166, W - 32, 36, 'transparent', { children: [
    rect(0, 4, 62, 28, P.accent, { r: 14, children: [text(12, 6, 38, 16, P.surface)] }),  // All
    rect(70, 4, 62, 28, P.surface, { r: 14, children: [text(12, 6, 38, 16, P.fg3)] }),    // Fiction
    rect(140, 4, 90, 28, P.surface, { r: 14, children: [text(12, 6, 66, 16, P.fg3)] }), // Non-fiction
    rect(238, 4, 76, 28, P.surface, { r: 14, children: [text(12, 6, 52, 16, P.fg3)] }), // Classics
  ]}));

  // Results section label
  ch.push(text(16, 214, 200, 12, P.fg3));

  // Book search results
  const results = [
    { badge: 'Add', badgeBg: P.accent, badgeFg: P.surface },
    { badge: 'Add', badgeBg: P.accent, badgeFg: P.surface },
    { badge: '✓ Added', badgeBg: '#E8F5EE', badgeFg: P.green },
  ];
  results.forEach((r, i) => {
    ch.push(rect(16, 234 + i * 82, W - 32, 74, P.surface, { r: 14, children: [
      // Book cover
      rect(12, 10, 48, 54, P.accentDim, { r: 6, children: [
        text(10, 12, 28, 30, P.accent),
      ]}),
      text(72, 12, W - 32 - 140, 16, P.fg),
      text(72, 32, W - 32 - 140, 13, P.fg3),
      text(72, 50, 80, 12, P.fg3),
      rect(W - 32 - 80, 22, 70, 28, r.badgeBg, { r: 14, children: [
        text(10, 7, 50, 14, r.badgeFg),
      ]}),
    ]}));
  });

  // Add to shelf section
  ch.push(text(16, 486, 120, 12, P.fg3));
  const shelves = ['Currently reading', 'Want to read', 'Finished', 'DNF'];
  ch.push(rect(16, 506, W - 32, 120, P.surface, { r: 14, children: [
    ...shelves.map((s, i) => rect(0, i * 30, W - 32, 30, 'transparent', { children: [
      ellipse(14, 8, 14, 14, i === 0 ? P.accentDim : P.surface3),
      text(38, 9, 200, 13, P.fg),
      ...(i === 0 ? [rect(W - 32 - 36, 8, 24, 14, P.accent, { r: 7, children: [text(5, 2, 14, 10, P.surface)] })] : []),
      ...(i < 3 ? [rect(14, 29, W - 32 - 28, 1, P.border, {})] : []),
    ]})),
  ]}));

  // Bottom nav
  ch.push(rect(0, H - 82, W, 82, P.surface, { children: [
    rect(0, 0, W, 1, P.border, {}),
    ...[
      { fill: P.fg3 }, { fill: P.fg3 }, { fill: P.accent }, { fill: P.fg3 }, { fill: P.fg3 },
    ].map((n, i) => {
      const x = 16 + i * 72;
      return rect(x, 10, 52, 52, 'transparent', { children: [
        ellipse(12, 4, 28, 28, i === 2 ? P.accentDim : 'transparent'),
        text(14, 6, 24, 24, n.fill),
        text(6, 32, 40, 12, i === 2 ? P.accent : P.fg3),
      ]});
    }),
  ]}));

  return frame('Add Book', 0, 0, W, H, P.bg, ch);
}

// ── Screen 4: Insights ────────────────────────────────────────────────────────
function insightsScreen() {
  const W = 390, H = 844;
  const ch = [];

  ch.push(ellipse(-40, 200, 220, 220, P.accentHi, { o: 0.05 }));
  ch.push(ellipse(260, 500, 200, 200, P.accent, { o: 0.04 }));

  // Status + header
  ch.push(rect(0, 0, W, 44, 'transparent', { children: [
    text(16, 14, 40, 14, P.fg3),
    text(300, 14, 74, 14, P.fg3),
  ]}));
  ch.push(rect(0, 44, W, 56, 'transparent', { children: [
    text(16, 16, 140, 22, P.fg),
    text(16, 40, 200, 12, P.fg3),
    // Year selector pill
    rect(W - 110, 18, 94, 28, P.surface, { r: 14, children: [
      text(14, 6, 66, 16, P.fg3),
    ]}),
  ]}));

  // Annual hero metric
  ch.push(rect(16, 108, W - 32, 96, P.accent, { r: 16, children: [
    text(20, 16, 180, 11, P.surface),    // "2026 READING"
    text(20, 32, 80, 44, P.surface),     // "47"
    text(20, 78, 280, 12, P.surface),    // sub text
    // Sparkline bars representing monthly reading
    ...[2,4,3,8,5,6,7,5,4,3,0,0].map((v, i) => {
      const maxV = 8;
      const bH = Math.round((v / maxV) * 40);
      return rect(W - 32 - 160 + i * 13, 80 - bH, 9, bH, 'rgba(255,255,255,0.40)', { r: 2 });
    }),
  ]}));

  // Fiction/Non-fiction split
  ch.push(rect(16, 216, W - 32, 76, P.surface, { r: 14, children: [
    // Fiction bar
    rect(14, 22, Math.round((W - 32 - 28) * 0.62), 14, P.accent, { r: 3 }),
    // Non-fiction bar
    rect(14 + Math.round((W - 32 - 28) * 0.62) + 4, 22, Math.round((W - 32 - 28) * 0.38), 14, P.accentHi, { r: 3 }),
    // Labels
    text(14, 44, 80, 12, P.fg),
    text(14 + Math.round((W - 32 - 28) * 0.62) + 4, 44, 100, 12, P.fg3),
    rect(W - 32 - 56, 12, 48, 22, P.accentDim, { r: 11, children: [text(8, 5, 32, 12, P.accent)] }),
  ]}));

  // Genre breakdown bars
  const genres = [
    { color: P.accent,   pct: 0.40, label: 'Sci-fi' },
    { color: P.fg2,      pct: 0.22, label: 'Literary fiction' },
    { color: P.accentHi, pct: 0.18, label: 'Philosophy' },
    { color: P.green,    pct: 0.20, label: 'History' },
  ];
  ch.push(rect(16, 304, W - 32, 240, P.surface, { r: 14, children: [
    text(14, 14, 160, 13, P.fg),
    ...genres.map((g, i) => rect(0, 40 + i * 50, W - 32, 46, 'transparent', { children: [
      text(14, 10, 150, 13, P.fg),
      text(14, 26, 100, 11, P.fg3),
      rect(14, 38, W - 32 - 28, 4, P.surface3, { r: 2 }),
      rect(14, 38, Math.round((W - 32 - 28) * g.pct), 4, g.color, { r: 2 }),
      text(W - 32 - 52, 10, 44, 13, P.fg),
    ]})),
  ]}));

  // Highlights row
  const highlights = [
    { v: 'Jan · 8', l: 'Best month' },
    { v: '31 days', l: 'Longest streak' },
  ];
  highlights.forEach((h, i) => {
    const hW = (W - 32 - 8) / 2;
    ch.push(rect(16 + i * (hW + 8), 556, hW, 68, P.surface, { r: 12, children: [
      text(12, 12, hW - 24, 10, P.fg3),
      text(12, 26, hW - 24, 22, P.accent),
    ]}));
  });

  // Reading pattern insight
  ch.push(rect(16, 636, W - 32, 72, P.surface, { r: 12, children: [
    text(14, 12, 180, 11, P.fg3),
    text(14, 28, W - 32 - 28, 13, P.fg),
    text(14, 46, W - 32 - 28, 12, P.fg3),
  ]}));

  // Bottom nav
  ch.push(rect(0, H - 82, W, 82, P.surface, { children: [
    rect(0, 0, W, 1, P.border, {}),
    ...[
      { fill: P.fg3 }, { fill: P.fg3 }, { fill: P.fg3 }, { fill: P.fg3 }, { fill: P.accent },
    ].map((n, i) => {
      const x = 16 + i * 72;
      return rect(x, 10, 52, 52, 'transparent', { children: [
        ellipse(12, 4, 28, 28, i === 4 ? P.accentDim : 'transparent'),
        text(14, 6, 24, 24, n.fill),
        text(6, 32, 40, 12, i === 4 ? P.accent : P.fg3),
      ]});
    }),
  ]}));

  return frame('Insights', 0, 0, W, H, P.bg, ch);
}

// ── Screen 5: Journal ─────────────────────────────────────────────────────────
function journalScreen() {
  const W = 390, H = 844;
  const ch = [];

  ch.push(ellipse(180, -40, 240, 240, P.accent, { o: 0.04 }));

  // Status
  ch.push(rect(0, 0, W, 44, 'transparent', { children: [
    text(16, 14, 40, 14, P.fg3),
    text(300, 14, 74, 14, P.fg3),
  ]}));

  // Header
  ch.push(rect(0, 44, W, 56, 'transparent', { children: [
    text(16, 16, 180, 22, P.fg),
    text(16, 40, 200, 12, P.fg3),
    rect(W - 110, 18, 94, 28, P.accentDim, { r: 14, children: [
      text(12, 6, 70, 16, P.accent),
    ]}),
  ]}));

  // Hero metric
  ch.push(rect(16, 108, W - 32, 80, P.surface, { r: 16, children: [
    // Left metric
    text(16, 14, 100, 11, P.fg3),
    text(16, 28, 60, 30, P.accent),
    text(16, 60, 160, 12, P.fg3),
    // Right: accent bar separator
    rect(Math.round(W - 32) / 2 - 1, 14, 1, 52, P.border, {}),
    text((W - 32) / 2 + 16, 14, 100, 11, P.fg3),
    text((W - 32) / 2 + 16, 28, 100, 30, P.fg),
    text((W - 32) / 2 + 16, 60, 120, 12, P.fg3),
  ]}));

  // Highlights and notes
  ch.push(text(16, 202, 160, 12, P.fg3));
  const notes = [
    { isBig: true  },
    { isBig: false },
    { isBig: false },
  ];
  notes.forEach((n, i) => {
    const noteH = n.isBig ? 84 : 68;
    ch.push(rect(16, 220 + notes.slice(0, i).reduce((a, m) => a + (m.isBig ? 94 : 78), 0), W - 32, noteH, P.surface, { r: 14, children: [
      // Type indicator
      rect(14, 14, 28, 28, P.accentDim, { r: 7, children: [
        text(6, 6, 16, 16, P.accent),
      ]}),
      text(52, 14, W - 32 - 80, 15, P.fg),
      text(52, 32, W - 32 - 80, 12, P.fg3),
      ...(n.isBig ? [text(52, 48, W - 32 - 80, 13, P.fg2)] : []),
      // Badge
      rect(W - 32 - 36, 14, 28, 24, P.accentDim, { r: 8, children: [
        text(6, 6, 16, 12, P.accent),
      ]}),
    ]}));
  });

  // Themes tags
  ch.push(rect(16, 602, W - 32, 72, P.surface, { r: 12, children: [
    text(14, 12, 80, 11, P.fg3),
    ...['Utopia', 'Freedom', 'Society', 'Le Guin'].map((t, i) => {
      const tw = [52, 60, 56, 58][i];
      const tx = 14 + [0, 60, 128, 192][i];
      return rect(tx, 30, tw, 24, P.accentDim, { r: 12, children: [
        text(8, 6, tw - 16, 12, P.accent),
      ]});
    }),
  ]}));

  // Reflection text
  ch.push(rect(16, 686, W - 32, 76, P.surface, { r: 12, children: [
    text(14, 12, 100, 11, P.fg3),
    text(14, 28, W - 32 - 28, 12, P.fg),
    text(14, 44, W - 32 - 28, 12, P.fg3),
    text(14, 58, W - 32 - 28, 12, P.fg3),
  ]}));

  // Bottom nav
  ch.push(rect(0, H - 82, W, 82, P.surface, { children: [
    rect(0, 0, W, 1, P.border, {}),
    ...[
      { fill: P.fg3 }, { fill: P.fg3 }, { fill: P.fg3 }, { fill: P.accent }, { fill: P.fg3 },
    ].map((n, i) => {
      const x = 16 + i * 72;
      return rect(x, 10, 52, 52, 'transparent', { children: [
        ellipse(12, 4, 28, 28, i === 3 ? P.accentDim : 'transparent'),
        text(14, 6, 24, 24, n.fill),
        text(6, 32, 40, 12, i === 3 ? P.accent : P.fg3),
      ]});
    }),
  ]}));

  return frame('Journal', 0, 0, W, H, P.bg, ch);
}

// ── Screen 6: Discover ────────────────────────────────────────────────────────
function discoverScreen() {
  const W = 390, H = 844;
  const ch = [];

  ch.push(ellipse(200, -60, 260, 260, P.accentHi, { o: 0.06 }));
  ch.push(ellipse(-60, 500, 200, 200, P.accent, { o: 0.05 }));

  // Status
  ch.push(rect(0, 0, W, 44, 'transparent', { children: [
    text(16, 14, 40, 14, P.fg3),
    text(300, 14, 74, 14, P.fg3),
  ]}));

  // Header
  ch.push(rect(0, 44, W, 56, 'transparent', { children: [
    text(16, 16, 200, 22, P.fg),
    text(16, 40, 260, 12, P.fg3),
  ]}));

  // Context banner — word-block OWO style
  ch.push(rect(16, 106, W - 32, 60, P.accentDim, { r: 14, children: [
    rect(0, 0, W - 32, 60, P.accent, { r: 14, o: 0.08 }),
    text(14, 12, 80, 11, P.fg3),
    text(14, 26, 200, 14, P.fg),
    text(14, 44, W - 32 - 28, 11, P.fg3),
  ]}));

  // Recommendation list
  ch.push(text(16, 178, 200, 12, P.fg3));
  const recs = [
    { match: '98%' },
    { match: '96%' },
    { match: '94%' },
  ];
  recs.forEach((r, i) => {
    ch.push(rect(16, 198 + i * 90, W - 32, 82, P.surface, { r: 14, children: [
      // Cover
      rect(12, 10, 54, 62, P.accentDim, { r: 8, children: [
        text(12, 16, 30, 30, P.accent),
      ]}),
      text(78, 12, W - 32 - 150, 16, P.fg),
      text(78, 32, W - 32 - 150, 12, P.fg3),
      text(78, 48, 80, 12, P.fg3),
      // Match badge — accent pill
      rect(W - 32 - 68, 14, 58, 26, P.accent, { r: 13, children: [
        text(10, 6, 38, 14, P.surface),
      ]}),
      // Heart save
      rect(W - 32 - 68, 46, 58, 22, P.accentDim, { r: 11, children: [
        text(10, 5, 38, 12, P.accent),
      ]}),
    ]}));
  });

  // Reader stats
  const rstats = [
    { v: '847', l: 'Matches' },
    { v: '1.2K', l: 'Readers like you' },
  ];
  rstats.forEach((rs, i) => {
    const rW = (W - 32 - 8) / 2;
    ch.push(rect(16 + i * (rW + 8), 472, rW, 68, P.surface, { r: 12, children: [
      text(12, 12, rW - 24, 10, P.fg3),
      text(12, 26, rW - 24, 24, P.accent),
    ]}));
  });

  // Taste profile tags
  ch.push(rect(16, 552, W - 32, 76, P.surface, { r: 12, children: [
    text(14, 12, 140, 11, P.fg3),
    ...['Speculative', 'Literary', 'Hopepunk', 'Character-driven'].map((t, i) => {
      const tw = [76, 54, 66, 110][i];
      const row = i < 2 ? 0 : 1;
      const col = i < 2 ? i : i - 2;
      const prevW = row === 0 ? [0, 84][col] : [0, 62][col];
      return rect(14 + prevW, 30 + row * 28, tw, 22, P.accentDim, { r: 11, children: [
        text(8, 5, tw - 16, 12, P.accent),
      ]});
    }),
  ]}));

  // Bottom nav
  ch.push(rect(0, H - 82, W, 82, P.surface, { children: [
    rect(0, 0, W, 1, P.border, {}),
    ...[
      { fill: P.fg3 }, { fill: P.accent }, { fill: P.fg3 }, { fill: P.fg3 }, { fill: P.fg3 },
    ].map((n, i) => {
      const x = 16 + i * 72;
      return rect(x, 10, 52, 52, 'transparent', { children: [
        ellipse(12, 4, 28, 28, i === 1 ? P.accentDim : 'transparent'),
        text(14, 6, 24, 24, n.fill),
        text(6, 32, 40, 12, i === 1 ? P.accent : P.fg3),
      ]});
    }),
  ]}));

  return frame('Discover', 0, 0, W, H, P.bg, ch);
}

// ── Assemble pen ──────────────────────────────────────────────────────────────
const pen = {
  version:  '2.8',
  name:     'Croft — Personal Reading Tracker',
  children: [
    libraryScreen(),
    bookDetailScreen(),
    addBookScreen(),
    insightsScreen(),
    journalScreen(),
    discoverScreen(),
  ],
};

const outPath = path.join(__dirname, 'croft.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`Written: ${outPath}`);
console.log(`  Screens : ${pen.children.length}`);
console.log(`  Size    : ${(fs.statSync(outPath).size / 1024).toFixed(1)} KB`);
