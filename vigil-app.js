'use strict';
// vigil-app.js
// VIGIL — Cyber Threat Intelligence Platform
//
// Challenge: Design a dark-mode cyberthreat monitoring dashboard inspired by:
//
// 1. Utopia Tokyo (Awwwards SOTD, March 2026) — "MASKED. MARKED. WATCHED."
//    Dark navy #14171F, vibrant red #FF1919, warm cream #EBE5CE, pixel fonts
//    (Neopixel, Zpix) mixed with PP Mori. Cyberpunk surveillance energy.
//
// 2. Evervault Customers page (godly.website, March 2026) — Deep space navy
//    #010314, glassmorphism cards rgba(23,24,37,0.75), lavender-white text,
//    security/privacy SaaS design language.
//
// 3. Twingate (godly.website) — Zero-trust security SaaS, clean dark data tables.
//
// Theme: DARK (previous SPOOL was light)
// Palette: deep space navy + alert red + cyber mint + warm cream text

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#0A0C12',   // deep space navy
  surface:  '#131621',   // card surface
  surface2: '#1A1D2E',   // elevated card
  border:   '#1F2336',   // subtle border
  border2:  '#2A2F48',   // stronger border
  muted:    '#5A6080',   // muted blue-grey
  fg:       '#E8E2D0',   // warm cream (Utopia Tokyo parchment)
  fg2:      '#A8A396',   // secondary cream
  accent:   '#FF2233',   // alert red (Utopia Tokyo)
  accent2:  '#3DFFD0',   // cyber mint (safe/clear states)
  amber:    '#FFB830',   // warning amber
  purple:   '#7C5CFC',   // intel purple
  dim:      'rgba(232,226,208,0.08)', // very subtle cream tint
  dimR:     'rgba(255,34,51,0.12)',   // subtle red tint
  dimG:     'rgba(61,255,208,0.10)',  // subtle mint tint
};

let _id = 0;
const uid = () => `vg${++_id}`;

// ── Primitives ────────────────────────────────────────────────────────────────
const F   = (x, y, w, h, fill, opts = {}) => ({ id: uid(), type: 'frame', x, y, width: w, height: h, fill, ...opts, children: opts.children || [] });
const R   = (x, y, w, h, fill, opts = {}) => ({ id: uid(), type: 'rect', x, y, width: w, height: h, fill, ...opts });
const T   = (x, y, content, size, fill, opts = {}) => ({ id: uid(), type: 'text', x, y, content, fontSize: size, fill, fontFamily: opts.font || 'Inter', fontWeight: opts.weight || 400, letterSpacing: opts.ls || 0, ...opts });
const E   = (x, y, w, h, fill, opts = {}) => ({ id: uid(), type: 'ellipse', x, y, width: w, height: h, fill, ...opts });

// ── Shared components ─────────────────────────────────────────────────────────

function statusBar(y) {
  return [
    R(0, y, 390, 44, P.bg),
    T(16, y+14, '09:41', 12, P.fg2, { weight: 600, font: 'SF Pro Display' }),
    R(330, y+17, 24, 10, 'none', { stroke: P.fg2, strokeWidth: 1, radius: 2 }),
    R(332, y+18, 18, 8, P.fg2, { radius: 1 }),
    R(354, y+15, 2, 14, P.fg2, { radius: 1 }),
    R(358, y+15, 2, 14, P.fg2, { radius: 1 }),
    R(362, y+16, 2, 12, P.fg2, { radius: 1 }),
    R(366, y+18, 2, 10, P.fg2, { radius: 1 }),
  ];
}

function navBar(x, y, w, active) {
  const tabs = [
    { icon: '◈', label: 'Command' },
    { icon: '▦', label: 'Assets'  },
    { icon: '⚡', label: 'Alerts'  },
    { icon: '◎', label: 'Intel'   },
    { icon: '◐', label: 'Posture' },
  ];
  const items = [];
  const tw = Math.floor(w / tabs.length);
  tabs.forEach((t, i) => {
    const tx = x + i * tw;
    const isActive = i === active;
    if (isActive) {
      items.push(R(tx + 8, y + 4, tw - 16, 52, P.dim, { radius: 10 }));
      items.push(R(tx + tw/2 - 14, y + 3, 28, 2, P.accent, { radius: 2 }));
    }
    items.push(T(tx + tw/2 - 8, y + 10, t.icon, 14, isActive ? P.fg : P.muted, { weight: isActive ? 600 : 400 }));
    items.push(T(tx + tw/2 - 16, y + 30, t.label, 9, isActive ? P.fg : P.muted, { weight: isActive ? 600 : 400, ls: 0.3 }));
  });
  return [
    R(x, y, w, 60, P.surface, { borderTop: `1px solid ${P.border}` }),
    ...items,
  ];
}

function metricCard(x, y, w, h, label, value, sub, accentColor, trend) {
  const items = [
    R(x, y, w, h, P.surface2, { radius: 12 }),
    R(x, y, w, h, 'none', { stroke: P.border, strokeWidth: 1, radius: 12 }),
    // accent dot
    E(x + 16, y + 16, 8, 8, accentColor),
    T(x + 16, y + 32, label.toUpperCase(), 8.5, P.muted, { weight: 600, ls: 1.2 }),
    T(x + 16, y + 52, value, 26, P.fg, { weight: 700, font: 'Inter' }),
    T(x + 16, y + 86, sub, 10, P.fg2),
  ];
  if (trend) {
    const tColor = trend.startsWith('+') ? P.accent2 : P.accent;
    items.push(R(x + w - 52, y + 54, 44, 18, tColor + '22', { radius: 9 }));
    items.push(T(x + w - 50, y + 58, trend, 9.5, tColor, { weight: 700 }));
  }
  return items;
}

function threatRow(x, y, w, severity, name, category, time, score) {
  const sevColors = { CRITICAL: P.accent, HIGH: P.amber, MEDIUM: P.purple, LOW: P.accent2 };
  const sevBg = { CRITICAL: P.dimR, HIGH: 'rgba(255,184,48,0.12)', MEDIUM: 'rgba(124,92,252,0.12)', LOW: P.dimG };
  const c = sevColors[severity] || P.muted;
  const bg = sevBg[severity] || P.dim;
  return [
    R(x, y, w, 52, P.surface2, { radius: 8 }),
    R(x, y, w, 52, 'none', { stroke: P.border, strokeWidth: 1, radius: 8 }),
    // severity badge
    R(x + 12, y + 18, 52, 16, bg, { radius: 4 }),
    T(x + 14, y + 21, severity, 7.5, c, { weight: 700, ls: 0.8 }),
    // name & category
    T(x + 74, y + 14, name, 11, P.fg, { weight: 600 }),
    T(x + 74, y + 30, category, 9.5, P.muted),
    // time
    T(x + w - 70, y + 14, time, 9.5, P.fg2),
    // score
    R(x + w - 52, y + 28, 40, 14, c + '22', { radius: 6 }),
    T(x + w - 50, y + 31, `${score}/10`, 9, c, { weight: 700 }),
  ];
}

function assetRow(x, y, w, name, ip, os, status, risk) {
  const riskColor = risk === 'HIGH' ? P.accent : risk === 'MED' ? P.amber : P.accent2;
  return [
    R(x, y, w, 48, P.surface2, { radius: 8 }),
    R(x, y, w, 48, 'none', { stroke: P.border, strokeWidth: 1, radius: 8 }),
    E(x + 16, y + 20, 8, 8, status === 'ONLINE' ? P.accent2 : P.muted),
    T(x + 30, y + 12, name, 11, P.fg, { weight: 600 }),
    T(x + 30, y + 28, ip, 9, P.muted, { font: 'monospace' }),
    T(x + 150, y + 20, os, 9.5, P.fg2),
    R(x + w - 52, y + 16, 44, 16, riskColor + '22', { radius: 6 }),
    T(x + w - 50, y + 19, risk, 8.5, riskColor, { weight: 700 }),
  ];
}

function progressBar(x, y, w, label, pct, color) {
  return [
    T(x, y, label, 10, P.fg2),
    T(x + w - 28, y, `${pct}%`, 10, color, { weight: 700 }),
    R(x, y + 16, w, 5, P.border, { radius: 3 }),
    R(x, y + 16, Math.round(w * pct / 100), 5, color, { radius: 3 }),
  ];
}

// ── SCREEN 1: Threat Command (Dashboard) ──────────────────────────────────────
function screen1() {
  const W = 390, H = 844;
  const children = [];

  // BG glow — red top left, mint bottom right (Utopia Tokyo energy)
  children.push(E(-80, -80, 360, 360, 'rgba(255,34,51,0.06)'));
  children.push(E(180, 500, 280, 280, 'rgba(61,255,208,0.05)'));

  // Status bar
  children.push(...statusBar(0));

  // Header
  children.push(T(16, 56, 'VIGIL', 22, P.fg, { weight: 800, ls: 3, font: 'Inter' }));
  children.push(T(90, 62, '/ THREAT COMMAND', 10, P.accent, { weight: 700, ls: 2 }));
  // Live indicator
  children.push(E(320, 64, 7, 7, P.accent));
  children.push(T(331, 62, 'LIVE', 9, P.accent, { weight: 700, ls: 1.5 }));

  // Threat level banner
  children.push(R(16, 88, 358, 44, P.dimR, { radius: 10 }));
  children.push(R(16, 88, 358, 44, 'none', { stroke: P.accent + '44', strokeWidth: 1, radius: 10 }));
  children.push(T(28, 101, '▲', 12, P.accent));
  children.push(T(44, 102, 'THREAT LEVEL: ELEVATED', 10, P.accent, { weight: 700, ls: 1.2 }));
  children.push(T(44, 116, '3 critical incidents detected in last 2h', 9, P.fg2 ));
  children.push(T(320, 101, '›', 14, P.accent));

  // Metric cards row 1
  children.push(...metricCard(16,  144, 170, 104, 'Active Threats', '47', '+12 since 06:00', P.accent, '+12'));
  children.push(...metricCard(204, 144, 170, 104, 'Assets at Risk', '9', '2 critical hosts', P.amber, '↑ 3'));

  // Metric cards row 2
  children.push(...metricCard(16,  256, 170, 104, 'Blocked Today', '2,341', 'auto-mitigated', P.accent2, '+341'));
  children.push(...metricCard(204, 256, 170, 104, 'Intel Feeds', '18', 'all sources active', P.purple, '100%'));

  // Recent Incidents section
  children.push(T(16, 374, 'RECENT INCIDENTS', 9, P.muted, { weight: 700, ls: 1.5 }));
  children.push(T(310, 374, 'VIEW ALL ›', 9, P.accent2, { weight: 600 }));

  const incidents = [
    { sev: 'CRITICAL', name: 'SQL Injection Attempt', cat: 'Web Application', time: '2m ago', score: 9 },
    { sev: 'HIGH',     name: 'Brute Force SSH',       cat: 'Endpoint',       time: '8m ago', score: 7 },
    { sev: 'MEDIUM',   name: 'Anomalous Data Exfil',  cat: 'Network',        time: '23m ago', score: 5 },
    { sev: 'LOW',      name: 'Cert Expiry Warning',   cat: 'Infrastructure', time: '1h ago', score: 2 },
  ];
  incidents.forEach((inc, i) => {
    children.push(...threatRow(16, 394 + i * 60, 358, inc.sev, inc.name, inc.cat, inc.time, inc.score));
  });

  // Nav
  children.push(...navBar(0, 784, 390, 0));

  return F(0, 0, W, H, P.bg, { clip: true, children });
}

// ── SCREEN 2: Asset Registry ───────────────────────────────────────────────────
function screen2() {
  const W = 390, H = 844;
  const children = [];

  children.push(E(200, -60, 300, 300, 'rgba(124,92,252,0.05)'));

  children.push(...statusBar(0));

  // Header
  children.push(R(0, 44, 390, 52, P.bg));
  children.push(T(16, 56, 'VIGIL', 18, P.fg, { weight: 800, ls: 3 }));
  children.push(T(78, 62, '/ ASSETS', 10, P.purple, { weight: 700, ls: 2 }));
  children.push(T(280, 58, '▦ 142 HOSTS', 10, P.fg2, { weight: 600, ls: 0.8 }));

  // Search bar
  children.push(R(16, 104, 358, 38, P.surface2, { radius: 10 }));
  children.push(R(16, 104, 358, 38, 'none', { stroke: P.border2, strokeWidth: 1, radius: 10 }));
  children.push(T(30, 116, '⌕', 14, P.muted));
  children.push(T(50, 117, 'Search assets, IPs, hostnames…', 11, P.muted));

  // Filter pills
  const filters = ['ALL', 'CRITICAL', 'SERVERS', 'ENDPOINTS', 'CLOUD'];
  filters.forEach((f, i) => {
    const isActive = i === 0;
    const fw = f.length * 7 + 16;
    const fx = 16 + filters.slice(0, i).reduce((a, ff) => a + ff.length * 7 + 24, 0);
    children.push(R(fx, 152, fw, 22, isActive ? P.accent : P.surface2, { radius: 11 }));
    children.push(T(fx + 8, 157, f, 8.5, isActive ? P.bg : P.muted, { weight: 700, ls: 0.8 }));
  });

  // Asset rows
  const assets = [
    { name: 'prod-api-01',    ip: '10.0.1.14',  os: 'Ubuntu 22.04', status: 'ONLINE', risk: 'HIGH' },
    { name: 'prod-db-master', ip: '10.0.1.30',  os: 'Debian 12',    status: 'ONLINE', risk: 'HIGH' },
    { name: 'k8s-worker-03',  ip: '10.0.2.17',  os: 'Alpine Linux',  status: 'ONLINE', risk: 'MED'  },
    { name: 'staging-web-02', ip: '10.0.3.8',   os: 'Ubuntu 22.04', status: 'ONLINE', risk: 'LOW'  },
    { name: 'bastion-host',   ip: '172.16.0.1', os: 'RHEL 9',        status: 'ONLINE', risk: 'MED'  },
    { name: 'legacy-win-07',  ip: '192.168.1.7',os: 'Windows 2012',  status: 'ONLINE', risk: 'HIGH' },
    { name: 'cdn-edge-01',    ip: '10.0.4.22',  os: 'Alpine Linux',  status: 'ONLINE', risk: 'LOW'  },
    { name: 'vpn-gateway',    ip: '10.0.0.1',   os: 'pfSense 2.7',   status: 'ONLINE', risk: 'MED'  },
    { name: 'mail-relay',     ip: '10.0.1.88',  os: 'Postfix/Deb',   status: 'ONLINE', risk: 'LOW'  },
    { name: 'dev-runner-12',  ip: '192.168.2.12',os: 'Ubuntu 20.04', status: 'ONLINE', risk: 'LOW'  },
  ];
  assets.forEach((a, i) => {
    children.push(...assetRow(16, 186 + i * 56, 358, a.name, a.ip, a.os, a.status, a.risk));
  });

  children.push(...navBar(0, 784, 390, 1));

  return F(0, 0, W, H, P.bg, { clip: true, children });
}

// ── SCREEN 3: Alert Feed ────────────────────────────────────────────────────
function screen3() {
  const W = 390, H = 844;
  const children = [];

  children.push(E(-60, 100, 300, 300, 'rgba(255,34,51,0.06)'));
  children.push(E(200, 500, 260, 260, 'rgba(255,184,48,0.05)'));

  children.push(...statusBar(0));
  children.push(T(16, 56, 'VIGIL', 18, P.fg, { weight: 800, ls: 3 }));
  children.push(T(78, 62, '/ ALERTS', 10, P.accent, { weight: 700, ls: 2 }));

  // Badge
  children.push(R(296, 54, 36, 20, P.accent, { radius: 10 }));
  children.push(T(304, 58, '47', 10, P.bg, { weight: 800 }));

  // Time filter
  children.push(R(16, 88, 358, 32, P.surface, { radius: 8 }));
  children.push(R(16, 88, 358, 32, 'none', { stroke: P.border, strokeWidth: 1, radius: 8 }));
  const timeFilters = ['1H', '6H', '24H', '7D', 'ALL'];
  timeFilters.forEach((tf, i) => {
    const isActive = i === 2;
    children.push(R(22 + i * 70, 91, 64, 26, isActive ? P.accent2 + '22' : 'transparent', { radius: 6 }));
    children.push(T(22 + i * 70 + 20, 99, tf, 9.5, isActive ? P.accent2 : P.muted, { weight: 700 }));
  });

  // Alert items with time grouping
  children.push(T(16, 132, 'JUST NOW', 8, P.muted, { weight: 700, ls: 1.5 }));

  const alerts = [
    { sev: 'CRITICAL', name: 'SQLi on /api/users', cat: 'Web App Attack', time: '09:41', score: 9 },
    { sev: 'CRITICAL', name: 'RCE Attempt Blocked', cat: 'Endpoint', time: '09:38', score: 9 },
    { sev: 'HIGH',     name: 'SSH Brute Force',    cat: 'prod-api-01', time: '09:33', score: 7 },
    { sev: 'HIGH',     name: 'Lateral Movement',   cat: 'Internal Network', time: '09:22', score: 8 },
  ];

  alerts.forEach((a, i) => {
    children.push(...threatRow(16, 148 + i * 60, 358, a.sev, a.name, a.cat, a.time, a.score));
  });

  children.push(T(16, 398, 'EARLIER', 8, P.muted, { weight: 700, ls: 1.5 }));

  const older = [
    { sev: 'MEDIUM',  name: 'Port Scan Detected',  cat: 'Network Recon',    time: '08:59', score: 5 },
    { sev: 'MEDIUM',  name: 'Failed Auth × 143',    cat: 'Identity',         time: '08:47', score: 4 },
    { sev: 'LOW',     name: 'TLS Cert Expiry 7d',  cat: 'Infrastructure',   time: '08:30', score: 2 },
    { sev: 'LOW',     name: 'Config Drift Alert',  cat: 'Compliance',       time: '07:55', score: 2 },
    { sev: 'LOW',     name: 'DNS Query Anomaly',   cat: 'Network',          time: '07:12', score: 3 },
    { sev: 'LOW',     name: 'Unused Port Open',    cat: 'prod-db-master',   time: '06:44', score: 2 },
  ];
  older.forEach((a, i) => {
    children.push(...threatRow(16, 418 + i * 60, 358, a.sev, a.name, a.cat, a.time, a.score));
  });

  children.push(...navBar(0, 784, 390, 2));

  return F(0, 0, W, H, P.bg, { clip: true, children });
}

// ── SCREEN 4: Threat Intelligence Profile ────────────────────────────────────
function screen4() {
  const W = 390, H = 844;
  const children = [];

  children.push(E(100, -40, 280, 280, 'rgba(255,34,51,0.08)'));
  children.push(E(-60, 600, 240, 240, 'rgba(124,92,252,0.07)'));

  children.push(...statusBar(0));

  // Back nav
  children.push(T(16, 56, '← ALERTS', 9.5, P.accent2, { weight: 600, ls: 0.8 }));

  // Threat header
  children.push(R(0, 80, 390, 130, P.dimR));
  children.push(R(0, 80, 390, 130, 'none', { stroke: P.accent + '22', strokeWidth: 0 }));

  children.push(R(16, 92, 46, 20, P.accent, { radius: 4 }));
  children.push(T(20, 96, 'CRITICAL', 7.5, P.bg, { weight: 800, ls: 0.8 }));
  children.push(T(70, 92, '9.2 / 10', 11, P.accent, { weight: 800 }));

  children.push(T(16, 120, 'SQL Injection Attack', 18, P.fg, { weight: 800 }));
  children.push(T(16, 144, 'OWASP A03 — Injection · Web Application Layer', 10, P.fg2 ));

  children.push(T(16, 166, '⏱ 09:38:44 UTC', 9.5, P.muted));
  children.push(T(150, 166, '◉ IN PROGRESS', 9.5, P.accent, { weight: 700 }));
  children.push(T(260, 166, '⚑ prod-api-01', 9.5, P.amber, { weight: 600 }));

  // Attack details card
  children.push(R(16, 222, 358, 140, P.surface2, { radius: 12 }));
  children.push(R(16, 222, 358, 140, 'none', { stroke: P.border, strokeWidth: 1, radius: 12 }));
  children.push(T(28, 234, 'ATTACK VECTOR', 8, P.muted, { weight: 700, ls: 1.2 }));

  const details = [
    { k: 'Source IP',   v: '185.220.101.47 (Tor Exit)' },
    { k: 'Target',      v: '/api/users?id=1%20[injected]'   },
    { k: 'Method',      v: 'POST — application/json'    },
    { k: 'Payload',     v: "[ SQLi pattern redacted ]"    },
    { k: 'Country',     v: '🇷🇺 Russia — AS AS20764'    },
  ];
  details.forEach((d, i) => {
    children.push(T(28, 254 + i * 19, d.k, 9, P.muted));
    children.push(T(130, 254 + i * 19, d.v, 9, P.fg, { font: 'monospace', weight: 500 }));
  });

  // MITRE ATT&CK tags
  children.push(T(16, 374, 'MITRE ATT&CK', 8, P.muted, { weight: 700, ls: 1.2 }));
  const tags = ['T1190 Exploit Public App', 'T1110 Brute Force', 'TA0001 Initial Access'];
  tags.forEach((tag, i) => {
    const tx = 16 + (i % 2) * 182;
    const ty = 390 + Math.floor(i / 2) * 28;
    children.push(R(tx, ty, 174, 22, P.purple + '22', { radius: 6 }));
    children.push(T(tx + 8, ty + 6, tag, 8.5, P.purple, { weight: 600 }));
  });

  // Timeline
  children.push(T(16, 460, 'TIMELINE', 8, P.muted, { weight: 700, ls: 1.2 }));
  const timeline = [
    { t: '09:38:44', e: 'First payload sent', c: P.accent },
    { t: '09:38:45', e: 'WAF rule triggered — BLOCKED', c: P.accent2 },
    { t: '09:38:51', e: '14 follow-up attempts', c: P.amber },
    { t: '09:39:12', e: 'IP auto-blacklisted', c: P.accent2 },
    { t: '09:41:00', e: 'Alert escalated to SOC', c: P.fg2 },
  ];
  timeline.forEach((ev, i) => {
    children.push(R(16, 478 + i * 44, 2, 40, P.border2));
    children.push(E(12, 484 + i * 44, 10, 10, ev.c));
    children.push(T(30, 484 + i * 44, ev.t, 8.5, P.muted, { font: 'monospace' }));
    children.push(T(100, 484 + i * 44, ev.e, 10, P.fg));
  });

  // Action buttons
  children.push(R(16, 706, 172, 42, P.accent, { radius: 10 }));
  children.push(T(44, 719, 'BLOCK SOURCE', 10, P.fg, { weight: 700, ls: 0.8 }));
  children.push(R(202, 706, 172, 42, P.surface2, { radius: 10 }));
  children.push(R(202, 706, 172, 42, 'none', { stroke: P.border2, strokeWidth: 1, radius: 10 }));
  children.push(T(222, 719, 'ASSIGN TO SOC', 10, P.fg2, { weight: 600 }));

  children.push(...navBar(0, 784, 390, 2));

  return F(0, 0, W, H, P.bg, { clip: true, children });
}

// ── SCREEN 5: Security Posture ───────────────────────────────────────────────
function screen5() {
  const W = 390, H = 844;
  const children = [];

  children.push(E(160, -80, 320, 320, 'rgba(61,255,208,0.05)'));
  children.push(E(-80, 600, 240, 240, 'rgba(124,92,252,0.06)'));

  children.push(...statusBar(0));
  children.push(T(16, 56, 'VIGIL', 18, P.fg, { weight: 800, ls: 3 }));
  children.push(T(78, 62, '/ POSTURE', 10, P.accent2, { weight: 700, ls: 2 }));

  // Score ring — simulated with arcs
  const cx = 195, cy = 182, r = 70;
  children.push(E(cx - r - 12, cy - r - 12, (r + 12) * 2, (r + 12) * 2, P.border, ));
  children.push(E(cx - r,      cy - r,      r * 2,         r * 2,         P.surface2));
  // Score number
  children.push(T(cx - 24, cy - 22, '74', 40, P.fg, { weight: 800 }));
  children.push(T(cx - 22, cy + 22, '/100', 11, P.muted, { weight: 600 }));
  children.push(T(cx - 28, cy + 40, 'SCORE', 8, P.muted, { weight: 700, ls: 2 }));

  // Score band arcs (simulated via colored ellipses clipped/partial)
  // We'll use a ring of rects as visual indicator
  children.push(T(28,  144, 'GOOD', 8, P.accent2, { weight: 700 }));
  children.push(T(120, 144, '■■■■■■■■░░', 10, P.accent2));
  children.push(T(28,  230, 'FAIR', 8, P.amber, { weight: 700 }));

  // CIS Benchmark scores
  children.push(R(16, 270, 358, 8, P.border, { radius: 3 }));

  children.push(T(16, 290, 'COMPLIANCE BENCHMARKS', 8, P.muted, { weight: 700, ls: 1.5 }));

  const benchmarks = [
    { label: 'CIS Benchmark — Linux',    pct: 82, color: P.accent2 },
    { label: 'CIS Benchmark — AWS',      pct: 74, color: P.accent2 },
    { label: 'SOC 2 Type II Controls',   pct: 68, color: P.amber   },
    { label: 'NIST CSF 2.0',             pct: 71, color: P.amber   },
    { label: 'PCI-DSS v4.0',             pct: 55, color: P.accent  },
    { label: 'ISO 27001:2022',           pct: 63, color: P.amber   },
  ];
  benchmarks.forEach((b, i) => {
    children.push(...progressBar(16, 310 + i * 38, 358, b.label, b.pct, b.color));
  });

  // Key findings
  children.push(T(16, 554, 'TOP FINDINGS', 8, P.muted, { weight: 700, ls: 1.5 }));

  const findings = [
    { icon: '▲', label: '4 hosts with outdated kernel', sev: 'HIGH',  c: P.accent  },
    { icon: '▲', label: 'MFA not enforced on 3 accounts', sev: 'HIGH',  c: P.accent  },
    { icon: '●', label: '12 open ports not in baseline', sev: 'MED',   c: P.amber   },
    { icon: '●', label: 'Log retention < 90 days on 2 servers', sev: 'MED',   c: P.amber   },
    { icon: '○', label: 'Stale IAM role — unused 180d', sev: 'LOW',   c: P.accent2 },
    { icon: '○', label: 'TLS 1.1 still enabled on cdn-01', sev: 'LOW',   c: P.accent2 },
  ];
  findings.forEach((f, i) => {
    children.push(R(16, 572 + i * 36, 358, 32, P.surface2, { radius: 8 }));
    children.push(R(16, 572 + i * 36, 358, 32, 'none', { stroke: P.border, strokeWidth: 1, radius: 8 }));
    children.push(T(26, 581 + i * 36, f.icon, 10, f.c));
    children.push(T(42, 581 + i * 36, f.label, 9.5, P.fg));
    children.push(R(310, 579 + i * 36, 48, 16, f.c + '22', { radius: 6 }));
    children.push(T(316, 582 + i * 36, f.sev, 8, f.c, { weight: 700, ls: 0.5 }));
  });

  children.push(...navBar(0, 784, 390, 4));

  return F(0, 0, W, H, P.bg, { clip: true, children });
}

// ── ASSEMBLE ──────────────────────────────────────────────────────────────────
const screens = [screen1(), screen2(), screen3(), screen4(), screen5()];
const GAP = 40;
const totalW = screens.length * (390 + GAP) - GAP;

const pen = {
  version: '2.8',
  name: 'VIGIL — Cyber Threat Intelligence Platform',
  width:  totalW,
  height: 844,
  fill:   '#070910',
  children: screens.map((s, i) => ({
    ...s,
    x: i * (390 + GAP),
    y: 0,
  })),
};

fs.writeFileSync(path.join(__dirname, 'vigil.pen'), JSON.stringify(pen, null, 2));
console.log(`✓ vigil.pen written (${screens.length} screens, ${JSON.stringify(pen).length} bytes)`);
