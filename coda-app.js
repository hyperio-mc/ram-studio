'use strict';
// coda-app.js
// CODA — Financial intelligence for independent consultants
//
// Challenge: Design a warm, editorial-light financial dashboard for solo
// consultants/freelancers, inspired by:
//
// 1. Midday.ai (darkmodedesign.com March 29 2026) — "business stack for modern
//    founders" — clean hero, invoicing + reconciliation + insights in one product.
//    Midday's dark precision made me want to invert it: what does financial
//    clarity look like in warm daylight?
//
// 2. GTM Analytics | Equals (land-book.com March 29 2026) — analytics product
//    with editorial typographic hierarchy, "business metrics that actually make
//    sense." Inspired the large-number stat cards + muted label style.
//
// 3. Cardless — Embedded Credit Card Platform (land-book.com, built on Framer)
//    — confident fintech with generous whitespace and a warm neutral base.
//    Pushed me toward the cream paper palette rather than cold white.
//
// Theme: LIGHT (zero was dark — alternating per protocol)
// Palette: Warm cream base, cognac amber accent, forest green for positives
// Screens: 5 mobile (390×844) — Today · Clients · Pipeline · Invoice · Close

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#FAF7F2',   // warm cream paper — Cardless-inspired neutral warmth
  surface:  '#FFFFFF',   // pure white card surface
  surface2: '#F4F0E8',   // slightly warm tinted surface
  surface3: '#EDE8DE',   // deeper cream for contrast areas
  border:   '#E0DAD0',   // warm cream border
  muted:    '#9B9288',   // warm taupe muted
  fg:       '#1A1514',   // deep warm charcoal
  fg2:      '#4A4440',   // secondary text
  accent:   '#C4700A',   // cognac amber — financial authority (Equals-inspired)
  green:    '#2E6B4F',   // forest green — positive/growth
  red:      '#C43A2A',   // warm red — alerts/overdue
  amber:    '#D4A017',   // amber — pending/warning
  dim:      '#F7F3ED',   // very light dim
};

let _id = 0;
const uid = () => `c${++_id}`;

// ── Primitives ────────────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill !== undefined ? fill : P.bg,
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
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Line  = (x, y, w, fill = P.border) => F(x, y, w, 1, fill, {});

// ── StatusBar (light) ─────────────────────────────────────────────────────────
const StatusBar = () => F(0, 0, 390, 48, P.bg, { ch: [
  T('9:41', 16, 16, 60, 18, { size: 15, weight: 600, fill: P.fg }),
  T('●●●', 310, 16, 64, 18, { size: 11, fill: P.muted, align: 'right' }),
]});

// ── Bottom Nav ────────────────────────────────────────────────────────────────
const BottomNav = (active) => {
  const items = [
    { label: 'Today',    icon: 'home' },
    { label: 'Clients',  icon: 'user' },
    { label: 'Pipeline', icon: 'activity' },
    { label: 'Invoice',  icon: 'list' },
    { label: 'Close',    icon: 'star' },
  ];
  return F(0, 780, 390, 64, P.surface, {
    stroke: P.border, sw: 1,
    ch: [
      Line(0, 0, 390, P.border),
      ...items.map((item, i) => {
        const x = i * 78;
        const isActive = item.label === active;
        return F(x, 0, 78, 64, 'transparent', { ch: [
          // Icon circle for active
          ...(isActive ? [F(x + 27, 8, 24, 24, P.accent + '18', { r: 12 })] : []),
          // Icon dot
          E(x + 35, isActive ? 15 : 16, 8, 8, isActive ? P.accent : P.muted + '80'),
          // Label
          T(item.label, x + 4, 36, 70, 14,
            { size: 10, fill: isActive ? P.accent : P.muted, align: 'center',
              weight: isActive ? 600 : 400 }),
        ]});
      }),
    ],
  });
};

// ── Divider Card util ─────────────────────────────────────────────────────────
const Card = (x, y, w, h, opts = {}) =>
  F(x, y, w, h, opts.fill || P.surface, {
    r: opts.r !== undefined ? opts.r : 12,
    stroke: opts.stroke || P.border,
    sw: 1,
    ch: opts.ch || [],
  });

// ── Progress bar ──────────────────────────────────────────────────────────────
const ProgressBar = (x, y, w, pct, color, bg = P.surface3) => [
  F(x, y, w, 4, bg, { r: 2 }),
  F(x, y, Math.round(w * pct / 100), 4, color, { r: 2 }),
];

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 1 — TODAY
// Daily financial snapshot — received today, outstanding, next due
// ─────────────────────────────────────────────────────────────────────────────
const Screen1 = () => {
  const children = [
    StatusBar(),

    // Header
    T('Sunday, March 29', 20, 60, 200, 20, { size: 13, fill: P.muted, ls: 0.3 }),
    T('Your Financial\nSnapshot', 20, 82, 280, 56, { size: 26, weight: 700, fill: P.fg, lh: 1.2 }),

    // Accent bar decoration
    F(20, 82, 3, 56, P.accent, { r: 2 }),

    // ── Big Hero Stat ─────────────────────────────────────────────────────
    Card(20, 148, 350, 96, { fill: P.fg, stroke: P.fg, ch: [
      T('MONTH-TO-DATE REVENUE', 16, 14, 200, 14, { size: 9, weight: 600, fill: '#FAF7F2', ls: 1.2, opacity: 0.6 }),
      T('$24,750', 16, 32, 200, 44, { size: 38, weight: 800, fill: '#FAF7F2', ls: -1 }),
      T('+12% vs last month', 220, 44, 120, 20, { size: 11, fill: P.green + 'FF', align: 'right',
        // override with light color since bg is dark
      }),
      // Green pill
      F(244, 42, 82, 22, P.green + '30', { r: 11, ch: [
        T('↑ +12%', 0, 4, 82, 14, { size: 11, weight: 600, fill: P.green + 'FF', align: 'center' }),
      ]}),
    ]}),

    // ── Three mini stats ─────────────────────────────────────────────────
    Card(20, 256, 110, 72, { ch: [
      T('RECEIVED TODAY', 10, 10, 90, 22, { size: 8, weight: 600, fill: P.muted, ls: 0.8, lh: 1.3 }),
      T('$3,200', 10, 34, 90, 28, { size: 20, weight: 700, fill: P.green }),
    ]}),
    Card(140, 256, 110, 72, { ch: [
      T('OUTSTANDING', 10, 10, 90, 22, { size: 8, weight: 600, fill: P.muted, ls: 0.8, lh: 1.3 }),
      T('$8,450', 10, 34, 90, 28, { size: 20, weight: 700, fill: P.amber }),
    ]}),
    Card(260, 256, 110, 72, { ch: [
      T('OVERDUE', 10, 10, 90, 22, { size: 8, weight: 600, fill: P.muted, ls: 0.8, lh: 1.3 }),
      T('$1,500', 10, 34, 90, 28, { size: 20, weight: 700, fill: P.red }),
    ]}),

    // ── Recent Activity ───────────────────────────────────────────────────
    T('RECENT ACTIVITY', 20, 342, 200, 14, { size: 10, weight: 700, fill: P.muted, ls: 1.4 }),

    Card(20, 362, 350, 200, { ch: [
      // Row 1
      F(16, 12, 28, 28, P.green + '1A', { r: 14, ch: [
        T('↓', 0, 5, 28, 18, { size: 13, fill: P.green, align: 'center', weight: 700 }),
      ]}),
      T('Acme Corp — Invoice #047', 54, 12, 200, 16, { size: 13, weight: 600, fill: P.fg }),
      T('Mar 28', 260, 12, 74, 16, { size: 12, fill: P.muted, align: 'right' }),
      T('Payment received', 54, 30, 180, 14, { size: 11, fill: P.muted }),
      T('+$3,200', 260, 28, 74, 18, { size: 13, weight: 700, fill: P.green, align: 'right' }),
      Line(16, 58, 318, P.border),

      // Row 2
      F(16, 70, 28, 28, P.amber + '1A', { r: 14, ch: [
        T('◷', 0, 5, 28, 18, { size: 13, fill: P.amber, align: 'center' }),
      ]}),
      T('Studio Noir — Invoice #046', 54, 70, 200, 16, { size: 13, weight: 600, fill: P.fg }),
      T('Mar 15', 260, 70, 74, 16, { size: 12, fill: P.muted, align: 'right' }),
      T('Due in 2 days', 54, 88, 180, 14, { size: 11, fill: P.amber }),
      T('$4,800', 260, 88, 74, 18, { size: 13, weight: 600, fill: P.fg, align: 'right' }),
      Line(16, 116, 318, P.border),

      // Row 3
      F(16, 128, 28, 28, P.red + '1A', { r: 14, ch: [
        T('!', 0, 5, 28, 18, { size: 14, fill: P.red, align: 'center', weight: 700 }),
      ]}),
      T('Horizon Labs — Invoice #044', 54, 128, 200, 16, { size: 13, weight: 600, fill: P.fg }),
      T('Mar 7', 260, 128, 74, 16, { size: 12, fill: P.muted, align: 'right' }),
      T('22 days overdue', 54, 146, 180, 14, { size: 11, fill: P.red }),
      T('$1,500', 260, 146, 74, 18, { size: 13, weight: 600, fill: P.red, align: 'right' }),
      Line(16, 174, 318, P.border),

      T('View all transactions →', 16, 182, 318, 14,
        { size: 11, fill: P.accent, weight: 600 }),
    ]}),

    // ── Quick Actions ─────────────────────────────────────────────────────
    T('QUICK ACTIONS', 20, 574, 200, 14, { size: 10, weight: 700, fill: P.muted, ls: 1.4 }),

    Card(20, 594, 168, 52, { fill: P.accent, stroke: P.accent, ch: [
      T('+ New Invoice', 0, 16, 168, 20, { size: 14, weight: 700, fill: '#FAF7F2', align: 'center' }),
    ]}),
    Card(202, 594, 168, 52, { ch: [
      T('Send Reminder', 0, 16, 168, 20, { size: 14, weight: 600, fill: P.fg, align: 'center' }),
    ]}),

    BottomNav('Today'),
  ];

  return F(0, 0, 390, 844, P.bg, { clip: true, ch: children });
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 2 — CLIENTS
// Client list with health scores, YTD revenue, last invoice
// ─────────────────────────────────────────────────────────────────────────────
const Screen2 = () => {
  const clients = [
    { name: 'Acme Corp', type: 'Product Design', ytd: '$18,400', health: 94, lastInvoice: 'Mar 28', color: P.green },
    { name: 'Studio Noir', type: 'Brand Identity', ytd: '$12,200', health: 78, lastInvoice: 'Mar 15', color: P.amber },
    { name: 'Horizon Labs', type: 'UI Engineering', ytd: '$9,600',  health: 42, lastInvoice: 'Mar 7',  color: P.red },
    { name: 'KindCo', type: 'Strategy & UX', ytd: '$6,850',  health: 88, lastInvoice: 'Feb 28', color: P.green },
    { name: 'Beacon Inc', type: 'Design System', ytd: '$4,100',  health: 61, lastInvoice: 'Feb 14', color: P.amber },
  ];

  const rows = clients.map((c, i) => {
    const y = 50 * i;
    return F(0, y, 350, 48, 'transparent', { ch: [
      // Health indicator dot
      E(0, 17, 14, 14, c.color),
      // Name + type
      T(c.name, 22, 4, 160, 18, { size: 14, weight: 600, fill: P.fg }),
      T(c.type, 22, 24, 160, 14, { size: 11, fill: P.muted }),
      // YTD revenue
      T(c.ytd, 200, 4, 80, 18, { size: 14, weight: 700, fill: P.fg, align: 'right' }),
      T('YTD', 200, 24, 80, 14, { size: 10, fill: P.muted, align: 'right' }),
      // Health bar
      ...ProgressBar(294, 14, 48, c.health, c.color),
      T(`${c.health}`, 294, 22, 48, 12, { size: 9, fill: c.color, align: 'right' }),
      // Divider
      ...(i < clients.length - 1 ? [Line(22, 48, 318, P.border)] : []),
    ]});
  });

  return F(390, 0, 390, 844, P.bg, { clip: true, ch: [
    StatusBar(),

    T('Clients', 20, 60, 200, 32, { size: 26, weight: 700, fill: P.fg }),
    T('5 active · $51,150 YTD', 20, 94, 220, 18, { size: 13, fill: P.muted }),

    // Search bar
    Card(20, 120, 350, 40, { fill: P.surface2, stroke: P.border, r: 20, ch: [
      T('🔍  Search clients', 16, 11, 280, 18, { size: 13, fill: P.muted }),
    ]}),

    // Health legend
    F(20, 172, 350, 24, 'transparent', { ch: [
      E(0, 6, 10, 10, P.green),
      T('Healthy 80+', 14, 4, 80, 16, { size: 10, fill: P.muted }),
      E(100, 6, 10, 10, P.amber),
      T('At risk 50–79', 114, 4, 90, 16, { size: 10, fill: P.muted }),
      E(210, 6, 10, 10, P.red),
      T('Critical <50', 224, 4, 80, 16, { size: 10, fill: P.muted }),
    ]}),

    // Client list card
    Card(20, 206, 350, rows.length * 50 + 24, { ch: [
      F(16, 12, 318, rows.length * 50, 'transparent', { ch: rows }),
    ]}),

    // Summary ribbon
    Card(20, 218 + rows.length * 50, 350, 72, { fill: P.surface3, ch: [
      T('PORTFOLIO HEALTH', 16, 12, 180, 14, { size: 9, weight: 700, fill: P.muted, ls: 1.2 }),
      T('72', 16, 30, 60, 30, { size: 28, weight: 800, fill: P.amber }),
      T('/100', 60, 44, 40, 16, { size: 13, fill: P.muted }),
      ...ProgressBar(110, 38, 224, 72, P.amber),
      T('2 clients need attention this week', 16, 54, 318, 14, { size: 11, fill: P.muted }),
    ]}),

    BottomNav('Clients'),
  ]});
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 3 — PIPELINE
// Active proposals with values, stages, and close probability
// ─────────────────────────────────────────────────────────────────────────────
const Screen3 = () => {
  const deals = [
    { name: 'Vertex AI Rebrand', client: 'Vertex Inc', value: '$22,000', stage: 'Proposal Sent', prob: 70, days: 3 },
    { name: 'SaaS Design System', client: 'Luma Software', value: '$36,000', stage: 'In Negotiation', prob: 85, days: 7 },
    { name: 'Mobile App MVP', client: 'Park Capital', value: '$18,500', stage: 'Discovery Call', prob: 40, days: 14 },
    { name: 'Annual Retainer', client: 'Acme Corp', value: '$48,000', stage: 'Contract Review', prob: 92, days: 1 },
  ];

  const stages = ['Discovery', 'Proposal', 'Negotiation', 'Contract'];
  const stageW = 80;

  return F(780, 0, 390, 844, P.bg, { clip: true, ch: [
    StatusBar(),

    T('Pipeline', 20, 60, 200, 32, { size: 26, weight: 700, fill: P.fg }),
    T('4 deals · $124,500 potential', 20, 94, 260, 18, { size: 13, fill: P.muted }),

    // Pipeline funnel visual
    Card(20, 120, 350, 56, { fill: P.dim, ch: [
      ...stages.map((s, i) => F(16 + i * stageW, 10, stageW - 4, 36,
        i === 1 || i === 2 ? P.accent + '18' : P.surface2, {
          r: 6,
          ch: [
            T(s, 0, 5, stageW - 4, 14, { size: 9, weight: 600, fill: i === 1 || i === 2 ? P.accent : P.muted, align: 'center', ls: 0.2 }),
            T(i === 0 ? '1' : i === 1 ? '1' : i === 2 ? '1' : '1', 0, 20, stageW - 4, 12, { size: 11, weight: 700, fill: P.fg, align: 'center' }),
          ],
        })),
    ]}),

    // Deals list
    T('ACTIVE DEALS', 20, 190, 200, 14, { size: 10, weight: 700, fill: P.muted, ls: 1.4 }),

    ...deals.map((d, i) => Card(20, 210 + i * 112, 350, 100, { ch: [
      // Top row: name + value
      T(d.name, 16, 12, 200, 18, { size: 14, weight: 700, fill: P.fg }),
      T(d.value, 220, 12, 114, 18, { size: 16, weight: 800, fill: P.accent, align: 'right' }),
      // Second row: client + stage
      T(d.client, 16, 32, 140, 15, { size: 11, fill: P.muted }),
      // Stage pill
      F(0, 30, 350, 18, 'transparent', { ch: [
        F(200, 0, 134, 18, P.surface2, { r: 9, stroke: P.border, sw: 1, ch: [
          T(d.stage, 0, 2, 134, 14, { size: 10, fill: P.fg2, align: 'center' }),
        ]}),
      ]}),
      // Probability
      T(`CLOSE PROBABILITY`, 16, 54, 140, 12, { size: 8, weight: 700, fill: P.muted, ls: 0.8 }),
      T(`${d.prob}%`, 270, 48, 64, 20, { size: 16, weight: 800, fill: d.prob >= 80 ? P.green : d.prob >= 60 ? P.amber : P.muted, align: 'right' }),
      ...ProgressBar(16, 70, 220, d.prob, d.prob >= 80 ? P.green : d.prob >= 60 ? P.amber : P.muted),
      T(`Close in ~${d.days}d`, 248, 66, 86, 14, { size: 10, fill: P.muted, align: 'right' }),
    ]})),

    BottomNav('Pipeline'),
  ]});
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 4 — INVOICE
// Open invoice detail — line items, status, client info, action
// ─────────────────────────────────────────────────────────────────────────────
const Screen4 = () => {
  const lineItems = [
    { desc: 'UI Design — Sprint 4',     qty: '80 hrs', rate: '$95', total: '$7,600' },
    { desc: 'Design System Tokens',     qty: '24 hrs', rate: '$95', total: '$2,280' },
    { desc: 'Prototype & Handoff',      qty: '16 hrs', rate: '$95', total: '$1,520' },
    { desc: 'Project Management',       qty: '8 hrs',  rate: '$75', total: '$600'   },
  ];

  return F(1170, 0, 390, 844, P.bg, { clip: true, ch: [
    StatusBar(),

    // Nav header
    T('← Invoices', 20, 58, 120, 18, { size: 13, fill: P.accent, weight: 600 }),
    T('INV-047', 260, 58, 110, 18, { size: 13, fill: P.muted, align: 'right' }),

    // Invoice header card (Equals-inspired: dark bg for the header)
    Card(20, 84, 350, 104, { fill: P.fg, stroke: P.fg, ch: [
      T('Acme Corp', 16, 14, 200, 20, { size: 16, weight: 700, fill: '#FAF7F2' }),
      T('Product Design · March 2025', 16, 36, 240, 15, { size: 11, fill: '#FAF7F2', opacity: 0.6 }),
      // Status badge
      F(240, 12, 94, 24, P.amber + '30', { r: 12, ch: [
        T('● SENT', 0, 5, 94, 14, { size: 10, weight: 700, fill: P.amber, align: 'center', ls: 0.8 }),
      ]}),
      Line(16, 66, 318, '#FFFFFF20'),
      T('Due', 16, 76, 60, 16, { size: 11, fill: '#FAF7F2', opacity: 0.5 }),
      T('April 5, 2025', 80, 76, 120, 16, { size: 11, fill: '#FAF7F2', weight: 600 }),
      T('TOTAL', 220, 72, 60, 14, { size: 9, fill: '#FAF7F2', opacity: 0.5, ls: 0.8 }),
      T('$12,000', 220, 84, 114, 20, { size: 18, weight: 800, fill: '#FAF7F2', align: 'right' }),
    ]}),

    // Line items
    T('LINE ITEMS', 20, 202, 200, 14, { size: 10, weight: 700, fill: P.muted, ls: 1.4 }),

    Card(20, 220, 350, lineItems.length * 52 + 56, { ch: [
      ...lineItems.map((item, i) => F(0, 12 + i * 52, 350, 50, 'transparent', { ch: [
        T(item.desc, 16, 6, 180, 16, { size: 13, weight: 600, fill: P.fg }),
        T(`${item.qty} × ${item.rate}`, 16, 25, 180, 14, { size: 11, fill: P.muted }),
        T(item.total, 200, 12, 134, 20, { size: 15, weight: 700, fill: P.fg, align: 'right' }),
        ...(i < lineItems.length - 1 ? [Line(16, 48, 318, P.border)] : []),
      ]})),
      Line(16, lineItems.length * 52 + 10, 318, P.border),
      T('SUBTOTAL', 16, lineItems.length * 52 + 18, 150, 16, { size: 11, weight: 700, fill: P.muted, ls: 0.8 }),
      T('$12,000', 200, lineItems.length * 52 + 16, 134, 20, { size: 15, weight: 800, fill: P.fg, align: 'right' }),
    ]}),

    // Actions
    Card(20, 640, 350, 48, { fill: P.accent, stroke: P.accent, ch: [
      T('Mark as Paid', 0, 14, 350, 20, { size: 15, weight: 700, fill: '#FAF7F2', align: 'center' }),
    ]}),
    Card(20, 696, 168, 44, { ch: [
      T('Send Reminder', 0, 12, 168, 20, { size: 13, weight: 600, fill: P.fg, align: 'center' }),
    ]}),
    Card(202, 696, 168, 44, { ch: [
      T('Download PDF', 0, 12, 168, 20, { size: 13, fill: P.fg, align: 'center' }),
    ]}),

    BottomNav('Invoice'),
  ]});
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 5 — CLOSE
// Month-close summary — the "coda" view: wrap-up, performance, readiness
// ─────────────────────────────────────────────────────────────────────────────
const Screen5 = () => {
  const checks = [
    { label: 'All invoices sent',         done: true  },
    { label: 'Expenses categorized',       done: true  },
    { label: 'Overdue follow-ups sent',    done: false },
    { label: 'Hours logged & reconciled',  done: true  },
    { label: 'Tax estimate updated',       done: false },
  ];

  const doneCount = checks.filter(c => c.done).length;

  return F(1560, 0, 390, 844, P.bg, { clip: true, ch: [
    StatusBar(),

    T('March Close', 20, 60, 220, 32, { size: 26, weight: 700, fill: P.fg }),
    T('Monthly financial coda', 20, 94, 260, 18, { size: 13, fill: P.muted }),

    // Readiness ring (visual)
    Card(20, 118, 350, 108, { fill: P.surface3, ch: [
      // Big readiness score
      T(`${Math.round(doneCount / checks.length * 100)}%`, 16, 16, 80, 56, { size: 42, weight: 800, fill: P.fg }),
      T('CLOSE\nREADINESS', 16, 72, 80, 26, { size: 9, weight: 700, fill: P.muted, ls: 0.8, lh: 1.5 }),
      // Mini bars
      F(110, 20, 224, 68, 'transparent', { ch: [
        T('Revenue hit', 0, 0, 160, 14, { size: 11, fill: P.fg }),
        T('$24,750 / $25K goal', 0, 16, 224, 14, { size: 10, fill: P.muted }),
        ...ProgressBar(0, 34, 220, 99, P.green),
        T('Expense ratio', 0, 44, 160, 14, { size: 11, fill: P.fg }),
        T('28% of revenue', 0, 60, 224, 14, { size: 10, fill: P.muted }),
        ...ProgressBar(0, 78, 220, 28, P.amber),
      ]}),
    ]}),

    // Performance summary
    T('MARCH SUMMARY', 20, 240, 200, 14, { size: 10, weight: 700, fill: P.muted, ls: 1.4 }),

    Card(20, 258, 350, 120, { ch: [
      F(16, 14, 150, 44, 'transparent', { ch: [
        T('Revenue', 0, 0, 120, 16, { size: 11, fill: P.muted }),
        T('$24,750', 0, 18, 140, 26, { size: 22, weight: 800, fill: P.green }),
      ]}),
      F(196, 14, 138, 44, 'transparent', { ch: [
        T('Expenses', 0, 0, 120, 16, { size: 11, fill: P.muted }),
        T('$6,930', 0, 18, 130, 26, { size: 22, weight: 800, fill: P.fg }),
      ]}),
      Line(16, 66, 318, P.border),
      F(16, 76, 318, 30, 'transparent', { ch: [
        T('Net Income', 0, 6, 140, 18, { size: 13, weight: 600, fill: P.fg }),
        T('$17,820', 190, 4, 128, 22, { size: 18, weight: 800, fill: P.green, align: 'right' }),
      ]}),
    ]}),

    // Close checklist
    T('CLOSE CHECKLIST', 20, 394, 200, 14, { size: 10, weight: 700, fill: P.muted, ls: 1.4 }),
    T(`${doneCount} of ${checks.length} complete`, 250, 394, 120, 14, { size: 11, fill: P.muted, align: 'right' }),

    Card(20, 412, 350, checks.length * 46 + 12, { ch: [
      ...checks.map((c, i) => F(16, 12 + i * 46, 318, 40, 'transparent', { ch: [
        // Checkbox
        F(0, 8, 22, 22, c.done ? P.green : 'transparent', {
          r: 5, stroke: c.done ? P.green : P.border, sw: 1.5,
          ch: c.done ? [T('✓', 0, 2, 22, 18, { size: 12, fill: '#FFFFFF', align: 'center', weight: 700 })] : [],
        }),
        T(c.label, 30, 8, 220, 22, { size: 13, weight: c.done ? 400 : 600, fill: c.done ? P.muted : P.fg,
          opacity: c.done ? 0.7 : 1 }),
        ...(i < checks.length - 1 ? [Line(0, 40, 318, P.border)] : []),
      ]})),
    ]}),

    // Close month CTA
    Card(20, 660, 350, 52, {
      fill: doneCount === checks.length ? P.fg : P.surface2,
      stroke: doneCount === checks.length ? P.fg : P.border,
      ch: [
        T(
          doneCount === checks.length ? 'Close March — Lock & Archive' : `Complete ${checks.length - doneCount} remaining items`,
          0, 16, 350, 20,
          { size: 14, weight: 700, fill: doneCount === checks.length ? '#FAF7F2' : P.muted, align: 'center' }
        ),
      ],
    }),

    T('Closing locks all March transactions', 20, 726, 350, 16,
      { size: 11, fill: P.muted, align: 'center' }),

    BottomNav('Close'),
  ]});
};

// ── Assemble ──────────────────────────────────────────────────────────────────
const screens = [Screen1(), Screen2(), Screen3(), Screen4(), Screen5()];

const pen = {
  version: '2.8',
  fileName: 'coda.pen',
  width: 390 * screens.length,
  height: 844,
  backgroundColor: P.bg,
  elements: screens,
};

fs.writeFileSync(
  path.join(__dirname, 'coda.pen'),
  JSON.stringify(pen, null, 2)
);
console.log('✓ coda.pen written');
console.log(`  Screens: ${screens.length}`);
console.log(`  Canvas:  ${pen.width} × ${pen.height}`);
