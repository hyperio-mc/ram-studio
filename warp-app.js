'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'warp';
const NAME = 'WARP';
const W = 390, H = 844;

// Dark zinc palette — inspired by Godly's "premium dark developer tool" aesthetic
// (Phantom, Reflect, Shuttle) + Dark Mode Design's Skarlo red-on-dark pattern
const C = {
  bg:      '#0B0C10',
  surf:    '#13151C',
  card:    '#1A1D27',
  card2:   '#1F2330',
  border:  '#252838',
  accent:  '#6366F1',  // electric indigo
  accent2: '#F59E0B',  // warm amber
  accent3: '#10B981',  // emerald for success
  danger:  '#EF4444',  // red for errors
  text:    '#E2E8F0',
  muted:   '#64748B',
  dim:     '#334155',
  white:   '#FFFFFF',
};

let elements = [];

function rect(x, y, w, h, fill, opts = {}) {
  const el = { type: 'rect', x, y, w, h, fill };
  if (opts.rx !== undefined) el.rx = opts.rx;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  if (opts.stroke) el.stroke = opts.stroke;
  if (opts.sw) el.sw = opts.sw;
  return el;
}

function text(x, y, content, size, fill, opts = {}) {
  const el = { type: 'text', x, y, content: String(content), size, fill };
  if (opts.fw) el.fw = opts.fw;
  if (opts.font) el.font = opts.font;
  if (opts.anchor) el.anchor = opts.anchor;
  if (opts.ls) el.ls = opts.ls;
  if (opts.opacity) el.opacity = opts.opacity;
  return el;
}

function circle(cx, cy, r, fill, opts = {}) {
  const el = { type: 'circle', cx, cy, r, fill };
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  if (opts.stroke) el.stroke = opts.stroke;
  if (opts.sw) el.sw = opts.sw;
  return el;
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  const el = { type: 'line', x1, y1, x2, y2, stroke };
  if (opts.sw) el.sw = opts.sw;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  return el;
}

// --- STATUS BAR ---
function statusBar(els) {
  els.push(rect(0, 0, W, 48, C.bg));
  els.push(text(16, 15, '9:41', 12, C.text, { fw: 600 }));
  // signal dots
  for (let i = 0; i < 3; i++) {
    els.push(rect(W - 60 + i * 9, 19, 6, 6 - i * 1, C.text, { rx: 2, opacity: 1 - i * 0.3 }));
  }
  // wifi
  els.push(rect(W - 32, 18, 14, 9, 'none', { stroke: C.text, sw: 1.5, rx: 2 }));
  els.push(rect(W - 29, 20, 8, 5, C.text, { rx: 1 }));
  // battery
  els.push(rect(W - 20, 17, 14, 10, 'none', { stroke: C.text, sw: 1.5, rx: 2 }));
  els.push(rect(W - 18, 19, 8, 6, C.text, { rx: 1 }));
}

// --- NAV BAR ---
function navBar(els, active) {
  const navItems = [
    { label: 'Dash', icon: '▣', id: 0 },
    { label: 'Activity', icon: '◈', id: 1 },
    { label: 'Deploy', icon: '◉', id: 2 },
    { label: 'Team', icon: '◎', id: 3 },
    { label: 'Log', icon: '≡', id: 4 },
  ];
  els.push(rect(0, H - 80, W, 80, C.surf));
  els.push(line(0, H - 80, W, H - 80, C.border, { sw: 1 }));
  navItems.forEach((item, i) => {
    const x = (W / navItems.length) * i + W / navItems.length / 2;
    const isActive = i === active;
    // icon circle background for active
    if (isActive) {
      els.push(rect(x - 20, H - 70, 40, 28, C.accent, { rx: 14, opacity: 0.15 }));
    }
    els.push(text(x, H - 58, item.icon, 16, isActive ? C.accent : C.muted, { anchor: 'middle' }));
    els.push(text(x, H - 38, item.label, 10, isActive ? C.accent : C.muted, { anchor: 'middle', fw: isActive ? 600 : 400 }));
  });
}

// --- HEADER ---
function header(els, title, subtitle) {
  els.push(rect(0, 48, W, 60, C.bg));
  els.push(text(20, 68, title, 22, C.text, { fw: 700, ls: -0.5 }));
  if (subtitle) {
    els.push(text(20, 90, subtitle, 12, C.muted));
  }
}

// ============================================================
// SCREEN 1: DASHBOARD
// ============================================================
function buildScreen1() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  statusBar(els);

  // Header
  els.push(text(20, 68, 'Dashboard', 22, C.text, { fw: 700, ls: -0.5 }));
  els.push(text(20, 92, 'Sun, Apr 13 · Sprint 24', 12, C.muted));

  // Ambient glow accent
  els.push(circle(195, 200, 120, C.accent, { opacity: 0.06 }));

  // Velocity score card — bento hero
  els.push(rect(16, 108, W - 32, 120, C.card, { rx: 16, stroke: C.border, sw: 1 }));
  els.push(rect(16, 108, W - 32, 120, C.accent, { rx: 16, opacity: 0.04 }));
  els.push(text(30, 133, 'RELEASE VELOCITY', 9, C.accent, { fw: 700, ls: 1.5 }));
  els.push(text(30, 168, '94', 52, C.text, { fw: 800, ls: -2 }));
  els.push(text(90, 168, '/100', 20, C.muted, { fw: 400 }));
  els.push(text(30, 198, '↑ 12 pts from last sprint', 12, C.accent3, { fw: 500 }));

  // Velocity bar
  els.push(rect(30, 213, W - 62, 6, C.dim, { rx: 3 }));
  els.push(rect(30, 213, (W - 62) * 0.94, 6, C.accent, { rx: 3 }));

  // 3-col metric row
  const metrics = [
    { label: 'DEPLOYS', value: '48', sub: 'this week', color: C.text },
    { label: 'SUCCESS', value: '96%', sub: 'rate', color: C.accent3 },
    { label: 'MTTR', value: '4m', sub: 'avg restore', color: C.accent2 },
  ];
  const mW = (W - 32 - 16) / 3;
  metrics.forEach((m, i) => {
    const mx = 16 + i * (mW + 8);
    els.push(rect(mx, 240, mW, 72, C.card, { rx: 12, stroke: C.border, sw: 1 }));
    els.push(text(mx + mW/2, 265, m.label, 8, C.muted, { fw: 600, ls: 1, anchor: 'middle' }));
    els.push(text(mx + mW/2, 290, m.value, 22, m.color, { fw: 800, anchor: 'middle', ls: -0.5 }));
    els.push(text(mx + mW/2, 306, m.sub, 9, C.muted, { anchor: 'middle' }));
  });

  // Deploy streak
  els.push(rect(16, 326, W - 32, 84, C.card, { rx: 16, stroke: C.border, sw: 1 }));
  els.push(text(30, 348, 'STREAK', 9, C.accent2, { fw: 700, ls: 1.5 }));
  els.push(text(30, 373, '🔥 18-day deploy streak', 14, C.text, { fw: 600 }));
  // Streak dots
  for (let i = 0; i < 18; i++) {
    const sx = 30 + i * 18;
    els.push(circle(sx, 396, 5, C.accent2, { opacity: 0.7 + (i / 18) * 0.3 }));
  }
  // Dim remaining
  for (let i = 18; i < 21; i++) {
    const sx = 30 + i * 18;
    els.push(circle(sx, 396, 5, C.dim, { opacity: 0.4 }));
  }

  // Recent deploys
  els.push(text(20, 432, 'Recent Deploys', 14, C.text, { fw: 600 }));
  els.push(text(W - 20, 432, 'View all', 12, C.accent, { anchor: 'end' }));

  const deploys = [
    { repo: 'api-gateway', env: 'prod', sha: 'a7f3c12', time: '2m ago', status: 'success' },
    { repo: 'web-frontend', env: 'prod', sha: 'b9d1e45', time: '28m ago', status: 'success' },
    { repo: 'auth-service', env: 'staging', sha: 'c2a8f67', time: '1h ago', status: 'running' },
    { repo: 'data-pipeline', env: 'prod', sha: 'e5f2a89', time: '3h ago', status: 'failed' },
  ];

  deploys.forEach((d, i) => {
    const dy = 448 + i * 64;
    els.push(rect(16, dy, W - 32, 56, C.card, { rx: 12, stroke: C.border, sw: 1 }));
    // Status dot
    const dotColor = d.status === 'success' ? C.accent3 : d.status === 'running' ? C.accent : C.danger;
    els.push(circle(36, dy + 22, 5, dotColor, { opacity: 0.9 }));
    els.push(text(50, dy + 18, d.repo, 13, C.text, { fw: 600 }));
    els.push(text(50, dy + 36, `${d.sha} · ${d.env}`, 11, C.muted));
    // Env badge
    const badgeColor = d.env === 'prod' ? C.accent : C.muted;
    els.push(rect(W - 90, dy + 14, 44, 18, badgeColor, { rx: 9, opacity: 0.15 }));
    els.push(text(W - 68, dy + 26, d.env, 9, badgeColor, { fw: 600, anchor: 'middle', ls: 0.5 }));
    els.push(text(W - 30, dy + 22, d.time, 10, C.muted, { anchor: 'end' }));
    els.push(line(16, dy + 56, W - 16, dy + 56, C.border, { sw: 1, opacity: 0.5 }));
  });

  navBar(els, 0);
  return els;
}

// ============================================================
// SCREEN 2: ACTIVITY FEED
// ============================================================
function buildScreen2() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  statusBar(els);
  header(els, 'Activity', 'All events · live');

  // Filter chips
  const filters = ['All', 'Deploys', 'Alerts', 'PRs', 'Reviews'];
  let fx = 20;
  filters.forEach((f, i) => {
    const fw2 = f.length * 8 + 20;
    const isActive = i === 0;
    els.push(rect(fx, 106, fw2, 28, isActive ? C.accent : C.card, { rx: 14, stroke: isActive ? C.accent : C.border, sw: 1 }));
    els.push(text(fx + fw2/2, 124, f, 11, isActive ? C.white : C.muted, { fw: isActive ? 600 : 400, anchor: 'middle' }));
    fx += fw2 + 8;
  });

  // Live indicator
  els.push(circle(W - 30, 120, 5, C.accent3, { opacity: 0.9 }));
  els.push(text(W - 22, 124, 'LIVE', 9, C.accent3, { fw: 700, ls: 1 }));

  // Timeline items
  const events = [
    { type: 'deploy', icon: '◉', text: 'api-gateway deployed to prod', sub: 'by @alexk · a7f3c12', time: 'now', color: C.accent3 },
    { type: 'pr', icon: '⊕', text: 'PR #892 merged: auth refactor', sub: '3 files changed · +247 -89', time: '12m', color: C.accent },
    { type: 'alert', icon: '⚠', text: 'Error spike on /checkout', sub: 'p99 latency > 2.4s', time: '18m', color: C.danger },
    { type: 'review', icon: '◈', text: 'PR #890 approved', sub: 'by @saria · web-frontend', time: '34m', color: C.accent2 },
    { type: 'deploy', icon: '◉', text: 'web-frontend deployed to prod', sub: 'by @mattd · b9d1e45', time: '28m', color: C.accent3 },
    { type: 'pr', icon: '⊕', text: 'PR #891 opened: perf cache', sub: 'data-pipeline · @riya', time: '45m', color: C.accent },
    { type: 'deploy', icon: '◉', text: 'auth-service → staging', sub: 'by @priyaS · c2a8f67', time: '1h', color: C.muted },
    { type: 'alert', icon: '⚠', text: 'data-pipeline deploy failed', sub: 'Exit code 1 · auto-rollback', time: '3h', color: C.danger },
  ];

  events.forEach((ev, i) => {
    const ey = 152 + i * 70;
    // Timeline line
    if (i < events.length - 1) {
      els.push(line(36, ey + 22, 36, ey + 70, C.border, { sw: 1, opacity: 0.4 }));
    }
    // Icon circle
    els.push(circle(36, ey + 10, 10, ev.color, { opacity: 0.12 }));
    els.push(text(36, ey + 15, ev.icon, 10, ev.color, { anchor: 'middle' }));

    // Content card
    els.push(rect(56, ey, W - 72, 56, C.card, { rx: 12, stroke: C.border, sw: 1 }));
    els.push(text(70, ey + 18, ev.text, 13, C.text, { fw: 500 }));
    els.push(text(70, ey + 36, ev.sub, 11, C.muted));
    els.push(text(W - 28, ey + 18, ev.time, 10, C.muted, { anchor: 'end' }));
  });

  navBar(els, 1);
  return els;
}

// ============================================================
// SCREEN 3: DEPLOY DETAIL
// ============================================================
function buildScreen3() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  statusBar(els);

  // Back nav
  els.push(text(20, 72, '← api-gateway', 13, C.accent, { fw: 500 }));
  els.push(text(W - 20, 72, '···', 16, C.muted, { anchor: 'end' }));

  // Deploy header
  els.push(rect(16, 88, W - 32, 100, C.card, { rx: 16, stroke: C.accent3, sw: 1, opacity: 1 }));
  els.push(rect(16, 88, W - 32, 100, C.accent3, { rx: 16, opacity: 0.04 }));
  els.push(circle(38, 112, 10, C.accent3, { opacity: 0.2 }));
  els.push(text(38, 116, '◉', 10, C.accent3, { anchor: 'middle' }));
  els.push(text(58, 107, 'LIVE IN PRODUCTION', 9, C.accent3, { fw: 700, ls: 1 }));
  els.push(text(58, 128, 'api-gateway · v2.14.3', 18, C.text, { fw: 700 }));
  els.push(text(30, 156, 'a7f3c12', 11, C.muted));
  els.push(text(120, 156, '·', 11, C.muted));
  els.push(text(130, 156, 'prod · us-east-1', 11, C.muted));
  els.push(text(W - 30, 156, '2m ago', 11, C.muted, { anchor: 'end' }));

  // Pipeline stages
  els.push(text(20, 210, 'Pipeline', 14, C.text, { fw: 600 }));

  const stages = [
    { name: 'Build', dur: '1m 23s', status: 'done' },
    { name: 'Test', dur: '2m 47s', status: 'done' },
    { name: 'Security Scan', dur: '0m 52s', status: 'done' },
    { name: 'Deploy', dur: '0m 38s', status: 'done' },
    { name: 'Health Check', dur: '0m 12s', status: 'done' },
  ];

  stages.forEach((st, i) => {
    const sy = 228 + i * 52;
    els.push(rect(16, sy, W - 32, 44, C.card, { rx: 10, stroke: C.border, sw: 1 }));
    els.push(circle(36, sy + 22, 8, C.accent3, { opacity: 0.2 }));
    els.push(text(36, sy + 26, '✓', 9, C.accent3, { anchor: 'middle', fw: 700 }));
    els.push(text(52, sy + 18, st.name, 13, C.text, { fw: 500 }));
    els.push(text(52, sy + 35, st.dur, 10, C.muted));
    // Progress bar full
    els.push(rect(W - 100, sy + 18, 72, 4, C.dim, { rx: 2 }));
    els.push(rect(W - 100, sy + 18, 72, 4, C.accent3, { rx: 2 }));
  });

  // Post-deploy metrics
  els.push(text(20, 500, 'Post-Deploy Metrics', 14, C.text, { fw: 600 }));

  const pdMetrics = [
    { label: 'Response Time', value: '87ms', delta: '-12ms', good: true },
    { label: 'Error Rate', value: '0.02%', delta: '-0.1%', good: true },
    { label: 'Throughput', value: '4.2K/s', delta: '+8%', good: true },
  ];
  const pW = (W - 32 - 16) / 3;
  pdMetrics.forEach((m, i) => {
    const mx = 16 + i * (pW + 8);
    els.push(rect(mx, 518, pW, 68, C.card, { rx: 12, stroke: C.border, sw: 1 }));
    els.push(text(mx + pW/2, 538, m.label, 8, C.muted, { anchor: 'middle' }));
    els.push(text(mx + pW/2, 560, m.value, 18, C.text, { fw: 700, anchor: 'middle', ls: -0.3 }));
    els.push(text(mx + pW/2, 578, m.delta, 10, m.good ? C.accent3 : C.danger, { anchor: 'middle', fw: 500 }));
  });

  // Commit info
  els.push(rect(16, 600, W - 32, 88, C.card, { rx: 16, stroke: C.border, sw: 1 }));
  els.push(text(30, 622, 'COMMIT DETAILS', 9, C.muted, { fw: 600, ls: 1 }));
  els.push(text(30, 645, 'fix: resolve auth race condition on', 13, C.text));
  els.push(text(30, 662, 'concurrent token refresh calls', 13, C.text));
  els.push(text(30, 681, '@alexk · 4 files · +127 lines', 11, C.muted));

  // Rollback button
  els.push(rect(16, 704, W - 32, 44, C.danger, { rx: 14, opacity: 0.1, stroke: C.danger, sw: 1 }));
  els.push(text(W/2, 730, 'Rollback to v2.14.2', 13, C.danger, { fw: 600, anchor: 'middle' }));

  navBar(els, 2);
  return els;
}

// ============================================================
// SCREEN 4: TEAM
// ============================================================
function buildScreen4() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  statusBar(els);
  header(els, 'Team', 'Sprint 24 contributions');

  // Bento: team velocity
  els.push(rect(16, 108, W - 32, 88, C.card, { rx: 16, stroke: C.border, sw: 1 }));
  els.push(rect(16, 108, W - 32, 88, C.accent, { rx: 16, opacity: 0.04 }));
  els.push(text(30, 130, 'SPRINT HEALTH', 9, C.accent, { fw: 700, ls: 1.5 }));
  // Health bar segments
  const segments = [
    { w: 0.72, color: C.accent3 },
    { w: 0.18, color: C.accent2 },
    { w: 0.10, color: C.danger },
  ];
  let sx2 = 30;
  const barW = W - 62;
  segments.forEach((s, i) => {
    const sw = barW * s.w;
    els.push(rect(sx2, 148, sw - (i < segments.length - 1 ? 2 : 0), 12, s.color, {
      rx: i === 0 ? 6 : i === segments.length - 1 ? 6 : 2,
      opacity: 0.85
    }));
    sx2 += sw;
  });
  els.push(text(30, 178, '72% on track', 11, C.accent3, { fw: 500 }));
  els.push(text(160, 178, '18% at risk', 11, C.accent2, { fw: 500 }));
  els.push(text(270, 178, '10% blocked', 11, C.danger, { fw: 500 }));

  // Contributors list
  els.push(text(20, 214, 'Contributors', 14, C.text, { fw: 600 }));
  els.push(text(W - 20, 214, 'This sprint', 11, C.muted, { anchor: 'end' }));

  const members = [
    { name: 'Alex Kim', role: 'Backend', deploys: 18, prs: 12, score: 94, color: '#8B5CF6' },
    { name: 'Saria Patel', role: 'Frontend', deploys: 14, prs: 9, score: 88, color: '#06B6D4' },
    { name: 'Matt Davis', role: 'Platform', deploys: 11, prs: 7, score: 82, color: '#10B981' },
    { name: 'Priya Singh', role: 'Backend', deploys: 8, prs: 6, score: 76, color: '#F59E0B' },
    { name: 'Riya Chen', role: 'Data', deploys: 6, prs: 4, score: 71, color: '#EF4444' },
  ];

  members.forEach((m, i) => {
    const my = 232 + i * 78;
    els.push(rect(16, my, W - 32, 68, C.card, { rx: 14, stroke: C.border, sw: 1 }));
    // Avatar
    els.push(circle(46, my + 28, 18, m.color, { opacity: 0.2 }));
    els.push(circle(46, my + 28, 18, 'none', { stroke: m.color, sw: 1.5, opacity: 0.5 }));
    els.push(text(46, my + 33, m.name.charAt(0) + m.name.split(' ')[1].charAt(0), 11, m.color, { anchor: 'middle', fw: 700 }));
    // Name + role
    els.push(text(72, my + 22, m.name, 14, C.text, { fw: 600 }));
    els.push(text(72, my + 40, m.role, 11, C.muted));
    // Stats
    els.push(text(W - 30, my + 16, `${m.score}`, 20, C.text, { fw: 800, anchor: 'end', ls: -0.5 }));
    els.push(text(W - 30, my + 36, 'score', 9, C.muted, { anchor: 'end' }));
    // Mini progress bar
    els.push(rect(72, my + 52, W - 120, 4, C.dim, { rx: 2 }));
    els.push(rect(72, my + 52, (W - 120) * (m.score / 100), 4, m.color, { rx: 2, opacity: 0.7 }));
    // Deploys badge
    els.push(text(W - 80, my + 52, `${m.deploys} deploys`, 10, C.muted, { anchor: 'end' }));
  });

  navBar(els, 3);
  return els;
}

// ============================================================
// SCREEN 5: CHANGELOG
// ============================================================
function buildScreen5() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  statusBar(els);
  header(els, 'Changelog', 'Release notes');

  // Filter: version type
  const types = ['All', 'Major', 'Minor', 'Patch'];
  let ftx = 20;
  types.forEach((t, i) => {
    const fw2 = t.length * 9 + 18;
    const isActive = i === 0;
    els.push(rect(ftx, 106, fw2, 26, isActive ? C.accent : C.surf, { rx: 13, stroke: isActive ? C.accent : C.border, sw: 1 }));
    els.push(text(ftx + fw2/2, 123, t, 11, isActive ? C.white : C.muted, { fw: isActive ? 600 : 400, anchor: 'middle' }));
    ftx += fw2 + 8;
  });

  // Releases
  const releases = [
    {
      version: 'v2.14.3',
      date: 'Apr 13, 2026',
      type: 'patch',
      title: 'Auth race condition fix',
      changes: ['fix: concurrent token refresh bug', 'fix: session expiry edge case', 'chore: update deps'],
      highlight: false,
    },
    {
      version: 'v2.14.0',
      date: 'Apr 10, 2026',
      type: 'minor',
      title: 'Performance & caching overhaul',
      changes: ['feat: Redis cache layer for all routes', 'feat: request deduplication', 'perf: reduce cold start 340ms→87ms'],
      highlight: true,
    },
    {
      version: 'v2.13.0',
      date: 'Apr 3, 2026',
      type: 'minor',
      title: 'Team permissions v2',
      changes: ['feat: role-based deploy gates', 'feat: approval workflows', 'feat: audit log export'],
      highlight: false,
    },
  ];

  let ry = 144;
  releases.forEach((r) => {
    const rh = r.changes.length * 20 + 72;
    const borderColor = r.highlight ? C.accent : C.border;
    const borderW = r.highlight ? 1.5 : 1;
    els.push(rect(16, ry, W - 32, rh, C.card, { rx: 14, stroke: borderColor, sw: borderW }));
    if (r.highlight) {
      els.push(rect(16, ry, W - 32, rh, C.accent, { rx: 14, opacity: 0.03 }));
    }
    // Version badge
    const typeColor = r.type === 'patch' ? C.muted : r.type === 'minor' ? C.accent : C.accent2;
    els.push(rect(28, ry + 12, 52, 18, typeColor, { rx: 9, opacity: 0.15 }));
    els.push(text(54, ry + 25, r.type, 9, typeColor, { fw: 700, anchor: 'middle', ls: 0.5 }));
    els.push(text(90, ry + 25, r.version, 12, C.text, { fw: 700 }));
    els.push(text(W - 28, ry + 25, r.date, 10, C.muted, { anchor: 'end' }));
    // Title
    els.push(text(28, ry + 48, r.title, 14, C.text, { fw: 600 }));
    // Changes
    r.changes.forEach((ch, ci) => {
      const cy2 = ry + 66 + ci * 20;
      const chColor = ch.startsWith('feat') ? C.accent3 : ch.startsWith('perf') ? C.accent : C.muted;
      const prefix = ch.split(':')[0];
      const rest = ch.split(':').slice(1).join(':').trim();
      els.push(rect(28, cy2 - 8, 36, 14, chColor, { rx: 7, opacity: 0.12 }));
      els.push(text(46, cy2 + 2, prefix, 8, chColor, { fw: 600, anchor: 'middle' }));
      els.push(text(72, cy2 + 2, rest, 11, C.muted));
    });
    ry += rh + 12;
  });

  navBar(els, 4);
  return els;
}

// ============================================================
// SCREEN 6: SETTINGS / INTEGRATIONS
// ============================================================
function buildScreen6() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  statusBar(els);
  header(els, 'Integrations', 'Connect your stack');

  // Ambient
  els.push(circle(300, 300, 80, C.accent2, { opacity: 0.05 }));

  // Status overview
  els.push(rect(16, 108, W - 32, 60, C.card, { rx: 14, stroke: C.border, sw: 1 }));
  els.push(text(30, 128, '6 of 8 integrations active', 13, C.text, { fw: 500 }));
  els.push(rect(30, 140, (W - 62) * 0.75, 6, C.accent3, { rx: 3 }));
  els.push(rect(30 + (W - 62) * 0.75, 140, (W - 62) * 0.25, 6, C.dim, { rx: 3 }));
  els.push(text(W - 30, 145, '75%', 10, C.accent3, { anchor: 'end', fw: 600 }));
  els.push(text(W - 30, 130, '↑ 2 new', 10, C.accent, { anchor: 'end' }));

  // Integration list
  const integrations = [
    { name: 'GitHub', desc: 'Source control & PRs', active: true, color: '#E2E8F0' },
    { name: 'Slack', desc: 'Deploy notifications', active: true, color: '#4A154B' },
    { name: 'PagerDuty', desc: 'Incident routing', active: true, color: '#06AC38' },
    { name: 'Datadog', desc: 'Metrics & traces', active: true, color: '#632CA6' },
    { name: 'Linear', desc: 'Issue tracking', active: true, color: '#5E6AD2' },
    { name: 'Vercel', desc: 'Edge deployments', active: true, color: C.text },
    { name: 'Jira', desc: 'Project management', active: false, color: '#0052CC' },
    { name: 'Sentry', desc: 'Error monitoring', active: false, color: '#FB4226' },
  ];

  const sectionY = 182;
  els.push(text(20, sectionY, 'Connected', 12, C.muted, { fw: 600, ls: 0.5 }));
  let iy = sectionY + 16;
  integrations.forEach((intg, i) => {
    if (i === 6) {
      els.push(text(20, iy + 4, 'Available', 12, C.muted, { fw: 600, ls: 0.5 }));
      iy += 24;
    }
    const ih = 54;
    els.push(rect(16, iy, W - 32, ih, C.card, { rx: 12, stroke: C.border, sw: 1 }));
    // Logo placeholder
    els.push(circle(46, iy + ih/2, 14, intg.color, { opacity: 0.15 }));
    els.push(text(46, iy + ih/2 + 5, intg.name.charAt(0), 13, intg.color, { anchor: 'middle', fw: 700 }));
    // Name + desc
    els.push(text(68, iy + 20, intg.name, 13, C.text, { fw: 600 }));
    els.push(text(68, iy + 38, intg.desc, 11, C.muted));
    // Toggle
    const toggleX = W - 60;
    if (intg.active) {
      els.push(rect(toggleX, iy + ih/2 - 8, 36, 16, C.accent, { rx: 8, opacity: 0.9 }));
      els.push(circle(toggleX + 26, iy + ih/2, 6, C.white, { opacity: 1 }));
    } else {
      els.push(rect(toggleX, iy + ih/2 - 8, 36, 16, C.dim, { rx: 8, opacity: 0.6 }));
      els.push(circle(toggleX + 10, iy + ih/2, 6, C.muted, { opacity: 0.8 }));
    }
    iy += ih + 8;
  });

  navBar(els, 4);
  return els;
}

// BUILD ALL SCREENS
const screens = [
  { name: 'Dashboard', build: buildScreen1 },
  { name: 'Activity', build: buildScreen2 },
  { name: 'Deploy Detail', build: buildScreen3 },
  { name: 'Team', build: buildScreen4 },
  { name: 'Changelog', build: buildScreen5 },
  { name: 'Integrations', build: buildScreen6 },
];

const builtScreens = screens.map(s => {
  const els = s.build();
  return { name: s.name, elements: els, svg: '', elementCount: els.length };
});

const totalElements = builtScreens.reduce((a, s) => a + s.elementCount, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'WARP — Release Velocity Dashboard',
    author: 'RAM',
    date: new Date().toISOString(),
    theme: 'dark',
    heartbeat: 505,
    elements: totalElements,
    palette: {
      bg: C.bg, surface: C.surf, card: C.card,
      accent: C.accent, accent2: C.accent2, text: C.text,
    },
    inspiration: 'Godly + Dark Mode Design — premium dark developer tool aesthetic',
  },
  screens: builtScreens.map(s => ({
    name: s.name,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"></svg>`,
    elements: s.elements,
  })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${builtScreens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
