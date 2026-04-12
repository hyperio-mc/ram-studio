'use strict';
// sera-app.js
// SÉRA — Luxury Longevity & Wellness Concierge
//
// Design Challenge: Build a premium wellness platform for modern executives
// using a LIGHT editorial aesthetic. Inspired by:
//
// 1. Atlas Card (godly.website — atlascard.com) — section-by-section cinematic
//    scroll narrative, each feature owns a full screen with editorial photography,
//    luxury all-caps nav, pristine white space. "Made easy." / "In Seconds" — bold
//    value fragments as visual anchors before long-form copy.
//
// 2. Opal Camera (godly.website — opalcamera.com) — ultra-clean light product
//    UI, minimal navigation, hero product photography centered and isolated.
//
// 3. Midday.ai (darkmodedesign.com) — feature tabbed walkthrough layout,
//    "The business stack for modern founders" — clear section hierarchy,
//    AI-assisted workflows woven through financial intelligence.
//
// Palette: Warm cream + champagne gold + deep espresso — not clinical white,
// but warm luxury editorial. Think Aesop meets Whoop.
// Theme: LIGHT (previous designs: zero=dark, yield=dark)
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:        '#F6F2EB',   // warm parchment cream
  surface:   '#FFFFFF',   // clean white card
  surface2:  '#EDE9E0',   // soft warm surface
  surface3:  '#E0D9CE',   // deeper cream for dividers
  border:    '#D4CBB8',   // warm border
  text:      '#1C1814',   // deep espresso
  textMid:   '#5A5145',   // warm mid-tone
  textMuted: '#9A8E7E',   // warm muted
  gold:      '#B8955A',   // champagne gold accent
  gold2:     '#8C6A30',   // deeper gold
  green:     '#4A7A5C',   // vital green (health metric positive)
  red:       '#A04040',   // warning red (muted, not alarming)
  white:     '#FFFFFF',
};

// ── Geometry ─────────────────────────────────────────────────────────────────
const W = 390, H = 844;
const safe = { top: 44, bottom: 34 };
const navH = 64;

// ── Helpers ──────────────────────────────────────────────────────────────────
let idCtr = 1;
const uid = () => `el-${idCtr++}`;

function rect(x, y, w, h, fill, rx = 0, stroke = null, strokeW = 1) {
  const el = { id: uid(), type: 'rectangle', x, y, width: w, height: h, fill, cornerRadius: rx };
  if (stroke) { el.stroke = stroke; el.strokeWidth = strokeW; }
  return el;
}

function text(x, y, content, size, color, weight = 400, align = 'left', maxW = null) {
  const el = {
    id: uid(), type: 'text', x, y, content,
    fontSize: size, color, fontWeight: weight, textAlign: align,
  };
  if (maxW) el.maxWidth = maxW;
  return el;
}

function circle(x, y, r, fill, stroke = null, strokeW = 1) {
  const el = { id: uid(), type: 'ellipse', x: x - r, y: y - r, width: r * 2, height: r * 2, fill };
  if (stroke) { el.stroke = stroke; el.strokeWidth = strokeW; }
  return el;
}

function line(x1, y1, x2, y2, color, w = 1) {
  return {
    id: uid(), type: 'line',
    x: x1, y: y1, x2, y2,
    stroke: color, strokeWidth: w,
  };
}

// ── Nav Bar (bottom) ──────────────────────────────────────────────────────────
function bottomNav(activeIdx) {
  const y = H - navH - safe.bottom;
  const items = [
    { icon: '◈', label: 'Today' },
    { icon: '◉', label: 'Protocols' },
    { icon: '◇', label: 'Insights' },
    { icon: '◎', label: 'Concierge' },
    { icon: '○', label: 'Profile' },
  ];
  const els = [];
  els.push(rect(0, y, W, navH + safe.bottom, P.surface, 0, P.border, 0.5));
  els.push(line(0, y, W, y, P.border, 0.5));
  items.forEach((item, i) => {
    const cx = 39 + i * 78;
    const isActive = i === activeIdx;
    const col = isActive ? P.gold : P.textMuted;
    els.push(text(cx, y + 10, item.icon, 18, col, 400, 'center'));
    els.push(text(cx, y + 32, item.label, 9, col, isActive ? 600 : 400, 'center'));
    if (isActive) {
      els.push(rect(cx - 16, y + 2, 32, 2, P.gold, 1));
    }
  });
  return els;
}

// ── Status Bar ────────────────────────────────────────────────────────────────
function statusBar() {
  return [
    rect(0, 0, W, safe.top, P.bg),
    text(20, 14, '9:41', 14, P.text, 600, 'left'),
    text(W - 20, 14, '● ▲ ▰▰▰', 11, P.textMid, 400, 'right'),
  ];
}

// ── Metric Ring ───────────────────────────────────────────────────────────────
function ringChart(cx, cy, r, pct, strokeColor, bgColor, thickness = 10) {
  // Approximate arc with filled ring visually using concentric circles
  // Draw bg ring, then partial arc as overlay
  const els = [];
  // background ring
  const ringEl = {
    id: uid(), type: 'ellipse',
    x: cx - r, y: cy - r,
    width: r * 2, height: r * 2,
    fill: 'transparent',
    stroke: bgColor,
    strokeWidth: thickness,
  };
  els.push(ringEl);
  // progress arc (approximated as filled partial sector overlay)
  // Use a rect clip approach: just put a progress circle with dasharray simulation
  const progressEl = {
    id: uid(), type: 'ellipse',
    x: cx - r, y: cy - r,
    width: r * 2, height: r * 2,
    fill: 'transparent',
    stroke: strokeColor,
    strokeWidth: thickness,
    strokeDasharray: `${Math.round(2 * Math.PI * r * pct)} ${Math.round(2 * Math.PI * r * (1 - pct))}`,
    strokeDashoffset: Math.round(2 * Math.PI * r * 0.25),
  };
  els.push(progressEl);
  return els;
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Today Dashboard
// "Your vitals. Your protocol. Your day."
// Inspired by Atlas Card's cinematic hero + Midday.ai's metric summary card
// ══════════════════════════════════════════════════════════════════════════════
function screen1() {
  const els = [];

  // Background
  els.push(rect(0, 0, W, H, P.bg));

  // Status bar
  els.push(...statusBar());

  // Top bar
  const tbY = safe.top + 6;
  els.push(text(20, tbY, 'SÉRA', 13, P.text, 700, 'left'));
  els.push(text(W / 2, tbY, 'Sunday, March 30', 12, P.textMuted, 400, 'center'));
  // Avatar
  els.push(circle(W - 30, tbY + 8, 14, P.surface3, P.border, 1));
  els.push(text(W - 30, tbY + 3, 'R', 12, P.textMid, 600, 'center'));

  // ── Vitality score hero card ──
  const heroY = tbY + 36;
  els.push(rect(16, heroY, W - 32, 172, P.surface, 16, P.border, 0.5));

  // Score ring area
  const ringCx = 88, ringCy = heroY + 86;
  // Outer bg
  els.push(circle(ringCx, ringCy, 56, 'transparent', P.surface2, 1));
  // Ring chart segments
  els.push(...ringChart(ringCx, ringCy, 46, 0.82, P.gold, P.surface3, 8));
  // Score text
  els.push(text(ringCx, ringCy - 14, '82', 28, P.text, 700, 'center'));
  els.push(text(ringCx, ringCy + 12, 'VITALITY', 8, P.textMuted, 700, 'center'));

  // Score label
  const scoreX = 158;
  els.push(text(scoreX, heroY + 22, "Today's Score", 11, P.textMuted, 400, 'left'));
  els.push(text(scoreX, heroY + 40, 'Excellent', 22, P.text, 600, 'left'));
  els.push(text(scoreX, heroY + 68, 'You are in the top 8% of\nyour cohort this week.', 11, P.textMid, 400, 'left', 180));

  // Divider
  els.push(line(scoreX - 6, heroY + 106, W - 24, heroY + 106, P.border, 0.5));

  // Mini metrics row
  const metricsRow = [
    { label: 'HRV', value: '68', unit: 'ms', delta: '+4', good: true },
    { label: 'SLEEP', value: '7.4', unit: 'h', delta: '-0.3', good: false },
    { label: 'STRAIN', value: '14.2', unit: '', delta: '▲', good: true },
  ];
  metricsRow.forEach((m, i) => {
    const mx = scoreX + i * 70;
    const myBase = heroY + 120;
    els.push(text(mx, myBase, m.label, 8, P.textMuted, 700, 'left'));
    els.push(text(mx, myBase + 14, m.value + m.unit, 15, P.text, 600, 'left'));
    const deltaCol = m.good ? P.green : P.red;
    els.push(text(mx, myBase + 32, m.delta, 9, deltaCol, 500, 'left'));
  });

  // ── Section label ──
  const secY = heroY + 186;
  els.push(text(20, secY, 'MORNING PROTOCOL', 10, P.gold2, 700, 'left'));
  els.push(line(145, secY + 7, W - 20, secY + 7, P.border, 0.5));

  // Protocol checklist
  const protocols = [
    { name: 'Cold Exposure', detail: '3 min · Done', done: true, icon: '❄' },
    { name: 'AG1 + Creatine', detail: '5g each · Done', done: true, icon: '◈' },
    { name: 'Sunlight · 10 min', detail: 'Pending', done: false, icon: '◉' },
    { name: 'Fasting Window', detail: '16h ends at 2pm', done: false, icon: '◇' },
  ];
  protocols.forEach((p, i) => {
    const py = secY + 22 + i * 52;
    els.push(rect(16, py, W - 32, 44, p.done ? P.surface : P.bg, 10, P.border, p.done ? 0 : 0.5));
    // icon circle
    const iconCol = p.done ? P.gold : P.textMuted;
    els.push(circle(44, py + 22, 14, p.done ? P.surface2 : P.surface, P.border, 0.5));
    els.push(text(44, py + 17, p.icon, 13, iconCol, 400, 'center'));
    // check
    if (p.done) {
      els.push(circle(W - 36, py + 22, 10, P.green, 'transparent'));
      els.push(text(W - 36, py + 17, '✓', 11, P.white, 700, 'center'));
    } else {
      els.push(circle(W - 36, py + 22, 10, 'transparent', P.border, 1.5));
    }
    els.push(text(66, py + 13, p.name, 13, p.done ? P.text : P.textMid, p.done ? 600 : 400, 'left'));
    els.push(text(66, py + 29, p.detail, 10, p.done ? P.green : P.textMuted, 400, 'left'));
  });

  // ── Concierge nudge strip ──
  const nudgeY = secY + 238;
  els.push(rect(16, nudgeY, W - 32, 52, P.text, 12));
  els.push(text(28, nudgeY + 10, '◎ SÉRA CONCIERGE', 9, P.gold, 700, 'left'));
  els.push(text(28, nudgeY + 26, 'Dr. Chen reviewed your labs. 3 new\nrecommendations ready.', 11, P.white, 400, 'left', 290));

  // Bottom nav
  els.push(...bottomNav(0));

  return {
    id: 'screen-today',
    name: 'Today',
    width: W,
    height: H,
    background: P.bg,
    elements: els,
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Protocols
// Personalized longevity stack — inspired by Atlas Card's feature deep-dive
// sections: "Atlas Hotels · Experience the best way to book stays"
// ══════════════════════════════════════════════════════════════════════════════
function screen2() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  els.push(...statusBar());

  const tbY = safe.top + 6;
  els.push(text(W / 2, tbY, 'PROTOCOLS', 13, P.text, 700, 'center'));
  els.push(text(W - 20, tbY, '+ New', 12, P.gold, 600, 'right'));

  // Tabs
  const tabY = tbY + 30;
  const tabs = ['Morning', 'Evening', 'Weekly', 'Supplements'];
  const tabW = (W - 32) / 4;
  els.push(rect(16, tabY, W - 32, 32, P.surface2, 10));
  tabs.forEach((t, i) => {
    if (i === 0) els.push(rect(18 + i * tabW, tabY + 2, tabW - 4, 28, P.surface, 8, P.border, 0.5));
    els.push(text(18 + i * tabW + (tabW - 4) / 2, tabY + 9, t, 10, i === 0 ? P.text : P.textMuted, i === 0 ? 600 : 400, 'center'));
  });

  // Hero feature card — editorial Atlas-style
  const heroY = tabY + 46;
  els.push(rect(16, heroY, W - 32, 140, P.text, 16));
  // Textured gradient impression
  els.push(rect(16, heroY, W - 32, 140, P.gold2 + '18', 16));
  // Label
  els.push(text(28, heroY + 18, 'FOUNDATION STACK', 9, P.gold, 700, 'left'));
  els.push(line(28, heroY + 33, W - 28, heroY + 33, P.gold + '40', 0.5));
  // Big claim — Atlas Card editorial fragment
  els.push(text(28, heroY + 46, 'Peak every\nmorning.', 30, P.white, 600, 'left'));
  els.push(text(28, heroY + 108, '6 active · 2 pending review', 11, P.textMuted, 400, 'left'));
  // Score
  els.push(rect(W - 80, heroY + 50, 54, 54, P.gold + '22', 12));
  els.push(text(W - 53, heroY + 66, '94', 22, P.gold, 700, 'center'));
  els.push(text(W - 53, heroY + 90, 'SCORE', 8, P.gold + 'AA', 700, 'center'));

  // Protocol cards list
  const stackItems = [
    { name: 'Creatine Monohydrate', dose: '5g · Post-workout', status: 'Active', adherence: 0.94, cat: 'MUSCLE' },
    { name: 'Magnesium Glycinate', dose: '400mg · Nightly', status: 'Active', adherence: 0.88, cat: 'SLEEP' },
    { name: 'Vitamin D3 + K2', dose: '5000IU · Morning', status: 'Active', adherence: 0.97, cat: 'IMMUNE' },
    { name: 'NMN + Resveratrol', dose: '500mg · Morning', status: 'Review', adherence: 0.71, cat: 'LONGEVITY' },
  ];
  const listY = heroY + 155;
  els.push(text(20, listY, 'YOUR STACK', 10, P.gold2, 700, 'left'));
  els.push(line(95, listY + 7, W - 20, listY + 7, P.border, 0.5));

  stackItems.forEach((item, i) => {
    const iy = listY + 22 + i * 62;
    const isReview = item.status === 'Review';
    els.push(rect(16, iy, W - 32, 54, P.surface, 10, isReview ? P.gold + '60' : P.border, isReview ? 1 : 0.5));

    // Category badge
    const catCol = isReview ? P.gold2 : P.textMuted;
    els.push(rect(24, iy + 8, 58, 14, isReview ? P.gold + '20' : P.surface2, 3));
    els.push(text(53, iy + 10, item.cat, 7, catCol, 700, 'center'));

    // Name + dose
    els.push(text(24, iy + 26, item.name, 13, P.text, 600, 'left'));
    els.push(text(24, iy + 42, item.dose, 10, P.textMuted, 400, 'left'));

    // Adherence bar
    const barX = W - 90, barY = iy + 18, barW = 66, barH = 4;
    els.push(rect(barX, barY, barW, barH, P.surface2, 2));
    els.push(rect(barX, barY, Math.round(barW * item.adherence), barH, isReview ? P.gold : P.green, 2));
    els.push(text(W - 20, barY - 2, Math.round(item.adherence * 100) + '%', 11, isReview ? P.gold : P.text, 600, 'right'));
    if (isReview) {
      els.push(text(W - 20, iy + 40, '! Review', 9, P.gold, 500, 'right'));
    }
  });

  els.push(...bottomNav(1));
  return { id: 'screen-protocols', name: 'Protocols', width: W, height: H, background: P.bg, elements: els };
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Insights
// Biometric trend analytics — inspired by Midday.ai feature walkthroughs
// ("All your transactions, unified") and Atlas Card's temporal data sections
// ══════════════════════════════════════════════════════════════════════════════
function screen3() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  els.push(...statusBar());

  const tbY = safe.top + 6;
  els.push(text(20, tbY, 'INSIGHTS', 13, P.text, 700, 'left'));
  // Period selector
  const periods = ['7D', '30D', '90D', '1Y'];
  periods.forEach((p, i) => {
    const px = W - 110 + i * 26;
    if (i === 1) els.push(rect(px - 4, tbY - 2, 24, 18, P.text, 4));
    els.push(text(px + 8, tbY + 3, p, 10, i === 1 ? P.bg : P.textMuted, 600, 'center'));
  });

  // HRV trend chart
  const chartY = tbY + 32;
  els.push(text(20, chartY, 'HEART RATE VARIABILITY', 10, P.gold2, 700, 'left'));
  els.push(line(178, chartY + 7, W - 20, chartY + 7, P.border, 0.5));

  // Chart card
  els.push(rect(16, chartY + 16, W - 32, 160, P.surface, 14, P.border, 0.5));

  // Chart background grid
  const cInnerX = 24, cInnerY = chartY + 30, cW = W - 80, cH = 100;
  for (let g = 0; g <= 4; g++) {
    const gy = cInnerY + g * (cH / 4);
    els.push(line(cInnerX, gy, cInnerX + cW, gy, P.surface3, 0.5));
    const val = 80 - g * 10;
    els.push(text(cInnerX + cW + 8, gy - 4, val.toString(), 9, P.textMuted, 400, 'left'));
  }

  // HRV data points (30D sparkline)
  const hrvData = [52, 58, 55, 62, 65, 60, 58, 70, 72, 68, 75, 71, 69, 74, 76, 72, 78, 75, 80, 77, 74, 79, 82, 78, 76, 80, 84, 81, 79, 83];
  const minHRV = 50, maxHRV = 90;
  const ptW = cW / (hrvData.length - 1);

  // Area fill impression
  const areaEls = [];
  for (let i = 0; i < hrvData.length - 1; i++) {
    const x1 = cInnerX + i * ptW;
    const y1 = cInnerY + cH - ((hrvData[i] - minHRV) / (maxHRV - minHRV)) * cH;
    const x2 = cInnerX + (i + 1) * ptW;
    const y2 = cInnerY + cH - ((hrvData[i + 1] - minHRV) / (maxHRV - minHRV)) * cH;
    els.push(line(x1, y1, x2, y2, P.gold, 2));
  }

  // Current value dot
  const lastX = cInnerX + (hrvData.length - 1) * ptW;
  const lastY = cInnerY + cH - ((hrvData[hrvData.length - 1] - minHRV) / (maxHRV - minHRV)) * cH;
  els.push(circle(lastX, lastY, 5, P.gold));
  els.push(circle(lastX, lastY, 9, P.gold + '40'));

  // Stats row inside chart card
  const statsY = chartY + 144;
  const statItems = [
    { label: '30D AVG', val: '72 ms' },
    { label: 'PEAK', val: '84 ms' },
    { label: 'TREND', val: '↑ 15%' },
  ];
  statItems.forEach((s, i) => {
    const sx = 24 + i * 104;
    if (i > 0) els.push(line(sx - 4, statsY, sx - 4, statsY + 26, P.border, 0.5));
    els.push(text(sx, statsY, s.label, 8, P.textMuted, 700, 'left'));
    els.push(text(sx, statsY + 14, s.val, 13, i === 2 ? P.green : P.text, 600, 'left'));
  });

  // Insight cards
  const insightY = chartY + 192;
  els.push(text(20, insightY, 'AI INSIGHTS', 10, P.gold2, 700, 'left'));
  els.push(line(87, insightY + 7, W - 20, insightY + 7, P.border, 0.5));

  const insights = [
    {
      title: 'HRV Rising Trend',
      body: 'Your recovery is improving. Cold exposure and consistent sleep timing are correlated with +23% HRV gain this month.',
      tag: 'RECOVERY',
      col: P.green,
    },
    {
      title: 'Sleep Architecture Shift',
      body: 'Deep sleep dropped 18 min this week. Evening magnesium timing may need adjustment — consider 8pm vs 10pm.',
      tag: 'SLEEP',
      col: P.gold2,
    },
    {
      title: 'Strain Plateau',
      body: 'Training load has been stable for 12 days. Consider a strategic deload week to allow full CNS recovery.',
      tag: 'TRAINING',
      col: P.textMid,
    },
  ];

  insights.forEach((ins, i) => {
    const iy = insightY + 22 + i * 90;
    els.push(rect(16, iy, W - 32, 80, P.surface, 12, P.border, 0.5));
    // Tag
    els.push(rect(24, iy + 10, 58, 14, ins.col + '20', 4));
    els.push(text(53, iy + 12, ins.tag, 7, ins.col, 700, 'center'));
    // Title
    els.push(text(24, iy + 30, ins.title, 13, P.text, 600, 'left'));
    // Body
    els.push(text(24, iy + 48, ins.body, 9, P.textMid, 400, 'left', W - 64));
  });

  els.push(...bottomNav(2));
  return { id: 'screen-insights', name: 'Insights', width: W, height: H, background: P.bg, elements: els };
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Concierge
// Inspired by Atlas Card's "You've got Atlas" luxury service narrative —
// "Get unique access to exclusive experiences" → human concierge AI hybrid
// ══════════════════════════════════════════════════════════════════════════════
function screen4() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  els.push(...statusBar());

  const tbY = safe.top + 6;
  els.push(text(W / 2, tbY, 'CONCIERGE', 13, P.text, 700, 'center'));
  // Status indicator
  els.push(circle(W - 38, tbY + 7, 4, P.green));
  els.push(text(W - 30, tbY + 2, 'Available', 10, P.green, 500, 'left'));

  // Advisor card — editorial full-width
  const advisorY = tbY + 30;
  els.push(rect(0, advisorY, W, 150, P.text));
  // Subtle pattern
  els.push(rect(0, advisorY, W, 150, P.gold2 + '10'));

  els.push(text(20, advisorY + 16, 'YOUR ADVISOR', 9, P.gold, 700, 'left'));
  els.push(line(20, advisorY + 32, W - 20, advisorY + 32, P.gold + '30', 0.5));

  // Avatar
  els.push(circle(56, advisorY + 80, 32, P.surface2, P.gold + '60', 1));
  els.push(text(56, advisorY + 72, 'LC', 18, P.text, 700, 'center'));

  els.push(text(100, advisorY + 52, 'Dr. Laura Chen', 16, P.white, 600, 'left'));
  els.push(text(100, advisorY + 72, 'Longevity Specialist', 11, P.textMuted, 400, 'left'));
  els.push(text(100, advisorY + 90, 'MD, Stanford · 12 yrs exp', 10, P.textMuted, 400, 'left'));

  // Availability badge
  els.push(rect(100, advisorY + 108, 120, 22, P.gold + '20', 6));
  els.push(circle(111, advisorY + 119, 4, P.green));
  els.push(text(118, advisorY + 113, 'Available now', 10, P.gold, 500, 'left'));

  // Message thread
  const chatY = advisorY + 164;
  els.push(text(20, chatY, 'LATEST MESSAGE', 10, P.gold2, 700, 'left'));
  els.push(line(116, chatY + 7, W - 20, chatY + 7, P.border, 0.5));

  const messages = [
    { from: 'Dr. Chen', text: 'I reviewed your March labs. Your testosterone is up 18% — excellent response to the protocol changes. I want to discuss your sleep architecture data.', time: '2h ago', mine: false },
    { from: 'You', text: 'Thanks Dr. Chen. The cold exposure protocol seems to be working. When are you free to review the full Q1 data?', time: '1h ago', mine: true },
    { from: 'Dr. Chen', text: 'I blocked 30 min tomorrow at 9am. I am also adding 3 specific recommendations to your protocol based on your bloodwork.', time: '45m ago', mine: false },
  ];

  messages.forEach((msg, i) => {
    const my = chatY + 22 + i * 82;
    if (msg.mine) {
      els.push(rect(W - 220, my, 204, 68, P.text, 12));
      els.push(text(W - 210, my + 10, msg.text, 10, P.white, 400, 'left', 188));
      els.push(text(W - 210, my + 58, msg.time, 9, P.textMuted, 400, 'left'));
    } else {
      els.push(circle(28, my + 20, 14, P.surface3, P.border, 0.5));
      els.push(text(28, my + 15, 'LC', 9, P.textMid, 600, 'center'));
      els.push(rect(50, my, 210, 68, P.surface, 12, P.border, 0.5));
      els.push(text(60, my + 10, msg.text, 10, P.text, 400, 'left', 192));
      els.push(text(60, my + 58, msg.time, 9, P.textMuted, 400, 'left'));
    }
  });

  // Input bar
  const inputY = H - navH - safe.bottom - 58;
  els.push(rect(16, inputY, W - 32, 44, P.surface, 22, P.border, 1));
  els.push(text(36, inputY + 13, 'Message Dr. Chen…', 13, P.textMuted, 400, 'left'));
  els.push(circle(W - 34, inputY + 22, 14, P.gold));
  els.push(text(W - 34, inputY + 16, '↑', 14, P.white, 700, 'center'));

  els.push(...bottomNav(3));
  return { id: 'screen-concierge', name: 'Concierge', width: W, height: H, background: P.bg, elements: els };
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Profile & Membership
// Atlas Card premium membership tier aesthetic —
// "The Card. Engineered to outperform." → SÉRA membership tiers
// ══════════════════════════════════════════════════════════════════════════════
function screen5() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  els.push(...statusBar());

  const tbY = safe.top + 6;
  els.push(text(W / 2, tbY, 'PROFILE', 13, P.text, 700, 'center'));
  els.push(text(W - 20, tbY, '⚙', 16, P.textMuted, 400, 'right'));

  // Profile hero
  const heroY = tbY + 24;
  els.push(rect(0, heroY, W, 140, P.text));
  els.push(rect(0, heroY, W, 140, P.gold + '08'));

  // Avatar
  els.push(circle(W / 2, heroY + 52, 36, P.surface2, P.gold, 2));
  els.push(text(W / 2, heroY + 40, 'R', 28, P.text, 700, 'center'));

  els.push(text(W / 2, heroY + 96, 'Rakis M.', 18, P.white, 600, 'center'));
  els.push(text(W / 2, heroY + 116, 'Member since Jan 2024 · Day 455', 10, P.textMuted, 400, 'center'));

  // Membership card
  const cardY = heroY + 154;
  els.push(rect(16, cardY, W - 32, 100, P.text, 16));
  // Gold gradient strip
  els.push(rect(16, cardY, W - 32, 4, P.gold, 16));
  els.push(rect(16, cardY + 4, W - 32, 96, P.text, 0, null, 0));

  els.push(text(28, cardY + 18, 'MEMBERSHIP', 8, P.gold, 700, 'left'));
  els.push(text(28, cardY + 36, 'Obsidian', 22, P.white, 600, 'left'));
  els.push(text(28, cardY + 58, 'Annual · Renews Jan 2027', 10, P.textMuted, 400, 'left'));
  els.push(text(28, cardY + 76, '◈◈◈◈  ◈◈◈◈  ◈◈◈◈  7724', 12, P.textMuted, 400, 'left'));
  // Tier badge
  els.push(rect(W - 90, cardY + 32, 62, 24, P.gold + '20', 6));
  els.push(text(W - 59, cardY + 40, 'OBSIDIAN', 8, P.gold, 700, 'center'));

  // Stats grid
  const statsY = cardY + 116;
  els.push(text(20, statsY, 'YOUR JOURNEY', 10, P.gold2, 700, 'left'));
  els.push(line(116, statsY + 7, W - 20, statsY + 7, P.border, 0.5));

  const statsGrid = [
    { val: '455', label: 'Days Active', icon: '◈' },
    { val: '94', label: 'Protocol Score', icon: '◉' },
    { val: '82', label: 'Vitality Avg', icon: '◇' },
    { val: '12', label: 'Lab Reviews', icon: '○' },
  ];
  const gridY = statsY + 20;
  statsGrid.forEach((s, i) => {
    const col = i % 2 === 0 ? 0 : 1;
    const row = Math.floor(i / 2);
    const gx = 16 + col * ((W - 40) / 2 + 8);
    const gy = gridY + row * 70;
    els.push(rect(gx, gy, (W - 40) / 2, 60, P.surface, 12, P.border, 0.5));
    els.push(text(gx + 12, gy + 10, s.icon, 14, P.gold, 400, 'left'));
    els.push(text(gx + 12, gy + 30, s.val, 22, P.text, 700, 'left'));
    els.push(text(gx + 12, gy + 48, s.label, 9, P.textMuted, 400, 'left'));
  });

  // Benefits section
  const benefitsY = gridY + 154;
  els.push(text(20, benefitsY, 'OBSIDIAN BENEFITS', 10, P.gold2, 700, 'left'));
  els.push(line(130, benefitsY + 7, W - 20, benefitsY + 7, P.border, 0.5));

  const benefits = ['Dedicated physician advisor', 'Quarterly bloodwork panels', 'Priority concierge access', 'Annual longevity retreat'];
  benefits.forEach((b, i) => {
    const by = benefitsY + 20 + i * 28;
    els.push(circle(28, by + 8, 8, P.gold + '20', P.gold, 0.5));
    els.push(text(28, by + 3, '✓', 9, P.gold2, 700, 'center'));
    els.push(text(44, by + 2, b, 12, P.text, 400, 'left'));
  });

  els.push(...bottomNav(4));
  return { id: 'screen-profile', name: 'Profile', width: W, height: H, background: P.bg, elements: els };
}

// ── Assemble ──────────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  meta: {
    name: 'SÉRA — Luxury Longevity Concierge',
    description: 'Premium wellness platform for modern executives. Light editorial aesthetic. Inspired by Atlas Card and Midday.ai.',
    author: 'RAM Design Heartbeat',
    createdAt: new Date().toISOString(),
    tags: ['wellness', 'luxury', 'editorial', 'light', 'health', 'fintech', 'concierge'],
  },
  screens: [screen1(), screen2(), screen3(), screen4(), screen5()],
};

const outPath = path.join(__dirname, 'sera.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log('✓ sera.pen written:', outPath);
console.log('  Screens:', pen.screens.length);
console.log('  Total elements:', pen.screens.reduce((s, sc) => s + sc.elements.length, 0));
