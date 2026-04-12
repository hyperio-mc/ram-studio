// relay-app.js — RELAY AI agent orchestration dashboard
// Theme: DARK — space black #0A0C10 + cool surface #111420 + terminal green #00D47A
// Inspired by:
//   Neon.com (found via darkmodedesign.com, Mar 30 2026)
//     — Deep near-black bg, signature bright #00E5BF teal-green, "Fast Postgres for
//        Teams and Agents" — agentic AI framing becoming dominant in dev tooling dark UIs
//   Chus Retro OS Portfolio + Litbix (minimal.gallery, Mar 30 2026)
//     — Terminal window chrome aesthetic, monospace text as a design element
//   Land-book.com (Mar 30 2026) — Interfere testing tool: dark minimal with
//        subtle card grids and status indicators
// Concept: AI agent task orchestration — monitor, route, and inspect autonomous agents.
//   Novel pattern: agent "heartbeat" pulse cards + monospace log stream component.
//   First time using terminal/log-stream as primary UI element in heartbeat series.
// Theme rotation: GATHER was light → RELAY is DARK ✓
// 5 screens: Dashboard, Agent Detail, Task Queue, Log Stream, Settings

import fs from 'fs';

const W = 375, H = 812, GAP = 80, SCREENS = 5;
const canvas_w = SCREENS * W + (SCREENS + 1) * GAP;

// ─── Palette ──────────────────────────────────────────────────────────────────
const BG      = '#0A0C10'; // deep space black
const SURFACE = '#111420'; // card surface
const RAISED  = '#181C2C'; // slightly raised
const DEEP    = '#0D0F18'; // deeper inset
const BORDER  = '#1E2438'; // subtle border
const BORDER2 = '#252A3E'; // slightly more visible border

const TEXT    = '#E2E8F5'; // cool off-white
const MUTED   = '#6B7A99'; // medium muted
const DIM     = '#3A4260'; // dim
const FAINT   = '#151829'; // faintest fill

const GREEN   = '#00D47A'; // terminal green (primary — Neon-inspired)
const GREEN2  = '#00A85F'; // deeper green
const GREENLT = '#001A0F'; // green tint bg
const GREENGLOW = '#00D47A22'; // glow

const VIOLET  = '#7C5CFC'; // electric violet (secondary agents)
const VIOLETLT= '#1A123A'; // violet tint
const AMBER   = '#F5A623'; // warning amber
const AMBERLT = '#1F1509'; // amber tint
const CORAL   = '#FF5C7A'; // error / inactive coral
const CORALLT = '#200A10'; // coral tint

const MONO  = 'JetBrains Mono'; // terminal feel
const SANS  = 'Inter';

let nodes = [];
let id = 1;

// ─── Primitives ───────────────────────────────────────────────────────────────
function rect(name, x, y, w, h, fill, opts = {}) {
  nodes.push({
    type: 'RECTANGLE', id: `node_${id++}`, name,
    x, y, width: w, height: h, fill,
    cornerRadius: opts.cr || 0,
    opacity: opts.op || 1,
    stroke: opts.stroke || null,
    strokeWidth: opts.sw || 0,
    strokeAlign: 'inside',
  });
}

function text(name, x, y, w, content, size, color, opts = {}) {
  nodes.push({
    type: 'TEXT', id: `node_${id++}`, name,
    x, y, width: w, height: opts.h || size * 1.4,
    content, fontSize: size,
    fontFamily: opts.font || SANS,
    fontWeight: opts.weight || 400,
    color, textAlign: opts.align || 'left',
    opacity: opts.op || 1,
    letterSpacing: opts.ls || 0,
    lineHeight: opts.lh || null,
  });
}

function circle(name, x, y, r, fill, opts = {}) {
  nodes.push({
    type: 'ELLIPSE', id: `node_${id++}`, name,
    x: x - r, y: y - r, width: r * 2, height: r * 2, fill,
    opacity: opts.op || 1,
    stroke: opts.stroke || null,
    strokeWidth: opts.sw || 0,
  });
}

// ─── Offset helper ────────────────────────────────────────────────────────────
function ox(screenIndex) {
  return GAP + screenIndex * (W + GAP);
}

// ─── Status dot ───────────────────────────────────────────────────────────────
function statusDot(x, y, status) {
  const colors = { active: GREEN, idle: AMBER, error: CORAL, offline: MUTED };
  const c = colors[status] || MUTED;
  circle(`dot-${status}`, x, y, 4, c);
  circle(`dot-ring-${status}`, x, y, 7, 'transparent', { stroke: c, sw: 1, op: 0.3 });
}

// ─── Screen backgrounds ───────────────────────────────────────────────────────
for (let i = 0; i < SCREENS; i++) {
  rect(`screen-bg-${i}`, ox(i), 0, W, H, BG);
}

// ────────────────────────────────────────────────────────────────────────────────
// SCREEN 0 — DASHBOARD
// ────────────────────────────────────────────────────────────────────────────────
const s0 = ox(0);

// Status bar
rect('s0-statusbar', s0, 0, W, 44, BG);
text('s0-time', s0 + 16, 14, 60, '09:41', 14, TEXT, { font: MONO, weight: 600 });
text('s0-signal', s0 + W - 70, 14, 60, '▮▮▮', 12, MUTED, { align: 'right' });

// Header
text('s0-wordmark', s0 + 20, 54, 100, 'relay', 22, GREEN, { font: MONO, weight: 700, ls: -0.5 });
text('s0-version', s0 + 84, 60, 50, 'v2.4', 11, MUTED, { font: MONO });
// Notification bell
rect('s0-notif-bg', s0 + W - 52, 50, 32, 32, RAISED, { cr: 8 });
text('s0-notif', s0 + W - 41, 59, 14, '◉', 14, VIOLET);

// Summary row
rect('s0-summary-bg', s0 + 20, 98, W - 40, 68, SURFACE, { cr: 12 });
rect('s0-summary-accent', s0 + 20, 98, 3, 68, GREEN, { cr: 2 });

const sumItems = [
  { label: 'ACTIVE', val: '6', col: GREEN },
  { label: 'QUEUED', val: '14', col: AMBER },
  { label: 'DONE', val: '47', col: MUTED },
  { label: 'ERRORS', val: '2', col: CORAL },
];
sumItems.forEach((item, i) => {
  const ix = s0 + 36 + i * 78;
  text(`s0-sum-val-${i}`, ix, 110, 70, item.val, 20, item.col, { font: MONO, weight: 700 });
  text(`s0-sum-lbl-${i}`, ix, 133, 70, item.label, 9, MUTED, { font: MONO, weight: 600, ls: 0.8 });
});

// Section label
text('s0-sec-agents', s0 + 20, 182, 120, 'AGENTS', 10, MUTED, { font: MONO, weight: 600, ls: 1.2 });
text('s0-sec-all', s0 + W - 50, 182, 40, 'ALL →', 10, GREEN, { font: MONO, align: 'right' });

// Agent cards (3 in main view)
const agents = [
  { name: 'researcher-01', task: 'Scraping product docs', model: 'gpt-4o', status: 'active',  progress: 74, accent: GREEN,  bg: GREENLT  },
  { name: 'writer-02',     task: 'Drafting blog post',   model: 'claude-3.5', status: 'active', progress: 41, accent: VIOLET, bg: VIOLETLT },
  { name: 'validator-03',  task: 'Awaiting next task',   model: 'gpt-4o-mini', status: 'idle',   progress: 0,  accent: AMBER,  bg: AMBERLT  },
];

agents.forEach((agent, i) => {
  const ay = 204 + i * 108;
  rect(`s0-agent-bg-${i}`, s0 + 20, ay, W - 40, 96, SURFACE, { cr: 12 });
  rect(`s0-agent-border-${i}`, s0 + 20, ay, W - 40, 96, 'transparent', { cr: 12, stroke: agent.accent, sw: 1, op: 0.25 });

  // Accent glow strip
  rect(`s0-agent-glow-${i}`, s0 + 20, ay, W - 40, 2, agent.accent, { cr: 2, op: 0.6 });

  // Name + status
  text(`s0-agent-name-${i}`, s0 + 32, ay + 14, 200, agent.name, 13, TEXT, { font: MONO, weight: 600 });
  statusDot(s0 + W - 52, ay + 20, agent.status);

  // Model chip
  rect(`s0-model-bg-${i}`, s0 + 32, ay + 34, 90, 18, RAISED, { cr: 4 });
  text(`s0-model-${i}`, s0 + 37, ay + 36, 80, agent.model, 9, MUTED, { font: MONO });

  // Task description
  text(`s0-task-${i}`, s0 + 32, ay + 57, W - 80, agent.task, 11, MUTED);

  // Progress bar
  if (agent.progress > 0) {
    rect(`s0-prog-bg-${i}`, s0 + 32, ay + 78, W - 80, 4, DIM, { cr: 2 });
    rect(`s0-prog-fill-${i}`, s0 + 32, ay + 78, Math.round((W - 80) * agent.progress / 100), 4, agent.accent, { cr: 2 });
    text(`s0-prog-pct-${i}`, s0 + W - 52, ay + 72, 30, `${agent.progress}%`, 9, agent.accent, { font: MONO, align: 'right' });
  } else {
    text(`s0-idle-label-${i}`, s0 + 32, ay + 75, 100, '○ IDLE', 10, AMBER, { font: MONO });
  }
});

// Log teaser
rect('s0-log-bg', s0 + 20, 532, W - 40, 100, DEEP, { cr: 12 });
rect('s0-log-header', s0 + 20, 532, W - 40, 28, SURFACE, { cr: 12 });
rect('s0-log-header-b', s0 + 20, 548, W - 40, 12, SURFACE);  // fix rounded only top
text('s0-log-title', s0 + 32, 538, 80, 'LOG STREAM', 9, GREEN, { font: MONO, weight: 600, ls: 1 });
text('s0-log-live', s0 + W - 55, 538, 30, '● LIVE', 9, CORAL, { font: MONO });

const logLines = [
  { t: '09:41:03', msg: '[researcher-01] fetched 12 new records', col: TEXT },
  { t: '09:41:01', msg: '[writer-02] token usage: 847/4096', col: MUTED },
  { t: '09:40:58', msg: '[validator-03] task complete ✓', col: GREEN },
];
logLines.forEach((line, i) => {
  text(`s0-log-t-${i}`, s0 + 28, 566 + i * 20, 65, line.t, 9, MUTED, { font: MONO });
  text(`s0-log-msg-${i}`, s0 + 97, 566 + i * 20, W - 120, line.msg, 9, line.col, { font: MONO });
});

// Bottom nav
rect('s0-nav-bg', s0, H - 72, W, 72, SURFACE);
rect('s0-nav-border', s0, H - 72, W, 1, BORDER);
const navItems = [
  { icon: '⬡', label: 'Agents', active: true },
  { icon: '☰', label: 'Queue', active: false },
  { icon: '▶', label: 'Logs', active: false },
  { icon: '◎', label: 'Settings', active: false },
];
navItems.forEach((nav, i) => {
  const nx = s0 + 18 + i * 85;
  text(`s0-nav-icon-${i}`, nx, H - 56, 50, nav.icon, 18, nav.active ? GREEN : DIM, { align: 'center' });
  text(`s0-nav-lbl-${i}`, nx, H - 34, 50, nav.label, 9, nav.active ? GREEN : MUTED, { align: 'center', font: MONO });
});

// ────────────────────────────────────────────────────────────────────────────────
// SCREEN 1 — AGENT DETAIL
// ────────────────────────────────────────────────────────────────────────────────
const s1 = ox(1);

rect('s1-statusbar', s1, 0, W, 44, BG);
text('s1-time', s1 + 16, 14, 60, '09:41', 14, TEXT, { font: MONO, weight: 600 });

// Back header
text('s1-back', s1 + 20, 58, 40, '←', 16, TEXT);
text('s1-title', s1 + 50, 58, 200, 'researcher-01', 15, TEXT, { font: MONO, weight: 600 });

// Agent hero card
rect('s1-hero', s1 + 20, 88, W - 40, 140, SURFACE, { cr: 14 });
rect('s1-hero-glow', s1 + 20, 88, W - 40, 3, GREEN, { cr: 2 });

// Big status ring
circle('s1-ring-outer', s1 + 60, s1 < 0 ? 0 : 158, 28, 'transparent', { stroke: GREEN, sw: 2, op: 0.2 });
circle('s1-ring-inner', s1 + 60, 158, 20, GREENLT);
text('s1-ring-icon', s1 + 44, 150, 32, '⬡', 16, GREEN, { align: 'center' });

text('s1-agent-name', s1 + 98, 142, 200, 'researcher-01', 16, TEXT, { font: MONO, weight: 700 });
text('s1-model-chip', s1 + 98, 164, 80, 'gpt-4o  ·  Active', 11, GREEN);
text('s1-uptime', s1 + 98, 180, 150, 'Uptime: 4h 23m', 11, MUTED, { font: MONO });

// Stats row
const s1stats = [
  { k: 'TASKS', v: '23' },
  { k: 'TOKENS', v: '184K' },
  { k: 'ERRORS', v: '0' },
];
s1stats.forEach((st, i) => {
  const sx = s1 + 32 + i * 100;
  text(`s1-stat-val-${i}`, sx, 208, 90, st.v, 18, TEXT, { font: MONO, weight: 700 });
  text(`s1-stat-lbl-${i}`, sx, 230, 90, st.k, 9, MUTED, { font: MONO, weight: 600, ls: 0.8 });
});

// Current task section
text('s1-curtask-lbl', s1 + 20, 250, 140, 'CURRENT TASK', 10, MUTED, { font: MONO, weight: 600, ls: 1.2 });
rect('s1-curtask-bg', s1 + 20, 268, W - 40, 88, SURFACE, { cr: 12 });
rect('s1-curtask-left', s1 + 20, 268, 3, 88, GREEN, { cr: 2 });
text('s1-curtask-title', s1 + 34, 280, W - 60, 'Scraping product documentation', 13, TEXT, { weight: 600 });
text('s1-curtask-sub', s1 + 34, 298, W - 60, 'Task #T-204 · Started 14 min ago', 11, MUTED);
// Progress
rect('s1-task-prog-bg', s1 + 34, 322, W - 68, 6, DIM, { cr: 3 });
rect('s1-task-prog-fill', s1 + 34, 322, Math.round((W - 68) * 0.74), 6, GREEN, { cr: 3 });
text('s1-task-pct', s1 + W - 48, 316, 30, '74%', 10, GREEN, { font: MONO, align: 'right' });
text('s1-task-step', s1 + 34, 338, W - 60, '↳ Step 18 of 24 · fetching page 12/16', 10, MUTED, { font: MONO });

// Memory / context
text('s1-mem-lbl', s1 + 20, 372, 120, 'CONTEXT WINDOW', 10, MUTED, { font: MONO, weight: 600, ls: 1.2 });
rect('s1-mem-bg', s1 + 20, 390, W - 40, 60, SURFACE, { cr: 12 });
rect('s1-mem-bar-bg', s1 + 32, 408, W - 64, 8, DIM, { cr: 4 });
rect('s1-mem-bar-fill', s1 + 32, 408, Math.round((W - 64) * 0.62), 8, VIOLET, { cr: 4 });
text('s1-mem-used', s1 + 32, 422, 120, '2,541 / 4,096 tokens', 10, MUTED, { font: MONO });
text('s1-mem-pct', s1 + W - 48, 416, 30, '62%', 10, VIOLET, { font: MONO, align: 'right' });

// Recent tasks
text('s1-recent-lbl', s1 + 20, 468, 140, 'RECENT TASKS', 10, MUTED, { font: MONO, weight: 600, ls: 1.2 });
const recTasks = [
  { task: 'T-203', desc: 'Fetch competitor pricing data', done: true },
  { task: 'T-202', desc: 'Summarize changelog v3.1', done: true },
  { task: 'T-201', desc: 'Extract FAQ sections', done: true },
];
recTasks.forEach((t, i) => {
  const ty = 488 + i * 48;
  rect(`s1-rt-bg-${i}`, s1 + 20, ty, W - 40, 40, SURFACE, { cr: 8 });
  text(`s1-rt-icon-${i}`, s1 + 32, ty + 12, 16, '✓', 12, GREEN);
  text(`s1-rt-id-${i}`, s1 + 50, ty + 8, 50, t.task, 10, MUTED, { font: MONO });
  text(`s1-rt-desc-${i}`, s1 + 50, ty + 22, W - 100, t.desc, 11, TEXT);
});

// Nav
rect('s1-nav-bg', s1, H - 72, W, 72, SURFACE);
rect('s1-nav-border', s1, H - 72, W, 1, BORDER);
navItems.forEach((nav, i) => {
  const nx = s1 + 18 + i * 85;
  text(`s1-nav-icon-${i}`, nx, H - 56, 50, nav.icon, 18, nav.active ? GREEN : DIM, { align: 'center' });
  text(`s1-nav-lbl-${i}`, nx, H - 34, 50, nav.label, 9, nav.active ? GREEN : MUTED, { align: 'center', font: MONO });
});

// ────────────────────────────────────────────────────────────────────────────────
// SCREEN 2 — TASK QUEUE
// ────────────────────────────────────────────────────────────────────────────────
const s2 = ox(2);

rect('s2-statusbar', s2, 0, W, 44, BG);
text('s2-time', s2 + 16, 14, 60, '09:41', 14, TEXT, { font: MONO, weight: 600 });

text('s2-title', s2 + 20, 58, 150, 'Task Queue', 20, TEXT, { weight: 700 });
text('s2-count', s2 + W - 60, 58, 50, '14 tasks', 12, MUTED, { align: 'right' });

// Tab bar
const tabs = ['All', 'Pending', 'Active', 'Done'];
rect('s2-tabs-bg', s2 + 20, 90, W - 40, 36, SURFACE, { cr: 10 });
tabs.forEach((tab, i) => {
  const tx = s2 + 24 + i * 82;
  if (i === 0) rect(`s2-tab-active`, tx, 93, 74, 30, RAISED, { cr: 8 });
  text(`s2-tab-${i}`, tx, 100, 74, tab, 12, i === 0 ? GREEN : MUTED, { align: 'center', font: i === 0 ? MONO : SANS, weight: i === 0 ? 600 : 400 });
});

// Task items
const tasks = [
  { id: 'T-218', title: 'Generate API reference docs', agent: 'writer-02', pri: 'HIGH',   status: 'active',  tag: VIOLET },
  { id: 'T-219', title: 'Validate JSON schemas',       agent: 'validator-03', pri: 'MED', status: 'pending', tag: AMBER  },
  { id: 'T-220', title: 'Scrape competitor pricing',   agent: 'researcher-01', pri: 'MED', status: 'pending', tag: AMBER  },
  { id: 'T-221', title: 'Summarize user interviews',   agent: '—',            pri: 'LOW', status: 'pending', tag: DIM   },
  { id: 'T-222', title: 'Build knowledge graph',       agent: '—',            pri: 'HIGH',  status: 'pending', tag: AMBER  },
  { id: 'T-216', title: 'Index product changelog',     agent: 'researcher-01', pri: 'LOW', status: 'done',    tag: GREEN  },
  { id: 'T-217', title: 'Draft feature brief',         agent: 'writer-02',    pri: 'MED', status: 'done',    tag: GREEN  },
];

tasks.forEach((task, i) => {
  const ty = 142 + i * 75;
  if (ty + 65 > H - 80) return;
  const isDone = task.status === 'done';
  rect(`s2-task-bg-${i}`, s2 + 20, ty, W - 40, 66, isDone ? DEEP : SURFACE, { cr: 10 });
  rect(`s2-task-tag-${i}`, s2 + 20, ty, 3, 66, task.tag, { cr: 2 });

  text(`s2-task-id-${i}`, s2 + 34, ty + 10, 55, task.id, 10, MUTED, { font: MONO });
  // Priority chip
  rect(`s2-pri-bg-${i}`, s2 + 92, ty + 8, 36, 16, task.tag + '22', { cr: 3 });
  text(`s2-pri-${i}`, s2 + 95, ty + 10, 30, task.pri, 9, task.tag, { font: MONO, weight: 600 });
  // Status
  text(`s2-status-${i}`, s2 + W - 55, ty + 10, 40, task.status === 'active' ? '▶ run' : task.status === 'done' ? '✓ done' : '○ wait', 9, task.tag, { font: MONO, align: 'right' });

  text(`s2-task-title-${i}`, s2 + 34, ty + 30, W - 74, task.title, 13, isDone ? MUTED : TEXT, { weight: isDone ? 400 : 600, op: isDone ? 0.6 : 1 });
  text(`s2-task-agent-${i}`, s2 + 34, ty + 48, 180, `Agent: ${task.agent}`, 10, MUTED, { font: MONO });
});

// Nav
rect('s2-nav-bg', s2, H - 72, W, 72, SURFACE);
rect('s2-nav-border', s2, H - 72, W, 1, BORDER);
navItems.forEach((nav, i) => {
  const nx = s2 + 18 + i * 85;
  const isActive = i === 1;
  text(`s2-nav-icon-${i}`, nx, H - 56, 50, nav.icon, 18, isActive ? GREEN : DIM, { align: 'center' });
  text(`s2-nav-lbl-${i}`, nx, H - 34, 50, nav.label, 9, isActive ? GREEN : MUTED, { align: 'center', font: MONO });
});

// ────────────────────────────────────────────────────────────────────────────────
// SCREEN 3 — LOG STREAM (terminal view)
// ────────────────────────────────────────────────────────────────────────────────
const s3 = ox(3);

rect('s3-statusbar', s3, 0, W, 44, BG);
text('s3-time', s3 + 16, 14, 60, '09:41', 14, TEXT, { font: MONO, weight: 600 });

// Terminal chrome header
rect('s3-term-header', s3 + 20, 54, W - 40, 36, SURFACE, { cr: 10 });
// Traffic light dots
circle('s3-dot-r', s3 + 42, 72, 5, '#FF5C5C');
circle('s3-dot-y', s3 + 58, 72, 5, '#FFBF00');
circle('s3-dot-g', s3 + 74, 72, 5, '#28CA41');
text('s3-term-title', s3 + 95, 64, 180, 'relay:logs — bash', 11, MUTED, { font: MONO });

// Terminal body
rect('s3-term-body', s3 + 20, 90, W - 40, H - 180, DEEP, { cr: 12 });
rect('s3-term-body-top', s3 + 20, 90, W - 40, 12, DEEP);

// Log lines
const logs = [
  { t: '09:41:03', level: 'INFO',  agent: 'researcher-01', msg: 'fetched 12 records from source', col: GREEN },
  { t: '09:41:01', level: 'INFO',  agent: 'writer-02',     msg: 'token usage: 847/4096', col: TEXT },
  { t: '09:40:58', level: 'INFO',  agent: 'validator-03',  msg: 'task T-216 complete', col: GREEN },
  { t: '09:40:52', level: 'WARN',  agent: 'writer-02',     msg: 'rate limit approaching (85%)', col: AMBER },
  { t: '09:40:47', level: 'INFO',  agent: 'researcher-01', msg: 'step 16/24 — parsing HTML', col: TEXT },
  { t: '09:40:44', level: 'INFO',  agent: 'researcher-01', msg: 'navigating to page 11/16', col: TEXT },
  { t: '09:40:39', level: 'INFO',  agent: 'validator-03',  msg: 'schema validated OK: user.json', col: GREEN },
  { t: '09:40:35', level: 'ERROR', agent: 'writer-02',     msg: 'retry 1/3 after timeout', col: CORAL },
  { t: '09:40:31', level: 'INFO',  agent: 'writer-02',     msg: 'reconnecting to endpoint', col: TEXT },
  { t: '09:40:28', level: 'INFO',  agent: 'researcher-01', msg: 'step 14/24 — extracting links', col: TEXT },
  { t: '09:40:22', level: 'INFO',  agent: 'validator-03',  msg: 'starting schema validation', col: TEXT },
  { t: '09:40:18', level: 'INFO',  agent: 'researcher-01', msg: 'fetched 8 records from source', col: GREEN },
  { t: '09:40:14', level: 'INFO',  agent: 'writer-02',     msg: 'draft section 4/8 complete', col: TEXT },
  { t: '09:40:08', level: 'WARN',  agent: 'researcher-01', msg: 'slow response — 2400ms', col: AMBER },
  { t: '09:40:02', level: 'INFO',  agent: 'writer-02',     msg: 'started task T-218', col: GREEN },
  { t: '09:39:55', level: 'INFO',  agent: 'researcher-01', msg: 'started task T-204', col: GREEN },
];

logs.forEach((log, i) => {
  const ly = 102 + i * 36;
  if (ly + 28 > H - 100) return;
  // Timestamp
  text(`s3-lt-${i}`, s3 + 28, ly, 65, log.t, 9, DIM, { font: MONO });
  // Level badge
  const lcolor = log.level === 'ERROR' ? CORAL : log.level === 'WARN' ? AMBER : log.level === 'INFO' ? MUTED : TEXT;
  rect(`s3-level-bg-${i}`, s3 + 94, ly - 1, 36, 14, lcolor + '22', { cr: 2 });
  text(`s3-level-${i}`, s3 + 96, ly, 32, log.level, 8, lcolor, { font: MONO, weight: 700 });
  // Agent
  text(`s3-lagent-${i}`, s3 + 134, ly, 90, log.agent, 9, VIOLET, { font: MONO });
  // Message
  text(`s3-lmsg-${i}`, s3 + 28, ly + 16, W - 56, log.msg, 9, log.col, { font: MONO, op: 0.85 });
});

// Cursor blink simulation
text('s3-cursor', s3 + 28, 102 + logs.length * 36, 10, '▌', 12, GREEN);

// Filter bar at bottom
rect('s3-filter-bg', s3 + 20, H - 140, W - 40, 46, SURFACE, { cr: 10 });
rect('s3-filter-border', s3 + 20, H - 140, W - 40, 46, 'transparent', { cr: 10, stroke: BORDER2, sw: 1 });
text('s3-filter-icon', s3 + 34, H - 123, 16, '▾', 12, MUTED);
text('s3-filter-text', s3 + 52, H - 123, 160, 'Filter logs…', 12, DIM, { font: MONO });
const filterChips = ['ALL', 'ERR', 'WARN'];
filterChips.forEach((chip, i) => {
  const isA = i === 0;
  rect(`s3-chip-bg-${i}`, s3 + W - 118 + i * 34, H - 132, 28, 16, isA ? GREEN + '33' : RAISED, { cr: 4 });
  text(`s3-chip-${i}`, s3 + W - 116 + i * 34, H - 130, 24, chip, 8, isA ? GREEN : MUTED, { font: MONO, align: 'center' });
});

// Nav
rect('s3-nav-bg', s3, H - 72, W, 72, SURFACE);
rect('s3-nav-border', s3, H - 72, W, 1, BORDER);
navItems.forEach((nav, i) => {
  const nx = s3 + 18 + i * 85;
  const isActive = i === 2;
  text(`s3-nav-icon-${i}`, nx, H - 56, 50, nav.icon, 18, isActive ? GREEN : DIM, { align: 'center' });
  text(`s3-nav-lbl-${i}`, nx, H - 34, 50, nav.label, 9, isActive ? GREEN : MUTED, { align: 'center', font: MONO });
});

// ────────────────────────────────────────────────────────────────────────────────
// SCREEN 4 — SETTINGS
// ────────────────────────────────────────────────────────────────────────────────
const s4 = ox(4);

rect('s4-statusbar', s4, 0, W, 44, BG);
text('s4-time', s4 + 16, 14, 60, '09:41', 14, TEXT, { font: MONO, weight: 600 });

text('s4-title', s4 + 20, 58, 150, 'Settings', 20, TEXT, { weight: 700 });

// Profile section
rect('s4-profile-bg', s4 + 20, 94, W - 40, 80, SURFACE, { cr: 12 });
circle('s4-avatar-bg', s4 + 57, 134, 22, RAISED);
text('s4-avatar-init', s4 + 46, 126, 22, 'RK', 13, GREEN, { font: MONO, weight: 700, align: 'center' });
text('s4-user-name', s4 + 90, 116, 180, 'Rakis', 15, TEXT, { weight: 600 });
text('s4-user-plan', s4 + 90, 134, 180, 'Pro Plan · 6 agents active', 12, MUTED);
rect('s4-plan-badge', s4 + 90, 150, 60, 16, GREEN + '22', { cr: 4 });
text('s4-plan-lbl', s4 + 95, 152, 52, 'PRO', 9, GREEN, { font: MONO, weight: 700 });

// API Keys section
text('s4-api-lbl', s4 + 20, 190, 120, 'API KEYS', 10, MUTED, { font: MONO, weight: 600, ls: 1.2 });
const apiKeys = [
  { name: 'OpenAI', key: 'sk-••••••••••••••••3f8a', active: true },
  { name: 'Anthropic', key: 'sk-ant-••••••••••2c1d', active: true },
  { name: 'Serper', key: 'ser-••••••••••••1b4e', active: false },
];
apiKeys.forEach((key, i) => {
  const ky = 208 + i * 58;
  rect(`s4-key-bg-${i}`, s4 + 20, ky, W - 40, 50, SURFACE, { cr: 10 });
  text(`s4-key-name-${i}`, s4 + 32, ky + 10, 100, key.name, 13, TEXT, { weight: 600 });
  text(`s4-key-val-${i}`, s4 + 32, ky + 28, 200, key.key, 10, MUTED, { font: MONO });
  // Toggle
  rect(`s4-tog-bg-${i}`, s4 + W - 66, ky + 12, 40, 20, key.active ? GREEN + '44' : DIM, { cr: 10 });
  circle(`s4-tog-knob-${i}`, s4 + (key.active ? W - 36 : W - 56), ky + 22, 8, key.active ? GREEN : MUTED);
});

// Model defaults
text('s4-model-lbl', s4 + 20, 386, 150, 'MODEL DEFAULTS', 10, MUTED, { font: MONO, weight: 600, ls: 1.2 });
const modelSettings = [
  { label: 'Research tasks', val: 'gpt-4o' },
  { label: 'Writing tasks', val: 'claude-3.5-sonnet' },
  { label: 'Validation', val: 'gpt-4o-mini' },
];
modelSettings.forEach((ms, i) => {
  const my = 404 + i * 54;
  rect(`s4-ms-bg-${i}`, s4 + 20, my, W - 40, 46, SURFACE, { cr: 10 });
  text(`s4-ms-lbl-${i}`, s4 + 32, my + 10, 140, ms.label, 12, MUTED);
  text(`s4-ms-val-${i}`, s4 + 32, my + 27, W - 80, ms.val, 13, TEXT, { font: MONO, weight: 600 });
  text(`s4-ms-arrow-${i}`, s4 + W - 42, my + 16, 20, '›', 16, DIM, { align: 'right' });
});

// Misc settings
text('s4-misc-lbl', s4 + 20, 570, 150, 'GENERAL', 10, MUTED, { font: MONO, weight: 600, ls: 1.2 });
const miscItems = [
  { label: 'Dark mode', val: 'Enabled' },
  { label: 'Log retention', val: '30 days' },
  { label: 'Auto-retry failed tasks', val: 'On' },
];
miscItems.forEach((item, i) => {
  const iy = 588 + i * 48;
  if (iy + 40 > H - 80) return;
  rect(`s4-misc-bg-${i}`, s4 + 20, iy, W - 40, 40, SURFACE, { cr: 8 });
  text(`s4-misc-lbl-${i}`, s4 + 32, iy + 12, 160, item.label, 13, TEXT);
  text(`s4-misc-val-${i}`, s4 + W - 44, iy + 12, 80, item.val, 12, MUTED, { align: 'right' });
});

// Nav
rect('s4-nav-bg', s4, H - 72, W, 72, SURFACE);
rect('s4-nav-border', s4, H - 72, W, 1, BORDER);
navItems.forEach((nav, i) => {
  const nx = s4 + 18 + i * 85;
  const isActive = i === 3;
  text(`s4-nav-icon-${i}`, nx, H - 56, 50, nav.icon, 18, isActive ? GREEN : DIM, { align: 'center' });
  text(`s4-nav-lbl-${i}`, nx, H - 34, 50, nav.label, 9, isActive ? GREEN : MUTED, { align: 'center', font: MONO });
});

// ─── Export ───────────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  metadata: {
    name: 'Relay — AI Agent Orchestration',
    description: 'Dark terminal-green UI for monitoring and routing AI agents. Inspired by Neon.com\'s developer-agentic aesthetic and retro terminal patterns.',
    theme: 'dark',
    tags: ['ai', 'agents', 'developer', 'dark', 'terminal', 'dashboard'],
    createdAt: new Date().toISOString(),
    canvasWidth: canvas_w,
    canvasHeight: H,
  },
  canvas: { width: canvas_w, height: H, background: '#0A0C10' },
  nodes,
};

fs.writeFileSync('/workspace/group/design-studio/relay.pen', JSON.stringify(pen, null, 2));
console.log(`✓ relay.pen written — ${nodes.length} nodes, canvas ${canvas_w}×${H}`);
