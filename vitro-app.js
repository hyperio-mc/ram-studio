// vitro-app.js — VITRO: Personal Longevity Biomarker Tracker
// Inspired by: "Superpower" health app on godly.website —
//   warm amber/organic photography meets clinical white data cards.
//   The tension between warm, human documentary feel and cold, precise
//   biomarker data creates a distinctive visual language.
// Challenge: Design a longevity tracker that treats your biology like
//   a living data set — beautiful, warm, clinical-precise.
// Theme: LIGHT — warm cream + terracotta + forest green

const fs   = require('fs');
const path = require('path');

const SLUG = 'vitro';

// ── Palette ───────────────────────────────────────────────────────────────────
const p = {
  bg:         '#FAF7F2',   // warm parchment
  surface:    '#FFFFFF',
  surfaceAlt: '#F5F0E8',   // tinted cream card
  surface2:   '#EDE8DE',   // darker cream section
  text:       '#1C1917',   // warm charcoal
  textMuted:  'rgba(28,25,23,0.45)',
  accent:     '#C8622A',   // terracotta / amber
  accentDim:  'rgba(200,98,42,0.10)',
  accentDim2: 'rgba(200,98,42,0.05)',
  green:      '#2D6A4F',   // forest green = optimal
  greenDim:   'rgba(45,106,79,0.10)',
  yellow:     '#B45309',   // amber = borderline
  yellowDim:  'rgba(180,83,9,0.10)',
  red:        '#9B1C1C',   // deep red = risk
  redDim:     'rgba(155,28,28,0.10)',
  border:     'rgba(28,25,23,0.07)',
  borderMid:  'rgba(28,25,23,0.13)',
};

// ── Primitives ────────────────────────────────────────────────────────────────
function makeScreen(id, label, bg, elements) {
  return { id, label, backgroundColor: bg, elements };
}
function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, width: w, height: h, fill,
    borderRadius: opts.radius || 0,
    ...(opts.shadow ? { shadow: opts.shadow } : {}),
    ...(opts.stroke ? { stroke: opts.stroke, strokeWidth: opts.strokeWidth || 1 } : {}),
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  };
}
function text(x, y, w, h, content, opts = {}) {
  return {
    type: 'text', x, y, width: w, height: h, content,
    fontSize: opts.fontSize || 14,
    fontWeight: opts.fontWeight || '400',
    color: opts.color || p.text,
    textAlign: opts.textAlign || 'left',
    lineHeight: opts.lineHeight || 1.35,
    fontFamily: opts.mono ? 'JetBrains Mono, monospace' : 'Inter, sans-serif',
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
    ...(opts.letterSpacing !== undefined ? { letterSpacing: opts.letterSpacing } : {}),
  };
}
function circle(cx, cy, r, fill, opts = {}) {
  return {
    type: 'ellipse', x: cx - r, y: cy - r, width: r * 2, height: r * 2,
    fill,
    ...(opts.stroke ? { stroke: opts.stroke, strokeWidth: opts.strokeWidth || 1 } : {}),
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  };
}
function line(x1, y1, x2, y2, color, opts = {}) {
  return {
    type: 'line', x1, y1, x2, y2,
    stroke: color, strokeWidth: opts.width || 1,
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  };
}

// ── Status bar ────────────────────────────────────────────────────────────────
function statusBar() {
  return [
    rect(0, 0, 390, 44, p.bg),
    text(20, 14, 60, 16, '9:41', { fontSize: 13, fontWeight: '600' }),
    // signal dots
    circle(320, 22, 3, p.textMuted),
    circle(330, 22, 3, p.textMuted, { opacity: 0.6 }),
    circle(340, 22, 3, p.textMuted, { opacity: 0.35 }),
    // battery outline
    rect(350, 16, 22, 12, 'transparent', { stroke: p.text, strokeWidth: 1, radius: 2, opacity: 0.5 }),
    rect(372, 19, 2, 6, p.textMuted, { radius: 1 }),
    rect(352, 18, 16, 8, p.accent, { radius: 1, opacity: 0.75 }),
  ];
}

// ── Nav bar ───────────────────────────────────────────────────────────────────
const navItems = [
  { id: 'vitality',  label: 'Vitality'  },
  { id: 'blood',     label: 'Blood'     },
  { id: 'recovery',  label: 'Recovery'  },
  { id: 'stack',     label: 'Stack'     },
  { id: 'insights',  label: 'Insights'  },
];
function navBar(activeId) {
  const els = [];
  // hairline + nav bg
  els.push(line(0, 800, 390, 800, p.border, { width: 1 }));
  els.push(rect(0, 800, 390, 64, p.surface));
  const w = 390 / navItems.length;
  navItems.forEach((item, i) => {
    const cx = i * w + w / 2;
    const isActive = item.id === activeId;
    // active indicator — small terracotta dot above icon
    if (isActive) {
      els.push(circle(cx, 807, 3, p.accent));
    }
    // icon block
    els.push(rect(cx - 11, 814, 22, 22, isActive ? p.accentDim : 'transparent', { radius: 6 }));
    els.push(rect(cx - 6, 818, 12, 12, isActive ? p.accent : p.textMuted, { radius: 3 }));
    // label
    els.push(text(cx - 30, 838, 60, 16, item.label, {
      fontSize: 9, fontWeight: isActive ? '700' : '400',
      color: isActive ? p.accent : p.textMuted,
      textAlign: 'center', letterSpacing: 0.3,
    }));
  });
  return els;
}

// ── Shared card ───────────────────────────────────────────────────────────────
function card(x, y, w, h, opts = {}) {
  return rect(x, y, w, h, opts.fill || p.surface, {
    radius: opts.radius || 16,
    stroke: opts.stroke || p.border,
    strokeWidth: 1,
    shadow: opts.shadow || { x: 0, y: 2, blur: 8, color: 'rgba(28,25,23,0.05)' },
  });
}

// ── Badge helper ──────────────────────────────────────────────────────────────
function statusBadge(x, y, label, level) {
  const map = {
    optimal:    { bg: p.greenDim,  text: p.green  },
    borderline: { bg: p.yellowDim, text: p.yellow },
    risk:       { bg: p.redDim,    text: p.red    },
    info:       { bg: p.accentDim, text: p.accent },
  };
  const c = map[level] || map.info;
  const pw = Math.min(label.length * 7 + 16, 90);
  return [
    rect(x, y, pw, 20, c.bg, { radius: 5 }),
    text(x + 8, y + 3, pw - 16, 14, label, { fontSize: 10, fontWeight: '600', color: c.text }),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — VITALITY SCORE
// ═══════════════════════════════════════════════════════════════════════════════
function screenVitality() {
  const els = [...statusBar()];

  // Header
  els.push(text(24, 56, 200, 26, 'VITRO', {
    fontSize: 13, fontWeight: '700', color: p.accent,
    letterSpacing: 3,
  }));
  els.push(text(220, 58, 150, 20, 'Mar 24, 2026', {
    fontSize: 12, color: p.textMuted, textAlign: 'right',
  }));
  els.push(line(0, 86, 390, 86, p.border, { width: 1 }));

  // ── Hero vitality score card ──────────────────────────────────────────────
  els.push(card(20, 100, 350, 200, {
    fill: p.surfaceAlt,
    shadow: { x: 0, y: 4, blur: 20, color: 'rgba(200,98,42,0.08)' },
  }));
  // Warm accent top bar on card
  els.push(rect(20, 100, 350, 4, p.accent, { radius: 4 }));

  // Big score
  els.push(text(50, 128, 180, 72, '82', {
    fontSize: 72, fontWeight: '700', color: p.accent,
    lineHeight: 1,
  }));
  els.push(text(148, 156, 60, 24, '/ 100', {
    fontSize: 20, fontWeight: '300', color: p.textMuted,
  }));
  els.push(text(50, 202, 220, 18, 'Longevity Vitality Score', {
    fontSize: 13, fontWeight: '500', color: p.textMuted, letterSpacing: 0.3,
  }));

  // Mini sparkline (weekly trend going up slightly)
  const sparkX = 240, sparkY = 135, sparkW = 110, sparkH = 52;
  els.push(text(sparkX, sparkY - 14, sparkW, 12, 'This week', {
    fontSize: 10, color: p.textMuted, textAlign: 'right',
  }));
  // Sparkline grid
  els.push(line(sparkX, sparkY + sparkH, sparkX + sparkW, sparkY + sparkH, p.border, { width: 1 }));
  // Bars (7 days)
  const bars = [68, 71, 72, 74, 78, 80, 82];
  bars.forEach((v, i) => {
    const bh = Math.round((v / 100) * sparkH);
    const bx = sparkX + i * 16;
    const isToday = i === 6;
    els.push(rect(bx, sparkY + sparkH - bh, 10, bh,
      isToday ? p.accent : p.accentDim, { radius: 3 }));
  });
  // +14 delta
  els.push(text(sparkX, sparkY + sparkH + 6, sparkW, 14, '↑ +14 pts this week', {
    fontSize: 10, fontWeight: '600', color: p.green, textAlign: 'right',
  }));

  // ── Key metric row ─────────────────────────────────────────────────────────
  const metrics = [
    { label: 'Biological Age', value: '34.2', unit: 'yrs', color: p.green },
    { label: 'HRV',            value: '58',   unit: 'ms',  color: p.accent },
    { label: 'Glucose',        value: '94',   unit: 'mg/dL', color: p.green },
  ];
  metrics.forEach((m, i) => {
    const mx = 20 + i * 118, my = 316;
    els.push(card(mx, my, 110, 70, { radius: 12 }));
    els.push(text(mx + 12, my + 12, 86, 14, m.label, {
      fontSize: 9, fontWeight: '500', color: p.textMuted, letterSpacing: 0.2,
    }));
    els.push(text(mx + 10, my + 28, 60, 30, m.value, {
      fontSize: 24, fontWeight: '700', color: m.color, lineHeight: 1,
    }));
    els.push(text(mx + 70, my + 38, 30, 16, m.unit, {
      fontSize: 10, color: p.textMuted,
    }));
  });

  // ── Alert banner ──────────────────────────────────────────────────────────
  els.push(card(20, 402, 350, 54, { fill: p.yellowDim, radius: 12, stroke: p.yellow }));
  els.push(rect(20, 402, 4, 54, p.yellow, { radius: 4 }));
  els.push(text(38, 412, 260, 16, 'ApoB elevated — review blood panel', {
    fontSize: 12, fontWeight: '600', color: p.yellow,
  }));
  els.push(text(38, 428, 260, 14, 'Last tested Mar 18 · Action recommended', {
    fontSize: 11, color: p.yellow, opacity: 0.8,
  }));
  els.push(text(310, 420, 40, 16, 'View →', {
    fontSize: 11, fontWeight: '600', color: p.yellow, textAlign: 'right',
  }));

  // ── Recent checks list ────────────────────────────────────────────────────
  els.push(text(24, 472, 200, 18, 'Recent Checks', {
    fontSize: 12, fontWeight: '600', color: p.textMuted, letterSpacing: 0.5,
  }));

  const checks = [
    { label: 'Full blood panel',   sub: 'Mar 18 · 42 markers',  status: 'optimal',    icon: p.green },
    { label: 'VO₂ Max',            sub: 'Mar 10 · 51 mL/kg/min', status: 'optimal',   icon: p.green },
    { label: 'DEXA body comp.',    sub: 'Feb 28 · 15.2% fat',    status: 'borderline', icon: p.yellow },
  ];
  checks.forEach((c, i) => {
    const cy2 = 498 + i * 62;
    els.push(card(20, cy2, 350, 54, { radius: 12 }));
    // Icon
    els.push(circle(49, cy2 + 27, 14, c.status === 'optimal' ? p.greenDim : p.yellowDim));
    els.push(rect(41, cy2 + 19, 16, 16, c.icon, { radius: 4 }));
    // Text
    els.push(text(74, cy2 + 10, 200, 18, c.label, { fontSize: 13, fontWeight: '500' }));
    els.push(text(74, cy2 + 30, 200, 14, c.sub, { fontSize: 11, color: p.textMuted }));
    // Badge
    const [bg2, tx2] = statusBadge(0, 0, c.status === 'optimal' ? 'Optimal' : 'Borderline', c.status);
    bg2.x = 270; bg2.y = cy2 + 17;
    tx2.x = 278; tx2.y = cy2 + 20;
    els.push(bg2, tx2);
  });

  els.push(...navBar('vitality'));
  return makeScreen('vitality', 'Vitality', p.bg, els);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — BLOOD PANEL
// ═══════════════════════════════════════════════════════════════════════════════
function screenBlood() {
  const els = [...statusBar()];

  els.push(text(24, 56, 200, 26, 'Blood Panel', { fontSize: 18, fontWeight: '700' }));
  els.push(text(24, 80, 250, 16, 'Mar 18 · Quest Diagnostics · 42 markers', {
    fontSize: 12, color: p.textMuted,
  }));
  els.push(line(0, 104, 390, 104, p.border, { width: 1 }));

  // Filter tabs
  const tabs = ['All', 'Flagged', 'Lipids', 'Metabolic', 'CBC'];
  tabs.forEach((t, i) => {
    const tx = 20 + i * 72, isActive = i === 0;
    els.push(rect(tx, 114, t.length * 8 + 20, 28, isActive ? p.accentDim : 'transparent', {
      radius: 8,
      stroke: isActive ? p.accent : p.border,
      strokeWidth: 1,
    }));
    els.push(text(tx + 10, 121, t.length * 8, 14, t, {
      fontSize: 11, fontWeight: isActive ? '600' : '400',
      color: isActive ? p.accent : p.textMuted,
    }));
  });

  // Summary row
  const summary = [
    { label: 'Optimal', value: '34', color: p.green },
    { label: 'Borderline', value: '5', color: p.yellow },
    { label: 'Risk', value: '3', color: p.red },
  ];
  summary.forEach((s, i) => {
    const sx = 20 + i * 122, sy = 156;
    els.push(card(sx, sy, 114, 52, { radius: 10 }));
    els.push(text(sx + 12, sy + 8, 60, 20, s.value, {
      fontSize: 22, fontWeight: '700', color: s.color,
    }));
    els.push(text(sx + 12, sy + 30, 90, 14, s.label, {
      fontSize: 10, color: p.textMuted, letterSpacing: 0.3,
    }));
  });

  // Biomarker rows
  const markers = [
    { name: 'ApoB', value: '112',  unit: 'mg/dL', range: '<90',       status: 'risk',       trend: '↑' },
    { name: 'LDL-C', value: '118', unit: 'mg/dL', range: '<100',      status: 'borderline', trend: '→' },
    { name: 'HDL-C', value: '68',  unit: 'mg/dL', range: '>60',       status: 'optimal',    trend: '↑' },
    { name: 'Trig',  value: '82',  unit: 'mg/dL', range: '<150',      status: 'optimal',    trend: '↓' },
    { name: 'hsCRP', value: '1.2', unit: 'mg/L',  range: '<1.0',      status: 'borderline', trend: '→' },
    { name: 'HbA1c', value: '5.3', unit: '%',     range: '<5.7',      status: 'optimal',    trend: '↓' },
    { name: 'Glucose', value: '94', unit: 'mg/dL', range: '70–99',    status: 'optimal',    trend: '→' },
    { name: 'Insulin', value: '6.2', unit: 'µIU/mL', range: '2–19',  status: 'optimal',    trend: '↓' },
  ];

  els.push(text(24, 222, 200, 14, 'LIPIDS & INFLAMMATION', {
    fontSize: 9, fontWeight: '700', color: p.textMuted, letterSpacing: 1.2,
  }));

  markers.forEach((m, i) => {
    const my = 242 + i * 62;
    els.push(card(20, my, 350, 54, { radius: 12 }));

    // Status color bar
    const barColor = m.status === 'optimal' ? p.green : m.status === 'borderline' ? p.yellow : p.red;
    els.push(rect(20, my, 4, 54, barColor, { radius: 3 }));

    // Name
    els.push(text(34, my + 9, 140, 18, m.name, { fontSize: 13, fontWeight: '600' }));
    els.push(text(34, my + 28, 140, 14, `Range: ${m.range}`, {
      fontSize: 10, color: p.textMuted,
    }));

    // Value + unit
    els.push(text(190, my + 9, 80, 20, `${m.value} ${m.unit}`, {
      fontSize: 13, fontWeight: '700', color: barColor, textAlign: 'right',
    }));

    // Trend
    const trendColor = m.trend === '↑' && m.status !== 'optimal' ? p.red
      : m.trend === '↑' ? p.green
      : m.trend === '↓' && m.status === 'optimal' ? p.green
      : p.textMuted;
    els.push(text(278, my + 12, 24, 18, m.trend, {
      fontSize: 14, fontWeight: '600', color: trendColor, textAlign: 'center',
    }));

    // Status badge
    const badgeLabel = m.status === 'optimal' ? '✓' : m.status === 'borderline' ? '!' : '!!';
    els.push(circle(344, my + 27, 12,
      m.status === 'optimal' ? p.greenDim : m.status === 'borderline' ? p.yellowDim : p.redDim));
    els.push(text(337, my + 20, 24, 14, badgeLabel, {
      fontSize: 11, fontWeight: '700',
      color: m.status === 'optimal' ? p.green : m.status === 'borderline' ? p.yellow : p.red,
      textAlign: 'center',
    }));
  });

  els.push(...navBar('blood'));
  return makeScreen('blood', 'Blood Panel', p.bg, els);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — RECOVERY
// ═══════════════════════════════════════════════════════════════════════════════
function screenRecovery() {
  const els = [...statusBar()];

  els.push(text(24, 56, 200, 26, 'Recovery', { fontSize: 18, fontWeight: '700' }));
  els.push(text(24, 80, 250, 16, 'Last night · Mar 23–24 · Oura Ring', {
    fontSize: 12, color: p.textMuted,
  }));
  els.push(line(0, 104, 390, 104, p.border, { width: 1 }));

  // ── Recovery score ring ─────────────────────────────────────────────────
  els.push(card(20, 116, 350, 140, {
    fill: p.surfaceAlt,
    shadow: { x: 0, y: 4, blur: 16, color: 'rgba(200,98,42,0.06)' },
  }));
  // Big recovery number
  els.push(text(40, 134, 120, 80, '74', {
    fontSize: 64, fontWeight: '700', color: p.accent, lineHeight: 1,
  }));
  els.push(text(40, 214, 120, 16, 'Recovery Score', {
    fontSize: 11, color: p.textMuted, fontWeight: '500',
  }));

  // HRV + Resting HR mini cards
  const recMetrics = [
    { label: 'HRV',         value: '58',  unit: 'ms', delta: '+8',  good: true },
    { label: 'Resting HR',  value: '52',  unit: 'bpm', delta: '-2', good: true },
    { label: 'Body Temp',   value: '+0.2', unit: '°F', delta: '↗', good: false },
  ];
  recMetrics.forEach((m, i) => {
    const rx = 168 + i * 64, ry = 128;
    els.push(rect(rx, ry, 58, 58, p.surface, { radius: 10 }));
    els.push(text(rx + 6, ry + 6, 46, 11, m.label, {
      fontSize: 9, color: p.textMuted, fontWeight: '500',
    }));
    els.push(text(rx + 6, ry + 20, 46, 22, m.value, {
      fontSize: 18, fontWeight: '700',
      color: m.good ? p.green : p.yellow,
    }));
    els.push(text(rx + 6, ry + 40, 46, 14, m.delta + ' ' + m.unit, {
      fontSize: 9, color: m.good ? p.green : p.yellow,
    }));
  });

  // ── 7-day HRV trend ──────────────────────────────────────────────────────
  els.push(card(20, 270, 350, 130, { radius: 14 }));
  els.push(text(36, 284, 200, 16, 'HRV Trend — 7 days', {
    fontSize: 12, fontWeight: '600',
  }));
  els.push(text(290, 285, 64, 14, '↑ +6 ms avg', {
    fontSize: 10, fontWeight: '600', color: p.green, textAlign: 'right',
  }));

  // HRV line chart
  const hrvData = [44, 48, 52, 50, 55, 56, 58];
  const chartX = 36, chartY = 310, chartW = 310, chartH = 60;
  const minH = Math.min(...hrvData), maxH = Math.max(...hrvData);
  const pointSpacing = chartW / (hrvData.length - 1);
  // Grid line
  els.push(line(chartX, chartY + chartH, chartX + chartW, chartY + chartH, p.border, { width: 1 }));
  // Plot points and lines
  const points = hrvData.map((v, i) => ({
    x: chartX + i * pointSpacing,
    y: chartY + chartH - ((v - minH) / (maxH - minH)) * (chartH - 8),
  }));
  for (let i = 0; i < points.length - 1; i++) {
    els.push(line(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y, p.accent, { width: 2 }));
  }
  // Dots
  points.forEach((pt, i) => {
    els.push(circle(pt.x, pt.y, i === points.length - 1 ? 5 : 3,
      i === points.length - 1 ? p.accent : p.accentDim));
  });
  // Day labels
  ['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach((d, i) => {
    els.push(text(chartX + i * pointSpacing - 8, chartY + chartH + 6, 16, 14, d, {
      fontSize: 9, color: p.textMuted, textAlign: 'center',
    }));
  });

  // ── Sleep stages ─────────────────────────────────────────────────────────
  els.push(card(20, 414, 350, 120, { radius: 14 }));
  els.push(text(36, 428, 200, 16, 'Sleep Stages', { fontSize: 12, fontWeight: '600' }));
  els.push(text(290, 429, 64, 14, '7h 42m', {
    fontSize: 12, fontWeight: '600', color: p.green, textAlign: 'right',
  }));

  // Stage bar
  const stages = [
    { label: 'Awake',  pct: 5,  color: p.yellow },
    { label: 'REM',    pct: 22, color: p.accent },
    { label: 'Light',  pct: 52, color: p.accentDim },
    { label: 'Deep',   pct: 21, color: p.green },
  ];
  let barStart = 36;
  const totalBarW = 310, barHeight = 18, barY = 454;
  els.push(rect(36, barY, totalBarW, barHeight, p.surface2, { radius: 6 }));
  stages.forEach((s) => {
    const sw = Math.round((s.pct / 100) * totalBarW);
    els.push(rect(barStart, barY, sw, barHeight, s.color, { radius: 3 }));
    barStart += sw;
  });
  // Legend
  stages.forEach((s, i) => {
    const lx = 36 + i * 78;
    els.push(rect(lx, 482, 10, 10, s.color, { radius: 2 }));
    els.push(text(lx + 14, 482, 60, 12, `${s.label} ${s.pct}%`, {
      fontSize: 9, color: p.textMuted,
    }));
  });

  // ── Readiness factors ────────────────────────────────────────────────────
  els.push(card(20, 548, 350, 150, { radius: 14 }));
  els.push(text(36, 562, 200, 16, 'Readiness Factors', { fontSize: 12, fontWeight: '600' }));

  const factors = [
    { label: 'Previous day activity', pct: 88, good: true  },
    { label: 'Sleep efficiency',      pct: 92, good: true  },
    { label: 'Recovery index',        pct: 74, good: true  },
    { label: 'Body temperature',      pct: 55, good: false },
  ];
  factors.forEach((f, i) => {
    const fy = 584 + i * 26;
    els.push(text(36, fy, 170, 14, f.label, { fontSize: 11, color: p.text }));
    // Progress bar track
    els.push(rect(215, fy + 3, 110, 8, p.surface2, { radius: 4 }));
    // Progress bar fill
    els.push(rect(215, fy + 3, Math.round(110 * f.pct / 100), 8,
      f.good ? p.green : p.yellow, { radius: 4 }));
    els.push(text(334, fy, 24, 14, f.pct + '%', {
      fontSize: 10, fontWeight: '600',
      color: f.good ? p.green : p.yellow, textAlign: 'right',
    }));
  });

  els.push(...navBar('recovery'));
  return makeScreen('recovery', 'Recovery', p.bg, els);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — SUPPLEMENT STACK
// ═══════════════════════════════════════════════════════════════════════════════
function screenStack() {
  const els = [...statusBar()];

  els.push(text(24, 56, 200, 26, 'My Stack', { fontSize: 18, fontWeight: '700' }));
  els.push(text(24, 80, 250, 16, '11 active protocols · 3 timing windows', {
    fontSize: 12, color: p.textMuted,
  }));
  els.push(line(0, 104, 390, 104, p.border, { width: 1 }));

  // Today adherence banner
  els.push(card(20, 116, 350, 54, { fill: p.greenDim, stroke: p.green, radius: 14 }));
  els.push(rect(20, 116, 4, 54, p.green, { radius: 3 }));
  els.push(text(38, 126, 220, 18, "Today's adherence: 9 / 11", {
    fontSize: 13, fontWeight: '700', color: p.green,
  }));
  els.push(text(38, 144, 220, 14, '2 remaining — evening window', {
    fontSize: 11, color: p.green, opacity: 0.8,
  }));
  // Progress mini
  els.push(rect(268, 130, 80, 8, p.greenDim, { radius: 4 }));
  els.push(rect(268, 130, 65, 8, p.green, { radius: 4 }));

  // Timing sections
  const sections = [
    {
      label: 'Morning (with breakfast)',
      time: '8:00 AM',
      items: [
        { name: 'Omega-3 (EPA/DHA)', dose: '2g', note: 'Cardiometabolic · taken', done: true },
        { name: 'Vitamin D3 + K2', dose: '5000 IU', note: 'Bone + immune · taken', done: true },
        { name: 'Magnesium glycinate', dose: '400mg', note: 'Sleep + stress · taken', done: true },
        { name: 'Berberine', dose: '500mg', note: 'Glucose · taken', done: true },
      ],
    },
    {
      label: 'Pre-workout',
      time: '4:00 PM',
      items: [
        { name: 'Creatine monohydrate', dose: '5g', note: 'Muscle + cognition · taken', done: true },
        { name: 'NMN', dose: '500mg', note: 'NAD+ precursor · taken', done: true },
        { name: 'Coenzyme Q10', dose: '200mg', note: 'Mitochondrial · taken', done: true },
      ],
    },
    {
      label: 'Evening',
      time: '9:00 PM',
      items: [
        { name: 'Apigenin', dose: '50mg', note: 'Sleep quality · remaining', done: false },
        { name: 'Glycine', dose: '3g', note: 'Sleep + collagen · remaining', done: false },
      ],
    },
  ];

  let y = 184;
  sections.forEach((sec) => {
    // Section header
    els.push(text(24, y, 260, 16, sec.label, {
      fontSize: 12, fontWeight: '700', color: p.text, letterSpacing: 0.3,
    }));
    els.push(text(290, y, 80, 16, sec.time, {
      fontSize: 11, color: p.textMuted, textAlign: 'right',
    }));
    y += 22;

    sec.items.forEach((item) => {
      els.push(card(20, y, 350, 48, { radius: 10 }));
      // Done indicator
      const dotColor = item.done ? p.green : p.yellow;
      els.push(circle(36, y + 24, 8, item.done ? p.greenDim : p.yellowDim));
      els.push(rect(30, y + 18, 12, 12, dotColor, { radius: 6 }));
      // Name + dose
      els.push(text(54, y + 8, 190, 16, item.name, {
        fontSize: 12, fontWeight: item.done ? '500' : '600',
        color: item.done ? p.textMuted : p.text,
        opacity: item.done ? 0.8 : 1,
      }));
      els.push(text(54, y + 26, 160, 14, item.note, {
        fontSize: 10, color: p.textMuted,
      }));
      // Dose badge
      els.push(rect(304, y + 14, 46, 20, p.accentDim, { radius: 6 }));
      els.push(text(304, y + 18, 46, 12, item.dose, {
        fontSize: 10, fontWeight: '600', color: p.accent, textAlign: 'center',
      }));
      y += 54;
    });
    y += 10;
  });

  els.push(...navBar('stack'));
  return makeScreen('stack', 'Stack', p.bg, els);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — INSIGHTS
// ═══════════════════════════════════════════════════════════════════════════════
function screenInsights() {
  const els = [...statusBar()];

  els.push(text(24, 56, 240, 26, 'Insights', { fontSize: 18, fontWeight: '700' }));
  els.push(text(24, 80, 280, 16, 'AI-personalised · updated today', {
    fontSize: 12, color: p.textMuted,
  }));
  els.push(line(0, 104, 390, 104, p.border, { width: 1 }));

  // Priority filter chips
  const chips = ['All', 'Urgent', 'Diet', 'Training', 'Supplements'];
  let cx2 = 20;
  chips.forEach((c, i) => {
    const isActive = i === 0;
    const w = c.length * 8 + 22;
    els.push(rect(cx2, 114, w, 28, isActive ? p.accent : p.surface, {
      radius: 14,
      stroke: isActive ? p.accent : p.border,
      strokeWidth: 1,
    }));
    els.push(text(cx2 + 11, 121, w - 22, 14, c, {
      fontSize: 11, fontWeight: isActive ? '600' : '400',
      color: isActive ? p.surface : p.textMuted,
    }));
    cx2 += w + 8;
  });

  // Insight cards
  const insights = [
    {
      priority: 'urgent',
      icon: '⚠',
      title: 'ApoB reduction protocol',
      body: 'Your ApoB (112 mg/dL) remains above optimal. Consider adding red yeast rice 1200mg, reducing saturated fat below 10g/day, and retesting in 8 weeks.',
      tags: ['Diet', 'Supplements'],
      action: 'Build protocol →',
    },
    {
      priority: 'moderate',
      icon: '💪',
      title: 'Zone 2 cardio for HRV',
      body: 'Your HRV trend is improving (+8ms this week) but consistency is key. 150 min/week Zone 2 has the strongest evidence for sustained HRV gains.',
      tags: ['Training'],
      action: 'See training plan →',
    },
    {
      priority: 'info',
      icon: '🧪',
      title: 'Glucose control improving',
      body: 'HbA1c dropped from 5.5% → 5.3% in 90 days. Berberine + time-restricted eating is working. Consider continuous glucose monitor for deeper data.',
      tags: ['Metabolic', 'Diet'],
      action: 'Explore CGM →',
    },
    {
      priority: 'info',
      icon: '🌙',
      title: 'Body temp disrupting sleep',
      body: 'You logged higher body temp on 4 of the last 7 nights, correlating with reduced deep sleep. Try lowering room temp to 67°F and tracking patterns.',
      tags: ['Sleep'],
      action: 'Sleep guide →',
    },
  ];

  let iy = 156;
  insights.forEach((ins) => {
    const priorityColor = ins.priority === 'urgent' ? p.red
      : ins.priority === 'moderate' ? p.yellow : p.green;
    const priorityDim = ins.priority === 'urgent' ? p.redDim
      : ins.priority === 'moderate' ? p.yellowDim : p.greenDim;

    const cardH = 130;
    els.push(card(20, iy, 350, cardH, {
      shadow: { x: 0, y: 3, blur: 12, color: 'rgba(28,25,23,0.05)' },
    }));
    // Side accent bar
    els.push(rect(20, iy, 4, cardH, priorityColor, { radius: 3 }));

    // Icon
    els.push(text(36, iy + 14, 28, 28, ins.icon, { fontSize: 20, textAlign: 'center' }));

    // Title
    els.push(text(72, iy + 12, 260, 18, ins.title, { fontSize: 13, fontWeight: '700' }));

    // Body
    els.push(text(72, iy + 32, 258, 52, ins.body, {
      fontSize: 11, color: p.textMuted, lineHeight: 1.5,
    }));

    // Tags
    let tagX = 72;
    ins.tags.forEach((t) => {
      const tw2 = t.length * 7 + 16;
      els.push(rect(tagX, iy + 92, tw2, 18, priorityDim, { radius: 5 }));
      els.push(text(tagX + 8, iy + 95, tw2 - 16, 12, t, {
        fontSize: 9, fontWeight: '600', color: priorityColor,
      }));
      tagX += tw2 + 6;
    });

    // Action link
    els.push(text(280, iy + 96, 80, 14, ins.action, {
      fontSize: 10, fontWeight: '600', color: p.accent, textAlign: 'right',
    }));

    iy += cardH + 12;
  });

  els.push(...navBar('insights'));
  return makeScreen('insights', 'Insights', p.bg, els);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ASSEMBLE
// ═══════════════════════════════════════════════════════════════════════════════
const pen = {
  version: '2.8',
  name: 'VITRO — Longevity Biomarker Tracker',
  width: 390,
  height: 864,
  screens: [
    screenVitality(),
    screenBlood(),
    screenRecovery(),
    screenStack(),
    screenInsights(),
  ],
};

const outPath = path.join(__dirname, 'vitro.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log('✓ vitro.pen written —', pen.screens.length, 'screens');
pen.screens.forEach(s => console.log(' ', s.id, '·', s.elements.length, 'elements'));
