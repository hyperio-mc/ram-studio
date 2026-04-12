'use strict';
// pavo-app.js
// PAVO — Spend intelligence for modern teams
//
// Challenge: Dark-mode corporate spend & budget intelligence tool.
// Inspired by:
//   1. Linear's "calmer, more consistent interface" UI refresh (darkmodedesign.com, Mar 2026)
//      → ultra-quiet dark chrome, info hierarchy through weight/opacity only, no decoration
//   2. Midday.ai modular financial intelligence layout (godly.website #962)
//      → "Explaining the numbers 1 hour per week", scrollable feature modules, dark fintech
//   3. Cardless (land-book.com, Mar 2026) — embedded credit card platform UI,
//      transactional data made beautiful with stark contrast and minimal color coding
//
// Theme: DARK — deep #0A0D14 navy-black + sapphire #4F8FFF + emerald #2DF5A0
// Screens: 6 mobile (390×844)

const fs   = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const uid  = () => randomUUID();

// ── Palette ─────────────────────────────────────────────────────────────────
const P = {
  bg:        '#0A0D14',
  surface:   '#131720',
  surface2:  '#1A2030',
  surface3:  '#222840',
  border:    '#1C2238',
  borderLt:  '#28324A',

  fg:        '#EBF0FA',
  fg2:       '#8B96B0',
  muted:     '#505870',
  dim:       '#303650',

  sapphire:  '#4F8FFF',
  sapBg:     '#0C1830',
  sapLt:     '#82B0FF',

  emerald:   '#2DF5A0',
  emBg:      '#061A10',
  emLt:      '#70F5C0',

  amber:     '#F5C040',
  amBg:      '#1C1500',
  amLt:      '#F7D070',

  coral:     '#FF6060',
  corBg:     '#1E0A0A',
  corLt:     '#FF9090',

  indigo:    '#9A70FF',
  indBg:     '#110D25',
  indLt:     '#C0A0FF',
};

// ── Builders ─────────────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h, fill,
  cornerRadius: opts.r ?? 0,
  strokeColor:  opts.stroke ?? 'transparent',
  strokeWidth:  opts.sw ?? 0,
  children:     opts.ch ?? [],
});

const T = (text, x, y, w, h, opts = {}) => ({
  id: uid(), type: 'text', x, y, width: w, height: h,
  content: String(text),
  fontSize:      opts.size   ?? 12,
  fontWeight:    opts.weight ?? 400,
  fontFamily:    opts.font   ?? 'Inter',
  color:         opts.color  ?? P.fg,
  textAlign:     opts.align  ?? 'left',
  letterSpacing: opts.ls     ?? 0,
  lineHeight:    opts.lh     ?? (opts.size ? opts.size * 1.4 : 16.8),
});

const R = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'rectangle', x, y, width: w, height: h, fill,
  cornerRadius: opts.r ?? 0,
  strokeColor:  opts.stroke ?? 'transparent',
  strokeWidth:  opts.sw ?? 0,
});

const E = (x, y, d, color) => ({
  id: uid(), type: 'ellipse', x, y, width: d, height: d, fill: color,
});

const div = (x, y, w) => R(x, y, w, 1, P.border);

const pill = (label, color, bg, x, y) => {
  const pw = label.length * 6 + 16;
  return F(x, y, pw, 20, bg, { r: 10, stroke: color, sw: 1, ch: [
    T(label, 8, 3, pw - 16, 14, { size: 10, weight: 700, color, ls: 0.4 }),
  ]});
};

const bar = (x, y, w, pct, color) => F(x, y, w, 5, P.surface3, { r: 3, ch: [
  R(0, 0, Math.max(4, Math.round(w * pct / 100)), 5, color, { r: 3 }),
]});

const statBar = () => F(0, 0, 390, 44, 'transparent', { ch: [
  T('9:41', 16, 14, 50, 16, { size: 13, weight: 700 }),
  T('● ●●● ⚡', 310, 14, 64, 16, { size: 11, color: P.fg2, align: 'right' }),
]});

const nav = (active) => {
  const tabs = [
    { id: 'overview',  icon: '⊞', label: 'Overview' },
    { id: 'spend',     icon: '↗',  label: 'Spend' },
    { id: 'cards',     icon: '◫', label: 'Cards' },
    { id: 'budget',    icon: '◎',  label: 'Budget' },
    { id: 'signals',   icon: '◈',  label: 'Signals' },
  ];
  const iw = 78;
  const ch = tabs.flatMap((tab, i) => {
    const x = i * iw;
    const on = tab.id === active;
    return [
      F(x, 0, iw, 56, 'transparent', { ch: [
        T(tab.icon, (iw - 16) / 2, 8, 16, 16,
          { size: 14, color: on ? P.sapphire : P.muted, align: 'center' }),
        T(tab.label, (iw - 44) / 2, 26, 44, 12,
          { size: 9, weight: on ? 700 : 400, color: on ? P.sapphire : P.muted, align: 'center', ls: 0.3 }),
        ...(on ? [R(x + 27, 52, 24, 2, P.sapphire, { r: 1 })] : []),
      ]}),
    ];
  });
  return F(0, 788, 390, 56, P.surface, { stroke: P.border, sw: 1, ch: [
    F(0, 0, 390, 56, 'transparent', { ch }),
  ]});
};

// ── SCREEN 1 — Overview ──────────────────────────────────────────────────────
function s1() {
  // Bento-grid: 2 cols top, then full-width, then 2-cols again
  return {
    id: uid(), label: 'Overview', width: 390, height: 844, fill: P.bg,
    children: [
      statBar(),

      // header
      F(0, 44, 390, 56, 'transparent', { ch: [
        T('PAVO', 20, 8, 80, 12, { size: 10, weight: 700, color: P.sapphire, ls: 2.4 }),
        T('March 2026', 20, 26, 160, 20, { size: 16, weight: 700 }),
        F(312, 12, 58, 30, 'transparent', { ch: [
          F(0, 0, 32, 32, P.surface2, { r: 16, ch: [
            T('TM', 5, 9, 22, 14, { size: 11, weight: 700, color: P.sapphire }),
          ]}),
        ]}),
      ]}),

      // hero spend card (full-width bento)
      F(20, 106, 350, 96, P.surface, { r: 16, stroke: P.border, sw: 1, ch: [
        T('TOTAL SPEND', 16, 14, 180, 12, { size: 9, weight: 700, color: P.muted, ls: 1 }),
        T('$48,320', 16, 32, 220, 40, { size: 36, weight: 800 }),
        T('of $60,000 budget', 16, 76, 200, 14, { size: 11, color: P.fg2 }),
        // budget ring placeholder
        F(270, 12, 64, 72, P.sapBg, { r: 12, ch: [
          T('80%', 10, 28, 44, 18, { size: 14, weight: 700, color: P.sapphire, align: 'center' }),
          T('used', 10, 46, 44, 12, { size: 9, color: P.muted, align: 'center' }),
        ]}),
      ]}),

      // 2-col metric tiles
      F(20, 214, 166, 70, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
        T('TRANSACTIONS', 12, 10, 142, 12, { size: 9, weight: 700, color: P.muted, ls: 0.8 }),
        T('284', 12, 26, 100, 24, { size: 20, weight: 800 }),
        T('+38 this week', 12, 52, 142, 12, { size: 10, color: P.emerald }),
      ]}),
      F(204, 214, 166, 70, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
        T('ACTIVE CARDS', 12, 10, 142, 12, { size: 9, weight: 700, color: P.muted, ls: 0.8 }),
        T('12', 12, 26, 100, 24, { size: 20, weight: 800 }),
        T('2 flagged', 12, 52, 142, 12, { size: 10, color: P.coral }),
      ]}),

      // category breakdown
      T('TOP CATEGORIES', 20, 298, 200, 12, { size: 9, weight: 700, color: P.muted, ls: 1 }),

      F(20, 316, 350, 220, P.surface, { r: 16, stroke: P.border, sw: 1, ch: [
        // SaaS Tools
        F(14, 14, 322, 40, 'transparent', { ch: [
          T('SaaS Tools', 0, 2, 140, 14, { size: 13, weight: 600 }),
          T('$14,200', 224, 2, 84, 14, { size: 13, weight: 700, align: 'right' }),
          T('29%', 224, 20, 84, 12, { size: 10, color: P.fg2, align: 'right' }),
          bar(0, 32, 322, 29, P.sapphire),
        ]}),
        div(14, 54, 322),
        F(14, 68, 322, 40, 'transparent', { ch: [
          T('Cloud Infra', 0, 2, 140, 14, { size: 13, weight: 600 }),
          T('$11,800', 224, 2, 84, 14, { size: 13, weight: 700, align: 'right' }),
          T('24%', 224, 20, 84, 12, { size: 10, color: P.fg2, align: 'right' }),
          bar(0, 32, 322, 24, P.indigo),
        ]}),
        div(14, 108, 322),
        F(14, 122, 322, 40, 'transparent', { ch: [
          T('Travel & Meals', 0, 2, 140, 14, { size: 13, weight: 600 }),
          T('$9,400', 224, 2, 84, 14, { size: 13, weight: 700, align: 'right' }),
          T('19%', 224, 20, 84, 12, { size: 10, color: P.fg2, align: 'right' }),
          bar(0, 32, 322, 19, P.amber),
        ]}),
        div(14, 162, 322),
        F(14, 176, 322, 30, 'transparent', { ch: [
          T('See all 14 categories →', 0, 8, 200, 14, { size: 12, weight: 600, color: P.sapphire }),
        ]}),
      ]}),

      // AI banner
      F(20, 548, 350, 44, P.indBg, { r: 12, stroke: P.indigo, sw: 1, ch: [
        T('◈  3 signals detected · Cloud spend 2× above forecast', 14, 14, 320, 16, { size: 11, color: P.indLt }),
      ]}),

      nav('overview'),
    ],
  };
}

// ── SCREEN 2 — Spend Feed ────────────────────────────────────────────────────
function s2() {
  const txns = [
    { name: 'Vercel Pro',     category: 'SaaS',     amount: '+$240',   color: P.coral,    card: 'Eng #3',  icon: '⬡' },
    { name: 'Figma Team',     category: 'Design',   amount: '+$180',   color: P.sapphire, card: 'Design',  icon: '◫' },
    { name: 'AWS EC2',        category: 'Infra',    amount: '+$4,200', color: P.coral,    card: 'Infra #1',icon: '☁' },
    { name: 'Notion AI',      category: 'Ops',      amount: '+$96',    color: P.emerald,  card: 'Ops',     icon: '📋' },
    { name: 'Delta SFO-NYC',  category: 'Travel',   amount: '+$620',   color: P.amber,    card: 'Travel',  icon: '✈' },
    { name: 'Anthropic API',  category: 'AI',       amount: '+$1,800', color: P.indigo,   card: 'Eng #1',  icon: '◈' },
  ];

  const rows = txns.flatMap((t, i) => {
    const y = 14 + i * 68;
    return [
      F(14, y, 322, 54, 'transparent', { ch: [
        F(0, 8, 36, 36, P.surface2, { r: 10, ch: [
          T(t.icon, 9, 8, 18, 20, { size: 16, color: t.color }),
        ]}),
        T(t.name, 46, 6, 160, 14, { size: 13, weight: 700 }),
        T(`${t.category} · ${t.card}`, 46, 26, 170, 12, { size: 10, color: P.fg2 }),
        T(t.amount, 250, 12, 72, 14, { size: 13, weight: 700, color: t.color, align: 'right' }),
        T('Today', 250, 30, 72, 12, { size: 10, color: P.muted, align: 'right' }),
      ]}),
      ...(i < txns.length - 1 ? [div(14, y + 54, 322)] : []),
    ];
  });

  return {
    id: uid(), label: 'Spend', width: 390, height: 844, fill: P.bg,
    children: [
      statBar(),
      F(0, 44, 390, 56, 'transparent', { ch: [
        T('Spend Feed', 20, 14, 200, 24, { size: 20, weight: 700 }),
        pill('LIVE', P.emerald, P.emBg, 280, 20),
      ]}),

      // search bar
      F(20, 104, 350, 38, P.surface2, { r: 10, stroke: P.border, sw: 1, ch: [
        T('🔍', 12, 10, 20, 18, { size: 15 }),
        T('Search transactions…', 36, 12, 240, 14, { size: 12, color: P.muted }),
        T('Filter', 290, 12, 46, 14, { size: 12, color: P.sapphire, align: 'right' }),
      ]}),

      // date pill
      F(20, 152, 350, 24, 'transparent', { ch: [
        T('TODAY — MAR 30', 0, 4, 200, 14, { size: 9, weight: 700, color: P.muted, ls: 1 }),
        T('$7,136', 250, 4, 100, 14, { size: 11, weight: 700, color: P.coral, align: 'right' }),
      ]}),

      F(20, 180, 350, 460, P.surface, { r: 16, stroke: P.border, sw: 1, ch: rows }),

      nav('spend'),
    ],
  };
}

// ── SCREEN 3 — Cards ─────────────────────────────────────────────────────────
function s3() {
  const cards = [
    { name: 'Engineering #1', holder: 'Dev Team', spent: '$18,200', limit: '$25,000', pct: 73, color: P.sapphire },
    { name: 'Engineering #3', holder: 'Ops Team', spent: '$4,100',  limit: '$5,000',  pct: 82, color: P.amber },
    { name: 'Design',         holder: 'Design',   spent: '$3,800',  limit: '$6,000',  pct: 63, color: P.indigo },
    { name: 'Travel',         holder: 'All Staff', spent: '$8,900', limit: '$10,000', pct: 89, color: P.coral },
  ];

  const cardViews = cards.map((c, i) => {
    const y = 14 + i * 102;
    return F(14, y, 322, 88, P.surface2, { r: 14, ch: [
      F(0, 0, 322, 88, 'transparent', { ch: [
        R(0, 0, 322, 88, c.color + '0F', { r: 14 }),
        T(c.name, 14, 12, 200, 14, { size: 13, weight: 700 }),
        T(c.holder, 14, 30, 150, 12, { size: 10, color: P.fg2 }),
        T(c.spent, 14, 50, 150, 18, { size: 16, weight: 800, color: c.color }),
        T(`of ${c.limit}`, 14, 70, 100, 12, { size: 10, color: P.fg2 }),
        T(`${c.pct}%`, 238, 24, 70, 18, { size: 16, weight: 800, color: c.color, align: 'right' }),
        bar(14, 46, 294, c.pct, c.color),
      ]}),
    ]});
  });

  return {
    id: uid(), label: 'Cards', width: 390, height: 844, fill: P.bg,
    children: [
      statBar(),
      F(0, 44, 390, 56, 'transparent', { ch: [
        T('Cards', 20, 14, 200, 24, { size: 20, weight: 700 }),
        F(290, 14, 80, 30, P.sapBg, { r: 10, stroke: P.sapphire, sw: 1, ch: [
          T('+ Issue', 16, 8, 48, 14, { size: 12, weight: 700, color: P.sapphire }),
        ]}),
      ]}),

      // summary 2-col
      F(20, 104, 166, 64, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
        T('ACTIVE', 12, 10, 142, 12, { size: 9, weight: 700, color: P.muted, ls: 0.8 }),
        T('12 cards', 12, 26, 142, 22, { size: 17, weight: 800 }),
        T('4 teams', 12, 50, 142, 12, { size: 10, color: P.fg2 }),
      ]}),
      F(204, 104, 166, 64, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
        T('FLAGGED', 12, 10, 142, 12, { size: 9, weight: 700, color: P.coral, ls: 0.8 }),
        T('2 cards', 12, 26, 142, 22, { size: 17, weight: 800, color: P.coral }),
        T('Near limit', 12, 50, 142, 12, { size: 10, color: P.fg2 }),
      ]}),

      T('ALL CARDS', 20, 182, 200, 12, { size: 9, weight: 700, color: P.muted, ls: 1 }),

      F(20, 200, 350, cards.length * 102 + 28, P.surface, { r: 16, stroke: P.border, sw: 1, ch: cardViews }),

      nav('cards'),
    ],
  };
}

// ── SCREEN 4 — Budget ────────────────────────────────────────────────────────
function s4() {
  const depts = [
    { name: 'Engineering',  budget: '$25,000', spent: '$18,200', pct: 73, color: P.sapphire },
    { name: 'Design',       budget: '$8,000',  spent: '$5,800',  pct: 73, color: P.indigo },
    { name: 'Marketing',    budget: '$10,000', spent: '$9,400',  pct: 94, color: P.coral },
    { name: 'Operations',   budget: '$7,000',  spent: '$4,100',  pct: 59, color: P.emerald },
    { name: 'G&A',          budget: '$10,000', spent: '$6,820',  pct: 68, color: P.amber },
  ];

  const rows = depts.flatMap((d, i) => {
    const y = 14 + i * 74;
    return [
      F(14, y, 322, 60, 'transparent', { ch: [
        T(d.name, 0, 2, 160, 14, { size: 13, weight: 700 }),
        T(`${d.spent} / ${d.budget}`, 0, 20, 200, 12, { size: 11, color: P.fg2 }),
        bar(0, 40, 322, d.pct, d.color),
        T(`${d.pct}%`, 264, 2, 44, 14, { size: 13, weight: 700, color: d.color, align: 'right' }),
        T(d.pct > 90 ? '⚠ Over pace' : d.pct > 75 ? 'On track' : '● Under', 264, 22, 58, 12, {
          size: 9, weight: 600,
          color: d.pct > 90 ? P.coral : d.pct > 75 ? P.fg2 : P.emerald,
          align: 'right', ls: 0.2,
        }),
      ]}),
      ...(i < depts.length - 1 ? [div(14, y + 60, 322)] : []),
    ];
  });

  return {
    id: uid(), label: 'Budget', width: 390, height: 844, fill: P.bg,
    children: [
      statBar(),
      F(0, 44, 390, 56, 'transparent', { ch: [
        T('Budget', 20, 14, 200, 24, { size: 20, weight: 700 }),
        T('Q1 2026', 20, 40, 100, 14, { size: 11, color: P.muted }),
        pill('1 ALERT', P.coral, P.corBg, 270, 20),
      ]}),

      // total donut placeholder card
      F(20, 104, 350, 100, P.surface, { r: 16, stroke: P.border, sw: 1, ch: [
        // left side text
        T('TOTAL BUDGET', 16, 14, 180, 12, { size: 9, weight: 700, color: P.muted, ls: 1 }),
        T('$60,000', 16, 30, 180, 30, { size: 26, weight: 800 }),
        T('$48,320 spent · $11,680 left', 16, 66, 240, 14, { size: 11, color: P.fg2 }),
        // visual donut stand-in
        F(265, 12, 70, 76, P.sapBg, { r: 12, ch: [
          E(15, 15, 40, P.sapphire + '3A'),
          E(20, 20, 30, P.surface),
          T('80%', 5, 24, 60, 14, { size: 12, weight: 700, color: P.sapphire, align: 'center' }),
        ]}),
      ]}),

      T('BY DEPARTMENT', 20, 218, 200, 12, { size: 9, weight: 700, color: P.muted, ls: 1 }),

      F(20, 236, 350, depts.length * 74 + 28, P.surface, { r: 16, stroke: P.border, sw: 1, ch: rows }),

      // alert card
      F(20, 648, 350, 52, P.corBg, { r: 12, stroke: P.coral, sw: 1, ch: [
        T('⚠  Marketing at 94% — on pace to overspend by $400', 14, 16, 322, 20, { size: 11, color: P.corLt }),
      ]}),

      nav('budget'),
    ],
  };
}

// ── SCREEN 5 — Signals ───────────────────────────────────────────────────────
function s5() {
  return {
    id: uid(), label: 'Signals', width: 390, height: 844, fill: P.bg,
    children: [
      statBar(),
      F(0, 44, 390, 56, 'transparent', { ch: [
        T('Signals', 20, 14, 200, 24, { size: 20, weight: 700 }),
        T('AI-powered anomaly detection', 20, 40, 220, 14, { size: 11, color: P.muted }),
        pill('3 NEW', P.indigo, P.indBg, 280, 20),
      ]}),

      // Signal 1 — Critical
      F(20, 106, 350, 108, P.surface, { r: 16, stroke: P.coral, sw: 1, ch: [
        F(0, 0, 350, 108, 'transparent', { ch: [
          F(14, 18, 38, 38, P.corBg, { r: 10, ch: [
            T('⚠', 10, 8, 18, 22, { size: 18 }),
          ]}),
          T('CRITICAL', 62, 16, 120, 12, { size: 9, weight: 700, color: P.coral, ls: 0.8 }),
          T('AWS spend 2× monthly forecast', 62, 30, 260, 15, { size: 13, weight: 700 }),
          T('$4,200 spent · forecast was $2,100', 62, 50, 260, 14, { size: 11, color: P.fg2 }),
          F(62, 74, 96, 22, P.corBg, { r: 8, stroke: P.coral, sw: 1, ch: [
            T('Investigate →', 10, 4, 76, 14, { size: 10, weight: 700, color: P.coral }),
          ]}),
          T('2h ago', 278, 76, 58, 14, { size: 10, color: P.muted, align: 'right' }),
        ]}),
      ]}),

      // Signal 2 — Opportunity
      F(20, 226, 350, 100, P.surface, { r: 16, stroke: P.emerald, sw: 1, ch: [
        F(0, 0, 350, 100, 'transparent', { ch: [
          F(14, 18, 38, 38, P.emBg, { r: 10, ch: [
            T('↗', 11, 8, 16, 22, { size: 18, color: P.emerald }),
          ]}),
          T('OPPORTUNITY', 62, 16, 140, 12, { size: 9, weight: 700, color: P.emerald, ls: 0.8 }),
          T('Switch Figma billing to annual', 62, 30, 260, 15, { size: 13, weight: 700 }),
          T('Save ~$440/yr vs monthly plan', 62, 50, 260, 14, { size: 11, color: P.fg2 }),
          F(62, 72, 82, 22, P.emBg, { r: 8, stroke: P.emerald, sw: 1, ch: [
            T('View offer →', 8, 4, 66, 14, { size: 10, weight: 700, color: P.emerald }),
          ]}),
        ]}),
      ]}),

      // Signal 3 — Insight
      F(20, 338, 350, 100, P.surface, { r: 16, stroke: P.indigo, sw: 1, ch: [
        F(0, 0, 350, 100, 'transparent', { ch: [
          F(14, 18, 38, 38, P.indBg, { r: 10, ch: [
            T('◈', 10, 7, 18, 24, { size: 18, color: P.indLt }),
          ]}),
          T('INSIGHT', 62, 16, 120, 12, { size: 9, weight: 700, color: P.indLt, ls: 0.8 }),
          T('SaaS spend up 18% QoQ', 62, 30, 260, 15, { size: 13, weight: 700 }),
          T('6 new tools added since Jan — audit due', 62, 50, 260, 14, { size: 11, color: P.fg2 }),
          F(62, 72, 76, 22, P.indBg, { r: 8, stroke: P.indigo, sw: 1, ch: [
            T('Run audit →', 8, 4, 60, 14, { size: 10, weight: 700, color: P.indLt }),
          ]}),
        ]}),
      ]}),

      // Signal 4 — Info
      F(20, 450, 350, 84, P.surface, { r: 16, stroke: P.border, sw: 1, ch: [
        F(0, 0, 350, 84, 'transparent', { ch: [
          F(14, 18, 38, 38, P.surface2, { r: 10, ch: [
            T('📅', 10, 8, 18, 22, { size: 16 }),
          ]}),
          T('INFO', 62, 16, 80, 12, { size: 9, weight: 700, color: P.muted, ls: 0.8 }),
          T('4 vendor renewals in April', 62, 30, 260, 15, { size: 13, weight: 700 }),
          T('Total: $8,200 · First due Apr 4', 62, 50, 220, 14, { size: 11, color: P.fg2 }),
        ]}),
      ]}),

      // AI badge
      F(20, 546, 350, 44, P.indBg, { r: 12, ch: [
        T('◈  Pavo AI scanned 3,812 transactions · Refreshed 4 min ago', 14, 14, 320, 16, { size: 11, color: P.indLt }),
      ]}),

      nav('signals'),
    ],
  };
}

// ── SCREEN 6 — Settings ──────────────────────────────────────────────────────
function s6() {
  return {
    id: uid(), label: 'Settings', width: 390, height: 844, fill: P.bg,
    children: [
      statBar(),
      F(0, 44, 390, 80, 'transparent', { ch: [
        F(20, 14, 50, 50, P.surface2, { r: 25, ch: [
          T('TM', 13, 17, 24, 16, { size: 14, weight: 700, color: P.sapphire }),
        ]}),
        T('Tara Moss', 82, 18, 180, 18, { size: 15, weight: 700 }),
        T('Finance Lead · Acme Inc.', 82, 40, 200, 14, { size: 11, color: P.muted }),
        F(286, 22, 64, 30, P.sapBg, { r: 8, stroke: P.sapphire, sw: 1, ch: [
          T('Admin', 10, 8, 44, 14, { size: 11, weight: 700, color: P.sapphire }),
        ]}),
      ]}),

      T('INTEGRATIONS', 20, 132, 200, 12, { size: 9, weight: 700, color: P.muted, ls: 1 }),

      F(20, 150, 350, 216, P.surface, { r: 16, stroke: P.border, sw: 1, ch: [
        ...[
          ['Stripe',   '💳', 'Payouts syncing · live',      P.emerald],
          ['AWS',      '☁',  '⚠ Anomaly detected',          P.coral],
          ['Ramp',     '◫',  'Card data syncing · 5m ago',  P.emerald],
          ['Quickbooks','📊','Accounting export · enabled', P.emerald],
          ['Slack',    '💬', 'Alerts channel #spend',       P.sapphire],
        ].flatMap(([name, icon, sub, sc], i) => [
          F(14, 14 + i * 40, 322, 32, 'transparent', { ch: [
            T(icon, 0, 6, 20, 20, { size: 14 }),
            T(name, 26, 0, 120, 14, { size: 13, weight: 600 }),
            T(sub, 26, 16, 200, 12, { size: 10, color: P.fg2 }),
            E(308, 12, 8, sc),
          ]}),
          ...(i < 4 ? [div(14, 46 + i * 40, 322)] : []),
        ]),
      ]}),

      T('PREFERENCES', 20, 380, 200, 12, { size: 9, weight: 700, color: P.muted, ls: 1 }),

      ...[
        ['Budget alerts',      'When 80% reached'],
        ['Weekly digest',      'Every Monday 9am'],
        ['Anomaly detection',  'Real-time AI scan'],
        ['Export format',      'CSV + QuickBooks'],
      ].flatMap(([label, val], i) => [
        F(20, 398 + i * 54, 350, 46, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
          T(label, 14, 16, 180, 14, { size: 13, weight: 600 }),
          T(val, 180, 16, 156, 14, { size: 11, color: P.sapphire, align: 'right' }),
        ]}),
      ]),

      nav('signals'),
    ],
  };
}

// ── Assemble & write ─────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'PAVO — Spend intelligence for modern teams',
  screens: [ s1(), s2(), s3(), s4(), s5(), s6() ],
};

const out = path.join(__dirname, 'pavo.pen');
fs.writeFileSync(out, JSON.stringify(pen, null, 2));
console.log(`✓ pavo.pen written (${(fs.statSync(out).size / 1024).toFixed(1)} KB)`);
console.log(`  Screens: ${pen.screens.map(s => s.label).join(', ')}`);
