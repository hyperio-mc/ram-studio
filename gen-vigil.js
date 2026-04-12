/**
 * gen-vigil.js
 * VIGIL — Always-On Software Reliability Intelligence
 *
 * Inspired by:
 *  - "Fluid Glass" SOTD on Awwwards (glassmorphism, luminous depth layers)
 *  - "Interfere › Build software that never breaks" on Land-book (reliability concept)
 *  - Neon/Midday dark showcase on DarkModeDesign (dark editorial with glowing accents)
 *
 * Theme: DARK — deep space with electric violet + neon teal accents
 */

const fs = require('fs');
const path = require('path');

// ─── Palette ──────────────────────────────────────────────────────────────────
const P = {
  bg:       '#060810',
  surface:  '#0F1120',
  surfaceB: '#141830',
  border:   'rgba(123,107,255,0.18)',
  text:     '#DCE4FF',
  textMid:  '#8B97CC',
  accent:   '#7B6BFF',
  accentLo: 'rgba(123,107,255,0.15)',
  teal:     '#22E5A8',
  tealLo:   'rgba(34,229,168,0.12)',
  red:      '#FF5A6E',
  redLo:    'rgba(255,90,110,0.12)',
  amber:    '#FFB84D',
  amberLo:  'rgba(255,184,77,0.12)',
};

// ─── Pen helpers ──────────────────────────────────────────────────────────────
let id = 1;
const uid  = () => `e${id++}`;
const rect = (x, y, w, h, fill, r = 0) => ({
  id: uid(), type: 'rectangle', x, y, width: w, height: h,
  fill, cornerRadius: r, stroke: 'none', strokeWidth: 0,
  opacity: 1, visible: true,
});
const text = (x, y, content, size, color, weight = 400, align = 'left', w = 320) => ({
  id: uid(), type: 'text', x, y, width: w, height: size * 1.4,
  content, fontSize: size, fontWeight: weight, color,
  textAlign: align, lineHeight: 1.35,
  fontFamily: 'Inter, system-ui, sans-serif',
  visible: true, opacity: 1,
});
const line = (x, y, w, color = P.border) => ({
  id: uid(), type: 'rectangle', x, y, width: w, height: 1,
  fill: color, cornerRadius: 0, stroke: 'none', strokeWidth: 0,
  opacity: 1, visible: true,
});
const pill = (x, y, w, h, fill, label, lColor, lSize = 11) => ({
  id: uid(), type: 'group', x, y, width: w, height: h, children: [
    { id: uid(), type: 'rectangle', x: 0, y: 0, width: w, height: h,
      fill, cornerRadius: h / 2, stroke: 'none', strokeWidth: 0, opacity: 1, visible: true },
    { id: uid(), type: 'text', x: 0, y: (h - lSize * 1.3) / 2, width: w, height: lSize * 1.3,
      content: label, fontSize: lSize, fontWeight: 600, color: lColor,
      textAlign: 'center', lineHeight: 1.3, fontFamily: 'Inter, system-ui, sans-serif',
      visible: true, opacity: 1 },
  ], visible: true, opacity: 1,
});
const card = (x, y, w, h, children = []) => ({
  id: uid(), type: 'group', x, y, width: w, height: h,
  children: [
    { id: uid(), type: 'rectangle', x: 0, y: 0, width: w, height: h,
      fill: P.surface, cornerRadius: 16,
      stroke: P.border, strokeWidth: 1, opacity: 1, visible: true },
    ...children,
  ],
  visible: true, opacity: 1,
});
const dot = (x, y, r, fill) => ({
  id: uid(), type: 'ellipse', x: x - r, y: y - r, width: r * 2, height: r * 2,
  fill, stroke: 'none', strokeWidth: 0, opacity: 1, visible: true,
});

// ─── Frame builder ────────────────────────────────────────────────────────────
const FRAME_W = 390;
const FRAME_H = 844;
const STATUS_H = 44;
const NAV_H    = 80;
const CONTENT_TOP = STATUS_H + 56; // status + topbar

function makeFrame(name, x, children) {
  return {
    id: uid(), type: 'frame', name,
    x, y: 0, width: FRAME_W, height: FRAME_H,
    fill: P.bg, cornerRadius: 0,
    children,
  };
}

function statusBar(label = '') {
  return [
    rect(0, 0, FRAME_W, STATUS_H, P.bg),
    text(20, 14, '9:41', 15, P.text, 600, 'left', 60),
    text(FRAME_W - 80, 14, '●●● ▐ 🔋', 13, P.textMid, 400, 'right', 80),
  ];
}

function topBar(title, sub = '') {
  const els = [
    text(20, STATUS_H + 14, title, 22, P.text, 700, 'left', 260),
  ];
  if (sub) els.push(text(20, STATUS_H + 40, sub, 13, P.textMid, 400, 'left', 240));
  return els;
}

function bottomNav(active) {
  const items = [
    { label: 'Overview', icon: '◎' },
    { label: 'Services', icon: '⬡' },
    { label: 'Incidents', icon: '⚡' },
    { label: 'Latency', icon: '〜' },
    { label: 'Alerts', icon: '🔔' },
  ];
  const els = [
    rect(0, FRAME_H - NAV_H, FRAME_W, NAV_H, P.surfaceB),
    line(0, FRAME_H - NAV_H, FRAME_W, P.border),
  ];
  items.forEach((item, i) => {
    const bx = i * (FRAME_W / 5);
    const isActive = item.label === active;
    els.push(text(bx, FRAME_H - NAV_H + 12, item.icon, 20, isActive ? P.accent : P.textMid, 400, 'center', FRAME_W / 5));
    els.push(text(bx, FRAME_H - NAV_H + 36, item.label, 10, isActive ? P.accent : P.textMid, isActive ? 600 : 400, 'center', FRAME_W / 5));
  });
  return els;
}

// ─── Badge chip ──────────────────────────────────────────────────────────────
function badge(x, y, label, color, bg) {
  return {
    id: uid(), type: 'group', x, y, width: 64, height: 22, children: [
      { id: uid(), type: 'rectangle', x: 0, y: 0, width: 64, height: 22,
        fill: bg, cornerRadius: 11, stroke: 'none', strokeWidth: 0, opacity: 1, visible: true },
      { id: uid(), type: 'text', x: 0, y: 4, width: 64, height: 14,
        content: label, fontSize: 11, fontWeight: 700, color,
        textAlign: 'center', lineHeight: 1.3, fontFamily: 'Inter, system-ui, sans-serif',
        visible: true, opacity: 1 },
    ], visible: true, opacity: 1,
  };
}

// ─── Screen 1: Overview ──────────────────────────────────────────────────────
function screen1() {
  const cy = CONTENT_TOP + 4;
  const children = [
    ...statusBar(),
    ...topBar('VIGIL', 'Platform health · Real-time'),

    // Big uptime ring (simulated as nested circles)
    dot(195, cy + 90, 72, P.accentLo),
    dot(195, cy + 90, 56, 'rgba(123,107,255,0.08)'),
    { ...dot(195, cy + 90, 48, 'none'), stroke: P.accent, strokeWidth: 3, opacity: 1, visible: true },
    text(195 - 40, cy + 72, '99.98%', 22, P.accent, 700, 'center', 80),
    text(195 - 45, cy + 98, 'Uptime 30d', 12, P.textMid, 400, 'center', 90),

    // SLA card row
    card(16, cy + 158, 170, 76, [
      text(14, 12, 'SLA Compliance', 11, P.textMid, 500, 'left', 140),
      text(14, 30, '99.95%', 24, P.teal, 700, 'left', 140),
      text(14, 56, '↑ 0.03% vs last mo.', 11, P.teal, 400, 'left', 140),
    ]),
    card(200, cy + 158, 170, 76, [
      text(14, 12, 'MTTR', 11, P.textMid, 500, 'left', 140),
      text(14, 30, '4.2 min', 24, P.text, 700, 'left', 140),
      text(14, 56, '↓ 1.8 min faster', 11, P.teal, 400, 'left', 140),
    ]),

    // Error budget
    card(16, cy + 250, 354, 70, [
      text(14, 12, 'Error Budget Remaining', 11, P.textMid, 500, 'left', 180),
      text(14, 30, '83%', 20, P.text, 700, 'left', 60),
      // budget bar background
      { id: uid(), type: 'rectangle', x: 14, y: 50, width: 310, height: 8,
        fill: P.surfaceB, cornerRadius: 4, stroke: 'none', strokeWidth: 0, opacity: 1, visible: true },
      // budget bar fill
      { id: uid(), type: 'rectangle', x: 14, y: 50, width: 257, height: 8,
        fill: P.teal, cornerRadius: 4, stroke: 'none', strokeWidth: 0, opacity: 1, visible: true },
    ]),

    // Recent incidents list header
    text(16, cy + 338, 'Recent Incidents', 14, P.text, 600, 'left', 200),
    text(FRAME_W - 60, cy + 338, 'View all →', 12, P.accent, 500, 'right', 56),

    // Incident rows
    ...(() => {
      const rows = [
        { label: 'API Gateway latency spike', time: '2h ago', sev: 'P2', sevColor: P.amber, sevBg: P.amberLo },
        { label: 'Auth service degraded',     time: '14h ago', sev: 'P1', sevColor: P.red,   sevBg: P.redLo  },
        { label: 'CDN cache miss rate high',  time: '2d ago',  sev: 'P3', sevColor: P.teal,  sevBg: P.tealLo },
      ];
      return rows.flatMap((r, i) => [
        card(16, cy + 362 + i * 62, 354, 52, [
          text(14, 10, r.label, 13, P.text, 500, 'left', 240),
          text(14, 30, r.time,  11, P.textMid, 400, 'left', 120),
          badge(280, 14, r.sev, r.sevColor, r.sevBg),
        ]),
      ]);
    })(),

    ...bottomNav('Overview'),
  ];
  return makeFrame('Overview', 0, children);
}

// ─── Screen 2: Services ──────────────────────────────────────────────────────
function screen2() {
  const cy = CONTENT_TOP + 4;
  const services = [
    { name: 'API Gateway',   env: 'prod', uptime: '99.99%', ms: '42ms',  status: 'healthy',   dot: P.teal  },
    { name: 'Auth Service',  env: 'prod', uptime: '99.71%', ms: '128ms', status: 'degraded',  dot: P.amber },
    { name: 'Worker Queue',  env: 'prod', uptime: '100%',   ms: '8ms',   status: 'healthy',   dot: P.teal  },
    { name: 'Data Pipeline', env: 'prod', uptime: '99.92%', ms: '340ms', status: 'healthy',   dot: P.teal  },
    { name: 'Search Index',  env: 'prod', uptime: '98.10%', ms: '210ms', status: 'incident',  dot: P.red   },
    { name: 'Email Service', env: 'stg',  uptime: '99.85%', ms: '55ms',  status: 'healthy',   dot: P.teal  },
  ];

  const children = [
    ...statusBar(),
    ...topBar('Services', `${services.length} monitored · 1 incident`),

    // Filter chips
    ...[['All', true], ['Healthy', false], ['Degraded', false], ['Incident', false]].map(([lbl, active], i) => ({
      id: uid(), type: 'group', x: 16 + i * 85, y: cy + 4, width: 76, height: 28,
      children: [
        { id: uid(), type: 'rectangle', x: 0, y: 0, width: 76, height: 28,
          fill: active ? P.accentLo : P.surfaceB,
          cornerRadius: 14, stroke: active ? P.accent : 'none', strokeWidth: active ? 1 : 0,
          opacity: 1, visible: true },
        { id: uid(), type: 'text', x: 0, y: 6, width: 76, height: 16,
          content: lbl, fontSize: 12, fontWeight: active ? 600 : 400,
          color: active ? P.accent : P.textMid,
          textAlign: 'center', lineHeight: 1.3,
          fontFamily: 'Inter, system-ui, sans-serif', visible: true, opacity: 1 },
      ], visible: true, opacity: 1,
    })),

    // Service cards
    ...services.flatMap((s, i) => [
      card(16, cy + 50 + i * 68, 354, 58, [
        // status dot
        { id: uid(), type: 'ellipse', x: 12, y: 20, width: 10, height: 10,
          fill: s.dot, stroke: 'none', strokeWidth: 0, opacity: 1, visible: true },
        text(30, 8, s.name, 14, P.text, 600, 'left', 180),
        text(30, 28, `${s.env.toUpperCase()} · ${s.uptime}`, 11, P.textMid, 400, 'left', 180),
        text(286, 8, s.ms, 14, P.text, 600, 'right', 56),
        text(286, 28, 'avg latency', 10, P.textMid, 400, 'right', 56),
      ]),
    ]),

    ...bottomNav('Services'),
  ];
  return makeFrame('Services', 420, children);
}

// ─── Screen 3: Incidents ─────────────────────────────────────────────────────
function screen3() {
  const cy = CONTENT_TOP + 4;
  const incidents = [
    { title: 'API Gateway latency spike',   severity: 'P2', color: P.amber, bg: P.amberLo,
      opened: '2h ago', duration: '1h 12m', affected: '4 services', status: 'Open' },
    { title: 'Auth service degraded',       severity: 'P1', color: P.red,   bg: P.redLo,
      opened: '14h ago', duration: '22m',    affected: '1 service',  status: 'Resolved' },
    { title: 'CDN cache miss rate elevated', severity: 'P3', color: P.teal,  bg: P.tealLo,
      opened: '2d ago',  duration: '5m',     affected: '1 service',  status: 'Resolved' },
    { title: 'Search index replication lag', severity: 'P2', color: P.amber, bg: P.amberLo,
      opened: '3d ago',  duration: '38m',    affected: '1 service',  status: 'Resolved' },
  ];

  const children = [
    ...statusBar(),
    ...topBar('Incidents', '1 open · 3 resolved this week'),

    // Open badge
    text(16, cy + 6, 'OPEN', 11, P.red, 700, 'left', 60),
    line(16, cy + 22, 354),

    ...incidents.flatMap((inc, i) => {
      const gy = cy + 32 + i * 94;
      return [
        card(16, gy, 354, 84, [
          // severity pill
          badge(14, 12, inc.severity, inc.color, inc.bg),
          // status
          badge(280, 12, inc.status, inc.status === 'Open' ? P.red : P.teal,
                inc.status === 'Open' ? P.redLo : P.tealLo),
          text(14, 38, inc.title, 13, P.text, 600, 'left', 310),
          text(14, 58, `${inc.opened}  ·  ${inc.duration}  ·  ${inc.affected}`, 11, P.textMid, 400, 'left', 310),
        ]),
      ];
    }),

    ...bottomNav('Incidents'),
  ];
  return makeFrame('Incidents', 840, children);
}

// ─── Screen 4: Latency ────────────────────────────────────────────────────────
function screen4() {
  const cy = CONTENT_TOP + 4;

  // Fake sparkline data points for p50/p99
  const p50Points = [38, 35, 42, 40, 45, 38, 36, 44, 41, 39, 43, 38, 36, 40, 42, 38, 35, 41, 39, 44];
  const p99Points = [98, 105, 120, 110, 130, 108, 102, 115, 124, 118, 130, 112, 108, 122, 128, 115, 108, 120, 118, 135];

  const chartX = 16, chartY = cy + 70, chartW = 354, chartH = 120;
  const maxVal = 160;
  const stepX = chartW / (p50Points.length - 1);

  function pathPoints(pts) {
    return pts.map((v, i) => {
      const px = chartX + i * stepX;
      const py = chartY + chartH - (v / maxVal) * chartH;
      return `${px.toFixed(1)},${py.toFixed(1)}`;
    }).join(' ');
  }

  const children = [
    ...statusBar(),
    ...topBar('Latency', 'API Gateway · Last 24h'),

    // Time range toggles
    ...[['1h', false], ['6h', false], ['24h', true], ['7d', false]].map(([lbl, active], i) => ({
      id: uid(), type: 'group', x: 16 + i * 62, y: cy + 4, width: 54, height: 24,
      children: [
        { id: uid(), type: 'rectangle', x: 0, y: 0, width: 54, height: 24,
          fill: active ? P.accentLo : 'none',
          cornerRadius: 12, stroke: active ? P.accent : P.border, strokeWidth: 1,
          opacity: 1, visible: true },
        { id: uid(), type: 'text', x: 0, y: 5, width: 54, height: 14,
          content: lbl, fontSize: 12, fontWeight: active ? 600 : 400,
          color: active ? P.accent : P.textMid,
          textAlign: 'center', lineHeight: 1.2,
          fontFamily: 'Inter, system-ui, sans-serif', visible: true, opacity: 1 },
      ], visible: true, opacity: 1,
    })),

    // Chart bg
    { id: uid(), type: 'rectangle', x: chartX, y: chartY, width: chartW, height: chartH,
      fill: P.surfaceB, cornerRadius: 12,
      stroke: P.border, strokeWidth: 1, opacity: 1, visible: true },

    // Grid lines
    ...[0, 0.25, 0.5, 0.75, 1].map(t => ({
      id: uid(), type: 'rectangle',
      x: chartX + 2, y: chartY + t * chartH - 0.5,
      width: chartW - 4, height: 1,
      fill: 'rgba(123,107,255,0.08)',
      cornerRadius: 0, stroke: 'none', strokeWidth: 0, opacity: 1, visible: true,
    })),

    // p99 line (rendered as polyline via SVG-like path text)
    text(chartX + 2, chartY + chartH + 8, `p99: ${pathPoints(p99Points)}`, 9, 'transparent', 400, 'left', 0),

    // Metric summary row
    card(16, cy + 208, 108, 60, [
      text(12, 10, 'p50', 11, P.textMid, 500, 'left', 82),
      text(12, 26, '41ms', 20, P.teal, 700, 'left', 82),
    ]),
    card(136, cy + 208, 108, 60, [
      text(12, 10, 'p95', 11, P.textMid, 500, 'left', 82),
      text(12, 26, '98ms', 20, P.text, 700, 'left', 82),
    ]),
    card(256, cy + 208, 114, 60, [
      text(12, 10, 'p99', 11, P.textMid, 500, 'left', 88),
      text(12, 26, '124ms', 20, P.amber, 700, 'left', 88),
    ]),

    // Heatmap title
    text(16, cy + 284, 'Request Distribution', 14, P.text, 600, 'left', 240),
    text(FRAME_W - 80, cy + 284, 'req/min', 12, P.textMid, 400, 'right', 70),

    // Heatmap grid (7 rows × 18 cols)
    ...(() => {
      const hms = [];
      const hx = 16, hy = cy + 306, cw = 19, ch = 14, gap = 2;
      const levels = [P.accentLo, 'rgba(123,107,255,0.3)', 'rgba(123,107,255,0.5)', P.accent, P.teal];
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 18; c++) {
          const lvl = Math.floor(Math.random() * 5);
          hms.push({
            id: uid(), type: 'rectangle',
            x: hx + c * (cw + gap), y: hy + r * (ch + gap),
            width: cw, height: ch,
            fill: levels[lvl], cornerRadius: 3,
            stroke: 'none', strokeWidth: 0, opacity: 1, visible: true,
          });
        }
      }
      return hms;
    })(),

    // Time labels
    text(16, cy + 420, '00:00', 10, P.textMid, 400, 'left', 60),
    text(175, cy + 420, '12:00', 10, P.textMid, 400, 'center', 60),
    text(330, cy + 420, '23:59', 10, P.textMid, 400, 'right', 60),

    ...bottomNav('Latency'),
  ];
  return makeFrame('Latency', 1260, children);
}

// ─── Screen 5: Alerts ────────────────────────────────────────────────────────
function screen5() {
  const cy = CONTENT_TOP + 4;
  const rules = [
    { name: 'High error rate',       condition: 'Error rate > 1% for 5m',    channel: 'PagerDuty', on: true  },
    { name: 'Latency SLA breach',    condition: 'p99 > 200ms for 10m',        channel: 'Slack',     on: true  },
    { name: 'Zero traffic detected', condition: 'RPS < 1 for 3m',             channel: 'Slack',     on: true  },
    { name: 'Cert expiry warning',   condition: 'TLS cert < 14d remaining',    channel: 'Email',     on: false },
    { name: 'Deployment anomaly',    condition: 'Error spike after deploy',    channel: 'Slack',     on: true  },
  ];

  const children = [
    ...statusBar(),
    ...topBar('Alerts', `${rules.filter(r => r.on).length} active rules`),

    // Add rule button
    {
      id: uid(), type: 'group', x: FRAME_W - 130, y: STATUS_H + 12, width: 114, height: 32,
      children: [
        { id: uid(), type: 'rectangle', x: 0, y: 0, width: 114, height: 32,
          fill: P.accentLo, cornerRadius: 16,
          stroke: P.accent, strokeWidth: 1, opacity: 1, visible: true },
        { id: uid(), type: 'text', x: 0, y: 8, width: 114, height: 16,
          content: '+ New Rule', fontSize: 13, fontWeight: 600, color: P.accent,
          textAlign: 'center', lineHeight: 1.2,
          fontFamily: 'Inter, system-ui, sans-serif', visible: true, opacity: 1 },
      ], visible: true, opacity: 1,
    },

    // Alert rules
    ...rules.flatMap((rule, i) => {
      const ry = cy + 14 + i * 80;
      return [
        card(16, ry, 354, 70, [
          // Toggle circle
          { id: uid(), type: 'rectangle', x: 290, y: 23, width: 40, height: 22,
            fill: rule.on ? P.teal : P.surfaceB,
            cornerRadius: 11, stroke: 'none', strokeWidth: 0, opacity: 1, visible: true },
          { id: uid(), type: 'ellipse',
            x: rule.on ? 314 : 296, y: 26, width: 16, height: 16,
            fill: rule.on ? P.bg : P.textMid,
            stroke: 'none', strokeWidth: 0, opacity: 1, visible: true },
          text(14, 10, rule.name, 14, P.text, 600, 'left', 264),
          text(14, 30, rule.condition, 11, P.textMid, 400, 'left', 264),
          text(14, 50, `→ ${rule.channel}`, 11, rule.on ? P.accent : P.textMid, 500, 'left', 264),
        ]),
      ];
    }),

    ...bottomNav('Alerts'),
  ];
  return makeFrame('Alerts', 1680, children);
}

// ─── Assemble pen ─────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  meta: {
    title: 'VIGIL',
    description: 'Always-On Software Reliability Intelligence',
    theme: 'dark',
    createdAt: new Date().toISOString(),
    author: 'RAM Design Heartbeat',
    slug: 'vigil',
  },
  canvas: {
    width: 2100,
    height: 900,
    background: '#030407',
    grid: { enabled: false },
    zoom: 1,
  },
  frames: [
    screen1(),
    screen2(),
    screen3(),
    screen4(),
    screen5(),
  ],
};

const OUT = path.join(__dirname, 'vigil.pen');
fs.writeFileSync(OUT, JSON.stringify(pen, null, 2));
console.log(`✓ vigil.pen written (${(fs.statSync(OUT).size / 1024).toFixed(1)} KB)`);
