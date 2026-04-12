'use strict';
// solus-app.js
// SOLUS — Financial OS for One-Person Companies
//
// Design Heartbeat — Mar 20, 2026
// Inspired by:
//   • Midday.ai (lapa.ninja) — "For the new wave of one-person companies"
//     dark finance product for solo founders, unified transactions + invoicing
//   • TRIONN (trionn.com via darkmodedesign.com) — near-black #121315 bg,
//     ice teal/pale blue text #E0EEEE, bold editorial wordmark, agency-dark aesthetic
//   • MoMoney (awwwards.com nominees, Mar 2026) — personal finance with refined dark UI
//   • Forge (forge-site.webflow.io via darkmodedesign.com) — #09130 deep black-green bg,
//     muted sage palette, strategy-first visual language

const fs   = require('fs');
const path = require('path');

// ── Palette ────────────────────────────────────────────────────────────────────
// Rooted in TRIONN's ice-teal-on-black + Midday's dark finance refinement
const P = {
  bg:       '#0B0C0E',   // near-black (inspired by TRIONN #121315, pushed deeper)
  surface:  '#131619',   // elevated card surface
  surface2: '#1A1E22',   // higher elevation / input bg
  border:   '#22272E',   // subtle border
  border2:  '#2E3540',   // stronger border / active state
  teal:     '#7FFFD4',   // ice teal accent — TRIONN ice-palette primary
  tealDim:  '#3BBFAA',   // dimmer teal for secondary elements
  ice:      '#DDEEED',   // pale ice text (TRIONN #E0EEEE exact reference)
  fg:       '#E4EDE8',   // warm ice off-white (body)
  fg2:      '#7A8F8C',   // muted teal-grey secondary
  fg3:      '#3A4A47',   // very muted tertiary
  green:    '#4AE3A0',   // positive cash / confirmed
  red:      '#FF6B6B',   // negative / expense
  yellow:   '#F5C84A',   // pending / invoice due
  purple:   '#9B87F5',   // tax reserve / savings
};

let _id = 0;
const uid = () => `sol${++_id}`;

// ── Core primitives ────────────────────────────────────────────────────────────
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
  fontSize: opts.size || 13,
  fontWeight: String(opts.weight || 400),
  fill: opts.fill || P.fg,
  textAlign: opts.align || 'left',
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh !== undefined ? { lineHeight: opts.lh } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  ...(opts.font ? { fontFamily: opts.font } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Line  = (x, y, w, fill = P.border) => F(x, y, w, 1, fill, {});

// Pill badge
const Pill = (x, y, text, bg, fg, opts = {}) => {
  const w = Math.max(text.length * 6.2 + 20, 36);
  return F(x, y, w, 20, bg, {
    r: 10,
    ch: [T(text, 8, 3, w - 16, 14, { size: 9, fill: fg, weight: 700, ls: 0.8, align: 'center' })],
    ...(opts.stroke ? { stroke: { align: 'inside', thickness: 1, fill: opts.stroke } } : {}),
  });
};

const Dot = (x, y, color) => E(x, y, 6, 6, color);

// Mini bar segment
const Bar = (x, y, w, h, fill, opts = {}) => F(x, y, w, h, fill, { r: opts.r || 3 });

// ── Shared layout ──────────────────────────────────────────────────────────────
const W   = 375;
const H   = 812;
const PAD = 20;
const SW  = W - PAD * 2;

// ── Status bar ─────────────────────────────────────────────────────────────────
function StatusBar() {
  return F(0, 0, W, 44, 'transparent', {
    ch: [
      T('9:41', 16, 14, 50, 16, { size: 12, fill: P.fg2, weight: 600 }),
      T('●●●●', W - 68, 14, 60, 16, { size: 10, fill: P.fg2, align: 'right' }),
    ],
  });
}

// ── Bottom nav ─────────────────────────────────────────────────────────────────
function BottomNav(activeIdx = 0) {
  const items = ['Home', 'Txns', 'Invoice', 'Forecast', 'Health'];
  const icons = ['◈', '↕', '◎', '~', '⬡'];
  const itemW = W / items.length;
  const ch = [F(0, 0, W, 1, P.border, {})];
  items.forEach((label, i) => {
    const active = i === activeIdx;
    const cx = i * itemW + itemW / 2;
    ch.push(T(icons[i], cx - 10, 10, 20, 20, { size: 14, fill: active ? P.teal : P.fg3, align: 'center' }));
    ch.push(T(label.toUpperCase(), cx - 22, 32, 44, 10, { size: 7.5, fill: active ? P.teal : P.fg3, weight: 700, ls: 0.6, align: 'center' }));
  });
  return F(0, H - 76, W, 76, P.bg, { ch, stroke: P.border });
}

// ── SCREEN 1: Dashboard ────────────────────────────────────────────────────────
// Bento grid — inspired by Midday's "at a glance" dashboard for indie founders
function buildScreen1() {
  const ch = [];
  ch.push(F(0, 0, W, H, P.bg, {}));

  // Subtle ambient glow — ice teal radial at top right
  ch.push(E(W - 60, -40, 200, 200, P.teal, { opacity: 0.05 }));

  ch.push(StatusBar());

  // Header
  ch.push(T('SOLUS', PAD, 50, 120, 28, { size: 22, weight: 900, fill: P.ice, ls: 5 }));
  ch.push(T('March 2026', PAD, 80, 140, 14, { size: 11, fill: P.fg2 }));

  // Avatar / settings icon
  ch.push(E(W - PAD - 32, 52, 32, 32, P.surface2, { stroke: P.border2, sw: 1 }));
  ch.push(T('RK', W - PAD - 26, 61, 20, 14, { size: 9, fill: P.teal, weight: 700, align: 'center' }));

  // Divider
  ch.push(Line(PAD, 100, SW));

  // ── BENTO GRID ──────────────────────────────────────────────────────────────
  const HW = (SW - 12) / 2;  // half-width
  let gy = 114;

  // ROW 1: Full-width revenue card
  ch.push(F(PAD, gy, SW, 110, P.surface, {
    r: 12, stroke: P.teal + '25',
    ch: [
      T('REVENUE · MTD', 16, 14, SW - 32, 10, { size: 8, fill: P.fg2, weight: 700, ls: 2 }),
      T('$28,450', 16, 30, 180, 34, { size: 32, fill: P.ice, weight: 900, ls: -0.5 }),
      T('+12.4% vs last month', 16, 68, 180, 14, { size: 10, fill: P.green }),
      Dot(14, 72, P.green),
      // Mini spark bars (8 bars representing weekly revenue)
      ...(() => {
        const bars = [];
        const vals = [0.4, 0.6, 0.5, 0.75, 0.9, 0.65, 0.8, 1.0];
        const bw = 14, gap = 6, bh_max = 36;
        const startX = SW - (vals.length * (bw + gap));
        vals.forEach((v, i) => {
          const bh = Math.round(v * bh_max);
          bars.push(Bar(startX + i * (bw + gap), 70 - bh, bw, bh, P.teal, { r: 3 }));
          bars.push(Bar(startX + i * (bw + gap), 70, bw, bh_max - bh, P.teal + '20', { r: 0 }));
        });
        return bars;
      })(),
      T('8W TREND', SW - (8 * 20) + 4, 78, 80, 10, { size: 7, fill: P.fg3, weight: 700, ls: 1 }),
    ],
  }));
  gy += 110 + 12;

  // ROW 2: half — Runway + half — AR Due
  ch.push(F(PAD, gy, HW, 88, P.surface, {
    r: 12, stroke: P.border,
    ch: [
      T('RUNWAY', 14, 12, HW - 28, 10, { size: 8, fill: P.fg3, weight: 700, ls: 1.5 }),
      T('6.2 mo', 14, 28, 120, 24, { size: 22, fill: P.ice, weight: 800 }),
      T('$98,200 cash', 14, 56, HW - 28, 12, { size: 9, fill: P.fg2 }),
      T('✓', HW - 28, 28, 16, 20, { size: 14, fill: P.green }),
    ],
  }));

  ch.push(F(PAD + HW + 12, gy, HW, 88, P.surface, {
    r: 12, stroke: P.border,
    ch: [
      T('INVOICES DUE', 14, 12, HW - 28, 10, { size: 8, fill: P.fg3, weight: 700, ls: 1.5 }),
      T('$12,400', 14, 28, 130, 24, { size: 22, fill: P.yellow, weight: 800 }),
      T('3 outstanding', 14, 56, HW - 28, 12, { size: 9, fill: P.fg2 }),
      T('!', HW - 24, 28, 12, 20, { size: 14, fill: P.yellow }),
    ],
  }));
  gy += 88 + 12;

  // ROW 3: Full-width recent transactions
  ch.push(F(PAD, gy, SW, 140, P.surface, {
    r: 12, stroke: P.border,
    ch: [
      T('RECENT TRANSACTIONS', 16, 14, 200, 10, { size: 8, fill: P.fg2, weight: 700, ls: 2 }),
      T('View all', SW - 68, 12, 52, 14, { size: 10, fill: P.teal }),
      Line(16, 30, SW - 32),
      // Txn rows
      ...[
        { name: 'Stripe payout',       cat: 'INCOME',  amt: '+$4,200', color: P.green,  icon: '↓' },
        { name: 'Figma subscription',  cat: 'TOOLS',   amt: '-$75',    color: P.red,    icon: '↑' },
        { name: 'AWS invoice',         cat: 'INFRA',   amt: '-$340',   color: P.red,    icon: '↑' },
      ].flatMap((t, i) => {
        const ty = 38 + i * 32;
        return [
          F(16, ty, 24, 24, t.color + '18', { r: 12, ch: [
            T(t.icon, 5, 4, 14, 14, { size: 11, fill: t.color, weight: 700, align: 'center' }),
          ]}),
          T(t.name, 46, ty + 3, 150, 14, { size: 11, fill: P.fg }),
          Pill(46, ty + 18, t.cat, P.border, P.fg2),
          T(t.amt, SW - 72, ty + 3, 60, 14, { size: 11, fill: t.color, weight: 700, align: 'right' }),
        ];
      }),
    ],
  }));
  gy += 140 + 12;

  // ROW 4: half — Tax Reserve + half — Expenses
  ch.push(F(PAD, gy, HW, 80, P.surface, {
    r: 12, stroke: P.border,
    ch: [
      T('TAX RESERVE', 14, 12, HW - 28, 10, { size: 8, fill: P.fg3, weight: 700, ls: 1.5 }),
      T('$5,690', 14, 28, 100, 22, { size: 18, fill: P.purple, weight: 700 }),
      T('30% auto-set aside', 14, 54, HW - 28, 12, { size: 8, fill: P.fg2 }),
    ],
  }));
  ch.push(F(PAD + HW + 12, gy, HW, 80, P.surface, {
    r: 12, stroke: P.border,
    ch: [
      T('EXPENSES', 14, 12, HW - 28, 10, { size: 8, fill: P.fg3, weight: 700, ls: 1.5 }),
      T('$2,890', 14, 28, 100, 22, { size: 18, fill: P.red, weight: 700 }),
      T('March · 18 items', 14, 54, HW - 28, 12, { size: 8, fill: P.fg2 }),
    ],
  }));

  ch.push(BottomNav(0));

  return { id: uid(), type: 'frame', name: 'S1-Dashboard', x: 0, y: 0, width: W, height: H, fill: P.bg, clip: false, children: ch };
}

// ── SCREEN 2: Transactions ─────────────────────────────────────────────────────
function buildScreen2() {
  const ch = [];
  ch.push(F(0, 0, W, H, P.bg, {}));
  ch.push(StatusBar());

  // Header
  ch.push(T('Transactions', PAD, 52, 240, 26, { size: 22, weight: 800, fill: P.ice }));
  ch.push(T('March 2026', PAD, 80, 140, 14, { size: 11, fill: P.fg2 }));

  // Filter pills
  const filters = ['All', 'Income', 'Expenses', 'Invoices'];
  let px = PAD;
  filters.forEach((f, i) => {
    const active = i === 0;
    const fw = f.length * 7 + 24;
    ch.push(F(px, 98, fw, 28, active ? P.teal : P.surface, {
      r: 14,
      stroke: active ? P.teal : P.border,
      ch: [T(f, 12, 6, fw - 24, 16, { size: 11, fill: active ? P.bg : P.fg2, weight: active ? 700 : 400 })],
    }));
    px += fw + 8;
  });

  // Month summary
  ch.push(F(PAD, 136, SW, 56, P.surface, {
    r: 10, stroke: P.border,
    ch: [
      T('IN', 14, 10, 40, 10, { size: 8, fill: P.green, weight: 700, ls: 1.5 }),
      T('+$28,450', 14, 24, 100, 16, { size: 14, fill: P.green, weight: 700 }),
      F((SW - 1) / 2, 12, 1, 32, P.border, {}),
      T('OUT', (SW / 2) + 14, 10, 40, 10, { size: 8, fill: P.red, weight: 700, ls: 1.5 }),
      T('-$2,890', (SW / 2) + 14, 24, 100, 16, { size: 14, fill: P.red, weight: 700 }),
    ],
  }));

  // Transaction list
  const txns = [
    { date: 'Today',         name: 'Client A — Retainer',    cat: 'INCOME',  amt: '+$8,000',  color: P.green,  icon: '↓' },
    { date: 'Today',         name: 'OpenAI API',             cat: 'TOOLS',   amt: '-$124',    color: P.red,    icon: '↑' },
    { date: 'Mar 19',        name: 'Client B — Project fee', cat: 'INCOME',  amt: '+$12,000', color: P.green,  icon: '↓' },
    { date: 'Mar 19',        name: 'Stripe processing fee',  cat: 'FEES',    amt: '-$36',     color: P.red,    icon: '↑' },
    { date: 'Mar 18',        name: 'GitHub Copilot',         cat: 'TOOLS',   amt: '-$19',     color: P.red,    icon: '↑' },
    { date: 'Mar 17',        name: 'Invoice #0042 payment',  cat: 'INCOME',  amt: '+$4,200',  color: P.green,  icon: '↓' },
    { date: 'Mar 15',        name: 'Stripe payout',          cat: 'INCOME',  amt: '+$4,250',  color: P.green,  icon: '↓' },
  ];

  let ty = 202;
  let lastDate = '';
  txns.forEach((t) => {
    if (t.date !== lastDate) {
      ch.push(T(t.date.toUpperCase(), PAD, ty, 120, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.5 }));
      ty += 18;
      lastDate = t.date;
    }
    ch.push(F(PAD, ty, SW, 52, P.surface, {
      r: 10,
      ch: [
        F(12, 12, 28, 28, t.color + '18', { r: 14, ch: [
          T(t.icon, 7, 6, 14, 14, { size: 12, fill: t.color, weight: 700, align: 'center' }),
        ]}),
        T(t.name, 50, 10, SW - 120, 16, { size: 12, fill: P.fg }),
        Pill(50, 28, t.cat, P.surface2, P.fg2),
        T(t.amt, SW - 70, 16, 58, 16, { size: 13, fill: t.color, weight: 700, align: 'right' }),
      ],
    }));
    ty += 60;
    if (ty > H - 120) return;
  });

  ch.push(BottomNav(1));
  return { id: uid(), type: 'frame', name: 'S2-Transactions', x: 0, y: 0, width: W, height: H, fill: P.bg, clip: false, children: ch };
}

// ── SCREEN 3: Invoice Builder ──────────────────────────────────────────────────
function buildScreen3() {
  const ch = [];
  ch.push(F(0, 0, W, H, P.bg, {}));
  ch.push(StatusBar());

  // Header
  ch.push(T('← Invoices', PAD, 52, 160, 16, { size: 12, fill: P.fg2 }));
  ch.push(T('New Invoice', PAD, 70, 200, 26, { size: 22, weight: 800, fill: P.ice }));

  // Draft badge
  ch.push(Pill(W - PAD - 48, 74, 'DRAFT', P.yellow + '22', P.yellow));

  // Invoice number + date
  ch.push(F(PAD, 104, SW, 44, P.surface, {
    r: 8, stroke: P.border,
    ch: [
      T('Invoice #', 14, 8, 80, 12, { size: 9, fill: P.fg3, ls: 0.5 }),
      T('0047', 14, 22, 80, 16, { size: 13, fill: P.ice, weight: 700, font: 'monospace' }),
      F(SW / 2, 6, 1, 32, P.border, {}),
      T('Due date', SW / 2 + 14, 8, 100, 12, { size: 9, fill: P.fg3, ls: 0.5 }),
      T('Apr 3, 2026', SW / 2 + 14, 22, 120, 16, { size: 13, fill: P.yellow, weight: 700 }),
    ],
  }));

  // Bill to
  ch.push(T('BILL TO', PAD, 158, 80, 10, { size: 8, fill: P.fg3, weight: 700, ls: 2 }));
  ch.push(F(PAD, 172, SW, 56, P.surface, {
    r: 8, stroke: P.border,
    ch: [
      T('Acme Corp Ltd.', 14, 10, 200, 16, { size: 13, fill: P.fg }),
      T('billing@acmecorp.com', 14, 30, 200, 14, { size: 10, fill: P.fg2 }),
      T('↓', SW - 28, 18, 16, 16, { size: 14, fill: P.fg2 }),
    ],
  }));

  // Line items
  ch.push(T('LINE ITEMS', PAD, 240, 100, 10, { size: 8, fill: P.fg3, weight: 700, ls: 2 }));

  const items = [
    { desc: 'Product Design — 4 weeks',    qty: 1,  rate: '$8,000',  total: '$8,000' },
    { desc: 'Brand identity system',        qty: 1,  rate: '$2,400',  total: '$2,400' },
    { desc: 'Figma handoff + prototype',    qty: 1,  rate: '$600',    total: '$600' },
  ];

  let iy = 254;
  items.forEach((item, i) => {
    ch.push(F(PAD, iy, SW, 50, P.surface, {
      r: 8, stroke: P.border,
      ch: [
        T(item.desc, 12, 8, SW - 120, 16, { size: 11, fill: P.fg }),
        T(`Qty: ${item.qty} × ${item.rate}`, 12, 28, SW - 100, 14, { size: 9, fill: P.fg2 }),
        T(item.total, SW - 80, 16, 68, 16, { size: 13, fill: P.ice, weight: 700, align: 'right' }),
        T('⋯', SW - 18, 16, 12, 16, { size: 14, fill: P.fg3 }),
      ],
    }));
    iy += 58;
  });

  // Add item button
  ch.push(F(PAD, iy, SW, 40, 'transparent', {
    r: 8, stroke: P.border,
    ch: [
      T('+ Add line item', SW / 2 - 52, 11, 104, 18, { size: 12, fill: P.teal, align: 'center' }),
    ],
  }));
  iy += 52;

  // Subtotals
  ch.push(Line(PAD, iy, SW));
  iy += 12;
  [
    { label: 'Subtotal', val: '$11,000' },
    { label: 'Tax (0%)', val: '$0.00' },
  ].forEach((r) => {
    ch.push(T(r.label, PAD, iy, 120, 16, { size: 11, fill: P.fg2 }));
    ch.push(T(r.val, W - PAD - 80, iy, 80, 16, { size: 11, fill: P.fg2, align: 'right' }));
    iy += 22;
  });
  ch.push(T('Total', PAD, iy, 120, 22, { size: 16, fill: P.ice, weight: 700 }));
  ch.push(T('$11,000', W - PAD - 100, iy, 100, 22, { size: 18, fill: P.teal, weight: 900, align: 'right' }));

  // CTA
  ch.push(F(PAD, H - 136, SW, 52, P.teal, {
    r: 10,
    ch: [T('Send Invoice', SW / 2 - 48, 15, 96, 22, { size: 14, fill: P.bg, weight: 800, align: 'center' })],
  }));
  ch.push(F(PAD, H - 78, SW, 42, P.surface, {
    r: 10, stroke: P.border,
    ch: [T('Save as Draft', SW / 2 - 48, 11, 96, 20, { size: 13, fill: P.fg2, align: 'center' })],
  }));

  ch.push(BottomNav(2));
  return { id: uid(), type: 'frame', name: 'S3-InvoiceBuilder', x: 0, y: 0, width: W, height: H, fill: P.bg, clip: false, children: ch };
}

// ── SCREEN 4: Cash Flow Forecast ───────────────────────────────────────────────
function buildScreen4() {
  const ch = [];
  ch.push(F(0, 0, W, H, P.bg, {}));
  ch.push(StatusBar());

  // Ambient glow
  ch.push(E(-40, H / 2 - 80, 200, 200, P.teal, { opacity: 0.04 }));

  // Header
  ch.push(T('Cash Flow', PAD, 52, 200, 26, { size: 22, weight: 800, fill: P.ice }));
  ch.push(T('12-week rolling forecast', PAD, 80, 220, 14, { size: 11, fill: P.fg2 }));

  // Period selector
  const periods = ['4W', '12W', '6M', '1Y'];
  let px = PAD;
  periods.forEach((p, i) => {
    const active = i === 1;
    ch.push(F(px, 98, 44, 26, active ? P.teal : P.surface, {
      r: 6, stroke: active ? P.teal : P.border,
      ch: [T(p, 8, 5, 28, 16, { size: 10, fill: active ? P.bg : P.fg2, weight: 700, align: 'center' })],
    }));
    px += 52;
  });

  // Current position
  ch.push(F(PAD, 134, SW, 64, P.surface, {
    r: 10, stroke: P.teal + '25',
    ch: [
      T('CURRENT BALANCE', 16, 12, 160, 10, { size: 8, fill: P.fg2, weight: 700, ls: 2 }),
      T('$98,200', 16, 28, 160, 26, { size: 24, fill: P.ice, weight: 900, ls: -0.5 }),
      T('Projected in 12w: $112,400', SW - 180, 36, 164, 14, { size: 10, fill: P.green, align: 'right' }),
      Dot(SW - 188, 40, P.green),
    ],
  }));

  // ── Chart area ─────────────────────────────────────────────────────────────
  const chartY = 210;
  const chartH = 180;
  const chartW = SW;

  ch.push(F(PAD, chartY, chartW, chartH, P.surface, { r: 12, stroke: P.border, ch: [] }));

  // Chart grid lines (horizontal)
  [0, 0.33, 0.66, 1].forEach((pct) => {
    const ly = chartY + chartH - Math.round(pct * (chartH - 40)) - 20;
    ch.push(Line(PAD + 8, ly, chartW - 16, P.border));
  });

  // Y-axis labels
  ['$50K', '$75K', '$100K', '$125K'].forEach((label, i) => {
    const ly = chartY + chartH - Math.round((i / 3) * (chartH - 40)) - 24;
    ch.push(T(label, PAD + 6, ly - 4, 38, 12, { size: 7.5, fill: P.fg3, align: 'left' }));
  });

  // Bar chart data (12 weeks of projected cash)
  const cashData = [98.2, 89.4, 102.0, 95.6, 108.3, 99.1, 111.5, 104.2, 112.4, 107.8, 116.0, 112.4];
  const maxVal = 130;
  const bw = Math.floor((chartW - 80) / cashData.length) - 4;
  const bStartX = PAD + 44;

  cashData.forEach((v, i) => {
    const bh = Math.round(((v - 60) / (maxVal - 60)) * (chartH - 40));
    const bx = bStartX + i * ((bw + 4));
    const by = chartY + chartH - bh - 20;
    const isPast = i < 3;
    ch.push(F(bx, by, bw, bh, isPast ? P.teal + '60' : P.teal + '30', { r: 3, ch: [] }));
    ch.push(F(bx, by, bw, 3, isPast ? P.teal : P.tealDim, { r: 2, ch: [] }));
  });

  // Week labels
  ['W1','W3','W6','W9','W12'].forEach((lbl, i) => {
    const positions = [0, 2, 5, 8, 11];
    const lx = bStartX + positions[i] * (bw + 4);
    ch.push(T(lbl, lx - 2, chartY + chartH - 14, 24, 10, { size: 7, fill: P.fg3, align: 'center' }));
  });

  // Legend
  ch.push(F(PAD + 46, chartY + 8, 8, 8, P.teal + '60', { r: 2, ch: [] }));
  ch.push(T('Actual', PAD + 58, chartY + 6, 60, 12, { size: 9, fill: P.fg2 }));
  ch.push(F(PAD + 106, chartY + 8, 8, 8, P.teal + '30', { r: 2, ch: [] }));
  ch.push(T('Forecast', PAD + 118, chartY + 6, 70, 12, { size: 9, fill: P.fg2 }));

  // Forecast breakdown cards
  const forecastY = chartY + chartH + 20;
  ch.push(T('FORECAST BREAKDOWN', PAD, forecastY, 200, 10, { size: 8, fill: P.fg2, weight: 700, ls: 2 }));

  const HW = (SW - 12) / 2;
  [
    { label: 'Expected income',  val: '+$36,400', color: P.green  },
    { label: 'Committed expenses', val: '-$22,200', color: P.red },
  ].forEach((item, i) => {
    const bx = PAD + i * (HW + 12);
    ch.push(F(bx, forecastY + 18, HW, 60, P.surface, {
      r: 10, stroke: P.border,
      ch: [
        T(item.label, 12, 10, HW - 24, 12, { size: 9, fill: P.fg2 }),
        T(item.val, 12, 26, HW - 24, 20, { size: 16, fill: item.color, weight: 700 }),
      ],
    }));
  });

  // Projected runway
  const runY = forecastY + 90;
  ch.push(F(PAD, runY, SW, 56, P.surface, {
    r: 10, stroke: P.purple + '44',
    ch: [
      T('PROJECTED RUNWAY', 16, 10, 180, 10, { size: 8, fill: P.fg2, weight: 700, ls: 2 }),
      T('8.4 months', 16, 26, 160, 22, { size: 18, fill: P.purple, weight: 700 }),
      T('at current burn rate', SW - 150, 30, 134, 14, { size: 10, fill: P.fg3, align: 'right' }),
    ],
  }));

  ch.push(BottomNav(3));
  return { id: uid(), type: 'frame', name: 'S4-CashFlowForecast', x: 0, y: 0, width: W, height: H, fill: P.bg, clip: false, children: ch };
}

// ── SCREEN 5: Financial Health ─────────────────────────────────────────────────
function buildScreen5() {
  const ch = [];
  ch.push(F(0, 0, W, H, P.bg, {}));
  ch.push(StatusBar());

  // Header
  ch.push(T('Financial Health', PAD, 52, 240, 26, { size: 22, weight: 800, fill: P.ice }));
  ch.push(T('Q1 · March 2026', PAD, 80, 180, 14, { size: 11, fill: P.fg2 }));

  // Health score card
  ch.push(F(PAD, 104, SW, 100, P.surface, {
    r: 12, stroke: P.teal + '30',
    ch: [
      T('BUSINESS HEALTH SCORE', 16, 14, 200, 10, { size: 8, fill: P.fg2, weight: 700, ls: 2 }),
      // Score ring (simulated)
      E(SW - 80, 12, 76, 76, 'transparent', { stroke: P.border2, sw: 3 }),
      E(SW - 80, 12, 76, 76, 'transparent', { stroke: P.teal, sw: 3, opacity: 0.8 }),
      T('84', SW - 60, 38, 36, 30, { size: 22, fill: P.teal, weight: 900, align: 'center' }),
      T('/100', SW - 42, 64, 30, 14, { size: 9, fill: P.fg3, align: 'center' }),
      T('GOOD', 16, 32, 60, 14, { size: 12, fill: P.teal, weight: 700 }),
      T('Up from 79 last quarter', 16, 50, 180, 14, { size: 10, fill: P.fg2 }),
      T('→ Review details', 16, 70, 140, 14, { size: 10, fill: P.teal }),
    ],
  }));

  // Metrics grid
  const metricsY = 218;
  ch.push(T('KEY METRICS', PAD, metricsY, 120, 10, { size: 8, fill: P.fg3, weight: 700, ls: 2 }));

  const metrics = [
    { label: 'Gross margin',    val: '68%',      delta: '+3%', ok: true },
    { label: 'Receivables age', val: '24 days',  delta: '-4d', ok: true },
    { label: 'Profit margin',   val: '41%',      delta: '+6%', ok: true },
    { label: 'Expense ratio',   val: '32%',      delta: '+1%', ok: false },
  ];

  const HW = (SW - 12) / 2;
  metrics.forEach((m, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const bx = PAD + col * (HW + 12);
    const by = metricsY + 18 + row * (72 + 10);
    ch.push(F(bx, by, HW, 70, P.surface, {
      r: 10, stroke: P.border,
      ch: [
        T(m.label.toUpperCase(), 12, 10, HW - 24, 10, { size: 8, fill: P.fg3, weight: 700, ls: 1 }),
        T(m.val, 12, 26, 100, 22, { size: 18, fill: P.ice, weight: 700 }),
        Pill(12, 52, m.delta, m.ok ? P.green + '22' : P.red + '22', m.ok ? P.green : P.red),
      ],
    }));
  });

  // Tax calendar
  const taxY = metricsY + 18 + 2 * 82 + 12;
  ch.push(T('TAX CALENDAR', PAD, taxY, 140, 10, { size: 8, fill: P.fg3, weight: 700, ls: 2 }));

  [
    { due: 'Apr 15', label: 'Q1 estimated tax',   amt: '$2,845',  status: 'DUE SOON' },
    { due: 'Jun 15', label: 'Q2 estimated tax',   amt: '~$3,200', status: 'UPCOMING' },
  ].forEach((item, i) => {
    ch.push(F(PAD, taxY + 18 + i * 56, SW, 48, P.surface, {
      r: 8, stroke: P.border,
      ch: [
        F(12, 12, 36, 24, P.surface2, { r: 6, ch: [
          T(item.due.split(' ')[0].toUpperCase(), 8, 4, 20, 10, { size: 7, fill: P.fg3, align: 'center' }),
          T(item.due.split(' ')[1], 6, 12, 24, 12, { size: 10, fill: P.ice, weight: 700 }),
        ]}),
        T(item.label, 56, 10, 170, 14, { size: 11, fill: P.fg }),
        T(item.amt, 56, 26, 100, 14, { size: 10, fill: P.fg2 }),
        Pill(SW - 80, 14, item.status, i === 0 ? P.yellow + '22' : P.border, i === 0 ? P.yellow : P.fg3),
      ],
    }));
  });

  // Export CTA
  const ctaY = taxY + 18 + 2 * 56 + 16;
  ch.push(F(PAD, ctaY, SW, 48, P.surface, {
    r: 10, stroke: P.border,
    ch: [
      T('Export financial report', 16, 14, 200, 16, { size: 13, fill: P.fg }),
      T('↗', SW - 32, 14, 16, 16, { size: 14, fill: P.teal }),
      T('PDF · CSV · Accountant export', 16, 32, 200, 12, { size: 9, fill: P.fg3 }),
    ],
  }));

  ch.push(BottomNav(4));
  return { id: uid(), type: 'frame', name: 'S5-FinancialHealth', x: 0, y: 0, width: W, height: H, fill: P.bg, clip: false, children: ch };
}

// ── Assemble & write ───────────────────────────────────────────────────────────
const doc = {
  version: '2.8',
  width: 375,
  height: 812,
  children: [
    buildScreen1(),
    buildScreen2(),
    buildScreen3(),
    buildScreen4(),
    buildScreen5(),
  ],
};

const outPath = path.join(__dirname, 'solus-app.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
const stat = fs.statSync(outPath);
console.log(`✓ solus-app.pen written — ${(stat.size / 1024).toFixed(1)} KB, ${doc.children.length} screens`);
doc.children.forEach((s, i) => {
  console.log(`  Screen ${i + 1}: ${s.name} — ${s.children.length} elements`);
});
