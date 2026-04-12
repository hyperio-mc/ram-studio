'use strict';
/**
 * bloc-app.js — BLOC Team Project Health Dashboard
 * Inspired by: herding.app bento grid trend (Godly #966) + ZettaJoule ice-blue palette (Awwwards)
 * Theme: LIGHT (lore was dark)
 * Screens: Dashboard Grid, Project Detail, Team Roster, Sprint Review, Integrations
 */

const fs = require('fs');

// ─── Pencil v2.8 helpers ──────────────────────────────────────────────────────
function makeDoc(screens) {
  return {
    version: '2.8',
    title: 'BLOC — Team Project Health',
    screens,
  };
}

const W = 390, H = 844;

const P = {
  bg:       '#EFF2F8',   // ice-tinted background (ZettaJoule inspired)
  surface:  '#FFFFFF',
  surface2: '#F6F8FD',
  surface3: '#E8ECF5',
  text:     '#1B1B1F',   // ZettaJoule near-black
  textSub:  '#6B6E7D',
  accent:   '#4360F5',   // electric indigo
  accent2:  '#F5954B',   // warm amber (Relace orange)
  accent3:  '#31C97E',   // green for health
  accent4:  '#F54B6F',   // red for blockers
  border:   '#DDE1EE',
};

let eid = 1;
function el(type, props = {}, children = []) {
  return { id: `e${eid++}`, type, ...props, children };
}

function rect(x, y, w, h, fill, r = 0) {
  return el('rect', { x, y, width: w, height: h, fill, rx: r, ry: r });
}

function text(x, y, str, size, color, weight = 'normal', align = 'left') {
  return el('text', { x, y, value: str, fontSize: size, fill: color, fontWeight: weight, textAnchor: align === 'center' ? 'middle' : align === 'right' ? 'end' : 'start' });
}

function pill(x, y, w, h, fill, r = 999) {
  return el('rect', { x, y, width: w, height: h, fill, rx: r, ry: r });
}

function circle(cx, cy, r, fill) {
  return el('ellipse', { cx, cy, rx: r, ry: r, fill });
}

function line(x1, y1, x2, y2, stroke, sw = 1) {
  return el('line', { x1, y1, x2, y2, stroke, strokeWidth: sw });
}

// ─── Status bar (light) ───────────────────────────────────────────────────────
function statusBar() {
  return [
    rect(0, 0, W, 44, P.bg),
    text(20, 30, '9:41', 14, P.text, '600'),
    text(W - 20, 30, '◼◼◼', 11, P.text, 'normal', 'right'),
  ];
}

// ─── Bottom nav ───────────────────────────────────────────────────────────────
function bottomNav(active = 0) {
  const tabs = [
    { label: 'Grid', icon: '⊞' },
    { label: 'Projects', icon: '◧' },
    { label: 'Team', icon: '◉' },
    { label: 'Reports', icon: '▤' },
  ];
  const els = [
    rect(0, H - 84, W, 84, P.surface),
    line(0, H - 84, W, H - 84, P.border),
  ];
  const tabW = W / tabs.length;
  tabs.forEach((t, i) => {
    const cx = tabW * i + tabW / 2;
    const isActive = i === active;
    els.push(circle(cx, H - 60, 20, isActive ? P.accent : 'transparent'));
    els.push(text(cx, H - 55, t.icon, 16, isActive ? '#FFF' : P.textSub, 'normal', 'center'));
    els.push(text(cx, H - 28, t.label, 10, isActive ? P.accent : P.textSub, isActive ? '600' : 'normal', 'center'));
  });
  return els;
}

// ─── SCREEN 1: Dashboard Bento Grid ──────────────────────────────────────────
function screen1() {
  const els = [
    rect(0, 0, W, H, P.bg),
    ...statusBar(),
  ];

  // Header
  els.push(text(20, 72, 'BLOC', 22, P.accent, '800'));
  els.push(text(20, 92, 'Good morning, Maya', 14, P.textSub, '400'));

  // Avatar
  els.push(circle(W - 36, 76, 20, P.accent));
  els.push(text(W - 36, 82, 'M', 13, '#FFF', '700', 'center'));

  // Week label
  els.push(pill(W/2 - 50, 108, 100, 22, P.surface3));
  els.push(text(W/2, 122, 'Sprint 14 · Mar 28', 10, P.textSub, '500', 'center'));

  // ── Bento tile 1: big health score (2 col wide) ────────────────────────────
  // Full-width health tile
  els.push(rect(16, 140, W - 32, 100, P.accent, 16));
  els.push(text(28, 168, 'Team Health', 11, 'rgba(255,255,255,0.7)', '500'));
  els.push(text(28, 200, '84%', 38, '#FFFFFF', '800'));
  els.push(text(28, 222, '↑ 6% from last sprint', 10, 'rgba(255,255,255,0.65)', '400'));
  // Mini bar chart inside
  [0.7, 0.85, 0.6, 0.9, 0.84].forEach((v, i) => {
    const bx = W - 32 - 80 + i * 16;
    const bh = v * 40;
    els.push(rect(bx, 240 - bh - 20, 10, bh, 'rgba(255,255,255,0.3)', 3));
    if (i === 4) els.push(rect(bx, 240 - bh - 20, 10, bh, 'rgba(255,255,255,0.9)', 3));
  });

  // ── Bento row 2: two small tiles ─────────────────────────────────────────
  // Tile A: Active projects
  els.push(rect(16, 252, 172, 90, P.surface, 14));
  els.push(text(28, 275, 'Active', 10, P.textSub, '500'));
  els.push(text(28, 308, '12', 34, P.text, '800'));
  els.push(text(28, 328, 'projects', 10, P.textSub, '400'));
  els.push(circle(160, 273, 12, '#EBF0FF'));
  els.push(text(160, 278, '◧', 11, P.accent, '600', 'center'));

  // Tile B: Blockers
  els.push(rect(202, 252, 172, 90, P.surface, 14));
  els.push(text(214, 275, 'Blockers', 10, P.textSub, '500'));
  els.push(text(214, 308, '3', 34, P.accent4, '800'));
  els.push(text(214, 328, 'need attention', 10, P.textSub, '400'));
  els.push(circle(346, 273, 12, '#FFEBEE'));
  els.push(text(346, 278, '⚑', 11, P.accent4, '600', 'center'));

  // ── Bento row 3: project cards ────────────────────────────────────────────
  els.push(text(20, 362, 'Your Projects', 12, P.text, '700'));
  els.push(text(W - 20, 362, 'See all →', 11, P.accent, '500', 'right'));

  // Project card 1 — Meridian app
  els.push(rect(16, 376, W - 32, 72, P.surface, 14));
  els.push(circle(34, 411, 11, '#EBFBF2'));
  els.push(text(34, 415, '◉', 10, P.accent3, '700', 'center'));
  els.push(text(54, 400, 'Meridian App', 13, P.text, '600'));
  els.push(text(54, 418, 'iOS · 8 members', 10, P.textSub, '400'));
  els.push(pill(W - 80, 400, 52, 18, '#EBFBF2'));
  els.push(text(W - 54, 412, 'On track', 9, P.accent3, '600', 'center'));
  // Progress bar
  els.push(rect(16, 438, W - 32, 4, P.surface3, 2));
  els.push(rect(16, 438, (W - 32) * 0.72, 4, P.accent3, 2));

  // Project card 2 — Atlas Dashboard
  els.push(rect(16, 456, W - 32, 72, P.surface, 14));
  els.push(circle(34, 491, 11, '#FFF3E8'));
  els.push(text(34, 495, '◑', 11, P.accent2, '700', 'center'));
  els.push(text(54, 480, 'Atlas Dashboard', 13, P.text, '600'));
  els.push(text(54, 498, 'Web · 5 members', 10, P.textSub, '400'));
  els.push(pill(W - 80, 480, 52, 18, '#FFF3E8'));
  els.push(text(W - 54, 492, 'At risk', 9, P.accent2, '600', 'center'));
  els.push(rect(16, 518, W - 32, 4, P.surface3, 2));
  els.push(rect(16, 518, (W - 32) * 0.45, 4, P.accent2, 2));

  // Project card 3 — Relay API
  els.push(rect(16, 536, W - 32, 72, P.surface, 14));
  els.push(circle(34, 571, 11, '#FEECEE'));
  els.push(text(34, 575, '●', 10, P.accent4, '700', 'center'));
  els.push(text(54, 560, 'Relay API v3', 13, P.text, '600'));
  els.push(text(54, 578, 'API · 4 members', 10, P.textSub, '400'));
  els.push(pill(W - 80, 560, 52, 18, '#FEECEE'));
  els.push(text(W - 54, 572, 'Blocked', 9, P.accent4, '600', 'center'));
  els.push(rect(16, 598, W - 32, 4, P.surface3, 2));
  els.push(rect(16, 598, (W - 32) * 0.28, 4, P.accent4, 2));

  els.push(...bottomNav(0));

  return {
    id: 'screen1',
    title: 'Dashboard Grid',
    width: W, height: H,
    backgroundColor: P.bg,
    elements: els,
  };
}

// ─── SCREEN 2: Project Detail ─────────────────────────────────────────────────
function screen2() {
  const els = [rect(0, 0, W, H, P.bg), ...statusBar()];

  // Back + title
  els.push(text(20, 72, '←', 20, P.text, '400'));
  els.push(text(W/2, 76, 'Meridian App', 16, P.text, '700', 'center'));
  els.push(pill(W - 80, 62, 56, 22, '#EBFBF2'));
  els.push(text(W - 52, 76, 'On track', 9, P.accent3, '600', 'center'));

  // Hero info card
  els.push(rect(16, 94, W - 32, 110, P.surface, 16));
  els.push(text(28, 118, 'Sprint 14 ends in 4 days', 11, P.textSub, '400'));
  // Progress circle (fake arc)
  els.push(circle(W - 60, 148, 30, P.surface3));
  els.push(circle(W - 60, 148, 22, P.surface));
  els.push(text(W - 60, 153, '72%', 11, P.accent, '700', 'center'));
  els.push(text(28, 146, 'Sprint Progress', 11, P.textSub, '500'));
  els.push(text(28, 168, '18 / 25', 24, P.text, '800'));
  els.push(text(28, 186, 'tasks complete', 10, P.textSub, '400'));
  // inline progress bar
  els.push(rect(28, 196, W - 72, 5, P.surface3, 3));
  els.push(rect(28, 196, (W - 72) * 0.72, 5, P.accent, 3));

  // Stats row
  els.push(rect(16, 216, W - 32, 56, P.surface, 12));
  const stats = [{ l:'Open', v:'7' }, { l:'Review', v:'3' }, { l:'Blocked', v:'1' }, { l:'Done', v:'14' }];
  stats.forEach((s, i) => {
    const sx = 16 + i * ((W - 32) / 4) + (W - 32) / 8;
    els.push(text(sx, 237, s.v, 18, i === 2 ? P.accent4 : P.accent, '800', 'center'));
    els.push(text(sx, 254, s.l, 9, P.textSub, '400', 'center'));
    if (i < 3) els.push(line(16 + (i+1) * ((W-32)/4), 224, 16 + (i+1) * ((W-32)/4), 264, P.border));
  });

  // Tasks section
  els.push(text(20, 292, 'Active Tasks', 13, P.text, '700'));
  els.push(text(W - 20, 292, 'View all', 11, P.accent, '500', 'right'));

  const tasks = [
    { t: 'Design system token update', a: 'KA', s: 'Review', sc: P.accent },
    { t: 'Auth flow regression testing', a: 'LM', s: 'In Progress', sc: P.accent3 },
    { t: 'API rate limit fix', a: 'PR', s: 'Blocked', sc: P.accent4 },
    { t: 'Onboarding checklist UI', a: 'TE', s: 'Open', sc: P.textSub },
  ];
  tasks.forEach((task, i) => {
    const ty = 306 + i * 66;
    els.push(rect(16, ty, W - 32, 58, P.surface, 12));
    els.push(circle(34, ty + 29, 11, P.accent + '22'));
    els.push(text(34, ty + 33, task.a, 9, P.accent, '700', 'center'));
    els.push(text(54, ty + 22, task.t, 12, P.text, '500'));
    els.push(pill(54, ty + 34, 72, 16, task.sc + '22'));
    els.push(text(90, ty + 44, task.s, 9, task.sc, '600', 'center'));
    els.push(text(W - 28, ty + 32, '›', 16, P.textSub, '300', 'center'));
  });

  els.push(...bottomNav(1));
  return { id: 'screen2', title: 'Project Detail', width: W, height: H, backgroundColor: P.bg, elements: els };
}

// ─── SCREEN 3: Team Roster ────────────────────────────────────────────────────
function screen3() {
  const els = [rect(0, 0, W, H, P.bg), ...statusBar()];

  els.push(text(20, 72, 'Team', 22, P.text, '800'));
  els.push(text(20, 92, '14 members across 4 squads', 12, P.textSub, '400'));

  // Search bar
  els.push(rect(16, 108, W - 32, 38, P.surface, 10));
  els.push(text(32, 130, '🔍', 12, P.textSub, '400'));
  els.push(text(52, 130, 'Search members...', 12, P.textSub, '400'));

  // Squad filter chips
  const squads = ['All', 'Design', 'Frontend', 'Backend'];
  squads.forEach((sq, i) => {
    const sw = i === 0 ? 38 : sq.length * 7 + 20;
    const sx = 16 + [0, 52, 114, 194][i];
    els.push(pill(sx, 158, sw, 26, i === 0 ? P.accent : P.surface));
    els.push(text(sx + sw/2, 174, sq, 11, i === 0 ? '#FFF' : P.textSub, '500', 'center'));
  });

  // Members list
  const members = [
    { n: 'Maya Chen', r: 'Design Lead', sq: 'Design', act: 'Working on Meridian tokens', online: true, av: 'MC', ac: P.accent },
    { n: 'Kai Tanaka', r: 'Frontend', sq: 'Frontend', act: 'Atlas dashboard sprint', online: true, av: 'KT', ac: '#31C97E' },
    { n: 'Priya Rao', r: 'Backend', sq: 'Backend', act: 'Relay API - blocked', online: true, av: 'PR', ac: P.accent4 },
    { n: 'Leo Müller', r: 'Frontend', sq: 'Frontend', act: 'Last seen 2h ago', online: false, av: 'LM', ac: P.accent2 },
    { n: 'Sara Kim', r: 'PM', sq: 'Design', act: 'Sprint planning docs', online: true, av: 'SK', ac: '#9B59B6' },
  ];

  members.forEach((m, i) => {
    const my = 200 + i * 74;
    els.push(rect(16, my, W - 32, 66, P.surface, 14));
    // avatar
    els.push(circle(44, my + 33, 20, m.ac + '22'));
    els.push(text(44, my + 38, m.av, 12, m.ac, '700', 'center'));
    // online dot
    if (m.online) els.push(circle(58, my + 15, 5, P.accent3));
    else els.push(circle(58, my + 15, 5, P.textSub));
    // name + role
    els.push(text(74, my + 24, m.n, 13, P.text, '600'));
    els.push(text(74, my + 42, m.r + ' · ' + m.sq, 10, P.textSub, '400'));
    els.push(text(74, my + 57, m.act, 10, P.textSub + 'AA', '400'));
    els.push(text(W - 28, my + 37, '›', 16, P.textSub, '300', 'center'));
  });

  els.push(...bottomNav(2));
  return { id: 'screen3', title: 'Team Roster', width: W, height: H, backgroundColor: P.bg, elements: els };
}

// ─── SCREEN 4: Sprint Review / Reports ───────────────────────────────────────
function screen4() {
  const els = [rect(0, 0, W, H, P.bg), ...statusBar()];

  els.push(text(20, 72, 'Sprint Review', 22, P.text, '800'));
  els.push(text(20, 92, 'Sprint 13 · Closed Mar 21', 12, P.textSub, '400'));

  // KPI bento row
  const kpis = [
    { l: 'Velocity', v: '92', u: 'pts', c: P.accent },
    { l: 'Completion', v: '87', u: '%', c: P.accent3 },
    { l: 'Bugs Fixed', v: '11', u: '', c: P.accent2 },
  ];
  const kpiW = (W - 40) / 3;
  kpis.forEach((k, i) => {
    const kx = 16 + i * (kpiW + 4);
    els.push(rect(kx, 108, kpiW, 76, P.surface, 14));
    els.push(text(kx + kpiW/2, 132, k.l, 9, P.textSub, '500', 'center'));
    els.push(text(kx + kpiW/2, 160, k.v + k.u, 22, k.c, '800', 'center'));
    els.push(text(kx + kpiW/2, 176, '↑ +4', 9, P.accent3, '500', 'center'));
  });

  // Burndown chart (simplified)
  els.push(rect(16, 196, W - 32, 140, P.surface, 14));
  els.push(text(28, 218, 'Burndown', 12, P.text, '700'));
  els.push(text(28, 234, 'Sprint 13 · 14 days', 10, P.textSub, '400'));
  // Chart area
  const cxStart = 28, cxEnd = W - 36, cyTop = 244, cyBot = 318;
  const cw = cxEnd - cxStart;
  const ch = cyBot - cyTop;
  // ideal line
  els.push(line(cxStart, cyTop, cxEnd, cyBot, P.border, 1.5));
  // actual path approximation (series of line segments)
  const actualPts = [0, 0.05, 0.15, 0.22, 0.30, 0.38, 0.5, 0.58, 0.65, 0.72, 0.80, 0.87, 0.92, 1.0];
  for (let i = 0; i < actualPts.length - 1; i++) {
    const px1 = cxStart + (i / (actualPts.length - 1)) * cw;
    const py1 = cyTop + actualPts[i] * ch;
    const px2 = cxStart + ((i+1) / (actualPts.length - 1)) * cw;
    const py2 = cyTop + actualPts[i+1] * ch;
    els.push(line(px1, py1, px2, py2, P.accent, 2));
  }
  // last point dot
  els.push(circle(cxEnd, cyBot, 4, P.accent));

  // Category breakdown
  els.push(text(20, 352, 'By Category', 12, P.text, '700'));
  const cats = [
    { l: 'Features', pct: 68, c: P.accent },
    { l: 'Bug Fixes', pct: 22, c: P.accent3 },
    { l: 'Tech Debt', pct: 10, c: P.accent2 },
  ];
  cats.forEach((c, i) => {
    const cy = 368 + i * 52;
    els.push(rect(16, cy, W - 32, 44, P.surface, 10));
    els.push(text(28, cy + 15, c.l, 11, P.text, '500'));
    els.push(text(W - 24, cy + 15, c.pct + '%', 11, c.c, '700', 'right'));
    els.push(rect(28, cy + 26, W - 56, 7, P.surface3, 4));
    els.push(rect(28, cy + 26, (W - 56) * (c.pct / 100), 7, c.c, 4));
  });

  // Retrospective highlights
  els.push(text(20, 528, 'Retrospective', 12, P.text, '700'));
  const retros = [
    { icon: '✓', t: 'Smooth design handoffs via Figma tokens', c: P.accent3 },
    { icon: '△', t: 'Backend API bottlenecked 3 features', c: P.accent2 },
    { icon: '●', t: 'Add async standups to next sprint ritual', c: P.accent },
  ];
  retros.forEach((r, i) => {
    const ry = 545 + i * 50;
    els.push(rect(16, ry, W - 32, 42, P.surface, 10));
    els.push(circle(34, ry + 21, 12, r.c + '22'));
    els.push(text(34, ry + 26, r.icon, 10, r.c, '700', 'center'));
    els.push(text(54, ry + 25, r.t, 11, P.text, '400'));
  });

  els.push(...bottomNav(3));
  return { id: 'screen4', title: 'Sprint Review', width: W, height: H, backgroundColor: P.bg, elements: els };
}

// ─── SCREEN 5: Quick Check-in ─────────────────────────────────────────────────
function screen5() {
  const els = [rect(0, 0, W, H, P.bg), ...statusBar()];

  // Sheet handle
  els.push(rect(0, 80, W, H - 80, P.surface, 0));
  rect(0, 80, W, H - 80, P.surface, 24); // rounded top
  els.push(rect(W/2 - 24, 96, 48, 4, P.border, 999));

  els.push(text(W/2, 130, 'Quick Check-in', 18, P.text, '700', 'center'));
  els.push(text(W/2, 150, 'Meridian App · Kai Tanaka', 12, P.textSub, '400', 'center'));

  // Status selector
  els.push(text(20, 180, 'Status', 11, P.textSub, '600'));
  const statuses = [
    { l: 'On track', c: P.accent3 },
    { l: 'At risk', c: P.accent2 },
    { l: 'Blocked', c: P.accent4 },
  ];
  statuses.forEach((s, i) => {
    const sx = 20 + i * 122;
    const isActive = i === 0;
    els.push(rect(sx, 194, 110, 36, isActive ? s.c + '22' : P.surface3, 10));
    els.push(line(sx, 194, sx + 110, 194, isActive ? s.c : P.border));
    if (isActive) {
      els.push(rect(sx, 194, 110, 36, 'transparent', 10));
      els.push(line(sx, 194, sx + 110, 194, s.c, 2));
      els.push(line(sx, 230, sx + 110, 230, s.c, 2));
      els.push(line(sx, 194, sx, 230, s.c, 2));
      els.push(line(sx + 110, 194, sx + 110, 230, s.c, 2));
    }
    els.push(text(sx + 55, 216, s.l, 11, isActive ? s.c : P.textSub, isActive ? '600' : '400', 'center'));
  });

  // What did you do?
  els.push(text(20, 252, 'What did you work on?', 11, P.textSub, '600'));
  els.push(rect(16, 266, W - 32, 80, P.surface3, 10));
  els.push(text(28, 296, 'Completed auth token refresh logic,', 12, P.text, '400'));
  els.push(text(28, 312, 'reviewing PR for mobile nav...', 12, P.textSub, '400'));

  // Any blockers?
  els.push(text(20, 366, 'Any blockers?', 11, P.textSub, '600'));
  els.push(rect(16, 380, W - 32, 56, P.surface3, 10));
  els.push(text(28, 412, 'No blockers today ✓', 12, P.textSub, '400'));

  // Mood
  els.push(text(20, 452, 'Team pulse', 11, P.textSub, '600'));
  els.push(rect(16, 466, W - 32, 52, P.surface3, 10));
  const moods = ['😩', '😐', '🙂', '😊', '🚀'];
  moods.forEach((m, i) => {
    const mx = 36 + i * ((W - 52) / 5) + (W - 52) / 10;
    const isActive = i === 3;
    if (isActive) els.push(circle(mx, 492, 18, P.accent + '22'));
    els.push(text(mx, 498, m, 18, '#000', 'normal', 'center'));
  });

  // Submit button
  els.push(rect(16, 536, W - 32, 50, P.accent, 14));
  els.push(text(W/2, 565, 'Submit Check-in', 14, '#FFFFFF', '600', 'center'));

  // Cancel
  els.push(text(W/2, 602, 'Cancel', 13, P.textSub, '400', 'center'));

  return { id: 'screen5', title: 'Quick Check-in', width: W, height: H, backgroundColor: P.bg, elements: els };
}

// ─── Assemble ─────────────────────────────────────────────────────────────────
const doc = makeDoc([screen1(), screen2(), screen3(), screen4(), screen5()]);
fs.writeFileSync('/workspace/group/design-studio/bloc.pen', JSON.stringify(doc, null, 2));
console.log('✓ bloc.pen written —', doc.screens.length, 'screens');
