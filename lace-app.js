'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'lace';
const NAME = 'LACE';
const TAGLINE = 'Creative studio operations, elegantly structured';
const HEARTBEAT = 54;
const W = 390;
const H = 844;

// ── Silent Luxury Light Palette ──────────────────────────────────────────────
const P = {
  bg:      '#FAF8F4',   // warm parchment
  surf:    '#FFFFFF',
  card:    '#F2EEE8',   // warm cream card
  card2:   '#EDE7DE',   // deeper cream
  border:  '#DDD6CA',
  text:    '#1A1510',
  textSec: '#6B5F55',
  textMut: '#A0948A',
  acc:     '#2A4038',   // deep forest green
  accLt:   '#3D5E52',   // lighter green
  acc2:    '#B87333',   // warm copper
  acc2Lt:  '#D4956A',   // lighter copper
  green:   '#4A7C6B',
  greenLt: '#EAF2EE',
  amber:   '#C89A3E',
  amberLt: '#FBF3E0',
  red:     '#9B3A2E',
  redLt:   '#FDECEA',
  white:   '#FFFFFF',
};

let elements = [];

function el(type, props) {
  elements.push({ type, ...props });
}

function rect(x, y, w, h, fill, opts = {}) {
  el('rect', { x, y, width: w, height: h, fill,
    rx: opts.rx || 0, opacity: opts.opacity || 1,
    stroke: opts.stroke || 'none', strokeWidth: opts.sw || 0 });
}

function text(x, y, content, size, fill, opts = {}) {
  el('text', { x, y, content, fontSize: size, fill,
    fontWeight: opts.fw || 400, fontFamily: opts.font || 'Georgia, serif',
    textAnchor: opts.anchor || 'start', letterSpacing: opts.ls || 0,
    opacity: opts.opacity || 1 });
}

function circle(cx, cy, r, fill, opts = {}) {
  el('circle', { cx, cy, r, fill, opacity: opts.opacity || 1,
    stroke: opts.stroke || 'none', strokeWidth: opts.sw || 0 });
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  el('line', { x1, y1, x2, y2, stroke, strokeWidth: opts.sw || 1,
    opacity: opts.opacity || 1 });
}

// ── SVG helpers ──────────────────────────────────────────────────────────────
function buildSVG(els) {
  const tags = els.map(e => {
    if (e.type === 'rect')
      return `<rect x="${e.x}" y="${e.y}" width="${e.width}" height="${e.height}" fill="${e.fill}" rx="${e.rx}" opacity="${e.opacity}" stroke="${e.stroke}" stroke-width="${e.strokeWidth}"/>`;
    if (e.type === 'text')
      return `<text x="${e.x}" y="${e.y}" font-size="${e.fontSize}" fill="${e.fill}" font-weight="${e.fontWeight}" font-family="${e.fontFamily}" text-anchor="${e.textAnchor}" letter-spacing="${e.letterSpacing}" opacity="${e.opacity}">${String(e.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    if (e.type === 'circle')
      return `<circle cx="${e.cx}" cy="${e.cy}" r="${e.r}" fill="${e.fill}" opacity="${e.opacity}" stroke="${e.stroke}" stroke-width="${e.strokeWidth}"/>`;
    if (e.type === 'line')
      return `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${e.stroke}" stroke-width="${e.strokeWidth}" opacity="${e.opacity}"/>`;
    return '';
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n${tags.join('\n')}\n</svg>`;
}

// ── Reusable components ──────────────────────────────────────────────────────

function statusBar(label = 'LACE') {
  rect(0, 0, W, 44, P.bg);
  text(16, 28, '9:41', 13, P.text, { fw: 500, font: 'system-ui, sans-serif' });
  text(W/2, 28, label, 13, P.text, { fw: 600, anchor: 'middle', font: 'system-ui, sans-serif', ls: 2 });
  text(W - 16, 28, '●●●', 11, P.text, { anchor: 'end', font: 'system-ui, sans-serif', opacity: 0.6 });
}

function bottomNav(active) {
  const NAV_H = 82;
  rect(0, H - NAV_H, W, NAV_H, P.surf);
  line(0, H - NAV_H, W, H - NAV_H, P.border, { sw: 0.5 });

  const tabs = [
    { id: 'dash',     label: 'Studio',   icon: '⬡' },
    { id: 'projects', label: 'Projects', icon: '▦' },
    { id: 'clients',  label: 'Clients',  icon: '◈' },
    { id: 'team',     label: 'Team',     icon: '◯' },
    { id: 'insights', label: 'Insight',  icon: '◉' },
  ];

  const tabW = W / tabs.length;
  tabs.forEach((tab, i) => {
    const cx = tabW * i + tabW / 2;
    const isActive = tab.id === active;
    const col = isActive ? P.acc : P.textMut;
    text(cx, H - NAV_H + 28, tab.icon, 18, col, { anchor: 'middle', font: 'system-ui, sans-serif' });
    text(cx, H - NAV_H + 48, tab.label, 10, col, { anchor: 'middle', fw: isActive ? 600 : 400, font: 'system-ui, sans-serif', ls: 0.5 });
    if (isActive) {
      rect(cx - 16, H - NAV_H + 58, 32, 2, P.acc, { rx: 1 });
    }
  });
}

function sansText(x, y, content, size, fill, opts = {}) {
  text(x, y, content, size, fill, { ...opts, font: 'system-ui, -apple-system, sans-serif' });
}

function serifText(x, y, content, size, fill, opts = {}) {
  text(x, y, content, size, fill, { ...opts, font: 'Georgia, "Times New Roman", serif' });
}

function tag(x, y, label, bg, col) {
  const w = label.length * 6.5 + 16;
  rect(x, y - 12, w, 20, bg, { rx: 10 });
  sansText(x + w/2, y + 2, label, 10, col, { fw: 500, anchor: 'middle' });
  return w;
}

function progressBar(x, y, w, pct, bg, fill, h = 5) {
  rect(x, y, w, h, bg, { rx: h/2 });
  rect(x, y, Math.max(0, w * pct / 100), h, fill, { rx: h/2 });
}

function avatar(cx, cy, r, initial, bg, col) {
  circle(cx, cy, r, bg);
  sansText(cx, cy + 5, initial, r * 0.85, col, { anchor: 'middle', fw: 600 });
}

function divider(y, opacity = 0.5) {
  line(16, y, W - 16, y, P.border, { sw: 0.5, opacity });
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Dashboard (Bento Layout)
// ════════════════════════════════════════════════════════════════════════════
function screen1() {
  elements = [];
  rect(0, 0, W, H, P.bg);

  // Status bar
  statusBar('LACE');

  // ── Header ──────────────────────────────────────────────────────────────
  rect(0, 44, W, 60, P.bg);
  serifText(16, 80, 'Studio Overview', 22, P.text, { fw: 700 });
  sansText(W - 16, 80, 'Apr 2026', 12, P.textSec, { anchor: 'end' });

  // ── Bento Row 1: Two wide metrics ───────────────────────────────────────
  const BX = 12; const BY = 110; const BW = (W - 36) / 2; const BH = 100;

  // Active Projects card
  rect(BX, BY, BW, BH, P.surf, { rx: 14, stroke: P.border, sw: 0.5 });
  sansText(BX + 14, BY + 22, 'ACTIVE', 9, P.textMut, { fw: 600, ls: 1.5 });
  serifText(BX + 14, BY + 58, '12', 38, P.acc, { fw: 700 });
  sansText(BX + 14, BY + 76, 'Projects', 12, P.textSec);
  progressBar(BX + 14, BY + 88, BW - 28, 75, P.card, P.acc);

  // Revenue card
  const card2X = BX + BW + 12;
  rect(card2X, BY, BW, BH, P.acc, { rx: 14 });
  sansText(card2X + 14, BY + 22, 'Q2 REVENUE', 9, 'rgba(255,255,255,0.6)', { fw: 600, ls: 1.5 });
  serifText(card2X + 14, BY + 58, '$184k', 32, P.surf, { fw: 700 });
  sansText(card2X + 14, BY + 76, '+18% vs Q1', 11, 'rgba(255,255,255,0.7)');
  progressBar(card2X + 14, BY + 88, BW - 28, 62, 'rgba(255,255,255,0.2)', 'rgba(255,255,255,0.7)');

  // ── Bento Row 2: Wide + Narrow ───────────────────────────────────────────
  const R2Y = BY + BH + 10;
  const WideW = (W - 36) * 0.62;
  const NarrowW = W - 36 - WideW - 10;

  // Team Capacity wide card
  rect(BX, R2Y, WideW, 88, P.card, { rx: 14, stroke: P.border, sw: 0.5 });
  sansText(BX + 14, R2Y + 20, 'TEAM CAPACITY', 9, P.textMut, { fw: 600, ls: 1.5 });
  const members = [
    { name: 'AK', pct: 85, col: P.acc },
    { name: 'JL', pct: 60, col: P.acc2 },
    { name: 'MT', pct: 95, col: P.red },
  ];
  members.forEach((m, i) => {
    const my = R2Y + 36 + i * 17;
    sansText(BX + 14, my + 5, m.name, 10, P.textSec, { fw: 600 });
    progressBar(BX + 40, my, WideW - 70, m.pct, P.card2, m.col, 7);
    sansText(BX + WideW - 10, my + 5, `${m.pct}%`, 9, m.col, { anchor: 'end', fw: 600 });
  });

  // Overdue narrow card
  rect(BX + WideW + 10, R2Y, NarrowW, 88, P.amberLt, { rx: 14 });
  sansText(BX + WideW + 24, R2Y + 20, 'OVERDUE', 9, P.acc2, { fw: 600, ls: 1.5 });
  serifText(BX + WideW + 24, R2Y + 55, '3', 36, P.acc2, { fw: 700 });
  sansText(BX + WideW + 24, R2Y + 72, 'items', 11, P.acc2, { opacity: 0.7 });

  // ── Bento Row 3: Full-width Upcoming Deadlines ───────────────────────────
  const R3Y = R2Y + 88 + 10;
  rect(BX, R3Y, W - 24, 88, P.surf, { rx: 14, stroke: P.border, sw: 0.5 });
  sansText(BX + 14, R3Y + 22, 'UPCOMING DEADLINES', 9, P.textMut, { fw: 600, ls: 1.5 });

  const deadlines = [
    { name: 'Verona Rebrand', days: 3, status: 'urgent', col: P.red },
    { name: 'ARIA Campaign', days: 8, status: 'on track', col: P.green },
    { name: 'Dunn & Co Website', days: 14, status: 'on track', col: P.green },
  ];
  deadlines.forEach((d, i) => {
    const dy = R3Y + 40 + i * 19;
    circle(BX + 24, dy, 4, d.col);
    sansText(BX + 36, dy + 4, d.name, 12, P.text);
    sansText(W - 28, dy + 4, `${d.days}d`, 11, d.col, { anchor: 'end', fw: 600 });
  });

  // ── Bento Row 4: Two small stat cards ────────────────────────────────────
  const R4Y = R3Y + 88 + 10;
  const SmW = (W - 36) / 2;

  rect(BX, R4Y, SmW, 72, P.greenLt, { rx: 14 });
  sansText(BX + 14, R4Y + 20, 'ON TRACK', 9, P.green, { fw: 600, ls: 1.5 });
  serifText(BX + 14, R4Y + 52, '9/12', 28, P.acc, { fw: 700 });
  sansText(BX + 14, R4Y + 66, 'projects', 10, P.textSec);

  rect(BX + SmW + 12, R4Y, SmW, 72, P.card2, { rx: 14 });
  sansText(BX + SmW + 26, R4Y + 20, 'AVG MARGIN', 9, P.textMut, { fw: 600, ls: 1.5 });
  serifText(BX + SmW + 26, R4Y + 52, '34%', 28, P.text, { fw: 700 });
  sansText(BX + SmW + 26, R4Y + 66, '+2pts vs last Q', 10, P.textSec);

  // Bottom nav
  bottomNav('dash');

  return { name: 'Studio Overview', elements: [...elements], svg: buildSVG(elements) };
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Projects
// ════════════════════════════════════════════════════════════════════════════
function screen2() {
  elements = [];
  rect(0, 0, W, H, P.bg);
  statusBar('LACE');

  // Header
  serifText(16, 80, 'Projects', 22, P.text, { fw: 700 });
  rect(W - 56, 58, 40, 28, P.acc, { rx: 14 });
  sansText(W - 36, 76, '+ New', 11, P.surf, { anchor: 'middle' });

  // Filter pills
  const filters = ['All', 'Active', 'Delivered', 'Paused'];
  let fx = 16;
  filters.forEach((f, i) => {
    const w = f.length * 7 + 22;
    rect(fx, 96, w, 24, i === 0 ? P.acc : P.card2, { rx: 12 });
    sansText(fx + w/2, 112, f, 11, i === 0 ? P.surf : P.textSec, { anchor: 'middle', fw: i === 0 ? 600 : 400 });
    fx += w + 8;
  });

  // Project list
  const projects = [
    { name: 'Verona Rebrand', client: 'Verona Collective', pct: 78, status: 'Active', statusCol: P.green, budget: '$24,000', days: 3, col: P.acc },
    { name: 'ARIA Campaign', client: 'ARIA Wellness', pct: 45, status: 'Active', statusCol: P.green, budget: '$18,500', days: 8, col: P.acc2 },
    { name: 'Dunn & Co Website', client: 'Dunn & Company', pct: 30, status: 'Active', statusCol: P.green, budget: '$32,000', days: 14, col: P.green },
    { name: 'Holloway Annual', client: 'Holloway Trust', pct: 100, status: 'Delivered', statusCol: P.textMut, budget: '$9,800', days: 0, col: P.textMut },
    { name: 'Solstice Identity', client: 'Solstice Studio', pct: 12, status: 'Paused', statusCol: P.amber, budget: '$14,200', days: 22, col: P.amber },
  ];

  projects.forEach((p, i) => {
    const py = 132 + i * 108;
    if (py + 100 > H - 82) return;

    rect(12, py, W - 24, 100, P.surf, { rx: 14, stroke: P.border, sw: 0.5 });

    // Color accent bar
    rect(12, py, 4, 100, p.col, { rx: 2 });

    // Project name + client
    serifText(28, py + 24, p.name, 15, P.text, { fw: 600 });
    sansText(28, py + 42, p.client, 12, P.textSec);

    // Status tag + budget
    const statusW = p.status.length * 6 + 16;
    rect(28, py + 52, statusW, 18, p.statusCol === P.green ? P.greenLt : p.statusCol === P.amber ? P.amberLt : P.card2, { rx: 9 });
    sansText(28 + statusW/2, py + 64, p.status, 9, p.statusCol, { anchor: 'middle', fw: 600 });
    sansText(W - 28, py + 64, p.budget, 12, P.textSec, { anchor: 'end', fw: 500 });

    // Progress bar
    sansText(28, py + 82, `${p.pct}% complete`, 10, P.textMut);
    progressBar(28, py + 87, W - 70, p.pct, P.card, p.col === P.textMut ? P.card2 : p.col, 4);
    sansText(W - 28, py + 82, p.days > 0 ? `${p.days}d left` : 'Done', 10, p.days <= 5 && p.days > 0 ? P.red : P.textMut, { anchor: 'end' });
  });

  bottomNav('projects');
  return { name: 'Projects', elements: [...elements], svg: buildSVG(elements) };
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Client Report View
// ════════════════════════════════════════════════════════════════════════════
function screen3() {
  elements = [];
  rect(0, 0, W, H, P.bg);
  statusBar('LACE');

  // Back + title
  sansText(16, 72, '← Projects', 13, P.acc, { fw: 500 });
  serifText(16, 102, 'Verona Rebrand', 20, P.text, { fw: 700 });
  sansText(16, 120, 'Verona Collective · Due in 3 days', 12, P.textSec);

  // Status banner
  rect(12, 130, W - 24, 52, P.acc, { rx: 14 });
  sansText(28, 152, 'CLIENT FACING', 9, 'rgba(255,255,255,0.6)', { fw: 600, ls: 1.5 });
  sansText(28, 170, 'Report view shared with client', 12, P.surf);
  sansText(W - 28, 161, '▶ Share', 12, 'rgba(255,255,255,0.8)', { anchor: 'end' });

  // Progress overview
  rect(12, 192, W - 24, 80, P.surf, { rx: 14, stroke: P.border, sw: 0.5 });
  sansText(28, 214, 'OVERALL PROGRESS', 9, P.textMut, { fw: 600, ls: 1.5 });
  progressBar(28, 222, W - 56, 78, P.card, P.acc, 8);
  sansText(28, 248, '78% complete', 13, P.text, { fw: 600 });
  sansText(W - 28, 248, '3 days remaining', 12, P.textSec, { anchor: 'end' });
  rect(28, 256, 56, 5, P.card);
  sansText(28, 266, 'Budget: $18,720 / $24,000', 11, P.textMut);

  // Milestones
  sansText(16, 292, 'MILESTONES', 9, P.textMut, { fw: 600, ls: 1.5 });

  const milestones = [
    { label: 'Discovery & Brief', done: true },
    { label: 'Brand Strategy', done: true },
    { label: 'Logo & Mark Design', done: true },
    { label: 'Typography System', done: true },
    { label: 'Color & Motion', done: false, active: true },
    { label: 'Final Delivery', done: false },
  ];

  milestones.forEach((m, i) => {
    const my = 308 + i * 38;
    // connector line
    if (i < milestones.length - 1) line(28, my + 12, 28, my + 38, m.done ? P.acc : P.border, { sw: 2 });
    // dot
    circle(28, my + 6, 8, m.done ? P.acc : m.active ? P.acc2 : P.card2);
    if (m.done) {
      sansText(28, my + 11, '✓', 9, P.surf, { anchor: 'middle', fw: 700 });
    } else if (m.active) {
      circle(28, my + 6, 4, P.surf);
    }
    sansText(46, my + 10, m.label, 13, m.done ? P.textSec : m.active ? P.text : P.textMut,
      { fw: m.active ? 600 : m.done ? 400 : 400 });
    if (m.active) {
      tag(W - 78, my - 1, 'IN PROGRESS', P.amberLt, P.amber);
    }
    if (m.done) {
      sansText(W - 28, my + 10, '✓', 12, P.acc, { anchor: 'end' });
    }
  });

  // Approvals needed
  const approvalY = 308 + milestones.length * 38 + 8;
  rect(12, approvalY, W - 24, 60, P.amberLt, { rx: 14 });
  sansText(28, approvalY + 20, '⚑  APPROVAL NEEDED', 11, P.acc2, { fw: 600 });
  sansText(28, approvalY + 38, 'Color palette — 2 options to review', 12, P.text );
  sansText(W - 28, approvalY + 38, 'Review →', 12, P.acc2, { anchor: 'end', fw: 500 });

  bottomNav('projects');
  return { name: 'Client Report', elements: [...elements], svg: buildSVG(elements) };
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Team Workload
// ════════════════════════════════════════════════════════════════════════════
function screen4() {
  elements = [];
  rect(0, 0, W, H, P.bg);
  statusBar('LACE');

  serifText(16, 80, 'Studio Team', 22, P.text, { fw: 700 });
  sansText(16, 98, '7 members · This week', 13, P.textSec);

  const weekDays = ['M', 'T', 'W', 'T', 'F'];
  const GX = 16; const GY = 116; const GW = W - 32; const colW = GW / 5;
  weekDays.forEach((d, i) => {
    sansText(GX + colW * i + colW/2, GY, d, 11, P.textMut, { anchor: 'middle', fw: 600 });
    if (i === 2) { // today
      rect(GX + colW * i + 6, GY - 14, colW - 12, 18, P.acc, { rx: 9 });
      sansText(GX + colW * i + colW/2, GY, d, 11, P.surf, { anchor: 'middle', fw: 700 });
    }
  });

  const members = [
    { name: 'Asha K.', role: 'Creative Dir', init: 'AK', load: [3, 5, 6, 4, 3], total: 85, overflow: true },
    { name: 'James L.', role: 'Designer', init: 'JL', load: [4, 3, 4, 2, 3], total: 60, overflow: false },
    { name: 'Mari T.', role: 'Strategist', init: 'MT', load: [5, 6, 7, 5, 5], total: 95, overflow: true },
    { name: 'Oliver H.', role: 'Developer', init: 'OH', load: [2, 3, 2, 4, 2], total: 45, overflow: false },
    { name: 'Priya S.', role: 'Copywriter', init: 'PS', load: [4, 4, 3, 3, 4], total: 72, overflow: false },
  ];

  members.forEach((m, i) => {
    const ROW_H = 86; const ry = GY + 18 + i * ROW_H;
    rect(12, ry, W - 24, ROW_H - 6, P.surf, { rx: 12, stroke: P.border, sw: 0.5 });

    // Avatar + name
    const avatarColors = [P.acc, P.acc2, P.red, P.green, P.amber];
    avatar(32, ry + 26, 16, m.init, avatarColors[i], P.surf);
    sansText(56, ry + 22, m.name, 13, P.text, { fw: 600 });
    sansText(56, ry + 38, m.role, 11, P.textSec);

    // Capacity badge
    const capCol = m.total >= 90 ? P.red : m.total >= 75 ? P.amber : P.green;
    const capBg = m.total >= 90 ? P.redLt : m.total >= 75 ? P.amberLt : P.greenLt;
    rect(W - 72, ry + 10, 52, 20, capBg, { rx: 10 });
    sansText(W - 46, ry + 24, `${m.total}%`, 11, capCol, { anchor: 'middle', fw: 700 });

    // Day bars
    const BARS_Y = ry + 52; const BAR_MAX_H = 22;
    m.load.forEach((l, di) => {
      const bx = GX + colW * di + 8;
      const bw = colW - 16;
      const bh = (l / 8) * BAR_MAX_H;
      rect(bx, BARS_Y + BAR_MAX_H - bh, bw, bh, l >= 7 ? P.red : l >= 5 ? P.amber : P.acc, { rx: 2, opacity: di === 2 ? 1 : 0.5 });
    });
  });

  // Overflow alert
  const alertY = GY + 18 + members.length * 86 + 4;
  if (alertY < H - 100) {
    rect(12, alertY, W - 24, 44, P.redLt, { rx: 12 });
    sansText(28, alertY + 16, '⚑', 13, P.red);
    sansText(46, alertY + 16, '2 team members over capacity this week', 12, P.red, { fw: 500 });
    sansText(46, alertY + 30, 'Consider redistributing Verona Rebrand tasks', 11, P.red, { opacity: 0.7 });
  }

  bottomNav('team');
  return { name: 'Team Workload', elements: [...elements], svg: buildSVG(elements) };
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Studio Insights
// ════════════════════════════════════════════════════════════════════════════
function screen5() {
  elements = [];
  rect(0, 0, W, H, P.bg);
  statusBar('LACE');

  serifText(16, 80, 'Insights', 22, P.text, { fw: 700 });

  // Period toggle
  const periods = ['Week', 'Month', 'Quarter'];
  let px = 16;
  periods.forEach((p, i) => {
    const w = p.length * 8 + 20;
    rect(px, 92, w, 24, i === 1 ? P.acc : P.card2, { rx: 12 });
    sansText(px + w/2, 108, p, 11, i === 1 ? P.surf : P.textSec, { anchor: 'middle' });
    px += w + 8;
  });

  // Revenue chart card
  rect(12, 126, W - 24, 140, P.surf, { rx: 16, stroke: P.border, sw: 0.5 });
  sansText(28, 148, 'REVENUE', 9, P.textMut, { fw: 600, ls: 1.5 });
  serifText(28, 174, '$184,200', 28, P.text, { fw: 700 });
  sansText(28, 192, '+18.4% vs last quarter', 12, P.green, { fw: 500 });

  // Simple bar chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr'];
  const vals = [112, 138, 156, 184];
  const maxV = Math.max(...vals);
  const chartX = 28; const chartY = 240; const chartH = 40; const barW = 36;
  months.forEach((m, i) => {
    const bh = (vals[i] / maxV) * chartH;
    const bx = chartX + i * 50;
    rect(bx, chartY + chartH - bh, barW, bh, i === 3 ? P.acc : P.card2, { rx: 4 });
    sansText(bx + 18, chartY + chartH + 14, m, 10, P.textMut, { anchor: 'middle' });
    sansText(bx + 18, chartY + chartH - bh - 4, `${vals[i]}`, 9, i === 3 ? P.acc : P.textMut, { anchor: 'middle', fw: i === 3 ? 600 : 400 });
  });

  // Profitability by service
  rect(12, 278, W - 24, 120, P.surf, { rx: 16, stroke: P.border, sw: 0.5 });
  sansText(28, 300, 'MARGIN BY SERVICE', 9, P.textMut, { fw: 600, ls: 1.5 });

  const services = [
    { name: 'Branding', margin: 42, col: P.acc },
    { name: 'Web Design', margin: 38, col: P.acc2 },
    { name: 'Strategy', margin: 51, col: P.green },
    { name: 'Print', margin: 22, col: P.amber },
  ];
  services.forEach((s, i) => {
    const sy = 314 + i * 20;
    sansText(28, sy + 8, s.name, 11, P.text);
    progressBar(100, sy, W - 144, s.margin * 1.8, P.card, s.col, 8);
    sansText(W - 30, sy + 8, `${s.margin}%`, 11, s.col, { anchor: 'end', fw: 600 });
  });

  // Two stat cards
  const R3Y = 408;
  const SmW2 = (W - 36) / 2;

  rect(12, R3Y, SmW2, 72, P.greenLt, { rx: 14 });
  sansText(26, R3Y + 20, 'UTILISATION', 9, P.green, { fw: 600, ls: 1.5 });
  serifText(26, R3Y + 52, '73%', 28, P.acc, { fw: 700 });
  sansText(26, R3Y + 66, 'team billed hrs', 10, P.textSec );

  rect(SmW2 + 24, R3Y, SmW2, 72, P.card2, { rx: 14 });
  sansText(SmW2 + 38, R3Y + 20, 'NPS SCORE', 9, P.textMut, { fw: 600, ls: 1.5 });
  serifText(SmW2 + 38, R3Y + 52, '72', 28, P.text, { fw: 700 });
  sansText(SmW2 + 38, R3Y + 66, 'client satisfaction', 10, P.textSec);

  // Top client
  rect(12, R3Y + 82, W - 24, 60, P.surf, { rx: 14, stroke: P.border, sw: 0.5 });
  sansText(28, R3Y + 102, 'TOP CLIENT THIS QUARTER', 9, P.textMut, { fw: 600, ls: 1.5 });
  avatar(42, R3Y + 128, 16, 'VC', P.acc, P.surf);
  sansText(66, R3Y + 124, 'Verona Collective', 13, P.text, { fw: 600 });
  sansText(66, R3Y + 139, '$48,600 · 3 active briefs', 11, P.textSec);
  sansText(W - 28, R3Y + 128, '→', 16, P.acc, { anchor: 'end' });

  bottomNav('insights');
  return { name: 'Studio Insights', elements: [...elements], svg: buildSVG(elements) };
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 6 — Presentation / Work Showcase
// ════════════════════════════════════════════════════════════════════════════
function screen6() {
  elements = [];
  rect(0, 0, W, H, P.bg);
  statusBar('LACE');

  sansText(16, 72, '← Verona Rebrand', 13, P.acc, { fw: 500 });
  serifText(16, 100, 'Work for Review', 20, P.text, { fw: 700 });
  sansText(16, 118, 'Round 3 · 4 items awaiting approval', 12, P.textSec);

  // Large preview card
  rect(12, 130, W - 24, 180, P.acc, { rx: 16 });
  // Simulated logo comp
  rect(40, 155, 120, 50, 'rgba(255,255,255,0.12)', { rx: 8 });
  serifText(100, 188, 'VERONA', 22, P.surf, { fw: 700, anchor: 'middle', ls: 6 });
  rect(180, 160, 80, 40, 'rgba(255,255,255,0.08)', { rx: 8 });
  serifText(220, 185, 'V', 28, 'rgba(255,255,255,0.5)', { fw: 700, anchor: 'middle' });
  sansText(W/2, 255, 'Primary Logo Mark', 13, 'rgba(255,255,255,0.6)', { anchor: 'middle' });
  sansText(W/2, 272, 'Click to zoom', 11, 'rgba(255,255,255,0.4)', { anchor: 'middle' });
  rect(12, 285, W - 24, 25, 'rgba(0,0,0,0.2)', { rx: '0 0 16 16' });
  sansText(28, 301, '1 of 4', 11, 'rgba(255,255,255,0.5)');
  sansText(W - 28, 301, '○ ● ○ ○', 11, 'rgba(255,255,255,0.5)', { anchor: 'end' });

  // Colour palette strip
  sansText(16, 330, 'BRAND PALETTE', 9, P.textMut, { fw: 600, ls: 1.5 });
  const swatches = ['#2A4038', '#B87333', '#FAF8F4', '#1A1510', '#4A7C6B'];
  swatches.forEach((s, i) => {
    rect(16 + i * 68, 340, 58, 40, s, { rx: 8, stroke: P.border, sw: 0.5 });
  });

  // Typography specimen
  rect(12, 392, W - 24, 76, P.surf, { rx: 14, stroke: P.border, sw: 0.5 });
  sansText(28, 412, 'TYPOGRAPHY', 9, P.textMut, { fw: 600, ls: 1.5 });
  serifText(28, 440, 'Aa Bb Cc', 24, P.text, { fw: 400 });
  sansText(28, 460, 'Cormorant · Body: Inter 400', 11, P.textSec);
  sansText(W - 28, 440, 'Aa', 18, P.textMut, { anchor: 'end', font: 'system-ui, sans-serif' });

  // Comments / feedback
  sansText(16, 482, 'CLIENT COMMENTS', 9, P.textMut, { fw: 600, ls: 1.5 });

  const comments = [
    { init: 'SC', name: 'Sofia C.', time: '2h ago', text: 'Love option A. Can we try copper on cream?', col: P.acc2 },
    { init: 'R',  name: 'Asha K.', time: '1h ago', text: 'Updated → see revised palette above', col: P.acc },
  ];

  comments.forEach((c, i) => {
    const cy = 496 + i * 70;
    rect(12, cy, W - 24, 62, P.surf, { rx: 12, stroke: P.border, sw: 0.5 });
    avatar(30, cy + 20, 12, c.init, c.col, P.surf);
    sansText(48, cy + 16, c.name, 12, P.text, { fw: 600 });
    sansText(W - 28, cy + 16, c.time, 10, P.textMut, { anchor: 'end' });
    sansText(48, cy + 32, c.text, 12, P.textSec);
    sansText(48, cy + 50, '↩ Reply', 11, P.acc, { fw: 500 });
  });

  // Approve CTA
  const ctaY = 496 + comments.length * 70 + 8;
  if (ctaY < H - 90) {
    rect(12, ctaY, W - 24, 44, P.acc, { rx: 22 });
    sansText(W/2, ctaY + 26, 'Request Client Approval', 14, P.surf, { anchor: 'middle', fw: 600 });
  }

  bottomNav('projects');
  return { name: 'Work for Review', elements: [...elements], svg: buildSVG(elements) };
}

// ── Build + write ────────────────────────────────────────────────────────────
const screens = [screen1(), screen2(), screen3(), screen4(), screen5(), screen6()];
const totalElements = screens.reduce((s, sc) => s + sc.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    tagline: TAGLINE,
    author: 'RAM',
    date: new Date().toISOString(),
    theme: 'light',
    heartbeat: HEARTBEAT,
    elements: totalElements,
    palette: {
      bg: P.bg, surface: P.surf, text: P.text,
      accent: P.acc, accent2: P.acc2, muted: P.textMut,
    },
    archetype: 'creative-ops',
    inspiration: 'Bento card layouts (Land-book 2026) + Silent luxury warm cream palette (Minimal.gallery)',
  },
  screens: screens.map(sc => ({
    name: sc.name,
    svg: sc.svg,
    elements: sc.elements,
  })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
