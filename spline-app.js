'use strict';
const fs = require('fs'), path = require('path');

const SLUG = 'spline';
const NAME = 'SPLINE';
const TAGLINE = 'deployment intelligence, in real time';
const W = 390, H = 844;

// Palette — deep navy-black, electric blue + amber
const BG    = '#080B10';
const SURF  = '#0D1018';
const CARD  = '#131922';
const BORD  = '#1E2535';
const ACC   = '#3B82F6';   // electric blue
const ACC2  = '#F59E0B';   // amber
const SUCC  = '#10B981';   // green
const ERR   = '#EF4444';   // red
const TEXT  = '#E2E8F0';
const MUTED = '#64748B';
const DIM   = '#334155';

let elementCount = 0;

function rect(x, y, w, h, fill, opts = {}) {
  elementCount++;
  return {
    type: 'rect', x, y, width: w, height: h, fill,
    rx: opts.rx ?? 0,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none',
    strokeWidth: opts.sw ?? 0,
  };
}

function text(x, y, content, size, fill, opts = {}) {
  elementCount++;
  return {
    type: 'text', x, y, content: String(content), fontSize: size, fill,
    fontWeight: opts.fw ?? 400,
    fontFamily: opts.font ?? 'Inter, system-ui, sans-serif',
    textAnchor: opts.anchor ?? 'start',
    letterSpacing: opts.ls ?? 0,
    opacity: opts.opacity ?? 1,
  };
}

function circle(cx, cy, r, fill, opts = {}) {
  elementCount++;
  return { type: 'circle', cx, cy, r, fill, opacity: opts.opacity ?? 1, stroke: opts.stroke ?? 'none', strokeWidth: opts.sw ?? 0 };
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  elementCount++;
  return { type: 'line', x1, y1, x2, y2, stroke, strokeWidth: opts.sw ?? 1, opacity: opts.opacity ?? 1 };
}

// ── helpers ────────────────────────────────────────────────
function statusDot(x, y, color) {
  const els = [];
  els.push(circle(x, y, 4, color, { opacity: 0.3 }));
  els.push(circle(x, y, 2.5, color));
  return els;
}

function pill(x, y, w, h, fill, label, textColor, fontSize = 9) {
  return [
    rect(x, y, w, h, fill, { rx: h / 2, opacity: 0.18 }),
    text(x + w / 2, y + h / 2 + fontSize * 0.35, label, fontSize, textColor, { anchor: 'middle', fw: 600 }),
  ];
}

function sparkLine(x, y, w, h, points, color) {
  // Approximate as a polyline via multiple line segments
  const els = [];
  const maxVal = Math.max(...points);
  const minVal = Math.min(...points);
  const range = maxVal - minVal || 1;
  const step = w / (points.length - 1);
  for (let i = 0; i < points.length - 1; i++) {
    const x1 = x + i * step;
    const y1 = y + h - ((points[i] - minVal) / range) * h;
    const x2 = x + (i + 1) * step;
    const y2 = y + h - ((points[i + 1] - minVal) / range) * h;
    els.push(line(x1, y1, x2, y2, color, { sw: 1.5 }));
  }
  return els;
}

function progressBar(x, y, w, pct, bg, fg, h = 3) {
  return [
    rect(x, y, w, h, bg, { rx: 2, opacity: 0.3 }),
    rect(x, y, w * (pct / 100), h, fg, { rx: 2 }),
  ];
}

function card(x, y, w, h) {
  return [
    rect(x, y, w, h, CARD, { rx: 10, stroke: BORD, sw: 1 }),
  ];
}

function statusBar(elements) {
  // Standard top status bar area
  elements.push(rect(0, 0, W, 44, BG));
  elements.push(text(16, 29, '9:41', 13, TEXT, { fw: 600 }));
  elements.push(text(W - 16, 29, '●●●', 10, TEXT, { anchor: 'end', opacity: 0.7 }));
}

function navBar(elements, active) {
  const tabs = [
    { id: 'home',    label: 'Overview',    icon: '◈' },
    { id: 'deploy',  label: 'Deploys',     icon: '⬆' },
    { id: 'errors',  label: 'Errors',      icon: '◎' },
    { id: 'perf',    label: 'Perf',        icon: '≋' },
    { id: 'alerts',  label: 'Alerts',      icon: '⌬' },
  ];
  elements.push(rect(0, H - 72, W, 72, SURF, { stroke: BORD, sw: 1 }));
  tabs.forEach((tab, i) => {
    const tx = (W / tabs.length) * i + (W / tabs.length) / 2;
    const isActive = tab.id === active;
    elements.push(text(tx, H - 44, tab.icon, 16, isActive ? ACC : DIM, { anchor: 'middle' }));
    elements.push(text(tx, H - 24, tab.label, 9, isActive ? ACC : MUTED, { anchor: 'middle', fw: isActive ? 600 : 400 }));
    if (isActive) {
      elements.push(rect(tx - 16, H - 72, 32, 2, ACC, { rx: 1 }));
    }
  });
}

function sectionHeader(elements, y, title, subtitle) {
  elements.push(text(16, y, title, 11, MUTED, { fw: 600, ls: 0.08 }));
  if (subtitle) elements.push(text(W - 16, y, subtitle, 10, ACC, { anchor: 'end' }));
  elements.push(line(16, y + 10, W - 16, y + 10, BORD, { sw: 1, opacity: 0.5 }));
}

// ══════════════════════════════════════════════════════════
// SCREEN 1 — OVERVIEW DASHBOARD
// ══════════════════════════════════════════════════════════
function buildOverview() {
  const els = [];
  rect(0, 0, W, H, BG); // implicit bg

  statusBar(els);

  // Header
  els.push(rect(0, 44, W, 56, SURF));
  els.push(text(16, 72, 'SPLINE', 18, TEXT, { fw: 700, ls: 0.1 }));
  els.push(text(16, 89, 'deployment intelligence', 11, MUTED));
  els.push(...statusDot(W - 40, 71, SUCC));
  els.push(text(W - 30, 74, 'live', 10, SUCC, { fw: 600 }));
  els.push(rect(W - 52, 56, 44, 44, 'none')); // tap area

  // Hero metric row
  const heroes = [
    { label: 'Uptime', value: '99.97%', color: SUCC },
    { label: 'Deploys today', value: '14', color: ACC },
    { label: 'P95 latency', value: '142ms', color: TEXT },
    { label: 'Active alerts', value: '2', color: ACC2 },
  ];
  const mW = W / 4;
  heroes.forEach((h, i) => {
    const mx = i * mW;
    els.push(rect(mx, 100, mW, 68, i % 2 === 0 ? SURF : BG));
    if (i < 3) els.push(line(mx + mW, 108, mx + mW, 160, BORD, { sw: 1 }));
    els.push(text(mx + mW / 2, 127, h.value, 17, h.color, { anchor: 'middle', fw: 700 }));
    els.push(text(mx + mW / 2, 145, h.label, 8.5, MUTED, { anchor: 'middle' }));
  });
  els.push(line(0, 168, W, 168, BORD, { sw: 1 }));

  // Spark chart — requests/min
  sectionHeader(els, 186, 'REQUESTS / MIN', 'last 24h');
  els.push(...card(16, 200, W - 32, 80));
  const reqPoints = [140,165,180,158,172,190,185,200,178,195,210,204,198,215,220,208,212,225,218,222,230,215,220,228];
  els.push(...sparkLine(28, 206, W - 56, 60, reqPoints, ACC));
  // Area fill approximation — subtle rect under the line
  els.push(rect(28, 242, W - 56, 24, ACC, { opacity: 0.07 }));
  els.push(text(28, 292, '0', 8, MUTED));
  els.push(text(W - 28, 292, '230 rpm', 8, MUTED, { anchor: 'end' }));

  // Services grid
  sectionHeader(els, 308, 'SERVICES', 'all healthy');
  const services = [
    { name: 'api-gateway',   env: 'prod',    status: 'healthy',  pct: 99.9, color: SUCC },
    { name: 'auth-service',  env: 'prod',    status: 'healthy',  pct: 100,  color: SUCC },
    { name: 'worker-jobs',   env: 'prod',    status: 'degraded', pct: 94.2, color: ACC2 },
    { name: 'cdn-edge',      env: 'staging', status: 'healthy',  pct: 99.1, color: SUCC },
  ];
  services.forEach((svc, i) => {
    const sy = 322 + i * 52;
    els.push(...card(16, sy, W - 32, 46));
    els.push(...statusDot(32, sy + 23, svc.color));
    els.push(text(44, sy + 19, svc.name, 12, TEXT, { fw: 500 }));
    els.push(text(44, sy + 34, svc.env, 9, MUTED));
    els.push(...pill(W - 100, sy + 13, 56, 18, svc.color, svc.status, svc.color));
    els.push(text(W - 28, sy + 23, svc.pct + '%', 10, svc.color, { anchor: 'end', fw: 600 }));
    els.push(...progressBar(44, sy + 41, W - 72, (svc.pct / 100) * 100, DIM, svc.color));
  });

  navBar(els, 'home');

  return { name: 'Overview', elements: els };
}

// ══════════════════════════════════════════════════════════
// SCREEN 2 — DEPLOYMENTS TIMELINE
// ══════════════════════════════════════════════════════════
function buildDeployments() {
  const els = [];
  statusBar(els);

  // Header
  els.push(rect(0, 44, W, 50, SURF));
  els.push(text(16, 74, 'Deployments', 17, TEXT, { fw: 700 }));
  els.push(...pill(W - 80, 60, 64, 22, ACC, 'New deploy', ACC));

  // Filter tabs
  els.push(rect(0, 94, W, 36, BG));
  const filters = ['All', 'Production', 'Staging', 'Failed'];
  filters.forEach((f, i) => {
    const fx = 12 + i * 90;
    const isActive = i === 0;
    if (isActive) {
      els.push(rect(fx - 6, 98, 36, 24, ACC, { rx: 6, opacity: 0.15 }));
    }
    els.push(text(fx + 12, 114, f, 11, isActive ? ACC : MUTED, { anchor: 'middle', fw: isActive ? 600 : 400 }));
  });
  els.push(line(0, 130, W, 130, BORD, { sw: 1 }));

  // Deploy entries
  const deploys = [
    { sha: 'a3f9c12', msg: 'feat: add real-time metrics endpoint', branch: 'main', who: 'alex', time: '2m ago',   status: 'success',    dur: '1m 42s', env: 'prod' },
    { sha: 'b8d2e71', msg: 'fix: correct auth token refresh logic', branch: 'main', who: 'sam',  time: '18m ago',  status: 'success',    dur: '1m 38s', env: 'prod' },
    { sha: 'c1a8f44', msg: 'chore: update node dependencies',       branch: 'main', who: 'pat',  time: '1h ago',   status: 'running',    dur: '0m 52s…', env: 'prod' },
    { sha: 'd9e3b20', msg: 'feat: redesign dashboard header',       branch: 'dev',  who: 'alex', time: '2h ago',   status: 'failed',     dur: '0m 14s', env: 'staging' },
    { sha: 'e4c7a93', msg: 'fix: memory leak in worker process',    branch: 'main', who: 'sam',  time: '3h ago',   status: 'success',    dur: '1m 55s', env: 'prod' },
  ];

  const statusColors = { success: SUCC, running: ACC, failed: ERR, cancelled: MUTED };

  deploys.forEach((d, i) => {
    const dy = 140 + i * 116;
    const sc = statusColors[d.status] || MUTED;

    // Timeline line
    if (i < deploys.length - 1) {
      els.push(line(24, dy + 16, 24, dy + 120, DIM, { sw: 1 }));
    }
    // Timeline dot
    els.push(circle(24, dy + 16, 6, sc, { opacity: 0.2 }));
    els.push(circle(24, dy + 16, 3.5, sc));

    els.push(...card(40, dy, W - 56, 104));

    // Status pill
    els.push(...pill(W - 90, dy + 10, 60, 18, sc, d.status, sc));

    // Commit info
    els.push(text(52, dy + 20, d.msg, 10.5, TEXT, { fw: 500 }));
    els.push(text(52, dy + 36, `${d.branch} · ${d.sha}`, 9, MUTED));

    // Env tag
    els.push(...pill(52, dy + 50, d.env === 'prod' ? 40 : 52, 16, ACC2, d.env, ACC2, 8));

    // Meta
    els.push(text(52, dy + 82, `by ${d.who}  ·  ${d.time}  ·  ${d.dur}`, 9, DIM));

    // Duration bar
    els.push(...progressBar(52, dy + 94, W - 80, 70, DIM, sc));
  });

  navBar(els, 'deploy');
  return { name: 'Deployments', elements: els };
}

// ══════════════════════════════════════════════════════════
// SCREEN 3 — ERROR TRACKING
// ══════════════════════════════════════════════════════════
function buildErrors() {
  const els = [];
  statusBar(els);

  els.push(rect(0, 44, W, 50, SURF));
  els.push(text(16, 74, 'Error Tracking', 17, TEXT, { fw: 700 }));
  els.push(text(W - 16, 74, '2 critical', 11, ERR, { anchor: 'end', fw: 600 }));

  // Summary row
  const errStats = [
    { label: 'New (24h)', value: '47', color: ERR },
    { label: 'Resolved', value: '183', color: SUCC },
    { label: 'Rate/min', value: '0.8', color: ACC2 },
  ];
  els.push(rect(0, 94, W, 60, BG));
  errStats.forEach((e, i) => {
    const ex = (W / 3) * i + (W / 3) / 2;
    els.push(text(ex, 118, e.value, 20, e.color, { anchor: 'middle', fw: 700 }));
    els.push(text(ex, 136, e.label, 9, MUTED, { anchor: 'middle' }));
    if (i < 2) els.push(line((W / 3) * (i + 1), 102, (W / 3) * (i + 1), 148, BORD, { sw: 1 }));
  });
  els.push(line(0, 154, W, 154, BORD, { sw: 1 }));

  // Error list
  const errors = [
    { type: 'TypeError',       msg: "Cannot read property 'user' of undefined",   svc: 'api-gateway',  count: 23, severity: 'critical', time: '2m ago' },
    { type: 'TimeoutError',    msg: 'Database connection pool exhausted after 5s', svc: 'auth-service', count: 8,  severity: 'high',     time: '12m ago' },
    { type: 'ValidationError', msg: "Schema mismatch in field 'payload.items'",   svc: 'worker-jobs',  count: 16, severity: 'medium',   time: '34m ago' },
    { type: 'NetworkError',    msg: 'ECONNREFUSED upstream service at :8080',      svc: 'cdn-edge',     count: 4,  severity: 'low',      time: '1h ago' },
  ];

  const sevColors = { critical: ERR, high: ACC2, medium: ACC, low: MUTED };

  errors.forEach((e, i) => {
    const ey = 162 + i * 116;
    const sc = sevColors[e.severity];

    els.push(...card(16, ey, W - 32, 108));
    // Severity bar on left edge
    els.push(rect(16, ey, 3, 108, sc, { rx: 2 }));

    els.push(text(28, ey + 18, e.type, 11, sc, { fw: 700 }));
    els.push(...pill(W - 80, ey + 8, 64, 18, sc, e.severity, sc));

    els.push(text(28, ey + 36, e.msg, 9.5, TEXT, { opacity: 0.8 }));
    els.push(text(28, ey + 56, `in ${e.svc}`, 9, MUTED));

    // Occurrence sparkline
    const occPoints = Array.from({length: 12}, () => Math.floor(Math.random() * e.count * 0.8 + e.count * 0.2));
    els.push(...sparkLine(28, ey + 68, W - 80, 24, occPoints, sc));

    els.push(text(W - 28, ey + 92, `${e.count}×  ·  ${e.time}`, 9, DIM, { anchor: 'end' }));
  });

  navBar(els, 'errors');
  return { name: 'Error Tracking', elements: els };
}

// ══════════════════════════════════════════════════════════
// SCREEN 4 — PERFORMANCE METRICS
// ══════════════════════════════════════════════════════════
function buildPerformance() {
  const els = [];
  statusBar(els);

  els.push(rect(0, 44, W, 50, SURF));
  els.push(text(16, 74, 'Performance', 17, TEXT, { fw: 700 }));
  els.push(...pill(W - 76, 60, 60, 22, SUCC, 'p95 OK', SUCC));

  // Latency histogram (simulated with bars)
  sectionHeader(els, 106, 'LATENCY DISTRIBUTION', 'ms');
  els.push(...card(16, 120, W - 32, 100));

  const bars = [18, 42, 68, 95, 78, 55, 32, 20, 12, 8, 5, 3];
  const bW = (W - 64) / bars.length;
  const maxBar = Math.max(...bars);
  bars.forEach((b, i) => {
    const bx = 28 + i * bW;
    const bh = (b / maxBar) * 72;
    const isP95 = i === 9;
    els.push(rect(bx + 1, 120 + 82 - bh, bW - 2, bh, isP95 ? ACC2 : ACC, { rx: 2, opacity: isP95 ? 1 : 0.7 }));
  });
  // P95 marker
  const p95x = 28 + 9 * bW;
  els.push(line(p95x, 124, p95x, 215, ACC2, { sw: 1 }));
  els.push(text(p95x + 4, 130, 'p95', 8, ACC2, { fw: 600 }));
  els.push(text(28, 226, '0ms', 8, MUTED));
  els.push(text(W - 28, 226, '500ms+', 8, MUTED, { anchor: 'end' }));

  // Key metrics
  sectionHeader(els, 242, 'PERCENTILES', 'API gateway');
  const perc = [
    { label: 'p50', value: '42ms',  pct: 42,  color: SUCC },
    { label: 'p75', value: '89ms',  pct: 68,  color: SUCC },
    { label: 'p95', value: '142ms', pct: 85,  color: ACC2 },
    { label: 'p99', value: '389ms', pct: 95,  color: ERR  },
  ];
  perc.forEach((p, i) => {
    const py = 258 + i * 40;
    els.push(text(16, py + 14, p.label, 11, MUTED, { fw: 600 }));
    els.push(text(62, py + 14, p.value, 13, p.color, { fw: 700 }));
    els.push(...progressBar(110, py + 8, W - 142, p.pct, DIM, p.color, 6));
    els.push(text(W - 20, py + 14, p.pct + '%', 9, p.color, { anchor: 'end' }));
  });

  // Throughput
  sectionHeader(els, 428, 'THROUGHPUT', '24h');
  els.push(...card(16, 444, W - 32, 80));
  const tPoints = [280,310,295,330,318,345,360,342,375,390,378,395,410,388,402,420,415,428,440,418,432,445,438,450];
  els.push(...sparkLine(28, 452, W - 56, 56, tPoints, ACC));
  els.push(rect(28, 488, W - 56, 20, ACC, { opacity: 0.05 }));
  els.push(text(28, 534, 'avg 380 req/s', 9, MUTED));
  els.push(text(W - 28, 534, '↑ 12% vs. last week', 9, SUCC, { anchor: 'end' }));

  // Apdex
  sectionHeader(els, 554, 'APDEX SCORE', '');
  els.push(...card(16, 568, W - 32, 56));
  els.push(text(28, 598, 'Apdex', 11, MUTED));
  els.push(text(W/2, 598, '0.91', 22, SUCC, { fw: 700, anchor: 'middle' }));
  els.push(text(W - 28, 598, 'Excellent', 10, SUCC, { anchor: 'end', fw: 600 }));
  els.push(...progressBar(28, 614, W - 56, 91, DIM, SUCC, 6));

  navBar(els, 'perf');
  return { name: 'Performance', elements: els };
}

// ══════════════════════════════════════════════════════════
// SCREEN 5 — ALERTS & INCIDENTS
// ══════════════════════════════════════════════════════════
function buildAlerts() {
  const els = [];
  statusBar(els);

  els.push(rect(0, 44, W, 50, SURF));
  els.push(text(16, 74, 'Alerts', 17, TEXT, { fw: 700 }));
  els.push(...pill(W - 70, 61, 54, 22, ERR, '2 active', ERR));

  // Active alerts banner
  els.push(rect(0, 94, W, 68, '#1A0A0A'));
  els.push(rect(0, 94, W, 3, ERR));
  els.push(text(16, 115, '⬤  CRITICAL — api-gateway error rate', 11, ERR, { fw: 600 }));
  els.push(text(16, 133, 'Error rate crossed 2% threshold · Started 4m ago', 9.5, '#F87171'));
  els.push(text(16, 151, 'Ongoing incident · SEV-1', 9, ERR, { opacity: 0.7 }));
  els.push(text(W - 16, 135, 'Ack →', 10, ERR, { anchor: 'end', fw: 600 }));

  els.push(rect(0, 162, W, 44, '#120A00'));
  els.push(rect(0, 162, W, 3, ACC2));
  els.push(text(16, 181, '⬤  HIGH — worker-jobs degraded', 11, ACC2, { fw: 600 }));
  els.push(text(16, 199, 'CPU usage 94% · Started 22m ago', 9.5, '#FCD34D'));

  els.push(line(0, 206, W, 206, BORD, { sw: 1 }));

  // Alert rules
  sectionHeader(els, 220, 'ALERT RULES', '12 active');
  const rules = [
    { name: 'Error rate > 2%',     metric: 'error_rate',    threshold: '2%',   window: '5m',  status: 'firing',   color: ERR },
    { name: 'CPU > 90%',           metric: 'cpu_usage',     threshold: '90%',  window: '3m',  status: 'firing',   color: ERR },
    { name: 'Latency p95 > 300ms', metric: 'p95_latency',   threshold: '300ms',window: '10m', status: 'pending',  color: ACC2 },
    { name: 'Deploy failure rate', metric: 'deploy_failed', threshold: '> 1',  window: '1h',  status: 'resolved', color: SUCC },
    { name: 'Memory usage > 85%',  metric: 'memory',        threshold: '85%',  window: '5m',  status: 'ok',       color: MUTED },
  ];

  rules.forEach((r, i) => {
    const ry = 236 + i * 68;
    els.push(...card(16, ry, W - 32, 60));
    els.push(...statusDot(30, ry + 30, r.color));
    els.push(text(44, ry + 22, r.name, 11.5, TEXT, { fw: 500 }));
    els.push(text(44, ry + 40, `${r.metric} · ${r.threshold} · window ${r.window}`, 9, MUTED));
    els.push(...pill(W - 84, ry + 14, 68, 18, r.color, r.status, r.color, 8.5));
  });

  navBar(els, 'alerts');
  return { name: 'Alerts', elements: els };
}

// ══════════════════════════════════════════════════════════
// SCREEN 6 — TEAM ACTIVITY
// ══════════════════════════════════════════════════════════
function buildTeam() {
  const els = [];
  statusBar(els);

  els.push(rect(0, 44, W, 50, SURF));
  els.push(text(16, 74, 'Team', 17, TEXT, { fw: 700 }));
  els.push(...statusDot(W - 44, 71, SUCC));
  els.push(text(W - 32, 74, '5 online', 10, SUCC, { fw: 600 }));

  // Team avatars
  const members = [
    { name: 'alex', role: 'eng',    status: 'online',  color: ACC,   initials: 'AK' },
    { name: 'sam',  role: 'eng',    status: 'online',  color: SUCC,  initials: 'SL' },
    { name: 'pat',  role: 'devops', status: 'busy',    color: ACC2,  initials: 'PM' },
    { name: 'riley',role: 'eng',    status: 'online',  color: '#A78BFA', initials: 'RN' },
    { name: 'jordan',role:'on-call',status: 'online',  color: ERR,   initials: 'JD' },
  ];

  els.push(rect(0, 94, W, 100, BG));
  members.forEach((m, i) => {
    const mx = 24 + i * 68;
    // Avatar circle
    els.push(circle(mx, 132, 22, m.color, { opacity: 0.2 }));
    els.push(circle(mx, 132, 22, 'none', { stroke: m.color, sw: 1.5, opacity: 0.5 }));
    els.push(text(mx, 136, m.initials, 10, m.color, { anchor: 'middle', fw: 700 }));
    // Status dot
    els.push(circle(mx + 16, 152, 5, m.status === 'online' ? SUCC : ACC2));
    els.push(circle(mx + 16, 152, 5, BG, { opacity: 0 })); // border trick
    els.push(text(mx, 172, m.name, 8.5, MUTED, { anchor: 'middle' }));
    els.push(text(mx, 183, m.role, 7.5, DIM, { anchor: 'middle' }));
  });

  els.push(line(0, 194, W, 194, BORD, { sw: 1 }));

  // Activity feed
  sectionHeader(els, 208, 'ACTIVITY FEED', 'live');
  const activities = [
    { who: 'AK', text: 'deployed api-gateway v2.4.1 to prod',   time: '2m', color: ACC,   icon: '⬆' },
    { who: 'JD', text: 'acknowledged CRITICAL: error rate spike',time: '4m', color: ERR,   icon: '⚑' },
    { who: 'SL', text: 'merged PR #247: auth token refresh fix', time: '18m',color: SUCC,  icon: '✓' },
    { who: 'PM', text: 'scaled worker-jobs to 8 replicas',       time: '24m',color: ACC2,  icon: '⟳' },
    { who: 'RN', text: 'opened incident: SEV-1 api-gateway',     time: '28m',color: ERR,   icon: '⬤' },
    { who: 'AK', text: 'deployed auth-service v1.9.3 to staging',time: '1h', color: ACC,   icon: '⬆' },
    { who: 'SL', text: 'created alert rule: latency p95 > 300ms',time: '2h', color: MUTED, icon: '⌬' },
  ];

  activities.forEach((a, i) => {
    const ay = 224 + i * 58;
    // Avatar
    els.push(circle(28, ay + 18, 13, a.color, { opacity: 0.15 }));
    els.push(text(28, ay + 22, a.who, 8, a.color, { anchor: 'middle', fw: 700 }));

    // Content
    els.push(text(50, ay + 16, a.icon + '  ' + a.text, 9.5, TEXT, { opacity: 0.85 }));
    els.push(text(50, ay + 32, a.time + ' ago', 8.5, MUTED));

    // Connector line
    if (i < activities.length - 1) {
      els.push(line(28, ay + 32, 28, ay + 58, DIM, { sw: 1, opacity: 0.4 }));
    }
  });

  navBar(els, 'home');
  return { name: 'Team Activity', elements: els };
}

// ── Assemble pen ──────────────────────────────────────────
const screens = [
  buildOverview(),
  buildDeployments(),
  buildErrors(),
  buildPerformance(),
  buildAlerts(),
  buildTeam(),
];

const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    tagline: TAGLINE,
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'dark',
    heartbeat: 475,
    elements: elementCount,
    palette: { bg: BG, surface: SURF, card: CARD, accent: ACC, accent2: ACC2, text: TEXT },
    inspiration: 'Godly.website — developer tools trend (Height, AuthKit, Superpower, Reflect)',
  },
  screens,
};

pen.metadata.elements = elementCount;

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${elementCount} elements`);
console.log(`Written: ${SLUG}.pen`);
