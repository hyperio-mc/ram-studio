'use strict';
// velox-app.js
// VELOX — AI Financial OS for Solopreneurs
//
// Design Challenge:
//   Design an AI-powered financial OS for solo founders + freelancers —
//   inspired by Linear's near-black #08090A aesthetic (darkmodedesign.com),
//   Midday's "one-person company" positioning (land-book.com/midday.ai),
//   and the bento-grid dashboard trend observed on godly.website.
//
// Heartbeat — March 20, 2026
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('fs');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:        '#07090C',   // near-black (Linear-inspired: #08090A)
  surface:   '#0D1119',   // elevated surface
  surface2:  '#141B26',   // card layer
  surface3:  '#1B2333',   // input/control bg
  border:    '#1E2A3D',   // subtle border
  border2:   '#27364E',   // active border
  muted:     '#3A4D68',   // muted labels
  muted2:    '#4F6480',   // mid-muted
  fg:        '#E4EAF4',   // primary text
  fg2:       '#8A9BB5',   // secondary text
  fg3:       '#4F6480',   // tertiary/hint
  accent:    '#5E5CE6',   // electric indigo (primary action)
  accentL:   '#7B79FF',   // lighter indigo for hover/glow
  accentDim: '#1A1940',   // indigo bg tint
  teal:      '#00D4A8',   // positive/income (teal-green)
  tealDim:   '#003D30',
  amber:     '#F5A623',   // warning / pending
  amberDim:  '#2D1E00',
  red:       '#FF4060',   // error / expense
  redDim:    '#2D0010',
  white:     '#FFFFFF',
};

// ── Gradient helpers ──────────────────────────────────────────────────────────
const lg = (rotation, stops) => ({
  type: 'gradient', gradientType: 'linear', rotation,
  colors: stops.map(([position, color]) => ({ position, color })),
});
const rg = (stops, cx = 0.5, cy = 0.5) => ({
  type: 'gradient', gradientType: 'radial',
  center: { x: cx, y: cy }, size: { width: 1, height: 1 },
  colors: stops.map(([position, color]) => ({ position, color })),
});

// ── Primitives ────────────────────────────────────────────────────────────────
let _id = 1;
const uid = () => `vel_${_id++}`;

function F(x, y, w, h, fill, opts = {}) {
  return {
    id: uid(), type: 'frame', x, y, width: w, height: h, fill,
    cornerRadius: opts.r ?? 0,
    opacity: opts.op ?? 1,
    children: opts.ch ?? [],
    ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw ?? 1, fill: opts.stroke } } : {}),
    ...(opts.clip !== undefined ? { clip: opts.clip } : {}),
    ...(opts.fx ? { effects: opts.fx } : {}),
  };
}
function T(content, x, y, w, h, opts = {}) {
  return {
    id: uid(), type: 'text', content, x, y, width: w, height: h,
    textGrowth: 'fixed-width-height',
    fontSize: opts.size ?? 13,
    fontWeight: String(opts.weight ?? 400),
    fill: opts.fill ?? P.fg,
    textAlign: opts.align ?? 'left',
    ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
    ...(opts.lh !== undefined ? { lineHeight: opts.lh } : {}),
    ...(opts.op !== undefined ? { opacity: opts.op } : {}),
  };
}
function E(x, y, w, h, fill, opts = {}) {
  return {
    id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
    ...(opts.op !== undefined ? { opacity: opts.op } : {}),
    ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw ?? 1, fill: opts.stroke } } : {}),
  };
}
function R(x, y, w, h, fill, opts = {}) {
  return F(x, y, w, h, fill, { r: opts.r ?? 6, ...opts });
}

const Line  = (x, y, w, fill = P.border) => F(x, y, w, 1, fill, {});
const VLine = (x, y, h, fill = P.border) => F(x, y, 1, h, fill, {});

// ── Orb glow ─────────────────────────────────────────────────────────────────
function Orb(cx, cy, r, color, op = 0.3) {
  return E(cx - r, cy - r, r * 2, r * 2,
    rg([[0, color + 'AA'], [0.6, color + '22'], [1, 'rgba(0,0,0,0)']]),
    { op });
}

// ── Sparkline (simplified bars) ───────────────────────────────────────────────
function SparkBars(x, y, w, h, values, color) {
  const n = values.length;
  const bw = Math.floor((w - (n - 1) * 2) / n);
  const max = Math.max(...values);
  return values.map((v, i) => {
    const bh = Math.round((v / max) * h);
    return R(x + i * (bw + 2), y + h - bh, bw, bh, color, { r: 2 });
  });
}

// ── Trend line (stepped bars, faked line via thin rects) ─────────────────────
function TrendLine(x, y, w, h, values, color) {
  const n = values.length;
  const dx = w / (n - 1);
  const max = Math.max(...values);
  const pts = values.map((v, i) => ({
    px: x + i * dx,
    py: y + h - (v / max) * h,
  }));
  // Render as dots + connecting bars
  const result = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const { px: x1, py: y1 } = pts[i];
    const { px: x2, py: y2 } = pts[i + 1];
    const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    result.push(F(x1, Math.min(y1, y2), Math.ceil(x2 - x1), Math.max(2, Math.abs(y2 - y1)), color, { op: 0.8 }));
  }
  // Dots
  pts.forEach(({ px, py }) => result.push(E(px - 3, py - 3, 6, 6, color)));
  return result;
}

// ── Status badge ──────────────────────────────────────────────────────────────
function Badge(x, y, text, color) {
  const w = text.length * 6.5 + 18;
  return F(x, y, w, 20, color + '22', {
    r: 10,
    stroke: color + '44', sw: 1,
    ch: [T(text, 9, 3, w - 18, 14, { size: 9, fill: color, weight: 600, ls: 0.8 })],
  });
}

// ── Transaction row ───────────────────────────────────────────────────────────
function TxRow(x, y, w, icon, name, category, amount, isIncome = false) {
  const amtColor = isIncome ? P.teal : P.fg;
  return F(x, y, w, 56, 'transparent', { ch: [
    // Icon bg
    R(0, 8, 38, 38, P.surface3, { r: 10 }),
    T(icon, 0, 8, 38, 38, { size: 16, align: 'center' }),
    // Name + category
    T(name,     48, 13, w - 130, 16, { size: 13, weight: 500, fill: P.fg }),
    T(category, 48, 31, w - 130, 13, { size: 10, fill: P.fg3, ls: 0.5 }),
    // Amount
    T((isIncome ? '+' : '−') + '$' + amount, w - 80, 14, 80, 16, { size: 13, weight: 600, fill: amtColor, align: 'right' }),
    // Divider
    Line(48, 54, w - 48, P.border),
  ]});
}

// ── KPI tile (bento grid cell) ────────────────────────────────────────────────
function KpiTile(x, y, w, h, label, value, sub, accentColor, opts = {}) {
  const children = [
    T(label, 16, 16, w - 32, 12, { size: 9, fill: P.fg3, ls: 2, weight: 500 }),
    T(value, 16, 34, w - 32, 36, { size: opts.valueSz ?? 26, weight: 700, fill: P.fg, ls: -0.5 }),
    T(sub,   16, 74, w - 32, 13, { size: 10, fill: accentColor }),
  ];
  if (opts.sparkValues) {
    children.push(...SparkBars(16, h - 44, w - 32, 30, opts.sparkValues, accentColor + '60'));
  }
  if (opts.badge) {
    children.push(Badge(w - opts.badge.text.length * 6.5 - 26, 16, opts.badge.text, opts.badge.color));
  }
  return F(x, y, w, h, P.surface, {
    r: 14,
    stroke: P.border, sw: 1,
    ch: [
      // Subtle accent glow top-left
      E(-30, -30, 100, 100, accentColor, { op: 0.06 }),
      ...children,
    ],
  });
}

// ── Nav tab (mobile bottom nav) ───────────────────────────────────────────────
function NavTab(x, icon, label, active = false) {
  return F(x, 0, 64, 52, 'transparent', { ch: [
    T(icon,  0, 4,  64, 28, { size: 20, align: 'center', fill: active ? P.accent : P.muted }),
    T(label, 0, 32, 64, 16, { size: 9,  align: 'center', fill: active ? P.accent : P.muted2, ls: 0.5, weight: active ? 600 : 400 }),
    ...(active ? [F(20, 50, 24, 2, P.accent, { r: 1 })] : []),
  ]});
}

// ── Invoice item row ──────────────────────────────────────────────────────────
function InvoiceRow(x, y, w, desc, qty, rate, total, isHeader = false) {
  const c = isHeader ? P.fg3 : P.fg;
  const sz = isHeader ? 9 : 12;
  const fw = isHeader ? 500 : 400;
  const ls = isHeader ? 1.5 : 0;
  return F(x, y, w, isHeader ? 24 : 40, 'transparent', { ch: [
    T(desc,  0,    isHeader ? 5 : 12, w * 0.45, isHeader ? 14 : 16, { size: sz, fill: c, weight: fw, ls }),
    T(qty,   w * 0.45, isHeader ? 5 : 12, 40, isHeader ? 14 : 16, { size: sz, fill: c, align: 'center', weight: fw, ls }),
    T(rate,  w * 0.62, isHeader ? 5 : 12, 70, isHeader ? 14 : 16, { size: sz, fill: c, align: 'right', weight: fw, ls }),
    T(total, w - 70, isHeader ? 5 : 12, 70, isHeader ? 14 : 16, { size: sz, fill: isHeader ? c : P.fg, align: 'right', weight: isHeader ? fw : 600, ls }),
    ...(!isHeader ? [Line(0, 38, w, P.border)] : []),
  ]});
}

// ── AI message bubble ─────────────────────────────────────────────────────────
function AiMsg(x, y, w, text, isUser = false) {
  const bg   = isUser ? P.accentDim : P.surface2;
  const brd  = isUser ? P.accent + '44' : P.border;
  const tc   = isUser ? P.accentL : P.fg2;
  const lines = Math.ceil(text.length / 38);
  const h = 16 + lines * 18 + 8;
  return F(x, y, w, h, bg, {
    r: isUser ? 12 : 12,
    stroke: brd, sw: 1,
    ch: [T(text, 14, 10, w - 28, lines * 18, { size: 12, fill: tc, lh: 1.6, weight: isUser ? 500 : 400 })],
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// MOBILE SCREENS — 390 × 844
// ══════════════════════════════════════════════════════════════════════════════
const MW = 390, MH = 844;

// ── M1: LANDING / HERO SCREEN ─────────────────────────────────────────────────
function mLanding() {
  const frame = F(0, 0, MW, MH, P.bg, { clip: true, ch: [] });

  // Atmospheric orbs
  frame.children.push(
    Orb(320, 180, 200, P.accent, 0.25),
    Orb(40,  600, 160, P.teal,   0.15),
  );

  // Status bar
  frame.children.push(
    T('9:41', 20, 14, 80, 16, { size: 13, weight: 600, fill: P.fg }),
    T('●●', MW - 60, 14, 50, 16, { size: 10, fill: P.fg3, align: 'right' }),
  );

  // Logo area
  frame.children.push(
    T('VELOX', MW / 2 - 60, 80, 120, 32, { size: 28, weight: 700, fill: P.fg, align: 'center', ls: 8 }),
    T('AI Financial OS', MW / 2 - 80, 118, 160, 18, { size: 12, fill: P.fg3, align: 'center', ls: 2 }),
  );

  // Hero visual — bento preview mosaic
  const bentoY = 162;
  // Large balance tile
  frame.children.push(
    F(20, bentoY, 220, 120, P.surface, {
      r: 16, stroke: P.border, sw: 1, ch: [
        E(-20, -20, 80, 80, P.accent, { op: 0.08 }),
        T('TOTAL BALANCE', 16, 14, 140, 12, { size: 8, fill: P.fg3, ls: 2.5 }),
        T('$84,291', 16, 32, 190, 36, { size: 30, weight: 700, fill: P.fg, ls: -1 }),
        T('↑ 12.4% this month', 16, 74, 190, 14, { size: 10, fill: P.teal }),
        ...SparkBars(16, 92, 190, 16, [40, 55, 48, 70, 65, 82, 91], P.teal + '70'),
      ],
    }),
    // Small profit tile
    F(248, bentoY, 122, 56, P.surface, {
      r: 12, stroke: P.border, sw: 1, ch: [
        T('PROFIT', 12, 10, 90, 10, { size: 8, fill: P.fg3, ls: 2 }),
        T('+$12,400', 12, 26, 100, 18, { size: 14, weight: 700, fill: P.teal }),
      ],
    }),
    // Small runway tile
    F(248, bentoY + 64, 122, 56, P.surface, {
      r: 12, stroke: P.border, sw: 1, ch: [
        T('RUNWAY', 12, 10, 90, 10, { size: 8, fill: P.fg3, ls: 2 }),
        T('18 mo', 12, 26, 100, 18, { size: 14, weight: 700, fill: P.amber }),
      ],
    }),
    // Tax reserve
    F(20, bentoY + 128, 350, 56, P.surface, {
      r: 12, stroke: P.border, sw: 1, ch: [
        T('TAX RESERVE', 16, 14, 120, 12, { size: 8, fill: P.fg3, ls: 2 }),
        T('$22,480', 16, 30, 100, 18, { size: 14, weight: 600, fill: P.fg }),
        // Reserve bar
        F(140, 18, 190, 18, P.surface3, { r: 9, ch: [
          F(0, 0, 190 * 0.62, 18, P.accent, { r: 9 }),
          T('62%', 190 - 36, 2, 34, 14, { size: 9, fill: P.fg, weight: 600, align: 'right' }),
        ]}),
      ],
    }),
  );

  // CTA section
  frame.children.push(
    T('Run your finances on autopilot.', 20, bentoY + 210, MW - 40, 44, {
      size: 20, weight: 700, fill: P.fg, lh: 1.5,
    }),
    T('AI that categorizes, invoices, and forecasts — so you focus on the work.', 20, bentoY + 260, MW - 40, 44, {
      size: 13, fill: P.fg3, lh: 1.65,
    }),
    // CTA button
    F(20, bentoY + 320, MW - 40, 52, P.accent, {
      r: 14, ch: [
        T('Get Early Access', 0, 16, MW - 40, 20, { size: 14, weight: 600, fill: P.white, align: 'center' }),
      ],
    }),
    T('Free 14-day trial · No credit card', 20, bentoY + 384, MW - 40, 16, {
      size: 10, fill: P.fg3, align: 'center',
    }),
  );

  // Bottom social proof
  frame.children.push(
    Line(20, bentoY + 418, MW - 40),
    T('★★★★★  Trusted by 2,400+ solopreneurs', 20, bentoY + 430, MW - 40, 16, {
      size: 10, fill: P.muted2, align: 'center',
    }),
  );

  return { ...frame, name: 'M1 · Landing' };
}

// ── M2: DASHBOARD (BENTO GRID) ────────────────────────────────────────────────
function mDashboard() {
  const frame = F(0, 0, MW, MH, P.bg, { clip: true, ch: [] });

  // Ambient orb
  frame.children.push(Orb(MW, 0, 220, P.accent, 0.18));

  // Status bar
  frame.children.push(
    T('9:41', 20, 14, 80, 16, { size: 13, weight: 600, fill: P.fg }),
    T('●●', MW - 60, 14, 50, 16, { size: 10, fill: P.fg3, align: 'right' }),
  );

  // Header
  frame.children.push(
    T('Good morning, Alex.', 20, 44, MW - 80, 26, { size: 19, weight: 700, fill: P.fg }),
    T('Mar 20 · Q1 Week 12', 20, 72, 180, 16, { size: 11, fill: P.fg3 }),
    // AI insight badge
    F(MW - 100, 50, 84, 26, P.accentDim, { r: 13, stroke: P.accent + '55', sw: 1, ch: [
      T('✦ AI Brief', 10, 5, 70, 16, { size: 10, fill: P.accentL, weight: 600 }),
    ]}),
  );

  const gy = 106;
  const gp = 10; // gap
  const cw = (MW - 40 - gp) / 2;

  // Bento grid: row 1 — Balance (full width)
  frame.children.push(
    F(20, gy, MW - 40, 100, P.surface, {
      r: 16, stroke: P.border, sw: 1, ch: [
        E(-30, -30, 120, 120, P.accent, { op: 0.07 }),
        T('TOTAL BALANCE', 16, 14, 180, 11, { size: 8, fill: P.fg3, ls: 2.5, weight: 500 }),
        T('$84,291.50', 16, 32, 250, 36, { size: 32, weight: 700, fill: P.fg, ls: -1 }),
        T('↑ +$4,820 this month', 16, 74, 200, 14, { size: 10, fill: P.teal }),
        // Micro sparkline right
        ...SparkBars(MW - 140, 20, 110, 60, [42, 58, 51, 73, 68, 85, 91], P.accent + '55'),
      ],
    }),
  );

  // Bento row 2: Income | Expenses (side by side)
  frame.children.push(
    F(20, gy + 110, cw, 88, P.surface, {
      r: 14, stroke: P.border, sw: 1, ch: [
        T('INCOME', 14, 12, cw - 28, 11, { size: 8, fill: P.fg3, ls: 2 }),
        T('+$18,400', 14, 30, cw - 28, 24, { size: 18, weight: 700, fill: P.teal }),
        T('↑ 8% vs last mo', 14, 60, cw - 28, 14, { size: 9, fill: P.teal + 'AA' }),
      ],
    }),
    F(20 + cw + gp, gy + 110, cw, 88, P.surface, {
      r: 14, stroke: P.border, sw: 1, ch: [
        T('EXPENSES', 14, 12, cw - 28, 11, { size: 8, fill: P.fg3, ls: 2 }),
        T('−$6,000', 14, 30, cw - 28, 24, { size: 18, weight: 700, fill: P.red }),
        T('↓ 3% vs last mo', 14, 60, cw - 28, 14, { size: 9, fill: P.red + 'AA' }),
      ],
    }),
  );

  // Bento row 3: Runway (2/3) | Tax (1/3)
  const rw1 = Math.floor((MW - 40 - gp) * 0.58);
  const rw2 = (MW - 40 - gp) - rw1;
  frame.children.push(
    F(20, gy + 208, rw1, 96, P.surface, {
      r: 14, stroke: P.border, sw: 1, ch: [
        T('RUNWAY', 14, 12, rw1 - 28, 11, { size: 8, fill: P.fg3, ls: 2 }),
        T('18 months', 14, 30, rw1 - 28, 26, { size: 20, weight: 700, fill: P.amber }),
        T('At current burn rate', 14, 62, rw1 - 28, 13, { size: 9, fill: P.fg3 }),
        // Runway bar
        F(14, 78, rw1 - 28, 6, P.border, { r: 3, ch: [
          F(0, 0, (rw1 - 28) * 0.55, 6, P.amber, { r: 3 }),
        ]}),
      ],
    }),
    F(20 + rw1 + gp, gy + 208, rw2, 96, P.surface, {
      r: 14, stroke: P.border, sw: 1, ch: [
        T('TAX Q1', 14, 12, rw2 - 28, 11, { size: 8, fill: P.fg3, ls: 2 }),
        T('$4,200', 14, 30, rw2 - 28, 24, { size: 18, weight: 700, fill: P.fg }),
        T('Due Apr 15', 14, 60, rw2 - 28, 14, { size: 9, fill: P.red }),
      ],
    }),
  );

  // Bento row 4: AI Insight banner
  frame.children.push(
    F(20, gy + 314, MW - 40, 72, P.accentDim, {
      r: 14, stroke: P.accent + '33', sw: 1, ch: [
        E(-20, -20, 80, 80, P.accent, { op: 0.12 }),
        T('✦', 16, 20, 24, 24, { size: 18, fill: P.accentL }),
        T('AI INSIGHT', 44, 14, 200, 11, { size: 8, fill: P.accentL, ls: 2.5, weight: 600 }),
        T('Invoice #INV-041 is 3 days overdue — send a reminder?', 44, 30, MW - 100, 30, {
          size: 11, fill: P.fg2, lh: 1.55,
        }),
        T('Remind →', MW - 90, 26, 66, 20, { size: 10, fill: P.accentL, weight: 600, align: 'right' }),
      ],
    }),
  );

  // Recent transactions header
  frame.children.push(
    T('Recent', 20, gy + 398, 120, 20, { size: 14, weight: 600, fill: P.fg }),
    T('See all →', MW - 80, gy + 400, 68, 16, { size: 11, fill: P.accent, align: 'right' }),
  );

  // 3 transaction rows
  const txY = gy + 424;
  frame.children.push(
    TxRow(20, txY,       MW - 40, '🖥', 'Figma',        'DESIGN TOOL',   '180.00'),
    TxRow(20, txY + 56,  MW - 40, '📦', 'Shopify Fee',  'PLATFORM',      '29.00'),
    TxRow(20, txY + 112, MW - 40, '💸', 'Client — Acme', 'PAYMENT',      '4,800.00', true),
  );

  // Bottom nav
  frame.children.push(
    F(0, MH - 70, MW, 70, P.surface, { stroke: P.border, sw: 1, ch: [
      NavTab(16,  '◎',  'Home',     true),
      NavTab(96,  '↑↓', 'Money',    false),
      NavTab(176, '📄', 'Invoices', false),
      NavTab(256, '✦',  'AI',       false),
      NavTab(310, '⚙',  'Settings', false),
    ]}),
  );

  return { ...frame, name: 'M2 · Dashboard' };
}

// ── M3: TRANSACTIONS / MONEY ───────────────────────────────────────────────────
function mTransactions() {
  const frame = F(0, 0, MW, MH, P.bg, { clip: true, ch: [] });

  // Status
  frame.children.push(T('9:41', 20, 14, 80, 16, { size: 13, weight: 600, fill: P.fg }));

  // Header
  frame.children.push(
    T('Money', 20, 44, 140, 30, { size: 22, weight: 700, fill: P.fg }),
    T('March 2026', 20, 76, 120, 16, { size: 11, fill: P.fg3 }),
  );

  // Income/Expense summary bar
  frame.children.push(
    F(20, 104, MW - 40, 72, P.surface, {
      r: 14, stroke: P.border, sw: 1, ch: [
        T('+$18,400', 14, 14, 130, 22, { size: 17, weight: 700, fill: P.teal }),
        T('INCOME', 14, 38, 80, 11, { size: 8, fill: P.fg3, ls: 2 }),
        VLine(160, 14, 44, P.border),
        T('−$6,000', 174, 14, 120, 22, { size: 17, weight: 700, fill: P.red }),
        T('EXPENSES', 174, 38, 90, 11, { size: 8, fill: P.fg3, ls: 2 }),
        VLine(310, 14, 44, P.border),
        T('$12,400', 322, 14, 100, 22, { size: 17, weight: 700, fill: P.fg }),
        T('NET', 322, 38, 60, 11, { size: 8, fill: P.fg3, ls: 2 }),
      ],
    }),
  );

  // Category filter chips
  const chips = ['All', 'Income', 'Expenses', 'Transfers'];
  let cx = 20;
  chips.forEach((chip, i) => {
    const cw = chip.length * 7.5 + 24;
    frame.children.push(
      F(cx, 190, cw, 30, i === 0 ? P.accent : P.surface, {
        r: 15, stroke: i === 0 ? P.accent : P.border, sw: 1,
        ch: [T(chip, 12, 7, cw - 24, 16, { size: 11, fill: i === 0 ? P.white : P.fg3, weight: i === 0 ? 600 : 400 })],
      }),
    );
    cx += cw + 8;
  });

  // Section label
  frame.children.push(
    T('TODAY', 20, 234, 80, 13, { size: 9, fill: P.fg3, ls: 2, weight: 500 }),
  );

  // Transactions
  const txList = [
    { icon: '🖥', name: 'Figma Pro',       cat: 'DESIGN', amt: '180.00', income: false },
    { icon: '💸', name: 'Acme Corp',       cat: 'CLIENT', amt: '4,800.00', income: true },
    { icon: '🎯', name: 'Notion',          cat: 'TOOLS',  amt: '16.00',  income: false },
    { icon: '📦', name: 'AWS S3',          cat: 'INFRA',  amt: '42.30',  income: false },
  ];

  let ty = 256;
  txList.forEach(tx => {
    frame.children.push(TxRow(20, ty, MW - 40, tx.icon, tx.name, tx.cat, tx.amt, tx.income));
    ty += 56;
  });

  frame.children.push(
    T('YESTERDAY', 20, ty + 8, 100, 13, { size: 9, fill: P.fg3, ls: 2, weight: 500 }),
  );
  ty += 28;

  const yesterday = [
    { icon: '🌐', name: 'Vercel',         cat: 'HOSTING', amt: '20.00', income: false },
    { icon: '💸', name: 'Stripe Payout', cat: 'PAYMENT', amt: '3,200.00', income: true },
  ];
  yesterday.forEach(tx => {
    frame.children.push(TxRow(20, ty, MW - 40, tx.icon, tx.name, tx.cat, tx.amt, tx.income));
    ty += 56;
  });

  // Bottom nav
  frame.children.push(
    F(0, MH - 70, MW, 70, P.surface, { stroke: P.border, sw: 1, ch: [
      NavTab(16,  '◎',  'Home',     false),
      NavTab(96,  '↑↓', 'Money',    true),
      NavTab(176, '📄', 'Invoices', false),
      NavTab(256, '✦',  'AI',       false),
      NavTab(310, '⚙',  'Settings', false),
    ]}),
  );

  return { ...frame, name: 'M3 · Transactions' };
}

// ── M4: INVOICE GENERATOR ─────────────────────────────────────────────────────
function mInvoice() {
  const frame = F(0, 0, MW, MH, P.bg, { clip: true, ch: [] });

  frame.children.push(T('9:41', 20, 14, 80, 16, { size: 13, weight: 600, fill: P.fg }));

  // Header
  frame.children.push(
    T('← Invoices', 20, 44, 120, 20, { size: 12, fill: P.accent }),
    T('INV-042', MW / 2 - 50, 44, 100, 20, { size: 14, weight: 600, fill: P.fg, align: 'center' }),
    Badge(MW - 88, 44, 'DRAFT', P.amber),
  );

  const cardY = 76;
  // Invoice card
  frame.children.push(
    F(20, cardY, MW - 40, 400, P.surface, {
      r: 16, stroke: P.border, sw: 1, ch: [
        // Invoice header
        F(0, 0, MW - 40, 56, P.surface2, { r: 16, ch: [
          T('VELOX', 20, 16, 80, 24, { size: 14, weight: 700, fill: P.accent, ls: 6 }),
          T('Invoice', MW - 100, 16, 70, 24, { size: 14, weight: 600, fill: P.fg, align: 'right' }),
        ]}),
        // Client + date block
        T('BILL TO', 20, 72, 80, 11, { size: 8, fill: P.fg3, ls: 2 }),
        T('Acme Corporation', 20, 86, 200, 18, { size: 13, weight: 600, fill: P.fg }),
        T('billing@acme.com', 20, 106, 200, 14, { size: 11, fill: P.fg3 }),

        T('INVOICE DATE', MW - 180, 72, 140, 11, { size: 8, fill: P.fg3, ls: 2, align: 'right' }),
        T('Mar 20, 2026', MW - 180, 86, 140, 18, { size: 12, fill: P.fg, align: 'right' }),
        T('DUE', MW - 180, 110, 140, 11, { size: 8, fill: P.fg3, ls: 2, align: 'right' }),
        T('Apr 3, 2026', MW - 180, 124, 140, 18, { size: 12, fill: P.amber, align: 'right' }),

        Line(20, 148, MW - 80, P.border),

        // Items header + rows
        ...InvoiceRow(20, 152, MW - 80, 'DESCRIPTION', 'QTY', 'RATE', 'TOTAL', true).children,
        ...InvoiceRow(20, 180, MW - 80, 'Brand Design', '1', '$3,200', '$3,200').children,
        ...InvoiceRow(20, 220, MW - 80, 'Motion Assets', '4', '$400', '$1,600').children,
        ...InvoiceRow(20, 260, MW - 80, 'Consultation', '3h', '$200', '$600').children,

        Line(20, 306, MW - 80, P.border),

        // Totals
        T('Subtotal', 20, 316, 140, 16, { size: 11, fill: P.fg3 }),
        T('$5,400', MW - 90, 316, 70, 16, { size: 11, fill: P.fg, align: 'right' }),
        T('Tax (0%)', 20, 336, 140, 16, { size: 11, fill: P.fg3 }),
        T('$0', MW - 90, 336, 70, 16, { size: 11, fill: P.fg, align: 'right' }),
        F(20, 356, MW - 80, 32, P.surface3, { r: 8, ch: [
          T('TOTAL DUE', 12, 8, 140, 16, { size: 12, weight: 700, fill: P.fg }),
          T('$5,400.00', MW - 120, 8, 80, 16, { size: 14, weight: 700, fill: P.teal, align: 'right' }),
        ]}),
      ],
    }),
  );

  // Action buttons
  frame.children.push(
    F(20, cardY + 416, (MW - 52) / 2, 48, P.surface, {
      r: 12, stroke: P.border, sw: 1, ch: [
        T('Preview', 0, 14, (MW - 52) / 2, 20, { size: 13, fill: P.fg, align: 'center' }),
      ],
    }),
    F(20 + (MW - 52) / 2 + 12, cardY + 416, (MW - 52) / 2, 48, P.accent, {
      r: 12, ch: [
        T('Send Invoice', 0, 14, (MW - 52) / 2, 20, { size: 13, weight: 600, fill: P.white, align: 'center' }),
      ],
    }),
  );

  // Bottom nav
  frame.children.push(
    F(0, MH - 70, MW, 70, P.surface, { stroke: P.border, sw: 1, ch: [
      NavTab(16,  '◎',  'Home',     false),
      NavTab(96,  '↑↓', 'Money',    false),
      NavTab(176, '📄', 'Invoices', true),
      NavTab(256, '✦',  'AI',       false),
      NavTab(310, '⚙',  'Settings', false),
    ]}),
  );

  return { ...frame, name: 'M4 · Invoice' };
}

// ── M5: AI ASSISTANT ──────────────────────────────────────────────────────────
function mAI() {
  const frame = F(0, 0, MW, MH, P.bg, { clip: true, ch: [] });

  // Ambient glow
  frame.children.push(Orb(MW / 2, 160, 180, P.accent, 0.2));

  frame.children.push(T('9:41', 20, 14, 80, 16, { size: 13, weight: 600, fill: P.fg }));

  // Header
  frame.children.push(
    T('✦ Velox AI', 20, 44, 160, 28, { size: 20, weight: 700, fill: P.fg }),
    T('Financial intelligence, always on', 20, 74, MW - 40, 16, { size: 11, fill: P.fg3 }),
  );

  // Context pills
  const ctxPills = ['Cash Flow', 'Tax Strategy', 'Invoices', 'Runway'];
  let px = 20;
  ctxPills.forEach((pill, i) => {
    const pw = pill.length * 7.5 + 24;
    frame.children.push(F(px, 104, pw, 28, i === 0 ? P.accentDim : P.surface, {
      r: 14,
      stroke: i === 0 ? P.accent + '66' : P.border, sw: 1,
      ch: [T(pill, 12, 6, pw - 24, 16, { size: 11, fill: i === 0 ? P.accentL : P.fg3, weight: i === 0 ? 600 : 400 })],
    }));
    px += pw + 8;
  });

  // Chat area
  const chatY = 148;
  frame.children.push(
    // AI greeting
    F(20, chatY, 32, 32, P.accentDim, { r: 16, stroke: P.accent + '44', sw: 1, ch: [
      T('✦', 0, 7, 32, 18, { size: 12, fill: P.accentL, align: 'center' }),
    ]}),
    AiMsg(60, chatY, MW - 80, 'Hi Alex! Your March cash flow looks strong — $18,400 income with $6,000 expenses. Profit margin: 67%. Want me to optimize your Q2 tax withholding?', false),

    // User message
    AiMsg(60, chatY + 110, MW - 80, 'Yes — what should my quarterly estimate be?', true),

    // AI response
    F(20, chatY + 168, 32, 32, P.accentDim, { r: 16, stroke: P.accent + '44', sw: 1, ch: [
      T('✦', 0, 7, 32, 18, { size: 12, fill: P.accentL, align: 'center' }),
    ]}),
    AiMsg(60, chatY + 168, MW - 80, 'Based on your $12,400 net profit, I recommend setting aside $3,100 for Q2 (25% effective rate). I\'ve pre-filled an estimated payment reminder for Apr 15.', false),

    // Suggested actions
    T('SUGGESTED ACTIONS', 20, chatY + 296, 200, 13, { size: 9, fill: P.fg3, ls: 2 }),
  );

  const actionY = chatY + 316;
  const actions = ['Set tax reminder', 'Analyze Q1 spend', 'Draft Q2 forecast'];
  actions.forEach((act, i) => {
    frame.children.push(
      F(20, actionY + i * 46, MW - 40, 38, P.surface, {
        r: 10, stroke: P.border, sw: 1, ch: [
          T('→', 14, 10, 20, 18, { size: 13, fill: P.accent }),
          T(act, 38, 10, MW - 110, 18, { size: 12, fill: P.fg }),
        ],
      }),
    );
  });

  // Input bar
  frame.children.push(
    F(20, MH - 126, MW - 40, 44, P.surface2, {
      r: 22, stroke: P.border2, sw: 1, ch: [
        T('Ask Velox anything...', 18, 13, MW - 120, 18, { size: 13, fill: P.fg3 }),
        F(MW - 90, 8, 58, 28, P.accent, { r: 14, ch: [
          T('Send', 0, 6, 58, 16, { size: 11, weight: 600, fill: P.white, align: 'center' }),
        ]}),
      ],
    }),
  );

  // Bottom nav
  frame.children.push(
    F(0, MH - 70, MW, 70, P.surface, { stroke: P.border, sw: 1, ch: [
      NavTab(16,  '◎',  'Home',     false),
      NavTab(96,  '↑↓', 'Money',    false),
      NavTab(176, '📄', 'Invoices', false),
      NavTab(256, '✦',  'AI',       true),
      NavTab(310, '⚙',  'Settings', false),
    ]}),
  );

  return { ...frame, name: 'M5 · AI Assistant' };
}

// ══════════════════════════════════════════════════════════════════════════════
// DESKTOP SCREENS — 1440 × 900
// ══════════════════════════════════════════════════════════════════════════════
const DW = 1440, DH = 900;
const SIDEBAR_W = 240;
const CONTENT_X = SIDEBAR_W + 1;
const CONTENT_W = DW - SIDEBAR_W;

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar(activeIdx = 0) {
  const items = [
    { icon: '◎', label: 'Dashboard',  badge: '' },
    { icon: '↑↓', label: 'Money',     badge: '' },
    { icon: '📄', label: 'Invoices',  badge: '3' },
    { icon: '✦', label: 'AI Advisor', badge: '' },
    { icon: '◷', label: 'Reports',    badge: '' },
    { icon: '⚙', label: 'Settings',   badge: '' },
  ];

  const ch = [
    // Logo
    T('VELOX', 28, 28, 120, 24, { size: 16, weight: 700, fill: P.fg, ls: 6 }),
    T('Financial OS', 28, 54, 120, 14, { size: 9, fill: P.fg3, ls: 2 }),
    Line(20, 80, SIDEBAR_W - 40, P.border),
    // User pill
    F(20, 94, SIDEBAR_W - 40, 48, P.surface2, { r: 12, ch: [
      E(12, 10, 28, 28, P.accent + '44'),
      T('A', 12, 10, 28, 28, { size: 13, weight: 700, fill: P.accent, align: 'center' }),
      T('Alex Rakis', 50, 13, 110, 16, { size: 12, weight: 600, fill: P.fg }),
      T('Solopreneur', 50, 31, 110, 13, { size: 9, fill: P.fg3 }),
    ]}),
  ];

  items.forEach((item, i) => {
    const isActive = i === activeIdx;
    ch.push(
      F(12, 160 + i * 48, SIDEBAR_W - 24, 38, isActive ? P.accentDim : 'transparent', {
        r: 10,
        ch: [
          T(item.icon, 14, 9, 24, 20, { size: 14, fill: isActive ? P.accent : P.muted2 }),
          T(item.label, 44, 10, 140, 18, { size: 13, fill: isActive ? P.fg : P.fg2, weight: isActive ? 600 : 400 }),
          ...(item.badge ? [F(SIDEBAR_W - 56, 10, 22, 18, P.accent, { r: 9, ch: [
            T(item.badge, 0, 2, 22, 14, { size: 9, fill: P.white, align: 'center', weight: 700 }),
          ]})] : []),
        ],
      }),
    );
  });

  // Bottom: plan badge
  ch.push(
    Line(20, DH - 80, SIDEBAR_W - 40, P.border),
    F(20, DH - 64, SIDEBAR_W - 40, 44, P.surface2, { r: 10, ch: [
      T('✦ Pro Plan', 14, 6, 120, 14, { size: 10, fill: P.accentL, weight: 600, ls: 0.5 }),
      T('Renews Apr 1, 2026', 14, 24, 160, 13, { size: 9, fill: P.fg3 }),
    ]}),
  );

  return F(0, 0, SIDEBAR_W, DH, P.surface, { stroke: P.border, sw: 1, ch });
}

// ── D1: DESKTOP DASHBOARD ─────────────────────────────────────────────────────
function dDashboard() {
  const frame = F(0, 0, DW, DH, P.bg, { clip: true, ch: [] });

  // Ambient orbs
  frame.children.push(
    Orb(DW - 200, 100, 300, P.accent, 0.12),
    Orb(400,      DH,  250, P.teal,   0.08),
  );

  frame.children.push(Sidebar(0));

  const cx = CONTENT_X + 32;
  const cw = CONTENT_W - 64;

  // Top header
  frame.children.push(
    T('Good morning, Alex.', cx, 28, 500, 32, { size: 24, weight: 700, fill: P.fg }),
    T('Friday, March 20, 2026 · Q1 Week 12 of 13', cx, 64, 500, 18, { size: 12, fill: P.fg3 }),
    // AI insight toast
    F(DW - 340, 28, 280, 52, P.accentDim, { r: 14, stroke: P.accent + '44', sw: 1, ch: [
      T('✦ AI Insight', 14, 6, 160, 14, { size: 9, fill: P.accentL, ls: 1.5, weight: 600 }),
      T('Cash flow up 23% YTD · Tax deadline in 26 days', 14, 24, 250, 16, { size: 11, fill: P.fg2 }),
    ]}),
  );

  // ── KPI Strip ──
  const kpiY = 100;
  const kpiW = Math.floor((cw - 30) / 4);
  const kpis = [
    { label: 'TOTAL BALANCE',   value: '$84,291',  sub: '↑ +12.4% this month', color: P.teal,   spark: [42,58,51,73,68,85,91] },
    { label: 'MONTHLY INCOME',  value: '$18,400',  sub: '↑ +8% vs March',      color: P.teal,   spark: [60,55,72,68,80,75,92] },
    { label: 'MONTHLY EXPENSES',value: '$6,000',   sub: '↓ −3% vs March',      color: P.red,    spark: [80,72,68,74,62,58,61] },
    { label: 'Q1 TAX DUE',      value: '$4,200',   sub: '⚠ Apr 15 deadline',    color: P.amber,  spark: [20,40,60,80,100,100,100] },
  ];
  kpis.forEach((kpi, i) => {
    frame.children.push(KpiTile(cx + i * (kpiW + 10), kpiY, kpiW, 120,
      kpi.label, kpi.value, kpi.sub, kpi.color, { sparkValues: kpi.spark, valueSz: 22 }));
  });

  // ── Main content area ──
  const mainY = 240;
  const leftW = Math.floor(cw * 0.6);
  const rightW = cw - leftW - 16;

  // LEFT: Revenue chart
  frame.children.push(
    F(cx, mainY, leftW, 280, P.surface, {
      r: 16, stroke: P.border, sw: 1, ch: [
        T('REVENUE VS EXPENSES', 20, 18, 300, 12, { size: 9, fill: P.fg3, ls: 2.5, weight: 500 }),
        T('March 2026', 20, 36, 200, 18, { size: 14, weight: 600, fill: P.fg }),
        // Chart bars
        ...(() => {
          const weeks = ['W1', 'W2', 'W3', 'W4'];
          const rev    = [5200, 6800, 4100, 2300];
          const exp    = [1800, 2100, 1400, 700];
          const chartX = 20;
          const chartY = 68;
          const chartH = 160;
          const chartW = leftW - 80;
          const bw = Math.floor(chartW / weeks.length);
          const maxV = 8000;
          const els = [];
          // Y grid lines
          [0.25, 0.5, 0.75, 1].forEach(f => {
            els.push(Line(chartX, chartY + chartH * (1 - f), chartW, P.border));
            els.push(T(`$${Math.round(maxV * f / 1000)}k`, leftW - 50, chartY + chartH * (1 - f) - 6, 40, 12, { size: 9, fill: P.fg3, align: 'right' }));
          });
          weeks.forEach((w, i) => {
            const rh = Math.round((rev[i] / maxV) * chartH);
            const eh = Math.round((exp[i] / maxV) * chartH);
            const bx = chartX + i * bw;
            els.push(
              R(bx + 4,  chartY + chartH - rh, 18, rh, P.teal + 'BB', { r: 4 }),
              R(bx + 26, chartY + chartH - eh, 18, eh, P.red  + 'AA', { r: 4 }),
              T(w, bx + 4, chartY + chartH + 8, 50, 12, { size: 9, fill: P.fg3 }),
            );
          });
          // Legend
          els.push(
            R(leftW - 140, 18, 10, 10, P.teal, { r: 2 }),
            T('Revenue', leftW - 126, 16, 60, 14, { size: 10, fill: P.fg3 }),
            R(leftW - 66, 18, 10, 10, P.red, { r: 2 }),
            T('Expenses', leftW - 52, 16, 60, 14, { size: 10, fill: P.fg3 }),
          );
          return els;
        })(),
      ],
    }),
  );

  // LEFT BOTTOM: Top categories bento
  frame.children.push(
    F(cx, mainY + 296, leftW, 152, P.surface, {
      r: 16, stroke: P.border, sw: 1, ch: [
        T('TOP EXPENSE CATEGORIES', 20, 16, 300, 12, { size: 9, fill: P.fg3, ls: 2.5, weight: 500 }),
        ...(() => {
          const cats = [
            { name: 'Software & Tools', pct: 0.48, color: P.accent,  amt: '$2,880' },
            { name: 'Cloud Hosting',    pct: 0.27, color: P.teal,    amt: '$1,620' },
            { name: 'Contractors',      pct: 0.18, color: P.amber,   amt: '$1,080' },
            { name: 'Other',            pct: 0.07, color: P.muted2,  amt: '$420' },
          ];
          const barW = leftW - 220;
          return cats.map((c, i) => [
            T(c.name, 20, 42 + i * 26, 160, 14, { size: 11, fill: P.fg }),
            F(188, 46 + i * 26, barW, 6, P.border, { r: 3, ch: [
              F(0, 0, barW * c.pct, 6, c.color, { r: 3 }),
            ]}),
            T(c.amt, leftW - 60, 42 + i * 26, 50, 14, { size: 11, fill: c.color, align: 'right' }),
          ]).flat();
        })(),
      ],
    }),
  );

  // RIGHT: Recent transactions
  frame.children.push(
    F(cx + leftW + 16, mainY, rightW, 280, P.surface, {
      r: 16, stroke: P.border, sw: 1, ch: [
        T('RECENT TRANSACTIONS', 20, 18, 200, 12, { size: 9, fill: P.fg3, ls: 2.5, weight: 500 }),
        T('See all →', rightW - 80, 16, 66, 16, { size: 11, fill: P.accent, align: 'right' }),
        ...(() => {
          const txs = [
            { icon: '💸', name: 'Acme Corp',       cat: 'Client',   amt: '+$4,800', c: P.teal  },
            { icon: '🖥', name: 'Figma Pro',        cat: 'Tools',    amt: '−$180',   c: P.fg    },
            { icon: '📦', name: 'AWS',              cat: 'Hosting',  amt: '−$42',    c: P.fg    },
            { icon: '🎯', name: 'Notion',           cat: 'Tools',    amt: '−$16',    c: P.fg    },
            { icon: '💸', name: 'Stripe Payout',   cat: 'Payment',  amt: '+$3,200', c: P.teal  },
          ];
          return txs.map((tx, i) => [
            R(20, 48 + i * 46, 34, 34, P.surface3, { r: 9 }),
            T(tx.icon, 20, 48 + i * 46, 34, 34, { size: 14, align: 'center' }),
            T(tx.name, 62, 52 + i * 46, rightW - 170, 16, { size: 12, weight: 500, fill: P.fg }),
            T(tx.cat,  62, 68 + i * 46, rightW - 170, 13, { size: 9,  fill: P.fg3, ls: 1 }),
            T(tx.amt, rightW - 70, 52 + i * 46, 58, 16, { size: 12, weight: 600, fill: tx.c, align: 'right' }),
            Line(20, 88 + i * 46, rightW - 40, P.border),
          ]).flat();
        })(),
      ],
    }),
  );

  // RIGHT BOTTOM: Invoices
  frame.children.push(
    F(cx + leftW + 16, mainY + 296, rightW, 152, P.surface, {
      r: 16, stroke: P.border, sw: 1, ch: [
        T('INVOICES', 20, 16, 120, 12, { size: 9, fill: P.fg3, ls: 2.5, weight: 500 }),
        T('New →', rightW - 60, 14, 48, 16, { size: 11, fill: P.accent, align: 'right' }),
        ...(() => {
          const invs = [
            { num: 'INV-041', client: 'Beta Labs',   amt: '$8,400', status: 'OVERDUE',  sc: P.red   },
            { num: 'INV-040', client: 'Acme Corp',   amt: '$5,400', status: 'PAID',     sc: P.teal  },
            { num: 'INV-039', client: 'Stripe Inc',  amt: '$3,200', status: 'PENDING',  sc: P.amber },
          ];
          return invs.map((inv, i) => [
            T(inv.num,    20, 42 + i * 34, 80,  16, { size: 11, fill: P.fg2,   weight: 500 }),
            T(inv.client, 104, 42 + i * 34, 120, 16, { size: 11, fill: P.fg }),
            T(inv.amt,    rightW - 130, 42 + i * 34, 70, 16, { size: 11, fill: P.fg, align: 'right' }),
            Badge(rightW - 80, 40 + i * 34, inv.status, inv.sc),
          ]).flat();
        })(),
      ],
    }),
  );

  return { ...frame, name: 'D1 · Dashboard' };
}

// ── D2: ANALYTICS ────────────────────────────────────────────────────────────
function dAnalytics() {
  const frame = F(0, 0, DW, DH, P.bg, { clip: true, ch: [] });
  frame.children.push(
    Orb(800, DH / 2, 300, P.teal, 0.07),
    Orb(DW, 0, 200, P.accent, 0.1),
  );
  frame.children.push(Sidebar(4)); // Reports active

  const cx = CONTENT_X + 32;
  const cw = CONTENT_W - 64;

  // Header
  frame.children.push(
    T('Analytics', cx, 28, 300, 32, { size: 24, weight: 700, fill: P.fg }),
    T('Year-over-year financial performance · 2026', cx, 64, 500, 18, { size: 12, fill: P.fg3 }),
  );

  // Date range pills
  ['This Year', '6 Months', 'Quarter', 'Month'].forEach((r, i) => {
    frame.children.push(F(cx + i * 96, 92, 88, 28, i === 0 ? P.accent : P.surface, {
      r: 14, stroke: i === 0 ? P.accent : P.border, sw: 1,
      ch: [T(r, 0, 7, 88, 14, { size: 11, fill: i === 0 ? P.white : P.fg3, align: 'center', weight: i === 0 ? 600 : 400 })],
    }));
  });

  // Main chart: annual revenue
  const chartY = 136;
  const chartH = 220;
  const chartW = Math.floor(cw * 0.64);
  frame.children.push(
    F(cx, chartY, chartW, chartH + 60, P.surface, {
      r: 16, stroke: P.border, sw: 1, ch: [
        T('ANNUAL REVENUE', 20, 18, 250, 12, { size: 9, fill: P.fg3, ls: 2.5, weight: 500 }),
        T('$184,000 YTD', 20, 36, 250, 24, { size: 18, weight: 700, fill: P.fg }),
        T('↑ 34% vs 2025', 276, 42, 160, 18, { size: 12, fill: P.teal }),
        ...(() => {
          const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];
          const vals = [12400,14800,18400,16200,19800,22400,17200,21600,23800,0,0,0];
          const bw = Math.floor((chartW - 80) / 12);
          const mx = 24000;
          const els = [];
          [0.25,0.5,0.75,1].forEach(f => {
            els.push(Line(40, chartY + 68 + chartH * (1 - f), chartW - 60, P.border + '88'));
            els.push(T('$'+Math.round(mx*f/1000)+'k', 0, chartY + 64 + chartH * (1-f), 36, 12, { size: 9, fill: P.fg3, align: 'right' }));
          });
          vals.forEach((v, i) => {
            const bh = v > 0 ? Math.round((v / mx) * chartH) : 0;
            const bx = 40 + i * bw;
            if (v > 0) {
              els.push(
                R(bx + 2, chartY + 68 + chartH - bh, bw - 8, bh,
                  lg(180, [[0, P.teal + 'CC'], [1, P.teal + '33']]),
                  { r: 4 }
                ),
              );
            } else {
              els.push(R(bx + 2, chartY + 68 + chartH - 8, bw - 8, 8, P.border, { r: 4 }));
            }
            els.push(T(months[i], bx + 2, chartY + 68 + chartH + 10, bw - 4, 12, { size: 9, fill: P.fg3, align: 'center' }));
          });
          return els;
        })(),
      ],
    }),
  );

  // Right panel: metrics + runway
  const rpx = cx + chartW + 16;
  const rpw = cw - chartW - 16;
  frame.children.push(
    // Net profit
    F(rpx, chartY, rpw, 90, P.surface, {
      r: 14, stroke: P.border, sw: 1, ch: [
        T('NET PROFIT', 16, 14, 150, 12, { size: 9, fill: P.fg3, ls: 2 }),
        T('$124,000', 16, 32, 200, 28, { size: 22, weight: 700, fill: P.fg }),
        T('67% margin · vs $92k in 2025', 16, 64, rpw - 32, 14, { size: 10, fill: P.teal }),
      ],
    }),
    // Runway
    F(rpx, chartY + 106, rpw, 90, P.surface, {
      r: 14, stroke: P.border, sw: 1, ch: [
        T('RUNWAY', 16, 14, 150, 12, { size: 9, fill: P.fg3, ls: 2 }),
        T('18 months', 16, 32, 200, 28, { size: 22, weight: 700, fill: P.amber }),
        T('At $6k/mo burn · extended 4mo YoY', 16, 64, rpw - 32, 14, { size: 10, fill: P.amber + 'AA' }),
        F(16, 78, rpw - 32, 6, P.border, { r: 3, ch: [F(0, 0, (rpw - 32) * 0.55, 6, P.amber, { r: 3 })] }),
      ],
    }),
    // AI tax projection
    F(rpx, chartY + 212, rpw, 168, P.surface, {
      r: 14, stroke: P.border, sw: 1, ch: [
        T('AI TAX PROJECTION', 16, 14, 200, 12, { size: 9, fill: P.fg3, ls: 2 }),
        T('2026 FY', 16, 32, 100, 18, { size: 14, weight: 600, fill: P.fg }),
        ...(() => {
          const taxes = [
            { q: 'Q1', due: 'Apr 15', est: '$4,200', c: P.red },
            { q: 'Q2', due: 'Jun 15', est: '$5,100', c: P.amber },
            { q: 'Q3', due: 'Sep 15', est: '$4,800', c: P.fg3 },
            { q: 'Q4', due: 'Jan 15', est: '$5,600', c: P.fg3 },
          ];
          return taxes.map((t, i) => [
            T(t.q,   16,    58 + i * 26, 28,  16, { size: 10, fill: P.fg3, weight: 600 }),
            T(t.due, 44,    58 + i * 26, 80,  16, { size: 10, fill: P.fg3 }),
            T(t.est, rpw - 66, 58 + i * 26, 56, 16, { size: 10, fill: t.c, weight: 600, align: 'right' }),
          ]).flat();
        })(),
      ],
    }),
  );

  // Bottom row: expense breakdown + income sources
  const botY = chartY + (chartH + 60) + 16;
  const bw2 = Math.floor((cw - 16) / 2);

  // Expense donut + breakdown
  frame.children.push(
    F(cx, botY, bw2, DH - botY - 24, P.surface, {
      r: 16, stroke: P.border, sw: 1, ch: [
        T('EXPENSE BREAKDOWN', 20, 16, 250, 12, { size: 9, fill: P.fg3, ls: 2.5, weight: 500 }),
        // Donut rings
        E(bw2 / 2 - 60, 48, 120, 120, P.border, {}),
        E(bw2 / 2 - 50, 58, 100, 100, P.teal + '33', {}),
        E(bw2 / 2 - 40, 68, 80,  80,  P.accent + '44', {}),
        E(bw2 / 2 - 30, 78, 60,  60,  P.amber + '55', {}),
        T('$6,000', bw2 / 2 - 50, 98, 100, 20, { size: 14, weight: 700, fill: P.fg, align: 'center' }),
        T('TOTAL', bw2 / 2 - 30, 118, 60, 12, { size: 8, fill: P.fg3, align: 'center', ls: 2 }),
        // Legend
        ...['Software · 48%', 'Hosting · 27%', 'Contractors · 18%', 'Other · 7%'].map((l, i) => [
          R(20, 188 + i * 22, 10, 10, [P.accent, P.teal, P.amber, P.muted][i], { r: 2 }),
          T(l, 36, 186 + i * 22, bw2 - 56, 14, { size: 11, fill: P.fg2 }),
        ]).flat(),
      ],
    }),
    // Income sources
    F(cx + bw2 + 16, botY, bw2, DH - botY - 24, P.surface, {
      r: 16, stroke: P.border, sw: 1, ch: [
        T('INCOME SOURCES', 20, 16, 250, 12, { size: 9, fill: P.fg3, ls: 2.5, weight: 500 }),
        ...(() => {
          const sources = [
            { name: 'Client Projects',   pct: 0.72, amt: '$13,248', c: P.teal },
            { name: 'Retainer Contracts',pct: 0.20, amt: '$3,680',  c: P.accent },
            { name: 'Digital Products',  pct: 0.08, amt: '$1,472',  c: P.amber },
          ];
          return sources.map((s, i) => [
            T(s.name, 20, 42 + i * 44, 200, 16, { size: 12, fill: P.fg, weight: 500 }),
            T(s.amt,  20, 60 + i * 44, 200, 14, { size: 11, fill: s.c }),
            F(20, 78 + i * 44, bw2 - 40, 6, P.border, { r: 3, ch: [
              F(0, 0, (bw2 - 40) * s.pct, 6, s.c, { r: 3 }),
            ]}),
            T(Math.round(s.pct * 100) + '%', bw2 - 52, 42 + i * 44, 32, 16, { size: 11, fill: s.c, align: 'right', weight: 700 }),
          ]).flat();
        })(),
      ],
    }),
  );

  return { ...frame, name: 'D2 · Analytics' };
}

// ── D3: AI ADVISOR ────────────────────────────────────────────────────────────
function dAI() {
  const frame = F(0, 0, DW, DH, P.bg, { clip: true, ch: [] });
  frame.children.push(Orb(DW / 2, DH / 2, 320, P.accent, 0.1));
  frame.children.push(Sidebar(3)); // AI Advisor active

  const cx = CONTENT_X + 32;
  const cw = CONTENT_W - 64;

  // Header
  frame.children.push(
    T('✦ AI Advisor', cx, 28, 300, 32, { size: 24, weight: 700, fill: P.fg }),
    T('Financial intelligence, always on · Powered by Velox AI v2', cx, 64, 500, 18, { size: 12, fill: P.fg3 }),
  );

  // Context pills
  const ctxW = Math.floor(cw * 0.7);
  ['Cash Flow', 'Tax Strategy', 'Invoice Follow-up', 'Q2 Forecast', 'Expense Audit'].forEach((pill, i) => {
    const pw = pill.length * 8 + 24;
    frame.children.push(F(cx + [0,120,240,400,560][i], 92, pw, 30, i === 0 ? P.accentDim : P.surface, {
      r: 15, stroke: i === 0 ? P.accent + '66' : P.border, sw: 1,
      ch: [T(pill, 12, 7, pw - 24, 16, { size: 11, fill: i === 0 ? P.accentL : P.fg3, weight: i === 0 ? 600 : 400 })],
    }));
  });

  // Chat area (left 65%)
  const chatW = Math.floor(cw * 0.65);
  const chatH = DH - 200;
  frame.children.push(
    F(cx, 136, chatW, chatH, P.surface, {
      r: 16, stroke: P.border, sw: 1, ch: [
        // Messages
        ...(() => {
          const msgs = [
            { sender: 'ai', text: 'Good morning Alex! Here\'s your daily brief: Balance $84,291 ↑12%, 1 overdue invoice ($8,400 from Beta Labs), Q1 tax due in 26 days. Cash flow health: 92/100.' },
            { sender: 'user', text: 'What should I do about the Beta Labs invoice?' },
            { sender: 'ai', text: 'INV-041 for Beta Labs ($8,400) is 3 days overdue. I\'ve drafted a polite follow-up email. Their historical payment rate is 100% with an average delay of 5 days — so this is likely a timing issue. Send the reminder now?' },
            { sender: 'user', text: 'Yes, send it. Also what\'s my Q2 outlook?' },
            { sender: 'ai', text: 'Q2 Forecast: Estimated income $56,000 (based on active contracts + historical growth). Projected expenses $18,000. Net: $38,000. Recommended quarterly tax reserve: $9,500 (25% effective). Runway extends to 24 months by end of Q2. I\'ve queued a tax reminder for June 15.' },
          ];
          return msgs.map((m, i) => {
            const isUser = m.sender === 'user';
            const msgY = 20 + i * 100;
            const bgFill = isUser ? P.accentDim : P.surface2;
            const textColor = isUser ? P.accentL : P.fg2;
            const msgX = isUser ? chatW - (m.text.length > 60 ? chatW * 0.5 : chatW * 0.4) - 20 : 20;
            const msgW = m.text.length > 60 ? chatW * 0.8 : chatW * 0.55;
            const lines = Math.ceil(m.text.length / 70);
            const mh = 20 + lines * 18 + 8;
            return [
              ...(isUser ? [] : [
                E(20, msgY + 6, 28, 28, P.accentDim),
                T('✦', 20, msgY + 6, 28, 28, { size: 11, fill: P.accentL, align: 'center' }),
              ]),
              F(isUser ? chatW - msgW - 20 : 58, msgY, isUser ? msgW : chatW - 78, mh,
                bgFill, {
                  r: 12, stroke: (isUser ? P.accent : P.border) + '44', sw: 1,
                  ch: [T(m.text, 14, 10, (isUser ? msgW : chatW - 78) - 28, lines * 18, { size: 12, fill: textColor, lh: 1.6 })],
                }),
            ];
          }).flat();
        })(),
        // Input bar
        F(20, chatH - 60, chatW - 40, 44, P.surface3, {
          r: 22, stroke: P.border2, sw: 1, ch: [
            T('Ask Velox AI anything about your finances...', 18, 13, chatW - 150, 18, { size: 12, fill: P.fg3 }),
            F(chatW - 120, 8, 80, 28, P.accent, { r: 14, ch: [
              T('Send ↑', 0, 6, 80, 16, { size: 11, weight: 600, fill: P.white, align: 'center' }),
            ]}),
          ],
        }),
      ],
    }),
  );

  // Right panel: AI capabilities
  const rpx = cx + chatW + 16;
  const rpw = cw - chatW - 16;
  frame.children.push(
    F(rpx, 136, rpw, 200, P.surface, {
      r: 16, stroke: P.border, sw: 1, ch: [
        T('AI CAPABILITIES', 16, 16, 200, 12, { size: 9, fill: P.fg3, ls: 2.5, weight: 500 }),
        ...(['🧾 Invoice automation', '📊 Cash flow forecasting', '🧮 Tax optimization', '📬 Payment reminders', '🔍 Expense categorization'].map((cap, i) => [
          T(cap, 16, 38 + i * 32, rpw - 32, 18, { size: 12, fill: P.fg2 }),
          Line(16, 58 + i * 32, rpw - 32, P.border),
        ]).flat()),
      ],
    }),
    // Score card
    F(rpx, 352, rpw, 140, P.accentDim, {
      r: 16, stroke: P.accent + '33', sw: 1, ch: [
        E(-30, -30, 120, 120, P.accent, { op: 0.1 }),
        T('FINANCIAL HEALTH', 16, 16, 200, 12, { size: 9, fill: P.accentL, ls: 2, weight: 600 }),
        T('92', 16, 36, 80, 56, { size: 52, weight: 700, fill: P.accentL }),
        T('/ 100', 72, 60, 50, 24, { size: 16, fill: P.accent + 'AA', weight: 300 }),
        T('Excellent · Top 8% of solopreneurs', 16, 104, rpw - 32, 18, { size: 11, fill: P.fg2 }),
      ],
    }),
    // Quick actions
    F(rpx, 508, rpw, DH - 508 - 24, P.surface, {
      r: 16, stroke: P.border, sw: 1, ch: [
        T('QUICK ACTIONS', 16, 16, 200, 12, { size: 9, fill: P.fg3, ls: 2.5, weight: 500 }),
        ...(['Send overdue reminder', 'Generate Q1 report', 'Schedule tax payment', 'Forecast next quarter'].map((act, i) => [
          F(16, 38 + i * 46, rpw - 32, 38, P.surface2, { r: 10, stroke: P.border, sw: 1, ch: [
            T('→', 14, 10, 20, 18, { size: 12, fill: P.accent }),
            T(act, 34, 10, rpw - 80, 18, { size: 12, fill: P.fg }),
          ]}),
        ]).flat()),
      ],
    }),
  );

  return { ...frame, name: 'D3 · AI Advisor' };
}

// ══════════════════════════════════════════════════════════════════════════════
// BUILD + SAVE
// ══════════════════════════════════════════════════════════════════════════════
function build() {
  return {
    version: '2.8',
    children: [
      mLanding(),
      mDashboard(),
      mTransactions(),
      mInvoice(),
      mAI(),
      dDashboard(),
      dAnalytics(),
      dAI(),
    ],
  };
}

const pen = build();
const outPath = __dirname + '/velox.pen';
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ velox.pen written — ${pen.children.length} screens, ${(fs.statSync(outPath).size / 1024).toFixed(1)}KB`);
