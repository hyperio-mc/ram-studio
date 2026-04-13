'use strict';
const fs = require('fs'), path = require('path');

// ─── EASE: Recovery-Aware Training Companion ──────────────────────────────
// Heartbeat #502 — Light theme
// Inspired by:
//   · Mobbin 2026 Apple Design Award category: Gentler Streak — recovery-aware
//     fitness tracking where REST is the primary metric, not a gap in data.
//     Calm visual system, light palette, anti-neon fitness aesthetic.
//   · Siteinspire editorial restraint aesthetic: warm mineral palette, negative
//     space as structure, typographic confidence over decorative elements.
//     Off-white #F6F3EE / warm stone / terracotta accent / deep umber text.
//   · NNGroup "Handmade Designs: The New Trust Signal" (Apr 2026): deliberate
//     craftsmanship visible in type choices and spacing. App that looks too
//     generated loses credibility. Visible grid logic + precise micro-spacing.
//   · Awwwards: fluid variable-weight type scaling — weight as the primary
//     hierarchy signal on light surfaces (not just size or colour).
// ─────────────────────────────────────────────────────────────────────────────

const SLUG = 'ease';
const W = 390, H = 844;

// ─── PALETTE — Warm mineral, editorial restraint ──────────────────────────
const BG       = '#F6F3EE';   // warm parchment (Siteinspire mineral off-white)
const SURF     = '#FFFFFF';   // pure white card
const CARD     = '#EDE9E1';   // warm stone card
const CARD2    = '#E5E0D6';   // deeper stone
const BORDER   = '#D8D0C4';   // stone border
const TEXT     = '#1E1914';   // warm near-black (umber-tinted)
const TEXT2    = '#7A6E62';   // warm mid-brown
const MUTED    = '#B5A99A';   // muted stone
const TERRA    = '#C4623C';   // terracotta accent (anti-neon, earthy)
const TERRA_L  = '#F3E5DF';   // terracotta tint
const TERRA_D  = '#8C3D22';   // deep terracotta
const SAGE     = '#5C7A5E';   // recovery green (calm, not electric)
const SAGE_L   = '#E2EDE3';   // sage tint
const AMBER    = '#C98B2A';   // amber/gold for moderate
const AMBER_L  = '#F5EDD8';   // amber tint
const SERIF    = 'Georgia,serif';  // for score readouts and pull quotes
const SANS     = 'Inter,sans-serif';
const TIGHT    = 'Inter Tight,Inter,sans-serif';

const NAV_Y = H - 72;

function rect(x,y,w,h,fill,opts={}) { return { type:'rect', x, y, w, h, fill, ...opts }; }
function text(x,y,content,size,fill,opts={}) { return { type:'text', x, y, content: String(content), size, fill, ...opts }; }
function circle(cx,cy,r,fill,opts={}) { return { type:'circle', cx, cy, r, fill, ...opts }; }
function line(x1,y1,x2,y2,stroke,opts={}) { return { type:'line', x1, y1, x2, y2, stroke, ...opts }; }

// ──────────────────────────────────────────────────────
// SCREEN 1: TODAY — Body readiness dashboard
// ──────────────────────────────────────────────────────
function buildToday() {
  const s = [];
  s.push(rect(0, 0, W, H, BG));

  // Subtle paper grain — horizontal lines
  for (let y = 0; y < H; y += 16) {
    s.push(line(0, y, W, y, 'rgba(30,25,20,0.025)', { sw: 1 }));
  }

  // Status bar
  s.push(text(16, 28, '9:41', 15, TEXT, { fw: 400 }));
  s.push(text(W - 16, 28, '●●●  ◆  89%', 12, TEXT2, { anchor: 'end' }));

  // Header
  s.push(text(20, 62, 'EASE', 13, TERRA, { fw: 700, ls: 3, font: TIGHT }));
  s.push(text(20, 88, 'Monday, Apr 13', 24, TEXT, { fw: 300, font: SERIF }));
  s.push(text(20, 112, 'Good morning, Jordan.', 15, TEXT2));

  s.push(line(20, 128, W - 20, 128, BORDER, { sw: 0.5 }));

  // READINESS SCORE — big serif number (anti-neon, warm)
  s.push(rect(20, 142, W - 40, 160, SURF, { rx: 20, stroke: BORDER, sw: 1 }));
  // Score arc background
  s.push(circle(W / 2, 216, 54, CARD));
  s.push(circle(W / 2, 216, 50, BG));
  // Score fill arc — terracotta (72 = moderate-good)
  for (let a = -130; a < -130 + (72/100) * 260; a += 4) {
    const rad = (a * Math.PI) / 180;
    const cx = W / 2 + Math.cos(rad) * 50;
    const cy = 216 + Math.sin(rad) * 50;
    s.push(circle(cx, cy, 3, TERRA));
  }
  s.push(text(W / 2, 224, '72', 40, TEXT, { anchor: 'middle', font: SERIF, fw: 400 }));
  s.push(text(W / 2, 246, 'Readiness', 11, TEXT2, { anchor: 'middle', font: TIGHT }));
  s.push(text(36, 174, 'BODY READY?', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));
  s.push(text(36, 192, 'Moderate — train light today', 14, TEXT));
  s.push(text(36, 288, 'Based on sleep, HRV & yesterday\'s load', 11, TEXT2));

  s.push(line(20, 314, W - 20, 314, BORDER, { sw: 0.4 }));

  // Recovery signals — 3 pillars
  s.push(text(20, 334, 'RECOVERY SIGNALS', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));

  const signals = [
    { label: 'Sleep Quality', val: '7h 22m', score: 78, icon: '◐' },
    { label: 'HRV',          val: '52 ms',  score: 65, icon: '◇' },
    { label: 'Resting HR',   val: '58 bpm', score: 82, icon: '◈' },
  ];
  signals.forEach((sig, i) => {
    const sy = 350 + i * 70;
    s.push(rect(20, sy, W - 40, 60, SURF, { rx: 12, stroke: BORDER, sw: 0.5 }));
    s.push(text(36, sy + 24, sig.icon, 14, TERRA));
    s.push(text(56, sy + 22, sig.label, 13, TEXT, { fw: 500 }));
    s.push(text(56, sy + 38, sig.val, 12, TEXT2));
    // Score bar
    const barW = (W - 140) * (sig.score / 100);
    s.push(rect(W - 100, sy + 24, 70, 6, CARD, { rx: 3 }));
    s.push(rect(W - 100, sy + 24, barW * 0.9, 6, sig.score > 75 ? SAGE : sig.score > 55 ? AMBER : TERRA, { rx: 3 }));
    s.push(text(W - 24, sy + 30, sig.score, 11, TEXT2, { anchor: 'end', font: TIGHT }));
  });

  // Rest is data note — editorial
  s.push(line(20, 566, W - 20, 566, BORDER, { sw: 0.4 }));
  s.push(rect(20, 578, W - 40, 72, TERRA_L, { rx: 14 }));
  s.push(text(36, 600, 'Rest is data,', 16, TERRA_D, { font: SERIF, fw: 400 }));
  s.push(text(36, 620, 'not a gap in your log.', 16, TERRA_D, { font: SERIF, fw: 400 }));
  s.push(text(36, 639, 'Your recovery window is part of the plan.', 11, TERRA, { font: TIGHT }));

  // Today's recommendation
  s.push(line(20, 662, W - 20, 662, BORDER, { sw: 0.4 }));
  s.push(text(20, 682, 'TODAY\'S PLAN', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));
  s.push(rect(20, 694, W - 40, 54, SURF, { rx: 14, stroke: BORDER, sw: 0.5 }));
  s.push(text(36, 718, '◎ 30 min easy run — Zone 2 only', 14, TEXT, { fw: 400 }));
  s.push(text(36, 736, 'Or: yoga, walk, or full rest', 12, TEXT2));
  s.push(text(W - 36, 718, '→', 16, TERRA, { anchor: 'end' }));

  _addNav(s, 'today');
  return s;
}

// ──────────────────────────────────────────────────────
// SCREEN 2: LOG — Recovery journal check-in
// One-question-at-a-time UI (Ada Health pattern, Mobbin)
// ──────────────────────────────────────────────────────
function buildLog() {
  const s = [];
  s.push(rect(0, 0, W, H, BG));
  for (let y = 0; y < H; y += 16) s.push(line(0, y, W, y, 'rgba(30,25,20,0.025)', { sw: 1 }));

  s.push(text(16, 28, '9:41', 15, TEXT, { fw: 400 }));
  s.push(text(W - 16, 28, '●●●  89%', 12, TEXT2, { anchor: 'end' }));

  // Progress dots — one-at-a-time check-in
  const steps = 5;
  const currentStep = 2;
  s.push(text(20, 62, 'CHECK-IN', 11, TERRA, { fw: 700, ls: 2.5, font: TIGHT }));
  for (let i = 0; i < steps; i++) {
    const dx = W / 2 - (steps / 2) * 24 + i * 24;
    s.push(circle(dx, 78, i < currentStep ? 5 : 4, i < currentStep ? TERRA : BORDER));
    if (i > 0) s.push(line(dx - 19, 78, dx - 10, 78, i <= currentStep - 1 ? TERRA : BORDER, { sw: 1 }));
  }

  // The question — big serif (editorial presence)
  s.push(text(20, 130, 'How did you sleep?', 30, TEXT, { font: SERIF, fw: 400 }));
  s.push(text(20, 164, 'Step 2 of 5', 12, TEXT2));

  s.push(line(20, 182, W - 20, 182, BORDER, { sw: 0.4 }));

  // Answer options — clean tap targets
  const sleepOptions = [
    { label: 'Deep and uninterrupted', icon: '●●●', sel: false },
    { label: 'Mostly good, few wake-ups', icon: '●●○', sel: true },
    { label: 'Restless, woke often',     icon: '●○○', sel: false },
    { label: 'Terrible — barely slept',  icon: '○○○', sel: false },
  ];
  sleepOptions.forEach((opt, i) => {
    const oy = 198 + i * 70;
    const isSelected = opt.sel;
    s.push(rect(20, oy, W - 40, 58, isSelected ? TERRA_L : SURF, {
      rx: 14,
      stroke: isSelected ? TERRA : BORDER,
      sw: isSelected ? 1.5 : 0.5
    }));
    s.push(text(36, oy + 24, opt.icon, 14, isSelected ? TERRA : MUTED, { font: TIGHT }));
    s.push(text(36, oy + 40, opt.label, 14, isSelected ? TERRA_D : TEXT));
    if (isSelected) s.push(text(W - 36, oy + 34, '✓', 16, TERRA, { anchor: 'end' }));
  });

  // Notes field — optional
  s.push(line(20, 482, W - 20, 482, BORDER, { sw: 0.4 }));
  s.push(text(20, 502, 'ADD A NOTE (OPTIONAL)', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));
  s.push(rect(20, 516, W - 40, 80, SURF, { rx: 14, stroke: BORDER, sw: 0.5 }));
  s.push(text(36, 544, 'Felt a bit warm last night, window open…', 13, TEXT2, { fw: 300 }));
  s.push(line(36, 558, W - 36, 558, BORDER, { sw: 0.3 }));

  // Previous question summary
  s.push(line(20, 612, W - 20, 612, BORDER, { sw: 0.4 }));
  s.push(text(20, 632, 'EARLIER ANSWERS', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));
  s.push(rect(20, 648, W - 40, 40, CARD, { rx: 10 }));
  s.push(text(36, 672, 'Energy level', 12, TEXT2));
  s.push(text(W - 36, 672, '6 / 10 — moderate', 12, TEXT, { anchor: 'end', fw: 500 }));

  // Next button
  s.push(rect(20, 702, W - 40, 52, TERRA, { rx: 16 }));
  s.push(text(W / 2, 732, 'Next →', 16, SURF, { anchor: 'middle', fw: 600 }));

  // Skip
  s.push(text(W / 2, 768, 'Skip check-in today', 13, TEXT2, { anchor: 'middle' }));

  _addNav(s, 'log');
  return s;
}

// ──────────────────────────────────────────────────────
// SCREEN 3: TRENDS — 7-day load + recovery balance
// ──────────────────────────────────────────────────────
function buildTrends() {
  const s = [];
  s.push(rect(0, 0, W, H, BG));
  for (let y = 0; y < H; y += 16) s.push(line(0, y, W, y, 'rgba(30,25,20,0.025)', { sw: 1 }));

  s.push(text(16, 28, '9:41', 15, TEXT, { fw: 400 }));
  s.push(text(W - 16, 28, '●●●  89%', 12, TEXT2, { anchor: 'end' }));

  s.push(text(20, 70, 'Trends', 30, TEXT, { fw: 300, font: SERIF }));
  s.push(text(20, 98, 'Last 7 days — load vs recovery', 13, TEXT2));

  s.push(line(20, 114, W - 20, 114, BORDER, { sw: 0.4 }));

  // Weekly summary metrics
  const weekMetrics = [
    { label: 'LOAD', val: '68%', sub: 'avg training stress' },
    { label: 'RECOVERY', val: '74%', sub: 'avg readiness' },
    { label: 'REST DAYS', val: '2', sub: 'this week' },
  ];
  weekMetrics.forEach((m, i) => {
    const mx = 20 + i * 116;
    s.push(rect(mx, 126, 108, 72, SURF, { rx: 12, stroke: BORDER, sw: 0.5 }));
    s.push(text(mx + 10, 150, m.label, 9, MUTED, { fw: 700, ls: 1.5, font: TIGHT }));
    s.push(text(mx + 10, 178, m.val, 26, TEXT, { fw: 300, font: SERIF }));
    s.push(text(mx + 10, 192, m.sub, 9, TEXT2, { font: TIGHT }));
  });

  s.push(line(20, 210, W - 20, 210, BORDER, { sw: 0.4 }));

  // Load vs Recovery chart — 7 days (paired bars)
  s.push(text(20, 230, 'DAILY LOAD vs RECOVERY', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));
  const dayData = [
    { day: 'Mon', load: 82, rec: 68, rest: false },
    { day: 'Tue', load: 74, rec: 72, rest: false },
    { day: 'Wed', load: 88, rec: 58, rest: false },  // overload
    { day: 'Thu', load: 0,  rec: 76, rest: true  },  // rest day
    { day: 'Fri', load: 65, rec: 80, rest: false },
    { day: 'Sat', load: 78, rec: 71, rest: false },
    { day: 'Sun', load: 45, rec: 72, rest: false },  // today (partial)
  ];
  const chartTop = 248, chartH = 120, chartW = W - 40;
  const dayW = chartW / 7;
  // Baseline
  s.push(line(20, chartTop + chartH, W - 20, chartTop + chartH, BORDER, { sw: 0.5 }));
  // Midline at 50%
  s.push(line(20, chartTop + chartH / 2, W - 20, chartTop + chartH / 2, BORDER, { sw: 0.3, opacity: 0.6 }));

  dayData.forEach((d, i) => {
    const bx = 20 + i * dayW + dayW * 0.1;
    const bw = dayW * 0.35;

    if (d.rest) {
      // Rest day marker — terracotta tint rect
      s.push(rect(20 + i * dayW, chartTop, dayW, chartH, SAGE_L, { opacity: 0.5 }));
      s.push(text(20 + i * dayW + dayW / 2, chartTop + chartH / 2 + 4, 'REST', 8, SAGE, { anchor: 'middle', fw: 600, ls: 1, font: TIGHT }));
    } else {
      // Load bar (left of pair)
      const loadH = (d.load / 100) * chartH;
      s.push(rect(bx, chartTop + chartH - loadH, bw, loadH, d.load > 82 ? TERRA : CARD2, { rx: 2 }));
      // Recovery bar (right of pair)
      const recH = (d.rec / 100) * chartH;
      s.push(rect(bx + bw + 2, chartTop + chartH - recH, bw, recH, SAGE, { rx: 2, opacity: 0.7 }));
    }

    s.push(text(20 + i * dayW + dayW / 2, chartTop + chartH + 16, d.day, 9, i === 6 ? TERRA : TEXT2, { anchor: 'middle', font: TIGHT, fw: i === 6 ? 600 : 400 }));
  });

  // Legend
  s.push(circle(28, chartTop + chartH + 32, 5, TERRA));
  s.push(text(36, chartTop + chartH + 36, 'Load', 10, TEXT2));
  s.push(circle(80, chartTop + chartH + 32, 5, SAGE));
  s.push(text(88, chartTop + chartH + 36, 'Recovery', 10, TEXT2));
  s.push(rect(130, chartTop + chartH + 27, 12, 10, SAGE_L, { rx: 2 }));
  s.push(text(146, chartTop + chartH + 36, 'Rest', 10, TEXT2));

  s.push(line(20, 418, W - 20, 418, BORDER, { sw: 0.4 }));

  // HRV 7-day line sparkline area
  s.push(text(20, 438, 'HRV TREND (ms)', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));
  const hrvData = [54, 50, 48, 58, 62, 55, 52];
  const hrvMin = 44, hrvMax = 66;
  const hx0 = 20, hxW = W - 40, hyTop = 452, hyH = 60;
  // Fill under line
  for (let i = 0; i < hrvData.length - 1; i++) {
    const x1 = hx0 + (i / (hrvData.length - 1)) * hxW;
    const y1 = hyTop + hyH - ((hrvData[i] - hrvMin) / (hrvMax - hrvMin)) * hyH;
    const x2 = hx0 + ((i + 1) / (hrvData.length - 1)) * hxW;
    const y2 = hyTop + hyH - ((hrvData[i + 1] - hrvMin) / (hrvMax - hrvMin)) * hyH;
    s.push(rect(x1, y1, x2 - x1, hyTop + hyH - y1, 'rgba(92,122,94,0.08)'));
    s.push(line(x1, y1, x2, y2, SAGE, { sw: 1.5 }));
  }
  // Dots
  hrvData.forEach((v, i) => {
    const hx = hx0 + (i / (hrvData.length - 1)) * hxW;
    const hy = hyTop + hyH - ((v - hrvMin) / (hrvMax - hrvMin)) * hyH;
    s.push(circle(hx, hy, 3, SAGE));
    if (i === 4) { // peak label
      s.push(text(hx, hy - 8, v + 'ms', 9, SAGE, { anchor: 'middle', font: TIGHT }));
    }
  });
  s.push(text(20, hyTop + hyH + 14, '7 days ago', 9, MUTED, { font: TIGHT }));
  s.push(text(W - 20, hyTop + hyH + 14, 'Today', 9, TEXT2, { anchor: 'end', font: TIGHT }));

  s.push(line(20, 546, W - 20, 546, BORDER, { sw: 0.4 }));

  // Insight callout
  s.push(text(20, 566, 'EASE INSIGHT', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));
  s.push(rect(20, 580, W - 40, 84, SURF, { rx: 14, stroke: BORDER, sw: 0.5 }));
  s.push(text(36, 604, 'Wednesday pushed you into the red.', 14, TEXT, { fw: 500 }));
  s.push(text(36, 622, 'Thursday\'s rest brought HRV back up', 13, TEXT2));
  s.push(text(36, 638, 'by Friday — the recovery worked.', 13, TEXT2));
  s.push(text(36, 654, 'Keep this week lighter.', 12, TERRA, { fw: 500 }));

  // Sleep trend
  s.push(line(20, 676, W - 20, 676, BORDER, { sw: 0.4 }));
  s.push(text(20, 696, 'SLEEP DURATION — 7 DAYS', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));
  const sleepH = [7.2, 7.8, 6.2, 8.1, 7.4, 7.0, 7.3];
  sleepH.forEach((h, i) => {
    const sx = 20 + i * ((W - 40) / 7) + 6;
    const sw2 = (W - 40) / 7 - 8;
    const sh = (h / 9) * 50;
    s.push(rect(sx, 756 - sh, sw2, sh, h < 7 ? AMBER_L : SAGE_L, { rx: 3, stroke: h < 7 ? AMBER : SAGE, sw: 0.5 }));
    s.push(text(sx + sw2 / 2, 770, h.toFixed(1), 8, TEXT2, { anchor: 'middle', font: TIGHT }));
  });

  _addNav(s, 'trends');
  return s;
}

// ──────────────────────────────────────────────────────
// SCREEN 4: TRAIN — Modified workout suggestions
// ──────────────────────────────────────────────────────
function buildTrain() {
  const s = [];
  s.push(rect(0, 0, W, H, BG));
  for (let y = 0; y < H; y += 16) s.push(line(0, y, W, y, 'rgba(30,25,20,0.025)', { sw: 1 }));

  s.push(text(16, 28, '9:41', 15, TEXT, { fw: 400 }));
  s.push(text(W - 16, 28, '●●●  89%', 12, TEXT2, { anchor: 'end' }));

  s.push(text(20, 70, 'Train', 30, TEXT, { fw: 300, font: SERIF }));
  s.push(text(20, 98, 'Adjusted for readiness: 72', 13, TEXT2));

  s.push(line(20, 114, W - 20, 114, BORDER, { sw: 0.4 }));

  // Today's training suggestion — main card
  s.push(rect(20, 128, W - 40, 148, SURF, { rx: 18, stroke: BORDER, sw: 0.5 }));
  s.push(rect(20, 128, W - 40, 36, TERRA_L, { rx: 18 }));
  s.push(rect(20, 145, W - 40, 20, TERRA_L));  // fill bottom of top rect
  s.push(text(36, 152, 'RECOMMENDED FOR TODAY', 10, TERRA, { fw: 700, ls: 2, font: TIGHT }));
  s.push(text(36, 178, 'Easy Zone 2 Run', 22, TEXT, { fw: 500 }));
  s.push(text(36, 200, '30 min · Heart rate below 140 bpm', 13, TEXT2));
  s.push(line(36, 216, W - 36, 216, BORDER, { sw: 0.3 }));
  // Phases
  const phases = ['Warm-up 5m', 'Easy run 20m', 'Cool-down 5m'];
  phases.forEach((ph, i) => {
    s.push(circle(36 + i * 108, 244, 4, TERRA));
    s.push(text(44 + i * 108, 248, ph, 11, TEXT2));
  });
  s.push(text(36, 270, '→ Start session', 13, TERRA, { fw: 600 }));

  // Alternatives — same calorie budget, lower stress
  s.push(line(20, 290, W - 20, 290, BORDER, { sw: 0.4 }));
  s.push(text(20, 310, 'ALTERNATIVES', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));

  const alts = [
    { name: 'Yoga flow',          dur: '45 min', type: 'Mobility', icon: '◎' },
    { name: 'Walk in nature',     dur: '60 min', type: 'Active rest', icon: '◎' },
    { name: 'Swim (easy)',        dur: '30 min', type: 'Low impact', icon: '◎' },
    { name: 'Full rest day',      dur: 'All day', type: 'Recovery', icon: '●' },
  ];
  alts.forEach((alt, i) => {
    const ay = 326 + i * 68;
    s.push(rect(20, ay, W - 40, 58, SURF, { rx: 12, stroke: BORDER, sw: 0.5 }));
    s.push(text(34, ay + 22, alt.icon, 14, alt.type === 'Recovery' ? SAGE : MUTED));
    s.push(text(54, ay + 24, alt.name, 14, TEXT, { fw: 400 }));
    s.push(text(54, ay + 40, alt.type, 11, TEXT2));
    s.push(rect(W - 80, ay + 18, 56, 22, alt.type === 'Recovery' ? SAGE_L : CARD, { rx: 8 }));
    s.push(text(W - 52, ay + 32, alt.dur, 11, alt.type === 'Recovery' ? SAGE : TEXT2, { anchor: 'middle', font: TIGHT, fw: 500 }));
  });

  // Skip training completely
  s.push(line(20, 604, W - 20, 604, BORDER, { sw: 0.4 }));
  s.push(rect(20, 614, W - 40, 48, CARD, { rx: 14, stroke: BORDER, sw: 0.5 }));
  s.push(text(W / 2, 642, 'Mark as rest day', 14, TEXT2, { anchor: 'middle' }));

  // Log manual workout
  s.push(line(20, 674, W - 20, 674, BORDER, { sw: 0.4 }));
  s.push(rect(20, 684, W - 40, 48, TERRA, { rx: 14 }));
  s.push(text(W / 2, 712, '+ Log a workout', 14, SURF, { anchor: 'middle', fw: 600 }));

  _addNav(s, 'train');
  return s;
}

// ──────────────────────────────────────────────────────
// SCREEN 5: BODY — Muscle recovery map
// ──────────────────────────────────────────────────────
function buildBody() {
  const s = [];
  s.push(rect(0, 0, W, H, BG));
  for (let y = 0; y < H; y += 16) s.push(line(0, y, W, y, 'rgba(30,25,20,0.025)', { sw: 1 }));

  s.push(text(16, 28, '9:41', 15, TEXT, { fw: 400 }));
  s.push(text(W - 16, 28, '●●●  89%', 12, TEXT2, { anchor: 'end' }));

  s.push(text(20, 70, 'Body', 30, TEXT, { fw: 300, font: SERIF }));
  s.push(text(20, 98, 'Muscle group recovery status', 13, TEXT2));

  s.push(line(20, 114, W - 20, 114, BORDER, { sw: 0.4 }));

  // Body silhouette — abstract frontal representation
  const cx = W / 2;
  // Head
  s.push(circle(cx, 152, 22, CARD, { stroke: BORDER, sw: 1 }));
  // Neck
  s.push(rect(cx - 8, 172, 16, 20, CARD, { stroke: BORDER, sw: 1 }));
  // Torso
  s.push(rect(cx - 42, 192, 84, 100, CARD, { rx: 8, stroke: BORDER, sw: 1 }));
  // Left arm
  s.push(rect(cx - 66, 194, 22, 90, CARD, { rx: 8, stroke: BORDER, sw: 1 }));
  // Right arm
  s.push(rect(cx + 44, 194, 22, 90, CARD, { rx: 8, stroke: BORDER, sw: 1 }));
  // Left leg
  s.push(rect(cx - 38, 292, 32, 110, CARD, { rx: 8, stroke: BORDER, sw: 1 }));
  // Right leg
  s.push(rect(cx + 6, 292, 32, 110, CARD, { rx: 8, stroke: BORDER, sw: 1 }));

  // Muscle group overlays — recovery status color
  // Quads — heavy load (red)
  s.push(rect(cx - 36, 294, 28, 60, 'rgba(196,98,60,0.35)', { rx: 6 }));
  s.push(rect(cx + 8, 294, 28, 60, 'rgba(196,98,60,0.35)', { rx: 6 }));
  // Calves — moderate
  s.push(rect(cx - 36, 360, 28, 36, 'rgba(201,139,42,0.3)', { rx: 6 }));
  s.push(rect(cx + 8, 360, 28, 36, 'rgba(201,139,42,0.3)', { rx: 6 }));
  // Core — light
  s.push(rect(cx - 38, 210, 80, 50, 'rgba(92,122,94,0.25)', { rx: 6 }));
  // Shoulders — fresh
  s.push(rect(cx - 62, 196, 18, 32, 'rgba(92,122,94,0.2)', { rx: 5 }));
  s.push(rect(cx + 46, 196, 18, 32, 'rgba(92,122,94,0.2)', { rx: 5 }));

  // Muscle legend
  s.push(line(20, 422, W - 20, 422, BORDER, { sw: 0.4 }));
  s.push(text(20, 442, 'RECOVERY STATUS', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));

  const legend = [
    { color: TERRA,   label: 'Still recovering', note: 'Quads — 24–36h needed' },
    { color: AMBER,   label: 'Moderate',          note: 'Calves — 12–18h needed' },
    { color: SAGE,    label: 'Fresh',             note: 'Core, shoulders — ready' },
    { color: MUTED,   label: 'Not trained',       note: 'Back, chest — untouched' },
  ];
  legend.forEach((l, i) => {
    const ly = 460 + i * 54;
    s.push(rect(20, ly, W - 40, 44, SURF, { rx: 10, stroke: BORDER, sw: 0.5 }));
    s.push(rect(28, ly + 12, 20, 20, l.color === MUTED ? CARD2 : l.color + '40', { rx: 4 }));
    s.push(line(34, ly + 18, 42, ly + 26, l.color, { sw: 2 }));
    s.push(text(60, ly + 20, l.label, 13, TEXT, { fw: 500 }));
    s.push(text(60, ly + 34, l.note, 11, TEXT2));
  });

  // Last workout log
  s.push(line(20, 686, W - 20, 686, BORDER, { sw: 0.4 }));
  s.push(text(20, 706, 'LAST SESSION', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));
  s.push(rect(20, 718, W - 40, 50, CARD, { rx: 12, stroke: BORDER, sw: 0.5 }));
  s.push(text(36, 740, 'Saturday — 5km tempo run', 14, TEXT, { fw: 400 }));
  s.push(text(36, 756, '28:44 · Avg HR 162 bpm · Load 82', 11, TEXT2, { font: TIGHT }));
  s.push(text(W - 36, 746, '→', 14, TERRA, { anchor: 'end' }));

  _addNav(s, 'body');
  return s;
}

// ──────────────────────────────────────────────────────
// SCREEN 6: INSIGHTS — Personalized recovery wisdom
// ──────────────────────────────────────────────────────
function buildInsights() {
  const s = [];
  s.push(rect(0, 0, W, H, BG));
  for (let y = 0; y < H; y += 16) s.push(line(0, y, W, y, 'rgba(30,25,20,0.025)', { sw: 1 }));

  s.push(text(16, 28, '9:41', 15, TEXT, { fw: 400 }));
  s.push(text(W - 16, 28, '●●●  89%', 12, TEXT2, { anchor: 'end' }));

  s.push(text(20, 70, 'Insights', 30, TEXT, { fw: 300, font: SERIF }));
  s.push(text(20, 98, 'Patterns from your last 30 days', 13, TEXT2));

  s.push(line(20, 114, W - 20, 114, BORDER, { sw: 0.4 }));

  // Top insight card — pull quote style
  s.push(rect(20, 128, W - 40, 112, SURF, { rx: 18, stroke: BORDER, sw: 0.5 }));
  s.push(line(20, 128, 6, 128, TERRA, { sw: 32, opacity: 0.9 })); // left accent bar — heavy
  s.push(text(40, 154, '"Your Thursdays are', 17, TEXT, { font: SERIF }));
  s.push(text(40, 175, 'consistently your best', 17, TEXT, { font: SERIF }));
  s.push(text(40, 196, 'recovery days."', 17, TEXT, { font: SERIF, fw: 400 }));
  s.push(text(40, 220, 'Avg readiness 81 on Thursdays vs 68 overall', 11, TEXT2, { font: TIGHT }));
  s.push(text(40, 234, '→ See weekly pattern', 12, TERRA, { fw: 500 }));

  // Pattern cards — 4 insights
  const insights = [
    {
      title: 'Sleep < 7h → next-day HRV drops',
      body:  '12 data points over 30 days. Consistent pattern.',
      tag:   'Sleep',
      color: AMBER,
    },
    {
      title: 'Tempo runs hit you for 36 hours',
      body:  'Your quads take 10h longer than average to recover.',
      tag:   'Load',
      color: TERRA,
    },
    {
      title: 'Zone 2 after rest day = best sessions',
      body:  'Friday sessions post-Thursday rest score 18% higher.',
      tag:   'Timing',
      color: SAGE,
    },
    {
      title: 'You overtrain in 3-week cycles',
      body:  'Load spikes every 21 days. Planned deload would help.',
      tag:   'Pattern',
      color: AMBER,
    },
  ];
  insights.forEach((ins, i) => {
    const iy = 256 + i * 114;
    s.push(rect(20, iy, W - 40, 104, SURF, { rx: 14, stroke: BORDER, sw: 0.5 }));
    s.push(rect(20, iy, W - 40, 26, 'rgba(0,0,0,0.02)', { rx: 14 }));
    s.push(rect(24, iy + 6, 46, 14, ins.color + '30', { rx: 5 }));
    s.push(text(27, iy + 16, ins.tag, 9, ins.color, { fw: 700, ls: 1, font: TIGHT }));
    s.push(text(36, iy + 48, ins.title, 14, TEXT, { fw: 500 }));
    s.push(text(36, iy + 66, ins.body, 12, TEXT2));
    s.push(line(36, iy + 82, W - 36, iy + 82, BORDER, { sw: 0.3 }));
    s.push(text(36, iy + 96, 'View detail →', 11, TERRA, { fw: 500 }));
  });

  _addNav(s, 'insights');
  return s;
}

// ──────────────────────────────────────────────────────
// NAV helper
// ──────────────────────────────────────────────────────
function _addNav(s, active) {
  s.push(rect(0, NAV_Y, W, 72, SURF));
  s.push(line(0, NAV_Y, W, NAV_Y, BORDER, { sw: 0.5 }));
  const navItems = [
    { id: 'today',    label: 'Today',    x: 39 },
    { id: 'log',      label: 'Log',      x: 117 },
    { id: 'trends',   label: 'Trends',   x: 195 },
    { id: 'train',    label: 'Train',    x: 273 },
    { id: 'insights', label: 'Insights', x: 351 },
  ];
  navItems.forEach(nav => {
    const isActive = nav.id === active;
    if (isActive) s.push(rect(nav.x - 32, NAV_Y + 4, 64, 3, TERRA, { rx: 1.5 }));
    s.push(text(nav.x, NAV_Y + 30, isActive ? '●' : '○', 10, isActive ? TERRA : MUTED, { anchor: 'middle' }));
    s.push(text(nav.x, NAV_Y + 52, nav.label, 10, isActive ? TERRA : TEXT2, { anchor: 'middle', fw: isActive ? 600 : 400 }));
  });
}

// ──────────────────────────────────────────────────────
// COMPOSE
// ──────────────────────────────────────────────────────
const screens = [
  { name: 'Today',    elements: buildToday() },
  { name: 'Log',      elements: buildLog() },
  { name: 'Trends',   elements: buildTrends() },
  { name: 'Train',    elements: buildTrain() },
  { name: 'Body',     elements: buildBody() },
  { name: 'Insights', elements: buildInsights() },
];

const totalElements = screens.reduce((n, s) => n + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'EASE — Recovery-Aware Training Companion',
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'light',
    heartbeat: 502,
    elements: totalElements,
    palette: { bg: BG, accent: TERRA, text: TEXT },
  },
  screens: screens.map(s => ({
    name: s.name,
    elements: s.elements,
    svg: '',
  })),
};

fs.writeFileSync(path.join(__dirname, 'ease.pen'), JSON.stringify(pen, null, 2));
console.log(`EASE: ${screens.length} screens, ${totalElements} elements\nWritten: ease.pen`);
