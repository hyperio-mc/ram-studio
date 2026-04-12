'use strict';
// tint-app.js
// TINT — Personal Finance Reimagined as a Beauty Ritual
//
// Challenge: Design a personal finance tracker using the blush+indigo aesthetic
// discovered on overlay.com (lapa.ninja featured, March 2026). Overlay.com —
// "The Future of Beauty is Automated" — uses blush white #FBF9FB + deep navy
// indigo #2E2F53 with Roboto Flex variable font. The tension between ultra-
// soft, tactile beauty aesthetics and precise financial data is unexplored.
//
// Also inspired by interfere.com's dense bento grid of 14 feature cards
// (lapa.ninja, March 2026) — adapting that layout pattern for mobile finance.
//
// Palette: Overlay blush #FBF9FB + deep indigo #2E2F53 + rose #C47EB5 + sage #6BAD9E
// Typography: Roboto Flex (variable weight 300–800) — Overlay-exact type system
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

// ── Palette (Overlay.com exact extraction + derived tones) ────────────────────
const P = {
  bg:       '#FBF9FB',   // blush white (Overlay.com exact — rgb(251,249,251))
  surface:  '#F4EFF8',   // lavender surface
  surface2: '#EDE6F4',   // deeper lavender card
  surface3: '#E5DCF0',   // card shadow fill
  border:   '#D8D0EA',   // periwinkle border
  border2:  '#C8BDDF',   // visible border
  fg:       '#2E2F53',   // deep indigo (Overlay.com exact — rgb(46,47,83))
  fg2:      '#6264A0',   // medium indigo (secondary text)
  muted:    '#9D9FC4',   // muted periwinkle
  muted2:   '#B8B9D8',   // very muted
  rose:     '#C47EB5',   // rose accent (warmth/spending)
  rose2:    '#E8B4D8',   // soft rose
  rose3:    '#F5E6F2',   // pale rose surface
  sage:     '#6BAD9E',   // sage teal (positive/growth)
  sage2:    '#A8D4CB',   // soft sage
  sage3:    '#E0F2EE',   // pale sage surface
  amber:    '#C9946A',   // warm amber (caution)
  amber2:   '#F0D4B8',   // pale amber
  accent:   '#4E51A0',   // deeper indigo (primary accent)
  white:    '#FFFFFF',   // pure white for cards
};

let _id = 0;
const uid = () => `tn${++_id}`;

// ── Primitives ────────────────────────────────────────────────────────────────
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
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Line = (x, y, w, fill = P.border) => F(x, y, w, 1, fill);

// ── Reusable Components ───────────────────────────────────────────────────────

// Soft glow aura — blush/indigo halos (light mode version of cosmic glows)
const Aura = (cx, cy, r, color, opacity = 0.12) => [
  E(cx - r*2.2, cy - r*2.2, r*4.4, r*4.4, color, { opacity: opacity * 0.25 }),
  E(cx - r*1.5, cy - r*1.5, r*3.0, r*3.0, color, { opacity: opacity * 0.5  }),
  E(cx - r,     cy - r,     r*2,   r*2,   color, { opacity: opacity }),
  E(cx - r*0.5, cy - r*0.5, r,     r,     color, { opacity: opacity * 1.8  }),
];

// Category pill — blush-style soft pills
const CategoryPill = (x, y, label, bg, tc) => F(x, y, label.length * 6.8 + 20, 22, bg, {
  r: 11,
  ch: [T(label, 10, 4, label.length * 6.8, 14, { size: 10, fill: tc, weight: 600, ls: 0.5 })],
});

// Amount display — large editorial number
const Amount = (x, y, value, sub, color = P.fg) => [
  T(value, x, y, 300, 56, { size: 48, fill: color, weight: 700, ls: -1.5 }),
  T(sub,   x, y + 58, 220, 14, { size: 12, fill: P.muted, weight: 400 }),
];

// Bento card — minimal bordered card (Interfere-inspired bento grid)
const BentoCard = (x, y, w, h, children, opts = {}) => F(x, y, w, h, opts.bg || P.white, {
  r: opts.r || 16,
  stroke: opts.stroke || P.border,
  sw: 1,
  ch: children,
});

// Progress bar
const ProgressBar = (x, y, w, progress, color, bg = P.border) => [
  F(x, y, w, 4, bg, { r: 2 }),
  F(x, y, Math.round(w * progress), 4, color, { r: 2 }),
];

// Spend row — single transaction line
const SpendRow = (x, y, label, category, amount, color, catBg) => F(x, y, 350, 52, P.white, {
  r: 12, stroke: P.border, sw: 1,
  ch: [
    E(14, 14, 24, 24, catBg),
    T(label,    50, 10, 180, 16, { size: 13, fill: P.fg,   weight: 500 }),
    T(category, 50, 28, 140, 12, { size: 10, fill: P.muted, weight: 400 }),
    T(amount,  256, 15, 80,  20, { size: 14, fill: color,  weight: 700, align: 'right' }),
  ],
});

// Bottom nav (light mode, blush-style)
const BottomNav = (activeIdx) => F(0, 764, 390, 80, P.white, {
  stroke: P.border, sw: 1,
  ch: [
    Line(0, 0, 390, P.border),
    ...[
      ['◐', 'Overview', 0],
      ['◑', 'Spending', 1],
      ['○', 'Rhythms',  2],
      ['◉', 'Goals',    3],
    ].map(([ic, lb, j]) => {
      const nx = 8 + j * 94;
      const active = j === activeIdx;
      return [
        active ? F(nx + 20, 8, 54, 48, P.rose3, { r: 14 }) : null,
        T(ic, nx + 28, 16, 38, 20, { size: 16, fill: active ? P.rose : P.muted, align: 'center' }),
        T(lb, nx + 8, 38, 78, 12, { size: 9, fill: active ? P.accent : P.muted, align: 'center', weight: active ? 700 : 400, ls: 0.3 }),
      ].filter(Boolean);
    }).flat(),
  ],
});

// Status bar (light)
const StatusBar = () => F(0, 0, 390, 44, P.bg, {
  ch: [
    T('9:41', 20, 14, 50, 16, { size: 13, fill: P.fg, weight: 700 }),
    T('●●●  ▼  ⊡', 270, 14, 100, 16, { size: 12, fill: P.fg, align: 'right', opacity: 0.6 }),
  ],
});

// ── Screen 1: Welcome / Onboarding ────────────────────────────────────────────
function screenWelcome(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [

    // Soft blush aura — centered, Overlay-like
    ...Aura(195, 280, 160, P.rose, 0.10),
    ...Aura(320, 140, 80, P.accent, 0.07),
    ...Aura(60,  600, 100, P.sage, 0.06),

    // Fine radial grid suggestion — very subtle
    E(-60, 120, 300, 300, P.border, { opacity: 0.12 }),
    E(150, 360, 500, 500, P.border, { opacity: 0.08 }),

    StatusBar(),

    // Logo mark — minimal circle wordmark
    F(163, 54, 64, 64, P.fg, { r: 32, ch: [
      T('T', 0, 10, 64, 44, { size: 34, fill: P.bg, weight: 800, align: 'center' }),
    ]}),

    // Hero headline — large Roboto Flex display
    T('See your', 36, 152, 320, 48, { size: 42, fill: P.fg, weight: 300, lh: 1.15 }),
    T('money', 36, 196, 320, 52, { size: 46, fill: P.fg, weight: 800, lh: 1.15, ls: -1.5 }),
    T('differently.', 36, 244, 320, 48, { size: 40, fill: P.fg2, weight: 400, lh: 1.15 }),

    // Tagline
    T('TINT applies the precision of\nbeauty science to personal finance.', 36, 316, 290, 44, {
      size: 13, fill: P.muted, weight: 400, lh: 1.65,
    }),

    // Feature trio (Overlay-style minimal list)
    ...([
      ['◉ Financial health score,', 'updated every morning'],
      ['◎ Spending patterns', 'visualised as weekly rhythms'],
      ['⊕ Gentle goal rituals,', 'not aggressive trackers'],
    ].map(([a, b], i) => [
      T(a, 36, 392 + i * 48, 240, 16, { size: 13, fill: P.fg, weight: 600 }),
      T(b, 36, 410 + i * 48, 240, 14, { size: 12, fill: P.muted }),
    ]).flat()),

    // Primary CTA — blush pill button
    F(36, 588, 318, 54, P.fg, { r: 27, ch: [
      T('Begin your ritual', 0, 17, 318, 20, { size: 15, fill: P.bg, weight: 700, align: 'center' }),
    ]}),

    // Secondary CTA
    T('Already have an account? Sign in', 134, 660, 172, 14, {
      size: 11, fill: P.muted, align: 'center',
    }),

    // Indicator dots
    F(155, 700, 80, 6, 'transparent', { ch: [
      E(0, 0, 6, 6, P.fg),
      E(14, 1, 4, 4, P.muted2),
      E(26, 1, 4, 4, P.muted2),
    ]}),

    // "By RAM" tag
    T('TINT · FINANCIAL WELLNESS AI', 80, 740, 230, 12, {
      size: 9, fill: P.muted, align: 'center', ls: 1.5, weight: 600,
    }),

  ]});
}

// ── Screen 2: Daily Dashboard (Bento Grid) ────────────────────────────────────
function screenDashboard(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [

    StatusBar(),

    // Header
    T('Good morning, Nia.', 20, 52, 280, 24, { size: 18, fill: P.fg, weight: 600 }),
    T('FRIDAY · MARCH 21', 20, 78, 200, 14, { size: 10, fill: P.muted, ls: 2, weight: 600 }),

    // Tint score — hero bento card (full width)
    BentoCard(20, 104, 350, 120, [
      T('WELLNESS SCORE', 16, 16, 200, 12, { size: 9, fill: P.muted, ls: 2, weight: 700 }),
      T('84', 16, 34, 88, 56, { size: 52, fill: P.fg, weight: 800, ls: -2 }),
      T('/100', 76, 64, 44, 20, { size: 16, fill: P.muted, weight: 300 }),
      T('↑ 3 pts this week', 130, 72, 160, 16, { size: 12, fill: P.sage, weight: 600 }),
      // Mini bar chart suggestion
      ...[0.6, 0.5, 0.7, 0.8, 0.65, 0.9, 0.84].map((v, i) =>
        F(154 + i * 26, 28 + Math.round((1-v)*44), 16, Math.round(v*44), P.border, { r: 3 })
      ),
      ...[0.6, 0.5, 0.7, 0.8, 0.65, 0.9, 0.84].map((v, i) =>
        i === 6
          ? F(154 + i * 26, 28 + Math.round((1-v)*44), 16, Math.round(v*44), P.accent, { r: 3, opacity: 0.9 })
          : F(154 + i * 26, 28 + Math.round((1-v)*44), 16, Math.round(v*44), P.accent, { r: 3, opacity: 0.3 })
      ),
      T('MON', 154, 80, 26, 10, { size: 8, fill: P.muted, align: 'center' }),
      T('FRI', 154 + 6*26, 80, 26, 10, { size: 8, fill: P.accent, align: 'center', weight: 700 }),
    ]),

    // Bento row 1: spend + saved (half width)
    BentoCard(20, 236, 167, 100, [
      T('SPENT TODAY', 14, 12, 140, 10, { size: 9, fill: P.muted, ls: 1.5, weight: 700 }),
      T('$43', 14, 30, 100, 38, { size: 34, fill: P.rose, weight: 800, ls: -1 }),
      T('of $80 daily', 14, 70, 120, 12, { size: 10, fill: P.muted }),
      ...ProgressBar(14, 86, 138, 0.54, P.rose, P.rose2),
    ]),
    BentoCard(197, 236, 173, 100, [
      T('SAVED THIS MO', 12, 12, 148, 10, { size: 9, fill: P.muted, ls: 1.5, weight: 700 }),
      T('$312', 12, 30, 130, 38, { size: 34, fill: P.sage, weight: 800, ls: -1 }),
      T('of $400 goal', 12, 70, 130, 12, { size: 10, fill: P.muted }),
      ...ProgressBar(12, 86, 148, 0.78, P.sage, P.sage2),
    ]),

    // Bento row 2: three small stats
    BentoCard(20, 348, 108, 80, [
      T('SUBSCRIPTIONS', 10, 10, 90, 18, { size: 8, fill: P.muted, ls: 1, weight: 700, lh: 1.4 }),
      T('$127', 10, 38, 80, 28, { size: 24, fill: P.fg, weight: 800, ls: -0.5 }),
      T('/mo', 58, 48, 30, 14, { size: 10, fill: P.muted }),
    ]),
    BentoCard(138, 348, 108, 80, [
      T('DINING', 10, 10, 90, 10, { size: 8, fill: P.muted, ls: 1, weight: 700 }),
      T('$89', 10, 28, 80, 28, { size: 24, fill: P.amber, weight: 800, ls: -0.5 }),
      T('↑ 12%', 10, 58, 80, 14, { size: 10, fill: P.amber, weight: 600 }),
    ]),
    BentoCard(256, 348, 114, 80, [
      T('NET WORTH', 10, 10, 96, 10, { size: 8, fill: P.muted, ls: 1, weight: 700 }),
      T('$24.2k', 10, 28, 96, 28, { size: 20, fill: P.sage, weight: 800, ls: -0.5 }),
      T('↑ $840 this wk', 10, 58, 96, 14, { size: 9, fill: P.sage, weight: 600 }),
    ]),

    // Today's transactions header
    T('TODAY', 20, 448, 120, 12, { size: 9, fill: P.muted, ls: 2.5, weight: 700 }),
    T('See all →', 290, 448, 80, 12, { size: 9, fill: P.accent, align: 'right' }),

    // Transaction rows
    SpendRow(20, 470, 'Oat & the Owl',   'Coffee',   '-$6.80', P.rose,  P.rose3),
    SpendRow(20, 530, 'Muni Monthly Pass','Transport','-$98.00',P.fg2,   P.surface),
    SpendRow(20, 590, 'Spotify',          'Music',    '-$10.99',P.fg2,   P.surface2),
    SpendRow(20, 650, 'Freelance invoice','Income',   '+$640',  P.sage,  P.sage3),

    BottomNav(0),
  ]});
}

// ── Screen 3: Spending Ritual ─────────────────────────────────────────────────
function screenSpending(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [

    StatusBar(),

    T('← Back', 20, 52, 80, 16, { size: 12, fill: P.muted }),
    T('Spending Ritual', 20, 78, 260, 24, { size: 18, fill: P.fg, weight: 700 }),
    T('MARCH 2026', 20, 104, 150, 12, { size: 10, fill: P.muted, ls: 2 }),

    // Monthly total hero
    F(20, 128, 350, 96, P.surface, { r: 20, stroke: P.border, sw: 1, ch: [
      T('TOTAL SPENT', 20, 14, 180, 12, { size: 9, fill: P.muted, ls: 2, weight: 700 }),
      T('$1,842', 20, 32, 200, 44, { size: 38, fill: P.fg, weight: 800, ls: -1.5 }),
      T('↓ 8% vs last month', 20, 78, 200, 12, { size: 10, fill: P.sage, weight: 600 }),
      CategoryPill(220, 16, 'ON TRACK', P.sage3, P.sage),
    ]}),

    // Category breakdown header
    T('BY CATEGORY', 20, 242, 180, 12, { size: 9, fill: P.muted, ls: 2.5, weight: 700 }),

    // Category bars (horizontal breakdown)
    ...([
      { label: 'Housing',     amount: '$800', pct: 0.43, color: P.accent,  bg: P.surface },
      { label: 'Food',        amount: '$380', pct: 0.21, color: P.rose,    bg: P.rose3   },
      { label: 'Transport',   amount: '$240', pct: 0.13, color: P.fg2,     bg: P.surface2 },
      { label: 'Subscriptions',amount:'$127', pct: 0.07, color: P.amber,   bg: P.amber2  },
      { label: 'Health',      amount: '$160', pct: 0.09, color: P.sage,    bg: P.sage3   },
      { label: 'Other',       amount: '$135', pct: 0.07, color: P.muted,   bg: P.border  },
    ].map(({ label, amount, pct, color, bg }, i) =>
      F(20, 264 + i * 64, 350, 52, P.white, { r: 12, stroke: P.border, sw: 1, ch: [
        F(0, 0, Math.round(pct * 350), 52, bg, { r: 12, opacity: 0.5 }),
        T(label,  14, 10, 150, 14, { size: 12, fill: P.fg,   weight: 600 }),
        T(amount, 14, 28, 100, 14, { size: 12, fill: color,  weight: 700 }),
        T((pct * 100).toFixed(0) + '%', 300, 18, 40, 16, { size: 11, fill: P.muted, align: 'right', weight: 500 }),
      ]}),
    )),

    // Ritual note
    F(20, 658, 350, 52, P.rose3, { r: 14, stroke: P.rose2, sw: 1, ch: [
      T('✦', 16, 16, 20, 20, { size: 16, fill: P.rose }),
      T('You spent 8% less on food than last month.', 42, 18, 290, 16, { size: 12, fill: P.fg, weight: 500 }),
    ]}),

    // Month switcher
    F(20, 722, 350, 32, 'transparent', { ch: [
      T('← Feb', 0, 8, 60, 16, { size: 12, fill: P.muted }),
      T('March 2026', 125, 8, 100, 16, { size: 12, fill: P.fg, weight: 600, align: 'center' }),
      T('Apr →', 290, 8, 60, 16, { size: 12, fill: P.muted2, align: 'right' }),
    ]}),

    BottomNav(1),
  ]});
}

// ── Screen 4: Rhythm Analysis ─────────────────────────────────────────────────
function screenRhythm(ox) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const values = [38, 65, 42, 78, 43, 120, 24];
  const maxV = Math.max(...values);

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [

    StatusBar(),

    T('← Back', 20, 52, 80, 16, { size: 12, fill: P.muted }),
    T('Spending Rhythms', 20, 78, 280, 24, { size: 18, fill: P.fg, weight: 700 }),
    T('YOUR WEEKLY PATTERN', 20, 104, 220, 12, { size: 10, fill: P.muted, ls: 2 }),

    // Weekly spend chart
    F(20, 128, 350, 200, P.white, { r: 20, stroke: P.border, sw: 1, ch: [
      T('WEEKLY SPEND', 16, 14, 180, 10, { size: 9, fill: P.muted, ls: 1.5, weight: 700 }),
      T('Avg $58/day', 230, 14, 100, 10, { size: 10, fill: P.muted, align: 'right' }),
      // Chart bars
      ...values.map((v, i) => {
        const barH = Math.round((v / maxV) * 110);
        const isMax = v === maxV;
        const isCurrent = i === 4; // Friday
        const color = isMax ? P.rose : isCurrent ? P.accent : P.border;
        return [
          F(22 + i * 44, 36 + (110 - barH), 28, barH, color, { r: 6, opacity: isMax ? 0.9 : isCurrent ? 0.8 : 0.5 }),
          T(days[i], 22 + i * 44, 154, 28, 14, { size: 10, fill: isCurrent ? P.accent : P.muted, align: 'center', weight: isCurrent ? 700 : 400 }),
          T('$' + v, 16 + i * 44, 170, 40, 12, { size: 9, fill: P.muted, align: 'center' }),
        ];
      }).flat(),
    ]}),

    // Insight cards (2×2 bento)
    T('PATTERN INSIGHTS', 20, 346, 220, 12, { size: 9, fill: P.muted, ls: 2.5, weight: 700 }),

    BentoCard(20, 368, 167, 120, [
      T('🌅', 14, 12, 30, 24, { size: 20 }),
      T('Weekend Splurge', 14, 42, 140, 16, { size: 12, fill: P.fg, weight: 700 }),
      T('You spend 2.8× more on Saturdays. Mostly dining and entertainment.', 14, 62, 138, 44, { size: 10, fill: P.muted, lh: 1.55 }),
    ]),
    BentoCard(197, 368, 173, 120, [
      T('☕', 12, 12, 30, 24, { size: 20 }),
      T('Morning Ritual', 12, 42, 148, 16, { size: 12, fill: P.fg, weight: 700 }),
      T('$6–9 coffee habit on weekdays adds up to $130/month.', 12, 62, 148, 44, { size: 10, fill: P.muted, lh: 1.55 }),
    ]),

    BentoCard(20, 500, 167, 108, [
      T('📉', 14, 12, 30, 24, { size: 20 }),
      T('Lowest Day', 14, 40, 140, 16, { size: 12, fill: P.fg, weight: 700 }),
      T('Sundays avg $24 — your natural recovery day.', 14, 60, 138, 36, { size: 10, fill: P.muted, lh: 1.55 }),
    ]),
    BentoCard(197, 500, 173, 108, [
      T('💡', 12, 12, 30, 24, { size: 20 }),
      T('Opportunity', 12, 40, 148, 16, { size: 12, fill: P.fg, weight: 700 }),
      T('Shift 1 Friday dinner home — save $40/wk.', 12, 60, 148, 36, { size: 10, fill: P.sage, weight: 500, lh: 1.55 }),
    ]),

    // Monthly rhythm strip
    T('12-MONTH VIEW', 20, 626, 180, 12, { size: 9, fill: P.muted, ls: 2.5, weight: 700 }),
    F(20, 648, 350, 52, P.white, { r: 14, stroke: P.border, sw: 1, ch: [
      ...['A','M','J','J','A','S','O','N','D','J','F','M'].map((m, i) => {
        const v2 = [0.6,0.7,0.9,0.85,0.55,0.8,0.72,0.65,0.95,0.5,0.6,0.75][i];
        const isCur = i === 11;
        return [
          F(8 + i * 28, 6, 20, Math.round(v2 * 32), isCur ? P.accent : P.border, { r: 3, opacity: isCur ? 0.9 : 0.6 }),
          T(m, 8 + i * 28, 40, 20, 10, { size: 8, fill: isCur ? P.accent : P.muted, align: 'center', weight: isCur ? 700 : 400 }),
        ];
      }).flat(),
    ]}),

    BottomNav(2),
  ]});
}

// ── Screen 5: Goal Garden ─────────────────────────────────────────────────────
function screenGoals(ox) {
  const goals = [
    { name: 'Emergency Fund',   target: '$10,000', saved: '$6,240', pct: 0.624, color: P.sage,   icon: '🌿', sub: '$3,760 remaining' },
    { name: 'Tokyo Trip 2026',  target: '$4,500',  saved: '$2,100', pct: 0.467, color: P.rose,   icon: '✈️', sub: 'On pace for August' },
    { name: 'New MacBook',      target: '$2,000',  saved: '$1,560', pct: 0.780, color: P.accent, icon: '💻', sub: '$440 to go — close!' },
    { name: 'Year Savings',     target: '$8,000',  saved: '$3,120', pct: 0.390, color: P.amber,  icon: '📅', sub: '39% of annual goal' },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [

    StatusBar(),

    T('← Back', 20, 52, 80, 16, { size: 12, fill: P.muted }),
    T('Goal Garden', 20, 78, 260, 24, { size: 18, fill: P.fg, weight: 700 }),
    T('YOUR 4 ACTIVE RITUALS', 20, 104, 240, 12, { size: 10, fill: P.muted, ls: 2 }),

    // Summary
    F(20, 128, 350, 72, P.surface, { r: 16, stroke: P.border, sw: 1, ch: [
      T('TOTAL GOAL PROGRESS', 16, 12, 220, 10, { size: 9, fill: P.muted, ls: 1.5, weight: 700 }),
      T('$12,920', 16, 28, 160, 28, { size: 24, fill: P.fg, weight: 800, ls: -0.8 }),
      T('saved across all goals', 140, 40, 180, 14, { size: 11, fill: P.muted }),
      T('56% overall', 260, 28, 80, 16, { size: 12, fill: P.sage, weight: 700, align: 'right' }),
    ]}),

    // Goal cards
    ...goals.map((g, i) => F(20, 212 + i * 124, 350, 112, P.white, {
      r: 18, stroke: P.border, sw: 1,
      ch: [
        T(g.icon, 14, 14, 32, 32, { size: 24 }),
        T(g.name,   52, 14, 220, 18, { size: 14, fill: P.fg, weight: 700 }),
        T(g.target, 52, 34, 160, 14, { size: 11, fill: P.muted }),
        T(g.saved, 264, 14, 72, 18, { size: 14, fill: g.color, weight: 800, align: 'right' }),
        T(g.sub,   264, 34, 72, 14, { size: 9, fill: P.muted, align: 'right' }),

        // Progress bar
        F(14, 64, 322, 6, P.border, { r: 3 }),
        F(14, 64, Math.round(322 * g.pct), 6, g.color, { r: 3 }),

        // Pct label
        T((g.pct * 100).toFixed(0) + '%', 14, 78, 60, 14, { size: 11, fill: g.color, weight: 700 }),
        T('+ Add money', 264, 78, 72, 14, { size: 11, fill: P.accent, align: 'right', weight: 600 }),
      ],
    })),

    // Add goal CTA
    F(20, 712, 350, 44, P.fg, { r: 22, ch: [
      T('+ Plant a new goal', 0, 13, 350, 18, { size: 13, fill: P.bg, weight: 700, align: 'center' }),
    ]}),

    BottomNav(3),
  ]});
}

// ── Assemble document ─────────────────────────────────────────────────────────
const GAP = 40;
const W = 390, H = 844;

const doc = {
  version: '2.8',
  width: (W + GAP) * 5 - GAP,
  height: H,
  fill: '#F0ECF6',
  children: [
    screenWelcome(0),
    screenDashboard((W + GAP) * 1),
    screenSpending((W + GAP) * 2),
    screenRhythm(  (W + GAP) * 3),
    screenGoals(   (W + GAP) * 4),
  ],
};

const outPath = path.join(__dirname, 'tint.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log(`✓ tint.pen written — ${(fs.statSync(outPath).size / 1024).toFixed(1)} KB`);
console.log(`  Screens: Welcome · Dashboard · Spending · Rhythms · Goals`);
console.log(`  Palette: #FBF9FB blush + #2E2F53 deep indigo (Overlay.com)`);
