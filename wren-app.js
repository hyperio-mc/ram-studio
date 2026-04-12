'use strict';
// wren-app.js — WREN: Minimal API Health & Monitoring Studio
//
// Inspired by:
//   • Linear.app on darkmodedesign.com — functional dark precision, dense data
//     perfectly organized, 4px grid discipline, typography as information hierarchy.
//   • Obsidian on darkmodedesign.com — near-black minimal app, no chrome at all,
//     every pixel earns its place.
//   • minimal.gallery — pure black (#000) or near-black backgrounds, single warm
//     accent against monochrome. Cream text on void bg.
//   • land-book.com "Big Type" trend — oversized numerals used as primary hero
//     element. 99.97% uptime rendered in enormous display weight becomes the page.
//
// Challenge: Design a 5-screen dark-mode API monitoring dashboard where the
// "big type" trend from land-book drives the design — uptime/latency numbers
// ARE the UI hero. Near-true-black bg (#080808), warm cream text (#E4DFD3),
// acid yellow-green (#BFFF00) for healthy/success states, vivid red (#FF3A4E)
// for errors. Inspired by the functional minimalism of Linear + Obsidian.
//
// Screens: Overview · Endpoints · Incidents · Analytics · Alerts

const fs   = require('fs');
const path = require('path');

// ── Palette ────────────────────────────────────────────────────────────────────
const P = {
  bg:       '#080808',
  surface:  '#111111',
  surface2: '#181818',
  surface3: '#202020',
  border:   '#222222',
  border2:  '#2E2E2E',
  fg:       '#E4DFD3',
  fg2:      '#8A857A',
  fg3:      '#3D3A35',
  acid:     '#BFFF00',   // acid yellow-green — "up / healthy"
  acidLo:   '#BFFF0018',
  acidMid:  '#BFFF0035',
  red:      '#FF3A4E',   // vivid red — "down / error"
  redLo:    '#FF3A4E18',
  amber:    '#F09000',   // amber — "degraded / warn"
  amberLo:  '#F0900018',
  blue:     '#5B9CF6',   // reference blue — annotations
  blueLo:   '#5B9CF618',
};

let _id = 0;
const uid = () => `wr${++_id}`;

// ── Primitives ─────────────────────────────────────────────────────────────────
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

const Pill = (x, y, text, fill, textFill) => {
  const w = text.length * 6.2 + 18;
  return F(x, y, w, 18, fill, { r: 9, ch: [
    T(text, 9, 2, w - 14, 14, { size: 9, fill: textFill || P.bg, weight: 700, ls: 0.4 }),
  ]});
};

const StatusDot = (x, y, color) => E(x, y, 8, 8, color, {});

const NavBar = (selected) => {
  const tabs = [
    { label: 'Overview',  icon: '◉' },
    { label: 'Endpoints', icon: '≡' },
    { label: 'Incidents', icon: '◈' },
    { label: 'Analytics', icon: '⌗' },
    { label: 'Alerts',    icon: '◎' },
  ];
  const ch = [];
  // top border
  ch.push(Line(0, 0, 390, P.border));
  tabs.forEach((tab, i) => {
    const ix  = 4 + i * 76;
    const sel = i === selected;
    if (sel) {
      ch.push(F(ix, 0, 76, 3, P.acid, { r: 0 }));
      ch.push(F(ix + 4, 4, 68, 42, P.acidLo, { r: 6 }));
    }
    ch.push(T(tab.icon, ix + 4, 8, 68, 18, {
      size: 16, fill: sel ? P.acid : P.fg3, weight: sel ? 700 : 400, align: 'center',
    }));
    ch.push(T(tab.label, ix + 4, 30, 68, 12, {
      size: 8, fill: sel ? P.acid : P.fg3, weight: sel ? 700 : 400, align: 'center', ls: 0.3,
    }));
  });
  return F(0, 796, 390, 48, P.surface, { ch });
};

const StatusBar = () => F(0, 0, 390, 44, 'transparent', { ch: [
  T('9:41', 16, 14, 50, 16, { size: 12, fill: P.fg, weight: 600 }),
  T('▲  ◉  ●●●', 290, 14, 90, 16, { size: 10, fill: P.fg2, align: 'right' }),
]});

// Uptime sparkline bar chart
const Sparkline = (x, y, w, h, values, color) => {
  const bw = Math.floor(w / values.length) - 1;
  return F(x, y, w, h, 'transparent', {
    ch: values.map((v, i) => {
      const bh = Math.round(h * v);
      return F(i * (bw + 1), h - bh, bw, bh, color, { r: 1, opacity: 0.7 + v * 0.3 });
    }),
  });
};

// Endpoint row
const EndpointRow = (x, y, method, path_, latency, status, statusColor) => {
  const methodColors = { GET: P.acid, POST: P.blue, DELETE: P.red, PUT: P.amber };
  const mc = methodColors[method] || P.fg2;
  const statusW = status.length * 6.5 + 14;
  return F(x, y, 358, 56, 'transparent', { ch: [
    F(0, 14, method.length * 7 + 14, 20, mc + '20', { r: 4, ch: [
      T(method, 7, 3, method.length * 7, 14, { size: 8.5, fill: mc, weight: 800, ls: 0.5 }),
    ]}),
    T(path_, method.length * 7 + 22, 13, 180, 16, { size: 12, fill: P.fg, weight: 500 }),
    T(`${latency}ms`, 0, 34, 60, 14, { size: 10, fill: P.fg2 }),
    Pill(278 - statusW, 14, status, statusColor + '20', statusColor),
    Line(0, 55, 358),
  ]});
};

// ── Screen 1: Overview ─────────────────────────────────────────────────────────
function s1() {
  const ch = [];
  ch.push(F(0, 0, 390, 844, P.bg, {}));
  ch.push(StatusBar());

  // Header
  ch.push(T('WREN', 20, 54, 100, 18, { size: 11, fill: P.fg2, weight: 700, ls: 3 }));
  ch.push(T('OVERVIEW', 280, 54, 90, 18, { size: 9, fill: P.fg3, weight: 700, ls: 2, align: 'right' }));

  // BIG TYPE HERO — uptime as the design centerpiece (land-book "big type" trend)
  ch.push(T('99.97', 16, 86, 280, 96, { size: 88, fill: P.fg, weight: 900, ls: -4 }));
  ch.push(T('%', 298, 120, 50, 40, { size: 28, fill: P.fg2, weight: 300 }));
  ch.push(T('UPTIME · LAST 90 DAYS', 16, 182, 200, 14, { size: 9, fill: P.fg3, weight: 700, ls: 2 }));
  ch.push(Pill(16, 202, '● ALL SYSTEMS OPERATIONAL', P.acid + '18', P.acid));

  // 30-day sparkline strip
  ch.push(T('30 DAY UPTIME', 16, 232, 140, 12, { size: 8, fill: P.fg3, weight: 700, ls: 1.5 }));
  const sparkVals = [1,1,1,.98,1,1,.97,.95,1,1,1,1,.98,1,1,1,1,.96,1,1,1,1,1,.99,1,1,1,1,1,1];
  ch.push(Sparkline(16, 248, 358, 28, sparkVals, P.acid));

  // 4-metric grid
  const metrics = [
    { label: 'INCIDENTS', val: '2',       sub: 'last 30 days',  color: P.amber },
    { label: 'AVG LATENCY', val: '84ms',  sub: 'p50 global',    color: P.acid  },
    { label: 'ENDPOINTS', val: '47',      sub: '2 degraded',    color: P.fg    },
    { label: 'CHECKS/MIN', val: '840',    sub: '7 regions',     color: P.blue  },
  ];
  metrics.forEach((m, i) => {
    const mx = 16 + (i % 2) * 184;
    const my = 296 + Math.floor(i / 2) * 88;
    ch.push(F(mx, my, 174, 78, P.surface, { r: 8, stroke: P.border, ch: [
      T(m.label, 12, 10, 150, 11, { size: 8, fill: P.fg3, weight: 700, ls: 1.5 }),
      T(m.val,   12, 26, 150, 32, { size: 26, fill: m.color, weight: 800, ls: -0.5 }),
      T(m.sub,   12, 60, 150, 11, { size: 9, fill: P.fg2 }),
    ]}));
  });

  // Service status list
  ch.push(T('SERVICES', 16, 488, 100, 13, { size: 8, fill: P.fg3, weight: 700, ls: 1.5 }));
  ch.push(Line(16, 506, 358));

  const services = [
    { name: 'api.wren.dev',        latency: '62ms',  status: 'UP',       color: P.acid  },
    { name: 'auth.wren.dev',       latency: '44ms',  status: 'UP',       color: P.acid  },
    { name: 'cdn.wren.dev',        latency: '18ms',  status: 'UP',       color: P.acid  },
    { name: 'webhooks.wren.dev',   latency: '210ms', status: 'DEGRADED', color: P.amber },
    { name: 'jobs.wren.dev',       latency: '—',     status: 'DOWN',     color: P.red   },
  ];
  services.forEach((svc, i) => {
    const sy = 516 + i * 50;
    ch.push(StatusDot(16, sy + 10, svc.color));
    ch.push(T(svc.name, 34, sy + 6, 200, 14, { size: 12, fill: P.fg, weight: 500 }));
    ch.push(T(svc.latency, 34, sy + 22, 100, 12, { size: 10, fill: P.fg2 }));
    ch.push(Pill(290, sy + 4, svc.status, svc.color + '20', svc.color));
    if (i < services.length - 1) ch.push(Line(34, sy + 49, 340));
  });

  ch.push(NavBar(0));
  return F(0, 0, 390, 844, P.bg, { ch });
}

// ── Screen 2: Endpoints ────────────────────────────────────────────────────────
function s2() {
  const ch = [];
  ch.push(F(0, 0, 390, 844, P.bg, {}));
  ch.push(StatusBar());

  ch.push(T('WREN', 20, 54, 100, 18, { size: 11, fill: P.fg2, weight: 700, ls: 3 }));
  ch.push(T('ENDPOINTS', 240, 54, 130, 18, { size: 9, fill: P.fg3, weight: 700, ls: 2, align: 'right' }));

  // Search bar
  ch.push(F(16, 82, 310, 36, P.surface, { r: 8, stroke: P.border, ch: [
    T('⌕', 12, 8, 20, 20, { size: 16, fill: P.fg3 }),
    T('Filter endpoints…', 36, 10, 250, 16, { size: 12, fill: P.fg3 }),
  ]}));
  ch.push(F(332, 82, 42, 36, P.surface, { r: 8, stroke: P.border, ch: [
    T('≡', 11, 8, 20, 20, { size: 16, fill: P.fg2, align: 'center' }),
  ]}));

  // Filter pills
  const filters = ['ALL · 47', 'UP · 43', 'DEGRADED · 2', 'DOWN · 2'];
  let fx = 16;
  filters.forEach((f, i) => {
    const fw = f.length * 6.5 + 16;
    const active = i === 0;
    ch.push(F(fx, 128, fw, 22, active ? P.acidLo : P.surface, { r: 11, stroke: active ? P.acid : P.border, ch: [
      T(f, 8, 4, fw - 10, 14, { size: 8.5, fill: active ? P.acid : P.fg2, weight: 700, ls: 0.3 }),
    ]}));
    fx += fw + 8;
  });

  ch.push(Line(16, 162, 358));

  // Endpoint rows
  const endpoints = [
    { method: 'GET',    path: '/v2/users',            latency: '62',  status: 'UP',       sc: P.acid  },
    { method: 'GET',    path: '/v2/users/:id',         latency: '78',  status: 'UP',       sc: P.acid  },
    { method: 'POST',   path: '/v2/users/auth',        latency: '94',  status: 'UP',       sc: P.acid  },
    { method: 'POST',   path: '/v2/webhooks/dispatch', latency: '210', status: 'DEGRADED', sc: P.amber },
    { method: 'GET',    path: '/v2/analytics/events',  latency: '—',   status: 'DOWN',     sc: P.red   },
    { method: 'DELETE', path: '/v2/users/:id',         latency: '88',  status: 'UP',       sc: P.acid  },
    { method: 'PUT',    path: '/v2/settings',          latency: '55',  status: 'UP',       sc: P.acid  },
    { method: 'GET',    path: '/v2/jobs/queue',        latency: '—',   status: 'DOWN',     sc: P.red   },
    { method: 'POST',   path: '/v2/media/upload',      latency: '144', status: 'UP',       sc: P.acid  },
    { method: 'GET',    path: '/v2/billing/invoices',  latency: '101', status: 'UP',       sc: P.acid  },
  ];
  endpoints.forEach((ep, i) => {
    ch.push(EndpointRow(16, 168 + i * 58, ep.method, ep.path, ep.latency, ep.status, ep.sc));
  });

  ch.push(NavBar(1));
  return F(0, 0, 390, 844, P.bg, { ch });
}

// ── Screen 3: Incidents ────────────────────────────────────────────────────────
function s3() {
  const ch = [];
  ch.push(F(0, 0, 390, 844, P.bg, {}));
  ch.push(StatusBar());

  ch.push(T('WREN', 20, 54, 100, 18, { size: 11, fill: P.fg2, weight: 700, ls: 3 }));
  ch.push(T('INCIDENTS', 240, 54, 130, 18, { size: 9, fill: P.fg3, weight: 700, ls: 2, align: 'right' }));

  // Stats strip
  const iStats = [
    { label: 'OPEN',     val: '1', color: P.red   },
    { label: 'THIS WEEK', val: '2', color: P.amber },
    { label: 'THIS MONTH', val: '4', color: P.fg   },
    { label: 'MTTR',     val: '23m', color: P.acid },
  ];
  iStats.forEach((st, i) => {
    const sx = 16 + i * 90;
    ch.push(F(sx, 78, 82, 64, P.surface, { r: 8, stroke: P.border, ch: [
      T(st.label, 10, 9, 62, 11, { size: 7.5, fill: P.fg3, weight: 700, ls: 1.2 }),
      T(st.val,   10, 26, 62, 26, { size: 22, fill: st.color, weight: 800, ls: -0.5 }),
    ]}));
  });

  ch.push(T('ACTIVE', 16, 160, 100, 13, { size: 8, fill: P.red, weight: 700, ls: 1.5 }));
  ch.push(Line(16, 178, 358, P.border));

  // Active incident card
  ch.push(F(16, 184, 358, 108, P.redLo, { r: 10, stroke: P.red + '40', ch: [
    F(0, 0, 4, 108, P.red, { r: 2 }),
    T('ONGOING', 14, 11, 100, 13, { size: 8, fill: P.red, weight: 700, ls: 1.5 }),
    T('15m ago', 300, 11, 58, 13, { size: 9, fill: P.fg2, align: 'right' }),
    T('jobs.wren.dev — Service Down', 14, 29, 330, 18, { size: 14, fill: P.fg, weight: 700 }),
    T('Job queue worker unreachable across all 3 availability zones. Auto-failover triggered.', 14, 52, 330, 26, { size: 10, fill: P.fg2, lh: 1.5 }),
    T('Affected: /v2/jobs/*  · Region: us-east-1, eu-west-1, ap-south-1', 14, 82, 330, 13, { size: 9, fill: P.fg2 }),
  ]}));

  ch.push(T('RESOLVED', 16, 308, 100, 13, { size: 8, fill: P.fg3, weight: 700, ls: 1.5 }));
  ch.push(Line(16, 326, 358));

  const resolved = [
    {
      title: 'webhooks.wren.dev — High Latency',
      when:  '2 days ago · Resolved in 34m',
      desc:  'Webhook dispatch queue backed up due to downstream partner API timeout. Queuing system flushed.',
      affected: '3 endpoints · p95 latency exceeded 2s',
      color: P.amber,
    },
    {
      title: 'auth.wren.dev — Elevated Error Rate',
      when:  '6 days ago · Resolved in 12m',
      desc:  'JWT validation failures caused by clock skew after NTP resync. Config patch applied.',
      affected: '/v2/users/auth · 412 errors in 12m',
      color: P.amber,
    },
    {
      title: 'cdn.wren.dev — Partial Outage',
      when:  '14 days ago · Resolved in 8m',
      desc:  'Certificate renewal lag caused SSL errors in eu-west-2. Auto-renewed by ACME client.',
      affected: 'Static asset delivery · eu-west-2 only',
      color: P.fg3,
    },
  ];
  resolved.forEach((inc, i) => {
    const iy = 332 + i * 110;
    ch.push(F(16, iy, 358, 100, P.surface, { r: 10, stroke: P.border, ch: [
      F(0, 0, 4, 100, inc.color, { r: 2 }),
      T('RESOLVED', 14, 11, 100, 12, { size: 7.5, fill: inc.color, weight: 700, ls: 1.2 }),
      T(inc.when, 0, 11, 340, 12, { size: 9, fill: P.fg3, align: 'right' }),
      T(inc.title, 14, 28, 330, 16, { size: 12, fill: P.fg, weight: 600 }),
      T(inc.desc,  14, 50, 330, 24, { size: 9.5, fill: P.fg2, lh: 1.5 }),
      T(inc.affected, 14, 78, 330, 12, { size: 8.5, fill: P.fg3 }),
    ]}));
  });

  ch.push(NavBar(2));
  return F(0, 0, 390, 844, P.bg, { ch });
}

// ── Screen 4: Analytics ────────────────────────────────────────────────────────
function s4() {
  const ch = [];
  ch.push(F(0, 0, 390, 844, P.bg, {}));
  ch.push(StatusBar());

  ch.push(T('WREN', 20, 54, 100, 18, { size: 11, fill: P.fg2, weight: 700, ls: 3 }));
  ch.push(T('ANALYTICS', 236, 54, 134, 18, { size: 9, fill: P.fg3, weight: 700, ls: 2, align: 'right' }));

  // Time range
  const ranges = ['1H', '24H', '7D', '30D', '90D'];
  let rx = 16;
  ranges.forEach((r, i) => {
    const active = i === 2;
    ch.push(F(rx, 78, 52, 24, active ? P.acid : P.surface, { r: 6, stroke: active ? P.acid : P.border, ch: [
      T(r, 0, 4, 52, 16, { size: 9.5, fill: active ? P.bg : P.fg2, weight: 700, align: 'center' }),
    ]}));
    rx += 60;
  });

  // BIG latency hero (big type trend again)
  ch.push(T('LATENCY (P50)', 16, 116, 200, 13, { size: 8, fill: P.fg3, weight: 700, ls: 1.5 }));
  ch.push(T('84', 16, 134, 140, 72, { size: 66, fill: P.fg, weight: 900, ls: -3 }));
  ch.push(T('ms', 146, 172, 40, 22, { size: 16, fill: P.fg2, weight: 300 }));
  ch.push(T('p95: 218ms  ·  p99: 490ms', 16, 206, 240, 14, { size: 10, fill: P.fg2 }));
  ch.push(T('↓ 12% vs last 7 days', 16, 222, 200, 14, { size: 10, fill: P.acid }));

  // Request volume chart bars
  ch.push(T('REQUEST VOLUME · 7 DAY', 16, 250, 200, 13, { size: 8, fill: P.fg3, weight: 700, ls: 1.5 }));
  const dayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const dayVals   = [0.72, 0.88, 0.91, 0.85, 0.96, 0.44, 0.38];
  const BAR_AREA_H = 80;
  dayLabels.forEach((d, i) => {
    const bx = 16 + i * 52;
    const bh = Math.round(BAR_AREA_H * dayVals[i]);
    const isTod = i === 6;
    ch.push(F(bx, 272 + BAR_AREA_H - bh, 40, bh, isTod ? P.acid : P.surface2, { r: 4 }));
    if (isTod) ch.push(T('TODAY', bx, 372, 40, 11, { size: 7, fill: P.acid, weight: 700, align: 'center' }));
    else ch.push(T(d, bx, 358, 40, 11, { size: 7, fill: P.fg3, weight: 700, align: 'center' }));
    const reqK = Math.round(dayVals[i] * 2.4 * 10) / 10;
    ch.push(T(`${reqK}M`, bx, 344, 40, 12, { size: 8.5, fill: isTod ? P.acid : P.fg2, align: 'center' }));
  });
  ch.push(Line(16, 390, 358));

  // Error rate and apdex
  const bottomMetrics = [
    { label: 'ERROR RATE',   val: '0.08%', sub: '↓ 0.03% vs last week', color: P.acid },
    { label: 'APDEX SCORE',  val: '0.96',  sub: 'Excellent (>0.94)',     color: P.acid },
    { label: 'REQ / SECOND', val: '32.4',  sub: 'peak 88.1 req/s',       color: P.fg   },
    { label: 'SUCCESS RATE', val: '99.92%', sub: '2xx + 3xx responses',  color: P.acid },
  ];
  ch.push(T('7-DAY SUMMARY', 16, 400, 200, 13, { size: 8, fill: P.fg3, weight: 700, ls: 1.5 }));
  bottomMetrics.forEach((bm, i) => {
    const bmx = 16 + (i % 2) * 184;
    const bmy = 420 + Math.floor(i / 2) * 90;
    ch.push(F(bmx, bmy, 174, 80, P.surface, { r: 8, stroke: P.border, ch: [
      T(bm.label, 12, 10, 150, 11, { size: 7.5, fill: P.fg3, weight: 700, ls: 1.2 }),
      T(bm.val,   12, 26, 150, 30, { size: 24, fill: bm.color, weight: 800, ls: -0.5 }),
      T(bm.sub,   12, 60, 150, 12, { size: 9, fill: P.fg2 }),
    ]}));
  });

  // Status code breakdown
  ch.push(T('STATUS CODE BREAKDOWN · 24H', 16, 614, 250, 13, { size: 8, fill: P.fg3, weight: 700, ls: 1.5 }));
  const codes = [
    { code: '2xx', pct: 91, color: P.acid  },
    { code: '3xx', pct: 5,  color: P.blue  },
    { code: '4xx', pct: 3,  color: P.amber },
    { code: '5xx', pct: 1,  color: P.red   },
  ];
  let barX = 16;
  codes.forEach(c => {
    const bw = Math.round(358 * c.pct / 100) - 2;
    ch.push(F(barX, 634, bw, 16, c.color + 'CC', { r: 3 }));
    barX += bw + 2;
  });
  codes.forEach((c, i) => {
    const cx = 16 + i * 90;
    ch.push(F(cx, 660, 8, 8, c.color, { r: 4 }));
    ch.push(T(`${c.code}  ${c.pct}%`, cx + 12, 658, 70, 12, { size: 9.5, fill: P.fg2 }));
  });

  ch.push(NavBar(3));
  return F(0, 0, 390, 844, P.bg, { ch });
}

// ── Screen 5: Alerts ───────────────────────────────────────────────────────────
function s5() {
  const ch = [];
  ch.push(F(0, 0, 390, 844, P.bg, {}));
  ch.push(StatusBar());

  ch.push(T('WREN', 20, 54, 100, 18, { size: 11, fill: P.fg2, weight: 700, ls: 3 }));
  ch.push(T('ALERTS', 264, 54, 110, 18, { size: 9, fill: P.fg3, weight: 700, ls: 2, align: 'right' }));

  // Add alert button
  ch.push(F(288, 78, 86, 32, P.acidLo, { r: 8, stroke: P.acid, ch: [
    T('+ NEW RULE', 0, 7, 86, 18, { size: 9, fill: P.acid, weight: 700, ls: 0.5, align: 'center' }),
  ]}));

  ch.push(T('ALERT RULES', 16, 124, 200, 13, { size: 8, fill: P.fg3, weight: 700, ls: 1.5 }));
  ch.push(Line(16, 142, 358));

  // Alert rules
  const rules = [
    {
      name: 'Endpoint Down',
      cond: 'Any endpoint returns 0 checks successful',
      sev:  'CRITICAL', sevColor: P.red,
      channels: ['PagerDuty', 'Slack'],
      active: true,
    },
    {
      name: 'Latency Spike',
      cond: 'p95 latency > 500ms for 3 consecutive checks',
      sev:  'HIGH', sevColor: P.amber,
      channels: ['Slack', 'Email'],
      active: true,
    },
    {
      name: 'Error Rate Elevated',
      cond: '5xx error rate > 1% over 5 minute window',
      sev:  'HIGH', sevColor: P.amber,
      channels: ['Slack'],
      active: true,
    },
    {
      name: 'SSL Certificate Expiry',
      cond: 'TLS certificate expires in < 14 days',
      sev:  'MEDIUM', sevColor: P.blue,
      channels: ['Email'],
      active: false,
    },
    {
      name: 'Weekly Uptime Report',
      cond: 'Every Monday 09:00 — summary digest',
      sev:  'INFO', sevColor: P.fg2,
      channels: ['Email', 'Slack'],
      active: true,
    },
  ];

  rules.forEach((rule, i) => {
    const ry = 148 + i * 98;
    ch.push(F(16, ry, 358, 90, rule.active ? P.surface : P.bg, { r: 10, stroke: rule.active ? P.border : P.border, ch: [
      Pill(12, 11, rule.sev, rule.sevColor + '20', rule.sevColor),
      // Toggle
      F(308, 11, 38, 20, rule.active ? P.acidLo : P.surface2, { r: 10, stroke: rule.active ? P.acid : P.border2, ch: [
        F(rule.active ? 20 : 2, 2, 16, 16, rule.active ? P.acid : P.fg3, { r: 8 }),
      ]}),
      T(rule.name, 12, 36, 280, 16, { size: 12.5, fill: rule.active ? P.fg : P.fg3, weight: 600 }),
      T(rule.cond, 12, 56, 280, 13, { size: 9.5, fill: P.fg2 }),
      ...rule.channels.map((ch_, ci) =>
        F(rule.sev.length * 6.5 + 30 + ci * 64, 11, ch_.length * 6 + 14, 20, P.surface2, { r: 5, ch: [
          T(ch_, 7, 3, ch_.length * 6, 14, { size: 8.5, fill: P.fg2, weight: 500 }),
        ]})
      ),
    ]}));
  });

  // Notification channels
  ch.push(T('NOTIFICATION CHANNELS', 16, 650, 220, 13, { size: 8, fill: P.fg3, weight: 700, ls: 1.5 }));
  ch.push(Line(16, 668, 358));

  const channels = [
    { name: 'PagerDuty',  status: 'Connected', color: P.acid  },
    { name: 'Slack',      status: 'Connected', color: P.acid  },
    { name: 'Email',      status: 'Connected', color: P.acid  },
    { name: 'Webhook',    status: 'Not configured', color: P.fg3 },
  ];
  channels.forEach((c, i) => {
    const cy = 674 + i * 36;
    ch.push(StatusDot(16, cy + 9, c.color));
    ch.push(T(c.name,   34, cy + 5, 180, 14, { size: 12, fill: P.fg, weight: 500 }));
    ch.push(T(c.status, 0,  cy + 5, 376, 14, { size: 10, fill: c.color, align: 'right' }));
    if (i < channels.length - 1) ch.push(Line(34, cy + 35, 340));
  });

  ch.push(NavBar(4));
  return F(0, 0, 390, 844, P.bg, { ch });
}

// ── Assemble .pen ──────────────────────────────────────────────────────────────
const doc = {
  version: '2.8',
  width: 390, height: 844,
  background: P.bg,
  children: [s1(), s2(), s3(), s4(), s5()],
};

const OUT = path.join(__dirname, 'wren.pen');
fs.writeFileSync(OUT, JSON.stringify(doc, null, 2));
console.log('✓ wren.pen written —', fs.statSync(OUT).size, 'bytes');
