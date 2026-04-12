'use strict';
// orbiter-app.js
// ORBITER — AI Code Orchestration Dashboard
//
// Design Heartbeat — Mar 19, 2026
// Inspired by:
//   • Superset.sh (godly.website) — parallel AI agent terminal visualization, near-black bg,
//     CLI aesthetic with PR numbers, branch names, agent slots
//   • Evervault Customers page — deep navy-black rgb(1,3,20) background, Inter font
//   • Linear.app — rgb(8,9,10) void dark, Inter Variable, "product development for teams and agents"
//   • Dark Mode Design gallery — Midday, Forge, Superset nominees (darkmodedesign.com)

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#01031A',   // Evervault deep navy-black (rgb 1,3,26)
  surface:  '#070B2A',   // elevated card
  surface2: '#0C1035',   // higher surface / hover state
  border:   '#1B2050',   // subtle divider
  border2:  '#252B62',   // stronger border / focus ring
  muted:    '#3A4080',   // muted chrome
  dim:      '#6B72B8',   // secondary text
  fg:       '#E8EAFF',   // cool off-white
  fg2:      '#9298CC',   // warm secondary
  indigo:   '#6366F1',   // primary accent — electric indigo
  cyan:     '#00D98A',   // terminal green / active state (Superset-inspired)
  violet:   '#8B5CF6',   // secondary — deep violet (Evervault purple)
  amber:    '#F59E0B',   // warnings / queued
  red:      '#F87171',   // errors / failing
};

let _id = 0;
const uid = () => `orb${++_id}`;

// ── Core primitives ───────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill || P.bg,
  clip: opts.clip !== undefined ? opts.clip : false,
  ...(opts.r !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.ch || [],
});

const T = (content, x, y, w, h, opts = {}) => ({
  id: uid(), type: 'text', content, x, y, width: w, height: h,
  textGrowth: 'fixed-width-height',
  fontSize: opts.size || 13,
  fontWeight: String(opts.weight || 400),
  fill: opts.fill || P.fg,
  textAlign: opts.align || 'left',
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh !== undefined ? { lineHeight: opts.lh } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  ...(opts.font ? { fontFamily: opts.font } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Line  = (x, y, w, fill = P.border) => F(x, y, w, 1, fill, {});
const VLine = (x, y, h, fill = P.border) => F(x, y, 1, h, fill, {});

const Pill = (x, y, text, bg, fg, opts = {}) => {
  const w = text.length * 6.5 + 18;
  return F(x, y, w, 20, bg, {
    r: 10,
    ch: [T(text, 9, 3, w - 18, 14, { size: 9, fill: fg, weight: 700, ls: 0.5 })],
    ...(opts.stroke ? { stroke: { align: 'inside', thickness: 1, fill: opts.stroke } } : {}),
  });
};

const Dot = (x, y, color) => E(x, y, 6, 6, color);

// Status pill factory
const StatusPill = (x, y, label, color) => Pill(x, y, label, color + '22', color, { stroke: color + '55' });

// Terminal line (monospace code line)
const TermLine = (x, y, w, prefix, code, prefixColor) => ({
  id: uid(), type: 'frame', x, y, width: w, height: 16,
  fill: 'transparent', clip: false,
  children: [
    T(prefix, 0, 0, 30, 16, { size: 10, fill: prefixColor || P.dim, weight: 500, font: 'monospace' }),
    T(code,   32, 0, w - 32, 16, { size: 10, fill: P.fg2, font: 'monospace' }),
  ],
});

// Code diff line
const DiffLine = (x, y, w, type, code) => {
  const bg   = type === '+' ? P.cyan + '15' : type === '-' ? P.red + '15' : 'transparent';
  const gutter = type === '+' ? P.cyan : type === '-' ? P.red : P.dim;
  return F(x, y, w, 18, bg, {
    ch: [
      T(type, 0, 1, 14, 16, { size: 10, fill: gutter, weight: 700, font: 'monospace', align: 'center' }),
      T(code, 16, 1, w - 18, 16, { size: 10, fill: type === '+' ? P.cyan : type === '-' ? P.red + 'CC' : P.fg2 + '88', font: 'monospace' }),
    ],
  });
};

// Agent card component
const AgentCard = (x, y, w, name, model, status, task, progress) => {
  const statusColor = status === 'RUNNING' ? P.cyan : status === 'QUEUED' ? P.amber : status === 'DONE' ? P.indigo : P.dim;
  const progressW = Math.round((w - 28) * progress);
  return F(x, y, w, 90, P.surface, {
    r: 10,
    stroke: status === 'RUNNING' ? P.indigo + '55' : P.border,
    ch: [
      // Header row
      Dot(14, 14, statusColor),
      T(name,  28, 10, w - 80, 16, { size: 12, fill: P.fg,  weight: 700, ls: 0.3 }),
      T(model, 28, 28, w - 80, 12, { size: 9,  fill: P.dim, weight: 400 }),
      StatusPill(w - 68, 10, status, statusColor),
      // Task description
      T(task, 14, 50, w - 28, 14, { size: 10, fill: P.fg2, lh: 1.4 }),
      // Progress bar track
      F(14, 74, w - 28, 4, P.border, { r: 2 }),
      // Progress bar fill
      F(14, 74, progressW, 4, statusColor, { r: 2, opacity: status === 'RUNNING' ? 1 : 0.5 }),
    ],
  });
};

// ── Nav bar ───────────────────────────────────────────────────────────────────
const NavBar = (y) => F(0, y, 375, 52, P.surface, {
  stroke: P.border,
  ch: [
    T('ORBITER', 18, 16, 100, 20, { size: 14, fill: P.fg, weight: 900, ls: 2 }),
    E(108, 18, 8, 8, P.indigo, { opacity: 0.8 }),
    // right: notification dot + avatar
    E(345, 16, 20, 20, P.border2, { stroke: P.border }),
    T('R', 351, 19, 8, 12, { size: 9, fill: P.dim, weight: 700, align: 'center' }),
    E(358, 13, 8, 8, P.indigo),
  ],
});

// ── Bottom Tab Bar ────────────────────────────────────────────────────────────
const TabBar = (y, activeTab) => {
  const tabs = [
    { icon: '⊞', label: 'Fleet',   idx: 0 },
    { icon: '◉', label: 'Live',    idx: 1 },
    { icon: '△', label: 'Review',  idx: 2 },
    { icon: '⚙', label: 'Control', idx: 3 },
  ];
  const tabW = 375 / 4;
  return F(0, y, 375, 64, P.surface, {
    stroke: P.border,
    ch: tabs.map(t => F(t.idx * tabW, 0, tabW, 64, 'transparent', {
      ch: [
        T(t.icon,  t.idx * tabW + tabW/2 - 8, 10, 16, 16, { size: 14, fill: activeTab === t.idx ? P.indigo : P.dim, align: 'center' }),
        T(t.label, t.idx * tabW + 4, 30, tabW - 8, 12, { size: 9, fill: activeTab === t.idx ? P.indigo : P.muted, align: 'center', weight: activeTab === t.idx ? 700 : 400 }),
        ...(activeTab === t.idx ? [F(t.idx * tabW + tabW/2 - 12, 58, 24, 2, P.indigo, { r: 1 })] : []),
      ],
    })),
  });
};

// ── SCREEN 1: Hero / Launch ───────────────────────────────────────────────────
function buildScreen1() {
  const W = 375, H = 812;
  const children = [];

  // Background glow orbs (Evervault-inspired)
  children.push(E(187, -60, 320, 320, P.indigo, { opacity: 0.08 }));
  children.push(E(-40, 580, 280, 280, P.violet, { opacity: 0.06 }));
  children.push(E(300, 700, 200, 200, P.cyan,   { opacity: 0.05 }));

  // Status bar
  children.push(T('9:41', 16, 16, 80, 14, { size: 12, fill: P.fg, weight: 600 }));
  children.push(T('●●●', 300, 16, 60, 14, { size: 10, fill: P.fg2, align: 'right' }));

  // ── Animated orbit indicator (Superset multi-agent visualization) ──────────
  // Central glow core
  children.push(E(187 - 44, 200 - 44, 88, 88, P.indigo, { opacity: 0.15 }));
  children.push(E(187 - 32, 200 - 32, 64, 64, P.indigo, { opacity: 0.25 }));
  children.push(E(187 - 20, 200 - 20, 40, 40, P.indigo, { opacity: 0.7 }));
  children.push(E(187 - 6,  200 - 6,  12, 12, P.fg,     { opacity: 0.9 }));

  // Orbit rings (3 concentric)
  children.push(E(187 - 70, 200 - 70, 140, 140, 'transparent', { stroke: P.border2, sw: 1, opacity: 0.5 }));
  children.push(E(187 - 95, 200 - 95, 190, 190, 'transparent', { stroke: P.border, sw: 1, opacity: 0.3 }));
  children.push(E(187 - 118, 200 - 118, 236, 236, 'transparent', { stroke: P.border, sw: 1, opacity: 0.15 }));

  // Agent nodes on orbits (Superset-style parallel agents)
  children.push(E(187 + 65, 200 - 22, 12, 12, P.cyan,   {}));       // Agent 1 — running
  children.push(E(187 - 77, 200 - 22, 12, 12, P.indigo, {}));        // Agent 2 — active
  children.push(E(187 + 10, 200 - 95, 12, 12, P.violet, {}));        // Agent 3 — queued
  children.push(E(187 + 80, 200 + 40, 8,  8,  P.amber,  {}));        // Agent 4 — waiting
  children.push(E(187 - 88, 200 + 50, 8,  8,  P.dim,    {}));        // Agent 5 — idle

  // Agent labels (terminal style — Superset)
  children.push(T('claude-3.7', 187 + 66, 200 - 38, 70, 11, { size: 8, fill: P.cyan,   font: 'monospace' }));
  children.push(T('gemini-2.0', 187 - 120, 200 - 34, 68, 11, { size: 8, fill: P.indigo, font: 'monospace' }));
  children.push(T('gpt-4o',    187 + 14,  200 - 112, 48, 11, { size: 8, fill: P.violet, font: 'monospace' }));

  children.push(Line(0, 360, 375, P.border));

  // ── Hero text ──────────────────────────────────────────────────────────────
  children.push(T('ORBITER', 0, 390, 375, 72, { size: 60, fill: P.fg, weight: 900, ls: -1, align: 'center' }));

  // ORBITER glow
  children.push(T('ORBITER', 0, 390, 375, 72, { size: 60, fill: P.indigo, weight: 900, ls: -1, align: 'center', opacity: 0.12 }));

  children.push(T('Orchestrate parallel AI agents\nacross your entire codebase', 30, 470, 315, 44, {
    size: 15, fill: P.fg2, weight: 400, lh: 1.55, align: 'center',
  }));

  // Version badge
  children.push(Pill(375/2 - 50, 525, '✦ BETA · v0.7.2', P.indigo + '22', P.indigo, { stroke: P.indigo + '44' }));

  // ── Stats row (Superset-inspired metrics) ──────────────────────────────────
  const statW = 100;
  const statX = [18, 137, 256];
  const stats = [
    { val: '12', label: 'AGENTS' },
    { val: '847', label: 'REVIEWS' },
    { val: '99.2%', label: 'ACCURACY' },
  ];
  stats.forEach((s, i) => {
    children.push(F(statX[i], 558, statW, 52, P.surface, {
      r: 8, stroke: P.border,
      ch: [
        T(s.val, 0, 8, statW, 22, { size: 20, fill: P.fg, weight: 800, align: 'center' }),
        T(s.label, 0, 32, statW, 12, { size: 8, fill: P.dim, weight: 700, ls: 1, align: 'center' }),
      ],
    }));
  });

  // ── CTA Button ────────────────────────────────────────────────────────────
  children.push(F(24, 630, 327, 52, P.indigo, {
    r: 12,
    ch: [
      T('Start Orchestrating', 0, 16, 327, 20, { size: 15, fill: P.fg, weight: 700, align: 'center', ls: 0.2 }),
    ],
  }));
  children.push(F(24, 694, 327, 44, P.surface, {
    r: 12, stroke: P.border,
    ch: [
      T('View Documentation', 0, 13, 327, 18, { size: 13, fill: P.dim, weight: 500, align: 'center' }),
    ],
  }));

  // Footer note
  children.push(T('Free during beta · No credit card required', 0, 752, 375, 14,
    { size: 10, fill: P.muted, align: 'center' }));

  return { id: uid(), type: 'frame', name: 'S1-Hero', x: 0, y: 0, width: W, height: H, fill: P.bg, clip: false, children };
}

// ── SCREEN 2: Fleet Dashboard ─────────────────────────────────────────────────
function buildScreen2() {
  const W = 375, H = 812;
  const ch = [];

  // Subtle background orb
  ch.push(E(300, -40, 200, 200, P.indigo, { opacity: 0.05 }));

  ch.push(NavBar(44));

  // Page title
  ch.push(T('Fleet', 18, 112, 200, 28, { size: 22, fill: P.fg, weight: 800, ls: -0.3 }));
  ch.push(T('3 agents active · 2 queued', 18, 142, 250, 14, { size: 11, fill: P.dim }));
  ch.push(StatusPill(270, 114, '● LIVE', P.cyan));

  // ── Stats row ─────────────────────────────────────────────────────────────
  const kpis = [
    { val: '3', label: 'Running', color: P.cyan   },
    { val: '2', label: 'Queued',  color: P.amber  },
    { val: '14', label: 'Done',   color: P.indigo },
    { val: '0', label: 'Failed',  color: P.red    },
  ];
  const kpiW = 80;
  kpis.forEach((k, i) => {
    ch.push(F(14 + i * (kpiW + 4), 166, kpiW, 54, P.surface, {
      r: 8, stroke: P.border,
      ch: [
        T(k.val,   0, 8,  kpiW, 22, { size: 18, fill: k.color, weight: 800, align: 'center' }),
        T(k.label, 0, 32, kpiW, 12, { size: 8.5, fill: P.dim, weight: 500, align: 'center' }),
      ],
    }));
  });

  // ── Agent cards ───────────────────────────────────────────────────────────
  ch.push(T('ACTIVE AGENTS', 18, 236, 200, 12, { size: 9, fill: P.muted, weight: 700, ls: 1.5 }));

  ch.push(AgentCard(14, 254, 347, 'CLAUDE-1', 'claude-3.7-sonnet', 'RUNNING',
    'Reviewing PR #902 · forward-ports', 0.72));
  ch.push(AgentCard(14, 352, 347, 'CLAUDE-2', 'claude-3.7-sonnet', 'RUNNING',
    'Reviewing PR #884 · see-changes', 0.44));
  ch.push(AgentCard(14, 450, 347, 'GEMINI-1', 'gemini-2.0-flash', 'RUNNING',
    'Reviewing PR #815 · create-parallel-branches', 0.18));

  // ── Queue ─────────────────────────────────────────────────────────────────
  ch.push(T('QUEUED', 18, 556, 200, 12, { size: 9, fill: P.muted, weight: 700, ls: 1.5 }));
  ch.push(Line(18, 570, 339, P.border));

  const queued = [
    { pr: '#816', branch: 'open-in-any-ide', model: 'gpt-4o-mini' },
    { pr: '#733', branch: 'use-any-agents',  model: 'gemini-flash' },
  ];
  queued.forEach((q, i) => {
    const qy = 578 + i * 54;
    ch.push(F(14, qy, 347, 46, P.surface, {
      r: 8, stroke: P.border,
      ch: [
        StatusPill(14, 13, 'QUEUED', P.amber),
        T(`PR ${q.pr}`,   70, 13, 100, 16, { size: 11, fill: P.fg,  weight: 700, font: 'monospace' }),
        T(q.branch,       14, 30, 200, 12, { size: 9,  fill: P.dim, font: 'monospace' }),
        T(q.model,       270, 30,  80, 12, { size: 9,  fill: P.violet, align: 'right' }),
      ],
    }));
  });

  ch.push(TabBar(748, 0));

  return { id: uid(), type: 'frame', name: 'S2-Fleet', x: 0, y: 0, width: W, height: H, fill: P.bg, clip: false, children: ch };
}

// ── SCREEN 3: Agent Live / Terminal ──────────────────────────────────────────
function buildScreen3() {
  const W = 375, H = 812;
  const ch = [];

  // Back header
  ch.push(F(0, 44, 375, 52, P.surface, {
    stroke: P.border,
    ch: [
      T('←', 16, 16, 20, 20, { size: 16, fill: P.fg2 }),
      T('CLAUDE-1', 44, 16, 180, 18, { size: 14, fill: P.fg, weight: 700, ls: 1 }),
      StatusPill(262, 17, '● RUNNING', P.cyan),
    ],
  }));

  // PR info card
  ch.push(F(14, 108, 347, 60, P.surface, {
    r: 10, stroke: P.indigo + '44',
    ch: [
      T('PR #902', 14, 12, 120, 18, { size: 13, fill: P.fg, weight: 700, font: 'monospace' }),
      T('forward-ports', 14, 32, 200, 14, { size: 10, fill: P.indigo, font: 'monospace' }),
      T('+127 −8', 255, 12, 80, 18, { size: 12, fill: P.cyan, weight: 700, align: 'right', font: 'monospace' }),
      T('main ← feature/ports', 255, 32, 90, 14, { size: 9, fill: P.dim, align: 'right' }),
    ],
  }));

  // Progress bar
  ch.push(F(14, 180, 347, 6, P.border, { r: 3 }));
  ch.push(F(14, 180, 250, 6, P.indigo, { r: 3 }));
  ch.push(T('72% complete · est. 1m 20s', 14, 192, 200, 12, { size: 9, fill: P.dim }));
  ch.push(T('3 issues found', 228, 192, 120, 12, { size: 9, fill: P.amber, align: 'right' }));

  // ── Terminal panel ─────────────────────────────────────────────────────────
  ch.push(T('AGENT LOG', 14, 218, 200, 12, { size: 9, fill: P.muted, weight: 700, ls: 1.5 }));
  ch.push(F(14, 232, 347, 300, P.surface, {
    r: 10, stroke: P.border,
    ch: [
      // Terminal header bar
      F(0, 0, 347, 28, P.surface2, { r: 10 }),
      E(14, 10, 8, 8, '#F87171'),
      E(28, 10, 8, 8, '#F59E0B'),
      E(42, 10, 8, 8, '#00D98A'),
      T('claude-3.7-sonnet · orbiter-agent', 56, 7, 240, 14, { size: 9, fill: P.dim, font: 'monospace' }),

      // Log lines
      TermLine(14, 38,  320, '>', 'Initializing code review engine...', P.cyan),
      TermLine(14, 58,  320, '>', 'Fetching PR diff from GitHub...', P.cyan),
      TermLine(14, 78,  320, '✓', 'diff fetched: 127 additions, 8 deletions', P.indigo),
      TermLine(14, 98,  320, '>', 'Analyzing changed files (7)...', P.cyan),
      TermLine(14, 118, 320, '✓', 'src/ports/manager.ts — OK', P.indigo),
      TermLine(14, 138, 320, '✓', 'src/ports/proxy.ts — OK', P.indigo),
      TermLine(14, 158, 320, '⚠', 'src/ports/expose.ts — 2 issues', P.amber),
      TermLine(14, 178, 320, '⚠', '  L.47: unhandled rejection risk', P.amber),
      TermLine(14, 198, 320, '⚠', '  L.89: port collision not checked', P.amber),
      TermLine(14, 218, 320, '✓', 'tests/ports.test.ts — OK', P.indigo),
      TermLine(14, 238, 320, '>', 'Generating review comment...', P.cyan),
      TermLine(14, 258, 320, '_', '', P.cyan),
    ],
  }));

  // Reasoning trace
  ch.push(T('REASONING TRACE', 14, 546, 200, 12, { size: 9, fill: P.muted, weight: 700, ls: 1.5 }));
  ch.push(F(14, 560, 347, 72, P.surface, {
    r: 8, stroke: P.border,
    ch: [
      T('"The expose.ts file introduces async port allocation without error boundaries. Port collision is a silent failure risk in high-concurrency scenarios — flagged as medium severity."',
        14, 12, 318, 48, { size: 10, fill: P.fg2, lh: 1.55, opacity: 0.85 }),
    ],
  }));

  // Action row
  ch.push(F(14, 648, 160, 40, P.indigo, {
    r: 8,
    ch: [T('Approve Review', 0, 11, 160, 18, { size: 11, fill: P.fg, weight: 700, align: 'center' })],
  }));
  ch.push(F(182, 648, 179, 40, P.surface, {
    r: 8, stroke: P.border,
    ch: [T('Request Changes', 0, 11, 179, 18, { size: 11, fill: P.amber, weight: 600, align: 'center' })],
  }));

  ch.push(TabBar(748, 1));

  return { id: uid(), type: 'frame', name: 'S3-AgentLive', x: 0, y: 0, width: W, height: H, fill: P.bg, clip: false, children: ch };
}

// ── SCREEN 4: Review Diff View ────────────────────────────────────────────────
function buildScreen4() {
  const W = 375, H = 812;
  const ch = [];

  // Header
  ch.push(F(0, 44, 375, 52, P.surface, {
    stroke: P.border,
    ch: [
      T('←', 16, 16, 20, 20, { size: 16, fill: P.fg2 }),
      T('expose.ts', 44, 14, 200, 18, { size: 13, fill: P.fg, weight: 700, font: 'monospace' }),
      T('L.47 + L.89', 44, 32, 200, 12, { size: 9, fill: P.amber, font: 'monospace' }),
      StatusPill(272, 16, '2 ISSUES', P.amber),
    ],
  }));

  // File info strip
  ch.push(F(0, 96, 375, 32, P.surface2, {
    ch: [
      T('src/ports/', 14, 8, 120, 16, { size: 10, fill: P.dim, font: 'monospace' }),
      T('expose.ts', 90, 8, 90, 16, { size: 10, fill: P.fg, font: 'monospace', weight: 700 }),
      T('+44 −3', 270, 8, 90, 16, { size: 10, fill: P.cyan, font: 'monospace', weight: 600, align: 'right' }),
    ],
  }));

  // Diff view
  const diffLines = [
    { t: ' ', c: 'export async function exposePort(' },
    { t: ' ', c: '  config: PortConfig' },
    { t: ' ', c: '): Promise<ExposedPort> {' },
    { t: '-', c: '  const port = await allocate();' },
    { t: '+', c: '  const port = await allocate().catch(' },
    { t: '+', c: '    (err) => { throw new PortError(err) }' },
    { t: '+', c: '  );' },
    { t: ' ', c: '  await registry.register(port);' },
    { t: ' ', c: '  return { ...port, tunnel: null };' },
    { t: ' ', c: '}' },
    { t: ' ', c: '' },
    { t: ' ', c: 'async function checkCollision(' },
    { t: ' ', c: '  port: number' },
    { t: '-', c: ') {' },
    { t: '+', c: '): Promise<boolean> {' },
    { t: '+', c: '  const existing = await registry.get(port);' },
    { t: '+', c: '  if (existing) throw new CollisionError(port);' },
    { t: ' ', c: '  return false;' },
    { t: ' ', c: '}' },
  ];

  diffLines.forEach((line, i) => {
    ch.push(DiffLine(0, 128 + i * 20, 375, line.t, line.c));
  });

  // AI annotation bubble (L.47)
  ch.push(F(14, 512, 347, 58, P.indigo + '18', {
    r: 8, stroke: P.indigo + '44',
    ch: [
      T('AI · L.47', 14, 10, 100, 12, { size: 9, fill: P.indigo, weight: 700, font: 'monospace' }),
      T('Added error boundary for async allocate(). Prevents silent rejection in high-concurrency scenarios.',
        14, 26, 318, 30, { size: 10, fill: P.fg2, lh: 1.5 }),
    ],
  }));

  // AI annotation bubble (L.89)
  ch.push(F(14, 578, 347, 58, P.amber + '18', {
    r: 8, stroke: P.amber + '44',
    ch: [
      T('AI · L.89', 14, 10, 100, 12, { size: 9, fill: P.amber, weight: 700, font: 'monospace' }),
      T('Port collision check now throws CollisionError instead of silently returning false. Breaking change — requires caller update.',
        14, 26, 318, 30, { size: 10, fill: P.fg2, lh: 1.5 }),
    ],
  }));

  // Summary bar
  ch.push(F(0, 644, 375, 60, P.surface, {
    stroke: P.border,
    ch: [
      T('2 suggestions applied', 14, 14, 220, 16, { size: 12, fill: P.fg, weight: 700 }),
      T('Confidence: HIGH', 14, 34, 160, 14, { size: 10, fill: P.cyan }),
      F(220, 10, 141, 40, P.indigo, {
        r: 8,
        ch: [T('Merge Suggestion', 0, 11, 141, 18, { size: 11, fill: P.fg, weight: 700, align: 'center' })],
      }),
    ],
  }));

  ch.push(TabBar(748, 2));

  return { id: uid(), type: 'frame', name: 'S4-DiffView', x: 0, y: 0, width: W, height: H, fill: P.bg, clip: false, children: ch };
}

// ── SCREEN 5: Control Center ──────────────────────────────────────────────────
function buildScreen5() {
  const W = 375, H = 812;
  const ch = [];

  ch.push(NavBar(44));

  ch.push(T('Control', 18, 112, 200, 28, { size: 22, fill: P.fg, weight: 800, ls: -0.3 }));
  ch.push(T('Agent configuration & API health', 18, 142, 280, 14, { size: 11, fill: P.dim }));

  // ── Parallel Slots Picker (Superset-inspired) ──────────────────────────────
  ch.push(T('PARALLEL SLOTS', 18, 172, 200, 12, { size: 9, fill: P.muted, weight: 700, ls: 1.5 }));
  ch.push(F(14, 188, 347, 60, P.surface, {
    r: 10, stroke: P.border,
    ch: [
      T('Active slots', 14, 12, 180, 16, { size: 12, fill: P.fg, weight: 600 }),
      T('Max concurrent agents', 14, 30, 200, 14, { size: 10, fill: P.dim }),
      // Slot buttons 1-8
      ...[1,2,3,4,5,6,7,8].map((n, i) => F(180 + i * 22, 10, 18, 18, n === 3 ? P.indigo : P.surface2, {
        r: 4, stroke: n === 3 ? P.indigo : P.border,
        ch: [T(String(n), 0, 2, 18, 14, { size: 9, fill: n === 3 ? P.fg : P.dim, weight: n === 3 ? 700 : 400, align: 'center' })],
      })),
    ],
  }));

  // ── Model roster ──────────────────────────────────────────────────────────
  ch.push(T('MODELS', 18, 264, 200, 12, { size: 9, fill: P.muted, weight: 700, ls: 1.5 }));

  const models = [
    { name: 'claude-3.7-sonnet',  badge: 'PRIMARY',  health: 99.8, color: P.indigo },
    { name: 'gemini-2.0-flash',   badge: 'SECONDARY', health: 98.1, color: P.violet },
    { name: 'gpt-4o-mini',        badge: 'FALLBACK',  health: 97.4, color: P.amber  },
  ];

  models.forEach((m, i) => {
    const my = 280 + i * 64;
    ch.push(F(14, my, 347, 56, P.surface, {
      r: 8, stroke: i === 0 ? P.indigo + '44' : P.border,
      ch: [
        E(14, 18, 8, 8, m.color),
        T(m.name,  28, 10, 200, 16, { size: 12, fill: P.fg,  weight: 600, font: 'monospace' }),
        T(`${m.health}% uptime`, 28, 30, 140, 14, { size: 10, fill: P.dim }),
        StatusPill(270, 10, m.badge, m.color),
        // Mini health bar
        F(28, 44, 200, 3, P.border, { r: 2 }),
        F(28, 44, Math.round(200 * m.health / 100), 3, m.color, { r: 2 }),
      ],
    }));
  });

  // ── API Keys row ──────────────────────────────────────────────────────────
  ch.push(T('API CONNECTIONS', 18, 478, 200, 12, { size: 9, fill: P.muted, weight: 700, ls: 1.5 }));
  ch.push(F(14, 494, 347, 48, P.surface, {
    r: 8, stroke: P.border,
    ch: [
      E(14, 16, 10, 10, P.cyan),
      T('GitHub · Connected', 30, 12, 200, 16, { size: 12, fill: P.fg, weight: 600 }),
      T('●●●● ●●●● ab4f', 30, 30, 180, 12, { size: 9, fill: P.dim, font: 'monospace' }),
      T('ACTIVE', 290, 16, 50, 14, { size: 9, fill: P.cyan, weight: 700, align: 'right' }),
    ],
  }));
  ch.push(F(14, 548, 347, 48, P.surface, {
    r: 8, stroke: P.border,
    ch: [
      E(14, 16, 10, 10, P.indigo),
      T('Anthropic · Connected', 30, 12, 200, 16, { size: 12, fill: P.fg, weight: 600 }),
      T('sk-ant-●●●● ●●●● 7c2d', 30, 30, 200, 12, { size: 9, fill: P.dim, font: 'monospace' }),
      T('ACTIVE', 290, 16, 50, 14, { size: 9, fill: P.cyan, weight: 700, align: 'right' }),
    ],
  }));

  // ── Danger zone ──────────────────────────────────────────────────────────
  ch.push(F(14, 612, 347, 44, 'transparent', {
    r: 8, stroke: P.red + '44',
    ch: [
      T('Stop All Agents', 0, 13, 347, 18, { size: 13, fill: P.red, weight: 600, align: 'center' }),
    ],
  }));

  ch.push(T('v0.7.2 · Build 2026.03.19 · ram.zenbin.org', 0, 668, 375, 14,
    { size: 9, fill: P.muted, align: 'center' }));

  ch.push(TabBar(748, 3));

  return { id: uid(), type: 'frame', name: 'S5-Control', x: 0, y: 0, width: W, height: H, fill: P.bg, clip: false, children: ch };
}

// ── Assemble & write ──────────────────────────────────────────────────────────
const doc = {
  version: '2.8',
  width: 375,
  height: 812,
  children: [
    buildScreen1(),
    buildScreen2(),
    buildScreen3(),
    buildScreen4(),
    buildScreen5(),
  ],
};

const outPath = path.join(__dirname, 'orbiter-app.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
const stat = fs.statSync(outPath);
console.log(`✓ orbiter-app.pen written — ${(stat.size / 1024).toFixed(1)} KB, ${doc.children.length} screens`);
doc.children.forEach((s, i) => {
  console.log(`  Screen ${i + 1}: ${s.name} — ${s.children.length} nodes`);
});
