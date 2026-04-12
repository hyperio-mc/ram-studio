'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'kova';
const THEME = 'dark';
const HEARTBEAT = 447;

// ── Palette ─────────────────────────────────────────────────────────────────
// Inspired by: DarkModeDesign.com's "Warm Charcoal + Gold" luxury dark palette
// (#1C1917 bg, #D4A574 accent) combined with Saaspo's bento-grid layout hegemony
const BG      = '#0F0D0A';
const SURF    = '#16130F';
const CARD    = '#1E1A14';
const CARD2   = '#241F17';
const GOLD    = '#D4A574';
const GOLD2   = '#E8C07D';
const GOLD3   = '#B8895A';
const TEXT    = '#F5EDE0';
const TEXT2   = '#C9B89A';
const MUTED   = '#7A6B57';
const RED     = '#E05A4E';
const GREEN   = '#6BBF7A';
const BORDER  = '#2A2318';

// ── Primitives ───────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, width: w, height: h, fill,
    rx: opts.rx ?? 0,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none',
    strokeWidth: opts.sw ?? 0,
  };
}
function text(x, y, content, size, fill, opts = {}) {
  return {
    type: 'text', x, y, content, fontSize: size, fill,
    fontWeight: opts.fw ?? 400,
    fontFamily: opts.font ?? 'Inter',
    textAnchor: opts.anchor ?? 'start',
    letterSpacing: opts.ls ?? 0,
    opacity: opts.opacity ?? 1,
  };
}
function circle(cx, cy, r, fill, opts = {}) {
  return {
    type: 'circle', cx, cy, r, fill,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none',
    strokeWidth: opts.sw ?? 0,
  };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return {
    type: 'line', x1, y1, x2, y2, stroke,
    strokeWidth: opts.sw ?? 1,
    opacity: opts.opacity ?? 1,
  };
}

// ── Shared components ────────────────────────────────────────────────────────
const W = 390, H = 844;

function statusBar(els) {
  els.push(rect(0, 0, W, 44, BG));
  els.push(text(16, 28, '9:41', 12, TEXT2, { fw: 600 }));
  // Signal bars
  for (let i = 0; i < 4; i++) {
    const barH = 6 + i * 3;
    els.push(rect(310 + i * 6, 22 - barH + 14, 4, barH, i < 3 ? TEXT : TEXT2, { rx: 1, opacity: i < 3 ? 1 : 0.4 }));
  }
  els.push(rect(332, 20, 14, 8, TEXT2, { rx: 2, opacity: 0.5 }));
  els.push(rect(346, 22, 3, 4, TEXT2, { rx: 1, opacity: 0.4 }));
  els.push(rect(333, 21, 11, 6, TEXT, { rx: 1.5 }));
  els.push(text(356, 28, 'KOVA', 10, GOLD, { fw: 700, ls: 1.5 }));
}

function navBar(els, active) {
  const tabs = [
    { id: 'home',      icon: '◈', label: 'Portfolio' },
    { id: 'markets',   icon: '◉', label: 'Markets' },
    { id: 'insights',  icon: '◎', label: 'Insights' },
    { id: 'activity',  icon: '◌', label: 'Activity' },
    { id: 'profile',   icon: '◫', label: 'Account' },
  ];
  els.push(rect(0, H - 80, W, 80, SURF));
  els.push(line(0, H - 80, W, H - 80, BORDER, { sw: 1, opacity: 0.8 }));
  tabs.forEach((tab, i) => {
    const x = 39 + i * 62;
    const isActive = tab.id === active;
    const col = isActive ? GOLD : MUTED;
    els.push(text(x, H - 46, tab.icon, 18, col, { anchor: 'middle', fw: isActive ? 700 : 400 }));
    els.push(text(x, H - 24, tab.label, 9, col, { anchor: 'middle', fw: isActive ? 600 : 400 }));
    if (isActive) {
      els.push(rect(x - 18, H - 80, 36, 3, GOLD, { rx: 1.5 }));
    }
  });
}

function sectionLabel(els, x, y, label) {
  els.push(text(x, y, label.toUpperCase(), 9, MUTED, { fw: 600, ls: 1.8 }));
}

// ── Screen 1: Portfolio Overview ─────────────────────────────────────────────
function screen1() {
  const els = [];
  statusBar(els);

  // Header
  els.push(rect(0, 44, W, 56, BG));
  els.push(text(20, 77, 'Portfolio', 22, TEXT, { fw: 700 }));
  els.push(text(20, 94, 'Your wealth, intelligently.', 12, TEXT2));

  // Notification bell
  els.push(circle(355, 70, 18, CARD, { stroke: BORDER, sw: 1 }));
  els.push(text(355, 74, '◔', 14, GOLD, { anchor: 'middle' }));
  els.push(circle(367, 59, 5, RED));

  // Total value hero card
  els.push(rect(16, 108, W - 32, 120, CARD, { rx: 16, stroke: BORDER, sw: 1 }));
  // Subtle gold gradient top band
  els.push(rect(16, 108, W - 32, 4, GOLD, { rx: 2, opacity: 0.4 }));
  els.push(text(28, 132, 'TOTAL PORTFOLIO VALUE', 9, MUTED, { fw: 600, ls: 1.5 }));
  els.push(text(28, 163, '$847,294', 34, TEXT, { fw: 700 }));
  els.push(text(28, 183, '.18', 18, TEXT2, { fw: 400 }));
  els.push(rect(28, 196, 70, 20, GREEN + '25', { rx: 10 }));
  els.push(text(63, 210, '+12.4% ↑', 10, GREEN, { anchor: 'middle', fw: 600 }));
  els.push(text(190, 196, 'vs last quarter', 11, TEXT2));

  // Sparkline on card
  const sparkPoints = [0,8,3,14,10,18,12,22,15,19,24,28];
  for (let i = 0; i < sparkPoints.length - 1; i++) {
    const x1 = 260 + i * 9;
    const y1 = 210 - sparkPoints[i];
    const x2 = 260 + (i+1) * 9;
    const y2 = 210 - sparkPoints[i+1];
    els.push(line(x1, y1, x2, y2, GOLD, { sw: 2, opacity: 0.9 }));
  }
  els.push(circle(260 + 11*9, 210 - 28, 3, GOLD));

  // Bento grid: 4 allocation cards
  sectionLabel(els, 20, 252, 'Allocation');

  const bentos = [
    { label: 'Equities', val: '62%', sub: '$524.9K', col: GOLD, icon: '▲', change: '+8.2%', up: true },
    { label: 'Fixed Income', val: '21%', sub: '$177.9K', col: '#6AADCB', icon: '▶', change: '+2.1%', up: true },
    { label: 'Alternatives', val: '11%', sub: '$93.2K', col: '#A88BFA', icon: '◆', change: '+4.7%', up: true },
    { label: 'Cash & MM', val: '6%', sub: '$50.8K', col: MUTED, icon: '○', change: '-0.2%', up: false },
  ];

  bentos.forEach((b, i) => {
    const col = i % 2 === 0 ? 0 : 1;
    const row = Math.floor(i / 2);
    const bx = 16 + col * 186;
    const by = 264 + row * 110;
    const bw = 178;
    const bh = 100;

    els.push(rect(bx, by, bw, bh, CARD, { rx: 14, stroke: BORDER, sw: 1 }));
    // Left color bar
    els.push(rect(bx, by, 3, bh, b.col, { rx: 1.5, opacity: 0.8 }));

    els.push(text(bx + 14, by + 22, b.icon, 13, b.col));
    els.push(text(bx + 32, by + 23, b.label, 11, TEXT2, { fw: 500 }));
    els.push(text(bx + 14, by + 52, b.val, 26, TEXT, { fw: 700 }));
    els.push(text(bx + 14, by + 70, b.sub, 11, TEXT2));
    const chCol = b.up ? GREEN : RED;
    els.push(rect(bx + 14, by + 78, 52, 14, chCol + '22', { rx: 7 }));
    els.push(text(bx + 40, by + 89, b.change, 9, chCol, { anchor: 'middle', fw: 600 }));
  });

  // Performance strip
  els.push(rect(16, 498, W - 32, 56, CARD, { rx: 14, stroke: BORDER, sw: 1 }));
  sectionLabel(els, 28, 518, '30-Day Performance');
  const perf = [
    { label: 'IRR', val: '+14.2%' },
    { label: 'Sharpe', val: '1.84' },
    { label: 'Max DD', val: '-3.1%' },
    { label: 'Vol', val: '9.2%' },
  ];
  perf.forEach((p, i) => {
    const px = 44 + i * 80;
    els.push(text(px, 536, p.val, 13, i === 0 ? GOLD : TEXT, { fw: 700, anchor: 'middle' }));
    els.push(text(px, 549, p.label, 9, MUTED, { anchor: 'middle' }));
    if (i < 3) els.push(line(px + 40, 520, px + 40, 548, BORDER, { sw: 1 }));
  });

  // Recent activity
  sectionLabel(els, 20, 578, 'Recent Activity');
  const activities = [
    { action: 'Rebalanced equities', time: '2h ago', icon: '↻', col: GOLD2 },
    { action: 'Dividends received', time: '1d ago', icon: '+', col: GREEN },
    { action: 'Risk alert triggered', time: '3d ago', icon: '!', col: RED },
  ];
  activities.forEach((a, i) => {
    const ay = 592 + i * 52;
    els.push(rect(16, ay, W - 32, 44, CARD, { rx: 12, stroke: BORDER, sw: 1 }));
    els.push(circle(40, ay + 22, 14, CARD2));
    els.push(text(40, ay + 27, a.icon, 12, a.col, { anchor: 'middle', fw: 700 }));
    els.push(text(62, ay + 18, a.action, 12, TEXT, { fw: 500 }));
    els.push(text(62, ay + 32, a.time, 10, MUTED));
    els.push(text(W - 28, ay + 22, '›', 16, MUTED, { anchor: 'middle' }));
  });

  navBar(els, 'home');
  return els;
}

// ── Screen 2: Markets ─────────────────────────────────────────────────────────
function screen2() {
  const els = [];
  statusBar(els);

  els.push(rect(0, 44, W, 56, BG));
  els.push(text(20, 77, 'Markets', 22, TEXT, { fw: 700 }));
  els.push(text(20, 94, 'Live intelligence', 12, TEXT2));

  // Search bar
  els.push(rect(16, 108, W - 32, 40, CARD, { rx: 20, stroke: BORDER, sw: 1 }));
  els.push(text(36, 132, '⌕', 14, MUTED));
  els.push(text(58, 132, 'Search assets, indices, crypto...', 12, MUTED));

  // Market overview chips
  const chips = [
    { label: 'All', active: true },
    { label: 'Equities', active: false },
    { label: 'Fixed Income', active: false },
    { label: 'Crypto', active: false },
    { label: 'Commodities', active: false },
  ];
  let chipX = 16;
  chips.forEach(c => {
    const cw = c.label.length * 8 + 20;
    els.push(rect(chipX, 160, cw, 28, c.active ? GOLD : CARD, { rx: 14, stroke: c.active ? GOLD : BORDER, sw: 1 }));
    els.push(text(chipX + cw/2, 178, c.label, 11, c.active ? BG : TEXT2, { anchor: 'middle', fw: c.active ? 700 : 400 }));
    chipX += cw + 8;
  });

  // Market sentiment card
  els.push(rect(16, 200, W - 32, 70, CARD, { rx: 14, stroke: BORDER, sw: 1 }));
  els.push(rect(16, 200, W - 32, 3, GOLD, { opacity: 0.3, rx: 2 }));
  els.push(text(28, 222, 'Market Sentiment', 11, MUTED, { fw: 600, ls: 0.5 }));
  els.push(text(28, 248, 'Cautiously Bullish', 18, GOLD, { fw: 700 }));
  // Sentiment bar
  els.push(rect(28, 258, 250, 6, CARD2, { rx: 3 }));
  els.push(rect(28, 258, 165, 6, GOLD, { rx: 3, opacity: 0.8 }));
  els.push(circle(193, 261, 5, GOLD));
  els.push(text(306, 264, '66/100', 11, GOLD2, { fw: 600 }));

  // Asset list
  sectionLabel(els, 20, 288, 'Watchlist');

  const assets = [
    { name: 'S&P 500', ticker: 'SPY', price: '5,842.14', change: '+1.23%', up: true, sparkData: [0,5,3,8,6,10,12,9,14,11,16] },
    { name: 'Apple Inc.', ticker: 'AAPL', price: '229.87', change: '+0.84%', up: true, sparkData: [0,3,2,5,4,8,6,9,7,11,10] },
    { name: 'Gold Futures', ticker: 'GC=F', price: '3,248.50', change: '+0.61%', up: true, sparkData: [0,2,4,3,6,5,7,6,9,8,10] },
    { name: 'Bitcoin', ticker: 'BTC', price: '87,450.00', change: '-2.14%', up: false, sparkData: [12,10,8,11,7,6,9,4,6,3,0] },
    { name: 'US 10Y Tsy', ticker: 'TNX', price: '4.312%', change: '-0.04%', up: false, sparkData: [8,7,8,6,7,5,6,4,5,3,2] },
    { name: 'EUR/USD', ticker: 'EUR', price: '1.0892', change: '+0.18%', up: true, sparkData: [0,1,3,2,4,3,5,6,5,7,8] },
  ];

  assets.forEach((a, i) => {
    const ay = 300 + i * 62;
    els.push(rect(16, ay, W - 32, 54, CARD, { rx: 12, stroke: BORDER, sw: 1 }));
    // Ticker badge
    els.push(rect(28, ay + 14, 40, 26, CARD2, { rx: 6 }));
    els.push(text(48, ay + 31, a.ticker, 8, GOLD2, { anchor: 'middle', fw: 700, ls: 0.5 }));
    els.push(text(78, ay + 24, a.name, 13, TEXT, { fw: 600 }));
    els.push(text(78, ay + 39, a.ticker.length <= 4 ? 'NYSE · Live' : 'MARKET · Live', 10, MUTED));
    // Micro sparkline
    for (let j = 0; j < a.sparkData.length - 1; j++) {
      const sx1 = 198 + j * 8, sy1 = ay + 38 - a.sparkData[j] * 1.2;
      const sx2 = 198 + (j+1) * 8, sy2 = ay + 38 - a.sparkData[j+1] * 1.2;
      els.push(line(sx1, sy1, sx2, sy2, a.up ? GREEN : RED, { sw: 1.5, opacity: 0.8 }));
    }
    // Price & change
    els.push(text(W - 24, ay + 24, '$' + a.price, 13, TEXT, { anchor: 'end', fw: 600 }));
    const chCol = a.up ? GREEN : RED;
    els.push(rect(W - 78, ay + 34, 54, 14, chCol + '22', { rx: 7 }));
    els.push(text(W - 51, ay + 45, a.change, 9, chCol, { anchor: 'middle', fw: 600 }));
  });

  navBar(els, 'markets');
  return els;
}

// ── Screen 3: AI Insights ────────────────────────────────────────────────────
function screen3() {
  const els = [];
  statusBar(els);

  els.push(rect(0, 44, W, 56, BG));
  els.push(text(20, 77, 'Insights', 22, TEXT, { fw: 700 }));
  els.push(text(20, 94, 'AI-powered analysis', 12, TEXT2));

  // KOVA AI score card
  els.push(rect(16, 108, W - 32, 136, CARD, { rx: 16, stroke: BORDER, sw: 1 }));
  els.push(rect(16, 108, W - 32, 4, GOLD, { opacity: 0.5, rx: 2 }));

  // Score ring (simplified)
  els.push(circle(68, 170, 44, CARD2));
  els.push(circle(68, 170, 44, 'none', { stroke: BORDER, sw: 2 }));
  els.push(circle(68, 170, 44, 'none', { stroke: GOLD, sw: 5, opacity: 0.9 }));
  // Arc segments of the ring
  for (let a = 0; a < 8; a++) {
    const angle = (a / 10) * Math.PI * 2 - Math.PI / 2;
    const x = 68 + 44 * Math.cos(angle);
    const y = 170 + 44 * Math.sin(angle);
    els.push(circle(x, y, 2, BG));
  }
  els.push(text(68, 166, '84', 22, GOLD, { anchor: 'middle', fw: 700 }));
  els.push(text(68, 181, '/100', 9, TEXT2, { anchor: 'middle' }));

  els.push(text(130, 132, 'KOVA Intelligence Score', 11, MUTED, { fw: 600, ls: 0.5 }));
  els.push(text(130, 154, 'Strong Position', 20, TEXT, { fw: 700 }));
  els.push(text(130, 172, 'Your portfolio is well-positioned', 12, TEXT2));
  els.push(text(130, 187, 'for current macro conditions.', 12, TEXT2));

  // Sub-scores
  const subScores = [
    { label: 'Diversification', val: 88, col: GREEN },
    { label: 'Risk-Adjusted', val: 79, col: GOLD },
    { label: 'Drawdown Mgmt', val: 84, col: GOLD2 },
  ];
  subScores.forEach((s, i) => {
    const sx = 130 + i * 76;
    els.push(text(sx + 22, 214, s.val.toString(), 13, s.col, { anchor: 'middle', fw: 700 }));
    els.push(text(sx + 22, 226, s.label.split(' ')[0], 8, MUTED, { anchor: 'middle' }));
  });

  // AI Insight cards — bento style
  sectionLabel(els, 20, 256, 'AI Recommendations');

  const insights = [
    {
      priority: 'HIGH',
      title: 'Reduce Tech Concentration',
      body: 'Technology sector at 34% of equities allocation. Historical risk of 8% drawdown in rate-hike cycles. Consider rotating to value.',
      col: RED,
      action: 'View Strategy',
    },
    {
      priority: 'MEDIUM',
      title: 'Fixed Income Opportunity',
      body: '10Y Treasury approaching 4.5% resistance. Short-duration bond ladder could improve risk-adjusted returns by ~1.2%.',
      col: GOLD,
      action: 'Explore Bonds',
    },
    {
      priority: 'LOW',
      title: 'Tax-Loss Harvesting Window',
      body: '3 positions eligible for harvest before Q2 close. Estimated tax benefit of $4,200 at your marginal rate.',
      col: GREEN,
      action: 'Review Now',
    },
  ];

  insights.forEach((ins, i) => {
    const iy = 268 + i * 108;
    els.push(rect(16, iy, W - 32, 100, CARD, { rx: 14, stroke: BORDER, sw: 1 }));
    els.push(rect(16, iy, 3, 100, ins.col, { rx: 1.5, opacity: 0.7 }));
    els.push(rect(28, iy + 12, ins.priority.length * 7 + 12, 16, ins.col + '22', { rx: 8 }));
    els.push(text(28 + (ins.priority.length * 7 + 12)/2, iy + 24, ins.priority, 8, ins.col, { anchor: 'middle', fw: 700, ls: 1 }));
    els.push(text(28, iy + 44, ins.title, 13, TEXT, { fw: 700 }));
    els.push(text(28, iy + 60, ins.body.substring(0, 52), 10, TEXT2));
    els.push(text(28, iy + 73, ins.body.substring(52, 104), 10, TEXT2));
    els.push(rect(W - 108, iy + 76, 84, 16, CARD2, { rx: 8 }));
    els.push(text(W - 66, iy + 88, ins.action, 9, GOLD, { anchor: 'middle', fw: 600 }));
  });

  navBar(els, 'insights');
  return els;
}

// ── Screen 4: Activity / Transactions ────────────────────────────────────────
function screen4() {
  const els = [];
  statusBar(els);

  els.push(rect(0, 44, W, 56, BG));
  els.push(text(20, 77, 'Activity', 22, TEXT, { fw: 700 }));
  els.push(text(20, 94, 'All transactions & events', 12, TEXT2));

  // Filter row
  const filters = ['All', 'Trades', 'Dividends', 'Rebalance', 'Alerts'];
  let fx = 16;
  filters.forEach((f, i) => {
    const fw2 = f.length * 8 + 16;
    els.push(rect(fx, 108, fw2, 26, i === 0 ? GOLD : CARD, { rx: 13, stroke: i === 0 ? GOLD : BORDER, sw: 1 }));
    els.push(text(fx + fw2/2, 125, f, 10, i === 0 ? BG : TEXT2, { anchor: 'middle', fw: i === 0 ? 700 : 400 }));
    fx += fw2 + 8;
  });

  // Summary row
  els.push(rect(16, 144, W - 32, 56, CARD, { rx: 12, stroke: BORDER, sw: 1 }));
  const summStats = [
    { label: 'Transactions', val: '47' },
    { label: 'Volume', val: '$124K' },
    { label: 'Realized P&L', val: '+$8.4K' },
  ];
  summStats.forEach((s, i) => {
    const sx = 56 + i * 110;
    els.push(text(sx, 164, s.val, 15, i === 2 ? GREEN : TEXT, { fw: 700, anchor: 'middle' }));
    els.push(text(sx, 179, s.label, 9, MUTED, { anchor: 'middle' }));
    if (i < 2) els.push(line(sx + 55, 150, sx + 55, 194, BORDER, { sw: 1 }));
  });

  // Timeline entries
  const months = ['April 2026', 'March 2026'];
  const entries = [
    [
      { type: 'BUY', asset: 'Vanguard Total Market', ticker: 'VTI', amount: '+$15,000', detail: '106 shares @ $141.50', time: 'Apr 10, 09:34', col: GREEN, icon: '↑' },
      { type: 'SELL', asset: 'Tesla Inc.', ticker: 'TSLA', amount: '-$8,420', detail: '28 shares @ $300.71', time: 'Apr 8, 14:12', col: RED, icon: '↓' },
      { type: 'DIV', asset: 'Apple Inc. Dividend', ticker: 'AAPL', amount: '+$247.80', detail: 'Q1 2026 ordinary', time: 'Apr 7, 08:00', col: GOLD, icon: '$' },
    ],
    [
      { type: 'REBAL', asset: 'Auto-Rebalance', ticker: 'KOVA', amount: '$4,200 moved', detail: 'Equity → Fixed Income', time: 'Mar 31, 16:00', col: '#6AADCB', icon: '⟳' },
      { type: 'BUY', asset: 'iShares Core Bonds', ticker: 'AGG', amount: '+$12,000', detail: '107 shares @ $112.15', time: 'Mar 28, 10:20', col: GREEN, icon: '↑' },
      { type: 'ALERT', asset: 'VIX Spike Alert', ticker: 'VIX', amount: 'VIX > 22', detail: 'Portfolio hedged auto.', time: 'Mar 22, 15:45', col: RED, icon: '!' },
    ],
  ];

  let yOffset = 212;
  months.forEach((month, mi) => {
    sectionLabel(els, 20, yOffset, month);
    yOffset += 16;
    entries[mi].forEach((e) => {
      const rowH = 58;
      els.push(rect(16, yOffset, W - 32, rowH, CARD, { rx: 12, stroke: BORDER, sw: 1 }));
      // Icon badge
      els.push(circle(42, yOffset + 29, 16, CARD2));
      els.push(text(42, yOffset + 34, e.icon, 13, e.col, { anchor: 'middle', fw: 700 }));
      // Type badge
      els.push(rect(66, yOffset + 11, e.type.length * 7 + 8, 14, e.col + '22', { rx: 7 }));
      els.push(text(66 + (e.type.length * 7 + 8)/2, yOffset + 22, e.type, 8, e.col, { anchor: 'middle', fw: 700 }));
      els.push(text(66, yOffset + 40, e.asset, 12, TEXT, { fw: 600 }));
      els.push(text(66, yOffset + 54, e.detail, 10, MUTED));
      els.push(text(W - 24, yOffset + 22, e.amount, 12, e.col, { anchor: 'end', fw: 600 }));
      els.push(text(W - 24, yOffset + 38, e.time, 9, MUTED, { anchor: 'end' }));
      yOffset += rowH + 6;
    });
    yOffset += 8;
  });

  navBar(els, 'activity');
  return els;
}

// ── Screen 5: Account / Settings ─────────────────────────────────────────────
function screen5() {
  const els = [];
  statusBar(els);

  els.push(rect(0, 44, W, 56, BG));
  els.push(text(20, 77, 'Account', 22, TEXT, { fw: 700 }));

  // Profile card
  els.push(rect(16, 108, W - 32, 86, CARD, { rx: 16, stroke: BORDER, sw: 1 }));
  els.push(rect(16, 108, W - 32, 4, GOLD, { opacity: 0.4, rx: 2 }));
  els.push(circle(52, 150, 26, CARD2));
  els.push(circle(52, 150, 26, 'none', { stroke: GOLD, sw: 2, opacity: 0.6 }));
  els.push(text(52, 156, 'A', 20, GOLD, { anchor: 'middle', fw: 700 }));
  els.push(text(90, 142, 'Alex Renner', 16, TEXT, { fw: 700 }));
  els.push(text(90, 160, 'alex@renner.capital', 11, MUTED));
  els.push(rect(90, 170, 64, 16, GOLD + '22', { rx: 8 }));
  els.push(text(122, 182, 'PREMIUM ✦', 9, GOLD, { anchor: 'middle', fw: 700, ls: 0.5 }));
  els.push(text(W - 28, 152, '›', 18, MUTED, { anchor: 'middle' }));

  // Stats strip
  els.push(rect(16, 202, W - 32, 54, CARD, { rx: 12, stroke: BORDER, sw: 1 }));
  const acStats = [
    { label: 'Member Since', val: '2021' },
    { label: 'Accounts', val: '4' },
    { label: 'Total Returns', val: '+147%' },
  ];
  acStats.forEach((s, i) => {
    const sx = 55 + i * 110;
    els.push(text(sx, 222, s.val, 15, i === 2 ? GREEN : TEXT, { fw: 700, anchor: 'middle' }));
    els.push(text(sx, 238, s.label, 9, MUTED, { anchor: 'middle' }));
    if (i < 2) els.push(line(sx + 55, 208, sx + 55, 250, BORDER, { sw: 1 }));
  });

  // Settings groups
  const groups = [
    {
      label: 'Preferences',
      items: [
        { icon: '◈', label: 'Investment Strategy', sub: 'Moderate Growth' },
        { icon: '◉', label: 'Risk Tolerance', sub: 'Medium (6/10)' },
        { icon: '◌', label: 'Rebalance Frequency', sub: 'Quarterly' },
        { icon: '◎', label: 'Base Currency', sub: 'USD' },
      ],
    },
    {
      label: 'Security',
      items: [
        { icon: '⊠', label: 'Two-Factor Auth', sub: 'Enabled' },
        { icon: '⊞', label: 'Biometric Login', sub: 'Face ID active' },
        { icon: '⊟', label: 'Session Timeout', sub: '15 minutes' },
      ],
    },
  ];

  let gy = 272;
  groups.forEach(g => {
    sectionLabel(els, 20, gy, g.label);
    gy += 14;
    g.items.forEach((item) => {
      const rowH = 50;
      els.push(rect(16, gy, W - 32, rowH, CARD, { rx: 12, stroke: BORDER, sw: 1 }));
      els.push(circle(40, gy + 25, 14, CARD2));
      els.push(text(40, gy + 30, item.icon, 12, GOLD, { anchor: 'middle' }));
      els.push(text(62, gy + 20, item.label, 13, TEXT, { fw: 500 }));
      els.push(text(62, gy + 35, item.sub, 10, MUTED));
      els.push(text(W - 28, gy + 27, '›', 16, MUTED, { anchor: 'middle' }));
      gy += rowH + 4;
    });
    gy += 10;
  });

  // Sign out
  els.push(rect(16, gy + 4, W - 32, 44, CARD, { rx: 12, stroke: RED + '44', sw: 1 }));
  els.push(text(W/2, gy + 31, 'Sign Out', 13, RED, { anchor: 'middle', fw: 600 }));

  navBar(els, 'profile');
  return els;
}

// ── Screen 6: Equity Detail ───────────────────────────────────────────────────
function screen6() {
  const els = [];
  statusBar(els);

  els.push(rect(0, 44, W, 56, BG));
  // Back
  els.push(text(20, 74, '← Markets', 12, TEXT2, { fw: 500 }));
  els.push(text(20, 94, 'Apple Inc.', 22, TEXT, { fw: 700 }));

  // Price hero
  els.push(rect(16, 108, W - 32, 80, CARD, { rx: 14, stroke: BORDER, sw: 1 }));
  els.push(text(28, 135, '$229.87', 28, TEXT, { fw: 700 }));
  els.push(rect(28, 148, 70, 18, GREEN + '25', { rx: 9 }));
  els.push(text(63, 161, '+$1.92 · +0.84%', 10, GREEN, { anchor: 'middle', fw: 600 }));
  els.push(text(28, 179, 'AAPL · NASDAQ · Real-time', 10, MUTED));
  // Period tabs
  const periods = ['1D', '1W', '1M', '3M', 'YTD', '1Y', 'ALL'];
  periods.forEach((p, i) => {
    const px2 = 240 + i * 22;
    els.push(rect(px2 - 9, 127, 18, 16, p === '3M' ? GOLD : 'none', { rx: 8 }));
    els.push(text(px2, 139, p, 9, p === '3M' ? BG : MUTED, { anchor: 'middle', fw: p === '3M' ? 700 : 400 }));
  });

  // Price chart (simplified line)
  els.push(rect(16, 196, W - 32, 140, CARD, { rx: 14, stroke: BORDER, sw: 1 }));
  const chartPts = [160,155,162,158,165,170,168,175,172,178,174,180,176,182,180,184,183,186,188,185,190,188,194,192,198];
  for (let i = 0; i < chartPts.length - 1; i++) {
    const cx1 = 28 + i * 13.5;
    const cy1 = 306 - chartPts[i];
    const cx2 = 28 + (i+1) * 13.5;
    const cy2 = 306 - chartPts[i+1];
    els.push(line(cx1, cy1, cx2, cy2, GOLD, { sw: 2, opacity: 0.9 }));
  }
  // Area fill (simplified via rects)
  for (let i = 0; i < chartPts.length; i++) {
    const cx = 28 + i * 13.5;
    const cy = 306 - chartPts[i];
    els.push(line(cx, cy, cx, 320, GOLD, { sw: 2, opacity: 0.06 }));
  }
  els.push(circle(28 + 24 * 13.5, 306 - 198, 4, GOLD));
  // Y labels
  ['$235', '$225', '$215'].forEach((label, i) => {
    els.push(text(W - 24, 212 + i * 50, label, 8, MUTED, { anchor: 'end' }));
  });
  // X labels
  ['Jan', 'Feb', 'Mar', 'Apr'].forEach((label, i) => {
    els.push(text(34 + i * 84, 330, label, 8, MUTED));
  });

  // Holding details
  els.push(rect(16, 344, W - 32, 72, CARD, { rx: 14, stroke: BORDER, sw: 1 }));
  sectionLabel(els, 28, 362, 'Your Position');
  const pos = [
    { label: 'Shares', val: '124' },
    { label: 'Value', val: '$28,503' },
    { label: 'Avg Cost', val: '$182.40' },
    { label: 'P&L', val: '+$5,865' },
  ];
  pos.forEach((p, i) => {
    const px2 = 50 + i * 82;
    els.push(text(px2, 385, p.val, 12, i === 3 ? GREEN : TEXT, { fw: 700, anchor: 'middle' }));
    els.push(text(px2, 400, p.label, 9, MUTED, { anchor: 'middle' }));
    if (i < 3) els.push(line(px2 + 41, 366, px2 + 41, 408, BORDER, { sw: 1 }));
  });

  // Fundamentals bento
  sectionLabel(els, 20, 432, 'Key Fundamentals');
  const fundsData = [
    { label: 'Market Cap', val: '$3.47T' },
    { label: 'P/E Ratio', val: '32.4x' },
    { label: 'Div Yield', val: '0.53%' },
    { label: 'Beta', val: '1.24' },
    { label: '52W High', val: '$260.10' },
    { label: '52W Low', val: '$164.08' },
  ];
  fundsData.forEach((f, i) => {
    const col2 = i % 3;
    const row = Math.floor(i / 3);
    const fx2 = 16 + col2 * 122;
    const fy = 444 + row * 56;
    els.push(rect(fx2, fy, 114, 48, CARD, { rx: 10, stroke: BORDER, sw: 1 }));
    els.push(text(fx2 + 10, fy + 20, f.label, 9, MUTED));
    els.push(text(fx2 + 10, fy + 38, f.val, 14, TEXT, { fw: 700 }));
  });

  // CTA
  const ctaY = 568;
  els.push(rect(16, ctaY, (W - 40)/2, 44, GOLD, { rx: 22 }));
  els.push(text(16 + (W-40)/4, ctaY + 26, 'Buy', 14, BG, { anchor: 'middle', fw: 700 }));
  els.push(rect(W/2 + 4, ctaY, (W - 40)/2, 44, CARD, { rx: 22, stroke: BORDER, sw: 1 }));
  els.push(text(W/2 + 4 + (W-40)/4, ctaY + 26, 'Sell', 14, TEXT, { anchor: 'middle', fw: 600 }));

  // KOVA AI insight strip
  els.push(rect(16, 622, W - 32, 60, CARD2, { rx: 14, stroke: GOLD + '44', sw: 1 }));
  els.push(text(28, 646, '✦ KOVA AI:', 11, GOLD, { fw: 700 }));
  els.push(text(88, 646, 'Technically strong. RSI 58, MACD bullish', 11, TEXT2));
  els.push(text(28, 662, 'crossover. Earnings beat streak intact.', 11, TEXT2));
  els.push(rect(28, 671, 52, 6, GOLD, { rx: 3, opacity: 0.5 }));
  els.push(text(86, 677, 'AI Confidence: 82%', 9, MUTED));

  navBar(els, 'markets');
  return els;
}

// ── Assemble pen ──────────────────────────────────────────────────────────────
const screens = [
  { name: 'Portfolio Overview', fn: screen1 },
  { name: 'Markets',            fn: screen2 },
  { name: 'AI Insights',        fn: screen3 },
  { name: 'Activity',           fn: screen4 },
  { name: 'Account',            fn: screen5 },
  { name: 'Equity Detail',      fn: screen6 },
];

const built = screens.map(s => {
  const els = s.fn();
  return { name: s.name, width: W, height: H, elements: els };
});

const totalEls = built.reduce((sum, s) => sum + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'KOVA — Wealth Intelligence',
    author: 'RAM',
    date: new Date().toISOString(),
    theme: THEME,
    heartbeat: HEARTBEAT,
    elements: totalEls,
    description: 'Premium wealth intelligence platform — dark warm charcoal + gold. Inspired by DarkModeDesign.com luxury dark palette and Saaspo bento-grid hegemony.',
    slug: SLUG,
    palette: { bg: BG, surface: SURF, card: CARD, accent: GOLD, accent2: GOLD2, text: TEXT, muted: MUTED },
  },
  screens: built,
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`KOVA: ${built.length} screens, ${totalEls} elements`);
console.log(`Written: ${SLUG}.pen`);
