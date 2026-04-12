// CANON — personal literary canon & reading tracker
// LIGHT editorial theme: warm cream, deep ink, russet accent, sage secondary
// Inspired by: Litbix "for book lovers" (minimal.gallery) + editorial typography trend

const fs = require('fs');

const W = 390, H = 844;

// Light editorial palette
const bg       = '#F5F0E8'; // warm cream paper
const surface  = '#FEFCF8'; // card white
const ink      = '#1C1814'; // deep ink charcoal
const rust     = '#C2613A'; // russet book spine
const sage     = '#5E8870'; // library sage
const muted    = 'rgba(28,24,20,0.42)';
const tinted   = '#EDE8DF'; // deeper cream for nav / dividers
const hairline = 'rgba(28,24,20,0.09)';
const warm     = '#F8EFE4'; // highlight / quote bg

let _id = 1;
const nid = () => `c${_id++}`;

const rect = (x, y, w, h, fill, o = {}) => ({
  id: nid(), type: 'rect', x, y, width: w, height: h,
  fill, radius: o.r || 0, opacity: o.op || 1,
});
const txt = (x, y, content, o = {}) => ({
  id: nid(), type: 'text', x, y, content,
  fontSize: o.size || 14, fontWeight: o.weight || 400,
  fontFamily: o.font || 'Inter', color: o.color || ink,
  align: o.align || 'left', width: o.w || 300,
  opacity: o.op || 1, letterSpacing: o.ls || 0,
});
const circ = (cx, cy, r, fill) => ({
  id: nid(), type: 'ellipse', x: cx - r, y: cy - r,
  width: r * 2, height: r * 2, fill,
});
const ln = (x1, y1, x2, y2, clr = hairline) => ({
  id: nid(), type: 'line', x1, y1, x2, y2, stroke: clr, strokeWidth: 1,
});
const pill = (x, y, w, h, fill, o = {}) => rect(x, y, w, h, fill, { r: h / 2, ...o });

// Bottom nav (shared)
function nav(active) {
  const els = [];
  const navH = 72;
  els.push(rect(0, H - navH, W, navH, tinted));
  els.push(ln(0, H - navH, W, H - navH));
  const items = [
    { em: '📖', lbl: 'Today'   },
    { em: '📚', lbl: 'Library' },
    { em: '🔍', lbl: 'Find'    },
    { em: '✦',  lbl: 'Insights'},
    { em: '👤', lbl: 'Profile' },
  ];
  items.forEach(({ em, lbl }, i) => {
    const nx = 16 + i * (W / 5);
    const on = i === active;
    els.push(txt(nx, H - navH + 11, em, { size: 20, w: W / 5 - 8, align: 'center' }));
    els.push(txt(nx, H - navH + 37, lbl, {
      size: 10, weight: on ? 700 : 400,
      color: on ? rust : muted, w: W / 5 - 8, align: 'center', ls: on ? 0.4 : 0,
    }));
    if (on) els.push(rect(nx + (W / 5 - 24) / 2, H - navH - 4, 24, 3, rust, { r: 2 }));
  });
  return els;
}

// ── S1: TODAY ─────────────────────────────────────────────────────────────────
function makeToday() {
  const e = [];
  e.push(rect(0, 0, W, H, bg));

  // Header
  e.push(txt(24, 54, 'CANON', { size: 17, weight: 700, ls: 3.5, font: 'Georgia' }));
  e.push(txt(W - 90, 54, 'Sat, Apr 4', { size: 12, color: muted, align: 'right', w: 78 }));
  e.push(circ(W - 20, 62, 5, rust));

  // Now reading card
  e.push(rect(24, 84, W - 48, 172, surface, { r: 14 }));
  e.push(rect(24, 84, 5, 172, rust, { r: 2 })); // spine strip
  e.push(txt(44, 100, 'NOW READING', { size: 10, weight: 600, color: muted, ls: 1.5 }));
  e.push(txt(44, 120, 'The Name of\nthe Rose', { size: 22, weight: 700, font: 'Georgia', color: ink, w: 236 }));
  e.push(txt(44, 172, 'Umberto Eco  ·  1980', { size: 13, color: muted, w: 220 }));
  // progress
  e.push(rect(44, 198, W - 92, 6, tinted, { r: 3 }));
  e.push(rect(44, 198, Math.round((W - 92) * 0.63), 6, rust, { r: 3 }));
  e.push(txt(44, 212, 'p.276 of 438  ·  63%', { size: 12, color: muted, w: 200 }));
  e.push(txt(W - 72, 212, '3h left', { size: 12, color: sage, w: 56, align: 'right', weight: 600 }));
  // resume btn
  e.push(pill(W - 106, 96, 78, 28, '#EDF2EE'));
  e.push(txt(W - 97, 105, '▶  Resume', { size: 12, color: sage, w: 70, weight: 600 }));

  // Divider
  e.push(ln(24, 270, W - 24, 270));
  e.push(txt(24, 282, "Today's sessions", { size: 13, weight: 600, color: muted, ls: 0.3 }));

  // Session rows
  const sessions = [
    { time: '08:12 AM', pages: '18 pp', mins: '42 min', label: 'Morning' },
    { time: '01:30 PM', pages: '24 pp', mins: '58 min', label: 'Lunch break' },
  ];
  sessions.forEach(({ time, pages, mins, label }, i) => {
    const y = 308 + i * 68;
    e.push(rect(24, y, W - 48, 56, surface, { r: 12 }));
    e.push(circ(50, y + 28, 16, tinted));
    e.push(txt(42, y + 19, '📖', { size: 14, w: 18, align: 'center' }));
    e.push(txt(76, y + 10, label, { size: 14, weight: 600, color: ink }));
    e.push(txt(76, y + 30, time + '  ·  ' + pages + '  ·  ' + mins, { size: 12, color: muted, w: 240 }));
    e.push(pill(W - 70, y + 16, 44, 22, tinted));
    e.push(txt(W - 62, y + 20, pages, { size: 11, color: rust, w: 36, weight: 600 }));
  });

  // Streak
  e.push(ln(24, 446, W - 24, 446));
  e.push(txt(24, 458, 'Reading streak', { size: 13, weight: 600, color: muted, ls: 0.3 }));

  const days = ['M','T','W','T','F','S','S'];
  const done = [1, 1, 1, 1, 1, 0, 0];
  const bw = 40, gap = (W - 48 - bw * 7) / 6;
  days.forEach((d, i) => {
    const x = 24 + i * (bw + gap);
    const f = done[i];
    e.push(rect(x, 480, bw, 44, f ? rust : tinted, { r: 8 }));
    e.push(txt(x, 489, d, { size: 11, weight: 600, color: f ? '#FFF' : muted, w: bw, align: 'center' }));
    e.push(txt(x, 506, f ? '✓' : '·', { size: 13, color: f ? '#FFF' : muted, w: bw, align: 'center' }));
  });
  e.push(txt(24, 534, '5-day streak  ·  126 pages this week', { size: 13, color: ink, weight: 500, w: W - 108 }));
  e.push(pill(W - 112, 530, 88, 26, '#EDF2EE'));
  e.push(txt(W - 100, 537, '🏅 Best week', { size: 11, color: sage, w: 80, weight: 600 }));

  // Last highlight
  e.push(ln(24, 570, W - 24, 570));
  e.push(txt(24, 582, 'Last highlight', { size: 13, weight: 600, color: muted, ls: 0.3 }));
  e.push(rect(24, 604, W - 48, 84, warm, { r: 12 }));
  e.push(rect(24, 604, 4, 84, rust, { r: 2 }));
  e.push(txt(38, 618, '"Books are not made to be believed, but to be subjected to inquiry. When you read a book, you must ask yourself not what it says, but what it means."', {
    size: 13, font: 'Georgia', color: ink, w: W - 80,
  }));
  e.push(txt(38, 675, 'p.94  ·  Day One', { size: 11, color: muted, w: 160 }));

  return { name: 'Today', width: W, height: H, elements: [...e, ...nav(0)] };
}

// ── S2: BOOK DETAIL ───────────────────────────────────────────────────────────
function makeBookDetail() {
  const e = [];
  e.push(rect(0, 0, W, H, bg));

  // Header
  e.push(txt(24, 54, '← Library', { size: 14, color: rust, weight: 600 }));
  e.push(txt(W - 56, 54, '···', { size: 20, color: ink, align: 'right', w: 44 }));

  // Book cover (illustrated rectangle)
  const cvX = (W - 156) / 2, cvY = 82;
  e.push(rect(cvX, cvY, 156, 220, rust, { r: 6 }));
  e.push(rect(cvX, cvY, 156, 220, 'rgba(0,0,0,0.06)', { r: 6 }));
  for (let i = 0; i < 7; i++) {
    e.push(rect(cvX + 16, cvY + 28 + i * 22, 124, 1, 'rgba(255,255,255,0.12)'));
  }
  e.push(txt(cvX + 12, cvY + 20, 'The Name\nof the Rose', { size: 20, weight: 700, font: 'Georgia', color: '#FDF6EE', w: 132 }));
  e.push(txt(cvX + 12, cvY + 190, 'Umberto Eco', { size: 12, color: 'rgba(253,246,238,0.7)', w: 132 }));
  e.push(rect(cvX, cvY, 8, 220, 'rgba(0,0,0,0.18)', { r: 2 }));

  // Stars
  const stY = cvY + 234;
  for (let s = 0; s < 5; s++) {
    e.push(txt((W - 116) / 2 + s * 23, stY, s < 4 ? '★' : '☆', { size: 18, color: rust, w: 22, align: 'center' }));
  }
  e.push(txt(0, stY + 24, 'Your rating: 4 / 5', { size: 12, color: muted, w: W, align: 'center' }));

  // Meta row
  const mY = stY + 52;
  [{ l: 'Genre', v: 'Mystery' }, { l: 'Pages', v: '438' }, { l: 'Year', v: '1980' }].forEach((m, i) => {
    const mx = 24 + i * ((W - 48) / 3);
    e.push(rect(mx, mY, (W - 56) / 3, 52, surface, { r: 10 }));
    e.push(txt(mx, mY + 8, m.l, { size: 10, color: muted, w: (W - 56) / 3, align: 'center' }));
    e.push(txt(mx, mY + 26, m.v, { size: 16, weight: 700, color: ink, w: (W - 56) / 3, align: 'center' }));
  });

  // Progress
  const pY = mY + 68;
  e.push(ln(24, pY, W - 24, pY));
  e.push(txt(24, pY + 12, 'Progress', { size: 13, weight: 600, color: muted, ls: 0.3 }));
  e.push(rect(24, pY + 36, W - 48, 8, tinted, { r: 4 }));
  e.push(rect(24, pY + 36, Math.round((W - 48) * 0.63), 8, rust, { r: 4 }));
  e.push(txt(24, pY + 52, 'Page 276 of 438', { size: 13, color: ink, w: 200 }));
  e.push(txt(W - 80, pY + 46, '63%', { size: 24, weight: 700, color: rust, align: 'right', w: 64, font: 'Georgia' }));

  // Session stats
  const sY = pY + 82;
  e.push(ln(24, sY, W - 24, sY));
  e.push(txt(24, sY + 12, 'Reading sessions', { size: 13, weight: 600, color: muted, ls: 0.3 }));
  [{ l: 'Total time', v: '7h 24m' }, { l: 'Sessions', v: '12' }, { l: 'Avg speed', v: '38 pp/h' }, { l: 'Highlights', v: '24' }].forEach(({ l, v }, i) => {
    const sw = (W - 48) / 4;
    e.push(txt(24 + i * sw, sY + 36, v, { size: 16, weight: 700, color: ink, w: sw - 4, align: 'center' }));
    e.push(txt(24 + i * sw, sY + 56, l, { size: 10, color: muted, w: sw - 4, align: 'center' }));
  });

  // CTA
  const btnY = H - 72 - 68;
  e.push(rect(24, btnY, W - 48, 52, rust, { r: 14 }));
  e.push(txt(0, btnY + 15, '▶  Start reading session', { size: 15, weight: 700, color: '#FFF', w: W, align: 'center' }));

  return { name: 'Book Detail', width: W, height: H, elements: [...e, ...nav(1)] };
}

// ── S3: LIBRARY ───────────────────────────────────────────────────────────────
function makeLibrary() {
  const e = [];
  e.push(rect(0, 0, W, H, bg));

  e.push(txt(24, 54, 'Library', { size: 26, weight: 700, font: 'Georgia' }));
  e.push(pill(W - 86, 46, 62, 30, rust));
  e.push(txt(W - 76, 54, '+ Add', { size: 13, weight: 700, color: '#FFF', w: 52 }));

  // Filter chips
  const chips = [['All · 34', true], ['Reading · 4', false], ['To Read · 18', false], ['Done · 12', false]];
  let cx = 24;
  chips.forEach(([c, on]) => {
    const cw = c.length * 7.4 + 24;
    e.push(pill(cx, 92, cw, 30, on ? rust : tinted));
    e.push(txt(cx + 10, 101, c, { size: 12, weight: on ? 700 : 400, color: on ? '#FFF' : muted, w: cw - 12 }));
    cx += cw + 8;
  });

  // Book rows
  const books = [
    { t: 'The Name of the Rose', a: 'Umberto Eco',      clr: rust,    pct: 63, st: 'reading' },
    { t: 'Sapiens',              a: 'Yuval Noah Harari', clr: '#5B7A8C', pct: 100, st: 'done'    },
    { t: 'Thinking Fast & Slow', a: 'Daniel Kahneman',  clr: sage,    pct: 22, st: 'reading' },
    { t: 'The Almanack',         a: 'Naval Ravikant',   clr: '#8B6B4A', pct: 0,  st: 'to-read' },
    { t: 'Snow Crash',           a: 'Neal Stephenson',  clr: '#4A6B8B', pct: 0,  st: 'to-read' },
    { t: 'Meditations',          a: 'Marcus Aurelius',  clr: '#7A6E52', pct: 0,  st: 'to-read' },
  ];

  books.forEach(({ t, a, clr, pct, st }, i) => {
    const y = 136 + i * 88;
    e.push(rect(24, y, W - 48, 76, surface, { r: 12 }));
    e.push(rect(36, y + 10, 42, 56, clr, { r: 4 }));
    e.push(rect(36, y + 10, 6, 56, 'rgba(0,0,0,0.15)', { r: 2 }));
    e.push(txt(42, y + 24, t.split(' ').slice(0, 2).join('\n'), { size: 8, weight: 700, color: '#FFF', w: 30, font: 'Georgia' }));
    e.push(txt(90, y + 12, t, { size: 14, weight: 600, color: ink, w: W - 160 }));
    e.push(txt(90, y + 32, a, { size: 12, color: muted, w: W - 160 }));
    if (st === 'reading') {
      e.push(rect(90, y + 54, W - 160, 6, tinted, { r: 3 }));
      e.push(rect(90, y + 54, Math.round((W - 160) * pct / 100), 6, clr, { r: 3 }));
      e.push(txt(90, y + 67, pct + '%', { size: 10, color: muted, w: 40 }));
    } else if (st === 'done') {
      e.push(pill(W - 84, y + 28, 52, 22, '#EDF2EE'));
      e.push(txt(W - 76, y + 35, '✓ Done', { size: 11, color: sage, w: 44, weight: 600 }));
    } else {
      e.push(pill(W - 90, y + 28, 58, 22, tinted));
      e.push(txt(W - 82, y + 35, 'To Read', { size: 11, color: muted, w: 50 }));
    }
  });

  return { name: 'Library', width: W, height: H, elements: [...e, ...nav(1)] };
}

// ── S4: DISCOVER ──────────────────────────────────────────────────────────────
function makeDiscover() {
  const e = [];
  e.push(rect(0, 0, W, H, bg));

  e.push(txt(24, 54, 'Discover', { size: 26, weight: 700, font: 'Georgia' }));

  // Search
  e.push(rect(24, 88, W - 48, 44, surface, { r: 14 }));
  e.push(txt(48, 103, '🔍  Search books, authors, subjects…', { size: 14, color: muted, w: W - 72 }));

  // Genre chips
  const genres = ['Philosophy', 'History', 'Science', 'Fiction', 'Essays'];
  let gx = 24;
  genres.forEach((g, i) => {
    const gw = g.length * 8 + 24;
    e.push(pill(gx, 146, gw, 32, i === 0 ? ink : surface));
    e.push(txt(gx + 12, 155, g, { size: 13, weight: i === 0 ? 600 : 400, color: i === 0 ? '#FFF' : ink, w: gw - 16 }));
    gx += gw + 8;
  });

  // Editorial hero
  e.push(txt(24, 194, "Editor's pick", { size: 13, weight: 600, color: muted, ls: 0.3 }));
  e.push(rect(24, 216, W - 48, 160, '#2C1F14', { r: 16 }));
  e.push(txt(40, 234, "EDITOR'S\nPICK", { size: 28, weight: 700, font: 'Georgia', color: 'rgba(255,200,150,0.88)', w: 200 }));
  e.push(txt(40, 316, 'Gödel, Escher, Bach', { size: 16, weight: 600, color: '#FFF', w: 220 }));
  e.push(txt(40, 338, 'Douglas R. Hofstadter', { size: 12, color: 'rgba(255,255,255,0.6)', w: 220 }));
  e.push(pill(W - 106, 350, 74, 28, rust));
  e.push(txt(W - 94, 358, '+ Want it', { size: 12, weight: 700, color: '#FFF', w: 64 }));

  // Because you read
  e.push(txt(24, 394, 'Because you read Eco', { size: 13, color: muted, w: 180 }));
  e.push(txt(212, 394, 'See all', { size: 13, color: rust, w: 60, weight: 600 }));

  const recs = [
    { t: 'The Prague\nCemetery', c: '#3A4B5A' },
    { t: 'Baudolino', c: '#5A3A4B' },
    { t: "Foucault's\nPendulum", c: '#4B5A3A' },
  ];
  recs.forEach((r, i) => {
    const rx = 24 + i * 116;
    e.push(rect(rx, 416, 104, 144, r.c, { r: 8 }));
    e.push(rect(rx, 416, 8, 144, 'rgba(0,0,0,0.2)', { r: 2 }));
    e.push(txt(rx + 12, 432, r.t, { size: 11, weight: 700, color: '#FFF', w: 80, font: 'Georgia' }));
  });

  // Trending
  e.push(ln(24, 574, W - 24, 574));
  e.push(txt(24, 586, 'Trending this week', { size: 13, weight: 600, color: muted, ls: 0.3 }));

  const trends = [
    { n: '1', t: 'The Anxious Generation', a: 'Jonathan Haidt', tag: 'Trending' },
    { n: '2', t: 'Same as Ever',           a: 'Morgan Housel',  tag: 'Finance'  },
    { n: '3', t: 'Meditations',            a: 'Marcus Aurelius',tag: 'Classic'  },
  ];
  trends.forEach(({ n, t, a, tag }, i) => {
    const ty = 610 + i * 60;
    e.push(txt(24, ty + 4, n, { size: 24, weight: 700, color: tinted, w: 24, font: 'Georgia' }));
    e.push(txt(58, ty, t, { size: 14, weight: 600, color: ink, w: W - 142 }));
    e.push(txt(58, ty + 22, a, { size: 12, color: muted, w: W - 142 }));
    e.push(pill(W - 82, ty + 8, 60, 22, tinted));
    e.push(txt(W - 72, ty + 15, tag, { size: 11, color: rust, w: 52, weight: 600 }));
  });

  return { name: 'Discover', width: W, height: H, elements: [...e, ...nav(2)] };
}

// ── S5: INSIGHTS ──────────────────────────────────────────────────────────────
function makeInsights() {
  const e = [];
  e.push(rect(0, 0, W, H, bg));

  e.push(txt(24, 54, 'Insights', { size: 26, weight: 700, font: 'Georgia' }));

  // Period toggle
  ['Week', 'Month', 'Year'].forEach((t, i) => {
    const tx = 24 + i * 82;
    const on = i === 1;
    if (on) e.push(pill(tx - 6, 84, 72, 28, rust));
    e.push(txt(tx + 2, 92, t, { size: 13, weight: on ? 700 : 400, color: on ? '#FFF' : muted, w: 60, align: 'center' }));
  });

  // Big number
  e.push(txt(24, 134, 'PAGES THIS MONTH', { size: 10, weight: 600, color: muted, ls: 1.5 }));
  e.push(txt(24, 154, '1,247', { size: 52, weight: 700, font: 'Georgia', color: ink }));
  e.push(pill(160, 174, 98, 26, '#EDF2EE'));
  e.push(txt(172, 181, '↑ 18% vs Apr', { size: 11, color: sage, w: 82, weight: 600 }));

  // Bar chart
  const barH = 88, chartX = 24, chartY = 224, chartW = W - 48;
  const bars = [42,58,45,68,80,92,75,88,95,104,88,116,108,126,138,142,128,146,136,152,148,158,144,162,170,174,158,168,178,182];
  const maxB = Math.max(...bars);
  const bW = Math.floor(chartW / bars.length) - 1;
  e.push(rect(chartX, chartY, chartW, barH + 16, surface, { r: 12 }));
  bars.forEach((v, i) => {
    const h = Math.round((v / maxB) * (barH - 16));
    const bx = chartX + 8 + i * (bW + 1);
    e.push(rect(bx, chartY + barH - h, bW, h, i === bars.length - 1 ? rust : '#E8D8CB', { r: 2 }));
  });
  e.push(txt(chartX + 8, chartY + barH + 4, 'Mar 1', { size: 9, color: muted, w: 40 }));
  e.push(txt(chartX + chartW - 44, chartY + barH + 4, 'Apr 4', { size: 9, color: muted, w: 36, align: 'right' }));

  // Stats grid (2×2)
  const sgY = chartY + barH + 32;
  const stats = [
    { l: 'Books done',   v: '3',   s: 'this month'  },
    { l: 'Hours read',   v: '41h', s: 'this month'  },
    { l: 'Per session',  v: '38p', s: 'pages avg'   },
    { l: 'Longest run',  v: '14d', s: 'streak days' },
  ];
  stats.forEach(({ l, v, s }, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const sx = 24 + col * ((W - 56) / 2 + 8), sy = sgY + row * 78;
    e.push(rect(sx, sy, (W - 56) / 2, 66, surface, { r: 12 }));
    e.push(txt(sx + 12, sy + 10, v, { size: 26, weight: 700, font: 'Georgia', color: ink }));
    e.push(txt(sx + 12, sy + 40, l, { size: 11, weight: 600, color: muted }));
    e.push(txt(sx + 12, sy + 54, s, { size: 10, color: muted }));
  });

  // Genre bars
  const genreY = sgY + 172;
  e.push(ln(24, genreY, W - 24, genreY));
  e.push(txt(24, genreY + 12, 'By genre', { size: 13, weight: 600, color: muted, ls: 0.3 }));
  [
    { l: 'Literary Fiction', p: 38, c: rust },
    { l: 'Non-fiction',      p: 28, c: sage },
    { l: 'Philosophy',       p: 20, c: '#8B7355' },
    { l: 'Science',          p: 14, c: '#7CA0B8' },
  ].forEach(({ l, p, c }, i) => {
    const gy = genreY + 36 + i * 36;
    e.push(txt(24, gy, l, { size: 13, color: ink, w: 156 }));
    e.push(rect(186, gy + 2, W - 210, 10, tinted, { r: 5 }));
    e.push(rect(186, gy + 2, Math.round((W - 210) * p / 100), 10, c, { r: 5 }));
    e.push(txt(W - 36, gy, p + '%', { size: 12, color: muted, align: 'right', w: 28, weight: 600 }));
  });

  return { name: 'Insights', width: W, height: H, elements: [...e, ...nav(3)] };
}

// ── S6: HIGHLIGHTS ────────────────────────────────────────────────────────────
function makeHighlights() {
  const e = [];
  e.push(rect(0, 0, W, H, bg));

  e.push(txt(24, 54, 'Highlights', { size: 26, weight: 700, font: 'Georgia' }));
  e.push(txt(W - 84, 56, '24 saved', { size: 12, color: muted, align: 'right', w: 72 }));

  e.push(txt(24, 92, 'The Name of the Rose', { size: 14, weight: 600, color: rust, w: W - 84 }));
  e.push(txt(W - 72, 92, 'All books ↓', { size: 12, color: muted, w: 68, align: 'right' }));

  const quotes = [
    {
      q: '"Stat rosa pristina nomine, nomina nuda tenemus." The rose of old is in its name; we hold bare names.',
      p: 'p.502 · epilogue', note: 'Just names remain.', bg: warm,
    },
    {
      q: '"The order that our mind imagines is like a net, or like a ladder, built to attain something. But afterward you must throw the ladder away."',
      p: 'p.208 · day three', note: 'Wittgenstein echoes.', bg: '#EDF2EE',
    },
    {
      q: '"Books are not made to be believed, but to be subjected to inquiry."',
      p: 'p.94 · day one', note: 'Critical reading.', bg: tinted,
    },
  ];

  let qy = 122;
  quotes.forEach(({ q, p, note, bg: qbg }) => {
    const lines = Math.ceil(q.length / 46);
    const ch = 48 + lines * 16;
    e.push(rect(24, qy, W - 48, ch, qbg, { r: 14 }));
    e.push(rect(24, qy, 4, ch, rust, { r: 2 }));
    e.push(txt(38, qy + 12, q, { size: 13, font: 'Georgia', color: ink, w: W - 76 }));
    e.push(ln(38, qy + ch - 28, W - 38, qy + ch - 28));
    e.push(txt(38, qy + ch - 18, p, { size: 11, color: muted, w: 160 }));
    e.push(txt(W - 124, qy + ch - 18, note, { size: 11, color: rust, w: 90, align: 'right', weight: 500 }));
    qy += ch + 10;
  });

  // Export CTA
  e.push(rect(24, qy + 8, W - 48, 50, surface, { r: 14 }));
  e.push(txt(52, qy + 21, '📤  Export all highlights as PDF', { size: 14, color: ink, w: W - 80, weight: 500 }));

  return { name: 'Highlights', width: W, height: H, elements: [...e, ...nav(3)] };
}

// ── WRITE ─────────────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'CANON — Literary Companion',
  screens: [makeToday(), makeBookDetail(), makeLibrary(), makeDiscover(), makeInsights(), makeHighlights()],
};
fs.writeFileSync('canon.pen', JSON.stringify(pen, null, 2));
console.log('✓ canon.pen written —', pen.screens.length, 'screens');
pen.screens.forEach(s => console.log('  ', s.name, '·', s.elements.length, 'elements'));
