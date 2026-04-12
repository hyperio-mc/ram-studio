'use strict';
/**
 * CRON — AI-Powered Job Scheduling & Observability
 * Heartbeat #44 | Dark theme
 *
 * Inspired by:
 * - Railway.app's circuit-board SVG connector lines (saaspo.com)
 * - "Linear Look" bento grid + glassmorphic cards (darkmodedesign.com)
 * - Charcoal + Neon Green palette (dev tools archetype, darkmodedesign.com research)
 */
const fs   = require('fs');
const path = require('path');

const SLUG  = 'cron';
const W = 390, H = 844;

// ── Palette ────────────────────────────────────────────────────────────────
const P = {
  bg:      '#090C12',   // deep blue-black
  surf:    '#0F1219',   // card surface
  card:    '#161B27',   // raised card
  border:  '#1E2640',   // hairline border
  accent:  '#3BFF8C',   // neon mint green
  acc2:    '#6366F1',   // indigo-purple
  acc3:    '#FF6B35',   // alert orange
  text:    '#E2E8F5',
  sub:     '#7A8BAD',
  dim:     '#3D4E6B',
  glow:    'rgba(59,255,140,0.12)',
  glow2:   'rgba(99,102,241,0.10)',
  success: '#3BFF8C',
  warn:    '#F59E0B',
  err:     '#EF4444',
  run:     '#06B6D4',
};

// ── Primitives ─────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, width: w, height: h, fill,
    rx: opts.rx ?? 0, opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none', strokeWidth: opts.sw ?? 0,
  };
}
function text(x, y, content, size, fill, opts = {}) {
  return {
    type: 'text', x, y, content, fontSize: size, fill,
    fontWeight: opts.fw ?? 400,
    fontFamily: opts.font ?? 'Inter, system-ui, sans-serif',
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

// ── Shared Components ───────────────────────────────────────────────────────

// Status bar
function statusBar(els) {
  els.push(rect(0, 0, W, 44, P.bg));
  els.push(text(16, 28, '9:41', 13, P.text, { fw: 600 }));
  els.push(text(W - 16, 28, '●●●', 12, P.sub, { anchor: 'end' }));
}

// Bottom nav
function bottomNav(els, active) {
  const items = [
    { label: 'Jobs',    icon: '◈', id: 0 },
    { label: 'Logs',    icon: '≡', id: 1 },
    { label: 'Monitor', icon: '◎', id: 2 },
    { label: 'Alerts',  icon: '⊘', id: 3 },
    { label: 'Settings',icon: '⊕', id: 4 },
  ];
  els.push(rect(0, H - 72, W, 72, P.surf));
  els.push(line(0, H - 72, W, H - 72, P.border, { sw: 0.5 }));
  const step = W / items.length;
  items.forEach((item, i) => {
    const cx = step * i + step / 2;
    const isActive = i === active;
    els.push(text(cx, H - 38, item.icon, 18, isActive ? P.accent : P.dim, { anchor: 'middle' }));
    els.push(text(cx, H - 18, item.label, 9, isActive ? P.accent : P.dim, { anchor: 'middle', fw: isActive ? 600 : 400, ls: 0.3 }));
    if (isActive) {
      els.push(rect(cx - 12, H - 73, 24, 2, P.accent, { rx: 1 }));
    }
  });
}

// Page header
function pageHeader(els, title, subtitle, y = 60) {
  els.push(text(16, y, title, 22, P.text, { fw: 700, ls: -0.3 }));
  if (subtitle) els.push(text(16, y + 20, subtitle, 12, P.sub, { fw: 400 }));
}

// Circuit connector line (horizontal then vertical — Railway-inspired)
function circuitLine(els, x1, y1, x2, y2, color = P.dim, opts = {}) {
  const midX = x1 + (x2 - x1) * 0.5;
  // Horizontal segment
  els.push(line(x1, y1, midX, y1, color, { sw: opts.sw ?? 0.5, opacity: opts.opacity ?? 0.6 }));
  // Vertical segment
  els.push(line(midX, y1, midX, y2, color, { sw: opts.sw ?? 0.5, opacity: opts.opacity ?? 0.6 }));
  // Second horizontal to destination
  els.push(line(midX, y2, x2, y2, color, { sw: opts.sw ?? 0.5, opacity: opts.opacity ?? 0.6 }));
  // Junction dots
  els.push(circle(x1, y1, 2, color, { opacity: opts.opacity ?? 0.6 }));
  els.push(circle(x2, y2, 2, color, { opacity: opts.opacity ?? 0.6 }));
}

// ── Screen 1: Dashboard ─────────────────────────────────────────────────────
function screen1() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));

  // Ambient glow blob (top-right, mint)
  els.push({ type: 'ellipse', cx: 320, cy: 160, rx: 140, ry: 100, fill: P.glow });
  // Ambient glow blob (bottom-left, indigo)
  els.push({ type: 'ellipse', cx: 60, cy: 600, rx: 100, ry: 80, fill: P.glow2 });

  // Subtle dot grid background texture
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 10; col++) {
      els.push(circle(col * 42 + 14, row * 80 + 80, 1, P.border, { opacity: 0.7 }));
    }
  }

  statusBar(els);

  // Header area
  els.push(text(16, 68, 'CRON', 18, P.accent, { fw: 800, ls: 2 }));
  els.push(text(16, 86, 'Job Scheduler & Observability', 11, P.sub, { fw: 400 }));
  // Avatar placeholder top-right
  els.push(circle(W - 28, 70, 18, P.card));
  els.push(circle(W - 28, 70, 18, P.acc2, { opacity: 0.3 }));
  els.push(text(W - 28, 75, 'KL', 11, P.text, { anchor: 'middle', fw: 700 }));

  // ── BENTO GRID (inspired by Linear/Railway bento layout) ─────────────────
  const bentoPad = 12;
  const bentoCols2 = (W - bentoPad * 3) / 2;

  // TOP ROW: two equal-width metric cards
  const r1x = bentoPad, r1y = 100;
  // Card 1 — Total Jobs
  els.push(rect(r1x, r1y, bentoCols2, 88, P.surf, { rx: 10, stroke: P.border, sw: 0.5 }));
  els.push(rect(r1x, r1y, bentoCols2, 88, P.glow, { rx: 10 })); // glow overlay
  els.push(text(r1x + 12, r1y + 22, 'TOTAL JOBS', 9, P.sub, { fw: 600, ls: 1 }));
  els.push(text(r1x + 12, r1y + 54, '1,247', 28, P.text, { fw: 700, ls: -1 }));
  els.push(text(r1x + 12, r1y + 72, '↑ 14% this week', 10, P.accent, { fw: 500 }));

  // Card 2 — Success Rate
  const c2x = bentoPad * 2 + bentoCols2;
  els.push(rect(c2x, r1y, bentoCols2, 88, P.surf, { rx: 10, stroke: P.border, sw: 0.5 }));
  els.push(text(c2x + 12, r1y + 22, 'SUCCESS RATE', 9, P.sub, { fw: 600, ls: 1 }));
  els.push(text(c2x + 12, r1y + 54, '99.2%', 28, P.text, { fw: 700, ls: -1 }));
  els.push(text(c2x + 12, r1y + 72, '↑ 0.3% from last week', 10, P.accent, { fw: 500 }));

  // CIRCUIT LINES connecting top cards to second row
  const connY1 = r1y + 88;
  const r2y = connY1 + 8;
  circuitLine(els, r1x + bentoCols2 / 2, connY1, c2x + bentoCols2 / 2, r2y + 40, P.dim, { sw: 0.5 });

  // MIDDLE ROW: full-width runs timeline card
  els.push(rect(bentoPad, r2y, W - bentoPad * 2, 100, P.surf, { rx: 10, stroke: P.border, sw: 0.5 }));
  els.push(text(bentoPad + 12, r2y + 18, 'EXECUTIONS TODAY', 9, P.sub, { fw: 600, ls: 1 }));
  els.push(text(W - bentoPad - 12, r2y + 18, '834 runs', 10, P.accent, { anchor: 'end', fw: 600 }));
  // Mini bar chart
  const barData = [42, 78, 55, 91, 67, 83, 100, 72, 88, 60, 95, 71, 84, 66, 79, 88, 93, 70, 85, 97];
  const barW = 10, barSpacing = 3, barMaxH = 52, barBaseY = r2y + 90;
  barData.forEach((pct, i) => {
    const bh = (pct / 100) * barMaxH;
    const bx = bentoPad + 12 + i * (barW + barSpacing);
    const isActive = i === barData.length - 1;
    els.push(rect(bx, barBaseY - bh, barW, bh, isActive ? P.accent : P.acc2, { rx: 2, opacity: isActive ? 0.9 : 0.45 }));
  });

  // Circuit connector: middle to third row
  const r3y = r2y + 108;
  circuitLine(els, bentoPad + 40, r2y + 100, W - bentoPad - 40, r3y, P.acc2, { sw: 0.4, opacity: 0.4 });

  // THIRD ROW: two cards — Next 3 Jobs + Failed
  // Card: Next Run
  els.push(rect(r1x, r3y, bentoCols2, 82, P.surf, { rx: 10, stroke: P.border, sw: 0.5 }));
  els.push(text(r1x + 12, r3y + 18, 'NEXT RUN', 9, P.sub, { fw: 600, ls: 1 }));
  els.push(text(r1x + 12, r3y + 40, 'data-sync', 13, P.text, { fw: 600 }));
  els.push(text(r1x + 12, r3y + 55, '→ in 3 min 22s', 11, P.run, { fw: 500 }));
  els.push(text(r1x + 12, r3y + 70, '*/5 * * * *', 10, P.dim, { fw: 400 }));
  // Pulse dot
  els.push(circle(c2x - 20, r3y + 40, 5, P.run, { opacity: 0.3 }));
  els.push(circle(c2x - 20, r3y + 40, 3, P.run));

  // Card: Failed Today
  els.push(rect(c2x, r3y, bentoCols2, 82, P.surf, { rx: 10, stroke: P.border, sw: 0.5 }));
  els.push(text(c2x + 12, r3y + 18, 'FAILED TODAY', 9, P.sub, { fw: 600, ls: 1 }));
  els.push(text(c2x + 12, r3y + 45, '3', 32, P.err, { fw: 700, ls: -1 }));
  els.push(text(c2x + 12, r3y + 70, '↓ 2 from yesterday', 10, P.sub, { fw: 400 }));

  // FOURTH ROW: recent activity list (full-width)
  const r4y = r3y + 90;
  els.push(rect(bentoPad, r4y, W - bentoPad * 2, 160, P.surf, { rx: 10, stroke: P.border, sw: 0.5 }));
  els.push(text(bentoPad + 12, r4y + 18, 'RECENT ACTIVITY', 9, P.sub, { fw: 600, ls: 1 }));

  const jobs = [
    { name: 'email-digest',    cron: '0 8 * * *',   status: 'success', dur: '1.2s',  time: '2m ago' },
    { name: 'db-cleanup',      cron: '0 3 * * 0',   status: 'success', dur: '4.7s',  time: '4m ago' },
    { name: 'report-generate', cron: '0 6 * * 1',   status: 'failed',  dur: '—',     time: '11m ago' },
    { name: 'cache-warm',      cron: '*/15 * * * *', status: 'running', dur: '0.6s',  time: 'now' },
  ];
  jobs.forEach((job, i) => {
    const jy = r4y + 36 + i * 30;
    const statusCol = job.status === 'success' ? P.success : job.status === 'failed' ? P.err : P.run;
    els.push(circle(bentoPad + 24, jy + 5, 4, statusCol, { opacity: 0.9 }));
    els.push(text(bentoPad + 36, jy + 9, job.name, 12, P.text, { fw: 500 }));
    els.push(text(W - bentoPad - 16, jy + 9, job.time, 10, P.dim, { anchor: 'end' }));
    if (i < jobs.length - 1) els.push(line(bentoPad + 12, jy + 24, W - bentoPad - 12, jy + 24, P.border, { sw: 0.4 }));
  });

  // Circuit lines from list into nav
  circuitLine(els, bentoPad + 80, r4y + 160, W - bentoPad - 80, H - 80, P.dim, { sw: 0.4, opacity: 0.3 });

  bottomNav(els, 0);
  return { name: 'Dashboard', elements: els };
}

// ── Screen 2: Job List ──────────────────────────────────────────────────────
function screen2() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  // Subtle ambient glow
  els.push({ type: 'ellipse', cx: 350, cy: 200, rx: 120, ry: 90, fill: P.glow2 });

  // Dot grid
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 9; col++) {
      els.push(circle(col * 44 + 22, row * 70 + 60, 1, P.border, { opacity: 0.5 }));
    }
  }

  statusBar(els);
  pageHeader(els, 'Jobs', '1,247 total · 4 running', 70);

  // Search bar
  els.push(rect(16, 96, W - 32, 36, P.surf, { rx: 8, stroke: P.border, sw: 0.5 }));
  els.push(text(36, 119, '⌕ Search jobs…', 13, P.dim, { fw: 400 }));
  // Filter chip
  els.push(rect(W - 90, 100, 74, 28, P.card, { rx: 6, stroke: P.border, sw: 0.5 }));
  els.push(text(W - 53, 118, 'All Status', 10, P.sub, { anchor: 'middle', fw: 500 }));

  // Filter tabs
  const tabs = ['All', 'Running', 'Failed', 'Paused'];
  const tabY = 142;
  let tabX = 16;
  tabs.forEach((tab, i) => {
    const tw = tab === 'All' ? 36 : tab === 'Running' ? 60 : tab === 'Failed' ? 52 : 56;
    els.push(rect(tabX, tabY, tw, 26, i === 0 ? P.accent : 'none', { rx: 6, stroke: i === 0 ? 'none' : P.border, sw: 0.5, opacity: i === 0 ? 1 : 1 }));
    els.push(text(tabX + tw / 2, tabY + 17, tab, 11, i === 0 ? P.bg : P.sub, { anchor: 'middle', fw: i === 0 ? 700 : 400 }));
    tabX += tw + 8;
  });

  // Job items with bento-style cards
  const jobs2 = [
    { name: 'data-sync',       cron: '*/5 * * * *',    status: 'running', lastRun: '2m ago', p90: '0.8s',  tags: ['prod', 'critical'] },
    { name: 'email-digest',    cron: '0 8 * * *',       status: 'success', lastRun: '1h ago', p90: '1.2s',  tags: ['comms'] },
    { name: 'report-generate', cron: '0 6 * * 1',       status: 'failed',  lastRun: '11m ago',p90: '—',     tags: ['reports'] },
    { name: 'db-cleanup',      cron: '0 3 * * 0',       status: 'success', lastRun: '3d ago', p90: '4.7s',  tags: ['db', 'weekly'] },
    { name: 'cache-warm',      cron: '*/15 * * * *',    status: 'running', lastRun: '1m ago', p90: '0.6s',  tags: ['perf'] },
    { name: 'stripe-sync',     cron: '0 * * * *',       status: 'success', lastRun: '58m ago',p90: '2.1s',  tags: ['billing'] },
    { name: 'image-optimize',  cron: '0 2 * * *',       status: 'paused',  lastRun: '7d ago', p90: '8.3s',  tags: ['media'] },
    { name: 'notify-overdue',  cron: '0 10 * * 1-5',    status: 'success', lastRun: '20h ago',p90: '0.4s',  tags: ['alerts'] },
  ];

  const listTop = 178;
  jobs2.forEach((job, i) => {
    const jy = listTop + i * 72;
    if (jy > H - 90) return;
    const statusCol = job.status === 'running' ? P.run : job.status === 'failed' ? P.err : job.status === 'paused' ? P.warn : P.success;

    // Card background
    els.push(rect(12, jy, W - 24, 64, P.surf, { rx: 10, stroke: P.border, sw: 0.5 }));
    // Left accent line
    els.push(rect(12, jy, 3, 64, statusCol, { rx: 1, opacity: 0.8 }));

    // Status dot
    els.push(circle(30, jy + 20, 4, statusCol));
    // Job name
    els.push(text(42, jy + 23, job.name, 13, P.text, { fw: 600 }));
    // Status label
    els.push(text(W - 24, jy + 23, job.status.toUpperCase(), 9, statusCol, { anchor: 'end', fw: 600, ls: 0.5 }));
    // Cron expression
    els.push(text(42, jy + 40, job.cron, 10, P.dim, { fw: 400 }));
    // Last run time
    els.push(text(42, jy + 55, `Last: ${job.lastRun}`, 10, P.sub, { fw: 400 }));
    // p90
    els.push(text(W - 24, jy + 55, `p90 ${job.p90}`, 10, P.dim, { anchor: 'end' }));
    // Circuit dot at right edge
    els.push(circle(W - 12, jy + 32, 2, P.dim, { opacity: 0.5 }));
    // Circuit line connecting cards
    if (i < jobs2.length - 1 && jy + 72 < H - 90) {
      circuitLine(els, W - 12, jy + 64, W - 12, jy + 72, P.dim, { sw: 0.4, opacity: 0.3 });
    }
  });

  // FAB add button
  els.push(circle(W - 28, H - 92, 22, P.accent));
  els.push(text(W - 28, H - 85, '+', 22, P.bg, { anchor: 'middle', fw: 700 }));

  bottomNav(els, 0);
  return { name: 'Job List', elements: els };
}

// ── Screen 3: Job Detail ────────────────────────────────────────────────────
function screen3() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  els.push({ type: 'ellipse', cx: 200, cy: 100, rx: 180, ry: 80, fill: P.glow });

  statusBar(els);

  // Back nav
  els.push(text(16, 68, '← data-sync', 14, P.text, { fw: 600 }));
  els.push(rect(W - 60, 54, 50, 26, P.card, { rx: 6, stroke: P.border, sw: 0.5 }));
  els.push(text(W - 35, 71, 'Edit', 11, P.sub, { anchor: 'middle' }));

  // Status badge
  els.push(rect(16, 80, 70, 22, P.run, { rx: 11, opacity: 0.15 }));
  els.push(circle(24, 91, 3.5, P.run));
  els.push(text(32, 95, 'RUNNING', 9, P.run, { fw: 700, ls: 0.5 }));

  // Hero metric row - bento cards
  const bm = 12;
  const bw = (W - bm * 4) / 3;
  [[bm, 'p50', '0.6s', P.accent], [bm * 2 + bw, 'p90', '0.8s', P.text], [bm * 3 + bw * 2, 'p99', '1.1s', P.sub]].forEach(([x, label, val, col]) => {
    els.push(rect(x, 112, bw, 56, P.surf, { rx: 8, stroke: P.border, sw: 0.5 }));
    els.push(text(x + bw / 2, 132, label, 9, P.sub, { anchor: 'middle', fw: 600, ls: 0.5 }));
    els.push(text(x + bw / 2, 153, val, 16, col, { anchor: 'middle', fw: 700 }));
  });

  // Schedule info card
  els.push(rect(bm, 178, W - bm * 2, 70, P.surf, { rx: 10, stroke: P.border, sw: 0.5 }));
  els.push(text(bm + 12, 198, 'SCHEDULE', 9, P.sub, { fw: 600, ls: 1 }));
  els.push(text(bm + 12, 220, '*/5 * * * *', 15, P.accent, { fw: 700 }));
  els.push(text(bm + 12, 238, 'Every 5 minutes · UTC · Next in 3m 22s', 10, P.sub));
  // Circuit decoration
  circuitLine(els, bm + bw / 2, 168, W - bm - 40, 178, P.dim, { sw: 0.4, opacity: 0.4 });

  // Run history sparkline card
  els.push(rect(bm, 258, W - bm * 2, 90, P.surf, { rx: 10, stroke: P.border, sw: 0.5 }));
  els.push(text(bm + 12, 276, 'LAST 30 RUNS', 9, P.sub, { fw: 600, ls: 1 }));
  els.push(text(W - bm - 12, 276, '100% success', 10, P.accent, { anchor: 'end', fw: 500 }));
  // Sparkline bars
  const sparkData = [0.6, 0.8, 0.7, 1.1, 0.6, 0.7, 0.9, 0.8, 0.6, 0.7, 0.5, 0.8, 0.9, 0.6, 0.7, 0.8, 0.6, 0.7, 0.9, 1.0, 0.7, 0.8, 0.6, 0.9, 0.7, 0.8, 0.6, 0.7, 0.8, 0.6];
  const maxVal = Math.max(...sparkData);
  sparkData.forEach((val, i) => {
    const sh = (val / maxVal) * 44;
    const sx = bm + 14 + i * 11;
    els.push(rect(sx, 256 + 90 - 14 - sh, 8, sh, P.acc2, { rx: 2, opacity: 0.6 }));
  });

  // Config card
  els.push(rect(bm, 358, W - bm * 2, 98, P.surf, { rx: 10, stroke: P.border, sw: 0.5 }));
  els.push(text(bm + 12, 376, 'CONFIGURATION', 9, P.sub, { fw: 600, ls: 1 }));
  const config = [
    ['Timeout', '30s'],
    ['Retries', '3 (backoff)'],
    ['Concurrency', 'locked — 1'],
    ['Notify on', 'failure + recovery'],
  ];
  config.forEach(([k, v], i) => {
    const cy = 390 + i * 18;
    els.push(text(bm + 12, cy, k, 11, P.sub, { fw: 400 }));
    els.push(text(W - bm - 16, cy, v, 11, P.text, { anchor: 'end', fw: 500 }));
  });

  // Recent executions
  els.push(rect(bm, 466, W - bm * 2, 136, P.surf, { rx: 10, stroke: P.border, sw: 0.5 }));
  els.push(text(bm + 12, 484, 'RECENT EXECUTIONS', 9, P.sub, { fw: 600, ls: 1 }));
  const execs = [
    { id: '#2841', dur: '0.72s', st: 'success', at: '2m ago' },
    { id: '#2840', dur: '0.68s', st: 'success', at: '7m ago' },
    { id: '#2839', dur: '0.81s', st: 'success', at: '12m ago' },
    { id: '#2838', dur: '0.77s', st: 'success', at: '17m ago' },
  ];
  execs.forEach((ex, i) => {
    const ey = 496 + i * 26;
    const sc = ex.st === 'success' ? P.success : P.err;
    els.push(circle(bm + 22, ey + 7, 3.5, sc));
    els.push(text(bm + 34, ey + 11, ex.id, 11, P.text, { fw: 500 }));
    els.push(text(bm + 90, ey + 11, ex.dur, 11, P.dim, { fw: 400 }));
    els.push(text(W - bm - 16, ey + 11, ex.at, 10, P.dim, { anchor: 'end' }));
    if (i < 3) els.push(line(bm + 12, ey + 22, W - bm - 12, ey + 22, P.border, { sw: 0.4 }));
  });

  // Circuit decoration between sections
  circuitLine(els, bm + 40, 454, bm + 40, 466, P.dim, { sw: 0.5, opacity: 0.3 });

  // Trigger now button
  els.push(rect(bm, 610, W - bm * 2, 44, P.accent, { rx: 10 }));
  els.push(text(W / 2, 637, '▶ Trigger Now', 14, P.bg, { anchor: 'middle', fw: 700 }));

  bottomNav(els, 0);
  return { name: 'Job Detail', elements: els };
}

// ── Screen 4: Log Stream ────────────────────────────────────────────────────
function screen4() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));

  // Terminal-style dark bg (slightly different shade)
  els.push(rect(0, 44, W, H - 44, '#070A0F'));

  statusBar(els);

  // Header
  els.push(rect(0, 44, W, 44, P.surf));
  els.push(line(0, 88, W, 88, P.border, { sw: 0.5 }));
  els.push(text(16, 70, 'Live Logs', 15, P.text, { fw: 700 }));
  els.push(text(W / 2, 70, '● LIVE', 10, P.err, { anchor: 'middle', fw: 700, ls: 1 }));
  // Filter icon
  els.push(text(W - 20, 70, '⊕', 18, P.sub, { anchor: 'end' }));

  // Job filter chips
  els.push(rect(0, 88, W, 34, P.surf));
  const logFilters = ['All Jobs', 'data-sync', 'email-digest', 'cache-warm'];
  let lfX = 10;
  logFilters.forEach((f, i) => {
    const fw = f.length * 7 + 16;
    els.push(rect(lfX, 93, fw, 24, i === 0 ? P.acc2 : P.card, { rx: 6 }));
    els.push(text(lfX + fw / 2, 108, f, 10, i === 0 ? P.text : P.sub, { anchor: 'middle', fw: i === 0 ? 600 : 400 }));
    lfX += fw + 6;
  });

  // Log entries
  const logs = [
    { time: '09:41:32.104', job: 'data-sync',    level: 'info',  msg: 'Job started · run #2841' },
    { time: '09:41:32.210', job: 'data-sync',    level: 'info',  msg: 'Fetching records from API' },
    { time: '09:41:32.503', job: 'data-sync',    level: 'info',  msg: '2,847 records fetched' },
    { time: '09:41:32.611', job: 'data-sync',    level: 'info',  msg: 'Upserting to database…' },
    { time: '09:41:32.718', job: 'cache-warm',   level: 'info',  msg: 'Job started · run #5502' },
    { time: '09:41:32.802', job: 'data-sync',    level: 'info',  msg: 'Upsert complete (2,847 rows)' },
    { time: '09:41:32.819', job: 'data-sync',    level: 'info',  msg: 'Job completed · 0.72s' },
    { time: '09:41:33.101', job: 'cache-warm',   level: 'info',  msg: 'Cache keys: 412 warmed' },
    { time: '09:41:33.204', job: 'cache-warm',   level: 'info',  msg: 'Job completed · 0.49s' },
    { time: '09:41:35.019', job: 'rpt-generate', level: 'error', msg: 'ERROR: timeout after 30s' },
    { time: '09:41:35.021', job: 'rpt-generate', level: 'error', msg: 'Retry 1/3 scheduled in 30s' },
    { time: '09:41:37.512', job: 'data-sync',    level: 'info',  msg: 'Job started · run #2842' },
    { time: '09:41:37.618', job: 'data-sync',    level: 'info',  msg: 'Fetching records from API' },
    { time: '09:41:37.812', job: 'data-sync',    level: 'warn',  msg: 'API latency elevated: 210ms' },
    { time: '09:41:37.990', job: 'data-sync',    level: 'info',  msg: '2,851 records fetched' },
    { time: '09:41:38.200', job: 'data-sync',    level: 'info',  msg: 'Upsert complete (2,851 rows)' },
    { time: '09:41:38.218', job: 'data-sync',    level: 'info',  msg: 'Job completed · 0.71s' },
  ];

  const logTop = 130;
  const logLineH = 34;

  logs.forEach((log, i) => {
    const ly = logTop + i * logLineH;
    if (ly > H - 90) return;
    const levelCol = log.level === 'error' ? P.err : log.level === 'warn' ? P.warn : '#4A6280';
    const bg = log.level === 'error' ? 'rgba(239,68,68,0.05)' : log.level === 'warn' ? 'rgba(245,158,11,0.05)' : 'transparent';
    if (bg !== 'transparent') els.push(rect(0, ly, W, logLineH, bg));
    // Left level indicator bar
    els.push(rect(0, ly, 2, logLineH, levelCol, { opacity: log.level === 'info' ? 0.2 : 0.8 }));
    // Timestamp (monospace)
    els.push(text(10, ly + 12, log.time, 8.5, '#3D5A80', { fw: 400, font: "'JetBrains Mono', 'Courier New', monospace" }));
    // Job badge
    const jbW = log.job.length * 6.5 + 8;
    els.push(rect(10, ly + 17, jbW, 14, P.card, { rx: 3 }));
    els.push(text(10 + jbW / 2, ly + 27, log.job, 8, P.dim, { anchor: 'middle', fw: 400 }));
    // Message
    els.push(text(10 + jbW + 6, ly + 27, log.msg, 9.5, log.level === 'error' ? P.err : log.level === 'warn' ? P.warn : '#8AA0C0', { fw: log.level === 'info' ? 400 : 500 }));
  });

  // "Live" cursor blink line
  const cursorY = logTop + logs.length * logLineH;
  if (cursorY < H - 90) {
    els.push(text(10, cursorY + 12, '09:41:38.221', 8.5, '#3D5A80', { fw: 400, font: "'JetBrains Mono', 'Courier New', monospace" }));
    els.push(rect(10, cursorY + 16, 2, 11, P.accent, { opacity: 0.8 })); // cursor
  }

  bottomNav(els, 1);
  return { name: 'Log Stream', elements: els };
}

// ── Screen 5: Monitor (Execution Timeline) ─────────────────────────────────
function screen5() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  els.push({ type: 'ellipse', cx: 100, cy: 400, rx: 140, ry: 100, fill: P.glow2 });

  statusBar(els);
  pageHeader(els, 'Monitor', 'Execution heatmap & trends', 70);

  // Time range selector
  const ranges = ['1h', '6h', '24h', '7d', '30d'];
  let rx = 16;
  const ry = 94;
  ranges.forEach((r, i) => {
    const rw = 36;
    els.push(rect(rx, ry, rw, 24, i === 2 ? P.accent : P.card, { rx: 5, stroke: i === 2 ? 'none' : P.border, sw: 0.5 }));
    els.push(text(rx + rw / 2, ry + 16, r, 10, i === 2 ? P.bg : P.sub, { anchor: 'middle', fw: i === 2 ? 700 : 400 }));
    rx += rw + 5;
  });

  // ── Heatmap grid (hour × job) ─────────────────────────────────────────────
  els.push(rect(12, 128, W - 24, 168, P.surf, { rx: 10, stroke: P.border, sw: 0.5 }));
  els.push(text(24, 146, 'EXECUTION HEATMAP — LAST 24H', 9, P.sub, { fw: 600, ls: 1 }));

  const heatJobs = ['data-sync', 'email-digest', 'db-clean', 'cache-warm', 'stripe-sync'];
  const cellW = 14, cellH = 14, heatLeft = 80, heatTop = 152;
  const hours = 24;

  heatJobs.forEach((job, ji) => {
    els.push(text(heatLeft - 4, heatTop + ji * (cellH + 2) + cellH - 2, job, 8, P.dim, { anchor: 'end', fw: 400 }));
    for (let h = 0; h < hours; h++) {
      // Simulate activity intensity
      const ran = Math.random();
      const intensity = ji === 3 ? (ran > 0.3 ? 0.8 + ran * 0.2 : 0.1) :
                        ji === 0 ? (h % 5 === 0 ? 0.9 : 0.1) :
                        (ran > 0.7 ? 0.7 + ran * 0.3 : 0.05);
      const cellColor = intensity > 0.7 ? P.accent : intensity > 0.3 ? P.acc2 : P.card;
      const cellX = heatLeft + h * (cellW + 1);
      const cellY2 = heatTop + ji * (cellH + 2);
      els.push(rect(cellX, cellY2, cellW, cellH, cellColor, { rx: 2, opacity: Math.max(0.08, intensity) }));
    }
  });
  // Hour labels
  [0, 6, 12, 18, 23].forEach(h => {
    els.push(text(heatLeft + h * (cellW + 1) + cellW / 2, heatTop + heatJobs.length * (cellH + 2) + 10, `${h}h`, 7, P.dim, { anchor: 'middle' }));
  });

  // ── Trend line charts ─────────────────────────────────────────────────────
  // Card: executions/hour trend
  els.push(rect(12, 306, W - 24, 100, P.surf, { rx: 10, stroke: P.border, sw: 0.5 }));
  els.push(text(24, 324, 'EXECUTIONS / HOUR', 9, P.sub, { fw: 600, ls: 1 }));
  els.push(text(W - 24, 324, '834 avg', 10, P.text, { anchor: 'end', fw: 500 }));
  // Trend line
  const trendPoints = [40, 55, 48, 62, 58, 71, 65, 74, 68, 77, 72, 84, 78, 90, 82, 95, 88, 92, 96, 100, 88, 94, 97, 100];
  const trendLeft = 24, trendRight = W - 24, trendW = trendRight - trendLeft;
  const trendMaxH = 52, trendBase = 306 + 100 - 14;
  for (let i = 0; i < trendPoints.length - 1; i++) {
    const tx1 = trendLeft + (i / (trendPoints.length - 1)) * trendW;
    const ty1 = trendBase - (trendPoints[i] / 100) * trendMaxH;
    const tx2 = trendLeft + ((i + 1) / (trendPoints.length - 1)) * trendW;
    const ty2 = trendBase - (trendPoints[i + 1] / 100) * trendMaxH;
    els.push(line(tx1, ty1, tx2, ty2, P.accent, { sw: 1.5, opacity: 0.8 }));
  }
  // Area fill (simulated with semi-transparent rects)
  for (let i = 0; i < trendPoints.length; i++) {
    const tx1 = trendLeft + (i / (trendPoints.length - 1)) * trendW;
    const th = (trendPoints[i] / 100) * trendMaxH;
    els.push(rect(tx1, trendBase - th, trendW / trendPoints.length, th, P.accent, { opacity: 0.04 }));
  }

  // Circuit connectors between chart cards
  circuitLine(els, 40, 406, W - 40, 416, P.dim, { sw: 0.4, opacity: 0.3 });

  // Card: error rate
  els.push(rect(12, 416, W - 24, 86, P.surf, { rx: 10, stroke: P.border, sw: 0.5 }));
  els.push(text(24, 434, 'ERROR RATE', 9, P.sub, { fw: 600, ls: 1 }));
  els.push(text(W - 24, 434, '0.8% avg', 10, P.err, { anchor: 'end', fw: 500 }));
  // Error sparkline bars (mostly low, one spike)
  for (let i = 0; i < 24; i++) {
    const hasSpike = i === 10 || i === 11;
    const bh = hasSpike ? 28 : Math.random() * 6 + 2;
    const bx = 24 + i * 14;
    els.push(rect(bx, 416 + 86 - 14 - bh, 10, bh, hasSpike ? P.err : P.dim, { rx: 1, opacity: hasSpike ? 0.8 : 0.4 }));
  }

  // Circuit connector
  circuitLine(els, 40, 502, W - 40, 512, P.dim, { sw: 0.4, opacity: 0.3 });

  // Card: p90 latency summary stats
  els.push(rect(12, 512, W - 24, 80, P.surf, { rx: 10, stroke: P.border, sw: 0.5 }));
  els.push(text(24, 530, 'LATENCY DISTRIBUTION', 9, P.sub, { fw: 600, ls: 1 }));
  const latStats = [['p50', '0.61s', P.accent], ['p90', '0.83s', P.text], ['p95', '0.97s', P.sub], ['p99', '1.22s', P.warn]];
  const lstep = (W - 48) / 4;
  latStats.forEach(([label, val, col], i) => {
    const lx = 24 + i * lstep + lstep / 2;
    els.push(text(lx, 552, val, 14, col, { anchor: 'middle', fw: 700 }));
    els.push(text(lx, 568, label, 9, P.sub, { anchor: 'middle', fw: 500 }));
  });

  bottomNav(els, 2);
  return { name: 'Monitor', elements: els };
}

// ── Screen 6: Alerts ────────────────────────────────────────────────────────
function screen6() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  els.push({ type: 'ellipse', cx: 320, cy: 300, rx: 120, ry: 100, fill: 'rgba(239,68,68,0.06)' });

  statusBar(els);
  pageHeader(els, 'Alerts', '2 active · 1 firing', 70);

  // Alert count badges
  els.push(rect(16, 82, 90, 20, 'rgba(239,68,68,0.12)', { rx: 5 }));
  els.push(circle(24, 92, 3.5, P.err));
  els.push(text(32, 96, '1 FIRING', 9, P.err, { fw: 700, ls: 0.5 }));
  els.push(rect(112, 82, 90, 20, 'rgba(245,158,11,0.12)', { rx: 5 }));
  els.push(circle(120, 92, 3.5, P.warn));
  els.push(text(128, 96, '1 WARNING', 9, P.warn, { fw: 700, ls: 0.5 }));

  // Alert tabs
  const aTabs = ['Active', 'History', 'Rules'];
  let atX = 16;
  const atY = 108;
  aTabs.forEach((t, i) => {
    const tw2 = 64;
    els.push(rect(atX, atY, tw2, 26, i === 0 ? P.card : 'none', { rx: 6, stroke: i === 0 ? P.border : 'none', sw: 0.5 }));
    els.push(text(atX + tw2 / 2, atY + 17, t, 11, i === 0 ? P.text : P.sub, { anchor: 'middle', fw: i === 0 ? 600 : 400 }));
    atX += tw2 + 8;
  });

  // ── FIRING alert card ──────────────────────────────────────────────────────
  const a1y = 144;
  els.push(rect(12, a1y, W - 24, 100, P.surf, { rx: 10, stroke: 'rgba(239,68,68,0.3)', sw: 1 }));
  // Red left accent
  els.push(rect(12, a1y, 3, 100, P.err, { rx: 1 }));
  // Header
  els.push(rect(24, a1y + 12, 52, 18, 'rgba(239,68,68,0.15)', { rx: 4 }));
  els.push(text(50, a1y + 24, 'FIRING', 9, P.err, { anchor: 'middle', fw: 700, ls: 0.5 }));
  els.push(text(85, a1y + 24, 'report-generate · timeout', 12, P.text, { fw: 600 }));
  els.push(text(W - 24, a1y + 24, '11m ago', 10, P.dim, { anchor: 'end' }));
  // Description
  els.push(text(24, a1y + 42, 'Job exceeded 30s timeout threshold (3 retries)', 11, P.sub, { fw: 400 }));
  // Metrics row
  els.push(line(24, a1y + 55, W - 24, a1y + 55, P.border, { sw: 0.4 }));
  els.push(text(24, a1y + 72, 'Duration: —', 10, P.sub));
  els.push(text(W / 2, a1y + 72, 'Retries: 1/3', 10, P.warn, { anchor: 'middle' }));
  els.push(text(W - 24, a1y + 72, 'Notified: Slack', 10, P.sub, { anchor: 'end' }));
  // Actions
  els.push(rect(24, a1y + 80, 80, 14, 'rgba(239,68,68,0.15)', { rx: 4 }));
  els.push(text(64, a1y + 90, 'View Logs', 9, P.err, { anchor: 'middle', fw: 600 }));
  els.push(rect(114, a1y + 80, 80, 14, P.card, { rx: 4 }));
  els.push(text(154, a1y + 90, 'Acknowledge', 9, P.sub, { anchor: 'middle' }));

  // Circuit connector
  circuitLine(els, 30, a1y + 100, W - 30, a1y + 112, P.err, { sw: 0.4, opacity: 0.2 });

  // ── WARNING alert card ─────────────────────────────────────────────────────
  const a2y = a1y + 120;
  els.push(rect(12, a2y, W - 24, 90, P.surf, { rx: 10, stroke: 'rgba(245,158,11,0.25)', sw: 1 }));
  els.push(rect(12, a2y, 3, 90, P.warn, { rx: 1 }));
  els.push(rect(24, a2y + 12, 66, 18, 'rgba(245,158,11,0.15)', { rx: 4 }));
  els.push(text(57, a2y + 24, 'WARNING', 9, P.warn, { anchor: 'middle', fw: 700, ls: 0.5 }));
  els.push(text(99, a2y + 24, 'data-sync · high latency', 12, P.text, { fw: 600 }));
  els.push(text(W - 24, a2y + 24, '2m ago', 10, P.dim, { anchor: 'end' }));
  els.push(text(24, a2y + 42, 'API response latency elevated: 210ms (threshold 150ms)', 10, P.sub));
  els.push(line(24, a2y + 55, W - 24, a2y + 55, P.border, { sw: 0.4 }));
  els.push(text(24, a2y + 72, 'p90: 210ms', 10, P.warn));
  els.push(text(W - 24, a2y + 72, '↑ 40% vs baseline', 10, P.sub, { anchor: 'end' }));

  // Circuit connector
  circuitLine(els, 30, a2y + 90, W - 30, a2y + 102, P.warn, { sw: 0.4, opacity: 0.2 });

  // ── Alert rules section ────────────────────────────────────────────────────
  const arTop = a2y + 110;
  els.push(text(16, arTop + 4, 'ALERT RULES', 9, P.sub, { fw: 600, ls: 1 }));
  els.push(rect(W - 64, arTop - 6, 52, 22, P.card, { rx: 5, stroke: P.border, sw: 0.5 }));
  els.push(text(W - 38, arTop + 9, '+ New', 10, P.sub, { anchor: 'middle' }));

  const rules = [
    { name: 'Job timeout',     cond: 'duration > 30s',         notif: 'Slack + Email', active: true },
    { name: 'High error rate', cond: 'errors > 5%/hour',        notif: 'PagerDuty',    active: true },
    { name: 'Job missed',      cond: 'no run within 2× interval', notif: 'Slack',      active: true },
    { name: 'Latency spike',   cond: 'p90 > 150ms',             notif: 'Webhook',      active: false },
  ];

  rules.forEach((rule, i) => {
    const ry2 = arTop + 20 + i * 50;
    els.push(rect(12, ry2, W - 24, 42, P.surf, { rx: 8, stroke: P.border, sw: 0.5 }));
    // Toggle
    const tOn = rule.active;
    els.push(rect(W - 48, ry2 + 12, 30, 17, tOn ? P.accent : P.dim, { rx: 8, opacity: tOn ? 1 : 0.4 }));
    els.push(circle(tOn ? W - 22 : W - 34, ry2 + 20, 6, P.bg));
    // Rule name + condition
    els.push(text(24, ry2 + 17, rule.name, 12, P.text, { fw: 600 }));
    els.push(text(24, ry2 + 33, rule.cond, 10, P.dim, { fw: 400 }));
    els.push(text(W - 60, ry2 + 33, rule.notif, 9, P.sub, { anchor: 'end' }));
  });

  bottomNav(els, 3);
  return { name: 'Alerts', elements: els };
}

// ── Build pen ───────────────────────────────────────────────────────────────
const screens = [screen1(), screen2(), screen3(), screen4(), screen5(), screen6()];
const totalElements = screens.reduce((sum, s) => sum + s.elements.length, 0);

// Convert circle/ellipse/line/text/rect to SVG-compatible elements
function buildSvg(screenData) {
  const elems = screenData.elements.map(el => {
    if (el.type === 'ellipse') return { ...el };
    return el;
  });
  // Generate simple SVG string for the screen
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
  svg += `<style>* { font-family: Inter, system-ui, sans-serif; }</style>`;
  elems.forEach(el => {
    if (el.type === 'rect') {
      svg += `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${el.rx || 0}" opacity="${el.opacity ?? 1}"`;
      if (el.stroke && el.stroke !== 'none') svg += ` stroke="${el.stroke}" stroke-width="${el.strokeWidth || el.sw || 0}"`;
      svg += '/>';
    } else if (el.type === 'text') {
      svg += `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${el.fontWeight || 400}" text-anchor="${el.textAnchor || 'start'}" letter-spacing="${el.letterSpacing || 0}" opacity="${el.opacity ?? 1}"`;
      if (el.fontFamily) svg += ` font-family="${el.fontFamily}"`;
      svg += `>${el.content}</text>`;
    } else if (el.type === 'circle') {
      svg += `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity ?? 1}"`;
      if (el.stroke && el.stroke !== 'none') svg += ` stroke="${el.stroke}" stroke-width="${el.strokeWidth || el.sw || 0}"`;
      svg += '/>';
    } else if (el.type === 'ellipse') {
      svg += `<ellipse cx="${el.cx}" cy="${el.cy}" rx="${el.rx}" ry="${el.ry}" fill="${el.fill}" opacity="${el.opacity ?? 1}"/>`;
    } else if (el.type === 'line') {
      svg += `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth || el.sw || 1}" opacity="${el.opacity ?? 1}"/>`;
    }
  });
  svg += '</svg>';
  return svg;
}

const pen = {
  version: '2.8',
  metadata: {
    name: 'CRON — Job Scheduling & Observability',
    author: 'RAM',
    date: new Date().toISOString(),
    theme: 'dark',
    heartbeat: 44,
    slug: SLUG,
    elements: totalElements,
    description: 'AI-powered job scheduling and observability platform. Inspired by Railway.app circuit-board connector lines pattern (saaspo.com) and the "Linear Look" bento grid with ambient glow (darkmodedesign.com).',
    palette: { bg: P.bg, surface: P.surf, accent: P.accent, accent2: P.acc2, text: P.text, muted: P.sub },
  },
  screens: screens.map(s => ({
    name: s.name,
    svg: buildSvg(s),
    elements: s.elements,
  })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`CRON: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
