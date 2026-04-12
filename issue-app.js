// ISSUE — Independent curated reading, styled like an art magazine
// Inspired by: PW Magazine + QP Magazine on siteinspire.com (editorial publications)
//              The Lookback SOTD (Mar 27, 2026 awwwards) — "digital capsule" archival concept
// Light editorial theme: warm paper bg, deep terracotta accent, forest green secondary
// Pencil.dev v2.8 format

const fs = require('fs');
const path = require('path');

const BG      = '#FAF7F2';  // warm paper
const SURFACE = '#FFFFFF';
const SURFACE2= '#F2EDE4';  // warm off-white card
const TEXT    = '#1A1714';  // warm near-black
const MUTED   = '#8A7D70';  // warm muted
const ACCENT  = '#C2420A';  // deep terracotta/ember
const ACCENT2 = '#2C5445';  // forest green
const DIM     = '#E8E2D8';  // subtle border
const BORDER  = '#D6CFC4';

function rect(x, y, w, h, fill, opts = {}) {
  return { type: 'rect', x, y, width: w, height: h, fill, radius: opts.radius ?? 0, opacity: opts.opacity ?? 1 };
}
function text(content, x, y, opts = {}) {
  return {
    type: 'text', content, x, y,
    fontSize: opts.size ?? 14,
    fontWeight: opts.weight ?? 'regular',
    color: opts.color ?? TEXT,
    align: opts.align ?? 'left',
    fontFamily: opts.font ?? 'Inter',
    opacity: opts.opacity ?? 1,
  };
}
function line(x1, y1, x2, y2, color = DIM, width = 1) {
  return { type: 'line', x1, y1, x2, y2, stroke: color, strokeWidth: width };
}
function circle(cx, cy, r, fill, opts = {}) {
  return { type: 'circle', cx, cy, r, fill, opacity: opts.opacity ?? 1 };
}

// ─── SCREEN 1: LIBRARY (Home) ─────────────────────────────────────────────
function screenLibrary() {
  const els = [];
  const W = 390, H = 844;

  els.push(rect(0, 0, W, H, BG));

  // Top bar
  els.push(text('9:41', 20, 16, { size: 13, weight: 'semibold', color: TEXT }));
  els.push(text('●●●  WiFi  🔋', 280, 16, { size: 11, color: MUTED }));

  // Masthead
  els.push(line(20, 40, 370, 40, BORDER));
  els.push(text('ISSUE', 195, 68, { size: 28, weight: 'bold', color: TEXT, align: 'center', font: 'Playfair Display' }));
  els.push(text('Curated reading for the curious', 195, 90, { size: 11, color: MUTED, align: 'center' }));
  els.push(line(20, 105, 370, 105, BORDER));

  // Issue number indicator
  els.push(text('No. 47 · Apr 3, 2026', 195, 120, { size: 10, weight: 'bold', color: ACCENT, align: 'center' }));

  // FEATURED ISSUE — large editorial card
  els.push(rect(20, 138, 350, 220, SURFACE2, { radius: 4 }));
  // Image area (gray rect simulating photo)
  els.push(rect(20, 138, 350, 140, '#C8BFB4', { radius: 4 }));
  // Category tag
  els.push(rect(32, 150, 72, 22, ACCENT, { radius: 2 }));
  els.push(text('DESIGN', 68, 164, { size: 10, weight: 'bold', color: '#FFFFFF', align: 'center' }));
  // Image caption area
  els.push(rect(20, 254, 350, 104, SURFACE, { radius: 0 }));
  els.push(text('Vol. 12 — The Future of Craft', 32, 276, { size: 18, weight: 'bold', color: TEXT, font: 'Playfair Display' }));
  els.push(text('How independent studios are reclaiming analog', 32, 300, { size: 12, color: MUTED }));
  els.push(text('process in a world of AI-generated everything.', 32, 316, { size: 12, color: MUTED }));
  els.push(text('12 essays · 34 min read', 32, 340, { size: 11, weight: 'semibold', color: ACCENT2 }));
  els.push(text('→', 344, 340, { size: 14, color: ACCENT, align: 'right' }));

  // Section label
  els.push(text('RECENT ISSUES', 20, 376, { size: 10, weight: 'bold', color: MUTED }));
  els.push(line(20, 386, 370, 386, DIM));

  // Issue cards (horizontal strip style)
  const issues = [
    { num: 46, topic: 'Cities in Motion', tag: 'URBAN', color: '#4A6B8A', reads: '8 stories', time: '22 min' },
    { num: 45, topic: 'The Slow Web', tag: 'TECH',  color: ACCENT2,     reads: '6 stories', time: '18 min' },
    { num: 44, topic: 'Material Culture', tag: 'ART', color: '#8A4A35',  reads: '10 stories', time: '27 min' },
  ];
  issues.forEach((iss, i) => {
    const iy = 398 + i * 108;
    els.push(rect(20, iy, 350, 96, SURFACE, { radius: 4 }));
    els.push(line(20, iy, 20, iy + 96, iss.color, 3)); // left accent stripe
    // Thumb
    els.push(rect(26, iy + 8, 72, 80, '#E8E2D8', { radius: 2 }));
    // Tag
    els.push(rect(30, iy + 14, 50, 16, iss.color, { radius: 2 }));
    els.push(text(iss.tag, 55, iy + 25, { size: 8, weight: 'bold', color: '#FFFFFF', align: 'center' }));
    // Text
    els.push(text(`No. ${iss.num}`, 108, iy + 22, { size: 10, color: MUTED }));
    els.push(text(iss.topic, 108, iy + 42, { size: 15, weight: 'semibold', color: TEXT, font: 'Playfair Display' }));
    els.push(text(`${iss.reads} · ${iss.time}`, 108, iy + 62, { size: 11, color: MUTED }));
    els.push(text('→', 354, iy + 48, { size: 14, color: ACCENT, align: 'right' }));
    if (i < issues.length - 1) els.push(line(20, iy + 96, 370, iy + 96, DIM));
  });

  // Masthead footer stripe
  els.push(line(0, 725, W, 725, BORDER));
  els.push(text('A. Curated · B. Topics · C. Saved · D. You', 195, 744, { size: 11, color: MUTED, align: 'center' }));

  // Bottom nav
  els.push(rect(0, 752, W, 92, SURFACE));
  els.push(line(0, 752, W, 752, BORDER));
  const navItems = ['◎ Library', '☰ Topics', '♡ Saved', '⊙ Profile'];
  navItems.forEach((item, i) => {
    const nx = 49 + i * 98;
    const isActive = i === 0;
    els.push(text(item, nx, 800, { size: 11, weight: isActive ? 'semibold' : 'regular', color: isActive ? ACCENT : MUTED, align: 'center' }));
    if (isActive) els.push(rect(nx - 24, 752, 48, 2, ACCENT));
  });
  els.push(rect(155, 833, 80, 4, 'rgba(26,23,20,0.2)', { radius: 2 }));

  return { id: 'screen-1', name: 'Library', width: W, height: H, backgroundColor: BG, elements: els };
}

// ─── SCREEN 2: ISSUE VIEW (Current Issue) ──────────────────────────────────
function screenIssueView() {
  const els = [];
  const W = 390, H = 844;

  els.push(rect(0, 0, W, H, BG));

  // Status bar
  els.push(text('9:41', 20, 16, { size: 13, weight: 'semibold', color: TEXT }));

  // Issue header — editorial masthead style
  els.push(rect(0, 38, W, 200, '#C8BFB4')); // Full-bleed hero image
  // Gradient overlay for text legibility
  els.push(rect(0, 138, W, 100, 'rgba(26,23,20,0.55)'));
  // Back button
  els.push(text('← Back', 20, 56, { size: 13, color: '#FFFFFF' }));
  // Share icon
  els.push(text('↗', 358, 56, { size: 16, color: '#FFFFFF', align: 'right' }));
  // Issue label on image
  els.push(rect(20, 156, 70, 20, ACCENT, { radius: 2 }));
  els.push(text('DESIGN', 55, 169, { size: 9, weight: 'bold', color: '#FFFFFF', align: 'center' }));
  els.push(text('Vol. 12', 20, 196, { size: 12, color: 'rgba(255,255,255,0.8)' }));
  els.push(text('The Future of Craft', 20, 222, { size: 22, weight: 'bold', color: '#FFFFFF', font: 'Playfair Display' }));

  // Issue intro
  els.push(rect(0, 238, W, 80, SURFACE));
  els.push(text('12 essays · 34 min total · Apr 3, 2026', 20, 260, { size: 11, color: MUTED }));
  els.push(text('How independent studios are reclaiming analog process', 20, 282, { size: 13, color: TEXT }));
  els.push(text('in a world of AI-generated everything.', 20, 299, { size: 13, color: TEXT }));
  els.push(text('Continue reading →', 20, 316, { size: 12, weight: 'semibold', color: ACCENT }));

  // Progress bar
  els.push(rect(0, 318, W, 3, DIM));
  els.push(rect(0, 318, 140, 3, ACCENT));

  // Stories in this issue
  els.push(text('IN THIS ISSUE', 20, 340, { size: 10, weight: 'bold', color: MUTED }));

  const stories = [
    { n: 1, title: 'The Return of the Handmade', author: 'Mia Torrez', type: 'Essay', mins: 8, read: true },
    { n: 2, title: 'Studio Hytta\'s Manifesto',   author: 'Anders Holt', type: 'Profile', mins: 5, read: true },
    { n: 3, title: 'Grain and Texture as Identity', author: 'Jun Park', type: 'Visual', mins: 3, read: false },
    { n: 4, title: 'Against Optimization',          author: 'Clara Webb',  type: 'Opinion', mins: 7, read: false },
    { n: 5, title: 'Found Objects, New Forms',      author: 'R. Oduya',   type: 'Feature', mins: 9, read: false },
  ];

  stories.forEach((s, i) => {
    const sy = 358 + i * 84;
    els.push(rect(20, sy, 350, 74, SURFACE, { radius: 4 }));
    // Number
    els.push(text(`${s.n < 10 ? '0' : ''}${s.n}`, 34, sy + 38, { size: 18, weight: 'bold', color: s.read ? DIM : TEXT, font: 'Playfair Display' }));
    // Divider
    els.push(line(62, sy + 16, 62, sy + 58, DIM));
    // Story info
    els.push(rect(70, sy + 10, 48, 16, s.type === 'Essay' ? 'rgba(44,84,69,0.12)' : 'rgba(194,66,10,0.10)', { radius: 2 }));
    els.push(text(s.type.toUpperCase(), 94, sy + 21, { size: 9, weight: 'bold', color: s.type === 'Essay' ? ACCENT2 : ACCENT, align: 'center' }));
    els.push(text(s.title, 70, sy + 40, { size: 13, weight: 'semibold', color: s.read ? MUTED : TEXT }));
    els.push(text(`${s.author} · ${s.mins} min`, 70, sy + 58, { size: 11, color: MUTED }));
    // Read check or arrow
    els.push(text(s.read ? '✓' : '→', 354, sy + 37, { size: 14, color: s.read ? ACCENT2 : BORDER, align: 'right' }));
    if (i < stories.length - 1) els.push(line(20, sy + 74, 370, sy + 74, DIM));
  });

  // Bottom nav
  els.push(rect(0, 792, W, 52, SURFACE));
  els.push(line(0, 792, W, 792, BORDER));
  ['◎ Library', '☰ Topics', '♡ Saved', '⊙ Profile'].forEach((item, i) => {
    const nx = 49 + i * 98;
    els.push(text(item, nx, 820, { size: 11, color: MUTED, align: 'center' }));
  });
  els.push(rect(155, 833, 80, 4, 'rgba(26,23,20,0.2)', { radius: 2 }));

  return { id: 'screen-2', name: 'Issue View', width: W, height: H, backgroundColor: BG, elements: els };
}

// ─── SCREEN 3: ARTICLE READING ──────────────────────────────────────────────
function screenArticleRead() {
  const els = [];
  const W = 390, H = 844;

  els.push(rect(0, 0, W, H, BG));

  // Status bar
  els.push(text('9:41', 20, 16, { size: 13, weight: 'semibold', color: TEXT }));

  // Top reading bar
  els.push(rect(0, 36, W, 44, SURFACE));
  els.push(line(0, 36, W, 36, BORDER));
  els.push(text('←', 20, 61, { size: 18, color: TEXT }));
  els.push(text('Vol. 12', 195, 61, { size: 12, color: MUTED, align: 'center' }));
  els.push(text('Aa', 354, 61, { size: 14, color: MUTED, align: 'right' }));
  // Reading progress bar
  els.push(rect(0, 80, W, 2, DIM));
  els.push(rect(0, 80, 160, 2, ACCENT));

  // Article category + story type
  els.push(rect(20, 96, 50, 18, 'rgba(194,66,10,0.10)', { radius: 2 }));
  els.push(text('ESSAY', 45, 108, { size: 9, weight: 'bold', color: ACCENT, align: 'center' }));
  els.push(text('8 min read', 80, 108, { size: 11, color: MUTED }));

  // Article headline — big editorial serif
  els.push(text('The Return of', 20, 144, { size: 28, weight: 'bold', color: TEXT, font: 'Playfair Display' }));
  els.push(text('the Handmade', 20, 176, { size: 28, weight: 'bold', color: TEXT, font: 'Playfair Display' }));

  // Byline
  els.push(line(20, 192, 80, 192, ACCENT));
  els.push(text('Mia Torrez', 20, 210, { size: 12, weight: 'semibold', color: TEXT }));
  els.push(text('· Apr 3, 2026 · Vol. 12', 95, 210, { size: 12, color: MUTED }));

  // Pull quote — large editorial
  els.push(rect(0, 232, 4, 120, ACCENT));
  els.push(text('"There is something the algorithm', 28, 258, { size: 16, weight: 'bold', color: TEXT, font: 'Playfair Display' }));
  els.push(text('cannot fake: the evidence of', 28, 280, { size: 16, weight: 'bold', color: TEXT, font: 'Playfair Display' }));
  els.push(text('a human hand struggling', 28, 302, { size: 16, weight: 'bold', color: TEXT, font: 'Playfair Display' }));
  els.push(text('and deciding."', 28, 324, { size: 16, weight: 'bold', color: ACCENT, font: 'Playfair Display' }));

  // Body text paragraphs
  els.push(text('The first paragraph opened with a claim:', 20, 366, { size: 13, color: TEXT }));
  els.push(text('craft is not nostalgia. It is a practice of', 20, 384, { size: 13, color: TEXT }));
  els.push(text('deliberate slowness in a culture addicted', 20, 402, { size: 13, color: TEXT }));
  els.push(text('to instant outputs.', 20, 420, { size: 13, color: TEXT }));

  // Image break
  els.push(rect(0, 444, W, 160, '#D6CFC4'));
  els.push(rect(20, 564, 270, 14, BG, { radius: 2 }));
  els.push(text('Studio Hytta workshop, Bergen, 2025', 20, 576, { size: 10, color: MUTED }));

  // More body
  els.push(text("What made this studio's pivot remarkable", 20, 600, { size: 13, color: TEXT }));
  els.push(text('was not the rejection of digital tools entirely,', 20, 618, { size: 13, color: TEXT }));
  els.push(text('but the deliberate introduction of friction', 20, 636, { size: 13, color: TEXT }));
  els.push(text('at every stage of the creative process.', 20, 654, { size: 13, color: TEXT }));

  // Article tag labels
  els.push(text('craft  ·  studios  ·  process  ·  analog', 20, 682, { size: 11, color: MUTED }));

  // Next article CTA
  els.push(rect(20, 706, 350, 56, SURFACE2, { radius: 6 }));
  els.push(line(20, 706, 20, 762, ACCENT2, 3));
  els.push(text('NEXT IN THIS ISSUE', 36, 722, { size: 9, weight: 'bold', color: ACCENT2 }));
  els.push(text('Studio Hytta\'s Manifesto', 36, 744, { size: 14, weight: 'semibold', color: TEXT }));
  els.push(text('→', 354, 735, { size: 18, color: ACCENT, align: 'right' }));

  // Bottom nav
  els.push(rect(0, 792, W, 52, SURFACE));
  els.push(line(0, 792, W, 792, BORDER));
  ['◎ Library', '☰ Topics', '♡ Saved', '⊙ Profile'].forEach((item, i) => {
    const nx = 49 + i * 98;
    els.push(text(item, nx, 820, { size: 11, color: MUTED, align: 'center' }));
  });
  els.push(rect(155, 833, 80, 4, 'rgba(26,23,20,0.2)', { radius: 2 }));

  return { id: 'screen-3', name: 'Article Read', width: W, height: H, backgroundColor: BG, elements: els };
}

// ─── SCREEN 4: TOPICS / DISCOVER ────────────────────────────────────────────
function screenTopics() {
  const els = [];
  const W = 390, H = 844;

  els.push(rect(0, 0, W, H, BG));

  // Status bar
  els.push(text('9:41', 20, 16, { size: 13, weight: 'semibold', color: TEXT }));

  // Header
  els.push(line(20, 38, 370, 38, BORDER));
  els.push(text('Topics', 20, 66, { size: 22, weight: 'bold', color: TEXT, font: 'Playfair Display' }));
  els.push(text('Find your interests', 20, 90, { size: 13, color: MUTED }));
  els.push(line(20, 104, 370, 104, DIM));

  // Search bar
  els.push(rect(20, 116, 350, 40, SURFACE, { radius: 6 }));
  els.push(line(20, 116, 370, 116, BORDER));
  els.push(line(20, 156, 370, 156, BORDER));
  els.push(line(20, 116, 20, 156, BORDER));
  els.push(line(370, 116, 370, 156, BORDER));
  els.push(text('◎ Search topics and writers...', 34, 140, { size: 13, color: MUTED }));

  // Featured topic pills
  els.push(text('YOUR INTERESTS', 20, 174, { size: 10, weight: 'bold', color: MUTED }));
  const activeTopics = ['Design', 'Architecture', 'Photography'];
  activeTopics.forEach((t, i) => {
    const tw = t.length * 8 + 24;
    const tx = 20 + activeTopics.slice(0,i).reduce((a,b) => a + b.length*8+32, 0);
    els.push(rect(tx, 188, tw, 28, ACCENT, { radius: 14 }));
    els.push(text(t, tx + tw/2, 205, { size: 12, weight: 'semibold', color: '#FFFFFF', align: 'center' }));
  });

  // Topic categories in grid
  els.push(text('ALL TOPICS', 20, 236, { size: 10, weight: 'bold', color: MUTED }));

  const topics = [
    { name: 'Design',        count: 47, color: ACCENT,        icon: '◈' },
    { name: 'Technology',    count: 38, color: '#4A6B8A',     icon: '◉' },
    { name: 'Architecture',  count: 31, color: ACCENT2,       icon: '⬡' },
    { name: 'Photography',   count: 28, color: '#8A4A35',     icon: '◎' },
    { name: 'Writing',       count: 24, color: '#5C4A7A',     icon: '✦' },
    { name: 'Music',         count: 19, color: '#7A4A2A',     icon: '◷' },
    { name: 'Fashion',       count: 22, color: '#A04A6A',     icon: '⊙' },
    { name: 'Film',          count: 16, color: '#2A5A6A',     icon: '▶' },
    { name: 'Food & Drink',  count: 21, color: '#6A4A2A',     icon: '◬' },
    { name: 'Urbanism',      count: 14, color: '#4A7A5A',     icon: '⊕' },
  ];

  // 2-column grid
  topics.forEach((t, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const tx = 20 + col * 180;
    const ty = 252 + row * 78;
    els.push(rect(tx, ty, 168, 66, SURFACE, { radius: 6 }));
    els.push(rect(tx, ty, 4, 66, t.color, { radius: 2 }));
    els.push(text(t.icon, tx + 20, ty + 28, { size: 18, color: t.color }));
    els.push(text(t.name, tx + 48, ty + 26, { size: 13, weight: 'semibold', color: TEXT }));
    els.push(text(`${t.count} issues`, tx + 48, ty + 44, { size: 11, color: MUTED }));
    // Active indicator
    if (activeTopics.includes(t.name)) {
      els.push(circle(tx + 150, ty + 16, 6, ACCENT));
      els.push(text('✓', tx + 150, ty + 20, { size: 9, color: '#FFFFFF', align: 'center' }));
    }
  });

  // Editors picks
  els.push(text('EDITOR\'S PICKS', 20, 666, { size: 10, weight: 'bold', color: MUTED }));
  const picks = [
    { name: 'Hito Steyerl on Attention', tag: 'Essay' },
    { name: 'The New Vernacular Kitchen', tag: 'Feature' },
  ];
  picks.forEach((p, i) => {
    const py = 682 + i * 50;
    els.push(rect(20, py, 350, 42, SURFACE, { radius: 4 }));
    els.push(text(p.name, 34, py + 24, { size: 13, color: TEXT }));
    els.push(rect(280, py + 12, 50, 16, 'rgba(194,66,10,0.10)', { radius: 2 }));
    els.push(text(p.tag, 305, py + 23, { size: 9, weight: 'bold', color: ACCENT, align: 'center' }));
    els.push(text('→', 354, py + 23, { size: 13, color: ACCENT, align: 'right' }));
  });

  // Bottom nav
  els.push(rect(0, 792, W, 52, SURFACE));
  els.push(line(0, 792, W, 792, BORDER));
  ['◎ Library', '☰ Topics', '♡ Saved', '⊙ Profile'].forEach((item, i) => {
    const nx = 49 + i * 98;
    const isActive = i === 1;
    els.push(text(item, nx, 820, { size: 11, weight: isActive ? 'semibold' : 'regular', color: isActive ? ACCENT : MUTED, align: 'center' }));
    if (isActive) els.push(rect(nx - 24, 792, 48, 2, ACCENT));
  });
  els.push(rect(155, 833, 80, 4, 'rgba(26,23,20,0.2)', { radius: 2 }));

  return { id: 'screen-4', name: 'Topics', width: W, height: H, backgroundColor: BG, elements: els };
}

// ─── SCREEN 5: SAVED / READING ARCHIVE ──────────────────────────────────────
function screenSaved() {
  const els = [];
  const W = 390, H = 844;

  els.push(rect(0, 0, W, H, BG));

  // Status bar
  els.push(text('9:41', 20, 16, { size: 13, weight: 'semibold', color: TEXT }));

  // Header
  els.push(line(20, 38, 370, 38, BORDER));
  els.push(text('Saved', 20, 66, { size: 22, weight: 'bold', color: TEXT, font: 'Playfair Display' }));
  els.push(text('16 essays · 3 issues', 20, 90, { size: 13, color: MUTED }));
  els.push(line(20, 104, 370, 104, DIM));

  // Filter tabs
  const tabs = ['All', 'Essays', 'Profiles', 'Visual'];
  tabs.forEach((tab, i) => {
    const isActive = i === 0;
    const tw = tab.length * 8 + 20;
    const tx = 20 + tabs.slice(0,i).reduce((a,b)=>a+b.length*8+28,0);
    if (isActive) {
      els.push(rect(tx, 112, tw, 28, ACCENT, { radius: 14 }));
      els.push(text(tab, tx + tw/2, 129, { size: 12, weight: 'semibold', color: '#FFFFFF', align: 'center' }));
    } else {
      els.push(text(tab, tx + tw/2, 129, { size: 12, color: MUTED, align: 'center' }));
    }
  });

  // Saved story list — editorial list style
  els.push(text('READING ARCHIVE', 20, 160, { size: 10, weight: 'bold', color: MUTED }));
  els.push(line(20, 170, 370, 170, DIM));

  const saved = [
    { title: 'Against Optimization', author: 'Clara Webb',      tag: 'Opinion', issue: 'Vol. 12', mins: 7, bookmark: true },
    { title: 'Found Objects, New Forms', author: 'R. Oduya',    tag: 'Feature', issue: 'Vol. 12', mins: 9, bookmark: true },
    { title: 'The Slow Web Manifesto', author: 'T. Nakamura',   tag: 'Essay',   issue: 'Vol. 45', mins: 6, bookmark: false },
    { title: 'Night Markets of Seoul', author: 'Ji-yeon Bae',   tag: 'Visual',  issue: 'Vol. 43', mins: 3, bookmark: false },
    { title: 'Brutalism in Retreat', author: 'A. Moreau',       tag: 'Profile', issue: 'Vol. 41', mins: 5, bookmark: false },
    { title: 'Riso Printing Revival', author: 'E. Santos',      tag: 'Feature', issue: 'Vol. 38', mins: 11, bookmark: false },
  ];

  saved.forEach((s, i) => {
    const sy = 178 + i * 88;
    // Thumb area
    els.push(rect(20, sy + 4, 60, 74, '#E8E2D8', { radius: 4 }));
    // Tag in thumb
    els.push(rect(24, sy + 8, 52, 14, ACCENT, { opacity: 0.85, radius: 1 }));
    els.push(text(s.tag.toUpperCase(), 50, sy + 18, { size: 8, weight: 'bold', color: '#FFF', align: 'center' }));

    // Text content
    els.push(text(s.title, 90, sy + 20, { size: 14, weight: 'semibold', color: TEXT }));
    els.push(text(`${s.author}`, 90, sy + 42, { size: 11, color: MUTED }));
    els.push(text(`${s.issue} · ${s.mins} min`, 90, sy + 60, { size: 11, color: MUTED }));

    // Bookmark
    els.push(text(s.bookmark ? '♥' : '♡', 354, sy + 32, { size: 16, color: s.bookmark ? ACCENT : BORDER, align: 'right' }));

    // Divider
    if (i < saved.length - 1) els.push(line(20, sy + 84, 370, sy + 84, DIM));
  });

  // Bottom nav
  els.push(rect(0, 792, W, 52, SURFACE));
  els.push(line(0, 792, W, 792, BORDER));
  ['◎ Library', '☰ Topics', '♡ Saved', '⊙ Profile'].forEach((item, i) => {
    const nx = 49 + i * 98;
    const isActive = i === 2;
    els.push(text(item, nx, 820, { size: 11, weight: isActive ? 'semibold' : 'regular', color: isActive ? ACCENT : MUTED, align: 'center' }));
    if (isActive) els.push(rect(nx - 24, 792, 48, 2, ACCENT));
  });
  els.push(rect(155, 833, 80, 4, 'rgba(26,23,20,0.2)', { radius: 2 }));

  return { id: 'screen-5', name: 'Saved', width: W, height: H, backgroundColor: BG, elements: els };
}

// ─── ASSEMBLE & WRITE ────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  metadata: {
    name: 'ISSUE — Independent curated reading, styled like an art magazine',
    description: 'Light editorial magazine reader app. Warm paper palette, Playfair Display serif + Inter sans mix, deep terracotta accent. Inspired by PW Magazine and QP Magazine on siteinspire + The Lookback SOTD digital capsule concept.',
    author: 'RAM Design AI',
    created: new Date().toISOString(),
    theme: 'light',
    tags: ['light', 'editorial', 'magazine', 'reading', 'typography', 'serif', 'publication'],
  },
  screens: [
    screenLibrary(),
    screenIssueView(),
    screenArticleRead(),
    screenTopics(),
    screenSaved(),
  ],
};

fs.writeFileSync(path.join(__dirname, 'issue.pen'), JSON.stringify(pen, null, 2));
console.log('✓ issue.pen written —', pen.screens.length, 'screens');
