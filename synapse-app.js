'use strict';
// synapse-app.js
// SYNAPSE — AI Agent Workflow Orchestration Platform
//
// Challenge: Design a dark-mode AI Agent Workflow Designer & Monitor inspired by:
// 1. Linear.app (from darkmodedesign.com) — near-black bg #08090A, indigo
//    accent #5E6AD2, Inter Variable, systematic product-development UI
// 2. Locomotive.ca (from godly.website) — oversized editorial wordmarks at 70px,
//    tight tracking, high-contrast black/white typographic hierarchy
// 3. LangChain landing page (from land-book.com) — AI agent pipeline visualization,
//    observability framing, "connect your AI agents" mental model
//
// Palette: Linear near-black + electric indigo + vivid green/amber status system
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

// ── Palette (Linear-inspired, AI-enhanced) ────────────────────────────────────
const P = {
  bg:       '#08090A',   // Linear near-black
  surface:  '#111214',   // elevated card surface
  surface2: '#18191C',   // deeper card
  surface3: '#1E1F23',   // subtle elevation
  border:   '#25262B',   // soft border
  border2:  '#2E3038',   // medium border
  muted:    '#4A4D57',   // muted text
  muted2:   '#6B6E7C',   // lighter muted
  fg:       '#F7F8F8',   // Linear near-white
  accent:   '#5E6AD2',   // Linear indigo (primary)
  accent2:  '#7C83DD',   // lighter indigo
  green:    '#4CC38A',   // success / running
  amber:    '#E9A23B',   // warning / pending
  red:      '#EF5656',   // danger / failed
  violet:   '#9C6FE4',   // AI model indicator
  cyan:     '#2ABFDA',   // data/stream indicator
  dim:      '#1A1B1F',   // darkened surface
};

let _id = 0;
const uid = () => `sy${++_id}`;

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

// ── Ambient glow ──────────────────────────────────────────────────────────────
const Glow = (cx, cy, r, color) => [
  E(cx - r*2.2, cy - r*2.2, r*4.4, r*4.4, color + '05'),
  E(cx - r*1.5, cy - r*1.5, r*3.0, r*3.0, color + '0C'),
  E(cx - r,     cy - r,     r*2,   r*2,   color + '15'),
  E(cx - r*0.5, cy - r*0.5, r,     r,     color + '22'),
];

// ── Status dot ────────────────────────────────────────────────────────────────
const StatusDot = (x, y, color) => [
  E(x - 4, y - 4, 12, 12, color + '30'),
  E(x, y, 6, 6, color),
];

// ── Pill badge ────────────────────────────────────────────────────────────────
const Pill = (x, y, label, color) => {
  const w = Math.max(label.length * 6.4 + 20, 40);
  return F(x, y, w, 20, color + '22', {
    r: 10,
    ch: [T(label, 0, 4, w, 12, { size: 9, fill: color, weight: 700, ls: 0.5, align: 'center' })],
  });
};

// ── Metric bento card ─────────────────────────────────────────────────────────
const MetricCard = (x, y, w, h, label, value, sub, color, sparkData) => {
  const ch = [
    T(label.toUpperCase(), 14, 12, w - 28, 11, { size: 8, fill: P.muted, ls: 1.5, weight: 700 }),
    T(value, 14, 26, w - 28, 36, { size: 28, fill: color, weight: 800, ls: -1 }),
    T(sub, 14, 62, w - 28, 13, { size: 10, fill: P.muted2 }),
  ];
  if (sparkData) {
    const maxV = Math.max(...sparkData);
    sparkData.forEach((v, i) => {
      const bh = Math.max(Math.round((v / maxV) * 18), 2);
      const isLast = i === sparkData.length - 1;
      ch.push(F(w - 64 + i * 9, h - 10 - bh, 6, bh, isLast ? color : color + '44', { r: 2 }));
    });
  }
  return F(x, y, w, h, P.surface, { r: 14, stroke: P.border, sw: 1, ch });
};

// ── Bottom nav ────────────────────────────────────────────────────────────────
const BottomNav = (active) => F(0, 780, 390, 64, P.surface, {
  ch: [
    Line(0, 0, 390, P.border),
    ...[['⬡', 'Overview', 0], ['◈', 'Workflows', 1], ['◉', 'Monitor', 2], ['⊛', 'Agents', 3]].map(([ic, lb, j]) => {
      const nx = 10 + j * 93;
      return [
        j === active ? F(nx + 16, 6, 60, 44, P.accent + '18', { r: 22 }) : null,
        T(ic, nx + 20, 10, 52, 22, { size: 16, fill: j === active ? P.accent : P.muted, align: 'center' }),
        T(lb, nx + 4, 36, 84, 12, { size: 8, fill: j === active ? P.accent : P.muted, align: 'center', weight: j === active ? 700 : 400, ls: 0.2 }),
      ].filter(Boolean);
    }).flat(),
  ],
});

// ── Status bar ────────────────────────────────────────────────────────────────
const StatusBar = () => [
  T('9:41', 20, 14, 60, 16, { size: 12, weight: 600, fill: P.fg }),
  T('●●●●', 310, 14, 60, 16, { size: 8, fill: P.muted }),
];

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Dashboard (Bento Overview)
// ══════════════════════════════════════════════════════════════════════════════
function screenDashboard(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(340, 90, 90, P.accent),
    ...Glow(50, 620, 60, P.green),

    ...StatusBar(),

    // Editorial wordmark — Locomotive influence: bold, large, tracked
    T('SYNAPSE', 20, 44, 320, 36, { size: 30, weight: 900, ls: 5, fill: P.fg }),
    Pill(310, 52, 'LIVE', P.green),
    T('AI Workflow Orchestrator', 20, 84, 280, 16, { size: 12, fill: P.muted2, weight: 300 }),

    // Full-width system health
    F(20, 110, 350, 82, P.surface, {
      r: 16, stroke: P.border, sw: 1,
      ch: [
        ...Glow(310, 42, 42, P.green),
        T('SYSTEM HEALTH', 16, 12, 200, 11, { size: 8, fill: P.muted, ls: 2, weight: 700 }),
        T('98.4%', 16, 26, 130, 34, { size: 30, weight: 900, fill: P.green, ls: -1 }),
        T('All 12 pipelines nominal', 16, 62, 210, 13, { size: 10, fill: P.muted2 }),
        // mini sparkline
        ...([0.4,0.7,0.5,0.9,0.6,1,0.9,1].map((v, i) => F(228 + i * 14, 46 - Math.round(v * 24), 10, Math.round(v * 24), v >= 1 ? P.green : P.green + '44', { r: 2 }))),
      ],
    }),

    // 2×2 bento grid
    MetricCard(20,  204, 166, 98, 'Active Runs', '24', '+3 last hour',      P.accent, [4,7,5,9,6,11,8,12]),
    MetricCard(204, 204, 166, 98, 'Agents Live',  '47', '12 models online',  P.violet, [8,9,10,9,11,10,12,11]),
    MetricCard(20,  314, 166, 98, 'Success Rate', '94%','last 24h',          P.green,  [88,91,93,90,95,94,96,94]),
    MetricCard(204, 314, 166, 98, 'Avg Latency',  '1.2s','↓ 0.3s vs yday',  P.amber,  [21,18,16,19,15,14,12,12]),

    // Recent runs
    T('RECENT RUNS', 20, 426, 200, 12, { size: 8, fill: P.muted, ls: 2, weight: 700 }),
    T('See all →', 308, 426, 62, 12, { size: 10, fill: P.accent, align: 'right' }),

    ...[
      ['Customer Support Bot', '4 steps · 1m 12s', 'running', P.accent],
      ['Data Enrichment Flow', '6 steps · 42s',    'done',    P.green ],
      ['Competitor Analysis',  '5 steps · 2m 08s', 'failed',  P.red   ],
      ['Content Generation',   '3 steps · 18s',    'done',    P.green ],
    ].map(([name, meta, status, color], i) => {
      const sc = status === 'running' ? P.accent : status === 'done' ? P.green : P.red;
      return F(20, 448 + i * 70, 350, 60, P.surface, {
        r: 12, stroke: status === 'failed' ? P.red + '33' : P.border, sw: 1,
        ch: [
          F(0, 10, 3, 40, color, { r: 2 }),
          E(14, 18, 24, 24, color + '20'),
          T(status === 'running' ? '◉' : status === 'done' ? '✓' : '✕', 14, 20, 24, 20, { size: 11, fill: color, align: 'center' }),
          T(name, 46, 12, 220, 14, { size: 12, weight: 700, fill: P.fg }),
          T(meta, 46, 30, 200, 13, { size: 10, fill: P.muted2 }),
          Pill(276, 18, status.toUpperCase(), sc),
        ],
      });
    }),

    BottomNav(0),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Workflow Builder (Node Pipeline)
// ══════════════════════════════════════════════════════════════════════════════
function screenWorkflowBuilder(ox) {
  const steps = [
    { label: 'Trigger: Ticket Created',    sub: 'Zendesk · webhook · priority HIGH', color: P.green,  status: 'done',    icon: '⬡' },
    { label: 'Classify Intent',            sub: 'Claude 3 Haiku · confidence 0.85',  color: P.violet, status: 'done',    icon: '◈' },
    { label: 'Search Knowledge Base',      sub: 'Pinecone · top_k 5 · Running...',   color: P.accent, status: 'running', icon: '◉' },
    { label: 'Generate Response',          sub: 'Claude 3.5 Sonnet · max 1024 tok', color: P.muted,  status: 'queued',  icon: '⊛' },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(200, 440, 120, P.violet),

    ...StatusBar(),

    // Large editorial header — Locomotive 70px influence
    T('CUSTOMER\nSUPPORT\nBOT', 20, 42, 290, 102, { size: 28, weight: 900, ls: -0.5, fill: P.fg, lh: 1.05 }),
    Pill(276, 48, 'RUNNING', P.accent),
    T('4 steps · 1m 12s', 20, 148, 200, 14, { size: 11, fill: P.muted2 }),

    Line(20, 170, 350, P.border),

    T('WORKFLOW', 20, 184, 200, 12, { size: 8, fill: P.muted, ls: 2, weight: 700 }),

    // Pipeline nodes
    ...steps.map((step, i) => {
      const isRunning = step.status === 'running';
      const isQueued  = step.status === 'queued';
      const sc = step.status === 'done' ? P.green : step.status === 'running' ? P.accent : P.muted;
      const ch = [
        F(0, 12, 3, 44, step.color, { r: 2, opacity: isQueued ? 0.3 : 1 }),
        E(16, 18, 28, 28, step.color + (isQueued ? '15' : '20')),
        T(step.icon, 16, 20, 28, 24, { size: 14, fill: step.color, align: 'center', opacity: isQueued ? 0.4 : 1 }),
        T(step.label, 52, 12, 242, 14, { size: 12, weight: 700, fill: isQueued ? P.muted2 : P.fg }),
        T(step.sub, 52, 30, 242, 12, { size: 9.5, fill: isQueued ? P.muted : P.muted2 }),
        Pill(296, 16, step.status === 'done' ? 'DONE' : step.status === 'running' ? 'LIVE' : 'QUEUED', sc),
      ];
      if (isRunning) {
        ch.push(F(14, 56, 320, 4, P.border2, { r: 2 }));
        ch.push(F(14, 56, 200, 4, P.accent + 'bb', { r: 2 }));
      }
      return F(20, 204 + i * 78, 350, isRunning ? 70 : 66, isRunning ? P.surface2 : P.surface, {
        r: 14, stroke: isRunning ? step.color + '66' : isQueued ? P.border : P.border, sw: isRunning ? 1.5 : 1,
        opacity: isQueued ? 0.65 : 1, ch,
      });
    }),

    // Connectors between steps
    ...[0,1,2].map(i => [
      VLine(194, 270 + i * 78, 12, i === 2 ? P.border2 : P.border),
      T('↓', 188, 272 + i * 78, 14, 10, { size: 10, fill: i === 2 ? P.border2 : P.muted }),
    ]).flat(),

    // Add step + run stats
    F(20, 520, 350, 44, P.border2, {
      r: 12, stroke: P.border, sw: 1,
      ch: [T('+ Add Step', 0, 12, 350, 20, { size: 12, fill: P.muted, align: 'center', weight: 600 })],
    }),

    F(20, 578, 350, 60, P.surface, {
      r: 12, stroke: P.border, sw: 1,
      ch: [
        VLine(116, 12, 36, P.border), VLine(232, 12, 36, P.border),
        T('DURATION', 14, 10, 90, 11, { size: 8, fill: P.muted, ls: 1 }),
        T('1m 12s',   14, 24, 90, 22, { size: 17, weight: 800, fill: P.amber }),
        T('TOKENS',   126, 10, 90, 11, { size: 8, fill: P.muted, ls: 1 }),
        T('2,847',    126, 24, 90, 22, { size: 17, weight: 800, fill: P.accent }),
        T('COST',     244, 10, 90, 11, { size: 8, fill: P.muted, ls: 1 }),
        T('$0.012',   244, 24, 90, 22, { size: 17, weight: 800, fill: P.fg }),
      ],
    }),

    F(20, 652, 350, 44, P.accent, { r: 12, ch: [T('▶  RUN WORKFLOW', 0, 12, 350, 20, { size: 12, fill: P.bg, align: 'center', weight: 800, ls: 1.5 })] }),

    BottomNav(1),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Live Monitor (Real-time trace)
// ══════════════════════════════════════════════════════════════════════════════
function screenLiveMonitor(ox) {
  const traces = [
    { label: 'Trigger received',      model: 'Zendesk Webhook',      dur: '12ms',  tokens: null, color: P.green,  done: true  },
    { label: 'Intent: billing_issue', model: 'Claude 3 Haiku',       dur: '340ms', tokens: 287,  color: P.violet, done: true  },
    { label: 'KB search → 4 results', model: 'Pinecone similarity',  dur: '210ms', tokens: null, color: P.cyan,   done: true  },
    { label: 'Generating reply...',   model: 'Claude 3.5 Sonnet',    dur: null,    tokens: null, color: P.accent, done: false },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(310, 220, 75, P.cyan),
    ...Glow(70, 580, 55, P.violet),

    ...StatusBar(),

    T('MONITOR', 20, 44, 250, 28, { size: 22, weight: 900, ls: 4, fill: P.fg }),
    Pill(256, 50, 'LIVE', P.accent),
    T('#RUN-2841 · Customer Support Bot · 1m 12s', 20, 78, 350, 14, { size: 10, fill: P.muted2 }),

    Line(20, 100, 350, P.border),
    T('EXECUTION TRACE', 20, 114, 250, 12, { size: 8, fill: P.muted, ls: 2, weight: 700 }),

    ...traces.map((tr, i) => {
      const isActive = !tr.done;
      const ch = [
        // Timeline
        E(14, 18, 12, 12, tr.color + (tr.done ? '55' : '')),
        i < 3 ? VLine(19, 30, 68, P.border) : null,
        // Content
        T(tr.label, 36, 10, 240, 14, { size: 12, weight: isActive ? 700 : 600, fill: P.fg }),
        T(tr.model, 36, 28, 240, 12, { size: 9.5, fill: P.muted2 }),
        tr.tokens ? T(`${tr.tokens} tok`, 36, 46, 100, 11, { size: 9, fill: P.muted }) : null,
        tr.dur ? T(tr.dur, 298, 10, 52, 12, { size: 10, fill: tr.color, align: 'right', weight: 700 }) : null,
        isActive ? T('● ● ●', 200, 46, 100, 14, { size: 10, fill: tr.color, ls: 3, opacity: 0.8 }) : null,
        isActive ? F(14, 58, 320, 3, P.border2, { r: 2 }) : null,
        isActive ? F(14, 58, 175, 3, tr.color + 'aa', { r: 2 }) : null,
      ].filter(Boolean);
      return F(20, 134 + i * 80, 350, isActive ? 70 : 68, isActive ? P.surface2 : P.surface, {
        r: 12, stroke: isActive ? tr.color + '55' : P.border, sw: isActive ? 1.5 : 1, ch,
      });
    }),

    // Context preview
    T('CONTEXT WINDOW', 20, 462, 250, 12, { size: 8, fill: P.muted, ls: 2, weight: 700 }),
    F(20, 480, 350, 78, P.surface, {
      r: 12, stroke: P.border, sw: 1,
      ch: [
        T('system', 14, 11, 70, 12, { size: 9, fill: P.violet, weight: 700 }),
        T('You are a billing support specialist...', 14, 25, 320, 12, { size: 10, fill: P.muted2 }),
        T('user', 14, 41, 50, 12, { size: 9, fill: P.accent, weight: 700 }),
        T('I was charged twice this month.', 14, 55, 320, 12, { size: 10, fill: P.fg }),
        Pill(276, 10, '2,847 tok', P.muted),
      ],
    }),

    // Metrics strip
    F(20, 572, 350, 64, P.surface, {
      r: 12, stroke: P.border, sw: 1,
      ch: [
        VLine(116, 10, 44, P.border), VLine(232, 10, 44, P.border),
        T('ELAPSED', 14, 10, 94, 11, { size: 8, fill: P.muted, ls: 1 }),
        T('1m 12s',  14, 24, 94, 22, { size: 18, weight: 800, fill: P.amber }),
        T('TOKENS',  130, 10, 94, 11, { size: 8, fill: P.muted, ls: 1 }),
        T('2,847',   130, 24, 94, 22, { size: 18, weight: 800, fill: P.accent }),
        T('STEP',    246, 10, 94, 11, { size: 8, fill: P.muted, ls: 1 }),
        T('3 / 4',   246, 24, 94, 22, { size: 18, weight: 800, fill: P.green }),
        F(14, 56, 322, 4, P.border2, { r: 2 }),
        F(14, 56, Math.round(322 * 0.75), 4, P.accent, { r: 2 }),
      ],
    }),

    F(20, 650, 350, 44, P.red + '18', {
      r: 12, stroke: P.red + '44', sw: 1,
      ch: [T('■  ABORT RUN', 0, 12, 350, 20, { size: 12, fill: P.red, align: 'center', weight: 700, ls: 1 })],
    }),

    BottomNav(2),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Agent Library
// ══════════════════════════════════════════════════════════════════════════════
function screenAgentLibrary(ox) {
  const agents = [
    { name: 'Web Researcher',   provider: 'Tavily + Claude',       cat: 'SEARCH', color: P.cyan,   uses: 284, on: true  },
    { name: 'Code Generator',   provider: 'GPT-4o + E2B Sandbox',  cat: 'CODE',   color: P.green,  uses: 197, on: true  },
    { name: 'Doc Analyst',      provider: 'Claude 3.5 Sonnet',     cat: 'DOCS',   color: P.violet, uses: 156, on: true  },
    { name: 'Email Drafter',    provider: 'Claude 3 Haiku',        cat: 'WRITE',  color: P.amber,  uses: 89,  on: false },
    { name: 'Data Transformer', provider: 'GPT-4o-mini + Pandas',  cat: 'DATA',   color: P.accent, uses: 72,  on: false },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(70, 120, 70, P.cyan),
    ...Glow(330, 500, 55, P.green),

    ...StatusBar(),

    T('AGENTS', 20, 44, 280, 28, { size: 24, weight: 900, ls: 5, fill: P.fg }),
    T('47 available', 20, 76, 200, 14, { size: 11, fill: P.muted2, weight: 300 }),
    F(296, 46, 74, 30, P.accent, { r: 10, ch: [T('+ New', 0, 7, 74, 16, { size: 11, fill: P.bg, align: 'center', weight: 700 })] }),

    // Search
    F(20, 100, 350, 40, P.surface, {
      r: 10, stroke: P.border, sw: 1,
      ch: [
        T('⌕', 12, 10, 20, 20, { size: 15, fill: P.muted }),
        T('Search agents...', 36, 10, 280, 20, { size: 12, fill: P.muted, weight: 300 }),
      ],
    }),

    // Category filters
    ...(['ALL', 'SEARCH', 'CODE', 'DOCS', 'WRITE', 'DATA'].map((cat, i) =>
      F(20 + i * 56, 152, 50, 24, i === 0 ? P.accent : P.surface, {
        r: 12, stroke: i === 0 ? 'transparent' : P.border, sw: 1,
        ch: [T(cat, 0, 5, 50, 14, { size: 8, fill: i === 0 ? P.bg : P.muted, align: 'center', weight: 700, ls: 0.2 })],
      })
    )),

    T('CONNECTED', 20, 192, 250, 12, { size: 8, fill: P.muted, ls: 2, weight: 700 }),

    ...agents.map((ag, i) =>
      F(20, 212 + i * 76, 350, 66, P.surface, {
        r: 14, stroke: ag.on ? ag.color + '33' : P.border, sw: 1,
        ch: [
          F(14, 14, 38, 38, ag.color + '18', { r: 10 }),
          T('◈', 14, 18, 38, 30, { size: 16, fill: ag.color, align: 'center' }),
          T(ag.name, 62, 12, 200, 14, { size: 13, weight: 700, fill: ag.on ? P.fg : P.muted2 }),
          T(ag.provider, 62, 28, 220, 12, { size: 9.5, fill: P.muted }),
          T(`${ag.uses} uses / week`, 62, 46, 160, 11, { size: 9, fill: P.muted }),
          Pill(280, 12, ag.cat, ag.color),
          // Toggle
          F(296, 34, 36, 18, ag.on ? P.green : P.border, {
            r: 9,
            ch: [E(ag.on ? 20 : 4, 3, 12, 12, P.bg)],
          }),
          ...(ag.on ? StatusDot(330, 44, P.green) : []),
        ],
      })
    ),

    BottomNav(3),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Run History & Analytics
// ══════════════════════════════════════════════════════════════════════════════
function screenRunHistory(ox) {
  const runs = [
    { name: 'Customer Support Bot', meta: '4 steps · 1m 12s · 2,847 tok · $0.012', status: 'running', time: '2m ago',  color: P.accent },
    { name: 'Data Enrichment Flow', meta: '6 steps · 42s · 1,204 tok · $0.004',    status: 'success', time: '8m ago',  color: P.green  },
    { name: 'Competitor Analysis',  meta: '5 steps · 2m 08s · 5,102 tok · $0.022', status: 'failed',  time: '15m ago', color: P.red    },
    { name: 'Content Generation',   meta: '3 steps · 18s · 892 tok · $0.002',      status: 'success', time: '22m ago', color: P.green  },
    { name: 'Lead Qualifier',       meta: '4 steps · 34s · 1,450 tok · $0.005',    status: 'success', time: '1h ago',  color: P.green  },
  ];

  const weekRuns = [18, 24, 21, 29, 31, 14, 8];
  const maxWR    = Math.max(...weekRuns);

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(200, 180, 100, P.accent),

    ...StatusBar(),

    // Oversized wordmark — Locomotive editorial, tight lh
    T('RUN\nHISTORY', 20, 42, 310, 76, { size: 34, weight: 900, ls: -1, fill: P.fg, lh: 0.95 }),
    T('March 2026', 20, 120, 200, 16, { size: 12, fill: P.muted2 }),

    // Weekly bar chart card
    F(20, 144, 350, 120, P.surface, {
      r: 16, stroke: P.border, sw: 1,
      ch: [
        T('THIS WEEK', 16, 12, 200, 11, { size: 8, fill: P.muted, ls: 2, weight: 700 }),
        T('145', 16, 26, 100, 40, { size: 34, weight: 900, fill: P.accent, ls: -1 }),
        T('total runs', 16, 68, 100, 13, { size: 10, fill: P.muted2 }),
        T('94%', 220, 14, 110, 26, { size: 22, weight: 800, fill: P.green, align: 'right' }),
        T('success', 220, 40, 110, 12, { size: 9, fill: P.muted, align: 'right' }),
        // bars + day labels
        ...weekRuns.map((v, i) => {
          const bh = Math.max(Math.round((v / maxWR) * 50), 4);
          const isToday = i === 4;
          return [
            F(16 + i * 46, 116 - bh - 18, 32, bh, isToday ? P.accent : P.accent + '3A', { r: 4 }),
            T(['M','T','W','T','F','S','S'][i], 16 + i * 46, 102, 32, 12, { size: 8, fill: P.muted, align: 'center' }),
          ];
        }).flat(),
      ],
    }),

    // List header
    T('RECENT RUNS', 20, 280, 200, 12, { size: 8, fill: P.muted, ls: 2, weight: 700 }),
    T('Filter ↓', 310, 280, 60, 12, { size: 10, fill: P.accent, align: 'right' }),

    ...runs.map((run, i) => {
      const sc = run.status === 'running' ? P.accent : run.status === 'success' ? P.green : P.red;
      const si = run.status === 'running' ? '◉' : run.status === 'success' ? '✓' : '✕';
      const ch = [
        F(0, 10, 3, 44, run.color, { r: 2 }),
        E(14, 18, 26, 26, run.color + '20'),
        T(si, 14, 20, 26, 22, { size: 11, fill: run.color, align: 'center' }),
        T(run.name, 48, 10, 220, 14, { size: 12, weight: 700, fill: P.fg }),
        T(run.meta, 48, 28, 260, 12, { size: 9.5, fill: P.muted2 }),
        T(run.time, 48, 46, 120, 11, { size: 9, fill: P.muted }),
        Pill(282, 14, run.status.toUpperCase(), sc),
      ];
      if (run.status === 'failed') {
        ch.push(F(282, 36, 54, 18, P.red + '18', { r: 6, stroke: P.red + '44', sw: 1, ch: [T('RETRY', 0, 4, 54, 10, { size: 8, fill: P.red, align: 'center', weight: 700 })] }));
      }
      return F(20, 300 + i * 74, 350, 64, P.surface, {
        r: 12, stroke: run.status === 'failed' ? P.red + '33' : run.status === 'running' ? P.accent + '33' : P.border, sw: 1, ch,
      });
    }),

    BottomNav(2),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// ASSEMBLE & SAVE
// ══════════════════════════════════════════════════════════════════════════════
const SCREEN_W = 390;
const GAP      = 80;

const doc = {
  version: '2.8',
  name: 'SYNAPSE — AI Agent Workflow Orchestrator',
  width:  5 * SCREEN_W + 6 * GAP,
  height: 844,
  fill:   P.bg,
  children: [
    screenDashboard      (GAP),
    screenWorkflowBuilder(GAP + (SCREEN_W + GAP)),
    screenLiveMonitor    (GAP + (SCREEN_W + GAP) * 2),
    screenAgentLibrary   (GAP + (SCREEN_W + GAP) * 3),
    screenRunHistory     (GAP + (SCREEN_W + GAP) * 4),
  ],
};

const outPath = path.join(__dirname, 'synapse.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log('✓ synapse.pen written —', Math.round(fs.statSync(outPath).size / 1024) + 'KB');
console.log('  5 screens: Dashboard · Workflow Builder · Live Monitor · Agent Library · Run History');
console.log('  Palette: Linear near-black #08090A · Electric Indigo #5E6AD2 · Green #4CC38A · Violet #9C6FE4');
