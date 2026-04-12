'use strict';
// quanta-app.js
// QUANTA — AI Agent Orchestration Control Center
//
// Challenge: Design a dark-mode AI Agent monitoring dashboard inspired by:
// 1. Linear.app (darkmodedesign.com) — ultra-dark near-black #08090A bg,
//    surgical precision UI, white-on-void text, zero ornament — the new
//    gold standard for developer-tooling dark mode.
// 2. Evervault Customers page (godly.website) — cosmic glassmorphism,
//    glowing halos on dark cards, security-grade information density.
// 3. Awwwards nominees Mar 2026 — bento grid layouts with "data as design"
//    editorial hierarchy; MoMoney (fintech cards), Vast (data viz).
//
// Trend: "Linear aesthetic" spreading from PM tools to AI infrastructure —
// ultra-minimal dark UIs with precisely placed cyan/amber accent glows.
//
// Palette: Linear void #08090A + electric cyan #00D4FF + amber #F59E0B + rose #F43F5E
// Screens: 5 mobile (390x844)

const fs   = require('fs');
const path = require('path');

const P = {
  bg:       '#08090A',
  surface:  '#0F1114',
  surface2: '#141619',
  surface3: '#1A1D22',
  border:   '#212530',
  border2:  '#2C3040',
  muted:    '#4A5060',
  fg:       '#F0F2F5',
  fg2:      '#8892A4',
  fg3:      '#4A5568',
  cyan:     '#00D4FF',
  cyanDim:  '#001D26',
  amber:    '#F59E0B',
  amberDim: '#1F1500',
  rose:     '#F43F5E',
  roseDim:  '#1F0009',
  sage:     '#34D399',
  sageDim:  '#001A10',
  violet:   '#A78BFA',
};

let _id = 0;
const uid = () => `qt${++_id}`;

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

const Glow = (cx, cy, r, color) => [
  E(cx - r * 3.2, cy - r * 3.2, r * 6.4, r * 6.4, color + '04'),
  E(cx - r * 2.2, cy - r * 2.2, r * 4.4, r * 4.4, color + '08'),
  E(cx - r * 1.4, cy - r * 1.4, r * 2.8, r * 2.8, color + '12'),
  E(cx - r * 0.8, cy - r * 0.8, r * 1.6, r * 1.6, color + '1E'),
];

const Dot = (x, y, color, size = 7) => [
  E(x - 3, y - 3, size + 6, size + 6, color + '22'),
  E(x, y, size, size, color),
];

const Pill = (x, y, label, color) => {
  const w = label.length * 6.8 + 24;
  return F(x, y, w, 22, color + '18', { r: 11, ch: [
    ...Dot(8, 7, color, 6),
    T(label, 20, 4, w - 22, 14, { size: 10, fill: color, weight: 700, ls: 0.3 }),
  ]});
};

const ProgBar = (x, y, w, pct, color) => [
  F(x, y, w, 3, P.border, { r: 2 }),
  F(x, y, Math.max(3, Math.round(w * pct / 100)), 3, color, { r: 2, opacity: 0.9 }),
];

// ── Bottom nav ────────────────────────────────────────────────────────────────
const BottomNav = (active) => F(0, 764, 390, 80, P.surface, { ch: [
  Line(0, 0, 390, P.border),
  ...[['⬡','Hub',0],['◈','Agents',1],['≋','Queue',2],['⚑','Alerts',3],['⊞','Config',4]].map(([ic,lb,j]) => {
    const nx = 12 + j * 73;
    return [
      j === active ? F(nx + 12, 6, 48, 48, P.cyan + '14', { r: 24 }) : null,
      T(ic, nx + 14, 12, 44, 22, { size: 17, fill: j === active ? P.cyan : P.muted, align: 'center' }),
      T(lb, nx + 4, 38, 62, 12, { size: 9, fill: j === active ? P.cyan : P.muted, align: 'center', weight: j === active ? 700 : 400, ls: 0.2 }),
    ].filter(Boolean);
  }).flat(),
]});

const StatusBar = () => [
  T('9:41', 20, 16, 60, 16, { size: 12, weight: 600, fill: P.fg }),
  T('QUANTA', 155, 16, 80, 16, { size: 11, fill: P.muted, align: 'center', ls: 1.5 }),
  T('●●●', 316, 16, 54, 16, { size: 9, fill: P.muted }),
];

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Agent Hub
// ══════════════════════════════════════════════════════════════════════════════
function screenHub(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(195, 90, 130, P.cyan),
    ...StatusBar(),

    T('QUANTA', 20, 44, 220, 28, { size: 22, weight: 900, ls: 5, fill: P.fg }),
    T('Agent Control Center', 20, 74, 250, 14, { size: 11, fill: P.fg2 }),

    // health badge
    F(264, 48, 106, 34, P.sage + '14', { r: 17, stroke: P.sage + '30', sw: 1, ch: [
      ...Dot(12, 13, P.sage, 8),
      T('ALL NOMINAL', 26, 10, 78, 14, { size: 9, fill: P.sage, weight: 800, ls: 0.8 }),
    ]}),

    Line(20, 96, 350, P.border),
    T('ACTIVE AGENTS', 20, 112, 200, 12, { size: 9, fill: P.muted, ls: 2.5, weight: 700 }),
    T('4 of 6 running', 232, 112, 138, 12, { size: 9, fill: P.fg2, align: 'right' }),

    // Large featured agent card (ATLAS - busy)
    F(20, 132, 350, 130, P.surface2, { r: 14, stroke: P.cyan + '28', sw: 1, ch: [
      ...Glow(175, -10, 60, P.cyan),
      E(14, 14, 36, 36, P.cyan + '18'),
      E(20, 20, 24, 24, P.cyan + '30'),
      T('◈', 20, 20, 24, 24, { size: 13, fill: P.cyan, align: 'center', weight: 700 }),
      T('ATLAS', 58, 14, 200, 18, { size: 14, weight: 700, fill: P.fg }),
      T('Research Synthesis', 58, 34, 200, 13, { size: 10, fill: P.fg2 }),
      Pill(254, 14, 'RUNNING', P.cyan),
      Line(14, 60, 322, P.border),
      T('TASKS', 14, 72, 60, 10, { size: 8, fill: P.muted, ls: 1.5 }),
      T('47', 14, 84, 60, 20, { size: 18, weight: 800, fill: P.cyan }),
      VLine(78, 72, 36, P.border),
      T('CPU', 90, 72, 50, 10, { size: 8, fill: P.muted, ls: 1.5 }),
      T('73%', 90, 84, 60, 20, { size: 18, weight: 800, fill: P.fg }),
      VLine(154, 72, 36, P.border),
      T('MEM', 166, 72, 50, 10, { size: 8, fill: P.muted, ls: 1.5 }),
      T('512MB', 166, 84, 80, 20, { size: 18, weight: 800, fill: P.fg }),
      ...ProgBar(14, 118, 322, 73, P.cyan),
    ]}),

    // 2x2 small agent cards
    ...[
      ['ECHO', 'Content Writer', 'ONLINE', P.sage,   12, 28,  256, 20, 274, 168, 126],
      ['FLUX', 'Data Analyst',   'IDLE',   P.violet,  0,  8,  128, 202, 274, 168, 126],
      ['NOVA', 'Code Review',    'RUNNING', P.cyan,   8, 61, 384, 20, 410, 168, 126],
      ['VOID', 'API Gateway',    'CRITICAL',P.rose,   0,  0,   64, 202, 410, 168, 126],
    ].map(([name, role, status, color, tasks, cpu, mem, cx, cy, cw, ch]) => {
      const sc = color;
      return F(cx, cy, cw, ch, P.surface2, { r: 12, stroke: sc + '25', sw: 1, ch: [
        ...Glow(cw * 0.5, -8, 36, sc),
        E(12, 12, 28, 28, sc + '18'),
        E(16, 16, 20, 20, sc + '28'),
        T('◈', 16, 16, 20, 20, { size: 10, fill: sc, align: 'center' }),
        T(name, 46, 12, cw - 58, 16, { size: 12, weight: 700, fill: P.fg }),
        T(role, 46, 30, cw - 58, 12, { size: 9, fill: P.fg2 }),
        Pill(10, 52, status, sc),
        Line(10, 78, cw - 20, P.border),
        T('CPU', 10, 88, 50, 10, { size: 8, fill: P.muted, ls: 1 }),
        T(cpu + '%', 10, 100, 60, 16, { size: 15, weight: 800, fill: sc }),
        VLine(cw * 0.5, 86, 38, P.border),
        T('MEM', cw * 0.5 + 8, 88, 60, 10, { size: 8, fill: P.muted, ls: 1 }),
        T(mem + 'MB', cw * 0.5 + 8, 100, 60, 16, { size: 15, weight: 800, fill: P.fg }),
      ]});
    }),

    // global stats row
    F(20, 548, 350, 68, P.surface2, { r: 14, stroke: P.border, sw: 1, ch: [
      VLine(88, 10, 48, P.border),
      VLine(176, 10, 48, P.border),
      VLine(264, 10, 48, P.border),
      T('TASKS/HR', 12, 8, 72, 10, { size: 8, fill: P.muted, ls: 1 }),
      T('1,284', 12, 22, 72, 24, { size: 20, weight: 800, fill: P.cyan }),
      T('UPTIME', 100, 8, 72, 10, { size: 8, fill: P.muted, ls: 1 }),
      T('99.97%', 100, 22, 72, 24, { size: 18, weight: 800, fill: P.sage }),
      T('ALERTS', 188, 8, 72, 10, { size: 8, fill: P.muted, ls: 1 }),
      T('3', 188, 22, 72, 24, { size: 20, weight: 800, fill: P.rose }),
      T('AVG LAT', 276, 8, 72, 10, { size: 8, fill: P.muted, ls: 1 }),
      T('142ms', 276, 22, 72, 24, { size: 20, weight: 800, fill: P.amber }),
    ]}),

    // incident banner
    F(20, 630, 350, 50, P.rose + '12', { r: 12, stroke: P.rose + '30', sw: 1, ch: [
      ...Dot(14, 21, P.rose, 8),
      T('CRITICAL: VOID agent unreachable · 3 retries', 30, 9, 290, 14, { size: 10, fill: P.rose, weight: 700 }),
      T('Auto-failover triggered · 2 min ago', 30, 27, 290, 13, { size: 9, fill: P.rose, opacity: 0.7 }),
      T('›', 332, 14, 18, 22, { size: 14, fill: P.rose, align: 'center' }),
    ]}),

    // activity list
    T('RECENT', 20, 694, 200, 12, { size: 9, fill: P.muted, ls: 2.5 }),
    ...[
      ['ATLAS completed synthesis · Task #2,047', P.cyan, '12s'],
      ['ECHO published 3 articles · Queue cleared', P.sage, '1m'],
      ['NOVA flagged PR #441 · 2 issues', P.amber, '4m'],
    ].map(([msg, color, ago], i) => F(20, 712 + i * 14, 350, 12, P.bg, { ch: [
      F(0, 4, 4, 4, color, { r: 2 }),
      T(msg, 10, 0, 296, 12, { size: 9, fill: P.fg2 }),
      T(ago, 318, 0, 32, 12, { size: 9, fill: P.muted, align: 'right' }),
    ]})),

    BottomNav(0),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Agent Detail (ATLAS)
// ══════════════════════════════════════════════════════════════════════════════
function screenAgent(ox) {
  const taskLog = [
    { id: '2047', name: 'Synthesise Q1 market research report', status: 'done',    dur: '4m 12s', color: P.sage   },
    { id: '2048', name: 'Cross-reference 47 source documents',  status: 'running', dur: '1m 38s', color: P.cyan   },
    { id: '2049', name: 'Generate executive summary draft',      status: 'queued',  dur: '—',      color: P.violet },
    { id: '2050', name: 'Fact-check citations via web search',   status: 'queued',  dur: '—',      color: P.violet },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(300, 80, 90, P.cyan),
    ...StatusBar(),

    F(20, 44, 44, 32, P.surface2, { r: 8, stroke: P.border, sw: 1, ch: [
      T('←', 4, 6, 36, 20, { size: 14, fill: P.fg2, align: 'center' }),
    ]}),
    T('ATLAS', 76, 44, 220, 24, { size: 20, weight: 900, ls: 4, fill: P.fg }),
    T('Research Synthesis Agent', 76, 70, 250, 14, { size: 11, fill: P.fg2 }),
    Pill(272, 47, 'RUNNING', P.cyan),

    Line(20, 96, 350, P.border),

    // Live metrics
    F(20, 108, 350, 80, P.surface2, { r: 14, stroke: P.cyan + '22', sw: 1, ch: [
      ...Glow(175, -10, 50, P.cyan),
      VLine(88, 10, 60, P.border),
      VLine(176, 10, 60, P.border),
      VLine(264, 10, 60, P.border),
      T('CPU', 12, 8, 66, 10, { size: 8, fill: P.muted, ls: 1.5 }),
      T('73%', 12, 22, 66, 26, { size: 22, weight: 800, fill: P.cyan }),
      ...ProgBar(12, 64, 64, 73, P.cyan),
      T('MEMORY', 100, 8, 68, 10, { size: 8, fill: P.muted, ls: 1.5 }),
      T('512MB', 100, 22, 68, 26, { size: 18, weight: 800, fill: P.fg }),
      ...ProgBar(100, 64, 64, 50, P.fg2),
      T('TASKS', 188, 8, 68, 10, { size: 8, fill: P.muted, ls: 1.5 }),
      T('47', 188, 22, 68, 26, { size: 22, weight: 800, fill: P.sage }),
      T('done today', 188, 52, 68, 10, { size: 8, fill: P.muted }),
      T('AVG TIME', 276, 8, 68, 10, { size: 8, fill: P.muted, ls: 1.5 }),
      T('3.8m', 276, 22, 68, 26, { size: 22, weight: 800, fill: P.amber }),
    ]}),

    T('TASK LOG', 20, 204, 200, 12, { size: 9, fill: P.muted, ls: 2.5 }),
    T('Task #2,048 active', 220, 204, 150, 12, { size: 9, fill: P.cyan, align: 'right', weight: 600 }),

    ...taskLog.map((t, i) => F(20, 222 + i * 76, 350, 68, P.surface2, {
      r: 12,
      stroke: t.status === 'running' ? P.cyan + '35' : P.border,
      sw: 1,
      ch: [
        F(0, 0, 3, 68, t.color, { r: 12, opacity: t.status === 'queued' ? 0.25 : 0.85 }),
        t.status === 'done'    ? T('✓', 14, 23, 22, 22, { size: 12, fill: P.sage, align: 'center', weight: 700 }) :
        t.status === 'running' ? T('◉', 14, 23, 22, 22, { size: 12, fill: P.cyan, align: 'center' }) :
                                 T('○', 14, 23, 22, 22, { size: 12, fill: P.muted, align: 'center' }),
        T('#' + t.id, 42, 9, 50, 12, { size: 9, fill: P.muted }),
        T(t.name, 42, 25, 244, 15, { size: 12, weight: t.status === 'running' ? 700 : 400, fill: t.status === 'queued' ? P.fg2 : P.fg }),
        T(t.status === 'running' ? '● IN PROGRESS' : t.status === 'done' ? '✓ COMPLETE' : '○ QUEUED',
          42, 46, 160, 12, { size: 9, fill: t.color, ls: 0.5, weight: 600 }),
        T(t.dur, 298, 25, 46, 14, { size: 11, fill: t.status === 'running' ? P.cyan : P.muted, align: 'right' }),
      ],
    })),

    // throughput chart
    T('THROUGHPUT · LAST 24H', 20, 532, 250, 12, { size: 9, fill: P.muted, ls: 2.5 }),
    F(20, 550, 350, 70, P.surface2, { r: 12, stroke: P.border, sw: 1, ch: [
      ...[18,22,15,31,44,52,47,38,41,60,73,67,54,48,56,62,70,65,48,55,66,72,47,73].map((v, i) => {
        const bh = Math.round((v / 73) * 50);
        return F(10 + i * 14, 54 - bh, 10, bh, i === 23 ? P.cyan : P.cyan + '40', { r: 2 });
      }),
    ]}),

    // model badge
    F(20, 634, 350, 52, P.surface2, { r: 12, stroke: P.border, sw: 1, ch: [
      T('MODEL', 14, 10, 60, 11, { size: 8, fill: P.muted, ls: 1.5 }),
      T('claude-3-7-sonnet · Extended Thinking', 14, 26, 250, 15, { size: 12, fill: P.cyan, weight: 600 }),
      VLine(274, 8, 36, P.border),
      T('CTX', 286, 10, 50, 11, { size: 8, fill: P.muted, ls: 1.5 }),
      T('187K', 286, 26, 50, 15, { size: 12, fill: P.fg, weight: 700 }),
    ]}),

    F(20, 700, 168, 46, P.cyan, { r: 12, ch: [
      T('PAUSE AGENT', 0, 13, 168, 20, { size: 11, weight: 800, fill: P.bg, align: 'center', ls: 1 }),
    ]}),
    F(202, 700, 168, 46, P.surface3, { r: 12, stroke: P.border, sw: 1, ch: [
      T('VIEW LOGS', 0, 13, 168, 20, { size: 11, weight: 700, fill: P.fg2, align: 'center', ls: 1 }),
    ]}),

    BottomNav(1),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Task Queue
// ══════════════════════════════════════════════════════════════════════════════
function screenQueue(ox) {
  const runningTasks = [
    { id: '2048', agent: 'ATLAS', name: 'Cross-reference 47 source documents',  prio: 'HIGH', eta: '1m',  color: P.cyan  },
    { id: '2051', agent: 'NOVA',  name: 'Review PR #442 for security issues',   prio: 'HIGH', eta: '3m',  color: P.cyan  },
    { id: '2052', agent: 'ECHO',  name: 'Draft product changelog v2.4.0',       prio: 'MED',  eta: '6m',  color: P.amber },
  ];
  const pendingTasks = [
    { id: '2049', name: 'Generate executive summary draft',    prio: 'MED',  color: P.violet },
    { id: '2053', name: 'Translate docs to Spanish + French',  prio: 'LOW',  color: P.violet },
    { id: '2054', name: 'Summarise 30 user interviews',        prio: 'LOW',  color: P.violet },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(100, 90, 100, P.violet),
    ...StatusBar(),

    T('QUEUE', 20, 44, 220, 28, { size: 22, weight: 900, ls: 5, fill: P.fg }),
    T('Task orchestration layer', 20, 74, 250, 14, { size: 11, fill: P.fg2 }),
    F(308, 48, 62, 30, P.surface2, { r: 10, stroke: P.border, sw: 1, ch: [
      T('9', 0, 4, 62, 22, { size: 18, weight: 900, fill: P.violet, align: 'center' }),
    ]}),

    Line(20, 96, 350, P.border),
    T('RUNNING  ·  3', 20, 112, 200, 12, { size: 9, fill: P.cyan, ls: 2.5, weight: 700 }),

    ...runningTasks.map((t, i) => F(20, 130 + i * 80, 350, 72, P.surface2, {
      r: 12, stroke: P.cyan + '25', sw: 1,
      ch: [
        F(0, 0, 3, 72, P.cyan, { r: 12, opacity: 0.85 }),
        F(14, 10, t.prio.length * 7 + 14, 20, t.color + '18', { r: 10, ch: [
          T(t.prio, 7, 4, t.prio.length * 7, 12, { size: 8, fill: t.color, weight: 700, ls: 0.5 }),
        ]}),
        T('#' + t.id, 14 + t.prio.length * 7 + 20, 12, 60, 13, { size: 9, fill: P.muted }),
        T(t.name, 14, 36, 280, 15, { size: 12, fill: P.fg, weight: 600 }),
        T('→ ' + t.agent, 14, 55, 100, 11, { size: 9, fill: P.cyan, weight: 700 }),
        T('ETA ' + t.eta, 294, 55, 44, 11, { size: 9, fill: P.fg2, align: 'right' }),
        ...Dot(338, 22, P.cyan, 6),
      ],
    })),

    T('PENDING  ·  6', 20, 376, 200, 12, { size: 9, fill: P.muted, ls: 2.5, weight: 700 }),
    T('Awaiting agent', 240, 376, 130, 12, { size: 9, fill: P.fg3, align: 'right' }),

    ...pendingTasks.map((t, i) => F(20, 394 + i * 62, 350, 54, P.surface, {
      r: 10, stroke: P.border, sw: 1,
      ch: [
        F(0, 0, 3, 54, P.violet, { r: 10, opacity: 0.35 }),
        F(14, 8, t.prio.length * 7 + 14, 18, P.violet + '18', { r: 9, ch: [
          T(t.prio, 7, 3, t.prio.length * 7, 12, { size: 8, fill: P.violet, weight: 700, ls: 0.5 }),
        ]}),
        T('#' + t.id, 14 + t.prio.length * 7 + 20, 10, 60, 13, { size: 9, fill: P.muted }),
        T(t.name, 14, 28, 296, 14, { size: 11, fill: P.fg2 }),
        T('Unassigned', 14, 42, 100, 11, { size: 8, fill: P.muted }),
      ],
    })),

    F(20, 586, 350, 48, P.surface2, { r: 12, stroke: P.border2, sw: 1, ch: [
      T('+ DISPATCH NEW TASK', 0, 14, 350, 20, { size: 11, weight: 700, fill: P.fg2, align: 'center', ls: 2 }),
    ]}),

    BottomNav(2),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Alerts / Incident Log
// ══════════════════════════════════════════════════════════════════════════════
function screenAlerts(ox) {
  const alerts = [
    { sev: 'CRITICAL', agent: 'VOID',  title: 'Agent unreachable — 3 retries failed',      body: 'Health check failed. No response to ping for 4m 12s. Failover triggered.',          color: P.rose,  time: '2m ago'  },
    { sev: 'WARNING',  agent: 'NOVA',  title: 'Context window at 89% capacity',             body: 'Task #2,051 consuming 189K tokens. Consider splitting task into sub-tasks.',       color: P.amber, time: '7m ago'  },
    { sev: 'WARNING',  agent: 'FLUX',  title: 'Idle timeout approaching in 2 min',          body: 'FLUX has been idle 28 minutes. Auto-suspend will free allocated compute.',         color: P.amber, time: '28m ago' },
    { sev: 'INFO',     agent: 'ATLAS', title: 'API rate limit headroom at 34%',             body: 'Quota usage elevated. Throughput may throttle in ~45 minutes at current pace.',   color: P.cyan,  time: '1h ago'  },
    { sev: 'INFO',     agent: 'ECHO',  title: 'Queue depth normalised after spike',         body: '14 pending tasks cleared. All items within SLA threshold.',                       color: P.sage,  time: '2h ago'  },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(80, 160, 100, P.rose),
    ...StatusBar(),

    T('ALERTS', 20, 44, 200, 28, { size: 22, weight: 900, ls: 5, fill: P.fg }),
    T('Incident log', 20, 74, 200, 14, { size: 11, fill: P.fg2 }),

    // filter chips
    ...[['ALL', P.fg, true], ['CRIT', P.rose, false], ['WARN', P.amber, false], ['INFO', P.cyan, false]].map(([lbl, col, active], i) =>
      F(270 + i * 0, 48 + i * 0, 0, 0, P.bg, { ch: [] }) // placeholder positioning below
    ),
    ...[['ALL', P.fg, true], ['CRIT', P.rose, false], ['WARN', P.amber, false], ['INFO', P.cyan, false]].map(([lbl, col, active], i) =>
      F(270 + i * 0, 0, 0, 0, P.bg, { ch: [] })
    ),

    // Real filter row
    F(20, 50, 345, 26, P.bg, { ch: [
      ...[['ALL', P.fg, true], ['CRITICAL', P.rose, false], ['WARNING', P.amber, false], ['INFO', P.cyan, false]].map(([lbl, col, active], i) =>
        F(i === 0 ? 0 : i === 1 ? 36 : i === 2 ? 114 : 198, 0, lbl.length * 7 + 14, 26, active ? col + '20' : P.surface2, {
          r: 13, stroke: active ? col + '40' : P.border, sw: 1,
          ch: [T(lbl, 0, 6, lbl.length * 7 + 14, 14, { size: 9, fill: active ? col : P.fg2, align: 'center', weight: active ? 700 : 400, ls: 0.4 })],
        })
      ),
    ]}),

    Line(20, 96, 350, P.border),

    F(20, 104, 350, 28, P.rose + '10', { r: 8, stroke: P.rose + '20', sw: 1, ch: [
      T('⚑  1 CRITICAL  ·  2 WARNINGS  ·  2 INFO  ·  Last updated 30s ago', 14, 8, 324, 12, { size: 9, fill: P.rose }),
    ]}),

    ...alerts.map((a, i) => F(20, 142 + i * 114, 350, 106, P.surface2, {
      r: 12, stroke: a.color + (a.sev === 'CRITICAL' ? '40' : '1A'), sw: 1,
      ch: [
        F(0, 0, 3, 106, a.color, { r: 12, opacity: a.sev === 'CRITICAL' ? 1 : a.sev === 'WARNING' ? 0.6 : 0.35 }),
        F(14, 10, a.sev.length * 7 + 14, 20, a.color + '20', { r: 10, ch: [
          T(a.sev, 7, 4, a.sev.length * 7, 12, { size: 8, fill: a.color, weight: 700, ls: 0.4 }),
        ]}),
        T(a.agent, 14 + a.sev.length * 7 + 20, 12, 60, 15, { size: 10, fill: P.fg2, weight: 700, ls: 1 }),
        T(a.time, 308, 12, 34, 14, { size: 9, fill: P.muted, align: 'right' }),
        T(a.title, 14, 38, 322, 16, { size: 12, weight: 700, fill: a.sev === 'CRITICAL' ? a.color : P.fg }),
        T(a.body, 14, 58, 322, 32, { size: 10, fill: P.fg2, lh: 1.6 }),
        T(a.sev === 'CRITICAL' ? 'VIEW AGENT →' : 'DISMISS →', 14, 90, 150, 12, { size: 9, fill: a.color, weight: 700, ls: 0.5 }),
      ],
    })),

    BottomNav(3),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Config
// ══════════════════════════════════════════════════════════════════════════════
function screenConfig(ox) {
  const perms = [
    ['Web search & browsing',    true],
    ['File system read',         true],
    ['File system write',        false],
    ['Code execution (sandbox)', true],
    ['API calls (external)',     true],
    ['Email / messaging',        false],
    ['Database write access',    false],
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(340, 100, 80, P.cyan),
    ...StatusBar(),

    F(20, 44, 44, 32, P.surface2, { r: 8, stroke: P.border, sw: 1, ch: [
      T('←', 4, 6, 36, 20, { size: 14, fill: P.fg2, align: 'center' }),
    ]}),
    T('CONFIG', 76, 44, 240, 28, { size: 22, weight: 900, ls: 5, fill: P.fg }),
    T('ATLAS · Research Synthesis', 76, 74, 250, 14, { size: 11, fill: P.fg2 }),

    Line(20, 96, 350, P.border),

    // Model
    T('FOUNDATION MODEL', 20, 112, 250, 12, { size: 9, fill: P.muted, ls: 2.5 }),
    F(20, 130, 350, 54, P.surface2, { r: 12, stroke: P.cyan + '30', sw: 1, ch: [
      T('claude-3-7-sonnet-20250219', 14, 10, 262, 16, { size: 13, fill: P.cyan, weight: 700 }),
      T('Anthropic  ·  200K context  ·  Extended thinking enabled', 14, 32, 298, 13, { size: 10, fill: P.fg2 }),
      T('›', 334, 15, 14, 24, { size: 14, fill: P.fg2, align: 'center' }),
    ]}),

    // System prompt
    T('SYSTEM PROMPT', 20, 200, 250, 12, { size: 9, fill: P.muted, ls: 2.5 }),
    F(20, 218, 350, 78, P.surface2, { r: 12, stroke: P.border, sw: 1, ch: [
      T('You are ATLAS, a research synthesis agent. Your role is to gather, cross-reference, and synthesise information from multiple sources into clear, structured reports for decision-makers...', 14, 12, 322, 54, { size: 10, fill: P.fg2, lh: 1.6 }),
    ]}),

    // Permissions
    T('PERMISSIONS', 20, 312, 250, 12, { size: 9, fill: P.muted, ls: 2.5 }),
    ...perms.map(([label, enabled], i) =>
      F(20, 330 + i * 40, 350, 32, P.surface, { r: 8, stroke: P.border, sw: 1, ch: [
        T(label, 14, 8, 270, 16, { size: 11, fill: enabled ? P.fg : P.fg2 }),
        // toggle
        F(306, 8, 30, 16, enabled ? P.cyan : P.surface3, { r: 8, stroke: enabled ? 'transparent' : P.border, sw: 1, ch: [
          E(enabled ? 16 : 2, 2, 12, 12, enabled ? P.bg : P.muted),
        ]}),
      ]})
    ),

    // Rate limits
    T('RATE LIMITS', 20, 620, 250, 12, { size: 9, fill: P.muted, ls: 2.5 }),
    F(20, 638, 350, 54, P.surface2, { r: 12, stroke: P.border, sw: 1, ch: [
      VLine(116, 10, 34, P.border),
      VLine(232, 10, 34, P.border),
      T('MAX TASKS', 12, 8, 92, 11, { size: 8, fill: P.muted, ls: 1 }),
      T('100/hr', 12, 24, 92, 18, { size: 16, weight: 700, fill: P.fg }),
      T('CONTEXT', 128, 8, 92, 11, { size: 8, fill: P.muted, ls: 1 }),
      T('200K', 128, 24, 92, 18, { size: 16, weight: 700, fill: P.cyan }),
      T('TIMEOUT', 244, 8, 92, 11, { size: 8, fill: P.muted, ls: 1 }),
      T('30 min', 244, 24, 92, 18, { size: 16, weight: 700, fill: P.amber }),
    ]}),

    // Save
    F(20, 710, 350, 46, P.cyan, { r: 12, ch: [
      T('SAVE CONFIGURATION', 0, 13, 350, 20, { size: 12, weight: 800, fill: P.bg, align: 'center', ls: 2 }),
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
  name: 'QUANTA — AI Agent Orchestration Control Center',
  width:  5 * SCREEN_W + 6 * GAP,
  height: 844,
  fill:   '#050607',
  children: [
    screenHub   (GAP),
    screenAgent (GAP + (SCREEN_W + GAP)),
    screenQueue (GAP + (SCREEN_W + GAP) * 2),
    screenAlerts(GAP + (SCREEN_W + GAP) * 3),
    screenConfig(GAP + (SCREEN_W + GAP) * 4),
  ],
};

const outPath = path.join(__dirname, 'quanta.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log('✓ quanta.pen written —', Math.round(fs.statSync(outPath).size / 1024) + 'KB');
console.log('  5 screens: Hub · Agent Detail · Queue · Alerts · Config');
console.log('  Palette: Linear void #08090A · electric cyan #00D4FF · amber #F59E0B · rose #F43F5E');
