// KODA — Wealth Constellation Tracker
// Heartbeat #501 | Dark theme
// Inspired by: Superpower.com's concept-driven interface metaphor (Godly),
//              QASE starfield-glow dark pattern (Dark Mode Design),
//              KidSuper World's monospace-as-luxury-identity (Awwwards)

'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG = 'koda';
const DATE = new Date().toISOString().split('T')[0];

// ── Palette ─────────────────────────────────────────────
const BG     = '#080B12';
const SURF   = '#0E1320';
const CARD   = '#141B2E';
const CARD2  = '#1A2240';
const ACC    = '#00D4FF'; // electric cyan
const ACC2   = '#8B5CF6'; // violet
const ACC3   = '#10B981'; // emerald (positive)
const RED    = '#F43F5E'; // negative
const TEXT   = '#E8F0FE';
const MUTED  = 'rgba(140,160,210,0.55)';
const BORDER = 'rgba(0,212,255,0.18)';
const GLOW   = 'rgba(0,212,255,0.12)';
const MONO   = 'Courier New';

// ── Primitives ───────────────────────────────────────────
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
    type: 'text', x, y, content: String(content), fontSize: size, fill,
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

// ── Status bar ───────────────────────────────────────────
function statusBar() {
  return [
    text(20, 18, '9:41', 11, TEXT, { fw: 600 }),
    text(370, 18, '●●●', 9, TEXT, { anchor: 'end', opacity: 0.7 }),
  ];
}

// ── Bottom nav ───────────────────────────────────────────
function bottomNav(active) {
  const items = [
    { id: 'home',   label: 'Home',     icon: '⌂',  x: 39  },
    { id: 'port',   label: 'Portfolio',icon: '◎',  x: 117 },
    { id: 'insight',label: 'Insights', icon: '✦',  x: 195 },
    { id: 'txn',    label: 'History',  icon: '≡',  x: 273 },
    { id: 'goals',  label: 'Goals',    icon: '◈',  x: 351 },
  ];
  const els = [
    rect(0, 780, 390, 64, SURF),
    line(0, 780, 390, 780, BORDER, { sw: 0.5 }),
  ];
  items.forEach(it => {
    const isActive = it.id === active;
    const col = isActive ? ACC : MUTED;
    els.push(text(it.x, 806, it.icon, 18, col, { anchor: 'middle', font: 'system-ui' }));
    els.push(text(it.x, 820, it.label, 8, col, { anchor: 'middle', ls: 0.3 }));
    if (isActive) {
      els.push(rect(it.x - 16, 782, 32, 2, ACC, { rx: 1 }));
    }
  });
  return els;
}

// ── Star field background (constellation motif) ──────────
function starField(count = 40) {
  const stars = [];
  const positions = [
    [42,90],[180,55],[320,78],[75,180],[290,165],[150,220],
    [360,200],[50,310],[230,290],[370,330],[100,400],[280,380],
    [155,460],[330,440],[60,530],[210,510],[350,490],[90,600],
    [260,580],[380,620],[40,700],[200,670],[340,710],[120,740],
    [310,730],[170,130],[250,140],[80,250],[330,260],[195,340],
    [55,430],[285,420],[160,560],[375,550],[100,640],[240,620],
    [350,660],[65,760],[220,750],[300,770],
  ];
  positions.slice(0, count).forEach(([x, y]) => {
    const r = Math.random() > 0.8 ? 1.4 : 0.7;
    const op = 0.15 + Math.random() * 0.35;
    stars.push(circle(x, y, r, TEXT, { opacity: op }));
  });
  // subtle constellation lines
  const conns = [[0,5],[1,6],[2,3],[4,7],[8,9],[10,11],[12,13],[14,15],[16,17],[18,19]];
  conns.forEach(([a, b]) => {
    if (positions[a] && positions[b]) {
      stars.push(line(positions[a][0], positions[a][1], positions[b][0], positions[b][1], ACC, {
        sw: 0.3, opacity: 0.1,
      }));
    }
  });
  return stars;
}

// ── Glow card ────────────────────────────────────────────
function glowCard(x, y, w, h, opts = {}) {
  return [
    rect(x, y, w, h, CARD, { rx: opts.rx ?? 14, stroke: BORDER, sw: 0.8 }),
    rect(x + 1, y + 1, w - 2, 2, ACC, { rx: 1, opacity: 0.35 }),
  ];
}

// ── Sparkline (SVG path-like using lines) ────────────────
function sparkline(x, y, w, h, values, color) {
  const els = [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = w / (values.length - 1);
  for (let i = 0; i < values.length - 1; i++) {
    const x1 = x + i * step;
    const y1 = y + h - ((values[i] - min) / range) * h;
    const x2 = x + (i + 1) * step;
    const y2 = y + h - ((values[i + 1] - min) / range) * h;
    els.push(line(x1, y1, x2, y2, color, { sw: 1.5, opacity: 0.85 }));
  }
  // last dot
  const lastX = x + (values.length - 1) * step;
  const lastY = y + h - ((values[values.length - 1] - min) / range) * h;
  els.push(circle(lastX, lastY, 2.5, color, { opacity: 1 }));
  return els;
}

// ── Progress arc (approximated with rect segments) ───────
function progressArc(cx, cy, r, pct, color) {
  const els = [];
  // track ring
  els.push(circle(cx, cy, r, 'none', { stroke: CARD2, sw: 5 }));
  // filled arc (simplified as a colored ring sector — use multiple small line segments)
  const total = 32;
  const filled = Math.round(pct / 100 * total);
  for (let i = 0; i < total; i++) {
    const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
    const nextAngle = ((i + 1) / total) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + Math.cos(angle) * r;
    const y1 = cy + Math.sin(angle) * r;
    const x2 = cx + Math.cos(nextAngle) * r;
    const y2 = cy + Math.sin(nextAngle) * r;
    const col = i < filled ? color : 'transparent';
    if (i < filled) {
      els.push(line(x1, y1, x2, y2, col, { sw: 5.5, opacity: i < filled ? 1 : 0 }));
    }
  }
  return els;
}

// ════════════════════════════════════════════════════════
// SCREEN 1 — Home / Net Worth
// ════════════════════════════════════════════════════════
function screen1() {
  const els = [
    rect(0, 0, 390, 844, BG),
    ...starField(40),
    ...statusBar(),

    // header
    text(20, 52, 'KODA', 22, ACC, { fw: 700, font: MONO, ls: 4 }),
    text(20, 70, 'wealth constellation', 9, MUTED, { ls: 1.5 }),
    circle(355, 54, 18, CARD, { stroke: BORDER, sw: 0.8 }),
    text(355, 60, '☽', 14, ACC2, { anchor: 'middle', font: 'system-ui' }),

    // net worth label
    text(195, 108, 'NET WORTH', 9, MUTED, { anchor: 'middle', ls: 2.5, font: MONO }),
    text(195, 148, '$247,830', 42, TEXT, { anchor: 'middle', fw: 700 }),
    text(195, 168, '+$3,210  +1.31%  today', 11, ACC3, { anchor: 'middle' }),

    // sparkline card
    ...glowCard(20, 185, 350, 90),
    text(30, 202, 'Portfolio 30d', 9, MUTED, { ls: 1 }),
    ...sparkline(30, 207, 330, 58,
      [218, 222, 219, 228, 231, 225, 234, 238, 235, 241, 239, 244, 247], ACC),
    text(342, 268, '+13.4%', 9, ACC3, { anchor: 'end' }),

    // stat row
    ...glowCard(20, 288, 108, 62, { rx: 12 }),
    text(74, 308, '$184K', 14, TEXT, { anchor: 'middle', fw: 700 }),
    text(74, 322, 'Stocks', 9, MUTED, { anchor: 'middle' }),
    text(74, 336, '+2.1%', 9, ACC3, { anchor: 'middle' }),

    ...glowCard(140, 288, 108, 62, { rx: 12 }),
    text(194, 308, '$38K', 14, TEXT, { anchor: 'middle', fw: 700 }),
    text(194, 322, 'Crypto', 9, MUTED, { anchor: 'middle' }),
    text(194, 336, '+5.7%', 9, ACC3, { anchor: 'middle' }),

    ...glowCard(260, 288, 108, 62, { rx: 12 }),
    text(314, 308, '$25K', 14, TEXT, { anchor: 'middle', fw: 700 }),
    text(314, 322, 'Cash', 9, MUTED, { anchor: 'middle' }),
    text(314, 336, '+0.4%', 9, ACC3, { anchor: 'middle' }),

    // top movers section
    text(20, 375, 'TOP MOVERS', 9, MUTED, { ls: 2.5, font: MONO }),

    // mover cards
    ...glowCard(20, 390, 350, 54, { rx: 12 }),
    text(35, 409, '◆', 12, ACC, { font: 'system-ui', opacity: 0.9 }),
    text(55, 409, 'NVDA', 12, TEXT, { fw: 600 }),
    text(55, 423, 'NVIDIA Corp', 9, MUTED),
    ...sparkline(200, 397, 80, 30,
      [100, 108, 105, 115, 119, 124, 128, 132], ACC3),
    text(355, 409, '+7.24%', 11, ACC3, { anchor: 'end', fw: 600, font: MONO }),
    text(355, 423, '$132.40', 9, MUTED, { anchor: 'end', font: MONO }),

    ...glowCard(20, 452, 350, 54, { rx: 12 }),
    text(35, 471, '◆', 12, ACC2, { font: 'system-ui', opacity: 0.9 }),
    text(55, 471, 'ETH', 12, TEXT, { fw: 600 }),
    text(55, 485, 'Ethereum', 9, MUTED),
    ...sparkline(200, 459, 80, 30,
      [320, 315, 308, 298, 305, 295, 288, 282], RED),
    text(355, 471, '−3.82%', 11, RED, { anchor: 'end', fw: 600, font: MONO }),
    text(355, 485, '$2,847', 9, MUTED, { anchor: 'end', font: MONO }),

    ...glowCard(20, 514, 350, 54, { rx: 12 }),
    text(35, 533, '◆', 12, ACC3, { font: 'system-ui', opacity: 0.9 }),
    text(55, 533, 'AAPL', 12, TEXT, { fw: 600 }),
    text(55, 547, 'Apple Inc', 9, MUTED),
    ...sparkline(200, 521, 80, 30,
      [178, 181, 183, 179, 184, 188, 186, 191], ACC3),
    text(355, 533, '+1.55%', 11, ACC3, { anchor: 'end', fw: 600, font: MONO }),
    text(355, 547, '$191.20', 9, MUTED, { anchor: 'end', font: MONO }),

    // AI pulse strip
    rect(20, 580, 350, 44, '#0D1F3C', { rx: 10, stroke: ACC2, sw: 0.6 }),
    text(35, 598, '✦', 11, ACC2, { font: 'system-ui' }),
    text(50, 598, 'KODA AI sees a rebalancing opportunity', 10, TEXT, { opacity: 0.9 }),
    text(50, 611, 'Your crypto allocation is 4% above target', 9, MUTED),
    text(355, 605, '›', 14, ACC2, { anchor: 'end' }),

    // monthly summary
    text(20, 643, 'THIS MONTH', 9, MUTED, { ls: 2.5, font: MONO }),
    ...glowCard(20, 658, 168, 54, { rx: 12 }),
    text(104, 678, '+$4,320', 14, ACC3, { anchor: 'middle', fw: 700 }),
    text(104, 692, 'Earned', 9, MUTED, { anchor: 'middle' }),
    ...glowCard(200, 658, 168, 54, { rx: 12 }),
    text(284, 678, '−$2,840', 14, RED, { anchor: 'middle', fw: 700 }),
    text(284, 692, 'Spent', 9, MUTED, { anchor: 'middle' }),

    ...bottomNav('home'),
  ];
  return { name: 'Home — Net Worth', elements: els };
}

// ════════════════════════════════════════════════════════
// SCREEN 2 — Portfolio Constellation
// ════════════════════════════════════════════════════════
function screen2() {
  const els = [
    rect(0, 0, 390, 844, BG),
    ...starField(25),
    ...statusBar(),

    text(195, 48, 'PORTFOLIO', 12, TEXT, { anchor: 'middle', fw: 600, ls: 2 }),
    text(195, 62, 'asset constellation', 8, MUTED, { anchor: 'middle', ls: 1.5, font: MONO }),

    // large arc rings
    ...progressArc(195, 200, 90, 74, ACC),
    ...progressArc(195, 200, 72, 54, ACC2),
    ...progressArc(195, 200, 54, 22, ACC3),

    text(195, 192, '$247,830', 16, TEXT, { anchor: 'middle', fw: 700 }),
    text(195, 208, 'Total Value', 9, MUTED, { anchor: 'middle' }),

    // legend
    circle(45, 310, 5, ACC),
    text(55, 314, 'Equities', 10, TEXT),
    text(160, 314, '74.3%', 10, ACC, { fw: 600, font: MONO }),

    circle(45, 330, 5, ACC2),
    text(55, 334, 'Crypto', 10, TEXT),
    text(160, 334, '15.5%', 10, ACC2, { fw: 600, font: MONO }),

    circle(45, 350, 5, ACC3),
    text(55, 354, 'Cash & FI', 10, TEXT),
    text(160, 354, '10.2%', 10, ACC3, { fw: 600, font: MONO }),

    // divider
    line(20, 372, 370, 372, BORDER, { sw: 0.5 }),

    // holdings list
    text(20, 390, 'HOLDINGS', 9, MUTED, { ls: 2.5, font: MONO }),

    ...glowCard(20, 402, 350, 50, { rx: 12 }),
    circle(42, 427, 10, '#1A2240', { stroke: ACC, sw: 1.2 }),
    text(42, 431, 'N', 9, ACC, { anchor: 'middle', fw: 700 }),
    text(60, 421, 'NVDA', 11, TEXT, { fw: 600 }),
    text(60, 435, '14 shares · Equities', 9, MUTED),
    text(355, 421, '$132.40', 11, TEXT, { anchor: 'end', fw: 600, font: MONO }),
    text(355, 435, '+$892', 9, ACC3, { anchor: 'end', font: MONO }),

    ...glowCard(20, 460, 350, 50, { rx: 12 }),
    circle(42, 485, 10, '#1A2240', { stroke: ACC, sw: 1.2 }),
    text(42, 489, 'A', 9, ACC, { anchor: 'middle', fw: 700 }),
    text(60, 479, 'AAPL', 11, TEXT, { fw: 600 }),
    text(60, 493, '48 shares · Equities', 9, MUTED),
    text(355, 479, '$9,177', 11, TEXT, { anchor: 'end', fw: 600, font: MONO }),
    text(355, 493, '+$374', 9, ACC3, { anchor: 'end', font: MONO }),

    ...glowCard(20, 518, 350, 50, { rx: 12 }),
    circle(42, 543, 10, '#1A2240', { stroke: ACC2, sw: 1.2 }),
    text(42, 547, 'E', 9, ACC2, { anchor: 'middle', fw: 700 }),
    text(60, 537, 'ETH', 11, TEXT, { fw: 600 }),
    text(60, 551, '2.8 ETH · Crypto', 9, MUTED),
    text(355, 537, '$7,971', 11, TEXT, { anchor: 'end', fw: 600, font: MONO }),
    text(355, 551, '−$314', 9, RED, { anchor: 'end', font: MONO }),

    ...glowCard(20, 576, 350, 50, { rx: 12 }),
    circle(42, 601, 10, '#1A2240', { stroke: ACC2, sw: 1.2 }),
    text(42, 605, 'B', 9, ACC2, { anchor: 'middle', fw: 700 }),
    text(60, 595, 'BTC', 11, TEXT, { fw: 600 }),
    text(60, 609, '0.42 BTC · Crypto', 9, MUTED),
    text(355, 595, '$30,408', 11, TEXT, { anchor: 'end', fw: 600, font: MONO }),
    text(355, 609, '+$1,820', 9, ACC3, { anchor: 'end', font: MONO }),

    ...glowCard(20, 634, 350, 50, { rx: 12 }),
    circle(42, 659, 10, '#1A2240', { stroke: ACC3, sw: 1.2 }),
    text(42, 663, '$', 9, ACC3, { anchor: 'middle', fw: 700 }),
    text(60, 653, 'HYSA', 11, TEXT, { fw: 600 }),
    text(60, 667, 'High Yield Savings · Cash', 9, MUTED),
    text(355, 653, '$25,200', 11, TEXT, { anchor: 'end', fw: 600, font: MONO }),
    text(355, 667, '+$84', 9, ACC3, { anchor: 'end', font: MONO }),

    // rebalance cta
    rect(20, 696, 350, 36, ACC, { rx: 10, opacity: 0.15 }),
    rect(20, 696, 350, 36, 'none', { rx: 10, stroke: ACC, sw: 0.7 }),
    text(195, 719, 'Rebalance Constellation  →', 11, ACC, { anchor: 'middle', fw: 600 }),

    ...bottomNav('port'),
  ];
  return { name: 'Portfolio Constellation', elements: els };
}

// ════════════════════════════════════════════════════════
// SCREEN 3 — AI Insights
// ════════════════════════════════════════════════════════
function screen3() {
  const els = [
    rect(0, 0, 390, 844, BG),
    ...starField(20),
    ...statusBar(),

    text(195, 48, 'INSIGHTS', 12, TEXT, { anchor: 'middle', fw: 600, ls: 2 }),
    text(195, 62, 'KODA AI · updated 2m ago', 8, MUTED, { anchor: 'middle', ls: 1, font: MONO }),

    // insight score
    rect(20, 76, 350, 80, '#0C1826', { rx: 16, stroke: ACC, sw: 0.8 }),
    rect(21, 77, 348, 3, ACC, { rx: 1, opacity: 0.6 }),
    text(35, 104, 'PORTFOLIO HEALTH SCORE', 9, MUTED, { ls: 2, font: MONO }),
    text(35, 132, '84', 40, ACC, { fw: 800, font: MONO }),
    text(88, 132, '/ 100', 14, MUTED, { opacity: 0.8 }),
    text(355, 110, 'Good', 11, ACC3, { anchor: 'end', fw: 600 }),
    ...sparkline(240, 108, 100, 30,
      [72, 76, 74, 79, 81, 78, 83, 84], ACC),

    // insight cards
    text(20, 175, 'SIGNALS', 9, MUTED, { ls: 2.5, font: MONO }),

    ...glowCard(20, 190, 350, 78, { rx: 14 }),
    rect(20, 190, 4, 78, ACC2, { rx: 2 }),
    text(35, 210, '⚡', 13, ACC2, { font: 'system-ui' }),
    text(56, 210, 'Crypto Overweight', 12, TEXT, { fw: 600 }),
    rect(300, 200, 50, 17, ACC2, { rx: 8, opacity: 0.2 }),
    text(325, 212, 'ACTION', 8, ACC2, { anchor: 'middle', ls: 1 }),
    text(35, 228, 'Your ETH+BTC allocation is 19.3% vs target\n15.0%. Consider trimming $10K into HYSA.', 10, MUTED, { opacity: 0.9 }),
    text(35, 252, 'Impact: Risk ↓ · Yield ↑ 0.4%', 9, ACC, { font: MONO }),

    ...glowCard(20, 276, 350, 78, { rx: 14 }),
    rect(20, 276, 4, 78, ACC3, { rx: 2 }),
    text(35, 296, '↑', 14, ACC3, { fw: 700 }),
    text(56, 296, 'Tech Rally Exposure', 12, TEXT, { fw: 600 }),
    rect(300, 286, 50, 17, ACC3, { rx: 8, opacity: 0.2 }),
    text(325, 298, 'INSIGHT', 8, ACC3, { anchor: 'middle', ls: 1 }),
    text(35, 314, 'Semiconductors up 11% this month. NVDA\nposition has grown +$892 (+7.2%).', 10, MUTED, { opacity: 0.9 }),
    text(35, 338, 'Unrealized gain: +$1,266 total tech', 9, ACC3, { font: MONO }),

    ...glowCard(20, 362, 350, 78, { rx: 14 }),
    rect(20, 362, 4, 78, ACC, { rx: 2 }),
    text(35, 382, '◉', 12, ACC, { font: 'system-ui' }),
    text(56, 382, 'Savings Rate On Track', 12, TEXT, { fw: 600 }),
    rect(290, 372, 60, 17, ACC, { rx: 8, opacity: 0.15 }),
    text(320, 384, 'ON TRACK', 8, ACC, { anchor: 'middle', ls: 1 }),
    text(35, 400, 'Monthly contribution of $1,500 is on schedule.\nYou\'re 8 months ahead of your 5yr goal.', 10, MUTED, { opacity: 0.9 }),
    text(35, 424, 'Projected surplus: +$14K by Dec 2026', 9, ACC, { font: MONO }),

    ...glowCard(20, 448, 350, 78, { rx: 14 }),
    rect(20, 448, 4, 78, RED, { rx: 2 }),
    text(35, 468, '▼', 12, RED, { fw: 700 }),
    text(56, 468, 'ETH Drawdown Alert', 12, TEXT, { fw: 600 }),
    rect(300, 458, 50, 17, RED, { rx: 8, opacity: 0.2 }),
    text(325, 470, 'MONITOR', 8, RED, { anchor: 'middle', ls: 1 }),
    text(35, 486, 'ETH down 3.8% today, 11% this week.\nStop-loss threshold at $2,600 approaching.', 10, MUTED, { opacity: 0.9 }),
    text(35, 510, 'Alert triggers at: $2,600 (current: $2,847)', 9, RED, { font: MONO }),

    // market pulse strip
    text(20, 546, 'MARKET PULSE', 9, MUTED, { ls: 2.5, font: MONO }),
    ...glowCard(20, 560, 350, 40, { rx: 10 }),
    text(35, 576, 'S&P', 9, MUTED, { font: MONO }),
    text(75, 576, '+0.83%', 9, ACC3, { font: MONO }),
    text(125, 576, 'NASDAQ', 9, MUTED, { font: MONO }),
    text(180, 576, '+1.24%', 9, ACC3, { font: MONO }),
    text(235, 576, 'CRYPTO', 9, MUTED, { font: MONO }),
    text(285, 576, '−1.10%', 9, RED, { font: MONO }),
    text(340, 576, 'VIX', 9, MUTED, { font: MONO }),
    text(358, 576, '18.4', 9, TEXT, { font: MONO }),

    text(35, 592, 'BTC', 9, MUTED, { font: MONO }),
    text(62, 592, '$72,400', 9, TEXT, { font: MONO }),
    text(140, 592, 'ETH', 9, MUTED, { font: MONO }),
    text(167, 592, '$2,847', 9, TEXT, { font: MONO }),
    text(235, 592, 'GOLD', 9, MUTED, { font: MONO }),
    text(265, 592, '$2,380', 9, TEXT, { font: MONO }),
    text(328, 592, '10Y', 9, MUTED, { font: MONO }),
    text(350, 592, '4.35%', 9, TEXT, { font: MONO }),

    // ask KODA
    rect(20, 618, 350, 40, CARD, { rx: 12, stroke: BORDER, sw: 0.6 }),
    text(40, 643, '✦ Ask KODA anything...', 11, MUTED),
    text(355, 643, '⏎', 13, ACC, { anchor: 'end', font: 'system-ui' }),

    ...bottomNav('insight'),
  ];
  return { name: 'AI Insights', elements: els };
}

// ════════════════════════════════════════════════════════
// SCREEN 4 — Transaction History
// ════════════════════════════════════════════════════════
function screen4() {
  const txns = [
    { icon: '◎', col: ACC,  cat: 'Investment', title: 'NVDA Buy', amt: '+14 shares', val: '−$1,852', sub: 'Today, 9:34 AM · Fidelity', badge: 'INVEST' },
    { icon: '⬆', col: RED,  cat: 'Transfer',   title: 'Robinhood Transfer', amt: '$5,000', val: '−$5,000', sub: 'Apr 12, 3:12 PM · Transfer', badge: 'MOVE' },
    { icon: '↓', col: ACC3, cat: 'Deposit',     title: 'Salary Deposit', amt: '$4,320', val: '+$4,320', sub: 'Apr 10, 12:00 AM · Chase', badge: 'INCOME' },
    { icon: '☕', col: MUTED,cat: 'Food',        title: 'Blue Bottle Coffee', amt: '$6.50', val: '−$6.50', sub: 'Apr 9, 8:22 AM · Debit', badge: 'FOOD' },
    { icon: '◈', col: ACC2, cat: 'Subscription',title: 'Notion Pro', amt: '$16/mo', val: '−$16.00', sub: 'Apr 8, 12:00 AM · Card', badge: 'SUB' },
    { icon: '⬡', col: ACC,  cat: 'Investment', title: 'ETH Purchase', amt: '0.5 ETH', val: '−$1,423', sub: 'Apr 7, 5:47 PM · Coinbase', badge: 'INVEST' },
    { icon: '🛒', col: MUTED,cat: 'Shopping',   title: 'Amazon', amt: 'Order #X84', val: '−$94.20', sub: 'Apr 6, 2:13 PM · Card', badge: 'SHOP' },
  ];

  const els = [
    rect(0, 0, 390, 844, BG),
    ...starField(15),
    ...statusBar(),

    text(195, 48, 'HISTORY', 12, TEXT, { anchor: 'middle', fw: 600, ls: 2 }),
    text(195, 62, 'All accounts · 30 days', 8, MUTED, { anchor: 'middle', ls: 1, font: MONO }),

    // filter chips
    rect(20, 74, 60, 22, ACC, { rx: 11 }),
    text(50, 89, 'All', 9, BG, { anchor: 'middle', fw: 600 }),
    rect(86, 74, 70, 22, CARD, { rx: 11, stroke: BORDER, sw: 0.6 }),
    text(121, 89, 'Invest', 9, MUTED, { anchor: 'middle' }),
    rect(162, 74, 60, 22, CARD, { rx: 11, stroke: BORDER, sw: 0.6 }),
    text(192, 89, 'Income', 9, MUTED, { anchor: 'middle' }),
    rect(228, 74, 60, 22, CARD, { rx: 11, stroke: BORDER, sw: 0.6 }),
    text(258, 89, 'Spend', 9, MUTED, { anchor: 'middle' }),

    // monthly summary strip
    ...glowCard(20, 104, 350, 44, { rx: 10 }),
    text(35, 122, 'APR 2026', 8, MUTED, { font: MONO, ls: 1.5 }),
    text(35, 135, 'In: +$4,320', 9, ACC3, { font: MONO }),
    text(145, 135, '  Out: −$8,391', 9, RED, { font: MONO }),
    text(355, 135, 'Net: −$4,071', 10, TEXT, { anchor: 'end', fw: 600, font: MONO }),

    // section label
    text(20, 164, 'TODAY', 9, MUTED, { ls: 2.5, font: MONO }),
  ];

  let y = 178;
  txns.forEach((t, i) => {
    if (i === 1) { els.push(text(20, y + 4, 'EARLIER', 9, MUTED, { ls: 2.5, font: MONO })); y += 18; }
    els.push(...glowCard(20, y, 350, 56, { rx: 12 }));
    // icon bubble
    els.push(circle(44, y + 28, 14, CARD2, { stroke: t.col, sw: 0.8 }));
    els.push(text(44, y + 32, t.icon, 11, t.col, { anchor: 'middle', font: 'system-ui' }));
    // content
    els.push(text(64, y + 20, t.title, 11, TEXT, { fw: 600 }));
    els.push(text(64, y + 34, t.sub, 9, MUTED));
    // badge
    const bx = 355 - (t.badge.length * 5.5 + 14);
    els.push(rect(bx, y + 8, t.badge.length * 5.5 + 14, 15, t.col, { rx: 7, opacity: 0.18 }));
    els.push(text(bx + (t.badge.length * 5.5 + 14) / 2, y + 19, t.badge, 7, t.col, { anchor: 'middle', ls: 0.5, font: MONO }));
    // value
    const isPos = t.val.startsWith('+');
    els.push(text(355, y + 38, t.val, 11, isPos ? ACC3 : TEXT, { anchor: 'end', fw: 600, font: MONO }));
    y += 62;
  });

  els.push(
    text(195, y + 14, 'Load more  ↓', 10, MUTED, { anchor: 'middle' }),
    ...bottomNav('txn'),
  );
  return { name: 'Transaction History', elements: els };
}

// ════════════════════════════════════════════════════════
// SCREEN 5 — Goals
// ════════════════════════════════════════════════════════
function screen5() {
  const els = [
    rect(0, 0, 390, 844, BG),
    ...starField(20),
    ...statusBar(),

    text(195, 48, 'GOALS', 12, TEXT, { anchor: 'middle', fw: 600, ls: 2 }),
    text(195, 62, '3 active · 1 achieved', 8, MUTED, { anchor: 'middle', ls: 1, font: MONO }),

    // headline goal card
    rect(20, 76, 350, 120, '#0A1628', { rx: 18, stroke: ACC, sw: 0.8 }),
    rect(21, 77, 348, 3, ACC, { rx: 1, opacity: 0.5 }),
    text(35, 102, 'FIRE TARGET', 9, MUTED, { ls: 2.5, font: MONO }),
    text(35, 128, '$1,000,000', 32, TEXT, { fw: 700 }),
    text(35, 148, 'Financial independence by age 42', 10, MUTED),
    // progress bar
    rect(35, 160, 280, 6, CARD2, { rx: 3 }),
    rect(35, 160, 280 * 0.2483, 6, ACC, { rx: 3 }),
    text(330, 165, '24.8%', 9, ACC, { font: MONO, fw: 600 }),
    text(35, 184, '8 years 4 months remaining at current rate', 9, MUTED, { font: MONO }),

    // goal cards
    text(20, 218, 'MILESTONES', 9, MUTED, { ls: 2.5, font: MONO }),

    ...glowCard(20, 232, 350, 100, { rx: 14 }),
    ...progressArc(54, 282, 32, 68, ACC2),
    text(54, 286, '68%', 9, ACC2, { anchor: 'middle', fw: 700, font: MONO }),
    text(100, 258, 'Emergency Fund', 12, TEXT, { fw: 600 }),
    text(100, 274, '$20,000 goal · $13,600 saved', 9, MUTED),
    text(100, 292, 'At rate: Done in 4.3 months', 9, ACC3, { font: MONO }),
    rect(270, 252, 80, 18, ACC2, { rx: 9, opacity: 0.18 }),
    text(310, 265, 'IN PROGRESS', 8, ACC2, { anchor: 'middle', ls: 0.5 }),
    rect(100, 304, 230, 4, CARD2, { rx: 2 }),
    rect(100, 304, 230 * 0.68, 4, ACC2, { rx: 2 }),

    ...glowCard(20, 340, 350, 100, { rx: 14 }),
    ...progressArc(54, 390, 32, 88, ACC3),
    text(54, 394, '88%', 9, ACC3, { anchor: 'middle', fw: 700, font: MONO }),
    text(100, 366, 'Europe Trip Fund', 12, TEXT, { fw: 600 }),
    text(100, 382, '$8,000 goal · $7,040 saved', 9, MUTED),
    text(100, 400, 'At rate: Done in 6 weeks', 9, ACC3, { font: MONO }),
    rect(270, 360, 70, 18, ACC3, { rx: 9, opacity: 0.18 }),
    text(305, 373, 'ALMOST!', 8, ACC3, { anchor: 'middle', ls: 0.5 }),
    rect(100, 412, 230, 4, CARD2, { rx: 2 }),
    rect(100, 412, 230 * 0.88, 4, ACC3, { rx: 2 }),

    ...glowCard(20, 448, 350, 100, { rx: 14 }),
    ...progressArc(54, 498, 32, 32, ACC),
    text(54, 502, '32%', 9, ACC, { anchor: 'middle', fw: 700, font: MONO }),
    text(100, 474, 'House Down Payment', 12, TEXT, { fw: 600 }),
    text(100, 490, '$80,000 goal · $25,600 saved', 9, MUTED),
    text(100, 508, 'At rate: Done in 3 years 8 months', 9, MUTED, { font: MONO }),
    rect(265, 468, 85, 18, MUTED, { rx: 9, opacity: 0.15 }),
    text(307, 481, 'ON TRACK', 8, MUTED, { anchor: 'middle', ls: 0.5 }),
    rect(100, 520, 230, 4, CARD2, { rx: 2 }),
    rect(100, 520, 230 * 0.32, 4, ACC, { rx: 2 }),

    // achieved
    text(20, 564, 'ACHIEVED', 9, MUTED, { ls: 2.5, font: MONO }),

    ...glowCard(20, 578, 350, 56, { rx: 14 }),
    rect(20, 578, 350, 56, ACC3, { rx: 14, opacity: 0.07 }),
    text(36, 600, '✓', 16, ACC3, { fw: 700 }),
    text(56, 600, 'Paid off student loans', 12, TEXT, { fw: 600 }),
    text(56, 616, '$22,400 cleared · Mar 2026', 9, ACC3, { font: MONO }),
    text(355, 600, '🎯', 14, { anchor: 'end', font: 'system-ui' }),

    // add goal button
    rect(20, 648, 350, 40, 'none', { rx: 12, stroke: BORDER, sw: 0.8 }),
    text(195, 673, '+ Add New Goal', 11, MUTED, { anchor: 'middle' }),

    ...bottomNav('goals'),
  ];
  return { name: 'Goals', elements: els };
}

// ════════════════════════════════════════════════════════
// SCREEN 6 — Profile & Settings
// ════════════════════════════════════════════════════════
function screen6() {
  const els = [
    rect(0, 0, 390, 844, BG),
    ...starField(12),
    ...statusBar(),

    // avatar + name
    circle(195, 90, 38, CARD2, { stroke: ACC, sw: 1.5 }),
    text(195, 96, 'AK', 20, ACC, { anchor: 'middle', fw: 700, font: MONO }),
    // constellation ring around avatar
    ...progressArc(195, 90, 50, 84, ACC2),
    text(195, 146, 'Alex Kim', 16, TEXT, { anchor: 'middle', fw: 600 }),
    text(195, 162, 'alex@koda.app', 10, MUTED, { anchor: 'middle', font: MONO }),

    // tier badge
    rect(155, 172, 80, 20, ACC, { rx: 10, opacity: 0.2 }),
    rect(155, 172, 80, 20, 'none', { rx: 10, stroke: ACC, sw: 0.6 }),
    text(195, 186, '✦ CONSTELLATION', 8, ACC, { anchor: 'middle', ls: 1, font: MONO }),

    // stats row
    text(60, 222, '$247,830', 14, TEXT, { anchor: 'middle', fw: 700 }),
    text(60, 237, 'Net Worth', 9, MUTED, { anchor: 'middle' }),
    line(110, 215, 110, 245, BORDER, { sw: 0.5 }),
    text(195, 222, '+24.8%', 14, ACC3, { anchor: 'middle', fw: 700 }),
    text(195, 237, 'YTD Return', 9, MUTED, { anchor: 'middle' }),
    line(280, 215, 280, 245, BORDER, { sw: 0.5 }),
    text(330, 222, '84', 14, ACC, { anchor: 'middle', fw: 700 }),
    text(330, 237, 'Health Score', 9, MUTED, { anchor: 'middle' }),

    line(20, 250, 370, 250, BORDER, { sw: 0.5 }),

    // settings sections
    text(20, 270, 'ACCOUNTS', 9, MUTED, { ls: 2.5, font: MONO }),

    ...glowCard(20, 284, 350, 46, { rx: 12 }),
    text(36, 305, '🏦', 14, { font: 'system-ui' }),
    text(58, 305, 'Linked Accounts', 11, TEXT, { fw: 500 }),
    text(58, 320, '4 connected · Fidelity, Chase, Coinbase…', 9, MUTED),
    text(355, 313, '›', 16, MUTED, { anchor: 'end' }),

    ...glowCard(20, 338, 350, 46, { rx: 12 }),
    text(36, 359, '🔔', 14, { font: 'system-ui' }),
    text(58, 359, 'Alerts & Notifications', 11, TEXT, { fw: 500 }),
    text(58, 374, '12 active alerts · Threshold & AI signals', 9, MUTED),
    text(355, 367, '›', 16, MUTED, { anchor: 'end' }),

    text(20, 400, 'PREFERENCES', 9, MUTED, { ls: 2.5, font: MONO }),

    ...glowCard(20, 414, 350, 46, { rx: 12 }),
    text(36, 435, '✦', 14, ACC2, { font: 'system-ui' }),
    text(58, 435, 'Constellation Theme', 11, TEXT, { fw: 500 }),
    text(58, 450, 'Deep Space Dark · active', 9, MUTED),
    // toggle
    rect(310, 428, 36, 18, ACC, { rx: 9, opacity: 0.3 }),
    circle(337, 437, 7, ACC),

    ...glowCard(20, 468, 350, 46, { rx: 12 }),
    text(36, 489, '◎', 14, ACC, { font: 'system-ui' }),
    text(58, 489, 'AI Insight Frequency', 11, TEXT, { fw: 500 }),
    text(58, 504, 'Real-time · Refresh every 30 min', 9, MUTED),
    text(355, 497, '›', 16, MUTED, { anchor: 'end' }),

    ...glowCard(20, 522, 350, 46, { rx: 12 }),
    text(36, 543, '🔐', 14, { font: 'system-ui' }),
    text(58, 543, 'Security & Privacy', 11, TEXT, { fw: 500 }),
    text(58, 558, 'Biometric · 256-bit AES encrypted', 9, MUTED),
    text(355, 551, '›', 16, MUTED, { anchor: 'end' }),

    text(20, 584, 'PLAN', 9, MUTED, { ls: 2.5, font: MONO }),

    rect(20, 598, 350, 60, '#0D1F3C', { rx: 14, stroke: ACC2, sw: 0.7 }),
    text(35, 620, '✦ Constellation Pro', 12, ACC2, { fw: 700 }),
    text(35, 636, 'Unlimited AI insights · Priority signals · Sync all brokers', 9, MUTED),
    text(35, 651, 'Renews May 14, 2026 · $12/mo', 9, ACC2, { font: MONO }),
    text(355, 625, 'Manage', 9, ACC, { anchor: 'end' }),

    // version
    text(195, 680, 'KODA v3.2.1 · Built with constellation intelligence', 8, MUTED, { anchor: 'middle', font: MONO, opacity: 0.5 }),

    ...bottomNav('home'),
  ];
  return { name: 'Profile & Settings', elements: els };
}

// ── Assemble ─────────────────────────────────────────────
const screens = [screen1(), screen2(), screen3(), screen4(), screen5(), screen6()];
const totalElements = screens.reduce((sum, s) => sum + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'KODA — Wealth Constellation',
    author: 'RAM',
    date: DATE,
    theme: 'dark',
    heartbeat: 501,
    slug: SLUG,
    elements: totalElements,
    palette: { BG, SURF, CARD, ACC, ACC2, text: TEXT },
    inspiration: [
      'Superpower.com (Godly) — concept-driven interface metaphors',
      'QASE starfield-glow pattern (Dark Mode Design)',
      'KidSuper World monospace-as-luxury-identity (Awwwards)',
    ],
  },
  screens: screens.map(s => ({
    name: s.name,
    svg: { width: 390, height: 844 },
    elements: s.elements,
  })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`KODA: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
