'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'alto';
const NAME = 'ALTO';
const TAGLINE = 'Wealth, clearly.';
const HEARTBEAT = 43;
const W = 390, H = 844;

// ── Warm Minimalism palette (light) ──────────────────────────────────────────
// Inspired by minimal.gallery's "warm minimalism" trend: cream bg, earthy accents,
// generous whitespace, and an editorial serif+sans pairing.
const P = {
  bg:      '#FAF7F2',   // warm cream
  surf:    '#FFFFFF',   // pure white card
  card:    '#F2EDE4',   // warm ecru card
  card2:   '#EDE5D8',   // deeper ecru for alternates
  border:  '#E0D8CC',   // warm border
  text:    '#1C1814',   // near-black warm
  sub:     '#7A6D60',   // warm brown mid
  muted:   '#B4A898',   // muted warm
  acc:     '#4A3728',   // deep warm brown (accent)
  acc2:    '#7B9B6B',   // sage green (secondary)
  acc3:    '#C8A26E',   // warm gold
  neg:     '#B85C38',   // terracotta (negative)
  pos:     '#5A8A5A',   // forest green (positive)
  white:   '#FFFFFF',
};

// ── Element helpers ───────────────────────────────────────────────────────────
const elements = [];
function el(e) { elements.push(e); return e; }

function rect(x, y, w, h, fill, opts = {}) {
  return el({ type: 'rect', x, y, w, h, fill,
    rx: opts.rx ?? 0, opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none', strokeWidth: opts.sw ?? 0 });
}
function text(x, y, content, size, fill, opts = {}) {
  return el({ type: 'text', x, y, content, size, fill,
    fontWeight: opts.fw ?? 400,
    fontFamily: opts.font ?? 'Inter, sans-serif',
    textAnchor: opts.anchor ?? 'start',
    letterSpacing: opts.ls ?? 0,
    opacity: opts.opacity ?? 1 });
}
function circle(cx, cy, r, fill, opts = {}) {
  return el({ type: 'circle', cx, cy, r, fill,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none', strokeWidth: opts.sw ?? 0 });
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return el({ type: 'line', x1, y1, x2, y2, stroke,
    strokeWidth: opts.sw ?? 1, opacity: opts.opacity ?? 1 });
}

// ── Screen builder ────────────────────────────────────────────────────────────
const screens = [];
let eCount = 0;

function startScreen(name) {
  eCount = elements.length;
  return name;
}
function endScreen(name) {
  const slice = elements.slice(eCount);
  screens.push({ name, svg: '', elements: slice });
  return slice.length;
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen 1 — Portfolio Overview (Bento Dashboard)
// Bento grid layout: inspired by saaspo.com's fastest-growing layout category.
// Editorial serif number treatment from minimal.gallery warm minimalism.
// ─────────────────────────────────────────────────────────────────────────────
{
  startScreen('Portfolio Overview');

  // Background
  rect(0, 0, W, H, P.bg);

  // ── Status bar ──
  rect(0, 0, W, 44, P.bg);
  text(20, 14, '9:41', 11, P.text, { fw: 600 });
  text(350, 14, '●●●', 10, P.text, { anchor: 'end' });

  // ── Top bar ──
  text(20, 62, 'ALTO', 18, P.acc, { fw: 700, ls: 3 });
  // Avatar
  circle(362, 56, 16, P.card2);
  text(362, 60, 'JL', 10, P.acc, { fw: 600, anchor: 'middle' });
  // Notification dot
  circle(374, 44, 5, P.acc3);

  // ── "Good morning" hero area ──
  text(20, 98, 'Good morning,', 13, P.sub, { fw: 400 });
  text(20, 120, 'James.', 28, P.text, { fw: 600, font: 'Georgia, serif' });

  // ── TOTAL NET WORTH bento block (full width, tall) ──
  rect(16, 136, 358, 110, P.surf, { rx: 16, stroke: P.border, sw: 1 });
  text(32, 158, 'Total Net Worth', 11, P.sub, { fw: 500, ls: 0.5 });
  text(32, 196, '$248,392', 36, P.text, { fw: 600, font: 'Georgia, serif' });
  text(32, 218, '+$3,241', 12, P.pos, { fw: 600 });
  text(96, 218, '  +1.32% today', 12, P.sub, { fw: 400 });
  // sparkline in the card
  line(200, 228, 220, 218, P.pos, { sw: 1.5, opacity: 0.7 });
  line(220, 218, 240, 222, P.pos, { sw: 1.5, opacity: 0.7 });
  line(240, 222, 255, 210, P.pos, { sw: 1.5, opacity: 0.7 });
  line(255, 210, 270, 215, P.pos, { sw: 1.5, opacity: 0.7 });
  line(270, 215, 285, 205, P.pos, { sw: 1.5, opacity: 0.7 });
  line(285, 205, 300, 208, P.pos, { sw: 1.5, opacity: 0.7 });
  line(300, 208, 320, 198, P.pos, { sw: 1.5, opacity: 0.7 });
  line(320, 198, 340, 203, P.pos, { sw: 1.5, opacity: 0.7 });
  // dot at end
  circle(340, 203, 3, P.pos);
  // bar below sparkline
  rect(200, 232, 148, 2, P.pos, { rx: 1, opacity: 0.15 });

  // ── Bento row: 2 small cards ──
  // Card A: Invested
  rect(16, 258, 172, 80, P.card, { rx: 14 });
  text(28, 277, 'Invested', 10, P.sub, { fw: 500, ls: 0.5 });
  text(28, 307, '$185,000', 20, P.text, { fw: 600, font: 'Georgia, serif' });
  text(28, 327, '74% of total', 10,  P.sub);

  // Card B: Cash
  rect(202, 258, 172, 80, P.card, { rx: 14 });
  text(214, 277, 'Cash', 10, P.sub, { fw: 500, ls: 0.5 });
  text(214, 307, '$63,392', 20, P.text, { fw: 600, font: 'Georgia, serif' });
  text(214, 327, '26% of total', 10,  P.sub);

  // ── Bento row: allocation tile (wide) + return tile ──
  // Allocation donut placeholder
  rect(16, 350, 220, 90, P.surf, { rx: 14, stroke: P.border, sw: 1 });
  text(28, 371, 'Allocation', 10, P.sub, { fw: 500, ls: 0.5 });
  // mini donut arcs via circles
  circle(92, 400, 24, 'none', { stroke: P.acc, sw: 8, opacity: 0.9 });
  circle(92, 400, 24, 'none', { stroke: P.acc2, sw: 8, opacity: 0.6 });
  circle(92, 400, 24, 'none', { stroke: P.acc3, sw: 8, opacity: 0.4 });
  // legend
  rect(122, 388, 8, 8, P.acc, { rx: 2 });
  text(134, 396, 'Equity 62%', 9,  P.sub);
  rect(122, 402, 8, 8, P.acc2, { rx: 2 });
  text(134, 410, 'Fixed 23%', 9,  P.sub);
  rect(122, 416, 8, 8, P.acc3, { rx: 2 });
  text(134, 424, 'Cash 15%', 9,  P.sub);

  // Return tile
  rect(248, 350, 126, 90, P.card, { rx: 14 });
  text(260, 371, 'YTD Return', 10, P.sub, { fw: 500, ls: 0.5 });
  text(260, 405, '+12.4%', 22, P.pos, { fw: 700, font: 'Georgia, serif' });
  text(260, 425, 'vs 9.1% SPY', 9,  P.sub);

  // ── Holdings preview ──
  text(20, 458, 'Top Holdings', 12, P.text, { fw: 600, ls: 0.3 });
  text(352, 458, 'See all →', 11, P.acc, { anchor: 'end' });

  // Row 1
  rect(16, 470, 358, 52, P.surf, { rx: 10 });
  circle(36, 497, 14, P.card2);
  text(36, 501, 'AAPL', 7, P.acc, { fw: 700, anchor: 'middle' });
  text(60, 490, 'Apple Inc.', 12, P.text, { fw: 500 });
  text(60, 507, '24 shares · avg $148.22', 10,  P.sub);
  text(372, 490, '$4,812', 13, P.text, { fw: 600, anchor: 'end' });
  text(372, 507, '+8.2%', 11, P.pos, { fw: 500, anchor: 'end' });

  // Row 2
  rect(16, 528, 358, 52, P.surf, { rx: 10, opacity: 0.7 });
  circle(36, 555, 14, P.card2);
  text(36, 559, 'MSFT', 7, P.acc, { fw: 700, anchor: 'middle' });
  text(60, 548, 'Microsoft', 12, P.text, { fw: 500 });
  text(60, 565, '12 shares · avg $311.40', 10,  P.sub);
  text(372, 548, '$3,921', 13, P.text, { fw: 600, anchor: 'end' });
  text(372, 565, '+5.1%', 11, P.pos, { fw: 500, anchor: 'end' });

  // Row 3
  rect(16, 586, 358, 52, P.surf, { rx: 10, opacity: 0.5 });
  circle(36, 613, 14, P.card2);
  text(36, 617, 'VTI', 7, P.acc, { fw: 700, anchor: 'middle' });
  text(60, 606, 'Vanguard Total Market', 12, P.text, { fw: 500 });
  text(60, 623, '38 shares · avg $198.50', 10,  P.sub);
  text(372, 606, '$8,145', 13, P.text, { fw: 600, anchor: 'end' });
  text(372, 623, '+11.4%', 11, P.pos, { fw: 500, anchor: 'end' });

  // ── Bottom nav ──
  rect(0, 750, W, 94, P.surf, { stroke: P.border, sw: 0.5 });
  const navItems = [
    { icon: '◈', label: 'Portfolio', x: 48, active: true },
    { icon: '↗', label: 'Markets', x: 138, active: false },
    { icon: '+', label: 'Add', x: 195, active: false },
    { icon: '◷', label: 'History', x: 252, active: false },
    { icon: '○', label: 'Profile', x: 342, active: false },
  ];
  navItems.forEach(n => {
    if (n.active) {
      rect(n.x - 24, 754, 48, 40, P.card2, { rx: 12 });
    }
    text(n.x, 776, n.icon, 18, n.active ? P.acc : P.muted, { anchor: 'middle' });
    text(n.x, 793, n.label, 9, n.active ? P.acc : P.muted, { anchor: 'middle', fw: n.active ? 600 : 400 });
  });

  endScreen('Portfolio Overview');
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen 2 — Performance Chart
// Clean line chart with editorial whitespace.
// ─────────────────────────────────────────────────────────────────────────────
{
  startScreen('Performance');

  rect(0, 0, W, H, P.bg);
  // Status bar
  rect(0, 0, W, 44, P.bg);
  text(20, 14, '9:41', 11, P.text, { fw: 600 });

  // ── Header ──
  text(195, 62, 'Performance', 15, P.text, { fw: 600, anchor: 'middle' });
  text(20, 62, '←', 18, P.acc, { fw: 400 });

  // ── Time range tabs ──
  const tabs = ['1W', '1M', '3M', 'YTD', '1Y', 'All'];
  tabs.forEach((t, i) => {
    const tx = 20 + i * 58;
    if (t === '3M') {
      rect(tx - 4, 78, 36, 24, P.acc, { rx: 8 });
      text(tx + 14, 93, t, 11, P.white, { fw: 600, anchor: 'middle' });
    } else {
      text(tx + 14, 93, t, 11, P.sub, { anchor: 'middle' });
    }
  });

  // ── Summary card ──
  rect(16, 112, 358, 68, P.surf, { rx: 14, stroke: P.border, sw: 1 });
  text(32, 133, 'Portfolio Value', 10, P.sub, { fw: 500, ls: 0.5 });
  text(32, 162, '$248,392', 28, P.text, { fw: 600, font: 'Georgia, serif' });
  text(200, 133, '+$7,821', 11, P.pos, { fw: 600, anchor: 'middle' });
  text(200, 150, 'since 3 months ago', 9, P.sub, { anchor: 'middle' });
  text(200, 166, '+3.25%', 14, P.pos, { fw: 700, anchor: 'middle' });

  // benchmark ref
  text(340, 140, 'vs S&P', 9, P.sub, { anchor: 'end' });
  text(340, 155, '+2.1%', 11, P.muted, { anchor: 'end' });
  text(340, 170, 'you beat it', 9, P.acc2, { anchor: 'end' });

  // ── Chart area ──
  const CX = 24, CY = 196, CW = 342, CH = 220;
  rect(CX, CY, CW, CH, P.surf, { rx: 14, stroke: P.border, sw: 0.5 });

  // Grid lines (horizontal)
  for (let i = 0; i <= 4; i++) {
    const gy = CY + 16 + i * (CH - 32) / 4;
    line(CX + 12, gy, CX + CW - 12, gy, P.border, { sw: 0.5 });
    const val = 248 - i * 7;
    text(CX + CW - 14, gy + 4, `$${val}K`, 8, P.muted, { anchor: 'end' });
  }

  // Chart line — portfolio (using piecewise line segments)
  const pts = [
    [36, 384], [60, 378], [80, 372], [100, 365],
    [122, 370], [142, 360], [162, 354], [180, 340],
    [198, 345], [216, 332], [234, 328], [252, 318],
    [270, 310], [288, 304], [308, 298], [330, 290], [352, 284],
  ];
  for (let i = 0; i < pts.length - 1; i++) {
    line(pts[i][0], pts[i][1], pts[i+1][0], pts[i+1][1], P.acc, { sw: 2 });
  }
  // fill area (approximate with thin rects)
  pts.forEach((p, i) => {
    if (i < pts.length - 1) {
      rect(p[0], p[1], pts[i+1][0] - p[0], CY + CH - 20 - p[1], P.acc, { opacity: 0.04 });
    }
  });
  // terminal dot
  circle(352, 284, 4, P.acc);
  circle(352, 284, 7, P.acc, { opacity: 0.2 });

  // Benchmark line (S&P)
  const bpts = [
    [36, 392], [60, 386], [80, 382], [100, 376],
    [122, 381], [142, 374], [162, 370], [180, 360],
    [198, 365], [216, 355], [234, 352], [252, 344],
    [270, 340], [288, 336], [308, 333], [330, 328], [352, 322],
  ];
  for (let i = 0; i < bpts.length - 1; i++) {
    line(bpts[i][0], bpts[i][1], bpts[i+1][0], bpts[i+1][1], P.muted, { sw: 1, opacity: 0.5 });
  }

  // Legend
  rect(32, 392, 8, 3, P.acc, { rx: 1 });
  text(44, 397, 'ALTO Portfolio', 9,  P.sub);
  rect(120, 392, 8, 3, P.muted, { rx: 1 });
  text(132, 397, 'S&P 500', 9,  P.muted);

  // X-axis labels
  const months = ['Jan', 'Feb', 'Mar', 'Apr'];
  months.forEach((m, i) => {
    text(36 + i * 106, CY + CH - 6, m, 9, P.muted, { anchor: 'middle' });
  });

  // ── Monthly returns bar chart ──
  text(20, 438, 'Monthly Returns', 12, P.text, { fw: 600, ls: 0.3 });
  const mReturns = [1.2, -0.4, 2.1, 0.8, 1.7, -0.2, 2.4, 1.1, 3.2, -0.8, 1.9, 2.6];
  const mLabels = ['J','F','M','A','M','J','J','A','S','O','N','D'];
  const barW = 22, barGap = 8, barBase = 510;
  mReturns.forEach((v, i) => {
    const bx = 20 + i * (barW + barGap);
    const bh = Math.abs(v) * 18;
    const by = v >= 0 ? barBase - bh : barBase;
    rect(bx, by, barW, bh, v >= 0 ? P.acc2 : P.neg, { rx: 3 });
    text(bx + barW / 2, 524, mLabels[i], 8, P.muted, { anchor: 'middle' });
  });
  // Baseline
  line(16, barBase, 374, barBase, P.border, { sw: 0.5 });

  // ── Highlight stat blocks ──
  rect(16, 540, 108, 60, P.card, { rx: 12 });
  text(28, 558, 'Best Month', 9, P.sub, { ls: 0.3 });
  text(28, 579, '+3.2%', 18, P.pos, { fw: 700, font: 'Georgia, serif' });
  text(28, 595, 'September', 9,  P.sub);

  rect(140, 540, 108, 60, P.card, { rx: 12 });
  text(152, 558, 'Worst Month', 9, P.sub, { ls: 0.3 });
  text(152, 579, '-0.8%', 18, P.neg, { fw: 700, font: 'Georgia, serif' });
  text(152, 595, 'October', 9,  P.sub);

  rect(264, 540, 110, 60, P.card, { rx: 12 });
  text(276, 558, 'Volatility', 9, P.sub, { ls: 0.3 });
  text(276, 579, '11.2%', 18, P.acc3, { fw: 700, font: 'Georgia, serif' });
  text(276, 595, 'annualised', 9,  P.sub);

  // ── Risk score ──
  rect(16, 616, 358, 56, P.surf, { rx: 12, stroke: P.border, sw: 1 });
  text(28, 637, 'Risk Score', 10, P.sub, { fw: 500, ls: 0.5 });
  text(28, 659, '42 / 100  ·  Moderate', 13, P.text, { fw: 500 });
  rect(28, 663, 240, 4, P.border, { rx: 2 });
  rect(28, 663, 101, 4, P.acc3, { rx: 2 });

  // ── Nav ──
  rect(0, 750, W, 94, P.surf, { stroke: P.border, sw: 0.5 });
  [
    { icon: '◈', label: 'Portfolio', x: 48 },
    { icon: '↗', label: 'Markets', x: 138 },
    { icon: '+', label: 'Add', x: 195 },
    { icon: '◷', label: 'History', x: 252 },
    { icon: '○', label: 'Profile', x: 342 },
  ].forEach(n => {
    text(n.x, 776, n.icon, 18, P.muted, { anchor: 'middle' });
    text(n.x, 793, n.label, 9, P.muted, { anchor: 'middle' });
  });

  endScreen('Performance');
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen 3 — Holdings Detail
// Editorial list with serif typography, earthy color system.
// ─────────────────────────────────────────────────────────────────────────────
{
  startScreen('Holdings');

  rect(0, 0, W, H, P.bg);
  rect(0, 0, W, 44, P.bg);
  text(20, 14, '9:41', 11, P.text, { fw: 600 });

  text(195, 62, 'Holdings', 15, P.text, { fw: 600, anchor: 'middle' });
  text(20, 62, '←', 18,  P.acc);
  // Filter pill
  rect(324, 48, 56, 24, P.card, { rx: 12 });
  text(352, 63, '⊕ Filter', 10, P.acc, { anchor: 'middle' });

  // ── Total invested ──
  rect(16, 80, 358, 52, P.surf, { rx: 12, stroke: P.border, sw: 1 });
  text(195, 100, 'Total Invested', 10, P.sub, { anchor: 'middle', ls: 0.5 });
  text(195, 122, '$185,000', 22, P.text, { fw: 600, font: 'Georgia, serif', anchor: 'middle' });

  // ── Category headers + rows ──
  const holdings = [
    { cat: 'Equities', items: [
      { sym: 'AAPL', name: 'Apple Inc.', shares: 24, price: 200.50, gain: 8.2, val: 4812, color: P.acc },
      { sym: 'MSFT', name: 'Microsoft Corp', shares: 12, price: 326.80, gain: 5.1, val: 3921, color: P.acc },
      { sym: 'GOOGL', name: 'Alphabet Inc.', shares: 6, price: 158.40, gain: -1.3, val: 950, color: P.neg },
      { sym: 'NVDA', name: 'NVIDIA Corp', shares: 8, price: 487.20, gain: 22.4, val: 3897, color: P.acc },
    ]},
    { cat: 'ETFs', items: [
      { sym: 'VTI', name: 'Vanguard Total Mkt', shares: 38, price: 214.40, gain: 11.4, val: 8147, color: P.acc2 },
      { sym: 'QQQ', name: 'Invesco Nasdaq 100', shares: 15, price: 428.90, gain: 9.8, val: 6433, color: P.acc2 },
    ]},
  ];

  let cy = 148;
  holdings.forEach(cat => {
    text(20, cy, cat.cat, 11, P.sub, { fw: 600, ls: 0.8 });
    cy += 20;

    cat.items.forEach((h, i) => {
      const bg = i % 2 === 0 ? P.surf : P.bg;
      rect(16, cy, 358, 52, bg, { rx: 10 });

      // Ticker badge
      rect(24, cy + 10, 36, 32, P.card2, { rx: 8 });
      text(42, cy + 30, h.sym.length <= 3 ? h.sym : h.sym.slice(0,3), 9, h.color, { fw: 700, anchor: 'middle' });

      text(70, cy + 20, h.name, 12, P.text, { fw: 500 });
      text(70, cy + 37, `${h.shares} shares`, 10,  P.sub);

      const priceLabel = `$${h.val.toLocaleString()}`;
      const gainLabel = `${h.gain >= 0 ? '+' : ''}${h.gain}%`;
      text(372, cy + 20, priceLabel, 13, P.text, { fw: 600, anchor: 'end' });
      text(372, cy + 37, gainLabel, 11, h.gain >= 0 ? P.pos : P.neg, { fw: 500, anchor: 'end' });

      cy += 58;
    });
    cy += 8;
  });

  // ── Nav ──
  rect(0, 750, W, 94, P.surf, { stroke: P.border, sw: 0.5 });
  [
    { icon: '◈', label: 'Portfolio', x: 48 },
    { icon: '↗', label: 'Markets', x: 138 },
    { icon: '+', label: 'Add', x: 195 },
    { icon: '◷', label: 'History', x: 252 },
    { icon: '○', label: 'Profile', x: 342 },
  ].forEach(n => {
    text(n.x, 776, n.icon, 18, P.muted, { anchor: 'middle' });
    text(n.x, 793, n.label, 9, P.muted, { anchor: 'middle' });
  });

  endScreen('Holdings');
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen 4 — Market Pulse
// Editorial story-driven section — lapa.ninja "story hero" trend.
// ─────────────────────────────────────────────────────────────────────────────
{
  startScreen('Market Pulse');

  rect(0, 0, W, H, P.bg);
  rect(0, 0, W, 44, P.bg);
  text(20, 14, '9:41', 11, P.text, { fw: 600 });

  text(195, 62, 'Market Pulse', 15, P.text, { fw: 600, anchor: 'middle' });

  // Date chip
  rect(145, 74, 100, 22, P.card, { rx: 11 });
  text(195, 88, 'Apr 13, 2026', 10, P.sub, { anchor: 'middle' });

  // ── Hero editorial insight ──
  rect(16, 106, 358, 100, P.acc, { rx: 16 });
  text(32, 130, 'MARKET BRIEF', 9, P.acc3, { fw: 700, ls: 1.5 });
  text(32, 156, 'Equities rally on', 18, P.white, { fw: 500, font: 'Georgia, serif' });
  text(32, 178, 'soft inflation data.', 18, P.white, { fw: 600, font: 'Georgia, serif' });
  text(32, 199, 'CPI at 2.8% — closest to target since 2021.', 10, P.white, { opacity: 0.7 });

  // ── Index tiles (bento 2-col) ──
  text(20, 220, 'Indices', 11, P.sub, { fw: 600, ls: 0.5 });
  const idxData = [
    { name: 'S&P 500',  val: '5,248.3', chg: '+0.82%', pos: true },
    { name: 'Nasdaq',   val: '18,420.1', chg: '+1.1%',  pos: true },
    { name: 'Dow Jones',val: '39,105.2', chg: '+0.41%', pos: true },
    { name: 'Russell',  val: '2,082.7',  chg: '-0.23%', pos: false },
  ];
  idxData.forEach((idx, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const bx = 16 + col * 184, by = 234 + row * 76;
    rect(bx, by, 172, 66, P.surf, { rx: 12, stroke: P.border, sw: 1 });
    text(bx + 12, by + 19, idx.name, 10, P.sub, { fw: 500 });
    text(bx + 12, by + 44, idx.val, 17, P.text, { fw: 600, font: 'Georgia, serif' });
    text(bx + 160, by + 44, idx.chg, 12, idx.pos ? P.pos : P.neg, { fw: 600, anchor: 'end' });
  });

  // ── Movers ──
  text(20, 396, 'Top Movers', 11, P.sub, { fw: 600, ls: 0.5 });
  const movers = [
    { sym: 'ARM',  name: 'Arm Holdings',      chg: '+6.4%', pos: true },
    { sym: 'SMCI', name: 'Super Micro Comp',   chg: '+5.1%', pos: true },
    { sym: 'PARA', name: 'Paramount Global',   chg: '-4.8%', pos: false },
    { sym: 'PFE',  name: 'Pfizer',             chg: '-2.9%', pos: false },
  ];
  movers.forEach((m, i) => {
    rect(16, 412 + i * 56, 358, 48, P.surf, { rx: 10 });
    rect(24, 420 + i * 56, 32, 32, m.pos ? P.acc2 : P.neg, { rx: 8, opacity: 0.15 });
    text(40, 440 + i * 56, m.sym, 9, m.pos ? P.acc2 : P.neg, { fw: 700, anchor: 'middle' });
    text(64, 430 + i * 56, m.name, 12, P.text, { fw: 500 });
    text(64, 448 + i * 56, 'NYSE  ·  Today', 9,  P.sub);
    text(372, 436 + i * 56, m.chg, 14, m.pos ? P.pos : P.neg, { fw: 700, anchor: 'end' });
  });

  // ── Watchlist nudge ──
  rect(16, 643, 358, 48, P.card2, { rx: 12 });
  text(195, 664, '+ Add to Watchlist', 11, P.acc, { anchor: 'middle', fw: 600 });
  text(195, 681, 'Track symbols from your portfolio', 10, P.sub, { anchor: 'middle' });

  // ── Nav ──
  rect(0, 750, W, 94, P.surf, { stroke: P.border, sw: 0.5 });
  [
    { icon: '◈', label: 'Portfolio', x: 48 },
    { icon: '↗', label: 'Markets', x: 138, active: true },
    { icon: '+', label: 'Add', x: 195 },
    { icon: '◷', label: 'History', x: 252 },
    { icon: '○', label: 'Profile', x: 342 },
  ].forEach(n => {
    if (n.active) rect(n.x - 24, 754, 48, 40, P.card2, { rx: 12 });
    text(n.x, 776, n.icon, 18, n.active ? P.acc : P.muted, { anchor: 'middle' });
    text(n.x, 793, n.label, 9, n.active ? P.acc : P.muted, { anchor: 'middle', fw: n.active ? 600 : 400 });
  });

  endScreen('Market Pulse');
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen 5 — Goals & Planning
// Bento blocks again, clean goal tracking with progress meters.
// ─────────────────────────────────────────────────────────────────────────────
{
  startScreen('Goals');

  rect(0, 0, W, H, P.bg);
  rect(0, 0, W, 44, P.bg);
  text(20, 14, '9:41', 11, P.text, { fw: 600 });

  text(195, 62, 'Goals', 15, P.text, { fw: 600, anchor: 'middle' });
  text(20, 62, '←', 18,  P.acc);
  rect(334, 48, 44, 24, P.acc, { rx: 12 });
  text(356, 63, '+ New', 10, P.white, { anchor: 'middle', fw: 600 });

  // ── Summary strip ──
  rect(16, 80, 358, 52, P.surf, { rx: 12, stroke: P.border, sw: 1 });
  text(32, 100, '3 active goals', 11, P.sub, { fw: 500 });
  text(32, 122, 'On track for 2 of 3 targets', 13, P.text, { fw: 500 });
  circle(355, 106, 14, P.acc2, { opacity: 0.15 });
  text(355, 111, '✓', 14, P.acc2, { anchor: 'middle', fw: 700 });

  // ── Goal 1: Retirement ──
  rect(16, 148, 358, 130, P.surf, { rx: 16, stroke: P.border, sw: 1 });
  rect(16, 148, 358, 130, P.acc2, { rx: 16, opacity: 0.04 });
  text(30, 172, 'Retirement Fund', 14, P.text, { fw: 600 });
  text(30, 190, 'Target 2045  ·  IRA + Brokerage', 10,  P.sub);
  text(352, 172, '68%', 22, P.acc2, { fw: 700, anchor: 'end', font: 'Georgia, serif' });
  text(352, 190, 'funded', 9, P.sub, { anchor: 'end' });
  // progress bar
  rect(30, 202, 314, 6, P.border, { rx: 3 });
  rect(30, 202, 213, 6, P.acc2, { rx: 3 });
  text(30, 226, '$136,000', 16, P.text, { fw: 600, font: 'Georgia, serif' });
  text(30, 244, 'of $200,000 goal', 10,  P.sub);
  text(352, 226, '19 yrs left', 11, P.sub, { anchor: 'end' });
  text(352, 244, 'On track ✓', 10, P.acc2, { anchor: 'end', fw: 500 });

  // ── Goal 2: House Down Payment ──
  rect(16, 292, 358, 120, P.surf, { rx: 16, stroke: P.border, sw: 1 });
  text(30, 316, 'House Down Payment', 14, P.text, { fw: 600 });
  text(30, 334, 'Target Dec 2026  ·  HYSA + ETF', 10,  P.sub);
  text(352, 316, '44%', 22, P.acc3, { fw: 700, anchor: 'end', font: 'Georgia, serif' });
  text(352, 334, 'funded', 9, P.sub, { anchor: 'end' });
  rect(30, 346, 314, 6, P.border, { rx: 3 });
  rect(30, 346, 138, 6, P.acc3, { rx: 3 });
  text(30, 368, '$44,000', 16, P.text, { fw: 600, font: 'Georgia, serif' });
  text(30, 386, 'of $100,000 goal', 10,  P.sub);
  text(352, 368, '8 mos left', 11, P.sub, { anchor: 'end' });
  text(352, 386, 'Needs boost ⚠', 10, P.acc3, { anchor: 'end', fw: 500 });

  // ── Goal 3: Emergency Fund ──
  rect(16, 426, 358, 100, P.surf, { rx: 16, stroke: P.border, sw: 1 });
  text(30, 450, 'Emergency Fund', 14, P.text, { fw: 600 });
  text(30, 468, 'Target Q3 2025  ·  HYSA', 10,  P.sub);
  text(352, 450, '100%', 22, P.pos, { fw: 700, anchor: 'end', font: 'Georgia, serif' });
  text(352, 468, 'complete!', 9, P.acc2, { anchor: 'end', fw: 600 });
  rect(30, 480, 314, 6, P.acc2, { rx: 3 });
  text(30, 504, '$18,000 · 6 months', 12, P.text, { fw: 500 });
  text(352, 504, 'Done ✓', 10, P.acc2, { anchor: 'end', fw: 600 });

  // ── Monthly savings recommendation ──
  rect(16, 542, 358, 66, P.card2, { rx: 14 });
  text(30, 562, 'Monthly savings needed', 10, P.sub, { fw: 500, ls: 0.3 });
  text(30, 588, '$2,100', 24, P.acc, { fw: 700, font: 'Georgia, serif' });
  text(116, 588, '  to stay on track across all goals', 11,  P.sub);

  // ── Insight snippet ──
  rect(16, 624, 358, 72, P.surf, { rx: 12, stroke: P.border, sw: 1 });
  text(30, 644, '💡 Tip from ALTO', 11, P.acc3, { fw: 600 });
  text(30, 662, 'Consider increasing your down payment', 11,  P.sub);
  text(30, 677, 'contribution by $400/mo to reach goal.', 11,  P.sub);
  text(352, 650, 'Adjust →', 11, P.acc, { anchor: 'end', fw: 500 });

  // ── Nav ──
  rect(0, 750, W, 94, P.surf, { stroke: P.border, sw: 0.5 });
  [
    { icon: '◈', label: 'Portfolio', x: 48 },
    { icon: '↗', label: 'Markets', x: 138 },
    { icon: '+', label: 'Add', x: 195 },
    { icon: '◷', label: 'History', x: 252 },
    { icon: '○', label: 'Profile', x: 342 },
  ].forEach(n => {
    text(n.x, 776, n.icon, 18, P.muted, { anchor: 'middle' });
    text(n.x, 793, n.label, 9, P.muted, { anchor: 'middle' });
  });

  endScreen('Goals');
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen 6 — Add Transaction
// Clean form / entry screen with warm editorial styling.
// ─────────────────────────────────────────────────────────────────────────────
{
  startScreen('Add Transaction');

  rect(0, 0, W, H, P.bg);
  rect(0, 0, W, 44, P.bg);
  text(20, 14, '9:41', 11, P.text, { fw: 600 });

  text(195, 62, 'Add Transaction', 15, P.text, { fw: 600, anchor: 'middle' });
  text(20, 62, '✕', 16,  P.sub);

  // ── Type selector ──
  rect(16, 80, 358, 40, P.card, { rx: 20 });
  // Buy active
  rect(18, 82, 116, 36, P.acc, { rx: 18 });
  text(76, 103, 'Buy', 13, P.white, { fw: 600, anchor: 'middle' });
  text(195, 103, 'Sell', 13, P.sub, { anchor: 'middle' });
  text(314, 103, 'Transfer', 13, P.sub, { anchor: 'middle' });

  // ── Ticker search ──
  text(20, 142, 'Symbol', 10, P.sub, { fw: 600, ls: 0.5 });
  rect(16, 154, 358, 52, P.surf, { rx: 14, stroke: P.acc, sw: 1.5 });
  text(32, 183, 'AAPL', 18, P.text, { fw: 600, font: 'Georgia, serif' });
  text(230, 175, 'Apple Inc.', 11,  P.sub);
  text(230, 191, '$200.50  ↑ +1.2%', 10,  P.pos);
  circle(345, 180, 14, P.card2);
  text(345, 184, '✕', 10, P.sub, { anchor: 'middle' });

  // ── Quantity ──
  text(20, 222, 'Shares', 10, P.sub, { fw: 600, ls: 0.5 });
  rect(16, 234, 170, 52, P.surf, { rx: 14, stroke: P.border, sw: 1 });
  text(100, 264, '10', 24, P.text, { fw: 600, font: 'Georgia, serif', anchor: 'middle' });
  rect(16, 234, 40, 52, P.card, { rx: 14 });
  text(36, 264, '−', 20, P.sub, { anchor: 'middle' });
  rect(146, 234, 40, 52, P.card, { rx: 14 });
  text(166, 264, '+', 20, P.acc, { fw: 700, anchor: 'middle' });

  // ── Price per share ──
  text(202, 222, 'Price per Share', 10, P.sub, { fw: 600, ls: 0.5 });
  rect(200, 234, 174, 52, P.surf, { rx: 14, stroke: P.border, sw: 1 });
  text(287, 264, '$200.50', 20, P.text, { fw: 600, font: 'Georgia, serif', anchor: 'middle' });

  // ── Date ──
  text(20, 302, 'Date', 10, P.sub, { fw: 600, ls: 0.5 });
  rect(16, 314, 170, 44, P.surf, { rx: 12, stroke: P.border, sw: 1 });
  text(100, 340, 'Today', 13, P.text, { anchor: 'middle' });

  // ── Account ──
  text(202, 302, 'Account', 10, P.sub, { fw: 600, ls: 0.5 });
  rect(200, 314, 174, 44, P.surf, { rx: 12, stroke: P.border, sw: 1 });
  text(287, 340, 'Brokerage  ▾', 13, P.text, { anchor: 'middle' });

  // ── Order summary ──
  rect(16, 374, 358, 90, P.card, { rx: 16 });
  text(30, 396, 'Order Summary', 11, P.sub, { fw: 600, ls: 0.5 });
  line(30, 404, 360, 404, P.border, { sw: 0.5 });
  text(30, 422, '10 × AAPL @ $200.50', 13,  P.text);
  text(30, 442, 'Estimated total', 11,  P.sub);
  text(352, 422, '$2,005.00', 14, P.text, { fw: 600, anchor: 'end' });
  text(352, 442, 'excl. fees', 9, P.sub, { anchor: 'end' });
  text(30, 458, 'Commission (estimated)', 10,  P.sub);
  text(352, 458, '$0.00', 11, P.sub, { anchor: 'end' });

  // ── Notes optional ──
  text(20, 480, 'Notes  (optional)', 10, P.sub, { fw: 600, ls: 0.5 });
  rect(16, 492, 358, 56, P.surf, { rx: 12, stroke: P.border, sw: 1 });
  text(28, 520, 'Add a note about this trade...', 13,  P.muted);

  // ── Add fees toggle ──
  rect(16, 562, 358, 40, P.surf, { rx: 12 });
  text(28, 586, 'Include brokerage fee', 12,  P.sub);
  // toggle off
  rect(322, 571, 40, 20, P.border, { rx: 10 });
  circle(352, 581, 9, P.white);

  // ── CTA ──
  rect(16, 618, 358, 54, P.acc, { rx: 16 });
  text(195, 649, 'Confirm Buy  →', 16, P.white, { fw: 600, anchor: 'middle' });

  rect(16, 684, 358, 40, P.bg);
  text(195, 707, 'Save as draft', 12, P.sub, { anchor: 'middle' });

  // ── Nav ──
  rect(0, 750, W, 94, P.surf, { stroke: P.border, sw: 0.5 });
  [
    { icon: '◈', label: 'Portfolio', x: 48 },
    { icon: '↗', label: 'Markets', x: 138 },
    { icon: '+', label: 'Add', x: 195, active: true },
    { icon: '◷', label: 'History', x: 252 },
    { icon: '○', label: 'Profile', x: 342 },
  ].forEach(n => {
    if (n.active) rect(n.x - 24, 754, 48, 40, P.card2, { rx: 12 });
    text(n.x, 776, n.icon, 18, n.active ? P.acc : P.muted, { anchor: 'middle' });
    text(n.x, 793, n.label, 9, n.active ? P.acc : P.muted, { anchor: 'middle', fw: n.active ? 600 : 400 });
  });

  endScreen('Add Transaction');
}

// ─────────────────────────────────────────────────────────────────────────────
// Assemble and write .pen file
// ─────────────────────────────────────────────────────────────────────────────
const totalElements = elements.length;
const pen = {
  version: '2.8',
  metadata: {
    name:       NAME,
    tagline:    TAGLINE,
    author:     'RAM',
    date:       new Date().toISOString().slice(0, 10),
    theme:      'light',
    heartbeat:  HEARTBEAT,
    slug:       SLUG,
    archetype:  'personal-finance',
    palette: {
      bg:      P.bg,
      surface: P.surf,
      card:    P.card,
      accent:  P.acc,
      accent2: P.acc2,
      text:    P.text,
    },
    inspiration: 'minimal.gallery warm minimalism + saaspo.com bento grid + lapa.ninja story-driven editorial',
    elements: totalElements,
  },
  screens,
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
