'use strict';
// swarm-app.js
// SWARM — Parallel AI Agent Orchestration Dashboard
//
// Inspired by:
//   1. Superset.sh (darkmodedesign.com) — near-black terminal aesthetic,
//      swarm orchestration UI, parallel agent branches, monospace output streams
//   2. "Fluid Glass" by Exo Ape (Awwwards HM) — glass morphism panels,
//      frosted card surfaces with translucent depth
//   3. AuthKit (godly.website #991) — deep space `#05060F` background,
//      "Untitled Sans" refined typography in extreme darkness
//
// Challenge: Design a dark-mode AI agent orchestration dashboard for a
// developer tool called SWARM — blending Superset's terminal/swarm grid
// with Fluid Glass's glass card morphism. Near-black deep-space backgrounds,
// cyan/indigo accents, monospace agent streams, and a bento-grid swarm view.
//
// Screens (5 total):
//   1. Dashboard — swarm overview, bento grid, live agent status
//   2. Active Workspace — agent streams, parallel branch visualization
//   3. New Workspace — creation modal, model picker
//   4. Agent Detail — single agent deep-dive, task history, perf metrics
//   5. Settings — integrations, API keys, preferences

const fs   = require('fs');
const path = require('path');
const https = require('https');

// ── Config ─────────────────────────────────────────────────────────────────────
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN || '';
const GITHUB_REPO  = config.GITHUB_REPO  || '';
const SLUG         = 'swarm-agent-dashboard';

const PROMPT = `Design a dark-mode AI agent orchestration dashboard for a parallel coding tool called SWARM — inspired by Superset.sh's terminal/swarm aesthetic (darkmodedesign.com) and Fluid Glass's glass morphism effects (Awwwards HM by Exo Ape). Features near-black deep-space backgrounds with translucent glass card panels, monospace typography for terminal output, real-time agent swarm bento grid, and frosted glass navigation. 5 screens: Dashboard overview, Active Workspace with agent streams, New Workspace creation, Agent Detail analytics, and Settings.`;

// ── Deep-Space Palette ─────────────────────────────────────────────────────────
// Primary inspiration: AuthKit bg #05060F + Superset near-black + Fluid Glass
const P = {
  // Backgrounds — deep space navy-black
  bg:       '#060810',   // deepest background (AuthKit-inspired space)
  surface:  '#0C0E18',   // elevated surface
  surface2: '#131627',   // card surface
  glass:    '#161929',   // glass morphism card bg (with implied blur)
  glassHi:  '#1C2035',   // glass highlight surface

  // Borders — translucent white edges (Fluid Glass aesthetic)
  border:   '#1E2238',   // subtle border
  border2:  '#2A2F50',   // stronger border
  glassBdr: '#2D3158',   // glass card border (luminous edge)

  // Text
  fg:       '#EDF0FB',   // primary text (near-white with blue cast)
  fg2:      '#7B84A8',   // secondary text
  fg3:      '#454C6B',   // muted / disabled text
  code:     '#B8C5FF',   // code/monospace text (indigo tint)

  // Agent accent — electric indigo (AI brain color)
  agent:    '#7C8FFF',   // primary agent indigo
  agentLt:  '#A8B4FF',   // light agent
  agentDim: '#1A1E42',   // dim agent bg

  // Status colors
  green:    '#22D07A',   // active / success
  greenDim: '#0D2B1E',   // active bg
  amber:    '#F5A623',   // pending / warning
  amberDim: '#2E1F06',   // pending bg
  red:      '#FF5252',   // error / failed
  redDim:   '#2D0D0D',   // error bg
  cyan:     '#00E5CC',   // terminal output / streams (Superset terminal teal)
  cyanDim:  '#002E29',   // terminal bg

  // Grid / dividers
  line:     '#111426',   // line divider
  glow:     '#7C8FFF',   // glow accent
};

let _id = 0;
const uid = () => `sw${++_id}`;

// ── Primitives ────────────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill || P.bg,
  clip: opts.clip !== undefined ? opts.clip : false,
  ...(opts.r !== undefined   ? { cornerRadius: opts.r }   : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.ch || [],
});

const T = (content, x, y, w, h, opts = {}) => ({
  id: uid(), type: 'text', content, x, y, width: w, height: h,
  textGrowth: 'fixed-width-height',
  fontSize:   opts.size   || 12,
  fontWeight: String(opts.weight || 400),
  fill:       opts.fill   || P.fg,
  textAlign:  opts.align  || 'left',
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls }   : {}),
  ...(opts.lh !== undefined ? { lineHeight: opts.lh }       : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  ...(opts.font ? { fontFamily: opts.font } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
});

const HR = (x, y, w, fill = P.border) => F(x, y, w, 1, fill);
const VR = (x, y, h, fill = P.border) => F(x, y, 1, h, fill);

// ── Glass Card (Fluid Glass-inspired) ─────────────────────────────────────────
// Simulates frosted glass with layered border + dark bg
const GlassCard = (x, y, w, h, opts = {}) => F(x, y, w, h, P.glass, {
  r: opts.r !== undefined ? opts.r : 10,
  stroke: P.glassBdr,
  sw: 1,
  ...opts,
});

// ── Badge ────────────────────────────────────────────────────────────────────
const Badge = (x, y, label, fg, bg, opts = {}) => {
  const px = opts.px !== undefined ? opts.px : 10;
  const w  = label.length * 6.5 + px * 2;
  return F(x, y, w, 20, bg, {
    r: opts.r !== undefined ? opts.r : 10,
    ch: [T(label, px, 3, w - px * 2, 14, { size: 9, fill: fg, weight: 700, ls: 0.7 })],
    ...(opts.stroke ? { stroke: opts.stroke, sw: 1 } : {}),
  });
};

// ── Status Dot ───────────────────────────────────────────────────────────────
const Dot = (x, y, color, r = 5) => E(x, y, r, r, color);

// ── Monospace Code Line ───────────────────────────────────────────────────────
const CodeLine = (x, y, w, text, colorOverride) => T(text, x, y, w, 14, {
  size: 10,
  fill: colorOverride || P.cyan,
  font: 'monospace',
  lh: 1.6,
});

// ── Nav Sidebar Item ──────────────────────────────────────────────────────────
const NavItem = (x, y, w, icon, label, active) => {
  const bg = active ? P.agentDim : 'transparent';
  const fg = active ? P.agentLt  : P.fg2;
  return F(x, y, w, 32, bg, {
    r: 6,
    ch: [
      T(icon,  12, 8,  16, 16, { size: 12, fill: fg }),
      T(label, 34, 9, w - 46, 14, { size: 11, fill: fg, weight: active ? 600 : 400 }),
      ...(active ? [F(w - 6, 11, 3, 10, P.agent, { r: 2 })] : []),
    ],
  });
};

// ── Agent Status Row (for swarm grid) ─────────────────────────────────────────
const AgentRow = (x, y, w, id, task, status, pct, model) => {
  const statusColor = status === 'active' ? P.green : status === 'pending' ? P.amber : P.red;
  const statusLabel = status === 'active' ? 'RUNNING' : status === 'pending' ? 'QUEUED' : 'FAILED';
  const pctBarW = Math.round((w - 120) * (pct / 100));
  return F(x, y, w, 52, P.surface, {
    r: 8,
    stroke: P.border,
    sw: 1,
    ch: [
      Dot(14, 23, statusColor),
      T(id,    28, 8,  80, 14, { size: 10, fill: P.agent, weight: 600, font: 'monospace' }),
      T(task,  28, 24, w - 200, 14, { size: 10, fill: P.fg2 }),
      T(model, w - 165, 8, 100, 14, { size: 9, fill: P.fg3 }),
      Badge(w - 80, 9, statusLabel, statusColor, `${statusColor}22`, { r: 4 }),
      // Progress bar track
      F(28, 40, w - 100, 4, P.border2, { r: 2 }),
      // Progress bar fill
      F(28, 40, Math.max(pctBarW, 4), 4, statusColor, { r: 2, opacity: 0.8 }),
      T(`${pct}%`, w - 60, 38, 40, 12, { size: 9, fill: P.fg3, align: 'right' }),
    ],
  });
};

// ── Metric Bento Card ─────────────────────────────────────────────────────────
const MetricCard = (x, y, w, h, label, value, sub, accentColor) => GlassCard(x, y, w, h, {
  ch: [
    T(label, 16, 14, w - 32, 12, { size: 9, fill: P.fg3, weight: 600, ls: 0.8 }),
    T(value, 16, 32, w - 32, 32, { size: 26, fill: accentColor || P.fg, weight: 700 }),
    T(sub,   16, 68, w - 32, 14, { size: 10, fill: P.fg2 }),
    // small glow dot
    E(w - 20, 16, 8, 8, accentColor || P.agent, { opacity: 0.4 }),
  ],
});

// ── Sparkline (simplified bar graph) ─────────────────────────────────────────
const Sparkline = (x, y, w, h, values, color) => {
  const bars = [];
  const bw   = Math.floor((w - (values.length - 1) * 2) / values.length);
  const max  = Math.max(...values);
  values.forEach((v, i) => {
    const bh = Math.round((v / max) * h);
    bars.push(F(x + i * (bw + 2), y + h - bh, bw, bh, color, { r: 1, opacity: 0.7 + (v / max) * 0.3 }));
  });
  return bars;
};

// ── Terminal Output Block ─────────────────────────────────────────────────────
const TerminalBlock = (x, y, w, h, lines) => F(x, y, w, h, '#050710', {
  r: 8,
  stroke: P.cyanDim,
  sw: 1,
  ch: [
    // Terminal titlebar
    F(0, 0, w, 24, '#0A0C1A', { r: 8, ch: [
      E(12, 8, 8, 8, P.red),
      E(26, 8, 8, 8, P.amber),
      E(40, 8, 8, 8, P.green),
      T('bash — swarm-agent-07', 56, 6, w - 68, 12, { size: 9, fill: P.fg3, font: 'monospace' }),
    ]}),
    // Line content
    ...lines.map((l, i) => CodeLine(12, 30 + i * 16, w - 24, l, l.startsWith('$') ? P.fg2 : l.startsWith('✓') ? P.green : l.startsWith('✗') ? P.red : P.cyan)),
  ],
});

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 1 — Dashboard Overview
// The bento-grid swarm view with sidebar nav
// ─────────────────────────────────────────────────────────────────────────────
function buildScreen1() {
  const W = 1280, H = 820;
  const SIDEBAR_W = 220;
  const CONTENT_X = SIDEBAR_W + 1;
  const CONTENT_W = W - SIDEBAR_W - 1;

  // ── Sidebar ───────────────────────────────────────────────────────────────
  const sidebar = F(0, 0, SIDEBAR_W, H, P.surface, {
    ch: [
      // Logo
      F(16, 16, 140, 36, 'transparent', { ch: [
        F(0, 4, 28, 28, P.agent, { r: 6, ch: [
          T('⬡', 6, 4, 16, 20, { size: 14, fill: '#fff', align: 'center' }),
        ]}),
        T('SWARM', 36, 8, 80, 18, { size: 15, fill: P.fg, weight: 700, ls: 1.5 }),
        T('v2.1', 36, 26, 40, 10, { size: 8, fill: P.fg3, ls: 0.5 }),
      ]}),
      HR(16, 60, SIDEBAR_W - 32),

      // Nav items
      T('WORKSPACE', 16, 74, SIDEBAR_W - 32, 12, { size: 8, fill: P.fg3, weight: 700, ls: 1.2 }),
      NavItem(10, 90,  SIDEBAR_W - 20, '⊞', 'Dashboard',     true),
      NavItem(10, 126, SIDEBAR_W - 20, '⟳', 'Active Agents',  false),
      NavItem(10, 162, SIDEBAR_W - 20, '◫', 'Workspaces',     false),
      NavItem(10, 198, SIDEBAR_W - 20, '▤',  'Task History',   false),

      HR(16, 236, SIDEBAR_W - 32),
      T('MODELS', 16, 250, SIDEBAR_W - 32, 12, { size: 8, fill: P.fg3, weight: 700, ls: 1.2 }),
      NavItem(10, 266, SIDEBAR_W - 20, '◉', 'Claude Sonnet',  false),
      NavItem(10, 302, SIDEBAR_W - 20, '◎', 'GPT-4o',         false),
      NavItem(10, 338, SIDEBAR_W - 20, '○', 'Gemini 2.0',     false),

      HR(16, 376, SIDEBAR_W - 32),
      T('TEAM', 16, 390, SIDEBAR_W - 32, 12, { size: 8, fill: P.fg3, weight: 700, ls: 1.2 }),

      // Team member avatars
      ...['RK', 'AM', 'JT', 'SL'].map((init, i) =>
        F(16 + i * 44, 408, 36, 36, [P.agentDim, '#1A2E1A', '#2A1E10', '#2A0A0A'][i], {
          r: 18,
          ch: [T(init, 6, 10, 24, 16, { size: 11, fill: [P.agentLt, P.green, P.amber, P.red][i], weight: 700, align: 'center' })],
        })
      ),

      // Bottom user block
      HR(0, H - 64, SIDEBAR_W),
      F(10, H - 54, SIDEBAR_W - 20, 44, 'transparent', { ch: [
        E(0, 7, 30, 30, P.agentDim, {
          stroke: P.agent, sw: 1,
          ch: [T('RA', 5, 8, 20, 14, { size: 10, fill: P.agentLt, weight: 700, align: 'center' })],
        }),
        T('Rakis Admin', 36, 8, 120, 14, { size: 11, fill: P.fg, weight: 600 }),
        T('Pro Plan · 8 agents', 36, 24, 120, 12, { size: 9, fill: P.fg3 }),
        T('⚙', SIDEBAR_W - 44, 12, 18, 20, { size: 14, fill: P.fg3 }),
      ]}),
    ],
  });

  // ── Top bar ───────────────────────────────────────────────────────────────
  const topbar = F(CONTENT_X, 0, CONTENT_W, 56, P.bg, {
    ch: [
      T('Agent Dashboard', 24, 16, 200, 22, { size: 16, fill: P.fg, weight: 600 }),
      T('8 agents active · 3 workspaces running', 24, 36, 260, 14, { size: 10, fill: P.fg3 }),

      // Status indicator
      Dot(CONTENT_W - 210, 24, P.green),
      T('All systems operational', CONTENT_W - 198, 20, 140, 14, { size: 10, fill: P.green }),

      // New workspace button
      F(CONTENT_W - 50, 12, 32, 32, P.agent, {
        r: 8,
        ch: [T('+', 8, 5, 16, 22, { size: 18, fill: '#fff', weight: 300, align: 'center' })],
      }),
    ],
  });
  const topBorder = HR(CONTENT_X, 56, CONTENT_W, P.border);

  // ── Metric bento row ─────────────────────────────────────────────────────
  const metrics = [
    MetricCard(CONTENT_X + 20, 76, 200, 92, 'ACTIVE AGENTS', '8',  '↑2 from yesterday',   P.agent),
    MetricCard(CONTENT_X + 236, 76, 200, 92, 'TASKS / HOUR',  '142', '↑18% this session', P.green),
    MetricCard(CONTENT_X + 452, 76, 200, 92, 'TOKENS USED',   '2.4M', 'of 10M limit',     P.amber),
    MetricCard(CONTENT_X + 668, 76, 200, 92, 'SUCCESS RATE',  '98.6%', '↑0.4% this week', P.cyan),
    // Wide sparkline card
    F(CONTENT_X + 884, 76, CONTENT_W - 904, 92, P.glass, {
      r: 10, stroke: P.glassBdr, sw: 1,
      ch: [
        T('TASK THROUGHPUT', 16, 14, 180, 12, { size: 9, fill: P.fg3, weight: 600, ls: 0.8 }),
        ...Sparkline(16, 30, CONTENT_W - 940, 48, [22, 35, 28, 45, 38, 60, 52, 71, 65, 80, 88, 142], P.agent),
        T('last 12 hrs', 16, 78, 100, 10, { size: 8, fill: P.fg3 }),
      ],
    }),
  ].flat();

  // ── Active Agents Grid ────────────────────────────────────────────────────
  const agentLabel = F(CONTENT_X + 20, 186, 200, 20, 'transparent', {
    ch: [T('ACTIVE AGENTS', 0, 4, 200, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.2 })],
  });

  const agents = [
    AgentRow(CONTENT_X + 20, 212, CONTENT_W - 40, 'agent-01', 'Refactor auth middleware → JWT RS256',   'active',  78, 'claude-3-7'),
    AgentRow(CONTENT_X + 20, 272, CONTENT_W - 40, 'agent-02', 'Write unit tests for payment service',   'active',  45, 'claude-3-7'),
    AgentRow(CONTENT_X + 20, 332, CONTENT_W - 40, 'agent-03', 'Fix TypeScript errors in dashboard UI',  'active',  92, 'gpt-4o'),
    AgentRow(CONTENT_X + 20, 392, CONTENT_W - 40, 'agent-04', 'Generate API documentation from schema', 'pending', 0,  'gemini-2'),
    AgentRow(CONTENT_X + 20, 452, CONTENT_W - 40, 'agent-05', 'Migrate database migrations to Drizzle', 'active',  31, 'claude-3-7'),
    AgentRow(CONTENT_X + 20, 512, CONTENT_W - 40, 'agent-06', 'Review PR #847 — security audit',        'active',  60, 'claude-3-7'),
    AgentRow(CONTENT_X + 20, 572, CONTENT_W - 40, 'agent-07', 'Optimize React re-renders in ListView',  'active',  15, 'gpt-4o'),
    AgentRow(CONTENT_X + 20, 632, CONTENT_W - 40, 'agent-08', 'Seed production database fixtures',      'failed',  0,  'gemini-2'),
  ];

  // ── Recent Activity ───────────────────────────────────────────────────────
  const recentLabel = F(CONTENT_X + 20, 700, 200, 20, 'transparent', {
    ch: [T('RECENT ACTIVITY', 0, 4, 200, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.2 })],
  });
  const activity = [
    [P.green,  '✓ agent-03 completed TypeScript fix — 23 errors resolved — 4m ago'],
    [P.red,    '✗ agent-08 failed: Database connection timeout — 12m ago'],
    [P.agent,  '⟳ New workspace "api-migration" spawned — 3 agents — 18m ago'],
  ].map(([ color, text ], i) => F(CONTENT_X + 20, 726 + i * 28, CONTENT_W - 40, 22, 'transparent', {
    ch: [
      Dot(0, 8, color, 4),
      T(text, 14, 4, CONTENT_W - 60, 14, { size: 10, fill: i === 0 ? P.fg : P.fg2 }),
    ],
  }));

  // Vertical sidebar divider
  const divider = VR(SIDEBAR_W, 0, H);

  return {
    id: uid(), name: 'S1 – Dashboard', type: 'frame',
    x: 0, y: 0, width: W, height: H,
    fill: P.bg, clip: true,
    children: [
      sidebar, divider, topbar, topBorder,
      ...metrics, agentLabel, ...agents,
      recentLabel, ...activity,
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 2 — Active Workspace (Agent Streams)
// ─────────────────────────────────────────────────────────────────────────────
function buildScreen2() {
  const W = 1280, H = 820;
  const SIDEBAR_W = 220;
  const CONTENT_X = SIDEBAR_W + 1;
  const CONTENT_W = W - SIDEBAR_W - 1;

  // Sidebar (same as S1 but Workspaces active)
  const sidebar = F(0, 0, SIDEBAR_W, H, P.surface, {
    ch: [
      F(16, 16, 140, 36, 'transparent', { ch: [
        F(0, 4, 28, 28, P.agent, { r: 6, ch: [
          T('⬡', 6, 4, 16, 20, { size: 14, fill: '#fff', align: 'center' }),
        ]}),
        T('SWARM', 36, 8, 80, 18, { size: 15, fill: P.fg, weight: 700, ls: 1.5 }),
        T('v2.1', 36, 26, 40, 10, { size: 8, fill: P.fg3, ls: 0.5 }),
      ]}),
      HR(16, 60, SIDEBAR_W - 32),

      T('WORKSPACE', 16, 74, SIDEBAR_W - 32, 12, { size: 8, fill: P.fg3, weight: 700, ls: 1.2 }),
      NavItem(10, 90,  SIDEBAR_W - 20, '⊞', 'Dashboard',     false),
      NavItem(10, 126, SIDEBAR_W - 20, '⟳', 'Active Agents',  false),
      NavItem(10, 162, SIDEBAR_W - 20, '◫', 'Workspaces',     true),
      NavItem(10, 198, SIDEBAR_W - 20, '▤',  'Task History',   false),

      HR(16, 236, SIDEBAR_W - 32),

      // Workspace list in sidebar
      T('OPEN', 16, 250, SIDEBAR_W - 32, 12, { size: 8, fill: P.fg3, weight: 700, ls: 1.2 }),
      ...[
        ['api-migration', 3, P.green],
        ['ui-redesign',   2, P.amber],
        ['test-coverage', 3, P.agent],
      ].map(([name, count, color], i) => F(10, 266 + i * 40, SIDEBAR_W - 20, 34, i === 2 ? P.agentDim : 'transparent', {
        r: 6,
        ch: [
          Dot(12, 14, color, 4),
          T(name, 24, 9, SIDEBAR_W - 64, 14, { size: 10, fill: i === 2 ? P.agentLt : P.fg2 }),
          T(`${count}`, SIDEBAR_W - 40, 9, 20, 14, { size: 10, fill: color, weight: 600, align: 'center' }),
        ],
      })),

      HR(0, H - 64, SIDEBAR_W),
      F(10, H - 54, SIDEBAR_W - 20, 44, 'transparent', { ch: [
        E(0, 7, 30, 30, P.agentDim, {
          stroke: P.agent, sw: 1,
          ch: [T('RA', 5, 8, 20, 14, { size: 10, fill: P.agentLt, weight: 700, align: 'center' })],
        }),
        T('Rakis Admin', 36, 8, 120, 14, { size: 11, fill: P.fg, weight: 600 }),
        T('Pro Plan · 8 agents', 36, 24, 120, 12, { size: 9, fill: P.fg3 }),
      ]}),
    ],
  });
  const divider = VR(SIDEBAR_W, 0, H);

  // ── Workspace header ──────────────────────────────────────────────────────
  const wsHeader = F(CONTENT_X, 0, CONTENT_W, 60, P.bg, {
    ch: [
      F(16, 12, 36, 36, P.agentDim, { r: 8, ch: [
        T('◫', 8, 7, 20, 22, { size: 14, fill: P.agentLt, align: 'center' }),
      ]}),
      T('test-coverage', 60, 12, 220, 20, { size: 16, fill: P.fg, weight: 600 }),
      Badge(60, 34, '3 AGENTS RUNNING', P.green, P.greenDim, { r: 4 }),
      Badge(192, 34, 'CLAUDE-3-7', P.agent, P.agentDim, { r: 4 }),
      // Actions
      F(CONTENT_W - 216, 16, 80, 28, P.surface2, { r: 6, stroke: P.border2, sw: 1, ch: [
        T('⏸ Pause',  8, 7, 64, 14, { size: 11, fill: P.fg2 }),
      ]}),
      F(CONTENT_W - 124, 16, 80, 28, P.surface2, { r: 6, stroke: P.border2, sw: 1, ch: [
        T('✚ Agent', 8, 7, 64, 14, { size: 11, fill: P.fg2 }),
      ]}),
      F(CONTENT_W - 32, 16, 28, 28, P.surface2, { r: 6, stroke: P.border2, sw: 1, ch: [
        T('···', 4, 6, 20, 16, { size: 12, fill: P.fg2 }),
      ]}),
    ],
  });
  const wsLine = HR(CONTENT_X, 60, CONTENT_W, P.border);

  // ── Branch visualization ───────────────────────────────────────────────────
  const branchH = 80;
  const branchPanel = GlassCard(CONTENT_X + 16, 76, CONTENT_W - 32, branchH, {
    ch: [
      T('BRANCH GRAPH', 14, 10, 140, 12, { size: 8, fill: P.fg3, weight: 700, ls: 1.1 }),
      // Main branch line
      F(14, 42, CONTENT_W - 64, 2, P.border2),
      // Branch nodes
      ...[0, 0.22, 0.44, 0.66, 0.88].map((pct, i) => {
        const cx = 14 + Math.round((CONTENT_W - 64) * pct);
        const label = ['init', 'scaffold', 'implement', 'test-run', 'report'][i];
        const done  = i < 3;
        const color = done ? P.green : i === 3 ? P.amber : P.border2;
        return [
          E(cx - 6, 36, 12, 12, done ? P.greenDim : P.surface2, { stroke: color, sw: 2 }),
          T(label, cx - 24, 52, 48, 12, { size: 8, fill: done ? P.fg2 : P.fg3, align: 'center' }),
        ];
      }).flat(),
      // Active arrow
      T('►', 14 + Math.round((CONTENT_W - 64) * 0.66) - 6, 36, 12, 12, { size: 10, fill: P.amber }),
    ],
  });

  // ── 3-column agent stream layout ──────────────────────────────────────────
  const COL_W = Math.floor((CONTENT_W - 48) / 3);
  const agentStreams = [
    {
      id: 'agent-05', task: 'Migrate to Drizzle',
      status: 'active', pct: 31,
      lines: [
        '$ drizzle-kit generate --dialect pg',
        '◌ Analyzing schema diff...',
        '✓ Found 12 tables to migrate',
        '◌ Generating migration files...',
        '  → user_sessions.sql',
        '  → api_tokens.sql',
        '✗ Conflict: users.email constraint',
      ],
    },
    {
      id: 'agent-06', task: 'Security Audit PR #847',
      status: 'active', pct: 60,
      lines: [
        '$ claude review --security pr/847',
        '✓ Loaded 23 modified files',
        '✓ No SQL injection vectors',
        '✓ XSS: inputs sanitized (14 pts)',
        '◌ Checking auth boundaries...',
        '⚠ JWT expiry not enforced in',
        '  middleware/auth.ts:L144',
      ],
    },
    {
      id: 'agent-07', task: 'Optimize React renders',
      status: 'active', pct: 15,
      lines: [
        '$ swarm profile --component ListView',
        '◌ Profiling render tree...',
        '  › ListView: 847ms avg render',
        '  › 312 unnecessary re-renders',
        '◌ Applying useMemo patches...',
        '  → components/ListView.tsx',
        '  → hooks/useFilters.ts',
      ],
    },
  ];

  const streamCols = agentStreams.map((ag, i) => {
    const cx = CONTENT_X + 16 + i * (COL_W + 8);
    const statusColor = P.green;
    return F(cx, 168, COL_W, H - 184, P.bg, {
      clip: true, r: 0,
      ch: [
        // Agent header card
        GlassCard(0, 0, COL_W, 60, { r: 8, ch: [
          Dot(14, 27, statusColor, 5),
          T(ag.id, 26, 12, 100, 14, { size: 11, fill: P.agent, weight: 700, font: 'monospace' }),
          T(ag.task, 26, 28, COL_W - 100, 14, { size: 9, fill: P.fg2 }),
          Badge(COL_W - 64, 12, `${ag.pct}%`, statusColor, P.greenDim, { r: 4 }),
          // mini progress bar
          F(14, 50, COL_W - 28, 4, P.border, { r: 2 }),
          F(14, 50, Math.max(Math.round((COL_W - 28) * ag.pct / 100), 4), 4, statusColor, { r: 2, opacity: 0.9 }),
        ]}),
        // Terminal stream
        TerminalBlock(0, 68, COL_W, H - 240, ag.lines),
        // Input area
        F(0, H - 160, COL_W, 48, P.surface, { r: 8, stroke: P.border, sw: 1, ch: [
          T('Send instruction...', 12, 17, COL_W - 60, 14, { size: 10, fill: P.fg3 }),
          F(COL_W - 44, 12, 32, 24, P.agentDim, { r: 6, stroke: P.glassBdr, sw: 1, ch: [
            T('↵', 8, 3, 16, 18, { size: 12, fill: P.agentLt, align: 'center' }),
          ]}),
        ]}),
      ],
    });
  });

  // col dividers
  const colDivs = [1, 2].map(i => VR(CONTENT_X + 16 + i * (COL_W + 8) - 4, 168, H - 184, P.border));

  return {
    id: uid(), name: 'S2 – Active Workspace', type: 'frame',
    x: 1300, y: 0, width: W, height: H,
    fill: P.bg, clip: true,
    children: [sidebar, divider, wsHeader, wsLine, branchPanel, ...streamCols, ...colDivs],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 3 — New Workspace Modal
// ─────────────────────────────────────────────────────────────────────────────
function buildScreen3() {
  const W = 1280, H = 820;
  const SIDEBAR_W = 220;

  // Blurred background (dashboard with overlay)
  const bg = F(0, 0, W, H, P.bg);
  const dimOverlay = F(0, 0, W, H, '#000', { opacity: 0.6 });

  // Modal
  const MODAL_W = 580, MODAL_H = 580;
  const MX = Math.round((W - MODAL_W) / 2);
  const MY = Math.round((H - MODAL_H) / 2);

  // Model option cards
  const modelCards = [
    { id: 'claude', name: 'Claude Sonnet 3.7', tag: 'Best Quality', color: P.agent, active: true },
    { id: 'gpt4o',  name: 'GPT-4o',            tag: 'Fastest',     color: P.green,  active: false },
    { id: 'gemini', name: 'Gemini 2.0',         tag: 'Economical',  color: P.amber,  active: false },
  ];
  const MODEL_W = (MODAL_W - 48 - 16) / 3;

  const modal = GlassCard(MX, MY, MODAL_W, MODAL_H, {
    r: 16, stroke: P.glassBdr, sw: 1,
    ch: [
      // Header
      T('New Workspace', 24, 24, MODAL_W - 80, 22, { size: 17, fill: P.fg, weight: 700 }),
      T('Configure a parallel agent swarm for your task', 24, 48, MODAL_W - 48, 14, { size: 11, fill: P.fg2 }),
      // Close
      T('✕', MODAL_W - 36, 22, 20, 20, { size: 14, fill: P.fg3, align: 'center' }),
      HR(0, 72, MODAL_W, P.border),

      // Workspace name
      T('WORKSPACE NAME', 24, 88, 200, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.1 }),
      F(24, 104, MODAL_W - 48, 40, P.surface, { r: 8, stroke: P.border2, sw: 1, ch: [
        T('api-refactor-v2', 14, 13, MODAL_W - 80, 14, { size: 12, fill: P.fg, font: 'monospace' }),
        F(MODAL_W - 82, 10, 20, 20, 'transparent', { ch: [T('✎', 0, 2, 18, 16, { size: 11, fill: P.fg3 })] }),
      ]}),

      // Model selector
      T('AI MODEL', 24, 158, 200, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.1 }),
      ...modelCards.map((m, i) => {
        const cx = 24 + i * (MODEL_W + 8);
        return F(cx, 174, MODEL_W, 76, m.active ? `${m.color}18` : P.surface, {
          r: 8,
          stroke: m.active ? m.color : P.border,
          sw: m.active ? 2 : 1,
          ch: [
            E(14, 16, 20, 20, m.active ? `${m.color}44` : P.border, { stroke: m.color, sw: 1 }),
            T(m.active ? '●' : '○', 18, 20, 12, 12, { size: 9, fill: m.color }),
            T(m.name, 44, 14, MODEL_W - 56, 14, { size: 10, fill: m.active ? P.fg : P.fg2, weight: m.active ? 600 : 400 }),
            Badge(44, 32, m.tag, m.color, `${m.color}22`, { r: 4 }),
            ...(m.active ? [T('✓', MODEL_W - 24, 14, 16, 14, { size: 11, fill: m.color, weight: 700 })] : []),
          ],
        });
      }),

      // Agent count slider
      T('PARALLEL AGENTS', 24, 262, 200, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.1 }),
      F(24, 278, MODAL_W - 48, 40, P.surface, { r: 8, stroke: P.border2, sw: 1, ch: [
        F(14, 18, 240, 4, P.border2, { r: 2 }),
        F(14, 18, 140, 4, P.agent,   { r: 2 }),
        E(154, 14, 12, 12, P.agent, { stroke: '#fff', sw: 2 }),
        T('3 agents', MODAL_W - 120, 13, 60, 14, { size: 12, fill: P.fg, weight: 600, align: 'center' }),
        T('Max: 8', MODAL_W - 64, 13, 42, 14, { size: 10, fill: P.fg3 }),
      ]}),

      // Task description
      T('TASK DESCRIPTION', 24, 330, 200, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.1 }),
      F(24, 346, MODAL_W - 48, 80, P.surface, { r: 8, stroke: P.border2, sw: 1, ch: [
        T('Refactor the authentication module to use JWT RS256 tokens,\nmigrate session storage to Redis, and add refresh token rotation\nwith sliding expiry. Include unit tests for all edge cases.', 14, 12, MODAL_W - 80, 56, { size: 10, fill: P.fg2, lh: 1.6 }),
      ]}),

      HR(0, 440, MODAL_W, P.border),

      // Estimated tokens
      F(24, 452, MODAL_W - 48, 32, 'transparent', { ch: [
        T('Estimated cost', 0, 8, 120, 16, { size: 10, fill: P.fg3 }),
        T('~$0.42 — 280K tokens', 130, 8, 180, 16, { size: 10, fill: P.fg2 }),
        T('Shared context: ON', MODAL_W - 170, 8, 140, 16, { size: 10, fill: P.green, align: 'right' }),
      ]}),

      // Action buttons
      F(24, 498, MODAL_W - 168, 44, P.surface2, { r: 8, stroke: P.border, sw: 1, ch: [
        T('Cancel', 0, 13, MODAL_W - 168, 18, { size: 12, fill: P.fg2, align: 'center' }),
      ]}),
      F(MODAL_W - 136, 498, 112, 44, P.agent, { r: 8, ch: [
        T('⬡ Launch', 16, 13, 80, 18, { size: 12, fill: '#fff', weight: 600 }),
      ]}),
    ],
  });

  return {
    id: uid(), name: 'S3 – New Workspace', type: 'frame',
    x: 2600, y: 0, width: W, height: H,
    fill: P.bg, clip: true,
    children: [bg, dimOverlay, modal],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 4 — Agent Detail / Analytics
// ─────────────────────────────────────────────────────────────────────────────
function buildScreen4() {
  const W = 1280, H = 820;
  const SIDEBAR_W = 220;
  const CONTENT_X = SIDEBAR_W + 1;
  const CONTENT_W = W - SIDEBAR_W - 1;

  const sidebar = F(0, 0, SIDEBAR_W, H, P.surface, {
    ch: [
      F(16, 16, 140, 36, 'transparent', { ch: [
        F(0, 4, 28, 28, P.agent, { r: 6, ch: [
          T('⬡', 6, 4, 16, 20, { size: 14, fill: '#fff', align: 'center' }),
        ]}),
        T('SWARM', 36, 8, 80, 18, { size: 15, fill: P.fg, weight: 700, ls: 1.5 }),
        T('v2.1', 36, 26, 40, 10, { size: 8, fill: P.fg3, ls: 0.5 }),
      ]}),
      HR(16, 60, SIDEBAR_W - 32),
      T('WORKSPACE', 16, 74, SIDEBAR_W - 32, 12, { size: 8, fill: P.fg3, weight: 700, ls: 1.2 }),
      NavItem(10, 90,  SIDEBAR_W - 20, '⊞', 'Dashboard',     false),
      NavItem(10, 126, SIDEBAR_W - 20, '⟳', 'Active Agents',  true),
      NavItem(10, 162, SIDEBAR_W - 20, '◫', 'Workspaces',     false),
      NavItem(10, 198, SIDEBAR_W - 20, '▤',  'Task History',   false),
      HR(0, H - 64, SIDEBAR_W),
      F(10, H - 54, SIDEBAR_W - 20, 44, 'transparent', { ch: [
        E(0, 7, 30, 30, P.agentDim, {
          stroke: P.agent, sw: 1,
          ch: [T('RA', 5, 8, 20, 14, { size: 10, fill: P.agentLt, weight: 700, align: 'center' })],
        }),
        T('Rakis Admin', 36, 8, 120, 14, { size: 11, fill: P.fg, weight: 600 }),
        T('Pro Plan · 8 agents', 36, 24, 120, 12, { size: 9, fill: P.fg3 }),
      ]}),
    ],
  });
  const divider = VR(SIDEBAR_W, 0, H);

  // ── Agent header ──────────────────────────────────────────────────────────
  const agentHeader = GlassCard(CONTENT_X + 16, 16, CONTENT_W - 32, 80, {
    ch: [
      E(18, 22, 36, 36, P.agentDim, { stroke: P.agent, sw: 2 }),
      T('A1', 27, 32, 20, 16, { size: 11, fill: P.agentLt, weight: 700, align: 'center' }),
      T('agent-01', 64, 18, 180, 18, { size: 15, fill: P.fg, weight: 700, font: 'monospace' }),
      T('Refactor auth middleware → JWT RS256', 64, 38, 340, 14, { size: 11, fill: P.fg2 }),
      Badge(64, 56, 'RUNNING', P.green, P.greenDim, { r: 4 }),
      Badge(144, 56, 'CLAUDE-3-7', P.agent, P.agentDim, { r: 4 }),
      Badge(252, 56, 'test-coverage', P.fg3, P.surface2, { r: 4 }),

      // Meta right
      F(CONTENT_W - 300, 20, 280, 50, 'transparent', { ch: [
        T('Started', 0, 4, 80, 12, { size: 9, fill: P.fg3 }),
        T('12m 38s ago', 0, 18, 80, 14, { size: 11, fill: P.fg2 }),
        T('Tokens', 100, 4, 80, 12, { size: 9, fill: P.fg3 }),
        T('184,220', 100, 18, 80, 14, { size: 11, fill: P.fg2 }),
        T('Progress', 192, 4, 80, 12, { size: 9, fill: P.fg3 }),
        T('78%', 192, 18, 60, 16, { size: 14, fill: P.green, weight: 700 }),
      ]}),

      // Progress bar full width at bottom
      F(14, 68, CONTENT_W - 60, 5, P.border, { r: 3 }),
      F(14, 68, Math.round((CONTENT_W - 60) * 0.78), 5, P.green, { r: 3 }),
    ],
  });

  // ── Metrics row ───────────────────────────────────────────────────────────
  const agentMetrics = [
    ['TOOL CALLS', '247', 'this session', P.agent],
    ['AVG LATENCY', '1.4s', 'per response', P.cyan],
    ['FILES CHANGED', '18', 'across 4 dirs', P.green],
    ['ERROR RATE', '2.1%', '5 retries', P.amber],
  ].map(([lbl, val, sub, col], i) =>
    MetricCard(CONTENT_X + 16 + i * 258, 112, 250, 86, lbl, val, sub, col)
  );

  // ── Throughput chart (tall bar chart) ─────────────────────────────────────
  const chartData = [18, 32, 27, 45, 38, 55, 47, 60, 53, 72, 68, 78];
  const chartCard = GlassCard(CONTENT_X + 16, 214, 600, 220, {
    ch: [
      T('THROUGHPUT (tasks/min)', 16, 14, 240, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1 }),
      T('Last 12 checkpoints', 16, 28, 180, 12, { size: 9, fill: P.fg3 }),
      ...Sparkline(16, 48, 560, 140, chartData, P.agent),
      // X labels
      ...chartData.map((_, i) => T(String(i + 1), 16 + i * 48, 196, 36, 12, { size: 8, fill: P.fg3, align: 'center' })),
    ],
  });

  // ── File changes list ─────────────────────────────────────────────────────
  const filesCard = GlassCard(CONTENT_X + 632, 214, CONTENT_W - 648, 220, {
    ch: [
      T('FILES MODIFIED', 16, 14, 200, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1 }),
      ...[
        ['+124 -12', 'middleware/auth.ts',       P.green],
        ['+88  -45', 'lib/jwt.ts',               P.green],
        ['+36  -0',  'types/auth.d.ts',          P.agent],
        ['+22  -8',  'tests/auth.spec.ts',       P.cyan],
        ['+14  -3',  'config/jwt.config.ts',     P.amber],
        ['+8   -22', 'middleware/session.ts',    P.red],
      ].map(([diff, file, col], i) => F(16, 32 + i * 28, CONTENT_W - 680, 24, 'transparent', {
        ch: [
          T(diff, 0, 5, 78, 14, { size: 9, fill: col, font: 'monospace' }),
          T(file, 90, 5, CONTENT_W - 780, 14, { size: 10, fill: P.fg2, font: 'monospace' }),
        ],
      })),
    ],
  });

  // ── Terminal output (recent) ───────────────────────────────────────────────
  const termCard = TerminalBlock(CONTENT_X + 16, 450, CONTENT_W - 32, 220, [
    '$ claude code --task "Refactor auth to JWT RS256"',
    '✓ Loaded workspace context (18 files)',
    '✓ Reading middleware/auth.ts...',
    '◌ Analyzing session management pattern...',
    '✓ Identified: cookie-session v1.4 (legacy)',
    '◌ Rewriting to jsonwebtoken RS256...',
    '  → Generating RS256 key pair...',
    '  → Updating middleware/auth.ts (L1-L124)',
    '✓ Key pair generated: .keys/jwt_rs256.pem',
    '◌ Running type-check: tsc --noEmit...',
    '✓ 0 type errors',
    '◌ Running tests: vitest run auth.spec...',
  ]);

  // ── Action row ────────────────────────────────────────────────────────────
  const actions = F(CONTENT_X + 16, H - 64, CONTENT_W - 32, 48, 'transparent', {
    ch: [
      F(0, 0, 140, 40, P.surface2, { r: 8, stroke: P.border, sw: 1, ch: [
        T('⏸ Pause Agent', 12, 12, 116, 16, { size: 11, fill: P.fg2 }),
      ]}),
      F(152, 0, 140, 40, P.surface2, { r: 8, stroke: P.border, sw: 1, ch: [
        T('✉ Send Message', 12, 12, 116, 16, { size: 11, fill: P.fg2 }),
      ]}),
      F(304, 0, 160, 40, P.redDim, { r: 8, stroke: P.red, sw: 1, ch: [
        T('✕ Terminate Agent', 12, 12, 136, 16, { size: 11, fill: P.red }),
      ]}),
      F(CONTENT_W - 156, 0, 140, 40, P.agentDim, { r: 8, stroke: P.agent, sw: 1, ch: [
        T('✦ Fork Workspace', 12, 12, 116, 16, { size: 11, fill: P.agentLt }),
      ]}),
    ],
  });

  return {
    id: uid(), name: 'S4 – Agent Detail', type: 'frame',
    x: 3900, y: 0, width: W, height: H,
    fill: P.bg, clip: true,
    children: [sidebar, divider, agentHeader, ...agentMetrics, chartCard, filesCard, termCard, actions],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 5 — Settings
// ─────────────────────────────────────────────────────────────────────────────
function buildScreen5() {
  const W = 1280, H = 820;
  const SIDEBAR_W = 220;
  const CONTENT_X = SIDEBAR_W + 1;
  const CONTENT_W = W - SIDEBAR_W - 1;

  const sidebar = F(0, 0, SIDEBAR_W, H, P.surface, {
    ch: [
      F(16, 16, 140, 36, 'transparent', { ch: [
        F(0, 4, 28, 28, P.agent, { r: 6, ch: [
          T('⬡', 6, 4, 16, 20, { size: 14, fill: '#fff', align: 'center' }),
        ]}),
        T('SWARM', 36, 8, 80, 18, { size: 15, fill: P.fg, weight: 700, ls: 1.5 }),
        T('v2.1', 36, 26, 40, 10, { size: 8, fill: P.fg3, ls: 0.5 }),
      ]}),
      HR(16, 60, SIDEBAR_W - 32),
      T('SETTINGS', 16, 74, SIDEBAR_W - 32, 12, { size: 8, fill: P.fg3, weight: 700, ls: 1.2 }),
      NavItem(10, 90,  SIDEBAR_W - 20, '◉', 'Profile',        true),
      NavItem(10, 126, SIDEBAR_W - 20, '⚿', 'API Keys',       false),
      NavItem(10, 162, SIDEBAR_W - 20, '⬡', 'Integrations',   false),
      NavItem(10, 198, SIDEBAR_W - 20, '◎', 'Billing',        false),
      NavItem(10, 234, SIDEBAR_W - 20, '▤',  'Notifications',  false),
      HR(0, H - 64, SIDEBAR_W),
      F(10, H - 54, SIDEBAR_W - 20, 44, 'transparent', { ch: [
        E(0, 7, 30, 30, P.agentDim, {
          stroke: P.agent, sw: 1,
          ch: [T('RA', 5, 8, 20, 14, { size: 10, fill: P.agentLt, weight: 700, align: 'center' })],
        }),
        T('Rakis Admin', 36, 8, 120, 14, { size: 11, fill: P.fg, weight: 600 }),
        T('Pro Plan · 8 agents', 36, 24, 120, 12, { size: 9, fill: P.fg3 }),
      ]}),
    ],
  });
  const divider = VR(SIDEBAR_W, 0, H);

  // ── Main content ──────────────────────────────────────────────────────────
  const header = F(CONTENT_X, 0, CONTENT_W, 60, P.bg, {
    ch: [
      T('Settings', 24, 18, 200, 22, { size: 18, fill: P.fg, weight: 700 }),
      T('Manage your account, API keys, and preferences', 24, 40, 340, 14, { size: 10, fill: P.fg3 }),
    ],
  });
  const headerLine = HR(CONTENT_X, 60, CONTENT_W, P.border);

  // Profile section
  const profileCard = GlassCard(CONTENT_X + 24, 76, CONTENT_W - 48, 140, {
    ch: [
      T('PROFILE', 16, 14, 120, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.1 }),
      E(16, 34, 60, 60, P.agentDim, { stroke: P.agent, sw: 2 }),
      T('RA', 26, 54, 40, 20, { size: 16, fill: P.agentLt, weight: 700, align: 'center' }),
      T('Rakis Admin', 90, 38, 200, 20, { size: 15, fill: P.fg, weight: 600 }),
      T('rakis@example.com', 90, 60, 220, 14, { size: 11, fill: P.fg2 }),
      Badge(90, 80, 'PRO PLAN', P.agent, P.agentDim, { r: 4 }),
      F(CONTENT_W - 120, 34, 96, 36, P.agent, { r: 8, ch: [
        T('Edit Profile', 8, 10, 80, 16, { size: 11, fill: '#fff', align: 'center' }),
      ]}),
      F(CONTENT_W - 120, 80, 96, 30, P.surface2, { r: 8, stroke: P.border, sw: 1, ch: [
        T('Upgrade Plan', 4, 8, 88, 14, { size: 10, fill: P.fg2, align: 'center' }),
      ]}),
    ],
  });

  // API Keys section
  const apiCard = GlassCard(CONTENT_X + 24, 232, CONTENT_W - 48, 200, {
    ch: [
      T('API KEYS', 16, 14, 120, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.1 }),
      ...[
        { name: 'ANTHROPIC_API_KEY', val: 'sk-ant-api03-••••••••••••••••••••••••••••••••••••',  color: P.agent,  active: true  },
        { name: 'OPENAI_API_KEY',    val: 'sk-proj-••••••••••••••••••••••••••••••••••••••••',   color: P.green,  active: true  },
        { name: 'GEMINI_API_KEY',    val: 'AIza••••••••••••••••••••••••••••••••••••••••',        color: P.amber,  active: false },
      ].map((k, i) => F(16, 32 + i * 52, CONTENT_W - 80, 44, P.surface, {
        r: 8, stroke: P.border, sw: 1,
        ch: [
          Dot(14, 20, k.active ? P.green : P.fg3, 4),
          T(k.name, 26, 8, 180, 14, { size: 9, fill: P.fg3, weight: 700, font: 'monospace', ls: 0.5 }),
          T(k.val,  26, 24, CONTENT_W - 200, 14, { size: 10, fill: P.code, font: 'monospace' }),
          F(CONTENT_W - 188, 12, 60, 20, P.surface2, { r: 5, stroke: P.border, sw: 1, ch: [
            T('Rotate', 8, 4, 44, 12, { size: 9, fill: P.fg2 }),
          ]}),
          F(CONTENT_W - 116, 12, 50, 20, k.active ? P.greenDim : P.redDim, { r: 5, stroke: k.active ? P.green : P.red, sw: 1, ch: [
            T(k.active ? 'Active' : 'Inactive', 6, 4, 38, 12, { size: 9, fill: k.active ? P.green : P.red }),
          ]}),
        ],
      })),
      F(16, 176, 130, 14, 'transparent', { ch: [
        T('+ Add API key', 0, 0, 130, 14, { size: 10, fill: P.agent }),
      ]}),
    ],
  });

  // Preferences section
  const prefsCard = GlassCard(CONTENT_X + 24, 448, CONTENT_W - 48, 200, {
    ch: [
      T('PREFERENCES', 16, 14, 200, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.1 }),
      ...[
        ['Default model',          'Claude Sonnet 3.7', false],
        ['Max parallel agents',    '8',                 false],
        ['Auto-save workspace',    'Enabled',           true],
        ['Stream mode',            'Real-time',         false],
        ['Telemetry',              'Anonymous only',    false],
      ].map(([label, val, toggle], i) => F(16, 32 + i * 32, CONTENT_W - 80, 28, 'transparent', {
        ch: [
          T(label, 0, 7, 220, 14, { size: 11, fill: P.fg2 }),
          ...(toggle
            ? [F(CONTENT_W - 168, 6, 48, 18, P.agentDim, { r: 9, stroke: P.agent, sw: 1, ch: [
                E(28, 3, 12, 12, P.agent),
              ]})]
            : [T(val, CONTENT_W - 200, 7, 180, 14, { size: 11, fill: P.fg2, align: 'right' }),
               T('›', CONTENT_W - 128, 7, 16, 14, { size: 13, fill: P.fg3 })]),
        ],
      })),
    ],
  });

  // Danger zone
  const dangerCard = GlassCard(CONTENT_X + 24, 664, CONTENT_W - 48, 80, {
    stroke: `${P.red}44`, r: 10,
    ch: [
      T('DANGER ZONE', 16, 14, 200, 12, { size: 9, fill: P.red, weight: 700, ls: 1.1 }),
      T('Delete account and all associated data permanently', 16, 32, CONTENT_W - 200, 14, { size: 11, fill: P.fg3 }),
      F(CONTENT_W - 180, 26, 156, 30, P.redDim, { r: 8, stroke: P.red, sw: 1, ch: [
        T('Delete Account', 14, 7, 128, 16, { size: 11, fill: P.red, weight: 600 }),
      ]}),
    ],
  });

  return {
    id: uid(), name: 'S5 – Settings', type: 'frame',
    x: 5200, y: 0, width: W, height: H,
    fill: P.bg, clip: true,
    children: [sidebar, divider, header, headerLine, profileCard, apiCard, prefsCard, dangerCard],
  };
}

// ── Build .pen ────────────────────────────────────────────────────────────────
const screens = [
  buildScreen1(),
  buildScreen2(),
  buildScreen3(),
  buildScreen4(),
  buildScreen5(),
];

const pen = {
  version: '2.8',
  name:    'SWARM — AI Agent Orchestration Dashboard',
  screens,
};

const penPath = path.join(__dirname, 'swarm-app.pen');
fs.writeFileSync(penPath, JSON.stringify(pen, null, 2));
console.log(`✓ Wrote ${penPath} (${(fs.statSync(penPath).size / 1024).toFixed(1)} KB)`);

const penJson = fs.readFileSync(penPath, 'utf8');

// ── CSS Tokens ────────────────────────────────────────────────────────────────
const CSS_TOKENS = `/* SWARM — Design Tokens */
:root {
  /* Backgrounds */
  --color-bg:        ${P.bg};
  --color-surface:   ${P.surface};
  --color-surface-2: ${P.surface2};
  --color-glass:     ${P.glass};
  --color-glass-hi:  ${P.glassHi};

  /* Borders */
  --color-border:    ${P.border};
  --color-border-2:  ${P.border2};
  --color-glass-bdr: ${P.glassBdr};

  /* Text */
  --color-fg:        ${P.fg};
  --color-fg-2:      ${P.fg2};
  --color-fg-3:      ${P.fg3};
  --color-code:      ${P.code};

  /* Agent Indigo */
  --color-agent:     ${P.agent};
  --color-agent-lt:  ${P.agentLt};
  --color-agent-dim: ${P.agentDim};

  /* Status */
  --color-green:     ${P.green};
  --color-green-dim: ${P.greenDim};
  --color-amber:     ${P.amber};
  --color-amber-dim: ${P.amberDim};
  --color-red:       ${P.red};
  --color-red-dim:   ${P.redDim};
  --color-cyan:      ${P.cyan};
  --color-cyan-dim:  ${P.cyanDim};

  /* Typography */
  --font-sans: "Inter Variable", "SF Pro Display", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", "SF Mono", Consolas, monospace;

  /* Spacing scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;

  /* Type scale */
  --text-xs:  8px;
  --text-sm:  10px;
  --text-md:  12px;
  --text-lg:  16px;
  --text-xl:  24px;
  --text-2xl: 36px;
  --text-3xl: 56px;

  /* Radii */
  --radius-sm:  4px;
  --radius-md:  8px;
  --radius-lg:  12px;
  --radius-xl:  16px;
  --radius-full: 9999px;
}`;

// ── Hero HTML ─────────────────────────────────────────────────────────────────
function buildHeroHTML() {
  const palette = [
    { hex: P.bg,      name: 'Deep Space'   },
    { hex: P.surface, name: 'Surface'      },
    { hex: P.glass,   name: 'Glass'        },
    { hex: P.agent,   name: 'Agent Indigo' },
    { hex: P.cyan,    name: 'Stream Teal'  },
    { hex: P.green,   name: 'Active'       },
    { hex: P.amber,   name: 'Pending'      },
    { hex: P.red,     name: 'Error'        },
    { hex: P.fg,      name: 'Primary Text' },
    { hex: P.code,    name: 'Code Tint'    },
  ];

  const screenLabels = [
    { name: 'S1 – Dashboard',       desc: 'Bento agent overview' },
    { name: 'S2 – Active Workspace',desc: 'Agent stream columns' },
    { name: 'S3 – New Workspace',   desc: 'Creation modal flow'  },
    { name: 'S4 – Agent Detail',    desc: 'Analytics deep-dive'  },
    { name: 'S5 – Settings',        desc: 'Prefs & API keys'     },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SWARM — AI Agent Orchestration · RAM Design Studio</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg:      ${P.bg};
    --surface: ${P.surface};
    --glass:   ${P.glass};
    --border:  ${P.border};
    --fg:      ${P.fg};
    --fg2:     ${P.fg2};
    --fg3:     ${P.fg3};
    --agent:   ${P.agent};
    --agentLt: ${P.agentLt};
    --agentDim:${P.agentDim};
    --cyan:    ${P.cyan};
    --green:   ${P.green};
    --amber:   ${P.amber};
    --red:     ${P.red};
    --code:    ${P.code};
  }
  body { background: var(--bg); color: var(--fg); font-family: 'Inter', system-ui, sans-serif; line-height: 1.6; }
  a { color: var(--agent); text-decoration: none; }

  /* Hero */
  .hero { padding: 80px 40px 60px; max-width: 1100px; margin: 0 auto; text-align: center; }
  .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: var(--agentDim); border: 1px solid var(--agent); border-radius: 999px; padding: 6px 16px; font-size: 11px; font-weight: 600; letter-spacing: 1px; color: var(--agentLt); margin-bottom: 28px; }
  .hero-badge span { width: 8px; height: 8px; border-radius: 50%; background: var(--cyan); animation: pulse 2s ease-in-out infinite; display: inline-block; }
  @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
  .hero h1 { font-size: clamp(42px, 7vw, 80px); font-weight: 700; line-height: 1.05; letter-spacing: -2px; margin-bottom: 20px; }
  .hero h1 .accent { color: var(--agent); }
  .hero .tagline { font-size: 18px; color: var(--fg2); max-width: 560px; margin: 0 auto 40px; }
  .hero-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .btn { padding: 12px 24px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; }
  .btn-primary { background: var(--agent); color: #fff; }
  .btn-primary:hover { background: var(--agentLt); }
  .btn-secondary { background: var(--surface); color: var(--fg); border: 1px solid var(--border); }
  .btn-secondary:hover { border-color: var(--agent); }
  .btn-ghost { background: transparent; color: var(--fg2); border: 1px solid var(--border); }

  /* Screens strip */
  .screens-section { padding: 0 40px 60px; }
  .section-label { text-align: center; font-size: 11px; font-weight: 700; letter-spacing: 2px; color: var(--fg3); margin-bottom: 24px; }
  .screens-strip { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 16px; scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
  .screen-thumb { flex: 0 0 300px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; transition: border-color 0.2s, transform 0.2s; cursor: pointer; }
  .screen-thumb:hover { border-color: var(--agent); transform: translateY(-3px); }
  .screen-thumb-vis { height: 180px; background: linear-gradient(135deg, var(--surface) 0%, var(--glass) 50%, var(--agentDim) 100%); position: relative; overflow: hidden; }
  /* Mini screen skeleton art */
  .screen-thumb-vis::before { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(0deg, transparent 0, transparent 14px, ${P.border}44 14px, ${P.border}44 15px); }
  .screen-thumb-vis .mini-sidebar { position: absolute; left: 0; top: 0; bottom: 0; width: 60px; background: var(--surface); border-right: 1px solid var(--border); }
  .screen-thumb-vis .mini-topbar { position: absolute; left: 60px; right: 0; top: 0; height: 18px; background: var(--surface); border-bottom: 1px solid var(--border); }
  .screen-thumb-vis .mini-card { position: absolute; background: var(--glass); border: 1px solid var(--glassBdr, ${P.glassBdr}); border-radius: 4px; }
  .screen-thumb-info { padding: 14px; }
  .screen-thumb-info strong { display: block; font-size: 13px; color: var(--fg); }
  .screen-thumb-info span { font-size: 11px; color: var(--fg2); }

  /* Brand Spec */
  .brand-section { max-width: 1100px; margin: 0 auto; padding: 0 40px 60px; }
  .spec-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 24px; }
  .spec-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 24px; }
  .spec-card h3 { font-size: 11px; font-weight: 700; letter-spacing: 1.5px; color: var(--fg3); margin-bottom: 16px; }

  /* Palette */
  .palette { display: flex; flex-wrap: wrap; gap: 10px; }
  .swatch { display: flex; align-items: center; gap: 8px; }
  .swatch-dot { width: 28px; height: 28px; border-radius: 6px; border: 1px solid ${P.border2}; flex-shrink: 0; }
  .swatch-info { font-size: 10px; }
  .swatch-name { color: var(--fg2); display: block; }
  .swatch-hex  { color: var(--fg3); font-family: monospace; }

  /* Type scale */
  .type-rows { display: flex; flex-direction: column; gap: 8px; }
  .type-row { display: flex; align-items: baseline; gap: 12px; }
  .type-label { font-size: 10px; color: var(--fg3); width: 40px; flex-shrink: 0; }
  .type-sample { color: var(--fg); }

  /* Spacing */
  .spacing-rows { display: flex; flex-direction: column; gap: 6px; }
  .spacing-row { display: flex; align-items: center; gap: 10px; }
  .spacing-bar { height: 6px; background: var(--agent); border-radius: 3px; opacity: 0.7; }
  .spacing-text { font-size: 10px; color: var(--fg3); }

  /* Tokens block */
  .tokens-section { max-width: 1100px; margin: 0 auto; padding: 0 40px 60px; }
  .tokens-block { background: #050710; border: 1px solid var(--border); border-radius: 10px; padding: 24px; overflow-x: auto; position: relative; }
  .tokens-block pre { font-family: 'JetBrains Mono', 'SF Mono', monospace; font-size: 12px; color: var(--code); line-height: 1.8; white-space: pre; }
  .copy-btn { position: absolute; top: 16px; right: 16px; background: var(--agentDim); border: 1px solid var(--agent); color: var(--agentLt); padding: 6px 14px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; }
  .copy-btn:hover { background: var(--agent); color: #fff; }

  /* Prompt */
  .prompt-section { max-width: 1100px; margin: 0 auto; padding: 0 40px 60px; text-align: center; }
  .prompt-section blockquote { font-size: 18px; font-style: italic; color: var(--fg2); line-height: 1.7; border-left: 3px solid var(--agent); padding-left: 24px; text-align: left; max-width: 760px; margin: 0 auto; }

  /* PRD */
  .prd-section { max-width: 1100px; margin: 0 auto; padding: 0 40px 60px; }
  .prd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  @media(max-width:700px) { .prd-grid { grid-template-columns: 1fr; } }
  .prd-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 24px; }
  .prd-card h3 { font-size: 13px; font-weight: 700; color: var(--agent); margin-bottom: 12px; }
  .prd-card p, .prd-card li { font-size: 13px; color: var(--fg2); line-height: 1.7; }
  .prd-card ul { padding-left: 16px; }
  .prd-card li { margin-bottom: 6px; }

  /* Design principles */
  .principles { display: flex; gap: 16px; flex-wrap: wrap; }
  .principle { background: var(--agentDim); border: 1px solid var(--agent); border-radius: 8px; padding: 10px 16px; font-size: 12px; color: var(--agentLt); }

  /* Footer */
  footer { text-align: center; padding: 40px; border-top: 1px solid var(--border); font-size: 12px; color: var(--fg3); }
  footer a { color: var(--fg3); opacity: 0.5; }
  footer a:hover { opacity: 1; }

  /* Toast */
  .toast { position: fixed; bottom: 24px; right: 24px; background: var(--surface); border: 1px solid var(--agent); color: var(--fg); padding: 12px 20px; border-radius: 8px; font-size: 13px; opacity: 0; pointer-events: none; transition: opacity 0.3s; z-index: 9999; }
  .toast.show { opacity: 1; }
</style>
</head>
<body>

<!-- Hero -->
<section class="hero">
  <div class="hero-badge"><span></span> RAM DESIGN STUDIO · HEARTBEAT</div>
  <h1>SWARM<br><span class="accent">Agent Orchestration</span></h1>
  <p class="tagline">A dark-mode dashboard for orchestrating parallel AI coding agents — inspired by Superset.sh and Fluid Glass (Awwwards HM)</p>
  <div class="hero-actions">
    <button class="btn btn-primary" onclick="openViewer()">☰  Open in Viewer</button>
    <button class="btn btn-secondary" onclick="copyTokens()">◈  Copy Tokens</button>
    <button class="btn btn-ghost" onclick="copyPrompt()">⊕  Copy Prompt</button>
    <button class="btn btn-ghost" onclick="shareOnX()">𝕏  Share</button>
    <a class="btn btn-ghost" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<!-- Screen Thumbnails -->
<section class="screens-section">
  <p class="section-label">SCREEN PREVIEW · 5 SCREENS</p>
  <div class="screens-strip">
    ${screenLabels.map((s, i) => `
    <div class="screen-thumb" onclick="openViewer()">
      <div class="screen-thumb-vis">
        <div class="mini-sidebar"></div>
        <div class="mini-topbar"></div>
        <div class="mini-card" style="left:${68 + i * 2}px;top:22px;right:8px;height:24px;"></div>
        <div class="mini-card" style="left:${68}px;top:50px;width:${60 + i * 10}px;height:${40 + i * 8}px;"></div>
        <div class="mini-card" style="left:${138 + i}px;top:50px;right:8px;height:${40 + i * 6}px;opacity:0.6;"></div>
        <div style="position:absolute;bottom:8px;left:68px;right:8px;height:2px;background:${P.agent};border-radius:1px;opacity:${0.3 + i * 0.15};"></div>
      </div>
      <div class="screen-thumb-info">
        <strong>${s.name}</strong>
        <span>${s.desc}</span>
      </div>
    </div>`).join('')}
  </div>
</section>

<!-- Brand Spec -->
<section class="brand-section">
  <p class="section-label">BRAND SPECIFICATION</p>
  <div class="spec-grid">

    <!-- Palette -->
    <div class="spec-card" style="grid-column: 1 / -1;">
      <h3>COLOR PALETTE</h3>
      <div class="palette">
        ${palette.map(c => `
        <div class="swatch">
          <div class="swatch-dot" style="background:${c.hex};"></div>
          <div class="swatch-info">
            <span class="swatch-name">${c.name}</span>
            <span class="swatch-hex">${c.hex}</span>
          </div>
        </div>`).join('')}
      </div>
    </div>

    <!-- Typography -->
    <div class="spec-card">
      <h3>TYPE SCALE</h3>
      <div class="type-rows">
        <div class="type-row"><span class="type-label">3XL</span><span class="type-sample" style="font-size:36px;font-weight:700;line-height:1">SWARM</span></div>
        <div class="type-row"><span class="type-label">2XL</span><span class="type-sample" style="font-size:24px;font-weight:600">Dashboard</span></div>
        <div class="type-row"><span class="type-label">XL</span><span class="type-sample" style="font-size:18px;font-weight:500">Active Agents</span></div>
        <div class="type-row"><span class="type-label">LG</span><span class="type-sample" style="font-size:14px">Agent Status</span></div>
        <div class="type-row"><span class="type-label">MD</span><span class="type-sample" style="font-size:12px;color:${P.fg2}">Task description text</span></div>
        <div class="type-row"><span class="type-label">SM</span><span class="type-sample" style="font-size:10px;color:${P.fg3}">METADATA LABEL</span></div>
        <div class="type-row"><span class="type-label">MONO</span><span class="type-sample" style="font-size:11px;font-family:monospace;color:${P.cyan}">agent-01 ▶ 78%</span></div>
      </div>
    </div>

    <!-- Spacing -->
    <div class="spec-card">
      <h3>SPACING SYSTEM</h3>
      <div class="spacing-rows">
        ${[4,8,12,16,24,32,48,64].map(s => `
        <div class="spacing-row">
          <div class="spacing-bar" style="width:${s * 2}px;"></div>
          <span class="spacing-text">${s}px — space-${s <= 8 ? Math.round(s/4) : s <= 24 ? Math.round(s/4) : Math.round(s/8)}</span>
        </div>`).join('')}
      </div>
    </div>

    <!-- Design Principles -->
    <div class="spec-card" style="grid-column: 1 / -1;">
      <h3>DESIGN PRINCIPLES</h3>
      <div class="principles">
        <div class="principle">⬡ Glass-depth hierarchy</div>
        <div class="principle">◎ Monospace for machine output</div>
        <div class="principle">⊞ Bento grid for dense data</div>
        <div class="principle">◉ Status color semantics</div>
        <div class="principle">⟳ Real-time stream legibility</div>
        <div class="principle">◈ Deep-space palette</div>
      </div>
    </div>
  </div>
</section>

<!-- CSS Tokens -->
<section class="tokens-section">
  <p class="section-label">CSS DESIGN TOKENS</p>
  <div class="tokens-block">
    <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
    <pre>${CSS_TOKENS.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
  </div>
</section>

<!-- Prompt -->
<section class="prompt-section">
  <p class="section-label">ORIGINAL PROMPT</p>
  <blockquote>${PROMPT}</blockquote>
</section>

<!-- PRD -->
<section class="prd-section">
  <p class="section-label">PRODUCT BRIEF / PRD</p>
  <div class="prd-grid">
    <div class="prd-card">
      <h3>Overview</h3>
      <p>SWARM is a developer-focused dashboard for orchestrating parallel AI coding agents. Teams spawn multiple AI agents (Claude, GPT-4o, Gemini) into isolated workspaces, each tackling a sub-task simultaneously — dramatically accelerating software development cycles.</p>
    </div>
    <div class="prd-card">
      <h3>Target Users</h3>
      <ul>
        <li>Senior engineers managing large refactoring tasks</li>
        <li>Platform teams running automated code quality sweeps</li>
        <li>Startups using AI-first development workflows</li>
        <li>DevOps engineers automating test generation at scale</li>
      </ul>
    </div>
    <div class="prd-card">
      <h3>Core Features</h3>
      <ul>
        <li>Real-time agent stream visualization (terminal columns)</li>
        <li>Bento-grid dashboard with live metrics</li>
        <li>Parallel branch visualization (agent task graph)</li>
        <li>Multi-model support with per-workspace selection</li>
        <li>One-click workspace spawning with agent count slider</li>
        <li>Agent detail analytics: throughput, files changed, errors</li>
      </ul>
    </div>
    <div class="prd-card">
      <h3>Design Language</h3>
      <ul>
        <li><strong>Deep-space dark:</strong> #060810 near-black with navy undertone (AuthKit-inspired)</li>
        <li><strong>Glass morphism:</strong> Translucent surface cards with luminous borders (Fluid Glass, Awwwards HM)</li>
        <li><strong>Monospace streams:</strong> Terminal-teal (#00E5CC) output (Superset.sh aesthetic)</li>
        <li><strong>Agent indigo (#7C8FFF):</strong> AI actions, electric and purposeful</li>
        <li><strong>Status semantics:</strong> Green/Amber/Red for running/queued/failed states</li>
      </ul>
    </div>
    <div class="prd-card">
      <h3>Screen Architecture</h3>
      <ul>
        <li><strong>S1 – Dashboard:</strong> Bento metrics + agent swarm grid + activity feed</li>
        <li><strong>S2 – Workspace:</strong> Branch graph + 3-column agent stream layout</li>
        <li><strong>S3 – New Workspace:</strong> Modal creation with model/agent config</li>
        <li><strong>S4 – Agent Detail:</strong> Throughput chart, file diffs, terminal replay</li>
        <li><strong>S5 – Settings:</strong> Profile, API keys, preferences, danger zone</li>
      </ul>
    </div>
    <div class="prd-card">
      <h3>Inspiration Sources</h3>
      <ul>
        <li><strong>Superset.sh</strong> (darkmodedesign.com) — terminal swarm aesthetic, near-black #0D0D0D bg, parallel agent UI language</li>
        <li><strong>Fluid Glass by Exo Ape</strong> (Awwwards Honorable Mention) — glass morphism card panels, luminous translucent borders</li>
        <li><strong>AuthKit</strong> (godly.website #991) — deep-space background #05060F, refined dark product typography</li>
        <li><strong>Linear.app</strong> (darkmodedesign.com) — Inter Variable font, precision dark UI for developer tools</li>
      </ul>
    </div>
  </div>
</section>

<footer>
  <p>Built by <strong>RAM Design Studio</strong> — AI Design Intelligence</p>
  <a href="https://ram.zenbin.org/gallery" style="opacity:.4">ram.zenbin.org/gallery</a>
</footer>

<div class="toast" id="toast"></div>

<script>
function toast(msg){const el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2500);}
function openViewer(){window.open('https://ram.zenbin.org/${SLUG}-viewer','_blank');}
function downloadPen(){window.open('https://ram.zenbin.org/${SLUG}-viewer','_blank');toast('Opening in viewer — save from there');}
function copyPrompt(){navigator.clipboard.writeText(${JSON.stringify(PROMPT)}).then(()=>toast('Prompt copied ✓')).catch(()=>toast('Copy failed'));}
function copyTokens(){navigator.clipboard.writeText(${JSON.stringify(CSS_TOKENS)}).then(()=>toast('CSS tokens copied ✓')).catch(()=>toast('Copy failed'));}
function shareOnX(){const t=encodeURIComponent('SWARM — dark-mode AI agent orchestration dashboard. 5 screens, deep-space palette, glass morphism + terminal aesthetic. Built by RAM Design Studio 🤖⬡');const u=encodeURIComponent('https://ram.zenbin.org/${SLUG}');window.open('https://x.com/intent/tweet?text='+t+'&url='+u,'_blank');}
<\/script>
</body>
</html>`;
}

// ── HTTP helpers ───────────────────────────────────────────────────────────────
function httpReq(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      const chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString() }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function publish(slug, title, html, subdomain = 'ram') {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title, html });
    const req  = https.request({
      hostname: 'zenbin.org',
      path:     `/v1/pages/${slug}`,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain':    subdomain,
      },
    }, res => {
      const chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(chunks).toString() }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function pushToGallery(heroUrl) {
  try {
    // Fetch queue
    const qRes = await httpReq({
      hostname: 'api.github.com',
      path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
      method:   'GET',
      headers:  { 'User-Agent': 'RAM-Design-Bot', 'Authorization': `token ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' },
    });
    const qData = JSON.parse(qRes.body);
    const queue = JSON.parse(Buffer.from(qData.content, 'base64').toString());
    const sha   = qData.sha;

    const entry = {
      id:           `hb-swarm-${Date.now()}`,
      prompt:       PROMPT.slice(0, 200),
      app_name:     'SWARM',
      archetype:    'developer-tools',
      credit:       'RAM Studio Heartbeat',
      submitted_at: new Date().toISOString(),
      status:       'done',
      design_url:   heroUrl,
      published_at: new Date().toISOString(),
    };
    queue.submissions = queue.submissions || [];
    queue.submissions.push(entry);

    const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
    const upRes = await httpReq({
      hostname: 'api.github.com',
      path:     `/repos/${GITHUB_REPO}/contents/queue.json`,
      method:   'PUT',
      headers: {
        'User-Agent':    'RAM-Design-Bot',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type':  'application/json',
        'Accept':        'application/vnd.github.v3+json',
      },
    }, JSON.stringify({ message: 'heartbeat: SWARM agent dashboard published', content, sha }));

    if (upRes.status === 200 || upRes.status === 201) {
      console.log('  ✓ Gallery queue updated');
    } else {
      console.log(`  ⚠ Gallery HTTP ${upRes.status}`);
    }
  } catch (e) {
    console.log(`  ⚠ Gallery push failed: ${e.message}`);
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  console.log('\n🤖 SWARM — Design Discovery Pipeline');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const heroHtml = buildHeroHTML();
  console.log(`  Hero HTML: ${(heroHtml.length / 1024).toFixed(1)} KB`);

  // Viewer injection
  const viewerPath = path.join(__dirname, 'penviewer-app.html');
  let viewerHtml = fs.readFileSync(viewerPath, 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

  console.log('\n  📤 Hero   → ram.zenbin.org/' + SLUG + ' ...');
  const r1 = await publish(SLUG, 'SWARM — AI Agent Orchestration Dashboard · RAM Design Studio', heroHtml);
  const heroOk = r1.status === 200 || r1.status === 201;
  console.log(`  ${heroOk ? '✓' : '✗'} HTTP ${r1.status}`);

  console.log('  📤 Viewer → ram.zenbin.org/' + SLUG + '-viewer ...');
  const r2 = await publish(`${SLUG}-viewer`, 'SWARM — Viewer · RAM Design Studio', viewerHtml);
  const viewerOk = r2.status === 200 || r2.status === 201;
  console.log(`  ${viewerOk ? '✓' : '✗'} HTTP ${r2.status}`);

  const heroUrl = `https://ram.zenbin.org/${SLUG}`;

  console.log('\n  📋 Pushing to gallery...');
  await pushToGallery(heroUrl);

  console.log('\n🔗 Live URLs:');
  console.log(`   Hero:   ${heroUrl}`);
  console.log(`   Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`\n✅ Pipeline complete`);
})();
