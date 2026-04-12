'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'quire';
const NAME = 'Quire';
const TAGLINE = 'Read what matters';
const HEARTBEAT = 386;

// Warm editorial light palette
const C = {
  bg:       '#FAF8F3',  // warm cream
  surf:     '#FFFFFF',  // pure white
  card:     '#F2EDE3',  // warm parchment
  card2:    '#EDE6D8',  // deeper parchment
  ink:      '#1C1917',  // near-black ink
  inkMid:   '#44403C',  // medium ink
  inkFaint: '#78716C',  // muted ink
  inkGhost: 'rgba(28,25,23,0.12)',
  divider:  'rgba(28,25,23,0.08)',
  // Topic accent palettes (5 categories)
  green:    '#2D6A4F',
  greenBg:  '#EAF4EE',
  cobalt:   '#1D4ED8',
  cobaltBg: '#EEF2FF',
  amber:    '#B45309',
  amberBg:  '#FEF3C7',
  brick:    '#B91C1C',
  brickBg:  '#FEE2E2',
  plum:     '#7C3AED',
  plumBg:   '#EDE9FE',
};

// ─── primitives ─────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, width: w, height: h, fill,
    rx: opts.rx ?? 0,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none',
    strokeWidth: opts.sw ?? 0,
  };
}
function text(x, y, content, size, fill, opts = {}) {
  return {
    type: 'text', x, y, content, fontSize: size, fill,
    fontWeight: opts.fw ?? 400,
    fontFamily: opts.font ?? 'Georgia, serif',
    textAnchor: opts.anchor ?? 'start',
    letterSpacing: opts.ls ?? 0,
    opacity: opts.opacity ?? 1,
  };
}
function circle(cx, cy, r, fill, opts = {}) {
  return { type: 'circle', cx, cy, r, fill, opacity: opts.opacity ?? 1, stroke: opts.stroke ?? 'none', strokeWidth: opts.sw ?? 0 };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return { type: 'line', x1, y1, x2, y2, stroke, strokeWidth: opts.sw ?? 1, opacity: opts.opacity ?? 1 };
}

const W = 390, H = 844;
const screens = [];

// ─── Screen 1: Today's Brief (Editorial Homepage) ────────────────────────────
{
  const els = [];

  // Status bar
  els.push(rect(0, 0, W, 44, C.bg));
  els.push(text(20, 30, '9:41', 15, C.ink, { fw: 600, font: 'system-ui, sans-serif' }));
  els.push(text(W - 20, 30, '●●●', 13, C.ink, { anchor: 'end', font: 'system-ui, sans-serif' }));

  // Header nav
  els.push(rect(0, 44, W, 52, C.bg));
  els.push(text(20, 78, 'QUIRE', 18, C.ink, { fw: 700, font: 'system-ui, sans-serif', ls: 4 }));
  els.push(text(W - 20, 78, '☰', 20, C.ink, { anchor: 'end', font: 'system-ui, sans-serif' }));
  els.push(line(20, 96, W - 20, 96, C.divider, { sw: 1 }));

  // Date + edition label
  els.push(text(20, 120, 'TUESDAY, APRIL 8', 10, C.inkFaint, { fw: 600, font: 'system-ui, sans-serif', ls: 2 }));
  els.push(text(20, 138, 'Morning Edition', 13, C.inkMid, { font: 'Georgia, serif' }));

  // ── HERO story ──────────────────────────────────────────────────────────
  // Large editorial image placeholder
  els.push(rect(20, 152, W - 40, 168, C.card2, { rx: 2 }));
  // Image texture lines
  for (let i = 0; i < 5; i++) {
    els.push(line(20, 170 + i * 30, W - 20, 170 + i * 30, C.divider, { sw: 1, opacity: 0.5 }));
  }
  // Category tag on image
  els.push(rect(32, 162, 72, 22, C.brick, { rx: 2 }));
  els.push(text(68, 177, 'CULTURE', 9, '#FFFFFF', { fw: 700, font: 'system-ui, sans-serif', ls: 1, anchor: 'middle' }));
  // Image label (article title in image area)
  els.push(text(32, 300, 'How the silence of libraries', 13, C.inkMid, { font: 'Georgia, serif' }));
  els.push(text(32, 316, 'became a luxury commodity', 13, C.inkMid, { font: 'Georgia, serif' }));

  // Hero headline (Big Type — siteinspire inspiration)
  els.push(text(20, 350, 'The Architecture', 28, C.ink, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(20, 382, 'of Quiet Spaces', 28, C.ink, { fw: 700, font: 'Georgia, serif' }));

  // Author + read time
  els.push(line(20, 398, 80, 398, C.brick, { sw: 2 }));
  els.push(text(20, 416, 'Maya Holloway  ·  7 min read', 12, C.inkFaint, { font: 'system-ui, sans-serif' }));

  // Deck text
  els.push(text(20, 440, 'As cities grow louder, a new generation', 13, C.inkMid, { font: 'Georgia, serif' }));
  els.push(text(20, 458, 'of designers is reimagining silence as an', 13, C.inkMid, { font: 'Georgia, serif' }));
  els.push(text(20, 476, 'architectural material rather than an absence.', 13, C.inkMid, { font: 'Georgia, serif' }));

  // Divider
  els.push(line(20, 500, W - 20, 500, C.divider, { sw: 1 }));

  // ── Secondary stories row ───────────────────────────────────────────────
  els.push(text(20, 522, 'Also in today\'s brief', 11, C.inkFaint, { fw: 600, font: 'system-ui, sans-serif', ls: 1 }));

  // Story 2
  els.push(rect(20, 534, W / 2 - 28, 88, C.card, { rx: 2 }));
  els.push(rect(22, 536, 52, 52, C.cobaltBg, { rx: 2 }));
  els.push(text(48, 566, 'T', 24, C.cobalt, { fw: 700, font: 'Georgia, serif', anchor: 'middle' }));
  els.push(rect(22, 536, 52, 14, C.cobalt, { rx: 2, opacity: 0.15 }));
  els.push(text(22, 603, 'Tech', 9, C.cobalt, { fw: 600, font: 'system-ui, sans-serif', ls: 1 }));
  els.push(text(22, 617, 'Why open-source', 11, C.ink, { fw: 600, font: 'Georgia, serif' }));
  els.push(text(22, 631, 'won the AI race', 11, C.ink, { fw: 600, font: 'Georgia, serif' }));

  // Story 3
  els.push(rect(W / 2 + 8, 534, W / 2 - 28, 88, C.card, { rx: 2 }));
  els.push(rect(W / 2 + 10, 536, 52, 52, C.greenBg, { rx: 2 }));
  els.push(text(W / 2 + 36, 566, 'E', 24, C.green, { fw: 700, font: 'Georgia, serif', anchor: 'middle' }));
  els.push(text(W / 2 + 10, 603, 'Environ', 9, C.green, { fw: 600, font: 'system-ui, sans-serif', ls: 1 }));
  els.push(text(W / 2 + 10, 617, 'The river cities', 11, C.ink, { fw: 600, font: 'Georgia, serif' }));
  els.push(text(W / 2 + 10, 631, 'that refused to flood', 11, C.ink, { fw: 600, font: 'Georgia, serif' }));

  // Bottom navigation
  els.push(rect(0, H - 80, W, 80, C.surf));
  els.push(line(0, H - 80, W, H - 80, C.divider, { sw: 1 }));
  const navItems = [
    { label: 'Brief', x: 48, active: true },
    { label: 'Explore', x: 146 },
    { label: 'Saved', x: 244 },
    { label: 'Profile', x: 342 },
  ];
  navItems.forEach(n => {
    const col = n.active ? C.ink : C.inkFaint;
    els.push(circle(n.x, H - 52, 10, n.active ? C.card2 : 'none'));
    els.push(text(n.x, H - 44, n.active ? '◆' : '○', 14, col, { anchor: 'middle', font: 'system-ui, sans-serif' }));
    els.push(text(n.x, H - 24, n.label, 10, col, { fw: n.active ? 600 : 400, font: 'system-ui, sans-serif', anchor: 'middle' }));
  });

  screens.push({ name: 'Today\'s Brief', elements: els });
}

// ─── Screen 2: Story Reader ──────────────────────────────────────────────────
{
  const els = [];
  const ACC = C.brick;
  const ACC_BG = C.brickBg;

  // Header
  els.push(rect(0, 0, W, 44, C.surf));
  els.push(text(20, 30, '9:41', 15, C.ink, { fw: 600, font: 'system-ui, sans-serif' }));

  els.push(rect(0, 44, W, 52, C.surf));
  els.push(text(20, 76, '←', 20, C.inkMid, { font: 'system-ui, sans-serif' }));
  els.push(text(W - 20, 74, '⋯', 22, C.inkMid, { anchor: 'end', font: 'system-ui, sans-serif' }));
  els.push(text(W / 2, 76, 'Culture', 14, C.ink, { fw: 600, font: 'Georgia, serif', anchor: 'middle' }));
  els.push(line(0, 96, W, 96, C.divider, { sw: 1 }));

  // Category + reading time pill
  els.push(rect(20, 108, 68, 22, ACC_BG, { rx: 11 }));
  els.push(text(54, 123, 'CULTURE', 9, ACC, { fw: 700, font: 'system-ui, sans-serif', ls: 1, anchor: 'middle' }));
  els.push(text(100, 123, '7 min read', 12, C.inkFaint, { font: 'system-ui, sans-serif' }));

  // BIG TYPE HEADLINE — main editorial differentiator
  els.push(text(20, 158, 'The Architecture', 30, C.ink, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(20, 194, 'of Quiet', 30, C.ink, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(20, 230, 'Spaces', 30, C.ink, { fw: 700, font: 'Georgia, serif' }));

  // Accent rule
  els.push(line(20, 246, 56, 246, ACC, { sw: 3 }));

  // Author row
  els.push(circle(20 + 16, 272, 16, C.card2));
  els.push(text(20 + 16, 278, 'M', 16, ACC, { fw: 700, font: 'Georgia, serif', anchor: 'middle' }));
  els.push(text(20 + 40, 266, 'Maya Holloway', 13, C.ink, { fw: 600, font: 'system-ui, sans-serif' }));
  els.push(text(20 + 40, 282, 'Staff Writer  ·  Apr 8, 2026', 11, C.inkFaint, { font: 'system-ui, sans-serif' }));

  // Hero image
  els.push(rect(0, 300, W, 160, C.card2));
  // Subtle grid texture
  for (let i = 0; i < 4; i++) {
    els.push(line(0, 320 + i * 36, W, 320 + i * 36, C.divider, { sw: 1, opacity: 0.6 }));
  }
  els.push(text(W / 2, 382, '◈', 36, C.card, { anchor: 'middle', font: 'system-ui, sans-serif', opacity: 0.6 }));

  // Body text (editorial)
  els.push(text(20, 482, 'There is a growing movement among architects and', 13, C.inkMid, { font: 'Georgia, serif' }));
  els.push(text(20, 500, 'urban planners who argue that noise pollution has', 13, C.inkMid, { font: 'Georgia, serif' }));
  els.push(text(20, 518, 'become the defining crisis of the modern city.', 13, C.inkMid, { font: 'Georgia, serif' }));

  // Pull quote — BIG editorial moment
  els.push(rect(0, 536, W, 108, ACC_BG));
  els.push(line(20, 536, 20, 644, ACC, { sw: 3 }));
  els.push(text(36, 564, '"Silence is not the absence of', 14, C.ink, { fw: 600, font: 'Georgia, serif' }));
  els.push(text(36, 584, 'sound — it is a space you must', 14, C.ink, { fw: 600, font: 'Georgia, serif' }));
  els.push(text(36, 604, 'actively design for."', 14, C.ink, { fw: 600, font: 'Georgia, serif' }));
  els.push(text(36, 626, '— Amara Singh, Studio Pause', 11, C.inkFaint, { font: 'system-ui, sans-serif' }));

  // Reading progress bar
  els.push(rect(0, H - 84, W, 4, C.divider));
  els.push(rect(0, H - 84, W * 0.32, 4, ACC));

  // Bottom nav
  els.push(rect(0, H - 80, W, 80, C.surf));
  els.push(line(0, H - 80, W, H - 80, C.divider, { sw: 1 }));
  const navItems = ['←', '♡', '⋯', '→'];
  const navLabels = ['Back', 'Save', 'Share', 'Next'];
  navItems.forEach((icon, i) => {
    const x = 50 + i * 88;
    els.push(text(x, H - 46, icon, 20, i === 3 ? ACC : C.inkMid, { anchor: 'middle', font: 'system-ui, sans-serif' }));
    els.push(text(x, H - 24, navLabels[i], 10, C.inkFaint, { anchor: 'middle', font: 'system-ui, sans-serif' }));
  });

  screens.push({ name: 'Story Reader', elements: els });
}

// ─── Screen 3: Explore by Topic ──────────────────────────────────────────────
{
  const els = [];

  // Status bar
  els.push(rect(0, 0, W, 44, C.bg));
  els.push(text(20, 30, '9:41', 15, C.ink, { fw: 600, font: 'system-ui, sans-serif' }));

  // Header
  els.push(rect(0, 44, W, 52, C.bg));
  els.push(text(20, 76, 'Explore', 26, C.ink, { fw: 700, font: 'Georgia, serif' }));
  els.push(line(0, 96, W, 96, C.divider, { sw: 1 }));

  // Search bar
  els.push(rect(20, 108, W - 40, 40, C.surf, { rx: 8, stroke: C.divider, sw: 1 }));
  els.push(text(44, 133, 'Search stories and writers...', 13, C.inkGhost.replace('0.12', '0.3'), { font: 'system-ui, sans-serif' }));
  els.push(text(32, 132, '⌕', 16, C.inkFaint, { font: 'system-ui, sans-serif' }));

  // ── Topic categories (contextual color per topic) ───────────────────────
  const topics = [
    { label: 'Culture', count: '124 stories', acc: C.brick, bg: C.brickBg, icon: '◉', col: 0 },
    { label: 'Technology', count: '98 stories', acc: C.cobalt, bg: C.cobaltBg, icon: '◈', col: 1 },
    { label: 'Environment', count: '76 stories', acc: C.green, bg: C.greenBg, icon: '◎', col: 0 },
    { label: 'Science', count: '89 stories', acc: C.amber, bg: C.amberBg, icon: '◇', col: 1 },
    { label: 'Society', count: '113 stories', acc: C.plum, bg: C.plumBg, icon: '▣', col: 0 },
  ];

  els.push(text(20, 172, 'TOPICS', 10, C.inkFaint, { fw: 600, font: 'system-ui, sans-serif', ls: 2 }));

  topics.forEach((t, i) => {
    const y = 184 + i * 82;
    els.push(rect(20, y, W - 40, 72, t.bg, { rx: 8 }));
    // Left accent bar
    els.push(rect(20, y, 4, 72, t.acc, { rx: 2 }));
    // Icon circle
    els.push(circle(54, y + 36, 20, t.acc + '22'));
    els.push(text(54, y + 42, t.icon, 18, t.acc, { anchor: 'middle', font: 'system-ui, sans-serif' }));
    // Topic name (big type)
    els.push(text(84, y + 28, t.label, 18, C.ink, { fw: 700, font: 'Georgia, serif' }));
    els.push(text(84, y + 50, t.count, 12, C.inkFaint, { font: 'system-ui, sans-serif' }));
    // Arrow
    els.push(text(W - 36, y + 38, '›', 20, t.acc, { anchor: 'middle', font: 'system-ui, sans-serif' }));
  });

  // Bottom navigation
  els.push(rect(0, H - 80, W, 80, C.surf));
  els.push(line(0, H - 80, W, H - 80, C.divider, { sw: 1 }));
  const navItems = [
    { label: 'Brief', x: 48 },
    { label: 'Explore', x: 146, active: true },
    { label: 'Saved', x: 244 },
    { label: 'Profile', x: 342 },
  ];
  navItems.forEach(n => {
    const col = n.active ? C.ink : C.inkFaint;
    els.push(circle(n.x, H - 52, 10, n.active ? C.card2 : 'none'));
    els.push(text(n.x, H - 44, n.active ? '◆' : '○', 14, col, { anchor: 'middle', font: 'system-ui, sans-serif' }));
    els.push(text(n.x, H - 24, n.label, 10, col, { fw: n.active ? 600 : 400, font: 'system-ui, sans-serif', anchor: 'middle' }));
  });

  screens.push({ name: 'Explore Topics', elements: els });
}

// ─── Screen 4: Topic Feed — Technology (cobalt) ──────────────────────────────
{
  const els = [];
  const ACC = C.cobalt;
  const ACC_BG = C.cobaltBg;

  // Status + header
  els.push(rect(0, 0, W, 44, C.bg));
  els.push(text(20, 30, '9:41', 15, C.ink, { fw: 600, font: 'system-ui, sans-serif' }));
  els.push(rect(0, 44, W, 52, C.bg));
  els.push(text(20, 76, '←', 20, C.inkMid, { font: 'system-ui, sans-serif' }));
  els.push(text(W - 20, 72, '⋮', 22, C.inkMid, { anchor: 'end', font: 'system-ui, sans-serif' }));

  // Topic header — contextual cobalt palette
  els.push(rect(0, 96, W, 88, ACC_BG));
  els.push(line(0, 96, W, 96, ACC + '33', { sw: 1 }));
  els.push(text(20, 126, '◈', 22, ACC, { font: 'system-ui, sans-serif' }));
  els.push(text(50, 126, 'Technology', 22, C.ink, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(20, 150, '98 stories  ·  Updated daily', 12, C.inkFaint, { font: 'system-ui, sans-serif' }));
  els.push(line(0, 184, W, 184, C.divider, { sw: 1 }));

  // Story list
  const stories = [
    {
      tag: 'AI', title: 'Why open-source won the AI race', author: 'James Okafor', time: '12 min', new: true,
    },
    {
      tag: 'Privacy', title: 'The browser that forgot you', author: 'Lena Moreau', time: '8 min', new: false,
    },
    {
      tag: 'Hardware', title: 'Inside the last chip factory', author: 'David Park', time: '15 min', new: false,
    },
    {
      tag: 'Software', title: 'The forgotten art of slow code', author: 'Priya Nair', time: '6 min', new: true,
    },
  ];

  stories.forEach((s, i) => {
    const y = 196 + i * 102;
    // Story card
    els.push(rect(20, y, W - 40, 92, C.surf, { rx: 4, stroke: C.divider, sw: 1 }));
    // NEW badge
    if (s.new) {
      els.push(rect(W - 72, y + 8, 36, 16, ACC, { rx: 8 }));
      els.push(text(W - 54, y + 19, 'NEW', 8, '#FFF', { fw: 700, font: 'system-ui, sans-serif', ls: 1, anchor: 'middle' }));
    }
    // Tag
    els.push(rect(32, y + 10, s.tag.length * 7 + 12, 18, ACC_BG, { rx: 9 }));
    els.push(text(38, y + 22, s.tag, 9, ACC, { fw: 600, font: 'system-ui, sans-serif', ls: 0.5 }));
    // Headline
    els.push(text(32, y + 48, s.title, 15, C.ink, { fw: 700, font: 'Georgia, serif' }));
    // Meta
    els.push(text(32, y + 70, s.author, 11, C.inkFaint, { font: 'system-ui, sans-serif' }));
    els.push(text(32 + s.author.length * 6.5 + 12, y + 70, `·  ${s.time} read`, 11, C.inkFaint, { font: 'system-ui, sans-serif' }));
    // Thumb placeholder
    els.push(rect(W - 76, y + 20, 52, 52, C.card2, { rx: 4 }));
    els.push(text(W - 50, y + 50, '◈', 18, ACC + '55', { anchor: 'middle', font: 'system-ui, sans-serif' }));
  });

  // Bottom nav
  els.push(rect(0, H - 80, W, 80, C.surf));
  els.push(line(0, H - 80, W, H - 80, C.divider, { sw: 1 }));
  ['Brief', 'Explore', 'Saved', 'Profile'].forEach((lbl, i) => {
    const x = 48 + i * 98;
    const active = i === 1;
    const col = active ? C.ink : C.inkFaint;
    els.push(circle(x, H - 52, 10, active ? C.card2 : 'none'));
    els.push(text(x, H - 44, active ? '◆' : '○', 14, col, { anchor: 'middle', font: 'system-ui, sans-serif' }));
    els.push(text(x, H - 24, lbl, 10, col, { fw: active ? 600 : 400, font: 'system-ui, sans-serif', anchor: 'middle' }));
  });

  screens.push({ name: 'Technology Feed', elements: els });
}

// ─── Screen 5: Saved Reading List ────────────────────────────────────────────
{
  const els = [];

  // Status bar + header
  els.push(rect(0, 0, W, 44, C.bg));
  els.push(text(20, 30, '9:41', 15, C.ink, { fw: 600, font: 'system-ui, sans-serif' }));
  els.push(rect(0, 44, W, 52, C.bg));
  els.push(text(20, 76, 'Saved', 26, C.ink, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(W - 20, 74, '+ List', 13, C.inkFaint, { anchor: 'end', font: 'system-ui, sans-serif' }));
  els.push(line(0, 96, W, 96, C.divider, { sw: 1 }));

  // Reading time summary pill
  els.push(rect(20, 108, W - 40, 56, C.card, { rx: 8 }));
  els.push(text(44, 130, '◷', 18, C.inkMid, { font: 'system-ui, sans-serif' }));
  els.push(text(68, 130, '47 min of reading saved', 14, C.ink, { fw: 600, font: 'Georgia, serif' }));
  els.push(text(68, 150, '6 articles across 4 topics', 12, C.inkFaint, { font: 'system-ui, sans-serif' }));

  // List sections by topic
  const sections = [
    {
      topic: 'Culture', acc: C.brick, items: [
        { title: 'The Architecture of Quiet Spaces', time: '7 min' },
        { title: 'What the Met Gala forgot about clothes', time: '9 min' },
      ],
    },
    {
      topic: 'Technology', acc: C.cobalt, items: [
        { title: 'Why open-source won the AI race', time: '12 min' },
        { title: 'The forgotten art of slow code', time: '6 min' },
      ],
    },
    {
      topic: 'Environment', acc: C.green, items: [
        { title: 'The river cities that refused to flood', time: '11 min' },
      ],
    },
  ];

  let y = 180;
  sections.forEach(sec => {
    // Section header
    els.push(rect(20, y, 8, 20, sec.acc, { rx: 2 }));
    els.push(text(36, y + 14, sec.topic, 12, sec.acc, { fw: 700, font: 'system-ui, sans-serif', ls: 1 }));
    y += 28;

    sec.items.forEach(item => {
      els.push(rect(20, y, W - 40, 60, C.surf, { rx: 4, stroke: C.divider, sw: 1 }));
      els.push(rect(20, y, 4, 60, sec.acc, { rx: 2 }));
      els.push(text(32, y + 24, item.title, 13, C.ink, { fw: 600, font: 'Georgia, serif' }));
      els.push(text(32, y + 42, `${item.time} read`, 11, C.inkFaint, { font: 'system-ui, sans-serif' }));
      els.push(text(W - 36, y + 32, '›', 18, sec.acc, { anchor: 'middle', font: 'system-ui, sans-serif' }));
      y += 68;
    });
    y += 8;
  });

  // Bottom nav
  els.push(rect(0, H - 80, W, 80, C.surf));
  els.push(line(0, H - 80, W, H - 80, C.divider, { sw: 1 }));
  ['Brief', 'Explore', 'Saved', 'Profile'].forEach((lbl, i) => {
    const x = 48 + i * 98;
    const active = i === 2;
    const col = active ? C.ink : C.inkFaint;
    els.push(circle(x, H - 52, 10, active ? C.card2 : 'none'));
    els.push(text(x, H - 44, active ? '◆' : '○', 14, col, { anchor: 'middle', font: 'system-ui, sans-serif' }));
    els.push(text(x, H - 24, lbl, 10, col, { fw: active ? 600 : 400, font: 'system-ui, sans-serif', anchor: 'middle' }));
  });

  screens.push({ name: 'Saved Reading List', elements: els });
}

// ─── Screen 6: Reader Profile ─────────────────────────────────────────────────
{
  const els = [];

  // Status bar + header
  els.push(rect(0, 0, W, 44, C.bg));
  els.push(text(20, 30, '9:41', 15, C.ink, { fw: 600, font: 'system-ui, sans-serif' }));
  els.push(rect(0, 44, W, 52, C.bg));
  els.push(text(20, 76, 'Profile', 26, C.ink, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(W - 20, 74, '⚙', 18, C.inkFaint, { anchor: 'end', font: 'system-ui, sans-serif' }));
  els.push(line(0, 96, W, 96, C.divider, { sw: 1 }));

  // Avatar
  els.push(circle(W / 2, 158, 42, C.card2));
  els.push(text(W / 2, 168, 'SL', 22, C.inkMid, { fw: 700, font: 'Georgia, serif', anchor: 'middle' }));

  // Name + handle
  els.push(text(W / 2, 220, 'Simone Laurent', 20, C.ink, { fw: 700, font: 'Georgia, serif', anchor: 'middle' }));
  els.push(text(W / 2, 240, '@simonelaurent · Member since 2025', 12, C.inkFaint, { font: 'system-ui, sans-serif', anchor: 'middle' }));

  // Reading stats row
  els.push(rect(20, 258, W - 40, 72, C.card, { rx: 8 }));
  const stats = [
    { label: 'Articles', val: '284' },
    { label: 'Hours read', val: '37' },
    { label: 'Topics', val: '5' },
  ];
  stats.forEach((s, i) => {
    const x = 60 + i * 90;
    els.push(text(x, 292, s.val, 22, C.ink, { fw: 700, font: 'Georgia, serif', anchor: 'middle' }));
    els.push(text(x, 312, s.label, 11, C.inkFaint, { font: 'system-ui, sans-serif', anchor: 'middle' }));
    if (i < 2) els.push(line(x + 45, 272, x + 45, 318, C.divider, { sw: 1 }));
  });

  // Reading pace (editorial visual — bar chart by day)
  els.push(text(20, 354, 'READING THIS WEEK', 10, C.inkFaint, { fw: 600, font: 'system-ui, sans-serif', ls: 2 }));
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const pcts = [0.4, 0.7, 0.3, 0.9, 0.5, 0.2, 0.6];
  const barW = 30, barMaxH = 60;
  const barsStartX = 28;
  days.forEach((d, i) => {
    const bx = barsStartX + i * 48;
    const bh = pcts[i] * barMaxH;
    const topY = 370 + (barMaxH - bh);
    els.push(rect(bx, topY, barW, bh, i === 3 ? C.ink : C.card2, { rx: 4 }));
    els.push(text(bx + 15, 444, d, 10, C.inkFaint, { anchor: 'middle', font: 'system-ui, sans-serif' }));
  });

  // Favorite topics
  els.push(text(20, 472, 'FAVORITE TOPICS', 10, C.inkFaint, { fw: 600, font: 'system-ui, sans-serif', ls: 2 }));
  const favTopics = [
    { label: 'Culture', acc: C.brick, bg: C.brickBg },
    { label: 'Technology', acc: C.cobalt, bg: C.cobaltBg },
    { label: 'Environment', acc: C.green, bg: C.greenBg },
    { label: 'Science', acc: C.amber, bg: C.amberBg },
  ];
  let tx = 20;
  favTopics.forEach(t => {
    const pill_w = t.label.length * 7.5 + 20;
    els.push(rect(tx, 482, pill_w, 26, t.bg, { rx: 13 }));
    els.push(text(tx + pill_w / 2, 499, t.label, 11, t.acc, { fw: 600, font: 'system-ui, sans-serif', anchor: 'middle' }));
    tx += pill_w + 8;
  });

  // Newsletter toggle section
  els.push(line(20, 522, W - 20, 522, C.divider, { sw: 1 }));
  els.push(text(20, 546, 'Morning Edition newsletter', 14, C.ink, { fw: 600, font: 'Georgia, serif' }));
  els.push(text(20, 564, 'Daily brief delivered at 7:00 AM', 12, C.inkFaint, { font: 'system-ui, sans-serif' }));
  // Toggle (on)
  els.push(rect(W - 60, 542, 44, 24, C.ink, { rx: 12 }));
  els.push(circle(W - 24, 554, 10, C.surf));

  // Reading mode row
  els.push(line(20, 588, W - 20, 588, C.divider, { sw: 1 }));
  els.push(text(20, 612, 'Reading font', 14, C.ink, { fw: 600, font: 'Georgia, serif' }));
  // Font options
  const fonts = ['Serif', 'Sans', 'Mono'];
  fonts.forEach((f, i) => {
    const fx = W - 180 + i * 60;
    const active = i === 0;
    els.push(rect(fx, 598, 52, 26, active ? C.ink : C.card, { rx: 13 }));
    els.push(text(fx + 26, 615, f, 11, active ? C.surf : C.inkMid, { fw: active ? 600 : 400, font: 'system-ui, sans-serif', anchor: 'middle' }));
  });

  // Bottom nav
  els.push(rect(0, H - 80, W, 80, C.surf));
  els.push(line(0, H - 80, W, H - 80, C.divider, { sw: 1 }));
  ['Brief', 'Explore', 'Saved', 'Profile'].forEach((lbl, i) => {
    const x = 48 + i * 98;
    const active = i === 3;
    const col = active ? C.ink : C.inkFaint;
    els.push(circle(x, H - 52, 10, active ? C.card2 : 'none'));
    els.push(text(x, H - 44, active ? '◆' : '○', 14, col, { anchor: 'middle', font: 'system-ui, sans-serif' }));
    els.push(text(x, H - 24, lbl, 10, col, { fw: active ? 600 : 400, font: 'system-ui, sans-serif', anchor: 'middle' }));
  });

  screens.push({ name: 'Reader Profile', elements: els });
}

// ─── Assemble pen ────────────────────────────────────────────────────────────
const totalElements = screens.reduce((s, sc) => s + sc.elements.length, 0);

function renderElement(el) {
  if (el.type === 'rect') {
    const rx = el.rx ? ` rx="${el.rx}"` : '';
    const stroke = el.stroke && el.stroke !== 'none' ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth}"` : '';
    return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}"${rx}${stroke} opacity="${el.opacity}"/>`;
  }
  if (el.type === 'text') {
    const anchor = el.textAnchor !== 'start' ? ` text-anchor="${el.textAnchor}"` : '';
    const ls = el.letterSpacing ? ` letter-spacing="${el.letterSpacing}"` : '';
    return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${el.fontWeight}" font-family="${el.fontFamily}"${anchor}${ls} opacity="${el.opacity}">${el.content}</text>`;
  }
  if (el.type === 'circle') {
    const stroke = el.stroke && el.stroke !== 'none' ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth}"` : '';
    return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}"${stroke} opacity="${el.opacity}"/>`;
  }
  if (el.type === 'line') {
    return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" opacity="${el.opacity}"/>`;
  }
  return '';
}

const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'light',
    heartbeat: HEARTBEAT,
    elements: totalElements,
    slug: SLUG,
    tagline: TAGLINE,
    description: 'A curated editorial reading app with content-driven contextual color per topic. Inspired by Deem Journal on Siteinspire and KOMETA Typefaces on minimal.gallery.',
    palette: {
      bg: C.bg, surface: C.surf, card: C.card, ink: C.ink,
      accent: C.brick, accent2: C.cobalt,
    },
    inspirationSource: 'Siteinspire (Deem Journal - contextual editorial styling, Big Type) + minimal.gallery (KOMETA Typefaces)',
  },
  screens: screens.map(sc => ({
    name: sc.name,
    width: W,
    height: H,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${sc.elements.map(renderElement).join('')}</svg>`,
    elements: sc.elements,
  })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
