// ONYX — Rare Spirits, Collected.
// Dark luxury craft spirits discovery + collection vault
// Inspired by Atlas Card (Godly.website) luxury dark concierge: #000 bg, "Sequel Sans Book"
// + Darkroom.au (DarkModeDesign): #0f0f0f ultra-dark, Swiss typography, product photography
// + Fluid Glass nominee (Awwwards): glass panels on dark
// Theme: DARK — #09090A near-black, #C9873A amber, #8B6B4A muted gold

const fs = require('fs');

const W = 390, H = 844;
const SLUG = 'onyx';

// ── PALETTE ─────────────────────────────────────────────────────────────────
const BG      = '#09090A';   // near-black (Darkroom.au inspired)
const SURF    = '#111113';   // subtle surface lift
const SURF2   = '#1A1A1D';   // elevated card
const SURF3   = '#222227';   // highlight surface
const AMBER   = '#C9873A';   // warm amber gold (spirits/whisky)
const AMBER2  = '#E8AA5A';   // lighter gold highlight
const CREAM   = '#F0E6D0';   // warm off-white text
const MUTED   = 'rgba(240,230,208,0.4)'; // muted cream
const DIM     = 'rgba(240,230,208,0.18)';
const GLASS   = 'rgba(201,135,58,0.08)'; // glass amber tint
const BORDER  = 'rgba(201,135,58,0.15)'; // amber border dim

// ── HELPERS ─────────────────────────────────────────────────────────────────
function pen(id, name, bg, elements) {
  return { id, name, backgroundColor: bg, width: W, height: H, elements };
}

function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, width: w, height: h,
    fill, opacity: opts.opacity ?? 1,
    cornerRadius: opts.r ?? 0,
    stroke: opts.stroke, strokeWidth: opts.strokeWidth ?? 1,
  };
}

function txt(content, x, y, size, color, opts = {}) {
  return {
    type: 'text', content, x, y,
    fontSize: size, color,
    fontWeight: opts.w ?? 400,
    fontFamily: opts.font ?? 'Inter',
    textAlign: opts.align ?? 'left',
    width: opts.width ?? 340,
    opacity: opts.opacity ?? 1,
    letterSpacing: opts.ls ?? 0,
  };
}

function line(x1, y1, x2, y2, color, strokeW = 1, opacity = 1) {
  return { type: 'line', x1, y1, x2, y2, stroke: color, strokeWidth: strokeW, opacity };
}

function circle(cx, cy, r, fill, opts = {}) {
  return {
    type: 'ellipse',
    x: cx - r, y: cy - r,
    width: r * 2, height: r * 2,
    fill,
    stroke: opts.stroke, strokeWidth: opts.strokeWidth ?? 1.5,
    opacity: opts.opacity ?? 1,
  };
}

// ── NAV BAR ─────────────────────────────────────────────────────────────────
function navBar(active) {
  const tabs = ['Discover', 'Cellar', 'Market', 'Profile'];
  const icons = ['◈', '▣', '◎', '○'];
  const els = [rect(0, H - 88, W, 88, SURF, { r: 0 })];
  els.push(line(0, H - 88, W, H - 88, BORDER, 0.5));
  tabs.forEach((tab, i) => {
    const x = 14 + i * 90;
    const isActive = i === active;
    els.push(txt(icons[i], x + 30, H - 72, 18, isActive ? AMBER : MUTED, { align: 'center', w: 700 }));
    els.push(txt(tab, x + 8, H - 48, 9, isActive ? AMBER : MUTED, { w: isActive ? 700 : 400, ls: 0.8, width: 74, align: 'center' }));
    if (isActive) {
      els.push(rect(x + 28, H - 86, 34, 2, AMBER, { r: 1, opacity: 0.9 }));
    }
  });
  return els;
}

// ── STATUS BAR ──────────────────────────────────────────────────────────────
function statusBar() {
  return [
    rect(0, 0, W, 52, BG),
    txt('9:41', 20, 16, 12, CREAM, { w: 600, ls: 0.5 }),
    txt('●●●', 310, 16, 10, CREAM, { w: 400, opacity: 0.7, ls: 2 }),
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 1 — DISCOVER
// Editorial dark hero with curated picks
// ─────────────────────────────────────────────────────────────────────────────
function screen1() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));

  // Header
  els.push(...statusBar());
  els.push(txt('ONYX', 20, 60, 22, CREAM, { w: 700, ls: 4, font: 'Georgia' }));
  els.push(txt('Spring Releases', 20, 86, 11, MUTED, { w: 300, ls: 2 }));
  els.push(circle(360, 72, 20, SURF2));
  els.push(txt('🔔', 349, 61, 13, CREAM));

  // Hero bottle card — full-width glass panel
  els.push(rect(16, 112, W - 32, 210, SURF2, { r: 12 }));
  // Simulated product photo gradient
  els.push(rect(16, 112, W - 32, 210, GLASS, { r: 12, opacity: 0.6 }));
  // Vertical amber stripe (bottle silhouette)
  els.push(rect(W / 2 - 22, 120, 44, 198, GLASS, { r: 8, opacity: 0.8 }));
  els.push(rect(W / 2 - 14, 120, 28, 198, 'rgba(201,135,58,0.12)', { r: 6 }));
  // Glass shine line
  els.push(rect(W / 2 + 6, 128, 4, 160, 'rgba(255,255,255,0.06)', { r: 2 }));

  // Badge
  els.push(rect(24, 120, 72, 20, AMBER, { r: 10 }));
  els.push(txt('FEATURED', 32, 124, 8, BG, { w: 700, ls: 1.5 }));

  // Hero info overlay at bottom of card
  els.push(rect(16, 272, W - 32, 50, 'rgba(9,9,10,0.85)', { r: 0 }));
  els.push(rect(16, 272, W - 32, 50, 'rgba(9,9,10,0.5)'));
  els.push(txt('Balvenie 21yr', 26, 279, 16, CREAM, { w: 600, font: 'Georgia' }));
  els.push(txt('PortWood Finish  ·  40% ABV  ·  Scotland', 26, 300, 9.5, MUTED, { ls: 0.4 }));
  els.push(txt('98', W - 56, 275, 24, AMBER, { w: 700, align: 'right', width: 40, font: 'Georgia' }));
  els.push(txt('pts', W - 42, 300, 8, MUTED, { align: 'right', width: 30 }));

  // Section title
  els.push(txt('CURATED FOR YOU', 20, 338, 9, MUTED, { w: 500, ls: 2 }));
  els.push(line(20, 352, W - 20, 352, BORDER, 0.5));

  // 3-column bottle cards
  const bottles = [
    { name: 'Macallan 18', region: 'Speyside', score: '96', price: '£320', age: '18yr' },
    { name: 'Hibiki 21', region: 'Japan', score: '94', price: '£280', age: '21yr' },
    { name: 'Redbreast 27', region: 'Ireland', score: '97', price: '£450', age: '27yr' },
  ];
  bottles.forEach((b, i) => {
    const x = 16 + i * 122;
    els.push(rect(x, 360, 114, 160, SURF2, { r: 10 }));
    // Mini bottle silhouette
    els.push(rect(x + 40, 370, 34, 90, GLASS, { r: 6 }));
    els.push(rect(x + 48, 370, 18, 90, 'rgba(201,135,58,0.08)', { r: 4 }));
    // Score badge
    els.push(rect(x + 6, 374, 32, 18, BG, { r: 9 }));
    els.push(txt(b.score, x + 10, 377, 8.5, AMBER2, { w: 700, width: 24 }));
    // Info
    els.push(txt(b.name, x + 6, 470, 9.5, CREAM, { w: 600, width: 102 }));
    els.push(txt(b.region, x + 6, 484, 8, MUTED, { width: 102 }));
    els.push(txt(b.price, x + 6, 500, 9, AMBER, { w: 600, width: 102 }));
  });

  // Recent tasting tag
  els.push(rect(16, 534, W - 32, 48, SURF, { r: 10, stroke: BORDER }));
  els.push(txt('Your last tasting', 50, 542, 9, MUTED, { ls: 0.3, width: 200 }));
  els.push(txt('Lagavulin 16 · 3 days ago', 50, 555, 10, CREAM, { w: 500, width: 220 }));
  els.push(circle(33, 558, 14, GLASS));
  els.push(txt('🥃', 25, 549, 13, CREAM));
  els.push(txt('→', 350, 553, 14, AMBER, { w: 300, width: 20 }));

  els.push(...navBar(0));
  return pen('s1', 'Discover', BG, els);
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 2 — BOTTLE DETAIL
// Full editorial product view with tasting notes
// ─────────────────────────────────────────────────────────────────────────────
function screen2() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  els.push(...statusBar());

  // Back + title
  els.push(txt('←', 20, 60, 14, AMBER, { w: 300 }));
  els.push(txt('Bottle Detail', 100, 62, 11, MUTED, { ls: 1, align: 'center', width: 190 }));

  // Large bottle hero zone
  els.push(rect(0, 0, W, 340, SURF2));
  // Amber gradient wash
  els.push(rect(0, 0, W, 340, 'rgba(201,135,58,0.06)'));
  // Tall bottle silhouette
  els.push(rect(W / 2 - 35, 40, 70, 280, GLASS, { r: 10 }));
  els.push(rect(W / 2 - 22, 40, 44, 280, 'rgba(201,135,58,0.12)', { r: 8 }));
  // Neck detail
  els.push(rect(W / 2 - 12, 40, 24, 60, 'rgba(201,135,58,0.15)', { r: 6 }));
  // Label area
  els.push(rect(W / 2 - 24, 150, 48, 80, 'rgba(201,135,58,0.2)', { r: 4 }));
  els.push(txt('BALVENIE', W / 2 - 20, 165, 5.5, AMBER2, { w: 700, ls: 1, width: 40, align: 'center' }));
  els.push(txt('21', W / 2 - 8, 178, 18, AMBER, { w: 700, width: 16, align: 'center' }));
  els.push(txt('PORTWOOD', W / 2 - 18, 200, 4.5, AMBER2, { w: 600, ls: 0.8, width: 36, align: 'center' }));
  // Shine
  els.push(rect(W / 2 + 10, 48, 5, 250, 'rgba(255,255,255,0.05)', { r: 2 }));
  // Score badge
  els.push(rect(W - 62, 290, 52, 44, AMBER, { r: 8 }));
  els.push(txt('98', W - 50, 295, 22, BG, { w: 700, font: 'Georgia', width: 32, align: 'center' }));
  els.push(txt('POINTS', W - 54, 320, 6.5, BG, { w: 600, ls: 1, width: 44, align: 'center' }));

  // Info section
  els.push(rect(0, 336, W, H - 336, BG));
  els.push(txt('Balvenie 21yr', 20, 350, 22, CREAM, { w: 600, font: 'Georgia' }));
  els.push(txt('PortWood Finish', 20, 376, 11, AMBER, { ls: 0.5 }));

  // Specs row
  const specs = [['REGION', 'Speyside'], ['ABV', '40%'], ['AGE', '21yr'], ['CASK', 'Port']];
  specs.forEach((s, i) => {
    const x = 16 + i * 90;
    els.push(rect(x, 398, 82, 50, SURF2, { r: 8 }));
    els.push(txt(s[0], x + 6, 404, 7, MUTED, { w: 500, ls: 1, width: 70 }));
    els.push(txt(s[1], x + 6, 416, 12, CREAM, { w: 600, width: 70 }));
  });

  // Divider
  els.push(line(20, 460, W - 20, 460, BORDER, 0.5));

  // Tasting notes with flavor bars
  els.push(txt('TASTING NOTES', 20, 470, 8, MUTED, { w: 500, ls: 2 }));
  const flavors = [
    { label: 'Dried Fruit', pct: 88 },
    { label: 'Vanilla', pct: 72 },
    { label: 'Honey', pct: 80 },
    { label: 'Oak Spice', pct: 55 },
  ];
  flavors.forEach((f, i) => {
    const y = 490 + i * 36;
    const barW = (W - 100) * f.pct / 100;
    els.push(txt(f.label, 20, y + 4, 9.5, CREAM, { w: 400, width: 90 }));
    els.push(rect(120, y, W - 140, 10, SURF3, { r: 5 }));
    els.push(rect(120, y, barW - 20, 10, AMBER, { r: 5, opacity: 0.8 }));
    els.push(txt(f.pct + '%', W - 34, y + 2, 8, AMBER, { w: 500, width: 30 }));
  });

  // Price + Add button
  els.push(txt('£ 320', 20, 644, 24, CREAM, { w: 700, font: 'Georgia' }));
  els.push(txt('avg. market price', 20, 672, 9, MUTED, { ls: 0.3 }));
  els.push(rect(220, 638, W - 240, 44, AMBER, { r: 22 }));
  els.push(txt('Add to Cellar', 228, 652, 12, BG, { w: 700, width: 140, align: 'center' }));

  // Status bar + nav
  els.push(...navBar(1));
  return pen('s2', 'Bottle Detail', BG, els);
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 3 — CELLAR (COLLECTION VAULT)
// Grid of owned bottles with portfolio value
// ─────────────────────────────────────────────────────────────────────────────
function screen3() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  els.push(...statusBar());

  els.push(txt('My Cellar', 20, 60, 20, CREAM, { w: 600, font: 'Georgia' }));
  els.push(txt('28 bottles', 20, 84, 10, MUTED, { ls: 0.5 }));

  // Portfolio value card
  els.push(rect(16, 104, W - 32, 80, SURF2, { r: 12, stroke: BORDER }));
  els.push(txt('PORTFOLIO VALUE', 28, 114, 8, MUTED, { w: 500, ls: 2 }));
  els.push(txt('£ 12,480', 28, 130, 26, CREAM, { w: 700, font: 'Georgia' }));
  els.push(txt('+£ 840  +7.2%  this year', 28, 161, 9.5, AMBER, { w: 500 }));

  // Mini sparkline
  const sparkPoints = [50, 45, 55, 48, 60, 58, 68, 64, 72, 80];
  const sparkX = 260;
  const sparkY = 140;
  sparkPoints.forEach((v, i) => {
    if (i > 0) {
      const prev = sparkPoints[i-1];
      els.push(line(sparkX + (i-1)*10, sparkY + (50 - prev), sparkX + i*10, sparkY + (50 - v), AMBER, 1.5, 0.8));
    }
    els.push(circle(sparkX + i*10, sparkY + (50 - v), 2, AMBER));
  });

  // Filter tabs
  els.push(rect(16, 196, 88, 28, AMBER, { r: 14 }));
  els.push(txt('All (28)', 24, 204, 9, BG, { w: 700, width: 72, align: 'center' }));
  els.push(rect(112, 196, 80, 28, SURF2, { r: 14 }));
  els.push(txt('Whisky', 120, 204, 9, MUTED, { width: 64, align: 'center' }));
  els.push(rect(200, 196, 68, 28, SURF2, { r: 14 }));
  els.push(txt('Cognac', 206, 204, 9, MUTED, { width: 56, align: 'center' }));
  els.push(rect(276, 196, 64, 28, SURF2, { r: 14 }));
  els.push(txt('Gin', 280, 204, 9, MUTED, { width: 52, align: 'center' }));

  // Bottle grid (2 cols × 3 rows)
  const bottles = [
    { name: 'Balvenie 21', sub: 'PortWood', price: '£320', change: '+12%', score: '98' },
    { name: 'Macallan 18', sub: 'Sherry Oak', price: '£290', change: '+8%', score: '96' },
    { name: 'Hibiki 21', sub: 'Suntory', price: '£280', change: '+5%', score: '94' },
    { name: 'Rémy XO', sub: 'Excellence', price: '£210', change: '-2%', score: '91' },
    { name: 'Hennessy', sub: 'Paradis', price: '£560', change: '+18%', score: '99' },
    { name: 'Bruichladdich', sub: 'Octomore 13', price: '£180', change: '+3%', score: '95' },
  ];

  bottles.forEach((b, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 16 + col * 186;
    const y = 238 + row * 160;
    els.push(rect(x, y, 178, 152, SURF2, { r: 10 }));
    // Bottle silhouette
    els.push(rect(x + 68, y + 10, 42, 100, GLASS, { r: 6 }));
    els.push(rect(x + 78, y + 10, 22, 100, 'rgba(201,135,58,0.1)', { r: 4 }));
    // Score
    els.push(rect(x + 8, y + 14, 30, 18, BG, { r: 9 }));
    els.push(txt(b.score, x + 12, y + 17, 8, AMBER, { w: 700, width: 22 }));
    // Info
    els.push(txt(b.name, x + 8, y + 118, 10, CREAM, { w: 600, width: 160 }));
    els.push(txt(b.sub, x + 8, y + 131, 8.5, MUTED, { width: 160 }));
    // Price + change
    const isPos = b.change.startsWith('+');
    els.push(txt(b.price, x + 8, y + 145, 9, CREAM, { w: 600, width: 80 }));
    els.push(txt(b.change, x + 100, y + 145, 9, isPos ? '#5DD88A' : '#FF6B6B', { w: 600, width: 70, align: 'right' }));
  });

  els.push(...navBar(1));
  return pen('s3', 'Cellar', BG, els);
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 4 — MARKET INTELLIGENCE
// Price chart, auction data, trending bottles
// ─────────────────────────────────────────────────────────────────────────────
function screen4() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  els.push(...statusBar());

  els.push(txt('Market', 20, 60, 20, CREAM, { w: 600, font: 'Georgia' }));
  els.push(txt('Live auction & trade data', 20, 84, 10, MUTED, { ls: 0.3 }));

  // Price chart area
  els.push(rect(16, 104, W - 32, 190, SURF2, { r: 12 }));
  els.push(txt('Macallan 18yr — 12mo Price', 28, 114, 9.5, MUTED, { w: 500, ls: 0.5 }));
  els.push(txt('£ 292', 28, 130, 22, CREAM, { w: 700, font: 'Georgia' }));
  els.push(txt('+£ 22  +8.2%', 28, 156, 9.5, '#5DD88A', { w: 500 }));

  // Chart grid lines
  const chartX = 28, chartY = 172, chartW = W - 60, chartH = 100;
  [0, 0.25, 0.5, 0.75, 1].forEach(t => {
    els.push(line(chartX, chartY + chartH * (1 - t), chartX + chartW, chartY + chartH * (1 - t), BORDER, 0.5, 0.5));
    const priceLabels = ['200', '220', '250', '270', '290'];
    els.push(txt(priceLabels[Math.round(t * 4)], chartX + chartW + 4, chartY + chartH * (1 - t) - 4, 7, MUTED, { width: 28 }));
  });

  // Price line (organic curve simulation with line segments)
  const priceData = [0.45, 0.50, 0.42, 0.55, 0.60, 0.58, 0.65, 0.70, 0.68, 0.72, 0.80, 0.85];
  const step = chartW / (priceData.length - 1);
  priceData.forEach((v, i) => {
    if (i > 0) {
      const prev = priceData[i - 1];
      els.push(line(
        chartX + (i-1) * step, chartY + chartH - prev * chartH,
        chartX + i * step, chartY + chartH - v * chartH,
        AMBER, 2, 0.9
      ));
    }
  });
  // Current price dot
  const lastIdx = priceData.length - 1;
  const lastV = priceData[lastIdx];
  els.push(circle(chartX + lastIdx * step, chartY + chartH - lastV * chartH, 5, AMBER));
  els.push(circle(chartX + lastIdx * step, chartY + chartH - lastV * chartH, 8, GLASS, { stroke: AMBER, strokeWidth: 1.5 }));

  // Month labels
  const months = ['M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D', 'J', 'F'];
  months.forEach((m, i) => {
    els.push(txt(m, chartX + i * step - 3, chartY + chartH + 8, 7, MUTED, { width: 10, align: 'center' }));
  });

  // Trending auctions
  els.push(txt('TRENDING AUCTIONS', 20, 310, 8, MUTED, { w: 500, ls: 2 }));
  els.push(line(20, 324, W - 20, 324, BORDER, 0.5));

  const auctions = [
    { name: 'Karuizawa 1980', bid: '£ 8,400', change: '+34%', end: '2h', hot: true },
    { name: 'Springbank 30yr', bid: '£ 2,100', change: '+12%', end: '6h', hot: false },
    { name: 'Dalmore Luminary', bid: '£ 1,650', change: '+7%', end: '1d', hot: false },
  ];
  auctions.forEach((a, i) => {
    const y = 336 + i * 72;
    els.push(rect(16, y, W - 32, 64, SURF2, { r: 10 }));
    if (a.hot) els.push(rect(16, y, W - 32, 64, GLASS, { r: 10 }));
    // Bottle mini
    els.push(rect(26, y + 10, 22, 44, GLASS, { r: 5 }));
    // Info
    els.push(txt(a.name, 58, y + 12, 11, CREAM, { w: 600, width: 180 }));
    els.push(txt(`Ends in ${a.end}`, 58, y + 28, 8.5, MUTED, { width: 120 }));
    if (a.hot) els.push(rect(58, y + 42, 36, 14, 'rgba(201,135,58,0.3)', { r: 7 }));
    if (a.hot) els.push(txt('HOT', 64, y + 44, 7, AMBER2, { w: 700, ls: 1, width: 28 }));
    // Bid + change
    els.push(txt(a.bid, W - 80, y + 12, 13, CREAM, { w: 700, align: 'right', width: 64 }));
    els.push(txt(a.change, W - 70, y + 30, 9, '#5DD88A', { w: 600, align: 'right', width: 54 }));
    // Bid button
    els.push(rect(W - 68, y + 44, 52, 16, AMBER, { r: 8 }));
    els.push(txt('Bid Now', W - 64, y + 47, 8, BG, { w: 700, width: 44, align: 'center' }));
  });

  els.push(...navBar(2));
  return pen('s4', 'Market', BG, els);
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 5 — TASTING LOG
// Rich editorial tasting note card + flavor wheel
// ─────────────────────────────────────────────────────────────────────────────
function screen5() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  els.push(...statusBar());

  els.push(txt('← Tastings', 20, 64, 11, AMBER, { w: 500 }));
  els.push(txt('Lagavulin 16yr', 20, 86, 20, CREAM, { w: 600, font: 'Georgia' }));
  els.push(txt('Islay Single Malt  ·  Tasted 3 days ago', 20, 110, 9.5, MUTED, { ls: 0.2 }));

  // Star rating
  ['★', '★', '★', '★', '★'].forEach((s, i) => {
    els.push(txt(s, 20 + i * 22, 128, 14, i < 4 ? AMBER : MUTED));
  });
  els.push(txt('4.5 / 5', 130, 130, 10, MUTED));

  els.push(line(20, 152, W - 20, 152, BORDER, 0.5));

  // Nose / Palate / Finish columns
  const cols = [
    { label: 'NOSE', notes: ['Peat smoke', 'Sea salt', 'Iodine', 'Dried fruit'] },
    { label: 'PALATE', notes: ['Sweet peat', 'Dark choc', 'Leather', 'Pepper'] },
    { label: 'FINISH', notes: ['Long & dry', 'Maritime', 'Lingering', 'smoke'] },
  ];
  cols.forEach((col, ci) => {
    const x = 16 + ci * 122;
    els.push(txt(col.label, x + 4, 162, 7.5, MUTED, { w: 500, ls: 1.5, width: 114 }));
    col.notes.forEach((note, ni) => {
      els.push(rect(x + 4, 178 + ni * 26, 110, 20, SURF2, { r: 6 }));
      els.push(txt(note, x + 10, 182 + ni * 26, 8.5, CREAM, { w: 400, width: 98 }));
    });
  });

  els.push(line(20, 292, W - 20, 292, BORDER, 0.5));

  // Flavor profile bars
  els.push(txt('FLAVOR INTENSITY', 20, 302, 8, MUTED, { w: 500, ls: 2 }));
  const flavors = [
    { label: 'Smokiness', val: 95 },
    { label: 'Sweetness', val: 45 },
    { label: 'Fruitiness', val: 30 },
    { label: 'Spice', val: 70 },
    { label: 'Maritime', val: 88 },
  ];
  flavors.forEach((f, i) => {
    const y = 322 + i * 34;
    const bw = (W - 150) * f.val / 100;
    els.push(txt(f.label, 20, y + 3, 9, CREAM, { width: 90 }));
    els.push(rect(124, y, W - 144, 10, SURF3, { r: 5 }));
    els.push(rect(124, y, bw, 10, AMBER, { r: 5, opacity: 0.75 }));
    els.push(txt(f.val, W - 30, y + 1, 8, AMBER, { w: 600, width: 24, align: 'right' }));
  });

  els.push(line(20, 498, W - 20, 498, BORDER, 0.5));

  // Personal note
  els.push(txt('MY NOTE', 20, 508, 8, MUTED, { w: 500, ls: 2 }));
  els.push(rect(16, 524, W - 32, 80, SURF2, { r: 10 }));
  els.push(txt('"Classic Lagavulin — peat hits immediately but there\'s surprising sweetness underneath. The maritime finish lingers beautifully."', 26, 534, 10, CREAM, { opacity: 0.85, width: W - 60 }));

  // Price at time of tasting
  els.push(rect(16, 616, W - 32, 48, SURF, { r: 10, stroke: BORDER }));
  els.push(txt('Bottle purchased for £ 68', 24, 624, 10, MUTED, { width: 220 }));
  els.push(txt('Current value: £ 78', 24, 640, 10, '#5DD88A', { w: 600, width: 220 }));
  els.push(txt('+£10 +14%', W - 90, 632, 9.5, '#5DD88A', { w: 700, align: 'right', width: 74 }));

  els.push(...navBar(0));
  return pen('s5', 'Tasting Log', BG, els);
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 6 — PROFILE / MEMBERSHIP
// Atlas-Card-inspired dark membership card + stats
// ─────────────────────────────────────────────────────────────────────────────
function screen6() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  els.push(...statusBar());

  els.push(txt('Profile', 20, 60, 20, CREAM, { w: 600, font: 'Georgia' }));

  // Membership card (Atlas Card inspired)
  els.push(rect(16, 88, W - 32, 180, SURF3, { r: 16 }));
  // Subtle gradient overlay - warm tone
  els.push(rect(16, 88, W - 32, 180, 'rgba(201,135,58,0.06)', { r: 16 }));
  // Decorative arc element (luxury emblem)
  els.push(circle(W - 40, 100, 80, 'rgba(201,135,58,0.04)', { stroke: BORDER, strokeWidth: 1 }));
  els.push(circle(W - 40, 100, 55, 'rgba(201,135,58,0.04)', { stroke: BORDER, strokeWidth: 0.5 }));
  // ONYX logo on card
  els.push(txt('◈ ONYX', 30, 102, 14, CREAM, { w: 700, ls: 3, font: 'Georgia' }));
  els.push(txt('COLLECTOR MEMBERSHIP', 30, 122, 7, AMBER, { ls: 2, w: 400 }));
  // Member name
  els.push(txt('James Whitmore', 30, 190, 16, CREAM, { w: 400, font: 'Georgia' }));
  els.push(txt('Member since 2021  ·  #00847', 30, 212, 9, MUTED, { ls: 0.3 }));
  // Tier badge
  els.push(rect(W - 100, 210, 84, 24, AMBER, { r: 12 }));
  els.push(txt('◆ RESERVE', W - 94, 216, 8, BG, { w: 700, ls: 1, width: 72, align: 'center' }));

  // Stats grid
  const stats = [
    ['BOTTLES', '28'], ['TASTINGS', '143'], ['SCORE AVG', '93.4'], ['RANK', '#284'],
  ];
  stats.forEach((s, i) => {
    const x = 16 + (i % 2) * 186;
    const y = 284 + Math.floor(i / 2) * 80;
    els.push(rect(x, y, 178, 68, SURF2, { r: 10 }));
    els.push(txt(s[0], x + 14, y + 12, 7.5, MUTED, { w: 400, ls: 1.5, width: 150 }));
    els.push(txt(s[1], x + 14, y + 28, 22, CREAM, { w: 600, font: 'Georgia', width: 150 }));
  });

  // Activity feed
  els.push(txt('RECENT ACTIVITY', 20, 454, 8, MUTED, { w: 500, ls: 2 }));
  els.push(line(20, 468, W - 20, 468, BORDER, 0.5));

  const activity = [
    { action: 'Added to cellar', item: 'Springbank 25yr', time: '2h ago', icon: '▣' },
    { action: 'Tasting logged', item: 'Lagavulin 16yr — 4.5★', time: '3d ago', icon: '✦' },
    { action: 'Auction bid', item: 'Karuizawa 1980 — £8,200', time: '5d ago', icon: '◎' },
    { action: 'Bottle valued', item: 'Collection +7.2%', time: '1w ago', icon: '↑' },
  ];
  activity.forEach((a, i) => {
    const y = 480 + i * 56;
    els.push(circle(32, y + 16, 14, GLASS));
    els.push(txt(a.icon, 26, y + 9, 12, AMBER, { width: 14, align: 'center' }));
    els.push(txt(a.action, 56, y + 8, 9.5, CREAM, { w: 600, width: 210 }));
    els.push(txt(a.item, 56, y + 22, 9, MUTED, { width: 210 }));
    els.push(txt(a.time, W - 56, y + 14, 8.5, MUTED, { align: 'right', width: 50 }));
    if (i < activity.length - 1) els.push(line(56, y + 44, W - 20, y + 44, BORDER, 0.3));
  });

  els.push(...navBar(3));
  return pen('s6', 'Profile', BG, els);
}

// ── ASSEMBLE & WRITE ─────────────────────────────────────────────────────────
const screens = [screen1(), screen2(), screen3(), screen4(), screen5(), screen6()];

const penData = {
  version: '2.8',
  name: 'ONYX — Rare Spirits, Collected.',
  screens,
};

fs.writeFileSync(`/workspace/group/design-studio/${SLUG}.pen`, JSON.stringify(penData, null, 2));
console.log(`✓ Written: ${SLUG}.pen (${screens.length} screens)`);
