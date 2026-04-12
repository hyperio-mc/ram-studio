'use strict';
// nodewatch-app.js
// NODEWATCH — AI Agent Command Center
//
// Challenge: Design a dark-mode AI agent monitoring dashboard inspired by:
// 1. Darknode.io (Awwwards SOTD Mar 21 2026) — pure black bg, Outfit font,
//    node-based 3D animation aesthetic, AI automation agency command-center vibe
// 2. Linear.app (darkmodedesign.com gallery) — near-black systematic product UI,
//    minimal status indicators, precision typography
// 3. Midday.ai (godly.website) — financial clarity dashboard layout patterns,
//    "Hedvig Letters Sans" editorial headings, clean SaaS information hierarchy
//
// Palette: deep black #050505 · electric violet #8B5CF6 · data cyan #22D3EE
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#050505',   // darknode pure black
  surface:  '#0F0F0F',   // elevated surface
  surface2: '#161616',   // card surface
  surface3: '#1F1F1F',   // lighter card / input
  border:   '#252525',   // subtle border
  border2:  '#333333',   // visible border
  muted:    '#555555',   // muted text
  muted2:   '#7A7A7A',   // secondary muted
  fg:       '#F4F4F4',   // primary text
  accent:   '#8B5CF6',   // electric violet (node connections)
  cyan:     '#22D3EE',   // data flow cyan
  green:    '#10B981',   // healthy / online
  amber:    '#F59E0B',   // warning / degraded
  red:      '#EF4444',   // error / incident
  pink:     '#EC4899',   // highlight / special agent
};

let _id = 0;
const uid = () => `nw${++_id}`;

// ── Primitives ────────────────────────────────────────────────────────────────
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
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Line  = (x, y, w, fill = P.border) => F(x, y, w, 1, fill, {});
const VLine = (x, y, h, fill = P.border) => F(x, y, 1, h, fill, {});

// ── Ambient glows (node network atmosphere) ───────────────────────────────────
const Glow = (cx, cy, r, color) => [
  E(cx - r*3, cy - r*3, r*6, r*6, color + '05'),
  E(cx - r*2, cy - r*2, r*4, r*4, color + '0A'),
  E(cx - r,   cy - r,   r*2, r*2, color + '16'),
  E(cx - r*.5, cy - r*.5, r, r,  color + '24'),
];

// ── Node dot ──────────────────────────────────────────────────────────────────
const NodeDot = (cx, cy, r, color, opts = {}) => [
  E(cx - r*2.5, cy - r*2.5, r*5, r*5, color + '12'),
  E(cx - r*1.5, cy - r*1.5, r*3, r*3, color + '22'),
  E(cx - r, cy - r, r*2, r*2, color, { ...(opts.stroke ? { stroke: opts.stroke, sw: opts.sw } : {}), ...(opts.opacity ? { opacity: opts.opacity } : {}) }),
];

// ── Connection line ───────────────────────────────────────────────────────────
const ConnLine = (x1, y1, x2, _y2, color, op = 0.3) => {
  const angle = Math.atan2(_y2 - y1, x2 - x1);
  const dist  = Math.sqrt((x2-x1)**2 + (_y2-y1)**2);
  return F(x1, y1, dist, 1, color, { opacity: op });
};

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = (x, y, label, color) => F(x, y, label.length * 7 + 16, 22, color + '20', { r: 11, ch: [
  T(label, 8, 4, label.length * 7, 14, { size: 10, fill: color, weight: 700, ls: 0.5 }),
]});

// ── Metric chip ───────────────────────────────────────────────────────────────
const MetricChip = (x, y, label, val, color) => F(x, y, 160, 56, P.surface2, { r: 10, stroke: P.border, sw: 1, ch: [
  T(label, 12, 8, 120, 12, { size: 9, fill: P.muted, ls: 1.5 }),
  T(val,   12, 26, 120, 20, { size: 17, weight: 800, fill: color }),
]});

// ── Progress bar ─────────────────────────────────────────────────────────────
const ProgressBar = (x, y, w, pct, color, bg = P.surface3) => [
  F(x, y, w, 5, bg, { r: 3 }),
  F(x, y, Math.round(w * pct), 5, color, { r: 3 }),
];

// ── Status row ───────────────────────────────────────────────────────────────
const AgentRow = (x, y, name, model, status, statusColor, runs, latency) =>
  F(x, y, 350, 64, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
    ...NodeDot(20, 32, 5, statusColor),
    T(name,  36, 9,  180, 16, { size: 13, weight: 700, fill: P.fg }),
    T(model, 36, 30, 160, 14, { size: 10, fill: P.muted, ls: 0.3 }),
    T(runs + ' runs',  240, 9,  70, 14, { size: 10, fill: P.muted, align: 'right' }),
    T(latency,         240, 28, 70, 14, { size: 11, weight: 600, fill: statusColor, align: 'right' }),
    T('›',             326, 23, 14, 18, { size: 14, fill: P.muted }),
  ]});

// ── Terminal line ─────────────────────────────────────────────────────────────
const TermLine = (x, y, prefix, content, prefixColor) => [
  T(prefix,  x,      y, 32, 16, { size: 10, fill: prefixColor, weight: 700 }),
  T(content, x + 36, y, 300, 16, { size: 10, fill: P.fg, opacity: 0.75 }),
];

// ── Bottom nav ────────────────────────────────────────────────────────────────
const BottomNav = (active = 0) => F(0, 764, 390, 80, P.surface, { ch: [
  Line(0, 0, 390, P.border),
  ...[
    ['⬡', 'Network', 0],
    ['◎', 'Agents',  1],
    ['⬡', 'Trace',   2],
    ['⊕', 'Deploy',  3],
    ['⚠', 'Alerts',  4],
  ].map(([ic, lb, j]) => {
    const nx = 8 + j * 75;
    return [
      j === active ? F(nx + 14, 6, 48, 50, P.accent + '18', { r: 24 }) : null,
      T(ic, nx + 18, 12, 40, 22, { size: 16, fill: j === active ? P.accent : P.muted, align: 'center' }),
      T(lb, nx + 6, 38, 64, 14, { size: 9, fill: j === active ? P.accent : P.muted, align: 'center', weight: j === active ? 700 : 400 }),
    ].filter(Boolean);
  }).flat(),
]});

// ── Status bar ───────────────────────────────────────────────────────────────
const StatusBar = (ox) => [
  T('9:41', ox + 20, 16, 50, 16, { size: 12, weight: 600, fill: P.fg }),
  T('●●●●', ox + 310, 16, 60, 16, { size: 9, fill: P.muted }),
];

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — NETWORK OVERVIEW
// ══════════════════════════════════════════════════════════════════════════════
function screenNetwork(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    // Ambient node-network glow atmosphere
    ...Glow(195, 280, 120, P.accent),
    ...Glow(80,  380, 60,  P.cyan),
    ...Glow(310, 220, 50,  P.green),

    // Status bar
    ...StatusBar(ox === 0 ? 0 : -ox),

    // Header
    T('NODEWATCH', 20, 48, 300, 32, { size: 26, weight: 900, fill: P.fg, ls: -1 }),
    T('AGENT NETWORK', 20, 84, 200, 14, { size: 9, fill: P.accent, ls: 3, weight: 700 }),
    // Health pill
    F(296, 48, 74, 28, P.green + '18', { r: 14, stroke: P.green + '40', sw: 1, ch: [
      ...NodeDot(14, 14, 4, P.green),
      T('LIVE', 24, 8, 40, 14, { size: 10, weight: 800, fill: P.green, ls: 1 }),
    ]}),

    // ── Network visualization (node graph) ─────────────────────────────────
    F(20, 110, 350, 240, P.surface, { r: 16, stroke: P.border, sw: 1, ch: [
      // Grid lines for atmosphere
      ...Array.from({ length: 6 }, (_, i) => F(i * 60, 0, 1, 240, P.border, { opacity: 0.3 })),
      ...Array.from({ length: 4 }, (_, i) => F(0, i * 60, 350, 1, P.border, { opacity: 0.3 })),

      // Connection lines between nodes
      F(90, 60, 90, 1, P.cyan, { opacity: 0.3 }),
      F(190, 55, 70, 1, P.accent, { opacity: 0.25 }),
      F(100, 60, 1, 80, P.green, { opacity: 0.2 }),
      F(190, 60, 1, 70, P.accent, { opacity: 0.2 }),
      F(140, 140, 100, 1, P.cyan, { opacity: 0.2 }),
      F(58, 140, 85, 1, P.green, { opacity: 0.2 }),

      // Nodes — orchestrator (central, large)
      ...NodeDot(175, 65, 14, P.accent),
      T('ORCH', 155, 85, 42, 14, { size: 8, fill: P.accent, weight: 700, ls: 1, align: 'center' }),

      // Node — ingestion
      ...NodeDot(80, 60, 9, P.cyan),
      T('INGEST', 55, 76, 52, 12, { size: 8, fill: P.cyan, ls: 0.5 }),

      // Node — reasoning
      ...NodeDot(270, 60, 9, P.green),
      T('REASON', 246, 76, 54, 12, { size: 8, fill: P.green, ls: 0.5 }),

      // Node — memory
      ...NodeDot(100, 145, 8, P.violet || P.accent),
      T('MEM', 84, 160, 36, 12, { size: 8, fill: P.accent, ls: 0.5 }),

      // Node — executor
      ...NodeDot(195, 150, 8, P.amber),
      T('EXEC', 178, 165, 36, 12, { size: 8, fill: P.amber, ls: 0.5 }),

      // Node — output
      ...NodeDot(280, 148, 8, P.pink),
      T('OUT', 266, 163, 30, 12, { size: 8, fill: P.pink, ls: 0.5 }),

      // Heartbeat pulse ring on orchestrator
      E(175 - 28, 65 - 28, 56, 56, 'transparent', { stroke: P.accent + '33', sw: 2 }),
      E(175 - 38, 65 - 38, 76, 76, 'transparent', { stroke: P.accent + '18', sw: 1 }),

      // Data packet dots (animated feel)
      ...NodeDot(130, 63, 3, P.cyan, { opacity: 0.7 }),
      ...NodeDot(225, 63, 3, P.green, { opacity: 0.6 }),
      ...NodeDot(150, 148, 3, P.amber, { opacity: 0.65 }),

      // Labels
      T('12 ACTIVE CONNECTIONS', 16, 214, 230, 14, { size: 9, fill: P.muted, ls: 1 }),
      T('↑ 99.9% UPTIME', 240, 214, 100, 14, { size: 9, fill: P.green, weight: 700 }),
    ]}),

    // ── System metrics strip ──────────────────────────────────────────────
    T('SYSTEM HEALTH', 20, 362, 200, 14, { size: 9, fill: P.muted, ls: 2 }),

    // 4 metric chips 2x2
    MetricChip(20,  380, 'AGENTS ONLINE', '11 / 14', P.green),
    MetricChip(194, 380, 'AVG LATENCY',   '284ms',   P.cyan),
    MetricChip(20,  448, 'TASKS TODAY',   '3,847',   P.accent),
    MetricChip(194, 448, 'ERROR RATE',    '0.12%',   P.amber),

    // ── Active agents list (top 3) ────────────────────────────────────────
    T('AGENTS', 20, 520, 200, 14, { size: 9, fill: P.muted, ls: 2 }),
    T('See all →', 292, 518, 78, 14, { size: 10, fill: P.accent, align: 'right' }),

    AgentRow(20, 538, 'CustomerBot-v3',  'GPT-4o',        P.green, '1,204', '212ms'),
    AgentRow(20, 614, 'DataPipeline-01', 'Claude 3 Opus', P.green, '893',  '389ms'),
    AgentRow(20, 690, 'SearchAgent-x',  'Gemini 1.5',    P.amber, '412',  '621ms'),

    BottomNav(0),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — AGENT DETAIL
// ══════════════════════════════════════════════════════════════════════════════
function screenAgentDetail(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(195, 200, 100, P.green),

    ...StatusBar(ox === 0 ? 0 : -ox),

    // Back + header
    T('← Network', 20, 48, 100, 18, { size: 12, fill: P.muted }),
    T('AGENT DETAIL', 20, 78, 300, 28, { size: 22, weight: 900, fill: P.fg, ls: -0.5 }),

    // Agent card
    F(20, 114, 350, 140, P.surface, { r: 16, stroke: P.border, sw: 1, ch: [
      // Header row
      F(16, 16, 48, 48, P.green + '18', { r: 12, ch: [
        T('🤖', 8, 8, 32, 32, { size: 22, align: 'center' }),
      ]}),
      T('CustomerBot-v3', 76, 16, 220, 18, { size: 15, weight: 800, fill: P.fg }),
      T('GPT-4o · 128k context',  76, 38, 200, 14, { size: 10, fill: P.muted }),
      F(76, 58, 68, 22, P.green + '20', { r: 11, ch: [
        T('● ONLINE', 8, 4, 56, 14, { size: 10, fill: P.green, weight: 700, ls: 0.5 }),
      ]}),
      F(296, 16, 38, 22, P.green + '20', { r: 11, ch: [
        T('●', 4, 3, 30, 16, { size: 11, fill: P.green, align: 'center' }),
      ]}),

      // Stats row
      Line(16, 96, 318, P.border),
      T('CREATED', 16, 106, 80, 12, { size: 8, fill: P.muted, ls: 1.5 }),
      T('14 days ago', 16, 120, 100, 14, { size: 11, fill: P.fg }),
      T('VERSION', 120, 106, 80, 12, { size: 8, fill: P.muted, ls: 1.5 }),
      T('v3.2.1', 120, 120, 80, 14, { size: 11, fill: P.fg }),
      T('OWNER', 220, 106, 80, 12, { size: 8, fill: P.muted, ls: 1.5 }),
      T('ops-team', 220, 120, 100, 14, { size: 11, fill: P.accent }),
    ]}),

    // Performance metrics
    T('PERFORMANCE', 20, 268, 200, 14, { size: 9, fill: P.muted, ls: 2 }),

    F(20, 286, 350, 130, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
      // 3 metrics
      T('TOTAL RUNS', 16, 14, 100, 12, { size: 8, fill: P.muted, ls: 1.5 }),
      T('1,204', 16, 30, 100, 28, { size: 24, weight: 900, fill: P.green }),
      T('+8.3% this week', 16, 62, 120, 14, { size: 10, fill: P.green, opacity: 0.8 }),

      VLine(140, 14, 100, P.border),

      T('AVG LATENCY', 154, 14, 100, 12, { size: 8, fill: P.muted, ls: 1.5 }),
      T('212ms', 154, 30, 100, 28, { size: 24, weight: 900, fill: P.cyan }),
      T('P95: 389ms', 154, 62, 100, 14, { size: 10, fill: P.muted }),

      VLine(268, 14, 100, P.border),

      T('SUCCESS', 282, 14, 60, 12, { size: 8, fill: P.muted, ls: 1.5 }),
      T('99.2%', 282, 30, 60, 28, { size: 20, weight: 900, fill: P.green }),
      T('↑ 0.4%', 282, 62, 60, 14, { size: 10, fill: P.green }),

      // Mini chart bars
      ...[0.6, 0.8, 0.7, 0.9, 0.85, 0.95, 0.88, 1.0, 0.92, 0.97, 0.89, 0.98].map((h, i) =>
        F(16 + i * 10, 100 - Math.round(h * 24), 8, Math.round(h * 24), P.green + '60', { r: 2 })
      ),
    ]}),

    // Resource usage
    T('RESOURCES', 20, 432, 200, 14, { size: 9, fill: P.muted, ls: 2 }),

    F(20, 450, 350, 108, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
      T('MEMORY',  16, 14, 60, 12, { size: 8, fill: P.muted, ls: 1.5 }),
      T('2.1 GB / 8 GB', 200, 14, 130, 12, { size: 10, fill: P.muted, align: 'right' }),
      F(16, 30, 318, 6, P.surface3, { r: 3, ch: [
        F(0, 0, Math.round(318 * 0.26), 6, P.accent, { r: 3 }),
      ]}),

      T('CPU',     16, 52, 60, 12, { size: 8, fill: P.muted, ls: 1.5 }),
      T('12%', 280, 52, 54, 12, { size: 10, fill: P.muted, align: 'right' }),
      F(16, 68, 318, 6, P.surface3, { r: 3, ch: [
        F(0, 0, Math.round(318 * 0.12), 6, P.cyan, { r: 3 }),
      ]}),

      T('TOKENS / HOUR', 16, 88, 120, 12, { size: 8, fill: P.muted, ls: 1.5 }),
      T('48.3k', 266, 88, 68, 12, { size: 10, fill: P.amber, align: 'right', weight: 700 }),
    ]}),

    // Last output preview
    T('LAST OUTPUT', 20, 572, 200, 14, { size: 9, fill: P.muted, ls: 2 }),
    T('12s ago · task #8847', 230, 572, 140, 14, { size: 10, fill: P.muted, align: 'right' }),

    F(20, 590, 350, 78, P.surface2, { r: 12, stroke: P.accent + '30', sw: 1, ch: [
      T('"Resolved ticket #TK-2847: billing dispute. Issued\nrefund of $49.99. Customer satisfaction score: 9/10.\nEscalation: none required."', 14, 12, 322, 56, { size: 11, fill: P.fg, lh: 1.55, opacity: 0.85 }),
    ]}),

    // Action buttons
    F(20, 684, 168, 48, P.surface3, { r: 12, stroke: P.border, sw: 1, ch: [
      T('⏸  PAUSE AGENT', 0, 14, 168, 22, { size: 12, weight: 700, fill: P.amber, align: 'center' }),
    ]}),
    F(202, 684, 168, 48, P.accent, { r: 12, ch: [
      T('↺  VIEW TRACE', 0, 14, 168, 22, { size: 12, weight: 700, fill: P.bg, align: 'center' }),
    ]}),

    BottomNav(1),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — EXECUTION TRACE / TERMINAL
// ══════════════════════════════════════════════════════════════════════════════
function screenTrace(ox) {
  // Terminal log lines
  const LOG = [
    { t: '09:42:11', type: 'SYS',  color: P.muted,  msg: 'CustomerBot-v3 task #8847 START' },
    { t: '09:42:11', type: 'TOOL', color: P.cyan,   msg: 'search_crm(customer_id="CU-4421")' },
    { t: '09:42:12', type: 'DATA', color: P.muted2, msg: '→ { name: "Alex R.", tier: "pro", since: "2023-01" }' },
    { t: '09:42:12', type: 'TOOL', color: P.cyan,   msg: 'get_ticket_history(limit=5)' },
    { t: '09:42:13', type: 'DATA', color: P.muted2, msg: '→ 5 tickets, avg_csat: 8.4, last_issue: "billing"' },
    { t: '09:42:13', type: 'LLM',  color: P.accent, msg: 'GPT-4o reasoning: billing_dispute detected' },
    { t: '09:42:14', type: 'LLM',  color: P.accent, msg: 'decision: issue_refund → amount=$49.99' },
    { t: '09:42:14', type: 'TOOL', color: P.cyan,   msg: 'issue_refund(order="OR-7734", amount=49.99)' },
    { t: '09:42:15', type: 'DATA', color: P.green,  msg: '→ refund_id="RF-1192" status=SUCCESS' },
    { t: '09:42:15', type: 'TOOL', color: P.cyan,   msg: 'send_email(template="refund_conf", to=alex@..)' },
    { t: '09:42:16', type: 'DATA', color: P.green,  msg: '→ email_sent, msg_id="EM-8812"' },
    { t: '09:42:16', type: 'LLM',  color: P.accent, msg: 'summarizing resolution for ticket log...' },
    { t: '09:42:17', type: 'SYS',  color: P.green,  msg: '✓ task #8847 COMPLETE · 6.2s · tokens: 1,847' },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    // BG texture — subtle grid
    ...Array.from({ length: 8 }, (_, i) => F(-ox + i * 50, 0, 1, 844, P.border, { opacity: 0.15 })),

    ...StatusBar(ox === 0 ? 0 : -ox),

    // Header
    T('← Agent Detail', 20, 48, 120, 18, { size: 12, fill: P.muted }),
    T('EXECUTION TRACE', 20, 76, 300, 26, { size: 20, weight: 900, fill: P.fg, ls: -0.5 }),

    // Task info bar
    F(20, 110, 350, 40, P.surface2, { r: 10, stroke: P.border, sw: 1, ch: [
      T('TASK #8847', 12, 12, 100, 16, { size: 11, weight: 700, fill: P.accent }),
      T('CustomerBot-v3 · GPT-4o · 6.2s', 120, 12, 218, 16, { size: 10, fill: P.muted }),
    ]}),

    // Timeline indicator line
    VLine(32, 158, 540, P.border2),
    // dots on timeline
    ...LOG.map((l, i) => E(28, 166 + i * 42, 8, 8, l.color + '60')),

    // Terminal output
    F(20, 158, 350, 558, P.surface, { r: 14, stroke: P.border, sw: 1, clip: true, ch: [
      // Terminal header
      F(0, 0, 350, 36, P.surface2, { r: 0, ch: [
        E(14, 12, 12, 12, '#EF4444'),
        E(34, 12, 12, 12, '#F59E0B'),
        E(54, 12, 12, 12, '#10B981'),
        T('LIVE TRACE — task #8847', 78, 10, 240, 16, { size: 10, fill: P.muted, weight: 600 }),
        T('● REC', 296, 10, 44, 16, { size: 10, fill: P.red, weight: 800 }),
      ]}),

      // Log lines
      ...LOG.map((l, i) => [
        T(l.t, 12, 46 + i * 38, 64, 16, { size: 9, fill: P.muted, weight: 400 }),
        F(80, 44 + i * 38, 38, 18, l.color + '18', { r: 4, ch: [
          T(l.type, 4, 3, 32, 14, { size: 8, fill: l.color, weight: 800, ls: 0.5 }),
        ]}),
        T(l.msg, 124, 46 + i * 38, 214, 16, { size: 9.5, fill: l.type === 'DATA' ? P.muted2 : P.fg, opacity: l.type === 'DATA' ? 0.7 : 1.0 }),
      ]).flat(),

      // cursor blink
      F(12, 46 + LOG.length * 38, 8, 16, P.accent, { opacity: 0.9 }),
    ]}),

    BottomNav(2),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — DEPLOY AGENT
// ══════════════════════════════════════════════════════════════════════════════
function screenDeploy(ox) {
  const models = [
    { name: 'GPT-4o',         desc: 'OpenAI · 128k', color: P.green,  active: false },
    { name: 'Claude 3 Opus',  desc: 'Anthropic · 200k', color: P.accent, active: true  },
    { name: 'Gemini 1.5 Pro', desc: 'Google · 1M',   color: P.cyan,   active: false },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(195, 400, 90, P.accent),

    ...StatusBar(ox === 0 ? 0 : -ox),

    // Header
    T('DEPLOY AGENT', 20, 48, 300, 28, { size: 22, weight: 900, fill: P.fg, ls: -0.5 }),
    T('Step 2 of 3 — Model & Config', 20, 84, 250, 14, { size: 10, fill: P.muted }),

    // Step progress
    F(20, 104, 350, 4, P.surface3, { r: 2 }),
    F(20, 104, Math.round(350 * 0.66), 4, P.accent, { r: 2 }),
    // Step dots
    ...([0, 0.33, 0.66]).map((pos, i) =>
      E(20 + Math.round(350 * pos) - 8, 100, 12, 12, i < 2 ? P.accent : P.surface3)
    ),

    // Name + purpose (step 1 summary)
    F(20, 124, 350, 54, P.surface2, { r: 12, stroke: P.border, sw: 1, ch: [
      T('AGENT NAME', 14, 8, 120, 12, { size: 8, fill: P.muted, ls: 1.5 }),
      T('SupportBot-alpha', 14, 24, 200, 18, { size: 14, weight: 700, fill: P.fg }),
      F(272, 14, 64, 26, P.surface3, { r: 8, ch: [
        T('Edit', 10, 5, 44, 16, { size: 11, fill: P.accent, align: 'center' }),
      ]}),
    ]}),

    // Model selector
    T('SELECT MODEL', 20, 192, 200, 14, { size: 9, fill: P.muted, ls: 2 }),

    ...models.map((m, i) =>
      F(20, 210 + i * 72, 350, 62, m.active ? P.accent + '10' : P.surface, {
        r: 14,
        stroke: m.active ? P.accent : P.border,
        sw: m.active ? 1.5 : 1,
        ch: [
          E(16, 21, 20, 20, m.active ? P.accent : P.surface3, { stroke: m.active ? P.accent : P.border, sw: 2 }),
          m.active ? E(21, 26, 10, 10, P.accent) : null,
          T(m.name, 48, 10, 200, 18, { size: 14, weight: m.active ? 800 : 600, fill: m.active ? P.fg : P.fg, opacity: m.active ? 1 : 0.75 }),
          T(m.desc, 48, 32, 200, 14, { size: 10, fill: m.color, opacity: 0.85 }),
          F(270, 16, 66, 28, m.color + '18', { r: 8, ch: [
            T(m.active ? '● SELECTED' : 'SELECT', 5, 7, 60, 14, { size: 9, fill: m.color, weight: 700, ls: 0.5 }),
          ]}),
        ].filter(Boolean),
      })
    ),

    // Temperature slider
    T('TEMPERATURE', 20, 434, 200, 14, { size: 9, fill: P.muted, ls: 2 }),
    T('0.7', 340, 432, 30, 14, { size: 12, fill: P.accent, weight: 700, align: 'right' }),

    F(20, 452, 350, 32, P.surface, { r: 8, stroke: P.border, sw: 1, ch: [
      F(0, 10, Math.round(350 * 0.7), 12, P.accent + '30', { r: 4 }),
      F(0, 10, Math.round(350 * 0.7), 12, P.accent + '60', { r: 4 }),
      E(Math.round(350 * 0.7) - 10, 4, 22, 22, P.accent, { stroke: P.bg, sw: 3 }),
    ]}),

    // Max tokens
    T('MAX TOKENS', 20, 500, 200, 14, { size: 9, fill: P.muted, ls: 2 }),
    F(20, 518, 350, 44, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      T('4,096', 16, 12, 200, 22, { size: 14, weight: 600, fill: P.fg }),
      F(292, 8, 50, 28, P.surface3, { r: 6, ch: [
        T('Modify', 5, 6, 44, 16, { size: 10, fill: P.muted }),
      ]}),
    ]}),

    // System prompt
    T('SYSTEM PROMPT', 20, 578, 200, 14, { size: 9, fill: P.muted, ls: 2 }),
    F(20, 596, 350, 80, P.surface, { r: 10, stroke: P.accent + '40', sw: 1, ch: [
      T('You are a customer support specialist. Resolve billing\nissues, process refunds under $100, and escalate\ncomplex cases to human agents.', 14, 12, 322, 54, { size: 11, fill: P.fg, lh: 1.55, opacity: 0.9 }),
    ]}),

    // CTA
    F(20, 694, 350, 52, P.accent, { r: 14, ch: [
      T('CONTINUE TO REVIEW →', 0, 15, 350, 24, { size: 13, weight: 800, fill: P.bg, align: 'center', ls: 1 }),
    ]}),

    BottomNav(3),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — INCIDENT ALERT
// ══════════════════════════════════════════════════════════════════════════════
function screenIncident(ox) {
  const traceLines = [
    'AgentError: Tool timeout after 30s',
    '  at SearchAgent.execute (agent.js:847)',
    '  at TaskRunner.run (runner.js:221)',
    '  Tool: web_search("Q4 earnings report")',
    '  Retries: 3 / 3 exhausted',
    '  Context: task #9104, attempt #3',
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(195, 280, 80, P.red),

    ...StatusBar(ox === 0 ? 0 : -ox),

    // Alert header
    F(0, 0, 390, 56, P.red + '0C', {}),
    T('⚠  ACTIVE INCIDENT', 20, 48, 300, 24, { size: 18, weight: 900, fill: P.red, ls: -0.3 }),

    // Severity + time
    F(20, 80, 350, 52, P.surface, { r: 12, stroke: P.red + '40', sw: 1, ch: [
      F(0, 0, 4, 52, P.red, { r: 2 }),
      T('CRITICAL', 16, 8, 80, 16, { size: 9, fill: P.red, weight: 800, ls: 2 }),
      T('INC-2024-0892', 16, 28, 150, 16, { size: 12, weight: 700, fill: P.fg }),
      T('3m ago', 290, 8, 50, 16, { size: 10, fill: P.muted, align: 'right' }),
      T('09:39:22 UTC', 255, 28, 85, 16, { size: 10, fill: P.muted, align: 'right' }),
    ]}),

    // Affected agent
    T('AFFECTED AGENT', 20, 148, 200, 14, { size: 9, fill: P.muted, ls: 2 }),
    F(20, 166, 350, 62, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
      ...NodeDot(26, 31, 6, P.amber),
      T('SearchAgent-x', 44, 10, 200, 18, { size: 14, weight: 700, fill: P.fg }),
      T('Gemini 1.5 Pro · task #9104', 44, 32, 200, 14, { size: 10, fill: P.muted }),
      F(294, 16, 42, 28, P.amber + '18', { r: 8, ch: [
        T('↻ 3', 5, 7, 36, 14, { size: 11, fill: P.amber, weight: 800, align: 'center' }),
      ]}),
    ]}),

    // Error type
    T('ERROR TYPE', 20, 244, 200, 14, { size: 9, fill: P.muted, ls: 2 }),
    F(20, 262, 350, 42, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      T('TOOL_TIMEOUT', 14, 11, 200, 18, { size: 14, weight: 800, fill: P.red }),
      F(248, 8, 88, 26, P.red + '18', { r: 8, ch: [
        T('web_search', 8, 5, 76, 16, { size: 10, fill: P.red, weight: 600 }),
      ]}),
    ]}),

    // Stack trace
    T('STACK TRACE', 20, 320, 200, 14, { size: 9, fill: P.muted, ls: 2 }),
    F(20, 338, 350, traceLines.length * 22 + 20, P.surface2, { r: 12, stroke: P.border, sw: 1, clip: true, ch: [
      F(0, 0, 350, 24, P.surface3, { r: 0, ch: [
        T('● ● ●', 12, 6, 40, 14, { size: 12, fill: P.muted }),
        T('error.log', 70, 6, 200, 14, { size: 10, fill: P.muted }),
      ]}),
      ...traceLines.map((line, i) =>
        T(line, 12, 32 + i * 22, 326, 16, {
          size: 9.5,
          fill: i === 0 ? P.red : P.muted2,
          weight: i === 0 ? 700 : 400,
        })
      ),
    ]}),

    // AI suggested fix
    T('AI SUGGESTED FIX', 20, 506, 220, 14, { size: 9, fill: P.muted, ls: 2 }),
    F(20, 524, 350, 80, P.accent + '0C', { r: 12, stroke: P.accent + '30', sw: 1, ch: [
      T('⬡', 14, 14, 20, 20, { size: 16, fill: P.accent }),
      T('Increase web_search timeout to 60s and\nadd fallback to bing_search tool. Rate limit\ndetected from primary search provider.', 40, 12, 298, 54, { size: 11, fill: P.fg, lh: 1.55, opacity: 0.9 }),
    ]}),

    // Runbook link
    F(20, 616, 350, 38, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      T('📋  View runbook for TOOL_TIMEOUT →', 14, 10, 322, 18, { size: 11, fill: P.accent }),
    ]}),

    // Action buttons
    F(20, 668, 165, 48, P.red + '18', { r: 12, stroke: P.red + '40', sw: 1, ch: [
      T('⏹  KILL AGENT', 0, 14, 165, 22, { size: 12, weight: 700, fill: P.red, align: 'center' }),
    ]}),
    F(200, 668, 170, 48, P.green, { r: 12, ch: [
      T('↺  AUTO-RESOLVE', 0, 14, 170, 22, { size: 12, weight: 700, fill: P.bg, align: 'center' }),
    ]}),

    F(20, 728, 350, 28, P.surface2, { r: 8, ch: [
      T('Acknowledge  ·  Escalate to on-call  ·  Silence 1h', 0, 6, 350, 16, { size: 10, fill: P.muted, align: 'center' }),
    ]}),

    BottomNav(4),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// ASSEMBLE & SAVE
// ══════════════════════════════════════════════════════════════════════════════
const SCREEN_W = 390;
const GAP      = 80;

const doc = {
  version: '2.8',
  name: 'NODEWATCH — AI Agent Command Center',
  width:  5 * SCREEN_W + 6 * GAP,
  height: 844,
  fill:   '#020202',
  children: [
    screenNetwork    (GAP),
    screenAgentDetail(GAP + (SCREEN_W + GAP)),
    screenTrace      (GAP + (SCREEN_W + GAP) * 2),
    screenDeploy     (GAP + (SCREEN_W + GAP) * 3),
    screenIncident   (GAP + (SCREEN_W + GAP) * 4),
  ],
};

const outPath = path.join(__dirname, 'nodewatch.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log('✓ nodewatch.pen written —', Math.round(fs.statSync(outPath).size / 1024) + 'KB');
console.log('  5 screens: Network · Agent Detail · Execution Trace · Deploy · Incident Alert');
console.log('  Palette: #050505 deep black · #8B5CF6 electric violet · #22D3EE data cyan');
console.log('  Inspired by: Darknode.io (SOTD Mar 21 2026) · Linear · Midday.ai');
