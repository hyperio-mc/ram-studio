// SIGNAL — Real-time market intelligence for traders
// Inspired by: Darkroom.au (full-bleed condensed editorial type on jet black),
//              Midday.ai (feature tab showcase), Tracebit (spaced letter headings)
// Theme: DARK — near-pitch black, warm cream text, orange-red + green accents

const fs = require('fs');

const W = 390, H = 844;

const P = {
  bg:      '#050505',
  surface: '#0F0F0F',
  card:    '#141414',
  border:  '#1E1E1E',
  text:    '#EDE8DE',
  muted:   '#7A7570',
  accent:  '#FF6B35',
  green:   '#00C896',
  red:     '#FF3B5C',
  gold:    '#C8A250',
};

let _id = 1;
function makeId() { return 'c' + (_id++).toString(36); }

function rect(x, y, w, h, fill, opts = {}) {
  return {
    id: makeId(), type: 'rectangle', x, y, width: w, height: h,
    props: { fill, cornerRadius: opts.r || 0, opacity: opts.opacity !== undefined ? opts.opacity : 1,
             strokeColor: opts.stroke || null, strokeWidth: opts.sw || 0 }
  };
}

function text(x, y, w, h, content, size, color, opts = {}) {
  return {
    id: makeId(), type: 'text', x, y, width: w, height: h,
    props: {
      content: String(content), fontSize: size, color,
      fontWeight: opts.weight || 400,
      fontFamily: opts.font || 'Inter',
      textAlign: opts.align || 'left',
      letterSpacing: opts.ls || 0,
      lineHeight: opts.lh || 1.2,
      opacity: opts.opacity !== undefined ? opts.opacity : 1,
    }
  };
}

function circle(cx, cy, r, fill, opts = {}) {
  return {
    id: makeId(), type: 'ellipse',
    x: cx - r, y: cy - r, width: r * 2, height: r * 2,
    props: { fill, opacity: opts.opacity !== undefined ? opts.opacity : 1,
             strokeColor: opts.stroke || null, strokeWidth: opts.sw || 0 }
  };
}

function nav(comps, activeIdx) {
  comps.push(rect(0, H - 80, W, 80, P.surface));
  comps.push(rect(0, H - 80, W, 1, P.border));
  const navItems = [
    { icon: '⬡', label: 'Pulse' },
    { icon: '◈', label: 'Watch' },
    { icon: '⌖', label: 'Signals' },
    { icon: '◎', label: 'Portfolio' },
    { icon: '⚙', label: 'Settings' },
  ];
  navItems.forEach((n, i) => {
    const nx = 16 + i * ((W - 32) / 5) + (W - 32) / 10;
    const isActive = i === activeIdx;
    comps.push(text(nx - 20, H - 68, 40, 24, n.icon, 18, isActive ? P.accent : P.muted, { align: 'center' }));
    comps.push(text(nx - 22, H - 42, 44, 16, n.label, 9, isActive ? P.text : P.muted, { align: 'center', weight: isActive ? 600 : 400 }));
    if (isActive) comps.push(rect(nx - 10, H - 78, 20, 2, P.accent, { r: 1 }));
  });
  comps.push(rect(W / 2 - 60, H - 8, 120, 4, P.muted, { r: 2 }));
}

// ─── SCREEN 1: MARKET PULSE ───────────────────────────────────────────────────
function buildScreen1() {
  const comps = [];
  comps.push(rect(0, 0, W, H, P.bg));
  // Status bar
  comps.push(text(16, 14, 80, 16, '9:41', 12, P.text, { weight: 600 }));
  comps.push(text(W - 70, 14, 60, 16, '●●●  ▌▌▌', 9, P.muted, { align: 'right' }));

  // EDITORIAL HERO — massive condensed type (Darkroom.au inspired)
  comps.push(text(0, 52, W, 72, 'SIGNAL', 68, P.text, { weight: 800, ls: -3, align: 'center' }));
  // Spaced letter subhead (Tracebit inspired)
  comps.push(text(0, 128, W, 20, 'M A R K E T  I N T E L L I G E N C E', 9, P.muted, { ls: 4, align: 'center', weight: 500 }));
  comps.push(rect(16, 154, W - 32, 1, P.border));

  // Market status pill
  comps.push(rect(W / 2 - 62, 162, 124, 24, '#0F1F17', { r: 12 }));
  comps.push(circle(W / 2 - 44, 174, 4, P.green));
  comps.push(text(W / 2 - 32, 163, 90, 22, 'MARKETS OPEN', 9, P.green, { weight: 700, ls: 1 }));

  // Big portfolio value
  comps.push(text(16, 200, W - 32, 52, '$284,910', 46, P.text, { weight: 700, ls: -2 }));
  comps.push(text(16, 254, 180, 18, 'Total portfolio value', 12, P.muted));
  comps.push(rect(16, 276, 112, 26, '#0A1E15', { r: 6 }));
  comps.push(text(26, 282, 92, 14, '+$1,847  +0.65%', 11, P.green, { weight: 600 }));

  // Quick stats row
  const stats = [{ label: 'DAY HIGH', val: '287.2K' }, { label: 'OPEN', val: '283.1K' }, { label: 'BETA', val: '1.24' }];
  const sw = (W - 48) / 3;
  stats.forEach((s, i) => {
    const sx = 16 + i * (sw + 8);
    comps.push(rect(sx, 314, sw, 54, P.card, { r: 8 }));
    comps.push(text(sx + 8, 322, sw - 16, 12, s.label, 8, P.muted, { weight: 600, ls: 0.5 }));
    comps.push(text(sx + 8, 338, sw - 16, 22, s.val, 16, P.text, { weight: 700 }));
  });

  // Top Movers section
  comps.push(text(16, 380, 180, 16, 'T O P  M O V E R S', 9, P.muted, { weight: 600, ls: 3 }));
  comps.push(text(W - 56, 380, 44, 16, 'See all', 11, P.accent, { align: 'right' }));

  const movers = [
    { sym: 'NVDA', name: 'NVIDIA Corp.', price: '882.40', chg: '+4.2%', pos: true },
    { sym: 'BTC',  name: 'Bitcoin',       price: '67,340', chg: '+2.8%', pos: true },
    { sym: 'TSLA', name: 'Tesla Inc.',    price: '179.82', chg: '-2.1%', pos: false },
  ];
  movers.forEach((m, i) => {
    const my = 400 + i * 70;
    comps.push(rect(16, my, W - 32, 62, P.card, { r: 8 }));
    comps.push(rect(16, my, 3, 62, m.pos ? P.green : P.red, { r: 2 }));
    comps.push(rect(28, my + 11, 36, 36, P.border, { r: 8 }));
    comps.push(text(28, my + 19, 36, 20, m.sym.slice(0, 2), 11, P.text, { weight: 700, align: 'center' }));
    comps.push(text(76, my + 13, 120, 18, m.sym, 14, P.text, { weight: 700 }));
    comps.push(text(76, my + 34, 120, 14, m.name, 11, P.muted));
    comps.push(text(W - 108, my + 13, 92, 18, '$' + m.price, 13, P.text, { weight: 600, align: 'right' }));
    comps.push(rect(W - 80, my + 34, 64, 18, m.pos ? '#0A1E15' : '#1E0A10', { r: 4 }));
    comps.push(text(W - 80, my + 35, 64, 16, m.chg, 11, m.pos ? P.green : P.red, { weight: 700, align: 'center' }));
  });

  nav(comps, 0);
  return { id: makeId(), name: 'Market Pulse', width: W, height: H, components: comps };
}

// ─── SCREEN 2: WATCHLIST ──────────────────────────────────────────────────────
function buildScreen2() {
  const comps = [];
  comps.push(rect(0, 0, W, H, P.bg));
  comps.push(text(16, 14, 80, 16, '9:41', 12, P.text, { weight: 600 }));
  comps.push(text(16, 56, W - 64, 44, 'WATCHLIST', 36, P.text, { weight: 800, ls: -1 }));
  comps.push(text(16, 102, 180, 16, '12 assets tracked', 12, P.muted));
  comps.push(rect(W - 52, 56, 36, 36, P.card, { r: 10 }));
  comps.push(text(W - 52, 60, 36, 28, '+', 20, P.accent, { align: 'center', weight: 300 }));
  comps.push(rect(16, 124, W - 32, 1, P.border));

  // Filter chips
  const chips = ['All', 'Gainers', 'Losers', 'Crypto'];
  chips.forEach((c, i) => {
    const cx = 16 + i * 76;
    const isActive = i === 0;
    comps.push(rect(cx, 132, 70, 26, isActive ? P.accent : P.card, { r: 13 }));
    comps.push(text(cx, 137, 70, 16, c, 11, isActive ? '#050505' : P.muted, { align: 'center', weight: isActive ? 700 : 400 }));
  });

  const items = [
    { sym: 'AAPL', name: 'Apple Inc.',      price: '213.52', chg: '+1.2%', pos: true  },
    { sym: 'NVDA', name: 'NVIDIA Corp.',    price: '882.40', chg: '+4.2%', pos: true  },
    { sym: 'BTC',  name: 'Bitcoin',         price: '67,340', chg: '+2.8%', pos: true  },
    { sym: 'TSLA', name: 'Tesla Inc.',      price: '179.82', chg: '-2.1%', pos: false },
    { sym: 'META', name: 'Meta Platforms',  price: '492.10', chg: '-1.3%', pos: false },
    { sym: 'ETH',  name: 'Ethereum',        price: '3,521',  chg: '+0.8%', pos: true  },
    { sym: 'AMZN', name: 'Amazon',          price: '182.90', chg: '+0.5%', pos: true  },
  ];

  const sparkHeights = [[12, 18, 10, 22, 16, 24, 20, 28], [8, 14, 20, 16, 24, 28, 22, 30], [20, 14, 16, 10, 18, 22, 26, 28], [28, 22, 18, 24, 16, 12, 14, 10], [24, 20, 26, 18, 14, 12, 16, 10], [10, 16, 12, 18, 22, 20, 26, 28], [14, 18, 20, 24, 22, 26, 28, 30]];

  items.forEach((item, i) => {
    const iy = 168 + i * 74;
    if (iy + 66 > H - 85) return;
    comps.push(rect(16, iy, W - 32, 66, P.card, { r: 9 }));
    comps.push(rect(16, iy, 3, 66, item.pos ? P.green : P.red, { r: 2 }));
    comps.push(text(28, iy + 8, 60, 20, item.sym, 15, P.text, { weight: 700 }));
    comps.push(text(28, iy + 32, 130, 14, item.name, 11, P.muted));

    // Mini sparkline
    const sHeights = sparkHeights[i % sparkHeights.length];
    sHeights.forEach((bh, bi) => {
      const bx = W - 172 + bi * 14;
      const by = iy + 12 + (30 - bh);
      comps.push(rect(bx, by, 9, bh, item.pos ? P.green : P.red, { r: 1, opacity: 0.25 + bi * 0.09 }));
    });

    comps.push(text(W - 90, iy + 9, 74, 18, '$' + item.price, 13, P.text, { weight: 600, align: 'right' }));
    comps.push(rect(W - 78, iy + 34, 62, 18, item.pos ? '#0A1E15' : '#1E0A10', { r: 4 }));
    comps.push(text(W - 78, iy + 35, 62, 16, item.chg, 11, item.pos ? P.green : P.red, { weight: 700, align: 'center' }));
  });

  nav(comps, 1);
  return { id: makeId(), name: 'Watchlist', width: W, height: H, components: comps };
}

// ─── SCREEN 3: SIGNAL FEED ────────────────────────────────────────────────────
function buildScreen3() {
  const comps = [];
  comps.push(rect(0, 0, W, H, P.bg));
  comps.push(text(16, 14, 80, 16, '9:41', 12, P.text, { weight: 600 }));
  comps.push(text(16, 56, W - 32, 44, 'SIGNALS', 38, P.text, { weight: 800, ls: -1 }));
  comps.push(text(16, 102, W - 32, 16, 'A I  D E T E C T E D  P A T T E R N S', 9, P.muted, { ls: 3, weight: 600 }));
  comps.push(rect(16, 122, W - 32, 1, P.border));

  // Filter tabs
  const tabs = ['All', 'Breakout', 'Volume', 'Trend'];
  let tabX = 16;
  tabs.forEach((t, i) => {
    const tw = t.length * 8 + 18;
    const isActive = i === 0;
    if (isActive) {
      comps.push(rect(tabX, 130, tw, 24, P.accent, { r: 12 }));
      comps.push(text(tabX, 134, tw, 16, t, 10, '#050505', { weight: 700, align: 'center' }));
    } else {
      comps.push(text(tabX, 134, tw, 16, t, 10, P.muted, { align: 'center' }));
    }
    tabX += tw + 10;
  });

  const signals = [
    { type: 'BREAKOUT', sym: 'NVDA', title: 'Resistance break at $880', desc: 'Price exceeded 6-week resistance. Volume 2.4× above average.', time: '2m ago', strength: 94, color: P.accent, action: 'BUY' },
    { type: 'VOLUME',   sym: 'BTC',  title: 'Unusual buying pressure',  desc: 'Spot volume spiked 340% in last 15 min. Whale accumulation.', time: '8m ago', strength: 78, color: P.gold,   action: 'WATCH' },
    { type: 'TREND',    sym: 'TSLA', title: 'Death cross forming',       desc: '50-day MA crossing below 200-day MA. Bearish mid-term outlook.', time: '14m ago', strength: 62, color: P.red, action: 'SELL' },
    { type: 'ALERT',    sym: 'META', title: 'Gap fill target reached',   desc: 'Earnings gap filled. Watch for reversal or continuation.', time: '31m ago', strength: 55, color: P.muted, action: 'NEUTRAL' },
  ];

  signals.forEach((sig, i) => {
    const sy = 164 + i * 138;
    if (sy + 130 > H - 85) return;
    comps.push(rect(16, sy, W - 32, 130, P.card, { r: 10 }));
    comps.push(rect(16, sy, 3, 130, sig.color, { r: 2 }));

    // Header row
    const tbw = sig.type.length * 6.5 + 12;
    comps.push(rect(28, sy + 10, tbw, 18, '#1E1E1E', { r: 4 }));
    comps.push(text(28, sy + 11, tbw, 16, sig.type, 8, sig.color, { weight: 700, ls: 0.5, align: 'center' }));
    comps.push(text(W - 76, sy + 10, 60, 18, sig.sym, 14, P.text, { weight: 800, align: 'right' }));

    // Title
    comps.push(text(28, sy + 34, W - 56, 20, sig.title, 13, P.text, { weight: 600 }));

    // Description
    comps.push(text(28, sy + 56, W - 56, 28, sig.desc, 11, P.muted, { lh: 1.45 }));

    // Strength bar + action
    comps.push(text(28, sy + 90, 70, 12, 'CONFIDENCE', 8, P.muted, { ls: 0.5, weight: 600 }));
    const barW = W - 170;
    comps.push(rect(28, sy + 104, barW, 4, P.border, { r: 2 }));
    comps.push(rect(28, sy + 104, Math.round(barW * sig.strength / 100), 4, sig.color, { r: 2 }));

    const abw = sig.action.length * 7 + 14;
    comps.push(rect(W - abw - 28, sy + 96, abw, 20, '#1E1E1E', { r: 4 }));
    comps.push(text(W - abw - 28, sy + 97, abw, 18, sig.action, 9, sig.color, { weight: 700, ls: 0.5, align: 'center' }));
    comps.push(text(W - 60, sy + 114, 44, 12, sig.time, 10, P.muted, { align: 'right' }));
  });

  nav(comps, 2);
  return { id: makeId(), name: 'Signal Feed', width: W, height: H, components: comps };
}

// ─── SCREEN 4: ASSET DETAIL ───────────────────────────────────────────────────
function buildScreen4() {
  const comps = [];
  comps.push(rect(0, 0, W, H, P.bg));
  comps.push(text(16, 14, 80, 16, '9:41', 12, P.text, { weight: 600 }));

  comps.push(text(16, 56, 20, 24, '←', 18, P.muted));
  comps.push(text(44, 58, W - 96, 20, 'NVIDIA Corporation', 15, P.text, { weight: 600 }));
  comps.push(rect(W - 48, 54, 32, 32, P.card, { r: 8 }));
  comps.push(text(W - 48, 58, 32, 24, '☆', 15, P.muted, { align: 'center' }));

  comps.push(text(16, 90, W - 32, 52, '$882.40', 46, P.text, { weight: 700, ls: -2 }));
  comps.push(rect(16, 148, 108, 26, '#0A1E15', { r: 6 }));
  comps.push(text(24, 154, 92, 14, '+$35.60  +4.2%', 11, P.green, { weight: 600 }));
  comps.push(text(132, 154, 70, 14, 'Today', 11, P.muted));

  // Time range selector
  const ranges = ['1D', '1W', '1M', '3M', 'YTD', '1Y'];
  const rw = (W - 32) / ranges.length;
  ranges.forEach((r, i) => {
    const rx = 16 + i * rw;
    const isActive = i === 0;
    if (isActive) {
      comps.push(rect(rx + 2, 182, rw - 4, 26, P.card, { r: 6 }));
      comps.push(text(rx + 2, 188, rw - 4, 14, r, 11, P.text, { weight: 700, align: 'center' }));
    } else {
      comps.push(text(rx + 2, 188, rw - 4, 14, r, 11, P.muted, { align: 'center' }));
    }
  });

  // Chart area
  const cX = 16, cY = 216, cW = W - 32, cH = 136;
  comps.push(rect(cX, cY, cW, cH, '#080808', { r: 10 }));

  // Y-axis gridlines
  [0, 1, 2, 3].forEach(i => {
    const ly = cY + 12 + i * (cH - 24) / 3;
    comps.push(rect(cX + 44, ly, cW - 50, 1, P.border));
    const lbl = ['$900', '$870', '$840', '$810'][i];
    comps.push(text(cX + 4, ly - 6, 38, 14, lbl, 8, P.muted));
  });

  // Price line (simulated uptrend)
  const pts = [0.3, 0.35, 0.28, 0.42, 0.38, 0.5, 0.46, 0.6, 0.68, 0.62, 0.74, 0.8, 0.76, 0.88, 0.82, 0.92, 0.89, 0.96, 0.94, 1.0];
  const usable = cH - 28;
  pts.forEach((p, i) => {
    if (i === 0) return;
    const x1 = cX + 44 + (i - 1) * ((cW - 52) / (pts.length - 1));
    const x2 = cX + 44 + i * ((cW - 52) / (pts.length - 1));
    const y1 = cY + cH - 16 - pts[i - 1] * usable;
    const y2 = cY + cH - 16 - p * usable;
    const minY = Math.min(y1, y2);
    const segH = Math.max(Math.abs(y2 - y1), 2);
    comps.push(rect(x1, minY, x2 - x1 + 1, segH, P.green, { r: 0 }));
    // Area fill
    comps.push(rect(x1, minY, x2 - x1 + 1, cY + cH - 16 - minY, P.green, { r: 0, opacity: 0.04 }));
  });
  // Current dot + label
  const lastX = cX + 44 + (cW - 52);
  const lastY = cY + cH - 16 - 1.0 * usable;
  comps.push(circle(lastX, lastY, 5, P.green));
  comps.push(rect(lastX + 6, lastY - 9, 56, 18, '#0A1E15', { r: 4 }));
  comps.push(text(lastX + 6, lastY - 8, 56, 16, '$882.40', 9, P.green, { weight: 700 }));

  // Stats grid 2×3
  const statsData = [
    { label: 'OPEN',   val: '$846.80' },
    { label: 'HIGH',   val: '$889.00' },
    { label: 'LOW',    val: '$842.50' },
    { label: 'VOLUME', val: '48.2M' },
    { label: 'MKT CAP',val: '$2.17T' },
    { label: 'P/E',    val: '64.2×' },
  ];
  const sgW = (W - 48) / 3;
  statsData.forEach((s, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const sx = 16 + col * (sgW + 8);
    const sy = 366 + row * 56;
    comps.push(rect(sx, sy, sgW, 48, P.card, { r: 8 }));
    comps.push(text(sx + 8, sy + 6, sgW - 16, 12, s.label, 8, P.muted, { weight: 600, ls: 0.5 }));
    comps.push(text(sx + 8, sy + 22, sgW - 16, 20, s.val, 14, P.text, { weight: 700 }));
  });

  // AI insight
  comps.push(rect(16, 488, W - 32, 62, '#110D0A', { r: 10, stroke: '#2A1E12', sw: 1 }));
  comps.push(text(26, 497, 24, 20, '⚡', 15));
  comps.push(text(50, 497, W - 74, 16, 'Signal detected', 12, P.accent, { weight: 700 }));
  comps.push(text(50, 516, W - 74, 28, '94% confidence breakout above $889 within 24h.', 11, P.muted, { lh: 1.4 }));

  // Action buttons
  const btnW = (W - 48) / 2;
  comps.push(rect(16, 562, btnW, 46, P.green, { r: 10 }));
  comps.push(text(16, 574, btnW, 22, 'BUY', 16, '#050505', { weight: 800, align: 'center' }));
  comps.push(rect(16 + btnW + 16, 562, btnW, 46, P.card, { r: 10, stroke: P.border, sw: 1 }));
  comps.push(text(16 + btnW + 16, 574, btnW, 22, 'SET ALERT', 13, P.text, { weight: 600, align: 'center' }));

  nav(comps, 1);
  return { id: makeId(), name: 'Asset Detail', width: W, height: H, components: comps };
}

// ─── SCREEN 5: PORTFOLIO ──────────────────────────────────────────────────────
function buildScreen5() {
  const comps = [];
  comps.push(rect(0, 0, W, H, P.bg));
  comps.push(text(16, 14, 80, 16, '9:41', 12, P.text, { weight: 600 }));
  comps.push(text(16, 56, W - 32, 44, 'PORTFOLIO', 34, P.text, { weight: 800, ls: -1 }));

  // Value card
  comps.push(rect(16, 106, W - 32, 78, P.card, { r: 12 }));
  comps.push(text(28, 114, 120, 14, 'TOTAL VALUE', 8, P.muted, { ls: 1, weight: 600 }));
  comps.push(text(28, 130, W - 56, 34, '$284,910.42', 28, P.text, { weight: 700, ls: -1 }));
  comps.push(rect(28, 168, 108, 20, '#0A1E15', { r: 4 }));
  comps.push(text(34, 170, 92, 16, '+$1,847  +0.65%', 11, P.green, { weight: 600 }));
  comps.push(text(W - 88, 170, 72, 16, 'vs yesterday', 10, P.muted, { align: 'right' }));

  // Allocation
  comps.push(text(16, 196, 140, 16, 'A L L O C A T I O N', 9, P.muted, { ls: 3, weight: 600 }));
  const allocs = [
    { label: 'US Stocks', pct: 52, color: P.accent },
    { label: 'Crypto', pct: 28, color: P.gold },
    { label: "Int'l", pct: 12, color: P.green },
    { label: 'Cash', pct: 8, color: P.muted },
  ];
  let barX = 16;
  allocs.forEach(a => {
    const bw = Math.round((W - 32) * a.pct / 100) - 2;
    comps.push(rect(barX, 214, bw, 10, a.color, { r: 2 }));
    barX += bw + 2;
  });
  allocs.forEach((a, i) => {
    const lx = 16 + i * (W - 32) / 4;
    comps.push(rect(lx, 232, 8, 8, a.color, { r: 2 }));
    comps.push(text(lx + 12, 230, 64, 12, a.label, 9, P.muted));
    comps.push(text(lx, 244, 64, 14, a.pct + '%', 11, P.text, { weight: 700 }));
  });

  // Holdings
  comps.push(text(16, 268, 130, 16, 'H O L D I N G S', 9, P.muted, { ls: 3, weight: 600 }));
  const holdings = [
    { sym: 'BTC',  name: 'Bitcoin',  shares: '1.2',  val: '$80,808', chg: '+2.8%', pos: true,  pct: 28.4 },
    { sym: 'AAPL', name: 'Apple',    shares: '220',  val: '$46,974', chg: '+1.2%', pos: true,  pct: 16.5 },
    { sym: 'ETH',  name: 'Ethereum', shares: '14',   val: '$49,294', chg: '+0.8%', pos: true,  pct: 17.3 },
    { sym: 'NVDA', name: 'NVIDIA',   shares: '38',   val: '$33,531', chg: '+4.2%', pos: true,  pct: 11.8 },
    { sym: 'TSLA', name: 'Tesla',    shares: '90',   val: '$16,184', chg: '-2.1%', pos: false, pct: 5.7  },
  ];
  holdings.forEach((h, i) => {
    const hy = 288 + i * 70;
    if (hy + 62 > H - 85) return;
    comps.push(rect(16, hy, W - 32, 62, P.card, { r: 8 }));
    // Portfolio weight bar at bottom
    comps.push(rect(16, hy + 58, Math.round((W - 32) * h.pct / 100), 4, h.pos ? P.green : P.red, { r: 0, opacity: 0.45 }));
    comps.push(text(28, hy + 8, 60, 20, h.sym, 15, P.text, { weight: 700 }));
    comps.push(text(28, hy + 32, 90, 14, h.shares + ' units', 11, P.muted));
    comps.push(text(W / 2 - 36, hy + 8, 80, 20, h.val, 13, P.text, { weight: 600, align: 'right' }));
    comps.push(text(W / 2 - 36, hy + 32, 80, 14, h.pct + '% of portfolio', 9, P.muted, { align: 'right' }));
    comps.push(rect(W - 80, hy + 18, 64, 22, h.pos ? '#0A1E15' : '#1E0A10', { r: 5 }));
    comps.push(text(W - 80, hy + 20, 64, 18, h.chg, 12, h.pos ? P.green : P.red, { weight: 700, align: 'center' }));
  });

  nav(comps, 3);
  return { id: makeId(), name: 'Portfolio', width: W, height: H, components: comps };
}

// ─── SCREEN 6: ALERTS ─────────────────────────────────────────────────────────
function buildScreen6() {
  const comps = [];
  comps.push(rect(0, 0, W, H, P.bg));
  comps.push(text(16, 14, 80, 16, '9:41', 12, P.text, { weight: 600 }));
  comps.push(text(16, 56, W - 32, 44, 'ALERTS', 38, P.text, { weight: 800, ls: -1 }));
  comps.push(text(16, 102, W - 32, 16, 'S M A R T  N O T I F I C A T I O N S', 9, P.muted, { ls: 3, weight: 600 }));
  comps.push(rect(16, 122, W - 32, 1, P.border));

  // Active count banner
  comps.push(rect(16, 130, W - 32, 42, '#0F1510', { r: 8 }));
  comps.push(circle(32, 151, 7, P.green));
  comps.push(text(46, 138, W - 76, 26, '6 active alerts watching your portfolio', 12, P.text, { weight: 500 }));

  const alerts = [
    { sym: 'NVDA', type: 'PRICE TARGET',  condition: 'Above $900.00',          on: true,  color: P.accent },
    { sym: 'BTC',  type: 'VOLUME SPIKE',  condition: 'Daily volume > 2× avg',  on: true,  color: P.gold   },
    { sym: 'TSLA', type: 'STOP LOSS',     condition: 'Below $170.00',           on: true,  color: P.red    },
    { sym: 'META', type: 'AI SIGNAL',     condition: 'Confidence > 80%',        on: false, color: P.muted  },
    { sym: 'Any',  type: 'MARKET OPEN',   condition: '9:30 AM EST daily',       on: true,  color: P.green  },
  ];

  alerts.forEach((a, i) => {
    const ay = 182 + i * 76;
    if (ay + 68 > H - 168) return;
    comps.push(rect(16, ay, W - 32, 68, P.card, { r: 10 }));
    comps.push(rect(16, ay, 3, 68, a.on ? a.color : P.border, { r: 2 }));
    comps.push(text(28, ay + 9, 50, 18, a.sym, 14, P.text, { weight: 700 }));
    const tbw = a.type.length * 5.8 + 10;
    comps.push(rect(84, ay + 10, tbw, 16, '#1E1E1E', { r: 4 }));
    comps.push(text(84, ay + 11, tbw, 14, a.type, 7.5, a.on ? a.color : P.muted, { weight: 700, ls: 0.5, align: 'center' }));
    comps.push(text(28, ay + 34, W - 100, 16, a.condition, 12, P.muted));
    // Toggle
    comps.push(rect(W - 72, ay + 22, 44, 24, a.on ? P.accent : P.border, { r: 12 }));
    comps.push(circle(a.on ? W - 72 + 32 : W - 72 + 12, ay + 34, 9, a.on ? '#050505' : P.muted));
  });

  // Add button
  comps.push(rect(16, 574, W - 32, 46, P.card, { r: 10, stroke: P.border, sw: 1 }));
  comps.push(text(W / 2 - 10, 582, 20, 26, '+', 22, P.accent, { align: 'center', weight: 300 }));
  comps.push(text(W / 2 + 14, 585, 110, 20, 'New alert rule', 13, P.text, { weight: 400 }));

  // PRO upgrade card
  comps.push(rect(16, 630, W - 32, 78, '#110D08', { r: 12, stroke: '#2A1E12', sw: 1 }));
  comps.push(text(28, 640, 80, 18, '⚡ PRO', 13, P.gold, { weight: 800 }));
  comps.push(text(28, 660, W - 120, 16, 'Unlimited alerts + real-time AI signals', 12, P.text, { weight: 500 }));
  comps.push(text(28, 678, W - 120, 16, 'First 3 months free', 11, P.muted));
  comps.push(rect(W - 112, 644, 88, 32, P.gold, { r: 8 }));
  comps.push(text(W - 112, 651, 88, 18, 'UPGRADE', 11, '#050505', { weight: 800, align: 'center' }));

  nav(comps, 4);
  return { id: makeId(), name: 'Alerts', width: W, height: H, components: comps };
}

// ─── ASSEMBLE ────────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'Signal — Market Intelligence',
  description: 'Dark editorial market intelligence. Inspired by Darkroom.au full-bleed condensed typography on jet black, Midday.ai feature tab showcases, and Tracebit letter-spaced headings.',
  screens: [buildScreen1(), buildScreen2(), buildScreen3(), buildScreen4(), buildScreen5(), buildScreen6()],
  metadata: {
    createdAt: new Date().toISOString(),
    author: 'RAM Design Heartbeat',
    tags: ['dark', 'finance', 'trading', 'editorial', 'data-dense'],
    palette: P,
  }
};

fs.writeFileSync('signal.pen', JSON.stringify(pen, null, 2));
console.log('✓ signal.pen written —', pen.screens.length, 'screens');
console.log('  Screens:', pen.screens.map(s => s.name).join(', '));
