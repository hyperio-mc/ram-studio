'use strict';
// bloom-app.js — BLOOM: Customer success + brand onboarding platform for DTC brands
// Inspired by:
//   1. darkmodedesign.com (Mar 24 2026): Midday ("Open-source finance & time tracking") and
//      Darkroom ("Next generation product mockups engineered for complete control") — premium,
//      tool-forward aesthetics; clean data density without feeling heavy. Also saw Maker, Temply,
//      Belka — all converging on confident SaaS with restrained motion.
//   2. land-book.com (Mar 24 2026): Cernel ("Product Onboarding for Ecommerce Teams") — landing
//      page built with Webflow, very clean editorial hero, step-indexed onboarding flows, subtle
//      warm backgrounds. B2B ecommerce SaaS is clearly trending toward editorial warmth.
//   3. lapa.ninja (Mar 24 2026): Isa de Burgh (CPG brand architect for food/beverage/skincare —
//      "helping brands build clarity, trust, and momentum through strategic design") and Dawn
//      ("Evidence-based AI for mental health") — the convergence of brand strategy + AI insight
//      for product companies is the meta-theme of this design.
// Theme: LIGHT — warm cream/bone white, forest green, amber — the aesthetic of a confident
//   modern brand tool that doesn't need to scream. No glassmorphism. Flat surfaces, tight type,
//   generous breathing room between data blocks.
// Design push: Bento-grid card layout on dashboard (varied card sizes, not uniform list rows).
//   Typography as hierarchy signal — oversized metric numerals, tight category labels.
//   Warm amber used only for alert/risk signals (not generic accent overuse).

const fs   = require('fs');
const path = require('path');

// ─── palette ─────────────────────────────────────────────────────────────────
const C = {
  bg:       '#F8F5F0',   // warm cream
  surface:  '#FFFFFF',
  surface2: '#EEE9E0',   // warm off-white for secondary cards
  surface3: '#F3EFE8',   // mid-tone for zebra rows
  text:     '#1A1914',   // near-black warm
  muted:    'rgba(26,25,20,0.44)',
  forest:   '#2A5A3A',   // primary — forest green
  forestLt: '#3D7A52',   // lighter forest for active states
  amber:    '#D4884A',   // secondary — warm amber (risk/alert signal)
  amberLt:  '#F2C9A4',   // soft amber fill
  sage:     '#6B9E7D',   // supporting — sage for success/healthy
  border:   'rgba(26,25,20,0.09)',
  borderMd: 'rgba(26,25,20,0.15)',
  white:    '#FFFFFF',
};

// ─── pen helpers ─────────────────────────────────────────────────────────────
let _id = 1;
const uid    = () => `bloom-${_id++}`;
const rect   = (x, y, w, h, fill, r = 0) => ({
  id: uid(), type: 'rect', x, y, width: w, height: h, fill,
  ...(r ? { cornerRadius: r } : {}),
});
const text   = (x, y, w, h, content, fontSize, color, weight = '400', align = 'left', family = 'Georgia') =>
  ({ id: uid(), type: 'text', x, y, width: w, height: h, content, fontSize, color, fontWeight: weight, textAlign: align, fontFamily: family });
const sans   = (x, y, w, h, content, fontSize, color, weight = '400', align = 'left') =>
  text(x, y, w, h, content, fontSize, color, weight, align, 'Inter');
const frame  = (x, y, w, h, fill, children, clip = true) =>
  ({ id: uid(), type: 'frame', x, y, width: w, height: h, fill, clip, children });

const FW = 390; const FH = 844;
const PAD = 20;

// ─── status badge ──────────────────────────────────────────────────────────
function badge(x, y, label, color, textColor) {
  const w = label.length * 6 + 16;
  return [
    rect(x, y, w, 22, color, 11),
    sans(x, y + 4, w, 14, label, 10, textColor, '600', 'center'),
  ];
}

// ─── score ring (simplified as layered rects) ────────────────────────────
function scoreRing(cx, cy, r, score, color) {
  // outer ring (track)
  const els = [];
  const segments = 24;
  const filled   = Math.round((score / 100) * segments);
  for (let i = 0; i < segments; i++) {
    const angle  = (i / segments) * Math.PI * 2 - Math.PI / 2;
    const sx     = cx + Math.cos(angle) * r;
    const sy     = cy + Math.sin(angle) * r;
    const isOn   = i < filled;
    els.push(rect(sx - 3, sy - 3, 6, 6, isOn ? color : C.surface2, 3));
  }
  return els;
}

// ─── nav bar ─────────────────────────────────────────────────────────────────
const NAV = ['Overview', 'Brands', 'Onboard', 'Insights', 'Settings'];
function navBar(active) {
  const els = [rect(0, FH - 72, FW, 72, C.surface)];
  els.push(rect(0, FH - 72, FW, 1, C.border));
  NAV.forEach((label, i) => {
    const nx = Math.round(i * (FW / NAV.length));
    const nw = Math.round(FW / NAV.length);
    const isActive = i === active;
    // dot indicator
    if (isActive) els.push(rect(nx + nw / 2 - 16, FH - 68, 32, 3, C.forest, 2));
    els.push(sans(nx, FH - 30, nw, 16, label, 10, isActive ? C.forest : C.muted, isActive ? '600' : '400', 'center'));
  });
  return els;
}

// ─── top bar ─────────────────────────────────────────────────────────────────
function topBar(title, sub, actionLabel) {
  const els = [
    rect(0, 0, FW, 70, C.bg),
    rect(0, 69, FW, 1, C.border),
    text(PAD, 12, 200, 28, 'bloom', 20, C.forest, '400', 'left', 'Georgia'),
    sans(PAD, 42, 260, 16, title, 12, C.muted, '400', 'left'),
  ];
  if (actionLabel) {
    const aw = actionLabel.length * 7 + 20;
    els.push(rect(FW - PAD - aw, 20, aw, 32, C.forest, 8));
    els.push(sans(FW - PAD - aw, 28, aw, 16, actionLabel, 11, C.white, '600', 'center'));
  }
  if (sub) {
    els.push(sans(PAD + 50, 42, FW - PAD - 60, 16, sub, 12, C.amber, '500', 'right'));
  }
  return els;
}

// ─── metric big ──────────────────────────────────────────────────────────────
function bigMetric(x, y, w, h, value, label, sub, accent) {
  return [
    rect(x, y, w, h, C.surface, 12),
    text(x + 16, y + 16, w - 32, 44, value, 36, accent || C.text, '300', 'left', 'Georgia'),
    sans(x + 16, y + 62, w - 32, 16, label, 11, C.muted, '500', 'left'),
    ...(sub ? [sans(x + 16, y + 80, w - 32, 14, sub, 10, C.muted, '400', 'left')] : []),
  ];
}

// ─── mini metric ─────────────────────────────────────────────────────────────
function miniMetric(x, y, w, h, value, label, delta, deltaColor) {
  const els = [
    rect(x, y, w, h, C.surface, 12),
    sans(x + 12, y + 36, w - 24, 28, value, 22, C.text, '300', 'left'),
    sans(x + 12, y + 14, w - 24, 16, label, 10, C.muted, '500', 'left'),
  ];
  if (delta) {
    els.push(sans(x + 12, y + 68, w - 24, 14, delta, 10, deltaColor || C.sage, '600', 'left'));
  }
  return els;
}

// ─── brand row ───────────────────────────────────────────────────────────────
function brandRow(x, y, w, name, category, score, status, statusColor) {
  const scoreColor = score >= 80 ? C.sage : score >= 60 ? C.amber : '#E07055';
  return [
    rect(x, y, w, 64, C.surface),
    rect(x, y + 63, w, 1, C.border),
    // avatar initial
    rect(x + 12, y + 16, 32, 32, C.surface2, 6),
    sans(x + 12, y + 24, 32, 16, name[0], 14, C.forest, '700', 'center'),
    // name + category
    sans(x + 52, y + 16, w - 140, 18, name, 13, C.text, '600', 'left'),
    sans(x + 52, y + 36, w - 140, 14, category, 10, C.muted, '400', 'left'),
    // score
    sans(x + w - 110, y + 22, 50, 18, String(score), 16, scoreColor, '700', 'right'),
    sans(x + w - 110, y + 42, 50, 14, 'health', 9, C.muted, '400', 'right'),
    // status badge
    rect(x + w - 52, y + 20, 44, 22, statusColor + '22', 11),
    sans(x + w - 52, y + 25, 44, 12, status, 9, statusColor, '600', 'center'),
  ];
}

// ─── onboarding step ─────────────────────────────────────────────────────────
function onboardStep(x, y, w, stepNum, title, detail, state) {
  // state: 'done' | 'active' | 'pending'
  const dotColor = state === 'done' ? C.sage : state === 'active' ? C.forest : C.surface2;
  const dotText  = state === 'done' ? '✓' : String(stepNum);
  const dotTxtColor = state === 'done' ? C.white : state === 'active' ? C.white : C.muted;
  const connH = 28;
  return [
    // connector line
    ...(stepNum > 1 ? [rect(x + 19, y - connH, 2, connH, C.border)] : []),
    // step dot
    rect(x, y, 40, 40, dotColor, 20),
    sans(x, y + 12, 40, 16, dotText, 14, dotTxtColor, '700', 'center'),
    // text
    sans(x + 52, y + 4, w - 64, 18, title, 13, state === 'pending' ? C.muted : C.text, state === 'pending' ? '400' : '600', 'left'),
    sans(x + 52, y + 24, w - 64, 14, detail, 10, C.muted, '400', 'left'),
  ];
}

// ─── insight card ────────────────────────────────────────────────────────────
function insightCard(x, y, w, h, emoji, title, body, accentBg) {
  return [
    rect(x, y, w, h, accentBg || C.surface, 12),
    sans(x + 16, y + 16, 32, 32, emoji, 22, C.text, '400', 'center'),
    sans(x + 16, y + 52, w - 32, 18, title, 12, C.text, '600', 'left'),
    sans(x + 16, y + 72, w - 32, h - 88, body, 11, C.muted, '400', 'left'),
  ];
}

// ─── mini bar chart ──────────────────────────────────────────────────────────
function miniBarChart(x, y, w, h, values, labels, color) {
  const els = [];
  const n   = values.length;
  const maxV = Math.max(...values);
  const barW = Math.floor((w - (n - 1) * 4) / n);
  values.forEach((v, i) => {
    const barH  = Math.round((v / maxV) * (h - 24));
    const bx    = x + i * (barW + 4);
    const by    = y + (h - 24) - barH;
    els.push(rect(bx, by, barW, barH, i === n - 1 ? color : color + '55', 3));
    if (labels) els.push(sans(bx, y + h - 20, barW, 14, labels[i], 9, C.muted, '400', 'center'));
  });
  return els;
}

// ─── progress bar ────────────────────────────────────────────────────────────
function progressBar(x, y, w, label, pct, color) {
  return [
    sans(x, y, w - 40, 14, label, 11, C.text, '500', 'left'),
    sans(x + w - 36, y, 36, 14, `${pct}%`, 11, color, '600', 'right'),
    rect(x, y + 18, w, 6, C.surface2, 3),
    rect(x, y + 18, Math.round(w * pct / 100), 6, color, 3),
  ];
}

// ─── SCREEN 1 — OVERVIEW ─────────────────────────────────────────────────────
function screenOverview() {
  const els = [
    rect(0, 0, FW, FH, C.bg),
    ...topBar('Overview', null, '+ Brand'),
    ...navBar(0),
  ];

  const Y = 80; // content start

  // Greeting block
  els.push(sans(PAD, Y + 4, FW - PAD * 2, 18, 'Monday, 24 March', 12, C.muted, '400', 'left'));
  els.push(text(PAD, Y + 22, FW - PAD * 2, 32, '12 active brands', 26, C.text, '300', 'left', 'Georgia'));

  // Bento grid row 1 — big metric + 2 minis
  const B1Y = Y + 68;
  const bigW = 172; const miniW = 88; const gap = 8;

  // Big: Avg Health Score
  els.push(...bigMetric(PAD, B1Y, bigW, 112, '84', 'avg health score', '↑ 3pts this week', C.forest));

  // Mini x2 stacked
  els.push(...miniMetric(PAD + bigW + gap, B1Y, miniW, 52, '12', 'brands', '+2 this mo', C.sage));
  els.push(...miniMetric(PAD + bigW + gap + miniW + gap, B1Y, miniW, 52, '3', 'at risk', '↑ needs action', C.amber));
  els.push(...miniMetric(PAD + bigW + gap, B1Y + 60, miniW, 52, '94%', 'onboarded', null, null));
  els.push(...miniMetric(PAD + bigW + gap + miniW + gap, B1Y + 60, miniW, 52, '7d', 'avg resp', '-1d ↓', C.sage));

  // Bento row 2 — bar chart (activity) + square card
  const B2Y = B1Y + 120 + gap;
  const chartW = 210;
  els.push(rect(PAD, B2Y, chartW, 96, C.surface, 12));
  els.push(sans(PAD + 12, B2Y + 12, chartW - 24, 16, 'Onboarding completions', 10, C.muted, '500', 'left'));
  els.push(...miniBarChart(PAD + 12, B2Y + 28, chartW - 24, 60, [4, 7, 5, 9, 8, 11, 7], ['M', 'T', 'W', 'T', 'F', 'S', 'S'], C.forest));

  const sqW = FW - PAD * 2 - chartW - gap;
  els.push(rect(PAD + chartW + gap, B2Y, sqW, 96, C.amberLt, 12));
  els.push(sans(PAD + chartW + gap + 12, B2Y + 14, sqW - 24, 16, '3 brands need', 10, C.amber, '600', 'left'));
  els.push(sans(PAD + chartW + gap + 12, B2Y + 28, sqW - 24, 14, 'attention', 10, C.amber, '600', 'left'));
  els.push(sans(PAD + chartW + gap + 12, B2Y + 52, sqW - 24, 36, 'Review →', 13, C.amber, '700', 'left'));

  // Section header — Recent activity
  const B3Y = B2Y + 104 + gap;
  els.push(sans(PAD, B3Y, FW - PAD * 2, 16, 'RECENT BRANDS', 10, C.muted, '600', 'left'));

  // Brand rows (3)
  const BR1 = B3Y + 24;
  els.push(...brandRow(PAD, BR1, FW - PAD * 2, 'Maison Colette', 'Food & Beverage', 91, 'Healthy', C.sage));
  els.push(...brandRow(PAD, BR1 + 65, FW - PAD * 2, 'Nomad Supply Co.', 'Outdoor & Apparel', 68, 'Monitor', C.amber));
  els.push(...brandRow(PAD, BR1 + 130, FW - PAD * 2, 'Soilborn Foods', 'CPG / Organic', 44, 'At Risk', '#E07055'));

  return frame(0, 0, FW, FH, C.bg, els);
}

// ─── SCREEN 2 — BRANDS ───────────────────────────────────────────────────────
function screenBrands() {
  const els = [
    rect(0, 0, FW, FH, C.bg),
    ...topBar('Brands', null, '+ New'),
    ...navBar(1),
  ];

  const Y = 80;

  // Search bar
  els.push(rect(PAD, Y, FW - PAD * 2, 40, C.surface, 10));
  els.push(rect(PAD + 1, Y + 1, FW - PAD * 2 - 2, 38, 'transparent', 10));
  els.push(sans(PAD + 14, Y + 12, 200, 16, '🔍  Search brands…', 13, C.muted, '400', 'left'));

  // Filter chips
  const CHIPS = ['All', 'Healthy', 'Monitor', 'At Risk', 'New'];
  const CHIP_COLORS = [C.forest, C.sage, C.amber, '#E07055', C.forestLt];
  let cx = PAD;
  const chipY = Y + 48;
  CHIPS.forEach((chip, i) => {
    const cw = chip.length * 8 + 20;
    const active = i === 0;
    els.push(rect(cx, chipY, cw, 28, active ? C.forest : C.surface2, 14));
    els.push(sans(cx, chipY + 7, cw, 14, chip, 11, active ? C.white : C.muted, active ? '600' : '400', 'center'));
    cx += cw + 8;
  });

  // Brand list
  const BRANDS = [
    { name: 'Maison Colette', cat: 'Food & Beverage', score: 91, status: 'Healthy', sColor: C.sage, since: 'Active 8 months' },
    { name: 'Nomad Supply Co.', cat: 'Outdoor & Apparel', score: 68, status: 'Monitor', sColor: C.amber, since: 'Active 3 months' },
    { name: 'Soilborn Foods', cat: 'CPG / Organic', score: 44, status: 'At Risk', sColor: '#E07055', since: 'Active 6 weeks' },
    { name: 'Verdant Skincare', cat: 'Beauty & Personal Care', score: 88, status: 'Healthy', sColor: C.sage, since: 'Active 1 year' },
    { name: 'Crux Coffee', cat: 'Food & Beverage', score: 76, status: 'Healthy', sColor: C.sage, since: 'Active 5 months' },
    { name: 'Drift & Thread', cat: 'Fashion / DTC', score: 55, status: 'Monitor', sColor: C.amber, since: 'Onboarding' },
  ];

  const LY = chipY + 44;
  BRANDS.forEach((b, i) => {
    const y = LY + i * 65;
    if (y + 65 > FH - 80) return;
    const sc = b.score >= 80 ? C.sage : b.score >= 60 ? C.amber : '#E07055';
    els.push(rect(PAD, y, FW - PAD * 2, 63, C.surface));
    els.push(rect(PAD, y + 62, FW - PAD * 2, 1, C.border));
    // avatar
    const avatarColors = [C.forest, C.amber, '#E07055', C.sage, '#7B6BB0', '#5B96B0'];
    els.push(rect(PAD + 12, y + 14, 34, 34, avatarColors[i % avatarColors.length], 8));
    els.push(sans(PAD + 12, y + 22, 34, 18, b.name[0], 15, C.white, '700', 'center'));
    // info
    els.push(sans(PAD + 54, y + 12, FW - PAD * 2 - 150, 18, b.name, 13, C.text, '600', 'left'));
    els.push(sans(PAD + 54, y + 32, FW - PAD * 2 - 150, 14, `${b.cat}  ·  ${b.since}`, 10, C.muted, '400', 'left'));
    // score
    els.push(sans(FW - PAD - 90, y + 14, 50, 20, String(b.score), 18, sc, '700', 'right'));
    els.push(sans(FW - PAD - 90, y + 36, 50, 14, 'health', 9, C.muted, '400', 'right'));
    // badge
    els.push(rect(FW - PAD - 46, y + 18, 42, 20, b.sColor + '20', 10));
    els.push(sans(FW - PAD - 46, y + 22, 42, 12, b.status, 9, b.sColor, '600', 'center'));
  });

  return frame(0, 0, FW, FH, C.bg, els);
}

// ─── SCREEN 3 — ONBOARDING FLOW ──────────────────────────────────────────────
function screenOnboard() {
  const els = [
    rect(0, 0, FW, FH, C.bg),
    ...topBar('Onboarding', 'Soilborn Foods', null),
    ...navBar(2),
  ];

  const Y = 80;

  // Brand + progress header
  els.push(rect(PAD, Y, FW - PAD * 2, 72, C.surface, 12));
  // mini logo
  els.push(rect(PAD + 12, Y + 16, 40, 40, '#E07055' + '22', 8));
  els.push(sans(PAD + 12, Y + 24, 40, 24, 'SF', 16, '#E07055', '700', 'center'));
  els.push(sans(PAD + 60, Y + 16, 200, 18, 'Soilborn Foods', 14, C.text, '700', 'left'));
  els.push(sans(PAD + 60, Y + 36, 200, 14, 'CPG / Organic  ·  6 weeks active', 10, C.muted, '400', 'left'));
  els.push(sans(PAD + 60, Y + 50, 200, 14, 'Step 3 of 6  —  50% complete', 10, '#E07055', '600', 'left'));
  // progress bar
  els.push(rect(PAD + 12, Y + 64, FW - PAD * 2 - 24, 4, C.surface2, 2));
  els.push(rect(PAD + 12, Y + 64, Math.round((FW - PAD * 2 - 24) * 0.5), 4, '#E07055', 2));

  // Steps
  const STEPS = [
    { title: 'Brand intake form', detail: 'Completed 12 Mar — 8 min', state: 'done' },
    { title: 'Founder discovery call', detail: 'Completed 15 Mar — 32 min', state: 'done' },
    { title: 'Brand audit & positioning', detail: 'In progress — due 28 Mar', state: 'active' },
    { title: 'Strategy deck review', detail: 'Pending step 3 completion', state: 'pending' },
    { title: 'Launch plan alignment', detail: 'Not started', state: 'pending' },
    { title: 'Go-live & handoff', detail: 'Not started', state: 'pending' },
  ];

  const SY = Y + 92;
  STEPS.forEach((step, i) => {
    const sy = SY + i * 72;
    if (sy + 72 > FH - 80) return;
    els.push(...onboardStep(PAD, sy, FW - PAD * 2, i + 1, step.title, step.detail, step.state));
  });

  // Active step CTA
  const CTAY = SY + 2 * 72 + 8;
  els.push(rect(PAD + 60, CTAY - 8, FW - PAD * 2 - 64, 40, C.forest, 8));
  els.push(sans(PAD + 60, CTAY + 4, FW - PAD * 2 - 64, 24, 'Continue Audit →', 13, C.white, '600', 'center'));

  return frame(0, 0, FW, FH, C.bg, els);
}

// ─── SCREEN 4 — AI INSIGHTS ──────────────────────────────────────────────────
function screenInsights() {
  const els = [
    rect(0, 0, FW, FH, C.bg),
    ...topBar('Insights', null, null),
    ...navBar(3),
  ];

  const Y = 80;

  // Section label
  els.push(sans(PAD, Y + 4, FW - PAD * 2, 16, 'AI-GENERATED  ·  Updated 2h ago', 10, C.muted, '600', 'left'));
  els.push(text(PAD, Y + 22, FW - PAD * 2, 28, 'Portfolio intelligence', 22, C.text, '300', 'left', 'Georgia'));

  // Insight cards in bento layout
  const CY = Y + 60;
  const cw1 = FW - PAD * 2;
  const cw2 = (FW - PAD * 2 - 8) / 2;
  const ch1 = 108;
  const ch2 = 96;

  // Card 1 — wide
  els.push(...insightCard(PAD, CY, cw1, ch1, '📈',
    'Healthy brands growing faster',
    'Brands with health score >80 averaged 34% higher reorder rates this quarter. Maison Colette leads with 3 reorders in 60 days.',
    C.surface));

  // Card 2+3 — half-width
  els.push(...insightCard(PAD, CY + ch1 + 8, cw2, ch2, '⚠️',
    '3 brands show churn signals',
    'Low engagement in last 14 days. Consider outreach.',
    '#FFF4EC'));

  els.push(...insightCard(PAD + cw2 + 8, CY + ch1 + 8, cw2, ch2, '🌱',
    'CPG onboarding 40% faster',
    'New 6-step flow launched 1 March cut avg time by 12 days.',
    '#EEF6EC'));

  // Card 4 — progress stack
  const C4Y = CY + ch1 + 8 + ch2 + 8;
  els.push(rect(PAD, C4Y, cw1, 140, C.surface, 12));
  els.push(sans(PAD + 16, C4Y + 14, cw1 - 32, 16, 'Category health breakdown', 11, C.muted, '500', 'left'));
  const categories = [
    { label: 'Food & Beverage', pct: 88, color: C.sage },
    { label: 'Skincare / Beauty', pct: 75, color: C.forestLt },
    { label: 'Apparel / Fashion', pct: 61, color: C.amber },
    { label: 'CPG / Organic', pct: 49, color: '#E07055' },
  ];
  categories.forEach((cat, i) => {
    els.push(...progressBar(PAD + 16, C4Y + 34 + i * 26, cw1 - 32, cat.label, cat.pct, cat.color));
  });

  return frame(0, 0, FW, FH, C.bg, els);
}

// ─── SCREEN 5 — BRAND PROFILE DETAIL ─────────────────────────────────────────
function screenBrandProfile() {
  const els = [
    rect(0, 0, FW, FH, C.bg),
    ...navBar(1),
  ];

  // Custom top — brand header
  els.push(rect(0, 0, FW, 130, C.surface));
  els.push(rect(0, 129, FW, 1, C.border));
  // Back
  els.push(sans(PAD, 16, 60, 20, '← Back', 12, C.forest, '600', 'left'));
  // Brand name block
  els.push(rect(PAD, 42, 48, 48, C.forest + '18', 10));
  els.push(sans(PAD, 52, 48, 28, 'MC', 18, C.forest, '700', 'center'));
  els.push(text(PAD + 60, 42, FW - PAD * 2 - 60, 24, 'Maison Colette', 18, C.text, '400', 'left', 'Georgia'));
  els.push(sans(PAD + 60, 68, FW - PAD * 2 - 100, 16, 'Food & Beverage  ·  DTC  ·  Active 8mo', 11, C.muted, '400', 'left'));
  els.push(...badge(PAD + 60, 88, 'Healthy', C.sage + '22', C.sage));
  els.push(sans(FW - PAD - 36, 44, 36, 14, '91', 22, C.sage, '700', 'right'));
  els.push(sans(FW - PAD - 36, 68, 36, 14, 'score', 9, C.muted, '400', 'center'));

  const Y = 142;

  // Quick stats row
  const QW = (FW - PAD * 2 - 16) / 3;
  [['NPS', '74', C.forest], ['Orders', '1,204', C.text], ['Resp', '4h', C.sage]].forEach(([l, v, c], i) => {
    const qx = PAD + i * (QW + 8);
    els.push(rect(qx, Y, QW, 64, C.surface, 10));
    els.push(sans(qx + 8, Y + 12, QW - 16, 14, l, 10, C.muted, '400', 'left'));
    els.push(sans(qx + 8, Y + 28, QW - 16, 22, v, 18, c, '600', 'left'));
  });

  // Health chart
  const HY = Y + 76;
  els.push(sans(PAD, HY, FW - PAD * 2, 16, 'HEALTH OVER TIME', 10, C.muted, '600', 'left'));
  els.push(rect(PAD, HY + 20, FW - PAD * 2, 80, C.surface, 10));
  els.push(...miniBarChart(PAD + 12, HY + 24, FW - PAD * 2 - 24, 72,
    [70, 72, 75, 78, 82, 85, 88, 91], ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
    C.forest));

  // Recent activity
  const AY = HY + 116;
  els.push(sans(PAD, AY, FW - PAD * 2, 16, 'RECENT ACTIVITY', 10, C.muted, '600', 'left'));

  const ACTIVITY = [
    { icon: '✓', title: 'Q1 strategy review completed', time: '2 days ago', color: C.sage },
    { icon: '💬', title: 'Founder check-in call (28 min)', time: '5 days ago', color: C.forest },
    { icon: '📄', title: 'New product brief submitted', time: '1 week ago', color: C.amber },
    { icon: '📊', title: 'Monthly insights report sent', time: '2 weeks ago', color: C.muted },
  ];

  ACTIVITY.forEach((act, i) => {
    const ay = AY + 22 + i * 52;
    if (ay + 52 > FH - 80) return;
    els.push(rect(PAD, ay, FW - PAD * 2, 50, C.surface));
    els.push(rect(PAD, ay + 49, FW - PAD * 2, 1, C.border));
    els.push(sans(PAD + 12, ay + 10, 24, 24, act.icon, 16, C.text, '400', 'center'));
    els.push(sans(PAD + 44, ay + 10, FW - PAD * 2 - 130, 18, act.title, 12, C.text, '500', 'left'));
    els.push(sans(PAD + 44, ay + 30, FW - PAD * 2 - 130, 14, act.time, 10, C.muted, '400', 'left'));
    els.push(rect(FW - PAD - 30, ay + 18, 16, 16, act.color + '33', 8));
  });

  return frame(0, 0, FW, FH, C.bg, els);
}

// ─── SCREEN 6 — SETTINGS / PROFILE ───────────────────────────────────────────
function screenSettings() {
  const els = [
    rect(0, 0, FW, FH, C.bg),
    ...topBar('Settings', null, null),
    ...navBar(4),
  ];

  const Y = 80;

  // User profile card
  els.push(rect(PAD, Y, FW - PAD * 2, 80, C.surface, 12));
  els.push(rect(PAD + 16, Y + 20, 40, 40, C.forest, 20));
  els.push(sans(PAD + 16, Y + 28, 40, 24, 'AL', 16, C.white, '700', 'center'));
  els.push(sans(PAD + 68, Y + 20, FW - PAD * 2 - 90, 20, 'Ada Lively', 15, C.text, '600', 'left'));
  els.push(sans(PAD + 68, Y + 44, FW - PAD * 2 - 90, 16, 'Head of Brand Success  ·  Pro plan', 11, C.muted, '400', 'left'));

  // Settings sections
  const SECTIONS = [
    {
      title: 'Account',
      items: ['Profile & preferences', 'Notifications', 'Security & 2FA'],
    },
    {
      title: 'Team',
      items: ['Team members  (4)', 'Roles & permissions', 'Invite new member'],
    },
    {
      title: 'Integrations',
      items: ['Shopify  ✓ Connected', 'Klaviyo  ✓ Connected', 'Notion  ○ Connect'],
    },
    {
      title: 'Plan',
      items: ['Pro — 12 brand seats', 'Billing & invoices', 'Upgrade to Enterprise →'],
    },
  ];

  let sy = Y + 96;
  SECTIONS.forEach(section => {
    els.push(sans(PAD, sy, FW - PAD * 2, 16, section.title.toUpperCase(), 10, C.muted, '600', 'left'));
    sy += 20;
    section.items.forEach(item => {
      els.push(rect(PAD, sy, FW - PAD * 2, 44, C.surface));
      els.push(rect(PAD, sy + 43, FW - PAD * 2, 1, C.border));
      els.push(sans(PAD + 16, sy + 14, FW - PAD * 2 - 50, 18, item, 13, C.text, item.includes('→') ? '600' : '400', 'left'));
      els.push(sans(FW - PAD - 20, sy + 14, 16, 18, '›', 16, C.muted, '300', 'center'));
      sy += 44;
    });
    sy += 12;
    if (sy > FH - 100) return;
  });

  return frame(0, 0, FW, FH, C.bg, els);
}

// ─── ASSEMBLE PEN FILE ───────────────────────────────────────────────────────
const screens = [
  screenOverview(),
  screenBrands(),
  screenOnboard(),
  screenInsights(),
  screenBrandProfile(),
  screenSettings(),
];

const SCREEN_W = FW;
const SCREEN_H = FH;
const GAP      = 80;

const pen = {
  version: '2.8',
  name: 'BLOOM — Brand Success Platform',
  width:  screens.length * (SCREEN_W + GAP) - GAP,
  height: SCREEN_H,
  background: C.bg,
  screens: screens.map((s, i) => ({
    ...s,
    x: i * (SCREEN_W + GAP),
    y: 0,
    name: ['Overview', 'Brands', 'Onboarding', 'Insights', 'Brand Profile', 'Settings'][i],
  })),
};

fs.writeFileSync(path.join(__dirname, 'bloom.pen'), JSON.stringify(pen, null, 2));
console.log('✓ bloom.pen written —', screens.length, 'screens');
