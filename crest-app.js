'use strict';
// crest-app.js
// CREST — Editorial cashflow intelligence for independent workers
//
// Challenge: Design a freelancer finance app using bold editorial/magazine typography
// treating financial data the way print media treats a feature story — large running
// sums as display headlines, warm cream paper palette, monospaced-feel numbers, generous
// white space punctuated by sharp colour bursts.
//
// Inspired by:
// 1. land-book.com / Equals ("What's after Excel?") — clean analytical SaaS, editorial
//    restraint, soft data hierarchy without charts-for-chart's-sake
// 2. land-book.com / UglyCash — "YOUR BANK WON'T DO THIS" — bold statement-first fintech,
//    brutalist type scale applied to financial messaging
// 3. land-book.com / Deon Libra — "WELLNESS ROOTED IN RITUAL, ART, AND DROP CULTURE"
//    all-caps editorial headings repurposed to give a lifestyle brand feel to finances
// 4. darkmodedesign.com / Maker — "For the new wave of one-person companies" — textured
//    quiet surfaces, solo-operator aesthetic, minimal CTA language
//
// Theme: LIGHT — warm cream (#F5F2EC) + near-black (#111) + electric chartreuse (#BAFF4F)
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

const P = {
  bg:       '#F5F2EC',
  surface:  '#FFFFFF',
  surface2: '#EDE9E1',
  surface3: '#E4DFD6',
  border:   '#D9D3C9',
  muted:    '#9E9487',
  fg:       '#111111',
  accent:   '#BAFF4F',
  accentDk: '#6A9900',
  navy:     '#1B3054',
  red:      '#E03540',
  redBg:    '#FDECEA',
  greenBg:  '#EAFCE8',
  green:    '#1CA750',
  amber:    '#E89000',
  amberBg:  '#FFF5E0',
};

let _id = 0;
const uid = () => `c${++_id}`;

const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill || P.bg,
  clip: opts.clip !== undefined ? opts.clip : false,
  ...(opts.r   !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.ch || [],
});

const T = (content, x, y, w, h, opts = {}) => ({
  id: uid(), type: 'text', content, x, y, width: w, height: h,
  textGrowth: 'fixed-width-height',
  fontSize:   opts.size   || 13,
  fontWeight: String(opts.weight || 400),
  fill:       opts.fill   || P.fg,
  textAlign:  opts.align  || 'left',
  ...(opts.ls  !== undefined ? { letterSpacing: opts.ls }  : {}),
  ...(opts.lh  !== undefined ? { lineHeight: opts.lh }     : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Line = (x, y, w, fill = P.border) => F(x, y, w, 1, fill);

const Pill = (x, y, label, bg, fg, sz = 10) => {
  const w = label.length * 6.5 + 22;
  return F(x, y, w, 22, bg, { r: 11, ch: [
    T(label, 0, 4, w, 14, { size: sz, weight: 600, fill: fg, align: 'center', ls: 0.3 }),
  ]});
};

const Bar = (x, y, w, pct, fill = P.accent) =>
  F(x, y, w, 6, P.surface3, { r: 3, ch: [F(0, 0, Math.max(4, Math.round(w * pct)), 6, fill, { r: 3 })] });

const StatusBar = () => F(0, 0, 390, 44, P.bg, { ch: [
  T('9:41', 20, 14, 60, 16, { size: 15, weight: 600, fill: P.fg }),
  E(318, 18, 6, 6, P.fg),
  E(328, 18, 6, 6, P.fg),
  E(338, 18, 6, 6, P.fg),
  F(348, 17, 22, 10, P.fg, { r: 3 }),
]});

const BottomNav = (active) => {
  const tabs = [
    { id: 'Home',    icon: '◈' },
    { id: 'In',      icon: '↑' },
    { id: 'Out',     icon: '↓' },
    { id: 'Invoice', icon: '⊡' },
    { id: 'Plan',    icon: '◎' },
  ];
  const W = 78;
  return F(0, 790, 390, 54, P.surface, { stroke: P.border, sw: 1, ch: [
    ...tabs.map((t, i) => {
      const on = t.id === active;
      return F(i * W, 0, W, 54, 'transparent', { ch: [
        T(t.icon, i*W, 7, W, 18, { size: 15, fill: on ? P.fg : P.muted, align: 'center' }),
        T(t.id,   i*W + 2, 27, W - 4, 13, { size: 9, weight: on ? 700 : 400,
          fill: on ? P.fg : P.muted, align: 'center', ls: 0.2 }),
        ...(on ? [F(i*W + W/2 - 10, 48, 20, 2, P.fg, { r: 1 })] : []),
      ]});
    }),
  ]});
};

const TxRow = (x, y, name, cat, amt, inflow, date) => {
  const color = inflow ? P.green : P.red;
  const str   = inflow ? `+${amt}` : `−${amt}`;
  const catBg = inflow ? P.greenBg : P.redBg;
  return F(x, y, 350, 52, 'transparent', { ch: [
    E(0, 19, 12, 12, color),
    T(name, 22, 8, 180, 17, { size: 14, weight: 600, fill: P.fg }),
    T(date, 22, 27, 100, 13, { size: 10, fill: P.muted }),
    Pill(160, 27, cat, catBg, color, 9),
    T(str, 220, 13, 130, 18, { size: 16, weight: 700, fill: color, align: 'right' }),
    Line(0, 51, 350),
  ]});
};

// ── Screen 1: HOME ─────────────────────────────────────────────────────────────
const S1 = () => F(0, 0, 390, 844, P.bg, { ch: [
  StatusBar(),

  // wordmark
  T('CREST', 20, 54, 120, 22, { size: 15, weight: 800, fill: P.fg, ls: 3 }),
  T('MARCH 2026', 220, 59, 150, 14, { size: 10, weight: 600, fill: P.muted, align: 'right', ls: 1.8 }),
  F(20, 84, 56, 3, P.accent, { r: 1.5 }),

  // hero number
  T('NET FLOW', 20, 102, 200, 14, { size: 10, weight: 700, fill: P.muted, ls: 2.8 }),
  T('+$12,847', 20, 118, 350, 64, { size: 56, weight: 800, fill: P.fg, ls: -2 }),
  T('income after all expenses this month', 20, 184, 300, 15, { size: 11, fill: P.muted }),

  // two stat cards
  F(20, 210, 160, 68, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
    T('INFLOW', 16, 12, 100, 12, { size: 9, weight: 700, fill: P.green, ls: 1.8 }),
    T('$24,130', 16, 28, 128, 26, { size: 22, weight: 800, fill: P.fg }),
  ]}),
  F(210, 210, 160, 68, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
    T('OUTFLOW', 16, 12, 110, 12, { size: 9, weight: 700, fill: P.red, ls: 1.8 }),
    T('$11,283', 16, 28, 128, 26, { size: 22, weight: 800, fill: P.fg }),
  ]}),

  // section header
  T('RECENT', 20, 296, 80, 14, { size: 10, weight: 700, fill: P.muted, ls: 2.2 }),
  Line(20, 313, 350),

  TxRow(20, 320, 'Meridian Studio', 'Design',  '$4,200', true,  'Mar 28'),
  TxRow(20, 372, 'Figma Pro',       'Tools',   '$45',   false, 'Mar 27'),
  TxRow(20, 424, 'Arc Agency',      'UI/UX',   '$3,800', true,  'Mar 25'),
  TxRow(20, 476, 'AWS',             'Infra',   '$112',  false, 'Mar 24'),
  TxRow(20, 528, 'Notion Team',     'Tools',   '$32',   false, 'Mar 23'),

  // tax reserve card
  F(20, 596, 350, 86, P.navy, { r: 14, ch: [
    T('TAX RESERVE', 20, 14, 200, 13, { size: 9, weight: 700, fill: '#FFFFFF70', ls: 2 }),
    T('$6,200', 20, 30, 160, 30, { size: 26, weight: 800, fill: '#FFFFFF' }),
    T('of $8,000 goal · 77%', 190, 36, 140, 18, { size: 11, fill: '#FFFFFF50', align: 'right' }),
    Bar(20, 68, 310, 0.775, P.accent),
  ]}),

  BottomNav('Home'),
]});

// ── Screen 2: INFLOW ──────────────────────────────────────────────────────────
const S2 = () => {
  const clients = [
    { name: 'Meridian Studio', cat: 'Branding',  amt: '$8,000', pct: 0.83 },
    { name: 'Arc Agency',      cat: 'UI/UX',     amt: '$7,600', pct: 0.79 },
    { name: 'Ghost Protocol',  cat: 'Motion',    amt: '$5,200', pct: 0.54 },
    { name: 'Solace Group',    cat: 'Strategy',  amt: '$3,330', pct: 0.35 },
  ];
  return F(0, 0, 390, 844, P.bg, { ch: [
    StatusBar(),
    T('CREST', 20, 54, 120, 22, { size: 15, weight: 800, fill: P.fg, ls: 3 }),
    F(20, 84, 56, 3, P.green, { r: 1.5 }),

    T('INFLOW', 20, 102, 160, 14, { size: 10, weight: 700, fill: P.muted, ls: 2.8 }),
    T('$24,130', 20, 118, 350, 58, { size: 50, weight: 800, fill: P.fg, ls: -1.5 }),
    T('March 2026  ·  4 active clients', 20, 178, 300, 15, { size: 11, fill: P.muted }),

    F(20, 202, 350, 44, P.greenBg, { r: 10, ch: [
      T('↑  $2,870 more expected by Mar 31', 16, 13, 320, 18,
        { size: 12, weight: 600, fill: P.green }),
    ]}),

    T('BY CLIENT', 20, 262, 120, 13, { size: 10, weight: 700, fill: P.muted, ls: 2.2 }),
    Line(20, 278, 350),

    ...clients.map((c, i) => F(20, 286 + i * 88, 350, 80, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
      T(c.name, 16, 12, 210, 17, { size: 14, weight: 700, fill: P.fg }),
      Pill(16, 34, c.cat, P.greenBg, P.green, 9),
      T(c.amt, 220, 12, 114, 18, { size: 17, weight: 800, fill: P.green, align: 'right' }),
      Bar(16, 62, 318, c.pct, P.green),
    ]})),

    BottomNav('In'),
  ]});
};

// ── Screen 3: OUTFLOW ─────────────────────────────────────────────────────────
const S3 = () => {
  const cats = [
    { name: 'Software',   amt: '$4,210', pct: 0.73, detail: 'Figma · Linear · Notion · AWS' },
    { name: 'Marketing',  amt: '$2,800', pct: 0.49, detail: 'Ads · Press kit · Events'      },
    { name: 'Freelance',  amt: '$2,100', pct: 0.37, detail: 'Contractor payouts'             },
    { name: 'Finance',    amt: '$1,630', pct: 0.28, detail: 'Accountant · Bank fees'         },
    { name: 'Other',      amt: '$543',   pct: 0.09, detail: 'Misc'                           },
  ];
  return F(0, 0, 390, 844, P.bg, { ch: [
    StatusBar(),
    T('CREST', 20, 54, 120, 22, { size: 15, weight: 800, fill: P.fg, ls: 3 }),
    F(20, 84, 56, 3, P.red, { r: 1.5 }),

    T('OUTFLOW', 20, 102, 180, 14, { size: 10, weight: 700, fill: P.muted, ls: 2.8 }),
    T('$11,283', 20, 118, 350, 58, { size: 50, weight: 800, fill: P.fg, ls: -1.5 }),
    T('March 2026  ·  5 categories', 20, 178, 280, 15, { size: 11, fill: P.muted }),

    F(20, 202, 350, 44, P.redBg, { r: 10, ch: [
      T('↓  $890 due in 7 days — AWS + Clerk + Linear', 16, 13, 320, 18,
        { size: 12, weight: 600, fill: P.red }),
    ]}),

    T('BY CATEGORY', 20, 262, 140, 13, { size: 10, weight: 700, fill: P.muted, ls: 2.2 }),
    Line(20, 278, 350),

    ...cats.map((c, i) => F(20, 286 + i * 84, 350, 76, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
      T(c.name, 16, 12, 160, 17, { size: 14, weight: 700, fill: P.fg }),
      T(c.detail, 16, 32, 220, 13, { size: 10, fill: P.muted }),
      T(c.amt, 220, 12, 114, 17, { size: 16, weight: 800, fill: P.red, align: 'right' }),
      Bar(16, 58, 318, c.pct, P.red),
    ]})),

    BottomNav('Out'),
  ]});
};

// ── Screen 4: INVOICES ────────────────────────────────────────────────────────
const S4 = () => {
  const invs = [
    { id: '#INV-041', client: 'Meridian Studio', amt: '$6,400', due: 'Apr 15', status: 'SENT',    bg: '#EEF4FF', fg: '#3B72D4' },
    { id: '#INV-040', client: 'Arc Agency',      amt: '$3,800', due: 'Apr 10', status: 'VIEWED',  bg: P.amberBg, fg: P.amber  },
    { id: '#INV-039', client: 'Ghost Protocol',  amt: '$5,200', due: 'Mar 30', status: 'PAID',    bg: P.greenBg, fg: P.green  },
    { id: '#INV-038', client: 'Solace Group',    amt: '$1,200', due: 'Mar 20', status: 'OVERDUE', bg: P.redBg,   fg: P.red    },
  ];
  return F(0, 0, 390, 844, P.bg, { ch: [
    StatusBar(),
    T('CREST', 20, 54, 120, 22, { size: 15, weight: 800, fill: P.fg, ls: 3 }),
    F(20, 84, 56, 3, P.navy, { r: 1.5 }),

    T('INVOICES', 20, 102, 180, 14, { size: 10, weight: 700, fill: P.muted, ls: 2.8 }),
    T('$10,200', 20, 118, 350, 56, { size: 48, weight: 800, fill: P.fg, ls: -1.5 }),
    T('outstanding across 2 open invoices', 20, 176, 300, 15, { size: 11, fill: P.muted }),

    // CTA button — chartreuse
    F(20, 202, 350, 46, P.accent, { r: 12, ch: [
      T('+ NEW INVOICE', 0, 14, 350, 18, { size: 13, weight: 800, fill: P.fg, align: 'center', ls: 1.8 }),
    ]}),

    T('RECENT', 20, 264, 80, 13, { size: 10, weight: 700, fill: P.muted, ls: 2.2 }),
    Line(20, 280, 350),

    ...invs.map((inv, i) => F(20, 288 + i * 100, 350, 90, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
      T(inv.id, 16, 12, 110, 13, { size: 10, weight: 700, fill: P.muted, ls: 0.8 }),
      T(inv.client, 16, 28, 200, 17, { size: 14, weight: 700, fill: P.fg }),
      T(`Due ${inv.due}`, 16, 50, 120, 13, { size: 10, fill: P.muted }),
      T(inv.amt, 200, 24, 134, 22, { size: 20, weight: 800, fill: P.fg, align: 'right' }),
      Pill(200, 52, inv.status, inv.bg, inv.fg, 9),
    ]})),

    BottomNav('Invoice'),
  ]});
};

// ── Screen 5: 90-DAY PLAN ────────────────────────────────────────────────────
const S5 = () => {
  const months = [
    { m: 'JAN', val: '$8.2k', h: 36, proj: false, cur: false },
    { m: 'FEB', val: '$9.4k', h: 42, proj: false, cur: false },
    { m: 'MAR', val: '$12.8k',h: 58, proj: false, cur: true  },
    { m: 'APR', val: '$11.2k',h: 50, proj: true,  cur: false },
    { m: 'MAY', val: '$13.5k',h: 61, proj: true,  cur: false },
    { m: 'JUN', val: '$14.8k',h: 67, proj: true,  cur: false },
  ];
  const bW = 38, bGap = 20, startX = 22, baseY = 390;

  const milestones = [
    { date: 'Apr 10', label: 'Arc Agency payment',     sub: '$3,800 expected',    color: P.green },
    { date: 'Apr 15', label: 'Meridian invoice due',   sub: '$6,400 outstanding', color: P.navy  },
    { date: 'Apr 30', label: 'Tax reserve deadline',   sub: '$8,000 goal',        color: P.red   },
    { date: 'May 01', label: 'Solace retainer starts', sub: '$2,500/mo',          color: P.green },
  ];

  return F(0, 0, 390, 844, P.bg, { ch: [
    StatusBar(),
    T('CREST', 20, 54, 120, 22, { size: 15, weight: 800, fill: P.fg, ls: 3 }),
    F(20, 84, 56, 3, P.accent, { r: 1.5 }),

    T('90-DAY VIEW', 20, 102, 200, 14, { size: 10, weight: 700, fill: P.muted, ls: 2.8 }),
    T('$39,500', 20, 118, 350, 56, { size: 48, weight: 800, fill: P.fg, ls: -1.5 }),
    T('projected Q2 cashflow', 20, 176, 240, 15, { size: 11, fill: P.muted }),

    F(20, 202, 168, 32, P.greenBg, { r: 10, ch: [
      T('↑ 38% vs last quarter', 14, 8, 140, 16, { size: 11, weight: 600, fill: P.green }),
    ]}),

    // bar chart
    ...months.map((m, i) => {
      const x = startX + i * (bW + bGap);
      const fill = m.cur ? P.accent : m.proj ? P.accent + '66' : P.fg + '25';
      return F(0, 0, 390, 420, 'transparent', { ch: [
        F(x, baseY - m.h, bW, m.h, fill, { r: 5 }),
        T(m.m, x - 4, baseY + 7, bW + 8, 12,
          { size: 9, weight: m.cur ? 700 : 400, fill: m.cur ? P.fg : P.muted, align: 'center', ls: 0.4 }),
        ...(m.proj ? [T(m.val, x - 6, baseY - m.h - 16, bW + 12, 12,
          { size: 8, weight: 600, fill: P.fg, align: 'center' })] : []),
      ]});
    }),

    T('KEY DATES', 20, 414, 120, 13, { size: 10, weight: 700, fill: P.muted, ls: 2.2 }),
    Line(20, 430, 350),

    ...milestones.map((ev, i) => F(20, 438 + i * 72, 350, 64, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
      F(16, 14, 4, 32, ev.color, { r: 2 }),
      T(ev.date, 30, 10, 80, 13, { size: 10, weight: 700, fill: P.muted }),
      T(ev.label, 30, 26, 220, 16, { size: 13, weight: 600, fill: P.fg }),
      T(ev.sub, 30, 44, 220, 13, { size: 10, fill: P.muted }),
    ]})),

    BottomNav('Plan'),
  ]});
};

// ── Assemble .pen ──────────────────────────────────────────────────────────────
const GAP   = 60;
const pages = [S1(), S2(), S3(), S4(), S5()].map((sc, i) => ({
  ...sc, id: `page${i+1}`, x: i * (390 + GAP), y: 0,
}));

const pen = {
  meta: { name: 'CREST — Editorial Cashflow', version: '2.8', created: new Date().toISOString() },
  canvas: { background: '#E8E4DC' },
  pages,
};

const out = path.join(__dirname, 'crest.pen');
fs.writeFileSync(out, JSON.stringify(pen, null, 2));
console.log(`✓ crest.pen  (${(fs.statSync(out).size/1024).toFixed(1)} KB, ${pages.length} screens)`);
