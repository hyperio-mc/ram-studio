'use strict';
// fleet-app.js — FLEET: Run your agents, not your tools
//
// Challenge: Design a dark-theme autonomous agent orchestration platform styled
// as "mission control" — inspired by:
//   1. Midday.ai (darkmodedesign.com) — "Let agents run your business",
//      tabbed feature storytelling, clean dark SaaS with live dashboard previews
//   2. Neon.com (darkmodedesign.com) — "for Teams and Agents" positioning,
//      electric teal glows on near-black developer aesthetic
//   3. Awwwards Fluid Glass SOTD Mar 30 2026 (Exo Ape) — mask-wipe transitions,
//      fluid scroll-based interaction patterns
//
// New territory this run: radial health rings as agent status indicators,
//   live pulse dots for running state, grid-based fleet view with health orbs
//
// Theme: DARK — space navy #080C12, electric cyan #22D3EE, violet #A78BFA
//
// Screens:
//   1. Mission Control — live overview + agent status orbs + feed
//   2. Agent Fleet     — 2-col grid with radial ring health indicators
//   3. Task Queue      — tabbed priority pipeline + running progress bars
//   4. Trace Log       — execution timeline with step-by-step trace
//   5. Deploy Agent    — configuration form + trigger selector + CTA

const fs   = require('fs');
const path = require('path');

const P = {
  bg:       '#080C12',
  surface:  '#0F1520',
  surface2: '#141C2E',
  surface3: '#1A2540',
  border:   '#1E2D45',
  border2:  '#263552',
  text:     '#E8EDF5',
  textMid:  '#8B9BB5',
  textFade: '#4A5878',
  cyan:     '#22D3EE',
  violet:   '#A78BFA',
  green:    '#34D399',
  amber:    '#FBBF24',
  red:      '#F87171',
};

let _id = 0;
const uid = () => `fl${++_id}`;

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
  fill:       opts.fill   || P.text,
  textAlign:  opts.align  || 'left',
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh !== undefined ? { lineHeight:    opts.lh } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const R = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'rectangle', x, y, width: w, height: h, fill,
  ...(opts.r  !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: opts.sa || 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const W = 390, H = 844;
const screen = (id, label, ch) => ({ id, label, width: W, height: H, fill: P.bg, children: ch });

const statusBar = () => [
  T('9:41', 16, 14, 60, 16, { size: 12, weight: 600, fill: P.text }),
  T('●●● ▲ ■', W - 90, 14, 80, 16, { size: 9, fill: P.textMid, align: 'right' }),
];

const bottomNav = (active) => {
  const items = [
    { icon: '◈', label: 'Control', id: 'control' },
    { icon: '⬡', label: 'Fleet',   id: 'fleet'   },
    { icon: '≡', label: 'Queue',   id: 'queue'   },
    { icon: '⌁', label: 'Trace',   id: 'trace'   },
  ];
  const tabW = W / items.length;
  const nav  = F(0, H - 72, W, 72, P.surface, { ch: [] });
  nav.children.push(R(0, 0, W, 1, P.border));
  items.forEach((it, i) => {
    const isA = it.id === active;
    const cx  = i * tabW + tabW / 2;
    nav.children.push(F(i * tabW, 0, tabW, 72, 'transparent', { ch: [
      T(it.icon, cx - 14, 12, 28, 20, { size: 18, fill: isA ? P.cyan : P.textFade, align: 'center' }),
      T(it.label, cx - 24, 36, 48, 14, { size: 10, fill: isA ? P.cyan : P.textFade, align: 'center', weight: isA ? 600 : 400 }),
      ...(isA ? [R(cx - 14, 62, 28, 2, P.cyan, { r: 1 })] : []),
    ]}));
  });
  return nav;
};

// Radial ring health indicator — new territory for this run
const healthOrb = (ch, cx, cy, r, color, pct) => {
  const tr = r + 6;
  ch.push(
    E(cx - tr, cy - tr, tr * 2, tr * 2, 'transparent', { stroke: P.border2, sw: 2, sa: 'center' }),
    E(cx - tr, cy - tr, tr * 2, tr * 2, 'transparent', { stroke: color, sw: 2, sa: 'center', opacity: pct }),
    E(cx - r,  cy - r,  r * 2,  r * 2,  color + '18',  { stroke: color + '50', sw: 1 }),
    E(cx - 5,  cy - 5,  10,     10,     color),
  );
};

// ─── Screen 1: Mission Control ───────────────────────────────────────────────
const screen1 = screen('s1', 'Mission Control', (() => {
  const ch = [];

  // Grid texture
  for (let gx = 0; gx < W; gx += 30) ch.push(R(gx, 0, 1, H, P.border, { opacity: 0.22 }));
  for (let gy = 0; gy < H; gy += 30) ch.push(R(0, gy, W, 1, P.border, { opacity: 0.14 }));

  ch.push(...statusBar());

  ch.push(
    T('FLEET', 20, 44, 140, 30, { size: 24, weight: 800, fill: P.cyan, ls: 4 }),
    T('AGENT MISSION CONTROL', 20, 76, 260, 14, { size: 10, fill: P.textFade, ls: 2 }),
    F(W - 72, 50, 56, 22, P.green + '18', { r: 11, stroke: P.green + '50', sw: 1, ch: [
      E(10, 7, 8, 8, P.green),
      T('LIVE', 22, 4, 28, 14, { size: 10, weight: 700, fill: P.green }),
    ]}),
  );

  // Ambient glow
  ch.push(
    E(W / 2 - 90, 95, 180, 180, P.cyan + '06'),
    E(W / 2 - 55, 115, 110, 110, P.cyan + '04'),
  );

  // Stat cards
  const stats = [
    { label: 'Active', value: '14',   color: P.cyan  },
    { label: 'Queued', value: '53',   color: P.amber },
    { label: 'Done',   value: '2.8K', color: P.green },
  ];
  const sw = (W - 52) / 3;
  stats.forEach((s, i) => {
    const card = F(16 + i * (sw + 8), 104, sw, 88, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [] });
    card.children.push(
      E(sw / 2 - 28, -14, 56, 56, s.color + '08'),
      T(s.label, 0, 14, sw, 14, { size: 11, fill: P.textMid, align: 'center' }),
      T(s.value,  0, 32, sw, 32, { size: 28, weight: 700, fill: s.color, align: 'center', ls: -0.5 }),
    );
    ch.push(card);
  });

  ch.push(T('AGENT STATUS', 20, 206, 200, 14, { size: 10, weight: 600, fill: P.textFade, ls: 2 }));

  const orbData = [
    { name: 'Scout-01', color: P.cyan,   pct: 0.88, cx: 60  },
    { name: 'Recon-07', color: P.green,  pct: 0.97, cx: 155 },
    { name: 'Sync-03',  color: P.amber,  pct: 0.40, cx: 250 },
    { name: 'Forge-12', color: P.violet, pct: 0.72, cx: 335 },
  ];
  orbData.forEach(o => {
    healthOrb(ch, o.cx, 258, 20, o.color, o.pct);
    ch.push(T(o.name, o.cx - 34, 284, 68, 13, { size: 10, fill: P.textMid, align: 'center' }));
  });

  ch.push(
    R(0, 308, W, 1, P.border2),
    T('LIVE FEED', 20, 318, 160, 14, { size: 10, weight: 600, fill: P.textFade, ls: 2 }),
  );

  const feed = [
    { t: '09:41:22', a: 'Scout-01',  m: 'Fetched 342 records · batch 3/4',       c: P.cyan   },
    { t: '09:41:18', a: 'Recon-07',  m: 'Webhook delivered → Slack #ops',         c: P.green  },
    { t: '09:41:05', a: 'Forge-12',  m: 'Generated Q2 PDF report (4.2 MB)',        c: P.violet },
    { t: '09:40:51', a: 'Sync-03',   m: 'Rate-limited — retry in 28s',             c: P.amber  },
    { t: '09:40:44', a: 'Scout-01',  m: 'OAuth2 token refreshed',                  c: P.cyan   },
    { t: '09:40:31', a: 'Recon-07',  m: 'Memory checkpoint saved (1.1 MB)',        c: P.green  },
  ];
  feed.forEach((item, i) => {
    const fy = 340 + i * 54;
    const row = F(16, fy, W - 32, 46, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [] });
    row.children.push(
      E(13, 14, 8, 8, item.c),
      T(item.a, 28, 8, 110, 14, { size: 11, weight: 600, fill: item.c }),
      T(item.t, W - 32 - 68, 8, 62, 14, { size: 10, fill: P.textFade, align: 'right' }),
      T(item.m, 28, 26, W - 32 - 44, 14, { size: 11, fill: P.textMid }),
    );
    ch.push(row);
  });

  ch.push(bottomNav('control'));
  return ch;
})());

// ─── Screen 2: Agent Fleet ────────────────────────────────────────────────────
const screen2 = screen('s2', 'Agent Fleet', (() => {
  const ch = [];
  ch.push(...statusBar());
  ch.push(
    T('Agent Fleet', 20, 44, 260, 28, { size: 22, weight: 700, fill: P.text, ls: -0.5 }),
    T('16 deployed · 14 active', 20, 74, 240, 16, { size: 13, fill: P.textMid }),
  );

  ch.push(F(16, 102, W - 32, 42, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
    T('🔍', 14, 13, 18, 18, { size: 14 }),
    T('Search agents...', 36, 14, 200, 16, { size: 13, fill: P.textFade }),
  ]}));

  const filters = ['All', 'Running', 'Idle', 'Error'];
  let fx = 16;
  filters.forEach((f, i) => {
    const isA = i === 0, fw = f.length * 8.5 + 22;
    ch.push(F(fx, 158, fw, 28, isA ? P.cyan + '20' : P.surface, {
      r: 14, stroke: isA ? P.cyan + '60' : P.border, sw: 1,
      ch: [T(f, 11, 7, fw - 22, 14, { size: 11, fill: isA ? P.cyan : P.textMid, weight: isA ? 600 : 400 })],
    }));
    fx += fw + 8;
  });

  const agents = [
    { name: 'Scout-01',  role: 'Web Scraper',     status: 'Running', color: P.cyan,   hp: 88,  tasks: '1.2K' },
    { name: 'Recon-07',  role: 'Data Enrichment', status: 'Running', color: P.green,  hp: 97,  tasks: '847'  },
    { name: 'Sync-03',   role: 'API Connector',   status: 'Warning', color: P.amber,  hp: 40,  tasks: '223'  },
    { name: 'Forge-12',  role: 'Report Builder',  status: 'Running', color: P.violet, hp: 75,  tasks: '509'  },
    { name: 'Pulse-04',  role: 'Health Monitor',  status: 'Idle',    color: P.textMid,hp: 0,   tasks: '88'   },
    { name: 'Echo-09',   role: 'Notif Relay',     status: 'Running', color: P.cyan,   hp: 91,  tasks: '3.4K' },
  ];

  const cW = (W - 48) / 2;
  agents.forEach((ag, i) => {
    const col = i % 2, row2 = Math.floor(i / 2);
    const cx = 16 + col * (cW + 16), cy = 200 + row2 * 152;
    const card = F(cx, cy, cW, 140, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [] });
    ch.push(card);
    const orbR = 22, orbCx = cW / 2, orbCy = 42;
    healthOrb(card.children, orbCx, orbCy, orbR, ag.color, ag.hp / 100);
    card.children.push(
      T(ag.hp > 0 ? `${ag.hp}%` : '—', orbCx - 18, orbCy - 10, 36, 20,
        { size: 12, weight: 700, fill: ag.hp > 0 ? ag.color : P.textFade, align: 'center' }),
      T(ag.name, 10, 74, cW - 20, 16, { size: 12, weight: 700, fill: P.text }),
      T(ag.role, 10, 92, cW - 20, 12, { size: 10, fill: P.textMid }),
    );
    const sc = ag.status === 'Running' ? P.green : ag.status === 'Warning' ? P.amber : P.textFade;
    card.children.push(F(10, 110, cW - 20, 20, sc + '15', { r: 10, ch: [
      E(8, 6, 8, 8, sc),
      T(ag.status, 22, 3, 80, 14, { size: 10, fill: sc, weight: 600 }),
      T(ag.tasks, cW - 20 - 46, 3, 40, 14, { size: 10, fill: P.textFade, align: 'right' }),
    ]}));
  });

  ch.push(bottomNav('fleet'));
  return ch;
})());

// ─── Screen 3: Task Queue ─────────────────────────────────────────────────────
const screen3 = screen('s3', 'Task Queue', (() => {
  const ch = [];
  ch.push(...statusBar());
  ch.push(
    T('Task Queue', 20, 44, 260, 28, { size: 22, weight: 700, fill: P.text, ls: -0.5 }),
    T('53 pending · 14 running', 20, 74, 240, 16, { size: 13, fill: P.textMid }),
  );

  const tabs = ['All', 'Critical', 'High', 'Normal'];
  const tW = (W - 32) / tabs.length;
  const tabBar = F(16, 100, W - 32, 36, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [] });
  tabs.forEach((tab, i) => {
    const isA = i === 0;
    tabBar.children.push(F(i * tW, 0, tW, 36, isA ? P.surface3 : 'transparent', { r: 10, ch: [
      T(tab, 0, 10, tW, 16, { size: 12, fill: isA ? P.cyan : P.textMid, align: 'center', weight: isA ? 600 : 400 }),
    ]}));
  });
  ch.push(tabBar);

  ch.push(T('RUNNING NOW', 20, 150, 200, 14, { size: 10, weight: 600, fill: P.textFade, ls: 2 }));

  const running = [
    { id: 'TK-4821', title: 'Crawl competitor pricing (4 pages)', agent: 'Scout-01', pct: 68, color: P.cyan   },
    { id: 'TK-4819', title: 'Enrich 500 CRM leads via Clearbit',  agent: 'Recon-07', pct: 91, color: P.green  },
    { id: 'TK-4817', title: 'Build Q2 pipeline report',           agent: 'Forge-12', pct: 34, color: P.violet },
  ];
  running.forEach((task, i) => {
    const ty = 172 + i * 86;
    const card = F(16, ty, W - 32, 76, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [] });
    ch.push(card);
    const barW = W - 32 - 36;
    card.children.push(
      R(0, 0, 3, 76, task.color, { r: 2 }),
      T(task.id, 18, 10, 70, 12, { size: 10, fill: task.color, weight: 600 }),
      F(W - 32 - 72, 8, 66, 22, task.color + '18', { r: 11, stroke: task.color + '40', sw: 1, ch: [
        T('● Running', 10, 4, 50, 14, { size: 10, fill: task.color, weight: 600 }),
      ]}),
      T(task.title, 18, 26, W - 32 - 26, 16, { size: 13, weight: 600, fill: P.text }),
      T(`via ${task.agent}`, 18, 44, 120, 12, { size: 11, fill: P.textMid }),
      R(18, 60, barW, 4, P.border2, { r: 2 }),
      R(18, 60, Math.max(4, barW * task.pct / 100), 4, task.color, { r: 2 }),
      T(`${task.pct}%`, W - 32 - 36, 56, 30, 12, { size: 10, fill: task.color, align: 'right' }),
    );
  });

  ch.push(R(0, 434, W, 1, P.border2), T('PENDING', 20, 444, 200, 14, { size: 10, weight: 600, fill: P.textFade, ls: 2 }));

  const pending = [
    { id: 'TK-4820', title: 'Send daily digest emails',      priority: 'CRITICAL', c: P.red     },
    { id: 'TK-4818', title: 'Sync CRM contacts to HubSpot',  priority: 'HIGH',     c: P.amber   },
    { id: 'TK-4816', title: 'Archive completed task batch',   priority: 'NORMAL',   c: P.textMid },
    { id: 'TK-4815', title: 'Refresh OAuth tokens',           priority: 'HIGH',     c: P.amber   },
    { id: 'TK-4814', title: 'Generate weekly summary PDF',    priority: 'NORMAL',   c: P.textMid },
  ];
  pending.forEach((task, i) => {
    const ty = 466 + i * 54;
    const card = F(16, ty, W - 32, 44, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [] });
    ch.push(card);
    card.children.push(
      T(task.id,    14, 6,  70, 12, { size: 10, fill: task.c, weight: 600 }),
      T(task.title, 14, 22, W - 32 - 110, 14, { size: 12, fill: P.text }),
      F(W - 32 - 76, 10, task.priority.length * 6.5 + 16, 22, task.c + '18', {
        r: 11, stroke: task.c + '40', sw: 1,
        ch: [T(task.priority, 8, 4, task.priority.length * 6.5, 14, { size: 9, fill: task.c, weight: 700 })],
      }),
    );
  });

  ch.push(bottomNav('queue'));
  return ch;
})());

// ─── Screen 4: Trace Log ──────────────────────────────────────────────────────
const screen4 = screen('s4', 'Trace Log', (() => {
  const ch = [];
  ch.push(...statusBar());
  ch.push(
    F(16, 44, 32, 32, P.surface, { r: 8, stroke: P.border, sw: 1, ch: [T('←', 8, 7, 16, 18, { size: 14, fill: P.text })] }),
    T('Scout-01', 60, 44, 200, 26, { size: 20, weight: 700, fill: P.text }),
    T('Web Scraper · TK-4821', 60, 70, 240, 14, { size: 12, fill: P.textMid }),
    F(W - 80, 50, 64, 22, P.cyan + '18', { r: 11, stroke: P.cyan + '40', sw: 1, ch: [
      E(10, 7, 8, 8, P.cyan), T('Active', 22, 4, 36, 14, { size: 10, fill: P.cyan, weight: 600 }),
    ]}),
  );

  const summStats = [
    { l: 'Steps',    v: '12/18', c: P.cyan  },
    { l: 'Duration', v: '4m 12s',c: P.text  },
    { l: 'Memory',   v: '128MB', c: P.violet},
    { l: 'Tokens',   v: '14.2K', c: P.amber },
  ];
  const ssW = (W - 32 - 24) / 4;
  summStats.forEach((s, i) => {
    ch.push(F(16 + i * (ssW + 8), 100, ssW, 52, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      T(s.l, 0, 8,  ssW, 13, { size: 10, fill: P.textMid, align: 'center' }),
      T(s.v, 0, 26, ssW, 18, { size: 13, weight: 700, fill: s.c, align: 'center' }),
    ]}));
  });

  ch.push(R(0, 164, W, 1, P.border2), T('EXECUTION TRACE', 20, 174, 200, 14, { size: 10, weight: 600, fill: P.textFade, ls: 2 }));

  const steps = [
    { n: 1,  label: 'Initialize agent context',     st: 'done',    dur: '0.1s'  },
    { n: 2,  label: 'Load URL list (342 targets)',   st: 'done',    dur: '0.4s'  },
    { n: 3,  label: 'OAuth2 authentication',        st: 'done',    dur: '1.2s'  },
    { n: 4,  label: 'Fetch batch 1/4',              st: 'done',    dur: '12.4s' },
    { n: 5,  label: 'Extract structured data',      st: 'done',    dur: '3.1s'  },
    { n: 6,  label: 'Validate schema (342 records)',st: 'done',    dur: '0.8s'  },
    { n: 7,  label: 'Fetch batch 2/4',              st: 'done',    dur: '11.9s' },
    { n: 8,  label: 'Deduplicate + normalize',      st: 'done',    dur: '1.4s'  },
    { n: 9,  label: 'Checkpoint memory save',       st: 'done',    dur: '0.2s'  },
    { n: 10, label: 'Fetch batch 3/4',              st: 'done',    dur: '12.1s' },
    { n: 11, label: 'LLM extraction pass',          st: 'done',    dur: '8.7s'  },
    { n: 12, label: 'Fetch batch 4/4',              st: 'running', dur: '...'   },
    { n: 13, label: 'Final dedup + merge',          st: 'pending', dur: '—'     },
    { n: 14, label: 'Write to database',            st: 'pending', dur: '—'     },
  ];
  const lx = 36;
  steps.forEach((step, i) => {
    const sy = 196 + i * 44;
    if (sy > H - 90) return;
    const dc = step.st === 'done' ? P.green : step.st === 'running' ? P.cyan : P.textFade;
    const icon = step.st === 'done' ? '✓' : step.st === 'running' ? '◎' : '○';
    if (i < steps.length - 1 && (196 + (i + 1) * 44) < H - 90)
      ch.push(R(lx, sy + 14, 1, 44, P.border2));
    ch.push(
      E(lx - 7, sy + 1, 14, 14, dc + (step.st === 'pending' ? '25' : '20'),
        { stroke: dc, sw: step.st === 'running' ? 2 : 1 }),
      T(icon, lx - 5, sy + 2, 10, 10, { size: 9, fill: dc, align: 'center' }),
      T(`${String(step.n).padStart(2, '0')}  ${step.label}`, 52, sy, W - 32 - 86, 14,
        { size: 11, fill: step.st === 'pending' ? P.textFade : P.text, weight: step.st === 'running' ? 600 : 400 }),
      T(step.dur, W - 56, sy, 40, 14, { size: 11, fill: dc, align: 'right' }),
    );
  });

  ch.push(bottomNav('trace'));
  return ch;
})());

// ─── Screen 5: Deploy Agent ───────────────────────────────────────────────────
const screen5 = screen('s5', 'Deploy Agent', (() => {
  const ch = [];
  ch.push(...statusBar());
  ch.push(
    F(16, 44, 32, 32, P.surface, { r: 8, stroke: P.border, sw: 1, ch: [T('←', 8, 7, 16, 18, { size: 14, fill: P.text })] }),
    T('Deploy Agent', 60, 50, 220, 22, { size: 20, weight: 700, fill: P.text }),
  );

  const field = (label, val, y, opts = {}) => {
    const fh = opts.tall ? 72 : 44;
    return F(16, y, W - 32, fh + 22, 'transparent', { ch: [
      T(label, 0, 0, W - 32, 14, { size: 11, fill: P.textMid, weight: 500 }),
      F(0, 18, W - 32, fh, opts.active ? P.surface2 : P.surface, {
        r: 10, stroke: opts.active ? P.cyan + '50' : P.border, sw: 1,
        ch: [T(val, 14, opts.tall ? 12 : 14, W - 32 - 28, opts.tall ? 48 : 16,
          { size: 13, fill: opts.placeholder ? P.textFade : P.text,
            ...(opts.tall ? { lh: 1.5 } : {}) })],
      }),
    ]});
  };

  ch.push(field('Agent Name',        'e.g. Scout-02',           88,  { placeholder: true }));
  ch.push(field('Agent Type',        'Web Scraper  ▾',          174, {}));
  ch.push(field('Target Source URL', 'https://target.example.com', 260, { placeholder: true }));
  ch.push(field('System Prompt',
    'Extract pricing and product names from each page, return structured JSON with fields: name, price, currency, url...',
    346, { tall: true }));

  ch.push(T('TRIGGER', 20, 450, 160, 14, { size: 10, weight: 600, fill: P.textFade, ls: 2 }));
  const trigs = [
    { label: 'Schedule', icon: '⏰', active: true  },
    { label: 'Webhook',  icon: '⚡', active: false },
    { label: 'Manual',   icon: '▶',  active: false },
  ];
  const trigW = (W - 48) / 3;
  trigs.forEach((tg, i) => {
    ch.push(F(16 + i * (trigW + 8), 470, trigW, 52, tg.active ? P.cyan + '15' : P.surface, {
      r: 12, stroke: tg.active ? P.cyan + '55' : P.border, sw: tg.active ? 1.5 : 1,
      ch: [
        T(tg.icon, trigW / 2 - 10, 8,  20, 20, { size: 16, align: 'center' }),
        T(tg.label, 0, 30, trigW, 14, { size: 11, fill: tg.active ? P.cyan : P.textMid, align: 'center', weight: tg.active ? 600 : 400 }),
      ],
    }));
  });

  ch.push(
    T('Cron Expression', 20, 534, 160, 14, { size: 11, fill: P.textMid, weight: 500 }),
    F(16, 552, W - 32, 44, P.surface2, { r: 10, stroke: P.cyan + '40', sw: 1, ch: [
      T('0 */6 * * *', 14, 14, 130, 16, { size: 13, fill: P.cyan }),
      T('Every 6 hours', W - 32 - 116, 14, 100, 16, { size: 11, fill: P.textMid, align: 'right' }),
    ]}),
  );

  ch.push(
    F(16, 610, W - 32, 52, P.cyan, { r: 14, ch: [
      T('⚡  Deploy Agent', 0, 17, W - 32, 18, { size: 15, weight: 700, fill: P.bg, align: 'center' }),
    ]}),
    T('Agent starts within 30 seconds of deploy', 0, 670, W, 14, { size: 11, fill: P.textFade, align: 'center' }),
  );

  return ch;
})());

// ─── Assemble + write ────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  title:   'FLEET — Run Your Agents, Not Your Tools',
  screens: [screen1, screen2, screen3, screen4, screen5],
};

const outPath = path.join(__dirname, 'fleet.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ fleet.pen written (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
console.log(`  Screens: ${pen.screens.map(s => s.label).join(', ')}`);
