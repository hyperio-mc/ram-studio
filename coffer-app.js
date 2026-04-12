'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG = 'coffer';
const W = 390, H = 844;

// ─── Palette (light / warm off-white — NoGood + Old Tom Capital inspired) ───
const C = {
  bg:          '#F9F7F2',   // warm off-white (NoGood rgba(251,250,243))
  surface:     '#FFFFFF',
  card:        '#EDE8DE',   // warm card bg
  cardDark:    '#E2DBCE',   // slightly darker card
  text:        '#1C1C1A',   // deep charcoal
  textMid:     '#5A554E',   // mid-tone
  textMuted:   '#9A948C',   // muted
  accent:      '#1A5C40',   // forest green (money/wealth)
  accentLight: '#EAF4EE',   // light green bg
  lime:        '#C8E83A',   // lime-yellow highlight (NoGood d8ff7c toned)
  limeDark:    '#9AB820',   // darker lime for text on lime bg
  red:         '#C0392B',   // negative/expense
  redLight:    '#FCEAE8',   // light red bg
  border:      '#E0DAD0',   // subtle border
  borderDark:  '#C8C2B8',   // stronger border
  white:       '#FFFFFF',
  black:       '#000000',
};

let elems = [];

function rect(x, y, w, h, fill, opts = {}) {
  const el = { type: 'rect', x, y, width: w, height: h, fill };
  if (opts.rx        != null) el.rx      = opts.rx;
  if (opts.opacity   != null) el.opacity = opts.opacity;
  if (opts.stroke    != null) el.stroke  = opts.stroke;
  if (opts.sw        != null) el.strokeWidth = opts.sw;
  elems.push(el);
}

function text(x, y, content, size, fill, opts = {}) {
  const el = { type: 'text', x, y, content: String(content), fontSize: size, fill };
  if (opts.fw     != null) el.fontWeight  = opts.fw;
  if (opts.font   != null) el.fontFamily  = opts.font;
  if (opts.anchor != null) el.textAnchor  = opts.anchor;
  if (opts.ls     != null) el.letterSpacing = opts.ls;
  if (opts.opacity!= null) el.opacity     = opts.opacity;
  elems.push(el);
}

function circle(cx, cy, r, fill, opts = {}) {
  const el = { type: 'circle', cx, cy, r, fill };
  if (opts.opacity != null) el.opacity = opts.opacity;
  if (opts.stroke  != null) el.stroke  = opts.stroke;
  if (opts.sw      != null) el.strokeWidth = opts.sw;
  elems.push(el);
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  const el = { type: 'line', x1, y1, x2, y2, stroke };
  if (opts.sw      != null) el.strokeWidth = opts.sw;
  if (opts.opacity != null) el.opacity     = opts.opacity;
  elems.push(el);
}

function startScreen() { elems = []; }

function makeScreen(name, buildFn) {
  startScreen();
  // Status bar background
  rect(0, 0, W, H, C.bg);
  // Status bar
  rect(0, 0, W, 44, C.bg);
  text(16, 29, '9:41', 13, C.text, { fw: 600 });
  text(W - 16, 29, '●●●  ▇▇▇  ⬛', 11, C.text, { anchor: 'end' });

  buildFn();

  // Bottom nav
  const screens = ['coffer', 'portfolio', 'moves', 'goals', 'you'];
  const icons   = ['⊟', '◫', '↕', '◎', '○'];
  const activeIdx = ['coffer','portfolio','moves','goals','you'].indexOf(
    name.toLowerCase().split(' ')[0]
  );
  rect(0, H - 80, W, 80, C.surface);
  line(0, H - 80, W, H - 80, C.border, { sw: 1 });
  screens.forEach((s, i) => {
    const cx = 39 + i * 78;
    const isActive = i === (activeIdx >= 0 ? activeIdx : 0);
    text(cx, H - 46, icons[i], isActive ? 20 : 18, isActive ? C.accent : C.textMuted, { anchor: 'middle' });
    text(cx, H - 26, s, 10, isActive ? C.accent : C.textMuted, { anchor: 'middle', fw: isActive ? 600 : 400 });
    if (isActive) {
      rect(cx - 18, H - 78, 36, 3, C.accent, { rx: 2 });
    }
  });

  const count = elems.length;
  return { name, svg: `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"/>`, elements: elems.slice(), count };
}

// ─── SCREEN 1: DASHBOARD ────────────────────────────────────────────────────
const screen1 = makeScreen('Dashboard', () => {
  // Header
  text(20, 74, 'Good morning, Mira', 13, C.textMuted);
  text(20, 96, 'Your Treasury', 22, C.text, { fw: 700, ls: -0.5 });

  // Settings icon (top right)
  circle(W - 28, 80, 16, C.card);
  text(W - 28, 85, '⚙', 14, C.textMid, { anchor: 'middle' });

  // Net worth card (big hero)
  rect(16, 110, W - 32, 140, C.white, { rx: 16, stroke: C.border, sw: 1 });
  text(36, 138, 'NET WORTH', 9, C.textMuted, { fw: 600, ls: 1 });
  text(36, 176, '$148,320', 38, C.text, { fw: 800, ls: -1, font: 'monospace' });
  // Change badge
  rect(36, 188, 90, 26, C.accentLight, { rx: 13 });
  text(81, 205, '▲ +$2,841 (1.95%)', 10, C.accent, { anchor: 'middle', fw: 600 });
  text(36, 232, 'vs last month', 11, C.textMuted);
  // Mini sparkline (decorative bars on right)
  const sparkData = [18, 22, 17, 26, 20, 30, 28, 35, 25, 38, 32, 40];
  sparkData.forEach((v, i) => {
    const bh = v * 1.6;
    rect(W - 48 + i * 8 - sparkData.length * 4 + 86, 236 - bh, 5, bh, C.accentLight, { rx: 2 });
  });
  // Highlight last bar
  const lastV = sparkData[sparkData.length - 1];
  rect(W - 48 + (sparkData.length - 1) * 8 - sparkData.length * 4 + 86, 236 - lastV * 1.6, 5, lastV * 1.6, C.accent, { rx: 2 });

  // Quick stats row
  const stats = [
    { label: 'ASSETS', val: '$162.4K', color: C.accent, bg: C.accentLight },
    { label: 'DEBTS',  val: '$14.1K',  color: C.red,    bg: C.redLight },
    { label: 'SAVED',  val: '$8,200',  color: C.limeDark, bg: C.lime },
  ];
  stats.forEach((s, i) => {
    const x = 16 + i * 120, w = 112;
    rect(x, 264, w, 68, s.bg, { rx: 12 });
    text(x + 14, 285, s.label, 9, s.color, { fw: 700, ls: 0.8 });
    text(x + 14, 314, s.val, 16, s.color, { fw: 800, font: 'monospace' });
    text(x + 14, 325, 'this month', 9, s.color, { opacity: 0.7 });
  });

  // Divider + section label
  line(16, 348, W - 16, 348, C.border, { sw: 1 });
  text(20, 368, 'RECENT ACTIVITY', 9, C.textMuted, { fw: 600, ls: 1 });
  text(W - 20, 368, 'see all →', 11, C.accent, { anchor: 'end' });

  // Transaction list (4 items)
  const txns = [
    { icon: '☕', name: 'Blue Bottle Coffee', cat: 'Food & Drink', amt: '-$6.50',  color: C.text, sub: 'Today, 8:31am' },
    { icon: '📦', name: 'Amazon Prime',       cat: 'Shopping',     amt: '-$14.99', color: C.text, sub: 'Yesterday' },
    { icon: '💰', name: 'Salary Deposit',     cat: 'Income',       amt: '+$4,200', color: C.accent, sub: 'Apr 10' },
    { icon: '🏠', name: 'Rent Transfer',      cat: 'Housing',      amt: '-$1,850', color: C.text, sub: 'Apr 1' },
  ];
  txns.forEach((tx, i) => {
    const y = 382 + i * 62;
    // Row bg on hover (alternate subtle)
    if (i % 2 === 0) rect(16, y - 4, W - 32, 56, C.bg, { rx: 10 });
    // Icon pill
    rect(20, y + 2, 40, 40, C.card, { rx: 12 });
    text(40, y + 27, tx.icon, 18, C.text, { anchor: 'middle' });
    // Name + cat
    text(72, y + 18, tx.name, 13, C.text, { fw: 600 });
    text(72, y + 34, tx.cat, 11, C.textMuted );
    // Amount
    text(W - 20, y + 18, tx.amt, 13, tx.color, { anchor: 'end', fw: 700, font: 'monospace' });
    text(W - 20, y + 34, tx.sub, 11, C.textMuted, { anchor: 'end' });
    if (i < txns.length - 1) line(72, y + 58, W - 16, y + 58, C.border, { sw: 0.5, opacity: 0.7 });
  });

  // Lime tag strip at bottom of content
  rect(16, 636, 120, 24, C.lime, { rx: 12 });
  text(76, 652, 'Budget on track ✓', 10, C.limeDark, { anchor: 'middle', fw: 700 });
});

// ─── SCREEN 2: PORTFOLIO ─────────────────────────────────────────────────────
const screen2 = makeScreen('Portfolio', () => {
  text(20, 74, 'Allocation', 22, C.text, { fw: 700, ls: -0.5 });
  text(20, 96, 'As of Apr 11, 2026', 12, C.textMuted );

  // Total circle donut (decorative rings)
  const cx = 195, cy = 195, R = 72, r = 52;
  circle(cx, cy, R, C.card);
  circle(cx, cy, r, C.surface);
  // Arcs (simulated with colored semicircles — using rect fills as bars in a radial pattern)
  // Use colored segments as stacked arc indicators
  const segments = [
    { color: C.accent,      pct: 0.44, label: 'Stocks' },
    { color: '#2980B9',     pct: 0.22, label: 'Real Estate' },
    { color: C.lime,        pct: 0.18, label: 'Cash & Savings' },
    { color: '#8E44AD',     pct: 0.10, label: 'Crypto' },
    { color: C.cardDark,    pct: 0.06, label: 'Bonds' },
  ];
  // Draw pie slices as arc indicators (colored bars outside ring)
  segments.forEach((seg, i) => {
    const barW = Math.floor(seg.pct * (W - 32 - 20));
    rect(16, 108 + i * 16, barW + 4, 10, seg.color, { rx: 5, opacity: 0.25 });
  });
  // Center text
  text(cx, cy - 8, '$148K', 18, C.text, { fw: 800, anchor: 'middle', font: 'monospace' });
  text(cx, cy + 10, 'total', 11, C.textMuted, { anchor: 'middle' });
  text(cx, cy + 26, 'value', 11, C.textMuted, { anchor: 'middle' });

  // Legend circles
  segments.forEach((seg, i) => {
    const lx = 30 + (i % 3) * 120, ly = 290 + Math.floor(i / 3) * 40;
    circle(lx, ly, 6, seg.color);
    text(lx + 14, ly + 5, seg.label, 11, C.text);
    text(lx + 14, ly + 17, `${Math.round(seg.pct * 100)}%`, 10, C.textMuted, { fw: 600 });
  });

  // Divider
  line(16, 375, W - 16, 375, C.border, { sw: 1 });
  text(20, 394, 'HOLDINGS', 9, C.textMuted, { fw: 600, ls: 1 });

  // Asset rows
  const assets = [
    { icon: '📈', name: 'US Equities',    ticker: 'VTI',  val: '$65,200', chg: '+3.2%',  pos: true },
    { icon: '🏢', name: 'Real Estate',    ticker: 'VNQ',  val: '$32,640', chg: '+1.8%',  pos: true },
    { icon: '💵', name: 'High-Yield Cash',ticker: 'HYSA', val: '$26,720', chg: '+0.4%',  pos: true },
    { icon: '₿',  name: 'Crypto',         ticker: 'BTC',  val: '$14,840', chg: '-2.1%',  pos: false },
    { icon: '📋', name: 'Bonds',          ticker: 'BND',  val: '$8,920',  chg: '+0.2%',  pos: true },
  ];
  assets.forEach((a, i) => {
    const y = 408 + i * 62;
    rect(20, y + 2, 40, 40, C.card, { rx: 12 });
    text(40, y + 27, a.icon, 18, C.text, { anchor: 'middle' });
    text(72, y + 18, a.name, 13, C.text, { fw: 600 });
    text(72, y + 34, a.ticker, 11, C.textMuted, { fw: 500, ls: 0.5 });
    text(W - 20, y + 16, a.val, 13, C.text, { anchor: 'end', fw: 700, font: 'monospace' });
    // Change badge
    rect(W - 20 - 56, y + 26, 54, 18, a.pos ? C.accentLight : C.redLight, { rx: 9 });
    text(W - 20 - 29, y + 38, (a.pos ? '▲' : '▼') + ' ' + a.chg, 10, a.pos ? C.accent : C.red, { anchor: 'middle', fw: 600 });
    if (i < assets.length - 1) line(72, y + 60, W - 16, y + 60, C.border, { sw: 0.5, opacity: 0.6 });
  });
});

// ─── SCREEN 3: TRANSACTIONS (MOVES) ──────────────────────────────────────────
const screen3 = makeScreen('Moves', () => {
  text(20, 74, 'Moves', 22, C.text, { fw: 700, ls: -0.5 });
  text(20, 96, 'April 2026', 12, C.textMuted );
  // Month nav
  text(W - 20, 84, '‹  Apr  ›', 13, C.accent, { anchor: 'end' });

  // Summary bar
  rect(16, 108, W - 32, 60, C.card, { rx: 12 });
  text(36, 128, 'IN', 9, C.accent, { fw: 700, ls: 1 });
  text(36, 148, '+$4,200', 15, C.accent, { fw: 800, font: 'monospace' });
  line(W/2 - 10, 116, W/2 - 10, 160, C.border, { sw: 1 });
  text(W/2 + 6, 128, 'OUT', 9, C.red, { fw: 700, ls: 1 });
  text(W/2 + 6, 148, '-$2,341', 15, C.red, { fw: 800, font: 'monospace' });
  line(W - 80, 116, W - 80, 160, C.border, { sw: 1 });
  text(W - 60, 128, 'NET', 9, C.textMuted, { fw: 700, ls: 1 });
  text(W - 60, 148, '+$1,859', 13, C.text, { fw: 800, font: 'monospace' });

  // Search bar
  rect(16, 180, W - 32, 40, C.white, { rx: 10, stroke: C.border, sw: 1 });
  text(36, 204, '🔍', 14, C.textMuted);
  text(56, 204, 'Search transactions…', 13, C.textMuted );

  // Filter tabs
  const tabs = ['All', 'Income', 'Food', 'Shopping', 'Bills'];
  let txX = 16;
  tabs.forEach((t, i) => {
    const tw = t.length * 8 + 20;
    rect(txX, 230, tw, 28, i === 0 ? C.accent : C.card, { rx: 14 });
    text(txX + tw/2, 248, t, 11, i === 0 ? C.white : C.textMid, { anchor: 'middle', fw: i === 0 ? 600 : 400 });
    txX += tw + 8;
  });

  // Date group header
  text(20, 276, 'TODAY', 9, C.textMuted, { fw: 600, ls: 1 });

  // Full transaction list
  const allTxns = [
    { icon: '☕', name: 'Blue Bottle Coffee', cat: 'Food & Drink', amt: '-$6.50',   color: C.text,   sub: '8:31am' },
    { icon: '🚇', name: 'BART Clipper',       cat: 'Transport',   amt: '-$3.80',   color: C.text,   sub: '7:58am' },
    { icon: '🥗', name: 'Sweetgreen',         cat: 'Food & Drink', amt: '-$14.25', color: C.text,   sub: '12:24pm' },
  ];
  allTxns.forEach((tx, i) => {
    const y = 288 + i * 58;
    rect(20, y + 2, 40, 40, C.card, { rx: 12 });
    text(40, y + 27, tx.icon, 18, C.text, { anchor: 'middle' });
    text(72, y + 16, tx.name, 13, C.text, { fw: 600 });
    text(72, y + 30, tx.cat, 11, C.textMuted );
    text(W - 20, y + 16, tx.amt, 13, tx.color, { anchor: 'end', fw: 700, font: 'monospace' });
    text(W - 20, y + 30, tx.sub, 11, C.textMuted, { anchor: 'end' });
    if (i < allTxns.length - 1) line(72, y + 54, W - 16, y + 54, C.border, { sw: 0.5, opacity: 0.6 });
  });

  text(20, 470, 'YESTERDAY', 9, C.textMuted, { fw: 600, ls: 1 });
  const yestTxns = [
    { icon: '📦', name: 'Amazon Prime',  cat: 'Shopping',  amt: '-$14.99', color: C.text,   sub: 'Online' },
    { icon: '⛽', name: 'Shell Station', cat: 'Transport', amt: '-$52.10', color: C.text,   sub: 'Gas' },
    { icon: '💈', name: 'Barbershop',    cat: 'Personal',  amt: '-$35.00', color: C.text,   sub: 'Mission St' },
  ];
  yestTxns.forEach((tx, i) => {
    const y = 484 + i * 58;
    rect(20, y + 2, 40, 40, C.card, { rx: 12 });
    text(40, y + 27, tx.icon, 18, C.text, { anchor: 'middle' });
    text(72, y + 16, tx.name, 13, C.text, { fw: 600 });
    text(72, y + 30, tx.cat, 11, C.textMuted );
    text(W - 20, y + 16, tx.amt, 13, tx.color, { anchor: 'end', fw: 700, font: 'monospace' });
    text(W - 20, y + 30, tx.sub, 11, C.textMuted, { anchor: 'end' });
    if (i < yestTxns.length - 1) line(72, y + 54, W - 16, y + 54, C.border, { sw: 0.5, opacity: 0.6 });
  });

  // Month total footer bar
  rect(0, H - 80 - 52, W, 52, C.accentLight);
  text(20, H - 80 - 28, 'Month total:', 12, C.accent);
  text(W - 20, H - 80 - 28, '174 transactions · avg -$13.45/day', 11, C.textMid, { anchor: 'end' });
});

// ─── SCREEN 4: GOALS ─────────────────────────────────────────────────────────
const screen4 = makeScreen('Goals', () => {
  text(20, 74, 'Goals', 22, C.text, { fw: 700, ls: -0.5 });
  text(20, 96, '3 active · 1 achieved', 12, C.textMuted );

  // Add goal CTA
  rect(W - 20 - 100, 68, 100, 32, C.accent, { rx: 16 });
  text(W - 20 - 50, 88, '+ New Goal', 12, C.white, { anchor: 'middle', fw: 600 });

  // Achieved goal (completed)
  rect(16, 112, W - 32, 72, C.accentLight, { rx: 14, stroke: C.accent, sw: 1 });
  circle(36, 148, 14, C.accent);
  text(36, 153, '✓', 14, C.white, { anchor: 'middle', fw: 700 });
  text(62, 136, 'Emergency Fund', 14, C.text, { fw: 700 });
  text(62, 154, '$10,000 of $10,000 · Completed Mar 2026', 11, C.accent );
  rect(62, 160, W - 32 - 62 + 16 - 32, 8, C.accent, { rx: 4 });
  rect(16, 183, 80, 22, C.lime, { rx: 11 });
  text(56, 198, 'Achieved! 🎉', 10, C.limeDark, { anchor: 'middle', fw: 700 });

  // Goal cards
  const goals = [
    {
      title: 'Europe Trip',
      emoji: '✈️',
      target: 6000,
      current: 3840,
      deadline: 'Sep 2026',
      color: C.accent,
      bgColor: C.white,
    },
    {
      title: 'New MacBook Pro',
      emoji: '💻',
      target: 3500,
      current: 2100,
      deadline: 'Jun 2026',
      color: '#2980B9',
      bgColor: C.white,
    },
    {
      title: 'Down Payment',
      emoji: '🏠',
      target: 80000,
      current: 22400,
      deadline: 'Dec 2028',
      color: '#8E44AD',
      bgColor: C.white,
    },
  ];

  goals.forEach((g, i) => {
    const y = 200 + i * 138;
    const pct = g.current / g.target;
    rect(16, y, W - 32, 126, g.bgColor, { rx: 14, stroke: C.border, sw: 1 });
    // Icon
    rect(20, y + 14, 48, 48, C.card, { rx: 12 });
    text(44, y + 44, g.emoji, 24, C.text, { anchor: 'middle' });
    // Title + target
    text(80, y + 30, g.title, 15, C.text, { fw: 700 });
    text(80, y + 48, `Target: $${g.target.toLocaleString()}`, 11, C.textMuted );
    text(W - 32, y + 30, `$${g.current.toLocaleString()}`, 14, g.color, { anchor: 'end', fw: 800, font: 'monospace' });
    text(W - 32, y + 48, `saved`, 10, C.textMuted, { anchor: 'end' });
    // Progress bar
    rect(20, y + 72, W - 52, 10, C.card, { rx: 5 });
    rect(20, y + 72, Math.round((W - 52) * pct), 10, g.color, { rx: 5 });
    // Pct + deadline
    text(20, y + 98, `${Math.round(pct * 100)}% complete`, 11, g.color, { fw: 600 });
    text(W - 32, y + 98, `By ${g.deadline}`, 11, C.textMuted, { anchor: 'end' });
    // Monthly needed
    const monthsLeft = Math.max(1, Math.round(Math.random() * 24 + 8));
    const needed = Math.round((g.target - g.current) / monthsLeft);
    text(20, y + 114, `Add $${needed}/mo to hit target`, 10, C.textMuted );
  });
});

// ─── SCREEN 5: ANALYTICS ─────────────────────────────────────────────────────
const screen5 = makeScreen('Analytics', () => {
  text(20, 74, 'Insights', 22, C.text, { fw: 700, ls: -0.5 });
  text(20, 96, 'April 2026', 12, C.textMuted );
  // Period toggle
  rect(W - 20 - 156, 70, 156, 30, C.card, { rx: 15 });
  rect(W - 20 - 156, 70, 52, 30, C.accent, { rx: 15 });
  text(W - 20 - 130, 89, 'Month', 11, C.white, { anchor: 'middle', fw: 600 });
  text(W - 20 - 78, 89, 'Quarter', 11, C.textMid, { anchor: 'middle' });
  text(W - 20 - 26, 89, 'Year', 11, C.textMid, { anchor: 'middle' });

  // Bar chart — monthly spending
  text(20, 120, 'MONTHLY SPENDING', 9, C.textMuted, { fw: 600, ls: 1 });
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const spend  = [2100, 2450, 3200, 2050, 1950, 2250, 2341];
  const maxSpend = 3400;
  const chartH = 90, chartY = 200, chartX = 20;
  const barW = 34, barGap = 12;
  months.forEach((m, i) => {
    const bh = Math.round((spend[i] / maxSpend) * chartH);
    const bx = chartX + i * (barW + barGap);
    const isThis = i === months.length - 1;
    rect(bx, chartY + chartH - bh, barW, bh, isThis ? C.accent : C.card, { rx: 6 });
    if (isThis) {
      rect(bx, chartY + chartH - bh - 26, barW, 20, C.accent, { rx: 6 });
      text(bx + barW/2, chartY + chartH - bh - 12, `$${(spend[i]/1000).toFixed(1)}K`, 9, C.white, { anchor: 'middle', fw: 700 });
    }
    text(bx + barW/2, chartY + chartH + 14, m, 10, isThis ? C.text : C.textMuted, { anchor: 'middle', fw: isThis ? 700 : 400 });
  });
  // Y-axis labels
  line(16, chartY, 16, chartY + chartH, C.border, { sw: 1 });
  line(16, chartY + chartH, W - 16, chartY + chartH, C.border, { sw: 1 });
  [0, 1000, 2000, 3000].forEach(v => {
    const yv = chartY + chartH - (v / maxSpend) * chartH;
    line(14, yv, W - 16, yv, C.border, { sw: 0.5, opacity: 0.5 });
  });

  // Divider
  line(16, 318, W - 16, 318, C.border, { sw: 1 });
  text(20, 336, 'SPENDING BY CATEGORY', 9, C.textMuted, { fw: 600, ls: 1 });

  // Category list with horizontal progress bars
  const cats = [
    { name: 'Housing',    amt: 1850, pct: 0.79, icon: '🏠', color: '#2980B9' },
    { name: 'Food & Drink', amt: 312, pct: 0.13, icon: '🍽', color: C.accent },
    { name: 'Transport',  amt: 124, pct: 0.05, icon: '🚇', color: '#8E44AD' },
    { name: 'Shopping',   amt: 55, pct: 0.02, icon: '🛍', color: '#E67E22' },
    { name: 'Personal',   amt: 35, pct: 0.01, icon: '💈', color: C.lime },
  ];
  cats.forEach((c, i) => {
    const y = 348 + i * 52;
    text(22, y + 16, c.icon, 16, C.text);
    text(46, y + 12, c.name, 13, C.text, { fw: 500 });
    text(46, y + 26, `$${c.amt.toLocaleString()}`, 11, C.textMuted, { font: 'monospace' });
    // Bar
    rect(148, y + 4, W - 148 - 36, 8, C.card, { rx: 4 });
    rect(148, y + 4, Math.round((W - 148 - 36) * c.pct), 8, c.color, { rx: 4 });
    text(W - 28, y + 12, `${Math.round(c.pct * 100)}%`, 11, C.textMid, { anchor: 'end', fw: 600 });
  });

  // Insight card
  rect(16, 618, W - 32, 58, C.lime, { rx: 12 });
  text(36, 638, '💡 Insight', 11, C.limeDark, { fw: 700 });
  text(36, 656, 'You spent 7% less on food vs March.', 12, C.text );
  text(36, 670, 'Keep it up — you\'re on track for your Europe goal.', 11, C.textMid );
});

// ─── SCREEN 6: PROFILE / SETTINGS ────────────────────────────────────────────
const screen6 = makeScreen('You', () => {
  text(20, 74, 'You', 22, C.text, { fw: 700, ls: -0.5 });

  // Avatar card
  rect(16, 108, W - 32, 100, C.white, { rx: 16, stroke: C.border, sw: 1 });
  circle(64, 158, 32, C.card);
  text(64, 164, 'M', 24, C.accent, { anchor: 'middle', fw: 800 });
  text(112, 144, 'Mira Chen', 17, C.text, { fw: 700 });
  text(112, 164, 'mira.chen@email.com', 12, C.textMuted );
  text(112, 182, 'Premium · Since Jan 2023', 11, C.accent );
  // Edit button
  rect(W - 32 - 64, 124, 64, 30, C.accentLight, { rx: 15 });
  text(W - 32 - 32, 143, 'Edit', 12, C.accent, { anchor: 'middle', fw: 600 });

  // Net worth compact
  rect(16, 220, W - 32, 54, C.accentLight, { rx: 12 });
  text(36, 242, 'NET WORTH', 9, C.accent, { fw: 700, ls: 1 });
  text(36, 262, '$148,320', 18, C.accent, { fw: 800, font: 'monospace' });
  text(W - 32, 242, 'CHANGE (30d)', 9, C.accent, { fw: 700, ls: 1, anchor: 'end' });
  text(W - 32, 262, '+1.95% ▲', 15, C.accent, { anchor: 'end', fw: 700 });

  // Settings groups
  const groups = [
    {
      label: 'ACCOUNT',
      items: [
        { icon: '💳', label: 'Linked Accounts', sub: '5 connected', chevron: true },
        { icon: '🔔', label: 'Notifications',   sub: 'Alerts on',   chevron: true },
        { icon: '🔒', label: 'Security',         sub: 'Face ID active', chevron: true },
      ],
    },
    {
      label: 'PREFERENCES',
      items: [
        { icon: '💱', label: 'Currency',       sub: 'USD',            chevron: true },
        { icon: '📅', label: 'Fiscal Year',    sub: 'Jan–Dec',        chevron: true },
      ],
    },
    {
      label: 'SUPPORT',
      items: [
        { icon: '❓', label: 'Help Center',    sub: 'FAQs & guides',  chevron: true },
        { icon: '⭐', label: 'Rate Coffer',    sub: 'App Store',      chevron: true },
      ],
    },
  ];

  let gy = 288;
  groups.forEach(group => {
    text(20, gy, group.label, 9, C.textMuted, { fw: 600, ls: 1 });
    gy += 18;
    rect(16, gy, W - 32, group.items.length * 54 + 4, C.white, { rx: 14, stroke: C.border, sw: 1 });
    group.items.forEach((item, ii) => {
      const iy = gy + ii * 54 + 10;
      rect(24, iy + 2, 34, 34, C.card, { rx: 10 });
      text(41, iy + 24, item.icon, 16, C.text, { anchor: 'middle' });
      text(70, iy + 16, item.label, 13, C.text, { fw: 500 });
      text(70, iy + 30, item.sub, 11, C.textMuted );
      if (item.chevron) text(W - 30, iy + 20, '›', 18, C.textMuted, { anchor: 'middle' });
      if (ii < group.items.length - 1) line(70, iy + 52, W - 16, iy + 52, C.border, { sw: 0.5, opacity: 0.6 });
    });
    gy += group.items.length * 54 + 16;
  });

  // Version footer
  text(W/2, gy + 14, 'Coffer v2.4.1 · Made with care', 11, C.textMuted, { anchor: 'middle' });
});

// ─── Assemble pen ────────────────────────────────────────────────────────────
const screens = [screen1, screen2, screen3, screen4, screen5, screen6];
const totalElements = screens.reduce((s, sc) => s + sc.count, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'Coffer — Personal Wealth Tracker',
    author: 'RAM',
    date: new Date().toISOString().slice(0,10),
    theme: 'light',
    heartbeat: 465,
    elements: totalElements,
    palette: {
      bg: C.bg, surface: C.surface, text: C.text,
      accent: C.accent, accent2: C.lime, muted: C.textMuted,
    },
    inspiration: 'NoGood (minimal.gallery) retro warm off-white aesthetic; Old Tom Capital monospace-in-finance branding',
  },
  screens: screens.map(sc => ({
    name: sc.name,
    svg:  sc.svg,
    elements: sc.elements,
  })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`Coffer: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
