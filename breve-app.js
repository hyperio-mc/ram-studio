'use strict';
const fs   = require('fs');
const path = require('path');

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const SLUG      = 'breve';
const NAME      = 'BREVE';
const TAGLINE   = 'Creative briefs, client sign-off, done.';
const THEME     = 'light';
const HEARTBEAT = 467;
const W = 390, H = 844;

// ─── PALETTE (Warm Cream / Mocha Mousse editorial) ────────────────────────────
// Inspired by siteinspire 2026: Mocha Mousse warm cream base + burnt orange accent
// + sage green secondary — editorial content-first with bento-grid layout
const BG     = '#FAF7F2';   // warm cream
const SURF   = '#FFFFFF';   // white surface
const CARD   = '#F2EDE5';   // warm card
const CARD2  = '#EDE6D9';   // deeper card
const BORDER = '#E0D8CE';   // warm border
const TEXT   = '#1C1714';   // warm near-black
const DIM    = '#8A7E74';   // warm muted
const DIM2   = '#B8AFA5';   // lighter muted
const ACC    = '#C05A2A';   // burnt orange accent
const ACC2   = '#4A7C6F';   // sage green
const ACC3   = '#7B6FAB';   // muted purple
const GOOD   = '#3A8A5A';   // success green
const WARN   = '#D97706';   // amber warning
const WHITE  = '#FFFFFF';
const BLACK  = '#1C1714';

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
let _id = 0;
function uid() { return `el_${++_id}`; }

function rect(x, y, w, h, fill, opts = {}) {
  return {
    id: uid(), type: 'rect', x, y, width: w, height: h, fill,
    rx: opts.rx ?? 0, opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none', strokeWidth: opts.sw ?? 0,
  };
}
function text(x, y, content, size, fill, opts = {}) {
  return {
    id: uid(), type: 'text', x, y, content: String(content), fontSize: size, fill,
    fontWeight: opts.fw ?? 400,
    fontFamily: opts.font ?? 'Inter, system-ui, sans-serif',
    textAnchor: opts.anchor ?? 'start',
    letterSpacing: opts.ls ?? 0,
    opacity: opts.opacity ?? 1,
  };
}
function circle(cx, cy, r, fill, opts = {}) {
  return {
    id: uid(), type: 'circle', cx, cy, r, fill,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none', strokeWidth: opts.sw ?? 0,
  };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return {
    id: uid(), type: 'line', x1, y1, x2, y2, stroke,
    strokeWidth: opts.sw ?? 1, opacity: opts.opacity ?? 1,
  };
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function statusBar(els) {
  els.push(rect(0, 0, W, 44, BG));
  els.push(text(20, 28, '9:41', 13, TEXT, { fw: 600 }));
  els.push(text(370, 28, '●●●', 10, DIM, { anchor: 'end' }));
}

function navBar(els, activeIdx) {
  const labels = ['Home', 'Briefs', 'Review', 'Assets'];
  const icons  = ['⌂', '◧', '✦', '◈'];
  els.push(rect(0, H - 80, W, 80, SURF, { rx: 0 }));
  els.push(line(0, H - 80, W, H - 80, BORDER, { sw: 1 }));
  labels.forEach((label, i) => {
    const x = (W / labels.length) * i + W / labels.length / 2;
    const isActive = i === activeIdx;
    const col = isActive ? ACC : DIM2;
    if (isActive) els.push(rect(x - 22, H - 76, 44, 3, ACC, { rx: 1.5 }));
    els.push(text(x, H - 50, icons[i], 20, col, { anchor: 'middle' }));
    els.push(text(x, H - 22, label, 10, col, { anchor: 'middle', fw: isActive ? 600 : 400 }));
  });
}

function topBar(els, title, sub) {
  els.push(rect(0, 44, W, 56, BG));
  els.push(text(20, 74, title, 22, TEXT, { fw: 800 }));
  if (sub) els.push(text(20, 92, sub, 11, DIM, { fw: 400, ls: 0.3 }));
  else {
    // right action button
    els.push(rect(W - 52, 56, 36, 28, ACC, { rx: 8 }));
    els.push(text(W - 34, 75, '+', 16, WHITE, { anchor: 'middle', fw: 700 }));
  }
}

// ─── SCREEN 1: DASHBOARD (Bento grid — key trend) ─────────────────────────────
function screen1() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);
  topBar(els, 'Good morning,', 'RAKIS DESIGN STUDIO  ·  4 active briefs');

  // greeting + avatar
  els.push(rect(W - 52, 46, 36, 36, CARD2, { rx: 18 }));
  els.push(text(W - 34, 70, 'R', 16, ACC, { anchor: 'middle', fw: 700 }));

  let y = 108;

  // BENTO ROW 1: Two tall stat cards + one wide card
  // Card A — briefs pending (tall, left)
  els.push(rect(16, y, 110, 100, ACC, { rx: 14 }));
  els.push(text(27, y + 22, 'Pending', 10, 'rgba(255,255,255,0.75)', { fw: 500, ls: 0.5 }));
  els.push(text(27, y + 60, '4', 44, WHITE, { fw: 900 }));
  els.push(text(27, y + 84, 'briefs', 11, 'rgba(255,255,255,0.7)'));

  // Card B — approved (tall, right of A)
  els.push(rect(134, y, 110, 100, CARD2, { rx: 14 }));
  els.push(text(145, y + 22, 'Approved', 10, DIM, { fw: 500, ls: 0.5 }));
  els.push(text(145, y + 60, '12', 44, GOOD, { fw: 900 }));
  els.push(text(145, y + 84, 'this month', 11, DIM2));

  // Card C — wide right (revision requests)
  els.push(rect(252, y, 122, 100, CARD, { rx: 14, stroke: BORDER, sw: 1 }));
  els.push(text(263, y + 20, 'Revisions', 10, DIM, { fw: 500, ls: 0.5 }));
  els.push(text(263, y + 50, '2', 30, WARN, { fw: 800 }));
  els.push(text(263, y + 70, 'open', 10, DIM2));
  // mini bar indicator
  els.push(rect(263, y + 80, 80, 5, BORDER, { rx: 2.5 }));
  els.push(rect(263, y + 80, 20, 5, WARN, { rx: 2.5 }));

  y += 112;

  // BENTO ROW 2: Wide card (streak) + tall stat
  // Card D — wide (client satisfaction)
  els.push(rect(16, y, 238, 72, CARD2, { rx: 14 }));
  els.push(text(28, y + 22, 'Client Satisfaction', 10, DIM, { fw: 500, ls: 0.5 }));
  els.push(text(28, y + 52, '98%', 30, ACC2, { fw: 800 }));
  // mini progress
  els.push(rect(100, y + 38, 140, 5, BORDER, { rx: 2.5 }));
  els.push(rect(100, y + 38, 137, 5, ACC2, { rx: 2.5 }));
  els.push(text(242, y + 44, '↑3', 10, GOOD, { anchor: 'end' }));

  // Card E — small (avg turnaround)
  els.push(rect(262, y, 112, 72, CARD, { rx: 14, stroke: BORDER, sw: 1 }));
  els.push(text(273, y + 20, 'Avg turnaround', 9, DIM, { fw: 500 }));
  els.push(text(273, y + 50, '2.4d', 24, ACC3, { fw: 800 }));

  y += 84;

  // Divider label
  els.push(text(16, y + 14, 'ACTIVE BRIEFS', 10, DIM, { fw: 700, ls: 1.5 }));
  y += 28;

  // Brief list items
  const briefs = [
    { title: 'Spring Campaign — Ecohaus', client: 'Ecohaus GmbH', status: 'In Review', statusCol: ACC3, dot: ACC3 },
    { title: 'Product Launch Deck', client: 'Fable Foods', status: 'Approved', statusCol: GOOD, dot: GOOD },
    { title: 'Social Media Refresh', client: 'Marble Co.', status: 'Revisions', statusCol: WARN, dot: WARN },
  ];

  briefs.forEach((b) => {
    els.push(rect(16, y, W - 32, 58, SURF, { rx: 12, stroke: BORDER, sw: 1 }));
    // accent dot
    els.push(circle(33, y + 16, 5, b.dot));
    els.push(text(46, y + 22, b.title, 13, TEXT, { fw: 600 }));
    els.push(text(46, y + 40, b.client, 11, DIM));
    // status pill
    const pillW = b.status.length * 7 + 14;
    els.push(rect(W - 32 - pillW, y + 16, pillW, 20, b.statusCol + '18', { rx: 10 }));
    els.push(text(W - 32 - pillW / 2, y + 30, b.status, 10, b.statusCol, { anchor: 'middle', fw: 600 }));
    y += 66;
  });

  navBar(els, 0);

  return { name: 'Dashboard', elements: els };
}

// ─── SCREEN 2: BRIEF BUILDER ──────────────────────────────────────────────────
function screen2() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  // header
  els.push(rect(0, 44, W, 52, BG));
  els.push(text(20, 72, '← New Brief', 14, ACC, { fw: 600 }));
  els.push(text(W / 2, 72, 'Brief Builder', 16, TEXT, { anchor: 'middle', fw: 700 }));
  // step indicator
  const steps = ['Basics', 'Goals', 'Assets', 'Review'];
  steps.forEach((s, i) => {
    const x = 30 + i * 84;
    const active = i === 0;
    const done   = false;
    const col    = active ? ACC : DIM2;
    els.push(circle(x, 108, 10, active ? ACC : BORDER));
    els.push(text(x, 112, String(i + 1), 10, active ? WHITE : DIM2, { anchor: 'middle', fw: 700 }));
    if (i < steps.length - 1) els.push(line(x + 10, 108, x + 74, 108, BORDER, { sw: 1.5 }));
    els.push(text(x, 127, s, 9, col, { anchor: 'middle', fw: active ? 600 : 400 }));
  });

  let y = 144;

  // form section label
  els.push(text(20, y + 14, 'PROJECT BASICS', 10, DIM, { fw: 700, ls: 1.5 }));
  y += 28;

  // input fields
  const fields = [
    { label: 'Project Name', val: 'Spring Campaign — Ecohaus', filled: true },
    { label: 'Client', val: 'Ecohaus GmbH', filled: true },
    { label: 'Deadline', val: 'April 30, 2026', filled: true },
  ];
  fields.forEach((f) => {
    els.push(text(20, y + 13, f.label, 10, DIM, { fw: 500, ls: 0.5 }));
    y += 18;
    els.push(rect(16, y, W - 32, 44, SURF, { rx: 10, stroke: f.filled ? BORDER : ACC, sw: f.filled ? 1 : 2 }));
    els.push(text(28, y + 27, f.val, 13, f.filled ? TEXT : DIM, { fw: 400 }));
    y += 52;
  });

  // textarea
  els.push(text(20, y + 13, 'Brief Description', 10, DIM, { fw: 500, ls: 0.5 }));
  y += 18;
  els.push(rect(16, y, W - 32, 88, SURF, { rx: 10, stroke: BORDER, sw: 1 }));
  els.push(text(28, y + 22, 'Create a seasonal campaign for our Spring 2026', 12, TEXT));
  els.push(text(28, y + 40, 'product line targeting eco-conscious millennials.', 12, TEXT));
  els.push(text(28, y + 58, 'Focus on sustainability messaging and warm', 12, DIM));
  els.push(text(28, y + 76, 'natural visuals.', 12, DIM));
  y += 100;

  // tags section
  els.push(text(20, y + 13, 'Deliverables', 10, DIM, { fw: 500, ls: 0.5 }));
  y += 24;
  const tags = ['Social Pack', 'Brand Film', 'Key Visual', '+ Add'];
  let tx = 16;
  tags.forEach((tag) => {
    const tw = tag.length * 7.5 + 18;
    const isAdd = tag === '+ Add';
    els.push(rect(tx, y, tw, 28, isAdd ? CARD2 : ACC + '18', { rx: 14, stroke: isAdd ? BORDER : ACC + '60', sw: 1 }));
    els.push(text(tx + tw / 2, y + 18, tag, 11, isAdd ? DIM : ACC, { anchor: 'middle', fw: 600 }));
    tx += tw + 8;
  });
  y += 44;

  // CTA button
  els.push(rect(16, H - 100, W - 32, 48, ACC, { rx: 14 }));
  els.push(text(W / 2, H - 70, 'Save & Continue →', 15, WHITE, { anchor: 'middle', fw: 700 }));

  navBar(els, 1);
  return { name: 'Brief Builder', elements: els };
}

// ─── SCREEN 3: CLIENT REVIEW ──────────────────────────────────────────────────
function screen3() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  // header
  els.push(rect(0, 44, W, 52, BG));
  els.push(text(20, 72, '← Back', 14, ACC, { fw: 600 }));
  els.push(text(W / 2, 72, 'Client Review', 16, TEXT, { anchor: 'middle', fw: 700 }));

  // brief card summary
  let y = 104;
  els.push(rect(16, y, W - 32, 68, CARD2, { rx: 14 }));
  els.push(text(28, y + 20, 'Spring Campaign — Ecohaus', 15, TEXT, { fw: 700 }));
  els.push(text(28, y + 38, 'Ecohaus GmbH  ·  Due Apr 30', 11, DIM));
  // approved pill
  els.push(rect(W - 48 - 60, y + 40, 60, 20, GOOD + '20', { rx: 10 }));
  els.push(text(W - 48 - 30, y + 54, 'Approved', 10, GOOD, { anchor: 'middle', fw: 600 }));
  // section tags
  const sections = ['Overview', 'Goals', 'Assets', 'Timeline'];
  let sx = 28;
  sections.forEach((s, i) => {
    const sw = s.length * 7.5 + 16;
    const isActive = i === 0;
    els.push(rect(sx, y + 46, sw, 18, isActive ? ACC : 'none', { rx: 9 }));
    els.push(text(sx + sw / 2, y + 58, s, 9, isActive ? WHITE : DIM2, { anchor: 'middle', fw: isActive ? 600 : 400 }));
    sx += sw + 6;
  });
  y += 80;

  // comment thread label
  els.push(text(16, y + 14, 'FEEDBACK THREAD  ·  3 comments', 10, DIM, { fw: 700, ls: 1.2 }));
  y += 28;

  // comments
  const comments = [
    {
      name: 'Ana Weber', time: '2h ago', role: 'Client', col: ACC,
      msg: 'Love the sustainability angle. Can we push\nthe colour palette warmer — more terracotta\nthan beige?',
      resolved: false,
    },
    {
      name: 'Rakis D.', time: '1h ago', role: 'Designer', col: ACC2,
      msg: 'Good call — updating palette to SW Worn Brick\n+ Natural Linen. Will share swatch set.',
      resolved: false,
    },
    {
      name: 'Ana Weber', time: '30m ago', role: 'Client', col: ACC,
      msg: 'Perfect. Approved 👏',
      resolved: true,
    },
  ];

  comments.forEach((c) => {
    const isDesigner = c.role === 'Designer';
    const cardX = isDesigner ? 40 : 16;
    const cardW = W - 32 - (isDesigner ? 24 : 0);
    const lines = c.msg.split('\n').length;
    const cardH = 22 + lines * 18 + 16;
    els.push(rect(cardX, y, cardW, cardH, isDesigner ? CARD : SURF, { rx: 12, stroke: BORDER, sw: 1 }));
    // avatar
    els.push(circle(cardX + (isDesigner ? 12 : cardW - 12), y + 12, 10, c.col + '30'));
    els.push(text(cardX + (isDesigner ? 12 : cardW - 12), y + 16, c.name[0], 9, c.col, { anchor: 'middle', fw: 700 }));
    // name + time
    const nameX = isDesigner ? cardX + 28 : cardX + 10;
    els.push(text(nameX, y + 14, c.name, 11, TEXT, { fw: 600 }));
    els.push(text(nameX, y + 26, c.time + '  ·  ' + c.role, 9, DIM));
    // message lines
    c.msg.split('\n').forEach((line, li) => {
      els.push(text(cardX + 12, y + 42 + li * 18, line, 12, TEXT));
    });
    if (c.resolved) {
      els.push(circle(cardX + cardW - 20, y + cardH - 14, 7, GOOD + '30'));
      els.push(text(cardX + cardW - 20, y + cardH - 10, '✓', 9, GOOD, { anchor: 'middle', fw: 700 }));
    }
    y += cardH + 10;
  });

  // reply box
  y = H - 150;
  els.push(rect(16, y, W - 32, 44, SURF, { rx: 12, stroke: ACC, sw: 1.5 }));
  els.push(text(28, y + 27, 'Add a comment…', 13, DIM2));
  els.push(rect(W - 48, y + 8, 32, 28, ACC, { rx: 8 }));
  els.push(text(W - 32, y + 26, '→', 14, WHITE, { anchor: 'middle', fw: 700 }));

  navBar(els, 2);
  return { name: 'Client Review', elements: els };
}

// ─── SCREEN 4: ASSET LIBRARY ──────────────────────────────────────────────────
function screen4() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  els.push(rect(0, 44, W, 52, BG));
  els.push(text(20, 72, 'Asset Library', 22, TEXT, { fw: 800 }));
  els.push(rect(W - 52, 56, 36, 28, CARD2, { rx: 8, stroke: BORDER, sw: 1 }));
  els.push(text(W - 34, 75, '↑', 16, ACC, { anchor: 'middle', fw: 700 }));

  // filter tabs
  const tabs = ['All', 'Logos', 'Photos', 'Fonts', 'Docs'];
  let tx = 16;
  let y = 104;
  tabs.forEach((tab, i) => {
    const tw = tab.length * 8 + 20;
    const isActive = i === 0;
    els.push(rect(tx, y, tw, 28, isActive ? ACC : CARD2, { rx: 14 }));
    els.push(text(tx + tw / 2, y + 18, tab, 11, isActive ? WHITE : DIM, { anchor: 'middle', fw: isActive ? 600 : 400 }));
    tx += tw + 8;
  });
  y += 40;

  // search bar
  els.push(rect(16, y, W - 32, 38, SURF, { rx: 10, stroke: BORDER, sw: 1 }));
  els.push(text(34, y + 23, '⌕  Search assets…', 13, DIM2));
  y += 48;

  // Bento asset grid (asymmetric — key trend)
  // Row 1: wide card + small card
  els.push(rect(16, y, 210, 110, CARD2, { rx: 12 }));
  els.push(rect(24, y + 8, 194, 66, CARD, { rx: 8 })); // thumbnail area
  // logo mockup in thumbnail
  els.push(text(121, y + 46, 'ECOHAUS', 14, ACC, { anchor: 'middle', fw: 900, ls: 2 }));
  els.push(text(121, y + 60, '— PRIMARY LOGO —', 8, DIM, { anchor: 'middle', ls: 2 }));
  els.push(text(24, y + 84, 'Ecohaus_Logo_Final.svg', 10, TEXT, { fw: 600 }));
  els.push(text(24, y + 98, 'SVG  ·  2 versions', 9, DIM));

  els.push(rect(234, y, 140, 110, CARD, { rx: 12, stroke: BORDER, sw: 1 }));
  els.push(rect(242, y + 8, 124, 66, CARD2, { rx: 8 }));
  // photo thumbnail
  els.push(circle(304, y + 28, 18, CARD2 + '80'));
  els.push(text(304, y + 52, '▣', 22, DIM2, { anchor: 'middle' }));
  els.push(text(242, y + 84, 'Hero_Photo_01.jpg', 10, TEXT, { fw: 600 }));
  els.push(text(242, y + 98, 'JPG  ·  4.2 MB', 9, DIM));
  y += 120;

  // Row 2: three small cards
  const smallAssets = [
    { name: 'Brand_Type.ttf', type: 'FONT', col: ACC3 },
    { name: 'Brief_v2.pdf', type: 'DOC', col: ACC },
    { name: 'Moodboard.fig', type: 'FIG', col: ACC2 },
  ];
  const cellW = (W - 32 - 16) / 3;
  smallAssets.forEach((a, i) => {
    const cx = 16 + i * (cellW + 8);
    els.push(rect(cx, y, cellW, 88, SURF, { rx: 10, stroke: BORDER, sw: 1 }));
    els.push(rect(cx + 8, y + 8, cellW - 16, 44, a.col + '18', { rx: 8 }));
    els.push(text(cx + cellW / 2, y + 35, a.type, 12, a.col, { anchor: 'middle', fw: 800, ls: 1 }));
    els.push(text(cx + 6, y + 64, a.name, 8.5, TEXT, { fw: 500 }));
    els.push(text(cx + 6, y + 77, '—', 8, DIM));
  });
  y += 98;

  // Storage bar
  els.push(rect(16, y, W - 32, 44, CARD2, { rx: 10 }));
  els.push(text(28, y + 16, 'Storage  ·  3.8 GB used of 10 GB', 11, DIM));
  els.push(rect(28, y + 28, W - 56, 6, BORDER, { rx: 3 }));
  els.push(rect(28, y + 28, (W - 56) * 0.38, 6, ACC, { rx: 3 }));

  navBar(els, 3);
  return { name: 'Asset Library', elements: els };
}

// ─── SCREEN 5: TIMELINE ───────────────────────────────────────────────────────
function screen5() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  els.push(rect(0, 44, W, 52, BG));
  els.push(text(20, 72, 'Timeline', 22, TEXT, { fw: 800 }));
  els.push(text(20, 88, 'Spring Campaign — Ecohaus', 11, DIM));

  // month header
  let y = 104;
  els.push(rect(16, y, W - 32, 32, CARD2, { rx: 8 }));
  els.push(text(W / 2, y + 20, '← April 2026 →', 13, TEXT, { anchor: 'middle', fw: 600 }));
  y += 42;

  // week-row mini calendar strip
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const dates = [13, 14, 15, 16, 17, 18, 19];
  const dayW = (W - 32) / 7;
  days.forEach((d, i) => {
    const dx = 16 + i * dayW + dayW / 2;
    const isToday = i === 0; // Monday 13th = today approx
    if (isToday) els.push(circle(dx, y + 22, 16, ACC));
    els.push(text(dx, y + 12, d, 9, DIM2, { anchor: 'middle', fw: 600, ls: 0.5 }));
    els.push(text(dx, y + 26, String(dates[i]), 12, isToday ? WHITE : TEXT, { anchor: 'middle', fw: isToday ? 700 : 400 }));
  });
  y += 46;

  // timeline milestones
  const milestones = [
    { date: 'Apr 10', label: 'Kickoff call', done: true, col: GOOD },
    { date: 'Apr 13', label: 'Brief approved', done: true, col: GOOD },
    { date: 'Apr 17', label: 'Mood-board delivery', done: false, col: ACC },
    { date: 'Apr 22', label: 'First design round', done: false, col: ACC2 },
    { date: 'Apr 26', label: 'Client revision window', done: false, col: WARN },
    { date: 'Apr 30', label: 'Final delivery', done: false, col: ACC3 },
  ];

  // vertical track
  const trackX = 48;
  els.push(line(trackX, y, trackX, y + milestones.length * 72, BORDER, { sw: 2 }));

  milestones.forEach((m, i) => {
    const my = y + i * 72;
    // node
    els.push(circle(trackX, my + 20, 9, m.done ? m.col : SURF, { stroke: m.col, sw: 2 }));
    if (m.done) els.push(text(trackX, my + 24, '✓', 9, WHITE, { anchor: 'middle', fw: 700 }));

    // card
    els.push(rect(68, my + 4, W - 84, 52, m.done ? CARD2 : SURF, { rx: 10, stroke: m.done ? m.col + '40' : BORDER, sw: 1 }));
    els.push(text(80, my + 22, m.label, 13, TEXT, { fw: m.done ? 400 : 700 }));
    els.push(text(80, my + 40, m.date, 10, m.done ? DIM2 : m.col, { fw: 500 }));
    if (!m.done && i === 2) {
      // due-soon badge
      els.push(rect(W - 96, my + 14, 44, 20, WARN + '20', { rx: 10 }));
      els.push(text(W - 74, my + 28, 'Soon', 10, WARN, { anchor: 'middle', fw: 600 }));
    }
    if (m.done) els.push(text(W - 36, my + 28, '✓ Done', 10, GOOD, { anchor: 'end', fw: 600 }));
  });

  navBar(els, 1);
  return { name: 'Timeline', elements: els };
}

// ─── SCREEN 6: SETTINGS / BILLING ────────────────────────────────────────────
function screen6() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  els.push(rect(0, 44, W, 52, BG));
  els.push(text(20, 72, 'Account', 22, TEXT, { fw: 800 }));
  els.push(text(20, 88, 'rakis@rakisdesign.com', 11, DIM));

  // avatar
  els.push(rect(W - 60, 52, 44, 44, ACC + '18', { rx: 22 }));
  els.push(text(W - 38, 80, 'R', 20, ACC, { anchor: 'middle', fw: 800 }));

  let y = 104;

  // plan card
  els.push(rect(16, y, W - 32, 80, ACC, { rx: 16 }));
  els.push(text(28, y + 24, 'Studio Plan', 15, WHITE, { fw: 700 }));
  els.push(text(28, y + 42, '€29 / month  ·  renews May 1', 11, 'rgba(255,255,255,0.75)'));
  // usage bar
  els.push(text(28, y + 60, 'Briefs used:', 10, 'rgba(255,255,255,0.7)'));
  els.push(rect(100, y + 54, W - 32 - 116, 8, 'rgba(255,255,255,0.2)', { rx: 4 }));
  els.push(rect(100, y + 54, (W - 32 - 116) * 0.4, 8, WHITE, { rx: 4 }));
  els.push(text(W - 48, y + 62, '4 / 10', 10, 'rgba(255,255,255,0.8)', { anchor: 'end' }));
  // upgrade chip
  els.push(rect(W - 100, y + 20, 68, 26, 'rgba(255,255,255,0.15)', { rx: 13 }));
  els.push(text(W - 66, y + 37, 'Upgrade ↑', 10, WHITE, { anchor: 'middle', fw: 600 }));
  y += 92;

  // settings groups
  const groups = [
    {
      title: 'Workspace',
      items: [
        { label: 'Studio Name', val: 'Rakis Design Studio' },
        { label: 'Time Zone', val: 'UTC+2, Berlin' },
        { label: 'Currency', val: 'EUR €' },
      ],
    },
    {
      title: 'Notifications',
      items: [
        { label: 'Client comments', val: '●  ON', valCol: GOOD },
        { label: 'Brief approvals', val: '●  ON', valCol: GOOD },
        { label: 'Deadline reminders', val: '●  ON', valCol: GOOD },
      ],
    },
  ];

  groups.forEach((g) => {
    els.push(text(20, y + 13, g.title.toUpperCase(), 10, DIM, { fw: 700, ls: 1.5 }));
    y += 24;
    els.push(rect(16, y, W - 32, g.items.length * 48, SURF, { rx: 12, stroke: BORDER, sw: 1 }));
    g.items.forEach((item, i) => {
      const iy = y + i * 48;
      els.push(text(28, iy + 28, item.label, 13, TEXT, { fw: 400 }));
      els.push(text(W - 28, iy + 28, item.val, 12, item.valCol ?? DIM, { anchor: 'end', fw: 500 }));
      if (i < g.items.length - 1) els.push(line(28, iy + 48, W - 28, iy + 48, BORDER, { sw: 0.75 }));
    });
    y += g.items.length * 48 + 16;
  });

  // sign out
  els.push(rect(16, y, W - 32, 44, CARD2, { rx: 10, stroke: BORDER, sw: 1 }));
  els.push(text(W / 2, y + 27, 'Sign Out', 13, '#C0392B', { anchor: 'middle', fw: 600 }));

  // heartbeat footer
  els.push(text(W / 2, H - 92, `Heartbeat #${HEARTBEAT}  ·  RAM`, 9, DIM2, { anchor: 'middle', ls: 0.5 }));

  navBar(els, 0);
  return { name: 'Settings', elements: els };
}

// ─── ASSEMBLE ─────────────────────────────────────────────────────────────────
const screens = [screen1(), screen2(), screen3(), screen4(), screen5(), screen6()];
const totalElements = screens.reduce((sum, s) => sum + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    tagline: TAGLINE,
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: THEME,
    heartbeat: HEARTBEAT,
    elements: totalElements,
    palette: { bg: BG, surface: SURF, accent: ACC, accent2: ACC2 },
    inspiration: 'siteinspire 2026 warm cream Mocha Mousse palette + land-book bento-grid card layouts',
    slug: SLUG,
  },
  screens: screens.map(s => ({
    name: s.name,
    svg: `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"></svg>`,
    elements: s.elements,
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
