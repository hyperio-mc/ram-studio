#!/usr/bin/env node
// Ligature — The Reading OS
// Inspired by: "OS for X" naming trend (Codegen: OS for Code Agents, Sanity: Content OS)
// seen on Landbook 2026-03-25 + "Litbix for book lovers" on minimal.gallery
// Theme: LIGHT (previous Podium was dark)

const fs = require('fs');
const path = require('path');

const W = 390, H = 844;

// Light palette — warm editorial
const C = {
  bg:       '#FAF8F5',
  surface:  '#FFFFFF',
  surfaceAlt:'#F3F0EB',
  text:     '#1C1917',
  textSub:  '#78716C',
  accent:   '#C9853A',   // amber-gold — ink on paper feel
  accent2:  '#4A7C6F',   // muted teal — bookmark green
  rule:     '#E5E0D8',
  badge:    '#FFF3E4',
  badgeText:'#A05A1E',
};

// ── helpers ──────────────────────────────────────────────────────────────────

function screen(id, label, els) {
  return { id, label, width: W, height: H, backgroundColor: C.bg, elements: els };
}

function rect(x, y, w, h, fill, r = 0) {
  return { type: 'rectangle', x, y, width: w, height: h, fill, cornerRadius: r, stroke: 'none', strokeWidth: 0 };
}

function text(x, y, w, str, size, color, weight = 'regular', align = 'left', lineH = 1.3) {
  return { type: 'text', x, y, width: w, content: str, fontSize: size, color, fontWeight: weight, textAlign: align, lineHeight: lineH };
}

function circle(x, y, r, fill) {
  return { type: 'ellipse', x: x - r, y: y - r, width: r * 2, height: r * 2, fill, stroke: 'none' };
}

function pill(x, y, w, h, fill, label, labelColor, fontSize = 11) {
  return [
    rect(x, y, w, h, fill, h / 2),
    text(x, y + (h - fontSize) / 2, w, label, fontSize, labelColor, 'medium', 'center'),
  ];
}

function progressBar(x, y, w, h, pct, track, fill, r = h / 2) {
  return [
    rect(x, y, w, h, track, r),
    rect(x, y, Math.round(w * pct), h, fill, r),
  ];
}

function rule(y, x = 20) {
  return rect(x, y, W - x * 2, 1, C.rule);
}

function icon(x, y, name, color, size = 18) {
  // placeholder square/symbol for icons
  const shapes = {
    book:     '▤',
    bookmark: '⊟',
    star:     '★',
    search:   '⌕',
    home:     '⌂',
    chart:    '▦',
    note:     '≡',
    settings: '⚙',
    plus:     '+',
    back:     '←',
    quote:    '"',
    clock:    '◷',
    check:    '✓',
    highlight:'▨',
    tag:      '◈',
  };
  return text(x, y, size + 4, shapes[name] || '·', size, color, 'regular', 'center');
}

// ── nav bar ───────────────────────────────────────────────────────────────────
function navBar(activeId) {
  const tabs = [
    { id: 'library', label: 'Library', ico: 'book' },
    { id: 'reading', label: 'Reading', ico: 'bookmark' },
    { id: 'notes',   label: 'Notes',   ico: 'note' },
    { id: 'stats',   label: 'Stats',   ico: 'chart' },
  ];
  const tabW = W / tabs.length;
  const els = [
    rect(0, H - 80, W, 80, C.surface),
    rect(0, H - 80, W, 1, C.rule),
  ];
  tabs.forEach((t, i) => {
    const cx = i * tabW + tabW / 2;
    const active = t.id === activeId;
    const col = active ? C.accent : C.textSub;
    els.push(...[
      icon(cx - 11, H - 66, t.ico, col, 20),
      text(cx - 24, H - 42, 48, t.label, 10, col, active ? 'semibold' : 'regular', 'center'),
    ]);
    if (active) {
      els.push(rect(cx - 16, H - 72, 32, 3, C.accent, 1.5));
    }
  });
  return els;
}

// ── status bar ────────────────────────────────────────────────────────────────
function statusBar() {
  return [
    rect(0, 0, W, 44, C.bg),
    text(20, 14, 60, '9:41', 15, C.text, 'semibold'),
    text(W - 70, 14, 60, '●●● ■', 13, C.textSub, 'regular', 'right'),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Library (Home)
// ═══════════════════════════════════════════════════════════════════════════════
function screenLibrary() {
  const els = [
    rect(0, 0, W, H, C.bg),
    ...statusBar(),

    // Header
    text(20, 56, 200, 'Your Library', 26, C.text, 'bold'),
    text(20, 88, 260, '12 books · 4 in progress', 13, C.textSub),
    icon(W - 50, 54, 'search', C.text, 22),

    // Currently Reading label
    text(20, 120, 150, 'CURRENTLY READING', 10, C.textSub, 'semibold'),

    // Featured book card
    rect(20, 138, W - 40, 160, C.surface, 16),
    rect(20, 138, W - 40, 160, C.rule, 16),   // border sim
    rect(21, 139, W - 42, 158, C.surface, 16),

    // Book spine / cover
    rect(32, 150, 80, 120, C.surfaceAlt, 8),
    rect(32, 150, 6, 120, C.accent, 0),  // spine
    text(36, 182, 68, '哲\n学', 28, C.accent, 'bold', 'center'),

    // Book info
    text(128, 152, 210, 'The Philosophy of\nModern Design', 16, C.text, 'semibold', 'left', 1.25),
    text(128, 192, 210, 'Alain de Botton', 12, C.textSub),
    // progress
    text(128, 212, 60, '64% read', 11, C.accent, 'semibold'),
    ...progressBar(128, 230, 210, 5, 0.64, C.surfaceAlt, C.accent),
    text(128, 242, 210, 'Est. 2h 40m left', 10, C.textSub),
    icon(W - 44, 264, 'bookmark', C.accent2, 18),

    // Up Next label
    text(20, 318, 150, 'UP NEXT', 10, C.textSub, 'semibold'),

    // Book row 1
    ...bookRow(20, 336, 'Thinking, Fast and Slow', 'Daniel Kahneman', 0.0, C.accent2),
    rule(386),
    // Book row 2
    ...bookRow(20, 396, 'The Creative Act', 'Rick Rubin', 1.0, C.accent),
    rule(446),
    // Book row 3
    ...bookRow(20, 456, 'Flow: The Psychology', 'Mihaly Csikszentmihalyi', 0.3, C.textSub),

    // Want to Read label
    text(20, 500, 200, 'WANT TO READ', 10, C.textSub, 'semibold'),

    // Horizontal shelf
    ...miniBookShelf(20, 518),

    ...navBar('library'),
  ];
  return screen('library', 'Library', els);
}

function bookRow(x, y, title, author, pct, accentCol) {
  const els = [
    rect(x, y, 48, 60, C.surfaceAlt, 6),
    rect(x, y, 4, 60, accentCol, 0),
    text(x + 56, y + 4, W - x - 76, title, 14, C.text, 'semibold'),
    text(x + 56, y + 24, 200, author, 12, C.textSub),
  ];
  if (pct > 0 && pct < 1) {
    els.push(...progressBar(x + 56, y + 44, 180, 4, pct, C.surfaceAlt, accentCol));
    els.push(text(x + 244, y + 38, 60, `${Math.round(pct * 100)}%`, 10, accentCol, 'semibold'));
  } else if (pct === 1.0) {
    els.push(text(x + 56, y + 42, 60, '✓ Finished', 11, C.accent2, 'semibold'));
  } else {
    els.push(text(x + 56, y + 42, 60, 'Not started', 10, C.textSub));
  }
  return els;
}

function miniBookShelf(x, y) {
  const colors = [C.accent, '#B07AA1', '#8FAADC', C.accent2, '#D4706A'];
  const titles = ['Deep Work', 'Meditations', 'The Iliad', 'Dune', '1984'];
  const els = [];
  colors.forEach((c, i) => {
    const bx = x + i * 68;
    els.push(rect(bx, y, 58, 86, C.surfaceAlt, 8));
    els.push(rect(bx, y, 5, 86, c, 0));
    els.push(text(bx + 10, y + 22, 42, titles[i], 10, C.text, 'semibold', 'left', 1.3));
    els.push(...pill(bx + 6, y + 66, 46, 16, C.badge, '+ Add', C.badgeText, 9));
  });
  return els;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Active Reading View
// ═══════════════════════════════════════════════════════════════════════════════
function screenReading() {
  const els = [
    rect(0, 0, W, H, C.surface),
    ...statusBar(),

    // Top bar
    icon(16, 54, 'back', C.text, 20),
    text(50, 54, W - 100, 'The Philosophy of Modern Design', 13, C.text, 'semibold', 'center'),
    icon(W - 44, 54, 'bookmark', C.accent2, 20),

    // Chapter + progress
    text(20, 84, 240, 'Chapter 7 — The Art of Slowness', 12, C.textSub, 'medium'),
    ...progressBar(20, 106, W - 40, 4, 0.64, C.surfaceAlt, C.accent),
    text(W - 50, 100, 40, '64%', 10, C.accent, 'semibold', 'right'),

    rule(118),

    // Reading body text — with a highlighted passage
    text(28, 134, W - 56,
      'There is a profound pleasure in the deliberate act of reading — one that demands we resist the tyranny of the immediate.',
      16, C.text, 'regular', 'left', 1.65),

    // Highlighted passage block
    rect(20, 228, W - 40, 96, '#FFF5E6', 8),
    rect(20, 228, 4, 96, C.accent, 0),
    text(32, 238, W - 60,
      '"The book is the only medium that requires the reader to construct the world in their own image."',
      15, C.text, 'regular', 'left', 1.6),
    icon(W - 44, 298, 'highlight', C.accent, 16),

    // More body text
    text(28, 340, W - 56,
      'We return to the same passages not because we have forgotten, but because we have changed — and the text reveals something new in consequence.',
      16, C.text, 'regular', 'left', 1.65),

    text(28, 436, W - 56,
      'Annotation is not defacement of the page but rather the opening of a dialogue across time with an author long gone.',
      16, C.text, 'regular', 'left', 1.65),

    // Floating annotation toolbar
    rect(60, 572, W - 120, 52, C.text, 26),
    ...toolbarIcon(88,  590, '▨', '#FFD580', 'Highlight'),
    ...toolbarIcon(150, 590, '≡', '#FFFFFF', 'Note'),
    ...toolbarIcon(212, 590, '"', '#A8D8B0', 'Quote'),
    ...toolbarIcon(274, 590, '⊟', '#FFFFFF', 'Bookmark'),

    // Page number
    text(0, 640, W, 'p. 187 of 312', 11, C.textSub, 'regular', 'center'),

    rule(660),

    // Bottom controls
    text(30, 672, 60, 'Aa', 20, C.textSub, 'medium'),
    text(0, 668, W, '◀  ▶', 22, C.text, 'regular', 'center'),
    icon(W - 50, 668, 'clock', C.textSub, 20),

    ...navBar('reading'),
  ];
  return screen('reading', 'Reading View', els);
}

function toolbarIcon(x, y, sym, col, label) {
  return [
    text(x - 12, y, 28, sym, 18, col, 'regular', 'center'),
    text(x - 18, y + 22, 40, label, 8, 'rgba(255,255,255,0.55)', 'regular', 'center'),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Notes & Highlights
// ═══════════════════════════════════════════════════════════════════════════════
function screenNotes() {
  const els = [
    rect(0, 0, W, H, C.bg),
    ...statusBar(),

    text(20, 56, 200, 'Notes', 26, C.text, 'bold'),
    text(20, 88, 300, '47 annotations across 8 books', 13, C.textSub),

    // Filter tabs
    ...filterTabs(20, 112, ['All', 'Highlights', 'Notes', 'Quotes'], 0),

    rule(154),

    // Note card 1 — highlight
    ...noteCard(20, 166, 'highlight',
      'The Philosophy of Modern Design',
      '"The book is the only medium that requires the reader to construct the world in their own image."',
      'p.187  ·  3 days ago', C.accent, '#FFF5E6'),

    // Note card 2 — user note
    ...noteCard(20, 316, 'note',
      'Thinking, Fast and Slow',
      'System 1 vs System 2 — connect this to Cal Newport\'s idea of deep work as training System 2 to dominate.',
      'Ch.3  ·  1 week ago', '#8FAADC', '#F0F4FF'),

    // Note card 3 — quote
    ...noteCard(20, 460, 'quote',
      'Meditations — Marcus Aurelius',
      '"You have power over your mind, not outside events. Realize this, and you will find strength."',
      'Book IV  ·  2 weeks ago', C.accent2, '#F0F7F5'),

    text(0, 628, W, '— 44 more annotations —', 12, C.textSub, 'regular', 'center'),

    ...navBar('notes'),
  ];
  return screen('notes', 'Notes & Highlights', els);
}

function filterTabs(x, y, labels, activeIdx) {
  const els = [];
  let cx = x;
  labels.forEach((l, i) => {
    const w = l.length * 8.5 + 24;
    const active = i === activeIdx;
    els.push(rect(cx, y, w, 32, active ? C.accent : C.surfaceAlt, 16));
    els.push(text(cx, y + 8, w, l, 12, active ? '#FFFFFF' : C.textSub, active ? 'semibold' : 'regular', 'center'));
    cx += w + 8;
  });
  return els;
}

function noteCard(x, y, type, bookTitle, body, meta, accentCol, bgCol) {
  const h = 136;
  const typeIcons = { highlight: '▨', note: '≡', quote: '"' };
  return [
    rect(x, y, W - 40, h, bgCol, 12),
    rect(x, y, 4, h, accentCol, 0),
    text(x + 14, y + 10, 20, typeIcons[type] || '·', 14, accentCol, 'bold'),
    text(x + 14, y + 30, W - 70, bookTitle, 11, C.textSub, 'semibold'),
    text(x + 14, y + 48, W - 70, body, 13, C.text, 'regular', 'left', 1.5),
    text(x + 14, y + h - 22, 200, meta, 10, C.textSub),
    icon(W - 36, y + 10, 'tag', accentCol, 14),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Reading Stats
// ═══════════════════════════════════════════════════════════════════════════════
function screenStats() {
  const els = [
    rect(0, 0, W, H, C.bg),
    ...statusBar(),

    text(20, 56, 200, 'Reading Stats', 26, C.text, 'bold'),
    text(20, 88, 300, 'March 2026 · On pace for 28 books', 13, C.textSub),

    // Big metric
    rect(20, 112, W - 40, 120, C.surface, 16),
    text(0, 130, W, '14,820', 48, C.accent, 'bold', 'center', 1),
    text(0, 184, W, 'pages read this year', 13, C.textSub, 'regular', 'center'),
    ...progressBar(44, 212, W - 88, 8, 0.53, C.surfaceAlt, C.accent, 4),
    text(0, 226, W, '53% of yearly goal', 10, C.textSub, 'regular', 'center'),

    // Stat row
    ...statTile(20, 248, '8', 'books\ncompleted', C.accent),
    ...statTile(W / 2 + 10, 248, '47m', 'avg. session\ntime', C.accent2),

    // Weekly chart label
    text(20, 348, 200, 'PAGES PER DAY · THIS WEEK', 10, C.textSub, 'semibold'),

    // Bar chart
    ...weekChart(20, 370, W - 40, 120),

    // Streak
    rect(20, 508, W - 40, 64, C.surface, 12),
    text(32, 522, 200, '🔥  14-day reading streak', 15, C.text, 'semibold'),
    text(32, 546, 260, 'Read 15+ min today to keep it going', 12, C.textSub),

    // Genres breakdown
    text(20, 590, 200, 'BY GENRE', 10, C.textSub, 'semibold'),
    ...genreBar(20, 610, 'Non-fiction', 0.58, C.accent),
    ...genreBar(20, 638, 'Philosophy', 0.24, C.accent2),
    ...genreBar(20, 666, 'Fiction', 0.18, '#B07AA1'),

    ...navBar('stats'),
  ];
  return screen('stats', 'Reading Stats', els);
}

function statTile(x, y, val, label, col) {
  const w = W / 2 - 30;
  return [
    rect(x, y, w, 88, C.surface, 12),
    text(x, y + 14, w, val, 36, col, 'bold', 'center'),
    text(x, y + 54, w, label, 11, C.textSub, 'regular', 'center', 1.35),
  ];
}

function weekChart(x, y, w, h) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const vals = [0.45, 0.72, 0.38, 0.9, 0.55, 1.0, 0.6];
  const bw = (w - 6 * 8) / 7;
  const els = [];
  days.forEach((d, i) => {
    const bx = x + i * (bw + 8);
    const bh = Math.round((h - 30) * vals[i]);
    const col = vals[i] === 1.0 ? C.accent : (vals[i] > 0.6 ? C.surfaceAlt : C.surfaceAlt);
    const barCol = vals[i] === 1.0 ? C.accent : (vals[i] >= 0.6 ? '#E8C898' : C.rule);
    els.push(rect(bx, y + h - 30 - bh, bw, bh, barCol, 4));
    els.push(text(bx, y + h - 20, bw, d, 9, C.textSub, 'regular', 'center'));
  });
  return els;
}

function genreBar(x, y, label, pct, col) {
  return [
    text(x, y, 120, label, 12, C.text, 'medium'),
    ...progressBar(x + 130, y + 2, W - x - 150, 10, pct, C.surfaceAlt, col, 5),
    text(W - 40, y - 2, 30, `${Math.round(pct * 100)}%`, 11, col, 'semibold', 'right'),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Book Detail / Onboarding
// ═══════════════════════════════════════════════════════════════════════════════
function screenBookDetail() {
  const els = [
    rect(0, 0, W, H, C.surface),
    ...statusBar(),

    // Cover hero
    rect(0, 44, W, 220, C.surfaceAlt),
    rect(0, 44, W, 220, 'linear-gradient(180deg,#FAF8F500,#FAF8F5)', 0),

    // Large cover
    rect(W / 2 - 60, 56, 120, 178, C.bg, 10),
    rect(W / 2 - 60, 56, 8, 178, C.accent, 0),
    text(W / 2 - 52, 98, 104, '哲\n学', 36, C.accent, 'bold', 'center'),

    // Back button
    rect(12, 52, 36, 36, 'rgba(255,255,255,0.8)', 18),
    icon(12, 56, 'back', C.text, 18),

    // Book info
    text(20, 274, W - 40, 'The Philosophy of Modern Design', 22, C.text, 'bold', 'left', 1.2),
    text(20, 318, W - 40, 'Alain de Botton  ·  312 pages  ·  2021', 13, C.textSub),

    // Stars
    text(20, 342, 120, '★★★★★', 14, C.accent),
    text(86, 344, 60, '4.8', 12, C.textSub),

    // Tags
    ...pill(20, 368, 90, 26, C.badge, 'Non-fiction', C.badgeText, 11),
    ...pill(118, 368, 78, 26, C.badge, 'Philosophy', C.badgeText, 11),
    ...pill(204, 368, 72, 26, C.badge, 'Design', C.badgeText, 11),

    rule(406),

    // Description
    text(20, 418, W - 40,
      'A meditative journey through the principles that have shaped our designed world — from architecture to typography, from industrial form to the aesthetics of everyday objects.',
      14, C.text, 'regular', 'left', 1.6),

    // Progress section
    text(20, 520, 150, 'YOUR PROGRESS', 10, C.textSub, 'semibold'),
    ...progressBar(20, 540, W - 40, 8, 0.64, C.surfaceAlt, C.accent, 4),
    text(20, 556, 120, '64%  ·  p. 187 of 312', 12, C.accent, 'medium'),
    text(W - 20, 556, 100, '2h 40m left', 12, C.textSub, 'regular', 'right'),

    // Annotations
    rect(20, 580, W - 40, 44, C.surfaceAlt, 10),
    text(32, 594, 200, '12 annotations in this book', 13, C.text, 'medium'),
    icon(W - 44, 592, 'note', C.accent2, 18),

    // CTA
    rect(20, 640, W - 40, 52, C.accent, 26),
    text(20, 652, W - 40, 'Continue Reading', 16, '#FFFFFF', 'semibold', 'center'),

    ...navBar('library'),
  ];
  return screen('bookdetail', 'Book Detail', els);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ASSEMBLE
// ═══════════════════════════════════════════════════════════════════════════════

const pen = {
  version: '2.8',
  name: 'Ligature — The Reading OS',
  description: 'Light-mode reading OS for serious readers. Inspired by "OS for X" trend on Landbook (Codegen: OS for Code Agents) + Litbix on minimal.gallery.',
  screens: [
    screenLibrary(),
    screenReading(),
    screenNotes(),
    screenStats(),
    screenBookDetail(),
  ],
};

const outPath = path.join(__dirname, 'ligature.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ Written: ${outPath} (${pen.screens.length} screens)`);
