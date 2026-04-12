'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG = 'wraith';
const NAME = 'WRAITH';
const TAGLINE = 'Network Intelligence Monitor';
const HEARTBEAT = 53;

// ─── Palette ────────────────────────────────────────────────
const C = {
  bg:       '#080B10',
  surf:     '#0D1117',
  card:     '#161B24',
  card2:    '#1C2333',
  border:   '#21293A',
  accent:   '#39D353',   // terminal green
  accent2:  '#58A6FF',   // electric blue
  accent3:  '#F78166',   // soft red / alert
  accent4:  '#E3B341',   // amber / warning
  muted:    'rgba(160,200,230,0.30)',
  mutedTxt: '#7D8FA1',
  text:     '#CDD9E5',
  textDim:  '#8B98A5',
  white:    '#E6EDF3',
};

const W = 390;
const H = 844;

// ─── Primitives ──────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, width: w, height: h, fill,
    rx: opts.rx ?? 0, opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none', strokeWidth: opts.sw ?? 0,
  };
}
function text(x, y, content, size, fill, opts = {}) {
  return {
    type: 'text', x, y, content: String(content), fontSize: size, fill,
    fontWeight: opts.fw ?? 400,
    fontFamily: opts.font ?? 'JetBrains Mono, monospace',
    textAnchor: opts.anchor ?? 'start',
    letterSpacing: opts.ls ?? 0,
    opacity: opts.opacity ?? 1,
  };
}
function circle(cx, cy, r, fill, opts = {}) {
  return {
    type: 'circle', cx, cy, r, fill,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none', strokeWidth: opts.sw ?? 0,
  };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return {
    type: 'line', x1, y1, x2, y2, stroke,
    strokeWidth: opts.sw ?? 1, opacity: opts.opacity ?? 1,
  };
}
function poly(points, fill, opts = {}) {
  return {
    type: 'polygon', points,
    fill, stroke: opts.stroke ?? 'none', strokeWidth: opts.sw ?? 0,
    opacity: opts.opacity ?? 1,
  };
}

// ─── Reusable Components ─────────────────────────────────────
function statusBar(time = '23:41:07') {
  return [
    rect(0, 0, W, 44, C.surf),
    // Logo
    text(16, 28, '⬡ WRAITH', 12, C.accent, { fw: 700, ls: 2 }),
    // Status dot (live)
    circle(130, 22, 4, C.accent),
    text(138, 27, 'LIVE', 9, C.accent, { fw: 600, ls: 1 }),
    // Time
    text(W - 16, 28, time, 11, C.mutedTxt, { anchor: 'end', ls: 1 }),
  ];
}

function bottomNav(active = 0) {
  const tabs = [
    { icon: '◈', label: 'CMD' },
    { icon: '◉', label: 'SIGNALS' },
    { icon: '▦', label: 'HOSTS' },
    { icon: '◫', label: 'METRICS' },
    { icon: '≡', label: 'LOGS' },
  ];
  const items = [
    rect(0, H - 64, W, 64, C.surf),
    line(0, H - 64, W, H - 64, C.border, { sw: 1 }),
  ];
  const step = W / tabs.length;
  tabs.forEach((t, i) => {
    const cx = step * i + step / 2;
    const isActive = i === active;
    if (isActive) {
      items.push(rect(cx - 28, H - 60, 56, 3, C.accent, { rx: 2 }));
    }
    items.push(text(cx, H - 38, t.icon, 18, isActive ? C.accent : C.textDim, { anchor: 'middle', fw: isActive ? 700 : 400 }));
    items.push(text(cx, H - 14, t.label, 8, isActive ? C.accent : C.textDim, { anchor: 'middle', ls: 1.5, fw: isActive ? 700 : 400 }));
  });
  return items;
}

function sectionHeader(x, y, label, sub) {
  const els = [text(x, y, label, 9, C.mutedTxt, { fw: 600, ls: 2 })];
  if (sub) els.push(text(W - x, y, sub, 9, C.accent2, { anchor: 'end', ls: 1 }));
  return els;
}

function metricCard(x, y, w, h, label, value, unit, delta, status = 'ok') {
  const accentColor = status === 'warn' ? C.accent4 : status === 'alert' ? C.accent3 : C.accent;
  return [
    rect(x, y, w, h, C.card, { rx: 6, stroke: C.border, sw: 1 }),
    // left border accent
    rect(x, y + 8, 2, h - 16, accentColor, { rx: 1 }),
    text(x + 14, y + 20, label, 8, C.textDim, { fw: 600, ls: 1.5 }),
    text(x + 14, y + h - 20, value, 20, C.white, { fw: 700, font: 'JetBrains Mono, monospace' }),
    text(x + 14 + (value.length * 12.2), y + h - 20, unit, 10, C.mutedTxt, { fw: 400 }),
    delta ? text(x + w - 10, y + h - 18, delta, 9, status === 'ok' ? C.accent : C.accent3, { anchor: 'end', fw: 600 }) : null,
  ].filter(Boolean);
}

function sparkline(x, y, w, h, pts, color) {
  const els = [];
  const n = pts.length;
  const maxV = Math.max(...pts);
  const minV = Math.min(...pts);
  const range = maxV - minV || 1;
  const coords = pts.map((p, i) => ({
    sx: x + (i / (n - 1)) * w,
    sy: y + h - ((p - minV) / range) * h,
  }));
  for (let i = 0; i < coords.length - 1; i++) {
    els.push(line(coords[i].sx, coords[i].sy, coords[i + 1].sx, coords[i + 1].sy, color, { sw: 1.5, opacity: 0.9 }));
  }
  // End dot
  const last = coords[coords.length - 1];
  els.push(circle(last.sx, last.sy, 3, color));
  return els;
}

function alertRow(x, y, w, level, msg, time, src) {
  const lvlColor = level === 'CRIT' ? C.accent3 : level === 'WARN' ? C.accent4 : C.accent2;
  return [
    rect(x, y, w, 48, C.card, { rx: 4, stroke: C.border, sw: 1 }),
    rect(x, y, 3, 48, lvlColor, { rx: 2, opacity: 0.9 }),
    text(x + 14, y + 15, level, 8, lvlColor, { fw: 700, ls: 2 }),
    text(x + 14, y + 33, msg, 10, C.text, { fw: 500 }),
    text(x + w - 10, y + 15, time, 8, C.textDim, { anchor: 'end' }),
    text(x + w - 10, y + 33, src, 9, C.mutedTxt, { anchor: 'end' }),
  ];
}

function hostRow(x, y, w, hostname, ip, status, cpu, mem) {
  const dot = status === 'UP' ? C.accent : status === 'WARN' ? C.accent4 : C.accent3;
  return [
    rect(x, y, w, 52, C.card, { rx: 4, stroke: C.border, sw: 1 }),
    circle(x + 14, y + 18, 5, dot),
    text(x + 27, y + 20, hostname, 11, C.white, { fw: 600 }),
    text(x + 27, y + 36, ip, 9, C.textDim),
    text(x + w - 10, y + 16, `CPU ${cpu}%`, 9, cpu > 80 ? C.accent3 : C.mutedTxt, { anchor: 'end' }),
    text(x + w - 10, y + 32, `MEM ${mem}%`, 9, mem > 90 ? C.accent4 : C.mutedTxt, { anchor: 'end' }),
  ];
}

function logLine(x, y, w, level, msg, ts) {
  const lvlColor = level === 'ERR' ? C.accent3 : level === 'WRN' ? C.accent4 : level === 'INF' ? C.accent2 : C.accent;
  return [
    text(x, y, ts, 9, C.textDim, { fw: 400 }),
    text(x + 72, y, level, 9, lvlColor, { fw: 700, ls: 1 }),
    text(x + 105, y, msg, 9, C.text, { fw: 400 }),
  ];
}

function progressBar(x, y, w, label, pct, color) {
  return [
    text(x, y, label, 9, C.textDim, { fw: 500 }),
    text(x + w, y, `${pct}%`, 9, color, { anchor: 'end', fw: 600 }),
    rect(x, y + 6, w, 4, C.card2, { rx: 2 }),
    rect(x, y + 6, w * (pct / 100), 4, color, { rx: 2 }),
  ];
}

// ─── Screen 1: COMMAND (Overview) ───────────────────────────
function makeCommand() {
  const els = [];

  // Background
  els.push(rect(0, 0, W, H, C.bg));

  // Ambient gradient glow behind hero stats
  els.push(rect(40, 55, 310, 140, C.surf, { rx: 10, opacity: 0.9, stroke: C.border, sw: 1 }));

  // Status bar
  statusBar('23:41:07').forEach(e => els.push(e));

  // Hero section — threat level indicator
  els.push(text(W / 2, 92, 'THREAT LEVEL', 9, C.mutedTxt, { anchor: 'middle', ls: 3, fw: 700 }));
  // Large threat number - typography as primary visual
  els.push(text(W / 2, 155, '2', 72, C.accent4, { anchor: 'middle', fw: 800 }));
  els.push(text(W / 2, 175, '/ 5', 16, C.textDim, { anchor: 'middle', fw: 400 }));
  els.push(text(W / 2, 196, 'ELEVATED', 10, C.accent4, { anchor: 'middle', ls: 4, fw: 700 }));

  // Divider
  els.push(line(16, 210, W - 16, 210, C.border, { sw: 1 }));

  // Mini metrics row
  const miniMetrics = [
    { label: 'HOSTS', value: '247', color: C.text },
    { label: 'EVENTS/s', value: '1.4K', color: C.accent2 },
    { label: 'ALERTS', value: '12', color: C.accent3 },
    { label: 'UPTIME', value: '99.8', color: C.accent },
  ];
  const mw = (W - 32) / 4;
  miniMetrics.forEach((m, i) => {
    const mx = 16 + i * mw + mw / 2;
    if (i > 0) els.push(line(16 + i * mw, 220, 16 + i * mw, 256, C.border, { sw: 1 }));
    els.push(text(mx, 232, m.value, 16, m.color, { anchor: 'middle', fw: 700 }));
    els.push(text(mx, 248, m.label, 7, C.textDim, { anchor: 'middle', ls: 1.5, fw: 600 }));
  });

  els.push(line(16, 260, W - 16, 260, C.border, { sw: 1 }));

  // Network activity grid (8x4 surveillance panel aesthetic)
  els.push(...sectionHeader(16, 284, 'NETWORK HEATMAP', 'LAST 4H'));
  const COLS = 24, ROWS = 6;
  const gx = 16, gy = 294, gcw = (W - 32) / COLS, gch = 14;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const intensity = Math.random();
      let fill = C.card;
      let opacity = 0.4;
      if (intensity > 0.9) { fill = C.accent3; opacity = 0.9; }
      else if (intensity > 0.75) { fill = C.accent4; opacity = 0.8; }
      else if (intensity > 0.5) { fill = C.accent2; opacity = 0.4; }
      else if (intensity > 0.3) { fill = C.accent; opacity = 0.25; }
      els.push(rect(gx + c * gcw + 1, gy + r * (gch + 2), gcw - 2, gch, fill, { rx: 1, opacity }));
    }
  }

  // Active connections
  const connY = gy + ROWS * (gch + 2) + 16;
  els.push(...sectionHeader(16, connY, 'TOP CONNECTIONS', 'NOW'));

  const conns = [
    { src: '10.0.0.12', dst: '185.220.101.34', bw: '2.1 MB/s', type: 'OUT', alert: true },
    { src: '10.0.0.8', dst: '172.16.4.22', bw: '847 KB/s', type: 'IN', alert: false },
    { src: '10.0.0.31', dst: '95.169.0.4', bw: '420 KB/s', type: 'OUT', alert: false },
  ];
  conns.forEach((c, i) => {
    const cy2 = connY + 14 + i * 52;
    els.push(rect(16, cy2, W - 32, 46, C.card, { rx: 4, stroke: c.alert ? C.accent3 : C.border, sw: c.alert ? 1.5 : 1 }));
    if (c.alert) els.push(rect(16, cy2, 3, 46, C.accent3, { rx: 2 }));
    els.push(text(28, cy2 + 16, c.src, 10, C.text, { fw: 600 }));
    els.push(text(28, cy2 + 32, '→ ' + c.dst, 9, C.textDim));
    els.push(text(W - 28, cy2 + 16, c.bw, 10, c.type === 'OUT' ? C.accent2 : C.accent, { anchor: 'end', fw: 600 }));
    els.push(text(W - 28, cy2 + 32, c.type, 8, C.mutedTxt, { anchor: 'end', ls: 1.5 }));
  });

  // bottom nav
  bottomNav(0).forEach(e => els.push(e));

  return els.filter(Boolean);
}

// ─── Screen 2: SIGNALS (Alerts) ──────────────────────────────
function makeSignals() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  statusBar('23:41:31').forEach(e => els.push(e));

  // Page header
  els.push(text(16, 72, 'SIGNAL FEED', 14, C.white, { fw: 700, ls: 2 }));
  els.push(text(16, 90, '12 ACTIVE — 3 CRITICAL', 9, C.accent3, { fw: 600, ls: 1 }));

  // Filter tabs
  const tabs = ['ALL', 'CRIT', 'WARN', 'INFO'];
  const tabW = (W - 32) / 4;
  tabs.forEach((t, i) => {
    const isActive = i === 0;
    els.push(rect(16 + i * tabW, 100, tabW - 4, 26, isActive ? C.accent : C.card, { rx: 4 }));
    els.push(text(16 + i * tabW + (tabW - 4) / 2, 118, t, 9, isActive ? C.bg : C.textDim, { anchor: 'middle', fw: 700, ls: 1.5 }));
  });

  els.push(line(16, 134, W - 16, 134, C.border, { sw: 1 }));

  const alerts = [
    { level: 'CRIT', msg: 'SSH brute force detected', time: '23:40', src: 'auth.guard' },
    { level: 'CRIT', msg: 'Outbound C2 traffic: 185.220.x', time: '23:38', src: 'netflow' },
    { level: 'CRIT', msg: 'Priv escalation attempt blocked', time: '23:35', src: 'syscall' },
    { level: 'WARN', msg: 'High egress bandwidth on host-12', time: '23:30', src: 'bw.monitor' },
    { level: 'WARN', msg: 'TLS certificate expiry in 5d', time: '23:21', src: 'cert.watch' },
    { level: 'WARN', msg: 'API rate limit hit: /v2/ingest', time: '23:14', src: 'api.guard' },
    { level: 'INFO', msg: 'Deployment completed: svc-relay', time: '23:10', src: 'deploy' },
    { level: 'INFO', msg: '47 new nodes registered', time: '23:05', src: 'discovery' },
  ];

  alerts.forEach((a, i) => {
    alertRow(16, 142 + i * 54, W - 32, a.level, a.msg, a.time, a.src).forEach(e => els.push(e));
  });

  bottomNav(1).forEach(e => els.push(e));
  return els.filter(Boolean);
}

// ─── Screen 3: HOSTS ─────────────────────────────────────────
function makeHosts() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  statusBar('23:42:05').forEach(e => els.push(e));

  els.push(text(16, 72, 'HOST ROSTER', 14, C.white, { fw: 700, ls: 2 }));

  // Summary bubbles
  const summary = [
    { label: 'UP', count: 239, color: C.accent },
    { label: 'WARN', count: 6, color: C.accent4 },
    { label: 'DOWN', count: 2, color: C.accent3 },
  ];
  const bw = (W - 32) / 3;
  summary.forEach((s, i) => {
    const bx = 16 + i * bw;
    els.push(rect(bx, 82, bw - 8, 40, C.card, { rx: 6, stroke: s.color, sw: 1, opacity: 0.9 }));
    els.push(text(bx + (bw - 8) / 2, 99, String(s.count), 16, s.color, { anchor: 'middle', fw: 700 }));
    els.push(text(bx + (bw - 8) / 2, 113, s.label, 8, C.textDim, { anchor: 'middle', ls: 2, fw: 600 }));
  });

  els.push(line(16, 130, W - 16, 130, C.border, { sw: 1 }));

  // Search bar
  els.push(rect(16, 138, W - 32, 34, C.card, { rx: 6, stroke: C.border, sw: 1 }));
  els.push(text(34, 160, '⌕  Filter hosts...', 11, C.textDim, { fw: 400 }));

  els.push(...sectionHeader(16, 190, 'ACTIVE HOSTS', 'CPU · MEM'));

  const hosts = [
    { name: 'prod-web-01', ip: '10.0.1.11', status: 'UP', cpu: 34, mem: 67 },
    { name: 'prod-api-02', ip: '10.0.1.12', status: 'WARN', cpu: 87, mem: 72 },
    { name: 'prod-db-01', ip: '10.0.2.10', status: 'UP', cpu: 42, mem: 88 },
    { name: 'prod-db-02', ip: '10.0.2.11', status: 'UP', cpu: 38, mem: 84 },
    { name: 'edge-node-07', ip: '10.0.4.7', status: 'DOWN', cpu: 0, mem: 0 },
    { name: 'analytics-01', ip: '10.0.3.5', status: 'UP', cpu: 55, mem: 61 },
    { name: 'cache-redis-01', ip: '10.0.2.20', status: 'UP', cpu: 12, mem: 45 },
    { name: 'proxy-haproxy', ip: '10.0.1.2', status: 'WARN', cpu: 92, mem: 58 },
  ];

  hosts.forEach((h, i) => {
    hostRow(16, 202 + i * 58, W - 32, h.name, h.ip, h.status, h.cpu, h.mem).forEach(e => els.push(e));
  });

  bottomNav(2).forEach(e => els.push(e));
  return els.filter(Boolean);
}

// ─── Screen 4: METRICS ───────────────────────────────────────
function makeMetrics() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  statusBar('23:43:11').forEach(e => els.push(e));

  els.push(text(16, 72, 'TELEMETRY', 14, C.white, { fw: 700, ls: 2 }));
  els.push(text(W - 16, 72, 'LIVE · 1s', 9, C.accent, { anchor: 'end', fw: 600, ls: 1 }));

  // Big metric cards
  const cards = [
    { label: 'REQ / MIN', value: '14.2K', unit: '', delta: '+3.1%', status: 'ok' },
    { label: 'ERROR RATE', value: '0.31', unit: '%', delta: '▲0.1', status: 'warn' },
    { label: 'P99 LATENCY', value: '142', unit: 'ms', delta: '-12ms', status: 'ok' },
    { label: 'DISK UTIL', value: '73', unit: '%', delta: '+0.4%', status: 'ok' },
  ];
  const cw2 = (W - 40) / 2;
  cards.forEach((c, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    metricCard(16 + col * (cw2 + 8), 82 + row * 90, cw2, 82, c.label, c.value, c.unit, c.delta, c.status).forEach(e => els.push(e));
  });

  // Throughput sparkline
  const spY = 272;
  els.push(...sectionHeader(16, spY, 'THROUGHPUT', '60 SEC'));
  els.push(rect(16, spY + 10, W - 32, 60, C.card, { rx: 6, stroke: C.border, sw: 1 }));
  // Y-axis grid lines
  [0.25, 0.5, 0.75].forEach(pct => {
    els.push(line(16, spY + 10 + pct * 60, W - 16, spY + 10 + pct * 60, C.border, { sw: 1, opacity: 0.5 }));
  });
  const throughput = [8200, 9100, 10400, 11200, 10800, 12100, 13400, 14200, 14800, 13900, 14200, 15100, 14600, 14200];
  sparkline(22, spY + 14, W - 44, 52, throughput, C.accent2).forEach(e => els.push(e));
  els.push(text(20, spY + 78, '0', 8, C.textDim));
  els.push(text(20, spY + 16, '15K', 8, C.textDim));

  // CPU per-core bars
  const cpuY = spY + 80;
  els.push(...sectionHeader(16, cpuY, 'CPU CORES', '8 CORES'));
  const cores = [34, 87, 42, 28, 65, 78, 31, 55];
  const barW = (W - 32 - 7 * 6) / 8;
  cores.forEach((pct, i) => {
    const bx = 16 + i * (barW + 6);
    const bh = (pct / 100) * 44;
    const col = pct > 80 ? C.accent3 : pct > 60 ? C.accent4 : C.accent2;
    els.push(rect(bx, cpuY + 12, barW, 44, C.card2, { rx: 2 }));
    els.push(rect(bx, cpuY + 12 + (44 - bh), barW, bh, col, { rx: 2 }));
    els.push(text(bx + barW / 2, cpuY + 64, `C${i}`, 7, C.textDim, { anchor: 'middle' }));
  });

  // Memory ring chart (simplified)
  const memY = cpuY + 72;
  els.push(...sectionHeader(16, memY, 'MEMORY BREAKDOWN', ''));
  const memItems = [
    { label: 'HEAP', pct: 62, color: C.accent2 },
    { label: 'CACHE', pct: 21, color: C.accent },
    { label: 'BUFFERS', pct: 11, color: C.accent4 },
    { label: 'FREE', pct: 6, color: C.mutedTxt },
  ];
  memItems.forEach((m, i) => {
    progressBar(16, memY + 14 + i * 22, W - 32, `${m.label}  `, m.pct, m.color).forEach(e => els.push(e));
  });

  bottomNav(3).forEach(e => els.push(e));
  return els.filter(Boolean);
}

// ─── Screen 5: LOGS ──────────────────────────────────────────
function makeLogs() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  statusBar('23:44:02').forEach(e => els.push(e));

  els.push(text(16, 72, 'LOG STREAM', 14, C.white, { fw: 700, ls: 2 }));

  // Filter pills
  const pills = ['ALL', 'ERR', 'WRN', 'INF', 'DBG'];
  let px = 16;
  pills.forEach((p, i) => {
    const isActive = i === 0;
    const pw = p.length * 8 + 16;
    els.push(rect(px, 80, pw, 22, isActive ? C.accent : C.card, { rx: 11, stroke: isActive ? 'none' : C.border, sw: 1 }));
    els.push(text(px + pw / 2, 95, p, 8, isActive ? C.bg : C.textDim, { anchor: 'middle', fw: 700, ls: 1 }));
    px += pw + 6;
  });

  // Terminal-style log viewer
  els.push(rect(0, 110, W, H - 174, C.surf, { rx: 0 }));
  // Log line separator with terminal header
  els.push(rect(0, 110, W, 20, C.card2));
  els.push(text(12, 124, '▶ STREAMING — 1,247 LINES', 8, C.accent, { fw: 600, ls: 1 }));
  els.push(text(W - 12, 124, '⏸ PAUSE', 8, C.accent2, { anchor: 'end', fw: 600, ls: 1 }));

  // Log lines
  const logs = [
    { level: 'ERR', msg: 'conn refused: 10.0.2.10:5432', ts: '23:44:01' },
    { level: 'ERR', msg: 'db query timeout after 30s', ts: '23:44:01' },
    { level: 'WRN', msg: 'rate limit: 429 → client 10.0.1.5', ts: '23:43:59' },
    { level: 'INF', msg: 'svc-api: health check OK', ts: '23:43:58' },
    { level: 'INF', msg: 'deploy: sha=7c3d2f9 applied', ts: '23:43:57' },
    { level: 'DBG', msg: 'cache hit: /v2/users/{id}', ts: '23:43:56' },
    { level: 'INF', msg: 'svc-web: handled 142 reqs', ts: '23:43:55' },
    { level: 'WRN', msg: 'disk I/O wait: 45ms', ts: '23:43:54' },
    { level: 'INF', msg: 'gc run: freed 842 MB', ts: '23:43:53' },
    { level: 'DBG', msg: 'trace: span=user-auth ok', ts: '23:43:52' },
    { level: 'ERR', msg: 'socket hang up: svc-relay', ts: '23:43:51' },
    { level: 'INF', msg: 'cron: cleanup-sessions done', ts: '23:43:50' },
    { level: 'INF', msg: 'svc-api: health check OK', ts: '23:43:49' },
    { level: 'WRN', msg: 'auth: 3x failed login root@…', ts: '23:43:48' },
    { level: 'DBG', msg: 'queue depth: 247 pending', ts: '23:43:47' },
    { level: 'INF', msg: 'node prod-web-03 joined mesh', ts: '23:43:46' },
  ];

  logs.forEach((l, i) => {
    const ly = 140 + i * 18;
    if (i % 2 === 0) els.push(rect(0, ly - 4, W, 18, C.card, { opacity: 0.35 }));
    logLine(10, ly + 10, W - 20, l.level, l.msg, l.ts).forEach(e => els.push(e));
  });

  bottomNav(4).forEach(e => els.push(e));
  return els.filter(Boolean);
}

// ─── Screen 6: INTEL (Threat Intelligence) ───────────────────
function makeIntel() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  statusBar('23:44:45').forEach(e => els.push(e));

  els.push(text(16, 72, 'THREAT INTEL', 14, C.white, { fw: 700, ls: 2 }));
  els.push(text(16, 90, 'OSINT FEEDS — AUTO-ENRICHED', 9, C.accent2, { fw: 600, ls: 1 }));

  // Threat origin map placeholder — grid with highlighted zones
  els.push(...sectionHeader(16, 106, 'ATTACK ORIGIN MAP', '24H'));
  els.push(rect(16, 118, W - 32, 100, C.card, { rx: 6, stroke: C.border, sw: 1 }));

  // ASCII-art-inspired world map dots (grid of dots at different intensities)
  const MAP_COLS = 38, MAP_ROWS = 8;
  const dotW = (W - 48) / MAP_COLS;
  const dotH = 80 / MAP_ROWS;
  // Hot zones (simulated threat origins)
  const hotZones = [[4, 2], [5, 2], [4, 3], [5, 3], [10, 3], [11, 3], [11, 4], [22, 2], [23, 2], [22, 3], [28, 3], [29, 3], [30, 2]];
  const warmZones = [[3, 2], [6, 2], [9, 3], [12, 3], [21, 2], [24, 2], [27, 3], [31, 2]];

  for (let r = 0; r < MAP_ROWS; r++) {
    for (let c = 0; c < MAP_COLS; c++) {
      const isHot = hotZones.some(([hc, hr]) => hc === c && hr === r);
      const isWarm = warmZones.some(([wc, wr]) => wc === c && wr === r);
      const fill = isHot ? C.accent3 : isWarm ? C.accent4 : C.border;
      const op = isHot ? 1 : isWarm ? 0.8 : 0.5;
      els.push(circle(24 + c * dotW, 128 + r * dotH, isHot ? 3 : 2, fill, { opacity: op }));
    }
  }

  // Map legend
  els.push(circle(20, 224, 4, C.accent3)); els.push(text(28, 228, 'HIGH', 8, C.textDim, { fw: 600 }));
  els.push(circle(65, 224, 4, C.accent4)); els.push(text(73, 228, 'MED', 8, C.textDim, { fw: 600 }));
  els.push(circle(108, 224, 3, C.border, { opacity: 0.8 })); els.push(text(116, 228, 'LOW', 8, C.textDim, { fw: 600 }));

  // Top threat IPs
  els.push(...sectionHeader(16, 240, 'FLAGGED IPs', 'ENRICHED'));
  const ips = [
    { ip: '185.220.101.34', country: 'RU', score: 98, type: 'C2 RELAY', events: 14 },
    { ip: '95.169.0.4', country: 'CN', score: 84, type: 'PORT SCAN', events: 7 },
    { ip: '91.108.4.77', country: 'IR', score: 71, type: 'BRUTE SSH', events: 23 },
    { ip: '45.142.20.55', country: 'UA', score: 56, type: 'CRAWLER', events: 3 },
  ];

  ips.forEach((ip, i) => {
    const iy = 252 + i * 58;
    const scoreCol = ip.score > 90 ? C.accent3 : ip.score > 70 ? C.accent4 : C.accent2;
    els.push(rect(16, iy, W - 32, 52, C.card, { rx: 4, stroke: ip.score > 90 ? C.accent3 : C.border, sw: ip.score > 90 ? 1.5 : 1 }));
    // Score badge
    els.push(rect(W - 68, iy + 10, 44, 32, C.card2, { rx: 4 }));
    els.push(text(W - 46, iy + 31, String(ip.score), 18, scoreCol, { anchor: 'middle', fw: 700 }));
    els.push(text(26, iy + 18, ip.ip, 11, C.white, { fw: 600 }));
    els.push(text(26, iy + 34, ip.type, 9, ip.score > 90 ? C.accent3 : C.accent4, { fw: 600, ls: 1 }));
    // Country flag-like tag
    els.push(rect(W - 120, iy + 14, 28, 16, C.card2, { rx: 3 }));
    els.push(text(W - 106, iy + 26, ip.country, 8, C.textDim, { anchor: 'middle', fw: 700, ls: 1 }));
    els.push(text(W - 74, iy + 40, `${ip.events} events`, 8, C.textDim, { anchor: 'end' }));
  });

  // Reputation feeds status
  els.push(...sectionHeader(16, 488, 'INTEL FEEDS', ''));
  const feeds = [
    { name: 'AbuseIPDB', status: 'OK', lag: '4s' },
    { name: 'Shodan Scan', status: 'OK', lag: '2m' },
    { name: 'AlienVault OTX', status: 'DEGRADED', lag: '—' },
    { name: 'GreyNoise', status: 'OK', lag: '8s' },
  ];
  feeds.forEach((f, i) => {
    const fy = 500 + i * 34;
    const dot = f.status === 'OK' ? C.accent : C.accent4;
    els.push(rect(16, fy, W - 32, 28, C.card, { rx: 4, stroke: C.border, sw: 1 }));
    els.push(circle(28, fy + 14, 4, dot));
    els.push(text(40, fy + 19, f.name, 10, C.text, { fw: 500 }));
    els.push(text(W - 26, fy + 14, f.lag, 9, C.textDim, { anchor: 'end' }));
    els.push(text(W - 26, fy + 24, f.status, 7, dot, { anchor: 'end', fw: 600, ls: 1 }));
  });

  // No bottom nav on this screen — show a full-width FAB instead
  els.push(rect(16, H - 56, W - 32, 40, C.accent, { rx: 6 }));
  els.push(text(W / 2, H - 31, '↺  REFRESH INTEL', 11, C.bg, { anchor: 'middle', fw: 700, ls: 2 }));

  return els.filter(Boolean);
}

// ─── Build all screens ───────────────────────────────────────
const screens = [
  { name: 'Command', fn: makeCommand },
  { name: 'Signals', fn: makeSignals },
  { name: 'Hosts', fn: makeHosts },
  { name: 'Metrics', fn: makeMetrics },
  { name: 'Logs', fn: makeLogs },
  { name: 'Intel', fn: makeIntel },
];

const pen = {
  version: '2.8',
  metadata: {
    name: `${NAME} — ${TAGLINE}`,
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'dark',
    heartbeat: HEARTBEAT,
    inspiration: 'DarkModeDesign.com stepped elevation + Godly.website surveillance aesthetic',
    elements: 0,
  },
  screens: screens.map(s => {
    const elements = s.fn();
    return {
      name: s.name,
      svg: '',
      elements,
    };
  }),
};

// Count elements
pen.metadata.elements = pen.screens.reduce((acc, s) => acc + s.elements.length, 0);
pen.screens.forEach(s => { s.elementCount = s.elements.length; });

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${pen.screens.length} screens, ${pen.metadata.elements} elements`);
pen.screens.forEach(s => console.log(`  · ${s.name}: ${s.elementCount} elements`));
console.log(`Written: ${SLUG}.pen`);
