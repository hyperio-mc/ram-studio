#!/usr/bin/env node
// VOID — Infrastructure topology for the dark web of services
// Inspired by: Cecilia (darkmodedesign.com) — molecular spheres + pure black + Midday's utility-first SaaS
// Theme: DARK — pure #050505 black + electric cyan #00E5FF + violet #7B61FF

const fs = require('fs');

const W = 390, H = 844;

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Palette ───────────────────────────────────────────────────────────────
const C = {
  bg:        '#050505',
  surface:   '#0D0D0D',
  surface2:  '#131313',
  border:    '#1C1C1C',
  borderLit: '#2A2A2A',
  text:      '#F0EEE8',
  muted:     'rgba(240,238,232,0.38)',
  cyan:      '#00E5FF',
  cyanDim:   'rgba(0,229,255,0.12)',
  cyanGlow:  'rgba(0,229,255,0.06)',
  violet:    '#7B61FF',
  violetDim: 'rgba(123,97,255,0.12)',
  amber:     '#FFB020',
  amberDim:  'rgba(255,176,32,0.12)',
  red:       '#FF4444',
  redDim:    'rgba(255,68,68,0.12)',
  green:     '#00D084',
  greenDim:  'rgba(0,208,132,0.10)',
};

// ─── Font helpers ───────────────────────────────────────────────────────────
const MONO = "'JetBrains Mono', 'Fira Code', monospace";
const SANS = "'Inter', system-ui, sans-serif";

function text(content, x, y, opts = {}) {
  return {
    id: makeId(), type: 'text', x, y,
    content: String(content),
    fontSize: opts.size || 14,
    fontFamily: opts.font || SANS,
    fontWeight: opts.weight || '400',
    letterSpacing: opts.ls || 0,
    color: opts.color || C.text,
    textAlign: opts.align || 'left',
    opacity: opts.opacity || 1,
  };
}

function rect(x, y, w, h, opts = {}) {
  return {
    id: makeId(), type: 'rectangle', x, y, width: w, height: h,
    fill: opts.fill || 'transparent',
    stroke: opts.stroke || 'transparent',
    strokeWidth: opts.sw || 1,
    cornerRadius: opts.r || 0,
    opacity: opts.opacity || 1,
    shadow: opts.shadow || null,
  };
}

function line(x1, y1, x2, y2, opts = {}) {
  return {
    id: makeId(), type: 'line',
    x1, y1, x2, y2,
    stroke: opts.stroke || C.border,
    strokeWidth: opts.sw || 1,
    opacity: opts.opacity || 1,
  };
}

function circle(cx, cy, r, opts = {}) {
  return {
    id: makeId(), type: 'ellipse',
    x: cx - r, y: cy - r,
    width: r * 2, height: r * 2,
    fill: opts.fill || 'transparent',
    stroke: opts.stroke || 'transparent',
    strokeWidth: opts.sw || 1,
    opacity: opts.opacity || 1,
    shadow: opts.shadow || null,
  };
}

// ─── Shared nav bar ──────────────────────────────────────────────────────────
function navBar(activeIdx) {
  const items = [
    { label: 'TOPOLOGY', icon: '⬡' },
    { label: 'NODES',    icon: '◉'  },
    { label: 'ALERTS',   icon: '⚡' },
    { label: 'TRACES',   icon: '↔' },
  ];
  const tabW = W / items.length;
  const els = [];

  // Background
  els.push(rect(0, H - 72, W, 72, { fill: C.surface, stroke: C.border, sw: 1, r: 0 }));
  // Top border line
  els.push(line(0, H - 72, W, H - 72, { stroke: C.borderLit, sw: 1 }));

  items.forEach((item, i) => {
    const cx = tabW * i + tabW / 2;
    const isActive = i === activeIdx;
    const col = isActive ? C.cyan : C.muted;

    // Active indicator pill
    if (isActive) {
      els.push(rect(cx - 18, H - 72 + 4, 36, 2, { fill: C.cyan, r: 1 }));
    }
    // Icon
    els.push(text(item.icon, cx, H - 72 + 20, {
      size: 16, color: col, align: 'center', font: SANS,
    }));
    // Label
    els.push(text(item.label, cx, H - 72 + 42, {
      size: 8, color: col, align: 'center', font: MONO, ls: 0.08, weight: isActive ? '600' : '400',
    }));
  });
  return els;
}

// ─── Status badge ────────────────────────────────────────────────────────────
function statusBadge(x, y, label, color, bgColor) {
  const w = label.length * 5.5 + 16;
  return [
    rect(x, y, w, 18, { fill: bgColor, r: 4 }),
    text(label, x + w / 2, y + 5, { size: 8, color, align: 'center', font: MONO, weight: '600', ls: 0.06 }),
  ];
}

// ─── NODE TOPOLOGY — CONNECTION LINE ─────────────────────────────────────────
function connectionLine(x1, y1, x2, y2, status) {
  const color = status === 'active' ? C.cyan : status === 'warn' ? C.amber : C.border;
  const opacity = status === 'active' ? 0.4 : 0.2;
  return [
    line(x1, y1, x2, y2, { stroke: color, sw: 1, opacity }),
  ];
}

// ─── NODE ORB ────────────────────────────────────────────────────────────────
function nodeOrb(cx, cy, size, status, label, sublabel) {
  const color = status === 'ok' ? C.cyan : status === 'warn' ? C.amber : status === 'error' ? C.red : C.muted;
  const glowColor = status === 'ok' ? 'rgba(0,229,255,0.18)' : status === 'warn' ? 'rgba(255,176,32,0.18)' : status === 'error' ? 'rgba(255,68,68,0.18)' : 'transparent';
  const els = [];

  // Outer glow ring
  els.push(circle(cx, cy, size + 8, { fill: glowColor, stroke: 'transparent' }));
  // Main sphere body
  els.push(circle(cx, cy, size, { fill: C.surface2, stroke: color, sw: 1.5,
    shadow: `0 0 ${size}px ${color}40` }));
  // Inner highlight
  els.push(circle(cx - size * 0.25, cy - size * 0.3, size * 0.3, { fill: 'rgba(255,255,255,0.06)', stroke: 'transparent' }));
  // Center dot
  els.push(circle(cx, cy, 3, { fill: color, stroke: 'transparent' }));

  // Label below
  if (label) {
    els.push(text(label, cx, cy + size + 14, { size: 9, color: C.text, align: 'center', font: MONO, weight: '500', ls: 0.04 }));
  }
  if (sublabel) {
    els.push(text(sublabel, cx, cy + size + 26, { size: 8, color: C.muted, align: 'center', font: MONO }));
  }

  return els;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCREEN 1 — TOPOLOGY MAP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function screen1() {
  const els = [];

  // Background
  els.push(rect(0, 0, W, H, { fill: C.bg }));

  // Header
  els.push(rect(0, 0, W, 56, { fill: C.surface }));
  els.push(line(0, 56, W, 56, { stroke: C.borderLit, sw: 1 }));
  els.push(text('VOID', 20, 16, { size: 18, color: C.text, font: MONO, weight: '700', ls: 0.12 }));
  els.push(text('v2.4.1', 68, 22, { size: 9, color: C.muted, font: MONO }));
  // Cluster status indicator
  els.push(circle(W - 40, 28, 5, { fill: C.cyan, shadow: `0 0 8px ${C.cyan}` }));
  els.push(text('LIVE', W - 30, 21, { size: 9, color: C.cyan, font: MONO, weight: '600', ls: 0.1 }));

  // Topology title
  els.push(text('CLUSTER TOPOLOGY', 20, 72, { size: 10, color: C.muted, font: MONO, ls: 0.12, weight: '500' }));
  els.push(text('us-east-1  /  prod', 20, 90, { size: 12, color: C.text, font: MONO, weight: '600' }));

  // Cluster health bar
  const barY = 108;
  els.push(rect(20, barY, W - 40, 3, { fill: C.borderLit, r: 2 }));
  els.push(rect(20, barY, (W - 40) * 0.87, 3, { fill: C.cyan, r: 2 })); // 87% healthy

  // --- NODE MAP ---
  // Node positions: hub-and-spoke with central gateway
  const nodes = [
    { cx: W/2,       cy: 240,  r: 22, status: 'ok',    label: 'GATEWAY',  sub: '4 replicas' },
    { cx: W/2 - 105, cy: 330,  r: 16, status: 'ok',    label: 'AUTH',     sub: '99.9%'      },
    { cx: W/2 + 105, cy: 330,  r: 16, status: 'ok',    label: 'API',      sub: '2.1ms'      },
    { cx: W/2 - 115, cy: 450,  r: 14, status: 'warn',  label: 'CACHE',    sub: '78% full'   },
    { cx: W/2,       cy: 460,  r: 14, status: 'ok',    label: 'DB-01',    sub: 'primary'    },
    { cx: W/2 + 110, cy: 450,  r: 14, status: 'ok',    label: 'DB-02',    sub: 'replica'    },
    { cx: W/2 - 55,  cy: 560,  r: 12, status: 'error', label: 'WORKER-3', sub: 'offline'    },
    { cx: W/2 + 60,  cy: 555,  r: 12, status: 'ok',    label: 'QUEUE',    sub: '14 jobs'    },
  ];

  // Connection lines (defined by index pairs)
  const connections = [
    [0, 1, 'active'], [0, 2, 'active'],
    [1, 3, 'active'], [2, 3, 'warn'],
    [2, 5, 'active'], [0, 4, 'active'],
    [3, 6, 'active'], [4, 7, 'active'],
    [1, 4, 'active'],
  ];

  connections.forEach(([a, b, st]) => {
    const na = nodes[a], nb = nodes[b];
    connectionLine(na.cx, na.cy, nb.cx, nb.cy, st).forEach(e => els.push(e));
  });

  // Nodes
  nodes.forEach(n => {
    nodeOrb(n.cx, n.cy, n.r, n.status, n.label, n.sub).forEach(e => els.push(e));
  });

  // Stats footer strip
  const stripY = H - 72 - 64;
  els.push(rect(0, stripY, W, 60, { fill: C.surface }));
  els.push(line(0, stripY, W, stripY, { stroke: C.borderLit, sw: 1 }));

  const stats = [
    { label: 'NODES', value: '8/9' },
    { label: 'LATENCY', value: '2.4ms' },
    { label: 'REQ/S', value: '4.2K' },
  ];
  stats.forEach((s, i) => {
    const sx = 20 + i * 115;
    els.push(text(s.label, sx, stripY + 12, { size: 8, color: C.muted, font: MONO, ls: 0.1 }));
    els.push(text(s.value, sx, stripY + 32, { size: 16, color: i === 0 ? C.amber : C.cyan, font: MONO, weight: '600' }));
  });

  // Nav
  navBar(0).forEach(e => els.push(e));

  return { id: makeId(), name: 'Topology', width: W, height: H, backgroundColor: C.bg, elements: els };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCREEN 2 — NODE DETAIL (GATEWAY selected)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function screen2() {
  const els = [];
  els.push(rect(0, 0, W, H, { fill: C.bg }));

  // Header
  els.push(rect(0, 0, W, 56, { fill: C.surface }));
  els.push(line(0, 56, W, 56, { stroke: C.borderLit, sw: 1 }));
  els.push(text('← GATEWAY', 20, 16, { size: 14, color: C.text, font: MONO, weight: '600', ls: 0.04 }));
  els.push(...statusBadge(W - 72, 18, '● HEALTHY', C.cyan, C.cyanDim));

  // Big node orb hero
  const oy = 140;
  nodeOrb(W/2, oy, 40, 'ok', '', '').forEach(e => els.push(e));
  els.push(text('GATEWAY', W/2, oy + 54, { size: 16, color: C.text, font: MONO, weight: '700', ls: 0.1, align: 'center' }));
  els.push(text('nginx / 4 replicas / us-east-1a', W/2, oy + 74, { size: 9, color: C.muted, font: MONO, align: 'center' }));

  // Metrics grid
  const gridY = 240;
  const metrics = [
    { label: 'CPU',     value: '23%',    bar: 0.23, color: C.cyan  },
    { label: 'MEMORY',  value: '41%',    bar: 0.41, color: C.violet },
    { label: 'REQ/S',   value: '4,218',  bar: 0.68, color: C.cyan  },
    { label: 'ERRORS',  value: '0.02%',  bar: 0.02, color: C.green },
  ];
  metrics.forEach((m, i) => {
    const row = gridY + i * 52;
    els.push(rect(20, row, W - 40, 44, { fill: C.surface, stroke: C.border, sw: 1, r: 8 }));
    els.push(text(m.label, 36, row + 10, { size: 8, color: C.muted, font: MONO, ls: 0.1, weight: '500' }));
    els.push(text(m.value, W - 44, row + 8, { size: 14, color: m.color, font: MONO, weight: '600', align: 'right' }));
    // Mini progress bar
    els.push(rect(36, row + 30, W - 72, 3, { fill: C.borderLit, r: 2 }));
    els.push(rect(36, row + 30, (W - 72) * m.bar, 3, { fill: m.color, r: 2 }));
  });

  // Connections section
  const connY = gridY + metrics.length * 52 + 16;
  els.push(text('CONNECTED NODES', 20, connY, { size: 9, color: C.muted, font: MONO, ls: 0.1, weight: '500' }));

  const connNodes = [
    { name: 'AUTH',  latency: '0.8ms', status: 'ok' },
    { name: 'API',   latency: '1.2ms', status: 'ok' },
    { name: 'DB-01', latency: '2.1ms', status: 'ok' },
  ];
  connNodes.forEach((cn, i) => {
    const cy2 = connY + 20 + i * 40;
    const col = cn.status === 'ok' ? C.cyan : C.amber;
    els.push(rect(20, cy2, W - 40, 34, { fill: C.surface, stroke: C.border, sw: 1, r: 6 }));
    els.push(circle(42, cy2 + 17, 6, { fill: C.surface2, stroke: col, sw: 1.5 }));
    els.push(circle(42, cy2 + 17, 2, { fill: col }));
    els.push(text(cn.name, 58, cy2 + 10, { size: 11, color: C.text, font: MONO, weight: '600' }));
    els.push(text(cn.latency, W - 36, cy2 + 10, { size: 10, color: col, font: MONO, align: 'right' }));
  });

  navBar(1).forEach(e => els.push(e));
  return { id: makeId(), name: 'Node Detail', width: W, height: H, backgroundColor: C.bg, elements: els };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCREEN 3 — ALERT FEED
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function screen3() {
  const els = [];
  els.push(rect(0, 0, W, H, { fill: C.bg }));

  // Header
  els.push(rect(0, 0, W, 56, { fill: C.surface }));
  els.push(line(0, 56, W, 56, { stroke: C.borderLit, sw: 1 }));
  els.push(text('ALERTS', 20, 16, { size: 18, color: C.text, font: MONO, weight: '700', ls: 0.08 }));
  // Unread badge
  els.push(rect(W - 56, 14, 36, 22, { fill: C.red, r: 6 }));
  els.push(text('3 NEW', W - 38, 18, { size: 8, color: '#fff', font: MONO, weight: '700', align: 'center' }));

  // Filter row
  const filters = ['ALL', 'CRITICAL', 'WARN', 'INFO'];
  const filterY = 68;
  els.push(rect(0, filterY, W, 36, { fill: C.surface }));
  els.push(line(0, filterY + 36, W, filterY + 36, { stroke: C.border, sw: 1 }));
  filters.forEach((f, i) => {
    const fx = 20 + i * 82;
    const isActive = i === 0;
    if (isActive) {
      els.push(rect(fx - 6, filterY + 8, f.length * 7.5 + 12, 20, { fill: C.cyanDim, stroke: C.cyan, sw: 1, r: 4 }));
    }
    els.push(text(f, fx, filterY + 11, { size: 9, color: isActive ? C.cyan : C.muted, font: MONO, weight: isActive ? '700' : '400', ls: 0.08 }));
  });

  // Alert items
  const alerts = [
    {
      sev: 'CRITICAL', sevColor: C.red, sevBg: C.redDim,
      title: 'WORKER-3 node offline',
      detail: 'No heartbeat for 4m 32s — health check failed',
      node: 'WORKER-3',  time: '2m ago',
      dot: C.red,
    },
    {
      sev: 'WARN', sevColor: C.amber, sevBg: C.amberDim,
      title: 'CACHE memory threshold',
      detail: '78% capacity — approaching 80% limit',
      node: 'CACHE',  time: '8m ago',
      dot: C.amber,
    },
    {
      sev: 'WARN', sevColor: C.amber, sevBg: C.amberDim,
      title: 'API p99 latency spike',
      detail: 'p99 > 480ms — SLA threshold is 400ms',
      node: 'API',  time: '12m ago',
      dot: C.amber,
    },
    {
      sev: 'INFO', sevColor: C.cyan, sevBg: C.cyanDim,
      title: 'DB-02 replica synced',
      detail: 'Replication lag reduced to 0ms',
      node: 'DB-02', time: '19m ago',
      dot: C.cyan,
    },
    {
      sev: 'INFO', sevColor: C.green, sevBg: C.greenDim,
      title: 'Deploy gateway-v2.4.1',
      detail: 'Rolling deploy completed — 4/4 replicas healthy',
      node: 'GATEWAY', time: '34m ago',
      dot: C.green,
    },
  ];

  const aStart = 112;
  alerts.forEach((a, i) => {
    const ay = aStart + i * 100;
    if (ay + 92 > H - 80) return;

    // Card
    const isNew = i < 3;
    els.push(rect(16, ay, W - 32, 90, {
      fill: C.surface,
      stroke: isNew ? (a.dot + '40') : C.border,
      sw: isNew ? 1.5 : 1,
      r: 10,
    }));

    // Left severity stripe
    els.push(rect(16, ay, 3, 90, { fill: a.dot, r: 2 }));

    // Severity badge
    els.push(...statusBadge(32, ay + 12, a.sev, a.sevColor, a.sevBg));

    // NEW indicator
    if (isNew) {
      els.push(circle(W - 30, ay + 18, 4, { fill: a.dot, shadow: `0 0 6px ${a.dot}` }));
    }

    // Time
    els.push(text(a.time, W - 34, ay + 12, { size: 8, color: C.muted, font: MONO, align: 'right' }));

    // Title
    els.push(text(a.title, 32, ay + 36, { size: 12, color: C.text, font: SANS, weight: '500' }));

    // Detail
    els.push(text(a.detail, 32, ay + 55, { size: 10, color: C.muted, font: SANS }));

    // Node tag
    els.push(rect(32, ay + 70, a.node.length * 6.5 + 12, 14, { fill: C.surface2, stroke: C.borderLit, sw: 1, r: 3 }));
    els.push(text(a.node, 38, ay + 73, { size: 8, color: C.muted, font: MONO }));
  });

  navBar(2).forEach(e => els.push(e));
  return { id: makeId(), name: 'Alert Feed', width: W, height: H, backgroundColor: C.bg, elements: els };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCREEN 4 — TRACE VIEW (request path)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function screen4() {
  const els = [];
  els.push(rect(0, 0, W, H, { fill: C.bg }));

  // Header
  els.push(rect(0, 0, W, 56, { fill: C.surface }));
  els.push(line(0, 56, W, 56, { stroke: C.borderLit, sw: 1 }));
  els.push(text('TRACE', 20, 16, { size: 18, color: C.text, font: MONO, weight: '700', ls: 0.08 }));
  els.push(text('trace_a7f3c12b9e', 20, 36, { size: 9, color: C.muted, font: MONO }));

  // Summary row
  const sumY = 72;
  els.push(rect(0, sumY, W, 44, { fill: C.cyanDim }));
  els.push(line(0, sumY + 44, W, sumY + 44, { stroke: C.border, sw: 1 }));
  els.push(text('POST /api/checkout', 20, sumY + 8, { size: 12, color: C.cyan, font: MONO, weight: '500' }));
  els.push(text('Total: 142ms', 20, sumY + 28, { size: 10, color: C.text, font: MONO }));
  els.push(text('200 OK', W - 36, sumY + 8, { size: 12, color: C.green, font: MONO, weight: '600', align: 'right' }));
  els.push(text('4 spans', W - 36, sumY + 28, { size: 9, color: C.muted, font: MONO, align: 'right' }));

  // Waterfall spans
  const spans = [
    { node: 'GATEWAY',  op: 'http.request',  ms: 142, start: 0,   w: 1.0,  color: C.cyan },
    { node: 'AUTH',     op: 'jwt.verify',     ms: 12,  start: 0.02, w: 0.08, color: C.violet },
    { node: 'API',      op: 'db.query',       ms: 98,  start: 0.10, w: 0.69, color: C.cyan },
    { node: 'DB-01',    op: 'postgres.exec',  ms: 82,  start: 0.12, w: 0.58, color: C.amber },
    { node: 'QUEUE',    op: 'job.enqueue',    ms: 8,   start: 0.81, w: 0.06, color: C.green },
  ];

  const wfStart = 124;
  const wfBarW = W - 160;
  const wfLeft = 130;

  spans.forEach((s, i) => {
    const sy = wfStart + i * 50;

    // Row
    els.push(rect(16, sy, W - 32, 42, { fill: C.surface, stroke: C.border, sw: 1, r: 6 }));

    // Node label
    els.push(text(s.node, 28, sy + 7, { size: 9, color: s.color, font: MONO, weight: '600', ls: 0.06 }));
    els.push(text(s.op, 28, sy + 23, { size: 9, color: C.muted, font: MONO }));

    // Waterfall bar
    const bx = wfLeft + s.start * wfBarW;
    const bw = Math.max(s.w * wfBarW, 4);
    // Track
    els.push(rect(wfLeft, sy + 15, wfBarW, 6, { fill: C.borderLit, r: 3 }));
    // Fill
    els.push(rect(bx, sy + 15, bw, 6, { fill: s.color, r: 3 }));

    // ms label
    els.push(text(s.ms + 'ms', W - 20, sy + 7, { size: 9, color: s.color, font: MONO, align: 'right' }));
  });

  // Timeline ruler at bottom of waterfall
  const rulerY = wfStart + spans.length * 50 + 8;
  els.push(line(wfLeft, rulerY, wfLeft + wfBarW, rulerY, { stroke: C.border, sw: 1 }));
  ['0ms', '35ms', '71ms', '106ms', '142ms'].forEach((label, i) => {
    const rx = wfLeft + i * (wfBarW / 4);
    els.push(line(rx, rulerY, rx, rulerY + 4, { stroke: C.border, sw: 1 }));
    els.push(text(label, rx, rulerY + 8, { size: 7, color: C.muted, font: MONO, align: 'center' }));
  });

  navBar(3).forEach(e => els.push(e));
  return { id: makeId(), name: 'Trace View', width: W, height: H, backgroundColor: C.bg, elements: els };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCREEN 5 — CLUSTER CONFIG / SETTINGS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function screen5() {
  const els = [];
  els.push(rect(0, 0, W, H, { fill: C.bg }));

  // Header
  els.push(rect(0, 0, W, 56, { fill: C.surface }));
  els.push(line(0, 56, W, 56, { stroke: C.borderLit, sw: 1 }));
  els.push(text('CONFIG', 20, 16, { size: 18, color: C.text, font: MONO, weight: '700', ls: 0.08 }));
  els.push(text('prod-cluster-01', 20, 36, { size: 9, color: C.cyan, font: MONO }));

  // Section: Cluster Info
  const sections = [
    {
      title: 'CLUSTER',
      y: 72,
      rows: [
        { key: 'Region',   val: 'us-east-1' },
        { key: 'Provider', val: 'AWS EKS' },
        { key: 'K8s',      val: '1.29.3' },
        { key: 'Nodes',    val: '9 (1 offline)' },
      ],
    },
    {
      title: 'THRESHOLDS',
      y: 288,
      rows: [
        { key: 'CPU alert',    val: '80%' },
        { key: 'Mem alert',    val: '75%' },
        { key: 'Latency p99',  val: '400ms' },
        { key: 'Error rate',   val: '1%' },
      ],
    },
    {
      title: 'INTEGRATIONS',
      y: 506,
      rows: [
        { key: 'PagerDuty',  val: '● connected',  col: C.green },
        { key: 'Slack',      val: '● connected',  col: C.green },
        { key: 'DataDog',    val: '○ not linked', col: C.muted },
      ],
    },
  ];

  sections.forEach(sec => {
    els.push(text(sec.title, 20, sec.y + 4, { size: 9, color: C.muted, font: MONO, ls: 0.12, weight: '500' }));
    const cardH = sec.rows.length * 48 + 16;
    els.push(rect(16, sec.y + 20, W - 32, cardH, { fill: C.surface, stroke: C.border, sw: 1, r: 10 }));

    sec.rows.forEach((row, ri) => {
      const ry = sec.y + 20 + 16 + ri * 48;
      els.push(text(row.key, 32, ry + 2, { size: 11, color: C.muted, font: MONO }));
      els.push(text(row.val, W - 32, ry + 2, { size: 11, color: row.col || C.text, font: MONO, align: 'right', weight: '500' }));
      if (ri < sec.rows.length - 1) {
        els.push(line(32, ry + 28, W - 32, ry + 28, { stroke: C.border, sw: 1 }));
      }
    });
  });

  navBar(0).forEach(e => els.push(e));
  return { id: makeId(), name: 'Cluster Config', width: W, height: H, backgroundColor: C.bg, elements: els };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ASSEMBLE + WRITE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const pen = {
  version: '2.8',
  meta: {
    name: 'VOID — Infrastructure Topology',
    description: 'Dark-mode infrastructure monitoring tool. Node topology visualizer inspired by Cecilia (darkmodedesign.com) molecular sphere aesthetic.',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
  },
  screens: [
    screen1(),
    screen2(),
    screen3(),
    screen4(),
    screen5(),
  ],
};

fs.writeFileSync('/workspace/group/design-studio/void.pen', JSON.stringify(pen, null, 2));
console.log('✓ void.pen written —', pen.screens.length, 'screens');
console.log('  Screens:', pen.screens.map(s => s.name).join(', '));
