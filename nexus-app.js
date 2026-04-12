'use strict';
/**
 * NEXUS — Real-time AI agent operations platform
 *
 * Inspired by:
 * 1. JetBrains Air (lapa.ninja) — "Multitask with agents, stay in control"
 *    The emerging agentic AI UX trend — humans overseeing many concurrent agents
 * 2. Darkroom / Midday (darkmodedesign.com) — deep-black editorial dark mode,
 *    tight grid layouts, minimalist productivity aesthetic with strong type hierarchy
 * 3. Interfere (land-book) — "Build software that never breaks" — dense monitoring
 *    UI with calm, controlled visual language
 *
 * Theme: DARK — near-black with electric teal + soft violet accents
 * Challenge: multi-agent status dashboard with status-dot micro-patterns and
 * real-time activity feed — interaction density I haven't explored before
 */

const fs = require('fs');

const T = {
  bg:        '#0B0B0E',
  surface:   '#131318',
  surface2:  '#1C1C24',
  surface3:  '#242430',
  teal:      '#00E8C8',
  tealDim:   'rgba(0,232,200,0.12)',
  tealGlow:  'rgba(0,232,200,0.22)',
  violet:    '#8B72F8',
  violetDim: 'rgba(139,114,248,0.13)',
  amber:     '#F5A623',
  amberDim:  'rgba(245,166,35,0.13)',
  red:       '#F05A5A',
  redDim:    'rgba(240,90,90,0.13)',
  green:     '#3EE8A0',
  greenDim:  'rgba(62,232,160,0.13)',
  text:      '#EEEEF2',
  textMid:   '#8888A2',
  textMute:  'rgba(238,238,242,0.32)',
  border:    'rgba(255,255,255,0.07)',
  border2:   'rgba(255,255,255,0.11)',
};

const W = 375, H = 812, GAP = 80;
let _id = 0;
const uid = () => `nx${++_id}`;

function rect(x, y, w, h, fill, opts = {}) {
  return {
    id: uid(), type: 'rectangle',
    x, y, width: w, height: h,
    fill: fill || 'transparent',
    cornerRadius: opts.r ?? 0,
    opacity: opts.opacity ?? 1,
    ...(opts.shadow ? { shadow: { x: 0, y: 4, blur: 20, color: 'rgba(0,0,0,0.55)' } } : {}),
    ...(opts.border ? { border: { color: opts.border, width: opts.bw ?? 1 } } : {}),
  };
}

function text(x, y, w, content, opts = {}) {
  return {
    id: uid(), type: 'text',
    x, y, width: w, content,
    fontSize:    opts.size ?? 13,
    fontFamily:  opts.mono ? '"JetBrains Mono","SF Mono",monospace' : '"Inter","Helvetica Neue",sans-serif',
    fontWeight:  opts.bold ? '700' : opts.semi ? '600' : opts.medium ? '500' : opts.light ? '300' : '400',
    color:       opts.color ?? T.text,
    textAlign:   opts.center ? 'center' : opts.right ? 'right' : 'left',
    lineHeight:  opts.lh ?? (opts.size >= 24 ? 1.15 : opts.size >= 16 ? 1.3 : 1.5),
    letterSpacing: opts.ls ?? (opts.size >= 20 ? -0.5 : opts.caps ? 1.2 : 0),
    opacity:     opts.opacity ?? 1,
    ...(opts.caps ? { textTransform: 'uppercase' } : {}),
  };
}

function frame(x, y, w, h, children, opts = {}) {
  return {
    id: uid(), type: 'frame',
    x, y, width: w, height: h,
    fill: opts.fill ?? 'transparent',
    cornerRadius: opts.r ?? 0,
    children: children.filter(Boolean),
    ...(opts.border ? { border: { color: opts.border, width: 1 } } : {}),
    ...(opts.shadow ? { shadow: { x: 0, y: 4, blur: 24, color: 'rgba(0,0,0,0.4)' } } : {}),
  };
}

function ellipse(x, y, w, h, fill, opts = {}) {
  return { id: uid(), type: 'ellipse', x, y, width: w, height: h, fill, opacity: opts.opacity ?? 1 };
}

function statusDot(x, y, status) {
  const colors = { running: T.teal, pending: T.amber, error: T.red, paused: T.violet, done: T.green, idle: T.textMute };
  const c = colors[status] || T.textMute;
  return [
    ellipse(x - 5, y - 5, 10, 10, c, { opacity: 0.18 }),
    ellipse(x - 3, y - 3, 6, 6, c),
  ];
}

function progressBar(x, y, w, pct, color, opts = {}) {
  const h = opts.h ?? 3;
  const r = h / 2;
  return [
    rect(x, y, w, h, T.border2, { r }),
    rect(x, y, Math.max(r * 2, w * Math.min(pct, 1)), h, color, { r }),
  ];
}

function card(x, y, w, h, children) {
  return frame(x, y, w, h, [
    rect(0, 0, w, h, T.surface, { r: 12, border: T.border, shadow: true }),
    ...children,
  ], { r: 12 });
}

function navBar(yOff, active) {
  const items = ['Overview','Agents','Feed','Tasks','Inspect'];
  const tw = W / items.length;
  const ch = [
    rect(0, 0, W, 68, T.surface),
    rect(0, 0, W, 1, T.border2),
  ];
  items.forEach((label, i) => {
    const cx = i * tw + tw / 2;
    const isActive = i === active;
    if (isActive) ch.push(rect(cx - 22, 8, 44, 38, T.tealDim, { r: 10 }));
    ch.push(ellipse(cx - 9, 15, 18, 18, isActive ? T.tealGlow : 'transparent'));
    ch.push(rect(cx - 6, 18, 12, 12, 'transparent', { border: isActive ? T.teal : T.textMute, r: 2, bw: 1.5 }));
    ch.push(text(cx - tw / 2 + 2, 36, tw - 4, label, { size: 9, center: true, caps: true, ls: 0.5, color: isActive ? T.teal : T.textMute }));
  });
  return frame(0, yOff, W, 68, ch, { fill: T.surface });
}

function statusBar(yOff) {
  return frame(0, yOff, W, 44, [
    rect(0, 0, W, 44, T.bg),
    text(20, 14, 80, '09:41', { size: 15, semi: true }),
    text(W - 72, 14, 62, '▪▪▪  100%', { size: 11, color: T.textMid, right: true }),
  ]);
}

// ── SCREEN 1: OVERVIEW ───────────────────────────────────────────────────────
function screen1(off) {
  const y = off, e = [];
  e.push(rect(0, y, W, H, T.bg));
  e.push(statusBar(y));

  // Header
  e.push(text(20, y + 52, 160, 'NEXUS', { size: 24, bold: true, ls: -0.8 }));
  e.push(text(20, y + 80, 220, 'Agent Operations Center', { size: 12, color: T.textMid }));
  e.push(...statusDot(W - 52, y + 62, 'running'));
  e.push(text(W - 42, y + 56, 38, 'LIVE', { size: 9.5, caps: true, color: T.teal, ls: 1.2, mono: true }));
  e.push(rect(20, y + 98, W - 40, 1, T.border2));

  // System health metrics
  const metrics = [
    { val: '8', label: 'Agents Active', color: T.teal },
    { val: '24', label: 'Tasks Queued', color: T.violet },
    { val: '1', label: 'Errors', color: T.red },
  ];
  metrics.forEach((m, i) => {
    const mx = 16 + i * 116;
    e.push(card(mx, y + 110, 108, 74, [
      text(12, 10, 84, m.val, { size: 30, bold: true, color: m.color, ls: -1.5 }),
      text(12, 46, 84, m.label, { size: 10.5, color: T.textMid, lh: 1.3 }),
    ]));
  });

  // Running agents section
  e.push(text(20, y + 202, 120, 'RUNNING', { size: 9.5, caps: true, color: T.textMid, ls: 1.5, mono: true }));
  e.push(text(W - 56, y + 202, 44, '8 / 12', { size: 10, color: T.teal, mono: true, right: true }));

  const agents = [
    { name: 'code-gen-01', type: 'CODE', pct: 0.72, status: 'running', color: T.teal, time: '14m' },
    { name: 'doc-parser', type: 'DATA', pct: 0.45, status: 'running', color: T.violet, time: '7m' },
    { name: 'test-runner', type: 'TEST', pct: 0.89, status: 'running', color: T.green, time: '21m' },
    { name: 'web-scraper', type: 'SCRAPE', pct: 0.30, status: 'pending', color: T.amber, time: '2m' },
    { name: 'data-clean', type: 'DATA', pct: 0.55, status: 'running', color: T.violet, time: '9m' },
    { name: 'ml-trainer', type: 'ML', pct: 0.18, status: 'error', color: T.red, time: '3m' },
  ];
  const colW = (W - 48) / 2;
  agents.forEach((ag, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const ax = 16 + col * (colW + 8), ay = y + 222 + row * 92;
    e.push(card(ax, ay, colW, 82, [
      rect(10, 10, 44, 16, T.bg, { r: 4, border: ag.color, bw: 1 }),
      text(10, 11, 44, ag.type, { size: 9, caps: true, color: ag.color, ls: 0.7, center: true, mono: true }),
      ...statusDot(colW - 14, 19, ag.status),
      text(10, 32, colW - 22, ag.name, { size: 11.5, mono: true, medium: true }),
      text(10, 50, 44, ag.time, { size: 10, color: T.textMid, mono: true }),
      text(colW - 30, 48, 24, `${Math.round(ag.pct * 100)}%`, { size: 10, color: ag.color, mono: true, right: true }),
      ...progressBar(10, 66, colW - 20, ag.pct, ag.color, { h: 3 }),
    ]));
  });

  // Recent events
  e.push(text(20, y + 526, 140, 'RECENT EVENTS', { size: 9.5, caps: true, color: T.textMid, ls: 1.5, mono: true }));
  const events = [
    { msg: 'test-runner completed suite_alpha', color: T.green },
    { msg: 'ml-trainer raised OOMError', color: T.red },
    { msg: 'code-gen-01 pushed 3 files', color: T.teal },
  ];
  events.forEach((ev, i) => {
    const ey = y + 548 + i * 52;
    e.push(card(16, ey, W - 32, 42, [
      rect(0, 0, 3, 42, ev.color, { r: 0 }),
      text(18, 12, W - 70, ev.msg, { size: 12 }),
      text(W - 68, 12, 54, `${(i + 1) * 40}s ago`, { size: 10, mono: true, color: T.textMute, right: true }),
    ]));
  });

  e.push(navBar(y + H - 68, 0));
  return e;
}

// ── SCREEN 2: AGENTS LIST ────────────────────────────────────────────────────
function screen2(off) {
  const y = off, e = [];
  e.push(rect(0, y, W, H, T.bg));
  e.push(statusBar(y));

  e.push(text(20, y + 52, 200, 'Agents', { size: 22, bold: true }));
  e.push(text(20, y + 78, 220, '12 registered · 8 active', { size: 12, color: T.textMid }));

  // Filter pills
  const filters = ['All', 'Running', 'Paused', 'Error'];
  let fx = 20;
  filters.forEach((f, i) => {
    const fw = f.length * 7.5 + 22;
    const isActive = i === 0;
    e.push(rect(fx, y + 100, fw, 26, isActive ? T.teal : T.surface2, { r: 13 }));
    e.push(text(fx + 11, y + 108, fw - 22, f, { size: 11, medium: true, color: isActive ? T.bg : T.textMid, center: true }));
    fx += fw + 8;
  });

  const agentList = [
    { name: 'code-gen-01', type: 'CODE', status: 'running', tasks: 3, mem: '142 MB', cpu: 12, uptime: '14m', color: T.teal },
    { name: 'doc-parser', type: 'DATA', status: 'running', tasks: 1, mem: '88 MB', cpu: 8, uptime: '7m', color: T.violet },
    { name: 'test-runner', type: 'TEST', status: 'running', tasks: 5, mem: '210 MB', cpu: 22, uptime: '21m', color: T.green },
    { name: 'web-scraper', type: 'SCRAPE', status: 'pending', tasks: 2, mem: '54 MB', cpu: 1, uptime: '2m', color: T.amber },
    { name: 'ml-trainer', type: 'ML', status: 'error', tasks: 0, mem: '512 MB', cpu: 0, uptime: '3m', color: T.red },
    { name: 'notify-svc', type: 'SVC', status: 'running', tasks: 8, mem: '32 MB', cpu: 3, uptime: '45m', color: T.teal },
  ];

  agentList.forEach((ag, i) => {
    const ay = y + 142 + i * 90;
    const sc = ag.status === 'running' ? T.teal : ag.status === 'error' ? T.red : ag.status === 'pending' ? T.amber : T.violet;
    e.push(card(16, ay, W - 32, 80, [
      rect(0, 0, 3, 80, ag.color, { r: 0 }),
      rect(14, 10, 44, 16, T.bg, { r: 4, border: ag.color, bw: 1 }),
      text(14, 11, 44, ag.type, { size: 9, caps: true, color: ag.color, mono: true, center: true }),
      ...statusDot(W - 52, y + 0 + 19, ag.status), // relative to card
      text(W - 42, 13, 36, ag.status.toUpperCase(), { size: 9, caps: true, color: sc, mono: true }),
      text(14, 32, W - 70, ag.name, { size: 14, semi: true, mono: true }),
      text(14, 54, 60, `${ag.tasks} tasks`, { size: 11, color: T.textMid }),
      text(80, 54, 70, ag.mem, { size: 11, color: T.textMid, mono: true }),
      text(155, 54, 50, `${ag.cpu}% cpu`, { size: 11, color: T.textMid, mono: true }),
      text(W - 60, 54, 46, ag.uptime, { size: 11, color: T.textMid, mono: true, right: true }),
      ...progressBar(14, 70, W - 64, ag.cpu / 35, sc, { h: 2 }),
    ]));
  });

  e.push(navBar(y + H - 68, 1));
  return e;
}

// ── SCREEN 3: ACTIVITY FEED ──────────────────────────────────────────────────
function screen3(off) {
  const y = off, e = [];
  e.push(rect(0, y, W, H, T.bg));
  e.push(statusBar(y));

  e.push(text(20, y + 52, 200, 'Activity', { size: 22, bold: true }));
  e.push(text(20, y + 78, 180, 'Live event stream', { size: 12, color: T.textMid }));
  e.push(...statusDot(W - 30, y + 60, 'running'));

  const events = [
    { time: '09:41:22', agent: 'test-runner', type: 'PASS', msg: 'suite_alpha: 48/48 tests passed', color: T.green },
    { time: '09:40:07', agent: 'ml-trainer', type: 'ERROR', msg: 'OOMError: memory limit exceeded', color: T.red },
    { time: '09:39:55', agent: 'code-gen-01', type: 'WRITE', msg: 'Created src/auth/middleware.ts', color: T.teal },
    { time: '09:39:12', agent: 'doc-parser', type: 'READ', msg: 'Parsed 24 documents from queue', color: T.violet },
    { time: '09:38:40', agent: 'web-scraper', type: 'QUEUE', msg: 'Queued 15 URLs from sitemap', color: T.amber },
    { time: '09:38:11', agent: 'notify-svc', type: 'SEND', msg: 'Dispatched 3 alerts to Slack', color: T.teal },
    { time: '09:37:50', agent: 'code-gen-01', type: 'THINK', msg: 'Planning auth refactor strategy…', color: T.violet },
    { time: '09:36:22', agent: 'test-runner', type: 'RUN', msg: 'Starting suite_alpha (48 tests)', color: T.green },
  ];

  events.forEach((ev, i) => {
    const ey = y + 104 + i * 74;
    e.push(card(16, ey, W - 32, 64, [
      rect(0, 0, 3, 64, ev.color, { r: 0 }),
      rect(14, 9, 50, 16, T.bg, { r: 3, border: ev.color, bw: 1 }),
      text(14, 10, 50, ev.type, { size: 9, caps: true, color: ev.color, mono: true, center: true }),
      text(72, 10, 130, ev.agent, { size: 10, mono: true, color: ev.color, medium: true }),
      text(W - 78, 10, 64, ev.time, { size: 9.5, mono: true, color: T.textMute, right: true }),
      text(14, 30, W - 36, ev.msg, { size: 12, lh: 1.4 }),
    ]));
  });

  e.push(navBar(y + H - 68, 2));
  return e;
}

// ── SCREEN 4: TASKS ──────────────────────────────────────────────────────────
function screen4(off) {
  const y = off, e = [];
  e.push(rect(0, y, W, H, T.bg));
  e.push(statusBar(y));

  e.push(text(20, y + 52, 200, 'Tasks', { size: 22, bold: true }));
  e.push(text(20, y + 78, 260, '24 queued · 8 active · 142 done', { size: 12, color: T.textMid }));

  // Priority tabs
  const tabs = ['All', 'P1 Critical', 'P2 High', 'P3 Normal'];
  let tx = 20;
  tabs.forEach((t, i) => {
    const tw = t.length * 7 + 18;
    const isActive = i === 0;
    e.push(rect(tx, y + 100, tw, 26, isActive ? T.violetDim : 'transparent', { r: 6, border: isActive ? T.violet : T.border2 }));
    e.push(text(tx + 9, y + 108, tw - 18, t, { size: 10.5, medium: true, color: isActive ? T.violet : T.textMid }));
    tx += tw + 8;
  });

  const tasks = [
    { id: 'T-091', title: 'Refactor auth middleware', agent: 'code-gen-01', priority: 'P1', status: 'running', pct: 0.72 },
    { id: 'T-090', title: 'Parse Q1 financial reports', agent: 'doc-parser', priority: 'P2', status: 'running', pct: 0.45 },
    { id: 'T-089', title: 'Run integration test suite', agent: 'test-runner', priority: 'P1', status: 'running', pct: 0.89 },
    { id: 'T-088', title: 'Scrape competitor pricing', agent: 'web-scraper', priority: 'P2', status: 'pending', pct: 0 },
    { id: 'T-087', title: 'Train v2.4 recommendation model', agent: 'ml-trainer', priority: 'P1', status: 'error', pct: 0.18 },
    { id: 'T-086', title: 'Send weekly digest emails', agent: 'notify-svc', priority: 'P3', status: 'done', pct: 1.0 },
  ];

  const prCol = { P1: T.red, P2: T.amber, P3: T.textMid };
  const stCol = { running: T.teal, pending: T.amber, error: T.red, done: T.green };

  tasks.forEach((task, i) => {
    const ty = y + 140 + i * 88;
    const pc = prCol[task.priority] || T.textMid;
    const sc = stCol[task.status];
    e.push(card(16, ty, W - 32, 78, [
      rect(0, 0, 3, 78, pc, { r: 0 }),
      rect(14, 9, 28, 16, T.bg, { r: 3, border: pc, bw: 1 }),
      text(14, 10, 28, task.priority, { size: 9, caps: true, color: pc, mono: true, center: true }),
      text(50, 10, 60, task.id, { size: 9.5, mono: true, color: T.textMid }),
      ...statusDot(W - 50, ty - ty + 19, task.status),
      text(W - 40, 13, 34, task.status.toUpperCase(), { size: 8.5, caps: true, color: sc, mono: true }),
      text(14, 32, W - 36, task.title, { size: 13, medium: true }),
      text(14, 50, 160, task.agent, { size: 10.5, mono: true, color: T.textMid }),
      ...progressBar(14, 66, W - 68, task.pct, sc, { h: 3 }),
      text(W - 50, 58, 38, `${Math.round(task.pct * 100)}%`, { size: 10, mono: true, color: sc, right: true }),
    ]));
  });

  e.push(navBar(y + H - 68, 3));
  return e;
}

// ── SCREEN 5: INSPECTOR ──────────────────────────────────────────────────────
function screen5(off) {
  const y = off, e = [];
  e.push(rect(0, y, W, H, T.bg));
  e.push(statusBar(y));

  e.push(text(20, y + 52, 20, '←', { size: 18, color: T.teal }));
  e.push(text(50, y + 52, 230, 'code-gen-01', { size: 20, bold: true, mono: true }));
  e.push(...statusDot(W - 30, y + 62, 'running'));

  // Header card
  e.push(card(16, y + 82, W - 32, 88, [
    rect(0, 0, 3, 88, T.teal, { r: 0 }),
    text(14, 10, 80, 'CODE AGENT', { size: 9.5, caps: true, color: T.teal, ls: 0.8, mono: true }),
    text(14, 28, 200, 'Running — task T-091', { size: 13, medium: true }),
    text(14, 46, 240, 'Refactor auth middleware', { size: 11, color: T.textMid }),
    text(14, 66, 50, 'Uptime', { size: 9, color: T.textMid }),
    text(14, 78, 60, '14m 32s', { size: 11, mono: true, color: T.teal }),
    text(95, 66, 50, 'Memory', { size: 9, color: T.textMid }),
    text(95, 78, 60, '142 MB', { size: 11, mono: true }),
    text(185, 66, 40, 'CPU', { size: 9, color: T.textMid }),
    text(185, 78, 40, '12%', { size: 11, mono: true }),
  ]));

  // Sparkline card (CPU)
  e.push(card(16, y + 182, W - 32, 70, [
    text(14, 10, 140, 'CPU USAGE (30s)', { size: 9.5, caps: true, color: T.textMid, ls: 1.0, mono: true }),
    text(W - 62, 10, 40, '12%', { size: 12, mono: true, color: T.teal, right: true }),
    // Sparkline bars (simulated)
    ...[0.3, 0.5, 0.4, 0.7, 0.6, 0.5, 0.8, 0.7, 0.9, 0.85, 0.7, 0.75, 0.6, 0.5, 0.4].map((v, i) =>
      rect(14 + i * 22, 26 + (1 - v) * 30, 16, v * 30, T.teal, { r: 2, opacity: 0.7 })
    ),
  ]));

  // Tool calls
  e.push(text(20, y + 268, 120, 'TOOL CALLS', { size: 9.5, caps: true, color: T.textMid, ls: 1.5, mono: true }));
  e.push(text(W - 56, y + 268, 44, '14 total', { size: 10, mono: true, color: T.textMid, right: true }));

  const toolCalls = [
    { tool: 'read_file', args: 'src/auth/middleware.ts', result: '✓ 312 bytes', color: T.teal, time: '0.2s' },
    { tool: 'write_file', args: 'src/auth/middleware.ts', result: '✓ written', color: T.teal, time: '0.1s' },
    { tool: 'run_tests', args: 'auth.test.ts', result: '✓ 12/12 pass', color: T.green, time: '4.2s' },
    { tool: 'call_llm', args: 'strategy analysis', result: '✓ 842 tokens', color: T.violet, time: '1.8s' },
    { tool: 'read_file', args: 'src/auth/utils.ts', result: '✓ 178 bytes', color: T.teal, time: '0.2s' },
  ];

  toolCalls.forEach((tc, i) => {
    const ty = y + 288 + i * 70;
    e.push(card(16, ty, W - 32, 60, [
      rect(0, 0, 3, 60, tc.color, { r: 0 }),
      text(14, 8, 160, tc.tool, { size: 12, semi: true, mono: true, color: tc.color }),
      text(W - 46, 8, 36, tc.time, { size: 10, mono: true, color: T.textMid, right: true }),
      text(14, 26, W - 36, tc.args, { size: 11, mono: true, color: T.textMid }),
      rect(14, 42, W - 48, 14, T.surface2, { r: 3 }),
      text(18, 44, W - 56, tc.result, { size: 10, mono: true, color: tc.color }),
    ]));
  });

  e.push(navBar(y + H - 68, 4));
  return e;
}

// ── ASSEMBLE ──────────────────────────────────────────────────────────────────
const all = [
  ...screen1(0),
  ...screen2(H + GAP),
  ...screen3((H + GAP) * 2),
  ...screen4((H + GAP) * 3),
  ...screen5((H + GAP) * 4),
];

const pen = {
  version: '2.8',
  name: 'NEXUS',
  width: W,
  height: (H + GAP) * 5 - GAP,
  fill: T.bg,
  children: all,
};

fs.writeFileSync('nexus.pen', JSON.stringify(pen, null, 2));
console.log(`✓ nexus.pen — ${all.length} elements, 5 screens`);
