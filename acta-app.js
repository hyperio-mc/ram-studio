'use strict';
const fs   = require('fs');
const path = require('path');

// ── ACTA — Creative sprint velocity for studios ────────────────────────────
// DARK theme. Deep space black + electric cobalt. Chapter-based navigation.
// Inspired by:
//   - Linear: Change (godly.website featured, Apr 2026) — pure black bg,
//     weight-590 Inter 128px headlines, "Redaction" serif chapter headers,
//     #5E6AD2 purple accent, chapter-scroll architecture
//   - Lusion.co — electric blue #1A2FFB, Aeonik geometric sans at massive
//     scale, lavender-white #F0F1FA, deep cobalt atmosphere
// New pattern: Projects organized as "Acts" not lists/grids. Chapter-style
// sprint navigation. 6 screens.

// ── PALETTE ───────────────────────────────────────────────────────────────
const BG        = '#070A10';
const SURFACE   = '#0F1420';
const SURFACE2  = '#161C2C';
const SURFACE3  = '#1D2438';
const BORDER    = '#1E2740';
const BORDER2   = '#2A3558';
const TEXT      = '#EEF0FF';
const TEXT2     = '#8B96B4';
const TEXT3     = '#4A5578';
const ACCENT    = '#4B6CF7';
const ACCENT2   = '#7C5AF7';
const CYAN      = '#00D2FF';
const GREEN     = '#22D3A8';
const AMBER     = '#F59E0B';
const WHITE     = '#FFFFFF';
const W = 390;
const H = 844;

let elements = [];
let eid = 1;
function uid() { return `el-${eid++}`; }

function rect(x, y, w, h, fill, opts = {}) {
  elements.push({
    id: uid(), type: 'rect',
    x, y, width: w, height: h, fill,
    ...(opts.rx !== undefined ? { rx: opts.rx } : {}),
    ...(opts.stroke ? { stroke: opts.stroke, strokeWidth: opts.strokeWidth || 1 } : {}),
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  });
}

function text(content, x, y, opts = {}) {
  elements.push({
    id: uid(), type: 'text',
    x, y, content,
    fontSize: opts.size || 14,
    fontWeight: opts.weight || '400',
    fontFamily: opts.font || 'Inter',
    fill: opts.color || TEXT,
    textAlign: opts.align || 'left',
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
    ...(opts.letterSpacing !== undefined ? { letterSpacing: opts.letterSpacing } : {}),
    ...(opts.lineHeight !== undefined ? { lineHeight: opts.lineHeight } : {}),
    ...(opts.width !== undefined ? { width: opts.width } : {}),
  });
}

function circle(cx, cy, r, fill, opts = {}) {
  elements.push({
    id: uid(), type: 'ellipse',
    x: cx - r, y: cy - r,
    width: r * 2, height: r * 2, fill,
    ...(opts.stroke ? { stroke: opts.stroke, strokeWidth: opts.strokeWidth || 1 } : {}),
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  });
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  elements.push({
    id: uid(), type: 'line',
    x1, y1, x2, y2,
    stroke, strokeWidth: opts.w || 1,
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  });
}

function statusBar(yy = 0) {
  rect(0, yy, W, 50, BG);
  text('9:41', 18, yy + 18, { size: 15, weight: '600', color: TEXT });
  rect(W - 72, yy + 18, 28, 13, 'none', { stroke: TEXT2, strokeWidth: 1, rx: 3 });
  rect(W - 43, yy + 22, 3, 6, TEXT2, { rx: 1 });
  rect(W - 70, yy + 20, 22, 9, TEXT, { rx: 2 });
  circle(W - 88, yy + 25, 3, TEXT2);
  circle(W - 97, yy + 25, 3, TEXT2);
  circle(W - 106, yy + 25, 3, TEXT2);
}

function bottomNav(active) {
  const navY = H - 80;
  rect(0, navY, W, 80, SURFACE, { stroke: BORDER, strokeWidth: 1 });
  const items = [
    { label: 'Acts', icon: '⬡', id: 'acts' },
    { label: 'Active', icon: '▶', id: 'active' },
    { label: 'Team', icon: '◉', id: 'team' },
    { label: 'Files', icon: '⬚', id: 'files' },
  ];
  const colW = W / items.length;
  items.forEach((item, i) => {
    const cx = colW * i + colW / 2;
    const isActive = item.id === active;
    const col = isActive ? ACCENT : TEXT3;
    if (isActive) {
      rect(cx - 22, navY + 8, 44, 28, ACCENT + '1A', { rx: 8 });
    }
    text(item.icon, cx, navY + 14, { size: 16, color: col, align: 'center' });
    text(item.label, cx, navY + 48, { size: 10, weight: isActive ? '600' : '400', color: col, align: 'center' });
  });
}

function progressPill(x, y, w, pct, color) {
  rect(x, y, w, 4, SURFACE3, { rx: 2 });
  rect(x, y, Math.max(4, Math.round(w * pct / 100)), 4, color, { rx: 2 });
}

function avatarCluster(x, y, initials, colors) {
  initials.forEach((init, i) => {
    circle(x + i * 18, y, 12, colors[i % colors.length]);
    text(init, x + i * 18, y - 5, { size: 8, weight: '700', color: WHITE, align: 'center' });
  });
}

function tag(x, y, label, color) {
  const w = label.length * 6.5 + 16;
  rect(x, y - 10, w, 20, color + '22', { rx: 10 });
  rect(x, y - 10, w, 20, 'none', { stroke: color + '55', strokeWidth: 1, rx: 10 });
  text(label, x + w / 2, y - 3, { size: 10, weight: '500', color: color, align: 'center' });
  return w;
}

function card(x, y, w, h, opts = {}) {
  rect(x, y, w, h, opts.fill || SURFACE2, { rx: opts.rx ?? 14, stroke: opts.stroke || BORDER, strokeWidth: 1 });
}

function glowBar(x, y, w) {
  rect(x, y, w, 2, ACCENT, { rx: 1 });
  rect(x, y - 1, w, 4, ACCENT, { rx: 2, opacity: 0.3 });
}

// ─────────────────────────────────────────────────────────────────────────
// SCREEN 1 — ACTS OVERVIEW
// ─────────────────────────────────────────────────────────────────────────
function screen1() {
  elements = []; eid = 1;
  rect(0, 0, W, H, BG);
  statusBar(0);

  rect(0, 50, W, 64, BG);
  text('ACTA', 24, 72, { size: 22, weight: '800', color: TEXT, letterSpacing: 1 });

  // Studio pill
  rect(W - 106, 62, 86, 24, ACCENT + '22', { rx: 12 });
  rect(W - 106, 62, 86, 24, 'none', { stroke: ACCENT + '55', strokeWidth: 1, rx: 12 });
  circle(W - 94, 74, 5, CYAN);
  text('Studio A', W - 86, 78, { size: 11, weight: '500', color: TEXT2 });

  let y = 120;

  // ── ACT 01 — Brand Identity Overhaul ─────────────────────────────────
  card(16, y, W - 32, 146, { rx: 16 });
  glowBar(16, y, W - 32);

  text('Act 01', 28, y + 20, { size: 10, weight: '600', color: ACCENT, letterSpacing: 1.5 });
  rect(W - 86, y + 11, 62, 18, CYAN + '18', { rx: 9 });
  circle(W - 80, y + 20, 3, CYAN);
  text('LIVE', W - 74, y + 24, { size: 9, weight: '700', color: CYAN });

  text('Brand Identity', 28, y + 40, { size: 19, weight: '700', color: TEXT });
  text('Overhaul', 28, y + 62, { size: 19, weight: '700', color: TEXT });

  text('Meridian Co.', 28, y + 84, { size: 11, color: TEXT2 });
  text('·', 100, y + 84, { size: 11, color: TEXT3 });
  text('Sprint 3 of 5', 110, y + 84, { size: 11, color: TEXT2 });
  text('·', 190, y + 84, { size: 11, color: TEXT3 });
  text('Due Apr 18', 200, y + 84, { size: 11, color: AMBER });

  progressPill(28, y + 102, W - 72, 58, ACCENT);
  text('58%', W - 54, y + 106, { size: 10, weight: '600', color: ACCENT });

  avatarCluster(28, y + 128, ['JL', 'MK', 'RS'], [ACCENT, ACCENT2, GREEN]);
  text('12 tasks open', 88, y + 132, { size: 11, color: TEXT2 });
  text('→', W - 40, y + 132, { size: 14, color: TEXT2 });

  y += 162;

  // ── ACT 02 — Mobile App Launch ────────────────────────────────────────
  card(16, y, W - 32, 130, { rx: 16 });

  text('Act 02', 28, y + 20, { size: 10, weight: '600', color: ACCENT2, letterSpacing: 1.5 });
  rect(W - 102, y + 11, 78, 18, AMBER + '18', { rx: 9 });
  text('AT RISK', W - 92, y + 24, { size: 9, weight: '700', color: AMBER });

  text('Mobile App', 28, y + 40, { size: 19, weight: '700', color: TEXT });
  text('Launch', 28, y + 62, { size: 19, weight: '700', color: TEXT });

  text('Crestline Digital', 28, y + 84, { size: 11, color: TEXT2 });
  text('·', 126, y + 84, { size: 11, color: TEXT3 });
  text('Sprint 1 of 4', 136, y + 84, { size: 11, color: TEXT2 });
  text('·', 214, y + 84, { size: 11, color: TEXT3 });
  text('Due May 2', 224, y + 84, { size: 11, color: TEXT2 });

  progressPill(28, y + 102, W - 72, 22, AMBER);
  text('22%', W - 54, y + 106, { size: 10, weight: '600', color: AMBER });
  text('→', W - 40, y + 118, { size: 14, color: TEXT2 });

  y += 146;

  // ── ACT 03 — Campaign Assets ──────────────────────────────────────────
  card(16, y, W - 32, 130, { rx: 16 });

  text('Act 03', 28, y + 20, { size: 10, weight: '600', color: GREEN, letterSpacing: 1.5 });
  rect(W - 104, y + 11, 80, 18, GREEN + '18', { rx: 9 });
  text('ON TRACK', W - 94, y + 24, { size: 9, weight: '700', color: GREEN });

  text('Campaign', 28, y + 40, { size: 19, weight: '700', color: TEXT });
  text('Assets Q2', 28, y + 62, { size: 19, weight: '700', color: TEXT });

  text('Novo Group', 28, y + 84, { size: 11, color: TEXT2 });
  text('·', 98, y + 84, { size: 11, color: TEXT3 });
  text('Sprint 4 of 4', 108, y + 84, { size: 11, color: TEXT2 });
  text('·', 188, y + 84, { size: 11, color: TEXT3 });
  text('Due Apr 12', 198, y + 84, { size: 11, color: GREEN });

  progressPill(28, y + 102, W - 72, 91, GREEN);
  text('91%', W - 54, y + 106, { size: 10, weight: '600', color: GREEN });
  text('→', W - 40, y + 118, { size: 14, color: TEXT2 });

  // New act CTA
  y += 146;
  rect(16, y, W - 32, 44, 'none', { stroke: BORDER2, strokeWidth: 1, rx: 12 });
  text('+ Begin New Act', W / 2, y + 26, { size: 13, weight: '500', color: TEXT3, align: 'center' });

  bottomNav('acts');
  return elements.slice();
}

// ─────────────────────────────────────────────────────────────────────────
// SCREEN 2 — ACTIVE ACT DEEP-DIVE
// ─────────────────────────────────────────────────────────────────────────
function screen2() {
  elements = []; eid = 1;
  rect(0, 0, W, H, BG);
  statusBar(0);

  // Big chapter header
  rect(0, 50, W, 130, BG);
  text('Act 01', 24, 70, { size: 11, weight: '600', color: ACCENT, letterSpacing: 2 });
  text('Brand', 24, 96, { size: 38, weight: '800', color: TEXT });
  text('Identity', 24, 140, { size: 38, weight: '800', color: TEXT });

  // Electric glow line (Lusion-inspired)
  rect(24, 162, 160, 3, ACCENT, { rx: 1 });
  rect(24, 161, 160, 5, ACCENT, { rx: 2, opacity: 0.25 });

  // Client badge
  rect(192, 153, 92, 22, SURFACE2, { rx: 11, stroke: BORDER });
  text('Meridian Co.', 196, 168, { size: 11, color: TEXT2 });

  let y = 180;

  // Sprint progress bar
  rect(0, y, W, 84, SURFACE);
  line(0, y, W, y, BORDER, { w: 1 });
  line(0, y + 84, W, y + 84, BORDER, { w: 1 });

  text('Sprint 3 of 5', 24, y + 18, { size: 12, weight: '600', color: TEXT2, letterSpacing: 1 });
  text('7 days left', W - 24, y + 18, { size: 12, color: AMBER, align: 'right' });

  [1,2,3,4,5].forEach((n, i) => {
    const cx = 24 + i * 30;
    const done = n <= 2;
    const active = n === 3;
    if (done) {
      circle(cx, y + 55, 9, ACCENT);
      text('✓', cx, y + 59, { size: 9, weight: '700', color: WHITE, align: 'center' });
    } else if (active) {
      circle(cx, y + 55, 11, ACCENT + '22');
      circle(cx, y + 55, 9, ACCENT);
      circle(cx, y + 55, 3, WHITE);
    } else {
      circle(cx, y + 55, 9, SURFACE3);
      text(String(n), cx, y + 59, { size: 9, color: TEXT3, align: 'center' });
    }
    if (i < 4) line(cx + 9, y + 55, cx + 21, y + 55, done ? ACCENT : BORDER, { w: 1.5 });
  });
  text('Execution phase', 172, y + 59, { size: 11, color: TEXT2 });

  y += 92;

  // Task count row
  text('OPEN', 24, y + 14, { size: 10, weight: '700', color: TEXT3, letterSpacing: 1.5 });
  text('12', 64, y + 14, { size: 10, weight: '700', color: AMBER });
  text('IN REVIEW', 118, y + 14, { size: 10, weight: '700', color: TEXT3, letterSpacing: 1.5 });
  text('4', 186, y + 14, { size: 10, weight: '700', color: CYAN });
  text('DONE', 218, y + 14, { size: 10, weight: '700', color: TEXT3, letterSpacing: 1.5 });
  text('18', 254, y + 14, { size: 10, weight: '700', color: GREEN });

  y += 28;

  const tasks = [
    { title: 'Primary wordmark vector', status: 'review', assignee: 'JL', priority: 'high' },
    { title: 'Color system documentation', status: 'open', assignee: 'MK', priority: 'high' },
    { title: 'Type specimen sheet', status: 'open', assignee: 'JL', priority: 'mid' },
    { title: 'Brand usage guidelines', status: 'open', assignee: 'RS', priority: 'low' },
    { title: 'Icon grid system (48 glyphs)', status: 'review', assignee: 'MK', priority: 'mid' },
    { title: 'Lottie animation pack', status: 'open', assignee: 'RS', priority: 'mid' },
  ];

  tasks.forEach((task) => {
    card(16, y, W - 32, 52, { rx: 10 });
    const priColor = task.priority === 'high' ? AMBER : task.priority === 'mid' ? ACCENT : TEXT3;
    circle(32, y + 26, 4, priColor);
    const statColor = task.status === 'review' ? CYAN : task.status === 'open' ? TEXT3 : GREEN;
    rect(42, y + 18, 16, 16, statColor + '22', { rx: 4 });
    text(task.status === 'review' ? '⊙' : '○', 50, y + 30, { size: 10, color: statColor, align: 'center' });
    text(task.title, 66, y + 30, { size: 12, color: TEXT, width: W - 130 });
    circle(W - 38, y + 26, 11, ACCENT + '44');
    text(task.assignee, W - 38, y + 30, { size: 8, weight: '700', color: TEXT2, align: 'center' });
    y += 60;
  });

  bottomNav('active');
  return elements.slice();
}

// ─────────────────────────────────────────────────────────────────────────
// SCREEN 3 — CREATIVE BRIEF
// ─────────────────────────────────────────────────────────────────────────
function screen3() {
  elements = []; eid = 1;
  rect(0, 0, W, H, BG);
  statusBar(0);

  text('←', 24, 72, { size: 20, color: TEXT2 });
  text('Creative Brief', W / 2, 72, { size: 16, weight: '600', color: TEXT, align: 'center' });
  rect(W - 54, 60, 34, 24, SURFACE2, { rx: 8, stroke: BORDER });
  text('Edit', W - 37, 76, { size: 11, color: TEXT2, align: 'center' });

  let y = 100;

  card(16, y, W - 32, 284, { rx: 16 });

  rect(28, y + 16, 58, 18, ACCENT + '22', { rx: 9 });
  text('Act 01', 33, y + 29, { size: 10, weight: '600', color: ACCENT });

  // Editorial heading (Georgia = Redaction stand-in for serif)
  text('Brand Identity', 28, y + 52, { size: 24, weight: '300', color: TEXT, font: 'Georgia' });
  text('Overhaul', 28, y + 80, { size: 24, weight: '300', color: TEXT, font: 'Georgia' });

  line(28, y + 100, W - 44, y + 100, BORDER, { w: 1 });

  text('OBJECTIVE', 28, y + 116, { size: 9, weight: '700', color: TEXT3, letterSpacing: 2 });
  text('Complete visual rebrand for Meridian Co.', 28, y + 132, { size: 12, color: TEXT2, width: W - 56 });
  text('— from identity system to full asset library', 28, y + 150, { size: 12, color: TEXT2, width: W - 56 });
  text('ready for Q2 launch.', 28, y + 168, { size: 12, color: TEXT2 });

  text('DELIVERABLES', 28, y + 192, { size: 9, weight: '700', color: TEXT3, letterSpacing: 2 });
  ['Wordmark + lockup variations', 'Brand color system (12 tokens)', 'Typography specimen', 'Icon set (48 glyphs)'].forEach((d, i) => {
    circle(32, y + 216 + i * 18, 3, ACCENT);
    text(d, 42, y + 220 + i * 18, { size: 12, color: TEXT2 });
  });

  y += 300;

  text('TONE & DIRECTION', 24, y + 12, { size: 9, weight: '700', color: TEXT3, letterSpacing: 2 });
  y += 32;
  let tx = 16;
  ['Modern', 'Premium', 'Minimal', 'Trustworthy', 'Bold'].forEach(tone => {
    const w = tag(tx, y + 8, tone, ACCENT);
    tx += w + 8;
    if (tx > W - 80) { tx = 16; y += 28; }
  });

  y += 28;

  card(16, y, W - 32, 92, { rx: 14 });
  text('CONSTRAINTS', 28, y + 20, { size: 9, weight: '700', color: TEXT3, letterSpacing: 2 });
  [['Budget', '$18,400'], ['Timeline', '6 weeks'], ['Approval rounds', '2 max']].forEach(([k, v], i) => {
    text(k, 28, y + 42 + i * 22, { size: 12, color: TEXT2 });
    text(v, W - 44, y + 42 + i * 22, { size: 12, weight: '600', color: TEXT, align: 'right' });
  });

  bottomNav('active');
  return elements.slice();
}

// ─────────────────────────────────────────────────────────────────────────
// SCREEN 4 — TEAM PULSE
// ─────────────────────────────────────────────────────────────────────────
function screen4() {
  elements = []; eid = 1;
  rect(0, 0, W, H, BG);
  statusBar(0);

  text('Team Pulse', 24, 72, { size: 22, weight: '700', color: TEXT });
  text('Live', W - 24, 72, { size: 13, color: CYAN, align: 'right' });

  rect(16, 88, W - 32, 32, CYAN + '10', { rx: 10, stroke: CYAN + '30' });
  circle(30, 104, 4, CYAN);
  text('3 members actively working now', 42, 108, { size: 12, color: CYAN });

  let y = 136;

  const members = [
    { name: 'Jordan Lee', role: 'Art Director', status: 'active', task: 'Wordmark refinement v4', time: '2h 14m', acts: ['01'], avatar: 'JL', avatarColor: ACCENT },
    { name: 'Maya Kim', role: 'Designer', status: 'active', task: 'Color palette documentation', time: '45m', acts: ['01', '02'], avatar: 'MK', avatarColor: ACCENT2 },
    { name: 'Raj Singh', role: 'Motion', status: 'away', task: 'Icon animation tests', time: '–', acts: ['01'], avatar: 'RS', avatarColor: GREEN },
    { name: 'Priya Tan', role: 'Strategist', status: 'active', task: 'Act 02 brief review', time: '1h 8m', acts: ['02'], avatar: 'PT', avatarColor: AMBER },
  ];

  members.forEach((m) => {
    card(16, y, W - 32, 108, { rx: 14 });

    circle(44, y + 34, 20, m.avatarColor + '33');
    circle(44, y + 34, 18, m.avatarColor);
    text(m.avatar, 44, y + 38, { size: 10, weight: '700', color: WHITE, align: 'center' });

    const dotColor = m.status === 'active' ? CYAN : TEXT3;
    circle(58, y + 17, 5, BG);
    circle(58, y + 17, 4, dotColor);

    text(m.name, 72, y + 26, { size: 14, weight: '600', color: TEXT });
    text(m.role, 72, y + 44, { size: 11, color: TEXT2 });

    if (m.status === 'active') {
      text(m.time, W - 28, y + 26, { size: 11, color: CYAN, align: 'right' });
    }

    rect(28, y + 62, W - 56, 30, SURFACE3, { rx: 8 });
    text('↪', 38, y + 81, { size: 11, color: TEXT3 });
    text(m.task, 52, y + 81, { size: 11, color: TEXT2, width: W - 120 });

    m.acts.forEach((act, ai) => {
      rect(W - 64 + ai * 30, y + 66, 28, 18, ACCENT + '22', { rx: 9 });
      text(`A${act}`, W - 50 + ai * 30, y + 78, { size: 9, weight: '600', color: ACCENT, align: 'center' });
    });

    y += 120;
  });

  bottomNav('team');
  return elements.slice();
}

// ─────────────────────────────────────────────────────────────────────────
// SCREEN 5 — ACT TIMELINE (project arc)
// ─────────────────────────────────────────────────────────────────────────
function screen5() {
  elements = []; eid = 1;
  rect(0, 0, W, H, BG);
  statusBar(0);

  text('← Act 01', 24, 72, { size: 15, color: TEXT2 });
  text('Timeline', W / 2, 72, { size: 16, weight: '600', color: TEXT, align: 'center' });

  rect(16, 88, W - 32, 36, SURFACE2, { rx: 10, stroke: BORDER });
  text('Mar 17 – Apr 28', 32, 110, { size: 12, color: TEXT2 });
  text('42 days total', W - 32, 110, { size: 12, color: TEXT2, align: 'right' });

  let y = 140;
  const barArea = W - 152;
  const barStartX = 140;

  text('SPRINT ARC', 24, y + 14, { size: 9, weight: '700', color: TEXT3, letterSpacing: 2 });

  const sprints = [
    { name: 'Discovery',   start: 0,    width: 0.18, done: true,  color: GREEN },
    { name: 'Concepts',    start: 0.18, width: 0.20, done: true,  color: GREEN },
    { name: 'Execution',   start: 0.38, width: 0.30, done: false, color: ACCENT, active: true },
    { name: 'Refinement',  start: 0.68, width: 0.20, done: false, color: TEXT3 },
    { name: 'Delivery',    start: 0.88, width: 0.12, done: false, color: TEXT3 },
  ];

  sprints.forEach((sp, i) => {
    const rowY = y + 36 + i * 52;
    text(sp.name, 24, rowY + 12, { size: 11, weight: sp.active ? '600' : '400', color: sp.active ? TEXT : TEXT2 });
    text(sp.done ? 'Done' : sp.active ? 'Now' : '–', 24, rowY + 28, {
      size: 10, color: sp.done ? GREEN : sp.active ? CYAN : TEXT3
    });
    rect(barStartX, rowY, barArea, 8, SURFACE3, { rx: 4 });
    const bx = barStartX + Math.round(sp.start * barArea);
    const bw = Math.round(sp.width * barArea);
    if (sp.done || sp.active) {
      rect(bx, rowY, bw, 8, sp.color, { rx: 4 });
    }
    if (sp.active) {
      rect(bx, rowY - 1, bw, 10, ACCENT, { rx: 5, opacity: 0.25 });
      const todayX = barStartX + Math.round((sp.start + sp.width * 0.55) * barArea);
      line(todayX, rowY - 6, todayX, rowY + 14, CYAN, { w: 1.5 });
      rect(todayX - 14, rowY - 18, 28, 14, CYAN + '22', { rx: 4 });
      text('Today', todayX, rowY - 8, { size: 8, color: CYAN, align: 'center' });
    }
  });

  y = y + 36 + sprints.length * 52 + 16;

  text('MILESTONES', 24, y + 12, { size: 9, weight: '700', color: TEXT3, letterSpacing: 2 });

  const milestones = [
    { name: 'Wordmark approved',   date: 'Apr 4',  done: true },
    { name: 'Color system locked', date: 'Apr 11', done: false, active: true },
    { name: 'Full system review',  date: 'Apr 20', done: false },
    { name: 'Client delivery',     date: 'Apr 28', done: false },
  ];

  let msY = y + 32;
  milestones.forEach((ms, i) => {
    if (i < milestones.length - 1) {
      line(46, msY + 12, 46, msY + 42, ms.done ? ACCENT : BORDER2, { w: 1 });
    }
    if (ms.done) {
      circle(46, msY + 6, 6, ACCENT);
      text('✓', 46, msY + 10, { size: 8, weight: '700', color: WHITE, align: 'center' });
    } else if (ms.active) {
      circle(46, msY + 6, 8, ACCENT + '22');
      circle(46, msY + 6, 5, ACCENT);
    } else {
      circle(46, msY + 6, 5, SURFACE3, { stroke: BORDER2, strokeWidth: 1 });
    }
    text(ms.name, 62, msY + 10, { size: 12, color: ms.done ? TEXT2 : ms.active ? TEXT : TEXT3 });
    text(ms.date, W - 24, msY + 10, { size: 11, color: ms.done ? GREEN : ms.active ? ACCENT : TEXT3, align: 'right' });
    msY += 42;
  });

  bottomNav('active');
  return elements.slice();
}

// ─────────────────────────────────────────────────────────────────────────
// SCREEN 6 — DELIVER & HANDOFF
// ─────────────────────────────────────────────────────────────────────────
function screen6() {
  elements = []; eid = 1;
  rect(0, 0, W, H, BG);
  statusBar(0);

  rect(0, 50, W, 122, BG);
  text('Delivery', 24, 72, { size: 10, weight: '600', color: TEXT3, letterSpacing: 2 });
  text('Act 03 —', 24, 98, { size: 30, weight: '800', color: TEXT });
  text('Ready to Ship', 24, 134, { size: 30, weight: '800', color: TEXT });

  // Completion stat (right side)
  rect(W - 84, 76, 68, 68, SURFACE2, { rx: 14, stroke: GREEN + '55' });
  text('91%', W - 50, 108, { size: 20, weight: '800', color: GREEN, align: 'center' });
  text('done', W - 50, 128, { size: 10, color: TEXT2, align: 'center' });

  let y = 186;

  text('HANDOFF CHECKLIST', 24, y, { size: 9, weight: '700', color: TEXT3, letterSpacing: 2 });
  y += 20;

  const checks = [
    { item: 'Final files exported (.AI, .SVG, .PNG)', done: true },
    { item: 'Brand guidelines PDF (v3)', done: true },
    { item: 'Font license files attached', done: true },
    { item: 'Color tokens as CSS variables', done: true },
    { item: 'Icon set packaged (48 glyphs)', done: true },
    { item: 'Lottie animations included', done: false, active: true },
    { item: 'Client walkthrough video', done: false },
  ];

  checks.forEach((ch) => {
    card(16, y, W - 32, 44, { rx: 10 });
    if (ch.done) {
      rect(28, y + 12, 20, 20, GREEN + '22', { rx: 5 });
      rect(28, y + 12, 20, 20, 'none', { stroke: GREEN, strokeWidth: 1, rx: 5 });
      text('✓', 38, y + 26, { size: 11, weight: '700', color: GREEN, align: 'center' });
    } else if (ch.active) {
      rect(28, y + 12, 20, 20, ACCENT + '22', { rx: 5 });
      rect(28, y + 12, 20, 20, 'none', { stroke: ACCENT, strokeWidth: 1.5, rx: 5 });
      text('…', 38, y + 26, { size: 11, color: ACCENT, align: 'center' });
    } else {
      rect(28, y + 12, 20, 20, 'none', { stroke: BORDER2, strokeWidth: 1, rx: 5 });
    }
    text(ch.item, 56, y + 26, { size: 12, color: ch.done ? TEXT2 : ch.active ? TEXT : TEXT3, width: W - 80 });
    y += 52;
  });

  y += 6;
  rect(16, y, W - 32, 52, ACCENT, { rx: 14 });
  text('Send to Client →', W / 2, y + 22, { size: 15, weight: '700', color: WHITE, align: 'center' });
  text('1 item pending · confirm before sending', W / 2, y + 40, { size: 10, color: WHITE, align: 'center', opacity: 0.6 });

  bottomNav('files');
  return elements.slice();
}

// ── ASSEMBLE ──────────────────────────────────────────────────────────────
const screens = [
  { id: 'screen-1', name: 'Acts Overview',    elements: screen1() },
  { id: 'screen-2', name: 'Active Act',        elements: screen2() },
  { id: 'screen-3', name: 'Creative Brief',    elements: screen3() },
  { id: 'screen-4', name: 'Team Pulse',        elements: screen4() },
  { id: 'screen-5', name: 'Act Timeline',      elements: screen5() },
  { id: 'screen-6', name: 'Deliver & Handoff', elements: screen6() },
];

const total = screens.reduce((s, sc) => s + sc.elements.length, 0);
console.log(`Total elements: ${total}`);

const pen = {
  version: '2.8',
  metadata: {
    name: 'ACTA',
    description: 'Creative sprint velocity for studios',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    theme: 'dark',
    palette: { BG, SURFACE, SURFACE2, TEXT, ACCENT, ACCENT2 },
  },
  artboards: screens.map((sc, i) => ({
    id: sc.id,
    name: sc.name,
    width: W,
    height: H,
    x: i * (W + 64),
    y: 0,
    elements: sc.elements,
  })),
};

fs.writeFileSync(path.join(__dirname, 'acta.pen'), JSON.stringify(pen, null, 2));
console.log('✓ acta.pen written');
screens.forEach(sc => console.log(`  · ${sc.name}: ${sc.elements.length} elements`));
