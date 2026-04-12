'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'loam';
const NAME = 'LOAM';
const TAGLINE = 'spend with the grain';
const HEARTBEAT = 392;

// Palette — warm cream light theme, terracotta accent
const BG     = '#FAF7F1';
const SURF   = '#FFFFFF';
const CARD   = '#F2EDE4';
const CARD2  = '#EDE6D9';
const ACC    = '#C4622D';  // terracotta
const ACC2   = '#7B9B6B';  // sage green
const TEXT   = '#1C1814';
const TEXT2  = '#6B5F55';
const TEXT3  = '#9E9188';
const BORD   = '#E5DDD0';
const RED    = '#D64E3A';
const GOLD   = '#D4A03A';

const W = 390, H = 844;

// ── primitives ──────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return { type: 'rect', x, y, width: w, height: h, fill,
    rx: opts.rx || 0, opacity: opts.opacity !== undefined ? opts.opacity : 1,
    stroke: opts.stroke || 'none', strokeWidth: opts.sw || 0 };
}
function text(x, y, content, size, fill, opts = {}) {
  return { type: 'text', x, y, content: String(content), fontSize: size, fill,
    fontWeight: opts.fw || 400, fontFamily: opts.font || 'Inter',
    textAnchor: opts.anchor || 'start', letterSpacing: opts.ls || 0,
    opacity: opts.opacity !== undefined ? opts.opacity : 1 };
}
function circle(cx, cy, r, fill, opts = {}) {
  return { type: 'circle', cx, cy, r, fill,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
    stroke: opts.stroke || 'none', strokeWidth: opts.sw || 0 };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return { type: 'line', x1, y1, x2, y2, stroke, strokeWidth: opts.sw || 1,
    opacity: opts.opacity !== undefined ? opts.opacity : 1 };
}

// ── shared components ────────────────────────────────────────────────────────

// Status bar
function statusBar() {
  return [
    rect(0, 0, W, 50, SURF),
    text(20, 33, '9:41', 14, TEXT, { fw: 600 }),
    text(W - 20, 33, '●●● ▲ ■', 11, TEXT, { anchor: 'end', opacity: 0.6 }),
  ];
}

// Nav bar
function navBar(active) {
  const items = [
    { id: 0, label: 'Home',   icon: '⌂' },
    { id: 1, label: 'Budget', icon: '◫' },
    { id: 2, label: 'Tx',     icon: '↕' },
    { id: 3, label: 'Goals',  icon: '◎' },
    { id: 4, label: 'You',    icon: '◯' },
  ];
  const els = [
    rect(0, H - 90, W, 90, SURF),
    line(0, H - 90, W, H - 90, BORD, { sw: 1 }),
  ];
  items.forEach((item, i) => {
    const x = 20 + i * 70 + 15;
    const isActive = i === active;
    els.push(text(x + 10, H - 62, item.icon, 18, isActive ? ACC : TEXT3, { anchor: 'middle' }));
    els.push(text(x + 10, H - 44, item.label, 9, isActive ? ACC : TEXT3, { anchor: 'middle', fw: isActive ? 600 : 400 }));
    if (isActive) {
      els.push(rect(x - 5, H - 88, 30, 3, ACC, { rx: 2 }));
    }
  });
  return els;
}

// ── SCREEN 1: Dashboard ─────────────────────────────────────────────────────
function screenDashboard() {
  const els = [];
  // Background
  els.push(rect(0, 0, W, H, BG));
  els.push(...statusBar());

  // Header
  els.push(text(20, 80, 'LOAM', 13, ACC, { fw: 700, ls: 3 }));
  els.push(text(W - 20, 80, '☾', 18, TEXT, { anchor: 'end' }));

  // Greeting
  els.push(text(20, 108, 'Good morning, Maya', 16, TEXT, { fw: 400, opacity: 0.6 }));

  // ── Balance hero card (full-width) ──────────────────────────────
  els.push(rect(16, 120, W - 32, 128, ACC, { rx: 16 }));
  // Subtle texture dots
  for (let i = 0; i < 6; i++) {
    els.push(circle(W - 40 + (i % 3) * 14, 135 + Math.floor(i / 3) * 18, 2.5, '#FFFFFF', { opacity: 0.08 }));
  }
  els.push(text(32, 147, 'NET WORTH', 10, '#FFFFFF', { fw: 600, ls: 2, opacity: 0.7 }));
  els.push(text(32, 182, '$47,830', 38, '#FFFFFF', { fw: 700 }));
  els.push(text(32, 205, '+$1,247 this month', 12, '#FFFFFF', { fw: 400, opacity: 0.75 }));

  // Pill tags
  els.push(rect(32, 222, 60, 20, '#FFFFFF', { rx: 10, opacity: 0.15 }));
  els.push(text(62, 236, '↑ 2.7%', 11, '#FFFFFF', { anchor: 'middle', fw: 500 }));
  els.push(rect(104, 222, 72, 20, '#FFFFFF', { rx: 10, opacity: 0.15 }));
  els.push(text(140, 236, '30-day avg', 11, '#FFFFFF', { anchor: 'middle', fw: 500 }));

  // ── Bento grid row 1: Spent / Saved ────────────────────────────
  const bRow1Y = 264;
  // Spent card
  els.push(rect(16, bRow1Y, 172, 100, SURF, { rx: 14 }));
  els.push(text(28, bRow1Y + 20, 'SPENT', 9, TEXT3, { fw: 600, ls: 2 }));
  els.push(text(28, bRow1Y + 50, '$2,140', 24, TEXT, { fw: 700 }));
  els.push(text(28, bRow1Y + 70, 'of $2,600 budget', 10, TEXT3));
  // Mini bar
  els.push(rect(28, bRow1Y + 80, 130, 5, BORD, { rx: 3 }));
  els.push(rect(28, bRow1Y + 80, 107, 5, ACC, { rx: 3 }));

  // Saved card
  els.push(rect(202, bRow1Y, 172, 100, SURF, { rx: 14 }));
  els.push(text(214, bRow1Y + 20, 'SAVED', 9, TEXT2, { fw: 600, ls: 2, opacity: 0.5}));
  els.push(text(214, bRow1Y + 50, '$840', 24, ACC2, { fw: 700 }));
  els.push(text(214, bRow1Y + 70, 'this month', 10, TEXT3));
  // Mini ring
  els.push(circle(338, bRow1Y + 75, 12, 'none', { stroke: BORD, sw: 3 }));
  els.push(circle(338, bRow1Y + 75, 12, 'none', { stroke: ACC2, sw: 3, opacity: 0.9 }));

  // ── Bento grid row 2: Spending pulse (wide) + Days left (narrow) ─
  const bRow2Y = 376;
  // Pulse card
  els.push(rect(16, bRow2Y, 172, 88, CARD, { rx: 14 }));
  els.push(text(28, bRow2Y + 20, 'DAILY PULSE', 9, TEXT3, { fw: 600, ls: 2 }));
  // Mini bar chart
  const bars = [18, 32, 14, 40, 28, 22, 35];
  bars.forEach((h, i) => {
    const bx = 30 + i * 20;
    const by = bRow2Y + 72 - h;
    els.push(rect(bx, by, 12, h, i === 4 ? ACC : BORD, { rx: 3 }));
  });
  els.push(text(28, bRow2Y + 56, 'Peak: Wed $94', 9, TEXT3));

  // Days left card
  els.push(rect(202, bRow2Y, 172, 88, CARD, { rx: 14 }));
  els.push(text(214, bRow2Y + 20, 'DAYS LEFT', 9, TEXT3, { fw: 600, ls: 2 }));
  els.push(text(214, bRow2Y + 54, '22', 32, TEXT, { fw: 700 }));
  els.push(text(214, bRow2Y + 72, '~$21/day left', 10, TEXT3));

  // ── Recent activity header ───────────────────────────────────────
  const actY = 480;
  els.push(text(20, actY, 'Recent', 16, TEXT, { fw: 600 }));
  els.push(text(W - 20, actY, 'See all →', 12, ACC, { anchor: 'end' }));

  // Recent transactions
  const txs = [
    { icon: '🍃', name: 'Whole Foods', cat: 'Groceries', amt: '-$34.20', time: '2h ago', color: TEXT },
    { icon: '☕', name: 'Blue Bottle', cat: 'Coffee',    amt: '-$6.50',  time: '5h ago', color: TEXT },
    { icon: '📦', name: 'Direct dep.',  cat: 'Income',   amt: '+$2,800', time: 'Today',  color: ACC2 },
  ];
  txs.forEach((tx, i) => {
    const ty = actY + 22 + i * 58;
    els.push(rect(16, ty, W - 32, 50, SURF, { rx: 12 }));
    els.push(circle(40, ty + 25, 16, CARD));
    els.push(text(40, ty + 29, tx.icon, 14, TEXT, { anchor: 'middle' }));
    els.push(text(64, ty + 18, tx.name, 13, TEXT, { fw: 500 }));
    els.push(text(64, ty + 34, tx.cat,  11, TEXT3));
    els.push(text(W - 28, ty + 18, tx.amt, 13, tx.color, { anchor: 'end', fw: 600 }));
    els.push(text(W - 28, ty + 34, tx.time, 10, TEXT3, { anchor: 'end' }));
  });

  els.push(...navBar(0));
  return els;
}

// ── SCREEN 2: Budget ────────────────────────────────────────────────────────
function screenBudget() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  els.push(...statusBar());

  els.push(text(20, 80, 'Budget', 22, TEXT, { fw: 700 }));
  els.push(text(20, 102, 'April 2026', 13, TEXT3));

  // Month selector pills
  ['Feb', 'Mar', 'Apr', 'May'].forEach((m, i) => {
    const isActive = i === 2;
    const px = 20 + i * 78;
    els.push(rect(px, 116, 68, 26, isActive ? ACC : SURF, { rx: 13 }));
    els.push(text(px + 34, 134, m, 12, isActive ? '#FFFFFF' : TEXT2, { anchor: 'middle', fw: isActive ? 600 : 400 }));
  });

  // Summary card
  els.push(rect(16, 152, W - 32, 72, ACC, { rx: 14 }));
  els.push(text(32, 174, 'Total Spent', 11, '#FFFFFF', { opacity: 0.7 }));
  els.push(text(32, 198, '$2,140', 26, '#FFFFFF', { fw: 700 }));
  els.push(text(W/2, 174, 'Remaining', 11, '#FFFFFF', { opacity: 0.7, anchor: 'middle' }));
  els.push(text(W/2, 198, '$460', 26, '#FFFFFF', { fw: 700, anchor: 'middle' }));
  els.push(text(W - 32, 174, 'Saved', 11, '#FFFFFF', { opacity: 0.7, anchor: 'end' }));
  els.push(text(W - 32, 198, '$840', 26, '#FFFFFF', { fw: 700, anchor: 'end' }));

  // Category list
  const cats = [
    { name: 'Housing',    icon: '⌂', spent: 1200, budget: 1200, pct: 100, color: ACC },
    { name: 'Groceries',  icon: '🌿', spent: 320,  budget: 400,  pct: 80,  color: ACC2 },
    { name: 'Transport',  icon: '→',  spent: 145,  budget: 200,  pct: 73,  color: GOLD },
    { name: 'Dining',     icon: '◎',  spent: 210,  budget: 150,  pct: 140, color: RED },
    { name: 'Health',     icon: '♡',  spent: 60,   budget: 100,  pct: 60,  color: ACC2 },
    { name: 'Fun',        icon: '✦',  spent: 205,  budget: 300,  pct: 68,  color: ACC },
  ];

  els.push(text(20, 244, 'Categories', 14, TEXT, { fw: 600 }));

  cats.forEach((cat, i) => {
    const cy = 260 + i * 72;
    els.push(rect(16, cy, W - 32, 62, SURF, { rx: 12 }));
    // Icon circle
    els.push(circle(44, cy + 31, 16, CARD));
    els.push(text(44, cy + 36, cat.icon, 13, TEXT, { anchor: 'middle' }));
    // Name & spent
    els.push(text(70, cy + 22, cat.name, 13, TEXT, { fw: 500 }));
    els.push(text(70, cy + 40, `$${cat.spent} of $${cat.budget}`, 11, TEXT3));
    // Pct label
    const overBudget = cat.pct > 100;
    els.push(text(W - 28, cy + 22, `${cat.pct}%`, 12, overBudget ? RED : TEXT2, { anchor: 'end', fw: 600 }));
    if (overBudget) els.push(text(W - 28, cy + 38, 'over', 9, RED, { anchor: 'end' }));
    // Progress bar
    const barW = W - 32 - 70 - 50;
    const fillW = Math.min(cat.pct / 100, 1) * barW;
    els.push(rect(70, cy + 50, barW, 4, BORD, { rx: 2 }));
    els.push(rect(70, cy + 50, fillW, 4, cat.color, { rx: 2 }));
  });

  els.push(...navBar(1));
  return els;
}

// ── SCREEN 3: Transactions ──────────────────────────────────────────────────
function screenTransactions() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  els.push(...statusBar());

  els.push(text(20, 80, 'Activity', 22, TEXT, { fw: 700 }));

  // Search bar
  els.push(rect(16, 92, W - 32, 40, SURF, { rx: 20, stroke: BORD, sw: 1 }));
  els.push(text(38, 117, '🔍', 14, TEXT3));
  els.push(text(60, 117, 'Search transactions...', 13, TEXT3));

  // Filter chips
  const filters = ['All', 'Food', 'Transport', 'Bills', 'Fun'];
  filters.forEach((f, i) => {
    const isActive = i === 0;
    const fw = 14 + f.length * 7;
    const startX = i === 0 ? 16 : 16 + filters.slice(0, i).reduce((a, f2) => a + 14 + f2.length * 7 + 8, 0);
    els.push(rect(startX, 142, fw, 28, isActive ? ACC : SURF, { rx: 14, stroke: isActive ? 'none' : BORD, sw: 1 }));
    els.push(text(startX + fw / 2, 161, f, 11, isActive ? '#FFFFFF' : TEXT2, { anchor: 'middle', fw: isActive ? 600 : 400 }));
  });

  // Date groups & transactions
  const sections = [
    { date: 'Today, April 8', txs: [
      { icon: '🍃', name: 'Whole Foods Market', cat: 'Groceries', amt: '-$34.20', sub: '2:14 PM' },
      { icon: '☕', name: 'Blue Bottle Coffee', cat: 'Dining',    amt: '-$6.50',  sub: '8:30 AM' },
      { icon: '📦', name: 'Direct Deposit',     cat: 'Income',   amt: '+$2,800', sub: '12:00 AM', pos: true },
    ]},
    { date: 'Yesterday, April 7', txs: [
      { icon: '🚌', name: 'Clipper Card',       cat: 'Transport', amt: '-$3.25',  sub: '7:45 AM' },
      { icon: '🌿', name: 'CSA Farm Box',       cat: 'Groceries', amt: '-$42.00', sub: 'Recurring' },
      { icon: '◎',  name: 'Ritual Coffee',      cat: 'Dining',   amt: '-$5.75',  sub: '8:12 AM' },
    ]},
  ];

  let curY = 180;
  sections.forEach(section => {
    els.push(text(20, curY + 12, section.date, 11, TEXT3, { fw: 600, ls: 0.5 }));
    curY += 24;
    section.txs.forEach(tx => {
      els.push(rect(16, curY, W - 32, 52, SURF, { rx: 12 }));
      els.push(circle(42, curY + 26, 15, CARD));
      els.push(text(42, curY + 30, tx.icon, 14, TEXT, { anchor: 'middle' }));
      els.push(text(66, curY + 20, tx.name, 12, TEXT, { fw: 500 }));
      els.push(text(66, curY + 36, tx.cat,  10, TEXT3));
      const amtColor = tx.pos ? ACC2 : TEXT;
      els.push(text(W - 28, curY + 20, tx.amt,  12, amtColor, { anchor: 'end', fw: 600 }));
      els.push(text(W - 28, curY + 36, tx.sub,  10, TEXT3, { anchor: 'end' }));
      curY += 58;
    });
    curY += 6;
  });

  els.push(...navBar(2));
  return els;
}

// ── SCREEN 4: Goals ─────────────────────────────────────────────────────────
function screenGoals() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  els.push(...statusBar());

  els.push(text(20, 80, 'Goals', 22, TEXT, { fw: 700 }));
  els.push(text(W - 20, 75, '+ Add', 13, ACC, { anchor: 'end', fw: 500 }));

  // Active goal card (featured, full-width)
  els.push(rect(16, 96, W - 32, 148, CARD2, { rx: 16 }));
  els.push(rect(16, 96, W - 32, 148, ACC, { rx: 16, opacity: 0.06 }));

  // Goal header
  els.push(text(32, 122, '✦ FEATURED GOAL', 9, ACC, { fw: 700, ls: 2 }));
  els.push(text(32, 146, 'Japan Trip 2027', 18, TEXT, { fw: 700 }));
  els.push(text(32, 165, '¥ Kyoto & Tokyo · 14 nights', 12, TEXT3));

  // Ring progress (large)
  const gx = W - 64, gy = 170;
  els.push(circle(gx, gy, 30, 'none', { stroke: BORD, sw: 5 }));
  els.push(circle(gx, gy, 30, 'none', { stroke: ACC, sw: 5, opacity: 0.9 }));
  els.push(text(gx, gy + 5, '63%', 12, ACC, { anchor: 'middle', fw: 700 }));

  // Amounts
  els.push(text(32, 196, '$3,780', 20, ACC, { fw: 700 }));
  els.push(text(32, 214, 'of $6,000 goal', 12, TEXT3));

  // Mini progress bar
  els.push(rect(32, 226, W - 80, 6, BORD, { rx: 3 }));
  els.push(rect(32, 226, (W - 80) * 0.63, 6, ACC, { rx: 3 }));
  els.push(text(32, 240, 'On track · 14 months left', 10, ACC2));

  // Other goals grid
  const goals = [
    { name: 'Emergency Fund',  sub: '3-month runway',     pct: 88, color: ACC2,  icon: '⛺', amount: '$8,800', target: '$10,000' },
    { name: 'New Laptop',       sub: 'MacBook Pro M5',     pct: 55, color: GOLD,  icon: '⬛', amount: '$1,100', target: '$2,000' },
    { name: 'Investment Fund',  sub: 'Index portfolio',    pct: 30, color: ACC,   icon: '◎', amount: '$3,000', target: '$10,000' },
    { name: 'Debt Payoff',      sub: 'Student loans',      pct: 71, color: TEXT2, icon: '▽', amount: '$7,100', target: '$10,000' },
  ];

  els.push(text(20, 266, 'All Goals', 14, TEXT, { fw: 600 }));

  goals.forEach((g, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const gx2 = 16 + col * 186;
    const gy2 = 284 + row * 118;
    els.push(rect(gx2, gy2, 172, 108, SURF, { rx: 14 }));
    // Icon
    els.push(circle(gx2 + 20, gy2 + 22, 12, CARD));
    els.push(text(gx2 + 20, gy2 + 26, g.icon, 11, TEXT, { anchor: 'middle' }));
    els.push(text(gx2 + 38, gy2 + 18, g.name, 11, TEXT, { fw: 500 }));
    els.push(text(gx2 + 38, gy2 + 34, g.sub, 9, TEXT3));
    // Amount
    els.push(text(gx2 + 12, gy2 + 56, g.amount, 16, g.color, { fw: 700 }));
    els.push(text(gx2 + 12, gy2 + 72, `of ${g.target}`, 10, TEXT3));
    // Bar
    els.push(rect(gx2 + 12, gy2 + 84, 148, 4, BORD, { rx: 2 }));
    els.push(rect(gx2 + 12, gy2 + 84, 148 * g.pct / 100, 4, g.color, { rx: 2 }));
    els.push(text(gx2 + 160, gy2 + 73, `${g.pct}%`, 9, g.color, { anchor: 'end', fw: 600 }));
  });

  els.push(...navBar(3));
  return els;
}

// ── SCREEN 5: Insights ──────────────────────────────────────────────────────
function screenInsights() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  els.push(...statusBar());

  els.push(text(20, 80, 'Insights', 22, TEXT, { fw: 700 }));
  els.push(text(W - 20, 80, 'Apr', 13, TEXT3, { anchor: 'end' }));

  // Insight banner — Typography-as-hero, Ramp-inspired
  els.push(rect(16, 96, W - 32, 80, CARD, { rx: 16 }));
  els.push(text(28, 120, '✦ KEY INSIGHT', 9, ACC, { fw: 700, ls: 2 }));
  els.push(text(28, 146, 'Dining is 40% over budget', 17, TEXT, { fw: 700 }));
  els.push(text(28, 164, 'You spent $210 of your $150 limit', 11, TEXT3));

  // Spending donut chart (simplified)
  const cx = W / 2, cy = 330;
  els.push(text(cx, 204, 'Spending Breakdown', 14, TEXT, { fw: 600, anchor: 'middle' }));

  // Fake donut segments
  const segs = [
    { color: ACC,   w: 72 },
    { color: ACC2,  w: 52 },
    { color: GOLD,  w: 36 },
    { color: RED,   w: 44 },
    { color: BORD,  w: 42 },
  ];
  let angle = -90;
  segs.forEach(seg => {
    const deg = (seg.w / 246) * 360;
    const r1 = 65, r2 = 45;
    const startA = angle * Math.PI / 180;
    const endA = (angle + deg) * Math.PI / 180;
    const lx1 = cx + r1 * Math.cos(startA), ly1 = cy + r1 * Math.sin(startA);
    const lx2 = cx + r1 * Math.cos(endA),   ly2 = cy + r1 * Math.sin(endA);
    const sx1 = cx + r2 * Math.cos(endA),   sy1 = cy + r2 * Math.sin(endA);
    const sx2 = cx + r2 * Math.cos(startA), sy2 = cy + r2 * Math.sin(startA);
    const largeArc = deg > 180 ? 1 : 0;
    const d = `M ${lx1} ${ly1} A ${r1} ${r1} 0 ${largeArc} 1 ${lx2} ${ly2} L ${sx1} ${sy1} A ${r2} ${r2} 0 ${largeArc} 0 ${sx2} ${sy2} Z`;
    els.push({ type: 'path', d, fill: seg.color });
    angle += deg;
  });
  // Center label
  els.push(circle(cx, cy, 36, BG));
  els.push(text(cx, cy - 6, '$2,140', 14, TEXT, { anchor: 'middle', fw: 700 }));
  els.push(text(cx, cy + 10, 'total', 10, TEXT3, { anchor: 'middle' }));

  // Legend
  const legends = ['Housing', 'Groceries', 'Transport', 'Dining', 'Other'];
  const legColors = [ACC, ACC2, GOLD, RED, BORD];
  const legAmts = ['$1,200', '$320', '$145', '$210', '$265'];
  legends.forEach((l, i) => {
    const lx = i < 3 ? 20 + (i % 3) * 120 : 20 + ((i - 3) % 3) * 120 + 60;
    const ly = i < 3 ? 406 : 426;
    els.push(rect(lx, ly - 8, 10, 10, legColors[i], { rx: 2 }));
    els.push(text(lx + 14, ly, l, 10, TEXT3));
    els.push(text(lx + 14, ly + 14, legAmts[i], 10, legColors[i], { fw: 600 }));
  });

  // Trend card row
  const trendY = 460;
  els.push(text(20, trendY, 'Monthly Trend', 14, TEXT, { fw: 600 }));

  // Sparkline chart
  els.push(rect(16, trendY + 18, W - 32, 88, SURF, { rx: 14 }));
  const months = ['O', 'N', 'D', 'J', 'F', 'M', 'A'];
  const vals =   [2340, 2680, 3100, 1980, 2250, 2410, 2140];
  const maxV = 3200, minV = 1800;
  months.forEach((m, i) => {
    const bx = 32 + i * 48;
    const bh = ((vals[i] - minV) / (maxV - minV)) * 50;
    const by = trendY + 78 - bh;
    const isActive = i === 6;
    els.push(rect(bx, by, 28, bh, isActive ? ACC : CARD2, { rx: 4 }));
    els.push(text(bx + 14, trendY + 96, m, 9, TEXT3, { anchor: 'middle' }));
    if (isActive) els.push(text(bx + 14, by - 4, `$${vals[i]/1000}k`, 8, ACC, { anchor: 'middle', fw: 600 }));
  });

  // Bottom tip card
  els.push(rect(16, 560, W - 32, 56, CARD, { rx: 14 }));
  els.push(text(32, 580, '💡 Tip: Reduce dining by $60 to', 12, TEXT, { fw: 400 }));
  els.push(text(32, 598, '   stay on track this month.', 12, ACC, { fw: 500 }));

  els.push(...navBar(0));
  return els;
}

// ── SCREEN 6: Profile ───────────────────────────────────────────────────────
function screenProfile() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  els.push(...statusBar());

  // Header row
  els.push(text(20, 80, 'You', 22, TEXT, { fw: 700 }));

  // Profile card — editorial block
  els.push(rect(16, 96, W - 32, 110, ACC, { rx: 16 }));
  // Avatar
  els.push(circle(56, 151, 28, '#FFFFFF', { opacity: 0.15 }));
  els.push(circle(56, 151, 22, CARD2));
  els.push(text(56, 155, 'MJ', 14, ACC, { anchor: 'middle', fw: 700 }));
  els.push(text(96, 140, 'Maya Johnson', 16, '#FFFFFF', { fw: 600 }));
  els.push(text(96, 158, 'maya@grove.app', 12, '#FFFFFF', { opacity: 0.7 }));
  els.push(text(96, 178, '⚡ Mindful Spender · 14 months', 11, '#FFFFFF', { opacity: 0.6 }));
  // Edit
  els.push(rect(W - 60, 116, 44, 24, '#FFFFFF', { rx: 12, opacity: 0.2 }));
  els.push(text(W - 38, 133, 'Edit', 11, '#FFFFFF', { anchor: 'middle' }));

  // Stats row
  const statY = 220;
  const stats = [
    { val: '14', sub: 'Month streak' },
    { val: '94%', sub: 'On-budget rate' },
    { val: '$1,247', sub: 'Avg monthly save' },
  ];
  stats.forEach((s, i) => {
    const sx = 16 + i * 119;
    els.push(rect(sx, statY, 110, 64, SURF, { rx: 12 }));
    els.push(text(sx + 55, statY + 28, s.val, 18, ACC, { fw: 700, anchor: 'middle' }));
    els.push(text(sx + 55, statY + 46, s.sub, 9, TEXT3, { anchor: 'middle' }));
  });

  // Settings list
  const settingsY = 302;
  els.push(text(20, settingsY, 'Settings', 14, TEXT, { fw: 600 }));

  const settings = [
    { icon: '🔔', label: 'Notifications',   sub: 'Budget alerts, weekly digest' },
    { icon: '🔗', label: 'Linked Accounts', sub: '2 banks connected' },
    { icon: '◫',  label: 'Categories',      sub: 'Customize & create groups' },
    { icon: '☁',  label: 'Data & Privacy',  sub: 'Export, delete, permissions' },
    { icon: '⬡',  label: 'Appearance',      sub: 'Warm / classic / dark' },
    { icon: '◎',  label: 'Subscription',    sub: 'LOAM Plus · $4/mo' },
  ];

  settings.forEach((s, i) => {
    const sy = settingsY + 20 + i * 58;
    els.push(rect(16, sy, W - 32, 50, SURF, { rx: 12 }));
    els.push(circle(42, sy + 25, 14, CARD));
    els.push(text(42, sy + 29, s.icon, 12, TEXT, { anchor: 'middle' }));
    els.push(text(66, sy + 20, s.label, 13, TEXT, { fw: 500 }));
    els.push(text(66, sy + 36, s.sub,   10, TEXT3));
    els.push(text(W - 28, sy + 25, '›', 16, TEXT3, { anchor: 'end' }));
  });

  // Sign out
  els.push(rect(16, settingsY + 20 + settings.length * 58 + 8, W - 32, 44, SURF, { rx: 12 }));
  els.push(text(W / 2, settingsY + 20 + settings.length * 58 + 36, 'Sign out', 13, RED, { anchor: 'middle', fw: 500 }));

  els.push(...navBar(4));
  return els;
}

// ── Build pen ────────────────────────────────────────────────────────────────
const screens = [
  { name: 'Dashboard',    elements: screenDashboard()   },
  { name: 'Budget',       elements: screenBudget()      },
  { name: 'Transactions', elements: screenTransactions() },
  { name: 'Goals',        elements: screenGoals()       },
  { name: 'Insights',     elements: screenInsights()    },
  { name: 'Profile',      elements: screenProfile()     },
];

const totalElements = screens.reduce((a, s) => a + s.elements.length, 0);

screens.forEach(s => {
  s.svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
    s.elements.map(el => {
      if (el.type === 'rect')   return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${el.rx||0}" opacity="${el.opacity!==undefined?el.opacity:1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
      if (el.type === 'text')   return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${el.fontWeight||400}" font-family="${el.fontFamily||'Inter'}" text-anchor="${el.textAnchor||'start'}" letter-spacing="${el.letterSpacing||0}" opacity="${el.opacity!==undefined?el.opacity:1}">${el.content}</text>`;
      if (el.type === 'circle') return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity!==undefined?el.opacity:1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
      if (el.type === 'line')   return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}" opacity="${el.opacity!==undefined?el.opacity:1}"/>`;
      if (el.type === 'path')   return `<path d="${el.d}" fill="${el.fill}" opacity="${el.opacity!==undefined?el.opacity:1}"/>`;
      return '';
    }).join('') +
    '</svg>';
  delete s.elements;
});

const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    author: 'RAM',
    date: new Date().toISOString().slice(0, 10),
    theme: 'light',
    heartbeat: HEARTBEAT,
    elements: totalElements,
    tagline: TAGLINE,
    slug: SLUG,
    palette: { bg: BG, surface: SURF, accent: ACC, accent2: ACC2, text: TEXT },
  },
  screens,
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
