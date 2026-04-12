'use strict';
// nerve-app.js
// NERVE — mission control for your autonomous AI fleet
// DARK theme — inspired by:
//   · "Paperclip — Open-source orchestration for zero-human companies" (lapa.ninja)
//   · Linear / Tracebit dark security dashboards (darkmodedesign.com + land-book.com)
//   · Codegen "The OS for Code Agents" (land-book.com)
// Trend: agentic AI tooling — the "OS layer" for autonomous AI workers

const fs   = require('fs');
const path = require('path');

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const P = {
  bg:       '#070B10',   // deep navy-black — cinematic depth
  surface:  '#0D1520',   // elevated card surface
  surfaceB: '#111E2E',   // secondary surface / hover
  border:   'rgba(0,232,198,0.12)',  // teal border glow
  borderB:  'rgba(255,255,255,0.07)',
  text:     '#E8F4F2',   // cool off-white
  muted:    'rgba(180,220,215,0.45)',
  teal:     '#00E8C6',   // electric teal — primary accent
  tealDim:  'rgba(0,232,198,0.18)',
  amber:    '#F5A623',   // alert / warning
  amberDim: 'rgba(245,166,35,0.15)',
  violet:   '#7B5CF0',   // secondary / orchestration
  violetDim:'rgba(123,92,240,0.18)',
  red:      '#FF4D6D',   // critical / error
  redDim:   'rgba(255,77,109,0.15)',
  green:    '#36D68A',   // success / active
  greenDim: 'rgba(54,214,138,0.15)',
};

const W = 375;
const H = 812;
const GAP = 80;

// ─── PRIMITIVES ──────────────────────────────────────────────────────────────
let _id = 0;
const uid = () => `n${++_id}`;

function rect(x, y, w, h, fill, opts = {}) {
  return {
    id: uid(), type: 'rect',
    x, y, width: w, height: h,
    fill: fill || P.bg,
    cornerRadius: opts.r || 0,
    strokeColor: opts.stroke || 'transparent',
    strokeWidth: opts.sw || 0,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
  };
}

function text(x, y, w, content, size, color, opts = {}) {
  return {
    id: uid(), type: 'text',
    x, y, width: w,
    content: String(content),
    fontSize: size,
    color: color || P.text,
    fontFamily: opts.mono   ? 'JetBrains Mono'
               : opts.serif ? 'Playfair Display'
               : 'Inter',
    fontWeight: opts.bold ? 700 : opts.medium ? 500 : opts.light ? 300 : 400,
    italic: opts.italic || false,
    textAlign: opts.right ? 'right' : opts.center ? 'center' : 'left',
    lineHeight: opts.lh || 1.4,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
    letterSpacing: opts.tracking || 0,
  };
}

function line(x1, y1, x2, y2, color, sw) {
  return {
    id: uid(), type: 'line',
    x1, y1, x2, y2,
    strokeColor: color || P.border,
    strokeWidth: sw || 1,
  };
}

function circle(x, y, r, fill, opts = {}) {
  const el = rect(x - r, y - r, r * 2, r * 2, fill, { r });
  if (opts.stroke) { el.strokeColor = opts.stroke; el.strokeWidth = opts.sw || 1; }
  return el;
}

function frame(x, y, w, h, children) {
  return {
    id: uid(), type: 'frame',
    x, y, width: w, height: h,
    fill: P.bg,
    children,
  };
}

// ─── MICRO COMPONENTS ─────────────────────────────────────────────────────────

// Status bar (dark)
function statusBar(x, y) {
  return [
    rect(x, y, W, 44, P.bg),
    text(x + 16, y + 14, 60, '9:41', 13, P.text, { mono: true, bold: true }),
    text(x + W - 80, y + 12, 70, '●●● ▲ 🔋', 11, P.muted, { right: true }),
  ];
}

// Top bar with back/action
function topBar(x, y, title, subtitle, opts = {}) {
  const els = [
    text(x + 16, y, W - 80, title, 22, P.text, { bold: true }),
  ];
  if (subtitle) {
    els.push(text(x + 16, y + 26, W - 80, subtitle, 10, P.teal, { tracking: 2 }));
  }
  if (opts.action) {
    els.push(
      rect(x + W - 86, y + 2, 70, 26, P.tealDim, { r: 13 }),
      text(x + W - 86, y + 6, 70, opts.action, 11, P.teal, { center: true, bold: true }),
    );
  }
  return els;
}

// Agent status dot
function statusDot(x, y, status) {
  const colors = { active: P.green, idle: P.teal, busy: P.amber, error: P.red, offline: P.muted };
  const c = colors[status] || P.muted;
  return [circle(x, y, 5, c)];
}

// Thin progress bar (horizontal)
function thinBar(x, y, w, pct, fill) {
  return [
    rect(x, y, w, 3, P.border, { r: 2 }),
    rect(x, y, Math.round(w * pct), 3, fill, { r: 2 }),
  ];
}

// Navigation bar (5 tabs)
function navBar(x, y, active) {
  const tabs = [
    { icon: '⬡', label: 'Fleet'  },
    { icon: '◎', label: 'Agent'  },
    { icon: '⚡', label: 'Feed'   },
    { icon: '⚠', label: 'Alerts' },
    { icon: '⊞', label: 'Orchestrate' },
  ];
  return [
    rect(x, y, W, 80, P.surface, { stroke: P.borderB, sw: 1 }),
    ...tabs.flatMap((t, i) => {
      const tx = x + 8 + i * 72;
      const isActive = i === active;
      return [
        isActive ? rect(tx + 4, y + 4, 64, 52, P.tealDim, { r: 14 }) : null,
        text(tx, y + 10, 72, t.icon, 18, isActive ? P.teal : P.muted, { center: true }),
        text(tx, y + 34, 72, t.label, 8, isActive ? P.teal : P.muted, { center: true, tracking: 0.5 }),
      ].filter(Boolean);
    }),
  ];
}

// Glowing divider
function glowLine(x, y) {
  return [
    rect(x, y, W, 1, 'transparent'),
    line(x + 16, y, x + W - 16, y, P.border, 1),
  ];
}

// Sparkline (simplified — 8 points)
function sparkline(x, y, w, h, values, color) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = w / (values.length - 1);
  const nodes = [];
  for (let i = 0; i < values.length - 1; i++) {
    const x1 = x + i * step;
    const y1 = y + h - ((values[i] - min) / range) * h;
    const x2 = x + (i + 1) * step;
    const y2 = y + h - ((values[i + 1] - min) / range) * h;
    nodes.push({
      id: uid(), type: 'line',
      x1: Math.round(x1), y1: Math.round(y1),
      x2: Math.round(x2), y2: Math.round(y2),
      strokeColor: color,
      strokeWidth: 1.5,
    });
  }
  return nodes;
}

// Metric pill
function metricPill(x, y, label, value, color) {
  return [
    rect(x, y, 100, 42, P.surfaceB, { r: 10, stroke: P.borderB, sw: 1 }),
    text(x + 8, y + 6, 84, label, 9, P.muted, { tracking: 1 }),
    text(x + 8, y + 20, 84, value, 15, color || P.text, { mono: true, bold: true }),
  ];
}

// ─── SCREEN 1 — FLEET OVERVIEW ───────────────────────────────────────────────
function screenFleet(ox, oy) {
  const x = ox, y = oy;

  const agents = [
    { name: 'Scout-7',    role: 'Web Researcher',    status: 'active', tasks: 14, cpu: 0.72, tokens: '82K', color: P.green  },
    { name: 'Forge-2',    role: 'Code Generator',    status: 'busy',   tasks: 3,  cpu: 0.91, tokens: '204K',color: P.amber  },
    { name: 'Prism-4',    role: 'Data Analyst',      status: 'active', tasks: 8,  cpu: 0.54, tokens: '55K', color: P.green  },
    { name: 'Echo-1',     role: 'Summariser',        status: 'idle',   tasks: 0,  cpu: 0.08, tokens: '12K', color: P.teal   },
    { name: 'Veil-3',     role: 'Security Monitor',  status: 'error',  tasks: 1,  cpu: 0.34, tokens: '38K', color: P.red    },
    { name: 'Drift-9',    role: 'API Orchestrator',  status: 'active', tasks: 22, cpu: 0.67, tokens: '119K',color: P.green  },
  ];

  const sparkData = [12, 18, 14, 24, 20, 32, 28, 38];

  return frame(x, y, W, H, [
    ...statusBar(x, y),

    // Header
    text(x + 16, y + 54, 200, 'NERVE', 28, P.teal, { bold: true, tracking: 6 }),
    text(x + 16, y + 88, 220, 'AGENT FLEET CONTROL', 9, P.muted, { tracking: 3 }),

    // Live indicator
    circle(x + W - 80, y + 62, 5, P.green),
    text(x + W - 68, y + 56, 60, 'LIVE', 10, P.green, { bold: true, tracking: 2 }),
    text(x + W - 68, y + 71, 60, '6 active', 9, P.muted),

    // Fleet health summary row
    rect(x + 16, y + 106, W - 32, 60, P.surface, { r: 14, stroke: P.border, sw: 1 }),
    text(x + 28, y + 116, 80, 'RUNNING', 8, P.muted, { tracking: 1.5 }),
    text(x + 28, y + 130, 80, '23', 22, P.teal, { mono: true, bold: true }),
    line(x + 115, y + 116, x + 115, y + 158, P.borderB, 1),
    text(x + 124, y + 116, 80, 'QUEUED', 8, P.muted, { tracking: 1.5 }),
    text(x + 124, y + 130, 80, '7', 22, P.amber, { mono: true, bold: true }),
    line(x + 210, y + 116, x + 210, y + 158, P.borderB, 1),
    text(x + 220, y + 116, 80, 'ERRORS', 8, P.muted, { tracking: 1.5 }),
    text(x + 220, y + 130, 80, '1', 22, P.red, { mono: true, bold: true }),
    text(x + 28, y + 156, W - 56, 'Fleet uptime: 99.8%  ·  Tokens used today: 510K', 9, P.muted),

    // Sparkline panel
    rect(x + 16, y + 174, W - 32, 56, P.surfaceB, { r: 12 }),
    text(x + 28, y + 182, 120, 'TASKS / HOUR', 8, P.muted, { tracking: 1.5 }),
    text(x + W - 80, y + 180, 60, '38 now', 10, P.green, { mono: true, right: true }),
    ...sparkline(x + 28, y + 196, W - 56, 26, sparkData, P.teal),

    // Section label
    text(x + 16, y + 242, W - 32, 'AGENTS', 9, P.muted, { tracking: 3 }),
    line(x + 72, y + 247, x + W - 16, y + 247, P.borderB, 1),

    // Agent cards
    ...agents.flatMap((a, i) => {
      const ay = y + 256 + i * 86;
      const statusColors = { active: P.green, idle: P.teal, busy: P.amber, error: P.red, offline: P.muted };
      const sc = statusColors[a.status] || P.muted;
      return [
        rect(x + 16, ay, W - 32, 78, P.surface, { r: 14, stroke: `${sc}22`, sw: 1 }),
        // Left accent bar
        rect(x + 16, ay + 8, 3, 62, sc, { r: 2 }),
        // Status dot
        circle(x + 28, ay + 18, 5, sc),
        // Name
        text(x + 38, ay + 10, 180, a.name, 15, P.text, { bold: true, mono: true }),
        text(x + 38, ay + 28, 160, a.role, 10, P.muted),
        // Tasks
        text(x + W - 100, ay + 10, 80, `${a.tasks}`, 16, sc, { mono: true, bold: true, right: true }),
        text(x + W - 100, ay + 28, 80, 'tasks', 9, P.muted, { right: true }),
        // CPU bar
        text(x + 38, ay + 50, 50, 'CPU', 8, P.muted, { tracking: 1 }),
        ...thinBar(x + 72, ay + 53, 160, a.cpu, sc),
        text(x + W - 56, ay + 48, 36, `${Math.round(a.cpu * 100)}%`, 9, sc, { mono: true, right: true }),
        // Tokens
        text(x + 38, ay + 64, 80, a.tokens + ' tkn', 9, P.muted, { mono: true }),
      ];
    }),

    ...navBar(x, y + H - 80, 0),
  ]);
}

// ─── SCREEN 2 — AGENT DETAIL ─────────────────────────────────────────────────
function screenAgent(ox, oy) {
  const x = ox, y = oy;
  const sparkCPU  = [55, 62, 80, 74, 91, 85, 91, 88];
  const sparkTok  = [18, 32, 45, 29, 62, 58, 74, 80];

  const tasks = [
    { label: 'Analyse repo codebase',       status: 'done',    time: '2m 14s', tokens: '42K'  },
    { label: 'Generate refactor proposal',  status: 'running', time: '0m 38s', tokens: '98K'  },
    { label: 'Write unit tests',            status: 'queued',  time: '—',      tokens: '—'    },
    { label: 'Submit PR summary',           status: 'queued',  time: '—',      tokens: '—'    },
  ];
  const statusColors = { done: P.green, running: P.amber, queued: P.muted, error: P.red };

  return frame(x, y, W, H, [
    ...statusBar(x, y),

    // Back + title
    text(x + 16, y + 52, 20, '←', 16, P.muted),
    text(x + 40, y + 52, 160, 'FORGE-2', 18, P.text, { bold: true, mono: true }),
    text(x + 40, y + 74, 200, 'Code Generator  ·  BUSY', 10, P.amber, { tracking: 1 }),

    // Action buttons
    rect(x + W - 146, y + 54, 60, 26, P.amberDim, { r: 13 }),
    text(x + W - 146, y + 59, 60, 'PAUSE', 11, P.amber, { center: true, bold: true }),
    rect(x + W - 80, y + 54, 64, 26, P.redDim, { r: 13 }),
    text(x + W - 80, y + 59, 64, 'KILL', 11, P.red, { center: true, bold: true }),

    // Live metrics row
    ...metricPill(x + 16, y + 98, 'CPU', '91%', P.amber),
    ...metricPill(x + 124, y + 98, 'MEMORY', '2.1 GB', P.teal),
    ...metricPill(x + 232, y + 98, 'TOKENS', '204K', P.violet),

    // CPU sparkline
    rect(x + 16, y + 148, W - 32, 68, P.surface, { r: 14, stroke: P.border, sw: 1 }),
    text(x + 28, y + 156, 160, 'CPU UTILISATION (LAST 8 MIN)', 8, P.muted, { tracking: 1.5 }),
    text(x + W - 56, y + 154, 36, '91%', 11, P.amber, { mono: true, bold: true, right: true }),
    ...sparkline(x + 28, y + 172, W - 56, 34, sparkCPU, P.amber),

    // Token burn sparkline
    rect(x + 16, y + 224, W - 32, 68, P.surface, { r: 14, stroke: P.border, sw: 1 }),
    text(x + 28, y + 232, 160, 'TOKEN BURN RATE (K/MIN)', 8, P.muted, { tracking: 1.5 }),
    text(x + W - 56, y + 230, 36, '↑80', 11, P.violet, { mono: true, bold: true, right: true }),
    ...sparkline(x + 28, y + 248, W - 56, 34, sparkTok, P.violet),

    // Task queue
    text(x + 16, y + 302, W - 32, 'TASK QUEUE', 9, P.muted, { tracking: 3 }),
    line(x + 90, y + 307, x + W - 16, y + 307, P.borderB, 1),

    ...tasks.flatMap((t, i) => {
      const ty = y + 316 + i * 70;
      const sc = statusColors[t.status] || P.muted;
      return [
        rect(x + 16, ty, W - 32, 62, P.surface, { r: 12, stroke: `${sc}22`, sw: 1 }),
        // Step number
        circle(x + 32, ty + 20, 10, `${sc}22`),
        text(x + 27, ty + 14, 20, `${i + 1}`, 12, sc, { center: true, bold: true, mono: true }),
        // Label
        text(x + 52, ty + 10, W - 120, t.label, 13, P.text, { medium: true }),
        // Status badge
        rect(x + W - 80, ty + 8, 62, 20, `${sc}22`, { r: 10 }),
        text(x + W - 80, ty + 11, 62, t.status.toUpperCase(), 9, sc, { center: true, bold: true }),
        // Time + tokens
        text(x + 52, ty + 32, 120, `⏱ ${t.time}`, 10, P.muted, { mono: true }),
        text(x + 52, ty + 46, 120, `⬡ ${t.tokens}`, 10, P.muted, { mono: true }),
      ];
    }),

    // Context window
    rect(x + 16, y + 596, W - 32, 60, P.surfaceB, { r: 12 }),
    text(x + 28, y + 604, 80, 'CONTEXT', 8, P.muted, { tracking: 2 }),
    text(x + 28, y + 618, W - 56, '128 K window  ·  204K used (159%)  →  chunking active', 11, P.muted, { lh: 1.5 }),

    // Model tag
    rect(x + 28, y + 644, 160, 22, P.violetDim, { r: 11 }),
    text(x + 28, y + 648, 160, 'claude-3-7-sonnet-20250219', 9, P.violet, { center: true, mono: true }),

    ...navBar(x, y + H - 80, 1),
  ]);
}

// ─── SCREEN 3 — MISSION FEED ──────────────────────────────────────────────────
function screenFeed(ox, oy) {
  const x = ox, y = oy;

  const events = [
    { time: '09:41:32', agent: 'Scout-7',  type: 'TOOL_CALL',  msg: 'web_search("latest AI agent frameworks 2026")',          color: P.teal   },
    { time: '09:41:29', agent: 'Forge-2',  type: 'THINKING',   msg: 'Planning refactor approach for auth module…',            color: P.amber  },
    { time: '09:41:25', agent: 'Drift-9',  type: 'API_CALL',   msg: 'POST /v1/pipelines/trigger  →  200 OK (134ms)',          color: P.violet },
    { time: '09:41:22', agent: 'Prism-4',  type: 'RESULT',     msg: 'Anomaly score: 0.92 → flagging for review',              color: P.green  },
    { time: '09:41:18', agent: 'Veil-3',   type: 'ERROR',      msg: 'SSL cert expired on target host — halting task',         color: P.red    },
    { time: '09:41:14', agent: 'Echo-1',   type: 'OUTPUT',     msg: 'Summary written: 420 words, 3 key findings',             color: P.green  },
    { time: '09:41:10', agent: 'Scout-7',  type: 'TOOL_CALL',  msg: 'scrape_page("https://arxiv.org/abs/2501.12345")',        color: P.teal   },
    { time: '09:41:06', agent: 'Drift-9',  type: 'HANDOFF',    msg: 'Delegating task-44 to Forge-2 (code gen required)',      color: P.violet },
    { time: '09:41:02', agent: 'Forge-2',  type: 'THINKING',   msg: 'Reviewing handoff context — 98K tokens loaded',         color: P.amber  },
  ];

  return frame(x, y, W, H, [
    ...statusBar(x, y),
    ...topBar(x, y + 52, 'Mission Feed', 'REAL-TIME EVENTS', { action: 'FILTER' }),

    // Token burn today
    rect(x + 16, y + 104, W - 32, 40, P.surfaceB, { r: 10 }),
    text(x + 28, y + 114, W - 56, '⬡  510K tokens consumed today  ·  ~$3.20 est. cost', 11, P.muted, { lh: 1.5 }),

    // Filter chips
    ...['ALL', 'ERRORS', 'CALLS', 'OUTPUT'].map((chip, i) => {
      const isFirst = i === 0;
      return [
        rect(x + 16 + i * 80, y + 152, 72, 24, isFirst ? P.tealDim : 'transparent', { r: 12, stroke: isFirst ? P.teal : P.borderB, sw: 1 }),
        text(x + 16 + i * 80, y + 156, 72, chip, 10, isFirst ? P.teal : P.muted, { center: true, bold: true }),
      ];
    }).flat(),

    // Divider
    line(x + 16, y + 184, x + W - 16, y + 184, P.borderB, 1),

    // Feed events
    ...events.flatMap((e, i) => {
      const ey = y + 194 + i * 60;
      return [
        // Time col
        text(x + 16, ey + 8, 66, e.time, 9, P.muted, { mono: true }),
        // Accent dot
        circle(x + 84, ey + 14, 4, e.color),
        // Line connector (all but last)
        ...(i < events.length - 1 ? [line(x + 84, ey + 18, x + 84, ey + 60, `${e.color}30`, 1)] : []),
        // Agent tag
        rect(x + 96, ey + 4, 62, 18, `${e.color}20`, { r: 9 }),
        text(x + 96, ey + 7, 62, e.agent, 9, e.color, { center: true, bold: true, mono: true }),
        // Type badge
        rect(x + 164, ey + 4, 60, 18, P.surfaceB, { r: 9 }),
        text(x + 164, ey + 7, 60, e.type, 8, P.muted, { center: true }),
        // Message
        text(x + 96, ey + 28, W - 120, e.msg, 10, P.text, { lh: 1.4, opacity: 0.85 }),
      ];
    }),

    ...navBar(x, y + H - 80, 2),
  ]);
}

// ─── SCREEN 4 — ALERTS ───────────────────────────────────────────────────────
function screenAlerts(ox, oy) {
  const x = ox, y = oy;

  const alerts = [
    {
      sev: 'CRITICAL', agent: 'Veil-3', title: 'SSL certificate expired',
      body: 'Target host cert invalid since 09:41. Agent halted — 1 task blocked.',
      age: '3m ago', color: P.red, icon: '✕',
    },
    {
      sev: 'WARNING', agent: 'Forge-2', title: 'Context window overflow',
      body: '204K / 128K window limit. Auto-chunking engaged. May degrade quality.',
      age: '7m ago', color: P.amber, icon: '⚠',
    },
    {
      sev: 'WARNING', agent: 'Forge-2', title: 'High CPU sustained > 5 min',
      body: 'CPU above 90% for 5+ min. Consider scaling or throttling task queue.',
      age: '12m ago', color: P.amber, icon: '⚠',
    },
    {
      sev: 'INFO', agent: 'Prism-4', title: 'Anomaly detected in dataset',
      body: 'Score 0.92 on row cluster #44 — flagged for human review.',
      age: '19m ago', color: P.teal, icon: 'ℹ',
    },
    {
      sev: 'INFO', agent: 'Drift-9', title: 'Task delegation spike',
      body: 'Drift-9 delegated 4 tasks in < 2 min. Check orchestration config.',
      age: '34m ago', color: P.teal, icon: 'ℹ',
    },
  ];

  return frame(x, y, W, H, [
    ...statusBar(x, y),
    ...topBar(x, y + 52, 'Alerts', 'ANOMALY DETECTION', { action: 'ACK ALL' }),

    // Summary bar
    rect(x + 16, y + 104, W - 32, 44, P.surface, { r: 12, stroke: P.border, sw: 1 }),
    circle(x + 36, y + 126, 8, P.redDim),
    text(x + 30, y + 120, 16, '1', 13, P.red, { center: true, bold: true, mono: true }),
    text(x + 54, y + 116, 60, 'Critical', 9, P.muted, { tracking: 1 }),
    text(x + 54, y + 130, 60, '1 open', 11, P.red, { bold: true }),
    line(x + 128, y + 114, x + 128, y + 140, P.borderB, 1),
    circle(x + 148, y + 126, 8, P.amberDim),
    text(x + 142, y + 120, 16, '2', 13, P.amber, { center: true, bold: true, mono: true }),
    text(x + 165, y + 116, 60, 'Warnings', 9, P.muted, { tracking: 1 }),
    text(x + 165, y + 130, 60, '2 open', 11, P.amber, { bold: true }),
    line(x + 248, y + 114, x + 248, y + 140, P.borderB, 1),
    circle(x + 268, y + 126, 8, P.tealDim),
    text(x + 262, y + 120, 16, '2', 13, P.teal, { center: true, bold: true, mono: true }),
    text(x + 284, y + 116, 60, 'Info', 9, P.muted, { tracking: 1 }),
    text(x + 284, y + 130, 60, '2 open', 11, P.teal, { bold: true }),

    // Alert cards
    ...alerts.flatMap((a, i) => {
      const ay = y + 158 + i * 110;
      return [
        rect(x + 16, ay, W - 32, 102, P.surface, { r: 14, stroke: `${a.color}28`, sw: 1 }),
        // Severity stripe
        rect(x + 16, ay + 8, 3, 86, a.color, { r: 2 }),
        // Icon circle
        circle(x + 36, ay + 28, 14, `${a.color}20`),
        text(x + 29, ay + 21, 28, a.icon, 14, a.color, { center: true, bold: true }),
        // Severity badge
        rect(x + 58, ay + 14, 62, 18, `${a.color}20`, { r: 9 }),
        text(x + 58, ay + 17, 62, a.sev, 9, a.color, { center: true, bold: true }),
        // Agent
        text(x + 128, ay + 14, 100, a.agent, 9, P.muted, { mono: true }),
        // Age
        text(x + W - 80, ay + 14, 62, a.age, 9, P.muted, { right: true }),
        // Title
        text(x + 58, ay + 38, W - 90, a.title, 14, P.text, { bold: true }),
        // Body
        text(x + 58, ay + 58, W - 90, a.body, 10, P.muted, { lh: 1.5 }),
        // Action row
        rect(x + W - 96, ay + 82, 78, 18, `${a.color}18`, { r: 9 }),
        text(x + W - 96, ay + 85, 78, 'ACKNOWLEDGE', 8, a.color, { center: true, bold: true }),
      ];
    }),

    ...navBar(x, y + H - 80, 3),
  ]);
}

// ─── SCREEN 5 — ORCHESTRATION ─────────────────────────────────────────────────
function screenOrchestrate(ox, oy) {
  const x = ox, y = oy;

  // Pipeline: Trigger → Scout-7 → Prism-4 → Forge-2 → Echo-1 → Output
  const nodes = [
    { id: 'trigger', label: 'TRIGGER',   sub: 'Cron 0 9 * * *', color: P.violet, cx: W/2, cy: 60 },
    { id: 'scout',   label: 'Scout-7',   sub: 'Web Research',    color: P.green,  cx: W/2, cy: 160 },
    { id: 'prism',   label: 'Prism-4',   sub: 'Analyse Data',    color: P.green,  cx: W/4, cy: 280 },
    { id: 'forge',   label: 'Forge-2',   sub: 'Generate Code',   color: P.amber,  cx: W * 3/4, cy: 280 },
    { id: 'echo',    label: 'Echo-1',    sub: 'Summarise',       color: P.teal,   cx: W/2, cy: 400 },
    { id: 'output',  label: 'OUTPUT',    sub: 'PR + Report',     color: P.violet, cx: W/2, cy: 500 },
  ];

  // Edges (index pairs)
  const edges = [
    [0, 1], [1, 2], [1, 3], [2, 4], [3, 4], [4, 5],
  ];

  const baseY = y + 144;

  return frame(x, y, W, H, [
    ...statusBar(x, y),
    ...topBar(x, y + 52, 'Orchestrate', 'PIPELINE BUILDER'),

    // Pipeline name
    rect(x + 16, y + 100, W - 32, 36, P.surface, { r: 10, stroke: P.border, sw: 1 }),
    text(x + 28, y + 110, 220, '⬡  daily-research-pipeline  ·  v2.4', 11, P.text, { mono: true }),
    rect(x + W - 80, y + 108, 62, 20, P.greenDim, { r: 10 }),
    text(x + W - 80, y + 112, 62, 'ACTIVE', 10, P.green, { center: true, bold: true }),

    // Edge lines (drawn first so nodes go on top)
    ...edges.map(([a, b]) => {
      const na = nodes[a], nb = nodes[b];
      return {
        id: uid(), type: 'line',
        x1: x + na.cx, y1: baseY + na.cy,
        x2: x + nb.cx, y2: baseY + nb.cy,
        strokeColor: 'rgba(0,232,198,0.25)',
        strokeWidth: 1.5,
      };
    }),

    // Nodes
    ...nodes.flatMap((n) => {
      const nx = x + n.cx;
      const ny = baseY + n.cy;
      const isSpecial = n.id === 'trigger' || n.id === 'output';
      return [
        // Outer glow ring
        circle(nx, ny, 28, `${n.color}12`, { stroke: `${n.color}40`, sw: 1 }),
        // Inner node
        circle(nx, ny, 20, `${n.color}22`),
        // Dot center
        circle(nx, ny, 7, n.color),
        // Label above
        text(nx - 48, ny - 42, 96, n.label, isSpecial ? 10 : 12,
             isSpecial ? P.violet : P.text,
             { center: true, bold: true, mono: isSpecial }),
        // Sub below
        text(nx - 48, ny + 34, 96, n.sub, 9, P.muted, { center: true }),
      ];
    }),

    // Stats footer
    rect(x + 16, y + 656, W - 32, 80, P.surface, { r: 14, stroke: P.border, sw: 1 }),
    text(x + 28, y + 666, W - 56, 'LAST RUN', 8, P.muted, { tracking: 2 }),
    text(x + 28, y + 680, W - 56, 'Today 09:00  ·  4m 32s  ·  384K tokens  ·  ✓ Success', 11, P.text, { lh: 1.5 }),
    text(x + 28, y + 700, W - 56, 'NEXT RUN', 8, P.muted, { tracking: 2 }),
    text(x + 28, y + 714, W - 56, 'Tomorrow 09:00  ·  6 agents  ·  est. 400K tokens', 11, P.text, { lh: 1.5 }),

    ...navBar(x, y + H - 80, 4),
  ]);
}

// ─── ASSEMBLE ────────────────────────────────────────────────────────────────
const screens = [
  screenFleet      (0,          0),
  screenAgent      (W + GAP,    0),
  screenFeed       ((W+GAP)*2,  0),
  screenAlerts     ((W+GAP)*3,  0),
  screenOrchestrate((W+GAP)*4,  0),
];

const pen = {
  version:  '2.8',
  name:     'NERVE — mission control for autonomous AI agents',
  width:    W * 5 + GAP * 4,
  height:   H,
  fill:     P.bg,
  children: screens,
};

fs.writeFileSync(path.join(__dirname, 'nerve.pen'), JSON.stringify(pen, null, 2));
console.log(
  '✓ nerve.pen saved ('
  + pen.width + 'x' + pen.height + ', '
  + (JSON.stringify(pen).match(/"id"/g)||[]).length
  + ' nodes)'
);
