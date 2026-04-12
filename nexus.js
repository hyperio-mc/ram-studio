#!/usr/bin/env node
// nexus.js — NEXUS: AI Agent Orchestration Console
// Heartbeat — inspired by Linear's "Agent tasks" UI (linear.app),
// Midday.ai dark finance aesthetic (darkmodedesign.com),
// and Status.app privacy-first super-app pattern (godly.website).
// Design language: ultra-minimal dark, violet-indigo accent, monospace data,
//                  bento-grid feature layout, real-time pulse indicators.

'use strict';
const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:       '#0e0f14',    // deep near-black (Linear-inspired)
  surface:  '#14151d',    // card surface
  panel:    '#1c1d2a',    // elevated panel
  panel2:   '#222336',    // second-level elevation
  border:   '#252637',    // subtle border
  border2:  '#2e2f44',    // slightly visible border
  muted:    '#5a5b72',    // secondary/muted text
  dim:      '#3a3b52',    // very dim / placeholder
  fg:       '#e8e8f0',    // primary text (cool white)
  sub:      '#9898b2',    // secondary text

  // Accents
  violet:   '#7b68ee',    // primary accent — Linear/Notion violet
  teal:     '#00c9a7',    // active/running state — teal
  amber:    '#f5a623',    // warning / pending
  red:      '#ff5c57',    // error / blocked
  green:    '#30d158',    // success / completed
  blue:     '#3b82f6',    // info / linked

  // Agent status colors
  running:  '#00c9a7',
  waiting:  '#f5a623',
  done:     '#30d158',
  failed:   '#ff5c57',
  idle:     '#5a5b72',
};

const W  = 390;   // mobile width
const H  = 844;   // mobile height
const DW = 1440;  // desktop width
const DH = 900;   // desktop height

// ── Primitives ─────────────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, extra = {}) => ({
  type: 'frame', x, y, width: w, height: h, fill,
  cornerRadius: extra.r ?? 0,
  strokeColor:  extra.stroke ?? null,
  strokeWidth:  extra.sw ?? 0,
  opacity:      extra.opacity ?? 1,
  children:     extra.children ?? [],
});

const T = (x, y, text, size, color, extra = {}) => ({
  type: 'text', x, y, text,
  fontSize:      size,
  fill:          color,
  fontWeight:    extra.bold ? 'bold' : (extra.weight ?? 'normal'),
  fontFamily:    extra.mono ? '"SF Mono","Fira Code",monospace' : '"Inter","SF Pro Display",system-ui,sans-serif',
  letterSpacing: extra.tracking ?? 0,
  textTransform: extra.upper ? 'uppercase' : 'none',
  opacity:       extra.opacity ?? 1,
  textAlign:     extra.align ?? 'left',
  lineHeight:    extra.lh ?? 1.3,
  width:         extra.w ?? undefined,
});

const E = (x, y, w, h, fill, extra = {}) => ({
  type: 'ellipse', x, y, width: w, height: h, fill,
  opacity:     extra.opacity ?? 1,
  strokeColor: extra.stroke ?? null,
  strokeWidth: extra.sw ?? 0,
});

// Rounded rect helper
const R = (x, y, w, h, fill, r, extra = {}) => F(x, y, w, h, fill, { r, ...extra });

// Status dot with glow — for agent live indicators
const Dot = (x, y, color, size = 8) => E(x - size/2, y - size/2, size, size, color);

// Shimmer bar (progress/metric)
const Bar = (x, y, w, h, pct, color, bg = C.border) => F(x, y, w, h, bg, {
  r: h / 2,
  children: [F(0, 0, Math.max(0, w * pct), h, color, { r: h / 2 })],
});

// Pill badge
const Pill = (x, y, label, bgColor, textColor = C.bg, extra = {}) => {
  const fontSize = extra.small ? 9 : 10;
  const px2 = extra.small ? 6 : 8, py2 = extra.small ? 3 : 4;
  const w = label.length * (fontSize * 0.58) + px2 * 2;
  const h = fontSize + py2 * 2;
  return F(x, y, w, h, bgColor, {
    r: h / 2,
    children: [T(px2, py2 - 1, label, fontSize, textColor, { bold: true, upper: true, tracking: 0.5, mono: true })],
  });
};

// Icon-like symbol in a square chip
const Icon = (x, y, sym, color, size = 28) => F(x, y, size, size, C.panel2, {
  r: 6,
  stroke: C.border2,
  sw: 1,
  children: [T(size/2 - 6, size/2 - 7, sym, 13, color, { align: 'center' })],
});

// Divider line
const HR = (x, y, w) => F(x, y, w, 1, C.border);

// ── Agent data ─────────────────────────────────────────────────────────────────
const AGENTS = [
  { name: 'Orion',   role: 'Code Review',        status: 'running', pct: 0.72, tasks: 14, icon: '⬡', color: C.violet },
  { name: 'Lyra',    role: 'CI Debug',           status: 'running', pct: 0.43, tasks: 7,  icon: '◈', color: C.teal   },
  { name: 'Vega',    role: 'Dep Updates',        status: 'waiting', pct: 0.15, tasks: 22, icon: '◇', color: C.amber  },
  { name: 'Pulsar',  role: 'Security Scan',      status: 'done',    pct: 1.00, tasks: 31, icon: '◉', color: C.green  },
  { name: 'Quasar',  role: 'Docs Generator',     status: 'idle',    pct: 0.00, tasks: 0,  icon: '△', color: C.muted  },
];

const TASKS = [
  { agent: 'Orion',  action: 'Reviewed PR #2841',         time: '2m ago',   status: 'running', note: 'Added 3 inline comments' },
  { agent: 'Lyra',   action: 'Fixed test timeout',        time: '4m ago',   status: 'running', note: 'node:test suite now passing' },
  { agent: 'Orion',  action: 'Flagged security issue',    time: '7m ago',   status: 'waiting', note: 'Awaiting human review' },
  { agent: 'Pulsar', action: 'Scan complete — 0 CVEs',   time: '12m ago',  status: 'done',    note: '847 deps scanned' },
  { agent: 'Vega',   action: 'Queued 5 dep upgrades',    time: '18m ago',  status: 'waiting', note: 'React 19 → 19.1, lodash...' },
];

const statusColor = s => ({ running: C.teal, waiting: C.amber, done: C.green, failed: C.red, idle: C.muted })[s] || C.muted;
const statusLabel = s => s.toUpperCase();

// ── SCREEN 1: Mobile — Agent Hub ──────────────────────────────────────────────
function mAgentHub() {
  const ch = [];

  // Status bar
  ch.push(F(0, 0, W, 44, C.surface, { children: [
    T(20, 14, 'NEXUS', 13, C.violet, { bold: true, mono: true, tracking: 3 }),
    T(W - 60, 14, '22:41', 12, C.sub, { mono: true }),
  ]}));

  // Metrics strip
  const metrics = [
    { v: '5', label: 'ACTIVE' },
    { v: '47', label: 'TASKS TODAY' },
    { v: '98.2%', label: 'UPTIME' },
    { v: '12ms', label: 'AVG RESP' },
  ];
  const mw = (W - 32) / 4;
  metrics.forEach((m, i) => {
    const x = 16 + i * mw;
    ch.push(R(x, 54, mw - 6, 54, C.panel, 8, {
      stroke: C.border,
      sw: 1,
      children: [
        T(8, 8, m.v, 18, C.fg, { bold: true, mono: true }),
        T(8, 32, m.label, 8, C.muted, { mono: true, upper: true, tracking: 0.5 }),
      ],
    }));
  });

  // Section header
  ch.push(T(20, 122, 'AGENTS', 10, C.violet, { mono: true, upper: true, tracking: 3, bold: true }));
  ch.push(T(W - 70, 122, '5 online', 10, C.muted, { mono: true }));

  // Agent cards
  AGENTS.forEach((ag, i) => {
    const y = 142 + i * 106;
    const card = R(16, y, W - 32, 96, C.panel, 10, {
      stroke: ag.status === 'running' ? ag.color + '33' : C.border,
      sw: ag.status === 'running' ? 1 : 1,
    });
    const sc = statusColor(ag.status);

    card.children = [
      // Agent icon
      R(12, 14, 44, 44, C.panel2, 8, {
        stroke: ag.color + '55', sw: 1,
        children: [T(14, 12, ag.icon, 20, ag.color, { align: 'center' })],
      }),

      // Name + role
      T(66, 14, ag.name, 14, C.fg, { bold: true }),
      T(66, 32, ag.role, 11, C.sub, { mono: true }),

      // Status pill (top right)
      Pill(W - 100, 14, statusLabel(ag.status), sc + '28', sc, { small: true }),

      // Task count
      T(66, 52, `${ag.tasks} tasks`, 10, C.muted, { mono: true }),

      // Progress bar
      ...Bar(12, 74, W - 64 - 32, 4, ag.pct, ag.color, C.border2).children.map(el => ({
        ...el, x: 12, y: 74,
      })),
      Bar(12, 74, W - 64 - 32, 4, ag.pct, ag.color, C.border2),

      // % label
      T(W - 66, 70, `${Math.round(ag.pct * 100)}%`, 10, ag.status === 'running' ? ag.color : C.muted, { mono: true }),
    ];

    ch.push(card);

    // Live pulse dot for running agents
    if (ag.status === 'running') {
      ch.push(Dot(W - 36, y + 22, C.teal, 7));
      ch.push(Dot(W - 36, y + 22, C.teal + '40', 14));
    }
  });

  // Bottom nav
  ch.push(F(0, H - 70, W, 70, C.surface, {
    stroke: C.border, sw: 1,
    children: [
      ...[
        { icon: '◉', label: 'Hub',    x: 20,       active: true  },
        { icon: '◈', label: 'Tasks',  x: 100,      active: false },
        { icon: '◇', label: 'Agents', x: 181,      active: false },
        { icon: '△', label: 'Logs',   x: 261,      active: false },
        { icon: '○', label: 'Config', x: 342,      active: false },
      ].map(n => F(n.x, 8, 46, 46, 'transparent', {
        children: [
          T(15, 4, n.icon, 16, n.active ? C.violet : C.muted, { align: 'center' }),
          T(4, 26, n.label, 9, n.active ? C.violet : C.muted, { align: 'center', mono: true }),
        ],
      })),
    ],
  }));

  return { name: 'Mobile — Agent Hub', type: 'frame', x: 0, y: 0, width: W, height: H, fill: C.bg, children: ch };
}

// ── SCREEN 2: Mobile — Agent Detail (Orion) ───────────────────────────────────
function mAgentDetail() {
  const ch = [];
  const ag = AGENTS[0]; // Orion

  // Header with back
  ch.push(F(0, 0, W, 52, C.surface, { children: [
    T(20, 18, '← Orion', 14, C.fg, { bold: true }),
    Pill(W - 100, 16, 'RUNNING', C.teal + '28', C.teal),
  ]}));

  // Agent identity hero
  ch.push(R(16, 62, W - 32, 100, C.panel, 12, {
    stroke: C.violet + '44', sw: 1,
    children: [
      R(16, 16, 60, 60, C.panel2, 10, {
        stroke: C.violet + '55', sw: 1,
        children: [T(20, 18, ag.icon, 26, C.violet)],
      }),
      T(90, 16, 'ORION', 20, C.fg, { bold: true, mono: true, tracking: 2 }),
      T(90, 42, 'Code Review Agent', 12, C.sub ),
      T(90, 60, 'v2.4.1 · gpt-4o-mini', 10, C.muted, { mono: true }),
      T(16, 86, '14 active tasks  ·  3.2K tokens used  ·  99.1% success', 10, C.muted, { mono: true }),
    ],
  }));

  // Stats row
  const stats = [{ v: '14', l: 'TASKS' }, { v: '72%', l: 'PROGRESS' }, { v: '1.4s', l: 'AVG TIME' }];
  stats.forEach((s, i) => {
    ch.push(R(16 + i * 120, 174, 110, 48, C.panel, 8, {
      stroke: C.border, sw: 1,
      children: [
        T(12, 6, s.v, 18, C.violet, { bold: true, mono: true }),
        T(12, 28, s.l, 8, C.muted, { mono: true, upper: true }),
      ],
    }));
  });

  // Current task
  ch.push(T(20, 234, 'CURRENT TASK', 9, C.violet, { mono: true, upper: true, tracking: 2 }));
  ch.push(R(16, 250, W - 32, 70, C.panel2, 8, {
    stroke: C.teal + '44', sw: 1,
    children: [
      T(12, 10, 'Reviewing PR #2841 — auth refactor', 12, C.fg),
      T(12, 30, 'src/auth/session.ts · 284 lines', 10, C.muted, { mono: true }),
      Bar(12, 50, W - 80, 5, 0.72, C.teal, C.border2),
      T(W - 68, 46, '72%', 10, C.teal, { mono: true }),
    ],
  }));

  // Recent activity log
  ch.push(T(20, 334, 'ACTIVITY LOG', 9, C.violet, { mono: true, upper: true, tracking: 2 }));

  const log = [
    { time: '22:39', msg: 'Found potential null deref in line 142', level: 'warn' },
    { time: '22:38', msg: 'Analyzed 4 test files — all passing', level: 'ok' },
    { time: '22:37', msg: 'Read PR description + 3 linked issues', level: 'info' },
    { time: '22:35', msg: 'Cloned branch auth/session-refactor', level: 'info' },
    { time: '22:34', msg: 'Task assigned by @safi', level: 'info' },
  ];

  log.forEach((l, i) => {
    const y = 354 + i * 56;
    const lc = l.level === 'warn' ? C.amber : l.level === 'ok' ? C.green : C.muted;
    ch.push(R(16, y, W - 32, 46, C.panel, 6, {
      stroke: C.border, sw: 1,
      children: [
        Dot(20, 16, lc, 6),
        T(34, 7, l.msg, 11, C.fg),
        T(34, 24, l.time, 9, C.muted, { mono: true }),
        Pill(W - 80, 10, l.level.toUpperCase(), lc + '22', lc, { small: true }),
      ],
    }));
  });

  // Bottom nav
  ch.push(F(0, H - 70, W, 70, C.surface, {
    stroke: C.border, sw: 1,
    children: [
      ...[
        { icon: '◉', label: 'Hub',    x: 20  },
        { icon: '◈', label: 'Tasks',  x: 100 },
        { icon: '◇', label: 'Agents', x: 181, active: true },
        { icon: '△', label: 'Logs',   x: 261 },
        { icon: '○', label: 'Config', x: 342 },
      ].map(n => F(n.x, 8, 46, 46, 'transparent', {
        children: [
          T(15, 4, n.icon, 16, n.active ? C.violet : C.muted),
          T(4, 26, n.label, 9, n.active ? C.violet : C.muted, { mono: true }),
        ],
      })),
    ],
  }));

  return { name: 'Mobile — Agent Detail', type: 'frame', x: 0, y: 0, width: W, height: H, fill: C.bg, children: ch };
}

// ── SCREEN 3: Mobile — Task Feed ──────────────────────────────────────────────
function mTaskFeed() {
  const ch = [];

  // Header
  ch.push(F(0, 0, W, 52, C.surface, { children: [
    T(20, 18, 'Task Feed', 16, C.fg, { bold: true }),
    T(W - 80, 18, 'Live ●', 11, C.teal, { mono: true }),
  ]}));

  // Filter tabs
  const tabs = ['All', 'Needs Review', 'Running', 'Done'];
  ch.push(F(0, 52, W, 40, C.surface, {
    children: tabs.map((t, i) =>
      R(10 + i * 90, 8, 82, 26, i === 0 ? C.violet + '22' : 'transparent', 6, {
        stroke: i === 0 ? C.violet + '55' : C.border, sw: 1,
        children: [T(8, 6, t, 11, i === 0 ? C.violet : C.muted)],
      })
    ),
  }));

  // Needs review banner
  ch.push(R(16, 100, W - 32, 40, C.amber + '18', 8, {
    stroke: C.amber + '44', sw: 1,
    children: [
      T(14, 12, '1 task needs your review', 12, C.amber),
      T(W - 70, 12, 'Review →', 11, C.amber, { bold: true }),
    ],
  }));

  // Task feed items
  const feed = [
    { agent: 'Orion',  icon: '⬡', color: C.violet, action: 'Flagged potential SQL injection', file: 'src/api/query.ts:88', time: '7m ago',  status: 'waiting', approval: true  },
    { agent: 'Lyra',   icon: '◈', color: C.teal,   action: 'Fixed flaky test in CI pipeline', file: 'tests/auth.spec.ts', time: '12m ago', status: 'running', approval: false },
    { agent: 'Orion',  icon: '⬡', color: C.violet, action: 'Reviewed PR #2841 — 3 comments', file: 'src/auth/session.ts', time: '15m ago', status: 'done',    approval: false },
    { agent: 'Pulsar', icon: '◉', color: C.green,  action: 'Security scan complete — 0 CVEs', file: '847 deps scanned',   time: '20m ago', status: 'done',    approval: false },
    { agent: 'Vega',   icon: '◇', color: C.amber,  action: 'Queued 5 dependency upgrades',   file: 'package.json',       time: '25m ago', status: 'waiting', approval: false },
  ];

  feed.forEach((item, i) => {
    const y = 150 + i * 110;
    const sc = statusColor(item.status);

    ch.push(R(16, y, W - 32, 98, C.panel, 10, {
      stroke: item.approval ? C.amber + '55' : C.border, sw: 1,
      children: [
        // Agent icon
        R(12, 12, 32, 32, C.panel2, 6, {
          stroke: item.color + '55', sw: 1,
          children: [T(8, 7, item.icon, 16, item.color)],
        }),
        T(52, 12, item.agent, 11, C.sub, { bold: true, mono: true }),
        T(52, 28, item.time,  10, C.muted, { mono: true }),
        Pill(W - 90, 12, statusLabel(item.status), sc + '28', sc, { small: true }),

        // Action text
        T(12, 50, item.action, 12, C.fg),
        T(12, 68, item.file,   10, C.muted, { mono: true }),

        // Approval buttons if needed
        ...(item.approval ? [
          R(12, 80, 70, 22, C.green + '22', 4, {
            stroke: C.green + '55', sw: 1,
            children: [T(20, 5, '✓ Approve', 10, C.green, { bold: true })],
          }),
          R(90, 80, 60, 22, C.red + '22', 4, {
            stroke: C.red + '55', sw: 1,
            children: [T(12, 5, '✗ Block', 10, C.red, { bold: true })],
          }),
        ] : []),
      ],
    }));
  });

  // Bottom nav
  ch.push(F(0, H - 70, W, 70, C.surface, {
    stroke: C.border, sw: 1,
    children: [
      ...[
        { icon: '◉', label: 'Hub',    x: 20  },
        { icon: '◈', label: 'Tasks',  x: 100, active: true },
        { icon: '◇', label: 'Agents', x: 181 },
        { icon: '△', label: 'Logs',   x: 261 },
        { icon: '○', label: 'Config', x: 342 },
      ].map(n => F(n.x, 8, 46, 46, 'transparent', {
        children: [
          T(15, 4, n.icon, 16, n.active ? C.violet : C.muted),
          T(4, 26, n.label, 9, n.active ? C.violet : C.muted, { mono: true }),
        ],
      })),
    ],
  }));

  return { name: 'Mobile — Task Feed', type: 'frame', x: 0, y: 0, width: W, height: H, fill: C.bg, children: ch };
}

// ── SCREEN 4: Desktop — Command Center ────────────────────────────────────────
function dCommandCenter() {
  const ch = [];
  const SB = 220;  // sidebar width
  const TOP = 52;  // topbar height

  // ── Topbar ──────────────────────────────────────────────────────────────────
  ch.push(F(0, 0, DW, TOP, C.surface, {
    stroke: C.border, sw: 1,
    children: [
      T(20, 16, 'NEXUS', 15, C.violet, { bold: true, mono: true, tracking: 4 }),
      T(90, 18, '/ Command Center', 13, C.muted),
      // Search pill
      R(DW/2 - 130, 13, 260, 28, C.panel, 14, {
        stroke: C.border2, sw: 1,
        children: [T(14, 7, '⌘  Search agents, tasks, logs...', 11, C.dim, { mono: true })],
      }),
      T(DW - 200, 18, '● 5 agents running', 11, C.teal, { mono: true }),
      T(DW - 80, 18, '@safi', 11, C.sub),
    ],
  }));

  // ── Sidebar ─────────────────────────────────────────────────────────────────
  ch.push(F(0, TOP, SB, DH - TOP, C.surface, {
    stroke: C.border, sw: 1,
    children: [
      T(20, 20, 'WORKSPACE', 8, C.muted, { mono: true, upper: true, tracking: 2 }),
      ...[
        { icon: '◉', label: 'Command Center', active: true,  y: 40  },
        { icon: '◈', label: 'Agent Console',  active: false, y: 72  },
        { icon: '△', label: 'Task Feed',      active: false, y: 104 },
        { icon: '◇', label: 'Team Matrix',    active: false, y: 136 },
        { icon: '▲', label: 'Playbooks',      active: false, y: 168 },
      ].map(n => F(8, n.y, SB - 16, 28, n.active ? C.violet + '18' : 'transparent', {
        r: 6,
        children: [
          T(10, 6, n.icon, 13, n.active ? C.violet : C.muted),
          T(32, 7, n.label, 12, n.active ? C.fg : C.sub),
        ],
      })),

      T(20, 212, 'AGENTS', 8, C.muted, { mono: true, upper: true, tracking: 2 }),
      ...AGENTS.map((ag, i) => F(8, 232 + i * 36, SB - 16, 30, 'transparent', {
        r: 6,
        children: [
          Dot(16, 14, statusColor(ag.status), 7),
          T(32, 8, ag.name, 12, C.sub),
          T(SB - 60, 8, ag.role, 9, C.dim, { mono: true }),
        ],
      })),

      // Version footer
      T(20, DH - 80, 'NEXUS v0.9.1', 9, C.dim, { mono: true }),
      T(20, DH - 64, '© 2026 Rakis Labs', 9, C.dim, { mono: true }),
    ],
  }));

  // ── Main content ────────────────────────────────────────────────────────────
  const mx = SB + 24;
  const mw = DW - SB - 48;

  // KPI strip
  const kpis = [
    { v: '5',      l: 'Active Agents',    sub: '+2 vs yesterday',   color: C.teal   },
    { v: '47',     l: 'Tasks Today',      sub: '12 pending review', color: C.violet },
    { v: '98.2%',  l: 'Task Success',     sub: '↑ 1.1% this week',  color: C.green  },
    { v: '3,214',  l: 'Tokens Used',      sub: '~$0.06 cost today', color: C.amber  },
  ];
  const kw = (mw - 36) / 4;
  kpis.forEach((k, i) => {
    ch.push(R(mx + i * (kw + 12), TOP + 16, kw, 72, C.panel, 10, {
      stroke: C.border, sw: 1,
      children: [
        T(16, 12, k.v, 24, k.color, { bold: true, mono: true }),
        T(16, 42, k.l, 11, C.sub),
        T(16, 56, k.sub, 9, C.muted, { mono: true }),
      ],
    }));
  });

  // ── Bento grid ──────────────────────────────────────────────────────────────
  const by = TOP + 104;

  // Agent grid (2 cols × 3 rows — takes left 2/3)
  const agw = Math.floor(mw * 0.62);
  const ach = (DH - by - TOP - 48);
  const agCardW = (agw - 12) / 2;
  const agCardH = (ach - 12) / 3;

  ch.push(T(mx, by - 18, 'AGENT GRID', 9, C.violet, { mono: true, upper: true, tracking: 2 }));

  AGENTS.forEach((ag, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const ax = mx + col * (agCardW + 12);
    const ay = by + row * (agCardH + 6);
    const sc = statusColor(ag.status);

    ch.push(R(ax, ay, agCardW, agCardH, C.panel, 10, {
      stroke: ag.status === 'running' ? ag.color + '33' : C.border, sw: 1,
      children: [
        // Top row: icon + name + status
        R(14, 12, 40, 40, C.panel2, 8, {
          stroke: ag.color + '44', sw: 1,
          children: [T(12, 9, ag.icon, 22, ag.color)],
        }),
        T(64, 12, ag.name, 14, C.fg, { bold: true }),
        T(64, 30, ag.role, 11, C.sub, { mono: true }),
        Pill(agCardW - 90, 12, statusLabel(ag.status), sc + '28', sc, { small: true }),

        // Progress bar
        T(14, 60, 'Progress', 9, C.muted),
        Bar(14, 74, agCardW - 28, 5, ag.pct, ag.color, C.border2),
        T(agCardW - 44, 60, `${Math.round(ag.pct * 100)}%`, 9, sc, { mono: true }),

        // Task count
        T(14, 86, `${ag.tasks} tasks assigned`, 9, C.muted, { mono: true }),

        // Small sparkline-like bars (fake activity)
        ...[0.3, 0.7, 0.5, 0.9, 0.4, 0.8, 0.6, 1.0, 0.7, 0.5].map((h2, j) => (
          R(agCardW - 100 + j * 9, 90 - Math.round(h2 * 18), 6, Math.round(h2 * 18), ag.color + '55', 1)
        )),
      ],
    }));

    if (ag.status === 'running') {
      ch.push(Dot(ax + agCardW - 12, ay + 14, C.teal, 7));
      ch.push(Dot(ax + agCardW - 12, ay + 14, C.teal + '30', 14));
    }
  });

  // ── Live task stream (right panel) ──────────────────────────────────────────
  const rw = mw - agw - 16;
  const rx = mx + agw + 16;

  ch.push(T(rx, by - 18, 'LIVE TASK STREAM', 9, C.violet, { mono: true, upper: true, tracking: 2 }));
  ch.push(R(rx, by, rw, ach + 6, C.panel, 10, {
    stroke: C.border, sw: 1,
    children: [
      T(14, 12, '● Live', 10, C.teal, { mono: true }),
      T(rw - 60, 12, 'View all →', 10, C.muted),
      ...TASKS.map((task, i) => {
        const ty = 34 + i * 68;
        const sc2 = statusColor(task.status);
        return F(10, ty, rw - 20, 60, C.panel2, {
          r: 8,
          children: [
            Dot(14, 14, sc2, 6),
            T(26, 8, task.agent, 10, C.sub, { bold: true, mono: true }),
            T(26, 24, task.action, 11, C.fg),
            T(26, 40, task.note, 9, C.muted, { mono: true }),
            T(rw - 70, 8, task.time, 9, C.muted, { mono: true }),
          ],
        });
      }),
    ],
  }));

  return { name: 'Desktop — Command Center', type: 'frame', x: 0, y: 0, width: DW, height: DH, fill: C.bg, children: ch };
}

// ── SCREEN 5: Desktop — Agent Console (Orion Deep Dive) ──────────────────────
function dAgentConsole() {
  const ch = [];
  const SB = 220;
  const TOP = 52;

  // Topbar
  ch.push(F(0, 0, DW, TOP, C.surface, {
    stroke: C.border, sw: 1,
    children: [
      T(20, 16, 'NEXUS', 15, C.violet, { bold: true, mono: true, tracking: 4 }),
      T(90, 18, '/ Agent Console / Orion', 13, C.muted),
      R(DW/2 - 130, 13, 260, 28, C.panel, 14, {
        stroke: C.border2, sw: 1,
        children: [T(14, 7, '⌘  Search agents, tasks, logs...', 11, C.dim, { mono: true })],
      }),
      Pill(DW - 180, 16, 'RUNNING', C.teal + '28', C.teal),
      T(DW - 90, 18, '@safi', 11, C.sub),
    ],
  }));

  // Sidebar (same nav)
  ch.push(F(0, TOP, SB, DH - TOP, C.surface, {
    stroke: C.border, sw: 1,
    children: [
      T(20, 20, 'WORKSPACE', 8, C.muted, { mono: true, upper: true, tracking: 2 }),
      ...[
        { icon: '◉', label: 'Command Center', active: false, y: 40  },
        { icon: '◈', label: 'Agent Console',  active: true,  y: 72  },
        { icon: '△', label: 'Task Feed',      active: false, y: 104 },
        { icon: '◇', label: 'Team Matrix',    active: false, y: 136 },
        { icon: '▲', label: 'Playbooks',      active: false, y: 168 },
      ].map(n => F(8, n.y, SB - 16, 28, n.active ? C.violet + '18' : 'transparent', {
        r: 6,
        children: [
          T(10, 6, n.icon, 13, n.active ? C.violet : C.muted),
          T(32, 7, n.label, 12, n.active ? C.fg : C.sub),
        ],
      })),
    ],
  }));

  const mx = SB + 24;
  const mw = DW - SB - 48;
  const by = TOP + 20;

  // ── Agent header ────────────────────────────────────────────────────────────
  ch.push(R(mx, by, mw, 80, C.panel, 10, {
    stroke: C.violet + '33', sw: 1,
    children: [
      R(16, 16, 52, 52, C.panel2, 10, {
        stroke: C.violet + '55', sw: 1,
        children: [T(16, 12, AGENTS[0].icon, 26, C.violet)],
      }),
      T(82, 16, 'Orion', 22, C.fg, { bold: true }),
      T(82, 44, 'Code Review Agent  ·  v2.4.1  ·  gpt-4o-mini', 11, C.sub, { mono: true }),
      T(mw - 220, 16, '14 tasks active', 12, C.teal, { mono: true }),
      T(mw - 220, 36, '3,214 tokens used', 10, C.muted, { mono: true }),
      Pill(mw - 100, 16, 'RUNNING', C.teal + '28', C.teal),
    ],
  }));

  // ── 3-col layout ────────────────────────────────────────────────────────────
  const col1w = Math.floor(mw * 0.42);
  const col2w = Math.floor(mw * 0.30);
  const col3w = mw - col1w - col2w - 24;
  const colY  = by + 96;
  const colH  = DH - colY - 24;

  const col2x = mx + col1w + 12;
  const col3x = col2x + col2w + 12;

  // Col 1: Code diff viewer
  ch.push(T(mx, colY - 16, 'CURRENT DIFF', 9, C.violet, { mono: true, upper: true, tracking: 2 }));
  ch.push(R(mx, colY, col1w, colH, C.panel, 8, {
    stroke: C.border, sw: 1,
    children: [
      // File header
      F(0, 0, col1w, 32, C.panel2, {
        r: 8,
        children: [
          T(12, 8, 'src/auth/session.ts', 11, C.sub, { mono: true }),
          Pill(col1w - 80, 9, '+12 / -4', C.green + '22', C.green, { small: true }),
        ],
      }),
      // Diff lines
      ...(() => {
        const lines = [
          { n: '138', t: ' const session = getSession(req)', c: C.sub },
          { n: '139', t: ' if (!session) return null',       c: C.sub },
          { n: '140', t: '-  const user = session.user',     c: C.red,   bg: C.red   + '11' },
          { n: '141', t: '+  const user = session?.user',    c: C.green, bg: C.green + '11' },
          { n: '142', t: '+  if (!user?.id) {',              c: C.green, bg: C.green + '11' },
          { n: '143', t: '+    throw new AuthError()',       c: C.green, bg: C.green + '11' },
          { n: '144', t: '+  }',                             c: C.green, bg: C.green + '11' },
          { n: '145', t: ' return buildToken(user)',         c: C.sub },
          { n: '146', t: ' }',                               c: C.sub },
        ];
        return lines.map((l, i) => F(0, 32 + i * 22, col1w, 22, l.bg || 'transparent', {
          children: [
            T(8,  5, l.n, 9, C.dim, { mono: true }),
            T(40, 5, l.t, 10, l.c, { mono: true }),
          ],
        }));
      })(),

      // Orion's comment
      R(12, 240, col1w - 24, 80, C.amber + '11', 6, {
        stroke: C.amber + '44', sw: 1,
        children: [
          T(10, 8,  'Orion · 2m ago', 9, C.amber, { mono: true }),
          T(10, 24, 'Potential null dereference on line 140.', 11, C.fg),
          T(10, 40, 'Added optional chaining and explicit', 11, C.fg),
          T(10, 56, 'AuthError throw for missing user.id.', 11, C.fg),
        ],
      }),
    ],
  }));

  // Col 2: Timeline
  ch.push(T(col2x, colY - 16, 'TIMELINE', 9, C.violet, { mono: true, upper: true, tracking: 2 }));
  ch.push(R(col2x, colY, col2w, colH, C.panel, 8, {
    stroke: C.border, sw: 1,
    children: [
      ...(() => {
        const events = [
          { t: '22:41', ev: 'Analyzing line 142', sc: C.teal   },
          { t: '22:39', ev: 'Commented on PR',    sc: C.violet },
          { t: '22:38', ev: 'Tests reviewed',     sc: C.green  },
          { t: '22:37', ev: 'PR description read',sc: C.sub    },
          { t: '22:35', ev: 'Branch cloned',      sc: C.sub    },
          { t: '22:34', ev: 'Task assigned',      sc: C.amber  },
        ];
        const result = [];
        events.forEach((ev, i) => {
          const y2 = 12 + i * 60;
          result.push(Dot(18, y2 + 12, ev.sc, 8));
          if (i < events.length - 1) {
            result.push(R(17, y2 + 20, 2, 42, C.border2, 1));
          }
          result.push(T(32, y2 + 4,  ev.t,  9,  C.muted, { mono: true }));
          result.push(T(32, y2 + 18, ev.ev, 11, C.fg));
        });
        return result;
      })(),
    ],
  }));

  // Col 3: Metrics
  ch.push(T(col3x, colY - 16, 'METRICS', 9, C.violet, { mono: true, upper: true, tracking: 2 }));
  ch.push(R(col3x, colY, col3w, colH, C.panel, 8, {
    stroke: C.border, sw: 1,
    children: [
      T(14, 14, 'Token usage', 10, C.sub),
      T(14, 30, '3,214', 20, C.violet, { bold: true, mono: true }),
      Bar(14, 58, col3w - 28, 6, 0.32, C.violet, C.border2),
      T(14, 70, '32% of budget', 9, C.muted, { mono: true }),

      T(14, 100, 'Success rate', 10, C.sub),
      T(14, 116, '99.1%', 20, C.green, { bold: true, mono: true }),
      Bar(14, 144, col3w - 28, 6, 0.991, C.green, C.border2),

      T(14, 174, 'Avg response', 10, C.sub),
      T(14, 190, '1.4s', 20, C.teal, { bold: true, mono: true }),

      T(14, 230, 'Tasks (today)', 10, C.sub),
      T(14, 246, '14 / 50', 18, C.amber, { bold: true, mono: true }),
      Bar(14, 272, col3w - 28, 6, 0.28, C.amber, C.border2),
    ],
  }));

  return { name: 'Desktop — Agent Console', type: 'frame', x: 0, y: 0, width: DW, height: DH, fill: C.bg, children: ch };
}

// ── SCREEN 6: Desktop — Team × Agent Matrix ───────────────────────────────────
function dTeamMatrix() {
  const ch = [];
  const SB = 220;
  const TOP = 52;

  // Topbar
  ch.push(F(0, 0, DW, TOP, C.surface, {
    stroke: C.border, sw: 1,
    children: [
      T(20, 16, 'NEXUS', 15, C.violet, { bold: true, mono: true, tracking: 4 }),
      T(90, 18, '/ Team Matrix', 13, C.muted),
      R(DW/2 - 130, 13, 260, 28, C.panel, 14, {
        stroke: C.border2, sw: 1,
        children: [T(14, 7, '⌘  Search...', 11, C.dim, { mono: true })],
      }),
      T(DW - 90, 18, '@safi', 11, C.sub),
    ],
  }));

  // Sidebar
  ch.push(F(0, TOP, SB, DH - TOP, C.surface, {
    stroke: C.border, sw: 1,
    children: [
      T(20, 20, 'WORKSPACE', 8, C.muted, { mono: true, upper: true, tracking: 2 }),
      ...[
        { icon: '◉', label: 'Command Center', active: false, y: 40  },
        { icon: '◈', label: 'Agent Console',  active: false, y: 72  },
        { icon: '△', label: 'Task Feed',      active: false, y: 104 },
        { icon: '◇', label: 'Team Matrix',    active: true,  y: 136 },
        { icon: '▲', label: 'Playbooks',      active: false, y: 168 },
      ].map(n => F(8, n.y, SB - 16, 28, n.active ? C.violet + '18' : 'transparent', {
        r: 6,
        children: [
          T(10, 6, n.icon, 13, n.active ? C.violet : C.muted),
          T(32, 7, n.label, 12, n.active ? C.fg : C.sub),
        ],
      })),
    ],
  }));

  const mx = SB + 24;
  const mw = DW - SB - 48;
  const by = TOP + 20;

  // Section header
  ch.push(T(mx, by, 'TEAM × AGENT WORKLOAD MATRIX', 11, C.fg, { bold: true }));
  ch.push(T(mx, by + 20, 'Who is paired with which agent — and how much work each pairing is generating', 11, C.sub));

  // Matrix table
  const people = ['@safi', '@kai', '@ananya', '@leo', '@mira'];
  const agents  = AGENTS.map(a => a.name);

  // Matrix data: task counts per person×agent
  const matrix = [
    [5, 2, 0, 1, 0],
    [2, 4, 3, 0, 1],
    [0, 1, 5, 2, 0],
    [3, 0, 2, 4, 0],
    [1, 2, 0, 0, 3],
  ];

  const matStartX = mx + 110;
  const matStartY = by + 56;
  const cellW = 100, cellH = 52;

  // Column headers (agents)
  agents.forEach((a, j) => {
    const ag = AGENTS[j];
    ch.push(R(matStartX + j * cellW + 4, matStartY - 36, cellW - 8, 30, C.panel, 6, {
      stroke: ag.color + '33', sw: 1,
      children: [
        T(8, 6, ag.icon, 12, ag.color),
        T(24, 6, a, 11, C.sub, { bold: true }),
        Dot(cellW - 16, 14, statusColor(ag.status), 6),
      ],
    }));
  });

  // Row headers (people)
  people.forEach((p, i) => {
    ch.push(T(mx, matStartY + i * cellH + 16, p, 12, C.sub, { mono: true, bold: true }));
  });

  // Matrix cells
  const maxVal = 5;
  people.forEach((_, i) => {
    agents.forEach((__, j) => {
      const v  = matrix[i][j];
      const pct = v / maxVal;
      const cellX = matStartX + j * cellW + 4;
      const cellY = matStartY + i * cellH + 4;
      const ag    = AGENTS[j];
      const cellBg = v > 0 ? ag.color + Math.round(pct * 40 + 10).toString(16).padStart(2, '0') : C.panel;

      ch.push(R(cellX, cellY, cellW - 8, cellH - 8, cellBg, 6, {
        stroke: v > 0 ? ag.color + '33' : C.border, sw: 1,
        children: [
          T(cellW / 2 - 14, 6, v > 0 ? `${v}` : '—', 18, v > 0 ? ag.color : C.dim, { bold: true, mono: true }),
          T(8, 30, v > 0 ? 'tasks' : '', 8, ag.color + 'aa', { mono: true }),
        ],
      }));
    });
  });

  // Workload summary strip (bottom)
  const summaryY = matStartY + people.length * cellH + 20;
  ch.push(T(mx, summaryY, 'WORKLOAD SUMMARY', 9, C.violet, { mono: true, upper: true, tracking: 2 }));

  const summaries = [
    { person: '@safi',   tasks: 8,  agents: 3, load: 0.65 },
    { person: '@kai',    tasks: 10, agents: 4, load: 0.80 },
    { person: '@ananya', tasks: 8,  agents: 3, load: 0.65 },
    { person: '@leo',    tasks: 9,  agents: 3, load: 0.72 },
    { person: '@mira',   tasks: 6,  agents: 2, load: 0.48 },
  ];

  summaries.forEach((s, i) => {
    const sw2 = (mw - 48) / 5;
    ch.push(R(mx + i * (sw2 + 12), summaryY + 18, sw2, 68, C.panel, 8, {
      stroke: C.border, sw: 1,
      children: [
        T(12, 8, s.person, 11, C.sub, { bold: true, mono: true }),
        T(12, 26, `${s.tasks} tasks`, 14, C.fg, { bold: true }),
        T(12, 44, `${s.agents} agents`, 9, C.muted, { mono: true }),
        Bar(12, 58, sw2 - 24, 4, s.load, C.violet, C.border2),
      ],
    }));
  });

  return { name: 'Desktop — Team Matrix', type: 'frame', x: 0, y: 0, width: DW, height: DH, fill: C.bg, children: ch };
}

// ── Assemble ──────────────────────────────────────────────────────────────────
const screens = [
  mAgentHub(),
  mAgentDetail(),
  mTaskFeed(),
  dCommandCenter(),
  dAgentConsole(),
  dTeamMatrix(),
];

const pen = { version: '2.8', children: screens };

const outPath = path.join(__dirname, 'nexus.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));

const size = (fs.statSync(outPath).size / 1024).toFixed(1);
console.log(`✓ Written: nexus.pen (${size} KB)`);
console.log(`  Screens: ${screens.map(s => s.name).join(' · ')}`);
console.log(`  Palette: #0e0f14 bg · #7b68ee violet · #00c9a7 teal · #f5a623 amber`);
console.log(`  Inspiration: Linear agent tasks UI + Dark Mode Design aesthetic`);
