'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'ingot';
const NAME = 'INGOT';
const W = 390, H = 844;

// ─── Palette: Warm Charcoal + Gold (darkmodedesign.com luxury dark) ───────────
const BG       = '#1C1917';
const SURF     = '#231F1B';
const CARD     = '#2C271F';
const CARD2    = '#332D23';
const ACC      = '#D4A574';  // warm gold
const ACC2     = '#E8C98B';  // bright gold highlight
const TEXT     = '#FAFAF9';
const SUB      = '#A8A29E';
const MUTED    = '#78716C';
const BORDER   = '#3D3830';
const RED      = '#F87171';
const GREEN    = '#6EE7B7';
const DIM      = '#57534E';

// ─── Primitives ───────────────────────────────────────────────────────────────
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
    type: 'text', x, y, content, fontSize: size, fill,
    fontWeight: opts.fw || 400,
    fontFamily: opts.font || 'Inter, sans-serif',
    textAnchor: opts.anchor || 'start',
    letterSpacing: opts.ls || 0,
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
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return {
    type: 'line', x1, y1, x2, y2, stroke,
    strokeWidth: opts.sw || 1,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
  };
}

// ─── Reusable components ──────────────────────────────────────────────────────
function statusBar(els) {
  els.push(rect(0, 0, W, 44, BG));
  els.push(text(20, 30, '9:41', 13, TEXT, { fw: 600 }));
  // signal dots
  for (let i = 0; i < 3; i++) els.push(circle(W - 60 + i * 8, 22, 3, TEXT, { opacity: i === 2 ? 1 : 0.5 }));
  // battery
  els.push(rect(W - 40, 16, 26, 12, 'none', { rx: 2, stroke: TEXT, sw: 1.5, opacity: 0.7 }));
  els.push(rect(W - 39, 17, 18, 10, TEXT, { rx: 1, opacity: 0.7 }));
  els.push(rect(W - 13, 19, 3, 6, TEXT, { rx: 1, opacity: 0.5 }));
}

function bottomNav(els, activeIdx) {
  const navH = 82;
  els.push(rect(0, H - navH, W, navH, SURF));
  els.push(line(0, H - navH, W, H - navH, BORDER, { sw: 0.5 }));
  const tabs = [
    { label: 'Overview', icon: 'home' },
    { label: 'Portfolio', icon: 'chart' },
    { label: 'Markets', icon: 'activity' },
    { label: 'Goals', icon: 'target' },
  ];
  const tw = W / tabs.length;
  tabs.forEach((tab, i) => {
    const cx = tw * i + tw / 2;
    const isActive = i === activeIdx;
    const col = isActive ? ACC : MUTED;
    // icon placeholder - small geometric
    if (tab.icon === 'home') {
      // house shape
      els.push(rect(cx - 9, H - 56, 18, 14, 'none', { rx: 2, stroke: col, sw: 1.5 }));
      els.push(line(cx - 12, H - 56, cx, H - 67, col, { sw: 1.5 }));
      els.push(line(cx, H - 67, cx + 12, H - 56, col, { sw: 1.5 }));
    } else if (tab.icon === 'chart') {
      els.push(rect(cx - 9, H - 60, 5, 16, col, { rx: 1, opacity: isActive ? 1 : 0.7 }));
      els.push(rect(cx - 3, H - 55, 5, 11, col, { rx: 1, opacity: isActive ? 1 : 0.7 }));
      els.push(rect(cx + 3, H - 65, 5, 21, col, { rx: 1, opacity: isActive ? 1 : 0.7 }));
    } else if (tab.icon === 'activity') {
      els.push(line(cx - 10, H - 52, cx - 5, H - 52, col, { sw: 1.5 }));
      els.push(line(cx - 5, H - 52, cx - 2, H - 63, col, { sw: 1.5 }));
      els.push(line(cx - 2, H - 63, cx + 2, H - 43, col, { sw: 1.5 }));
      els.push(line(cx + 2, H - 43, cx + 5, H - 57, col, { sw: 1.5 }));
      els.push(line(cx + 5, H - 57, cx + 10, H - 57, col, { sw: 1.5 }));
    } else {
      // target / circle
      els.push(circle(cx, H - 52, 9, 'none', { stroke: col, sw: 1.5 }));
      els.push(circle(cx, H - 52, 3, col, { opacity: isActive ? 1 : 0.7 }));
    }
    els.push(text(cx, H - 27, tab.label, 10, col, { anchor: 'middle', fw: isActive ? 600 : 400, ls: 0.3 }));
  });
}

function sectionLabel(els, x, y, label) {
  els.push(text(x, y, label.toUpperCase(), 9, ACC, { fw: 700, ls: 2 }));
}

// ─── Screen 1: Overview ───────────────────────────────────────────────────────
function screenOverview() {
  const els = [];
  // Background
  els.push(rect(0, 0, W, H, BG));

  // Status bar
  statusBar(els);

  // Header
  els.push(text(20, 80, 'Good morning,', 13, SUB, { fw: 400, ls: 0.3 }));
  els.push(text(20, 105, 'Marcus', 28, TEXT, { fw: 700, ls: -0.5 }));
  // Avatar
  els.push(circle(W - 36, 84, 22, CARD));
  els.push(circle(W - 36, 78, 9, ACC, { opacity: 0.8 }));
  els.push(rect(W - 53, 86, 34, 20, CARD, { rx: 0 }));
  // notification dot
  els.push(circle(W - 18, 66, 5, ACC));

  // Hero net worth card (editorial typographic block)
  els.push(rect(20, 124, W - 40, 140, CARD, { rx: 16 }));
  els.push(rect(20, 124, W - 40, 140, ACC, { rx: 16, opacity: 0.04 }));
  // gold accent bar left edge
  els.push(rect(20, 124, 3, 140, ACC, { rx: 1 }));

  sectionLabel(els, 40, 150, 'Net Worth');
  // Large typographic number
  els.push(text(40, 200, '$', 28, ACC, { fw: 300, opacity: 0.8 }));
  els.push(text(65, 200, '2,847,392', 40, TEXT, { fw: 800, ls: -1.5 }));
  // subtext
  els.push(text(40, 220, '+$14,230  (+0.50%)  this month', 12, GREEN, { fw: 500 }));
  // divider
  els.push(line(40, 234, W - 40, 234, BORDER, { sw: 0.5 }));
  // mini row metrics
  els.push(text(40, 252, 'Invested', 10, SUB, { fw: 400 }));
  els.push(text(40, 266, '$2.1M', 14, TEXT, { fw: 600 }));
  els.push(text(160, 252, 'Cash', 10, SUB, { fw: 400 }));
  els.push(text(160, 266, '$487K', 14, TEXT, { fw: 600 }));
  els.push(text(270, 252, 'Growth', 10, SUB, { fw: 400 }));
  els.push(text(270, 266, '+18.3%', 14, GREEN, { fw: 600 }));

  // Bento grid - asymmetric 2 cards
  const bentoy = 282;
  // Card A - wide, allocation
  els.push(rect(20, bentoy, 220, 110, CARD, { rx: 14 }));
  sectionLabel(els, 36, bentoy + 20, 'Allocation');
  // mini donut placeholder (arcs)
  const dcx = 100, dcy = bentoy + 72, dr = 30;
  els.push(circle(dcx, dcy, dr, 'none', { stroke: BORDER, sw: 8 }));
  els.push(circle(dcx, dcy, dr, 'none', { stroke: ACC, sw: 8, opacity: 0.9 }));
  // labels
  els.push(text(dcx + 38, bentoy + 60, 'Equities', 9, SUB));
  els.push(text(dcx + 38, bentoy + 74, '68%', 13, TEXT, { fw: 700 }));
  els.push(text(dcx + 38, bentoy + 88, 'Bonds 19%', 9, MUTED));
  els.push(text(dcx + 38, bentoy + 100, 'Alts 13%', 9, MUTED));

  // Card B - narrow, daily PnL
  els.push(rect(248, bentoy, 122, 110, CARD, { rx: 14 }));
  sectionLabel(els, 264, bentoy + 20, "Today's P&L");
  els.push(text(264, bentoy + 55, '+$', 11, GREEN, { fw: 500 }));
  els.push(text(283, bentoy + 55, '4,230', 20, GREEN, { fw: 800 }));
  els.push(text(264, bentoy + 74, '+0.15%', 12, GREEN, { fw: 500 }));
  // sparkline stub
  els.push(line(264, bentoy + 90, 278, bentoy + 84, GREEN, { sw: 1.5 }));
  els.push(line(278, bentoy + 84, 292, bentoy + 96, GREEN, { sw: 1.5 }));
  els.push(line(292, bentoy + 96, 306, bentoy + 80, GREEN, { sw: 1.5 }));
  els.push(line(306, bentoy + 80, 354, bentoy + 75, GREEN, { sw: 1.5 }));

  // Top movers section
  sectionLabel(els, 20, 408, 'Top Movers');
  const movers = [
    { sym: 'NVDA', name: 'NVIDIA', val: '$892.40', chg: '+4.2%', pos: true },
    { sym: 'AAPL', name: 'Apple', val: '$213.80', chg: '+1.8%', pos: true },
    { sym: 'META', name: 'Meta', val: '$574.20', chg: '-0.9%', pos: false },
  ];
  movers.forEach((m, i) => {
    const my = 422 + i * 60;
    els.push(rect(20, my, W - 40, 52, CARD, { rx: 12 }));
    // ticker badge
    els.push(rect(36, my + 14, 44, 24, CARD2, { rx: 6 }));
    els.push(text(58, my + 30, m.sym, 10, ACC, { fw: 700, anchor: 'middle', ls: 0.5 }));
    // name
    els.push(text(92, my + 24, m.name, 12, TEXT, { fw: 600 }));
    els.push(text(92, my + 38, 'NYSE · Equity', 9, MUTED));
    // price
    els.push(text(W - 36, my + 24, m.val, 13, TEXT, { fw: 600, anchor: 'end' }));
    els.push(text(W - 36, my + 38, m.chg, 12, m.pos ? GREEN : RED, { fw: 600, anchor: 'end' }));
  });

  // Bottom nav
  bottomNav(els, 0);

  return { name: 'Overview', elements: els };
}

// ─── Screen 2: Portfolio ──────────────────────────────────────────────────────
function screenPortfolio() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  els.push(text(20, 80, 'Portfolio', 26, TEXT, { fw: 800, ls: -0.8 }));
  els.push(text(20, 103, '12 positions · Updated just now', 12, SUB));

  // Period tabs
  const periods = ['1D', '1W', '1M', '3M', 'YTD', 'ALL'];
  periods.forEach((p, i) => {
    const px = 20 + i * 58;
    const isActive = i === 2;
    if (isActive) {
      els.push(rect(px - 6, 115, 44, 24, ACC, { rx: 8, opacity: 0.15 }));
    }
    els.push(text(px + 16, 131, p, 12, isActive ? ACC : MUTED, { fw: isActive ? 700 : 400, anchor: 'middle' }));
  });

  // Performance chart area
  els.push(rect(20, 148, W - 40, 180, CARD, { rx: 16 }));
  // chart line (simulated performance curve)
  const pts = [
    [36, 302], [60, 290], [80, 295], [110, 270], [140, 260],
    [170, 272], [200, 248], [230, 230], [255, 235], [270, 218],
    [300, 208], [325, 215], [350, 195], [354, 192],
  ];
  // fill under curve
  for (let i = 0; i < pts.length - 1; i++) {
    els.push(line(pts[i][0], pts[i][1], pts[i+1][0], pts[i+1][1], ACC, { sw: 2 }));
  }
  // end dot
  els.push(circle(354, 192, 4, ACC));
  els.push(circle(354, 192, 8, ACC, { opacity: 0.25 }));
  // chart labels
  els.push(text(36, 165, '$2.84M', 16, TEXT, { fw: 700 }));
  els.push(text(36, 180, 'Portfolio value', 10, SUB));
  els.push(text(W - 36, 165, '+18.3%', 14, GREEN, { fw: 700, anchor: 'end' }));
  els.push(text(W - 36, 180, 'vs S&P 500', 10, SUB, { anchor: 'end' }));
  // Y axis labels
  ['$3M', '$2.8M', '$2.5M'].forEach((lbl, i) => {
    els.push(text(32, 200 + i * 40, lbl, 8, MUTED, { anchor: 'end' }));
    els.push(line(36, 200 + i * 40, W - 24, 200 + i * 40, BORDER, { sw: 0.3 }));
  });

  // Positions list
  sectionLabel(els, 20, 345, 'Holdings');
  const positions = [
    { sym: 'NVDA', name: 'NVIDIA Corp', shares: '120 shares', val: '$107,088', chg: '+$4,320', pct: '+4.2%', wt: '38%', pos: true },
    { sym: 'AAPL', name: 'Apple Inc', shares: '450 shares', val: '$96,210', chg: '+$1,620', pct: '+1.8%', wt: '34%', pos: true },
    { sym: 'BRK.B', name: 'Berkshire B', shares: '88 shares', val: '$38,544', chg: '+$280', pct: '+0.7%', wt: '14%', pos: true },
    { sym: 'META', name: 'Meta Platforms', shares: '55 shares', val: '$31,581', chg: '-$292', pct: '-0.9%', wt: '11%', pos: false },
  ];
  positions.forEach((p, i) => {
    const py = 360 + i * 70;
    // card
    els.push(rect(20, py, W - 40, 62, CARD, { rx: 12 }));
    // weight bar (left accent strip, proportional)
    const wt = parseInt(p.wt);
    els.push(rect(20, py, 3, 62, ACC, { rx: 1, opacity: wt / 100 * 1.5 }));
    // ticker
    els.push(rect(36, py + 10, 40, 20, CARD2, { rx: 5 }));
    els.push(text(56, py + 24, p.sym, 9, ACC, { fw: 700, anchor: 'middle', ls: 0.4 }));
    // info
    els.push(text(90, py + 23, p.name, 12, TEXT, { fw: 600 }));
    els.push(text(90, py + 38, p.shares, 10, MUTED));
    // weight tag
    els.push(rect(W - 56, py + 8, 32, 16, CARD2, { rx: 4 }));
    els.push(text(W - 40, py + 20, p.wt, 9, SUB, { anchor: 'middle' }));
    // value
    els.push(text(W - 36, py + 36, p.val, 12, TEXT, { fw: 600, anchor: 'end' }));
    els.push(text(W - 36, py + 50, `${p.chg} (${p.pct})`, 10, p.pos ? GREEN : RED, { anchor: 'end' }));
  });

  bottomNav(els, 1);
  return { name: 'Portfolio', elements: els };
}

// ─── Screen 3: Markets ────────────────────────────────────────────────────────
function screenMarkets() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  els.push(text(20, 80, 'Markets', 26, TEXT, { fw: 800, ls: -0.8 }));
  els.push(text(20, 103, 'Monday, Apr 13 · Market open', 12, SUB));

  // Market indices bento - 2x2 grid
  const indices = [
    { name: 'S&P 500', val: '5,248.32', chg: '+0.82%', pos: true },
    { name: 'NASDAQ', val: '16,384.47', chg: '+1.14%', pos: true },
    { name: 'DOW', val: '39,127.14', chg: '+0.31%', pos: true },
    { name: 'VIX', val: '14.82', chg: '-5.2%', pos: true },
  ];
  indices.forEach((idx, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const cx = 20 + col * 185, cy = 120 + row * 108;
    const cw = 175;
    els.push(rect(cx, cy, cw, 98, CARD, { rx: 14 }));
    if (i === 0) els.push(rect(cx, cy, 3, 98, ACC, { rx: 1 })); // accent first card
    els.push(text(cx + 16, cy + 22, idx.name, 10, SUB, { fw: 600, ls: 1 }));
    els.push(text(cx + 16, cy + 48, idx.val, 18, TEXT, { fw: 700, ls: -0.5 }));
    els.push(text(cx + 16, cy + 68, idx.chg, 12, idx.pos ? GREEN : RED, { fw: 600 }));
    // mini sparkline
    const sp = [0, -4, -2, -8, -6, -12, -10, -15];
    sp.forEach((v, j) => {
      if (j < sp.length - 1) {
        els.push(line(cx + 16 + j * 14, cy + 84 + v, cx + 16 + (j+1) * 14, cy + 84 + sp[j+1], GREEN, { sw: 1.2 }));
      }
    });
  });

  // Trending section
  sectionLabel(els, 20, 340, 'Trending');
  const trending = [
    { sym: 'TSLA', name: 'Tesla', chg: '+6.8%', reason: 'Earnings beat', pos: true },
    { sym: 'AMZN', name: 'Amazon', chg: '+3.2%', reason: 'AWS growth', pos: true },
    { sym: 'INTC', name: 'Intel', chg: '-4.1%', reason: 'Guidance cut', pos: false },
    { sym: 'GOOG', name: 'Alphabet', chg: '+2.7%', reason: 'AI revenue', pos: true },
    { sym: 'MSFT', name: 'Microsoft', chg: '+1.5%', reason: 'Cloud demand', pos: true },
  ];
  trending.forEach((t, i) => {
    const ty = 356 + i * 62;
    els.push(rect(20, ty, W - 40, 54, CARD, { rx: 12 }));
    // rank circle
    els.push(circle(48, ty + 27, 16, CARD2));
    els.push(text(48, ty + 32, `${i+1}`, 11, SUB, { fw: 700, anchor: 'middle' }));
    // ticker
    els.push(text(78, ty + 22, t.sym, 13, TEXT, { fw: 700 }));
    els.push(text(78, ty + 38, t.reason, 10, MUTED));
    // change
    const dotW = 60;
    els.push(rect(W - 36 - dotW, ty + 16, dotW, 22, t.pos ? '#1A3A2A' : '#3A1A1A', { rx: 6 }));
    els.push(text(W - 36 - dotW / 2, ty + 31, t.chg, 12, t.pos ? GREEN : RED, { fw: 700, anchor: 'middle' }));
  });

  bottomNav(els, 2);
  return { name: 'Markets', elements: els };
}

// ─── Screen 4: Transactions ───────────────────────────────────────────────────
function screenTransactions() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  els.push(text(20, 80, 'Transactions', 24, TEXT, { fw: 800, ls: -0.6 }));

  // Search bar
  els.push(rect(20, 100, W - 40, 40, CARD, { rx: 12 }));
  els.push(circle(44, 120, 8, 'none', { stroke: MUTED, sw: 1.5 }));
  els.push(line(50, 126, 54, 130, MUTED, { sw: 1.5 }));
  els.push(text(62, 125, 'Search transactions…', 12, DIM));

  // Filter chips
  const filters = ['All', 'Buys', 'Sells', 'Dividends', 'Fees'];
  let fx = 20;
  filters.forEach((f, i) => {
    const fw2 = f.length * 7 + 20;
    els.push(rect(fx, 150, fw2, 26, i === 0 ? ACC : CARD2, { rx: 13 }));
    els.push(text(fx + fw2 / 2, 167, f, 11, i === 0 ? BG : SUB, { anchor: 'middle', fw: i === 0 ? 700 : 400 }));
    fx += fw2 + 8;
  });

  // Monthly group
  els.push(text(20, 198, 'April 2026', 11, MUTED, { fw: 600, ls: 1 }));
  els.push(text(W - 20, 198, '+$18,432', 11, GREEN, { fw: 600, anchor: 'end' }));
  els.push(line(20, 205, W - 20, 205, BORDER, { sw: 0.4 }));

  const txns = [
    { action: 'BUY', sym: 'NVDA', desc: '15 shares @ $892.40', val: '-$13,386', date: 'Apr 11', pos: false, color: '#3A82FF' },
    { action: 'DIV', sym: 'AAPL', desc: 'Quarterly dividend', val: '+$412', date: 'Apr 8', pos: true, color: ACC },
    { action: 'SELL', sym: 'TSLA', desc: '10 shares @ $248.30', val: '+$2,483', date: 'Apr 5', pos: true, color: RED },
    { action: 'BUY', sym: 'BRK.B', desc: '8 shares @ $438.20', val: '-$3,506', date: 'Apr 3', pos: false, color: '#3A82FF' },
    { action: 'DIV', sym: 'MSFT', desc: 'Quarterly dividend', val: '+$318', date: 'Apr 1', pos: true, color: ACC },
  ];
  txns.forEach((t, i) => {
    const ty = 215 + i * 70;
    els.push(rect(20, ty, W - 40, 62, CARD, { rx: 12 }));
    // action badge
    const badgeW = 40;
    els.push(rect(36, ty + 16, badgeW, 20, CARD2, { rx: 5 }));
    els.push(text(36 + badgeW / 2, ty + 30, t.action, 9, t.color, { fw: 700, anchor: 'middle', ls: 0.5 }));
    // info
    els.push(text(92, ty + 26, t.sym, 13, TEXT, { fw: 700 }));
    els.push(text(92, ty + 42, t.desc, 10, MUTED));
    // value and date
    els.push(text(W - 36, ty + 26, t.val, 13, t.pos ? GREEN : TEXT, { fw: 700, anchor: 'end' }));
    els.push(text(W - 36, ty + 42, t.date, 10, MUTED, { anchor: 'end' }));
  });

  bottomNav(els, 0);
  return { name: 'Transactions', elements: els };
}

// ─── Screen 5: Goals ──────────────────────────────────────────────────────────
function screenGoals() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  els.push(text(20, 78, 'Goals', 26, TEXT, { fw: 800, ls: -0.8 }));
  els.push(text(20, 100, '3 active · 2 completed', 12, SUB));

  // Overall progress card
  els.push(rect(20, 116, W - 40, 100, CARD, { rx: 16 }));
  els.push(rect(20, 116, 3, 100, ACC, { rx: 1 }));
  sectionLabel(els, 40, 135, 'Total progress');
  els.push(text(40, 168, '68%', 36, ACC, { fw: 800, ls: -1 }));
  els.push(text(40, 187, 'across all goals this year', 11, MUTED));
  // Progress bar
  const bary = 202, barW = W - 80;
  els.push(rect(40, bary, barW, 6, CARD2, { rx: 3 }));
  els.push(rect(40, bary, barW * 0.68, 6, ACC, { rx: 3 }));

  // Goals list
  const goals = [
    {
      title: 'Emergency Fund', emoji: '🛡',
      target: '$50,000', current: '$38,200', pct: 76,
      deadline: 'Jun 2026', status: 'On track',
    },
    {
      title: 'Down Payment', emoji: '🏠',
      target: '$200,000', current: '$112,000', pct: 56,
      deadline: 'Dec 2027', status: 'On track',
    },
    {
      title: 'Retirement 2045', emoji: '🌅',
      target: '$4,000,000', current: '$2,847,392', pct: 71,
      deadline: 'Jan 2045', status: 'Ahead',
    },
  ];

  goals.forEach((g, i) => {
    const gy = 235 + i * 150;
    els.push(rect(20, gy, W - 40, 138, CARD, { rx: 16 }));
    // header
    els.push(text(36, gy + 28, g.emoji, 20, TEXT));
    els.push(text(64, gy + 24, g.title, 14, TEXT, { fw: 700 }));
    // status chip
    const chipW = g.status.length * 6 + 16;
    els.push(rect(W - 36 - chipW, gy + 12, chipW, 20, '#1A3A2A', { rx: 6 }));
    els.push(text(W - 36 - chipW / 2, gy + 26, g.status, 10, GREEN, { anchor: 'middle', fw: 600 }));
    els.push(text(64, gy + 40, `Due ${g.deadline}`, 10, MUTED));
    // amounts
    els.push(line(36, gy + 52, W - 36, gy + 52, BORDER, { sw: 0.4 }));
    els.push(text(36, gy + 70, 'Current', 9, MUTED));
    els.push(text(36, gy + 86, g.current, 15, TEXT, { fw: 700 }));
    els.push(text(W - 36, gy + 70, 'Target', 9, MUTED, { anchor: 'end' }));
    els.push(text(W - 36, gy + 86, g.target, 15, TEXT, { fw: 700, anchor: 'end' }));
    // progress bar
    const gbarY = gy + 104;
    els.push(rect(36, gbarY, W - 72, 8, CARD2, { rx: 4 }));
    const fillColor = g.pct > 70 ? ACC : g.pct > 50 ? '#6EE7B7' : '#FBBF24';
    els.push(rect(36, gbarY, (W - 72) * g.pct / 100, 8, fillColor, { rx: 4 }));
    els.push(text(36, gbarY + 20, `${g.pct}% complete`, 10, SUB));
    els.push(text(W - 36, gbarY + 20, `$${((parseInt(g.target.replace(/[^0-9]/g,'')) - parseInt(g.current.replace(/[^0-9]/g,''))) / 1000).toFixed(0)}K to go`, 10, MUTED, { anchor: 'end' }));
  });

  bottomNav(els, 3);
  return { name: 'Goals', elements: els };
}

// ─── Screen 6: Settings / Profile ─────────────────────────────────────────────
function screenSettings() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  // Profile header - editorial full-bleed strip
  els.push(rect(0, 44, W, 180, CARD));
  // Gold gradient overlay at bottom
  els.push(rect(0, 160, W, 64, BG, { opacity: 0.6 }));
  // Monogram
  els.push(circle(W / 2, 110, 42, BG));
  els.push(circle(W / 2, 110, 42, ACC, { opacity: 0.15, stroke: ACC, sw: 1 }));
  els.push(text(W / 2, 120, 'MK', 26, ACC, { fw: 800, anchor: 'middle', ls: 1 }));
  // name
  els.push(text(W / 2, 174, 'Marcus Kim', 20, TEXT, { fw: 700, anchor: 'middle', ls: -0.3 }));
  els.push(text(W / 2, 193, 'Premium Member since 2019', 11, SUB, { anchor: 'middle' }));

  // Plan tag
  const planW = 90;
  els.push(rect(W / 2 - planW / 2, 202, planW, 22, ACC, { rx: 11 }));
  els.push(text(W / 2, 217, '✦ PLATINUM', 10, BG, { fw: 800, anchor: 'middle', ls: 1 }));

  // Settings sections
  const sections = [
    {
      label: 'Account',
      items: ['Personal Information', 'Security & 2FA', 'Linked Accounts', 'Tax Documents'],
    },
    {
      label: 'Preferences',
      items: ['Notifications', 'Display Currency', 'Privacy Controls'],
    },
  ];

  let sy = 244;
  sections.forEach(sec => {
    sectionLabel(els, 20, sy + 14, sec.label);
    sy += 24;
    els.push(rect(20, sy, W - 40, sec.items.length * 54 + 8, CARD, { rx: 16 }));
    sec.items.forEach((item, ii) => {
      const iy = sy + 8 + ii * 54;
      if (ii > 0) els.push(line(56, iy, W - 36, iy, BORDER, { sw: 0.3 }));
      els.push(text(40, iy + 30, item, 14, TEXT));
      // chevron
      els.push(line(W - 40, iy + 22, W - 34, iy + 28, SUB, { sw: 1.5 }));
      els.push(line(W - 34, iy + 28, W - 40, iy + 34, SUB, { sw: 1.5 }));
    });
    sy += sec.items.length * 54 + 8 + 20;
  });

  // Logout button
  els.push(rect(20, sy + 10, W - 40, 46, CARD, { rx: 14 }));
  els.push(text(W / 2, sy + 38, 'Sign Out', 14, RED, { anchor: 'middle', fw: 600 }));

  // version
  els.push(text(W / 2, sy + 80, 'INGOT v2.4.1 · build 513', 10, DIM, { anchor: 'middle' }));

  bottomNav(els, 0);
  return { name: 'Settings', elements: els };
}

// ─── Assemble pen ──────────────────────────────────────────────────────────────
const screens = [
  screenOverview(),
  screenPortfolio(),
  screenMarkets(),
  screenTransactions(),
  screenGoals(),
  screenSettings(),
];

const totalElements = screens.reduce((s, sc) => s + sc.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'INGOT — Wealth Intelligence',
    author: 'RAM',
    date: new Date().toISOString(),
    theme: 'dark',
    heartbeat: 513,
    palette: {
      bg: BG, surface: SURF, card: CARD,
      accent: ACC, accent2: ACC2,
      text: TEXT, muted: MUTED,
    },
    inspiration: 'darkmodedesign.com luxury dark (Mortons, 108 Supply) + Godly type-first editorial + Land-book bento grids',
    elements: totalElements,
  },
  screens: screens.map(sc => ({
    name: sc.name,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"></svg>`,
    elements: sc.elements,
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
