'use strict';
const fs = require('fs'), path = require('path');

const SLUG = 'wick';
const NAME = 'WICK';
const TAGLINE = 'read the market, feel the move';

// Canvas
const W = 390, H = 844;

// Palette — warm near-black with amber/gold accent
const BG     = '#0B0A07';
const SURF   = '#141209';
const CARD   = '#1E1A10';
const CARD2  = '#252015';
const ACC    = '#F59E0B';   // amber
const ACC2   = '#EF4444';   // red (loss)
const GREEN  = '#22C55E';   // green (gain)
const TEXT   = '#F5F0E8';   // warm off-white
const MUTED  = 'rgba(245,240,232,0.38)';
const DIM    = 'rgba(245,240,232,0.12)';
const GLOW   = 'rgba(245,158,11,0.18)';

const elements = [];

// ── primitives ────────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  const el = { type: 'rect', x, y, width: w, height: h, fill };
  if (opts.rx     !== undefined) el.rx = opts.rx;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  if (opts.stroke)  { el.stroke = opts.stroke; el.strokeWidth = opts.sw || 1; }
  return el;
}
function text(x, y, content, size, fill, opts = {}) {
  const el = { type: 'text', x, y, content: String(content), fontSize: size, fill };
  if (opts.fw)     el.fontWeight = opts.fw;
  if (opts.font)   el.fontFamily = opts.font;
  if (opts.anchor) el.textAnchor = opts.anchor;
  if (opts.ls)     el.letterSpacing = opts.ls;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  if (opts.decoration) el.textDecoration = opts.decoration;
  return el;
}
function circle(cx, cy, r, fill, opts = {}) {
  const el = { type: 'circle', cx, cy, r, fill };
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  if (opts.stroke)  { el.stroke = opts.stroke; el.strokeWidth = opts.sw || 1; }
  return el;
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  const el = { type: 'line', x1, y1, x2, y2, stroke };
  el.strokeWidth = opts.sw || 1;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  return el;
}
function poly(points, fill, opts = {}) {
  const el = { type: 'polygon', points };
  el.fill = fill;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  if (opts.stroke)  { el.stroke = opts.stroke; el.strokeWidth = opts.sw || 1; }
  return el;
}

// ── screen builder ────────────────────────────────────────────────────────────
const screens = [];

function makeScreen(name, builderFn) {
  const els = [];
  // base background
  els.push(rect(0, 0, W, H, BG));
  builderFn(els);
  screens.push({ name, svg: '', elements: els });
}

// ── shared helpers ────────────────────────────────────────────────────────────
function statusBar(els) {
  // status bar bg
  els.push(rect(0, 0, W, 44, SURF));
  // time
  els.push(text(20, 28, '9:41', 14, TEXT, { fw: '600' }));
  // signal dots
  for (let i = 0; i < 3; i++) els.push(circle(310 + i * 8, 22, 3, TEXT, { opacity: 0.6 + i * 0.2 }));
  // wifi
  els.push(text(335, 28, '▲', 10, TEXT, { opacity: 0.7 }));
  // battery
  els.push(rect(350, 16, 24, 12, 'none', { stroke: TEXT, sw: 1.2, rx: 2, opacity: 0.6 }));
  els.push(rect(374, 19, 2, 6, TEXT, { rx: 1, opacity: 0.5 }));
  els.push(rect(352, 18, 16, 8, TEXT, { rx: 1, opacity: 0.8 }));
}

function navBar(els, active) {
  const tabs = [
    { id: 'home',     label: 'Home',    icon: '◈' },
    { id: 'markets',  label: 'Markets', icon: '▲' },
    { id: 'trade',    label: 'Trade',   icon: '⊕' },
    { id: 'alerts',   label: 'Alerts',  icon: '◉' },
    { id: 'portfolio',label: 'Port.',   icon: '◫' },
  ];
  const navY = H - 80;
  els.push(rect(0, navY, W, 80, SURF));
  els.push(line(0, navY, W, navY, DIM, { sw: 1 }));
  tabs.forEach((tab, i) => {
    const x = 39 + i * 78;
    const isActive = tab.id === active;
    const col = isActive ? ACC : MUTED;
    els.push(text(x, navY + 26, tab.icon, 18, col, { anchor: 'middle', fw: isActive ? '700' : '400' }));
    els.push(text(x, navY + 46, tab.label, 10, col, { anchor: 'middle', fw: isActive ? '600' : '400' }));
    if (isActive) {
      els.push(rect(x - 18, navY + 3, 36, 2, ACC, { rx: 1 }));
    }
  });
}

function candleRow(els, x, y, open, close, high, low, width = 8) {
  const isGreen = close >= open;
  const color = isGreen ? GREEN : ACC2;
  const bodyH = Math.abs(close - open);
  const bodyY = Math.min(open, close);
  // wick
  els.push(line(x + width / 2, high, x + width / 2, low, color, { sw: 1.5, opacity: 0.7 }));
  // body
  els.push(rect(x, bodyY, width, Math.max(2, bodyH), color, { rx: 1 }));
}

// ─── Screen 1: Dashboard ──────────────────────────────────────────────────────
makeScreen('Dashboard', (els) => {
  statusBar(els);

  // Header
  els.push(text(20, 76, 'WICK', 18, ACC, { fw: '800', ls: '0.12em' }));
  els.push(text(W - 20, 76, '⊙', 22, MUTED, { anchor: 'end' }));

  // Portfolio hero value
  els.push(text(W / 2, 135, 'Portfolio', 12, MUTED, { anchor: 'middle', ls: '0.08em' }));
  els.push(text(W / 2, 195, '$84,291', 54, TEXT, { fw: '700', anchor: 'middle', font: 'system-ui' }));
  els.push(rect(W / 2 - 50, 205, 100, 1.5, DIM, { rx: 1 }));
  // gain badge
  els.push(rect(W / 2 - 38, 214, 76, 24, 'rgba(34,197,94,0.15)', { rx: 12 }));
  els.push(text(W / 2, 231, '▲ +$1,284  +1.55%', 11, GREEN, { anchor: 'middle', fw: '600' }));

  // Sparkline mini chart (background glow)
  els.push(rect(20, 250, W - 40, 70, CARD, { rx: 12 }));
  els.push(rect(20, 250, W - 40, 70, GLOW, { rx: 12, opacity: 0.5 }));

  // Draw simple sparkline
  const spkData = [42, 55, 48, 61, 58, 70, 65, 74, 68, 80, 75, 88, 82, 92, 88];
  const spkX0 = 32, spkY0 = 254, spkW = W - 64, spkH = 62;
  for (let i = 0; i < spkData.length - 1; i++) {
    const x1 = spkX0 + (i / (spkData.length - 1)) * spkW;
    const x2 = spkX0 + ((i + 1) / (spkData.length - 1)) * spkW;
    const y1 = spkY0 + spkH - (spkData[i] / 100) * spkH;
    const y2 = spkY0 + spkH - (spkData[i + 1] / 100) * spkH;
    els.push(line(x1, y1, x2, y2, ACC, { sw: 2, opacity: 0.8 }));
  }
  // Dot at end
  const lastX = spkX0 + spkW;
  const lastY = spkY0 + spkH - (spkData[spkData.length - 1] / 100) * spkH;
  els.push(circle(lastX, lastY, 4, ACC));
  els.push(circle(lastX, lastY, 8, ACC, { opacity: 0.25 }));

  // Time range tabs
  const ranges = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];
  els.push(rect(20, 332, W - 40, 28, SURF, { rx: 8 }));
  ranges.forEach((r, i) => {
    const rx = 28 + i * 58;
    const isActive = i === 0;
    if (isActive) els.push(rect(rx - 10, 335, 40, 22, CARD2, { rx: 6 }));
    els.push(text(rx + 10, 351, r, 11, isActive ? ACC : MUTED, { anchor: 'middle', fw: isActive ? '700' : '400' }));
  });

  // Top movers section
  els.push(text(20, 385, 'Top Movers', 13, TEXT, { fw: '700', ls: '0.04em' }));
  els.push(text(W - 20, 385, 'See all →', 12, ACC, { anchor: 'end' }));

  const movers = [
    { sym: 'BTC', name: 'Bitcoin',  price: '$71,240', chg: '+2.3%', up: true },
    { sym: 'ETH', name: 'Ethereum', price: '$3,812',  chg: '+1.8%', up: true },
    { sym: 'SOL', name: 'Solana',   price: '$188',    chg: '-0.9%', up: false },
  ];
  movers.forEach((m, i) => {
    const my = 398 + i * 68;
    els.push(rect(20, my, W - 40, 60, CARD, { rx: 12 }));
    // Icon circle
    els.push(circle(52, my + 30, 16, m.up ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'));
    els.push(text(52, my + 36, m.sym[0], 14, m.up ? GREEN : ACC2, { anchor: 'middle', fw: '700' }));
    // Symbol + name
    els.push(text(80, my + 24, m.sym, 14, TEXT, { fw: '700' }));
    els.push(text(80, my + 42, m.name, 12, MUTED));
    // Price + change
    els.push(text(W - 32, my + 24, m.price, 14, TEXT, { fw: '600', anchor: 'end' }));
    const chgCol = m.up ? GREEN : ACC2;
    els.push(rect(W - 32 - 52, my + 32, 52, 18, m.up ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', { rx: 9 }));
    els.push(text(W - 32 - 26, my + 45, m.chg, 11, chgCol, { anchor: 'middle', fw: '600' }));
  });

  // Quick actions
  const actions = [{ icon: '↑', label: 'Buy' }, { icon: '↓', label: 'Sell' }, { icon: '⇄', label: 'Swap' }, { icon: '◈', label: 'Watch' }];
  const actY = 610;
  els.push(rect(20, actY, W - 40, 72, CARD, { rx: 14 }));
  actions.forEach((a, i) => {
    const ax = 56 + i * 80;
    els.push(circle(ax, actY + 28, 20, CARD2));
    els.push(text(ax, actY + 34, a.icon, 16, ACC, { anchor: 'middle', fw: '700' }));
    els.push(text(ax, actY + 54, a.label, 11, MUTED, { anchor: 'middle' }));
  });

  // Ambient glow behind CTA area
  els.push(rect(20, actY - 2, W - 40, 4, ACC, { opacity: 0.06, rx: 2 }));

  navBar(els, 'home');
});

// ─── Screen 2: Markets ────────────────────────────────────────────────────────
makeScreen('Markets', (els) => {
  statusBar(els);

  // Header
  els.push(text(20, 76, 'Markets', 22, TEXT, { fw: '700' }));
  els.push(text(20, 96, 'Live prices · Last updated 9:41 AM', 11, MUTED));

  // Search bar
  els.push(rect(20, 108, W - 40, 40, CARD, { rx: 12 }));
  els.push(text(44, 133, '⌕', 16, MUTED, { opacity: 0.6 }));
  els.push(text(64, 133, 'Search coins...', 14, MUTED));

  // Filter tabs
  const cats = ['All', 'Gainers', 'Losers', 'Trending', 'New'];
  let tabX = 20;
  cats.forEach((c, i) => {
    const tw = c.length * 8 + 20;
    const isActive = i === 0;
    els.push(rect(tabX, 156, tw, 26, isActive ? ACC : CARD, { rx: 13 }));
    els.push(text(tabX + tw / 2, 174, c, 12, isActive ? '#0B0A07' : MUTED, { anchor: 'middle', fw: isActive ? '700' : '500' }));
    tabX += tw + 8;
  });

  // Column headers
  els.push(text(20, 205, 'Asset', 11, MUTED, { fw: '600', ls: '0.06em' }));
  els.push(text(W / 2, 205, '7-day', 11, MUTED, { fw: '600', anchor: 'middle', ls: '0.06em' }));
  els.push(text(W - 20, 205, 'Price / Change', 11, MUTED, { fw: '600', anchor: 'end', ls: '0.06em' }));
  els.push(line(20, 212, W - 20, 212, DIM, { sw: 1 }));

  // Market rows with sparklines
  const coins = [
    { sym: 'BTC', name: 'Bitcoin',   price: '$71,240', chg: '+2.31%', up: true,  data: [30,35,28,42,38,50,45,58,52,65,60,72,68,80,75] },
    { sym: 'ETH', name: 'Ethereum',  price: '$3,812',  chg: '+1.84%', up: true,  data: [45,48,44,52,49,55,60,58,65,62,68,65,72,70,75] },
    { sym: 'SOL', name: 'Solana',    price: '$188.40', chg: '-0.92%', up: false, data: [70,68,72,65,68,62,58,65,60,55,58,52,48,50,45] },
    { sym: 'BNB', name: 'BNB',       price: '$412.80', chg: '+3.12%', up: true,  data: [20,25,30,28,35,32,40,38,45,50,55,52,60,62,70] },
    { sym: 'ADA', name: 'Cardano',   price: '$0.482',  chg: '-1.23%', up: false, data: [60,58,55,60,52,55,48,50,45,42,45,40,38,35,33] },
    { sym: 'DOT', name: 'Polkadot',  price: '$7.84',   chg: '+0.64%', up: true,  data: [40,42,40,44,42,46,44,48,46,50,52,50,54,56,58] },
  ];

  coins.forEach((coin, i) => {
    const rowY = 220 + i * 66;
    // hover effect on first row
    if (i === 0) els.push(rect(12, rowY - 4, W - 24, 60, GLOW, { rx: 10, opacity: 0.35 }));
    // Icon
    const iconCol = coin.up ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)';
    els.push(circle(40, rowY + 22, 18, iconCol));
    els.push(text(40, rowY + 28, coin.sym[0], 13, coin.up ? GREEN : ACC2, { anchor: 'middle', fw: '700' }));
    // Name
    els.push(text(68, rowY + 18, coin.sym, 14, TEXT, { fw: '700' }));
    els.push(text(68, rowY + 36, coin.name, 11, MUTED));
    // Sparkline
    const spW = 70, spH = 32, spX = 155, spY = rowY + 8;
    for (let j = 0; j < coin.data.length - 1; j++) {
      const x1 = spX + (j / (coin.data.length - 1)) * spW;
      const x2 = spX + ((j + 1) / (coin.data.length - 1)) * spW;
      const y1 = spY + spH - (coin.data[j] / 100) * spH;
      const y2 = spY + spH - (coin.data[j + 1] / 100) * spH;
      els.push(line(x1, y1, x2, y2, coin.up ? GREEN : ACC2, { sw: 1.5, opacity: 0.7 }));
    }
    // Price + change
    els.push(text(W - 20, rowY + 18, coin.price, 14, TEXT, { fw: '600', anchor: 'end' }));
    const chgCol = coin.up ? GREEN : ACC2;
    const chgBg  = coin.up ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)';
    const chgW = coin.chg.length * 7 + 10;
    els.push(rect(W - 20 - chgW, rowY + 28, chgW, 18, chgBg, { rx: 9 }));
    els.push(text(W - 20 - chgW / 2, rowY + 41, coin.chg, 11, chgCol, { anchor: 'middle', fw: '600' }));
    if (i < coins.length - 1) els.push(line(20, rowY + 60, W - 20, rowY + 60, DIM, { sw: 1 }));
  });

  navBar(els, 'markets');
});

// ─── Screen 3: Chart (Candlestick) ────────────────────────────────────────────
makeScreen('Chart', (els) => {
  statusBar(els);

  // Header
  els.push(text(20, 72, '←', 20, TEXT, { fw: '300' }));
  els.push(text(W / 2, 68, 'BTC / USD', 16, TEXT, { fw: '700', anchor: 'middle' }));
  els.push(text(W / 2, 84, 'Bitcoin', 11, MUTED, { anchor: 'middle' }));
  els.push(text(W - 20, 72, '⋯', 22, MUTED, { anchor: 'end' }));

  // Current price hero
  els.push(text(20, 118, '$71,240.50', 36, TEXT, { fw: '700' }));
  els.push(rect(20, 126, 90, 22, 'rgba(34,197,94,0.15)', { rx: 11 }));
  els.push(text(65, 141, '▲ +2.31%  Today', 11, GREEN, { anchor: 'middle', fw: '600' }));

  // Time range
  const ranges = ['15m', '1H', '4H', '1D', '1W'];
  els.push(rect(20, 152, W - 40, 28, CARD, { rx: 8 }));
  ranges.forEach((r, i) => {
    const rx2 = 42 + i * 66;
    const isActive = i === 3;
    if (isActive) els.push(rect(rx2 - 16, 155, 42, 22, ACC, { rx: 6 }));
    els.push(text(rx2 + 5, 171, r, 12, isActive ? '#0B0A07' : MUTED, { anchor: 'middle', fw: isActive ? '700' : '500' }));
  });

  // Candlestick chart area
  const chartX = 20, chartY = 190, chartW = W - 60, chartH = 240;
  els.push(rect(chartX, chartY, chartW + 40, chartH, CARD, { rx: 12 }));

  // Grid lines
  for (let g = 0; g < 5; g++) {
    const gy = chartY + (g / 4) * chartH;
    els.push(line(chartX + 8, gy, chartX + chartW + 8, gy, DIM, { sw: 1, opacity: 0.5 }));
    const priceVal = 72400 - g * 800;
    els.push(text(chartX + chartW + 14, gy + 4, '$' + (priceVal / 1000).toFixed(1) + 'K', 9, MUTED));
  }

  // Candles
  const candleData = [
    {o:45,c:62,h:65,l:42}, {o:62,c:58,h:66,l:55}, {o:58,c:70,h:74,l:56},
    {o:70,c:65,h:72,l:62}, {o:65,c:78,h:82,l:63}, {o:78,c:74,h:80,l:70},
    {o:74,c:82,h:86,l:72}, {o:82,c:80,h:85,l:77}, {o:80,c:88,h:92,l:78},
    {o:88,c:84,h:90,l:80}, {o:84,c:92,h:96,l:82}, {o:92,c:88,h:94,l:84},
    {o:88,c:95,h:98,l:86}, {o:95,c:93,h:97,l:90}, {o:93,c:98,h:100,l:91},
  ];
  const cW = 14, cGap = 4;
  const totalCW = candleData.length * (cW + cGap);
  const cStartX = chartX + 10 + (chartW - totalCW) / 2;

  candleData.forEach((c, i) => {
    const cx = cStartX + i * (cW + cGap);
    const toY = (v) => chartY + chartH - (v / 100) * (chartH - 16) - 8;
    const oh = toY(c.o), ch = toY(c.c), hh = toY(c.h), lh = toY(c.l);
    const isGreen = c.c >= c.o;
    const color = isGreen ? GREEN : ACC2;
    els.push(line(cx + cW / 2, hh, cx + cW / 2, lh, color, { sw: 1.5, opacity: 0.7 }));
    els.push(rect(cx, Math.min(oh, ch), cW, Math.max(2, Math.abs(ch - oh)), color, { rx: 1.5 }));
  });

  // Current price line
  const priceLineY = chartY + chartH - (98 / 100) * (chartH - 16) - 8;
  els.push(line(chartX + 8, priceLineY, chartX + chartW + 8, priceLineY, ACC, { sw: 1.5, opacity: 0.6 }));
  // dashed line effect via dots
  for (let d = 0; d < 20; d++) {
    const dx = chartX + 10 + d * 17;
    if (dx < chartX + chartW) {
      els.push(rect(dx, priceLineY - 0.5, 10, 1, ACC, { opacity: 0.5 }));
    }
  }

  // Volume bars
  const volY = chartY + chartH + 6;
  els.push(rect(chartX, volY, chartW + 40, 44, SURF, { rx: 8 }));
  els.push(text(chartX + 8, volY + 14, 'Volume', 10, MUTED, { fw: '600', ls: '0.06em' }));
  candleData.forEach((c, i) => {
    const bx = cStartX + i * (cW + cGap);
    const bh = 16 + Math.random() * 12;
    const isGreen = c.c >= c.o;
    els.push(rect(bx, volY + 44 - bh, cW, bh, isGreen ? GREEN : ACC2, { rx: 2, opacity: 0.5 }));
  });

  // Buy/Sell buttons
  const btnY = volY + 52;
  els.push(rect(20, btnY, (W - 50) / 2, 52, GREEN, { rx: 14 }));
  els.push(text(20 + (W - 50) / 4, btnY + 22, '▲', 16, '#0B0A07', { anchor: 'middle', fw: '700' }));
  els.push(text(20 + (W - 50) / 4, btnY + 40, 'Buy BTC', 13, '#0B0A07', { anchor: 'middle', fw: '700' }));

  els.push(rect(W / 2 + 5, btnY, (W - 50) / 2, 52, ACC2, { rx: 14 }));
  els.push(text(W / 2 + 5 + (W - 50) / 4, btnY + 22, '▼', 16, '#fff', { anchor: 'middle', fw: '700' }));
  els.push(text(W / 2 + 5 + (W - 50) / 4, btnY + 40, 'Sell BTC', 13, '#fff', { anchor: 'middle', fw: '700' }));

  // Glow under buy button
  els.push(rect(20, btnY + 50, (W - 50) / 2, 6, GREEN, { opacity: 0.18, rx: 3 }));

  navBar(els, 'markets');
});

// ─── Screen 4: Trade Order ────────────────────────────────────────────────────
makeScreen('Trade', (els) => {
  statusBar(els);

  els.push(text(20, 76, 'Place Order', 20, TEXT, { fw: '700' }));
  els.push(text(W - 20, 76, '?', 18, MUTED, { anchor: 'end' }));

  // Order type tabs
  const types = ['Market', 'Limit', 'Stop', 'OCO'];
  let tabX2 = 20;
  types.forEach((t, i) => {
    const tw = (W - 40 - 24) / 4;
    const isActive = i === 1;
    els.push(rect(tabX2, 92, tw, 32, isActive ? CARD2 : SURF, { rx: 8 }));
    if (isActive) els.push(rect(tabX2, 120, tw, 2, ACC, { rx: 1 }));
    els.push(text(tabX2 + tw / 2, 113, t, 13, isActive ? ACC : MUTED, { anchor: 'middle', fw: isActive ? '700' : '500' }));
    tabX2 += tw + 8;
  });

  // Order side
  els.push(rect(20, 136, (W - 48) / 2, 38, 'rgba(34,197,94,0.2)', { rx: 10 }));
  els.push(text(20 + (W - 48) / 4, 160, '▲  Buy', 14, GREEN, { anchor: 'middle', fw: '700' }));
  els.push(rect(W / 2 + 4, 136, (W - 48) / 2, 38, CARD, { rx: 10 }));
  els.push(text(W / 2 + 4 + (W - 48) / 4, 160, '▼  Sell', 14, MUTED, { anchor: 'middle', fw: '500' }));

  // From / To asset
  const fieldY = [184, 244, 304];
  const labels = ['Asset', 'Limit Price', 'Amount'];
  const values = ['BTC  Bitcoin', '$71,200.00', '0.025 BTC'];
  const subs   = ['Current: $71,240.50', 'Market: $71,240  ↓ 0.06%', 'USD Value: $1,780.00'];

  labels.forEach((lb, i) => {
    const fy = fieldY[i];
    els.push(text(20, fy, lb, 11, MUTED, { fw: '600', ls: '0.06em' }));
    els.push(rect(20, fy + 8, W - 40, 50, CARD, { rx: 12, stroke: i === 1 ? ACC : 'transparent', sw: 1.5 }));
    els.push(text(36, fy + 38, values[i], 15, TEXT, { fw: '600' }));
    els.push(text(W - 36, fy + 38, subs[i], 11, MUTED, { anchor: 'end' }));
    // active field indicator
    if (i === 1) {
      els.push(rect(36, fy + 44, 80, 1.5, ACC, { rx: 1 }));
    }
  });

  // Order summary
  els.push(rect(20, 372, W - 40, 110, CARD2, { rx: 14 }));
  els.push(text(20 + 16, 397, 'Order Summary', 12, MUTED, { fw: '700', ls: '0.06em' }));
  const summary = [
    ['Est. Total', '$1,780.00'],
    ['Trading Fee (0.1%)', '$1.78'],
    ['Net Total', '$1,781.78'],
  ];
  summary.forEach((row, i) => {
    const ry = 414 + i * 22;
    els.push(text(36, ry, row[0], 12, i === 2 ? TEXT : MUTED, { fw: i === 2 ? '700' : '400' }));
    els.push(text(W - 36, ry, row[1], 12, i === 2 ? ACC : MUTED, { anchor: 'end', fw: i === 2 ? '700' : '400' }));
  });
  els.push(line(36, 432, W - 36, 432, DIM, { sw: 1 }));

  // Balance
  els.push(rect(20, 494, W - 40, 48, CARD, { rx: 12 }));
  els.push(text(36, 519, 'Available Balance', 12, MUTED));
  els.push(text(W - 36, 519, '$8,420.00 USDT', 13, TEXT, { anchor: 'end', fw: '600' }));

  // Slider
  els.push(rect(20, 552, W - 40, 4, CARD2, { rx: 2 }));
  els.push(rect(20, 552, (W - 40) * 0.42, 4, ACC, { rx: 2 }));
  els.push(circle(20 + (W - 40) * 0.42, 554, 8, ACC));
  els.push(circle(20 + (W - 40) * 0.42, 554, 14, ACC, { opacity: 0.15 }));
  const pcts = ['25%', '50%', '75%', '100%'];
  pcts.forEach((p, i) => {
    const px = 20 + ((i + 1) / 4) * (W - 40);
    els.push(text(px, 576, p, 10, MUTED, { anchor: 'middle' }));
  });

  // CTA
  els.push(rect(20, 592, W - 40, 56, GREEN, { rx: 16 }));
  // Glow
  els.push(rect(28, 644, W - 56, 8, GREEN, { opacity: 0.25, rx: 4 }));
  els.push(text(W / 2, 624, 'Place Buy Order', 16, '#0B0A07', { anchor: 'middle', fw: '800', ls: '0.04em' }));

  // Warning
  els.push(text(W / 2, 668, '⚠ Limit orders may not execute immediately', 11, MUTED, { anchor: 'middle', opacity: 0.7 }));

  navBar(els, 'trade');
});

// ─── Screen 5: Alerts ─────────────────────────────────────────────────────────
makeScreen('Alerts', (els) => {
  statusBar(els);

  els.push(text(20, 76, 'Alerts', 22, TEXT, { fw: '700' }));
  els.push(rect(W - 58, 58, 38, 30, CARD2, { rx: 10 }));
  els.push(text(W - 39, 78, '+', 22, ACC, { anchor: 'middle', fw: '300' }));

  // Summary bar
  els.push(rect(20, 94, W - 40, 50, CARD, { rx: 12 }));
  els.push(text(36, 117, '◉', 14, GREEN));
  els.push(text(56, 117, '3 active alerts', 13, TEXT, { fw: '600' }));
  els.push(text(W - 36, 117, '1 triggered today', 12, MUTED, { anchor: 'end' }));

  // Section: Active Alerts
  els.push(text(20, 162, 'Active', 12, MUTED, { fw: '700', ls: '0.08em' }));

  const alerts = [
    { coin: 'BTC', dir: '▲', cond: 'Price above', val: '$72,000', dist: '1.1% away', col: GREEN },
    { coin: 'ETH', dir: '▲', cond: 'Price above', val: '$4,000',  dist: '4.9% away', col: GREEN },
    { coin: 'SOL', dir: '▼', cond: 'Price below', val: '$175',    dist: '7.1% away', col: ACC2  },
  ];

  alerts.forEach((a, i) => {
    const ay = 174 + i * 74;
    els.push(rect(20, ay, W - 40, 64, CARD, { rx: 12 }));
    // coin badge
    const bc = a.col === GREEN ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)';
    els.push(circle(52, ay + 32, 18, bc));
    els.push(text(52, ay + 38, a.coin[0], 13, a.col, { anchor: 'middle', fw: '700' }));
    // coin + condition
    els.push(text(80, ay + 24, a.coin + '  ' + a.dir + ' ' + a.val, 14, TEXT, { fw: '600' }));
    els.push(text(80, ay + 42, a.cond, 11, MUTED));
    // distance badge
    const dw = a.dist.length * 7 + 12;
    els.push(rect(W - 32 - dw, ay + 24, dw, 18, a.col === GREEN ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', { rx: 9 }));
    els.push(text(W - 32 - dw / 2, ay + 37, a.dist, 10, a.col, { anchor: 'middle', fw: '600' }));
    // toggle
    const tgX = W - 36;
    const tgY = ay + 52;
    els.push(rect(tgX - 26, tgY - 10, 26, 14, a.col, { rx: 7, opacity: 0.9 }));
    els.push(circle(tgX - 6, tgY - 3, 6, '#fff'));
  });

  // Triggered section
  els.push(text(20, 406, 'Triggered', 12, MUTED, { fw: '700', ls: '0.08em' }));

  els.push(rect(20, 418, W - 40, 64, CARD, { rx: 12, opacity: 0.6 }));
  els.push(rect(20, 418, 3, 64, ACC, { rx: 1.5 }));
  els.push(circle(50, 450, 18, 'rgba(245,158,11,0.15)'));
  els.push(text(50, 456, 'B', 13, ACC, { anchor: 'middle', fw: '700' }));
  els.push(text(78, 440, 'BTC hit $70,000', 14, TEXT, { fw: '600' }));
  els.push(text(78, 458, 'Triggered today at 6:23 AM', 11, MUTED));
  els.push(text(W - 32, 440, '⟳ Reset', 13, ACC, { anchor: 'end' }));

  // Create new alert CTA
  els.push(rect(20, 500, W - 40, 56, CARD2, { rx: 14, stroke: ACC, sw: 1 }));
  // Glow border
  els.push(rect(20, 500, W - 40, 56, GLOW, { rx: 14, opacity: 0.3 }));
  els.push(text(W / 2, 533, '+ Create New Alert', 15, ACC, { anchor: 'middle', fw: '700' }));

  // Alert tips
  els.push(rect(20, 568, W - 40, 90, SURF, { rx: 12 }));
  els.push(text(36, 590, '💡 Tip', 12, ACC, { fw: '700' }));
  els.push(text(36, 610, 'Set a range alert to trigger when', 12, MUTED));
  els.push(text(36, 628, 'BTC breaks out of its current', 12, MUTED));
  els.push(text(36, 646, '$69K–$73K consolidation zone.', 12, TEXT));

  navBar(els, 'alerts');
});

// ─── Screen 6: Portfolio ──────────────────────────────────────────────────────
makeScreen('Portfolio', (els) => {
  statusBar(els);

  els.push(text(20, 76, 'Portfolio', 22, TEXT, { fw: '700' }));
  els.push(text(20, 96, 'Apr 10, 2026', 11, MUTED));

  // Summary card
  els.push(rect(20, 108, W - 40, 110, CARD, { rx: 16 }));
  // gradient accent stripe
  els.push(rect(20, 108, W - 40, 4, ACC, { rx: 2 }));
  els.push(text(36, 136, 'Total Value', 11, MUTED, { fw: '600', ls: '0.06em' }));
  els.push(text(36, 172, '$84,291.04', 32, TEXT, { fw: '700' }));
  // P&L
  els.push(rect(36, 184, 108, 22, 'rgba(34,197,94,0.15)', { rx: 11 }));
  els.push(text(90, 200, '▲ +$1,284  +1.55%', 11, GREEN, { anchor: 'middle', fw: '600' }));
  // Donut placeholder
  els.push(circle(W - 70, 163, 40, CARD2));
  // Donut segments (arc simulation with wedges)
  els.push(circle(W - 70, 163, 40, 'none', { stroke: ACC, sw: 14, opacity: 0.85 }));
  els.push(circle(W - 70, 163, 40, 'none', { stroke: GREEN, sw: 14, opacity: 0.55 }));
  els.push(circle(W - 70, 163, 26, CARD, {}));
  els.push(text(W - 70, 167, '84%', 12, TEXT, { anchor: 'middle', fw: '700' }));

  // Holdings header
  els.push(text(20, 235, 'Holdings', 13, TEXT, { fw: '700' }));
  els.push(text(W - 20, 235, 'Value / PnL', 12, MUTED, { anchor: 'end' }));
  els.push(line(20, 242, W - 20, 242, DIM, { sw: 1 }));

  const holdings = [
    { sym: 'BTC', name: 'Bitcoin',   qty: '1.184 BTC', val: '$84,380', pnl: '+$2,140', up: true,  pct: 62 },
    { sym: 'ETH', name: 'Ethereum',  qty: '4.2 ETH',   val: '$16,010', pnl: '+$820',   up: true,  pct: 20 },
    { sym: 'SOL', name: 'Solana',    qty: '48 SOL',     val: '$9,043',  pnl: '-$217',   up: false, pct: 11 },
    { sym: 'BNB', name: 'BNB',       qty: '12 BNB',     val: '$4,954',  pnl: '+$140',   up: true,  pct: 6  },
    { sym: 'ADA', name: 'Cardano',   qty: '2,100 ADA',  val: '$1,012',  pnl: '-$34',    up: false, pct: 1  },
  ];

  holdings.forEach((h, i) => {
    const hy = 250 + i * 72;
    // Row bg on hover
    if (i === 0) els.push(rect(12, hy - 3, W - 24, 68, GLOW, { rx: 10, opacity: 0.25 }));
    // Icon
    const ic = h.up ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)';
    els.push(circle(40, hy + 26, 18, ic));
    els.push(text(40, hy + 32, h.sym[0], 13, h.up ? GREEN : ACC2, { anchor: 'middle', fw: '700' }));
    // Sym + qty
    els.push(text(68, hy + 20, h.sym, 14, TEXT, { fw: '700' }));
    els.push(text(68, hy + 38, h.qty, 11, MUTED));
    // Allocation bar
    els.push(rect(68, hy + 48, 100, 3, DIM, { rx: 1.5 }));
    els.push(rect(68, hy + 48, h.pct, 3, h.up ? GREEN : ACC2, { rx: 1.5 }));
    // Value + pnl
    els.push(text(W - 20, hy + 20, h.val, 14, TEXT, { fw: '600', anchor: 'end' }));
    const pc = h.up ? GREEN : ACC2;
    els.push(text(W - 20, hy + 38, h.pnl, 12, pc, { anchor: 'end', fw: '600' }));
    if (i < holdings.length - 1) els.push(line(20, hy + 66, W - 20, hy + 66, DIM, { sw: 1 }));
  });

  // Deposit / Withdraw
  const btnY2 = 622;
  els.push(rect(20, btnY2, (W - 48) / 2, 48, CARD2, { rx: 13 }));
  els.push(text(20 + (W - 48) / 4, btnY2 + 28, '↑  Deposit', 14, TEXT, { anchor: 'middle', fw: '600' }));
  els.push(rect(W / 2 + 4, btnY2, (W - 48) / 2, 48, CARD2, { rx: 13 }));
  els.push(text(W / 2 + 4 + (W - 48) / 4, btnY2 + 28, '↓  Withdraw', 14, MUTED, { anchor: 'middle', fw: '500' }));

  navBar(els, 'portfolio');
});

// ── Build pen file ─────────────────────────────────────────────────────────────
const totalElements = screens.reduce((s, sc) => s + sc.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    tagline: TAGLINE,
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'dark',
    heartbeat: 42,
    screens: screens.length,
    elements: totalElements,
  },
  palette: {
    bg: BG, surface: SURF, card: CARD,
    accent: ACC, accent2: ACC2, text: TEXT, muted: MUTED,
    green: GREEN,
  },
  screens: screens.map(sc => ({
    name: sc.name,
    width: W,
    height: H,
    elements: sc.elements,
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
