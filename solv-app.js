'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'solv';
const W = 390, H = 844;

// ── Palette (Dark — elevation-based, inspired by DarkModeDesign.com)
const C = {
  bg:      '#0D0B13',   // near-black warm purple base
  s1:      '#141121',   // L1 surface
  s2:      '#1C1829',   // L2 card
  s3:      '#231F35',   // L3 elevated / active
  border:  'rgba(167,139,250,0.12)',
  acc:     '#A78BFA',   // lavender — primary accent
  acc2:    '#22D3EE',   // cyan — positive / income
  acc3:    '#F472B6',   // pink — overdue / alert
  acc4:    '#34D399',   // emerald — paid / success
  text:    '#EDE9FE',   // warm near-white
  sub:     '#A89FC5',   // secondary text
  muted:   'rgba(167,139,250,0.35)',
  danger:  '#F87171',   // overdue red
  warn:    '#FBBF24',   // warning amber
};

function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, width: w, height: h, fill,
    rx: opts.rx ?? 0, opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none', strokeWidth: opts.sw ?? 0,
  };
}
function text(x, y, content, size, fill, opts = {}) {
  return {
    type: 'text', x, y, content, fontSize: size, fill,
    fontWeight: opts.fw ?? 400, fontFamily: opts.font ?? 'Inter',
    textAnchor: opts.anchor ?? 'start',
    letterSpacing: opts.ls ?? 0, opacity: opts.opacity ?? 1,
  };
}
function circle(cx, cy, r, fill, opts = {}) {
  return { type: 'circle', cx, cy, r, fill, opacity: opts.opacity ?? 1, stroke: opts.stroke ?? 'none', strokeWidth: opts.sw ?? 0 };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return { type: 'line', x1, y1, x2, y2, stroke, strokeWidth: opts.sw ?? 1, opacity: opts.opacity ?? 1 };
}

// ── Shared components
function statusBar(elements) {
  elements.push(rect(0, 0, W, 50, C.bg));
  elements.push(text(20, 34, '9:41', 15, C.text, { fw: 600 }));
  elements.push(text(W - 20, 34, '●●● ▲ ▌▌', 13, C.sub, { anchor: 'end' }));
}

function bottomNav(elements, active) {
  // Glass nav bar
  elements.push(rect(0, H - 82, W, 82, C.s1));
  elements.push(line(0, H - 82, W, H - 82, C.border, { sw: 1 }));

  // Glow under active tab
  const tabs = ['home', 'pipeline', 'chart', 'users', 'bell'];
  const labels = ['Dash', 'Pipeline', 'Forecast', 'Clients', 'Alerts'];
  tabs.forEach((t, i) => {
    const tx = 39 + i * 78;
    const isActive = i === active;
    const col = isActive ? C.acc : C.sub;
    if (isActive) {
      elements.push(rect(tx - 24, H - 80, 48, 3, C.acc, { rx: 2, opacity: 0.85 }));
    }
    // icon dot placeholder
    elements.push(circle(tx, H - 56, isActive ? 10 : 9, isActive ? C.acc : C.sub, { opacity: isActive ? 0.25 : 0.12 }));
    elements.push(text(tx, H - 51, ['⌂','◈','◎','⊙','◉'][i], 13, col, { anchor: 'middle', fw: isActive ? 700 : 400 }));
    elements.push(text(tx, H - 30, labels[i], 10, col, { anchor: 'middle', fw: isActive ? 600 : 400 }));
  });
}

function card(elements, x, y, w, h, opts = {}) {
  elements.push(rect(x, y, w, h, opts.fill ?? C.s2, { rx: opts.rx ?? 14, stroke: C.border, sw: 1, opacity: opts.opacity ?? 1 }));
  if (opts.glow) {
    // subtle accent glow on left edge
    elements.push(rect(x, y + 8, 3, h - 16, C.acc, { rx: 2, opacity: 0.6 }));
  }
}

function pill(elements, x, y, label, color, bgOpacity = 0.15) {
  const w = label.length * 7.5 + 18;
  elements.push(rect(x, y - 12, w, 22, color, { rx: 11, opacity: bgOpacity }));
  elements.push(text(x + w / 2, y + 2, label, 11, color, { anchor: 'middle', fw: 600, ls: 0.3 }));
  return w;
}

function progressBar(elements, x, y, w, pct, color) {
  elements.push(rect(x, y, w, 6, C.s3, { rx: 3 }));
  elements.push(rect(x, y, Math.max(8, w * pct / 100), 6, color, { rx: 3, opacity: 0.9 }));
}

// ══════════════════════════════════════════════════════════════
// SCREEN 1 — Dashboard
// ══════════════════════════════════════════════════════════════
function screen1() {
  const el = [];
  statusBar(el);

  // Header
  el.push(text(20, 82, 'Good morning, Alex', 13, C.sub));
  el.push(text(20, 108, 'Cash Flow', 28, C.text, { fw: 700 }));
  el.push(text(20, 133, 'Overview', 28, C.acc, { fw: 700 }));

  // Avatar + notification
  el.push(circle(W - 36, 104, 20, C.s3));
  el.push(text(W - 36, 108, 'A', 14, C.acc, { anchor: 'middle', fw: 700 }));
  el.push(circle(W - 20, 88, 6, C.acc3));

  // ── Hero runway card (glassmorphism-inspired elevation)
  card(el, 20, 152, W - 40, 138, { rx: 18, fill: C.s2, glow: true });
  el.push(text(36, 177, 'Cash Runway', 12, C.sub, { fw: 500, ls: 0.8 }));
  el.push(text(36, 210, '47', 52, C.text, { fw: 800 }));
  el.push(text(104, 210, 'days', 20, C.sub, { fw: 400 }));
  el.push(text(36, 232, 'Estimated at current burn rate', 12, C.sub));
  // runway bar
  progressBar(el, 36, 248, W - 92, 47, C.acc);
  el.push(text(W - 48, 248, '47/90', 11, C.acc, { anchor: 'end' }));
  el.push(text(36, 275, 'Healthy', 11, C.acc4, { fw: 600 }));
  pill(el, W - 100, 275, '▲ +12 days', C.acc4);

  // ── Quick stats row
  const stats = [
    { label: 'Incoming', value: '$6,240', sub: 'Next 30d', col: C.acc2 },
    { label: 'Overdue', value: '$1,850', sub: '2 invoices', col: C.acc3 },
    { label: 'Pending', value: '$3,100', sub: '4 invoices', col: C.warn },
  ];
  stats.forEach((s, i) => {
    const cx = 20 + i * 118;
    card(el, cx, 310, 110, 90, { rx: 12 });
    el.push(text(cx + 12, 333, s.label, 10, C.sub, { fw: 500, ls: 0.5 }));
    el.push(text(cx + 12, 358, s.value, 18, s.col, { fw: 700 }));
    el.push(text(cx + 12, 376, s.sub, 10, C.sub));
  });

  // ── Next payment card
  card(el, 20, 418, W - 40, 82, { rx: 14 });
  el.push(text(36, 441, 'Next payment expected', 12, C.sub));
  el.push(text(36, 466, 'Figma Inc.', 16, C.text, { fw: 600 }));
  el.push(text(36, 484, 'Invoice #2041 · due in 3 days', 11, C.sub));
  el.push(text(W - 36, 466, '$2,400', 18, C.acc2, { fw: 700, anchor: 'end' }));
  pill(el, W - 120, 478, 'On track', C.acc4);

  // ── Payment risk gauge
  card(el, 20, 518, W - 40, 100, { rx: 14 });
  el.push(text(36, 541, 'Payment Risk Score', 12, C.sub, { fw: 500, ls: 0.5 }));
  el.push(text(36, 570, '72', 32, C.acc, { fw: 800 }));
  el.push(text(72, 570, '/ 100', 14, C.sub, { fw: 400 }));
  el.push(text(36, 590, 'Low risk across active clients', 11, C.sub));
  progressBar(el, W - 140, 558, 100, 72, C.acc);
  el.push(text(W - 140, 574, 'Risk', 10, C.sub, { anchor: 'start' }));
  el.push(text(W - 36, 574, '72', 10, C.acc, { anchor: 'end' }));

  // ── Recent activity
  el.push(text(20, 638, 'Recent Activity', 13, C.text, { fw: 600 }));
  el.push(text(W - 20, 638, 'View all', 12, C.acc, { anchor: 'end' }));
  const recent = [
    { name: 'Stripe Inc.', amount: '+$1,200', date: 'Today', col: C.acc4 },
    { name: 'Notion HQ', amount: '+$3,000', date: 'Yesterday', col: C.acc4 },
    { name: 'Late: Acme Co.', amount: '$850', date: '5d overdue', col: C.acc3 },
  ];
  recent.forEach((r, i) => {
    const ry = 658 + i * 52;
    card(el, 20, ry, W - 40, 44, { rx: 10 });
    el.push(circle(44, ry + 22, 14, C.s3));
    el.push(text(44, ry + 26, r.name[0], 12, C.acc, { anchor: 'middle', fw: 700 }));
    el.push(text(68, ry + 18, r.name, 13, C.text, { fw: 500 }));
    el.push(text(68, ry + 33, r.date, 11, C.sub));
    el.push(text(W - 36, ry + 25, r.amount, 14, r.col, { anchor: 'end', fw: 700 }));
  });

  bottomNav(el, 0);
  return el;
}

// ══════════════════════════════════════════════════════════════
// SCREEN 2 — Pipeline (Invoice list with risk indicators)
// ══════════════════════════════════════════════════════════════
function screen2() {
  const el = [];
  statusBar(el);

  el.push(text(20, 82, 'PIPELINE', 11, C.acc, { fw: 700, ls: 1.5 }));
  el.push(text(20, 106, '$11,190', 34, C.text, { fw: 800 }));
  el.push(text(20, 128, 'across 9 open invoices', 13, C.sub));

  // Filter tabs
  const filters = ['All', 'Overdue', 'Pending', 'Sent', 'Draft'];
  filters.forEach((f, i) => {
    const tw = f.length * 9 + 20;
    const prevWidths = filters.slice(0, i).reduce((a, v) => a + v.length * 9 + 28, 20);
    const isActive = i === 0;
    el.push(rect(prevWidths, 146, tw, 28, isActive ? C.acc : C.s2, { rx: 14, opacity: isActive ? 1 : 1 }));
    el.push(text(prevWidths + tw / 2, 164, f, 12, isActive ? C.bg : C.sub, { anchor: 'middle', fw: isActive ? 700 : 400 }));
  });

  const invoices = [
    { client: 'Figma Inc.', inv: '#2041', amount: '$2,400', due: 'Due in 3 days', status: 'On Track', col: C.acc4, risk: 12 },
    { client: 'Stripe Inc.', inv: '#2038', amount: '$1,200', due: 'Due tomorrow', status: 'At Risk', col: C.warn, risk: 58 },
    { client: 'Acme Co.', inv: '#2035', amount: '$850', due: '5 days overdue', status: 'Overdue', col: C.acc3, risk: 88 },
    { client: 'Notion HQ', inv: '#2031', amount: '$3,000', due: 'Due in 14 days', status: 'Safe', col: C.acc4, risk: 8 },
    { client: 'Linear Ltd.', inv: '#2029', amount: '$1,600', due: 'Due in 8 days', status: 'At Risk', col: C.warn, risk: 44 },
    { client: 'Vercel Corp.', inv: '#2027', amount: '$2,140', due: 'Due in 21 days', status: 'Safe', col: C.acc4, risk: 5 },
  ];

  invoices.forEach((inv, i) => {
    const iy = 190 + i * 90;
    card(el, 20, iy, W - 40, 80, { rx: 14 });
    // Risk bar on left
    const riskH = Math.max(8, 56 * inv.risk / 100);
    el.push(rect(20, iy + (80 - riskH) / 2, 4, riskH, inv.col, { rx: 2, opacity: 0.8 }));

    el.push(text(36, iy + 22, inv.client, 15, C.text, { fw: 600 }));
    el.push(text(36, iy + 40, inv.inv + ' · ' + inv.due, 11, C.sub));

    // Risk score
    el.push(text(W - 36, iy + 24, inv.amount, 16, C.text, { anchor: 'end', fw: 700 }));
    pill(el, W - 36 - (inv.status.length * 7.5 + 18), iy + 48, inv.status, inv.col);

    // mini risk bar
    el.push(rect(36, iy + 56, 120, 5, C.s3, { rx: 2 }));
    el.push(rect(36, iy + 56, Math.max(4, 120 * inv.risk / 100), 5, inv.col, { rx: 2, opacity: 0.7 }));
    el.push(text(162, iy + 62, `Risk ${inv.risk}`, 10, inv.col));
  });

  bottomNav(el, 1);
  return el;
}

// ══════════════════════════════════════════════════════════════
// SCREEN 3 — Forecast (30/60/90 day projection)
// ══════════════════════════════════════════════════════════════
function screen3() {
  const el = [];
  statusBar(el);

  el.push(text(20, 82, 'FORECAST', 11, C.acc, { fw: 700, ls: 1.5 }));
  el.push(text(20, 106, 'Cash Projection', 26, C.text, { fw: 700 }));

  // Period selector
  ['30d', '60d', '90d'].forEach((p, i) => {
    const isActive = i === 1;
    el.push(rect(W - 140 + i * 46, 90, 40, 24, isActive ? C.acc : C.s2, { rx: 12 }));
    el.push(text(W - 120 + i * 46, 106, p, 12, isActive ? C.bg : C.sub, { anchor: 'middle', fw: isActive ? 700 : 400 }));
  });

  // Chart area
  card(el, 20, 130, W - 40, 200, { rx: 16 });
  el.push(text(36, 152, 'Projected income — next 60 days', 11, C.sub));

  // Grid lines
  [0, 1, 2, 3].forEach(i => {
    const gy = 290 - i * 40;
    el.push(line(36, gy, W - 36, gy, C.border, { sw: 1, opacity: 0.5 }));
    el.push(text(32, gy + 4, ['$0', '$2k', '$4k', '$6k'][i], 9, C.sub, { anchor: 'end' }));
  });

  // Chart bars
  const barData = [
    [28, 52, 12, 40, 62, 34, 48, 70, 22, 56],
    [45, 18, 38, 65, 28, 54, 30, 48, 72, 40],
  ];
  const chartW = W - 80;
  const barW = chartW / 20 - 3;
  barData.forEach((week, wi) => {
    week.forEach((val, di) => {
      const bx = 40 + wi * (chartW / 2) + di * (chartW / 20);
      const bh = val * 1.55;
      const by = 290 - bh;
      const col = wi === 0 ? C.acc : C.acc2;
      el.push(rect(bx, by, barW, bh, col, { rx: 3, opacity: wi === 1 ? 0.5 : 0.85 }));
    });
  });

  // Legend
  el.push(rect(40, 310, 8, 8, C.acc, { rx: 2 }));
  el.push(text(52, 318, 'Confirmed', 10, C.sub));
  el.push(rect(120, 310, 8, 8, C.acc2, { rx: 2, opacity: 0.6 }));
  el.push(text(132, 318, 'Projected', 10, C.sub));

  // Projection cards
  const projections = [
    { period: '30 days', value: '$6,240', change: '+18%', sub: '4 invoices due', col: C.acc4 },
    { period: '60 days', value: '$14,850', change: '+31%', sub: 'incl. 2 renewals', col: C.acc2 },
    { period: '90 days', value: '$22,400', change: '+24%', sub: 'estimated runway', col: C.acc },
  ];
  projections.forEach((p, i) => {
    const px = 20 + i * 118;
    card(el, px, 350, 110, 95, { rx: 12 });
    el.push(text(px + 12, 373, p.period, 10, C.sub, { fw: 500, ls: 0.4 }));
    el.push(text(px + 12, 398, p.value, 17, C.text, { fw: 700 }));
    el.push(text(px + 12, 418, p.change, 12, p.col, { fw: 600 }));
    el.push(text(px + 12, 434, p.sub, 10, C.sub));
  });

  // Income sources breakdown
  el.push(text(20, 466, 'Income Sources', 13, C.text, { fw: 600 }));
  const sources = [
    { name: 'Project-based', pct: 68, col: C.acc },
    { name: 'Retainers', pct: 24, col: C.acc2 },
    { name: 'Consulting', pct: 8, col: C.warn },
  ];
  sources.forEach((s, i) => {
    const sy = 486 + i * 54;
    card(el, 20, sy, W - 40, 46, { rx: 10 });
    el.push(text(36, sy + 16, s.name, 13, C.text, { fw: 500 }));
    el.push(text(36, sy + 32, `${s.pct}% of forecast`, 11, C.sub));
    el.push(text(W - 36, sy + 25, `${s.pct}%`, 16, s.col, { anchor: 'end', fw: 700 }));
    progressBar(el, 36, sy + 38, W - 92, s.pct, s.col);
  });

  // Scenario alert
  card(el, 20, 658, W - 40, 66, { rx: 14, fill: C.s3 });
  el.push(circle(42, 691, 14, C.warn, { opacity: 0.15 }));
  el.push(text(42, 695, '⚡', 14, C.warn, { anchor: 'middle' }));
  el.push(text(62, 678, 'Scenario alert', 11, C.warn, { fw: 600 }));
  el.push(text(62, 695, 'If Acme Co. stays unpaid, 60-day', 11, C.sub));
  el.push(text(62, 710, 'forecast drops by $850', 11, C.sub));

  bottomNav(el, 2);
  return el;
}

// ══════════════════════════════════════════════════════════════
// SCREEN 4 — Clients (with payment reliability scores)
// ══════════════════════════════════════════════════════════════
function screen4() {
  const el = [];
  statusBar(el);

  el.push(text(20, 82, 'CLIENTS', 11, C.acc, { fw: 700, ls: 1.5 }));
  el.push(text(20, 106, 'Payment Reliability', 24, C.text, { fw: 700 }));
  el.push(text(20, 128, '8 active clients', 13, C.sub));

  // Sort control
  el.push(rect(W - 120, 112, 96, 28, C.s2, { rx: 14 }));
  el.push(text(W - 72, 130, '↓ Reliability', 11, C.sub, { anchor: 'middle' }));

  const clients = [
    { name: 'Figma Inc.', type: 'Product', score: 96, paid: '$24,400', ontime: '98%', col: C.acc4 },
    { name: 'Stripe Inc.', type: 'FinTech', score: 82, paid: '$8,200', ontime: '85%', col: C.acc2 },
    { name: 'Notion HQ', type: 'SaaS', score: 91, paid: '$15,000', ontime: '94%', col: C.acc4 },
    { name: 'Linear Ltd.', type: 'Dev Tools', score: 74, paid: '$6,400', ontime: '76%', col: C.warn },
    { name: 'Acme Co.', type: 'Enterprise', score: 48, paid: '$12,800', ontime: '52%', col: C.acc3 },
    { name: 'Vercel Corp.', type: 'Cloud', score: 88, paid: '$9,600', ontime: '90%', col: C.acc2 },
  ];

  clients.forEach((c, i) => {
    const cy = 148 + i * 94;
    card(el, 20, cy, W - 40, 84, { rx: 14 });

    // Avatar
    el.push(circle(50, cy + 42, 22, C.s3));
    el.push(text(50, cy + 47, c.name[0], 14, c.col, { anchor: 'middle', fw: 700 }));

    // Name + type
    el.push(text(80, cy + 30, c.name, 15, C.text, { fw: 600 }));
    el.push(text(80, cy + 48, c.type, 11, C.sub));

    // Score — right side
    el.push(text(W - 36, cy + 32, `${c.score}`, 22, c.col, { anchor: 'end', fw: 800 }));
    el.push(text(W - 36, cy + 50, 'score', 10, C.sub, { anchor: 'end' }));

    // Stats row
    el.push(line(80, cy + 58, W - 36, cy + 58, C.border, { sw: 1 }));
    el.push(text(80, cy + 73, `Lifetime: ${c.paid}`, 10, C.sub));
    el.push(text(W - 36, cy + 73, `On-time: ${c.ontime}`, 10, c.col, { anchor: 'end' }));

    // Reliability bar
    progressBar(el, 80, cy + 62, 130, c.score, c.col);
  });

  bottomNav(el, 3);
  return el;
}

// ══════════════════════════════════════════════════════════════
// SCREEN 5 — Alerts (Risk warnings + smart nudges)
// ══════════════════════════════════════════════════════════════
function screen5() {
  const el = [];
  statusBar(el);

  el.push(text(20, 82, 'ALERTS', 11, C.acc, { fw: 700, ls: 1.5 }));
  el.push(text(20, 106, '3 need attention', 26, C.text, { fw: 700 }));

  // Alert summary pills
  pill(el, 20, 138, '2 overdue', C.acc3);
  pill(el, 100, 138, '1 at risk', C.warn);
  pill(el, 160, 138, '3 safe', C.acc4);

  const alerts = [
    {
      level: 'critical',
      icon: '!',
      title: 'Acme Co. — 5 days overdue',
      body: 'Invoice #2035 for $850 was due Apr 8. Send a reminder to avoid escalation.',
      action: 'Send Reminder',
      col: C.acc3,
    },
    {
      level: 'warning',
      icon: '⚡',
      title: 'Stripe Inc. — due tomorrow',
      body: 'Invoice #2038 for $1,200 due Apr 14. Payment not yet initiated by client.',
      action: 'Check Status',
      col: C.warn,
    },
    {
      level: 'warning',
      icon: '↘',
      title: 'Runway dropping',
      body: 'Current burn vs income suggests runway will fall below 30 days in 3 weeks if Acme stays unpaid.',
      action: 'View Forecast',
      col: C.warn,
    },
    {
      level: 'info',
      icon: '✓',
      title: 'Figma Inc. — payment expected',
      body: 'Invoice #2041 for $2,400 due in 3 days. Figma has a 98% on-time rate.',
      action: 'View Invoice',
      col: C.acc2,
    },
    {
      level: 'success',
      icon: '★',
      title: 'Q1 summary ready',
      body: 'You collected $31,200 in Q1. That\'s 24% more than Q4 2025. View full report.',
      action: 'View Report',
      col: C.acc4,
    },
  ];

  alerts.forEach((a, i) => {
    const ay = 156 + i * 112;
    card(el, 20, ay, W - 40, 100, { rx: 14, fill: C.s2 });
    // Left accent stripe
    el.push(rect(20, ay + 8, 4, 84, a.col, { rx: 2, opacity: 0.8 }));
    // Icon circle
    el.push(circle(46, ay + 26, 14, a.col, { opacity: 0.15 }));
    el.push(text(46, ay + 31, a.icon, 13, a.col, { anchor: 'middle', fw: 700 }));

    el.push(text(66, ay + 22, a.title, 13, C.text, { fw: 600 }));
    el.push(text(66, ay + 38, a.body.slice(0, 44), 11, C.sub));
    el.push(text(66, ay + 52, a.body.slice(44, 88), 11, C.sub));

    // Action button
    const bw = a.action.length * 8 + 20;
    el.push(rect(W - 36 - bw, ay + 68, bw, 24, a.col, { rx: 12, opacity: 0.15 }));
    el.push(text(W - 36 - bw / 2, ay + 83, a.action, 11, a.col, { anchor: 'middle', fw: 600 }));
  });

  bottomNav(el, 4);
  return el;
}

// ══════════════════════════════════════════════════════════════
// SCREEN 6 — Settings / Profile
// ══════════════════════════════════════════════════════════════
function screen6() {
  const el = [];
  statusBar(el);

  // Profile header
  card(el, 0, 50, W, 160, { rx: 0, fill: C.s1 });
  el.push(circle(W / 2, 120, 38, C.s3));
  el.push(text(W / 2, 126, 'A', 22, C.acc, { anchor: 'middle', fw: 800 }));
  el.push(text(W / 2, 172, 'Alex Rivera', 18, C.text, { anchor: 'middle', fw: 700 }));
  el.push(text(W / 2, 192, 'Freelance Designer & Developer', 12, C.sub, { anchor: 'middle' }));

  // Stat strip
  [
    { val: '$31.2k', label: 'Q1 Earned' },
    { val: '94%', label: 'On-time rate' },
    { val: '8', label: 'Clients' },
  ].forEach((s, i) => {
    const sx = 48 + i * 100;
    el.push(text(sx + 50, 222, s.val, 18, C.acc, { anchor: 'middle', fw: 700 }));
    el.push(text(sx + 50, 238, s.label, 10, C.sub, { anchor: 'middle' }));
    if (i < 2) el.push(line(sx + 100, 210, sx + 100, 240, C.border, { sw: 1 }));
  });

  // Sections
  const sections = [
    {
      header: 'Notifications',
      items: [
        { label: 'Overdue alerts', sub: 'Notify when invoice is past due', toggle: true, on: true },
        { label: 'Runway warnings', sub: 'Alert when runway < 30 days', toggle: true, on: true },
        { label: 'Payment received', sub: 'Confirmation on payment', toggle: true, on: false },
      ],
    },
    {
      header: 'Thresholds',
      items: [
        { label: 'Runway warning', sub: 'Alert below: 30 days', arrow: true },
        { label: 'Risk score alert', sub: 'Flag clients below: 60', arrow: true },
        { label: 'Late fee grace', sub: 'Apply after: 7 days', arrow: true },
      ],
    },
    {
      header: 'Integrations',
      items: [
        { label: 'Stripe', sub: 'Connected · 23 transactions', dot: C.acc4 },
        { label: 'QuickBooks', sub: 'Not connected', dot: C.sub },
        { label: 'Wise', sub: 'Not connected', dot: C.sub },
      ],
    },
  ];

  let sy = 254;
  sections.forEach(sec => {
    el.push(text(20, sy, sec.header, 11, C.acc, { fw: 600, ls: 0.8 }));
    sy += 22;
    sec.items.forEach(item => {
      card(el, 20, sy, W - 40, 52, { rx: 12 });
      el.push(text(36, sy + 20, item.label, 14, C.text, { fw: 500 }));
      el.push(text(36, sy + 36, item.sub, 11, C.sub));
      if (item.toggle) {
        const on = item.on;
        el.push(rect(W - 60, sy + 18, 38, 20, on ? C.acc : C.s3, { rx: 10 }));
        el.push(circle(on ? W - 28 : W - 46, sy + 28, 8, C.text, { opacity: 0.9 }));
      }
      if (item.arrow) el.push(text(W - 24, sy + 28, '›', 18, C.sub, { anchor: 'middle' }));
      if (item.dot) el.push(circle(W - 30, sy + 26, 5, item.dot));
      sy += 60;
    });
    sy += 14;
  });

  bottomNav(el, 0);
  return el;
}

// ── Assemble + write
const screens = [
  { name: 'Dashboard', fn: screen1 },
  { name: 'Pipeline', fn: screen2 },
  { name: 'Forecast', fn: screen3 },
  { name: 'Clients', fn: screen4 },
  { name: 'Alerts', fn: screen5 },
  { name: 'Settings', fn: screen6 },
];

let totalElements = 0;
const pen = {
  version: '2.8',
  metadata: {
    name: 'SOLV — Freelance Payment Intelligence',
    author: 'RAM',
    date: new Date().toISOString(),
    theme: 'dark',
    heartbeat: 507,
    palette: { bg: C.bg, accent: C.acc, accent2: C.acc2, text: C.text },
    inspiration: 'DarkModeDesign.com elevation-based card system + Land-book trust-first financial design',
    elements: 0,
  },
  screens: screens.map(s => {
    const elements = s.fn();
    totalElements += elements.length;

    // Build SVG
    function elToSVG(e) {
      if (e.type === 'rect') {
        return `<rect x="${e.x}" y="${e.y}" width="${e.width}" height="${e.height}" fill="${e.fill}" rx="${e.rx}" opacity="${e.opacity}" stroke="${e.stroke}" stroke-width="${e.strokeWidth}"/>`;
      }
      if (e.type === 'text') {
        return `<text x="${e.x}" y="${e.y}" font-size="${e.fontSize}" fill="${e.fill}" font-weight="${e.fontWeight}" font-family="${e.fontFamily}" text-anchor="${e.textAnchor}" letter-spacing="${e.letterSpacing}" opacity="${e.opacity}">${e.content}</text>`;
      }
      if (e.type === 'circle') {
        return `<circle cx="${e.cx}" cy="${e.cy}" r="${e.r}" fill="${e.fill}" opacity="${e.opacity}" stroke="${e.stroke}" stroke-width="${e.strokeWidth}"/>`;
      }
      if (e.type === 'line') {
        return `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${e.stroke}" stroke-width="${e.strokeWidth}" opacity="${e.opacity}" stroke-linecap="round"/>`;
      }
      return '';
    }

    const svgContent = elements.map(elToSVG).join('\n  ');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" style="background:${C.bg}">\n  ${svgContent}\n</svg>`;

    return { name: s.name, svg, elements, width: W, height: H };
  }),
};

pen.metadata.elements = totalElements;
const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`SOLV: ${pen.screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
