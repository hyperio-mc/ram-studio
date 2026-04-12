// datum-app.js  
// DATUM — Developer Observability Platform
//
// Challenge: Design a dark-mode observability platform where binary/hex strings
// serve as structural visual texture — directly inspired by Isidor.ai's pattern
// of using raw data strings ("000010001", "010100100") as section markers and
// decorative dividers, making the data itself the aesthetic language.
//
// Inspired by:
// 1. Isidor.ai (minimal.gallery SAAS, April 2026) — binary strings as structural
//    headings ("010100100") and visual dividers. Data IS the aesthetic.
//    Key insight: hex IDs and binary strips replace icons & illustrations entirely.
// 2. Factory.ai (minimal.gallery SAAS, April 2026) — terminal hero, uppercase
//    all-caps navigation, curl command as hero element, developer-first polish.
// 3. Letta (minimal.gallery SAAS, April 2026) — feature pills with ›
//    uppercase labels, minimal chrome, the runtime state as core value prop.
//
// Innovation: Ambient binary ticker strips at section boundaries (Isidor pattern),
// monospace hex timestamps as UI elements, electric cyan on deep navy-black,
// trace waterfall as the hero visualization (no illustrations), data IS design.
//
// Theme: DARK (last run Glade was LIGHT → this run DARK)
// Screens: 5 mobile (390×844)

'use strict';
const fs   = require('fs');
const path = require('path');

// ── Palette ────────────────────────────────────────────────────────────────────
const BG      = '#060910';   // deepest navy-black
const S1      = '#0C1020';   // card surface
const S2      = '#131828';   // elevated card
const S3      = '#1A2035';   // subtle raised / divider bg
const TEXT    = '#DCE8FF';   // cool near-white
const MUTED   = '#4E5F80';   // muted blue-grey
const MUTED2  = '#222D45';   // track / empty fills
const CYAN    = '#00CFFF';   // primary accent — electric cyan
const GREEN   = '#00E676';   // success / healthy
const AMBER   = '#FFB300';   // warning / slow
const RED     = '#FF3D57';   // error / critical
const INDIGO  = '#7C6FFF';   // info / scheduled
const BORDER  = '#181F33';   // card borders

// ── Binary texture strings (Isidor.ai pattern) ────────────────────────────────
const BINS = [
  '0110 0100 0110 0001 0111 0100 0111 0101 0110 1101 0010 0000',
  '1011 0110 0010 0001 0110 1111 0110 1101 0111 0000 0010 0000',
  '0100 0100 0110 0001 0111 0100 0110 0001 0010 0000 0100 1101',
  '0110 1111 0110 1101 0010 0000 0100 1110 0111 0101 0110 1100',
  '1010 0001 0110 1100 0110 0001 0111 1001 0110 0101 0111 0010',
];

// ── Primitives ─────────────────────────────────────────────────────────────────
function R(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, width: w, height: h, fill,
    radius:     opts.radius     ?? 0,
    opacity:    opts.opacity    ?? 1,
    ...(opts.stroke ? { stroke: opts.stroke, strokeWidth: opts.sw ?? 1 } : {}),
  };
}
function T(x, y, content, opts = {}) {
  return {
    type: 'text', content: String(content), x, y,
    fontSize:      opts.size    ?? 13,
    fontWeight:    opts.weight  ?? 'regular',
    color:         opts.color   ?? TEXT,
    align:         opts.align   ?? 'left',
    fontFamily:    opts.mono    ? 'Courier New' : 'Inter',
    opacity:       opts.opacity ?? 1,
    ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  };
}
function C(cx, cy, r, fill, opts = {}) {
  return { type: 'circle', cx, cy, r, fill, opacity: opts.opacity ?? 1 };
}
function L(x1, y1, x2, y2, color = BORDER, w = 1) {
  return { type: 'line', x1, y1, x2, y2, stroke: color, strokeWidth: w };
}

// ── Shared ─────────────────────────────────────────────────────────────────────
function statusBar(els, W) {
  els.push(T(22, 16, '9:41', { size: 12, weight: 'semibold', color: MUTED }));
  els.push(T(W - 70, 16, '▣▣ ↑ ▰▰▰', { size: 10, color: MUTED }));
}

// Isidor.ai binary strip
function binStrip(els, y, W, idx, opacity = 0.11) {
  els.push(T(0, y, BINS[idx % BINS.length], {
    size: 7.5, color: CYAN, mono: true, opacity,
  }));
}

function bottomNav(els, W, H, active) {
  const navH = 78;
  els.push(R(0, H - navH, W, navH, S1));
  els.push(L(0, H - navH, W, H - navH, BORDER));
  const items = [
    { icon: '◈', label: 'Overview' },
    { icon: '⬡', label: 'Traces'   },
    { icon: '◎', label: 'Logs'     },
    { icon: '▦', label: 'Metrics'  },
    { icon: '⊹', label: 'Alerts'   },
  ];
  items.forEach((item, i) => {
    const nx = 39 + i * 78;
    const isActive = i === active;
    const ic = isActive ? CYAN  : MUTED2;
    const tc = isActive ? CYAN  : MUTED;
    els.push(T(nx, H - navH + 16, item.icon, { size: 17, color: ic, align: 'center' }));
    els.push(T(nx, H - navH + 40, item.label, { size: 8.5, color: tc, align: 'center', ls: 0.2 }));
    if (isActive) els.push(R(nx - 16, H - navH, 32, 2, CYAN, { radius: 1 }));
  });
}

// ── SCREEN 1: Overview ─────────────────────────────────────────────────────────
function screenOverview() {
  const W = 390, H = 844;
  const els = [];
  els.push(R(0, 0, W, H, BG));

  binStrip(els, 44, W, 0, 0.10);
  binStrip(els, 52, W, 1, 0.06);
  statusBar(els, W);

  // Header
  els.push(T(24, 70, 'DATUM', { size: 24, weight: 'bold', ls: 4 }));
  els.push(T(24, 98, 'OVERVIEW', { size: 9, color: CYAN, ls: 5, weight: 'semibold' }));
  // Live pulse
  els.push(C(W - 48, 82, 5, GREEN));
  els.push(C(W - 48, 82, 10, GREEN, { opacity: 0.2 }));
  els.push(T(W - 36, 78, 'LIVE', { size: 9, color: GREEN, ls: 1.5, weight: 'semibold' }));

  // Hero metric card — error rate
  els.push(R(24, 116, W - 48, 96, S1, { radius: 16, stroke: BORDER, sw: 1 }));
  els.push(T(40, 130, '0x01 · ERROR RATE · 24H', { size: 7.5, color: MUTED, mono: true }));
  els.push(T(40, 168, '0.04', { size: 42, weight: 'bold', mono: true }));
  els.push(T(136, 174, '%', { size: 22, color: MUTED }));
  els.push(T(40, 196, 'p99 latency  841ms', { size: 10, color: MUTED }));
  // sparkline (12 bars)
  const eSpk = [0.02, 0.03, 0.04, 0.02, 0.03, 0.02, 0.04, 0.02, 0.03, 0.05, 0.04, 0.04];
  eSpk.forEach((v, i) => {
    const bh = Math.max(4, (v / 0.05) * 44);
    const bc = v > 0.04 ? AMBER : CYAN;
    els.push(R(W - 126 + i * 9, 202 - bh, 6, bh, bc, { radius: 2, opacity: 0.75 }));
  });

  // Hex section label (Isidor pattern)
  binStrip(els, 224, W, 2, 0.09);
  els.push(T(24, 234, 'SERVICES', { size: 9, weight: 'bold', color: MUTED, ls: 2 }));

  const svcs = [
    { name: 'api-gateway',     err: '0.02%', lat: '18ms',  s: GREEN },
    { name: 'auth-service',    err: '0.00%', lat: '9ms',   s: GREEN },
    { name: 'payments-worker', err: '0.31%', lat: '241ms', s: AMBER },
    { name: 'search-indexer',  err: '2.14%', lat: '894ms', s: RED   },
    { name: 'webhook-fanout',  err: '0.08%', lat: '44ms',  s: GREEN },
    { name: 'notification-svc',err: '0.00%', lat: '11ms',  s: GREEN },
  ];
  svcs.forEach((svc, i) => {
    const col = i % 2 === 0 ? 0 : 1;
    const row = Math.floor(i / 2);
    const cx = 24 + col * (W / 2 - 12);
    const cy = 252 + row * 62;
    const cw = W / 2 - 36;
    els.push(R(cx, cy, cw, 52, S1, { radius: 11, stroke: BORDER, sw: 1 }));
    els.push(C(cx + 14, cy + 13, 4, svc.s));
    if (svc.s === RED) els.push(C(cx + 14, cy + 13, 9, RED, { opacity: 0.18 }));
    els.push(T(cx + 25, cy + 8, svc.name, { size: 9.5, weight: 'semibold' }));
    els.push(T(cx + 12, cy + 30, svc.err, { size: 13, weight: 'bold', color: svc.s, mono: true }));
    els.push(T(cx + cw - 12, cy + 30, svc.lat, { size: 11, color: MUTED, align: 'right', mono: true }));
  });

  // Active alert banner
  els.push(R(24, 440, W - 48, 44, RED + '18', { radius: 12, stroke: RED + '40', sw: 1 }));
  els.push(C(40, 462, 5, RED));
  els.push(C(40, 462, 9, RED, { opacity: 0.25 }));
  els.push(T(56, 455, 'ALERT · search-indexer p99 > 800ms', { size: 11, weight: 'semibold' }));
  els.push(T(56, 470, 'Triggered 8 min ago', { size: 9, color: RED }));
  els.push(T(W - 38, 458, '›', { size: 18, color: RED }));

  // Throughput row
  binStrip(els, 494, W, 3, 0.09);
  const tCards = [
    { label: 'REQUESTS',  value: '4.2M',  sub: 'last hour',    color: CYAN   },
    { label: 'P99 LAT',   value: '841ms', sub: 'all services',  color: AMBER  },
    { label: 'APDEX',     value: '0.93',  sub: 'target: 0.95', color: GREEN  },
  ];
  tCards.forEach((c, i) => {
    const tx = 24 + i * 118;
    els.push(R(tx, 502, 110, 64, S1, { radius: 11, stroke: BORDER, sw: 1 }));
    els.push(T(tx + 10, tx === 24 ? 514 : 514, c.label, { size: 7.5, color: MUTED, ls: 1.2, weight: 'bold' }));
    els.push(T(tx + 10, 514, c.label, { size: 7.5, color: MUTED, ls: 1.2, weight: 'bold' }));
    els.push(T(tx + 10, 536, c.value, { size: 18, weight: 'bold', color: c.color, mono: true }));
    els.push(T(tx + 10, 552, c.sub, { size: 8, color: MUTED }));
  });

  // Recent traces
  els.push(T(24, 580, 'RECENT TRACES', { size: 9, weight: 'bold', color: MUTED, ls: 2 }));
  const traces = [
    { id: '0xa3f1', op: 'POST /api/checkout', dur: '341ms', s: GREEN },
    { id: '0xb8c2', op: 'GET /api/search?q=…', dur: '894ms', s: RED   },
    { id: '0xc914', op: 'PUT /api/user/prefs', dur: '62ms',  s: GREEN },
    { id: '0xd047', op: 'POST /webhooks/stripe', dur: '188ms', s: GREEN },
  ];
  traces.forEach((tr, i) => {
    const ty = 596 + i * 36;
    els.push(R(24, ty, W - 48, 30, S1, { radius: 8, stroke: BORDER, sw: 1 }));
    els.push(C(40, ty + 15, 3, tr.s));
    els.push(T(52, ty + 8, tr.id, { size: 9, color: MUTED, mono: true }));
    els.push(T(112, ty + 8, tr.op, { size: 10, weight: 'semibold' }));
    els.push(T(W - 40, ty + 8, tr.dur, { size: 10, color: tr.s, align: 'right', mono: true }));
  });

  // hex timestamp footer
  els.push(T(24, 740, '0x' + Math.floor(Date.now() / 1000).toString(16).toUpperCase() + ' · UNIX', {
    size: 8, color: MUTED, mono: true, opacity: 0.4,
  }));

  bottomNav(els, W, H, 0);
  return { name: 'Overview', width: W, height: H, backgroundColor: BG, layers: els };
}

// ── SCREEN 2: Trace Waterfall ──────────────────────────────────────────────────
function screenTraces() {
  const W = 390, H = 844;
  const els = [];
  els.push(R(0, 0, W, H, BG));

  binStrip(els, 44, W, 4, 0.10);
  binStrip(els, 52, W, 0, 0.06);
  statusBar(els, W);

  els.push(T(24, 70, 'TRACES', { size: 22, weight: 'bold', ls: 2 }));
  els.push(T(24, 96, '0x02 · DISTRIBUTED TRACE', { size: 7.5, color: MUTED, mono: true }));

  // Trace header card
  els.push(R(24, 110, W - 48, 72, S1, { radius: 14, stroke: BORDER, sw: 1 }));
  els.push(T(40, 122, 'TRACE ID', { size: 7.5, color: MUTED, ls: 1.5, weight: 'bold' }));
  els.push(T(40, 138, '0xb8c2d3e4f5a6b7c8', { size: 13, weight: 'bold', mono: true, color: CYAN }));
  els.push(T(40, 160, 'POST /api/search · 894ms total', { size: 10, color: MUTED }));
  els.push(R(W - 80, 148, 52, 18, RED + '20', { radius: 9 }));
  els.push(T(W - 74, 151, 'SLOW', { size: 9, weight: 'bold', color: RED, ls: 0.5 }));

  // Waterfall chart
  binStrip(els, 192, W, 1, 0.09);
  els.push(T(24, 202, '0x03 · SPAN WATERFALL', { size: 7.5, color: MUTED, mono: true }));

  // Time ruler
  const rulerY = 218;
  els.push(L(40, rulerY, W - 24, rulerY, MUTED2));
  ['0ms', '200ms', '400ms', '600ms', '800ms'].forEach((t, i) => {
    const rx = 40 + i * ((W - 64) / 4);
    els.push(L(rx, rulerY - 3, rx, rulerY + 3, MUTED2));
    els.push(T(rx, rulerY - 12, t, { size: 7.5, color: MUTED, align: 'center', mono: true }));
  });

  const CHART_X = 40;
  const CHART_W = W - 64;
  const TOTAL_MS = 894;

  const spans = [
    { name: 'api-gateway',       start: 0,   dur: 894, color: CYAN,   err: false, depth: 0 },
    { name: '  auth.verify',     start: 2,   dur: 8,   color: GREEN,  err: false, depth: 1 },
    { name: '  search.query',    start: 12,  dur: 870, color: RED,    err: false, depth: 1 },
    { name: '    es.search',     start: 14,  dur: 862, color: RED,    err: false, depth: 2 },
    { name: '      es.shard[0]', start: 16,  dur: 420, color: AMBER,  err: false, depth: 3 },
    { name: '      es.shard[1]', start: 16,  dur: 856, color: RED,    err: true,  depth: 3 },
    { name: '  cache.set',       start: 884, dur: 8,   color: GREEN,  err: false, depth: 1 },
  ];

  spans.forEach((sp, i) => {
    const rowY = 234 + i * 42;
    // Label
    els.push(T(24, rowY + 6, sp.name.trimStart(), {
      size: 8.5, color: sp.err ? RED : TEXT, mono: true,
      opacity: sp.depth === 3 ? 0.8 : 1,
    }));
    // Bar
    const bx = CHART_X + (sp.start / TOTAL_MS) * CHART_W;
    const bw = Math.max(4, (sp.dur / TOTAL_MS) * CHART_W);
    const barY = rowY + 18;
    els.push(R(bx, barY, bw, 14, sp.color + (sp.err ? 'DD' : '66'), { radius: 3 }));
    if (sp.err) {
      els.push(R(bx, barY, bw, 14, 'none', { radius: 3, stroke: RED, sw: 1 }));
    }
    // Duration label
    els.push(T(Math.min(bx + bw + 4, W - 60), barY + 2, sp.dur + 'ms', {
      size: 7.5, color: sp.color, mono: true,
    }));
  });

  // Span details
  binStrip(els, 534, W, 2, 0.09);
  els.push(T(24, 544, '0x04 · SLOW SPAN DETAILS', { size: 7.5, color: MUTED, mono: true }));
  els.push(R(24, 558, W - 48, 84, S1, { radius: 12, stroke: RED + '44', sw: 1 }));
  els.push(R(24, 558, 3, 84, RED, { radius: 1.5 }));
  els.push(T(38, 568, 'es.shard[1]', { size: 13, weight: 'bold', color: RED }));
  els.push(T(W - 40, 568, '856ms', { size: 13, weight: 'bold', color: RED, align: 'right', mono: true }));
  const spDetails = [
    { k: 'index',   v: 'products-v3'       },
    { k: 'query',   v: '{"match":{"sku":…}}' },
    { k: 'shards',  v: '5 / 5 primary'    },
    { k: 'status',  v: 'TIMEOUT (800ms)'  },
  ];
  spDetails.forEach((d, i) => {
    els.push(T(38, 586 + i * 14, d.k, { size: 9, color: MUTED }));
    els.push(T(100, 586 + i * 14, d.v, { size: 9, color: i === 3 ? RED : TEXT, mono: true }));
  });

  // Similar traces
  els.push(T(24, 652, 'SIMILAR TRACES', { size: 9, weight: 'bold', color: MUTED, ls: 2 }));
  const sim = [
    { id: '0xc231', dur: '788ms', s: AMBER },
    { id: '0xd882', dur: '1.2s',  s: RED   },
    { id: '0xef14', dur: '902ms', s: RED   },
    { id: '0x1fab', dur: '644ms', s: AMBER },
  ];
  sim.forEach((s, i) => {
    const sx = 24 + i * 88;
    const sw2 = 80;
    els.push(R(sx, 668, sw2, 36, S1, { radius: 10, stroke: BORDER, sw: 1 }));
    els.push(T(sx + 8, 676, s.id, { size: 8, color: MUTED, mono: true }));
    els.push(T(sx + 8, 690, s.dur, { size: 11, weight: 'bold', color: s.s, mono: true }));
  });

  bottomNav(els, W, H, 1);
  return { name: 'Traces', width: W, height: H, backgroundColor: BG, layers: els };
}

// ── SCREEN 3: Log Stream ───────────────────────────────────────────────────────
function screenLogs() {
  const W = 390, H = 844;
  const els = [];
  els.push(R(0, 0, W, H, BG));

  binStrip(els, 44, W, 3, 0.10);
  binStrip(els, 52, W, 4, 0.06);
  statusBar(els, W);

  els.push(T(24, 70, 'LOGS', { size: 22, weight: 'bold', ls: 2 }));
  els.push(T(24, 96, '0x05 · LIVE LOG STREAM', { size: 7.5, color: MUTED, mono: true }));

  // Search bar
  els.push(R(24, 110, W - 48, 38, S1, { radius: 10, stroke: BORDER, sw: 1 }));
  els.push(T(38, 122, '⌕', { size: 14, color: MUTED }));
  els.push(T(60, 123, 'service:search-indexer level:error', { size: 10, color: MUTED }));
  els.push(R(W - 58, 118, 30, 22, CYAN + '20', { radius: 11 }));
  els.push(T(W - 52, 121, 'LIVE', { size: 8, weight: 'bold', color: CYAN, ls: 0.3 }));

  // Level filters
  const levels = ['ALL', 'ERROR', 'WARN', 'INFO', 'DEBUG'];
  let lfx = 24;
  levels.forEach((l, i) => {
    const isActive = l === 'ERROR';
    const lc = l === 'ERROR' ? RED : l === 'WARN' ? AMBER : l === 'DEBUG' ? INDIGO : CYAN;
    const fw2 = l.length * 7 + 16;
    els.push(R(lfx, 158, fw2, 22, isActive ? lc + '22' : S1, { radius: 11, stroke: isActive ? lc : BORDER, sw: 1 }));
    els.push(T(lfx + fw2 / 2, 163, l, { size: 9, color: isActive ? lc : MUTED, align: 'center', weight: isActive ? 'semibold' : 'regular', ls: 0.3 }));
    lfx += fw2 + 8;
  });

  // Log entries
  binStrip(els, 190, W, 0, 0.09);

  const logEntries = [
    { ts: '09:41:03.441', level: 'ERROR', svc: 'search',  msg: 'elasticsearch timeout after 800ms',        col: RED   },
    { ts: '09:41:03.439', level: 'ERROR', svc: 'search',  msg: 'shard [1] unresponsive, retry 3/3',        col: RED   },
    { ts: '09:41:03.101', level: 'WARN',  svc: 'search',  msg: 'p99 latency threshold exceeded: 756ms',   col: AMBER },
    { ts: '09:41:02.887', level: 'ERROR', svc: 'search',  msg: 'query planner fallback to full scan',      col: RED   },
    { ts: '09:41:02.211', level: 'INFO',  svc: 'gateway', msg: 'circuit breaker OPEN for search-indexer', col: CYAN  },
    { ts: '09:41:01.994', level: 'WARN',  svc: 'search',  msg: 'slow shard detected: shard[1] 640ms',     col: AMBER },
    { ts: '09:41:01.003', level: 'INFO',  svc: 'gateway', msg: 'POST /api/search routed to search-v3',    col: CYAN  },
    { ts: '09:41:00.881', level: 'ERROR', svc: 'search',  msg: 'connection pool exhausted (limit: 50)',   col: RED   },
    { ts: '09:40:59.002', level: 'WARN',  svc: 'search',  msg: 'replica shard lag: +2.4s',                col: AMBER },
    { ts: '09:40:58.441', level: 'INFO',  svc: 'auth',    msg: 'jwt verified: user:u9f3 scope:read',      col: MUTED },
    { ts: '09:40:57.334', level: 'DEBUG', svc: 'cache',   msg: 'cache miss for key: srch:q8x1',           col: INDIGO },
    { ts: '09:40:56.100', level: 'INFO',  svc: 'gateway', msg: 'health check OK for all upstreams',       col: MUTED },
  ];

  logEntries.forEach((log, i) => {
    const ly = 198 + i * 44;
    const levelW = log.level.length * 5.5 + 12;
    // row bg for errors
    if (log.level === 'ERROR') {
      els.push(R(24, ly, W - 48, 38, RED + '08', { radius: 8 }));
    }
    // timestamp
    els.push(T(28, ly + 4, log.ts, { size: 7.5, color: MUTED, mono: true }));
    // level badge
    els.push(R(28, ly + 18, levelW, 14, log.col + '22', { radius: 7 }));
    els.push(T(28 + levelW / 2, ly + 21, log.level, { size: 7, weight: 'bold', color: log.col, align: 'center', ls: 0.3 }));
    // service
    els.push(T(28 + levelW + 8, ly + 20, log.svc, { size: 8.5, color: INDIGO, weight: 'semibold' }));
    // message
    const msgX = 28 + levelW + 8 + (log.svc.length * 5.5) + 8;
    els.push(T(28, ly + 34, log.msg, { size: 9, color: log.level === 'INFO' ? MUTED : TEXT, opacity: log.level === 'DEBUG' ? 0.6 : 1 }));
  });

  bottomNav(els, W, H, 2);
  return { name: 'Logs', width: W, height: H, backgroundColor: BG, layers: els };
}

// ── SCREEN 4: Metrics ──────────────────────────────────────────────────────────
function screenMetrics() {
  const W = 390, H = 844;
  const els = [];
  els.push(R(0, 0, W, H, BG));

  binStrip(els, 44, W, 2, 0.10);
  binStrip(els, 52, W, 3, 0.06);
  statusBar(els, W);

  els.push(T(24, 70, 'METRICS', { size: 22, weight: 'bold', ls: 2 }));
  els.push(T(24, 96, '0x06 · PERFORMANCE DASHBOARD', { size: 7.5, color: MUTED, mono: true }));

  // Period selector
  const periods = ['1H', '6H', '24H', '7D'];
  periods.forEach((p, i) => {
    const isActive = p === '24H';
    els.push(R(24 + i * 90, 110, 82, 26, isActive ? CYAN + '18' : S1, {
      radius: 13, stroke: isActive ? CYAN : BORDER, sw: 1,
    }));
    els.push(T(24 + i * 90 + 41, 116, p, {
      size: 11, color: isActive ? CYAN : MUTED, align: 'center',
      weight: isActive ? 'semibold' : 'regular',
    }));
  });

  // Request rate chart
  els.push(R(24, 148, W - 48, 118, S1, { radius: 14, stroke: BORDER, sw: 1 }));
  els.push(T(40, 162, '0x07 · REQUESTS / MIN', { size: 7.5, color: MUTED, mono: true }));
  els.push(T(40, 180, '4,218', { size: 22, weight: 'bold', color: CYAN, mono: true }));
  els.push(T(134, 184, 'req/min', { size: 10, color: MUTED }));
  els.push(R(W - 80, 172, 52, 18, GREEN + '20', { radius: 9 }));
  els.push(T(W - 74, 175, '+3.2%', { size: 9, weight: 'bold', color: GREEN }));

  // Area chart simulation (bars with gradient effect)
  const chartX2 = 40, chartY2 = 200, cW2 = W - 80, cH2 = 54;
  const reqVals = [3800, 4100, 3950, 4200, 4218, 4180, 4050, 4300, 4218, 4100, 3900, 4218, 4400, 4218, 4100, 4300, 4218, 4050, 4200, 4218, 4300, 4218, 4100, 4000];
  const bW2 = (cW2 - 4) / reqVals.length;
  reqVals.forEach((v, i) => {
    const norm = (v - 3800) / 600;
    const bh2 = Math.max(3, norm * cH2);
    const isLast = i === reqVals.length - 1;
    els.push(R(chartX2 + 2 + i * bW2, chartY2 + cH2 - bh2, bW2 - 1, bh2, isLast ? CYAN : CYAN + '55', { radius: 1 }));
  });
  els.push(L(chartX2, chartY2 + cH2, chartX2 + cW2, chartY2 + cH2, BORDER));

  // Error rate + latency charts side-by-side
  binStrip(els, 278, W, 1, 0.09);

  // Error rate card
  els.push(R(24, 286, (W - 56) / 2, 118, S1, { radius: 14, stroke: BORDER, sw: 1 }));
  els.push(T(40, 300, '0x08 · ERR RATE', { size: 7.5, color: MUTED, mono: true }));
  els.push(T(40, 318, '0.04', { size: 22, weight: 'bold', color: AMBER, mono: true }));
  els.push(T(40, 340, '%', { size: 10, color: MUTED }));
  const errBars = [0.02, 0.03, 0.02, 0.04, 0.05, 0.04, 0.03, 0.04, 0.03, 0.02, 0.04, 0.04];
  errBars.forEach((v, i) => {
    const bh3 = Math.max(3, (v / 0.05) * 36);
    const ec = v > 0.04 ? RED : AMBER;
    els.push(R(40 + i * 12, 390 - bh3, 9, bh3, ec, { radius: 2, opacity: 0.8 }));
  });

  // Latency card
  const lx = 24 + (W - 56) / 2 + 8;
  els.push(R(lx, 286, (W - 56) / 2, 118, S1, { radius: 14, stroke: BORDER, sw: 1 }));
  els.push(T(lx + 16, 300, '0x09 · P99 LAT', { size: 7.5, color: MUTED, mono: true }));
  els.push(T(lx + 16, 318, '841', { size: 22, weight: 'bold', color: RED, mono: true }));
  els.push(T(lx + 66, 322, 'ms', { size: 10, color: MUTED }));
  const latBars2 = [120, 180, 140, 200, 320, 841, 620, 400, 280, 200, 180, 841];
  latBars2.forEach((v, i) => {
    const bh4 = Math.max(3, (v / 841) * 36);
    const lc2 = v > 400 ? RED : v > 200 ? AMBER : CYAN;
    els.push(R(lx + 16 + i * 12, 390 - bh4, 9, bh4, lc2, { radius: 2, opacity: 0.8 }));
  });

  // Percentile table
  els.push(R(24, 416, W - 48, 122, S1, { radius: 14, stroke: BORDER, sw: 1 }));
  els.push(T(40, 430, '0x0A · LATENCY PERCENTILES', { size: 7.5, color: MUTED, mono: true }));
  els.push(L(40, 444, W - 40, 444, MUTED2));

  const percs = [
    { p: 'p50', ms: 18,  bar: 0.02 },
    { p: 'p75', ms: 44,  bar: 0.05 },
    { p: 'p90', ms: 134, bar: 0.16 },
    { p: 'p95', ms: 312, bar: 0.37 },
    { p: 'p99', ms: 841, bar: 1.00 },
    { p: 'p999',ms: 2100,bar: 1.00 },
  ];
  percs.forEach((p2, i) => {
    const py = 452 + i * 14;
    const pc = p2.ms > 800 ? RED : p2.ms > 200 ? AMBER : CYAN;
    els.push(T(40, py, p2.p, { size: 9, color: MUTED, mono: true }));
    els.push(R(82, py - 2, (W - 152) * p2.bar, 10, pc, { radius: 5, opacity: 0.75 }));
    els.push(T(W - 42, py, p2.ms + 'ms', { size: 9, color: pc, align: 'right', mono: true }));
  });

  // Throughput by service
  binStrip(els, 548, W, 4, 0.09);
  els.push(T(24, 558, '0x0B · THROUGHPUT BY SERVICE', { size: 7.5, color: MUTED, mono: true }));
  const svcTh = [
    { name: 'api-gateway',  rps: 4218, pct: 100, col: CYAN  },
    { name: 'auth-service', rps: 4210, pct: 99,  col: CYAN  },
    { name: 'search',       rps: 1840, pct: 44,  col: AMBER },
    { name: 'payments',     rps: 382,  pct: 9,   col: GREEN },
  ];
  svcTh.forEach((s2, i) => {
    const sy2 = 570 + i * 32;
    els.push(T(24, sy2, s2.name, { size: 10, color: TEXT }));
    els.push(T(W - 40, sy2, s2.rps + '/m', { size: 10, color: s2.col, align: 'right', mono: true }));
    els.push(R(24, sy2 + 14, W - 48, 7, MUTED2, { radius: 4 }));
    els.push(R(24, sy2 + 14, (W - 48) * s2.pct / 100, 7, s2.col, { radius: 4, opacity: 0.8 }));
  });

  bottomNav(els, W, H, 3);
  return { name: 'Metrics', width: W, height: H, backgroundColor: BG, layers: els };
}

// ── SCREEN 5: Alerts ───────────────────────────────────────────────────────────
function screenAlerts() {
  const W = 390, H = 844;
  const els = [];
  els.push(R(0, 0, W, H, BG));

  binStrip(els, 44, W, 1, 0.10);
  binStrip(els, 52, W, 2, 0.06);
  statusBar(els, W);

  els.push(T(24, 70, 'ALERTS', { size: 22, weight: 'bold', ls: 2 }));
  els.push(T(24, 96, '0x0C · POLICY ENGINE', { size: 7.5, color: MUTED, mono: true }));

  // Active alert count
  els.push(R(24, 110, W - 48, 54, RED + '14', { radius: 14, stroke: RED + '35', sw: 1 }));
  els.push(C(44, 137, 5, RED));
  els.push(C(44, 137, 10, RED, { opacity: 0.2 }));
  els.push(T(62, 126, '3 active alerts', { size: 15, weight: 'bold' }));
  els.push(T(62, 146, '2 critical · 1 warning · 0 info', { size: 10, color: RED }));
  els.push(T(W - 40, 128, '›', { size: 18, color: RED }));

  // Active alert cards
  binStrip(els, 172, W, 0, 0.09);
  els.push(T(24, 182, 'FIRING', { size: 9, weight: 'bold', color: MUTED, ls: 2 }));

  const active = [
    {
      name: 'search_p99_latency',
      svc: 'search-indexer',
      cond: 'p99 > 800ms for 5min',
      val: '841ms',
      age: '8m',
      color: RED,
      sev: 'CRIT',
    },
    {
      name: 'search_error_rate',
      svc: 'search-indexer',
      cond: 'error_rate > 1% for 3min',
      val: '2.14%',
      age: '6m',
      color: RED,
      sev: 'CRIT',
    },
    {
      name: 'payments_latency',
      svc: 'payments-worker',
      cond: 'p95 > 200ms for 10min',
      val: '241ms',
      age: '22m',
      color: AMBER,
      sev: 'WARN',
    },
  ];

  active.forEach((a, i) => {
    const ay = 198 + i * 102;
    els.push(R(24, ay, W - 48, 90, S1, {
      radius: 12,
      stroke: a.color + '50',
      sw: 1,
    }));
    els.push(R(24, ay, 3, 90, a.color, { radius: 1.5 }));
    // sev badge
    const bw2 = a.sev.length * 6 + 14;
    els.push(R(W - 40 - bw2, ay + 8, bw2, 16, a.color + '25', { radius: 8 }));
    els.push(T(W - 40 - bw2 + bw2 / 2, ay + 11, a.sev, { size: 8, weight: 'bold', color: a.color, align: 'center', ls: 0.5 }));
    // name
    els.push(T(38, ay + 10, a.name, { size: 11, weight: 'bold', mono: true, color: TEXT }));
    // service
    els.push(T(38, ay + 28, a.svc, { size: 9.5, color: INDIGO }));
    els.push(L(38, ay + 44, W - 38, ay + 44, MUTED2));
    // condition
    els.push(T(38, ay + 54, 'IF  ' + a.cond, { size: 9, color: MUTED, mono: true }));
    // value + age
    els.push(T(38, ay + 70, '→   ' + a.val, { size: 10, weight: 'bold', color: a.color, mono: true }));
    els.push(T(W - 40, ay + 70, a.age + ' ago', { size: 9, color: MUTED, align: 'right' }));
  });

  // Rule list
  binStrip(els, 506, W, 3, 0.09);
  els.push(T(24, 516, 'ALL RULES', { size: 9, weight: 'bold', color: MUTED, ls: 2 }));

  const rules = [
    { name: 'search_p99_latency', on: true,  color: CYAN  },
    { name: 'search_error_rate',  on: true,  color: CYAN  },
    { name: 'payments_latency',   on: true,  color: CYAN  },
    { name: 'apdex_score_low',    on: true,  color: CYAN  },
    { name: 'api_5xx_burst',      on: false, color: MUTED },
    { name: 'db_conn_pool',       on: true,  color: CYAN  },
  ];
  rules.forEach((r, i) => {
    const ry = 532 + i * 34;
    els.push(R(24, ry, W - 48, 28, S1, { radius: 8, stroke: BORDER, sw: 1 }));
    els.push(T(38, ry + 8, r.name, { size: 10, mono: true, color: r.on ? TEXT : MUTED }));
    // toggle
    const on = r.on;
    els.push(R(W - 68, ry + 6, 36, 18, on ? CYAN + '30' : MUTED2, { radius: 9 }));
    els.push(C(W - 68 + (on ? 26 : 10), ry + 15, 6, on ? CYAN : MUTED));
  });

  // CTA
  els.push(R(24, 742, W - 48, 50, CYAN, { radius: 25 }));
  els.push(T(W / 2, 761, 'Create Alert Rule', { size: 15, weight: 'bold', color: BG, align: 'center' }));

  bottomNav(els, W, H, 4);
  return { name: 'Alerts', width: W, height: H, backgroundColor: BG, layers: els };
}

// ── Assemble ───────────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'DATUM',
  description: [
    'DARK. Developer observability platform — distributed tracing, log aggregation,',
    'real-time metrics. Binary/hex strings as structural visual texture (Isidor.ai',
    'data-as-decoration pattern). Electric cyan #00CFFF on deep navy-black #060910.',
    'Waterfall trace diagram as hero visualization. Hex-coded section labels.',
    'Inspired by: Isidor.ai (minimal.gallery SAAS Apr 2026) — binary strings as',
    'structural language; Factory.ai (terminal-first dev aesthetics); Letta (minimal',
    'chrome, uppercase pills, state as core value).',
  ].join(' '),
  theme: 'dark',
  screens: [
    screenOverview(),
    screenTraces(),
    screenLogs(),
    screenMetrics(),
    screenAlerts(),
  ],
};

const outPath = path.join(__dirname, 'datum.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
console.log(`✓ datum.pen — ${kb} KB`);
console.log(`  Screens: ${pen.screens.map(s => s.name).join(', ')}`);
