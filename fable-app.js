#!/usr/bin/env node
// FABLE — read deeply, not just more
// Light-theme slow-reading & focus companion
// Inspired by: Dawn (Lapa Ninja wellness gradient), Land-book library aesthetic, Minimal Gallery editorial type

const fs = require('fs');

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const P = {
  cream:      '#F7F3ED',   // warm cream bg
  parchment:  '#EDE8DF',   // card surface
  espresso:   '#1C1714',   // primary text
  terracotta: '#C4613A',   // warm accent
  sage:       '#6B9E78',   // calming accent
  dust:       '#C8C0B4',   // muted dividers
  warm_white: '#FDFAF7',   // elevated surface
  blush:      '#F2E8E1',   // soft hover state
  ink:        '#2E2420',   // secondary text
  fog:        'rgba(28,23,20,0.38)',
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
let idCounter = 1;
const uid = () => `el_${(idCounter++).toString().padStart(4,'0')}`;

function frame(x, y, w, h, name, opts = {}) {
  return {
    id: uid(), type: 'FRAME',
    name, x, y, width: w, height: h,
    backgroundColor: opts.bg || P.cream,
    cornerRadius: opts.r || 0,
    clipsContent: opts.clip !== false,
    children: opts.children || [],
    ...opts.extra,
  };
}

function rect(x, y, w, h, fill, opts = {}) {
  return {
    id: uid(), type: 'RECTANGLE',
    name: opts.name || 'Rect',
    x, y, width: w, height: h,
    fills: [{ type: 'SOLID', color: hexToRgb(fill), opacity: opts.opacity || 1 }],
    cornerRadius: opts.r || 0,
    strokes: opts.stroke ? [{ type: 'SOLID', color: hexToRgb(opts.stroke), opacity: 0.15 }] : [],
    strokeWidth: opts.strokeWidth || 1,
  };
}

function text(x, y, w, content, opts = {}) {
  return {
    id: uid(), type: 'TEXT',
    name: opts.name || content.slice(0,30),
    x, y, width: w, height: opts.h || 'auto',
    characters: content,
    fontSize: opts.size || 14,
    fontWeight: opts.weight || 400,
    fontFamily: opts.font || 'Inter',
    color: hexToRgb(opts.color || P.espresso),
    opacity: opts.opacity || 1,
    letterSpacing: opts.tracking || 0,
    lineHeight: opts.lineHeight || 1.5,
    textAlign: opts.align || 'LEFT',
    italic: opts.italic || false,
  };
}

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const r = parseInt(hex.slice(0,2), 16) / 255;
  const g = parseInt(hex.slice(2,4), 16) / 255;
  const b = parseInt(hex.slice(4,6), 16) / 255;
  return { r, g, b };
}

function circle(cx, cy, r, fill, opts = {}) {
  return {
    id: uid(), type: 'ELLIPSE',
    name: opts.name || 'Circle',
    x: cx - r, y: cy - r, width: r*2, height: r*2,
    fills: [{ type: 'SOLID', color: hexToRgb(fill), opacity: opts.opacity || 1 }],
    strokes: opts.stroke ? [{ type: 'SOLID', color: hexToRgb(opts.stroke), opacity: 0.2 }] : [],
    strokeWidth: opts.strokeWidth || 1,
  };
}

function gradientRect(x, y, w, h, c1, c2, opts = {}) {
  return {
    id: uid(), type: 'RECTANGLE',
    name: opts.name || 'Gradient',
    x, y, width: w, height: h,
    fills: [{
      type: 'GRADIENT_LINEAR',
      gradientStops: [
        { position: 0, color: { ...hexToRgb(c1), a: 1 } },
        { position: 1, color: { ...hexToRgb(c2), a: 1 } },
      ],
      gradientTransform: opts.transform || [[0, 1, 0], [-1, 0, 1]],
    }],
    cornerRadius: opts.r || 0,
  };
}

// ─── STATUS BAR ───────────────────────────────────────────────────────────────
function statusBar(bg = P.cream) {
  return frame(0, 0, 390, 44, 'Status Bar', {
    bg,
    children: [
      text(20, 14, 60, '9:41', { size: 15, weight: 600, color: P.espresso }),
      rect(320, 18, 54, 12, P.espresso, { r: 3, name: 'Battery', opacity: 0.4 }),
      rect(374, 20, 3, 8, P.espresso, { r: 1, name: 'Battery tip', opacity: 0.4 }),
      rect(322, 20, 38, 8, P.terracotta, { r: 2, name: 'Battery fill', opacity: 0.85 }),
      circle(299, 24, 5, P.espresso, { name: 'Signal', opacity: 0.4 }),
      circle(287, 24, 5, P.espresso, { name: 'Wifi', opacity: 0.4 }),
    ],
  });
}

// ─── NAV BAR ─────────────────────────────────────────────────────────────────
function navBar(activeTab = 0) {
  const tabs = [
    { label: 'Today', icon: '◎' },
    { label: 'Library', icon: '⊟' },
    { label: 'Focus', icon: '◷' },
    { label: 'Insights', icon: '◈' },
    { label: 'Discover', icon: '◬' },
  ];
  const children = [
    rect(0, 0, 390, 80, P.warm_white, { name: 'Nav BG' }),
    rect(0, 0, 390, 1, P.dust, { name: 'Nav Border', opacity: 0.6 }),
  ];
  tabs.forEach((tab, i) => {
    const x = i * 78;
    const isActive = i === activeTab;
    if (isActive) {
      children.push(rect(x + 12, 8, 54, 48, P.blush, { r: 14, name: `Tab ${i} active bg` }));
    }
    children.push(text(x + 20, 12, 38, tab.icon, {
      size: 20, align: 'CENTER', color: isActive ? P.terracotta : P.dust,
      weight: isActive ? 600 : 400, opacity: isActive ? 1 : 0.7,
    }));
    children.push(text(x + 8, 38, 62, tab.label, {
      size: 10, align: 'CENTER', weight: isActive ? 600 : 400,
      color: isActive ? P.terracotta : P.ink, opacity: isActive ? 1 : 0.55,
      tracking: 0.3,
    }));
  });
  return frame(0, 772, 390, 80, 'Nav Bar', { bg: 'transparent', children });
}

// ─── SCREEN 1: TODAY ─────────────────────────────────────────────────────────
function screenToday() {
  const H = 852;
  const children = [];

  // Soft warm gradient hero zone
  children.push(gradientRect(0, 0, 390, 260, '#F9F4EE', '#EFE6DA', {
    name: 'Hero Gradient', transform: [[0, -1, 1], [1, 0, 0]],
  }));

  // Status bar
  children.push(statusBar('#F9F4EE'));

  // Header
  children.push(text(24, 56, 200, 'Good morning, Sam', {
    size: 13, color: P.terracotta, weight: 500, tracking: 0.5, opacity: 0.85,
  }));
  children.push(text(24, 74, 300, 'Your story\ncontinues.', {
    size: 34, weight: 700, color: P.espresso, font: 'Georgia', lineHeight: 1.2, h: 84,
  }));

  // Streak pill
  children.push(rect(24, 168, 110, 32, P.terracotta, { r: 16, name: 'Streak pill' }));
  children.push(text(38, 176, 90, '🔥  23 day streak', { size: 11, color: '#FDFAF7', weight: 600 }));

  // Date pill
  children.push(rect(148, 168, 90, 32, P.parchment, { r: 16, name: 'Date pill', stroke: P.dust }));
  children.push(text(162, 176, 70, 'Mar 27', { size: 11, color: P.ink, weight: 500, opacity: 0.75 }));

  // Divider zone
  children.push(rect(0, 268, 390, 1, P.dust, { name: 'Divider', opacity: 0.5 }));

  // CURRENT BOOK card
  children.push(rect(24, 288, 342, 140, P.warm_white, { r: 20, name: 'Current Book Card', stroke: P.dust }));

  // Book cover placeholder — warm terracotta rect with texture lines
  children.push(rect(40, 304, 68, 92, P.terracotta, { r: 10, name: 'Book Cover', opacity: 0.9 }));
  children.push(text(42, 330, 64, 'F', { size: 40, weight: 700, color: '#FDFAF7', align: 'CENTER', font: 'Georgia', opacity: 0.6 }));

  // Book details
  children.push(text(124, 308, 220, 'Currently Reading', { size: 10, weight: 500, color: P.terracotta, tracking: 1.2, opacity: 0.8 }));
  children.push(text(124, 322, 220, 'The Midnight Library', { size: 16, weight: 700, color: P.espresso, font: 'Georgia' }));
  children.push(text(124, 342, 200, 'Matt Haig', { size: 12, color: P.ink, opacity: 0.6 }));

  // Progress bar
  children.push(rect(124, 368, 220, 6, P.parchment, { r: 3, name: 'Progress Track' }));
  children.push(rect(124, 368, 143, 6, P.terracotta, { r: 3, name: 'Progress Fill' }));
  children.push(text(124, 380, 120, '65% complete', { size: 10, color: P.ink, opacity: 0.5 }));
  children.push(text(284, 380, 60, '≈ 4h left', { size: 10, color: P.ink, opacity: 0.5, align: 'RIGHT' }));

  // TODAY'S GOAL section
  children.push(text(24, 444, 200, "Today's Goal", { size: 13, weight: 600, color: P.espresso, tracking: 0.2 }));
  children.push(text(300, 444, 66, 'Edit', { size: 13, color: P.terracotta, weight: 500, align: 'RIGHT' }));

  // Goal cards row
  const goals = [
    { label: 'Pages', val: '30', done: '18', unit: 'read', pct: 60 },
    { label: 'Minutes', val: '45', done: '28', unit: 'focused', pct: 62 },
    { label: 'Sessions', val: '2', done: '1', unit: 'done', pct: 50 },
  ];
  goals.forEach((g, i) => {
    const gx = 24 + i * 122;
    children.push(rect(gx, 464, 110, 96, P.parchment, { r: 16, name: `Goal ${i}` }));
    children.push(text(gx + 12, 476, 86, g.label, { size: 10, color: P.ink, opacity: 0.6, weight: 500 }));
    children.push(text(gx + 12, 492, 86, g.done, { size: 26, weight: 700, color: P.espresso, font: 'Georgia' }));
    children.push(text(gx + 12 + (g.done.length * 16), 510, 50, `/ ${g.val}`, { size: 13, color: P.ink, opacity: 0.4 }));
    children.push(text(gx + 12, 526, 86, g.unit, { size: 9, color: P.ink, opacity: 0.45, tracking: 0.5 }));
    // mini progress
    children.push(rect(gx + 12, 548, 86, 4, P.dust, { r: 2, name: 'Goal track' }));
    children.push(rect(gx + 12, 548, Math.round(86 * g.pct / 100), 4, P.sage, { r: 2, name: 'Goal fill' }));
  });

  // START SESSION CTA
  children.push(rect(24, 576, 342, 58, P.espresso, { r: 18, name: 'CTA' }));
  children.push(text(24, 592, 342, '◷  Begin Focus Session', { size: 16, weight: 600, color: P.warm_white, align: 'CENTER' }));

  // Upcoming sessions
  children.push(text(24, 650, 200, 'Reading Queue', { size: 13, weight: 600, color: P.espresso }));
  const queue = ['Thinking, Fast and Slow', 'The Body Keeps the Score'];
  queue.forEach((title, i) => {
    const qy = 670 + i * 48;
    children.push(rect(24, qy, 342, 40, P.warm_white, { r: 12, name: `Queue ${i}`, stroke: P.dust }));
    children.push(rect(40, qy + 10, 20, 20, P.blush, { r: 6, name: `Queue icon ${i}` }));
    children.push(text(52, qy + 10, 14, '⊟', { size: 12, color: P.terracotta, align: 'CENTER' }));
    children.push(text(72, qy + 12, 230, title, { size: 13, color: P.espresso, weight: 500 }));
    children.push(text(316, qy + 12, 36, '›', { size: 18, color: P.dust, align: 'RIGHT' }));
  });

  // Nav bar
  children.push(navBar(0));

  return frame(0, 0, 390, H, 'Screen — Today', { bg: P.cream, children });
}

// ─── SCREEN 2: LIBRARY ───────────────────────────────────────────────────────
function screenLibrary() {
  const H = 852;
  const children = [];
  children.push(rect(0, 0, 390, H, P.cream, { name: 'BG' }));
  children.push(statusBar());

  // Header
  children.push(text(24, 56, 250, 'Library', { size: 30, weight: 700, color: P.espresso, font: 'Georgia' }));
  children.push(text(24, 92, 300, '14 books in your collection', { size: 13, color: P.ink, opacity: 0.55 }));

  // Search bar
  children.push(rect(24, 116, 342, 44, P.parchment, { r: 22, name: 'Search BG', stroke: P.dust }));
  children.push(text(50, 128, 30, '⌕', { size: 18, color: P.dust, opacity: 0.8 }));
  children.push(text(76, 132, 260, 'Search your library...', { size: 14, color: P.ink, opacity: 0.4 }));

  // Filter tabs
  const filters = ['All', 'Reading', 'Finished', 'Want to Read'];
  let fx = 24;
  filters.forEach((f, i) => {
    const w = [36, 72, 74, 108][i];
    children.push(rect(fx, 176, w, 30, i === 0 ? P.espresso : P.parchment, {
      r: 15, name: `Filter ${i}`, stroke: i === 0 ? 'transparent' : P.dust,
    }));
    children.push(text(fx + (i === 0 ? 6 : 6), 184, w - 12, f, {
      size: 12, weight: i === 0 ? 600 : 400,
      color: i === 0 ? P.warm_white : P.ink, align: 'CENTER',
      opacity: i === 0 ? 1 : 0.6,
    }));
    fx += w + 10;
  });

  // Book shelf — 2 columns
  const books = [
    { title: 'The Midnight Library', author: 'Matt Haig', status: 'Reading', pct: 65, color: P.terracotta },
    { title: 'Atomic Habits', author: 'James Clear', status: 'Reading', pct: 88, color: '#7B6EA8' },
    { title: 'Deep Work', author: 'Cal Newport', status: 'Finished', pct: 100, color: '#4A7FA5' },
    { title: 'Thinking Fast', author: 'Kahneman', status: 'Finished', pct: 100, color: P.sage },
    { title: 'The Alchemist', author: 'Paulo Coelho', status: 'Want to', pct: 0, color: '#C9A86C' },
    { title: 'Dune', author: 'Frank Herbert', status: 'Want to', pct: 0, color: '#8B6B4A' },
  ];

  books.forEach((book, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const bx = 24 + col * 181;
    const by = 224 + row * 188;

    children.push(rect(bx, by, 165, 176, P.warm_white, { r: 16, name: `Book ${i}`, stroke: P.dust }));

    // Cover
    children.push(rect(bx + 16, by + 16, 133, 88, book.color, { r: 10, name: `Cover ${i}`, opacity: 0.85 }));
    const initials = book.title.split(' ').slice(0,2).map(w => w[0]).join('');
    children.push(text(bx + 16, by + 44, 133, initials, {
      size: 28, weight: 700, color: '#FDFAF7', align: 'CENTER', font: 'Georgia', opacity: 0.55,
    }));

    // Details
    children.push(text(bx + 12, by + 114, 141, book.title, {
      size: 12, weight: 700, color: P.espresso, lineHeight: 1.3,
    }));
    children.push(text(bx + 12, by + 134, 141, book.author, { size: 10, color: P.ink, opacity: 0.5 }));

    // Status badge
    const badgeColor = book.status === 'Reading' ? P.terracotta : book.status === 'Finished' ? P.sage : P.dust;
    children.push(rect(bx + 12, by + 150, book.status === 'Want to' ? 56 : 56, 18, badgeColor, {
      r: 9, name: `Badge ${i}`, opacity: 0.15,
    }));
    children.push(text(bx + 16, by + 153, 60, book.status, {
      size: 9, color: badgeColor, weight: 600, opacity: 1,
    }));

    if (book.pct > 0 && book.pct < 100) {
      children.push(rect(bx + 80, by + 152, 73, 4, P.parchment, { r: 2 }));
      children.push(rect(bx + 80, by + 152, Math.round(73 * book.pct / 100), 4, P.terracotta, { r: 2 }));
    }
  });

  children.push(navBar(1));
  return frame(0, 0, 390, H, 'Screen — Library', { bg: P.cream, children });
}

// ─── SCREEN 3: FOCUS SESSION ─────────────────────────────────────────────────
function screenFocus() {
  const H = 852;
  const children = [];

  // Immersive warm gradient background
  children.push(gradientRect(0, 0, 390, H, '#EDE4D8', '#F5EFE7', {
    name: 'Focus BG', transform: [[0, -1, 1], [1, 0, 0]],
  }));
  children.push(statusBar('#EDE4D8'));

  // Header
  children.push(text(24, 56, 200, 'Focus Session', { size: 13, weight: 500, color: P.terracotta, tracking: 1.2 }));
  children.push(text(24, 74, 342, 'The Midnight Library', { size: 22, weight: 700, color: P.espresso, font: 'Georgia' }));
  children.push(text(24, 100, 200, 'Chapter 14 — Halifax', { size: 13, color: P.ink, opacity: 0.55 }));

  // Central timer ring
  const cx = 195, cy = 330;
  // Outer ring track
  children.push({ ...circle(cx, cy, 130, P.parchment, { name: 'Timer track' }), opacity: 0.7 });
  // Timer ring fill (75% = 270deg arc, represented as colored circle)
  children.push({ ...circle(cx, cy, 120, P.warm_white, { name: 'Timer inner' }), opacity: 1 });

  // Inner content
  children.push(text(90, 288, 210, '28:32', {
    size: 52, weight: 700, color: P.espresso, align: 'CENTER', font: 'Georgia',
  }));
  children.push(text(90, 346, 210, 'of 45:00 focused', { size: 13, color: P.ink, opacity: 0.5, align: 'CENTER' }));

  // Outer ring arc indicator (simulated with colored rect arcs)
  children.push(rect(cx - 130, cy - 130, 260, 260, 'transparent', {
    r: 130, name: 'Timer arc', stroke: P.terracotta,
    strokeWidth: 8,
  }));

  // Mood/ambient row
  children.push(text(24, 484, 342, 'Ambient', { size: 12, weight: 600, color: P.ink, opacity: 0.5, tracking: 1 }));
  const moods = ['🌿 Forest', '☕ Café', '🌧 Rain', '🌊 Ocean'];
  moods.forEach((m, i) => {
    const isActive = i === 0;
    children.push(rect(24 + i * 86, 504, 78, 36, isActive ? P.espresso : P.parchment, {
      r: 18, name: `Mood ${i}`, stroke: isActive ? 'transparent' : P.dust,
    }));
    children.push(text(24 + i * 86 + 8, 512, 62, m, {
      size: 11, color: isActive ? P.warm_white : P.ink, align: 'CENTER',
      opacity: isActive ? 1 : 0.65, weight: isActive ? 600 : 400,
    }));
  });

  // Page tracker
  children.push(rect(24, 556, 342, 68, P.warm_white, { r: 16, name: 'Page tracker', stroke: P.dust }));
  children.push(text(40, 568, 150, 'Current Page', { size: 11, color: P.ink, opacity: 0.5 }));
  children.push(text(40, 584, 100, '247', { size: 24, weight: 700, color: P.espresso, font: 'Georgia' }));
  children.push(text(100, 592, 60, '/ 304', { size: 13, color: P.ink, opacity: 0.4 }));
  children.push(rect(200, 568, 150, 36, P.parchment, { r: 12, name: 'Page input bg' }));
  children.push(text(200, 576, 150, 'Log page →', { size: 12, color: P.terracotta, weight: 600, align: 'CENTER' }));

  // Session notes quick add
  children.push(rect(24, 640, 342, 48, P.parchment, { r: 14, name: 'Quick note', stroke: P.dust }));
  children.push(text(44, 650, 30, '✎', { size: 16, color: P.dust, opacity: 0.7 }));
  children.push(text(68, 654, 260, 'Add a reading note...', { size: 13, color: P.ink, opacity: 0.35 }));

  // Pause / End row
  children.push(rect(24, 704, 160, 54, P.parchment, { r: 16, name: 'Pause btn', stroke: P.dust }));
  children.push(text(24, 720, 160, '⏸  Pause', { size: 15, weight: 600, color: P.ink, align: 'CENTER', opacity: 0.7 }));
  children.push(rect(198, 704, 168, 54, P.espresso, { r: 16, name: 'End btn' }));
  children.push(text(198, 720, 168, '✓  End Session', { size: 15, weight: 600, color: P.warm_white, align: 'CENTER' }));

  children.push(navBar(2));
  return frame(0, 0, 390, H, 'Screen — Focus', { bg: 'transparent', children });
}

// ─── SCREEN 4: INSIGHTS ──────────────────────────────────────────────────────
function screenInsights() {
  const H = 852;
  const children = [];
  children.push(rect(0, 0, 390, H, P.cream, { name: 'BG' }));
  children.push(statusBar());

  children.push(text(24, 56, 250, 'Insights', { size: 30, weight: 700, color: P.espresso, font: 'Georgia' }));
  children.push(text(24, 92, 250, 'Week of Mar 24–30', { size: 13, color: P.ink, opacity: 0.5 }));

  // Period selector
  const periods = ['Week', 'Month', 'Year'];
  periods.forEach((p, i) => {
    const isActive = i === 0;
    children.push(rect(24 + i * 74, 110, 66, 28, isActive ? P.espresso : P.parchment, {
      r: 14, name: `Period ${i}`, stroke: isActive ? 'transparent' : P.dust,
    }));
    children.push(text(24 + i * 74, 118, 66, p, {
      size: 11, color: isActive ? P.warm_white : P.ink, weight: isActive ? 600 : 400,
      align: 'CENTER', opacity: isActive ? 1 : 0.6,
    }));
  });

  // Reading activity bar chart
  children.push(rect(24, 154, 342, 148, P.warm_white, { r: 16, name: 'Chart card', stroke: P.dust }));
  children.push(text(40, 166, 200, 'Reading Activity', { size: 12, weight: 600, color: P.espresso }));
  children.push(text(40, 182, 200, '4h 28m this week', { size: 10, color: P.terracotta, opacity: 0.9 }));

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const heights = [40, 28, 52, 44, 20, 60, 48];
  days.forEach((d, i) => {
    const bx = 40 + i * 44;
    const maxH = 72;
    const bh = heights[i];
    const isToday = i === 6;
    children.push(rect(bx, 204 + (maxH - bh), 28, bh, isToday ? P.terracotta : P.parchment, {
      r: 6, name: `Bar ${i}`, opacity: isToday ? 1 : 0.8,
    }));
    children.push(text(bx, 284, 28, d, {
      size: 10, color: P.ink, opacity: isToday ? 1 : 0.45, align: 'CENTER', weight: isToday ? 600 : 400,
    }));
  });

  // Stats row
  const stats = [
    { label: 'Pages Read', val: '312', change: '+18%' },
    { label: 'Avg Session', val: '38m', change: '+5m' },
    { label: 'Books Done', val: '1', change: '+1' },
  ];
  stats.forEach((s, i) => {
    const sx = 24 + i * 118;
    children.push(rect(sx, 316, 110, 80, P.parchment, { r: 14, name: `Stat ${i}` }));
    children.push(text(sx + 12, 328, 86, s.label, { size: 9, color: P.ink, opacity: 0.55, weight: 500, tracking: 0.3 }));
    children.push(text(sx + 12, 342, 86, s.val, { size: 24, weight: 700, color: P.espresso, font: 'Georgia' }));
    children.push(rect(sx + 12, 374, 50, 16, P.sage, { r: 8, opacity: 0.15, name: `Change badge ${i}` }));
    children.push(text(sx + 14, 376, 46, s.change, { size: 9, color: P.sage, weight: 600 }));
  });

  // Reading velocity
  children.push(rect(24, 412, 342, 72, P.warm_white, { r: 16, name: 'Velocity card', stroke: P.dust }));
  children.push(text(40, 424, 200, 'Reading Velocity', { size: 12, weight: 600, color: P.espresso }));
  children.push(text(40, 440, 250, 'You read 44 pages/hr this week. Top 12% of readers.', {
    size: 11, color: P.ink, opacity: 0.6, lineHeight: 1.45,
  }));
  children.push(text(286, 424, 68, '44 pp/hr', { size: 13, weight: 700, color: P.terracotta, align: 'RIGHT' }));

  // Genre breakdown
  children.push(text(24, 500, 250, 'Genres This Month', { size: 13, weight: 600, color: P.espresso }));
  const genres = [
    { name: 'Fiction', pct: 48, color: P.terracotta },
    { name: 'Psychology', pct: 28, color: P.sage },
    { name: 'Self-help', pct: 16, color: '#C9A86C' },
    { name: 'Other', pct: 8, color: P.dust },
  ];
  genres.forEach((g, i) => {
    const gy = 520 + i * 44;
    children.push(text(24, gy, 180, g.name, { size: 13, color: P.espresso }));
    children.push(rect(24, gy + 18, 278, 8, P.parchment, { r: 4, name: `Genre track ${i}` }));
    children.push(rect(24, gy + 18, Math.round(278 * g.pct / 100), 8, g.color, { r: 4, name: `Genre fill ${i}` }));
    children.push(text(316, gy + 14, 50, `${g.pct}%`, { size: 12, color: P.ink, opacity: 0.55, align: 'RIGHT', weight: 500 }));
  });

  // Streak card
  children.push(rect(24, 704, 342, 56, P.espresso, { r: 16, name: 'Streak card' }));
  children.push(text(48, 720, 200, '🔥  23-day reading streak', { size: 15, weight: 700, color: P.warm_white }));
  children.push(text(290, 722, 60, 'Keep it up →', { size: 10, color: P.terracotta, weight: 600, align: 'RIGHT' }));

  children.push(navBar(3));
  return frame(0, 0, 390, H, 'Screen — Insights', { bg: P.cream, children });
}

// ─── SCREEN 5: DISCOVER ──────────────────────────────────────────────────────
function screenDiscover() {
  const H = 852;
  const children = [];
  children.push(rect(0, 0, 390, H, P.cream, { name: 'BG' }));
  children.push(statusBar());

  children.push(text(24, 56, 250, 'Discover', { size: 30, weight: 700, color: P.espresso, font: 'Georgia' }));
  children.push(text(24, 92, 300, 'Curated for slow, deliberate readers', { size: 13, color: P.ink, opacity: 0.5 }));

  // Search
  children.push(rect(24, 116, 342, 44, P.parchment, { r: 22, name: 'Search', stroke: P.dust }));
  children.push(text(50, 128, 30, '⌕', { size: 18, color: P.dust, opacity: 0.7 }));
  children.push(text(76, 132, 260, 'Search by title, author, mood...', { size: 13, color: P.ink, opacity: 0.35 }));

  // Editorial pick — large card
  children.push(gradientRect(24, 176, 342, 172, '#C4613A', '#8B6B4A', { name: 'Editorial card', r: 20 }));
  children.push(text(44, 196, 120, '✦ EDITOR\'S PICK', { size: 9, color: '#FDFAF7', opacity: 0.75, weight: 700, tracking: 1.5 }));
  children.push(text(44, 212, 260, 'Piranesi', { size: 32, weight: 700, color: '#FDFAF7', font: 'Georgia' }));
  children.push(text(44, 248, 260, 'Susanna Clarke', { size: 14, color: '#FDFAF7', opacity: 0.75 }));
  children.push(text(44, 268, 270, '"A world of infinite wonder — for readers\nwho prize depth over speed."', {
    size: 11, color: '#FDFAF7', opacity: 0.65, lineHeight: 1.4, italic: true,
  }));
  children.push(rect(248, 196, 98, 36, 'rgba(253,250,247,0.2)', { r: 18, name: 'CTA pill' }));
  children.push(text(248, 206, 98, 'Add to Library', { size: 10, color: '#FDFAF7', weight: 600, align: 'CENTER' }));

  // Reading mood filters
  children.push(text(24, 364, 200, 'Reading Mood', { size: 13, weight: 600, color: P.espresso }));
  const moods = ['🌿 Calm', '🧠 Learn', '✨ Escape', '💬 Connect'];
  moods.forEach((m, i) => {
    const isActive = i === 0;
    const moodColors = [P.sage, P.terracotta, '#7B6EA8', '#4A7FA5'];
    children.push(rect(24 + i * 86, 384, 78, 36, isActive ? moodColors[i] : P.parchment, {
      r: 18, name: `Mood ${i}`, stroke: isActive ? 'transparent' : P.dust, opacity: isActive ? 0.2 : 1,
    }));
    if (isActive) children.push(rect(24, 384, 78, 36, moodColors[0], { r: 18, opacity: 1 }));
    children.push(text(24 + i * 86 + 4, 392, 70, m, {
      size: 11, color: isActive ? P.warm_white : P.ink, align: 'CENTER',
      opacity: isActive ? 1 : 0.65, weight: isActive ? 600 : 400,
    }));
  });

  // Recommended books list
  children.push(text(24, 436, 250, 'Recommended for You', { size: 13, weight: 600, color: P.espresso }));
  const recs = [
    { title: 'The Body Keeps the Score', author: 'Bessel van der Kolk', tags: ['Psychology', 'Health'], color: '#4A7FA5' },
    { title: 'Invisible Cities', author: 'Italo Calvino', tags: ['Fiction', 'Literary'], color: '#7B6EA8' },
    { title: 'Flow', author: 'Mihaly Csikszentmihalyi', tags: ['Focus', 'Psychology'], color: P.sage },
  ];
  recs.forEach((r, i) => {
    const ry = 456 + i * 88;
    children.push(rect(24, ry, 342, 80, P.warm_white, { r: 14, name: `Rec ${i}`, stroke: P.dust }));
    children.push(rect(40, ry + 12, 48, 56, r.color, { r: 10, name: `Rec cover ${i}`, opacity: 0.85 }));
    const init = r.title.split(' ').slice(0,2).map(w => w[0]).join('');
    children.push(text(40, ry + 28, 48, init, { size: 18, weight: 700, color: '#FDFAF7', align: 'CENTER', font: 'Georgia', opacity: 0.5 }));
    children.push(text(102, ry + 14, 196, r.title, { size: 13, weight: 700, color: P.espresso, lineHeight: 1.3 }));
    children.push(text(102, ry + 34, 196, r.author, { size: 11, color: P.ink, opacity: 0.5 }));
    let tx = 102;
    r.tags.forEach(tag => {
      const tw = tag.length * 6.5 + 16;
      children.push(rect(tx, ry + 52, tw, 18, P.blush, { r: 9, name: `Tag ${tag}` }));
      children.push(text(tx + 6, ry + 55, tw - 10, tag, { size: 9, color: P.terracotta, weight: 600 }));
      tx += tw + 6;
    });
    children.push(text(340, ry + 28, 20, '›', { size: 20, color: P.dust, align: 'RIGHT' }));
  });

  children.push(navBar(4));
  return frame(0, 0, 390, H, 'Screen — Discover', { bg: P.cream, children });
}

// ─── ASSEMBLE PEN FILE ────────────────────────────────────────────────────────
function buildPen() {
  const screens = [
    screenToday(),
    screenLibrary(),
    screenFocus(),
    screenInsights(),
    screenDiscover(),
  ];

  // Layout screens side-by-side
  screens.forEach((s, i) => { s.x = i * 420; s.y = 0; });

  const pen = {
    version: '2.8',
    meta: {
      name: 'FABLE — read deeply, not just more',
      description: 'A slow-reading & focus companion. Light editorial theme. Warm cream + terracotta + sage. Inspired by Dawn wellness app (Lapa Ninja) and library aesthetic (Land-book).',
      author: 'RAM Design Heartbeat',
      createdAt: new Date().toISOString(),
      tags: ['reading', 'wellness', 'focus', 'light-theme', 'editorial', 'productivity'],
    },
    canvas: {
      backgroundColor: '#EDE8DF',
      width: screens.length * 420 + 40,
      height: 892,
    },
    frames: screens,
  };

  return pen;
}

const pen = buildPen();
fs.writeFileSync('./fable.pen', JSON.stringify(pen, null, 2));
console.log('✓ fable.pen written —', Math.round(fs.statSync('./fable.pen').size / 1024), 'KB');
console.log('  Screens:', pen.frames.length);
console.log('  Elements:', JSON.stringify(pen).match(/"id"/g).length);
