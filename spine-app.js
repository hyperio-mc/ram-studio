'use strict';
// SPINE — Reading Life Tracker · Heartbeat #402 · Light theme
// Inspired by: minimal.gallery (Pellonium micro-graphic + editorial serif revival)
//              lapa.ninja (warm off-white #F5F0E4 replacing pure white, serif comeback)
//              saaspo.com (bento-grid feature cards, one-accent clarity)
const fs   = require('fs');
const path = require('path');

const SLUG      = 'spine';
const NAME      = 'SPINE';
const TAGLINE   = 'your reading life, beautifully tracked';
const HEARTBEAT = 402;
const W = 390, H = 844;

// ─── Palette: Warm Parchment Light ────────────────────────────────────────────
const P = {
  bg:       '#F5F0E4',   // warm parchment
  surf:     '#FFFDF7',   // creamy white surface
  card:     '#EDE8DC',   // parchment card
  cardAlt:  '#E4DDCB',   // slightly deeper card
  text:     '#1A1613',   // dark ink
  textSec:  '#6B6258',   // mid ink / secondary
  accent:   '#C8901A',   // amber gold
  accent2:  '#4A7C59',   // forest green
  muted:    'rgba(26,22,19,0.3)',
  border:   'rgba(26,22,19,0.1)',
  softGold: '#F2DBA0',   // pale amber fill
  coral:    '#B85C38',   // warm coral (for covers)
  indigo:   '#4A5A8A',   // soft indigo (for covers)
  plum:     '#7A5A8A',   // dusty plum (for covers)
};

// ─── Primitives ────────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, o = {}) {
  return { type:'rect', x, y, width:w, height:h, fill,
    rx: o.rx||0, opacity: o.opacity!==undefined?o.opacity:1,
    stroke: o.stroke||'none', strokeWidth: o.sw||1 };
}
function txt(x, y, content, size, fill, o = {}) {
  return { type:'text', x, y, content: String(content), fontSize: size, fill,
    fontWeight: o.fw||400, fontFamily: o.font||'serif',
    textAnchor: o.anchor||'start', letterSpacing: o.ls||0,
    opacity: o.opacity!==undefined?o.opacity:1 };
}
function circle(cx, cy, r, fill, o = {}) {
  return { type:'circle', cx, cy, r, fill,
    opacity: o.opacity!==undefined?o.opacity:1,
    stroke: o.stroke||'none', strokeWidth: o.sw||1 };
}
function line(x1, y1, x2, y2, stroke, o = {}) {
  return { type:'line', x1, y1, x2, y2, stroke,
    strokeWidth: o.sw||1, opacity: o.opacity!==undefined?o.opacity:1 };
}

// ─── Shared Components ─────────────────────────────────────────────────────────
function statusBar(bg) {
  return [
    rect(0, 0, W, 44, bg||P.bg),
    txt(20, 28, '9:41', 13, P.text, { fw:600, font:'sans-serif' }),
    txt(370, 28, '▮▮▮', 9, P.text, { anchor:'end', opacity:0.5, font:'sans-serif' }),
  ];
}

function bottomNav(active) {
  const items = [
    { label:'Library'  },
    { label:'Discover' },
    { label:'Stats'    },
    { label:'Profile'  },
  ];
  const els = [];
  els.push(rect(0, 776, W, 68, P.surf));
  els.push(line(0, 776, W, 776, P.border, { sw:1 }));
  const tw = W / items.length;
  items.forEach((it, i) => {
    const cx = tw * i + tw / 2;
    const isA = i === active;
    const col = isA ? P.accent : P.textSec;
    // icon dot cluster (Pellonium-inspired micro-graphic)
    els.push(circle(cx,     795, isA ? 6 : 5, isA ? P.softGold : 'none'));
    els.push(circle(cx,     795, 3.5, col));
    if (isA) {
      els.push(circle(cx - 6, 800, 1.5, P.accent, { opacity:0.5 }));
      els.push(circle(cx + 6, 800, 1.5, P.accent, { opacity:0.5 }));
      els.push(circle(cx,     803, 1.5, P.accent, { opacity:0.3 }));
    }
    els.push(txt(cx, 818, it.label, 10, col,
      { anchor:'middle', fw: isA ? 600 : 400, font:'sans-serif', ls:0.2 }));
  });
  return els;
}

// Dot-cluster micro-graphic (Pellonium-inspired leitmotif)
function dotCluster(x, y, color, scale=1) {
  const s = scale;
  return [
    circle(x,       y,       3*s, color, { opacity:0.8 }),
    circle(x+7*s,   y-3*s,   2*s, color, { opacity:0.5 }),
    circle(x-6*s,   y-4*s,   1.5*s, color, { opacity:0.4 }),
    circle(x+4*s,   y+6*s,   1.5*s, color, { opacity:0.35 }),
    circle(x-5*s,   y+5*s,   1*s,   color, { opacity:0.25 }),
    circle(x+11*s,  y+3*s,   1*s,   color, { opacity:0.2 }),
  ];
}

// Book cover helper
function bookCover(x, y, w, h, spineCol, bodyCol, rx=6) {
  return [
    rect(x,   y, w,   h, bodyCol, { rx }),
    rect(x,   y, 7,   h, spineCol, { rx:Math.min(rx, 4) }),
    rect(x+12, y+14, w-18, 2, '#FFFFFF', { rx:1, opacity:0.25 }),
    rect(x+12, y+20, w-25, 2, '#FFFFFF', { rx:1, opacity:0.15 }),
    rect(x+12, y+h-22, w-18, 2, '#FFFFFF', { rx:1, opacity:0.15 }),
  ];
}

// Progress bar
function progressBar(x, y, w, h, pct, col, bg, rx=2) {
  return [
    rect(x, y, w,      h, bg,  { rx }),
    rect(x, y, w*pct,  h, col, { rx }),
  ];
}

// Divider
function divider(y, opacity=0.18) {
  return line(24, y, W-24, y, P.text, { sw:1, opacity });
}

// ─── SCREEN 1: Library ─────────────────────────────────────────────────────────
function screen1() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  statusBar().forEach(e => els.push(e));

  // Header area
  els.push(txt(24, 76, 'SPINE', 26, P.text, { fw:800, font:'serif', ls:4 }));
  els.push(txt(24, 96, 'YOUR READING LIFE', 9, P.textSec, { fw:500, font:'sans-serif', ls:2.5 }));
  els.push(txt(W-24, 76, 'Apr 9', 12, P.textSec, { anchor:'end', fw:400, font:'sans-serif' }));
  // Dot cluster decoration in header
  dotCluster(350, 90, P.accent, 0.7).forEach(e => els.push(e));

  // ── Currently Reading Card ──────────────────────────────────────────────────
  els.push(rect(20, 110, 350, 186, P.surf, { rx:16 }));
  els.push(rect(20, 110, 350, 186, 'none', { rx:16, stroke:P.border, sw:1 }));

  els.push(txt(40, 136, 'CURRENTLY READING', 8.5, P.accent,
    { fw:700, font:'sans-serif', ls:1.5 }));

  // Book cover
  bookCover(40, 148, 72, 104, '#3A6249', P.accent2, 8).forEach(e => els.push(e));

  // Book info
  els.push(txt(128, 162, 'The Sentence', 18, P.text, { fw:700, font:'serif' }));
  els.push(txt(128, 180, 'Louise Erdrich', 12, P.textSec, { fw:400, font:'sans-serif' }));
  els.push(rect(128, 192, 1, 28, P.border, { opacity:0 })); // spacer
  els.push(txt(128, 200, 'Chapter 14 · 32 chapters', 10.5, P.textSec,
    { fw:400, font:'sans-serif', opacity:0.75 }));

  // Progress
  progressBar(128, 214, 214, 4, 0.44, P.accent, P.card).forEach(e => els.push(e));
  els.push(txt(128, 230, '44% complete', 10, P.accent, { fw:600, font:'sans-serif' }));
  els.push(txt(342, 230, '≈ 3h left', 10, P.textSec, { anchor:'end', fw:400, font:'sans-serif', opacity:0.65 }));

  // CTA button
  els.push(rect(128, 244, 172, 34, P.accent, { rx:8 }));
  els.push(txt(214, 266, 'Continue reading →', 11, P.surf,
    { anchor:'middle', fw:600, font:'sans-serif' }));

  // ── Week Stats Row ───────────────────────────────────────────────────────────
  els.push(txt(24, 322, 'This Week', 17, P.text, { fw:700, font:'serif' }));
  const weekStats = [
    { v:'3h 20m', l:'time read' },
    { v:'84',     l:'pages' },
    { v:'5 / 7',  l:'day streak' },
  ];
  weekStats.forEach((s, i) => {
    const x = 20 + i * 117;
    els.push(rect(x, 334, 107, 58, P.card, { rx:10 }));
    els.push(txt(x + 53, 357, s.v, 16, P.text, { fw:700, anchor:'middle', font:'serif' }));
    els.push(txt(x + 53, 375, s.l, 9.5, P.textSec, { fw:400, anchor:'middle', font:'sans-serif' }));
    // Dot accent on active stat
    if (i === 2) {
      circle(x + 53, 385, 2.5, P.accent).valueOf(); // marker
      els.push(circle(x + 53, 385, 2.5, P.accent));
    }
  });

  // ── Library Section ──────────────────────────────────────────────────────────
  els.push(txt(24, 416, 'My Library', 17, P.text, { fw:700, font:'serif' }));
  els.push(txt(W-24, 416, 'See all', 12, P.accent, { anchor:'end', fw:500, font:'sans-serif' }));

  const bookData = [
    { body:P.coral,   spine:'#8A4028' },
    { body:P.indigo,  spine:'#3A4A7A' },
    { body:P.plum,    spine:'#5A3A6A' },
    { body:'#7A9A5A', spine:'#5A7A3A' },
    { body:'#A8875A', spine:'#7A6038' },
    { body:'#9B5A5A', spine:'#7A3A3A' },
  ];
  bookData.forEach((b, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const bx = 24 + col * 119;
    const by = 428 + row * 148;
    bookCover(bx, by, 103, 132, b.spine, b.body, 8).forEach(e => els.push(e));
    // Rating dots beneath cover
    [0,1,2,3,4].forEach(d => {
      els.push(circle(bx + 12 + d * 18, by + 142, 3.5,
        d < 4 ? P.accent : P.card));
    });
  });

  bottomNav(0).forEach(e => els.push(e));
  return { name:'Library', svg:'', elements: els };
}

// ─── SCREEN 2: Book Detail ─────────────────────────────────────────────────────
function screen2() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  statusBar().forEach(e => els.push(e));

  // Back + title bar
  els.push(txt(24, 72, '← Back', 13, P.textSec, { fw:400, font:'sans-serif' }));
  els.push(txt(W/2, 72, 'Book Details', 14, P.text,
    { anchor:'middle', fw:600, font:'sans-serif' }));

  // Large book cover area
  els.push(rect(0, 85, W, 220, P.card));
  // Cover centered
  bookCover(130, 100, 130, 188, '#3A6249', P.accent2, 10).forEach(e => els.push(e));
  // Shadow beneath
  els.push(rect(130, 286, 130, 8, '#000000', { rx:4, opacity:0.08 }));

  // Title + meta
  els.push(txt(W/2, 330, 'The Sentence', 22, P.text,
    { anchor:'middle', fw:700, font:'serif' }));
  els.push(txt(W/2, 352, 'Louise Erdrich · 2021', 13, P.textSec,
    { anchor:'middle', fw:400, font:'sans-serif' }));

  // Star rating
  [0,1,2,3,4].forEach(i => {
    els.push(txt(W/2 - 50 + i*24, 374, '★', 16,
      i < 4 ? P.accent : P.card, { anchor:'middle', font:'sans-serif' }));
  });
  els.push(txt(W/2 + 64, 374, '4.0', 12, P.textSec,
    { fw:400, font:'sans-serif', opacity:0.7 }));

  // Divider
  els.push(divider(390));

  // Reading Progress section
  els.push(txt(24, 414, 'Reading Progress', 15, P.text, { fw:700, font:'serif' }));

  // Progress arc (simulated with layered rects)
  // Big progress ring background (circle-like)
  els.push(circle(W/2, 490, 60, P.card));
  els.push(circle(W/2, 490, 60, 'none', { stroke:P.border, sw:1 }));
  // Progress fill (arc approximated as a partial rect)
  els.push(circle(W/2, 490, 48, P.surf));
  // 44% label inside
  els.push(txt(W/2, 486, '44%', 22, P.text, { anchor:'middle', fw:700, font:'serif' }));
  els.push(txt(W/2, 502, 'complete', 10, P.textSec, { anchor:'middle', fw:400, font:'sans-serif' }));
  // Arc markers
  els.push(circle(W/2, 430, 7, P.accent));
  els.push(circle(W/2 + 52, 468, 5, P.softGold));
  // Decorative dot cluster
  dotCluster(W-40, 445, P.accent, 0.6).forEach(e => els.push(e));

  // Stats row
  const pStats = [
    { v:'Ch 14',  l:'current' },
    { v:'189',    l:'pages read' },
    { v:'247',    l:'remaining' },
  ];
  pStats.forEach((s, i) => {
    const x = 20 + i * 117;
    els.push(rect(x, 560, 107, 56, P.surf, { rx:10 }));
    els.push(rect(x, 560, 107, 56, 'none', { rx:10, stroke:P.border, sw:1 }));
    els.push(txt(x+53, 581, s.v, 16, P.text, { fw:700, anchor:'middle', font:'serif' }));
    els.push(txt(x+53, 597, s.l, 10, P.textSec, { fw:400, anchor:'middle', font:'sans-serif' }));
  });

  // Sessions this week
  els.push(txt(24, 640, 'Sessions This Week', 14, P.text, { fw:600, font:'sans-serif' }));
  // 7 day dots
  ['M','T','W','T','F','S','S'].forEach((d, i) => {
    const cx = 40 + i * 46;
    const read = i < 5;
    els.push(circle(cx, 672, 14, read ? P.softGold : P.card));
    if (read) els.push(circle(cx, 672, 8, P.accent));
    els.push(txt(cx, 695, d, 10, P.textSec,
      { anchor:'middle', fw:400, font:'sans-serif' }));
  });

  // Start Session CTA
  els.push(rect(24, 720, 342, 42, P.accent, { rx:10 }));
  els.push(txt(W/2, 746, 'Start Reading Session', 13, P.surf,
    { anchor:'middle', fw:600, font:'sans-serif' }));

  bottomNav(0).forEach(e => els.push(e));
  return { name:'Book Detail', svg:'', elements: els };
}

// ─── SCREEN 3: Reading Session ─────────────────────────────────────────────────
function screen3() {
  const els = [];
  // Deep parchment background for session feel
  els.push(rect(0, 0, W, H, '#F0EBD8'));
  statusBar('#F0EBD8').forEach(e => els.push(e));

  els.push(txt(24, 72, '← End Session', 13, P.textSec, { fw:400, font:'sans-serif' }));
  els.push(txt(W-24, 72, 'Save Note', 13, P.accent, { anchor:'end', fw:600, font:'sans-serif' }));

  // Book info mini
  els.push(txt(W/2, 102, 'The Sentence', 15, P.text,
    { anchor:'middle', fw:700, font:'serif' }));
  els.push(txt(W/2, 120, 'Chapter 14', 11, P.textSec,
    { anchor:'middle', fw:400, font:'sans-serif', opacity:0.7 }));

  // ── Timer (large display) ──
  // Timer ring
  els.push(circle(W/2, 248, 90, P.surf));
  els.push(circle(W/2, 248, 90, 'none', { stroke:P.card, sw:6 }));
  // Progress arc – decorative partial ring
  els.push(circle(W/2, 248, 90, 'none', { stroke:P.accent, sw:6, opacity:0.85 }));
  // Secondary ring detail
  els.push(circle(W/2, 248, 76, 'none', { stroke:P.border, sw:1 }));
  // Dot cluster around ring
  dotCluster(W/2 + 68, 210, P.accent, 0.7).forEach(e => els.push(e));

  // Timer numbers
  els.push(txt(W/2, 236, '24', 52, P.text, { anchor:'middle', fw:700, font:'serif' }));
  els.push(txt(W/2, 266, 'minutes', 12, P.textSec, { anchor:'middle', fw:400, font:'sans-serif' }));

  // Timer controls
  const ctrlY = 360;
  // Pause button
  els.push(circle(W/2 - 52, ctrlY, 26, P.card));
  els.push(txt(W/2 - 52, ctrlY + 5, '⏸', 18, P.textSec, { anchor:'middle', font:'sans-serif' }));
  // Stop button
  els.push(circle(W/2 + 52, ctrlY, 26, P.card));
  els.push(txt(W/2 + 52, ctrlY + 5, '⏹', 18, P.textSec, { anchor:'middle', font:'sans-serif' }));
  // Ambient mode (center small button)
  els.push(circle(W/2, ctrlY, 20, P.softGold));
  els.push(txt(W/2, ctrlY + 5, '◎', 14, P.accent, { anchor:'middle', font:'sans-serif' }));

  // ── Pages ──
  els.push(divider(406));
  els.push(txt(24, 430, 'Pages Read', 14, P.text, { fw:600, font:'sans-serif' }));
  els.push(txt(W-24, 430, 'p. 189 → ', 13, P.textSec, { anchor:'end', font:'sans-serif' }));
  // Page counter input
  els.push(rect(W-110, 418, 90, 30, P.surf, { rx:8 }));
  els.push(rect(W-110, 418, 90, 30, 'none', { rx:8, stroke:P.border, sw:1 }));
  els.push(txt(W-65, 438, '210', 15, P.text, { anchor:'middle', fw:600, font:'serif' }));

  // ── Note / annotation area ──
  els.push(divider(468));
  els.push(txt(24, 490, 'Session Note', 14, P.text, { fw:600, font:'sans-serif' }));
  els.push(rect(24, 502, 342, 100, P.surf, { rx:10 }));
  els.push(rect(24, 502, 342, 100, 'none', { rx:10, stroke:P.border, sw:1 }));
  els.push(txt(36, 526, 'The chapter opens with the ghost of Tookie\'s past —', 11, P.text, { font:'sans-serif', opacity:0.75 }));
  els.push(txt(36, 544, 'a sense of haunting that feels warm rather than cold.', 11, P.text, { font:'sans-serif', opacity:0.75 }));
  els.push(txt(36, 562, 'Erdrich layers grief with dark humor beautifully.', 11, P.text, { font:'sans-serif', opacity:0.75 }));
  // Cursor blink rect
  els.push(rect(36, 570, 1.5, 14, P.accent));

  // Mood tags
  els.push(txt(24, 630, 'How was the read?', 12, P.textSec, { fw:400, font:'sans-serif' }));
  const moods = ['Immersive','Thought-provoking','Slow','Emotional'];
  moods.forEach((m, i) => {
    const tw = 78 + (m.length > 9 ? 10 : 0);
    const tx = 24 + i % 2 * 170;
    const ty = 644 + Math.floor(i / 2) * 38;
    els.push(rect(tx, ty, tw, 28, i === 0 ? P.softGold : P.card, { rx:14 }));
    if (i === 0) els.push(rect(tx, ty, tw, 28, 'none', { rx:14, stroke:P.accent, sw:1 }));
    els.push(txt(tx + tw/2, ty + 19, m, 10.5, i === 0 ? P.accent : P.textSec,
      { anchor:'middle', fw: i===0 ? 600 : 400, font:'sans-serif' }));
  });

  // End session CTA
  els.push(rect(24, 730, 342, 38, P.text, { rx:10 }));
  els.push(txt(W/2, 754, 'Log Session — 21 pages', 12, P.surf,
    { anchor:'middle', fw:600, font:'sans-serif' }));

  return { name:'Session', svg:'', elements: els };
}

// ─── SCREEN 4: Stats ──────────────────────────────────────────────────────────
function screen4() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  statusBar().forEach(e => els.push(e));

  // Header
  els.push(txt(24, 76, 'Reading Stats', 22, P.text, { fw:700, font:'serif' }));
  els.push(txt(24, 96, '2026 · Year in Reading', 11, P.textSec, { fw:400, font:'sans-serif', ls:0.5 }));
  // Year filter pills
  ['This Year','Last Year','All Time'].forEach((t, i) => {
    const x = W - 24 - (2-i) * 82;
    els.push(rect(x, 80, 76, 24, i===0 ? P.softGold : 'none', { rx:12 }));
    if (i===0) els.push(rect(x, 80, 76, 24, 'none', { rx:12, stroke:P.accent, sw:1 }));
    els.push(txt(x+38, 96, t, 9.5, i===0 ? P.accent : P.textSec,
      { anchor:'middle', fw: i===0 ? 600 : 400, font:'sans-serif' }));
  });

  // ── Big hero numbers (bento-inspired) ──
  // Left big card: books read
  els.push(rect(20, 114, 168, 120, P.surf, { rx:14 }));
  els.push(rect(20, 114, 168, 120, 'none', { rx:14, stroke:P.border, sw:1 }));
  els.push(txt(34, 150, '12', 48, P.text, { fw:800, font:'serif' }));
  els.push(txt(34, 180, 'books read', 11, P.textSec, { fw:400, font:'sans-serif' }));
  dotCluster(160, 125, P.accent, 0.6).forEach(e => els.push(e));

  // Right big card: pages
  els.push(rect(202, 114, 168, 120, P.accent2, { rx:14 }));
  els.push(txt(216, 150, '3,847', 36, '#F5F0E4', { fw:800, font:'serif' }));
  els.push(txt(216, 175, 'pages turned', 11, '#FFFDF7', { fw:400, font:'sans-serif', opacity:0.85 }));
  dotCluster(350, 125, '#FFFDF7', 0.5).forEach(e => els.push(e));

  // ── Monthly bar chart ──
  els.push(txt(24, 262, 'Books per Month', 14, P.text, { fw:600, font:'sans-serif' }));
  const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];
  const vals = [2,1,1,2,3,1,0,0,0,0,0,0]; // read so far
  const chartY = 324; const chartH = 60;
  months.forEach((m, i) => {
    const bx = 24 + i * 29;
    const bh = vals[i] * 20;
    const isCur = i === 3;
    // Bar
    if (bh > 0) {
      els.push(rect(bx, chartY - bh, 20, bh,
        isCur ? P.accent : P.card, { rx:4 }));
    } else {
      els.push(rect(bx, chartY - 6, 20, 6, P.card, { rx:3, opacity:0.5 }));
    }
    // Label
    els.push(txt(bx + 10, chartY + 14, m, 9, P.textSec,
      { anchor:'middle', fw: isCur ? 600 : 400, font:'sans-serif' }));
  });
  // Baseline
  els.push(line(24, chartY, W-24, chartY, P.border, { sw:1 }));

  // ── Genre breakdown ──
  els.push(divider(356));
  els.push(txt(24, 378, 'By Genre', 14, P.text, { fw:600, font:'sans-serif' }));
  const genres = [
    { g:'Literary Fiction', pct:0.50, col:P.accent  },
    { g:'Historical',       pct:0.25, col:P.accent2 },
    { g:'Non-fiction',      pct:0.17, col:P.coral   },
    { g:'Mystery',          pct:0.08, col:P.plum    },
  ];
  genres.forEach((g, i) => {
    const gy = 392 + i * 46;
    els.push(txt(24, gy + 12, g.g, 12, P.text, { fw:500, font:'sans-serif' }));
    els.push(txt(W-24, gy + 12, Math.round(g.pct*100)+'%', 11, P.textSec,
      { anchor:'end', fw:400, font:'sans-serif' }));
    progressBar(24, gy + 18, W-48, 5, g.pct, g.col, P.card, 2.5).forEach(e => els.push(e));
  });

  // ── Reading streak badge ──
  els.push(rect(20, 590, 350, 72, P.softGold, { rx:14 }));
  els.push(rect(20, 590, 350, 72, 'none', { rx:14, stroke:P.accent, sw:1 }));
  els.push(txt(34, 618, '🔥', 24, P.accent, { font:'sans-serif' }));
  els.push(txt(72, 615, '18-day reading streak!', 16, P.text, { fw:700, font:'serif' }));
  els.push(txt(72, 634, 'Best: 31 days · Keep it going →', 11, P.textSec, { fw:400, font:'sans-serif' }));

  // Reading goal
  els.push(txt(24, 690, 'Annual Goal', 14, P.text, { fw:600, font:'sans-serif' }));
  els.push(txt(W-24, 690, '12 of 24 books', 12, P.textSec, { anchor:'end', font:'sans-serif' }));
  progressBar(24, 700, W-48, 8, 0.5, P.accent, P.card, 4).forEach(e => els.push(e));
  els.push(txt(24, 724, '50% of goal — on track', 11, P.textSec, { fw:400, font:'sans-serif', opacity:0.75 }));

  bottomNav(2).forEach(e => els.push(e));
  return { name:'Stats', svg:'', elements: els };
}

// ─── SCREEN 5: Discover ────────────────────────────────────────────────────────
function screen5() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  statusBar().forEach(e => els.push(e));

  // Header
  els.push(txt(24, 76, 'Discover', 22, P.text, { fw:700, font:'serif' }));
  els.push(txt(24, 96, 'curated for your taste', 11, P.textSec, { fw:400, font:'sans-serif' }));
  dotCluster(354, 82, P.accent, 0.6).forEach(e => els.push(e));

  // Search bar
  els.push(rect(24, 110, 342, 38, P.surf, { rx:12 }));
  els.push(rect(24, 110, 342, 38, 'none', { rx:12, stroke:P.border, sw:1 }));
  els.push(txt(44, 134, '🔍 Search by title, author, genre…', 12, P.textSec,
    { fw:400, font:'sans-serif', opacity:0.6 }));

  // Genre filter pills
  const genres = ['All','Literary','History','Sci-Fi','Essays','Mystery'];
  let px = 24;
  genres.forEach((g, i) => {
    const w = g.length * 7.5 + 20;
    els.push(rect(px, 162, w, 28, i===0 ? P.text : P.card, { rx:14 }));
    els.push(txt(px + w/2, 181, g, 11, i===0 ? P.surf : P.textSec,
      { anchor:'middle', fw: i===0 ? 600 : 400, font:'sans-serif' }));
    px += w + 8;
  });

  // ── Staff Picks ──
  els.push(txt(24, 218, 'Staff Picks', 15, P.text, { fw:700, font:'serif' }));
  // Large featured book card
  els.push(rect(20, 230, 350, 120, P.surf, { rx:14 }));
  els.push(rect(20, 230, 350, 120, 'none', { rx:14, stroke:P.border, sw:1 }));
  bookCover(36, 244, 68, 92, '#4A5A8A', '#5A6B9A', 8).forEach(e => els.push(e));
  els.push(txt(120, 258, 'EDITORS\' CHOICE', 8.5, P.accent,
    { fw:700, font:'sans-serif', ls:1.2 }));
  els.push(txt(120, 276, 'James', 19, P.text, { fw:700, font:'serif' }));
  els.push(txt(120, 295, 'Percival Everett', 12, P.textSec, { fw:400, font:'sans-serif' }));
  els.push(txt(120, 314, '"Everett rewrites history,', 11, P.text,
    { fw:400, font:'sans-serif', opacity:0.7 }));
  els.push(txt(120, 329, 'one page at a time."', 11, P.text,
    { fw:400, font:'sans-serif', opacity:0.7 }));
  els.push(rect(120, 338, 72, 22, P.accent, { rx:6 }));
  els.push(txt(156, 353, 'Add to library', 9.5, P.surf,
    { anchor:'middle', fw:600, font:'sans-serif' }));

  // ── You May Also Like ──
  els.push(txt(24, 378, 'Based on What You\'ve Read', 15, P.text, { fw:700, font:'serif' }));

  const discoverBooks = [
    { body:'#6B8F5A', spine:'#4A6B38', title:'Intermezzo',    author:'Rooney' },
    { body:P.coral,   spine:'#8A4028', title:'The Waiting',   author:'Connelly' },
    { body:'#8A6BAA', spine:'#5A3A7A', title:'Orbital',       author:'Harvey' },
    { body:'#A89060', spine:'#7A6030', title:'Onyx Storm',    author:'Yarros' },
  ];
  discoverBooks.forEach((b, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const bx = 24 + col * 178;
    const by = 394 + row * 160;
    els.push(rect(bx, by, 162, 145, P.surf, { rx:12 }));
    els.push(rect(bx, by, 162, 145, 'none', { rx:12, stroke:P.border, sw:1 }));
    bookCover(bx + 10, by + 10, 56, 80, b.spine, b.body, 6).forEach(e => els.push(e));
    els.push(txt(bx + 76, by + 30, b.title, 13, P.text, { fw:700, font:'serif' }));
    els.push(txt(bx + 76, by + 48, b.author, 10, P.textSec, { fw:400, font:'sans-serif' }));
    // Mini rating
    [0,1,2,3,4].forEach(d => {
      els.push(circle(bx + 76 + d*13, by + 68, 3, d < 4 ? P.accent : P.card));
    });
    els.push(txt(bx + 76, by + 92, '+ Add', 10.5, P.accent,
      { fw:600, font:'sans-serif' }));
  });

  bottomNav(1).forEach(e => els.push(e));
  return { name:'Discover', svg:'', elements: els };
}

// ─── SCREEN 6: Profile ────────────────────────────────────────────────────────
function screen6() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  statusBar().forEach(e => els.push(e));

  // Header
  els.push(txt(24, 72, 'Profile', 22, P.text, { fw:700, font:'serif' }));
  els.push(txt(W-24, 72, '⚙', 20, P.textSec, { anchor:'end', font:'sans-serif' }));

  // Avatar + identity
  els.push(circle(W/2, 136, 44, P.card));
  els.push(circle(W/2, 136, 44, 'none', { stroke:P.border, sw:2 }));
  // Avatar letter
  els.push(txt(W/2, 143, 'A', 32, P.textSec, { anchor:'middle', fw:700, font:'serif' }));
  // Identity badge
  els.push(rect(W/2 - 52, 194, 104, 22, P.softGold, { rx:11 }));
  els.push(txt(W/2, 209, '✦ Devoted Reader', 10.5, P.accent,
    { anchor:'middle', fw:600, font:'sans-serif' }));
  els.push(txt(W/2, 240, 'Alex Moreau', 18, P.text, { anchor:'middle', fw:700, font:'serif' }));
  els.push(txt(W/2, 258, 'Reading since January 2024', 11, P.textSec,
    { anchor:'middle', fw:400, font:'sans-serif', opacity:0.7 }));

  // ── Lifetime stats row ──
  const lifeStats = [
    { v:'47', l:'books' },
    { v:'13.2k', l:'pages' },
    { v:'31', l:'best streak' },
  ];
  lifeStats.forEach((s, i) => {
    const x = 24 + i * 116;
    els.push(rect(x, 272, 106, 58, P.surf, { rx:10 }));
    els.push(rect(x, 272, 106, 58, 'none', { rx:10, stroke:P.border, sw:1 }));
    els.push(txt(x+53, 294, s.v, 18, P.text, { fw:700, anchor:'middle', font:'serif' }));
    els.push(txt(x+53, 313, s.l, 10, P.textSec, { fw:400, anchor:'middle', font:'sans-serif' }));
  });

  // ── Achievement shelf ──
  els.push(divider(348));
  els.push(txt(24, 370, 'Achievement Shelf', 15, P.text, { fw:700, font:'serif' }));
  const badges = [
    { emoji:'📚', label:'Voracious',  col:P.softGold },
    { emoji:'🌙', label:'Night Owl',  col:P.card },
    { emoji:'🔥', label:'On a Streak',col:P.softGold },
    { emoji:'✍️', label:'Annotator',  col:P.card },
  ];
  badges.forEach((b, i) => {
    const bx = 24 + i * 85;
    els.push(rect(bx, 382, 75, 72, b.col, { rx:12 }));
    if (b.col === P.softGold) {
      els.push(rect(bx, 382, 75, 72, 'none', { rx:12, stroke:P.accent, sw:1 }));
    }
    els.push(txt(bx + 37, 412, b.emoji, 20, P.text, { anchor:'middle', font:'sans-serif' }));
    els.push(txt(bx + 37, 444, b.label, 9, b.col === P.softGold ? P.accent : P.textSec,
      { anchor:'middle', fw: b.col===P.softGold ? 600 : 400, font:'sans-serif' }));
  });

  // ── Reading identity ──
  els.push(divider(474));
  els.push(txt(24, 494, 'Your Reading Identity', 15, P.text, { fw:700, font:'serif' }));
  const identity = [
    { l:'Favourite genre',  v:'Literary Fiction' },
    { l:'Avg session',      v:'38 minutes' },
    { l:'Reads most',       v:'Evenings' },
    { l:'Goal pace',        v:'On track ✓' },
  ];
  identity.forEach((id, i) => {
    const iy = 510 + i * 42;
    els.push(txt(24, iy + 14, id.l, 12, P.textSec, { fw:400, font:'sans-serif' }));
    els.push(txt(W-24, iy + 14, id.v, 12, P.text, { anchor:'end', fw:600, font:'sans-serif' }));
    if (i < identity.length - 1) els.push(divider(iy + 26, 0.1));
  });

  // ── Share + Export ──
  els.push(rect(24, 700, 156, 40, P.card, { rx:10 }));
  els.push(txt(102, 725, '↗ Share Profile', 11, P.textSec, { anchor:'middle', fw:500, font:'sans-serif' }));
  els.push(rect(194, 700, 172, 40, P.accent, { rx:10 }));
  els.push(txt(280, 725, '⬇ Export Reading Log', 11, P.surf, { anchor:'middle', fw:600, font:'sans-serif' }));

  // Dot cluster decoration
  dotCluster(358, 472, P.accent, 0.55).forEach(e => els.push(e));

  bottomNav(3).forEach(e => els.push(e));
  return { name:'Profile', svg:'', elements: els };
}

// ─── Assemble & Write ─────────────────────────────────────────────────────────
const screens = [screen1(), screen2(), screen3(), screen4(), screen5(), screen6()];
const totalElements = screens.reduce((s, sc) => s + sc.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name:       NAME,
    tagline:    TAGLINE,
    author:     'RAM',
    date:       new Date().toISOString().slice(0,10),
    theme:      'light',
    heartbeat:  HEARTBEAT,
    elements:   totalElements,
    slug:       SLUG,
    palette: {
      bg: P.bg, surface: P.surf, text: P.text,
      accent: P.accent, accent2: P.accent2,
    },
  },
  screens,
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
