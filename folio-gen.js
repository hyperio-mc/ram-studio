'use strict';
// folio-gen.js
// FOLIO — Freelance time & billing app
// Light theme — warm parchment + amber + ink
// Inspired by: Midday.ai (featured on Dark Mode Design) — unified transaction dashboard pattern

const fs = require('fs');
const path = require('path');

// ── Palette ────────────────────────────────────────────────────────────────
const palette = {
  bg:       '#F7F3EC',   // warm parchment
  surface:  '#FFFDF8',   // near-white card
  border:   '#E8E0D2',   // soft warm border
  text:     '#1C1810',   // ink dark
  sub:      '#7A7060',   // warm muted
  accent:   '#C4622D',   // burnt amber / terracotta
  accent2:  '#2D6E4E',   // forest green (paid/positive)
  warning:  '#C49A2D',   // amber (pending)
  danger:   '#C43D2D',   // red (overdue)
  mono:     '#1C1810',   // same as text for mono numbers
};

// ── Helpers ────────────────────────────────────────────────────────────────
let idCounter = 1;
const uid = () => `el_${idCounter++}`;
const rect = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'rect', x, y, width: w, height: h, fill,
  cornerRadius: opts.r ?? 0,
  strokeColor: opts.stroke ?? 'transparent',
  strokeWidth: opts.sw ?? 0,
  ...opts,
});
const text = (x, y, content, size, color, opts = {}) => ({
  id: uid(), type: 'text', x, y, content,
  fontSize: size, fontFamily: opts.font ?? 'Inter',
  fontWeight: opts.weight ?? 400,
  color, textAlign: opts.align ?? 'left',
  width: opts.w ?? 320, height: opts.h ?? size + 6,
  ...opts,
});
const line = (x1, y1, x2, y2, color, sw = 1) => ({
  id: uid(), type: 'line',
  x1, y1, x2, y2,
  strokeColor: color, strokeWidth: sw,
});
const circle = (x, y, r, fill) => ({
  id: uid(), type: 'ellipse',
  x: x - r, y: y - r, width: r * 2, height: r * 2, fill,
  strokeColor: 'transparent', strokeWidth: 0,
});

// ── Status badge ───────────────────────────────────────────────────────────
const badge = (x, y, label, color, bgColor) => {
  const w = label.length * 7 + 16;
  return [
    rect(x, y, w, 20, bgColor, { r: 10 }),
    text(x + 8, y + 4, label, 10, color, { weight: 600, w: w - 16 }),
  ];
};

// ── Nav bar ────────────────────────────────────────────────────────────────
const navBar = (activeIdx) => {
  const items = [
    { label: 'Home',     icon: '⌂' },
    { label: 'Projects', icon: '◈' },
    { label: 'Time',     icon: '◷' },
    { label: 'Invoices', icon: '⊞' },
    { label: 'Insights', icon: '▲' },
  ];
  const els = [
    rect(0, 748, 390, 82, palette.surface, { stroke: palette.border, sw: 1 }),
  ];
  items.forEach((item, i) => {
    const x = 12 + i * 74;
    const isActive = i === activeIdx;
    const col = isActive ? palette.accent : palette.sub;
    if (isActive) {
      els.push(rect(x + 6, 752, 50, 3, palette.accent, { r: 2 }));
    }
    els.push(text(x + 18, 760, item.icon, 18, col, { align: 'center', w: 36 }));
    els.push(text(x + 2, 782, item.label, 9, col, { align: 'center', w: 62, weight: isActive ? 600 : 400 }));
  });
  return els;
};

// ── Status bar (top) ───────────────────────────────────────────────────────
const statusBar = () => [
  rect(0, 0, 390, 44, palette.bg),
  text(20, 14, '9:41', 15, palette.text, { weight: 600, w: 60 }),
  text(290, 14, '● ▲ 🔋', 12, palette.sub, { w: 80, align: 'right' }),
];

// ══════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Home
// ══════════════════════════════════════════════════════════════════════════
const screen1 = () => {
  const els = [
    rect(0, 0, 390, 830, palette.bg),
    ...statusBar(),
  ];

  // Header
  els.push(text(20, 54, 'Good morning,', 13, palette.sub));
  els.push(text(20, 72, 'Alex Rivera', 26, palette.text, { weight: 700 }));

  // Today card
  els.push(rect(20, 108, 350, 110, palette.surface, { r: 14, stroke: palette.border, sw: 1 }));
  els.push(text(36, 124, "TODAY'S SNAPSHOT", 9, palette.sub, { weight: 600 }));
  els.push(line(36, 138, 354, 138, palette.border));

  // Big earned value
  els.push(text(36, 146, '$1,240', 32, palette.text, { weight: 700, font: 'JetBrains Mono' }));
  els.push(text(36, 183, 'earned today', 11, palette.sub));
  // Hours and rate
  els.push(text(220, 146, '6.5 h', 22, palette.accent, { weight: 700, font: 'JetBrains Mono' }));
  els.push(text(220, 172, 'logged', 11, palette.sub));
  els.push(text(220, 188, '@ $190 / hr avg', 10, palette.sub));

  // Pending & overdue row
  els.push(rect(20, 228, 166, 72, palette.surface, { r: 12, stroke: palette.border, sw: 1 }));
  els.push(text(34, 242, 'PENDING', 9, palette.sub, { weight: 600 }));
  els.push(text(34, 257, '$5,840', 20, palette.warning, { weight: 700, font: 'JetBrains Mono' }));
  els.push(text(34, 281, '3 invoices', 11, palette.sub));

  els.push(rect(204, 228, 166, 72, palette.surface, { r: 12, stroke: palette.danger, sw: 1 }));
  els.push(text(218, 242, 'OVERDUE', 9, palette.danger, { weight: 600 }));
  els.push(text(218, 257, '$2,100', 20, palette.danger, { weight: 700, font: 'JetBrains Mono' }));
  els.push(text(218, 281, '1 invoice', 11, palette.sub));

  // Weekly bar chart
  els.push(rect(20, 314, 350, 130, palette.surface, { r: 14, stroke: palette.border, sw: 1 }));
  els.push(text(36, 328, 'THIS WEEK', 9, palette.sub, { weight: 600 }));
  els.push(text(270, 328, 'Mon → Fri', 10, palette.sub, { align: 'right', w: 80 }));

  const days = ['M', 'T', 'W', 'T', 'F'];
  const vals = [0.72, 0.95, 0.60, 1.0, 0.55];
  days.forEach((d, i) => {
    const bx = 44 + i * 63;
    const maxH = 60;
    const bh = Math.round(vals[i] * maxH);
    const by = 348 + (maxH - bh);
    const col = i === 3 ? palette.accent : palette.border;
    els.push(rect(bx, by, 34, bh, col, { r: 4 }));
    els.push(text(bx + 5, 416, d, 11, i === 3 ? palette.accent : palette.sub, { weight: i === 3 ? 700 : 400 }));
  });

  // Active projects quick list
  els.push(text(20, 462, 'Active Projects', 15, palette.text, { weight: 600 }));
  const projects = [
    { name: 'Nomad Studio', hours: '12.5h', color: '#4A90D9' },
    { name: 'Aria Health', hours: '8.0h',  color: '#2D6E4E' },
    { name: 'Hex Games',   hours: '3.0h',  color: '#C4622D' },
  ];
  projects.forEach((p, i) => {
    const py = 488 + i * 56;
    els.push(rect(20, py, 350, 46, palette.surface, { r: 10, stroke: palette.border, sw: 1 }));
    els.push(circle(44, py + 23, 8, p.color));
    els.push(text(60, py + 12, p.name, 14, palette.text, { weight: 500, w: 200 }));
    els.push(text(60, py + 29, 'this week', 11, palette.sub));
    els.push(text(310, py + 14, p.hours, 14, palette.text, { weight: 600, align: 'right', w: 52, font: 'JetBrains Mono' }));
  });

  els.push(...navBar(0));
  return els;
};

// ══════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Projects
// ══════════════════════════════════════════════════════════════════════════
const screen2 = () => {
  const els = [
    rect(0, 0, 390, 830, palette.bg),
    ...statusBar(),
  ];

  els.push(text(20, 54, 'Projects', 26, palette.text, { weight: 700 }));
  // New project button
  els.push(rect(304, 54, 66, 30, palette.accent, { r: 15 }));
  els.push(text(316, 62, '+ New', 12, '#FFF', { weight: 600, w: 42 }));

  // Filter tabs
  const tabs = ['Active', 'Archived', 'All'];
  tabs.forEach((t, i) => {
    const tx = 20 + i * 88;
    const isActive = i === 0;
    els.push(rect(tx, 96, 80, 30, isActive ? palette.accent : palette.surface, { r: 15, stroke: isActive ? 'transparent' : palette.border, sw: 1 }));
    els.push(text(tx + 10, 105, t, 12, isActive ? '#FFF' : palette.sub, { weight: isActive ? 600 : 400, w: 60, align: 'center' }));
  });

  // Project cards
  const projects = [
    { name: 'Nomad Studio', type: 'Brand Identity', rate: '$190/hr', hours: 42.5, budget: 12000, used: 0.71, color: '#4A90D9', due: 'Apr 15' },
    { name: 'Aria Health', type: 'UX Design', rate: '$160/hr', hours: 28.0, budget: 6400, used: 0.44, color: '#2D6E4E', due: 'Mar 31' },
    { name: 'Hex Games', type: 'Motion Graphics', rate: '$220/hr', hours: 8.5, budget: 4400, used: 0.19, color: '#C4622D', due: 'May 1' },
    { name: 'VaultFi', type: 'Web Design', rate: '$180/hr', hours: 64.0, budget: 11520, used: 1.0, color: '#7A50D0', due: '✓ Complete' },
  ];

  projects.forEach((p, i) => {
    const py = 140 + i * 138;
    els.push(rect(20, py, 350, 124, palette.surface, { r: 14, stroke: palette.border, sw: 1 }));
    // Color strip
    els.push(rect(20, py, 4, 124, p.color, { r: 2 }));
    // Name + type
    els.push(text(36, py + 14, p.name, 16, palette.text, { weight: 600, w: 200 }));
    els.push(text(36, py + 34, p.type, 11, palette.sub, { w: 150 }));
    // Due date
    els.push(text(280, py + 14, p.due, 11, p.due.startsWith('✓') ? palette.accent2 : palette.sub, { align: 'right', w: 80 }));
    // Rate + hours
    els.push(text(36, py + 56, p.rate, 13, palette.text, { weight: 500, font: 'JetBrains Mono' }));
    els.push(text(36, py + 73, `${p.hours}h logged`, 11, palette.sub));
    // Budget
    els.push(text(260, py + 56, `$${p.budget.toLocaleString()}`, 14, palette.text, { weight: 600, align: 'right', w: 80, font: 'JetBrains Mono' }));
    els.push(text(260, py + 73, 'budget', 11, palette.sub, { align: 'right', w: 80 }));
    // Progress bar
    const bw = 310;
    els.push(rect(36, py + 96, bw, 6, palette.border, { r: 3 }));
    els.push(rect(36, py + 96, Math.round(bw * Math.min(p.used, 1)), 6, p.used >= 1 ? palette.accent2 : palette.accent, { r: 3 }));
    els.push(text(36, py + 108, `${Math.round(p.used * 100)}% of budget used`, 10, palette.sub));
  });

  els.push(...navBar(1));
  return els;
};

// ══════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Time Log
// ══════════════════════════════════════════════════════════════════════════
const screen3 = () => {
  const els = [
    rect(0, 0, 390, 830, palette.bg),
    ...statusBar(),
  ];

  els.push(text(20, 54, 'Time Log', 26, palette.text, { weight: 700 }));
  els.push(text(20, 84, 'Thursday, March 26', 13, palette.sub));

  // Active timer card
  els.push(rect(20, 106, 350, 96, '#FFF8F3', { r: 14, stroke: palette.accent, sw: 1.5 }));
  els.push(text(36, 120, 'ACTIVE TIMER', 9, palette.accent, { weight: 700 }));
  els.push(text(36, 136, 'Nomad Studio — Brand Guidelines', 14, palette.text, { weight: 500, w: 240 }));
  // Big time display
  els.push(text(36, 154, '02:14:38', 28, palette.text, { weight: 700, font: 'JetBrains Mono' }));
  // Stop button
  els.push(rect(292, 148, 66, 36, palette.accent, { r: 18 }));
  els.push(text(302, 159, '◼ Stop', 12, '#FFF', { weight: 600, w: 46 }));

  // Today summary bar
  els.push(rect(20, 212, 350, 48, palette.surface, { r: 10, stroke: palette.border, sw: 1 }));
  els.push(text(36, 223, 'TODAY', 9, palette.sub, { weight: 600 }));
  els.push(text(36, 239, '4h 22m logged', 13, palette.text, { weight: 500 }));
  els.push(text(250, 223, 'EARNINGS', 9, palette.sub, { weight: 600, align: 'right', w: 110 }));
  els.push(text(250, 239, '$832.40', 13, palette.accent2, { weight: 600, align: 'right', w: 110, font: 'JetBrains Mono' }));

  // Entries
  els.push(text(20, 276, "Today's Entries", 15, palette.text, { weight: 600 }));

  const entries = [
    { project: 'Nomad Studio', task: 'Logo iteration feedback', start: '9:00', end: '10:30', dur: '1h 30m', amt: '$285' },
    { project: 'Aria Health',  task: 'Wireframe review session', start: '11:00', end: '12:15', dur: '1h 15m', amt: '$200' },
    { project: 'Aria Health',  task: 'Component library update', start: '2:00', end: '3:37', dur: '1h 37m', amt: '$258' },
    { project: 'Nomad Studio', task: 'Color system doc',         start: 'Active', end: '—', dur: '2h 14m', amt: '...' },
  ];

  entries.forEach((e, i) => {
    const ey = 300 + i * 56;
    const isActive = e.start === 'Active';
    els.push(rect(20, ey, 350, 46, isActive ? '#FFF8F3' : palette.surface, { r: 10, stroke: isActive ? palette.accent : palette.border, sw: 1 }));
    els.push(text(36, ey + 10, e.task, 13, palette.text, { weight: 500, w: 220 }));
    els.push(text(36, ey + 27, e.project, 10, palette.sub, { w: 150 }));
    // Time range
    els.push(text(310, ey + 10, e.dur, 12, isActive ? palette.accent : palette.text, { weight: isActive ? 700 : 500, align: 'right', w: 70, font: 'JetBrains Mono' }));
    els.push(text(310, ey + 27, isActive ? 'running' : `${e.start}–${e.end}`, 10, isActive ? palette.accent : palette.sub, { align: 'right', w: 70 }));
  });

  // New entry button
  els.push(rect(20, 528, 350, 46, 'transparent', { r: 10, stroke: palette.border, sw: 1.5 }));
  els.push(text(140, 541, '+ Log time manually', 14, palette.sub, { align: 'center', w: 170 }));

  els.push(...navBar(2));
  return els;
};

// ══════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Invoices
// ══════════════════════════════════════════════════════════════════════════
const screen4 = () => {
  const els = [
    rect(0, 0, 390, 830, palette.bg),
    ...statusBar(),
  ];

  els.push(text(20, 54, 'Invoices', 26, palette.text, { weight: 700 }));
  els.push(rect(304, 54, 66, 30, palette.accent, { r: 15 }));
  els.push(text(312, 62, '+ Draft', 12, '#FFF', { weight: 600, w: 50 }));

  // Summary strip
  els.push(rect(20, 96, 350, 60, palette.surface, { r: 12, stroke: palette.border, sw: 1 }));
  const sumItems = [
    { label: 'Draft', val: '$3,200', col: palette.sub },
    { label: 'Sent', val: '$5,840', col: palette.warning },
    { label: 'Overdue', val: '$2,100', col: palette.danger },
    { label: 'Paid', val: '$28,400', col: palette.accent2 },
  ];
  sumItems.forEach((s, i) => {
    const sx = 36 + i * 82;
    if (i > 0) els.push(line(36 + i * 82 - 6, 106, 36 + i * 82 - 6, 146, palette.border));
    els.push(text(sx, 108, s.label, 9, palette.sub, { weight: 500 }));
    els.push(text(sx, 122, s.val, 12, s.col, { weight: 700, font: 'JetBrains Mono', w: 70 }));
  });

  // Filter
  const statuses = ['All', 'Sent', 'Overdue', 'Paid', 'Draft'];
  statuses.forEach((s, i) => {
    const tx = 20 + i * 70;
    const isActive = s === 'All';
    els.push(rect(tx, 170, 62, 26, isActive ? palette.accent : palette.surface, { r: 13, stroke: isActive ? 'transparent' : palette.border, sw: 1 }));
    els.push(text(tx + 8, 179, s, 11, isActive ? '#FFF' : palette.sub, { weight: isActive ? 600 : 400, w: 46, align: 'center' }));
  });

  // Invoice list
  const invoices = [
    { id: 'INV-048', client: 'Aria Health', desc: 'UX Design — March', amount: '$4,480', status: 'Overdue', date: 'Due Mar 15' },
    { id: 'INV-049', client: 'Nomad Studio', desc: 'Brand Identity Phase 2', amount: '$3,200', status: 'Sent', date: 'Due Apr 1' },
    { id: 'INV-050', client: 'Hex Games', desc: 'Motion Package #1', amount: '$1,870', status: 'Sent', date: 'Due Apr 10' },
    { id: 'INV-047', client: 'VaultFi', desc: 'Web Design — Final', amount: '$8,100', status: 'Paid', date: 'Paid Mar 12' },
    { id: 'INV-046', client: 'Nomad Studio', desc: 'Brand Identity Phase 1', amount: '$6,200', status: 'Paid', date: 'Paid Feb 28' },
    { id: 'INV-051', client: 'Hex Games', desc: 'Motion Package #2', amount: '$2,200', status: 'Draft', date: 'Not sent' },
  ];

  const statusColors = {
    Overdue: { text: palette.danger, bg: '#FEF0EE' },
    Sent: { text: palette.warning, bg: '#FEF8E8' },
    Paid: { text: palette.accent2, bg: '#EDF7F2' },
    Draft: { text: palette.sub, bg: palette.border },
  };

  invoices.forEach((inv, i) => {
    const iy = 210 + i * 72;
    const sc = statusColors[inv.status];
    els.push(rect(20, iy, 350, 62, palette.surface, { r: 12, stroke: inv.status === 'Overdue' ? palette.danger : palette.border, sw: inv.status === 'Overdue' ? 1.5 : 1 }));
    els.push(text(36, iy + 10, inv.id, 10, palette.sub, { weight: 600, font: 'JetBrains Mono' }));
    els.push(text(36, iy + 26, inv.client, 15, palette.text, { weight: 600, w: 180 }));
    els.push(text(36, iy + 44, inv.desc, 11, palette.sub, { w: 200 }));
    // Amount
    els.push(text(310, iy + 10, inv.amount, 14, palette.text, { weight: 700, align: 'right', w: 80, font: 'JetBrains Mono' }));
    // Status badge
    const bw = inv.status.length * 7 + 14;
    els.push(rect(370 - bw, iy + 29, bw, 18, sc.bg, { r: 9 }));
    els.push(text(370 - bw + 7, iy + 33, inv.status, 9, sc.text, { weight: 600, w: bw - 14 }));
    els.push(text(310, iy + 48, inv.date, 10, palette.sub, { align: 'right', w: 80 }));
  });

  els.push(...navBar(3));
  return els;
};

// ══════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Insights
// ══════════════════════════════════════════════════════════════════════════
const screen5 = () => {
  const els = [
    rect(0, 0, 390, 830, palette.bg),
    ...statusBar(),
  ];

  els.push(text(20, 54, 'Insights', 26, palette.text, { weight: 700 }));

  // Period selector
  const periods = ['Week', 'Month', 'Quarter', 'Year'];
  periods.forEach((p, i) => {
    const px = 20 + i * 86;
    const isActive = p === 'Month';
    els.push(rect(px, 92, 78, 28, isActive ? palette.accent : palette.surface, { r: 14, stroke: isActive ? 'transparent' : palette.border, sw: 1 }));
    els.push(text(px + 10, 101, p, 12, isActive ? '#FFF' : palette.sub, { weight: isActive ? 600 : 400, w: 58, align: 'center' }));
  });

  // Big monthly total
  els.push(rect(20, 132, 350, 80, palette.surface, { r: 14, stroke: palette.border, sw: 1 }));
  els.push(text(36, 148, 'MARCH 2026', 9, palette.sub, { weight: 600 }));
  els.push(text(36, 164, '$18,620', 34, palette.text, { weight: 700, font: 'JetBrains Mono' }));
  els.push(text(36, 202, '↑ 12.4% vs February', 12, palette.accent2, { weight: 500 }));
  els.push(text(280, 164, '124.5 h', 18, palette.accent, { weight: 700, font: 'JetBrains Mono', align: 'right', w: 90 }));
  els.push(text(280, 187, 'logged', 11, palette.sub, { align: 'right', w: 90 }));

  // Monthly bar chart — last 6 months
  els.push(rect(20, 224, 350, 140, palette.surface, { r: 14, stroke: palette.border, sw: 1 }));
  els.push(text(36, 238, 'MONTHLY EARNINGS', 9, palette.sub, { weight: 600 }));

  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const monthVals = [0.62, 0.78, 0.54, 0.88, 0.75, 1.0];
  months.forEach((m, i) => {
    const bx = 36 + i * 52;
    const maxH = 72;
    const bh = Math.round(monthVals[i] * maxH);
    const by = 256 + (maxH - bh);
    const isLast = i === months.length - 1;
    els.push(rect(bx, by, 36, bh, isLast ? palette.accent : palette.border, { r: 4 }));
    els.push(text(bx + 4, 336, m, 10, isLast ? palette.accent : palette.sub, { weight: isLast ? 700 : 400, w: 28 }));
  });

  // Client breakdown
  els.push(text(20, 380, 'Revenue by Client', 15, palette.text, { weight: 600 }));

  const clients = [
    { name: 'Nomad Studio', pct: 0.46, amt: '$8,565', color: '#4A90D9' },
    { name: 'VaultFi',      pct: 0.29, amt: '$5,400', color: '#7A50D0' },
    { name: 'Aria Health',  pct: 0.18, amt: '$3,352', color: '#2D6E4E' },
    { name: 'Hex Games',    pct: 0.07, amt: '$1,303', color: '#C4622D' },
  ];
  clients.forEach((c, i) => {
    const cy = 404 + i * 56;
    els.push(rect(20, cy, 350, 46, palette.surface, { r: 10, stroke: palette.border, sw: 1 }));
    // Color dot
    els.push(circle(38, cy + 23, 7, c.color));
    els.push(text(52, cy + 12, c.name, 14, palette.text, { weight: 500, w: 160 }));
    // Bar
    const bw = 200;
    els.push(rect(52, cy + 30, bw, 4, palette.border, { r: 2 }));
    els.push(rect(52, cy + 30, Math.round(bw * c.pct), 4, c.color, { r: 2 }));
    els.push(text(310, cy + 12, c.amt, 13, palette.text, { weight: 600, align: 'right', w: 70, font: 'JetBrains Mono' }));
    els.push(text(310, cy + 30, `${Math.round(c.pct * 100)}%`, 10, palette.sub, { align: 'right', w: 70 }));
  });

  // Avg hourly rate tile
  els.push(rect(20, 634, 166, 72, palette.surface, { r: 12, stroke: palette.border, sw: 1 }));
  els.push(text(34, 648, 'AVG HOURLY', 9, palette.sub, { weight: 600 }));
  els.push(text(34, 663, '$149', 22, palette.text, { weight: 700, font: 'JetBrains Mono' }));
  els.push(text(34, 688, '↑ $8 vs last month', 10, palette.accent2));

  els.push(rect(204, 634, 166, 72, palette.surface, { r: 12, stroke: palette.border, sw: 1 }));
  els.push(text(218, 648, 'UTILIZATION', 9, palette.sub, { weight: 600 }));
  els.push(text(218, 663, '76%', 22, palette.accent, { weight: 700, font: 'JetBrains Mono' }));
  els.push(text(218, 688, 'of target hours', 10, palette.sub));

  els.push(...navBar(4));
  return els;
};

// ══════════════════════════════════════════════════════════════════════════
// SCREEN 6 — Invoice Detail
// ══════════════════════════════════════════════════════════════════════════
const screen6 = () => {
  const els = [
    rect(0, 0, 390, 830, palette.bg),
    ...statusBar(),
  ];

  // Back nav
  els.push(text(20, 56, '← Invoices', 14, palette.sub, { weight: 500 }));

  // Invoice header card
  els.push(rect(20, 84, 350, 108, palette.surface, { r: 14, stroke: palette.danger, sw: 1.5 }));
  els.push(text(36, 98, 'INV-048', 12, palette.sub, { weight: 600, font: 'JetBrains Mono' }));
  // OVERDUE badge
  els.push(...badge(280, 96, 'OVERDUE', palette.danger, '#FEF0EE'));
  els.push(text(36, 116, 'Aria Health', 22, palette.text, { weight: 700, w: 220 }));
  els.push(text(36, 142, 'UX Design — March 2026', 13, palette.sub, { w: 220 }));
  els.push(text(36, 162, '$4,480.00', 24, palette.danger, { weight: 700, font: 'JetBrains Mono' }));
  els.push(text(220, 162, 'Due Mar 15, 2026', 12, palette.sub, { w: 140 }));

  // Line items
  els.push(text(20, 206, 'Line Items', 15, palette.text, { weight: 600 }));
  els.push(line(20, 226, 370, 226, palette.border));

  const lineItems = [
    { desc: 'User Research & Interviews', qty: '8h', rate: '$160', total: '$1,280' },
    { desc: 'Wireframing — Patient Portal', qty: '10h', rate: '$160', total: '$1,600' },
    { desc: 'Component Library Build', qty: '6h', rate: '$160', total: '$960' },
    { desc: 'Prototype & Handoff', qty: '4h', rate: '$160', total: '$640' },
  ];

  // Column headers
  els.push(text(20, 232, 'Description', 10, palette.sub, { weight: 600, w: 180 }));
  els.push(text(198, 232, 'Qty', 10, palette.sub, { weight: 600, align: 'center', w: 40 }));
  els.push(text(244, 232, 'Rate', 10, palette.sub, { weight: 600, align: 'right', w: 54 }));
  els.push(text(300, 232, 'Total', 10, palette.sub, { weight: 600, align: 'right', w: 70 }));
  els.push(line(20, 245, 370, 245, palette.border));

  lineItems.forEach((li, i) => {
    const ly = 254 + i * 40;
    els.push(text(20, ly, li.desc, 13, palette.text, { weight: 400, w: 175 }));
    els.push(text(198, ly, li.qty, 13, palette.sub, { align: 'center', w: 40 }));
    els.push(text(244, ly, li.rate, 13, palette.sub, { align: 'right', w: 54, font: 'JetBrains Mono' }));
    els.push(text(300, ly, li.total, 13, palette.text, { weight: 500, align: 'right', w: 70, font: 'JetBrains Mono' }));
    els.push(line(20, ly + 32, 370, ly + 32, palette.border));
  });

  const subtotalY = 420;
  els.push(text(240, subtotalY, 'Subtotal', 12, palette.sub, { align: 'right', w: 60 }));
  els.push(text(300, subtotalY, '$4,480.00', 12, palette.text, { weight: 500, align: 'right', w: 70, font: 'JetBrains Mono' }));
  els.push(text(240, subtotalY + 18, 'Tax (0%)', 12, palette.sub, { align: 'right', w: 60 }));
  els.push(text(300, subtotalY + 18, '$0.00', 12, palette.sub, { align: 'right', w: 70, font: 'JetBrains Mono' }));
  els.push(line(240, subtotalY + 40, 370, subtotalY + 40, palette.border));
  els.push(text(240, subtotalY + 48, 'Total', 14, palette.text, { weight: 700, align: 'right', w: 60 }));
  els.push(text(300, subtotalY + 48, '$4,480.00', 14, palette.danger, { weight: 700, align: 'right', w: 70, font: 'JetBrains Mono' }));

  // Action buttons
  els.push(rect(20, 510, 166, 46, palette.accent2, { r: 23 }));
  els.push(text(46, 526, '✓ Mark as Paid', 14, '#FFF', { weight: 600, w: 114 }));

  els.push(rect(204, 510, 166, 46, 'transparent', { r: 23, stroke: palette.accent, sw: 1.5 }));
  els.push(text(228, 526, '↗ Resend', 14, palette.accent, { weight: 600, w: 114 }));

  // Notes
  els.push(rect(20, 572, 350, 56, palette.surface, { r: 10, stroke: palette.border, sw: 1 }));
  els.push(text(36, 586, 'NOTE', 9, palette.sub, { weight: 600 }));
  els.push(text(36, 602, 'Payment via bank transfer preferred. Net 15.', 12, palette.sub, { w: 310 }));

  els.push(...navBar(3));
  return els;
};

// ══════════════════════════════════════════════════════════════════════════
// BUILD PEN FILE
// ══════════════════════════════════════════════════════════════════════════
const screens = [
  { id: 'home',     name: 'Home — Today', elements: screen1() },
  { id: 'projects', name: 'Projects',     elements: screen2() },
  { id: 'timelog',  name: 'Time Log',     elements: screen3() },
  { id: 'invoices', name: 'Invoices',     elements: screen4() },
  { id: 'insights', name: 'Insights',     elements: screen5() },
  { id: 'invoice-detail', name: 'Invoice Detail', elements: screen6() },
];

const pen = {
  version: '2.8',
  meta: {
    name: 'Folio',
    description: 'Freelance time & billing — light parchment theme',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
  },
  canvas: { width: 390, height: 830, background: palette.bg },
  screens,
};

const outPath = path.join(__dirname, 'folio.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log('✓ folio.pen written —', screens.length, 'screens,', screens.reduce((a, s) => a + s.elements.length, 0), 'elements');
