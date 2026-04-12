/**
 * FLOAT — Cash flow clarity for creators
 * DARK theme: deep navy-black, mint accent, data-dense financial UI
 * Inspired by:
 *   - Midday.ai (featured on darkmodedesign.com) — near-black #0D0F1A bg,
 *     clean transaction tables, "The business stack for modern founders"
 *   - Evervault customers page — card-based data display, no visual noise
 *   - Trend: "ambient financial intelligence" — data that feels calm, not alarming
 * Challenge: tabbed feature screens + sparkline-style data mini-charts in dark SaaS style
 */

const fs = require('fs');

const W = 390, H = 844;

const C = {
  bg:        '#0D0F1A',   // near-black deep navy
  surface:   '#141627',   // card bg
  card:      '#1B1E35',   // elevated card
  border:    '#252848',   // subtle borders
  accent:    '#3DFFC0',   // mint green (cash in / positive)
  accent2:   '#FF6B6B',   // coral red (expenses / overdue)
  blue:      '#5B8AF0',   // indigo blue (pending)
  amber:     '#FFBB3F',   // amber (warnings)
  white:     '#E8EAF2',   // off-white text
  muted:     'rgba(232,234,242,0.40)',
  dim:       'rgba(232,234,242,0.18)',
  accentDim: 'rgba(61,255,192,0.10)',
  redDim:    'rgba(255,107,107,0.12)',
  blueDim:   'rgba(91,138,240,0.12)',
  amberDim:  'rgba(255,187,63,0.10)',
};

function mkId() { return Math.random().toString(36).slice(2, 10); }

function frame(label, y_offset, children) {
  return {
    id: mkId(), type: 'frame', name: label,
    x: 0, y: y_offset, width: W, height: H,
    fill: C.bg, clip: true, children,
  };
}

function rect(x, y, w, h, fill, opts = {}) {
  return {
    id: mkId(), type: 'rectangle',
    x, y, width: w, height: h, fill,
    cornerRadius: opts.r || 0,
    opacity: opts.opacity || 1,
    ...(opts.stroke ? { stroke: opts.stroke, strokeWidth: opts.sw || 1 } : {}),
  };
}

function txt(content, x, y, opts = {}) {
  return {
    id: mkId(), type: 'text',
    x, y, content: String(content),
    fontSize: opts.size || 14,
    fontWeight: opts.weight || 400,
    fontFamily: opts.mono ? 'JetBrains Mono' : 'Inter',
    fill: opts.color || C.white,
    width: opts.width || (W - x - 16),
    letterSpacing: opts.ls || 0,
    opacity: opts.opacity || 1,
    textAlign: opts.align || 'left',
  };
}

function ellipse(x, y, w, h, fill) {
  return { id: mkId(), type: 'ellipse', x, y, width: w, height: h, fill };
}

// ── Status Bar ──────────────────────────────────────────────────────────────
function statusBar(c) {
  c.push(rect(0, 0, W, 44, C.bg));
  c.push(txt('9:41', 16, 14, { size: 14, weight: 600, mono: true, color: C.white }));
  c.push(txt('FLOAT', W/2-22, 14, { size: 12, weight: 800, ls: 3, color: C.accent }));
  c.push(txt('●●● WiFi ▮▮▮▮', W-130, 14, { size: 10, color: C.muted, width: 114 }));
}

// ── Bottom Nav ──────────────────────────────────────────────────────────────
function navBar(activeIdx, c) {
  c.push(rect(0, H-82, W, 82, C.surface));
  c.push(rect(0, H-82, W, 1, C.border));
  const items = [
    { label: 'Overview', icon: '◈' },
    { label: 'Invoices', icon: '≡' },
    { label: 'Forecast', icon: '∿' },
    { label: 'Clients',  icon: '◉' },
    { label: 'Insights', icon: '⟐' },
  ];
  items.forEach((item, i) => {
    const nx = i * (W/5) + W/10;
    const active = i === activeIdx;
    c.push(txt(item.icon, nx-10, H-66, { size: 20, color: active ? C.accent : C.dim, align: 'center', width: 20 }));
    c.push(txt(item.label, nx-22, H-42, { size: 9, color: active ? C.accent : C.dim, align: 'center', width: 44, ls: 0.3 }));
    if (active) c.push(ellipse(nx-3, H-74, 6, 3, C.accent));
  });
}

// ── Mini sparkline (fake bar chart) ────────────────────────────────────────
function sparkBars(x, y, w, h, values, color, c) {
  const n = values.length;
  const bw = Math.floor((w - (n-1)*2) / n);
  const maxV = Math.max(...values);
  values.forEach((v, i) => {
    const bh = Math.round((v/maxV) * h);
    const bx = x + i*(bw+2);
    const by = y + h - bh;
    c.push(rect(bx, by, bw, bh, color, { r: 2, opacity: 0.7 }));
  });
}

// ── Thin progress bar ───────────────────────────────────────────────────────
function progressBar(x, y, w, pct, trackCol, fillCol, c, r = 3) {
  c.push(rect(x, y, w, 6, trackCol, { r }));
  c.push(rect(x, y, Math.round(w * pct), 6, fillCol, { r }));
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 1 — OVERVIEW DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
function screen1() {
  const c = [];
  statusBar(c);
  c.push(rect(0, 44, W, 1, C.border));

  // Header
  c.push(txt('Good morning, Alex', 20, 56, { size: 13, color: C.muted }));
  c.push(txt('Cash Position', 20, 74, { size: 22, weight: 700 }));

  // Main balance card
  c.push(rect(16, 108, W-32, 148, C.surface, { r: 18 }));
  c.push(rect(16, 108, W-32, 148, C.accentDim, { r: 18 }));
  c.push(txt('Available Balance', 32, 126, { size: 11, color: C.muted, ls: 0.5 }));
  c.push(txt('$28,430', 32, 144, { size: 36, weight: 800, color: C.white }));
  c.push(txt('.82', 32 + 126, 156, { size: 18, weight: 600, color: C.muted }));

  // Delta badge
  c.push(rect(32, 186, 84, 22, C.accentDim, { r: 11 }));
  c.push(txt('↑ +$4,200 MTD', 40, 191, { size: 10, color: C.accent, width: 70 }));

  // Month sparkline on right
  const sparks = [45,62,38,71,55,80,68,92,73,88,95,78];
  sparkBars(W-112, 126, 88, 66, sparks, C.accent, c);
  c.push(txt('Mar cash flow', W-112, 200, { size: 9, color: C.muted, width: 88, align: 'center' }));

  // Divider
  c.push(rect(32, 218, W-64, 1, C.border));
  c.push(txt('MARCH 2026', 32, 230, { size: 9, color: C.muted, ls: 2 }));
  c.push(txt('$26,800 in · $22,600 out', 32, 246, { size: 11, color: C.white }));

  // Metrics row — 3 cards
  const metrics = [
    { label: 'Outstanding', value: '$12,400', sub: '4 invoices', col: C.blue },
    { label: 'Overdue',     value: '$2,100',  sub: '1 invoice',  col: C.accent2 },
    { label: 'Forecast',    value: '+$8k',    sub: '30 days',    col: C.accent },
  ];
  const mW = (W-48)/3;
  metrics.forEach((m, i) => {
    const mx = 16 + i*(mW+8);
    c.push(rect(mx, 278, mW, 76, C.card, { r: 14 }));
    c.push(txt(m.label, mx+10, 292, { size: 9, color: C.muted, ls: 0.5 }));
    c.push(txt(m.value, mx+10, 308, { size: 18, weight: 700, color: m.col }));
    c.push(txt(m.sub, mx+10, 334, { size: 10, color: C.dim }));
  });

  // Recent activity
  c.push(txt('RECENT ACTIVITY', 20, 370, { size: 9, color: C.muted, ls: 1.8 }));

  const txns = [
    { name: 'Acme Corp',        type: 'Invoice paid',   amt: '+$4,200', col: C.accent, ago: '2h ago'  },
    { name: 'AWS Services',     type: 'Infrastructure',  amt: '-$382',   col: C.accent2, ago: '5h ago'  },
    { name: 'Stripe Payout',    type: 'Transfer',        amt: '+$1,800', col: C.accent, ago: 'Yesterday'},
    { name: 'Notion Pro',       type: 'Subscription',    amt: '-$16',    col: C.accent2, ago: 'Yesterday'},
    { name: 'Studio Rental',    type: 'Expense',         amt: '-$650',   col: C.accent2, ago: 'Mar 24'  },
  ];

  txns.forEach((t, i) => {
    const ty = 390 + i*68;
    c.push(rect(16, ty, W-32, 58, C.surface, { r: 12 }));
    // Avatar
    c.push(rect(28, ty+14, 30, 30, C.card, { r: 10 }));
    c.push(txt(t.name[0], 36, ty+20, { size: 14, weight: 700, color: t.col === C.accent ? C.accent : C.accent2, width: 14 }));
    // Text
    c.push(txt(t.name, 70, ty+12, { size: 13, weight: 600 }));
    c.push(txt(t.type + ' · ' + t.ago, 70, ty+30, { size: 10, color: C.muted }));
    // Amount
    c.push(txt(t.amt, W-80, ty+21, { size: 14, weight: 700, color: t.col, width: 68, align: 'right' }));
  });

  navBar(0, c);
  return frame('Overview', 0, c);
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 2 — INVOICES
// ═══════════════════════════════════════════════════════════════════════════
function screen2() {
  const c = [];
  statusBar(c);
  c.push(rect(0, 44, W, 1, C.border));

  c.push(txt('Invoices', 20, 56, { size: 22, weight: 700 }));

  // New invoice button
  c.push(rect(W-110, 56, 94, 32, C.accent, { r: 16 }));
  c.push(txt('+ New', W-96, 63, { size: 13, weight: 700, color: C.bg, width: 66, align: 'center' }));

  // Tab filter
  const tabs = ['All', 'Pending', 'Paid', 'Overdue'];
  const tabW = (W-32)/4;
  c.push(rect(16, 100, W-32, 36, C.surface, { r: 18 }));
  tabs.forEach((tab, i) => {
    const tx = 16 + i*tabW;
    const active = i === 1;
    if (active) c.push(rect(tx+3, 103, tabW-6, 30, C.accent, { r: 15 }));
    c.push(txt(tab, tx, 111, { size: 12, weight: active ? 700 : 400, color: active ? C.bg : C.muted, width: tabW, align: 'center' }));
  });

  // Summary strip
  c.push(txt('4 invoices · $12,400 total', 20, 150, { size: 12, color: C.muted }));

  // Invoices list
  const invoices = [
    { client: 'Vertex Labs',    num: '#INV-041', amt: '$5,800', due: 'Due Apr 2',  status: 'Pending', col: C.blue,    dCol: C.blueDim  },
    { client: 'Mosaic Creative',num: '#INV-040', amt: '$2,400', due: 'Due Apr 5',  status: 'Pending', col: C.blue,    dCol: C.blueDim  },
    { client: 'Orbit Systems',  num: '#INV-039', amt: '$2,100', due: 'Due Mar 20', status: 'Overdue', col: C.accent2, dCol: C.redDim   },
    { client: 'Peak Media',     num: '#INV-038', amt: '$2,100', due: 'Due Mar 30', status: 'Pending', col: C.blue,    dCol: C.blueDim  },
  ];

  invoices.forEach((inv, i) => {
    const iy = 172 + i*92;
    c.push(rect(16, iy, W-32, 80, C.surface, { r: 14 }));
    if (inv.status === 'Overdue') {
      c.push(rect(16, iy, 4, 80, C.accent2, { r: 2 }));
    }
    // Logo placeholder
    c.push(rect(28, iy+14, 36, 36, C.card, { r: 10 }));
    c.push(txt(inv.client[0]+inv.client.split(' ')[1]?.[0], 31, iy+22, { size: 13, weight: 700, color: inv.col, width: 30 }));
    // Client + invoice num
    c.push(txt(inv.client, 76, iy+14, { size: 14, weight: 600 }));
    c.push(txt(inv.num, 76, iy+32, { size: 10, color: C.muted, mono: true }));
    // Due date
    c.push(txt(inv.due, 76, iy+50, { size: 10, color: inv.status==='Overdue' ? C.accent2 : C.muted }));
    // Amount
    c.push(txt(inv.amt, W-88, iy+16, { size: 18, weight: 700, width: 72, align: 'right' }));
    // Status badge
    c.push(rect(W-88, iy+44, 72, 22, inv.dCol, { r: 11 }));
    c.push(txt(inv.status, W-85, iy+49, { size: 10, color: inv.col, width: 66, align: 'center' }));
  });

  // Collection progress
  const progressY = 552;
  c.push(rect(16, progressY, W-32, 58, C.card, { r: 14 }));
  c.push(txt('Collected this month', 32, progressY+12, { size: 12, weight: 600 }));
  c.push(txt('$8,600 of $21,000', W-110, progressY+12, { size: 11, color: C.muted, width: 94, align: 'right' }));
  progressBar(32, progressY+34, W-64, 0.41, C.border, C.accent, c);

  navBar(1, c);
  return frame('Invoices', 900, c);
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 3 — FORECAST
// ═══════════════════════════════════════════════════════════════════════════
function screen3() {
  const c = [];
  statusBar(c);
  c.push(rect(0, 44, W, 1, C.border));

  c.push(txt('Cash Forecast', 20, 56, { size: 22, weight: 700 }));
  c.push(txt('30-day projection · updated now', 20, 82, { size: 11, color: C.muted }));

  // Period tabs
  const periods = ['30D', '60D', '90D'];
  const pTabW = 72;
  const pTabX = W - 3*pTabW - 16;
  c.push(rect(pTabX, 56, 3*pTabW, 30, C.surface, { r: 15 }));
  periods.forEach((p, i) => {
    const px = pTabX + i*pTabW;
    const active = i === 0;
    if (active) c.push(rect(px+2, 58, pTabW-4, 26, C.accent, { r: 13 }));
    c.push(txt(p, px, 65, { size: 12, weight: active ? 700 : 400, color: active ? C.bg : C.muted, width: pTabW, align: 'center' }));
  });

  // Big forecast number
  c.push(rect(16, 106, W-32, 110, C.surface, { r: 18 }));
  c.push(rect(16, 106, W-32, 110, C.accentDim, { r: 18 }));
  c.push(txt('PROJECTED BALANCE', 32, 122, { size: 9, color: C.muted, ls: 2 }));
  c.push(txt('$34,820', 32, 140, { size: 34, weight: 800, color: C.white }));
  c.push(txt('by April 25, 2026', 32, 182, { size: 11, color: C.muted }));
  c.push(rect(W-120, 140, 84, 26, C.accentDim, { r: 13 }));
  c.push(txt('↑ +$6,390 gain', W-116, 148, { size: 10, color: C.accent, width: 76, align: 'center' }));
  c.push(txt('Confidence: HIGH', W-116, 166, { size: 9, color: C.muted, width: 76, align: 'center' }));

  // Cash flow chart area
  c.push(txt('PROJECTED CASH FLOW', 20, 234, { size: 9, color: C.muted, ls: 1.8 }));
  c.push(rect(16, 254, W-32, 120, C.surface, { r: 14 }));

  // Chart grid lines
  [0, 40, 80].forEach(dy => {
    c.push(rect(36, 262+dy, W-72, 1, C.border));
  });

  // Income bars (positive)
  const inBars = [82,75,90,68,95,100,78,85,92,88,96,82,74];
  // Expense bars (negative, shown below)
  const exBars = [55,60,48,52,70,45,58,62,50,55,42,48,55];

  inBars.forEach((v, i) => {
    const bx = 36 + i*((W-72)/13);
    const bh = Math.round(v/100*68);
    c.push(rect(Math.round(bx), 342-bh, 16, bh, C.accent, { r: 2, opacity: i<6 ? 1 : 0.5 }));
    const eh = Math.round(exBars[i]/100*30);
    c.push(rect(Math.round(bx), 342, 16, eh, C.accent2, { r: 2, opacity: i<6 ? 1 : 0.5 }));
  });

  // Legend
  c.push(rect(36, 358, 10, 10, C.accent, { r: 2 }));
  c.push(txt('Income', 50, 358, { size: 10, color: C.muted, width: 60 }));
  c.push(rect(120, 358, 10, 10, C.accent2, { r: 2 }));
  c.push(txt('Expenses', 134, 358, { size: 10, color: C.muted, width: 70 }));
  c.push(txt('← actual  projected →', W-148, 358, { size: 9, color: C.dim, width: 132 }));

  // Upcoming events
  c.push(txt('UPCOMING', 20, 392, { size: 9, color: C.muted, ls: 1.8 }));

  const events = [
    { date: 'Apr 2',  label: 'Vertex Labs invoice due',      amt: '+$5,800', col: C.accent },
    { date: 'Apr 5',  label: 'Mosaic Creative invoice due',   amt: '+$2,400', col: C.accent },
    { date: 'Apr 10', label: 'AWS monthly billing',           amt: '-$382',   col: C.accent2 },
    { date: 'Apr 15', label: 'Contractor payment',            amt: '-$1,200', col: C.accent2 },
    { date: 'Apr 20', label: 'Orbit Systems — chase follow-up',amt: '+$2,100', col: C.amber },
  ];

  events.forEach((ev, i) => {
    const ey = 412 + i*60;
    c.push(rect(16, ey, W-32, 50, C.surface, { r: 12 }));
    c.push(txt(ev.date, 28, ey+8, { size: 10, color: C.muted, mono: true, width: 36 }));
    c.push(rect(70, ey+8, 1, 30, C.border));
    c.push(txt(ev.label, 82, ey+12, { size: 12, weight: 500, width: W-180 }));
    c.push(txt(ev.amt, W-72, ey+17, { size: 14, weight: 700, color: ev.col, width: 56, align: 'right' }));
  });

  navBar(2, c);
  return frame('Forecast', 1800, c);
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 4 — CLIENTS
// ═══════════════════════════════════════════════════════════════════════════
function screen4() {
  const c = [];
  statusBar(c);
  c.push(rect(0, 44, W, 1, C.border));

  c.push(txt('Clients', 20, 56, { size: 22, weight: 700 }));
  c.push(txt('Payment health scores', 20, 82, { size: 11, color: C.muted }));

  // Overall health banner
  c.push(rect(16, 104, W-32, 56, C.surface, { r: 14 }));
  c.push(txt('5 active clients', 32, 116, { size: 12 }));
  c.push(txt('Avg payment: 18 days', 32, 134, { size: 11, color: C.muted }));
  c.push(txt('Health: 72/100', W-132, 120, { size: 13, weight: 700, color: C.accent, width: 116, align: 'right' }));
  progressBar(W-132, 140, 116, 0.72, C.border, C.accent, c);

  c.push(txt('PAYMENT HEALTH', 20, 178, { size: 9, color: C.muted, ls: 1.8 }));

  const clients = [
    {
      name: 'Vertex Labs',     ltv: '$28,600', avgDays: 12,
      health: 94, badge: 'Excellent', badgeCol: C.accent, lastPay: '3 days ago',
      trend: [70,80,75,90,88,94],
    },
    {
      name: 'Mosaic Creative', ltv: '$14,200', avgDays: 22,
      health: 68, badge: 'Fair',      badgeCol: C.amber,  lastPay: '32 days ago',
      trend: [82,78,72,68,65,68],
    },
    {
      name: 'Orbit Systems',   ltv: '$9,800',  avgDays: 35,
      health: 42, badge: 'At Risk',   badgeCol: C.accent2,lastPay: '64 days ago',
      trend: [90,75,60,50,44,42],
    },
    {
      name: 'Peak Media',      ltv: '$22,100', avgDays: 15,
      health: 86, badge: 'Good',      badgeCol: C.accent, lastPay: '8 days ago',
      trend: [78,82,84,80,88,86],
    },
    {
      name: 'Silo Digital',    ltv: '$6,400',  avgDays: 20,
      health: 76, badge: 'Good',      badgeCol: C.accent, lastPay: '12 days ago',
      trend: [60,68,72,74,76,76],
    },
  ];

  clients.forEach((cl, i) => {
    const cy = 198 + i*108;
    c.push(rect(16, cy, W-32, 96, C.surface, { r: 16 }));

    // Left accent stripe for at-risk
    if (cl.health < 50) c.push(rect(16, cy, 4, 96, C.accent2, { r: 2 }));

    // Avatar circle
    c.push(ellipse(28, cy+24, 40, 40, C.card));
    c.push(txt(cl.name[0], 42, cy+33, { size: 16, weight: 700, color: cl.badgeCol, width: 16 }));

    // Name + LTV
    c.push(txt(cl.name, 80, cy+14, { size: 14, weight: 600 }));
    c.push(txt('LTV ' + cl.ltv + ' · Avg ' + cl.avgDays + 'd to pay', 80, cy+32, { size: 10, color: C.muted }));
    c.push(txt('Last paid: ' + cl.lastPay, 80, cy+50, { size: 10, color: C.dim }));

    // Score + badge
    c.push(txt(String(cl.health), W-92, cy+12, { size: 22, weight: 800, color: cl.badgeCol, width: 36, align: 'right' }));
    c.push(rect(W-76, cy+40, 60, 20, `rgba(${cl.badgeCol==='#3DFFC0'?'61,255,192':cl.badgeCol==='#FFBB3F'?'255,187,63':'255,107,107'},0.15)`, { r: 10 }));
    c.push(txt(cl.badge, W-73, cy+44, { size: 9, color: cl.badgeCol, width: 54, align: 'center' }));

    // Mini trend sparkline
    const sX = W - 92;
    const sY = cy+66;
    const vals = cl.trend;
    const mxV = Math.max(...vals);
    const mnV = Math.min(...vals);
    vals.forEach((v, j) => {
      const px = sX + j*11;
      const ph = Math.round((v-mnV)/(mxV-mnV||1)*16);
      c.push(rect(px, sY+16-ph, 8, ph+2, cl.badgeCol, { r: 1, opacity: 0.6 }));
    });
  });

  navBar(3, c);
  return frame('Clients', 2700, c);
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 5 — INSIGHTS (AI-surfaced patterns)
// ═══════════════════════════════════════════════════════════════════════════
function screen5() {
  const c = [];
  statusBar(c);
  c.push(rect(0, 44, W, 1, C.border));

  c.push(txt('Insights', 20, 56, { size: 22, weight: 700 }));
  c.push(txt('AI-surfaced patterns', 20, 82, { size: 11, color: C.muted }));

  // AI summary card
  c.push(rect(16, 104, W-32, 98, C.surface, { r: 18 }));
  c.push(rect(16, 104, W-32, 98, 'rgba(91,138,240,0.08)', { r: 18 }));
  c.push(txt('◈', 32, 118, { size: 20, color: C.blue }));
  c.push(txt('March Summary', 60, 116, { size: 13, weight: 600 }));
  c.push(txt('Your strongest month in Q1. Revenue up 22% vs Feb. \nOrbit Systems is your main risk — chase overdue invoice.', 32, 138, { size: 12, color: C.muted, width: W-64 }));
  c.push(txt('Updated 12 min ago', 32, 186, { size: 10, color: C.dim }));

  // Insight cards
  const insights = [
    {
      icon: '↑', iconCol: C.accent,
      title: 'Revenue Peak Detected',
      body: 'Your 3rd highest week on record — $9,400 received. Pattern: Vertex Labs pays 2 days early when invoiced on Tuesdays.',
      tag: 'Pattern',
      action: 'Set Tuesday cadence →',
    },
    {
      icon: '⚠', iconCol: C.amber,
      title: 'Slow Payer Alert',
      body: 'Mosaic Creative avg payment time increased from 18d → 22d this quarter. Consider shortening net terms or adding late fees.',
      tag: 'Risk',
      action: 'Update invoice terms →',
    },
    {
      icon: '◑', iconCol: C.blue,
      title: 'Q2 Readiness Score',
      body: 'Based on booked clients and forecast, you\'re at 78% of your $32k/mo target. You need one new client or upsell to hit goal.',
      tag: 'Forecast',
      action: 'See Q2 plan →',
    },
    {
      icon: '✦', iconCol: C.accent,
      title: 'Expense Optimization',
      body: 'Subscriptions total $312/mo. 3 tools haven\'t been used in 30 days. Potential savings: $96/mo.',
      tag: 'Savings',
      action: 'Review subscriptions →',
    },
  ];

  insights.forEach((ins, i) => {
    const iy = 218 + i*140;
    c.push(rect(16, iy, W-32, 126, C.surface, { r: 16 }));
    // Icon circle
    c.push(ellipse(28, iy+12, 32, 32, C.card));
    c.push(txt(ins.icon, 37, iy+19, { size: 16, color: ins.iconCol, width: 16 }));
    // Tag badge
    c.push(rect(W-80, iy+12, 64, 20, 'rgba(232,234,242,0.06)', { r: 10, stroke: C.border, sw: 1 }));
    c.push(txt(ins.tag, W-77, iy+17, { size: 9, color: C.muted, width: 58, align: 'center', ls: 0.5 }));
    // Title
    c.push(txt(ins.title, 72, iy+14, { size: 13, weight: 700, width: W-160 }));
    // Body
    c.push(txt(ins.body, 28, iy+52, { size: 11, color: C.muted, width: W-56 }));
    // Action link
    c.push(txt(ins.action, 28, iy+104, { size: 11, color: ins.iconCol, weight: 600, width: W-56 }));
  });

  navBar(4, c);
  return frame('Insights', 3600, c);
}

// ═══════════════════════════════════════════════════════════════════════════
// ASSEMBLE & WRITE PEN FILE
// ═══════════════════════════════════════════════════════════════════════════
const pen = {
  version: '2.8',
  name: 'FLOAT — Cash Flow Clarity for Creators',
  width: W,
  height: H * 5 + 40,
  fill: C.bg,
  children: [
    screen1(),
    screen2(),
    screen3(),
    screen4(),
    screen5(),
  ],
};

fs.writeFileSync('float.pen', JSON.stringify(pen, null, 2));
console.log('✓ float.pen written —', pen.children.length, 'screens');
console.log('  Total elements:', pen.children.reduce((s, sc) => s + sc.children.length, 0));
