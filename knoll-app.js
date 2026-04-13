'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG      = 'knoll';
const NAME      = 'KNOLL';
const TAGLINE   = 'Research, connected';
const THEME     = 'light';
const HEARTBEAT = 469;
const W = 390, H = 844;

// ── Warm editorial light palette (inspired by lapa.ninja "Overlay" + minimal.gallery editorial grid)
const BG      = '#F9F6F2';  // warm cream
const SURF    = '#FFFFFF';
const CARD    = '#F1EDE6';
const ACC     = '#C4522A';  // terracotta
const ACC2    = '#2E4A3A';  // forest deep
const TEXT    = '#1C1917';
const MUTED   = 'rgba(28,25,23,0.42)';
const BORDER  = 'rgba(28,25,23,0.10)';
const ACC_L   = 'rgba(196,82,42,0.10)';  // terracotta tint
const ACC2_L  = 'rgba(46,74,58,0.10)';   // forest tint
const AMBER   = '#E8A838';
const SAGE    = '#7A9B80';

function rect(x, y, w, h, fill, opts = {}) {
  const rx      = opts.rx      !== undefined ? opts.rx      : 0;
  const opacity = opts.opacity !== undefined ? opts.opacity : 1;
  const stroke  = opts.stroke  || 'none';
  const sw      = opts.sw      || 1;
  return {
    type: 'rect',
    x, y, width: w, height: h,
    fill, opacity, rx,
    stroke, strokeWidth: sw,
  };
}

function text(x, y, content, size, fill, opts = {}) {
  const fw     = opts.fw     || 400;
  const font   = opts.font   || 'Inter';
  const anchor = opts.anchor || 'start';
  const ls     = opts.ls     || 0;
  const opacity= opts.opacity !== undefined ? opts.opacity : 1;
  const italic = opts.italic || false;
  return {
    type: 'text',
    x, y,
    content: String(content),
    fontSize: size,
    fill,
    fontWeight: fw,
    fontFamily: font,
    textAnchor: anchor,
    letterSpacing: ls,
    opacity,
    fontStyle: italic ? 'italic' : 'normal',
  };
}

function circle(cx, cy, r, fill, opts = {}) {
  return {
    type: 'circle',
    cx, cy, r, fill,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
    stroke:  opts.stroke || 'none',
    strokeWidth: opts.sw || 1,
  };
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  return {
    type: 'line',
    x1, y1, x2, y2,
    stroke,
    strokeWidth: opts.sw || 1,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
  };
}

// ── UI helpers ──────────────────────────────────────────────────────────────

function statusBar(els) {
  // warm cream status bar
  els.push(rect(0, 0, W, 44, SURF));
  els.push(text(20, 28, '9:41', 13, TEXT, { fw: 600 }));
  els.push(text(W - 20, 28, '●●●', 11, MUTED, { anchor: 'end' }));
}

function navBar(els, tabs) {
  // bottom nav — clean editorial style
  els.push(rect(0, H - 82, W, 82, SURF, { stroke: BORDER, sw: 1 }));
  const tw = W / tabs.length;
  tabs.forEach((t, i) => {
    const cx = tw * i + tw / 2;
    if (t.active) {
      // terracotta dot indicator
      circle(cx, H - 62, 3, ACC);
    }
    // icon placeholder as small square
    els.push(rect(cx - 11, H - 66, 22, 22, t.active ? ACC_L : 'none', { rx: 6 }));
    els.push(text(cx, H - 66 + 13, t.icon, 13, t.active ? ACC : MUTED, { anchor: 'middle' }));
    els.push(text(cx, H - 30, t.label, 9, t.active ? TEXT : MUTED, { anchor: 'middle', ls: 0.3 }));
  });
}

function chip(x, y, label, fill, textFill, opts = {}) {
  const pw = opts.pw || label.length * 6.5 + 16;
  const ph = opts.ph || 22;
  const rx = opts.rx !== undefined ? opts.rx : 11;
  const els = [];
  els.push(rect(x, y, pw, ph, fill, { rx }));
  els.push(text(x + pw / 2, y + 14.5, label, 10, textFill, { anchor: 'middle', fw: 500 }));
  return els;
}

function card(x, y, w, h, opts = {}) {
  const fill   = opts.fill   || SURF;
  const rx     = opts.rx     !== undefined ? opts.rx : 14;
  const stroke = opts.stroke || BORDER;
  const sw     = opts.sw     || 1;
  return rect(x, y, w, h, fill, { rx, stroke, sw });
}

function progressBar(x, y, w, h, pct, fill, bg) {
  const els = [];
  els.push(rect(x, y, w, h, bg, { rx: h / 2 }));
  els.push(rect(x, y, Math.max(w * pct, h), h, fill, { rx: h / 2 }));
  return els;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Today (bento dashboard)
// ═══════════════════════════════════════════════════════════════════════════
function screen1() {
  const els = [];

  // Background
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  // Header
  els.push(text(20, 74, 'Good morning, Alex.', 22, TEXT, { fw: 700, font: 'Georgia' }));
  els.push(text(20, 95, 'Sunday, April 12', 13, MUTED, { fw: 400 }));

  // Top bento row — 2 cells
  // Cell 1: Focus session (tall)
  const c1x = 16, c1y = 110, c1w = 174, c1h = 140;
  els.push(card(c1x, c1y, c1w, c1h, { fill: ACC, rx: 16 }));
  els.push(text(c1x + 14, c1y + 22, 'Focus', 11, 'rgba(255,255,255,0.7)', { fw: 500, ls: 0.6 }));
  els.push(text(c1x + 14, c1y + 50, '2h 14m', 32, '#FFFFFF', { fw: 700 }));
  els.push(text(c1x + 14, c1y + 72, 'today', 11, 'rgba(255,255,255,0.6)'));
  // small fire icon area
  els.push(rect(c1x + 14, c1y + 90, 60, 24, 'rgba(255,255,255,0.18)', { rx: 12 }));
  els.push(text(c1x + 14 + 30, c1y + 106, '🔥 14 day streak', 9, '#FFFFFF', { anchor: 'middle' }));
  // mini chart bars
  [0.4, 0.6, 0.8, 0.5, 0.9, 0.7, 1.0].forEach((v, i) => {
    const bh = v * 28;
    els.push(rect(c1x + 14 + i * 20, c1y + 140 - bh - 10, 12, bh, 'rgba(255,255,255,0.3)', { rx: 4 }));
  });

  // Cell 2: Reading queue
  const c2x = 200, c2y = 110, c2w = 174, c2h = 140;
  els.push(card(c2x, c2y, c2w, c2h, { fill: SURF }));
  els.push(text(c2x + 14, c2y + 22, 'READING QUEUE', 9, MUTED, { fw: 600, ls: 1 }));
  // reading items
  const items = [
    ['The Architecture of Trust', 'Harari', ACC],
    ['Network Effects Explained', 'a16z', ACC2],
    ['Notes on Taste', 'personal', AMBER],
  ];
  items.forEach(([title, src, dot], i) => {
    const iy = c2y + 42 + i * 32;
    els.push(circle(c2x + 22, iy + 7, 5, dot));
    els.push(text(c2x + 34, iy + 11, title, 10, TEXT, { fw: 500 }));
    els.push(text(c2x + 34, iy + 23, src, 9, MUTED));
  });

  // Second bento row — full width "daily brief"
  const dbx = 16, dby = 260, dbw = 358, dbh = 100;
  els.push(card(dbx, dby, dbw, dbh, { fill: CARD, rx: 14 }));
  els.push(text(dbx + 14, dby + 20, 'DAILY BRIEF', 9, MUTED, { fw: 600, ls: 1 }));
  els.push(rect(dbx + 14, dby + 28, 40, 2, ACC, { rx: 1 }));
  els.push(text(dbx + 14, dby + 50, '"The pattern recognition gap between experts and novices', 11, TEXT, { fw: 500, font: 'Georgia', italic: true }));
  els.push(text(dbx + 14, dby + 66, 'is not knowledge — it is the habit of noticing."', 11, TEXT, { fw: 500, font: 'Georgia', italic: true }));
  els.push(text(dbx + 14, dby + 84, '— David Epstein, Range', 9, MUTED));
  // clip art / decorative right
  els.push(circle(dbx + dbw - 30, dby + 50, 26, 'rgba(196,82,42,0.07)'));
  els.push(text(dbx + dbw - 30, dby + 58, '✦', 22, ACC, { anchor: 'middle', opacity: 0.35 }));

  // Third bento row — 3 small cells
  const sy = 372, sh = 86, sg = 8;
  const sw2 = (W - 32 - sg * 2) / 3;
  const smallCells = [
    { label: 'Notes', val: '47', sub: 'total', c: ACC2 },
    { label: 'Links', val: '128', sub: 'saved', c: AMBER },
    { label: 'Words', val: '3.2K', sub: 'written', c: ACC },
  ];
  smallCells.forEach((sc, i) => {
    const sx = 16 + i * (sw2 + sg);
    els.push(card(sx, sy, sw2, sh, { fill: SURF }));
    els.push(text(sx + sw2 / 2, sy + 22, sc.label, 9, MUTED, { anchor: 'middle', fw: 600, ls: 0.6 }));
    els.push(text(sx + sw2 / 2, sy + 52, sc.val, 24, sc.c, { anchor: 'middle', fw: 700 }));
    els.push(text(sx + sw2 / 2, sy + 68, sc.sub, 9, MUTED, { anchor: 'middle' }));
  });

  // Fourth row — recent topics chips
  els.push(text(20, 476, 'Recent topics', 13, TEXT, { fw: 600 }));
  const topics = ['Attention Economics', 'Network Design', 'Fermentation', 'Sleep Science'];
  topics.forEach((t, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const tx = 16 + col * 187;
    const ty = 494 + row * 34;
    els.push(...chip(tx, ty, t, SURF, TEXT, { pw: 170, ph: 26, rx: 8 }));
  });

  // Divider
  els.push(line(20, 568, W - 20, 568, BORDER, { sw: 1 }));

  // Today's plan
  els.push(text(20, 590, "Today's plan", 13, TEXT, { fw: 600 }));
  const tasks = [
    { t: 'Review AI governance notes', done: true },
    { t: 'Write weekly synthesis', done: false },
    { t: 'Read: "On Attention" — Weil', done: false },
  ];
  tasks.forEach((task, i) => {
    const ty = 612 + i * 32;
    els.push(rect(20, ty, 20, 20, task.done ? ACC : 'none', { rx: 6, stroke: task.done ? ACC : BORDER, sw: 2 }));
    if (task.done) {
      els.push(text(30, ty + 14, '✓', 10, '#FFFFFF', { anchor: 'middle', fw: 700 }));
    }
    els.push(text(50, ty + 14, task.t, 13, task.done ? MUTED : TEXT, { opacity: task.done ? 0.6 : 1, fw: task.done ? 400 : 500 }));
  });

  navBar(els, [
    { label: 'Today', icon: '◈', active: true },
    { label: 'Explore', icon: '◎', active: false },
    { label: 'Write', icon: '✎', active: false },
    { label: 'Library', icon: '⊞', active: false },
  ]);

  return { name: 'Today — Bento Dashboard', svg: '', elements: els };
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Explore (editorial research grid)
// ═══════════════════════════════════════════════════════════════════════════
function screen2() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  // Header
  els.push(text(20, 74, 'Explore', 28, TEXT, { fw: 700, font: 'Georgia' }));

  // Search bar
  els.push(rect(16, 86, W - 32, 38, SURF, { rx: 10, stroke: BORDER, sw: 1 }));
  els.push(text(36, 110, '⌕', 16, MUTED, { fw: 400 }));
  els.push(text(56, 110, 'Search topics, notes, links…', 13, MUTED));

  // Category filter chips — horizontal row
  const cats = ['All', 'Science', 'Economics', 'Culture', 'Tech', 'Philosophy'];
  let cx = 16;
  cats.forEach((c, i) => {
    const pw = c.length * 7.5 + 20;
    els.push(rect(cx, 136, pw, 26, i === 0 ? ACC : SURF, { rx: 13, stroke: i === 0 ? 'none' : BORDER, sw: 1 }));
    els.push(text(cx + pw / 2, 153, c, 11, i === 0 ? '#FFFFFF' : MUTED, { anchor: 'middle', fw: i === 0 ? 600 : 400 }));
    cx += pw + 8;
  });

  // Editorial bento grid — 2 columns
  // Featured card (full width)
  const fc_y = 176;
  els.push(card(16, fc_y, W - 32, 120, { fill: ACC2, rx: 16 }));
  els.push(text(30, fc_y + 22, 'FEATURED', 9, 'rgba(255,255,255,0.6)', { fw: 700, ls: 1.2 }));
  els.push(text(30, fc_y + 50, 'The Attention Economy', 20, '#FFFFFF', { fw: 700, font: 'Georgia' }));
  els.push(text(30, fc_y + 70, 'How digital environments compete for the', 11, 'rgba(255,255,255,0.7)'));
  els.push(text(30, fc_y + 84, 'most finite human resource: focus.', 11, 'rgba(255,255,255,0.7)'));
  // meta
  els.push(text(30, fc_y + 106, '12 notes · 8 links · 3h reading', 9, 'rgba(255,255,255,0.5)', { fw: 500 }));
  // decorative "page count" badge
  els.push(rect(W - 32 - 50, fc_y + 12, 46, 22, 'rgba(255,255,255,0.15)', { rx: 11 }));
  els.push(text(W - 32 - 50 + 23, fc_y + 27, '47 cards', 9, '#FFFFFF', { anchor: 'middle' }));

  // Two-column grid for topic cards
  const col_w = (W - 32 - 10) / 2;
  const topics_grid = [
    { title: 'Network Effects', sub: 'Economics', count: '23 notes', color: AMBER, icon: '⬡' },
    { title: 'Deep Work', sub: 'Productivity', count: '18 notes', color: SAGE, icon: '◎' },
    { title: 'Fermentation', sub: 'Science', count: '9 notes', color: ACC, icon: '◉' },
    { title: 'Sleep & Memory', sub: 'Neuroscience', count: '31 notes', color: ACC2, icon: '◈' },
  ];
  topics_grid.forEach((t, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const tx = 16 + col * (col_w + 10);
    const ty = 312 + row * 130;
    els.push(card(tx, ty, col_w, 116, { fill: SURF, rx: 14 }));
    // color accent top strip
    els.push(rect(tx, ty, col_w, 4, t.color, { rx: 2 }));
    els.push(text(tx + 14, ty + 26, t.icon, 16, t.color));
    els.push(text(tx + 14, ty + 56, t.title, 14, TEXT, { fw: 700, font: 'Georgia' }));
    els.push(text(tx + 14, ty + 72, t.sub, 10, MUTED, { fw: 500 }));
    els.push(line(tx + 14, ty + 82, tx + col_w - 14, ty + 82, BORDER, { sw: 1 }));
    els.push(text(tx + 14, ty + 98, t.count, 10, MUTED));
  });

  // Discovered recently section
  els.push(text(20, 580, 'Discovered recently', 13, TEXT, { fw: 600 }));
  const recents = [
    'The Overstory — Richard Powers (book)',
    'Mushroom at the End of the World — Tsing (essay)',
  ];
  recents.forEach((r, i) => {
    const ry = 602 + i * 34;
    els.push(rect(16, ry, W - 32, 28, SURF, { rx: 8, stroke: BORDER, sw: 1 }));
    els.push(text(32, ry + 18, r, 11, TEXT, { fw: 400 }));
    els.push(text(W - 28, ry + 18, '→', 13, MUTED, { anchor: 'end' }));
  });

  navBar(els, [
    { label: 'Today', icon: '◈', active: false },
    { label: 'Explore', icon: '◎', active: true },
    { label: 'Write', icon: '✎', active: false },
    { label: 'Library', icon: '⊞', active: false },
  ]);

  return { name: 'Explore — Editorial Grid', svg: '', elements: els };
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Write (document editor)
// ═══════════════════════════════════════════════════════════════════════════
function screen3() {
  const els = [];
  els.push(rect(0, 0, W, H, SURF));
  statusBar(els);

  // Top toolbar
  els.push(rect(0, 44, W, 40, BG, { stroke: BORDER, sw: 1 }));
  els.push(text(20, 68, '← Back', 12, MUTED, { fw: 500 }));
  els.push(text(W / 2, 68, 'Weekly Synthesis #14', 12, TEXT, { anchor: 'middle', fw: 600 }));
  // save indicator
  els.push(rect(W - 70, 54, 54, 20, ACC_L, { rx: 10 }));
  els.push(text(W - 43, 68, '● Saved', 9, ACC, { anchor: 'middle', fw: 500 }));

  // Formatting toolbar
  els.push(rect(0, 84, W, 36, BG));
  const fmt = ['B', 'I', 'U', '—', 'H1', 'H2', '"', '—', '⊞', '⊕'];
  fmt.forEach((f, i) => {
    if (f === '—') {
      els.push(line(16 + i * 34, 92, 16 + i * 34, 110, BORDER));
    } else {
      els.push(rect(10 + i * 34, 90, 26, 22, i === 0 ? CARD : 'none', { rx: 6 }));
      els.push(text(10 + i * 34 + 13, 105, f, 11, i === 0 ? TEXT : MUTED, { anchor: 'middle', fw: i === 0 ? 700 : 400 }));
    }
  });

  // Document area
  const doc_y = 130;

  // Word count chip
  els.push(rect(20, doc_y, 90, 20, CARD, { rx: 10 }));
  els.push(text(65, doc_y + 13, '1,247 words', 9, MUTED, { anchor: 'middle' }));
  els.push(rect(W - 20 - 78, doc_y, 78, 20, CARD, { rx: 10 }));
  els.push(text(W - 20 - 39, doc_y + 13, 'Apr 12, 2026', 9, MUTED, { anchor: 'middle' }));

  // Title
  els.push(text(20, doc_y + 46, 'Weekly Synthesis #14', 26, TEXT, { fw: 700, font: 'Georgia' }));
  els.push(text(20, doc_y + 66, 'On attention, systems, and the art of noticing', 13, MUTED, { fw: 400, font: 'Georgia', italic: true }));
  els.push(line(20, doc_y + 80, W - 20, doc_y + 80, BORDER, { sw: 1 }));

  // Body copy — editorial columns style
  const bodyLines = [
    ['This week I found myself returning to a question I', 14],
    ['first encountered in Epstein\'s Range: what do the', 14],
    ['best generalists actually do with their breadth?', 14],
    ['', 0],
    ['The naive answer is synthesis — they combine ideas', 14],
    ['across domains. But the deeper answer seems to be', 14],
    ['about a different kind of attention.', 14],
    ['', 0],
    ['KEY INSIGHT', 10],
    ['Experts notice anomalies; novices see averages.', 13],
    ['The habit of noticing deviation is trainable.', 13],
  ];
  let bly = doc_y + 104;
  bodyLines.forEach(([line_text, size]) => {
    if (!line_text) { bly += 8; return; }
    const fw  = size === 10 ? 700 : 400;
    const fc  = size === 10 ? ACC  : TEXT;
    const ls  = size === 10 ? 1.2 : 0;
    els.push(text(20, bly, line_text, size, fc, { fw, ls }));
    bly += size + 8;
  });

  // Inline link card
  bly += 8;
  els.push(rect(20, bly, W - 40, 60, CARD, { rx: 10, stroke: BORDER, sw: 1 }));
  els.push(rect(20, bly, 4, 60, ACC, { rx: 2 }));
  els.push(text(36, bly + 18, '🔗 Linked note', 9, MUTED, { fw: 600 }));
  els.push(text(36, bly + 36, 'Attention Economics — full topic board', 13, TEXT, { fw: 500 }));
  els.push(text(36, bly + 52, '12 notes · last edited 2 days ago', 9, MUTED));

  // Text cursor line
  bly += 80;
  els.push(rect(20, bly, 2, 18, ACC, { rx: 1 }));
  els.push(text(26, bly + 13, '  ', 13, TEXT));

  // Bottom mini word-goal
  els.push(rect(0, H - 82, W, 50, BG, { stroke: BORDER, sw: 1 }));
  els.push(text(20, H - 55, 'Goal: 1,500 words', 11, MUTED, { fw: 500 }));
  // progress
  els.push(...progressBar(20, H - 46, W - 100, 5, 0.83, ACC, CARD));
  els.push(text(W - 20, H - 55, '1,247 / 1,500', 11, MUTED, { anchor: 'end' }));

  navBar(els, [
    { label: 'Today', icon: '◈', active: false },
    { label: 'Explore', icon: '◎', active: false },
    { label: 'Write', icon: '✎', active: true },
    { label: 'Library', icon: '⊞', active: false },
  ]);

  return { name: 'Write — Document Editor', svg: '', elements: els };
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Library (organised collections)
// ═══════════════════════════════════════════════════════════════════════════
function screen4() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  // Header + actions
  els.push(text(20, 74, 'Library', 28, TEXT, { fw: 700, font: 'Georgia' }));
  els.push(rect(W - 54, 56, 38, 28, SURF, { rx: 8, stroke: BORDER, sw: 1 }));
  els.push(text(W - 35, 74, '+ New', 11, TEXT, { anchor: 'middle', fw: 600 }));

  // Tab bar
  const tabs_lib = ['Collections', 'Notes', 'Links', 'Files'];
  tabs_lib.forEach((t, i) => {
    const tx = 16 + i * 90;
    els.push(text(tx, 104, t, 13, i === 0 ? TEXT : MUTED, { fw: i === 0 ? 600 : 400 }));
    if (i === 0) {
      els.push(line(tx, 110, tx + t.length * 7.5, 110, ACC, { sw: 2 }));
    }
  });

  // Collections grid (2-col bento inspired)
  const collxns = [
    { name: 'Attention & Focus', count: '23 items', accent: ACC, icon: '◎' },
    { name: 'Network Theory', count: '18 items', accent: ACC2, icon: '⬡' },
    { name: 'Food Science', count: '14 items', accent: AMBER, icon: '◉' },
    { name: 'Writing Craft', count: '31 items', accent: SAGE, icon: '✎' },
    { name: 'Philosophy', count: '9 items', accent: ACC, icon: '◈' },
    { name: 'Ecology', count: '22 items', accent: ACC2, icon: '◉' },
  ];

  const cw = (W - 32 - 10) / 2;
  collxns.forEach((col, i) => {
    const cx = 16 + (i % 2) * (cw + 10);
    const cy = 124 + Math.floor(i / 2) * 120;
    els.push(card(cx, cy, cw, 108, { fill: SURF, rx: 14 }));
    // colored top accent
    els.push(rect(cx, cy, cw, 4, col.accent, { rx: 2 }));
    // icon badge
    els.push(circle(cx + cw - 26, cy + 24, 16, col.accent + '18'));
    els.push(text(cx + cw - 26, cy + 28, col.icon, 13, col.accent, { anchor: 'middle' }));
    els.push(text(cx + 14, cy + 32, col.name, 13, TEXT, { fw: 600, font: 'Georgia' }));
    els.push(text(cx + 14, cy + 50, col.count, 10, MUTED, { fw: 400 }));
    // small progress
    els.push(...progressBar(cx + 14, cy + 66, cw - 28, 4, Math.random() * 0.5 + 0.3, col.accent, CARD));
    // tags row
    els.push(rect(cx + 14, cy + 80, 42, 18, CARD, { rx: 9 }));
    els.push(text(cx + 35, cy + 93, 'Active', 8, MUTED, { anchor: 'middle' }));
  });

  // Recently added section
  els.push(line(16, 488, W - 16, 488, BORDER, { sw: 1 }));
  els.push(text(20, 508, 'Recently added', 13, TEXT, { fw: 600 }));

  const recent_items = [
    { title: 'The Overstory — notes', col: 'Ecology', time: '2h ago' },
    { title: 'Network Effects primer', col: 'Network Theory', time: 'yesterday' },
    { title: 'Weil on attention — extract', col: 'Philosophy', time: '3d ago' },
  ];
  recent_items.forEach((it, i) => {
    const iy = 526 + i * 54;
    els.push(rect(16, iy, W - 32, 46, SURF, { rx: 10, stroke: BORDER, sw: 1 }));
    els.push(rect(16, iy, 4, 46, ACC, { rx: 2 }));
    els.push(text(30, iy + 18, it.title, 13, TEXT, { fw: 500 }));
    els.push(text(30, iy + 34, it.col, 10, MUTED));
    els.push(text(W - 28, iy + 18, it.time, 10, MUTED, { anchor: 'end' }));
  });

  navBar(els, [
    { label: 'Today', icon: '◈', active: false },
    { label: 'Explore', icon: '◎', active: false },
    { label: 'Write', icon: '✎', active: false },
    { label: 'Library', icon: '⊞', active: true },
  ]);

  return { name: 'Library — Collections', svg: '', elements: els };
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Insights (analytics bento)
// ═══════════════════════════════════════════════════════════════════════════
function screen5() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  // Header
  els.push(text(20, 74, 'Insights', 28, TEXT, { fw: 700, font: 'Georgia' }));
  els.push(text(20, 93, 'Your learning patterns, visualised', 13, MUTED));

  // Period selector
  const periods = ['Week', 'Month', 'Year', 'All'];
  periods.forEach((p, i) => {
    const px = 16 + i * 88;
    els.push(rect(px, 106, 80, 24, i === 0 ? TEXT : 'none', { rx: 12, stroke: i === 0 ? 'none' : BORDER, sw: 1 }));
    els.push(text(px + 40, 122, p, 11, i === 0 ? '#FFFFFF' : MUTED, { anchor: 'middle', fw: i === 0 ? 600 : 400 }));
  });

  // Streak calendar (mini heatmap — 7x5 grid)
  els.push(text(20, 150, 'STREAK CALENDAR', 9, MUTED, { fw: 600, ls: 1 }));
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  days.forEach((d, i) => {
    els.push(text(20 + i * 50, 165, d, 9, MUTED, { anchor: 'middle', fw: 500 }));
  });
  const intensities = [
    [0.2, 0.8, 0.6, 0.4, 0.9, 0.3, 0.0],
    [0.7, 0.5, 0.9, 0.8, 0.6, 0.4, 0.2],
    [0.9, 0.7, 0.8, 0.6, 0.9, 0.0, 0.1],
    [0.5, 0.9, 0.7, 0.8, 0.9, 0.3, 0.0],
    [0.8, 0.9, 1.0, 0.9, 0.7, 0.2, 0.0],
  ];
  intensities.forEach((row, ri) => {
    row.forEach((val, ci) => {
      const cx = 20 + ci * 50;
      const cy = 172 + ri * 24;
      const color = val === 0 ? CARD
        : val < 0.4  ? 'rgba(196,82,42,0.20)'
        : val < 0.7  ? 'rgba(196,82,42,0.50)'
        : 'rgba(196,82,42,0.85)';
      els.push(rect(cx - 14, cy, 28, 18, color, { rx: 5 }));
    });
  });

  // Stats row
  const statsy = 308;
  const stats = [
    { label: 'Best streak', val: '14d', c: ACC },
    { label: 'Avg/day', val: '47m', c: ACC2 },
    { label: 'This week', val: '5.2h', c: AMBER },
  ];
  const sw_w = (W - 32 - 16) / 3;
  stats.forEach((s, i) => {
    const sx = 16 + i * (sw_w + 8);
    els.push(card(sx, statsy, sw_w, 72, { fill: SURF }));
    els.push(text(sx + sw_w / 2, statsy + 26, s.val, 22, s.c, { anchor: 'middle', fw: 700 }));
    els.push(text(sx + sw_w / 2, statsy + 46, s.label, 9, MUTED, { anchor: 'middle' }));
    els.push(...progressBar(sx + 12, statsy + 58, sw_w - 24, 4, 0.5 + i * 0.1, s.c, CARD));
  });

  // Topic time spend (horizontal bars)
  els.push(text(20, 400, 'Time by topic', 13, TEXT, { fw: 600 }));
  const topics_time = [
    { label: 'Attention & Focus', pct: 0.82, time: '3.4h', c: ACC },
    { label: 'Network Theory', pct: 0.64, time: '2.6h', c: ACC2 },
    { label: 'Writing Craft', pct: 0.48, time: '2.0h', c: AMBER },
    { label: 'Ecology', pct: 0.32, time: '1.3h', c: SAGE },
    { label: 'Philosophy', pct: 0.20, time: '0.8h', c: MUTED },
  ];
  topics_time.forEach((tt, i) => {
    const ty = 420 + i * 44;
    els.push(text(20, ty + 13, tt.label, 12, TEXT, { fw: 500 }));
    els.push(text(W - 20, ty + 13, tt.time, 11, MUTED, { anchor: 'end' }));
    els.push(...progressBar(20, ty + 20, W - 40, 8, tt.pct, tt.c, CARD));
  });

  // Writing velocity
  els.push(text(20, 650, 'Writing velocity', 13, TEXT, { fw: 600 }));
  const chartx = 20, charty = 668, chartw = W - 40, charth = 60;
  const pts = [0.3, 0.5, 0.4, 0.7, 0.8, 0.6, 0.9, 0.7, 1.0, 0.8, 0.85, 1.0];
  // area
  const step = chartw / (pts.length - 1);
  els.push(rect(chartx, charty, chartw, charth, CARD, { rx: 8 }));
  pts.forEach((v, i) => {
    if (i === 0) return;
    const x1 = chartx + (i - 1) * step, y1 = charty + charth - pts[i - 1] * charth * 0.85;
    const x2 = chartx + i * step,       y2 = charty + charth - v * charth * 0.85;
    els.push(line(x1, y1, x2, y2, ACC, { sw: 2, opacity: 0.8 }));
    if (i === pts.length - 1) {
      els.push(circle(x2, y2, 4, ACC));
    }
  });

  navBar(els, [
    { label: 'Today', icon: '◈', active: false },
    { label: 'Explore', icon: '◎', active: false },
    { label: 'Write', icon: '✎', active: false },
    { label: 'Library', icon: '⊞', active: false },
  ]);

  return { name: 'Insights — Analytics', svg: '', elements: els };
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 6 — Profile / Settings
// ═══════════════════════════════════════════════════════════════════════════
function screen6() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  // Header
  els.push(text(20, 74, 'Profile', 28, TEXT, { fw: 700, font: 'Georgia' }));

  // Avatar + name block
  els.push(circle(W / 2, 140, 44, CARD));
  els.push(circle(W / 2, 140, 44, 'none', { stroke: ACC, sw: 2 }));
  els.push(text(W / 2, 148, 'A', 36, ACC, { anchor: 'middle', fw: 700, font: 'Georgia' }));
  els.push(text(W / 2, 200, 'Alex Meridian', 20, TEXT, { anchor: 'middle', fw: 700, font: 'Georgia' }));
  els.push(text(W / 2, 218, 'Generalist · Researcher · Writer', 12, MUTED, { anchor: 'middle' }));

  // Stats triptych
  const sp = (W - 32) / 3;
  [
    { val: '47', label: 'Notes', c: ACC },
    { val: '14d', label: 'Streak', c: ACC2 },
    { val: '128', label: 'Links', c: AMBER },
  ].forEach((s, i) => {
    const sx = 16 + i * sp;
    els.push(rect(sx, 234, sp, 60, SURF, { rx: 10, stroke: BORDER, sw: 1 }));
    els.push(text(sx + sp / 2, 258, s.val, 20, s.c, { anchor: 'middle', fw: 700 }));
    els.push(text(sx + sp / 2, 278, s.label, 10, MUTED, { anchor: 'middle' }));
  });

  // Weekly goal
  els.push(text(20, 318, 'Weekly goal', 13, TEXT, { fw: 600 }));
  els.push(card(16, 330, W - 32, 64, { fill: SURF }));
  els.push(...progressBar(28, 354, W - 56, 8, 0.72, ACC, CARD));
  els.push(text(28, 348, '5.2h of 7h this week', 11, TEXT, { fw: 500 }));
  els.push(text(W - 28, 348, '72%', 11, ACC, { anchor: 'end', fw: 700 }));
  els.push(text(28, 382, '1.8h remaining to hit your weekly target', 10, MUTED));

  // Settings list
  els.push(text(20, 416, 'Preferences', 13, TEXT, { fw: 600 }));
  const prefs = [
    { label: 'Reading font', val: 'Georgia', icon: 'Aa' },
    { label: 'Daily reminder', val: '8:00 AM', icon: '◎' },
    { label: 'Weekly digest', val: 'Sunday', icon: '✉' },
    { label: 'Sync frequency', val: 'Real-time', icon: '↻' },
  ];
  prefs.forEach((p, i) => {
    const py = 432 + i * 48;
    els.push(rect(16, py, W - 32, 40, SURF, { rx: 10, stroke: BORDER, sw: 1 }));
    els.push(rect(26, py + 10, 22, 22, CARD, { rx: 6 }));
    els.push(text(37, py + 25, p.icon, 10, ACC, { anchor: 'middle' }));
    els.push(text(58, py + 25, p.label, 13, TEXT, { fw: 500 }));
    els.push(text(W - 28, py + 25, p.val, 12, MUTED, { anchor: 'end' }));
    els.push(text(W - 16, py + 25, '›', 14, MUTED, { anchor: 'end' }));
  });

  // Logout
  els.push(rect(16, 636, W - 32, 40, 'rgba(196,82,42,0.06)', { rx: 10, stroke: 'rgba(196,82,42,0.2)', sw: 1 }));
  els.push(text(W / 2, 660, 'Sign out', 13, ACC, { anchor: 'middle', fw: 500 }));

  // App version
  els.push(text(W / 2, 704, 'KNOLL v1.0.4 — Research, connected', 10, MUTED, { anchor: 'middle', opacity: 0.6 }));

  navBar(els, [
    { label: 'Today', icon: '◈', active: false },
    { label: 'Explore', icon: '◎', active: false },
    { label: 'Write', icon: '✎', active: false },
    { label: 'Library', icon: '⊞', active: false },
  ]);

  return { name: 'Profile — Settings', svg: '', elements: els };
}

// ═══════════════════════════════════════════════════════════════════════════
// ASSEMBLE + WRITE
// ═══════════════════════════════════════════════════════════════════════════
const screens = [screen1(), screen2(), screen3(), screen4(), screen5(), screen6()];
const totalElements = screens.reduce((n, s) => n + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    tagline: TAGLINE,
    author: 'RAM',
    date: new Date().toISOString().slice(0, 10),
    theme: THEME,
    heartbeat: HEARTBEAT,
    elements: totalElements,
    slug: SLUG,
    archetype: 'knowledge-management',
    palette: { bg: BG, surface: SURF, card: CARD, accent: ACC, accent2: ACC2, text: TEXT },
    inspiration: 'lapa.ninja Overlay editorial + minimal.gallery bento grid trend, April 2026',
  },
  screens: screens.map(s => ({
    name: s.name,
    width: W,
    height: H,
    svg: s.svg,
    elements: s.elements,
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
