'use strict';
// delta-app.js
// DELTA — A/B experimentation intelligence platform
// Inspired by:
//   - Land-book "Codegen | The OS for Code Agents" — treating workflows as intelligent systems
//   - Linear (darkmodedesign.com) — clean, near-black minimal SaaS with violet accents
//   - Awwwards bento-grid layouts seen in modern SaaS nominees
// NEW PATTERN: Bento grid dashboard (asymmetric 2-col cards of varied height)
// Theme: DARK — deep navy-black + electric violet + cyan win-state

const fs   = require('fs');
const path = require('path');

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const P = {
  bg:        '#08090F',  // near-black, deep navy tint
  surface:   '#0E1018',  // primary surface
  surface2:  '#14172A',  // elevated card
  surface3:  '#1A1E30',  // accent surface / hover
  border:    '#1E2235',  // subtle divider
  border2:   '#283050',  // stronger border
  violet:    '#7C5CF4',  // primary accent — experimentation/confidence
  violetSoft:'rgba(124,92,244,0.14)',
  violetGlow:'rgba(124,92,244,0.06)',
  cyan:      '#22D3EE',  // win-state / statistical significance
  cyanSoft:  'rgba(34,211,238,0.12)',
  amber:     '#F59E0B',  // control/baseline / caution
  amberSoft: 'rgba(245,158,11,0.12)',
  red:       '#F87171',  // losing variant
  redSoft:   'rgba(248,113,113,0.10)',
  green:     '#34D399',  // positive delta
  greenSoft: 'rgba(52,211,153,0.10)',
  text:      '#E6E8F6',  // primary text
  textMid:   'rgba(230,232,246,0.6)',
  muted:     'rgba(230,232,246,0.32)',
  card:      '#0E1018',
};

const W  = 375;
const H  = 812;
const GAP = 72;

let _id = 1;
const uid = () => `el${_id++}`;

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  const o = {
    type: 'RECTANGLE', id: uid(), x, y, w, h, fill,
    cornerRadius: opts.r || 0,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
  };
  if (opts.stroke) { o.stroke = opts.stroke; o.strokeWidth = opts.sw || 1; }
  return o;
}

function text(x, y, w, content, size, color, opts = {}) {
  return {
    type: 'TEXT', id: uid(), x, y, w, content,
    fontSize: size, color,
    fontWeight: opts.bold ? 700 : opts.semi ? 600 : opts.medium ? 500 : opts.light ? 300 : 400,
    fontFamily: opts.mono ? 'JetBrains Mono, monospace' : 'Inter',
    textAlign: opts.center ? 'center' : opts.right ? 'right' : 'left',
    lineHeight: opts.lh || (size <= 11 ? 1.5 : size <= 15 ? 1.45 : 1.3),
    letterSpacing: opts.ls || 0,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
  };
}

function frame(x, y, w, h, children, bg, opts = {}) {
  const f = {
    type: 'FRAME', id: uid(), x, y, w, h,
    fill: bg || 'transparent', clip: true,
    children: children.filter(Boolean).flat(),
  };
  if (opts.r) f.cornerRadius = opts.r;
  if (opts.stroke) { f.stroke = opts.stroke; f.strokeWidth = opts.sw || 1; }
  return f;
}

// Card helper
function card(x, y, w, h, children, opts = {}) {
  return frame(x, y, w, h, children, opts.fill || P.surface, {
    r: opts.r !== undefined ? opts.r : 14,
    stroke: opts.stroke || P.border,
    sw: opts.sw || 1,
  });
}

// Status bar
function statusBar(x, y) {
  return [
    text(x + 20, y + 15, 50, '9:41', 13, P.textMid, { semi: true }),
    text(x + W - 80, y + 15, 70, '▲ ⬛  ⬛', 11, P.muted, { right: true }),
  ];
}

// Bottom nav
function navBar(x, y, active) {
  const items = [
    { label: 'Home',    sym: '◉' },
    { label: 'Tests',   sym: '⧖' },
    { label: '+',       sym: '+' },
    { label: 'Insight', sym: '◈' },
    { label: 'Settings',sym: '⚙' },
  ];
  return [
    rect(x, y, W, 60, P.surface, { stroke: P.border, sw: 1 }),
    ...items.map((item, i) => {
      const ix = x + 19 + i * 67;
      const isActive = i === active;
      return [
        ...(isActive ? [rect(ix + 22, y + 4, 24, 3, P.violet, { r: 2 })] : []),
        text(ix, y + 12, 68, item.sym, i === 2 ? 20 : 18,
          isActive ? P.violet : P.muted,
          { center: true, bold: isActive }),
        text(ix, y + 36, 68, item.label, 9,
          isActive ? P.violet : P.muted,
          { center: true, medium: !isActive, bold: isActive, ls: 0.02 }),
      ];
    }).flat(),
  ];
}

// Chip / badge helper
function chip(x, y, label, textColor, bgColor, opts = {}) {
  const w = opts.w || (label.length * 6.5 + 14);
  const h = opts.h || 20;
  return [
    rect(x, y, w, h, bgColor, { r: opts.r !== undefined ? opts.r : h / 2 }),
    text(x, y + 3, w, label, opts.size || 9, textColor, { center: true, bold: true, ls: 0.04 }),
  ];
}

// Progress bar
function progressBar(x, y, w, pct, fill, bg) {
  const trackH = 5;
  return [
    rect(x, y, w, trackH, bg || P.border2, { r: 3 }),
    rect(x, y, Math.round(w * pct), trackH, fill, { r: 3 }),
  ];
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Dashboard (Bento Grid)
// ══════════════════════════════════════════════════════════════════════════════
function screenDashboard(ox, oy) {
  const ch = [];

  // Background
  ch.push(rect(ox, oy, W, H, P.bg));

  // Status bar
  ch.push(...statusBar(ox, oy));

  // Header
  ch.push(text(ox + 20, oy + 48, 120, 'DELTA', 18, P.violet, { bold: true, ls: 0.12, mono: true }));
  ch.push(text(ox + 20, oy + 70, 140, 'Experimentation', 11, P.muted, { ls: 0.04 }));
  // Header right — notif + new
  ch.push(...chip(ox + W - 82, oy + 54, '+ New', P.violet, P.violetSoft, { w: 62, h: 26, r: 13 }));
  ch.push(text(ox + W - 44, oy + 54, 30, '🔔', 14, P.textMid, { center: true }));

  // ── BENTO GRID ─────────────────────────────────────────────────────────────
  const by = oy + 102;

  // Row 0: Full-width summary strip
  ch.push(rect(ox + 16, by, W - 32, 44, P.violetGlow, { r: 12, stroke: P.border, sw: 1 }));
  ch.push(text(ox + 28, by + 10, 100, 'Running', 10, P.muted, { ls: 0.04 }));
  ch.push(text(ox + 28, by + 24, 40, '14', 13, P.text, { bold: true }));
  ch.push(rect(ox + 105, by + 8, 1, 28, P.border));
  ch.push(text(ox + 115, by + 10, 100, 'Concluding', 10, P.muted, { ls: 0.04 }));
  ch.push(text(ox + 115, by + 24, 40, '6', 13, P.amber, { bold: true }));
  ch.push(rect(ox + 198, by + 8, 1, 28, P.border));
  ch.push(text(ox + 208, by + 10, 100, 'This month', 10, P.muted, { ls: 0.04 }));
  ch.push(text(ox + 208, by + 24, 80, '23 done', 13, P.cyan, { bold: true }));

  const row1y = by + 56;
  // ── Row 1 Left: Win Rate (square small)
  ch.push(...[
    rect(ox + 16, row1y, 132, 112, P.surface, { r: 14, stroke: P.border, sw: 1 }),
    text(ox + 28, row1y + 14, 100, 'WIN RATE', 9, P.muted, { ls: 0.08, medium: true }),
    text(ox + 28, row1y + 34, 100, '71%', 34, P.text, { bold: true }),
    text(ox + 28, row1y + 72, 100, '↑ +6pp vs last month', 10, P.green, { medium: true }),
    text(ox + 28, row1y + 88, 100, 'last 30 days', 9, P.muted),
  ]);

  // ── Row 1 Right: Top Experiment (tall)
  ch.push(...[
    rect(ox + 160, row1y, W - 176, 172, P.surface, { r: 14, stroke: P.border, sw: 1 }),
    text(ox + 174, row1y + 14, 160, 'TOP EXPERIMENT', 9, P.muted, { ls: 0.08, medium: true }),
    text(ox + 174, row1y + 32, 175, 'Checkout CTA Copy', 13, P.text, { semi: true }),
    // variant badges
    ...chip(ox + 174, row1y + 54, 'Variant B', P.cyan, P.cyanSoft, { w: 72, h: 22, r: 6 }),
    ...chip(ox + 254, row1y + 54, 'WINNING', P.cyan, P.cyanSoft, { w: 58, h: 22, r: 6 }),
    text(ox + 174, row1y + 88, 170, '+14.2%', 28, P.cyan, { bold: true }),
    text(ox + 174, row1y + 120, 170, 'CVR uplift vs control', 10, P.textMid),
    ...progressBar(ox + 174, row1y + 146, W - 194, 0.94, P.violet, P.border2),
    text(ox + 174, row1y + 154, 100, '94% confidence', 9, P.muted),
  ]);

  const row2y = row1y + 184;
  // ── Row 2 Left: Time to significance (square small — completes bento left col)
  ch.push(...[
    rect(ox + 16, row2y - 72, 132, 60, P.surface, { r: 14, stroke: P.border, sw: 1 }),
    text(ox + 28, row2y - 58, 108, 'AVG TIME', 9, P.muted, { ls: 0.08, medium: true }),
    text(ox + 28, row2y - 42, 108, '8.4d', 22, P.text, { bold: true }),
    text(ox + 28, row2y - 24, 108, 'to significance', 9, P.muted),
  ]);

  // ── Row 2: Full-width AI Insight banner
  ch.push(rect(ox + 16, row2y, W - 32, 60, P.violetGlow, { r: 12, stroke: P.violetSoft, sw: 1 }));
  ch.push(...chip(ox + 28, row2y + 10, 'AI INSIGHT', P.violet, P.violetSoft, { w: 72, h: 18, r: 4 }));
  ch.push(text(ox + 28, row2y + 34, W - 58, '3 experiments share the same audience — consider batching to reduce runtime.', 11, P.textMid, { lh: 1.45 }));

  const row3y = row2y + 72;
  // ── Row 3: 2-col metric pair
  const metricCards = [
    { label: 'SRM ALERTS', value: '0', sub: 'No sample ratio mismatches', fill: P.surface, textColor: P.green },
    { label: 'QUEUE', value: '8', sub: 'Experiments awaiting launch', fill: P.surface, textColor: P.amber },
  ];
  metricCards.forEach((m, i) => {
    const mx = ox + 16 + i * (W - 32) / 2 + (i > 0 ? 8 : 0);
    const mw = (W - 48) / 2;
    ch.push(rect(mx, row3y, mw, 76, m.fill, { r: 14, stroke: P.border, sw: 1 }));
    ch.push(text(mx + 14, row3y + 14, mw - 28, m.label, 9, P.muted, { ls: 0.08, medium: true }));
    ch.push(text(mx + 14, row3y + 32, 80, m.value, 22, m.textColor, { bold: true }));
    ch.push(text(mx + 14, row3y + 56, mw - 28, m.sub, 9, P.muted, { lh: 1.4 }));
  });

  // Bottom nav
  ch.push(...navBar(ox, oy + H - 60, 0));

  return frame(ox, oy, W, H, ch, P.bg, {});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Experiments List
// ══════════════════════════════════════════════════════════════════════════════
function screenExperiments(ox, oy) {
  const ch = [];
  ch.push(rect(ox, oy, W, H, P.bg));
  ch.push(...statusBar(ox, oy));

  // Header
  ch.push(text(ox + 20, oy + 48, W - 40, 'Experiments', 22, P.text, { bold: true }));
  ch.push(...chip(ox + W - 60, oy + 52, '+ New', P.violet, P.violetSoft, { w: 52, h: 26, r: 13 }));

  // Segmented control
  const tabs = ['Running', 'Concluded', 'Archived'];
  const segX = ox + 20, segY = oy + 88;
  ch.push(rect(segX, segY, W - 40, 34, P.surface, { r: 8, stroke: P.border, sw: 1 }));
  tabs.forEach((t, i) => {
    const tw = (W - 40) / 3;
    const tx = segX + i * tw;
    if (i === 0) {
      ch.push(rect(tx, segY, tw, 34, P.violetSoft, { r: 8 }));
    }
    ch.push(text(tx, segY + 9, tw, t, 12, i === 0 ? P.violet : P.muted,
      { center: true, semi: i === 0, medium: i !== 0 }));
  });

  // Experiment list
  const exps = [
    { name: 'Checkout CTA Copy', type: 'Copy', variants: 3, confidence: 94, days: 12, status: 'WINNING', statusColor: P.cyan, statusBg: P.cyanSoft, delta: '+14.2%', deltaColor: P.cyan },
    { name: 'Homepage Hero Layout', type: 'Layout', variants: 2, confidence: 81, days: 7, status: 'RUNNING', statusColor: P.amber, statusBg: P.amberSoft, delta: '+6.4%', deltaColor: P.green },
    { name: 'Pricing Page V3', type: 'Pricing', variants: 4, confidence: 67, days: 3, status: 'EARLY', statusColor: P.textMid, statusBg: P.border, delta: '—', deltaColor: P.muted },
    { name: 'Onboarding Step 2', type: 'Flow', variants: 2, confidence: 73, days: 9, status: 'RUNNING', statusColor: P.amber, statusBg: P.amberSoft, delta: '+3.1%', deltaColor: P.green },
    { name: 'Email Subject Line', type: 'Copy', variants: 3, confidence: 88, days: 11, status: 'CONCLUDING', statusColor: P.violet, statusBg: P.violetSoft, delta: '+8.9%', deltaColor: P.cyan },
  ];

  exps.forEach((exp, i) => {
    const ey = oy + 140 + i * 100;
    const ew = W - 32;
    ch.push(rect(ox + 16, ey, ew, 90, P.surface, { r: 14, stroke: P.border, sw: 1 }));

    // Experiment name + type
    ch.push(text(ox + 30, ey + 14, ew - 100, exp.name, 14, P.text, { semi: true }));
    ch.push(...chip(ox + 30, ey + 34, exp.type, P.textMid, P.surface3, { w: exp.type.length * 6.5 + 14, h: 18, r: 4, size: 9 }));
    ch.push(text(ox + 30 + exp.type.length * 6.5 + 24, ey + 35, 80, `${exp.variants} variants`, 10, P.muted));

    // Right side: delta + status
    ch.push(text(ox + ew - 10, ey + 14, 80, exp.delta, 15, exp.deltaColor, { right: true, bold: true }));
    ch.push(...chip(ox + ew - 14 - (exp.status.length * 6 + 12), ey + 36, exp.status, exp.statusColor, exp.statusBg,
      { w: exp.status.length * 6 + 12, h: 18, r: 4, size: 9 }));

    // Confidence bar
    ch.push(text(ox + 30, ey + 64, 80, `${exp.confidence}% conf`, 10, P.muted));
    ch.push(text(ox + 30 + 80 + 8, ey + 64, 60, `${exp.days}d`, 10, P.muted));
    ch.push(...progressBar(ox + ew - 90, ey + 66, 74, exp.confidence / 100, exp.statusColor, P.border2));
  });

  ch.push(...navBar(ox, oy + H - 60, 1));
  return frame(ox, oy, W, H, ch, P.bg, {});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Experiment Detail
// ══════════════════════════════════════════════════════════════════════════════
function screenDetail(ox, oy) {
  const ch = [];
  ch.push(rect(ox, oy, W, H, P.bg));
  ch.push(...statusBar(ox, oy));

  // Back nav
  ch.push(text(ox + 20, oy + 50, 30, '‹', 22, P.textMid));
  ch.push(text(ox + 40, oy + 52, 200, 'Checkout CTA Copy', 15, P.text, { semi: true }));
  ch.push(...chip(ox + W - 80, oy + 52, 'WINNING', P.cyan, P.cyanSoft, { w: 64, h: 22, r: 6, size: 9 }));

  // Hypothesis block
  const hypY = oy + 90;
  ch.push(rect(ox + 16, hypY, W - 32, 58, P.surface, { r: 12, stroke: P.border, sw: 1 }));
  ch.push(...chip(ox + 28, hypY + 10, 'HYPOTHESIS', P.muted, P.surface3, { w: 80, h: 16, r: 4, size: 9 }));
  ch.push(text(ox + 28, hypY + 32, W - 58, 'Changing "Buy Now" to "Start free trial" will increase checkout CVR among first-time visitors.', 11, P.textMid, { lh: 1.5 }));

  // Metric strip
  const metY = hypY + 68;
  ch.push(rect(ox + 16, metY, W - 32, 38, P.surface3, { r: 10, stroke: P.border, sw: 1 }));
  ch.push(text(ox + 28, metY + 12, 100, 'Metric: CVR', 11, P.text, { medium: true }));
  ch.push(text(ox + 28 + 100 + 8, metY + 12, 100, 'Traffic: 50/50', 11, P.muted));
  ch.push(text(ox + W - 100, metY + 12, 80, '12 days running', 11, P.muted, { right: true }));

  // Variants
  const variants = [
    { label: 'CONTROL', name: '"Buy Now"', cvr: '3.2%', delta: 'baseline', conf: 50, status: 'Baseline', statusColor: P.muted, statusBg: P.surface3, barColor: P.border2 },
    { label: 'VARIANT A', name: '"Get Started"', cvr: '3.8%', delta: '+18.8%', conf: 76, status: 'Promising', statusColor: P.amber, statusBg: P.amberSoft, barColor: P.amber },
    { label: 'VARIANT B', name: '"Start free trial"', cvr: '3.65%', delta: '+14.2%', conf: 94, status: '★ Winner', statusColor: P.cyan, statusBg: P.cyanSoft, barColor: P.cyan },
  ];

  variants.forEach((v, i) => {
    const vy = metY + 50 + i * 100;
    const vw = W - 32;
    const isWinner = i === 2;
    ch.push(rect(ox + 16, vy, vw, 88,
      isWinner ? P.surface2 : P.surface,
      { r: 14, stroke: isWinner ? P.cyan : P.border, sw: isWinner ? 1.5 : 1 }));

    ch.push(...chip(ox + 28, vy + 12, v.label, v.statusColor, v.statusBg, { w: v.label.length * 6.5 + 14, h: 18, r: 4, size: 9 }));
    ch.push(text(ox + 28, vy + 36, 200, v.name, 14, P.text, { semi: true }));

    // Metrics right
    ch.push(text(ox + vw - 6, vy + 16, 80, v.cvr, 16, P.text, { right: true, bold: true }));
    ch.push(text(ox + vw - 6, vy + 36, 80, v.delta, 12, i === 0 ? P.muted : P.green, { right: true, medium: true }));

    // Confidence bar
    ch.push(text(ox + 28, vy + 62, 80, `${v.conf}% confidence`, 10, P.muted));
    ch.push(...progressBar(ox + vw - 100, vy + 64, 84, v.conf / 100, v.barColor, P.border2));
  });

  // AI Recommendation
  const recY = metY + 350;
  ch.push(rect(ox + 16, recY, W - 32, 82, P.violetGlow, { r: 14, stroke: P.violetSoft, sw: 1 }));
  ch.push(...chip(ox + 28, recY + 12, 'AI RECOMMENDATION', P.violet, P.violetSoft, { w: 136, h: 18, r: 4, size: 9 }));
  ch.push(text(ox + 28, recY + 36, W - 58, '"Declare Variant B winner at 94% confidence. Suggest rolling out to 100% of traffic. Expected annual uplift: +$84K."', 11, P.textMid, { lh: 1.5 }));

  // CTA
  const ctaY = recY + 94;
  ch.push(rect(ox + 16, ctaY, W - 32, 48, P.violet, { r: 14 }));
  ch.push(text(ox + 16, ctaY + 14, W - 32, 'Apply Winner to 100% Traffic', 14, '#FFFFFF', { bold: true, center: true }));

  ch.push(...navBar(ox, oy + H - 60, 1));
  return frame(ox, oy, W, H, ch, P.bg, {});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Create Experiment
// ══════════════════════════════════════════════════════════════════════════════
function screenCreate(ox, oy) {
  const ch = [];
  ch.push(rect(ox, oy, W, H, P.bg));
  ch.push(...statusBar(ox, oy));

  ch.push(text(ox + 20, oy + 50, 30, '✕', 18, P.muted));
  ch.push(text(ox + 20, oy + 72, W - 40, 'New Experiment', 22, P.text, { bold: true }));
  ch.push(text(ox + 20, oy + 98, W - 40, 'Define your hypothesis and traffic allocation', 12, P.muted));

  // Form fields
  const fields = [
    { label: 'NAME', placeholder: 'Checkout CTA Button Copy', value: 'Checkout CTA Copy Test', active: false },
    { label: 'HYPOTHESIS', placeholder: 'If we change X, then Y will happen because Z…', value: 'Changing "Buy Now" to "Start free trial" will increase CVR for new visitors.', active: true, tall: true },
    { label: 'PRIMARY METRIC', placeholder: 'Select metric…', value: 'Checkout CVR', active: false, select: true },
    { label: 'AUDIENCE', placeholder: 'All users', value: 'New visitors · Desktop only', active: false, select: true },
  ];

  let fy = oy + 124;
  fields.forEach((f) => {
    const fh = f.tall ? 74 : 52;
    ch.push(text(ox + 20, fy, W - 40, f.label, 9, P.muted, { ls: 0.08, medium: true }));
    fy += 16;
    ch.push(rect(ox + 16, fy, W - 32, fh,
      f.active ? P.surface2 : P.surface,
      { r: 10, stroke: f.active ? P.violet : P.border, sw: f.active ? 1.5 : 1 }));
    ch.push(text(ox + 28, fy + (f.tall ? 14 : 16), W - 72, f.value, 13, P.text, { lh: 1.5 }));
    if (f.select) {
      ch.push(text(ox + W - 38, fy + 16, 20, '⌄', 16, P.muted));
    }
    fy += fh + 16;
  });

  // Traffic split
  ch.push(text(ox + 20, fy, 100, 'TRAFFIC SPLIT', 9, P.muted, { ls: 0.08, medium: true }));
  fy += 16;
  ch.push(rect(ox + 16, fy, W - 32, 44, P.surface, { r: 10, stroke: P.border, sw: 1 }));
  const splits = ['50/50', '80/20', '33/33/33'];
  splits.forEach((s, i) => {
    const sw = 90;
    const sx = ox + 26 + i * 96;
    const isActive = i === 0;
    ch.push(rect(sx, fy + 10, sw, 24, isActive ? P.violetSoft : 'transparent', { r: 6 }));
    ch.push(text(sx, fy + 16, sw, s, 11, isActive ? P.violet : P.muted,
      { center: true, semi: isActive, medium: !isActive }));
  });
  fy += 56;

  // Variants
  ch.push(text(ox + 20, fy, 100, 'VARIANTS', 9, P.muted, { ls: 0.08, medium: true }));
  fy += 16;
  ['Control (default)', 'Variant A', '+ Add variant'].forEach((v, i) => {
    const isAdd = i === 2;
    ch.push(rect(ox + 16, fy, W - 32, 40,
      isAdd ? 'transparent' : P.surface,
      { r: 10, stroke: isAdd ? P.violetSoft : P.border, sw: 1 }));
    ch.push(text(ox + 28, fy + 12, W - 70, v, 12,
      isAdd ? P.violet : P.text, { medium: !isAdd, semi: false }));
    if (!isAdd) ch.push(text(ox + W - 36, fy + 12, 20, '⚙', 14, P.muted));
    fy += 48;
  });

  // Launch CTA
  const ctaY = oy + H - 112;
  ch.push(rect(ox + 16, ctaY, W - 32, 48, P.violet, { r: 14 }));
  ch.push(text(ox + 16, ctaY + 14, W - 32, 'Launch Experiment', 14, '#FFFFFF', { bold: true, center: true }));
  ch.push(text(ox + 16, ctaY + 54, W - 32, 'Results will be emailed when significant', 11, P.muted, { center: true }));

  ch.push(...navBar(ox, oy + H - 60, 2));
  return frame(ox, oy, W, H, ch, P.bg, {});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Insights (Pattern Intelligence)
// ══════════════════════════════════════════════════════════════════════════════
function screenInsights(ox, oy) {
  const ch = [];
  ch.push(rect(ox, oy, W, H, P.bg));
  ch.push(...statusBar(ox, oy));

  ch.push(text(ox + 20, oy + 50, W - 40, 'Pattern Intelligence', 22, P.text, { bold: true }));
  ch.push(text(ox + 20, oy + 76, W - 40, 'What your experiments are teaching you', 12, P.muted));

  // Monthly summary
  const msY = oy + 108;
  ch.push(rect(ox + 16, msY, W - 32, 56, P.surface, { r: 14, stroke: P.border, sw: 1 }));
  ch.push(text(ox + 28, msY + 12, 100, 'MARCH 2026', 9, P.muted, { ls: 0.08, medium: true }));
  const sumStats = [
    { label: 'Experiments', val: '23' },
    { label: 'Winners', val: '16' },
    { label: 'Win Rate', val: '70%' },
    { label: 'Avg Uplift', val: '+9.4%' },
  ];
  sumStats.forEach((s, i) => {
    const sx = ox + 28 + i * 82;
    ch.push(text(sx, msY + 30, 78, s.val, 14, P.text, { bold: true }));
    ch.push(text(sx, msY + 46, 78, s.label, 9, P.muted));
  });

  // AI Learnings
  ch.push(text(ox + 20, msY + 70, W - 40, 'AI Learnings', 15, P.text, { semi: true }));

  const learnings = [
    { icon: '◈', insight: 'Headlines outperform button CTAs', detail: '2.4× higher lift on average in your experiments', acc: '87%', color: P.violet },
    { icon: '◈', insight: 'Mobile users respond to urgency', detail: '"Limited" and "Last chance" copy variants win 73% of the time on mobile', acc: '79%', color: P.cyan },
    { icon: '◈', insight: 'Pricing page experiments take longer', detail: 'Avg 14.2d to significance vs 7.1d for homepage tests', acc: '94%', color: P.amber },
  ];

  learnings.forEach((l, i) => {
    const ly = msY + 100 + i * 100;
    ch.push(rect(ox + 16, ly, W - 32, 88, P.surface, { r: 14, stroke: P.border, sw: 1 }));
    ch.push(text(ox + 28, ly + 14, 22, l.icon, 16, l.color, { bold: true }));
    ch.push(text(ox + 54, ly + 12, W - 88, l.insight, 13, P.text, { semi: true }));
    ch.push(text(ox + 28, ly + 36, W - 58, l.detail, 11, P.textMid, { lh: 1.45 }));
    ch.push(rect(ox + 28, ly + 66, W - 58, 4, P.border2, { r: 2 }));
    ch.push(rect(ox + 28, ly + 66, Math.round((W - 58) * parseInt(l.acc) / 100), 4, l.color, { r: 2 }));
    ch.push(text(ox + W - 56, ly + 60, 40, l.acc + ' acc', 9, P.muted, { right: true }));
  });

  // Best-performing template
  const tplY = msY + 400;
  ch.push(text(ox + 20, tplY, W - 40, 'Top Template', 15, P.text, { semi: true }));
  ch.push(rect(ox + 16, tplY + 24, W - 32, 72, P.surface2, { r: 14, stroke: P.violet, sw: 1 }));
  ch.push(...chip(ox + 28, tplY + 36, 'MOST WINS', P.violet, P.violetSoft, { w: 72, h: 18, r: 4, size: 9 }));
  ch.push(text(ox + 28, tplY + 60, W - 58, 'Hero CTA Split Test — 83% win rate across 12 uses', 12, P.text, { medium: true }));
  ch.push(text(ox + W - 80, tplY + 62, 68, 'Use template →', 11, P.violet, { right: true, medium: true }));

  ch.push(...navBar(ox, oy + H - 60, 3));
  return frame(ox, oy, W, H, ch, P.bg, {});
}

// ── COMPOSE ───────────────────────────────────────────────────────────────────
const totalW = W * 5 + GAP * 4;
const pen = {
  version: '2.8',
  name: 'DELTA — A/B experimentation intelligence',
  width: totalW,
  height: H,
  fill: '#06070C',
  children: [
    screenDashboard(0,           0),
    screenExperiments(W + GAP,   0),
    screenDetail((W + GAP) * 2,  0),
    screenCreate((W + GAP) * 3,  0),
    screenInsights((W + GAP) * 4,0),
  ],
};

const out = path.join(__dirname, 'delta.pen');
fs.writeFileSync(out, JSON.stringify(pen, null, 2));
const n = (JSON.stringify(pen).match(/"type"/g) || []).length;
console.log(`✓ Written: ${out}`);
console.log(`  Screens: 5`);
console.log(`  Canvas:  ${totalW} × ${H}`);
console.log(`  Nodes:   ~${n}`);
console.log(`  Theme:   DARK — #08090F + Violet #7C5CF4 + Cyan #22D3EE`);
console.log(`  Inspired by: Codegen (land-book) + Linear (darkmodedesign.com)`);
