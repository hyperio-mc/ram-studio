// SHARD — Embedded Payments Telemetry
// Inspired by:
//   • Evervault's deep navy #010314 / cold-blue text (godly.website featured)
//     → their customer page layout: full-bleed sections, premium B2B security aesthetic
//   • Cardless "Embedded Credit Card Platform" on land-book.com (Mar 2026)
//     → API-first financial product positioning for developers
//   • Linear's ultra-minimal dark product system (darkmodedesign.com)
//     → "purpose-built for teams and agents" — data-forward, purposeful layouts
// Theme: DARK — cosmic navy with electric cyan + coral accents
// Challenge: First time doing API telemetry / observability dashboard for fintech

'use strict';
const fs = require('fs');

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const C = {
  bg:        '#020512',   // slightly lifted from Evervault's #010314
  bg2:       '#040A1E',   // nav/chrome bg
  surface:   '#071228',   // card surface
  surface2:  '#0C1D40',   // elevated / hover
  border:    'rgba(0,212,255,0.12)',
  borderSub: 'rgba(255,255,255,0.06)',
  text:      '#E2EEFF',   // cold-blue-white (Evervault palette shifted)
  textSub:   'rgba(226,238,255,0.55)',
  textMut:   'rgba(226,238,255,0.28)',
  cyan:      '#00D4FF',   // electric cyan — primary accent
  cyanD:     'rgba(0,212,255,0.12)',
  cyanG:     'rgba(0,212,255,0.06)',
  coral:     '#FF4F64',   // error/danger coral
  coralD:    'rgba(255,79,100,0.13)',
  green:     '#00E5A0',   // success green
  greenD:    'rgba(0,229,160,0.11)',
  amber:     '#FFAC30',   // warning
  amberD:    'rgba(255,172,48,0.12)',
  purple:    '#B57BFF',   // latency / secondary
  purpleD:   'rgba(181,123,255,0.12)',
  white:     '#FFFFFF',
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
let elId = 1;
const id = () => `el_${elId++}`;

function rect(x, y, w, h, fill, opts = {}) {
  return {
    id: id(), type: 'rectangle', x, y, width: w, height: h, fill,
    cornerRadius: opts.r || 0,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
    stroke: opts.stroke || 'transparent',
    strokeWidth: opts.strokeWidth || 0,
  };
}

function text(x, y, content, size, fill, opts = {}) {
  return {
    id: id(), type: 'text', x, y,
    content: String(content),
    fontSize: size,
    fill,
    fontWeight: opts.bold ? 'bold' : (opts.medium ? '500' : 'normal'),
    fontFamily: opts.mono ? '"JetBrains Mono", "Fira Code", monospace' : '"Inter", sans-serif',
    width: opts.w || 300,
    textAlign: opts.align || 'left',
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
    letterSpacing: opts.ls || 0,
  };
}

function ellipse(cx, cy, rx, ry, fill, opts = {}) {
  return {
    id: id(), type: 'ellipse',
    x: cx - rx, y: cy - ry, width: rx * 2, height: ry * 2,
    fill, opacity: opts.opacity !== undefined ? opts.opacity : 1,
    stroke: opts.stroke || 'transparent', strokeWidth: opts.strokeWidth || 0,
  };
}

function card(x, y, w, h, opts = {}) {
  return rect(x, y, w, h, opts.fill || C.surface, {
    r: opts.r !== undefined ? opts.r : 14,
    stroke: opts.border !== undefined ? opts.border : C.border,
    strokeWidth: 1,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
  });
}

// Status bar
function statusBar() {
  const els = [];
  els.push(rect(0, 0, 390, 44, C.bg));
  els.push(text(20, 12, '9:41', 14, C.text, { bold: true }));
  [338, 350, 362].forEach((x, i) => els.push(rect(x, 18, 6, 8 + i * 2, C.text, { r: 2, opacity: 0.5 })));
  els.push(rect(374, 16, 12, 8, C.borderSub, { r: 2, stroke: C.textMut, strokeWidth: 1 }));
  els.push(rect(375, 17, 9, 6, C.green, { r: 1 }));
  return els;
}

// Bottom nav
function bottomNav(activeIdx) {
  const els = [];
  els.push(rect(0, 788, 390, 56, C.bg2));
  els.push(rect(0, 788, 390, 1, C.border));
  const tabs = [
    { label: 'Overview',  icon: '◈' },
    { label: 'Txns',      icon: '⊕' },
    { label: 'Endpoints', icon: '⊞' },
    { label: 'Alerts',    icon: '◉' },
    { label: 'Connect',   icon: '⬡' },
  ];
  tabs.forEach((t, i) => {
    const x = 19 + i * 70;
    const isActive = i === activeIdx;
    if (isActive) {
      els.push(rect(x - 4, 793, 62, 3, C.cyan, { r: 2 }));
    }
    els.push(text(x, 800, t.icon, 16, isActive ? C.cyan : C.textMut, { align: 'center', w: 54 }));
    els.push(text(x, 822, t.label, 9, isActive ? C.cyan : C.textMut, { align: 'center', w: 54, medium: isActive }));
  });
  return els;
}

// Top bar
function topBar(title, sub, showBack) {
  const els = [];
  els.push(rect(0, 44, 390, 56, C.bg));
  if (showBack) {
    els.push(text(16, 58, '←', 18, C.cyan, { w: 24 }));
    els.push(text(48, 56, title, 17, C.text, { bold: true, w: 270 }));
    if (sub) els.push(text(48, 77, sub, 11, C.textSub, { w: 260 }));
  } else {
    // Brand word mark
    els.push(text(20, 54, 'shard', 22, C.cyan, { bold: true, w: 100, ls: -0.5 }));
    els.push(text(78, 60, '/', 16, C.textMut, { w: 16 }));
    els.push(text(92, 58, title, 14, C.textSub, { w: 200, medium: true }));
  }
  // Settings icon
  els.push(rect(340, 54, 34, 34, C.surface, { r: 10, stroke: C.border, strokeWidth: 1 }));
  els.push(text(341, 62, '⊙', 15, C.textSub, { align: 'center', w: 32 }));
  return els;
}

// ─── SCREEN 1: OVERVIEW DASHBOARD ────────────────────────────────────────────
function screen1() {
  const els = [];
  statusBar().forEach(e => els.push(e));
  topBar('overview', null, false).forEach(e => els.push(e));

  // Time range pills
  const ranges = ['1h', '6h', '24h', '7d', '30d'];
  let rpx = 16;
  ranges.forEach((r, i) => {
    const rw = r.length * 10 + 18;
    els.push(rect(rpx, 108, rw, 26, i === 2 ? C.cyanD : 'transparent', { r: 13, stroke: i === 2 ? C.cyan : C.border, strokeWidth: 1 }));
    els.push(text(rpx, 114, r, 12, i === 2 ? C.cyan : C.textSub, { w: rw, align: 'center', bold: i === 2 }));
    rpx += rw + 6;
  });

  // Hero metric — total volume
  els.push(card(16, 146, 358, 88, { r: 18 }));
  els.push(text(28, 158, 'Total Volume (24h)', 11, C.textSub, { w: 250 }));
  els.push(text(28, 176, '$2,847,391', 30, C.text, { bold: true, w: 280 }));
  els.push(text(28, 214, '↑ 12.4% vs yesterday', 12, C.green, { w: 200 }));
  // mini sparkline
  const spark = [40, 55, 48, 70, 65, 80, 72, 85, 78, 92, 88, 95];
  spark.forEach((v, i) => {
    const bx = 255 + i * 9;
    const bh = Math.round((v / 100) * 44);
    els.push(rect(bx, 146 + 88 - 12 - bh, 6, bh, C.cyanD, { r: 2 }));
  });
  // highlight last bar
  els.push(rect(255 + 11 * 9, 146 + 88 - 12 - Math.round(0.95 * 44), 6, Math.round(0.95 * 44), C.cyan, { r: 2 }));

  // Four KPI cards
  const kpis = [
    { label: 'Transactions', value: '14,822', change: '+8.2%', up: true, color: C.cyan },
    { label: 'Success Rate', value: '99.2%',  change: '+0.1%', up: true, color: C.green },
    { label: 'Avg Latency',  value: '184ms',  change: '-12ms', up: true, color: C.purple },
    { label: 'Errors',       value: '118',    change: '+24',   up: false, color: C.coral },
  ];
  kpis.forEach((k, i) => {
    const kx = 16 + (i % 2) * 181;
    const ky = 246 + Math.floor(i / 2) * 84;
    els.push(card(kx, ky, 173, 74, { r: 14 }));
    els.push(text(kx + 12, ky + 12, k.label, 11, C.textSub, { w: 140 }));
    els.push(text(kx + 12, ky + 30, k.value, 22, k.color, { bold: true, w: 140 }));
    const changeColor = k.label === 'Errors' ? (k.up ? C.coral : C.green) : (k.up ? C.green : C.coral);
    els.push(text(kx + 12, ky + 55, k.change, 11, changeColor, { w: 100 }));
  });

  // Volume chart
  els.push(text(20, 424, 'Transaction Volume', 13, C.text, { bold: true, w: 200 }));
  els.push(text(290, 425, 'Hourly ›', 11, C.cyan, { w: 80, align: 'right' }));
  els.push(card(16, 442, 358, 88, { r: 14 }));
  const bars = [28, 45, 52, 38, 60, 68, 55, 72, 80, 65, 78, 88, 75, 70, 82, 90, 72, 68, 60, 55, 48, 72, 85, 78];
  const bw = 11;
  bars.forEach((v, i) => {
    const bx = 22 + i * (bw + 3);
    const bh = Math.round((v / 100) * 64);
    const isNow = i === 22;
    els.push(rect(bx, 442 + 76 - bh, bw, bh, isNow ? C.cyan : C.cyanD, { r: 3 }));
  });
  // Error overlay line
  const errLine = [2, 3, 5, 2, 1, 4, 2, 3, 8, 5, 3, 6, 4, 2, 3, 12, 5, 3, 2, 4, 3, 5, 4, 3];
  errLine.forEach((v, i) => {
    if (v > 5) {
      const bx = 22 + i * (bw + 3) + 2;
      const bh = Math.round((v / 14) * 20);
      els.push(rect(bx, 442 + 76 - bh, bw - 4, 3, C.coral, { r: 2, opacity: 0.8 }));
    }
  });

  // Recent status
  els.push(text(20, 546, 'System Status', 13, C.text, { bold: true, w: 200 }));
  const systems = [
    { name: 'Charge API',    status: 'Operational', color: C.green, latency: '142ms' },
    { name: 'Webhook relay', status: 'Operational', color: C.green, latency: '88ms' },
    { name: 'Tokenization',  status: 'Degraded',    color: C.amber, latency: '612ms' },
  ];
  systems.forEach((s, i) => {
    const sy = 566 + i * 58;
    els.push(card(16, sy, 358, 48, { r: 12 }));
    els.push(ellipse(32, sy + 24, 5, 5, s.color));
    els.push(text(46, sy + 13, s.name, 13, C.text, { bold: true, w: 200 }));
    els.push(text(46, sy + 32, s.status, 11, s.color, { w: 160 }));
    els.push(text(300, sy + 13, s.latency, 13, s.status === 'Degraded' ? C.amber : C.textSub, { bold: true, w: 60, align: 'right', mono: true }));
  });

  bottomNav(0).forEach(e => els.push(e));
  return { name: 'Overview', elements: els };
}

// ─── SCREEN 2: TRANSACTION FEED ───────────────────────────────────────────────
function screen2() {
  const els = [];
  statusBar().forEach(e => els.push(e));
  topBar('transactions', null, false).forEach(e => els.push(e));

  // Search + filter row
  els.push(rect(16, 108, 290, 38, C.surface, { r: 11, stroke: C.border, strokeWidth: 1 }));
  els.push(text(16, 120, '  ⊕  Search transaction ID, card...', 12, C.textMut, { w: 290 }));
  els.push(rect(314, 108, 60, 38, C.surface, { r: 11, stroke: C.border, strokeWidth: 1 }));
  els.push(text(314, 120, 'Filter ▾', 11, C.textSub, { w: 60, align: 'center' }));

  // Status filter chips
  const chips = ['All', 'Success', 'Failed', 'Pending'];
  let cpx = 16;
  chips.forEach((c, i) => {
    const cw = c.length * 9 + 20;
    const active = i === 0;
    els.push(rect(cpx, 158, cw, 26, active ? C.cyanD : 'transparent', { r: 13, stroke: active ? C.cyan : C.borderSub, strokeWidth: 1 }));
    els.push(text(cpx, 164, c, 11, active ? C.cyan : C.textSub, { w: cw, align: 'center', bold: active }));
    cpx += cw + 8;
  });

  // Transaction list
  const txns = [
    { id: 'ch_3Pq', amount: '+$1,240.00', method: 'Visa ···4242', status: 'success', color: C.green, label: 'payment_intent.succeeded', time: '12s ago', merchant: 'Shopify' },
    { id: 'ch_3Pr', amount: '+$89.50',    method: 'MC ···8134',   status: 'success', color: C.green, label: 'payment_intent.succeeded', time: '1m ago',  merchant: 'Stripe' },
    { id: 'ch_3Ps', amount: '-$340.00',   method: 'Amex ···0011', status: 'refund',  color: C.amber, label: 'charge.refunded',          time: '3m ago',  merchant: 'Shopify' },
    { id: 'ch_3Pt', amount: '$75.00',     method: 'Visa ···6690', status: 'failed',  color: C.coral, label: 'charge.failed — card_declined', time: '5m ago',  merchant: 'Adyen' },
    { id: 'ch_3Pu', amount: '+$2,500.00', method: 'ACH Direct',   status: 'success', color: C.green, label: 'payment_intent.succeeded', time: '8m ago',  merchant: 'Plaid' },
    { id: 'ch_3Pv', amount: '+$450.00',   method: 'Visa ···1123', status: 'pending', color: C.purple, label: 'payment_intent.processing', time: '12m ago', merchant: 'Stripe' },
  ];

  txns.forEach((tx, i) => {
    const ty = 196 + i * 96;
    els.push(card(16, ty, 358, 86, { r: 14 }));
    // Left accent
    els.push(rect(16, ty, 3, 86, tx.color, { r: 2 }));
    // Top row
    els.push(text(28, ty + 12, tx.id, 12, C.textSub, { mono: true, w: 100 }));
    els.push(text(28, ty + 28, tx.amount, 18, tx.color, { bold: true, w: 150 }));
    els.push(text(240, ty + 12, tx.merchant, 11, C.textMut, { w: 100, align: 'right' }));
    els.push(text(240, ty + 30, tx.time, 12, C.textMut, { w: 100, align: 'right' }));
    // Status badge
    els.push(rect(28, ty + 52, tx.status.length * 7 + 14, 22, tx.color + '22', { r: 11 }));
    els.push(text(28, ty + 57, tx.status.charAt(0).toUpperCase() + tx.status.slice(1), 10, tx.color, { bold: true, w: tx.status.length * 7 + 14, align: 'center' }));
    // Event label
    els.push(text(28 + tx.status.length * 7 + 22, ty + 57, tx.label, 10, C.textMut, { mono: true, w: 260 }));
    els.push(text(28, ty + 74, tx.method, 11, C.textSub, { w: 200 }));
  });

  bottomNav(1).forEach(e => els.push(e));
  return { name: 'Transactions', elements: els };
}

// ─── SCREEN 3: ENDPOINT PERFORMANCE ──────────────────────────────────────────
function screen3() {
  const els = [];
  statusBar().forEach(e => els.push(e));
  topBar('endpoints', null, false).forEach(e => els.push(e));

  // Summary row
  els.push(card(16, 108, 358, 56, { r: 14 }));
  const sMeta = [
    { label: 'Total endpoints', value: '12' },
    { label: 'Degraded',        value: '1', color: C.amber },
    { label: 'Avg p99',         value: '312ms' },
  ];
  sMeta.forEach((s, i) => {
    const sx = 28 + i * 115;
    els.push(text(sx, 118, s.label, 10, C.textSub, { w: 100 }));
    els.push(text(sx, 136, s.value, 16, s.color || C.text, { bold: true, w: 100 }));
  });

  // Sort bar
  els.push(text(20, 178, 'Sort by:', 11, C.textMut, { w: 60 }));
  const sorts = ['P99 Latency', 'Error Rate', 'Volume'];
  let spx = 74;
  sorts.forEach((s, i) => {
    const sw = s.length * 7 + 18;
    els.push(rect(spx, 170, sw, 24, i === 0 ? C.cyanD : 'transparent', { r: 12, stroke: i === 0 ? C.cyan : C.borderSub, strokeWidth: 1 }));
    els.push(text(spx, 176, s, 10, i === 0 ? C.cyan : C.textSub, { w: sw, align: 'center', bold: i === 0 }));
    spx += sw + 8;
  });

  // Endpoint rows
  const endpoints = [
    { method: 'POST', path: '/v1/payment_intents', p50: '68ms', p99: '612ms', errRate: '2.1%', vol: '4,200/h', status: 'degraded', color: C.amber },
    { method: 'POST', path: '/v1/charges',         p50: '52ms', p99: '184ms', errRate: '0.3%', vol: '8,100/h', status: 'ok',       color: C.green },
    { method: 'GET',  path: '/v1/customers',       p50: '28ms', p99: '96ms',  errRate: '0.0%', vol: '12,400/h', status: 'ok',      color: C.green },
    { method: 'POST', path: '/v1/refunds',         p50: '44ms', p99: '140ms', errRate: '0.8%', vol: '820/h',   status: 'ok',       color: C.green },
    { method: 'GET',  path: '/v1/events',          p50: '18ms', p99: '72ms',  errRate: '0.1%', vol: '22,000/h', status: 'ok',      color: C.green },
    { method: 'POST', path: '/v1/webhooks',        p50: '12ms', p99: '60ms',  errRate: '0.4%', vol: '5,600/h', status: 'ok',       color: C.green },
  ];

  endpoints.forEach((ep, i) => {
    const ey = 206 + i * 92;
    els.push(card(16, ey, 358, 82, { r: 14, border: ep.status === 'degraded' ? C.amber + '55' : C.border }));
    // Method badge
    const methodColor = ep.method === 'POST' ? C.cyan : C.purple;
    els.push(rect(28, ey + 14, 40, 18, methodColor + '22', { r: 6 }));
    els.push(text(28, ey + 18, ep.method, 9, methodColor, { bold: true, w: 40, align: 'center', ls: 0.3 }));
    els.push(text(76, ey + 14, ep.path, 13, C.text, { mono: true, bold: true, w: 240 }));
    if (ep.status === 'degraded') {
      els.push(rect(290, ey + 12, 60, 18, C.amberD, { r: 9 }));
      els.push(text(290, ey + 16, '⚠ Degraded', 9, C.amber, { w: 60, align: 'center', bold: true }));
    }
    // divider
    els.push(rect(28, ey + 40, 326, 1, C.borderSub));
    // metrics row
    const metrics = [
      { label: 'P50', val: ep.p50, color: C.textSub },
      { label: 'P99', val: ep.p99, color: ep.status === 'degraded' ? C.amber : C.purple },
      { label: 'Err%', val: ep.errRate, color: parseFloat(ep.errRate) > 1 ? C.coral : C.textSub },
      { label: 'Vol', val: ep.vol, color: C.textSub },
    ];
    metrics.forEach((m, mi) => {
      const mx = 28 + mi * 84;
      els.push(text(mx, ey + 50, m.label, 9, C.textMut, { w: 60 }));
      els.push(text(mx, ey + 63, m.val, 12, m.color, { mono: true, bold: true, w: 80 }));
    });
  });

  bottomNav(2).forEach(e => els.push(e));
  return { name: 'Endpoints', elements: els };
}

// ─── SCREEN 4: ALERTS ────────────────────────────────────────────────────────
function screen4() {
  const els = [];
  statusBar().forEach(e => els.push(e));
  topBar('alerts', null, false).forEach(e => els.push(e));

  // Alert summary bar
  els.push(card(16, 108, 358, 56, { r: 14 }));
  const alertCounts = [
    { label: 'Critical', count: 1, color: C.coral },
    { label: 'Warning',  count: 3, color: C.amber },
    { label: 'Info',     count: 7, color: C.cyan },
    { label: 'Resolved', count: 14, color: C.green },
  ];
  alertCounts.forEach((a, i) => {
    const ax = 28 + i * 84;
    els.push(ellipse(ax + 4, 124, 4, 4, a.color));
    els.push(text(ax + 13, 118, a.count.toString(), 16, a.color, { bold: true, w: 40 }));
    els.push(text(ax + 13, 137, a.label, 9, C.textMut, { w: 60 }));
  });

  // Filter tabs
  els.push(rect(16, 176, 358, 32, C.surface, { r: 10, stroke: C.border, strokeWidth: 1 }));
  els.push(rect(16, 176, 90, 32, C.surface2, { r: 10 }));
  els.push(text(16, 184, 'Active (4)', 11, C.text, { bold: true, w: 90, align: 'center' }));
  ['History', 'Rules', 'Channels'].forEach((t, i) => {
    els.push(text(106 + i * 88, 184, t, 11, C.textSub, { w: 88, align: 'center' }));
  });

  // Alert cards
  const alerts = [
    {
      level: 'critical', color: C.coral, levelBg: C.coralD,
      title: 'P99 Latency Spike — /v1/payment_intents',
      desc: 'P99 exceeded 600ms threshold for 8+ minutes. Currently 612ms (threshold: 400ms).',
      time: '4m ago', rule: 'latency_high_p99', acked: false,
    },
    {
      level: 'warning', color: C.amber, levelBg: C.amberD,
      title: 'Error Rate Elevated — Adyen Gateway',
      desc: 'Card decline rate 3.2% vs baseline 0.8%. Possible BIN or network issue.',
      time: '18m ago', rule: 'gateway_error_rate', acked: false,
    },
    {
      level: 'warning', color: C.amber, levelBg: C.amberD,
      title: 'Webhook Delivery Failures — 12 events',
      desc: '12 webhook events failed to deliver to customer endpoint. Retrying.',
      time: '32m ago', rule: 'webhook_failure', acked: true,
    },
    {
      level: 'warning', color: C.amber, levelBg: C.amberD,
      title: 'API Key Approaching Rate Limit',
      desc: 'key_live_sk_...4a2c at 88% of hourly limit. Consider distributing load.',
      time: '1h ago', rule: 'rate_limit_warning', acked: false,
    },
  ];

  alerts.forEach((al, i) => {
    const ay = 220 + i * 124;
    els.push(card(16, ay, 358, 114, { r: 16, border: al.acked ? C.borderSub : al.color + '44' }));
    // Severity bar
    els.push(rect(16, ay, 4, 114, al.color, { r: 2, opacity: al.acked ? 0.3 : 1 }));
    // Level badge
    els.push(rect(28, ay + 12, al.level.length * 7 + 16, 20, al.levelBg, { r: 10 }));
    els.push(text(28, ay + 16, al.level.toUpperCase(), 9, al.color, { bold: true, w: al.level.length * 7 + 16, align: 'center', ls: 0.5, opacity: al.acked ? 0.6 : 1 }));
    if (al.acked) {
      els.push(rect(290, ay + 12, 60, 20, C.greenD, { r: 10 }));
      els.push(text(290, ay + 16, '✓ Acked', 9, C.green, { w: 60, align: 'center', bold: true }));
    }
    els.push(text(28, ay + 39, al.title, 13, al.acked ? C.textSub : C.text, { bold: !al.acked, w: 320 }));
    els.push(text(28, ay + 57, al.desc, 11, C.textSub, { w: 322, opacity: al.acked ? 0.6 : 1 }));
    // divider
    els.push(rect(28, ay + 83, 326, 1, C.borderSub));
    els.push(text(28, ay + 91, al.rule, 10, C.textMut, { mono: true, w: 180 }));
    els.push(text(296, ay + 91, al.time, 10, C.textMut, { w: 60, align: 'right' }));
  });

  bottomNav(3).forEach(e => els.push(e));
  return { name: 'Alerts', elements: els };
}

// ─── SCREEN 5: INTEGRATIONS / CONNECT ────────────────────────────────────────
function screen5() {
  const els = [];
  statusBar().forEach(e => els.push(e));
  topBar('integrations', null, false).forEach(e => els.push(e));

  // Total connected
  els.push(card(16, 108, 358, 60, { r: 14 }));
  els.push(text(28, 120, 'Connected payment providers', 12, C.textSub, { w: 260 }));
  els.push(text(28, 138, '4 active · $2.84M processed today', 14, C.text, { bold: true, w: 280 }));
  // Progress bar (total capacity)
  els.push(rect(28, 158, 326, 6, C.borderSub, { r: 3 }));
  els.push(rect(28, 158, Math.round(326 * 0.68), 6, C.cyan, { r: 3 }));

  // Provider cards
  const providers = [
    { name: 'Stripe', icon: '◈', color: '#635BFF', volume: '$1.42M', txns: '8,240', status: 'operational', latency: '142ms', last: '12s ago' },
    { name: 'Adyen', icon: '⬡', color: '#0ABF53', volume: '$840K', txns: '3,100', status: 'degraded', latency: '540ms', last: '1m ago' },
    { name: 'Plaid', icon: '⊞', color: '#00B2FF', volume: '$420K', txns: '2,180', status: 'operational', latency: '88ms', last: '30s ago' },
    { name: 'Braintree', icon: '◉', color: '#009BDE', volume: '$178K', txns: '1,302', status: 'operational', latency: '196ms', last: '2m ago' },
  ];

  providers.forEach((p, i) => {
    const py = 178 + i * 128;
    els.push(card(16, py, 358, 118, { r: 16, border: p.status === 'degraded' ? C.amber + '55' : C.border }));
    // Provider icon circle
    els.push(ellipse(52, py + 36, 24, 24, p.color + '22'));
    els.push(text(42, py + 27, p.icon, 18, p.color, { align: 'center', w: 20 }));
    // Name & status
    els.push(text(84, py + 16, p.name, 16, C.text, { bold: true, w: 200 }));
    const sColor = p.status === 'operational' ? C.green : C.amber;
    els.push(ellipse(84, py + 38, 4, 4, sColor));
    els.push(text(94, py + 32, p.status.charAt(0).toUpperCase() + p.status.slice(1), 11, sColor, { w: 140 }));
    // Divider
    els.push(rect(28, py + 58, 326, 1, C.borderSub));
    // Metrics
    const pMetrics = [
      { label: 'Volume', val: p.volume },
      { label: 'Txns', val: p.txns },
      { label: 'P99', val: p.latency },
      { label: 'Last', val: p.last },
    ];
    pMetrics.forEach((m, mi) => {
      const mx = 28 + mi * 84;
      els.push(text(mx, py + 70, m.label, 9, C.textMut, { w: 70 }));
      els.push(text(mx, py + 84, m.val, 12, mi === 2 && p.status === 'degraded' ? C.amber : C.text, { bold: mi < 2, mono: mi >= 2, w: 80 }));
    });
    // Config button
    els.push(rect(28, py + 102, 68, 10, C.border, { r: 5 }));
    els.push(text(28, py + 104, 'Configure', 9, C.cyan, { w: 68, align: 'center' }));
    els.push(rect(104, py + 102, 60, 10, C.border, { r: 5 }));
    els.push(text(104, py + 104, 'Webhooks', 9, C.textSub, { w: 60, align: 'center' }));
  });

  // Add provider button
  els.push(rect(16, 178 + 4 * 128, 358, 48, 'transparent', { r: 14, stroke: C.border, strokeWidth: 1 }));
  els.push(text(16, 178 + 4 * 128 + 13, '+ Connect new provider', 13, C.cyan, { w: 358, align: 'center' }));

  bottomNav(4).forEach(e => els.push(e));
  return { name: 'Integrations', elements: els };
}

// ─── SCREEN 6: TRANSACTION TRACE ─────────────────────────────────────────────
function screen6() {
  const els = [];
  statusBar().forEach(e => els.push(e));
  topBar('Transaction Trace', 'ch_3PqXyZa0...', true).forEach(e => els.push(e));

  // Transaction summary
  els.push(card(16, 108, 358, 80, { r: 16 }));
  els.push(text(28, 118, '$1,240.00', 26, C.green, { bold: true, w: 200 }));
  els.push(rect(28, 148, 70, 20, C.greenD, { r: 10 }));
  els.push(text(28, 153, '✓ Succeeded', 10, C.green, { bold: true, w: 70, align: 'center' }));
  els.push(text(104, 148, 'Visa ···4242', 11, C.textSub, { w: 140 }));
  els.push(text(104, 163, 'Shopify · 2 minutes ago', 11, C.textMut, { w: 200 }));
  els.push(text(296, 118, '284ms', 14, C.purple, { bold: true, w: 60, align: 'right', mono: true }));
  els.push(text(296, 136, 'total', 9, C.textMut, { w: 60, align: 'right' }));

  // Waterfall trace
  els.push(text(20, 202, 'Execution Waterfall', 13, C.text, { bold: true, w: 250 }));
  els.push(card(16, 220, 358, 280, { r: 16 }));

  const spans = [
    { name: 'edge.receive',       ms: 0,   dur: 2,  color: C.cyanD,   textC: C.textSub },
    { name: 'auth.validate_key',  ms: 2,   dur: 18, color: C.cyanD,   textC: C.textSub },
    { name: 'risk.evaluate',      ms: 20,  dur: 45, color: C.purpleD, textC: C.textSub },
    { name: 'vault.tokenize',     ms: 32,  dur: 30, color: C.cyanD,   textC: C.textSub },
    { name: 'gateway.stripe.charge', ms: 65, dur: 180, color: C.cyan + '33', textC: C.cyan, bold: true },
    { name: '  └ network.tls',    ms: 65,  dur: 12, color: C.cyanD,   textC: C.textMut },
    { name: '  └ processor.auth', ms: 80,  dur: 148, color: C.cyanD,  textC: C.textMut },
    { name: 'webhook.dispatch',   ms: 248, dur: 22, color: C.cyanD,   textC: C.textSub },
    { name: 'db.write_event',     ms: 260, dur: 14, color: C.greenD,  textC: C.textSub },
  ];

  const totalMs = 284;
  const chartW = 200;
  const chartX = 140;
  const rowH = 26;

  spans.forEach((sp, i) => {
    const ry = 230 + i * rowH;
    const barX = chartX + Math.round((sp.ms / totalMs) * chartW);
    const barW = Math.max(3, Math.round((sp.dur / totalMs) * chartW));
    // Label
    els.push(text(28, ry + 6, sp.name, 10, sp.textC, { mono: true, w: 110 }));
    // Duration bar
    els.push(rect(barX, ry + 4, barW, 16, sp.color, { r: 3 }));
    // Duration text
    els.push(text(barX + barW + 4, ry + 7, `${sp.dur}ms`, 9, C.textMut, { w: 36, mono: true }));
  });

  // Timeline axis
  els.push(rect(chartX, 228, chartW, 1, C.borderSub));
  [0, 71, 142, 213, 284].forEach((v) => {
    const ax = chartX + Math.round((v / totalMs) * chartW);
    els.push(rect(ax, 226, 1, 8, C.borderSub));
    els.push(text(ax - 12, 236, `${v}ms`, 8, C.textMut, { w: 30, mono: true, align: 'center' }));
  });

  // Metadata
  els.push(text(20, 514, 'Transaction Metadata', 13, C.text, { bold: true, w: 250 }));
  els.push(card(16, 532, 358, 148, { r: 14 }));
  const meta = [
    { k: 'id',             v: 'ch_3PqXyZa0MBgx73WG1' },
    { k: 'created',        v: '2026-03-28T09:39:12Z' },
    { k: 'customer_id',    v: 'cus_Qa8Bm2...kR4' },
    { k: 'payment_method', v: 'pm_1O6bYr2eZvKYlo2C8j' },
    { k: 'risk_score',     v: '12 / 100 (low)' },
  ];
  meta.forEach((m, i) => {
    const my2 = 542 + i * 27;
    els.push(text(28, my2, m.k, 11, C.textMut, { mono: true, w: 130 }));
    els.push(text(158, my2, m.v, 11, C.textSub, { mono: true, w: 204 }));
    if (i < 4) els.push(rect(28, my2 + 16, 326, 1, C.borderSub));
  });

  bottomNav(1).forEach(e => els.push(e));
  return { name: 'Transaction Trace', elements: els };
}

// ─── ASSEMBLE PEN FILE ────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'SHARD — Embedded Payments Telemetry',
  description: 'Dark-theme API telemetry and observability for embedded fintech. Inspired by Evervault\'s #020512 cosmic navy (godly.website featured), Cardless "Embedded Credit Card Platform" (land-book.com Mar 2026), and Linear\'s purposeful dark product system (darkmodedesign.com). Electric cyan on deep navy, waterfall trace, multi-provider aggregation.',
  screens: [
    screen1(), screen2(), screen3(),
    screen4(), screen5(), screen6(),
  ].map(s => ({
    name: s.name,
    width: 390,
    height: 844,
    elements: s.elements,
  })),
};

fs.writeFileSync('shard.pen', JSON.stringify(pen, null, 2));
console.log('✓ shard.pen written —', pen.screens.length, 'screens,', pen.screens.reduce((a, s) => a + s.elements.length, 0), 'elements');
