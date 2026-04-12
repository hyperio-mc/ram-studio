'use strict';
// lucid-app.js
// LUCID — Personal Finance OS
//
// Inspiration:
//   · midday.ai (darkmodedesign.com) — Dark business stack for modern founders.
//     Deep near-black bg, AI-first financial insights, card surfaces layered
//     through opacity, not borders. Clean numeric typography, information-dense
//     dashboard with breathing room between clusters.
//   · neon.com (darkmodedesign.com) — Single vivid accent on near-pure black.
//     Subtle glow halo behind hero numbers. Bold framing: "Ship faster" energy
//     applied to personal finance. Terminal-meets-luxury.
//   · minimal.gallery — Litbix "for book lovers" entry: category chips with
//     tonal surfaces, section headers at reduced opacity, generous row spacing.
//
// New patterns tried:
//   · Violet/indigo dark palette — away from green/teal defaults
//   · Glow halo behind hero balance (layered semi-transparent rounded rects)
//   · AI insight cards: left pulse-border + italic natural-language copy
//   · Per-category icon bg tinted to category color
//   · Goals screen: top color bar per card + auto-save pill
//
// Theme: DARK (issue.pen was light → rotating to dark)
//
// Palette: #06060F near-black + electric violet #8B5CF6 + cyan + rose
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

function uid() {
  return Math.random().toString(36).slice(2, 10) +
         Math.random().toString(36).slice(2, 10);
}
function frame(x, y, w, h) { return { x, y, width: w, height: h }; }
function rect(x, y, w, h, fill, extra = {}) {
  return { id: uid(), type: 'rectangle', frame: frame(x, y, w, h),
           fills: [{ type: 'solid', color: fill }], cornerRadius: extra.r ?? 0, ...extra };
}
function text(x, y, w, h, str, size, weight, color, extra = {}) {
  return { id: uid(), type: 'text', frame: frame(x, y, w, h),
           content: str, fontSize: size, fontWeight: weight, color, ...extra };
}

const C = {
  bg:         '#06060F',
  surf:       '#0D0D1E',
  surf2:      '#131328',
  violet:     '#8B5CF6',
  violetDim:  'rgba(139,92,246,0.14)',
  violetGlow: 'rgba(139,92,246,0.06)',
  cyan:       '#22D3EE',
  cyanDim:    'rgba(34,211,238,0.13)',
  rose:       '#F43F5E',
  roseDim:    'rgba(244,63,94,0.13)',
  amber:      '#F59E0B',
  amberDim:   'rgba(245,158,11,0.13)',
  text:       '#F0EEFF',
  muted:      'rgba(240,238,255,0.50)',
  sub:        'rgba(240,238,255,0.28)',
  border:     'rgba(240,238,255,0.07)',
};

const W = 390;
const H = 844;

function statusBar() { return rect(0, 0, W, 44, C.bg); }
function statusText() {
  return [
    text(20, 14, 60, 16, '9:41', 13, '600', C.text),
    text(280, 14, 90, 16, '●●●  WiFi  🔋', 11, '400', C.muted),
  ];
}

function bottomNav(activeIdx) {
  const labels = ['Overview','Activity','Spend','Insights','Goals'];
  const icons  = ['⬡','≡','◑','✦','◈'];
  const navH = 80;
  const y0   = H - navH;
  const tabW = W / labels.length;
  const layers = [
    rect(0, y0, W, navH, C.surf),
    rect(0, y0, W, 1, C.border),
  ];
  labels.forEach((lbl, i) => {
    const cx  = i * tabW + tabW / 2;
    const isA = i === activeIdx;
    const col = isA ? C.violet : C.sub;
    if (isA) layers.push(rect(cx - 22, y0 + 8, 44, 44, C.violetDim, { r: 12 }));
    layers.push(text(cx - 12, y0 + 13, 24, 20, icons[i], 16, '400', col, { textAlign: 'center' }));
    layers.push(text(cx - tabW/2 + 4, y0 + 52, tabW - 8, 14, lbl, 9, isA ? '600' : '400', col, { textAlign: 'center' }));
  });
  return layers;
}

function chip(x, y, label, fg, bg) {
  const w = label.length * 7 + 16;
  return [
    rect(x, y, w, 22, bg, { r: 11 }),
    text(x, y, w, 22, label, 9, '700', fg, { textAlign: 'center', verticalAlign: 'middle', letterSpacing: 0.8 }),
  ];
}

// Screen 1: Overview
function screen1() {
  const layers = [rect(0, 0, W, H, C.bg), statusBar(), ...statusText()];

  layers.push(text(20, 52, 200, 20, 'LUCID', 13, '700', C.violet, { letterSpacing: 3 }));
  layers.push(rect(W - 52, 44, 32, 32, C.surf2, { r: 16 }));
  layers.push(text(W - 52, 44, 32, 32, 'RK', 11, '700', C.violet, { textAlign: 'center', verticalAlign: 'middle' }));

  // Hero glow + balance
  layers.push(rect(W/2 - 110, 88,  220, 100, 'rgba(139,92,246,0.04)', { r: 60 }));
  layers.push(rect(W/2 - 80,  96,  160, 84,  'rgba(139,92,246,0.07)', { r: 50 }));
  layers.push(rect(W/2 - 55,  104, 110, 68,  'rgba(139,92,246,0.05)', { r: 40 }));
  layers.push(text(20, 102, W - 40, 14, 'NET WORTH', 10, '600', C.muted, { textAlign: 'center', letterSpacing: 1.5 }));
  layers.push(text(20, 120, W - 40, 52, '$42,814', 44, '700', C.text, { textAlign: 'center' }));
  layers.push(text(20, 172, W - 40, 16, '▲ +$318  this month', 11, '500', C.cyan, { textAlign: 'center' }));

  // Budget bar
  const bY = 208;
  layers.push(rect(20, bY, W - 40, 88, C.surf, { r: 16 }));
  layers.push(text(32, bY + 12, 160, 14, 'Monthly Budget', 11, '600', C.text));
  layers.push(...chip(W - 110, bY + 10, '$3,200 / $4,500', C.muted, C.surf2));
  const bw = W - 64;
  layers.push(rect(32, bY + 36, bw, 8, C.surf2, { r: 4 }));
  layers.push(rect(32, bY + 36, Math.round(bw * 0.71), 8, C.violet, { r: 4 }));
  layers.push(text(32, bY + 52, 100, 12, '71% used', 9, '500', C.muted));
  layers.push(text(W - 100, bY + 52, 68, 12, '14 days left', 9, '500', C.sub, { textAlign: 'right' }));

  // Quick stats
  const sY  = 312;
  const sW  = (W - 56) / 3;
  [
    { label: 'Income',  val: '$5,400', color: C.cyan,   dim: C.cyanDim   },
    { label: 'Spent',   val: '$3,200', color: C.rose,   dim: C.roseDim   },
    { label: 'Saved',   val: '$2,200', color: C.violet, dim: C.violetDim },
  ].forEach((s, i) => {
    const sx = 20 + i * (sW + 8);
    layers.push(rect(sx, sY, sW, 72, C.surf, { r: 14 }));
    layers.push(rect(sx, sY, sW, 3, s.color, { r: [14, 14, 0, 0] }));
    layers.push(text(sx + 12, sY + 12, sW - 24, 13, s.label, 9, '600', C.muted));
    layers.push(text(sx + 12, sY + 30, sW - 24, 22, s.val, 18, '700', C.text));
    layers.push(text(sx + 12, sY + 54, sW - 24, 12, 'Apr 2026', 8, '400', C.sub));
  });

  // Recent transactions preview
  const txY = 404;
  layers.push(text(20, txY, 160, 16, 'Recent', 13, '600', C.text));
  layers.push(text(W - 80, txY, 60, 16, 'See all →', 11, '500', C.violet, { textAlign: 'right' }));

  [
    { icon: '☕', label: 'Sightglass Coffee', cat: 'Food',   amt: '-$6.50',  color: C.rose,  catBg: C.roseDim  },
    { icon: '🎵', label: 'Spotify',           cat: 'Subs',  amt: '-$9.99',  color: C.amber, catBg: C.amberDim },
    { icon: '↑',  label: 'Salary',            cat: 'Income',amt: '+$5,400', color: C.cyan,  catBg: C.cyanDim  },
  ].forEach((tx, i) => {
    const ty = txY + 28 + i * 58;
    layers.push(rect(20, ty, W - 40, 50, C.surf, { r: 12 }));
    layers.push(rect(32, ty + 11, 28, 28, tx.catBg, { r: 8 }));
    layers.push(text(32, ty + 11, 28, 28, tx.icon, 14, '400', tx.color, { textAlign: 'center', verticalAlign: 'middle' }));
    layers.push(text(68, ty + 11, 180, 14, tx.label, 12, '500', C.text));
    layers.push(text(68, ty + 28, 100, 12, tx.cat, 9, '400', C.muted));
    layers.push(text(W - 100, ty + 16, 68, 18, tx.amt, 13, '700', tx.color, { textAlign: 'right' }));
  });

  // AI nudge
  const nY = txY + 28 + 3 * 58 + 4;
  layers.push(rect(20, nY, W - 40, 52, C.violetDim, { r: 14 }));
  layers.push(rect(20, nY, 3, 52, C.violet, { r: [14, 0, 0, 14] }));
  layers.push(text(32, nY + 10, 24, 14, '✦', 12, '400', C.violet));
  layers.push(text(54, nY + 10, W - 86, 14, 'You\'re on track to hit your savings goal', 11, '600', C.text));
  layers.push(text(54, nY + 28, W - 86, 12, 'Cut subscriptions by $20 to save 3 days earlier', 10, '400', C.muted));

  layers.push(...bottomNav(0));
  return { id: uid(), name: 'Overview', frame: frame(0, 0, W, H), children: layers };
}

// Screen 2: Activity
function screen2() {
  const layers = [rect(0, 0, W, H, C.bg), statusBar(), ...statusText()];
  layers.push(text(20, 52, 200, 22, 'Activity', 22, '700', C.text));
  layers.push(text(W - 80, 56, 60, 16, 'Filter ⌥', 11, '500', C.violet, { textAlign: 'right' }));

  ['Feb','Mar','Apr'].forEach((m, i) => {
    const isA = i === 2;
    layers.push(rect(20 + i * 70, 82, 60, 26, isA ? C.violet : C.surf2, { r: 13 }));
    layers.push(text(20 + i * 70, 82, 60, 26, m, 11, '600', isA ? '#fff' : C.muted, { textAlign: 'center', verticalAlign: 'middle' }));
  });

  layers.push(rect(20, 120, W - 40, 44, C.surf, { r: 12 }));
  layers.push(text(32, 120, 80, 44, '↓ $3,200', 11, '600', C.rose, { verticalAlign: 'middle' }));
  layers.push(rect(W/2 - 1, 132, 1, 20, C.border));
  layers.push(text(W/2 + 8, 120, 100, 44, '↑ $5,400', 11, '600', C.cyan, { verticalAlign: 'middle' }));

  const groups = [
    { date: 'Today — Apr 3', txns: [
      { icon: '☕', label: 'Sightglass Coffee', sub: 'Coffee & Snacks',  amt: '-$6.50',  color: C.rose,  catBg: C.roseDim  },
      { icon: '🏋', label: 'Equinox',           sub: 'Health & Fitness', amt: '-$85.00', color: C.amber, catBg: C.amberDim },
    ]},
    { date: 'Yesterday — Apr 2', txns: [
      { icon: '🛒', label: 'Whole Foods',       sub: 'Groceries',   amt: '-$62.14', color: C.rose,  catBg: C.roseDim  },
      { icon: '↑',  label: 'Salary',            sub: 'Income',      amt: '+$5,400', color: C.cyan,  catBg: C.cyanDim  },
      { icon: '🚌', label: 'Clipper Card',      sub: 'Transport',   amt: '-$3.20',  color: C.amber, catBg: C.amberDim },
    ]},
    { date: 'Tuesday — Apr 1', txns: [
      { icon: '🎵', label: 'Spotify',          sub: 'Subscriptions', amt: '-$9.99',  color: C.amber, catBg: C.amberDim },
      { icon: '🍕', label: 'Tony\'s Pizzeria', sub: 'Dining Out',    amt: '-$24.50', color: C.rose,  catBg: C.roseDim  },
    ]},
  ];

  let curY = 176;
  groups.forEach(g => {
    if (curY > H - 120) return;
    layers.push(text(20, curY, 300, 14, g.date, 10, '600', C.sub, { letterSpacing: 0.6 }));
    curY += 20;
    g.txns.forEach(tx => {
      if (curY > H - 100) return;
      layers.push(rect(20, curY, W - 40, 52, C.surf, { r: 12 }));
      layers.push(rect(32, curY + 12, 28, 28, tx.catBg, { r: 8 }));
      layers.push(text(32, curY + 12, 28, 28, tx.icon, 14, '400', tx.color, { textAlign: 'center', verticalAlign: 'middle' }));
      layers.push(text(68, curY + 10, 180, 14, tx.label, 12, '500', C.text));
      layers.push(text(68, curY + 28, 160, 12, tx.sub, 9, '400', C.muted));
      layers.push(text(W - 100, curY + 16, 68, 20, tx.amt, 13, '700', tx.color, { textAlign: 'right' }));
      curY += 58;
    });
    curY += 8;
  });

  layers.push(...bottomNav(1));
  return { id: uid(), name: 'Activity', frame: frame(0, 0, W, H), children: layers };
}

// Screen 3: Spending Breakdown
function screen3() {
  const layers = [rect(0, 0, W, H, C.bg), statusBar(), ...statusText()];
  layers.push(text(20, 52, 200, 22, 'Spending', 22, '700', C.text));

  ['Week','Month','Year'].forEach((p, i) => {
    const isA = i === 1;
    layers.push(rect(W - 170 + i * 56, 54, 50, 22, isA ? C.violet : C.surf2, { r: 11 }));
    layers.push(text(W - 170 + i * 56, 54, 50, 22, p, 9, '600', isA ? '#fff' : C.sub, { textAlign: 'center', verticalAlign: 'middle' }));
  });

  // Ring visual
  const arcCX = W / 2;
  const arcY  = 88;
  const ringR = 64;
  const thick = 18;
  layers.push(rect(arcCX - ringR, arcY + 16, ringR * 2, ringR * 2, C.surf2, { r: ringR }));
  layers.push(rect(arcCX - (ringR - thick), arcY + 16 + thick, (ringR - thick) * 2, (ringR - thick) * 2, C.bg, { r: ringR - thick }));
  layers.push(rect(arcCX - ringR, arcY + 16, ringR * 2, ringR * 2, C.roseDim, { r: ringR }));
  layers.push(rect(arcCX - ringR, arcY + 16, ringR, ringR * 2, C.amberDim, { r: [ringR, 0, 0, ringR] }));
  layers.push(rect(arcCX - (ringR - thick), arcY + 16 + thick, (ringR - thick) * 2, (ringR - thick) * 2, C.bg, { r: ringR - thick }));
  layers.push(text(arcCX - 50, arcY + 48, 100, 16, 'TOTAL SPENT', 9, '600', C.muted, { textAlign: 'center', letterSpacing: 1 }));
  layers.push(text(arcCX - 50, arcY + 66, 100, 24, '$3,200', 20, '700', C.text, { textAlign: 'center' }));
  layers.push(text(arcCX - 50, arcY + 92, 100, 14, 'April 2026', 9, '400', C.sub, { textAlign: 'center' }));

  const catY = arcY + 168;
  const barW = W - 80;
  layers.push(text(20, catY, W - 40, 16, 'By Category', 13, '600', C.text));

  [
    { label: 'Food & Dining',  pct: 0.34, color: C.rose,    amt: '$1,088' },
    { label: 'Subscriptions',  pct: 0.18, color: C.amber,   amt: '$576'   },
    { label: 'Health',         pct: 0.14, color: C.violet,  amt: '$448'   },
    { label: 'Transport',      pct: 0.10, color: C.cyan,    amt: '$320'   },
    { label: 'Shopping',       pct: 0.15, color: '#EC4899', amt: '$480'   },
    { label: 'Other',          pct: 0.09, color: C.sub,     amt: '$288'   },
  ].forEach((cat, i) => {
    const cy = catY + 28 + i * 64;
    if (cy > H - 100) return;
    layers.push(rect(20, cy, W - 40, 56, C.surf, { r: 12 }));
    layers.push(rect(32, cy + 18, 10, 10, cat.color, { r: 5 }));
    layers.push(text(50, cy + 12, 160, 14, cat.label, 11, '500', C.text));
    layers.push(rect(50, cy + 30, barW - 30, 5, C.surf2, { r: 3 }));
    layers.push(rect(50, cy + 30, Math.round((barW - 30) * cat.pct), 5, cat.color, { r: 3 }));
    layers.push(text(50, cy + 38, 80, 12, `${Math.round(cat.pct * 100)}%`, 9, '500', C.muted));
    layers.push(text(W - 96, cy + 16, 64, 16, cat.amt, 12, '700', cat.color, { textAlign: 'right' }));
  });

  layers.push(...bottomNav(2));
  return { id: uid(), name: 'Spending', frame: frame(0, 0, W, H), children: layers };
}

// Screen 4: AI Insights
function screen4() {
  const layers = [rect(0, 0, W, H, C.bg), statusBar(), ...statusText()];
  layers.push(text(20, 52, 200, 22, 'Insights', 22, '700', C.text));
  layers.push(...chip(W - 80, 55, 'LUCID AI', C.violet, C.violetDim));

  // Score card
  const scY = 88;
  layers.push(rect(20, scY, W - 40, 100, C.surf, { r: 16 }));
  layers.push(rect(20, scY, W - 40, 3, C.violet, { r: [16, 16, 0, 0] }));
  layers.push(rect(W/2 - 36, scY + 20, 72, 52, 'rgba(139,92,246,0.08)', { r: 28 }));
  layers.push(text(20, scY + 12, W - 40, 16, 'FINANCIAL HEALTH SCORE', 9, '700', C.sub, { textAlign: 'center', letterSpacing: 1.5 }));
  layers.push(text(20, scY + 28, W - 40, 42, '84', 40, '800', C.violet, { textAlign: 'center' }));
  layers.push(text(20, scY + 72, W - 40, 16, '▲ +3 from last month · Great shape', 11, '500', C.cyan, { textAlign: 'center' }));

  const insights = [
    { icon: '✦', iconColor: C.violet, bg: C.violetDim, border: C.violet,
      title: 'Save 3 days earlier on your Japan trip',
      body: 'Your dining spend is 34% of budget. $12 less per week gets you there by Sep 14 vs Sep 17.' },
    { icon: '⚠', iconColor: C.amber,  bg: C.amberDim,  border: C.amber,
      title: 'Subscription creep detected',
      body: '6 subscriptions totaling $67/mo. Two haven\'t been used in 45+ days — easy wins.' },
    { icon: '◈', iconColor: C.cyan,   bg: C.cyanDim,   border: C.cyan,
      title: 'Best savings month in 6 months',
      body: '$2,200 saved in April — 24% above your average. Investment transfer set for Apr 5.' },
    { icon: '◑', iconColor: C.muted,  bg: C.surf,      border: 'transparent',
      title: 'Rent due in 8 days',
      body: '$2,200 auto-pay scheduled Apr 11. Current balance: $4,280 — well covered.' },
  ];

  let iy = scY + 116;
  insights.forEach(ins => {
    if (iy > H - 100) return;
    const cardH = 86;
    layers.push(rect(20, iy, W - 40, cardH, ins.bg, { r: 14 }));
    layers.push(rect(20, iy, 3, cardH, ins.border, { r: [14, 0, 0, 14] }));
    layers.push(text(32, iy + 12, 20, 16, ins.icon, 13, '600', ins.iconColor));
    layers.push(text(54, iy + 10, W - 84, 16, ins.title, 12, '600', C.text));
    layers.push(text(54, iy + 30, W - 84, 40, ins.body, 10, '400', C.muted));
    iy += cardH + 8;
  });

  layers.push(...bottomNav(3));
  return { id: uid(), name: 'Insights', frame: frame(0, 0, W, H), children: layers };
}

// Screen 5: Goals
function screen5() {
  const layers = [rect(0, 0, W, H, C.bg), statusBar(), ...statusText()];
  layers.push(text(20, 52, 220, 22, 'Goals', 22, '700', C.text));
  layers.push(rect(W - 56, 50, 36, 26, C.violet, { r: 13 }));
  layers.push(text(W - 56, 50, 36, 26, '+ Add', 9, '600', '#fff', { textAlign: 'center', verticalAlign: 'middle' }));

  layers.push(rect(20, 84, W - 40, 44, C.surf, { r: 12 }));
  layers.push(text(32, 84, 180, 44, '3 active goals', 12, '600', C.text, { verticalAlign: 'middle' }));
  layers.push(text(W - 170, 84, 140, 44, '$12,800 / $24,300 saved', 10, '500', C.muted, { textAlign: 'right', verticalAlign: 'middle' }));

  const goals = [
    { name: 'Japan Trip ✈', desc: 'Tokyo + Kyoto · 14 days',
      saved: 3200, target: 5500, dueDate: 'Sep 2026',
      icon: '✈', color: C.violet, dimColor: C.violetDim,
      onTrack: true, monthlyAuto: '$320/mo auto-transfer' },
    { name: 'Emergency Fund', desc: '6 months of expenses',
      saved: 8400, target: 16000, dueDate: 'Dec 2026',
      icon: '⬡', color: C.cyan, dimColor: C.cyanDim,
      onTrack: true, monthlyAuto: '$400/mo auto-transfer' },
    { name: 'New Laptop', desc: 'MacBook Pro M4',
      saved: 1200, target: 2800, dueDate: 'Jul 2026',
      icon: '◈', color: C.amber, dimColor: C.amberDim,
      onTrack: false, monthlyAuto: '$180/mo — behind schedule' },
  ];

  let gy = 144;
  goals.forEach(g => {
    const pct = g.saved / g.target;
    const cardH = 128;
    if (gy + cardH > H - 110) return;
    layers.push(rect(20, gy, W - 40, cardH, C.surf, { r: 16 }));
    layers.push(rect(20, gy, W - 40, 3, g.color, { r: [16, 16, 0, 0] }));
    layers.push(rect(32, gy + 16, 36, 36, g.dimColor, { r: 18 }));
    layers.push(text(32, gy + 16, 36, 36, g.icon, 16, '400', g.color, { textAlign: 'center', verticalAlign: 'middle' }));
    layers.push(text(76, gy + 16, W - 160, 16, g.name, 13, '600', C.text));
    layers.push(text(76, gy + 34, W - 160, 12, g.desc, 9, '400', C.muted));

    const badgeColor = g.onTrack ? C.cyan : C.amber;
    const badgeBg    = g.onTrack ? C.cyanDim : C.amberDim;
    layers.push(rect(W - 108, gy + 16, 76, 20, badgeBg, { r: 10 }));
    layers.push(text(W - 108, gy + 16, 76, 20, g.onTrack ? '✓ On track' : '↗ Adjust', 9, '600', badgeColor, { textAlign: 'center', verticalAlign: 'middle' }));
    layers.push(text(W - 108, gy + 40, 76, 12, g.dueDate, 8, '400', C.sub, { textAlign: 'right' }));

    const bw = W - 64;
    layers.push(rect(32, gy + 66, bw, 6, C.surf2, { r: 3 }));
    layers.push(rect(32, gy + 66, Math.round(bw * pct), 6, g.color, { r: 3 }));

    const sK = g.saved >= 1000 ? `$${(g.saved/1000).toFixed(1)}k` : `$${g.saved}`;
    const tK = g.target >= 1000 ? `$${(g.target/1000).toFixed(1)}k` : `$${g.target}`;
    layers.push(text(32, gy + 80, 120, 12, `${sK} of ${tK}`, 9, '500', C.muted));
    layers.push(text(W - 90, gy + 80, 58, 12, `${Math.round(pct*100)}%`, 9, '700', g.color, { textAlign: 'right' }));
    layers.push(rect(32, gy + 100, 200, 18, C.surf2, { r: 9 }));
    layers.push(text(32, gy + 100, 200, 18, g.monthlyAuto, 8, '500', g.onTrack ? C.muted : C.amber, { textAlign: 'center', verticalAlign: 'middle' }));
    gy += cardH + 12;
  });

  // Tip nudge
  layers.push(rect(20, gy, W - 40, 44, C.violetDim, { r: 12 }));
  layers.push(rect(20, gy, 3, 44, C.violet, { r: [12, 0, 0, 12] }));
  layers.push(text(32, gy + 8, 20, 16, '✦', 11, '400', C.violet));
  layers.push(text(52, gy + 8, W - 82, 14, 'Automate $50 more/mo → all goals on track by Aug', 10, '600', C.text));
  layers.push(text(52, gy + 26, W - 82, 12, 'Tap to set up auto-transfer', 9, '400', C.muted));

  layers.push(...bottomNav(4));
  return { id: uid(), name: 'Goals', frame: frame(0, 0, W, H), children: layers };
}

// Assemble
const pen = {
  version: '2.8',
  name: 'LUCID — Personal Finance OS',
  description: 'Dark personal finance AI inspired by midday.ai (darkmodedesign.com). Near-black #06060F + electric violet + cyan/rose. AI insight cards with pulse border, glow-behind-hero balance.',
  screens: [screen1(), screen2(), screen3(), screen4(), screen5()],
  colorVariables: {
    primary: C.violet, secondary: C.cyan,
    background: C.bg, surface: C.surf,
    text: C.text, danger: C.rose, warning: C.amber,
  },
};

const out = path.join(__dirname, 'lucid.pen');
fs.writeFileSync(out, JSON.stringify(pen, null, 2));
console.log('✓ lucid.pen written —', fs.statSync(out).size, 'bytes');
console.log('  Screens:', pen.screens.map(s => s.name).join(', '));
