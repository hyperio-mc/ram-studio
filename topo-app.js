#!/usr/bin/env node
// topo-app.js
// TOPO — Developer observability platform with topographic terrain aesthetic
// Inspired by: San Rita's topographic contour aesthetic (Awwwards SOTD)
//              + Neon database's glowing bioluminescent data bars (darkmodedesign.com)
// Theme: DARK — deep slate, bioluminescent teal, amber warmth for alerts

const fs = require('fs');

const W = 390, H = 844;

const P = {
  bg:       '#090C0D',   // near-black deep slate
  surface:  '#111619',   // card/surface dark
  elevated: '#182023',   // elevated card
  text:     '#C8E0DC',   // cool off-white teal tint
  dim:      '#607A78',   // muted text
  teal:     '#1EC8B0',   // bioluminescent teal (Neon glow accent)
  tealDim:  'rgba(30,200,176,0.18)',
  tealGlow: 'rgba(30,200,176,0.35)',
  amber:    '#F0924A',   // warm amber — alert/elevation (San Rita earth tone)
  amberDim: 'rgba(240,146,74,0.18)',
  red:      '#E05050',
  redDim:   'rgba(224,80,80,0.18)',
  green:    '#3EC87A',
  greenDim: 'rgba(62,200,122,0.18)',
  border:   '#1D282B',
  rule:     '#192124',
};

function rect(x,y,w,h,fill,r=0) {
  return { type:'rect', x, y, w, h, fill, r };
}
function text(content, x, y, size, fill, weight='regular', align='left', font='sans') {
  return { type:'text', content: String(content), x, y, size, fill, weight, align, font };
}
function line(x1,y1,x2,y2,stroke,width=1) {
  return { type:'line', x1, y1, x2, y2, stroke, strokeWidth: width };
}
function circle(cx,cy,r,fill) {
  return { type:'circle', cx, cy, r, fill };
}

// Topographic contour line background pattern
function topoContours(yStart, yEnd) {
  const layers = [];
  // Simulated contour curves as arc-like horizontal lines with slight curves
  const heights = [yStart+20, yStart+44, yStart+70, yStart+98, yStart+128];
  heights.forEach((y, i) => {
    if (y < yEnd) {
      // Wavy contour via line segments (approximated)
      const opacity = 0.04 + i * 0.02;
      const col = `rgba(30,200,176,${opacity})`;
      layers.push(line(0, y, W*0.35, y-12, col, 0.8));
      layers.push(line(W*0.35, y-12, W*0.65, y+8, col, 0.8));
      layers.push(line(W*0.65, y+8, W, y-4, col, 0.8));
    }
  });
  return layers;
}

// Terrain ridge-line chart (glowing fill simulation via stacked rects)
function terrainChart(x, y, w, h, color, values, label) {
  const layers = [];
  // Chart background
  layers.push(rect(x, y, w, h, P.rule, 4));
  // Terrain "ridge" via bars that approximate a line chart
  const barW = w / values.length;
  values.forEach((v, i) => {
    const bh = Math.round(v * h * 0.85);
    const by = y + h - bh;
    // Glow fill
    layers.push(rect(x + i*barW, by, barW-1, bh, `rgba(${hexToRgb(color)},0.15)`, 0));
    // Top glow line
    layers.push(rect(x + i*barW, by, barW-1, 2, color, 0));
  });
  // Label
  layers.push(text(label, x+6, y+12, 9, color, 'semibold', 'left', 'sans'));
  return layers;
}

function hexToRgb(hex) {
  if (hex === P.teal) return '30,200,176';
  if (hex === P.amber) return '240,146,74';
  if (hex === P.green) return '62,200,122';
  if (hex === P.red) return '224,80,80';
  return '200,224,220';
}

// Status pill
function statusPill(x, y, label, color, bgColor) {
  return [
    rect(x, y, 52, 18, bgColor, 9),
    text(label, x+26, y+12, 9, color, 'bold', 'center', 'sans'),
  ];
}

// Bottom nav bar
function navBar(active) {
  const items = [
    { label: 'Overview', icon: '⊕' },
    { label: 'Metrics',  icon: '⟁' },
    { label: 'Services', icon: '◈' },
    { label: 'Alerts',   icon: '⚑' },
    { label: 'Deploy',   icon: '↑' },
  ];
  const layers = [
    rect(0, H-72, W, 72, P.surface),
    line(0, H-72, W, H-72, P.border),
  ];
  const itemW = W / items.length;
  items.forEach((item, i) => {
    const cx = itemW * i + itemW/2;
    const isActive = item.label === active;
    layers.push(text(item.icon, cx, H-46, isActive ? 18 : 16, isActive ? P.teal : P.dim, 'regular', 'center', 'sans'));
    layers.push(text(item.label, cx, H-24, 9, isActive ? P.teal : P.dim, isActive ? 'semibold' : 'regular', 'center', 'sans'));
    if (isActive) {
      layers.push(rect(cx-14, H-72, 28, 2, P.teal, 1));
    }
  });
  return layers;
}

// Status bar
function statusBar() {
  return [
    rect(0, 0, W, 44, P.bg),
    text('9:41', 20, 26, 13, P.text, 'semibold', 'left', 'sans'),
    text('TOPO', W/2, 26, 12, P.teal, 'bold', 'center', 'sans'),
    text('●', W-52, 26, 8, P.green, 'regular', 'right', 'sans'),
    text('LIVE', W-30, 26, 9, P.dim, 'regular', 'right', 'sans'),
  ];
}

// ─── SCREEN 1: OVERVIEW ──────────────────────────────────────────────────────
function screenOverview() {
  const layers = [
    rect(0, 0, W, H, P.bg),
    // Topographic texture — subtle contour lines across hero area
    ...topoContours(48, 200),
    ...statusBar(),

    // Header
    text('System Terrain', 20, 68, 22, P.text, 'bold', 'left', 'sans'),
    text('All systems nominal · 14 services', 20, 88, 11, P.dim, 'regular', 'left', 'sans'),

    // Health Score Ring (simulated)
    rect(W-96, 56, 76, 76, P.surface, 38),
    rect(W-90, 62, 64, 64, P.elevated, 32),
    text('98', W-58, 100, 20, P.teal, 'bold', 'center', 'sans'),
    text('%', W-58, 114, 9, P.dim, 'regular', 'center', 'sans'),

    // TERRAIN RIDGE CHARTS — the central visual metaphor
    // CPU Terrain
    ...terrainChart(20, 108, (W-48)/3-4, 58, P.teal,
      [0.3,0.45,0.4,0.55,0.5,0.62,0.58,0.7,0.65,0.6,0.55,0.5], 'CPU'),
    // Memory Terrain
    ...terrainChart(20 + (W-48)/3, 108, (W-48)/3-4, 58, P.amber,
      [0.6,0.62,0.65,0.64,0.67,0.70,0.68,0.72,0.69,0.73,0.71,0.74], 'MEM'),
    // Network Terrain
    ...terrainChart(20 + 2*(W-48)/3, 108, (W-48)/3, 58, P.green,
      [0.1,0.3,0.8,0.4,0.2,0.9,0.5,0.3,0.7,0.4,0.2,0.6], 'NET'),

    // Section label
    text('LIVE SERVICES', 20, 188, 10, P.dim, 'semibold', 'left', 'sans'),
    line(20, 198, W-20, 198, P.border),

    // Service grid rows
    // Row 1 — api-gateway
    rect(20, 206, W-40, 56, P.surface, 10),
    circle(36, 234, 5, P.green),
    text('api-gateway', 50, 226, 13, P.text, 'medium', 'left', 'sans'),
    text('p99 · 42ms', 50, 242, 10, P.dim, 'regular', 'left', 'sans'),
    ...statusPill(W-74, 224, 'HEALTHY', P.green, P.greenDim),
    text('14 req/s', W-26, 244, 9, P.dim, 'regular', 'right', 'sans'),

    // Row 2 — auth-service
    rect(20, 270, W-40, 56, P.surface, 10),
    circle(36, 298, 5, P.green),
    text('auth-service', 50, 290, 13, P.text, 'medium', 'left', 'sans'),
    text('p99 · 18ms', 50, 306, 10, P.dim, 'regular', 'left', 'sans'),
    ...statusPill(W-74, 288, 'HEALTHY', P.green, P.greenDim),
    text('8 req/s', W-26, 308, 9, P.dim, 'regular', 'right', 'sans'),

    // Row 3 — data-pipeline (degraded)
    rect(20, 334, W-40, 56, P.surface, 10),
    circle(36, 362, 5, P.amber),
    text('data-pipeline', 50, 354, 13, P.text, 'medium', 'left', 'sans'),
    text('p99 · 890ms', 50, 370, 10, P.amber, 'regular', 'left', 'sans'),
    ...statusPill(W-78, 352, 'SLOW', P.amber, P.amberDim),
    text('3 req/s', W-26, 372, 9, P.dim, 'regular', 'right', 'sans'),

    // Row 4 — ml-inference
    rect(20, 398, W-40, 56, P.surface, 10),
    circle(36, 426, 5, P.green),
    text('ml-inference', 50, 418, 13, P.text, 'medium', 'left', 'sans'),
    text('p99 · 210ms', 50, 434, 10, P.dim, 'regular', 'left', 'sans'),
    ...statusPill(W-74, 416, 'HEALTHY', P.green, P.greenDim),
    text('2 req/s', W-26, 436, 9, P.dim, 'regular', 'right', 'sans'),

    // Row 5 — postgres-primary (alert)
    rect(20, 462, W-40, 56, P.surface, 10),
    circle(36, 490, 5, P.red),
    text('postgres-primary', 50, 482, 13, P.text, 'medium', 'left', 'sans'),
    text('p99 · timeout', 50, 498, 10, P.red, 'regular', 'left', 'sans'),
    ...statusPill(W-78, 480, 'ALERT', P.red, P.redDim),
    text('—', W-26, 500, 9, P.red, 'regular', 'right', 'sans'),

    // Alert banner at bottom (above nav)
    rect(20, 528, W-40, 48, P.redDim, 10),
    rect(20, 528, 3, 48, P.red, 2),
    text('⚑  1 active incident', 34, 547, 12, P.red, 'semibold', 'left', 'sans'),
    text('postgres-primary · connection pool exhausted', 34, 563, 10, P.dim, 'regular', 'left', 'sans'),

    // "View all" link
    text('View 14 services →', W/2, 596, 11, P.teal, 'semibold', 'center', 'sans'),

    ...navBar('Overview'),
  ];
  return layers;
}

// ─── SCREEN 2: METRICS ───────────────────────────────────────────────────────
function screenMetrics() {
  // Big terrain chart spread — CPU/Memory/Network visualized as landscape
  const layers = [
    rect(0, 0, W, H, P.bg),
    ...topoContours(44, 160),
    ...statusBar(),

    text('Terrain Metrics', 20, 68, 22, P.text, 'bold', 'left', 'sans'),
    text('Last 6 hours · auto-refresh 30s', 20, 88, 11, P.dim, 'regular', 'left', 'sans'),

    // Time range pills
    rect(W-148, 62, 36, 20, P.tealDim, 10),
    text('6h', W-130, 75, 10, P.teal, 'bold', 'center', 'sans'),
    rect(W-108, 62, 36, 20, P.rule, 10),
    text('24h', W-90, 75, 10, P.dim, 'regular', 'center', 'sans'),
    rect(W-68, 62, 44, 20, P.rule, 10),
    text('7d', W-46, 75, 10, P.dim, 'regular', 'center', 'sans'),

    // ── CPU Terrain (large) ──
    text('CPU UTILISATION', 20, 110, 10, P.dim, 'semibold', 'left', 'sans'),
    ...terrainChart(20, 120, W-40, 86, P.teal,
      [0.28,0.32,0.41,0.38,0.44,0.52,0.48,0.61,0.74,0.70,0.65,0.60,0.55,0.58,0.62,0.56,0.50,0.48,0.52,0.49], 'CPU'),
    // Avg/peak annotations
    text('avg 54%', 20, 216, 10, P.teal, 'semibold', 'left', 'sans'),
    text('peak 74% · 2h ago', W-20, 216, 10, P.dim, 'regular', 'right', 'sans'),

    // ── Memory Terrain ──
    text('MEMORY PRESSURE', 20, 234, 10, P.dim, 'semibold', 'left', 'sans'),
    ...terrainChart(20, 244, W-40, 86, P.amber,
      [0.58,0.60,0.62,0.61,0.64,0.65,0.67,0.68,0.72,0.74,0.71,0.73,0.75,0.74,0.73,0.76,0.77,0.75,0.74,0.76], 'MEM'),
    text('avg 70%', 20, 340, 10, P.amber, 'semibold', 'left', 'sans'),
    text('peak 77% · trending up', W-20, 340, 10, P.amber, 'regular', 'right', 'sans'),

    // ── Network Terrain ──
    text('NETWORK I/O MB/s', 20, 358, 10, P.dim, 'semibold', 'left', 'sans'),
    ...terrainChart(20, 368, W-40, 80, P.green,
      [0.15,0.28,0.72,0.40,0.18,0.85,0.50,0.30,0.65,0.42,0.20,0.60,0.35,0.45,0.78,0.40,0.22,0.55,0.33,0.48], 'NET'),
    text('avg 380 KB/s', 20, 458, 10, P.green, 'semibold', 'left', 'sans'),
    text('spiky · normal for traffic', W-20, 458, 10, P.dim, 'regular', 'right', 'sans'),

    // Stat row
    rect(20, 474, W-40, 64, P.surface, 10),
    // col 1
    text('2.4ms', 70, 496, 18, P.teal, 'bold', 'center', 'sans'),
    text('avg latency', 70, 514, 9, P.dim, 'regular', 'center', 'sans'),
    line(113, 480, 113, 530, P.border),
    // col 2
    text('99.8%', W/2, 496, 18, P.green, 'bold', 'center', 'sans'),
    text('uptime', W/2, 514, 9, P.dim, 'regular', 'center', 'sans'),
    line(W-113, 480, W-113, 530, P.border),
    // col 3
    text('0.04%', W-70, 496, 18, P.amber, 'bold', 'center', 'sans'),
    text('error rate', W-70, 514, 9, P.dim, 'regular', 'center', 'sans'),

    ...navBar('Metrics'),
  ];
  return layers;
}

// ─── SCREEN 3: SERVICES ──────────────────────────────────────────────────────
function screenServices() {
  const services = [
    { name: 'api-gateway',     env: 'prod', status: 'healthy', latency: '42ms',  color: P.green },
    { name: 'auth-service',    env: 'prod', status: 'healthy', latency: '18ms',  color: P.green },
    { name: 'data-pipeline',   env: 'prod', status: 'slow',    latency: '890ms', color: P.amber },
    { name: 'ml-inference',    env: 'prod', status: 'healthy', latency: '210ms', color: P.green },
    { name: 'postgres-primary',env: 'prod', status: 'alert',   latency: 'timeout',color: P.red },
    { name: 'redis-cache',     env: 'prod', status: 'healthy', latency: '1ms',   color: P.green },
    { name: 'worker-queue',    env: 'prod', status: 'healthy', latency: '—',     color: P.green },
    { name: 'cdn-edge',        env: 'prod', status: 'healthy', latency: '8ms',   color: P.green },
  ];

  const layers = [
    rect(0, 0, W, H, P.bg),
    ...statusBar(),

    text('Services', 20, 68, 22, P.text, 'bold', 'left', 'sans'),
    text('14 total · 1 degraded · 1 incident', 20, 88, 11, P.dim, 'regular', 'left', 'sans'),

    // Filter row
    rect(20, 102, 64, 24, P.tealDim, 12),
    text('All', 52, 117, 10, P.teal, 'bold', 'center', 'sans'),
    rect(90, 102, 68, 24, P.rule, 12),
    text('Healthy', 124, 117, 10, P.dim, 'regular', 'center', 'sans'),
    rect(164, 102, 58, 24, P.rule, 12),
    text('Alerts', 193, 117, 10, P.dim, 'regular', 'center', 'sans'),
    rect(228, 102, 58, 24, P.rule, 12),
    text('Slow', 257, 117, 10, P.dim, 'regular', 'center', 'sans'),

    line(20, 136, W-20, 136, P.border),
  ];

  services.forEach((svc, i) => {
    const y = 144 + i * 64;
    if (y > H - 90) return;
    layers.push(rect(20, y, W-40, 56, P.surface, 10));
    // Status dot with glow
    layers.push(circle(36, y+22, 7, `rgba(${hexToRgb(svc.color)},0.2)`));
    layers.push(circle(36, y+22, 4, svc.color));
    // Service name
    layers.push(text(svc.name, 50, y+15, 13, P.text, 'medium', 'left', 'sans'));
    // Env badge
    layers.push(rect(50, y+24, 30, 14, P.rule, 7));
    layers.push(text('prod', 65, y+33, 8, P.dim, 'regular', 'center', 'sans'));
    // Latency
    layers.push(text(svc.latency, W-20, y+15, 12, svc.color, 'semibold', 'right', 'sans'));
    layers.push(text('p99 latency', W-20, y+31, 9, P.dim, 'regular', 'right', 'sans'));
  });

  layers.push(...navBar('Services'));
  return layers;
}

// ─── SCREEN 4: ALERTS ────────────────────────────────────────────────────────
function screenAlerts() {
  const layers = [
    rect(0, 0, W, H, P.bg),
    ...statusBar(),

    text('Active Alerts', 20, 68, 22, P.text, 'bold', 'left', 'sans'),
    text('1 incident · 2 warnings · 4 resolved', 20, 88, 11, P.dim, 'regular', 'left', 'sans'),

    // Incident card (critical)
    rect(20, 104, W-40, 100, P.surface, 12),
    rect(20, 104, 3, 100, P.red, 2),
    rect(32, 116, 48, 18, P.redDim, 9),
    text('INCIDENT', 56, 127, 8, P.red, 'bold', 'center', 'sans'),
    text('postgres-primary', 32, 150, 14, P.text, 'semibold', 'left', 'sans'),
    text('connection pool exhausted', 32, 168, 11, P.dim, 'regular', 'left', 'sans'),
    text('Started 23 min ago · @devops on-call', 32, 186, 10, P.dim, 'regular', 'left', 'sans'),
    text('Ack →', W-34, 144, 11, P.red, 'semibold', 'right', 'sans'),

    // Warning 1
    text('WARNINGS', 20, 220, 10, P.dim, 'semibold', 'left', 'sans'),
    line(20, 230, W-20, 230, P.border),

    rect(20, 238, W-40, 80, P.surface, 12),
    rect(20, 238, 3, 80, P.amber, 2),
    rect(32, 248, 52, 18, P.amberDim, 9),
    text('WARNING', 58, 259, 8, P.amber, 'bold', 'center', 'sans'),
    text('data-pipeline', 32, 282, 13, P.text, 'semibold', 'left', 'sans'),
    text('p99 latency above 800ms threshold', 32, 298, 10, P.dim, 'regular', 'left', 'sans'),
    text('8 min ago', W-34, 280, 10, P.dim, 'regular', 'right', 'sans'),

    rect(20, 326, W-40, 80, P.surface, 12),
    rect(20, 326, 3, 80, P.amber, 2),
    rect(32, 336, 52, 18, P.amberDim, 9),
    text('WARNING', 58, 347, 8, P.amber, 'bold', 'center', 'sans'),
    text('memory pressure', 32, 370, 13, P.text, 'semibold', 'left', 'sans'),
    text('System memory at 76% — above 70% baseline', 32, 386, 10, P.dim, 'regular', 'left', 'sans'),
    text('31 min ago', W-34, 368, 10, P.dim, 'regular', 'right', 'sans'),

    // Resolved section
    text('RECENTLY RESOLVED', 20, 422, 10, P.dim, 'semibold', 'left', 'sans'),
    line(20, 432, W-20, 432, P.border),

    // Resolved items
    rect(20, 440, W-40, 52, P.surface, 10),
    circle(36, 466, 4, P.green),
    text('cdn-edge · cert rotation', 50, 458, 12, P.dim, 'medium', 'left', 'sans'),
    text('Resolved 2h ago', 50, 474, 10, P.dim, 'regular', 'left', 'sans'),
    text('✓', W-34, 468, 14, P.green, 'bold', 'right', 'sans'),

    rect(20, 500, W-40, 52, P.surface, 10),
    circle(36, 526, 4, P.green),
    text('worker-queue · backlog spike', 50, 518, 12, P.dim, 'medium', 'left', 'sans'),
    text('Resolved 4h ago', 50, 534, 10, P.dim, 'regular', 'left', 'sans'),
    text('✓', W-34, 528, 14, P.green, 'bold', 'right', 'sans'),

    // Alert rules button
    rect(20, 562, W-40, 44, P.border, 12),
    text('Manage Alert Rules', W/2, 587, 12, P.dim, 'semibold', 'center', 'sans'),

    ...navBar('Alerts'),
  ];
  return layers;
}

// ─── SCREEN 5: DEPLOYMENTS ───────────────────────────────────────────────────
function screenDeploy() {
  const layers = [
    rect(0, 0, W, H, P.bg),
    ...statusBar(),

    text('Deployments', 20, 68, 22, P.text, 'bold', 'left', 'sans'),
    text('3 active pipelines · last deploy 12m ago', 20, 88, 11, P.dim, 'regular', 'left', 'sans'),

    // Active deploy card
    rect(20, 104, W-40, 120, P.surface, 12),
    rect(20, 104, 3, 120, P.teal, 2),
    rect(32, 114, 60, 18, P.tealDim, 9),
    text('DEPLOYING', 62, 125, 8, P.teal, 'bold', 'center', 'sans'),
    text('api-gateway', 32, 150, 14, P.text, 'semibold', 'left', 'sans'),
    text('v2.4.1  ·  feat/rate-limiting', 32, 168, 10, P.dim, 'regular', 'left', 'sans'),
    // Progress bar
    rect(32, 180, W-72, 6, P.rule, 3),
    rect(32, 180, Math.round((W-72)*0.72), 6, P.teal, 3),
    text('72%', W-34, 185, 10, P.teal, 'semibold', 'right', 'sans'),
    // Stage
    text('✓ build  ✓ test  ◉ deploy  ○ verify', 32, 200, 9, P.dim, 'regular', 'left', 'sans'),
    text('~3 min left', W-34, 200, 9, P.teal, 'regular', 'right', 'sans'),

    // Recent deploys
    text('RECENT DEPLOYS', 20, 242, 10, P.dim, 'semibold', 'left', 'sans'),
    line(20, 252, W-20, 252, P.border),

    // Deploy 1 — success
    rect(20, 260, W-40, 72, P.surface, 10),
    circle(36, 284, 5, P.green),
    text('auth-service · v1.9.3', 50, 274, 12, P.text, 'medium', 'left', 'sans'),
    text('fix/jwt-expiry-edge-case', 50, 290, 10, P.dim, 'regular', 'left', 'sans'),
    text('12 min ago · 4m 12s', 50, 306, 9, P.dim, 'regular', 'left', 'sans'),
    ...statusPill(W-74, 272, 'SUCCESS', P.green, P.greenDim),

    // Deploy 2 — success
    rect(20, 340, W-40, 72, P.surface, 10),
    circle(36, 364, 5, P.green),
    text('redis-cache · v3.1.0', 50, 354, 12, P.text, 'medium', 'left', 'sans'),
    text('chore/upgrade-7.2', 50, 370, 10, P.dim, 'regular', 'left', 'sans'),
    text('1h ago · 2m 48s', 50, 386, 9, P.dim, 'regular', 'left', 'sans'),
    ...statusPill(W-74, 352, 'SUCCESS', P.green, P.greenDim),

    // Deploy 3 — failed
    rect(20, 420, W-40, 72, P.surface, 10),
    circle(36, 444, 5, P.red),
    text('data-pipeline · v0.8.7', 50, 434, 12, P.text, 'medium', 'left', 'sans'),
    text('feat/backfill-workers', 50, 450, 10, P.dim, 'regular', 'left', 'sans'),
    text('3h ago · failed at deploy', 50, 466, 9, P.red, 'regular', 'left', 'sans'),
    ...statusPill(W-74, 432, 'FAILED', P.red, P.redDim),

    // Deploy 4 — success
    rect(20, 500, W-40, 72, P.surface, 10),
    circle(36, 524, 5, P.green),
    text('ml-inference · v2.2.1', 50, 514, 12, P.text, 'medium', 'left', 'sans'),
    text('feat/embedding-v3', 50, 530, 10, P.dim, 'regular', 'left', 'sans'),
    text('5h ago · 8m 03s', 50, 546, 9, P.dim, 'regular', 'left', 'sans'),
    ...statusPill(W-74, 512, 'SUCCESS', P.green, P.greenDim),

    ...navBar('Deploy'),
  ];
  return layers;
}

// ─── ASSEMBLE ────────────────────────────────────────────────────────────────
const screens = [
  { id: 'overview',  name: 'Overview',     layers: screenOverview() },
  { id: 'metrics',   name: 'Metrics',      layers: screenMetrics() },
  { id: 'services',  name: 'Services',     layers: screenServices() },
  { id: 'alerts',    name: 'Alerts',       layers: screenAlerts() },
  { id: 'deploy',    name: 'Deployments',  layers: screenDeploy() },
];

const pen = {
  version: '2.8',
  meta: {
    name: 'TOPO — Developer Observability',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    description: 'DevOps observability platform where infrastructure metrics are visualized as topographic terrain. Dark theme with bioluminescent teal glow accents and amber warmth for alerts. Inspired by San Rita topographic aesthetic (Awwwards SOTD) + Neon database glowing data bars (darkmodedesign.com).',
    palette: {
      primary:    P.text,
      secondary:  P.dim,
      accent:     P.teal,
      accent2:    P.amber,
      background: P.bg,
    },
  },
  canvas: { width: W, height: H, background: P.bg },
  screens,
};

fs.writeFileSync('topo.pen', JSON.stringify(pen, null, 2));
console.log('✓ topo.pen written —', screens.length, 'screens');
screens.forEach(s => console.log(`  · ${s.name}: ${s.layers.length} layers`));
