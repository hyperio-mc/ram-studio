'use strict';
/**
 * BENTO — Feature launch tracking with dark bento-grid glassmorphism UI
 * Inspired by: bento-grid SaaS layouts (saaspo.com) + dark glassmorphism trend
 * (darkmodedesign.com) + Linear-style command palette UX (godly.website/Height)
 * Theme: DARK  |  Heartbeat: auto
 */

const fs   = require('fs');
const path = require('path');

const SLUG   = 'bento';
const W      = 390;
const H      = 844;
const NAME   = 'BENTO';
const DATE   = new Date().toISOString().slice(0, 10);

// ─── Palette ─────────────────────────────────────────────────────────────────
const BG      = '#09090D';
const SURF    = '#0F1018';
const CARD    = '#141620';
const CARD2   = '#1A1D2A';
const ACC     = '#818CF8';   // soft indigo
const ACC2    = '#34D399';   // emerald
const ACC3    = '#FB923C';   // amber (warn)
const TXT     = '#F1F5F9';
const TXTSUB  = '#94A3B8';
const TXTMUT  = '#475569';
const BORDER  = 'rgba(255,255,255,0.07)';
const GLASS   = 'rgba(255,255,255,0.04)';
const GLOW_I  = 'rgba(129,140,248,0.18)';
const GLOW_G  = 'rgba(52,211,153,0.14)';

// ─── Primitive builders ───────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, width: w, height: h, fill,
    rx: opts.rx ?? 0,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none',
    strokeWidth: opts.sw ?? 0,
  };
}
function text(x, y, content, size, fill, opts = {}) {
  return {
    type: 'text', x, y, content, fontSize: size, fill,
    fontWeight: opts.fw ?? 400,
    fontFamily: opts.font ?? 'Inter, sans-serif',
    textAnchor: opts.anchor ?? 'start',
    letterSpacing: opts.ls ?? 0,
    opacity: opts.opacity ?? 1,
  };
}
function circle(cx, cy, r, fill, opts = {}) {
  return {
    type: 'circle', cx, cy, r, fill,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none',
    strokeWidth: opts.sw ?? 0,
  };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return { type: 'line', x1, y1, x2, y2, stroke, strokeWidth: opts.sw ?? 1, opacity: opts.opacity ?? 1 };
}

// ─── Shared components ────────────────────────────────────────────────────────
function statusBar(elements) {
  elements.push(rect(0, 0, W, 44, BG));
  elements.push(text(16, 28, '9:41', 13, TXT, { fw: 600 }));
  elements.push(text(360, 28, '●●●', 10, TXT, { anchor: 'end', opacity: 0.7 }));
}

function navBar(active, elements) {
  const tabs = [
    { id: 'grid',    label: 'Grid',    icon: '⊞' },
    { id: 'launch',  label: 'Launch',  icon: '◎' },
    { id: 'health',  label: 'Health',  icon: '△' },
    { id: 'queue',   label: 'Queue',   icon: '≡' },
    { id: 'profile', label: 'Me',      icon: '○' },
  ];
  elements.push(rect(0, H - 72, W, 72, SURF));
  elements.push(line(0, H - 72, W, H - 72, BORDER, { sw: 1 }));
  tabs.forEach((tab, i) => {
    const x = (W / tabs.length) * i + (W / tabs.length) / 2;
    const isActive = tab.id === active;
    const col = isActive ? ACC : TXTMUT;
    if (isActive) {
      elements.push(rect(x - 20, H - 70, 40, 3, ACC, { rx: 2 }));
      elements.push(circle(x, H - 72 + 28, 18, 'rgba(129,140,248,0.1)'));
    }
    elements.push(text(x, H - 72 + 24, tab.icon, 18, col, { anchor: 'middle', fw: isActive ? 600 : 400 }));
    elements.push(text(x, H - 72 + 42, tab.label, 10, col, { anchor: 'middle', fw: isActive ? 600 : 400 }));
  });
}

function glassCard(x, y, w, h, elements, opts = {}) {
  // Outer glow
  if (opts.glow) {
    elements.push(rect(x - 4, y - 4, w + 8, h + 8, opts.glow, { rx: (opts.rx ?? 14) + 4, opacity: 0.4 }));
  }
  elements.push(rect(x, y, w, h, opts.fill ?? CARD, { rx: opts.rx ?? 14, stroke: BORDER, sw: 1 }));
  // Shimmer top edge
  elements.push(rect(x + 8, y, w - 16, 1, 'rgba(255,255,255,0.14)', { rx: 1 }));
}

function statusBadge(x, y, label, color, elements) {
  elements.push(rect(x, y, label.length * 7.5 + 14, 20, color + '22', { rx: 10 }));
  elements.push(rect(x + 6, y + 7, 6, 6, color, { rx: 3 }));
  elements.push(text(x + 15, y + 14, label, 10, color, { fw: 600 }));
}

function progressBar(x, y, w, pct, color, bg, elements) {
  elements.push(rect(x, y, w, 5, bg, { rx: 3 }));
  elements.push(rect(x, y, Math.round(w * pct), 5, color, { rx: 3 }));
}

function avatarCluster(x, y, elements, count = 4) {
  const colors = [ACC, ACC2, ACC3, '#F472B6'];
  const initials = ['A', 'B', 'C', 'D'];
  for (let i = 0; i < count; i++) {
    elements.push(circle(x + i * 16, y, 12, CARD2, { stroke: SURF, sw: 2 }));
    elements.push(circle(x + i * 16, y, 12, colors[i], { opacity: 0.7 }));
    elements.push(text(x + i * 16, y + 4, initials[i], 9, TXT, { anchor: 'middle', fw: 700 }));
  }
}

// ─── SCREEN 1: GRID (Main bento dashboard) ───────────────────────────────────
function screenGrid() {
  const el = [];
  statusBar(el);
  el.push(rect(0, 0, W, H, BG));
  statusBar(el);

  // Ambient glow blobs
  el.push(circle(300, 200, 120, ACC, { opacity: 0.06 }));
  el.push(circle(80, 500, 100, ACC2, { opacity: 0.05 }));

  // Header
  el.push(text(20, 68, 'BENTO', 20, TXT, { fw: 800, ls: 2 }));
  el.push(text(20, 86, 'Feature Command Center', 12, TXTSUB, { fw: 400 }));

  // Command chip
  el.push(rect(280, 55, 90, 28, CARD2, { rx: 8, stroke: BORDER, sw: 1 }));
  el.push(text(290, 73, '⌘ K', 12, TXTSUB, { fw: 500 }));
  el.push(text(336, 73, 'Search', 11, TXTMUT, { fw: 400, anchor: 'end' }));

  // Row 1: Large + Small bento tiles
  // Big tile — Launched features
  glassCard(16, 100, 216, 110, el, { glow: GLOW_I });
  el.push(text(30, 125, 'Features Shipped', 11, TXTSUB, { fw: 500 }));
  el.push(text(30, 162, '47', 42, TXT, { fw: 800 }));
  el.push(text(82, 162, '/Q2', 18, ACC, { fw: 600 }));
  el.push(text(30, 183, '↑ 12 from last quarter', 10, ACC2, { fw: 500 }));
  progressBar(30, 195, 180, 0.71, ACC, CARD2, el);
  el.push(text(30, 208, '71% of roadmap done', 9, TXTMUT, { fw: 400 }));

  // Small tile — Live
  glassCard(244, 100, 130, 52, el, { glow: GLOW_G });
  el.push(circle(258, 120, 5, ACC2, { opacity: 1 }));
  el.push(text(270, 124, '23 Live', 12, TXT, { fw: 700 }));
  el.push(text(258, 140, 'In production now', 10, TXTSUB, { fw: 400 }));

  // Small tile — Reviews
  glassCard(244, 158, 130, 52, el);
  el.push(text(258, 178, '⚑ 8 Reviews', 11, ACC3, { fw: 600 }));
  el.push(text(258, 196, 'Needs attention', 10, TXTSUB, { fw: 400 }));

  // Row 2: Three equal tiles
  const tileW = 112;
  const tileH = 80;
  const tileY = 224;
  const tileX = [16, 140, 264];

  const metrics = [
    { label: 'Adoption', val: '84%', sub: '+6% wk', col: ACC2 },
    { label: 'P0 Bugs', val: '0', sub: 'All clear ✓', col: ACC },
    { label: 'Deploys', val: '12', sub: 'This week', col: ACC3 },
  ];
  metrics.forEach((m, i) => {
    glassCard(tileX[i], tileY, tileW, tileH, el);
    el.push(text(tileX[i] + 12, tileY + 22, m.label, 10, TXTSUB, { fw: 500 }));
    el.push(text(tileX[i] + 12, tileY + 50, m.val, 24, TXT, { fw: 800 }));
    el.push(text(tileX[i] + 12, tileY + 68, m.sub, 10, m.col, { fw: 500 }));
  });

  // Row 3: Feature tiles grid (bento-style asymmetric)
  el.push(text(20, 326, 'Active Features', 12, TXT, { fw: 700 }));
  el.push(text(20, 342, '6 launching this sprint', 10, TXTSUB));

  const features = [
    { name: 'Dark Mode Toggle', status: 'Live',    pct: 1.0,  col: ACC2,  wide: true  },
    { name: 'AI Summarize',     status: 'Beta',    pct: 0.82, col: ACC,   wide: false },
    { name: 'CSV Export',       status: 'Beta',    pct: 0.65, col: ACC,   wide: false },
    { name: 'Bulk Actions',     status: 'Staging', pct: 0.4,  col: ACC3,  wide: false },
    { name: 'API v2',           status: 'Build',   pct: 0.28, col: TXTSUB, wide: false },
  ];

  let fy = 352;
  features.forEach((f, i) => {
    const fw = f.wide ? 358 : 170;
    const fx = (i === 0 || i % 2 === 0 && !f.wide) ? 16 : 204;
    if (i === 1) fy = 352;
    if (i === 2) fy = 352;
    if (i === 3) { fy = 440; }
    if (i === 4) { fy = 440; }

    glassCard(fx, fy, fw, 76, el);
    statusBadge(fx + 10, fy + 8, f.status, f.col, el);
    el.push(text(fx + 12, fy + 44, f.name, 11, TXT, { fw: 600 }));
    progressBar(fx + 12, fy + 55, fw - 24, f.pct, f.col, CARD2, el);
    el.push(text(fx + 12, fy + 70, Math.round(f.pct * 100) + '%', 9, TXTSUB, { fw: 500 }));
  });

  navBar('grid', el);
  return { name: 'Grid', elements: el };
}

// ─── SCREEN 2: LAUNCH DETAIL ──────────────────────────────────────────────────
function screenLaunch() {
  const el = [];
  el.push(rect(0, 0, W, H, BG));
  statusBar(el);
  el.push(circle(200, 260, 180, ACC, { opacity: 0.05 }));

  // Back nav
  el.push(text(20, 68, '← Features', 13, TXTSUB, { fw: 500 }));

  // Feature hero
  el.push(text(20, 102, 'AI Summarize', 26, TXT, { fw: 800 }));
  el.push(text(20, 124, 'Condense any content to key takeaways', 12, TXTSUB, { fw: 400 }));

  statusBadge(20, 138, 'Beta', ACC, el);
  statusBadge(80, 138, 'v2.1.4', TXTSUB, el);

  // Main metric ring (visual)
  el.push(circle(195, 218, 54, CARD2, { stroke: BORDER, sw: 1 }));
  el.push(circle(195, 218, 54, 'none', { stroke: ACC, sw: 6, opacity: 0.15 }));
  // Arc approximation with overlapping circle segment
  el.push(circle(195, 218, 48, 'none', { stroke: ACC, sw: 5, opacity: 0.9 }));
  el.push(text(195, 222, '82%', 22, TXT, { fw: 800, anchor: 'middle' }));
  el.push(text(195, 238, 'rollout', 11, TXTSUB, { anchor: 'middle' }));

  // Stats row
  const stats = [
    { label: 'DAU', val: '2.4K' },
    { label: 'CSAT', val: '4.8★' },
    { label: 'Latency', val: '340ms' },
    { label: 'Errors', val: '0.02%' },
  ];
  const sy = 284;
  stats.forEach((s, i) => {
    const sx = 16 + i * 90;
    glassCard(sx, sy, 80, 58, el);
    el.push(text(sx + 40, sy + 22, s.val, 15, i === 3 ? ACC2 : TXT, { fw: 700, anchor: 'middle' }));
    el.push(text(sx + 40, sy + 38, s.label, 10, TXTSUB, { anchor: 'middle' }));
  });

  // Timeline
  el.push(text(20, 360, 'Launch Timeline', 13, TXT, { fw: 700 }));
  const milestones = [
    { label: 'Spec finalized',      date: 'Mar 10', done: true },
    { label: 'Dev complete',        date: 'Mar 22', done: true },
    { label: 'Internal beta',       date: 'Apr 1',  done: true },
    { label: '10% rollout',         date: 'Apr 7',  done: true },
    { label: 'Full release → GA',   date: 'Apr 15', done: false },
  ];
  milestones.forEach((m, i) => {
    const my = 378 + i * 44;
    const col = m.done ? ACC2 : TXTMUT;
    // Track line
    if (i < milestones.length - 1) {
      el.push(line(31, my + 12, 31, my + 44, m.done ? ACC2 : CARD2, { sw: 2, opacity: 0.5 }));
    }
    el.push(circle(31, my + 6, 7, m.done ? ACC2 : CARD2, { stroke: m.done ? ACC2 : TXTMUT, sw: 2 }));
    if (m.done) el.push(text(31, my + 10, '✓', 8, BG, { anchor: 'middle', fw: 700 }));
    el.push(text(50, my + 10, m.label, 13, m.done ? TXT : TXTSUB, { fw: m.done ? 600 : 400 }));
    el.push(text(370, my + 10, m.date, 11, col, { anchor: 'end', fw: 500 }));
  });

  // Team
  el.push(text(20, 600, 'Assigned team', 12, TXT, { fw: 600 }));
  avatarCluster(50, 622, el, 4);
  el.push(text(122, 626, '+3 more', 11, TXTSUB, { fw: 400 }));

  // CTA
  el.push(rect(20, 650, 350, 46, ACC, { rx: 12 }));
  el.push(text(195, 678, 'Promote to General Availability', 13, '#09090D', { anchor: 'middle', fw: 700 }));

  navBar('launch', el);
  return { name: 'Launch', elements: el };
}

// ─── SCREEN 3: HEALTH DASHBOARD ──────────────────────────────────────────────
function screenHealth() {
  const el = [];
  el.push(rect(0, 0, W, H, BG));
  statusBar(el);
  el.push(circle(40, 350, 150, ACC2, { opacity: 0.04 }));

  el.push(text(20, 68, 'Health', 22, TXT, { fw: 800 }));
  el.push(text(20, 86, 'System & feature signal overview', 12, TXTSUB, { fw: 400 }));

  // Overall health score
  glassCard(16, 100, 358, 82, el, { glow: GLOW_G, rx: 16 });
  el.push(text(30, 128, 'Overall Health Score', 12, TXTSUB, { fw: 500 }));
  el.push(text(30, 160, '96', 38, TXT, { fw: 800 }));
  el.push(text(72, 160, '/100', 16, TXTSUB, { fw: 400 }));
  el.push(text(30, 178, '↑ Excellent — no critical issues', 11, ACC2, { fw: 500 }));
  progressBar(200, 148, 160, 0.96, ACC2, CARD2, el);
  el.push(text(200, 175, '96%', 9, TXTSUB, { fw: 500 }));

  // Signal grid — 3 cols
  const signals = [
    { label: 'Uptime',     val: '99.97%', col: ACC2,  icon: '◉' },
    { label: 'Error Rate', val: '0.02%',  col: ACC2,  icon: '◎' },
    { label: 'P95 Lat',    val: '210ms',  col: ACC,   icon: '◈' },
    { label: 'API Calls',  val: '1.2M/d', col: TXT,   icon: '⬡' },
    { label: 'Sat. Score', val: '4.8/5',  col: ACC2,  icon: '★' },
    { label: 'Incidents',  val: '0',      col: ACC2,  icon: '⊘' },
  ];
  const sg = 196;
  signals.forEach((s, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const sx = 16 + col * 122;
    const sy = sg + row * 84;
    glassCard(sx, sy, 112, 72, el);
    el.push(text(sx + 12, sy + 24, s.icon, 14, s.col, { fw: 400 }));
    el.push(text(sx + 30, sy + 26, s.label, 10, TXTSUB, { fw: 500 }));
    el.push(text(sx + 12, sy + 50, s.val, 18, TXT, { fw: 700 }));
  });

  // Feature health list
  el.push(text(20, 380, 'Feature Signals', 13, TXT, { fw: 700 }));
  const features = [
    { name: 'AI Summarize',    health: 98, trend: '↑',  col: ACC2 },
    { name: 'Dark Mode',       health: 100, trend: '→', col: ACC2 },
    { name: 'CSV Export',      health: 91, trend: '↓',  col: ACC },
    { name: 'Bulk Actions',    health: 87, trend: '↓',  col: ACC3 },
    { name: 'API v2',          health: 74, trend: '↓',  col: ACC3 },
  ];
  features.forEach((f, i) => {
    const fy = 400 + i * 52;
    glassCard(16, fy, 358, 44, el);
    el.push(text(30, fy + 16, f.name, 12, TXT, { fw: 600 }));
    el.push(text(30, fy + 32, 'Rollout healthy', 10, TXTSUB, { fw: 400 }));
    progressBar(160, fy + 18, 160, f.health / 100, f.col, CARD2, el);
    el.push(text(340, fy + 16, f.health + '%', 11, f.col, { anchor: 'end', fw: 700 }));
    el.push(text(360, fy + 16, f.trend, 11, f.col, { anchor: 'end', fw: 700 }));
  });

  navBar('health', el);
  return { name: 'Health', elements: el };
}

// ─── SCREEN 4: QUEUE (Launch queue / roadmap) ─────────────────────────────────
function screenQueue() {
  const el = [];
  el.push(rect(0, 0, W, H, BG));
  statusBar(el);
  el.push(circle(330, 180, 130, ACC3, { opacity: 0.04 }));

  el.push(text(20, 68, 'Queue', 22, TXT, { fw: 800 }));
  el.push(text(20, 86, 'Upcoming feature launches', 12, TXTSUB, { fw: 400 }));

  // Filter chips
  const filters = ['All', 'This Sprint', 'Blocked', 'Ready'];
  filters.forEach((f, i) => {
    const active = i === 1;
    const fw = f.length * 8 + 18;
    const fx = 16 + [0, 30, 100, 160][i];
    el.push(rect(fx, 100, fw + 4, 26, active ? ACC : CARD2, { rx: 13, stroke: active ? 'none' : BORDER, sw: 1 }));
    el.push(text(fx + (fw + 4) / 2, 117, f, 11, active ? BG : TXTSUB, { fw: active ? 700 : 400, anchor: 'middle' }));
  });

  const fixedX = [16, 202];
  const queueItems = [
    { name: 'Team Mentions', sprint: 'Apr 14', priority: 'High',   blocked: false, assignee: 'K', pct: 0.9 },
    { name: 'Audit Logs',    sprint: 'Apr 14', priority: 'High',   blocked: false, assignee: 'M', pct: 0.75 },
    { name: 'SSO Provider',  sprint: 'Apr 21', priority: 'Medium', blocked: true,  assignee: 'R', pct: 0.55 },
    { name: 'Webhooks v3',   sprint: 'Apr 21', priority: 'Medium', blocked: false, assignee: 'A', pct: 0.4 },
    { name: 'Slack Notifs',  sprint: 'May 1',  priority: 'Low',    blocked: false, assignee: 'B', pct: 0.25 },
    { name: 'Export PDF',    sprint: 'May 1',  priority: 'Low',    blocked: true,  assignee: 'L', pct: 0.15 },
  ];

  // Sprint header Apr 14
  el.push(text(20, 144, 'Sprint — Apr 14', 11, TXTSUB, { fw: 600, ls: 0.5 }));
  el.push(line(20, 150, 370, 150, BORDER, { sw: 1 }));

  queueItems.forEach((item, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    let baseY = 158 + row * 108;

    // Sprint divider
    if (i === 4) {
      el.push(text(20, baseY - 4, 'Sprint — May 1', 11, TXTSUB, { fw: 600, ls: 0.5 }));
      el.push(line(20, baseY + 2, 370, baseY + 2, BORDER, { sw: 1 }));
      baseY += 14;
    }
    if (i === 2) {
      el.push(text(20, baseY - 4, 'Sprint — Apr 21', 11, TXTSUB, { fw: 600, ls: 0.5 }));
      el.push(line(20, baseY + 2, 370, baseY + 2, BORDER, { sw: 1 }));
      baseY += 14;
    }

    const qx = fixedX[col];
    const qy = (i < 2) ? 158 : (i < 4) ? 294 : 440 + (i - 4) * 2;

    glassCard(qx, qy + (i >= 2 && i < 4 ? 26 : 0) + (i >= 4 ? 40 : 0), 168, 90, el, item.blocked ? { glow: 'rgba(251,146,60,0.15)' } : {});

    const cy2 = qy + (i >= 2 && i < 4 ? 26 : 0) + (i >= 4 ? 40 : 0);
    if (item.blocked) {
      el.push(rect(qx + 120, cy2 + 8, 40, 18, ACC3 + '33', { rx: 9 }));
      el.push(text(qx + 140, cy2 + 20, 'Blocked', 9, ACC3, { anchor: 'middle', fw: 600 }));
    }
    el.push(text(qx + 12, cy2 + 24, item.name, 12, TXT, { fw: 600 }));
    el.push(text(qx + 12, cy2 + 40, item.sprint, 10, TXTSUB, { fw: 400 }));
    progressBar(qx + 12, cy2 + 55, 140, item.pct, item.blocked ? ACC3 : ACC, CARD2, el);
    el.push(text(qx + 12, cy2 + 70, Math.round(item.pct * 100) + '% done', 9, TXTSUB, { fw: 400 }));

    // Avatar
    el.push(circle(qx + 150, cy2 + 78, 9, ACC, { opacity: 0.5 }));
    el.push(text(qx + 150, cy2 + 82, item.assignee, 8, TXT, { anchor: 'middle', fw: 700 }));
  });

  navBar('queue', el);
  return { name: 'Queue', elements: el };
}

// ─── SCREEN 5: COMMAND PALETTE ────────────────────────────────────────────────
function screenCommand() {
  const el = [];
  el.push(rect(0, 0, W, H, BG));
  statusBar(el);

  // Background (dimmed grid screen behind)
  el.push(rect(0, 44, W, H - 44, 'rgba(9,9,13,0.85)'));

  // Command palette overlay
  const px = 20, py = 110, pw = 350, ph = 480;
  // Glow
  el.push(rect(px - 8, py - 8, pw + 16, ph + 16, GLOW_I, { rx: 22, opacity: 0.5 }));
  el.push(rect(px, py, pw, ph, CARD, { rx: 16, stroke: 'rgba(129,140,248,0.3)', sw: 1 }));
  el.push(rect(px + 1, py + 1, pw - 2, 1, 'rgba(129,140,248,0.2)', { rx: 1 }));

  // Search input
  el.push(rect(px + 12, py + 14, pw - 24, 44, CARD2, { rx: 10, stroke: 'rgba(129,140,248,0.25)', sw: 1 }));
  el.push(text(px + 26, py + 40, '⌕', 16, ACC, { fw: 400 }));
  el.push(text(px + 50, py + 40, 'Search features, launch, health…', 13, TXTMUT, { fw: 400 }));
  // Cursor blink
  el.push(rect(px + 50, py + 26, 2, 18, ACC, { rx: 1 }));
  el.push(rect(px + 300, py + 22, 50, 24, CARD, { rx: 6 }));
  el.push(text(px + 325, py + 38, 'ESC', 10, TXTSUB, { anchor: 'middle', fw: 600 }));

  // Recent section
  el.push(text(px + 16, py + 76, 'RECENT', 10, TXTMUT, { fw: 700, ls: 1.5 }));
  el.push(line(px + 12, py + 82, px + pw - 12, py + 82, BORDER, { sw: 1 }));

  const cmds = [
    { icon: '◎', label: 'AI Summarize',      sub: 'Feature · Beta',          shortcut: '↵' },
    { icon: '⊞', label: 'View Grid Dashboard', sub: 'Navigation',             shortcut: 'G' },
    { icon: '△', label: 'Health overview',   sub: 'Navigation',              shortcut: 'H' },
    { icon: '◈', label: 'Promote to GA',     sub: 'Action · AI Summarize',   shortcut: '' },
  ];
  cmds.forEach((c, i) => {
    const cy2 = py + 92 + i * 50;
    const active = i === 0;
    if (active) el.push(rect(px + 12, cy2 - 4, pw - 24, 44, 'rgba(129,140,248,0.1)', { rx: 8 }));
    el.push(rect(px + 22, cy2 + 4, 28, 28, active ? ACC + '22' : CARD2, { rx: 7 }));
    el.push(text(px + 36, cy2 + 22, c.icon, 13, active ? ACC : TXTSUB, { anchor: 'middle' }));
    el.push(text(px + 60, cy2 + 14, c.label, 13, active ? TXT : TXTSUB, { fw: active ? 600 : 400 }));
    el.push(text(px + 60, cy2 + 28, c.sub, 10, TXTMUT, { fw: 400 }));
    if (c.shortcut) {
      el.push(rect(pw - 16, cy2 + 8, 24, 18, CARD2, { rx: 5 }));
      el.push(text(pw - 4, cy2 + 20, c.shortcut, 10, TXTSUB, { anchor: 'end', fw: 600 }));
    }
  });

  // Quick actions
  el.push(text(px + 16, py + 298, 'QUICK ACTIONS', 10, TXTMUT, { fw: 700, ls: 1.5 }));
  el.push(line(px + 12, py + 304, px + pw - 12, py + 304, BORDER, { sw: 1 }));

  const actions = [
    { icon: '+', label: 'New Feature',     col: ACC  },
    { icon: '▲', label: 'Promote to GA',   col: ACC2 },
    { icon: '⚑', label: 'Flag for Review', col: ACC3 },
    { icon: '≡', label: 'View Roadmap',    col: TXTSUB },
  ];
  actions.forEach((a, i) => {
    const ax = px + 16 + (i % 2) * 164;
    const ay = py + 314 + Math.floor(i / 2) * 50;
    el.push(rect(ax, ay, 154, 38, CARD2, { rx: 8, stroke: BORDER, sw: 1 }));
    el.push(text(ax + 14, ay + 24, a.icon, 13, a.col, { fw: 600 }));
    el.push(text(ax + 32, ay + 24, a.label, 12, TXT, { fw: 500 }));
  });

  // Footer hint
  el.push(text(px + 16, py + 458, '↑↓ navigate   ↵ select   ⌘K toggle', 10, TXTMUT, { fw: 400 }));

  return { name: 'Command', elements: el };
}

// ─── SCREEN 6: INSIGHTS (Analytics) ──────────────────────────────────────────
function screenInsights() {
  const el = [];
  el.push(rect(0, 0, W, H, BG));
  statusBar(el);
  el.push(circle(100, 600, 160, ACC, { opacity: 0.05 }));

  el.push(text(20, 68, 'Insights', 22, TXT, { fw: 800 }));
  el.push(text(20, 86, 'Quarterly performance analysis', 12, TXTSUB, { fw: 400 }));

  // Date range selector
  el.push(rect(16, 100, 358, 32, CARD2, { rx: 10, stroke: BORDER, sw: 1 }));
  const ranges = ['1W', '1M', 'Q2', '6M', 'YTD'];
  ranges.forEach((r, i) => {
    const active = i === 2;
    const rx2 = 20 + i * 70;
    if (active) el.push(rect(rx2, 102, 64, 28, ACC, { rx: 8 }));
    el.push(text(rx2 + 32, 120, r, 11, active ? BG : TXTSUB, { anchor: 'middle', fw: active ? 700 : 500 }));
  });

  // KPI bento row
  const kpis = [
    { label: 'Shipped', val: '47', delta: '+12', col: ACC },
    { label: 'Velocity', val: '94%', delta: '+8%', col: ACC2 },
    { label: 'CSAT Avg', val: '4.7', delta: '+0.3', col: ACC },
  ];
  kpis.forEach((k, i) => {
    const kx = 16 + i * 122;
    glassCard(kx, 146, 112, 70, el, i === 1 ? { glow: GLOW_G } : {});
    el.push(text(kx + 56, 172, k.val, 22, TXT, { fw: 800, anchor: 'middle' }));
    el.push(text(kx + 56, 188, k.label, 10, TXTSUB, { anchor: 'middle' }));
    el.push(text(kx + 56, 208, k.delta, 10, k.col, { anchor: 'middle', fw: 600 }));
  });

  // Chart area — feature ship rate
  el.push(text(20, 236, 'Ship Rate — Q2 2025', 13, TXT, { fw: 700 }));
  glassCard(16, 250, 358, 130, el, { rx: 14 });

  // Chart bars
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const vals   = [0.55, 0.62, 0.74, 0.81, 0.70, 0.88];
  const barW   = 36, gap = 20;
  const chartX = 30, chartBottom = 360, chartH = 90;
  months.forEach((m, i) => {
    const bx = chartX + i * (barW + gap);
    const bh = Math.round(chartH * vals[i]);
    const active = i === 3;
    el.push(rect(bx, chartBottom - bh, barW, bh, active ? ACC : CARD2, { rx: 5, opacity: active ? 1 : 0.8 }));
    if (active) {
      el.push(rect(bx - 4, chartBottom - bh - 24, 44, 18, ACC, { rx: 6 }));
      el.push(text(bx + 18, chartBottom - bh - 11, Math.round(vals[i] * 100) + '%', 9, BG, { anchor: 'middle', fw: 700 }));
    }
    el.push(text(bx + 18, chartBottom + 14, m, 9, TXTSUB, { anchor: 'middle' }));
  });
  el.push(line(chartX, chartBottom, chartX + 336, chartBottom, BORDER, { sw: 1 }));

  // Category breakdown
  el.push(text(20, 404, 'By Category', 13, TXT, { fw: 700 }));
  const cats = [
    { name: 'Core Product',   pct: 0.42, col: ACC  },
    { name: 'Integrations',   pct: 0.28, col: ACC2 },
    { name: 'Infrastructure', pct: 0.18, col: ACC3 },
    { name: 'Design System',  pct: 0.12, col: TXTSUB },
  ];
  cats.forEach((c, i) => {
    const cy2 = 424 + i * 46;
    el.push(text(20, cy2 + 14, c.name, 12, TXT, { fw: 500 }));
    el.push(text(370, cy2 + 14, Math.round(c.pct * 100) + '%', 12, c.col, { anchor: 'end', fw: 600 }));
    progressBar(20, cy2 + 22, 350, c.pct, c.col, CARD2, el);
  });

  // Team performance
  el.push(text(20, 618, 'Top Contributors', 13, TXT, { fw: 700 }));
  const people = [
    { name: 'Kiran M.', role: 'Feature Lead',  count: 14, col: ACC  },
    { name: 'Alex T.',  role: 'Backend',        count: 11, col: ACC2 },
    { name: 'Ren B.',   role: 'Design',         count: 9,  col: ACC3 },
  ];
  people.forEach((p, i) => {
    const py2 = 640 + i * 36;
    el.push(circle(34, py2 + 6, 12, ACC, { opacity: 0.2 }));
    el.push(text(34, py2 + 10, p.name[0], 10, ACC, { anchor: 'middle', fw: 700 }));
    el.push(text(54, py2 + 8, p.name, 12, TXT, { fw: 600 }));
    el.push(text(54, py2 + 22, p.role, 10, TXTSUB, { fw: 400 }));
    el.push(text(360, py2 + 10, p.count + ' shipped', 11, p.col, { anchor: 'end', fw: 600 }));
  });

  navBar('grid', el);
  return { name: 'Insights', elements: el };
}

// ─── Build pen file ───────────────────────────────────────────────────────────
const screens = [
  screenGrid(),
  screenLaunch(),
  screenHealth(),
  screenQueue(),
  screenCommand(),
  screenInsights(),
];

const totalElements = screens.reduce((sum, s) => sum + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name:      NAME,
    author:    'RAM',
    date:      DATE,
    theme:     'dark',
    heartbeat: 'auto',
    elements:  totalElements,
    inspired:  'saaspo.com bento grid SaaS layouts + darkmodedesign.com glassmorphism + godly.website/Height command palette UX',
  },
  screens,
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
