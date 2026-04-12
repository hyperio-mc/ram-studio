// pact-app.js
// PACT — Financial Wellbeing Companion
//
// Challenge: Design a LIGHT editorial finance app that treats money management
// like a wellness practice — warm, personal, evidence-based.
//
// Inspired by:
// 1. Dawn (lapa.ninja, 2026) — mental health AI app with warm earthy palette
//    (yellow/orange/brown), Source Serif, evidence-based framing applied to a
//    sensitive category. Key insight: warmth + editorial typography dissolves
//    clinical anxiety. Applying the same to personal finance.
// 2. Overlay (lapa.ninja, 2026) — precision robotics startup using PP Editorial Old
//    on white minimal layout. Technical category made human through editorial serif.
// 3. New Genre (minimal.gallery, 2026) — ultra-clean white studio (#FFF, #0C1018 text,
//    rgba(153,161,175,0.06) surface) strong type-forward grid system.
//
// Key innovation: Big numbers as editorial display type (Georgia serif), AI commentary
// as magazine pull-quotes with left-border rule, warm parchment (#FAF8F2) replacing
// sterile fintech white, spending data framed as a personal narrative not a ledger.
//
// Theme: LIGHT (last run FOLIO was DARK → this run LIGHT)
// Screens: 5 mobile (390×844)

'use strict';
const fs   = require('fs');
const path = require('path');

// ── Palette ────────────────────────────────────────────────────────────────
const BG       = '#FAF8F2';   // warm parchment
const SURFACE  = '#FFFFFF';
const SURFACE2 = '#F4F0E6';   // deeper parchment
const SURFACE3 = '#EDE5D4';   // warm sand
const TEXT     = '#1C1916';   // near-black warm
const MUTED    = '#8C7B68';   // warm brown muted
const MUTED2   = '#B8A898';   // lighter muted
const ACCENT   = '#C25E34';   // ember clay
const ACCENT2  = '#5A8472';   // sage green
const GOLD     = '#D4A840';   // warm amber
const BORDER   = '#E6DED0';
const SOFT     = '#F0EAE0';

function rect(x, y, w, h, fill, opts = {}) {
  return { type: 'rect', x, y, width: w, height: h, fill,
    radius: opts.radius ?? 0, opacity: opts.opacity ?? 1 };
}
function text(content, x, y, opts = {}) {
  return { type: 'text', content, x, y,
    fontSize: opts.size ?? 14, fontWeight: opts.weight ?? 'regular',
    color: opts.color ?? TEXT, align: opts.align ?? 'left',
    fontFamily: opts.font ?? 'Inter', opacity: opts.opacity ?? 1,
    ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}) };
}
function line(x1, y1, x2, y2, color = BORDER, width = 1) {
  return { type: 'line', x1, y1, x2, y2, stroke: color, strokeWidth: width };
}
function circle(cx, cy, r, fill, opts = {}) {
  return { type: 'circle', cx, cy, r, fill, opacity: opts.opacity ?? 1 };
}
function arc(cx, cy, r, start, end, color, strokeW = 8) {
  return { type: 'arc', cx, cy, r, startAngle: start, endAngle: end,
    stroke: color, strokeWidth: strokeW, fill: 'none' };
}

function statusBar(els, W) {
  els.push(text('9:41', 22, 16, { size: 12, weight: 'semibold', color: MUTED }));
  els.push(text('●●  ▲  🔋', W - 70, 16, { size: 11, color: MUTED }));
}

function bottomNav(els, W, H, active) {
  const navH = 80;
  els.push(rect(0, H - navH, W, navH, SURFACE));
  els.push(line(0, H - navH, W, H - navH, BORDER));
  const items = [
    { icon: '⌂', label: 'Home' },
    { icon: '◑', label: 'Spend' },
    { icon: '✦', label: 'AI' },
    { icon: '◎', label: 'Goals' },
    { icon: '○', label: 'You' },
  ];
  items.forEach((item, i) => {
    const nx = 39 + i * 78;
    const isActive = i === active;
    const col = isActive ? ACCENT : MUTED2;
    els.push(text(item.icon, nx, H - navH + 18, { size: 18, color: col, align: 'center' }));
    els.push(text(item.label, nx, H - navH + 40, { size: 9, color: col, align: 'center', ls: 0.3 }));
    if (isActive) els.push(rect(nx - 20, H - navH, 40, 2, ACCENT, { radius: 1 }));
  });
  els.push(rect(155, H - 6, 80, 4, SURFACE3, { radius: 2 }));
}

// ─── SCREEN 1: HOME ──────────────────────────────────────────────────────────
function screenHome() {
  const els = [];
  const W = 390, H = 844;
  els.push(rect(0, 0, W, H, BG));
  statusBar(els, W);

  // Header background strip
  els.push(rect(0, 0, W, 178, SURFACE2));
  // Decorative warm circle
  els.push(circle(W + 30, -30, 150, SOFT));

  els.push(text('Good morning', 24, 46, { size: 13, color: MUTED }));
  els.push(text('Maya', 24, 68, { size: 30, weight: 'bold', color: TEXT, font: 'Georgia' }));

  // Net worth pill
  els.push(rect(W - 136, 44, 116, 44, SURFACE, { radius: 22 }));
  els.push(text('Net Worth', W - 78, 50, { size: 9, color: MUTED, align: 'center' }));
  els.push(text('$24,180', W - 78, 67, { size: 16, weight: 'bold', color: ACCENT2, align: 'center' }));

  // AI pull-quote card (editorial style — inspired by Dawn's warm messaging)
  els.push(rect(24, 98, W - 48, 66, SURFACE, { radius: 14 }));
  els.push(rect(24, 98, 3, 66, ACCENT, { radius: 2 })); // left rule
  els.push(text('"Your spending rhythm is steady', 40, 110, { size: 11, color: MUTED, font: 'Georgia' }));
  els.push(text('this week — best stretch in 3 months."', 40, 128, { size: 11, color: MUTED, font: 'Georgia' }));
  // Wellness score
  els.push(circle(W - 48, 130, 22, ACCENT + '18'));
  els.push(text('84', W - 48, 122, { size: 18, weight: 'bold', color: ACCENT, align: 'center' }));
  els.push(text('/100', W - 48, 140, { size: 8, color: MUTED, align: 'center' }));

  // TODAY section
  els.push(text('TODAY', 24, 184, { size: 10, weight: 'semibold', color: MUTED, ls: 1.8 }));

  // Spend ring card
  els.push(rect(24, 200, W - 48, 162, SURFACE, { radius: 16 }));
  const cx = 90, cy = 282;
  // Ring bg
  els.push(circle(cx, cy, 56, BORDER));
  // Spent arc ~63%
  els.push(arc(cx, cy, 46, -90, 137, ACCENT, 10));
  // Remaining arc
  els.push(arc(cx, cy, 46, 137, 270, SOFT, 10));
  // Center label
  els.push(text('$847', cx, cy - 12, { size: 19, weight: 'bold', color: TEXT, align: 'center' }));
  els.push(text('spent', cx, cy + 8, { size: 9, color: MUTED, align: 'center' }));
  els.push(text('of $1,350', cx, cy + 24, { size: 9, color: MUTED2, align: 'center' }));

  // Legend
  const lx = 165;
  [
    { label: 'Food & Drink', pct: 38, color: ACCENT },
    { label: 'Transport', pct: 22, color: GOLD },
    { label: 'Shopping', pct: 25, color: ACCENT2 },
    { label: 'Remaining', pct: 15, color: SURFACE3 },
  ].forEach((item, i) => {
    const ly = 218 + i * 33;
    els.push(circle(lx + 6, ly + 7, 5, item.color));
    els.push(text(item.label, lx + 18, ly, { size: 11, color: TEXT }));
    els.push(text(`${item.pct}%`, W - 36, ly, { size: 11, weight: 'semibold', color: MUTED, align: 'right' }));
  });

  // Recent transactions
  els.push(text('RECENT', 24, 378, { size: 10, weight: 'semibold', color: MUTED, ls: 1.8 }));
  els.push(text('See all →', W - 24, 378, { size: 10, color: ACCENT, align: 'right' }));

  const txns = [
    { icon: '☕', name: 'Blue Bottle Coffee', cat: 'Food', amount: '-$6.40', income: false },
    { icon: '🛒', name: 'Whole Foods Market', cat: 'Groceries', amount: '-$84.20', income: false },
    { icon: '⬆', name: 'Paycheck — Stripe', cat: 'Income', amount: '+$3,200', income: true },
    { icon: '🚆', name: 'Caltrain Monthly', cat: 'Transport', amount: '-$105', income: false },
  ];

  txns.forEach((tx, i) => {
    const ty = 394 + i * 67;
    els.push(rect(24, ty, W - 48, 58, SURFACE, { radius: 12 }));
    els.push(circle(52, ty + 29, 20, tx.income ? ACCENT2 + '22' : SURFACE2));
    els.push(text(tx.icon, 52, ty + 22, { size: 14, align: 'center' }));
    els.push(text(tx.name, 82, ty + 14, { size: 13, weight: 'semibold', color: TEXT }));
    els.push(text(tx.cat, 82, ty + 32, { size: 10, color: MUTED }));
    els.push(text(tx.amount, W - 36, ty + 14,
      { size: 13, weight: 'semibold', color: tx.income ? ACCENT2 : TEXT, align: 'right' }));
    const times = ['8:42am', '11:15am', 'Yesterday', 'Apr 1'];
    els.push(text(times[i], W - 36, ty + 32, { size: 9, color: MUTED2, align: 'right' }));
  });

  bottomNav(els, W, H, 0);
  return { id: 'screen-1', name: 'Home', width: W, height: H, backgroundColor: BG, elements: els };
}

// ─── SCREEN 2: SPENDING ──────────────────────────────────────────────────────
function screenSpending() {
  const els = [];
  const W = 390, H = 844;
  els.push(rect(0, 0, W, H, BG));
  statusBar(els, W);

  els.push(text('Spending', 24, 46, { size: 11, color: MUTED, ls: 0.5 }));
  els.push(text('April 2026', 24, 64, { size: 30, weight: 'bold', color: TEXT, font: 'Georgia' }));

  // Month tabs
  ['Feb', 'Mar', 'Apr'].forEach((m, i) => {
    const mx = W - 112 + i * 37;
    const isActive = i === 2;
    els.push(rect(mx - 4, 50, 34, 24, isActive ? SURFACE3 : 'transparent', { radius: 7 }));
    els.push(text(m, mx + 13, 56, { size: 10, weight: isActive ? 'semibold' : 'regular',
      color: isActive ? TEXT : MUTED2, align: 'center' }));
  });

  // Big editorial number — hero typography (New Genre influence)
  els.push(rect(24, 100, W - 48, 102, SURFACE, { radius: 16 }));
  els.push(text('$847', 44, 118, { size: 50, weight: 'bold', color: TEXT, font: 'Georgia' }));
  els.push(text('spent this month', 44, 176, { size: 11, color: MUTED }));
  // Trend
  els.push(text('↓ 12% vs last month', W - 40, 150, { size: 11, color: ACCENT2, align: 'right' }));
  // Micro sparkline
  const barData = [0.4, 0.6, 0.5, 0.8, 0.7, 0.63, 0.55];
  barData.forEach((v, i) => {
    const bx = W - 132 + i * 14;
    const bh = Math.round(v * 32);
    els.push(rect(bx, 124 + (32 - bh), 10, bh, i === 6 ? ACCENT : SURFACE3, { radius: 3 }));
  });
  els.push(text('Last 7 days', W - 92, 166, { size: 8, color: MUTED2, align: 'center' }));

  // Category list
  els.push(text('BY CATEGORY', 24, 218, { size: 10, weight: 'semibold', color: MUTED, ls: 1.8 }));

  const cats = [
    { icon: '🍽', name: 'Food & Drink', amount: '$322', pct: 38, color: ACCENT, sub: '14 transactions' },
    { icon: '🛒', name: 'Groceries', amount: '$212', pct: 25, color: GOLD, sub: '6 transactions' },
    { icon: '🚆', name: 'Transport', amount: '$185', pct: 22, color: ACCENT2, sub: 'Caltrain + Uber' },
    { icon: '💄', name: 'Personal Care', amount: '$64', pct: 8, color: '#C278A0', sub: '3 transactions' },
    { icon: '📱', name: 'Subscriptions', amount: '$64', pct: 7, color: '#7878C2', sub: '4 services' },
  ];

  cats.forEach((cat, i) => {
    const cy2 = 234 + i * 82;
    els.push(rect(24, cy2, W - 48, 74, SURFACE, { radius: 14 }));
    els.push(rect(24, cy2, 3, 74, cat.color, { radius: 2 }));
    els.push(text(cat.icon, 50, cy2 + 20, { size: 18 }));
    els.push(text(cat.name, 78, cy2 + 16, { size: 13, weight: 'semibold', color: TEXT }));
    els.push(text(cat.sub, 78, cy2 + 35, { size: 10, color: MUTED }));
    els.push(text(cat.amount, W - 36, cy2 + 14, { size: 16, weight: 'bold', color: TEXT, align: 'right' }));
    els.push(text(`${cat.pct}%`, W - 36, cy2 + 35, { size: 10, color: cat.color, align: 'right' }));
    els.push(rect(78, cy2 + 52, W - 120, 5, BORDER, { radius: 3 }));
    els.push(rect(78, cy2 + 52, Math.round((W - 120) * (cat.pct / 100)), 5, cat.color, { radius: 3 }));
  });

  bottomNav(els, W, H, 1);
  return { id: 'screen-2', name: 'Spending', width: W, height: H, backgroundColor: BG, elements: els };
}

// ─── SCREEN 3: GOALS ─────────────────────────────────────────────────────────
function screenGoals() {
  const els = [];
  const W = 390, H = 844;
  els.push(rect(0, 0, W, H, BG));
  statusBar(els, W);

  els.push(text('Goals', 24, 46, { size: 11, color: MUTED, ls: 0.5 }));
  els.push(text('Your Intentions', 24, 64, { size: 30, weight: 'bold', color: TEXT, font: 'Georgia' }));

  // Add button
  els.push(rect(W - 114, 54, 94, 30, ACCENT, { radius: 15 }));
  els.push(text('+ New Goal', W - 67, 62, { size: 10, weight: 'semibold', color: SURFACE, align: 'center' }));

  // Savings rate badge
  els.push(rect(24, 100, W - 48, 72, SURFACE2, { radius: 16 }));
  els.push(rect(24, 100, 3, 72, GOLD, { radius: 2 }));
  els.push(text('Monthly savings rate', 40, 114, { size: 11, color: MUTED }));
  els.push(text('22%', 40, 138, { size: 34, weight: 'bold', color: GOLD, font: 'Georgia' }));
  els.push(text('of income', 112, 148, { size: 11, color: MUTED }));
  els.push(text('↑ On track for $7,200/yr', W - 40, 130, { size: 10, color: ACCENT2, align: 'right' }));

  els.push(text('ACTIVE GOALS', 24, 190, { size: 10, weight: 'semibold', color: MUTED, ls: 1.8 }));

  const goals = [
    { name: 'Emergency Fund', icon: '🛡', target: '$10,000', current: '$6,800',
      pct: 68, color: ACCENT2, deadline: 'Sep 2026', note: 'Great pace — $530/mo needed' },
    { name: 'Japan Trip', icon: '✈️', target: '$4,500', current: '$1,980',
      pct: 44, color: ACCENT, deadline: 'Nov 2026', note: 'Auto-saving $300/month' },
    { name: 'MacBook Pro', icon: '💻', target: '$2,800', current: '$2,240',
      pct: 80, color: GOLD, deadline: 'Jun 2026', note: 'Almost there — $560 to go' },
    { name: 'Roth IRA 2026', icon: '📈', target: '$7,000', current: '$2,800',
      pct: 40, color: '#7878C2', deadline: 'Dec 2026', note: '$350/mo auto-contributed' },
  ];

  goals.forEach((g, i) => {
    const gy = 206 + i * 130;
    els.push(rect(24, gy, W - 48, 122, SURFACE, { radius: 16 }));
    els.push(text(g.icon, 44, gy + 18, { size: 20 }));
    els.push(text(g.name, 76, gy + 16, { size: 15, weight: 'bold', color: TEXT }));
    els.push(text(g.deadline, 76, gy + 36, { size: 10, color: MUTED }));
    // Large % — editorial display type
    els.push(text(`${g.pct}%`, W - 38, gy + 12, { size: 34, weight: 'bold', color: g.color, font: 'Georgia', align: 'right' }));
    // Progress track
    els.push(rect(40, gy + 66, W - 80, 8, BORDER, { radius: 4 }));
    els.push(rect(40, gy + 66, Math.round((W - 80) * (g.pct / 100)), 8, g.color, { radius: 4 }));
    // Milestone dot
    if (g.pct >= 50) {
      const dotX = 40 + Math.round((W - 80) * 0.5);
      els.push(circle(dotX, gy + 70, 5, SURFACE));
      els.push(circle(dotX, gy + 70, 3, g.color));
    }
    els.push(text(g.current, 40, gy + 86, { size: 13, weight: 'semibold', color: TEXT }));
    els.push(text(`of ${g.target}`, 40 + g.current.length * 8 + 2, gy + 86, { size: 11, color: MUTED }));
    els.push(text(g.note, 40, gy + 104, { size: 10, color: MUTED }));
  });

  bottomNav(els, W, H, 3);
  return { id: 'screen-3', name: 'Goals', width: W, height: H, backgroundColor: BG, elements: els };
}

// ─── SCREEN 4: AI INSIGHTS ───────────────────────────────────────────────────
function screenInsights() {
  const els = [];
  const W = 390, H = 844;
  els.push(rect(0, 0, W, H, BG));
  statusBar(els, W);

  els.push(text('AI Insights', 24, 46, { size: 11, color: MUTED, ls: 0.5 }));
  els.push(text('Your Money Story', 24, 64, { size: 30, weight: 'bold', color: TEXT, font: 'Georgia' }));

  // Date chip
  els.push(rect(W - 124, 56, 104, 24, SURFACE3, { radius: 12 }));
  els.push(text('Apr 1–7, 2026', W - 72, 63, { size: 10, color: MUTED, align: 'center' }));

  // Hero pull-quote (editorial style — direct nod to Dawn lapa.ninja)
  els.push(rect(24, 96, W - 48, 142, SURFACE, { radius: 18 }));
  els.push(rect(24, 96, W - 48, 3, ACCENT, { radius: 2 }));
  // Large decorative quote mark
  els.push(text('"', 34, 100, { size: 68, color: ACCENT + '28', font: 'Georgia' }));
  els.push(text('You spent 23% less on dining', 40, 126, { size: 14, color: TEXT, font: 'Georgia' }));
  els.push(text('out than last week — your best', 40, 146, { size: 14, color: TEXT, font: 'Georgia' }));
  els.push(text('streak in three months.', 40, 166, { size: 14, color: TEXT, font: 'Georgia' }));
  els.push(text('— Pact AI · Apr 7', 40, 192, { size: 10, color: MUTED }));
  els.push(circle(W - 46, 116, 18, ACCENT2 + '22'));
  els.push(text('✦', W - 46, 108, { size: 14, color: ACCENT2, align: 'center' }));

  // Nugget cards row
  els.push(text('THIS WEEK', 24, 254, { size: 10, weight: 'semibold', color: MUTED, ls: 1.8 }));

  const nuggets = [
    { icon: '☕', title: 'Coffee habit', value: '$38', sub: '↓ $14 vs avg', color: GOLD, note: 'Saved by brewing at home' },
    { icon: '📍', title: 'Top merchant', value: 'Whole Foods', sub: '3 visits this week', color: ACCENT2, note: '$212 in groceries' },
  ];
  nuggets.forEach((n, i) => {
    const nw = Math.floor((W - 60) / 2);
    const nx = 24 + i * (nw + 12);
    els.push(rect(nx, 270, nw, 122, SURFACE, { radius: 14 }));
    els.push(circle(nx + 28, 296, 20, n.color + '22'));
    els.push(text(n.icon, nx + 28, 288, { size: 15, align: 'center' }));
    els.push(text(n.title, nx + 12, 322, { size: 11, weight: 'semibold', color: TEXT }));
    els.push(text(n.value, nx + 12, 342, { size: 18, weight: 'bold', color: n.color, font: 'Georgia' }));
    els.push(text(n.sub, nx + 12, 364, { size: 9, color: MUTED }));
    els.push(text(n.note, nx + 12, 378, { size: 9, color: MUTED2 }));
  });

  // Pattern observations
  els.push(text('PATTERNS', 24, 408, { size: 10, weight: 'semibold', color: MUTED, ls: 1.8 }));

  const patterns = [
    { headline: 'Weekend spending spikes', icon: '📅', color: ACCENT,
      line1: 'You spend 2.4× more on Sat/Sun —', line2: 'mostly dining and leisure.' },
    { headline: 'Morning is your danger zone', icon: '🌅', color: GOLD,
      line1: 'Coffee + transit peak 7–9am,', line2: 'adding $340/mo over time.' },
    { headline: 'Subscription creep detected', icon: '🔔', color: '#7878C2',
      line1: '4 streaming services active this month.', line2: 'Consider consolidating.' },
  ];

  patterns.forEach((p, i) => {
    const py = 424 + i * 96;
    els.push(rect(24, py, W - 48, 88, SURFACE, { radius: 14 }));
    els.push(rect(24, py, 3, 88, p.color, { radius: 2 }));
    els.push(text(p.icon, 44, py + 20, { size: 18 }));
    els.push(text(p.headline, 76, py + 18, { size: 13, weight: 'semibold', color: TEXT }));
    els.push(text(p.line1, 76, py + 38, { size: 10, color: MUTED }));
    els.push(text(p.line2, 76, py + 54, { size: 10, color: MUTED }));
    els.push(rect(76, py + 66, 68, 16, p.color + '20', { radius: 8 }));
    els.push(text('See detail →', 110, py + 67, { size: 8, color: p.color, align: 'center' }));
  });

  bottomNav(els, W, H, 2);
  return { id: 'screen-4', name: 'AI Insights', width: W, height: H, backgroundColor: BG, elements: els };
}

// ─── SCREEN 5: TRENDS ────────────────────────────────────────────────────────
function screenTrends() {
  const els = [];
  const W = 390, H = 844;
  els.push(rect(0, 0, W, H, BG));
  statusBar(els, W);

  els.push(text('Trends', 24, 46, { size: 11, color: MUTED, ls: 0.5 }));
  els.push(text('At a Glance', 24, 64, { size: 30, weight: 'bold', color: TEXT, font: 'Georgia' }));

  // Period toggle
  const periods = ['1W', '1M', '3M', '1Y'];
  els.push(rect(W - 150, 52, 138, 26, SURFACE3, { radius: 13 }));
  periods.forEach((p, i) => {
    const isActive = i === 1;
    const px = W - 146 + i * 34;
    if (isActive) els.push(rect(px - 4, 54, 32, 22, ACCENT, { radius: 11 }));
    els.push(text(p, px + 12, 60, { size: 10, weight: isActive ? 'semibold' : 'regular',
      color: isActive ? SURFACE : MUTED2, align: 'center' }));
  });

  // Monthly spending bar chart
  els.push(rect(24, 96, W - 48, 172, SURFACE, { radius: 16 }));
  els.push(text('Monthly Spending', 40, 112, { size: 12, weight: 'semibold', color: TEXT }));
  els.push(text('vs. $1,350 budget', 40, 128, { size: 10, color: MUTED }));

  const chartData = [
    { label: 'Jan', val: 0.82, spend: '$986' },
    { label: 'Feb', val: 0.74, spend: '$888' },
    { label: 'Mar', val: 0.98, spend: '$1,178' },
    { label: 'Apr', val: 0.63, spend: '$847' },
  ];
  const chartH = 90;
  const chartBase = 96 + 158;

  // Budget line
  els.push(line(40, chartBase - chartH, W - 40, chartBase - chartH, BORDER));
  els.push(text('Budget', W - 42, chartBase - chartH - 8, { size: 8, color: MUTED2, align: 'right' }));

  chartData.forEach((d, i) => {
    const cx2 = 56 + i * 82;
    const bh = Math.round(d.val * chartH);
    const barW = 48;
    const isOver = d.val > 0.9;
    const isCurrent = i === 3;
    const barColor = isOver ? ACCENT : isCurrent ? ACCENT : SURFACE3;
    els.push(rect(cx2 - barW/2, chartBase - bh, barW, bh,
      barColor + (isCurrent ? '' : '90'), { radius: 6 }));
    els.push(text(d.label, cx2, chartBase + 10, { size: 9, color: MUTED, align: 'center' }));
    els.push(text(d.spend, cx2, chartBase - bh - 12, { size: 8,
      color: isCurrent ? ACCENT : MUTED, align: 'center' }));
  });

  // Top merchants
  els.push(text('TOP MERCHANTS', 24, 286, { size: 10, weight: 'semibold', color: MUTED, ls: 1.8 }));

  const merchants = [
    { name: 'Whole Foods', icon: '🛒', total: '$212', count: '4 visits', rank: 1 },
    { name: 'Caltrain', icon: '🚆', total: '$105', count: '1 monthly pass', rank: 2 },
    { name: 'Blue Bottle', icon: '☕', total: '$86', count: '12 visits', rank: 3 },
    { name: 'Uber', icon: '🚘', total: '$72', count: '6 rides', rank: 4 },
    { name: 'Netflix', icon: '🎬', total: '$22', count: 'Subscription', rank: 5 },
  ];

  merchants.forEach((m, i) => {
    const my = 302 + i * 64;
    els.push(rect(24, my, W - 48, 56, SURFACE, { radius: 12 }));
    els.push(text(`${m.rank}`, 44, my + 18, { size: 14, weight: 'bold', color: MUTED2, align: 'center' }));
    els.push(circle(74, my + 28, 18, SURFACE2));
    els.push(text(m.icon, 74, my + 21, { size: 14, align: 'center' }));
    els.push(text(m.name, 102, my + 14, { size: 13, weight: 'semibold', color: TEXT }));
    els.push(text(m.count, 102, my + 32, { size: 10, color: MUTED }));
    els.push(text(m.total, W - 36, my + 14, { size: 15, weight: 'bold', color: TEXT, align: 'right' }));
    // Proportion bar
    const bl = Math.round(80 * (5 - m.rank + 1) / 5);
    els.push(rect(W - 112, my + 36, 80, 4, BORDER, { radius: 2 }));
    els.push(rect(W - 112, my + 36, bl, 4, ACCENT + 'AA', { radius: 2 }));
  });

  // Net cash flow
  const flowY = 302 + merchants.length * 64 + 8;
  els.push(rect(24, flowY, W - 48, 58, ACCENT2 + '18', { radius: 14 }));
  els.push(rect(24, flowY, 3, 58, ACCENT2, { radius: 2 }));
  els.push(text('Net cash flow this month', 40, flowY + 14, { size: 11, color: MUTED }));
  els.push(text('+$2,353', 40, flowY + 36, { size: 22, weight: 'bold', color: ACCENT2, font: 'Georgia' }));
  els.push(text('$3,200 income · $847 spent', W - 40, flowY + 26, { size: 9, color: MUTED2, align: 'right' }));

  bottomNav(els, W, H, 1);
  return { id: 'screen-5', name: 'Trends', width: W, height: H, backgroundColor: BG, elements: els };
}

// ─── ASSEMBLE & WRITE ─────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  metadata: {
    name: 'PACT — Financial Wellbeing Companion',
    description: 'Light editorial personal finance app treating money management like a wellness practice. Warm parchment backgrounds (#FAF8F2), Georgia serif display type, amber/clay accent. Inspired by Dawn\'s warm earthy health AI (lapa.ninja 2026), Overlay\'s editorial serif on white (lapa.ninja 2026), and New Genre\'s clean minimal grid (minimal.gallery 2026). Screens: Home with spend ring + transactions, Spending editorial breakdown, Goals with large % display type, AI Insights editorial pull-quotes, Trends with bar charts + merchant ranking.',
    author: 'RAM Design AI',
    created: new Date().toISOString(),
    theme: 'light',
    tags: ['light', 'editorial', 'finance', 'wellness', 'warm', 'serif', 'minimal'],
  },
  screens: [
    screenHome(),
    screenSpending(),
    screenGoals(),
    screenInsights(),
    screenTrends(),
  ],
};

fs.writeFileSync(path.join(__dirname, 'pact.pen'), JSON.stringify(pen, null, 2));
console.log('✓ pact.pen written —', pen.screens.length, 'screens');
