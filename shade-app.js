// SHADE — cloud infrastructure cost intelligence platform
// Inspired by: Evervault's customers page (godly.website) deep navy aesthetic
// Dark theme: #020514 bg, violet accent, cyan highlights
// 5 screens: Cost Overview, Service Breakdown, Anomaly Detector, Forecasting, Team Alerts

const fs = require('fs');

const W = 375, H = 812;
const COLS = 6;
const SCREENS = 5;
const TOTAL_W = COLS * W;

// Palette — deep space navy inspired by Evervault rgb(1,3,20)
const bg        = '#020514';   // near-black navy
const surface   = '#0C1228';   // card surface
const surface2  = '#111A35';   // slightly lighter card
const border    = '#1E2D55';   // subtle border
const text      = '#D4D7F5';   // ghostly blue-white (Evervault rgb(223,225,244))
const textMuted = '#6B72A8';   // muted text
const accent    = '#7066F5';   // violet
const accentHi  = '#9B93FF';   // lighter violet for hover
const cyan      = '#22D3EE';   // cyan accent2
const green     = '#10B981';   // success green
const amber     = '#F59E0B';   // warning amber
const red       = '#EF4444';   // danger red
const white     = '#FFFFFF';

let nodes = [];
let nid = 0;
function n(type, props) {
  const node = { type, id: `n${++nid}`, ...props };
  nodes.push(node);
  return node;
}

// ─── helpers ─────────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, extra = {}) {
  return n('RECTANGLE', { x, y, width: w, height: h, fill, cornerRadius: extra.r || 0, ...extra });
}
function text_(x, y, content, size, fill, extra = {}) {
  return n('TEXT', { x, y, content, fontSize: size, fill, fontWeight: extra.bold ? 700 : extra.semi ? 600 : 400,
    fontFamily: extra.mono ? 'JetBrains Mono' : 'Inter', letterSpacing: extra.ls || 0, ...extra });
}
function badge(x, y, label, bg2, fg, w2 = 60, h2 = 20) {
  rect(x, y, w2, h2, bg2, { r: 4 });
  text_(x + w2/2, y + 5, label, 10, fg, { bold: true, anchor: 'middle' });
}

// ─── Screen helpers ──────────────────────────────────────────────────────────
function screenBase(col) {
  const ox = col * W;
  rect(ox, 0, W, H, bg, { name: `screen-${col}-bg` });
  // status bar
  rect(ox, 0, W, 44, '#020514', { name: `status-${col}` });
  // bottom nav
  rect(ox, H - 72, W, 72, surface, { name: `nav-bg-${col}` });
  rect(ox, H - 72, W, 1, border, { name: `nav-border-${col}` });
}

function navItem(col, index, icon, label, active) {
  const ox = col * W;
  const x = ox + 15 + index * 69;
  const y = H - 55;
  if (active) {
    rect(x + 10, y - 6, 49, 44, `${accent}22`, { r: 10 });
  }
  // icon placeholder
  rect(x + 24, y + 3, 14, 14, active ? accent : textMuted, { r: 3, name: `icon-${col}-${index}` });
  text_(x + 31, y + 22, label, 9, active ? accentHi : textMuted, { anchor: 'middle', bold: active });
}

function statusBar(col) {
  const ox = col * W;
  text_(ox + 20, 14, '9:41', 13, text, { bold: true });
  // battery + signal (simple rects)
  rect(ox + W - 54, 17, 22, 10, text, { r: 2 });
  rect(ox + W - 50, 19, 14, 6, bg, { r: 1 });
  rect(ox + W - 50, 19, 10, 6, green, { r: 1 });
  rect(ox + W - 30, 18, 4, 8, text, { r: 1 });
  rect(ox + W - 24, 19, 4, 6, text, { r: 1 });
  rect(ox + W - 18, 20, 4, 4, text, { r: 1 });
}

function sectionLabel(col, y, label) {
  const ox = col * W;
  text_(ox + 20, y, label.toUpperCase(), 10, textMuted, { bold: true, ls: 1.5 });
}

// ─── SCREEN 1: Cost Overview ──────────────────────────────────────────────────
function screen1() {
  const col = 0, ox = 0;
  screenBase(col);
  statusBar(col);

  // Header
  text_(ox + 20, 56, 'Cost Overview', 22, text, { bold: true });
  text_(ox + 20, 82, 'March 2026', 13, textMuted);
  // avatar circle
  rect(ox + W - 52, 52, 36, 36, `${accent}33`, { r: 18 });
  rect(ox + W - 44, 60, 20, 20, accent, { r: 10 });

  // Hero cost card
  rect(ox + 20, 108, W - 40, 110, surface, { r: 16 });
  rect(ox + 20, 108, W - 40, 3, accent, { r: 2, name: 'hero-accent-bar' });
  text_(ox + 32, 122, 'MONTH-TO-DATE SPEND', 10, textMuted, { bold: true, ls: 1.2 });
  text_(ox + 32, 148, '$47,284', 36, text, { bold: true });
  text_(ox + 32, 190, '↑ 12.4% vs last month', 12, amber);
  // sparkline (simplified bars)
  const sparkX = ox + W - 120;
  for (let i = 0; i < 12; i++) {
    const barH = 10 + Math.round([18,22,14,26,20,30,16,28,22,34,24,38][i] * 0.8);
    const barColor = i === 11 ? accent : `${accent}55`;
    rect(sparkX + i * 9, 208 - barH, 6, barH, barColor, { r: 1 });
  }

  // Quick stats row
  const stats = [
    { label: 'EC2', val: '$18.2K', chg: '+8%', chgColor: amber },
    { label: 'S3', val: '$6.1K', chg: '-3%', chgColor: green },
    { label: 'RDS', val: '$11.4K', chg: '+21%', chgColor: red },
  ];
  stats.forEach((s, i) => {
    const sx = ox + 20 + i * 113;
    rect(sx, 232, 108, 70, surface2, { r: 12 });
    text_(sx + 12, 248, s.label, 11, textMuted, { bold: true, ls: 1 });
    text_(sx + 12, 270, s.val, 15, text, { bold: true });
    text_(sx + 12, 290, s.chg, 11, s.chgColor, { bold: true });
  });

  // Section: Top services
  sectionLabel(col, 318, 'Top Services');
  const services = [
    { name: 'EC2 Compute', val: '$18,241', pct: 39, color: accent },
    { name: 'RDS Database', val: '$11,432', pct: 24, color: cyan },
    { name: 'CloudFront CDN', val: '$5,890', pct: 12, color: `${green}` },
    { name: 'Lambda Functions', val: '$4,120', pct: 9, color: amber },
  ];
  services.forEach((sv, i) => {
    const sy = 334 + i * 62;
    rect(ox + 20, sy, W - 40, 55, surface, { r: 12 });
    // color dot
    rect(ox + 32, sy + 16, 8, 8, sv.color, { r: 4 });
    text_(ox + 48, sy + 10, sv.name, 13, text, { bold: false });
    text_(ox + 48, sy + 28, sv.val, 12, textMuted);
    // progress bar bg
    rect(ox + 48, sy + 43, W - 108, 4, border, { r: 2 });
    // progress fill
    rect(ox + 48, sy + 43, Math.round((W - 108) * sv.pct / 100), 4, sv.color, { r: 2 });
    text_(ox + W - 48, sy + 15, `${sv.pct}%`, 12, sv.color, { bold: true, anchor: 'end' });
  });

  // Nav
  ['Overview', 'Services', 'Anomaly', 'Forecast', 'Alerts'].forEach((l, i) => navItem(col, i, l, l, i === 0));
}

// ─── SCREEN 2: Service Breakdown ─────────────────────────────────────────────
function screen2() {
  const col = 1, ox = W;
  screenBase(col);
  statusBar(col);

  text_(ox + 20, 56, 'Service Breakdown', 22, text, { bold: true });
  text_(ox + 20, 82, 'Compare spend by service', 13, textMuted);

  // Donut chart (circles)
  const cx = ox + W/2, cy = 220;
  // outer ring segments (simulated with colored arcs via rectangles)
  rect(cx - 70, cy - 70, 140, 140, surface, { r: 70, name: 'donut-bg' });
  rect(cx - 52, cy - 52, 104, 104, bg, { r: 52, name: 'donut-hole' });
  // Center label
  text_(cx, cy - 12, '$47.3K', 18, text, { bold: true, anchor: 'middle' });
  text_(cx, cy + 8, 'Total Spend', 11, textMuted, { anchor: 'middle' });
  // Legend dots around donut
  const segments = [
    { color: accent, label: 'EC2', val: '39%' },
    { color: cyan, label: 'RDS', val: '24%' },
    { color: green, label: 'S3', val: '13%' },
    { color: amber, label: 'Other', val: '24%' },
  ];
  // Side legend
  segments.forEach((seg, i) => {
    const lx = ox + 20 + (i % 2) * ((W - 40) / 2);
    const ly = 306 + Math.floor(i / 2) * 30;
    rect(lx, ly + 4, 10, 10, seg.color, { r: 5 });
    text_(lx + 16, ly, seg.label, 12, text);
    text_(lx + 16, ly + 16, seg.val, 11, textMuted);
  });

  // Tag filter row
  sectionLabel(col, 378, 'Filter by Tag');
  const tags = ['Production', 'Staging', 'Dev', 'Data'];
  tags.forEach((tag, i) => {
    const tw = 70 + (i === 0 ? 10 : 0);
    const tx = ox + 20 + i * 80;
    const isActive = i === 0;
    rect(tx, 394, tw, 28, isActive ? accent : surface2, { r: 8 });
    text_(tx + tw/2, 403, tag, 11, isActive ? white : textMuted, { anchor: 'middle', bold: isActive });
  });

  // Table header
  sectionLabel(col, 436, 'Cost by Service / Region');
  rect(ox + 20, 452, W - 40, 30, surface2, { r: 8 });
  text_(ox + 32, 462, 'Service', 11, textMuted, { bold: true });
  text_(ox + 170, 462, 'Region', 11, textMuted, { bold: true });
  text_(ox + W - 68, 462, 'Cost', 11, textMuted, { bold: true });

  const rows = [
    { svc: 'EC2 Compute', region: 'us-east-1', cost: '$12,441', color: red },
    { svc: 'EC2 Compute', region: 'eu-west-1', cost: '$5,800', color: amber },
    { svc: 'RDS Aurora', region: 'us-east-1', cost: '$8,220', color: amber },
    { svc: 'CloudFront', region: 'Global', cost: '$5,890', color: green },
    { svc: 'Lambda', region: 'us-east-1', cost: '$4,120', color: green },
  ];
  rows.forEach((row, i) => {
    const ry = 486 + i * 44;
    if (i % 2 === 0) rect(ox + 20, ry, W - 40, 40, surface, { r: 8 });
    text_(ox + 32, ry + 10, row.svc, 12, text);
    text_(ox + 170, ry + 10, row.region, 11, textMuted);
    text_(ox + W - 48, ry + 10, row.cost, 12, row.color, { bold: true, anchor: 'end' });
  });

  ['Overview', 'Services', 'Anomaly', 'Forecast', 'Alerts'].forEach((l, i) => navItem(col, i, l, l, i === 1));
}

// ─── SCREEN 3: Anomaly Detector ──────────────────────────────────────────────
function screen3() {
  const col = 2, ox = W * 2;
  screenBase(col);
  statusBar(col);

  text_(ox + 20, 56, 'Anomaly Detector', 22, text, { bold: true });
  text_(ox + 20, 82, '3 anomalies detected this week', 13, amber);

  // Anomaly cards
  const anomalies = [
    {
      title: 'EC2 Spike',
      time: '2h ago',
      desc: 'us-east-1 compute up 340% in 4h',
      expected: '$420', actual: '$1,428',
      severity: 'CRITICAL', sColor: red, icon: '⚠',
    },
    {
      title: 'Lambda Cold Starts',
      time: '6h ago',
      desc: 'Invocation count anomaly detected',
      expected: '$12', actual: '$89',
      severity: 'HIGH', sColor: amber, icon: '↑',
    },
    {
      title: 'S3 Egress Surge',
      time: '1d ago',
      desc: 'Data transfer to external origin',
      expected: '$0.80', actual: '$4.20',
      severity: 'MEDIUM', sColor: cyan, icon: '→',
    },
  ];
  anomalies.forEach((a, i) => {
    const ay = 104 + i * 148;
    rect(ox + 20, ay, W - 40, 136, surface, { r: 16 });
    // Severity stripe on left
    rect(ox + 20, ay, 4, 136, a.sColor, { r: 2 });
    // Severity badge
    badge(ox + W - 90, ay + 12, a.severity, `${a.sColor}22`, a.sColor, 70, 22);
    // Title + time
    text_(ox + 36, ay + 14, a.title, 15, text, { bold: true });
    text_(ox + 36, ay + 34, a.time, 11, textMuted);
    text_(ox + 36, ay + 54, a.desc, 12, textMuted);
    // Expected vs Actual
    rect(ox + 36, ay + 74, (W - 72) / 2 - 8, 48, surface2, { r: 8 });
    rect(ox + 36 + (W - 72) / 2, ay + 74, (W - 72) / 2 - 8, 48, `${a.sColor}15`, { r: 8 });
    text_(ox + 36 + 8, ay + 82, 'Expected', 10, textMuted);
    text_(ox + 36 + 8, ay + 98, a.expected, 14, green, { bold: true });
    text_(ox + 36 + (W - 72) / 2 + 8, ay + 82, 'Actual', 10, textMuted);
    text_(ox + 36 + (W - 72) / 2 + 8, ay + 98, a.actual, 14, a.sColor, { bold: true });
  });

  // ML insight box at bottom
  rect(ox + 20, 554, W - 40, 68, `${accent}15`, { r: 12 });
  rect(ox + 20, 554, W - 40, 68, border, { r: 12, fill: 'transparent', strokeWidth: 1, stroke: accent });
  text_(ox + 32, 566, '✦ AI INSIGHT', 10, accent, { bold: true, ls: 1.2 });
  text_(ox + 32, 584, 'EC2 anomaly correlates with new deploy', 12, text);
  text_(ox + 32, 600, 'in prod-us-east at 14:23 UTC', 12, text);

  ['Overview', 'Services', 'Anomaly', 'Forecast', 'Alerts'].forEach((l, i) => navItem(col, i, l, l, i === 2));
}

// ─── SCREEN 4: Forecasting ────────────────────────────────────────────────────
function screen4() {
  const col = 3, ox = W * 3;
  screenBase(col);
  statusBar(col);

  text_(ox + 20, 56, 'Forecast', 22, text, { bold: true });
  text_(ox + 20, 82, 'AI-powered spend projection', 13, textMuted);

  // Forecast card
  rect(ox + 20, 104, W - 40, 100, surface, { r: 16 });
  text_(ox + 32, 118, 'PROJECTED MONTH-END', 10, textMuted, { bold: true, ls: 1.2 });
  text_(ox + 32, 144, '$61,400', 36, text, { bold: true });
  // confidence badge
  badge(ox + W - 100, 118, '87% CONFIDENCE', `${cyan}22`, cyan, 80, 20);
  text_(ox + 32, 185, '↑ $14.1K over current spend', 12, amber);

  // Chart area
  sectionLabel(col, 218, 'Spend Trajectory');
  rect(ox + 20, 234, W - 40, 160, surface, { r: 12 });
  // Chart axes
  rect(ox + 36, 244, 1, 120, border);
  rect(ox + 36, 364, W - 80, 1, border);
  // Bars — actual (past) + forecast (future)
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr*', 'May*'];
  const vals =   [28,    34,    41,    38,    43,    47,   55,    61  ];
  months.forEach((m, i) => {
    const bx = ox + 44 + i * 37;
    const bH = Math.round(vals[i] * 2.5);
    const isForecast = i >= 6;
    const barColor = isForecast ? `${cyan}55` : accent;
    rect(bx, 364 - bH, 24, bH, barColor, { r: 3 });
    if (isForecast) {
      // dashed border effect
      rect(bx, 364 - bH, 24, 2, cyan, { r: 1 });
    }
    text_(bx + 12, 370, m, 8, textMuted, { anchor: 'middle' });
  });
  // Legend
  rect(ox + 36, 386, 10, 10, accent, { r: 2 });
  text_(ox + 52, 386, 'Actual', 10, textMuted);
  rect(ox + 100, 386, 10, 10, `${cyan}55`, { r: 2 });
  text_(ox + 116, 386, 'Forecast', 10, textMuted);

  // Optimization suggestions
  sectionLabel(col, 408, 'Savings Opportunities');
  const tips = [
    { action: 'Reserved Instances', save: '-$4,200/mo', ease: 'Quick Win' },
    { action: 'Right-size EC2 x12', save: '-$1,840/mo', ease: 'Moderate' },
    { action: 'S3 Lifecycle Rules', save: '-$620/mo', ease: 'Easy' },
  ];
  tips.forEach((tip, i) => {
    const ty = 424 + i * 62;
    rect(ox + 20, ty, W - 40, 54, surface, { r: 12 });
    rect(ox + 20, ty, 4, 54, green, { r: 2 });
    text_(ox + 36, ty + 10, tip.action, 13, text, { bold: false });
    text_(ox + 36, ty + 30, tip.ease, 11, textMuted);
    text_(ox + W - 32, ty + 16, tip.save, 14, green, { bold: true, anchor: 'end' });
  });

  ['Overview', 'Services', 'Anomaly', 'Forecast', 'Alerts'].forEach((l, i) => navItem(col, i, l, l, i === 3));
}

// ─── SCREEN 5: Team Alerts ────────────────────────────────────────────────────
function screen5() {
  const col = 4, ox = W * 4;
  screenBase(col);
  statusBar(col);

  text_(ox + 20, 56, 'Team Alerts', 22, text, { bold: true });
  text_(ox + 20, 82, '2 active · 5 resolved this week', 13, textMuted);

  // Alert policy toggles
  sectionLabel(col, 108, 'Alert Policies');
  const policies = [
    { name: 'Daily Spend > Budget', val: '$2,500/day', on: true },
    { name: 'Anomaly Threshold', val: '2.5× baseline', on: true },
    { name: 'New Service Created', val: 'Any region', on: false },
    { name: 'Budget 80% Reached', val: 'Monthly', on: true },
  ];
  policies.forEach((p, i) => {
    const py = 124 + i * 56;
    rect(ox + 20, py, W - 40, 48, surface, { r: 12 });
    text_(ox + 32, py + 10, p.name, 13, text);
    text_(ox + 32, py + 28, p.val, 11, textMuted);
    // Toggle
    const togBg = p.on ? accent : border;
    rect(ox + W - 72, py + 13, 40, 22, togBg, { r: 11 });
    rect(ox + W - 72 + (p.on ? 20 : 2), py + 15, 18, 18, white, { r: 9 });
  });

  // Notification channels
  sectionLabel(col, 358, 'Notification Channels');
  const channels = [
    { name: 'Slack #cloud-costs', status: 'Connected', statusColor: green },
    { name: 'PagerDuty (Critical)', status: 'Connected', statusColor: green },
    { name: 'Email Digest', status: 'Paused', statusColor: amber },
  ];
  channels.forEach((ch, i) => {
    const cy2 = 374 + i * 56;
    rect(ox + 20, cy2, W - 40, 48, surface, { r: 12 });
    // icon dot
    rect(ox + 32, cy2 + 16, 16, 16, `${ch.statusColor}33`, { r: 8 });
    rect(ox + 38, cy2 + 22, 4, 4, ch.statusColor, { r: 2 });
    text_(ox + 56, cy2 + 10, ch.name, 13, text);
    text_(ox + 56, cy2 + 28, ch.status, 11, ch.statusColor);
  });

  // Active alerts list
  sectionLabel(col, 544, 'Active Now');
  const active = [
    { title: 'EC2 spike — us-east-1', ago: '2h ago', sev: red },
    { title: 'Lambda anomaly active', ago: '6h ago', sev: amber },
  ];
  active.forEach((al, i) => {
    const ay = 560 + i * 56;
    rect(ox + 20, ay, W - 40, 48, `${al.sev}15`, { r: 12 });
    rect(ox + 20, ay, 3, 48, al.sev, { r: 1 });
    text_(ox + 34, ay + 10, al.title, 13, text, { bold: true });
    text_(ox + 34, ay + 28, al.ago, 11, textMuted);
    badge(ox + W - 92, ay + 13, 'ACTIVE', `${al.sev}22`, al.sev, 60, 22);
  });

  ['Overview', 'Services', 'Anomaly', 'Forecast', 'Alerts'].forEach((l, i) => navItem(col, i, l, l, i === 4));
}

// ─── Build all screens ────────────────────────────────────────────────────────
screen1();
screen2();
screen3();
screen4();
screen5();

// ─── Assemble pen ─────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'SHADE — cloud cost intelligence',
  width: TOTAL_W,
  height: H,
  fill: bg,
  children: nodes,
};

fs.writeFileSync('shade.pen', JSON.stringify(pen, null, 2));
console.log(`✓ shade.pen written — ${nodes.length} nodes, ${SCREENS} screens`);
