'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'node';
const NAME = 'NODE';
const TAGLINE = 'every connection, in focus';
const W = 390, H = 844;

// Dark "Blueprint Annotation" palette — inspired by AuthKit/WorkOS circuit diagrams
// seen on darkmodedesign.com and AI SaaS linear-look from saaspo.com
const BG      = '#090C12';
const SURF    = '#0D1321';
const CARD    = '#111827';
const BORDER  = '#1E2D47';
const ACC     = '#00D4FF';  // electric cyan
const ACC2    = '#7B5FFF';  // violet
const ACC3    = '#FF4D6A';  // alert red
const ACC4    = '#00E5A0';  // success green
const TEXT    = '#E2EAF4';
const MUTED   = '#4A6280';
const MUTED2  = '#2A3A52';
const GRID    = '#131E2E';

// ── primitives ───────────────────────────────────────────────────────────────
let eid = 1;
function rect(x, y, w, h, fill, opts = {}) {
  return {
    id: `e${eid++}`, type: 'rect',
    x, y, width: w, height: h,
    fill,
    rx: opts.rx ?? 0,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none',
    strokeWidth: opts.sw ?? 0,
  };
}
function text(x, y, content, size, fill, opts = {}) {
  return {
    id: `e${eid++}`, type: 'text',
    x, y, content,
    fontSize: size, fill,
    fontWeight: opts.fw ?? 400,
    fontFamily: opts.font ?? 'Inter',
    textAnchor: opts.anchor ?? 'start',
    letterSpacing: opts.ls ?? -0.3,
    opacity: opts.opacity ?? 1,
  };
}
function circle(cx, cy, r, fill, opts = {}) {
  return {
    id: `e${eid++}`, type: 'circle',
    cx, cy, r, fill,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none',
    strokeWidth: opts.sw ?? 0,
  };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return {
    id: `e${eid++}`, type: 'line',
    x1, y1, x2, y2, stroke,
    strokeWidth: opts.sw ?? 1,
    opacity: opts.opacity ?? 1,
  };
}

// ── helper components ─────────────────────────────────────────────────────────

// Blueprint grid background
function blueprintGrid(els) {
  // base background
  els.push(rect(0, 0, W, H, BG));
  // horizontal grid lines
  for (let y = 0; y <= H; y += 28) {
    els.push(line(0, y, W, y, GRID, { sw: 1, opacity: 0.7 }));
  }
  // vertical grid lines
  for (let x = 0; x <= W; x += 28) {
    els.push(line(x, 0, x, H, GRID, { sw: 1, opacity: 0.7 }));
  }
}

// Status bar + nav bar
function statusBar(els) {
  els.push(rect(0, 0, W, 44, BG));
  els.push(text(16, 29, '9:41', 13, TEXT, { fw: 600 }));
  els.push(text(330, 29, '●●● ▲ 🔋', 11, TEXT, { opacity: 0.6 }));
}

// Bottom tab bar
function tabBar(els, activeIdx) {
  els.push(rect(0, H - 72, W, 72, SURF));
  els.push(line(0, H - 72, W, H - 72, BORDER, { sw: 1 }));
  const tabs = [
    { label: 'Map', icon: '◈' },
    { label: 'Alerts', icon: '⚡' },
    { label: 'Traffic', icon: '≋' },
    { label: 'Nodes', icon: '◎' },
    { label: 'Rules', icon: '⊞' },
  ];
  tabs.forEach((tab, i) => {
    const x = 39 + i * 78;
    const isActive = i === activeIdx;
    const col = isActive ? ACC : MUTED;
    els.push(text(x, H - 42, tab.icon, 18, col, { anchor: 'middle' }));
    els.push(text(x, H - 22, tab.label, 9, col, { anchor: 'middle', ls: 0.3 }));
    if (isActive) {
      els.push(rect(x - 18, H - 68, 36, 2, ACC, { rx: 1 }));
    }
  });
}

// Screen header with annotation style
function screenHeader(els, title, sub) {
  els.push(rect(0, 44, W, 52, BG));
  els.push(line(0, 96, W, 96, BORDER, { sw: 1 }));
  els.push(text(16, 73, title, 20, TEXT, { fw: 700, ls: -0.5 }));
  if (sub) els.push(text(16, 91, sub, 9, MUTED, { ls: 1.5, fw: 500 }));
}

// Annotation bracket label
function annotationLabel(els, x, y, label) {
  els.push(text(x, y, label, 8, ACC, { ls: 1.2, fw: 500, opacity: 0.7 }));
  els.push(line(x, y + 2, x + label.length * 5.5, y + 2, ACC, { sw: 0.5, opacity: 0.4 }));
}

// Node dot with ring
function nodeDot(els, cx, cy, color, size, label, opts = {}) {
  // outer glow ring
  els.push(circle(cx, cy, size + 6, color, { opacity: 0.08 }));
  els.push(circle(cx, cy, size + 3, color, { opacity: 0.15 }));
  // main dot
  els.push(circle(cx, cy, size, SURF, { stroke: color, sw: 1.5 }));
  // inner dot
  els.push(circle(cx, cy, size - 3, color, { opacity: 0.8 }));
  if (label) {
    const anchor = opts.anchor ?? 'middle';
    const lx = opts.lx ?? cx;
    const ly = opts.ly ?? (cy + size + 14);
    els.push(text(lx, ly, label, 8, TEXT, { anchor, opacity: 0.75, ls: 0.3 }));
  }
}

// Connection line between two nodes
function connLine(els, x1, y1, x2, y2, color, opts = {}) {
  // route via mid
  const mx = (x1 + x2) / 2;
  els.push(line(x1, y1, mx, y1, color, { sw: opts.sw ?? 1, opacity: opts.opacity ?? 0.4 }));
  els.push(line(mx, y1, mx, y2, color, { sw: opts.sw ?? 1, opacity: opts.opacity ?? 0.4 }));
  els.push(line(mx, y2, x2, y2, color, { sw: opts.sw ?? 1, opacity: opts.opacity ?? 0.4 }));
}

// Metric chip
function metricChip(els, x, y, w, h, label, value, unit, color) {
  els.push(rect(x, y, w, h, CARD, { rx: 6, stroke: BORDER, sw: 1 }));
  // corner accent
  els.push(rect(x, y, 2, h, color, { rx: 1 }));
  els.push(text(x + 10, y + 14, label, 7.5, MUTED, { ls: 1 }));
  els.push(text(x + 10, y + 32, value, 18, TEXT, { fw: 700, ls: -0.5 }));
  if (unit) els.push(text(x + 10 + value.length * 10, y + 32, unit, 10, MUTED, { opacity: 0.7 }));
}

// Alert row
function alertRow(els, x, y, w, severity, title, sub, time) {
  const colors = { crit: ACC3, warn: '#FF9A3C', info: ACC };
  const col = colors[severity] || ACC;
  const icons = { crit: '▲', warn: '◆', info: '●' };
  const icon = icons[severity] || '●';

  els.push(rect(x, y, w, 52, CARD, { rx: 6, stroke: BORDER, sw: 1 }));
  els.push(rect(x, y, 3, 52, col, { rx: 1 }));
  els.push(circle(x + 20, y + 20, 7, col, { opacity: 0.15 }));
  els.push(text(x + 20, y + 24, icon, 8, col, { anchor: 'middle', fw: 700 }));
  els.push(text(x + 36, y + 17, title, 11, TEXT, { fw: 600, ls: -0.2 }));
  els.push(text(x + 36, y + 32, sub, 9, MUTED, { ls: 0.1 }));
  els.push(text(x + w - 10, y + 17, time, 8, MUTED, { anchor: 'end', opacity: 0.6 }));
}

// Traffic bar
function trafficBar(els, x, y, w, h, pct, label, value, color) {
  els.push(rect(x, y, w, h, MUTED2, { rx: 2 }));
  els.push(rect(x, y, Math.round(w * pct / 100), h, color, { rx: 2 }));
  els.push(text(x, y - 6, label, 8.5, TEXT, { ls: 0.2 }));
  els.push(text(x + w, y - 6, value, 8.5, ACC, { anchor: 'end', fw: 600 }));
}

// Section label (annotation style)
function sectionLabel(els, x, y, label) {
  els.push(line(x, y, x + 8, y, MUTED, { sw: 0.5, opacity: 0.5 }));
  els.push(text(x + 12, y + 4, label.toUpperCase(), 7.5, MUTED, { ls: 2, opacity: 0.8 }));
}

// Bento card
function bentoCard(els, x, y, w, h, accent) {
  els.push(rect(x, y, w, h, CARD, { rx: 8, stroke: accent ?? BORDER, sw: 1 }));
  // corner ticks
  els.push(line(x, y + 8, x, y, accent ?? BORDER, { sw: 1, opacity: 0.6 }));
  els.push(line(x, y, x + 8, y, accent ?? BORDER, { sw: 1, opacity: 0.6 }));
  els.push(line(x + w - 8, y, x + w, y, accent ?? BORDER, { sw: 1, opacity: 0.6 }));
  els.push(line(x + w, y, x + w, y + 8, accent ?? BORDER, { sw: 1, opacity: 0.6 }));
  els.push(line(x, y + h - 8, x, y + h, accent ?? BORDER, { sw: 1, opacity: 0.6 }));
  els.push(line(x, y + h, x + 8, y + h, accent ?? BORDER, { sw: 1, opacity: 0.6 }));
  els.push(line(x + w - 8, y + h, x + w, y + h, accent ?? BORDER, { sw: 1, opacity: 0.6 }));
  els.push(line(x + w, y + h - 8, x + w, y + h, accent ?? BORDER, { sw: 1, opacity: 0.6 }));
}

// ── SCREENS ───────────────────────────────────────────────────────────────────

// Screen 1: Network Map (Dashboard)
function buildScreen1() {
  const els = [];
  blueprintGrid(els);
  statusBar(els);
  screenHeader(els, 'NODE', 'NETWORK TOPOLOGY v2.4.1');

  // Central hub node
  const HUB_X = 195, HUB_Y = 310;
  // Glow aura
  els.push(circle(HUB_X, HUB_Y, 60, ACC, { opacity: 0.04 }));
  els.push(circle(HUB_X, HUB_Y, 45, ACC, { opacity: 0.06 }));

  // Outer ring connections
  const outerNodes = [
    { x: 100, y: 195, label: 'web-01', col: ACC4, status: 'ok' },
    { x: 290, y: 195, label: 'api-02', col: ACC4, status: 'ok' },
    { x: 80,  y: 340, label: 'db-03',  col: ACC2, status: 'ok' },
    { x: 315, y: 340, label: 'cdn-04', col: ACC4, status: 'ok' },
    { x: 120, y: 450, label: 'mail-5', col: ACC3, status: 'err' },
    { x: 270, y: 450, label: 'cache6', col: '#FF9A3C', status: 'warn' },
  ];

  outerNodes.forEach(n => {
    connLine(els, n.x, n.y, HUB_X, HUB_Y, n.col, { sw: 1, opacity: 0.35 });
  });

  // Hub
  els.push(circle(HUB_X, HUB_Y, 28, SURF, { stroke: ACC, sw: 2 }));
  els.push(circle(HUB_X, HUB_Y, 14, ACC, { opacity: 0.3 }));
  els.push(circle(HUB_X, HUB_Y, 6, ACC));
  els.push(text(HUB_X, HUB_Y + 42, 'GATEWAY', 7.5, ACC, { anchor: 'middle', ls: 2 }));

  // Outer nodes
  outerNodes.forEach(n => {
    nodeDot(els, n.x, n.y, n.col, 10, n.label, { anchor: 'middle' });
  });

  // Annotation labels
  annotationLabel(els, 24, 110, 'ACTIVE NODES');
  els.push(text(24, 126, '18', 22, TEXT, { fw: 700, ls: -0.5 }));

  annotationLabel(els, 280, 110, 'PACKETS/S');
  els.push(text(280, 126, '2.4K', 22, TEXT, { fw: 700, ls: -0.5, anchor: 'start' }));

  // Status chips row
  const chips = [
    { label: '12 OK', col: ACC4 },
    { label: '4 WARN', col: '#FF9A3C' },
    { label: '2 ERR', col: ACC3 },
  ];
  chips.forEach((c, i) => {
    const cx = 16 + i * 120;
    els.push(rect(cx, 516, 106, 22, CARD, { rx: 11, stroke: c.col, sw: 1 }));
    els.push(circle(cx + 14, 527, 4, c.col));
    els.push(text(cx + 24, 531, c.label, 9, TEXT, { fw: 600, ls: 0.8 }));
  });

  // Cross-hair at hub
  els.push(line(HUB_X - 40, HUB_Y, HUB_X - 30, HUB_Y, ACC, { sw: 0.5, opacity: 0.3 }));
  els.push(line(HUB_X + 30, HUB_Y, HUB_X + 40, HUB_Y, ACC, { sw: 0.5, opacity: 0.3 }));
  els.push(line(HUB_X, HUB_Y - 40, HUB_X, HUB_Y - 30, ACC, { sw: 0.5, opacity: 0.3 }));
  els.push(line(HUB_X, HUB_Y + 30, HUB_X, HUB_Y + 40, ACC, { sw: 0.5, opacity: 0.3 }));

  // Annotation crosshair label
  annotationLabel(els, HUB_X + 32, HUB_Y - 6, 'CORE-HUB');

  // Mini metric bento row
  metricChip(els, 16, 550, 108, 52, 'UPTIME', '99.8', '%', ACC4);
  metricChip(els, 140, 550, 108, 52, 'LATENCY', '12', 'ms', ACC);
  metricChip(els, 264, 550, 110, 52, 'THREATS', '3', '', ACC3);

  // Scan line effect
  els.push(rect(0, 612, W, 1, ACC, { opacity: 0.1 }));

  tabBar(els, 0);
  return els;
}

// Screen 2: Alerts
function buildScreen2() {
  const els = [];
  blueprintGrid(els);
  statusBar(els);
  screenHeader(els, 'Alerts', 'LIVE THREAT FEED');

  // Filter pills
  const filters = ['All', 'Critical', 'Warning', 'Info'];
  filters.forEach((f, i) => {
    const x = 16 + i * 86;
    const active = i === 0;
    els.push(rect(x, 106, 78, 26, active ? ACC : CARD, { rx: 13, stroke: active ? ACC : BORDER, sw: 1 }));
    els.push(text(x + 39, 124, f, 10, active ? BG : MUTED, { anchor: 'middle', fw: active ? 600 : 400 }));
  });

  sectionLabel(els, 16, 146, 'Critical · 2 active');

  alertRow(els, 16, 158, W - 32, 'crit', 'Port Scan Detected', '45.142.212.18 → web-01 · 8080', '2m ago');
  alertRow(els, 16, 218, W - 32, 'crit', 'Brute Force Attempt', 'Failed logins: 142 in 60s', '5m ago');

  sectionLabel(els, 16, 284, 'Warning · 3 active');

  alertRow(els, 16, 296, W - 32, 'warn', 'High Traffic Spike', 'CDN-04 bandwidth >90%', '8m ago');
  alertRow(els, 16, 356, W - 32, 'warn', 'SSL Cert Expiring', 'mail-05.node.internal · 12d', '1h ago');
  alertRow(els, 16, 416, W - 32, 'warn', 'Unusual Outbound', 'cache-06 → 23.235.35.0/24', '1h ago');

  sectionLabel(els, 16, 482, 'Info · 5 resolved');
  alertRow(els, 16, 494, W - 32, 'info', 'Scan Complete', 'Full network audit finished', '2h ago');

  // Summary bar
  els.push(rect(16, 558, W - 32, 40, CARD, { rx: 6, stroke: BORDER, sw: 1 }));
  els.push(text(32, 583, '10 total alerts', 10, TEXT));
  els.push(text(W - 24, 583, 'View Log →', 10, ACC, { anchor: 'end', fw: 500 }));

  tabBar(els, 1);
  return els;
}

// Screen 3: Traffic Monitor
function buildScreen3() {
  const els = [];
  blueprintGrid(els);
  statusBar(els);
  screenHeader(els, 'Traffic', 'PACKET ANALYSIS');

  // Sparkline chart area
  els.push(rect(16, 106, W - 32, 130, CARD, { rx: 8, stroke: BORDER, sw: 1 }));

  // Grid lines in chart
  for (let i = 1; i < 4; i++) {
    els.push(line(16, 106 + i * 32, W - 16, 106 + i * 32, BORDER, { sw: 0.5, opacity: 0.5 }));
  }

  // Simulated traffic waveform (polyline via individual line segments)
  const wPoints = [
    [28, 210], [50, 188], [72, 200], [94, 175], [116, 190],
    [138, 160], [160, 178], [182, 145], [204, 162], [226, 135],
    [248, 152], [270, 128], [292, 148], [314, 120], [336, 140], [358, 115],
  ];
  for (let i = 0; i < wPoints.length - 1; i++) {
    const [x1, y1] = wPoints[i];
    const [x2, y2] = wPoints[i + 1];
    els.push(line(x1, y1, x2, y2, ACC, { sw: 2, opacity: 0.9 }));
    // fill dots at key points
    if (i % 3 === 0) els.push(circle(x1, y1, 3, ACC));
  }
  // Last point
  els.push(circle(358, 115, 3, ACC));

  // Axis labels
  els.push(text(20, 230, '0', 7.5, MUTED, { opacity: 0.6 }));
  els.push(text(20, 198, '1K', 7.5, MUTED, { opacity: 0.6 }));
  els.push(text(20, 166, '2K', 7.5, MUTED, { opacity: 0.6 }));
  els.push(text(20, 134, '3K', 7.5, MUTED, { opacity: 0.6 }));
  els.push(text(20, 111, '4K', 7.5, MUTED, { opacity: 0.6 }));
  annotationLabel(els, W - 80, 108, 'PKT/S');

  // Time range chips
  ['1H', '6H', '24H', '7D'].forEach((t, i) => {
    const cx = 220 + i * 40;
    const active = i === 0;
    els.push(rect(cx, 242, 34, 18, active ? ACC : 'none', { rx: 9, stroke: active ? ACC : BORDER, sw: 1 }));
    els.push(text(cx + 17, 255, t, 8.5, active ? BG : MUTED, { anchor: 'middle', fw: active ? 700 : 400 }));
  });

  // Protocol breakdown
  sectionLabel(els, 16, 274, 'Protocol Breakdown');
  const protocols = [
    { label: 'HTTPS/443', pct: 68, val: '1.6K pkt/s', col: ACC },
    { label: 'HTTP/80',   pct: 18, val: '432 pkt/s',  col: ACC2 },
    { label: 'SSH/22',    pct: 8,  val: '192 pkt/s',  col: ACC4 },
    { label: 'DNS/53',    pct: 4,  val: '96 pkt/s',   col: '#FF9A3C' },
    { label: 'Other',     pct: 2,  val: '48 pkt/s',   col: MUTED },
  ];
  protocols.forEach((p, i) => {
    trafficBar(els, 16, 296 + i * 38, W - 32, 10, p.pct, p.label, p.val, p.col);
  });

  // Geo origin bento
  sectionLabel(els, 16, 494, 'Top Origins');
  const origins = [
    { flag: '🇺🇸', country: 'United States', pct: '42%', col: ACC },
    { flag: '🇩🇪', country: 'Germany', pct: '18%', col: ACC2 },
    { flag: '🇸🇬', country: 'Singapore', pct: '11%', col: ACC4 },
    { flag: '🇷🇺', country: 'Russia', pct: '9%', col: ACC3 },
  ];
  origins.forEach((o, i) => {
    const row = i < 2;
    const ox = row ? 16 + (i % 2) * 180 : 16 + (i % 2) * 180;
    const oy = 506 + Math.floor(i / 2) * 52;
    els.push(rect(ox, oy, 168, 44, CARD, { rx: 6, stroke: BORDER, sw: 1 }));
    els.push(text(ox + 12, oy + 28, o.flag + ' ' + o.country, 10, TEXT));
    els.push(text(ox + 156, oy + 28, o.pct, 11, o.col, { anchor: 'end', fw: 600 }));
  });

  tabBar(els, 2);
  return els;
}

// Screen 4: Node Detail
function buildScreen4() {
  const els = [];
  blueprintGrid(els);
  statusBar(els);
  screenHeader(els, 'web-01', 'NODE DETAIL · ACTIVE');

  // Hero status card with blueprint corners
  bentoCard(els, 16, 106, W - 32, 108, ACC4);
  els.push(circle(48, 148, 18, ACC4, { opacity: 0.12 }));
  els.push(circle(48, 148, 9, ACC4));
  els.push(text(48, 152, '●', 8, BG, { anchor: 'middle' }));
  els.push(text(76, 136, 'web-01.node.internal', 13, TEXT, { fw: 700, ls: -0.3 }));
  els.push(text(76, 153, 'ACTIVE · HEALTHY', 8.5, ACC4, { ls: 1.5, fw: 600 }));
  els.push(text(76, 170, '45.142.18.22 · nginx/1.25', 9, MUTED, { ls: 0.2 }));
  // Annotation markers
  annotationLabel(els, 220, 108, 'IPV4');
  annotationLabel(els, 280, 108, 'REGION: EU-W');

  // 4-metric bento
  const metrics = [
    { label: 'CPU', val: '24', unit: '%', col: ACC4 },
    { label: 'RAM', val: '1.2', unit: 'GB', col: ACC },
    { label: 'DISK', val: '38', unit: '%', col: ACC2 },
    { label: 'NET', val: '380', unit: 'Mb/s', col: '#FF9A3C' },
  ];
  metrics.forEach((m, i) => {
    const mx = 16 + (i % 2) * 179;
    const my = 222 + Math.floor(i / 2) * 64;
    metricChip(els, mx, my, 171, 56, m.label, m.val, m.unit, m.col);
  });

  // Open ports
  sectionLabel(els, 16, 358, 'Open Ports');
  const ports = [
    { port: '80', service: 'HTTP', status: 'OK', col: ACC4 },
    { port: '443', service: 'HTTPS', status: 'OK', col: ACC4 },
    { port: '8080', service: 'Alt-HTTP', status: 'SCAN', col: ACC3 },
    { port: '22', service: 'SSH', status: 'OK', col: ACC4 },
  ];
  ports.forEach((p, i) => {
    const py = 370 + i * 38;
    els.push(rect(16, py, W - 32, 30, CARD, { rx: 5, stroke: BORDER, sw: 1 }));
    els.push(rect(16, py, 3, 30, p.col, { rx: 1 }));
    els.push(text(30, py + 20, ':' + p.port, 11, ACC, { fw: 700, ls: 0 }));
    els.push(text(80, py + 20, p.service, 10, TEXT));
    els.push(text(W - 24, py + 20, p.status, 9, p.col, { anchor: 'end', fw: 600, ls: 1 }));
  });

  // Recent events
  sectionLabel(els, 16, 530, 'Recent Events');
  const events = [
    { msg: 'Health check passed', time: '1m ago', col: ACC4 },
    { msg: 'Traffic spike: +340%', time: '12m ago', col: '#FF9A3C' },
    { msg: 'Port scan on :8080', time: '2h ago', col: ACC3 },
  ];
  events.forEach((e, i) => {
    const ey = 542 + i * 32;
    els.push(circle(26, ey + 9, 4, e.col));
    els.push(text(40, ey + 13, e.msg, 10, TEXT));
    els.push(text(W - 20, ey + 13, e.time, 8.5, MUTED, { anchor: 'end' }));
    if (i < 2) els.push(line(26, ey + 14, 26, ey + 32, e.col, { sw: 0.5, opacity: 0.3 }));
  });

  tabBar(els, 3);
  return els;
}

// Screen 5: Rules / Firewall
function buildScreen5() {
  const els = [];
  blueprintGrid(els);
  statusBar(els);
  screenHeader(els, 'Rules', 'FIREWALL POLICY');

  // Active policy chip
  els.push(rect(16, 106, W - 32, 32, CARD, { rx: 6, stroke: ACC2, sw: 1 }));
  els.push(rect(16, 106, 4, 32, ACC2, { rx: 1 }));
  els.push(text(28, 127, 'Active Policy: zero-trust-v3', 10, TEXT, { fw: 600 }));
  els.push(text(W - 24, 127, '14 rules', 9, ACC2, { anchor: 'end', fw: 500 }));

  sectionLabel(els, 16, 150, 'Inbound Rules');

  const rules = [
    { action: 'ALLOW', src: 'ANY', dst: ':443', proto: 'TCP', col: ACC4 },
    { action: 'ALLOW', src: 'ANY', dst: ':80', proto: 'TCP', col: ACC4 },
    { action: 'DENY', src: '45.142.212.0/24', dst: 'ANY', proto: 'ALL', col: ACC3 },
    { action: 'ALLOW', src: '10.0.0.0/8', dst: ':22', proto: 'TCP', col: ACC4 },
    { action: 'DENY', src: 'ANY', dst: ':22', proto: 'TCP', col: ACC3 },
  ];
  rules.forEach((r, i) => {
    const ry = 162 + i * 54;
    els.push(rect(16, ry, W - 32, 46, CARD, { rx: 6, stroke: BORDER, sw: 1 }));
    // blueprint corner ticks
    els.push(line(16, ry, 24, ry, r.col, { sw: 0.5, opacity: 0.4 }));
    els.push(line(16, ry, 16, ry + 8, r.col, { sw: 0.5, opacity: 0.4 }));

    const actionColor = r.action === 'ALLOW' ? ACC4 : ACC3;
    els.push(rect(20, ry + 12, 44, 20, actionColor, { rx: 10, opacity: 0.15 }));
    els.push(text(42, ry + 26, r.action, 8, actionColor, { anchor: 'middle', fw: 700, ls: 0.5 }));
    els.push(text(74, ry + 20, r.src, 9, TEXT, { fw: 500 }));
    els.push(text(74, ry + 34, '→ ' + r.dst, 8.5, MUTED, { ls: 0 }));
    els.push(text(W - 24, ry + 20, r.proto, 9, ACC2, { anchor: 'end', fw: 600, ls: 1 }));
  });

  // Add rule button
  els.push(rect(16, 440, W - 32, 40, 'none', { rx: 8, stroke: ACC, sw: 1 }));
  els.push(text(W / 2, 465, '+ Add Rule', 11, ACC, { anchor: 'middle', fw: 600, ls: 0.5 }));

  // Policy stats bento
  sectionLabel(els, 16, 494, 'Policy Stats');
  const stats = [
    { label: 'Blocked Today', val: '1,247', col: ACC3 },
    { label: 'Allowed Today', val: '84.2K', col: ACC4 },
    { label: 'Rules Active', val: '14', col: ACC2 },
  ];
  stats.forEach((s, i) => {
    metricChip(els, 16 + i * 120, 506, 112, 56, s.label, s.val, '', s.col);
  });

  tabBar(els, 4);
  return els;
}

// Screen 6: Settings / System
function buildScreen6() {
  const els = [];
  blueprintGrid(els);
  statusBar(els);
  screenHeader(els, 'System', 'CONFIGURATION');

  // System info bento with annotation corners
  bentoCard(els, 16, 106, W - 32, 82, ACC2);
  els.push(text(30, 130, 'NODE', 16, TEXT, { fw: 800, ls: -0.8 }));
  els.push(text(30, 150, 'v2.4.1 — Build #20260413', 9, MUTED, { ls: 0.3 }));
  els.push(text(30, 168, 'License: Professional · Active', 9, ACC4, { ls: 0.3 }));
  annotationLabel(els, 220, 108, 'BUILD');

  // Settings rows
  sectionLabel(els, 16, 200, 'Monitoring');
  const settings = [
    { label: 'Scan Interval', val: '60s', col: ACC },
    { label: 'Alert Threshold', val: 'Medium', col: '#FF9A3C' },
    { label: 'Packet Capture', val: 'Enabled', col: ACC4 },
    { label: 'Geo IP Lookup', val: 'Enabled', col: ACC4 },
  ];
  settings.forEach((s, i) => {
    const sy = 212 + i * 42;
    els.push(rect(16, sy, W - 32, 34, CARD, { rx: 6, stroke: BORDER, sw: 1 }));
    els.push(text(30, sy + 22, s.label, 10.5, TEXT));
    els.push(text(W - 24, sy + 22, s.val, 10, s.col, { anchor: 'end', fw: 600 }));
    els.push(line(W - 24 - s.val.length * 6.5 - 8, sy + 22, W - 24 - s.val.length * 6.5 - 4, sy + 22, s.col, { sw: 0.5, opacity: 0.4 }));
  });

  sectionLabel(els, 16, 386, 'Integrations');
  const integrations = [
    { name: 'Slack Webhooks', status: 'Connected', col: ACC4 },
    { name: 'PagerDuty', status: 'Connected', col: ACC4 },
    { name: 'Datadog Export', status: 'Disabled', col: MUTED },
  ];
  integrations.forEach((int, i) => {
    const iy = 398 + i * 42;
    els.push(rect(16, iy, W - 32, 34, CARD, { rx: 6, stroke: BORDER, sw: 1 }));
    els.push(text(30, iy + 22, int.name, 10.5, TEXT));
    els.push(circle(W - 44, iy + 17, 5, int.col, { opacity: int.status === 'Disabled' ? 0.3 : 0.9 }));
    els.push(text(W - 30, iy + 22, int.status, 9.5, int.col, { anchor: 'start', fw: int.status === 'Disabled' ? 400 : 600 }));
  });

  sectionLabel(els, 16, 528, 'Danger Zone');
  els.push(rect(16, 540, W - 32, 36, 'none', { rx: 8, stroke: ACC3, sw: 1, opacity: 0.6 }));
  els.push(text(W / 2, 563, 'Reset All Policies', 11, ACC3, { anchor: 'middle', fw: 600, ls: 0.5 }));

  // Signature annotation
  els.push(text(W - 16, 620, 'RAM × NODE × 2026', 7.5, MUTED, { anchor: 'end', ls: 2, opacity: 0.3 }));
  els.push(line(0, 620, W, 620, BORDER, { sw: 0.5, opacity: 0.4 }));

  tabBar(els, 4);
  return els;
}

// ── ASSEMBLE PEN ──────────────────────────────────────────────────────────────
const screens = [
  { name: 'Network Map',    elements: buildScreen1() },
  { name: 'Alerts',         elements: buildScreen2() },
  { name: 'Traffic',        elements: buildScreen3() },
  { name: 'Node Detail',    elements: buildScreen4() },
  { name: 'Firewall Rules', elements: buildScreen5() },
  { name: 'System',         elements: buildScreen6() },
];

const totalElements = screens.reduce((s, sc) => s + sc.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    tagline: TAGLINE,
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'dark',
    heartbeat: 47,
    elements: totalElements,
    palette: {
      bg: BG, surface: SURF, accent: ACC, accent2: ACC2, text: TEXT,
      description: 'Blueprint annotation dark — electric cyan + violet on deep navy'
    },
    inspiration: 'AuthKit/WorkOS blueprint UI on darkmodedesign.com; AI SaaS linear-look on saaspo.com',
  },
  canvasWidth: W,
  canvasHeight: H,
  screens: screens.map(sc => ({
    name: sc.name,
    elements: sc.elements,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="${BG}"/></svg>`,
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
