'use strict';
// stride-app.js
// STRIDE — Athletic Performance OS
//
// Challenge: Light-mode athletic performance tracking app for serious runners & triathletes.
// Push on: editorial typographic hierarchy for data, editorial 'newspaper' grid layouts,
// performance ring/arc visualizations built from rectangles.
//
// Inspired by:
//   1. "Fluid Glass" Awwwards nominee (awwwards.com, Mar 2026) — translucent card layering,
//      depth through subtle overlaps, glass-adjacent elevation system
//   2. Veo Sports Cameras (land-book.com, Mar 2026) — sports-tech data-forward product,
//      large editorial numbers, confident display typography on warm white
//   3. Locomotive.ca (godly.website, Mar 2026) — editorial grid layout, generous
//      whitespace, bold section labels, cinematic text sizing for metric hierarchy
//
// Theme: LIGHT — warm #F6F2EC ivory + electric #1D56E8 blue + vivid #00C875 green
// Screens: 6 mobile (390×844)

const fs   = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const uid  = () => randomUUID();

// ── Palette ─────────────────────────────────────────────────────────────────
const P = {
  bg:        '#F6F2EC',   // warm ivory — editorial print feel
  surface:   '#FFFFFF',
  surface2:  '#EEE9E1',   // slightly deeper ivory
  surface3:  '#E8E3DA',
  border:    '#E0D9CF',
  borderMid: '#C8BFB0',

  fg:        '#161210',   // near-black warm
  fg2:       '#3C3730',
  muted:     '#8A8278',
  dim:       '#B8B0A4',

  blue:      '#1D56E8',   // electric blue — performance primary
  blueBg:    '#EEF2FD',
  blueLt:    '#4A7AF0',
  blueDark:  '#0F3AB8',

  green:     '#00C875',   // vivid green — gains & PRs
  greenBg:   '#E6FAF2',
  greenLt:   '#33D990',

  amber:     '#E08000',   // amber — warnings & fatigue
  amberBg:   '#FEF3E2',
  amberLt:   '#EEA030',

  red:       '#D63B3B',   // red — overtraining alerts
  redBg:     '#FDEAEA',
  redLt:     '#E05C5C',

  purple:    '#8040C8',   // purple — heart rate zones
  purpleBg:  '#F4EDFC',
  purpleLt:  '#9E60D8',
};

// ── Primitive builders ────────────────────────────────────────────────────────
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

const E = (x, y, d, fill) => ({
  id: uid(), type: 'ellipse', x, y, width: d, height: d, fill,
});

// ── Reusable components ───────────────────────────────────────────────────────
const statBar = () => F(0, 0, 390, 44, P.bg, { ch: [
  T('9:41', 20, 14, 50, 16, { size: 13, weight: 600, color: P.fg }),
  T('⬡ ⬡ ⬡ ◻ ◻', 290, 14, 80, 16, { size: 11, color: P.fg2, align: 'right' }),
]});

const nav = (active) => {
  const items = [
    { id: 'today',   icon: '◉', label: 'Today'    },
    { id: 'train',   icon: '▶', label: 'Train'    },
    { id: 'stats',   icon: '◈', label: 'Stats'    },
    { id: 'recover', icon: '◑', label: 'Recover'  },
    { id: 'me',      icon: '◎', label: 'Me'       },
  ];
  return F(0, 782, 390, 62, P.surface, {
    stroke: P.border, sw: 1,
    ch: items.map((item, i) => {
      const isActive = item.id === active;
      const x = i * 78;
      return F(x, 0, 78, 62, 'transparent', { ch: [
        T(item.icon, 0, 10, 78, 20, {
          size: 18,
          color: isActive ? P.blue : P.dim,
          align: 'center',
        }),
        T(item.label, 0, 34, 78, 14, {
          size: 9, weight: isActive ? 700 : 400,
          color: isActive ? P.blue : P.muted,
          align: 'center', ls: 0.2,
        }),
      ]});
    }),
  });
};

const pill = (text, fg, bg, x, y) => F(x, y, text.length * 7 + 16, 22, bg, {
  r: 11, ch: [T(text, 8, 4, text.length * 7, 14, { size: 9, weight: 700, color: fg, ls: 0.6 })],
});

const div = (x, y, w) => R(x, y, w, 1, P.border);

// Progress bar
const bar = (x, y, w, pct, color) => F(x, y, w, 5, P.surface2, { r: 3, ch: [
  R(0, 0, Math.round(w * pct / 100), 5, color, { r: 3 }),
]});

// ── SCREEN 1 — Today ─────────────────────────────────────────────────────────
function s1() {
  const weekDots = ['M','T','W','T','F','S','S'].map((d, i) => {
    const isToday = i === 4; // Friday
    const done    = i < 4;
    const rest    = i >= 5;
    return F(i * 52, 0, 44, 44, done ? P.blueBg : isToday ? P.blue : P.surface, {
      r: 12,
      stroke: isToday ? P.blue : P.border,
      sw: isToday ? 2 : 1,
      ch: [
        T(d, 0, 4, 44, 12, {
          size: 9, weight: 600,
          color: isToday ? P.surface : done ? P.blue : P.muted,
          align: 'center', ls: 0.6,
        }),
        T(rest ? '–' : done ? '✓' : isToday ? '!' : '·', 0, 22, 44, 16, {
          size: 13, weight: 700,
          color: isToday ? P.surface : done ? P.blueLt : P.dim,
          align: 'center',
        }),
      ],
    });
  });

  return {
    id: uid(), label: 'Today', width: 390, height: 844, fill: P.bg,
    children: [
      statBar(),

      // Header — editorial large greeting
      F(0, 44, 390, 72, 'transparent', { ch: [
        T('Good morning,', 20, 12, 280, 16, { size: 13, color: P.muted }),
        T('ARIA', 20, 30, 200, 34, { size: 30, weight: 800, color: P.fg, ls: -0.5 }),
        pill('WEEK 14', P.blue, P.blueBg, 272, 36),
      ]}),

      // Hero metric — editorial number (inspired by Locomotive + Veo Sports)
      F(20, 122, 350, 120, P.surface, { r: 20, stroke: P.border, sw: 1, ch: [
        T("TODAY'S PLAN", 20, 16, 200, 12, { size: 9, weight: 700, color: P.muted, ls: 1 }),
        T('12.4', 20, 32, 140, 60, { size: 52, weight: 800, color: P.fg, ls: -1, lh: 60 }),
        T('km', 100, 72, 60, 22, { size: 18, weight: 400, color: P.muted }),
        T('Easy aerobic run · Zone 2', 20, 96, 220, 14, { size: 11, color: P.fg2 }),
        // start CTA
        F(254, 34, 76, 52, P.blue, { r: 14, ch: [
          T('▶', 0, 6, 76, 20, { size: 16, color: P.surface, align: 'center' }),
          T('START', 0, 30, 76, 14, { size: 9, weight: 700, color: P.surface, align: 'center', ls: 0.8 }),
        ]}),
      ]}),

      // Week strip
      T("THIS WEEK", 20, 258, 200, 12, { size: 9, weight: 700, color: P.muted, ls: 1 }),
      F(20, 276, 350, 44, 'transparent', { ch: weekDots }),

      // KPI row — editorial metric trio
      F(20, 336, 350, 80, 'transparent', { ch: [
        F(0, 0, 110, 80, P.surface, { r: 16, stroke: P.border, sw: 1, ch: [
          T('38.2', 0, 14, 110, 30, { size: 24, weight: 800, color: P.fg, align: 'center' }),
          T('km', 0, 44, 110, 14, { size: 10, color: P.muted, align: 'center' }),
          T('WEEK', 0, 60, 110, 12, { size: 8, weight: 700, color: P.dim, align: 'center', ls: 0.8 }),
        ]}),
        F(120, 0, 110, 80, P.surface, { r: 16, stroke: P.border, sw: 1, ch: [
          T('4h 28m', 0, 14, 110, 30, { size: 20, weight: 800, color: P.fg, align: 'center', lh: 30 }),
          T('TIME', 0, 60, 110, 12, { size: 8, weight: 700, color: P.dim, align: 'center', ls: 0.8 }),
          T('on feet', 0, 44, 110, 14, { size: 10, color: P.muted, align: 'center' }),
        ]}),
        F(240, 0, 110, 80, P.surface, { r: 16, stroke: P.border, sw: 1, ch: [
          T('724', 0, 14, 110, 30, { size: 24, weight: 800, color: P.green, align: 'center' }),
          T('TSS', 0, 60, 110, 12, { size: 8, weight: 700, color: P.dim, align: 'center', ls: 0.8 }),
          T('load score', 0, 44, 110, 14, { size: 10, color: P.muted, align: 'center' }),
        ]}),
      ]}),

      // Upcoming sessions
      T("UPCOMING", 20, 432, 200, 12, { size: 9, weight: 700, color: P.muted, ls: 1 }),
      F(20, 450, 350, 160, P.surface, { r: 16, stroke: P.border, sw: 1, ch: [
        ...[
          { day: 'Sat', type: 'Long Run', dist: '18 km', zone: 'Zone 2', color: P.blue, icon: '▶' },
          { day: 'Sun', type: 'Rest', dist: '—', zone: 'Recovery', color: P.green, icon: '◑' },
          { day: 'Mon', type: 'Tempo', dist: '8 km', zone: 'Zone 4', color: P.amber, icon: '▶' },
        ].flatMap((s, i) => [
          F(14, 16 + i * 46, 322, 36, 'transparent', { ch: [
            F(0, 4, 28, 28, s.color + '20', { r: 8, ch: [
              T(s.icon, 0, 5, 28, 18, { size: 12, color: s.color, align: 'center' }),
            ]}),
            T(s.day, 36, 2, 36, 14, { size: 10, weight: 700, color: P.muted }),
            T(s.type, 36, 18, 120, 14, { size: 13, weight: 600, color: P.fg }),
            T(s.zone, 164, 4, 80, 12, { size: 10, color: P.muted }),
            T(s.dist, 164, 20, 80, 14, { size: 12, weight: 700, color: s.color }),
            R(264, 8, 1, 20, P.border),
            T('›', 278, 4, 28, 24, { size: 18, color: P.dim, align: 'center' }),
          ]}),
          ...(i < 2 ? [div(14, 62 + i * 46, 322)] : []),
        ]),
      ]}),

      // Readiness chip
      F(20, 624, 350, 48, P.greenBg, { r: 14, stroke: P.green, sw: 1, ch: [
        T('◉', 16, 14, 20, 20, { size: 16, color: P.green }),
        T('Readiness score 87 · Great — you\'re ready to train hard', 44, 16, 290, 16, { size: 11, color: P.fg2 }),
      ]}),

      nav('today'),
    ],
  };
}

// ── SCREEN 2 — Active Session ─────────────────────────────────────────────────
function s2() {
  // Arc simulation: stacked thin rectangles to suggest a ring
  const arcSegments = (x, y, r, pct, color) => {
    const segs = 20;
    const filled = Math.round(segs * pct / 100);
    return Array.from({ length: segs }, (_, i) => {
      const angle = (i / segs) * Math.PI * 2 - Math.PI / 2;
      const cx = x + r * Math.cos(angle);
      const cy = y + r * Math.sin(angle);
      return R(cx - 4, cy - 4, 8, 8, i < filled ? color : P.border, { r: 4 });
    });
  };

  return {
    id: uid(), label: 'Session', width: 390, height: 844, fill: P.bg,
    children: [
      statBar(),
      F(0, 44, 390, 52, 'transparent', { ch: [
        T('Active Run', 20, 14, 200, 20, { size: 17, weight: 700 }),
        T('RECORDING', 220, 18, 140, 14, { size: 9, weight: 700, color: P.red, ls: 1, align: 'right' }),
        E(354, 20, 10, P.red),
      ]}),

      // BIG live timer — editorial hero number
      F(20, 102, 350, 100, P.surface, { r: 20, stroke: P.border, sw: 1, ch: [
        T('38:42', 0, 14, 350, 64, { size: 52, weight: 800, color: P.fg, align: 'center', ls: -1, lh: 64 }),
        T('ELAPSED TIME', 0, 80, 350, 14, { size: 9, weight: 700, color: P.muted, align: 'center', ls: 1.5 }),
      ]}),

      // Live metrics grid
      F(20, 214, 350, 100, 'transparent', { ch: [
        F(0, 0, 170, 100, P.surface, { r: 16, stroke: P.border, sw: 1, ch: [
          T('DISTANCE', 0, 14, 170, 12, { size: 9, weight: 700, color: P.muted, align: 'center', ls: 1 }),
          T('6.84', 0, 30, 170, 44, { size: 36, weight: 800, color: P.blue, align: 'center', ls: -0.5, lh: 44 }),
          T('km', 0, 78, 170, 14, { size: 11, color: P.muted, align: 'center' }),
        ]}),
        F(180, 0, 170, 100, P.surface, { r: 16, stroke: P.border, sw: 1, ch: [
          T('PACE', 0, 14, 170, 12, { size: 9, weight: 700, color: P.muted, align: 'center', ls: 1 }),
          T('5:39', 0, 30, 170, 44, { size: 36, weight: 800, color: P.fg, align: 'center', ls: -0.5, lh: 44 }),
          T('/km', 0, 78, 170, 14, { size: 11, color: P.muted, align: 'center' }),
        ]}),
      ]}),

      // Heart rate zone card — large number with zone bar
      F(20, 326, 350, 110, P.surface, { r: 16, stroke: P.border, sw: 1, ch: [
        T('HEART RATE', 20, 14, 200, 12, { size: 9, weight: 700, color: P.muted, ls: 1 }),
        T('154', 20, 28, 100, 56, { size: 48, weight: 800, color: P.purple, ls: -1, lh: 56 }),
        T('bpm', 105, 56, 50, 20, { size: 16, color: P.muted }),
        T('ZONE 3 — AEROBIC', 20, 90, 180, 14, { size: 10, weight: 700, color: P.purple }),
        // Zone visualization
        ...[P.green, P.blueLt, P.purple, P.amber, P.red].map((c, i) =>
          R(214 + i * 28, 28, 24, 40, i === 2 ? c : c + '50', { r: 5 }),
        ),
        ...[P.green, P.blueLt, P.purple, P.amber, P.red].map((c, i) =>
          T(['1','2','3','4','5'][i], 214 + i * 28, 74, 24, 14, {
            size: 8, weight: i === 2 ? 700 : 400,
            color: i === 2 ? P.purple : P.dim, align: 'center',
          })
        ),
      ]}),

      // Lap splits
      T("SPLITS", 20, 450, 200, 12, { size: 9, weight: 700, color: P.muted, ls: 1 }),
      F(20, 468, 350, 132, P.surface, { r: 16, stroke: P.border, sw: 1, ch: [
        ...[
          { lap: '1', time: '5:42', delta: '+0:03', trend: '↓' },
          { lap: '2', time: '5:39', delta: '±0:00', trend: '→' },
          { lap: '3', time: '5:36', delta: '–0:03', trend: '↑' },
        ].flatMap((s, i) => [
          F(14, 14 + i * 40, 322, 30, 'transparent', { ch: [
            T(`Lap ${s.lap}`, 0, 8, 60, 14, { size: 11, weight: 600, color: P.muted }),
            bar(70, 13, 140, ((3 - i) * 30 + 10), i === 2 ? P.green : P.blue),
            T(s.time, 222, 4, 60, 22, { size: 15, weight: 700, color: P.fg }),
            T(s.delta, 288, 8, 46, 14, {
              size: 10, weight: 600,
              color: i === 0 ? P.amber : i === 2 ? P.green : P.muted,
              align: 'right',
            }),
          ]}),
          ...(i < 2 ? [div(14, 44 + i * 40 + 10, 322)] : []),
        ]),
      ]}),

      // Stop controls
      F(20, 614, 350, 56, 'transparent', { ch: [
        F(0, 0, 164, 56, P.surface, { r: 16, stroke: P.border, sw: 1, ch: [
          T('⏸  PAUSE', 0, 18, 164, 20, { size: 13, weight: 700, color: P.fg, align: 'center' }),
        ]}),
        F(180, 0, 170, 56, P.red, { r: 16, ch: [
          T('⏹  FINISH', 0, 18, 170, 20, { size: 13, weight: 700, color: P.surface, align: 'center' }),
        ]}),
      ]}),

      nav('train'),
    ],
  };
}

// ── SCREEN 3 — Performance Stats ──────────────────────────────────────────────
function s3() {
  // Simple bar chart — weekly km
  const weekKm = [42, 38, 51, 44, 39, 55, 38];
  const maxKm  = Math.max(...weekKm);
  const chartH = 80;
  const barW   = 36;
  const barRows = weekKm.map((v, i) => {
    const h = Math.round((v / maxKm) * chartH);
    const isMax = v === maxKm;
    const isThis = i === 5;
    return F(i * 46, chartH - h, barW, h, isThis ? P.blue : isMax ? P.green : P.surface2, { r: 6 });
  });

  return {
    id: uid(), label: 'Stats', width: 390, height: 844, fill: P.bg,
    children: [
      statBar(),
      F(0, 44, 390, 52, 'transparent', { ch: [
        T('Performance', 20, 14, 220, 24, { size: 20, weight: 700 }),
        pill('LAST 7 WKS', P.blue, P.blueBg, 256, 20),
      ]}),

      // Editorial hero PRs
      F(20, 104, 350, 90, P.blue, { r: 20, ch: [
        T('PERSONAL RECORDS', 20, 14, 300, 12, { size: 9, weight: 700, color: P.surface + 'AA', ls: 1 }),
        T('5K', 20, 30, 70, 14, { size: 11, weight: 700, color: P.surface + 'CC' }),
        T('21:08', 20, 46, 110, 30, { size: 26, weight: 800, color: P.surface, lh: 30 }),
        T('10K', 140, 30, 80, 14, { size: 11, weight: 700, color: P.surface + 'CC' }),
        T('44:22', 140, 46, 120, 30, { size: 26, weight: 800, color: P.surface, lh: 30 }),
        T('HM', 270, 30, 70, 14, { size: 11, weight: 700, color: P.surface + 'CC' }),
        T('1:38', 264, 46, 80, 30, { size: 26, weight: 800, color: P.surface, lh: 30 }),
      ]}),

      // Weekly volume chart
      T("WEEKLY VOLUME (km)", 20, 208, 280, 12, { size: 9, weight: 700, color: P.muted, ls: 1 }),
      F(20, 226, 350, 110, P.surface, { r: 16, stroke: P.border, sw: 1, ch: [
        F(14, 14, 322, 80, 'transparent', { ch: barRows }),
        ...weekKm.map((v, i) =>
          T(['W8','W9','W10','W11','W12','W13','W14'][i], 14 + i * 46, 96, 36, 12, {
            size: 8, color: i === 5 ? P.blue : P.muted, align: 'center', weight: i === 5 ? 700 : 400,
          })
        ),
      ]}),

      // 4-metric grid
      T("TRAINING METRICS", 20, 350, 280, 12, { size: 9, weight: 700, color: P.muted, ls: 1 }),
      F(20, 368, 350, 160, 'transparent', { ch: [
        ...[
          { label: 'TRAINING LOAD', val: '724', sub: '+18 vs last wk', color: P.blue  },
          { label: 'FORM',          val: '+12',  sub: 'Good — train',   color: P.green },
          { label: 'FATIGUE',       val: '61',   sub: '↑ managed',      color: P.amber },
          { label: 'VO₂ MAX',       val: '56.3', sub: '↑ 0.4 this mo',  color: P.purple },
        ].map((m, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          return F(col * 180, row * 80, 170, 72, P.surface, { r: 16, stroke: P.border, sw: 1, ch: [
            T(m.label, 12, 12, 146, 10, { size: 8, weight: 700, color: P.muted, ls: 0.8 }),
            T(m.val, 12, 26, 146, 30, { size: 24, weight: 800, color: m.color, lh: 30 }),
            T(m.sub, 12, 56, 146, 12, { size: 9, color: P.muted }),
          ]});
        }),
      ]}),

      // Best session callout
      T("BEST THIS CYCLE", 20, 544, 280, 12, { size: 9, weight: 700, color: P.muted, ls: 1 }),
      F(20, 562, 350, 76, P.greenBg, { r: 16, stroke: P.green, sw: 1, ch: [
        T('◉', 16, 22, 24, 32, { size: 22, color: P.green }),
        T('Threshold Run — Tue 25 Mar', 48, 12, 280, 16, { size: 13, weight: 700, color: P.fg }),
        T('8.2 km · 4:48 /km · 168 bpm avg · New 8K PR!', 48, 32, 280, 14, { size: 11, color: P.fg2 }),
        pill('PR', P.green, P.surface, 300, 26),
      ]}),

      // Pace trend
      F(20, 652, 350, 44, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
        T('AVG PACE TREND', 14, 14, 160, 14, { size: 10, weight: 700, color: P.muted, ls: 0.8 }),
        T('5:42 → 5:33 /km  ↓ 9s over 7 weeks', 180, 14, 156, 16, { size: 11, weight: 600, color: P.green, align: 'right' }),
      ]}),

      nav('stats'),
    ],
  };
}

// ── SCREEN 4 — Recovery ───────────────────────────────────────────────────────
function s4() {
  // Sleep quality bar (wide arc sim)
  const sleepSegs = Array.from({ length: 24 }, (_, i) => {
    const phase = i < 6 ? P.purple : i < 14 ? P.blue : i < 20 ? P.blueLt : P.surface2;
    return R(i * 12 + 14, 10, 10, 40, phase, { r: 3 });
  });

  return {
    id: uid(), label: 'Recover', width: 390, height: 844, fill: P.bg,
    children: [
      statBar(),
      F(0, 44, 390, 52, 'transparent', { ch: [
        T('Recovery', 20, 14, 220, 24, { size: 20, weight: 700 }),
        T('Fri, Mar 28', 20, 40, 120, 14, { size: 11, color: P.muted }),
      ]}),

      // Readiness score — big editorial ring placeholder
      F(20, 102, 350, 140, P.surface, { r: 20, stroke: P.border, sw: 1, ch: [
        T('READINESS SCORE', 20, 14, 280, 12, { size: 9, weight: 700, color: P.muted, ls: 1 }),
        // Large score
        T('87', 20, 32, 100, 80, { size: 68, weight: 800, color: P.green, ls: -2, lh: 80 }),
        T('/ 100', 108, 84, 60, 20, { size: 14, weight: 400, color: P.muted }),
        T('Great — hard training OK', 20, 118, 200, 14, { size: 11, weight: 600, color: P.fg2 }),
        // Ring arc visual (stacked ellipses / rings suggestion)
        E(232, 24, 96, P.greenBg),
        E(244, 36, 72, P.surface),
        E(256, 48, 48, P.greenBg),
        E(268, 60, 24, P.green),
      ]}),

      // Recovery pillars
      T("RECOVERY PILLARS", 20, 256, 280, 12, { size: 9, weight: 700, color: P.muted, ls: 1 }),
      F(20, 274, 350, 200, P.surface, { r: 16, stroke: P.border, sw: 1, ch: [
        ...[
          { label: 'Sleep Quality',  score: 91, status: 'Excellent',  color: P.green  },
          { label: 'HRV',            score: 78, status: 'Good',       color: P.blue   },
          { label: 'Resting HR',     score: 62, status: 'Normal',     color: P.blue   },
          { label: 'Muscle Fatigue', score: 58, status: 'Moderate',   color: P.amber  },
        ].flatMap((p, i) => [
          F(14, 14 + i * 46, 322, 32, 'transparent', { ch: [
            T(p.label, 0, 8, 160, 14, { size: 12, weight: 600, color: P.fg }),
            bar(164, 14, 130, p.score, p.color),
            T(`${p.score}`, 302, 4, 36, 22, { size: 14, weight: 700, color: p.color, align: 'right' }),
          ]}),
          ...(i < 3 ? [div(14, 46 + i * 46 + 0, 322)] : []),
        ]),
      ]}),

      // Sleep breakdown
      T("SLEEP LAST NIGHT", 20, 488, 280, 12, { size: 9, weight: 700, color: P.muted, ls: 1 }),
      F(20, 506, 350, 84, P.surface, { r: 16, stroke: P.border, sw: 1, ch: [
        T('8h 14m', 20, 14, 160, 28, { size: 22, weight: 800, color: P.fg }),
        T('10:44 PM → 6:58 AM', 20, 46, 200, 14, { size: 10, color: P.muted }),
        // Color band
        F(14, 62, 310, 14, P.surface2, { r: 4, ch: sleepSegs }),
        // Legend
        ...[['Deep', P.purple], ['REM', P.blue], ['Light', P.blueLt]].map(([l, c], i) =>
          F(220 + i * 44, 14, 40, 14, 'transparent', { ch: [
            E(0, 3, 8, c),
            T(l, 12, 0, 32, 14, { size: 8, color: P.muted }),
          ]})
        ),
      ]}),

      // Advice chip
      F(20, 604, 350, 64, P.blueBg, { r: 16, stroke: P.blue, sw: 1, ch: [
        T('◈', 16, 20, 24, 24, { size: 20, color: P.blue }),
        T('AI Recommendation', 48, 12, 280, 14, { size: 11, weight: 700, color: P.blue }),
        T("Readiness is high. This is a good day for your threshold workout.", 48, 30, 280, 28, { size: 10, color: P.fg2, lh: 14 }),
      ]}),

      nav('recover'),
    ],
  };
}

// ── SCREEN 5 — History ────────────────────────────────────────────────────────
function s5() {
  const activities = [
    { date: 'Thu 27 Mar', type: 'Tempo Run',    dist: '8.2 km', pace: '4:48/km', duration: '39m', icon: '▶', color: P.amber  },
    { date: 'Wed 26 Mar', type: 'Easy Run',     dist: '10.5 km',pace: '6:02/km', duration: '1h 3m', icon: '▶', color: P.blue },
    { date: 'Tue 25 Mar', type: 'Intervals',    dist: '7.4 km', pace: '4:10/km', duration: '44m', icon: '◆', color: P.red    },
    { date: 'Sun 23 Mar', type: 'Long Run',     dist: '18.1 km',pace: '5:48/km', duration: '1h 45m', icon: '▶', color: P.blue },
    { date: 'Sat 22 Mar', type: 'Strength',     dist: '—',      pace: '—',       duration: '55m', icon: '◈', color: P.purple },
  ];

  return {
    id: uid(), label: 'History', width: 390, height: 844, fill: P.bg,
    children: [
      statBar(),
      F(0, 44, 390, 52, 'transparent', { ch: [
        T('History', 20, 14, 200, 24, { size: 20, weight: 700 }),
        T('Search...', 220, 18, 130, 26, 'transparent'),
        F(218, 14, 132, 26, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
          T('⌕  Search', 12, 6, 110, 14, { size: 11, color: P.dim }),
        ]}),
      ]}),

      // Month summary strip
      F(20, 104, 350, 64, P.blue, { r: 16, ch: [
        T('MARCH 2026', 20, 12, 200, 12, { size: 9, weight: 700, color: P.surface + 'AA', ls: 1 }),
        T('210.4 km', 20, 28, 140, 22, { size: 18, weight: 800, color: P.surface }),
        T('17h 28m', 168, 28, 100, 22, { size: 18, weight: 800, color: P.surface }),
        T('total distance', 20, 52, 140, 10, { size: 8, color: P.surface + 'AA' }),
        T('time on feet', 168, 52, 100, 10, { size: 8, color: P.surface + 'AA' }),
        pill('28 sessions', P.surface, P.blueDark, 264, 24),
      ]}),

      // Activity list
      T("RECENT ACTIVITIES", 20, 182, 280, 12, { size: 9, weight: 700, color: P.muted, ls: 1 }),
      F(20, 200, 350, activities.length * 72 + 16, P.surface, { r: 16, stroke: P.border, sw: 1, ch: [
        ...activities.flatMap((a, i) => [
          F(14, 12 + i * 72, 322, 58, 'transparent', { ch: [
            F(0, 8, 36, 36, a.color + '20', { r: 10, ch: [
              T(a.icon, 0, 8, 36, 20, { size: 14, color: a.color, align: 'center' }),
            ]}),
            T(a.type, 46, 8, 170, 16, { size: 13, weight: 700, color: P.fg }),
            T(a.date, 46, 26, 170, 12, { size: 10, color: P.muted }),
            T(a.dist, 46, 42, 80, 14, { size: 11, weight: 600, color: P.fg }),
            T(a.pace, 130, 42, 80, 14, { size: 11, color: P.muted }),
            T(a.duration, 256, 8, 66, 16, { size: 12, weight: 700, color: P.fg, align: 'right' }),
            T('›', 292, 38, 30, 18, { size: 16, color: P.dim, align: 'right' }),
          ]}),
          ...(i < activities.length - 1 ? [div(14, 70 + i * 72, 322)] : []),
        ]),
      ]}),

      nav('today'),
    ],
  };
}

// ── SCREEN 6 — Profile ────────────────────────────────────────────────────────
function s6() {
  return {
    id: uid(), label: 'Profile', width: 390, height: 844, fill: P.bg,
    children: [
      statBar(),

      // Profile hero
      F(0, 44, 390, 120, P.surface, { stroke: P.border, sw: 1, ch: [
        E(20, 20, 70, P.blueBg),
        T('AR', 30, 38, 50, 34, { size: 26, weight: 800, color: P.blue, align: 'center' }),
        T('ARIA REEVES', 104, 24, 200, 16, { size: 14, weight: 800, color: P.fg, ls: 0.3 }),
        T('Intermediate · Marathon training', 104, 44, 220, 14, { size: 11, color: P.muted }),
        T('Boston Qualifier · Apr 2027', 104, 60, 220, 14, { size: 11, color: P.blue }),
        pill('PRO', P.blue, P.blueBg, 306, 28),
        div(0, 100, 390),
        // quick stats
        ...[
          ['342', 'Days Active'],
          ['1,840', 'km logged'],
          ['18', 'Races'],
        ].map(([v, l], i) => F(i * 130, 102, 130, 18, 'transparent', { ch: [
          T(`${v}  ${l}`, 10, 2, 110, 14, { size: 9, color: i === 0 ? P.blue : P.muted, weight: i === 0 ? 700 : 400 }),
        ]})),
      ]}),

      // Goal card
      T("GOAL", 20, 180, 200, 12, { size: 9, weight: 700, color: P.muted, ls: 1 }),
      F(20, 198, 350, 80, P.surface, { r: 16, stroke: P.blue, sw: 2, ch: [
        T('Boston Marathon 2027', 20, 14, 220, 16, { size: 14, weight: 700, color: P.fg }),
        T('Target: sub 3:30 · Apr 20, 2027', 20, 34, 260, 14, { size: 11, color: P.muted }),
        bar(20, 58, 310, 38, P.blue),
        T('38% of training plan complete', 20, 66, 220, 12, { size: 9, color: P.muted }),
      ]}),

      // Settings
      T("PREFERENCES", 20, 294, 200, 12, { size: 9, weight: 700, color: P.muted, ls: 1 }),
      F(20, 312, 350, 232, P.surface, { r: 16, stroke: P.border, sw: 1, ch: [
        ...[
          ['Units',           'km / pace'],
          ['Heart Rate Zones','Lactate method'],
          ['GPS Device',      'Garmin 965'],
          ['Auto-detect',     'Enabled'],
          ['Notifications',   'Run reminders on'],
        ].flatMap(([label, val], i) => [
          F(14, 14 + i * 44, 322, 36, 'transparent', { ch: [
            T(label, 0, 10, 180, 16, { size: 13, weight: 500, color: P.fg }),
            T(val, 180, 10, 128, 16, { size: 11, color: P.blue, align: 'right' }),
          ]}),
          ...(i < 4 ? [div(14, 50 + i * 44, 322)] : []),
        ]),
      ]}),

      // Version
      T('STRIDE v2.1.0 — Built for serious athletes', 0, 762, 390, 14, {
        size: 9, color: P.dim, align: 'center',
      }),

      nav('me'),
    ],
  };
}

// ── Assemble & write ─────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'STRIDE — Athletic Performance OS',
  screens: [ s1(), s2(), s3(), s4(), s5(), s6() ],
};

const out = path.join(__dirname, 'stride.pen');
fs.writeFileSync(out, JSON.stringify(pen, null, 2));
console.log(`✓ stride.pen written (${(fs.statSync(out).size / 1024).toFixed(1)} KB)`);
console.log(`  Screens: ${pen.screens.map(s => s.label).join(', ')}`);
