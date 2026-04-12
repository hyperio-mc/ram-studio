// verso-generator.js — Pencil.dev v2.8 pen file generator
// App: Verso — personal quarterly review OS
// Theme: LIGHT — warm cream editorial, inspired by Obsidian (darkmodedesign) + Midday editorial trend

const fs = require('fs');
const path = require('path');

const W = 390, H = 844;

const palette = {
  bg:       '#F5F1EA',
  surface:  '#FFFFFF',
  text:     '#1A1816',
  textMid:  '#4A4642',
  textMute: '#9A9490',
  accent:   '#C27A3C',
  accent2:  '#3A6358',
  amber:    '#E8C070',
  sage:     '#8BAF9E',
  border:   '#E4DFDA',
  cream2:   '#EDE8DF',
};

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function rect(x, y, w, h, fill, opts = {}) {
  return {
    id: makeId(), type: 'rect', x, y, width: w, height: h,
    fill, opacity: opts.opacity ?? 1,
    cornerRadius: opts.r ?? 0,
    stroke: opts.stroke ?? 'transparent',
    strokeWidth: opts.strokeWidth ?? 0,
  };
}

function text(str, x, y, opts = {}) {
  return {
    id: makeId(), type: 'text',
    x, y, text: str,
    fontSize: opts.size ?? 14,
    fontWeight: opts.weight ?? '400',
    fontFamily: opts.font ?? 'Inter',
    fill: opts.color ?? palette.text,
    opacity: opts.opacity ?? 1,
    letterSpacing: opts.ls ?? 0,
    textAlign: opts.align ?? 'left',
    lineHeight: opts.lh ?? 1.4,
  };
}

function line(x1, y1, x2, y2, color, opts = {}) {
  return {
    id: makeId(), type: 'line',
    x1, y1, x2, y2,
    stroke: color,
    strokeWidth: opts.w ?? 1,
    opacity: opts.opacity ?? 1,
  };
}

function circle(cx, cy, r, fill, opts = {}) {
  return {
    id: makeId(), type: 'ellipse',
    x: cx - r, y: cy - r,
    width: r * 2, height: r * 2,
    fill,
    stroke: opts.stroke ?? 'transparent',
    strokeWidth: opts.strokeWidth ?? 0,
    opacity: opts.opacity ?? 1,
  };
}

// ─── Status bar ───────────────────────────────────────────────
function statusBar(fill = palette.bg) {
  return [
    rect(0, 0, W, 50, fill),
    text('9:41', 16, 16, { size: 15, weight: '600', color: palette.text }),
    text('●●●  ▲  ▮▮▮▮', W - 90, 16, { size: 11, color: palette.textMute }),
  ];
}

// ─── Bottom nav ───────────────────────────────────────────────
function bottomNav(active = 0) {
  const items = ['Quarter', 'Wealth', 'Health', 'Work', 'Review'];
  const icons = ['◆', '◈', '◉', '⊕', '✦'];
  const els = [rect(0, H - 80, W, 80, palette.surface)];
  els.push(line(0, H - 80, W, H - 80, palette.border, { w: 1 }));
  items.forEach((label, i) => {
    const x = (W / items.length) * i + (W / items.length) / 2;
    const isActive = i === active;
    els.push(text(icons[i], x - 10, H - 62, {
      size: isActive ? 18 : 15,
      color: isActive ? palette.accent : palette.textMute,
      weight: isActive ? '600' : '400',
    }));
    els.push(text(label, x - (label.length * 3.2), H - 40, {
      size: 9,
      color: isActive ? palette.accent : palette.textMute,
      weight: isActive ? '600' : '400',
      ls: 0.3,
    }));
  });
  return els;
}

// ─── Metric card ─────────────────────────────────────────────
function metricCard(x, y, w, h, label, value, sub, trend, trendUp = true) {
  const els = [
    rect(x, y, w, h, palette.surface, { r: 12, stroke: palette.border, strokeWidth: 1 }),
    text(label.toUpperCase(), x + 14, y + 14, { size: 9, weight: '500', color: palette.textMute, ls: 0.8 }),
    text(value, x + 14, y + 36, { size: 26, weight: '300', font: 'Georgia', color: palette.text }),
    text(sub, x + 14, y + 68, { size: 11, color: palette.textMute }),
  ];
  if (trend) {
    const trendColor = trendUp ? palette.accent2 : '#C25A3A';
    const arrow = trendUp ? '↑' : '↓';
    els.push(rect(x + w - 54, y + 12, 44, 22, trendUp ? 'rgba(58,99,88,0.1)' : 'rgba(194,90,58,0.1)', { r: 11 }));
    els.push(text(arrow + ' ' + trend, x + w - 48, y + 16, { size: 11, weight: '600', color: trendColor }));
  }
  return els;
}

// ─── Progress bar ─────────────────────────────────────────────
function progressBar(x, y, w, label, pct, color = palette.accent) {
  return [
    text(label, x, y, { size: 12, color: palette.textMid }),
    text(pct + '%', x + w - 28, y, { size: 12, weight: '600', color: palette.text }),
    rect(x, y + 20, w, 5, palette.cream2, { r: 3 }),
    rect(x, y + 20, Math.round(w * pct / 100), 5, color, { r: 3 }),
  ];
}

// ─── Sparkline (simple polyline-style via thin rects) ──────────
function sparkBars(x, y, w, h, data, color) {
  const els = [];
  const barW = Math.floor(w / data.length) - 2;
  const maxVal = Math.max(...data);
  data.forEach((v, i) => {
    const bh = Math.round((v / maxVal) * h);
    const bx = x + i * (barW + 2);
    const by = y + h - bh;
    els.push(rect(bx, by, barW, bh, color, { r: 2, opacity: 0.7 + (i / data.length) * 0.3 }));
  });
  return els;
}

// ══════════════════════════════════════════════════════════════
// SCREEN 1: Quarter Overview
// ══════════════════════════════════════════════════════════════
function screen1() {
  const els = [
    rect(0, 0, W, H, palette.bg),
    ...statusBar(),
    // Header — editorial large quarter display
    text('Q1', 18, 58, { size: 68, weight: '300', font: 'Georgia', color: palette.text }),
    text('2026', 18, 128, { size: 28, weight: '300', font: 'Georgia', color: palette.textMute }),
    text('Jan — Mar', 18, 162, { size: 12, color: palette.textMute, ls: 1.5 }),
    // Divider accent
    rect(18, 182, 40, 2, palette.accent),
    // Quarter score pill
    rect(W - 86, 66, 72, 34, palette.accent, { r: 17 }),
    text('86 / 100', W - 78, 76, { size: 11, weight: '600', color: '#FFF' }),
    text('QUARTER SCORE', W - 86, 106, { size: 8, weight: '600', color: palette.textMute, ls: 0.8 }),

    // 2-column metric cards
    ...metricCard(18, 198, 168, 100, 'Net Worth', '$142K', '+$8.4K this quarter', '+6.3%', true),
    ...metricCard(204, 198, 168, 100, 'Health Score', '74', 'Up from 68 last Q', '+8.8%', true),
    ...metricCard(18, 308, 168, 100, 'Deep Work', '142h', '23h above target', '+19%', true),
    ...metricCard(204, 308, 168, 100, 'Sleep Avg', '7.2h', '↓ 0.3h vs last Q', '-3.9%', false),

    // Horizontal section divider
    line(18, 420, W - 18, 420, palette.border),
    text('PILLAR SCORES', 18, 432, { size: 9, weight: '600', color: palette.textMute, ls: 1 }),

    ...progressBar(18, 452, W - 36, 'Wealth', 86, palette.accent),
    ...progressBar(18, 484, W - 36, 'Health', 74, palette.accent2),
    ...progressBar(18, 516, W - 36, 'Work', 91, '#8B7EC8'),
    ...progressBar(18, 548, W - 36, 'Mind', 68, palette.amber),

    // Trend sparkline
    text('QUARTERLY TREND', 18, 582, { size: 9, weight: '600', color: palette.textMute, ls: 1 }),
    ...sparkBars(18, 598, W - 36, 50, [62, 68, 71, 74, 78, 81, 86], palette.accent),

    // Insight strip
    rect(18, 660, W - 36, 54, palette.cream2, { r: 10 }),
    text('✦ Your best quarter in 3 years.', 30, 674, { size: 12, weight: '500', color: palette.text }),
    text('Wealth +6.3% · Work output record high', 30, 694, { size: 11, color: palette.textMid }),

    ...bottomNav(0),
  ];
  return els;
}

// ══════════════════════════════════════════════════════════════
// SCREEN 2: Wealth
// ══════════════════════════════════════════════════════════════
function screen2() {
  const els = [
    rect(0, 0, W, H, palette.bg),
    ...statusBar(),
    text('Wealth', 18, 58, { size: 32, weight: '300', font: 'Georgia', color: palette.text }),
    text('Q1 2026  ·  Jan–Mar', 18, 96, { size: 12, color: palette.textMute, ls: 0.5 }),
    rect(18, 114, 28, 2, palette.accent),

    // Large net worth display
    rect(18, 128, W - 36, 88, palette.surface, { r: 14, stroke: palette.border, strokeWidth: 1 }),
    text('TOTAL NET WORTH', 30, 142, { size: 9, weight: '600', color: palette.textMute, ls: 0.8 }),
    text('$142,840', 30, 160, { size: 34, weight: '300', font: 'Georgia', color: palette.text }),
    text('+ $8,420  ↑  6.3% this quarter', 30, 202, { size: 12, color: palette.accent2, weight: '500' }),

    // Allocation donut (represented as stacked bars)
    text('ALLOCATION', 18, 232, { size: 9, weight: '600', color: palette.textMute, ls: 1 }),
    rect(18, 248, W - 36, 32, palette.cream2, { r: 16 }),
    rect(18, 248, Math.round((W - 36) * 0.44), 32, '#3A6358', { r: 16 }), // stocks 44%
    rect(18 + Math.round((W - 36) * 0.44), 248, Math.round((W - 36) * 0.22), 32, '#C27A3C', {}),
    rect(18 + Math.round((W - 36) * 0.66), 248, Math.round((W - 36) * 0.15), 32, '#8B7EC8', {}),
    rect(18 + Math.round((W - 36) * 0.81), 248, Math.round((W - 36) * 0.19), 32, '#E8C070', { r: 16 }),

    // Legend
    ...['Stocks 44%', 'Real Estate 22%', 'Crypto 15%', 'Cash 19%'].map((label, i) => {
      const colors = ['#3A6358', '#C27A3C', '#8B7EC8', '#E8C070'];
      const col = i % 2;
      const row = Math.floor(i / 2);
      return [
        rect(18 + col * 176, 292 + row * 24, 10, 10, colors[i], { r: 5 }),
        text(label, 34 + col * 176, 292 + row * 24, { size: 11, color: palette.textMid }),
      ];
    }).flat(),

    // Individual accounts
    line(18, 348, W - 18, 348, palette.border),
    text('ACCOUNTS', 18, 360, { size: 9, weight: '600', color: palette.textMute, ls: 1 }),
    ...[
      ['Vanguard 401(k)', '$68,200', '+$2,100', true],
      ['Fidelity Brokerage', '$34,640', '+$3,800', true],
      ['Savings Account', '$27,400', '+$1,200', true],
      ['BTC / ETH Wallet', '$12,600', '+$1,320', true],
    ].map(([name, val, delta, up], i) => {
      const y = 380 + i * 58;
      return [
        rect(18, y, W - 36, 50, palette.surface, { r: 10, stroke: palette.border, strokeWidth: 1 }),
        text(name, 30, y + 10, { size: 13, weight: '500', color: palette.text }),
        text(val, 30, y + 30, { size: 18, weight: '300', font: 'Georgia', color: palette.text }),
        text(delta, W - 80, y + 20, { size: 12, weight: '600', color: up ? palette.accent2 : '#C25A3A' }),
      ];
    }).flat(),

    ...bottomNav(1),
  ];
  return els;
}

// ══════════════════════════════════════════════════════════════
// SCREEN 3: Health
// ══════════════════════════════════════════════════════════════
function screen3() {
  const els = [
    rect(0, 0, W, H, palette.bg),
    ...statusBar(),
    text('Health', 18, 58, { size: 32, weight: '300', font: 'Georgia', color: palette.text }),
    text('Q1 2026  ·  Body & Mind', 18, 96, { size: 12, color: palette.textMute, ls: 0.5 }),
    rect(18, 114, 28, 2, palette.accent2),

    // Score ring (simplified)
    rect(W - 100, 52, 88, 68, palette.surface, { r: 14, stroke: palette.border, strokeWidth: 1 }),
    text('74', W - 68, 66, { size: 28, weight: '300', font: 'Georgia', color: palette.accent2 }),
    text('/ 100', W - 54, 96, { size: 10, color: palette.textMute }),
    text('SCORE', W - 70, 112, { size: 8, weight: '600', color: palette.textMute, ls: 0.6 }),

    // Weekly metrics row
    text('THIS WEEK', 18, 136, { size: 9, weight: '600', color: palette.textMute, ls: 1 }),
    ...[
      ['Steps', '8,240', '↑'],
      ['Sleep', '7.4h', '↑'],
      ['HRV', '58ms', '→'],
    ].map(([label, val, arrow], i) => {
      const x = 18 + i * 120;
      return [
        rect(x, 152, 112, 64, palette.surface, { r: 10, stroke: palette.border, strokeWidth: 1 }),
        text(label, x + 10, y = 164, { size: 9, weight: '600', color: palette.textMute, ls: 0.6 }),
        text(val, x + 10, y + 16, { size: 18, weight: '300', font: 'Georgia', color: palette.text }),
        text(arrow, x + 90, y + 6, { size: 16, color: arrow === '↑' ? palette.accent2 : palette.amber }),
      ];
    }).flat(),

    // Sleep chart
    text('SLEEP  ·  Past 7 days', 18, 232, { size: 9, weight: '600', color: palette.textMute, ls: 1 }),
    ...sparkBars(18, 248, W - 36, 60, [6.5, 7.2, 6.8, 7.8, 7.4, 6.9, 7.4], palette.accent2),
    ...['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => {
      const barW = Math.floor((W - 36) / 7) - 2;
      return text(d, 18 + i * (barW + 2) + barW / 2 - 4, 314, { size: 9, color: palette.textMute });
    }),

    // Habits
    line(18, 334, W - 18, 334, palette.border),
    text('HABITS  ·  Q1 COMPLETION', 18, 346, { size: 9, weight: '600', color: palette.textMute, ls: 1 }),
    ...[
      ['Meditation', 82, palette.accent2],
      ['Exercise 4×/week', 71, palette.accent],
      ['No alcohol', 94, '#8B7EC8'],
      ['Cold shower', 58, palette.amber],
    ].map(([label, pct, color], i) => progressBar(18, 366 + i * 38, W - 36, label, pct, color)).flat(),

    // Body stats
    text('BODY STATS', 18, 528, { size: 9, weight: '600', color: palette.textMute, ls: 1 }),
    ...[
      ['Weight', '176 lbs', '−2.4 lbs'],
      ['Body Fat', '18.2%', '−0.8%'],
      ['VO₂ Max', '44.1', '+0.6'],
    ].map(([label, val, delta], i) => {
      const col = i % 3;
      const x = 18 + col * 118;
      return [
        rect(x, 546, 110, 60, palette.surface, { r: 10, stroke: palette.border, strokeWidth: 1 }),
        text(label, x + 8, 557, { size: 9, weight: '600', color: palette.textMute, ls: 0.5 }),
        text(val, x + 8, 574, { size: 15, weight: '400', font: 'Georgia', color: palette.text }),
        text(delta, x + 8, 594, { size: 10, color: palette.accent2 }),
      ];
    }).flat(),

    // Insight
    rect(18, 618, W - 36, 54, 'rgba(58,99,88,0.08)', { r: 10 }),
    text('✦ Best sleep consistency in 6 months.', 30, 632, { size: 12, weight: '500', color: palette.text }),
    text('Meditation streak: 24 days straight', 30, 652, { size: 11, color: palette.textMid }),

    ...bottomNav(2),
  ];
  return els;
}

// ══════════════════════════════════════════════════════════════
// SCREEN 4: Work
// ══════════════════════════════════════════════════════════════
function screen4() {
  const els = [
    rect(0, 0, W, H, palette.bg),
    ...statusBar(),
    text('Work', 18, 58, { size: 32, weight: '300', font: 'Georgia', color: palette.text }),
    text('Q1 2026  ·  Output & Focus', 18, 96, { size: 12, color: palette.textMute, ls: 0.5 }),
    rect(18, 114, 28, 2, '#8B7EC8'),

    // Key work metrics
    ...metricCard(18, 128, 168, 90, 'Deep Work', '142h', '+23h vs target', '+19%', true),
    ...metricCard(204, 128, 168, 90, 'Shipped', '14', 'features & projects', null, true),

    // Deep work heatmap (simplified bar chart by day of week)
    text('DEEP WORK BY DAY', 18, 234, { size: 9, weight: '600', color: palette.textMute, ls: 1 }),
    ...sparkBars(18, 250, W - 36, 70, [5.2, 6.8, 4.1, 6.2, 5.9, 2.1, 0.8], '#8B7EC8'),
    ...['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => {
      const barW = Math.floor((W - 36) / 7) - 2;
      return text(d, 18 + i * (barW + 2), 328, { size: 8, color: palette.textMute });
    }),

    // Projects
    line(18, 346, W - 18, 346, palette.border),
    text('PROJECTS SHIPPED', 18, 358, { size: 9, weight: '600', color: palette.textMute, ls: 1 }),
    ...[
      ['Verso App v2', 'SHIPPED', '#3A6358'],
      ['Client Portal Redesign', 'SHIPPED', '#3A6358'],
      ['API Integration', 'SHIPPED', '#3A6358'],
      ['Analytics Dashboard', 'IN REVIEW', '#C27A3C'],
      ['Design System Update', 'WIP', '#8B7EC8'],
    ].map(([name, status, color], i) => {
      const y = 376 + i * 50;
      return [
        rect(18, y, W - 36, 42, palette.surface, { r: 8, stroke: palette.border, strokeWidth: 1 }),
        text(name, 30, y + 8, { size: 13, weight: '400', color: palette.text }),
        rect(W - 92, y + 8, 72, 20, color + '22', { r: 10 }),
        text(status, W - 86, y + 12, { size: 9, weight: '700', color, ls: 0.5 }),
      ];
    }).flat(),

    // Focus score
    rect(18, 634, W - 36, 54, 'rgba(139,126,200,0.1)', { r: 10 }),
    text('✦ Record deep work quarter. Focus score 91.', 30, 648, { size: 12, weight: '500', color: palette.text }),
    text('Avg 5.5h deep work / weekday', 30, 668, { size: 11, color: palette.textMid }),

    ...bottomNav(3),
  ];
  return els;
}

// ══════════════════════════════════════════════════════════════
// SCREEN 5: Quarterly Review (AI summary)
// ══════════════════════════════════════════════════════════════
function screen5() {
  const els = [
    rect(0, 0, W, H, palette.bg),
    ...statusBar(),

    // Editorial header
    text('Quarter', 18, 58, { size: 32, weight: '300', font: 'Georgia', color: palette.text }),
    text('Review', 18, 92, { size: 32, weight: '300', font: 'Georgia', color: palette.accent }),
    text('Written by Verso AI  ·  April 1, 2026', 18, 132, { size: 11, color: palette.textMute, ls: 0.3 }),
    rect(18, 150, W - 36, 1, palette.border),

    // Pull quote — large editorial style
    text('"This was the quarter', 18, 166, { size: 18, weight: '300', font: 'Georgia', color: palette.text, lh: 1.5 }),
    text('you became the person', 18, 192, { size: 18, weight: '300', font: 'Georgia', color: palette.text }),
    text('you said you would."', 18, 218, { size: 18, weight: '300', font: 'Georgia', color: palette.accent }),
    rect(18, 245, 3, 80, palette.accent, { r: 2 }),

    // Body text — editorial report feel
    text('Wealth grew 6.3% — your strongest', 30, 252, { size: 13, color: palette.textMid, lh: 1.6 }),
    text('quarter since 2023. You hit savings', 30, 272, { size: 13, color: palette.textMid }),
    text('targets for the first time in 5 quarters.', 30, 292, { size: 13, color: palette.textMid }),

    text('Health improved across every tracked', 30, 322, { size: 13, color: palette.textMid }),
    text('metric. Sleep consistency was the key', 30, 342, { size: 13, color: palette.textMid }),
    text('driver — 24-day meditation streak.', 30, 362, { size: 13, color: palette.textMid }),

    text('Work output hit an all-time high: 142h', 30, 392, { size: 13, color: palette.textMid }),
    text('of deep work, 14 projects delivered.', 30, 412, { size: 13, color: palette.textMid }),

    rect(18, 440, W - 36, 1, palette.border),

    // Three things
    text('THREE THINGS FOR Q2', 18, 456, { size: 9, weight: '700', color: palette.textMute, ls: 1 }),
    ...[
      ['↗', 'Increase HRV above 65ms'],
      ['↗', 'Launch analytics product'],
      ['↗', 'Hit $160K net worth'],
    ].map(([icon, item], i) => [
      text(icon, 18, 476 + i * 34, { size: 14, color: palette.accent2 }),
      text(item, 38, 476 + i * 34, { size: 13, color: palette.text }),
    ]).flat(),

    // Share / export
    rect(18, 582, W - 36, 48, palette.accent, { r: 14 }),
    text('Share Q1 Review →', W / 2 - 70, 602, { size: 14, weight: '600', color: '#FFF' }),

    rect(18, 638, W - 36, 40, palette.surface, { r: 14, stroke: palette.border, strokeWidth: 1 }),
    text('Export as PDF report', W / 2 - 66, 654, { size: 13, color: palette.textMid }),

    ...bottomNav(4),
  ];
  return els;
}

// ══════════════════════════════════════════════════════════════
// Assemble .pen file
// ══════════════════════════════════════════════════════════════
const screens = [
  { id: 'screen-quarter', name: 'Quarter Overview', elements: screen1() },
  { id: 'screen-wealth',  name: 'Wealth',           elements: screen2() },
  { id: 'screen-health',  name: 'Health',            elements: screen3() },
  { id: 'screen-work',    name: 'Work',              elements: screen4() },
  { id: 'screen-review',  name: 'Quarterly Review',  elements: screen5() },
];

const pen = {
  version: '2.8',
  id: makeId(),
  name: 'Verso — Personal Quarterly Review',
  description: 'Light editorial design: warm cream palette, serif display type, quarterly life OS. Inspired by Midday and Obsidian dark-mode editorial aesthetics, inverted to a luxury light theme.',
  canvas: { width: W, height: H, background: palette.bg },
  screens: screens.map(s => ({
    id: s.id,
    name: s.name,
    width: W,
    height: H,
    background: palette.bg,
    elements: s.elements,
  })),
  prototype: {
    startScreen: 'screen-quarter',
    connections: [
      { from: 'screen-quarter', to: 'screen-wealth',  trigger: 'tap', element: 'nav-1' },
      { from: 'screen-wealth',  to: 'screen-health',  trigger: 'tap', element: 'nav-2' },
      { from: 'screen-health',  to: 'screen-work',    trigger: 'tap', element: 'nav-3' },
      { from: 'screen-work',    to: 'screen-review',  trigger: 'tap', element: 'nav-4' },
    ],
  },
  metadata: {
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    tags: ['light', 'editorial', 'serif', 'personal-analytics', 'quarterly-review', 'finance', 'health'],
    palette: {
      bg: palette.bg, surface: palette.surface,
      text: palette.text, accent: palette.accent,
      accent2: palette.accent2,
    },
  },
};

const outPath = path.join(__dirname, 'verso.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log('✓ verso.pen written —', screens.length, 'screens,', screens.reduce((a, s) => a + s.elements.length, 0), 'elements total');
console.log('  Path:', outPath);
