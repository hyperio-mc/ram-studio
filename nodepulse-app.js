'use strict';
// nodepulse-app.js
// NODEPULSE — Distributed AI Cluster Health Monitor
//
// Challenge: Design a dark-mode AI infrastructure monitoring platform inspired by:
// 1. Darknode (Awwwards SOTD March 21 2026, by Qream/Yehor Herasymenko) — deep
//    cosmic void bg #050810, electric cyan node-network glows, 3D animated particles,
//    hero video + slider animation, cinematic breathing room.
// 2. OWO app (darkmodedesign.com) — spatial UI depth, floating glass panels
// 3. TRIONN agency site (darkmodedesign.com) — bold editorial type on near-black,
//    "roar in the digital wilderness", confident wordmarks
//
// Palette: cosmic void #050810 · electric cyan #00D4FF · violet #7C5CFC ·
//          emerald #00E87A · amber #FFB340 · crimson #FF4060
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#050810',   // cosmic void (Darknode-inspired)
  surface:  '#0A0E1A',   // elevated surface
  surface2: '#0D1220',   // card surface
  surface3: '#111828',   // lighter card
  border:   '#182035',   // subtle border
  border2:  '#213050',   // visible border
  muted:    '#3D4F70',   // muted blue-grey
  muted2:   '#5A6E95',   // mid muted
  fg:       '#DCE8F8',   // cool off-white
  fg2:      '#8A9FC0',   // secondary text
  cyan:     '#00D4FF',   // electric cyan (node connections — Darknode glow)
  violet:   '#7C5CFC',   // violet accent (primary brand)
  green:    '#00E87A',   // emerald (healthy/success)
  amber:    '#FFB340',   // amber (warning)
  red:      '#FF4060',   // crimson (critical)
  deep:     '#060A16',   // deep card tint
};

let _id = 0;
const uid = () => `np${++_id}`;

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

// ── Glow system (Darknode-inspired radial aura) ───────────────────────────────
const Glow = (cx, cy, r, color) => [
  E(cx - r*3,   cy - r*3,   r*6,   r*6,   color + '04'),
  E(cx - r*2,   cy - r*2,   r*4,   r*4,   color + '0A'),
  E(cx - r*1.2, cy - r*1.2, r*2.4, r*2.4, color + '14'),
  E(cx - r*0.6, cy - r*0.6, r*1.2, r*1.2, color + '22'),
];

// ── Node dot with glow ────────────────────────────────────────────────────────
const NodeDot = (cx, cy, r, color, label = null) => {
  const items = [
    E(cx - r*2,   cy - r*2,   r*4,   r*4,   color + '14'),
    E(cx - r*1.2, cy - r*1.2, r*2.4, r*2.4, color + '22'),
    E(cx - r,     cy - r,     r*2,   r*2,   color + '55'),
    E(cx - r*0.6, cy - r*0.6, r*1.2, r*1.2, color),
  ];
  if (label) items.push(T(label, cx - 30, cy + r*1.4 + 4, 60, 12, { size: 9, fill: P.fg2, align: 'center', ls: 0.5 }));
  return items;
};

// ── Connection line between two points ───────────────────────────────────────
const ConnLine = (x1, y1, x2, y2, color = P.cyan, opacity = 0.2) => {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx*dx + dy*dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  return {
    id: uid(), type: 'frame',
    x: x1, y: y1 - 1,
    width: Math.round(len), height: 2,
    fill: color,
    opacity,
    cornerRadius: 1,
    children: [],
    // simulate rotation via skewed position — approximate in pen format
  };
};

// ── Status pill ───────────────────────────────────────────────────────────────
const Pill = (x, y, label, color, bgOpacity = '22') => F(x, y, label.length * 6 + 22, 22, color + bgOpacity, {
  r: 11,
  ch: [
    E(8, 7, 8, 8, color),
    T(label, 20, 4, label.length * 6, 14, { size: 9, fill: color, weight: 700, ls: 0.5 }),
  ],
});

// ── Metric card (glassmorphism-lite) ──────────────────────────────────────────
const MetricCard = (x, y, w, h, label, value, unit, color, sub = null) => F(x, y, w, h, P.surface2, {
  r: 14, stroke: P.border, sw: 1,
  ch: [
    T(label.toUpperCase(), 12, 12, w - 24, 10, { size: 8, fill: P.muted2, ls: 1.5, weight: 700 }),
    T(value, 12, 28, w - 60, 36, { size: 28, fill: color, weight: 900, ls: -1 }),
    T(unit, 12, 66, w - 24, 12, { size: 9, fill: P.muted2 }),
    ...(sub ? [T(sub, w - 50, 28, 44, 14, { size: 10, fill: sub.startsWith('+') ? P.green : P.red, align: 'right', weight: 700 })] : []),
  ],
});

// ── Node row (topology list item) ─────────────────────────────────────────────
const NodeRow = (x, y, w, name, role, latency, statusColor) => F(x, y, w, 52, P.surface, {
  r: 12, stroke: P.border, sw: 1,
  ch: [
    E(14, 20, 12, 12, statusColor + '33'),
    E(17, 23, 6, 6, statusColor),
    T(name, 36, 10, w - 100, 14, { size: 12, fill: P.fg, weight: 700 }),
    T(role, 36, 28, w - 100, 12, { size: 9, fill: P.muted2, ls: 0.3 }),
    T(latency, w - 70, 10, 56, 14, { size: 10, fill: statusColor, align: 'right', weight: 600 }),
    T('ms avg', w - 70, 28, 56, 12, { size: 9, fill: P.muted, align: 'right' }),
  ],
});

// ── Alert card ────────────────────────────────────────────────────────────────
const AlertCard = (x, y, w, severity, title, detail, ago, color) => F(x, y, w, 78, P.surface2, {
  r: 12, stroke: color + '33', sw: 1,
  ch: [
    F(0, 0, 4, 78, color, { r: 2 }),
    T(severity.toUpperCase(), 14, 12, 60, 10, { size: 8, fill: color, ls: 2, weight: 700 }),
    T(ago, w - 50, 12, 44, 10, { size: 8, fill: P.muted, align: 'right' }),
    T(title, 14, 28, w - 28, 14, { size: 12, fill: P.fg, weight: 700 }),
    T(detail, 14, 46, w - 28, 20, { size: 10, fill: P.muted2, lh: 1.5 }),
  ],
});

// ── Mini sparkline ────────────────────────────────────────────────────────────
const Sparkline = (x, y, values, color, bw = 10) => {
  const mx = Math.max(...values), h = 32;
  return values.map((v, i) => {
    const bh = Math.max(2, Math.round((v / mx) * h));
    return F(x + i * (bw + 3), y + (h - bh), bw, bh, color + (i === values.length - 1 ? 'FF' : '66'), { r: 2 });
  });
};

// ── Progress arc (circular indicator) ────────────────────────────────────────
const Arc = (cx, cy, r, pct, color) => {
  const rings = [];
  [r * 2, r * 1.6, r * 1.2].forEach((d, i) => {
    rings.push(E(cx - d/2, cy - d/2, d, d, color, { opacity: [0.06, 0.10, 0.16][i] }));
  });
  rings.push(E(cx - r*0.5, cy - r*0.5, r, r, color, { opacity: 0.28 }));
  rings.push(E(cx - r*0.28, cy - r*0.28, r*0.56, r*0.56, P.bg));
  return rings;
};

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Pulse Overview Dashboard
// ══════════════════════════════════════════════════════════════════════════════
function screenOverview(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    // Darknode-inspired: massive ambient glow field as hero bg element
    ...Glow(195, 280, 200, P.cyan),
    ...Glow(320, 150, 80,  P.violet),
    ...Glow(60,  480, 60,  P.green),

    // Status bar
    T('9:41', 20, 16, 60, 16, { size: 12, weight: 600, fill: P.fg }),
    T('●●●●', 310, 16, 60, 16, { size: 9, fill: P.muted }),

    // Wordmark — TRIONN-influenced bold editorial
    T('NODE', 20, 46, 180, 32, { size: 28, weight: 900, ls: 4, fill: P.fg }),
    T('PULSE', 20, 74, 180, 32, { size: 28, weight: 900, ls: 4, fill: P.cyan }),
    T('AI INFRASTRUCTURE MONITOR', 20, 108, 300, 14, { size: 9, fill: P.muted2, ls: 2 }),

    // Live indicator
    F(296, 50, 74, 26, P.green + '18', { r: 13, stroke: P.green + '44', sw: 1, ch: [
      E(10, 9, 8, 8, P.green),
      T('LIVE', 22, 6, 42, 14, { size: 10, fill: P.green, weight: 800, ls: 1 }),
    ]}),

    // ── Hero cluster health score ─────────────────────────────────────────
    // Darknode-inspired: large glowing orb as hero element
    ...Arc(195, 242, 72, 0.94, P.cyan),
    T('94', 164, 216, 62, 52, { size: 50, weight: 900, fill: P.fg, align: 'center', ls: -2 }),
    T('%', 226, 228, 20, 20, { size: 14, fill: P.cyan, weight: 700 }),
    T('CLUSTER HEALTH', 125, 270, 140, 12, { size: 9, fill: P.muted2, align: 'center', ls: 1.5 }),

    // ── Metric row ────────────────────────────────────────────────────────
    MetricCard(20,  348, 105, 90, 'nodes',    '247',  'total',    P.cyan,   '+3'),
    MetricCard(137, 348, 105, 90, 'uptime',   '99.8', '%',        P.green,  '↑'),
    MetricCard(254, 348, 116, 90, 'p99 lat',  '142',  'ms',       P.amber,  '+8ms'),

    // ── Status breakdown bar ──────────────────────────────────────────────
    T('NODE STATUS', 20, 454, 200, 12, { size: 9, fill: P.muted2, ls: 2, weight: 700 }),
    // bar track
    F(20, 472, 350, 14, P.surface2, { r: 7 }),
    // healthy segment 88%
    F(20, 472, 308, 14, P.green + 'CC', { r: 7 }),
    // warning segment 8%
    F(328, 472, 28, 14, P.amber + 'CC', { r: 7 }),
    // critical segment 4%
    F(356, 472, 14, 14, P.red + 'CC', { r: 7 }),

    // legend
    ...[ ['■ Healthy', '218', P.green], ['■ Warn', '20', P.amber], ['■ Crit', '9', P.red] ].map(([label, n, c], i) =>
      [
        T(label, 20 + i * 118, 492, 90, 12, { size: 9, fill: c }),
        T(n, 20 + i * 118, 506, 90, 12, { size: 9, fill: c, weight: 700 }),
      ]
    ).flat(),

    // ── Recent alerts strip ───────────────────────────────────────────────
    T('RECENT ALERTS', 20, 532, 200, 12, { size: 9, fill: P.muted2, ls: 2, weight: 700 }),
    T('View all', 310, 530, 60, 14, { size: 10, fill: P.cyan, align: 'right', weight: 600 }),

    AlertCard(20, 550, 350, 'warning', 'GPU cluster spike on us-east-4',  'CUDA OOM threshold at 87% — scaling up', '2m',  P.amber),
    AlertCard(20, 638, 350, 'info',    'Auto-scaled inference pool',       'Added 3 replicas to gpt-router-prod',    '7m',  P.cyan),

    // ── Sparkline activity ─────────────────────────────────────────────────
    T('24H ACTIVITY', 20, 730, 200, 12, { size: 9, fill: P.muted2, ls: 2, weight: 700 }),
    ...Sparkline(20, 748, [30,48,55,42,68,80,74,90,95,88,70,84,92,86,94], P.cyan, 18),

    // bottom nav
    F(0, 764, 390, 80, P.surface, { ch: [
      Line(0, 0, 390, P.border),
      ...[ ['◎', 'Overview', 0, true], ['⬡', 'Topology', 1, false], ['⚡', 'Alerts', 2, false], ['◉', 'Nodes', 3, false] ].map(([ic, lb, j, active]) =>
        [
          active ? F(20 + j * 88, 4, 52, 56, P.cyan + '12', { r: 28 }) : null,
          T(ic, 20 + j * 88 + 8, 12, 36, 20, { size: 16, fill: active ? P.cyan : P.muted }),
          T(lb, 20 + j * 88, 36, 52, 12, { size: 9, fill: active ? P.cyan : P.muted, align: 'center', weight: active ? 700 : 400 }),
        ].filter(Boolean)
      ).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Network Topology Map
// ══════════════════════════════════════════════════════════════════════════════
function screenTopology(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    // Background aura — Darknode 3D node-network inspired
    ...Glow(195, 340, 180, P.violet),
    ...Glow(100, 200, 60,  P.cyan),
    ...Glow(300, 460, 60,  P.green),

    // Status bar
    T('9:41', 20, 16, 60, 16, { size: 12, weight: 600, fill: P.fg }),
    T('●●●●', 310, 16, 60, 16, { size: 9, fill: P.muted }),

    // Header
    T('TOPOLOGY', 20, 48, 280, 26, { size: 22, weight: 900, ls: 3, fill: P.fg }),
    Pill(20, 82, 'us-east-4', P.cyan, '18'),
    Pill(106, 82, 'LIVE', P.green, '18'),

    // ── Node graph visualization (Darknode-style network) ─────────────────
    // Cluster central hub
    ...Arc(195, 270, 50, 1.0, P.cyan),
    T('HUB', 175, 258, 40, 24, { size: 11, weight: 900, fill: P.cyan, align: 'center', ls: 2 }),

    // Connection lines from hub to outer nodes (simulated via thin rects)
    // Node 1 — top left
    F(140, 180, 58, 2, P.cyan, { opacity: 0.15, r: 1 }),
    // Node 2 — top right
    F(195, 180, 60, 2, P.cyan, { opacity: 0.15, r: 1 }),
    // Node 3 — left
    F(110, 270, 86, 2, P.cyan, { opacity: 0.15, r: 1 }),
    // Node 4 — right
    F(245, 270, 60, 2, P.cyan, { opacity: 0.15, r: 1 }),
    // Node 5 — bottom left
    F(130, 340, 68, 2, P.amber, { opacity: 0.2, r: 1 }),
    // Node 6 — bottom right
    F(200, 340, 72, 2, P.green, { opacity: 0.2, r: 1 }),

    // Outer nodes
    ...NodeDot(120, 174, 10, P.green,  'gpu-01'),
    ...NodeDot(258, 174, 10, P.green,  'gpu-02'),
    ...NodeDot(98,  272, 10, P.green,  'api-01'),
    ...NodeDot(312, 272, 10, P.green,  'api-02'),
    ...NodeDot(118, 354, 10, P.amber,  'inf-01'),
    ...NodeDot(272, 354, 8,  P.red,    'inf-02'),

    // Node detail callout
    F(20, 400, 350, 64, P.surface2, { r: 14, stroke: P.red + '44', sw: 1, ch: [
      E(14, 22, 12, 12, P.red + '33'),
      E(17, 25, 6, 6, P.red),
      T('inf-02 — CRITICAL', 36, 14, 200, 14, { size: 12, fill: P.red, weight: 700 }),
      T('Inference node · CPU 97% · OOM risk', 36, 32, 280, 12, { size: 10, fill: P.muted2 }),
      F(290, 14, 46, 26, P.red + '22', { r: 13, stroke: P.red + '44', sw: 1, ch: [
        T('KILL', 0, 6, 46, 14, { size: 9, fill: P.red, align: 'center', weight: 800, ls: 0.5 }),
      ]}),
    ]}),

    // ── Node list ─────────────────────────────────────────────────────────
    T('ACTIVE NODES', 20, 480, 200, 12, { size: 9, fill: P.muted2, ls: 2, weight: 700 }),
    T('247 total', 300, 478, 70, 14, { size: 10, fill: P.muted, align: 'right' }),

    NodeRow(20, 498, 350, 'gpu-cluster-01', 'CUDA Inference', '42', P.green),
    NodeRow(20, 558, 350, 'gpu-cluster-02', 'CUDA Inference', '38', P.green),
    NodeRow(20, 618, 350, 'api-gateway',    'Load Balancer',  '12', P.green),
    NodeRow(20, 678, 350, 'inf-node-02',    'Inference Pool', '847', P.red),

    // bottom nav
    F(0, 764, 390, 80, P.surface, { ch: [
      Line(0, 0, 390, P.border),
      ...[ ['◎', 'Overview', 0, false], ['⬡', 'Topology', 1, true], ['⚡', 'Alerts', 2, false], ['◉', 'Nodes', 3, false] ].map(([ic, lb, j, active]) =>
        [
          active ? F(20 + j * 88, 4, 52, 56, P.violet + '18', { r: 28 }) : null,
          T(ic, 20 + j * 88 + 8, 12, 36, 20, { size: 16, fill: active ? P.violet : P.muted }),
          T(lb, 20 + j * 88, 36, 52, 12, { size: 9, fill: active ? P.violet : P.muted, align: 'center', weight: active ? 700 : 400 }),
        ].filter(Boolean)
      ).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Alert & Incident Feed
// ══════════════════════════════════════════════════════════════════════════════
function screenAlerts(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(195, 180, 100, P.red),
    ...Glow(60,  600, 50,  P.amber),

    T('9:41', 20, 16, 60, 16, { size: 12, weight: 600, fill: P.fg }),
    T('●●●●', 310, 16, 60, 16, { size: 9, fill: P.muted }),

    T('ALERTS', 20, 48, 280, 26, { size: 22, weight: 900, ls: 3, fill: P.fg }),
    T('INCIDENT COMMAND', 20, 80, 300, 14, { size: 9, fill: P.muted2, ls: 2 }),

    // Summary bento — Darknode-style dark glass panels
    F(20, 104, 105, 80, P.surface2, { r: 14, stroke: P.red + '44', sw: 1, ch: [
      T('CRITICAL', 10, 12, 85, 10, { size: 7, fill: P.red, ls: 1.5, weight: 700 }),
      T('2', 10, 28, 60, 32, { size: 30, weight: 900, fill: P.red, ls: -1 }),
      T('open', 10, 62, 60, 12, { size: 9, fill: P.muted2 }),
    ]}),
    F(137, 104, 105, 80, P.surface2, { r: 14, stroke: P.amber + '33', sw: 1, ch: [
      T('WARNING', 10, 12, 85, 10, { size: 7, fill: P.amber, ls: 1.5, weight: 700 }),
      T('9', 10, 28, 60, 32, { size: 30, weight: 900, fill: P.amber, ls: -1 }),
      T('open', 10, 62, 60, 12, { size: 9, fill: P.muted2 }),
    ]}),
    F(254, 104, 116, 80, P.surface2, { r: 14, stroke: P.green + '22', sw: 1, ch: [
      T('RESOLVED', 10, 12, 96, 10, { size: 7, fill: P.green, ls: 1.5, weight: 700 }),
      T('47', 10, 28, 80, 32, { size: 30, weight: 900, fill: P.green, ls: -1 }),
      T('today', 10, 62, 80, 12, { size: 9, fill: P.muted2 }),
    ]}),

    // Filter tabs
    F(20, 198, 350, 32, P.surface, { r: 16, ch: [
      F(2, 2, 88, 28, P.red + '20', { r: 14, ch: [
        T('Critical', 0, 6, 88, 16, { size: 11, fill: P.red, align: 'center', weight: 700 }),
      ]}),
      T('Warning', 96, 8, 80, 16, { size: 11, fill: P.muted, align: 'center' }),
      T('All', 184, 8, 60, 16, { size: 11, fill: P.muted, align: 'center' }),
      T('Resolved', 256, 8, 90, 16, { size: 11, fill: P.muted, align: 'center' }),
    ]}),

    // Alert cards
    AlertCard(20, 242, 350, 'critical', 'inf-node-02 memory exhaustion',     'OOM killer invoked — 3 processes terminated', 'NOW',  P.red),
    AlertCard(20, 330, 350, 'critical', 'API gateway latency surge',          'p99 lat jumped to 847ms — SLA breach imminent', '1m',  P.red),
    AlertCard(20, 418, 350, 'warning',  'GPU cluster thermal throttling',     'us-east-4 gpu-01 temp 89°C, throttling 40%', '4m',  P.amber),
    AlertCard(20, 506, 350, 'warning',  'Embedding service queue depth',      'Task queue at 92% capacity — auto-scaling', '11m', P.amber),
    AlertCard(20, 594, 350, 'warning',  'Certificate expiry approaching',     'TLS cert for api.nodepulse.ai expires in 7d', '34m', P.amber),

    // Acknowledge all
    F(20, 690, 350, 48, P.surface2, { r: 14, stroke: P.border, sw: 1, ch: [
      T('ACKNOWLEDGE ALL CRITICAL', 0, 14, 350, 20, { size: 12, fill: P.red, align: 'center', weight: 700, ls: 1 }),
    ]}),

    // bottom nav
    F(0, 764, 390, 80, P.surface, { ch: [
      Line(0, 0, 390, P.border),
      ...[ ['◎', 'Overview', 0, false], ['⬡', 'Topology', 1, false], ['⚡', 'Alerts', 2, true], ['◉', 'Nodes', 3, false] ].map(([ic, lb, j, active]) =>
        [
          active ? F(20 + j * 88, 4, 52, 56, P.red + '18', { r: 28 }) : null,
          T(ic, 20 + j * 88 + 8, 12, 36, 20, { size: 16, fill: active ? P.red : P.muted }),
          T(lb, 20 + j * 88, 36, 52, 12, { size: 9, fill: active ? P.red : P.muted, align: 'center', weight: active ? 700 : 400 }),
        ].filter(Boolean)
      ).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Node Inspector (deep-dive)
// ══════════════════════════════════════════════════════════════════════════════
function screenNodeInspector(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(195, 300, 140, P.amber),
    ...Glow(80, 160, 50, P.cyan),

    T('9:41', 20, 16, 60, 16, { size: 12, weight: 600, fill: P.fg }),
    T('●●●●', 310, 16, 60, 16, { size: 9, fill: P.muted }),

    // Back nav
    T('← Topology', 20, 46, 140, 18, { size: 12, fill: P.cyan, weight: 600 }),

    // Node identity — editorial header
    T('inf-node-02', 20, 74, 300, 30, { size: 24, weight: 900, fill: P.fg, ls: -0.5 }),
    T('INFERENCE POOL · us-east-4 · i4g.4xlarge', 20, 108, 340, 14, { size: 9, fill: P.muted2, ls: 0.8 }),
    Pill(20, 128, 'CRITICAL', P.red, '22'),
    Pill(98, 128, 'OOM RISK', P.amber, '18'),

    // Health arc — large central glow indicator
    ...Arc(195, 250, 56, 0.18, P.red),
    T('18', 168, 224, 54, 44, { size: 38, weight: 900, fill: P.red, align: 'center', ls: -2 }),
    T('%', 222, 236, 16, 16, { size: 12, fill: P.amber, weight: 700 }),
    T('HEALTH', 148, 272, 94, 12, { size: 9, fill: P.muted2, align: 'center', ls: 2 }),

    // Metric grid — bento layout
    F(20,  316, 164, 72, P.surface2, { r: 12, stroke: P.red + '44', sw: 1, ch: [
      T('CPU', 12, 10, 80, 10, { size: 8, fill: P.muted2, ls: 1.5, weight: 700 }),
      T('97%', 12, 26, 100, 28, { size: 24, fill: P.red, weight: 900, ls: -1 }),
      T('8 cores · 3.2GHz', 12, 56, 140, 10, { size: 8, fill: P.muted }),
    ]}),
    F(196, 316, 174, 72, P.surface2, { r: 12, stroke: P.amber + '33', sw: 1, ch: [
      T('MEMORY', 12, 10, 100, 10, { size: 8, fill: P.muted2, ls: 1.5, weight: 700 }),
      T('94%', 12, 26, 100, 28, { size: 24, fill: P.amber, weight: 900, ls: -1 }),
      T('30.2 / 32 GiB used', 12, 56, 150, 10, { size: 8, fill: P.muted }),
    ]}),
    F(20,  398, 164, 72, P.surface2, { r: 12, stroke: P.border, sw: 1, ch: [
      T('NETWORK IN', 12, 10, 130, 10, { size: 8, fill: P.muted2, ls: 1.5, weight: 700 }),
      T('3.2GB', 12, 26, 120, 28, { size: 22, fill: P.cyan, weight: 900, ls: -0.5 }),
      T('per hour', 12, 56, 100, 10, { size: 8, fill: P.muted }),
    ]}),
    F(196, 398, 174, 72, P.surface2, { r: 12, stroke: P.border, sw: 1, ch: [
      T('UPTIME', 12, 10, 100, 10, { size: 8, fill: P.muted2, ls: 1.5, weight: 700 }),
      T('4d 7h', 12, 26, 140, 28, { size: 22, fill: P.fg, weight: 900, ls: -0.5 }),
      T('since last restart', 12, 56, 150, 10, { size: 8, fill: P.muted }),
    ]}),

    // Memory timeline
    T('MEMORY PRESSURE (1H)', 20, 484, 250, 12, { size: 9, fill: P.muted2, ls: 2, weight: 700 }),
    F(20, 500, 350, 48, P.surface, { r: 10, ch: [
      ...Sparkline(12, 8, [55,58,62,68,72,78,80,83,86,88,91,94], P.amber, 22),
    ]}),

    // Connected to
    T('CONNECTED TO', 20, 564, 200, 12, { size: 9, fill: P.muted2, ls: 2, weight: 700 }),
    NodeRow(20, 580, 350, 'api-gateway',     'Load Balancer', '847', P.red),
    NodeRow(20, 640, 350, 'redis-cache-01',  'Cache Layer',   '12',  P.green),

    // Actions
    F(20, 710, 166, 44, P.red + '18', { r: 12, stroke: P.red + '44', sw: 1, ch: [
      T('RESTART NODE', 0, 12, 166, 20, { size: 11, fill: P.red, align: 'center', weight: 700, ls: 0.5 }),
    ]}),
    F(200, 710, 170, 44, P.cyan + '14', { r: 12, stroke: P.cyan + '33', sw: 1, ch: [
      T('SCALE REPLICAS', 0, 12, 170, 20, { size: 11, fill: P.cyan, align: 'center', weight: 700, ls: 0.5 }),
    ]}),

    // bottom nav
    F(0, 764, 390, 80, P.surface, { ch: [
      Line(0, 0, 390, P.border),
      ...[ ['◎', 'Overview', 0, false], ['⬡', 'Topology', 1, true], ['⚡', 'Alerts', 2, false], ['◉', 'Nodes', 3, false] ].map(([ic, lb, j, active]) =>
        [
          active ? F(20 + j * 88, 4, 52, 56, P.violet + '18', { r: 28 }) : null,
          T(ic, 20 + j * 88 + 8, 12, 36, 20, { size: 16, fill: active ? P.violet : P.muted }),
          T(lb, 20 + j * 88, 36, 52, 12, { size: 9, fill: active ? P.violet : P.muted, align: 'center', weight: active ? 700 : 400 }),
        ].filter(Boolean)
      ).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Cluster Config & Settings
// ══════════════════════════════════════════════════════════════════════════════
function screenConfig(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(195, 200, 80, P.violet),
    ...Glow(300, 500, 50, P.cyan),

    T('9:41', 20, 16, 60, 16, { size: 12, weight: 600, fill: P.fg }),
    T('●●●●', 310, 16, 60, 16, { size: 9, fill: P.muted }),

    T('CLUSTER', 20, 48, 280, 26, { size: 22, weight: 900, ls: 3, fill: P.fg }),
    T('CONFIG', 20, 76, 280, 26, { size: 22, weight: 900, ls: 3, fill: P.violet }),
    T('us-east-4 · production', 20, 110, 240, 14, { size: 10, fill: P.muted2 }),
    Pill(20, 130, 'v3.2.1', P.violet, '18'),

    // Cluster profile card
    F(20, 160, 350, 88, P.surface2, { r: 14, stroke: P.violet + '33', sw: 1, ch: [
      ...Arc(44, 44, 28, 1.0, P.violet),
      T('NP', 30, 32, 28, 24, { size: 12, weight: 900, fill: P.violet, align: 'center', ls: 1 }),
      T('nodepulse-prod-cluster', 86, 18, 220, 14, { size: 13, fill: P.fg, weight: 700 }),
      T('Owner: infra@company.io', 86, 38, 220, 12, { size: 10, fill: P.muted2 }),
      T('247 nodes · 16 regions', 86, 56, 220, 12, { size: 10, fill: P.muted2 }),
      T('EDIT', 296, 18, 40, 24, { size: 9, fill: P.cyan, align: 'right', weight: 700, ls: 1 }),
    ]}),

    // Alert thresholds
    T('ALERT THRESHOLDS', 20, 264, 250, 12, { size: 9, fill: P.muted2, ls: 2, weight: 700 }),
    ...[
      ['CPU Warning',    '80%',  P.amber],
      ['CPU Critical',   '95%',  P.red],
      ['Memory Warning', '85%',  P.amber],
      ['Latency (p99)',  '500ms', P.amber],
    ].map(([label, val, color], i) =>
      F(20, 282 + i * 56, 350, 46, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
        T(label, 14, 14, 200, 14, { size: 12, fill: P.fg }),
        T(val, 310, 14, 36, 18, { size: 13, fill: color, weight: 700, align: 'right' }),
        // slider track
        F(14, 34, 322, 4, P.border2, { r: 2 }),
        F(14, 34, Math.round(322 * (i === 3 ? 0.5 : i === 0 ? 0.8 : i === 1 ? 0.95 : 0.85)), 4, color + 'AA', { r: 2 }),
      ]})
    ),

    // Notification routing
    T('NOTIFICATIONS', 20, 514, 250, 12, { size: 9, fill: P.muted2, ls: 2, weight: 700 }),
    ...[
      ['PagerDuty',   'Critical + Warning', P.red,    true],
      ['Slack #infra', 'All alerts',         P.cyan,   true],
      ['Email digest', 'Daily summary',      P.violet, false],
    ].map(([name, scope, color, enabled], i) =>
      F(20, 532 + i * 60, 350, 50, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
        E(14, 19, 12, 12, color + '33'),
        E(17, 22, 6, 6, color),
        T(name, 36, 10, 180, 14, { size: 12, fill: P.fg, weight: 700 }),
        T(scope, 36, 28, 180, 12, { size: 10, fill: P.muted2 }),
        // toggle
        F(300, 16, 36, 18, enabled ? P.green + '33' : P.border, { r: 9, stroke: enabled ? P.green + '55' : P.border2, sw: 1, ch: [
          E(enabled ? 20 : 2, 3, 12, 12, enabled ? P.green : P.muted),
        ]}),
      ]})
    ),

    // Save button
    F(20, 710, 350, 48, P.violet, { r: 14, ch: [
      T('SAVE CONFIGURATION', 0, 14, 350, 20, { size: 13, weight: 800, fill: P.fg, align: 'center', ls: 1.5 }),
    ]}),

    // bottom nav
    F(0, 764, 390, 80, P.surface, { ch: [
      Line(0, 0, 390, P.border),
      ...[ ['◎', 'Overview', 0, false], ['⬡', 'Topology', 1, false], ['⚡', 'Alerts', 2, false], ['◉', 'Config', 3, true] ].map(([ic, lb, j, active]) =>
        [
          active ? F(20 + j * 88, 4, 52, 56, P.violet + '18', { r: 28 }) : null,
          T(ic, 20 + j * 88 + 8, 12, 36, 20, { size: 16, fill: active ? P.violet : P.muted }),
          T(lb, 20 + j * 88, 36, 52, 12, { size: 9, fill: active ? P.violet : P.muted, align: 'center', weight: active ? 700 : 400 }),
        ].filter(Boolean)
      ).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// ASSEMBLE & SAVE
// ══════════════════════════════════════════════════════════════════════════════
const SCREEN_W = 390;
const GAP      = 80;

const doc = {
  version: '2.8',
  name: 'NODEPULSE — AI Cluster Health Monitor',
  width:  5 * SCREEN_W + 6 * GAP,
  height: 844,
  fill:   '#020408',
  children: [
    screenOverview      (GAP),
    screenTopology      (GAP + (SCREEN_W + GAP)),
    screenAlerts        (GAP + (SCREEN_W + GAP) * 2),
    screenNodeInspector (GAP + (SCREEN_W + GAP) * 3),
    screenConfig        (GAP + (SCREEN_W + GAP) * 4),
  ],
};

const outPath = path.join(__dirname, 'nodepulse.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log('✓ nodepulse.pen written —', Math.round(fs.statSync(outPath).size / 1024) + 'KB');
console.log('  5 screens: Overview · Topology · Alerts · Node Inspector · Config');
console.log('  Palette: cosmic void #050810 · cyan #00D4FF · violet #7C5CFC · green #00E87A');
console.log('  Inspired by: Darknode (Awwwards SOTD Mar 21 2026) · darkmodedesign.com');
