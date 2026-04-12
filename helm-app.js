// HELM — AI Agent Orchestration Dashboard
// Inspired by: Linear's "teams and agents" March 2026 UI refresh (linear.app)
// + Mixpanel's mint/teal AI-first analytics palette (godly.website)
// + Dark Mode Design showcase: Midday, Superset, Forge
// THEME: Dark — near-black navy, mint accent, editorial type

'use strict';
const fs = require('fs');

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const BG      = '#0C0D10'; // near-black blue tint
const SURF    = '#141720'; // dark navy card
const SURF2   = '#1C2133'; // lighter surface / hover
const SURF3   = '#232840'; // active surface
const TEXT    = '#E8E6F0'; // cool off-white
const MUTED   = 'rgba(232,230,240,0.45)';
const BORDER  = 'rgba(255,255,255,0.07)';
const ACCENT  = '#7EE2D4'; // mint teal — from Mixpanel
const ACCENT2 = '#A78CF4'; // soft violet — secondary
const ORANGE  = '#F5864E'; // warm alert orange
const GREEN   = '#5DD88A'; // success green
const RED     = '#F06060'; // error/stop
const GOLD    = '#F0C060'; // warning/priority
const SANS    = 'Inter';

const W   = 390;
const GAP = 40;
const H   = 844;

let _id = 1;
const id = () => `hm${_id++}`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function rect({ x, y, w, h, fill = 'transparent', r = 0, children = [], opacity = 1 }) {
  return {
    id: id(), type: 'rect', x, y, width: w, height: h, fill,
    ...(r ? { radius: r } : {}),
    ...(opacity !== 1 ? { opacity } : {}),
    ...(children.length ? { children } : {}),
  };
}
function frame({ x, y, w, h, fill = 'transparent', children = [] }) {
  return { id: id(), type: 'frame', x, y, width: w, height: h, fill, clip: true, children };
}
function txt(str, { x, y, size = 13, weight = 400, fill = TEXT, font = SANS,
                    align = 'left', width = 340, lh = 1.4, opacity = 1 }) {
  return {
    id: id(), type: 'text', x, y, width,
    text: str, fontSize: size, fontWeight: weight, fontFamily: font,
    fill, textAlign: align,
    ...(lh !== 1.4 ? { lineHeight: lh } : {}),
    ...(opacity !== 1 ? { opacity } : {}),
  };
}
function line({ x1, y1, x2, y2, stroke = BORDER, width = 1 }) {
  return { id: id(), type: 'line', x1, y1, x2, y2, stroke, strokeWidth: width };
}
function circle({ x, y, r, fill, opacity = 1 }) {
  return { id: id(), type: 'ellipse', x, y, width: r * 2, height: r * 2, fill, ...(opacity !== 1 ? { opacity } : {}) };
}
function pill({ x, y, w, h, fill, children = [] }) {
  return { id: id(), type: 'rect', x, y, width: w, height: h, fill, radius: h / 2, ...(children.length ? { children } : {}) };
}
function bar(x, y, w, h, pct, fill = ACCENT, bg = SURF2) {
  return { id: id(), type: 'group', children: [
    rect({ x, y, w, h, fill: bg, r: h / 2 }),
    rect({ x, y, w: Math.max(h, Math.round(w * pct)), h, fill, r: h / 2 }),
  ]};
}
function chevron(x, y, color = MUTED, size = 7) {
  return { id: id(), type: 'group', children: [
    line({ x1: x, y1: y, x2: x + size * 0.6, y2: y + size * 0.5, stroke: color, width: 1.5 }),
    line({ x1: x + size * 0.6, y1: y + size * 0.5, x2: x, y2: y + size, stroke: color, width: 1.5 }),
  ]};
}
function dot(x, y, color = GREEN, r = 4) {
  return circle({ x: x - r, y: y - r, r, fill: color });
}
function tag(x, y, label, fill, textFill) {
  const w = label.length * 6.2 + 14;
  return { id: id(), type: 'group', children: [
    pill({ x, y, w, h: 20, fill }),
    txt(label, { x, y: y + 4, size: 9, weight: 700, fill: textFill, width: w, align: 'center' }),
  ]};
}
function divider(bx, y) {
  return line({ x1: bx + 20, y1: y, x2: bx + W - 20, y2: y, stroke: BORDER });
}
function pulse(x, y, color = GREEN, r = 5) {
  return { id: id(), type: 'group', children: [
    circle({ x: x - r * 2, y: y - r * 2, r: r * 2, fill: color, opacity: 0.15 }),
    circle({ x: x - r, y: y - r, r, fill: color }),
  ]};
}

// ─── LAYOUT ───────────────────────────────────────────────────────────────────
const sx = (i) => i * (W + GAP);

function screenBg(i) {
  return rect({ x: sx(i), y: 0, w: W, h: H, fill: BG });
}
function statusBar(i) {
  const bx = sx(i);
  return { id: id(), type: 'group', children: [
    txt('9:41', { x: bx + 18, y: 16, size: 12, weight: 600, fill: TEXT }),
    txt('●●●  ▲  ▬', { x: bx + W - 90, y: 16, size: 9, fill: MUTED, width: 90, align: 'right' }),
  ]};
}
function bottomNav(i, active) {
  const items = [
    { label: 'Overview', icon: '⌘' },
    { label: 'Agents',   icon: '◈' },
    { label: 'Queue',    icon: '≡' },
    { label: 'Feed',     icon: '◎' },
    { label: 'Settings', icon: '○' },
  ];
  const bx = sx(i);
  const children = [
    rect({ x: bx, y: H - 66, w: W, h: 66, fill: SURF }),
    line({ x1: bx, y1: H - 66, x2: bx + W, y2: H - 66, stroke: BORDER }),
  ];
  items.forEach((item, idx) => {
    const ix = bx + 16 + idx * ((W - 32) / 5) + (W - 32) / 10;
    const isActive = idx === active;
    children.push(
      txt(item.icon, { x: ix - 10, y: H - 54, size: 14, fill: isActive ? ACCENT : MUTED,
        align: 'center', width: 22 }),
      txt(item.label, { x: ix - 24, y: H - 36, size: 9, weight: isActive ? 600 : 400,
        fill: isActive ? ACCENT : MUTED, align: 'center', width: 48 }),
    );
    if (isActive) {
      children.push(rect({ x: ix - 14, y: H - 61, w: 28, h: 3, fill: ACCENT, r: 1.5 }));
    }
  });
  return { id: id(), type: 'group', children };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 1: DASHBOARD / OVERVIEW
// ═══════════════════════════════════════════════════════════════════════════════
function buildOverview() {
  const i = 0;
  const bx = sx(i);
  const nodes = [
    screenBg(i),
    statusBar(i),

    // Header
    txt('Good morning,', { x: bx + 20, y: 52, size: 12, fill: MUTED }),
    txt('Alex', { x: bx + 20, y: 70, size: 26, weight: 700, fill: TEXT }),
    // Avatar
    rect({ x: bx + W - 54, y: 54, w: 38, h: 38, fill: SURF2, r: 19 }),
    txt('A', { x: bx + W - 54, y: 63, size: 16, weight: 700, fill: ACCENT, width: 38, align: 'center' }),
    dot(bx + W - 18, 58, GREEN),

    // ── LIVE AGENTS STRIP ─────────────────────────────────────────────────────
    txt('Agents · live', { x: bx + 20, y: 110, size: 11, weight: 600, fill: MUTED }),
    txt('3 active', { x: bx + W - 20, y: 110, size: 11, fill: GREEN, width: 60, align: 'right' }),

    // 3 agent cards
    ...[
      { name: 'Apex',    model: 'GPT-4o',    task: 'Writing tests for auth module',    status: 'working',   pct: 0.62, color: ACCENT  },
      { name: 'Bolt',    model: 'Claude 3.7', task: 'Reviewing PR #284 — pagination',  status: 'reviewing', pct: 0.40, color: ACCENT2 },
      { name: 'Forge',   model: 'GPT-4o',    task: 'Idle — awaiting next task',        status: 'idle',      pct: 0.00, color: MUTED  },
    ].flatMap(({ name, model, task, status, pct, color }, ci) => {
      const cx = bx + 20 + ci * 122;
      const statusColors = { working: GREEN, reviewing: GOLD, idle: MUTED };
      const sc = statusColors[status];
      const items = [
        rect({ x: cx, y: 130, w: 112, h: 112, fill: SURF, r: 16 }),
        // Agent avatar circle
        circle({ x: cx + 56 - 20, y: 130 + 16, r: 20, fill: color + '22' }),
        txt(name[0], { x: cx + 36, y: 134, size: 18, weight: 700, fill: color, width: 40, align: 'center' }),
        txt(name, { x: cx + 8, y: 180, size: 12, weight: 600, fill: TEXT, width: 96, align: 'center' }),
        txt(model, { x: cx + 8, y: 196, size: 9, fill: MUTED, width: 96, align: 'center' }),
        // Status indicator
        pulse(cx + 20, 223, sc),
        txt(status, { x: cx + 28, y: 218, size: 9, fill: sc, width: 60 }),
      ];
      if (pct > 0) {
        items.push(bar(cx + 10, 234, 92, 3, pct, color, SURF2));
      }
      return items;
    }),

    // ── METRICS ROW ───────────────────────────────────────────────────────────
    txt('Today', { x: bx + 20, y: 262, size: 11, weight: 600, fill: MUTED }),
    ...[
      { label: 'Tasks done', value: '14', sub: '↑2 vs yesterday', color: GREEN  },
      { label: 'PRs opened', value: '5',  sub: '3 merged',        color: ACCENT },
      { label: 'Tests pass', value: '97%',sub: '831 / 857',       color: ACCENT2 },
    ].flatMap(({ label, value, sub, color }, mi) => {
      const mx = bx + 20 + mi * 118;
      return [
        rect({ x: mx, y: 280, w: 108, h: 76, fill: SURF, r: 14 }),
        txt(value, { x: mx + 10, y: 294, size: 22, weight: 700, fill: color, width: 88 }),
        txt(label, { x: mx + 10, y: 320, size: 10, fill: TEXT, width: 88 }),
        txt(sub, { x: mx + 10, y: 336, size: 9, fill: MUTED, width: 88 }),
      ];
    }),

    // ── LIVE ACTIVITY ─────────────────────────────────────────────────────────
    txt('Live activity', { x: bx + 20, y: 374, size: 11, weight: 600, fill: MUTED }),

    // Apex currently running card (prominent)
    rect({ x: bx + 20, y: 392, w: W - 40, h: 82, fill: SURF, r: 16 }),
    rect({ x: bx + 20, y: 392, w: 3, h: 82, fill: ACCENT, r: 1.5 }),
    pulse(bx + 40, 410, GREEN),
    txt('Apex · working', { x: bx + 52, y: 405, size: 11, weight: 600, fill: TEXT }),
    txt('4 min ago', { x: bx + W - 24, y: 405, size: 9, fill: MUTED, width: 80, align: 'right' }),
    txt('Writing unit tests for auth/middleware.ts', { x: bx + 34, y: 423, size: 11, fill: MUTED, width: 280 }),
    bar(bx + 34, 446, W - 74, 4, 0.62, ACCENT, SURF2),
    txt('62%', { x: bx + W - 56, y: 442, size: 9, fill: ACCENT, width: 40, align: 'right' }),
    txt('Step 4 of 7 — generating edge cases', { x: bx + 34, y: 456, size: 9, fill: MUTED, width: 240 }),

    // Bolt review request
    rect({ x: bx + 20, y: 482, w: W - 40, h: 68, fill: SURF, r: 16 }),
    rect({ x: bx + 20, y: 482, w: 3, h: 68, fill: GOLD, r: 1.5 }),
    txt('◈', { x: bx + 34, y: 493, size: 14, fill: GOLD }),
    txt('Bolt · review needed', { x: bx + 52, y: 493, size: 11, weight: 600, fill: TEXT }),
    txt('12 min ago', { x: bx + W - 24, y: 493, size: 9, fill: MUTED, width: 80, align: 'right' }),
    txt('PR #284 ready for your review — 3 files changed', { x: bx + 34, y: 511, size: 11, fill: MUTED, width: 280 }),
    // CTA row
    pill({ x: bx + 34, y: 534, w: 74, h: 24, fill: GOLD + '22' }),
    txt('Review PR', { x: bx + 34, y: 538, size: 9, weight: 700, fill: GOLD, width: 74, align: 'center' }),
    pill({ x: bx + 118, y: 534, w: 66, h: 24, fill: SURF2 }),
    txt('Approve', { x: bx + 118, y: 538, size: 9, weight: 600, fill: MUTED, width: 66, align: 'center' }),

    divider(bx, 562),

    // ── RECENT COMPLETIONS ────────────────────────────────────────────────────
    txt('Completed today', { x: bx + 20, y: 574, size: 11, weight: 600, fill: MUTED }),
    txt('See all', { x: bx + W - 20, y: 574, size: 11, fill: ACCENT, width: 50, align: 'right' }),

    ...[
      { agent: 'Apex', task: 'Added E2E tests for checkout flow',   time: '1hr ago',  color: ACCENT  },
      { agent: 'Bolt', task: 'Refactored UserContext — DX cleanup', time: '2hr ago',  color: ACCENT2 },
      { agent: 'Apex', task: 'Fixed CORS headers on /api/auth',     time: '3hr ago',  color: ACCENT  },
    ].flatMap(({ agent, task, time, color }, ri) => {
      const ry = 594 + ri * 52;
      return [
        rect({ x: bx + 20, y: ry, w: W - 40, h: 44, fill: SURF, r: 12 }),
        circle({ x: bx + 34, y: ry + 13, r: 9, fill: color + '22' }),
        txt('✓', { x: bx + 26, y: ry + 9, size: 11, fill: color, width: 18, align: 'center' }),
        txt(task, { x: bx + 52, y: ry + 8, size: 11, weight: 500, fill: TEXT, width: 240 }),
        txt(agent + ' · ' + time, { x: bx + 52, y: ry + 26, size: 9, fill: MUTED, width: 200 }),
      ];
    }),

    bottomNav(i, 0),
  ];
  return frame({ x: bx, y: 0, w: W, h: H, fill: BG, children: nodes });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 2: AGENT DETAIL — APEX
// ═══════════════════════════════════════════════════════════════════════════════
function buildAgentDetail() {
  const i = 1;
  const bx = sx(i);

  const steps = [
    { label: 'Parsed auth/middleware.ts',       status: 'done'    },
    { label: 'Identified 7 testable paths',     status: 'done'    },
    { label: 'Generated happy-path tests (3)',   status: 'done'    },
    { label: 'Generating edge-case tests',       status: 'active'  },
    { label: 'Add mocks for JWT & Redis',        status: 'pending' },
    { label: 'Run test suite & fix failures',    status: 'pending' },
    { label: 'Open PR with coverage report',     status: 'pending' },
  ];

  const nodes = [
    screenBg(i),
    statusBar(i),

    // Back nav
    txt('← Back', { x: bx + 20, y: 52, size: 12, fill: MUTED }),
    txt('Agent Detail', { x: bx + 20, y: 52, size: 14, weight: 600, fill: TEXT, width: W - 40, align: 'center' }),

    // Agent hero card
    rect({ x: bx + 20, y: 76, w: W - 40, h: 100, fill: SURF, r: 20 }),
    // Glow blob
    circle({ x: bx + W - 60, y: 76, r: 60, fill: ACCENT + '12' }),
    // Big avatar
    circle({ x: bx + 42, y: 94, r: 26, fill: ACCENT + '22' }),
    txt('A', { x: bx + 16, y: 100, size: 22, weight: 800, fill: ACCENT, width: 52, align: 'center' }),
    txt('Apex', { x: bx + 88, y: 88, size: 20, weight: 700, fill: TEXT }),
    txt('GPT-4o · Agent v2', { x: bx + 88, y: 110, size: 11, fill: MUTED }),
    // Status badge
    pill({ x: bx + 88, y: 132, w: 72, h: 22, fill: GREEN + '22' }),
    pulse(bx + 98, 145, GREEN, 4),
    txt('working', { x: bx + 108, y: 139, size: 9, weight: 700, fill: GREEN }),
    // Stats
    txt('Tasks: 47 done', { x: bx + W - 34, y: 90, size: 10, fill: MUTED, width: 120, align: 'right' }),
    txt('Uptime: 6h 22m', { x: bx + W - 34, y: 108, size: 10, fill: MUTED, width: 120, align: 'right' }),

    // Current task header
    txt('Current task', { x: bx + 20, y: 196, size: 11, weight: 600, fill: MUTED }),

    rect({ x: bx + 20, y: 214, w: W - 40, h: 68, fill: SURF, r: 16 }),
    rect({ x: bx + 20, y: 214, w: 3, h: 68, fill: ACCENT, r: 1.5 }),
    txt('Write unit tests for auth/middleware.ts', { x: bx + 34, y: 224, size: 13, weight: 600, fill: TEXT, width: W - 68, lh: 1.3 }),
    txt('Started 4 min ago · ETA ~12 min', { x: bx + 34, y: 253, size: 10, fill: MUTED }),
    bar(bx + 34, 268, W - 68, 4, 0.62, ACCENT, SURF2),
    txt('62%', { x: bx + W - 56, y: 264, size: 9, fill: ACCENT, width: 40, align: 'right' }),

    // Progress steps
    txt('Steps', { x: bx + 20, y: 298, size: 11, weight: 600, fill: MUTED }),

    ...steps.flatMap(({ label, status }, si) => {
      const sy = 318 + si * 42;
      const doneColor = GREEN;
      const activeColor = ACCENT;
      const pendColor = SURF2;
      const isDone = status === 'done';
      const isActive = status === 'active';
      return [
        // connector line
        ...(si < steps.length - 1 ? [
          line({ x1: bx + 36, y1: sy + 18, x2: bx + 36, y2: sy + 42, stroke: isDone ? GREEN + '40' : SURF2, width: 1.5 }),
        ] : []),
        // step circle
        circle({ x: bx + 24, y: sy + 6, r: 12, fill: isDone ? doneColor + '22' : isActive ? activeColor + '22' : pendColor }),
        txt(isDone ? '✓' : isActive ? '●' : '○', {
          x: bx + 12, y: sy + 1, size: 10, weight: 700,
          fill: isDone ? doneColor : isActive ? activeColor : MUTED,
          width: 24, align: 'center'
        }),
        txt(label, {
          x: bx + 54, y: sy + 5, size: 11,
          weight: isDone ? 400 : isActive ? 600 : 400,
          fill: isDone ? MUTED : isActive ? TEXT : MUTED,
          width: W - 80,
        }),
        ...(isActive ? [
          pill({ x: bx + W - 80, y: sy + 2, w: 54, h: 18, fill: ACCENT + '22' }),
          txt('in progress', { x: bx + W - 80, y: sy + 5, size: 8, weight: 600, fill: ACCENT, width: 54, align: 'center' }),
        ] : []),
      ];
    }),

    // Output preview
    txt('Output preview', { x: bx + 20, y: 620, size: 11, weight: 600, fill: MUTED }),
    rect({ x: bx + 20, y: 638, w: W - 40, h: 78, fill: '#0A0E16', r: 12 }),
    rect({ x: bx + 20, y: 638, w: W - 40, h: 20, fill: SURF2, r: 12 }),
    txt('auth.test.ts  ●  3 of 7 tests', { x: bx + 32, y: 644, size: 9, fill: MUTED, width: 200 }),
    txt("describe('authMiddleware', () => {\n  it('rejects missing JWT', async", {
      x: bx + 28, y: 664, size: 9, fill: ACCENT, width: W - 60, lh: 1.5, font: 'Courier New' }),

    // Actions
    pill({ x: bx + 20, y: 728, w: (W - 50) / 2, h: 38, fill: RED + '22' }),
    txt('⏹  Pause agent', { x: bx + 20, y: 737, size: 12, weight: 600, fill: RED, width: (W - 50) / 2, align: 'center' }),
    pill({ x: bx + 20 + (W - 50) / 2 + 10, y: 728, w: (W - 50) / 2, h: 38, fill: ACCENT + '22' }),
    txt('✎  Redirect task', { x: bx + 20 + (W - 50) / 2 + 10, y: 737, size: 12, weight: 600, fill: ACCENT, width: (W - 50) / 2, align: 'center' }),

    bottomNav(i, 1),
  ];
  return frame({ x: bx, y: 0, w: W, h: H, fill: BG, children: nodes });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 3: TASK QUEUE
// ═══════════════════════════════════════════════════════════════════════════════
function buildQueue() {
  const i = 2;
  const bx = sx(i);

  const tasks = [
    {
      priority: 'HIGH',   pColor: RED,    pBg: RED + '22',
      title: 'Fix rate-limit bug on /api/v2/send',
      sub: 'Customer-reported · P1',
      agent: 'Unassigned', time: '~20 min',
    },
    {
      priority: 'HIGH',   pColor: RED,    pBg: RED + '22',
      title: 'Add caching layer to /users endpoint',
      sub: 'Performance · Redis',
      agent: 'Apex', time: '~35 min',
    },
    {
      priority: 'MED',    pColor: GOLD,   pBg: GOLD + '22',
      title: 'Migrate legacy auth to Clerk v4',
      sub: 'Infra · requires review',
      agent: 'Bolt', time: '~1.5h',
    },
    {
      priority: 'MED',    pColor: GOLD,   pBg: GOLD + '22',
      title: 'Write changelog for v2.4.0 release',
      sub: 'Docs · low complexity',
      agent: 'Unassigned', time: '~15 min',
    },
    {
      priority: 'LOW',    pColor: MUTED,  pBg: SURF2,
      title: 'Improve error messages in onboarding',
      sub: 'UX copy · non-blocking',
      agent: 'Unassigned', time: '~25 min',
    },
    {
      priority: 'LOW',    pColor: MUTED,  pBg: SURF2,
      title: 'Add OpenGraph tags to marketing pages',
      sub: 'SEO · low effort',
      agent: 'Unassigned', time: '~10 min',
    },
  ];

  const nodes = [
    screenBg(i),
    statusBar(i),

    txt('Queue', { x: bx + 20, y: 54, size: 24, weight: 700, fill: TEXT }),
    txt(`${tasks.length} tasks`, { x: bx + W - 20, y: 62, size: 12, fill: MUTED, width: 70, align: 'right' }),

    // Filter chips
    ...['All', 'High', 'Med', 'Low', 'Mine'].map((label, fi) => {
      const isActive = fi === 0;
      const widths = [30, 34, 30, 28, 36];
      const offsets = [0, 42, 86, 126, 164];
      const fw = widths[fi] + 18;
      const fpx = bx + 20 + offsets[fi];
      return { id: id(), type: 'group', children: [
        pill({ x: fpx, y: 86, w: fw, h: 26, fill: isActive ? ACCENT : SURF }),
        txt(label, { x: fpx, y: 92, size: 11, weight: isActive ? 700 : 400,
          fill: isActive ? BG : MUTED, width: fw, align: 'center' }),
      ]};
    }),

    // Add task FAB
    circle({ x: bx + W - 38, y: 85, r: 18, fill: ACCENT }),
    txt('+', { x: bx + W - 56, y: 77, size: 20, weight: 300, fill: BG, width: 36, align: 'center' }),

    divider(bx, 124),

    // Task list
    ...tasks.flatMap(({ priority, pColor, pBg, title, sub, agent, time }, ti) => {
      const ty = 134 + ti * 104;
      const isUnassigned = agent === 'Unassigned';
      return [
        rect({ x: bx + 20, y: ty, w: W - 40, h: 96, fill: SURF, r: 16 }),
        // Priority badge
        pill({ x: bx + 32, y: ty + 12, w: priority.length * 6.5 + 14, h: 18, fill: pBg }),
        txt(priority, { x: bx + 32, y: ty + 15, size: 8, weight: 700, fill: pColor, width: priority.length * 6.5 + 14, align: 'center' }),
        // Drag handle hint
        txt('⋮⋮', { x: bx + W - 40, y: ty + 12, size: 12, fill: SURF3, width: 16 }),
        // Task title
        txt(title, { x: bx + 32, y: ty + 36, size: 12, weight: 600, fill: TEXT, width: W - 72, lh: 1.3 }),
        txt(sub, { x: bx + 32, y: ty + 57, size: 10, fill: MUTED }),
        // Bottom row
        pill({ x: bx + 32, y: ty + 72, w: 60, h: 18, fill: SURF2 }),
        txt('⏱ ' + time, { x: bx + 32, y: ty + 75, size: 9, fill: MUTED, width: 60, align: 'center' }),
        // Agent chip
        pill({ x: bx + 102, y: ty + 72, w: agent.length * 6 + 14, h: 18, fill: isUnassigned ? SURF2 : ACCENT + '22' }),
        txt(isUnassigned ? '+ Assign' : '◈ ' + agent, {
          x: bx + 102, y: ty + 75, size: 9, weight: 600,
          fill: isUnassigned ? MUTED : ACCENT,
          width: agent.length * 6 + 14, align: 'center',
        }),
      ];
    }),

    bottomNav(i, 2),
  ];
  return frame({ x: bx, y: 0, w: W, h: H, fill: BG, children: nodes });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 4: ACTIVITY FEED
// ═══════════════════════════════════════════════════════════════════════════════
function buildFeed() {
  const i = 3;
  const bx = sx(i);

  const events = [
    {
      time: 'just now', agent: 'Apex', color: ACCENT,
      type: 'review',
      title: '🔍 Review requested',
      body: 'Unit tests for auth/middleware.ts — 7 tests, 94% coverage',
      cta: 'Review',
    },
    {
      time: '12 min', agent: 'Bolt', color: ACCENT2,
      type: 'done',
      title: '✓ PR #284 merged',
      body: 'UserContext refactor — 4 files, +180 / -290 lines',
      cta: null,
    },
    {
      time: '31 min', agent: 'Apex', color: ACCENT,
      type: 'done',
      title: '✓ Fix deployed',
      body: 'CORS headers fixed on /api/auth — verified in staging',
      cta: null,
    },
    {
      time: '1h 2m', agent: 'Bolt', color: ACCENT2,
      type: 'blocker',
      title: '⚠ Blocker raised',
      body: 'Clerk v4 migration requires manual env var update in Vercel',
      cta: 'Resolve',
    },
    {
      time: '1h 44m', agent: 'Apex', color: ACCENT,
      type: 'done',
      title: '✓ E2E tests added',
      body: 'Checkout flow — 12 tests passing, Playwright configured',
      cta: null,
    },
    {
      time: '2h 15m', agent: 'Bolt', color: ACCENT2,
      type: 'done',
      title: '✓ Docs updated',
      body: 'README refreshed — onboarding section, API changes noted',
      cta: null,
    },
  ];

  const typeColors = { review: GOLD, done: GREEN, blocker: RED };

  const nodes = [
    screenBg(i),
    statusBar(i),

    txt('Activity', { x: bx + 20, y: 54, size: 24, weight: 700, fill: TEXT }),
    txt('Today', { x: bx + W - 20, y: 62, size: 12, fill: MUTED, width: 50, align: 'right' }),

    // Filter chips
    ...['All', 'Reviews', 'Blockers', 'Done'].map((label, fi) => {
      const isActive = fi === 0;
      const ww = label.length * 6.5 + 18;
      const offsets = [0, 42, 108, 186];
      const fpx = bx + 20 + offsets[fi];
      return { id: id(), type: 'group', children: [
        pill({ x: fpx, y: 84, w: ww, h: 26, fill: isActive ? ACCENT : SURF }),
        txt(label, { x: fpx, y: 90, size: 11, weight: isActive ? 700 : 400,
          fill: isActive ? BG : MUTED, width: ww, align: 'center' }),
      ]};
    }),

    divider(bx, 122),

    // Feed items
    ...events.flatMap(({ time, agent, color, type, title, body, cta }, ei) => {
      const ey = 132 + ei * 114;
      const tc = typeColors[type];
      const hasCta = !!cta;
      const cardH = hasCta ? 104 : 90;
      return [
        // Timeline spine
        ...(ei < events.length - 1 ? [
          line({ x1: bx + 40, y1: ey + 28, x2: bx + 40, y2: ey + 114, stroke: SURF2, width: 2 }),
        ] : []),
        // Agent avatar dot on timeline
        circle({ x: bx + 28, y: ey + 8, r: 12, fill: color + '22' }),
        txt(agent[0], { x: bx + 16, y: ey + 3, size: 12, weight: 700, fill: color, width: 24, align: 'center' }),
        // Time
        txt(time + ' ago', { x: bx + W - 24, y: ey + 8, size: 9, fill: MUTED, width: 80, align: 'right' }),
        // Card
        rect({ x: bx + 58, y: ey, w: W - 78, h: cardH, fill: SURF, r: 14 }),
        rect({ x: bx + 58, y: ey, w: 3, h: cardH, fill: tc, r: 1.5 }),
        txt(title, { x: bx + 68, y: ey + 10, size: 11, weight: 600, fill: TEXT, width: W - 92 }),
        txt(body, { x: bx + 68, y: ey + 30, size: 10, fill: MUTED, width: W - 96, lh: 1.4 }),
        txt(agent + ' agent', { x: bx + 68, y: ey + 58, size: 9, fill: color }),
        ...(hasCta ? [
          pill({ x: bx + W - 90, y: ey + cardH - 28, w: 54, h: 20, fill: tc + '22' }),
          txt(cta, { x: bx + W - 90, y: ey + cardH - 24, size: 9, weight: 700, fill: tc, width: 54, align: 'center' }),
        ] : []),
      ];
    }),

    bottomNav(i, 3),
  ];
  return frame({ x: bx, y: 0, w: W, h: H, fill: BG, children: nodes });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 5: SETTINGS / AGENT CONFIG
// ═══════════════════════════════════════════════════════════════════════════════
function buildSettings() {
  const i = 4;
  const bx = sx(i);

  const agents = [
    { name: 'Apex',  model: 'GPT-4o',     tasks: 47, enabled: true,  color: ACCENT  },
    { name: 'Bolt',  model: 'Claude 3.7', tasks: 31, enabled: true,  color: ACCENT2 },
    { name: 'Forge', model: 'GPT-4o',     tasks: 0,  enabled: false, color: MUTED   },
  ];
  const integrations = [
    { name: 'GitHub',   status: 'Connected',   icon: '◎', color: GREEN   },
    { name: 'Linear',   status: 'Connected',   icon: '◈', color: GREEN   },
    { name: 'Vercel',   status: 'Connected',   icon: '▲', color: GREEN   },
    { name: 'Slack',    status: 'Disconnected', icon: '◇', color: MUTED  },
  ];

  const nodes = [
    screenBg(i),
    statusBar(i),

    txt('Settings', { x: bx + 20, y: 54, size: 24, weight: 700, fill: TEXT }),

    // Agents section
    txt('Agents', { x: bx + 20, y: 98, size: 11, weight: 600, fill: MUTED }),
    txt('+ Add agent', { x: bx + W - 20, y: 98, size: 11, fill: ACCENT, width: 80, align: 'right' }),

    ...agents.flatMap(({ name, model, tasks, enabled, color }, ai) => {
      const ay = 118 + ai * 72;
      return [
        rect({ x: bx + 20, y: ay, w: W - 40, h: 64, fill: SURF, r: 16 }),
        // Avatar
        circle({ x: bx + 36, y: ay + 14, r: 18, fill: color + '22' }),
        txt(name[0], { x: bx + 18, y: ay + 19, size: 18, weight: 700, fill: color, width: 36, align: 'center' }),
        // Info
        txt(name, { x: bx + 66, y: ay + 13, size: 14, weight: 600, fill: enabled ? TEXT : MUTED }),
        txt(model + ' · ' + tasks + ' tasks done', { x: bx + 66, y: ay + 32, size: 10, fill: MUTED }),
        // Toggle
        rect({ x: bx + W - 62, y: ay + 20, w: 44, h: 24, fill: enabled ? ACCENT : SURF2, r: 12 }),
        circle({ x: enabled ? bx + W - 24 : bx + W - 46, y: ay + 24, r: 8, fill: '#FFF' }),
      ];
    }),

    divider(bx, 338),

    // Memory & model settings
    txt('Model preferences', { x: bx + 20, y: 352, size: 11, weight: 600, fill: MUTED }),

    ...[
      { label: 'Default model',    value: 'GPT-4o', note: 'Most capable' },
      { label: 'Fallback model',   value: 'Claude 3.7 Sonnet', note: '' },
      { label: 'Max task length',  value: '2 hours', note: 'auto-pause after' },
      { label: 'Human review on',  value: 'PRs + Blockers', note: '' },
    ].flatMap(({ label, value, note }, pi) => {
      const py = 372 + pi * 52;
      return [
        rect({ x: bx + 20, y: py, w: W - 40, h: 44, fill: SURF, r: 12 }),
        txt(label, { x: bx + 34, y: py + 10, size: 12, weight: 500, fill: TEXT }),
        txt(value, { x: bx + W - 34, y: py + 10, size: 11, weight: 600, fill: ACCENT, width: 160, align: 'right' }),
        ...(note ? [txt(note, { x: bx + 34, y: py + 28, size: 9, fill: MUTED })] : []),
        chevron(bx + W - 32, py + 14, MUTED, 7),
      ];
    }),

    divider(bx, 584),

    // Integrations
    txt('Integrations', { x: bx + 20, y: 598, size: 11, weight: 600, fill: MUTED }),

    ...integrations.flatMap(({ name, status, icon, color }, ii) => {
      const iy = 618 + ii * 46;
      const connected = status === 'Connected';
      return [
        txt(icon, { x: bx + 24, y: iy + 3, size: 14, fill: color }),
        txt(name, { x: bx + 48, y: iy + 4, size: 12, weight: 500, fill: TEXT }),
        txt(status, { x: bx + W - 24, y: iy + 4, size: 11, fill: color, align: 'right', width: 100 }),
        ...(ii < integrations.length - 1 ? [divider(bx, iy + 38)] : []),
      ];
    }),

    bottomNav(i, 4),
  ];
  return frame({ x: bx, y: 0, w: W, h: H, fill: BG, children: nodes });
}

// ═══════════════════════════════════════════════════════════════════════════════
// ASSEMBLE & WRITE
// ═══════════════════════════════════════════════════════════════════════════════
const totalW = 5 * W + 4 * GAP;
const pen = {
  version: '2.8',
  name: 'HELM — AI Agent Orchestration Dashboard',
  width: totalW,
  height: H,
  fill: '#0A0B0E',
  children: [
    buildOverview(),
    buildAgentDetail(),
    buildQueue(),
    buildFeed(),
    buildSettings(),
  ],
};

fs.writeFileSync('helm.pen', JSON.stringify(pen, null, 2));
console.log('✓ helm.pen written');
console.log('  screens:', pen.children.length);
const sz = JSON.stringify(pen).length;
console.log('  size:', (sz / 1024).toFixed(1) + 'KB');
