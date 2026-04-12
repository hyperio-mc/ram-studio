'use strict';
const fs = require('fs');
const path = require('path');

// ─── AURIC ────────────────────────────────────────────────────────────────────
// Premium wealth intelligence platform
// Inspired by: DarkModeDesign.com's "Warm Charcoal + Gold" luxury pattern
//              Land-book.com's bento grid SaaS layouts
// Theme: DARK  Heartbeat: ongoing
// Palette: Warm Charcoal #1C1917, Gold #D4A574, Teal #6DB89A

const SLUG = 'auric';
const W = 390, H = 844;

// Palette
const BG      = '#1C1917';
const SURF    = '#262220';
const CARD    = '#302C29';
const CARD2   = '#3A352F';
const TEXT    = '#FAFAF9';
const MUTED   = '#A8A29E';
const GOLD    = '#D4A574';
const GOLD2   = '#E8C99A';
const TEAL    = '#6DB89A';
const RED     = '#E07070';
const BORDER  = 'rgba(212,165,116,0.15)';

// ─── primitives ───────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return { type: 'rect', x, y, width: w, height: h, fill, rx: opts.rx || 0,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
    stroke: opts.stroke || 'none', strokeWidth: opts.sw || 0 };
}
function text(x, y, content, size, fill, opts = {}) {
  return { type: 'text', x, y, content: String(content), fontSize: size, fill,
    fontWeight: opts.fw || 400, fontFamily: opts.font || 'system-ui',
    textAnchor: opts.anchor || 'start', letterSpacing: opts.ls || 0,
    opacity: opts.opacity !== undefined ? opts.opacity : 1 };
}
function circle(cx, cy, r, fill, opts = {}) {
  return { type: 'circle', cx, cy, r, fill,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
    stroke: opts.stroke || 'none', strokeWidth: opts.sw || 0 };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return { type: 'line', x1, y1, x2, y2, stroke,
    strokeWidth: opts.sw || 1, opacity: opts.opacity !== undefined ? opts.opacity : 1 };
}

// ─── component helpers ────────────────────────────────────────────────────────
function statusBar(elements) {
  elements.push(rect(0, 0, W, 44, BG));
  elements.push(text(20, 29, '9:41', 13, TEXT, { fw: 600 }));
  elements.push(text(280, 29, '●●●', 10, TEXT, { opacity: 0.7 }));
  elements.push(text(322, 29, '▲', 10, TEXT, { opacity: 0.7 }));
  elements.push(text(344, 29, '⬡', 12, TEXT, { opacity: 0.7 }));
  elements.push(rect(362, 20, 22, 11, 'none', { rx: 2, stroke: TEXT, sw: 1, opacity: 0.6 }));
  elements.push(rect(363, 21, 16, 9, TEXT, { rx: 1, opacity: 0.8 }));
}

function bottomNav(elements, active) {
  elements.push(rect(0, 790, W, 54, SURF));
  elements.push(line(0, 790, W, 790, BORDER, { sw: 1 }));
  const tabs = [
    { icon: '⌂', label: 'Home', id: 0 },
    { icon: '◈', label: 'Portfolio', id: 1 },
    { icon: '◎', label: 'Markets', id: 2 },
    { icon: '≋', label: 'Activity', id: 3 },
    { icon: '⊙', label: 'Profile', id: 4 },
  ];
  tabs.forEach((tab, i) => {
    const x = 39 + i * 78;
    const isActive = tab.id === active;
    const col = isActive ? GOLD : MUTED;
    elements.push(text(x, 815, tab.icon, 18, col, { anchor: 'middle', fw: isActive ? 600 : 400 }));
    elements.push(text(x, 831, tab.label, 10, col, { anchor: 'middle', ls: 0.3 }));
    if (isActive) {
      elements.push(rect(x - 16, 788, 32, 2, GOLD, { rx: 1 }));
    }
  });
}

// Gold sparkle accent dots
function accentDots(elements) {
  const positions = [[340, 120], [25, 200], [360, 310], [18, 450]];
  positions.forEach(([cx, cy]) => {
    elements.push(circle(cx, cy, 2, GOLD, { opacity: 0.35 }));
  });
}

// Small sparkle lines (grain-like marks)
function grainAccents(elements, yStart, yEnd) {
  for (let i = 0; i < 8; i++) {
    const x = 30 + Math.floor(i * 48.5);
    const y = yStart + Math.floor((i % 3) * 12);
    if (y < yEnd) {
      elements.push(line(x, y, x + 4, y + 1, GOLD, { sw: 0.5, opacity: 0.12 }));
    }
  }
}

// ─── SCREEN 1: Home Dashboard ──────────────────────────────────────────────
function screenHome() {
  const el = [];
  el.push(rect(0, 0, W, H, BG));
  statusBar(el);
  accentDots(el);

  // Header row
  el.push(text(20, 72, 'Good evening,', 13, MUTED));
  el.push(text(20, 93, 'Alexander', 22, TEXT, { fw: 700, ls: -0.3 }));
  el.push(circle(358, 78, 22, CARD, { stroke: GOLD, sw: 1.5 }));
  el.push(text(358, 83, 'A', 16, GOLD, { anchor: 'middle', fw: 700 }));

  // Divider
  el.push(line(20, 108, 370, 108, BORDER, { sw: 1 }));

  // Hero portfolio value — oversized typography (main design statement)
  el.push(text(20, 138, 'TOTAL WEALTH', 10, GOLD, { fw: 700, ls: 2.5 }));
  el.push(text(20, 200, '$847,290', 56, TEXT, { fw: 700, ls: -1.5 }));
  el.push(rect(20, 212, 102, 22, 'rgba(109,184,154,0.15)', { rx: 4 }));
  el.push(text(28, 227, '▲ +2.84%', 12, TEAL, { fw: 600 }));
  el.push(text(130, 227, 'today', 12, MUTED));

  grainAccents(el, 145, 170);

  // Sparkline chart background
  el.push(rect(20, 240, 350, 80, CARD, { rx: 12 }));
  el.push(rect(20, 240, 350, 80, 'none', { rx: 12, stroke: BORDER, sw: 1 }));

  // Sparkline path (simulated with lines)
  const pts = [
    [40, 295], [70, 285], [100, 290], [130, 275], [160, 280],
    [190, 262], [220, 268], [250, 255], [280, 248], [310, 252], [340, 244], [355, 247]
  ];
  for (let i = 0; i < pts.length - 1; i++) {
    el.push(line(pts[i][0], pts[i][1], pts[i+1][0], pts[i+1][1], GOLD, { sw: 2, opacity: 0.85 }));
  }
  // Area fill (simulated rows)
  for (let j = 0; j < 8; j++) {
    el.push(line(40, 295 + j, 355, 250 + j, GOLD, { sw: 0.5, opacity: 0.04 + j * 0.01 }));
  }
  el.push(circle(355, 247, 4, GOLD));
  el.push(circle(355, 247, 7, GOLD, { opacity: 0.2 }));

  // Time range pills
  const ranges = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];
  ranges.forEach((r, i) => {
    const x = 22 + i * 56;
    const isActive = r === '1M';
    el.push(rect(x + 4, 246, 36, 16, isActive ? GOLD : 'transparent', { rx: 8 }));
    el.push(text(x + 22, 258, r, 9, isActive ? BG : MUTED, { anchor: 'middle', fw: isActive ? 700 : 400 }));
  });

  // BENTO GRID — 4 metric cards (inspired by Land-book SaaS bento trend)
  // Row 1: two wide cards
  const bentoCards = [
    { x: 20, y: 338, w: 165, h: 90, label: 'Invested', value: '$624K', sub: '73.7% of total', trend: null },
    { x: 205, y: 338, w: 165, h: 90, label: 'Today\'s P&L', value: '+$23,410', sub: 'realized gains', trend: '+' },
  ];
  bentoCards.forEach(c => {
    el.push(rect(c.x, c.y, c.w, c.h, CARD, { rx: 12 }));
    el.push(rect(c.x, c.y, c.w, c.h, 'none', { rx: 12, stroke: BORDER, sw: 1 }));
    el.push(text(c.x + 14, c.y + 22, c.label, 11, MUTED, { fw: 500, ls: 0.5 }));
    const valColor = c.trend === '+' ? TEAL : TEXT;
    el.push(text(c.x + 14, c.y + 54, c.value, 22, valColor, { fw: 700, ls: -0.5 }));
    el.push(text(c.x + 14, c.y + 72, c.sub, 11, MUTED));
  });

  // Row 2: three small cards
  const smallCards = [
    { x: 20, y: 438, w: 103, h: 76, label: 'Cash', value: '$48K', sub: '5.7%' },
    { x: 133, y: 438, w: 103, h: 76, label: 'Yield', value: '4.2%', sub: 'ann. avg' },
    { x: 247, y: 438, w: 123, h: 76, label: 'IRR', value: '18.6%', sub: 'inception' },
  ];
  smallCards.forEach(c => {
    el.push(rect(c.x, c.y, c.w, c.h, CARD, { rx: 12 }));
    el.push(rect(c.x, c.y, c.w, c.h, 'none', { rx: 12, stroke: BORDER, sw: 1 }));
    el.push(text(c.x + 12, c.y + 20, c.label, 10, MUTED, { fw: 500, ls: 0.4 }));
    el.push(text(c.x + 12, c.y + 47, c.value, 20, GOLD, { fw: 700, ls: -0.3 }));
    el.push(text(c.x + 12, c.y + 63, c.sub, 10, MUTED));
  });

  // Gold accent bar on top card
  el.push(rect(20, 338, 3, 90, GOLD, { rx: 1.5 }));

  // Top movers section
  el.push(text(20, 536, 'TOP MOVERS', 10, GOLD, { fw: 700, ls: 2.5 }));
  el.push(text(330, 536, 'See all →', 11, MUTED));

  const movers = [
    { sym: 'NVDA', name: 'NVIDIA', pct: '+5.2%', val: '+$8,430', up: true },
    { sym: 'MSFT', name: 'Microsoft', pct: '+1.8%', val: '+$2,190', up: true },
    { sym: 'TSLA', name: 'Tesla', pct: '-2.1%', val: '-$1,840', up: false },
  ];
  movers.forEach((m, i) => {
    const y = 552 + i * 62;
    el.push(rect(20, y, 350, 54, CARD, { rx: 10 }));
    // Ticker pill
    el.push(rect(20, y, 350, 54, 'none', { rx: 10, stroke: BORDER, sw: 1 }));
    el.push(rect(24, y + 11, 46, 32, m.up ? 'rgba(109,184,154,0.12)' : 'rgba(224,112,112,0.12)', { rx: 6 }));
    el.push(text(47, y + 31, m.sym, 11, m.up ? TEAL : RED, { anchor: 'middle', fw: 700, ls: 0.5 }));
    el.push(text(80, y + 23, m.name, 13, TEXT, { fw: 600 }));
    el.push(text(80, y + 39, 'Equity · US', 11, MUTED));
    el.push(text(350, y + 23, m.pct, 13, m.up ? TEAL : RED, { anchor: 'end', fw: 700 }));
    el.push(text(350, y + 39, m.val, 11, MUTED, { anchor: 'end' }));
    // Tiny sparkline
    const sp = m.up
      ? [[240,y+32],[250,y+28],[260,y+30],[270,y+24],[280,y+26],[290,y+20],[300,y+22]]
      : [[240,y+22],[250,y+26],[260,y+24],[270,y+28],[280,y+26],[290,y+32],[300,y+30]];
    for (let k = 0; k < sp.length - 1; k++) {
      el.push(line(sp[k][0], sp[k][1], sp[k+1][0], sp[k+1][1],
        m.up ? TEAL : RED, { sw: 1.5, opacity: 0.7 }));
    }
  });

  bottomNav(el, 0);
  return { name: 'Home', elements: el };
}

// ─── SCREEN 2: Portfolio ────────────────────────────────────────────────────
function screenPortfolio() {
  const el = [];
  el.push(rect(0, 0, W, H, BG));
  statusBar(el);
  accentDots(el);

  el.push(text(20, 72, 'Portfolio', 24, TEXT, { fw: 700, ls: -0.5 }));
  el.push(text(20, 94, 'Asset allocation overview', 13, MUTED));

  // Donut chart (simulated with concentric rings + arcs via circles)
  const cx = 195, cy = 220, r = 85;
  // Background ring
  el.push(circle(cx, cy, r, 'none', { stroke: CARD2, sw: 22 }));
  // Segments simulated via colored strokes (arc approximation with line stacks)
  // Equities 64% — gold
  for (let a = -90; a < 140; a += 3) {
    const rad = a * Math.PI / 180;
    const x1 = cx + (r - 11) * Math.cos(rad);
    const y1 = cy + (r - 11) * Math.sin(rad);
    const x2 = cx + (r + 11) * Math.cos(rad);
    const y2 = cy + (r + 11) * Math.sin(rad);
    el.push(line(x1, y1, x2, y2, GOLD, { sw: 2.5, opacity: 0.85 }));
  }
  // Fixed income 20% — teal
  for (let a = 140; a < 212; a += 3) {
    const rad = a * Math.PI / 180;
    const x1 = cx + (r - 11) * Math.cos(rad);
    const y1 = cy + (r - 11) * Math.sin(rad);
    const x2 = cx + (r + 11) * Math.cos(rad);
    const y2 = cy + (r + 11) * Math.sin(rad);
    el.push(line(x1, y1, x2, y2, TEAL, { sw: 2.5, opacity: 0.85 }));
  }
  // Cash 6% — muted
  for (let a = 212; a < 234; a += 3) {
    const rad = a * Math.PI / 180;
    const x1 = cx + (r - 11) * Math.cos(rad);
    const y1 = cy + (r - 11) * Math.sin(rad);
    const x2 = cx + (r + 11) * Math.cos(rad);
    const y2 = cy + (r + 11) * Math.sin(rad);
    el.push(line(x1, y1, x2, y2, MUTED, { sw: 2.5, opacity: 0.7 }));
  }
  // Alt 10% — red/accent
  for (let a = 234; a < 270; a += 3) {
    const rad = a * Math.PI / 180;
    const x1 = cx + (r - 11) * Math.cos(rad);
    const y1 = cy + (r - 11) * Math.sin(rad);
    const x2 = cx + (r + 11) * Math.cos(rad);
    const y2 = cy + (r + 11) * Math.sin(rad);
    el.push(line(x1, y1, x2, y2, GOLD2, { sw: 2.5, opacity: 0.7 }));
  }
  // Center labels
  el.push(circle(cx, cy, 55, SURF));
  el.push(text(cx, cy - 10, '64%', 26, TEXT, { fw: 700, ls: -0.5, anchor: 'middle' }));
  el.push(text(cx, cy + 10, 'EQUITIES', 9, GOLD, { fw: 700, ls: 2, anchor: 'middle' }));

  // Legend
  const legend = [
    { label: 'Equities', pct: '64%', col: GOLD },
    { label: 'Fixed Inc.', pct: '20%', col: TEAL },
    { label: 'Alts', pct: '10%', col: GOLD2 },
    { label: 'Cash', pct: '6%', col: MUTED },
  ];
  legend.forEach((l, i) => {
    const x = 20 + (i % 2) * 185;
    const y = 320 + Math.floor(i / 2) * 28;
    el.push(circle(x + 6, y - 4, 5, l.col));
    el.push(text(x + 16, y, l.label, 12, TEXT));
    el.push(text(x + 140, y, l.pct, 12, l.col, { fw: 700, anchor: 'end' }));
  });

  // Holdings list
  el.push(line(20, 382, 370, 382, BORDER, { sw: 1 }));
  el.push(text(20, 402, 'HOLDINGS', 10, GOLD, { fw: 700, ls: 2.5 }));
  el.push(text(280, 402, '12 assets', 11, MUTED));

  const holdings = [
    { sym: 'NVDA', alloc: '18.4%', val: '$155,902', delta: '+5.2%', up: true },
    { sym: 'AAPL', alloc: '14.2%', val: '$120,115', delta: '+0.9%', up: true },
    { sym: 'MSFT', alloc: '12.1%', val: '$102,442', delta: '+1.8%', up: true },
    { sym: 'BTC',  alloc: '8.6%',  val: '$72,808',  delta: '-0.4%', up: false },
    { sym: 'GOOGL',alloc: '7.3%',  val: '$61,850',  delta: '+2.3%', up: true },
    { sym: 'TSLA', alloc: '5.2%',  val: '$44,060',  delta: '-2.1%', up: false },
  ];

  holdings.forEach((h, i) => {
    const y = 418 + i * 56;
    el.push(rect(20, y, 350, 48, CARD, { rx: 10 }));
    el.push(rect(20, y, 350, 48, 'none', { rx: 10, stroke: BORDER, sw: 1 }));
    // Allocation bar (left accent)
    const barW = Math.round(parseFloat(h.alloc) * 2);
    el.push(rect(20, y + 44, barW, 3, GOLD, { rx: 1, opacity: 0.4 }));
    el.push(text(28, y + 20, h.sym, 14, TEXT, { fw: 700 }));
    el.push(text(28, y + 36, h.alloc + ' of portfolio', 11, MUTED));
    el.push(text(350, y + 20, h.val, 14, TEXT, { fw: 600, anchor: 'end' }));
    el.push(text(350, y + 36, h.delta, 11, h.up ? TEAL : RED, { anchor: 'end', fw: 600 }));
  });

  bottomNav(el, 1);
  return { name: 'Portfolio', elements: el };
}

// ─── SCREEN 3: Asset Detail ─────────────────────────────────────────────────
function screenAsset() {
  const el = [];
  el.push(rect(0, 0, W, H, BG));
  statusBar(el);
  accentDots(el);

  // Back arrow + asset header
  el.push(text(20, 72, '←', 18, GOLD, { fw: 600 }));
  el.push(text(195, 72, 'NVIDIA Corp.', 16, TEXT, { fw: 700, anchor: 'middle' }));
  el.push(text(195, 88, 'NVDA · NASDAQ', 11, MUTED, { anchor: 'middle' }));

  // Price hero — extreme scale contrast (inspired by minimal.gallery typography trend)
  el.push(text(20, 140, '$874.22', 52, TEXT, { fw: 700, ls: -1.5 }));
  el.push(rect(20, 152, 120, 22, 'rgba(109,184,154,0.15)', { rx: 4 }));
  el.push(text(28, 167, '▲ +$43.67  +5.2%', 12, TEAL, { fw: 600 }));
  el.push(text(20, 182, 'Apr 9, 2026  ·  Market closed', 11, MUTED));

  // Price chart with glass panel (glassmorphism in dark context — from DarkModeDesign.com)
  el.push(rect(20, 198, 350, 130, CARD, { rx: 14 }));
  el.push(rect(20, 198, 350, 130, 'none', { rx: 14, stroke: BORDER, sw: 1 }));

  // Chart line
  const chartPts = [
    [36, 298], [65, 278], [95, 290], [125, 268], [155, 272],
    [185, 248], [215, 258], [245, 240], [275, 232], [305, 238], [340, 220]
  ];
  for (let i = 0; i < chartPts.length - 1; i++) {
    el.push(line(chartPts[i][0], chartPts[i][1], chartPts[i+1][0], chartPts[i+1][1],
      GOLD, { sw: 2.5 }));
  }
  // Area fill
  for (let j = 0; j < 10; j++) {
    el.push(line(36, 298 + j * 2, 340, 220 + j * 2, GOLD, { sw: 0.8, opacity: 0.025 }));
  }
  el.push(circle(340, 220, 5, GOLD));
  el.push(circle(340, 220, 9, GOLD, { opacity: 0.2 }));

  // Crosshair label
  el.push(rect(308, 202, 55, 18, GOLD, { rx: 4 }));
  el.push(text(335, 215, '$874.22', 9, BG, { anchor: 'middle', fw: 700 }));

  // Time range tabs
  const ranges = ['1D', '5D', '1M', '6M', '1Y'];
  ranges.forEach((r, i) => {
    const x = 38 + i * 66;
    const active = r === '1M';
    el.push(rect(x - 14, 315, 36, 16, active ? GOLD : 'transparent', { rx: 8 }));
    el.push(text(x, 327, r, 9, active ? BG : MUTED, { anchor: 'middle', fw: active ? 700 : 400 }));
  });

  // Your position card — glassmorphism panel
  el.push(rect(20, 340, 350, 96, 'rgba(212,165,116,0.07)', { rx: 14 }));
  el.push(rect(20, 340, 350, 96, 'none', { rx: 14, stroke: GOLD, sw: 1, opacity: 0.3 }));
  el.push(text(34, 360, 'YOUR POSITION', 10, GOLD, { fw: 700, ls: 2 }));
  const pos = [
    { label: 'Shares', value: '178.4' },
    { label: 'Avg Cost', value: '$501.18' },
    { label: 'Market Val', value: '$155,902' },
    { label: 'Total P&L', value: '+$65,942' },
  ];
  pos.forEach((p, i) => {
    const x = 34 + (i % 2) * 170;
    const y = 382 + Math.floor(i / 2) * 34;
    el.push(text(x, y - 2, p.label, 10, MUTED));
    const col = p.value.startsWith('+') ? TEAL : TEXT;
    el.push(text(x, y + 14, p.value, 15, col, { fw: 700 }));
  });

  // Key stats
  el.push(text(20, 455, 'KEY STATS', 10, GOLD, { fw: 700, ls: 2.5 }));
  const stats = [
    { label: 'Mkt Cap', val: '$2.14T' }, { label: 'P/E Ratio', val: '38.2' },
    { label: '52W High', val: '$974.00' }, { label: '52W Low', val: '$455.39' },
    { label: 'Volume', val: '41.2M' }, { label: 'Beta', val: '1.82' },
  ];
  stats.forEach((s, i) => {
    const x = 20 + (i % 3) * 117;
    const y = 472 + Math.floor(i / 3) * 52;
    el.push(rect(x, y, 110, 44, CARD, { rx: 8 }));
    el.push(rect(x, y, 110, 44, 'none', { rx: 8, stroke: BORDER, sw: 1 }));
    el.push(text(x + 10, y + 14, s.label, 10, MUTED));
    el.push(text(x + 10, y + 32, s.val, 14, TEXT, { fw: 600 }));
  });

  // Action buttons
  el.push(rect(20, 590, 160, 48, GOLD, { rx: 12 }));
  el.push(text(100, 620, 'BUY', 15, BG, { anchor: 'middle', fw: 700, ls: 1.5 }));
  el.push(rect(210, 590, 160, 48, 'transparent', { rx: 12, stroke: GOLD, sw: 1.5 }));
  el.push(text(290, 620, 'SELL', 15, GOLD, { anchor: 'middle', fw: 700, ls: 1.5 }));

  // Analyst rating
  el.push(rect(20, 652, 350, 70, CARD, { rx: 12 }));
  el.push(rect(20, 652, 350, 70, 'none', { rx: 12, stroke: BORDER, sw: 1 }));
  el.push(text(34, 672, 'ANALYST CONSENSUS', 10, MUTED, { fw: 600, ls: 1.5 }));
  el.push(text(34, 700, 'Strong Buy', 18, TEAL, { fw: 700 }));
  const bars = [40, 14, 6, 0, 2];
  const barCols = [TEAL, TEAL, MUTED, RED, RED];
  const barLabels = ['SB', 'B', 'H', 'S', 'SS'];
  bars.forEach((b, i) => {
    const x = 160 + i * 40;
    const barH = Math.round(b * 0.7);
    el.push(rect(x, 720 - barH, 22, barH, barCols[i], { rx: 3, opacity: 0.75 }));
    el.push(text(x + 11, 724, barLabels[i], 9, MUTED, { anchor: 'middle' }));
  });
  el.push(text(34, 716, '62 analysts', 11, MUTED));

  bottomNav(el, 1);
  return { name: 'Asset Detail', elements: el };
}

// ─── SCREEN 4: Activity Feed ─────────────────────────────────────────────────
function screenActivity() {
  const el = [];
  el.push(rect(0, 0, W, H, BG));
  statusBar(el);
  accentDots(el);

  el.push(text(20, 72, 'Activity', 24, TEXT, { fw: 700, ls: -0.5 }));

  // Filter pills
  const filters = ['All', 'Buys', 'Sells', 'Dividends', 'Fees'];
  filters.forEach((f, i) => {
    const x = 20 + i * 72;
    const active = f === 'All';
    el.push(rect(x, 90, active ? 46 : 64, 28, active ? GOLD : CARD2, { rx: 14 }));
    el.push(rect(x, 90, active ? 46 : 64, 28, 'none', { rx: 14, stroke: active ? 'none' : BORDER, sw: 1 }));
    el.push(text(x + (active ? 23 : 32), 109, f, 12, active ? BG : MUTED, { anchor: 'middle', fw: active ? 700 : 400 }));
  });

  // Transactions grouped by date
  const groups = [
    {
      date: 'TODAY — Apr 9, 2026',
      txns: [
        { type: 'BUY', sym: 'NVDA', desc: 'Market order', qty: '12 shares', val: '+$10,490', up: true },
        { type: 'DIV', sym: 'AAPL', desc: 'Dividend income', qty: 'Quarterly', val: '+$38.40', up: true },
      ]
    },
    {
      date: 'YESTERDAY — Apr 8',
      txns: [
        { type: 'SELL', sym: 'TSLA', desc: 'Limit order', qty: '8 shares', val: '-$8,840', up: false },
        { type: 'BUY', sym: 'BTC', desc: 'Crypto purchase', qty: '0.124 BTC', val: '+$12,200', up: true },
        { type: 'FEE', sym: 'BRKR', desc: 'Platform fee', qty: 'Monthly', val: '-$9.99', up: false },
      ]
    },
    {
      date: 'APR 7',
      txns: [
        { type: 'BUY', sym: 'MSFT', desc: 'Auto-invest', qty: '5 shares', val: '+$2,145', up: true },
      ]
    },
  ];

  let yPos = 136;
  groups.forEach(g => {
    el.push(text(20, yPos, g.date, 10, GOLD, { fw: 700, ls: 2 }));
    yPos += 18;
    g.txns.forEach(t => {
      el.push(rect(20, yPos, 350, 54, CARD, { rx: 10 }));
      el.push(rect(20, yPos, 350, 54, 'none', { rx: 10, stroke: BORDER, sw: 1 }));
      // Type badge
      const badgeCol = t.type === 'BUY' ? 'rgba(109,184,154,0.2)' :
                       t.type === 'SELL' ? 'rgba(224,112,112,0.2)' :
                       t.type === 'DIV' ? 'rgba(212,165,116,0.2)' : 'rgba(168,162,158,0.2)';
      const textCol = t.type === 'BUY' ? TEAL : t.type === 'SELL' ? RED :
                      t.type === 'DIV' ? GOLD : MUTED;
      el.push(rect(24, yPos + 12, 38, 18, badgeCol, { rx: 4 }));
      el.push(text(43, yPos + 25, t.type, 10, textCol, { anchor: 'middle', fw: 700 }));
      el.push(text(70, yPos + 22, t.sym, 14, TEXT, { fw: 700 }));
      el.push(text(70, yPos + 38, t.desc, 11, MUTED));
      el.push(text(350, yPos + 22, t.val, 13, t.up ? TEAL : RED, { anchor: 'end', fw: 600 }));
      el.push(text(350, yPos + 38, t.qty, 11, MUTED, { anchor: 'end' }));
      yPos += 62;
    });
    yPos += 8;
  });

  bottomNav(el, 3);
  return { name: 'Activity', elements: el };
}

// ─── SCREEN 5: Insights ──────────────────────────────────────────────────────
function screenInsights() {
  const el = [];
  el.push(rect(0, 0, W, H, BG));
  statusBar(el);
  accentDots(el);

  el.push(text(20, 72, 'Insights', 24, TEXT, { fw: 700, ls: -0.5 }));
  el.push(text(20, 94, 'AI-powered analysis', 13, MUTED));

  // AI insight card — glassmorphism treatment (from DarkModeDesign.com)
  el.push(rect(20, 110, 350, 108, 'rgba(212,165,116,0.06)', { rx: 14 }));
  el.push(rect(20, 110, 350, 108, 'none', { rx: 14, stroke: 'rgba(212,165,116,0.3)', sw: 1 }));
  el.push(rect(20, 110, 3, 108, GOLD, { rx: 1 }));
  el.push(text(34, 130, '◆ WEEKLY SUMMARY', 10, GOLD, { fw: 700, ls: 2 }));
  el.push(text(34, 152, 'Portfolio up 2.84% this week, outperforming', 13, TEXT));
  el.push(text(34, 168, 'S&P 500 by +1.2%. NVDA position is your', 13, TEXT));
  el.push(text(34, 184, 'strongest contributor. Consider rebalancing', 13, TEXT));
  el.push(text(34, 200, 'fixed income allocation (+4% suggested).', 13, TEXT));

  // Score cards — bento style
  el.push(text(20, 238, 'PORTFOLIO HEALTH', 10, GOLD, { fw: 700, ls: 2.5 }));
  const scores = [
    { label: 'Risk Score', val: '6.2', sub: 'Moderate', col: GOLD },
    { label: 'Diversification', val: '8.1', sub: 'Strong', col: TEAL },
    { label: 'Fees', val: '9.4', sub: 'Excellent', col: TEAL },
    { label: 'Liquidity', val: '7.8', sub: 'Good', col: GOLD },
  ];
  scores.forEach((s, i) => {
    const x = 20 + (i % 2) * 175;
    const y = 254 + Math.floor(i / 2) * 90;
    el.push(rect(x, y, 165, 78, CARD, { rx: 12 }));
    el.push(rect(x, y, 165, 78, 'none', { rx: 12, stroke: BORDER, sw: 1 }));
    // Progress ring (simulated)
    el.push(circle(x + 32, y + 39, 22, 'none', { stroke: CARD2, sw: 6 }));
    const pct = parseFloat(s.val) / 10;
    const segs = Math.round(pct * 12);
    for (let k = 0; k < segs; k++) {
      const ang = (-90 + k * 30) * Math.PI / 180;
      const rx1 = (x + 32) + (22 - 3) * Math.cos(ang);
      const ry1 = (y + 39) + (22 - 3) * Math.sin(ang);
      const rx2 = (x + 32) + (22 + 3) * Math.cos(ang);
      const ry2 = (y + 39) + (22 + 3) * Math.sin(ang);
      el.push(line(rx1, ry1, rx2, ry2, s.col, { sw: 2.5, opacity: 0.8 }));
    }
    el.push(text(x + 32, y + 44, s.val, 16, s.col, { anchor: 'middle', fw: 700 }));
    el.push(text(x + 66, y + 34, s.label, 12, TEXT, { fw: 600 }));
    el.push(text(x + 66, y + 52, s.sub, 12, s.col, { fw: 500 }));
  });

  // Recommendations
  el.push(text(20, 456, 'ACTIONS', 10, GOLD, { fw: 700, ls: 2.5 }));

  const recs = [
    { icon: '⚖', title: 'Rebalance Fixed Income', body: 'Increase bonds by 4% to reduce equity risk', prio: 'Medium' },
    { icon: '⚡', title: 'Harvest Tax Losses', body: 'Sell TSLA to offset $65K in NVDA gains', prio: 'High' },
    { icon: '↗', title: 'Dividend Reinvestment', body: 'Auto-reinvest $289/quarter in AAPL', prio: 'Low' },
  ];
  recs.forEach((r, i) => {
    const y = 474 + i * 78;
    el.push(rect(20, y, 350, 68, CARD, { rx: 12 }));
    el.push(rect(20, y, 350, 68, 'none', { rx: 12, stroke: BORDER, sw: 1 }));
    el.push(rect(24, y + 14, 40, 40, CARD2, { rx: 8 }));
    el.push(text(44, y + 38, r.icon, 16, GOLD, { anchor: 'middle' }));
    el.push(text(74, y + 26, r.title, 13, TEXT, { fw: 600 }));
    el.push(text(74, y + 43, r.body, 11, MUTED));
    const prioCols = { High: RED, Medium: GOLD, Low: TEAL };
    el.push(rect(270, y + 14, 46, 18, CARD2, { rx: 9 }));
    el.push(text(293, y + 27, r.prio, 10, prioCols[r.prio], { anchor: 'middle', fw: 600 }));
  });

  bottomNav(el, 2);
  return { name: 'Insights', elements: el };
}

// ─── SCREEN 6: Profile / Settings ───────────────────────────────────────────
function screenProfile() {
  const el = [];
  el.push(rect(0, 0, W, H, BG));
  statusBar(el);
  accentDots(el);

  // Profile hero
  el.push(rect(0, 44, W, 180, SURF));
  el.push(rect(0, 44, W, 180, 'none', { stroke: BORDER, sw: 1 }));
  // Warm gradient overlay
  for (let j = 0; j < 40; j++) {
    el.push(rect(0, 44 + j * 4, W, 4, GOLD, { opacity: 0.015 + j * 0.003 }));
  }
  // Avatar
  el.push(circle(195, 120, 44, CARD));
  el.push(circle(195, 120, 44, 'none', { stroke: GOLD, sw: 2 }));
  el.push(text(195, 127, 'A', 32, GOLD, { anchor: 'middle', fw: 700 }));
  el.push(text(195, 180, 'Alexander Reid', 18, TEXT, { anchor: 'middle', fw: 700 }));
  el.push(text(195, 200, 'Premium · Member since 2021', 12, MUTED, { anchor: 'middle' }));

  // Tier badge
  el.push(rect(155, 210, 80, 22, 'rgba(212,165,116,0.2)', { rx: 11 }));
  el.push(text(195, 225, '◆ AURIC GOLD', 11, GOLD, { anchor: 'middle', fw: 700, ls: 1 }));

  // Stats strip
  el.push(rect(20, 244, 350, 62, CARD, { rx: 12 }));
  el.push(rect(20, 244, 350, 62, 'none', { rx: 12, stroke: BORDER, sw: 1 }));
  const profileStats = [
    { label: 'Years', val: '5' }, { label: 'Trades', val: '847' }, { label: 'Win Rate', val: '68%' }
  ];
  profileStats.forEach((s, i) => {
    const x = 78 + i * 117;
    el.push(text(x, 267, s.val, 22, GOLD, { anchor: 'middle', fw: 700, ls: -0.5 }));
    el.push(text(x, 285, s.label, 11, MUTED, { anchor: 'middle' }));
    if (i < 2) el.push(line(x + 58, 254, x + 58, 296, BORDER, { sw: 1 }));
  });

  // Settings groups
  const settingGroups = [
    {
      title: 'ACCOUNT',
      items: [
        { icon: '◎', label: 'Personal Details', sub: 'Name, email, phone' },
        { icon: '⚿', label: 'Security & 2FA', sub: 'Enabled · App authenticator' },
        { icon: '▣', label: 'Linked Accounts', sub: '3 connected' },
      ]
    },
    {
      title: 'PREFERENCES',
      items: [
        { icon: '◑', label: 'Appearance', sub: 'Dark · Warm Charcoal' },
        { icon: '⚐', label: 'Notifications', sub: 'Trades, alerts, insights' },
        { icon: '⊞', label: 'Data & Privacy', sub: 'Manage your data' },
      ]
    },
  ];

  let yPos = 322;
  settingGroups.forEach(g => {
    el.push(text(20, yPos, g.title, 10, GOLD, { fw: 700, ls: 2.5 }));
    yPos += 16;
    g.items.forEach((item, j) => {
      el.push(rect(20, yPos, 350, 52, CARD, { rx: 10 }));
      if (j > 0) el.push(line(20, yPos, 370, yPos, BORDER, { sw: 1, opacity: 0.5 }));
      el.push(rect(24, yPos + 10, 32, 32, CARD2, { rx: 8 }));
      el.push(text(40, yPos + 30, item.icon, 14, GOLD, { anchor: 'middle' }));
      el.push(text(64, yPos + 24, item.label, 14, TEXT, { fw: 600 }));
      el.push(text(64, yPos + 40, item.sub, 11, MUTED));
      el.push(text(360, yPos + 26, '›', 18, MUTED, { anchor: 'end' }));
      yPos += 52;
    });
    yPos += 16;
  });

  // Sign out
  el.push(rect(20, yPos, 350, 48, 'rgba(224,112,112,0.1)', { rx: 10 }));
  el.push(rect(20, yPos, 350, 48, 'none', { rx: 10, stroke: 'rgba(224,112,112,0.25)', sw: 1 }));
  el.push(text(195, yPos + 28, 'Sign Out', 14, RED, { anchor: 'middle', fw: 600 }));

  bottomNav(el, 4);
  return { name: 'Profile', elements: el };
}

// ─── ASSEMBLE ─────────────────────────────────────────────────────────────────
const screens = [
  screenHome(),
  screenPortfolio(),
  screenAsset(),
  screenActivity(),
  screenInsights(),
  screenProfile(),
];

const totalElements = screens.reduce((s, sc) => s + sc.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'AURIC — Wealth Intelligence',
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'dark',
    heartbeat: 'ongoing',
    elements: totalElements,
    palette: {
      bg: BG, surface: SURF, card: CARD, text: TEXT,
      accent: GOLD, accent2: TEAL, muted: MUTED,
    },
    inspiration: 'DarkModeDesign.com warm charcoal+gold luxury pattern; Land-book bento grid SaaS layouts; minimal.gallery extreme typography scale contrast',
  },
  screens: screens.map(sc => ({
    name: sc.name,
    svg: { width: W, height: H },
    elements: sc.elements,
  })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));

console.log(`AURIC: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
