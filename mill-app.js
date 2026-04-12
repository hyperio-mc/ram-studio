/**
 * MILL — set tasks in motion
 * Light theme personal AI task orchestrator
 *
 * Inspired by:
 *  • JetBrains Air (lapa.ninja, 2026) — "Multitask with agents, stay in control"
 *    light functional interface, airy grid layout, concise typography
 *  • Old Tom Capital (minimal.gallery, 2026) — warm paper ledger aesthetic,
 *    editorial serif hierarchy, ink-like minimal accents
 *
 * Theme: LIGHT — warm parchment + white + ink + forest green + amber
 *
 * Pencil.dev format v2.8
 */

'use strict';
const fs = require('fs');

// ── Palette ────────────────────────────────────────────────────────────────
const BG       = '#F5F1EB';   // warm parchment
const CARD     = '#FFFFFF';   // white card
const CARD2    = '#F0EDE7';   // tinted card / pressed state
const INK      = '#1A1715';   // near-black ink
const INK2     = '#4A4540';   // secondary ink
const MUTED    = '#9E9690';   // muted tertiary
const DIVIDER  = '#E4DFD8';   // divider line
const GREEN    = '#2D6A4F';   // forest green accent
const GREEN_LT = '#D8EDE3';   // green tint
const AMBER    = '#C4741A';   // amber / warm highlight
const AMBER_LT = '#FBF0E0';   // amber tint
const RED_LT   = '#FDECEA';   // status: blocked
const RED      = '#C0392B';   // blocked text

// ── Typography ─────────────────────────────────────────────────────────────
const SERIF  = 'Georgia, "Times New Roman", serif';
const SANS   = '"Inter", "Helvetica Neue", Arial, sans-serif';
const MONO   = '"JetBrains Mono", "Courier New", monospace';

// ── Helpers ────────────────────────────────────────────────────────────────
let idCounter = 1;
const uid  = () => `el_${idCounter++}`;

function rect(x, y, w, h, fill, rx = 0) {
  return { type: 'RECTANGLE', id: uid(), x, y, width: w, height: h,
    fills: [{ type: 'SOLID', color: hexToRgb(fill) }],
    cornerRadius: rx, strokes: [], strokeWeight: 0 };
}

function rectOutline(x, y, w, h, fill, stroke, rx = 0) {
  return { type: 'RECTANGLE', id: uid(), x, y, width: w, height: h,
    fills: fill ? [{ type: 'SOLID', color: hexToRgb(fill) }] : [],
    cornerRadius: rx,
    strokes: [{ type: 'SOLID', color: hexToRgb(stroke) }],
    strokeWeight: 1 };
}

function text(x, y, content, size, color, weight = 400, fontFamily = SANS, align = 'LEFT', w = null) {
  const node = { type: 'TEXT', id: uid(), x, y,
    characters: content,
    fontSize: size,
    fontWeight: weight,
    fontFamily,
    fills: [{ type: 'SOLID', color: hexToRgb(color) }],
    textAlignHorizontal: align };
  if (w !== null) node.width = w;
  return node;
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return { r, g, b };
}

function group(children, id) {
  return { type: 'GROUP', id: id || uid(), children };
}

// ── Status badge ───────────────────────────────────────────────────────────
function badge(x, y, label, bg, fg, rx = 10) {
  const pad = 8; const th = 18; const tw = label.length * 6.5 + pad * 2;
  return [
    rect(x, y, tw, th, bg, rx),
    text(x + pad, y + 3, label, 10, fg, 600, SANS),
  ];
}

// ── Pill tag ───────────────────────────────────────────────────────────────
function pillTag(x, y, label, bg, fg) {
  const tw = label.length * 6 + 14;
  return [
    rect(x, y, tw, 20, bg, 10),
    text(x + 7, y + 4, label, 10, fg, 500, SANS),
  ];
}

// ── Top navigation bar ─────────────────────────────────────────────────────
function navBar(activeLabel) {
  const labels = ['Home', 'Tasks', 'Agents', 'New', 'Insights'];
  const icons  = ['⊞', '✓', '◈', '+', '〜'];
  const itemW  = 72;
  const children = [
    rect(0, 736, 390, 64, CARD),
    { type: 'RECTANGLE', id: uid(), x: 0, y: 736, width: 390, height: 1,
      fills: [{ type: 'SOLID', color: hexToRgb(DIVIDER) }], strokes: [], strokeWeight: 0 },
  ];
  labels.forEach((label, i) => {
    const bx = i * itemW + (390 - labels.length * itemW) / 2;
    const isActive = label === activeLabel;
    children.push(
      text(bx + itemW / 2 - 7, 749, icons[i], 16, isActive ? GREEN : MUTED, isActive ? 700 : 400, SANS),
      text(bx + itemW / 2 - label.length * 3, 769, label, 9, isActive ? GREEN : MUTED, isActive ? 600 : 400, SANS),
    );
  });
  return group(children);
}

// ── Status bar ─────────────────────────────────────────────────────────────
function statusBar() {
  return group([
    rect(0, 0, 390, 44, BG),
    text(16, 14, '9:41', 14, INK, 600, MONO),
    text(320, 14, '●●● ✦ 87%', 12, INK2, 400, MONO),
  ]);
}

// ══════════════════════════════════════════════════════════════════════════
//  SCREEN 1 — HOME / DASHBOARD
// ══════════════════════════════════════════════════════════════════════════
function screenHome() {
  const els = [
    rect(0, 0, 390, 800, BG),
    statusBar(),

    // ── Header ──────────────────────────────────────────────────────────
    text(20, 56, 'Good morning, Alex.', 22, INK, 700, SERIF),
    text(20, 84, 'Saturday, March 28', 13, MUTED, 400, SANS),

    // ── Summary cards row ───────────────────────────────────────────────
    // Card: Active tasks
    rect(20, 110, 106, 70, CARD, 10),
    text(30, 122, '12', 28, INK, 700, MONO),
    text(30, 156, 'Active', 11, MUTED, 400, SANS),

    // Card: Done today
    rect(138, 110, 106, 70, CARD, 10),
    text(148, 122, '7', 28, INK, 700, MONO),
    text(148, 156, 'Done today', 11, MUTED, 400, SANS),

    // Card: Agents on
    rect(256, 110, 114, 70, CARD, 10),
    text(266, 122, '3/5', 28, GREEN, 700, MONO),
    text(266, 156, 'Agents on', 11, MUTED, 400, SANS),

    // ── Section label ────────────────────────────────────────────────────
    text(20, 200, 'IN PROGRESS', 10, MUTED, 600, SANS),
    { type: 'RECTANGLE', id: uid(), x: 20, y: 215, width: 350, height: 1,
      fills: [{ type: 'SOLID', color: hexToRgb(DIVIDER) }], strokes: [], strokeWeight: 0 },

    // Task row 1
    rect(20, 220, 350, 68, CARD, 8),
    rect(20, 220, 4, 68, GREEN, 4),
    text(34, 232, 'Research competitors for Q2 deck', 13, INK, 600, SANS),
    text(34, 252, 'Assigned to Researcher · 80% done', 11, MUTED, 400, SANS),
    ...pillTag(34, 269, 'Research', GREEN_LT, GREEN),
    rect(330, 235, 30, 30, GREEN_LT, 15),
    text(339, 246, '↗', 13, GREEN, 600, SANS),

    // Task row 2
    rect(20, 296, 350, 68, CARD, 8),
    rect(20, 296, 4, 68, AMBER, 4),
    text(34, 308, 'Draft onboarding email sequence (5x)', 13, INK, 600, SANS),
    text(34, 328, 'Assigned to Writer · 45% done', 11, MUTED, 400, SANS),
    ...pillTag(34, 345, 'Writing', AMBER_LT, AMBER),
    rect(330, 311, 30, 30, AMBER_LT, 15),
    text(339, 322, '↗', 13, AMBER, 600, SANS),

    // Task row 3
    rect(20, 372, 350, 68, CARD, 8),
    rect(20, 372, 4, 68, RED, 4),
    text(34, 384, 'Fix checkout flow — staging error', 13, INK, 600, SANS),
    text(34, 404, 'Assigned to Dev · Needs review', 11, MUTED, 400, SANS),
    ...badge(34, 422, '⚠ BLOCKED', RED_LT, RED, 10),

    // ── Quick actions ────────────────────────────────────────────────────
    text(20, 458, 'QUICK DELEGATE', 10, MUTED, 600, SANS),
    { type: 'RECTANGLE', id: uid(), x: 20, y: 473, width: 350, height: 1,
      fills: [{ type: 'SOLID', color: hexToRgb(DIVIDER) }], strokes: [], strokeWeight: 0 },

    rect(20, 478, 350, 48, CARD, 8),
    rect(20, 478, 350, 48, BG, 8),
    { type: 'RECTANGLE', id: uid(), x: 20, y: 478, width: 350, height: 48,
      fills: [{ type: 'SOLID', color: hexToRgb(BG) }],
      cornerRadius: 8, strokes: [{ type: 'SOLID', color: hexToRgb(DIVIDER) }], strokeWeight: 1.5 },
    text(36, 494, '+ Describe a new task to delegate…', 14, MUTED, 400, SERIF),

    // ── Agent pulse ──────────────────────────────────────────────────────
    text(20, 544, 'AGENT ACTIVITY', 10, MUTED, 600, SANS),
    { type: 'RECTANGLE', id: uid(), x: 20, y: 559, width: 350, height: 1,
      fills: [{ type: 'SOLID', color: hexToRgb(DIVIDER) }], strokes: [], strokeWeight: 0 },

    // Agent pill row
    ...agentPulse(20, 564, 'Researcher', 'Writing report…', GREEN),
    ...agentPulse(20, 604, 'Writer', 'Drafting email 3/5…', AMBER),
    ...agentPulse(20, 644, 'Dev', 'Awaiting review', MUTED),

    navBar('Home'),
  ];
  return { name: 'Home', width: 390, height: 800, backgroundColor: hexToRgb(BG), children: els };
}

function agentPulse(x, y, name, status, color) {
  return [
    rect(x, y, 350, 36, CARD, 18),
    rect(x + 12, y + 12, 12, 12, color, 6),
    text(x + 32, y + 10, name, 12, INK, 600, SANS),
    text(x + 32, y + 24, status, 10, MUTED, 400, SANS),
    text(x + 320, y + 12, '⋯', 14, MUTED, 400, SANS),
  ];
}

// ══════════════════════════════════════════════════════════════════════════
//  SCREEN 2 — TASK BOARD
// ══════════════════════════════════════════════════════════════════════════
function screenTasks() {
  const els = [
    rect(0, 0, 390, 800, BG),
    statusBar(),

    text(20, 56, 'Tasks', 26, INK, 700, SERIF),
    text(20, 88, '19 total · 12 active · 7 done today', 12, MUTED, 400, SANS),

    // Filter tabs
    ...filterTab(20, 106, 'All', true),
    ...filterTab(76, 106, 'Active', false),
    ...filterTab(140, 106, 'Done', false),
    ...filterTab(196, 106, 'Blocked', false),

    text(20, 148, 'TODAY', 10, MUTED, 600, SANS),
    { type: 'RECTANGLE', id: uid(), x: 20, y: 163, width: 350, height: 1,
      fills: [{ type: 'SOLID', color: hexToRgb(DIVIDER) }], strokes: [], strokeWeight: 0 },

    ...taskRow(20, 168, 'Research competitors for Q2 deck', 'Researcher', 'in-progress', 80),
    ...taskRow(20, 236, 'Draft onboarding email sequence', 'Writer', 'in-progress', 45),
    ...taskRow(20, 304, 'Fix checkout flow bug', 'Dev', 'blocked', 0),
    ...taskRow(20, 372, 'Schedule 3 investor calls', 'Scheduler', 'done', 100),
    ...taskRow(20, 440, 'Summarize weekly analytics report', 'Analyst', 'done', 100),

    text(20, 520, 'EARLIER', 10, MUTED, 600, SANS),
    { type: 'RECTANGLE', id: uid(), x: 20, y: 535, width: 350, height: 1,
      fills: [{ type: 'SOLID', color: hexToRgb(DIVIDER) }], strokes: [], strokeWeight: 0 },

    ...taskRow(20, 540, 'Write FAQ page for product site', 'Writer', 'done', 100),
    ...taskRow(20, 608, 'Find 10 podcast leads in fintech', 'Researcher', 'done', 100),

    navBar('Tasks'),
  ];
  return { name: 'Tasks', width: 390, height: 800, backgroundColor: hexToRgb(BG), children: els };
}

function filterTab(x, y, label, active) {
  const w = label.length * 7 + 16;
  return [
    rect(x, y, w, 26, active ? GREEN : CARD, 13),
    text(x + 8, y + 6, label, 11, active ? '#FFFFFF' : INK2, active ? 600 : 400, SANS),
  ];
}

function taskRow(x, y, title, agent, status, pct) {
  const statusColors = {
    'in-progress': { bg: GREEN_LT, fg: GREEN, label: 'IN PROGRESS' },
    'blocked':     { bg: RED_LT,   fg: RED,   label: 'BLOCKED' },
    'done':        { bg: '#EEF5EE', fg: '#2D6A2D', label: 'DONE' },
  };
  const sc = statusColors[status];
  const isDone = status === 'done';
  return [
    rect(x, y, 350, 60, CARD, 8),
    text(x + 12, y + 10, isDone ? '✓  ' + title : title, 12, isDone ? MUTED : INK, isDone ? 400 : 600, SANS),
    text(x + 12, y + 28, agent, 10, MUTED, 400, SANS),
    // progress bar bg
    rect(x + 12, y + 46, 200, 4, CARD2, 2),
    // progress bar fill
    rect(x + 12, y + 46, pct * 2, 4, isDone ? '#2D6A2D' : (status === 'blocked' ? RED : GREEN), 2),
    ...badge(x + 260, y + 8, sc.label, sc.bg, sc.fg, 10),
  ];
}

// ══════════════════════════════════════════════════════════════════════════
//  SCREEN 3 — AGENTS
// ══════════════════════════════════════════════════════════════════════════
function screenAgents() {
  const agents = [
    { name: 'Researcher',  role: 'Web research & synthesis',    tasks: 4, status: 'active',  load: 80 },
    { name: 'Writer',      role: 'Copy, emails & long-form',    tasks: 3, status: 'active',  load: 60 },
    { name: 'Dev',         role: 'Code review & bug fixes',     tasks: 2, status: 'paused',  load: 20 },
    { name: 'Scheduler',   role: 'Calendar & meeting prep',     tasks: 1, status: 'idle',    load: 10 },
    { name: 'Analyst',     role: 'Data summaries & reporting',  tasks: 2, status: 'active',  load: 55 },
  ];
  const statusMap = { active: { c: GREEN, l: 'ACTIVE' }, paused: { c: AMBER, l: 'PAUSED' }, idle: { c: MUTED, l: 'IDLE' } };

  const els = [
    rect(0, 0, 390, 800, BG),
    statusBar(),
    text(20, 56, 'Agents', 26, INK, 700, SERIF),
    text(20, 88, '3 active · 2 available', 12, MUTED, 400, SANS),
  ];

  agents.forEach((a, i) => {
    const ay = 112 + i * 112;
    const sc = statusMap[a.status];
    els.push(
      rect(20, ay, 350, 98, CARD, 10),
      // avatar circle
      rect(20, ay, 4, 98, sc.c, 4),
      { type: 'RECTANGLE', id: uid(), x: 32, y: ay + 18, width: 40, height: 40,
        fills: [{ type: 'SOLID', color: hexToRgb(a.status === 'active' ? GREEN_LT : CARD2) }],
        cornerRadius: 20, strokes: [], strokeWeight: 0 },
      text(45, ay + 32, a.name.slice(0, 2).toUpperCase(), 14, a.status === 'active' ? GREEN : MUTED, 700, MONO),
      // info
      text(82, ay + 20, a.name, 14, INK, 700, SANS),
      ...badge(82 + a.name.length * 8, ay + 22, sc.l, a.status === 'active' ? GREEN_LT : CARD2, sc.c, 8),
      text(82, ay + 40, a.role, 11, MUTED, 400, SANS),
      text(82, ay + 58, `${a.tasks} tasks assigned`, 11, INK2, 500, SANS),
      // load bar
      text(82, ay + 76, 'Load', 9, MUTED, 400, SANS),
      rect(120, ay + 78, 200, 6, CARD2, 3),
      rect(120, ay + 78, a.load * 2, 6, sc.c, 3),
      text(326, ay + 76, `${a.load}%`, 9, sc.c, 600, MONO),
    );
  });

  els.push(navBar('Agents'));
  return { name: 'Agents', width: 390, height: 800, backgroundColor: hexToRgb(BG), children: els };
}

// ══════════════════════════════════════════════════════════════════════════
//  SCREEN 4 — NEW TASK
// ══════════════════════════════════════════════════════════════════════════
function screenNewTask() {
  const els = [
    rect(0, 0, 390, 800, BG),
    statusBar(),

    text(20, 56, 'New Task', 26, INK, 700, SERIF),
    text(20, 88, 'Describe what you need done', 13, MUTED, 400, SANS),

    // Input area — large natural language box
    { type: 'RECTANGLE', id: uid(), x: 20, y: 112, width: 350, height: 120,
      fills: [{ type: 'SOLID', color: hexToRgb(CARD) }],
      cornerRadius: 10, strokes: [{ type: 'SOLID', color: hexToRgb(GREEN) }], strokeWeight: 1.5 },
    text(32, 124, '"Research the top 5 AI coding tools', 13, INK, 400, SERIF),
    text(32, 144, 'launched in 2026 and summarize', 13, INK, 400, SERIF),
    text(32, 164, 'pricing, key features and target', 13, INK, 400, SERIF),
    text(32, 184, 'audience in a 1-page brief."', 13, INK, 400, SERIF),
    text(32, 212, '|', 16, GREEN, 400, MONO),

    // AI suggestion
    rect(20, 244, 350, 60, GREEN_LT, 10),
    text(32, 254, '✦ Suggested agent', 11, GREEN, 600, SANS),
    text(32, 272, 'Researcher — best match for web research', 13, GREEN, 500, SANS),
    text(32, 290, '& synthesis tasks', 13, GREEN, 400, SANS),

    // Options row
    text(20, 320, 'OPTIONS', 10, MUTED, 600, SANS),
    { type: 'RECTANGLE', id: uid(), x: 20, y: 335, width: 350, height: 1,
      fills: [{ type: 'SOLID', color: hexToRgb(DIVIDER) }], strokes: [], strokeWeight: 0 },

    // Priority
    rect(20, 340, 350, 48, CARD, 8),
    text(32, 356, 'Priority', 13, INK, 500, SANS),
    ...pillTag(270, 352, 'Normal', CARD2, INK2),

    // Due date
    rect(20, 396, 350, 48, CARD, 8),
    text(32, 412, 'Due date', 13, INK, 500, SANS),
    text(268, 412, 'No deadline', 13, MUTED, 400, SANS),

    // Notify
    rect(20, 452, 350, 48, CARD, 8),
    text(32, 468, 'Notify when done', 13, INK, 500, SANS),
    rect(310, 461, 30, 18, GREEN, 9),
    rect(322, 463, 14, 14, CARD, 7),

    // Divider
    { type: 'RECTANGLE', id: uid(), x: 20, y: 508, width: 350, height: 1,
      fills: [{ type: 'SOLID', color: hexToRgb(DIVIDER) }], strokes: [], strokeWeight: 0 },

    // Example prompts
    text(20, 518, 'INSPIRATION', 10, MUTED, 600, SANS),
    ...promptChip(20, 536, 'Summarize my inbox'),
    ...promptChip(168, 536, 'Find 10 leads in…'),
    ...promptChip(20, 564, 'Write a job post for…'),
    ...promptChip(166, 564, 'Fix the bug in…'),

    // Submit button
    rect(20, 680, 350, 52, GREEN, 12),
    text(152, 699, 'Delegate Task →', 15, CARD, 700, SANS),

    navBar('New'),
  ];
  return { name: 'New Task', width: 390, height: 800, backgroundColor: hexToRgb(BG), children: els };
}

function promptChip(x, y, label) {
  const w = label.length * 7 + 20;
  return [
    { type: 'RECTANGLE', id: uid(), x, y, width: w, height: 24,
      fills: [{ type: 'SOLID', color: hexToRgb(CARD) }],
      cornerRadius: 12, strokes: [{ type: 'SOLID', color: hexToRgb(DIVIDER) }], strokeWeight: 1 },
    text(x + 10, y + 5, label, 11, INK2, 400, SANS),
  ];
}

// ══════════════════════════════════════════════════════════════════════════
//  SCREEN 5 — INSIGHTS
// ══════════════════════════════════════════════════════════════════════════
function screenInsights() {
  const els = [
    rect(0, 0, 390, 800, BG),
    statusBar(),

    text(20, 56, 'Insights', 26, INK, 700, SERIF),
    text(20, 88, 'Last 7 days', 12, MUTED, 400, SANS),

    // ── Headline metrics ────────────────────────────────────────────────
    text(20, 116, 'DELEGATION OVERVIEW', 10, MUTED, 600, SANS),
    { type: 'RECTANGLE', id: uid(), x: 20, y: 131, width: 350, height: 1,
      fills: [{ type: 'SOLID', color: hexToRgb(DIVIDER) }], strokes: [], strokeWeight: 0 },

    rect(20, 136, 163, 78, CARD, 10),
    text(32, 148, '63', 36, INK, 700, MONO),
    text(32, 190, 'Tasks delegated', 11, MUTED, 400, SANS),

    rect(197, 136, 173, 78, CARD, 10),
    text(209, 148, '94%', 36, GREEN, 700, MONO),
    text(209, 190, 'Completion rate', 11, MUTED, 400, SANS),

    // ── Bar chart: tasks per day ─────────────────────────────────────────
    text(20, 232, 'TASKS PER DAY', 10, MUTED, 600, SANS),
    { type: 'RECTANGLE', id: uid(), x: 20, y: 247, width: 350, height: 1,
      fills: [{ type: 'SOLID', color: hexToRgb(DIVIDER) }], strokes: [], strokeWeight: 0 },
    rect(20, 252, 350, 130, CARD, 10),
    ...barChart(32, 258, [7, 12, 5, 9, 14, 8, 10]),

    // ── Time saved ───────────────────────────────────────────────────────
    text(20, 400, 'TIME SAVED', 10, MUTED, 600, SANS),
    { type: 'RECTANGLE', id: uid(), x: 20, y: 415, width: 350, height: 1,
      fills: [{ type: 'SOLID', color: hexToRgb(DIVIDER) }], strokes: [], strokeWeight: 0 },
    rect(20, 420, 350, 72, CARD, 10),
    text(32, 434, '14.2 hrs', 28, AMBER, 700, MONO),
    text(32, 468, 'estimated time saved this week', 11, MUTED, 400, SANS),
    rect(270, 438, 80, 20, AMBER_LT, 10),
    text(280, 442, '↑ 22% vs last wk', 10, AMBER, 500, SANS),

    // ── Top agents ───────────────────────────────────────────────────────
    text(20, 510, 'TOP AGENTS THIS WEEK', 10, MUTED, 600, SANS),
    { type: 'RECTANGLE', id: uid(), x: 20, y: 525, width: 350, height: 1,
      fills: [{ type: 'SOLID', color: hexToRgb(DIVIDER) }], strokes: [], strokeWeight: 0 },

    ...agentStat(20, 530, 'Researcher',  26, GREEN, 1),
    ...agentStat(20, 568, 'Writer',      18, AMBER, 2),
    ...agentStat(20, 606, 'Analyst',     12, INK2,  3),
    ...agentStat(20, 644, 'Scheduler',    7, MUTED, 4),

    navBar('Insights'),
  ];
  return { name: 'Insights', width: 390, height: 800, backgroundColor: hexToRgb(BG), children: els };
}

function barChart(x, y, values) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const maxVal = Math.max(...values);
  const barW = 36; const maxH = 80; const gap = 12;
  const els = [];
  values.forEach((v, i) => {
    const bh = Math.round((v / maxVal) * maxH);
    const bx = x + i * (barW + gap);
    const isLast = i === values.length - 1;
    els.push(
      rect(bx, y + maxH - bh + 4, barW, bh, isLast ? GREEN : CARD2, 4),
      text(bx + barW / 2 - 4, y + maxH + 8, days[i], 10, MUTED, 400, SANS),
    );
    if (isLast) {
      els.push(
        rect(bx, y + maxH - bh + 4, barW, bh, GREEN, 4),
        text(bx + 4, y + maxH - bh - 14, String(v), 10, GREEN, 600, MONO),
      );
    }
  });
  return els;
}

function agentStat(x, y, name, tasks, color, rank) {
  return [
    rect(x, y, 350, 32, CARD, 8),
    text(x + 12, y + 9, `${rank}.`, 11, MUTED, 400, MONO),
    text(x + 30, y + 9, name, 12, INK, 600, SANS),
    rect(x + 200, y + 13, tasks * 5, 6, color, 3),
    text(x + 210 + tasks * 5, y + 9, `${tasks} tasks`, 11, MUTED, 400, SANS),
  ];
}

// ══════════════════════════════════════════════════════════════════════════
//  ASSEMBLE .PEN FILE
// ══════════════════════════════════════════════════════════════════════════
const pen = {
  version: '2.8',
  id: 'mill-heartbeat-' + Date.now(),
  name: 'MILL — set tasks in motion',
  description: 'Light-theme personal AI task orchestrator. Warm parchment + forest green + amber. Inspired by JetBrains Air (lapa.ninja) functional agent UI and Old Tom Capital (minimal.gallery) editorial paper aesthetic.',
  screens: [
    screenHome(),
    screenTasks(),
    screenAgents(),
    screenNewTask(),
    screenInsights(),
  ],
};

fs.writeFileSync('mill.pen', JSON.stringify(pen, null, 2));
console.log('✓ mill.pen written —', pen.screens.length, 'screens');
console.log('  Screen names:', pen.screens.map(s => s.name).join(', '));
