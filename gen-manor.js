/**
 * MANOR — Wealth, Ordered.
 * Private wealth management app with editorial luxury dark aesthetic.
 * Inspired by Atlas Card (godly.website) + Midday.ai (darkmodedesign.com)
 * + Fluid Glass (Awwwards SOTD) — layered depth, gold accents, cinematic darkness.
 * Theme: DARK (previous was light — leaf.pen)
 */

const fs = require('fs');
const path = require('path');

// ─── Palette ───────────────────────────────────────────────────────────────
const BG        = '#070707';
const SURFACE   = '#111010';
const SURFACE2  = '#1A1918';
const TEXT      = '#EDE6D5';
const MUTED     = 'rgba(237,230,213,0.42)';
const GOLD      = '#C4A55A';
const GOLD_DIM  = '#7B6741';
const DANGER    = '#C45A5A';
const POSITIVE  = '#5AC47A';
const BORDER    = 'rgba(196,165,90,0.14)';

// ─── Typography ────────────────────────────────────────────────────────────
const SERIF     = '"Cormorant Garamond", "Playfair Display", Georgia, serif';
const SANS      = '"Inter", "DM Sans", system-ui, sans-serif';

// ─── Helpers ───────────────────────────────────────────────────────────────
let _id = 1000;
const uid = () => `e${_id++}`;

function rect({ x, y, w, h, fill = 'transparent', radius = 0, id, name }) {
  return {
    id: id || uid(), type: 'RECTANGLE',
    name: name || 'rect',
    x, y, width: w, height: h,
    backgroundColor: fill,
    cornerRadius: radius,
    borderColor: 'transparent', borderWidth: 0,
  };
}

function text({ x, y, w = 320, content, size = 14, weight = 400,
                color = TEXT, align = 'left', font = SANS,
                lineHeight = 1.4, letterSpacing = 0, id, name, opacity = 1 }) {
  return {
    id: id || uid(), type: 'TEXT',
    name: name || 'text',
    x, y, width: w,
    content, fontSize: size, fontWeight: weight,
    color, textAlign: align,
    fontFamily: font,
    lineHeight, letterSpacing,
    opacity,
  };
}

function line({ x, y, w, color = BORDER, id }) {
  return {
    id: id || uid(), type: 'LINE',
    name: 'divider',
    x, y, width: w, height: 1,
    backgroundColor: color,
  };
}

function pill({ x, y, w = 80, h = 26, fill, textContent, textColor = TEXT, radius = 13, size = 11 }) {
  return [
    rect({ x, y, w, h, fill, radius }),
    text({ x: x + 10, y: y + 6, w: w - 20, content: textContent, size, color: textColor, align: 'center' }),
  ];
}

// ─── Nav Bar ───────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: 'WEALTH', icon: '◈', screen: 0 },
  { label: 'HOLD',   icon: '▦', screen: 1 },
  { label: 'MOVES',  icon: '↑↓', screen: 2 },
  { label: 'MINDS',  icon: '✦', screen: 3 },
  { label: 'ACCT',   icon: '○', screen: 4 },
];
const W = 390;
const NAV_Y = 764;

function buildNav(activeIndex) {
  const els = [];
  // Nav bg
  els.push(rect({ x: 0, y: NAV_Y, w: W, h: 80, fill: SURFACE, name: 'nav-bg' }));
  els.push(line({ x: 0, y: NAV_Y, w: W, color: BORDER }));
  const tabW = W / NAV_ITEMS.length;
  NAV_ITEMS.forEach((item, i) => {
    const cx = i * tabW + tabW / 2;
    const isActive = i === activeIndex;
    const col = isActive ? GOLD : MUTED;
    const iconSize = 18;
    const iconX = cx - 12;
    els.push(text({ x: iconX, y: NAV_Y + 10, w: 24, content: item.icon, size: iconSize, color: col, align: 'center' }));
    els.push(text({ x: cx - tabW/2 + 2, y: NAV_Y + 34, w: tabW - 4, content: item.label, size: 8.5, weight: 600, color: col, align: 'center', letterSpacing: 1.5 }));
    if (isActive) {
      els.push(rect({ x: cx - 16, y: NAV_Y + 56, w: 32, h: 3, fill: GOLD, radius: 2 }));
    }
  });
  return els;
}

// ─── Status Bar ────────────────────────────────────────────────────────────
function statusBar() {
  return [
    text({ x: 20, y: 14, w: 100, content: '9:41', size: 14, weight: 600, color: TEXT }),
    text({ x: W - 80, y: 14, w: 70, content: '●●●  ▌', size: 12, color: TEXT, align: 'right' }),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 1 — OVERVIEW (Portfolio Wealth)
// ═══════════════════════════════════════════════════════════════════════════
function screen1() {
  const els = [];

  // Status
  els.push(...statusBar());

  // Greeting
  els.push(text({ x: 24, y: 52, w: 200, content: 'Good evening,', size: 13, color: MUTED, letterSpacing: 0.3 }));
  els.push(text({ x: 24, y: 68, w: 260, content: 'James Harrow', size: 26, weight: 600, color: TEXT, font: SERIF, letterSpacing: -0.5 }));

  // Membership badge
  els.push(...pill({ x: 24, y: 100, w: 94, h: 22, fill: GOLD_DIM, textContent: 'OBSIDIAN TIER', textColor: GOLD, radius: 3, size: 9 }));

  // Divider
  els.push(line({ x: 24, y: 134, w: W - 48 }));

  // Net Worth Card — glass-morphism panel
  els.push(rect({ x: 16, y: 148, w: W - 32, h: 144, fill: SURFACE2, radius: 12 }));
  els.push(rect({ x: 16, y: 148, w: W - 32, h: 144, fill: 'transparent', radius: 12 })); // border shimmer overlay
  // Gold accent left stripe
  els.push(rect({ x: 16, y: 148, w: 3, h: 144, fill: GOLD, radius: 2 }));

  els.push(text({ x: 38, y: 162, w: 200, content: 'TOTAL NET WORTH', size: 9.5, weight: 600, color: GOLD, letterSpacing: 2 }));
  els.push(text({ x: 38, y: 178, w: 300, content: '$4,817,290', size: 36, weight: 300, color: TEXT, font: SERIF, letterSpacing: -1 }));
  els.push(text({ x: 38, y: 222, w: 200, content: '+$143,820  ↑  +3.07% this month', size: 12, color: POSITIVE }));

  // Mini sparkline suggestion (simple rect bars)
  const barColors = [0.3, 0.5, 0.4, 0.7, 0.6, 0.9, 0.8, 1.0, 0.85, 0.95];
  barColors.forEach((h, i) => {
    const barH = Math.round(h * 36);
    els.push(rect({ x: 38 + i * 26, y: 264 - barH, w: 20, h: barH, fill: `rgba(196,165,90,${0.2 + h * 0.5})`, radius: 3 }));
  });

  // Allocation cards
  const allocs = [
    { label: 'Equities', pct: '52%', color: GOLD },
    { label: 'Fixed Inc.', pct: '28%', color: '#8AC4C4' },
    { label: 'Alt. Assets', pct: '14%', color: '#C48A8A' },
    { label: 'Cash', pct: '6%', color: MUTED },
  ];
  els.push(text({ x: 24, y: 308, w: 200, content: 'ALLOCATION', size: 9.5, weight: 600, color: MUTED, letterSpacing: 2 }));
  allocs.forEach((a, i) => {
    const col = i % 2 === 0 ? 0 : (W / 2 - 8);
    const row = Math.floor(i / 2);
    const bx = 16 + col;
    const by = 326 + row * 70;
    const bw = (W - 40) / 2;
    els.push(rect({ x: bx, y: by, w: bw, h: 58, fill: SURFACE, radius: 10 }));
    els.push(rect({ x: bx + 12, y: by + 10, w: 4, h: 38, fill: a.color, radius: 2 }));
    els.push(text({ x: bx + 24, y: by + 12, w: bw - 30, content: a.label, size: 11.5, color: MUTED }));
    els.push(text({ x: bx + 24, y: by + 30, w: bw - 30, content: a.pct, size: 20, weight: 300, color: TEXT, font: SERIF }));
  });

  // Holdings summary link
  els.push(line({ x: 24, y: 470, w: W - 48 }));
  els.push(text({ x: 24, y: 480, w: 180, content: 'Top Holdings', size: 13, weight: 500, color: TEXT }));
  els.push(text({ x: W - 80, y: 480, w: 60, content: 'View all →', size: 12, color: GOLD, align: 'right' }));
  const holdings = [
    { name: 'AAPL', full: 'Apple Inc.', val: '$241,320', chg: '+1.4%', pos: true },
    { name: 'BRK.A', full: 'Berkshire Hathaway', val: '$188,900', chg: '+0.7%', pos: true },
    { name: 'MSFT', full: 'Microsoft Corp.', val: '$155,240', chg: '-0.3%', pos: false },
  ];
  holdings.forEach((h, i) => {
    const hy = 506 + i * 60;
    els.push(rect({ x: 16, y: hy, w: W - 32, h: 52, fill: SURFACE, radius: 8 }));
    // Ticker badge
    els.push(rect({ x: 28, y: hy + 13, w: 44, h: 26, fill: SURFACE2, radius: 4 }));
    els.push(text({ x: 28, y: hy + 19, w: 44, content: h.name, size: 9, weight: 700, color: GOLD, align: 'center', letterSpacing: 0.5 }));
    els.push(text({ x: 84, y: hy + 13, w: 160, content: h.full, size: 12, color: TEXT }));
    els.push(text({ x: 84, y: hy + 30, w: 100, content: h.val, size: 11, color: MUTED }));
    els.push(text({ x: W - 70, y: hy + 19, w: 50, content: h.chg, size: 12, weight: 600, color: h.pos ? POSITIVE : DANGER, align: 'right' }));
  });

  // Nav
  els.push(...buildNav(0));

  return { id: 'screen1', label: 'Wealth Overview', backgroundColor: BG, width: W, height: 844, elements: els };
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 2 — HOLDINGS
// ═══════════════════════════════════════════════════════════════════════════
function screen2() {
  const els = [];
  els.push(...statusBar());

  els.push(text({ x: 24, y: 52, w: 240, content: 'Holdings', size: 28, weight: 300, color: TEXT, font: SERIF, letterSpacing: -0.5 }));
  els.push(text({ x: 24, y: 84, w: 240, content: '14 positions  ·  4 asset classes', size: 12, color: MUTED }));

  // Filter pills
  const filters = ['All', 'Equities', 'Fixed Inc.', 'Alts'];
  let fx = 24;
  filters.forEach((f, i) => {
    const fw = f.length * 8 + 20;
    const isActive = i === 0;
    els.push(rect({ x: fx, y: 108, w: fw, h: 28, fill: isActive ? GOLD : SURFACE2, radius: 14 }));
    els.push(text({ x: fx + 6, y: 115, w: fw - 12, content: f, size: 11, weight: isActive ? 600 : 400, color: isActive ? BG : MUTED, align: 'center' }));
    fx += fw + 8;
  });

  els.push(line({ x: 24, y: 148, w: W - 48 }));

  const holdings = [
    { ticker: 'AAPL',   name: 'Apple Inc.',          shares: '220 sh', val: '$241,320', chg: '+1.4%', gain: '+$3,320', pos: true,  alloc: 5.0 },
    { ticker: 'BRK.A',  name: 'Berkshire Hathaway',  shares: '1 sh',   val: '$188,900', chg: '+0.7%', gain: '+$1,310', pos: true,  alloc: 3.9 },
    { ticker: 'MSFT',   name: 'Microsoft Corp.',     shares: '400 sh', val: '$155,240', chg: '-0.3%', gain: '-$460',   pos: false, alloc: 3.2 },
    { ticker: 'TLT',    name: 'iShares 20Y Treasury', shares: '900 sh', val: '$121,500', chg: '+0.1%', gain: '+$120',   pos: true,  alloc: 2.5 },
    { ticker: 'GOLD',   name: 'SPDR Gold Shares',    shares: '600 sh', val: '$114,660', chg: '+2.1%', gain: '+$2,360', pos: true,  alloc: 2.4 },
    { ticker: 'BREIT',  name: 'Blackstone REIT',     shares: '50 sh',  val: '$98,000',  chg: '+0.0%', gain: '+$0',     pos: true,  alloc: 2.0 },
    { ticker: 'NVDA',   name: 'NVIDIA Corp.',        shares: '180 sh', val: '$91,800',  chg: '+4.2%', gain: '+$3,710', pos: true,  alloc: 1.9 },
  ];

  holdings.forEach((h, i) => {
    const hy = 160 + i * 78;
    els.push(rect({ x: 16, y: hy, w: W - 32, h: 70, fill: SURFACE, radius: 10 }));
    // Allocation bar on left
    const barH = Math.round(h.alloc * 6);
    els.push(rect({ x: 16, y: hy + (70 - barH) / 2, w: 3, h: barH, fill: GOLD, radius: 2 }));
    // Ticker
    els.push(rect({ x: 28, y: hy + 14, w: 50, h: 22, fill: SURFACE2, radius: 4 }));
    els.push(text({ x: 28, y: hy + 19, w: 50, content: h.ticker, size: 9, weight: 700, color: GOLD, align: 'center', letterSpacing: 0.5 }));
    // Name + shares
    els.push(text({ x: 90, y: hy + 13, w: 170, content: h.name, size: 12, weight: 500, color: TEXT }));
    els.push(text({ x: 90, y: hy + 31, w: 120, content: h.shares, size: 11, color: MUTED }));
    // Value + gain
    els.push(text({ x: W - 90, y: hy + 13, w: 70, content: h.val, size: 12, weight: 500, color: TEXT, align: 'right' }));
    els.push(text({ x: W - 90, y: hy + 31, w: 70, content: h.gain, size: 11, color: h.pos ? POSITIVE : DANGER, align: 'right' }));
    // Change badge
    els.push(rect({ x: W - 86, y: hy + 47, w: 66, h: 16, fill: h.pos ? 'rgba(90,196,122,0.12)' : 'rgba(196,90,90,0.12)', radius: 4 }));
    els.push(text({ x: W - 80, y: hy + 50, w: 56, content: h.chg, size: 9.5, weight: 600, color: h.pos ? POSITIVE : DANGER, align: 'right' }));
  });

  // Summary footer
  const summaryY = 710;
  els.push(line({ x: 24, y: summaryY, w: W - 48 }));
  els.push(text({ x: 24, y: summaryY + 10, w: 160, content: 'Total shown', size: 12, color: MUTED }));
  els.push(text({ x: W - 100, y: summaryY + 10, w: 80, content: '$1,011,420', size: 12, weight: 600, color: TEXT, align: 'right' }));

  els.push(...buildNav(1));
  return { id: 'screen2', label: 'Holdings', backgroundColor: BG, width: W, height: 844, elements: els };
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 3 — MOVES (Transactions)
// ═══════════════════════════════════════════════════════════════════════════
function screen3() {
  const els = [];
  els.push(...statusBar());

  els.push(text({ x: 24, y: 52, w: 200, content: 'Moves', size: 28, weight: 300, color: TEXT, font: SERIF, letterSpacing: -0.5 }));
  els.push(text({ x: 24, y: 84, w: 260, content: 'Transaction history & rebalancing', size: 12, color: MUTED }));

  // Month selector
  const months = ['Jan', 'Feb', 'Mar', 'Apr'];
  months.forEach((m, i) => {
    const isActive = m === 'Mar';
    const mx = 24 + i * 56;
    els.push(text({ x: mx, y: 110, w: 48, content: m, size: 13, weight: isActive ? 600 : 400, color: isActive ? TEXT : MUTED, align: 'center' }));
    if (isActive) els.push(rect({ x: mx + 14, y: 128, w: 20, h: 2, fill: GOLD, radius: 1 }));
  });

  els.push(line({ x: 24, y: 138, w: W - 48 }));

  // Monthly summary card
  els.push(rect({ x: 16, y: 150, w: W - 32, h: 76, fill: SURFACE2, radius: 10 }));
  els.push(rect({ x: 16, y: 150, w: 3, h: 76, fill: GOLD, radius: 2 }));
  els.push(text({ x: 34, y: 163, w: 120, content: 'MARCH 2025', size: 9, weight: 700, color: GOLD, letterSpacing: 2 }));
  els.push(text({ x: 34, y: 178, w: 200, content: '18 transactions', size: 18, weight: 300, color: TEXT, font: SERIF }));
  els.push(text({ x: W - 110, y: 163, w: 90, content: 'Net gain', size: 9, color: MUTED, align: 'right' }));
  els.push(text({ x: W - 110, y: 177, w: 90, content: '+$28,440', size: 17, weight: 300, color: POSITIVE, font: SERIF, align: 'right' }));
  els.push(text({ x: 34, y: 204, w: 200, content: '↑ 12 buys  ↓ 4 sells  ⇌ 2 transfers', size: 10, color: MUTED }));

  els.push(text({ x: 24, y: 242, w: 160, content: 'RECENT', size: 9, weight: 700, color: MUTED, letterSpacing: 2 }));

  const moves = [
    { date: 'Mar 28', type: 'BUY',      ticker: 'NVDA',  desc: 'Market order',       qty: '+20 sh',  value: '+$10,200', pos: true  },
    { date: 'Mar 26', type: 'SELL',     ticker: 'AAPL',  desc: 'Limit $218.50',      qty: '-10 sh',  value: '+$2,185',  pos: true  },
    { date: 'Mar 24', type: 'DIV',      ticker: 'MSFT',  desc: 'Dividend reinvest',  qty: '+2 sh',   value: '+$828',    pos: true  },
    { date: 'Mar 22', type: 'BUY',      ticker: 'TLT',   desc: 'Rebalance order',    qty: '+100 sh', value: '-$13,500', pos: false },
    { date: 'Mar 19', type: 'TRANSFER', ticker: 'CASH',  desc: 'Wire from checking', qty: '—',       value: '+$50,000', pos: true  },
    { date: 'Mar 14', type: 'BUY',      ticker: 'GOLD',  desc: 'Systematic buy',     qty: '+50 sh',  value: '-$9,555',  pos: false },
    { date: 'Mar 10', type: 'SELL',     ticker: 'BREIT', desc: 'Redemption',         qty: '-5 sh',   value: '+$9,800',  pos: true  },
  ];

  const typeColors = { BUY: '#5AC47A', SELL: '#C45A5A', DIV: GOLD, TRANSFER: '#8AC4C4' };

  moves.forEach((m, i) => {
    const my = 258 + i * 64;
    els.push(rect({ x: 16, y: my, w: W - 32, h: 56, fill: SURFACE, radius: 8 }));
    // Type badge
    const tc = typeColors[m.type] || MUTED;
    els.push(rect({ x: 28, y: my + 14, w: 52, h: 20, fill: `${tc}22`, radius: 4 }));
    els.push(text({ x: 28, y: my + 18, w: 52, content: m.type, size: 9, weight: 700, color: tc, align: 'center', letterSpacing: 0.8 }));
    // Ticker + desc
    els.push(text({ x: 92, y: my + 11, w: 140, content: m.ticker, size: 13, weight: 600, color: TEXT }));
    els.push(text({ x: 92, y: my + 29, w: 160, content: m.desc, size: 10.5, color: MUTED }));
    // Date + qty + value
    els.push(text({ x: W - 90, y: my + 11, w: 70, content: m.value, size: 12, weight: 600, color: m.pos ? POSITIVE : DANGER, align: 'right' }));
    els.push(text({ x: W - 90, y: my + 29, w: 70, content: m.qty, size: 10, color: MUTED, align: 'right' }));
    els.push(text({ x: W - 90, y: my + 44, w: 70, content: m.date, size: 9, color: MUTED, align: 'right', opacity: 0.7 }));
  });

  els.push(...buildNav(2));
  return { id: 'screen3', label: 'Moves', backgroundColor: BG, width: W, height: 844, elements: els };
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 4 — INSIGHTS (AI Wealth Analysis)
// ═══════════════════════════════════════════════════════════════════════════
function screen4() {
  const els = [];
  els.push(...statusBar());

  els.push(text({ x: 24, y: 52, w: 280, content: 'Insights', size: 28, weight: 300, color: TEXT, font: SERIF, letterSpacing: -0.5 }));
  els.push(text({ x: 24, y: 84, w: 260, content: 'AI-powered analysis · updated daily', size: 12, color: MUTED }));

  // Featured insight — large card
  els.push(rect({ x: 16, y: 108, w: W - 32, h: 168, fill: SURFACE2, radius: 14 }));
  els.push(rect({ x: 16, y: 108, w: W - 32, h: 4, fill: GOLD, radius: 2 })); // gold top bar

  els.push(text({ x: 30, y: 122, w: 120, content: '✦ WEEKLY BRIEF', size: 9, weight: 700, color: GOLD, letterSpacing: 2 }));
  els.push(text({ x: 30, y: 138, w: W - 60, content: 'Your portfolio outperformed the S&P 500 by 1.4% this week, driven by your AI/semiconductor exposure.', size: 13, weight: 400, color: TEXT, lineHeight: 1.55 }));

  // Bullets
  const bullets = ['NVDA +8.3% — largest single-week gain', 'Bond ladder hedged rate volatility well', 'Cash drag: $290K idle; consider T-Bills'];
  bullets.forEach((b, i) => {
    const col = i === 2 ? '#C4A55A' : TEXT;
    els.push(text({ x: 30, y: 198 + i * 22, w: W - 60, content: `· ${b}`, size: 11.5, color: col, lineHeight: 1.4 }));
  });

  // Insight cards row
  els.push(text({ x: 24, y: 290, w: 200, content: 'RECOMMENDATIONS', size: 9, weight: 700, color: MUTED, letterSpacing: 2 }));

  const recs = [
    { icon: '▲', title: 'Rebalance', body: 'Equities now 54% of portfolio. Consider trimming $90K to restore target.', urgency: 'ACTION', urgColor: GOLD },
    { icon: '◎', title: 'Tax Loss', body: 'MSFT position has unrealized loss of $460. Harvest before Mar 31.', urgency: 'SOON', urgColor: '#8AC4C4' },
    { icon: '◈', title: 'Opportunity', body: 'International exposure (2%) is below your 15% target. EM ETFs signal entry.', urgency: 'REVIEW', urgColor: MUTED },
  ];

  recs.forEach((r, i) => {
    const ry = 308 + i * 118;
    els.push(rect({ x: 16, y: ry, w: W - 32, h: 108, fill: SURFACE, radius: 12 }));
    // Left accent
    els.push(rect({ x: 16, y: ry, w: 3, h: 108, fill: r.urgColor, radius: 2 }));
    // Icon circle
    els.push(rect({ x: 32, y: ry + 16, w: 36, h: 36, fill: `${r.urgColor}22`, radius: 18 }));
    els.push(text({ x: 32, y: ry + 24, w: 36, content: r.icon, size: 18, color: r.urgColor, align: 'center' }));
    // Title + urgency
    els.push(text({ x: 80, y: ry + 18, w: 200, content: r.title, size: 14, weight: 600, color: TEXT }));
    els.push(rect({ x: W - 84, y: ry + 16, w: 64, h: 18, fill: `${r.urgColor}22`, radius: 4 }));
    els.push(text({ x: W - 84, y: ry + 19, w: 64, content: r.urgency, size: 8.5, weight: 700, color: r.urgColor, align: 'center', letterSpacing: 1 }));
    // Body
    els.push(text({ x: 80, y: ry + 38, w: W - 104, content: r.body, size: 11.5, color: MUTED, lineHeight: 1.5 }));
    // Action button hint
    els.push(text({ x: 80, y: ry + 84, w: 120, content: 'View details →', size: 11, color: GOLD }));
  });

  els.push(...buildNav(3));
  return { id: 'screen4', label: 'Insights', backgroundColor: BG, width: W, height: 844, elements: els };
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 5 — ACCOUNT (Membership & Concierge)
// ═══════════════════════════════════════════════════════════════════════════
function screen5() {
  const els = [];
  els.push(...statusBar());

  // Profile header
  els.push(rect({ x: 16, y: 44, w: W - 32, h: 130, fill: SURFACE2, radius: 14 }));
  els.push(rect({ x: 16, y: 44, w: W - 32, h: 4, fill: GOLD, radius: 2 })); // gold top

  // Avatar circle
  els.push(rect({ x: 28, y: 58, w: 64, h: 64, fill: SURFACE, radius: 32 }));
  els.push(rect({ x: 30, y: 60, w: 60, h: 60, fill: GOLD_DIM, radius: 30 }));
  els.push(text({ x: 30, y: 78, w: 60, content: 'JH', size: 22, weight: 300, color: GOLD, align: 'center', font: SERIF }));

  els.push(text({ x: 106, y: 62, w: 220, content: 'James Harrow', size: 18, weight: 500, color: TEXT, font: SERIF }));
  els.push(text({ x: 106, y: 84, w: 220, content: 'james@harrowcapital.com', size: 11, color: MUTED }));
  // Tier
  els.push(rect({ x: 106, y: 100, w: 96, h: 22, fill: GOLD_DIM, radius: 4 }));
  els.push(text({ x: 106, y: 104, w: 96, content: '◆  OBSIDIAN TIER', size: 9, weight: 700, color: GOLD, align: 'center', letterSpacing: 1 }));
  els.push(text({ x: 106, y: 126, w: 220, content: 'Member since January 2019', size: 10, color: MUTED }));

  // Concierge card
  els.push(rect({ x: 16, y: 190, w: W - 32, h: 68, fill: SURFACE, radius: 12 }));
  els.push(rect({ x: 16, y: 190, w: 3, h: 68, fill: GOLD, radius: 2 }));
  els.push(text({ x: 30, y: 200, w: 200, content: 'PRIVATE CONCIERGE', size: 9, weight: 700, color: GOLD, letterSpacing: 2 }));
  els.push(text({ x: 30, y: 216, w: 220, content: 'Alexandra Chen', size: 15, weight: 500, color: TEXT }));
  els.push(text({ x: 30, y: 234, w: 200, content: 'Available now  ·  Response < 2 min', size: 10.5, color: POSITIVE }));
  els.push(rect({ x: W - 90, y: 205, w: 68, h: 32, fill: GOLD, radius: 8 }));
  els.push(text({ x: W - 90, y: 213, w: 68, content: 'Message', size: 11, weight: 600, color: BG, align: 'center' }));

  // Settings sections
  const sections = [
    { label: 'ACCOUNT', items: [
      { icon: '◈', title: 'Account Details', sub: 'Profile, address, tax docs' },
      { icon: '⬡', title: 'Beneficiaries', sub: '2 named beneficiaries' },
      { icon: '▦', title: 'Linked Institutions', sub: '3 connected accounts' },
    ]},
    { label: 'PREFERENCES', items: [
      { icon: '◎', title: 'Risk Tolerance', sub: 'Moderate–Aggressive (7/10)' },
      { icon: '✦', title: 'Investment Themes', sub: 'AI, Clean Energy, Healthcare' },
      { icon: '○', title: 'Notifications', sub: 'Price alerts, rebalance reminders' },
    ]},
    { label: 'SECURITY', items: [
      { icon: '▲', title: 'Biometrics', sub: 'Face ID enabled' },
      { icon: '⊡', title: 'Two-Factor Auth', sub: 'Authenticator app active' },
    ]},
  ];

  let sy = 272;
  sections.forEach((sec) => {
    els.push(text({ x: 24, y: sy, w: 200, content: sec.label, size: 9, weight: 700, color: MUTED, letterSpacing: 2 }));
    sy += 18;
    sec.items.forEach((item) => {
      els.push(rect({ x: 16, y: sy, w: W - 32, h: 54, fill: SURFACE, radius: 8 }));
      els.push(rect({ x: 28, y: sy + 13, w: 28, h: 28, fill: SURFACE2, radius: 14 }));
      els.push(text({ x: 28, y: sy + 18, w: 28, content: item.icon, size: 14, color: GOLD, align: 'center' }));
      els.push(text({ x: 68, y: sy + 12, w: 240, content: item.title, size: 13, weight: 500, color: TEXT }));
      els.push(text({ x: 68, y: sy + 30, w: 240, content: item.sub, size: 10.5, color: MUTED }));
      els.push(text({ x: W - 30, y: sy + 21, w: 20, content: '›', size: 16, color: MUTED }));
      sy += 62;
    });
    sy += 8;
  });

  els.push(...buildNav(4));
  return { id: 'screen5', label: 'Account', backgroundColor: BG, width: W, height: 844, elements: els };
}

// ─── Assemble .pen file ────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  meta: {
    name: 'MANOR — Wealth, Ordered.',
    description: 'Private wealth management app with editorial luxury dark aesthetic. Inspired by Atlas Card (godly.website) and Midday.ai (darkmodedesign.com). Deep black + warm gold + glass-depth surfaces.',
    created: new Date().toISOString(),
    author: 'RAM Design Heartbeat',
    tags: ['finance', 'luxury', 'dark', 'wealth', 'editorial', 'gold', 'concierge'],
    archetype: 'finance-luxury',
  },
  screens: [screen1(), screen2(), screen3(), screen4(), screen5()],
};

const outPath = path.join(__dirname, 'manor.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ manor.pen written — ${(fs.statSync(outPath).size / 1024).toFixed(1)} KB`);
console.log(`  Screens: ${pen.screens.length}`);
pen.screens.forEach(s => {
  const count = s.elements.length;
  console.log(`  · ${s.label}: ${count} elements`);
});
