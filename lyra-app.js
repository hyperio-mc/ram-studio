'use strict';
// lyra-app.js — LYRA: AI Agent Operations Dashboard
//
// Inspired by:
//   • Haptic.app on godly.website (#965) — "Clean, Dark, Large Type, Single Page,
//     Inter + SF Pro Display, Scrolling Animation" — oversized numerals as the hero UI
//     element; negative space as a design tool; Inter at 900 weight on near-void black.
//   • Linear.app on darkmodedesign.com — "The product development system for teams
//     and agents" — the AI-era pivot; precision 4px-grid dark SaaS; type IS the UI.
//   • Forge + Flomodia on darkmodedesign.com — dense dark productivity panels that
//     still breathe; status communicated by color alone; zero decorative chrome.
//   • Runlayer "Enterprise MCPs, Skills & Agents" on land-book.com (March 2026) —
//     AI agent orchestration is the hottest UX category; teams need command centers.
//
// Challenge: Design a 5-screen dark-mode AI Agent Operations app where:
//   - "Big Type" drives the hero metrics (Haptic-style)
//   - Linear-precision grid governs data density
//   - Near-void black (#05060F) + electric indigo (#5548FF) + teal (#00DDB5)
//   - 5 screens: Command · Fleet · Task · Analytics · Configure

const fs   = require('fs');
const path = require('path');

// ── Palette ────────────────────────────────────────────────────────────────────
const P = {
  bg:        '#05060F',
  surface:   '#0B0D1E',
  surface2:  '#111430',
  surface3:  '#171A3E',
  border:    '#1A1D42',
  border2:   '#22275A',
  fg:        '#E8E6FF',
  fg2:       '#6C6AA0',
  fg3:       '#2C2A54',
  accent:    '#5548FF',
  accentLo:  '#5548FF1A',
  accentMid: '#5548FF40',
  accentHi:  '#8B80FF',
  teal:      '#00DDB5',
  tealLo:    '#00DDB51A',
  tealMid:   '#00DDB540',
  red:       '#FF3D5E',
  redLo:     '#FF3D5E1A',
  amber:     '#FFB93E',
  amberLo:   '#FFB93E1A',
};

let _id = 0;
const uid = () => `ly${++_id}`;

// ── Core Primitives ────────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill || P.bg,
  clip: opts.clip !== undefined ? opts.clip : false,
  ...(opts.r  !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.ch || [],
});

const T = (content, x, y, w, h, opts = {}) => ({
  id: uid(), type: 'text', content, x, y, width: w, height: h,
  textGrowth: 'fixed-width-height',
  fontSize:   opts.size   || 13,
  fontWeight: String(opts.weight || 400),
  fill:       opts.fill   || P.fg,
  textAlign:  opts.align  || 'left',
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh !== undefined ? { lineHeight: opts.lh }   : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
});

const Line = (x, y, w, fill = P.border) => F(x, y, w, 1, fill, {});

const Pill = (x, y, text, bg, textFill) => {
  const w = text.length * 6.3 + 20;
  return F(x, y, w, 20, bg, { r: 10, ch: [
    T(text, 10, 3, w - 16, 14, { size: 9, fill: textFill || '#FFF', weight: 700, ls: 0.5 }),
  ]});
};

const Tag = (x, y, text, color) => Pill(x, y, text, color + '22', color);

// ── Layout Constants ───────────────────────────────────────────────────────────
const W = 390, H = 844;

// ── Status Bar ─────────────────────────────────────────────────────────────────
const StatusBar = () => F(0, 0, W, 44, 'transparent', { ch: [
  T('9:41', 16, 14, 50, 16, { size: 13, fill: P.fg, weight: 600 }),
  T('▲ ◉ ●●●', 295, 14, 85, 16, { size: 10, fill: P.fg2, align: 'right' }),
]});

// ── Bottom Nav Bar ─────────────────────────────────────────────────────────────
const Nav = (active) => {
  const tabs = [
    { label: 'Command', sym: '◉' },
    { label: 'Fleet',   sym: '◈' },
    { label: 'Tasks',   sym: '≡' },
    { label: 'Stats',   sym: '⌗' },
    { label: 'Config',  sym: '◎' },
  ];
  const ch = [Line(0, 0, W, P.border)];
  tabs.forEach((t, i) => {
    const x = 4 + i * 76, sel = i === active;
    if (sel) {
      ch.push(F(x, 0, 76, 3, P.accent, {}));
      ch.push(F(x + 4, 4, 68, 42, P.accentLo, { r: 6 }));
    }
    ch.push(T(t.sym, x + 4, 8, 68, 18, {
      size: 15, fill: sel ? P.accent : P.fg3, weight: sel ? 700 : 400, align: 'center',
    }));
    ch.push(T(t.label, x + 4, 30, 68, 12, {
      size: 8, fill: sel ? P.accentHi : P.fg3, weight: sel ? 700 : 400, align: 'center', ls: 0.3,
    }));
  });
  return F(0, H - 48, W, 48, P.surface, { ch });
};

const SL = (x, y, text) =>
  T(text, x, y, W - 40, 11, { size: 9, fill: P.fg2, weight: 700, ls: 1.5 });

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 1 — Command (Overview)
// ─────────────────────────────────────────────────────────────────────────────
function mkCommand() {
  const ch = [StatusBar(), Nav(0)];

  // Wordmark
  ch.push(T('LYRA', 20, 52, 140, 16, { size: 10, fill: P.accentHi, weight: 900, ls: 4 }));
  ch.push(T('Command Center', 20, 70, 260, 26, { size: 20, fill: P.fg, weight: 700 }));
  ch.push(Tag(20, 100, '● LIVE', P.teal));

  // ── Hero metric card (Haptic large-type inspiration) ──
  ch.push(F(20, 130, W - 40, 108, P.surface, { r: 16, stroke: P.border, ch: [
    T('ACTIVE AGENTS', 20, 18, 220, 11, { size: 8, fill: P.fg2, weight: 700, ls: 2 }),
    T('24', 20, 32, 180, 60, { size: 58, fill: P.fg, weight: 900 }),
    T('of 32 provisioned', 20, 86, 200, 14, { size: 11, fill: P.fg2 }),
    // accent bar right
    F(W - 72, 20, 4, 68, P.teal, { r: 2 }),
    T('↑ 3', W - 66, 28, 56, 16, { size: 13, fill: P.teal, weight: 700, align: 'right' }),
    T('new today', W - 66, 46, 56, 12, { size: 9, fill: P.fg2, align: 'right' }),
  ]}));

  // ── 3-stat bento row ──
  const kpi = [
    { lbl: 'TASKS/HR', val: '1,024', col: P.fg    },
    { lbl: 'QUEUED',   val: '88',    col: P.amber  },
    { lbl: 'ERRORS',   val: '2',     col: P.red    },
  ];
  kpi.forEach((k, i) => {
    ch.push(F(20 + i * 120, 250, 112, 70, P.surface, { r: 12, stroke: P.border, ch: [
      T(k.lbl, 12, 10, 92, 11, { size: 7, fill: P.fg2, weight: 700, ls: 1.2 }),
      T(k.val, 12, 24, 92, 34, { size: i === 0 ? 20 : 26, fill: k.col, weight: 900 }),
    ]}));
  });

  // ── System health bento (2×2) ──
  ch.push(SL(20, 334, 'SYSTEM HEALTH'));
  const health = [
    { name: 'Inference',  pct: '99.2%', col: P.teal,  status: 'NOMINAL'  },
    { name: 'Embeddings', pct: '100%',  col: P.teal,  status: 'NOMINAL'  },
    { name: 'Storage',    pct: '87.1%', col: P.amber, status: 'DEGRADED' },
    { name: 'Webhooks',   pct: '100%',  col: P.teal,  status: 'NOMINAL'  },
  ];
  health.forEach((h, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 20 + col * 178, y = 350 + row * 84;
    ch.push(F(x, y, 170, 76, P.surface, { r: 12, stroke: P.border, ch: [
      T(h.name, 12, 11, 120, 13, { size: 11, fill: P.fg, weight: 600 }),
      E(142, 11, 10, 10, h.col, {}),
      T(h.pct, 12, 28, 110, 26, { size: 22, fill: h.col, weight: 900 }),
      T(h.status, 12, 56, 140, 11, { size: 8, fill: P.fg2, weight: 600, ls: 0.5 }),
    ]}));
  });

  // ── Recent activity feed ──
  ch.push(SL(20, 530, 'RECENT ACTIVITY'));
  const events = [
    { txt: 'lyra-7 finished task #4504',           t: '8s ago',  dot: P.teal   },
    { txt: 'lyra-3 queued: refactor-ui #4505',     t: '31s ago', dot: P.accent },
    { txt: 'lyra-11 error: rate limit exceeded',   t: '1m ago',  dot: P.red    },
    { txt: 'lyra-2 started: analyze-logs #4503',   t: '2m ago',  dot: P.accent },
  ];
  events.forEach((ev, i) => {
    const y = 548 + i * 52;
    ch.push(F(20, y, W - 40, 44, P.surface, { r: 10, stroke: P.border, ch: [
      E(14, 17, 8, 8, ev.dot, {}),
      T(ev.txt, 30, 8, 258, 13, { size: 11, fill: P.fg }),
      T(ev.t, 300, 8, 78, 13, { size: 9, fill: P.fg2, align: 'right' }),
      Line(30, 30, 300, P.border),
    ]}));
  });

  return F(0, 0, W, H, P.bg, { ch, clip: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 2 — Fleet (Agent list)
// ─────────────────────────────────────────────────────────────────────────────
function mkFleet() {
  const ch = [StatusBar(), Nav(1)];

  ch.push(T('Agent Fleet', 20, 54, 260, 26, { size: 20, fill: P.fg, weight: 700 }));
  ch.push(T('32 PROVISIONED · 24 ACTIVE', 20, 83, 300, 13, { size: 10, fill: P.fg2, weight: 600, ls: 0.8 }));

  // Search
  ch.push(F(20, 106, W - 40, 38, P.surface, { r: 10, stroke: P.border, ch: [
    T('⌕', 14, 9, 20, 18, { size: 15, fill: P.fg2 }),
    T('Search agents…', 40, 11, 280, 16, { size: 13, fill: P.fg3 }),
  ]}));

  // Filter chips
  const chips = ['All · 32', 'Active · 24', 'Idle · 6', 'Error · 2'];
  let fx = 20;
  chips.forEach((c, i) => {
    const sel = i === 0;
    const cw = c.length * 7 + 22;
    ch.push(F(fx, 154, cw, 24, sel ? P.accent : P.surface2, {
      r: 12, stroke: sel ? P.accent : P.border, ch: [
        T(c, 11, 4, cw - 16, 16, { size: 10, fill: sel ? '#FFF' : P.fg2, weight: sel ? 700 : 400 }),
      ],
    }));
    fx += cw + 8;
  });

  // Agent cards
  const agents = [
    { name: 'lyra-alpha-7',  model: 'claude-3-5-sonnet', task: 'Code review #4504',    status: 'ACTIVE', tkns: '38K', col: P.teal  },
    { name: 'lyra-beta-3',   model: 'gpt-4o',             task: 'Refactor UI module',  status: 'ACTIVE', tkns: '22K', col: P.teal  },
    { name: 'lyra-gamma-11', model: 'claude-3-5-sonnet', task: 'Rate limit error',      status: 'ERROR',  tkns: '92K', col: P.red   },
    { name: 'lyra-delta-2',  model: 'claude-3-haiku',    task: 'Analyze logs #4503',   status: 'ACTIVE', tkns: '11K', col: P.teal  },
    { name: 'lyra-eta-5',    model: 'gpt-4o-mini',       task: '—',                    status: 'IDLE',   tkns: '0',   col: P.fg3   },
    { name: 'lyra-zeta-9',   model: 'claude-3-opus',     task: 'Summarize reports',    status: 'ACTIVE', tkns: '14K', col: P.teal  },
  ];

  agents.forEach((ag, i) => {
    const y = 188 + i * 92;
    ch.push(F(20, y, W - 40, 84, P.surface, { r: 14, stroke: P.border, ch: [
      E(18, 18, 10, 10, ag.col, {}),
      T(ag.name, 36, 12, 220, 15, { size: 13, fill: P.fg, weight: 700 }),
      F(W - 80, 12, 56, 18, ag.col + '22', { r: 9, ch: [
        T(ag.status, 6, 2, 44, 14, { size: 8, fill: ag.col, weight: 700, ls: 0.3 }),
      ]}),
      T(ag.model, 36, 30, 210, 12, { size: 10, fill: P.fg2 }),
      Line(18, 52, W - 74, P.border),
      T('Task: ' + ag.task, 18, 59, 232, 13, { size: 10, fill: P.fg2 }),
      T(ag.tkns + ' tkns', W - 76, 59, 64, 13, { size: 10, fill: P.accent, weight: 600, align: 'right' }),
    ]}));
  });

  return F(0, 0, W, H, P.bg, { ch, clip: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 3 — Task Detail
// ─────────────────────────────────────────────────────────────────────────────
function mkTask() {
  const ch = [StatusBar(), Nav(2)];

  ch.push(T('← Tasks', 20, 52, 100, 15, { size: 12, fill: P.accentHi }));
  ch.push(T('Task #4504', 20, 70, 300, 26, { size: 20, fill: P.fg, weight: 700 }));
  ch.push(T('Code Review — hyperio-mc/design-studio', 20, 100, W - 40, 14, { size: 11, fill: P.fg2 }));

  ch.push(Tag(20, 122, '● RUNNING', P.teal));
  ch.push(F(122, 120, 132, 22, P.surface, { r: 11, stroke: P.border, ch: [
    T('lyra-alpha-7', 10, 4, 112, 14, { size: 9, fill: P.fg2 }),
  ]}));

  // Token usage card
  ch.push(F(20, 152, W - 40, 64, P.surface, { r: 12, stroke: P.border, ch: [
    T('TOKEN USAGE', 14, 11, 180, 10, { size: 8, fill: P.fg2, weight: 700, ls: 1.5 }),
    T('38,241 / 100,000', 14, 24, 220, 16, { size: 14, fill: P.fg, weight: 700 }),
    // bar track
    F(14, 46, W - 74, 8, P.surface3, { r: 4, ch: [
      F(0, 0, Math.round((W - 74) * 0.382), 8, P.accent, { r: 4 }),
    ]}),
  ]}));

  // Steps
  ch.push(SL(20, 232, 'EXECUTION STEPS'));
  const steps = [
    { lbl: 'Cloned repository',         state: 'done',    dur: '9s'    },
    { lbl: 'Parsed 847 source files',   state: 'done',    dur: '24s'   },
    { lbl: 'Identifying issues…',       state: 'running', dur: '1m 12s'},
    { lbl: 'Generate recommendations',  state: 'pending', dur: '—'     },
    { lbl: 'Output final report',       state: 'pending', dur: '—'     },
  ];
  const sCol = { done: P.teal, running: P.accent, pending: P.fg3 };
  const sIcon = { done: '✓', running: '◉', pending: '○' };

  steps.forEach((s, i) => {
    const y = 248 + i * 54;
    const col = sCol[s.state];
    const isRun = s.state === 'running';
    ch.push(F(20, y, W - 40, 46, isRun ? P.accentLo : P.surface, {
      r: 10, stroke: isRun ? P.accent : P.border, ch: [
        E(14, 15, 14, 14, col + '30', {}),
        T(sIcon[s.state], 14, 15, 14, 14, { size: 10, fill: col, align: 'center', weight: 700 }),
        T(s.lbl, 36, 9, 250, 14, { size: 12, fill: s.state === 'pending' ? P.fg2 : P.fg }),
        T(s.dur, W - 70, 9, 50, 14, { size: 10, fill: P.fg2, align: 'right' }),
        isRun ? Tag(36, 28, 'IN PROGRESS', P.accent) : T('', 0, 0, 1, 1),
      ],
    }));
  });

  // Log stream
  ch.push(SL(20, 532, 'LIVE LOG STREAM'));
  const logLines = [
    { t: '1m 12s', msg: 'Scanning /src/components/Button.tsx…', col: P.teal  },
    { t: '1m 08s', msg: 'Found 8 potential issues in Modal.tsx', col: P.fg2  },
    { t: '1m 02s', msg: 'Parsing App.tsx — 612 loc',            col: P.fg2  },
    { t: '0m 44s', msg: 'Checking peer dependencies…',          col: P.fg2  },
    { t: '0m 28s', msg: 'Parsed all 847 source files ✓',        col: P.fg2  },
    { t: '0m 09s', msg: 'Repository cloned ✓',                  col: P.fg2  },
  ];
  ch.push(F(20, 550, W - 40, 148, P.bg, { r: 12, stroke: P.border, clip: true, ch: [
    ...logLines.map((l, i) =>
      F(0, i * 24, W - 40, 24, 'transparent', { ch: [
        T('[' + l.t + ']', 12, 5, 70, 14, { size: 9, fill: P.fg3 }),
        T(l.msg, 82, 5, W - 140, 14, { size: 10, fill: l.col }),
      ]})
    ),
  ]}));

  return F(0, 0, W, H, P.bg, { ch, clip: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 4 — Analytics
// ─────────────────────────────────────────────────────────────────────────────
function mkAnalytics() {
  const ch = [StatusBar(), Nav(3)];

  ch.push(T('Analytics', 20, 54, 260, 26, { size: 20, fill: P.fg, weight: 700 }));

  // Period pills
  ['1D', '7D', '30D', '90D'].forEach((p, i) => {
    const sel = i === 1;
    ch.push(F(238 + i * 38, 58, 32, 22, sel ? P.accent : P.surface, {
      r: 8, stroke: sel ? P.accent : P.border, ch: [
        T(p, 4, 4, 24, 14, { size: 10, fill: sel ? '#FFF' : P.fg2, weight: sel ? 700 : 400, align: 'center' }),
      ],
    }));
  });

  // ── Hero metric (Haptic: big number = the UI) ──
  ch.push(F(20, 90, W - 40, 102, P.surface, { r: 16, stroke: P.border, ch: [
    T('TASK SUCCESS RATE', 20, 16, 260, 11, { size: 8, fill: P.fg2, weight: 700, ls: 2 }),
    T('98.1%', 20, 30, 220, 50, { size: 44, fill: P.teal, weight: 900 }),
    T('↑ 0.8% vs last week', 20, 80, 220, 13, { size: 11, fill: P.teal }),
    // sparkline bars
    ...[76, 62, 84, 70, 90, 88, 98].map((v, i) => {
      const bh = Math.round(v * 0.56);
      const isToday = i === 6;
      return F(270 + i * 14, 90 - bh, 10, bh, isToday ? P.teal : P.accentMid, { r: 2 });
    }),
  ]}));

  // 3-stat row
  const kpis = [
    { lbl: 'TOTAL TASKS',   val: '18.4K', col: P.fg    },
    { lbl: 'AVG DURATION',  val: '3m 51s', col: P.fg   },
    { lbl: 'TOKENS / DAY',  val: '2.8M',  col: P.accent },
  ];
  kpis.forEach((k, i) => {
    ch.push(F(20 + i * 120, 204, 112, 68, P.surface, { r: 12, stroke: P.border, ch: [
      T(k.lbl, 10, 10, 94, 10, { size: 7, fill: P.fg2, weight: 700, ls: 1 }),
      T(k.val, 10, 24, 94, 30, { size: i === 0 ? 14 : 18, fill: k.col, weight: 800 }),
    ]}));
  });

  // ── Daily tokens bar chart ──
  ch.push(SL(20, 284, 'DAILY TOKEN USAGE (7D)'));
  const tokBars = [1.4, 2.1, 1.9, 2.4, 2.8, 2.6, 2.0];
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  ch.push(F(20, 300, W - 40, 118, P.surface, { r: 14, stroke: P.border, ch: [
    ...tokBars.map((v, i) => {
      const bh = Math.round(v * 32);
      const isFri = i === 4;
      return F(24 + i * 48, 78 - bh, 36, bh, isFri ? P.accent : P.accentLo, { r: 4 });
    }),
    ...dayLabels.map((d, i) =>
      T(d, 24 + i * 48, 84, 36, 12, { size: 8, fill: P.fg2, align: 'center' })
    ),
    ...tokBars.map((v, i) =>
      T(v + 'M', 24 + i * 48, 10, 36, 12, { size: 8, fill: P.fg2, align: 'center' })
    ),
  ]}));

  // ── Model usage breakdown ──
  ch.push(SL(20, 430, 'USAGE BY MODEL'));
  const models = [
    { name: 'claude-3-5-sonnet', pct: 54, col: P.accent },
    { name: 'gpt-4o',            pct: 26, col: P.teal   },
    { name: 'claude-3-opus',     pct: 13, col: P.amber  },
    { name: 'gpt-4o-mini',       pct: 7,  col: P.fg3    },
  ];
  models.forEach((m, i) => {
    const y = 448 + i * 52;
    ch.push(F(20, y, W - 40, 44, P.surface, { r: 10, stroke: P.border, ch: [
      E(14, 15, 12, 12, m.col, {}),
      T(m.name, 34, 9, 226, 14, { size: 12, fill: P.fg }),
      T(m.pct + '%', W - 68, 9, 50, 14, { size: 12, fill: m.col, weight: 700, align: 'right' }),
      F(34, 30, W - 110, 6, P.surface3, { r: 3, ch: [
        F(0, 0, Math.round((W - 110) * m.pct / 100), 6, m.col, { r: 3 }),
      ]}),
    ]}));
  });

  // Latency summary
  ch.push(SL(20, 664, 'LATENCY PERCENTILES'));
  ch.push(F(20, 680, W - 40, 84, P.surface, { r: 12, stroke: P.border, ch: [
    ...(['P50 — 1.8s', 'P95 — 7.2s', 'P99 — 16.4s']).map((l, i) => {
      const [label, val] = l.split(' — ');
      const pcts = [30, 60, 88];
      const cols = [P.teal, P.amber, P.red];
      return [
        T(label, 14, 10 + i * 24, 36, 13, { size: 10, fill: P.fg2, weight: 700 }),
        T(val, 54, 10 + i * 24, 56, 13, { size: 11, fill: cols[i], weight: 700 }),
        F(118, 16 + i * 24, 210, 6, P.surface3, { r: 3, ch: [
          F(0, 0, Math.round(210 * pcts[i] / 100), 6, cols[i], { r: 3 }),
        ]}),
      ];
    }).flat(),
  ]}));

  return F(0, 0, W, H, P.bg, { ch, clip: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 5 — Configure (New Agent Wizard)
// ─────────────────────────────────────────────────────────────────────────────
function mkConfigure() {
  const ch = [StatusBar(), Nav(4)];

  ch.push(T('Configure', 20, 54, 260, 26, { size: 20, fill: P.fg, weight: 700 }));
  ch.push(T('New Agent Setup', 20, 83, 260, 16, { size: 13, fill: P.fg2 }));

  // Progress steps
  const stepLabels = ['Identity', 'Model', 'Perms', 'Deploy'];
  stepLabels.forEach((s, i) => {
    const x = 20 + i * 88;
    const done = i < 2, active = i === 2;
    const col = done ? P.teal : active ? P.accent : P.fg3;
    ch.push(E(x, 110, 10, 10, col + (done || active ? '' : '40'), {}));
    if (i < 3) ch.push(F(x + 12, 114, 64, 2, i < 2 ? P.teal : P.fg3, {}));
    ch.push(T(s, x - 12, 126, 60, 12, { size: 8, fill: col }));
  });

  // Name field
  ch.push(SL(20, 152, 'AGENT IDENTITY'));
  ch.push(F(20, 168, W - 40, 46, P.surface, { r: 12, stroke: P.accent, sw: 2, ch: [
    T('AGENT NAME', 14, 8, 200, 10, { size: 8, fill: P.accentHi, weight: 700, ls: 1.2 }),
    T('lyra-epsilon-12', 14, 22, 280, 16, { size: 14, fill: P.fg }),
    F(168, 22, 2, 16, P.accent, {}),
  ]}));
  ch.push(F(20, 222, W - 40, 46, P.surface, { r: 12, stroke: P.border, ch: [
    T('DESCRIPTION', 14, 8, 200, 10, { size: 8, fill: P.fg2, weight: 700, ls: 1.2 }),
    T('Documentation generator and QA specialist', 14, 22, W - 60, 16, { size: 12, fill: P.fg }),
  ]}));

  // Model cards
  ch.push(SL(20, 282, 'MODEL SELECTION'));
  const mdls = [
    { name: 'claude-3-5-sonnet-20241022', badge: 'RECOMMENDED', badgeCol: P.accent },
    { name: 'claude-3-opus-20240229',      badge: 'POWERFUL',    badgeCol: P.amber  },
    { name: 'gpt-4o-2024-11-20',          badge: null,           badgeCol: null     },
    { name: 'gpt-4o-mini',                badge: 'FAST',         badgeCol: P.teal   },
  ];
  mdls.forEach((m, i) => {
    const y = 298 + i * 50;
    const sel = i === 0;
    ch.push(F(20, y, W - 40, 42, sel ? P.accentLo : P.surface, {
      r: 12, stroke: sel ? P.accent : P.border, ch: [
        E(14, 14, 14, 14, sel ? P.accent : P.fg3 + '40', {}),
        sel ? E(17, 17, 8, 8, '#FFF', {}) : T('', 0, 0, 1, 1),
        T(m.name, 36, 8, 230, 14, { size: 11, fill: sel ? P.fg : P.fg2, weight: sel ? 600 : 400 }),
        m.badge ? F(W - 100, 11, m.badge.length * 6 + 18, 18, m.badgeCol + '22', { r: 9, ch: [
          T(m.badge, 9, 2, m.badge.length * 6 + 2, 14, { size: 8, fill: m.badgeCol, weight: 700, ls: 0.3 }),
        ]}) : T('', 0, 0, 1, 1),
      ],
    }));
  });

  // Permissions toggles
  ch.push(SL(20, 502, 'PERMISSIONS'));
  const perms = [
    { lbl: 'File System Read',  sub: 'Read workspace files',   on: true  },
    { lbl: 'File System Write', sub: 'Modify and create files', on: true  },
    { lbl: 'Network Access',    sub: 'Fetch external URLs',     on: false },
    { lbl: 'Shell Execution',   sub: 'Run bash commands',       on: false },
  ];
  perms.forEach((p, i) => {
    const y = 518 + i * 54;
    ch.push(F(20, y, W - 40, 46, P.surface, { r: 12, stroke: P.border, ch: [
      T(p.lbl, 14, 8, 250, 14, { size: 13, fill: P.fg }),
      T(p.sub, 14, 26, 250, 12, { size: 10, fill: P.fg2 }),
      F(W - 70, 13, 38, 20, p.on ? P.tealMid : P.surface3, { r: 10, stroke: p.on ? P.teal : P.border, ch: [
        E(p.on ? 20 : 4, 3, 14, 14, p.on ? P.teal : P.fg3, {}),
      ]}),
    ]}));
  });

  // Deploy CTA
  ch.push(F(20, 738, W - 40, 48, P.accent, { r: 14, ch: [
    T('Deploy Agent →', 0, 14, W - 40, 20, { size: 15, fill: '#FFF', weight: 700, align: 'center', ls: 0.2 }),
  ]}));

  return F(0, 0, W, H, P.bg, { ch, clip: true });
}

// ── Assemble + write ───────────────────────────────────────────────────────────
const screens = [mkCommand(), mkFleet(), mkTask(), mkAnalytics(), mkConfigure()];
screens.forEach((s, i) => { s.x = i * 430; s.y = 0; });

const doc = {
  version:  '2.8',
  name:     'LYRA — AI Agent Operations Dashboard',
  width:    screens.length * 430 - 40,
  height:   H,
  children: screens,
};

const out = path.join(__dirname, 'lyra.pen');
fs.writeFileSync(out, JSON.stringify(doc, null, 2));
console.log('✓ lyra.pen written —', screens.length, 'screens,',
  Math.round(fs.statSync(out).size / 1024) + 'KB');
