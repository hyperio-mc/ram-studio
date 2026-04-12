'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'camo';
const NAME = 'CAMO';
const TAGLINE = 'Go dark. Stay invisible.';
const DATE = '2026-04-11';
const HEARTBEAT = 42;

// Palette — warm dark teal, inspired by Orbit ML Monitoring (Muzli/Godly research)
const BG      = '#0C1010';
const SURF    = '#131C1C';
const CARD    = '#1A2626';
const CARD2   = '#1E2E2E';
const ACC     = '#10B981'; // emerald green — "safe"
const ACC2    = '#FF5240'; // coral red — "threat"
const ACC3    = '#FBBF24'; // amber — "warning"
const TEXT    = '#D1EDE4'; // cool white-green
const MUTED   = 'rgba(161,207,190,0.45)';
const MONO    = 'monospace';
const SANS    = 'system-ui, sans-serif';

// ── primitives ─────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return { type: 'rect', x, y, w, h, fill,
    rx: opts.rx ?? 0, opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none', sw: opts.sw ?? 1 };
}
function text(x, y, content, size, fill, opts = {}) {
  return { type: 'text', x, y, content, size, fill,
    fw: opts.fw ?? 400, font: opts.font ?? SANS,
    anchor: opts.anchor ?? 'start', ls: opts.ls ?? 0,
    opacity: opts.opacity ?? 1 };
}
function circle(cx, cy, r, fill, opts = {}) {
  return { type: 'circle', cx, cy, r, fill,
    opacity: opts.opacity ?? 1, stroke: opts.stroke ?? 'none', sw: opts.sw ?? 1 };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return { type: 'line', x1, y1, x2, y2, stroke,
    sw: opts.sw ?? 1, opacity: opts.opacity ?? 1 };
}

const W = 390, H = 844;

// ── shared components ───────────────────────────────────────────────────────
function statusBar(els) {
  els.push(rect(0, 0, W, 44, BG));
  els.push(text(20, 28, '9:41', 13, TEXT, { fw: 600, font: MONO }));
  els.push(text(370, 28, '●●●', 11, TEXT, { anchor: 'end', opacity: 0.7 }));
}

function navBar(els, active) {
  const tabs = [
    { icon: '◉', label: 'Shield', id: 0 },
    { icon: '⊛', label: 'Brokers', id: 1 },
    { icon: '⚠', label: 'Alerts', id: 2 },
    { icon: '⊜', label: 'VPN', id: 3 },
    { icon: '◎', label: 'Score', id: 4 },
  ];
  els.push(rect(0, H - 80, W, 80, SURF));
  els.push(line(0, H - 80, W, H - 80, ACC, { sw: 0.5, opacity: 0.3 }));
  tabs.forEach((tab, i) => {
    const x = 39 + i * 78;
    const isActive = i === active;
    els.push(text(x, H - 48, tab.icon, 20, isActive ? ACC : MUTED, { anchor: 'middle', opacity: isActive ? 1 : 0.6 }));
    els.push(text(x, H - 24, tab.label, 9, isActive ? ACC : MUTED, { anchor: 'middle', fw: isActive ? 600 : 400 }));
    if (isActive) {
      els.push(rect(x - 18, H - 80, 36, 2, ACC, { rx: 1 }));
    }
  });
}

function camoHeader(els, title, sub) {
  els.push(text(20, 80, NAME, 11, ACC, { fw: 700, font: MONO, ls: 4 }));
  els.push(text(20, 108, title, 22, TEXT, { fw: 700 }));
  if (sub) els.push(text(20, 130, sub, 12, MUTED));
}

// ── Screen 1: Dashboard / Shield Overview ─────────────────────────────────
function screen1() {
  const els = [];
  statusBar(els);
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  // Header
  els.push(text(20, 78, 'CAMO', 11, ACC, { fw: 700, font: MONO, ls: 4 }));
  els.push(text(20, 106, 'Privacy Shield', 24, TEXT, { fw: 700 }));
  els.push(text(20, 128, 'Last scan: 2 minutes ago', 12, MUTED));

  // Big camo score ring (hero stat)
  const cx = 195, cy = 248, r = 70;
  // Ring background
  els.push(circle(cx, cy, r, 'none', { stroke: CARD2, sw: 12 }));
  // Score arc hint (filled partial arc approximated as overlay)
  els.push(circle(cx, cy, r, 'none', { stroke: ACC, sw: 12, opacity: 0.9 }));
  els.push(circle(cx, cy, r - 16, CARD2));
  els.push(text(cx, cy - 12, '84', 42, ACC, { fw: 800, font: MONO, anchor: 'middle' }));
  els.push(text(cx, cy + 14, 'CAMO SCORE', 9, MUTED, { anchor: 'middle', ls: 2 }));
  els.push(text(cx, cy + 32, 'Good Protection', 11, ACC, { anchor: 'middle', fw: 600 }));

  // Status pill row
  const pills = [
    { label: 'VPN ON', color: ACC },
    { label: '12 BLOCKED', color: ACC3 },
    { label: '2 LEAKS', color: ACC2 },
  ];
  pills.forEach((p, i) => {
    const px = 20 + i * 123;
    els.push(rect(px, 340, 110, 28, CARD2, { rx: 14 }));
    els.push(circle(px + 14, 354, 4, p.color));
    els.push(text(px + 24, 358, p.label, 10, TEXT, { fw: 600, font: MONO, ls: 1 }));
  });

  // Bento status grid (2x2)
  const cards = [
    { x: 16, y: 386, w: 172, h: 92, label: 'Data Brokers', value: '23', sub: 'with your data', color: ACC2, icon: '⊛' },
    { x: 202, y: 386, w: 172, h: 92, label: 'Trackers Blocked', value: '1,847', sub: 'this week', color: ACC, icon: '◎' },
    { x: 16, y: 490, w: 172, h: 92, label: 'Breach Alerts', value: '3', sub: 'new since yesterday', color: ACC3, icon: '⚠' },
    { x: 202, y: 490, w: 172, h: 92, label: 'Exposed Emails', value: '2', sub: 'found in dark web', color: ACC2, icon: '◉' },
  ];
  cards.forEach(c => {
    els.push(rect(c.x, c.y, c.w, c.h, CARD, { rx: 14 }));
    els.push(rect(c.x, c.y, c.w, 3, c.color, { rx: 1, opacity: 0.7 }));
    els.push(text(c.x + 14, c.y + 22, c.icon, 14, c.color));
    els.push(text(c.x + 14, c.y + 44, c.value, 26, TEXT, { fw: 800, font: MONO }));
    els.push(text(c.x + 14, c.y + 62, c.label, 10, MUTED, { fw: 600 }));
    els.push(text(c.x + 14, c.y + 78, c.sub, 9, MUTED, { opacity: 0.6 }));
  });

  // Recent activity
  els.push(text(20, 602, 'Recent Activity', 13, TEXT, { fw: 600 }));
  const activities = [
    { icon: '◎', label: 'Tracker blocked — Google Analytics', time: '2m', color: ACC },
    { icon: '⚠', label: 'Broker removal in progress — Acxiom', time: '14m', color: ACC3 },
    { icon: '◉', label: 'New breach detected — LinkedIn 2024', time: '1h', color: ACC2 },
  ];
  activities.forEach((a, i) => {
    const ay = 628 + i * 48;
    els.push(rect(16, ay, W - 32, 40, CARD, { rx: 10 }));
    els.push(circle(36, ay + 20, 5, a.color));
    els.push(text(50, ay + 14, a.label, 11, TEXT));
    els.push(text(50, ay + 28, a.time + ' ago', 10, MUTED));
    els.push(text(W - 22, ay + 22, '›', 14, MUTED, { anchor: 'end' }));
  });

  navBar(els, 0);
  return els;
}

// ── Screen 2: Data Brokers ─────────────────────────────────────────────────
function screen2() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  els.push(text(20, 78, 'CAMO', 11, ACC, { fw: 700, font: MONO, ls: 4 }));
  els.push(text(20, 106, 'Data Brokers', 24, TEXT, { fw: 700 }));
  els.push(text(20, 128, '23 sites have your personal data', 12, ACC2));

  // Progress summary
  els.push(rect(16, 148, W - 32, 72, CARD, { rx: 14 }));
  els.push(text(30, 172, 'Removal Progress', 11, MUTED, { fw: 600, ls: 1 }));
  els.push(text(30, 196, '7 removed', 20, ACC, { fw: 700, font: MONO }));
  els.push(text(160, 196, '9 in progress', 20, ACC3, { fw: 700, font: MONO }));
  els.push(text(320, 196, '7 pending', 16, MUTED, { fw: 600, font: MONO }));
  // Progress bar
  els.push(rect(30, 206, W - 60, 6, CARD2, { rx: 3 }));
  els.push(rect(30, 206, Math.round((W - 60) * 0.3), 6, ACC, { rx: 3 }));
  els.push(rect(30 + Math.round((W - 60) * 0.3), 206, Math.round((W - 60) * 0.39), 6, ACC3, { rx: 3 }));

  // Filter chips
  const chips = ['All', 'Active', 'Removed', 'Pending'];
  chips.forEach((c, i) => {
    const cx2 = 16 + i * 88;
    const isFirst = i === 0;
    els.push(rect(cx2, 236, 80, 28, isFirst ? ACC : CARD2, { rx: 14 }));
    els.push(text(cx2 + 40, 254, c, 11, isFirst ? BG : TEXT, { anchor: 'middle', fw: isFirst ? 700 : 400 }));
  });

  // Broker list
  const brokers = [
    { name: 'Acxiom', category: 'Data aggregator', risk: 'HIGH', status: 'in progress', color: ACC3 },
    { name: 'Spokeo', category: 'People search', risk: 'HIGH', status: 'pending', color: ACC2 },
    { name: 'WhitePages', category: 'Directory listing', risk: 'MED', status: 'removed', color: ACC },
    { name: 'Intelius', category: 'Background check', risk: 'HIGH', status: 'pending', color: ACC2 },
    { name: 'BeenVerified', category: 'People search', risk: 'MED', status: 'in progress', color: ACC3 },
    { name: 'LexisNexis', category: 'Data analytics', risk: 'CRIT', status: 'pending', color: ACC2 },
    { name: 'TruthFinder', category: 'Background check', risk: 'MED', status: 'removed', color: ACC },
  ];
  brokers.forEach((b, i) => {
    const by = 280 + i * 70;
    if (by > H - 100) return;
    els.push(rect(16, by, W - 32, 60, CARD, { rx: 12 }));
    // Risk badge
    els.push(rect(W - 90, by + 16, 60, 20, b.status === 'removed' ? ACC : CARD2, { rx: 10 }));
    els.push(text(W - 60, by + 30, b.status === 'removed' ? '✓ DONE' : b.status.toUpperCase(), 8, b.status === 'removed' ? BG : b.color, { anchor: 'middle', fw: 700, font: MONO, ls: 0.5 }));
    // Name & category
    els.push(circle(36, by + 30, 10, b.status === 'removed' ? ACC : b.risk === 'CRIT' ? ACC2 : CARD2, { opacity: 0.2 }));
    els.push(text(36, by + 34, b.name[0], 10, b.status === 'removed' ? ACC : ACC2, { anchor: 'middle', fw: 700 }));
    els.push(text(54, by + 24, b.name, 13, TEXT, { fw: 600 }));
    els.push(text(54, by + 42, b.category + ' · Risk: ', 10, MUTED));
    els.push(text(150, by + 42, b.risk, 10, b.color, { fw: 700, font: MONO }));
  });

  navBar(els, 1);
  return els;
}

// ── Screen 3: Breach Alerts ────────────────────────────────────────────────
function screen3() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  els.push(text(20, 78, 'CAMO', 11, ACC, { fw: 700, font: MONO, ls: 4 }));
  els.push(text(20, 106, 'Breach Alerts', 24, TEXT, { fw: 700 }));
  els.push(text(20, 128, '3 accounts exposed in known breaches', 12, ACC2));

  // Alert banner
  els.push(rect(16, 148, W - 32, 56, CARD2, { rx: 14 }));
  els.push(rect(16, 148, 4, 56, ACC2, { rx: 2 }));
  els.push(text(30, 170, '⚠ New Breach Detected', 13, ACC2, { fw: 700 }));
  els.push(text(30, 190, 'LinkedIn data exposed (Apr 2024). Change password now.', 11, MUTED));

  // Severity filter
  const severities = ['All', 'Critical', 'High', 'Medium'];
  severities.forEach((s, i) => {
    const sx = 16 + i * 90;
    const isFirst = i === 0;
    els.push(rect(sx, 220, 82, 26, isFirst ? ACC2 : CARD, { rx: 13 }));
    els.push(text(sx + 41, 237, s, 10, isFirst ? BG : TEXT, { anchor: 'middle', fw: isFirst ? 700 : 400 }));
  });

  // Breach cards (timeline-style)
  const breaches = [
    {
      service: 'LinkedIn',
      date: 'Apr 2024',
      count: '700M records',
      exposed: ['Email', 'Phone', 'Job Title'],
      severity: 'CRITICAL',
      color: ACC2,
      actions: 'Change password · Enable 2FA',
    },
    {
      service: 'Twitch',
      date: 'Oct 2023',
      count: '125K records',
      exposed: ['Email', 'Username'],
      severity: 'HIGH',
      color: ACC3,
      actions: 'Password changed ✓',
    },
    {
      service: 'Canva',
      date: 'May 2023',
      count: '139M records',
      exposed: ['Email', 'Name', 'Hashed Password'],
      severity: 'HIGH',
      color: ACC3,
      actions: 'Password changed ✓',
    },
    {
      service: 'Adobe',
      date: 'Jan 2023',
      count: '38M records',
      exposed: ['Email', 'Password Hint'],
      severity: 'MEDIUM',
      color: ACC,
      actions: 'Password changed ✓',
    },
  ];
  breaches.forEach((b, i) => {
    const by = 264 + i * 130;
    if (by > H - 90) return;
    els.push(rect(16, by, W - 32, 118, CARD, { rx: 14 }));
    // Top border accent
    els.push(rect(16, by, W - 32, 3, b.color, { rx: 1 }));
    // Header row
    els.push(rect(W - 94, by + 14, 68, 20, b.color, { rx: 10, opacity: 0.15 }));
    els.push(text(W - 60, by + 28, b.severity, 8, b.color, { anchor: 'middle', fw: 700, font: MONO, ls: 0.5 }));
    els.push(text(30, by + 28, b.service, 15, TEXT, { fw: 700 }));
    els.push(text(30, by + 46, b.date + ' · ' + b.count, 10, MUTED));
    // Exposed data chips
    b.exposed.forEach((e, j) => {
      const ex = 30 + j * 80;
      els.push(rect(ex, by + 58, 72, 18, CARD2, { rx: 9 }));
      els.push(text(ex + 36, by + 71, e, 9, MUTED, { anchor: 'middle' }));
    });
    // Action
    els.push(line(30, by + 88, W - 30, by + 88, CARD2, { sw: 0.5 }));
    els.push(text(30, by + 106, b.actions, 10, i === 0 ? ACC2 : ACC, { fw: 600 }));
    els.push(text(W - 22, by + 106, '›', 14, MUTED, { anchor: 'end' }));
  });

  navBar(els, 2);
  return els;
}

// ── Screen 4: Tracker Shield ───────────────────────────────────────────────
function screen4() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  els.push(text(20, 78, 'CAMO', 11, ACC, { fw: 700, font: MONO, ls: 4 }));
  els.push(text(20, 106, 'Tracker Shield', 24, TEXT, { fw: 700 }));
  els.push(text(20, 128, 'Real-time blocking · Last 7 days', 12, MUTED));

  // Big stat
  els.push(rect(16, 148, W - 32, 110, CARD, { rx: 16 }));
  els.push(text(195, 198, '12,847', 44, ACC, { fw: 800, font: MONO, anchor: 'middle' }));
  els.push(text(195, 222, 'trackers blocked this week', 11, MUTED, { anchor: 'middle' }));
  els.push(text(195, 244, '↑ 23% vs last week', 11, ACC, { anchor: 'middle', fw: 600 }));

  // Bar chart (7-day)
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const vals = [1640, 2100, 1890, 1540, 2340, 1980, 1357];
  const maxVal = Math.max(...vals);
  const chartH = 80, chartY = 280, barW = 32, gap = 22;
  const chartStartX = (W - (days.length * (barW + gap) - gap)) / 2;

  els.push(text(20, 275, '7-day activity', 11, MUTED, { fw: 600, ls: 1 }));

  days.forEach((d, i) => {
    const bx = chartStartX + i * (barW + gap);
    const bh = Math.round((vals[i] / maxVal) * chartH);
    const isLast = i === days.length - 1;
    els.push(rect(bx, chartY + (chartH - bh), barW, bh, isLast ? ACC : CARD2, { rx: 6, opacity: isLast ? 1 : 0.7 }));
    els.push(text(bx + barW / 2, chartY + chartH + 16, d, 10, isLast ? ACC : MUTED, { anchor: 'middle' }));
    if (isLast) {
      els.push(text(bx + barW / 2, chartY + (chartH - bh) - 6, vals[i].toLocaleString(), 8, ACC, { anchor: 'middle', font: MONO }));
    }
  });

  // Top tracker categories
  els.push(text(20, 390, 'Top Categories Blocked', 11, MUTED, { fw: 600, ls: 1 }));
  const categories = [
    { label: 'Advertising', count: 5241, pct: 41, color: ACC2 },
    { label: 'Analytics', count: 3890, pct: 30, color: ACC3 },
    { label: 'Social Media', count: 2100, pct: 16, color: ACC },
    { label: 'Fingerprinting', count: 1616, pct: 13, color: MUTED },
  ];
  categories.forEach((c, i) => {
    const cy2 = 414 + i * 76;
    els.push(rect(16, cy2, W - 32, 62, CARD, { rx: 12 }));
    els.push(text(30, cy2 + 22, c.label, 13, TEXT, { fw: 600 }));
    els.push(text(30, cy2 + 40, c.count.toLocaleString() + ' blocked', 10, MUTED, { font: MONO }));
    els.push(text(W - 22, cy2 + 22, c.pct + '%', 15, c.color, { anchor: 'end', fw: 700, font: MONO }));
    // Progress bar
    els.push(rect(30, cy2 + 48, W - 60, 5, CARD2, { rx: 2 }));
    els.push(rect(30, cy2 + 48, Math.round((W - 60) * c.pct / 100), 5, c.color, { rx: 2, opacity: 0.8 }));
  });

  navBar(els, 3);
  return els;
}

// ── Screen 5: VPN & IP Masking ─────────────────────────────────────────────
function screen5() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  els.push(text(20, 78, 'CAMO', 11, ACC, { fw: 700, font: MONO, ls: 4 }));
  els.push(text(20, 106, 'Connection Shield', 24, TEXT, { fw: 700 }));

  // VPN on/off card (hero)
  els.push(rect(16, 136, W - 32, 160, CARD, { rx: 20 }));
  // Subtle teal glow at top (aurora effect)
  els.push(rect(16, 136, W - 32, 3, ACC, { rx: 2, opacity: 0.8 }));
  els.push(circle(195, 190, 52, 'none', { stroke: ACC, sw: 1.5, opacity: 0.15 }));
  els.push(circle(195, 190, 40, CARD2));
  els.push(text(195, 197, '⊙', 28, ACC, { anchor: 'middle', fw: 300 }));
  els.push(text(195, 254, 'VPN Active', 16, ACC, { anchor: 'middle', fw: 700, font: MONO }));
  els.push(text(195, 274, 'Connected to Switzerland · 12ms', 11, MUTED, { anchor: 'middle' }));
  // Toggle
  els.push(rect(155, 284, 80, 28, ACC, { rx: 14, opacity: 0.15 }));
  els.push(text(195, 302, 'DISCONNECT', 9, ACC2, { anchor: 'middle', fw: 700, font: MONO, ls: 1 }));

  // IP info
  els.push(text(20, 320, 'Connection Details', 11, MUTED, { fw: 600, ls: 1 }));
  const rows = [
    { label: 'Visible IP', value: '185.220.101.44', note: 'Switzerland', safe: true },
    { label: 'Real IP', value: '•••.•••.•••.•••', note: 'Hidden', safe: true },
    { label: 'DNS Leak', value: 'None detected', note: 'Protected', safe: true },
    { label: 'WebRTC Leak', value: 'None detected', note: 'Protected', safe: true },
    { label: 'IPv6', value: 'Disabled', note: 'Safe', safe: true },
  ];
  rows.forEach((r, i) => {
    const ry = 344 + i * 54;
    els.push(rect(16, ry, W - 32, 44, CARD, { rx: 11 }));
    els.push(text(30, ry + 16, r.label, 10, MUTED, { fw: 500 }));
    els.push(text(30, ry + 34, r.value, 12, TEXT, { fw: 600, font: MONO }));
    els.push(rect(W - 90, ry + 14, 68, 16, ACC, { rx: 8, opacity: 0.12 }));
    els.push(text(W - 56, ry + 25, '✓ ' + r.note, 9, ACC, { anchor: 'middle', fw: 700 }));
  });

  // Server selector
  els.push(text(20, 624, 'Server Locations', 11, MUTED, { fw: 600, ls: 1 }));
  const servers = ['🇨🇭 Switzerland', '🇳🇱 Netherlands', '🇸🇬 Singapore', '🇺🇸 United States'];
  servers.forEach((s, i) => {
    const sx = 16 + (i % 2) * (W / 2 - 10);
    const sy = 648 + Math.floor(i / 2) * 44;
    els.push(rect(sx, sy, W / 2 - 22, 34, i === 0 ? CARD2 : CARD, { rx: 10 }));
    els.push(text(sx + 12, sy + 22, s, 11, i === 0 ? ACC : TEXT));
    if (i === 0) els.push(text(W / 2 - 4, sy + 22, '●', 8, ACC, { anchor: 'end' }));
  });

  navBar(els, 3);
  return els;
}

// ── Screen 6: Privacy Score & Audit ───────────────────────────────────────
function screen6() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  els.push(text(20, 78, 'CAMO', 11, ACC, { fw: 700, font: MONO, ls: 4 }));
  els.push(text(20, 106, 'Privacy Score', 24, TEXT, { fw: 700 }));
  els.push(text(20, 128, 'Your complete privacy audit', 12, MUTED));

  // Score breakdown
  const categories = [
    { label: 'Identity Exposure', score: 72, max: 100, color: ACC3 },
    { label: 'Tracker Blocking', score: 95, max: 100, color: ACC },
    { label: 'Network Security', score: 88, max: 100, color: ACC },
    { label: 'Password Hygiene', score: 61, max: 100, color: ACC2 },
    { label: 'Breach Exposure', score: 45, max: 100, color: ACC2 },
    { label: 'Browser Fingerprint', score: 80, max: 100, color: ACC3 },
  ];
  categories.forEach((c, i) => {
    const cy2 = 150 + i * 72;
    els.push(rect(16, cy2, W - 32, 60, CARD, { rx: 12 }));
    els.push(text(30, cy2 + 20, c.label, 12, TEXT, { fw: 600 }));
    els.push(text(W - 22, cy2 + 20, c.score + '', 20, c.color, { anchor: 'end', fw: 800, font: MONO }));
    els.push(text(W - 24, cy2 + 20, '/100', 9, MUTED, { anchor: 'start' }));
    // Bar
    els.push(rect(30, cy2 + 36, W - 60, 8, CARD2, { rx: 4 }));
    els.push(rect(30, cy2 + 36, Math.round((W - 60) * c.score / 100), 8, c.color, { rx: 4, opacity: 0.85 }));
    // Score label on bar
    const bw = Math.round((W - 60) * c.score / 100);
    els.push(text(30 + bw + 4, cy2 + 44, c.score + '%', 8, c.color, { font: MONO }));
  });

  // Overall recommendation
  els.push(rect(16, 586, W - 32, 80, CARD, { rx: 14 }));
  els.push(rect(16, 586, 4, 80, ACC3, { rx: 2 }));
  els.push(text(30, 608, 'Top Recommendation', 11, ACC3, { fw: 700, ls: 1 }));
  els.push(text(30, 628, 'Enable password manager to fix', 12, TEXT));
  els.push(text(30, 646, '3 reused/weak passwords detected.', 12, TEXT));
  els.push(text(W - 22, 620, 'Fix →', 11, ACC3, { anchor: 'end', fw: 700 }));

  // Monthly change indicator
  els.push(rect(16, 678, W - 32, 44, CARD, { rx: 12 }));
  els.push(text(30, 704, '📈 Score improved +6 pts since last month', 11, ACC, { fw: 500 }));
  els.push(text(W - 22, 704, 'History →', 10, MUTED, { anchor: 'end' }));

  navBar(els, 4);
  return els;
}

// ── Assemble ────────────────────────────────────────────────────────────────
const screens = [
  { name: 'Dashboard', fn: screen1 },
  { name: 'Data Brokers', fn: screen2 },
  { name: 'Breach Alerts', fn: screen3 },
  { name: 'Tracker Shield', fn: screen4 },
  { name: 'VPN Shield', fn: screen5 },
  { name: 'Privacy Score', fn: screen6 },
];

const pen = {
  version: '2.8',
  metadata: {
    name: `${NAME} — ${TAGLINE}`,
    author: 'RAM',
    date: DATE,
    theme: 'dark',
    heartbeat: HEARTBEAT,
    slug: SLUG,
    appName: NAME,
    tagline: TAGLINE,
    archetype: 'privacy-security',
    palette: { bg: BG, surface: SURF, card: CARD, accent: ACC, accent2: ACC2, text: TEXT },
    elements: 0,
  },
  screens: screens.map(s => {
    const elements = s.fn();
    return { name: s.name, svg: `<!-- ${s.name} -->`, elements };
  }),
};

// count elements
pen.metadata.elements = pen.screens.reduce((t, s) => t + s.elements.length, 0);

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${pen.screens.length} screens, ${pen.metadata.elements} elements`);
console.log(`Written: ${SLUG}.pen`);
