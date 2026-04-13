'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'mono';
const W = 390, H = 844;

// ── PURE MONOCHROMATIC PALETTE ─────────────────────────────────────────────
// Inspired by Uptec on DarkModeDesign.com: zero color, alternating solid/hollow
// type, geometric structure, fluid animation. BG through white only.
const P = {
  bg:      '#080808',
  surf:    '#0F0F0F',
  card:    '#181818',
  border:  '#262626',
  border2: '#1C1C1C',
  // Text layers — white at decreasing opacity
  t1:      '#FFFFFF',          // primary — 100%
  t2:      'rgba(255,255,255,0.65)',  // secondary
  t3:      'rgba(255,255,255,0.38)',  // muted
  t4:      'rgba(255,255,255,0.18)',  // ghost/placeholder
  // Hollow stroke (Uptec signature)
  hollow:  'none',             // fill for hollow text
  stroke:  '#FFFFFF',          // stroke for hollow text
};

let idCounter = 0;
function uid() { return `el-${++idCounter}`; }

function rect(x, y, w, h, fill, opts = {}) {
  return {
    id: uid(), type: 'rect',
    x, y, width: w, height: h, fill,
    rx: opts.rx || 0,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
    stroke: opts.stroke || 'none',
    strokeWidth: opts.sw || 0,
  };
}
function text(x, y, content, size, fill, opts = {}) {
  return {
    id: uid(), type: 'text',
    x, y, content: String(content), fontSize: size, fill,
    fontWeight: opts.fw || 400,
    fontFamily: opts.font || 'JetBrains Mono',
    textAnchor: opts.anchor || 'start',
    letterSpacing: opts.ls || 0,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
    // Hollow text: stroke on, fill none
    stroke: opts.stroke || 'none',
    strokeWidth: opts.sw || 0,
  };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return {
    id: uid(), type: 'line',
    x1, y1, x2, y2, stroke,
    strokeWidth: opts.sw || 1,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
  };
}
function circle(cx, cy, r, fill, opts = {}) {
  return {
    id: uid(), type: 'circle',
    cx, cy, r, fill,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
    stroke: opts.stroke || 'none',
    strokeWidth: opts.sw || 0,
  };
}

// ── SHARED COMPONENTS ──────────────────────────────────────────────────────

function statusBar(els) {
  els.push(rect(0, 0, W, 44, P.bg));
  els.push(text(20, 28, '9:41', 13, P.t2, { fw: 500 }));
  els.push(text(W / 2, 28, 'MONO', 9, P.t4, { anchor: 'middle', ls: 3 }));
  els.push(text(W - 20, 28, '●●● ▲ ▮▮▮', 11, P.t2, { anchor: 'end' }));
  // very subtle top border
  els.push(line(0, 44, W, 44, P.border2, { sw: 0.5 }));
}

// Decorative grid lines (Uptec-style geometric scaffolding)
function gridLines(els) {
  // Vertical ghost lines at key intervals
  [78, 156, 234, 312].forEach(x => {
    els.push(line(x, 0, x, H, P.border2, { sw: 0.3, opacity: 0.4 }));
  });
  // Horizontal ghost lines
  [100, 200, 300, 400, 500, 600, 700].forEach(y => {
    els.push(line(0, y, W, y, P.border2, { sw: 0.3, opacity: 0.25 }));
  });
}

// Corner tick marks — geometric decoration
function cornerTicks(els, x, y, size, opacity = 0.3) {
  // TL
  els.push(line(x, y, x + size, y, P.border, { sw: 0.5, opacity }));
  els.push(line(x, y, x, y + size, P.border, { sw: 0.5, opacity }));
  // TR
  els.push(line(x + W - 40 - size, y, x + W - 40, y, P.border, { sw: 0.5, opacity }));
  els.push(line(x + W - 40, y, x + W - 40, y + size, P.border, { sw: 0.5, opacity }));
}

// Mini sparkline (simple geometric line chart)
function sparkline(els, x, y, w, h, points, opacity = 0.5) {
  if (points.length < 2) return;
  const maxV = Math.max(...points);
  const minV = Math.min(...points);
  const range = maxV - minV || 1;
  const stepX = w / (points.length - 1);
  for (let i = 0; i < points.length - 1; i++) {
    const x1 = x + i * stepX;
    const y1 = y + h - ((points[i] - minV) / range) * h;
    const x2 = x + (i + 1) * stepX;
    const y2 = y + h - ((points[i + 1] - minV) / range) * h;
    els.push(line(x1, y1, x2, y2, `rgba(255,255,255,${opacity})`, { sw: 1 }));
  }
  // Endpoint dot
  const lastX = x + (points.length - 1) * stepX;
  const lastY = y + h - ((points[points.length - 1] - minV) / range) * h;
  els.push(circle(lastX, lastY, 2.5, P.t1, { opacity }));
}

// Tag pill
function pill(els, x, y, label, solid = false) {
  const w = label.length * 6.5 + 14;
  if (solid) {
    els.push(rect(x, y, w, 18, P.t1, { rx: 9 }));
    els.push(text(x + w / 2, y + 12, label, 7.5, P.bg, { anchor: 'middle', ls: 0.8, fw: 700 }));
  } else {
    els.push(rect(x, y, w, 18, P.hollow, { rx: 9, stroke: P.border, sw: 0.6 }));
    els.push(text(x + w / 2, y + 12, label, 7.5, P.t3, { anchor: 'middle', ls: 0.8 }));
  }
  return w;
}

function bottomNav(els, activeIdx) {
  const labels = ['HOME', 'TXN', 'CHART', 'GOALS', 'YOU'];
  const icons  = ['◈', '≡', '◉', '◎', '○'];
  const navH = 72;
  els.push(rect(0, H - navH, W, navH, P.surf));
  els.push(line(0, H - navH, W, H - navH, P.border, { sw: 0.5 }));
  labels.forEach((lbl, i) => {
    const cx = (W / labels.length) * i + (W / labels.length) / 2;
    const isActive = i === activeIdx;
    // Icon
    els.push(text(cx, H - navH + 22, icons[i], 14,
      isActive ? P.t1 : P.t3,
      { anchor: 'middle', fw: isActive ? 700 : 400 }));
    // Label
    els.push(text(cx, H - navH + 38, lbl, 8,
      isActive ? P.t1 : P.t4,
      { anchor: 'middle', ls: 1.2, fw: isActive ? 600 : 400 }));
    // Active indicator dot
    if (isActive) {
      els.push(circle(cx, H - navH + 50, 2, P.t1));
    }
  });
}

// Section label — uppercase mono, muted
function sectionLabel(els, x, y, label) {
  els.push(text(x, y, label, 9, P.t3, { ls: 2.5, fw: 500 }));
}

// Divider line
function divider(els, y, x1 = 20, x2 = W - 20) {
  els.push(line(x1, y, x2, y, P.border, { sw: 0.5 }));
}

// ── GHOST NUMBER BG (Uptec-style oversized hollow type as texture) ─────────
function ghostNumber(els, x, y, val, size) {
  els.push(text(x, y, val, size, P.hollow, {
    fw: 800,
    stroke: P.stroke,
    sw: 0.4,
    opacity: 0.06,
    anchor: 'middle',
  }));
}

// ── SCREEN 1: DASHBOARD ────────────────────────────────────────────────────
function screen1() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  gridLines(els);
  statusBar(els);

  // Ghost balance number — typography-as-background texture
  ghostNumber(els, W / 2, 280, '12,847', 140);

  // Header
  sectionLabel(els, 20, 70, 'OVERVIEW');
  els.push(line(20, 75, 80, 75, P.border, { sw: 0.5 }));

  // Greeting + date
  els.push(text(20, 95, 'APRIL 2026', 11, P.t3, { ls: 2 }));

  // ── Large balance display ──
  els.push(text(20, 175, '$', 28, P.t2, { fw: 300, font: 'JetBrains Mono' }));
  els.push(text(52, 175, '12,847', 48, P.t1, { fw: 700, font: 'JetBrains Mono' }));
  els.push(text(20, 196, '.34', 20, P.t2, { fw: 300 }));

  // Change label — hollow text (Uptec signature)
  els.push(text(20, 218, '+ 2.4% THIS MONTH', 10, P.hollow, {
    stroke: P.stroke,
    sw: 0.6,
    ls: 1.5,
    fw: 600,
    opacity: 0.7,
  }));

  // ── 4-stat grid ──
  const statsY = 252;
  const stats = [
    { label: 'INCOME', val: '6,240' },
    { label: 'SPENT',  val: '3,812' },
    { label: 'SAVED',  val: '2,428' },
    { label: 'INVEST', val: '1,600' },
  ];
  stats.forEach((s, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = 20 + col * (W / 2 - 10);
    const cy = statsY + row * 72;

    els.push(rect(cx, cy, (W / 2) - 30, 58, P.card, { rx: 4 }));
    els.push(text(cx + 12, cy + 22, s.label, 8, P.t3, { ls: 1.8 }));
    els.push(text(cx + 12, cy + 42, s.val, 18, P.t1, { fw: 600 }));
  });

  // ── Recent txn preview ──
  const listY = 408;
  sectionLabel(els, 20, listY, 'RECENT');
  divider(els, listY + 6);

  const txns = [
    { name: 'CLOUDFLARE', cat: 'INFRA',    amt: '-$24.00' },
    { name: 'PAYROLL',    cat: 'INCOME',   amt: '+$3,200' },
    { name: 'FIGMA',      cat: 'TOOLS',    amt: '-$15.00' },
  ];
  txns.forEach((t, i) => {
    const ty = listY + 26 + i * 52;
    // Row bg on hover — use subtle card
    els.push(rect(16, ty - 4, W - 32, 42, P.bg, { rx: 3 }));
    // Category badge — hollow style
    els.push(rect(20, ty + 6, 48, 18, P.card, { rx: 2 }));
    els.push(text(44, ty + 19, t.cat, 7, P.t3, { anchor: 'middle', ls: 0.8 }));
    // Name
    els.push(text(76, ty + 14, t.name, 11, P.t1, { fw: 500, ls: 0.5 }));
    // Amount
    const isPos = t.amt.startsWith('+');
    els.push(text(W - 20, ty + 14, t.amt, 11, isPos ? P.t1 : P.t2,
      { anchor: 'end', fw: 600 }));
    divider(els, ty + 38, 20, W - 20);
  });

  // Sparkline for balance history
  sparkline(els, 20, 230, W - 40, 20,
    [9200, 10100, 9800, 11200, 10600, 12000, 12847], 0.35);

  // Corner ticks around balance display
  cornerTicks(els, 14, 146, 10, 0.25);

  // ── Budget ring indicator (minimalist circle ─ no color) ──
  const ringY = 620;
  sectionLabel(els, 20, ringY, 'BUDGET HEALTH');
  divider(els, ringY + 6);

  // Outer ring
  els.push(circle(W / 2, ringY + 76, 50, P.hollow, { stroke: P.border, sw: 1.5 }));
  // Inner filled arc (approximate with circle overlay)
  els.push(circle(W / 2, ringY + 76, 50, P.hollow, {
    stroke: 'rgba(255,255,255,0.7)', sw: 4, opacity: 0.55
  }));
  // Center stat
  els.push(text(W / 2, ringY + 70, '61%', 20, P.t1, { anchor: 'middle', fw: 700 }));
  els.push(text(W / 2, ringY + 85, 'USED', 8, P.t3, { anchor: 'middle', ls: 2 }));

  // Month labels flanking
  els.push(text(W / 2 - 80, ringY + 76, 'APR', 9, P.t3, { anchor: 'middle' }));
  els.push(text(W / 2 + 80, ringY + 76, 'MAY', 9, P.t4, { anchor: 'middle' }));

  bottomNav(els, 0);
  return { name: 'Dashboard', elements: els };
}

// ── SCREEN 2: TRANSACTIONS ─────────────────────────────────────────────────
function screen2() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  gridLines(els);
  statusBar(els);

  // Ghost text background
  ghostNumber(els, W / 2, 320, 'TXN', 180);

  sectionLabel(els, 20, 70, 'TRANSACTIONS');
  els.push(text(20, 90, 'April 2026', 22, P.t1, { fw: 700, font: 'JetBrains Mono' }));

  // Filter pills — one solid, rest hollow
  const filters = ['ALL', 'IN', 'OUT', 'PENDING'];
  filters.forEach((f, i) => {
    const fx = 20 + i * 76;
    if (i === 0) {
      // Solid active pill
      els.push(rect(fx, 104, 60, 22, P.t1, { rx: 11 }));
      els.push(text(fx + 30, 119, f, 8, P.bg, { anchor: 'middle', ls: 1.5, fw: 700 }));
    } else {
      // Hollow inactive pill
      els.push(rect(fx, 104, 60, 22, P.hollow, { rx: 11, stroke: P.border, sw: 0.7 }));
      els.push(text(fx + 30, 119, f, 8, P.t3, { anchor: 'middle', ls: 1.5 }));
    }
  });

  // Transaction list
  const txns = [
    { name: 'GITHUB',       cat: 'TOOLS',    amt: '-$4.00',   date: 'APR 13' },
    { name: 'SALARY',       cat: 'INCOME',   amt: '+$6,240',  date: 'APR 01' },
    { name: 'VERCEL',       cat: 'INFRA',    amt: '-$20.00',  date: 'APR 03' },
    { name: 'COFFEE CO.',   cat: 'FOOD',     amt: '-$6.40',   date: 'APR 05' },
    { name: 'LINEAR',       cat: 'TOOLS',    amt: '-$8.00',   date: 'APR 07' },
    { name: 'TRANSFER',     cat: 'SAVINGS',  amt: '+$800',    date: 'APR 08' },
    { name: 'ANTHROPIC',    cat: 'INCOME',   amt: '+$2,400',  date: 'APR 10' },
    { name: 'FIGMA',        cat: 'TOOLS',    amt: '-$15.00',  date: 'APR 11' },
  ];

  const listStartY = 148;
  txns.forEach((t, i) => {
    const ty = listStartY + i * 56;
    const isPos = t.amt.startsWith('+');

    // Row separator
    divider(els, ty, 20, W - 20);

    // Date — monospace, small, muted
    els.push(text(20, ty + 16, t.date, 8, P.t3, { ls: 0.5 }));

    // Category badge
    els.push(rect(20, ty + 22, 50, 16, P.card, { rx: 2 }));
    els.push(text(45, ty + 33, t.cat, 7, P.t3, { anchor: 'middle', ls: 0.5 }));

    // Name — solid vs hollow alternating (Uptec pattern)
    if (i % 2 === 0) {
      // Solid name
      els.push(text(80, ty + 25, t.name, 11, P.t1, { fw: 600, ls: 0.3 }));
    } else {
      // Hollow name (outline/stroke text)
      els.push(text(80, ty + 25, t.name, 11, P.hollow, {
        stroke: 'rgba(255,255,255,0.8)',
        sw: 0.6,
        fw: 600,
        ls: 0.3,
      }));
    }

    // Amount
    els.push(text(W - 20, ty + 25, t.amt, 12,
      isPos ? P.t1 : P.t2,
      { anchor: 'end', fw: 700 }));
  });

  divider(els, listStartY + txns.length * 56, 20, W - 20);

  // Total row
  const totY = listStartY + txns.length * 56 + 18;
  els.push(text(20, totY, 'TOTAL OUT', 9, P.t3, { ls: 1.5 }));
  els.push(text(W - 20, totY, '-$53.40', 14, P.t1, { anchor: 'end', fw: 700 }));

  // Mini sparkline bar chart for daily spend
  const chartY = totY + 36;
  sectionLabel(els, 20, chartY, 'DAILY PATTERN');
  divider(els, chartY + 6);
  const dayVals = [0, 24, 6.4, 0, 8, 15, 4];
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const barW2 = 28, barMaxH = 44;
  const maxV = Math.max(...dayVals);
  dayVals.forEach((v, i) => {
    const bx = 20 + i * 48;
    const bh = maxV > 0 ? (v / maxV) * barMaxH : 2;
    const by = chartY + 60 - bh;
    els.push(rect(bx, by, barW2, bh,
      `rgba(255,255,255,${0.15 + (v / maxV) * 0.65})`, { rx: 2 }));
    els.push(text(bx + barW2 / 2, chartY + 72, dayLabels[i], 7, P.t3, { anchor: 'middle' }));
    if (v > 0) {
      els.push(text(bx + barW2 / 2, by - 4, `$${v}`, 6, P.t4, { anchor: 'middle' }));
    }
  });

  bottomNav(els, 1);
  return { name: 'Transactions', elements: els };
}

// ── SCREEN 3: SPENDING ANALYSIS ────────────────────────────────────────────
function screen3() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  gridLines(els);
  statusBar(els);

  // Ghost text
  ghostNumber(els, W / 2, 250, '%', 280);

  sectionLabel(els, 20, 70, 'ANALYSIS');
  els.push(text(20, 92, 'Spending', 28, P.t1, { fw: 700 }));
  els.push(text(20, 116, 'Breakdown', 28, P.hollow, {
    stroke: 'rgba(255,255,255,0.7)',
    sw: 0.8,
    fw: 700,
  }));

  // Period toggle
  ['1W', '1M', '3M', '1Y'].forEach((p, i) => {
    const px = 20 + i * 58;
    if (i === 1) {
      els.push(rect(px, 132, 42, 18, P.t1, { rx: 9 }));
      els.push(text(px + 21, 144, p, 8, P.bg, { anchor: 'middle', fw: 700 }));
    } else {
      els.push(text(px + 21, 144, p, 8, P.t3, { anchor: 'middle', ls: 0.5 }));
    }
  });

  // Spending categories as horizontal bars
  const cats = [
    { label: 'TOOLS',     val: '$47',    pct: 88 },
    { label: 'INFRA',     val: '$44',    pct: 82 },
    { label: 'FOOD',      val: '$28',    pct: 52 },
    { label: 'TRANSPORT', val: '$18',    pct: 34 },
    { label: 'HEALTH',    val: '$12',    pct: 22 },
    { label: 'OTHER',     val: '$6',     pct: 11 },
  ];

  const barStartY = 175;
  const barW = W - 120;

  cats.forEach((c, i) => {
    const by = barStartY + i * 68;

    // Category label — alternating solid/hollow
    if (i % 2 === 0) {
      els.push(text(20, by + 16, c.label, 9, P.t1, { ls: 1.5, fw: 600 }));
    } else {
      els.push(text(20, by + 16, c.label, 9, P.hollow, {
        stroke: 'rgba(255,255,255,0.7)', sw: 0.5, ls: 1.5, fw: 600
      }));
    }

    // Value
    els.push(text(W - 20, by + 16, c.val, 11, P.t2, { anchor: 'end', fw: 600 }));

    // Bar track
    els.push(rect(20, by + 24, barW + 60, 6, P.card, { rx: 3 }));

    // Bar fill — monochrome, opacity varies by amount
    const fillOpacity = 0.3 + (c.pct / 100) * 0.7;
    els.push(rect(20, by + 24, (barW + 60) * (c.pct / 100), 6,
      `rgba(255,255,255,${fillOpacity.toFixed(2)})`, { rx: 3 }));

    // Percentage tick
    els.push(text(20 + (barW + 60) * (c.pct / 100) + 6, by + 31,
      `${c.pct}%`, 8, P.t3, { fw: 500 }));
  });

  // Monthly total block
  const totBlockY = barStartY + cats.length * 68 + 12;
  els.push(rect(20, totBlockY, W - 40, 64, P.card, { rx: 6 }));
  els.push(line(20, totBlockY, W - 20, totBlockY, P.border, { sw: 0.5 }));
  els.push(text(32, totBlockY + 24, 'MONTHLY SPEND', 9, P.t3, { ls: 2 }));
  els.push(text(32, totBlockY + 46, '$155.00', 22, P.t1, { fw: 700 }));
  els.push(text(W - 32, totBlockY + 46, '↓ 12% vs last month', 9, P.t2, { anchor: 'end' }));

  bottomNav(els, 2);
  return { name: 'Analysis', elements: els };
}

// ── SCREEN 4: BUDGETS ──────────────────────────────────────────────────────
function screen4() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  gridLines(els);
  statusBar(els);

  ghostNumber(els, W / 2, 280, '∞', 220);

  sectionLabel(els, 20, 70, 'BUDGETS');
  els.push(text(20, 92, 'April', 32, P.t1, { fw: 700 }));
  els.push(text(98, 92, 'Caps', 32, P.hollow, {
    stroke: 'rgba(255,255,255,0.6)', sw: 0.7, fw: 700
  }));

  const budgets = [
    { cat: 'TOOLS',     budget: 60,  spent: 47,  left: 13  },
    { cat: 'FOOD',      budget: 200, spent: 28,  left: 172 },
    { cat: 'INFRA',     budget: 80,  spent: 44,  left: 36  },
    { cat: 'TRAVEL',    budget: 300, spent: 0,   left: 300 },
    { cat: 'HEALTH',    budget: 100, spent: 12,  left: 88  },
  ];

  const cardStartY = 115;
  budgets.forEach((b, i) => {
    const cy = cardStartY + i * 108;
    const pct = Math.round((b.spent / b.budget) * 100);
    const isOver = pct > 80;

    els.push(rect(20, cy, W - 40, 94, P.card, { rx: 6 }));

    // Category — alternating hollow
    if (i % 2 === 1) {
      els.push(text(32, cy + 26, b.cat, 12, P.hollow, {
        stroke: 'rgba(255,255,255,0.8)', sw: 0.6, ls: 1.5, fw: 700
      }));
    } else {
      els.push(text(32, cy + 26, b.cat, 12, P.t1, { ls: 1.5, fw: 700 }));
    }

    // Spent / Budget
    els.push(text(W - 32, cy + 26, `$${b.spent} / $${b.budget}`, 10, P.t2, { anchor: 'end' }));

    // Progress bar
    const bw = W - 80;
    els.push(rect(32, cy + 38, bw, 8, P.border, { rx: 4 }));
    const filledW = bw * (pct / 100);
    // Over budget: near-white; normal: dimmer
    const fillOpacity = isOver ? 0.9 : 0.5 + (pct / 100) * 0.3;
    els.push(rect(32, cy + 38, filledW, 8,
      `rgba(255,255,255,${fillOpacity.toFixed(2)})`, { rx: 4 }));

    // Left text
    els.push(text(32, cy + 68, `$${b.left} remaining`, 11, P.t1, { fw: 500 }));
    els.push(text(W - 32, cy + 68, `${pct}%`, 11, P.t3, { anchor: 'end' }));

    // Over-budget warning (hollow badge)
    if (isOver) {
      els.push(rect(W - 32 - 52, cy + 58, 52, 16, P.hollow, {
        rx: 8, stroke: 'rgba(255,255,255,0.7)', sw: 0.6
      }));
      els.push(text(W - 32 - 26, cy + 69, 'NEAR CAP', 6, P.t2, {
        anchor: 'middle', ls: 0.8
      }));
    }

    divider(els, cy + 94 - 1, 20, W - 20);
  });

  // Add budget CTA
  const addY = cardStartY + budgets.length * 108 + 12;
  els.push(rect(20, addY, W - 40, 40, P.hollow, { rx: 6, stroke: P.border, sw: 0.8 }));
  els.push(text(W / 2, addY + 24, '+ ADD BUDGET', 10, P.t3, { anchor: 'middle', ls: 2 }));

  bottomNav(els, 3);
  return { name: 'Budgets', elements: els };
}

// ── SCREEN 5: GOALS ────────────────────────────────────────────────────────
function screen5() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  gridLines(els);
  statusBar(els);

  ghostNumber(els, W / 2, 260, '◎', 260);

  sectionLabel(els, 20, 70, 'GOALS');
  els.push(text(20, 92, 'Milestones', 26, P.t1, { fw: 700 }));

  const goals = [
    { name: 'EMERGENCY FUND',  target: 10000, saved: 7200, months: 3   },
    { name: 'JAPAN TRIP',      target: 4500,  saved: 1800, months: 7   },
    { name: 'NEW LAPTOP',      target: 3500,  saved: 3500, months: 0, done: true },
    { name: 'INDIE PROJECT',   target: 2000,  saved: 420,  months: 14  },
  ];

  const gStartY = 112;
  goals.forEach((g, i) => {
    const gy = gStartY + i * 130;
    const pct = Math.min(100, Math.round((g.saved / g.target) * 100));

    // Card
    els.push(rect(20, gy, W - 40, 116, g.done ? P.surf : P.card, { rx: 8 }));

    // Done marker or index
    if (g.done) {
      // Checkmark — hollow circle
      els.push(circle(W - 42, gy + 28, 10, P.hollow, { stroke: P.t1, sw: 1 }));
      els.push(text(W - 42, gy + 32, '✓', 9, P.t1, { anchor: 'middle' }));
    } else {
      els.push(text(W - 36, gy + 26, `${pct}%`, 10, P.t3, { anchor: 'end', fw: 600 }));
    }

    // Goal name — hollow for done, solid for active
    if (g.done) {
      els.push(text(32, gy + 30, g.name, 11, P.hollow, {
        stroke: 'rgba(255,255,255,0.6)', sw: 0.5, ls: 1.2, fw: 700
      }));
    } else {
      els.push(text(32, gy + 30, g.name, 11, P.t1, { ls: 1.2, fw: 700 }));
    }

    // Saved / Target
    els.push(text(32, gy + 50, `$${g.saved.toLocaleString()}`, 18, P.t1, { fw: 700 }));
    els.push(text(32 + 78, gy + 50, `/ $${g.target.toLocaleString()}`, 13, P.t3, { fw: 400 }));

    // Bar
    const bw = W - 64;
    els.push(rect(32, gy + 62, bw, 6, P.border, { rx: 3 }));
    els.push(rect(32, gy + 62, bw * (pct / 100), 6,
      g.done ? 'rgba(255,255,255,0.9)' : `rgba(255,255,255,${0.35 + (pct / 100) * 0.5})`,
      { rx: 3 }));

    // ETA
    if (!g.done) {
      els.push(text(32, gy + 90, `≈ ${g.months} months to target`, 9, P.t3, { ls: 0.3 }));
    } else {
      els.push(text(32, gy + 90, 'GOAL REACHED', 9, P.t2, { ls: 2, fw: 600 }));
    }

    // Monthly contribution
    if (!g.done) {
      const monthly = Math.ceil((g.target - g.saved) / g.months);
      els.push(text(W - 32, gy + 90, `$${monthly}/mo`, 9, P.t2, { anchor: 'end' }));
    }
  });

  // Bottom totals strip
  const totalSavedY = gStartY + goals.length * 130 + 12;
  divider(els, totalSavedY, 20, W - 20);
  els.push(text(20, totalSavedY + 20, 'TOTAL SAVED', 9, P.t3, { ls: 2 }));
  els.push(text(W - 20, totalSavedY + 20, '$12,920', 16, P.t1, { anchor: 'end', fw: 700 }));
  els.push(text(20, totalSavedY + 36, 'across 4 goals', 9, P.t4 ));
  // Pill tags
  pill(els, 20, totalSavedY + 48, 'ON TRACK', false);
  pill(els, 82, totalSavedY + 48, '1 DONE', true);

  bottomNav(els, 3);
  return { name: 'Goals', elements: els };
}

// ── SCREEN 6: PROFILE / SETTINGS ───────────────────────────────────────────
function screen6() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  gridLines(els);
  statusBar(els);

  // Ghost initials
  ghostNumber(els, W / 2, 220, 'AK', 200);

  sectionLabel(els, 20, 70, 'PROFILE');

  // Avatar — geometric monochrome
  const avX = W / 2, avY = 130;
  els.push(circle(avX, avY, 34, P.hollow, { stroke: P.t1, sw: 1 }));
  els.push(circle(avX, avY, 24, P.hollow, { stroke: P.t3, sw: 0.5 }));
  els.push(text(avX, avY + 7, 'AK', 18, P.t1, { anchor: 'middle', fw: 700 }));

  // Name + handle
  els.push(text(avX, 180, 'ALEX KIMURA', 16, P.t1, { anchor: 'middle', fw: 700, ls: 2 }));
  els.push(text(avX, 198, '@akimura', 11, P.t3, { anchor: 'middle' }));

  // Streak/stats strip
  const statY = 220;
  const stats = [
    { label: 'STREAK',  val: '47d'  },
    { label: 'ENTRIES', val: '312'  },
    { label: 'GOALS',   val: '3/4'  },
  ];
  stats.forEach((s, i) => {
    const sx = 40 + i * ((W - 80) / 2);
    els.push(text(sx + 35, statY + 16, s.val, 16, P.t1, { anchor: 'middle', fw: 700 }));
    els.push(text(sx + 35, statY + 32, s.label, 7, P.t3, { anchor: 'middle', ls: 1.5 }));
    if (i < stats.length - 1) {
      els.push(line(sx + 85, statY + 8, sx + 85, statY + 36, P.border, { sw: 0.5 }));
    }
  });

  // Settings list
  const settingsY = 278;
  divider(els, settingsY, 20, W - 20);

  const settings = [
    { label: 'CURRENCY',       val: 'USD ($)' },
    { label: 'NOTIFICATIONS',  val: 'ON' },
    { label: 'SYNC',           val: 'EVERY 1HR' },
    { label: 'DATA EXPORT',    val: '→' },
    { label: 'PRIVACY',        val: '→' },
    { label: 'APPEARANCE',     val: 'DARK / MONO' },
  ];
  settings.forEach((s, i) => {
    const sy = settingsY + 10 + i * 50;
    els.push(rect(16, sy, W - 32, 38, P.bg, { rx: 3 }));
    els.push(text(20, sy + 22, s.label, 10, P.t2, { ls: 1.2 }));

    // Value — alternating hollow/solid
    if (i % 2 === 0) {
      els.push(text(W - 20, sy + 22, s.val, 10, P.t1, { anchor: 'end', fw: 600 }));
    } else {
      els.push(text(W - 20, sy + 22, s.val, 10, P.hollow, {
        anchor: 'end', stroke: 'rgba(255,255,255,0.7)', sw: 0.5, fw: 600
      }));
    }
    divider(els, sy + 38, 20, W - 20);
  });

  // Version
  const verY = settingsY + 10 + settings.length * 50 + 16;
  els.push(text(W / 2, verY, 'MONO v1.0.0 · BUILT IN THE DARK', 8, P.t4, { anchor: 'middle', ls: 1 }));

  // Decorative corner brackets around avatar
  cornerTicks(els, avX - 52, avY - 46, 8, 0.25);

  // Sign out row
  const soY = verY + 22;
  els.push(rect(20, soY, W - 40, 36, P.hollow, { rx: 6, stroke: P.border, sw: 0.7 }));
  els.push(text(W / 2, soY + 22, 'SIGN OUT', 10, P.t3, { anchor: 'middle', ls: 3 }));

  bottomNav(els, 4);
  return { name: 'Profile', elements: els };
}

// ── ASSEMBLE PEN ───────────────────────────────────────────────────────────
const screens = [screen1(), screen2(), screen3(), screen4(), screen5(), screen6()];
const totalElements = screens.reduce((s, sc) => s + sc.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'MONO — Finance stripped bare',
    author: 'RAM',
    date: new Date().toISOString().slice(0, 10),
    theme: 'dark',
    palette: 'monochrome-black',
    heartbeat: 14,
    screens: screens.length,
    elements: totalElements,
    inspiration: 'Uptec on DarkModeDesign.com — zero-color, alternating solid/hollow type',
  },
  screens: screens.map(s => ({
    name: s.name,
    width: W,
    height: H,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"></svg>`,
    elements: s.elements,
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`MONO: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
