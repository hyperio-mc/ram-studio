'use strict';
// forge-gen.js — FORGE: AI Dev Subscription Platform
//
// Inspired by:
// 1. Good Fella (Awwwards SOTD Mar 18 2026, good-fella.com) — subscription-based
//    dev studio, numbered process steps, minimal precision, "one monthly fee" model
// 2. Linear.app (darkmodedesign.com) — near-black dark UI, AI agent Codex integration
//    in sidebar showing live task work, electric accent on pure dark
// 3. Mixpanel (lapa.ninja / mixpanel.com) — "agentic era" trend, AI-native analytics
//    dashboards, animated split-letter type, data-as-beauty aesthetic
//
// Challenge: Design a dark-mode AI Development Subscription service — where
// engineering teams subscribe to AI coding agents the same way they'd hire Good Fella's
// frontend studio: one flat monthly fee, unlimited requests, agents deliver 24/7.
// The UI reflects Linear's Codex integration pattern — live agent status, code diffs,
// task queues — wrapped in Good Fella's subscription-first aesthetic.
//
// Screens: 5 mobile + 5 desktop (10 total)
// Run: node forge-gen.js

const fs    = require('fs');
const path  = require('path');
const https = require('https');

// ── Config ────────────────────────────────────────────────────────────────────
const CONFIG     = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GH_TOKEN   = CONFIG.GITHUB_TOKEN || '';
const GH_REPO    = CONFIG.GITHUB_REPO  || '';
const SLUG       = 'forge';
const NOW        = new Date().toISOString();
const HEARTBEAT_ID = `hb-forge-${Date.now()}`;

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:        '#060608',
  surface:   '#0c0c12',
  surface2:  '#131320',
  surface3:  '#1a1a28',
  border:    '#1e1e2e',
  border2:   '#2a2a3e',
  muted:     '#44445e',
  muted2:    '#7070a0',
  fg:        '#eeeef8',
  fg2:       '#8888b0',
  // accents
  green:     '#3dffa0',   // terminal green — agent ACTIVE
  greenDim:  '#0d3322',
  violet:    '#7c5af5',   // violet — premium/PRO
  violetDim: '#1a1040',
  violetLt:  '#a68fff',
  amber:     '#f5a623',   // QUEUED / PENDING
  amberDim:  '#3a2708',
  red:       '#f04a50',   // ERROR / PAUSED
  redDim:    '#350d10',
  blue:      '#38b8f5',   // INFO / DONE
  blueDim:   '#0a2535',
};

// ── ID generator ──────────────────────────────────────────────────────────────
let _id = 0;
const uid = () => `fg${++_id}`;

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
  fontSize: opts.size || 12,
  fontWeight: String(opts.weight || 400),
  fill: opts.fill || P.fg,
  textAlign: opts.align || 'left',
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh !== undefined ? { lineHeight: opts.lh } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
});

const HR = (x, y, w, fill = P.border) => F(x, y, w, 1, fill);

// ── Badge / pill ──────────────────────────────────────────────────────────────
const Pill = (x, y, label, fg, bg, opts = {}) => {
  const w = opts.w || Math.max(48, label.length * 7 + 16);
  return F(x, y, w, 20, bg, {
    r: 10, ch: [
      T(label, 0, 2, w, 16, { size: 9, weight: 700, fill: fg, align: 'center', ls: 1 }),
    ],
  });
};

// ── Stat tile ─────────────────────────────────────────────────────────────────
const StatTile = (x, y, w, h, val, label, accent) => F(x, y, w, h, P.surface, {
  r: 8, stroke: P.border, ch: [
    T(val,   12, 14, w - 24, 28, { size: 22, weight: 800, fill: accent }),
    T(label, 12, 46, w - 24, 16, { size: 10, weight: 400, fill: P.fg2, ls: 0.5 }),
  ],
});

// ── Agent row (mobile) ────────────────────────────────────────────────────────
const AgentRow = (x, y, w, id, name, status, task, statusColor, statusBg) => {
  const row = F(x, y, w, 72, P.surface, { r: 8, stroke: P.border, ch: [] });
  // Left color bar
  row.children.push(F(0, 0, 3, 72, statusColor, { r: 1 }));
  // Avatar circle
  row.children.push(E(14, 20, 32, 32, statusBg));
  row.children.push(T('◈', 14, 22, 32, 28, { size: 15, fill: statusColor, align: 'center' }));
  // ID badge
  row.children.push(T(id, 56, 12, 90, 14, { size: 9, weight: 700, fill: statusColor, ls: 1 }));
  // Name
  row.children.push(T(name, 56, 26, 140, 16, { size: 13, weight: 700 }));
  // Task text
  row.children.push(T(task, 56, 44, w - 80, 14, { size: 10, fill: P.fg2 }));
  // Status chip
  const chipW = 52;
  row.children.push(Pill(w - chipW - 10, 24, status, statusColor, statusBg, { w: chipW }));
  return row;
};

// ── Task card (mobile) ────────────────────────────────────────────────────────
const TaskCard = (x, y, w, taskId, title, agent, priority, progress, pColor, pBg) => {
  const card = F(x, y, w, 80, P.surface, { r: 8, stroke: P.border, ch: [] });
  // Top row
  card.children.push(T(taskId, 12, 12, 80, 12, { size: 9, fill: P.muted2, ls: 1 }));
  card.children.push(Pill(w - 70, 10, priority, pColor, pBg, { w: 60 }));
  // Title
  card.children.push(T(title, 12, 28, w - 24, 16, { size: 12, weight: 700 }));
  // Agent
  card.children.push(T(`→ ${agent}`, 12, 48, 150, 12, { size: 10, fill: pColor }));
  // Progress bar bg
  card.children.push(F(12, 62, w - 24, 4, P.border, { r: 2 }));
  card.children.push(F(12, 62, Math.max(4, Math.round((w - 24) * progress)), 4, pColor, { r: 2 }));
  return card;
};

// ── Code line (mobile/desktop) ────────────────────────────────────────────────
const CodeLine = (x, y, w, lineNum, code, type) => {
  const bg = type === 'add' ? '#0d2e1a' : type === 'del' ? '#2e0d10' : 'transparent';
  const fg = type === 'add' ? P.green : type === 'del' ? P.red : P.fg2;
  const prefix = type === 'add' ? '+' : type === 'del' ? '−' : ' ';
  return F(x, y, w, 18, bg, { ch: [
    T(String(lineNum).padStart(3), 8, 2, 28, 14, { size: 9, fill: P.muted, align: 'right' }),
    T(prefix, 40, 2, 12, 14, { size: 9, fill: fg, weight: 700 }),
    T(code, 54, 2, w - 60, 14, { size: 9, fill: fg }),
  ]});
};

// ══════════════════════════════════════════════════════════════════════════════
// MOBILE SCREENS (390 × 844)
// ══════════════════════════════════════════════════════════════════════════════
const MW = 390, MH = 844;

// ── M1: Landing Hero ──────────────────────────────────────────────────────────
function mobileHero() {
  const s = F(0, 0, MW, MH, P.bg, { clip: true, ch: [] });

  // Background glow
  s.children.push(E(-80, -80, 400, 400, P.violetDim, { opacity: 0.5 }));
  s.children.push(E(100, 500, 280, 280, P.greenDim, { opacity: 0.4 }));

  // Nav bar
  s.children.push(F(0, 0, MW, 56, P.bg, { ch: [
    T('FORGE', 20, 18, 80, 20, { size: 14, weight: 900, fill: P.green, ls: 3 }),
    Pill(MW - 90, 16, 'HIRE NOW', P.bg, P.green, { w: 72 }),
  ]}));

  // Large display type
  s.children.push(T('Your AI\ndev team.', 20, 80, 320, 96, { size: 44, weight: 900, fill: P.fg, lh: 1.05 }));
  s.children.push(T('One monthly fee.', 20, 180, 320, 40, { size: 22, weight: 300, fill: P.violetLt }));

  // Sub-line
  s.children.push(T('Unlimited code requests. Agents deliver\nwithin 2–5 business days. Pause anytime.', 20, 236, 320, 44, { size: 13, fill: P.fg2, lh: 1.6 }));

  // CTA buttons
  s.children.push(F(20, 300, 220, 44, P.green, { r: 6, ch: [
    T('See our plans', 0, 13, 220, 18, { size: 13, weight: 700, fill: P.bg, align: 'center' }),
  ]}));
  s.children.push(F(252, 300, 118, 44, 'transparent', { r: 6, stroke: P.border2, ch: [
    T('View work', 0, 13, 118, 18, { size: 13, weight: 600, fill: P.fg, align: 'center' }),
  ]}));

  // Stats strip
  s.children.push(HR(20, 368, 350));
  const stats = [['47+','Agents'], ['2.4d','Avg delivery'], ['98%','Uptime']];
  stats.forEach(([v, l], i) => {
    const x = 20 + i * 118;
    s.children.push(T(v, x, 380, 100, 28, { size: 22, weight: 800, fill: P.green }));
    s.children.push(T(l, x, 410, 100, 14, { size: 10, fill: P.fg2, ls: 0.5 }));
  });

  // Process steps (Good Fella-inspired)
  s.children.push(HR(20, 444, 350));
  s.children.push(T('HOW IT WORKS', 20, 456, 200, 14, { size: 9, weight: 700, fill: P.muted2, ls: 2 }));
  const steps = [
    ['01', 'Subscribe', 'Pick a plan. No contracts. Pause anytime.'],
    ['02', 'Request', 'Drop tasks in Slack or via the dashboard.'],
    ['03', 'Ship', 'Agents deliver clean code, every 2–5 days.'],
  ];
  steps.forEach(([num, title, desc], i) => {
    const y = 482 + i * 82;
    s.children.push(T(num, 20, y, 28, 28, { size: 20, weight: 900, fill: P.violet, opacity: 0.6 }));
    s.children.push(T(title, 52, y + 2, 200, 16, { size: 13, weight: 700 }));
    s.children.push(T(desc, 52, y + 20, 300, 28, { size: 11, fill: P.fg2, lh: 1.5 }));
  });

  // Bottom nav
  s.children.push(F(0, MH - 64, MW, 64, P.surface, { stroke: P.border, ch: [
    ...['Home','Agents','Tasks','Billing'].map((label, i) => {
      const active = i === 0;
      return T(label, 20 + i * 90, 20, 80, 24, { size: 11, weight: active ? 700 : 400, fill: active ? P.green : P.muted2, align: 'center' });
    }),
  ]}));

  s.name = 'M1 — Landing Hero';
  return s;
}

// ── M2: Agent Roster ──────────────────────────────────────────────────────────
function mobileAgents() {
  const s = F(0, 0, MW, MH, P.bg, { clip: true, ch: [] });

  // Header
  s.children.push(F(0, 0, MW, 56, P.bg, { ch: [
    T('← Back', 20, 18, 60, 20, { size: 12, fill: P.muted2 }),
    T('AGENTS', 0, 18, MW, 20, { size: 12, weight: 700, fill: P.fg, align: 'center', ls: 2 }),
  ]}));

  // Summary strip
  s.children.push(F(0, 56, MW, 64, P.surface, { ch: [
    StatTile(12, 8, 100, 48, '4', 'ACTIVE', P.green),
    StatTile(120, 8, 100, 48, '1', 'QUEUED', P.amber),
    StatTile(228, 8, 100, 48, '11', 'TASKS', P.violetLt),
    StatTile(336, 8, 42, 48, '3', 'IDLE', P.muted2),
  ]}));

  // Section label
  s.children.push(T('ACTIVE NOW', 20, 134, 200, 14, { size: 9, weight: 700, fill: P.green, ls: 2 }));

  // Agent rows
  const agents = [
    { id: 'FORGE-01', name: 'Atlas', status: 'ACTIVE', task: 'Refactoring auth module…', sc: P.green, sb: P.greenDim },
    { id: 'FORGE-02', name: 'Briar', status: 'ACTIVE', task: 'Writing unit tests for API…', sc: P.green, sb: P.greenDim },
    { id: 'FORGE-03', name: 'Cinder', status: 'ACTIVE', task: 'Fixing checkout race condition…', sc: P.green, sb: P.greenDim },
    { id: 'FORGE-04', name: 'Dusk', status: 'QUEUED', task: 'Waiting: migrate DB schema…', sc: P.amber, sb: P.amberDim },
    { id: 'FORGE-05', name: 'Ember', status: 'IDLE', task: 'Available for new requests', sc: P.muted2, sb: P.surface2 },
  ];
  agents.forEach((a, i) => {
    s.children.push(AgentRow(12, 156 + i * 82, MW - 24, a.id, a.name, a.status, a.task, a.sc, a.sb));
  });

  // Bottom nav
  s.children.push(F(0, MH - 64, MW, 64, P.surface, { stroke: P.border, ch: [
    ...['Home','Agents','Tasks','Billing'].map((label, i) => {
      const active = i === 1;
      return T(label, 20 + i * 90, 20, 80, 24, { size: 11, weight: active ? 700 : 400, fill: active ? P.green : P.muted2, align: 'center' });
    }),
  ]}));

  s.name = 'M2 — Agent Roster';
  return s;
}

// ── M3: Task Queue ────────────────────────────────────────────────────────────
function mobileTasks() {
  const s = F(0, 0, MW, MH, P.bg, { clip: true, ch: [] });

  // Header
  s.children.push(F(0, 0, MW, 56, P.bg, { ch: [
    T('← Agents', 20, 18, 72, 20, { size: 12, fill: P.muted2 }),
    T('TASK QUEUE', 0, 18, MW, 20, { size: 12, weight: 700, fill: P.fg, align: 'center', ls: 2 }),
    T('+ ADD', MW - 60, 18, 44, 20, { size: 11, weight: 700, fill: P.green }),
  ]}));

  // Filter pills
  const filters = ['ALL', 'IN PROGRESS', 'QUEUED', 'DONE'];
  filters.forEach((f, i) => {
    const active = i === 0;
    s.children.push(F(12 + i * 88, 62, 80, 26, active ? P.violetDim : P.surface, {
      r: 13, stroke: active ? P.violet : P.border, ch: [
        T(f, 0, 6, 80, 14, { size: 9, weight: active ? 700 : 400, fill: active ? P.violetLt : P.muted2, align: 'center', ls: 0.8 }),
      ],
    }));
  });

  // Task cards
  const tasks = [
    { id: 'TSK-0047', title: 'Refactor auth middleware', agent: 'FORGE-01 · Atlas', pri: 'HIGH', prog: 0.65, pc: P.red, pb: P.redDim },
    { id: 'TSK-0048', title: 'Add unit tests for payments', agent: 'FORGE-02 · Briar', pri: 'MED', prog: 0.4, pc: P.amber, pb: P.amberDim },
    { id: 'TSK-0049', title: 'Fix checkout race condition', agent: 'FORGE-03 · Cinder', pri: 'HIGH', prog: 0.2, pc: P.red, pb: P.redDim },
    { id: 'TSK-0050', title: 'Migrate users DB schema', agent: 'FORGE-04 · Dusk', pri: 'LOW', prog: 0, pc: P.muted2, pb: P.surface2 },
    { id: 'TSK-0046', title: 'Update Stripe webhook handler', agent: 'FORGE-01 · Atlas', pri: 'DONE', prog: 1, pc: P.green, pb: P.greenDim },
    { id: 'TSK-0045', title: 'Build CSV export feature', agent: 'FORGE-02 · Briar', pri: 'DONE', prog: 1, pc: P.green, pb: P.greenDim },
  ];
  tasks.forEach((t, i) => {
    s.children.push(TaskCard(12, 100 + i * 90, MW - 24, t.id, t.title, t.agent, t.pri, t.prog, t.pc, t.pb));
  });

  // Bottom nav
  s.children.push(F(0, MH - 64, MW, 64, P.surface, { stroke: P.border, ch: [
    ...['Home','Agents','Tasks','Billing'].map((label, i) => {
      const active = i === 2;
      return T(label, 20 + i * 90, 20, 80, 24, { size: 11, weight: active ? 700 : 400, fill: active ? P.green : P.muted2, align: 'center' });
    }),
  ]}));

  s.name = 'M3 — Task Queue';
  return s;
}

// ── M4: Live Code Review ──────────────────────────────────────────────────────
function mobileCodeReview() {
  const s = F(0, 0, MW, MH, P.bg, { clip: true, ch: [] });

  // Header
  s.children.push(F(0, 0, MW, 56, P.bg, { ch: [
    T('← Tasks', 20, 18, 60, 20, { size: 12, fill: P.muted2 }),
    T('CODE REVIEW', 0, 18, MW, 20, { size: 12, weight: 700, fill: P.fg, align: 'center', ls: 2 }),
  ]}));

  // Task info card
  s.children.push(F(12, 64, MW - 24, 76, P.surface, { r: 8, stroke: P.border, ch: [
    T('TSK-0049', 12, 10, 120, 14, { size: 9, fill: P.muted2, ls: 1 }),
    Pill(MW - 90, 8, 'IN PROGRESS', P.green, P.greenDim, { w: 78 }),
    T('Fix checkout race condition', 12, 26, MW - 36, 18, { size: 13, weight: 700 }),
    T('FORGE-03 · Cinder', 12, 48, 160, 14, { size: 10, fill: P.green }),
    // Progress bar
    F(12, 62, MW - 48, 4, P.border, { r: 2 }),
    F(12, 62, Math.round((MW - 48) * 0.2), 4, P.green, { r: 2 }),
    T('20%', MW - 48, 58, 36, 12, { size: 9, fill: P.muted2, align: 'right' }),
  ]}));

  // Agent status chip
  s.children.push(F(12, 148, MW - 24, 32, P.greenDim, { r: 6, ch: [
    T('◉  FORGE-03 is examining file: checkout/useCart.ts', 12, 9, MW - 36, 14, { size: 10, fill: P.green }),
  ]}));

  // Code diff block
  s.children.push(F(12, 188, MW - 24, 260, P.surface2, { r: 8, stroke: P.border, clip: true, ch: [
    // File header
    F(0, 0, MW - 24, 28, P.surface3, { ch: [
      T('checkout/useCart.ts', 12, 7, 240, 14, { size: 10, fill: P.fg2 }),
      T('+4 −2', MW - 80, 7, 60, 14, { size: 9, fill: P.muted2, align: 'right' }),
    ]}),
    // Code lines
    CodeLine(0, 28,  MW - 24, 24, 'const checkout = async (cart) => {', null),
    CodeLine(0, 46,  MW - 24, 25, '  if (!cart.lock) {', null),
    CodeLine(0, 64,  MW - 24, 26, '    await cart.acquire();', 'del'),
    CodeLine(0, 82,  MW - 24, 26, '    const lock = await mutex.acquire();', 'add'),
    CodeLine(0, 100, MW - 24, 27, '    try {', 'add'),
    CodeLine(0, 118, MW - 24, 28, '      await processPayment(cart);', 'add'),
    CodeLine(0, 136, MW - 24, 29, '    } finally { lock.release(); }', 'add'),
    CodeLine(0, 154, MW - 24, 30, '  }', null),
    CodeLine(0, 172, MW - 24, 31, '};', null),
    CodeLine(0, 190, MW - 24, 32, '', null),
    CodeLine(0, 208, MW - 24, 33, '// Race condition resolved — mutex ensures', null),
    CodeLine(0, 226, MW - 24, 34, '// atomic cart locking during checkout.', null),
  ]}));

  // Agent thinking area
  s.children.push(F(12, 456, MW - 24, 80, P.surface, { r: 8, stroke: P.greenDim, ch: [
    T('◈  FORGE-03 · Cinder', 12, 12, 200, 14, { size: 10, weight: 700, fill: P.green }),
    T('Identified async race condition in cart\nlocking logic. Applying mutex pattern…', 12, 30, MW - 36, 36, { size: 11, fill: P.fg2, lh: 1.5 }),
  ]}));

  // Action buttons
  s.children.push(F(12, 548, (MW - 36) / 2, 40, P.surface, { r: 6, stroke: P.border, ch: [
    T('Request Changes', 0, 12, (MW - 36) / 2, 16, { size: 12, weight: 600, fill: P.fg, align: 'center' }),
  ]}));
  s.children.push(F(12 + (MW - 36) / 2 + 12, 548, (MW - 36) / 2, 40, P.green, { r: 6, ch: [
    T('Approve & Merge', 0, 12, (MW - 36) / 2, 16, { size: 12, weight: 700, fill: P.bg, align: 'center' }),
  ]}));

  // Bottom nav
  s.children.push(F(0, MH - 64, MW, 64, P.surface, { stroke: P.border, ch: [
    ...['Home','Agents','Tasks','Billing'].map((label, i) => {
      const active = i === 2;
      return T(label, 20 + i * 90, 20, 80, 24, { size: 11, weight: active ? 700 : 400, fill: active ? P.green : P.muted2, align: 'center' });
    }),
  ]}));

  s.name = 'M4 — Live Code Review';
  return s;
}

// ── M5: Pricing Plans ─────────────────────────────────────────────────────────
function mobilePricing() {
  const s = F(0, 0, MW, MH, P.bg, { clip: true, ch: [] });

  // Background glow
  s.children.push(E(-60, 200, 300, 300, P.violetDim, { opacity: 0.4 }));

  // Header
  s.children.push(F(0, 0, MW, 56, P.bg, { ch: [
    T('← Home', 20, 18, 60, 20, { size: 12, fill: P.muted2 }),
    T('PLANS', 0, 18, MW, 20, { size: 12, weight: 700, fill: P.fg, align: 'center', ls: 2 }),
  ]}));

  // Title
  s.children.push(T('Simple,\ntransparent\npricing.', 20, 72, 300, 90, { size: 32, weight: 900, lh: 1.1 }));
  s.children.push(T('Pause or cancel anytime.', 20, 168, 260, 16, { size: 13, fill: P.fg2 }));

  // Plan cards
  const plans = [
    { name: 'STARTER', price: '$2,499', per: '/mo', agents: '1 Agent', reqs: '4 active requests', highlight: false, color: P.muted2 },
    { name: 'PRO', price: '$4,999', per: '/mo', agents: '3 Agents', reqs: '12 active requests', highlight: true, color: P.violet },
    { name: 'SCALE', price: '$9,999', per: '/mo', agents: '8 Agents', reqs: 'Unlimited requests', highlight: false, color: P.green },
  ];
  plans.forEach((plan, i) => {
    const y = 196 + i * 168;
    const card = F(12, y, MW - 24, 156, plan.highlight ? P.violetDim : P.surface, {
      r: 10, stroke: plan.highlight ? P.violet : P.border, ch: [],
    });
    if (plan.highlight) card.children.push(Pill(MW - 90, 12, 'POPULAR', P.violet, P.surface, { w: 64 }));
    card.children.push(T(plan.name, 16, 14, 120, 16, { size: 10, weight: 700, fill: plan.color, ls: 2 }));
    card.children.push(T(plan.price, 16, 36, 150, 36, { size: 30, weight: 900, fill: P.fg }));
    card.children.push(T(plan.per, 16 + 120, 52, 40, 16, { size: 12, fill: P.fg2 }));
    card.children.push(T(`✓  ${plan.agents}`, 16, 80, MW - 48, 16, { size: 11, fill: P.fg2 }));
    card.children.push(T(`✓  ${plan.reqs}`, 16, 98, MW - 48, 16, { size: 11, fill: P.fg2 }));
    card.children.push(T('✓  Unlimited revisions', 16, 116, MW - 48, 16, { size: 11, fill: P.fg2 }));
    card.children.push(F(16, 132, MW - 56, 14, plan.highlight ? P.violet : 'transparent', {
      r: 4, stroke: plan.highlight ? 'transparent' : plan.color, ch: [
        T('Get started', 0, 1, MW - 56, 12, { size: 9, weight: 700, fill: plan.highlight ? P.bg : plan.color, align: 'center' }),
      ],
    }));
    s.children.push(card);
  });

  // Bottom nav
  s.children.push(F(0, MH - 64, MW, 64, P.surface, { stroke: P.border, ch: [
    ...['Home','Agents','Tasks','Billing'].map((label, i) => {
      const active = i === 3;
      return T(label, 20 + i * 90, 20, 80, 24, { size: 11, weight: active ? 700 : 400, fill: active ? P.green : P.muted2, align: 'center' });
    }),
  ]}));

  s.name = 'M5 — Pricing Plans';
  return s;
}

// ══════════════════════════════════════════════════════════════════════════════
// DESKTOP SCREENS (1440 × 900)
// ══════════════════════════════════════════════════════════════════════════════
const DW = 1440, DH = 900;

const SB_W = 220; // sidebar width

// ── Desktop nav bar ───────────────────────────────────────────────────────────
function deskNav(ch = []) {
  return F(0, 0, DW, 56, P.surface, { stroke: P.border, ch: [
    T('FORGE', 32, 18, 80, 20, { size: 14, weight: 900, fill: P.green, ls: 3 }),
    ...['Home','Agents','Tasks','Analytics','Billing'].map((label, i) =>
      T(label, 160 + i * 120, 18, 100, 20, { size: 12, weight: 400, fill: i === 0 ? P.fg : P.muted2 })
    ),
    Pill(DW - 120, 14, 'DASHBOARD', P.bg, P.green, { w: 90 }),
    ...ch,
  ]});
}

// ── Desktop sidebar ───────────────────────────────────────────────────────────
function deskSidebar(activeItem = 0) {
  const items = ['Overview','Agents','Tasks','Analytics','Billing','Settings'];
  return F(0, 56, SB_W, DH - 56, P.surface, { stroke: P.border, ch: [
    T('WORKSPACE', 20, 24, 180, 12, { size: 9, weight: 700, fill: P.muted, ls: 2 }),
    ...items.map((item, i) => {
      const active = i === activeItem;
      const itemBg = active ? P.violetDim : 'transparent';
      return F(8, 44 + i * 40, SB_W - 16, 32, itemBg, { r: 6, ch: [
        T(item, 16, 8, SB_W - 48, 16, { size: 12, weight: active ? 700 : 400, fill: active ? P.violetLt : P.fg2 }),
        ...(active ? [F(SB_W - 26, 10, 4, 12, P.violet, { r: 2 })] : []),
      ]});
    }),
    HR(0, 306, SB_W),
    T('AGENTS', 20, 318, 180, 12, { size: 9, weight: 700, fill: P.muted, ls: 2 }),
    ...['FORGE-01','FORGE-02','FORGE-03','FORGE-04'].map((id, i) => {
      const colors = [P.green, P.green, P.green, P.amber];
      return F(8, 338 + i * 36, SB_W - 16, 28, 'transparent', { r: 4, ch: [
        E(16, 6, 14, 14, colors[i] + '33'),
        T('◈', 16, 5, 14, 14, { size: 7, fill: colors[i], align: 'center' }),
        T(id, 36, 6, 120, 14, { size: 11, fill: P.fg2 }),
        E(SB_W - 28, 10, 8, 8, colors[i]),
      ]});
    }),
  ]});
}

// ── D1: Desktop Landing ───────────────────────────────────────────────────────
function desktopHero() {
  const s = F(0, 0, DW, DH, P.bg, { clip: true, ch: [] });

  // Background glows
  s.children.push(E(-200, -200, 800, 800, P.violetDim, { opacity: 0.3 }));
  s.children.push(E(900, 400, 600, 600, P.greenDim, { opacity: 0.2 }));

  // Nav
  s.children.push(F(0, 0, DW, 64, P.bg, { ch: [
    T('FORGE', 64, 22, 90, 20, { size: 15, weight: 900, fill: P.green, ls: 4 }),
    ...['Product','Agents','Pricing','Docs'].map((l, i) =>
      T(l, 220 + i * 120, 22, 100, 20, { size: 13, fill: P.fg2 })
    ),
    F(DW - 260, 18, 100, 28, 'transparent', { r: 6, stroke: P.border2, ch: [
      T('Log in', 0, 6, 100, 16, { size: 12, fill: P.fg, align: 'center' }),
    ]}),
    F(DW - 148, 18, 120, 28, P.green, { r: 6, ch: [
      T('Get started →', 0, 6, 120, 16, { size: 12, weight: 700, fill: P.bg, align: 'center' }),
    ]}),
  ]}));

  // Hero text — split letter style (Mixpanel-inspired)
  s.children.push(T('Your AI dev team.', 64, 120, 900, 96, { size: 80, weight: 900, fill: P.fg, lh: 1.0 }));
  s.children.push(T('One monthly subscription.', 64, 218, 860, 72, { size: 60, weight: 200, fill: P.violetLt, lh: 1.0 }));
  s.children.push(T('Unlimited code requests. AI agents deliver clean, reviewed code within 2–5 business days.\nNo hiring. No contracts. Pause or cancel any month.', 64, 306, 620, 56, { size: 16, fill: P.fg2, lh: 1.6 }));

  // CTAs
  s.children.push(F(64, 380, 200, 52, P.green, { r: 8, ch: [
    T('See our plans', 0, 16, 200, 20, { size: 14, weight: 700, fill: P.bg, align: 'center' }),
  ]}));
  s.children.push(F(276, 380, 180, 52, 'transparent', { r: 8, stroke: P.border2, ch: [
    T('View case studies', 0, 16, 180, 20, { size: 14, weight: 600, fill: P.fg, align: 'center' }),
  ]}));

  // Stats row
  const dStats = [['47+','AI Agents on staff'], ['$0.5B+','Client market cap'], ['2.4d','Avg delivery'], ['98.7%','Uptime SLA']];
  dStats.forEach(([v, l], i) => {
    const x = 64 + i * 220;
    s.children.push(HR(x, 454, 180));
    s.children.push(T(v, x, 468, 200, 40, { size: 32, weight: 800, fill: P.green }));
    s.children.push(T(l, x, 512, 200, 16, { size: 12, fill: P.fg2 }));
  });

  // Feature cards
  const features = [
    { title: 'Async by design', desc: 'Drop requests in Slack or the dashboard. Agents work 24/7 — no stand-ups, no back-and-forth.' },
    { title: 'Code review built in', desc: 'Every deliverable comes with a diff, inline comments, and agent reasoning.' },
    { title: 'One flat fee', desc: 'Starter, Pro, or Scale. No per-seat pricing. No surprise invoices.' },
  ];
  features.forEach((f, i) => {
    const x = 64 + i * 460;
    s.children.push(F(x, 548, 440, 100, P.surface, { r: 10, stroke: P.border, ch: [
      T(f.title, 20, 18, 380, 18, { size: 14, weight: 700 }),
      T(f.desc, 20, 42, 400, 44, { size: 12, fill: P.fg2, lh: 1.6 }),
    ]}));
  });

  // Agent marquee strip
  s.children.push(F(0, 664, DW, 52, P.surface2, { ch: [
    T('ATLAS  ·  BRIAR  ·  CINDER  ·  DUSK  ·  EMBER  ·  FLINT  ·  GROVE  ·  HAVEN  ·  IRIS  ·  JADE  ·  KAYA  ·  LYNX  ·  MARA', 32, 18, DW - 64, 18, { size: 11, fill: P.muted, ls: 2 }),
  ]}));

  // Trusted logos strip
  s.children.push(T('TRUSTED BY TEAMS AT', 64, 732, 300, 14, { size: 9, weight: 700, fill: P.muted, ls: 2 }));
  ['Stripe', 'Linear', 'Vercel', 'Anthropic', 'Figma', 'Notion'].forEach((co, i) => {
    s.children.push(F(64 + i * 200, 752, 160, 32, P.surface, { r: 6, ch: [
      T(co.toUpperCase(), 0, 8, 160, 16, { size: 11, weight: 700, fill: P.muted2, align: 'center', ls: 2 }),
    ]}));
  });

  s.name = 'D1 — Desktop Landing';
  return s;
}

// ── D2: Agent Operations Center ───────────────────────────────────────────────
function desktopAgentOps() {
  const s = F(0, 0, DW, DH, P.bg, { clip: true, ch: [] });
  s.children.push(deskNav());
  s.children.push(deskSidebar(1));

  const CX = SB_W + 32; // content x
  const CW = DW - SB_W - 64;

  // Page header
  s.children.push(T('Agent Operations', CX, 76, 400, 28, { size: 22, weight: 800 }));
  s.children.push(T('Real-time status across your AI development team.', CX, 108, 500, 18, { size: 13, fill: P.fg2 }));

  // KPI strip
  const kpis = [['6', 'TOTAL AGENTS', P.violet], ['4', 'ACTIVE', P.green], ['1', 'QUEUED', P.amber], ['11', 'OPEN TASKS', P.violetLt]];
  kpis.forEach(([v, l, c], i) => {
    const kx = CX + i * 192;
    s.children.push(StatTile(kx, 136, 180, 60, v, l, c));
  });

  // Agent bento grid (2×3)
  const agentData = [
    { id: 'FORGE-01', name: 'Atlas', status: 'ACTIVE', task: 'Refactoring auth middleware', file: 'auth/middleware.ts', sc: P.green, sb: P.greenDim, prog: 0.65 },
    { id: 'FORGE-02', name: 'Briar', status: 'ACTIVE', task: 'Writing unit tests for payment API', file: 'tests/payment.spec.ts', sc: P.green, sb: P.greenDim, prog: 0.40 },
    { id: 'FORGE-03', name: 'Cinder', status: 'ACTIVE', task: 'Fixing checkout race condition', file: 'checkout/useCart.ts', sc: P.green, sb: P.greenDim, prog: 0.20 },
    { id: 'FORGE-04', name: 'Dusk', status: 'QUEUED', task: 'Waiting: migrate DB schema', file: 'migrations/v2.sql', sc: P.amber, sb: P.amberDim, prog: 0 },
    { id: 'FORGE-05', name: 'Ember', status: 'IDLE', task: 'Available for new requests', file: '—', sc: P.muted2, sb: P.surface2, prog: 0 },
    { id: 'FORGE-06', name: 'Flint', status: 'IDLE', task: 'Available for new requests', file: '—', sc: P.muted2, sb: P.surface2, prog: 0 },
  ];
  const CARD_W = Math.floor((CW - 32) / 3);
  const CARD_H = 160;
  agentData.forEach((a, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const ax = CX + col * (CARD_W + 16);
    const ay = 212 + row * (CARD_H + 12);
    const card = F(ax, ay, CARD_W, CARD_H, P.surface, { r: 10, stroke: a.status === 'ACTIVE' ? a.sc + '44' : P.border, ch: [] });
    // Top accent bar
    card.children.push(F(0, 0, CARD_W, 3, a.sc, { r: 1 }));
    // Agent circle
    card.children.push(E(20, 20, 40, 40, a.sb));
    card.children.push(T('◈', 20, 22, 40, 36, { size: 20, fill: a.sc, align: 'center' }));
    // Info
    card.children.push(T(a.id, 72, 22, 120, 12, { size: 9, fill: a.sc, ls: 1, weight: 700 }));
    card.children.push(T(a.name, 72, 36, 140, 16, { size: 14, weight: 700 }));
    card.children.push(Pill(CARD_W - 80, 22, a.status, a.sc, a.sb, { w: 70 }));
    card.children.push(HR(16, 74, CARD_W - 32));
    card.children.push(T(a.task, 16, 84, CARD_W - 32, 16, { size: 11, fill: P.fg2 }));
    card.children.push(T(a.file, 16, 104, CARD_W - 32, 14, { size: 10, fill: P.muted2 }));
    // Progress
    if (a.prog > 0) {
      card.children.push(F(16, 124, CARD_W - 32, 4, P.border, { r: 2 }));
      card.children.push(F(16, 124, Math.round((CARD_W - 32) * a.prog), 4, a.sc, { r: 2 }));
      card.children.push(T(`${Math.round(a.prog * 100)}%`, CARD_W - 48, 120, 32, 12, { size: 9, fill: P.muted2, align: 'right' }));
    }
    s.children.push(card);
  });

  // Recent activity feed
  const feedX = CX;
  const feedY = 572;
  s.children.push(T('RECENT ACTIVITY', feedX, feedY, 300, 12, { size: 9, weight: 700, fill: P.muted2, ls: 2 }));
  const events = [
    { time: '2m ago', agent: 'FORGE-01', msg: 'Committed auth refactor — 8 files changed, +124 −47 lines', c: P.green },
    { time: '14m ago', agent: 'FORGE-02', msg: 'Created test suite scaffold for payment service endpoints', c: P.green },
    { time: '38m ago', agent: 'FORGE-03', msg: 'Opened TSK-0049: analyzing cart locking logic', c: P.amber },
    { time: '1h ago', agent: 'FORGE-01', msg: 'TSK-0046 merged: Stripe webhook handler update shipped', c: P.blue },
    { time: '3h ago', agent: 'FORGE-02', msg: 'TSK-0045 merged: CSV export feature complete', c: P.blue },
  ];
  events.forEach((ev, i) => {
    const ey = feedY + 22 + i * 42;
    s.children.push(F(feedX, ey, CW, 36, P.surface, { r: 6, ch: [
      E(12, 12, 12, 12, ev.c + '33'),
      E(12, 12, 12, 12, 'transparent', { stroke: ev.c, sw: 1 }),
      T(ev.agent, 32, 10, 90, 14, { size: 10, weight: 700, fill: ev.c }),
      T(ev.msg, 128, 10, CW - 260, 14, { size: 11, fill: P.fg2 }),
      T(ev.time, CW - 120, 10, 100, 14, { size: 10, fill: P.muted2, align: 'right' }),
    ]}));
  });

  s.name = 'D2 — Agent Operations';
  return s;
}

// ── D3: Task + Code Review Panel ─────────────────────────────────────────────
function desktopCodeReview() {
  const s = F(0, 0, DW, DH, P.bg, { clip: true, ch: [] });
  s.children.push(deskNav());
  s.children.push(deskSidebar(2));

  const TASK_LIST_W = 300;
  const CX = SB_W + TASK_LIST_W;
  const REVIEW_W = DW - CX - 16;

  // Task list panel
  const tlPanel = F(SB_W, 56, TASK_LIST_W, DH - 56, P.surface, { stroke: P.border, ch: [] });
  tlPanel.children.push(T('TASK QUEUE', 16, 20, 268, 12, { size: 9, weight: 700, fill: P.muted2, ls: 2 }));
  tlPanel.children.push(F(16, 38, 268, 26, P.surface2, { r: 6, ch: [
    T('🔍  Search tasks…', 12, 6, 256, 14, { size: 11, fill: P.muted }),
  ]}));

  const taskList = [
    { id: 'TSK-0047', title: 'Refactor auth middleware', status: 'IN PROGRESS', c: P.green, active: false },
    { id: 'TSK-0048', title: 'Unit tests — payments', status: 'IN PROGRESS', c: P.green, active: false },
    { id: 'TSK-0049', title: 'Fix checkout race condition', status: 'IN REVIEW', c: P.amber, active: true },
    { id: 'TSK-0050', title: 'Migrate DB schema v2', status: 'QUEUED', c: P.muted2, active: false },
    { id: 'TSK-0046', title: 'Stripe webhook update', status: 'MERGED', c: P.blue, active: false },
    { id: 'TSK-0045', title: 'CSV export feature', status: 'MERGED', c: P.blue, active: false },
  ];
  taskList.forEach((t, i) => {
    const ty = 76 + i * 60;
    const row = F(8, ty, TASK_LIST_W - 16, 52, t.active ? P.violetDim : 'transparent', { r: 6, stroke: t.active ? P.violet : 'transparent', ch: [] });
    row.children.push(T(t.id, 12, 8, 160, 12, { size: 9, fill: P.muted2, ls: 1 }));
    row.children.push(T(t.title, 12, 22, 240, 14, { size: 11, weight: t.active ? 700 : 400, fill: t.active ? P.fg : P.fg2 }));
    row.children.push(T(t.status, 12, 38, 200, 12, { size: 9, fill: t.c, ls: 0.5 }));
    tlPanel.children.push(row);
  });
  s.children.push(tlPanel);

  // Code review main panel
  const reviewPanel = F(CX, 56, REVIEW_W, DH - 56, P.bg, { ch: [] });

  // Header
  reviewPanel.children.push(F(0, 0, REVIEW_W, 64, P.surface, { stroke: P.border, ch: [
    T('TSK-0049', 20, 10, 100, 14, { size: 9, fill: P.muted2, ls: 1 }),
    T('Fix checkout race condition', 20, 28, 500, 18, { size: 14, weight: 700 }),
    Pill(REVIEW_W - 130, 20, 'IN REVIEW', P.amber, P.amberDim, { w: 80 }),
    T('FORGE-03 · Cinder', 20, 48, 200, 12, { size: 10, fill: P.amber }),
  ]}));

  // Agent status bar
  reviewPanel.children.push(F(0, 64, REVIEW_W, 36, P.greenDim, { ch: [
    T('◉  FORGE-03 is currently examining: checkout/useCart.ts — applying mutex lock pattern', 20, 10, REVIEW_W - 40, 16, { size: 11, fill: P.green }),
  ]}));

  // File tab
  reviewPanel.children.push(F(0, 100, REVIEW_W, 32, P.surface2, { ch: [
    F(0, 0, 200, 32, P.surface3, { ch: [
      T('checkout/useCart.ts', 16, 8, 180, 16, { size: 11, fill: P.fg }),
    ]}),
    T('+4  −2', REVIEW_W - 80, 8, 60, 16, { size: 10, fill: P.muted2, align: 'right' }),
  ]}));

  // Full diff
  const diffLines = [
    [1, "import { useState, useCallback } from 'react';", null],
    [2, "import { mutex } from '../lib/mutex';", 'add'],
    [3, '', null],
    [4, 'const useCart = () => {', null],
    [5, '  const [cart, setCart] = useState(null);', null],
    [6, '', null],
    [7, '  const checkout = useCallback(async () => {', null],
    [8, '    if (!cart) return;', null],
    [9, '    await cart.acquire();', 'del'],
    [10, '    const lock = await mutex.acquire();', 'add'],
    [11, '    try {', 'add'],
    [12, '      const result = await processPayment(cart);', null],
    [13, '      setCart(null);', null],
    [14, '      return result;', null],
    [15, '    } finally {', 'add'],
    [16, '      lock.release();', 'add'],
    [17, '    }', 'add'],
    [18, '  }, [cart]);', null],
    [19, '', null],
    [20, '  return { cart, setCart, checkout };', null],
    [21, '};', null],
  ];
  diffLines.forEach(([n, code, type], i) => {
    reviewPanel.children.push(CodeLine(0, 132 + i * 18, REVIEW_W, n, code, type));
  });

  // Comment from agent
  reviewPanel.children.push(F(20, 514, REVIEW_W - 40, 80, P.surface, { r: 8, stroke: P.greenDim, ch: [
    T('◈  FORGE-03 · Cinder', 16, 12, 200, 14, { size: 10, weight: 700, fill: P.green }),
    T('Introduced a mutex lock around the payment processing block to resolve the race\ncondition. Previously, concurrent checkouts could acquire cart state before the\nfirst completed — mutex ensures atomicity. Added try/finally for lock release.', 16, 30, REVIEW_W - 72, 44, { size: 11, fill: P.fg2, lh: 1.5 }),
  ]}));

  // Action bar
  reviewPanel.children.push(F(0, DH - 56 - 56, REVIEW_W, 56, P.surface, { stroke: P.border, ch: [
    F(20, 14, 160, 28, 'transparent', { r: 6, stroke: P.border2, ch: [
      T('Request Changes', 0, 7, 160, 14, { size: 11, fill: P.fg, align: 'center' }),
    ]}),
    F(192, 14, 180, 28, P.green, { r: 6, ch: [
      T('Approve & Merge →', 0, 7, 180, 14, { size: 11, weight: 700, fill: P.bg, align: 'center' }),
    ]}),
    T('2 files changed  ·  +5 −1 lines', REVIEW_W - 280, 18, 260, 16, { size: 11, fill: P.muted2, align: 'right' }),
  ]}));

  s.children.push(reviewPanel);
  s.name = 'D3 — Code Review Panel';
  return s;
}

// ── D4: Analytics Dashboard ───────────────────────────────────────────────────
function desktopAnalytics() {
  const s = F(0, 0, DW, DH, P.bg, { clip: true, ch: [] });
  const navItems = ['Home','Agents','Tasks','Analytics','Billing'];
  s.children.push(F(0, 0, DW, 56, P.surface, { stroke: P.border, ch: [
    T('FORGE', 32, 18, 80, 20, { size: 14, weight: 900, fill: P.green, ls: 3 }),
    ...navItems.map((label, i) =>
      T(label, 160 + i * 120, 18, 100, 20, { size: 12, weight: i === 3 ? 700 : 400, fill: i === 3 ? P.green : P.muted2 })
    ),
  ]}));
  s.children.push(deskSidebar(3));

  const CX = SB_W + 32;
  const CW = DW - SB_W - 64;

  // Header
  s.children.push(T('Analytics', CX, 76, 400, 28, { size: 22, weight: 800 }));
  s.children.push(T('This month · Mar 2026', CX, 108, 300, 18, { size: 13, fill: P.fg2 }));

  // KPI strip (4 tiles)
  const kpiData = [
    ['23', 'TASKS SHIPPED', P.green, '+4 vs last month'],
    ['2.4d', 'AVG DELIVERY', P.violetLt, '−0.3d vs last month'],
    ['9,841', 'LINES WRITTEN', P.blue, '+2.1k vs last month'],
    ['97.8%', 'SUCCESS RATE', P.amber, '+1.2pp vs last month'],
  ];
  const kpiW = Math.floor((CW - 48) / 4);
  kpiData.forEach(([val, label, accent, delta], i) => {
    const kx = CX + i * (kpiW + 16);
    const tile = F(kx, 136, kpiW, 80, P.surface, { r: 8, stroke: P.border, ch: [] });
    tile.children.push(T(val, 16, 12, kpiW - 32, 32, { size: 26, weight: 900, fill: accent }));
    tile.children.push(T(label, 16, 48, kpiW - 32, 12, { size: 9, fill: P.muted2, ls: 1 }));
    tile.children.push(T(delta, kpiW - 120, 14, 104, 12, { size: 9, fill: accent, align: 'right', opacity: 0.7 }));
    s.children.push(tile);
  });

  // Velocity chart (bar chart)
  const chartW = Math.floor(CW * 0.55);
  const chartH = 240;
  const chart = F(CX, 232, chartW, chartH + 40, P.surface, { r: 10, stroke: P.border, ch: [] });
  chart.children.push(T('TASK VELOCITY', 20, 16, 300, 12, { size: 9, weight: 700, fill: P.muted2, ls: 2 }));
  chart.children.push(T('Tasks completed per week', 20, 32, 300, 14, { size: 11, fill: P.fg2 }));
  const weeks = ['W1','W2','W3','W4','W5','W6','W7','W8'];
  const vals = [3,5,4,7,6,8,5,9];
  const barW = 28;
  const maxV = Math.max(...vals);
  weeks.forEach((w, i) => {
    const bx = 32 + i * 42;
    const bh = Math.round((vals[i] / maxV) * (chartH - 60));
    const by = 52 + (chartH - 60) - bh;
    chart.children.push(F(bx, by, barW, bh, i === 7 ? P.green : P.violet + '66', { r: 4 }));
    chart.children.push(T(String(vals[i]), bx, by - 16, barW, 14, { size: 10, fill: P.muted2, align: 'center' }));
    chart.children.push(T(w, bx, 52 + (chartH - 60) + 8, barW, 12, { size: 9, fill: P.muted2, align: 'center' }));
  });
  s.children.push(chart);

  // Agent performance table
  const tableX = CX + chartW + 20;
  const tableW = CW - chartW - 20;
  const table = F(tableX, 232, tableW, chartH + 40, P.surface, { r: 10, stroke: P.border, ch: [] });
  table.children.push(T('AGENT PERFORMANCE', 16, 16, tableW - 32, 12, { size: 9, weight: 700, fill: P.muted2, ls: 2 }));
  const perfData = [
    ['FORGE-01','Atlas', '8', '2.1d', P.green],
    ['FORGE-02','Briar', '6', '2.6d', P.green],
    ['FORGE-03','Cinder','5', '2.9d', P.amber],
    ['FORGE-04','Dusk',  '4', '3.0d', P.amber],
  ];
  perfData.forEach((row, i) => {
    const ry = 44 + i * 44;
    table.children.push(HR(16, ry, tableW - 32, P.border));
    table.children.push(T(row[0], 16, ry + 8, 100, 14, { size: 9, fill: row[4], ls: 1 }));
    table.children.push(T(row[1], 120, ry + 8, 80, 14, { size: 12, weight: 700 }));
    table.children.push(T(`${row[2]} tasks`, tableW - 160, ry + 8, 70, 14, { size: 11, fill: P.fg2, align: 'right' }));
    table.children.push(T(row[3], tableW - 80, ry + 8, 60, 14, { size: 11, fill: row[4], align: 'right' }));
  });
  s.children.push(table);

  // Recent completions list
  const listY = 532;
  s.children.push(T('RECENT COMPLETIONS', CX, listY, 300, 12, { size: 9, weight: 700, fill: P.muted2, ls: 2 }));
  const completions = [
    { id: 'TSK-0046', title: 'Stripe webhook handler update', agent: 'FORGE-01', lines: '+47 −12', time: '1h ago' },
    { id: 'TSK-0045', title: 'CSV export feature', agent: 'FORGE-02', lines: '+182 −0', time: '3h ago' },
    { id: 'TSK-0044', title: 'Rate limiter middleware', agent: 'FORGE-03', lines: '+66 −5', time: 'Yesterday' },
    { id: 'TSK-0043', title: 'Mobile responsive nav', agent: 'FORGE-01', lines: '+94 −31', time: 'Yesterday' },
    { id: 'TSK-0042', title: 'Email template system', agent: 'FORGE-04', lines: '+203 −8', time: '2d ago' },
  ];
  completions.forEach((c, i) => {
    const cy = listY + 20 + i * 46;
    s.children.push(F(CX, cy, CW, 38, P.surface, { r: 6, ch: [
      Pill(16, 10, 'MERGED', P.blue, P.blueDim, { w: 56 }),
      T(c.id, 84, 10, 80, 14, { size: 9, fill: P.muted2, ls: 1 }),
      T(c.title, 168, 10, 440, 16, { size: 12, weight: 600 }),
      T(c.agent, 620, 10, 100, 14, { size: 10, fill: P.green }),
      T(c.lines, CW - 200, 10, 100, 14, { size: 10, fill: P.muted2, align: 'right' }),
      T(c.time, CW - 90, 10, 74, 14, { size: 10, fill: P.muted2, align: 'right' }),
    ]}));
  });

  s.name = 'D4 — Analytics Dashboard';
  return s;
}

// ── D5: Billing & Plan Management ────────────────────────────────────────────
function desktopBilling() {
  const s = F(0, 0, DW, DH, P.bg, { clip: true, ch: [] });
  s.children.push(deskNav());
  s.children.push(deskSidebar(4));

  const CX = SB_W + 32;
  const CW = DW - SB_W - 64;

  // Header
  s.children.push(T('Billing & Plan', CX, 76, 400, 28, { size: 22, weight: 800 }));
  s.children.push(T('Manage your subscription and usage.', CX, 108, 400, 18, { size: 13, fill: P.fg2 }));

  // Current plan card
  const planCard = F(CX, 136, 480, 140, P.violetDim, { r: 10, stroke: P.violet, ch: [] });
  planCard.children.push(Pill(16, 14, 'CURRENT PLAN', P.violetLt, 'transparent', { w: 110 }));
  planCard.children.push(T('PRO', 16, 40, 80, 36, { size: 28, weight: 900, fill: P.violetLt }));
  planCard.children.push(T('$4,999 / month', 16, 80, 200, 18, { size: 15, fill: P.fg }));
  planCard.children.push(T('3 AI Agents  ·  12 active requests  ·  Unlimited revisions', 16, 104, 440, 14, { size: 11, fill: P.fg2 }));
  planCard.children.push(T('Next billing: Apr 1, 2026', 440 - 150, 14, 150, 14, { size: 10, fill: P.muted2, align: 'right' }));
  planCard.children.push(F(440 - 100, 40, 80, 28, P.violet, { r: 6, ch: [
    T('Upgrade', 0, 8, 80, 12, { size: 11, weight: 700, fill: P.bg, align: 'center' }),
  ]}));
  s.children.push(planCard);

  // Usage meters
  const usageX = CX + 500;
  const usageW = CW - 500;
  s.children.push(F(usageX, 136, usageW, 140, P.surface, { r: 10, stroke: P.border, ch: [
    T('USAGE THIS MONTH', 20, 16, 300, 12, { size: 9, weight: 700, fill: P.muted2, ls: 2 }),
    T('Active Requests', 20, 36, 200, 14, { size: 12, fill: P.fg2 }),
    F(20, 54, usageW - 40, 8, P.border, { r: 4 }),
    F(20, 54, Math.round((usageW - 40) * 0.67), 8, P.violet, { r: 4 }),
    T('8 / 12', usageW - 60, 50, 50, 14, { size: 10, fill: P.violetLt, align: 'right' }),
    T('Agent Hours', 20, 80, 200, 14, { size: 12, fill: P.fg2 }),
    F(20, 98, usageW - 40, 8, P.border, { r: 4 }),
    F(20, 98, Math.round((usageW - 40) * 0.41), 8, P.green, { r: 4 }),
    T('148 / 360h', usageW - 90, 94, 80, 14, { size: 10, fill: P.green, align: 'right' }),
    T('Tasks Completed', 20, 122, 200, 14, { size: 11, fill: P.fg2 }),
    T('23 this month', usageW - 120, 122, 110, 14, { size: 11, fill: P.amber, align: 'right' }),
  ]}));

  // Plan comparison
  s.children.push(T('PLANS', CX, 294, 200, 12, { size: 9, weight: 700, fill: P.muted2, ls: 2 }));
  const planCols = [
    { name: 'STARTER', price: '$2,499', agents: '1 Agent', requests: '4 active', current: false, color: P.muted2 },
    { name: 'PRO', price: '$4,999', agents: '3 Agents', requests: '12 active', current: true, color: P.violet },
    { name: 'SCALE', price: '$9,999', agents: '8 Agents', requests: 'Unlimited', current: false, color: P.green },
  ];
  const featureRows = ['Agents', 'Active Requests', 'Delivery SLA', 'Revisions', 'Slack Integration', 'Priority Queue'];
  const planFeats = [
    ['1', '4', '5 days', 'Unlimited', '✓', '—'],
    ['3', '12', '3 days', 'Unlimited', '✓', '✓'],
    ['8', 'Unlimited', '2 days', 'Unlimited', '✓', '✓'],
  ];
  const colW = Math.floor((CW - 16) / 3) - 8;
  planCols.forEach((plan, pi) => {
    const px = CX + pi * (colW + 12);
    const planBox = F(px, 316, colW, 420, plan.current ? P.violetDim : P.surface, {
      r: 10, stroke: plan.current ? P.violet : P.border, ch: [],
    });
    planBox.children.push(T(plan.name, 20, 20, 150, 14, { size: 10, weight: 700, fill: plan.color, ls: 2 }));
    planBox.children.push(T(plan.price, 20, 40, 200, 32, { size: 26, weight: 900, fill: P.fg }));
    planBox.children.push(T('/month', 20, 76, 100, 14, { size: 11, fill: P.fg2 }));
    if (plan.current) planBox.children.push(Pill(colW - 90, 16, 'YOUR PLAN', plan.color, 'transparent', { w: 76 }));
    planBox.children.push(HR(16, 100, colW - 32));
    featureRows.forEach((feat, fi) => {
      const fy = 116 + fi * 36;
      planBox.children.push(T(feat, 16, fy, 140, 14, { size: 11, fill: P.fg2 }));
      const val = planFeats[pi][fi];
      const valColor = val === '—' ? P.muted : val === '✓' ? P.green : plan.color;
      planBox.children.push(T(val, colW - 120, fy, 110, 14, { size: 11, fill: valColor, align: 'right' }));
    });
    const btnLabel = plan.current ? 'Current Plan' : pi > 1 ? 'Upgrade →' : 'Downgrade';
    planBox.children.push(F(16, 340, colW - 32, 36, plan.current ? plan.color : 'transparent', {
      r: 6, stroke: plan.current ? 'transparent' : P.border2, ch: [
        T(btnLabel, 0, 10, colW - 32, 16, { size: 12, weight: 700, fill: plan.current ? P.bg : P.fg, align: 'center' }),
      ],
    }));
    s.children.push(planBox);
  });

  // Invoice table
  s.children.push(T('RECENT INVOICES', CX, 752, 300, 12, { size: 9, weight: 700, fill: P.muted2, ls: 2 }));
  const invoices = [
    { date: 'Mar 1, 2026', desc: 'PRO Plan', amount: '$4,999', status: 'PAID', sc: P.green },
    { date: 'Feb 1, 2026', desc: 'PRO Plan', amount: '$4,999', status: 'PAID', sc: P.green },
    { date: 'Jan 1, 2026', desc: 'PRO Plan', amount: '$4,999', status: 'PAID', sc: P.green },
  ];
  invoices.forEach((inv, i) => {
    const iy = 774 + i * 36;
    s.children.push(F(CX, iy, CW, 30, P.surface, { r: 6, ch: [
      T(inv.date, 16, 8, 160, 14, { size: 11, fill: P.fg2 }),
      T(inv.desc, 180, 8, 200, 14, { size: 11, fill: P.fg }),
      Pill(CW - 220, 5, inv.status, inv.sc, inv.sc + '22', { w: 48 }),
      T(inv.amount, CW - 160, 8, 80, 14, { size: 11, fill: P.fg, align: 'right' }),
      T('Download PDF', CW - 68, 8, 60, 14, { size: 10, fill: P.violet, align: 'right' }),
    ]}));
  });

  s.name = 'D5 — Billing & Plans';
  return s;
}

// ══════════════════════════════════════════════════════════════════════════════
// BUILD .PEN FILE
// ══════════════════════════════════════════════════════════════════════════════
const doc = {
  id: 'forge-pen-v1',
  name: 'FORGE — AI Dev Subscription Platform',
  version: '2.8',
  children: [
    mobileHero(),
    mobileAgents(),
    mobileTasks(),
    mobileCodeReview(),
    mobilePricing(),
    desktopHero(),
    desktopAgentOps(),
    desktopCodeReview(),
    desktopAnalytics(),
    desktopBilling(),
  ],
};

fs.writeFileSync(path.join(__dirname, 'forge.pen'), JSON.stringify(doc, null, 2));
console.log(`✓ forge.pen written — ${doc.children.length} screens`);

// ══════════════════════════════════════════════════════════════════════════════
// PUBLISH PIPELINE
// ══════════════════════════════════════════════════════════════════════════════

const sub = {
  id: HEARTBEAT_ID,
  prompt: `Design a dark-mode AI development subscription platform — FORGE. Inspired by Good Fella (Awwwards SOTD Mar 18 2026), where companies subscribe to AI coding agents the same way they'd hire a dev shop. One flat monthly fee, AI agents deliver code 24/7. UI reflects Linear's dark Codex agent integration pattern: live agent status, code diffs, task queues, analytics dashboards — wrapped in Good Fella's subscription-first aesthetic. Near-black bg (#060608), terminal green (#3dffa0) for active agents, violet (#7c5af5) for premium tiers.`,
  credit: 'RAM Studio',
  submitted_at: NOW,
};

const meta = {
  appName:   'FORGE',
  tagline:   'Your AI dev team. One monthly subscription.',
  archetype: 'developer-tools',
  screens:   10,
  palette: {
    bg:      P.bg,
    fg:      P.fg,
    accent:  P.green,
    accent2: P.violet,
  },
};

const prd = {
  screenNames: [
    'M · Landing Hero',
    'M · Agent Roster',
    'M · Task Queue',
    'M · Code Review',
    'M · Pricing Plans',
    'D · Desktop Landing',
    'D · Agent Ops Center',
    'D · Code Review Panel',
    'D · Analytics Dashboard',
    'D · Billing & Plans',
  ],
};

// ── SVG renderer ──────────────────────────────────────────────────────────────
function renderEl(el, depth = 0) {
  if (!el || depth > 6) return '';
  const x = el.x || 0, y = el.y || 0;
  const w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
  const fill = el.fill && el.fill !== 'transparent' ? el.fill : 'none';
  const oAttr = (el.opacity !== undefined && el.opacity < 0.99) ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const rAttr = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, w/2, h/2)}"` : '';

  if (el.type === 'frame') {
    const clip = el.clip ? ` clip-path="url(#cp${el.id})"` : '';
    const clipDef = el.clip ? `<defs><clipPath id="cp${el.id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"${rAttr}/></clipPath></defs>` : '';
    const bg = fill !== 'none' ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rAttr}${oAttr}/>` : '';
    const stroke = el.stroke ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${el.stroke.fill}" stroke-width="${el.stroke.thickness || 1}"${rAttr}/>` : '';
    const kids = (el.children || []).map(c => renderEl(c, depth + 1)).join('');
    if (!kids) return clipDef + bg + stroke;
    return `${clipDef}${bg}<g transform="translate(${x},${y})"${clip}>${kids}</g>${stroke}`;
  }
  if (el.type === 'ellipse') {
    const rx = w / 2, ry = h / 2;
    const strokeAttr = el.stroke ? ` stroke="${el.stroke.fill}" stroke-width="${el.stroke.thickness || 1}"` : '';
    return `<ellipse cx="${x + rx}" cy="${y + ry}" rx="${rx}" ry="${ry}" fill="${fill}"${oAttr}${strokeAttr}/>`;
  }
  if (el.type === 'text') {
    const fontSize = el.fontSize || 12;
    const fontWeight = el.fontWeight || '400';
    const anchor = el.textAlign === 'center' ? 'middle' : el.textAlign === 'right' ? 'end' : 'start';
    const textX = el.textAlign === 'center' ? x + w / 2 : el.textAlign === 'right' ? x + w : x;
    const opacity = el.opacity !== undefined ? el.opacity : 1;
    const lh = el.lineHeight || 1.4;
    const lines = (el.content || '').split('\n');
    const fillColor = el.fill || '#ffffff';
    const ls = el.letterSpacing ? ` letter-spacing="${el.letterSpacing}"` : '';
    const dy = fontSize * lh;
    return lines.map((line, li) =>
      `<text x="${textX}" y="${y + fontSize + li * dy}" font-size="${fontSize}" font-weight="${fontWeight}" fill="${fillColor}" text-anchor="${anchor}" opacity="${opacity}" font-family="ui-monospace,monospace"${ls}>${line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`
    ).join('');
  }
  return '';
}

function screenToSVG(screen) {
  const w = screen.width, h = screen.height;
  const inner = (screen.children || []).map(c => renderEl(c, 0)).join('');
  const bg = screen.fill ? `<rect width="${w}" height="${h}" fill="${screen.fill}"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${bg}${inner}</svg>`;
}

// ── Hero HTML ─────────────────────────────────────────────────────────────────
function buildHeroHTML(doc) {
  function lighten(hex, amt) {
    const n = parseInt((hex || '#111').replace('#', ''), 16);
    const r = Math.min(255, (n >> 16) + amt);
    const g = Math.min(255, ((n >> 8) & 0xff) + amt);
    const b = Math.min(255, (n & 0xff) + amt);
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }
  const bg = meta.palette.bg, fg = meta.palette.fg, accent = meta.palette.accent, accent2 = meta.palette.accent2;
  const surface = lighten(bg, 14);
  const border  = lighten(bg, 28);

  const screens = doc.children || [];
  const thumbsHTML = screens.map((s, i) => {
    const svg = screenToSVG(s);
    const b64 = Buffer.from(svg).toString('base64');
    const th = 160;
    const tw = Math.round(th * (s.width / s.height));
    return `<div style="text-align:center;flex-shrink:0">
      <img src="data:image/svg+xml;base64,${b64}" width="${tw}" height="${th}" style="border-radius:6px;border:1px solid ${border}"/>
      <div style="font-size:9px;opacity:.4;margin-top:6px;letter-spacing:1px;max-width:${tw}px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${(s.name || '').toUpperCase()}</div>
    </div>`;
  }).join('');

  const swatches = [
    { hex: bg,      role: 'BG' },
    { hex: surface, role: 'SURFACE' },
    { hex: fg,      role: 'FOREGROUND' },
    { hex: accent,  role: 'PRIMARY' },
    { hex: accent2, role: 'SECONDARY' },
    { hex: P.amber, role: 'WARN' },
  ].map(sw => `<div style="flex:1;min-width:70px">
    <div style="height:56px;border-radius:6px;background:${sw.hex};border:1px solid ${border};margin-bottom:8px"></div>
    <div style="font-size:9px;letter-spacing:1px;opacity:.4;margin-bottom:3px">${sw.role}</div>
    <div style="font-size:11px;font-weight:700;color:${accent}">${sw.hex}</div>
  </div>`).join('');

  const cssTokens = `:root {
  /* Color */
  --color-bg:        ${bg};
  --color-surface:   ${surface};
  --color-border:    ${border};
  --color-fg:        ${fg};
  --color-primary:   ${accent};
  --color-secondary: ${accent2};
  --color-warn:      ${P.amber};

  /* Typography (monospace — terminal feel) */
  --font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', ui-monospace, monospace;
  --font-display: 900 clamp(48px, 8vw, 96px) / 1 var(--font-family);
  --font-heading: 700 24px / 1.3 var(--font-family);
  --font-body:    400 14px / 1.6 var(--font-family);
  --font-caption: 400 10px / 1   var(--font-family);
  --font-code:    400 12px / 1.7 var(--font-family);

  /* Spacing (4px base) */
  --space-1:4px; --space-2:8px;  --space-3:16px;
  --space-4:24px;--space-5:32px; --space-6:48px; --space-7:64px;

  /* Radius */
  --radius-sm:4px; --radius-md:8px; --radius-lg:16px; --radius-full:9999px;

  /* Status */
  --status-active: ${P.green};
  --status-queued: ${P.amber};
  --status-error:  ${P.red};
  --status-done:   ${P.blue};
}`;

  const shareText = encodeURIComponent(`FORGE — AI dev subscription platform. Your AI coding team for a flat monthly fee. 10-screen design system with CSS tokens. Built by RAM Design Studio`);

  const prdHTML = `
<h3>OVERVIEW</h3>
<p>FORGE is a subscription-based AI development agency, inspired by Good Fella's Awwwards SOTD (Mar 18, 2026) — a real studio offering frontend development on a flat monthly subscription. FORGE applies this model to AI: instead of human developers, you subscribe to AI coding agents that work 24/7, delivering code the same way a boutique agency would.</p>
<p>The UI design fuses two strong 2026 trends: Good Fella's minimalist subscription-first aesthetic (numbered process steps, clean type hierarchy, "one monthly fee" CTA) and Linear's dark Codex agent integration (live agent status in sidebar, inline code diffs, task queue). The result is a product that feels like both a premium service and a precision engineering tool.</p>

<h3>TARGET USERS</h3>
<ul>
  <li><strong>Startups and scaleups</strong> — teams that need reliable engineering output but can't justify full-time senior hires</li>
  <li><strong>Product managers at AI-native companies</strong> — who want to ship features faster by delegating implementation</li>
  <li><strong>CTOs running lean teams</strong> — using AI agents to multiply output without expanding headcount</li>
  <li><strong>Agency founders</strong> — white-labelling AI agent output for client deliverables</li>
</ul>

<h3>CORE FEATURES</h3>
<ul>
  <li><strong>M1 · Landing Hero</strong> — "Your AI dev team. One monthly subscription." — big display type, process steps (01–03), stats strip, CTA pair</li>
  <li><strong>M2 · Agent Roster</strong> — Live list of named AI agents (Atlas, Briar, Cinder…) with status, current task, ACTIVE/QUEUED/IDLE pills</li>
  <li><strong>M3 · Task Queue</strong> — Prioritised kanban-style card list with progress bars, filter pills, agent assignment</li>
  <li><strong>M4 · Code Review</strong> — Linear-inspired diff view: agent status bar, file header, add/delete line coloring, agent reasoning panel, approve/request-changes actions</li>
  <li><strong>M5 · Pricing Plans</strong> — 3 tiers (Starter $2,499 / Pro $4,999 / Scale $9,999), feature comparison, highlighted popular tier</li>
  <li><strong>D1 · Desktop Hero</strong> — Full 1440px landing: split-letter display type (Mixpanel-inspired), 4-stat strip, feature cards, agent marquee strip, trust logos</li>
  <li><strong>D2 · Agent Ops Center</strong> — Bento grid of 6 agent cards with live status, KPI tiles, real-time activity feed</li>
  <li><strong>D3 · Code Review Panel</strong> — 3-column layout: sidebar task list / full diff / agent commentary + action bar</li>
  <li><strong>D4 · Analytics Dashboard</strong> — KPI strip, bar chart velocity view, agent performance table, completions feed</li>
  <li><strong>D5 · Billing & Plans</strong> — Current plan card, usage meters, plan comparison grid, invoice table</li>
</ul>

<h3>DESIGN LANGUAGE</h3>
<p><strong>Near-black (#060608)</strong> — inspired by Linear's exact near-black (not pure #000 — it has a cool blue tint that prevents eye strain). This is the terminal/IDE aesthetic: you're working in a focused dark environment.</p>
<p><strong>Terminal green (#3dffa0) as the primary action color</strong> — this is the "agent running" color. It appears on CTAs, active status indicators, progress fills. It reads as "alive, executing, delivering." Deliberately evokes terminal output and CLI tools.</p>
<p><strong>Violet (#7c5af5) for premium and subscription tiers</strong> — the "PRO" color. Used on the highlighted plan card, the sidebar active state, and upgrade CTAs. Distinct from green to avoid confusion.</p>
<p><strong>Monospace typography throughout</strong> — SF Mono / Fira Code. This is an engineering product; the type should feel like it belongs in an IDE. Large display weights (900) for hero text, light (200–300) for sub-headings creates strong contrast.</p>

<h3>SCREEN ARCHITECTURE</h3>
<ul>
  <li>M1 — Landing: process steps + stats + CTA</li>
  <li>M2 — Agents: live roster with status + task</li>
  <li>M3 — Tasks: prioritised queue with progress</li>
  <li>M4 — Code: diff view + agent reasoning</li>
  <li>M5 — Pricing: 3 tiers + feature comparison</li>
  <li>D1 — Desktop landing: full hero + stats + features</li>
  <li>D2 — Ops Center: agent bento + activity feed</li>
  <li>D3 — Code Review: 3-column panel layout</li>
  <li>D4 — Analytics: velocity chart + completions</li>
  <li>D5 — Billing: plan management + invoices</li>
</ul>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>FORGE — AI Dev Subscription Platform · RAM Design Studio</title>
<meta name="description" content="Your AI dev team. One monthly subscription. 10-screen dark-mode design system with CSS tokens.">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{background:${bg};color:${fg};font-family:'SF Mono','Fira Code',ui-monospace,monospace;min-height:100vh}
nav{padding:18px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center}
.logo{font-size:13px;font-weight:700;letter-spacing:4px;color:${accent}}
.nav-id{font-size:10px;color:${accent};letter-spacing:1px;opacity:.6}
.hero{padding:72px 40px 32px;max-width:900px}
.tag{font-size:9px;letter-spacing:3px;color:${accent};margin-bottom:16px}
h1{font-size:clamp(48px,7vw,88px);font-weight:900;letter-spacing:-2px;line-height:1;margin-bottom:16px}
.sub{font-size:15px;opacity:.5;max-width:500px;line-height:1.6;margin-bottom:32px}
.actions{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:52px}
.btn{padding:11px 22px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:.5px}
.btn-p{background:${accent};color:${bg}}
.btn-p:hover{opacity:.9}
.btn-s{background:transparent;color:${fg};border:1px solid ${border}}
.btn-s:hover{border-color:${accent}66}
.btn-x{background:#000;color:#fff;border:1px solid #222}
.preview{padding:0 40px 72px}
.section-label{font-size:9px;letter-spacing:3px;color:${accent};margin-bottom:20px;padding-bottom:10px;border-bottom:1px solid ${border}}
.thumbs{display:flex;gap:14px;overflow-x:auto;padding-bottom:6px}
.thumbs::-webkit-scrollbar{height:3px}.thumbs::-webkit-scrollbar-track{background:transparent}
.thumbs::-webkit-scrollbar-thumb{background:${accent}44;border-radius:2px}
.brand{padding:52px 40px;border-top:1px solid ${border};max-width:900px}
.brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:52px}
@media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
.swatches{display:flex;gap:10px;flex-wrap:wrap}
.tokens-block{background:${surface};border:1px solid ${border};border-radius:8px;padding:20px;margin-top:20px;position:relative}
.tokens-pre{font-size:10px;line-height:1.7;color:${fg};opacity:.65;white-space:pre;overflow-x:auto;font-family:inherit}
.copy-btn{position:absolute;top:10px;right:10px;background:${accent}22;border:1px solid ${accent}44;color:${accent};font-family:inherit;font-size:9px;letter-spacing:1px;padding:4px 10px;border-radius:4px;cursor:pointer;font-weight:700}
.copy-btn:hover{background:${accent}33}
.prompt-sec{padding:36px 40px;border-top:1px solid ${border}}
.p-label{font-size:9px;letter-spacing:2px;color:${accent};margin-bottom:10px}
.p-text{font-size:17px;opacity:.55;font-style:italic;max-width:580px;line-height:1.6;margin-bottom:16px}
.prd-sec{padding:36px 40px;border-top:1px solid ${border};max-width:760px}
.prd-sec h3{font-size:9px;letter-spacing:2px;color:${accent};margin:24px 0 8px;font-weight:700}
.prd-sec h3:first-child{margin-top:0}
.prd-sec p,.prd-sec li{font-size:13px;opacity:.6;line-height:1.75;max-width:680px}
.prd-sec ul{padding-left:16px;margin:6px 0}
.prd-sec li{margin-bottom:4px}
.prd-sec strong{opacity:1;color:${fg}}
footer{padding:24px 40px;border-top:1px solid ${border};font-size:10px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px}
.toast{position:fixed;bottom:20px;right:20px;background:${accent};color:${bg};font-family:inherit;font-size:10px;font-weight:700;letter-spacing:1px;padding:8px 16px;border-radius:6px;transform:translateY(70px);opacity:0;transition:all .25s;z-index:999}
.toast.show{transform:translateY(0);opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-id">${sub.id}</div>
</nav>
<section class="hero">
  <div class="tag">HEARTBEAT DESIGN · DEVELOPER TOOLS · ${new Date(NOW).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}).toUpperCase()}</div>
  <h1>FORGE</h1>
  <p class="sub">Your AI dev team. One monthly subscription.</p>
  <div class="actions">
    <button class="btn btn-p" onclick="document.getElementById('viewer-frame').scrollIntoView({behavior:'smooth'})">Open in Viewer</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/${SLUG}-viewer" target="_blank">↗ Full Viewer</a>
    <button class="btn btn-s" id="copy-prompt-btn">Copy Prompt</button>
    <a class="btn btn-x" href="https://x.com/intent/tweet?text=${shareText}&url=https://ram.zenbin.org/${SLUG}" target="_blank">Share on ✕</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/design-gallery" target="_blank">← Gallery</a>
  </div>
</section>
<section class="preview">
  <div class="section-label">10 SCREENS — 5 MOBILE · 5 DESKTOP</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>
<section class="brand">
  <div class="section-label">BRAND SPECIFICATION</div>
  <div class="brand-grid">
    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:14px">COLOR PALETTE</div>
      <div class="swatches">${swatches}</div>
      <div style="margin-top:24px;font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:14px">TYPE SCALE</div>
      <div style="padding:12px 0;border-bottom:1px solid ${border}">
        <div style="font-size:9px;opacity:.35;letter-spacing:1px;margin-bottom:6px">DISPLAY · 80px / 900</div>
        <div style="font-size:36px;font-weight:900;line-height:1;color:${fg};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">FORGE</div>
      </div>
      <div style="padding:12px 0;border-bottom:1px solid ${border}">
        <div style="font-size:9px;opacity:.35;letter-spacing:1px;margin-bottom:6px">HEADING · 24px / 700</div>
        <div style="font-size:18px;font-weight:700;color:${fg}">Your AI dev team.</div>
      </div>
      <div style="padding:12px 0;border-bottom:1px solid ${border}">
        <div style="font-size:9px;opacity:.35;letter-spacing:1px;margin-bottom:6px">BODY · 14px / 400</div>
        <div style="font-size:13px;opacity:.6;line-height:1.6">Unlimited requests. Agents deliver code within 2–5 days.</div>
      </div>
      <div style="padding:12px 0">
        <div style="font-size:9px;opacity:.35;letter-spacing:1px;margin-bottom:6px">CAPTION · 10px / 700</div>
        <div style="font-size:10px;font-weight:700;letter-spacing:2px;color:${accent}">FORGE-01 · ACTIVE · TSK-0047</div>
      </div>
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:14px">CSS DESIGN TOKENS</div>
      <div class="tokens-block">
        <button class="copy-btn" onclick="copyTokens()">COPY</button>
        <pre class="tokens-pre">${cssTokens}</pre>
      </div>
    </div>
  </div>
</section>
<section class="prompt-sec">
  <div class="p-label">ORIGINAL PROMPT</div>
  <p class="p-text" id="orig-prompt">"${sub.prompt}"</p>
</section>
<section class="prd-sec">
  <div class="section-label" style="margin-bottom:20px">PRODUCT BRIEF</div>
  ${prdHTML}
</section>
<section style="padding:24px 40px;border-top:1px solid ${border}">
  <div class="section-label">INLINE VIEWER</div>
  <iframe id="viewer-frame" src="https://ram.zenbin.org/${SLUG}-viewer" style="width:100%;height:700px;border:1px solid ${border};border-radius:8px" loading="lazy"></iframe>
</section>
<footer>
  <span>RAM DESIGN STUDIO · HEARTBEAT</span>
  <span>${new Date(NOW).toUTCString()}</span>
  <span>${HEARTBEAT_ID}</span>
</footer>
<script>
function copyTokens() {
  const t = document.querySelector('.tokens-pre').textContent;
  navigator.clipboard.writeText(t).then(() => showToast());
}
document.getElementById('copy-prompt-btn').addEventListener('click', () => {
  navigator.clipboard.writeText(document.getElementById('orig-prompt').textContent).then(() => showToast());
});
function showToast() {
  const t = document.getElementById('toast');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1800);
}
<\/script>
</body></html>`;
}

// ── HTTP helpers ───────────────────────────────────────────────────────────────
function httpsReq(opts, body) {
  return new Promise((res, rej) => {
    const r = https.request(opts, resp => {
      let d = '';
      resp.on('data', c => d += c);
      resp.on('end', () => res({ status: resp.statusCode, body: d }));
    });
    r.on('error', rej);
    if (body) r.write(body);
    r.end();
  });
}

async function publish(slug, title, html) {
  const body = JSON.stringify({ title, html });
  return httpsReq({
    hostname: 'zenbin.org',
    path: `/v1/pages/${slug}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
      'X-Subdomain': 'ram',
    },
  }, body);
}

async function pushGallery(entry) {
  // Get current queue + SHA
  const gr = await httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GH_REPO}/contents/queue.json`,
    method: 'GET',
    headers: { 'Authorization': `token ${GH_TOKEN}`, 'User-Agent': 'ram-design-studio/1.0', 'Accept': 'application/vnd.github.v3+json' },
  });
  if (gr.status !== 200) throw new Error(`GitHub GET queue: HTTP ${gr.status}`);
  const { content, sha } = JSON.parse(gr.body);
  const queue = JSON.parse(Buffer.from(content, 'base64').toString('utf8'));
  if (!queue.submissions) queue.submissions = [];
  queue.submissions.push(entry);
  const newContent = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const putBody = JSON.stringify({ message: `add: forge heartbeat — ${entry.design_url}`, content: newContent, sha });
  return httpsReq({
    hostname: 'api.github.com',
    path: `/repos/${GH_REPO}/contents/queue.json`,
    method: 'PUT',
    headers: { 'Authorization': `token ${GH_TOKEN}`, 'User-Agent': 'ram-design-studio/1.0', 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(putBody), 'Accept': 'application/vnd.github.v3+json' },
  }, putBody);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🎨 FORGE — Design Discovery Pipeline');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Build hero HTML
  const heroHTML = buildHeroHTML(doc);
  console.log(`✓ Hero HTML built: ${(heroHTML.length / 1024).toFixed(1)} KB`);

  // Build viewer HTML
  const viewerPath = path.join(__dirname, 'penviewer-app.html');
  let viewerHtml = fs.existsSync(viewerPath)
    ? fs.readFileSync(viewerPath, 'utf8')
    : '<html><body>Viewer unavailable</body></html>';
  const penJson   = fs.readFileSync(path.join(__dirname, 'forge.pen'), 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');
  console.log(`✓ Viewer HTML built: ${(viewerHtml.length / 1024).toFixed(1)} KB`);

  // Publish hero
  console.log(`\n  → Publishing hero to ram.zenbin.org/${SLUG} ...`);
  const r1 = await publish(SLUG, 'FORGE — AI Dev Subscription Platform · RAM Design Studio', heroHTML);
  console.log(`  ${r1.status === 200 || r1.status === 201 ? '✓' : '✗'} HTTP ${r1.status}`);
  if (r1.status !== 200 && r1.status !== 201) console.log('  ', r1.body.slice(0, 200));

  // Publish viewer
  console.log(`  → Publishing viewer to ram.zenbin.org/${SLUG}-viewer ...`);
  const r2 = await publish(`${SLUG}-viewer`, 'FORGE — Viewer · RAM Design Studio', viewerHtml);
  console.log(`  ${r2.status === 200 || r2.status === 201 ? '✓' : '✗'} HTTP ${r2.status}`);

  // Push to gallery
  console.log('\n  → Pushing to gallery queue...');
  try {
    const qr = await pushGallery({
      id: sub.id,
      submitted_at: NOW,
      design_url: `https://ram.zenbin.org/${SLUG}`,
      viewer_url:  `https://ram.zenbin.org/${SLUG}-viewer`,
      app_name:    meta.appName,
      tagline:     meta.tagline,
      archetype:   meta.archetype,
      credit:      sub.credit,
      status:      'done',
    });
    console.log(`  ${qr.status === 200 || qr.status === 201 ? '✓' : '✗'} Gallery queue HTTP ${qr.status}`);
  } catch (e) {
    console.log(`  ⚠ Gallery push failed: ${e.message}`);
  }

  console.log('\n🔗 Live URLs:');
  console.log(`   Hero:   https://ram.zenbin.org/${SLUG}`);
  console.log(`   Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log('');
}

main().catch(console.error);
