'use strict';
const fs   = require('fs');
const path = require('path');

// ─── MAST — Studio OS for creative freelancers ──────────────────────────────
// LIGHT theme — inspired by Siteinspire's architecture studio aesthetic:
// warm off-white replacing pure white, editorial serif display type,
// restrained single-accent palette, bento project grid from Land-book,
// "display serif pairing as the primary differentiation move" (Lapa.ninja).

const SLUG = 'mast';
const W = 390, H = 844;

// Palette — warm cream, not clinical white
const P = {
  bg:      '#F8F5F0',   // warm cream
  surface: '#FFFFFF',   // pure white cards
  card:    '#EDE9E2',   // linen tint
  text:    '#16120C',   // warm near-black
  textMid: '#6B6258',   // warm mid-gray
  textMut: '#A09487',   // muted warm gray
  accent:  '#1C4ED8',   // deep Klein blue (single bold pop)
  acc2:    '#B45309',   // amber-brown earthy
  border:  '#D6CFBF',   // warm border
  borderL: '#E8E3D9',   // light border
  green:   '#16A34A',   // invoice paid
  red:     '#DC2626',   // overdue
  tag:     '#EEF2FF',   // tag bg
  tagText: '#3730A3',   // tag text
};

// ─── Element helpers ─────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, width: w, height: h, fill,
    ...(opts.rx   !== undefined && { rx: opts.rx }),
    ...(opts.opacity !== undefined && { opacity: opts.opacity }),
    ...(opts.stroke  !== undefined && { stroke: opts.stroke }),
    ...(opts.sw      !== undefined && { strokeWidth: opts.sw }),
  };
}
function text(x, y, content, size, fill, opts = {}) {
  return {
    type: 'text', x, y, content: String(content), fontSize: size, fill,
    ...(opts.fw     !== undefined && { fontWeight: opts.fw }),
    ...(opts.font   !== undefined && { fontFamily: opts.font }),
    ...(opts.anchor !== undefined && { textAnchor: opts.anchor }),
    ...(opts.ls     !== undefined && { letterSpacing: opts.ls }),
    ...(opts.opacity !== undefined && { opacity: opts.opacity }),
  };
}
function circle(cx, cy, r, fill, opts = {}) {
  return {
    type: 'circle', cx, cy, r, fill,
    ...(opts.opacity !== undefined && { opacity: opts.opacity }),
    ...(opts.stroke  !== undefined && { stroke: opts.stroke }),
    ...(opts.sw      !== undefined && { strokeWidth: opts.sw }),
  };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return {
    type: 'line', x1, y1, x2, y2, stroke,
    ...(opts.sw      !== undefined && { strokeWidth: opts.sw }),
    ...(opts.opacity !== undefined && { opacity: opts.opacity }),
  };
}

// ─── Shared components ───────────────────────────────────────────────────────

// Status bar (light)
function statusBar() {
  return [
    rect(0, 0, W, 44, P.bg),
    text(16, 16, '9:41', 14, P.text, { fw: 600 }),
    // signal dots
    circle(346, 22, 3, P.text),
    circle(354, 22, 3, P.text),
    circle(362, 22, 3, P.text),
    // battery
    rect(370, 16, 14, 8, 'none', { rx: 2, stroke: P.text, sw: 1.5 }),
    rect(372, 18, 8, 4, P.text, { rx: 1 }),
    rect(384, 19, 2, 6, P.text, { rx: 1 }),
  ];
}

// Bottom nav
function bottomNav(active) {
  const items = [
    { id: 'home',     label: 'Today',    x: 39  },
    { id: 'projects', label: 'Projects', x: 117 },
    { id: 'clients',  label: 'Clients',  x: 195 },
    { id: 'invoices', label: 'Invoices', x: 273 },
    { id: 'profile',  label: 'Profile',  x: 351 },
  ];
  const els = [
    rect(0, H - 80, W, 80, P.surface, { stroke: P.border, sw: 0.5 }),
    line(0, H - 80, W, H - 80, P.border, { sw: 0.5 }),
  ];
  items.forEach(it => {
    const isAct = it.id === active;
    // nav icon dot
    els.push(rect(it.x - 12, H - 62, 24, 24, isAct ? P.tag : 'none', { rx: 8 }));
    els.push(circle(it.x, H - 50, 4, isAct ? P.accent : P.textMut));
    els.push(text(it.x, H - 22, it.label, 9, isAct ? P.accent : P.textMut, {
      fw: isAct ? 600 : 400, anchor: 'middle', ls: 0.3,
    }));
  });
  return els;
}

// ─── SCREEN 1: Dashboard — "Today" ──────────────────────────────────────────
function screenDashboard() {
  const els = [
    rect(0, 0, W, H, P.bg),
    ...statusBar(),
  ];

  // Header
  els.push(text(20, 68, 'MAST', 13, P.accent, { fw: 700, ls: 3 }));
  els.push(text(20, 96, 'Sunday, April 12', 22, P.text, { fw: 300, font: 'Georgia, serif' }));
  els.push(text(20, 118, 'Three projects active', 13, P.textMid, { fw: 400 }));

  // Notification bell
  els.push(rect(344, 62, 32, 32, P.card, { rx: 16 }));
  els.push(circle(360, 78, 7, 'none', { stroke: P.textMid, sw: 1.5 }));
  els.push(line(360, 71, 360, 69, P.textMid, { sw: 1.5 }));
  // badge
  els.push(circle(370, 66, 5, P.accent));
  els.push(text(370, 70, '3', 7, '#FFF', { fw: 700, anchor: 'middle' }));

  // Divider
  els.push(line(20, 132, 370, 132, P.border, { sw: 0.5 }));

  // Stats strip (3-up)
  const stats = [
    { val: '$12,450', sub: 'Active billing', x: 20 },
    { val: '3',       sub: 'In progress',    x: 153 },
    { val: '94%',     sub: 'On-time rate',   x: 270 },
  ];
  stats.forEach((s, i) => {
    if (i > 0) els.push(line(s.x - 14, 142, s.x - 14, 192, P.borderL, { sw: 1 }));
    els.push(text(s.x, 162, s.val, 24, P.text, { fw: 700, font: 'Georgia, serif' }));
    els.push(text(s.x, 178, s.sub, 10, P.textMut, { fw: 400, ls: 0.2 }));
  });

  // Section label
  els.push(text(20, 208, 'ACTIVE PROJECTS', 9, P.textMut, { fw: 600, ls: 2 }));

  // Project cards — two tall, one wide (bento grid spirit)
  // Card 1 (tall left)
  els.push(rect(20, 220, 170, 200, P.surface, { rx: 12, stroke: P.borderL, sw: 1 }));
  els.push(rect(20, 220, 170, 90, '#1C3880', { rx: 12 }));
  els.push(rect(20, 278, 170, 32, '#1C3880', {})); // square bottom of rounded top
  els.push(text(36, 256, 'Arken', 18, '#FFF', { fw: 600, font: 'Georgia, serif' }));
  els.push(text(36, 274, 'Brand identity', 10, 'rgba(255,255,255,0.7)', { fw: 400, ls: 0.5 }));
  // progress bar
  els.push(rect(36, 326, 134, 3, P.borderL, { rx: 1.5 }));
  els.push(rect(36, 326, 90, 3, P.accent, { rx: 1.5 }));
  els.push(text(36, 354, 'Due Apr 24', 10, P.textMut, {}));
  els.push(text(154, 354, '67%', 10, P.accent, { fw: 600, anchor: 'end' }));
  els.push(text(36, 374, '$3,200', 14, P.text, { fw: 600 }));
  els.push(text(36, 388, 'remaining', 9, P.textMut, {}));
  // avatar cluster
  els.push(circle(134, 382, 8, '#A78BFA'));
  els.push(circle(142, 382, 8, P.card, { stroke: P.surface, sw: 2 }));
  els.push(circle(150, 382, 8, '#34D399', { stroke: P.surface, sw: 2 }));

  // Card 2 (tall right)
  els.push(rect(200, 220, 170, 200, P.surface, { rx: 12, stroke: P.borderL, sw: 1 }));
  els.push(rect(200, 220, 170, 90, '#5D3A1A', { rx: 12 }));
  els.push(rect(200, 278, 170, 32, '#5D3A1A', {}));
  els.push(text(216, 256, 'Holt & Co', 18, '#FFF', { fw: 600, font: 'Georgia, serif' }));
  els.push(text(216, 274, 'Web design', 10, 'rgba(255,255,255,0.7)', { fw: 400, ls: 0.5 }));
  els.push(rect(216, 326, 134, 3, P.borderL, { rx: 1.5 }));
  els.push(rect(216, 326, 40, 3, P.acc2, { rx: 1.5 }));
  els.push(text(216, 354, 'Due May 10', 10, P.textMut, {}));
  els.push(text(334, 354, '30%', 10, P.acc2, { fw: 600, anchor: 'end' }));
  els.push(text(216, 374, '$5,800', 14, P.text, { fw: 600 }));
  els.push(text(216, 388, 'remaining', 9, P.textMut, {}));
  els.push(circle(314, 382, 8, '#F59E0B'));
  els.push(circle(322, 382, 8, P.card, { stroke: P.surface, sw: 2 }));

  // Wide card — third project
  els.push(rect(20, 430, 350, 90, P.surface, { rx: 12, stroke: P.borderL, sw: 1 }));
  els.push(rect(20, 430, 6, 90, P.green, { rx: 3 }));
  els.push(text(40, 454, 'Voss Editorial', 15, P.text, { fw: 600, font: 'Georgia, serif' }));
  els.push(text(40, 472, 'Photography direction · review phase', 11, P.textMid, {}));
  els.push(rect(40, 490, 48, 16, '#DCFCE7', { rx: 8 }));
  els.push(text(64, 502, 'Review', 9, P.green, { fw: 600, anchor: 'middle' }));
  els.push(text(354, 454, '$2,100', 13, P.text, { fw: 700, anchor: 'end' }));
  els.push(text(354, 472, 'due Apr 14', 10, P.textMut, { anchor: 'end' }));

  // Today's tasks label
  els.push(text(20, 544, 'TODAY\'S TASKS', 9, P.textMut, { fw: 600, ls: 2 }));

  // Task rows
  const tasks = [
    { done: true,  txt: 'Send Arken logo options',       time: '9:00 AM' },
    { done: false, txt: 'Review Holt wireframes',        time: '2:00 PM' },
    { done: false, txt: 'Invoice #047 — Voss Editorial', time: '4:30 PM' },
  ];
  tasks.forEach((t, i) => {
    const ty = 562 + i * 44;
    els.push(line(20, ty + 34, 370, ty + 34, P.borderL, { sw: 0.5 }));
    // checkbox
    if (t.done) {
      els.push(rect(20, ty + 8, 18, 18, P.accent, { rx: 4 }));
      els.push(text(29, ty + 20, '✓', 10, '#FFF', { anchor: 'middle', fw: 700 }));
    } else {
      els.push(rect(20, ty + 8, 18, 18, 'none', { rx: 4, stroke: P.border, sw: 1.5 }));
    }
    els.push(text(48, ty + 21, t.txt, 13, t.done ? P.textMut : P.text, {
      fw: t.done ? 400 : 500,
      opacity: t.done ? 0.6 : 1,
    }));
    els.push(text(370, ty + 21, t.time, 11, P.textMut, { anchor: 'end' }));
  });

  els.push(...bottomNav('home'));
  return els;
}

// ─── SCREEN 2: Projects — bento grid ─────────────────────────────────────────
function screenProjects() {
  const els = [
    rect(0, 0, W, H, P.bg),
    ...statusBar(),
  ];

  // Header
  els.push(text(20, 70, 'Projects', 28, P.text, { fw: 300, font: 'Georgia, serif' }));
  els.push(text(20, 92, '7 total · 3 active', 12, P.textMid, {}));

  // Filter chips
  const filters = ['All', 'Active', 'Review', 'Closed'];
  filters.forEach((f, i) => {
    const isAct = i === 0;
    const fw = 20 + i * 72;
    const cw = f.length * 7.5 + 20;
    els.push(rect(fw, 104, cw, 26, isAct ? P.text : P.surface, { rx: 13, stroke: P.border, sw: 1 }));
    els.push(text(fw + cw / 2, 122, f, 11, isAct ? P.bg : P.textMid, { fw: isAct ? 600 : 400, anchor: 'middle' }));
  });

  // ─ Bento grid ─
  // Large card (full width hero)
  els.push(rect(20, 142, 350, 160, '#0F1923', { rx: 14 }));
  // subtle texture lines
  for (let lx = 40; lx < 370; lx += 30) {
    els.push(line(lx, 142, lx - 20, 302, 'rgba(255,255,255,0.04)', { sw: 1 }));
  }
  els.push(text(36, 178, 'FEATURED', 9, 'rgba(255,255,255,0.5)', { fw: 600, ls: 2 }));
  els.push(text(36, 206, 'Arken Brand', 26, '#FFF', { fw: 600, font: 'Georgia, serif' }));
  els.push(text(36, 224, 'Identity', 26, '#FFF', { fw: 300, font: 'Georgia, serif' }));
  els.push(text(36, 248, 'Visual identity · Q2 2026', 11, 'rgba(255,255,255,0.5)', {}));
  // status pill
  els.push(rect(36, 268, 60, 20, 'rgba(28,78,216,0.4)', { rx: 10 }));
  els.push(text(66, 281, 'Active', 10, '#93C5FD', { fw: 500, anchor: 'middle' }));
  // completion arc visual
  els.push(circle(330, 222, 34, 'none', { stroke: 'rgba(255,255,255,0.1)', sw: 4 }));
  els.push(circle(330, 222, 34, 'none', { stroke: P.accent, sw: 4, opacity: 0.9 }));
  els.push(text(330, 217, '67', 16, '#FFF', { fw: 700, anchor: 'middle' }));
  els.push(text(330, 231, '%', 9, 'rgba(255,255,255,0.5)', { anchor: 'middle' }));

  // Two medium cards below
  // Card L
  els.push(rect(20, 314, 167, 130, P.surface, { rx: 12, stroke: P.borderL, sw: 1 }));
  els.push(rect(20, 314, 167, 52, '#5D3A1A', { rx: 12 }));
  els.push(rect(20, 346, 167, 20, '#5D3A1A', {}));
  els.push(text(34, 345, 'Holt & Co', 14, '#FFF', { fw: 600, font: 'Georgia, serif' }));
  els.push(text(34, 383, 'Web design', 10, P.textMid, {}));
  els.push(text(34, 400, '$5,800', 14, P.text, { fw: 700 }));
  els.push(rect(34, 412, 90, 3, P.borderL, { rx: 1.5 }));
  els.push(rect(34, 412, 28, 3, P.acc2, { rx: 1.5 }));
  els.push(text(34, 432, '30%', 10, P.acc2, { fw: 600 }));

  // Card R
  els.push(rect(203, 314, 167, 130, P.surface, { rx: 12, stroke: P.borderL, sw: 1 }));
  els.push(rect(203, 314, 167, 52, '#0A4A2E', { rx: 12 }));
  els.push(rect(203, 346, 167, 20, '#0A4A2E', {}));
  els.push(text(217, 345, 'Voss', 14, '#FFF', { fw: 600, font: 'Georgia, serif' }));
  els.push(text(217, 383, 'Photo direction', 10, P.textMid, {}));
  els.push(text(217, 400, '$2,100', 14, P.text, { fw: 700 }));
  els.push(rect(217, 412, 24, 16, '#DCFCE7', { rx: 8 }));
  els.push(rect(217, 412, 24 + 36 - 10, 16, '#DCFCE7', { rx: 8, opacity: 0 })); // spacer
  els.push(text(229, 424, 'Review', 9, P.green, { fw: 600, anchor: 'middle' }));

  // Smaller cards row (2 closed projects)
  const sCards = [
    { name: 'Mercer',  cat: 'Print',  color: '#4A1942', val: '$4,200', stat: 'Closed' },
    { name: 'Fold',    cat: 'Motion', color: '#1A1A2E', val: '$1,800', stat: 'Closed' },
  ];
  sCards.forEach((c, i) => {
    const cx = 20 + i * 183;
    els.push(rect(cx, 456, 165, 104, P.surface, { rx: 12, stroke: P.borderL, sw: 1 }));
    els.push(rect(cx, 456, 165, 40, c.color, { rx: 10 }));
    els.push(rect(cx, 480, 165, 16, c.color, {}));
    els.push(text(cx + 14, 479, c.name, 13, '#FFF', { fw: 600, font: 'Georgia, serif' }));
    els.push(text(cx + 14, 502, c.cat, 9, P.textMut, {}));
    els.push(text(cx + 14, 522, c.val, 13, P.text, { fw: 700 }));
    els.push(rect(cx + 14, 536, 38, 14, P.card, { rx: 7 }));
    els.push(text(cx + 33, 547, c.stat, 8, P.textMut, { fw: 500, anchor: 'middle' }));
  });

  // New project button
  els.push(rect(20, 572, 350, 44, P.accent, { rx: 22 }));
  els.push(text(195, 599, '+ New Project', 14, '#FFF', { fw: 600, anchor: 'middle' }));

  els.push(...bottomNav('projects'));
  return els;
}

// ─── SCREEN 3: Project Detail ─────────────────────────────────────────────────
function screenProjectDetail() {
  const els = [
    rect(0, 0, W, H, P.bg),
    ...statusBar(),
  ];

  // Hero image area — dark editorial feel
  els.push(rect(0, 44, W, 210, '#0F1923', {}));
  // Abstract geometric in hero
  for (let rx = 0; rx < 4; rx++) {
    els.push(rect(30 + rx * 80, 60, 60, 180, `rgba(28,78,216,${0.03 + rx * 0.02})`, { rx: 30 }));
  }
  els.push(rect(60, 110, 200, 90, 'rgba(255,255,255,0.04)', { rx: 8 }));
  els.push(text(80, 152, 'ARKEN', 36, '#FFF', { fw: 700, ls: 8 }));
  els.push(text(80, 178, 'STUDIO', 18, 'rgba(255,255,255,0.4)', { fw: 300, ls: 12 }));

  // Back arrow
  els.push(circle(32, 64, 14, 'rgba(255,255,255,0.15)'));
  els.push(text(32, 69, '←', 14, '#FFF', { anchor: 'middle' }));

  // Share
  els.push(circle(358, 64, 14, 'rgba(255,255,255,0.15)'));
  els.push(text(358, 69, '↗', 13, '#FFF', { anchor: 'middle' }));

  // Project meta strip
  els.push(rect(0, 254, W, 64, P.surface, { stroke: P.borderL, sw: 0.5 }));
  const metaItems = [
    { val: 'Apr 24',   sub: 'Deadline'  },
    { val: '67%',      sub: 'Complete'  },
    { val: '$3,200',   sub: 'Remaining' },
    { val: '3',        sub: 'Deliverables' },
  ];
  metaItems.forEach((m, i) => {
    if (i > 0) els.push(line(20 + i * 88, 266, 20 + i * 88, 306, P.borderL, { sw: 1 }));
    els.push(text(20 + i * 88 + 36, 278, m.val, 14, P.text, { fw: 700, anchor: 'middle' }));
    els.push(text(20 + i * 88 + 36, 294, m.sub, 9, P.textMut, { anchor: 'middle' }));
  });

  // Content section
  els.push(text(20, 338, 'Arken Brand Identity', 20, P.text, { fw: 600, font: 'Georgia, serif' }));
  els.push(text(20, 356, 'Brand identity for architecture studio, Arken. Scope', 12, P.textMid, {}));
  els.push(text(20, 370, 'includes logo, typography system, and brand guidelines.', 12, P.textMid, {}));

  // Progress bar section
  els.push(text(20, 396, 'DELIVERABLES', 9, P.textMut, { fw: 600, ls: 2 }));

  const deliverables = [
    { name: 'Logo concepts',       done: true,  pct: 100 },
    { name: 'Typography system',   done: true,  pct: 100 },
    { name: 'Brand guidelines',    done: false, pct: 45  },
  ];
  deliverables.forEach((d, i) => {
    const dy = 410 + i * 56;
    els.push(rect(20, dy, 350, 44, P.surface, { rx: 8, stroke: P.borderL, sw: 1 }));
    // check or pending
    if (d.done) {
      els.push(rect(32, dy + 13, 18, 18, P.accent, { rx: 4 }));
      els.push(text(41, dy + 25, '✓', 10, '#FFF', { anchor: 'middle', fw: 700 }));
    } else {
      els.push(rect(32, dy + 13, 18, 18, 'none', { rx: 4, stroke: P.border, sw: 1.5 }));
    }
    els.push(text(58, dy + 26, d.name, 13, d.done ? P.textMid : P.text, { fw: d.done ? 400 : 500 }));
    // mini progress
    els.push(rect(240, dy + 19, 100, 4, P.borderL, { rx: 2 }));
    els.push(rect(240, dy + 19, d.pct, 4, d.done ? P.green : P.accent, { rx: 2 }));
    els.push(text(348, dy + 26, `${d.pct}%`, 10, d.done ? P.green : P.accent, { fw: 600, anchor: 'end' }));
  });

  // Invoice button
  els.push(rect(20, 584, 350, 44, P.text, { rx: 22 }));
  els.push(text(195, 611, 'Create Invoice', 14, P.bg, { fw: 600, anchor: 'middle' }));

  els.push(...bottomNav('projects'));
  return els;
}

// ─── SCREEN 4: Clients ────────────────────────────────────────────────────────
function screenClients() {
  const els = [
    rect(0, 0, W, H, P.bg),
    ...statusBar(),
  ];

  // Header
  els.push(text(20, 70, 'Clients', 28, P.text, { fw: 300, font: 'Georgia, serif' }));
  els.push(text(20, 92, '8 total · $24,650 lifetime', 12, P.textMid, {}));

  // Search bar
  els.push(rect(20, 104, 350, 38, P.surface, { rx: 10, stroke: P.border, sw: 1 }));
  els.push(circle(42, 123, 7, 'none', { stroke: P.textMut, sw: 1.5 }));
  els.push(line(47, 128, 52, 133, P.textMut, { sw: 1.5 }));
  els.push(text(60, 128, 'Search clients...', 12, P.textMut, {}));

  // Sort/filter row
  els.push(text(20, 162, 'SORT BY', 9, P.textMut, { fw: 600, ls: 2 }));
  const sorts = ['Recent', 'Value', 'A–Z'];
  sorts.forEach((s, i) => {
    const isAct = i === 0;
    const sw = 20 + i * 76;
    els.push(rect(sw, 170, 64, 22, isAct ? P.text : 'none', { rx: 11, stroke: P.border, sw: 1 }));
    els.push(text(sw + 32, 185, s, 10, isAct ? P.bg : P.textMid, { fw: 500, anchor: 'middle' }));
  });

  // Client list
  const clients = [
    { name: 'Arken Studio',   cat: 'Architecture',    val: '$6,400',  active: true,  initials: 'AS', color: '#1C3880' },
    { name: 'Holt & Co',      cat: 'Retail brand',    val: '$5,800',  active: true,  initials: 'HC', color: '#5D3A1A' },
    { name: 'Voss Editorial', cat: 'Publishing',       val: '$4,100',  active: true,  initials: 'VE', color: '#0A4A2E' },
    { name: 'Mercer Group',   cat: 'Consultancy',     val: '$4,200',  active: false, initials: 'MG', color: '#4A1942' },
    { name: 'Fold Studio',    cat: 'Film & motion',   val: '$1,800',  active: false, initials: 'FS', color: '#1A1A2E' },
    { name: 'Pillar Books',   cat: 'Publishing',       val: '$2,350',  active: false, initials: 'PB', color: '#2A3A1A' },
  ];

  clients.forEach((c, i) => {
    const cy = 204 + i * 72;
    // separator
    if (i > 0) els.push(line(20, cy, 370, cy, P.borderL, { sw: 0.5 }));

    // Avatar
    els.push(circle(44, cy + 28, 20, c.color));
    els.push(text(44, cy + 34, c.initials, 11, '#FFF', { fw: 700, anchor: 'middle' }));

    // Info
    els.push(text(74, cy + 20, c.name, 14, P.text, { fw: 600 }));
    els.push(text(74, cy + 36, c.cat, 11, P.textMut, {}));

    // Active dot
    if (c.active) {
      els.push(circle(74 + c.name.length * 8.2, cy + 16, 4, P.green));
    }

    // Value + arrow
    els.push(text(354, cy + 20, c.val, 14, P.text, { fw: 700, anchor: 'end' }));
    els.push(text(366, cy + 36, '›', 16, P.textMut, { anchor: 'end' }));
  });

  // Add client
  els.push(rect(20, 642, 350, 44, P.surface, { rx: 22, stroke: P.border, sw: 1.5 }));
  els.push(text(195, 669, '+ Add Client', 14, P.text, { fw: 500, anchor: 'middle' }));

  els.push(...bottomNav('clients'));
  return els;
}

// ─── SCREEN 5: Invoice ────────────────────────────────────────────────────────
function screenInvoice() {
  const els = [
    rect(0, 0, W, H, P.bg),
    ...statusBar(),
  ];

  // Header
  els.push(text(20, 68, '←', 18, P.text));
  els.push(text(195, 70, 'New Invoice', 16, P.text, { fw: 600, anchor: 'middle' }));
  els.push(text(354, 70, 'Send', 14, P.accent, { fw: 600, anchor: 'end' }));

  // Invoice card — Swiss grid editorial treatment
  els.push(rect(20, 88, 350, 440, P.surface, { rx: 14, stroke: P.borderL, sw: 1 }));

  // Invoice header inside card
  els.push(rect(20, 88, 350, 72, P.text, { rx: 14 }));
  els.push(rect(20, 132, 350, 28, P.text, {})); // square bottom corners
  els.push(text(36, 116, 'MAST', 11, 'rgba(255,255,255,0.5)', { fw: 700, ls: 3 }));
  els.push(text(36, 136, 'INVOICE', 22, '#FFF', { fw: 300, font: 'Georgia, serif', ls: 4 }));
  els.push(text(354, 116, '#047', 20, '#FFF', { fw: 700, anchor: 'end' }));
  els.push(text(354, 136, 'Apr 12, 2026', 10, 'rgba(255,255,255,0.5)', { anchor: 'end' }));

  // From / To
  els.push(text(36, 186, 'FROM', 8, P.textMut, { fw: 600, ls: 2 }));
  els.push(text(36, 202, 'Your Studio Name', 13, P.text, { fw: 600 }));
  els.push(text(36, 218, 'your@studio.co', 11, P.textMid, {}));

  els.push(line(195, 168, 195, 232, P.borderL, { sw: 1 }));

  els.push(text(210, 186, 'TO', 8, P.textMut, { fw: 600, ls: 2 }));
  els.push(text(210, 202, 'Voss Editorial', 13, P.text, { fw: 600 }));
  els.push(text(210, 218, 'sarah@voss.com', 11, P.textMid, {}));

  els.push(line(36, 240, 354, 240, P.borderL, { sw: 0.5 }));

  // Line items
  els.push(text(36, 260, 'DESCRIPTION', 8, P.textMut, { fw: 600, ls: 2 }));
  els.push(text(354, 260, 'AMOUNT', 8, P.textMut, { fw: 600, ls: 2, anchor: 'end' }));

  const items = [
    { desc: 'Photography direction · 3 days', amt: '$1,500' },
    { desc: 'Art direction & selects review',  amt: '$450'   },
    { desc: 'Final delivery & licensing prep', amt: '$150'   },
  ];
  items.forEach((it, i) => {
    const iy = 278 + i * 38;
    els.push(line(36, iy + 30, 354, iy + 30, P.borderL, { sw: 0.5 }));
    els.push(text(36, iy + 16, it.desc, 12, P.text, {}));
    els.push(text(354, iy + 16, it.amt, 12, P.text, { fw: 600, anchor: 'end' }));
  });

  // Totals
  els.push(rect(36, 400, 318, 48, P.card, { rx: 8 }));
  els.push(text(52, 418, 'Subtotal', 11, P.textMid, {}));
  els.push(text(338, 418, '$2,100', 12, P.text, { fw: 600, anchor: 'end' }));
  els.push(text(52, 436, 'Due Apr 26, 2026', 10, P.textMut, {}));
  els.push(text(338, 436, 'Net 14', 10, P.textMut, { anchor: 'end' }));

  // TOTAL bar
  els.push(rect(20, 480, 350, 48, P.text, { rx: 10 }));
  els.push(text(36, 509, 'TOTAL DUE', 11, 'rgba(255,255,255,0.5)', { fw: 600, ls: 1 }));
  els.push(text(354, 509, '$2,100', 18, '#FFF', { fw: 700, anchor: 'end' }));

  // Payment method selector
  els.push(text(20, 556, 'PAYMENT METHOD', 9, P.textMut, { fw: 600, ls: 2 }));
  const methods = ['Bank transfer', 'Stripe', 'PayPal'];
  methods.forEach((m, i) => {
    const isAct = i === 0;
    const mx = 20 + i * 115;
    els.push(rect(mx, 566, 108, 36, isAct ? P.text : P.surface, { rx: 8, stroke: P.border, sw: 1 }));
    els.push(text(mx + 54, 589, m, 11, isAct ? P.bg : P.textMid, { fw: isAct ? 600 : 400, anchor: 'middle' }));
  });

  // Notes field
  els.push(rect(20, 616, 350, 44, P.surface, { rx: 10, stroke: P.border, sw: 1 }));
  els.push(text(36, 644, 'Add a note to client...', 12, P.textMut, {}));

  // Send button
  els.push(rect(20, 674, 350, 48, P.accent, { rx: 24 }));
  els.push(text(195, 703, 'Send Invoice', 15, '#FFF', { fw: 600, anchor: 'middle' }));

  els.push(...bottomNav('invoices'));
  return els;
}

// ─── SCREEN 6: Profile / Public Portfolio ─────────────────────────────────────
function screenProfile() {
  const els = [
    rect(0, 0, W, H, P.bg),
    ...statusBar(),
  ];

  // Header
  els.push(text(20, 70, 'Profile', 28, P.text, { fw: 300, font: 'Georgia, serif' }));
  els.push(rect(344, 58, 36, 24, P.card, { rx: 12, stroke: P.borderL, sw: 1 }));
  els.push(text(362, 75, 'Edit', 11, P.textMid, { anchor: 'middle' }));

  // Profile card
  els.push(rect(20, 92, 350, 140, P.surface, { rx: 14, stroke: P.borderL, sw: 1 }));
  // Avatar
  els.push(rect(36, 112, 64, 64, P.text, { rx: 32 }));
  els.push(text(68, 150, 'YS', 18, P.bg, { fw: 700, anchor: 'middle' }));
  // Info
  els.push(text(116, 130, 'Your Studio', 16, P.text, { fw: 600 }));
  els.push(text(116, 148, 'Creative director & designer', 11, P.textMid, {}));
  els.push(text(116, 164, 'London, UK', 11, P.textMut, {}));
  // Stats in card
  const pStats = [{ v: '7', l: 'Projects' }, { v: '8', l: 'Clients' }, { v: '4.9', l: 'Rating' }];
  pStats.forEach((s, i) => {
    const px = 36 + i * 108;
    els.push(text(px, 196, s.v, 18, P.text, { fw: 700 }));
    els.push(text(px, 212, s.l, 9, P.textMut, {}));
  });

  // Portfolio link
  els.push(rect(20, 244, 350, 48, P.card, { rx: 12, stroke: P.borderL, sw: 1 }));
  els.push(text(36, 263, 'PUBLIC PORTFOLIO', 8, P.textMut, { fw: 600, ls: 2 }));
  els.push(text(36, 280, 'mast.studio/yourstudio', 13, P.accent, { fw: 500 }));
  els.push(text(354, 272, '↗', 16, P.accent, { anchor: 'end' }));

  // Services section
  els.push(text(20, 314, 'SERVICES', 9, P.textMut, { fw: 600, ls: 2 }));
  const services = [
    { name: 'Brand identity',    rate: '$1,200/day' },
    { name: 'Web design',        rate: '$950/day'   },
    { name: 'Art direction',     rate: '$800/day'   },
    { name: 'Photography',       rate: '$600/day'   },
  ];
  services.forEach((s, i) => {
    const sy = 328 + i * 46;
    els.push(line(20, sy, 370, sy, P.borderL, { sw: 0.5 }));
    els.push(text(20, sy + 28, s.name, 13, P.text, { fw: 500 }));
    els.push(text(354, sy + 28, s.rate, 12, P.textMid, { anchor: 'end' }));
  });
  els.push(line(20, 328 + services.length * 46, 370, 328 + services.length * 46, P.borderL, { sw: 0.5 }));

  // Settings items
  els.push(text(20, 526, 'SETTINGS', 9, P.textMut, { fw: 600, ls: 2 }));
  const settings = ['Billing preferences', 'Notification settings', 'Export all data'];
  settings.forEach((s, i) => {
    const sy = 540 + i * 44;
    els.push(line(20, sy, 370, sy, P.borderL, { sw: 0.5 }));
    els.push(text(20, sy + 28, s, 13, P.text, {}));
    els.push(text(366, sy + 28, '›', 16, P.textMut, { anchor: 'end' }));
  });

  els.push(...bottomNav('profile'));
  return els;
}

// ─── Assemble ─────────────────────────────────────────────────────────────────
const screens = [
  { name: 'Today — Dashboard',   fn: screenDashboard },
  { name: 'Projects — Bento',    fn: screenProjects  },
  { name: 'Project Detail',      fn: screenProjectDetail },
  { name: 'Clients',             fn: screenClients   },
  { name: 'Invoice',             fn: screenInvoice   },
  { name: 'Profile',             fn: screenProfile   },
];

const penScreens = screens.map(s => {
  const elements = s.fn();
  return {
    name: s.name,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"/>`,
    elements,
  };
});

const totalElements = penScreens.reduce((sum, s) => sum + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name:      'MAST — Studio OS',
    author:    'RAM',
    date:      new Date().toISOString().slice(0, 10),
    theme:     'light',
    heartbeat: 'mast',
    elements:  totalElements,
    palette: {
      bg:      P.bg,
      surface: P.surface,
      card:    P.card,
      text:    P.text,
      accent:  P.accent,
      accent2: P.acc2,
    },
  },
  screens: penScreens,
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`MAST: ${penScreens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
