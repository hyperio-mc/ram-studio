'use strict';
// vestry-app.js
// VESTRY — Institutional AI Agent Investment Tracker
//
// Challenge: Design a dark institutional finance dashboard for tracking AI agent
// investment strategies — merging the earthy editorial palette of Old Tom Capital
// (oldtomcapital.com, Feb 2026 on minimal.gallery) with the macOS terminal window
// chrome aesthetic of Superset.sh (godly.website / darkmodedesign.com, March 2026).
//
// Old Tom Capital: warm olive-black (#1A1A14, #26251C), Messina Sans + Geist Mono,
//   bold editorial headings, coral (#F34E30) + lime (#28E044) accents — for an
//   institutional golf investment platform, unexpectedly emotional and bold.
// Superset.sh: terminal window chrome (red/yellow/green macOS dots), IBM Plex Mono,
//   near-black with code aesthetic for an AI parallel agent orchestrator.
//
// Palette: olive-black #1A1A14 + coral #F34E30 + lime #28E044 + warm white #EDECE7
// Typography push: Geist Mono for all data, large editorial sans-serif for display
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#1A1A14',   // warm olive-black (Old Tom Capital)
  surface:  '#26251C',   // elevated warm surface
  surface2: '#2F2E23',   // card surface
  surface3: '#393830',   // lighter surface
  border:   '#3E3D31',   // warm border
  muted:    '#726A4F',   // warm muted text
  fg:       '#EDECE7',   // warm near-white
  coral:    '#F34E30',   // coral red (Old Tom Capital accent)
  lime:     '#28E044',   // electric lime (positive/live)
  amber:    '#C9A252',   // muted gold (pending/moderate)
  coral2:   '#FF8A6D',   // soft coral (secondary highlight)
  dim:      '#201F18',   // dimmed surface
  terminal: '#0F0F0A',   // deep terminal black
};

let _id = 0;
const uid = () => `vt${++_id}`;

// ── Primitives ────────────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill || P.bg,
  clip: opts.clip !== undefined ? opts.clip : false,
  ...(opts.r !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: [],
});

const T = (x, y, txt, size, color, opts = {}) => ({
  id: uid(), type: 'text', x, y,
  width:  opts.w  !== undefined ? opts.w  : 300,
  height: opts.h  !== undefined ? opts.h  : size * 1.3,
  text: txt, fontSize: size,
  fill: color || P.fg,
  fontWeight: opts.bold ? 700 : opts.black ? 900 : opts.medium ? 500 : 400,
  ...(opts.mono ? { fontFamily: 'monospace' } : {}),
  ...(opts.align ? { textAlign: opts.align } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh !== undefined ? { lineHeight: opts.lh } : {}),
});

const add = (parent, ...children) => {
  parent.children.push(...children);
  return parent;
};

const circle = (x, y, r, fill, opts = {}) => ({
  id: uid(), type: 'frame', x: x - r, y: y - r, width: r * 2, height: r * 2,
  fill, cornerRadius: r,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: [],
});

const line = (x, y, w, h, fill, opts = {}) => F(x, y, w, h, fill, { ...opts, r: opts.r !== undefined ? opts.r : 0 });

// ── Sparkline builder ─────────────────────────────────────────────────────────
function makeSparkPath(data, x, y, w, h) {
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const px = x + (i / (data.length - 1)) * w;
    const py = y + h - ((v - min) / range) * h;
    return `${px.toFixed(1)},${py.toFixed(1)}`;
  });
  return pts.join(' ');
}

// ── macOS Window Chrome ───────────────────────────────────────────────────────
function windowChrome(parent, x, y, w, title) {
  // Chrome bar
  const bar = F(x, y, w, 28, P.terminal, { r: 0 });
  add(bar,
    circle(x + 12, y + 14, 5, '#FF5F57'),   // red
    circle(x + 28, y + 14, 5, '#FEBC2E'),   // yellow
    circle(x + 44, y + 14, 5, '#28C840'),   // green
    T(x + 60, y + 8, title, 9, P.muted, { mono: true, w: w - 80, ls: 0.5 })
  );
  add(parent, bar);
  return bar;
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function statusPill(x, y, label, color, parent) {
  const pill = F(x, y, 52, 18, color + '22', { r: 4 });
  add(pill, T(x + 6, y + 4, label, 8, color, { bold: true, ls: 0.8, w: 40 }));
  add(parent, pill);
  return pill;
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function progressBar(x, y, w, pct, bg, fill, parent) {
  const track = F(x, y, w, 4, bg, { r: 2 });
  const bar = F(x, y, Math.max(4, w * pct), 4, fill, { r: 2 });
  add(parent, track, bar);
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1: DASHBOARD — Portfolio Overview (macOS terminal chrome)
// ══════════════════════════════════════════════════════════════════════════════
function screen1() {
  const W = 390, H = 844;
  const s = F(0, 0, W, H, P.bg);
  s.clip = true;

  // Status bar
  add(s,
    T(16, 14, '9:41', 14, P.fg, { bold: true, w: 60 }),
    T(340, 14, '●●●', 10, P.fg, { opacity: 0.5, w: 40 })
  );

  // Window chrome terminal header
  const termBar = F(0, 40, W, 36, P.terminal);
  add(termBar,
    circle(14, 58, 5, '#FF5F57'),
    circle(30, 58, 5, '#FEBC2E'),
    circle(46, 58, 5, '#28C840'),
    T(64, 50, 'vestry — portfolio@main', 9, P.muted, { mono: true, w: 280, ls: 0.3 }),
    T(354, 50, '●', 9, P.lime, { w: 20 })
  );
  add(s, termBar);

  // Header
  const header = F(0, 76, W, 68, P.surface);
  add(header,
    T(20, 84, 'VESTRY', 10, P.coral, { bold: true, ls: 3 }),
    T(20, 100, 'Portfolio Overview', 20, P.fg, { bold: true, w: 280 }),
    T(20, 126, 'Mar 21, 2026  ·  5 agents live', 11, P.muted, { mono: true, w: 250 })
  );
  add(s, header);

  // NAV tabs
  const tabs = ['Overview', 'Agents', 'Trades', 'Risk'];
  tabs.forEach((tab, i) => {
    const active = i === 0;
    const tabEl = F(i * 97 + 4, 145, 92, 28, active ? P.surface3 : 'transparent', { r: 5 });
    add(tabEl, T(i * 97 + 20, 152, tab, 11, active ? P.coral : P.muted, { medium: !active, bold: active, w: 70 }));
    add(s, tabEl);
  });

  // Separator
  add(s, line(0, 174, W, 1, P.border));

  // Portfolio value card — editorial big number
  const valueCard = F(16, 182, W - 32, 88, P.surface, { r: 8, stroke: P.border });
  add(valueCard,
    T(24, 194, 'TOTAL AUM', 9, P.muted, { ls: 2, mono: true, w: 160 }),
    T(24, 208, '$4,812,390', 34, P.fg, { black: true, w: 240, lh: 1.1 }),
    T(24, 248, '+$47,210 (0.99%) today', 12, P.lime, { bold: true, w: 220 }),
    // Sparkline area
    T(270, 194, '30D', 9, P.muted, { ls: 1, mono: true, w: 60 }),
  );
  // Draw sparkline inline
  const sparkData = [82,78,84,79,86,83,89,88,91,87,93,90,95,92,97,96,100,98,103,101,106,104,108,107,112,109,115,113,118,120];
  const sparkEl = {
    id: uid(), type: 'frame', x: 258, y: 208, width: 100, height: 40,
    fill: 'transparent', clip: true, children: [{
      id: uid(), type: 'text', x: 258, y: 208, width: 100, height: 40,
      text: '', fontSize: 1, fill: 'transparent',
      _svgPath: makeSparkPath(sparkData, 258, 208, 100, 38),
      _svgColor: P.lime
    }]
  };
  add(valueCard, sparkEl);
  add(s, valueCard);

  // Agent performance cards — 2 column
  const agents = [
    { name: 'ORION', strategy: 'Momentum Long', pnl: '+$18,440', pct: '+2.1%', status: 'LIVE', color: P.lime, alloc: 0.35 },
    { name: 'SIGMA', strategy: 'Mean Reversion', pnl: '+$9,230', pct: '+1.4%', status: 'LIVE', color: P.lime, alloc: 0.22 },
    { name: 'ATLAS', strategy: 'Market Making', pnl: '+$6,100', pct: '+0.8%', status: 'LIVE', color: P.lime, alloc: 0.18 },
    { name: 'VEGA', strategy: 'Volatility Arb', pnl: '-$1,850', pct: '-0.4%', status: 'PAUSE', color: P.amber, alloc: 0.15 },
  ];
  agents.forEach((a, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const cx = col === 0 ? 16 : 203, cy = 282 + row * 88;
    const card = F(cx, cy, 174, 80, P.surface, { r: 7, stroke: P.border });
    add(card,
      // Status dot
      circle(cx + 16, cy + 16, 4, a.color),
      T(cx + 26, cy + 10, a.name, 11, P.fg, { bold: true, mono: true, ls: 1, w: 100 }),
      T(cx + 12, cy + 26, a.strategy, 9, P.muted, { w: 155 }),
      T(cx + 12, cy + 44, a.pnl, 14, a.pnl.startsWith('+') ? P.lime : P.coral, { bold: true, mono: true, w: 100 }),
      T(cx + 12, cy + 62, a.pct + ' today', 9, P.muted, { mono: true, w: 100 }),
    );
    // Alloc bar
    progressBar(cx + 12, cy + 72, 150, a.alloc, P.border, a.color + '88', card);
    add(s, card);
  });

  // System metrics strip
  const metrics = F(16, 464, W - 32, 48, P.surface2, { r: 6, stroke: P.border });
  const metData = [
    { label: 'WIN RATE', val: '68.4%' },
    { label: 'SHARPE', val: '2.31' },
    { label: 'MAX DD', val: '-3.2%' },
    { label: 'TRADES', val: '847' },
  ];
  metData.forEach((m, i) => {
    const mx = 28 + i * 88;
    add(metrics,
      T(mx, 474, m.label, 8, P.muted, { ls: 1.5, mono: true, w: 80 }),
      T(mx, 487, m.val, 13, P.fg, { bold: true, mono: true, w: 80 })
    );
  });
  add(s, metrics);

  // Recent activity feed
  add(s, T(16, 524, 'LIVE FEED', 9, P.muted, { ls: 2, mono: true, w: 200 }));
  add(s, line(16, 538, W - 32, 1, P.border));

  const feed = [
    { time: '14:32:08', agent: 'ORION', action: 'BUY 200 SPY @ 521.40', dot: P.lime },
    { time: '14:31:55', agent: 'SIGMA', action: 'CLOSE AAPL position +$840', dot: P.lime },
    { time: '14:30:12', agent: 'ATLAS', action: 'MM spread set 0.04bps', dot: P.lime },
    { time: '14:28:44', agent: 'VEGA', action: 'Paused — vol spike detected', dot: P.amber },
    { time: '14:25:03', agent: 'ORION', action: 'SELL 100 QQQ @ 441.20', dot: P.coral },
  ];
  feed.forEach((item, i) => {
    const fy = 545 + i * 52;
    add(s,
      circle(24, fy + 10, 4, item.dot),
      T(36, fy + 4, item.time, 9, P.muted, { mono: true, w: 80 }),
      T(120, fy + 4, item.agent, 9, P.coral, { bold: true, mono: true, ls: 1, w: 60 }),
      T(36, fy + 19, item.action, 11, P.fg, { w: 320, opacity: 0.85 }),
      line(16, fy + 38, W - 32, 1, P.border, { opacity: 0.4 })
    );
  });

  // Bottom nav
  const nav = F(0, H - 64, W, 64, P.terminal);
  const navItems = [
    { icon: '⬡', label: 'Home', active: true },
    { icon: '◈', label: 'Agents', active: false },
    { icon: '≡', label: 'Trades', active: false },
    { icon: '◎', label: 'Risk', active: false },
    { icon: '⊚', label: 'Settings', active: false },
  ];
  navItems.forEach((item, i) => {
    const nx = 20 + i * 70;
    add(nav,
      T(nx, H - 50, item.icon, 18, item.active ? P.coral : P.muted, { align: 'center', w: 32 }),
      T(nx - 8, H - 28, item.label, 8, item.active ? P.coral : P.muted, { align: 'center', w: 48, ls: 0.3 })
    );
  });
  add(s, nav);

  return s;
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2: AGENT ROSTER — Live Agent Status Board
// ══════════════════════════════════════════════════════════════════════════════
function screen2() {
  const W = 390, H = 844;
  const s = F(0, 0, W, H, P.bg);
  s.clip = true;

  add(s, T(16, 14, '9:41', 14, P.fg, { bold: true, w: 60 }));

  // Window chrome bar
  const chrome = F(0, 40, W, 32, P.terminal);
  add(chrome,
    circle(12, 56, 4, '#FF5F57'),
    circle(26, 56, 4, '#FEBC2E'),
    circle(40, 56, 4, '#28C840'),
    T(54, 49, 'vestry — agents --live', 9, P.muted, { mono: true, w: 280 })
  );
  add(s, chrome);

  // Back + title
  add(s,
    T(16, 82, '←', 16, P.muted, { w: 24 }),
    T(16, 88, 'AI AGENTS', 10, P.coral, { bold: true, ls: 3, w: 200 }),
    T(16, 102, 'Agent Roster', 22, P.fg, { bold: true, w: 280 }),
    T(16, 130, '5 agents registered · 4 live · 1 paused', 11, P.muted, { mono: true, w: 340 })
  );

  add(s, line(0, 150, W, 1, P.border));

  // Search bar
  const search = F(16, 158, W - 32, 34, P.surface2, { r: 6, stroke: P.border });
  add(search,
    T(30, 168, '⌕', 14, P.muted, { w: 20 }),
    T(50, 170, 'Search agents...', 12, P.muted, { w: 240 })
  );
  add(s, search);

  // Agent rows — detailed
  const agentRows = [
    { name: 'ORION', type: 'Momentum Long', model: 'claude-3-7', status: 'LIVE', color: P.lime,
      wr: '71%', pnl: '+$18,440', trades: 284, drawdown: '1.8%', alloc: '$1,684k', bar: 0.72 },
    { name: 'SIGMA', type: 'Mean Reversion', model: 'claude-3-7', status: 'LIVE', color: P.lime,
      wr: '65%', pnl: '+$9,230', trades: 198, drawdown: '2.1%', alloc: '$1,058k', bar: 0.65 },
    { name: 'ATLAS', type: 'Market Making', model: 'gpt-4o', status: 'LIVE', color: P.lime,
      wr: '82%', pnl: '+$6,100', trades: 1840, drawdown: '0.4%', alloc: '$865k', bar: 0.82 },
    { name: 'VEGA', type: 'Volatility Arb', model: 'claude-3-7', status: 'PAUSED', color: P.amber,
      wr: '58%', pnl: '-$1,850', trades: 76, drawdown: '4.2%', alloc: '$722k', bar: 0.58 },
    { name: 'HELIOS', type: 'Macro Trend', model: 'gemini-1.5', status: 'DEPLOY', color: P.coral,
      wr: '–', pnl: '–', trades: 0, drawdown: '–', alloc: '$483k', bar: 0 },
  ];
  agentRows.forEach((a, i) => {
    const cy = 202 + i * 120;
    const card = F(16, cy, W - 32, 112, P.surface, { r: 8, stroke: P.border });

    // Agent name + model
    add(card,
      circle(34, cy + 20, 6, a.color),
      T(50, cy + 12, a.name, 16, P.fg, { bold: true, mono: true, ls: 1, w: 120 }),
      T(50, cy + 32, a.type, 10, P.muted, { w: 160 }),
      // Model pill
      F(W - 100, cy + 14, 68, 18, P.surface3, { r: 4 }),
      T(W - 97, cy + 18, a.model, 8, P.amber, { mono: true, w: 64 }),
    );

    // Status badge
    const statW = a.status === 'DEPLOY' ? 62 : 52;
    const statBg = F(W - 80, cy + 36, statW, 18, a.color + '22', { r: 4 });
    add(statBg, T(W - 76, cy + 40, a.status, 8, a.color, { bold: true, mono: true, ls: 0.8, w: statW - 8 }));
    add(card, statBg);

    // Key metrics
    const cols = [
      { label: 'WIN RATE', val: a.wr },
      { label: 'P&L', val: a.pnl, color: a.pnl.startsWith('+') ? P.lime : a.pnl === '–' ? P.muted : P.coral },
      { label: 'TRADES', val: String(a.trades) },
    ];
    cols.forEach((col, ci) => {
      const mx = 28 + ci * 116;
      add(card,
        T(mx, cy + 60, col.label, 8, P.muted, { ls: 1.5, mono: true, w: 100 }),
        T(mx, cy + 73, col.val, 13, col.color || P.fg, { bold: true, mono: true, w: 100 })
      );
    });

    // Allocation bar
    add(card, T(28, cy + 96, `ALLOC ${a.alloc}`, 8, P.muted, { mono: true, w: 200 }));
    progressBar(28, cy + 106, W - 88, a.bar, P.border, a.color + '66', card);

    add(s, card);
  });

  // Bottom nav (same pattern)
  const nav = F(0, H - 64, W, 64, P.terminal);
  const navItems = [
    { icon: '⬡', label: 'Home', active: false },
    { icon: '◈', label: 'Agents', active: true },
    { icon: '≡', label: 'Trades', active: false },
    { icon: '◎', label: 'Risk', active: false },
    { icon: '⊚', label: 'Settings', active: false },
  ];
  navItems.forEach((item, i) => {
    const nx = 20 + i * 70;
    add(nav,
      T(nx, H - 50, item.icon, 18, item.active ? P.coral : P.muted, { align: 'center', w: 32 }),
      T(nx - 8, H - 28, item.label, 8, item.active ? P.coral : P.muted, { align: 'center', w: 48 })
    );
  });
  add(s, nav);

  return s;
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3: STRATEGY DETAIL — ORION Agent Deep Dive
// ══════════════════════════════════════════════════════════════════════════════
function screen3() {
  const W = 390, H = 844;
  const s = F(0, 0, W, H, P.bg);
  s.clip = true;

  add(s, T(16, 14, '9:41', 14, P.fg, { bold: true, w: 60 }));

  // Terminal chrome
  const chrome = F(0, 40, W, 32, P.terminal);
  add(chrome,
    circle(12, 56, 4, '#FF5F57'),
    circle(26, 56, 4, '#FEBC2E'),
    circle(40, 56, 4, '#28C840'),
    T(54, 49, 'vestry — orion --strategy', 9, P.muted, { mono: true, w: 280 })
  );
  add(s, chrome);

  // Agent hero — editorial large initial (Old Tom Capital influence)
  const heroCard = F(0, 72, W, 100, P.surface);
  add(heroCard,
    // Large editorial initial letter
    T(20, 74, 'O', 64, P.coral, { black: true, opacity: 0.12, w: 70, lh: 1 }),
    // Agent info overlay
    circle(24, 86, 6, P.lime),
    T(38, 78, 'ORION', 18, P.fg, { bold: true, mono: true, ls: 2, w: 200 }),
    T(38, 100, 'Momentum Long Strategy', 12, P.muted, { w: 220 }),
    T(38, 116, 'claude-3-7-sonnet · supervised', 10, P.muted, { mono: true, w: 260 }),
    // Live badge
    F(300, 80, 56, 20, P.lime + '22', { r: 4 }),
    T(308, 84, '● LIVE', 9, P.lime, { bold: true, mono: true, w: 48 }),
    T(300, 104, '+2.1% today', 10, P.lime, { bold: true, mono: true, w: 80 })
  );
  add(s, heroCard);

  // Metrics row
  const metricsStrip = F(0, 172, W, 52, P.surface2);
  const mets = [
    { label: 'WIN RATE', val: '71.4%', c: P.lime },
    { label: 'SHARPE', val: '2.84', c: P.fg },
    { label: 'MAX DD', val: '1.8%', c: P.amber },
    { label: 'TRADES', val: '284', c: P.fg },
  ];
  mets.forEach((m, i) => {
    const mx = 24 + i * 92;
    add(metricsStrip,
      T(mx, 180, m.label, 8, P.muted, { ls: 1.5, mono: true, w: 85 }),
      T(mx, 193, m.val, 14, m.c, { bold: true, mono: true, w: 85 })
    );
  });
  add(s, metricsStrip);
  add(s, line(0, 224, W, 1, P.border));

  // P&L chart area
  add(s, T(16, 232, 'P&L CURVE  ·  30 DAY', 9, P.muted, { ls: 2, mono: true, w: 250 }));
  add(s, T(310, 232, '+$18,440', 11, P.lime, { bold: true, mono: true, w: 70 }));

  const chartBg = F(16, 248, W - 32, 80, P.surface2, { r: 6 });
  // Chart bars (simulated)
  const barData = [40,55,48,62,58,70,65,72,68,78,74,80,76,84,80,88,84,92,88,94,90,96,92,97,93,100,96,99,95,102];
  barData.forEach((v, i) => {
    const bw = 8, bx = 20 + i * 11, bmax = 76;
    const bh = (v / 110) * bmax;
    const isUp = i === 0 || v >= barData[i - 1];
    add(chartBg, F(bx, 248 + bmax - bh + 4, bw, bh, isUp ? P.lime + 'AA' : P.coral + 'AA', { r: 1 }));
  });
  add(s, chartBg);

  // Strategy terminal panel (Superset.sh influence)
  add(s, T(16, 340, 'STRATEGY CONFIG', 9, P.muted, { ls: 2, mono: true, w: 250 }));
  const termPanel = F(16, 356, W - 32, 132, P.terminal, { r: 6, stroke: P.border });
  const codeLines = [
    { txt: '// ORION · Momentum Long v2.3', c: P.muted },
    { txt: 'strategy.lookback = 20  // bars', c: P.lime },
    { txt: 'strategy.threshold = 0.018', c: P.lime },
    { txt: 'strategy.sizing = "kelly_half"', c: P.amber },
    { txt: 'strategy.maxPos = 0.12  // 12% cap', c: P.lime },
    { txt: 'strategy.stopLoss = -0.025', c: P.coral },
    { txt: 'strategy.markets = ["SPY","QQQ","IWM"]', c: P.fg },
  ];
  codeLines.forEach((line_, i) => {
    add(termPanel,
      T(16, 360, String(i + 1).padStart(2, ' '), 9, P.muted, { mono: true, opacity: 0.4, w: 20 }),
      T(36, 360 + i * 17, line_.txt, 9, line_.c, { mono: true, w: W - 68 })
    );
  });
  add(s, termPanel);

  // Recent trades
  add(s, T(16, 500, 'RECENT TRADES', 9, P.muted, { ls: 2, mono: true, w: 250 }));
  add(s, line(16, 514, W - 32, 1, P.border));

  const trades = [
    { time: '14:32', sym: 'SPY', dir: 'BUY', qty: 200, price: '521.40', pnl: '+$840', c: P.lime },
    { time: '14:28', sym: 'QQQ', dir: 'SELL', qty: 100, price: '441.20', pnl: '+$620', c: P.lime },
    { time: '14:15', sym: 'IWM', dir: 'BUY', qty: 300, price: '208.30', pnl: '+$390', c: P.lime },
    { time: '13:52', sym: 'SPY', dir: 'SELL', qty: 150, price: '520.10', pnl: '-$210', c: P.coral },
    { time: '13:40', sym: 'QQQ', dir: 'BUY', qty: 80, price: '440.80', pnl: '+$490', c: P.lime },
  ];
  trades.forEach((t, i) => {
    const ty = 522 + i * 46;
    const dirColor = t.dir === 'BUY' ? P.lime : P.coral;
    add(s,
      T(16, ty + 4, t.time, 10, P.muted, { mono: true, w: 50 }),
      T(66, ty + 4, t.sym, 11, P.fg, { bold: true, mono: true, w: 50 }),
      F(116, ty + 2, 34, 16, dirColor + '22', { r: 3 }),
      T(120, ty + 5, t.dir, 9, dirColor, { bold: true, mono: true, w: 28 }),
      T(158, ty + 4, `${t.qty}x @ ${t.price}`, 10, P.muted, { mono: true, w: 130 }),
      T(300, ty + 4, t.pnl, 11, t.c, { bold: true, mono: true, w: 70, align: 'right' }),
      line(16, ty + 22, W - 32, 1, P.border, { opacity: 0.4 })
    );
  });

  // Bottom nav
  const nav = F(0, H - 64, W, 64, P.terminal);
  const navItems = ['⬡','◈','≡','◎','⊚'].map((icon, i) => ({ icon, label: ['Home','Agents','Trades','Risk','Settings'][i], active: i === 1 }));
  navItems.forEach((item, i) => {
    add(nav,
      T(20 + i * 70, H - 50, item.icon, 18, item.active ? P.coral : P.muted, { align: 'center', w: 32 }),
      T(12 + i * 70, H - 28, item.label, 8, item.active ? P.coral : P.muted, { align: 'center', w: 48 })
    );
  });
  add(s, nav);

  return s;
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4: TRADE LOG — Decision Feed with Reasoning
// ══════════════════════════════════════════════════════════════════════════════
function screen4() {
  const W = 390, H = 844;
  const s = F(0, 0, W, H, P.bg);
  s.clip = true;

  add(s, T(16, 14, '9:41', 14, P.fg, { bold: true, w: 60 }));

  const chrome = F(0, 40, W, 32, P.terminal);
  add(chrome,
    circle(12, 56, 4, '#FF5F57'),
    circle(26, 56, 4, '#FEBC2E'),
    circle(40, 56, 4, '#28C840'),
    T(54, 49, 'vestry — trade-log --all --live', 9, P.muted, { mono: true, w: 290 })
  );
  add(s, chrome);

  add(s,
    T(16, 82, 'TRADE LOG', 10, P.coral, { bold: true, ls: 3, w: 200 }),
    T(16, 96, 'Decision Feed', 22, P.fg, { bold: true, w: 280 }),
    T(16, 124, '847 decisions today · live updating', 11, P.muted, { mono: true, w: 300 })
  );

  // Filter chips
  const chips = ['All', 'BUY', 'SELL', 'CLOSE', 'PAUSE'];
  chips.forEach((chip, i) => {
    const active = i === 0;
    const cw = chip.length * 8 + 20;
    const cx = 16 + chips.slice(0, i).reduce((acc, c) => acc + c.length * 8 + 28, 0);
    const chipEl = F(cx, 146, cw, 24, active ? P.coral : P.surface2, { r: 12 });
    add(chipEl, T(cx + 10, 151, chip, 10, active ? P.bg : P.muted, { bold: active, w: cw - 20 }));
    add(s, chipEl);
  });
  add(s, line(0, 178, W, 1, P.border));

  // Trade log entries — with reasoning snippets
  const entries = [
    {
      time: '14:32:08', agent: 'ORION', type: 'BUY', sym: 'SPY',
      price: '521.40', qty: '200 shares', pnl: 'open',
      reasoning: 'RSI momentum cross above 55, volume confirmation +18% avg, trend intact above 20-EMA.',
      color: P.lime, status: 'OPEN',
    },
    {
      time: '14:31:55', agent: 'SIGMA', type: 'CLOSE', sym: 'AAPL',
      price: '186.20', qty: '150 shares', pnl: '+$840',
      reasoning: 'Mean reversion target hit at 2σ above 10-day. Booking 90% of theoretical gain.',
      color: P.lime, status: 'CLOSED',
    },
    {
      time: '14:28:44', agent: 'VEGA', type: 'PAUSE', sym: 'ALL',
      price: '–', qty: '–', pnl: '–',
      reasoning: 'VIX spike +18% detected. Safety pause triggered: volatility regime change protocol.',
      color: P.amber, status: 'PAUSED',
    },
    {
      time: '14:25:03', agent: 'ORION', type: 'SELL', sym: 'QQQ',
      price: '441.20', qty: '100 shares', pnl: '+$620',
      reasoning: 'Trailing stop triggered at 1.4% from peak. Locking gains as tech sector fades.',
      color: P.coral, status: 'CLOSED',
    },
    {
      time: '14:20:11', agent: 'ATLAS', type: 'BUY', sym: 'SPY',
      price: '520.95', qty: '500 shares', pnl: '+$225',
      reasoning: 'Market making: quoted both sides, filled on ask. Spread capture 0.04bps.',
      color: P.lime, status: 'CLOSED',
    },
  ];
  entries.forEach((e, i) => {
    const ey = 186 + i * 128;
    const card = F(16, ey, W - 32, 120, P.surface, { r: 7, stroke: e.color + '44', sw: 1 });

    // Header row
    const typeBg = F(28, ey + 10, 44, 18, e.color + '22', { r: 3 });
    add(typeBg, T(32, ey + 14, e.type, 9, e.color, { bold: true, mono: true, ls: 0.8, w: 36 }));
    add(card, typeBg,
      T(78, ey + 10, e.sym, 14, P.fg, { bold: true, mono: true, w: 70 }),
      T(160, ey + 12, e.agent, 9, P.coral, { bold: true, mono: true, ls: 1, w: 70 }),
      T(298, ey + 12, e.time, 9, P.muted, { mono: true, w: 80 })
    );

    // Price + qty + pnl
    add(card,
      T(28, ey + 34, e.price !== '–' ? `@ ${e.price}` : '–', 11, P.fg, { mono: true, w: 100 }),
      T(128, ey + 34, e.qty, 11, P.muted, { mono: true, w: 110 }),
      T(W - 80, ey + 34, e.pnl, 11, e.pnl.startsWith('+') ? P.lime : e.pnl === '–' ? P.muted : P.coral, { bold: true, mono: true, w: 60 })
    );

    // Reasoning snippet
    const reasonBg = F(28, ey + 54, W - 72, 52, P.surface2, { r: 5 });
    add(reasonBg,
      T(36, ey + 58, '⌥ REASONING', 8, P.muted, { ls: 1, mono: true, w: 200 }),
      T(36, ey + 70, e.reasoning, 9.5, P.fg, { w: W - 88, opacity: 0.7, lh: 1.5 })
    );
    add(card, reasonBg);

    add(s, card);
  });

  const nav = F(0, H - 64, W, 64, P.terminal);
  const navItems = ['⬡','◈','≡','◎','⊚'].map((icon, i) => ({ icon, label: ['Home','Agents','Trades','Risk','Settings'][i], active: i === 2 }));
  navItems.forEach((item, i) => {
    add(nav,
      T(20 + i * 70, H - 50, item.icon, 18, item.active ? P.coral : P.muted, { align: 'center', w: 32 }),
      T(12 + i * 70, H - 28, item.label, 8, item.active ? P.coral : P.muted, { align: 'center', w: 48 })
    );
  });
  add(s, nav);

  return s;
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 5: RISK MONITOR — Exposure & Alert Dashboard
// ══════════════════════════════════════════════════════════════════════════════
function screen5() {
  const W = 390, H = 844;
  const s = F(0, 0, W, H, P.bg);
  s.clip = true;

  add(s, T(16, 14, '9:41', 14, P.fg, { bold: true, w: 60 }));
  // Risk alert badge in status bar
  F(290, 10, 80, 22, P.coral + '22', { r: 4 });
  add(s,
    F(288, 10, 82, 22, P.coral + '22', { r: 4 }),
    T(295, 15, '⚠ 1 ALERT', 9, P.coral, { bold: true, mono: true, w: 72 })
  );

  const chrome = F(0, 40, W, 32, P.terminal);
  add(chrome,
    circle(12, 56, 4, '#FF5F57'),
    circle(26, 56, 4, '#FEBC2E'),
    circle(40, 56, 4, '#28C840'),
    T(54, 49, 'vestry — risk --monitor --live', 9, P.muted, { mono: true, w: 290 })
  );
  add(s, chrome);

  add(s,
    T(16, 82, 'RISK MONITOR', 10, P.coral, { bold: true, ls: 3, w: 250 }),
    T(16, 96, 'Exposure & Alerts', 22, P.fg, { bold: true, w: 300 }),
    T(16, 124, 'Real-time risk management · 5 agents', 11, P.muted, { mono: true, w: 300 })
  );
  add(s, line(0, 144, W, 1, P.border));

  // Portfolio risk overview — bento-style 2x2 grid
  add(s, T(16, 152, 'PORTFOLIO EXPOSURE', 9, P.muted, { ls: 2, mono: true, w: 250 }));

  const riskCards = [
    { label: 'TOTAL EXPOSURE', val: '$3.24M', sub: '67% of AUM', color: P.amber, alert: false },
    { label: 'NET BETA', val: '0.84', sub: 'market corr.', color: P.fg, alert: false },
    { label: 'VaR (95%)', val: '$48,200', sub: 'daily estimate', color: P.amber, alert: false },
    { label: 'DRAWDOWN', val: '-3.2%', sub: 'from peak', color: P.coral, alert: true },
  ];
  riskCards.forEach((card, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const cx = col === 0 ? 16 : 203, cy = 166 + row * 76;
    const c = F(cx, cy, 174, 68, card.alert ? P.coral + '11' : P.surface, { r: 7, stroke: card.alert ? P.coral + '55' : P.border });
    add(c,
      T(cx + 14, cy + 10, card.label, 8, P.muted, { ls: 1.5, mono: true, w: 150 }),
      T(cx + 14, cy + 24, card.val, 18, card.color, { bold: true, mono: true, w: 150 }),
      T(cx + 14, cy + 48, card.sub, 9, P.muted, { w: 150 })
    );
    if (card.alert) add(c, T(cx + 140, cy + 10, '⚠', 12, P.coral, { w: 20 }));
    add(s, c);
  });

  // Active alert
  add(s, T(16, 326, 'ACTIVE ALERTS', 9, P.muted, { ls: 2, mono: true, w: 250 }));
  const alert = F(16, 340, W - 32, 80, P.coral + '11', { r: 8, stroke: P.coral + '55', sw: 1 });
  add(alert,
    T(28, 350, '⚠ VEGA DRAWDOWN THRESHOLD', 10, P.coral, { bold: true, ls: 1, mono: true, w: 300 }),
    T(28, 366, 'Agent VEGA has exceeded 4% drawdown limit.', 12, P.fg, { opacity: 0.8, w: 330 }),
    T(28, 382, 'Strategy paused automatically. Review required.', 11, P.muted, { w: 330 }),
    T(28, 400, '14:28:44 UTC', 9, P.muted, { mono: true, w: 150 }),
    // Action button
    F(280, 350, 80, 28, P.coral, { r: 5 }),
    T(296, 358, 'REVIEW', 9, P.bg, { bold: true, mono: true, ls: 1, w: 60 })
  );
  add(s, alert);

  // Sector exposure breakdown
  add(s, T(16, 434, 'SECTOR EXPOSURE', 9, P.muted, { ls: 2, mono: true, w: 250 }));
  add(s, line(16, 448, W - 32, 1, P.border));

  const sectors = [
    { name: 'US Equities', pct: 0.58, val: '$2.80M', color: P.lime },
    { name: 'Technology', pct: 0.22, val: '$1.06M', color: P.coral2 },
    { name: 'Options (VIX)', pct: 0.12, val: '$0.58M', color: P.amber },
    { name: 'Cash / MM', pct: 0.08, val: '$0.39M', color: P.muted },
  ];
  sectors.forEach((sec, i) => {
    const sy = 456 + i * 44;
    add(s,
      T(16, sy + 4, sec.name, 12, P.fg, { w: 160 }),
      T(16, sy + 20, sec.val, 10, P.muted, { mono: true, w: 100 }),
      T(W - 60, sy + 4, `${Math.round(sec.pct * 100)}%`, 12, sec.color, { bold: true, mono: true, w: 50, align: 'right' }),
    );
    progressBar(16, sy + 34, W - 32, sec.pct, P.border, sec.color + '88', s);
  });

  // Agent risk grid
  add(s, T(16, 640, 'AGENT RISK STATUS', 9, P.muted, { ls: 2, mono: true, w: 250 }));
  add(s, line(16, 654, W - 32, 1, P.border));

  const agentRisk = [
    { name: 'ORION', dd: '1.8%', exp: '$1.68M', status: 'OK', c: P.lime },
    { name: 'SIGMA', dd: '2.1%', exp: '$1.06M', status: 'OK', c: P.lime },
    { name: 'ATLAS', dd: '0.4%', exp: '$0.87M', status: 'OK', c: P.lime },
    { name: 'VEGA',  dd: '4.2%', exp: '$0.72M', status: 'ALERT', c: P.coral },
    { name: 'HELIOS',dd: '–',   exp: '$0.48M', status: 'DEPLOY', c: P.amber },
  ];
  agentRisk.forEach((a, i) => {
    const ay = 662 + i * 28;
    add(s,
      circle(22, ay + 8, 4, a.c),
      T(32, ay + 2, a.name, 10, P.fg, { bold: true, mono: true, w: 70 }),
      T(104, ay + 2, `DD ${a.dd}`, 10, a.dd === '4.2%' ? P.coral : P.muted, { mono: true, w: 80 }),
      T(194, ay + 2, a.exp, 10, P.muted, { mono: true, w: 90 }),
      F(300, ay, 60, 18, a.c + '22', { r: 3 }),
      T(304, ay + 4, a.status, 8, a.c, { bold: true, mono: true, ls: 0.5, w: 54 })
    );
    if (i < agentRisk.length - 1) add(s, line(16, ay + 22, W - 32, 1, P.border, { opacity: 0.3 }));
  });

  const nav = F(0, H - 64, W, 64, P.terminal);
  const navItems = ['⬡','◈','≡','◎','⊚'].map((icon, i) => ({ icon, label: ['Home','Agents','Trades','Risk','Settings'][i], active: i === 3 }));
  navItems.forEach((item, i) => {
    add(nav,
      T(20 + i * 70, H - 50, item.icon, 18, item.active ? P.coral : P.muted, { align: 'center', w: 32 }),
      T(12 + i * 70, H - 28, item.label, 8, item.active ? P.coral : P.muted, { align: 'center', w: 48 })
    );
  });
  add(s, nav);

  return s;
}

// ── Assemble .pen file ────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'vestry',
  children: [
    screen1(),
    screen2(),
    screen3(),
    screen4(),
    screen5(),
  ],
};

fs.writeFileSync(path.join(__dirname, 'vestry.pen'), JSON.stringify(pen, null, 2));
console.log('✓ vestry.pen written — 5 mobile screens');
console.log('  Screen 1: Dashboard — Portfolio Overview + macOS terminal chrome');
console.log('  Screen 2: Agent Roster — Live status board with allocation bars');
console.log('  Screen 3: Strategy Detail — Editorial hero + terminal config + trade log');
console.log('  Screen 4: Trade Log — Decision feed with reasoning snippets');
console.log('  Screen 5: Risk Monitor — Exposure grid + alerts + sector breakdown');
