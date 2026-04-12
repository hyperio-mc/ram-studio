'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG  = 'floe';
const NAME  = 'FLOE';
const W     = 390;
const H     = 844;

// ── Palette (LIGHT — warm cream editorial) ─────────────────────────
const P = {
  bg:      '#FAF7F2',   // warm cream paper
  surf:    '#FFFFFF',   // white card
  card:    '#F2EDE4',   // warm cream card
  border:  '#E4DDD3',   // warm divider
  text:    '#1C1815',   // near-black ink
  text2:   '#6B5E52',   // secondary warm brown
  muted:   '#A8998D',   // muted warm
  accent:  '#3A5A3E',   // forest ink green
  accent2: '#C17B3A',   // warm amber / bronze
  tag:     '#EAE3D9',   // tag bg
  read:    '#F7F4EF',   // reading surface
  pg:      '#E8DDD1',   // progress bar bg
};

let elements = [];
let screens  = [];
let totalEl  = 0;

// ── Primitives ─────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  const el = { type: 'rect', x, y, width: w, height: h, fill };
  if (opts.rx      != null) el.rx       = opts.rx;
  if (opts.opacity != null) el.opacity  = opts.opacity;
  if (opts.stroke)          el.stroke   = opts.stroke;
  if (opts.sw      != null) el.strokeWidth = opts.sw;
  return el;
}
function text(x, y, content, size, fill, opts = {}) {
  const el = { type: 'text', x, y, content: String(content), fontSize: size, fill };
  if (opts.fw     != null) el.fontWeight  = opts.fw;
  if (opts.font)           el.fontFamily  = opts.font;
  if (opts.anchor)         el.textAnchor  = opts.anchor;
  if (opts.ls     != null) el.letterSpacing = opts.ls;
  if (opts.opacity!= null) el.opacity     = opts.opacity;
  return el;
}
function circle(cx, cy, r, fill, opts = {}) {
  const el = { type: 'circle', cx, cy, r, fill };
  if (opts.opacity!= null) el.opacity = opts.opacity;
  if (opts.stroke)         el.stroke  = opts.stroke;
  if (opts.sw    != null)  el.strokeWidth = opts.sw;
  return el;
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  const el = { type: 'line', x1, y1, x2, y2, stroke };
  if (opts.sw     != null) el.strokeWidth = opts.sw;
  if (opts.opacity!= null) el.opacity     = opts.opacity;
  return el;
}

function push(el) { elements.push(el); }
function flush(screenName) {
  totalEl += elements.length;
  screens.push({ name: screenName, svg: '', elements: [...elements] });
  elements = [];
}

// ── Shared Components ──────────────────────────────────────────────
function statusBar(y = 0) {
  push(rect(0, y, W, 44, P.bg));
  push(text(20, y + 28, '9:41', 13, P.text, { fw: 600 }));
  push(text(W - 20, y + 28, '●●●', 11, P.text2, { anchor: 'end' }));
}

function bottomNav(active = 0) {
  const y = H - 80;
  push(rect(0, y, W, 80, P.surf, { rx: 0 }));
  push(line(0, y, W, y, P.border, { sw: 0.5 }));
  const tabs = [
    { icon: '⌂', label: 'Library' },
    { icon: '◎', label: 'Discover' },
    { icon: '◯', label: 'Focus' },
    { icon: '◈', label: 'Notes' },
    { icon: '◷', label: 'Profile' },
  ];
  const seg = W / tabs.length;
  tabs.forEach((t, i) => {
    const cx = seg * i + seg / 2;
    const col = i === active ? P.accent : P.muted;
    push(text(cx, y + 24, t.icon, 18, col, { anchor: 'middle' }));
    push(text(cx, y + 42, t.label, 9, col, { anchor: 'middle', ls: 0.3 }));
    if (i === active) {
      push(rect(cx - 12, y + 4, 24, 3, P.accent, { rx: 2 }));
    }
  });
}

// ────────────────────────────────────────────────────────────────────
// SCREEN 1 — Library (Home)
// ────────────────────────────────────────────────────────────────────
(function screenLibrary() {
  push(rect(0, 0, W, H, P.bg));
  statusBar(0);

  // Header
  push(text(24, 80, 'Good morning,', 13, P.text2, { fw: 400 }));
  push(text(24, 108, 'Your Library', 28, P.text, { fw: 700, font: 'Georgia, serif', ls: -0.5 }));

  // Search bar
  push(rect(24, 124, W - 48, 40, P.surf, { rx: 10, stroke: P.border, sw: 1 }));
  push(text(48, 149, 'Search your library...', 13, P.muted));
  push(text(36, 149, '⌕', 15, P.muted));

  // "Continue Reading" section
  push(text(24, 188, 'CONTINUE READING', 9, P.muted, { fw: 600, ls: 1.5 }));

  // Featured card — big
  push(rect(24, 200, W - 48, 120, P.surf, { rx: 14, stroke: P.border, sw: 1 }));
  // accent strip
  push(rect(24, 200, 5, 120, P.accent, { rx: 2 }));
  // Article title
  push(text(44, 222, 'The Last Craftsmen of', 14, P.text, { fw: 600, font: 'Georgia, serif' }));
  push(text(44, 240, "Oaxaca's Valley", 14, P.text, { fw: 600, font: 'Georgia, serif' }));
  push(text(44, 260, 'The New Yorker', 11, P.text2 ));
  // Progress
  push(rect(44, 276, 220, 5, P.pg, { rx: 3 }));
  push(rect(44, 276, 132, 5, P.accent, { rx: 3 }));
  push(text(276, 281, '60% read', 10, P.muted));
  // Time badge
  push(rect(W - 80, 205, 50, 20, P.tag, { rx: 10 }));
  push(text(W - 55, 218, '18 min', 10, P.text2, { anchor: 'middle' }));

  // Grid of saved articles
  push(text(24, 342, 'SAVED', 9, P.muted, { fw: 600, ls: 1.5 }));

  const articles = [
    { title: 'Why Silence Is', sub: 'Aeon · 12 min', pct: 0 },
    { title: 'On Walking Slowly', sub: 'The Atlantic · 8 min', pct: 0 },
    { title: 'Deep Work & Flow', sub: 'Cal Newport · 22 min', pct: 30 },
    { title: 'Letters to No One', sub: 'The Paris Review', pct: 0 },
  ];
  articles.forEach((a, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx  = 24 + col * (W / 2 - 20);
    const cy  = 358 + row * 105;
    const cw  = W / 2 - 32;
    push(rect(cx, cy, cw, 94, P.surf, { rx: 12, stroke: P.border, sw: 1 }));
    // color dots
    const dotColor = [P.accent, P.accent2, '#7B9FC4', '#C17B3A'][i];
    push(circle(cx + 14, cy + 14, 5, dotColor));
    push(text(cx + 10, cy + 38, a.title, 12, P.text, { fw: 600, font: 'Georgia, serif' }));
    push(text(cx + 10, cy + 54, a.sub, 10, P.text2));
    if (a.pct > 0) {
      push(rect(cx + 10, cy + 70, cw - 20, 4, P.pg, { rx: 2 }));
      push(rect(cx + 10, cy + 70, (cw - 20) * a.pct / 100, 4, P.accent2, { rx: 2 }));
    } else {
      push(rect(cx + 10, cy + 70, 40, 18, P.tag, { rx: 9 }));
      push(text(cx + 30, cy + 82, 'New', 10, P.text2, { anchor: 'middle' }));
    }
  });

  // Streak widget
  const sy = 578;
  push(rect(24, sy, W - 48, 60, P.card, { rx: 14 }));
  push(text(44, sy + 22, '🔥', 16, P.text));
  push(text(68, sy + 22, '7-day reading streak', 13, P.text, { fw: 600 }));
  push(text(68, sy + 40, 'You\'ve read every day this week', 11, P.text2));
  push(text(W - 40, sy + 32, '›', 18, P.muted, { anchor: 'end' }));

  // Daily reading goal widget
  const gy2 = 648;
  push(rect(24, gy2, W - 48, 52, P.card, { rx: 14 }));
  push(text(40, gy2 + 17, 'Daily Goal', 12, P.text, { fw: 600 }));
  push(text(40, gy2 + 35, '24 / 30 min today', 11, P.text2));
  push(rect(130, gy2 + 27, 160, 6, P.pg, { rx: 3 }));
  push(rect(130, gy2 + 27, 128, 6, P.accent2, { rx: 3 }));
  push(text(W - 30, gy2 + 29, '80%', 11, P.accent2, { anchor: 'end', fw: 700 }));

  // Ambient decorative lines — page texture
  for (let li = 0; li < 6; li++) {
    push(line(0, 170 + li, W, 170 + li, P.border, { sw: 0.2, opacity: 0.3 }));
  }
  // Corner ornament top-right header
  push(circle(W - 30, 90, 18, P.tag, { opacity: 0.6 }));
  push(text(W - 30, 95, '✦', 11, P.accent2, { anchor: 'middle' }));

  // Notification dot
  push(circle(W - 26, 66, 5, P.accent2));
  push(text(W - 26, 70, '3', 8, '#FFF', { anchor: 'middle', fw: 700 }));
  push(circle(W - 52, 66, 4, P.border, { opacity: 0.6 }));

  // More article cards row —  scroll indicator
  push(text(W - 24, 342, 'See all ›', 11, P.accent, { anchor: 'end', fw: 600 }));
  push(line(24, 560, W - 24, 560, P.border, { sw: 0.5 }));

  // Dot pagination
  [0,1,2].forEach((d, i) => {
    push(circle(W / 2 - 12 + i * 12, 570, i === 0 ? 4 : 3, i === 0 ? P.accent : P.pg));
  });

  bottomNav(0);
  flush('Library');
})();

// ────────────────────────────────────────────────────────────────────
// SCREEN 2 — Article View (before focus mode)
// ────────────────────────────────────────────────────────────────────
(function screenArticle() {
  push(rect(0, 0, W, H, P.read));
  statusBar(0);

  // Top bar
  push(rect(0, 44, W, 52, P.read));
  push(text(24, 76, '‹', 22, P.text2));
  push(text(W / 2, 76, 'The New Yorker', 12, P.text2, { anchor: 'middle', fw: 500 }));
  push(text(W - 24, 72, '⊙', 22, P.text2, { anchor: 'end' }));
  push(line(0, 96, W, 96, P.border, { sw: 0.5 }));

  // Ambient lines — simulating ruled paper reading surface
  for (let rl = 0; rl < 12; rl++) {
    push(line(0, 130 + rl * 28, W, 130 + rl * 28, P.border, { sw: 0.15, opacity: 0.12 }));
  }

  // Category pill
  push(rect(24, 110, 74, 22, P.tag, { rx: 11 }));
  push(text(61, 124, 'CULTURE', 9, P.text2, { anchor: 'middle', fw: 600, ls: 0.8 }));

  // Title (large serif)
  push(text(24, 154, 'The Last Craftsmen', 26, P.text, { fw: 700, font: 'Georgia, serif', ls: -0.5 }));
  push(text(24, 184, 'of Oaxaca\'s Valley', 26, P.text, { fw: 700, font: 'Georgia, serif', ls: -0.5 }));

  // Byline
  push(line(24, 198, 24 + 30, 198, P.accent, { sw: 2 }));
  push(text(62, 200, 'By Marco Reyes  ·  March 2026', 11, P.text2));

  // Reading time + save
  push(text(24, 222, '18 min read', 11, P.muted));
  push(text(W - 24, 222, '♡ Save', 11, P.accent2, { anchor: 'end', fw: 600 }));

  // Divider
  push(line(24, 234, W - 24, 234, P.border, { sw: 0.5 }));

  // Drop cap first paragraph
  push(text(24, 278, 'I', 54, P.accent, { fw: 700, font: 'Georgia, serif' }));
  push(text(52, 256, 'n the high desert town of Tlacolula,', 13, P.text, { font: 'Georgia, serif' }));
  push(text(28, 274, 'the market opens before sunrise. Don', 13, P.text, { font: 'Georgia, serif' }));
  push(text(28, 292, 'Aurelio has been setting up his stall', 13, P.text, { font: 'Georgia, serif' }));
  push(text(28, 310, 'since 1971. His hands, calloused and', 13, P.text, { font: 'Georgia, serif' }));
  push(text(28, 328, 'sure, work the black clay into shapes', 13, P.text, { font: 'Georgia, serif' }));
  push(text(28, 346, 'that have not changed in five centuries.', 13, P.text, { font: 'Georgia, serif' }));

  push(text(28, 374, 'The craft is under threat. Cheap imports', 13, P.text2, { font: 'Georgia, serif' }));
  push(text(28, 392, 'from China and shifting tastes in Mexico', 13, P.text2, { font: 'Georgia, serif' }));
  push(text(28, 410, 'City have cut his sales by half over', 13, P.text2, { font: 'Georgia, serif' }));
  push(text(28, 428, 'the past decade. Yet he refuses to stop.', 13, P.text2, { font: 'Georgia, serif' }));

  // Pull quote
  push(rect(24, 444, 3, 56, P.accent2, { rx: 1.5 }));
  push(text(38, 462, '"The clay remembers', 15, P.text, { fw: 600, font: 'Georgia, serif', fw: 700 }));
  push(text(38, 482, 'what we have forgotten."', 15, P.accent, { fw: 600, font: 'Georgia, serif' }));

  // Reading controls
  push(rect(0, H - 136, W, 56, P.surf));
  push(line(0, H - 136, W, H - 136, P.border, { sw: 0.5 }));
  const progress = 0.6;
  push(rect(0, H - 130, W, 4, P.pg));
  push(rect(0, H - 130, W * progress, 4, P.accent));
  push(text(24, H - 102, '60%', 12, P.text, { fw: 700 }));
  push(text(W / 2, H - 102, '◎ Focus Mode', 13, P.accent, { anchor: 'middle', fw: 600 }));
  push(text(W - 24, H - 102, 'Aa', 14, P.text2, { anchor: 'end', fw: 600 }));

  bottomNav(0);
  flush('Article View');
})();

// ────────────────────────────────────────────────────────────────────
// SCREEN 3 — Focus Reading Mode
// ────────────────────────────────────────────────────────────────────
(function screenFocus() {
  push(rect(0, 0, W, H, P.read));

  // Minimal top bar
  push(text(24, 38, 'FOCUS', 10, P.muted, { fw: 600, ls: 2 }));
  push(text(W - 24, 38, '✕', 15, P.muted, { anchor: 'end' }));
  push(line(0, 50, W, 50, P.border, { sw: 0.5, opacity: 0.5 }));

  // Ambient page lines
  for (let pl = 0; pl < 18; pl++) {
    push(line(28, 148 + pl * 26, W - 28, 148 + pl * 26, P.border, { sw: 0.15, opacity: 0.1 }));
  }

  // Session timer
  const ty = 70;
  push(rect(W / 2 - 50, ty, 100, 28, P.tag, { rx: 14 }));
  push(text(W / 2, ty + 18, '⏱  24:38', 12, P.text2, { anchor: 'middle', fw: 600 }));

  // Reading content — clean focused typography
  push(text(28, 126, 'continuation...', 12, P.muted, { font: 'Georgia, serif', opacity: 0.6 }));
  push(line(28, 136, W - 28, 136, P.border, { sw: 0.5, opacity: 0.4 }));

  const lines = [
    'That afternoon, Don Aurelio takes',
    'me into the room where he fires',
    'his pieces. The kiln is three feet',
    'wide, built from adobe brick his',
    'grandfather laid. He opens the',
    'wooden door and the smell of earth',
    'and heat fills the narrow space.',
    '',
    '"My son wants to study in the city,"',
    'he says without turning. "I told',
    'him: go. Learn everything. Then',
    'come back and learn this."',
    '',
    'The clay cools on a wooden shelf.',
    'A jaguar. A woman carrying water.',
    'A church that looks like his own.',
  ];
  lines.forEach((l, i) => {
    if (l === '') return;
    const isQuote = l.startsWith('"');
    push(text(28, 162 + i * 22, l, 15, isQuote ? P.accent : P.text,
      { font: 'Georgia, serif', ls: 0.1, fw: isQuote ? 600 : 400 }));
  });

  // Bookmark highlight overlay
  push(rect(24, 272, W - 48, 68, P.accent2, { rx: 0, opacity: 0.06 }));
  push(rect(24, 272, 2, 68, P.accent2, { rx: 1 }));

  // Estimated words remaining
  push(text(W / 2, H - 160, '1,240 words remaining', 11, P.muted, { anchor: 'middle' }));

  // Focus progress ring (simplified)
  push(rect(W / 2 - 50, H - 140, 100, 6, P.pg, { rx: 3 }));
  push(rect(W / 2 - 50, H - 140, 60, 6, P.accent, { rx: 3 }));
  push(text(W / 2, H - 122, '60% complete', 11, P.text2, { anchor: 'middle' }));

  // Controls
  push(rect(0, H - 98, W, 98, P.surf));
  push(line(0, H - 98, W, H - 98, P.border, { sw: 0.5 }));
  const btns = ['‹‹ Back', '⟨ Highlight', 'Note ⟩', 'Done ✓'];
  btns.forEach((b, i) => {
    const bx = 14 + i * 92;
    const active = i === 3;
    push(rect(bx, H - 80, 78, 34, active ? P.accent : P.tag, { rx: 8 }));
    push(text(bx + 39, H - 57, b, 11, active ? '#FFF' : P.text2, { anchor: 'middle', fw: active ? 700 : 400 }));
  });

  // Extra paragraph below highlight
  const extraLines = [
    'Don Aurelio does not speak of legacy.',
    'He speaks of clay, and fire, and what',
    'a piece needs to survive the kiln.',
    '',
    'I ask about his son. He is quiet for',
    'a moment, then places a finished jar',
    'on the shelf beside the others.',
    '"He will understand," he says.',
    '"When he is ready, the clay will wait."',
  ];
  extraLines.forEach((l, i) => {
    if (!l) return;
    const isQ = l.startsWith('"');
    push(text(28, 378 + i * 22, l, 15, isQ ? P.accent : P.text,
      { font: 'Georgia, serif', ls: 0.1, fw: isQ ? 600 : 400 }));
  });

  // Margin annotation
  push(rect(W - 30, 400, 18, 58, P.tag, { rx: 9 }));
  push(text(W - 21, 414, '✎', 11, P.accent2, { anchor: 'middle' }));
  push(text(W - 21, 430, 'note', 8, P.muted, { anchor: 'middle' }));

  // Chapter indicator dots left margin
  [0.2, 0.4, 0.6, 0.8].forEach((pct, i) => {
    const dotY = 162 + Math.round(pct * 200);
    push(circle(12, dotY, i === 2 ? 3 : 2, i === 2 ? P.accent2 : P.border));
  });

  // Horizontal rule decorative
  push(line(28, 370, W - 28, 370, P.border, { sw: 0.5, opacity: 0.5 }));
  push(circle(W / 2, 370, 3, P.border));

  // Font size indicator
  push(text(24, H - 108, 'Aa', 13, P.muted, { fw: 600 }));
  push(text(52, H - 108, '|', 13, P.border));
  push(text(62, H - 108, 'Georgia', 12, P.text2));

  flush('Focus Mode');
})();

// ────────────────────────────────────────────────────────────────────
// SCREEN 4 — Highlights & Notes
// ────────────────────────────────────────────────────────────────────
(function screenHighlights() {
  push(rect(0, 0, W, H, P.bg));
  statusBar(0);

  // Header
  push(text(24, 80, 'Highlights & Notes', 22, P.text, { fw: 700, font: 'Georgia, serif' }));
  push(text(24, 104, '12 highlights across 4 articles', 13, P.text2));
  push(text(W - 24, 80, '⊕', 22, P.accent, { anchor: 'end' }));

  // Filter pills
  const filters = ['All', 'Insights', 'Questions', 'Memorable'];
  let fx = 24;
  filters.forEach((f, i) => {
    const fw = f.length * 8 + 24;
    push(rect(fx, 118, fw, 26, i === 0 ? P.accent : P.tag, { rx: 13 }));
    push(text(fx + fw / 2, 134, f, 11, i === 0 ? '#FFF' : P.text2, { anchor: 'middle', fw: i === 0 ? 600 : 400 }));
    fx += fw + 8;
  });

  push(line(24, 158, W - 24, 158, P.border, { sw: 0.5 }));

  // Article group header
  push(text(24, 180, 'The Last Craftsmen of Oaxaca\'s Valley', 13, P.text, { fw: 600 }));
  push(text(24, 198, 'The New Yorker · Read Mar 15', 11, P.muted));

  const highlights = [
    {
      color: P.accent2,
      text: '"The clay remembers what we have forgotten."',
      note: 'Core thesis of the whole piece',
      tag: 'Memorable',
    },
    {
      color: P.accent,
      text: 'His hands, calloused and sure, work the black clay into shapes that have not changed in five centuries.',
      note: '',
      tag: 'Insight',
    },
    {
      color: '#7B9FC4',
      text: '"My son wants to study in the city," he says without turning.',
      note: 'The generational tension is so quietly stated here',
      tag: 'Question',
    },
  ];

  let hy = 216;
  highlights.forEach((h) => {
    const hh = h.note ? 102 : 80;
    push(rect(24, hy, W - 48, hh, P.surf, { rx: 12, stroke: P.border, sw: 0.5 }));
    push(rect(24, hy, 4, hh, h.color, { rx: 2 }));
    // Tag pill
    push(rect(W - 68, hy + 8, 50, 18, P.tag, { rx: 9 }));
    push(text(W - 43, hy + 19, h.tag, 9, P.text2, { anchor: 'middle' }));
    // Highlight text
    push(text(38, hy + 26, h.text.substring(0, 45), 12, P.text, { fw: 400, font: 'Georgia, serif', fw: 500 }));
    if (h.text.length > 45) {
      push(text(38, hy + 42, h.text.substring(45, 90) + (h.text.length > 90 ? '...' : ''), 12, P.text, { font: 'Georgia, serif' }));
    }
    if (h.note) {
      push(line(38, hy + hh - 34, W - 38, hy + hh - 34, P.border, { sw: 0.5 }));
      push(text(42, hy + hh - 18, '✎ ' + h.note, 11, P.text2));
    }
    hy += hh + 10;
  });

  // Second article
  push(text(24, hy + 12, 'On Walking Slowly', 13, P.text, { fw: 600 }));
  push(text(24, hy + 30, 'The Atlantic · 0% read', 11, P.muted));
  push(rect(24, hy + 44, W - 48, 54, P.surf, { rx: 12, stroke: P.border, sw: 0.5 }));
  push(rect(24, hy + 44, 4, 54, P.accent, { rx: 2 }));
  push(text(38, hy + 64, 'To walk slowly is to practice', 12, P.text, { font: 'Georgia, serif', fw: 500 }));
  push(text(38, hy + 80, 'resistance in a world of speed.', 12, P.text, { font: 'Georgia, serif' }));

  // Export / share actions
  push(rect(24, hy + 110, W - 48, 44, P.surf, { rx: 12, stroke: P.border, sw: 0.5 }));
  push(text(44, hy + 136, '↗ Export all highlights as Markdown', 13, P.text2));
  push(text(W - 36, hy + 136, '›', 18, P.muted, { anchor: 'end' }));

  // Insight count stats row
  push(rect(24, hy + 112, (W - 56) / 3, 36, P.tag, { rx: 10 }));
  push(rect(24 + (W - 56) / 3 + 8, hy + 112, (W - 56) / 3, 36, P.tag, { rx: 10 }));
  push(rect(24 + ((W - 56) / 3 + 8) * 2, hy + 112, (W - 56) / 3, 36, P.tag, { rx: 10 }));
  push(text(24 + (W - 56) / 6, hy + 126, '12', 16, P.accent, { anchor: 'middle', fw: 700 }));
  push(text(24 + (W - 56) / 6, hy + 140, 'highlights', 9, P.text2, { anchor: 'middle' }));
  push(text(24 + (W - 56) / 3 + 8 + (W - 56) / 6, hy + 126, '5', 16, P.accent2, { anchor: 'middle', fw: 700 }));
  push(text(24 + (W - 56) / 3 + 8 + (W - 56) / 6, hy + 140, 'notes', 9, P.text2, { anchor: 'middle' }));
  push(text(24 + ((W - 56) / 3 + 8) * 2 + (W - 56) / 6, hy + 126, '4', 16, P.text, { anchor: 'middle', fw: 700 }));
  push(text(24 + ((W - 56) / 3 + 8) * 2 + (W - 56) / 6, hy + 140, 'articles', 9, P.text2, { anchor: 'middle' }));

  // Tag cloud
  push(text(24, hy + 172, 'YOUR TAGS', 9, P.muted, { fw: 600, ls: 1.5 }));
  const tagList = ['craft', 'Mexico', 'memory', 'identity', 'slow-living', 'place'];
  let tx = 24, ty2 = hy + 185;
  tagList.forEach((tg, i) => {
    const tw = tg.length * 7 + 20;
    if (tx + tw > W - 20) { tx = 24; ty2 += 28; }
    push(rect(tx, ty2, tw, 22, P.tag, { rx: 11 }));
    push(text(tx + tw / 2, ty2 + 14, tg, 10, P.text2, { anchor: 'middle' }));
    tx += tw + 8;
  });

  // Horizontal dividers between sections
  push(line(24, hy + 100, W - 24, hy + 100, P.border, { sw: 0.5 }));
  push(line(24, hy + 158, W - 24, hy + 158, P.border, { sw: 0.5 }));

  // Ambient page lines
  for (let pl = 0; pl < 4; pl++) {
    push(line(0, 165 + pl * 2, W, 165 + pl * 2, P.border, { sw: 0.15, opacity: 0.2 }));
  }

  bottomNav(3);
  flush('Highlights & Notes');
})();

// ────────────────────────────────────────────────────────────────────
// SCREEN 5 — Discover
// ────────────────────────────────────────────────────────────────────
(function screenDiscover() {
  push(rect(0, 0, W, H, P.bg));
  statusBar(0);

  push(text(24, 80, 'Discover', 26, P.text, { fw: 700, font: 'Georgia, serif' }));
  push(text(24, 104, 'Curated for slow readers', 13, P.text2 ));

  // Category pills
  const cats = ['For You', 'Long Reads', 'Essays', 'Science', 'Culture'];
  let cx = 24;
  cats.forEach((c, i) => {
    const cw = c.length * 8 + 20;
    push(rect(cx, 118, cw, 28, i === 0 ? P.text : P.tag, { rx: 14 }));
    push(text(cx + cw / 2, 135, c, 11, i === 0 ? P.bg : P.text2, { anchor: 'middle', fw: i === 0 ? 700 : 400 }));
    cx += cw + 8;
  });

  // Hero feature
  push(rect(24, 158, W - 48, 140, P.card, { rx: 16, stroke: P.border, sw: 1 }));
  push(rect(24, 158, W - 48, 80, P.accent, { rx: 16 }));
  push(rect(24, 214, W - 48, 24, P.accent, { rx: 0 }));
  push(text(40, 190, 'EDITOR\'S PICK', 10, '#FFFFFF', { fw: 700, ls: 1.5, opacity: 0.8 }));
  push(text(40, 208, '↑ Most read this week', 11, '#FFFFFF', { opacity: 0.9 }));
  push(rect(W - 70, 163, 40, 20, 'rgba(255,255,255,0.2)', { rx: 10 }));
  push(text(W - 50, 176, '45 min', 10, '#FFF', { anchor: 'middle' }));
  push(text(40, 250, 'The Architecture of', 15, P.text, { fw: 700, font: 'Georgia, serif' }));
  push(text(40, 268, 'Memory and Place', 15, P.text, { fw: 700, font: 'Georgia, serif' }));
  push(text(40, 286, 'Literary Review · Joshua Freeman', 11, P.text2 ));

  // List of articles
  push(text(24, 316, 'LONG READS', 9, P.muted, { fw: 600, ls: 1.5 }));

  const disc = [
    { title: 'Against Productivity', pub: 'Wired · 28 min', color: P.accent2 },
    { title: 'The Science of Boredom', pub: 'Scientific American · 14 min', color: '#7B9FC4' },
    { title: 'How Cities Forget', pub: 'n+1 · 32 min', color: P.accent },
    { title: 'Notes on Solitude', pub: 'Granta · 20 min', color: '#9B7EC8' },
  ];
  disc.forEach((d, i) => {
    const dy = 330 + i * 78;
    push(rect(24, dy, W - 48, 66, P.surf, { rx: 12, stroke: P.border, sw: 0.5 }));
    push(circle(44, dy + 20, 8, d.color, { opacity: 0.2 }));
    push(circle(44, dy + 20, 4, d.color));
    push(text(62, dy + 18, d.title, 14, P.text, { fw: 600, font: 'Georgia, serif' }));
    push(text(62, dy + 36, d.pub, 11, P.text2 ));
    push(text(W - 36, dy + 26, '+ Save', 11, P.accent, { anchor: 'end', fw: 600 }));
    push(line(24, dy + 66, W - 24, dy + 66, P.border, { sw: 0.5, opacity: 0.5 }));
  });

  // "Reading Time" badge strip
  push(rect(24, H - 168, W - 48, 36, P.card, { rx: 10 }));
  push(text(44, H - 144, '⌛  Best for weeknight reading: 12–22 min pieces', 11, P.text2));

  // Subtle decorative grid
  for (let gi = 0; gi < 5; gi++) {
    push(line(0, 150 + gi * 20, W, 150 + gi * 20, P.border, { sw: 0.15, opacity: 0.15 }));
  }

  // Save all button
  push(rect(24, H - 124, W - 48, 38, P.surf, { rx: 10, stroke: P.border, sw: 1 }));
  push(text(W / 2, H - 99, '+ Save all 4 to library', 13, P.accent, { anchor: 'middle', fw: 600 }));

  // Pagination
  [0,1,2,3].forEach((d, i) => {
    push(circle(W / 2 - 18 + i * 12, H - 82, i === 0 ? 4 : 3, i === 0 ? P.text : P.pg));
  });

  bottomNav(1);
  flush('Discover');
})();

// ────────────────────────────────────────────────────────────────────
// SCREEN 6 — Reading Profile / Stats
// ────────────────────────────────────────────────────────────────────
(function screenProfile() {
  push(rect(0, 0, W, H, P.bg));
  statusBar(0);

  // Header
  push(circle(W / 2, 94, 36, P.card, { stroke: P.border, sw: 1.5 }));
  push(text(W / 2, 100, 'M', 28, P.text, { anchor: 'middle', fw: 700, font: 'Georgia, serif' }));
  push(text(W / 2, 150, 'Maya Chen', 18, P.text, { anchor: 'middle', fw: 700 }));
  push(text(W / 2, 170, 'Slow Reader · Level 4', 12, P.text2, { anchor: 'middle' }));

  // Stats row
  const stats = [
    { val: '68', label: 'Articles\nRead' },
    { val: '47h', label: 'Time\nReading' },
    { val: '12', label: 'Day\nStreak' },
  ];
  const sw = (W - 48) / 3;
  stats.forEach((s, i) => {
    const sx = 24 + i * sw;
    push(rect(sx, 186, sw - 8, 64, P.surf, { rx: 12, stroke: P.border, sw: 0.5 }));
    push(text(sx + (sw - 8) / 2, 214, s.val, 22, P.accent, { anchor: 'middle', fw: 700 }));
    push(text(sx + (sw - 8) / 2, 234, s.label.split('\n')[0], 10, P.text2, { anchor: 'middle' }));
    push(text(sx + (sw - 8) / 2, 246, s.label.split('\n')[1], 10, P.text2, { anchor: 'middle' }));
  });

  // Reading pace chart — bar chart (weekly)
  push(text(24, 276, 'READING PACE', 9, P.muted, { fw: 600, ls: 1.5 }));
  push(rect(24, 286, W - 48, 110, P.surf, { rx: 14, stroke: P.border, sw: 0.5 }));

  const bars = [35, 55, 20, 80, 65, 45, 90];
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const bw   = 28;
  const maxH = 60;
  bars.forEach((b, i) => {
    const bx = 36 + i * 42;
    const bh = (b / 100) * maxH;
    const isToday = i === 6;
    push(rect(bx, 286 + 20 + (maxH - bh), bw, bh, isToday ? P.accent : P.pg, { rx: 4 }));
    push(text(bx + bw / 2, 386, days[i], 10, isToday ? P.accent : P.text2, { anchor: 'middle', fw: isToday ? 700 : 400 }));
  });
  push(text(W / 2, 314, 'avg 34 min/day', 11, P.text2, { anchor: 'middle' }));

  // Genres
  push(text(24, 416, 'TOP GENRES', 9, P.muted, { fw: 600, ls: 1.5 }));
  const genres = [
    { label: 'Essays', pct: 42, color: P.accent },
    { label: 'Science', pct: 28, color: '#7B9FC4' },
    { label: 'Culture', pct: 18, color: P.accent2 },
    { label: 'Tech', pct: 12, color: '#9B7EC8' },
  ];
  genres.forEach((g, i) => {
    const gy = 428 + i * 32;
    push(text(24, gy + 14, g.label, 12, P.text));
    push(text(W - 24, gy + 14, g.pct + '%', 12, P.text2, { anchor: 'end' }));
    push(rect(80, gy + 4, W - 130, 10, P.pg, { rx: 5 }));
    push(rect(80, gy + 4, (W - 130) * g.pct / 100, 10, g.color, { rx: 5 }));
  });

  // Settings link
  push(rect(24, 562, W - 48, 44, P.surf, { rx: 12, stroke: P.border, sw: 0.5 }));
  push(text(44, 588, '⚙ App Settings', 14, P.text2));
  push(text(W - 36, 588, '›', 18, P.muted, { anchor: 'end' }));

  // Recent activity log
  push(text(24, 618, 'RECENT ACTIVITY', 9, P.muted, { fw: 600, ls: 1.5 }));
  const activity = [
    { icon: '✓', msg: 'Finished "The Last Craftsmen of Oaxaxa\'s Valley"', time: '2h ago' },
    { icon: '♡', msg: 'Saved "Against Productivity" to library', time: 'Yesterday' },
    { icon: '✎', msg: 'Added 3 highlights to "On Walking Slowly"', time: '2 days ago' },
  ];
  activity.forEach((a, i) => {
    const ay = 632 + i * 36;
    push(circle(36, ay + 10, 7, P.tag));
    push(text(36, ay + 14, a.icon, 9, P.accent, { anchor: 'middle' }));
    push(text(52, ay + 10, a.msg.substring(0, 36), 11, P.text));
    push(text(52, ay + 24, a.time, 10, P.muted));
    push(line(24, ay + 34, W - 24, ay + 34, P.border, { sw: 0.5, opacity: 0.4 }));
  });

  // Decorative column lines
  for (let cl = 0; cl < 3; cl++) {
    push(line(24 + cl * sw, 186, 24 + cl * sw, 250, P.border, { sw: 0.5, opacity: 0.5 }));
  }

  // Reading level badge
  push(rect(W / 2 - 60, 172, 120, 22, P.tag, { rx: 11 }));
  push(text(W / 2, 186, '◆ Deep Reader · Level 4', 10, P.accent, { anchor: 'middle', fw: 600 }));

  // Next level progress
  push(text(24, 558, 'Level 5 progress:', 11, P.text2));
  push(rect(130, 551, W - 154, 8, P.pg, { rx: 4 }));
  push(rect(130, 551, (W - 154) * 0.68, 8, P.accent, { rx: 4 }));
  push(text(W - 18, 558, '68%', 10, P.accent, { anchor: 'end', fw: 700 }));

  // Ambient background decorative dots — book grid
  const dotPositions = [[20,280],[W-20,280],[20,350],[W-20,350],[20,420],[W-20,420],[20,490],[W-20,490]];
  dotPositions.forEach(([dx, dy]) => {
    push(circle(dx, dy, 2, P.border, { opacity: 0.3 }));
  });

  // Ambient page rule at top
  push(line(24, 176, W - 24, 176, P.border, { sw: 1 }));
  push(line(24, 178, W - 24, 178, P.border, { sw: 0.3, opacity: 0.4 }));

  bottomNav(4);
  flush('Profile & Stats');
})();

// ── Write pen file ─────────────────────────────────────────────────
const pen = {
  version: '2.8',
  metadata: {
    name:      'FLOE — Slow Reading App',
    author:    'RAM',
    date:      new Date().toISOString(),
    theme:     'light',
    heartbeat: 43,
    elements:  totalEl,
    palette:   P,
    slug:      SLUG,
  },
  screens,
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalEl} elements`);
console.log(`Written: ${SLUG}.pen`);
