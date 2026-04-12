'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG  = 'roman';
const NAME  = 'ROMAN';
const THEME = 'light';
const HB    = 99; // heartbeat number

// ─── Palette (warm editorial light) ───────────────────────────────────────────
const P = {
  bg:      '#FAF7F2',   // warm cream
  surf:    '#FFFFFF',   // pure white
  card:    '#F5F0E8',   // book-paper warm
  card2:   '#EEE8DC',   // deeper card
  text:    '#1C1814',   // warm near-black
  sub:     '#4A4238',   // secondary text
  muted:   '#9C9086',   // muted warm gray
  accent:  '#4A3728',   // walnut brown
  accent2: '#6B8F5E',   // sage green
  tag:     '#C8B89A',   // tan for tags
  border:  '#DDD5C8',   // warm border
  line:    '#E8E1D6',   // soft divider
  red:     '#B85C3A',   // terracotta
  gold:    '#C49A3C',   // warm gold
};

// ─── Element helpers ────────────────────────────────────────────────────────────
const elements = [];
function el(e) { elements.push(e); return e; }

function rect(x, y, w, h, fill, opts = {}) {
  return el({
    type: 'rect', x, y, width: w, height: h, fill,
    rx: opts.rx ?? 0, opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none', strokeWidth: opts.sw ?? 0,
  });
}
function text(x, y, content, size, fill, opts = {}) {
  return el({
    type: 'text', x, y, content, fontSize: size, fill,
    fontWeight: opts.fw ?? 400,
    fontFamily: opts.font ?? 'Georgia, "Times New Roman", serif',
    textAnchor: opts.anchor ?? 'start',
    letterSpacing: opts.ls ?? 0,
    opacity: opts.opacity ?? 1,
  });
}
function circle(cx, cy, r, fill, opts = {}) {
  return el({
    type: 'circle', cx, cy, r, fill,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none', strokeWidth: opts.sw ?? 0,
  });
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return el({
    type: 'line', x1, y1, x2, y2, stroke,
    strokeWidth: opts.sw ?? 1, opacity: opts.opacity ?? 1,
  });
}

// ─── Reusable components ────────────────────────────────────────────────────────
const W = 390, H = 844;

function statusBar(yOff = 0) {
  rect(0, yOff, W, 44, P.bg);
  text(20, yOff + 28, '9:41', 13, P.text, { fw: 600, font: '-apple-system, sans-serif' });
  // battery / signal (right side)
  rect(W - 56, yOff + 17, 25, 11, 'none', { rx: 2, stroke: P.sub, sw: 1.5 });
  rect(W - 55, yOff + 18, 18, 9, P.text, { rx: 1 });
  rect(W - 30, yOff + 20, 3, 5, P.sub, { rx: 1 });
  circle(W - 100, yOff + 22, 4, 'none', { stroke: P.sub, sw: 1.5 });
  circle(W - 86, yOff + 22, 4, 'none', { stroke: P.sub, sw: 1.5 });
  circle(W - 72, yOff + 22, 4, 'none', { stroke: P.sub, sw: 1.5 });
}

function bottomNav(yOff, activeIdx = 0) {
  rect(0, yOff, W, 82, P.surf, { stroke: P.line, sw: 0.5 });
  const labels = ['Library', 'Discover', 'Reading', 'Stats'];
  const xs     = [49, 130, 211, 292];  // adjusted for 4 tabs
  labels.forEach((lbl, i) => {
    const x    = xs[i] + 26;
    const isAc = i === activeIdx;
    const col  = isAc ? P.accent : P.muted;
    const fw   = isAc ? 600 : 400;
    // icon placeholder — small serif glyph
    const icons = ['❧', '◈', '⊙', '◎'];
    text(xs[i], yOff + 26, icons[i], 16, col, { anchor: 'middle', font: 'Georgia, serif' });
    text(xs[i], yOff + 44, lbl, 10, col, { anchor: 'middle', fw, font: '-apple-system, sans-serif', ls: 0.3 });
    if (isAc) {
      rect(xs[i] - 18, yOff + 4, 36, 2, P.accent, { rx: 1 });
    }
  });
}

// ─── Screen 1: Library ─────────────────────────────────────────────────────────
function screenLibrary() {
  const S = [];
  elements.length = 0;

  // bg
  rect(0, 0, W, H, P.bg);
  statusBar(0);

  // Header
  rect(0, 44, W, 64, P.bg);
  text(20, 82, 'ROMAN', 22, P.text, { fw: 700, font: '-apple-system, sans-serif', ls: 3 });
  // search icon (circle + line)
  circle(355, 72, 12, 'none', { stroke: P.sub, sw: 1.5 });
  line(363, 80, 370, 87, P.sub, { sw: 2 });

  // Section label
  line(20, 116, W - 20, 116, P.line, { sw: 0.5 });
  text(20, 133, 'Currently Reading', 11, P.muted, { fw: 600, font: '-apple-system, sans-serif', ls: 0.8 });
  text(W - 20, 133, '3 books', 11, P.muted, { fw: 400, font: '-apple-system, sans-serif', anchor: 'end' });

  // Active book card — horizontal, wider
  rect(20, 144, W - 40, 120, P.surf, { rx: 8, stroke: P.line, sw: 0.5 });
  // book spine color band
  rect(20, 144, 6, 120, P.accent, { rx: 0 });
  rect(24, 144, 2, 120, P.accent2, {});
  // book cover placeholder
  rect(36, 154, 64, 100, P.card2, { rx: 4 });
  // cover texture lines
  for (let i = 0; i < 5; i++) {
    line(43, 168 + i * 16, 93, 168 + i * 16, P.border, { sw: 0.5 });
  }
  text(68, 207, '📖', 18, P.sub, { anchor: 'middle' });
  // book info
  text(116, 168, 'The Remains of the Day', 13, P.text, { fw: 600 });
  text(116, 184, 'Kazuo Ishiguro', 11, P.muted, { font: '-apple-system, sans-serif' });
  // progress
  text(116, 210, 'Page 187 of 258', 11, P.sub, { font: '-apple-system, sans-serif' });
  rect(116, 220, 218, 4, P.card2, { rx: 2 });
  rect(116, 220, Math.round(218 * 0.72), 4, P.accent, { rx: 2 });
  text(116, 242, '72% complete', 10, P.muted, { font: '-apple-system, sans-serif' });
  text(W - 36, 242, '→', 14, P.accent, { anchor: 'end', fw: 400 });

  // Reading shelf — 2 columns
  line(20, 278, W - 20, 278, P.line, { sw: 0.5 });
  text(20, 294, 'Your Shelf', 11, P.muted, { fw: 600, font: '-apple-system, sans-serif', ls: 0.8 });
  text(W - 20, 294, 'View all', 11, P.accent, { fw: 400, font: '-apple-system, sans-serif', anchor: 'end' });

  // Book grid — 3 columns
  const books = [
    { title: 'Middlemarch',    author: 'G. Eliot',      col: '#8B6F5E', status: '✓' },
    { title: 'Beloved',        author: 'T. Morrison',   col: '#5E7B6B', status: '✓' },
    { title: 'On Earth…',      author: 'J. Eugenides',  col: '#6B5E8B', status: '½' },
    { title: 'Never Let Me Go',author: 'K. Ishiguro',   col: '#7B6B4A', status: '✓' },
    { title: 'The Hours',      author: 'M. Cunningham', col: '#5E7B7B', status: '↓' },
    { title: 'Austerlitz',     author: 'W.G. Sebald',   col: '#8B5E5E', status: '↓' },
  ];
  const bW = 100, bH = 140, bGap = 15, bStartX = 20, bStartY = 304;
  books.forEach((bk, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const bx  = bStartX + col * (bW + bGap);
    const by  = bStartY + row * (bH + 40);
    rect(bx, by, bW, bH, bk.col, { rx: 4 });
    // book spine line
    rect(bx, by, 5, bH, 'rgba(0,0,0,0.2)', { rx: 0 });
    // title on cover
    text(bx + bW / 2, by + bH / 2 - 8, bk.title.slice(0, 12), 10, '#FFFFFF', { anchor: 'middle', fw: 600, font: '-apple-system, sans-serif' });
    text(bx + bW / 2, by + bH / 2 + 8, bk.author, 9, 'rgba(255,255,255,0.75)', { anchor: 'middle', font: '-apple-system, sans-serif' });
    // status badge
    const badgeColors = { '✓': P.accent2, '½': P.gold, '↓': P.muted };
    circle(bx + bW - 12, by + 12, 10, badgeColors[bk.status] || P.muted, { opacity: 0.9 });
    text(bx + bW - 12, by + 17, bk.status, 10, '#fff', { anchor: 'middle', font: '-apple-system, sans-serif', fw: 700 });
  });

  bottomNav(H - 82, 0);
  const svg = buildSVG();
  return { name: 'Library', svg, elements: [...elements] };
}

// ─── Screen 2: Discover ────────────────────────────────────────────────────────
function screenDiscover() {
  elements.length = 0;

  rect(0, 0, W, H, P.bg);
  statusBar(0);

  // Header
  rect(0, 44, W, 64, P.bg);
  text(20, 82, 'Discover', 26, P.text, { fw: 400 }); // elegant serif
  text(W - 20, 82, 'Apr 2026', 13, P.muted, { anchor: 'end', font: '-apple-system, sans-serif' });

  // Divider
  line(20, 110, W - 20, 110, P.line, { sw: 0.5 });

  // Editorial pick — full width hero card
  rect(20, 120, W - 40, 180, P.card, { rx: 8 });
  // decorative top stripe
  rect(20, 120, W - 40, 4, P.accent, { rx: 0 });
  text(36, 144, 'EDITOR\'S PICK', 9, P.accent, { fw: 700, font: '-apple-system, sans-serif', ls: 1.5 });
  text(36, 172, 'The Dispossessed', 22, P.text, { fw: 400 });
  text(36, 192, 'Ursula K. Le Guin', 13, P.muted, { font: '-apple-system, sans-serif' });
  // rating stars
  for (let i = 0; i < 5; i++) {
    text(36 + i * 18, 212, i < 5 ? '★' : '☆', 13, i < 5 ? P.gold : P.muted, { font: '-apple-system, sans-serif' });
  }
  text(126, 212, '4.8 · 12.4k reads', 11, P.muted, { font: '-apple-system, sans-serif' });
  // excerpt
  text(36, 244, '"True journey is return." A masterwork of', 11, P.sub, { font: 'Georgia, serif', fw: 400 });
  text(36, 260, 'utopian fiction and philosophical depth.', 11, P.sub, { font: 'Georgia, serif' });
  // add button
  rect(W - 80, 274, 60, 18, P.accent, { rx: 9 });
  text(W - 50, 286, '+ Add', 10, '#fff', { anchor: 'middle', font: '-apple-system, sans-serif', fw: 600 });

  // Section: Curated Lists
  line(20, 316, W - 20, 316, P.line, { sw: 0.5 });
  text(20, 332, 'Curated Lists', 11, P.muted, { fw: 600, font: '-apple-system, sans-serif', ls: 0.8 });

  // List cards — 2 per row
  const lists = [
    { name: 'Nobel Laureates', count: 24, col: '#7B5E3A' },
    { name: 'Slow Reading',    count: 18, col: '#4A7B5E' },
    { name: 'Under 200 Pages', count: 31, col: '#5E6B8B' },
    { name: 'Prize Winners',   count: 42, col: '#8B5E6B' },
  ];
  lists.forEach((lst, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const lx  = 20 + col * (170 + 10);
    const ly  = 342 + row * 90;
    rect(lx, ly, 170, 78, P.surf, { rx: 8, stroke: P.line, sw: 0.5 });
    rect(lx, ly, 4, 78, lst.col, { rx: 0 });
    text(lx + 16, ly + 30, lst.name, 13, P.text, { fw: 500 });
    text(lx + 16, ly + 48, `${lst.count} books`, 11, P.muted, { font: '-apple-system, sans-serif' });
    text(lx + 150, ly + 48, '→', 13, lst.col, { anchor: 'end' });
  });

  // Section: New This Month
  line(20, 534, W - 20, 534, P.line, { sw: 0.5 });
  text(20, 550, 'New This Month', 11, P.muted, { fw: 600, font: '-apple-system, sans-serif', ls: 0.8 });

  // Horizontal scroll books
  const newBooks = [
    { title: 'Intermezzo',    col: '#6B3A2E' },
    { title: 'James',         col: '#2E5E4A' },
    { title: 'All Fours',     col: '#3A4A6B' },
    { title: 'The Women',     col: '#6B5E2E' },
  ];
  newBooks.forEach((bk, i) => {
    const bx = 20 + i * 88;
    rect(bx, 562, 76, 108, bk.col, { rx: 6 });
    rect(bx, 562, 5, 108, 'rgba(0,0,0,0.15)', {});
    text(bx + 38, 618, bk.title, 9, '#fff', { anchor: 'middle', fw: 600, font: '-apple-system, sans-serif' });
    text(bx + 38, 682, bk.title, 10, P.sub, { anchor: 'middle', font: '-apple-system, sans-serif' });
  });

  // Scroll indicator dots
  for (let i = 0; i < 5; i++) {
    circle(W / 2 - 32 + i * 16, 694, i === 0 ? 4 : 2.5, i === 0 ? P.accent : P.border);
  }

  bottomNav(H - 82, 1);
  const svg = buildSVG();
  return { name: 'Discover', svg, elements: [...elements] };
}

// ─── Screen 3: Reading Session ─────────────────────────────────────────────────
function screenReading() {
  elements.length = 0;

  rect(0, 0, W, H, P.bg);
  statusBar(0);

  // Header
  rect(0, 44, W, 64, P.bg);
  text(20, 82, 'The Remains of the Day', 16, P.text, { fw: 500 });
  text(20, 98, 'Kazuo Ishiguro', 12, P.muted, { font: '-apple-system, sans-serif' });
  // close / settings
  text(W - 20, 82, '×', 22, P.muted, { anchor: 'end' });

  // Book spine accent
  line(20, 110, W - 20, 110, P.line, { sw: 0.5 });

  // Open book visual — editorial illustration
  rect(40, 124, W - 80, 200, P.surf, { rx: 4, stroke: P.line, sw: 0.5 });
  // book center spine
  line(W / 2, 128, W / 2, 320, P.line, { sw: 1.5, opacity: 0.6 });
  // left page
  for (let i = 0; i < 8; i++) {
    const y = 148 + i * 18;
    const w = i === 0 ? 130 : i % 3 === 2 ? 100 : 140;
    rect(52, y, w, 8, P.line, { rx: 2, opacity: 0.5 });
  }
  // right page
  for (let i = 0; i < 8; i++) {
    const y   = 148 + i * 18;
    const w   = i === 7 ? 60 : 140;
    rect(W / 2 + 8, y, w, 8, P.line, { rx: 2, opacity: 0.5 });
  }
  // Page numbers
  text(52, 318, '186', 10, P.muted, { font: '-apple-system, sans-serif' });
  text(W - 52, 318, '187', 10, P.muted, { anchor: 'end', font: '-apple-system, sans-serif' });
  // current quote highlight
  rect(52, 200, 140, 12, P.gold, { rx: 2, opacity: 0.2 });
  text(50, 198, '"', 32, P.card, { fw: 700, opacity: 0.5 });

  // Session timer
  rect(40, 336, W - 80, 80, P.card, { rx: 10 });
  text(W / 2, 362, 'SESSION', 9, P.muted, { anchor: 'middle', fw: 600, font: '-apple-system, sans-serif', ls: 1.5 });
  text(W / 2, 398, '24:17', 38, P.text, { anchor: 'middle', fw: 300, font: 'Georgia, serif' });
  // play/pause controls
  circle(W / 2, 448, 24, P.accent);
  text(W / 2, 456, '⏸', 16, '#fff', { anchor: 'middle', font: '-apple-system, sans-serif' });
  circle(W / 2 - 60, 448, 18, P.card, { stroke: P.border, sw: 1 });
  text(W / 2 - 60, 456, '↺', 14, P.sub, { anchor: 'middle' });
  circle(W / 2 + 60, 448, 18, P.card, { stroke: P.border, sw: 1 });
  text(W / 2 + 60, 456, '✎', 12, P.sub, { anchor: 'middle' });

  // Today's goal
  line(40, 486, W - 40, 486, P.line, { sw: 0.5 });
  text(40, 502, 'Today\'s Goal', 11, P.muted, { fw: 600, font: '-apple-system, sans-serif', ls: 0.8 });
  text(W - 40, 502, '30 min', 11, P.sub, { anchor: 'end', font: '-apple-system, sans-serif' });
  rect(40, 512, W - 80, 6, P.card2, { rx: 3 });
  rect(40, 512, Math.round((W - 80) * 0.81), 6, P.accent2, { rx: 3 });
  text(40, 530, '24 of 30 minutes', 10, P.muted, { font: '-apple-system, sans-serif' });
  text(W - 40, 530, '81%', 10, P.accent2, { anchor: 'end', font: '-apple-system, sans-serif', fw: 600 });

  // Recent highlights
  line(40, 550, W - 40, 550, P.line, { sw: 0.5 });
  text(40, 566, 'Highlights from this session', 11, P.muted, { fw: 600, font: '-apple-system, sans-serif', ls: 0.8 });
  const quotes = [
    '"The evening\'s ceremony had come and gone…"',
    '"There is, after all, a dignity in that."',
  ];
  quotes.forEach((q, i) => {
    rect(40, 576 + i * 72, W - 80, 60, P.surf, { rx: 6, stroke: P.line, sw: 0.5 });
    rect(40, 576 + i * 72, 3, 60, P.gold, {});
    text(52, 598 + i * 72, q, 11, P.sub, { font: 'Georgia, serif' });
    text(52, 616 + i * 72, 'p. ' + (180 + i * 4), 10, P.muted, { font: '-apple-system, sans-serif' });
  });

  bottomNav(H - 82, 2);
  const svg = buildSVG();
  return { name: 'Reading', svg, elements: [...elements] };
}

// ─── Screen 4: Stats ──────────────────────────────────────────────────────────
function screenStats() {
  elements.length = 0;

  rect(0, 0, W, H, P.bg);
  statusBar(0);

  // Header
  rect(0, 44, W, 64, P.bg);
  text(20, 82, 'Reading Life', 26, P.text, { fw: 400 });
  text(W - 20, 82, '2026', 13, P.muted, { anchor: 'end', font: '-apple-system, sans-serif' });

  line(20, 112, W - 20, 112, P.line, { sw: 0.5 });

  // Hero stat — annual reading
  rect(20, 122, W - 40, 100, P.card, { rx: 10 });
  text(W / 2, 158, '18', 52, P.text, { anchor: 'middle', fw: 300, font: 'Georgia, serif' });
  text(W / 2, 180, 'books read this year', 12, P.muted, { anchor: 'middle', font: '-apple-system, sans-serif' });
  text(W / 2, 200, '↑ 4 more than 2025', 11, P.accent2, { anchor: 'middle', font: '-apple-system, sans-serif', fw: 500 });

  // Four stats row
  const stats = [
    { label: 'Pages',    value: '4,218', sub: 'this year' },
    { label: 'Avg. days', value: '12.4', sub: 'per book' },
    { label: 'Hours',    value: '186',   sub: 'reading time' },
    { label: 'Streak',   value: '23',    sub: 'day streak' },
  ];
  const sW = (W - 40 - 15) / 4;
  stats.forEach((s, i) => {
    const sx = 20 + i * (sW + 5);
    rect(sx, 240, sW, 72, P.surf, { rx: 8, stroke: P.line, sw: 0.5 });
    text(sx + sW / 2, 266, s.value, 18, P.text, { anchor: 'middle', fw: 600 });
    text(sx + sW / 2, 282, s.label, 9, P.muted, { anchor: 'middle', fw: 500, font: '-apple-system, sans-serif' });
    text(sx + sW / 2, 298, s.sub, 8, P.tag, { anchor: 'middle', font: '-apple-system, sans-serif' });
  });

  // Monthly bars chart
  line(20, 330, W - 20, 330, P.line, { sw: 0.5 });
  text(20, 346, 'Books per Month', 11, P.muted, { fw: 600, font: '-apple-system, sans-serif', ls: 0.8 });

  const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const reads  = [2, 1, 2, 3, 2, 1, 2, 1, 2, 2, 0, 0]; // current year
  const maxH   = 60, barW = 22, startX = 20, barY = 420;

  months.forEach((m, i) => {
    const bx   = startX + i * (barW + 5.5);
    const bH   = reads[i] > 0 ? Math.round((reads[i] / 3) * maxH) : 4;
    const isCurrent = i === 3;
    rect(bx, barY - bH, barW, bH, isCurrent ? P.accent : P.card2, { rx: 3 });
    if (isCurrent) rect(bx, barY - bH, barW, bH, P.accent, { rx: 3, opacity: 1 });
    text(bx + barW / 2, barY + 14, m, 9, P.muted, { anchor: 'middle', font: '-apple-system, sans-serif' });
    if (reads[i] > 0) {
      text(bx + barW / 2, barY - bH - 6, String(reads[i]), 9, isCurrent ? P.accent : P.sub, { anchor: 'middle', font: '-apple-system, sans-serif', fw: isCurrent ? 600 : 400 });
    }
  });

  // Genres breakdown
  line(20, 452, W - 20, 452, P.line, { sw: 0.5 });
  text(20, 468, 'By Genre', 11, P.muted, { fw: 600, font: '-apple-system, sans-serif', ls: 0.8 });

  const genres = [
    { label: 'Literary Fiction', pct: 55, col: P.accent },
    { label: 'Science Fiction',  pct: 22, col: P.accent2 },
    { label: 'Biography',        pct: 13, col: P.gold },
    { label: 'Essays',           pct: 10, col: P.red },
  ];
  genres.forEach((g, i) => {
    const gy = 480 + i * 38;
    text(20, gy + 12, g.label, 12, P.text, {});
    text(W - 20, gy + 12, `${g.pct}%`, 12, P.sub, { anchor: 'end', fw: 500, font: '-apple-system, sans-serif' });
    rect(20, gy + 18, W - 40, 5, P.card2, { rx: 2 });
    rect(20, gy + 18, Math.round((W - 40) * g.pct / 100), 5, g.col, { rx: 2 });
  });

  // Pace indicator
  line(20, 642, W - 20, 642, P.line, { sw: 0.5 });
  rect(20, 652, W - 40, 50, P.card, { rx: 8 });
  text(36, 678, 'At this pace:', 11, P.muted, { font: '-apple-system, sans-serif' });
  text(140, 678, '53 books by year-end', 13, P.accent, { fw: 500 });

  bottomNav(H - 82, 3);
  const svg = buildSVG();
  return { name: 'Stats', svg, elements: [...elements] };
}

// ─── Screen 5: Book Detail ─────────────────────────────────────────────────────
function screenBookDetail() {
  elements.length = 0;

  rect(0, 0, W, H, P.bg);
  statusBar(0);

  // Back button
  rect(0, 44, W, 48, P.bg);
  text(20, 72, '← Library', 13, P.accent, { fw: 500, font: '-apple-system, sans-serif' });
  text(W - 20, 72, '⋯', 20, P.muted, { anchor: 'end' });

  // Book cover — full width editorial style
  rect(0, 94, W, 220, P.card, {});
  // Book cover art simulation — geometric
  const coverBg = '#3A2E24';
  rect(W / 2 - 72, 108, 144, 192, coverBg, { rx: 4 });
  rect(W / 2 - 72, 108, 8, 192, 'rgba(255,255,255,0.08)', {});
  // cover design — concentric rings
  for (let i = 0; i < 5; i++) {
    circle(W / 2, 204, 20 + i * 16, 'none', { stroke: 'rgba(200,184,154,0.25)', sw: 1 });
  }
  text(W / 2, 188, 'The Remains', 14, P.tag, { anchor: 'middle', fw: 600, font: '-apple-system, sans-serif', ls: 0.5 });
  text(W / 2, 208, 'of the Day', 14, P.tag, { anchor: 'middle', fw: 600, font: '-apple-system, sans-serif', ls: 0.5 });
  text(W / 2, 236, 'KAZUO ISHIGURO', 9, 'rgba(200,184,154,0.6)', { anchor: 'middle', ls: 2, font: '-apple-system, sans-serif' });
  // Add to shelf prompt
  rect(W / 2 + 52, 118, 68, 26, P.accent, { rx: 13 });
  text(W / 2 + 86, 134, 'Reading', 11, '#fff', { anchor: 'middle', font: '-apple-system, sans-serif', fw: 600 });

  // Info section
  rect(0, 314, W, H - 314 - 82, P.surf);
  text(20, 344, 'The Remains of the Day', 20, P.text, { fw: 400 });
  text(20, 366, 'Kazuo Ishiguro  ·  1989  ·  258 pages', 12, P.muted, { font: '-apple-system, sans-serif' });

  // Rating
  for (let i = 0; i < 5; i++) {
    text(20 + i * 22, 392, '★', 16, i < 4 ? P.gold : P.border, { font: '-apple-system, sans-serif' });
  }
  text(130, 392, '4.2  ·  Booker Prize 1989', 12, P.muted, { font: '-apple-system, sans-serif' });

  // Genre tags
  const tags = ['Literary Fiction', 'British', 'Historical', 'Booker'];
  let tagX = 20;
  tags.forEach(t => {
    const tW = t.length * 7 + 20;
    rect(tagX, 406, tW, 22, P.card, { rx: 11, stroke: P.border, sw: 0.5 });
    text(tagX + tW / 2, 420, t, 10, P.sub, { anchor: 'middle', font: '-apple-system, sans-serif' });
    tagX += tW + 8;
  });

  // Description
  line(20, 442, W - 20, 442, P.line, { sw: 0.5 });
  text(20, 460, 'An aging butler, Stevens, recalls his career', 12, P.sub, { font: 'Georgia, serif' });
  text(20, 478, 'serving a distinguished English household,', 12, P.sub, { font: 'Georgia, serif' });
  text(20, 496, 'questioning duty, dignity, and missed love.', 12, P.sub, { font: 'Georgia, serif' });

  // Reading progress
  line(20, 518, W - 20, 518, P.line, { sw: 0.5 });
  text(20, 534, 'Your Progress', 11, P.muted, { fw: 600, font: '-apple-system, sans-serif', ls: 0.8 });
  text(W - 20, 534, 'Page 187 / 258', 11, P.sub, { anchor: 'end', font: '-apple-system, sans-serif' });
  rect(20, 544, W - 40, 8, P.card2, { rx: 4 });
  rect(20, 544, Math.round((W - 40) * 0.72), 8, P.accent, { rx: 4 });
  text(20, 564, 'Started Mar 28  ·  72% complete  ·  ~2 hrs left', 10, P.muted, { font: '-apple-system, sans-serif' });

  // Highlights count
  rect(20, 578, W - 40, 52, P.card, { rx: 8 });
  text(36, 604, '7 highlights  ·  2 notes', 13, P.text, { fw: 500 });
  text(36, 620, 'Tap to view your annotations →', 11, P.muted, { font: '-apple-system, sans-serif' });

  // Action buttons
  rect(20, 644, (W - 48) / 2, 44, P.accent, { rx: 22 });
  text(20 + (W - 48) / 4, 670, 'Continue Reading', 13, '#fff', { anchor: 'middle', fw: 600, font: '-apple-system, sans-serif' });
  rect(20 + (W - 48) / 2 + 8, 644, (W - 48) / 2, 44, P.card, { rx: 22, stroke: P.border, sw: 1 });
  text(20 + (W - 48) / 2 + 8 + (W - 48) / 4, 670, 'Mark Finished', 13, P.sub, { anchor: 'middle', font: '-apple-system, sans-serif' });

  bottomNav(H - 82, 0);
  const svg = buildSVG();
  return { name: 'Book Detail', svg, elements: [...elements] };
}

// ─── Screen 6: Profile / Identity ─────────────────────────────────────────────
function screenProfile() {
  elements.length = 0;

  rect(0, 0, W, H, P.bg);
  statusBar(0);

  // Header
  rect(0, 44, W, 64, P.bg);
  text(20, 82, 'My Reading Life', 22, P.text, { fw: 400 });
  text(W - 20, 72, '⚙', 20, P.muted, { anchor: 'end' });

  line(20, 112, W - 20, 112, P.line, { sw: 0.5 });

  // Avatar + bio
  circle(W / 2, 162, 38, P.card2);
  text(W / 2, 170, 'EM', 22, P.accent, { anchor: 'middle', fw: 600, font: '-apple-system, sans-serif' });
  text(W / 2, 218, 'Eleanor M.', 18, P.text, { anchor: 'middle', fw: 400 });
  text(W / 2, 238, '"Reading slowly, thoughtfully."', 13, P.muted, { anchor: 'middle', font: 'Georgia, serif' });

  // Key numbers
  const nums = [
    { val: '18', label: 'Read' },
    { val: '12', label: 'To Read' },
    { val: '7',  label: 'Favourites' },
  ];
  nums.forEach((n, i) => {
    const nx = W / 2 - 80 + i * 80;
    text(nx, 270, n.val, 22, P.text, { anchor: 'middle', fw: 600 });
    text(nx, 288, n.label, 10, P.muted, { anchor: 'middle', font: '-apple-system, sans-serif' });
    if (i < 2) line(nx + 40, 260, nx + 40, 290, P.border, { sw: 0.5 });
  });

  // Reading identity card
  line(20, 306, W - 20, 306, P.line, { sw: 0.5 });
  rect(20, 316, W - 40, 84, P.card, { rx: 10 });
  rect(20, 316, 4, 84, P.accent, {});
  text(36, 340, 'Reading Identity', 11, P.muted, { fw: 600, font: '-apple-system, sans-serif', ls: 0.8 });
  text(36, 362, 'The Contemplative Reader', 16, P.text, { fw: 500 });
  text(36, 380, 'You read deeply, slowly, and with care.', 12, P.sub, { font: 'Georgia, serif' });
  text(36, 396, 'Avg. 12 days per book · Prefers literary fiction.', 11, P.muted, { font: '-apple-system, sans-serif' });

  // Reading streaks
  line(20, 414, W - 20, 414, P.line, { sw: 0.5 });
  text(20, 430, 'April 2026', 11, P.muted, { fw: 600, font: '-apple-system, sans-serif', ls: 0.8 });
  text(W - 20, 430, '23-day streak 🔥', 11, P.accent, { anchor: 'end', fw: 500, font: '-apple-system, sans-serif' });

  // Calendar grid — mini heatmap
  const days = Array.from({ length: 30 }, (_, i) => ({
    read: [0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16, 17, 19, 20, 21, 22, 23, 24, 26, 27, 28, 29].includes(i),
    mins: [15, 30, 45, 20, 0, 25, 40, 35, 28, 30, 0, 22, 50, 30, 20, 45, 0, 30, 20, 45, 30, 20, 0, 35, 25, 30][i] || 0,
  }));
  days.forEach((d, i) => {
    const col = i % 7, row = Math.floor(i / 7);
    const dx  = 20 + col * 48, dy = 442 + row * 36;
    const intensity = d.read ? Math.min(1, d.mins / 50) : 0;
    const fill = d.read
      ? `rgba(74,55,40,${0.2 + intensity * 0.8})`
      : P.line;
    rect(dx, dy, 38, 26, fill, { rx: 4 });
    text(dx + 19, dy + 16, String(i + 1), 9, d.read ? (intensity > 0.5 ? '#fff' : P.sub) : P.muted, { anchor: 'middle', font: '-apple-system, sans-serif' });
  });

  // Friends activity
  line(20, 600, W - 20, 600, P.line, { sw: 0.5 });
  text(20, 616, 'Friends Reading', 11, P.muted, { fw: 600, font: '-apple-system, sans-serif', ls: 0.8 });

  const friends = [
    { init: 'JP', book: 'finished Anna Karenina', time: '2h ago' },
    { init: 'SR', book: 'added Demon Copperhead', time: 'yesterday' },
  ];
  friends.forEach((f, i) => {
    const fy = 626 + i * 56;
    circle(36, fy + 20, 16, P.card2);
    text(36, fy + 25, f.init, 11, P.accent, { anchor: 'middle', fw: 600, font: '-apple-system, sans-serif' });
    text(56, fy + 18, f.book, 12, P.text, {});
    text(56, fy + 34, f.time, 10, P.muted, { font: '-apple-system, sans-serif' });
  });

  bottomNav(H - 82, 3);
  const svg = buildSVG();
  return { name: 'Profile', svg, elements: [...elements] };
}

// ─── SVG builder ───────────────────────────────────────────────────────────────
function buildSVG() {
  const parts = elements.map(e => {
    if (e.type === 'rect') {
      return `<rect x="${e.x}" y="${e.y}" width="${e.width}" height="${e.height}" rx="${e.rx||0}" fill="${e.fill}" opacity="${e.opacity??1}" stroke="${e.stroke||'none'}" stroke-width="${e.strokeWidth||0}"/>`;
    }
    if (e.type === 'text') {
      const style = [
        `font-size:${e.fontSize}px`,
        `font-weight:${e.fontWeight||400}`,
        `font-family:${e.fontFamily||'Georgia,serif'}`,
        e.letterSpacing ? `letter-spacing:${e.letterSpacing}px` : '',
      ].filter(Boolean).join(';');
      return `<text x="${e.x}" y="${e.y}" text-anchor="${e.textAnchor||'start'}" fill="${e.fill}" opacity="${e.opacity??1}" style="${style}">${e.content}</text>`;
    }
    if (e.type === 'circle') {
      return `<circle cx="${e.cx}" cy="${e.cy}" r="${e.r}" fill="${e.fill}" opacity="${e.opacity??1}" stroke="${e.stroke||'none'}" stroke-width="${e.strokeWidth||0}"/>`;
    }
    if (e.type === 'line') {
      return `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${e.stroke}" stroke-width="${e.strokeWidth||1}" opacity="${e.opacity??1}"/>`;
    }
    return '';
  }).join('\n  ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">\n  ${parts}\n</svg>`;
}

// ─── Main ──────────────────────────────────────────────────────────────────────
const screens = [
  screenLibrary(),
  screenDiscover(),
  screenReading(),
  screenStats(),
  screenBookDetail(),
  screenProfile(),
];

const totalElements = screens.reduce((s, sc) => s + sc.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    author: 'RAM',
    date: new Date().toISOString().slice(0, 10),
    theme: THEME,
    heartbeat: HB,
    elements: totalElements,
    description: 'Editorial reading tracker — Kinfolk-inspired minimal light UI with warm paper palette, serif type, generous whitespace. Inspired by minimal.gallery and the serif font revival documented on lapa.ninja.',
  },
  screens: screens.map(s => ({
    name: s.name,
    svg: s.svg,
    elements: s.elements,
  })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
