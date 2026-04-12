'use strict';
/**
 * DRIP — Developer Release Intelligence Platform
 * Heartbeat design: dark CI/CD pipeline monitoring tool
 * Inspired by: Linear design language (Saaspo) + Pellonium dot-grid motif (minimal.gallery)
 * Theme: DARK
 * Slug: drip
 */
const fs = require('fs');
const path = require('path');

const SLUG = 'drip';
const W = 390, H = 844;

// ── Palette ──────────────────────────────────────────────
const BG      = '#0E0F11';   // near-black, Linear-style
const SURF    = '#171921';   // surface layer
const CARD    = '#20232D';   // card background
const CARD2   = '#282B38';   // elevated card
const BORDER  = '#2E3347';   // subtle border
const ACC     = '#5E6AD2';   // Linear indigo
const ACC2    = '#6EE7B7';   // emerald success
const WARN    = '#F59E0B';   // amber warning
const ERR     = '#F87171';   // red error
const TEXT    = '#F0F2F8';   // primary text
const SUB     = '#8B92A8';   // secondary text
const MUTED   = '#4B5168';   // muted text
const DOT     = '#2A2D3E';   // dot grid color

// ── Primitives ────────────────────────────────────────────
const els = [];

function rect(x, y, w, h, fill, opts = {}) {
  const el = { type: 'rect', x, y, width: w, height: h, fill };
  if (opts.rx)      el.rx = opts.rx;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  if (opts.stroke)  el.stroke = opts.stroke;
  if (opts.sw)      el.strokeWidth = opts.sw;
  return el;
}

function text(x, y, content, size, fill, opts = {}) {
  const el = { type: 'text', x, y, content, fontSize: size, fill };
  if (opts.fw)     el.fontWeight = opts.fw;
  if (opts.font)   el.fontFamily = opts.font;
  if (opts.anchor) el.textAnchor = opts.anchor;
  if (opts.ls)     el.letterSpacing = opts.ls;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  return el;
}

function circle(cx, cy, r, fill, opts = {}) {
  const el = { type: 'circle', cx, cy, r, fill };
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  if (opts.stroke)  el.stroke = opts.stroke;
  if (opts.sw)      el.strokeWidth = opts.sw;
  return el;
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  const el = { type: 'line', x1, y1, x2, y2, stroke };
  if (opts.sw)      el.strokeWidth = opts.sw;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  return el;
}

// ── Dot Grid (Pellonium-inspired) ─────────────────────────
function dotGrid(x, y, w, h, spacing = 18, dotR = 1.2) {
  const dots = [];
  for (let dx = x; dx <= x + w; dx += spacing) {
    for (let dy = y; dy <= y + h; dy += spacing) {
      dots.push(circle(dx, dy, dotR, DOT, { opacity: 0.9 }));
    }
  }
  return dots;
}

// ── Status dot ────────────────────────────────────────────
function statusDot(cx, cy, status) {
  const colors = { success: ACC2, running: ACC, warning: WARN, failed: ERR, queued: MUTED };
  return circle(cx, cy, 4, colors[status] || MUTED);
}

// ── Pipeline stage bar ────────────────────────────────────
function stageBar(x, y, label, status, pct, w = 300) {
  const els = [];
  els.push(rect(x, y, w, 28, CARD, { rx: 4 }));
  const colors = { success: ACC2, running: ACC, warning: WARN, failed: ERR, queued: CARD2 };
  const fillW = Math.max(4, Math.round(w * pct / 100));
  els.push(rect(x, y, fillW, 28, colors[status] || CARD2, { rx: 4, opacity: 0.25 }));
  els.push(statusDot(x + 14, y + 14, status));
  els.push(text(x + 28, y + 18, label, 11, TEXT, { fw: 500 }));
  const pctLabel = status === 'queued' ? 'queued' : status === 'running' ? `${pct}%` : status;
  els.push(text(x + w - 6, y + 18, pctLabel, 10, SUB, { anchor: 'end' }));
  return els;
}

// ── Stat card ─────────────────────────────────────────────
function statCard(x, y, w, label, value, sub, accentColor) {
  const h = 76;
  const els = [];
  els.push(rect(x, y, w, h, CARD, { rx: 8 }));
  els.push(rect(x, y, w, h, BG, { rx: 8, opacity: 0, stroke: BORDER, sw: 1 }));
  els.push(text(x + 14, y + 20, label, 10, SUB, { fw: 500, ls: 0.5 }));
  els.push(text(x + 14, y + 46, value, 22, accentColor || TEXT, { fw: 700 }));
  if (sub) els.push(text(x + 14, y + 64, sub, 10, MUTED));
  return els;
}

// ── Mini pipeline row ──────────────────────────────────────
function pipelineRow(x, y, name, branch, status, duration, ago) {
  const els = [];
  els.push(statusDot(x + 10, y + 16, status));
  els.push(text(x + 26, y + 12, name, 12, TEXT, { fw: 600 }));
  els.push(text(x + 26, y + 26, branch, 10, SUB ));
  els.push(text(x + 290, y + 12, duration, 11, SUB, { anchor: 'end' }));
  els.push(text(x + 290, y + 26, ago, 10, MUTED, { anchor: 'end' }));
  return els;
}

// ══════════════════════════════════════════════════════════
// SCREEN FACTORY
// ══════════════════════════════════════════════════════════

// ── Status bar ────────────────────────────────────────────
function statusBar(screenEls) {
  screenEls.push(rect(0, 0, W, 44, BG));
  screenEls.push(text(W / 2, 27, '9:41', 15, TEXT, { fw: 600, anchor: 'middle' }));
  screenEls.push(text(W - 16, 27, '●●●', 10, TEXT, { anchor: 'end', opacity: 0.6 }));
}

// ── Nav bar ───────────────────────────────────────────────
function navBar(screenEls, active) {
  const navH = 84;
  const navY = H - navH;
  screenEls.push(rect(0, navY, W, navH, SURF));
  screenEls.push(line(0, navY, W, navY, BORDER, { sw: 1 }));

  const items = [
    { icon: '◈', label: 'Pipelines' },
    { icon: '⊙', label: 'Deploys' },
    { icon: '◉', label: 'Metrics' },
    { icon: '◎', label: 'Team' },
    { icon: '⊛', label: 'Settings' },
  ];
  const tabW = W / items.length;
  items.forEach((item, i) => {
    const cx = tabW * i + tabW / 2;
    const isActive = i === active;
    screenEls.push(text(cx, navY + 28, item.icon, 18, isActive ? ACC : MUTED, { anchor: 'middle' }));
    screenEls.push(text(cx, navY + 46, item.label, 9, isActive ? ACC : MUTED, { anchor: 'middle', fw: isActive ? 600 : 400 }));
    if (isActive) {
      screenEls.push(rect(cx - 16, navY + 2, 32, 2, ACC, { rx: 1 }));
    }
  });
}

// ══════════════════════════════════════════════════════════
// SCREEN 1: Pipeline Dashboard
// ══════════════════════════════════════════════════════════
function screen1() {
  const e = [];
  statusBar(e);

  // Dot grid hero strip
  dotGrid(0, 44, W, 60).forEach(d => e.push(d));
  e.push(rect(0, 44, W, 60, BG, { opacity: 0.6 })); // fade overlay

  // Header
  e.push(text(20, 76, 'DRIP', 18, TEXT, { fw: 800, ls: 2 }));
  e.push(text(20, 96, 'Pipeline intelligence', 11, SUB));
  e.push(circle(350, 78, 16, CARD, { stroke: BORDER, sw: 1 }));
  e.push(text(350, 83, 'R', 12, ACC, { anchor: 'middle', fw: 700 }));

  // Stat cards row
  const cardW = (W - 48) / 3;
  [
    { label: 'RUNNING', value: '3', sub: 'pipelines', color: ACC },
    { label: 'SUCCESS', value: '47', sub: 'today', color: ACC2 },
    { label: 'FAILED', value: '2', sub: 'today', color: ERR },
  ].forEach((s, i) => {
    statCard(16 + i * (cardW + 8), 112, cardW, s.label, s.value, s.sub, s.color).forEach(el => e.push(el));
  });

  // Section label
  e.push(text(20, 212, 'RECENT PIPELINES', 10, MUTED, { fw: 600, ls: 1.2 }));
  e.push(line(20, 220, W - 20, 220, BORDER, { sw: 1 }));

  // Pipeline rows
  const pipelines = [
    { name: 'api-gateway', branch: 'main → prod', status: 'success', dur: '2m 14s', ago: '3 min ago' },
    { name: 'web-app', branch: 'feat/auth → staging', status: 'running', dur: '1m 32s', ago: 'now' },
    { name: 'ml-pipeline', branch: 'fix/model → dev', status: 'failed', dur: '0m 48s', ago: '12 min ago' },
    { name: 'data-sync', branch: 'main → prod', status: 'queued', dur: '–', ago: 'queued' },
    { name: 'notifications', branch: 'main → prod', status: 'success', dur: '1m 05s', ago: '28 min ago' },
    { name: 'auth-service', branch: 'v2.1 → prod', status: 'warning', dur: '3m 01s', ago: '41 min ago' },
  ];
  pipelines.forEach((p, i) => {
    const y = 228 + i * 44;
    e.push(rect(12, y, W - 24, 38, i % 2 === 0 ? 'transparent' : SURF, { rx: 6 }));
    pipelineRow(12, y, p.name, p.branch, p.status, p.dur, p.ago).forEach(el => e.push(el));
    if (i < pipelines.length - 1) e.push(line(28, y + 38, W - 28, y + 38, BORDER, { sw: 0.5, opacity: 0.5 }));
  });

  navBar(e, 0);
  return e;
}

// ══════════════════════════════════════════════════════════
// SCREEN 2: Build Detail
// ══════════════════════════════════════════════════════════
function screen2() {
  const e = [];
  statusBar(e);

  // Header
  e.push(rect(0, 44, W, 56, SURF));
  e.push(line(0, 100, W, 100, BORDER, { sw: 1 }));
  e.push(text(20, 68, '← web-app', 13, SUB));
  e.push(text(20, 90, '#1,284 · feat/auth → staging', 12, TEXT, { fw: 600 }));
  e.push(circle(355, 72, 14, ACC, { opacity: 0.15 }));
  e.push(text(355, 77, '↻', 14, ACC, { anchor: 'middle' }));

  // Running badge
  e.push(rect(20, 108, 72, 22, ACC, { rx: 4, opacity: 0.15 }));
  e.push(circle(32, 119, 4, ACC));
  e.push(text(42, 123, 'RUNNING', 10, ACC, { fw: 700, ls: 0.8 }));
  e.push(text(105, 123, 'started 92s ago', 10, SUB));

  // Stage bars section
  e.push(text(20, 152, 'STAGES', 10, MUTED, { fw: 600, ls: 1.2 }));
  e.push(line(20, 160, W - 20, 160, BORDER, { sw: 1 }));

  const stages = [
    { name: 'checkout', status: 'success', pct: 100 },
    { name: 'install', status: 'success', pct: 100 },
    { name: 'lint & typecheck', status: 'success', pct: 100 },
    { name: 'test (unit)', status: 'success', pct: 100 },
    { name: 'test (e2e)', status: 'running', pct: 62 },
    { name: 'build', status: 'queued', pct: 0 },
    { name: 'docker push', status: 'queued', pct: 0 },
    { name: 'deploy to staging', status: 'queued', pct: 0 },
  ];
  stages.forEach((s, i) => {
    stageBar(20, 170 + i * 36, s.name, s.status, s.pct, W - 40).forEach(el => e.push(el));
  });

  // Timing breakdown
  e.push(text(20, 472, 'TIMING', 10, MUTED, { fw: 600, ls: 1.2 }));
  e.push(line(20, 480, W - 20, 480, BORDER, { sw: 1 }));
  [
    { stage: 'checkout', dur: '4s' },
    { stage: 'install', dur: '28s' },
    { stage: 'lint & typecheck', dur: '12s' },
    { stage: 'test (unit)', dur: '31s' },
    { stage: 'test (e2e)', dur: '17s+', running: true },
  ].forEach((t, i) => {
    const y = 496 + i * 30;
    e.push(text(20, y, t.stage, 11, t.running ? TEXT : SUB, { fw: t.running ? 600 : 400 }));
    e.push(text(W - 20, y, t.dur, 11, t.running ? ACC : MUTED, { anchor: 'end', fw: t.running ? 600 : 400 }));
    e.push(line(20, y + 8, W - 20, y + 8, BORDER, { sw: 0.5, opacity: 0.4 }));
  });

  navBar(e, 0);
  return e;
}

// ══════════════════════════════════════════════════════════
// SCREEN 3: Deploy Timeline
// ══════════════════════════════════════════════════════════
function screen3() {
  const e = [];
  statusBar(e);

  // Dot grid bg strip
  dotGrid(0, 44, W, 100).forEach(d => e.push(d));
  e.push(rect(0, 44, W, 100, BG, { opacity: 0.75 }));

  // Header
  e.push(text(20, 74, 'Deployments', 20, TEXT, { fw: 700 }));
  e.push(text(20, 94, 'All environments', 12, SUB));
  e.push(text(W - 20, 74, '↓ Filter', 12, ACC, { anchor: 'end' }));

  // Environment tabs
  const tabs = ['All', 'Production', 'Staging', 'Dev'];
  e.push(rect(0, 114, W, 40, SURF));
  e.push(line(0, 154, W, 154, BORDER, { sw: 1 }));
  tabs.forEach((tab, i) => {
    const x = 20 + i * 82;
    const active = i === 1;
    if (active) {
      e.push(rect(x - 8, 118, 72, 28, ACC, { rx: 6, opacity: 0.15 }));
    }
    e.push(text(x + 28, 137, tab, 12, active ? ACC : SUB, { anchor: 'middle', fw: active ? 600 : 400 }));
  });

  // Deploy timeline list
  const deploys = [
    { app: 'api-gateway', env: 'prod', ver: 'v2.14.1', time: '3 min ago', status: 'success', who: 'CI/CD' },
    { app: 'web-app', env: 'prod', ver: 'v4.8.0', time: '2 hr ago', status: 'success', who: 'jsmith' },
    { app: 'auth-service', env: 'prod', ver: 'v2.1.3', time: '4 hr ago', status: 'warning', who: 'CI/CD' },
    { app: 'ml-pipeline', env: 'prod', ver: 'v1.2.0', time: 'yesterday', status: 'failed', who: 'mkumar' },
    { app: 'notifications', env: 'prod', ver: 'v3.0.1', time: 'yesterday', status: 'success', who: 'CI/CD' },
    { app: 'data-sync', env: 'prod', ver: 'v1.9.4', time: '2 days ago', status: 'success', who: 'CI/CD' },
  ];

  deploys.forEach((d, i) => {
    const y = 164 + i * 80;
    e.push(rect(12, y + 4, W - 24, 70, CARD, { rx: 8 }));
    e.push(statusDot(32, y + 26, d.status));
    e.push(text(46, y + 22, d.app, 13, TEXT, { fw: 600 }));
    e.push(text(46, y + 38, `${d.env} · ${d.ver}`, 11, SUB));
    // Right side
    const statusColors = { success: ACC2, warning: WARN, failed: ERR };
    e.push(text(W - 28, y + 22, d.time, 10, MUTED, { anchor: 'end' }));
    e.push(text(W - 28, y + 38, d.who, 10, SUB, { anchor: 'end' }));
    // Status label
    e.push(rect(W - 28 - 52, y + 52, 52, 16, statusColors[d.status] || MUTED, { rx: 3, opacity: 0.15 }));
    e.push(text(W - 28 - 26, y + 63, d.status.toUpperCase(), 8, statusColors[d.status] || MUTED, { anchor: 'middle', fw: 700, ls: 0.5 }));
    // Dot-line on timeline side
    e.push(circle(22, y + 26, 4, statusColors[d.status] || MUTED));
    if (i < deploys.length - 1) e.push(line(22, y + 32, 22, y + 80, BORDER, { sw: 1 }));
  });

  navBar(e, 1);
  return e;
}

// ══════════════════════════════════════════════════════════
// SCREEN 4: Metrics
// ══════════════════════════════════════════════════════════
function screen4() {
  const e = [];
  statusBar(e);

  e.push(rect(0, 44, W, 56, SURF));
  e.push(line(0, 100, W, 100, BORDER, { sw: 1 }));
  e.push(text(20, 74, 'Metrics', 20, TEXT, { fw: 700 }));
  e.push(text(20, 92, 'Last 7 days', 11, SUB));
  e.push(text(W - 20, 78, '7d ▾', 12, ACC, { anchor: 'end' }));

  // Stat cards 2x2
  const metrics = [
    { label: 'AVG BUILD TIME', value: '1m 52s', sub: '↓ 12% vs prior', color: ACC2 },
    { label: 'SUCCESS RATE', value: '94.2%', sub: '↑ 2.1% vs prior', color: ACC2 },
    { label: 'DEPLOYS', value: '183', sub: 'this week', color: ACC },
    { label: 'MTTR', value: '8m 14s', sub: 'mean time to recover', color: WARN },
  ];
  metrics.forEach((m, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cw = (W - 48) / 2;
    statCard(16 + col * (cw + 16), 108 + row * 88, cw, m.label, m.value, m.sub, m.color).forEach(el => e.push(el));
  });

  // Bar chart: Build times 7 days
  e.push(text(20, 300, 'BUILD DURATION TREND', 10, MUTED, { fw: 600, ls: 1.2 }));
  e.push(line(20, 308, W - 20, 308, BORDER, { sw: 1 }));

  const chartX = 28, chartY = 320, chartW = W - 56, chartH = 100;
  e.push(rect(chartX, chartY, chartW, chartH, CARD, { rx: 6 }));
  // Grid lines
  [0, 0.25, 0.5, 0.75, 1].forEach(t => {
    const ly = chartY + chartH - t * chartH;
    e.push(line(chartX, ly, chartX + chartW, ly, BORDER, { sw: 0.5, opacity: 0.5 }));
  });
  // Bars
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const vals = [0.72, 0.80, 0.65, 0.90, 0.88, 0.45, 0.62];
  const barW = chartW / days.length - 8;
  days.forEach((d, i) => {
    const bx = chartX + i * (chartW / days.length) + 4;
    const bh = vals[i] * (chartH - 12);
    const by = chartY + chartH - bh - 4;
    const isToday = i === 6;
    e.push(rect(bx, by, barW, bh, isToday ? ACC : MUTED, { rx: 3, opacity: isToday ? 1 : 0.5 }));
    e.push(text(bx + barW / 2, chartY + chartH + 14, d, 9, MUTED, { anchor: 'middle' }));
  });

  // Top pipelines table
  e.push(text(20, 448, 'TOP PIPELINES BY VOLUME', 10, MUTED, { fw: 600, ls: 1.2 }));
  e.push(line(20, 456, W - 20, 456, BORDER, { sw: 1 }));
  const tops = [
    { name: 'web-app', runs: 64, rate: '96.9%' },
    { name: 'api-gateway', runs: 51, rate: '100%' },
    { name: 'auth-service', runs: 38, rate: '92.1%' },
    { name: 'data-sync', runs: 22, rate: '86.4%' },
  ];
  tops.forEach((t, i) => {
    const y = 468 + i * 36;
    e.push(text(20, y + 12, `${i + 1}`, 11, MUTED, { fw: 700 }));
    e.push(text(38, y + 12, t.name, 12, TEXT, { fw: 500 }));
    e.push(text(W - 20, y + 12, t.rate, 12, parseFloat(t.rate) > 95 ? ACC2 : WARN, { anchor: 'end', fw: 600 }));
    e.push(text(W - 80, y + 12, `${t.runs} runs`, 10, MUTED, { anchor: 'end' }));
    e.push(line(20, y + 24, W - 20, y + 24, BORDER, { sw: 0.5, opacity: 0.4 }));
  });

  navBar(e, 2);
  return e;
}

// ══════════════════════════════════════════════════════════
// SCREEN 5: Team Activity
// ══════════════════════════════════════════════════════════
function screen5() {
  const e = [];
  statusBar(e);

  e.push(rect(0, 44, W, 56, SURF));
  e.push(line(0, 100, W, 100, BORDER, { sw: 1 }));
  e.push(text(20, 74, 'Team', 20, TEXT, { fw: 700 }));
  e.push(text(20, 92, '5 members · 2 active now', 11, ACC));

  // Active members row
  const members = [
    { init: 'RS', color: ACC,  name: 'rsk', status: 'online' },
    { init: 'MK', color: ACC2, name: 'mkumar', status: 'online' },
    { init: 'JL', color: WARN, name: 'jlee', status: 'away' },
    { init: 'AP', color: ERR,  name: 'apark', status: 'offline' },
    { init: 'TN', color: '#A78BFA', name: 'tna', status: 'offline' },
  ];
  members.forEach((m, i) => {
    const cx = 36 + i * 64;
    e.push(circle(cx, 128, 20, m.color, { opacity: 0.18 }));
    e.push(circle(cx, 128, 20, BG, { stroke: m.color, sw: 1.5, opacity: 0.5 }));
    e.push(text(cx, 133, m.init, 11, m.color, { anchor: 'middle', fw: 700 }));
    const onlineColor = m.status === 'online' ? ACC2 : m.status === 'away' ? WARN : MUTED;
    e.push(circle(cx + 14, 145, 5, onlineColor));
    e.push(text(cx, 162, m.name, 8, MUTED, { anchor: 'middle' }));
  });

  // Activity feed
  e.push(text(20, 188, 'ACTIVITY', 10, MUTED, { fw: 600, ls: 1.2 }));
  e.push(line(20, 196, W - 20, 196, BORDER, { sw: 1 }));

  const activities = [
    { who: 'rsk', action: 'deployed api-gateway v2.14.1', time: '3m', type: 'deploy', status: 'success' },
    { who: 'CI/CD', action: 'web-app build #1284 started', time: '5m', type: 'build', status: 'running' },
    { who: 'mkumar', action: 'ml-pipeline build failed', time: '12m', type: 'build', status: 'failed' },
    { who: 'mkumar', action: 'pushed fix/model to dev', time: '14m', type: 'push', status: 'success' },
    { who: 'jlee', action: 'opened PR: feat/auth', time: '1h', type: 'pr', status: 'queued' },
    { who: 'apark', action: 'added AWS integration', time: '2h', type: 'config', status: 'success' },
    { who: 'rsk', action: 'deployed auth-service v2.1.3', time: '4h', type: 'deploy', status: 'warning' },
    { who: 'tna', action: 'created data-sync pipeline', time: 'yesterday', type: 'config', status: 'success' },
  ];
  activities.forEach((a, i) => {
    const y = 206 + i * 54;
    const idx = members.findIndex(m => m.name === a.who);
    const color = idx >= 0 ? members[idx].color : MUTED;
    const initials = idx >= 0 ? members[idx].init : 'CI';
    e.push(circle(32, y + 20, 14, color, { opacity: 0.15 }));
    e.push(text(32, y + 25, initials, 9, color, { anchor: 'middle', fw: 700 }));
    e.push(text(54, y + 16, a.who, 11, TEXT, { fw: 600 }));
    e.push(text(54, y + 30, a.action, 11, SUB));
    e.push(text(W - 20, y + 20, a.time, 10, MUTED, { anchor: 'end' }));
    statusDot(W - 36, y + 30, a.status); // just add dot
    e.push(statusDot(W - 36, y + 30, a.status));
    if (i < activities.length - 1) e.push(line(28, y + 48, W - 28, y + 48, BORDER, { sw: 0.5, opacity: 0.3 }));
  });

  navBar(e, 3);
  return e;
}

// ══════════════════════════════════════════════════════════
// SCREEN 6: Integrations / Settings
// ══════════════════════════════════════════════════════════
function screen6() {
  const e = [];
  statusBar(e);

  // Dot grid hero
  dotGrid(0, 44, W, 90).forEach(d => e.push(d));
  e.push(rect(0, 44, W, 90, BG, { opacity: 0.8 }));

  e.push(text(20, 76, 'Integrations', 20, TEXT, { fw: 700 }));
  e.push(text(20, 96, 'Connect your stack', 12, SUB));
  e.push(text(W - 20, 76, '+ Add', 13, ACC, { anchor: 'end', fw: 600 }));

  // Active badge
  e.push(rect(20, 108, 88, 20, ACC2, { rx: 4, opacity: 0.12 }));
  e.push(text(64, 122, '6 connected', 10, ACC2, { anchor: 'middle', fw: 600 }));

  // Integration cards
  const integrations = [
    { name: 'GitHub', sub: 'Source control · 4 repos', icon: '⌥', connected: true, color: TEXT },
    { name: 'AWS ECR', sub: 'Container registry', icon: '◈', connected: true, color: WARN },
    { name: 'Kubernetes', sub: 'Orchestration · 3 clusters', icon: '⊙', connected: true, color: ACC },
    { name: 'Slack', sub: 'Notifications · #deploys', icon: '◉', connected: true, color: ACC2 },
    { name: 'Datadog', sub: 'Monitoring & APM', icon: '◎', connected: true, color: ERR },
    { name: 'PagerDuty', sub: 'Incident management', icon: '⊛', connected: true, color: WARN },
    { name: 'Terraform', sub: 'Infrastructure as code', icon: '▲', connected: false, color: MUTED },
    { name: 'Vault', sub: 'Secrets management', icon: '◈', connected: false, color: MUTED },
  ];
  integrations.forEach((intg, i) => {
    const y = 136 + i * 68;
    e.push(rect(12, y, W - 24, 60, CARD, { rx: 8 }));
    e.push(circle(44, y + 30, 18, intg.connected ? intg.color : MUTED, { opacity: 0.12 }));
    e.push(text(44, y + 35, intg.icon, 14, intg.connected ? intg.color : MUTED, { anchor: 'middle' }));
    e.push(text(72, y + 24, intg.name, 13, intg.connected ? TEXT : SUB, { fw: 600 }));
    e.push(text(72, y + 40, intg.sub, 10, MUTED));
    if (intg.connected) {
      e.push(rect(W - 32 - 58, y + 22, 58, 16, ACC2, { rx: 4, opacity: 0.12 }));
      e.push(text(W - 32 - 29, y + 33, 'CONNECTED', 8, ACC2, { anchor: 'middle', fw: 700, ls: 0.5 }));
    } else {
      e.push(rect(W - 32 - 44, y + 22, 44, 16, MUTED, { rx: 4, opacity: 0.12 }));
      e.push(text(W - 32 - 22, y + 33, '+ CONNECT', 8, MUTED, { anchor: 'middle', fw: 600, ls: 0.4 }));
    }
  });

  navBar(e, 4);
  return e;
}

// ══════════════════════════════════════════════════════════
// ASSEMBLE PEN FILE
// ══════════════════════════════════════════════════════════
const screens = [
  { name: 'Pipeline Dashboard', elements: screen1() },
  { name: 'Build Detail',       elements: screen2() },
  { name: 'Deploy Timeline',    elements: screen3() },
  { name: 'Metrics',            elements: screen4() },
  { name: 'Team Activity',      elements: screen5() },
  { name: 'Integrations',       elements: screen6() },
];

const totalEls = screens.reduce((s, sc) => s + sc.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'DRIP — Developer Release Intelligence Platform',
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'dark',
    heartbeat: 'drip',
    description: 'CI/CD pipeline monitoring. Linear precision + dot-grid motif.',
    palette: { BG, SURF, CARD, ACC, ACC2, TEXT, SUB, MUTED, WARN, ERR },
    inspiration: 'Linear design language (Saaspo) + Pellonium dot motif (minimal.gallery)',
    elements: totalEls,
  },
  screens: screens.map((sc, i) => ({
    id: `screen-${i + 1}`,
    name: sc.name,
    width: W,
    height: H,
    background: BG,
    elements: sc.elements,
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`DRIP: ${screens.length} screens, ${totalEls} elements`);
console.log(`Written: ${SLUG}.pen`);
