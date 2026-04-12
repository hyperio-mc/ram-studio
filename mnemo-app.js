'use strict';
// mnemo-app.js
// MNEMO — AI Memory & Knowledge Vault
// Inspired by:
//   — Linear's bento grid dark mode (godly.website FT. 870)
//   — Midday.ai's "one-person company" dark dashboard (darkmodedesign.com)
//   — AI productivity landing page trend (land-book.com, March 2026)
// Challenge: Dark-mode AI second-brain app for knowledge workers.
// Deep violet-space palette, bento grid dashboard, neural connection UI.

const fs   = require('fs');
const path = require('path');

// ── Palette ──────────────────────────────────────────────────────────────────
const P = {
  bg:       '#07060E',   // near-black with violet undertone — deep space
  surface:  '#0F0D1A',   // dark purple card surface
  surface2: '#16132A',   // slightly lighter panel
  surface3: '#1E1B35',   // hover / active states
  border:   '#2A2545',   // hairline separator
  border2:  '#3D3766',   // brighter edge for accents
  fg:       '#EDE8FF',   // lavender-cool white
  muted:    '#6B6490',   // muted purple-grey
  accent:   '#7C5CFF',   // electric violet — primary
  accent2:  '#FF5CA8',   // hot pink — connections / secondary
  teal:     '#22D3A4',   // teal green — captured / success
  amber:    '#FFAB3E',   // amber — needs review
};

let _id = 0;
const uid = () => `m${++_id}`;

// ── Primitive helpers ─────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: Math.max(0, w), height: Math.max(0, h),
  fill: fill || P.bg,
  clip: opts.clip !== undefined ? opts.clip : false,
  ...(opts.r !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.ch || [],
});

const T = (content, x, y, w, h, opts = {}) => ({
  id: uid(), type: 'text', content, x, y,
  width: Math.max(1, w), height: Math.max(1, h),
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
  id: uid(), type: 'ellipse', x, y, width: Math.max(1, w), height: Math.max(1, h), fill,
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
});

// Glow helper — layered concentric ellipses for radial glow effect
const Glow = (cx, cy, r, color, steps = 4) =>
  Array.from({ length: steps }, (_, i) => {
    const factor = 1 - i / steps;
    const opacity = [0.45, 0.20, 0.10, 0.05][i] || 0.04;
    const size = r * (1 + (steps - i) * 0.5);
    return E(cx - size / 2, cy - size / 2, size, size, color, { opacity });
  });

// Pill / badge
const Pill = (x, y, label, bg, fg, w = 60, h = 20, r = 10) =>
  F(x, y, w, h, bg, { r, ch: [
    T(label, 0, 4, w, 14, { size: 9, fill: fg, align: 'center', weight: 700, ls: 0.8 }),
  ]});

// ── SCREEN 1: Hero / Landing ──────────────────────────────────────────────────
function screen1() {
  const W = 390, H = 844;
  const children = [];

  // Faint grid lines (like Linear)
  for (let x = 0; x < W; x += 24)
    children.push(F(x, 0, 1, H, '#2A2545', { opacity: 0.25 }));
  for (let y = 0; y < H; y += 24)
    children.push(F(0, y, W, 1, '#2A2545', { opacity: 0.15 }));

  // Radial glow behind hero text
  children.push(...Glow(195, 260, 180, P.accent, 5));
  children.push(...Glow(195, 260, 80, P.accent2, 3));

  // Top nav bar
  children.push(F(0, 0, W, 52, P.bg, { ch: [
    // Logo mark — small violet square with "M"
    F(16, 14, 24, 24, P.accent, { r: 6, ch: [
      T('M', 0, 5, 24, 14, { size: 11, fill: '#fff', align: 'center', weight: 800 }),
    ]}),
    T('MNEMO', 46, 18, 80, 16, { size: 13, fill: P.fg, weight: 700, ls: 1.5 }),
    // Nav pill (Linear-inspired)
    F(200, 12, 130, 28, P.surface2, { r: 14, stroke: P.border2, sw: 1, ch: [
      T('Beta Access', 8, 7, 114, 14, { size: 11, fill: P.accent, weight: 600 }),
    ]}),
  ]}));

  // Hero text block
  children.push(T('Capture.', 20, 80, 350, 56, { size: 52, fill: P.fg, weight: 800, lh: 1 }));
  children.push(T('Connect.', 20, 132, 350, 56, { size: 52, fill: P.accent, weight: 800, lh: 1 }));
  children.push(T('Remember.', 20, 184, 350, 56, { size: 52, fill: P.fg, weight: 800, lh: 1 }));

  children.push(T('Your AI second brain. MNEMO captures everything you read, think, and discuss — then surfaces connections you\'d never find alone.', 20, 250, 330, 60, {
    size: 14, fill: P.muted, lh: 1.6, opacity: 1,
  }));

  // CTA buttons
  children.push(F(20, 328, 168, 44, P.accent, { r: 22, ch: [
    T('Start Remembering', 8, 13, 152, 18, { size: 12, fill: '#fff', weight: 700 }),
  ]}));
  children.push(F(198, 328, 120, 44, P.surface2, { r: 22, stroke: P.border2, sw: 1, ch: [
    T('See a demo', 12, 13, 96, 18, { size: 12, fill: P.fg, weight: 600 }),
  ]}));

  // Trust badges
  children.push(T('Already trusted by 2,400+ researchers & knowledge workers', 20, 386, 320, 18, {
    size: 11, fill: P.muted, lh: 1.4,
  }));

  // App preview card (floating below)
  children.push(F(16, 420, 358, 200, P.surface, { r: 16, stroke: P.border, sw: 1, ch: [
    // Card header
    F(0, 0, 358, 40, P.surface2, { r: 16, ch: [
      E(12, 14, 12, 12, '#FF5F56'),
      E(28, 14, 12, 12, '#FFBD2E'),
      E(44, 14, 12, 12, '#27C93F'),
      T('MNEMO — Recent Memories', 64, 12, 200, 16, { size: 10, fill: P.muted, weight: 500 }),
    ]}),
    // Memory rows preview
    ...[
      ['📄 Claude Shannon & Information Theory', 'Research · 2m ago', P.teal],
      ['💡 Bento grid UI trend — godly.website', 'Insight · 14m ago', P.accent],
      ['🎙 Meeting: Q1 OKR alignment notes', 'Audio · 1h ago', P.amber],
      ['🔗 Linear\'s scrolling animation pattern', 'Link · 3h ago', P.accent2],
    ].map(([title, meta, dot], i) =>
      F(0, 42 + i * 40, 358, 38, i % 2 === 0 ? P.surface : P.surface2, { ch: [
        E(16, 13, 10, 10, dot),
        T(title, 34, 11, 240, 16, { size: 11, fill: P.fg, weight: 500 }),
        T(meta, 34, 26, 140, 12, { size: 9, fill: P.muted, weight: 400 }),
        // AI badge
        F(298, 10, 46, 18, P.accent + '22', { r: 9, ch: [
          T('AI ✦', 4, 3, 38, 12, { size: 9, fill: P.accent, weight: 700 }),
        ]}),
      ]}),
    ),
  ]}));

  // Bottom scroll indicator
  children.push(T('↓ Scroll to explore', 140, 636, 110, 16, { size: 10, fill: P.muted, align: 'center' }));

  // Neural dot cluster (decorative — evokes "connections")
  const dots = [
    [70, 680, 3], [120, 710, 5], [180, 695, 3], [240, 720, 4], [300, 700, 3],
    [90, 740, 4], [160, 760, 3], [220, 745, 5], [280, 755, 3], [340, 730, 4],
  ];
  dots.forEach(([x, y, r]) => children.push(E(x - r, y - r, r * 2, r * 2, P.accent, { opacity: 0.3 })));

  return { type: 'frame', name: 'MNEMO — Hero', id: uid(), x: 0, y: 0, width: W, height: H, fill: P.bg, children };
}

// ── SCREEN 2: Dashboard (Bento Grid) ─────────────────────────────────────────
function screen2() {
  const W = 390, H = 844;
  const children = [];

  // Faint ambient glow
  children.push(...Glow(50, 200, 120, P.accent, 3));
  children.push(...Glow(340, 500, 100, P.accent2, 3));

  // Status bar
  children.push(F(0, 0, W, 44, P.bg, { ch: [
    T('9:41', 16, 14, 50, 16, { size: 15, fill: P.fg, weight: 600 }),
    T('● ● ●', 320, 16, 60, 14, { size: 11, fill: P.fg, align: 'right' }),
  ]}));

  // Top nav
  children.push(F(0, 44, W, 52, P.bg, { ch: [
    F(16, 10, 24, 24, P.accent, { r: 6, ch: [
      T('M', 0, 5, 24, 14, { size: 11, fill: '#fff', align: 'center', weight: 800 }),
    ]}),
    T('Dashboard', 48, 14, 120, 20, { size: 15, fill: P.fg, weight: 700 }),
    // Search icon placeholder
    F(330, 8, 36, 36, P.surface2, { r: 18, stroke: P.border, sw: 1, ch: [
      T('⌕', 8, 8, 20, 20, { size: 16, fill: P.muted, align: 'center' }),
    ]}),
  ]}));

  // ── Bento Grid Tiles ──────────────────────────────────────────────────────
  const TILE_X = 12;
  let TY = 108;

  // ROW 1 — Wide summary tile
  const summaryTile = F(TILE_X, TY, 366, 76, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
    // Left: big count
    F(0, 0, 120, 76, P.surface2, { r: 14, ch: [
      ...Glow(60, 38, 40, P.accent, 3),
      T('247', 16, 14, 88, 36, { size: 30, fill: P.accent, weight: 800, align: 'center' }),
      T('memories', 16, 50, 88, 14, { size: 9, fill: P.muted, align: 'center', ls: 1 }),
    ]}),
    // Right: 3 mini-stats
    ...[['+12', 'today', P.teal], ['+3', 'AI linked', P.accent2], ['94%', 'recall', P.amber]].map(([val, label, col], i) =>
      F(128 + i * 80, 14, 70, 48, P.surface3, { r: 8, ch: [
        T(val, 0, 8, 70, 20, { size: 17, fill: col, weight: 800, align: 'center' }),
        T(label, 0, 30, 70, 14, { size: 9, fill: P.muted, align: 'center' }),
      ]}),
    ),
  ]});
  children.push(summaryTile);
  TY += 84;

  // ROW 2 — Left bento (quick capture) + Right bento (AI insight)
  const qcTile = F(TILE_X, TY, 176, 120, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
    F(0, 0, 176, 48, P.accent, { r: 14, ch: [
      T('+ Quick Capture', 12, 14, 152, 20, { size: 13, fill: '#fff', weight: 700 }),
    ]}),
    T('Paste text, drop a link,\nor record a voice note.', 12, 56, 152, 46, {
      size: 11, fill: P.muted, lh: 1.5,
    }),
  ]});
  children.push(qcTile);

  const aiTile = F(TILE_X + 184, TY, 182, 120, P.surface, { r: 14, stroke: P.border2, sw: 1, ch: [
    ...Glow(91, 60, 50, P.accent2, 3),
    T('✦ AI INSIGHT', 12, 12, 158, 14, { size: 9, fill: P.accent2, weight: 700, ls: 1.5 }),
    T('"Shannon\'s info theory connects to your Linear UX notes from Monday."', 12, 30, 158, 60, {
      size: 11, fill: P.fg, lh: 1.5, weight: 500,
    }),
    Pill(12, 96, 'View connection →', P.accent2 + '22', P.accent2, 130, 18, 9),
  ]});
  children.push(aiTile);
  TY += 128;

  // ROW 3 — Activity heatmap (wide)
  const heatTile = F(TILE_X, TY, 366, 96, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
    T('CAPTURE ACTIVITY', 12, 12, 180, 12, { size: 8, fill: P.muted, weight: 700, ls: 2 }),
    // Heatmap cells — 12 weeks × 7 days
    ...Array.from({ length: 12 * 7 }, (_, i) => {
      const col = i % 12;
      const row = Math.floor(i / 12);
      const intensity = Math.random();
      const fillCol = intensity < 0.3 ? P.surface3
        : intensity < 0.55 ? P.accent + '44'
        : intensity < 0.78 ? P.accent + '88'
        : P.accent;
      return F(12 + col * 28, 28 + row * 9, 26, 8, fillCol, { r: 2 });
    }),
    T('14 days streak ●', 280, 80, 86, 12, { size: 9, fill: P.teal, weight: 700, align: 'right' }),
  ]});
  children.push(heatTile);
  TY += 104;

  // ROW 4 — Category breakdown (2 tiles)
  const cats = [['📚 Research', '82', P.accent], ['💡 Insights', '61', P.accent2],
                ['🎙 Audio', '44', P.amber], ['🔗 Links', '60', P.teal]];
  cats.forEach(([label, count, col], i) => {
    const tileW = i < 2 ? 176 : 176;
    const tileX = i % 2 === 0 ? TILE_X : TILE_X + 184;
    const ty2   = i < 2 ? TY : TY + 60;
    if (i % 2 === 0 || i === 2) {
      children.push(F(tileX, ty2, tileW, 52, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
        T(count, 12, 8, 50, 24, { size: 22, fill: col, weight: 800 }),
        T(label, 12, 32, 152, 14, { size: 10, fill: P.muted }),
      ]}));
    }
  });
  TY += 120;

  // Bottom nav bar
  children.push(F(0, H - 80, W, 80, P.surface, { ch: [
    F(0, 0, W, 1, P.border, {}),
    ...['🏠', '🔍', '✦', '📝', '👤'].map((icon, i) => {
      const active = i === 0;
      return F(i * 78, 10, 78, 60, 'transparent', { ch: [
        T(icon, 20, 8, 38, 24, { size: 20, align: 'center' }),
        ...(active ? [F(24, 38, 30, 3, P.accent, { r: 1.5 })] : []),
      ]});
    }),
  ]}));

  return { type: 'frame', name: 'MNEMO — Dashboard', id: uid(), x: 410, y: 0, width: W, height: H, fill: P.bg, children };
}

// ── SCREEN 3: Memory Feed ─────────────────────────────────────────────────────
function screen3() {
  const W = 390, H = 844;
  const children = [];

  // Status bar
  children.push(F(0, 0, W, 44, P.bg, { ch: [
    T('9:41', 16, 14, 50, 16, { size: 15, fill: P.fg, weight: 600 }),
  ]}));

  // Header
  children.push(F(0, 44, W, 52, P.bg, { ch: [
    T('Memories', 16, 14, 160, 24, { size: 20, fill: P.fg, weight: 800 }),
    F(310, 8, 66, 36, P.accent, { r: 18, ch: [
      T('+ Add', 12, 10, 42, 16, { size: 11, fill: '#fff', weight: 700 }),
    ]}),
  ]}));

  // Search bar
  children.push(F(16, 104, 358, 40, P.surface2, { r: 12, stroke: P.border, sw: 1, ch: [
    T('⌕', 12, 10, 20, 20, { size: 16, fill: P.muted }),
    T('Search your memories...', 36, 12, 200, 16, { size: 13, fill: P.muted }),
  ]}));

  // Filter pills
  const filters = ['All', 'Research', 'Insights', 'Audio', 'Links', 'AI Linked'];
  let fx = 16;
  filters.forEach((f, i) => {
    const w = f.length * 7 + 20;
    const active = i === 0;
    children.push(F(fx, 156, w, 28, active ? P.accent : P.surface2, { r: 14, ch: [
      T(f, 6, 8, w - 12, 14, { size: 10, fill: active ? '#fff' : P.muted, weight: active ? 700 : 400 }),
    ]}));
    fx += w + 8;
  });

  // Memory list items
  const memories = [
    { icon: '📄', title: 'Claude Shannon & Information Theory', meta: '2 minutes ago · Research', tags: ['AI Linked', 'Physics'], col: P.teal, summary: 'Shannon\'s entropy equation connects information to thermodynamics — a pattern you\'ve seen in 3 other notes.' },
    { icon: '💡', title: 'Bento grid UI trend — godly.website FT.870', meta: '14 minutes ago · Insight', tags: ['Design', 'UI'], col: P.accent, summary: 'Linear\'s bento grid uses varying tile heights to create visual hierarchy from data density alone.' },
    { icon: '🎙', title: 'Meeting: Q1 OKR alignment session', meta: '1 hour ago · Audio · 23 min', tags: ['Work', 'Audio'], col: P.amber, summary: '3 action items captured. AI extracted: shipping cadence, team growth, knowledge retention.' },
    { icon: '🔗', title: 'Linear\'s scrolling animation pattern analysis', meta: '3 hours ago · Link', tags: ['Design', 'UX'], col: P.accent2, summary: 'Scroll-triggered entry animations reduce cognitive load by revealing complexity progressively.' },
    { icon: '📄', title: 'Zettelkasten method vs PARA system', meta: 'Yesterday · Research', tags: ['PKM', 'AI Linked'], col: P.teal, summary: 'Zettelkasten focuses on atomic notes + links. PARA on actionability. MNEMO bridges both.' },
  ];

  memories.forEach((m, i) => {
    const ty = 196 + i * 114;
    if (ty + 106 > H - 90) return;
    children.push(F(16, ty, 358, 106, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
      // Left accent bar
      F(0, 16, 3, 74, m.col, { r: 1.5 }),
      // Icon
      T(m.icon, 14, 14, 24, 24, { size: 18 }),
      // Title
      T(m.title, 44, 12, 286, 18, { size: 13, fill: P.fg, weight: 600 }),
      // Meta
      T(m.meta, 44, 30, 280, 14, { size: 10, fill: P.muted }),
      // AI summary
      T(m.summary, 44, 50, 286, 30, { size: 11, fill: P.fg, lh: 1.5, opacity: 0.6 }),
      // Tags
      ...m.tags.slice(0, 2).map((tag, ti) =>
        Pill(44 + ti * (tag.length * 6 + 20), 86, tag, P.accent + '22', P.accent, tag.length * 6 + 16, 16, 8)
      ),
    ]}));
  });

  // Bottom nav
  children.push(F(0, H - 80, W, 80, P.surface, { ch: [
    F(0, 0, W, 1, P.border, {}),
    ...['🏠', '🔍', '✦', '📝', '👤'].map((icon, i) => {
      const active = i === 3;
      return F(i * 78, 10, 78, 60, 'transparent', { ch: [
        T(icon, 20, 8, 38, 24, { size: 20, align: 'center' }),
        ...(active ? [F(24, 38, 30, 3, P.accent, { r: 1.5 })] : []),
      ]});
    }),
  ]}));

  return { type: 'frame', name: 'MNEMO — Memory Feed', id: uid(), x: 820, y: 0, width: W, height: H, fill: P.bg, children };
}

// ── SCREEN 4: Memory Detail ───────────────────────────────────────────────────
function screen4() {
  const W = 390, H = 844;
  const children = [];

  children.push(...Glow(195, 150, 100, P.teal, 3));

  // Status bar
  children.push(F(0, 0, W, 44, P.bg, {}));

  // Back nav
  children.push(F(0, 44, W, 48, P.bg, { ch: [
    F(16, 8, 80, 32, P.surface2, { r: 16, stroke: P.border, sw: 1, ch: [
      T('← Back', 10, 9, 60, 14, { size: 11, fill: P.fg, weight: 600 }),
    ]}),
    T('Memory', 130, 14, 130, 20, { size: 14, fill: P.fg, weight: 700, align: 'center' }),
    // Options button
    F(342, 8, 32, 32, P.surface2, { r: 16, stroke: P.border, sw: 1, ch: [
      T('···', 4, 8, 24, 16, { size: 12, fill: P.fg, align: 'center' }),
    ]}),
  ]}));

  // Memory header
  children.push(T('📄', 16, 102, 32, 32, { size: 28 }));
  children.push(T('Claude Shannon &\nInformation Theory', 16, 138, 358, 52, {
    size: 22, fill: P.fg, weight: 800, lh: 1.2,
  }));

  // Meta row
  children.push(F(16, 196, 358, 32, P.surface2, { r: 8, ch: [
    T('📚 Research', 12, 8, 90, 16, { size: 11, fill: P.muted }),
    T('·', 100, 8, 12, 16, { size: 11, fill: P.border2 }),
    T('2 minutes ago', 114, 8, 100, 16, { size: 11, fill: P.muted }),
    T('·', 212, 8, 12, 16, { size: 11, fill: P.border2 }),
    Pill(224, 7, 'AI Linked ✦', P.teal + '22', P.teal, 90, 18, 9),
  ]}));

  // Body content
  children.push(F(16, 238, 358, 200, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
    T('Your note', 16, 16, 200, 14, { size: 9, fill: P.muted, ls: 2, weight: 700 }),
    T('Shannon defined information entropy as H = -Σ p(x) log p(x). The key insight: information content is inversely related to probability. A rare event carries more information than a common one.\n\nThis connects to thermodynamic entropy — a deep link between physics and communication theory that most engineers never explore.', 16, 36, 326, 148, {
      size: 12, fill: P.fg, lh: 1.7, opacity: 0.8,
    }),
  ]}));

  // AI Connections tile
  children.push(F(16, 450, 358, 160, P.surface, { r: 14, stroke: P.accent2 + '44', sw: 1, ch: [
    ...Glow(0, 80, 60, P.accent2, 3),
    T('✦ AI CONNECTIONS', 16, 16, 200, 14, { size: 9, fill: P.accent2, weight: 700, ls: 2 }),
    T('MNEMO found 4 memories that connect to this:', 16, 34, 326, 14, { size: 11, fill: P.muted }),
    ...[
      ['Boltzmann & thermodynamic entropy', '87% match', P.teal],
      ['Kolmogorov complexity — your 2024 notes', '74% match', P.accent],
      ['Claude\'s Transformer attention patterns', '68% match', P.accent2],
    ].map(([title, match, col], i) =>
      F(16, 56 + i * 34, 326, 28, P.surface2, { r: 8, ch: [
        E(10, 8, 10, 10, col, { opacity: 0.8 }),
        T(title, 26, 6, 220, 16, { size: 11, fill: P.fg, weight: 500 }),
        T(match, 260, 6, 66, 16, { size: 10, fill: col, weight: 700, align: 'right' }),
      ]}),
    ),
  ]}));

  // Action buttons
  children.push(F(16, 622, 170, 44, P.surface2, { r: 22, stroke: P.border2, sw: 1, ch: [
    T('↗ Open Source', 12, 13, 146, 18, { size: 12, fill: P.fg, weight: 600 }),
  ]}));
  children.push(F(198, 622, 176, 44, P.accent, { r: 22, ch: [
    T('+ Add to Collection', 8, 13, 160, 18, { size: 12, fill: '#fff', weight: 700 }),
  ]}));

  // Bottom nav
  children.push(F(0, H - 80, W, 80, P.surface, { ch: [
    F(0, 0, W, 1, P.border, {}),
    ...['🏠', '🔍', '✦', '📝', '👤'].map((icon, i) =>
      F(i * 78, 10, 78, 60, 'transparent', { ch: [
        T(icon, 20, 8, 38, 24, { size: 20, align: 'center' }),
      ]})
    ),
  ]}));

  return { type: 'frame', name: 'MNEMO — Memory Detail', id: uid(), x: 1230, y: 0, width: W, height: H, fill: P.bg, children };
}

// ── SCREEN 5: Desktop Command Center ─────────────────────────────────────────
function screen5() {
  const W = 1280, H = 800;
  const children = [];

  // Full-page ambient glows
  children.push(...Glow(200, 400, 200, P.accent, 4));
  children.push(...Glow(900, 200, 150, P.accent2, 4));
  children.push(...Glow(1100, 600, 100, P.teal, 3));

  // Light grid overlay
  for (let x = 0; x < W; x += 32) children.push(F(x, 0, 1, H, '#2A2545', { opacity: 0.12 }));
  for (let y = 0; y < H; y += 32) children.push(F(0, y, W, 1, '#2A2545', { opacity: 0.08 }));

  // ── LEFT SIDEBAR (240px) ──────────────────────────────────────────────────
  children.push(F(0, 0, 240, H, P.surface, { ch: [
    F(239, 0, 1, H, P.border, {}),

    // Logo
    F(20, 20, 28, 28, P.accent, { r: 8, ch: [
      T('M', 0, 5, 28, 18, { size: 13, fill: '#fff', align: 'center', weight: 800 }),
    ]}),
    T('MNEMO', 56, 26, 100, 16, { size: 13, fill: P.fg, weight: 700, ls: 1.5 }),

    // User avatar area
    F(12, 62, 216, 52, P.surface2, { r: 10, stroke: P.border, sw: 1, ch: [
      E(14, 11, 30, 30, P.accent, {}),
      T('R', 14, 11, 30, 30, { size: 13, fill: '#fff', align: 'center', weight: 700 }),
      T('Rakis', 52, 12, 100, 16, { size: 13, fill: P.fg, weight: 600 }),
      T('247 memories', 52, 30, 100, 14, { size: 10, fill: P.muted }),
    ]}),

    // Nav sections
    ...['📊 Dashboard', '🧠 All Memories', '✦ AI Connections', '📚 Collections', '🔍 Search', '⚙ Settings'].map((item, i) => {
      const active = i === 1;
      return F(12, 130 + i * 44, 216, 36, active ? P.accent + '22' : 'transparent', { r: 8, ch: [
        T(item, 12, 8, 192, 20, { size: 13, fill: active ? P.accent : P.muted, weight: active ? 600 : 400 }),
      ]});
    }),

    // Bottom — memory types legend
    T('BY TYPE', 20, 420, 100, 12, { size: 8, fill: P.muted, ls: 2, weight: 700 }),
    ...[['📄 Research', '82', P.teal], ['💡 Insights', '61', P.accent], ['🎙 Audio', '44', P.amber], ['🔗 Links', '60', P.accent2]].map(([label, count, col], i) =>
      F(12, 440 + i * 36, 216, 30, 'transparent', { ch: [
        T(label, 12, 6, 150, 18, { size: 12, fill: P.fg, opacity: 0.7 }),
        T(count, 190, 6, 26, 18, { size: 12, fill: col, weight: 700, align: 'right' }),
      ]}),
    ),

    // AI summary card
    F(12, 590, 216, 80, P.surface2, { r: 12, stroke: P.border2, sw: 1, ch: [
      ...Glow(108, 40, 40, P.accent, 2),
      T('✦ Daily AI Digest', 12, 12, 192, 14, { size: 10, fill: P.accent2, weight: 700 }),
      T('3 new connections found in your recent captures. Shannon links to 4 past notes.', 12, 28, 192, 44, { size: 10, fill: P.fg, lh: 1.5, opacity: 0.6 }),
    ]}),

    // Mini capture button
    F(12, 682, 216, 40, P.accent, { r: 20, ch: [
      T('+ Quick Capture', 0, 12, 216, 16, { size: 12, fill: '#fff', weight: 700, align: 'center' }),
    ]}),
  ]}));

  // ── CENTER PANEL (Memory List, 640px) ─────────────────────────────────────
  children.push(F(240, 0, 640, H, P.bg, { ch: [
    F(639, 0, 1, H, P.border, {}),

    // Panel header
    F(0, 0, 640, 64, P.bg, { ch: [
      T('All Memories', 24, 20, 200, 24, { size: 18, fill: P.fg, weight: 800 }),
      T('247 total', 220, 22, 80, 20, { size: 13, fill: P.muted }),
      // View toggle
      F(400, 16, 120, 32, P.surface2, { r: 16, stroke: P.border, sw: 1, ch: [
        F(0, 0, 60, 32, P.accent, { r: 16, ch: [T('List', 8, 8, 44, 16, { size: 11, fill: '#fff', weight: 700 })] }),
        T('Grid', 64, 8, 52, 16, { size: 11, fill: P.muted }),
      ]}),
      // Search
      F(530, 16, 100, 32, P.surface2, { r: 16, stroke: P.border, sw: 1, ch: [
        T('⌕ Search', 10, 8, 80, 16, { size: 11, fill: P.muted }),
      ]}),
    ]}),

    // Filter pills row
    F(0, 64, 640, 44, P.bg, { ch: [
      ...['All', 'Research', 'Insights', 'Audio', 'Links', 'AI Linked', 'Unreviewed'].map((f, i) => {
        let fx = 24 + [0, 36, 100, 160, 208, 252, 316][i];
        const w = f.length * 7 + 20;
        const active = i === 0;
        return F(fx, 8, w, 26, active ? P.accent : P.surface2, { r: 13, ch: [
          T(f, 6, 6, w - 12, 14, { size: 10, fill: active ? '#fff' : P.muted, weight: active ? 700 : 400 }),
        ]});
      }),
    ]}),

    // Memory list
    ...[
      { icon: '📄', title: 'Claude Shannon & Information Theory', meta: '2m ago · Research', col: P.teal, ai: true },
      { icon: '💡', title: 'Bento grid UI trend — godly.website FT.870', meta: '14m ago · Insight', col: P.accent, ai: true },
      { icon: '🎙', title: 'Meeting: Q1 OKR alignment session', meta: '1h ago · Audio · 23 min', col: P.amber, ai: false },
      { icon: '🔗', title: 'Linear\'s scrolling animation pattern analysis', meta: '3h ago · Link', col: P.accent2, ai: true },
      { icon: '📄', title: 'Zettelkasten vs PARA — comparative framework', meta: 'Yesterday · Research', col: P.teal, ai: true },
      { icon: '💡', title: 'The "one-person company" productivity stack', meta: 'Yesterday · Insight', col: P.accent, ai: false },
      { icon: '🔗', title: 'Midday.ai dark UI breakdown — darkmodedesign.com', meta: '2d ago · Link', col: P.accent2, ai: true },
      { icon: '📄', title: 'Feynman technique for technical writing', meta: '3d ago · Research', col: P.teal, ai: false },
    ].map((m, i) => {
      const active = i === 0;
      return F(0, 108 + i * 72, 640, 70, active ? P.surface2 : P.bg, { ch: [
        F(0, 0, 3, 70, m.col, {}),
        T(m.icon, 16, 22, 24, 26, { size: 22 }),
        T(m.title, 48, 14, 490, 18, { size: 13, fill: P.fg, weight: active ? 600 : 500 }),
        T(m.meta, 48, 34, 300, 14, { size: 10, fill: P.muted }),
        ...(m.ai ? [Pill(48, 52, 'AI Linked ✦', P.accent + '18', P.accent, 76, 14, 7)] : []),
        // Chevron
        T('›', 614, 24, 16, 22, { size: 20, fill: P.muted }),
      ]});
    }),
  ]}));

  // ── RIGHT PANEL (Detail, 400px) ───────────────────────────────────────────
  children.push(F(880, 0, 400, H, P.surface, { ch: [
    ...Glow(200, 200, 120, P.accent, 3),

    // Panel header
    F(0, 0, 400, 64, P.surface, { ch: [
      T('Memory Detail', 20, 20, 200, 24, { size: 16, fill: P.fg, weight: 800 }),
      F(300, 16, 80, 32, P.surface2, { r: 16, stroke: P.border, sw: 1, ch: [
        T('··· Edit', 12, 8, 56, 16, { size: 11, fill: P.muted }),
      ]}),
    ]}),

    // Memory card
    F(20, 72, 360, 200, P.surface2, { r: 14, stroke: P.border, sw: 1, ch: [
      T('📄', 16, 16, 32, 32, { size: 26 }),
      T('Claude Shannon &\nInformation Theory', 16, 56, 328, 50, { size: 18, fill: P.fg, weight: 800, lh: 1.2 }),
      T('2 minutes ago · Research', 16, 112, 280, 14, { size: 10, fill: P.muted }),
      T('Shannon defined information entropy as H = -Σ p(x) log p(x). A rare event carries more information than a common one.', 16, 132, 328, 50, {
        size: 11, fill: P.fg, lh: 1.6, opacity: 0.65,
      }),
    ]}),

    // AI connections panel
    F(20, 284, 360, 200, P.surface2, { r: 14, stroke: P.accent2 + '44', sw: 1, ch: [
      ...Glow(0, 100, 60, P.accent2, 3),
      T('✦ AI CONNECTIONS', 16, 16, 200, 12, { size: 8, fill: P.accent2, weight: 700, ls: 2 }),
      ...[
        ['Boltzmann entropy', '87%', P.teal],
        ['Kolmogorov complexity', '74%', P.accent],
        ['Transformer attention', '68%', P.accent2],
        ['Feynman diagrams', '61%', P.amber],
      ].map(([title, pct, col], i) =>
        F(16, 36 + i * 38, 328, 32, P.surface, { r: 8, ch: [
          F(0, 8, 3, 16, col, { r: 1.5 }),
          T(title, 12, 8, 240, 16, { size: 11, fill: P.fg, weight: 500 }),
          T(pct, 280, 8, 48, 16, { size: 11, fill: col, weight: 700, align: 'right' }),
        ]}),
      ),
    ]}),

    // Tags
    T('TAGS', 20, 498, 60, 12, { size: 8, fill: P.muted, ls: 2, weight: 700 }),
    ...['Information Theory', 'Physics', 'AI Linked', 'Mathematics'].map((tag, i) => {
      const cols = [P.accent, P.teal, P.accent2, P.amber];
      return Pill(20 + [0, 140, 230, 0][i], 518 + Math.floor(i / 2) * 24, tag, cols[i] + '22', cols[i], tag.length * 7 + 16, 20, 10);
    }),

    // Action bar
    F(20, 580, 360, 44, P.accent, { r: 22, ch: [
      T('View Full Memory →', 0, 13, 360, 18, { size: 13, fill: '#fff', weight: 700, align: 'center' }),
    ]}),
    F(20, 634, 170, 40, P.surface2, { r: 20, stroke: P.border2, sw: 1, ch: [
      T('+ Add to Collection', 8, 11, 154, 18, { size: 11, fill: P.fg }),
    ]}),
    F(200, 634, 180, 40, P.surface2, { r: 20, stroke: P.border2, sw: 1, ch: [
      T('↗ Open Source', 8, 11, 164, 18, { size: 11, fill: P.fg }),
    ]}),
  ]}));

  return { type: 'frame', name: 'MNEMO — Desktop', id: uid(), x: 1640, y: 0, width: W, height: H, fill: P.bg, children };
}

// ── Assemble & write .pen ─────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  variables: Object.entries(P).reduce((acc, [k, v]) => {
    acc[k] = { type: 'color', value: v }; return acc;
  }, {}),
  children: [screen1(), screen2(), screen3(), screen4(), screen5()],
};

const outPath = path.join(__dirname, 'mnemo.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));

const total = JSON.stringify(pen).length;
console.log(`✅ mnemo.pen written — ${pen.children.length} screens, ${(total / 1024).toFixed(1)} KB`);
pen.children.forEach(s => console.log(`   · ${s.name} (${s.width}×${s.height})`));
