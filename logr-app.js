// LOGR — Developer Event Observability Platform
// Inspired by: Evervault:Customers on godly.website (dark encrypted tech aesthetic)
//              Midday on darkmodedesign.com (polished dark financial/analytics dashboard)
//              Equals/GTM analytics on land-book.com (data analytics SaaS)
// Theme: DARK — near-black + electric indigo + mint green
// Challenge: Terminal-first observability app with bento-grid dashboard,
//            syntax-highlighted query builder, real-time event stream,
//            anomaly alerts — pushing towards dense data UIs like Evervault's
//            dark surfaces with monospace-grounded typography.

'use strict';
const fs = require('fs');

const W = 390;
const H = 844;

// ─── Palette ─────────────────────────────────────────────────────────────────
const P = {
  bg:       '#08090E',
  surface:  '#0E1018',
  card:     '#131726',
  border:   '#1E2436',
  border2:  '#252D44',
  accent:   '#4F6EF7',   // electric indigo
  accent2:  '#34D399',   // mint green
  accent3:  '#F59E0B',   // amber
  danger:   '#F43F5E',   // rose
  text:     '#E2E8F0',
  sub:      '#94A3B8',
  muted:    '#4A5568',
  white:    '#FFFFFF',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
let _id = 1;
const uid = () => `n${_id++}`;

const n = (type, props = {}, children = []) => ({
  id: uid(), type, ...props,
  children: children.filter(Boolean),
});

const frame = (props, children) => n('frame', {
  x: 0, y: 0, w: W, h: H, fill: P.bg,
  ...props,
}, children);

const rect = (x, y, w, h, fill, extra = {}) =>
  n('rect', { x, y, w, h, fill, radius: 0, ...extra });

const txt = (x, y, content, size, color, extra = {}) =>
  n('text', { x, y, content, fontSize: size, color, fontWeight: 400, ...extra });

const bold = (x, y, content, size, color, extra = {}) =>
  txt(x, y, content, size, color, { fontWeight: 700, ...extra });

const mono = (x, y, content, size, color, extra = {}) =>
  txt(x, y, content, size, color, { fontFamily: 'JetBrains Mono', ...extra });

// ─── Shared UI ────────────────────────────────────────────────────────────────

const statusBar = () => n('group', { x: 0, y: 0, w: W, h: 44 }, [
  rect(0, 0, W, 44, P.bg),
  txt(20, 14, '9:41', 15, P.text, { fontWeight: 600 }),
  txt(W - 20, 14, '●●●', 15, P.sub, { textAlign: 'right' }),
]);

const bottomNav = (active) => {
  const tabs = [
    { icon: '⬡', label: 'Overview', id: 'overview' },
    { icon: '≋', label: 'Stream',   id: 'stream' },
    { icon: '◈', label: 'Query',    id: 'query' },
    { icon: '⚡', label: 'Alerts',  id: 'alerts' },
    { icon: '⊞', label: 'Sources',  id: 'sources' },
  ];
  const tabW = W / tabs.length;
  const yBase = H - 82;
  const items = [
    rect(0, yBase, W, 82, P.surface),
    rect(0, yBase, W, 1, P.border),
  ];
  tabs.forEach((tab, i) => {
    const cx = i * tabW + tabW / 2;
    const isActive = tab.id === active;
    items.push(
      txt(cx - 10, yBase + 14, tab.icon, 18,
        isActive ? P.accent : P.muted,
        { textAlign: 'center', fontWeight: isActive ? 700 : 400 }),
      txt(i * tabW + 4, yBase + 38, tab.label, 9,
        isActive ? P.accent : P.muted,
        { textAlign: 'center', w: tabW - 8 }),
    );
    if (isActive) {
      items.push(rect(cx - 18, yBase + 2, 36, 3, P.accent, { radius: 2 }));
    }
  });
  return n('group', { x: 0, y: 0, w: W, h: H }, items);
};

const card = (x, y, w, h, children = [], extra = {}) =>
  n('group', { x, y, w, h }, [
    rect(0, 0, w, h, P.card, { radius: 12, ...extra }),
    rect(0, 0, w, h, 'transparent', { radius: 12, stroke: P.border, strokeWidth: 1 }),
    ...children,
  ]);

const pill = (x, y, label, color, padX = 8) =>
  n('group', { x, y }, [
    rect(0, 0, label.length * 6.5 + padX * 2, 20, color + '22', { radius: 10 }),
    txt(padX, 4, label, 9, color, { fontWeight: 700 }),
  ]);

const dot = (x, y, color) => rect(x, y, 6, 6, color, { radius: 3 });

// Sparkline as stacked micro bars
const spark = (x, y, w, h, color, pts) => {
  const segW = Math.floor(w / pts.length);
  const items = [
    rect(0, 0, w, h, color + '14', { radius: 2 }),
  ];
  pts.forEach((v, i) => {
    const bh = Math.max(2, Math.round((v / 100) * h));
    items.push(rect(i * segW, h - bh, segW - 1, bh, color + 'CC', { radius: 1 }));
  });
  return n('group', { x, y, w, h }, items);
};

// ─── SCREEN 1: Overview Dashboard ─────────────────────────────────────────────
const screen1 = () => {
  const Y = 52;
  return frame({ name: 'Overview' }, [
    statusBar(),
    bottomNav('overview'),

    // App header
    rect(0, Y, W, 52, P.bg),
    txt(20, Y + 4, 'LOGR', 12, P.accent, { fontWeight: 700, letterSpacing: 3 }),
    bold(20, Y + 22, 'Dashboard', 20, P.text),
    // Live badge
    n('group', { x: W - 82, y: Y + 24 }, [
      rect(0, 0, 66, 22, P.accent2 + '22', { radius: 11 }),
      dot(10, 8, P.accent2),
      txt(20, 4, 'LIVE', 10, P.accent2, { fontWeight: 700, letterSpacing: 1 }),
    ]),

    // ── Metric row: 2 cards ──
    // Card A: Events today
    n('group', { x: 16, y: Y + 60 }, [
      rect(0, 0, 170, 92, P.card, { radius: 12 }),
      rect(0, 0, 170, 92, 'transparent', { radius: 12, stroke: P.border, strokeWidth: 1 }),
      txt(14, 11, 'EVENTS / 24H', 9, P.sub, { fontWeight: 600, letterSpacing: 0.6 }),
      bold(14, 27, '2.4M', 34, P.text),
      txt(14, 68, '↑ 18% vs yesterday', 10, P.accent2),
      spark(14, 52, 142, 14, P.accent, [28,40,38,55,50,72,68,88,72,94]),
    ]),
    // Card B: P99 latency
    n('group', { x: 200, y: Y + 60 }, [
      rect(0, 0, 170, 92, P.card, { radius: 12 }),
      rect(0, 0, 170, 92, 'transparent', { radius: 12, stroke: P.border, strokeWidth: 1 }),
      txt(14, 11, 'P99 LATENCY', 9, P.sub, { fontWeight: 600, letterSpacing: 0.6 }),
      bold(14, 27, '42ms', 34, P.text),
      txt(14, 68, '↓ 6ms improved', 10, P.accent2),
      spark(14, 52, 142, 14, P.accent2, [68,58,62,48,50,38,40,32,34,28]),
    ]),

    // ── Error rate banner ──
    n('group', { x: 16, y: Y + 164 }, [
      rect(0, 0, W - 32, 66, P.card, { radius: 12 }),
      rect(0, 0, W - 32, 66, 'transparent', { radius: 12, stroke: P.border, strokeWidth: 1 }),
      rect(0, 0, 4, 66, P.danger, { radius: 4 }),
      txt(18, 11, 'ERROR RATE', 9, P.sub, { fontWeight: 600, letterSpacing: 0.6 }),
      bold(18, 27, '0.12%', 28, P.text),
      txt(18, 54, '↑ spike at 14:32 · data-pipeline', 10, P.danger),
      n('group', { x: W - 130, y: 12 }, [
        rect(0, 0, 108, 38, P.bg, { radius: 8 }),
        spark(8, 4, 92, 30, P.danger, [5, 7, 6, 11, 9, 8, 14, 10, 12, 18]),
      ]),
    ]),

    // ── Service health ──
    bold(20, Y + 242, 'Service Health', 13, P.text),
    ...[
      { name: 'api-gateway',   pct: '99.9%', color: P.accent2 },
      { name: 'auth-service',  pct: '100%',  color: P.accent2 },
      { name: 'queue-worker',  pct: '97.3%', color: P.accent3 },
      { name: 'data-pipeline', pct: '94.1%', color: P.danger },
    ].map((s, i) =>
      n('group', { x: 16, y: Y + 262 + i * 46 }, [
        rect(0, 0, W - 32, 40, P.surface, { radius: 8 }),
        rect(0, 0, W - 32, 40, 'transparent', { radius: 8, stroke: P.border, strokeWidth: 1 }),
        dot(14, 17, s.color),
        mono(28, 13, s.name, 12, P.text),
        bold(W - 72, 13, s.pct, 13, s.color, { textAlign: 'right' }),
      ])
    ),

    // ── Active alert strip ──
    n('group', { x: 16, y: Y + 450 }, [
      rect(0, 0, W - 32, 52, P.accent + '14', { radius: 10 }),
      rect(0, 0, W - 32, 52, 'transparent', { radius: 10, stroke: P.accent + '44', strokeWidth: 1 }),
      txt(14, 10, '⚡  1 active alert needs attention', 12, P.accent, { fontWeight: 600 }),
      txt(14, 30, 'data-pipeline P99 exceeded 500ms threshold', 10, P.sub),
    ]),
  ]);
};

// ─── SCREEN 2: Event Stream ───────────────────────────────────────────────────
const screen2 = () => {
  const Y = 52;
  return frame({ name: 'Stream' }, [
    statusBar(),
    bottomNav('stream'),

    bold(20, Y + 6, 'Event Stream', 20, P.text),
    txt(20, Y + 32, 'Real-time  ·  847 events/sec', 12, P.sub),

    // Search / filter bar
    n('group', { x: 16, y: Y + 56 }, [
      rect(0, 0, W - 32, 38, P.card, { radius: 10 }),
      rect(0, 0, W - 32, 38, 'transparent', { radius: 10, stroke: P.border, strokeWidth: 1 }),
      txt(14, 11, '⌕  level:error  service:data-pipeline', 12, P.muted),
    ]),

    // Level tabs
    ...['ALL', 'ERROR', 'WARN', 'INFO', 'DEBUG'].map((lvl, i) => {
      const cols = { ALL: P.accent, ERROR: P.danger, WARN: P.accent3, INFO: P.accent2, DEBUG: P.sub };
      const isActive = i === 0;
      const xp = 16 + i * 70;
      return n('group', { x: xp, y: Y + 103 }, [
        rect(0, 0, 62, 26, isActive ? P.accent : P.border, { radius: 13 }),
        txt(isActive ? 10 : 12, 7, lvl, 10, isActive ? P.white : P.sub,
          { fontWeight: isActive ? 700 : 400 }),
      ]);
    }),

    // Log rows
    ...[
      { t: '14:37:22.041', lv: 'ERROR', msg: 'Timeout on db connection pool',     svc: 'data-pipeline', c: P.danger },
      { t: '14:37:21.998', lv: 'WARN',  msg: 'Rate limit threshold approaching',  svc: 'api-gateway',   c: P.accent3 },
      { t: '14:37:21.880', lv: 'INFO',  msg: 'User session authenticated',        svc: 'auth-service',  c: P.accent2 },
      { t: '14:37:21.741', lv: 'INFO',  msg: 'Batch processed 2,400 queue jobs',  svc: 'queue-worker',  c: P.accent2 },
      { t: '14:37:21.610', lv: 'ERROR', msg: 'Failed to parse webhook payload',   svc: 'data-pipeline', c: P.danger },
      { t: '14:37:21.520', lv: 'DEBUG', msg: 'Cache hit ratio 94.2% (warm)',      svc: 'api-gateway',   c: P.muted },
      { t: '14:37:21.391', lv: 'WARN',  msg: 'Slow query detected: 312ms',        svc: 'auth-service',  c: P.accent3 },
      { t: '14:37:21.200', lv: 'INFO',  msg: 'Deployment rollout 100% complete',  svc: 'api-gateway',   c: P.accent2 },
    ].map((e, i) =>
      n('group', { x: 16, y: Y + 140 + i * 56 }, [
        rect(0, 0, W - 32, 50, P.surface, { radius: 8 }),
        rect(0, 0, W - 32, 50, 'transparent', { radius: 8, stroke: P.border, strokeWidth: 1 }),
        rect(0, 0, 3, 50, e.c, { radius: 2 }),
        mono(12, 7, e.t, 9, P.muted),
        txt(12, 22, e.msg, 11, P.text, { fontWeight: 500 }),
        pill(12, 36, e.lv, e.c),
        txt(W - 100, 22, e.svc, 10, P.sub, { textAlign: 'right' }),
      ])
    ),
  ]);
};

// ─── SCREEN 3: Query Builder ──────────────────────────────────────────────────
const screen3 = () => {
  const Y = 52;
  return frame({ name: 'Query' }, [
    statusBar(),
    bottomNav('query'),

    bold(20, Y + 6, 'Query Builder', 20, P.text),
    txt(20, Y + 32, 'SQL-powered event analysis', 12, P.sub),

    // Editor
    n('group', { x: 16, y: Y + 56 }, [
      rect(0, 0, W - 32, 140, '#070810', { radius: 12 }),
      rect(0, 0, W - 32, 140, 'transparent', { radius: 12, stroke: P.accent + '55', strokeWidth: 1 }),
      // Gutter
      rect(0, 0, 30, 140, P.border + '66', { radius: 0 }),
      ...[1,2,3,4,5,6].map(ln => mono(6, 10 + (ln - 1) * 22, `${ln}`, 10, P.muted)),
      // Line 1
      mono(40, 10, 'SELECT', 11, P.accent, { fontWeight: 700 }),
      mono(98, 10, 'event_name, count(*)', 11, P.text),
      // Line 2
      mono(40, 32, 'FROM', 11, P.accent, { fontWeight: 700 }),
      mono(76, 32, 'events', 11, P.accent2),
      // Line 3
      mono(40, 54, 'WHERE', 11, P.accent, { fontWeight: 700 }),
      mono(88, 54, 'level = ', 11, P.text),
      mono(142, 54, "'ERROR'", 11, P.accent3),
      // Line 4
      mono(40, 76, 'AND', 11, P.accent, { fontWeight: 700 }),
      mono(68, 76, 'ts >= now() - interval', 11, P.text),
      mono(240, 76, "'1h'", 11, P.accent3),
      // Line 5
      mono(40, 98, 'GROUP BY', 11, P.accent, { fontWeight: 700 }),
      mono(110, 98, 'event_name', 11, P.text),
      // Line 6
      mono(40, 120, 'ORDER BY', 11, P.accent, { fontWeight: 700 }),
      mono(110, 120, 'count(*) DESC', 11, P.text),
      // Cursor
      rect(W - 50, 120, 8, 14, P.accent + 'BB', { radius: 1 }),
      // Copy
      n('group', { x: W - 84, y: 8 }, [
        rect(0, 0, 60, 22, P.border, { radius: 6 }),
        txt(10, 4, '⧉  Copy', 10, P.sub),
      ]),
    ]),

    // Run button
    n('group', { x: 16, y: Y + 206 }, [
      rect(0, 0, W - 32, 42, P.accent, { radius: 10 }),
      txt((W - 32) / 2 - 52, 12, '▶  Run Query  (⌘↵)', 14, P.white, { fontWeight: 600 }),
    ]),

    // Results
    txt(20, Y + 262, 'Results — 12 rows · 38ms', 11, P.sub),
    // Header
    n('group', { x: 16, y: Y + 280 }, [
      rect(0, 0, W - 32, 28, P.border, { radius: 8 }),
      txt(12, 7, 'event_name', 11, P.sub, { fontWeight: 600 }),
      txt(W - 88, 7, 'count(*)', 11, P.sub, { fontWeight: 600, textAlign: 'right' }),
    ]),
    ...[
      { name: 'db.connection.timeout', count: '1,284', c: P.danger },
      { name: 'auth.token.invalid',    count: '892',   c: P.danger },
      { name: 'webhook.parse.failed',  count: '621',   c: P.accent3 },
      { name: 'rate_limit.exceeded',   count: '448',   c: P.accent3 },
      { name: 'cache.miss',            count: '312',   c: P.sub },
      { name: 'queue.retry',           count: '201',   c: P.sub },
    ].map((row, i) =>
      n('group', { x: 16, y: Y + 310 + i * 36 }, [
        rect(0, 0, W - 32, 32, i % 2 === 0 ? P.surface : P.bg, { radius: 6 }),
        mono(12, 8, row.name, 11, P.text),
        bold(W - 80, 8, row.count, 12, row.c, { textAlign: 'right' }),
      ])
    ),
  ]);
};

// ─── SCREEN 4: Anomaly Alerts ─────────────────────────────────────────────────
const screen4 = () => {
  const Y = 52;
  return frame({ name: 'Alerts' }, [
    statusBar(),
    bottomNav('alerts'),

    bold(20, Y + 6, 'Anomaly Alerts', 20, P.text),
    txt(20, Y + 32, '3 active  ·  1 critical', 12, P.sub),
    n('group', { x: W - 94, y: Y + 26 }, [
      rect(0, 0, 78, 22, P.danger + '22', { radius: 11 }),
      dot(10, 8, P.danger),
      txt(20, 4, 'CRITICAL', 9, P.danger, { fontWeight: 700 }),
    ]),

    ...[
      {
        title: 'P99 Latency Threshold Exceeded',
        svc: 'data-pipeline',
        val: '847ms  ›  500ms baseline',
        age: '14 min ago',
        sev: 'CRITICAL',
        c: P.danger,
      },
      {
        title: 'Error Rate Spike Detected',
        svc: 'api-gateway',
        val: '3.2%  ›  0.1% baseline',
        age: '2 hr ago',
        sev: 'WARNING',
        c: P.accent3,
      },
      {
        title: 'Unusual Traffic Pattern',
        svc: 'auth-service',
        val: '4× normal requests/sec',
        age: '3 hr ago',
        sev: 'INFO',
        c: P.accent,
      },
    ].map((al, i) =>
      n('group', { x: 16, y: Y + 62 + i * 128 }, [
        rect(0, 0, W - 32, 120, al.c + '0E', { radius: 12 }),
        rect(0, 0, W - 32, 120, 'transparent', { radius: 12, stroke: al.c + '44', strokeWidth: 1 }),
        rect(0, 0, 4, 120, al.c, { radius: 4 }),
        // Severity
        n('group', { x: 14, y: 10 }, [
          rect(0, 0, al.sev.length * 7 + 16, 20, al.c + '22', { radius: 10 }),
          txt(8, 4, al.sev, 9, al.c, { fontWeight: 700 }),
        ]),
        bold(14, 38, al.title, 13, P.text),
        mono(14, 60, al.svc, 10, P.sub),
        txt(14, 78, al.val, 11, al.c, { fontWeight: 500 }),
        txt(14, 98, `Started ${al.age}`, 10, P.muted),
        txt(W - 46, 12, '×', 18, P.muted),
        // Spark
        n('group', { x: W - 88, y: 48 }, [
          rect(0, 0, 66, 28, P.bg + 'CC', { radius: 6 }),
          spark(6, 4, 54, 20, al.c, [20, 30, 25, 45, 40, 38, 60, 55, 70, 80]),
        ]),
      ])
    ),

    // Silence all
    n('group', { x: 16, y: Y + 448 }, [
      rect(0, 0, W - 32, 44, P.card, { radius: 10 }),
      rect(0, 0, W - 32, 44, 'transparent', { radius: 10, stroke: P.border, strokeWidth: 1 }),
      txt((W - 32) / 2 - 58, 13, '🔕  Silence All Alerts (1h)', 13, P.sub, { fontWeight: 500 }),
    ]),
  ]);
};

// ─── SCREEN 5: Data Sources / Integrations ────────────────────────────────────
const screen5 = () => {
  const Y = 52;
  return frame({ name: 'Sources' }, [
    statusBar(),
    bottomNav('sources'),

    bold(20, Y + 6, 'Data Sources', 20, P.text),
    txt(20, Y + 32, 'Ingest events from anywhere', 12, P.sub),

    // SDK card
    n('group', { x: 16, y: Y + 56 }, [
      rect(0, 0, W - 32, 120, '#060710', { radius: 12 }),
      rect(0, 0, W - 32, 120, 'transparent', { radius: 12, stroke: P.accent + '66', strokeWidth: 1 }),
      txt(14, 10, 'Node.js SDK  ·  Quick Start', 10, P.accent, { fontWeight: 700, letterSpacing: 0.8 }),
      n('group', { x: W - 82, y: 8 }, [
        rect(0, 0, 66, 22, P.border, { radius: 6 }),
        txt(10, 4, '⧉  Copy', 10, P.sub),
      ]),
      mono(14, 32, 'npm install @logr/sdk', 11, P.accent3),
      mono(14, 52, 'import { Logr } from "@logr/sdk"', 10, P.text),
      mono(14, 68, 'const client = new Logr({', 10, P.text),
      mono(14, 84, '  token:', 10, P.text),
      mono(70, 84, '"lgr_live_••••••••"', 10, P.accent2),
      mono(14, 100, '})', 10, P.text),
    ]),

    // Connected sources
    bold(20, Y + 190, 'Connected Sources  (4)', 13, P.text),
    ...[
      { name: 'Vercel',         events: '1.2M/day',  icon: '▲', color: P.text,    active: true },
      { name: 'Supabase',       events: '840K/day',  icon: '⚡', color: P.accent2, active: true },
      { name: 'Cloudflare',     events: '3.1M/day',  icon: '◈', color: P.accent3, active: true },
      { name: 'GitHub Actions', events: '—',          icon: '◎', color: P.muted,   active: false },
    ].map((src, i) =>
      n('group', { x: 16, y: Y + 214 + i * 62 }, [
        rect(0, 0, W - 32, 56, P.card, { radius: 10 }),
        rect(0, 0, W - 32, 56, 'transparent', { radius: 10, stroke: P.border, strokeWidth: 1 }),
        txt(14, 19, src.icon, 18, src.color),
        bold(42, 10, src.name, 13, P.text),
        txt(42, 30, src.events, 10, P.sub),
        n('group', { x: W - 92, y: 17 }, [
          rect(0, 0, 76, 22, src.active ? P.accent2 + '22' : P.border, { radius: 11 }),
          dot(10, 8, src.active ? P.accent2 : P.muted),
          txt(20, 4, src.active ? 'Active' : 'Paused', 10,
            src.active ? P.accent2 : P.muted, { fontWeight: 500 }),
        ]),
      ])
    ),

    // Add source
    n('group', { x: 16, y: Y + 464 }, [
      rect(0, 0, W - 32, 44, 'transparent', { radius: 10, stroke: P.accent + '55', strokeWidth: 1 }),
      txt((W - 32) / 2 - 54, 13, '+  Add New Data Source', 14, P.accent, { fontWeight: 600 }),
    ]),
  ]);
};

// ─── Write .pen ───────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'LOGR — Developer Event Observability',
  width: W,
  height: H,
  fill: P.bg,
  children: [
    screen1(),
    screen2(),
    screen3(),
    screen4(),
    screen5(),
  ],
};

const out = JSON.stringify(pen, null, 2);
fs.writeFileSync('logr.pen', out);
console.log('✓  logr.pen written —', Math.round(out.length / 1024), 'KB');
console.log('   Screens: Overview · Stream · Query · Alerts · Sources');
console.log('   Theme: Dark  bg:#08090E  accent:#4F6EF7  mint:#34D399');
