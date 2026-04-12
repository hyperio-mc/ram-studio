'use strict';
// verso-app.js
// VERSO — Personal Reading Library & Knowledge Curator
//
// Challenge: Design a warm-minimal editorial reading tracker that fights the
// cold blue SaaS norm. Inspired by:
//
// 1. Minimal.gallery (March 2026) — "Archival Index" aesthetic: newsprint warm
//    backgrounds, single red accent, editorial typography as primary visual element,
//    bento-style content grids. One typeface doing all hierarchy work via weight.
//
// 2. Land-book.com (March 2026) — Bento grid feature sections: modular cards of
//    varying sizes, 1px borders, hover elevation — replacing long-form vertical stacks.
//
// 3. Counter-trend to AI/SaaS purple-gradient everything: warm off-whites (#F7F3EC),
//    dark brown text instead of black, single color accent max — the "barely there" UI.
//
// Palette: Warm newsprint + editorial red + dark espresso
// Theme: LIGHT (warm minimal)
// Screens: 5 mobile (390x844)

const fs   = require('fs');
const path = require('path');

const W = 390, H = 844;

const P = {
  bg:       '#F7F3EC',
  surface:  '#FFFFFF',
  surface2: '#F0EBE1',
  surface3: '#E8E1D4',
  border:   '#DDD5C8',
  text:     '#1A1208',
  textMid:  '#5C4A35',
  textMuted:'#9A8675',
  red:      '#C8231A',
  redLight: '#F5E8E7',
  white:    '#FFFFFF',
};

function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, w, h, fill,
    cornerRadius: opts.r ?? 0,
    borderColor:  opts.border ?? null,
    borderWidth:  opts.borderW ?? 0,
    opacity:      opts.opacity ?? 1,
    shadow:       opts.shadow ?? null,
  };
}

function text(str, x, y, opts = {}) {
  return {
    type: 'text', text: str, x, y,
    fontSize:      opts.size   ?? 14,
    fontWeight:    opts.weight ?? 400,
    color:         opts.color  ?? P.text,
    align:         opts.align  ?? 'left',
    width:         opts.width  ?? 300,
    lineHeight:    opts.lh     ?? 1.4,
    fontFamily:    opts.font   ?? 'Georgia',
    opacity:       opts.opacity ?? 1,
    letterSpacing: opts.ls     ?? 0,
  };
}

function line(x1, y1, x2, y2, color = P.border, width = 1) {
  return { type: 'line', x1, y1, x2, y2, color, width };
}

function circle(x, y, r, fill, opts = {}) {
  return {
    type: 'ellipse',
    x: x - r, y: y - r, w: r * 2, h: r * 2,
    fill,
    borderColor: opts.border ?? null,
    borderWidth: opts.borderW ?? 0,
  };
}

function bentoCard(x, y, w, h, opts = {}) {
  return rect(x, y, w, h, opts.fill ?? P.surface, {
    r:       opts.r      ?? 12,
    border:  opts.border ?? P.border,
    borderW: opts.borderW ?? 1,
    shadow:  opts.shadow ?? { x: 0, y: 2, blur: 8, color: 'rgba(26,18,8,0.06)' },
  });
}

function progressBar(x, y, w, pct, color = P.red, bg = P.surface3) {
  return [
    rect(x, y, w, 4, bg, { r: 2 }),
    rect(x, y, Math.max(4, Math.round(w * pct)), 4, color, { r: 2 }),
  ];
}

function statusBar() {
  return [
    rect(0, 0, W, 44, P.bg),
    text('9:41', 16, 14, { size: 15, weight: 600, color: P.text, font: 'SF Pro Display' }),
    text('●●● ▲ ■■■■', W - 90, 14, { size: 11, weight: 400, color: P.textMuted, align: 'right', width: 80 }),
  ];
}

function bottomNav(active = 0) {
  const items = [
    { icon: '◎', label: 'Library' },
    { icon: '⊞', label: 'Discover' },
    { icon: '○', label: 'Lists' },
    { icon: '◷', label: 'Stats' },
  ];
  const els = [
    rect(0, H - 80, W, 80, P.bg),
    line(0, H - 80, W, H - 80, P.border),
  ];
  items.forEach((item, i) => {
    const x = (W / items.length) * i + (W / items.length) / 2;
    const isActive = i === active;
    const col = isActive ? P.red : P.textMuted;
    els.push(text(item.icon, x - 12, H - 62, { size: 20, weight: isActive ? 700 : 400, color: col }));
    els.push(text(item.label, x - 20, H - 38, { size: 10, weight: isActive ? 600 : 400, color: col, align: 'center', width: 40 }));
    if (isActive) {
      els.push(rect(x - 16, H - 80, 32, 3, P.red));
    }
  });
  return els;
}

// ── Screen 1: Library Home ────────────────────────────────────────────────────
function screen1() {
  const els = [rect(0, 0, W, H, P.bg), ...statusBar()];

  // Header
  els.push(text('VERSO', 20, 54, { size: 11, weight: 700, color: P.red, ls: 4, font: 'SF Pro Display' }));
  els.push(text('Your Library', 20, 70, { size: 28, weight: 700, color: P.text, font: 'Georgia' }));
  els.push(text('March 2026', W - 20, 78, { size: 12, weight: 400, color: P.textMuted, align: 'right', width: 90 }));
  els.push(line(20, 108, W - 20, 108, P.border));

  // Currently reading — wide hero card
  const cy = 120;
  els.push(bentoCard(16, cy, W - 32, 132, {
    r: 14,
    shadow: { x: 0, y: 4, blur: 16, color: 'rgba(26,18,8,0.1)' }
  }));
  els.push(text('CURRENTLY READING', 28, cy + 14, { size: 9, weight: 700, color: P.red, ls: 2, font: 'SF Pro Display' }));
  els.push(text('The Timeless Way\nof Building', 28, cy + 30, { size: 20, weight: 700, color: P.text, font: 'Georgia', lh: 1.3, width: 200 }));
  els.push(text('Christopher Alexander', 28, cy + 78, { size: 12, weight: 400, color: P.textMid }));
  els.push(line(28, cy + 96, W - 36, cy + 96, P.border));
  els.push(text('Page 268 of 418 · 67%', 28, cy + 106, { size: 11, weight: 500, color: P.textMid }));
  els.push(...progressBar(28, cy + 120, 264, 0.67));
  // Book spine block (right)
  els.push(rect(W - 70, cy + 14, 42, 104, P.surface3, { r: 6 }));
  els.push(rect(W - 70, cy + 14, 6, 104, '#8B7355'));
  els.push(text('TW', W - 54, cy + 60, { size: 13, weight: 700, color: P.textMid, align: 'center', width: 30 }));

  // 2-col stats row
  const r2 = cy + 150;
  const hw = (W - 40) / 2;
  // Left: Books Read
  els.push(bentoCard(16, r2, hw, 98));
  els.push(text('BOOKS READ', 26, r2 + 14, { size: 9, weight: 700, color: P.textMuted, ls: 1, font: 'SF Pro Display' }));
  els.push(text('34', 26, r2 + 28, { size: 40, weight: 700, color: P.text, font: 'Georgia' }));
  els.push(text('in 2026', 26, r2 + 72, { size: 11, weight: 400, color: P.textMuted, font: 'SF Pro Display' }));
  // Sparkline
  [0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 1.0].forEach((v, i) => {
    const bh = Math.round(v * 18);
    els.push(rect(hw - 20 + i * 8, r2 + 72 - bh, 5, bh, P.red, { r: 2 }));
  });

  // Right: Streak
  els.push(bentoCard(20 + hw, r2, hw, 98));
  els.push(text('DAY STREAK', 30 + hw, r2 + 14, { size: 9, weight: 700, color: P.textMuted, ls: 1, font: 'SF Pro Display' }));
  els.push(text('23', 30 + hw, r2 + 28, { size: 40, weight: 700, color: P.text, font: 'Georgia' }));
  els.push(text('days in a row', 30 + hw, r2 + 72, { size: 11, weight: 400, color: P.textMuted, font: 'SF Pro Display' }));
  [1,1,1,1,0,1,1,1,1,1,1,1].forEach((lit, i) => {
    els.push(circle(30 + hw + (i % 6) * 14, r2 + 52 + Math.floor(i / 6) * 14, 4,
      lit ? P.red : P.surface3));
  });

  // Genre strip card
  const r3 = r2 + 116;
  els.push(bentoCard(16, r3, W - 32, 80));
  els.push(text('TOP GENRES', 28, r3 + 14, { size: 9, weight: 700, color: P.red, ls: 2, font: 'SF Pro Display' }));
  els.push(text('Architecture 42%   Design 31%   History 18%   Other 9%', 28, r3 + 34,
    { size: 11, weight: 400, color: P.textMid, width: W - 56 }));
  // Stacked bar
  let bx = 28;
  const gCols = [P.red, '#8B7355', '#DDD5C8', '#F0EBE1'];
  [42, 31, 18, 9].forEach((pct, i) => {
    const bw = Math.round((W - 56) * pct / 100);
    els.push(rect(bx, r3 + 52, bw, 14, gCols[i], { r: 2 }));
    bx += bw;
  });

  els.push(...bottomNav(0));
  return els;
}

// ── Screen 2: Book Detail ─────────────────────────────────────────────────────
function screen2() {
  const els = [rect(0, 0, W, H, P.bg), ...statusBar()];

  els.push(text('← Library', 20, 54, { size: 14, weight: 500, color: P.red, font: 'SF Pro Display' }));

  // Book card
  els.push(bentoCard(16, 76, W - 32, 196, { r: 16, shadow: { x: 0, y: 4, blur: 16, color: 'rgba(26,18,8,0.1)' } }));
  // Cover
  els.push(rect(28, 92, 96, 164, '#8B7355', { r: 8 }));
  els.push(rect(28, 92, 7, 164, '#6B5340'));
  els.push(text('The Timeless\nWay of\nBuilding', 38, 110, { size: 11, weight: 700, color: '#F7F3EC', font: 'Georgia', lh: 1.4, width: 72 }));
  els.push(text('Alexander', 38, 216, { size: 9, weight: 400, color: 'rgba(247,243,236,0.65)', width: 72 }));
  // Info
  els.push(text('The Timeless Way\nof Building', 140, 92, { size: 19, weight: 700, color: P.text, font: 'Georgia', lh: 1.3, width: 212 }));
  els.push(text('Christopher Alexander', 140, 140, { size: 12, weight: 400, color: P.textMid }));
  els.push(text('1979 · Oxford University Press', 140, 158, { size: 11, weight: 400, color: P.textMuted }));
  '★★★★☆'.split('').forEach((s, i) => {
    els.push(text(s, 140 + i * 16, 174, { size: 14, color: i < 4 ? '#C8A84B' : P.textMuted }));
  });
  els.push(text('4.2', 224, 176, { size: 11, weight: 600, color: P.textMuted }));
  // Tags
  const tgs = [['Architecture', 96], ['Pattern Language', 120], ['Theory', 58]];
  let tx = 140;
  tgs.forEach(([t, tw]) => {
    if (tx + tw + 8 < W - 16) {
      els.push(rect(tx, 194, tw, 20, P.surface2, { r: 10, border: P.border, borderW: 1 }));
      els.push(text(t, tx + tw / 2, 198, { size: 9, weight: 500, color: P.textMid, align: 'center', width: tw, font: 'SF Pro Display' }));
      tx += tw + 6;
    }
  });

  // Progress
  els.push(text('YOUR PROGRESS', 20, 288, { size: 9, weight: 700, color: P.red, ls: 2, font: 'SF Pro Display' }));
  els.push(line(20, 304, W - 20, 304, P.border));
  els.push(rect(20, 316, W - 40, 8, P.surface3, { r: 4 }));
  els.push(rect(20, 316, Math.round((W - 40) * 0.67), 8, P.red, { r: 4 }));
  els.push(text('Page 268 of 418', 20, 334, { size: 12, weight: 500, color: P.text }));
  els.push(text('67%', W - 20, 334, { size: 12, weight: 600, color: P.red, align: 'right', width: 50 }));

  // Stats row
  const sw = (W - 56) / 3;
  ['47\npages today', '2.4h\ntime read', '12\ndays in'].forEach((s, i) => {
    const [val, lab] = s.split('\n');
    const sx = 20 + i * (sw + 8);
    els.push(bentoCard(sx, 358, sw, 62, { r: 10 }));
    els.push(text(val, sx + sw / 2 - 16, 368, { size: 22, weight: 700, color: P.text, font: 'Georgia', align: 'center', width: sw }));
    els.push(text(lab, sx + 6, 396, { size: 10, weight: 400, color: P.textMuted, font: 'SF Pro Display', align: 'center', width: sw - 12 }));
  });

  // Highlights
  els.push(text('HIGHLIGHTS', 20, 436, { size: 9, weight: 700, color: P.red, ls: 2, font: 'SF Pro Display' }));
  els.push(line(20, 452, W - 20, 452, P.border));

  const quotes = [
    '"Each pattern is a relationship between context, a problem, and a solution."',
    '"A pattern language is a structured method of describing good design practice."',
  ];
  quotes.forEach((q, i) => {
    const qy = 464 + i * 90;
    els.push(rect(20, qy, 3, 68, P.red));
    els.push(text(q, 32, qy + 6, { size: 13, weight: 400, color: P.text, font: 'Georgia', lh: 1.55, width: W - 50 }));
    els.push(text('p. ' + [124, 231][i], 32, qy + 72, { size: 10, weight: 500, color: P.textMuted, font: 'SF Pro Display' }));
  });

  // CTA
  els.push(rect(20, H - 152, W - 40, 48, P.red, { r: 24 }));
  els.push(text('Continue Reading', W / 2 - 70, H - 136, { size: 15, weight: 600, color: P.white, align: 'center', width: 180, font: 'SF Pro Display' }));

  els.push(...bottomNav(0));
  return els;
}

// ── Screen 3: Discover ────────────────────────────────────────────────────────
function screen3() {
  const els = [rect(0, 0, W, H, P.bg), ...statusBar()];

  els.push(text('VERSO', 20, 54, { size: 11, weight: 700, color: P.red, ls: 4, font: 'SF Pro Display' }));
  els.push(text('Discover', 20, 70, { size: 28, weight: 700, color: P.text, font: 'Georgia' }));

  // Filter tabs
  const tabs = ['For You', 'Architecture', 'Design', 'History'];
  let tabX = 20;
  tabs.forEach((t, i) => {
    const tw = t.length * 7.5 + 16;
    if (i === 0) {
      els.push(rect(tabX, 106, tw, 26, P.text, { r: 13 }));
      els.push(text(t, tabX + tw / 2, 113, { size: 12, weight: 600, color: P.white, align: 'center', width: tw, font: 'SF Pro Display' }));
    } else {
      els.push(rect(tabX, 106, tw, 26, 'transparent', { r: 13, border: P.border, borderW: 1 }));
      els.push(text(t, tabX + tw / 2, 113, { size: 12, weight: 400, color: P.textMid, align: 'center', width: tw, font: 'SF Pro Display' }));
    }
    tabX += tw + 8;
  });

  els.push(line(20, 144, W - 20, 144, P.border));

  // Editor's pick — dark hero card
  els.push(bentoCard(16, 156, W - 32, 136, { r: 14, fill: '#2C1A0E', border: '#2C1A0E' }));
  els.push(text("EDITOR'S PICK", 28, 172, { size: 9, weight: 700, color: P.red, ls: 2, font: 'SF Pro Display' }));
  els.push(text('A Pattern Language', 28, 190, { size: 22, weight: 700, color: '#F7F3EC', font: 'Georgia', width: 220 }));
  els.push(text('Christopher Alexander et al.', 28, 220, { size: 12, weight: 400, color: 'rgba(247,243,236,0.55)', font: 'SF Pro Display' }));
  els.push(text('"Towns, buildings, construction — 253 patterns\nthat form a complete language."', 28, 240, { size: 11, weight: 400, color: 'rgba(247,243,236,0.65)', font: 'SF Pro Display', lh: 1.5, width: W - 64 }));
  // Abstract accent
  els.push(circle(W - 50, 220, 36, 'rgba(200,35,26,0.22)'));
  els.push(circle(W - 50, 220, 18, 'rgba(200,35,26,0.38)'));

  // 2×2 book grid
  const books = [
    { title: 'How Buildings\nLearn', author: 'Stewart Brand', year: '1994', spine: '#8B7355' },
    { title: 'Death and Life\nof Great Cities', author: 'Jane Jacobs', year: '1961', spine: '#5C7A6B' },
    { title: 'Complexity and\nContradiction', author: 'Robert Venturi', year: '1966', spine: '#7A5C78' },
    { title: 'Delirious\nNew York', author: 'Rem Koolhaas', year: '1978', spine: '#5C6B7A' },
  ];

  const gY = 308;
  const gW = (W - 40) / 2;
  books.forEach((b, i) => {
    const bx = i % 2 === 0 ? 16 : 24 + gW;
    const by = gY + Math.floor(i / 2) * 130;
    els.push(bentoCard(bx, by, gW, 118, { r: 12 }));
    els.push(rect(bx + 12, by + 12, 30, 68, b.spine, { r: 4 }));
    els.push(rect(bx + 12, by + 12, 4, 68, 'rgba(0,0,0,0.2)'));
    els.push(text(b.title, bx + 52, by + 14, { size: 12, weight: 700, color: P.text, font: 'Georgia', lh: 1.35, width: gW - 62 }));
    els.push(text(b.author, bx + 52, by + 66, { size: 10, weight: 400, color: P.textMid, font: 'SF Pro Display', lh: 1.3, width: gW - 62 }));
    els.push(text(b.year, bx + 52, by + 80, { size: 10, weight: 400, color: P.textMuted, font: 'SF Pro Display' }));
    els.push(text('+ Add', bx + gW - 42, by + 96, { size: 11, weight: 600, color: P.red, font: 'SF Pro Display' }));
  });

  els.push(...bottomNav(1));
  return els;
}

// ── Screen 4: Lists ───────────────────────────────────────────────────────────
function screen4() {
  const els = [rect(0, 0, W, H, P.bg), ...statusBar()];

  els.push(text('VERSO', 20, 54, { size: 11, weight: 700, color: P.red, ls: 4, font: 'SF Pro Display' }));
  els.push(text('Lists', 20, 70, { size: 28, weight: 700, color: P.text, font: 'Georgia' }));
  els.push(text('+ New List', W - 20, 78, { size: 13, weight: 600, color: P.red, align: 'right', width: 90, font: 'SF Pro Display' }));
  els.push(line(20, 108, W - 20, 108, P.border));

  const lists = [
    { name: 'Architecture Canon', count: 18, pct: 0.61, desc: 'Essential texts on space, pattern, and form', color: '#8B7355' },
    { name: 'Design Thinking',    count: 12, pct: 0.42, desc: 'How good design gets made', color: '#5C7A6B' },
    { name: 'City & Urbanism',    count:  9, pct: 0.78, desc: 'Understanding the built environment', color: '#5C6B7A' },
    { name: 'Want to Read',       count: 31, pct: 0.10, desc: 'The ever-growing pile', color: P.textMuted },
  ];

  lists.forEach((l, i) => {
    const ly = 122 + i * 112;
    els.push(bentoCard(16, ly, W - 32, 100, { r: 14 }));
    // Accent left edge
    els.push(rect(16, ly, 6, 100, l.color, { r: 3 }));
    els.push(text(l.name, 34, ly + 14, { size: 16, weight: 700, color: P.text, font: 'Georgia' }));
    els.push(text(l.desc, 34, ly + 36, { size: 12, weight: 400, color: P.textMid, width: W - 80, font: 'SF Pro Display' }));
    els.push(text(`${l.count} books · ${Math.round(l.pct * 100)}% read`, 34, ly + 56,
      { size: 11, weight: 400, color: P.textMuted, font: 'SF Pro Display' }));
    els.push(...progressBar(34, ly + 74, W - 72, l.pct, l.color));
    // Mini spines
    [0, 1, 2, 3].forEach((j) => {
      els.push(rect(W - 52 + j * 9, ly + 14, 7, 36, l.color, { r: 2, opacity: 1 - j * 0.2 }));
    });
  });

  els.push(rect(20, H - 152, W - 40, 48, 'transparent', { r: 24, border: P.text, borderW: 1.5 }));
  els.push(text('+ Create a new list', W / 2 - 70, H - 136, { size: 15, weight: 600, color: P.text, align: 'center', width: 180, font: 'SF Pro Display' }));

  els.push(...bottomNav(2));
  return els;
}

// ── Screen 5: Reading Stats ───────────────────────────────────────────────────
function screen5() {
  const els = [rect(0, 0, W, H, P.bg), ...statusBar()];

  els.push(text('VERSO', 20, 54, { size: 11, weight: 700, color: P.red, ls: 4, font: 'SF Pro Display' }));
  els.push(text('Stats', 20, 70, { size: 28, weight: 700, color: P.text, font: 'Georgia' }));
  els.push(text('2026', W - 20, 78, { size: 15, weight: 400, color: P.textMuted, align: 'right', width: 60, font: 'SF Pro Display' }));
  els.push(line(20, 108, W - 20, 108, P.border));

  // Hero number
  els.push(bentoCard(16, 120, W - 32, 88, { r: 14, fill: P.text, border: P.text }));
  els.push(text('34', 36, 130, { size: 54, weight: 700, color: P.bg, font: 'Georgia' }));
  els.push(text('books read in 2026', 36, 186, { size: 13, weight: 400, color: 'rgba(247,243,236,0.55)', font: 'SF Pro Display' }));
  els.push(text('↑ 12% vs 2025', W - 32, 158, { size: 12, weight: 600, color: '#5AAA78', align: 'right', width: 140, font: 'SF Pro Display' }));

  // Monthly bar chart
  const chartY = 224;
  els.push(bentoCard(16, chartY, W - 32, 128, { r: 14 }));
  els.push(text('BOOKS PER MONTH', 28, chartY + 14, { size: 9, weight: 700, color: P.red, ls: 2, font: 'SF Pro Display' }));

  const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];
  const vals   = [3, 4, 2, 5, 3, 4, 2, 3, 4, 3, 0, 0];
  const maxV   = 5;
  const barW   = Math.floor((W - 64) / 12);
  const chartH = 56;

  months.forEach((m, i) => {
    const bh  = vals[i] > 0 ? Math.round(vals[i] / maxV * chartH) : 0;
    const bx  = 28 + i * barW;
    const fut = vals[i] === 0;
    els.push(rect(bx, chartY + 94 - bh, barW - 4, bh, fut ? P.surface3 : P.red, { r: 2 }));
    els.push(text(m, bx, chartY + 102, { size: 9, weight: 400, color: P.textMuted, align: 'center', width: barW - 4, font: 'SF Pro Display' }));
  });

  // Pace card
  const paceY = chartY + 144;
  els.push(bentoCard(16, paceY, W - 32, 58, { r: 14 }));
  els.push(text('On pace for 52 books this year', 28, paceY + 14, { size: 13, weight: 600, color: P.text, font: 'SF Pro Display' }));
  els.push(text('Need 18 more in 9 months', 28, paceY + 34, { size: 11, weight: 400, color: P.textMuted, font: 'SF Pro Display' }));
  els.push(text('✓ On track', W - 32, paceY + 22, { size: 12, weight: 600, color: '#2E7D4F', align: 'right', width: 90, font: 'SF Pro Display' }));

  // Genre breakdown
  const gY = paceY + 76;
  els.push(bentoCard(16, gY, W - 32, 126, { r: 14 }));
  els.push(text('GENRE BREAKDOWN', 28, gY + 14, { size: 9, weight: 700, color: P.red, ls: 2, font: 'SF Pro Display' }));
  const genres = [['Architecture', 42, P.red], ['Design', 31, '#8B7355'], ['History', 18, '#5C6B7A'], ['Philosophy', 9, '#7A5C78']];
  genres.forEach(([g, pct, col], i) => {
    const gy = gY + 34 + i * 22;
    els.push(text(g, 28, gy, { size: 12, weight: 500, color: P.text, font: 'SF Pro Display' }));
    els.push(text(`${pct}%`, W - 32, gy, { size: 12, weight: 600, color: P.text, align: 'right', width: 40, font: 'SF Pro Display' }));
    els.push(...progressBar(28, gy + 13, W - 70, pct / 100, col));
  });

  els.push(...bottomNav(3));
  return els;
}

// ── Build ─────────────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name:    'Verso — Personal Reading Library',
  width:   W,
  height:  H,
  screens: [
    { name: 'Library Home',  elements: screen1() },
    { name: 'Book Detail',   elements: screen2() },
    { name: 'Discover',      elements: screen3() },
    { name: 'Lists',         elements: screen4() },
    { name: 'Reading Stats', elements: screen5() },
  ],
  metadata: {
    created:     new Date().toISOString(),
    author:      'RAM Design Heartbeat',
    description: 'Warm-minimal editorial reading tracker. Archival index aesthetic from minimal.gallery, bento grids from land-book.com.',
    tags:        ['reading', 'library', 'minimal', 'editorial', 'warm', 'light', 'bento-grid'],
  },
};

fs.writeFileSync(path.join(__dirname, 'verso.pen'), JSON.stringify(pen, null, 2));
console.log('✓ verso.pen written —', pen.screens.length, 'screens,', pen.screens.reduce((a,s) => a + s.elements.length, 0), 'elements total');
