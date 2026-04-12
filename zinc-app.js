'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG      = 'zinc';
const APP_NAME  = 'ZINC';
const TAGLINE   = 'API health at a glance';
const HEARTBEAT = 466;
const THEME     = 'dark';

// Palette: one-color-max dark mode (inspired by Alphamark + Linear)
// Single amber accent — everything else is obsidian neutrals
const BG      = '#0A0A09';
const SURF    = '#111110';
const CARD    = '#191917';
const BORDER  = '#2A2A27';
const TEXT    = '#E8E4DC';
const MUTED   = '#7A7870';
const DIM     = '#3C3B38';
const ACC     = '#F5A623';   // electric amber — the ONLY accent
const ACC_DIM = '#7A5010';   // dimmed amber for backgrounds
const NEG     = '#FF5B4E';   // error red (neutral — not a brand accent)
const POS     = '#52C97A';   // ok green (neutral)

// ── primitives ──────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  const el = { type: 'rect', x, y, width: w, height: h, fill };
  if (opts.rx)      el.rx      = opts.rx;
  if (opts.opacity) el.opacity = opts.opacity;
  if (opts.stroke)  el.stroke  = opts.stroke;
  if (opts.sw)      el.strokeWidth = opts.sw;
  return el;
}
function text(x, y, content, size, fill, opts = {}) {
  const el = { type: 'text', x, y, content, fontSize: size, fill };
  if (opts.fw)     el.fontWeight = opts.fw;
  if (opts.font)   el.fontFamily = opts.font;
  if (opts.anchor) el.textAnchor = opts.anchor;
  if (opts.ls)     el.letterSpacing = opts.ls;
  if (opts.opacity)el.opacity = opts.opacity;
  return el;
}
function circle(cx, cy, r, fill, opts = {}) {
  const el = { type: 'circle', cx, cy, r, fill };
  if (opts.opacity) el.opacity = opts.opacity;
  if (opts.stroke)  el.stroke  = opts.stroke;
  if (opts.sw)      el.strokeWidth = opts.sw;
  return el;
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  const el = { type: 'line', x1, y1, x2, y2, stroke };
  if (opts.sw)      el.strokeWidth = opts.sw;
  if (opts.opacity) el.opacity     = opts.opacity;
  return el;
}

const W = 390, H = 844;
const screens = [];
let totalElements = 0;

// ── shared components ────────────────────────────────────────────────────────
function statusBar(els) {
  els.push(rect(0, 0, W, 44, BG));
  els.push(text(20, 28, '9:41', 12, TEXT, { fw: 600 }));
  els.push(text(370, 28, '●●●', 10, TEXT, { anchor: 'end', opacity: 0.7 }));
}

function navBar(els, items, activeIdx) {
  const navH = 82;
  const y0   = H - navH;
  els.push(rect(0, y0, W, navH, SURF));
  els.push(line(0, y0, W, y0, BORDER, { sw: 1 }));
  const itemW = W / items.length;
  items.forEach(({ label, icon }, i) => {
    const cx = itemW * i + itemW / 2;
    const isActive = i === activeIdx;
    const col = isActive ? ACC : MUTED;
    // icon dot
    circle(cx, y0 + 22, 4, col, {}).fill; // placeholder shape
    els.push(circle(cx, y0 + 22, isActive ? 5 : 3, col));
    if (isActive) {
      els.push(circle(cx, y0 + 22, 9, ACC, { opacity: 0.12 }));
    }
    els.push(text(cx, y0 + 38, label, 9, col, { anchor: 'middle', ls: 0.5 }));
  });
}

// dot-grid background texture (inspired by Linear's 5×5 loop)
function dotGrid(els, xStart, yStart, cols, rows, spacing, opacity) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const alpha = (Math.random() * 0.5 + 0.1).toFixed(2);
      els.push(circle(xStart + c * spacing, yStart + r * spacing, 1, MUTED, { opacity: parseFloat(alpha) * opacity }));
    }
  }
}

function sectionLabel(els, x, y, label) {
  els.push(text(x, y, label.toUpperCase(), 9, MUTED, { ls: 1.5, fw: 600 }));
}

function card(els, x, y, w, h, opts = {}) {
  els.push(rect(x, y, w, h, CARD, { rx: 8, stroke: BORDER, sw: 1, ...opts }));
}

function amberPill(els, x, y, label) {
  const pw = label.length * 6 + 16;
  els.push(rect(x, y - 11, pw, 18, ACC_DIM, { rx: 9 }));
  els.push(text(x + pw / 2, y + 1, label, 9, ACC, { anchor: 'middle', fw: 700, ls: 0.3 }));
}

function statusDot(els, cx, cy, status) {
  const col = status === 'ok' ? POS : status === 'warn' ? ACC : NEG;
  els.push(circle(cx, cy, 4, col));
  els.push(circle(cx, cy, 7, col, { opacity: 0.2 }));
}

// ── SCREEN 1 — Live Overview Dashboard ──────────────────────────────────────
(function screen1() {
  const els = [];
  statusBar(els);

  // header
  els.push(rect(0, 44, W, 60, BG));
  els.push(text(20, 75, 'ZINC', 22, TEXT, { fw: 800, ls: -0.5 }));
  els.push(text(80, 75, '·', 22, ACC));
  els.push(text(20, 95, 'api monitor', 11, MUTED, { ls: 1 }));
  amberPill(els, 280, 75, 'LIVE');

  // dot-grid hero texture
  dotGrid(els, 200, 50, 12, 4, 14, 0.5);

  // hero metric strip
  els.push(rect(0, 110, W, 80, SURF));
  els.push(line(0, 110, W, 110, BORDER, { sw: 1 }));
  els.push(line(0, 190, W, 190, BORDER, { sw: 1 }));

  const metrics = [
    { label: 'Uptime', value: '99.98%', col: POS },
    { label: 'P95 Latency', value: '142ms', col: TEXT },
    { label: 'Req/min', value: '8,432', col: TEXT },
  ];
  metrics.forEach((m, i) => {
    const x = 20 + i * 120;
    els.push(text(x, 138, m.value, 20, m.col, { fw: 700 }));
    els.push(text(x, 155, m.label, 9, MUTED, { ls: 0.5 }));
    if (i < metrics.length - 1) {
      els.push(line(x + 100, 120, x + 100, 180, BORDER, { sw: 1 }));
    }
  });

  // alert banner (amber — one-color principle)
  els.push(rect(16, 198, W - 32, 40, ACC_DIM, { rx: 6, stroke: ACC, sw: 1 }));
  els.push(circle(32, 218, 4, ACC));
  els.push(text(44, 222, '1 degraded endpoint  ·  /v2/search', 11, ACC, { fw: 500 }));
  els.push(text(358, 222, '›', 13, ACC, { anchor: 'end' }));

  // section: endpoint health list
  sectionLabel(els, 20, 258, 'Endpoints');

  const endpoints = [
    { path: '/v1/auth',     ms: '48ms',  rps: '2.1k', status: 'ok' },
    { path: '/v1/data',     ms: '89ms',  rps: '3.8k', status: 'ok' },
    { path: '/v2/search',   ms: '892ms', rps: '0.4k', status: 'err' },
    { path: '/v1/webhooks', ms: '211ms', rps: '0.9k', status: 'warn' },
  ];
  endpoints.forEach((ep, i) => {
    const ey = 270 + i * 56;
    card(els, 16, ey, W - 32, 48);
    statusDot(els, 36, ey + 24, ep.status);
    els.push(text(54, ey + 20, ep.path, 13, TEXT, { fw: 600 }));
    els.push(text(54, ey + 35, ep.rps + ' req/s', 10, MUTED));
    els.push(text(W - 32, ey + 20, ep.ms, 13, ep.status === 'err' ? NEG : ep.status === 'warn' ? ACC : MUTED, { anchor: 'end', fw: 600 }));
    els.push(text(W - 32, ey + 35, 'latency', 9, DIM, { anchor: 'end' }));
  });

  navBar(els, [
    { label: 'Overview', icon: 'home' },
    { label: 'Endpoints', icon: 'list' },
    { label: 'Logs', icon: 'activity' },
    { label: 'Alerts', icon: 'bell' },
    { label: 'Settings', icon: 'settings' },
  ], 0);

  totalElements += els.length;
  screens.push({ name: 'Overview', svg: '', elements: els });
})();

// ── SCREEN 2 — Endpoint Detail ───────────────────────────────────────────────
(function screen2() {
  const els = [];
  statusBar(els);

  // back header
  els.push(rect(0, 44, W, 52, BG));
  els.push(text(20, 72, '‹', 18, ACC));
  els.push(text(44, 73, '/v2/search', 15, TEXT, { fw: 700 }));
  els.push(text(W - 20, 68, 'GET', 10, DIM, { anchor: 'end', fw: 700 }));

  // status badge
  els.push(rect(0, 96, W, 28, SURF));
  els.push(line(0, 96, W, 96, BORDER, { sw: 1 }));
  els.push(line(0, 124, W, 124, BORDER, { sw: 1 }));
  els.push(circle(20, 110, 5, NEG));
  els.push(circle(20, 110, 9, NEG, { opacity: 0.2 }));
  els.push(text(36, 114, 'DEGRADED  ·  avg 892ms  ·  last 30 min', 10, NEG, { fw: 600 }));

  // latency sparkline area
  card(els, 16, 132, W - 32, 130);
  sectionLabel(els, 28, 155, 'Latency p95');
  // sparkline bars
  const barData = [120, 160, 145, 200, 890, 920, 870, 800, 750, 700, 680, 720];
  const barW = 18, barGap = 4, totalBarsW = barData.length * (barW + barGap) - barGap;
  const barX0 = 28;
  const maxBar = Math.max(...barData);
  barData.forEach((v, i) => {
    const bh = Math.round((v / maxBar) * 70);
    const bx = barX0 + i * (barW + barGap);
    const by = 232 - bh;
    const col = v > 400 ? NEG : v > 200 ? ACC : POS;
    els.push(rect(bx, by, barW, bh, col, { rx: 3, opacity: v > 400 ? 1 : 0.6 }));
  });
  // x-axis
  els.push(line(24, 234, W - 24, 234, BORDER, { sw: 1 }));
  els.push(text(28, 248, '30m ago', 8, DIM));
  els.push(text(W - 28, 248, 'now', 8, DIM, { anchor: 'end' }));

  // percentile table
  sectionLabel(els, 20, 278, 'Percentiles');
  const pcts = [
    { p: 'P50', v: '210ms', col: POS },
    { p: 'P90', v: '680ms', col: ACC },
    { p: 'P95', v: '892ms', col: NEG },
    { p: 'P99', v: '1.2s',  col: NEG },
  ];
  pcts.forEach((p, i) => {
    const px = 20 + i * 88;
    card(els, px, 290, 80, 50);
    els.push(text(px + 40, 313, p.v, 14, p.col, { anchor: 'middle', fw: 700 }));
    els.push(text(px + 40, 328, p.p,  9, MUTED, { anchor: 'middle' }));
  });

  // top slow requests
  sectionLabel(els, 20, 360, 'Slowest requests (last 5 min)');
  const slow = [
    { path: '?q=machine+learning', ms: '1284ms', code: '200' },
    { path: '?q=deep+neural&fuzzy', ms: '1102ms', code: '200' },
    { path: '?q=transformers&v=3', ms:  '978ms', code: '504' },
  ];
  slow.forEach((r, i) => {
    const ry = 372 + i * 54;
    card(els, 16, ry, W - 32, 46);
    els.push(text(30, ry + 18, r.path, 11, TEXT, { fw: 500 }));
    els.push(text(30, ry + 32, r.ms, 10, r.ms.startsWith('1') ? NEG : ACC, { fw: 600 }));
    const codeCol = r.code === '200' ? POS : NEG;
    els.push(rect(W - 58, ry + 14, 30, 18, codeCol, { rx: 4, opacity: 0.15 }));
    els.push(text(W - 43, ry + 26, r.code, 10, codeCol, { anchor: 'middle', fw: 700 }));
  });

  // error rate section
  sectionLabel(els, 20, 546, 'Error rate');
  card(els, 16, 558, W - 32, 44);
  // error rate bar
  els.push(rect(28, 570, W - 72, 10, DIM, { rx: 5 }));
  els.push(rect(28, 570, Math.round((W - 72) * 0.23), 10, NEG, { rx: 5 }));
  els.push(text(W - 32, 578, '23%', 12, NEG, { anchor: 'end', fw: 700 }));
  els.push(text(28, 592, '↑ +18% vs last hour', 9, NEG));

  navBar(els, [
    { label: 'Overview', icon: 'home' },
    { label: 'Endpoints', icon: 'list' },
    { label: 'Logs', icon: 'activity' },
    { label: 'Alerts', icon: 'bell' },
    { label: 'Settings', icon: 'settings' },
  ], 1);

  totalElements += els.length;
  screens.push({ name: 'Endpoint Detail', svg: '', elements: els });
})();

// ── SCREEN 3 — Live Log Stream ───────────────────────────────────────────────
(function screen3() {
  const els = [];
  statusBar(els);

  // header
  els.push(rect(0, 44, W, 52, BG));
  els.push(text(20, 73, 'Logs', 20, TEXT, { fw: 700 }));
  amberPill(els, 280, 73, 'STREAMING');

  // filter row
  els.push(rect(0, 96, W, 44, SURF));
  els.push(line(0, 96, W, 96, BORDER, { sw: 1 }));
  els.push(line(0, 140, W, 140, BORDER, { sw: 1 }));

  const filters = ['All', 'Error', 'Warn', 'Info'];
  filters.forEach((f, i) => {
    const fw2 = f.length * 7 + 16;
    const fx = 16 + i * 72;
    const isActive = f === 'Error';
    if (isActive) {
      els.push(rect(fx, 105, fw2, 26, ACC, { rx: 13 }));
      els.push(text(fx + fw2 / 2, 122, f, 11, BG, { anchor: 'middle', fw: 700 }));
    } else {
      els.push(rect(fx, 105, fw2, 26, CARD, { rx: 13, stroke: BORDER, sw: 1 }));
      els.push(text(fx + fw2 / 2, 122, f, 11, MUTED, { anchor: 'middle' }));
    }
  });

  // log entries
  const logs = [
    { time: '15:41:03', level: 'ERR', msg: 'timeout /v2/search?q=ml', ms: '5001ms' },
    { time: '15:41:02', level: 'ERR', msg: 'upstream 504  /v2/search',  ms: '3002ms' },
    { time: '15:40:58', level: 'ERR', msg: 'timeout /v2/search?q=deep', ms: '5001ms' },
    { time: '15:40:51', level: 'ERR', msg: 'DB query exceeded 2s SLA',  ms: '2341ms' },
    { time: '15:40:47', level: 'ERR', msg: 'index shard 2 unresponsive', ms: '—' },
    { time: '15:40:39', level: 'WARN', msg: 'p95 > 500ms threshold',    ms: '672ms' },
    { time: '15:40:33', level: 'ERR', msg: 'timeout /v2/search?q=nn',   ms: '5000ms' },
    { time: '15:40:22', level: 'ERR', msg: 'memory pressure on db-02',  ms: '—' },
  ];

  logs.forEach((log, i) => {
    const ly = 148 + i * 64;
    if (i % 2 === 0) els.push(rect(0, ly, W, 64, SURF, { opacity: 0.4 }));
    const levelCol = log.level === 'ERR' ? NEG : log.level === 'WARN' ? ACC : MUTED;
    // level indicator
    els.push(rect(0, ly, 3, 64, levelCol));
    els.push(text(14, ly + 22, log.level, 9, levelCol, { fw: 800, ls: 0.5 }));
    els.push(text(14, ly + 38, log.time, 9, DIM));
    els.push(text(58, ly + 22, log.msg, 11, TEXT));
    if (log.ms !== '—') {
      els.push(text(W - 20, ly + 22, log.ms, 10, levelCol, { anchor: 'end', fw: 600 }));
    }
    els.push(line(0, ly + 63, W, ly + 63, BORDER, { sw: 1, opacity: 0.4 }));
  });

  navBar(els, [
    { label: 'Overview', icon: 'home' },
    { label: 'Endpoints', icon: 'list' },
    { label: 'Logs', icon: 'activity' },
    { label: 'Alerts', icon: 'bell' },
    { label: 'Settings', icon: 'settings' },
  ], 2);

  totalElements += els.length;
  screens.push({ name: 'Log Stream', svg: '', elements: els });
})();

// ── SCREEN 4 — Alert Configuration ──────────────────────────────────────────
(function screen4() {
  const els = [];
  statusBar(els);

  // header
  els.push(rect(0, 44, W, 52, BG));
  els.push(text(20, 73, 'Alerts', 20, TEXT, { fw: 700 }));
  els.push(text(W - 20, 73, '+ New', 12, ACC, { anchor: 'end', fw: 600 }));

  els.push(line(0, 96, W, 96, BORDER, { sw: 1 }));

  // active alerts
  sectionLabel(els, 20, 116, 'Active');

  const activeAlerts = [
    { name: 'P95 > 500ms', endpoint: '/v2/search', since: '42 min', severity: 'critical' },
    { name: 'Error rate > 20%', endpoint: '/v2/search', since: '42 min', severity: 'critical' },
    { name: 'Req volume drop', endpoint: '/v1/data', since: '8 min', severity: 'warning' },
  ];
  activeAlerts.forEach((a, i) => {
    const ay = 128 + i * 64;
    const col = a.severity === 'critical' ? NEG : ACC;
    card(els, 16, ay, W - 32, 56);
    els.push(rect(16, ay, 3, 56, col, { rx: 0 }));
    els.push(circle(32, ay + 20, 5, col));
    els.push(text(44, ay + 22, a.name, 13, TEXT, { fw: 600 }));
    els.push(text(44, ay + 38, a.endpoint, 10, MUTED));
    els.push(text(W - 32, ay + 22, 'FIRING', 9, col, { anchor: 'end', fw: 700, ls: 0.5 }));
    els.push(text(W - 32, ay + 38, a.since, 10, DIM, { anchor: 'end' }));
  });

  // rules section
  sectionLabel(els, 20, 330, 'Rules');

  const rules = [
    { name: 'Latency P95 threshold', threshold: '> 500ms', enabled: true },
    { name: 'Error rate spike',      threshold: '> 5%',    enabled: true },
    { name: 'Request volume drop',   threshold: '< 50%',   enabled: true },
    { name: 'SSL cert expiry',       threshold: '< 14d',   enabled: false },
    { name: 'Response size limit',   threshold: '> 2MB',   enabled: false },
  ];
  rules.forEach((r, i) => {
    const ry = 342 + i * 62;
    card(els, 16, ry, W - 32, 54);
    els.push(text(30, ry + 22, r.name, 13, TEXT, { fw: 500 }));
    els.push(text(30, ry + 38, r.threshold, 10, MUTED));
    // toggle
    const tx = W - 62;
    const ty = ry + 19;
    const tog = r.enabled;
    els.push(rect(tx, ty, 36, 18, tog ? ACC : DIM, { rx: 9 }));
    els.push(circle(tog ? tx + 27 : tx + 9, ty + 9, 7, BG));
  });

  // notification channels
  sectionLabel(els, 20, 660, 'Notify via');
  const channels = ['Slack  #incidents', 'PagerDuty  P1', 'Email  on-call@'];
  channels.forEach((ch, i) => {
    const cy2 = 672 + i * 42;
    card(els, 16, cy2, W - 32, 36);
    els.push(circle(32, cy2 + 18, 4, ACC));
    els.push(text(46, cy2 + 22, ch, 12, TEXT));
  });

  navBar(els, [
    { label: 'Overview', icon: 'home' },
    { label: 'Endpoints', icon: 'list' },
    { label: 'Logs', icon: 'activity' },
    { label: 'Alerts', icon: 'bell' },
    { label: 'Settings', icon: 'settings' },
  ], 3);

  totalElements += els.length;
  screens.push({ name: 'Alerts', svg: '', elements: els });
})();

// ── SCREEN 5 — Performance Insights ─────────────────────────────────────────
(function screen5() {
  const els = [];
  statusBar(els);

  // header
  els.push(rect(0, 44, W, 52, BG));
  els.push(text(20, 73, 'Insights', 20, TEXT, { fw: 700 }));
  amberPill(els, 262, 73, 'LAST 24H');

  els.push(line(0, 96, W, 96, BORDER, { sw: 1 }));

  // dot-grid accent top-right
  dotGrid(els, 260, 50, 8, 3, 14, 0.4);

  // daily summary cards
  sectionLabel(els, 20, 116, 'SLA Summary');
  const slaCards = [
    { label: 'Uptime',   value: '99.98%', delta: '+0.01%', good: true },
    { label: 'MTTR',     value: '4.2 min', delta: '−38%', good: true },
    { label: 'Incidents', value: '3',     delta: '+2',    good: false },
  ];
  slaCards.forEach((s, i) => {
    const sx = 16 + i * 120;
    card(els, sx, 128, 112, 68);
    const col = s.good ? POS : NEG;
    els.push(text(sx + 56, 158, s.value, 15, TEXT, { anchor: 'middle', fw: 700 }));
    els.push(text(sx + 56, 172, s.label, 9, MUTED, { anchor: 'middle' }));
    els.push(text(sx + 56, 186, s.delta, 9, col, { anchor: 'middle', fw: 600 }));
  });

  // weekly latency chart
  sectionLabel(els, 20, 216, 'P95 Latency — 7 days');
  card(els, 16, 228, W - 32, 130);
  const weekData = [88, 95, 102, 89, 540, 892, 380];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxW = Math.max(...weekData);
  const chartW = W - 80;
  const chartH = 80;
  const chartX = 30;
  const chartY = 320;
  // grid lines
  [0, 0.25, 0.5, 0.75, 1].forEach(f => {
    const gy = chartY - chartH * f;
    els.push(line(chartX, gy, chartX + chartW, gy, BORDER, { sw: 1, opacity: 0.4 }));
  });
  // bars
  const bw2 = Math.floor(chartW / weekData.length) - 6;
  weekData.forEach((v, i) => {
    const bh2 = Math.round((v / maxW) * chartH);
    const bx2 = chartX + i * (Math.floor(chartW / weekData.length)) + 3;
    const by2 = chartY - bh2;
    const col = v > 400 ? NEG : v > 200 ? ACC : POS;
    els.push(rect(bx2, by2, bw2, bh2, col, { rx: 3, opacity: v > 400 ? 1 : 0.7 }));
    els.push(text(bx2 + bw2 / 2, chartY + 14, days[i], 8, DIM, { anchor: 'middle' }));
  });

  // SLA threshold line at 500ms
  const threshY = chartY - Math.round((500 / maxW) * chartH);
  els.push(line(chartX, threshY, chartX + chartW, threshY, ACC, { sw: 1, opacity: 0.6 }));
  els.push(text(chartX + chartW + 4, threshY + 4, '500ms', 8, ACC));

  // top endpoints by volume
  sectionLabel(els, 20, 380, 'Top endpoints by volume');
  const vol = [
    { path: '/v1/data',     pct: 85, rps: '3.8k' },
    { path: '/v1/auth',     pct: 48, rps: '2.1k' },
    { path: '/v1/webhooks', pct: 20, rps: '0.9k' },
    { path: '/v2/search',   pct: 9,  rps: '0.4k' },
  ];
  vol.forEach((v, i) => {
    const vy = 392 + i * 52;
    els.push(text(20, vy + 14, v.path, 12, TEXT, { fw: 500 }));
    els.push(text(W - 20, vy + 14, v.rps + '/s', 11, MUTED, { anchor: 'end' }));
    // bar
    els.push(rect(20, vy + 20, W - 40, 6, CARD, { rx: 3 }));
    const bw3 = Math.round((W - 40) * v.pct / 100);
    els.push(rect(20, vy + 20, bw3, 6, ACC, { rx: 3 }));
  });

  // anomaly detection section
  sectionLabel(els, 20, 610, 'Anomaly detection');
  card(els, 16, 622, W - 32, 56);
  els.push(circle(32, 650, 5, ACC));
  els.push(text(46, 645, 'Unusual traffic spike detected', 12, TEXT, { fw: 600 }));
  els.push(text(46, 661, 'Fri 15:38 — /v2/search  +340% above baseline', 10, MUTED));
  els.push(text(W - 32, 650, '›', 14, ACC, { anchor: 'end' }));

  navBar(els, [
    { label: 'Overview', icon: 'home' },
    { label: 'Endpoints', icon: 'list' },
    { label: 'Logs', icon: 'activity' },
    { label: 'Alerts', icon: 'bell' },
    { label: 'Settings', icon: 'settings' },
  ], 4);

  totalElements += els.length;
  screens.push({ name: 'Insights', svg: '', elements: els });
})();

// ── SCREEN 6 — Settings + Onboarding Splash ─────────────────────────────────
(function screen6() {
  const els = [];
  statusBar(els);

  // full-screen dark intro with dot-grid
  els.push(rect(0, 44, W, H - 44, BG));
  dotGrid(els, 20, 100, 22, 30, 16, 0.3);

  // centered logo mark
  const cx2 = W / 2;
  // amber square mark
  els.push(rect(cx2 - 24, 160, 48, 48, ACC, { rx: 10 }));
  els.push(rect(cx2 - 16, 168, 32, 32, BG, { rx: 7 }));
  els.push(text(cx2, 194, 'Z', 18, ACC, { anchor: 'middle', fw: 900 }));

  els.push(text(cx2, 240, 'ZINC', 28, TEXT, { anchor: 'middle', fw: 800, ls: 4 }));
  els.push(text(cx2, 260, 'API health at a glance', 12, MUTED, { anchor: 'middle' }));

  // feature list (minimal, one-color)
  const features = [
    'One-color dark interface — zero visual noise',
    'Real-time latency percentiles P50 → P99',
    'Streaming log filter with error focus',
    'Smart anomaly detection & SLA tracking',
    'PagerDuty + Slack alert routing',
  ];
  features.forEach((f, i) => {
    const fy = 300 + i * 42;
    card(els, 32, fy, W - 64, 34);
    els.push(circle(52, fy + 17, 3, ACC));
    els.push(text(64, fy + 21, f, 11, TEXT));
  });

  // cta button
  els.push(rect(32, 530, W - 64, 48, ACC, { rx: 10 }));
  els.push(text(W / 2, 559, 'Connect your API', 14, BG, { anchor: 'middle', fw: 700 }));

  // secondary cta
  els.push(text(W / 2, 598, 'Import from OpenAPI spec', 12, MUTED, { anchor: 'middle' }));
  els.push(line(W / 2 - 64, 601, W / 2 + 64, 601, MUTED, { sw: 1, opacity: 0.3 }));

  // heartbeat info
  els.push(text(W / 2, 640, `Heartbeat #${HEARTBEAT}  ·  RAM`, 9, DIM, { anchor: 'middle', ls: 0.5 }));

  // bottom dot-grid signature
  dotGrid(els, 80, 670, 16, 5, 14, 0.25);

  totalElements += els.length;
  screens.push({ name: 'Onboarding', svg: '', elements: els });
})();

// ── write .pen file ──────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  metadata: {
    name: APP_NAME,
    tagline: TAGLINE,
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: THEME,
    heartbeat: HEARTBEAT,
    elements: totalElements,
    slug: SLUG,
    archetype: 'api-monitoring',
    palette: { bg: BG, surface: SURF, text: TEXT, accent: ACC, muted: MUTED },
    inspiration: [
      'godly.website — Alphamark (neon one-color-max dark mode)',
      'godly.website — Linear operational dark (dot grid, semantic tokens)',
      'darkmodedesign.com — Stella Petkova (single accent restraint)',
    ],
  },
  screens,
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${APP_NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
