'use strict';
// helio-app.js — HELIO: Longevity Tracker for the Modern Body
//
// Inspired by:
//   • Dawn (lapa.ninja, March 2026) — "Evidence-based AI for mental health"
//     Warm amber → sky blue split-panel photography, gentle conversational UI,
//     cream/warm white background with rich humanist typography. Health apps
//     moving away from cold clinical interfaces toward warm editorial warmth.
//   • Superpower (godly.website, March 2026) — "A new era of personal health"
//     Full-bleed amber photography, dark silhouette + warm backlight glow,
//     bold sans headline "A new era of personal health", pill CTA.
//   • Isa de Burgh (minimal.gallery) — editorial split panel: huge condensed
//     type left + B&W portrait right — teaches vertical rhythm and whitespace.
//
// Challenge: Design a LIGHT-THEME longevity / health optimization app where
// warmth, calm, and editorial spacing replace dashboard clutter. Instead of
// cold blue metrics, use warm amber + sage green on cream. Typography-led
// data: the number IS the hero element, surrounded by generous whitespace.
// 5 screens: Today · Vitals · Sleep · Nutrition · Insights
//
// Palette: warm cream bg + pure white surfaces + deep espresso text +
//          warm amber accent + sage green accent2

const fs = require('fs');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#F8F4EE',   // warm cream — Dawn/Superpower warmth
  surface:  '#FFFFFF',   // pure white cards
  surface2: '#FDF9F4',   // slightly tinted surface
  surface3: '#F2EDE5',   // hovered/selected — warm sand
  border:   '#EAE3D8',   // warm border
  border2:  '#D9D0C2',   // slightly visible border
  fg:       '#1A1614',   // deep espresso — near black with warmth
  fg2:      '#5C4F44',   // secondary text — warm brown
  fg3:      '#9C8C7E',   // muted text — taupe
  fg4:      '#C4B8AC',   // very muted — warm grey
  amber:    '#E8853A',   // warm amber — primary accent
  amberLo:  '#E8853A18', // amber subtle
  amberMid: '#E8853A35', // amber mid
  sage:     '#4E8C6A',   // sage green — secondary accent
  sageLo:   '#4E8C6A18', // sage subtle
  sageMid:  '#4E8C6A30', // sage mid
  rose:     '#C4625A',   // warm rose — alert/stress
  roseLo:   '#C4625A18',
  sky:      '#5B8BAE',   // muted sky blue — from Dawn split
  skyLo:    '#5B8BAE18',
  gold:     '#C9922A',   // deeper amber for icons
  cream:    '#EDE5D8',   // cream — dividers, rings bg
};

let _id = 0;
const uid = () => `hl${++_id}`;

// ── Primitives ─────────────────────────────────────────────────────────────────

function frame(children, opts = {}) {
  const {
    x = 0, y = 0, w = 390, h = 844,
    fill = P.bg, name = uid(), clip = true,
    radius = 0, border, borderColor,
    direction = 'NONE', gap = 0,
    paddingH = 0, paddingV = 0,
    align = 'MIN', justify = 'MIN',
    shadow = false,
  } = opts;
  const node = {
    type: 'FRAME', name, x, y, width: w, height: h,
    fills: fill ? [{ type: 'SOLID', color: hexToRgb(fill) }] : [],
    cornerRadius: radius,
    clipsContent: clip,
    layoutMode: direction,
    itemSpacing: gap,
    paddingLeft: paddingH, paddingRight: paddingH,
    paddingTop: paddingV, paddingBottom: paddingV,
    primaryAxisAlignItems: justify,
    counterAxisAlignItems: align,
    children,
  };
  if (border) { node.strokeWeight = border; node.strokes = [{ type: 'SOLID', color: hexToRgb(borderColor || P.border) }]; }
  if (shadow) {
    node.effects = [{
      type: 'DROP_SHADOW', color: { r: 0.1, g: 0.07, b: 0.04, a: 0.08 },
      offset: { x: 0, y: 2 }, radius: 12, spread: 0, visible: true,
    }];
  }
  return node;
}

function rect(opts = {}) {
  const { x = 0, y = 0, w = 100, h = 100, fill = P.surface, name = uid(), radius = 0, border, borderColor, opacity = 1 } = opts;
  const node = {
    type: 'RECTANGLE', name, x, y, width: w, height: h,
    fills: fill ? [{ type: 'SOLID', color: hexToRgb(fill), opacity }] : [],
    cornerRadius: radius,
    opacity,
  };
  if (border) { node.strokeWeight = border; node.strokes = [{ type: 'SOLID', color: hexToRgb(borderColor || P.border) }]; }
  return node;
}

function text(str, opts = {}) {
  const {
    x = 0, y = 0, w = 300, h = 'auto',
    size = 14, weight = 400, color = P.fg,
    align = 'LEFT', name = uid(),
    lineHeight, letterSpacing = 0, italic = false,
    family = 'Inter',
  } = opts;
  return {
    type: 'TEXT', name, x, y,
    width: w, height: h === 'auto' ? size * 1.4 : h,
    characters: str,
    style: {
      fontFamily: family, fontWeight: weight, fontSize: size,
      textAlignHorizontal: align, letterSpacing,
      lineHeightUnit: lineHeight ? 'PIXELS' : 'AUTO',
      lineHeightPx: lineHeight,
      italic,
    },
    fills: [{ type: 'SOLID', color: hexToRgb(color) }],
  };
}

function circle(opts = {}) {
  const { x = 0, y = 0, r = 40, fill = P.surface, name = uid(), border, borderColor, opacity = 1 } = opts;
  return {
    type: 'ELLIPSE', name, x, y, width: r * 2, height: r * 2,
    fills: fill ? [{ type: 'SOLID', color: hexToRgb(fill), opacity }] : [],
    opacity,
    ...(border ? { strokeWeight: border, strokes: [{ type: 'SOLID', color: hexToRgb(borderColor || P.border) }] } : {}),
  };
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  if (h.length === 8) {
    return { r: parseInt(h.slice(0,2),16)/255, g: parseInt(h.slice(2,4),16)/255, b: parseInt(h.slice(4,6),16)/255, a: parseInt(h.slice(6,8),16)/255 };
  }
  return { r: parseInt(h.slice(0,2),16)/255, g: parseInt(h.slice(2,4),16)/255, b: parseInt(h.slice(4,6),16)/255 };
}

function gradientRect(opts = {}) {
  const { x = 0, y = 0, w = 390, h = 200, from, to, name = uid(), radius = 0, dir = 'TB' } = opts;
  const handles = dir === 'TB'
    ? { start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } }
    : { start: { x: 0, y: 0.5 }, end: { x: 1, y: 0.5 } };
  return {
    type: 'RECTANGLE', name, x, y, width: w, height: h,
    cornerRadius: radius,
    fills: [{
      type: 'GRADIENT_LINEAR',
      gradientHandlePositions: [handles.start, handles.end, { x: 0, y: 1 }],
      gradientStops: [
        { position: 0, color: { ...hexToRgb(from), a: 1 } },
        { position: 1, color: { ...hexToRgb(to), a: 1 } },
      ],
    }],
  };
}

// ── Component Builders ────────────────────────────────────────────────────────

// Status bar (light)
function statusBar() {
  return frame([
    text('9:41', { x: 20, y: 14, size: 15, weight: 600, color: P.fg }),
    text('●●● ▶ ▮▮▮▮▮', { x: 240, y: 14, w: 130, size: 12, weight: 500, color: P.fg2, align: 'RIGHT' }),
  ], { w: 390, h: 44, fill: 'transparent', name: 'StatusBar' });
}

// Tab bar (light)
function tabBar(active = 0) {
  const tabs = [
    { icon: '◎', label: 'Today' },
    { icon: '♥', label: 'Vitals' },
    { icon: '◐', label: 'Sleep' },
    { icon: '◈', label: 'Nutrition' },
    { icon: '↗', label: 'Insights' },
  ];
  const children = [
    rect({ x: 0, y: 0, w: 390, h: 83, fill: P.surface }),
    rect({ x: 0, y: 0, w: 390, h: 1, fill: P.border }),
  ];
  tabs.forEach((tab, i) => {
    const x = 390 / 5 * i;
    const isActive = i === active;
    children.push(
      text(tab.icon, { x: x + 27, y: 12, w: 24, size: 18, color: isActive ? P.amber : P.fg4, align: 'CENTER', name: `tab-icon-${i}` }),
      text(tab.label, { x: x + 4, y: 36, w: 70, size: 10, weight: isActive ? 600 : 400, color: isActive ? P.amber : P.fg3, align: 'CENTER', name: `tab-label-${i}` }),
    );
    if (isActive) {
      children.push(rect({ x: x + 25, y: 54, w: 28, h: 3, fill: P.amber, radius: 2, name: `tab-pip-${i}` }));
    }
  });
  return frame(children, { w: 390, h: 83, fill: 'transparent', name: 'TabBar', y: 761 });
}

// Ring chart (donut arc representation)
function ringChart(opts = {}) {
  const { x = 0, y = 0, outer = 64, inner = 50, pct = 0.72, color = P.amber, bgColor = P.cream, name = uid() } = opts;
  const children = [
    circle({ x, y, r: outer, fill: bgColor, name: `${name}-bg` }),
    circle({ x: x + (outer - inner), y: y + (outer - inner), r: inner, fill: P.surface, name: `${name}-hole` }),
  ];
  // Approximate arc fill with overlay segments
  const filled = Math.round(pct * 8);
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const mx = x + outer + Math.cos(angle) * (outer - 7);
    const my = y + outer + Math.sin(angle) * (outer - 7);
    if (i < filled) {
      children.push(circle({ x: mx - 6, y: my - 6, r: 6, fill: color, name: `${name}-dot-${i}` }));
    }
  }
  return frame(children, { x, y, w: outer * 2, h: outer * 2, fill: 'transparent', name });
}

// Metric card
function metricCard(opts = {}) {
  const { x = 0, y = 0, w = 174, h = 110, label = '', value = '', unit = '', sub = '', color = P.amber, bg = P.surface, name = uid() } = opts;
  return frame([
    rect({ x: 0, y: 0, w, h, fill: bg, radius: 16 }),
    text(label, { x: 16, y: 16, w: w - 32, size: 11, weight: 500, color: P.fg3, name: `${name}-label` }),
    text(value, { x: 16, y: 34, w: w - 50, size: 32, weight: 700, color: P.fg, family: 'Inter', name: `${name}-value` }),
    text(unit, { x: 16, y: 72, w: 60, size: 13, weight: 500, color, name: `${name}-unit` }),
    text(sub, { x: 16, y: 90, w: w - 32, size: 10, color: P.fg3, name: `${name}-sub` }),
  ], { x, y, w, h: h + 4, fill: 'transparent', name });
}

// Section header
function sectionHeader(opts = {}) {
  const { x = 20, y = 0, label = '', action = '', color = P.fg } = opts;
  return frame([
    text(label, { x: 0, y: 0, w: 240, size: 17, weight: 700, color }),
    action ? text(action, { x: 250, y: 2, w: 100, size: 13, weight: 500, color: P.amber, align: 'RIGHT' }) : rect({ w: 0, h: 0, fill: 'transparent' }),
  ], { x, y, w: 350, h: 24, fill: 'transparent' });
}

// Pill badge
function pill(label, opts = {}) {
  const { x = 0, y = 0, color = P.amber, bg = P.amberLo, size = 11, weight = 600 } = opts;
  const w = label.length * 7.5 + 18;
  return frame([
    rect({ x: 0, y: 0, w, h: 24, fill: bg, radius: 12 }),
    text(label, { x: 9, y: 5, w: w - 18, size, weight, color, align: 'CENTER' }),
  ], { x, y, w, h: 24, fill: 'transparent' });
}

// Progress bar
function progressBar(opts = {}) {
  const { x = 0, y = 0, w = 330, pct = 0.7, color = P.amber, label = '', value = '', name = uid() } = opts;
  return frame([
    text(label, { x: 0, y: 0, w: 200, size: 13, weight: 500, color: P.fg2 }),
    text(value, { x: 220, y: 0, w: 110, size: 12, weight: 600, color: P.fg, align: 'RIGHT' }),
    rect({ x: 0, y: 22, w, h: 6, fill: P.cream, radius: 3 }),
    rect({ x: 0, y: 22, w: Math.round(w * pct), h: 6, fill: color, radius: 3 }),
  ], { x, y, w, h: 30, fill: 'transparent', name });
}

// Sleep stage row
function sleepRow(opts = {}) {
  const { x = 0, y = 0, stage = '', hours = '', color = P.sage, pct = 0.4 } = opts;
  const w = 330;
  return frame([
    rect({ x: 0, y: 6, w: 8, h: 8, fill: color, radius: 4 }),
    text(stage, { x: 16, y: 0, w: 100, size: 13, weight: 500, color: P.fg2 }),
    rect({ x: 110, y: 8, w: w - 170, h: 6, fill: P.cream, radius: 3 }),
    rect({ x: 110, y: 8, w: Math.round((w - 170) * pct), h: 6, fill: color, radius: 3 }),
    text(hours, { x: w - 50, y: 0, w: 50, size: 12, weight: 600, color: P.fg, align: 'RIGHT' }),
  ], { x, y, w, h: 24, fill: 'transparent' });
}

// ── Screen 1: Today ────────────────────────────────────────────────────────────
function screenToday() {
  const children = [
    rect({ x: 0, y: 0, w: 390, h: 844, fill: P.bg }),
    statusBar(),
    tabBar(0),

    // Header
    text('Good morning,', { x: 24, y: 56, size: 14, weight: 400, color: P.fg3 }),
    text('Marcus.', { x: 24, y: 76, size: 32, weight: 700, color: P.fg, family: 'Inter' }),

    // Date pill
    ...pill('Mon, March 31', { x: 24, y: 120, color: P.fg3, bg: P.surface3 }).children.map(c => ({ ...c, x: c.x + 24, y: c.y + 120 })),

    // Health Score Card — editorial focal point
    frame([
      gradientRect({ x: 0, y: 0, w: 342, h: 160, from: '#FDF6EE', to: '#F5ECD9', radius: 20 }),
      // Left: score number — BIG editorial number
      text('84', { x: 24, y: 20, size: 72, weight: 800, color: P.fg, family: 'Inter' }),
      text('/ 100', { x: 110, y: 58, size: 16, weight: 400, color: P.fg3 }),
      text('Health Score', { x: 24, y: 102, size: 12, weight: 600, color: P.amber }),
      text('↑ +3 from yesterday', { x: 24, y: 122, size: 11, weight: 400, color: P.sage }),
      // Right: ring
      ...ringChart({ x: 220, y: 18, outer: 56, inner: 42, pct: 0.84, color: P.amber, bgColor: P.cream }).children.map(c => ({
        ...c, x: c.x + 220, y: c.y + 18,
      })),
      // Sub label
      text('Trending upward', { x: 210, y: 128, w: 120, size: 10, color: P.fg3, align: 'CENTER' }),
    ], { x: 24, y: 152, w: 342, h: 160, fill: 'transparent', name: 'HealthScoreCard', shadow: true }),

    // Metric row
    frame([
      metricCard({ x: 0, y: 0, w: 162, h: 100, label: 'STEPS', value: '8,241', unit: 'steps', sub: 'Goal: 10K', color: P.amber }),
      metricCard({ x: 172, y: 0, w: 162, h: 100, label: 'ACTIVE MIN', value: '47', unit: 'min', sub: '↑ Above avg', color: P.sage, bg: P.surface }),
    ], { x: 24, y: 328, w: 342, h: 108, fill: 'transparent', name: 'MetricRow1' }),

    frame([
      metricCard({ x: 0, y: 0, w: 162, h: 100, label: 'HRV', value: '62', unit: 'ms', sub: 'Good recovery', color: P.sage }),
      metricCard({ x: 172, y: 0, w: 162, h: 100, label: 'SLEEP', value: '7h 22m', unit: 'last night', sub: '↑ 94% efficiency', color: P.sky, bg: P.surface }),
    ], { x: 24, y: 444, w: 342, h: 108, fill: 'transparent', name: 'MetricRow2' }),

    // Today's focus
    sectionHeader({ x: 24, y: 566, label: "Today's Focus", action: 'See all' }),

    frame([
      rect({ x: 0, y: 0, w: 342, h: 80, fill: P.surface, radius: 14 }),
      rect({ x: 0, y: 0, w: 4, h: 80, fill: P.amber, radius: 2 }),
      text('Morning Protocol', { x: 16, y: 14, size: 14, weight: 600, color: P.fg }),
      text('Hydration · Sunlight · Cold exposure', { x: 16, y: 36, size: 12, color: P.fg3 }),
      ...pill('6:00 AM', { x: 240, y: 28, color: P.fg3, bg: P.surface3, size: 10 }).children.map(c => ({ ...c, x: c.x + 240, y: c.y + 28 })),
    ], { x: 24, y: 596, w: 342, h: 80, fill: 'transparent', shadow: true }),

    frame([
      rect({ x: 0, y: 0, w: 342, h: 80, fill: P.surface, radius: 14 }),
      rect({ x: 0, y: 0, w: 4, h: 80, fill: P.sage, radius: 2 }),
      text('Zone 2 Cardio', { x: 16, y: 14, size: 14, weight: 600, color: P.fg }),
      text('45 min target · Fasted recommended', { x: 16, y: 36, size: 12, color: P.fg3 }),
      ...pill('7:30 AM', { x: 240, y: 28, color: P.fg3, bg: P.surface3, size: 10 }).children.map(c => ({ ...c, x: c.x + 240, y: c.y + 28 })),
    ], { x: 24, y: 686, w: 342, h: 80, fill: 'transparent', shadow: true }),
  ];

  return frame(children, { x: 0, y: 0, w: 390, h: 844, fill: P.bg, name: 'Screen — Today' });
}

// ── Screen 2: Vitals ──────────────────────────────────────────────────────────
function screenVitals() {
  const children = [
    rect({ x: 0, y: 0, w: 390, h: 844, fill: P.bg }),
    statusBar(),
    tabBar(1),

    // Header
    text('Vitals', { x: 24, y: 56, size: 32, weight: 700, color: P.fg }),
    text('Last synced 4 min ago', { x: 24, y: 98, size: 12, color: P.fg3 }),

    // Hero metric — HRV editorial big number
    frame([
      gradientRect({ x: 0, y: 0, w: 342, h: 180, from: '#F0F5EF', to: '#E8F0E5', radius: 20 }),
      text('HRV', { x: 24, y: 24, size: 11, weight: 700, color: P.sage, letterSpacing: 2 }),
      text('62', { x: 24, y: 42, size: 80, weight: 800, color: P.fg, family: 'Inter' }),
      text('ms', { x: 130, y: 90, size: 20, weight: 400, color: P.fg3 }),
      text('Heart Rate Variability', { x: 24, y: 136, size: 13, weight: 500, color: P.fg2 }),
      text('Optimal range: 55–75ms', { x: 24, y: 156, size: 11, color: P.fg3 }),
      // Trend sparkline (bars)
      ...[0.5, 0.6, 0.55, 0.7, 0.65, 0.8, 0.75, 0.85, 0.7, 0.9, 0.72, 0.88].map((v, i) => ({
        type: 'RECTANGLE', name: `spark-${i}`,
        x: 205 + i * 12, y: 150 - Math.round(v * 40),
        width: 8, height: Math.round(v * 40),
        fills: [{ type: 'SOLID', color: hexToRgb(i === 11 ? P.sage : P.sageMid) }],
        cornerRadius: 2,
      })),
    ], { x: 24, y: 120, w: 342, h: 180, fill: 'transparent', shadow: true }),

    // Vitals grid
    sectionHeader({ x: 24, y: 318, label: 'Current Readings' }),

    frame([
      // Resting HR
      frame([
        rect({ x: 0, y: 0, w: 162, h: 118, fill: P.surface, radius: 14 }),
        text('RESTING HR', { x: 14, y: 14, size: 10, weight: 600, color: P.fg3, letterSpacing: 0.5 }),
        text('58', { x: 14, y: 36, size: 42, weight: 700, color: P.fg }),
        text('bpm', { x: 80, y: 52, size: 14, weight: 400, color: P.fg3 }),
        text('♥ Excellent', { x: 14, y: 90, size: 12, weight: 500, color: P.rose }),
      ], { x: 0, y: 0, w: 162, h: 118, fill: 'transparent', shadow: true }),
      // SpO2
      frame([
        rect({ x: 0, y: 0, w: 162, h: 118, fill: P.surface, radius: 14 }),
        text('SPO₂', { x: 14, y: 14, size: 10, weight: 600, color: P.fg3, letterSpacing: 0.5 }),
        text('98', { x: 14, y: 36, size: 42, weight: 700, color: P.fg }),
        text('%', { x: 80, y: 52, size: 14, weight: 400, color: P.fg3 }),
        text('◉ Normal', { x: 14, y: 90, size: 12, weight: 500, color: P.sky }),
      ], { x: 172, y: 0, w: 162, h: 118, fill: 'transparent', shadow: true }),
    ], { x: 24, y: 348, w: 342, h: 120, fill: 'transparent' }),

    frame([
      // Temp
      frame([
        rect({ x: 0, y: 0, w: 162, h: 118, fill: P.surface, radius: 14 }),
        text('SKIN TEMP', { x: 14, y: 14, size: 10, weight: 600, color: P.fg3, letterSpacing: 0.5 }),
        text('+0.2', { x: 14, y: 36, size: 42, weight: 700, color: P.fg }),
        text('°C dev', { x: 100, y: 52, size: 13, weight: 400, color: P.fg3 }),
        text('→ Baseline', { x: 14, y: 90, size: 12, weight: 500, color: P.sage }),
      ], { x: 0, y: 0, w: 162, h: 118, fill: 'transparent', shadow: true }),
      // Respiratory
      frame([
        rect({ x: 0, y: 0, w: 162, h: 118, fill: P.surface, radius: 14 }),
        text('RESP RATE', { x: 14, y: 14, size: 10, weight: 600, color: P.fg3, letterSpacing: 0.5 }),
        text('14', { x: 14, y: 36, size: 42, weight: 700, color: P.fg }),
        text('br/min', { x: 68, y: 54, size: 12, weight: 400, color: P.fg3 }),
        text('◉ Normal', { x: 14, y: 90, size: 12, weight: 500, color: P.sky }),
      ], { x: 172, y: 0, w: 162, h: 118, fill: 'transparent', shadow: true }),
    ], { x: 24, y: 480, w: 342, h: 120, fill: 'transparent' }),

    // 7-day trend
    sectionHeader({ x: 24, y: 614, label: '7-Day HRV Trend' }),

    frame([
      rect({ x: 0, y: 0, w: 342, h: 100, fill: P.surface, radius: 14 }),
      // Chart bars
      ...[52, 58, 55, 62, 60, 68, 62].map((v, i) => {
        const h = Math.round((v / 80) * 60);
        return frame([
          rect({ x: 0, y: 64 - h, w: 32, h, fill: i === 6 ? P.sage : P.sageLo, radius: 4 }),
          text(['M','T','W','T','F','S','S'][i], { x: 0, y: 74, w: 32, size: 10, color: i === 6 ? P.sage : P.fg4, align: 'CENTER', weight: i === 6 ? 600 : 400 }),
        ], { x: 12 + i * 46, y: 14, w: 32, h: 90, fill: 'transparent' });
      }),
    ], { x: 24, y: 644, w: 342, h: 104, fill: 'transparent', shadow: true }),
  ];
  return frame(children, { x: 0, y: 0, w: 390, h: 844, fill: P.bg, name: 'Screen — Vitals' });
}

// ── Screen 3: Sleep ───────────────────────────────────────────────────────────
function screenSleep() {
  const children = [
    rect({ x: 0, y: 0, w: 390, h: 844, fill: P.bg }),
    statusBar(),
    tabBar(2),

    // Header
    text('Sleep', { x: 24, y: 56, size: 32, weight: 700, color: P.fg }),
    text('Last night · March 30–31', { x: 24, y: 98, size: 12, color: P.fg3 }),

    // Recovery score — editorial
    frame([
      gradientRect({ x: 0, y: 0, w: 342, h: 160, from: '#EEF1F6', to: '#E4E9F2', radius: 20 }),
      text('RECOVERY', { x: 24, y: 24, size: 10, weight: 700, color: P.sky, letterSpacing: 2 }),
      text('94', { x: 24, y: 42, size: 80, weight: 800, color: P.fg, family: 'Inter' }),
      text('%', { x: 120, y: 55, size: 24, weight: 300, color: P.fg3 }),
      text('Fully recovered', { x: 24, y: 132, size: 13, weight: 600, color: P.sky }),
      text('Great basis for a hard session today', { x: 24, y: 150, size: 10, color: P.fg3 }),
      // Score ring
      ...ringChart({ x: 216, y: 20, outer: 56, inner: 42, pct: 0.94, color: P.sky, bgColor: '#D8E3EF' }).children.map(c => ({
        ...c, x: c.x + 216, y: c.y + 20,
      })),
    ], { x: 24, y: 120, w: 342, h: 170, fill: 'transparent', shadow: true }),

    // Times row
    frame([
      frame([
        rect({ x: 0, y: 0, w: 100, h: 64, fill: P.surface, radius: 12 }),
        text('BEDTIME', { x: 8, y: 10, size: 9, weight: 600, color: P.fg4, letterSpacing: 0.5 }),
        text('10:47', { x: 8, y: 28, size: 22, weight: 700, color: P.fg }),
        text('PM', { x: 74, y: 33, size: 12, color: P.fg3 }),
      ], { x: 0, y: 0, w: 100, h: 64, fill: 'transparent', shadow: true }),
      frame([
        rect({ x: 0, y: 0, w: 100, h: 64, fill: P.surface, radius: 12 }),
        text('DURATION', { x: 8, y: 10, size: 9, weight: 600, color: P.fg4, letterSpacing: 0.5 }),
        text('7h 22m', { x: 8, y: 28, size: 18, weight: 700, color: P.fg }),
        text('↑ +12min', { x: 8, y: 52, size: 10, color: P.sage }),
      ], { x: 122, y: 0, w: 100, h: 64, fill: 'transparent', shadow: true }),
      frame([
        rect({ x: 0, y: 0, w: 100, h: 64, fill: P.surface, radius: 12 }),
        text('WAKE', { x: 8, y: 10, size: 9, weight: 600, color: P.fg4, letterSpacing: 0.5 }),
        text('6:09', { x: 8, y: 28, size: 22, weight: 700, color: P.fg }),
        text('AM', { x: 68, y: 33, size: 12, color: P.fg3 }),
      ], { x: 244, y: 0, w: 100, h: 64, fill: 'transparent', shadow: true }),
    ], { x: 24, y: 304, w: 342, h: 66, fill: 'transparent' }),

    // Sleep stages
    sectionHeader({ x: 24, y: 386, label: 'Sleep Stages' }),

    frame([
      rect({ x: 0, y: 0, w: 342, h: 180, fill: P.surface, radius: 16 }),
      // Stage timeline bar
      rect({ x: 16, y: 16, w: 310, h: 20, fill: P.cream, radius: 4 }),
      rect({ x: 16, y: 16, w: 50, h: 20, fill: '#9BBCD4', radius: 4 }),       // Awake
      rect({ x: 66, y: 16, w: 90, h: 20, fill: P.sky, radius: 0 }),           // Light
      rect({ x: 156, y: 16, w: 120, h: 20, fill: '#2A5F7E', radius: 0 }),     // Deep
      rect({ x: 276, y: 16, w: 50, h: 20, fill: '#7B5EA7', radius: 4 }),      // REM

      sleepRow({ x: 16, y: 50, stage: 'Awake', hours: '0h 22m', color: '#9BBCD4', pct: 0.12 }),
      sleepRow({ x: 16, y: 82, stage: 'Light',  hours: '2h 48m', color: P.sky,    pct: 0.38 }),
      sleepRow({ x: 16, y: 114, stage: 'Deep',  hours: '2h 12m', color: '#2A5F7E', pct: 0.30 }),
      sleepRow({ x: 16, y: 146, stage: 'REM',   hours: '2h 00m', color: '#7B5EA7', pct: 0.27 }),
    ], { x: 24, y: 416, w: 342, h: 185, fill: 'transparent', shadow: true }),

    // Insight strip
    frame([
      rect({ x: 0, y: 0, w: 342, h: 68, fill: P.amberLo, radius: 14, border: 1, borderColor: P.amberMid }),
      text('◎ Insight', { x: 16, y: 12, size: 11, weight: 700, color: P.amber }),
      text('Your deep sleep improved 18% vs last week. Early dinner and no screen before 10pm are likely contributors.', { x: 16, y: 30, w: 310, size: 11, color: P.fg2, lineHeight: 17 }),
    ], { x: 24, y: 614, w: 342, h: 72, fill: 'transparent' }),

    // Sleep debt
    sectionHeader({ x: 24, y: 700, label: 'Sleep Debt' }),
    progressBar({ x: 24, y: 730, w: 342, pct: 0.18, color: P.sage, label: 'This week', value: '-18 min deficit' }),
  ];
  return frame(children, { x: 0, y: 0, w: 390, h: 844, fill: P.bg, name: 'Screen — Sleep' });
}

// ── Screen 4: Nutrition ───────────────────────────────────────────────────────
function screenNutrition() {
  const children = [
    rect({ x: 0, y: 0, w: 390, h: 844, fill: P.bg }),
    statusBar(),
    tabBar(3),

    // Header
    text('Nutrition', { x: 24, y: 56, size: 32, weight: 700, color: P.fg }),
    text('Today · March 31', { x: 24, y: 98, size: 12, color: P.fg3 }),

    // Calorie hero card
    frame([
      gradientRect({ x: 0, y: 0, w: 342, h: 150, from: '#FEF4E8', to: '#FAE9CC', radius: 20 }),
      text('CALORIES', { x: 24, y: 20, size: 10, weight: 700, color: P.amber, letterSpacing: 2 }),
      text('1,842', { x: 24, y: 38, size: 60, weight: 800, color: P.fg }),
      text('/ 2,200', { x: 24, y: 108, size: 16, weight: 400, color: P.fg3 }),
      text('kcal consumed', { x: 24, y: 130, size: 11, color: P.fg3 }),
      // Remaining label
      frame([
        rect({ x: 0, y: 0, w: 110, h: 44, fill: P.surface, radius: 12 }),
        text('358 kcal', { x: 10, y: 6, size: 16, weight: 700, color: P.amber }),
        text('remaining', { x: 10, y: 26, size: 10, color: P.fg3 }),
      ], { x: 210, y: 58, w: 112, h: 44, fill: 'transparent', shadow: true }),
    ], { x: 24, y: 120, w: 342, h: 155, fill: 'transparent', shadow: true }),

    // Macro rings
    sectionHeader({ x: 24, y: 288, label: 'Macros' }),

    frame([
      // Protein
      frame([
        rect({ x: 0, y: 0, w: 102, h: 110, fill: P.surface, radius: 14 }),
        ...ringChart({ x: 27, y: 10, outer: 24, inner: 18, pct: 0.78, color: P.rose, bgColor: P.roseLo }).children.map(c => ({ ...c, x: c.x + 27, y: c.y + 10 })),
        text('146g', { x: 0, y: 62, w: 102, size: 16, weight: 700, color: P.fg, align: 'CENTER' }),
        text('Protein', { x: 0, y: 82, w: 102, size: 11, color: P.fg3, align: 'CENTER' }),
        text('78%', { x: 0, y: 96, w: 102, size: 10, color: P.rose, align: 'CENTER', weight: 600 }),
      ], { x: 0, y: 0, w: 102, h: 112, fill: 'transparent', shadow: true }),
      // Carbs
      frame([
        rect({ x: 0, y: 0, w: 102, h: 110, fill: P.surface, radius: 14 }),
        ...ringChart({ x: 27, y: 10, outer: 24, inner: 18, pct: 0.62, color: P.amber, bgColor: P.amberLo }).children.map(c => ({ ...c, x: c.x + 27, y: c.y + 10 })),
        text('186g', { x: 0, y: 62, w: 102, size: 16, weight: 700, color: P.fg, align: 'CENTER' }),
        text('Carbs', { x: 0, y: 82, w: 102, size: 11, color: P.fg3, align: 'CENTER' }),
        text('62%', { x: 0, y: 96, w: 102, size: 10, color: P.amber, align: 'CENTER', weight: 600 }),
      ], { x: 120, y: 0, w: 102, h: 112, fill: 'transparent', shadow: true }),
      // Fat
      frame([
        rect({ x: 0, y: 0, w: 102, h: 110, fill: P.surface, radius: 14 }),
        ...ringChart({ x: 27, y: 10, outer: 24, inner: 18, pct: 0.90, color: P.sage, bgColor: P.sageLo }).children.map(c => ({ ...c, x: c.x + 27, y: c.y + 10 })),
        text('62g', { x: 0, y: 62, w: 102, size: 16, weight: 700, color: P.fg, align: 'CENTER' }),
        text('Fat', { x: 0, y: 82, w: 102, size: 11, color: P.fg3, align: 'CENTER' }),
        text('90%', { x: 0, y: 96, w: 102, size: 10, color: P.sage, align: 'CENTER', weight: 600 }),
      ], { x: 240, y: 0, w: 102, h: 112, fill: 'transparent', shadow: true }),
    ], { x: 24, y: 318, w: 342, h: 114, fill: 'transparent' }),

    // Meals
    sectionHeader({ x: 24, y: 448, label: 'Meals', action: '+ Add' }),

    ...[
      { name: 'Breakfast', detail: 'Oats · Berries · Protein shake', kcal: '480 kcal', color: P.amber, icon: '☀' },
      { name: 'Lunch',     detail: 'Salmon · Quinoa · Greens',      kcal: '620 kcal', color: P.sage,  icon: '◑' },
      { name: 'Snack',     detail: 'Almonds · Greek yogurt',         kcal: '310 kcal', color: P.sky,   icon: '◎' },
      { name: 'Dinner',    detail: 'Chicken · Sweet potato · Broc', kcal: '432 kcal', color: P.rose,  icon: '◐' },
    ].map((meal, i) => frame([
      rect({ x: 0, y: 0, w: 342, h: 64, fill: P.surface, radius: 12 }),
      rect({ x: 0, y: 0, w: 4, h: 64, fill: meal.color, radius: 2 }),
      text(meal.icon, { x: 14, y: 10, size: 18, color: meal.color }),
      text(meal.name, { x: 40, y: 10, size: 13, weight: 600, color: P.fg }),
      text(meal.detail, { x: 40, y: 30, w: 200, size: 11, color: P.fg3 }),
      text(meal.kcal, { x: 270, y: 22, w: 60, size: 12, weight: 600, color: P.fg2, align: 'RIGHT' }),
    ], { x: 24, y: 478 + i * 74, w: 342, h: 66, fill: 'transparent', shadow: true })),

    // Hydration
    sectionHeader({ x: 24, y: 782, label: 'Hydration' }),
    progressBar({ x: 24, y: 812, w: 342, pct: 0.70, color: P.sky, label: '2.1L / 3.0L', value: '70%' }),
  ];
  return frame(children, { x: 0, y: 0, w: 390, h: 844, fill: P.bg, name: 'Screen — Nutrition' });
}

// ── Screen 5: Insights ────────────────────────────────────────────────────────
function screenInsights() {
  const children = [
    rect({ x: 0, y: 0, w: 390, h: 844, fill: P.bg }),
    statusBar(),
    tabBar(4),

    // Header
    text('Insights', { x: 24, y: 56, size: 32, weight: 700, color: P.fg }),
    text('Your week at a glance', { x: 24, y: 98, size: 12, color: P.fg3 }),

    // Weekly score
    frame([
      gradientRect({ x: 0, y: 0, w: 342, h: 130, from: '#F5F8F2', to: '#EBF1E6', radius: 20 }),
      text('WEEKLY AVERAGE', { x: 24, y: 20, size: 10, weight: 700, color: P.sage, letterSpacing: 1.5 }),
      text('81', { x: 24, y: 38, size: 64, weight: 800, color: P.fg }),
      text('/ 100', { x: 108, y: 68, size: 16, weight: 400, color: P.fg3 }),
      text('Health Score', { x: 24, y: 110, size: 12, weight: 500, color: P.fg2 }),
      text('↑ Up from 76 last week', { x: 160, y: 58, w: 160, size: 12, weight: 500, color: P.sage }),
      text('+6.5% improvement', { x: 160, y: 78, w: 160, size: 11, color: P.fg3 }),
    ], { x: 24, y: 120, w: 342, h: 134, fill: 'transparent', shadow: true }),

    // 7-day bars
    sectionHeader({ x: 24, y: 268, label: '7-Day Score' }),
    frame([
      rect({ x: 0, y: 0, w: 342, h: 100, fill: P.surface, radius: 14 }),
      ...[74, 76, 72, 79, 80, 78, 84].map((v, i) => {
        const h = Math.round((v / 100) * 70);
        return frame([
          rect({ x: 0, y: 70 - h, w: 32, h, fill: i === 6 ? P.amber : P.amberLo, radius: 4 }),
          text(['M','T','W','T','F','S','S'][i], { x: 0, y: 78, w: 32, size: 10, color: i === 6 ? P.amber : P.fg4, align: 'CENTER', weight: i === 6 ? 600 : 400 }),
          text(String(v), { x: 0, y: 58, w: 32, size: 9, color: i === 6 ? P.amber : P.fg4, align: 'CENTER' }),
        ], { x: 12 + i * 46, y: 10, w: 32, h: 95, fill: 'transparent' });
      }),
    ], { x: 24, y: 298, w: 342, h: 104, fill: 'transparent', shadow: true }),

    // Streaks
    sectionHeader({ x: 24, y: 416, label: 'Streaks' }),
    frame([
      ...[
        { icon: '◎', label: 'Morning Protocol', days: 14, color: P.amber },
        { icon: '♥', label: 'HRV Goal Hit',     days: 7,  color: P.rose },
        { icon: '◐', label: '7h+ Sleep',         days: 5,  color: P.sky },
        { icon: '◈', label: 'Protein Target',    days: 10, color: P.sage },
      ].map((s, i) => frame([
        rect({ x: 0, y: 0, w: 342, h: 54, fill: P.surface, radius: 12 }),
        text(s.icon, { x: 14, y: 18, size: 16, color: s.color }),
        text(s.label, { x: 42, y: 18, size: 13, weight: 500, color: P.fg }),
        frame([
          rect({ x: 0, y: 0, w: 72, h: 28, fill: s.color + '22', radius: 14 }),
          text(`🔥 ${s.days} days`, { x: 0, y: 6, w: 72, size: 11, weight: 700, color: s.color, align: 'CENTER' }),
        ], { x: 256, y: 14, w: 72, h: 28, fill: 'transparent' }),
      ], { x: 24, y: 446 + i * 64, w: 342, h: 56, fill: 'transparent', shadow: true })),
    ], { x: 0, y: 0, w: 390, h: 380, fill: 'transparent' }),

    // AI Recommendation
    frame([
      rect({ x: 0, y: 0, w: 342, h: 92, fill: P.amberLo, radius: 16, border: 1, borderColor: P.amberMid }),
      text('✦ Helio AI', { x: 16, y: 14, size: 11, weight: 700, color: P.amber }),
      text('Your recovery is high and training load is low — today is an ideal day for a strength session or Zone 2 run. Your cortisol window opens at 7:30 AM.', { x: 16, y: 34, w: 310, size: 11, color: P.fg2, lineHeight: 17 }),
    ], { x: 24, y: 706, w: 342, h: 96, fill: 'transparent' }),
  ];
  return frame(children, { x: 0, y: 0, w: 390, h: 844, fill: P.bg, name: 'Screen — Insights' });
}

// ── Assemble .pen file ────────────────────────────────────────────────────────

const GAP = 60;
const screens = [
  screenToday(),
  screenVitals(),
  screenSleep(),
  screenNutrition(),
  screenInsights(),
];

screens.forEach((s, i) => {
  s.x = i * (390 + GAP);
  s.y = 0;
});

const pen = {
  version: '2.8',
  name: 'HELIO — Longevity Tracker',
  description: 'Light-theme health optimization app. Inspired by Dawn (lapa.ninja) and Superpower (godly.website) — warm editorial wellness trend, March 2026.',
  width: screens.length * (390 + GAP) - GAP,
  height: 844,
  background: P.bg,
  screens,
};

fs.writeFileSync('/workspace/group/design-studio/helio.pen', JSON.stringify(pen, null, 2));
console.log('✓ helio.pen written');
console.log(`  Screens: ${screens.length}`);
console.log(`  Canvas: ${pen.width} × ${pen.height}`);
