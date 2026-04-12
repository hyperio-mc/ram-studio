'use strict';
// neuralvault-app.js — NEURALVAULT: AI-Powered DeFi Portfolio Tracker
//
// Inspired by:
//   • Dribbble #1 trending: "Crypto Trading App UI – DeFi Mobile Design" by Nixtio
//     (131 likes, 12.7k views — March 2026) — bento grid cards, neon accents,
//     monospace price data, glowing asset pills.
//   • Superset.sh (darkmodedesign.com) — terminal/matrix aesthetic, pure void-black
//     (#0A0B0F), neon emerald green AI-state indicators, electric cyan highlights.
//   • Evervault.com/customers (godly.website) — clean dark card-based layouts with
//     strong information hierarchy and data-forward case study panels.
//
// Challenge: Design a 5-screen dark-mode DeFi AI portfolio tracker that merges
// the bento-grid card layout from Dribbble's top DeFi shot with Superset's
// terminal/matrix identity. Void black (#0A0B0F), neon emerald (#00FF88),
// electric cyan (#00D4FF), monospace numbers for prices. New territory: mixing
// AI confidence scores into financial data — each trade signal has a neural
// confidence meter built from segmented bar components.
//
// Screens: Portfolio · Markets · Trade · Analytics · AI Signals

const fs   = require('fs');
const path = require('path');

// ── Palette ────────────────────────────────────────────────────────────────────
const P = {
  bg:       '#0A0B0F',
  surface:  '#111318',
  surface2: '#161921',
  surface3: '#1C2029',
  border:   '#1E2330',
  border2:  '#252B3B',
  fg:       '#E8EAF0',
  fg2:      '#7B8099',
  fg3:      '#3A3F52',
  emerald:  '#00FF88',   // neon emerald — positive / AI active
  emeraldLo:'#00FF8815',
  emeraldMd:'#00FF8830',
  cyan:     '#00D4FF',   // electric cyan — highlights / buy signals
  cyanLo:   '#00D4FF15',
  cyanMd:   '#00D4FF28',
  purple:   '#9B6DFF',   // violet — AI neural indicator
  purpleLo: '#9B6DFF18',
  red:      '#FF4560',   // loss / sell signal
  redLo:    '#FF456018',
  amber:    '#FFB020',   // caution / pending
  amberLo:  '#FFB02015',
};

let _id = 0;
const uid = () => `nv${++_id}`;

// ── Primitives ──────────────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill || P.bg,
  clip: opts.clip !== undefined ? opts.clip : false,
  ...(opts.r  !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.ch || [],
});

const T = (content, x, y, w, h, opts = {}) => ({
  id: uid(), type: 'text', content, x, y, width: w, height: h,
  textGrowth: 'fixed-width-height',
  fontSize:   opts.size   || 13,
  fontWeight: String(opts.weight || 400),
  fill:       opts.fill   || P.fg,
  textAlign:  opts.align  || 'left',
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh !== undefined ? { lineHeight: opts.lh }   : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
});

const Line = (x, y, w, fill = P.border, opts = {}) => F(x, y, w, 1, fill, opts);

// Status pill
const Pill = (label, x, y, color, opts = {}) => {
  const w = opts.w || (label.length * 7 + 20);
  return F(x, y, w, 20, color + '20', { r: 10, ch: [
    T(label, 0, 3, w, 14, { size: 9, fill: color, align: 'center', weight: 600, ls: 0.5 }),
  ]});
};

// Monospace number block (for prices)
const MonoNum = (val, x, y, w, h, opts = {}) => T(val, x, y, w, h, {
  size: opts.size || 20,
  weight: opts.weight || 700,
  fill: opts.fill || P.fg,
  ...opts,
});

// Neural confidence segment bar (NV specialty — AI confidence meter)
const ConfidenceBar = (x, y, w, confidence, label) => {
  const segs = 12;
  const active = Math.round(confidence * segs);
  const segW = Math.floor((w - (segs - 1) * 2) / segs);
  const children = [];
  for (let i = 0; i < segs; i++) {
    const color = i < active
      ? (confidence > 0.75 ? P.emerald : confidence > 0.5 ? P.amber : P.red)
      : P.border2;
    children.push(F(i * (segW + 2), 0, segW, 6, color, { r: 1 }));
  }
  const pct = Math.round(confidence * 100);
  return F(x, y, w, 22, 'transparent', { ch: [
    F(0, 8, w, 6, 'transparent', { ch: children }),
    T(label, 0, 0, w - 30, 7, { size: 8, fill: P.fg2, weight: 500, ls: 0.3 }),
    T(`${pct}%`, w - 28, 0, 28, 7, { size: 8, fill: confidence > 0.75 ? P.emerald : P.amber, weight: 700, align: 'right' }),
  ]});
};

// Mini spark line (pseudo chart using thin frames)
const SparkLine = (x, y, w, h, color, points = []) => {
  const pts = points.length ? points : [0.5, 0.6, 0.4, 0.7, 0.55, 0.8, 0.65, 0.9, 0.75, 1.0];
  const bars = pts.map((p, i) => {
    const bh = Math.max(2, Math.round(p * h));
    return F(i * Math.floor(w / pts.length), h - bh, Math.floor(w / pts.length) - 1, bh, color + '60', { r: 1 });
  });
  return F(x, y, w, h, 'transparent', { ch: bars });
};

// Asset row (name, ticker, price, change)
const AssetRow = (x, y, w, name, ticker, price, change, isUp, sparkPts) => {
  const changeColor = isUp ? P.emerald : P.red;
  return F(x, y, w, 52, 'transparent', { ch: [
    // dot indicator
    E(0, 18, 8, 8, changeColor, { opacity: 0.8 }),
    // name + ticker
    T(name, 16, 6, 90, 16, { size: 13, weight: 600, fill: P.fg }),
    T(ticker, 16, 24, 90, 13, { size: 10, fill: P.fg3, weight: 500, ls: 1 }),
    // spark
    SparkLine(110, 8, 60, 28, changeColor, sparkPts),
    // price + change
    T(price, w - 100, 6, 100, 16, { size: 13, weight: 700, fill: P.fg, align: 'right' }),
    T(change, w - 100, 24, 100, 13, { size: 11, fill: changeColor, align: 'right', weight: 600 }),
    Line(0, 51, w, P.border),
  ]});
};

// Bento card
const BentoCard = (x, y, w, h, ch = []) =>
  F(x, y, w, h, P.surface, { r: 12, stroke: P.border, sw: 1, ch });

// Nav bar
const NavBar = (W, H, activeIdx) => {
  const items = ['Portfolio', 'Markets', 'Trade', 'Analytics', 'Signals'];
  const icons = ['◈', '◉', '⊕', '◐', '⚡'];
  const iw = Math.floor(W / items.length);
  return F(0, H - 72, W, 72, P.surface, { stroke: P.border, sw: 1, ch: [
    ...items.map((label, i) => {
      const active = i === activeIdx;
      return F(i * iw, 0, iw, 72, 'transparent', { ch: [
        T(icons[i], iw / 2 - 10, 12, 20, 20, { size: 16, fill: active ? P.emerald : P.fg3, align: 'center' }),
        T(label, 0, 36, iw, 14, { size: 9, fill: active ? P.emerald : P.fg3, align: 'center', ls: 0.5, weight: active ? 700 : 400 }),
        ...(active ? [F(iw / 2 - 16, 62, 32, 2, P.emerald, { r: 1 })] : []),
      ]});
    }),
  ]});
};

// Status bar
const StatusBar = (W, time = '9:41') => F(0, 0, W, 44, 'transparent', { ch: [
  T(time, 20, 14, 40, 16, { size: 14, weight: 700, fill: P.fg }),
  T('NeuralVault', W / 2 - 50, 14, 100, 16, { size: 12, weight: 800, fill: P.emerald, align: 'center', ls: 2 }),
  T('● 98%', W - 60, 14, 50, 16, { size: 11, fill: P.fg2, align: 'right' }),
]});

// ── Screen 1: Portfolio Overview ────────────────────────────────────────────────
function screenPortfolio() {
  const W = 390, H = 844;
  const ch = [];
  ch.push(F(0, 0, W, H, P.bg));

  // Subtle grid bg texture
  ch.push(F(0, 0, W, H, 'transparent', { ch: [
    ...Array.from({ length: 8 }, (_, i) => Line(0, 60 + i * 90, W, P.border + '40')),
    ...Array.from({ length: 5 }, (_, i) => F(i * 80, 0, 1, H, P.border + '30')),
  ]}));

  // Status bar
  ch.push(StatusBar(W));

  // Hero balance card
  const heroCard = BentoCard(16, 52, W - 32, 140, [
    T('TOTAL PORTFOLIO VALUE', 16, 14, 200, 12, { size: 9, fill: P.fg3, ls: 2, weight: 600 }),
    T('$247,831', 16, 32, 260, 48, { size: 42, weight: 900, fill: P.fg }),
    T('.54', 196, 44, 60, 36, { size: 28, weight: 300, fill: P.fg2 }),
    T('+$4,218  +1.73%', 16, 86, 180, 18, { size: 14, fill: P.emerald, weight: 700 }),
    T('↑ today', 196, 88, 60, 14, { size: 10, fill: P.fg3 }),
    // mini sparkline in hero
    SparkLine(W - 32 - 80, 28, 70, 80, P.emerald, [0.4, 0.5, 0.35, 0.55, 0.45, 0.65, 0.6, 0.75, 0.68, 0.85, 0.78, 0.92]),
    // AI status dot
    E(W - 32 - 16, 14, 8, 8, P.emerald, {}),
    T('AI ACTIVE', W - 32 - 60, 13, 48, 10, { size: 7, fill: P.emerald, ls: 1 }),
  ]);
  ch.push(heroCard);

  // 2x2 bento grid below hero
  const g = 8;
  const cw = (W - 32 - g) / 2;
  const ch2 = 100;

  // Card: BTC allocation
  ch.push(BentoCard(16, 204, cw, ch2, [
    T('BTC', 14, 12, 60, 14, { size: 10, fill: P.fg3, ls: 1.5, weight: 700 }),
    T('$89,420', 14, 30, cw - 28, 22, { size: 19, weight: 800, fill: P.fg }),
    T('+2.4%', 14, 58, 60, 16, { size: 12, fill: P.emerald, weight: 700 }),
    SparkLine(cw - 60, 20, 50, 50, P.emerald, [0.5, 0.55, 0.48, 0.62, 0.7, 0.65, 0.8]),
  ]));

  // Card: ETH allocation
  ch.push(BentoCard(16 + cw + g, 204, cw, ch2, [
    T('ETH', 14, 12, 60, 14, { size: 10, fill: P.fg3, ls: 1.5, weight: 700 }),
    T('$64,180', 14, 30, cw - 28, 22, { size: 19, weight: 800, fill: P.fg }),
    T('+0.8%', 14, 58, 60, 16, { size: 12, fill: P.emerald, weight: 700 }),
    SparkLine(cw - 60, 20, 50, 50, P.cyan, [0.6, 0.55, 0.65, 0.58, 0.7, 0.75, 0.72]),
  ]));

  // Card: SOL
  ch.push(BentoCard(16, 316, cw, ch2, [
    T('SOL', 14, 12, 60, 14, { size: 10, fill: P.fg3, ls: 1.5, weight: 700 }),
    T('$48,960', 14, 30, cw - 28, 22, { size: 19, weight: 800, fill: P.fg }),
    T('-1.2%', 14, 58, 60, 16, { size: 12, fill: P.red, weight: 700 }),
    SparkLine(cw - 60, 20, 50, 50, P.red, [0.8, 0.75, 0.7, 0.65, 0.58, 0.5, 0.45]),
  ]));

  // Card: DeFi yield
  ch.push(BentoCard(16 + cw + g, 316, cw, ch2, [
    T('YIELD', 14, 12, 60, 14, { size: 10, fill: P.fg3, ls: 1.5, weight: 700 }),
    T('12.8%', 14, 30, cw - 28, 24, { size: 22, weight: 800, fill: P.emerald }),
    T('APY est.', 14, 58, 80, 14, { size: 10, fill: P.fg3 }),
    T('↗', cw - 30, 32, 20, 20, { size: 18, fill: P.emerald }),
  ]));

  // AI insight banner
  ch.push(F(16, 428, W - 32, 50, P.purpleLo, { r: 10, stroke: P.purple + '40', sw: 1, ch: [
    T('⚡', 14, 15, 18, 20, { size: 16 }),
    T('AI SIGNAL', 36, 8, 80, 12, { size: 8, fill: P.purple, ls: 1.5, weight: 800 }),
    T('Strong BTC accumulation pattern detected', 36, 22, 240, 14, { size: 11, fill: P.fg, weight: 500 }),
    T('View →', W - 32 - 50, 18, 44, 14, { size: 11, fill: P.purple, weight: 700, align: 'right' }),
  ]}));

  // Recent activity label
  ch.push(T('RECENT ACTIVITY', 16, 494, 160, 12, { size: 9, fill: P.fg3, ls: 2, weight: 700 }));

  // Activity rows
  const activities = [
    { icon: '↑', color: P.emerald, action: 'Bought BTC', sub: 'Market order', val: '+0.012 BTC', time: '2m ago' },
    { icon: '↓', color: P.red, action: 'Sold ETH',  sub: 'Limit order',  val: '-0.5 ETH',  time: '1h ago' },
    { icon: '⚡', color: P.purple, action: 'AI Signal', sub: 'SOL reversal', val: '87% conf.', time: '3h ago' },
  ];
  activities.forEach((a, i) => {
    const ry = 514 + i * 58;
    ch.push(F(16, ry, W - 32, 52, 'transparent', { ch: [
      F(0, 10, 32, 32, a.color + '20', { r: 8, ch: [
        T(a.icon, 0, 6, 32, 20, { size: 14, fill: a.color, align: 'center' }),
      ]}),
      T(a.action, 44, 8, 140, 15, { size: 13, weight: 600, fill: P.fg }),
      T(a.sub, 44, 26, 140, 13, { size: 10, fill: P.fg3 }),
      T(a.val, W - 32 - 60, 8, 60, 15, { size: 12, fill: a.color, weight: 700, align: 'right' }),
      T(a.time, W - 32 - 60, 26, 60, 13, { size: 10, fill: P.fg3, align: 'right' }),
      Line(44, 51, W - 32 - 44, P.border),
    ]}));
  });

  ch.push(NavBar(W, H, 0));

  return { id: uid(), type: 'frame', x: 0, y: 0, width: W, height: H, fill: P.bg, children: ch };
}

// ── Screen 2: Markets ────────────────────────────────────────────────────────────
function screenMarkets() {
  const W = 390, H = 844;
  const ch = [];
  ch.push(F(0, 0, W, H, P.bg));
  ch.push(StatusBar(W, '9:41'));

  // Header
  ch.push(T('Markets', 16, 52, 140, 28, { size: 24, weight: 900, fill: P.fg }));
  ch.push(T('22 MAR · LIVE', W - 100, 60, 84, 14, { size: 9, fill: P.emerald, ls: 1.5, align: 'right', weight: 700 }));

  // Search bar
  ch.push(F(16, 90, W - 32, 40, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
    T('🔍', 12, 10, 20, 20, { size: 14 }),
    T('Search tokens, pairs, protocols...', 38, 11, 280, 18, { size: 12, fill: P.fg3 }),
  ]}));

  // Filter pills
  const filters = ['All', 'Trending 🔥', 'AI Picks ⚡', 'DeFi', 'Layer 1'];
  let fx = 16;
  filters.forEach((f, i) => {
    const fw = f.length * 7.5 + 16;
    ch.push(F(fx, 142, fw, 26, i === 1 ? P.emeraldLo : P.surface, { r: 13, stroke: i === 1 ? P.emerald + '50' : P.border, sw: 1, ch: [
      T(f, 0, 5, fw, 16, { size: 10, fill: i === 1 ? P.emerald : P.fg2, align: 'center', weight: i === 1 ? 700 : 400 }),
    ]}));
    fx += fw + 8;
  });

  // Market stats strip
  ch.push(F(16, 180, W - 32, 52, P.surface2, { r: 10, ch: [
    T('BTC DOM', 12, 8, 50, 12, { size: 8, fill: P.fg3, ls: 1 }),
    T('52.3%', 12, 22, 50, 18, { size: 14, weight: 700, fill: P.fg }),
    F(70, 10, 1, 32, P.border),
    T('FEAR/GREED', 80, 8, 80, 12, { size: 8, fill: P.fg3, ls: 1 }),
    T('72 Greed', 80, 22, 80, 18, { size: 14, weight: 700, fill: P.emerald }),
    F(168, 10, 1, 32, P.border),
    T('24H VOL', 178, 8, 60, 12, { size: 8, fill: P.fg3, ls: 1 }),
    T('$84.2B', 178, 22, 60, 18, { size: 14, weight: 700, fill: P.fg }),
    F(248, 10, 1, 32, P.border),
    T('AI SIGNAL', 258, 8, 80, 12, { size: 8, fill: P.fg3, ls: 1 }),
    T('🟢 BULL', 258, 22, 70, 18, { size: 13, weight: 700, fill: P.emerald }),
  ]}));

  // Section label
  ch.push(T('TRENDING NOW', 16, 244, 120, 12, { size: 9, fill: P.fg3, ls: 2, weight: 700 }));

  // Asset rows
  const assets = [
    { name: 'Bitcoin',   ticker: 'BTC', price: '$67,824', change: '+2.41%', up: true,  spark: [0.4,0.45,0.5,0.48,0.55,0.62,0.7,0.75,0.8,0.88] },
    { name: 'Ethereum',  ticker: 'ETH', price: '$3,580',  change: '+0.87%', up: true,  spark: [0.6,0.58,0.62,0.59,0.65,0.68,0.7,0.69,0.72,0.75] },
    { name: 'Solana',    ticker: 'SOL', price: '$182.40', change: '-1.23%', up: false, spark: [0.9,0.85,0.8,0.75,0.72,0.68,0.62,0.58,0.55,0.5]  },
    { name: 'Arbitrum',  ticker: 'ARB', price: '$1.840',  change: '+5.12%', up: true,  spark: [0.3,0.35,0.4,0.5,0.55,0.65,0.72,0.8,0.85,0.95] },
    { name: 'Pendle',    ticker: 'PENDLE', price: '$5.420', change: '+8.33%', up: true, spark: [0.2,0.3,0.35,0.42,0.55,0.6,0.7,0.78,0.9,1.0]  },
    { name: 'Chainlink', ticker: 'LINK', price: '$18.62', change: '-0.44%', up: false, spark: [0.7,0.68,0.65,0.62,0.6,0.58,0.55,0.52,0.5,0.48]  },
  ];

  assets.forEach((a, i) => {
    ch.push(AssetRow(16, 264 + i * 58, W - 32, a.name, a.ticker, a.price, a.change, a.up, a.spark));
  });

  ch.push(NavBar(W, H, 1));

  return { id: uid(), type: 'frame', x: 0, y: 0, width: W, height: H, fill: P.bg, children: ch };
}

// ── Screen 3: Trade ──────────────────────────────────────────────────────────────
function screenTrade() {
  const W = 390, H = 844;
  const ch = [];
  ch.push(F(0, 0, W, H, P.bg));

  // Glow effect behind chart
  ch.push(E(W / 2 - 80, 100, 160, 160, P.emerald, { opacity: 0.04 }));

  ch.push(StatusBar(W, '9:41'));

  // Header
  ch.push(T('Swap', 16, 52, 80, 28, { size: 24, weight: 900, fill: P.fg }));
  ch.push(Pill('AI ASSIST ON', W - 120, 60, P.emerald, { w: 100 }));

  // From card
  ch.push(BentoCard(16, 90, W - 32, 100, [
    T('FROM', 16, 12, 60, 12, { size: 9, fill: P.fg3, ls: 2, weight: 600 }),
    // Token selector
    F(16, 30, 100, 34, P.surface3, { r: 17, stroke: P.border2, sw: 1, ch: [
      E(10, 8, 18, 18, P.amber, {}),
      T('BTC ▾', 34, 9, 56, 16, { size: 13, weight: 700, fill: P.fg }),
    ]}),
    T('0.0350', 130, 30, 180, 34, { size: 26, weight: 800, fill: P.fg, align: 'right' }),
    T('Balance: 0.0412 BTC', 16, 72, 200, 14, { size: 11, fill: P.fg3 }),
    T('≈ $2,373.84', W - 32 - 10, 72, 100, 14, { size: 11, fill: P.fg2, align: 'right' }),
  ]));

  // Swap arrow
  ch.push(F(W / 2 - 18, 198, 36, 36, P.surface2, { r: 18, stroke: P.border2, sw: 1, ch: [
    T('⇅', 0, 6, 36, 24, { size: 18, fill: P.cyan, align: 'center', weight: 700 }),
  ]}));

  // To card
  ch.push(BentoCard(16, 200, W - 32, 100, [
    T('TO', 16, 12, 60, 12, { size: 9, fill: P.fg3, ls: 2, weight: 600 }),
    F(16, 30, 100, 34, P.surface3, { r: 17, stroke: P.border2, sw: 1, ch: [
      E(10, 8, 18, 18, P.cyan, {}),
      T('ETH ▾', 34, 9, 56, 16, { size: 13, weight: 700, fill: P.fg }),
    ]}),
    T('0.6621', 130, 30, 180, 34, { size: 26, weight: 800, fill: P.fg, align: 'right' }),
    T('Balance: 1.840 ETH', 16, 72, 200, 14, { size: 11, fill: P.fg3 }),
    T('≈ $2,370.12', W - 32 - 10, 72, 100, 14, { size: 11, fill: P.fg2, align: 'right' }),
  ]));

  // AI confidence panel
  ch.push(BentoCard(16, 312, W - 32, 120, [
    T('⚡ AI TRADE ANALYSIS', 16, 12, 200, 13, { size: 9, fill: P.purple, ls: 1.5, weight: 800 }),
    ConfidenceBar(16, 34, W - 64, 0.87, 'Neural Confidence'),
    ConfidenceBar(16, 64, W - 64, 0.73, 'Market Timing'),
    ConfidenceBar(16, 94, W - 64, 0.91, 'Liquidity Score'),
  ]));

  // Trade details
  ch.push(BentoCard(16, 444, W - 32, 110, [
    T('SWAP DETAILS', 16, 12, 120, 12, { size: 9, fill: P.fg3, ls: 2, weight: 600 }),
    T('Rate', 16, 32, 100, 14, { size: 12, fill: P.fg2 }),
    T('1 BTC = 18.92 ETH', W - 32 - 10, 32, 150, 14, { size: 12, fill: P.fg, align: 'right', weight: 600 }),
    T('Price Impact', 16, 52, 100, 14, { size: 12, fill: P.fg2 }),
    T('< 0.01%', W - 32 - 10, 52, 100, 14, { size: 12, fill: P.emerald, align: 'right', weight: 600 }),
    T('Network Fee', 16, 72, 100, 14, { size: 12, fill: P.fg2 }),
    T('~$2.40', W - 32 - 10, 72, 100, 14, { size: 12, fill: P.fg, align: 'right', weight: 600 }),
    T('Route', 16, 92, 100, 14, { size: 12, fill: P.fg2 }),
    T('Uniswap V4 → Curve', W - 32 - 10, 92, 170, 14, { size: 12, fill: P.cyan, align: 'right', weight: 600 }),
  ]));

  // Slippage selector
  ch.push(F(16, 566, W - 32, 36, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
    T('SLIPPAGE', 14, 10, 70, 16, { size: 9, fill: P.fg3, ls: 1 }),
    ...['0.1%', '0.5%', '1.0%', 'AUTO'].map((s, i) => {
      const sw = 48, sx = 90 + i * 56;
      return F(sx, 4, sw, 28, i === 3 ? P.cyanMd : 'transparent', { r: 8, ch: [
        T(s, 0, 6, sw, 16, { size: 11, fill: i === 3 ? P.cyan : P.fg2, align: 'center', weight: i === 3 ? 700 : 400 }),
      ]});
    }),
  ]}));

  // Swap CTA button
  ch.push(F(16, 614, W - 32, 52, P.emerald, { r: 14, ch: [
    T('EXECUTE SWAP', 0, 16, W - 32, 20, { size: 14, weight: 900, fill: P.bg, align: 'center', ls: 2 }),
  ]}));

  ch.push(NavBar(W, H, 2));

  return { id: uid(), type: 'frame', x: 0, y: 0, width: W, height: H, fill: P.bg, children: ch };
}

// ── Screen 4: Analytics ──────────────────────────────────────────────────────────
function screenAnalytics() {
  const W = 390, H = 844;
  const ch = [];
  ch.push(F(0, 0, W, H, P.bg));
  ch.push(StatusBar(W, '9:41'));

  ch.push(T('Analytics', 16, 52, 180, 28, { size: 24, weight: 900, fill: P.fg }));
  ch.push(T('MARCH 2026', W - 100, 60, 84, 14, { size: 9, fill: P.fg3, ls: 1.5, align: 'right' }));

  // Time range selector
  const ranges = ['1D', '1W', '1M', '3M', 'YTD', '1Y'];
  const rw = Math.floor((W - 32) / ranges.length);
  ch.push(F(16, 88, W - 32, 30, P.surface, { r: 8, ch: [
    ...ranges.map((r, i) => F(i * rw, 0, rw, 30, i === 2 ? P.emeraldLo : 'transparent', { r: 8, ch: [
      T(r, 0, 7, rw, 16, { size: 11, fill: i === 2 ? P.emerald : P.fg2, align: 'center', weight: i === 2 ? 700 : 400 }),
    ]})),
  ]}));

  // Big PnL number
  ch.push(T('+$24,182', 16, 128, 220, 44, { size: 38, weight: 900, fill: P.emerald }));
  ch.push(T('portfolio gain this month', 16, 176, 200, 14, { size: 11, fill: P.fg3 }));
  ch.push(T('+10.8%', 220, 138, 100, 24, { size: 18, weight: 700, fill: P.emerald }));

  // Chart area (simplified bar chart)
  const chartH = 120;
  const chartY = 202;
  const barData = [0.4, 0.5, 0.35, 0.6, 0.55, 0.7, 0.65, 0.8, 0.75, 0.88, 0.82, 0.95,
                   0.9, 1.0, 0.92, 0.85, 0.78, 0.88, 0.95, 0.9, 0.98, 1.0];
  const bw = Math.floor((W - 32) / barData.length) - 2;
  const barCh = barData.map((p, i) => {
    const bh = Math.max(4, Math.round(p * chartH));
    const color = p > 0.8 ? P.emerald : p > 0.5 ? P.cyan : P.fg3;
    return F(i * (bw + 2), chartH - bh, bw, bh, color + '70', { r: 2 });
  });
  ch.push(BentoCard(16, chartY, W - 32, chartH + 20, [
    F(10, 10, W - 52, chartH, 'transparent', { ch: barCh }),
  ]));

  // Allocation doughnut (simplified as nested circles)
  ch.push(T('ALLOCATION', 16, 342, 120, 12, { size: 9, fill: P.fg3, ls: 2, weight: 700 }));
  ch.push(BentoCard(16, 362, W - 32, 140, [
    // Visual ring segments (simplified)
    E(20, 20, 100, 100, P.emerald + '30', {}),
    E(30, 30, 80, 80, P.bg, {}),
    F(40, 44, 60, 12, 'transparent', { ch: [
      T('BTC', 0, 0, 60, 12, { size: 10, fill: P.fg3, align: 'center', ls: 1 }),
    ]}),
    F(40, 56, 60, 16, 'transparent', { ch: [
      T('36%', 0, 0, 60, 16, { size: 13, weight: 800, fill: P.fg, align: 'center' }),
    ]}),
    // Legend
    ...[ ['BTC', P.emerald, '36%', 130], ['ETH', P.cyan, '26%', 130], ['SOL', P.purple, '20%', 172], ['ARB', P.amber, '10%', 172], ['Other', P.fg3, '8%', 214] ].map(([name, color, pct, ly]) => F(132, ly - 130, 200, 20, 'transparent', { ch: [
      F(0, 5, 8, 8, color, { r: 4 }),
      T(name, 16, 2, 80, 15, { size: 12, fill: P.fg }),
      T(pct, 170, 2, 30, 15, { size: 12, fill: color, weight: 700, align: 'right' }),
    ]})),
  ]));

  // Key metrics
  ch.push(T('KEY METRICS', 16, 514, 100, 12, { size: 9, fill: P.fg3, ls: 2, weight: 700 }));
  const metrics = [
    ['Sharpe Ratio', '2.84', P.emerald],
    ['Max Drawdown', '-8.2%', P.red],
    ['Win Rate', '68.4%', P.emerald],
    ['Avg Hold', '4.2d', P.fg],
  ];
  const mw = (W - 32 - 8) / 2;
  metrics.forEach(([label, val, color], i) => {
    const mx = 16 + (i % 2) * (mw + 8);
    const my = 534 + Math.floor(i / 2) * 66;
    ch.push(BentoCard(mx, my, mw, 58, [
      T(label, 12, 8, mw - 24, 14, { size: 9, fill: P.fg3, ls: 1 }),
      T(val, 12, 26, mw - 24, 24, { size: 20, weight: 800, fill: color }),
    ]));
  });

  ch.push(NavBar(W, H, 3));

  return { id: uid(), type: 'frame', x: 0, y: 0, width: W, height: H, fill: P.bg, children: ch };
}

// ── Screen 5: AI Signals ─────────────────────────────────────────────────────────
function screenSignals() {
  const W = 390, H = 844;
  const ch = [];
  ch.push(F(0, 0, W, H, P.bg));

  // Ambient glow
  ch.push(E(W / 2 - 100, -40, 200, 200, P.purple, { opacity: 0.05 }));

  ch.push(StatusBar(W, '9:41'));

  ch.push(T('AI Signals', 16, 52, 180, 28, { size: 24, weight: 900, fill: P.fg }));
  ch.push(T('8 active', W - 80, 62, 64, 16, { size: 12, fill: P.emerald, weight: 700, align: 'right' }));

  // Neural network status
  ch.push(F(16, 90, W - 32, 60, P.purpleLo, { r: 12, stroke: P.purple + '40', sw: 1, ch: [
    T('⚡', 14, 16, 24, 28, { size: 22 }),
    T('NEURALVAULT AI ENGINE', 44, 10, 220, 13, { size: 9, fill: P.purple, ls: 1.5, weight: 800 }),
    T('Processing 2.4M data points · 99.98% uptime', 44, 27, 260, 14, { size: 11, fill: P.fg2 }),
    // pulsing indicator
    E(W - 32 - 20, 22, 12, 12, P.purple, {}),
    E(W - 32 - 26, 16, 24, 24, P.purple, { opacity: 0.3 }),
  ]}));

  // Signals list
  const signals = [
    {
      token: 'BTC', direction: 'LONG', confidence: 0.87,
      headline: 'Accumulation breakout above $67K resistance',
      target: '$74,200', stop: '$64,800', horizon: '3–5 days',
      color: P.emerald, icon: '↗',
    },
    {
      token: 'PENDLE', direction: 'LONG', confidence: 0.91,
      headline: 'Yield farming TVL surge — DeFi rotation signal',
      target: '$6.80', stop: '$4.90', horizon: '1–2 days',
      color: P.cyan, icon: '↗',
    },
    {
      token: 'ETH', direction: 'NEUTRAL', confidence: 0.62,
      headline: 'Consolidation phase — awaiting catalyst',
      target: '$3,750', stop: '$3,380', horizon: '5–7 days',
      color: P.amber, icon: '→',
    },
    {
      token: 'SOL', direction: 'SHORT', confidence: 0.78,
      headline: 'RSI divergence at key resistance — reversal risk',
      target: '$165', stop: '$190', horizon: '2–3 days',
      color: P.red, icon: '↘',
    },
  ];

  signals.forEach((s, i) => {
    const sy = 162 + i * 148;
    const sCard = BentoCard(16, sy, W - 32, 140, [
      // token + direction badge
      F(0, 0, W - 32, 38, P.surface2, { r: 12, ch: [
        T(`${s.icon} ${s.token}`, 14, 10, 80, 18, { size: 16, weight: 800, fill: s.color }),
        Pill(s.direction, 70, 10, s.color, { w: 64 }),
        // confidence bar inline
        ConfidenceBar(150, 10, W - 32 - 164, s.confidence, 'AI Confidence'),
      ]}),
      T(s.headline, 14, 46, W - 60, 28, { size: 11, fill: P.fg, lh: 1.5 }),
      // TP / SL / Horizon
      T('TARGET', 14, 82, 50, 11, { size: 8, fill: P.fg3, ls: 1 }),
      T(s.target, 14, 96, 80, 16, { size: 13, weight: 700, fill: P.emerald }),
      F(100, 82, 1, 34, P.border),
      T('STOP LOSS', 110, 82, 70, 11, { size: 8, fill: P.fg3, ls: 1 }),
      T(s.stop, 110, 96, 80, 16, { size: 13, weight: 700, fill: P.red }),
      F(200, 82, 1, 34, P.border),
      T('HORIZON', 210, 82, 70, 11, { size: 8, fill: P.fg3, ls: 1 }),
      T(s.horizon, 210, 96, 100, 16, { size: 13, weight: 700, fill: P.fg2 }),
      // action button
      F(W - 32 - 80, 82, 70, 34, s.color + '25', { r: 8, stroke: s.color + '40', sw: 1, ch: [
        T('ACT ↗', 0, 9, 70, 16, { size: 11, fill: s.color, align: 'center', weight: 700 }),
      ]}),
    ]);
    ch.push(sCard);
  });

  ch.push(NavBar(W, H, 4));

  return { id: uid(), type: 'frame', x: 0, y: 0, width: W, height: H, fill: P.bg, children: ch };
}

// ── Assemble document ────────────────────────────────────────────────────────────
const screens = [
  screenPortfolio(),
  screenMarkets(),
  screenTrade(),
  screenAnalytics(),
  screenSignals(),
];

// Lay out side by side
screens.forEach((s, i) => { s.x = i * (s.width + 80); s.y = 0; });

const doc = {
  version: '2.8',
  children: screens,
};

fs.writeFileSync(path.join(__dirname, 'neuralvault.pen'), JSON.stringify(doc, null, 2));
console.log('✅ neuralvault.pen written —', screens.length, 'screens');
