'use strict';
// VELO — Premium cycling training companion
// Heartbeat #400 · Light theme
// Inspired by: minimal.gallery "Paper" editorial restraint + Saaspo component-grid collage trend
// Theme: Warm editorial — off-white paper, forest green accent, amber gold highlights
// Canvas: 390×844 mobile

const fs   = require('fs');
const path = require('path');

const SLUG = 'velo';
const W = 390, H = 844;

// Palette — warm editorial light
const BG      = '#F8F5F0';
const SURF    = '#FFFFFF';
const CARD    = '#F2EDE6';
const TEXT    = '#1A1510';
const TEXT2   = '#5C5248';
const ACC     = '#2E5E3E';  // forest green
const ACC2    = '#C17A2E';  // warm amber/gold
const MUTED   = 'rgba(26,21,16,0.35)';
const BORDER  = 'rgba(26,21,16,0.10)';
const GLOW    = 'rgba(46,94,62,0.08)';

// ── primitives ──────────────────────────────────────────────────────────────

function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, width: w, height: h, fill,
    rx: opts.rx ?? 0,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none',
    strokeWidth: opts.sw ?? 0,
  };
}

function text(x, y, content, size, fill, opts = {}) {
  return {
    type: 'text', x, y, content: String(content), fontSize: size, fill,
    fontWeight: opts.fw ?? 400,
    fontFamily: opts.font ?? 'Inter, sans-serif',
    textAnchor: opts.anchor ?? 'start',
    letterSpacing: opts.ls ?? 0,
    opacity: opts.opacity ?? 1,
  };
}

function circle(cx, cy, r, fill, opts = {}) {
  return {
    type: 'circle', cx, cy, r, fill,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none',
    strokeWidth: opts.sw ?? 0,
  };
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  return { type: 'line', x1, y1, x2, y2, stroke, strokeWidth: opts.sw ?? 1, opacity: opts.opacity ?? 1 };
}

// ── shared components ────────────────────────────────────────────────────────

function statusBar(els) {
  els.push(rect(0, 0, W, 44, BG));
  els.push(text(20, 30, '9:41', 14, TEXT, { fw: 600 }));
  els.push(text(W - 20, 30, '●●●', 12, TEXT2, { anchor: 'end', opacity: 0.5 }));
}

function navBar(els, activeIdx) {
  const labels = ['Ride', 'Train', 'Stats', 'Goals', 'Profile'];
  const icons  = ['◉', '◈', '◇', '◎', '◯'];
  const bw = W / labels.length;
  els.push(rect(0, H - 80, W, 80, SURF, { stroke: BORDER, sw: 0.5 }));
  labels.forEach((lbl, i) => {
    const cx = bw * i + bw / 2;
    const active = i === activeIdx;
    els.push(text(cx, H - 50, icons[i], 18, active ? ACC : TEXT2, { anchor: 'middle', opacity: active ? 1 : 0.5 }));
    els.push(text(cx, H - 28, lbl, 9, active ? ACC : TEXT2, { anchor: 'middle', fw: active ? 600 : 400, ls: 0.5 }));
    if (active) els.push(rect(cx - 12, H - 80, 24, 2, ACC, { rx: 1 }));
  });
}

function sectionHead(els, y, label) {
  els.push(text(20, y, label.toUpperCase(), 9, TEXT2, { fw: 600, ls: 2 }));
  return y + 20;
}

function metricPill(els, x, y, val, lbl, color = ACC) {
  // Small pill metric
  els.push(rect(x, y, 90, 50, CARD, { rx: 10 }));
  els.push(text(x + 12, y + 22, val, 16, color, { fw: 700 }));
  els.push(text(x + 12, y + 38, lbl, 9, TEXT2, { fw: 400 }));
}

function divider(els, y) {
  els.push(line(20, y, W - 20, y, BORDER, { sw: 0.5 }));
  return y + 1;
}

// ── SCREEN 1: Dashboard ──────────────────────────────────────────────────────
function screen1() {
  const els = [];

  // Background
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  // Header
  els.push(text(20, 72, 'Good morning,', 13, TEXT2));
  els.push(text(20, 96, 'Marcus.', 32, TEXT, { fw: 700, font: 'Georgia, serif' }));

  // Hero metric card — editorial spotlight
  els.push(rect(20, 116, W - 40, 160, SURF, { rx: 16, stroke: BORDER, sw: 0.5 }));
  // Subtle glow behind card
  els.push(rect(30, 126, W - 60, 140, GLOW, { rx: 12, opacity: 0.6 }));
  // "Ride this week" label
  els.push(text(36, 148, 'THIS WEEK', 8, TEXT2, { fw: 600, ls: 2 }));
  // Big number — editorial serif treatment
  els.push(text(36, 198, '247', 64, ACC, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(36, 216, 'km', 16, TEXT2, { fw: 400 }));
  // Sub metrics
  els.push(text(160, 198, '8h 42m', 20, TEXT, { fw: 600 }));
  els.push(text(160, 218, 'ride time', 9, TEXT2));
  els.push(text(280, 198, '3,840', 20, TEXT, { fw: 600 }));
  els.push(text(280, 218, 'kcal', 9, TEXT2));
  // Trend mini-bar strip
  const barW = 8, barGap = 4, bars = [45, 60, 38, 72, 55, 80, 65];
  const barMaxH = 28, barBase = 264;
  bars.forEach((v, i) => {
    const bh = Math.round(barMaxH * v / 100);
    const bx = 36 + i * (barW + barGap);
    els.push(rect(bx, barBase - bh, barW, bh, ACC, { rx: 2, opacity: i === 6 ? 1 : 0.3 }));
  });
  els.push(text(120, 264, 'Mon', 7, TEXT2, { opacity: 0.5 }));
  els.push(text(180, 264, 'Thu', 7, TEXT2, { opacity: 0.5 }));
  els.push(text(232, 264, 'Today', 7, ACC, { fw: 600 }));

  // Activity component grid (4 cards)
  const gridY = 296;
  els.push(sectionHead(els, gridY, 'TODAY'));
  const g2 = gridY + 20;
  // Card 1 — Morning ride
  els.push(rect(20, g2, 165, 100, SURF, { rx: 12, stroke: BORDER, sw: 0.5 }));
  els.push(text(34, g2 + 22, '◈', 16, ACC));
  els.push(text(34, g2 + 42, 'Morning Climb', 11, TEXT, { fw: 600 }));
  els.push(text(34, g2 + 58, '6:30 AM · 42 km', 9, TEXT2));
  els.push(text(34, g2 + 76, '▲ 620m', 9, ACC2, { fw: 600 }));
  // Card 2 — Recovery score
  els.push(rect(205, g2, 165, 100, SURF, { rx: 12, stroke: BORDER, sw: 0.5 }));
  els.push(text(219, g2 + 22, '◉', 16, ACC2));
  els.push(text(219, g2 + 42, 'Recovery', 11, TEXT, { fw: 600 }));
  els.push(text(219, g2 + 58, '87 / 100', 20, ACC, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(219, g2 + 78, 'Excellent', 9, TEXT2));

  // Card 3 — Power
  const g3y = g2 + 110;
  els.push(rect(20, g3y, 165, 90, SURF, { rx: 12, stroke: BORDER, sw: 0.5 }));
  els.push(text(34, g3y + 22, 'Power Zone', 10, TEXT2, { fw: 600, ls: 1 }));
  els.push(text(34, g3y + 48, '234W', 24, TEXT, { fw: 700 }));
  els.push(text(34, g3y + 70, '↑ +8W this month', 9, ACC, { fw: 500 }));
  // Card 4 — TSS
  els.push(rect(205, g3y, 165, 90, SURF, { rx: 12, stroke: BORDER, sw: 0.5 }));
  els.push(text(219, g3y + 22, 'Weekly TSS', 10, TEXT2, { fw: 600, ls: 1 }));
  els.push(text(219, g3y + 48, '482', 24, TEXT, { fw: 700 }));
  els.push(rect(219, g3y + 60, 120, 6, CARD, { rx: 3 }));
  els.push(rect(219, g3y + 60, 96, 6, ACC, { rx: 3 }));  // 80%
  els.push(text(219, g3y + 78, 'of 600 goal', 9, TEXT2));

  // Next ride teaser
  const nry = g3y + 104;
  els.push(rect(20, nry, W - 40, 56, ACC, { rx: 12 }));
  els.push(text(36, nry + 22, '▶', 12, SURF, { opacity: 0.8 }));
  els.push(text(56, nry + 22, "Tomorrow's plan: Interval Session", 12, SURF, { fw: 600 }));
  els.push(text(56, nry + 38, '90 min · FTP +5% target', 9, SURF, { opacity: 0.7 }));

  navBar(els, 0);
  return { name: 'Dashboard', elements: els };
}

// ── SCREEN 2: Ride (Active Tracking) ────────────────────────────────────────
function screen2() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  els.push(text(20, 72, 'LIVE RIDE', 9, ACC, { fw: 700, ls: 3 }));
  els.push(text(20, 96, '02:14:37', 44, TEXT, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(20, 118, 'elapsed', 11, TEXT2));

  // Map placeholder — topographic style
  els.push(rect(0, 132, W, 220, CARD, { rx: 0 }));
  // Topo lines (wavy horizontal stripes)
  const topoColors = [BORDER, 'rgba(46,94,62,0.06)', BORDER, 'rgba(193,122,46,0.08)'];
  for (let i = 0; i < 8; i++) {
    els.push(line(0, 152 + i * 22, W, 152 + i * 22 + (i % 2 === 0 ? 8 : -5), topoColors[i % 4], { sw: 1, opacity: 0.6 }));
  }
  // Route line
  const pts = [[30,300],[80,280],[140,260],[200,290],[260,250],[330,240],[370,270]];
  for (let i = 0; i < pts.length - 1; i++) {
    els.push(line(pts[i][0], pts[i][1], pts[i+1][0], pts[i+1][1], ACC, { sw: 3, opacity: 0.9 }));
  }
  // Current position
  els.push(circle(330, 240, 8, SURF));
  els.push(circle(330, 240, 5, ACC));
  // Distance markers
  els.push(text(30, 310, '0', 8, TEXT2, { opacity: 0.5 }));
  els.push(text(370, 310, '68 km', 8, TEXT2, { opacity: 0.5, anchor: 'end' }));

  // Elevation profile
  const epY = 348;
  els.push(rect(0, epY, W, 60, SURF));
  els.push(text(20, epY + 16, 'Elevation', 8, TEXT2, { fw: 600 }));
  // Mini elevation bars
  const elVals = [10,20,35,50,45,60,72,65,55,40,30,20,15,10];
  elVals.forEach((v, i) => {
    const bx = 20 + i * 24;
    const bh = Math.round(32 * v / 100);
    const isActive = i < 8;
    els.push(rect(bx, epY + 48 - bh, 18, bh, isActive ? ACC : CARD, { rx: 2, opacity: isActive ? 0.7 : 0.4 }));
  });

  // Live stats grid (2×3)
  const lgY = 424;
  const stats = [
    ['32.4 km/h', 'Speed'],
    ['234 W', 'Power'],
    ['81 rpm', 'Cadence'],
    ['142 bpm', 'Heart Rate'],
    ['▲ 1,240 m', 'Elevation'],
    ['48.2 km', 'Distance'],
  ];
  stats.forEach(([val, lbl], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const cx = col === 0 ? 20 : 215;
    const cy = lgY + row * 72;
    els.push(rect(cx, cy, 155, 64, SURF, { rx: 10, stroke: BORDER, sw: 0.5 }));
    els.push(text(cx + 14, cy + 26, val, 15, i % 2 === 0 ? TEXT : ACC2, { fw: 700 }));
    els.push(text(cx + 14, cy + 44, lbl, 9, TEXT2));
  });

  // Stop button
  const stopY = H - 100;
  els.push(rect(W/2 - 36, stopY, 72, 40, ACC, { rx: 20 }));
  els.push(text(W/2, stopY + 25, '■  Stop', 13, SURF, { fw: 600, anchor: 'middle' }));

  navBar(els, 0);
  return { name: 'Active Ride', elements: els };
}

// ── SCREEN 3: Training Plan ──────────────────────────────────────────────────
function screen3() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  els.push(text(20, 70, 'TRAINING', 9, TEXT2, { fw: 700, ls: 3 }));
  els.push(text(20, 96, 'April 2026', 28, TEXT, { fw: 700, font: 'Georgia, serif' }));

  // Week calendar
  const weekY = 116;
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const dates = ['6', '7', '8', '9', '10', '11', '12'];
  const intensities = [0.8, 0.4, 0, 1.0, 0.6, 0.5, 0]; // 0 = rest
  const dw = (W - 40) / 7;

  days.forEach((d, i) => {
    const dx = 20 + i * dw + dw/2;
    const isToday = i === 3;
    if (isToday) {
      els.push(rect(dx - dw/2 + 2, weekY - 4, dw - 4, 68, ACC, { rx: 10 }));
    }
    els.push(text(dx, weekY + 14, d, 10, isToday ? SURF : TEXT2, { anchor: 'middle', fw: isToday ? 700 : 400 }));
    els.push(text(dx, weekY + 34, dates[i], 14, isToday ? SURF : TEXT, { anchor: 'middle', fw: isToday ? 700 : 500 }));
    if (intensities[i] > 0) {
      const dotColor = isToday ? SURF : (intensities[i] > 0.7 ? ACC : ACC2);
      const dotR = 3 + Math.round(intensities[i] * 4);
      els.push(circle(dx, weekY + 55, dotR, dotColor, { opacity: isToday ? 1 : 0.7 }));
    } else {
      els.push(text(dx, weekY + 56, '—', 8, BORDER, { anchor: 'middle' }));
    }
  });

  // This week stats
  const wsY = weekY + 84;
  divider(els, wsY);
  els.push(text(20, wsY + 20, 'Week 15 of 20 · Build Phase', 11, TEXT2));
  els.push(text(W - 20, wsY + 20, '↑ 12% load', 11, ACC, { anchor: 'end', fw: 600 }));

  // Sessions list
  const sessY = wsY + 36;
  const sessions = [
    { day: 'Thu 9', type: 'Interval', name: 'VO₂ Max Repeats', duration: '90 min', tss: 95, tag: 'Hard', color: '#C0392B' },
    { day: 'Fri 10', type: 'Endurance', name: 'Z2 Base Ride', duration: '2h 30m', tss: 80, tag: 'Moderate', color: ACC2 },
    { day: 'Sat 11', type: 'Race Sim', name: 'Tempo Blocks', duration: '2h', tss: 110, tag: 'Very Hard', color: '#8B1A2E' },
    { day: 'Sun 12', type: 'Recovery', name: 'Active Spin', duration: '45 min', tss: 30, tag: 'Easy', color: ACC },
  ];
  sessions.forEach((s, i) => {
    const sy = sessY + i * 104;
    els.push(rect(20, sy, W - 40, 96, SURF, { rx: 12, stroke: BORDER, sw: 0.5 }));
    // Left accent bar
    els.push(rect(20, sy, 4, 96, s.color, { rx: 2 }));
    // Header
    els.push(text(36, sy + 22, s.day, 9, TEXT2));
    els.push(text(36, sy + 42, s.name, 14, TEXT, { fw: 600 }));
    els.push(text(36, sy + 60, s.type, 9, TEXT2, { fw: 500 }));
    // Right side
    els.push(text(W - 36, sy + 22, s.duration, 11, TEXT2, { anchor: 'end' }));
    els.push(text(W - 36, sy + 44, `${s.tss} TSS`, 14, TEXT, { anchor: 'end', fw: 600 }));
    els.push(rect(W - 36 - 55, sy + 68, 55, 18, s.color + '22', { rx: 9 }));
    els.push(text(W - 36 - 28, sy + 80, s.tag, 9, s.color, { anchor: 'middle', fw: 600 }));
  });

  navBar(els, 1);
  return { name: 'Training Plan', elements: els };
}

// ── SCREEN 4: Stats / Performance ───────────────────────────────────────────
function screen4() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  els.push(text(20, 70, 'PERFORMANCE', 9, TEXT2, { fw: 700, ls: 3 }));
  els.push(text(20, 96, 'Your numbers,', 26, TEXT, { fw: 400, font: 'Georgia, serif' }));
  els.push(text(20, 124, 'getting sharper.', 26, ACC, { fw: 700, font: 'Georgia, serif' }));

  // FTP card — hero metric
  const ftpY = 144;
  els.push(rect(20, ftpY, W - 40, 100, SURF, { rx: 14, stroke: ACC, sw: 1 }));
  els.push(text(36, ftpY + 26, 'FTP', 10, TEXT2, { fw: 700, ls: 2 }));
  els.push(text(36, ftpY + 70, '287', 48, ACC, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(110, ftpY + 70, 'W', 20, TEXT2, { fw: 400 }));
  // FTP trend
  const trend = [260, 268, 272, 279, 287];
  const txOff = 220;
  trend.forEach((v, i) => {
    const bh = Math.round(50 * (v - 255) / 40);
    els.push(rect(txOff + i * 22, ftpY + 90 - bh, 14, bh, ACC, { rx: 2, opacity: 0.2 + i * 0.18 }));
  });
  els.push(text(txOff, ftpY + 98, '12 weeks', 8, TEXT2, { opacity: 0.5 }));
  els.push(text(W - 36, ftpY + 36, '↑ 10.4%', 13, ACC, { anchor: 'end', fw: 700 }));
  els.push(text(W - 36, ftpY + 54, 'since Jan', 9, TEXT2, { anchor: 'end' }));
  els.push(text(W - 36, ftpY + 76, '4.1 W/kg', 13, ACC2, { anchor: 'end', fw: 600 }));

  // Power curve
  const pcY = ftpY + 116;
  els.push(sectionHead(els, pcY, 'Power Curve'));
  els.push(rect(20, pcY + 20, W - 40, 120, SURF, { rx: 12 }));
  // Axis
  els.push(line(36, pcY + 124, W - 36, pcY + 124, BORDER, { sw: 0.5 }));
  els.push(line(36, pcY + 36, 36, pcY + 124, BORDER, { sw: 0.5 }));
  // Power curve path (polyline approximation)
  const pcVals = [900, 780, 650, 550, 450, 380, 340, 310, 295, 287];
  const pcLabels = ['5s', '30s', '1m', '5m', '10m', '20m', '30m', '45m', '60m', 'FTP'];
  const pcMaxV = 900, pcMinV = 280;
  const pcW = (W - 80) / (pcVals.length - 1);
  for (let i = 0; i < pcVals.length - 1; i++) {
    const x1 = 36 + i * pcW;
    const x2 = 36 + (i + 1) * pcW;
    const y1 = pcY + 124 - Math.round(80 * (pcVals[i] - pcMinV) / (pcMaxV - pcMinV));
    const y2 = pcY + 124 - Math.round(80 * (pcVals[i+1] - pcMinV) / (pcMaxV - pcMinV));
    els.push(line(x1, y1, x2, y2, ACC, { sw: 2, opacity: 0.8 }));
  }
  pcVals.forEach((v, i) => {
    const cx = 36 + i * pcW;
    const cy = pcY + 124 - Math.round(80 * (v - pcMinV) / (pcMaxV - pcMinV));
    els.push(circle(cx, cy, 3, ACC));
  });
  // Labels
  els.push(text(36, pcY + 136, '5s', 7, TEXT2, { opacity: 0.6 }));
  els.push(text(W - 36, pcY + 136, 'FTP', 7, TEXT2, { opacity: 0.6, anchor: 'end' }));

  // Monthly stats row
  const msY = pcY + 160;
  els.push(sectionHead(els, msY, 'April at a glance'));
  const mstats = [['1,240 km', 'Distance'], ['38h', 'Time'], ['3,200m', 'Climbing'], ['18,400', 'kJ']];
  mstats.forEach(([val, lbl], i) => {
    const mx = 20 + i * 88;
    els.push(rect(mx, msY + 20, 80, 66, SURF, { rx: 10 }));
    els.push(text(mx + 10, msY + 46, val, 12, TEXT, { fw: 700 }));
    els.push(text(mx + 10, msY + 62, lbl, 8, TEXT2));
  });

  // HR zones
  const hzY = msY + 100;
  els.push(sectionHead(els, hzY, 'Heart Rate Zones'));
  const zones = [
    { lbl: 'Z1 Recovery', pct: 8, color: '#7BC8A4' },
    { lbl: 'Z2 Aerobic', pct: 42, color: ACC },
    { lbl: 'Z3 Tempo', pct: 28, color: ACC2 },
    { lbl: 'Z4 Threshold', pct: 16, color: '#E07B39' },
    { lbl: 'Z5 VO₂ Max', pct: 6, color: '#C0392B' },
  ];
  zones.forEach((z, i) => {
    const zy = hzY + 20 + i * 28;
    els.push(text(20, zy + 14, z.lbl, 9, TEXT2));
    els.push(rect(120, zy + 4, W - 160, 12, CARD, { rx: 6 }));
    els.push(rect(120, zy + 4, Math.round((W - 160) * z.pct / 100), 12, z.color, { rx: 6, opacity: 0.85 }));
    els.push(text(W - 36, zy + 15, `${z.pct}%`, 9, TEXT2, { anchor: 'end', fw: 500 }));
  });

  navBar(els, 2);
  return { name: 'Performance Stats', elements: els };
}

// ── SCREEN 5: Goals ─────────────────────────────────────────────────────────
function screen5() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  els.push(text(20, 70, 'GOALS', 9, TEXT2, { fw: 700, ls: 3 }));
  els.push(text(20, 98, 'The climb', 28, TEXT, { fw: 400, font: 'Georgia, serif' }));
  els.push(text(20, 126, 'continues.', 28, ACC, { fw: 700, font: 'Georgia, serif' }));

  // Primary goal — big card
  const pgY = 146;
  els.push(rect(20, pgY, W - 40, 156, SURF, { rx: 14, stroke: ACC, sw: 1 }));
  els.push(rect(20, pgY, W - 40, 4, ACC, { rx: 2 }));
  els.push(text(36, pgY + 28, '🏆 PRIMARY', 8, ACC, { fw: 700, ls: 2 }));
  els.push(text(36, pgY + 52, 'Alpe d\'Huez', 20, TEXT, { fw: 700 }));
  els.push(text(36, pgY + 72, 'Gran Fondo · June 14, 2026', 11, TEXT2));
  divider(els, pgY + 84);
  // Progress circle (simplified)
  els.push(circle(W/2, pgY + 126, 32, CARD));
  els.push(text(W/2, pgY + 121, '73%', 14, ACC, { anchor: 'middle', fw: 700 }));
  els.push(text(W/2, pgY + 135, 'ready', 8, TEXT2, { anchor: 'middle' }));
  // Days left
  els.push(text(W - 36, pgY + 116, '66', 28, TEXT, { anchor: 'end', fw: 700 }));
  els.push(text(W - 36, pgY + 136, 'days left', 9, TEXT2, { anchor: 'end' }));
  // Readiness factors
  els.push(text(36, pgY + 116, 'FTP ✓', 9, ACC, { fw: 600 }));
  els.push(text(36, pgY + 132, 'Climbing ↗', 9, ACC2, { fw: 600 }));
  els.push(text(36, pgY + 148, 'Endurance ✓', 9, ACC, { fw: 600 }));

  // Secondary goals
  const sgY = pgY + 172;
  els.push(sectionHead(els, sgY, 'Milestones'));
  const goals = [
    { name: 'Monthly Distance', target: '1,500 km', cur: '1,240 km', pct: 83, done: false },
    { name: 'FTP 300W', target: '300 W', cur: '287 W', pct: 96, done: false },
    { name: 'Everesting', target: '8,848 m', cur: '8,848 m', pct: 100, done: true },
    { name: 'Century Ride', target: '160 km', cur: '160 km', pct: 100, done: true },
  ];
  goals.forEach((g, i) => {
    const gy = sgY + 20 + i * 80;
    els.push(rect(20, gy, W - 40, 72, SURF, { rx: 12 }));
    if (g.done) els.push(rect(20, gy, 4, 72, ACC, { rx: 2 }));
    else els.push(rect(20, gy, 4, 72, BORDER, { rx: 2 }));
    els.push(text(36, gy + 24, g.name, 13, TEXT, { fw: g.done ? 400 : 600, opacity: g.done ? 0.5 : 1 }));
    if (g.done) {
      els.push(text(W - 36, gy + 24, '✓ Complete', 10, ACC, { anchor: 'end', fw: 600 }));
    } else {
      els.push(text(W - 36, gy + 24, g.cur, 11, TEXT2, { anchor: 'end' }));
    }
    els.push(rect(36, gy + 40, W - 76, 8, CARD, { rx: 4 }));
    els.push(rect(36, gy + 40, Math.round((W - 76) * g.pct / 100), 8, g.done ? ACC : ACC2, { rx: 4, opacity: 0.8 }));
    els.push(text(36, gy + 62, g.target, 9, TEXT2));
    els.push(text(W - 36, gy + 62, `${g.pct}%`, 9, g.done ? ACC : TEXT, { anchor: 'end', fw: 600 }));
  });

  navBar(els, 3);
  return { name: 'Goals', elements: els };
}

// ── SCREEN 6: Profile ────────────────────────────────────────────────────────
function screen6() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  // Editorial hero header — minimal.gallery "Paper" style
  els.push(rect(0, 44, W, 200, SURF));
  divider(els, 244);
  // Avatar circle
  els.push(circle(64, 144, 44, CARD));
  els.push(circle(64, 144, 40, ACC, { opacity: 0.08 }));
  els.push(text(64, 150, 'M', 28, ACC, { anchor: 'middle', fw: 700, font: 'Georgia, serif' }));
  // Name + handle
  els.push(text(124, 122, 'Marcus Reinholt', 18, TEXT, { fw: 700 }));
  els.push(text(124, 142, '@marcus_rides', 11, TEXT2));
  els.push(text(124, 162, 'Paris, France · Since 2021', 10, TEXT2, { opacity: 0.6 }));
  // Rank badge
  els.push(rect(124, 174, 86, 22, ACC + '18', { rx: 11 }));
  els.push(text(167, 189, 'Cat 3 Racer', 9, ACC, { anchor: 'middle', fw: 600 }));
  // Edit
  els.push(rect(W - 80, 118, 56, 28, CARD, { rx: 14 }));
  els.push(text(W - 52, 136, 'Edit', 11, TEXT, { anchor: 'middle' }));

  // Season stats — 3 column
  const ssY = 256;
  const sstats = [['4,820', 'km ridden'], ['142h', 'moving'], ['38,200m', 'climbing']];
  sstats.forEach(([v, l], i) => {
    const sx = 20 + i * 118;
    els.push(text(sx, ssY + 24, v, 16, TEXT, { fw: 700 }));
    els.push(text(sx, ssY + 40, l, 8, TEXT2));
    if (i < 2) els.push(line(sx + 100, ssY + 10, sx + 100, ssY + 46, BORDER, { sw: 0.5 }));
  });

  // Achievements
  const achY = ssY + 60;
  divider(els, achY);
  els.push(sectionHead(els, achY + 8, 'Achievements'));
  const achs = [
    { icon: '⛰', name: 'Everesting', sub: 'Climbed 8,848m in one ride', date: 'Mar 2026' },
    { icon: '⚡', name: 'Power PR', sub: 'New 5-min power: 385W', date: 'Feb 2026' },
    { icon: '🔥', name: '30-Day Streak', sub: '30 consecutive riding days', date: 'Jan 2026' },
    { icon: '🏆', name: 'Gran Fondo Finisher', sub: 'Marmotte 2025 — 7h 12m', date: 'Jul 2025' },
  ];
  achs.forEach((a, i) => {
    const ay = achY + 28 + i * 66;
    els.push(rect(20, ay, W - 40, 58, SURF, { rx: 10 }));
    els.push(text(36, ay + 34, a.icon, 22));
    els.push(text(68, ay + 24, a.name, 13, TEXT, { fw: 600 }));
    els.push(text(68, ay + 40, a.sub, 10, TEXT2));
    els.push(text(W - 36, ay + 24, a.date, 9, TEXT2, { anchor: 'end', opacity: 0.6 }));
  });

  // Strava connect
  const scY = achY + 300;
  els.push(rect(20, scY, W - 40, 44, CARD, { rx: 12 }));
  els.push(text(W/2, scY + 27, '▷  Connected to Strava', 12, TEXT2, { anchor: 'middle' }));

  navBar(els, 4);
  return { name: 'Profile', elements: els };
}

// ── Build pen ────────────────────────────────────────────────────────────────
const screens = [screen1(), screen2(), screen3(), screen4(), screen5(), screen6()];
const totalElements = screens.reduce((n, s) => n + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'VELO — Premium Cycling Companion',
    author: 'RAM',
    date: new Date().toISOString().slice(0, 10),
    theme: 'light',
    heartbeat: 400,
    elements: totalElements,
    palette: { bg: BG, surface: SURF, accent: ACC, accent2: ACC2, text: TEXT },
    inspiration: 'minimal.gallery "Paper" editorial restraint + Saaspo component-grid collage',
    slug: SLUG,
  },
  screens: screens.map(s => ({
    name: s.name,
    width: W,
    height: H,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><!-- ${s.name} --></svg>`,
    elements: s.elements,
  })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`VELO: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
