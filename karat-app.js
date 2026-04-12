'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'karat';
const NAME = 'KARAT';
const W = 390, H = 844;

// ─── Palette ──────────────────────────────────────────────────────────────────
const P = {
  bg:      '#0C0A1A',
  surf:    '#12102A',
  card:    '#1A1833',
  card2:   '#201E3A',
  line:    '#2A2748',
  acc:     '#7454FA',   // violet — from Land-book FinTech SaaS hero
  acc2:    '#B28A4E',   // warm gold — the lone chromatic warmth
  acc3:    '#4ECBB2',   // teal, minimal use
  text:    '#F1EFF9',
  sub:     '#A09CC0',
  muted:   '#5E5A7A',
  pos:     '#4ECBB2',   // positive / green-teal
  neg:     '#F47070',   // negative / red
  gold:    '#B28A4E',
  goldLt:  '#D4B278',
  violet:  '#7454FA',
  violetLt:'#9B7FFD',
};

// ─── Primitives ───────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  const rx = opts.rx ?? 0;
  const op = opts.opacity ?? 1;
  const stroke = opts.stroke ? `stroke="${opts.stroke}" stroke-width="${opts.sw ?? 1}"` : '';
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" opacity="${op}" ${stroke}/>`;
}
function text(x, y, content, size, fill, opts = {}) {
  const fw  = opts.fw ?? 400;
  const anc = opts.anchor ?? 'start';
  const op  = opts.opacity ?? 1;
  const ls  = opts.ls ? `letter-spacing="${opts.ls}"` : '';
  const font = opts.font ?? 'Inter, system-ui, sans-serif';
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${fw}" text-anchor="${anc}" font-family="${font}" opacity="${op}" ${ls}>${content}</text>`;
}
function circle(cx, cy, r, fill, opts = {}) {
  const op = opts.opacity ?? 1;
  const stroke = opts.stroke ? `stroke="${opts.stroke}" stroke-width="${opts.sw ?? 1}"` : '';
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${op}" ${stroke}/>`;
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  const sw  = opts.sw ?? 1;
  const op  = opts.opacity ?? 1;
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" opacity="${op}"/>`;
}
function pill(x, y, w, h, fill, opacity = 1) {
  return rect(x, y, w, h, fill, { rx: h / 2, opacity });
}
function arc(cx, cy, r, startDeg, endDeg, stroke, sw = 3, op = 1) {
  const toRad = d => (d - 90) * Math.PI / 180;
  const sx = cx + r * Math.cos(toRad(startDeg));
  const sy = cy + r * Math.sin(toRad(startDeg));
  const ex = cx + r * Math.cos(toRad(endDeg));
  const ey = cy + r * Math.sin(toRad(endDeg));
  const large = (endDeg - startDeg) > 180 ? 1 : 0;
  return `<path d="M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" opacity="${op}"/>`;
}
function sparkLine(pts, stroke, sw = 1.5, fill = 'none', fillOp = 0) {
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  const last = pts[pts.length - 1];
  const first = pts[0];
  const fillPath = fill !== 'none'
    ? `<path d="${d} L ${last[0]} ${last[1] + 40} L ${first[0]} ${first[1] + 40} Z" fill="${fill}" opacity="${fillOp}"/>`
    : '';
  return fillPath + `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
}
function statusBadge(x, y, label, color) {
  const w = label.length * 6 + 14;
  return pill(x, y, w, 18, color, 0.18)
    + text(x + w / 2, y + 12.5, label, 9, color, { fw: 600, anchor: 'middle', ls: '0.5' });
}
function sectionLabel(x, y, label) {
  return text(x, y, label.toUpperCase(), 9, P.muted, { fw: 700, ls: '1.5' });
}
function divider(y) {
  return line(20, y, W - 20, y, P.line, { op: 0.6 });
}
function chevronRight(x, y) {
  return `<polyline points="${x},${y - 4} ${x + 5},${y} ${x},${y + 4}" fill="none" stroke="${P.muted}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>`;
}

// ─── Shared components ────────────────────────────────────────────────────────
function statusBar(y = 44) {
  return [
    text(20, y, '9:41', 13, P.text, { fw: 600 }),
    text(W - 20, y, '●●●', 10, P.text, { anchor: 'end', op: 0.7 }),
  ].join('\n');
}

function navBar(active) {
  const tabs = [
    { id: 'portfolio', label: 'Portfolio', icon: '◈' },
    { id: 'holdings', label: 'Holdings', icon: '▦' },
    { id: 'flow',     label: 'Flow',     icon: '⟳' },
    { id: 'goals',    label: 'Goals',    icon: '◎' },
    { id: 'insights', label: 'Insights', icon: '✦' },
  ];
  const y = H - 56;
  let els = [
    rect(0, y, W, 56, P.surf),
    line(0, y, W, y, P.line, { op: 0.4 }),
  ];
  tabs.forEach((t, i) => {
    const x = 17 + i * 72;
    const isActive = t.id === active;
    const col = isActive ? P.acc : P.muted;
    els.push(text(x + 20, y + 20, t.icon, 14, col, { anchor: 'middle', op: isActive ? 1 : 0.7 }));
    els.push(text(x + 20, y + 35, t.label, 9, col, { anchor: 'middle', fw: isActive ? 600 : 400 }));
    if (isActive) els.push(rect(x + 10, y, 20, 2, P.acc, { rx: 1 }));
  });
  return els.join('\n');
}

// ─── SCREEN 1: Portfolio Overview ─────────────────────────────────────────────
function screen1() {
  const els = [];

  // BG
  els.push(rect(0, 0, W, H, P.bg));
  // Ambient gradient blob top-right (violet)
  els.push(`<ellipse cx="340" cy="80" rx="130" ry="90" fill="${P.acc}" opacity="0.08"/>`);
  // Ambient gold blob bottom-left
  els.push(`<ellipse cx="60" cy="700" rx="100" ry="70" fill="${P.acc2}" opacity="0.06"/>`);
  // Decorative dot grid (subtle texture, top quarter)
  for (let dy = 60; dy < 120; dy += 12) {
    for (let dx = 260; dx < W - 10; dx += 12) {
      els.push(circle(dx, dy, 1, P.acc, { opacity: 0.12 }));
    }
  }
  // Decorative corner accent lines
  for (let k = 0; k < 6; k++) {
    els.push(line(W - 20, 60 + k * 10, W, 60 + k * 10, P.acc2, { op: 0.08 + k * 0.02 }));
  }

  // Status bar
  els.push(statusBar(44));

  // Header
  els.push(text(20, 78, 'Good morning, Alex', 13, P.sub));
  els.push(text(20, 106, 'KARAT', 28, P.text, { fw: 800, ls: '2' }));

  // Net worth hero card (large bento)
  els.push(rect(20, 122, W - 40, 155, P.card, { rx: 20 }));
  // Gold gradient overlay on card top-right
  els.push(`<ellipse cx="${W - 20}" cy="145" rx="80" ry="55" fill="${P.acc2}" opacity="0.1"/>`);
  els.push(text(40, 152, 'Net Worth', 11, P.sub, { fw: 500 }));
  els.push(text(40, 192, '$284,720', 38, P.text, { fw: 700 }));
  els.push(text(40, 215, '.38', 22, P.sub, { fw: 500 }));
  els.push(statusBadge(40, 226, '+$3,210 this month', P.pos));
  // Mini sparkline
  const spPts = [[40,258],[60,252],[80,255],[100,248],[120,244],[140,250],[160,243],[180,238],[200,242],[220,235],[240,240],[260,232],[270,230]];
  els.push(sparkLine(spPts, P.acc, 2, P.acc, 0.08));
  els.push(circle(270, 230, 3, P.acc));

  // 2-col bento row
  // Bento A: Investments
  els.push(rect(20, 290, 168, 100, P.card, { rx: 16 }));
  els.push(`<ellipse cx="188" cy="290" rx="50" ry="35" fill="${P.acc}" opacity="0.07"/>`);
  els.push(text(36, 316, 'Investments', 10, P.sub));
  els.push(text(36, 346, '$198,440', 20, P.text, { fw: 700 }));
  els.push(statusBadge(36, 355, '+14.2%', P.pos));
  els.push(text(36, 381, '↗ YTD', 9, P.muted));

  // Bento B: Cash
  els.push(rect(202, 290, 168, 100, P.card, { rx: 16 }));
  els.push(text(218, 316, 'Cash', 10, P.sub));
  els.push(text(218, 346, '$43,280', 20, P.text, { fw: 700 }));
  els.push(statusBadge(218, 355, '15.2%', P.acc2));
  els.push(text(218, 381, 'of net worth', 9, P.muted));

  // 3-col bento row
  const bentoData = [
    { label: 'Real Estate', val: '$43K', icon: '⬡' },
    { label: 'Crypto', val: '$0.3K', icon: '◈' },
    { label: 'Debt', val: '-$12K', icon: '▽', neg: true },
  ];
  bentoData.forEach((b, i) => {
    const bx = 20 + i * 121;
    els.push(rect(bx, 404, 110, 80, P.card, { rx: 14 }));
    els.push(text(bx + 14, 428, b.icon, 14, b.neg ? P.neg : P.acc2, { op: 0.9 }));
    els.push(text(bx + 14, 455, b.val, 15, b.neg ? P.neg : P.text, { fw: 700 }));
    els.push(text(bx + 14, 472, b.label, 9, P.muted));
  });

  // Allocation donut
  els.push(rect(20, 498, W - 40, 130, P.card, { rx: 16 }));
  els.push(sectionLabel(36, 522, 'Allocation'));
  // Donut arcs
  const cxD = 88, cyD = 575, rD = 34;
  els.push(arc(cxD, cyD, rD, 0, 360, P.line, 8));
  els.push(arc(cxD, cyD, rD, 0, 252, P.acc, 8));   // 70% equities
  els.push(arc(cxD, cyD, rD, 252, 307, P.acc2, 8)); // 15% cash
  els.push(arc(cxD, cyD, rD, 307, 356, P.acc3, 8)); // 13.7% real estate
  els.push(text(cxD, cyD + 5, '70%', 11, P.text, { fw: 700, anchor: 'middle' }));
  // Legend
  const allocs = [
    { color: P.acc,  label: 'Equities', pct: '70%' },
    { color: P.acc2, label: 'Cash',     pct: '15%' },
    { color: P.acc3, label: 'RE',       pct: '13%' },
    { color: P.neg,  label: 'Other',    pct: '2%' },
  ];
  allocs.forEach((a, i) => {
    const lx = 155, ly = 532 + i * 22;
    els.push(circle(lx, ly, 4, a.color));
    els.push(text(lx + 10, ly + 4, a.label, 10, P.sub));
    els.push(text(lx + 90, ly + 4, a.pct, 10, P.text, { fw: 600 }));
  });

  // Market snapshot row
  els.push(sectionLabel(20, 650, 'Market'));
  const tickers = [
    { sym: 'SPY',  px: '521.4', chg: '+0.8%', up: true },
    { sym: 'NVDA', px: '882.1', chg: '+2.1%', up: true },
    { sym: 'BTC',  px: '68.2K', chg: '-0.4%', up: false },
  ];
  tickers.forEach((t, i) => {
    const tx = 20 + i * 122;
    els.push(rect(tx, 658, 112, 52, P.card2, { rx: 12 }));
    els.push(text(tx + 10, 676, t.sym, 11, P.text, { fw: 700 }));
    els.push(text(tx + 10, 694, t.px, 10, P.sub));
    els.push(text(tx + 100, 676, t.chg, 9, t.up ? P.pos : P.neg, { anchor: 'end', fw: 600 }));
  });

  // Nav
  els.push(navBar('portfolio'));

  return els.join('\n');
}

// ─── SCREEN 2: Holdings ────────────────────────────────────────────────────────
function screen2() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  els.push(`<ellipse cx="360" cy="120" rx="120" ry="80" fill="${P.acc}" opacity="0.07"/>`);

  els.push(statusBar(44));
  els.push(text(20, 82, 'Holdings', 26, P.text, { fw: 700 }));
  els.push(text(20, 106, '12 positions  ·  $284,720', 12, P.sub));

  // Filter pills
  const filters = ['All', 'Stocks', 'ETF', 'Crypto', 'Cash'];
  let px = 20;
  filters.forEach((f, i) => {
    const w = f.length * 7 + 22;
    const isActive = i === 0;
    els.push(pill(px, 118, w, 26, isActive ? P.acc : P.card, isActive ? 1 : 1));
    els.push(text(px + w / 2, 135, f, 10, isActive ? P.text : P.sub, { anchor: 'middle', fw: isActive ? 700 : 400 }));
    px += w + 8;
  });

  // Holdings list
  const holdings = [
    { sym: 'VTI',  name: 'Vanguard Total Market', alloc: 85, px: '$243.18', chg: '+1.2%', val: '$98,420', up: true },
    { sym: 'NVDA', name: 'NVIDIA Corporation',     alloc: 72, px: '$882.10', chg: '+2.1%', val: '$44,105', up: true },
    { sym: 'AAPL', name: 'Apple Inc.',              alloc: 58, px: '$189.30', chg: '+0.4%', val: '$28,395', up: true },
    { sym: 'MSFT', name: 'Microsoft Corporation',  alloc: 50, px: '$415.60', chg: '-0.8%', val: '$20,780', up: false },
    { sym: 'QQQ',  name: 'Invesco QQQ Trust',      alloc: 30, px: '$444.20', chg: '+0.6%', val: '$13,326', up: true },
    { sym: 'BTC',  name: 'Bitcoin',                 alloc: 12, px: '$68,200', chg: '-0.4%', val: '$3,410',  up: false },
    { sym: 'CASH', name: 'Money Market Fund',       alloc: 100, px: '$1.00',  chg: '+0.0%', val: '$43,280', up: true },
  ];

  let hy = 162;
  holdings.forEach((h, i) => {
    if (hy > 700) return;
    els.push(rect(20, hy, W - 40, 64, i % 2 === 0 ? P.card : 'transparent', { rx: 14 }));

    // Symbol badge
    els.push(rect(32, hy + 14, 36, 36, P.card2, { rx: 10 }));
    els.push(text(50, hy + 37, h.sym.substring(0, 3), 9, P.acc, { fw: 700, anchor: 'middle', ls: '0.5' }));

    // Name + allocation bar
    els.push(text(78, hy + 27, h.name, 11, P.text, { fw: 500 }));
    els.push(rect(78, hy + 34, 140, 3, P.line, { rx: 1.5 }));
    els.push(rect(78, hy + 34, h.alloc * 1.4, 3, P.acc, { rx: 1.5, opacity: 0.7 }));
    els.push(text(78, hy + 52, `${h.alloc}% allocated`, 9, P.muted));

    // Value + change
    els.push(text(W - 32, hy + 27, h.val, 12, P.text, { fw: 700, anchor: 'end' }));
    els.push(text(W - 32, hy + 46, h.chg, 10, h.up ? P.pos : P.neg, { anchor: 'end', fw: 600 }));

    hy += 68;
  });

  // Totals row
  els.push(divider(hy + 6));
  els.push(text(20, hy + 26, 'Total Portfolio Value', 11, P.sub));
  els.push(text(W - 20, hy + 26, '$284,720', 14, P.text, { fw: 700, anchor: 'end' }));

  els.push(navBar('holdings'));
  return els.join('\n');
}

// ─── SCREEN 3: Cash Flow ──────────────────────────────────────────────────────
function screen3() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  els.push(`<ellipse cx="50" cy="200" rx="100" ry="70" fill="${P.acc2}" opacity="0.07"/>`);

  els.push(statusBar(44));
  els.push(text(20, 82, 'Cash Flow', 26, P.text, { fw: 700 }));

  // Month selector
  const months = ['Feb', 'Mar', 'Apr'];
  months.forEach((m, i) => {
    const active = i === 2;
    const mx = 20 + i * 90;
    if (active) els.push(rect(mx, 90, 78, 24, P.acc, { rx: 12, opacity: 0.2 }));
    els.push(text(mx + 39, 106, m, 12, active ? P.acc : P.muted, { anchor: 'middle', fw: active ? 700 : 400 }));
  });

  // Summary row cards
  els.push(rect(20, 126, 168, 82, P.card, { rx: 16 }));
  els.push(text(36, 152, 'Income', 10, P.sub));
  els.push(text(36, 180, '$12,400', 22, P.pos, { fw: 700 }));
  els.push(text(36, 198, '↑ 4.2% vs Mar', 9, P.muted));

  els.push(rect(202, 126, 168, 82, P.card, { rx: 16 }));
  els.push(text(218, 152, 'Expenses', 10, P.sub));
  els.push(text(218, 180, '$7,840', 22, P.neg, { fw: 700 }));
  els.push(text(218, 198, '↓ 1.8% vs Mar', 9, P.muted));

  // Net savings highlight
  els.push(rect(20, 220, W - 40, 52, P.card2, { rx: 14 }));
  els.push(text(36, 245, 'Net Savings', 11, P.sub));
  els.push(text(36, 264, '$4,560', 14, P.text, { fw: 700 }));
  els.push(statusBadge(160, 234, '36.8% savings rate', P.acc2));

  // Flow chart — bar chart
  els.push(sectionLabel(20, 292, 'Monthly Breakdown'));
  const flowItems = [
    { label: 'Salary', amt: 10500, type: 'in' },
    { label: 'Freelance', amt: 1900, type: 'in' },
    { label: 'Housing', amt: -2800, type: 'out' },
    { label: 'Food', amt: -1200, type: 'out' },
    { label: 'Transport', amt: -640, type: 'out' },
    { label: 'Savings', amt: -2000, type: 'out' },
    { label: 'Invest', amt: -1200, type: 'out' },
  ];
  flowItems.forEach((item, i) => {
    const fy = 308 + i * 50;
    const isIn = item.type === 'in';
    const amt = Math.abs(item.amt);
    const barW = Math.round(amt / 120);
    const color = isIn ? P.pos : P.acc;

    els.push(rect(20, fy, W - 40, 42, i % 2 === 0 ? P.card : 'transparent', { rx: 10 }));
    els.push(text(34, fy + 16, isIn ? '↓' : '↑', 10, color));
    els.push(text(48, fy + 16, item.label, 11, P.text));
    els.push(text(W - 34, fy + 16, `${isIn ? '+' : '-'}$${(amt/1000).toFixed(1)}K`, 11, color, { anchor: 'end', fw: 600 }));

    // Progress bar
    els.push(rect(34, fy + 24, barW, 6, P.line, { rx: 3 }));
    els.push(rect(34, fy + 24, barW, 6, color, { rx: 3, opacity: 0.6 }));
  });

  els.push(navBar('flow'));
  return els.join('\n');
}

// ─── SCREEN 4: Goals ──────────────────────────────────────────────────────────
function screen4() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  els.push(`<ellipse cx="300" cy="600" rx="120" ry="80" fill="${P.acc}" opacity="0.06"/>`);

  els.push(statusBar(44));
  els.push(text(20, 82, 'Goals', 26, P.text, { fw: 700 }));
  els.push(text(20, 106, '4 active  ·  1 completed', 12, P.sub));

  const goals = [
    { name: 'Emergency Fund',  target: 30000, current: 28500, color: P.pos,  icon: '⬡', deadline: 'Jun 2025' },
    { name: 'House Down Pmt',  target: 80000, current: 43280, color: P.acc2, icon: '◈', deadline: 'Jan 2027' },
    { name: 'Retirement 1M',   target: 1000000,current: 198440, color: P.acc, icon: '✦', deadline: 'Dec 2045' },
    { name: 'Europe Trip',     target: 8000,  current: 3200, color: P.acc3, icon: '◎', deadline: 'Aug 2025' },
    { name: 'New Laptop',      target: 3500,  current: 3500, color: P.muted,icon: '▦', deadline: 'Done', done: true },
  ];

  let gy = 122;
  goals.forEach(g => {
    const pct = Math.min(100, Math.round((g.current / g.target) * 100));
    const barFull = W - 80;

    els.push(rect(20, gy, W - 40, 96, P.card, { rx: 18 }));
    if (g.done) els.push(rect(20, gy, W - 40, 96, P.pos, { rx: 18, opacity: 0.05 }));

    // Icon badge
    els.push(circle(50, gy + 30, 18, g.color, { opacity: 0.15 }));
    els.push(text(50, gy + 35, g.icon, 13, g.color, { anchor: 'middle' }));

    // Labels
    els.push(text(80, gy + 24, g.name, 13, g.done ? P.muted : P.text, { fw: 600 }));
    els.push(text(80, gy + 43, g.deadline, 10, P.muted));

    // Amount
    els.push(text(W - 34, gy + 24, `$${(g.current/1000).toFixed(1)}K`, 12, g.color, { anchor: 'end', fw: 700 }));
    els.push(text(W - 34, gy + 43, `/ $${(g.target/1000).toFixed(g.target >= 100000 ? 0 : 1)}K`, 10, P.muted, { anchor: 'end' }));

    // Progress bar
    els.push(rect(36, gy + 58, barFull, 8, P.line, { rx: 4 }));
    els.push(rect(36, gy + 58, Math.round(barFull * pct / 100), 8, g.color, { rx: 4 }));
    els.push(text(W - 34, gy + 82, `${pct}%`, 9, g.done ? P.pos : g.color, { anchor: 'end', fw: 600 }));

    if (g.done) els.push(statusBadge(36, gy + 73, '✓ Completed', P.pos));

    gy += 104;
  });

  // Add goal button
  els.push(rect(20, gy + 4, W - 40, 42, P.acc, { rx: 14, opacity: 0.15 }));
  els.push(rect(20, gy + 4, W - 40, 42, P.acc, { rx: 14, opacity: 0, stroke: P.acc, sw: 1 }));
  els.push(text(W / 2, gy + 30, '+ Add New Goal', 12, P.acc, { anchor: 'middle', fw: 600 }));

  els.push(navBar('goals'));
  return els.join('\n');
}

// ─── SCREEN 5: Insights ───────────────────────────────────────────────────────
function screen5() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  els.push(`<ellipse cx="200" cy="160" rx="180" ry="100" fill="${P.acc}" opacity="0.06"/>`);

  els.push(statusBar(44));
  els.push(text(20, 82, 'Insights', 26, P.text, { fw: 700 }));
  els.push(text(20, 106, 'AI-powered wealth analysis', 12, P.sub));

  // Score card (large bento, gold glow)
  els.push(rect(20, 118, W - 40, 120, P.card, { rx: 20 }));
  els.push(`<ellipse cx="${W - 20}" cy="130" rx="90" ry="60" fill="${P.acc2}" opacity="0.12"/>`);
  // Circular score
  els.push(arc(90, 186, 38, 0, 310, P.line, 6));
  els.push(arc(90, 186, 38, 0, 310, P.acc2, 6));
  els.push(text(90, 191, '86', 18, P.acc2, { fw: 700, anchor: 'middle' }));
  els.push(text(90, 207, '/100', 9, P.muted, { anchor: 'middle' }));
  els.push(text(148, 150, 'Wealth Score', 14, P.text, { fw: 700 }));
  els.push(text(148, 170, 'Excellent health — top 12%', 11, P.sub));
  els.push(statusBadge(148, 178, '↑ 3 pts this month', P.pos));
  els.push(text(148, 228, 'Diversification · Cash buffer · Savings rate', 9, P.muted));

  // Insight cards
  const insights = [
    {
      title: 'Rebalancing Opportunity',
      body: 'Your equities allocation is 2.8% above target. Consider moving $7,900 to cash.',
      tag: 'Action',
      tagColor: P.acc2,
      icon: '⟳',
    },
    {
      title: 'NVDA Concentration Risk',
      body: 'NVIDIA is 22% of equities. Trimming 5% could reduce volatility without hurting returns.',
      tag: 'Risk',
      tagColor: P.neg,
      icon: '▽',
    },
    {
      title: 'Savings Rate Milestone',
      body: 'You\'ve maintained 36%+ savings rate for 4 months. On track for $54K saved this year.',
      tag: 'Milestone',
      tagColor: P.pos,
      icon: '✦',
    },
    {
      title: 'Tax-Loss Harvest Window',
      body: 'MSFT position down 4.2% — eligible for tax-loss harvesting before April 15.',
      tag: 'Tax',
      tagColor: P.acc,
      icon: '◈',
    },
  ];

  let iy = 256;
  insights.forEach(ins => {
    if (iy > 710) return;
    els.push(rect(20, iy, W - 40, 88, P.card, { rx: 16 }));

    // Icon
    els.push(circle(50, iy + 28, 15, P.card2));
    els.push(text(50, iy + 33, ins.icon, 12, ins.tagColor, { anchor: 'middle' }));

    // Title + tag
    els.push(text(78, iy + 22, ins.title, 12, P.text, { fw: 600 }));
    els.push(statusBadge(W - 70, iy + 11, ins.tag, ins.tagColor));

    // Body
    const words = ins.body;
    const line1 = words.substring(0, 44);
    const line2 = words.substring(44, 88);
    els.push(text(78, iy + 42, line1, 10, P.sub));
    els.push(text(78, iy + 58, line2, 10, P.sub));
    els.push(text(78, iy + 76, 'View details →', 9, ins.tagColor, { fw: 600 }));

    iy += 96;
  });

  els.push(navBar('insights'));
  return els.join('\n');
}

// ─── Decorative grid overlay (ambient texture) ────────────────────────────────
function gridOverlay(yStart, yEnd, color, opacity = 0.04) {
  const els = [];
  for (let gy = yStart; gy <= yEnd; gy += 40) {
    els.push(line(0, gy, W, gy, color, { op: opacity }));
  }
  for (let gx = 0; gx <= W; gx += 40) {
    els.push(line(gx, yStart, gx, yEnd, color, { op: opacity }));
  }
  return els.join('\n');
}

// ─── SCREEN 6: Performance ────────────────────────────────────────────────────
function screen6() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  els.push(gridOverlay(60, H - 60, P.acc, 0.03));
  els.push(`<ellipse cx="50" cy="300" rx="90" ry="60" fill="${P.acc2}" opacity="0.07"/>`);
  els.push(`<ellipse cx="${W - 30}" cy="500" rx="100" ry="70" fill="${P.acc}" opacity="0.07"/>`);

  els.push(statusBar(44));
  els.push(text(20, 82, 'Performance', 26, P.text, { fw: 700 }));

  // Period tabs
  const periods = ['1W', '1M', '3M', 'YTD', '1Y', 'All'];
  periods.forEach((p, i) => {
    const active = i === 3;
    const px = 20 + i * 58;
    if (active) els.push(rect(px, 90, 46, 22, P.acc, { rx: 11, opacity: 0.2 }));
    els.push(text(px + 23, 105, p, 10, active ? P.acc : P.muted, { anchor: 'middle', fw: active ? 700 : 400 }));
  });

  // Main performance number
  els.push(rect(20, 120, W - 40, 100, P.card, { rx: 18 }));
  els.push(text(36, 152, 'Portfolio Return (YTD)', 10, P.sub));
  els.push(text(36, 188, '+14.2%', 36, P.pos, { fw: 700 }));
  els.push(text(180, 188, '+$34,620', 16, P.pos, { fw: 600 }));
  els.push(text(36, 210, 'vs S&P 500: +9.1%  ↑ Outperforming by 5.1%', 9, P.muted));

  // Chart area
  els.push(rect(20, 232, W - 40, 170, P.card, { rx: 16 }));
  els.push(text(36, 256, 'Portfolio vs Benchmark', 10, P.sub));
  // Generate chart data (portfolio line higher than benchmark)
  const chartPts = [];
  const benchPts = [];
  const numPts = 16;
  for (let i = 0; i < numPts; i++) {
    const x = 36 + i * ((W - 72) / (numPts - 1));
    const portVal = 310 + Math.sin(i * 0.4) * 8 - i * 2.8 + (Math.random() > 0.5 ? 2 : -1);
    const benchVal = 310 + Math.sin(i * 0.3) * 5 - i * 1.6 + (Math.random() > 0.5 ? 1 : -1);
    chartPts.push([x, portVal]);
    benchPts.push([x, benchVal]);
  }
  // Force trend
  chartPts[numPts - 1] = [chartPts[numPts - 1][0], 270];
  benchPts[numPts - 1] = [benchPts[numPts - 1][0], 290];

  els.push(sparkLine(benchPts, P.acc2, 1.5, 'none', 0));
  els.push(sparkLine(chartPts, P.acc, 2, P.acc, 0.07));
  // Chart labels
  els.push(text(36, 394, 'Jan', 8, P.muted));
  els.push(text(W / 2, 394, 'Apr', 8, P.muted, { anchor: 'middle' }));
  els.push(text(W - 36, 394, 'Now', 8, P.muted, { anchor: 'end' }));
  // Legend
  els.push(circle(36, 272, 4, P.acc));
  els.push(text(44, 276, 'Portfolio', 8, P.sub));
  els.push(circle(100, 272, 4, P.acc2));
  els.push(text(108, 276, 'S&P 500', 8, P.sub));

  // Top performers
  els.push(sectionLabel(20, 420, 'Top Performers'));
  const perfs = [
    { sym: 'NVDA', ret: '+48.2%', color: P.pos },
    { sym: 'VTI',  ret: '+12.8%', color: P.pos },
    { sym: 'MSFT', ret: '-4.2%',  color: P.neg },
  ];
  perfs.forEach((p, i) => {
    const px = 20 + i * 122;
    els.push(rect(px, 430, 112, 60, P.card, { rx: 14 }));
    els.push(text(px + 10, 452, p.sym, 12, P.text, { fw: 700 }));
    els.push(text(px + 10, 474, p.ret, 14, p.color, { fw: 700 }));
  });

  // Risk metrics
  els.push(sectionLabel(20, 510, 'Risk Metrics'));
  const metrics = [
    { label: 'Sharpe Ratio', val: '1.82', note: 'Excellent' },
    { label: 'Max Drawdown', val: '-8.4%', note: 'Low risk' },
    { label: 'Beta vs SPY',  val: '0.94', note: 'Slightly defensive' },
    { label: 'Volatility',   val: '12.1%', note: 'Moderate' },
  ];
  metrics.forEach((m, i) => {
    const my = 522 + i * 44;
    els.push(rect(20, my, W - 40, 36, P.card, { rx: 10 }));
    els.push(text(34, my + 22, m.label, 11, P.sub));
    els.push(text(W - 34, my + 16, m.val, 13, P.text, { fw: 700, anchor: 'end' }));
    els.push(text(W - 34, my + 30, m.note, 9, P.muted, { anchor: 'end' }));
  });

  els.push(navBar('portfolio'));
  return els.join('\n');
}

// ─── Assemble pen ─────────────────────────────────────────────────────────────
function buildScreen(name, svgContent) {
  const elements = (svgContent.match(/<(rect|text|circle|line|path|ellipse|polyline)/g) || []).length;
  return {
    name,
    elements,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${svgContent}</svg>`,
  };
}

const screens = [
  buildScreen('Portfolio Overview', screen1()),
  buildScreen('Holdings',           screen2()),
  buildScreen('Cash Flow',          screen3()),
  buildScreen('Goals',              screen4()),
  buildScreen('Insights',           screen5()),
  buildScreen('Performance',        screen6()),
];

const totalEls = screens.reduce((s, sc) => s + sc.elements, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'dark',
    heartbeat: 12,
    elements: totalEls,
    palette: {
      bg: P.bg, surface: P.surf, card: P.card,
      accent: P.acc, accent2: P.acc2, text: P.text,
    },
    description: 'Dark fintech wealth intelligence dashboard. Inspired by Land-book FinTech SaaS hero palette (deep violet + warm gold) and bento-grid layout trends.',
    slug: SLUG,
  },
  screens: screens.map(sc => ({
    name: sc.name,
    width: W,
    height: H,
    elements: sc.elements,
    svg: sc.svg,
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalEls} elements`);
console.log(`Written: ${SLUG}.pen`);
screens.forEach(sc => console.log(`  ${sc.name}: ${sc.elements} elements`));
