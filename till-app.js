'use strict';
// till-app.js
// TILL — The Zero-Admin Revenue OS for Freelancers
//
// Design Heartbeat — Mar 19, 2026
// Inspired by:
//   • Midday.ai near-void dark financial dashboard (darkmodedesign.com)
//   • Moneda "money that finally works for you" fintech landing (lapa.ninja)
//   • OWO clean payment UI — WhatsApp-native payments (lapa.ninja)
//   • Linear's systematic dark design language (godly.website + darkmodedesign.com)
//   • Awwwards nominees: MoMoney, Aupale Vodka — organic shapes in dark UI
//
// Challenge: Design a dark-mode micro-revenue dashboard for solo freelancers.
// "TILL" = the cash drawer — your money in one place, zero overhead.
// Amber-gold accent on near-void dark. Tabular data meets warmth.
// 5 mobile + 5 desktop screens.

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:      '#06050A',   // near-void aubergine-black
  surface: '#0C0B12',   // elevated surface
  card:    '#131120',   // card background
  card2:   '#0F0E1B',   // alt card
  border:  '#1E1C2E',   // subtle border
  border2: '#2A2840',   // stronger border
  muted:   '#3D3A58',   // muted foreground
  fg:      '#EDE9FF',   // primary text — cool lavender-white
  fg2:     '#8B86A8',   // secondary text
  fg3:     '#4E4A6A',   // dimmed
  gold:    '#F0A432',   // primary accent — warm amber gold
  gold2:   '#FFCB6B',   // lighter gold highlight
  gold3:   '#C67E1A',   // darker gold shade
  green:   '#34D399',   // paid / success
  red:     '#F87171',   // overdue / error
  blue:    '#818CF8',   // pending / info
  purple:  '#A78BFA',   // scheduled / ai
};

let _id = 0;
const uid = () => `t${++_id}`;

// ── Core primitives ───────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill || P.bg,
  clip: opts.clip !== undefined ? opts.clip : false,
  ...(opts.r !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.ch || [],
});

const T = (content, x, y, w, h, opts = {}) => ({
  id: uid(), type: 'text', content, x, y, width: w, height: h,
  textGrowth: 'fixed-width-height',
  fontSize: opts.size || 12,
  fontWeight: String(opts.weight || 400),
  fill: opts.fill || P.fg,
  textAlign: opts.align || 'left',
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh !== undefined ? { lineHeight: opts.lh } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const R = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'rectangle', x, y, width: w, height: h, fill,
  ...(opts.r !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const HLine = (x, y, w, fill = P.border)  => R(x, y, w, 1, fill);
const VLine = (x, y, h, fill = P.border)  => R(x, y, 1, h, fill);

// Status dot
const Dot = (x, y, color, size = 6) => E(x, y, size, size, color);

// Pill badge
const Pill = (x, y, text, bg, fg) => {
  const w = text.length * 5.8 + 18;
  return F(x, y, w, 18, bg, {
    r: 9,
    ch: [T(text, 9, 2.5, w - 18, 13, { size: 9, fill: fg, weight: 700, ls: 0.8 })],
  });
};

// Gold glow accent bar at top of screen
const GlowBar = (y, w) => R(0, y, w, 1, P.gold, { opacity: 0.5 });

// Mini sparkline (fake horizontal bars)
const MiniSpark = (x, y, w, h, values, color) => {
  const count = values.length;
  const barW = Math.floor(w / count) - 1;
  return values.map((v, i) => {
    const bH = Math.round(h * v);
    return R(x + i * (barW + 1), y + h - bH, barW, bH, color, { r: 1, opacity: 0.6 + v * 0.4 });
  });
};

// Circle progress
const CircleProgress = (cx, cy, r, pct, color, bg) => {
  const circumference = 2 * Math.PI * r;
  const filled = circumference * pct;
  return [
    E(cx - r, cy - r, r * 2, r * 2, 'transparent', { stroke: bg, sw: 3 }),
    // Approximate arc fill with a clipped filled circle minus gap
    E(cx - r + 1, cy - r + 1, (r - 1) * 2, (r - 1) * 2, color, { opacity: 0.15 }),
  ];
};

// Currency label
const Currency = (x, y, amount, size = 28, color = P.gold) => {
  const parts = amount.toString().split('.');
  const whole = '$' + parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const dec = parts[1] ? '.' + parts[1] : '';
  return [
    T(whole, x, y, whole.length * size * 0.62, size + 4, { size, weight: 800, fill: color }),
    dec ? T(dec, x + whole.length * size * 0.62 - 4, y + 6, dec.length * size * 0.45, size - 4,
            { size: size * 0.65, weight: 600, fill: color, opacity: 0.7 }) : null,
  ].filter(Boolean);
};

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE SCREENS (375 × 812)
// ─────────────────────────────────────────────────────────────────────────────

// ── M1: Revenue Dashboard ─────────────────────────────────────────────────────
function mobileDashboard(sx) {
  const W = 375, H = 812;
  const ch = [];

  // Background
  ch.push(R(0, 0, W, H, P.bg));
  // Subtle top glow
  ch.push(E(-60, -80, 220, 220, P.gold, { opacity: 0.04 }));

  // Status bar
  ch.push(T('9:41', 20, 14, 60, 14, { size: 12, weight: 700, fill: P.fg }));
  ch.push(T('●●● ▲▼ ■■', W - 90, 14, 80, 14, { size: 9, fill: P.fg2, align: 'right' }));

  // Header
  ch.push(T('TILL', 20, 46, 80, 28, { size: 22, weight: 900, fill: P.gold, ls: 3 }));
  ch.push(T('MAR 2026', W - 80, 52, 68, 16, { size: 10, weight: 600, fill: P.fg3, align: 'right', ls: 1 }));

  // Gold accent line
  ch.push(HLine(20, 82, 48, P.gold));
  ch.push(HLine(76, 82, W - 96, P.border));

  // Hero revenue block
  ch.push(R(20, 96, W - 40, 110, P.card, { r: 12, stroke: P.border }));
  ch.push(T('THIS MONTH', 32, 112, 120, 12, { size: 9, fill: P.fg3, weight: 600, ls: 1.5 }));
  ch.push(...Currency(32, 128, 14280, 32, P.gold));
  ch.push(T('/ $18,000 goal', 32, 170, 160, 14, { size: 11, fill: P.fg3 }));
  // Progress bar
  ch.push(R(32, 188, W - 72, 4, P.surface, { r: 2 }));
  ch.push(R(32, 188, Math.round((W - 72) * 0.793), 4, P.gold, { r: 2 }));
  ch.push(T('79%', W - 60, 184, 36, 12, { size: 10, weight: 700, fill: P.gold, align: 'right' }));

  // Quick stats row
  const stats = [
    { label: 'PENDING',   val: '$3,200', color: P.blue },
    { label: 'OVERDUE',   val: '$800',   color: P.red  },
    { label: 'CLIENTS',   val: '7',      color: P.green },
  ];
  const statW = (W - 40) / 3;
  stats.forEach((s, i) => {
    const sx2 = 20 + i * statW;
    ch.push(R(sx2, 220, statW - 6, 62, P.surface, { r: 8, stroke: P.border }));
    ch.push(T(s.val, sx2 + 12, 234, statW - 28, 22, { size: 16, weight: 800, fill: s.color }));
    ch.push(T(s.label, sx2 + 12, 260, statW - 28, 12, { size: 8, fill: P.fg3, weight: 600, ls: 1 }));
  });

  // Recent invoices
  ch.push(T('RECENT INVOICES', 20, 302, 180, 14, { size: 10, fill: P.fg3, weight: 700, ls: 1.5 }));
  ch.push(T('View all →', W - 78, 303, 66, 12, { size: 10, fill: P.gold, align: 'right' }));

  const invoices = [
    { client: 'Vortex Labs',     date: 'Mar 18', amt: 4800,  status: 'PAID',    color: P.green },
    { client: 'Hollow Earth Co', date: 'Mar 15', amt: 2200,  status: 'PENDING', color: P.blue  },
    { client: 'North Quarter',   date: 'Mar 12', amt: 3600,  status: 'PAID',    color: P.green },
    { client: 'Dusk Studio',     date: 'Mar 08', amt: 800,   status: 'OVERDUE', color: P.red   },
  ];

  invoices.forEach((inv, i) => {
    const iy = 322 + i * 62;
    ch.push(R(20, iy, W - 40, 56, i % 2 === 0 ? P.card : P.surface, { r: 10, stroke: P.border }));
    // Avatar letter
    ch.push(R(32, iy + 14, 28, 28, P.gold + '18', { r: 6 }));
    ch.push(T(inv.client[0], 32, iy + 19, 28, 18, { size: 11, weight: 700, fill: P.gold, align: 'center' }));
    ch.push(T(inv.client, 70, iy + 14, 140, 14, { size: 12, weight: 600, fill: P.fg }));
    ch.push(T(inv.date, 70, iy + 32, 80, 12, { size: 10, fill: P.fg3 }));
    ch.push(T('$' + inv.amt.toLocaleString(), W - 90, iy + 14, 68, 14, { size: 13, weight: 700, fill: P.fg, align: 'right' }));
    ch.push(Pill(W - 90, iy + 32, inv.status, inv.color + '22', inv.color));
  });

  // Bottom nav
  ch.push(R(0, H - 82, W, 82, P.surface, {}));
  ch.push(HLine(0, H - 82, W, P.border));
  const navItems = ['▣ Home', '≡ Invoices', '◎ Time', '◈ Clients', '⊕ New'];
  navItems.forEach((item, i) => {
    const nx = i * (W / 5);
    const isActive = i === 0;
    ch.push(T(item.split(' ')[0], nx, H - 62, W / 5, 18, { size: 14, fill: isActive ? P.gold : P.fg3, align: 'center' }));
    ch.push(T(item.split(' ')[1], nx, H - 44, W / 5, 12, { size: 8, fill: isActive ? P.gold : P.fg3, align: 'center', weight: isActive ? 700 : 400 }));
    if (isActive) ch.push(R(nx + W / 10 - 12, H - 15, 24, 2, P.gold, { r: 1 }));
  });

  return F(sx, 0, W, H, P.bg, { clip: true, ch });
}

// ── M2: Invoice Composer ──────────────────────────────────────────────────────
function mobileInvoice(sx) {
  const W = 375, H = 812;
  const ch = [];

  ch.push(R(0, 0, W, H, P.bg));
  ch.push(E(200, -40, 180, 180, P.gold, { opacity: 0.05 }));

  // Status bar
  ch.push(T('9:41', 20, 14, 60, 14, { size: 12, weight: 700, fill: P.fg }));
  ch.push(T('●●● ▲▼ ■■', W - 90, 14, 80, 14, { size: 9, fill: P.fg2, align: 'right' }));

  // Header
  ch.push(T('← Back', 20, 46, 80, 16, { size: 12, fill: P.gold }));
  ch.push(T('NEW INVOICE', 0, 46, W, 16, { size: 11, weight: 700, fill: P.fg, align: 'center', ls: 2 }));
  ch.push(T('Preview', W - 68, 46, 56, 16, { size: 12, fill: P.gold, align: 'right' }));

  ch.push(HLine(20, 72, W - 40, P.border));

  // Invoice number & date
  ch.push(T('INV-2026-041', 20, 84, 160, 16, { size: 12, weight: 700, fill: P.gold, ls: 1 }));
  ch.push(T('Due: Apr 18, 2026', W - 130, 84, 118, 16, { size: 11, fill: P.fg3, align: 'right' }));

  // Client selector
  ch.push(T('BILL TO', 20, 112, 80, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.5 }));
  ch.push(R(20, 126, W - 40, 52, P.card, { r: 10, stroke: P.border }));
  ch.push(R(32, 137, 30, 30, P.gold + '18', { r: 8 }));
  ch.push(T('V', 32, 143, 30, 18, { size: 12, weight: 700, fill: P.gold, align: 'center' }));
  ch.push(T('Vortex Labs', 72, 137, 180, 14, { size: 13, weight: 600, fill: P.fg }));
  ch.push(T('james@vortexlabs.io', 72, 155, 200, 12, { size: 10, fill: P.fg3 }));
  ch.push(T('▼', W - 40, 148, 16, 16, { size: 12, fill: P.fg3, align: 'right' }));

  // Line items
  ch.push(T('LINE ITEMS', 20, 196, 120, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.5 }));
  ch.push(T('+ Add item', W - 72, 196, 60, 12, { size: 10, fill: P.gold, align: 'right' }));

  const items = [
    { desc: 'Brand Strategy Sprint',     qty: 1, rate: 2400, total: 2400 },
    { desc: 'Visual Identity System',    qty: 1, rate: 1800, total: 1800 },
    { desc: 'Webflow Build (3 pages)',   qty: 3, rate: 200,  total: 600  },
  ];
  items.forEach((item, i) => {
    const iy = 214 + i * 68;
    ch.push(R(20, iy, W - 40, 62, i % 2 === 0 ? P.card : P.surface, { r: 8, stroke: P.border }));
    ch.push(T(item.desc, 32, iy + 10, W - 100, 14, { size: 12, weight: 600, fill: P.fg }));
    ch.push(T(`${item.qty} × $${item.rate.toLocaleString()}`, 32, iy + 30, 160, 12, { size: 10, fill: P.fg3 }));
    ch.push(T('$' + item.total.toLocaleString(), W - 56, iy + 20, 40, 22, { size: 16, weight: 800, fill: P.gold, align: 'right' }));
    ch.push(T('⋯', W - 40, iy + 26, 16, 12, { size: 14, fill: P.muted, align: 'right' }));
  });

  // Subtotals
  const totalY = 214 + items.length * 68 + 10;
  ch.push(HLine(20, totalY, W - 40, P.border2));
  ch.push(T('Subtotal', 20, totalY + 12, 120, 14, { size: 12, fill: P.fg2 }));
  ch.push(T('$4,800', W - 60, totalY + 12, 48, 14, { size: 12, fill: P.fg, align: 'right' }));
  ch.push(T('Tax (0%)', 20, totalY + 32, 120, 14, { size: 12, fill: P.fg2 }));
  ch.push(T('$0', W - 60, totalY + 32, 48, 14, { size: 12, fill: P.fg3, align: 'right' }));
  ch.push(HLine(20, totalY + 54, W - 40, P.gold + '44'));
  ch.push(T('TOTAL DUE', 20, totalY + 64, 120, 16, { size: 12, weight: 700, fill: P.fg, ls: 1 }));
  ch.push(T('$4,800', W - 60, totalY + 60, 48, 20, { size: 18, weight: 900, fill: P.gold, align: 'right' }));

  // Send button
  const btnY = H - 100;
  ch.push(R(20, btnY, W - 40, 48, P.gold, { r: 12 }));
  ch.push(T('Send Invoice', 0, btnY + 14, W, 20, { size: 14, weight: 700, fill: P.bg, align: 'center' }));

  // Bottom nav
  ch.push(R(0, H - 82, W, 82, P.surface, {}));
  ch.push(HLine(0, H - 82, W, P.border));
  const navItems = ['▣ Home', '≡ Invoices', '◎ Time', '◈ Clients', '⊕ New'];
  navItems.forEach((item, i) => {
    const nx = i * (W / 5);
    const isActive = i === 1;
    ch.push(T(item.split(' ')[0], nx, H - 62, W / 5, 18, { size: 14, fill: isActive ? P.gold : P.fg3, align: 'center' }));
    ch.push(T(item.split(' ')[1], nx, H - 44, W / 5, 12, { size: 8, fill: isActive ? P.gold : P.fg3, align: 'center', weight: isActive ? 700 : 400 }));
    if (isActive) ch.push(R(nx + W / 10 - 12, H - 15, 24, 2, P.gold, { r: 1 }));
  });

  return F(sx, 0, W, H, P.bg, { clip: true, ch });
}

// ── M3: Time Tracker ──────────────────────────────────────────────────────────
function mobileTimeTracker(sx) {
  const W = 375, H = 812;
  const ch = [];

  ch.push(R(0, 0, W, H, P.bg));
  ch.push(E(-40, 300, 200, 200, P.purple, { opacity: 0.05 }));

  ch.push(T('9:41', 20, 14, 60, 14, { size: 12, weight: 700, fill: P.fg }));
  ch.push(T('●●● ▲▼ ■■', W - 90, 14, 80, 14, { size: 9, fill: P.fg2, align: 'right' }));

  ch.push(T('TIME', 20, 46, 80, 22, { size: 18, weight: 900, fill: P.fg, ls: 3 }));
  ch.push(T('THIS WEEK · 23h 40m', W - 170, 52, 158, 14, { size: 10, fill: P.fg3, align: 'right', ls: 0.5 }));

  ch.push(HLine(20, 80, W - 40, P.border));

  // Active timer ring
  const ringY = 110;
  ch.push(E(W / 2 - 68, ringY, 136, 136, P.card, { stroke: P.border, sw: 1 }));
  ch.push(E(W / 2 - 62, ringY + 6, 124, 124, 'transparent', { stroke: P.gold + '33', sw: 8 }));
  ch.push(E(W / 2 - 62, ringY + 6, 124, 124, 'transparent', { stroke: P.gold, sw: 3 }));
  ch.push(T('2:34:18', W / 2 - 64, ringY + 48, 128, 32, { size: 26, weight: 800, fill: P.gold, align: 'center' }));
  ch.push(T('RUNNING', W / 2 - 40, ringY + 88, 80, 12, { size: 9, weight: 700, fill: P.green, align: 'center', ls: 2 }));
  ch.push(Dot(W / 2 - 46, ringY + 92, P.green, 6));

  // Active project
  ch.push(R(20, ringY + 155, W - 40, 52, P.card, { r: 10, stroke: P.gold + '44' }));
  ch.push(R(32, ringY + 167, 6, 28, P.gold, { r: 3 }));
  ch.push(T('Vortex Labs — Brand Sprint', 48, ringY + 168, W - 100, 14, { size: 12, weight: 600, fill: P.fg }));
  ch.push(T('Design / Phase 2', 48, ringY + 186, 160, 12, { size: 10, fill: P.fg3 }));
  ch.push(R(W - 60, ringY + 171, 36, 26, P.red + '22', { r: 8 }));
  ch.push(T('■ Stop', W - 56, ringY + 176, 28, 16, { size: 10, weight: 700, fill: P.red }));

  // Today's log
  ch.push(T("TODAY'S LOG", 20, ringY + 226, 140, 14, { size: 10, fill: P.fg3, weight: 700, ls: 1.5 }));
  ch.push(T('Total: 6h 12m', W - 100, ringY + 226, 88, 14, { size: 10, fill: P.gold, align: 'right' }));

  const sessions = [
    { project: 'Vortex Labs',     task: 'Brand Strategy',    dur: '2h 34m', color: P.gold   },
    { project: 'North Quarter',   task: 'UI Wireframes',      dur: '1h 52m', color: P.blue   },
    { project: 'Hollow Earth Co', task: 'Discovery Call',     dur: '0h 45m', color: P.purple },
    { project: 'Internal',        task: 'Admin + Invoicing',  dur: '1h 01m', color: P.muted  },
  ];
  sessions.forEach((s, i) => {
    const sy = ringY + 246 + i * 58;
    ch.push(R(20, sy, W - 40, 52, P.surface, { r: 8, stroke: P.border }));
    ch.push(R(32, sy + 12, 4, 28, s.color, { r: 2 }));
    ch.push(T(s.project, 46, sy + 12, W - 120, 14, { size: 12, weight: 600, fill: P.fg }));
    ch.push(T(s.task, 46, sy + 30, W - 120, 12, { size: 10, fill: P.fg3 }));
    ch.push(T(s.dur, W - 68, sy + 18, 52, 16, { size: 13, weight: 700, fill: s.color, align: 'right' }));
  });

  // Bottom nav
  ch.push(R(0, H - 82, W, 82, P.surface, {}));
  ch.push(HLine(0, H - 82, W, P.border));
  const navItems = ['▣ Home', '≡ Invoices', '◎ Time', '◈ Clients', '⊕ New'];
  navItems.forEach((item, i) => {
    const nx = i * (W / 5);
    const isActive = i === 2;
    ch.push(T(item.split(' ')[0], nx, H - 62, W / 5, 18, { size: 14, fill: isActive ? P.gold : P.fg3, align: 'center' }));
    ch.push(T(item.split(' ')[1], nx, H - 44, W / 5, 12, { size: 8, fill: isActive ? P.gold : P.fg3, align: 'center', weight: isActive ? 700 : 400 }));
    if (isActive) ch.push(R(nx + W / 10 - 12, H - 15, 24, 2, P.gold, { r: 1 }));
  });

  return F(sx, 0, W, H, P.bg, { clip: true, ch });
}

// ── M4: Client Ledger ─────────────────────────────────────────────────────────
function mobileClients(sx) {
  const W = 375, H = 812;
  const ch = [];

  ch.push(R(0, 0, W, H, P.bg));

  ch.push(T('9:41', 20, 14, 60, 14, { size: 12, weight: 700, fill: P.fg }));
  ch.push(T('●●● ▲▼ ■■', W - 90, 14, 80, 14, { size: 9, fill: P.fg2, align: 'right' }));

  ch.push(T('CLIENTS', 20, 46, 120, 22, { size: 18, weight: 900, fill: P.fg, ls: 3 }));
  ch.push(R(W - 52, 40, 36, 28, P.gold, { r: 8 }));
  ch.push(T('+ New', W - 50, 47, 32, 14, { size: 9, weight: 700, fill: P.bg, align: 'center' }));

  ch.push(HLine(20, 80, W - 40, P.border));

  // Search
  ch.push(R(20, 90, W - 40, 38, P.surface, { r: 10, stroke: P.border }));
  ch.push(T('⌕  Search clients...', 36, 100, 200, 18, { size: 12, fill: P.fg3 }));

  // Client list
  const clients = [
    { name: 'Vortex Labs',      contact: 'James Park',     ltv: 18400, active: 3, color: P.gold   },
    { name: 'North Quarter',    contact: 'Mia Chen',       ltv: 11200, active: 2, color: P.blue   },
    { name: 'Hollow Earth Co',  contact: 'Ravi Mehta',     ltv: 8600,  active: 1, color: P.purple },
    { name: 'Dusk Studio',      contact: 'Elena Kross',    ltv: 6200,  active: 0, color: P.red    },
    { name: 'Birch Digital',    contact: 'Tom Wheeler',    ltv: 4800,  active: 1, color: P.green  },
  ];

  ch.push(T('ALL CLIENTS · 7', 20, 142, 180, 14, { size: 10, fill: P.fg3, weight: 700, ls: 1.5 }));

  clients.forEach((c, i) => {
    const cy = 162 + i * 70;
    ch.push(R(20, cy, W - 40, 64, i % 2 === 0 ? P.card : P.surface, { r: 10, stroke: P.border }));
    // Avatar
    ch.push(R(32, cy + 14, 36, 36, c.color + '20', { r: 10 }));
    ch.push(T(c.name[0], 32, cy + 22, 36, 20, { size: 14, weight: 800, fill: c.color, align: 'center' }));
    ch.push(T(c.name, 80, cy + 14, 160, 14, { size: 12, weight: 700, fill: P.fg }));
    ch.push(T(c.contact, 80, cy + 32, 160, 12, { size: 10, fill: P.fg3 }));
    ch.push(T('$' + c.ltv.toLocaleString(), W - 76, cy + 14, 60, 16, { size: 14, weight: 800, fill: P.gold, align: 'right' }));
    ch.push(T('lifetime', W - 72, cy + 34, 56, 12, { size: 9, fill: P.fg3, align: 'right' }));
    if (c.active > 0) {
      ch.push(Dot(W - 44, cy + 50, P.green, 6));
      ch.push(T(`${c.active} active`, W - 74, cy + 47, 30, 12, { size: 9, fill: P.green }));
    }
  });

  // Bottom nav
  ch.push(R(0, H - 82, W, 82, P.surface, {}));
  ch.push(HLine(0, H - 82, W, P.border));
  const navItems = ['▣ Home', '≡ Invoices', '◎ Time', '◈ Clients', '⊕ New'];
  navItems.forEach((item, i) => {
    const nx = i * (W / 5);
    const isActive = i === 3;
    ch.push(T(item.split(' ')[0], nx, H - 62, W / 5, 18, { size: 14, fill: isActive ? P.gold : P.fg3, align: 'center' }));
    ch.push(T(item.split(' ')[1], nx, H - 44, W / 5, 12, { size: 8, fill: isActive ? P.gold : P.fg3, align: 'center', weight: isActive ? 700 : 400 }));
    if (isActive) ch.push(R(nx + W / 10 - 12, H - 15, 24, 2, P.gold, { r: 1 }));
  });

  return F(sx, 0, W, H, P.bg, { clip: true, ch });
}

// ── M5: Revenue Analytics ─────────────────────────────────────────────────────
function mobileAnalytics(sx) {
  const W = 375, H = 812;
  const ch = [];

  ch.push(R(0, 0, W, H, P.bg));
  ch.push(E(300, 600, 180, 180, P.gold, { opacity: 0.04 }));

  ch.push(T('9:41', 20, 14, 60, 14, { size: 12, weight: 700, fill: P.fg }));
  ch.push(T('●●● ▲▼ ■■', W - 90, 14, 80, 14, { size: 9, fill: P.fg2, align: 'right' }));

  ch.push(T('ANALYTICS', 20, 46, 160, 22, { size: 18, weight: 900, fill: P.fg, ls: 3 }));

  // Period tabs
  ch.push(R(20, 80, W - 40, 32, P.surface, { r: 8, stroke: P.border }));
  ['MTD', 'QTD', 'YTD', '12M'].forEach((tab, i) => {
    const tabW = (W - 48) / 4;
    const tx = 24 + i * tabW;
    const isActive = i === 0;
    if (isActive) ch.push(R(tx - 2, 82, tabW, 28, P.gold + '22', { r: 6 }));
    ch.push(T(tab, tx, 88, tabW, 16, { size: 10, weight: 700, fill: isActive ? P.gold : P.fg3, align: 'center', ls: 1 }));
  });

  // Revenue chart (bar chart)
  ch.push(T('REVENUE', 20, 130, 100, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.5 }));
  ch.push(T('$14,280', 20, 144, 160, 28, { size: 24, weight: 900, fill: P.gold }));
  ch.push(T('↑ 12% vs last month', 20, 178, 180, 14, { size: 11, fill: P.green }));

  // Bar chart
  const chartW = W - 40;
  const chartH = 100;
  const chartY = 200;
  ch.push(R(20, chartY, chartW, chartH, P.surface, { r: 8, stroke: P.border }));
  const months = [
    { m: 'OCT', v: 0.52 }, { m: 'NOV', v: 0.64 }, { m: 'DEC', v: 0.48 },
    { m: 'JAN', v: 0.71 }, { m: 'FEB', v: 0.68 }, { m: 'MAR', v: 0.79 },
  ];
  const barAreaW = chartW - 20;
  const barW = Math.floor(barAreaW / months.length) - 4;
  months.forEach((m, i) => {
    const bx = 30 + i * (barAreaW / months.length);
    const bH = Math.round((chartH - 36) * m.v);
    const by = chartY + chartH - 20 - bH;
    const isActive = i === months.length - 1;
    ch.push(R(bx, by, barW, bH, isActive ? P.gold : P.gold + '44', { r: 3 }));
    ch.push(T(m.m, bx, chartY + chartH - 16, barW + 4, 12, { size: 8, fill: P.fg3, align: 'center' }));
    if (isActive) ch.push(T('$14.3k', bx - 8, by - 16, barW + 20, 12, { size: 9, fill: P.gold, align: 'center' }));
  });

  // Split breakdown
  ch.push(T('REVENUE BY CLIENT', 20, 318, 200, 14, { size: 10, fill: P.fg3, weight: 700, ls: 1.5 }));
  const breakdown = [
    { name: 'Vortex Labs',      pct: 0.34, amt: '$4,855', color: P.gold   },
    { name: 'North Quarter',    pct: 0.25, amt: '$3,570', color: P.blue   },
    { name: 'Hollow Earth Co',  pct: 0.19, amt: '$2,713', color: P.purple },
    { name: 'Dusk Studio',      pct: 0.12, amt: '$1,714', color: P.red    },
    { name: 'Others',           pct: 0.10, amt: '$1,428', color: P.muted  },
  ];
  breakdown.forEach((b, i) => {
    const by = 338 + i * 54;
    ch.push(T(b.name, 20, by + 4, 150, 14, { size: 12, weight: 600, fill: P.fg }));
    ch.push(T(b.amt, W - 72, by + 4, 60, 14, { size: 12, weight: 700, fill: b.color, align: 'right' }));
    ch.push(R(20, by + 24, chartW, 6, P.surface, { r: 3 }));
    ch.push(R(20, by + 24, Math.round(chartW * b.pct), 6, b.color, { r: 3, opacity: 0.8 }));
    ch.push(T(Math.round(b.pct * 100) + '%', 20 + Math.round(chartW * b.pct) + 4, by + 22, 30, 10, { size: 9, fill: b.color }));
  });

  // Bottom nav
  ch.push(R(0, H - 82, W, 82, P.surface, {}));
  ch.push(HLine(0, H - 82, W, P.border));
  const navItems = ['▣ Home', '≡ Invoices', '◎ Time', '◈ Clients', '⊕ New'];
  navItems.forEach((item, i) => {
    const nx = i * (W / 5);
    ch.push(T(item.split(' ')[0], nx, H - 62, W / 5, 18, { size: 14, fill: P.fg3, align: 'center' }));
    ch.push(T(item.split(' ')[1], nx, H - 44, W / 5, 12, { size: 8, fill: P.fg3, align: 'center' }));
  });

  return F(sx, 0, W, H, P.bg, { clip: true, ch });
}

// ─────────────────────────────────────────────────────────────────────────────
// DESKTOP SCREENS (1440 × 900)
// ─────────────────────────────────────────────────────────────────────────────

const SIDEBAR_W = 220;
const TOPBAR_H  = 56;

function desktopSidebar(ch, W, H, activeIdx) {
  // Sidebar background
  ch.push(R(0, 0, SIDEBAR_W, H, P.surface, {}));
  ch.push(VLine(SIDEBAR_W, 0, H, P.border));

  // Logo
  ch.push(T('TILL', 24, 20, 80, 28, { size: 20, weight: 900, fill: P.gold, ls: 4 }));
  ch.push(T('v2.1', 82, 27, 30, 14, { size: 9, fill: P.fg3 }));
  ch.push(HLine(20, 58, SIDEBAR_W - 40, P.border));

  // User avatar
  ch.push(R(20, 70, 36, 36, P.gold + '20', { r: 10 }));
  ch.push(T('A', 20, 78, 36, 20, { size: 14, weight: 800, fill: P.gold, align: 'center' }));
  ch.push(T('Alex Rivera', 64, 72, 120, 14, { size: 12, weight: 600, fill: P.fg }));
  ch.push(T('@alexrivera.co', 64, 90, 130, 12, { size: 10, fill: P.fg3 }));

  ch.push(HLine(20, 116, SIDEBAR_W - 40, P.border));

  // Nav items
  const navItems = [
    { icon: '▣', label: 'Dashboard',   idx: 0 },
    { icon: '≡', label: 'Invoices',    idx: 1 },
    { icon: '◎', label: 'Time',        idx: 2 },
    { icon: '◈', label: 'Clients',     idx: 3 },
    { icon: '▦', label: 'Analytics',   idx: 4 },
  ];
  navItems.forEach((item, i) => {
    const ny = 128 + i * 44;
    const isActive = item.idx === activeIdx;
    if (isActive) ch.push(R(12, ny - 2, SIDEBAR_W - 24, 38, P.gold + '14', { r: 8 }));
    ch.push(T(item.icon, 28, ny + 10, 20, 18, { size: 13, fill: isActive ? P.gold : P.fg3 }));
    ch.push(T(item.label, 54, ny + 11, 130, 16, { size: 13, weight: isActive ? 700 : 400, fill: isActive ? P.fg : P.fg2 }));
    if (isActive) ch.push(R(SIDEBAR_W - 4, ny + 4, 4, 26, P.gold, { r: 2 }));
  });

  ch.push(HLine(20, H - 100, SIDEBAR_W - 40, P.border));

  // Bottom: settings / billing
  ch.push(T('⚙', 28, H - 90, 20, 20, { size: 14, fill: P.fg3 }));
  ch.push(T('Settings', 54, H - 87, 130, 16, { size: 13, fill: P.fg2 }));
  ch.push(T('↗', 28, H - 60, 20, 20, { size: 14, fill: P.fg3 }));
  ch.push(T('Upgrade to Pro', 54, H - 57, 130, 16, { size: 13, fill: P.fg2 }));
}

function desktopTopbar(ch, W, title, subtitle) {
  ch.push(R(SIDEBAR_W, 0, W - SIDEBAR_W, TOPBAR_H, P.surface, {}));
  ch.push(HLine(SIDEBAR_W, TOPBAR_H, W - SIDEBAR_W, P.border));
  ch.push(T(title, SIDEBAR_W + 28, 16, 400, 24, { size: 17, weight: 800, fill: P.fg }));
  if (subtitle) ch.push(T(subtitle, SIDEBAR_W + 28, 38, 400, 12, { size: 10, fill: P.fg3, ls: 0.5 }));
  // Right actions
  ch.push(R(W - 164, 14, 80, 28, P.gold, { r: 7 }));
  ch.push(T('+ New Invoice', W - 162, 20, 76, 16, { size: 10, weight: 700, fill: P.bg, align: 'center' }));
  ch.push(R(W - 76, 14, 48, 28, P.surface, { r: 7, stroke: P.border }));
  ch.push(T('⚙ ▼', W - 74, 20, 44, 16, { size: 11, fill: P.fg3, align: 'center' }));
}

// ── D1: Desktop Dashboard ─────────────────────────────────────────────────────
function desktopDashboard(sx) {
  const W = 1440, H = 900;
  const ch = [];

  ch.push(R(0, 0, W, H, P.bg));
  ch.push(E(800, -100, 400, 400, P.gold, { opacity: 0.03 }));

  desktopSidebar(ch, W, H, 0);
  desktopTopbar(ch, W, 'Dashboard', 'MARCH 2026 · WEEK 11');

  const CX = SIDEBAR_W + 28;
  const CW = W - SIDEBAR_W - 56;
  const TY = TOPBAR_H + 28;

  // KPI cards row
  const kpis = [
    { label: 'MTD REVENUE',    val: '$14,280', change: '+12%', up: true,  color: P.gold   },
    { label: 'OUTSTANDING',    val: '$3,200',  change: '2 inv', up: null, color: P.blue   },
    { label: 'OVERDUE',        val: '$800',    change: '1 inv', up: null, color: P.red    },
    { label: 'HOURS LOGGED',   val: '94.3h',   change: '+8%',  up: true,  color: P.purple },
  ];
  const kpiW = (CW - 36) / 4;
  kpis.forEach((k, i) => {
    const kx = CX + i * (kpiW + 12);
    ch.push(R(kx, TY, kpiW, 96, P.card, { r: 10, stroke: P.border }));
    ch.push(T(k.label, kx + 16, TY + 14, kpiW - 32, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.5 }));
    ch.push(T(k.val, kx + 16, TY + 32, kpiW - 32, 32, { size: 26, weight: 900, fill: k.color }));
    if (k.up !== null) {
      ch.push(T((k.up ? '↑ ' : '↓ ') + k.change, kx + 16, TY + 72, kpiW - 32, 12,
               { size: 10, fill: k.up ? P.green : P.red }));
    } else {
      ch.push(T(k.change, kx + 16, TY + 72, kpiW - 32, 12, { size: 10, fill: P.fg3 }));
    }
  });

  // Revenue chart + Invoice list side by side
  const chartY = TY + 116;
  const chartH = 280;
  const chartBlockW = Math.round(CW * 0.58);

  // Revenue area chart block
  ch.push(R(CX, chartY, chartBlockW, chartH, P.card, { r: 10, stroke: P.border }));
  ch.push(T('REVENUE TREND', CX + 20, chartY + 16, 200, 14, { size: 10, weight: 700, fill: P.fg3, ls: 1.5 }));
  ch.push(T('$14,280', CX + 20, chartY + 34, 200, 28, { size: 22, weight: 900, fill: P.gold }));
  ch.push(T('March 2026', CX + 20, chartY + 66, 200, 14, { size: 11, fill: P.fg3 }));

  // Draw bar chart within the block
  const bChartX = CX + 20;
  const bChartW = chartBlockW - 40;
  const bChartH = 130;
  const bChartY = chartY + 90;
  const months2 = [
    { m: 'Oct', v: 0.52, amt: '9.4k' },
    { m: 'Nov', v: 0.62, amt: '11.2k' },
    { m: 'Dec', v: 0.46, amt: '8.3k' },
    { m: 'Jan', v: 0.70, amt: '12.6k' },
    { m: 'Feb', v: 0.67, amt: '12.1k' },
    { m: 'Mar', v: 0.79, amt: '14.3k' },
  ];
  const bW2 = Math.floor(bChartW / months2.length) - 8;
  months2.forEach((m, i) => {
    const bx = bChartX + i * (bChartW / months2.length);
    const bH = Math.round(bChartH * m.v);
    const by = bChartY + bChartH - bH;
    const isActive = i === months2.length - 1;
    ch.push(R(bx + 4, by, bW2, bH, isActive ? P.gold : P.gold + '3A', { r: 4 }));
    if (isActive) {
      ch.push(R(bx + 2, by - 22, bW2 + 4, 18, P.gold + '22', { r: 4, stroke: P.gold + '44' }));
      ch.push(T('$' + m.amt, bx + 2, by - 19, bW2 + 4, 12, { size: 9, fill: P.gold, align: 'center' }));
    }
    ch.push(T(m.m, bx + 4, bChartY + bChartH + 6, bW2, 12, { size: 10, fill: P.fg3, align: 'center' }));
  });

  // Monthly goal
  ch.push(HLine(CX + 20, chartY + 240, chartBlockW - 40, P.border));
  ch.push(T('MONTHLY GOAL · $18,000', CX + 20, chartY + 250, 200, 12, { size: 9, fill: P.fg3, ls: 1 }));
  ch.push(R(CX + 20, chartY + 264, chartBlockW - 40, 4, P.surface, { r: 2 }));
  ch.push(R(CX + 20, chartY + 264, Math.round((chartBlockW - 40) * 0.793), 4, P.gold, { r: 2 }));
  ch.push(T('79%', CX + chartBlockW - 36, chartY + 260, 32, 12, { size: 10, weight: 700, fill: P.gold, align: 'right' }));

  // Recent invoices block
  const invX = CX + chartBlockW + 16;
  const invW = CW - chartBlockW - 16;
  ch.push(R(invX, chartY, invW, chartH, P.card, { r: 10, stroke: P.border }));
  ch.push(T('RECENT INVOICES', invX + 16, chartY + 16, invW - 32, 14, { size: 10, weight: 700, fill: P.fg3, ls: 1.5 }));
  ch.push(T('View all →', invX + invW - 70, chartY + 16, 58, 14, { size: 10, fill: P.gold, align: 'right' }));
  ch.push(HLine(invX + 16, chartY + 38, invW - 32, P.border));

  const recentInv = [
    { client: 'Vortex Labs',     num: '#041', amt: '$4,800', status: 'PAID',    color: P.green },
    { client: 'Hollow Earth Co', num: '#040', amt: '$2,200', status: 'PENDING', color: P.blue  },
    { client: 'North Quarter',   num: '#039', amt: '$3,600', status: 'PAID',    color: P.green },
    { client: 'Dusk Studio',     num: '#038', amt: '$800',   status: 'OVERDUE', color: P.red   },
    { client: 'Birch Digital',   num: '#037', amt: '$2,400', status: 'PAID',    color: P.green },
  ];
  recentInv.forEach((inv, i) => {
    const iy = chartY + 48 + i * 44;
    ch.push(T(inv.client, invX + 16, iy + 6, 130, 14, { size: 12, weight: 600, fill: P.fg }));
    ch.push(T(inv.num, invX + 16, iy + 24, 50, 12, { size: 10, fill: P.fg3 }));
    ch.push(Pill(invX + invW - 90 - (inv.status.length * 5.8 + 18), iy + 10, inv.status, inv.color + '22', inv.color));
    ch.push(T(inv.amt, invX + invW - 16, iy + 6, 60, 16, { size: 14, weight: 800, fill: P.fg, align: 'right' }));
    if (i < recentInv.length - 1) ch.push(HLine(invX + 16, iy + 40, invW - 32, P.border));
  });

  // Bottom row: Time allocation + Client summary
  const bottomY = chartY + chartH + 16;
  const bottomH = H - bottomY - 28;
  const timeW = Math.round(CW * 0.38);
  const clientW = CW - timeW - 16;

  // Time allocation
  ch.push(R(CX, bottomY, timeW, bottomH, P.card, { r: 10, stroke: P.border }));
  ch.push(T('TIME THIS WEEK', CX + 20, bottomY + 16, 200, 14, { size: 10, weight: 700, fill: P.fg3, ls: 1.5 }));
  ch.push(T('23h 40m', CX + 20, bottomY + 34, 200, 24, { size: 20, weight: 900, fill: P.fg }));
  const timeProjects = [
    { name: 'Vortex Labs',      hrs: 8.5,  color: P.gold   },
    { name: 'North Quarter',    hrs: 6.2,  color: P.blue   },
    { name: 'Hollow Earth Co',  hrs: 4.8,  color: P.purple },
    { name: 'Internal',         hrs: 4.2,  color: P.muted  },
  ];
  timeProjects.forEach((tp, i) => {
    const ty2 = bottomY + 68 + i * 30;
    ch.push(Dot(CX + 20, ty2 + 4, tp.color, 8));
    ch.push(T(tp.name, CX + 36, ty2, timeW - 80, 14, { size: 11, fill: P.fg }));
    ch.push(T(tp.hrs + 'h', CX + timeW - 36, ty2, 24, 14, { size: 11, weight: 700, fill: tp.color, align: 'right' }));
    ch.push(R(CX + 20, ty2 + 18, timeW - 40, 3, P.surface, { r: 2 }));
    ch.push(R(CX + 20, ty2 + 18, Math.round((timeW - 40) * (tp.hrs / 24)), 3, tp.color, { r: 2, opacity: 0.7 }));
  });

  // Active timer badge
  ch.push(R(CX + 20, bottomY + bottomH - 40, timeW - 40, 28, P.green + '18', { r: 8, stroke: P.green + '44' }));
  ch.push(Dot(CX + 32, bottomY + bottomH - 32, P.green, 6));
  ch.push(T('Timer running — Vortex Labs · 2h 34m', CX + 44, bottomY + bottomH - 33, timeW - 64, 14, { size: 11, fill: P.green }));

  // Client summary
  ch.push(R(CX + timeW + 16, bottomY, clientW, bottomH, P.card, { r: 10, stroke: P.border }));
  ch.push(T('TOP CLIENTS', CX + timeW + 36, bottomY + 16, 200, 14, { size: 10, weight: 700, fill: P.fg3, ls: 1.5 }));
  ch.push(T('By revenue, YTD', CX + timeW + clientW - 110, bottomY + 16, 98, 14, { size: 10, fill: P.fg3, align: 'right' }));
  ch.push(HLine(CX + timeW + 36, bottomY + 38, clientW - 32, P.border));
  const topClients = [
    { name: 'Vortex Labs',     ytd: '$18,400', color: P.gold   },
    { name: 'North Quarter',   ytd: '$11,200', color: P.blue   },
    { name: 'Hollow Earth',    ytd: '$8,600',  color: P.purple },
  ];
  topClients.forEach((tc, i) => {
    const ty3 = bottomY + 50 + i * 38;
    ch.push(R(CX + timeW + 36, ty3, 32, 32, tc.color + '20', { r: 8 }));
    ch.push(T(tc.name[0], CX + timeW + 36, ty3 + 8, 32, 16, { size: 12, weight: 800, fill: tc.color, align: 'center' }));
    ch.push(T(tc.name, CX + timeW + 76, ty3 + 6, 160, 14, { size: 12, weight: 600, fill: P.fg }));
    ch.push(T(tc.ytd, CX + timeW + clientW - 20, ty3 + 6, 80, 16, { size: 14, weight: 800, fill: tc.color, align: 'right' }));
    ch.push(T('YTD', CX + timeW + clientW - 20, ty3 + 24, 80, 12, { size: 9, fill: P.fg3, align: 'right' }));
  });

  return F(sx, 0, W, H, P.bg, { clip: true, ch });
}

// ── D2: Desktop Invoice Manager ───────────────────────────────────────────────
function desktopInvoiceManager(sx) {
  const W = 1440, H = 900;
  const ch = [];

  ch.push(R(0, 0, W, H, P.bg));
  desktopSidebar(ch, W, H, 1);
  desktopTopbar(ch, W, 'Invoices', 'ALL INVOICES · 24 TOTAL · $18,280 BILLED YTD');

  const CX = SIDEBAR_W + 0;
  const CW = W - SIDEBAR_W;
  const TY = TOPBAR_H;

  // Filter bar
  ch.push(R(CX, TY, CW, 44, P.surface, {}));
  ch.push(HLine(CX, TY + 44, CW, P.border));
  const filters = ['All', 'Paid', 'Pending', 'Overdue', 'Draft'];
  filters.forEach((f, i) => {
    const fx = CX + 20 + i * 80;
    const isActive = i === 0;
    if (isActive) {
      ch.push(R(fx - 6, TY + 8, f.length * 7 + 20, 28, P.gold + '1A', { r: 6 }));
      ch.push(T(f, fx, TY + 15, 60, 14, { size: 12, weight: 700, fill: P.gold }));
      ch.push(R(fx - 6, TY + 41, f.length * 7 + 20, 2, P.gold, {}));
    } else {
      ch.push(T(f, fx, TY + 15, 60, 14, { size: 12, fill: P.fg3 }));
    }
  });
  // Search
  ch.push(R(CX + CW - 240, TY + 8, 210, 28, P.card, { r: 8, stroke: P.border }));
  ch.push(T('⌕  Search invoices...', CX + CW - 228, TY + 14, 190, 16, { size: 11, fill: P.fg3 }));

  // Table header
  const tableY = TY + 56;
  ch.push(R(CX, tableY, CW, 32, P.surface, {}));
  ch.push(HLine(CX, tableY + 32, CW, P.border));
  const colsH = ['#', 'CLIENT', 'DESCRIPTION', 'ISSUED', 'DUE', 'AMOUNT', 'STATUS'];
  const colXs = [CX + 20, CX + 70, CX + 240, CX + 620, CX + 740, CX + 860, CX + 980];
  colsH.forEach((c, i) => {
    ch.push(T(c, colXs[i], tableY + 9, 150, 14, { size: 9, fill: P.fg3, weight: 700, ls: 1 }));
  });

  // Invoice rows
  const invoiceRows = [
    { num: '#041', client: 'Vortex Labs',     desc: 'Brand Strategy Sprint + Visual Identity',  issued: 'Mar 18', due: 'Apr 18', amt: '$4,800',  status: 'PAID',    color: P.green },
    { num: '#040', client: 'Hollow Earth Co', desc: 'UX Audit & Redesign Proposal',              issued: 'Mar 15', due: 'Apr 01', amt: '$2,200',  status: 'PENDING', color: P.blue  },
    { num: '#039', client: 'North Quarter',   desc: 'Motion Identity System (Phase 2)',          issued: 'Mar 12', due: 'Mar 30', amt: '$3,600',  status: 'PAID',    color: P.green },
    { num: '#038', client: 'Dusk Studio',     desc: 'Landing Page Design',                       issued: 'Mar 01', due: 'Mar 16', amt: '$800',    status: 'OVERDUE', color: P.red   },
    { num: '#037', client: 'Birch Digital',   desc: 'Webflow Development (5 sections)',          issued: 'Feb 24', due: 'Mar 10', amt: '$2,400',  status: 'PAID',    color: P.green },
    { num: '#036', client: 'Vortex Labs',     desc: 'Quarterly Strategy Session',               issued: 'Feb 18', due: 'Mar 05', amt: '$1,200',  status: 'PAID',    color: P.green },
    { num: '#035', client: 'North Quarter',   desc: 'Social Media Design System',               issued: 'Feb 10', due: 'Feb 25', amt: '$1,800',  status: 'PAID',    color: P.green },
    { num: '#034', client: 'Hollow Earth Co', desc: 'Discovery Call + Proposal',                issued: 'Feb 05', due: 'Feb 20', amt: '$600',    status: 'PAID',    color: P.green },
  ];

  invoiceRows.forEach((inv, i) => {
    const iy = tableY + 32 + i * 44;
    const isActive = i === 1; // Pending one highlighted
    if (i % 2 === 0) ch.push(R(CX, iy, CW, 44, P.card, {}));
    if (isActive) ch.push(R(CX, iy, CW, 44, P.blue + '08', {}));
    ch.push(HLine(CX, iy + 43, CW, P.border));
    ch.push(T(inv.num, colXs[0], iy + 14, 44, 16, { size: 11, fill: P.fg3, weight: 600 }));
    ch.push(T(inv.client, colXs[1], iy + 14, 164, 16, { size: 12, weight: 600, fill: P.fg }));
    ch.push(T(inv.desc, colXs[2], iy + 14, 374, 16, { size: 11, fill: P.fg2 }));
    ch.push(T(inv.issued, colXs[3], iy + 14, 80, 16, { size: 11, fill: P.fg3 }));
    ch.push(T(inv.due, colXs[4], iy + 14, 80, 16, { size: 11, fill: inv.status === 'OVERDUE' ? P.red : P.fg3 }));
    ch.push(T(inv.amt, colXs[5], iy + 12, 80, 20, { size: 14, weight: 800, fill: P.fg }));
    ch.push(Pill(colXs[6], iy + 13, inv.status, inv.color + '22', inv.color));
    // Row actions on hover (shown for active row)
    if (isActive) {
      ch.push(T('View  Edit  Send  ⋯', CX + CW - 160, iy + 14, 148, 16, { size: 11, fill: P.fg2, align: 'right' }));
    }
  });

  // Summary footer
  const footerY = tableY + 32 + invoiceRows.length * 44;
  ch.push(R(CX, footerY, CW, 44, P.surface, {}));
  ch.push(HLine(CX, footerY, CW, P.border));
  ch.push(T('Showing 8 of 24 invoices', CX + 20, footerY + 14, 240, 16, { size: 11, fill: P.fg3 }));
  ch.push(T('← Prev   1   2   3   Next →', CX + CW / 2 - 100, footerY + 14, 200, 16, { size: 11, fill: P.fg2, align: 'center' }));
  ch.push(T('Total Billed: $18,280 YTD', CX + CW - 200, footerY + 14, 188, 16, { size: 11, fill: P.gold, align: 'right' }));

  return F(sx, 0, W, H, P.bg, { clip: true, ch });
}

// ── D3: Desktop Time Tracker ──────────────────────────────────────────────────
function desktopTimeTracker(sx) {
  const W = 1440, H = 900;
  const ch = [];

  ch.push(R(0, 0, W, H, P.bg));
  desktopSidebar(ch, W, H, 2);
  desktopTopbar(ch, W, 'Time Tracker', 'MARCH 2026 · WEEK 11 · 23H 40M LOGGED');

  const CX = SIDEBAR_W + 28;
  const CW = W - SIDEBAR_W - 56;
  const TY = TOPBAR_H + 28;

  // Timer hero
  ch.push(R(CX, TY, CW, 100, P.card, { r: 12, stroke: P.border }));
  ch.push(R(CX, TY, 4, 100, P.green, { r: 2 }));
  ch.push(Dot(CX + 28, TY + 38, P.green, 8));
  ch.push(T('RUNNING', CX + 44, TY + 33, 80, 14, { size: 9, weight: 700, fill: P.green, ls: 2 }));
  ch.push(T('Vortex Labs — Brand Strategy Sprint', CX + 28, TY + 52, 500, 20, { size: 15, weight: 700, fill: P.fg }));
  ch.push(T('2:34:18', CX + CW - 200, TY + 26, 180, 48, { size: 42, weight: 900, fill: P.gold, align: 'right' }));
  ch.push(R(CX + CW - 100, TY + 28, 78, 44, P.red + '22', { r: 10, stroke: P.red + '44' }));
  ch.push(T('■ Stop', CX + CW - 100, TY + 42, 78, 16, { size: 12, weight: 700, fill: P.red, align: 'center' }));
  ch.push(T('Start new timer', CX + CW - 226, TY + 78, 120, 14, { size: 11, fill: P.fg3, align: 'right' }));

  // Today + This week panels
  const panelY = TY + 120;
  const leftW = Math.round(CW * 0.55);
  const rightW = CW - leftW - 16;

  // Today's log
  ch.push(R(CX, panelY, leftW, H - panelY - 28, P.card, { r: 10, stroke: P.border }));
  ch.push(T("TODAY'S LOG · MAR 19", CX + 20, panelY + 16, 300, 14, { size: 10, weight: 700, fill: P.fg3, ls: 1.5 }));
  ch.push(T('6h 12m', CX + leftW - 80, panelY + 14, 68, 18, { size: 15, weight: 800, fill: P.gold, align: 'right' }));
  ch.push(HLine(CX + 20, panelY + 38, leftW - 40, P.border));

  // Table header
  ['PROJECT', 'TASK', 'START', 'END', 'DURATION'].forEach((h, i) => {
    const hx = [CX + 20, CX + 220, CX + 460, CX + 540, CX + 620][i];
    ch.push(T(h, hx, panelY + 48, 160, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1 }));
  });

  const sessions = [
    { project: 'Vortex Labs',     task: 'Brand Strategy — Sprint planning', start: '09:00', end: '—',     dur: '2h 34m', color: P.gold,   active: true  },
    { project: 'North Quarter',   task: 'UI Wireframes (Homepage)',          start: '07:00', end: '08:55', dur: '1h 55m', color: P.blue,   active: false },
    { project: 'Hollow Earth Co', task: 'Discovery Call (video)',            start: '06:00', end: '06:45', dur: '0h 45m', color: P.purple, active: false },
    { project: 'Internal',        task: 'Admin: invoices, email',            start: '05:00', end: '05:58', dur: '0h 58m', color: P.muted,  active: false },
  ];
  sessions.forEach((s, i) => {
    const sy = panelY + 68 + i * 52;
    if (i % 2 === 0) ch.push(R(CX, sy, leftW, 52, P.surface, {}));
    if (s.active) ch.push(R(CX, sy, leftW, 52, P.gold + '08', {}));
    ch.push(HLine(CX, sy + 51, leftW, P.border));
    ch.push(R(CX + 20, sy + 16, 4, 20, s.color, { r: 2 }));
    ch.push(T(s.project, CX + 32, sy + 16, 180, 14, { size: 12, weight: 600, fill: P.fg }));
    ch.push(T(s.task, CX + 220, sy + 16, 232, 14, { size: 11, fill: P.fg2 }));
    ch.push(T(s.start, CX + 460, sy + 16, 72, 14, { size: 11, fill: P.fg3 }));
    ch.push(T(s.end, CX + 540, sy + 16, 72, 14, { size: 11, fill: s.active ? P.gold : P.fg3 }));
    ch.push(T(s.dur, CX + 620, sy + 16, 80, 14, { size: 13, weight: 700, fill: s.color }));
    if (s.active) {
      ch.push(Dot(CX + leftW - 36, sy + 22, P.green, 6));
      ch.push(T('LIVE', CX + leftW - 28, sy + 18, 24, 12, { size: 9, fill: P.green, weight: 700 }));
    }
  });

  // Right panel: weekly breakdown
  ch.push(R(CX + leftW + 16, panelY, rightW, H - panelY - 28, P.card, { r: 10, stroke: P.border }));
  ch.push(T('WEEKLY BREAKDOWN', CX + leftW + 36, panelY + 16, 240, 14, { size: 10, weight: 700, fill: P.fg3, ls: 1.5 }));

  const days = [
    { day: 'MON', date: '16', hrs: 7.2, color: P.gold },
    { day: 'TUE', date: '17', hrs: 8.5, color: P.gold },
    { day: 'WED', date: '18', hrs: 5.8, color: P.gold },
    { day: 'THU', date: '19', hrs: 2.6, color: P.green, active: true },
    { day: 'FRI', date: '20', hrs: 0,   color: P.fg3 },
    { day: 'SAT', date: '21', hrs: 0,   color: P.fg3 },
    { day: 'SUN', date: '22', hrs: 0,   color: P.fg3 },
  ];
  const dayBarH = 120;
  const dayBarY = panelY + 40;
  const dayW = rightW / days.length;
  days.forEach((d, i) => {
    const dx = CX + leftW + 16 + i * dayW;
    const bH = Math.round(dayBarH * (d.hrs / 10));
    const by = dayBarY + dayBarH - bH;
    ch.push(R(dx + 8, dayBarY, dayW - 16, dayBarH, P.surface, { r: 4 }));
    if (bH > 0) ch.push(R(dx + 8, by, dayW - 16, bH, d.active ? P.gold : P.gold + '55', { r: 4 }));
    ch.push(T(d.day, dx, dayBarY + dayBarH + 8, dayW, 12, { size: 9, fill: d.active ? P.gold : P.fg3, align: 'center', weight: d.active ? 700 : 400 }));
    ch.push(T(d.date, dx, dayBarY + dayBarH + 22, dayW, 12, { size: 10, fill: P.fg3, align: 'center' }));
    if (d.hrs > 0) ch.push(T(d.hrs + 'h', dx, by - 14, dayW, 12, { size: 9, fill: d.color, align: 'center' }));
  });

  // Project breakdown donut-style
  const breakY = panelY + 40 + dayBarH + 52;
  ch.push(HLine(CX + leftW + 36, breakY - 12, rightW - 40, P.border));
  ch.push(T('BY PROJECT', CX + leftW + 36, breakY, rightW - 40, 14, { size: 10, fill: P.fg3, weight: 700, ls: 1.5 }));
  const wkProjects = [
    { name: 'Vortex Labs',      hrs: 8.5, color: P.gold   },
    { name: 'North Quarter',    hrs: 6.2, color: P.blue   },
    { name: 'Hollow Earth Co',  hrs: 4.8, color: P.purple },
    { name: 'Internal',         hrs: 4.2, color: P.muted  },
  ];
  wkProjects.forEach((wp, i) => {
    const wy = breakY + 22 + i * 40;
    ch.push(Dot(CX + leftW + 36, wy + 4, wp.color, 8));
    ch.push(T(wp.name, CX + leftW + 52, wy, rightW - 100, 16, { size: 12, fill: P.fg }));
    ch.push(T(wp.hrs + 'h', CX + leftW + rightW - 20, wy, 48, 16, { size: 13, weight: 700, fill: wp.color, align: 'right' }));
    ch.push(R(CX + leftW + 52, wy + 20, rightW - 100, 3, P.surface, { r: 2 }));
    ch.push(R(CX + leftW + 52, wy + 20, Math.round((rightW - 100) * (wp.hrs / 24)), 3, wp.color, { r: 2, opacity: 0.7 }));
  });

  return F(sx, 0, W, H, P.bg, { clip: true, ch });
}

// ── D4: Desktop Client Profile ────────────────────────────────────────────────
function desktopClientProfile(sx) {
  const W = 1440, H = 900;
  const ch = [];

  ch.push(R(0, 0, W, H, P.bg));
  desktopSidebar(ch, W, H, 3);
  desktopTopbar(ch, W, '← Clients / Vortex Labs', 'CLIENT PROFILE · ACTIVE SINCE JAN 2025');

  const CX = SIDEBAR_W + 28;
  const CW = W - SIDEBAR_W - 56;
  const TY = TOPBAR_H + 28;

  // Client hero card
  ch.push(R(CX, TY, CW, 110, P.card, { r: 12, stroke: P.gold + '33' }));
  ch.push(R(CX, TY, 4, 110, P.gold, {}));
  ch.push(R(CX + 24, TY + 24, 62, 62, P.gold + '20', { r: 14 }));
  ch.push(T('V', CX + 24, TY + 44, 62, 22, { size: 24, weight: 900, fill: P.gold, align: 'center' }));
  ch.push(T('Vortex Labs', CX + 100, TY + 24, 280, 28, { size: 22, weight: 900, fill: P.fg }));
  ch.push(T('james@vortexlabs.io  ·  San Francisco, CA  ·  Active Client', CX + 100, TY + 58, 400, 16, { size: 12, fill: P.fg3 }));
  // Stats
  const stats = [
    { label: 'LIFETIME VALUE', val: '$18,400', color: P.gold   },
    { label: 'INVOICES',       val: '12',      color: P.blue   },
    { label: 'AVG INVOICE',    val: '$1,533',  color: P.purple },
    { label: 'HOURS BILLED',   val: '94.5h',   color: P.green  },
  ];
  stats.forEach((s, i) => {
    const sx2 = CX + CW - 660 + i * 166;
    ch.push(VLine(sx2 - 12, TY + 20, 70, P.border));
    ch.push(T(s.val, sx2, TY + 22, 144, 28, { size: 22, weight: 900, fill: s.color }));
    ch.push(T(s.label, sx2, TY + 56, 144, 12, { size: 9, fill: P.fg3, weight: 600, ls: 1 }));
  });

  // Left: invoice history + timeline
  const leftW = Math.round(CW * 0.55);
  const rightW = CW - leftW - 16;
  const contentY = TY + 130;
  const contentH = H - contentY - 28;

  ch.push(R(CX, contentY, leftW, contentH, P.card, { r: 10, stroke: P.border }));
  ch.push(T('INVOICE HISTORY', CX + 20, contentY + 16, 200, 14, { size: 10, weight: 700, fill: P.fg3, ls: 1.5 }));
  ch.push(T('+ New Invoice', CX + leftW - 90, contentY + 14, 78, 18, { size: 11, fill: P.gold, align: 'right' }));
  ch.push(HLine(CX + 20, contentY + 38, leftW - 40, P.border));

  const vortexInvoices = [
    { num: '#041', desc: 'Brand Strategy Sprint',    date: 'Mar 18', amt: '$4,800', status: 'PAID',    color: P.green },
    { num: '#036', desc: 'Quarterly Strategy',       date: 'Feb 18', amt: '$1,200', status: 'PAID',    color: P.green },
    { num: '#031', desc: 'Visual Identity System',   date: 'Jan 22', amt: '$3,600', status: 'PAID',    color: P.green },
    { num: '#027', desc: 'Website Audit',            date: 'Jan 05', amt: '$800',   status: 'PAID',    color: P.green },
    { num: '#022', desc: 'Brand Discovery Workshop', date: 'Dec 12', amt: '$2,400', status: 'PAID',    color: P.green },
    { num: '#017', desc: 'Competitive Analysis',     date: 'Nov 28', amt: '$1,200', status: 'PAID',    color: P.green },
  ];
  vortexInvoices.forEach((inv, i) => {
    const iy = contentY + 50 + i * 50;
    if (i % 2 === 0) ch.push(R(CX, iy, leftW, 50, P.surface, {}));
    ch.push(HLine(CX, iy + 49, leftW, P.border));
    ch.push(T(inv.num, CX + 20, iy + 16, 44, 16, { size: 11, fill: P.fg3 }));
    ch.push(T(inv.desc, CX + 70, iy + 16, 300, 16, { size: 12, fill: P.fg }));
    ch.push(T(inv.date, CX + leftW - 250, iy + 16, 100, 16, { size: 11, fill: P.fg3 }));
    ch.push(T(inv.amt, CX + leftW - 130, iy + 13, 80, 20, { size: 15, weight: 800, fill: P.fg, align: 'right' }));
    ch.push(Pill(CX + leftW - 44, iy + 17, inv.status, inv.color + '22', inv.color));
  });

  // Right: notes + contacts + activity
  ch.push(R(CX + leftW + 16, contentY, rightW, Math.round(contentH * 0.45), P.card, { r: 10, stroke: P.border }));
  ch.push(T('NOTES', CX + leftW + 36, contentY + 16, 120, 14, { size: 10, weight: 700, fill: P.fg3, ls: 1.5 }));
  ch.push(T('+ Add note', CX + leftW + rightW - 20, contentY + 14, 80, 18, { size: 11, fill: P.gold, align: 'right' }));
  ch.push(HLine(CX + leftW + 36, contentY + 38, rightW - 40, P.border));
  const notes = [
    'Key contact: James Park (Founder). Prefers async comms via email.',
    'Retainer renewal due Q2. Discuss brand video production.',
    'Intro\'d to CFO Sarah Liu — potential invoice factoring interest.',
  ];
  notes.forEach((note, i) => {
    const ny = contentY + 52 + i * 52;
    ch.push(R(CX + leftW + 36, ny, 6, 38, P.gold, { r: 3 }));
    ch.push(T(note, CX + leftW + 50, ny + 4, rightW - 66, 32, { size: 11, fill: P.fg2, lh: 1.6 }));
  });

  // Activity feed
  const actY = contentY + Math.round(contentH * 0.45) + 12;
  ch.push(R(CX + leftW + 16, actY, rightW, contentH - Math.round(contentH * 0.45) - 12, P.card, { r: 10, stroke: P.border }));
  ch.push(T('RECENT ACTIVITY', CX + leftW + 36, actY + 16, 200, 14, { size: 10, weight: 700, fill: P.fg3, ls: 1.5 }));
  ch.push(HLine(CX + leftW + 36, actY + 38, rightW - 40, P.border));
  const activities = [
    { icon: '◉', desc: 'Invoice #041 marked paid · $4,800',  time: '2h ago',  color: P.green },
    { icon: '◈', desc: 'Time logged: 2h 34m (Brand Sprint)', time: 'Today',   color: P.gold  },
    { icon: '✉', desc: 'Invoice #041 sent via email',         time: 'Mar 18',  color: P.blue  },
    { icon: '◎', desc: 'Call logged: 45min discovery',        time: 'Mar 15',  color: P.purple },
  ];
  activities.forEach((a, i) => {
    const ay = actY + 52 + i * 44;
    ch.push(T(a.icon, CX + leftW + 36, ay + 4, 20, 20, { size: 12, fill: a.color }));
    ch.push(T(a.desc, CX + leftW + 60, ay + 4, rightW - 110, 16, { size: 11, fill: P.fg }));
    ch.push(T(a.time, CX + leftW + rightW - 20, ay + 4, 80, 16, { size: 10, fill: P.fg3, align: 'right' }));
  });

  return F(sx, 0, W, H, P.bg, { clip: true, ch });
}

// ── D5: Desktop Analytics ─────────────────────────────────────────────────────
function desktopAnalytics(sx) {
  const W = 1440, H = 900;
  const ch = [];

  ch.push(R(0, 0, W, H, P.bg));
  ch.push(E(1000, -100, 500, 500, P.gold, { opacity: 0.03 }));
  desktopSidebar(ch, W, H, 4);
  desktopTopbar(ch, W, 'Analytics', 'YEAR TO DATE 2026 · JAN – MAR');

  const CX = SIDEBAR_W + 28;
  const CW = W - SIDEBAR_W - 56;
  const TY = TOPBAR_H + 28;

  // Period selector
  ch.push(R(CX, TY - 12, CW, 36, 'transparent', {}));
  ['YTD 2026', 'Q1 2026', 'Last 12M', 'All Time'].forEach((tab, i) => {
    const tx = CX + i * 110;
    const isActive = i === 0;
    if (isActive) {
      ch.push(R(tx, TY - 10, 102, 28, P.gold + '1A', { r: 6 }));
      ch.push(T(tab, tx + 4, TY - 4, 94, 16, { size: 11, weight: 700, fill: P.gold }));
    } else {
      ch.push(T(tab, tx + 4, TY - 4, 94, 16, { size: 11, fill: P.fg3 }));
    }
  });

  // Top KPIs
  const kpiY = TY + 34;
  const kpis2 = [
    { label: 'TOTAL REVENUE',    val: '$38,280',  sub: 'YTD 2026',            color: P.gold   },
    { label: 'BILLED HOURS',     val: '284.5h',   sub: '↑ 22% vs Q1 2025',   color: P.purple },
    { label: 'AVG HOURLY RATE',  val: '$134.6',   sub: 'Effective rate',       color: P.blue   },
    { label: 'INVOICES SENT',    val: '24',        sub: '4 pending · 1 overdue', color: P.green },
    { label: 'COLLECTION RATE',  val: '96.4%',    sub: '$1,400 outstanding',   color: P.green  },
  ];
  const kpiW2 = (CW - 40) / 5;
  kpis2.forEach((k, i) => {
    const kx = CX + i * (kpiW2 + 10);
    ch.push(R(kx, kpiY, kpiW2, 80, P.card, { r: 10, stroke: P.border }));
    ch.push(T(k.label, kx + 14, kpiY + 10, kpiW2 - 28, 12, { size: 8, fill: P.fg3, weight: 700, ls: 1.2 }));
    ch.push(T(k.val, kx + 14, kpiY + 26, kpiW2 - 28, 28, { size: 22, weight: 900, fill: k.color }));
    ch.push(T(k.sub, kx + 14, kpiY + 60, kpiW2 - 28, 12, { size: 9, fill: P.fg3 }));
  });

  // Revenue waterfall chart (large)
  const chartY = kpiY + 96;
  const mainChartH = 220;
  const mainChartW = Math.round(CW * 0.6);
  ch.push(R(CX, chartY, mainChartW, mainChartH, P.card, { r: 10, stroke: P.border }));
  ch.push(T('MONTHLY REVENUE', CX + 20, chartY + 14, 240, 14, { size: 10, weight: 700, fill: P.fg3, ls: 1.5 }));
  ch.push(T('$38,280 YTD', CX + 20, chartY + 32, 200, 24, { size: 20, weight: 900, fill: P.gold }));
  ch.push(T('↑ 18% vs same period last year', CX + 180, chartY + 42, 220, 14, { size: 11, fill: P.green }));

  const mRevenue = [
    { m: 'Jan', v: 0.68, amt: '11.2k' },
    { m: 'Feb', v: 0.73, amt: '12.8k' },
    { m: 'Mar', v: 0.82, amt: '14.3k' },
  ];
  const allMonths = [
    { m: 'Apr', v: 0.31, est: true }, { m: 'May', v: 0.38, est: true },
    { m: 'Jun', v: 0.44, est: true },
  ];
  const allData = [...mRevenue.map(d => ({ ...d, est: false })), ...allMonths];
  const bArea = mainChartW - 40;
  const bAreaH = mainChartH - 90;
  const bY = chartY + 70;
  const bWd = Math.floor(bArea / 6) - 6;
  allData.forEach((m, i) => {
    const bx = CX + 20 + i * (bArea / 6);
    const bH = Math.round(bAreaH * m.v);
    const by = bY + bAreaH - bH;
    if (!m.est) {
      ch.push(R(bx + 3, by, bWd, bH, P.gold, { r: 4 }));
      if (m.amt) ch.push(T('$' + m.amt, bx, by - 16, bWd + 6, 12, { size: 9, fill: P.gold, align: 'center' }));
    } else {
      ch.push(R(bx + 3, by, bWd, bH, P.gold + '2A', { r: 4, stroke: P.gold + '44', sw: 1 }));
    }
    ch.push(T(m.m, bx, bY + bAreaH + 6, bWd + 6, 12, { size: 10, fill: m.est ? P.fg3 : P.fg2, align: 'center' }));
  });
  ch.push(T('Projected (based on pipeline)', CX + 20, chartY + mainChartH - 16, 240, 12, { size: 9, fill: P.fg3 }));
  ch.push(R(CX + 200, chartY + mainChartH - 18, 10, 8, P.gold + '2A', { r: 2, stroke: P.gold + '44', sw: 1 }));

  // Rate & efficiency panel
  const rateX = CX + mainChartW + 16;
  const rateW = CW - mainChartW - 16;
  ch.push(R(rateX, chartY, rateW, mainChartH, P.card, { r: 10, stroke: P.border }));
  ch.push(T('RATE BREAKDOWN', rateX + 20, chartY + 14, rateW - 40, 14, { size: 10, weight: 700, fill: P.fg3, ls: 1.5 }));
  ch.push(HLine(rateX + 20, chartY + 36, rateW - 40, P.border));
  const rates = [
    { label: 'Design',      rate: '$145/h', hrs: 124 },
    { label: 'Development', rate: '$135/h', hrs: 98  },
    { label: 'Strategy',    rate: '$180/h', hrs: 42  },
    { label: 'Admin',       rate: '$0/h',   hrs: 20  },
  ];
  rates.forEach((r2, i) => {
    const ry = chartY + 52 + i * 40;
    ch.push(T(r2.label, rateX + 20, ry, 120, 16, { size: 12, fill: P.fg }));
    ch.push(T(r2.rate, rateX + 140, ry, 80, 16, { size: 12, weight: 700, fill: P.gold }));
    ch.push(T(r2.hrs + 'h', rateX + rateW - 20, ry, 48, 16, { size: 12, fill: P.fg3, align: 'right' }));
    ch.push(R(rateX + 20, ry + 20, rateW - 40, 3, P.surface, { r: 2 }));
    ch.push(R(rateX + 20, ry + 20, Math.round((rateW - 40) * (r2.hrs / 180)), 3, P.gold, { r: 2, opacity: 0.6 }));
  });
  ch.push(HLine(rateX + 20, chartY + mainChartH - 44, rateW - 40, P.border));
  ch.push(T('EFFECTIVE RATE', rateX + 20, chartY + mainChartH - 32, 160, 14, { size: 10, fill: P.fg3, ls: 1 }));
  ch.push(T('$134.6/h', rateX + rateW - 20, chartY + mainChartH - 32, 80, 16, { size: 16, weight: 900, fill: P.gold, align: 'right' }));

  // Bottom row: client breakdown + goal tracking
  const bottomY = chartY + mainChartH + 16;
  const bottomH = H - bottomY - 28;
  const clientBW = Math.round(CW * 0.5);
  const goalW = CW - clientBW - 16;

  ch.push(R(CX, bottomY, clientBW, bottomH, P.card, { r: 10, stroke: P.border }));
  ch.push(T('REVENUE BY CLIENT', CX + 20, bottomY + 14, 200, 14, { size: 10, weight: 700, fill: P.fg3, ls: 1.5 }));
  ch.push(HLine(CX + 20, bottomY + 36, clientBW - 40, P.border));

  const clientData = [
    { name: 'Vortex Labs',      rev: 18400, pct: 0.48, color: P.gold   },
    { name: 'North Quarter',    rev: 11200, pct: 0.29, color: P.blue   },
    { name: 'Hollow Earth Co',  rev: 5800,  pct: 0.15, color: P.purple },
    { name: 'Others',           rev: 2880,  pct: 0.08, color: P.muted  },
  ];
  clientData.forEach((c, i) => {
    const cy = bottomY + 48 + i * 40;
    ch.push(Dot(CX + 20, cy + 6, c.color, 8));
    ch.push(T(c.name, CX + 36, cy, 180, 16, { size: 12, weight: 600, fill: P.fg }));
    ch.push(T('$' + c.rev.toLocaleString(), CX + clientBW - 110, cy, 88, 16, { size: 13, weight: 800, fill: c.color, align: 'right' }));
    ch.push(T(Math.round(c.pct * 100) + '%', CX + clientBW - 20, cy, 0, 16, { size: 12, fill: P.fg3, align: 'right' }));
    ch.push(R(CX + 36, cy + 22, clientBW - 56, 4, P.surface, { r: 2 }));
    ch.push(R(CX + 36, cy + 22, Math.round((clientBW - 56) * c.pct), 4, c.color, { r: 2, opacity: 0.8 }));
  });

  // Goal tracking
  ch.push(R(CX + clientBW + 16, bottomY, goalW, bottomH, P.card, { r: 10, stroke: P.border }));
  ch.push(T('ANNUAL GOALS', CX + clientBW + 36, bottomY + 14, 200, 14, { size: 10, weight: 700, fill: P.fg3, ls: 1.5 }));
  ch.push(HLine(CX + clientBW + 36, bottomY + 36, goalW - 40, P.border));

  const goals = [
    { label: 'Annual Revenue',  target: 160000, current: 38280, color: P.gold   },
    { label: 'Billable Hours',  target: 1200,   current: 284,   color: P.purple },
    { label: 'New Clients',     target: 12,     current: 3,     color: P.green  },
  ];
  goals.forEach((g, i) => {
    const gy = bottomY + 52 + i * 60;
    const pct = g.current / g.target;
    ch.push(T(g.label, CX + clientBW + 36, gy, goalW - 80, 16, { size: 12, fill: P.fg }));
    const cur = typeof g.current === 'number' && g.target > 100
      ? '$' + g.current.toLocaleString()
      : g.current.toString();
    const tgt = typeof g.target === 'number' && g.target > 100
      ? '$' + g.target.toLocaleString()
      : g.target.toString();
    ch.push(T(cur + ' / ' + tgt, CX + clientBW + goalW - 16, gy, 80, 16, { size: 12, fill: g.color, align: 'right' }));
    ch.push(R(CX + clientBW + 36, gy + 24, goalW - 56, 8, P.surface, { r: 4 }));
    ch.push(R(CX + clientBW + 36, gy + 24, Math.round((goalW - 56) * pct), 8, g.color, { r: 4 }));
    ch.push(T(Math.round(pct * 100) + '%', CX + clientBW + 36 + Math.round((goalW - 56) * pct) + 4, gy + 22, 36, 12, { size: 9, fill: g.color }));
    ch.push(T('Target: ' + tgt, CX + clientBW + 36, gy + 40, goalW - 56, 12, { size: 9, fill: P.fg3 }));
  });

  return F(sx, 0, W, H, P.bg, { clip: true, ch });
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSEMBLE .pen FILE
// ─────────────────────────────────────────────────────────────────────────────

// Screen gaps
const GAP = 40;
const MW = 375, MH = 812;
const DW = 1440, DH = 900;

const m1 = mobileDashboard(0);
const m2 = mobileInvoice(MW + GAP);
const m3 = mobileTimeTracker((MW + GAP) * 2);
const m4 = mobileClients((MW + GAP) * 3);
const m5 = mobileAnalytics((MW + GAP) * 4);

const desktopOffsetX = 0;
const desktopOffsetY = MH + GAP;
const d1 = desktopDashboard(desktopOffsetX);
const d2 = desktopInvoiceManager(desktopOffsetX + (DW + GAP));
const d3 = desktopTimeTracker(desktopOffsetX + (DW + GAP) * 2);
const d4 = desktopClientProfile(desktopOffsetX + (DW + GAP) * 3);
const d5 = desktopAnalytics(desktopOffsetX + (DW + GAP) * 4);

// Move desktop screens down
[d1, d2, d3, d4, d5].forEach(s => { s.y = desktopOffsetY; });

const doc = {
  version: '2.8',
  title: 'TILL — Zero-Admin Revenue OS for Freelancers',
  width:  (DW + GAP) * 5 - GAP,
  height: desktopOffsetY + DH,
  background: P.bg,
  children: [m1, m2, m3, m4, m5, d1, d2, d3, d4, d5],
};

const outPath = path.join(__dirname, 'till-app.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log('✓ Wrote', outPath);
console.log('  Screens:', doc.children.length, '(5 mobile + 5 desktop)');
console.log('  Canvas:', doc.width, '×', doc.height);
console.log('  Elements:', countElements(doc));

function countElements(node) {
  if (!node) return 0;
  let n = 1;
  if (node.children) node.children.forEach(c => { n += countElements(c); });
  return n;
}
