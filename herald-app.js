// herald-app.js
// HERALD — AI-native async team pulse intelligence
//
// Challenge: Design a light-mode team standup & work-pulse tracker where
// AI agents autonomously collect updates from Slack, GitHub, and Linear,
// then surface a clean daily digest — inspired by the specific "agent-first"
// UI paradigm seen across the Apr 2026 design research run.
//
// Inspired by:
// 1. Midday.ai (darkmodedesign.com featured, Apr 2026) — "Let agents run
//    your business" headline; feature tab nav (Invoicing, Transactions…);
//    the agent as the primary actor, human as observer/approver. Applied
//    here to team productivity instead of finance.
// 2. Folk.app (minimal.gallery SAAS, Apr 2026) — clean white CRM,
//    "folk Assistants" framing, real UI as hero element, card grid layout,
//    warm minimal typography at generous scale.
// 3. Isidor.ai (minimal.gallery SAAS, Apr 2026) — binary/hex strings as
//    structural section headings ("010111000", "000011010"). Here inverted
//    to a light cream BG with dark data strings as visual texture.
//
// Innovation: Isidor's data-as-decoration pattern on LIGHT background;
// agent activity cards with live pulse indicators; contributor "aura" rings
// showing update freshness; warm-indigo palette on cream.
//
// Theme: LIGHT (datum was DARK → this run LIGHT)
// Screens: 5 mobile (390×844)

'use strict';
const fs   = require('fs');
const path = require('path');

// ── Palette ────────────────────────────────────────────────────────────────────
const BG      = '#F4F3EF';   // warm cream
const S1      = '#FFFFFF';   // card surface
const S2      = '#EEEDF0';   // tinted surface / tag bg
const S3      = '#E6E4DE';   // divider / subtle
const TEXT    = '#141318';   // near-black (cool-warm)
const MUTED   = '#8B8A96';   // warm muted
const MUTED2  = '#D4D3DC';   // progress tracks / empty
const INDIGO  = '#5B3CF5';   // primary accent
const IND_L   = '#EEE9FD';   // indigo tint
const AMBER   = '#D9860A';   // secondary accent
const AMB_L   = '#FDF3E3';   // amber tint
const GREEN   = '#1A7D4A';   // success / resolved
const GRN_L   = '#E5F5EC';   // green tint
const RED     = '#CC3726';   // blocker / at-risk
const RED_L   = '#FCECEA';   // red tint
const BORDER  = '#E4E2DA';   // card borders

// ── Data strip strings (Isidor.ai pattern — light inversion) ──────────────────
const DATA = [
  '01001000 01100101 01110010 01100001 01101100 01100100 00100000 01000001 01001001',
  '0x5B3C · 0xF4F3 · 0x1413 · 0xD986 · 0x1A7D · 0xCC37 · 0xBEEF · 0xDEAD · 0xCAFE',
  '01110100 01100101 01100001 01101101 00100000 01110000 01110101 01101100 01110011',
  '0x01 · 0x02 · 0x04 · 0x08 · 0x10 · 0x20 · 0x40 · 0x80 · 0xFF · 0x1E · 0x3C',
];

// ── Primitives ─────────────────────────────────────────────────────────────────
function R(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, width: w, height: h, fill,
    radius:  opts.radius  ?? 0,
    opacity: opts.opacity ?? 1,
    ...(opts.stroke ? { stroke: opts.stroke, strokeWidth: opts.sw ?? 1 } : {}),
  };
}
function T(x, y, text, opts = {}) {
  return {
    type: 'text', x, y, text: String(text),
    fontSize:   opts.size   ?? 13,
    fontWeight: opts.weight ?? 'regular',
    color:      opts.color  ?? TEXT,
    align:      opts.align  ?? 'left',
    opacity:    opts.opacity ?? 1,
    ...(opts.mono ? { fontFamily: 'monospace' } : {}),
    ...(opts.ls   ? { letterSpacing: opts.ls } : {}),
  };
}
function C(x, y, r, fill, opts = {}) {
  return { type: 'circle', x, y, radius: r, fill, opacity: opts.opacity ?? 1 };
}
function L(x1, y1, x2, y2, color, opts = {}) {
  return { type: 'line', x1, y1, x2, y2, color, width: opts.w ?? 1, opacity: opts.opacity ?? 1 };
}

// ── Strip + bar helpers ────────────────────────────────────────────────────────
const navH = 72;

function dataStrip(els, y, W, idx, opacity = 0.07) {
  els.push(T(0, y, DATA[idx % DATA.length], {
    size: 6.5, mono: true, color: TEXT, opacity, ls: 1.5,
  }));
}

function statusBar(els, W) {
  els.push(T(24, 18, '9:41', { size: 13, weight: 'semibold' }));
  els.push(T(W - 24, 18, '●●● ▲ 🔋', { size: 10, color: MUTED, align: 'right' }));
}

function bottomNav(els, W, H, active) {
  els.push(R(0, H - navH, W, navH, S1, { stroke: BORDER, sw: 1 }));
  const items = [
    { icon: '◎', label: 'Today'   },
    { icon: '◉', label: 'Team'    },
    { icon: '◈', label: 'Feed'    },
    { icon: '◇', label: 'Work'    },
    { icon: '◻', label: 'Insights'},
  ];
  items.forEach((item, i) => {
    const nx = 39 + i * 78;
    const isActive = i === active;
    const ic = isActive ? INDIGO : MUTED;
    const tc = isActive ? INDIGO : MUTED;
    els.push(T(nx, H - navH + 16, item.icon, { size: 16, color: ic, align: 'center' }));
    els.push(T(nx, H - navH + 38, item.label, { size: 8.5, color: tc, align: 'center', ls: 0.2 }));
    if (isActive) els.push(R(nx - 16, H - navH, 32, 2.5, INDIGO, { radius: 1.5 }));
  });
}

// ── SCREEN 1: Today ────────────────────────────────────────────────────────────
function screenToday() {
  const W = 390, H = 844;
  const els = [];
  els.push(R(0, 0, W, H, BG));
  statusBar(els, W);

  // Header
  els.push(T(24, 56, 'HERALD', { size: 22, weight: 'bold', ls: 3.5, color: INDIGO }));
  els.push(T(24, 82, 'Friday, April 4', { size: 16, weight: 'semibold' }));
  els.push(T(24, 102, 'Agents collected updates from 8 teammates', { size: 11, color: MUTED }));

  // Agent status badge
  els.push(R(W - 112, 72, 88, 26, IND_L, { radius: 13, stroke: INDIGO + '40', sw: 1 }));
  els.push(C(W - 96, 85, 4, INDIGO));
  els.push(C(W - 96, 85, 8, INDIGO, { opacity: 0.22 }));
  els.push(T(W - 84, 79, 'agents on', { size: 10, weight: 'semibold', color: INDIGO }));

  dataStrip(els, 118, W, 0, 0.07);

  // Pulse score hero card
  els.push(R(24, 128, W - 48, 100, S1, { radius: 20, stroke: BORDER, sw: 1 }));
  els.push(T(40, 142, 'TEAM PULSE', { size: 8.5, weight: 'bold', color: MUTED, ls: 2 }));
  els.push(T(40, 172, '8.4', { size: 40, weight: 'bold', color: INDIGO }));
  els.push(T(112, 178, '/ 10', { size: 16, color: MUTED }));
  els.push(R(40, 198, 80, 14, MUTED2, { radius: 7 }));
  els.push(R(40, 198, 80 * 0.84, 14, INDIGO, { radius: 7 }));
  els.push(T(40, 218, 'vs last week: ↑ 0.6', { size: 11, color: GREEN }));

  // Quick metrics
  const qm = [
    { label: 'Updated',  value: '8 / 9',  sub: 'teammates',  color: GREEN  },
    { label: 'Blocked',  value: '2',       sub: 'need help',  color: RED    },
    { label: 'Shipped',  value: '5 PRs',   sub: 'merged',     color: INDIGO },
  ];
  qm.forEach((m, i) => {
    const mx = 24 + i * 118;
    els.push(R(mx, 236, 110, 64, S1, { radius: 14, stroke: BORDER, sw: 1 }));
    els.push(T(mx + 10, 248, m.label, { size: 8, weight: 'bold', color: MUTED, ls: 1.2 }));
    els.push(T(mx + 10, 270, m.value, { size: 18, weight: 'bold', color: m.color }));
    els.push(T(mx + 10, 288, m.sub, { size: 9, color: MUTED }));
  });

  dataStrip(els, 310, W, 1, 0.07);

  // Blockers section
  els.push(T(24, 320, 'BLOCKERS', { size: 9, weight: 'bold', color: RED, ls: 2 }));
  const blockers = [
    { name: 'Priya S.',    issue: 'Auth service PR failing CI — needs review', time: '4h' },
    { name: 'Marcus L.',   issue: 'Waiting on design spec for onboarding V2',  time: '1d' },
  ];
  blockers.forEach((b, i) => {
    const by = 338 + i * 64;
    els.push(R(24, by, W - 48, 54, RED_L, { radius: 14, stroke: RED + '30', sw: 1 }));
    els.push(R(24, by, 4, 54, RED, { radius: 2 }));
    els.push(T(38, by + 14, b.name, { size: 11, weight: 'bold', color: RED }));
    els.push(T(38, by + 30, b.issue, { size: 10, color: TEXT }));
    els.push(T(W - 38, by + 20, b.time, { size: 9, color: MUTED, align: 'right' }));
  });

  // Wins section
  dataStrip(els, 472, W, 2, 0.07);
  els.push(T(24, 482, 'WINS TODAY', { size: 9, weight: 'bold', color: GREEN, ls: 2 }));
  const wins = [
    { name: 'Sam K.',  win: 'Shipped search redesign — 40ms perf gain', type: 'deploy' },
    { name: 'Yui T.',  win: 'Closed 8 support tickets in 2 hours',       type: 'service'},
    { name: 'Eli M.',  win: 'API docs fully updated & reviewed',          type: 'docs'  },
  ];
  wins.forEach((w, i) => {
    const wy = 500 + i * 56;
    els.push(L(24, wy, W - 24, wy, BORDER, { w: 1 }));
    els.push(R(24, wy + 10, 34, 34, GRN_L, { radius: 10 }));
    els.push(T(41, wy + 23, '✓', { size: 13, weight: 'bold', color: GREEN, align: 'center' }));
    els.push(T(68, wy + 16, w.name, { size: 11, weight: 'semibold' }));
    els.push(T(68, wy + 32, w.win, { size: 10, color: MUTED }));
  });

  // Agent note footer
  els.push(R(24, 674, W - 48, 48, IND_L, { radius: 14, stroke: INDIGO + '30', sw: 1 }));
  els.push(T(40, 688, '◎ Herald Agent', { size: 10, weight: 'bold', color: INDIGO }));
  els.push(T(40, 704, 'Collected 8 standups via Slack · 5 PRs via GitHub · synced 9:02am', { size: 9.5, color: TEXT }));

  bottomNav(els, W, H, 0);
  return { name: 'Today', width: W, height: H, elements: els };
}

// ── SCREEN 2: Team ────────────────────────────────────────────────────────────
function screenTeam() {
  const W = 390, H = 844;
  const els = [];
  els.push(R(0, 0, W, H, BG));
  statusBar(els, W);

  els.push(T(24, 56, 'TEAM', { size: 22, weight: 'bold', ls: 3.5, color: INDIGO }));
  els.push(T(24, 82, '9 members · Updated today', { size: 12, color: MUTED }));

  dataStrip(els, 100, W, 1, 0.07);

  const members = [
    { name: 'Priya S.',   role: 'Backend',    status: 'blocked',   mood: '😤', update: 'Auth PR stuck in CI', since: '4h', color: RED    },
    { name: 'Marcus L.',  role: 'Design',     status: 'waiting',   mood: '😐', update: 'Need spec for V2',    since: '1d', color: AMBER  },
    { name: 'Sam K.',     role: 'Frontend',   status: 'shipped',   mood: '🚀', update: 'Search redesign live',since: '2h', color: GREEN  },
    { name: 'Yui T.',     role: 'Support',    status: 'active',    mood: '💪', update: 'Closed 8 tickets',    since: '1h', color: INDIGO },
    { name: 'Eli M.',     role: 'Docs',       status: 'active',    mood: '✅', update: 'API docs done',        since: '3h', color: GREEN  },
    { name: 'Dani R.',    role: 'Infra',      status: 'active',    mood: '🔧', update: 'K8s upgrade in staging',since:'5h',color: INDIGO },
    { name: 'Zora P.',    role: 'PM',         status: 'meeting',   mood: '📋', update: 'In sprint planning',  since: '30m',color: AMBER  },
    { name: 'Leo H.',     role: 'QA',         status: 'active',    mood: '🧪', update: 'Testing payments flow', since:'2h', color: INDIGO },
    { name: 'Nour A.',    role: 'Mobile',     status: 'no update', mood: '💤', update: 'No update yet',        since: '—', color: MUTED  },
  ];

  const statusColors = {
    'blocked':   RED,
    'waiting':   AMBER,
    'shipped':   GREEN,
    'active':    INDIGO,
    'meeting':   AMBER,
    'no update': MUTED,
  };
  const statusBgs = {
    'blocked':   RED_L,
    'waiting':   AMB_L,
    'shipped':   GRN_L,
    'active':    IND_L,
    'meeting':   AMB_L,
    'no update': S2,
  };

  members.forEach((m, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    if (i === 8) { // last item centered
      const mx = 24 + 0 * (W / 2 - 12);
      const my = 116 + row * 88;
      const mw = W / 2 - 36;
      els.push(R(24 + (W - 48)/2 - mw/2, my, mw, 76, S1, { radius: 14, stroke: statusColors[m.status] + '40', sw: 1 }));
      // simplified
      els.push(T(24 + (W - 48)/2, my + 20, m.mood + ' ' + m.name, { size: 11, weight: 'bold', align: 'center' }));
      els.push(T(24 + (W - 48)/2, my + 38, m.role, { size: 9, color: MUTED, align: 'center' }));
      els.push(R(24 + (W - 48)/2 - 32, my + 52, 64, 16, statusBgs[m.status], { radius: 8 }));
      els.push(T(24 + (W - 48)/2, my + 56, m.status, { size: 8, weight: 'bold', color: statusColors[m.status], align: 'center' }));
      return;
    }
    const mx = 24 + col * (W / 2 - 12);
    const my = 116 + row * 88;
    const mw = W / 2 - 36;
    const sc = statusColors[m.status];
    els.push(R(mx, my, mw, 76, S1, { radius: 14, stroke: sc + '40', sw: 1 }));
    // Top accent strip
    els.push(R(mx, my, mw, 3, sc, { radius: 2 }));
    // Mood + name
    els.push(T(mx + mw / 2, my + 18, m.mood, { size: 14, align: 'center' }));
    els.push(T(mx + mw / 2, my + 36, m.name, { size: 10, weight: 'bold', align: 'center' }));
    els.push(T(mx + mw / 2, my + 50, m.role, { size: 8.5, color: MUTED, align: 'center' }));
    // Status chip
    els.push(R(mx + mw / 2 - 30, my + 58, 60, 14, statusBgs[m.status], { radius: 7 }));
    els.push(T(mx + mw / 2, my + 63, m.status, { size: 7.5, weight: 'bold', color: sc, align: 'center' }));
  });

  bottomNav(els, W, H, 1);
  return { name: 'Team', width: W, height: H, elements: els };
}

// ── SCREEN 3: Update Feed ──────────────────────────────────────────────────────
function screenFeed() {
  const W = 390, H = 844;
  const els = [];
  els.push(R(0, 0, W, H, BG));
  statusBar(els, W);

  els.push(T(24, 56, 'FEED', { size: 22, weight: 'bold', ls: 3.5, color: INDIGO }));
  els.push(T(24, 82, 'Agent-collected standups', { size: 12, color: MUTED }));

  // Source filter pills
  const filters = ['All', 'Slack', 'GitHub', 'Linear'];
  filters.forEach((f, i) => {
    const fx = 24 + i * 82;
    const isActive = f === 'All';
    els.push(R(fx, 96, 70, 24, isActive ? INDIGO : S1, { radius: 12, stroke: isActive ? INDIGO : BORDER, sw: 1 }));
    els.push(T(fx + 35, 104, f, { size: 10, weight: isActive ? 'bold' : 'regular', color: isActive ? S1 : MUTED, align: 'center' }));
  });

  dataStrip(els, 132, W, 2, 0.07);

  const feeds = [
    {
      source: 'Slack',    sourceColor: INDIGO,
      author: 'Sam K.',   time: '9:02am',
      text: '🚀 Shipped search redesign to prod. 40ms improvement on p99. Quick thanks to Eli for the doc support.',
      type: 'update', reactions: '🎉 6  👀 3',
    },
    {
      source: 'GitHub',   sourceColor: TEXT,
      author: 'Priya S.', time: '8:54am',
      text: 'PR #847 auth-service/rate-limiter is blocked — CI fails on integration test step 3. Anyone with k8s access?',
      type: 'blocker', reactions: '🙋 2',
    },
    {
      source: 'Linear',   sourceColor: AMBER,
      author: 'Zora P.',  time: '9:15am',
      text: '📋 Sprint 22 planning locked. 18 points committed. Onboarding V2 spec still needed by Marcus.',
      type: 'update', reactions: '✅ 5  💬 2',
    },
    {
      source: 'Slack',    sourceColor: INDIGO,
      author: 'Yui T.',   time: '10:04am',
      text: '💪 Cleared the support backlog — 8 tickets closed, 2 escalated to backend. Response time avg: 23min.',
      type: 'win', reactions: '🔥 4  ❤️ 8',
    },
    {
      source: 'GitHub',   sourceColor: TEXT,
      author: 'Dani R.',  time: '8:30am',
      text: 'K8s cluster upgrade staging complete. Node pools on 1.29. Will promote to prod Monday after load test.',
      type: 'update', reactions: '👍 3',
    },
  ];

  const typeColors = { update: INDIGO, blocker: RED, win: GREEN };
  const typeBgs    = { update: IND_L, blocker: RED_L, win: GRN_L };

  feeds.forEach((f, i) => {
    const fy = 148 + i * 118;
    const tc = typeColors[f.type];
    els.push(R(24, fy, W - 48, 108, S1, { radius: 16, stroke: BORDER, sw: 1 }));
    els.push(R(24, fy, 4, 108, tc, { radius: 2 }));

    // Header row
    els.push(R(36, fy + 10, 44, 16, typeBgs[f.type], { radius: 8 }));
    els.push(T(58, fy + 16, f.source, { size: 8.5, weight: 'bold', color: tc, align: 'center' }));
    els.push(T(90, fy + 16, f.author, { size: 11, weight: 'bold' }));
    els.push(T(W - 36, fy + 16, f.time, { size: 9, color: MUTED, align: 'right' }));

    // Text
    els.push(T(36, fy + 34, f.text.length > 90 ? f.text.slice(0, 88) + '…' : f.text, { size: 10, color: TEXT }));
    if (f.text.length > 90) {
      const line2 = f.text.slice(88, 170);
      els.push(T(36, fy + 48, line2.length > 80 ? line2.slice(0, 80) + '…' : line2, { size: 10, color: TEXT }));
    }

    // Reactions
    els.push(T(36, fy + 92, f.reactions, { size: 10, color: MUTED }));
    els.push(T(W - 36, fy + 92, '→ reply', { size: 9, color: INDIGO, align: 'right' }));
  });

  bottomNav(els, W, H, 2);
  return { name: 'Feed', width: W, height: H, elements: els };
}

// ── SCREEN 4: Work / Projects ──────────────────────────────────────────────────
function screenWork() {
  const W = 390, H = 844;
  const els = [];
  els.push(R(0, 0, W, H, BG));
  statusBar(els, W);

  els.push(T(24, 56, 'WORK', { size: 22, weight: 'bold', ls: 3.5, color: INDIGO }));
  els.push(T(24, 82, 'Sprint 22 · 18 pts committed', { size: 12, color: MUTED }));

  // Sprint progress bar
  els.push(R(24, 98, W - 48, 6, MUTED2, { radius: 3 }));
  els.push(R(24, 98, (W - 48) * 0.56, 6, INDIGO, { radius: 3 }));
  els.push(T(24, 116, '56% complete', { size: 9.5, weight: 'semibold', color: INDIGO }));
  els.push(T(W - 24, 116, '7 days left', { size: 9.5, color: MUTED, align: 'right' }));

  dataStrip(els, 124, W, 3, 0.07);

  // Project cards
  const projects = [
    {
      name: 'Search Redesign',
      status: 'shipped',
      lead: 'Sam K.',
      progress: 100,
      prs: 5,
      issues: 0,
      color: GREEN,
      desc: 'Complete · Deployed to prod',
    },
    {
      name: 'Auth Hardening',
      status: 'blocked',
      lead: 'Priya S.',
      progress: 65,
      prs: 2,
      issues: 1,
      color: RED,
      desc: 'CI failing on rate-limiter PR',
    },
    {
      name: 'Onboarding V2',
      status: 'in design',
      lead: 'Marcus L.',
      progress: 20,
      prs: 0,
      issues: 3,
      color: AMBER,
      desc: 'Waiting on design spec',
    },
    {
      name: 'K8s Upgrade',
      status: 'staging',
      lead: 'Dani R.',
      progress: 80,
      prs: 1,
      issues: 0,
      color: INDIGO,
      desc: 'Load test scheduled Monday',
    },
  ];

  projects.forEach((p, i) => {
    const py = 140 + i * 128;
    const sc = p.color;
    els.push(R(24, py, W - 48, 118, S1, { radius: 18, stroke: BORDER, sw: 1 }));
    els.push(R(24, py, W - 48, 3, sc, { radius: 2 })); // top bar

    // Name + status
    els.push(T(40, py + 18, p.name, { size: 14, weight: 'bold' }));
    const statusBg = { shipped: GRN_L, blocked: RED_L, 'in design': AMB_L, staging: IND_L };
    els.push(R(W - 96, py + 12, 74, 20, statusBg[p.status] || S2, { radius: 10 }));
    els.push(T(W - 59, py + 18, p.status, { size: 9, weight: 'bold', color: sc, align: 'center' }));

    // Lead + desc
    els.push(T(40, py + 36, `Lead: ${p.lead}`, { size: 10, color: MUTED }));
    els.push(T(40, py + 52, p.desc, { size: 10.5, color: TEXT }));

    // Progress bar
    const bw = W - 96;
    els.push(R(40, py + 72, bw, 6, MUTED2, { radius: 3 }));
    els.push(R(40, py + 72, bw * (p.progress / 100), 6, sc, { radius: 3 }));
    els.push(T(40, py + 88, `${p.progress}%`, { size: 9, weight: 'semibold', color: sc }));

    // PR/issue chips
    els.push(R(W - 120, py + 82, 40, 16, p.prs > 0 ? GRN_L : S2, { radius: 8 }));
    els.push(T(W - 100, py + 88, `${p.prs} PR`, { size: 8.5, weight: 'semibold', color: p.prs > 0 ? GREEN : MUTED, align: 'center' }));
    els.push(R(W - 74, py + 82, 42, 16, p.issues > 0 ? RED_L : S2, { radius: 8 }));
    els.push(T(W - 53, py + 88, `${p.issues} iss`, { size: 8.5, weight: 'semibold', color: p.issues > 0 ? RED : MUTED, align: 'center' }));
  });

  bottomNav(els, W, H, 3);
  return { name: 'Work', width: W, height: H, elements: els };
}

// ── SCREEN 5: Insights ─────────────────────────────────────────────────────────
function screenInsights() {
  const W = 390, H = 844;
  const els = [];
  els.push(R(0, 0, W, H, BG));
  statusBar(els, W);

  els.push(T(24, 56, 'INSIGHTS', { size: 20, weight: 'bold', ls: 2, color: INDIGO }));
  els.push(T(24, 80, 'AI week-in-review · Apr 4, 2026', { size: 12, color: MUTED }));

  dataStrip(els, 98, W, 0, 0.07);

  // Weekly velocity sparkline
  els.push(T(24, 108, 'WEEKLY VELOCITY', { size: 9, weight: 'bold', color: MUTED, ls: 2 }));
  const wks = ['W47', 'W48', 'W49', 'W50', 'W51', 'W52', 'W1'];
  const pts = [12, 15, 11, 18, 14, 16, 18];
  const maxP = Math.max(...pts);
  wks.forEach((w, i) => {
    const bx = 24 + i * 48, by = 168, bh = (pts[i] / maxP) * 44;
    const isLast = i === pts.length - 1;
    els.push(R(bx, by - bh, 36, bh, isLast ? INDIGO : MUTED2, { radius: 5 }));
    els.push(T(bx + 18, by + 10, w, { size: 8, color: MUTED, align: 'center' }));
    if (isLast) els.push(T(bx + 18, by - bh - 12, `${pts[i]}pt`, { size: 8, weight: 'bold', color: INDIGO, align: 'center' }));
  });

  dataStrip(els, 196, W, 1, 0.07);

  // AI narrative card
  els.push(R(24, 206, W - 48, 118, IND_L, { radius: 18, stroke: INDIGO + '30', sw: 1 }));
  els.push(T(40, 220, '◎ HERALD AI', { size: 9.5, weight: 'bold', color: INDIGO }));
  const narrative = [
    'This was a strong delivery week. Sam shipped search',
    'redesign (40ms p99 gain), Yui cleared support backlog,',
    'and sprint 22 is 56% complete with 7 days left.',
    '',
    'Watch: Auth hardening is blocked — CI issue needs',
    'attention. Onboarding V2 spec gap may slip Q2 target.',
  ];
  narrative.forEach((line, i) => {
    if (line) els.push(T(40, 238 + i * 14, line, { size: 10, color: TEXT }));
  });

  // Trend charts
  dataStrip(els, 336, W, 2, 0.07);
  els.push(T(24, 346, 'TRENDS', { size: 9, weight: 'bold', color: MUTED, ls: 2 }));

  const trends = [
    { label: 'Avg update time', value: '9:12am', sub: '↑ earlier this week', color: GREEN  },
    { label: 'Blocker freq',    value: '2.1/wk',  sub: '↓ down from 3.4',    color: INDIGO },
    { label: 'Mood avg',        value: '7.8/10',  sub: '↑ +0.4 vs last wk',  color: GREEN  },
    { label: 'No-update rate',  value: '6%',      sub: '↓ lowest this qtr',  color: GREEN  },
  ];
  trends.forEach((tr, i) => {
    const row = Math.floor(i / 2), col = i % 2;
    const tx = 24 + col * (W / 2 - 12), ty = 364 + row * 76;
    const tw = W / 2 - 36;
    els.push(R(tx, ty, tw, 66, S1, { radius: 14, stroke: BORDER, sw: 1 }));
    els.push(T(tx + 12, ty + 12, tr.label, { size: 8, weight: 'bold', color: MUTED, ls: 0.5 }));
    els.push(T(tx + 12, ty + 34, tr.value, { size: 18, weight: 'bold', color: tr.color }));
    els.push(T(tx + 12, ty + 52, tr.sub, { size: 8.5, color: MUTED }));
  });

  // Top contributor
  dataStrip(els, 524, W, 3, 0.07);
  els.push(T(24, 534, 'TOP CONTRIBUTOR', { size: 9, weight: 'bold', color: MUTED, ls: 2 }));
  els.push(R(24, 552, W - 48, 72, S1, { radius: 16, stroke: BORDER, sw: 1 }));
  els.push(C(52, 588, 22, IND_L));
  els.push(T(52, 583, '🚀', { size: 18, align: 'center' }));
  els.push(T(84, 572, 'Sam K.', { size: 15, weight: 'bold' }));
  els.push(T(84, 590, 'Shipped 5 PRs · 0 blockers · 100% on search project', { size: 9.5, color: MUTED }));
  els.push(R(W - 90, 576, 66, 20, IND_L, { radius: 10 }));
  els.push(T(W - 57, 582, '🏆 MVP week', { size: 9, weight: 'bold', color: INDIGO, align: 'center' }));

  // Next sprint preview
  els.push(R(24, 640, W - 48, 48, AMB_L, { radius: 14, stroke: AMBER + '40', sw: 1 }));
  els.push(T(40, 654, '◈ Sprint 23 starts Monday', { size: 10, weight: 'bold', color: AMBER }));
  els.push(T(40, 670, 'Herald will collect retrospective entries Fri 5pm via Slack', { size: 9.5, color: TEXT }));

  bottomNav(els, W, H, 4);
  return { name: 'Insights', width: W, height: H, elements: els };
}

// ── Assemble .pen ──────────────────────────────────────────────────────────────
const screens = [
  screenToday(),
  screenTeam(),
  screenFeed(),
  screenWork(),
  screenInsights(),
];

const pen = {
  version: '2.8',
  meta: {
    name: 'HERALD',
    description: 'AI-native async team pulse intelligence',
    author: 'RAM',
    created: new Date().toISOString(),
  },
  screens,
};

const outPath = path.join(__dirname, 'herald.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ herald.pen written (${screens.length} screens, ${screens.reduce((s, sc) => s + sc.elements.length, 0)} elements)`);
