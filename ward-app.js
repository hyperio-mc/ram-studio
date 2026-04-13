'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'ward';
const NAME = 'WARD';
const TAGLINE = 'Incident intelligence for dev teams';
const HEARTBEAT = 489;
const W = 390, H = 844;

// Zinc-scale dark palette — inspired by darkmodedesign.com zinc trend
const C = {
  bg:      '#09090B',   // zinc-950
  surf:    '#18181B',   // zinc-900
  card:    '#27272A',   // zinc-800
  border:  '#3F3F46',   // zinc-700
  text:    '#FAFAFA',   // zinc-50
  sub:     '#A1A1AA',   // zinc-400
  muted:   '#71717A',   // zinc-500
  accent:  '#6366F1',   // indigo-500 — primary action
  ok:      '#10B981',   // emerald-500 — healthy
  warn:    '#F59E0B',   // amber-500 — degraded
  crit:    '#F43F5E',   // rose-500 — critical/incident
  acc2:    '#818CF8',   // indigo-400 — lighter accent
};

let elements = [];

function rect(x, y, w, h, fill, opts = {}) {
  const el = { type: 'rect', x, y, w, h, fill };
  if (opts.rx)      el.rx = opts.rx;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  if (opts.stroke)  el.stroke = opts.stroke;
  if (opts.sw)      el.sw = opts.sw;
  return el;
}

function text(x, y, content, size, fill, opts = {}) {
  const el = { type: 'text', x, y, content, size, fill };
  if (opts.fw)     el.fw = opts.fw;
  if (opts.anchor) el.anchor = opts.anchor;
  if (opts.ls)     el.ls = opts.ls;
  if (opts.font)   el.font = opts.font;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  return el;
}

function circle(cx, cy, r, fill, opts = {}) {
  const el = { type: 'circle', cx, cy, r, fill };
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  if (opts.stroke)  el.stroke = opts.stroke;
  if (opts.sw)      el.sw = opts.sw;
  return el;
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  const el = { type: 'line', x1, y1, x2, y2, stroke };
  if (opts.sw !== undefined) el.sw = opts.sw;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  return el;
}

function statusDot(cx, cy, status) {
  const color = status === 'ok' ? C.ok : status === 'warn' ? C.warn : C.crit;
  const r = 5;
  return [
    circle(cx, cy, r + 3, color, { opacity: 0.2 }),
    circle(cx, cy, r, color),
  ];
}

function pill(x, y, w, h, fill, label, labelColor, opts = {}) {
  return [
    rect(x, y, w, h, fill, { rx: h / 2, opacity: opts.bgOpacity || 1 }),
    text(x + w / 2, y + h / 2 + 4.5, label, opts.size || 9, labelColor, { anchor: 'middle', fw: 600, ls: 0.5 }),
  ];
}

// ─── Status bar ─────────────────────────────────────────────────────────────
function statusBar(els) {
  els.push(rect(0, 0, W, 44, C.bg));
  els.push(text(16, 29, '9:41', 13, C.text, { fw: 600 }));
  els.push(text(W - 16, 29, '●●● ▌▌ ■', 11, C.text, { anchor: 'end', opacity: 0.7 }));
  return els;
}

// ─── Bottom nav ─────────────────────────────────────────────────────────────
function bottomNav(els, active) {
  const navH = 72;
  const navY = H - navH;
  els.push(rect(0, navY, W, navH, C.surf));
  els.push(line(0, navY, W, navY, C.border, { sw: 0.5 }));

  const tabs = [
    { label: 'Overview', icon: '⬡', id: 0 },
    { label: 'Services', icon: '◈', id: 1 },
    { label: 'On-Call',  icon: '◎', id: 2 },
    { label: 'Alerts',   icon: '△', id: 3 },
  ];

  tabs.forEach((tab, i) => {
    const x = (W / tabs.length) * i + W / tabs.length / 2;
    const isActive = i === active;
    const col = isActive ? C.accent : C.muted;
    els.push(text(x, navY + 22, tab.icon, 18, col, { anchor: 'middle' }));
    els.push(text(x, navY + 40, tab.label, 10, col, { anchor: 'middle', fw: isActive ? 600 : 400 }));
    if (isActive) {
      els.push(rect(x - 20, navY, 40, 2, C.accent, { rx: 1 }));
    }
  });
  return els;
}

// ─── Top header ─────────────────────────────────────────────────────────────
function topHeader(els, title, subtitle) {
  els.push(rect(0, 44, W, 56, C.bg));
  els.push(text(20, 72, title, 20, C.text, { fw: 700, ls: -0.5 }));
  if (subtitle) {
    els.push(text(20, 90, subtitle, 11, C.sub, { fw: 400 }));
  }
  els.push(text(W - 20, 70, '⚙', 18, C.muted, { anchor: 'end' }));
  return els;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Dashboard (Overview)
// ═══════════════════════════════════════════════════════════════════════════
function buildScreen1() {
  const els = [];
  statusBar(els);
  topHeader(els, 'WARD', 'Apr 12, 2026 · 09:41 UTC');

  // Ambient glow behind status area — subtle indigo orb
  els.push(rect(100, 80, 190, 90, C.accent, { rx: 45, opacity: 0.05 }));

  // System status banner
  const bannerStatus = 'warn'; // one service degraded
  const bannerColor = bannerStatus === 'ok' ? C.ok : bannerStatus === 'warn' ? C.warn : C.crit;
  const bannerBg = bannerStatus === 'ok' ? '#0D2B20' : bannerStatus === 'warn' ? '#2D1F07' : '#2B0F12';
  els.push(rect(16, 106, W - 32, 44, bannerBg, { rx: 8 }));
  els.push(rect(16, 106, 3, 44, bannerColor, { rx: 1 }));
  els.push(...statusDot(40, 128, bannerStatus));
  els.push(text(56, 122, '1 service degraded', 13, bannerColor, { fw: 600 }));
  els.push(text(56, 138, 'api-gateway · high latency · 3m 22s', 10, C.sub));

  // Section: Service grid (2×3)
  els.push(text(16, 168, 'Services', 11, C.sub, { fw: 600, ls: 1 }));

  const services = [
    { name: 'api-gateway',  env: 'prod',    status: 'warn', p99: '842ms' },
    { name: 'auth-service', env: 'prod',    status: 'ok',   p99: '34ms'  },
    { name: 'data-sync',    env: 'prod',    status: 'ok',   p99: '120ms' },
    { name: 'web-frontend', env: 'prod',    status: 'ok',   p99: '210ms' },
    { name: 'worker-fleet', env: 'prod',    status: 'ok',   p99: '88ms'  },
    { name: 'notify-svc',   env: 'staging', status: 'crit', p99: 'DOWN'  },
  ];

  const cardW = (W - 32 - 10) / 2;
  const cardH = 72;
  const startY = 180;

  services.forEach((svc, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = 16 + col * (cardW + 10);
    const cy = startY + row * (cardH + 8);
    const statusColor = svc.status === 'ok' ? C.ok : svc.status === 'warn' ? C.warn : C.crit;

    els.push(rect(cx, cy, cardW, cardH, C.card, { rx: 10 }));
    els.push(rect(cx, cy, cardW, cardH, C.surf, { rx: 10, opacity: 0 })); // hover zone
    els.push(...statusDot(cx + cardW - 18, cy + 18, svc.status));
    els.push(text(cx + 12, cy + 22, svc.name, 11, C.text, { fw: 600 }));
    els.push(text(cx + 12, cy + 36, svc.env, 9, C.muted, { fw: 500, ls: 0.5 }));

    // p99 latency
    const p99Color = svc.status === 'ok' ? C.sub : statusColor;
    els.push(text(cx + 12, cy + 58, 'p99', 9, C.muted));
    els.push(text(cx + 34, cy + 58, svc.p99, 11, p99Color, { fw: 700 }));
  });

  // Section: Recent incidents
  const incidentY = startY + 3 * (cardH + 8) + 16;
  els.push(text(16, incidentY, 'Recent Incidents', 11, C.sub, { fw: 600, ls: 1 }));

  const incidents = [
    { title: 'High p99 on api-gateway',   time: '3m ago',   sev: 'P2', status: 'open'     },
    { title: 'notify-svc deployment fail', time: '18m ago',  sev: 'P1', status: 'open'     },
    { title: 'DB connection pool spike',   time: '2h ago',   sev: 'P3', status: 'resolved' },
  ];

  incidents.forEach((inc, i) => {
    const y = incidentY + 14 + i * 50;
    const sevColor = inc.sev === 'P1' ? C.crit : inc.sev === 'P2' ? C.warn : C.sub;
    const isResolved = inc.status === 'resolved';

    els.push(rect(16, y, W - 32, 44, C.card, { rx: 8 }));
    els.push(rect(16, y, 3, 44, isResolved ? C.border : sevColor, { rx: 1 }));

    // Severity badge
    els.push(...pill(27, y + 10, 24, 16, sevColor, inc.sev, C.bg, { bgOpacity: isResolved ? 0.3 : 1, size: 8 }));
    els.push(text(60, y + 16, inc.title, 11, isResolved ? C.muted : C.text, { fw: 500 }));
    els.push(text(60, y + 30, inc.time, 9, C.muted));
    if (isResolved) {
      els.push(text(W - 28, y + 22, '✓', 11, C.ok, { anchor: 'end' }));
    } else {
      els.push(circle(W - 28, y + 22, 4, sevColor, { opacity: 0.9 }));
    }
  });

  bottomNav(els, 0);
  return els;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Active Incident Detail
// ═══════════════════════════════════════════════════════════════════════════
function buildScreen2() {
  const els = [];
  statusBar(els);

  // Header with incident context
  els.push(rect(0, 44, W, 80, C.surf));
  els.push(line(0, 124, W, 124, C.border, { sw: 0.5 }));

  // Back + breadcrumb
  els.push(text(16, 65, '‹ Back', 13, C.sub, { fw: 500 }));

  // P1 severity badge
  els.push(...pill(16, 74, 28, 18, C.crit, 'P1', C.bg, { size: 9 }));
  els.push(text(52, 87, 'notify-svc deployment fail', 14, C.text, { fw: 700 }));
  els.push(text(16, 106, 'Opened 18 min ago · auto-detected · still active', 10, C.sub));

  // Ambient critical glow
  els.push(rect(0, 44, W, 80, C.crit, { opacity: 0.03 }));

  const scrollY = 132;

  // Impact block
  els.push(rect(16, scrollY, W - 32, 64, C.card, { rx: 10 }));
  els.push(text(28, scrollY + 16, 'Impact', 10, C.sub, { fw: 600, ls: 0.8 }));

  const impacts = [
    { label: 'Affected users', val: '12,403', color: C.crit },
    { label: 'Services down',  val: '1',      color: C.crit },
    { label: 'Duration',       val: '18m 4s', color: C.warn },
  ];
  impacts.forEach((imp, i) => {
    const ix = 28 + i * ((W - 44) / 3);
    els.push(text(ix, scrollY + 36, imp.val, 16, imp.color, { fw: 800 }));
    els.push(text(ix, scrollY + 52, imp.label, 9, C.muted));
  });

  // Timeline
  els.push(text(16, scrollY + 80, 'Timeline', 11, C.sub, { fw: 600, ls: 1 }));

  const events = [
    { time: '09:23', desc: 'Deployment triggered — v2.4.1',         type: 'info' },
    { time: '09:24', desc: 'Health checks failing (3/3)',            type: 'crit' },
    { time: '09:24', desc: 'Alert fired — PagerDuty notified',       type: 'warn' },
    { time: '09:26', desc: 'On-call engineer acknowledged',          type: 'info' },
    { time: '09:31', desc: 'Rollback initiated to v2.4.0',           type: 'info' },
    { time: '09:38', desc: 'Still deploying — 60% containers ready', type: 'warn' },
  ];

  const tlStartY = scrollY + 94;
  const dotX = 30;

  events.forEach((ev, i) => {
    const y = tlStartY + i * 44;
    const dotColor = ev.type === 'crit' ? C.crit : ev.type === 'warn' ? C.warn : C.acc2;

    // Connector line
    if (i < events.length - 1) {
      els.push(line(dotX, y + 8, dotX, y + 44, C.border, { sw: 1 }));
    }

    els.push(circle(dotX, y + 4, 5, dotColor));
    els.push(text(dotX + 14, y + 8, ev.time, 10, C.sub, { fw: 600 }));
    els.push(text(dotX + 56, y + 8, ev.desc, 11, C.text));
  });

  // Action buttons
  const btnY = tlStartY + events.length * 44 + 8;
  els.push(rect(16, btnY, (W - 40) / 2, 40, C.accent, { rx: 10 }));
  els.push(text(16 + (W - 40) / 4, btnY + 23, 'Rollback', 13, C.text, { anchor: 'middle', fw: 600 }));

  els.push(rect(16 + (W - 40) / 2 + 8, btnY, (W - 40) / 2, 40, C.card, { rx: 10 }));
  els.push(text(16 + (W - 40) / 2 + 8 + (W - 40) / 4, btnY + 23, 'Escalate', 13, C.sub, { anchor: 'middle', fw: 600 }));

  bottomNav(els, 0);
  return els;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Services List
// ═══════════════════════════════════════════════════════════════════════════
function buildScreen3() {
  const els = [];
  statusBar(els);
  topHeader(els, 'Services', '12 services · 1 degraded · 1 down');

  // Search bar
  els.push(rect(16, 108, W - 32, 36, C.card, { rx: 18 }));
  els.push(text(34, 130, '◯', 12, C.muted));
  els.push(text(52, 130, 'Search services...', 12, C.muted));

  // Filter chips
  const chips = ['All', 'Critical', 'Degraded', 'Healthy'];
  chips.forEach((chip, i) => {
    const chipX = 16 + i * 74;
    const isActive = i === 0;
    els.push(rect(chipX, 152, 68, 24, isActive ? C.accent : C.card, { rx: 12 }));
    els.push(text(chipX + 34, 167, chip, 10, isActive ? C.text : C.sub, { anchor: 'middle', fw: isActive ? 600 : 400 }));
  });

  // Services list
  const allServices = [
    { name: 'api-gateway',    team: 'Platform',  status: 'warn', uptime: '99.12%', p99: '842ms' },
    { name: 'auth-service',   team: 'Platform',  status: 'ok',   uptime: '99.99%', p99: '34ms'  },
    { name: 'data-sync',      team: 'Data',      status: 'ok',   uptime: '99.87%', p99: '120ms' },
    { name: 'web-frontend',   team: 'Product',   status: 'ok',   uptime: '99.95%', p99: '210ms' },
    { name: 'worker-fleet',   team: 'Platform',  status: 'ok',   uptime: '99.80%', p99: '88ms'  },
    { name: 'notify-svc',     team: 'Infra',     status: 'crit', uptime: '91.40%', p99: 'DOWN'  },
    { name: 'storage-api',    team: 'Data',      status: 'ok',   uptime: '100%',   p99: '55ms'  },
    { name: 'search-index',   team: 'Data',      status: 'ok',   uptime: '99.70%', p99: '190ms' },
  ];

  allServices.forEach((svc, i) => {
    const y = 186 + i * 62;
    if (y + 56 > H - 80) return; // clip to scroll area

    const statusColor = svc.status === 'ok' ? C.ok : svc.status === 'warn' ? C.warn : C.crit;
    els.push(rect(16, y, W - 32, 56, C.card, { rx: 10 }));
    els.push(rect(16, y, 3, 56, statusColor, { rx: 1 }));

    els.push(...statusDot(W - 32, y + 16, svc.status));
    els.push(text(28, y + 18, svc.name, 12, C.text, { fw: 600 }));
    els.push(text(28, y + 34, svc.team, 10, C.muted, { fw: 400 }));
    els.push(text(W - 50, y + 18, svc.uptime, 10, C.sub, { anchor: 'end' }));
    els.push(text(W - 50, y + 34, `p99 ${svc.p99}`, 10, svc.status === 'ok' ? C.muted : statusColor, { anchor: 'end' }));
  });

  bottomNav(els, 1);
  return els;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 4 — On-Call Schedule
// ═══════════════════════════════════════════════════════════════════════════
function buildScreen4() {
  const els = [];
  statusBar(els);
  topHeader(els, 'On-Call', 'Week of Apr 12 – 18');

  // Week strip
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = 6; // Sun Apr 12
  const dayW = (W - 32) / 7;

  days.forEach((d, i) => {
    const dx = 16 + i * dayW + dayW / 2;
    const isToday = i === today;
    if (isToday) {
      els.push(rect(16 + i * dayW + 4, 106, dayW - 8, 40, C.accent, { rx: 6 }));
    }
    els.push(text(dx, 120, d, 9, isToday ? C.text : C.muted, { anchor: 'middle', fw: isToday ? 700 : 400 }));
    els.push(text(dx, 136, String(12 + i), 12, isToday ? C.text : C.sub, { anchor: 'middle', fw: isToday ? 700 : 400 }));
  });

  els.push(line(16, 154, W - 16, 154, C.border, { sw: 0.5 }));

  // Current on-call
  els.push(text(16, 172, 'On-Call Now', 11, C.sub, { fw: 600, ls: 1 }));

  const oncallY = 184;
  els.push(rect(16, oncallY, W - 32, 72, C.card, { rx: 12 }));
  // Avatar circle
  els.push(circle(50, oncallY + 36, 22, C.accent, { opacity: 0.2 }));
  els.push(circle(50, oncallY + 36, 22, C.accent, { opacity: 0, stroke: C.accent, sw: 1.5 }));
  els.push(text(50, oncallY + 40, 'JH', 14, C.acc2, { anchor: 'middle', fw: 700 }));
  els.push(text(82, oncallY + 28, 'Jordan Hale', 14, C.text, { fw: 700 }));
  els.push(text(82, oncallY + 44, 'Platform · Ends in 14h 22m', 10, C.sub));
  els.push(text(82, oncallY + 58, '📱 +1 (555) 019-4823', 10, C.muted));
  // Active indicator
  els.push(...statusDot(W - 32, oncallY + 18, 'ok'));

  // Upcoming shifts
  els.push(text(16, oncallY + 88, 'Upcoming', 11, C.sub, { fw: 600, ls: 1 }));

  const shifts = [
    { name: 'Maria Chen',   role: 'Data',     start: 'Mon 00:00', end: 'Mon 23:59', avatar: 'MC' },
    { name: 'Dev Patel',    role: 'Infra',    start: 'Tue 00:00', end: 'Tue 23:59', avatar: 'DP' },
    { name: 'Aiko Tanaka',  role: 'Product',  start: 'Wed 00:00', end: 'Wed 23:59', avatar: 'AT' },
    { name: 'Sam Okonkwo',  role: 'Platform', start: 'Thu 00:00', end: 'Fri 23:59', avatar: 'SO' },
  ];

  shifts.forEach((s, i) => {
    const y = oncallY + 102 + i * 52;
    els.push(rect(16, y, W - 32, 46, C.card, { rx: 8 }));
    els.push(circle(42, y + 23, 15, C.surf));
    els.push(text(42, y + 27, s.avatar, 9, C.sub, { anchor: 'middle', fw: 700 }));
    els.push(text(66, y + 16, s.name, 12, C.text, { fw: 600 }));
    els.push(text(66, y + 30, s.role, 10, C.muted));
    els.push(text(W - 28, y + 16, s.start, 10, C.sub, { anchor: 'end' }));
    els.push(text(W - 28, y + 30, '→ ' + s.end, 10, C.muted, { anchor: 'end' }));
  });

  bottomNav(els, 2);
  return els;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Alert Configuration
// ═══════════════════════════════════════════════════════════════════════════
function buildScreen5() {
  const els = [];
  statusBar(els);
  topHeader(els, 'Alert Rules', '8 active rules');

  // Add rule button
  els.push(rect(W - 52, 54, 36, 28, C.accent, { rx: 8 }));
  els.push(text(W - 34, 71, '+ New', 10, C.text, { anchor: 'middle', fw: 600 }));

  const rules = [
    {
      name: 'p99 > 500ms',
      service: 'api-gateway',
      channel: 'PagerDuty',
      sev: 'P2',
      enabled: true,
      triggered: true,
    },
    {
      name: 'Error rate > 5%',
      service: 'all services',
      channel: 'Slack #alerts',
      sev: 'P1',
      enabled: true,
      triggered: false,
    },
    {
      name: 'Deploy failure',
      service: 'all services',
      channel: 'PagerDuty',
      sev: 'P1',
      enabled: true,
      triggered: true,
    },
    {
      name: 'Uptime < 99.9%',
      service: 'web-frontend',
      channel: 'Email',
      sev: 'P3',
      enabled: true,
      triggered: false,
    },
    {
      name: 'DB conn pool > 80%',
      service: 'data-sync',
      channel: 'Slack #infra',
      sev: 'P2',
      enabled: false,
      triggered: false,
    },
    {
      name: 'Memory > 90%',
      service: 'worker-fleet',
      channel: 'Email',
      sev: 'P3',
      enabled: true,
      triggered: false,
    },
  ];

  rules.forEach((rule, i) => {
    const y = 108 + i * 62;
    if (y + 56 > H - 80) return;

    const sevColor = rule.sev === 'P1' ? C.crit : rule.sev === 'P2' ? C.warn : C.sub;
    const isEnabled = rule.enabled;
    const isFiring = rule.triggered;

    els.push(rect(16, y, W - 32, 56, isFiring ? C.card : C.card, { rx: 10 }));
    if (isFiring) {
      els.push(rect(16, y, W - 32, 56, sevColor, { rx: 10, opacity: 0.05 }));
      els.push(rect(16, y, 3, 56, sevColor, { rx: 1 }));
    }

    // Sev pill
    els.push(...pill(24, y + 8, 24, 16, sevColor, rule.sev, C.bg, { bgOpacity: isEnabled ? 1 : 0.4, size: 8 }));
    els.push(text(56, y + 18, rule.name, 12, isEnabled ? C.text : C.muted, { fw: 600 }));
    els.push(text(56, y + 32, rule.service, 10, C.muted));

    // Channel
    els.push(text(16, y + 46, '↗ ' + rule.channel, 9, C.muted));

    // Toggle
    const tX = W - 52;
    const tY = y + 16;
    els.push(rect(tX, tY, 36, 18, isEnabled ? C.accent : C.border, { rx: 9 }));
    els.push(circle(isEnabled ? tX + 27 : tX + 9, tY + 9, 7, C.text));

    if (isFiring) {
      els.push(text(W - 28, y + 46, '⚡ firing', 9, sevColor, { anchor: 'end', fw: 600 }));
    }
  });

  bottomNav(els, 3);
  return els;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 6 — Event Timeline / Log
// ═══════════════════════════════════════════════════════════════════════════
function buildScreen6() {
  const els = [];
  statusBar(els);
  topHeader(els, 'Timeline', 'Last 24 hours · 47 events');

  // Filter row
  const filters = ['All', 'Incidents', 'Deploys', 'Alerts'];
  filters.forEach((f, i) => {
    const fx = 16 + i * 84;
    const isActive = i === 0;
    els.push(rect(fx, 108, 78, 26, isActive ? C.accent : C.card, { rx: 13 }));
    els.push(text(fx + 39, 124, f, 10, isActive ? C.text : C.muted, { anchor: 'middle', fw: isActive ? 600 : 400 }));
  });

  // Timeline events
  const events = [
    { time: '09:24', label: 'notify-svc down',           type: 'incident', sev: 'crit' },
    { time: '09:23', label: 'Deploy: notify-svc v2.4.1', type: 'deploy',   sev: 'info' },
    { time: '09:20', label: 'Alert: api-gateway p99 ↑',  type: 'alert',    sev: 'warn' },
    { time: '08:55', label: 'Deploy: auth-service v3.1', type: 'deploy',   sev: 'ok'   },
    { time: '07:33', label: 'DB conn pool recovered',    type: 'incident', sev: 'ok'   },
    { time: '06:10', label: 'Alert: Memory > 90%',       type: 'alert',    sev: 'warn' },
    { time: '05:00', label: 'Deploy: data-sync v1.8.3',  type: 'deploy',   sev: 'ok'   },
    { time: '03:41', label: 'P3 incident resolved',      type: 'incident', sev: 'ok'   },
    { time: '01:15', label: 'Alert: Error rate spike',   type: 'alert',    sev: 'crit' },
    { time: '00:00', label: 'Daily summary generated',   type: 'system',   sev: 'info' },
  ];

  const tlX = 28;
  const startY = 146;

  events.forEach((ev, i) => {
    const y = startY + i * 50;
    if (y + 44 > H - 80) return;

    const dotColor =
      ev.sev === 'crit' ? C.crit :
      ev.sev === 'warn' ? C.warn :
      ev.sev === 'ok'   ? C.ok   :
      C.acc2;

    const typeColor =
      ev.type === 'incident' ? C.crit :
      ev.type === 'deploy'   ? C.acc2 :
      ev.type === 'alert'    ? C.warn : C.muted;

    // Connector
    if (i < events.length - 1 && y + 50 < H - 80) {
      els.push(line(tlX, y + 10, tlX, y + 50, C.border, { sw: 1 }));
    }

    // Dot
    els.push(circle(tlX, y + 6, 6, dotColor, { opacity: 0.15 }));
    els.push(circle(tlX, y + 6, 4, dotColor));

    // Time
    els.push(text(tlX + 14, y + 10, ev.time, 10, C.muted, { fw: 500 }));

    // Card
    els.push(rect(tlX + 48, y - 2, W - tlX - 64, 42, C.card, { rx: 8 }));
    els.push(text(tlX + 60, y + 14, ev.label, 12, C.text, { fw: 500 }));

    // Type badge
    const typeLabels = { incident: 'INC', deploy: 'DEP', alert: 'ALT', system: 'SYS' };
    els.push(...pill(tlX + 60, y + 24, 28, 14, typeColor, typeLabels[ev.type], C.bg, { bgOpacity: 0.25, size: 8 }));
  });

  bottomNav(els, 0);
  return els;
}

// ─── Assemble all screens ────────────────────────────────────────────────
const screens = [
  { name: 'Overview',         fn: buildScreen1 },
  { name: 'Incident Detail',  fn: buildScreen2 },
  { name: 'Services',         fn: buildScreen3 },
  { name: 'On-Call',          fn: buildScreen4 },
  { name: 'Alert Rules',      fn: buildScreen5 },
  { name: 'Event Timeline',   fn: buildScreen6 },
];

const pen = {
  version: '2.8',
  metadata: {
    name:      NAME,
    tagline:   TAGLINE,
    author:    'RAM',
    date:      new Date().toISOString().split('T')[0],
    theme:     'dark',
    heartbeat: HEARTBEAT,
    elements:  0,
    palette: {
      bg:      C.bg,
      surface: C.surf,
      card:    C.card,
      text:    C.text,
      accent:  C.accent,
      accent2: C.acc2,
      ok:      C.ok,
      warn:    C.warn,
      crit:    C.crit,
    },
    inspiration: [
      'darkmodedesign.com — zinc color scale as elevation system',
      'saaspo.com — Twingate bold dark + vivid accent for security/dev tools',
      'saaspo.com — color-coded status as sole carrier of color in calm design',
    ],
  },
  screens: screens.map(s => {
    const els = s.fn();
    return { name: s.name, width: W, height: H, elements: els };
  }),
};

// Count elements
let total = 0;
pen.screens.forEach(s => { total += s.elements.length; });
pen.metadata.elements = total;

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${pen.screens.length} screens, ${total} elements`);
console.log(`Written: ${SLUG}.pen`);
