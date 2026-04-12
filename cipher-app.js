'use strict';
// cipher-app.js — CIPHER: AI Privacy Posture Dashboard

const fs   = require('fs');
const path = require('path');

function uid() {
  return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
}
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return { r: parseInt(h.slice(0,2),16)/255, g: parseInt(h.slice(2,4),16)/255, b: parseInt(h.slice(4,6),16)/255 };
}
function rect(x, y, w, h, fill, extra = {}) {
  return { type: 'RECTANGLE', id: uid(), x, y, width: w, height: h,
    fills: fill === 'none' ? [] : [{ type: 'SOLID', color: hexToRgb(fill) }],
    cornerRadius: extra.r || 0,
    strokes: extra.stroke ? [{ type: 'SOLID', color: hexToRgb(extra.stroke) }] : [],
    strokeWeight: extra.strokeW || 1,
    opacity: extra.opacity !== undefined ? extra.opacity : 1 };
}
function text(x, y, w, h, content, fontSize, fill, extra = {}) {
  return { type: 'TEXT', id: uid(), x, y, width: w, height: h,
    characters: content, fontSize,
    fontName: { family: extra.font || 'Inter', style: extra.weight || 'Regular' },
    fills: [{ type: 'SOLID', color: hexToRgb(fill) }],
    textAlignHorizontal: extra.align || 'LEFT',
    letterSpacing: extra.ls || 0,
    lineHeight: extra.lh ? { value: extra.lh, unit: 'PIXELS' } : { unit: 'AUTO' },
    opacity: extra.opacity !== undefined ? extra.opacity : 1 };
}
function ellipse(x, y, w, h, fill, extra = {}) {
  return { type: 'ELLIPSE', id: uid(), x, y, width: w, height: h,
    fills: fill === 'none' ? [] : [{ type: 'SOLID', color: hexToRgb(fill) }],
    strokes: extra.stroke ? [{ type: 'SOLID', color: hexToRgb(extra.stroke) }] : [],
    strokeWeight: extra.strokeW || 1,
    opacity: extra.opacity !== undefined ? extra.opacity : 1 };
}

const P = {
  bg: '#070B12', bg2: '#0D1421',
  surface: '#111A2C', surface2: '#162035',
  border: '#1E2D44', border2: '#243550',
  text: '#E2EBF8', text2: '#7A93B8', text3: '#3D5070',
  green: '#00FF94', green2: '#00CC76', greenBg: '#001A0F', greenDim: '#004433',
  indigo: '#6366F1', indigo2: '#4F52D0', indigoBg: '#0D0F30',
  amber: '#F59E0B', amberBg: '#1A1000',
  red: '#EF4444', redBg: '#1A0000',
  teal: '#06B6D4',
};

const W = 390, H = 844;

function statusBar() {
  return [
    text(20, 14, 60, 16, '9:41', 13, P.text2, { weight: 'Medium' }),
    text(295, 14, 75, 16, 'WiFi 100%', 12, P.text2, { align: 'RIGHT' }),
  ];
}

function navBar(activeIdx) {
  const items = [
    { icon: 'H', label: 'Home' },
    { icon: 'P', label: 'Perms' },
    { icon: 'V', label: 'Vault' },
    { icon: 'A', label: 'Alerts' },
    { icon: 'U', label: 'Profile' },
  ];
  const nodes = [
    rect(0, H - 80, W, 80, P.bg2),
    rect(0, H - 80, W, 1, P.border),
  ];
  items.forEach((n, i) => {
    const x = 15 + i * 72;
    const active = i === activeIdx;
    nodes.push(text(x, H - 60, 60, 14, n.label, 9, active ? P.green : P.text3,
      { align: 'CENTER', weight: active ? 'SemiBold' : 'Regular' }));
    if (active) nodes.push(rect(x + 22, H - 72, 16, 2, P.green, { r: 1 }));
  });
  return nodes;
}

// ── Screen 1: Home ────────────────────────────────────────────────────────────
function screenHome() {
  const nodes = [];
  nodes.push(rect(0, 0, W, H, P.bg));

  // Dot matrix background
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 12; col++) {
      nodes.push(rect(18 + col * 32, 130 + row * 60, 2, 2, '#1E2D44', { r: 1, opacity: 0.5 }));
    }
  }

  nodes.push(...statusBar());
  nodes.push(text(20, 52, 160, 16, 'CIPHER', 12, P.green, { weight: 'Bold', ls: 4 }));
  nodes.push(rect(340, 48, 36, 36, P.surface, { r: 18, stroke: P.border2, strokeW: 1 }));

  // Privacy score ring
  nodes.push(ellipse(W/2 - 70, 100, 140, 140, 'none', { stroke: P.border2, strokeW: 8 }));
  nodes.push(ellipse(W/2 - 66, 104, 132, 132, 'none', { stroke: P.green, strokeW: 5 }));
  nodes.push(ellipse(W/2 - 60, 110, 120, 120, P.surface));
  nodes.push(text(W/2 - 30, 146, 60, 48, '87', 44, P.green, { weight: 'Bold', align: 'CENTER' }));
  nodes.push(text(W/2 - 40, 196, 80, 14, 'SECURE', 10, P.text2, { weight: 'Bold', ls: 3, align: 'CENTER' }));

  nodes.push(text(W/2 - 70, 256, 140, 18, 'Privacy Score', 15, P.text, { weight: 'SemiBold', align: 'CENTER' }));
  nodes.push(text(W/2 - 90, 276, 180, 14, '3 issues need attention', 12, P.amber, { align: 'CENTER', weight: 'Medium' }));

  // Stats row
  [['47', 'Apps Audited', '+2 today'], ['128', 'Threats Blocked', 'this week'], ['6', 'Vaults', 'all locked']].forEach(([v, l, s], i) => {
    const x = 14 + i * 122;
    nodes.push(rect(x, 308, 116, 76, P.surface, { r: 12, stroke: P.border }));
    nodes.push(text(x + 8, 322, 100, 26, v, 22, P.text, { weight: 'Bold', align: 'CENTER' }));
    nodes.push(text(x + 4, 350, 108, 14, l, 10, P.text2, { align: 'CENTER' }));
    nodes.push(text(x + 4, 364, 108, 14, s, 9, P.green, { align: 'CENTER', weight: 'Medium' }));
  });

  // Active monitors
  nodes.push(text(20, 404, 200, 18, 'Active Monitors', 14, P.text, { weight: 'SemiBold' }));
  nodes.push(text(290, 404, 80, 18, 'See all', 12, P.indigo, { weight: 'Medium', align: 'RIGHT' }));

  [
    ['Location', 'Protected', P.green, P.greenDim],
    ['Camera & Mic', '1 alert', P.amber, '#1A1200'],
    ['Contacts Sync', 'Protected', P.green, P.greenDim],
    ['Background Data', '2 alerts', P.red, P.redBg],
  ].forEach(([lbl, status, col, bg], i) => {
    const y = 432 + i * 60;
    nodes.push(rect(14, y, W - 28, 52, P.surface, { r: 10, stroke: P.border }));
    nodes.push(ellipse(26, y + 13, 26, 26, bg));
    nodes.push(text(20, y + 12, 260, 16, lbl, 13, P.text, { weight: 'Medium' }));
    nodes.push(text(20, y + 30, 200, 14, 'Monitoring active', 10, P.text3));
    nodes.push(rect(W - 80, y + 15, 68, 20, bg, { r: 8 }));
    nodes.push(text(W - 80, y + 16, 68, 18, status, 10, col, { align: 'CENTER', weight: 'SemiBold' }));
  });

  nodes.push(...navBar(0));
  return nodes;
}

// ── Screen 2: Permissions ─────────────────────────────────────────────────────
function screenPerms() {
  const nodes = [];
  nodes.push(rect(0, 0, W, H, P.bg));
  nodes.push(...statusBar());

  nodes.push(text(20, 52, 300, 26, 'Permission Audit', 20, P.text, { weight: 'Bold' }));
  nodes.push(text(20, 80, 260, 14, '47 apps  last scanned 2m ago', 12, P.text2));

  [['3', 'Critical', P.red], ['8', 'Warning', P.amber], ['36', 'Safe', P.green]].forEach(([cnt, lbl, col], i) => {
    const x = 14 + i * 122;
    nodes.push(rect(x, 104, 116, 46, P.surface, { r: 10, stroke: P.border }));
    nodes.push(rect(x + 10, 114, 6, 6, col, { r: 3 }));
    nodes.push(text(x + 22, 110, 80, 16, lbl, 10, P.text2, { weight: 'Medium' }));
    nodes.push(text(x + 10, 128, 96, 18, cnt, 15, col, { weight: 'Bold' }));
  });

  // Filter row
  nodes.push(rect(14, 162, 130, 30, P.surface2, { r: 8 }));
  nodes.push(text(22, 168, 114, 18, 'Sort by Risk Level', 11, P.green, { weight: 'Medium' }));

  const apps = [
    ['Instagram', 'Camera  Mic  Location  Contacts', 'CRITICAL', P.red, P.redBg],
    ['TikTok', 'Camera  Mic  Location  Clipboard', 'CRITICAL', P.red, P.redBg],
    ['Spotify', 'Mic  Location', 'WARNING', P.amber, '#1A1200'],
    ['Google Maps', 'Location  Camera  Contacts', 'WARNING', P.amber, '#1A1200'],
    ['Signal', 'Camera  Mic  Contacts', 'SAFE', P.green, P.greenDim],
    ['Notion', 'Camera', 'SAFE', P.green, P.greenDim],
  ];

  apps.forEach(([name, perms, risk, col, bg], i) => {
    const y = 204 + i * 72;
    nodes.push(rect(14, y, W - 28, 64, P.surface, { r: 12, stroke: P.border }));
    nodes.push(rect(14, y + 8, 3, 48, col, { r: 2 }));
    nodes.push(rect(26, y + 12, 40, 40, bg, { r: 10 }));
    nodes.push(text(66, y + 14, 190, 16, name, 13, P.text, { weight: 'SemiBold' }));
    nodes.push(text(66, y + 32, 190, 13, perms, 9, P.text2));
    nodes.push(rect(W - 76, y + 20, 62, 20, bg, { r: 6 }));
    nodes.push(text(W - 76, y + 21, 62, 18, risk, 8, col, { align: 'CENTER', weight: 'Bold', ls: 1 }));
  });

  nodes.push(...navBar(1));
  return nodes;
}

// ── Screen 3: Vault ───────────────────────────────────────────────────────────
function screenVault() {
  const nodes = [];
  nodes.push(rect(0, 0, W, H, P.bg));

  // Radial glow
  nodes.push(ellipse(W/2 - 100, -40, 200, 160, P.greenDim, { opacity: 0.4 }));
  nodes.push(...statusBar());

  nodes.push(text(20, 52, 300, 26, 'Encrypted Vault', 20, P.text, { weight: 'Bold' }));
  nodes.push(text(20, 80, 300, 14, 'AES-256  6 categories  All sealed', 12, P.green, { weight: 'Medium' }));

  // Central lock icon card
  nodes.push(rect(W/2 - 50, 108, 100, 100, P.surface, { r: 24, stroke: P.green, strokeW: 2 }));
  nodes.push(rect(W/2 - 18, 134, 36, 28, 'none', { stroke: P.green, strokeW: 2, r: 4 }));
  nodes.push(rect(W/2 - 13, 122, 26, 22, 'none', { stroke: P.green, strokeW: 2, r: 13 }));
  nodes.push(ellipse(W/2 - 5, 143, 10, 10, P.green));
  nodes.push(rect(W/2 - 2, 153, 4, 8, P.green, { r: 2 }));
  nodes.push(text(W/2 - 60, 216, 120, 14, 'ENCRYPTED', 10, P.green, { align: 'CENTER', weight: 'Bold', ls: 3 }));

  // Vault grid 2x3
  const vaults = [
    ['Passwords', '284 entries', P.green],
    ['Health Data', '12 records', P.teal],
    ['Financial', '67 items', P.indigo],
    ['Documents', '43 files', P.amber],
    ['Identity', '8 IDs', P.green],
    ['Contacts', '391 entries', P.teal],
  ];

  vaults.forEach(([name, count, col], i) => {
    const col2 = i % 2;
    const row2 = Math.floor(i / 2);
    const x = 14 + col2 * 186;
    const y = 242 + row2 * 116;
    nodes.push(rect(x, y, 176, 108, P.surface, { r: 16, stroke: P.border2 }));
    // Sealed dot
    nodes.push(rect(x + 150, y + 10, 16, 10, P.greenDim, { r: 4 }));
    nodes.push(text(x + 150, y + 10, 16, 10, 'ok', 6, P.green, { align: 'CENTER', weight: 'Bold' }));
    nodes.push(ellipse(x + 16, y + 22, 36, 36, col + '22'));
    nodes.push(rect(x + 16, y + 22, 36, 36, 'none', { stroke: col, strokeW: 1, r: 18 }));
    nodes.push(text(x + 14, y + 66, 148, 17, name, 14, P.text, { weight: 'SemiBold' }));
    nodes.push(text(x + 14, y + 85, 148, 14, count, 10, P.text2));
  });

  // Encryption strength
  nodes.push(rect(14, H - 156, W - 28, 48, P.surface, { r: 12, stroke: P.border }));
  nodes.push(text(24, H - 147, 200, 14, 'Encryption Strength', 11, P.text2, { weight: 'Medium' }));
  nodes.push(text(W - 40, H - 147, 22, 14, '100%', 11, P.green, { weight: 'Bold', align: 'RIGHT' }));
  nodes.push(rect(24, H - 130, W - 52, 8, P.surface2, { r: 4 }));
  nodes.push(rect(24, H - 130, W - 52, 8, P.green, { r: 4 }));

  nodes.push(...navBar(2));
  return nodes;
}

// ── Screen 4: Alerts ──────────────────────────────────────────────────────────
function screenAlerts() {
  const nodes = [];
  nodes.push(rect(0, 0, W, H, P.bg));
  nodes.push(...statusBar());

  nodes.push(text(20, 52, 220, 26, 'Security Alerts', 20, P.text, { weight: 'Bold' }));
  nodes.push(rect(W - 48, 54, 28, 22, P.red, { r: 6 }));
  nodes.push(text(W - 48, 54, 28, 22, '11', 12, '#FFFFFF', { align: 'CENTER', weight: 'Bold' }));

  // Tabs
  ['All', 'Critical', 'Warning', 'Info'].forEach((t, i) => {
    const active = i === 0;
    nodes.push(rect(14 + i * 78, 88, 72, 28, active ? P.red : P.surface, { r: 8 }));
    nodes.push(text(14 + i * 78, 89, 72, 26, t, 11, active ? '#FFFFFF' : P.text2, { align: 'CENTER', weight: active ? 'SemiBold' : 'Regular' }));
  });

  const alerts = [
    ['Just now', 'Instagram read clipboard', 'Without user action', 'CRITICAL', P.red, P.redBg],
    ['4m ago', 'TikTok background location', 'Location while app in background', 'CRITICAL', P.red, P.redBg],
    ['22m ago', 'Spotify mic access', 'Microphone accessed during playback', 'WARNING', P.amber, '#1A1200'],
    ['1h ago', 'New device login', 'MacBook Pro  San Francisco, CA', 'INFO', P.teal, '#001A22'],
    ['2h ago', 'VPN disconnected briefly', '34s unprotected, no data leaked', 'WARNING', P.amber, '#1A1200'],
    ['6h ago', 'Permission audit done', '47 apps reviewed  3 flagged', 'INFO', P.green, P.greenDim],
  ];

  alerts.forEach(([time, title, detail, sev, col, bg], i) => {
    const y = 130 + i * 90;
    nodes.push(rect(14, y, W - 28, 82, P.surface, { r: 12, stroke: P.border }));
    nodes.push(rect(14, y + 10, 3, 62, col, { r: 2 }));
    nodes.push(ellipse(26, y + 20, 28, 28, bg));
    nodes.push(text(W - 82, y + 14, 68, 14, time, 9, P.text3, { align: 'RIGHT' }));
    nodes.push(rect(W - 82, y + 30, 68, 16, bg, { r: 4 }));
    nodes.push(text(W - 82, y + 30, 68, 16, sev, 8, col, { align: 'CENTER', weight: 'Bold', ls: 1 }));
    nodes.push(text(62, y + 16, 200, 16, title, 12, P.text, { weight: 'SemiBold' }));
    nodes.push(text(62, y + 34, 200, 14, detail, 10, P.text2));
    nodes.push(text(62, y + 52, 80, 18, 'Review', 10, col, { weight: 'Medium' }));
  });

  nodes.push(...navBar(3));
  return nodes;
}

// ── Screen 5: Profile ─────────────────────────────────────────────────────────
function screenProfile() {
  const nodes = [];
  nodes.push(rect(0, 0, W, H, P.bg));
  nodes.push(ellipse(W/2 - 100, -80, 200, 200, P.indigoBg, { opacity: 0.5 }));
  nodes.push(...statusBar());

  nodes.push(text(20, 52, 280, 26, 'Privacy Profile', 20, P.text, { weight: 'Bold' }));

  nodes.push(ellipse(W/2 - 36, 90, 72, 72, P.surface));
  nodes.push(rect(W/2 - 36, 90, 72, 72, 'none', { stroke: P.indigo, strokeW: 2, r: 36 }));
  nodes.push(text(20, 174, W - 40, 20, 'Alex Morgan', 17, P.text, { weight: 'Bold', align: 'CENTER' }));
  nodes.push(text(20, 196, W - 40, 14, 'alex@protonmail.com', 12, P.text2, { align: 'CENTER' }));

  // VPN status bar
  nodes.push(rect(14, 222, W - 28, 48, P.greenDim, { r: 12, stroke: P.green }));
  nodes.push(text(24, 232, 260, 16, 'VPN Protected  Netherlands', 12, P.green, { weight: 'SemiBold' }));
  nodes.push(text(24, 248, 200, 14, 'ProtonVPN  35ms ping', 10, P.green, { opacity: 0.7 }));
  nodes.push(rect(W - 50, 234, 30, 20, P.green, { r: 10 }));
  nodes.push(text(W - 50, 234, 30, 20, 'ON', 9, P.bg, { align: 'CENTER', weight: 'Bold' }));

  nodes.push(text(20, 286, 200, 16, 'Privacy Controls', 13, P.text, { weight: 'SemiBold' }));

  [
    ['Ad Tracking', 'Blocked across all apps', 'OFF', P.green],
    ['Behavioral Profiling', 'Opt-out active', 'OFF', P.green],
    ['Cross-App Data Sharing', '3 apps requesting', 'REVIEW', P.amber],
    ['Analytics Reporting', 'Anonymous mode', 'LIMITED', P.teal],
    ['iCloud Backup Encryption', 'End-to-end encrypted', 'ON', P.green],
    ['Data Broker Opt-outs', '47 of 52 removed', '90%', P.indigo],
  ].forEach(([lbl, sub, state, col], i) => {
    const y = 310 + i * 64;
    nodes.push(rect(14, y, W - 28, 56, P.surface, { r: 12, stroke: P.border }));
    nodes.push(text(20, y + 12, 240, 16, lbl, 13, P.text, { weight: 'Medium' }));
    nodes.push(text(20, y + 30, 240, 14, sub, 10, P.text2));
    nodes.push(rect(W - 80, y + 17, 62, 20, col + '22', { r: 6 }));
    nodes.push(text(W - 80, y + 18, 62, 18, state, 9, col, { align: 'CENTER', weight: 'Bold', ls: 1 }));
  });

  nodes.push(...navBar(4));
  return nodes;
}

// ── Build .pen ────────────────────────────────────────────────────────────────
const screens = [
  { name: 'Home', nodes: screenHome() },
  { name: 'Permissions', nodes: screenPerms() },
  { name: 'Vault', nodes: screenVault() },
  { name: 'Alerts', nodes: screenAlerts() },
  { name: 'Profile', nodes: screenProfile() },
];

const pen = {
  version: '2.8',
  name: 'CIPHER — AI Privacy Posture Dashboard',
  pages: [{
    id: uid(),
    name: 'Mobile Screens',
    children: screens.map((s, i) => ({
      type: 'FRAME', id: uid(),
      name: s.name,
      x: i * (W + 60), y: 0,
      width: W, height: H,
      fills: [], children: s.nodes,
      cornerRadius: 0, strokes: [], strokeWeight: 1,
      clipsContent: true,
    })),
  }],
};

const out = path.join(__dirname, 'cipher.pen');
fs.writeFileSync(out, JSON.stringify(pen, null, 2));
console.log(`cipher.pen written (${(fs.statSync(out).size / 1024).toFixed(1)} KB)`);
