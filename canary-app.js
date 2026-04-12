'use strict';
// canary-app.js
// CANARY — know when they're inside
// Deception security platform (honeypot/canary token management)
// Dark theme — deep navy + canary yellow accent
// Inspired by Tracebit "The answer to Assume Breach" (land-book.com) +
//             Darknode AI automation dark aesthetic (Awwwards nominee)

const fs   = require('fs');
const path = require('path');

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const P = {
  bg:       '#070B14',   // near-black navy
  surface:  '#0D1220',   // card surface
  surface2: '#131825',   // elevated surface
  border:   '#1E2D45',   // subtle border
  text:     '#E2E8F3',   // off-white
  muted:    '#6B7E9A',   // muted blue-grey
  yellow:   '#F5C842',   // canary yellow — primary
  yellow2:  '#FADA6B',   // lighter yellow
  blue:     '#3B82F6',   // info blue
  red:      '#EF4444',   // critical
  green:    '#22C55E',   // live/safe
  orange:   '#F59E0B',   // warning
  purple:   '#8B5CF6',   // low/informational
  dim:      '#1A2640',   // very muted fill
};

const W = 375;
const H = 812;
const FRAME_GAP = 80;

// ─── PRIMITIVES ──────────────────────────────────────────────────────────────
let _id = 1;
const uid = () => `n${_id++}`;

function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'RECTANGLE',
    id: uid(),
    x, y, w, h,
    fill,
    cornerRadius: opts.r || 0,
    opacity: opts.opacity || 1,
    ...(opts.stroke ? { stroke: opts.stroke, strokeWidth: opts.strokeWidth || 1 } : {}),
  };
}

function text(x, y, w, content, fontSize, color, opts = {}) {
  return {
    type: 'TEXT',
    id: uid(),
    x, y, w,
    content,
    fontSize,
    color,
    fontWeight: opts.bold ? 700 : opts.semi ? 600 : opts.medium ? 500 : 400,
    fontStyle: opts.italic ? 'italic' : 'normal',
    textAlign: opts.center ? 'center' : opts.right ? 'right' : 'left',
    lineHeight: opts.lh || (fontSize <= 12 ? 1.6 : fontSize <= 16 ? 1.5 : 1.3),
    letterSpacing: opts.ls || 0,
    fontFamily: opts.mono ? 'monospace' : 'Inter',
    opacity: opts.opacity || 1,
  };
}

function frame(x, y, children, name) {
  return {
    type: 'FRAME',
    id: uid(),
    name,
    x, y,
    w: W,
    h: H,
    fill: P.bg,
    clip: true,
    children,
  };
}

function circle(x, y, r, fill, opts = {}) {
  return {
    type: 'ELLIPSE',
    id: uid(),
    x: x - r, y: y - r,
    w: r * 2, h: r * 2,
    fill,
    opacity: opts.opacity || 1,
    ...(opts.stroke ? { stroke: opts.stroke, strokeWidth: opts.strokeWidth || 1 } : {}),
  };
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  return {
    type: 'LINE',
    id: uid(),
    x: x1, y: y1,
    x2, y2,
    stroke,
    strokeWidth: opts.w || 1,
    opacity: opts.opacity || 1,
  };
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

function statusBar(yOff = 0) {
  return [
    rect(0, yOff, W, 48, P.bg),
    text(20, yOff + 14, 60, '9:41', 13, P.text, { bold: true }),
    text(W - 80, yOff + 14, 70, '●●●', 12, P.text, { right: true, opacity: 0.6 }),
  ];
}

function navBar(active) {
  const NAV = [
    { id: 'nest',   label: 'Nest',    icon: '⌂' },
    { id: 'alerts', label: 'Alerts',  icon: '◈' },
    { id: 'map',    label: 'Map',     icon: '◎' },
    { id: 'intel',  label: 'Intel',   icon: '◉' },
    { id: 'deploy', label: 'Deploy',  icon: '+' },
  ];
  const tabW = W / NAV.length;
  const y = H - 80;

  const nodes = [
    rect(0, y, W, 80, P.surface),
    rect(0, y, W, 1, P.border),
  ];
  // active pill
  const activeIdx = NAV.findIndex(n => n.id === active);
  if (activeIdx >= 0) {
    nodes.push(rect(activeIdx * tabW + 12, y + 8, tabW - 24, 44, P.dim, { r: 12 }));
  }
  NAV.forEach((tab, i) => {
    const cx = i * tabW + tabW / 2;
    const isActive = tab.id === active;
    nodes.push(
      text(i * tabW, y + 13, tabW, tab.icon, 18, isActive ? P.yellow : P.muted, { center: true }),
      text(i * tabW, y + 34, tabW, tab.label, 9, isActive ? P.yellow : P.muted, { center: true, ls: 0.3 }),
    );
  });
  return nodes;
}

function pill(x, y, label, color) {
  const w = label.length * 6.5 + 16;
  return [
    rect(x, y, w, 20, color + '22', { r: 10 }),
    text(x + 8, y + 4, w - 16, label, 10, color, { semi: true, ls: 0.4 }),
  ];
}

function severityDot(x, y, level) {
  const colors = { critical: P.red, high: P.orange, medium: P.yellow, low: P.purple, live: P.green };
  return circle(x, y, 5, colors[level] || P.muted);
}

function card(x, y, w, h, opts = {}) {
  return rect(x, y, w, h, opts.fill || P.surface, { r: opts.r || 14, stroke: opts.border ? P.border : undefined, strokeWidth: 1 });
}

// ─── SCREEN 1: NEST (OVERVIEW) ───────────────────────────────────────────────
function screenNest(ox) {
  const nodes = [];
  nodes.push(...statusBar());

  // Header
  nodes.push(
    text(20, 56, 200, 'CANARY', 22, P.yellow, { bold: true, ls: 4 }),
    text(20, 80, 240, 'Deception Network', 12, P.muted, { ls: 0.5 }),
  );
  // Bell icon with red dot
  nodes.push(
    rect(W - 56, 56, 36, 36, P.surface2, { r: 10 }),
    text(W - 50, 62, 24, '◈', 18, P.text, { center: true }),
    circle(W - 22, 57, 5, P.red),
  );

  // — Stat cards row —
  const statY = 114;
  const statH = 80;
  const statW = (W - 48) / 3;

  // Total canaries
  nodes.push(
    card(16, statY, statW, statH),
    text(24, statY + 14, statW - 16, '24', 28, P.text, { bold: true }),
    text(24, statY + 46, statW - 16, 'Canaries', 10, P.muted),
    text(24, statY + 60, statW - 16, 'deployed', 10, P.muted),
  );
  // Alerts today
  nodes.push(
    card(16 + statW + 8, statY, statW, statH, { fill: P.yellow + '12' }),
    rect(16 + statW + 8, statY, statW, statH, 'transparent', { r: 14, stroke: P.yellow, strokeWidth: 1 }),
    text(24 + statW + 8, statY + 14, statW - 16, '3', 28, P.yellow, { bold: true }),
    text(24 + statW + 8, statY + 46, statW - 16, 'Alerts', 10, P.yellow, { opacity: 0.8 }),
    text(24 + statW + 8, statY + 60, statW - 16, 'today', 10, P.yellow, { opacity: 0.8 }),
  );
  // Coverage score
  nodes.push(
    card(16 + (statW + 8) * 2, statY, statW, statH),
    text(24 + (statW + 8) * 2, statY + 14, statW - 16, '87%', 28, P.green, { bold: true }),
    text(24 + (statW + 8) * 2, statY + 46, statW - 16, 'Coverage', 10, P.muted),
    text(24 + (statW + 8) * 2, statY + 60, statW - 16, 'score', 10, P.muted),
  );

  // — Canary pulse bar —
  const pulseY = 212;
  nodes.push(
    text(20, pulseY, 200, 'CANARY PULSE', 10, P.muted, { bold: true, ls: 2 }),
    card(16, pulseY + 20, W - 32, 48),
  );
  // 24 small status dots across the bar
  const dotColors = [
    P.green, P.green, P.green, P.green, P.green, P.green, P.green, P.green,
    P.green, P.green, P.green, P.yellow, P.green, P.green, P.green, P.green,
    P.red, P.green, P.green, P.green, P.green, P.orange, P.green, P.green,
  ];
  dotColors.forEach((c, i) => {
    nodes.push(circle(28 + i * 13.5, pulseY + 20 + 24, 4, c, { opacity: c === P.green ? 0.6 : 1 }));
  });

  // — Alert feed —
  const feedY = 286;
  nodes.push(
    text(20, feedY, 200, 'RECENT ALERTS', 10, P.muted, { bold: true, ls: 2 }),
    text(W - 60, feedY, 55, 'View all', 10, P.yellow, { right: true }),
  );

  const ALERTS = [
    { sev: 'critical', name: 'AWS Credentials Token', zone: 'Cloud / IAM', time: '4m ago', icon: '☁' },
    { sev: 'high',     name: 'SQL Dump Canary File',  zone: 'DB Server / prod-db-1', time: '31m ago', icon: '🗄' },
    { sev: 'medium',   name: 'HR Directory Document', zone: 'File Share / \\\\corp', time: '2h ago', icon: '📄' },
  ];

  ALERTS.forEach((a, i) => {
    const ay = feedY + 22 + i * 82;
    const sevColors = { critical: P.red, high: P.orange, medium: P.yellow };
    const c = sevColors[a.sev];
    nodes.push(
      card(16, ay, W - 32, 72),
      // left accent bar
      rect(16, ay, 3, 72, c, { r: 2 }),
      // icon bg
      rect(27, ay + 16, 36, 36, c + '22', { r: 10 }),
      text(27, ay + 18, 36, a.icon, 18, c, { center: true }),
      // text
      text(72, ay + 14, W - 110, a.name, 13, P.text, { semi: true }),
      text(72, ay + 31, W - 110, a.zone, 11, P.muted),
      // time
      text(W - 70, ay + 14, 60, a.time, 11, P.muted, { right: true }),
      ...pill(72, ay + 48, a.sev.toUpperCase(), c),
    );
  });

  // nav
  nodes.push(...navBar('nest'));

  return frame(ox, 0, nodes, 'Screen 1 — Nest');
}

// ─── SCREEN 2: ALERT DETAIL ───────────────────────────────────────────────────
function screenAlert(ox) {
  const nodes = [];
  nodes.push(...statusBar());

  // Back + Title
  nodes.push(
    text(20, 56, 40, '←', 22, P.muted),
    text(60, 60, W - 120, 'Alert Detail', 16, P.text, { semi: true }),
    rect(W - 48, 58, 32, 28, P.red + '22', { r: 8 }),
    text(W - 42, 64, 28, '!', 14, P.red, { bold: true, center: true }),
  );

  // — Alert card —
  const cardY = 100;
  nodes.push(
    card(16, cardY, W - 32, 120),
    rect(16, cardY, 4, 120, P.red, { r: 2 }),
    text(28, cardY + 16, W - 54, 'AWS Credentials Token', 16, P.text, { bold: true }),
    text(28, cardY + 38, W - 54, 'IAM access key canary triggered', 12, P.muted),
    ...pill(28, cardY + 62, 'CRITICAL', P.red),
    ...pill(90, cardY + 62, 'CLOUD', P.blue),
    text(28, cardY + 92, W - 54, 'First seen: 9:37 AM · 4 minutes ago', 11, P.muted),
  );

  // — Attacker fingerprint —
  const fpY = 238;
  nodes.push(
    text(20, fpY, 200, 'ATTACKER FINGERPRINT', 10, P.muted, { bold: true, ls: 2 }),
    card(16, fpY + 20, W - 32, 180),
  );
  const FP_ROWS = [
    ['IP Address',   '185.220.101.47'],
    ['ASN',          'AS60729 · Unknown'],
    ['Country',      '🇷🇺 Russia / Moscow'],
    ['User-Agent',   'python-requests/2.28'],
    ['Protocol',     'HTTPS / boto3 SDK'],
    ['Tor Exit Node','YES'],
  ];
  FP_ROWS.forEach(([k, v], i) => {
    const ry = fpY + 30 + i * 26;
    nodes.push(
      text(28, ry, 130, k, 11, P.muted),
      text(165, ry, W - 185, v, 11, P.text, { semi: true, mono: true }),
    );
    if (i < FP_ROWS.length - 1) nodes.push(rect(28, ry + 18, W - 56, 1, P.border));
  });

  // — Actions —
  const actY = 434;
  nodes.push(
    text(20, actY, 200, 'RECOMMENDED ACTIONS', 10, P.muted, { bold: true, ls: 2 }),
  );
  const ACTIONS = [
    { icon: '🔒', label: 'Rotate AWS Credentials Now', color: P.red, fill: P.red },
    { icon: '🚫', label: 'Block IP at Perimeter',       color: P.orange, fill: P.orange },
    { icon: '📋', label: 'Create Incident Report',       color: P.blue, fill: P.blue },
  ];
  ACTIONS.forEach((a, i) => {
    const ay = actY + 20 + i * 58;
    nodes.push(
      card(16, ay, W - 32, 48),
      rect(16, ay, 4, 48, a.fill, { r: 2 }),
      text(28, ay + 8, 24, a.icon, 18, a.color),
      text(56, ay + 14, W - 80, a.label, 13, P.text, { semi: true }),
      text(W - 38, ay + 14, 20, '→', 14, P.muted),
    );
  });

  // — Timeline micro-strip —
  const tlY = 614;
  nodes.push(
    text(20, tlY, 200, 'ATTACK TIMELINE', 10, P.muted, { bold: true, ls: 2 }),
    card(16, tlY + 20, W - 32, 80),
  );
  const TL = [
    { t: '9:33', e: 'Doc opened', c: P.muted },
    { t: '9:34', e: 'Key copied',  c: P.orange },
    { t: '9:37', e: 'API call made', c: P.red },
    { t: '9:37', e: 'Alert fired', c: P.yellow },
  ];
  TL.forEach((ev, i) => {
    const ex = 28 + i * ((W - 56) / TL.length);
    nodes.push(
      circle(ex + 12, tlY + 44, 5, ev.c),
      text(ex, tlY + 26, 70, ev.t, 9, P.muted, { mono: true }),
      text(ex - 4, tlY + 56, 74, ev.e, 9, ev.c === P.muted ? P.muted : ev.c),
    );
    if (i < TL.length - 1) {
      nodes.push(rect(ex + 17, tlY + 43, 36, 2, P.border));
    }
  });

  nodes.push(...navBar('alerts'));
  return frame(ox, 0, nodes, 'Screen 2 — Alert Detail');
}

// ─── SCREEN 3: CANARY MAP ─────────────────────────────────────────────────────
function screenMap(ox) {
  const nodes = [];
  nodes.push(...statusBar());

  nodes.push(
    text(20, 56, 200, 'Canary Map', 20, P.text, { bold: true }),
    text(20, 80, 280, 'Live topology · 24 canaries', 12, P.muted),
  );

  // Legend
  const legY = 80;
  nodes.push(
    circle(W - 100, legY + 5, 5, P.green),
    text(W - 92, legY - 1, 36, 'Live', 10, P.muted),
    circle(W - 56, legY + 5, 5, P.red),
    text(W - 48, legY - 1, 42, 'Alert', 10, P.muted),
  );

  // Map background grid
  nodes.push(rect(16, 104, W - 32, 320, P.surface, { r: 16 }));
  // subtle grid lines
  for (let i = 0; i < 6; i++) {
    nodes.push(rect(16, 104 + i * 54, W - 32, 1, P.border, { opacity: 0.5 }));
  }
  for (let i = 0; i < 5; i++) {
    nodes.push(rect(16 + i * 68, 104, 1, 320, P.border, { opacity: 0.5 }));
  }

  // Network nodes / zones
  const ZONES = [
    { label: 'Cloud IAM',    x: 80,  y: 160, canaries: 5, alerts: 1, color: P.red },
    { label: 'Database',     x: 200, y: 180, canaries: 4, alerts: 1, color: P.orange },
    { label: 'File Server',  x: 300, y: 155, canaries: 6, alerts: 0, color: P.green },
    { label: 'Web Tier',     x: 100, y: 280, canaries: 4, alerts: 0, color: P.green },
    { label: 'HR Systems',   x: 230, y: 310, canaries: 3, alerts: 1, color: P.yellow },
    { label: 'Email',        x: 330, y: 290, canaries: 2, alerts: 0, color: P.green },
  ];

  // Connection lines
  const connections = [[0,1],[1,2],[0,3],[1,4],[2,5],[3,4],[4,5]];
  connections.forEach(([a, b]) => {
    nodes.push(line(ZONES[a].x, ZONES[a].y, ZONES[b].x, ZONES[b].y, P.border, { w: 1 }));
  });

  ZONES.forEach(z => {
    const r = 20 + z.canaries * 2;
    // glow for alerts
    if (z.alerts > 0) {
      nodes.push(circle(z.x, z.y, r + 8, z.color, { opacity: 0.15 }));
    }
    nodes.push(
      circle(z.x, z.y, r, z.color + '22'),
      circle(z.x, z.y, r, 'transparent', { stroke: z.color, strokeWidth: 2 }),
      text(z.x - 36, z.y - 6, 72, `${z.canaries}`, 14, z.color, { bold: true, center: true }),
    );
    if (z.alerts > 0) {
      nodes.push(
        circle(z.x + r - 4, z.y - r + 4, 8, P.red),
        text(z.x + r - 10, z.y - r - 4, 16, `${z.alerts}`, 10, P.text, { bold: true, center: true }),
      );
    }
    nodes.push(text(z.x - 50, z.y + r + 6, 100, z.label, 9, P.muted, { center: true }));
  });

  // — Zone summary list —
  const listY = 444;
  nodes.push(
    text(20, listY, 200, 'ZONE SUMMARY', 10, P.muted, { bold: true, ls: 2 }),
  );
  ZONES.slice(0, 4).forEach((z, i) => {
    const zy = listY + 22 + i * 50;
    nodes.push(
      card(16, zy, W - 32, 42),
      circle(36, zy + 21, 6, z.color),
      text(52, zy + 11, 160, z.label, 13, P.text, { semi: true }),
      text(52, zy + 26, 120, `${z.canaries} canaries`, 11, P.muted),
      text(W - 70, zy + 16, 60, z.alerts > 0 ? `${z.alerts} alert` : '✓ clean', 11, z.alerts > 0 ? z.color : P.green, { right: true }),
    );
  });

  nodes.push(...navBar('map'));
  return frame(ox, 0, nodes, 'Screen 3 — Canary Map');
}

// ─── SCREEN 4: THREAT INTEL ───────────────────────────────────────────────────
function screenIntel(ox) {
  const nodes = [];
  nodes.push(...statusBar());

  nodes.push(
    text(20, 56, 200, 'Threat Intel', 20, P.text, { bold: true }),
    text(20, 80, 280, 'Actor profile · last 30 days', 12, P.muted),
  );

  // Actor card
  const actorY = 104;
  nodes.push(
    card(16, actorY, W - 32, 90, { fill: P.red + '0D' }),
    rect(16, actorY, 4, 90, P.red, { r: 2 }),
    rect(W - 60, actorY + 16, 44, 44, P.red + '22', { r: 12 }),
    text(W - 56, actorY + 20, 44, '☠', 26, P.red, { center: true }),
    text(28, actorY + 14, 200, 'APT-SHADOW-41', 15, P.text, { bold: true, mono: true }),
    text(28, actorY + 34, 200, 'Nation-state · Est. confidence 84%', 12, P.muted),
    ...pill(28, actorY + 58, '🇷🇺 Russia', P.red),
    ...pill(100, actorY + 58, 'Credential Access', P.orange),
  );

  // MITRE ATT&CK coverage
  const mitreY = 212;
  nodes.push(
    text(20, mitreY, 280, 'MITRE ATT&CK COVERAGE', 10, P.muted, { bold: true, ls: 2 }),
    card(16, mitreY + 20, W - 32, 130),
  );
  const TACTICS = [
    { name: 'Recon',      pct: 100, color: P.green },
    { name: 'Initial Access', pct: 80, color: P.orange },
    { name: 'Credential',  pct: 90, color: P.red },
    { name: 'Lateral',     pct: 60, color: P.yellow },
    { name: 'Exfil',       pct: 30, color: P.muted },
  ];
  TACTICS.forEach((t, i) => {
    const ty = mitreY + 34 + i * 22;
    const barW = (W - 80) * t.pct / 100;
    nodes.push(
      text(28, ty, 110, t.name, 10, P.muted),
      rect(120, ty + 2, W - 148, 10, P.dim, { r: 5 }),
      rect(120, ty + 2, barW * 0.72, 10, t.color, { r: 5 }),
      text(W - 44, ty, 36, `${t.pct}%`, 10, t.color, { right: true }),
    );
  });

  // IOCs
  const iocY = 362;
  nodes.push(
    text(20, iocY, 200, 'INDICATORS OF COMPROMISE', 10, P.muted, { bold: true, ls: 2 }),
  );
  const IOCS = [
    { type: 'IP',   value: '185.220.101.47',         tag: 'Tor Exit' },
    { type: 'IP',   value: '45.153.160.140',          tag: 'VPN' },
    { type: 'UA',   value: 'python-requests/2.28',    tag: 'Scraper' },
    { type: 'HASH', value: 'a4f3d8...c91e2b',         tag: 'Dropper' },
  ];
  IOCS.forEach((ioc, i) => {
    const iy = iocY + 20 + i * 52;
    nodes.push(
      card(16, iy, W - 32, 44),
      text(28, iy + 7, 32, ioc.type, 9, P.muted, { mono: true, bold: true }),
      text(68, iy + 7, W - 106, ioc.value, 11, P.yellow2, { mono: true }),
      ...pill(W - 90, iy + 7, ioc.tag, P.blue),
    );
  });

  // Mini activity chart
  const chartY = 578;
  nodes.push(
    text(20, chartY, 200, 'ACTIVITY LAST 7 DAYS', 10, P.muted, { bold: true, ls: 2 }),
    card(16, chartY + 20, W - 32, 72),
  );
  const BARS = [2, 5, 3, 8, 4, 12, 3];
  const maxBar = Math.max(...BARS);
  BARS.forEach((v, i) => {
    const bh = (v / maxBar) * 44;
    const bx = 32 + i * ((W - 64) / BARS.length);
    nodes.push(
      rect(bx, chartY + 20 + 60 - bh, 24, bh, i === 5 ? P.red : P.blue + '66', { r: 4 }),
    );
  });
  const days = ['M','T','W','T','F','S','S'];
  days.forEach((d, i) => {
    nodes.push(text(32 + i * ((W - 64) / days.length), chartY + 82, 24, d, 9, P.muted, { center: true }));
  });

  nodes.push(...navBar('intel'));
  return frame(ox, 0, nodes, 'Screen 4 — Threat Intel');
}

// ─── SCREEN 5: DEPLOY NEW CANARY ─────────────────────────────────────────────
function screenDeploy(ox) {
  const nodes = [];
  nodes.push(...statusBar());

  nodes.push(
    text(20, 56, 200, 'Deploy Canary', 20, P.text, { bold: true }),
    text(20, 80, 280, 'Plant a decoy · catch intruders', 12, P.muted),
  );

  // Token type selector
  const typeY = 108;
  nodes.push(
    text(20, typeY, 200, 'TOKEN TYPE', 10, P.muted, { bold: true, ls: 2 }),
  );
  const TYPES = [
    { icon: '☁', label: 'AWS Key',    active: true },
    { icon: '📄', label: 'Document',  active: false },
    { icon: '🗄', label: 'SQL Dump',  active: false },
    { icon: '🔑', label: 'SSH Key',   active: false },
  ];
  TYPES.forEach((t, i) => {
    const tx = 16 + i * ((W - 32) / 4);
    const tw = (W - 32) / 4 - 4;
    nodes.push(
      rect(tx, typeY + 20, tw, 70, t.active ? P.yellow + '1A' : P.surface, { r: 12 }),
      rect(tx, typeY + 20, tw, 70, t.active ? P.yellow : P.border, { r: 12, stroke: t.active ? P.yellow : P.border, strokeWidth: t.active ? 2 : 1 }),
      text(tx, typeY + 32, tw, t.icon, 22, t.active ? P.yellow : P.muted, { center: true }),
      text(tx, typeY + 60, tw, t.label, 10, t.active ? P.yellow : P.muted, { center: true }),
    );
  });

  // Zone selector
  const zoneY = 218;
  nodes.push(
    text(20, zoneY, 200, 'TARGET ZONE', 10, P.muted, { bold: true, ls: 2 }),
    card(16, zoneY + 20, W - 32, 52),
    text(28, zoneY + 36, W - 80, 'Cloud / IAM', 14, P.text, { semi: true }),
    text(W - 50, zoneY + 36, 30, '▾', 14, P.muted),
  );

  // Lure quality
  const lureY = 292;
  nodes.push(
    text(20, lureY, 200, 'LURE QUALITY', 10, P.muted, { bold: true, ls: 2 }),
    card(16, lureY + 20, W - 32, 70),
    text(28, lureY + 32, W - 56, 'High Fidelity', 14, P.text, { semi: true }),
    text(28, lureY + 50, W - 56, 'Closely mimics real credentials · harder to ignore', 11, P.muted),
    rect(28, lureY + 72, W - 56, 6, P.dim, { r: 3 }),
    rect(28, lureY + 72, (W - 56) * 0.82, 6, P.yellow, { r: 3 }),
  );

  // Alert channels
  const chanY = 384;
  nodes.push(
    text(20, chanY, 200, 'ALERT CHANNELS', 10, P.muted, { bold: true, ls: 2 }),
  );
  const CHANS = [
    { label: 'Push Notification', on: true },
    { label: 'PagerDuty',         on: true },
    { label: 'Slack #incidents',  on: false },
    { label: 'Email digest',      on: false },
  ];
  CHANS.forEach((ch, i) => {
    const cy = chanY + 20 + i * 48;
    nodes.push(
      card(16, cy, W - 32, 40),
      text(28, cy + 12, W - 90, ch.label, 13, P.text, { semi: true }),
      // toggle
      rect(W - 66, cy + 10, 44, 22, ch.on ? P.yellow + '33' : P.dim, { r: 11 }),
      circle(ch.on ? W - 32 : W - 54, cy + 21, 9, ch.on ? P.yellow : P.muted),
    );
  });

  // Deploy button
  const btnY = 588 + 40;
  nodes.push(
    rect(16, btnY, W - 32, 56, P.yellow, { r: 16 }),
    text(0, btnY + 16, W, 'DEPLOY CANARY →', 15, '#070B14', { bold: true, center: true, ls: 2 }),
  );

  // Hint
  nodes.push(
    text(20, btnY + 68, W - 40, '🐦 Canary will be active within 30 seconds.', 11, P.muted, { center: true }),
  );

  nodes.push(...navBar('deploy'));
  return frame(ox, 0, nodes, 'Screen 5 — Deploy Canary');
}

// ─── BUILD PEN FILE ───────────────────────────────────────────────────────────
function buildPen() {
  const screens = [
    screenNest(0),
    screenAlert(W + FRAME_GAP),
    screenMap((W + FRAME_GAP) * 2),
    screenIntel((W + FRAME_GAP) * 3),
    screenDeploy((W + FRAME_GAP) * 4),
  ];

  const pen = {
    version: '2.8',
    meta: {
      name: 'CANARY — know when they\'re inside',
      description: 'Deception security platform. Dark theme. Canary yellow + deep navy.',
      author: 'RAM Design Heartbeat',
      created: new Date().toISOString(),
    },
    canvas: {
      w: (W + FRAME_GAP) * screens.length - FRAME_GAP,
      h: H,
      bg: '#050810',
    },
    frames: screens,
  };

  const out = path.join(__dirname, 'canary.pen');
  fs.writeFileSync(out, JSON.stringify(pen, null, 2));
  console.log('✓ canary.pen written:', out);
  console.log('  Frames:', screens.length);
  console.log('  Canvas:', pen.canvas.w, '×', pen.canvas.h);
}

buildPen();
