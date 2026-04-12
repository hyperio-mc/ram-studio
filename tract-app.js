'use strict';
// TRACT — Editorial Personal Finance
// Heartbeat design: Light theme, editorial print aesthetic
// Inspired by minimal.gallery's typography-first designs and
// Lapa Ninja's warm cream + display serif editorial palettes
// Slug: tract

const fs = require('fs');
const path = require('path');

const SLUG = 'tract';
const W = 390, H = 844;

// Warm cream editorial palette (LIGHT theme)
const BG     = '#FAF7F2';   // warm parchment
const SURF   = '#FFFFFF';   // pure white cards
const CARD   = '#F4F0E8';   // warm ivory
const INK    = '#1A1714';   // deep warm black
const INK2   = '#4A4540';   // mid ink
const MUTED  = '#9A9390';   // warm gray
const RULE   = '#DDD9D0';   // hairline rule color
const ACC    = '#C45E3A';   // terracotta / burnt sienna
const ACC2   = '#4A7C6B';   // muted sage green
const GOLD   = '#B8943F';   // aged gold accent

// ─── Element builders ───────────────────────────────────────────────────────

function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, width: w, height: h, fill,
    rx: opts.rx || 0,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
    stroke: opts.stroke || 'none',
    strokeWidth: opts.sw || 0,
  };
}

function text(x, y, content, size, fill, opts = {}) {
  return {
    type: 'text', x, y, content: String(content), fontSize: size, fill,
    fontWeight: opts.fw || 400,
    fontFamily: opts.font || 'Georgia, serif',
    textAnchor: opts.anchor || 'start',
    letterSpacing: opts.ls || 0,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
  };
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  return {
    type: 'line', x1, y1, x2, y2, stroke,
    strokeWidth: opts.sw || 0.5,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
  };
}

function circle(cx, cy, r, fill, opts = {}) {
  return {
    type: 'circle', cx, cy, r, fill,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
    stroke: opts.stroke || 'none',
    strokeWidth: opts.sw || 0,
  };
}

// ─── Shared components ──────────────────────────────────────────────────────

function makeStatusBar(els) {
  els.push(rect(0, 0, W, 44, BG));
  els.push(text(20, 28, '9:41', 13, INK, { fw: 500, font: 'system-ui, sans-serif', ls: 0.2 }));
  // Battery icon (3 rects)
  els.push(rect(W - 36, 16, 22, 11, 'none', { stroke: INK, sw: 1, rx: 2, opacity: 0.5 }));
  els.push(rect(W - 14, 19, 3, 5, INK, { opacity: 0.4 }));
  els.push(rect(W - 34, 18, 16, 7, INK, { opacity: 0.5, rx: 1 }));
  // Signal bars
  els.push(rect(W - 52, 23, 3, 5, INK, { opacity: 0.5 }));
  els.push(rect(W - 56, 21, 3, 7, INK, { opacity: 0.4 }));
  els.push(rect(W - 60, 19, 3, 9, INK, { opacity: 0.3 }));
  // Wi-fi arc indicator
  els.push(text(W - 72, 28, '⌘', 10, INK, { font: 'system-ui, sans-serif', opacity: 0.3, anchor: 'end' }));
}

function makeNavBar(els, activeIdx) {
  const tabs = ['Overview', 'Spending', 'Transactions', 'Savings'];
  const icons = ['◉', '◈', '≡', '◎'];
  const tabW = W / tabs.length;
  els.push(rect(0, H - 80, W, 80, SURF));
  els.push(line(0, H - 80, W, H - 80, RULE, { sw: 0.5 }));
  tabs.forEach((label, i) => {
    const cx = tabW * i + tabW / 2;
    const isActive = i === activeIdx;
    els.push(text(cx, H - 50, icons[i], 18, isActive ? ACC : MUTED, {
      anchor: 'middle', font: 'system-ui, sans-serif',
    }));
    els.push(text(cx, H - 26, label, 9, isActive ? INK : MUTED, {
      anchor: 'middle', fw: isActive ? 600 : 400, font: 'system-ui, sans-serif', ls: 0.5,
    }));
    if (isActive) {
      // Active indicator — thin terracotta rule at top of tab bar
      els.push(rect(cx - 16, H - 80, 32, 2, ACC));
    }
  });
}

// ─── Screen 1: Overview / Dashboard ─────────────────────────────────────────

function screen1() {
  const els = [];
  makeStatusBar(els);

  // Publication header — masthead style
  els.push(line(20, 52, W - 20, 52, INK, { sw: 1.5 }));
  els.push(text(W / 2, 68, 'TRACT', 11, INK, {
    anchor: 'middle', fw: 600, font: 'system-ui, sans-serif', ls: 4,
  }));
  els.push(text(W / 2, 82, 'Personal Finance', 9, MUTED, {
    anchor: 'middle', font: 'system-ui, sans-serif', ls: 2,
  }));
  els.push(line(20, 88, W - 20, 88, INK, { sw: 1.5 }));

  // Month/date kicker
  els.push(text(20, 108, 'April 2026', 10, MUTED, { font: 'system-ui, sans-serif', ls: 1.5, fw: 500 }));
  els.push(text(W - 20, 108, 'Issue 04', 10, MUTED, { anchor: 'end', font: 'system-ui, sans-serif', ls: 0.5 }));

  // Huge editorial balance — the number as hero typography
  els.push(text(20, 148, '$', 28, ACC, { fw: 300, font: 'Georgia, serif' }));
  els.push(text(52, 195, '24', 88, INK, { fw: 300, font: 'Georgia, serif', ls: -3 }));
  els.push(text(178, 195, ',', 88, INK2, { fw: 300, font: 'Georgia, serif', ls: -3, opacity: 0.4 }));
  els.push(text(198, 195, '847', 88, INK, { fw: 300, font: 'Georgia, serif', ls: -3 }));
  els.push(text(20, 215, '.32', 36, INK2, { fw: 300, font: 'Georgia, serif', opacity: 0.5 }));
  els.push(text(20, 232, 'Net Worth', 10, MUTED, { font: 'system-ui, sans-serif', ls: 2, fw: 500 }));

  // Hairline rule
  els.push(line(20, 248, W - 20, 248, RULE, { sw: 0.5 }));

  // Key metrics row — editorial caption style
  const metrics = [
    { label: 'INCOME', value: '$5,840', change: '+4.2%', up: true },
    { label: 'SPENT', value: '$2,193', change: '-8.1%', up: false },
    { label: 'SAVED', value: '$3,647', change: '+12.4%', up: true },
  ];
  const mW = (W - 40) / 3;
  metrics.forEach((m, i) => {
    const x = 20 + i * mW;
    if (i > 0) els.push(line(x, 256, x, 318, RULE, { sw: 0.5 }));
    els.push(text(x + mW / 2, 266, m.label, 8, MUTED, { anchor: 'middle', font: 'system-ui, sans-serif', ls: 1.5, fw: 600 }));
    els.push(text(x + mW / 2, 290, m.value, 16, INK, { anchor: 'middle', fw: 600, font: 'Georgia, serif' }));
    els.push(text(x + mW / 2, 308, m.change, 9, m.up ? ACC2 : ACC, { anchor: 'middle', font: 'system-ui, sans-serif', fw: 500 }));
  });
  els.push(line(20, 328, W - 20, 328, RULE, { sw: 0.5 }));

  // Spending pulse — editorial section header
  els.push(text(20, 352, 'Spending Pulse', 13, INK, { fw: 600, font: 'Georgia, serif' }));
  els.push(text(W - 20, 352, 'This month →', 10, ACC, { anchor: 'end', font: 'system-ui, sans-serif', ls: 0.3 }));
  els.push(line(20, 360, W - 20, 360, RULE, { sw: 0.5 }));

  // Category rows — newspaper column style
  const cats = [
    { name: 'Housing', amount: '$1,200', pct: 54, note: 'Fixed' },
    { name: 'Food & Dining', amount: '$342', pct: 16, note: '↑ +12%' },
    { name: 'Transport', amount: '$184', pct: 8, note: 'On track' },
    { name: 'Entertainment', amount: '$267', pct: 12, note: '↑ +34%' },
  ];
  cats.forEach((c, i) => {
    const y = 380 + i * 52;
    els.push(text(20, y + 14, c.name, 12, INK, { fw: 500, font: 'Georgia, serif' }));
    els.push(text(W - 20, y + 14, c.amount, 14, INK, { anchor: 'end', fw: 600, font: 'Georgia, serif' }));
    els.push(text(20, y + 28, c.note, 9, i === 1 || i === 3 ? ACC : MUTED, { font: 'system-ui, sans-serif', ls: 0.3 }));
    // Thin progress bar
    els.push(rect(20, y + 36, W - 40, 2, RULE));
    els.push(rect(20, y + 36, (W - 40) * (c.pct / 100), 2, i === 1 || i === 3 ? ACC : ACC2));
    if (i < cats.length - 1) els.push(line(20, y + 44, W - 20, y + 44, RULE, { sw: 0.3, opacity: 0.5 }));
  });

  // Upcoming bills section
  els.push(line(20, 600, W - 20, 600, RULE, { sw: 0.5 }));
  els.push(text(20, 622, 'Upcoming', 13, INK, { fw: 600, font: 'Georgia, serif' }));
  els.push(text(W - 20, 622, 'Due this week', 10, MUTED, { anchor: 'end', font: 'system-ui, sans-serif', ls: 0.3 }));
  els.push(line(20, 630, W - 20, 630, RULE, { sw: 0.5 }));
  const bills = [
    { name: 'Rent — 4th floor', due: 'Apr 12', amt: '$2,100' },
    { name: 'Netflix', due: 'Apr 14', amt: '$15.99' },
    { name: 'Spotify Duo', due: 'Apr 15', amt: '$16.99' },
  ];
  bills.forEach((b, i) => {
    const y = 644 + i * 40;
    els.push(text(20, y + 14, b.name, 11, INK, { fw: 400, font: 'Georgia, serif' }));
    els.push(text(W - 20, y + 14, b.amt, 12, INK, { anchor: 'end', fw: 600, font: 'Georgia, serif' }));
    els.push(text(20, y + 28, b.due, 9, MUTED, { font: 'system-ui, sans-serif', ls: 0.3 }));
    if (i < bills.length - 1) els.push(line(20, y + 36, W - 20, y + 36, RULE, { sw: 0.3, opacity: 0.4 }));
  });

  makeNavBar(els, 0);
  return els;
}

// ─── Screen 2: Spending Analysis ────────────────────────────────────────────

function screen2() {
  const els = [];
  makeStatusBar(els);

  // Header
  els.push(line(20, 52, W - 20, 52, INK, { sw: 1.5 }));
  els.push(text(W / 2, 68, 'SPENDING', 11, INK, { anchor: 'middle', fw: 600, font: 'system-ui, sans-serif', ls: 4 }));
  els.push(line(20, 76, W - 20, 76, INK, { sw: 1.5 }));

  // Month selector — editorial tab style
  const months = ['Feb', 'Mar', 'Apr'];
  months.forEach((m, i) => {
    const x = 20 + i * 60;
    const isActive = i === 2;
    if (isActive) {
      els.push(rect(x, 84, 52, 22, INK));
      els.push(text(x + 26, 99, m, 10, BG, { anchor: 'middle', fw: 600, font: 'system-ui, sans-serif', ls: 1 }));
    } else {
      els.push(text(x + 26, 99, m, 10, MUTED, { anchor: 'middle', font: 'system-ui, sans-serif', ls: 1 }));
    }
  });

  // Total spent — large display
  els.push(line(20, 118, W - 20, 118, RULE, { sw: 0.5 }));
  els.push(text(20, 140, 'Total Spent', 10, MUTED, { font: 'system-ui, sans-serif', ls: 1.5, fw: 500 }));
  els.push(text(20, 192, '$2,193', 64, INK, { fw: 300, font: 'Georgia, serif', ls: -2 }));
  els.push(text(20, 212, 'of $3,000 budget — 73% used', 10, MUTED, { font: 'system-ui, sans-serif', ls: 0.3 }));

  // Budget progress bar
  els.push(rect(20, 222, W - 40, 4, RULE, { rx: 2 }));
  els.push(rect(20, 222, (W - 40) * 0.73, 4, ACC, { rx: 2 }));
  els.push(text(20 + (W - 40) * 0.73, 218, '▲', 8, ACC, { anchor: 'middle' }));

  els.push(line(20, 240, W - 20, 240, RULE, { sw: 0.5 }));

  // Category breakdown — editorial column layout
  els.push(text(20, 260, 'By Category', 13, INK, { fw: 600, font: 'Georgia, serif' }));
  els.push(text(W - 20, 260, '← Apr 2026 →', 9, MUTED, { anchor: 'end', font: 'system-ui, sans-serif' }));
  els.push(line(20, 268, W - 20, 268, RULE, { sw: 0.5 }));

  const breakdown = [
    { cat: 'Housing', pct: 55, amt: '$1,200', icon: '⌂', over: false },
    { cat: 'Food', pct: 16, amt: '$342', icon: '◈', over: false },
    { cat: 'Entertainment', pct: 12, amt: '$267', icon: '◉', over: true },
    { cat: 'Transport', pct: 8, amt: '$184', icon: '→', over: false },
    { cat: 'Health', pct: 5, amt: '$110', icon: '+', over: false },
    { cat: 'Other', pct: 4, amt: '$90', icon: '·', over: false },
  ];

  breakdown.forEach((b, i) => {
    const y = 282 + i * 48;
    // Left: icon + category
    els.push(text(20, y + 16, b.icon, 14, b.over ? ACC : INK2, { font: 'system-ui, sans-serif' }));
    els.push(text(44, y + 16, b.cat, 12, INK, { fw: 500, font: 'Georgia, serif' }));
    els.push(text(44, y + 30, `${b.pct}% of spending`, 9, MUTED, { font: 'system-ui, sans-serif' }));
    if (b.over) els.push(text(44 + 80, y + 30, 'Over budget', 9, ACC, { font: 'system-ui, sans-serif' }));
    // Right: amount
    els.push(text(W - 20, y + 16, b.amt, 14, INK, { anchor: 'end', fw: 600, font: 'Georgia, serif' }));
    // Bar
    els.push(rect(44, y + 36, W - 64, 2, RULE));
    els.push(rect(44, y + 36, (W - 64) * (b.pct / 55), 2, b.over ? ACC : CARD));
    els.push(line(20, y + 44, W - 20, y + 44, RULE, { sw: 0.3, opacity: 0.5 }));
  });

  // Monthly comparison mini chart — editorial bar chart
  els.push(line(20, 596, W - 20, 596, RULE, { sw: 0.5 }));
  els.push(text(20, 616, 'Month over Month', 11, INK, { fw: 600, font: 'Georgia, serif' }));
  els.push(line(20, 624, W - 20, 624, RULE, { sw: 0.3, opacity: 0.5 }));
  const months6 = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const vals6 = [1800, 2800, 2200, 2380, 1892, 2193];
  const maxVal = Math.max(...vals6);
  const barW = (W - 60) / 6;
  months6.forEach((m, i) => {
    const x = 30 + i * barW;
    const barH = (vals6[i] / maxVal) * 80;
    const isLast = i === 5;
    els.push(rect(x, 718 - barH, barW - 6, barH, isLast ? INK : RULE, { rx: 1 }));
    els.push(text(x + (barW - 6) / 2, 732, m, 8, MUTED, { anchor: 'middle', font: 'system-ui, sans-serif' }));
    if (isLast) {
      els.push(text(x + (barW - 6) / 2, 715 - barH, `$${(vals6[i] / 1000).toFixed(1)}k`, 8, INK, { anchor: 'middle', font: 'system-ui, sans-serif', fw: 600 }));
    }
  });

  makeNavBar(els, 1);
  return els;
}

// ─── Screen 3: Transaction List ──────────────────────────────────────────────

function screen3() {
  const els = [];
  makeStatusBar(els);

  // Header
  els.push(line(20, 52, W - 20, 52, INK, { sw: 1.5 }));
  els.push(text(W / 2, 68, 'TRANSACTIONS', 11, INK, { anchor: 'middle', fw: 600, font: 'system-ui, sans-serif', ls: 4 }));
  els.push(line(20, 76, W - 20, 76, INK, { sw: 1.5 }));

  // Search bar — minimal editorial style
  els.push(rect(20, 86, W - 40, 32, CARD, { rx: 2 }));
  els.push(line(28, 102, 36, 102, RULE, { sw: 1 }));
  els.push(text(44, 107, 'Search transactions…', 11, MUTED, { font: 'system-ui, sans-serif' }));
  els.push(text(W - 28, 107, '⚑', 12, MUTED, { anchor: 'end', font: 'system-ui, sans-serif' }));

  // Date group header
  const txDays = [
    {
      date: 'Today, April 9',
      txs: [
        { name: 'Morning Ritual Coffee', cat: 'Dining', amt: '-$6.80', col: INK },
        { name: 'Substack Quarterly', cat: 'Subscriptions', amt: '-$30.00', col: INK },
        { name: 'Salary Deposit', cat: 'Income', amt: '+$2,920.00', col: ACC2 },
      ]
    },
    {
      date: 'Yesterday, April 8',
      txs: [
        { name: 'Whole Foods Market', cat: 'Groceries', amt: '-$67.43', col: INK },
        { name: 'Caltrain Monthly', cat: 'Transport', amt: '-$120.00', col: INK },
        { name: 'SFMOMA Membership', cat: 'Culture', amt: '-$85.00', col: ACC },
      ]
    },
    {
      date: 'April 7',
      txs: [
        { name: 'Freelance Invoice #12', cat: 'Income', amt: '+$800.00', col: ACC2 },
        { name: 'Nopa Restaurant', cat: 'Dining', amt: '-$94.20', col: ACC },
      ]
    },
  ];

  let y = 128;
  txDays.forEach((day) => {
    // Date header — editorial section rule
    els.push(line(20, y, W - 20, y, RULE, { sw: 0.5 }));
    els.push(text(20, y + 14, day.date.toUpperCase(), 8, MUTED, { font: 'system-ui, sans-serif', ls: 1.5, fw: 600 }));
    y += 22;

    day.txs.forEach((tx) => {
      els.push(text(20, y + 14, tx.name, 12, INK, { fw: 500, font: 'Georgia, serif' }));
      els.push(text(W - 20, y + 14, tx.amt, 13, tx.col, { anchor: 'end', fw: 600, font: 'Georgia, serif' }));
      els.push(text(20, y + 28, tx.cat, 9, MUTED, { font: 'system-ui, sans-serif', ls: 0.3 }));
      els.push(line(20, y + 38, W - 20, y + 38, RULE, { sw: 0.3, opacity: 0.4 }));
      y += 44;
    });
    y += 6;
  });

  makeNavBar(els, 2);
  return els;
}

// ─── Screen 4: Savings / Goals ───────────────────────────────────────────────

function screen4() {
  const els = [];
  makeStatusBar(els);

  // Header
  els.push(line(20, 52, W - 20, 52, INK, { sw: 1.5 }));
  els.push(text(W / 2, 68, 'SAVINGS', 11, INK, { anchor: 'middle', fw: 600, font: 'system-ui, sans-serif', ls: 4 }));
  els.push(line(20, 76, W - 20, 76, INK, { sw: 1.5 }));

  // Total savings display
  els.push(text(20, 100, 'Total in Goals', 10, MUTED, { font: 'system-ui, sans-serif', ls: 1.5, fw: 500 }));
  els.push(text(20, 152, '$18,340', 64, INK, { fw: 300, font: 'Georgia, serif', ls: -2 }));
  els.push(text(20, 170, 'across 4 active goals', 10, MUTED, { font: 'system-ui, sans-serif', ls: 0.3 }));

  // Annual savings rate callout
  els.push(rect(20, 182, W - 40, 44, CARD, { rx: 2 }));
  els.push(text(34, 200, 'Savings Rate', 9, MUTED, { font: 'system-ui, sans-serif', ls: 1, fw: 500 }));
  els.push(text(34, 218, '28.4%', 18, INK, { fw: 600, font: 'Georgia, serif' }));
  els.push(text(W - 34, 200, 'Recommended', 9, MUTED, { anchor: 'end', font: 'system-ui, sans-serif', ls: 0.5 }));
  els.push(text(W - 34, 218, '20% min', 11, ACC2, { anchor: 'end', font: 'system-ui, sans-serif', fw: 500 }));
  els.push(circle(W - 34 - 48, 208, 4, ACC2));

  els.push(line(20, 238, W - 20, 238, RULE, { sw: 0.5 }));
  els.push(text(20, 258, 'Your Goals', 13, INK, { fw: 600, font: 'Georgia, serif' }));
  els.push(text(W - 20, 258, '+ New Goal', 10, ACC, { anchor: 'end', font: 'system-ui, sans-serif', ls: 0.3 }));
  els.push(line(20, 266, W - 20, 266, RULE, { sw: 0.5 }));

  // Goal cards — editorial style with ruled borders
  const goals = [
    { name: 'Emergency Fund', target: '$15,000', saved: '$10,250', pct: 68, months: '4 months left', tag: 'Priority' },
    { name: 'Japan Trip 2026', target: '$5,000', saved: '$3,890', pct: 78, months: 'June 2026', tag: 'On track' },
    { name: 'MacBook Pro', target: '$3,200', saved: '$2,400', pct: 75, months: 'On track', tag: null },
    { name: 'Investment Seed', target: '$20,000', saved: '$1,800', pct: 9, months: '18 months', tag: 'Long term' },
  ];

  goals.forEach((g, i) => {
    const y = 280 + i * 88;
    // Card outline — thin rule border
    els.push(rect(20, y, W - 40, 80, SURF, { rx: 2, stroke: RULE, sw: 0.5 }));
    // Name + tag
    els.push(text(32, y + 20, g.name, 13, INK, { fw: 600, font: 'Georgia, serif' }));
    if (g.tag) {
      els.push(rect(W - 80, y + 8, 56, 18, g.tag === 'Priority' ? ACC : CARD, { rx: 2 }));
      els.push(text(W - 52, y + 21, g.tag, 8, g.tag === 'Priority' ? SURF : MUTED, { anchor: 'middle', font: 'system-ui, sans-serif', ls: 0.5, fw: 600 }));
    }
    // Saved / target
    els.push(text(32, y + 36, g.saved, 16, INK, { fw: 600, font: 'Georgia, serif' }));
    els.push(text(32 + 72, y + 36, `of ${g.target}`, 11, MUTED, { font: 'system-ui, sans-serif' }));
    // Progress bar
    els.push(rect(32, y + 50, W - 64, 3, RULE, { rx: 1 }));
    const barColor = g.pct >= 70 ? ACC2 : g.pct >= 40 ? GOLD : ACC;
    els.push(rect(32, y + 50, (W - 64) * (g.pct / 100), 3, barColor, { rx: 1 }));
    // Percentage + timeline
    els.push(text(32, y + 68, `${g.pct}% complete`, 9, MUTED, { font: 'system-ui, sans-serif' }));
    els.push(text(W - 32, y + 68, g.months, 9, MUTED, { anchor: 'end', font: 'system-ui, sans-serif' }));
  });

  makeNavBar(els, 3);
  return els;
}

// ─── Screen 5: Monthly Review ────────────────────────────────────────────────

function screen5() {
  const els = [];
  makeStatusBar(els);

  // Full-bleed editorial section feel
  els.push(rect(0, 44, W, 160, INK));

  // Inverted masthead
  els.push(line(20, 60, W - 20, 60, SURF, { sw: 1.5, opacity: 0.15 }));
  els.push(text(W / 2, 80, 'MONTHLY REVIEW', 10, BG, { anchor: 'middle', fw: 600, font: 'system-ui, sans-serif', ls: 4, opacity: 0.7 }));
  els.push(text(W / 2, 96, 'March 2026', 28, BG, { anchor: 'middle', fw: 300, font: 'Georgia, serif', ls: -1 }));
  els.push(line(20, 108, W - 20, 108, SURF, { sw: 0.5, opacity: 0.15 }));

  // Key headline stat
  els.push(text(W / 2, 136, 'You saved 31% more', 15, BG, { anchor: 'middle', fw: 400, font: 'Georgia, serif' }));
  els.push(text(W / 2, 156, 'than February', 15, BG, { anchor: 'middle', fw: 400, font: 'Georgia, serif', opacity: 0.6 }));
  els.push(text(W / 2, 176, '↑ Best month this year', 10, ACC, { anchor: 'middle', font: 'system-ui, sans-serif', ls: 0.5 }));

  // Three-column summary stats
  const stats = [
    { label: 'EARNED', val: '$5,840', delta: '+4.2%' },
    { label: 'SPENT', val: '$1,892', delta: '-22.4%' },
    { label: 'SAVED', val: '$3,948', delta: '+31.0%' },
  ];
  const sW = (W - 40) / 3;
  stats.forEach((s, i) => {
    const x = 20 + i * sW;
    if (i > 0) els.push(line(x, 220, x, 280, RULE, { sw: 0.5 }));
    els.push(text(x + sW / 2, 232, s.label, 8, MUTED, { anchor: 'middle', font: 'system-ui, sans-serif', ls: 1.5, fw: 600 }));
    els.push(text(x + sW / 2, 256, s.val, 16, INK, { anchor: 'middle', fw: 600, font: 'Georgia, serif' }));
    els.push(text(x + sW / 2, 272, s.delta, 9, s.label === 'SPENT' ? ACC2 : s.label === 'EARNED' ? INK2 : ACC2, { anchor: 'middle', font: 'system-ui, sans-serif', fw: 500 }));
  });
  els.push(line(20, 288, W - 20, 288, RULE, { sw: 0.5 }));

  // Narrative insights — editorial column copy style
  els.push(text(20, 312, 'Insights', 16, INK, { fw: 600, font: 'Georgia, serif' }));
  els.push(line(20, 320, 60, 320, ACC, { sw: 1.5 })); // accent underline

  const insights = [
    { n: '01', head: 'Dining under control', body: 'Food spending dropped $94 from February, your lowest in 6 months.' },
    { n: '02', head: 'Subscriptions creeping', body: 'You added 2 new subscriptions totalling $45/month. Review quarterly.' },
    { n: '03', head: 'Emergency fund milestone', body: 'At 68% complete. At current pace, funded by August 2026.' },
  ];

  insights.forEach((ins, i) => {
    const y = 336 + i * 104;
    els.push(line(20, y, W - 20, y, RULE, { sw: 0.3, opacity: 0.5 }));
    // Number in terracotta
    els.push(text(20, y + 22, ins.n, 11, ACC, { fw: 600, font: 'Georgia, serif', ls: 1 }));
    els.push(text(44, y + 22, ins.head, 13, INK, { fw: 600, font: 'Georgia, serif' }));
    // Inline body copy — editorial paragraph style
    const words = ins.body.split(' ');
    const line1 = words.slice(0, 7).join(' ');
    const line2 = words.slice(7).join(' ');
    els.push(text(44, y + 40, line1, 11, INK2, { font: 'Georgia, serif' }));
    if (line2) els.push(text(44, y + 56, line2, 11, INK2, { font: 'Georgia, serif' }));
  });

  // Spending heatmap dots — week grid decoration
  els.push(line(20, 648, W - 20, 648, RULE, { sw: 0.5 }));
  els.push(text(20, 668, 'Daily Activity — March', 11, INK, { fw: 600, font: 'Georgia, serif' }));
  els.push(line(20, 676, W - 20, 676, RULE, { sw: 0.3, opacity: 0.5 }));
  // 5 weeks × 7 days grid
  const dotData = [0.2,0.5,0.8,0.3,0.1,0,0, 0.6,0.9,0.4,0.7,0.2,0,0, 0.3,0.5,0.6,0.8,0.9,0,0, 0.4,0.7,0.3,0.5,0.6,0,0, 0.2,0.4,0.1,0,0,0,0];
  const dotW = (W - 40) / 7;
  for (let w = 0; w < 5; w++) {
    for (let d = 0; d < 7; d++) {
      const val = dotData[w * 7 + d] || 0;
      const cx = 20 + d * dotW + dotW / 2;
      const cy = 696 + w * 14;
      const clr = val > 0.7 ? ACC : val > 0.4 ? GOLD : val > 0.1 ? RULE : CARD;
      els.push(circle(cx, cy, 4, clr, { opacity: val > 0.1 ? 0.9 : 0.3 }));
    }
  }
  // Day labels
  ['S','M','T','W','T','F','S'].forEach((d, i) => {
    els.push(text(20 + i * dotW + dotW / 2, 688, d, 7, MUTED, { anchor: 'middle', font: 'system-ui, sans-serif' }));
  });

  makeNavBar(els, 0);
  return els;
}

// ─── Screen 6: Add Transaction (modal) ──────────────────────────────────────

function screen6() {
  const els = [];
  makeStatusBar(els);

  // Slightly dimmed background suggest modal context
  els.push(rect(0, 0, W, H, CARD, { opacity: 0.4 }));
  els.push(rect(0, 120, W, H - 120, SURF));

  // Drag handle
  els.push(rect(W / 2 - 20, 132, 40, 3, RULE, { rx: 1.5 }));

  // Sheet header
  els.push(text(W / 2, 160, 'New Entry', 16, INK, { anchor: 'middle', fw: 600, font: 'Georgia, serif' }));
  els.push(line(20, 172, W - 20, 172, RULE, { sw: 0.5 }));

  // Amount input — huge editorial number entry
  els.push(text(W / 2, 230, '$', 28, MUTED, { anchor: 'middle', font: 'Georgia, serif', fw: 300 }));
  els.push(text(W / 2 + 10, 278, '0.00', 72, INK, { anchor: 'middle', fw: 300, font: 'Georgia, serif', ls: -2, opacity: 0.3 }));
  // Cursor blink indicator
  els.push(rect(W / 2 + 52, 222, 2, 52, ACC, { opacity: 0.8 }));
  els.push(line(60, 296, W - 60, 296, RULE, { sw: 0.5 }));

  // Type selector — editorial pill tabs
  els.push(text(W / 2, 322, 'Transaction Type', 9, MUTED, { anchor: 'middle', font: 'system-ui, sans-serif', ls: 1.5, fw: 500 }));
  const types = ['Expense', 'Income', 'Transfer'];
  const typeW = (W - 40) / 3;
  types.forEach((t, i) => {
    const tx = 20 + i * typeW;
    const isActive = i === 0;
    if (isActive) {
      els.push(rect(tx + 4, 330, typeW - 8, 26, INK, { rx: 2 }));
      els.push(text(tx + typeW / 2, 347, t, 10, BG, { anchor: 'middle', fw: 600, font: 'system-ui, sans-serif', ls: 0.5 }));
    } else {
      els.push(text(tx + typeW / 2, 347, t, 10, MUTED, { anchor: 'middle', font: 'system-ui, sans-serif' }));
    }
  });

  els.push(line(20, 368, W - 20, 368, RULE, { sw: 0.5 }));

  // Form fields — editorial input style (bottom border only)
  const fields = [
    { label: 'Description', placeholder: 'What was this for?' },
    { label: 'Category', placeholder: 'Select category' },
    { label: 'Date', placeholder: 'April 9, 2026' },
    { label: 'Account', placeholder: 'Chase Checking' },
  ];
  fields.forEach((f, i) => {
    const y = 388 + i * 60;
    els.push(text(20, y + 12, f.label, 9, MUTED, { font: 'system-ui, sans-serif', ls: 1.5, fw: 600 }));
    els.push(text(20, y + 32, f.placeholder, 13, MUTED, { font: 'Georgia, serif', opacity: 0.6 }));
    els.push(line(20, y + 44, W - 20, y + 44, RULE, { sw: 0.5 }));
  });

  // Numeric keypad — editorial minimal style
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', '⌫'],
  ];
  const kW = (W - 40) / 3;
  const kH = 44;
  const kStartY = 628;
  keys.forEach((row, ri) => {
    row.forEach((k, ci) => {
      const kx = 20 + ci * kW;
      const ky = kStartY + ri * (kH + 2);
      const isDelete = k === '⌫';
      els.push(rect(kx + 2, ky, kW - 4, kH, isDelete ? CARD : SURF, { rx: 2 }));
      els.push(text(kx + kW / 2, ky + 28, k, isDelete ? 16 : 20, isDelete ? ACC : INK, {
        anchor: 'middle', fw: isDelete ? 400 : 300, font: 'Georgia, serif',
      }));
    });
  });

  // CTA button — minimal editorial
  els.push(rect(20, H - 92, W - 40, 42, INK, { rx: 2 }));
  els.push(text(W / 2, H - 65, 'Record Transaction', 13, BG, { anchor: 'middle', fw: 600, font: 'system-ui, sans-serif', ls: 0.5 }));

  makeNavBar(els, 2);
  return els;
}

// ─── Assemble pen ────────────────────────────────────────────────────────────
// Add decorative crop marks to screen 5 monthly review for editorial print feel
const origScreen5 = screen5;
const screen5WithMarks = () => {
  const els = origScreen5();
  // Decorative corner crop marks — editorial print aesthetic
  [48, 204, 328, 650, 762].forEach((y, i) => {
    els.push(line(8, y, 16, y, INK, { sw: 0.4, opacity: 0.12 }));
    els.push(line(12, y - 4, 12, y + 4, INK, { sw: 0.4, opacity: 0.12 }));
    els.push(line(W - 8, y, W - 16, y, INK, { sw: 0.4, opacity: 0.12 }));
    els.push(line(W - 12, y - 4, W - 12, y + 4, INK, { sw: 0.4, opacity: 0.12 }));
  });
  return els;
};

const screens = [
  { name: 'Overview', fn: screen1 },
  { name: 'Spending', fn: screen2 },
  { name: 'Transactions', fn: screen3 },
  { name: 'Savings', fn: screen4 },
  { name: 'Monthly Review', fn: screen5WithMarks },
  { name: 'Add Entry', fn: screen6 },
];

const penScreens = screens.map(s => {
  const elements = s.fn();
  const svgParts = elements.map(el => {
    if (el.type === 'rect') {
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${el.rx || 0}" opacity="${el.opacity !== undefined ? el.opacity : 1}" stroke="${el.stroke || 'none'}" stroke-width="${el.strokeWidth || 0}"/>`;
    }
    if (el.type === 'text') {
      const anchor = el.textAnchor || 'start';
      const ls = el.letterSpacing || 0;
      return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${el.fontWeight || 400}" font-family="${el.fontFamily || 'Georgia, serif'}" text-anchor="${anchor}" letter-spacing="${ls}" opacity="${el.opacity !== undefined ? el.opacity : 1}">${el.content}</text>`;
    }
    if (el.type === 'line') {
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth || 0.5}" opacity="${el.opacity !== undefined ? el.opacity : 1}"/>`;
    }
    if (el.type === 'circle') {
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity !== undefined ? el.opacity : 1}" stroke="${el.stroke || 'none'}" stroke-width="${el.strokeWidth || 0}"/>`;
    }
    return '';
  }).join('\n    ');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n  <rect width="${W}" height="${H}" fill="${BG}"/>\n    ${svgParts}\n</svg>`;

  return { name: s.name, svg, elements };
});

const totalElements = penScreens.reduce((sum, s) => sum + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'TRACT — Editorial Finance',
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'light',
    heartbeat: 'tract',
    palette: { bg: BG, surface: SURF, accent: ACC, accent2: ACC2, ink: INK },
    inspiration: 'minimal.gallery editorial typography + Lapa Ninja warm cream palettes',
    elements: totalElements,
    screens: penScreens.length,
  },
  screens: penScreens,
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`TRACT: ${penScreens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
