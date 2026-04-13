'use strict';
/**
 * CRAG — API Health Monitor
 * Heartbeat design — Dark theme
 * Inspired by: Arrow Dynamics' cyberpunk instrument-panel hero on Godly.website
 *              + Carbon Dark palette from DarkModeDesign.com
 *              + Bento grid feature sections from Land-book / Saaspo
 *
 * OLED-black base (#000000), cyan/green accent, monospace data, glassmorphic cards
 */

const fs   = require('fs');
const path = require('path');

const SLUG = 'crag';
const W = 390, H = 844;

// Palette — Carbon Dark (OLED-optimised)
const P = {
  bg:      '#000000',   // true OLED black
  surf:    '#0D0D0D',   // card surface
  surf2:   '#151515',   // elevated surface
  surf3:   '#1C1C1C',   // top-most surface
  border:  'rgba(255,255,255,0.07)',
  text:    '#EDEDED',   // primary text (not pure white)
  muted:   '#6B7280',   // secondary text
  dim:     '#3F3F46',   // disabled / very low
  cyan:    '#22D3EE',   // healthy / active
  green:   '#4ADE80',   // success / up
  amber:   '#FBBF24',   // warning / degraded
  red:     '#F87171',   // error / down
  purple:  '#A78BFA',   // AI / insight
  glow:    'rgba(34,211,238,0.15)', // cyan glow
};

let elements = [];
let id = 1;

function rect(x, y, w, h, fill, opts = {}) {
  const el = {
    id: `el-${id++}`, type: 'rect',
    x, y, width: w, height: h, fill,
    rx: opts.rx ?? 0, opacity: opts.opacity ?? 1,
  };
  if (opts.stroke) { el.stroke = opts.stroke; el.strokeWidth = opts.sw ?? 1; }
  elements.push(el);
}

function text(x, y, content, size, fill, opts = {}) {
  elements.push({
    id: `el-${id++}`, type: 'text',
    x, y, content, fontSize: size, fill,
    fontWeight: opts.fw ?? 400,
    fontFamily: opts.font ?? 'Inter',
    textAnchor: opts.anchor ?? 'start',
    letterSpacing: opts.ls ?? 0,
    opacity: opts.opacity ?? 1,
  });
}

function circle(cx, cy, r, fill, opts = {}) {
  elements.push({
    id: `el-${id++}`, type: 'circle',
    cx, cy, r, fill,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke, strokeWidth: opts.sw ?? 1,
  });
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  elements.push({
    id: `el-${id++}`, type: 'line',
    x1, y1, x2, y2, stroke,
    strokeWidth: opts.sw ?? 1,
    opacity: opts.opacity ?? 1,
  });
}

// ─── helpers ────────────────────────────────────────────────────────────────

function statusDot(x, y, color) {
  circle(x, y, 4, color);
  circle(x, y, 7, color, { opacity: 0.2 });
}

function pill(x, y, w, h, fill, label, labelColor, opts = {}) {
  rect(x, y, w, h, fill, { rx: h / 2, opacity: opts.opacity ?? 1 });
  text(x + w / 2, y + h / 2 + 4, label, opts.size ?? 9, labelColor,
    { fw: 600, anchor: 'middle', ls: 0.5, font: opts.font ?? 'Inter' });
}

function card(x, y, w, h, opts = {}) {
  rect(x, y, w, h, P.surf, { rx: opts.rx ?? 14 });
  if (opts.border !== false) {
    rect(x, y, w, h, 'none', { rx: opts.rx ?? 14, stroke: P.border, sw: 1 });
  }
}

function statusBar(x, y, pct, color, w = 200) {
  rect(x, y, w, 4, P.surf3, { rx: 2 });
  rect(x, y, w * pct, 4, color, { rx: 2 });
}

function monospaceValue(x, y, value, size, color) {
  text(x, y, value, size, color, { fw: 600, font: 'JetBrains Mono', ls: -0.5 });
}

// Gauge arc — drawn as stacked arc segments (approximated as rects/lines)
function gaugeArc(cx, cy, radius, pct, color) {
  const steps = 24;
  const startAngle = -210, endAngle = 30;
  const totalArc = endAngle - startAngle;
  const sw = 8;
  // Background arc segments
  for (let i = 0; i < steps; i++) {
    const a = (startAngle + (i / steps) * totalArc) * Math.PI / 180;
    const x1 = cx + (radius) * Math.cos(a);
    const y1 = cy + (radius) * Math.sin(a);
    const a2 = (startAngle + ((i + 0.7) / steps) * totalArc) * Math.PI / 180;
    const x2 = cx + radius * Math.cos(a2);
    const y2 = cy + radius * Math.sin(a2);
    line(x1, y1, x2, y2, P.surf3, { sw });
  }
  // Filled arc segments
  const filledSteps = Math.floor(steps * pct);
  for (let i = 0; i < filledSteps; i++) {
    const a = (startAngle + (i / steps) * totalArc) * Math.PI / 180;
    const x1 = cx + radius * Math.cos(a);
    const y1 = cy + radius * Math.sin(a);
    const a2 = (startAngle + ((i + 0.7) / steps) * totalArc) * Math.PI / 180;
    const x2 = cx + radius * Math.cos(a2);
    const y2 = cy + radius * Math.sin(a2);
    line(x1, y1, x2, y2, color, { sw });
  }
}

// Mini sparkline
function sparkline(x, y, w, h, points, color) {
  const maxVal = Math.max(...points);
  const minVal = Math.min(...points);
  const range = maxVal - minVal || 1;
  const stepX = w / (points.length - 1);
  for (let i = 0; i < points.length - 1; i++) {
    const x1 = x + i * stepX;
    const y1 = y + h - ((points[i] - minVal) / range) * h;
    const x2 = x + (i + 1) * stepX;
    const y2 = y + h - ((points[i + 1] - minVal) / range) * h;
    line(x1, y1, x2, y2, color, { sw: 1.5, opacity: 0.9 });
  }
  // Area fill (simulate with rects)
  for (let i = 0; i < points.length - 1; i++) {
    const bx = x + i * stepX;
    const by = y + h - ((points[i] - minVal) / range) * h;
    const bh = (y + h) - by;
    rect(bx, by, stepX, bh, color, { opacity: 0.08 });
  }
}

// Bar chart (vertical)
function barChart(x, y, w, h, data, colors) {
  const barW = Math.floor((w - (data.length - 1) * 3) / data.length);
  const maxVal = Math.max(...data);
  data.forEach((v, i) => {
    const bh = (v / maxVal) * h;
    const bx = x + i * (barW + 3);
    const by = y + h - bh;
    rect(bx, by, barW, bh, colors[i] ?? P.cyan, { rx: 2, opacity: 0.85 });
  });
}

// Timeline row
function timelineRow(x, y, label, status, latency, uptime, color) {
  statusDot(x + 14, y + 16, color);
  text(x + 28, y + 21, label, 12, P.text, { fw: 500 });
  monospaceValue(x + 180, y + 21, latency, 11, color);
  text(x + 230, y + 21, uptime, 11, P.muted, { fw: 400 });
  line(x, y + 32, x + 350, y + 32, P.border, { sw: 1 });
}

// ─── SVG builder ─────────────────────────────────────────────────────────────

function buildSVG(els) {
  const parts = els.map(el => {
    if (el.type === 'rect') {
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${el.rx}" opacity="${el.opacity}"${el.stroke ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth}"` : ''} fill-rule="evenodd"/>`;
    }
    if (el.type === 'text') {
      return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${el.fontWeight}" font-family="${el.fontFamily}" text-anchor="${el.textAnchor}" letter-spacing="${el.letterSpacing}" opacity="${el.opacity}">${el.content}</text>`;
    }
    if (el.type === 'circle') {
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity}"${el.stroke ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth}"` : ''}/>`;
    }
    if (el.type === 'line') {
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" opacity="${el.opacity}" stroke-linecap="round"/>`;
    }
    return '';
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${parts.join('')}</svg>`;
}

const screens = [];

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 1 — DASHBOARD (Instrument Panel)
// ─────────────────────────────────────────────────────────────────────────────
function buildScreen1() {
  elements = []; id = 1;

  // Background
  rect(0, 0, W, H, P.bg);

  // Ambient glow behind gauge — inspired by Godly's Arrow Dynamics orb effect
  circle(195, 220, 110, P.cyan, { opacity: 0.04 });
  circle(195, 220, 75, P.cyan, { opacity: 0.06 });

  // ── Status bar
  rect(0, 0, W, 44, P.surf);
  rect(0, 44, W, 1, P.border);
  text(20, 28, 'CRAG', 14, P.cyan, { fw: 700, ls: 3, font: 'JetBrains Mono' });
  text(W / 2, 28, 'Dashboard', 13, P.muted, { fw: 500, anchor: 'middle' });

  // Live badge
  rect(320, 12, 50, 20, 'rgba(74,222,128,0.12)', { rx: 10 });
  circle(330, 22, 3, P.green);
  text(337, 27, 'LIVE', 9, P.green, { fw: 700, ls: 1 });

  // ── Hero gauge — Instrument panel style (from Godly / Arrow Dynamics)
  const gcx = 195, gcy = 210;
  gaugeArc(gcx, gcy, 72, 1, P.surf3);    // bg ring
  gaugeArc(gcx, gcy, 72, 0.97, P.cyan); // filled 97%

  // Gauge center
  circle(gcx, gcy, 52, P.surf2);
  circle(gcx, gcy, 48, P.surf3, { opacity: 0.5 });
  monospaceValue(gcx, gcy - 8, '97.4', 28, P.text);
  text(gcx, gcy + 12, 'HEALTH SCORE', 8, P.muted, { fw: 600, anchor: 'middle', ls: 1 });
  text(gcx, gcy + 28, '% global uptime', 9, P.dim, { fw: 400, anchor: 'middle' });

  // Gauge tick marks (instrument feel)
  for (let i = 0; i <= 10; i++) {
    const a = (-210 + i * 24) * Math.PI / 180;
    const r1 = 86, r2 = i % 5 === 0 ? 95 : 90;
    const x1 = gcx + r1 * Math.cos(a), y1 = gcy + r1 * Math.sin(a);
    const x2 = gcx + r2 * Math.cos(a), y2 = gcy + r2 * Math.sin(a);
    line(x1, y1, x2, y2, i % 5 === 0 ? P.dim : P.surf3, { sw: i % 5 === 0 ? 1.5 : 1 });
  }

  // ── 3-metric row below gauge
  const metrics = [
    { label: 'ENDPOINTS', value: '48', sub: 'monitored', color: P.cyan },
    { label: 'INCIDENTS', value: '2', sub: 'active', color: P.amber },
    { label: 'AVG LATENCY', value: '83ms', sub: 'p50', color: P.green },
  ];
  const mW = 110, mH = 72, mY = 300;
  metrics.forEach((m, i) => {
    const mx = 20 + i * (mW + 15);
    card(mx, mY, mW, mH, { rx: 12 });
    // Glow dot
    circle(mx + 14, mY + 16, 4, m.color, { opacity: 0.9 });
    text(mx + 24, mY + 21, m.label, 8, P.muted, { fw: 600, ls: 0.8 });
    monospaceValue(mx + 12, mY + 46, m.value, 20, m.color);
    text(mx + 12, mY + 61, m.sub, 9, P.dim, { fw: 400 });
  });

  // ── Sparkline row — 24h latency trend
  card(20, 392, 350, 90, { rx: 12 });
  text(32, 412, '24h Latency Trend', 11, P.text, { fw: 600 });
  pill(W - 50, 401, 38, 18, 'rgba(74,222,128,0.15)', '−12%', P.green, { size: 9 });
  const latData = [95, 88, 102, 78, 91, 85, 72, 79, 83, 76, 88, 92, 84, 77, 80, 83];
  sparkline(32, 422, 326, 44, latData, P.cyan);
  text(32, 477, '0h', 8, P.dim, { fw: 400 }); text(175, 477, '12h', 8, P.dim, { fw: 400, anchor: 'middle' }); text(350, 477, '24h', 8, P.dim, { fw: 400, anchor: 'end' });

  // ── Top 5 endpoints — compact list
  card(20, 494, 350, 230, { rx: 12 });
  text(32, 516, 'Top Endpoints', 12, P.text, { fw: 600 });
  text(W - 50, 516, 'View all →', 11, P.cyan, { fw: 500, anchor: 'end' });
  line(20, 524, 370, 524, P.border);

  const endpoints = [
    { name: '/api/v2/users',      lat: '42ms', up: '99.9%', color: P.green },
    { name: '/api/v2/payments',   lat: '71ms', up: '99.7%', color: P.green },
    { name: '/api/v2/auth',       lat: '28ms', up: '100%',  color: P.cyan  },
    { name: '/api/v2/search',     lat: '198ms', up: '98.1%', color: P.amber },
    { name: '/api/v2/webhooks',   lat: '—',    up: '0%',    color: P.red   },
  ];
  endpoints.forEach((ep, i) => {
    timelineRow(32, 530 + i * 38, ep.name, '', ep.lat, ep.up, ep.color);
  });

  // ── Bottom navigation
  rect(0, H - 74, W, 74, P.surf);
  rect(0, H - 74, W, 1, P.border);
  const navItems = [
    { icon: '⬡', label: 'Dashboard', active: true  },
    { icon: '◈', label: 'Endpoints', active: false },
    { icon: '⚠', label: 'Incidents', active: false },
    { icon: '◎', label: 'Alerts',    active: false },
    { icon: '⊕', label: 'Settings',  active: false },
  ];
  navItems.forEach((n, i) => {
    const nx = 39 + i * 78;
    if (n.active) {
      rect(nx - 22, H - 70, 44, 36, P.glow, { rx: 10 });
    }
    text(nx, H - 44, n.icon, 18, n.active ? P.cyan : P.dim, { fw: 400, anchor: 'middle' });
    text(nx, H - 22, n.label, 9, n.active ? P.cyan : P.muted, { fw: n.active ? 600 : 400, anchor: 'middle' });
  });

  const svg = buildSVG(elements);
  return { name: 'Dashboard', svg, elements: elements.length };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 2 — ENDPOINTS LIST (Bento + Status grid)
// ─────────────────────────────────────────────────────────────────────────────
function buildScreen2() {
  elements = []; id = 1;
  rect(0, 0, W, H, P.bg);

  // Status bar
  rect(0, 0, W, 44, P.surf);
  rect(0, 44, W, 1, P.border);
  text(20, 28, '←', 16, P.muted, { fw: 400 });
  text(W / 2, 28, 'Endpoints', 14, P.text, { fw: 600, anchor: 'middle' });
  text(W - 24, 28, '+', 18, P.cyan, { fw: 300, anchor: 'end' });

  // Filter pills
  const filters = ['All 48', 'Up 45', 'Warn 2', 'Down 1'];
  filters.forEach((f, i) => {
    const fw = i === 0 ? 56 : 48;
    const fx = 20 + i * 84;
    const active = i === 0;
    rect(fx, 56, fw, 26, active ? P.glow : 'transparent', { rx: 13, stroke: active ? P.cyan : P.border, sw: 1 });
    text(fx + fw / 2, 74, f, 11, active ? P.cyan : P.muted, { fw: active ? 600 : 400, anchor: 'middle' });
  });

  // ── Bento grid — 2-wide status summary cards
  const bCards = [
    { label: 'Healthy', val: '45', color: P.green, sub: '93.8%', w: 160 },
    { label: 'Degraded', val: '2', color: P.amber, sub: 'Warn', w: 160 },
  ];
  bCards.forEach((bc, i) => {
    card(20 + i * 175, 96, bc.w, 68, { rx: 12 });
    circle(34 + i * 175, 116, 5, bc.color);
    text(48 + i * 175, 121, bc.label, 11, P.muted, { fw: 500 });
    monospaceValue(34 + i * 175, 148, bc.val, 24, bc.color);
    text(34 + i * 175 + (i === 0 ? 28 : 14), 148, bc.sub, 11, P.dim, { fw: 400 });
  });

  // Full-width down card
  card(20, 170, 350, 48, { rx: 12 });
  circle(36, 194, 5, P.red);
  text(50, 199, 'Down', 11, P.red, { fw: 600 });
  monospaceValue(105, 199, '1', 13, P.red);
  text(W - 50, 199, 'View incident →', 11, P.red, { fw: 500, anchor: 'end' });

  // ── Endpoint cards list
  const allEps = [
    { name: '/api/v2/auth',       method: 'GET',  lat: '28ms',  up: '100%',  p99: '94ms',  color: P.cyan  },
    { name: '/api/v2/users',      method: 'GET',  lat: '42ms',  up: '99.9%', p99: '128ms', color: P.green },
    { name: '/api/v2/payments',   method: 'POST', lat: '71ms',  up: '99.7%', p99: '210ms', color: P.green },
    { name: '/api/v2/search',     method: 'GET',  lat: '198ms', up: '98.1%', p99: '620ms', color: P.amber },
    { name: '/api/v2/files',      method: 'POST', lat: '55ms',  up: '99.5%', p99: '180ms', color: P.green },
    { name: '/api/v2/webhooks',   method: 'POST', lat: '—',     up: '0%',    p99: '—',     color: P.red   },
    { name: '/api/v2/analytics',  method: 'GET',  lat: '112ms', up: '99.2%', p99: '390ms', color: P.green },
    { name: '/api/v2/billing',    method: 'GET',  lat: '63ms',  up: '99.8%', p99: '195ms', color: P.green },
  ];

  allEps.forEach((ep, i) => {
    const ey = 232 + i * 66;
    card(20, ey, 350, 58, { rx: 11 });

    // Method pill
    const mc = ep.method === 'GET' ? 'rgba(34,211,238,0.15)' : 'rgba(167,139,250,0.15)';
    const mtc = ep.method === 'GET' ? P.cyan : P.purple;
    pill(32, ey + 12, 36, 18, mc, ep.method, mtc, { size: 8 });

    text(76, ey + 25, ep.name, 12, P.text, { fw: 500, font: 'JetBrains Mono' });

    // Status row
    statusDot(32, ey + 44, ep.color);
    monospaceValue(44, ey + 49, ep.lat, 10, ep.color);
    text(100, ey + 49, `p50  ·  p99: ${ep.p99}`, 9, P.muted, { fw: 400 });
    text(W - 30, ey + 49, ep.up, 10, ep.color, { fw: 600, font: 'JetBrains Mono', anchor: 'end' });
  });

  // Nav
  rect(0, H - 74, W, 74, P.surf);
  rect(0, H - 74, W, 1, P.border);
  const navItems = ['⬡','◈','⚠','◎','⊕'];
  const navLabels = ['Dashboard','Endpoints','Incidents','Alerts','Settings'];
  navItems.forEach((icon, i) => {
    const nx = 39 + i * 78;
    if (i === 1) rect(nx - 22, H - 70, 44, 36, P.glow, { rx: 10 });
    text(nx, H - 44, icon, 18, i === 1 ? P.cyan : P.dim, { fw: 400, anchor: 'middle' });
    text(nx, H - 22, navLabels[i], 9, i === 1 ? P.cyan : P.muted, { fw: i === 1 ? 600 : 400, anchor: 'middle' });
  });

  return { name: 'Endpoints', svg: buildSVG(elements), elements: elements.length };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 3 — LATENCY DEEP-DIVE (full chart view)
// ─────────────────────────────────────────────────────────────────────────────
function buildScreen3() {
  elements = []; id = 1;
  rect(0, 0, W, H, P.bg);

  // Status bar
  rect(0, 0, W, 44, P.surf);
  rect(0, 44, W, 1, P.border);
  text(20, 28, '←', 16, P.muted);
  text(W / 2, 28, '/api/v2/search', 13, P.text, { fw: 600, anchor: 'middle', font: 'JetBrains Mono' });

  // Status pill — degraded
  pill(W - 75, 12, 62, 20, 'rgba(251,191,36,0.15)', '⚠ WARN', P.amber, { size: 9 });

  // ── Hero metric row
  rect(0, 44, W, 90, P.surf2);
  const mets = [
    { label: 'P50', val: '198ms', color: P.amber },
    { label: 'P95', val: '480ms', color: P.amber },
    { label: 'P99', val: '620ms', color: P.red   },
    { label: 'UPTIME', val: '98.1%', color: P.amber },
  ];
  mets.forEach((m, i) => {
    const mx = 20 + i * 92;
    text(mx, 72, m.label, 8, P.muted, { fw: 600, ls: 0.8 });
    monospaceValue(mx, 100, m.val, 15, m.color);
  });

  // ── Time range selector
  const ranges = ['1h', '6h', '24h', '7d', '30d'];
  ranges.forEach((r, i) => {
    const rx2 = 20 + i * 68;
    const active = i === 2;
    rect(rx2, 146, 52, 24, active ? P.glow : 'transparent', { rx: 12, stroke: active ? P.cyan : P.border, sw: 1 });
    text(rx2 + 26, 163, r, 11, active ? P.cyan : P.muted, { fw: active ? 600 : 400, anchor: 'middle' });
  });

  // ── Main latency chart
  card(20, 182, 350, 180, { rx: 12 });
  text(32, 202, 'Response Time — 24h', 11, P.text, { fw: 600 });
  text(W - 30, 202, 'ms', 9, P.dim, { fw: 400, anchor: 'end' });

  // Y-axis labels
  const yLabels = [600, 400, 200, 0];
  yLabels.forEach((v, i) => {
    const ly = 218 + i * 38;
    text(28, ly, String(v), 8, P.dim, { fw: 400, anchor: 'end' });
    line(36, ly - 4, 358, ly - 4, P.border, { sw: 0.5 });
  });

  // P99 area (red) + P50 line (amber)
  const p99data = [580, 620, 490, 710, 540, 610, 480, 660, 590, 620, 550, 480, 520, 600, 580, 620];
  const p50data = [180, 198, 170, 220, 190, 210, 165, 200, 195, 198, 185, 170, 175, 200, 195, 198];

  const chartX = 40, chartY = 218, chartW = 310, chartH = 140;
  sparkline(chartX, chartY, chartW, chartH, p99data, P.red);
  sparkline(chartX, chartY, chartW, chartH, p50data, P.amber);

  // Legend
  line(32, 355, 50, 355, P.amber, { sw: 2 }); text(54, 359, 'P50', 9, P.muted, { fw: 500 });
  line(82, 355, 100, 355, P.red, { sw: 2 }); text(104, 359, 'P99', 9, P.muted, { fw: 500 });

  // ── Error rate chart
  card(20, 378, 350, 120, { rx: 12 });
  text(32, 398, 'Error Rate', 11, P.text, { fw: 600 });
  text(W - 30, 398, '1.9% avg', 10, P.red, { fw: 600, anchor: 'end' });
  const errData = [0, 1, 0, 3, 1, 2, 5, 1, 0, 2, 1, 4, 2, 1, 0, 2];
  barChart(32, 410, 318, 72, errData, errData.map(v => v > 3 ? P.red : v > 1 ? P.amber : P.green));

  // ── Slowest requests table
  card(20, 512, 350, 200, { rx: 12 });
  text(32, 532, 'Slowest Requests — Last 1h', 11, P.text, { fw: 600 });
  line(20, 540, 370, 540, P.border);
  const slow = [
    { ts: '14:23:11', lat: '1240ms', status: '504', color: P.red },
    { ts: '14:19:44', lat: '890ms',  status: '200', color: P.amber },
    { ts: '14:15:02', lat: '742ms',  status: '200', color: P.amber },
    { ts: '14:08:31', lat: '695ms',  status: '200', color: P.amber },
    { ts: '14:02:18', lat: '641ms',  status: '200', color: P.green },
  ];
  slow.forEach((s, i) => {
    const sy = 550 + i * 32;
    monospaceValue(32, sy + 12, s.ts, 10, P.dim);
    monospaceValue(130, sy + 12, s.lat, 11, s.color);
    pill(230, sy, 36, 18, s.status === '504' ? 'rgba(248,113,113,0.15)' : 'rgba(74,222,128,0.1)', s.status, s.color, { size: 9 });
    line(20, sy + 22, 370, sy + 22, P.border, { sw: 0.5 });
  });

  // Nav
  rect(0, H - 74, W, 74, P.surf);
  rect(0, H - 74, W, 1, P.border);
  ['⬡','◈','⚠','◎','⊕'].forEach((icon, i) => {
    const nx = 39 + i * 78;
    if (i === 1) rect(nx - 22, H - 70, 44, 36, P.glow, { rx: 10 });
    text(nx, H - 44, icon, 18, i === 1 ? P.cyan : P.dim, { fw: 400, anchor: 'middle' });
    text(nx, H - 22, ['Dashboard','Endpoints','Incidents','Alerts','Settings'][i], 9, i === 1 ? P.cyan : P.muted, { fw: i === 1 ? 600 : 400, anchor: 'middle' });
  });

  return { name: 'Latency', svg: buildSVG(elements), elements: elements.length };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 4 — INCIDENTS
// ─────────────────────────────────────────────────────────────────────────────
function buildScreen4() {
  elements = []; id = 1;
  rect(0, 0, W, H, P.bg);

  rect(0, 0, W, 44, P.surf);
  rect(0, 44, W, 1, P.border);
  text(W / 2, 28, 'Incidents', 14, P.text, { fw: 600, anchor: 'middle' });

  // Active incident banner
  rect(0, 44, W, 6, P.red, { opacity: 0.8 });
  rect(20, 60, 350, 100, 'rgba(248,113,113,0.08)', { rx: 14, stroke: 'rgba(248,113,113,0.3)', sw: 1 });
  circle(36, 80, 6, P.red);
  circle(36, 80, 10, P.red, { opacity: 0.2 });
  text(52, 85, 'ACTIVE', 9, P.red, { fw: 700, ls: 1 });
  text(103, 85, '·  INC-0047', 9, P.dim, { fw: 400 });
  text(W - 26, 85, '34m ago', 9, P.dim, { fw: 400, anchor: 'end' });
  text(32, 106, '/api/v2/webhooks is down', 13, P.text, { fw: 600 });
  text(32, 124, 'POST endpoint returning 503 — origin unreachable', 11, P.muted, { fw: 400 });
  text(32, 142, 'Impact: 3 customers · Severity: P1', 10, P.red, { fw: 500 });

  // Action buttons
  rect(32, 155, 150, 32, P.red, { rx: 10, opacity: 0.9 });
  text(107, 176, 'Acknowledge', 12, P.bg, { fw: 600, anchor: 'middle' });
  rect(192, 155, 80, 32, P.surf3, { rx: 10 });
  text(232, 176, 'Details', 12, P.muted, { fw: 500, anchor: 'middle' });

  // Closed incidents
  text(32, 208, 'RESOLVED — Last 30 days', 9, P.dim, { fw: 600, ls: 0.8 });

  const incidents = [
    { id: 'INC-0046', name: '/api/v2/search degraded', dur: '2h 14m', sev: 'P2', color: P.amber },
    { id: 'INC-0045', name: '/api/v2/auth elevated latency', dur: '45m', sev: 'P3', color: P.amber },
    { id: 'INC-0044', name: '/api/v2/payments timeout spikes', dur: '18m', sev: 'P3', color: P.amber },
    { id: 'INC-0043', name: '/api/v2/files storage outage', dur: '3h 51m', sev: 'P1', color: P.red },
    { id: 'INC-0042', name: '/api/v2/users 502 errors', dur: '9m', sev: 'P4', color: P.green },
    { id: 'INC-0041', name: '/api/v2/billing slow responses', dur: '1h 2m', sev: 'P3', color: P.amber },
    { id: 'INC-0040', name: 'Global latency increase', dur: '22m', sev: 'P2', color: P.amber },
    { id: 'INC-0039', name: '/api/v2/analytics timeout', dur: '6m', sev: 'P4', color: P.green },
  ];

  incidents.forEach((inc, i) => {
    const iy = 220 + i * 70;
    card(20, iy, 350, 62, { rx: 11 });
    const sc = inc.sev === 'P1' ? P.red : inc.sev === 'P2' ? P.amber : inc.sev === 'P3' ? P.amber : P.green;
    pill(32, iy + 10, 28, 18, 'rgba(0,0,0,0.3)', inc.sev, sc, { size: 8 });
    text(68, iy + 23, inc.id, 10, P.dim, { fw: 400, font: 'JetBrains Mono' });
    text(32, iy + 44, inc.name, 11, P.text, { fw: 500 });
    text(W - 30, iy + 44, `Resolved · ${inc.dur}`, 10, P.green, { fw: 400, anchor: 'end' });
  });

  // Nav
  rect(0, H - 74, W, 74, P.surf);
  rect(0, H - 74, W, 1, P.border);
  ['⬡','◈','⚠','◎','⊕'].forEach((icon, i) => {
    const nx = 39 + i * 78;
    if (i === 2) rect(nx - 22, H - 70, 44, 36, P.glow, { rx: 10 });
    text(nx, H - 44, icon, 18, i === 2 ? P.cyan : P.dim, { fw: 400, anchor: 'middle' });
    text(nx, H - 22, ['Dashboard','Endpoints','Incidents','Alerts','Settings'][i], 9, i === 2 ? P.cyan : P.muted, { fw: i === 2 ? 600 : 400, anchor: 'middle' });
  });

  return { name: 'Incidents', svg: buildSVG(elements), elements: elements.length };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 5 — ALERTS CONFIG
// ─────────────────────────────────────────────────────────────────────────────
function buildScreen5() {
  elements = []; id = 1;
  rect(0, 0, W, H, P.bg);

  rect(0, 0, W, 44, P.surf);
  rect(0, 44, W, 1, P.border);
  text(W / 2, 28, 'Alert Rules', 14, P.text, { fw: 600, anchor: 'middle' });
  text(W - 24, 28, '+', 18, P.cyan, { fw: 300, anchor: 'end' });

  // Summary strip
  rect(0, 44, W, 60, P.surf2);
  const aSummary = [{ l: 'Active', v: '12', c: P.cyan }, { l: 'Paused', v: '3', c: P.dim }, { l: 'Triggered today', v: '5', c: P.amber }];
  aSummary.forEach((s, i) => {
    text(44 + i * 120, 70, s.v, 20, s.c, { fw: 700, anchor: 'middle', font: 'JetBrains Mono' });
    text(44 + i * 120, 90, s.l, 9, P.muted, { fw: 500, anchor: 'middle' });
  });

  const rules = [
    { name: 'Uptime < 99%',        scope: 'All endpoints', when: 'Latency > 99th %ile', channel: 'Slack + PagerDuty', active: true,  sev: 'P1', color: P.red   },
    { name: 'Latency spike',        scope: '/api/v2/search', when: 'P95 > 500ms for 5m', channel: 'Slack',            active: true,  sev: 'P2', color: P.amber },
    { name: 'Error rate > 2%',      scope: 'All endpoints', when: '5xx > 2% for 10m',   channel: 'Email',            active: true,  sev: 'P2', color: P.amber },
    { name: 'Cert expiry warning',  scope: 'All domains',   when: 'TLS < 14 days',      channel: 'Email',            active: true,  sev: 'P3', color: P.amber },
    { name: 'Region latency',       scope: 'ap-southeast-1', when: 'P50 > 200ms',        channel: 'Slack',            active: false, sev: 'P3', color: P.dim   },
    { name: 'DNS resolution fail',  scope: 'All domains',   when: 'NXDOMAIN response',  channel: 'PagerDuty',        active: true,  sev: 'P1', color: P.red   },
    { name: 'Status page update',   scope: 'Public page',   when: 'Any P1 incident',    channel: 'Webhooks',         active: true,  sev: 'P1', color: P.purple },
    { name: 'Anomaly detection',    scope: 'All endpoints', when: 'AI: unusual pattern', channel: 'Slack',           active: true,  sev: 'P2', color: P.purple },
  ];

  rules.forEach((rule, i) => {
    const ry = 116 + i * 82;
    card(20, ry, 350, 74, { rx: 12 });

    // Severity + active indicator
    const sc = rule.sev === 'P1' ? P.red : rule.sev === 'P2' ? P.amber : rule.color;
    pill(32, ry + 10, 28, 18, 'rgba(0,0,0,0.3)', rule.sev, sc, { size: 8 });
    text(66, ry + 23, rule.name, 12, rule.active ? P.text : P.dim, { fw: 600 });

    // Toggle visual
    const togX = W - 56, togY = ry + 11;
    rect(togX, togY, 36, 18, rule.active ? 'rgba(34,211,238,0.2)' : P.surf3, { rx: 9 });
    circle(rule.active ? togX + 25 : togX + 11, togY + 9, 7, rule.active ? P.cyan : P.dim);

    text(32, ry + 44, rule.scope, 10, P.muted, { fw: 400, font: 'JetBrains Mono' });
    text(32, ry + 60, `⟶ ${rule.channel}`, 9, P.dim, { fw: 400 });
    text(W - 30, ry + 60, rule.when, 9, P.dim, { fw: 400, anchor: 'end' });
  });

  // Nav
  rect(0, H - 74, W, 74, P.surf);
  rect(0, H - 74, W, 1, P.border);
  ['⬡','◈','⚠','◎','⊕'].forEach((icon, i) => {
    const nx = 39 + i * 78;
    if (i === 3) rect(nx - 22, H - 70, 44, 36, P.glow, { rx: 10 });
    text(nx, H - 44, icon, 18, i === 3 ? P.cyan : P.dim, { fw: 400, anchor: 'middle' });
    text(nx, H - 22, ['Dashboard','Endpoints','Incidents','Alerts','Settings'][i], 9, i === 3 ? P.cyan : P.muted, { fw: i === 3 ? 600 : 400, anchor: 'middle' });
  });

  return { name: 'Alerts', svg: buildSVG(elements), elements: elements.length };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 6 — SETTINGS / TEAM
// ─────────────────────────────────────────────────────────────────────────────
function buildScreen6() {
  elements = []; id = 1;
  rect(0, 0, W, H, P.bg);

  rect(0, 0, W, 44, P.surf);
  rect(0, 44, W, 1, P.border);
  text(W / 2, 28, 'Settings', 14, P.text, { fw: 600, anchor: 'middle' });

  // Account card
  rect(20, 56, 350, 88, P.surf, { rx: 14, stroke: P.border, sw: 1 });
  // Avatar
  circle(58, 100, 26, P.surf3);
  circle(58, 93, 10, P.cyan, { opacity: 0.7 });
  circle(58, 112, 18, P.cyan, { opacity: 0.2 });
  text(96, 93, 'Riko Nakamura', 14, P.text, { fw: 600 });
  text(96, 110, 'riko@acme.io', 11, P.muted, { fw: 400 });
  pill(96, 118, 48, 18, 'rgba(74,222,128,0.15)', 'PRO PLAN', P.green, { size: 8 });
  text(W - 30, 91, '›', 18, P.dim, { anchor: 'end' });

  // Sections
  const sections = [
    {
      title: 'Workspace', items: [
        { label: 'Team members', val: '4 people' },
        { label: 'API keys', val: '3 active' },
        { label: 'Check interval', val: '30s' },
        { label: 'Data retention', val: '90 days' },
      ]
    },
    {
      title: 'Notifications', items: [
        { label: 'Email digest', val: 'Daily' },
        { label: 'Slack workspace', val: '#alerts' },
        { label: 'PagerDuty integration', val: 'Connected' },
        { label: 'On-call schedule', val: 'Round-robin' },
      ]
    },
  ];

  let sy = 158;
  sections.forEach(section => {
    text(32, sy, section.title.toUpperCase(), 9, P.dim, { fw: 600, ls: 0.8 });
    sy += 12;
    card(20, sy, 350, section.items.length * 48 + 8, { rx: 12 });
    section.items.forEach((item, i) => {
      const iy = sy + 8 + i * 48;
      text(32, iy + 20, item.label, 13, P.text, { fw: 400 });
      text(W - 30, iy + 20, item.val, 12, P.muted, { fw: 400, anchor: 'end' });
      text(W - 16, iy + 20, '›', 14, P.dim, { anchor: 'end' });
      if (i < section.items.length - 1) line(32, iy + 38, 358, iy + 38, P.border, { sw: 0.5 });
    });
    sy += section.items.length * 48 + 8 + 20;
  });

  // Status page link
  card(20, sy, 350, 52, { rx: 12 });
  rect(32, sy + 16, 20, 20, 'rgba(34,211,238,0.15)', { rx: 6 });
  text(42, sy + 31, '◈', 12, P.cyan, { anchor: 'middle' });
  text(62, sy + 31, 'Public Status Page', 13, P.text, { fw: 500 });
  text(W - 30, sy + 31, 'status.acme.io ›', 11, P.cyan, { fw: 400, anchor: 'end' });
  sy += 68;

  // Danger zone
  card(20, sy, 350, 52, { rx: 12 });
  text(32, sy + 31, 'Delete workspace', 13, P.red, { fw: 500 });
  text(W - 30, sy + 31, '›', 14, P.red, { anchor: 'end' });

  // Nav
  rect(0, H - 74, W, 74, P.surf);
  rect(0, H - 74, W, 1, P.border);
  ['⬡','◈','⚠','◎','⊕'].forEach((icon, i) => {
    const nx = 39 + i * 78;
    if (i === 4) rect(nx - 22, H - 70, 44, 36, P.glow, { rx: 10 });
    text(nx, H - 44, icon, 18, i === 4 ? P.cyan : P.dim, { fw: 400, anchor: 'middle' });
    text(nx, H - 22, ['Dashboard','Endpoints','Incidents','Alerts','Settings'][i], 9, i === 4 ? P.cyan : P.muted, { fw: i === 4 ? 600 : 400, anchor: 'middle' });
  });

  return { name: 'Settings', svg: buildSVG(elements), elements: elements.length };
}

// ─── assemble ─────────────────────────────────────────────────────────────────
const built = [
  buildScreen1(),
  buildScreen2(),
  buildScreen3(),
  buildScreen4(),
  buildScreen5(),
  buildScreen6(),
];

const totalElements = built.reduce((s, sc) => s + sc.elements, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'CRAG — API Health Monitor',
    author: 'RAM',
    date: new Date().toISOString().slice(0, 10),
    theme: 'dark',
    heartbeat: 'crag',
    elements: totalElements,
    palette: {
      bg: P.bg, surface: P.surf, text: P.text,
      accent: P.cyan, accent2: P.green, muted: P.muted,
    },
    inspiration: 'Arrow Dynamics cyberpunk instrument panel (Godly.website) + Carbon Dark OLED palette (DarkModeDesign.com)',
  },
  screens: built.map(sc => ({
    name: sc.name,
    svg: sc.svg,
    elements: [],
  })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`CRAG: ${built.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
