'use strict';
// ARCH — Architecture Studio · Heartbeat #52
// Theme: LIGHT
// Inspired by minimal.gallery's editorial serif + warm cream Swiss grid aesthetic
// and Land-book's "Big Type" filter showing screen-filling typographic compositions.
// Palette: warm cream backgrounds, charcoal editorial type, terracotta accent.

const fs   = require('fs');
const path = require('path');

const SLUG    = 'arch';
const NAME    = 'ARCH';
const TAGLINE = 'Architecture studio · project & commission tracker';
const W = 390, H = 844;

// Warm editorial palette — light mode
const C = {
  bg:       '#FAF7F2',   // warm cream
  card:     '#F3EEE6',   // slightly deeper cream
  cardB:    '#EDE6DB',   // card border / divider
  surface:  '#FFFFFF',   // pure surface for elevated cards
  text:     '#1E1A16',   // near-black charcoal
  textMid:  '#5C5248',   // mid warm brown
  textFaint:'#9E9087',   // faint label
  accent:   '#C4614A',   // terracotta
  accent2:  '#4A7B6F',   // sage green
  accentBg: 'rgba(196,97,74,0.10)',
  accent2Bg:'rgba(74,123,111,0.10)',
  gold:     '#C09A52',   // warm gold for premium
  divider:  'rgba(30,26,22,0.10)',
};

// ─── primitives ────────────────────────────────────────────────────────────────

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
  return {
    type: 'circle', cx, cy, r, fill,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none',
    strokeWidth: opts.sw ?? 0,
  };
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  return { type: 'line', x1, y1, x2, y2, stroke, strokeWidth: opts.sw ?? 1, opacity: opts.opacity ?? 1 };
}

// ─── shared components ─────────────────────────────────────────────────────────

function statusBar(els) {
  els.push(rect(0, 0, W, 44, C.bg));
  els.push(text(20, 28, '9:41', 13, C.text, { fw: 500, font: 'system-ui, sans-serif' }));
  els.push(text(W - 20, 28, '●●●', 13, C.text, { fw: 500, anchor: 'end', font: 'system-ui, sans-serif' }));
}

function navBar(els, items) {
  const nb_y = H - 72;
  els.push(rect(0, nb_y, W, 72, C.bg));
  els.push(line(0, nb_y, W, nb_y, C.divider));
  const step = W / items.length;
  items.forEach((item, i) => {
    const cx = step * i + step / 2;
    // Icon placeholder circle
    const active = item.active;
    els.push(circle(cx, nb_y + 18, 5, active ? C.accent : C.textFaint));
    els.push(text(cx, nb_y + 36, item.label, 10, active ? C.accent : C.textFaint,
      { anchor: 'middle', fw: active ? 600 : 400, font: 'system-ui, sans-serif' }));
    if (active) {
      // active underline
      els.push(rect(cx - 12, nb_y + 2, 24, 2, C.accent, { rx: 1 }));
    }
  });
}

const NAV = [
  { label: 'Dashboard', active: false },
  { label: 'Projects',  active: false },
  { label: 'Detail',    active: false },
  { label: 'Schedule',  active: false },
  { label: 'Team',      active: false },
];

// ─── Screen 1: Dashboard ───────────────────────────────────────────────────────

function screen1() {
  const els = [];
  const nav = NAV.map((n, i) => ({ ...n, active: i === 0 }));
  els.push(rect(0, 0, W, H, C.bg));
  statusBar(els);

  // Header — large serif editorial treatment
  els.push(text(22, 80, 'ARCH', 44, C.text, { fw: 700, font: 'Georgia, serif', ls: 6 }));
  els.push(text(22, 106, 'Studio Dashboard', 14, C.textMid, { font: 'system-ui, sans-serif' }));
  els.push(line(22, 118, W - 22, 118, C.divider));

  // Hero metric — "Big Type" style, fills space
  els.push(text(22, 182, '7', 96, C.accent, { fw: 700, font: 'Georgia, serif', ls: -2 }));
  els.push(text(80, 162, 'Active', 13, C.textMid, { font: 'system-ui, sans-serif' }));
  els.push(text(80, 180, 'Commissions', 13, C.text, { fw: 600, font: 'system-ui, sans-serif' }));

  // Secondary metrics row
  const metrics = [
    { label: 'In Progress', val: '4', color: C.accent2 },
    { label: 'Under Review', val: '2', color: C.gold },
    { label: 'Completed YTD', val: '18', color: C.textMid },
  ];
  metrics.forEach((m, i) => {
    const bx = 22 + i * 116;
    els.push(rect(bx, 210, 108, 64, C.card, { rx: 8 }));
    els.push(rect(bx, 210, 108, 3, m.color, { rx: 2 }));
    els.push(text(bx + 10, 236, m.val, 26, C.text, { fw: 700, font: 'Georgia, serif' }));
    els.push(text(bx + 10, 258, m.label, 9, C.textMid, { font: 'system-ui, sans-serif' }));
  });

  // Section label
  els.push(text(22, 302, 'RECENT ACTIVITY', 10, C.textFaint, { fw: 600, font: 'system-ui, sans-serif', ls: 2 }));
  els.push(line(22, 310, W - 22, 310, C.divider));

  // Activity list — editorial rows, no card backgrounds
  const activities = [
    { proj: 'Villa Cortile', action: 'Planning permit approved', time: '2h ago', tag: 'Permit', tagColor: C.accent2 },
    { proj: 'Museum Annex', action: 'New render batch uploaded', time: '5h ago', tag: 'Renders', tagColor: C.gold },
    { proj: 'The Crescent', action: 'Client feedback received', time: '1d ago', tag: 'Review', tagColor: C.accent },
    { proj: 'Park Pavilion', action: 'Structural drawings updated', time: '2d ago', tag: 'Drawings', tagColor: C.textMid },
  ];
  activities.forEach((a, i) => {
    const row_y = 328 + i * 72;
    // Terracotta left tick
    els.push(rect(22, row_y + 6, 3, 40, a.tagColor, { rx: 2 }));
    els.push(text(32, row_y + 22, a.proj, 13, C.text, { fw: 600, font: 'system-ui, sans-serif' }));
    els.push(text(32, row_y + 40, a.action, 11, C.textMid, { font: 'system-ui, sans-serif' }));
    // Tag pill
    els.push(rect(W - 90, row_y + 8, 68, 20, 'rgba(0,0,0,0.05)', { rx: 10 }));
    els.push(text(W - 56, row_y + 22, a.tag, 9, a.tagColor, { fw: 600, anchor: 'middle', font: 'system-ui, sans-serif' }));
    els.push(text(W - 22, row_y + 40, a.time, 9, C.textFaint, { anchor: 'end', font: 'system-ui, sans-serif' }));
    if (i < activities.length - 1) {
      els.push(line(32, row_y + 68, W - 22, row_y + 68, C.divider, { opacity: 0.5 }));
    }
  });

  // Workload chart — small horizontal bars, editorial
  els.push(text(22, 617, 'WORKLOAD', 9, C.textFaint, { fw: 600, font: 'system-ui, sans-serif', ls: 2 }));
  els.push(line(22, 624, W - 22, 624, C.divider, { opacity: 0.5 }));
  const wl = [
    { name: 'Lucia M.', pct: 85 },
    { name: 'Marco F.', pct: 60 },
    { name: 'Elena R.', pct: 90 },
  ];
  wl.forEach((w, i) => {
    const wy = 634 + i * 22;
    els.push(text(22, wy + 10, w.name, 9, C.textMid, { font: 'system-ui, sans-serif' }));
    els.push(rect(90, wy, W - 130, 12, C.cardB, { rx: 6 }));
    els.push(rect(90, wy, Math.round((W - 130) * w.pct / 100), 12, w.pct > 80 ? C.accent : C.accent2, { rx: 6 }));
    els.push(text(W - 34, wy + 10, `${w.pct}%`, 9, C.textFaint, { anchor: 'end', font: 'system-ui, sans-serif' }));
  });

  navBar(els, nav);
  return { name: 'Dashboard', elements: els };
}

// ─── Screen 2: Projects ────────────────────────────────────────────────────────

function screen2() {
  const els = [];
  const nav = NAV.map((n, i) => ({ ...n, active: i === 1 }));
  els.push(rect(0, 0, W, H, C.bg));
  statusBar(els);

  els.push(text(22, 78, 'Projects', 30, C.text, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(22, 100, '7 active commissions', 13, C.textMid, { font: 'system-ui, sans-serif' }));

  // Grid ref lines — Swiss discipline
  [130, 260].forEach(gx => els.push(line(gx, 44, gx, H - 72, C.divider, { opacity: 0.15, sw: 0.5 })));

  // Filter tabs — editorial underline style
  const filters = ['All', 'Residential', 'Civic', 'Commercial'];
  filters.forEach((f, i) => {
    const fx = 22 + i * 86;
    const active = i === 0;
    els.push(text(fx, 128, f, 12, active ? C.text : C.textFaint,
      { fw: active ? 600 : 400, font: 'system-ui, sans-serif' }));
    if (active) els.push(rect(fx, 132, f.length * 7, 2, C.accent, { rx: 1 }));
  });
  els.push(line(22, 138, W - 22, 138, C.divider));

  // Project cards — warm cream surface, editorial style
  const projects = [
    { name: 'Villa Cortile', type: 'Residential · Rome', phase: 'Construction', pct: 72, color: C.accent2, area: '420 m²' },
    { name: 'Museum Annex', type: 'Civic · Milan', phase: 'Design Development', pct: 45, color: C.accent, area: '2,800 m²' },
    { name: 'The Crescent', type: 'Residential · Florence', phase: 'Client Review', pct: 88, color: C.gold, area: '310 m²' },
    { name: 'Park Pavilion', type: 'Civic · Bologna', phase: 'Schematic', pct: 28, color: C.textMid, area: '780 m²' },
  ];

  projects.forEach((p, i) => {
    const py = 150 + i * 148;
    // Corner registration marks (architectural influence)
    els.push(line(22, py + 8, 22, py, C.cardB, { sw: 1 }));
    els.push(line(22, py, 30, py, C.cardB, { sw: 1 }));
    els.push(line(W - 22, py + 8, W - 22, py, C.cardB, { sw: 1 }));
    els.push(line(W - 22, py, W - 30, py, C.cardB, { sw: 1 }));
    els.push(rect(22, py, W - 44, 136, C.surface, { rx: 10 }));
    els.push(rect(22, py, W - 44, 136, 'none', { rx: 10, stroke: C.cardB, sw: 1 }));
    // Color accent top bar
    els.push(rect(22, py, W - 44, 4, p.color, { rx: 2 }));
    // Area badge
    els.push(rect(W - 88, py + 14, 66, 20, C.accentBg, { rx: 10 }));
    els.push(text(W - 55, py + 28, p.area, 10, C.accent, { anchor: 'middle', font: 'system-ui, sans-serif', fw: 600 }));
    els.push(text(34, py + 32, p.name, 17, C.text, { fw: 700, font: 'Georgia, serif' }));
    els.push(text(34, py + 52, p.type, 11, C.textMid, { font: 'system-ui, sans-serif' }));
    // Phase chip
    els.push(rect(34, py + 66, p.phase.length * 6.8 + 12, 20, 'rgba(0,0,0,0.05)', { rx: 10 }));
    els.push(text(40, py + 80, p.phase, 10, p.color, { fw: 600, font: 'system-ui, sans-serif' }));
    // Progress bar
    els.push(text(34, py + 104, 'Progress', 9, C.textFaint, { font: 'system-ui, sans-serif' }));
    els.push(text(W - 34, py + 104, `${p.pct}%`, 9, p.color, { anchor: 'end', fw: 600, font: 'system-ui, sans-serif' }));
    els.push(rect(34, py + 110, W - 68, 6, C.cardB, { rx: 3 }));
    els.push(rect(34, py + 110, Math.round((W - 68) * p.pct / 100), 6, p.color, { rx: 3 }));
  });

  navBar(els, nav);
  return { name: 'Projects', elements: els };
}

// ─── Screen 3: Project Detail ──────────────────────────────────────────────────

function screen3() {
  const els = [];
  const nav = NAV.map((n, i) => ({ ...n, active: i === 2 }));
  els.push(rect(0, 0, W, H, C.bg));
  statusBar(els);

  // Back nav
  els.push(text(22, 74, '← Projects', 12, C.textMid, { font: 'system-ui, sans-serif' }));
  els.push(line(22, 84, W - 22, 84, C.divider, { opacity: 0.4 }));

  // Project header — editorial
  els.push(text(22, 120, 'Museum Annex', 28, C.text, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(22, 144, 'Civic · Milan', 13, C.textMid, { font: 'system-ui, sans-serif' }));
  // Phase badge
  els.push(rect(22, 156, 112, 22, C.accentBg, { rx: 11 }));
  els.push(text(78, 171, 'Design Development', 9, C.accent, { anchor: 'middle', fw: 600, font: 'system-ui, sans-serif' }));

  // Stats row
  const stats = [
    { val: '2,800', unit: 'm²', label: 'Floor Area' },
    { val: '€4.2M', unit: '', label: 'Budget' },
    { val: '45%', unit: '', label: 'Complete' },
  ];
  stats.forEach((s, i) => {
    const sx = 22 + i * 116;
    els.push(rect(sx, 192, 108, 70, C.card, { rx: 8 }));
    els.push(text(sx + 10, 222, s.val, 22, C.text, { fw: 700, font: 'Georgia, serif' }));
    if (s.unit) els.push(text(sx + 10 + (s.val.length * 12.5), 222, s.unit, 11, C.textMid, { font: 'system-ui, sans-serif' }));
    els.push(text(sx + 10, 244, s.label, 9, C.textFaint, { font: 'system-ui, sans-serif' }));
  });

  // Floor plan placeholder — editorial sketch frame
  els.push(rect(22, 280, W - 44, 160, C.card, { rx: 8 }));
  els.push(rect(22, 280, W - 44, 160, 'none', { rx: 8, stroke: C.cardB, sw: 1 }));
  // Simplified floor plan schematic
  els.push(rect(55, 304, 120, 80, 'none', { stroke: C.textMid, sw: 1.5, rx: 2 }));
  els.push(rect(185, 304, 60, 80, 'none', { stroke: C.textMid, sw: 1.5, rx: 2 }));
  els.push(rect(55, 368, 60, 16, 'none', { stroke: C.textMid, sw: 1 }));
  els.push(rect(115, 368, 60, 16, 'none', { stroke: C.textMid, sw: 1 }));
  els.push(line(175, 304, 185, 304, C.textMid, { sw: 1.5 }));
  els.push(line(175, 384, 185, 384, C.textMid, { sw: 1.5 }));
  els.push(text(112, 351, 'Ground Floor', 10, C.textFaint, { anchor: 'middle', font: 'system-ui, sans-serif' }));
  els.push(text(213, 350, 'Annex', 10, C.textFaint, { anchor: 'middle', font: 'system-ui, sans-serif' }));
  els.push(text(W - 34, 426, '↗ Full Plans', 10, C.accent, { anchor: 'end', font: 'system-ui, sans-serif', fw: 600 }));

  // Dimension annotations on floor plan
  els.push(line(55, 296, 175, 296, C.textFaint, { sw: 0.5 }));
  els.push(line(55, 294, 55, 298, C.textFaint, { sw: 0.5 }));
  els.push(line(175, 294, 175, 298, C.textFaint, { sw: 0.5 }));
  els.push(text(115, 292, '24.0 m', 7, C.textFaint, { anchor: 'middle', font: 'system-ui, sans-serif' }));
  els.push(line(245, 296, 297, 296, C.textFaint, { sw: 0.5 }));
  els.push(line(245, 294, 245, 298, C.textFaint, { sw: 0.5 }));
  els.push(line(297, 294, 297, 298, C.textFaint, { sw: 0.5 }));
  els.push(text(271, 292, '11.2 m', 7, C.textFaint, { anchor: 'middle', font: 'system-ui, sans-serif' }));
  // Height dimension
  els.push(line(47, 304, 47, 384, C.textFaint, { sw: 0.5 }));
  els.push(line(45, 304, 49, 304, C.textFaint, { sw: 0.5 }));
  els.push(line(45, 384, 49, 384, C.textFaint, { sw: 0.5 }));
  els.push(text(43, 348, '16m', 7, C.textFaint, { anchor: 'end', font: 'system-ui, sans-serif' }));
  // North arrow
  els.push(circle(W - 44, 428, 8, C.card));
  els.push(text(W - 44, 432, 'N', 9, C.textMid, { anchor: 'middle', fw: 700, font: 'system-ui, sans-serif' }));
  els.push(line(W - 44, 418, W - 44, 423, C.textMid, { sw: 1.5 }));

  // Scale bar below floor plan
  els.push(line(76, 444, 106, 444, C.textMid, { sw: 1.5 }));
  els.push(line(76, 440, 76, 448, C.textMid, { sw: 1.5 }));
  els.push(line(106, 440, 106, 448, C.textMid, { sw: 1.5 }));
  els.push(text(91, 456, '5 m', 7, C.textFaint, { anchor: 'middle', font: 'system-ui, sans-serif' }));
  els.push(rect(76, 444, 15, 4, C.textMid));
  els.push(rect(91, 444, 15, 4, C.bg));

  // Document tabs row
  const docTabs = ['Plans', 'Sections', 'Elevations', 'Renders', 'Reports'];
  docTabs.forEach((tab, i) => {
    const tx = 22 + i * 70;
    if (tx + 64 > W - 10) return;
    const active = i === 0;
    els.push(rect(tx, 462, 64, 22, active ? C.accentBg : 'transparent', { rx: 11 }));
    els.push(text(tx + 32, 476, tab, 9, active ? C.accent : C.textFaint,
      { anchor: 'middle', fw: active ? 600 : 400, font: 'system-ui, sans-serif' }));
  });

  // Phase timeline
  els.push(text(22, 496, 'PHASE TIMELINE', 10, C.textFaint, { fw: 600, font: 'system-ui, sans-serif', ls: 2 }));
  els.push(line(22, 470, W - 22, 470, C.divider));
  const phases = [
    { label: 'Schematic Design', done: true },
    { label: 'Design Development', done: false, active: true },
    { label: 'Construction Docs', done: false },
    { label: 'Permit & Tendering', done: false },
    { label: 'Construction', done: false },
  ];
  els.push(line(22, 504, W - 22, 504, C.divider));
  phases.forEach((ph, i) => {
    const py = 516 + i * 42;
    const dotColor = ph.done ? C.accent2 : ph.active ? C.accent : C.cardB;
    els.push(circle(34, py, 7, dotColor));
    if (ph.done) {
      els.push(text(34, py + 5, '✓', 8, '#fff', { anchor: 'middle', font: 'system-ui, sans-serif', fw: 700 }));
    }
    if (i < phases.length - 1) {
      els.push(line(34, py + 7, 34, py + 35, ph.done ? C.accent2 : C.cardB, { sw: 2 }));
    }
    els.push(text(50, py + 5, ph.label, 12, ph.active ? C.text : ph.done ? C.textMid : C.textFaint,
      { fw: ph.active ? 600 : 400, font: 'system-ui, sans-serif' }));
    if (ph.active) {
      els.push(rect(50, py + 10, 80, 16, C.accentBg, { rx: 8 }));
      els.push(text(90, py + 22, 'In Progress', 8, C.accent, { anchor: 'middle', fw: 600, font: 'system-ui, sans-serif' }));
    }
  });

  navBar(els, nav);
  return { name: 'Project Detail', elements: els };
}

// ─── Screen 4: Schedule ────────────────────────────────────────────────────────

function screen4() {
  const els = [];
  const nav = NAV.map((n, i) => ({ ...n, active: i === 3 }));
  els.push(rect(0, 0, W, H, C.bg));
  statusBar(els);

  // Header
  els.push(text(22, 78, 'Schedule', 30, C.text, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(22, 100, 'April 2026', 13, C.textMid, { font: 'system-ui, sans-serif' }));

  // Mini calendar strip — 7 days
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const dates = [6, 7, 8, 9, 10, 11, 12];
  const dayW = (W - 44) / 7;
  days.forEach((d, i) => {
    const dx = 22 + i * dayW + dayW / 2;
    const isToday = i === 4; // Friday 10
    if (isToday) {
      els.push(circle(dx, 134, 16, C.accent));
    }
    els.push(text(dx, 125, d, 10, isToday ? '#fff' : C.textFaint, { anchor: 'middle', font: 'system-ui, sans-serif', fw: 500 }));
    els.push(text(dx, 142, String(dates[i]), 12, isToday ? '#fff' : C.text, { anchor: 'middle', fw: isToday ? 700 : 400, font: 'Georgia, serif' }));
  });
  els.push(line(22, 160, W - 22, 160, C.divider));

  // Week progress indicator
  els.push(text(22, 172, 'Week 15 of 52', 10, C.textFaint, { font: 'system-ui, sans-serif' }));
  els.push(rect(W - 100, 162, 78, 10, C.cardB, { rx: 5 }));
  els.push(rect(W - 100, 162, Math.round(78 * 15 / 52), 10, C.accent, { rx: 5 }));

  // Upcoming milestones
  els.push(text(22, 188, 'UPCOMING MILESTONES', 10, C.textFaint, { fw: 600, font: 'system-ui, sans-serif', ls: 2 }));

  const milestones = [
    { date: 'Apr 14', proj: 'Museum Annex', task: 'DD drawings submission', type: 'Submission', color: C.accent },
    { date: 'Apr 17', proj: 'Villa Cortile', task: 'Structural engineer review', type: 'Meeting', color: C.accent2 },
    { date: 'Apr 21', proj: 'The Crescent', task: 'Client design sign-off', type: 'Approval', color: C.gold },
    { date: 'Apr 24', proj: 'Museum Annex', task: 'Budget reconciliation', type: 'Finance', color: C.textMid },
    { date: 'Apr 28', proj: 'Park Pavilion', task: 'Schematic review workshop', type: 'Workshop', color: C.accent },
    { date: 'May 02', proj: 'Villa Cortile', task: 'Construction site visit', type: 'Site Visit', color: C.accent2 },
  ];

  milestones.forEach((m, i) => {
    const my = 196 + i * 86;
    // Date column — editorial left anchor
    els.push(text(22, my + 18, m.date, 12, C.textMid, { fw: 500, font: 'Georgia, serif' }));
    els.push(line(64, my + 8, 64, my + 74, C.divider, { sw: 1 }));
    // Event card
    els.push(rect(76, my + 2, W - 98, 72, C.surface, { rx: 8 }));
    els.push(rect(76, my + 2, 4, 72, m.color, { rx: 2 }));
    // Type badge
    els.push(rect(W - 100, my + 10, m.type.length * 6.5 + 12, 18, 'rgba(0,0,0,0.05)', { rx: 9 }));
    els.push(text(W - 100 + (m.type.length * 6.5 + 12) / 2, my + 23, m.type, 8, m.color,
      { anchor: 'middle', fw: 600, font: 'system-ui, sans-serif' }));
    els.push(text(88, my + 24, m.proj, 13, C.text, { fw: 600, font: 'system-ui, sans-serif' }));
    els.push(text(88, my + 44, m.task, 11, C.textMid, { font: 'system-ui, sans-serif' }));
  });

  navBar(els, nav);
  return { name: 'Schedule', elements: els };
}

// ─── Screen 5: Team ────────────────────────────────────────────────────────────

function screen5() {
  const els = [];
  const nav = NAV.map((n, i) => ({ ...n, active: i === 4 }));
  els.push(rect(0, 0, W, H, C.bg));
  // Background grid — Swiss discipline reference lines (very faint)
  for (let gx = 0; gx <= W; gx += 130) {
    els.push(line(gx, 0, gx, H, C.divider, { opacity: 0.25, sw: 0.5 }));
  }
  statusBar(els);

  els.push(text(22, 78, 'Studio Team', 30, C.text, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(22, 100, '8 architects & technicians', 13, C.textMid, { font: 'system-ui, sans-serif' }));
  els.push(line(22, 114, W - 22, 114, C.divider));

  const team = [
    { name: 'Lucia Marchetti', role: 'Principal Architect', projects: 3, initials: 'LM', color: C.accent },
    { name: 'Marco Ferretti', role: 'Associate · Residential', projects: 2, initials: 'MF', color: C.accent2 },
    { name: 'Elena Russo', role: 'Associate · Civic', projects: 2, initials: 'ER', color: C.gold },
    { name: 'Tommaso Conti', role: 'Senior Architect', projects: 1, initials: 'TC', color: C.textMid },
    { name: 'Sofia Bianchi', role: 'Junior Architect', projects: 1, initials: 'SB', color: C.accent },
    { name: 'Davide Leone', role: 'Technical Director', projects: 3, initials: 'DL', color: C.accent2 },
  ];

  // Capacity overview row
  els.push(rect(22, 118, W - 44, 2, C.cardB));
  const capItems = [{ l: 'Capacity', v: '68%' }, { l: 'Avg load', v: '4.2 proj' }, { l: 'On leave', v: '1' }];
  // Embedded below team list via addenda — skip for now

  team.forEach((t, i) => {
    const ty = 128 + i * 90;
    // Avatar circle — editorial, flat
    els.push(circle(44, ty + 28, 24, t.color, { opacity: 0.15 }));
    els.push(circle(44, ty + 28, 24, 'none', { stroke: t.color, sw: 1.5 }));
    els.push(text(44, ty + 34, t.initials, 13, t.color, { anchor: 'middle', fw: 700, font: 'system-ui, sans-serif' }));
    // Info
    els.push(text(78, ty + 20, t.name, 14, C.text, { fw: 600, font: 'system-ui, sans-serif' }));
    els.push(text(78, ty + 38, t.role, 11, C.textMid, { font: 'system-ui, sans-serif' }));
    // Projects badge
    els.push(rect(78, ty + 48, 64, 18, C.accentBg, { rx: 9 }));
    els.push(text(110, ty + 60, `${t.projects} project${t.projects > 1 ? 's' : ''}`, 9, C.accent, { anchor: 'middle', fw: 600, font: 'system-ui, sans-serif' }));
    if (i < team.length - 1) {
      els.push(line(22, ty + 78, W - 22, ty + 78, C.divider, { opacity: 0.5 }));
    }
  });

  // Studio capacity summary block
  const cap_y = 128 + 6 * 90 + 4;
  els.push(rect(22, cap_y, W - 44, 58, C.card, { rx: 8 }));
  const capItems2 = [{ l: 'Capacity', v: '68%' }, { l: 'Avg Load', v: '4.2' }, { l: 'On Leave', v: '1' }];
  capItems2.forEach((c, i) => {
    const cx2 = 22 + i * (W - 44) / 3 + 14;
    els.push(text(cx2, cap_y + 24, c.v, 18, C.text, { fw: 700, font: 'Georgia, serif' }));
    els.push(text(cx2, cap_y + 42, c.l, 9, C.textFaint, { font: 'system-ui, sans-serif' }));
    if (i < 2) els.push(line(22 + (i + 1) * (W - 44) / 3, cap_y + 10, 22 + (i + 1) * (W - 44) / 3, cap_y + 48, C.divider));
  });

  navBar(els, nav);
  return { name: 'Team', elements: els };
}

// ─── Screen 6: Commission Brief ────────────────────────────────────────────────

function screen6() {
  const els = [];
  const nav = NAV.map((n, i) => ({ ...n, active: i === 2 }));
  els.push(rect(0, 0, W, H, C.bg));
  // Large editorial year ghost — Big Type influence from Land-book
  // (placed first so it renders behind)
  for (let i = 0; i < 5; i++) {
    els.push(line(0, 170 + i * 100, W, 170 + i * 100, C.cardB, { opacity: 0.3, sw: 0.5 }));
  }
  statusBar(els);

  // Commission header with editorial "Big Type" number
  els.push(text(22, 78, 'New Brief', 13, C.textMid, { font: 'system-ui, sans-serif' }));
  els.push(line(22, 88, W - 22, 88, C.divider, { opacity: 0.4 }));
  els.push(text(22, 148, '2026', 72, C.card, { fw: 900, font: 'Georgia, serif', ls: -2 }));
  els.push(text(22, 148, 'Residential', 36, C.text, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(22, 186, 'Commission Brief', 18, C.accent, { font: 'Georgia, serif' }));

  els.push(line(22, 202, W - 22, 202, C.divider));

  // Brief fields — editorial form style
  const fields = [
    { label: 'Client', value: 'Rossi Family Estate' },
    { label: 'Location', value: 'Umbria, Italy' },
    { label: 'Programme', value: 'Private Villa · 5 bed · Guest annex' },
    { label: 'Site Area', value: '3,200 m² · Sloping terrain' },
    { label: 'Budget', value: '€ 2.8M indicative' },
    { label: 'Deadline', value: 'Schematic by Sep 2026' },
  ];
  fields.forEach((f, i) => {
    const fy = 218 + i * 72;
    els.push(text(22, fy, f.label.toUpperCase(), 9, C.textFaint, { fw: 600, font: 'system-ui, sans-serif', ls: 2 }));
    els.push(text(22, fy + 24, f.value, 14, C.text, { fw: 500, font: 'system-ui, sans-serif' }));
    els.push(line(22, fy + 36, W - 22, fy + 36, C.divider, { opacity: 0.5 }));
  });

  // Accept / Pass buttons
  els.push(rect(22, H - 100, (W - 52) / 2, 44, C.accent, { rx: 8 }));
  els.push(text(22 + (W - 52) / 4, H - 74, 'Accept Brief', 13, '#fff', { anchor: 'middle', fw: 600, font: 'system-ui, sans-serif' }));
  els.push(rect(22 + (W - 52) / 2 + 8, H - 100, (W - 52) / 2, 44, C.card, { rx: 8 }));
  els.push(rect(22 + (W - 52) / 2 + 8, H - 100, (W - 52) / 2, 44, 'none', { rx: 8, stroke: C.cardB, sw: 1 }));
  els.push(text(22 + (W - 52) / 2 + 8 + (W - 52) / 4, H - 74, 'Pass', 13, C.textMid,
    { anchor: 'middle', fw: 600, font: 'system-ui, sans-serif' }));

  navBar(els, nav);
  return { name: 'Commission Brief', elements: els };
}

// ─── Screen 6 addendum: Studio profile strip ───────────────────────────────────
// Already defined in screen6(); just augment screen1 with a bulletin board strip

function addBulletinToScreen1(els) {
  // Studio notice strip at bottom of dashboard above nav
  const sy = H - 150;
  els.push(rect(22, sy, W - 44, 56, C.card, { rx: 8 }));
  els.push(rect(22, sy, 4, 56, C.gold, { rx: 2 }));
  els.push(text(34, sy + 16, 'Studio Notice', 10, C.gold, { fw: 600, font: 'system-ui, sans-serif' }));
  els.push(text(34, sy + 34, 'Monthly billing run · April 30 deadline', 11, C.text, { font: 'system-ui, sans-serif' }));
  els.push(text(34, sy + 48, '4 invoices pending review', 10, C.textFaint, { font: 'system-ui, sans-serif' }));
  // Palette swatch strip (editorial detail)
  [C.accent, C.accent2, C.gold, C.textMid, C.textFaint].forEach((col, i) => {
    els.push(rect(W - 110 + i * 18, sy + 16, 14, 28, col, { rx: 3 }));
  });
}

// ─── Assemble & Write ──────────────────────────────────────────────────────────

const s1 = screen1();
addBulletinToScreen1(s1.elements);
const screens = [s1, screen2(), screen3(), screen4(), screen5(), screen6()];

// build SVGs
const svgScreens = screens.map(s => {
  const shapes = s.elements.map(e => {
    if (e.type === 'rect') {
      return `<rect x="${e.x}" y="${e.y}" width="${e.width}" height="${e.height}" fill="${e.fill}" rx="${e.rx||0}" opacity="${e.opacity||1}" stroke="${e.stroke||'none'}" stroke-width="${e.strokeWidth||0}"/>`;
    }
    if (e.type === 'text') {
      return `<text x="${e.x}" y="${e.y}" font-size="${e.fontSize}" fill="${e.fill}" font-weight="${e.fontWeight||400}" font-family="${e.fontFamily||'system-ui'}" text-anchor="${e.textAnchor||'start'}" letter-spacing="${e.letterSpacing||0}" opacity="${e.opacity||1}">${e.content}</text>`;
    }
    if (e.type === 'circle') {
      return `<circle cx="${e.cx}" cy="${e.cy}" r="${e.r}" fill="${e.fill}" opacity="${e.opacity||1}" stroke="${e.stroke||'none'}" stroke-width="${e.strokeWidth||0}"/>`;
    }
    if (e.type === 'line') {
      return `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${e.stroke}" stroke-width="${e.strokeWidth||1}" opacity="${e.opacity||1}"/>`;
    }
    return '';
  }).join('\n    ');
  return {
    name: s.name,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n    ${shapes}\n  </svg>`,
    elements: s.elements,
  };
});

const totalEls = svgScreens.reduce((a, s) => a + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    tagline: TAGLINE,
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'light',
    heartbeat: 52,
    elements: totalEls,
    palette: {
      bg: C.bg,
      surface: C.surface,
      card: C.card,
      text: C.text,
      accent: C.accent,
      accent2: C.accent2,
    },
    inspiration: 'minimal.gallery editorial serif + warm cream, Land-book Big Type genre',
  },
  screens: svgScreens.map(s => ({
    name: s.name,
    svg: s.svg,
    elements: s.elements,
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalEls} elements`);
console.log(`Written: ${SLUG}.pen`);
