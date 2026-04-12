// CARTE — AI editorial research notebook
// Inspired by: serif revival on minimal.gallery (fontshare.com + portfolio sites using
//              GT Sectra/Editorial New) + land-book's emerging AI-native product category
// Theme: LIGHT — warm cream editorial palette
// Heartbeat: #330

'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'carte';
const W = 390, H = 844;

// ─── Palette ───────────────────────────────────────────────────────────────
const P = {
  bg:        '#FBF8F3',   // warm cream
  surface:   '#FFFFFF',   // pure white cards
  surface2:  '#F5F0E8',   // card tint
  surface3:  '#EDE6D8',   // deeper card
  border:    '#E4DDD0',   // subtle dividers
  borderMid: '#D4C9B8',   // mid dividers
  text:      '#1C1714',   // deep warm charcoal
  textMid:   'rgba(28,23,20,0.60)',
  textLow:   'rgba(28,23,20,0.35)',
  textXLow:  'rgba(28,23,20,0.20)',
  accent:    '#B85C38',   // terracotta
  accentSoft:'rgba(184,92,56,0.12)',
  accent2:   '#4E7C3A',   // sage green
  accent2Soft:'rgba(78,124,58,0.12)',
  accentGold:'#C49A3C',   // warm gold
  white:     '#FFFFFF',
  ink:       '#1C1714',
};

// ─── Element helpers ────────────────────────────────────────────────────────
let elements = [];
function rect(x, y, w, h, fill, opts = {}) {
  const el = { type: 'rect', x, y, width: w, height: h, fill };
  if (opts.rx)      el.rx = opts.rx;
  if (opts.opacity) el.opacity = opts.opacity;
  if (opts.stroke)  el.stroke = opts.stroke;
  if (opts.sw)      el.strokeWidth = opts.sw;
  elements.push(el);
}
function text(x, y, content, size, fill, opts = {}) {
  const el = { type: 'text', x, y, content: String(content), fontSize: size, fill };
  if (opts.fw)     el.fontWeight = opts.fw;
  if (opts.font)   el.fontFamily = opts.font;
  if (opts.anchor) el.textAnchor = opts.anchor;
  if (opts.ls)     el.letterSpacing = opts.ls;
  if (opts.opacity)el.opacity = opts.opacity;
  elements.push(el);
}
function circle(cx, cy, r, fill, opts = {}) {
  const el = { type: 'circle', cx, cy, r, fill };
  if (opts.opacity) el.opacity = opts.opacity;
  if (opts.stroke)  el.stroke = opts.stroke;
  if (opts.sw)      el.strokeWidth = opts.sw;
  elements.push(el);
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  const el = { type: 'line', x1, y1, x2, y2, stroke };
  if (opts.sw)      el.strokeWidth = opts.sw;
  if (opts.opacity) el.opacity = opts.opacity;
  elements.push(el);
}

// ─── Component helpers ───────────────────────────────────────────────────────

// Status bar (light)
function statusBar(y = 0) {
  rect(0, y, W, 44, P.bg);
  text(20, y + 16, '9:41', 14, P.text, { fw: 600 });
  // signal dots
  for (let i = 0; i < 3; i++) circle(W - 60 + i * 10, y + 22, 3, P.text, { opacity: i < 2 ? 0.4 : 1 });
  circle(W - 30, y + 22, 5, 'none', { stroke: P.text, sw: 1.5 });
  rect(W - 26, y + 19, 14, 6, P.text, { rx: 1 });
}

// Nav bar (light themed)
function navBar(y = 800) {
  rect(0, y, W, H - y, P.bg);
  line(0, y, W, y, P.border, { sw: 1 });
  const items = [
    { icon: 'home',   label: 'Journal',  x: 50 },
    { icon: 'search', label: 'Search',   x: 130 },
    { icon: 'plus',   label: 'New',      x: 195 },
    { icon: 'layers', label: 'Threads',  x: 260 },
    { icon: 'user',   label: 'Library',  x: 340 },
  ];
  items.forEach((item, i) => {
    const isActive = i === 0;
    // Icon area
    rect(item.x - 20, y + 8, 40, 28, isActive ? P.accentSoft : 'none', { rx: 8 });
    circle(item.x, y + 20, 7, 'none', { stroke: isActive ? P.accent : P.textMid, sw: 1.5 });
    text(item.x, y + 38, item.label, 9, isActive ? P.accent : P.textLow, { anchor: 'middle', fw: isActive ? 600 : 400 });
  });
}

// Serif-style decorative cap (simulate GT Sectra feel with bold weight)
function serifHeadline(x, y, lines, size, color, opts = {}) {
  lines.forEach((line, i) => {
    text(x, y + i * (size * 1.18), line, size, color, {
      fw: opts.fw || 700,
      font: 'Georgia, serif',
      ls: opts.ls || '-0.02em',
      ...opts,
    });
  });
}

// Tag / badge
function tag(x, y, label, bg, color) {
  const pw = label.length * 6 + 16;
  rect(x, y, pw, 22, bg, { rx: 11 });
  text(x + pw / 2, y + 7, label, 10, color, { anchor: 'middle', fw: 600, ls: '0.03em' });
}

// Card container
function card(x, y, w, h, opts = {}) {
  rect(x, y, w, h, opts.fill || P.surface, { rx: opts.rx || 12, stroke: P.border, sw: 1 });
}

// Divider
function divider(y, opts = {}) {
  line(opts.x || 20, y, opts.x2 || W - 20, y, opts.color || P.border, { sw: opts.sw || 1 });
}

// Progress bar
function progressBar(x, y, w, h, pct, fg, bg) {
  rect(x, y, w, h, bg || P.surface3, { rx: h / 2 });
  rect(x, y, Math.max(8, w * pct), h, fg || P.accent, { rx: h / 2 });
}

// Small icon-style dot marker
function dotMarker(x, y, color) {
  circle(x, y, 3.5, color);
}

// Paper texture: subtle ruled lines + small decorative marks
function paperTexture(yStart, yEnd, skip = []) {
  for (let y = yStart; y < yEnd; y += 24) {
    if (skip.some(([a, b]) => y >= a && y <= b)) continue;
    line(0, y, W, y, P.border, { sw: 0.3, opacity: 0.25 });
  }
}
// Micro-dots for ornamental detail
function ornamentRow(x, y, count, color, r = 1.5, gap = 6) {
  for (let i = 0; i < count; i++) circle(x + i * gap, y, r, color, { opacity: 0.35 });
}
// Breadcrumb row
function breadcrumb(items, y) {
  let x = 20;
  items.forEach((item, i) => {
    text(x, y, item, 11, i === items.length - 1 ? P.textMid : P.textLow, { fw: i === items.length - 1 ? 500 : 400 });
    x += item.length * 6.2 + 4;
    if (i < items.length - 1) { text(x, y, '/', 11, P.textXLow); x += 12; }
  });
}
// Mini spark-line (5 bars)
function sparkline(x, y, data, w, h, color) {
  const bw = (w - (data.length - 1) * 2) / data.length;
  const max = Math.max(...data);
  data.forEach((v, i) => {
    const bh = Math.max(2, (v / max) * h);
    rect(x + i * (bw + 2), y + h - bh, bw, bh, color, { rx: 1, opacity: 0.6 + 0.4 * (v / max) });
  });
}

// ─── SCREEN 1: Journal Dashboard ────────────────────────────────────────────
function buildScreen1() {
  elements = [];
  // Background
  rect(0, 0, W, H, P.bg);
  // Subtle paper texture
  paperTexture(44, 780, [[44, 68], [118, 166], [194, 350], [600, 680]]);

  // Status bar
  statusBar(0);

  // Header area
  rect(0, 44, W, 68, P.bg);
  text(20, 62, 'April 2026', 12, P.textLow, { fw: 500, ls: '0.06em' });
  serifHeadline(20, 80, ['Your Journal'], 26, P.text, { fw: 700 });

  // Search bar
  rect(20, 118, W - 40, 40, P.surface, { rx: 10, stroke: P.border, sw: 1 });
  circle(42, 138, 8, 'none', { stroke: P.textLow, sw: 1.5 });
  line(47, 143, 52, 148, P.textLow, { sw: 1.5 });
  text(60, 132, 'Search entries, threads, ideas…', 13, P.textLow);

  // Today section header
  text(20, 180, 'TODAY', 10, P.textLow, { fw: 700, ls: '0.1em' });

  // Today's journal entry card (large)
  card(20, 194, W - 40, 148, { rx: 14 });
  // Date/time chip
  rect(32, 210, 60, 20, P.surface2, { rx: 10 });
  text(62, 220, '8:43 AM', 10, P.textMid, { anchor: 'middle', fw: 500 });
  // Entry title
  text(32, 244, 'On the seriality of thought —', 16, P.text, { fw: 600, font: 'Georgia, serif' });
  text(32, 264, 'how fragments cohere', 16, P.text, { fw: 600, font: 'Georgia, serif' });
  // Entry preview
  text(32, 285, 'There is something about returning to the same idea', 12, P.textMid);
  text(32, 300, 'across multiple sittings. Each pass reveals a new…', 12, P.textMid);
  // Tags row
  tag(32, 318, '✦ Philosophy', P.accentSoft, P.accent);
  tag(120, 318, 'Cognition', P.surface2, P.textMid);

  // "RECENT" section
  text(20, 362, 'RECENT', 10, P.textLow, { fw: 700, ls: '0.1em' });

  // Recent entry list items
  const recents = [
    { title: 'Notes on distributed attention', tag: 'Research', ago: '2h', pct: 0.7 },
    { title: 'Marginal gains — a synthesis', tag: 'Synthesis', ago: 'Yesterday', pct: 0.9 },
    { title: 'Hyperobjects and design scale', tag: 'Ideas', ago: '2d', pct: 0.4 },
  ];

  recents.forEach((item, i) => {
    const y = 378 + i * 70;
    card(20, y, W - 40, 60, { rx: 10 });
    text(36, y + 18, item.title, 14, P.text, { fw: 500 });
    tag(36, y + 36, item.tag, P.surface2, P.textMid);
    text(W - 32, y + 18, item.ago, 11, P.textLow, { anchor: 'end' });
    progressBar(W - 80, y + 40, 52, 3, item.pct, P.accent2, P.surface3);
  });

  // Stats row
  const sy = 600;
  card(20, sy, W - 40, 68, { fill: P.surface2, rx: 12 });
  const stats = [
    { label: 'Entries', value: '147' },
    { label: 'Threads', value: '23' },
    { label: 'Day Streak', value: '12' },
    { label: 'Sources', value: '84' },
  ];
  stats.forEach((s, i) => {
    const sx = 20 + 22 + i * 85;
    text(sx, sy + 24, s.value, 18, P.text, { fw: 700, anchor: 'middle' });
    text(sx, sy + 44, s.label, 10, P.textLow, { anchor: 'middle', fw: 500 });
    if (i < 3) line(sx + 38, sy + 14, sx + 38, sy + 54, P.border, { sw: 1 });
  });

  // Sparkline week overview (above prompt)
  const spk = 660;
  text(20, spk, 'This week', 10, P.textLow, { fw: 500 });
  sparkline(100, spk - 10, [2, 4, 1, 6, 3, 7, 5], 80, 14, P.accent);
  text(W - 20, spk, '5.2 avg / day', 10, P.textLow, { anchor: 'end', fw: 400 });
  ornamentRow(20, 672, 16, P.borderMid, 1.5, 8);

  // Prompt card
  const py = 682;
  card(20, py, W - 40, 84, { fill: P.surface, rx: 12 });
  rect(20, py, W - 40, 84, 'none', { rx: 12, stroke: P.accentGold + '55', sw: 1.5 });
  text(36, py + 18, '✦  TODAY\'S PROMPT', 10, P.accentGold, { fw: 700, ls: '0.06em' });
  text(36, py + 40, 'What did you notice today that you', 13, P.text, { fw: 400, font: 'Georgia, serif' });
  text(36, py + 58, 'hadn\'t expected to notice?', 13, P.text, { fw: 400, font: 'Georgia, serif' });
  text(W - 36, py + 58, 'Write →', 12, P.accent, { anchor: 'end', fw: 600 });

  // Nav
  navBar(780);

  return elements.length;
}

// ─── SCREEN 2: New Entry ────────────────────────────────────────────────────
function buildScreen2() {
  elements = [];
  rect(0, 0, W, H, P.bg);
  paperTexture(44, 750, [[44, 170], [700, 760]]);
  statusBar(0);

  // Back + title
  text(20, 64, '← Journal', 14, P.accent, { fw: 500 });
  text(W - 20, 64, 'Done', 14, P.accent, { anchor: 'end', fw: 600 });

  // Date header
  text(W / 2, 104, 'Tuesday, 8 April 2026', 12, P.textLow, { anchor: 'middle', fw: 500 });
  serifHeadline(W / 2, 132, ['New Entry'], 28, P.text, { anchor: 'middle', fw: 700 });

  divider(160, { x: 60, x2: W - 60 });

  // Title field
  text(24, 190, 'Title', 11, P.textLow, { fw: 600, ls: '0.05em' });
  rect(24, 204, W - 48, 48, P.surface, { rx: 10, stroke: P.border, sw: 1 });
  text(36, 225, 'On the space between ideas…', 16, P.text, { fw: 500, font: 'Georgia, serif' });
  line(36, 236, 270, 236, P.accent, { sw: 1.5 });

  // Tags
  text(24, 270, 'Tags', 11, P.textLow, { fw: 600, ls: '0.05em' });
  tag(24, 284, '+ Add tag', P.surface2, P.textMid);
  tag(100, 284, 'Philosophy', P.accentSoft, P.accent);
  tag(184, 284, 'Writing', P.surface2, P.textMid);

  // Body field
  text(24, 324, 'Entry', 11, P.textLow, { fw: 600, ls: '0.05em' });
  rect(24, 338, W - 48, 300, P.surface, { rx: 10, stroke: P.border, sw: 1 });
  // Simulated writing
  const lines = [
    'There is a quality to the gaps between',
    'thoughts — the white space in a notebook,',
    'the pause in conversation, the blankness',
    'between one idea and the next — that we',
    'tend to treat as absence. But absence is',
    'itself a kind of presence.',
    '',
    'The space invites.',
    '',
    'I have been thinking lately about how',
    'creative work lives not in the moments',
    'of production but in the intervals…',
  ];
  lines.forEach((l, i) => {
    text(36, 362 + i * 20, l, 13, l === '' ? P.textXLow : P.text, { font: 'Georgia, serif', fw: 400 });
  });
  // Cursor blink line
  rect(36 + 13 * 7 * 0.62, 362 + 11 * 20, 2, 16, P.accent);

  // AI assist button
  const ay = 654;
  rect(20, ay, W - 40, 44, P.surface2, { rx: 10, stroke: P.border, sw: 1 });
  text(W / 2, ay + 16, '✦ Ask CARTE to continue…', 13, P.textMid, { anchor: 'middle' });

  // Toolbar
  const ty = 706;
  rect(0, ty, W, 44, P.surface, { stroke: P.border, sw: 1 });
  const tools = ['B', 'I', 'H', '"', '—', '⊕'];
  tools.forEach((t, i) => {
    text(40 + i * 54, ty + 14, t, 14, P.textMid, { fw: i < 2 ? 700 : 400, anchor: 'middle' });
    if (i < 5) line(40 + i * 54 + 27, ty + 8, 40 + i * 54 + 27, ty + 36, P.border, { sw: 1 });
  });

  navBar(780);
  return elements.length;
}

// ─── SCREEN 3: Research Thread ──────────────────────────────────────────────
function buildScreen3() {
  elements = [];
  rect(0, 0, W, H, P.bg);
  paperTexture(44, 780, [[44, 200], [750, 780]]);
  statusBar(0);

  // Header
  text(20, 64, '← Back', 14, P.accent, { fw: 500 });
  text(W - 20, 64, '⋯', 18, P.textMid, { anchor: 'end' });

  serifHeadline(20, 90, ['Distributed Attention:'], 22, P.text, { fw: 700 });
  serifHeadline(20, 116, ['A Research Thread'], 22, P.text, { fw: 700 });
  text(20, 140, '14 notes · 6 sources · 3 syntheses', 12, P.textLow);

  divider(158);

  // Thread filter tabs
  const tabs = ['All', 'Notes', 'Sources', 'Synthesis'];
  tabs.forEach((tab, i) => {
    const tx = 20 + i * 86;
    const isActive = i === 0;
    if (isActive) {
      rect(tx, 166, 70, 28, P.accent, { rx: 14 });
      text(tx + 35, 176, tab, 12, P.white, { anchor: 'middle', fw: 600 });
    } else {
      text(tx + 35, 176, tab, 12, P.textMid, { anchor: 'middle', fw: 400 });
    }
  });

  // Thread timeline entries
  const entries = [
    {
      type: 'note',
      time: 'Apr 7',
      title: 'Initial observation — the cost of switching',
      body: 'Gloria Mark\'s research suggests recovery time after interruption is ~23 minutes. But the cost accumulates...',
      tag: 'Note',
      tagColor: P.accent2,
    },
    {
      type: 'source',
      time: 'Apr 6',
      title: '"Attention and Effort" — Kahneman, 1973',
      body: 'System 1 vs. System 2 framing. Effortful attention depletes reserves; low-load tasks use ambient capacity.',
      tag: 'Source',
      tagColor: P.accent,
    },
    {
      type: 'synthesis',
      time: 'Apr 5',
      title: 'Synthesis: the myth of multitasking',
      body: 'Three studies converge on a counterintuitive finding: distributed attention isn\'t lost — it\'s cached...',
      tag: 'Synthesis',
      tagColor: P.accentGold,
    },
    {
      type: 'note',
      time: 'Apr 4',
      title: 'Design implication — calm computing',
      body: 'Weiser\'s \"calm technology\" as precursor. Interfaces that exist at the periphery rather than center...',
      tag: 'Note',
      tagColor: P.accent2,
    },
  ];

  entries.forEach((entry, i) => {
    const ey = 208 + i * 136;
    // Vertical thread line
    line(30, ey, 30, ey + 124, P.borderMid, { sw: 1.5, opacity: 0.5 });
    // Node dot
    circle(30, ey + 12, 7, entry.tagColor, { opacity: 0.2 });
    circle(30, ey + 12, 4, entry.tagColor);

    // Card
    card(48, ey, W - 68, 124, { rx: 10 });
    text(60, ey + 18, entry.time, 10, P.textLow, { fw: 500 });
    tag(W - 72, ey + 8, entry.tag, entry.tagColor + '22', entry.tagColor);
    text(60, ey + 38, entry.title, 13, P.text, { fw: 600 });
    text(60, ey + 58, entry.body.slice(0, 45), 11, P.textMid);
    text(60, ey + 73, entry.body.slice(45, 90), 11, P.textMid);
    text(60, ey + 88, entry.body.slice(90, 118) + '…', 11, P.textMid, { opacity: 0.8 });
    text(W - 68, ey + 110, 'Open →', 11, P.accent, { anchor: 'end', fw: 600 });
  });

  // FAB: add to thread
  rect(W - 76, 740, 56, 32, P.accent, { rx: 16 });
  text(W - 48, 751, '+ Add', 12, P.white, { anchor: 'middle', fw: 600 });

  navBar(780);
  return elements.length;
}

// ─── SCREEN 4: Source / Citation Detail ──────────────────────────────────────
function buildScreen4() {
  elements = [];
  rect(0, 0, W, H, P.bg);
  paperTexture(44, 780, [[44, 164], [640, 720]]);
  statusBar(0);

  text(20, 64, '← Thread', 14, P.accent, { fw: 500 });
  text(W - 20, 64, '⋯', 18, P.textMid, { anchor: 'end' });

  // Source type badge
  tag(20, 80, 'BOOK', P.surface2, P.textLow);

  // Title block — editorial serif
  serifHeadline(20, 112, ['Attention and Effort'], 24, P.text, { fw: 700 });
  text(20, 144, 'Daniel Kahneman · Princeton University Press · 1973', 12, P.textMid);

  divider(162);

  // Key highlight
  rect(20, 170, W - 40, 96, P.surface2, { rx: 12 });
  rect(20, 170, 4, 96, P.accent, { rx: 2 });
  text(32, 188, 'KEY PASSAGE', 10, P.accent, { fw: 700, ls: '0.06em' });
  text(32, 208, '"Performing a task requires mental resources,', 12, P.text, { font: 'Georgia, serif', fw: 400 });
  text(32, 224, 'and the amount of effort devoted to a task is', 12, P.text, { font: 'Georgia, serif', fw: 400 });
  text(32, 240, 'itself a variable that the performer controls."', 12, P.text, { font: 'Georgia, serif', fw: 400 });
  text(32, 258, '— p. 24', 11, P.textLow, { fw: 400 });

  // Notes from this source
  text(20, 282, 'YOUR NOTES (3)', 10, P.textLow, { fw: 700, ls: '0.08em' });

  const notes = [
    { title: 'On cognitive load distribution', tag: 'Linked to 4 entries', date: 'Apr 6' },
    { title: 'Dual-task paradigm — implications', tag: 'Linked to 2 entries', date: 'Apr 5' },
    { title: 'Arousal vs. mental load distinction', tag: 'New note', date: 'Apr 4' },
  ];

  notes.forEach((note, i) => {
    const ny = 296 + i * 66;
    card(20, ny, W - 40, 56, { rx: 10 });
    dotMarker(34, ny + 20, P.accent);
    text(44, ny + 18, note.title, 13, P.text, { fw: 500 });
    text(44, ny + 36, note.tag, 11, P.textMid);
    text(W - 32, ny + 18, note.date, 11, P.textLow, { anchor: 'end' });
  });

  // Related sources
  text(20, 498, 'RELATED SOURCES (2)', 10, P.textLow, { fw: 700, ls: '0.08em' });

  const related = [
    { title: 'Flow: Psychology of Optimal Experience', author: 'Csikszentmihalyi · 1990' },
    { title: 'The Shallows', author: 'Nicholas Carr · 2010' },
  ];

  related.forEach((r, i) => {
    const ry = 512 + i * 64;
    card(20, ry, W - 40, 54, { rx: 10 });
    tag(32, ry + 9, 'BOOK', P.surface2, P.textLow);
    text(86, ry + 18, r.title, 13, P.text, { fw: 500 });
    text(86, ry + 36, r.author, 11, P.textMid);
    text(W - 32, ry + 27, '→', 14, P.accent, { anchor: 'end', fw: 600 });
  });

  // AI Synthesis button
  const ab = 648;
  rect(20, ab, W - 40, 52, P.ink, { rx: 12 });
  text(W / 2, ab + 18, '✦ Synthesize with CARTE AI', 14, P.white, { anchor: 'middle', fw: 600 });
  text(W / 2, ab + 36, 'Generate insights from all notes on this source', 11, 'rgba(255,255,255,0.55)', { anchor: 'middle' });

  // Cite/export row
  rect(20, 710, (W - 48) / 2, 40, P.surface2, { rx: 10 });
  rect(W / 2 + 4, 710, (W - 48) / 2, 40, P.surface2, { rx: 10 });
  text(20 + (W - 48) / 4, 724, 'Copy Citation', 12, P.textMid, { anchor: 'middle', fw: 500 });
  text(W / 2 + 4 + (W - 48) / 4, 724, 'Add to Export', 12, P.textMid, { anchor: 'middle', fw: 500 });

  navBar(780);
  return elements.length;
}

// ─── SCREEN 5: AI Synthesis ──────────────────────────────────────────────────
function buildScreen5() {
  elements = [];
  rect(0, 0, W, H, P.bg);
  paperTexture(44, 780, [[44, 206], [750, 780]]);
  statusBar(0);

  text(20, 64, '← Thread', 14, P.accent, { fw: 500 });

  // Title
  serifHeadline(20, 90, ['CARTE Synthesis'], 26, P.text, { fw: 700 });
  text(20, 126, 'Based on 14 notes · 6 sources', 12, P.textLow);
  divider(144);

  // Progress / generation state — "done"
  rect(20, 154, W - 40, 40, P.accent2Soft, { rx: 10 });
  dotMarker(36, 174, P.accent2);
  text(46, 168, 'Synthesis complete — 3 insights generated', 13, P.accent2, { fw: 500 });

  // Insight cards
  const insights = [
    {
      n: '01',
      title: 'Attention is not diminished by distribution',
      body: 'Across Kahneman (1973), Csikszentmihalyi (1990), and your own Apr 5 note, a convergent pattern: distributed attention across low-load ambient tasks may actually preserve cognitive resources for the primary task, contradicting common productivity advice.',
      strength: 0.92,
    },
    {
      n: '02',
      title: 'The 23-minute myth needs contextualizing',
      body: 'Mark\'s recovery-time finding is frequently misapplied. Her 2004 study measured workplace interruptions, not volitional attention shifts. Your notes from Apr 7 suggest the distinction is significant for design.',
      strength: 0.85,
    },
    {
      n: '03',
      title: 'Calm interface design as practical application',
      body: 'Weiser & Brown\'s calm technology framework (1995) provides a design vocabulary for your Apr 4 note. Three principles: calm exists at the periphery, moves center when needed, and augments rather than taxes.',
      strength: 0.78,
    },
  ];

  insights.forEach((ins, i) => {
    const iy = 208 + i * 170;
    card(20, iy, W - 40, 158, { rx: 14 });
    // Number + strength
    text(36, iy + 22, ins.n, 24, P.surface3, { fw: 800 });
    const strW = 80;
    text(W - 36, iy + 16, Math.round(ins.strength * 100) + '% confidence', 10, P.textLow, { anchor: 'end', fw: 500 });
    progressBar(W - 36 - strW, iy + 28, strW, 3, ins.strength, P.accent2, P.surface3);
    text(36, iy + 48, ins.title, 14, P.text, { fw: 600, font: 'Georgia, serif' });
    // Body — 3 lines
    const words = ins.body;
    const chunk = Math.floor(words.length / 3);
    text(36, iy + 74, words.slice(0, chunk), 11, P.textMid);
    text(36, iy + 90, words.slice(chunk, chunk * 2), 11, P.textMid);
    text(36, iy + 106, words.slice(chunk * 2, chunk * 2 + 48) + '…', 11, P.textMid, { opacity: 0.85 });
    // Save to journal
    text(W - 36, iy + 140, 'Save to journal →', 12, P.accent, { anchor: 'end', fw: 500 });
  });

  navBar(780);
  return elements.length;
}

// ─── SCREEN 6: Export / Output ──────────────────────────────────────────────
function buildScreen6() {
  elements = [];
  rect(0, 0, W, H, P.bg);
  paperTexture(44, 780, [[44, 146], [640, 720]]);
  statusBar(0);

  text(20, 64, '← Journal', 14, P.accent, { fw: 500 });

  serifHeadline(20, 90, ['Export'], 28, P.text, { fw: 700 });
  text(20, 126, 'Choose what to compile and how to share it', 13, P.textLow);

  divider(144);

  // Format selector
  text(20, 160, 'FORMAT', 10, P.textLow, { fw: 700, ls: '0.08em' });
  const formats = [
    { label: 'PDF', sub: 'Print-ready document', active: true },
    { label: 'Markdown', sub: 'Plain text with structure', active: false },
    { label: 'Notion', sub: 'Direct import', active: false },
  ];
  formats.forEach((f, i) => {
    const fy = 174 + i * 58;
    card(20, fy, W - 40, 50, { fill: f.active ? P.accentSoft : P.surface, rx: 10, stroke: f.active ? P.accent : P.border, sw: f.active ? 1.5 : 1 });
    circle(36, fy + 25, 9, 'none', { stroke: f.active ? P.accent : P.borderMid, sw: 1.5 });
    if (f.active) circle(36, fy + 25, 5, P.accent);
    text(54, fy + 18, f.label, 14, P.text, { fw: 600 });
    text(54, fy + 36, f.sub, 11, P.textMid);
  });

  // Include selector
  text(20, 348, 'INCLUDE', 10, P.textLow, { fw: 700, ls: '0.08em' });
  const includes = [
    { label: 'Journal entries (147)', checked: true },
    { label: 'Research threads (23)', checked: true },
    { label: 'AI syntheses (8)', checked: true },
    { label: 'Source bibliography', checked: false },
  ];
  includes.forEach((inc, i) => {
    const iy = 364 + i * 48;
    card(20, iy, W - 40, 40, { rx: 10 });
    rect(36, iy + 12, 16, 16, inc.checked ? P.accent : P.surface2, { rx: 4 });
    if (inc.checked) text(44, iy + 16, '✓', 11, P.white, { anchor: 'middle', fw: 700 });
    text(62, iy + 20, inc.label, 13, P.text, { fw: 400 });
  });

  // Preview card
  const pvy = 568;
  card(20, pvy, W - 40, 100, { fill: P.surface2, rx: 12 });
  text(36, pvy + 18, 'PREVIEW', 10, P.textLow, { fw: 700, ls: '0.06em' });
  serifHeadline(36, pvy + 40, ['Research Compendium'], 18, P.text, { fw: 600 });
  text(36, pvy + 66, 'April 2026  ·  178 pages  ·  6 sources cited', 11, P.textMid);
  text(W - 36, pvy + 80, 'Preview →', 12, P.accent, { anchor: 'end', fw: 600 });

  // Export CTA
  const cy = 680;
  rect(20, cy, W - 40, 52, P.ink, { rx: 14 });
  text(W / 2, cy + 19, 'Export Now', 16, P.white, { anchor: 'middle', fw: 700 });
  text(W / 2, cy + 38, 'Your PDF will be ready in ~20 seconds', 11, 'rgba(255,255,255,0.5)', { anchor: 'middle' });

  navBar(780);
  return elements.length;
}

// ─── BUILD + WRITE ──────────────────────────────────────────────────────────
const screens = [
  { name: 'Journal Dashboard', fn: buildScreen1 },
  { name: 'New Entry',         fn: buildScreen2 },
  { name: 'Research Thread',   fn: buildScreen3 },
  { name: 'Source Detail',     fn: buildScreen4 },
  { name: 'AI Synthesis',      fn: buildScreen5 },
  { name: 'Export',            fn: buildScreen6 },
];

function buildSVG(els) {
  const defs = `<defs>
    <filter id="shadow-sm"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-opacity="0.06"/></filter>
    <filter id="shadow-md"><feDropShadow dx="0" dy="2" stdDeviation="6" flood-opacity="0.10"/></filter>
  </defs>`;
  const svgEls = els.map(el => {
    const op = el.opacity !== undefined ? ` opacity="${el.opacity}"` : '';
    if (el.type === 'rect') {
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}"${el.rx ? ` rx="${el.rx}"` : ''}${el.stroke ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"` : ''}${op}/>`;
    }
    if (el.type === 'text') {
      const fw = el.fontWeight ? ` font-weight="${el.fontWeight}"` : '';
      const ff = el.fontFamily ? ` font-family="${el.fontFamily}"` : ' font-family="system-ui,sans-serif"';
      const ta = el.textAnchor ? ` text-anchor="${el.textAnchor}"` : '';
      const ls = el.letterSpacing ? ` letter-spacing="${el.letterSpacing}"` : '';
      return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}"${fw}${ff}${ta}${ls} fill="${el.fill}"${op}>${el.content.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    }
    if (el.type === 'circle') {
      const st = el.stroke ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"` : '';
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}"${st}${op}/>`;
    }
    if (el.type === 'line') {
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"${op}/>`;
    }
    return '';
  }).join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}${svgEls}</svg>`;
}

const builtScreens = screens.map(s => {
  const count = s.fn();
  const svg = buildSVG(elements);
  return { name: s.name, svg, elements: elements.slice(), elementCount: count };
});

const totalEls = builtScreens.reduce((a, s) => a + s.elementCount, 0);

const pen = {
  version: '2.8',
  name: 'CARTE',
  description: 'AI editorial research notebook — warm cream editorial palette, serif revival, bento-style features',
  width: W,
  height: H,
  palette: {
    bg: P.bg, surface: P.surface, text: P.text,
    accent: P.accent, accent2: P.accent2, muted: P.textMid,
  },
  metadata: {
    name: 'CARTE — Think in layers',
    author: 'RAM',
    date: new Date().toISOString().slice(0, 10),
    theme: 'light',
    heartbeat: 330,
    elements: totalEls,
    slug: SLUG,
    inspired_by: 'Serif revival on minimal.gallery + AI-native product category on land-book.com',
  },
  screens: builtScreens.map(s => ({
    id: s.name.toLowerCase().replace(/\s+/g, '-'),
    name: s.name,
    width: W,
    height: H,
    svg: s.svg,
    elements: s.elements,
  })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`CARTE: 6 screens, ${totalEls} elements`);
console.log(`Written: ${SLUG}.pen`);
