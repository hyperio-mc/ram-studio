// reed-app.js — Deep Reading Intelligence
// Inspired by: "Current — A River of Reading" (10 saves, Land-book 2026-03-27)
//              + Obsidian on DarkModeDesign — calm, editorial dark knowledge tools
//              + Godly's Amie/Reflect pattern: clean productivity UIs with warmth
// Theme: DARK — #0D0F0C near-black warm canvas, sage green + amber accents
// Challenge: First time doing a reading/annotation-focused app with a river metaphor
//            typography-forward layout, immersive reading mode screen

'use strict';
const fs = require('fs');

const W = 390, H = 844;

const palette = {
  bg:        '#0D0F0C',
  bgAlt:     '#131510',
  surface:   '#181B14',
  surfaceEl: '#1F2318',
  border:    'rgba(222,218,198,0.09)',
  text:      '#E2DEC8',
  textMuted: 'rgba(226,222,200,0.45)',
  textDim:   'rgba(226,222,200,0.25)',
  accent:    '#7BBF76',   // sage green
  accentSoft:'rgba(123,191,118,0.13)',
  amber:     '#D4A24C',   // warm amber (highlights)
  amberSoft: 'rgba(212,162,76,0.13)',
  red:       '#C96B5A',
};

// ─── helpers ──────────────────────────────────────────────────────────────────

function rect(x, y, w, h, fill, r = 0, opacity = 1) {
  return { type: 'rect', x, y, width: w, height: h, fill, cornerRadius: r, opacity };
}

function text(content, x, y, fontSize, fill, opts = {}) {
  return {
    type: 'text', content, x, y, fontSize,
    fill: fill || palette.text,
    fontWeight: opts.weight || 400,
    fontFamily: opts.family || 'Inter',
    textAlign: opts.align || 'left',
    opacity: opts.opacity || 1,
    letterSpacing: opts.ls || 0,
    lineHeight: opts.lh || 1.4,
  };
}

function pill(x, y, w, h, fill, textContent, textColor, fontSize = 11) {
  return [
    rect(x, y, w, h, fill, h / 2),
    text(textContent, x + w / 2, y + h / 2 - fontSize * 0.55, fontSize, textColor, { align: 'center', weight: 500 }),
  ];
}

function line(x1, y1, x2, y2, stroke, sw = 1) {
  return { type: 'line', x1, y1, x2, y2, stroke, strokeWidth: sw };
}

function circle(cx, cy, r, fill, opacity = 1) {
  return { type: 'ellipse', x: cx - r, y: cy - r, width: r * 2, height: r * 2, fill, opacity };
}

function icon(name, x, y, size, color, opacity = 1) {
  return { type: 'icon', name, x, y, width: size, height: size, fill: color, opacity };
}

function statusBar(bgColor) {
  return [
    rect(0, 0, W, 50, bgColor || palette.bg),
    text('9:41', 20, 14, 15, palette.text, { weight: 600 }),
    text('●●●', W - 60, 14, 10, palette.text, { weight: 400, ls: 2 }),
  ];
}

function bottomNav(active) {
  // active: 0=queue, 1=read, 2=library, 3=stats
  const items = [
    { label: 'Queue', icon: 'list' },
    { label: 'Reading', icon: 'eye' },
    { label: 'Library', icon: 'layers' },
    { label: 'Stats', icon: 'activity' },
  ];
  const els = [rect(0, H - 80, W, 80, palette.bgAlt), line(0, H - 80, W, H - 80, palette.border)];
  items.forEach((item, i) => {
    const x = (W / items.length) * i + W / items.length / 2;
    const isActive = i === active;
    const col = isActive ? palette.accent : palette.textMuted;
    els.push(icon(item.icon, x - 12, H - 67, 24, col));
    els.push(text(item.label, x, H - 38, 10, col, { align: 'center', weight: isActive ? 600 : 400 }));
    if (isActive) {
      els.push(rect(x - 16, H - 80, 32, 2, palette.accent, 1));
    }
  });
  return els;
}

function articleCard(x, y, w, article) {
  const {
    title, source, readTime, tag, tagColor, tagBg, progress, saved
  } = article;
  const h = progress !== undefined ? 116 : 104;
  const els = [];
  els.push(rect(x, y, w, h, palette.surface, 12));
  // tag pill
  if (tag) {
    els.push(...pill(x + 12, y + 12, tag.length * 6.5 + 16, 20, tagBg || palette.accentSoft, tag, tagColor || palette.accent, 10));
  }
  // title
  els.push(text(title, x + 12, y + 40, 14, palette.text, { weight: 600, lh: 1.3 }));
  // source + read time
  els.push(text(source + '  ·  ' + readTime, x + 12, y + 78, 11, palette.textMuted));
  // progress bar
  if (progress !== undefined) {
    els.push(rect(x + 12, y + h - 12, w - 24, 3, palette.border, 2));
    els.push(rect(x + 12, y + h - 12, Math.round((w - 24) * progress), 3, palette.accent, 2));
  }
  return els;
}

// ─── Screen 1: Reading Queue ───────────────────────────────────────────────────
function screenQueue() {
  const els = [rect(0, 0, W, H, palette.bg)];
  els.push(...statusBar());

  // Header
  els.push(text('Your River', 20, 62, 26, palette.text, { weight: 700, family: 'Georgia' }));
  els.push(text('12 articles · ~47 min total', 20, 94, 13, palette.textMuted));

  // Filter chips
  const chips = ['All', 'Tech', 'Science', 'Design'];
  let cx = 20;
  chips.forEach((chip, i) => {
    const w = chip.length * 7.5 + 20;
    const isActive = i === 0;
    els.push(rect(cx, 112, w, 28, isActive ? palette.accentSoft : palette.surfaceEl, 14));
    if (isActive) els.push(rect(cx, 112, w, 28, 'transparent', 14, 0, undefined, { stroke: palette.accent, strokeWidth: 1 }));
    els.push(text(chip, cx + w / 2, 118, 12, isActive ? palette.accent : palette.textMuted, { align: 'center', weight: isActive ? 600 : 400 }));
    cx += w + 8;
  });

  // Articles
  const articles = [
    { title: 'The Quiet Machine: How LLMs\nLearn to Reason', source: 'MIT Tech Review', readTime: '8 min', tag: 'AI', tagColor: palette.accent, tagBg: palette.accentSoft, progress: 0.62 },
    { title: 'Rewilding the City: Green\nCorridors Across Europe', source: 'The Guardian', readTime: '6 min', tag: 'Science', tagColor: '#72B8C4', tagBg: 'rgba(114,184,196,0.13)' },
    { title: 'Why Typography Is the New\nProduct Design Language', source: 'Design Systems', readTime: '5 min', tag: 'Design', tagColor: palette.amber, tagBg: palette.amberSoft },
    { title: 'Notes on Slowness: The Case\nfor Deliberate Technology', source: 'Ribbonfarm', readTime: '11 min', tag: 'Essay', tagColor: '#B07FD4', tagBg: 'rgba(176,127,212,0.13)' },
  ];

  let ay = 154;
  articles.forEach(a => {
    els.push(...articleCard(16, ay, W - 32, a));
    ay += (a.progress !== undefined ? 116 : 104) + 10;
  });

  els.push(...bottomNav(0));
  return els;
}

// ─── Screen 2: Immersive Reading Mode ─────────────────────────────────────────
function screenReading() {
  const els = [rect(0, 0, W, H, palette.bg)];

  // Very minimal top bar
  els.push(rect(0, 0, W, 48, palette.bg));
  els.push(icon('arrow-left', 16, 12, 24, palette.textMuted));
  els.push(text('62%', W / 2, 15, 12, palette.textMuted, { align: 'center' }));
  els.push(icon('bookmark', W - 40, 12, 24, palette.amber));

  // Progress line at top
  els.push(rect(0, 48, W, 2, palette.border));
  els.push(rect(0, 48, Math.round(W * 0.62), 2, palette.accent));

  // Article meta
  els.push(text('MIT TECHNOLOGY REVIEW', 24, 64, 10, palette.textMuted, { weight: 600, ls: 1.5 }));
  els.push(text('8 min read', W - 24, 64, 10, palette.textMuted, { align: 'right' }));

  // Article title (editorial serif style)
  els.push(text('The Quiet Machine:', 24, 88, 24, palette.text, { weight: 700, family: 'Georgia', lh: 1.25 }));
  els.push(text('How LLMs Learn', 24, 116, 24, palette.text, { weight: 700, family: 'Georgia', lh: 1.25 }));
  els.push(text('to Reason', 24, 144, 24, palette.text, { weight: 700, family: 'Georgia', lh: 1.25 }));

  // Byline
  els.push(text('By Rhiannon Williams  ·  Mar 2026', 24, 174, 12, palette.textMuted));
  els.push(line(24, 192, W - 24, 192, palette.border));

  // Body paragraph
  const bodyLines = [
    'At the heart of modern language models lies',
    'a deceptively simple question: can a machine',
    'that predicts text actually understand it?',
    '',
    'New research from MIT CSAIL lab suggests',
    'the answer is more nuanced than a simple yes',
    'or no — and the implications reach far beyond',
    'the chatbot interfaces we interact with daily.',
  ];
  bodyLines.forEach((line_, i) => {
    if (line_) {
      els.push(text(line_, 24, 208 + i * 22, 15, palette.text, { lh: 1.6 }));
    }
  });

  // Highlight selection (amber)
  els.push(rect(24, 273, 300, 22, palette.amberSoft, 3));
  els.push(text('can a machine that predicts text actually', 24, 275, 15, palette.amber, { lh: 1.6 }));

  // Annotation popup
  els.push(rect(120, 304, 200, 44, palette.surfaceEl, 8));
  els.push(text('💬  Add note · 📌 Save · ↗ Share', 130, 314, 10, palette.textMuted));

  // More body after highlight
  els.push(text('understand it? New research from', 24, 340, 15, palette.text, { lh: 1.6 }));
  els.push(text('MIT CSAIL lab suggests the answer', 24, 362, 15, palette.text, { lh: 1.6 }));
  els.push(text('is more nuanced than a simple yes', 24, 384, 15, palette.text, { lh: 1.6 }));
  els.push(text('or no — and the implications reach', 24, 406, 15, palette.text, { lh: 1.6 }));
  els.push(text('far beyond the chatbot interfaces…', 24, 428, 15, palette.textMuted, { lh: 1.6 }));

  // Font size controls (bottom floating bar)
  els.push(rect(80, H - 116, W - 160, 48, palette.surface, 24));
  els.push(text('A', 112, H - 102, 13, palette.textMuted, { align: 'center' }));
  els.push(line(W / 2 - 20, H - 102, W / 2 + 20, H - 102, palette.border));
  els.push(text('A', W - 112, H - 99, 17, palette.text, { align: 'center', weight: 600 }));

  // Bottom mini nav (just icons)
  els.push(rect(0, H - 60, W, 60, palette.bgAlt));
  els.push(line(0, H - 60, W, H - 60, palette.border));
  els.push(icon('list', W / 2 - 50 - 12, H - 47, 24, palette.textMuted));
  els.push(icon('eye', W / 2 - 12, H - 47, 24, palette.accent));
  els.push(icon('layers', W / 2 + 50 - 12, H - 47, 24, palette.textMuted));

  return els;
}

// ─── Screen 3: Highlights & Annotations ───────────────────────────────────────
function screenHighlights() {
  const els = [rect(0, 0, W, H, palette.bg)];
  els.push(...statusBar());

  els.push(text('Highlights', 20, 62, 24, palette.text, { weight: 700, family: 'Georgia' }));
  els.push(text('23 saved passages', 20, 92, 13, palette.textMuted));

  // Search bar
  els.push(rect(16, 112, W - 32, 40, palette.surface, 10));
  els.push(icon('search', 28, 120, 22, palette.textMuted));
  els.push(text('Search highlights…', 58, 122, 13, palette.textDim));

  const highlights = [
    {
      quote: '"…the ability to predict the next word with\nhigh fidelity is functionally indistinguishable\nfrom understanding, at scale."',
      article: 'The Quiet Machine',
      date: 'Today',
      color: palette.amber,
      colorBg: palette.amberSoft,
      note: 'Key thesis — re-read before meeting',
    },
    {
      quote: '"Design is never neutral. Every interface\nencodes a set of assumptions about how\npeople should experience time."',
      article: 'Why Typography Is Design',
      date: 'Yesterday',
      color: palette.accent,
      colorBg: palette.accentSoft,
    },
    {
      quote: '"Rewilded corridors don\'t just move\nanimals — they move ideas about what\ncities can become."',
      article: 'Rewilding the City',
      date: 'Mar 25',
      color: '#72B8C4',
      colorBg: 'rgba(114,184,196,0.13)',
    },
  ];

  let hy = 166;
  highlights.forEach(h => {
    const cardH = h.note ? 138 : 118;
    els.push(rect(16, hy, W - 32, cardH, palette.surface, 12));
    // left accent bar
    els.push(rect(16, hy, 3, cardH, h.color, 2));
    // quote
    els.push(text(h.quote, 30, hy + 14, 13, palette.text, { lh: 1.5, family: 'Georgia' }));
    // article + date
    els.push(text(h.article, 30, hy + cardH - (h.note ? 38 : 22), 11, h.color, { weight: 500 }));
    els.push(text(h.date, W - 28, hy + cardH - (h.note ? 38 : 22), 11, palette.textMuted, { align: 'right' }));
    // note
    if (h.note) {
      els.push(rect(30, hy + cardH - 26, W - 62, 18, palette.bgAlt, 4));
      els.push(text('✏  ' + h.note, 38, hy + cardH - 22, 10, palette.textMuted));
    }
    hy += cardH + 10;
  });

  els.push(...bottomNav(2));
  return els;
}

// ─── Screen 4: Library ────────────────────────────────────────────────────────
function screenLibrary() {
  const els = [rect(0, 0, W, H, palette.bg)];
  els.push(...statusBar());

  els.push(text('Library', 20, 62, 24, palette.text, { weight: 700, family: 'Georgia' }));
  els.push(text('47 articles saved', 20, 92, 13, palette.textMuted));

  // Category tabs
  const tabs = ['Unread', 'Finished', 'Archived'];
  let tx = 20;
  tabs.forEach((tab, i) => {
    const tw = tab.length * 8 + 24;
    const active = i === 0;
    els.push(rect(tx, 112, tw, 30, active ? palette.surfaceEl : 'transparent', 8));
    if (active) els.push(rect(tx, 138, tw, 2, palette.accent, 1));
    els.push(text(tab, tx + tw / 2, 118, 13, active ? palette.accent : palette.textMuted, { align: 'center', weight: active ? 600 : 400 }));
    tx += tw + 12;
  });
  els.push(line(0, 144, W, 144, palette.border));

  // Library list items
  const items = [
    { title: 'The Quiet Machine: How LLMs Learn to Reason', source: 'MIT Tech Review', tag: 'AI', readTime: '8 min', progress: 0.62, tagColor: palette.accent },
    { title: 'Why Typography Is the New Product Design Language', source: 'Design Systems', tag: 'Design', readTime: '5 min', progress: 0, tagColor: palette.amber },
    { title: 'Rewilding the City: Green Corridors Across Europe', source: 'The Guardian', tag: 'Science', readTime: '6 min', progress: 0, tagColor: '#72B8C4' },
    { title: 'Notes on Slowness: Deliberate Technology', source: 'Ribbonfarm', tag: 'Essay', readTime: '11 min', progress: 0.18, tagColor: '#B07FD4' },
    { title: 'On Being Bored: Why Idle Minds Solve Problems', source: 'New Yorker', tag: 'Essay', readTime: '7 min', progress: 0, tagColor: '#B07FD4' },
  ];

  let ly = 160;
  items.forEach(item => {
    els.push(rect(16, ly, W - 32, 72, palette.surface, 10));
    // tag
    const tpw = item.tag.length * 6.5 + 14;
    els.push(rect(W - 32 - tpw - 4, ly + 12, tpw, 20, 'rgba(255,255,255,0.05)', 10));
    els.push(text(item.tag, W - 32 - tpw - 4 + tpw / 2, ly + 17, 10, item.tagColor, { align: 'center', weight: 500 }));
    els.push(text(item.title, 28, ly + 12, 13, palette.text, { weight: 500, lh: 1.3 }));
    els.push(text(item.source + '  ·  ' + item.readTime, 28, ly + 50, 11, palette.textMuted));
    if (item.progress > 0) {
      els.push(rect(W - 64, ly + 50, 36, 6, palette.border, 3));
      els.push(rect(W - 64, ly + 50, Math.round(36 * item.progress), 6, palette.accent, 3));
    }
    ly += 82;
  });

  els.push(...bottomNav(2));
  return els;
}

// ─── Screen 5: Reading Stats ───────────────────────────────────────────────────
function screenStats() {
  const els = [rect(0, 0, W, H, palette.bg)];
  els.push(...statusBar());

  els.push(text('Your Week', 20, 62, 24, palette.text, { weight: 700, family: 'Georgia' }));
  els.push(text('Mar 21 – 27, 2026', 20, 92, 13, palette.textMuted));

  // Big stat
  els.push(rect(16, 112, W - 32, 96, palette.surface, 14));
  els.push(text('4 h 23 m', W / 2, 138, 34, palette.text, { align: 'center', weight: 700 }));
  els.push(text('reading time this week', W / 2, 177, 12, palette.textMuted, { align: 'center' }));
  // trend
  els.push(...pill(W / 2 - 40, 152, 80, 22, palette.accentSoft, '↑ 18% vs last week', palette.accent, 10));

  // Bar chart (daily reading minutes)
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const vals = [28, 45, 12, 62, 38, 54, 42];
  const maxVal = Math.max(...vals);
  const chartH = 80;
  const chartY = 232;
  const chartX = 20;
  const barW = (W - 40) / days.length;
  els.push(rect(16, chartY - 8, W - 32, chartH + 40, palette.surface, 14));
  els.push(text('Daily reading (min)', 28, chartY, 11, palette.textMuted, { weight: 500 }));
  days.forEach((day, i) => {
    const bh = Math.round((vals[i] / maxVal) * chartH * 0.85);
    const bx = chartX + i * barW + barW * 0.15;
    const bw = barW * 0.7;
    const by = chartY + 20 + chartH - bh;
    const isToday = i === 6;
    els.push(rect(bx, by, bw, bh, isToday ? palette.accent : palette.surfaceEl, 3));
    els.push(text(day, bx + bw / 2, chartY + 24 + chartH, 11, isToday ? palette.accent : palette.textMuted, { align: 'center' }));
  });

  // Topic breakdown
  const topics = [
    { label: 'Technology', pct: 48, color: palette.accent },
    { label: 'Design', pct: 28, color: palette.amber },
    { label: 'Science', pct: 14, color: '#72B8C4' },
    { label: 'Essays', pct: 10, color: '#B07FD4' },
  ];
  els.push(rect(16, 358, W - 32, 116, palette.surface, 14));
  els.push(text('Topics', 28, 372, 13, palette.text, { weight: 600 }));
  topics.forEach((t, i) => {
    const ty = 394 + i * 22;
    els.push(text(t.label, 28, ty, 12, palette.textMuted));
    els.push(text(t.pct + '%', W - 28, ty, 12, t.color, { align: 'right', weight: 600 }));
    els.push(rect(100, ty + 2, W - 140, 6, palette.border, 3));
    els.push(rect(100, ty + 2, Math.round((W - 140) * t.pct / 100), 6, t.color, 3));
  });

  // Streak
  els.push(rect(16, 486, (W - 44) / 2, 66, palette.surface, 14));
  els.push(text('🔥', 28, 504, 18, palette.text));
  els.push(text('12-day streak', 54, 504, 13, palette.text, { weight: 600 }));
  els.push(text('Personal best: 19', 28, 524, 11, palette.textMuted));

  els.push(rect(W / 2 + 6, 486, (W - 44) / 2, 66, palette.surface, 14));
  els.push(text('📖', W / 2 + 18, 504, 18, palette.text));
  els.push(text('9 articles read', W / 2 + 44, 504, 13, palette.text, { weight: 600 }));
  els.push(text('Goal: 10 / week', W / 2 + 18, 524, 11, palette.textMuted));

  // Highlights count
  els.push(rect(16, 564, W - 32, 50, palette.surface, 14));
  els.push(text('✏  23 highlights saved this week', 28, 577, 13, palette.text));
  els.push(text('View all →', W - 28, 577, 13, palette.accent, { align: 'right', weight: 600 }));
  els.push(text('across 7 articles', 28, 597, 11, palette.textMuted));

  els.push(...bottomNav(3));
  return els;
}

// ─── Screen 6: Discover / Add to Queue ───────────────────────────────────────
function screenDiscover() {
  const els = [rect(0, 0, W, H, palette.bg)];
  els.push(...statusBar());

  els.push(text('Discover', 20, 62, 24, palette.text, { weight: 700, family: 'Georgia' }));
  els.push(text('Curated for your reading taste', 20, 92, 13, palette.textMuted));

  // Search
  els.push(rect(16, 110, W - 32, 42, palette.surface, 12));
  els.push(icon('search', 28, 120, 22, palette.textMuted));
  els.push(text('Search articles, topics, sources…', 58, 122, 13, palette.textDim));

  // Featured article (large card)
  els.push(rect(16, 164, W - 32, 148, palette.surface, 14));
  // image placeholder (dark gradient)
  els.push(rect(16, 164, W - 32, 72, palette.surfaceEl, 14));
  els.push(rect(16, 200, W - 32, 36, 'linear-gradient(transparent, rgba(24,27,20,0.9))', 0));
  // "Featured" badge
  els.push(...pill(28, 174, 62, 20, palette.accentSoft, 'Featured', palette.accent, 10));
  els.push(text('How the World Reads: Digital vs Print\nAttention Patterns in 2026', 28, 250, 14, palette.text, { weight: 600, lh: 1.3 }));
  els.push(text('Pew Research  ·  10 min  ·  94% match', 28, 292, 11, palette.textMuted));
  // Add button
  els.push(rect(W - 80, 290, 60, 28, palette.accent, 14));
  els.push(text('+ Add', W - 50, 296, 12, palette.bg, { align: 'center', weight: 700 }));

  // Curated list
  const items = [
    { title: 'The Science of Deep Work Rhythms', source: 'Cal Newport · 7 min', match: 91, tag: 'Productivity' },
    { title: 'Open Source AI: The Race Nobody Wins', source: 'Wired · 9 min', match: 88, tag: 'Tech' },
    { title: 'Second Cities: Where Creatives Moved', source: 'Bloomberg · 6 min', match: 82, tag: 'Culture' },
  ];
  els.push(text('Recommended', 20, 340, 14, palette.text, { weight: 600 }));
  let iy = 360;
  items.forEach(item => {
    els.push(rect(16, iy, W - 32, 72, palette.surface, 10));
    els.push(text(item.title, 28, iy + 12, 13, palette.text, { weight: 500 }));
    els.push(text(item.source, 28, iy + 34, 11, palette.textMuted));
    // match score
    els.push(rect(W - 80, iy + 10, 56, 20, palette.accentSoft, 10));
    els.push(text(item.match + '% match', W - 52, iy + 16, 10, palette.accent, { align: 'center', weight: 600 }));
    // tag
    els.push(text(item.tag, 28, iy + 52, 10, palette.textMuted, { weight: 500 }));
    iy += 82;
  });

  // Bottom nav — "Search" active (use search icon in position 1)
  const items2 = [
    { label: 'Queue', icon: 'list' },
    { label: 'Now', icon: 'eye' },
    { label: 'Discover', icon: 'search' },
    { label: 'Library', icon: 'layers' },
    { label: 'Stats', icon: 'activity' },
  ];
  els.push(rect(0, H - 80, W, 80, palette.bgAlt));
  els.push(line(0, H - 80, W, H - 80, palette.border));
  items2.forEach((item, i) => {
    const x = (W / items2.length) * i + W / items2.length / 2;
    const isActive = i === 2;
    const col = isActive ? palette.accent : palette.textMuted;
    els.push(icon(item.icon, x - 12, H - 67, 24, col));
    els.push(text(item.label, x, H - 38, 10, col, { align: 'center', weight: isActive ? 600 : 400 }));
    if (isActive) els.push(rect(x - 16, H - 80, 32, 2, palette.accent, 1));
  });

  return els;
}

// ─── Assemble .pen ─────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  meta: {
    name: 'REED',
    slug: 'reed',
    tagline: 'Your river of long reads',
    archetype: 'reading-intelligence',
    created: new Date().toISOString(),
    designer: 'RAM Heartbeat',
    inspiration: 'Current — A River of Reading (Land-book, 10 saves, Mar 2026) + Obsidian on DarkModeDesign',
    theme: 'dark',
  },
  palette: {
    background: palette.bg,
    surface:    palette.surface,
    text:       palette.text,
    textMuted:  palette.textMuted,
    accent:     palette.accent,
    accent2:    palette.amber,
    border:     palette.border,
  },
  screens: [
    { id: 'queue',     label: 'Reading Queue',      backgroundColor: palette.bg, elements: screenQueue() },
    { id: 'reading',   label: 'Immersive Reading',  backgroundColor: palette.bg, elements: screenReading() },
    { id: 'highlights',label: 'Highlights',         backgroundColor: palette.bg, elements: screenHighlights() },
    { id: 'library',   label: 'Library',            backgroundColor: palette.bg, elements: screenLibrary() },
    { id: 'stats',     label: 'Reading Stats',      backgroundColor: palette.bg, elements: screenStats() },
    { id: 'discover',  label: 'Discover',           backgroundColor: palette.bg, elements: screenDiscover() },
  ],
};

fs.writeFileSync('reed.pen', JSON.stringify(pen, null, 2));
console.log('✓ reed.pen written —', pen.screens.length, 'screens,', pen.screens.reduce((a, s) => a + s.elements.length, 0), 'elements');
