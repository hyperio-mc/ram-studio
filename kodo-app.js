/**
 * KŌDO — Engineering Intelligence Platform
 *
 * Trend: "Dev-OS" dark apps (Neon.com, Interfere, darkmodedesign.com picks)
 * Style: Deep navy-black bg, electric cyan accent, DORA-metric cards
 * New pattern: Horizontal data-rail of live metrics + pulsing status ring
 * Theme: DARK (prev run "Finch" was light)
 * Screens: 5 — Dashboard, Pull Requests, Incidents, Team, Alerts
 */

const fs = require('fs');

// ── Palette ─────────────────────────────────────────────────────────────────
const P = {
  bg:       '#070B14',   // near-black navy
  surface:  '#0F1623',   // midnight blue surface
  surface2: '#16202E',   // slightly lighter card
  surface3: '#1D2D40',   // hover / active state
  border:   '#1F3050',   // subtle border
  text:     '#E2E8F0',   // cool white
  textMid:  '#94A3B8',   // muted label
  textDim:  '#4A6080',   // dimmed
  cyan:     '#22D3EE',   // electric cyan — primary accent
  indigo:   '#818CF8',   // indigo — secondary accent
  violet:   '#A78BFA',   // violet highlight
  green:    '#34D399',   // success / healthy
  amber:    '#FBBF24',   // warning
  red:      '#F87171',   // error / incident
  cyan10:   '#22D3EE1A', // cyan tint bg
  indigo10: '#818CF81A',
  green10:  '#34D3991A',
  red10:    '#F871711A',
  amber10:  '#FBBF241A',
};

const W = 390, H = 844;

// ── Primitive builders ────────────────────────────────────────────────────────
const el = (type, props = {}) => ({ type, ...props });
const group = (children, props = {}) => el('group', { children, ...props });

const rect = (x, y, w, h, fill, props = {}) =>
  el('rect', { x, y, w, h, fill, rx: props.rx ?? 0, ...props });

const text = (content, x, y, props = {}) =>
  el('text', {
    content, x, y,
    fontSize:   props.fontSize   ?? 13,
    fontWeight: props.fontWeight ?? '400',
    color:      props.color      ?? P.text,
    align:      props.align      ?? 'left',
    opacity:    props.opacity    ?? 1,
    ...props,
  });

// Frame builder — every screen shares this container
const frame = (id, label, children) => ({
  id, label,
  width: W, height: H,
  background: P.bg,
  children,
});

// ── Reusable components ───────────────────────────────────────────────────────

// Status dot (pulsing circle indicator — static in .pen)
const StatusDot = (x, y, color, size = 8) => group([
  rect(x - size/2, y - size/2, size, size, color + '30', { rx: size }),
  rect(x - size/2 + 2, y - size/2 + 2, size - 4, size - 4, color, { rx: size - 4 }),
], {});

// Pill chip
const Pill = (x, y, label, color, opts = {}) => group([
  rect(x, y, opts.w ?? 56, 20, color + '20', { rx: 10 }),
  text(label, x + (opts.w ?? 56)/2, y + 10, {
    fontSize: 9, fontWeight: '600', color, align: 'center',
  }),
], {});

// Icon placeholder (emoji or symbol)
const Icon = (x, y, emoji, size = 14) =>
  text(emoji, x, y + size/2, { fontSize: size, align: 'center' });

// Card container
const Card = (x, y, w, h, children, opts = {}) => group([
  rect(x, y, w, h, opts.bg ?? P.surface, { rx: opts.rx ?? 12, ...opts.rectProps }),
  ...children,
], {});

// DORA metric chip (for the horizontal data rail at top)
const DoraChip = (x, y, label, value, unit, delta, deltaPos) => Card(x, y, 108, 80, [
  text(label, x + 12, y + 16, { fontSize: 9, color: P.textDim, fontWeight: '500' }),
  text(value, x + 12, y + 40, { fontSize: 22, fontWeight: '700', color: P.text }),
  text(unit, x + 12 + (value.length * 13), y + 42, { fontSize: 10, color: P.textMid }),
  Pill(x + 12, y + 58, delta, deltaPos ? P.green : P.red, { w: 52 }),
], { rx: 10, bg: P.surface2 });

// Progress bar (horizontal)
const Bar = (x, y, w, h, pct, fill, bg) => group([
  rect(x, y, w, h, bg ?? P.border, { rx: h/2 }),
  rect(x, y, Math.round(w * pct / 100), h, fill, { rx: h/2 }),
], {});

// PR row
const PRRow = (x, y, title, author, status, age, statusColor, statusLabel) => group([
  rect(x, y, W - 40, 64, P.surface, { rx: 10 }),
  StatusDot(x + 20, y + 20, statusColor),
  text(title, x + 36, y + 15, { fontSize: 12, fontWeight: '600', color: P.text }),
  text(author, x + 36, y + 30, { fontSize: 10, color: P.textMid }),
  text(age, x + W - 80, y + 15, { fontSize: 10, color: P.textDim, align: 'right' }),
  Pill(x + W - 100, y + 34, statusLabel, statusColor, { w: 60 }),
], {});

// Incident row
const IncRow = (x, y, sev, title, service, age, sevColor) => group([
  rect(x, y, W - 40, 70, P.surface, { rx: 10 }),
  rect(x, y, 4, 70, sevColor, { rx: 2 }),
  text(sev, x + 16, y + 14, { fontSize: 9, fontWeight: '700', color: sevColor }),
  text(title, x + 16, y + 28, { fontSize: 12, fontWeight: '600', color: P.text }),
  text(service, x + 16, y + 44, { fontSize: 10, color: P.textMid }),
  text(age, x + W - 60, y + 28, { fontSize: 10, color: P.textDim, align: 'right' }),
], {});

// ── Bottom nav ────────────────────────────────────────────────────────────────
const NavBar = (active) => {
  const tabs = [
    { label: 'Home',     icon: '⌁',  id: 0 },
    { label: 'PRs',      icon: '⇄',  id: 1 },
    { label: 'Incidents',icon: '⚡',  id: 2 },
    { label: 'Team',     icon: '◎',  id: 3 },
    { label: 'Alerts',   icon: '◬',  id: 4 },
  ];
  const navY = H - 80;
  return group([
    rect(0, navY, W, 80, P.surface, {}),
    rect(0, navY, W, 1, P.border, {}),
    ...tabs.flatMap((t, i) => {
      const tx = 20 + i * 70;
      const isActive = i === active;
      return [
        ...(isActive ? [rect(tx + 15, navY + 6, 40, 3, P.cyan, { rx: 2 })] : []),
        text(t.icon, tx + 35, navY + 22, {
          fontSize: 16, align: 'center',
          color: isActive ? P.cyan : P.textDim,
        }),
        text(t.label, tx + 35, navY + 42, {
          fontSize: 9, align: 'center',
          color: isActive ? P.cyan : P.textDim,
          fontWeight: isActive ? '600' : '400',
        }),
      ];
    }),
  ]);
};

// ── Status ring helper ────────────────────────────────────────────────────────
// Represents a large circular health score — simplified as concentric rings
const StatusRing = (cx, cy, score, scoreColor) => {
  const r1 = 52, r2 = 40, r3 = 28;
  return group([
    // Outer ring bg
    rect(cx - r1, cy - r1, r1*2, r1*2, P.surface3, { rx: r1 }),
    rect(cx - r2, cy - r2, r2*2, r2*2, P.surface2, { rx: r2 }),
    rect(cx - r3, cy - r3, r3*2, r3*2, P.bg, { rx: r3 }),
    // Accent quarter-arc simulation: small colored arc at top-right
    rect(cx + 24, cy - r1, 12, 12, scoreColor, { rx: 6 }),
    rect(cx - r1, cy - 14, 12, 12, scoreColor + '60', { rx: 6 }),
    // Score inside
    text(String(score), cx, cy - 6, {
      fontSize: 28, fontWeight: '800', color: P.text, align: 'center',
    }),
    text('/100', cx, cy + 14, { fontSize: 10, color: P.textMid, align: 'center' }),
    text('DORA Score', cx, cy + 28, { fontSize: 8, color: P.textDim, align: 'center', fontWeight: '600' }),
  ]);
};

// ── SCREEN 1 — Dashboard ─────────────────────────────────────────────────────
const screenDashboard = () => {
  const topY = 54;

  return frame('dashboard', 'Dashboard', [
    // Status bar
    text('9:41', 20, 16, { fontSize: 12, fontWeight: '600', color: P.text }),
    text('◎ kōdo', W/2, 16, { fontSize: 12, fontWeight: '700', color: P.cyan, align: 'center' }),
    text('●●●', W - 20, 16, { fontSize: 10, color: P.textMid, align: 'right' }),

    // Header
    text('Engineering', 20, topY + 10, { fontSize: 26, fontWeight: '800', color: P.text }),
    text('Health', 20, topY + 38, { fontSize: 26, fontWeight: '800', color: P.cyan }),
    text('Mon · March 31', W - 20, topY + 20, { fontSize: 11, color: P.textMid, align: 'right' }),

    // Live badge
    rect(W - 70, topY + 36, 50, 18, P.green10, { rx: 9 }),
    StatusDot(W - 65, topY + 44, P.green, 6),
    text('LIVE', W - 50, topY + 44, { fontSize: 8, fontWeight: '700', color: P.green }),

    // DORA Data Rail (horizontal scroll — 4 chips)
    text('DORA METRICS', 20, topY + 72, { fontSize: 9, fontWeight: '700', color: P.textDim }),
    DoraChip(20,   topY + 86, 'Deploy Freq', '4.2', '/day',   '+12%', true),
    DoraChip(136,  topY + 86, 'Lead Time',   '1.8', 'hrs',    '-8%',  true),
    DoraChip(252,  topY + 86, 'Change Fail', '2.1', '%',      '-0.4', true),
    DoraChip(368 - 108 + 110, topY + 86, 'MTTR', '14', 'min', '-22%', true),

    // Status Ring
    StatusRing(W/2, topY + 248, 87, P.green),

    // Quick stat row beneath ring
    group([
      text('HEALTHY', W/2, topY + 314, { fontSize: 9, fontWeight: '700', color: P.green, align: 'center' }),
    ]),

    // Open PRs / Active Incidents row
    rect(20, topY + 338, (W - 50)/2, 76, P.surface, { rx: 12 }),
    text('Open PRs', 32, topY + 354, { fontSize: 10, color: P.textMid }),
    text('23', 32, topY + 374, { fontSize: 24, fontWeight: '800', color: P.text }),
    text('↑ 3 today', 32, topY + 398, { fontSize: 9, color: P.amber }),

    rect(W/2 + 5, topY + 338, (W - 50)/2, 76, P.surface, { rx: 12 }),
    text('Incidents', W/2 + 17, topY + 354, { fontSize: 10, color: P.textMid }),
    text('1', W/2 + 17, topY + 374, { fontSize: 24, fontWeight: '800', color: P.red }),
    text('P2 active', W/2 + 17, topY + 398, { fontSize: 9, color: P.red }),

    // Deployment activity bars
    text('DEPLOY ACTIVITY  · last 7 days', 20, topY + 432, { fontSize: 9, fontWeight: '700', color: P.textDim }),
    ...['M','T','W','T','F','S','S'].map((day, i) => {
      const heights = [38, 52, 30, 68, 45, 20, 58];
      const bx = 20 + i * 50;
      const bh = heights[i];
      const isToday = i === 0;
      return group([
        rect(bx, topY + 500 - bh, 32, bh, isToday ? P.cyan : P.surface3, { rx: 4 }),
        text(day, bx + 16, topY + 510, { fontSize: 9, color: isToday ? P.cyan : P.textDim, align: 'center' }),
      ]);
    }),

    // AI Insight card
    rect(20, topY + 530, W - 40, 60, P.cyan10, { rx: 12 }),
    rect(20, topY + 530, 3, 60, P.cyan, { rx: 2 }),
    text('◈  AI Insight', 34, topY + 546, { fontSize: 10, fontWeight: '700', color: P.cyan }),
    text('Deploy cadence up 12% vs last week.', 34, topY + 562, { fontSize: 10, color: P.text }),
    text('PR review time is your bottleneck now.', 34, topY + 575, { fontSize: 10, color: P.textMid }),

    NavBar(0),
  ]);
};

// ── SCREEN 2 — Pull Requests ──────────────────────────────────────────────────
const screenPRs = () => {
  const topY = 54;
  return frame('prs', 'Pull Requests', [
    text('9:41', 20, 16, { fontSize: 12, fontWeight: '600', color: P.text }),
    text('◎ kōdo', W/2, 16, { fontSize: 12, fontWeight: '700', color: P.cyan, align: 'center' }),

    text('Pull', 20, topY + 10, { fontSize: 26, fontWeight: '800', color: P.text }),
    text('Requests', 20, topY + 38, { fontSize: 26, fontWeight: '800', color: P.indigo }),

    // Filter pills
    Pill(20,  topY + 72, 'All · 23', P.cyan, { w: 58 }),
    Pill(86,  topY + 72, 'Review', P.amber, { w: 54 }),
    Pill(148, topY + 72, 'Draft', P.textMid, { w: 46 }),
    Pill(202, topY + 72, 'Merged', P.green, { w: 54 }),

    // Review wait callout
    rect(20, topY + 104, W - 40, 44, P.amber10, { rx: 10 }),
    text('⚠', 32, topY + 125, { fontSize: 14 }),
    text('Avg review wait: 6.2 hrs — longest this sprint', 50, topY + 119, { fontSize: 10, color: P.amber }),
    text('3 PRs waiting >8hrs for first review', 50, topY + 133, { fontSize: 9, color: P.textMid }),

    // PR list
    PRRow(20, topY + 160, 'feat: streaming context window', '@luna', 'review', '2h',    P.amber, 'REVIEW'),
    PRRow(20, topY + 232, 'fix: auth token refresh loop',   '@milo', 'review', '8h',    P.red,   'STALE'),
    PRRow(20, topY + 304, 'refactor: query caching layer',  '@dev4', 'draft',  '1h',    P.textDim,'DRAFT'),
    PRRow(20, topY + 376, 'chore: bump deps to v3.2',       '@dev2', 'merged', '3h',    P.green, 'MERGED'),
    PRRow(20, topY + 448, 'test: e2e coverage for billing', '@sol',  'review', '5h',    P.amber, 'REVIEW'),

    // Review leaderboard hint
    text('TOP REVIEWERS THIS WEEK', 20, topY + 526, { fontSize: 9, fontWeight: '700', color: P.textDim }),
    ...['@luna · 8 reviews', '@milo · 6 reviews', '@sol · 5 reviews'].map((s, i) =>
      group([
        rect(20, topY + 542 + i * 34, W - 40, 28, P.surface, { rx: 8 }),
        Bar(24, topY + 553 + i * 34, W - 80, 6, [66, 50, 42][i], P.indigo, P.surface3),
        text(s, 24, topY + 545 + i * 34, { fontSize: 10, color: P.textMid }),
      ])
    ),

    NavBar(1),
  ]);
};

// ── SCREEN 3 — Incidents ──────────────────────────────────────────────────────
const screenIncidents = () => {
  const topY = 54;
  return frame('incidents', 'Incidents', [
    text('9:41', 20, 16, { fontSize: 12, fontWeight: '600', color: P.text }),
    text('◎ kōdo', W/2, 16, { fontSize: 12, fontWeight: '700', color: P.cyan, align: 'center' }),

    text('Incident', 20, topY + 10, { fontSize: 26, fontWeight: '800', color: P.text }),
    text('Command', 20, topY + 38, { fontSize: 26, fontWeight: '800', color: P.red }),

    // On-call badge
    rect(20, topY + 76, W - 40, 44, P.red10, { rx: 10 }),
    StatusDot(36, topY + 97, P.red, 8),
    text('On-call: @luna', 52, topY + 90, { fontSize: 11, fontWeight: '700', color: P.text }),
    text('Shift ends 06:00 UTC · +2 on standby', 52, topY + 106, { fontSize: 10, color: P.textMid }),

    // MTTR trend
    text('MTTR TREND  · 30 days', 20, topY + 134, { fontSize: 9, fontWeight: '700', color: P.textDim }),
    ...Array.from({ length: 10 }, (_, i) => {
      const hs = [30, 45, 22, 60, 38, 25, 50, 18, 28, 14];
      const bx = 20 + i * 35;
      return rect(bx, topY + 180 - hs[i], 24, hs[i], i === 9 ? P.green : P.surface3, { rx: 4 });
    }),
    text('↓ 22% — improving', W - 20, topY + 184, { fontSize: 9, color: P.green, align: 'right' }),

    // Incident list
    text('ACTIVE & RECENT', 20, topY + 202, { fontSize: 9, fontWeight: '700', color: P.textDim }),
    IncRow(20, topY + 218, 'P2', 'Checkout latency >2s', 'payments-api', '34m',   P.red),
    IncRow(20, topY + 296, 'P3', 'CDN cache miss rate high', 'cdn-edge',  '2h',    P.amber),
    IncRow(20, topY + 374, 'P3', 'Background job queue lag', 'workers',   '4h',    P.amber),
    IncRow(20, topY + 452, 'P4', 'Unused DB connections',   'postgres',  '1d',    P.textDim),

    // AI root cause card
    rect(20, topY + 534, W - 40, 62, P.indigo10, { rx: 12 }),
    rect(20, topY + 534, 3, 62, P.indigo, { rx: 2 }),
    text('◈  AI Root Cause — P2', 34, topY + 550, { fontSize: 10, fontWeight: '700', color: P.indigo }),
    text('Recent deploy v2.8.1 changed batch size.', 34, topY + 566, { fontSize: 10, color: P.text }),
    text('Rollback or patch query pool limit.', 34, topY + 580, { fontSize: 10, color: P.textMid }),

    NavBar(2),
  ]);
};

// ── SCREEN 4 — Team ───────────────────────────────────────────────────────────
const screenTeam = () => {
  const topY = 54;
  const devs = [
    { name: '@luna',  role: 'Lead',    prs: 12, reviews: 8,  deploys: 5, streak: 14, active: true },
    { name: '@milo',  role: 'Senior',  prs: 9,  reviews: 6,  deploys: 3, streak: 8,  active: true },
    { name: '@sol',   role: 'Mid',     prs: 7,  reviews: 5,  deploys: 2, streak: 5,  active: false },
    { name: '@dev4',  role: 'Junior',  prs: 4,  reviews: 2,  deploys: 1, streak: 3,  active: false },
  ];

  return frame('team', 'Team', [
    text('9:41', 20, 16, { fontSize: 12, fontWeight: '600', color: P.text }),
    text('◎ kōdo', W/2, 16, { fontSize: 12, fontWeight: '700', color: P.cyan, align: 'center' }),

    text('Team', 20, topY + 10, { fontSize: 26, fontWeight: '800', color: P.text }),
    text('Throughput', 20, topY + 38, { fontSize: 26, fontWeight: '800', color: P.violet }),

    // Sprint summary
    rect(20, topY + 76, W - 40, 50, P.surface, { rx: 12 }),
    text('Sprint 12 · Days 6/10', 32, topY + 92, { fontSize: 10, color: P.textMid }),
    Bar(32, topY + 108, W - 80, 8, 60, P.violet, P.surface3),
    text('60% complete', W - 30, topY + 114, { fontSize: 9, color: P.violet, align: 'right' }),

    // Dev cards
    text('CONTRIBUTORS', 20, topY + 142, { fontSize: 9, fontWeight: '700', color: P.textDim }),
    ...devs.map((d, i) => {
      const cy = topY + 158 + i * 96;
      return group([
        rect(20, cy, W - 40, 84, P.surface, { rx: 12 }),
        // Avatar placeholder
        rect(28, cy + 12, 44, 44, P.surface3, { rx: 22 }),
        text(d.name[1].toUpperCase(), 50, cy + 30, { fontSize: 16, fontWeight: '700', color: P.cyan, align: 'center' }),
        // Name & role
        text(d.name, 84, cy + 18, { fontSize: 13, fontWeight: '700', color: P.text }),
        text(d.role, 84, cy + 34, { fontSize: 10, color: P.textMid }),
        // Active dot
        ...(d.active ? [StatusDot(84, cy + 52, P.green, 6), text('Active now', 92, cy + 52, { fontSize: 9, color: P.green })] : []),
        // Mini stats
        text(`PRs: ${d.prs}`, W - 130, cy + 18, { fontSize: 10, color: P.textMid }),
        text(`Rev: ${d.reviews}`, W - 72, cy + 18, { fontSize: 10, color: P.textMid }),
        text(`🔥 ${d.streak}d`, W - 50, cy + 50, { fontSize: 10, color: P.amber, align: 'right' }),
      ]);
    }),

    NavBar(3),
  ]);
};

// ── SCREEN 5 — Alerts ─────────────────────────────────────────────────────────
const screenAlerts = () => {
  const topY = 54;

  const alerts = [
    { icon: '◎', label: 'AI',     msg: 'Deploy v2.8.2 flagged: error rate +3.1%',        time: '2m',   color: P.red    },
    { icon: '⇄', label: 'PR',     msg: '#412 has been in review for 9h — needs attention', time: '9m',  color: P.amber  },
    { icon: '⌁', label: 'Deploy', msg: 'Canary v2.8.2 now at 25% rollout — stable',       time: '18m',  color: P.green  },
    { icon: '◬', label: 'Alert',  msg: 'CPU spike 94% on worker-node-3 (5m avg)',           time: '32m',  color: P.amber  },
    { icon: '◎', label: 'AI',     msg: 'Sprint velocity 8% below forecast — 3 PRs blocked', time: '1h', color: P.indigo },
    { icon: '⌁', label: 'Deploy', msg: 'v2.8.1 tagged as stable after 48h clean run',       time: '3h',  color: P.green  },
  ];

  return frame('alerts', 'Alerts', [
    text('9:41', 20, 16, { fontSize: 12, fontWeight: '600', color: P.text }),
    text('◎ kōdo', W/2, 16, { fontSize: 12, fontWeight: '700', color: P.cyan, align: 'center' }),

    text('Smart', 20, topY + 10, { fontSize: 26, fontWeight: '800', color: P.text }),
    text('Alerts', 20, topY + 38, { fontSize: 26, fontWeight: '800', color: P.cyan }),

    // Noise reduction badge
    rect(20, topY + 76, W - 40, 40, P.cyan10, { rx: 10 }),
    text('◈  AI Noise Reduction active — 94% filtered', 34, topY + 91, { fontSize: 10, fontWeight: '600', color: P.cyan }),
    text('Only actionable alerts surfaced', 34, topY + 105, { fontSize: 9, color: P.textMid }),

    // Alert list
    ...alerts.map((a, i) => {
      const ay = topY + 128 + i * 80;
      return group([
        rect(20, ay, W - 40, 68, P.surface, { rx: 10 }),
        rect(20, ay, 3, 68, a.color, { rx: 2 }),
        text(a.icon, 38, ay + 22, { fontSize: 16, color: a.color }),
        Pill(58, ay + 12, a.label, a.color, { w: 44 }),
        text(a.time, W - 30, ay + 14, { fontSize: 9, color: P.textDim, align: 'right' }),
        text(a.msg, 26, ay + 40, { fontSize: 10, color: P.text, maxWidth: W - 60 }),
      ]);
    }),

    NavBar(4),
  ]);
};

// ── Assemble .pen ─────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  meta: {
    title: 'Kōdo — Engineering Intelligence',
    description: 'Dark-mode engineering intelligence platform. DORA metrics, PR velocity, incident command, team throughput. Inspired by Neon.com / darkmodedesign.com dev-OS trend.',
    author: 'RAM Design Heartbeat',
    theme: {
      mode: 'dark',
      primary: '#22D3EE',
      background: '#070B14',
      surface: '#0F1623',
      text: '#E2E8F0',
    },
    tags: ['dark', 'saas', 'developer-tools', 'dora', 'analytics', 'ai'],
    created: new Date().toISOString(),
  },
  screens: [
    screenDashboard(),
    screenPRs(),
    screenIncidents(),
    screenTeam(),
    screenAlerts(),
  ],
};

const out = '/workspace/group/design-studio/kodo.pen';
fs.writeFileSync(out, JSON.stringify(pen, null, 2));
console.log(`✓ kodo.pen written (${(fs.statSync(out).size / 1024).toFixed(1)} KB)`);
console.log(`  ${pen.screens.length} screens`);
