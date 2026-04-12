'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG    = 'orion';
const NAME    = 'ORION';
const TAGLINE = 'See every signal. Miss nothing.';
const HB      = 44;
const DATE    = new Date().toISOString().split('T')[0];
const W = 390, H = 844;

// ── Palette: Deep Space Dark ─────────────────────────────────────────────────
const BG       = '#080B10';
const SURF     = '#0D1117';
const CARD     = '#141B24';
const CARD2    = '#1A2333';
const ACC      = '#0ED9C7';   // bioluminescent teal
const ACC2     = '#F4A228';   // amber / warning
const RED      = '#F43F5E';   // critical
const GRN      = '#10B981';   // healthy green
const CYAN     = '#22D3EE';   // info blue
const TEXT     = '#E2E8F0';
const TEXT2    = '#94A3B8';
const BORDER   = 'rgba(255,255,255,0.07)';
const TEAL_DIM = 'rgba(14,217,199,0.12)';
const AMBR_DIM = 'rgba(244,162,40,0.13)';
const RED_DIM  = 'rgba(244,63,94,0.12)';
const GRN_DIM  = 'rgba(16,185,129,0.12)';

let elCount = 0;

// ── Primitives ───────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, o = {}) {
  elCount++;
  const e = { type: 'rect', x, y, w, h, fill };
  if (o.rx !== undefined)     e.rx          = o.rx;
  if (o.opacity !== undefined) e.opacity    = o.opacity;
  if (o.stroke !== undefined) { e.stroke = o.stroke; e.strokeWidth = o.sw || 1; }
  return e;
}
function text(x, y, content, size, fill, o = {}) {
  elCount++;
  const e = { type: 'text', x, y, content: String(content), size, fill };
  if (o.fw     !== undefined) e.fw     = o.fw;
  if (o.font   !== undefined) e.font   = o.font;
  if (o.anchor !== undefined) e.anchor = o.anchor;
  if (o.opacity !== undefined) e.opacity = o.opacity;
  if (o.ls     !== undefined) e.ls     = o.ls;
  return e;
}
function circle(cx, cy, r, fill, o = {}) {
  elCount++;
  const e = { type: 'circle', cx, cy, r, fill };
  if (o.opacity !== undefined) e.opacity = o.opacity;
  if (o.stroke !== undefined) { e.stroke = o.stroke; e.strokeWidth = o.sw || 1; }
  return e;
}
function line(x1, y1, x2, y2, stroke, o = {}) {
  elCount++;
  return { type: 'line', x1, y1, x2, y2, stroke,
           strokeWidth: o.sw || 1, opacity: o.opacity || 1 };
}

// ── Reusable widgets ─────────────────────────────────────────────────────────
function statusBar(el) {
  el.push(rect(0, 0, W, 44, BG));
  el.push(text(20, 29, '9:41', 13, TEXT, { fw: 600 }));
  el.push(text(W - 20, 29, '▲ 100%', 11, TEXT2, { anchor: 'end' }));
  el.push(text(W - 68, 29, '●●●', 10, TEXT2, { anchor: 'end' }));
}

function bottomNav(el, active) {
  const tabs  = ['Mission', 'Services', 'Alerts', 'Metrics', 'Deploy'];
  const icons = ['◈', '⊞', '△', '〰', '↑'];
  el.push(rect(0, H - 84, W, 84, SURF));
  el.push(line(0, H - 84, W, H - 84, BORDER, { sw: 0.5 }));
  tabs.forEach((label, i) => {
    const x = (W / tabs.length) * i + (W / tabs.length) / 2;
    const on = i === active;
    const col = on ? ACC : TEXT2;
    if (on) el.push(rect(x - 22, H - 84, 44, 2, ACC, { rx: 1 }));
    el.push(text(x, H - 53, icons[i], 18, col, { anchor: 'middle' }));
    el.push(text(x, H - 31, label, 9, col, { anchor: 'middle', fw: on ? 600 : 400 }));
  });
}

// Mini sparkline from array of heights (0-30)
function sparkline(el, x, y, hs, col) {
  hs.forEach((h, i) => {
    el.push(rect(x + i * 3.2, y - h, 2.2, h, col, { rx: 0.5, opacity: 0.75 }));
  });
}

// Pill badge
function badge(el, x, y, label, bgCol, textCol) {
  el.push(rect(x, y, label.length * 6.4 + 12, 18, bgCol, { rx: 9 }));
  el.push(text(x + label.length * 3.2 + 6, y + 13, label, 9, textCol || '#000', { anchor: 'middle', fw: 700 }));
}

// Status dot
function dot(el, cx, cy, col) {
  el.push(circle(cx, cy, 5, col, { opacity: 0.9 }));
  el.push(circle(cx, cy, 5, col, { opacity: 0.2, stroke: col, sw: 4 }));
}

// Section label
function sectionLabel(el, x, y, label) {
  el.push(text(x, y, label, 9, TEXT2, { fw: 600, ls: 0.1 }));
}

// ── Screen 1 — Mission Control ───────────────────────────────────────────────
function screen1() {
  const el = [];
  el.push(rect(0, 0, W, H, BG));

  // Ambient teal glow top
  el.push(rect(W/2 - 80, 44, 160, 3, ACC, { rx: 1, opacity: 0.35 }));

  statusBar(el);

  // Header
  el.push(text(20, 74, '◈ ORION', 20, ACC, { fw: 700, font: 'mono' }));
  dot(el, W - 30, 68, GRN);
  el.push(text(W - 44, 74, 'All systems', 11, TEXT2, { anchor: 'end' }));

  // System health card
  el.push(rect(16, 86, W - 32, 58, CARD, { rx: 13 }));
  el.push(rect(16, 86, W - 32, 58, GRN_DIM, { rx: 13 }));
  el.push(text(32, 107, 'SYSTEM HEALTH', 9, TEXT2, { fw: 600, ls: 0.08 }));
  el.push(text(32, 132, '99.97%', 22, GRN, { fw: 700, font: 'mono' }));
  el.push(text(120, 132, 'uptime · 30 days', 11, TEXT2));
  el.push(rect(W - 110, 104, 82, 6, 'rgba(255,255,255,0.1)', { rx: 3 }));
  el.push(rect(W - 110, 104, 80, 6, GRN, { rx: 3 }));

  // 3 key metrics
  const mY = 154, mW = (W - 48) / 3;
  const kpis = [
    { label: 'SERVICES', val: '23', sub: 'Online', col: ACC },
    { label: 'INCIDENTS', val: '2', sub: 'Active', col: ACC2 },
    { label: 'DEPLOYS', val: '14', sub: 'Today', col: TEXT },
  ];
  kpis.forEach((k, i) => {
    const kx = 16 + i * (mW + 8);
    el.push(rect(kx, mY, mW, 74, CARD, { rx: 10 }));
    el.push(text(kx + mW/2, mY + 20, k.label, 8, TEXT2, { anchor: 'middle', ls: 0.07 }));
    el.push(text(kx + mW/2, mY + 50, k.val, 26, k.col, { fw: 700, anchor: 'middle', font: 'mono' }));
    el.push(text(kx + mW/2, mY + 66, k.sub, 9, TEXT2, { anchor: 'middle' }));
  });

  // Service health list
  sectionLabel(el, 20, 248, 'SERVICE HEALTH');
  el.push(text(W - 20, 248, 'p99 latency', 9, TEXT2, { anchor: 'end' }));
  el.push(line(20, 254, W - 20, 254, BORDER, { sw: 0.5 }));

  const svcs = [
    { name: 'api-gateway',  pct: 98, ms: '42',  col: GRN },
    { name: 'auth-service', pct: 100, ms: '8',  col: GRN },
    { name: 'payment-svc',  pct: 87, ms: '213', col: ACC2 },
    { name: 'db-primary',   pct: 100, ms: '3',  col: GRN },
    { name: 'cache-layer',  pct: 42, ms: '891', col: RED },
  ];
  svcs.forEach((s, i) => {
    const sy = 262 + i * 46;
    el.push(rect(20, sy, W - 40, 38, CARD, { rx: 8 }));
    dot(el, 38, sy + 19, s.col);
    el.push(text(52, sy + 24, s.name, 12, TEXT, { font: 'mono', fw: 500 }));
    // mini bar
    el.push(rect(W - 20 - 70 - 54, sy + 22, 54, 4, 'rgba(255,255,255,0.08)', { rx: 2 }));
    el.push(rect(W - 20 - 70 - 54, sy + 22, 54 * s.pct / 100, 4, s.col, { rx: 2 }));
    el.push(text(W - 76, sy + 15, s.ms + 'ms', 11, s.col, { anchor: 'end', font: 'mono', fw: 600 }));
    el.push(text(W - 76, sy + 31, s.pct + '%', 9, TEXT2, { anchor: 'end' }));
  });

  // Active incidents
  sectionLabel(el, 20, 500, 'ACTIVE INCIDENTS');
  const incs = [
    { sev: 'P2', svc: 'cache-layer',  msg: 'High memory pressure — 94%', age: '23m', col: RED,  bg: RED_DIM },
    { sev: 'P3', svc: 'payment-svc',  msg: 'Elevated error rate 4.2%',    age: '1h',  col: ACC2, bg: AMBR_DIM },
  ];
  incs.forEach((inc, i) => {
    const iy = 514 + i * 58;
    el.push(rect(20, iy, W - 40, 50, CARD, { rx: 10 }));
    el.push(rect(20, iy, W - 40, 50, inc.bg, { rx: 10 }));
    el.push(rect(20, iy, 3, 50, inc.col, { rx: 1 }));
    badge(el, 30, iy + 16, inc.sev, inc.col, '#fff');
    el.push(text(68, iy + 26, inc.svc, 11, TEXT, { fw: 600, font: 'mono' }));
    el.push(text(68, iy + 41, inc.msg, 10, TEXT2));
    el.push(text(W - 32, iy + 26, inc.age, 10, TEXT2, { anchor: 'end' }));
  });

  // Recent deploy
  sectionLabel(el, 20, 636, 'LAST DEPLOY');
  el.push(rect(20, 650, W - 40, 44, CARD, { rx: 9 }));
  el.push(text(36, 668, 'api-gateway', 12, TEXT, { font: 'mono', fw: 600 }));
  el.push(text(36, 683, 'v2.14.1  •  3 min ago', 10, TEXT2));
  badge(el, W - 80, 659, 'LIVE', GRN, '#fff');

  bottomNav(el, 0);
  return el;
}

// ── Screen 2 — Services Bento Grid ───────────────────────────────────────────
function screen2() {
  const el = [];
  el.push(rect(0, 0, W, H, BG));
  statusBar(el);

  el.push(text(20, 74, 'Services', 22, TEXT, { fw: 700 }));
  el.push(text(20, 94, '23 online  ·  1 degraded  ·  1 critical', 11, TEXT2));

  // ── Bento row 1: full-width hero card (api-gateway)
  el.push(rect(16, 108, W - 32, 100, CARD, { rx: 14 }));
  el.push(rect(16, 108, 4, 100, GRN, { rx: 2 }));
  dot(el, W - 30, 126, GRN);
  el.push(text(36, 130, 'api-gateway', 14, TEXT, { fw: 600, font: 'mono' }));
  el.push(text(36, 148, 'Load balancer  ·  4 replicas  ·  us-east-1', 10, TEXT2));
  el.push(text(W - 46, 148, '99.9%', 12, GRN, { anchor: 'end', fw: 700 }));
  // sparkline
  sparkline(el, W - 100, 196, [14,16,12,18,20,15,13,19,17,21,16,14,20,22,18,24,19,17,21,18], GRN);
  el.push(text(36, 175, 'p99: 42ms', 10, TEXT2));
  el.push(text(36, 196, '12,847 req/s', 12, ACC, { fw: 600, font: 'mono' }));

  // ── Bento row 2: two columns
  const r2y = 218, r2h = 106, r2w = (W - 40) / 2;
  // auth-service (healthy)
  el.push(rect(16, r2y, r2w, r2h, CARD, { rx: 12 }));
  el.push(rect(16, r2y, 3, r2h, GRN, { rx: 1 }));
  el.push(text(28, r2y + 22, 'auth-svc', 12, TEXT, { fw: 600, font: 'mono' }));
  el.push(text(28, r2y + 38, 'JWT · OAuth2', 9, TEXT2));
  el.push(text(28, r2y + 74, '8ms', 24, GRN, { fw: 700, font: 'mono' }));
  el.push(text(28, r2y + 94, 'p99 latency', 9, TEXT2));
  dot(el, 16 + r2w - 18, r2y + 18, GRN);
  // payment-svc (degraded)
  const rx2 = 16 + r2w + 8;
  el.push(rect(rx2, r2y, r2w, r2h, CARD, { rx: 12 }));
  el.push(rect(rx2, r2y, 3, r2h, ACC2, { rx: 1 }));
  el.push(text(rx2 + 12, r2y + 22, 'payment-svc', 11, TEXT, { fw: 600, font: 'mono' }));
  el.push(text(rx2 + 12, r2y + 38, 'Stripe · Braintree', 9, TEXT2));
  el.push(text(rx2 + 12, r2y + 74, '213ms', 20, ACC2, { fw: 700, font: 'mono' }));
  badge(el, rx2 + 12, r2y + 88, 'DEGRADED', ACC2, '#000');
  dot(el, rx2 + r2w - 16, r2y + 18, ACC2);

  // ── Bento row 3: three small cards
  const r3y = r2y + r2h + 8, r3h = 88, r3w = (W - 48) / 3;
  const small = [
    { name: 'db-primary', sub: 'Postgres 15', val: '3ms',   col: GRN  },
    { name: 'cache',      sub: 'Redis 7.2',   val: '891ms', col: RED  },
    { name: 'cdn',        sub: 'Cloudflare',  val: '28ms',  col: GRN  },
  ];
  small.forEach((c, i) => {
    const cx = 16 + i * (r3w + 8);
    el.push(rect(cx, r3y, r3w, r3h, CARD, { rx: 10 }));
    el.push(rect(cx, r3y, r3w, 3, c.col, { rx: 2 }));
    el.push(text(cx + r3w/2, r3y + 22, c.name, 9, TEXT2, { anchor: 'middle', font: 'mono' }));
    el.push(text(cx + r3w/2, r3y + 50, c.val, 14, c.col, { fw: 700, anchor: 'middle', font: 'mono' }));
    el.push(text(cx + r3w/2, r3y + 66, c.sub, 8, TEXT2, { anchor: 'middle' }));
    dot(el, cx + r3w - 14, r3y + 18, c.col);
  });

  // ── Bento row 4: two medium cards
  const r4y = r3y + r3h + 8, r4h = 88;
  el.push(rect(16, r4y, r2w, r4h, CARD, { rx: 12 }));
  el.push(rect(16, r4y, 3, r4h, GRN, { rx: 1 }));
  el.push(text(28, r4y + 22, 'worker-pool', 11, TEXT, { fw: 600, font: 'mono' }));
  el.push(text(28, r4y + 38, '8 / 8 healthy', 10, GRN));
  el.push(text(28, r4y + 66, '1.2K/s', 16, ACC, { fw: 600, font: 'mono' }));
  el.push(text(28, r4y + 84, 'throughput', 9, TEXT2));

  el.push(rect(rx2, r4y, r2w, r4h, CARD, { rx: 12 }));
  el.push(rect(rx2, r4y, 3, r4h, GRN, { rx: 1 }));
  el.push(text(rx2 + 12, r4y + 22, 'notif-svc', 11, TEXT, { fw: 600, font: 'mono' }));
  el.push(text(rx2 + 12, r4y + 38, 'Twilio · SMTP', 9, TEXT2));
  el.push(text(rx2 + 12, r4y + 66, '4.7K', 16, ACC, { fw: 600, font: 'mono' }));
  el.push(text(rx2 + 12, r4y + 84, 'events/hr', 9, TEXT2));

  // ── Row 5: wide single
  const r5y = r4y + r4h + 8;
  el.push(rect(16, r5y, W - 32, 58, CARD, { rx: 12 }));
  el.push(rect(16, r5y, 3, 58, ACC, { rx: 1 }));
  el.push(text(30, r5y + 20, 'search-index', 12, TEXT, { fw: 600, font: 'mono' }));
  el.push(text(30, r5y + 38, 'Elasticsearch 8  ·  3 nodes', 10, TEXT2));
  el.push(text(W - 36, r5y + 20, '11ms', 14, ACC, { fw: 700, font: 'mono', anchor: 'end' }));
  el.push(text(W - 36, r5y + 38, 'avg query', 9, TEXT2, { anchor: 'end' }));
  dot(el, W - 20, r5y + 28, GRN);

  bottomNav(el, 1);
  return el;
}

// ── Screen 3 — Alert Feed ────────────────────────────────────────────────────
function screen3() {
  const el = [];
  el.push(rect(0, 0, W, H, BG));
  statusBar(el);

  el.push(text(20, 74, 'Alerts', 22, TEXT, { fw: 700 }));
  // filter chips
  const chips = [
    { label: 'All',      active: true  },
    { label: 'Firing',   active: false },
    { label: 'Resolved', active: false },
    { label: 'P1/P2',   active: false },
  ];
  let cx = 20;
  chips.forEach(c => {
    const w = c.label.length * 7.5 + 20;
    el.push(rect(cx, 84, w, 24, c.active ? ACC : CARD, { rx: 12 }));
    el.push(text(cx + w/2, 100, c.label, 10, c.active ? '#000' : TEXT2, { anchor: 'middle', fw: c.active ? 700 : 400 }));
    cx += w + 8;
  });

  const alerts = [
    { sev: 'P1', svc: 'cache-layer',  msg: 'OOMKilled — container restarting', time: '2m',  status: 'FIRING',   col: RED,  bg: RED_DIM },
    { sev: 'P2', svc: 'cache-layer',  msg: 'Memory usage > 90% for 5 min',    time: '23m', status: 'FIRING',   col: RED,  bg: RED_DIM },
    { sev: 'P3', svc: 'payment-svc',  msg: 'Error rate exceeded 4% threshold', time: '1h',  status: 'FIRING',   col: ACC2, bg: AMBR_DIM },
    { sev: 'P3', svc: 'api-gateway',  msg: 'Latency p99 spike to 340ms',      time: '2h',  status: 'RESOLVED', col: TEXT2, bg: 'transparent' },
    { sev: 'P2', svc: 'auth-service', msg: 'JWT rotation lag > 30s',           time: '3h',  status: 'RESOLVED', col: TEXT2, bg: 'transparent' },
    { sev: 'P4', svc: 'notif-svc',    msg: 'Email queue depth > 5K',           time: '4h',  status: 'RESOLVED', col: TEXT2, bg: 'transparent' },
    { sev: 'P3', svc: 'db-primary',   msg: 'Slow query > 2s detected',         time: '6h',  status: 'RESOLVED', col: TEXT2, bg: 'transparent' },
    { sev: 'P2', svc: 'search-index', msg: 'Replica shard unassigned',         time: '8h',  status: 'RESOLVED', col: TEXT2, bg: 'transparent' },
  ];

  sectionLabel(el, 20, 124, 'RECENT · 24 HOURS');
  el.push(line(20, 130, W - 20, 130, BORDER, { sw: 0.5 }));

  alerts.forEach((a, i) => {
    const ay = 136 + i * 64;
    if (ay + 56 > H - 90) return;
    el.push(rect(16, ay, W - 32, 56, CARD, { rx: 10 }));
    if (a.bg !== 'transparent') el.push(rect(16, ay, W - 32, 56, a.bg, { rx: 10 }));
    el.push(rect(16, ay, 3, 56, a.col, { rx: 1 }));
    badge(el, 28, ay + 10, a.sev, a.col, a.col === TEXT2 ? '#000' : '#fff');
    el.push(text(70, ay + 23, a.svc, 11, a.status === 'FIRING' ? TEXT : TEXT2, { fw: 600, font: 'mono' }));
    el.push(text(70, ay + 40, a.msg, 10, TEXT2));
    el.push(text(W - 32, ay + 23, a.time + ' ago', 10, TEXT2, { anchor: 'end' }));
    const statusCol = a.status === 'FIRING' ? a.col : TEXT2;
    el.push(text(W - 32, ay + 40, a.status, 9, statusCol, { anchor: 'end', fw: 600 }));
  });

  bottomNav(el, 2);
  return el;
}

// ── Screen 4 — Metrics Explorer ─────────────────────────────────────────────
function screen4() {
  const el = [];
  el.push(rect(0, 0, W, H, BG));
  statusBar(el);

  el.push(text(20, 74, 'Metrics', 22, TEXT, { fw: 700 }));
  el.push(text(20, 94, 'api-gateway  ·  last 6 hours', 11, TEXT2));

  // Time range selector
  const ranges = ['1h', '6h', '24h', '7d'];
  let rx = 20;
  ranges.forEach(r => {
    const active = r === '6h';
    el.push(rect(rx, 104, 36, 22, active ? ACC : CARD, { rx: 11 }));
    el.push(text(rx + 18, 119, r, 10, active ? '#000' : TEXT2, { anchor: 'middle', fw: active ? 700 : 400 }));
    rx += 44;
  });

  // Chart 1 — Latency p99
  const c1y = 136;
  el.push(rect(16, c1y, W - 32, 148, CARD, { rx: 12 }));
  el.push(text(32, c1y + 22, 'Latency p99 (ms)', 11, TEXT, { fw: 600 }));
  el.push(text(32, c1y + 38, 'Current:', 9, TEXT2));
  el.push(text(80, c1y + 38, '42ms', 11, ACC, { fw: 700, font: 'mono' }));
  el.push(text(W - 32, c1y + 38, '↓ 18% vs 24h ago', 10, GRN, { anchor: 'end' }));
  // Chart axes
  el.push(line(36, c1y + 50, 36, c1y + 136, BORDER, { sw: 0.5 }));
  el.push(line(36, c1y + 136, W - 32, c1y + 136, BORDER, { sw: 0.5 }));
  // Grid lines
  [0.25, 0.5, 0.75].forEach(f => {
    const gy = c1y + 50 + (c1y + 136 - c1y - 50) * (1 - f);
    el.push(line(36, gy, W - 32, gy, BORDER, { sw: 0.3 }));
  });
  // Y labels
  el.push(text(32, c1y + 136, '0', 8, TEXT2, { anchor: 'end' }));
  el.push(text(32, c1y + 93, '250', 8, TEXT2, { anchor: 'end' }));
  el.push(text(32, c1y + 54, '500', 8, TEXT2, { anchor: 'end' }));
  // Line chart data (latency)
  const latData = [180,160,145,200,240,185,155,130,110,125,140,120,95,88,75,80,68,55,48,42,50,45,42,38];
  const chartW2 = W - 32 - 36 - 8;
  const chartH2 = 86;
  const chartX2 = 44;
  const chartBaseY = c1y + 136;
  const maxLat = 280;
  // Draw line path as segments
  for (let j = 0; j < latData.length - 1; j++) {
    const x1 = chartX2 + j * chartW2 / (latData.length - 1);
    const x2 = chartX2 + (j + 1) * chartW2 / (latData.length - 1);
    const y1 = chartBaseY - (latData[j] / maxLat) * chartH2;
    const y2 = chartBaseY - (latData[j + 1] / maxLat) * chartH2;
    el.push(line(x1, y1, x2, y2, ACC, { sw: 1.8 }));
  }
  // Fill area
  for (let j = 0; j < latData.length; j++) {
    const lx = chartX2 + j * chartW2 / (latData.length - 1);
    const ly = chartBaseY - (latData[j] / maxLat) * chartH2;
    el.push(line(lx, ly, lx, chartBaseY - 1, ACC, { sw: 1.5, opacity: 0.08 + j * 0.002 }));
  }

  // Chart 2 — Error Rate
  const c2y = c1y + 158;
  el.push(rect(16, c2y, W - 32, 130, CARD, { rx: 12 }));
  el.push(text(32, c2y + 22, 'Error Rate (%)', 11, TEXT, { fw: 600 }));
  el.push(text(32, c2y + 38, 'Current:', 9, TEXT2));
  el.push(text(80, c2y + 38, '0.12%', 11, GRN, { fw: 700, font: 'mono' }));
  el.push(text(W - 32, c2y + 38, '↓ 63% vs peak', 10, GRN, { anchor: 'end' }));
  el.push(line(36, c2y + 50, 36, c2y + 118, BORDER, { sw: 0.5 }));
  el.push(line(36, c2y + 118, W - 32, c2y + 118, BORDER, { sw: 0.5 }));
  const errData = [0.1,0.15,0.12,0.9,4.2,3.8,2.1,1.4,0.8,0.5,0.3,0.2,0.15,0.1,0.12,0.11,0.10,0.12,0.10,0.11,0.12,0.10,0.11,0.12];
  const maxErr = 5;
  const ch2H = 68;
  const ch2BaseY = c2y + 118;
  for (let j = 0; j < errData.length - 1; j++) {
    const x1 = chartX2 + j * chartW2 / (errData.length - 1);
    const x2 = chartX2 + (j + 1) * chartW2 / (errData.length - 1);
    const y1 = ch2BaseY - (errData[j] / maxErr) * ch2H;
    const y2 = ch2BaseY - (errData[j + 1] / maxErr) * ch2H;
    const col = errData[j] > 1 ? RED : ACC2;
    el.push(line(x1, y1, x2, y2, col, { sw: 1.8 }));
  }

  // Chart 3 — Throughput sparkline
  const c3y = c2y + 140;
  el.push(rect(16, c3y, W - 32, 86, CARD, { rx: 12 }));
  el.push(text(32, c3y + 20, 'Throughput (req/s)', 11, TEXT, { fw: 600 }));
  el.push(text(32, c3y + 38, '12,847', 14, CYAN, { fw: 700, font: 'mono' }));
  el.push(text(100, c3y + 38, 'current', 10, TEXT2));
  // Bar chart style throughput
  const thruData = [8200,9100,8600,9800,11200,10400,9600,11800,12100,11400,12400,12847,12700,12900,12847,12600,12800,12847,12750,12847];
  thruData.forEach((v, i) => {
    const bx = 36 + i * ((W - 32 - 36 - 4) / thruData.length);
    const bh = (v / 14000) * 40;
    el.push(rect(bx, c3y + 78 - bh, (W - 32 - 36 - 4) / thruData.length - 2, bh, CYAN, { rx: 1, opacity: 0.5 + (i / thruData.length) * 0.5 }));
  });

  bottomNav(el, 3);
  return el;
}

// ── Screen 5 — Deployments ───────────────────────────────────────────────────
function screen5() {
  const el = [];
  el.push(rect(0, 0, W, H, BG));
  statusBar(el);

  el.push(text(20, 74, 'Deployments', 22, TEXT, { fw: 700 }));
  el.push(text(20, 94, '14 today  ·  6 this week', 11, TEXT2));

  // Stats row
  const stats = [
    { label: 'Success rate', val: '92%', col: GRN },
    { label: 'Avg duration', val: '4m 12s', col: ACC },
    { label: 'Rollbacks',    val: '1',    col: RED },
  ];
  const sw = (W - 48) / 3;
  stats.forEach((s, i) => {
    const sx = 16 + i * (sw + 8);
    el.push(rect(sx, 106, sw, 56, CARD, { rx: 10 }));
    el.push(text(sx + sw/2, sx < W/2 ? 124 : 124, s.label, 8, TEXT2, { anchor: 'middle' }));
    el.push(text(sx + sw/2, 148, s.val, 14, s.col, { fw: 700, anchor: 'middle', font: 'mono' }));
  });

  sectionLabel(el, 20, 178, 'RECENT DEPLOYS');
  el.push(line(20, 184, W - 20, 184, BORDER, { sw: 0.5 }));

  const deploys = [
    { svc: 'api-gateway',   ver: 'v2.14.1', hash: 'a3f9e2b', who: 'mia.k',     dur: '3m 48s', status: 'LIVE',    col: GRN,  ago: '3m' },
    { svc: 'auth-service',  ver: 'v1.8.3',  hash: '7c2d5a1', who: 'dev-bot',   dur: '2m 12s', status: 'LIVE',    col: GRN,  ago: '28m' },
    { svc: 'search-index',  ver: 'v3.1.0',  hash: 'e8b4f3c', who: 'tom.r',     dur: '6m 02s', status: 'LIVE',    col: GRN,  ago: '1h' },
    { svc: 'payment-svc',   ver: 'v4.2.0',  hash: '9d1a8e5', who: 'ci/cd',     dur: '4m 55s', status: 'DEGRADED',col: ACC2, ago: '2h' },
    { svc: 'worker-pool',   ver: 'v2.7.1',  hash: 'f6c3b2a', who: 'dev-bot',   dur: '1m 38s', status: 'LIVE',    col: GRN,  ago: '3h' },
    { svc: 'db-migrations', ver: 'v0.52',   hash: 'b2e9d7c', who: 'sam.l',     dur: '8m 21s', status: 'LIVE',    col: GRN,  ago: '4h' },
    { svc: 'cache-layer',   ver: 'v1.3.2',  hash: 'c8a5f1e', who: 'ci/cd',     dur: '1m 59s', status: 'ROLLED BACK', col: RED, ago: '5h' },
  ];

  deploys.forEach((d, i) => {
    const dy = 190 + i * 72;
    if (dy + 64 > H - 90) return;
    el.push(rect(16, dy, W - 32, 64, CARD, { rx: 10 }));
    el.push(rect(16, dy, 3, 64, d.col, { rx: 1 }));
    // Service + version
    el.push(text(32, dy + 22, d.svc, 12, TEXT, { fw: 600, font: 'mono' }));
    el.push(text(32 + d.svc.length * 7.5 + 8, dy + 22, d.ver, 11, TEXT2, { font: 'mono' }));
    // Hash + who + duration
    el.push(text(32, dy + 40, d.hash, 10, ACC, { font: 'mono' }));
    el.push(text(96, dy + 40, 'by ' + d.who, 10, TEXT2));
    el.push(text(W - 32, dy + 40, d.dur, 10, TEXT2, { anchor: 'end', font: 'mono' }));
    // Status + time
    el.push(text(W - 32, dy + 22, d.ago + ' ago', 10, TEXT2, { anchor: 'end' }));
    badge(el, W - 32 - d.status.length * 6 - 24, dy + 50, d.status, d.col === RED ? RED_DIM : (d.col === ACC2 ? AMBR_DIM : GRN_DIM), d.col);
  });

  bottomNav(el, 4);
  return el;
}

// ── Screen 6 — On-Call ──────────────────────────────────────────────────────
function screen6() {
  const el = [];
  el.push(rect(0, 0, W, H, BG));
  statusBar(el);

  el.push(text(20, 74, 'On-Call', 22, TEXT, { fw: 700 }));
  el.push(text(20, 94, 'Week 15  ·  April 7 – 13', 11, TEXT2));

  // Primary on-call card
  el.push(rect(16, 108, W - 32, 112, CARD, { rx: 14 }));
  el.push(rect(16, 108, W - 32, 112, TEAL_DIM, { rx: 14 }));
  el.push(rect(16, 108, W - 32, 3, ACC, { rx: 2 }));

  el.push(text(32, 132, 'PRIMARY ON-CALL', 9, ACC, { fw: 700, ls: 0.08 }));
  // Avatar circle
  el.push(circle(52, 172, 22, CARD2));
  el.push(circle(52, 172, 22, ACC, { stroke: ACC, sw: 2, opacity: 0 }));
  el.push(text(52, 178, 'MK', 13, ACC, { anchor: 'middle', fw: 700 }));
  el.push(text(86, 160, 'Mia Kim', 14, TEXT, { fw: 600 }));
  el.push(text(86, 178, 'Platform Engineering', 11, TEXT2));
  el.push(text(86, 196, '📱 +1 (415) 555-0124', 10, TEXT2));

  // Escalation chain
  sectionLabel(el, 20, 236, 'ESCALATION CHAIN');
  el.push(line(20, 242, W - 20, 242, BORDER, { sw: 0.5 }));

  const chain = [
    { lvl: 'L1', name: 'Mia Kim',     role: 'Primary',    wait: 'Immediately', col: ACC },
    { lvl: 'L2', name: 'Tom Reyes',   role: 'Secondary',  wait: '15 min',      col: TEXT },
    { lvl: 'L3', name: 'Sam Lim',     role: 'Manager',    wait: '30 min',      col: TEXT },
    { lvl: 'L4', name: 'CTO Bridge',  role: 'Executive',  wait: '60 min',      col: TEXT2 },
  ];
  chain.forEach((c, i) => {
    const cy2 = 250 + i * 54;
    el.push(rect(16, cy2, W - 32, 46, CARD, { rx: 9 }));
    // Level badge
    el.push(rect(28, cy2 + 14, 26, 18, i === 0 ? ACC : CARD2, { rx: 9 }));
    el.push(text(41, cy2 + 27, c.lvl, 9, i === 0 ? '#000' : TEXT2, { anchor: 'middle', fw: 700 }));
    el.push(text(64, cy2 + 24, c.name, 12, i === 0 ? TEXT : TEXT2, { fw: i === 0 ? 600 : 400 }));
    el.push(text(64, cy2 + 38, c.role, 9, TEXT2));
    el.push(text(W - 32, cy2 + 24, c.wait, 10, TEXT2, { anchor: 'end' }));
    // Connector line to next
    if (i < chain.length - 1) {
      el.push(line(41, cy2 + 46, 41, cy2 + 54, TEXT2, { sw: 0.5, opacity: 0.3 }));
    }
  });

  // Open incidents summary
  sectionLabel(el, 20, 472, 'OPEN INCIDENTS · 2');
  el.push(line(20, 478, W - 20, 478, BORDER, { sw: 0.5 }));

  const openIncs = [
    { id: 'INC-0412', svc: 'cache-layer',  prio: 'P1', age: '23m', acked: false, col: RED },
    { id: 'INC-0411', svc: 'payment-svc',  prio: 'P3', age: '1h',  acked: true,  col: ACC2 },
  ];
  openIncs.forEach((inc, i) => {
    const iy = 486 + i * 60;
    el.push(rect(16, iy, W - 32, 52, CARD, { rx: 10 }));
    el.push(rect(16, iy, 3, 52, inc.col, { rx: 1 }));
    el.push(text(32, iy + 20, inc.id, 11, TEXT, { fw: 600, font: 'mono' }));
    el.push(text(32, iy + 38, inc.svc, 10, TEXT2, { font: 'mono' }));
    badge(el, W - 100, iy + 12, inc.prio, inc.col, '#fff');
    el.push(text(W - 32, iy + 38, inc.acked ? '✓ Acked' : 'Unacked', 10, inc.acked ? GRN : RED, { anchor: 'end' }));
    el.push(text(W - 32, iy + 20, inc.age, 10, TEXT2, { anchor: 'end' }));
  });

  // Handoff timer
  el.push(rect(16, 614, W - 32, 50, CARD, { rx: 10 }));
  el.push(text(32, 633, 'Handoff in', 10, TEXT2));
  el.push(text(32, 654, '06:14:38', 18, ACC, { fw: 700, font: 'mono' }));
  el.push(text(W - 32, 643, 'Mon 09:00 UTC', 11, TEXT2, { anchor: 'end' }));

  bottomNav(el, 0);
  return el;
}

// ── Assemble & write ─────────────────────────────────────────────────────────
const screens = [
  { name: 'Mission Control',  elements: screen1() },
  { name: 'Services',         elements: screen2() },
  { name: 'Alert Feed',       elements: screen3() },
  { name: 'Metrics Explorer', elements: screen4() },
  { name: 'Deployments',      elements: screen5() },
  { name: 'On-Call',          elements: screen6() },
];

const pen = {
  version:  '2.8',
  metadata: {
    name:       NAME,
    author:     'RAM',
    date:       DATE,
    theme:      'dark',
    heartbeat:  HB,
    elements:   elCount,
    tagline:    TAGLINE,
    archetype:  'developer-tools',
    slug:       SLUG,
    palette: { bg: BG, surface: SURF, card: CARD, accent: ACC, accent2: ACC2 },
    inspiration: 'Saaspo bento-grid SaaS trend + DarkModeDesign engineering aesthetic (daytona.io, quartr.com)',
  },
  screens,
};

pen.metadata.elements = elCount;

const out = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(out, JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${elCount} elements`);
console.log(`Written: ${SLUG}.pen`);
