/**
 * HARVEST — Freelance Financial Intelligence
 * RAM Design Heartbeat · March 2026
 *
 * Inspired by:
 * - Midday.ai (Dark Mode Design / land-book) — editorial minimal, "for the new wave
 *   of one-person companies", massive serif headline, off-white product screenshot hero
 * - Typeform landing (land-book) — TWK Lausanne typeface, warm #FAF9FB canvas,
 *   people-friendly SaaS with clean single-column layouts
 * - Evervault Customers page (Godly) — Inter + serif pairing, grid of status cards
 *
 * Light theme: warm parchment, copper/amber accent, editorial serif + Inter
 * 5 screens: Overview · Invoices · Time · Clients · Reports
 */

const fs   = require('fs');
const path = require('path');

// ─── Palette ─────────────────────────────────────────────────────────────────
const P = {
  bg:       '#FAF8F3',   // warm parchment
  surface:  '#FFFFFF',   // pure white cards
  surface2: '#F3F1EA',   // slightly warmer surface for nested
  border:   '#E6E2D7',   // warm gray border
  text:     '#1C1916',   // near-black with warmth
  muted:    '#7A7063',   // warm gray muted
  accent:   '#C4612A',   // copper/amber
  accent2:  '#E8A44E',   // golden yellow secondary
  green:    '#2E7D52',   // income green
  red:      '#C13333',   // expense / overdue red
  purple:   '#5C4FA0',   // invoiced / pending
};

// ─── Typography ───────────────────────────────────────────────────────────────
const FONTS = {
  serif: '"Playfair Display", "Georgia", serif',
  ui:    '"Inter", system-ui, sans-serif',
  mono:  '"JetBrains Mono", monospace',
};

// ─── Canvas ───────────────────────────────────────────────────────────────────
const W = 390;
const H = 844;

let _id = 1;
function uid() { return `el-${_id++}`; }

// ─── Primitives ───────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return { r, g, b };
}

function rect(x, y, w, h, fill, opts = {}) {
  return {
    id: uid(), type: 'RECTANGLE',
    x, y, width: w, height: h,
    fills: [{ type: 'SOLID', color: hexToRgb(fill), opacity: opts.opacity ?? 1 }],
    cornerRadius: opts.r ?? 0,
    strokes: opts.stroke ? [{ type: 'SOLID', color: hexToRgb(opts.stroke) }] : [],
    strokeWeight: opts.strokeWeight ?? 1,
    opacity: 1,
    effects: opts.shadow ? [{
      type: 'DROP_SHADOW', radius: 16, spread: 0,
      color: { r: 0.1, g: 0.08, b: 0.04, a: 0.08 }, x: 0, y: 4, visible: true,
    }] : [],
  };
}

function text(content, x, y, opts = {}) {
  const {
    size = 13, weight = 400, color = P.text, font = FONTS.ui,
    align = 'LEFT', w = 300, opacity = 1, letterSpacing = 0, italic = false,
  } = opts;
  return {
    id: uid(), type: 'TEXT',
    x, y, width: w, height: size * 1.45,
    content,
    fontSize: size,
    fontWeight: weight,
    fontFamily: font,
    fills: [{ type: 'SOLID', color: hexToRgb(color), opacity }],
    textAlign: align,
    letterSpacing,
    opacity,
    italic: italic || false,
  };
}

function circle(x, y, r, fill, opts = {}) {
  return {
    id: uid(), type: 'ELLIPSE',
    x: x - r, y: y - r, width: r * 2, height: r * 2,
    fills: [{ type: 'SOLID', color: hexToRgb(fill), opacity: opts.opacity ?? 1 }],
    strokes: opts.stroke ? [{ type: 'SOLID', color: hexToRgb(opts.stroke) }] : [],
    strokeWeight: opts.strokeWeight ?? 1,
    effects: [],
  };
}

function line(x1, y1, x2, y2, color, opts = {}) {
  return {
    id: uid(), type: 'LINE',
    x: x1, y: y1,
    width: Math.max(1, x2 - x1),
    height: Math.max(1, Math.abs(y2 - y1)),
    fills: [], strokes: [{ type: 'SOLID', color: hexToRgb(color) }],
    strokeWeight: opts.weight ?? 1,
    opacity: opts.opacity ?? 1,
  };
}

// ─── Shared Components ────────────────────────────────────────────────────────

function statusBar(title) {
  return [
    rect(0, 0, W, 44, P.bg),
    text('9:41', 20, 14, { size: 12, weight: 600, color: P.text, w: 40 }),
    text(title, W / 2 - 60, 14, { size: 13, weight: 600, color: P.text, align: 'CENTER', w: 120 }),
    // battery + signal icons placeholder
    rect(W - 48, 17, 22, 11, P.border, { r: 2, stroke: P.muted }),
    rect(W - 47, 18, Math.round(22 * 0.72), 9, P.text, { r: 1 }),
    rect(W - 24, 20, 4, 6, P.muted, { r: 1 }),
  ];
}

function tabBar(active) {
  // active: 0=Home 1=Invoices 2=Time 3=Clients 4=Reports
  const tabs = [
    { label: 'Home',     icon: '◈' },
    { label: 'Invoices', icon: '✉' },
    { label: 'Time',     icon: '◷' },
    { label: 'Clients',  icon: '◉' },
    { label: 'Reports',  icon: '▦' },
  ];
  const nodes = [
    rect(0, H - 80, W, 80, P.surface, { stroke: P.border }),
    line(0, H - 80, W, H - 80, P.border),
  ];
  tabs.forEach((t, i) => {
    const tx = (W / tabs.length) * i + (W / tabs.length) / 2;
    const isActive = i === active;
    nodes.push(
      text(t.icon, tx - 10, H - 68, { size: 18, color: isActive ? P.accent : P.muted, align: 'CENTER', w: 20 }),
      text(t.label, tx - 24, H - 44, { size: 9, weight: isActive ? 600 : 400, color: isActive ? P.accent : P.muted, align: 'CENTER', w: 48 }),
    );
    if (isActive) {
      nodes.push(rect(tx - 16, H - 80, 32, 3, P.accent, { r: 1.5 }));
    }
  });
  return nodes;
}

function divider(y) {
  return line(16, y, W - 16, y, P.border, { opacity: 0.7 });
}

function badge(x, y, label, color) {
  const w = label.length * 5.8 + 14;
  return [
    rect(x, y, w, 18, color + '18', { r: 4, stroke: color + '44', strokeWeight: 0.5 }),
    text(label, x + 6, y + 3, { size: 8.5, weight: 600, color, w: w - 8, letterSpacing: 0.3 }),
  ];
}

function progressBar(x, y, w, pct, color, bg = P.border) {
  return [
    rect(x, y, w, 4, bg, { r: 2 }),
    rect(x, y, Math.round(w * pct), 4, color, { r: 2 }),
  ];
}

function sectionLabel(label, y) {
  return text(label.toUpperCase(), 20, y, {
    size: 9, weight: 700, color: P.muted, letterSpacing: 1.4, w: 200,
  });
}

// Mini bar chart
function miniBarChart(x, y, w, h, vals, color) {
  const nodes = [];
  const max = Math.max(...vals);
  const barW = Math.floor(w / vals.length) - 2;
  vals.forEach((v, i) => {
    const bh = Math.round((v / max) * h);
    nodes.push(rect(x + i * (barW + 2), y + h - bh, barW, bh, color, { r: 1.5, opacity: 0.15 + (v / max) * 0.75 }));
  });
  return nodes;
}

// Donut ring (simplified as arc segments via overlapping circles)
function donutRing(cx, cy, r, segments) {
  const nodes = [];
  // outer circle
  nodes.push(circle(cx, cy, r, P.border));
  // inner cutout
  nodes.push(circle(cx, cy, r - 10, P.bg));
  // coloured segments as small circles around the ring
  let angle = -Math.PI / 2;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  segments.forEach(seg => {
    const sweep = (seg.value / total) * Math.PI * 2;
    const mid = angle + sweep / 2;
    const dotX = cx + Math.cos(mid) * (r - 5);
    const dotY = cy + Math.sin(mid) * (r - 5);
    nodes.push(circle(dotX, dotY, 4, seg.color));
    angle += sweep;
  });
  return nodes;
}

// ─── SCREEN 1: Overview ───────────────────────────────────────────────────────
function screenOverview() {
  const nodes = [
    rect(0, 0, W, H, P.bg),
    ...statusBar(''),
  ];

  // ─ Header greeting ─
  nodes.push(text('Good morning,', 20, 50, { size: 13, color: P.muted, w: 200, italic: true, font: FONTS.serif }));
  nodes.push(text('Naomi.', 20, 70, { size: 34, weight: 700, color: P.text, font: FONTS.serif, w: 250, letterSpacing: -0.5 }));

  // ─ Period selector ─
  const periods = ['Week', 'Month', 'Quarter', 'Year'];
  periods.forEach((p, i) => {
    const px = 20 + i * 82;
    const isActive = i === 1;
    nodes.push(rect(px, 114, 74, 26, isActive ? P.accent : P.surface, { r: 13, stroke: isActive ? P.accent : P.border }));
    nodes.push(text(p, px, 120, { size: 11, weight: isActive ? 600 : 400, color: isActive ? '#FFFFFF' : P.muted, align: 'CENTER', w: 74 }));
  });

  // ─ Hero earnings card ─
  nodes.push(rect(20, 152, W - 40, 100, P.surface, { r: 14, stroke: P.border, shadow: true }));
  nodes.push(text('Total earned', 32, 164, { size: 10, weight: 500, color: P.muted, letterSpacing: 0.5, w: 140 }));
  nodes.push(text('$14,820', 32, 180, { size: 32, weight: 700, color: P.text, font: FONTS.serif, letterSpacing: -0.5, w: 200 }));
  nodes.push(text('March 2026', 32, 218, { size: 10, color: P.muted, w: 100 }));
  // trend chip
  nodes.push(rect(W - 84, 164, 52, 22, P.green + '18', { r: 11, stroke: P.green + '44' }));
  nodes.push(text('↑ 18%', W - 80, 169, { size: 10, weight: 600, color: P.green, w: 46 }));
  // mini sparkline bars
  const weeklyEarnings = [3800, 2100, 4200, 3500, 5100, 2900, 4820];
  nodes.push(...miniBarChart(32, 222, W - 72, 24, weeklyEarnings, P.accent));

  // ─ Quick stats row ─
  const stats = [
    { label: 'Invoiced',  value: '$4,200',  color: P.purple, sub: '3 pending' },
    { label: 'Overdue',   value: '$1,400',  color: P.red,    sub: '2 invoices' },
    { label: 'This week', value: '24h',     color: P.accent, sub: 'billable' },
  ];
  stats.forEach((s, i) => {
    const sx = 20 + i * ((W - 40) / 3);
    const sw = (W - 40) / 3 - 8;
    nodes.push(rect(sx, 266, sw, 68, P.surface, { r: 12, stroke: P.border }));
    nodes.push(text(s.label, sx + 10, 276, { size: 9, color: P.muted, w: sw - 16 }));
    nodes.push(text(s.value, sx + 10, 290, { size: 17, weight: 700, color: s.color, font: FONTS.serif, w: sw - 16 }));
    nodes.push(text(s.sub, sx + 10, 313, { size: 8.5, color: P.muted, w: sw - 16 }));
  });

  // ─ Recent invoices ─
  nodes.push(sectionLabel('Recent Invoices', 350));
  nodes.push(text('See all', W - 52, 350, { size: 11, weight: 500, color: P.accent, w: 40 }));

  const invoices = [
    { client: 'Horizon Studio',  amount: '$2,400', status: 'Paid',    statusC: P.green  },
    { client: 'Luminary Labs',   amount: '$1,800', status: 'Sent',    statusC: P.purple },
    { client: 'Cedar & Grain',   amount: '$1,400', status: 'Overdue', statusC: P.red    },
  ];
  invoices.forEach((inv, i) => {
    const iy = 370 + i * 68;
    nodes.push(rect(20, iy, W - 40, 60, P.surface, { r: 10, stroke: P.border }));
    nodes.push(circle(38, iy + 20, 10, P.surface2, { stroke: P.border }));
    nodes.push(text(inv.client.charAt(0), 33, iy + 13, { size: 11, weight: 700, color: P.text, w: 14 }));
    nodes.push(text(inv.client, 54, iy + 10, { size: 12, weight: 600, color: P.text, w: 180 }));
    nodes.push(...badge(54, iy + 30, inv.status, inv.statusC));
    nodes.push(text(inv.amount, W - 76, iy + 10, { size: 14, weight: 700, color: P.text, align: 'RIGHT', w: 60, font: FONTS.serif }));
    nodes.push(text('Due Mar ' + (12 + i * 5), W - 76, iy + 32, { size: 9, color: P.muted, align: 'RIGHT', w: 60 }));
  });

  nodes.push(...tabBar(0));
  return { id: 'screen-overview', name: 'Overview', nodes };
}

// ─── SCREEN 2: Invoices ───────────────────────────────────────────────────────
function screenInvoices() {
  const nodes = [
    rect(0, 0, W, H, P.bg),
    ...statusBar('Invoices'),
  ];

  // Header + new button
  nodes.push(text('Invoices', 20, 52, { size: 26, weight: 700, color: P.text, font: FONTS.serif, letterSpacing: -0.3, w: 220 }));
  nodes.push(rect(W - 88, 52, 72, 30, P.accent, { r: 15 }));
  nodes.push(text('+ New', W - 80, 60, { size: 12, weight: 600, color: '#FFFFFF', w: 56 }));

  // Status filter tabs
  const tabs = ['All', 'Draft', 'Sent', 'Paid', 'Overdue'];
  tabs.forEach((t, i) => {
    const isActive = i === 0;
    const tw = t.length * 7 + 20;
    const tx = 20 + [0, 32, 66, 100, 134][i] * 1.4;
    nodes.push(rect(tx, 92, tw, 24, isActive ? P.text : P.surface, { r: 12, stroke: P.border }));
    nodes.push(text(t, tx + tw / 2 - t.length * 3, 98, { size: 10, weight: isActive ? 600 : 400, color: isActive ? '#FFFFFF' : P.muted, w: tw }));
  });

  // Invoice list
  const invs = [
    { id: '#INV-047', client: 'Horizon Studio',  amount: '$2,400', status: 'Paid',    statusC: P.green,  date: 'Mar 18',  due: 'Mar 15', pct: 1    },
    { id: '#INV-046', client: 'Luminary Labs',   amount: '$1,800', status: 'Sent',    statusC: P.purple, date: 'Mar 12',  due: 'Apr 1',  pct: 0    },
    { id: '#INV-045', client: 'Cedar & Grain',   amount: '$1,400', status: 'Overdue', statusC: P.red,    date: 'Feb 28',  due: 'Mar 14', pct: 0    },
    { id: '#INV-044', client: 'Moonveil Design', amount: '$3,200', status: 'Paid',    statusC: P.green,  date: 'Feb 22',  due: 'Mar 5',  pct: 1    },
    { id: '#INV-043', client: 'Ember Media',     amount: '$900',   status: 'Draft',   statusC: P.muted,  date: 'Mar 20',  due: '—',      pct: null },
    { id: '#INV-042', client: 'Kova Digital',    amount: '$4,500', status: 'Sent',    statusC: P.purple, date: 'Mar 8',   due: 'Apr 8',  pct: 0    },
  ];

  invs.forEach((inv, i) => {
    const iy = 128 + i * 90;
    nodes.push(rect(20, iy, W - 40, 82, P.surface, { r: 12, stroke: P.border, shadow: true }));

    // ID + date
    nodes.push(text(inv.id, 32, iy + 10, { size: 10, color: P.muted, font: FONTS.mono, w: 100 }));
    nodes.push(text(inv.date, W - 72, iy + 10, { size: 10, color: P.muted, w: 56, align: 'RIGHT' }));

    // Client
    nodes.push(text(inv.client, 32, iy + 26, { size: 13, weight: 600, color: P.text, w: 200 }));

    // Amount
    nodes.push(text(inv.amount, W - 72, iy + 24, { size: 16, weight: 700, color: P.text, align: 'RIGHT', w: 60, font: FONTS.serif }));

    // Status badge + due date
    nodes.push(...badge(32, iy + 52, inv.status, inv.statusC));
    nodes.push(text(inv.pct === null ? 'Draft' : `Due ${inv.due}`, 32 + inv.status.length * 5.8 + 22, iy + 55, { size: 9, color: P.muted, w: 100 }));

    // Progress bar (for paid=full, sent=partial, overdue=empty)
    if (inv.pct !== null) {
      nodes.push(...progressBar(32, iy + 72, W - 72, inv.pct, inv.statusC));
    }
  });

  nodes.push(...tabBar(1));
  return { id: 'screen-invoices', name: 'Invoices', nodes };
}

// ─── SCREEN 3: Time Tracker ───────────────────────────────────────────────────
function screenTime() {
  const nodes = [
    rect(0, 0, W, H, P.bg),
    ...statusBar('Time'),
  ];

  nodes.push(text('Time', 20, 52, { size: 26, weight: 700, color: P.text, font: FONTS.serif, letterSpacing: -0.3, w: 160 }));
  nodes.push(text('Week of Mar 17', 20, 84, { size: 11, color: P.muted, italic: true, font: FONTS.serif, w: 200 }));

  // Weekly total hero
  nodes.push(rect(20, 104, W - 40, 88, P.accent, { r: 14, shadow: true }));
  nodes.push(text('This week', 32, 116, { size: 10, color: '#FFFFFF', opacity: 0.7, letterSpacing: 0.5, w: 150 }));
  nodes.push(text('24h 15m', 32, 132, { size: 30, weight: 700, color: '#FFFFFF', font: FONTS.serif, letterSpacing: -0.5, w: 200 }));
  nodes.push(text('billable', 32, 168, { size: 10, color: '#FFFFFF', opacity: 0.65, w: 60 }));
  nodes.push(text('+ 3h 30m', W - 92, 132, { size: 15, weight: 600, color: '#FFFFFF', opacity: 0.85, w: 80, align: 'RIGHT' }));
  nodes.push(text('vs last week', W - 92, 152, { size: 9, color: '#FFFFFF', opacity: 0.55, w: 80, align: 'RIGHT' }));

  // Day breakdown bars
  nodes.push(sectionLabel('Daily breakdown', 206));
  const days = [
    { day: 'Mon', hours: 6.5, billed: 6.0 },
    { day: 'Tue', hours: 4.0, billed: 3.5 },
    { day: 'Wed', hours: 7.0, billed: 7.0 },
    { day: 'Thu', hours: 3.0, billed: 2.5 },
    { day: 'Fri', hours: 5.5, billed: 5.0 },
    { day: 'Sat', hours: 1.5, billed: 0.0 },
    { day: 'Sun', hours: 0.0, billed: 0.0 },
  ];
  const maxH = 7;
  const barAreaH = 64;
  const barW = Math.floor((W - 48) / days.length) - 4;
  days.forEach((d, i) => {
    const bx = 24 + i * ((W - 48) / days.length);
    const totalH = Math.round((d.hours / maxH) * barAreaH);
    const billedH = Math.round((d.billed / maxH) * barAreaH);
    const isToday = i === 3;
    nodes.push(rect(bx, 224 + barAreaH - totalH, barW, totalH, P.border, { r: 3 }));
    if (billedH > 0) nodes.push(rect(bx, 224 + barAreaH - billedH, barW, billedH, isToday ? P.accent : P.accent + 'BB', { r: 3 }));
    nodes.push(text(d.day, bx, 292, { size: 8.5, color: isToday ? P.accent : P.muted, w: barW + 4, align: 'CENTER' }));
    if (d.hours > 0) nodes.push(text(d.hours + 'h', bx, 224 + barAreaH - totalH - 14, { size: 8, weight: 600, color: P.text, w: barW + 4, align: 'CENTER' }));
  });

  // Project breakdown
  nodes.push(sectionLabel('By project', 316));
  const projects = [
    { name: 'Horizon Studio',  color: P.accent,  hours: 11.5, pct: 0.47, rate: '$120/h' },
    { name: 'Luminary Labs',   color: P.purple,  hours: 6.25, pct: 0.26, rate: '$140/h' },
    { name: 'Cedar & Grain',   color: P.green,   hours: 4.50, pct: 0.19, rate: '$95/h'  },
    { name: 'Moonveil Design', color: P.accent2, hours: 2.00, pct: 0.08, rate: '$110/h' },
  ];
  projects.forEach((p, i) => {
    const py = 334 + i * 76;
    nodes.push(rect(20, py, W - 40, 68, P.surface, { r: 10, stroke: P.border }));
    nodes.push(circle(38, py + 20, 8, p.color, { opacity: 0.25 }));
    nodes.push(circle(38, py + 20, 4, p.color));
    nodes.push(text(p.name, 52, py + 12, { size: 12, weight: 600, color: P.text, w: 200 }));
    nodes.push(text(p.rate, W - 74, py + 12, { size: 10, color: P.muted, w: 58, align: 'RIGHT' }));
    nodes.push(text(p.hours + 'h', 52, py + 30, { size: 16, weight: 700, color: p.color, font: FONTS.serif, w: 80 }));
    nodes.push(...progressBar(52, py + 52, W - 92, p.pct, p.color));
    nodes.push(text(Math.round(p.pct * 100) + '%', W - 74, py + 48, { size: 9, color: P.muted, w: 40, align: 'RIGHT' }));
  });

  // Timer FAB
  nodes.push(circle(W - 36, H - 100, 26, P.accent, { shadow: true }));
  nodes.push(text('▶', W - 49, H - 113, { size: 16, color: '#FFFFFF', w: 26, align: 'CENTER' }));

  nodes.push(...tabBar(2));
  return { id: 'screen-time', name: 'Time', nodes };
}

// ─── SCREEN 4: Clients ────────────────────────────────────────────────────────
function screenClients() {
  const nodes = [
    rect(0, 0, W, H, P.bg),
    ...statusBar('Clients'),
  ];

  nodes.push(text('Clients', 20, 52, { size: 26, weight: 700, color: P.text, font: FONTS.serif, letterSpacing: -0.3, w: 200 }));
  nodes.push(rect(W - 88, 52, 72, 30, P.surface, { r: 15, stroke: P.border }));
  nodes.push(text('+ Add', W - 80, 60, { size: 12, weight: 500, color: P.text, w: 56 }));

  // Search bar
  nodes.push(rect(20, 92, W - 40, 36, P.surface, { r: 10, stroke: P.border }));
  nodes.push(text('⌕', 34, 101, { size: 14, color: P.muted, w: 20 }));
  nodes.push(text('Search clients…', 56, 103, { size: 12, color: P.muted, w: 200, italic: true, font: FONTS.serif }));

  // Summary strip
  const summaries = [
    { label: 'Active',  val: '8',       c: P.green  },
    { label: 'Paused',  val: '2',       c: P.accent2 },
    { label: 'Total\nearned', val: '$41K',  c: P.text },
    { label: 'Avg rate', val: '$118/h', c: P.text },
  ];
  summaries.forEach((s, i) => {
    const sx = 20 + i * ((W - 40) / 4);
    nodes.push(text(s.val, sx + 4, 138, { size: 16, weight: 700, color: s.c, font: FONTS.serif, w: 80 }));
    nodes.push(text(s.label, sx + 4, 160, { size: 8.5, color: P.muted, w: 70 }));
  });
  nodes.push(line(20, 182, W - 20, 182, P.border));

  // Client cards
  const clients = [
    { name: 'Horizon Studio',  role: 'Brand & Web Design',  rate: '$120/h', status: 'Active',  revenue: '$14.2K', projects: 3, health: 0.92 },
    { name: 'Luminary Labs',   role: 'Product UI / UX',     rate: '$140/h', status: 'Active',  revenue: '$8.7K',  projects: 2, health: 0.78 },
    { name: 'Cedar & Grain',   role: 'Identity & Print',    rate: '$95/h',  status: 'Overdue', revenue: '$5.1K',  projects: 1, health: 0.45 },
    { name: 'Moonveil Design', role: 'Art Direction',       rate: '$110/h', status: 'Active',  revenue: '$7.6K',  projects: 4, health: 0.88 },
    { name: 'Ember Media',     role: 'Motion & Social',     rate: '$105/h', status: 'Paused',  revenue: '$3.2K',  projects: 1, health: 0.60 },
  ];

  clients.forEach((c, i) => {
    const cy = 194 + i * 94;
    const healthC = c.health > 0.8 ? P.green : c.health > 0.6 ? P.accent2 : P.red;
    const statusC = c.status === 'Active' ? P.green : c.status === 'Paused' ? P.accent2 : P.red;
    nodes.push(rect(20, cy, W - 40, 86, P.surface, { r: 12, stroke: P.border, shadow: true }));
    // Avatar
    nodes.push(circle(42, cy + 24, 16, c.name.charCodeAt(0) % 2 === 0 ? P.accent2 + '40' : P.purple + '30', { stroke: P.border }));
    nodes.push(text(c.name.charAt(0), 36, cy + 16, { size: 14, weight: 700, color: P.text, w: 20 }));
    // Info
    nodes.push(text(c.name, 66, cy + 10, { size: 13, weight: 600, color: P.text, w: 200 }));
    nodes.push(text(c.role, 66, cy + 28, { size: 10, color: P.muted, italic: true, font: FONTS.serif, w: 180 }));
    // Revenue + rate
    nodes.push(text(c.revenue, W - 74, cy + 10, { size: 14, weight: 700, color: P.text, align: 'RIGHT', w: 58, font: FONTS.serif }));
    nodes.push(text(c.rate, W - 74, cy + 28, { size: 9, color: P.muted, align: 'RIGHT', w: 58 }));
    // Status + health
    nodes.push(...badge(66, cy + 52, c.status, statusC));
    nodes.push(text(c.projects + ' projects', 66 + c.status.length * 5.8 + 20, cy + 55, { size: 9, color: P.muted, w: 80 }));
    // Health bar
    nodes.push(sectionLabel === null ? null : null); // placeholder
    nodes.push(...progressBar(W - 90, cy + 56, 70, c.health, healthC));
    nodes.push(text(Math.round(c.health * 100) + '%', W - 74, cy + 46, { size: 8, color: healthC, w: 40, align: 'RIGHT' }));
  });

  nodes.push(...tabBar(3));
  return { id: 'screen-clients', name: 'Clients', nodes };
}

// ─── SCREEN 5: Reports ────────────────────────────────────────────────────────
function screenReports() {
  const nodes = [
    rect(0, 0, W, H, P.bg),
    ...statusBar('Reports'),
  ];

  nodes.push(text('Reports', 20, 52, { size: 26, weight: 700, color: P.text, font: FONTS.serif, letterSpacing: -0.3, w: 200 }));
  nodes.push(text('March 2026', 20, 84, { size: 12, color: P.muted, italic: true, font: FONTS.serif, w: 160 }));

  // Export button
  nodes.push(rect(W - 92, 52, 76, 30, P.surface, { r: 15, stroke: P.border }));
  nodes.push(text('↑ Export', W - 84, 60, { size: 11, weight: 500, color: P.text, w: 64 }));

  // Revenue vs Expenses donut area + legend
  nodes.push(rect(20, 108, W - 40, 148, P.surface, { r: 14, stroke: P.border, shadow: true }));
  nodes.push(text('Income breakdown', 32, 118, { size: 11, weight: 600, color: P.text, w: 180 }));

  const segments = [
    { label: 'Design', value: 8400, color: P.accent,  pct: '57%' },
    { label: 'Dev',    value: 4200, color: P.purple,  pct: '28%' },
    { label: 'Consult',value: 1820, color: P.green,   pct: '12%' },
    { label: 'Other',  value: 400,  color: P.accent2, pct: '3%'  },
  ];
  // Draw donut
  nodes.push(...donutRing(90, 190, 38, segments));
  nodes.push(text('$14,820', 68, 182, { size: 13, weight: 700, color: P.text, align: 'CENTER', w: 45, font: FONTS.serif }));
  nodes.push(text('total', 75, 198, { size: 8, color: P.muted, w: 30, align: 'CENTER' }));

  // Legend
  segments.forEach((s, i) => {
    const lx = 158;
    const ly = 134 + i * 26;
    nodes.push(circle(lx + 7, ly + 7, 5, s.color));
    nodes.push(text(s.label, lx + 18, ly, { size: 11, color: P.text, w: 70 }));
    nodes.push(text(s.pct, W - 52, ly, { size: 11, weight: 600, color: P.text, align: 'RIGHT', w: 36 }));
    nodes.push(text('$' + s.value.toLocaleString(), W - 52, ly + 14, { size: 9, color: P.muted, align: 'RIGHT', w: 36 }));
  });

  // Monthly trend bars
  nodes.push(sectionLabel('6-month trend', 270));
  const months = [
    { m: 'Oct', income: 8200, exp: 1200 },
    { m: 'Nov', income: 9800, exp: 1400 },
    { m: 'Dec', income: 7400, exp: 900  },
    { m: 'Jan', income: 11200, exp: 1600 },
    { m: 'Feb', income: 12600, exp: 1800 },
    { m: 'Mar', income: 14820, exp: 2100 },
  ];
  const maxInc = 16000;
  const bH = 56;
  const bW = Math.floor((W - 56) / months.length) - 4;
  months.forEach((m, i) => {
    const mx = 28 + i * ((W - 56) / months.length);
    const ih = Math.round((m.income / maxInc) * bH);
    const eh = Math.round((m.exp / maxInc) * bH);
    // Income bar
    nodes.push(rect(mx, 292 + bH - ih, bW - 4, ih, P.green, { r: 2, opacity: 0.7 }));
    // Expense bar (offset right, narrower)
    nodes.push(rect(mx + bW - 4, 292 + bH - eh, 5, eh, P.red, { r: 1, opacity: 0.7 }));
    nodes.push(text(m.m, mx, 352, { size: 8, color: P.muted, w: bW, align: 'CENTER' }));
  });

  // Legend for chart
  nodes.push(circle(28, 364, 5, P.green, { opacity: 0.7 }));
  nodes.push(text('Income', 38, 358, { size: 9, color: P.muted, w: 50 }));
  nodes.push(circle(96, 364, 5, P.red, { opacity: 0.7 }));
  nodes.push(text('Expenses', 106, 358, { size: 9, color: P.muted, w: 60 }));

  // KPI cards row
  const kpis = [
    { label: 'Net profit',    value: '$12,720', change: '+21%', c: P.green },
    { label: 'Avg invoice',   value: '$2,350',  change: '+8%',  c: P.green },
    { label: 'Longest streak', value: '18 days', change: 'paid on time', c: P.accent },
  ];
  kpis.forEach((k, i) => {
    const kx = 20 + i * ((W - 40) / 3);
    const kw = (W - 40) / 3 - 6;
    nodes.push(rect(kx, 380, kw, 68, P.surface, { r: 10, stroke: P.border }));
    nodes.push(text(k.label, kx + 8, 390, { size: 8.5, color: P.muted, w: kw - 12 }));
    nodes.push(text(k.value, kx + 8, 404, { size: 14, weight: 700, color: P.text, font: FONTS.serif, w: kw - 12 }));
    nodes.push(text(k.change, kx + 8, 425, { size: 9, weight: 600, color: k.c, w: kw - 12 }));
  });

  // Tax estimate callout
  nodes.push(rect(20, 460, W - 40, 54, P.accent + '14', { r: 12, stroke: P.accent + '55' }));
  nodes.push(text('Estimated tax (Q1)', 32, 470, { size: 11, weight: 600, color: P.accent, w: 200 }));
  nodes.push(text('$3,180 · set aside 25% of net', 32, 488, { size: 10, color: P.accent, opacity: 0.75, w: 280 }));
  nodes.push(text('→', W - 44, 476, { size: 14, color: P.accent, w: 20 }));

  nodes.push(...tabBar(4));
  return { id: 'screen-reports', name: 'Reports', nodes };
}

// ─── Build .pen file ──────────────────────────────────────────────────────────
function buildPen() {
  const screens = [
    screenOverview(),
    screenInvoices(),
    screenTime(),
    screenClients(),
    screenReports(),
  ];

  return {
    version: '2.8',
    meta: {
      name:        'HARVEST',
      tagline:     'Freelance Financial Intelligence',
      description: 'Financial clarity for independent creatives — invoices, time tracking, client health, and income analytics. Light theme: warm parchment, copper accent, editorial serif. Inspired by Midday.ai\'s one-person company aesthetic and Typeform\'s editorial off-white SaaS.',
      archetype:   'fintech',
      created:     new Date().toISOString(),
      author:      'RAM Design Heartbeat',
      tags:        ['light', 'fintech', 'freelance', 'dashboard', 'editorial', 'serif', 'warm'],
      theme: {
        mode: 'light',
        palette: {
          bg:      P.bg,
          surface: P.surface,
          text:    P.text,
          accent:  P.accent,
          accent2: P.accent2,
          muted:   P.muted,
        },
      },
      inspiration: 'Midday.ai (Dark Mode Design / land-book) for the one-person company editorial aesthetic; Typeform landing (land-book) for warm off-white canvas and serif + grotesque pairing; Evervault Customers page (Godly) for card-grid structure.',
    },
    canvas: { width: W, height: H, background: P.bg },
    screens: screens.map(s => ({
      id: s.id, name: s.name, width: W, height: H, nodes: s.nodes,
    })),
  };
}

const pen     = buildPen();
const outPath = path.join(__dirname, 'harvest.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ harvest.pen written (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
console.log(`  Screens: ${pen.screens.length}`);
pen.screens.forEach(s => console.log(`    · ${s.name}: ${s.nodes.length} nodes`));
