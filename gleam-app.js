'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'gleam';
const NAME = 'GLEAM';
const TAGLINE = 'Creator analytics for independent voices';

// ── Light / warm editorial palette (soft brutalism) ──
const C = {
  bg:      '#FAF7F2',   // warm cream
  surf:    '#FFFFFF',   // white surface
  card:    '#F5F0E8',   // card cream
  border:  '#E8E0D0',   // warm border
  text:    '#1A1818',   // near-black charcoal
  muted:   '#8A7F74',   // warm gray muted
  accent:  '#D97706',   // amber
  accent2: '#9A3412',   // rust
  green:   '#15803D',   // success green
  gridLn:  '#E2D9C8',   // grid line
};

const W = 390, H = 844;

let elements = [];

function rect(x, y, w, h, fill, opts = {}) {
  const el = { type: 'rect', x, y, width: w, height: h, fill };
  if (opts.rx !== undefined) el.rx = opts.rx;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  if (opts.stroke) { el.stroke = opts.stroke; el.strokeWidth = opts.sw || 1; }
  elements.push(el);
}

function text(x, y, content, size, fill, opts = {}) {
  const el = { type: 'text', x, y, content: String(content), fontSize: size, fill };
  if (opts.fw) el.fontWeight = opts.fw;
  if (opts.font) el.fontFamily = opts.font;
  if (opts.anchor) el.textAnchor = opts.anchor;
  if (opts.ls) el.letterSpacing = opts.ls;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  elements.push(el);
}

function circle(cx, cy, r, fill, opts = {}) {
  const el = { type: 'circle', cx, cy, r, fill };
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  if (opts.stroke) { el.stroke = opts.stroke; el.strokeWidth = opts.sw || 1; }
  elements.push(el);
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  const el = { type: 'line', x1, y1, x2, y2, stroke };
  el.strokeWidth = opts.sw || 1;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  elements.push(el);
}

function tag(x, y, label, color) {
  const w = label.length * 6.5 + 16;
  rect(x, y, w, 22, color, { rx: 11, opacity: 0.15 });
  text(x + w / 2, y + 14, label, 9, color, { fw: 700, anchor: 'middle', ls: 0.5 });
}

function statCard(x, y, w, h, label, value, sub, trend, trendColor) {
  rect(x, y, w, h, C.surf, { rx: 4, stroke: C.border, sw: 1 });
  // Subtle grid line at top
  rect(x, y, w, 3, C.accent, { opacity: 0.6 });
  text(x + 14, y + 22, label, 10, C.muted, { fw: 500, ls: 0.8 });
  text(x + 14, y + 50, value, 28, C.text, { fw: 700, font: 'Georgia, serif' });
  if (sub) text(x + 14, y + 68, sub, 10, C.muted);
  if (trend) text(x + w - 14, y + 50, trend, 11, trendColor, { fw: 600, anchor: 'end' });
}

function miniBar(x, y, w, h, pct, color) {
  rect(x, y, w, h, C.gridLn, { rx: 2 });
  rect(x, y, Math.round(w * pct), h, color, { rx: 2 });
}

// ── SVG export ──
function buildSVG(els) {
  const shapes = els.map(el => {
    if (el.type === 'rect') {
      let s = `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}"`;
      if (el.rx) s += ` rx="${el.rx}"`;
      if (el.opacity !== undefined) s += ` opacity="${el.opacity}"`;
      if (el.stroke) s += ` stroke="${el.stroke}" stroke-width="${el.strokeWidth}"`;
      return s + '/>';
    }
    if (el.type === 'text') {
      let s = `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}"`;
      if (el.fontWeight) s += ` font-weight="${el.fontWeight}"`;
      if (el.fontFamily) s += ` font-family="${el.fontFamily}"`;
      if (el.textAnchor) s += ` text-anchor="${el.textAnchor}"`;
      if (el.letterSpacing) s += ` letter-spacing="${el.letterSpacing}"`;
      if (el.opacity !== undefined) s += ` opacity="${el.opacity}"`;
      return s + `>${el.content}</text>`;
    }
    if (el.type === 'circle') {
      let s = `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}"`;
      if (el.opacity !== undefined) s += ` opacity="${el.opacity}"`;
      if (el.stroke) s += ` stroke="${el.stroke}" stroke-width="${el.strokeWidth}"`;
      return s + '/>';
    }
    if (el.type === 'line') {
      let s = `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}"`;
      if (el.opacity !== undefined) s += ` opacity="${el.opacity}"`;
      return s + '/>';
    }
    return '';
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${shapes.join('')}</svg>`;
}

const screens = [];

// ══════════════════════════════════════════════
// SCREEN 1 — Dashboard Overview
// ══════════════════════════════════════════════
(function buildDashboard() {
  elements = [];

  // BG
  rect(0, 0, W, H, C.bg);

  // Editorial grid lines (soft brutalism)
  for (let i = 0; i < 6; i++) line(i * 78, 0, i * 78, H, C.gridLn, { sw: 0.5, opacity: 0.4 });

  // Header bar
  rect(0, 0, W, 58, C.surf, { stroke: C.border, sw: 1 });
  text(20, 37, 'GLEAM', 18, C.text, { fw: 900, ls: 3 });
  text(W - 20, 37, '● Live', 11, C.green, { anchor: 'end', fw: 600 });

  // Sub nav
  rect(0, 58, W, 36, C.card);
  const nav = ['Overview', 'Audience', 'Content', 'Revenue'];
  nav.forEach((n, i) => {
    const x = 20 + i * 88;
    if (i === 0) {
      rect(x - 8, 64, n.length * 7 + 16, 24, C.accent, { rx: 3, opacity: 0.12 });
      text(x, 80, n, 11, C.accent, { fw: 700 });
      line(x - 8, 93, x - 8 + n.length * 7 + 16, 93, C.accent, { sw: 2 });
    } else {
      text(x, 80, n, 11, C.muted, { fw: 500 });
    }
  });

  // Section headline (editorial style)
  text(20, 128, 'THIS WEEK', 9, C.muted, { fw: 700, ls: 2 });
  line(20, 134, W - 20, 134, C.border, { sw: 1 });

  // Top 4 stat cards (2×2 grid)
  statCard(16, 142, 172, 88, 'SUBSCRIBERS', '12,847', '+124 this week', '↑ 9.7%', C.green);
  statCard(202, 142, 172, 88, 'OPEN RATE', '41.2%', 'Industry avg 21%', '↑ 2.1pp', C.green);
  statCard(16, 238, 172, 88, 'NEW POSTS', '6', 'published this week', null, null);
  statCard(202, 238, 172, 88, 'REVENUE', '$1,840', 'MRR this month', '↑ 12%', C.green);

  // Chart area — sparkline style
  rect(16, 340, 358, 130, C.surf, { rx: 4, stroke: C.border, sw: 1 });
  rect(16, 340, 358, 3, C.accent, { opacity: 0.5 });
  text(30, 362, 'SUBSCRIBER GROWTH', 9, C.muted, { fw: 700, ls: 1.5 });
  text(W - 30, 362, '30 days', 9, C.muted, { fw: 500, anchor: 'end' });

  // Chart bars (growth curve)
  const barData = [45, 52, 48, 60, 67, 71, 68, 80, 78, 90, 88, 96, 92, 100];
  barData.forEach((v, i) => {
    const bh = Math.round(v * 0.68);
    const bx = 30 + i * 24;
    const by = 450 - bh;
    rect(bx, by, 16, bh, C.accent, { rx: 2, opacity: i === barData.length - 1 ? 1 : 0.4 });
  });
  text(30, 462, 'Mar 12', 9, C.muted, { opacity: 0.7 });
  text(W - 30, 462, 'Apr 11', 9, C.muted, { anchor: 'end', opacity: 0.7 });

  // Top posts section
  text(20, 496, 'TOP POSTS THIS WEEK', 9, C.muted, { fw: 700, ls: 1.5 });
  line(20, 502, W - 20, 502, C.border, { sw: 1 });

  const posts = [
    { title: 'The Art of Slow Growth', opens: '4,821', rate: '52%' },
    { title: 'What Readers Actually Want', opens: '3,940', rate: '47%' },
    { title: 'Building in Public: Month 6', opens: '2,872', rate: '38%' },
  ];
  posts.forEach((p, i) => {
    const py = 520 + i * 62;
    rect(16, py, 358, 54, C.surf, { rx: 4, stroke: C.border, sw: 1 });
    text(30, py + 20, p.title, 12, C.text, { fw: 600 });
    text(30, py + 38, `${p.opens} opens`, 10, C.muted);
    // mini bar
    miniBar(200, py + 32, 100, 6, parseFloat(p.rate) / 100, C.accent);
    text(W - 30, py + 38, p.rate, 10, C.accent, { fw: 700, anchor: 'end' });
  });

  // Bottom nav
  rect(0, H - 70, W, 70, C.surf, { stroke: C.border, sw: 1 });
  const navItems = [
    { label: 'Home', icon: '⌂', active: true },
    { label: 'Audience', icon: '◎', active: false },
    { label: 'Content', icon: '✦', active: false },
    { label: 'Revenue', icon: '$', active: false },
    { label: 'Profile', icon: '○', active: false },
  ];
  navItems.forEach((n, i) => {
    const nx = 39 + i * 78;
    text(nx, H - 42, n.icon, 18, n.active ? C.accent : C.muted, { anchor: 'middle' });
    text(nx, H - 22, n.label, 9, n.active ? C.accent : C.muted, { anchor: 'middle', fw: n.active ? 700 : 400 });
    if (n.active) line(nx - 18, H - 70, nx + 18, H - 70, C.accent, { sw: 2 });
  });

  screens.push({
    name: 'Dashboard',
    svg: buildSVG(elements),
    elements: [...elements],
  });
})();

// ══════════════════════════════════════════════
// SCREEN 2 — Audience
// ══════════════════════════════════════════════
(function buildAudience() {
  elements = [];

  rect(0, 0, W, H, C.bg);
  for (let i = 0; i < 6; i++) line(i * 78, 0, i * 78, H, C.gridLn, { sw: 0.5, opacity: 0.4 });

  // Header
  rect(0, 0, W, 58, C.surf, { stroke: C.border, sw: 1 });
  text(20, 37, 'GLEAM', 18, C.text, { fw: 900, ls: 3 });
  text(W - 20, 37, '● Live', 11, C.green, { anchor: 'end', fw: 600 });

  // Sub nav
  rect(0, 58, W, 36, C.card);
  const nav = ['Overview', 'Audience', 'Content', 'Revenue'];
  nav.forEach((n, i) => {
    const x = 20 + i * 88;
    if (i === 1) {
      rect(x - 8, 64, n.length * 7 + 16, 24, C.accent, { rx: 3, opacity: 0.12 });
      text(x, 80, n, 11, C.accent, { fw: 700 });
      line(x - 8, 93, x - 8 + n.length * 7 + 16, 93, C.accent, { sw: 2 });
    } else {
      text(x, 80, n, 11, C.muted, { fw: 500 });
    }
  });

  // Page title
  text(20, 128, 'YOUR READERS', 9, C.muted, { fw: 700, ls: 2 });
  line(20, 134, W - 20, 134, C.border, { sw: 1 });

  // Subscriber breakdown
  text(20, 160, '12,847', 42, C.text, { fw: 900, font: 'Georgia, serif' });
  text(20, 182, 'total subscribers', 12, C.muted );
  tag(20, 192, '+124 this week', C.green);

  // Free vs Paid
  rect(16, 224, 358, 70, C.surf, { rx: 4, stroke: C.border, sw: 1 });
  rect(16, 224, 358, 3, C.accent2, { opacity: 0.7 });
  text(30, 248, 'FREE', 9, C.muted, { fw: 700, ls: 1.5 });
  text(30, 270, '10,209', 20, C.text, { fw: 700 });
  miniBar(30, 278, 200, 6, 0.795, C.muted);
  text(W - 30, 248, 'PAID', 9, C.accent, { fw: 700, ls: 1.5, anchor: 'end' });
  text(W - 30, 270, '2,638', 20, C.accent, { fw: 700, anchor: 'end' });
  text(W - 30, 285, '20.5%', 10, C.accent, { fw: 600, anchor: 'end' });

  // Top locations
  text(20, 320, 'TOP LOCATIONS', 9, C.muted, { fw: 700, ls: 1.5 });
  line(20, 326, W - 20, 326, C.border, { sw: 1 });

  const locs = [
    { country: 'United States', pct: 0.42, val: '42%' },
    { country: 'United Kingdom', pct: 0.18, val: '18%' },
    { country: 'Canada', pct: 0.12, val: '12%' },
    { country: 'Australia', pct: 0.08, val: '8%' },
    { country: 'Germany', pct: 0.06, val: '6%' },
  ];
  locs.forEach((l, i) => {
    const ly = 344 + i * 42;
    text(20, ly + 12, l.country, 12, C.text, { fw: 500 });
    miniBar(20, ly + 20, 260, 8, l.pct, C.accent);
    text(W - 20, ly + 28, l.val, 11, C.accent, { fw: 700, anchor: 'end' });
  });

  // Referral sources
  text(20, 566, 'HOW THEY FOUND YOU', 9, C.muted, { fw: 700, ls: 1.5 });
  line(20, 572, W - 20, 572, C.border, { sw: 1 });

  const refs = [
    { src: 'Direct link', pct: 0.38, color: C.accent },
    { src: 'Twitter / X', pct: 0.28, color: C.accent2 },
    { src: 'Word of mouth', pct: 0.19, color: C.green },
    { src: 'Search', pct: 0.15, color: C.muted },
  ];
  refs.forEach((r, i) => {
    const ry = 588 + i * 44;
    circle(30, ry + 10, 6, r.color);
    text(46, ry + 14, r.src, 12, C.text);
    text(W - 20, ry + 14, Math.round(r.pct * 100) + '%', 12, r.color, { fw: 700, anchor: 'end' });
    miniBar(20, ry + 26, 350, 6, r.pct, r.color);
  });

  // Bottom nav
  rect(0, H - 70, W, 70, C.surf, { stroke: C.border, sw: 1 });
  const navItems = [
    { label: 'Home', icon: '⌂', active: false },
    { label: 'Audience', icon: '◎', active: true },
    { label: 'Content', icon: '✦', active: false },
    { label: 'Revenue', icon: '$', active: false },
    { label: 'Profile', icon: '○', active: false },
  ];
  navItems.forEach((n, i) => {
    const nx = 39 + i * 78;
    text(nx, H - 42, n.icon, 18, n.active ? C.accent : C.muted, { anchor: 'middle' });
    text(nx, H - 22, n.label, 9, n.active ? C.accent : C.muted, { anchor: 'middle', fw: n.active ? 700 : 400 });
    if (n.active) line(nx - 18, H - 70, nx + 18, H - 70, C.accent, { sw: 2 });
  });

  screens.push({ name: 'Audience', svg: buildSVG(elements), elements: [...elements] });
})();

// ══════════════════════════════════════════════
// SCREEN 3 — Content Performance
// ══════════════════════════════════════════════
(function buildContent() {
  elements = [];

  rect(0, 0, W, H, C.bg);
  for (let i = 0; i < 6; i++) line(i * 78, 0, i * 78, H, C.gridLn, { sw: 0.5, opacity: 0.4 });

  // Header
  rect(0, 0, W, 58, C.surf, { stroke: C.border, sw: 1 });
  text(20, 37, 'GLEAM', 18, C.text, { fw: 900, ls: 3 });
  text(W - 20, 37, '● Live', 11, C.green, { anchor: 'end', fw: 600 });

  // Sub nav
  rect(0, 58, W, 36, C.card);
  const nav = ['Overview', 'Audience', 'Content', 'Revenue'];
  nav.forEach((n, i) => {
    const x = 20 + i * 88;
    if (i === 2) {
      rect(x - 8, 64, n.length * 7 + 16, 24, C.accent, { rx: 3, opacity: 0.12 });
      text(x, 80, n, 11, C.accent, { fw: 700 });
      line(x - 8, 93, x - 8 + n.length * 7 + 16, 93, C.accent, { sw: 2 });
    } else {
      text(x, 80, n, 11, C.muted, { fw: 500 });
    }
  });

  text(20, 128, 'CONTENT PERFORMANCE', 9, C.muted, { fw: 700, ls: 1.5 });
  line(20, 134, W - 20, 134, C.border, { sw: 1 });

  // Summary stats (inline)
  const contentStats = [
    { label: 'Published', val: '47' },
    { label: 'Avg Opens', val: '4.1K' },
    { label: 'Avg Rate', val: '38%' },
  ];
  contentStats.forEach((s, i) => {
    const sx = 20 + i * 122;
    rect(sx, 144, 112, 60, C.surf, { rx: 4, stroke: C.border, sw: 1 });
    text(sx + 12, 164, s.label, 9, C.muted, { fw: 600, ls: 1 });
    text(sx + 12, 188, s.val, 24, C.text, { fw: 800, font: 'Georgia, serif' });
  });

  // Content type breakdown
  text(20, 228, 'BY FORMAT', 9, C.muted, { fw: 700, ls: 1.5 });
  line(20, 234, W - 20, 234, C.border, { sw: 1 });

  const types = [
    { name: 'Long-form essay', count: 22, pct: 0.64, color: C.accent },
    { name: 'Interview', count: 12, pct: 0.52, color: C.accent2 },
    { name: 'Link roundup', count: 8, pct: 0.31, color: C.green },
    { name: 'Short take', count: 5, pct: 0.44, color: C.muted },
  ];
  types.forEach((t, i) => {
    const ty = 252 + i * 50;
    rect(16, ty, 358, 42, C.surf, { rx: 3, stroke: C.border, sw: 1 });
    circle(30, ty + 21, 5, t.color);
    text(44, ty + 25, t.name, 12, C.text, { fw: 500 });
    text(44, ty + 37, `${t.count} posts`, 9, C.muted);
    miniBar(200, ty + 15, 120, 6, t.pct, t.color);
    text(W - 22, ty + 21, Math.round(t.pct * 100) + '%', 10, t.color, { fw: 700, anchor: 'end' });
  });

  // Best performing post card
  text(20, 462, 'ALL-TIME BEST', 9, C.muted, { fw: 700, ls: 1.5 });
  line(20, 468, W - 20, 468, C.border, { sw: 1 });

  rect(16, 476, 358, 110, C.surf, { rx: 4, stroke: C.accent, sw: 2 });
  rect(16, 476, 358, 4, C.accent);
  tag(30, 488, 'MOST OPENED', C.accent);
  text(30, 524, 'Why Consistency Beats Virality', 15, C.text, { fw: 700 });
  text(30, 542, 'Published Feb 18, 2026', 10, C.muted);
  line(30, 554, W - 30, 554, C.border, { sw: 1 });
  text(30, 573, '8,249 opens', 11, C.text, { fw: 600 });
  text(195, 573, '61% open rate', 11, C.accent, { fw: 700 });

  // Recent posts list
  text(20, 608, 'RECENT', 9, C.muted, { fw: 700, ls: 1.5 });
  line(20, 614, W - 20, 614, C.border, { sw: 1 });

  const recent = [
    { title: 'The Art of Slow Growth', date: 'Apr 8', opens: '4,821' },
    { title: 'What Readers Actually Want', date: 'Apr 3', opens: '3,940' },
  ];
  recent.forEach((r, i) => {
    const ry = 624 + i * 52;
    rect(16, ry, 358, 44, C.surf, { rx: 3, stroke: C.border, sw: 1 });
    text(30, ry + 18, r.title, 12, C.text, { fw: 600 });
    text(30, ry + 34, r.date, 10, C.muted );
    text(W - 30, ry + 26, r.opens, 12, C.accent, { fw: 700, anchor: 'end' });
  });

  // Bottom nav
  rect(0, H - 70, W, 70, C.surf, { stroke: C.border, sw: 1 });
  const navItems = [
    { label: 'Home', icon: '⌂', active: false },
    { label: 'Audience', icon: '◎', active: false },
    { label: 'Content', icon: '✦', active: true },
    { label: 'Revenue', icon: '$', active: false },
    { label: 'Profile', icon: '○', active: false },
  ];
  navItems.forEach((n, i) => {
    const nx = 39 + i * 78;
    text(nx, H - 42, n.icon, 18, n.active ? C.accent : C.muted, { anchor: 'middle' });
    text(nx, H - 22, n.label, 9, n.active ? C.accent : C.muted, { anchor: 'middle', fw: n.active ? 700 : 400 });
    if (n.active) line(nx - 18, H - 70, nx + 18, H - 70, C.accent, { sw: 2 });
  });

  screens.push({ name: 'Content', svg: buildSVG(elements), elements: [...elements] });
})();

// ══════════════════════════════════════════════
// SCREEN 4 — Revenue
// ══════════════════════════════════════════════
(function buildRevenue() {
  elements = [];

  rect(0, 0, W, H, C.bg);
  for (let i = 0; i < 6; i++) line(i * 78, 0, i * 78, H, C.gridLn, { sw: 0.5, opacity: 0.4 });

  // Header
  rect(0, 0, W, 58, C.surf, { stroke: C.border, sw: 1 });
  text(20, 37, 'GLEAM', 18, C.text, { fw: 900, ls: 3 });
  text(W - 20, 37, '● Live', 11, C.green, { anchor: 'end', fw: 600 });

  // Sub nav
  rect(0, 58, W, 36, C.card);
  const nav = ['Overview', 'Audience', 'Content', 'Revenue'];
  nav.forEach((n, i) => {
    const x = 20 + i * 88;
    if (i === 3) {
      rect(x - 8, 64, n.length * 7 + 16, 24, C.accent, { rx: 3, opacity: 0.12 });
      text(x, 80, n, 11, C.accent, { fw: 700 });
      line(x - 8, 93, x - 8 + n.length * 7 + 16, 93, C.accent, { sw: 2 });
    } else {
      text(x, 80, n, 11, C.muted, { fw: 500 });
    }
  });

  text(20, 128, 'REVENUE SNAPSHOT', 9, C.muted, { fw: 700, ls: 1.5 });
  line(20, 134, W - 20, 134, C.border, { sw: 1 });

  // Hero MRR
  rect(16, 144, 358, 96, C.surf, { rx: 4, stroke: C.border, sw: 1 });
  rect(16, 144, 6, 96, C.accent);
  text(36, 172, 'MONTHLY RECURRING REVENUE', 9, C.muted, { fw: 700, ls: 1 });
  text(36, 210, '$1,840', 40, C.text, { fw: 900, font: 'Georgia, serif' });
  tag(36, 220, '+$212 from last month', C.green);
  text(W - 30, 210, '↑ 13%', 14, C.green, { fw: 700, anchor: 'end' });

  // Revenue breakdown
  text(20, 266, 'REVENUE SOURCES', 9, C.muted, { fw: 700, ls: 1.5 });
  line(20, 272, W - 20, 272, C.border, { sw: 1 });

  const sources = [
    { name: 'Paid subscriptions', amount: '$1,319', pct: 0.717, color: C.accent },
    { name: 'Founding members', amount: '$320', pct: 0.174, color: C.accent2 },
    { name: 'Sponsorships', amount: '$160', pct: 0.087, color: C.green },
    { name: 'One-time tips', amount: '$41', pct: 0.022, color: C.muted },
  ];
  sources.forEach((s, i) => {
    const sy = 288 + i * 54;
    rect(16, sy, 358, 46, C.surf, { rx: 3, stroke: C.border, sw: 1 });
    circle(30, sy + 23, 6, s.color);
    text(46, sy + 20, s.name, 12, C.text, { fw: 500 });
    miniBar(46, sy + 30, 220, 7, s.pct, s.color);
    text(W - 22, sy + 23, s.amount, 13, s.color, { fw: 700, anchor: 'end' });
  });

  // Monthly trend chart
  text(20, 512, 'MRR TREND — 6 MONTHS', 9, C.muted, { fw: 700, ls: 1.5 });
  line(20, 518, W - 20, 518, C.border, { sw: 1 });

  rect(16, 526, 358, 100, C.surf, { rx: 4, stroke: C.border, sw: 1 });
  const mrr = [920, 1040, 1180, 1390, 1628, 1840];
  const mrrMonths = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const maxMRR = 1840;
  mrr.forEach((v, i) => {
    const bh = Math.round((v / maxMRR) * 64);
    const bx = 36 + i * 56;
    rect(bx, 616 - bh, 36, bh, C.accent, { rx: 2, opacity: i === mrr.length - 1 ? 1 : 0.4 });
    text(bx + 18, 614, mrrMonths[i], 8, C.muted, { anchor: 'middle' });
  });

  // Churn metric
  rect(16, 644, 172, 60, C.surf, { rx: 4, stroke: C.border, sw: 1 });
  text(30, 666, 'CHURN RATE', 9, C.muted, { fw: 600, ls: 1 });
  text(30, 690, '1.8%', 22, C.green, { fw: 800, font: 'Georgia, serif' });

  rect(202, 644, 172, 60, C.surf, { rx: 4, stroke: C.border, sw: 1 });
  text(216, 666, 'LTV', 9, C.muted, { fw: 600, ls: 1 });
  text(216, 690, '$54.20', 22, C.text, { fw: 800, font: 'Georgia, serif' });

  // Bottom nav
  rect(0, H - 70, W, 70, C.surf, { stroke: C.border, sw: 1 });
  const navItems = [
    { label: 'Home', icon: '⌂', active: false },
    { label: 'Audience', icon: '◎', active: false },
    { label: 'Content', icon: '✦', active: false },
    { label: 'Revenue', icon: '$', active: true },
    { label: 'Profile', icon: '○', active: false },
  ];
  navItems.forEach((n, i) => {
    const nx = 39 + i * 78;
    text(nx, H - 42, n.icon, 18, n.active ? C.accent : C.muted, { anchor: 'middle' });
    text(nx, H - 22, n.label, 9, n.active ? C.accent : C.muted, { anchor: 'middle', fw: n.active ? 700 : 400 });
    if (n.active) line(nx - 18, H - 70, nx + 18, H - 70, C.accent, { sw: 2 });
  });

  screens.push({ name: 'Revenue', svg: buildSVG(elements), elements: [...elements] });
})();

// ══════════════════════════════════════════════
// SCREEN 5 — Growth & Referrals
// ══════════════════════════════════════════════
(function buildGrowth() {
  elements = [];

  rect(0, 0, W, H, C.bg);
  for (let i = 0; i < 6; i++) line(i * 78, 0, i * 78, H, C.gridLn, { sw: 0.5, opacity: 0.4 });

  // Header
  rect(0, 0, W, 58, C.surf, { stroke: C.border, sw: 1 });
  text(20, 37, 'GLEAM', 18, C.text, { fw: 900, ls: 3 });
  text(W - 20, 37, '● Live', 11, C.green, { anchor: 'end', fw: 600 });

  // Tab bar (secondary nav style)
  rect(0, 58, W, 36, C.card);
  const tabs = ['30d', '90d', '1yr', 'All'];
  tabs.forEach((t, i) => {
    const tx = 20 + i * 60;
    if (i === 0) {
      rect(tx - 4, 63, 32, 24, C.accent, { rx: 3 });
      text(tx + 12, 79, t, 11, C.surf, { fw: 700, anchor: 'middle' });
    } else {
      text(tx + 12, 79, t, 11, C.muted, { anchor: 'middle' });
    }
  });
  text(W - 20, 79, 'GROWTH', 9, C.muted, { anchor: 'end', fw: 700, ls: 2 });

  text(20, 128, 'GROWTH METRICS', 9, C.muted, { fw: 700, ls: 1.5 });
  line(20, 134, W - 20, 134, C.border, { sw: 1 });

  // Key growth numbers
  const growthStats = [
    { label: 'NET NEW', val: '+124', sub: 'this week', color: C.green },
    { label: 'VIRAL COEFF', val: '1.08', sub: 'k-factor', color: C.accent },
    { label: 'CHURN', val: '−18', sub: 'this week', color: C.accent2 },
  ];
  growthStats.forEach((s, i) => {
    const sx = 16 + i * 124;
    rect(sx, 144, 114, 72, C.surf, { rx: 4, stroke: C.border, sw: 1 });
    rect(sx, 144, 114, 3, s.color, { opacity: 0.8 });
    text(sx + 12, 162, s.label, 8, C.muted, { fw: 700, ls: 1 });
    text(sx + 12, 196, s.val, 24, s.color, { fw: 800, font: 'Georgia, serif' });
    text(sx + 12, 208, s.sub, 9, C.muted);
  });

  // Weekly chart
  text(20, 236, 'NET SUBSCRIBERS / WEEK', 9, C.muted, { fw: 700, ls: 1.5 });
  line(20, 242, W - 20, 242, C.border, { sw: 1 });

  rect(16, 250, 358, 100, C.surf, { rx: 4, stroke: C.border, sw: 1 });
  // Horizontal midline
  line(30, 300, W - 30, 300, C.border, { sw: 1, opacity: 0.6 });
  text(W - 30, 298, '0', 9, C.muted, { anchor: 'end' });

  const weeklyNet = [62, 88, 54, 74, 110, 92, 124];
  weeklyNet.forEach((v, i) => {
    const bh = Math.round((v / 124) * 40);
    const bx = 34 + i * 48;
    rect(bx, 300 - bh, 32, bh, C.green, { rx: 2, opacity: i === weeklyNet.length - 1 ? 1 : 0.5 });
  });
  text(30, 342, 'Week 1', 8, C.muted);
  text(W - 30, 342, 'This week', 8, C.muted, { anchor: 'end' });

  // Top referrers (people)
  text(20, 374, 'TOP REFERRERS', 9, C.muted, { fw: 700, ls: 1.5 });
  line(20, 380, W - 20, 380, C.border, { sw: 1 });

  const referrers = [
    { name: 'Morgan K.', refs: 28, badge: '🥇' },
    { name: 'Sam Okafor', refs: 19, badge: '🥈' },
    { name: 'Priya Singh', refs: 15, badge: '🥉' },
    { name: 'Alex Chen', refs: 11, badge: '' },
    { name: 'Jo Martinez', refs: 8, badge: '' },
  ];
  referrers.forEach((r, i) => {
    const ry = 394 + i * 50;
    rect(16, ry, 358, 42, C.surf, { rx: 3, stroke: C.border, sw: 1 });
    circle(32, ry + 21, 12, C.card, { stroke: C.border, sw: 1 });
    text(32, ry + 25, r.name.charAt(0), 12, C.accent, { fw: 700, anchor: 'middle' });
    text(54, ry + 20, r.name, 13, C.text, { fw: 600 });
    text(54, ry + 34, `${r.refs} referrals`, 10, C.muted);
    text(W - 20, ry + 25, r.badge || `#${i + 1}`, 13, C.muted, { anchor: 'end', fw: i < 3 ? 400 : 500 });
  });

  // Bottom nav
  rect(0, H - 70, W, 70, C.surf, { stroke: C.border, sw: 1 });
  const navItems = [
    { label: 'Home', icon: '⌂', active: false },
    { label: 'Audience', icon: '◎', active: false },
    { label: 'Content', icon: '✦', active: false },
    { label: 'Revenue', icon: '$', active: false },
    { label: 'Profile', icon: '○', active: false },
  ];
  navItems.forEach((n, i) => {
    const nx = 39 + i * 78;
    text(nx, H - 42, n.icon, 18, C.muted, { anchor: 'middle' });
    text(nx, H - 22, n.label, 9, C.muted, { anchor: 'middle' });
  });

  screens.push({ name: 'Growth', svg: buildSVG(elements), elements: [...elements] });
})();

// ══════════════════════════════════════════════
// SCREEN 6 — Creator Profile
// ══════════════════════════════════════════════
(function buildProfile() {
  elements = [];

  rect(0, 0, W, H, C.bg);
  for (let i = 0; i < 6; i++) line(i * 78, 0, i * 78, H, C.gridLn, { sw: 0.5, opacity: 0.4 });

  // Header
  rect(0, 0, W, 58, C.surf, { stroke: C.border, sw: 1 });
  text(20, 37, 'GLEAM', 18, C.text, { fw: 900, ls: 3 });
  text(W - 20, 37, 'Settings', 12, C.accent, { anchor: 'end', fw: 600 });

  // Profile hero
  rect(0, 58, W, 150, C.surf, { stroke: C.border, sw: 1 });
  // Avatar circle
  circle(W / 2, 132, 38, C.card, { stroke: C.border, sw: 2 });
  text(W / 2, 140, 'E', 32, C.accent, { fw: 700, anchor: 'middle' });
  text(W / 2, 194, 'Elena Voss', 18, C.text, { fw: 700, anchor: 'middle', font: 'Georgia, serif' });
  text(W / 2, 210, 'the.elena.letter@substack.com', 11, C.muted, { anchor: 'middle' });

  // Badge strip
  tag(W / 2 - 45, 218, 'PRO CREATOR', C.accent);

  // Key stats strip
  line(20, 248, W - 20, 248, C.border, { sw: 1 });
  text(20, 268, 'YOUR GLEAM STATS', 9, C.muted, { fw: 700, ls: 1.5 });

  const profileStats = [
    { label: 'Member since', val: 'Jan 2025' },
    { label: 'Heartbeat score', val: '94 / 100' },
    { label: 'Consistency', val: '47 weeks' },
    { label: 'Best open rate', val: '61%' },
  ];
  profileStats.forEach((s, i) => {
    const py = 282 + i * 52;
    rect(16, py, 358, 44, C.surf, { rx: 3, stroke: C.border, sw: 1 });
    text(30, py + 26, s.label, 12, C.muted);
    text(W - 30, py + 26, s.val, 12, C.text, { fw: 700, anchor: 'end' });
  });

  // Plan info
  line(20, 498, W - 20, 498, C.border, { sw: 1 });
  text(20, 518, 'YOUR PLAN', 9, C.muted, { fw: 700, ls: 1.5 });

  rect(16, 526, 358, 80, C.surf, { rx: 4, stroke: C.accent, sw: 2 });
  rect(16, 526, 6, 80, C.accent);
  text(36, 551, 'GLEAM PRO', 13, C.text, { fw: 800, ls: 1 });
  text(36, 568, 'Unlimited subscribers · Advanced analytics', 11, C.muted );
  text(36, 584, 'Billed annually — renews Jan 2027', 10, C.muted );
  text(W - 30, 555, '$19/mo', 16, C.accent, { fw: 700, anchor: 'end' });

  // Integrations
  line(20, 626, W - 20, 626, C.border, { sw: 1 });
  text(20, 646, 'CONNECTED', 9, C.muted, { fw: 700, ls: 1.5 });

  const integrations = [
    { name: 'Stripe', status: 'Active', ok: true },
    { name: 'Substack Import', status: 'Active', ok: true },
    { name: 'Mailchimp', status: 'Not connected', ok: false },
  ];
  integrations.forEach((intg, i) => {
    const iy = 660 + i * 42;
    rect(16, iy, 358, 34, C.surf, { rx: 3, stroke: C.border, sw: 1 });
    text(30, iy + 22, intg.name, 12, C.text, { fw: 500 });
    text(W - 30, iy + 22, intg.status, 10, intg.ok ? C.green : C.muted, { anchor: 'end', fw: intg.ok ? 600 : 400 });
  });

  // Bottom nav
  rect(0, H - 70, W, 70, C.surf, { stroke: C.border, sw: 1 });
  const navItems = [
    { label: 'Home', icon: '⌂', active: false },
    { label: 'Audience', icon: '◎', active: false },
    { label: 'Content', icon: '✦', active: false },
    { label: 'Revenue', icon: '$', active: false },
    { label: 'Profile', icon: '○', active: true },
  ];
  navItems.forEach((n, i) => {
    const nx = 39 + i * 78;
    text(nx, H - 42, n.icon, 18, n.active ? C.accent : C.muted, { anchor: 'middle' });
    text(nx, H - 22, n.label, 9, n.active ? C.accent : C.muted, { anchor: 'middle', fw: n.active ? 700 : 400 });
    if (n.active) line(nx - 18, H - 70, nx + 18, H - 70, C.accent, { sw: 2 });
  });

  screens.push({ name: 'Profile', svg: buildSVG(elements), elements: [...elements] });
})();

// ══════════════════════════════════════════════
// Write pen file
// ══════════════════════════════════════════════
const totalElements = screens.reduce((sum, s) => sum + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: `${NAME} — ${TAGLINE}`,
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'light',
    heartbeat: 42,
    elements: totalElements,
    slug: SLUG,
    palette: {
      bg: C.bg,
      surface: C.surf,
      accent: C.accent,
      accent2: C.accent2,
      text: C.text,
      muted: C.muted,
    },
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
