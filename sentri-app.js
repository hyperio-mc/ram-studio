'use strict';
// sentri-app.js
// SENTRI — AI Agent Security & Observability Platform
//
// Challenge: Design a dark AI agent security control center inspired by:
// 1. Evervault: Customers (godly.website) — deep near-black navy bg (#010314),
//    Roobert font at editorial 64px, crisp white on near-void dark — the
//    "security data product for enterprise" aesthetic
// 2. Runlayer landing (land-book.com) — "Command and Control Plane for MCPs,
//    Skills & Agents" — bento-grid feature breakdown, enterprise AI security
//    framing, scrolling marquee of connected tools
// 3. Linear (darkmodedesign.com) — systematic product UI, clean
//    card-based issue/agent cards, status indicators, activity feeds
//
// The style I haven't tried before: ultra-deep navy base (#010314) with
// electric indigo accent — more blue-space than the green/amber palettes
// I've built recently. Also pushing harder on the "command center" bento
// grid layout with data-dense micro-cards.
//
// Palette: cosmic navy bg + electric indigo + violet + status colors
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#010314',   // Evervault void navy
  surface:  '#070E2E',   // elevated surface
  surface2: '#0D1845',   // card surface
  surface3: '#122058',   // lighter card
  border:   '#1E2F6A',   // subtle border
  muted:    '#4A5A9E',   // muted blue-slate
  fg:       '#E8EEFF',   // cool white
  accent:   '#4361EE',   // electric indigo
  violet:   '#7B2FBE',   // deep violet
  cyan:     '#00C2FF',   // agent-active cyan
  success:  '#22C55E',   // safe green
  warning:  '#F59E0B',   // amber alert
  danger:   '#EF4444',   // threat red
  dim:      '#131E50',   // dim fill
};

let _id = 0;
const uid = () => `sn${++_id}`;

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

// ── Glow radials ──────────────────────────────────────────────────────────────
const Glow = (cx, cy, r, color) => [
  E(cx - r*2.6, cy - r*2.6, r*5.2, r*5.2, color + '05'),
  E(cx - r*1.8, cy - r*1.8, r*3.6, r*3.6, color + '0b'),
  E(cx - r,     cy - r,     r*2,   r*2,   color + '16'),
  E(cx - r*0.5, cy - r*0.5, r,     r,     color + '26'),
];

// ── Status dot ────────────────────────────────────────────────────────────────
const Dot = (x, y, color) => E(x, y, 8, 8, color);

// ── Pill badge ────────────────────────────────────────────────────────────────
const Pill = (x, y, label, color) => F(x, y, label.length * 6.4 + 20, 20, color + '22', {
  r: 10,
  ch: [T(label, 10, 3, label.length * 6.4, 14, { size: 9, fill: color, weight: 700, ls: 0.5 })],
});

// ── Score ring (arc visual) ───────────────────────────────────────────────────
const ScoreRing = (cx, cy, score, color) => {
  const rings = [];
  [76, 60, 46].forEach((r, i) => {
    rings.push(E(cx - r, cy - r, r*2, r*2, 'transparent', { stroke: color, sw: i === 0 ? 3 : 1, opacity: i === 0 ? 0.6 : 0.15 }));
  });
  rings.push(E(cx - 8, cy - 8, 16, 16, color + '30'));
  rings.push(E(cx - 5, cy - 5, 10, 10, color + '70'));
  return rings;
};

// ── Mini bar sparkline ────────────────────────────────────────────────────────
const Sparkline = (x, y, vals, color) => {
  const max = Math.max(...vals);
  return vals.map((v, i) =>
    F(x + i * 10, y + 24 - Math.round((v / max) * 20), 6, Math.round((v / max) * 20), color, { r: 2, opacity: 0.7 })
  );
};

// ── Nav bar ───────────────────────────────────────────────────────────────────
const NavBar = (activeIdx) => F(0, 764, 390, 80, P.surface, { ch: [
  Line(0, 0, 390, P.border),
  ...[['⬡', 'Overview', 0], ['◈', 'Fleet', 1], ['⚠', 'Threats', 2], ['⊙', 'Policy', 3]].map(([ic, lb, j]) => {
    const nx = 20 + j * 88;
    const isActive = j === activeIdx;
    return [
      isActive ? F(nx + 16, 6, 56, 52, P.accent + '1A', { r: 28 }) : null,
      T(ic, nx + 22, 12, 44, 22, { size: 20, fill: isActive ? P.accent : P.muted }),
      T(lb, nx + 6, 38, 76, 14, { size: 9, fill: isActive ? P.accent : P.muted, align: 'center', weight: isActive ? 700 : 400, ls: 0.5 }),
    ].filter(Boolean);
  }).flat(),
]});

// ── Status bar ────────────────────────────────────────────────────────────────
const StatusBar = () => [
  T('9:41', 20, 14, 60, 16, { size: 12, weight: 600, fill: P.fg }),
  T('▲ ◆ ▐▐', 296, 14, 74, 16, { size: 9, fill: P.muted, align: 'right' }),
];

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Overview Dashboard (Bento grid)
// ══════════════════════════════════════════════════════════════════════════════
function screenDashboard(ox) {
  const threats = [
    { time: '2m ago',  msg: 'PII exposure detected · Cursor agent', color: P.danger  },
    { time: '14m ago', msg: 'Unusual data access · Claude Code',     color: P.warning },
    { time: '1h ago',  msg: 'New MCP server connected · VSCode',     color: P.cyan    },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    // Deep glow orbs — Evervault aesthetic
    ...Glow(195, 180, 120, P.accent),
    ...Glow(320,  80,  60, P.violet),

    ...StatusBar(),

    // App title
    T('SENTRI', 20, 46, 200, 32, { size: 28, weight: 900, fill: P.fg, ls: 3 }),
    T('AI SECURITY COMMAND CENTER', 20, 80, 300, 14, { size: 9, fill: P.muted, ls: 2 }),
    Dot(316, 50, P.success),
    T('SECURE', 328, 47, 44, 14, { size: 8, fill: P.success, weight: 700, ls: 0.5 }),

    // ── BIG security score — Evervault editorial number ──────────────────────
    F(20, 108, 350, 120, P.surface, { r: 16, stroke: P.border, sw: 1, ch: [
      T('SECURITY SCORE', 16, 14, 220, 12, { size: 9, fill: P.muted, ls: 2 }),
      T('94', 16, 30, 100, 68, { size: 60, weight: 900, fill: P.accent, ls: -2 }),
      T('/100', 108, 72, 56, 22, { size: 18, fill: P.muted }),
      T('EXCELLENT', 170, 32, 140, 14, { size: 9, fill: P.success, weight: 800, ls: 2 }),
      T('↑ 3 pts from last week', 170, 50, 160, 14, { size: 10, fill: P.muted }),
      // mini score ring — right side
      ...ScoreRing(326, 60, 94, P.accent),
      F(292, 26, 68, 68, 'transparent', {}),
    ]}),

    // ── Bento metrics row ────────────────────────────────────────────────────
    // Active Agents
    F(20, 244, 166, 88, P.surface2, { r: 14, stroke: P.border, sw: 1, ch: [
      T('ACTIVE AGENTS', 14, 12, 140, 12, { size: 9, fill: P.muted, ls: 1 }),
      T('47', 14, 26, 80, 44, { size: 38, weight: 900, fill: P.cyan }),
      T('+4 today', 14, 68, 100, 14, { size: 9, fill: P.success }),
    ]}),
    // Threats blocked
    F(204, 244, 166, 88, P.surface2, { r: 14, stroke: P.danger + '44', sw: 1, ch: [
      T('THREATS BLOCKED', 14, 12, 140, 12, { size: 9, fill: P.muted, ls: 1 }),
      T('12', 14, 26, 80, 44, { size: 38, weight: 900, fill: P.danger }),
      T('↓ 3 from yesterday', 14, 68, 140, 14, { size: 9, fill: P.muted }),
    ]}),

    // ── Bento second row ─────────────────────────────────────────────────────
    // Data requests
    F(20, 340, 110, 72, P.surface2, { r: 14, stroke: P.border, sw: 1, ch: [
      T('DATA REQ', 12, 10, 88, 12, { size: 8, fill: P.muted, ls: 1 }),
      T('2,841', 12, 24, 86, 30, { size: 22, weight: 900, fill: P.fg }),
      T('/24h', 12, 54, 60, 12, { size: 8, fill: P.muted }),
    ]}),
    // PII masked
    F(138, 340, 110, 72, P.surface2, { r: 14, stroke: P.border, sw: 1, ch: [
      T('PII MASKED', 12, 10, 88, 12, { size: 8, fill: P.muted, ls: 1 }),
      T('394', 12, 24, 86, 30, { size: 22, weight: 900, fill: P.violet }),
      T('events', 12, 54, 60, 12, { size: 8, fill: P.muted }),
    ]}),
    // MCP servers
    F(256, 340, 114, 72, P.surface2, { r: 14, stroke: P.border, sw: 1, ch: [
      T('MCP SERVERS', 12, 10, 92, 12, { size: 8, fill: P.muted, ls: 1 }),
      T('23', 12, 24, 86, 30, { size: 22, weight: 900, fill: P.warning }),
      T('3 unvetted', 12, 54, 90, 12, { size: 8, fill: P.warning }),
    ]}),

    // ── Threat feed ──────────────────────────────────────────────────────────
    T('LIVE THREAT FEED', 20, 430, 240, 14, { size: 9, fill: P.muted, ls: 2 }),
    Pill(232, 428, 'LIVE', P.danger),
    ...threats.map((t, i) =>
      F(20, 450 + i * 64, 350, 56, P.surface, { r: 12, stroke: t.color + '33', sw: 1, ch: [
        Dot(14, 24, t.color),
        T(t.time, 28, 11, 60, 13, { size: 9, fill: P.muted }),
        T(t.msg, 28, 27, 270, 14, { size: 11, fill: P.fg, weight: 500 }),
        T('›', 326, 20, 12, 16, { size: 16, fill: P.muted }),
      ]}),
    ),

    // ── Activity sparkline ───────────────────────────────────────────────────
    T('ACTIVITY · 7D', 20, 648, 200, 14, { size: 9, fill: P.muted, ls: 2 }),
    F(20, 668, 350, 52, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
      ...Sparkline(14, 12, [22, 35, 28, 48, 40, 55, 47], P.accent),
      ...Sparkline(124, 12, [8, 5, 12, 9, 7, 11, 12], P.danger),
      T('Requests', 240, 20, 80, 12, { size: 9, fill: P.muted }),
      T('Threats', 240, 36, 80, 12, { size: 9, fill: P.danger, opacity: 0.7 }),
      Dot(232, 22, P.accent),
      Dot(232, 38, P.danger),
    ]}),

    NavBar(0),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Agent Fleet (list of running agents)
// ══════════════════════════════════════════════════════════════════════════════
function screenFleet(ox) {
  const agents = [
    { name: 'Cursor Agent',     client: 'cursor', trust: 'HIGH',    requests: 847,  status: 'active', color: P.success },
    { name: 'Claude Code',      client: 'claude', trust: 'HIGH',    requests: 1204, status: 'active', color: P.success },
    { name: 'VSCode Copilot',   client: 'vscode', trust: 'MEDIUM',  requests: 291,  status: 'active', color: P.warning },
    { name: 'GPT-4o Task',      client: 'oai',    trust: 'MEDIUM',  requests: 114,  status: 'idle',   color: P.muted   },
    { name: 'Warp AI',          client: 'warp',   trust: 'LOW',     requests: 37,   status: 'flagged',color: P.danger  },
    { name: 'Gemini CLI',       client: 'google', trust: 'MEDIUM',  requests: 88,   status: 'active', color: P.warning },
  ];

  const trustColor = { HIGH: P.success, MEDIUM: P.warning, LOW: P.danger };

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(80, 100, 80, P.cyan),
    ...Glow(320, 600, 60, P.violet),

    ...StatusBar(),

    T('AGENT FLEET', 20, 46, 280, 32, { size: 28, weight: 900, fill: P.fg, ls: 3 }),
    T('47 RUNNING · 6 MONITORED HERE', 20, 80, 300, 14, { size: 9, fill: P.muted, ls: 2 }),

    // Summary strip
    F(20, 104, 350, 56, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
      ...[
        ['ACTIVE', '41', P.success],
        ['IDLE',   '3',  P.muted  ],
        ['FLAGGED','3',  P.danger ],
      ].map(([label, val, color], i) => [
        T(val, 20 + i * 116, 10, 60, 28, { size: 22, weight: 900, fill: color }),
        T(label, 20 + i * 116, 40, 76, 12, { size: 8, fill: P.muted, ls: 1 }),
      ]).flat(),
    ]}),

    // Search bar
    F(20, 172, 350, 40, P.surface2, { r: 20, stroke: P.border, sw: 1, ch: [
      T('⌕', 16, 9, 22, 22, { size: 18, fill: P.muted }),
      T('Search agents, clients, permissions…', 42, 12, 290, 16, { size: 12, fill: P.muted, opacity: 0.5 }),
    ]}),

    // Agent list
    T('ALL AGENTS', 20, 226, 200, 14, { size: 9, fill: P.muted, ls: 2 }),
    ...agents.map((ag, i) =>
      F(20, 246 + i * 78, 350, 68, P.surface, { r: 14, stroke: ag.status === 'flagged' ? P.danger + '55' : P.border, sw: 1, ch: [
        // Status dot
        Dot(14, 30, ag.color),
        // Agent name
        T(ag.name, 30, 10, 210, 16, { size: 13, weight: 700, fill: P.fg }),
        T(ag.client.toUpperCase() + ' CLIENT', 30, 30, 160, 12, { size: 9, fill: P.muted, ls: 0.5 }),
        T(ag.requests.toLocaleString() + ' req', 30, 48, 100, 12, { size: 9, fill: P.muted }),
        // Trust badge
        Pill(248, 12, ag.trust + ' TRUST', trustColor[ag.trust]),
        // Status
        ag.status === 'flagged'
          ? Pill(248, 36, '⚠ FLAGGED', P.danger)
          : T(ag.status.toUpperCase(), 248, 38, 80, 12, { size: 9, fill: ag.color, ls: 0.5 }),
        T('›', 326, 24, 12, 20, { size: 16, fill: P.muted }),
      ]}),
    ),

    NavBar(1),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Threat Feed (security alerts)
// ══════════════════════════════════════════════════════════════════════════════
function screenThreats(ox) {
  const events = [
    {
      sev: 'CRITICAL', icon: '⛔', title: 'PII Exposed — Customer Emails',
      msg: 'Cursor agent read 47 customer email addresses from Postgres DB without masking filter.',
      time: '2 min ago', color: P.danger, agent: 'Cursor Agent'
    },
    {
      sev: 'HIGH', icon: '⚠', title: 'Anomalous Data Volume',
      msg: 'Claude Code pulled 2.1GB of code context in 4 min — 14× above baseline.',
      time: '14 min ago', color: P.warning, agent: 'Claude Code'
    },
    {
      sev: 'MEDIUM', icon: '⊙', title: 'Unvetted MCP Server',
      msg: 'VSCode connected to new MCP server "community-tools" — not in approved list.',
      time: '1 hr ago', color: P.cyan, agent: 'VSCode Copilot'
    },
    {
      sev: 'LOW', icon: '◎', title: 'Policy Override Attempt',
      msg: 'GPT-4o requested read access to /credentials — blocked by policy rule #14.',
      time: '3 hr ago', color: P.muted, agent: 'GPT-4o Task'
    },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(195, 140, 100, P.danger),
    ...Glow(50, 500, 50, P.violet),

    ...StatusBar(),

    T('THREAT FEED', 20, 46, 280, 32, { size: 28, weight: 900, fill: P.fg, ls: 3 }),
    T('12 BLOCKED TODAY · REAL-TIME MONITOR', 20, 80, 340, 14, { size: 9, fill: P.muted, ls: 2 }),

    // Filter tabs
    F(20, 104, 350, 36, P.surface, { r: 18, stroke: P.border, sw: 1, ch: [
      F(4, 4, 68, 28, P.accent, { r: 14, ch: [T('ALL', 0, 6, 68, 16, { size: 9, fill: '#fff', weight: 800, align: 'center', ls: 1 })] }),
      ...['CRITICAL', 'HIGH', 'MED'].map((lb, i) =>
        T(lb, 84 + i * 88, 10, 72, 16, { size: 9, fill: P.muted, ls: 1, align: 'center' })
      ),
    ]}),

    // Events
    T('RECENT EVENTS', 20, 156, 240, 14, { size: 9, fill: P.muted, ls: 2 }),
    ...events.map((ev, i) =>
      F(20, 176 + i * 142, 350, 130, P.surface, { r: 16, stroke: ev.color + '44', sw: 1, ch: [
        // Left severity bar
        F(0, 0, 4, 130, ev.color, { r: 2, opacity: 0.8 }),
        // Severity badge
        Pill(14, 14, ev.sev, ev.color),
        T(ev.time, 310, 17, 80, 12, { size: 9, fill: P.muted, align: 'right' }),
        // Title
        T(ev.title, 14, 36, 310, 16, { size: 13, weight: 700, fill: P.fg }),
        // Message
        T(ev.msg, 14, 56, 318, 42, { size: 10, fill: P.muted, lh: 1.6 }),
        // Agent tag
        Pill(14, 104, ev.agent, P.accent),
        // View button
        F(268, 100, 70, 22, ev.color + '22', { r: 11, ch: [
          T('VIEW ›', 0, 4, 70, 14, { size: 8, fill: ev.color, weight: 700, align: 'center', ls: 0.5 }),
        ]}),
      ]}),
    ),

    NavBar(2),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Agent Detail (Cursor Agent deep-dive)
// ══════════════════════════════════════════════════════════════════════════════
function screenAgentDetail(ox) {
  const perms = [
    { name: 'Read source code',      granted: true,  risk: 'LOW'  },
    { name: 'Write to filesystem',   granted: true,  risk: 'MED'  },
    { name: 'Query databases',       granted: true,  risk: 'HIGH' },
    { name: 'External API calls',    granted: false, risk: 'HIGH' },
    { name: 'Slack / Comms access',  granted: false, risk: 'HIGH' },
  ];
  const timeline = [
    { t: '09:42', action: 'Read file', detail: '/src/auth/tokens.ts',        color: P.success },
    { t: '09:41', action: 'DB query',  detail: 'SELECT * FROM users LIMIT 5', color: P.warning },
    { t: '09:38', action: 'Read file', detail: '/env/production.env',          color: P.danger  },
    { t: '09:32', action: 'Write',     detail: '/src/api/routes.ts',           color: P.success },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(195, 140, 90, P.accent),

    ...StatusBar(),

    // Back nav
    T('← FLEET', 20, 46, 90, 18, { size: 11, fill: P.accent, weight: 600 }),

    // Agent identity card
    F(20, 72, 350, 100, P.surface, { r: 16, stroke: P.border, sw: 1, ch: [
      // Avatar
      F(14, 18, 60, 60, P.accent + '22', { r: 14, ch: [
        T('⊛', 0, 8, 60, 44, { size: 28, fill: P.accent, align: 'center' }),
      ]}),
      T('Cursor Agent', 88, 14, 220, 18, { size: 15, weight: 800, fill: P.fg }),
      T('CURSOR CLIENT · SESSION #C-2847', 88, 36, 250, 12, { size: 8, fill: P.muted, ls: 0.5 }),
      Pill(88, 56, 'HIGH TRUST', P.success),
      Pill(196, 56, 'ACTIVE', P.cyan),
      T('847 req', 290, 56, 60, 14, { size: 10, fill: P.muted }),
    ]}),

    // Stats row
    ...[
      ['UPTIME', '7h 14m', P.fg],
      ['PII HIT', '2', P.danger],
      ['BLOCKED', '0', P.success],
    ].map(([label, val, color], i) =>
      F(20 + i * 116, 184, 108, 60, P.surface2, { r: 12, stroke: P.border, sw: 1, ch: [
        T(val, 14, 8, 80, 28, { size: 22, weight: 900, fill: color }),
        T(label, 14, 38, 80, 12, { size: 8, fill: P.muted, ls: 1 }),
      ]})
    ),

    // Permissions
    T('PERMISSIONS', 20, 258, 200, 14, { size: 9, fill: P.muted, ls: 2 }),
    ...perms.map((p, i) =>
      F(20, 278 + i * 50, 350, 42, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
        // toggle visual
        F(p.granted ? 294 : 284, 13, 18, 16, p.granted ? P.success : P.dim, { r: 8 }),
        F(p.granted ? 306 : 286, 16, 10, 10, '#fff', { r: 5 }),
        T(p.granted ? '●' : '○', 286, 11, 30, 20, { size: 16, fill: p.granted ? P.success : P.muted }),
        T(p.name, 14, 14, 220, 14, { size: 11, fill: p.granted ? P.fg : P.muted }),
        F(0, 0, 4, 42, p.risk === 'HIGH' ? P.danger : p.risk === 'MED' ? P.warning : P.success, { r: 2, opacity: 0.7 }),
      ]})
    ),

    // Activity timeline
    T('ACTIVITY LOG', 20, 540, 200, 14, { size: 9, fill: P.muted, ls: 2 }),
    ...timeline.map((ev, i) =>
      F(20, 560 + i * 46, 350, 38, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
        Dot(12, 15, ev.color),
        T(ev.t, 28, 12, 40, 14, { size: 9, fill: P.muted }),
        T(ev.action, 76, 4, 80, 14, { size: 10, fill: ev.color, weight: 700 }),
        T(ev.detail, 76, 20, 260, 14, { size: 9, fill: P.muted, opacity: 0.7 }),
      ]})
    ),

    NavBar(1),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Policy Control Center
// ══════════════════════════════════════════════════════════════════════════════
function screenPolicy(ox) {
  const policies = [
    { name: 'PII Auto-Masking',         desc: 'Mask emails, SSNs, API keys in all agent outputs', on: true,  color: P.success },
    { name: 'External API Block',       desc: 'Block calls to non-allowlisted external domains',  on: true,  color: P.success },
    { name: 'DB Read Limit',            desc: 'Cap database reads at 1,000 rows per session',     on: true,  color: P.success },
    { name: 'Credential File Block',    desc: 'Block agents reading .env and secret files',       on: true,  color: P.success },
    { name: 'Comms Channel Access',     desc: 'Allow agents to read Slack and email',             on: false, color: P.muted   },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(320, 180, 80, P.violet),
    ...Glow(60, 600, 60, P.accent),

    ...StatusBar(),

    T('POLICY', 20, 46, 280, 32, { size: 28, weight: 900, fill: P.fg, ls: 3 }),
    T('ACCESS CONTROL & TRUST RULES', 20, 80, 310, 14, { size: 9, fill: P.muted, ls: 2 }),

    // Trust level selector
    T('GLOBAL TRUST POSTURE', 20, 108, 240, 14, { size: 9, fill: P.muted, ls: 2 }),
    F(20, 126, 350, 64, P.surface, { r: 16, stroke: P.accent + '44', sw: 1, ch: [
      T('BALANCED', 16, 10, 120, 18, { size: 15, weight: 800, fill: P.accent }),
      T('Security & productivity in equilibrium.\nAdjust to STRICT for sensitive workloads.', 16, 32, 240, 28, { size: 9, fill: P.muted, lh: 1.5 }),
      // slider dots
      ...[P.success, P.warning, P.accent, P.danger].map((c, i) =>
        E(280 + i * 16, 26, 10, 10, c, { opacity: i === 2 ? 1 : 0.3 })
      ),
    ]}),

    // Policies
    T('ACTIVE POLICIES', 20, 204, 240, 14, { size: 9, fill: P.muted, ls: 2 }),
    T('5 RULES · 4 ACTIVE', 260, 204, 100, 14, { size: 9, fill: P.accent, align: 'right' }),
    ...policies.map((pol, i) =>
      F(20, 222 + i * 82, 350, 72, P.surface, { r: 14, stroke: pol.on ? pol.color + '22' : P.border, sw: 1, ch: [
        F(0, 0, 4, 72, pol.on ? pol.color : P.dim, { r: 2, opacity: 0.9 }),
        T(pol.name, 16, 12, 260, 16, { size: 12, weight: 700, fill: pol.on ? P.fg : P.muted }),
        T(pol.desc, 16, 32, 280, 28, { size: 9, fill: P.muted, lh: 1.5, opacity: pol.on ? 0.8 : 0.5 }),
        // Toggle
        F(296, 20, 42, 24, pol.on ? P.success + '33' : P.dim, { r: 12, stroke: pol.on ? P.success + '44' : P.border, sw: 1, ch: [
          E(pol.on ? 24 : 6, 4, 16, 16, pol.on ? P.success : P.muted, { opacity: pol.on ? 0.9 : 0.5 }),
        ]}),
      ]})
    ),

    // Add rule CTA
    F(20, 640, 350, 52, P.surface2, { r: 14, stroke: P.accent + '44', sw: 1, ch: [
      T('+ ADD POLICY RULE', 0, 16, 350, 20, { size: 12, weight: 700, fill: P.accent, align: 'center', ls: 1 }),
    ]}),

    // Audit log shortcut
    F(20, 702, 350, 46, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
      T('◎', 16, 10, 28, 26, { size: 20, fill: P.muted }),
      T('View Full Audit Log', 52, 14, 220, 18, { size: 12, fill: P.fg }),
      T('Last 30 days · 8,472 events', 52, 32, 220, 12, { size: 9, fill: P.muted }),
      T('›', 326, 14, 12, 18, { size: 16, fill: P.muted }),
    ]}),

    NavBar(3),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// ASSEMBLE & SAVE
// ══════════════════════════════════════════════════════════════════════════════
const SCREEN_W = 390;
const GAP      = 80;

const doc = {
  version: '2.8',
  name: 'SENTRI — AI Agent Security Platform',
  width:  5 * SCREEN_W + 6 * GAP,
  height: 844,
  fill:   '#000814',
  children: [
    screenDashboard  (GAP),
    screenFleet      (GAP + (SCREEN_W + GAP)),
    screenThreats    (GAP + (SCREEN_W + GAP) * 2),
    screenAgentDetail(GAP + (SCREEN_W + GAP) * 3),
    screenPolicy     (GAP + (SCREEN_W + GAP) * 4),
  ],
};

const outPath = path.join(__dirname, 'sentri.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log('✓ sentri.pen written —', Math.round(fs.statSync(outPath).size / 1024) + 'KB');
console.log('  5 screens: Dashboard · Fleet · Threats · Agent Detail · Policy');
console.log('  Palette: void navy #010314 · electric indigo #4361EE · violet #7B2FBE');
