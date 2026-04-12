'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'pave';
const NAME = 'PAVE';
const TAGLINE = 'wealth, made clear';
const W = 390, H = 844;

// Light warm-cream palette inspired by Old Tom Capital (minimal.gallery)
// and Sparkles' multi-hue warmth (lapa.ninja)
const BG      = '#F9F7F4';
const SURF    = '#FFFFFF';
const CARD    = '#F2EEE8';
const TEXT    = '#1A1714';
const ACC     = '#0F766E'; // deep teal
const ACC2    = '#C2410C'; // terracotta
const MUTED   = '#8C8078';
const BORDER  = '#E5DDD5';
const GREEN   = '#16A34A';
const RED     = '#DC2626';
const AMBER   = '#D97706';

function rect(x, y, w, h, fill, opts = {}) {
  const el = { type: 'rect', x, y, width: w, height: h, fill };
  if (opts.rx !== undefined) el.rx = opts.rx;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  if (opts.stroke !== undefined) { el.stroke = opts.stroke; el.strokeWidth = opts.sw || 1; }
  return el;
}

function text(x, y, content, size, fill, opts = {}) {
  const el = { type: 'text', x, y, content, fontSize: size, fill };
  if (opts.fw !== undefined) el.fontWeight = opts.fw;
  if (opts.anchor !== undefined) el.textAnchor = opts.anchor;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  if (opts.ls !== undefined) el.letterSpacing = opts.ls;
  if (opts.font !== undefined) el.fontFamily = opts.font;
  return el;
}

function circle(cx, cy, r, fill, opts = {}) {
  const el = { type: 'circle', cx, cy, r, fill };
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  if (opts.stroke !== undefined) { el.stroke = opts.stroke; el.strokeWidth = opts.sw || 1; }
  return el;
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  const el = { type: 'line', x1, y1, x2, y2, stroke };
  if (opts.sw !== undefined) el.strokeWidth = opts.sw;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  return el;
}

// ─── SCREEN 1: Portfolio Overview ──────────────────────────────────────────
function screen1() {
  const els = [];
  // BG
  els.push(rect(0, 0, W, H, BG));

  // Status bar
  els.push(text(20, 54, '9:41', 13, TEXT, { fw: 600 }));
  els.push(text(W - 20, 54, '⊙ ⊙⊙', 12, TEXT, { anchor: 'end', opacity: 0.6 }));

  // Header
  els.push(text(20, 92, 'Good morning, Alex', 13, MUTED));
  els.push(text(20, 118, 'PAVE', 24, TEXT, { fw: 700, ls: '0.12em' }));

  // Notification bell
  els.push(circle(358, 108, 16, CARD));
  els.push(text(358, 113, '◎', 14, ACC, { anchor: 'middle' }));

  // Net worth card - full-bleed editorial style
  els.push(rect(20, 148, 350, 180, SURF, { rx: 16, stroke: BORDER, sw: 1 }));
  els.push(text(36, 178, 'Total Portfolio Value', 11, MUTED, { ls: '0.06em' }));
  els.push(text(36, 218, '$284,391', 38, TEXT, { fw: 700 }));
  els.push(text(36, 248, '↑ $4,218  ', 13, GREEN, { fw: 600 }));
  els.push(text(148, 248, '+1.51% today', 13, GREEN));

  // Sparkline placeholder (simple line chart)
  const sparkY = [310, 305, 308, 298, 302, 295, 288, 292, 285, 280, 275, 278];
  for (let i = 0; i < sparkY.length - 1; i++) {
    const x1 = 36 + i * 27, x2 = 36 + (i + 1) * 27;
    els.push(line(x1, sparkY[i], x2, sparkY[i + 1], ACC, { sw: 2 }));
  }
  // Area fill dots
  sparkY.forEach((sy, i) => {
    els.push(circle(36 + i * 27, sy, 2.5, ACC));
  });
  els.push(text(36, 330, '1W', 10, MUTED));
  els.push(text(100, 330, '1M', 10, ACC, { fw: 600 }));
  els.push(text(164, 330, '3M', 10, MUTED));
  els.push(text(228, 330, '1Y', 10, MUTED));
  els.push(text(292, 330, 'ALL', 10, MUTED));

  // Allocation section
  els.push(text(20, 360, 'Allocation', 13, TEXT, { fw: 600, ls: '0.04em' }));

  const allocs = [
    { label: 'US Equities', pct: 42, color: ACC },
    { label: 'Int\'l Stocks', pct: 23, color: ACC2 },
    { label: 'Fixed Income', pct: 18, color: AMBER },
    { label: 'Real Estate', pct: 10, color: GREEN },
    { label: 'Cash', pct: 7, color: MUTED },
  ];

  // Allocation bar
  let barX = 20;
  allocs.forEach(a => {
    const bw = (350 * a.pct) / 100;
    els.push(rect(barX, 374, bw - 2, 10, a.color, { rx: 5 }));
    barX += bw;
  });

  // Legend items
  allocs.forEach((a, i) => {
    const col = i < 3 ? 0 : 1;
    const row = i < 3 ? i : i - 3;
    const lx = 20 + col * 180;
    const ly = 400 + row * 28;
    els.push(circle(lx + 5, ly + 4, 4, a.color));
    els.push(text(lx + 18, ly + 8, a.label, 12, TEXT));
    els.push(text(lx + 160, ly + 8, `${a.pct}%`, 12, TEXT, { fw: 600, anchor: 'end' }));
  });

  // Quick actions row
  const actions = [
    { icon: '↑', label: 'Send' },
    { icon: '↓', label: 'Receive' },
    { icon: '⇄', label: 'Exchange' },
    { icon: '+', label: 'Add' },
  ];
  els.push(text(20, 510, 'Quick Actions', 13, TEXT, { fw: 600, ls: '0.04em' }));
  actions.forEach((a, i) => {
    const ax = 20 + i * 88;
    els.push(rect(ax, 522, 76, 64, SURF, { rx: 12, stroke: BORDER, sw: 1 }));
    els.push(text(ax + 38, 550, a.icon, 20, ACC, { anchor: 'middle', fw: 700 }));
    els.push(text(ax + 38, 570, a.label, 10, MUTED, { anchor: 'middle' }));
  });

  // Recent section header
  els.push(text(20, 610, 'Recent Activity', 13, TEXT, { fw: 600, ls: '0.04em' }));
  els.push(text(W - 20, 610, 'See all →', 12, ACC, { anchor: 'end' }));

  // Recent items
  const recent = [
    { name: 'Apple Inc.', type: 'Bought', amount: '+10 shares', val: '$1,840', color: GREEN },
    { name: 'Dividend', type: 'Received', amount: 'MSFT', val: '+$48.20', color: GREEN },
    { name: 'Vanguard ETF', type: 'Sold', amount: '-5 shares', val: '-$940', color: RED },
  ];
  recent.forEach((r, i) => {
    const ry = 628 + i * 56;
    els.push(rect(20, ry, 350, 48, SURF, { rx: 10, stroke: BORDER, sw: 1 }));
    els.push(circle(44, ry + 24, 14, r.color, { opacity: 0.15 }));
    els.push(text(44, ry + 28, r.type === 'Bought' ? '▲' : r.type === 'Sold' ? '▼' : '$', 10, r.color, { anchor: 'middle' }));
    els.push(text(66, ry + 20, r.name, 13, TEXT, { fw: 600 }));
    els.push(text(66, ry + 35, `${r.type} · ${r.amount}`, 11, MUTED));
    els.push(text(360, ry + 28, r.val, 13, r.color, { anchor: 'end', fw: 600 }));
  });

  // Bottom nav
  els.push(rect(0, 780, W, 64, SURF, { stroke: BORDER, sw: 1 }));
  const navItems = [
    { icon: '⊞', label: 'Portfolio', active: true },
    { icon: '◈', label: 'Holdings' },
    { icon: '◉', label: 'Insights' },
    { icon: '◎', label: 'Goals' },
    { icon: '○', label: 'Profile' },
  ];
  navItems.forEach((n, i) => {
    const nx = 39 + i * 78;
    els.push(text(nx, 808, n.icon, 20, n.active ? ACC : MUTED, { anchor: 'middle' }));
    els.push(text(nx, 828, n.label, 9, n.active ? ACC : MUTED, { anchor: 'middle', fw: n.active ? 600 : 400 }));
  });

  return { name: 'Portfolio Overview', elements: els };
}

// ─── SCREEN 2: Holdings ──────────────────────────────────────────────────
function screen2() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));

  // Status bar
  els.push(text(20, 54, '9:41', 13, TEXT, { fw: 600 }));

  // Header
  els.push(text(W / 2, 96, 'Holdings', 18, TEXT, { fw: 700, anchor: 'middle' }));

  // Filter chips
  const filters = ['All', 'Stocks', 'ETFs', 'Bonds', 'Cash'];
  filters.forEach((f, i) => {
    const fx = 20 + i * 72;
    const active = i === 0;
    els.push(rect(fx, 112, 66, 28, active ? ACC : SURF, { rx: 14, stroke: active ? ACC : BORDER, sw: 1 }));
    els.push(text(fx + 33, 130, f, 11, active ? SURF : TEXT, { anchor: 'middle', fw: active ? 600 : 400 }));
  });

  // Holdings list
  const holdings = [
    { ticker: 'AAPL', name: 'Apple Inc.', shares: '42 shares', value: '$9,114', change: '+2.34%', color: GREEN },
    { ticker: 'VTI', name: 'Vanguard Total Market', shares: '88 shares', value: '$21,208', change: '+0.87%', color: GREEN },
    { ticker: 'MSFT', name: 'Microsoft Corp.', shares: '30 shares', value: '$12,300', change: '+1.12%', color: GREEN },
    { ticker: 'BND', name: 'Vanguard Total Bond', shares: '150 shares', value: '$11,625', change: '-0.23%', color: RED },
    { ticker: 'AMZN', name: 'Amazon.com', shares: '8 shares', value: '$14,240', change: '+3.41%', color: GREEN },
    { ticker: 'VNQ', name: 'Vanguard Real Estate', shares: '60 shares', value: '$5,220', change: '-0.55%', color: RED },
  ];

  // Summary bar
  els.push(rect(20, 152, 350, 52, SURF, { rx: 12, stroke: BORDER, sw: 1 }));
  els.push(text(36, 174, 'Total Invested', 11, MUTED));
  els.push(text(36, 192, '$198,840', 16, TEXT, { fw: 700 }));
  els.push(line(180, 162, 180, 194, BORDER, { sw: 1 }));
  els.push(text(196, 174, 'Total Gain/Loss', 11, MUTED));
  els.push(text(196, 192, '+$21,640  +12.2%', 13, GREEN, { fw: 600 }));

  holdings.forEach((h, i) => {
    const hy = 218 + i * 86;
    els.push(rect(20, hy, 350, 78, SURF, { rx: 12, stroke: BORDER, sw: 1 }));

    // Ticker badge
    els.push(rect(36, hy + 16, 44, 44, CARD, { rx: 8 }));
    els.push(text(58, hy + 43, h.ticker.slice(0, 3), 10, ACC, { anchor: 'middle', fw: 700, ls: '0.04em' }));

    // Name + shares
    els.push(text(90, hy + 28, h.name, 13, TEXT, { fw: 600 }));
    els.push(text(90, hy + 48, h.shares, 11, MUTED));

    // Value + change
    els.push(text(360, hy + 28, h.value, 15, TEXT, { fw: 700, anchor: 'end' }));
    els.push(text(360, hy + 50, h.change, 11, h.color, { anchor: 'end', fw: 600 }));

    // Micro bar (allocation indicator)
    const barW = Math.min(160, parseInt(h.value.replace(/[$,]/g, '')) / 250);
    els.push(rect(90, hy + 60, barW, 3, h.color, { rx: 2, opacity: 0.35 }));
  });

  // Bottom nav
  els.push(rect(0, 780, W, 64, SURF, { stroke: BORDER, sw: 1 }));
  const navItems = [
    { icon: '⊞', label: 'Portfolio' },
    { icon: '◈', label: 'Holdings', active: true },
    { icon: '◉', label: 'Insights' },
    { icon: '◎', label: 'Goals' },
    { icon: '○', label: 'Profile' },
  ];
  navItems.forEach((n, i) => {
    const nx = 39 + i * 78;
    els.push(text(nx, 808, n.icon, 20, n.active ? ACC : MUTED, { anchor: 'middle' }));
    els.push(text(nx, 828, n.label, 9, n.active ? ACC : MUTED, { anchor: 'middle', fw: n.active ? 600 : 400 }));
  });

  return { name: 'Holdings', elements: els };
}

// ─── SCREEN 3: Insights ──────────────────────────────────────────────────
function screen3() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));

  els.push(text(20, 54, '9:41', 13, TEXT, { fw: 600 }));
  els.push(text(W / 2, 96, 'Insights', 18, TEXT, { fw: 700, anchor: 'middle' }));

  // Period selector
  const periods = ['7D', '1M', '3M', '1Y', 'ALL'];
  periods.forEach((p, i) => {
    const px = 20 + i * 70;
    const active = i === 3;
    els.push(rect(px, 112, 62, 26, active ? ACC : 'transparent', { rx: 13 }));
    els.push(text(px + 31, 129, p, 11, active ? SURF : MUTED, { anchor: 'middle', fw: active ? 700 : 400 }));
  });

  // Performance chart area
  els.push(rect(20, 148, 350, 160, SURF, { rx: 16, stroke: BORDER, sw: 1 }));
  els.push(text(36, 170, 'Net Worth Growth', 11, MUTED, { ls: '0.04em' }));
  els.push(text(36, 194, '$284,391', 28, TEXT, { fw: 700 }));
  els.push(text(36, 216, '↑ 12.2% this year', 12, GREEN, { fw: 600 }));

  // Chart bars
  const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const vals = [210, 218, 215, 228, 235, 240, 248, 244, 255, 258, 268, 284];
  const chartBase = 300, chartH = 80;
  const minV = 200, maxV = 290;
  months.forEach((m, i) => {
    const bx = 24 + i * 28;
    const bh = ((vals[i] - minV) / (maxV - minV)) * chartH;
    const active = i === 11;
    els.push(rect(bx, chartBase - bh, 20, bh, active ? ACC : CARD, { rx: 4 }));
    if (i % 3 === 0) els.push(text(bx + 10, chartBase + 12, m, 8, MUTED, { anchor: 'middle' }));
  });

  // Metrics grid
  els.push(text(20, 328, 'Financial Health', 13, TEXT, { fw: 600, ls: '0.04em' }));

  const metrics = [
    { label: 'Savings Rate', value: '28%', sub: 'of income', color: GREEN, icon: '↑' },
    { label: 'Expense Ratio', value: '0.12%', sub: 'avg fund cost', color: ACC, icon: '◈' },
    { label: 'Diversification', value: '91/100', sub: 'score', color: ACC2, icon: '●' },
    { label: 'Risk Level', value: 'Moderate', sub: 'balanced profile', color: AMBER, icon: '◎' },
  ];

  metrics.forEach((m, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const mx = 20 + col * 180;
    const my = 346 + row * 100;
    els.push(rect(mx, my, 168, 88, SURF, { rx: 12, stroke: BORDER, sw: 1 }));
    els.push(circle(mx + 22, my + 22, 10, m.color, { opacity: 0.15 }));
    els.push(text(mx + 22, my + 27, m.icon, 10, m.color, { anchor: 'middle', fw: 700 }));
    els.push(text(mx + 40, my + 28, m.label, 10, MUTED));
    els.push(text(mx + 16, my + 54, m.value, 20, TEXT, { fw: 700 }));
    els.push(text(mx + 16, my + 71, m.sub, 10, MUTED));
  });

  // Insight cards
  els.push(text(20, 560, 'Smart Alerts', 13, TEXT, { fw: 600, ls: '0.04em' }));

  const insights = [
    { title: 'Rebalancing Due', body: 'US Equities are 4% above target allocation.', color: AMBER },
    { title: 'Dividend incoming', body: 'MSFT pays $0.75/share on Apr 15.', color: GREEN },
    { title: 'Tax-loss opportunity', body: 'VNQ is down 6% — consider harvesting before month end.', color: ACC },
  ];

  insights.forEach((ins, i) => {
    const iy = 578 + i * 62;
    els.push(rect(20, iy, 350, 54, SURF, { rx: 10, stroke: BORDER, sw: 1 }));
    els.push(rect(20, iy, 4, 54, ins.color, { rx: 2 }));
    els.push(text(36, iy + 20, ins.title, 12, TEXT, { fw: 700 }));
    els.push(text(36, iy + 38, ins.body, 10, MUTED));
  });

  // Bottom nav
  els.push(rect(0, 780, W, 64, SURF, { stroke: BORDER, sw: 1 }));
  const navItems = [
    { icon: '⊞', label: 'Portfolio' },
    { icon: '◈', label: 'Holdings' },
    { icon: '◉', label: 'Insights', active: true },
    { icon: '◎', label: 'Goals' },
    { icon: '○', label: 'Profile' },
  ];
  navItems.forEach((n, i) => {
    const nx = 39 + i * 78;
    els.push(text(nx, 808, n.icon, 20, n.active ? ACC : MUTED, { anchor: 'middle' }));
    els.push(text(nx, 828, n.label, 9, n.active ? ACC : MUTED, { anchor: 'middle', fw: n.active ? 600 : 400 }));
  });

  return { name: 'Insights', elements: els };
}

// ─── SCREEN 4: Goals ─────────────────────────────────────────────────────
function screen4() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));

  els.push(text(20, 54, '9:41', 13, TEXT, { fw: 600 }));
  els.push(text(W / 2, 96, 'Goals', 18, TEXT, { fw: 700, anchor: 'middle' }));

  // Add goal button
  els.push(rect(W - 60, 78, 48, 30, ACC, { rx: 15 }));
  els.push(text(W - 36, 97, '+ New', 10, SURF, { anchor: 'middle', fw: 600 }));

  // Goals
  const goals = [
    { name: 'Early Retirement', target: '$1,200,000', current: '$284,391', pct: 24, color: ACC, emoji: '🏖', deadline: '2042' },
    { name: 'House Down Payment', target: '$120,000', current: '$89,400', pct: 75, color: GREEN, emoji: '🏡', deadline: '2026' },
    { name: 'Emergency Fund', target: '$30,000', current: '$30,000', pct: 100, color: ACC2, emoji: '⛑', deadline: 'Done' },
    { name: 'Travel Fund', target: '$8,000', current: '$4,200', pct: 53, color: AMBER, emoji: '✈', deadline: 'Dec 2025' },
  ];

  goals.forEach((g, i) => {
    const gy = 118 + i * 156;
    els.push(rect(20, gy, 350, 144, SURF, { rx: 16, stroke: BORDER, sw: 1 }));

    // emoji + title
    els.push(text(36, gy + 30, g.emoji, 22, TEXT));
    els.push(text(68, gy + 26, g.name, 15, TEXT, { fw: 700 }));
    els.push(text(68, gy + 44, `Target · ${g.deadline}`, 11, MUTED));

    // Amounts
    els.push(text(36, gy + 70, g.current, 22, TEXT, { fw: 700 }));
    els.push(text(36, gy + 88, `of ${g.target}`, 11, MUTED));

    // Percentage pill
    const pill = g.pct === 100 ? '✓ Complete' : `${g.pct}%`;
    els.push(rect(W - 80, gy + 16, 64, 24, g.pct === 100 ? g.color : CARD, { rx: 12 }));
    els.push(text(W - 48, gy + 32, pill, 10, g.pct === 100 ? SURF : g.color, { anchor: 'middle', fw: 700 }));

    // Progress bar
    els.push(rect(36, gy + 104, 314, 8, CARD, { rx: 4 }));
    els.push(rect(36, gy + 104, Math.min(314, 314 * g.pct / 100), 8, g.color, { rx: 4 }));
    els.push(text(36, gy + 126, `${g.pct}% funded`, 10, MUTED));
    if (g.pct < 100) {
      const monthly = Math.ceil(parseInt(g.target.replace(/[$,]/g, '')) * (1 - g.pct / 100) / 12);
      els.push(text(350, gy + 126, `+$${monthly.toLocaleString()}/mo to hit goal`, 10, g.color, { anchor: 'end' }));
    }
  });

  // Bottom nav
  els.push(rect(0, 780, W, 64, SURF, { stroke: BORDER, sw: 1 }));
  const navItems = [
    { icon: '⊞', label: 'Portfolio' },
    { icon: '◈', label: 'Holdings' },
    { icon: '◉', label: 'Insights' },
    { icon: '◎', label: 'Goals', active: true },
    { icon: '○', label: 'Profile' },
  ];
  navItems.forEach((n, i) => {
    const nx = 39 + i * 78;
    els.push(text(nx, 808, n.icon, 20, n.active ? ACC : MUTED, { anchor: 'middle' }));
    els.push(text(nx, 828, n.label, 9, n.active ? ACC : MUTED, { anchor: 'middle', fw: n.active ? 600 : 400 }));
  });

  return { name: 'Goals', elements: els };
}

// ─── SCREEN 5: Transactions ───────────────────────────────────────────────
function screen5() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));

  els.push(text(20, 54, '9:41', 13, TEXT, { fw: 600 }));
  els.push(text(W / 2, 96, 'Activity', 18, TEXT, { fw: 700, anchor: 'middle' }));

  // Search bar
  els.push(rect(20, 112, 350, 38, SURF, { rx: 19, stroke: BORDER, sw: 1 }));
  els.push(text(46, 135, '⌕', 16, MUTED, { fw: 400 }));
  els.push(text(68, 136, 'Search transactions...', 12, MUTED));

  // Month header
  els.push(text(20, 168, 'APRIL 2026', 10, MUTED, { ls: '0.1em', fw: 600 }));

  const txns = [
    { date: '9 Apr', icon: '▲', name: 'Apple Inc.', sub: 'Buy · 5 shares @ $191', amount: '-$955', color: ACC2 },
    { date: '9 Apr', icon: '$', name: 'Dividend', sub: 'VTI Distribution', amount: '+$82.40', color: GREEN },
    { date: '8 Apr', icon: '▼', name: 'VNQ', sub: 'Sell · 10 shares @ $87', amount: '+$870', color: GREEN },
    { date: '8 Apr', icon: '⇄', name: 'Portfolio Rebalance', sub: 'Auto-rebalance executed', amount: '—', color: MUTED },
    { date: '7 Apr', icon: '▲', name: 'Microsoft Corp.', sub: 'Buy · 3 shares @ $410', amount: '-$1,230', color: ACC2 },
    { date: '5 Apr', icon: '$', name: 'Cash Deposit', sub: 'Monthly contribution', amount: '+$2,000', color: GREEN },
    { date: '2 Apr', icon: '▲', name: 'Vanguard BND', sub: 'Buy · 20 shares @ $77.50', amount: '-$1,550', color: ACC2 },
  ];

  txns.forEach((t, i) => {
    const ty = 182 + i * 72;

    // Date label (only on first of date)
    if (i === 0 || txns[i - 1].date !== t.date) {
      const prevGroupEnd = i > 0 ? 182 + i * 72 - 8 : 0;
      // already printed date if needed
    }

    els.push(rect(20, ty, 350, 62, SURF, { rx: 10, stroke: BORDER, sw: 1 }));
    els.push(circle(44, ty + 31, 14, t.color, { opacity: 0.12 }));
    els.push(text(44, ty + 36, t.icon, 11, t.color, { anchor: 'middle', fw: 700 }));
    els.push(text(66, ty + 24, t.name, 13, TEXT, { fw: 600 }));
    els.push(text(66, ty + 42, t.sub, 10, MUTED));
    els.push(text(360, ty + 24, t.date, 10, MUTED, { anchor: 'end' }));
    els.push(text(360, ty + 44, t.amount, 13, t.amount.startsWith('+') ? GREEN : t.amount === '—' ? MUTED : ACC2, { anchor: 'end', fw: 600 }));
  });

  // Bottom nav
  els.push(rect(0, 780, W, 64, SURF, { stroke: BORDER, sw: 1 }));
  const navItems = [
    { icon: '⊞', label: 'Portfolio' },
    { icon: '◈', label: 'Holdings' },
    { icon: '◉', label: 'Insights' },
    { icon: '◎', label: 'Goals' },
    { icon: '○', label: 'Profile' },
  ];
  navItems.forEach((n, i) => {
    const nx = 39 + i * 78;
    els.push(text(nx, 808, n.icon, 20, n.active ? ACC : MUTED, { anchor: 'middle' }));
    els.push(text(nx, 828, n.label, 9, n.active ? ACC : MUTED, { anchor: 'middle', fw: n.active ? 600 : 400 }));
  });

  return { name: 'Transactions', elements: els };
}

// ─── SCREEN 6: Profile / Settings ────────────────────────────────────────
function screen6() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));

  els.push(text(20, 54, '9:41', 13, TEXT, { fw: 600 }));
  els.push(text(W / 2, 96, 'Profile', 18, TEXT, { fw: 700, anchor: 'middle' }));

  // Avatar
  els.push(circle(W / 2, 160, 48, CARD));
  els.push(circle(W / 2, 160, 48, ACC, { opacity: 0.12 }));
  els.push(text(W / 2, 168, 'A', 36, ACC, { anchor: 'middle', fw: 700 }));

  els.push(text(W / 2, 226, 'Alex Rivera', 20, TEXT, { fw: 700, anchor: 'middle' }));
  els.push(text(W / 2, 246, 'Member since Jan 2022', 12, MUTED, { anchor: 'middle' }));

  // Tier badge
  els.push(rect(W / 2 - 42, 258, 84, 22, ACC, { rx: 11 }));
  els.push(text(W / 2, 273, 'PREMIUM', 9, SURF, { anchor: 'middle', fw: 700, ls: '0.08em' }));

  // Stats strip
  els.push(rect(20, 294, 350, 60, SURF, { rx: 12, stroke: BORDER, sw: 1 }));
  const stats = [
    { label: 'Age', value: '34' },
    { label: 'Invested', value: '4y 3m' },
    { label: 'Returns', value: '+12.2%' },
  ];
  stats.forEach((s, i) => {
    const sx = 76 + i * 120;
    if (i > 0) els.push(line(sx - 44, 306, sx - 44, 342, BORDER, { sw: 1 }));
    els.push(text(sx, 316, s.value, 18, TEXT, { anchor: 'middle', fw: 700 }));
    els.push(text(sx, 337, s.label, 10, MUTED, { anchor: 'middle' }));
  });

  // Settings sections
  const sections = [
    { title: 'Preferences', items: ['Investment Style', 'Risk Tolerance', 'Notification Settings'] },
    { title: 'Security', items: ['Face ID / Touch ID', 'Two-Factor Auth', 'Change Password'] },
    { title: 'Account', items: ['Connected Brokers', 'Tax Documents', 'Data Export'] },
  ];

  let sy = 370;
  sections.forEach(sec => {
    els.push(text(20, sy, sec.title.toUpperCase(), 10, MUTED, { ls: '0.08em', fw: 600 }));
    sy += 14;
    els.push(rect(20, sy, 350, sec.items.length * 48 + 2, SURF, { rx: 12, stroke: BORDER, sw: 1 }));
    sec.items.forEach((item, i) => {
      const iy = sy + 4 + i * 48;
      if (i > 0) els.push(line(36, iy, 360, iy, BORDER, { sw: 1, opacity: 0.5 }));
      els.push(text(36, iy + 26, item, 13, TEXT));
      els.push(text(360, iy + 26, '›', 16, MUTED, { anchor: 'end' }));
    });
    sy += sec.items.length * 48 + 20;
  });

  // Bottom nav
  els.push(rect(0, 780, W, 64, SURF, { stroke: BORDER, sw: 1 }));
  const navItems = [
    { icon: '⊞', label: 'Portfolio' },
    { icon: '◈', label: 'Holdings' },
    { icon: '◉', label: 'Insights' },
    { icon: '◎', label: 'Goals' },
    { icon: '○', label: 'Profile', active: true },
  ];
  navItems.forEach((n, i) => {
    const nx = 39 + i * 78;
    els.push(text(nx, 808, n.icon, 20, n.active ? ACC : MUTED, { anchor: 'middle' }));
    els.push(text(nx, 828, n.label, 9, n.active ? ACC : MUTED, { anchor: 'middle', fw: n.active ? 600 : 400 }));
  });

  return { name: 'Profile', elements: els };
}

// ─── Assemble ─────────────────────────────────────────────────────────────
const screens = [screen1(), screen2(), screen3(), screen4(), screen5(), screen6()];
const total = screens.reduce((s, sc) => s + sc.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    tagline: TAGLINE,
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'light',
    heartbeat: 406,
    elements: total,
    archetype: 'personal-finance',
    inspiration: 'Old Tom Capital (minimal.gallery) + Sparkles warm palette (lapa.ninja)',
  },
  screens: screens.map(sc => ({
    name: sc.name,
    width: W,
    height: H,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">` +
      sc.elements.map(el => {
        if (el.type === 'rect') {
          let attrs = `x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}"`;
          if (el.rx) attrs += ` rx="${el.rx}"`;
          if (el.opacity !== undefined) attrs += ` opacity="${el.opacity}"`;
          if (el.stroke) attrs += ` stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"`;
          return `<rect ${attrs}/>`;
        }
        if (el.type === 'text') {
          let attrs = `x="${el.x}" y="${el.y}" fill="${el.fill}" font-size="${el.fontSize}"`;
          if (el.fontWeight) attrs += ` font-weight="${el.fontWeight}"`;
          if (el.textAnchor) attrs += ` text-anchor="${el.textAnchor}"`;
          if (el.opacity !== undefined) attrs += ` opacity="${el.opacity}"`;
          if (el.letterSpacing) attrs += ` letter-spacing="${el.letterSpacing}"`;
          if (el.fontFamily) attrs += ` font-family="${el.fontFamily}"`;
          return `<text ${attrs}>${el.content}</text>`;
        }
        if (el.type === 'circle') {
          let attrs = `cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}"`;
          if (el.opacity !== undefined) attrs += ` opacity="${el.opacity}"`;
          if (el.stroke) attrs += ` stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"`;
          return `<circle ${attrs}/>`;
        }
        if (el.type === 'line') {
          let attrs = `x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth || 1}"`;
          if (el.opacity !== undefined) attrs += ` opacity="${el.opacity}"`;
          return `<line ${attrs}/>`;
        }
        return '';
      }).join('\n') + '</svg>',
    elements: sc.elements,
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${total} elements`);
console.log(`Written: ${SLUG}.pen`);
