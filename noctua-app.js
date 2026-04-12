'use strict';
// noctua-app.js
// NOCTUA — Calm AI Revenue & Focus Companion for Independent Workers
//
// Challenge: Design an ambient-aware financial + focus dashboard for freelancers
// that surfaces critical signals without dashboard anxiety.
//
// Inspired by:
// 1. Midday (darkmodedesign.com) — warm dark time-tracking SaaS; structured
//    calendar columns, warm muted tones, minimal chrome, "revenue at a glance"
//    pattern that never overwhelms with noise.
//
// 2. Letta (minimal.gallery / SaaS) — AI agent framework with calm information
//    hierarchy; large readable headings, sparse interaction targets, trust-
//    inspiring restraint.
//
// 3. Land-book Sanity CMS hero — editorial-style section breaks using a single
//    accent line, wide breathing room between cards.
//
// Design decisions:
//  · Warm earth palette (#0E0C09 void + #E8924A amber + #7B9E87 sage) — avoids
//    the blue-cold overused SaaS dark. Feels like a warm lamp at 2 am.
//  · "Ambient ring" hero on Focus screen — large donut arc signals elapsed time
//    without requiring a read; glanceable > readable.
//  · Tight numeric hierarchy: XL number → small unit label → muted context.
//    Revenue doesn't need a chart to communicate magnitude.
//
// 5 screens: Today · Revenue · Focus · Projects · Insights
//
// Palette: void warm black · amber · sage green · warm cream

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#0E0C09',
  surface:  '#171410',
  surface2: '#201D18',
  surface3: '#2A2620',
  border:   '#2E2924',
  fg:       '#EDD9A3',
  fgDim:    '#C4AE7E',
  muted:    '#7A6A4E',
  accent:   '#E8924A',   // warm amber — primary
  accent2:  '#7B9E87',   // sage green — secondary / positive
  red:      '#C96060',   // muted warm red — warning
  blue:     '#6B9EB8',   // dusty blue — neutral
  dim:      '#1A1712',
};

let _id = 0;
const uid = () => `n${++_id}`;

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

const Line  = (x, y, w, fill = P.border, opts = {}) => F(x, y, w, 1, fill, opts);
const VLine = (x, y, h, fill = P.border) => F(x, y, 1, h, fill, {});

// ── Glow layers ───────────────────────────────────────────────────────────────
const Glow = (cx, cy, r, color, intensity = 1) => [
  E(cx - r*2.2, cy - r*2.2, r*4.4, r*4.4, color + '04'),
  E(cx - r*1.5, cy - r*1.5, r*3.0, r*3.0, color + Math.round(0x0a * intensity).toString(16).padStart(2,'0')),
  E(cx - r,     cy - r,     r*2,   r*2,   color + Math.round(0x16 * intensity).toString(16).padStart(2,'0')),
  E(cx - r*0.5, cy - r*0.5, r,     r,     color + Math.round(0x24 * intensity).toString(16).padStart(2,'0')),
];

// ── Status pill ───────────────────────────────────────────────────────────────
const Pill = (x, y, label, color, opts = {}) => {
  const w = opts.w || Math.max(label.length * 6.5 + 18, 40);
  return F(x, y, w, 20, color + '1A', {
    r: 10,
    stroke: color + '40',
    sw: 1,
    ch: [T(label, 0, 3, w, 14, { size: 9, fill: color, weight: 700, ls: 0.8, align: 'center' })],
  });
};

// ── Progress bar ──────────────────────────────────────────────────────────────
const ProgressBar = (x, y, w, pct, color, trackColor = P.dim) => [
  F(x, y, w, 4, trackColor, { r: 2 }),
  F(x, y, Math.round(w * Math.min(pct, 1)), 4, color, { r: 2 }),
];

// ── Donut arc (ambient ring — simple layered ellipses to fake arc) ─────────────
const AmbientRing = (cx, cy, r, color, alpha = 0.5) => {
  const thickness = 12;
  return [
    // track
    E(cx - r, cy - r, r*2, r*2, 'transparent', { stroke: P.border, sw: thickness }),
    // fill arc approximated with full ring (alpha = progress fraction as color opacity)
    E(cx - r, cy - r, r*2, r*2, 'transparent', {
      stroke: color + Math.round(alpha * 255).toString(16).padStart(2,'0'),
      sw: thickness
    }),
    // inner white dot (glow center)
    ...Glow(cx, cy, r * 0.35, color, 0.8),
    // center text
    T(Math.round(alpha * 100) + '%', cx - 30, cy - 20, 60, 40, { size: 32, weight: 800, fill: P.fg, align: 'center' }),
    T('FOCUS', cx - 30, cy + 22, 60, 12, { size: 8, fill: P.muted, ls: 2, align: 'center', weight: 600 }),
  ];
};

// ── Micro bar chart ───────────────────────────────────────────────────────────
const BarChart = (x, y, w, h, bars, color) => {
  const bw = Math.floor((w - (bars.length - 1) * 3) / bars.length);
  const max = Math.max(...bars.map(b => b.value));
  return bars.map((b, i) => {
    const bh = Math.max(4, Math.round((b.value / max) * h));
    const isToday = b.today;
    return F(x + i * (bw + 3), y + (h - bh), bw, bh,
      isToday ? color : color + '40', { r: 2 });
  });
};

// ── Status dot ───────────────────────────────────────────────────────────────
const Dot = (x, y, color) => E(x, y, 6, 6, color);

// ── Nav bar ───────────────────────────────────────────────────────────────────
const NavBar = (activeIdx) => {
  const items = [
    ['◑', 'TODAY'],
    ['$', 'REVENUE'],
    ['◎', 'FOCUS'],
    ['⊞', 'PROJECTS'],
    ['✦', 'INSIGHTS'],
  ];
  return F(0, 764, 390, 80, P.surface, {
    ch: [
      Line(0, 0, 390),
      ...items.map(([ic, lb], i) => {
        const isActive = i === activeIdx;
        const nx = i * 78;
        return [
          isActive ? F(nx + 22, 6, 34, 34, P.accent + '18', { r: 17 }) : null,
          T(ic, nx + 8, 10, 62, 24, { size: 18, fill: isActive ? P.accent : P.muted, align: 'center' }),
          T(lb, nx + 0, 38, 78, 11, {
            size: 7, fill: isActive ? P.accent : P.muted,
            align: 'center', weight: isActive ? 700 : 400, ls: 0.6
          }),
        ].filter(Boolean);
      }).flat(),
    ],
  });
};

// ── Screen 1: TODAY ───────────────────────────────────────────────────────────
function screenToday(ox) {
  const time = '09:41';
  const date = 'Tuesday, 24 Mar';

  // revenue bars (last 7 days)
  const revBars = [
    { value: 580,  label: 'M' },
    { value: 1200, label: 'T' },
    { value: 320,  label: 'W' },
    { value: 900,  label: 'T' },
    { value: 1450, label: 'F' },
    { value: 650,  label: 'S' },
    { value: 210,  label: 'S', today: true },
  ];

  const tasks = [
    { title: 'Branding deck — Orion Labs', tag: 'IN PROGRESS', color: P.accent },
    { title: 'Invoice #142 — Kestrel Co.',  tag: 'DUE TODAY',  color: P.red },
    { title: 'Strategy call — 14:00',       tag: 'UPCOMING',   color: P.accent2 },
    { title: 'UI review — Midwinter App',   tag: 'TOMORROW',   color: P.muted },
  ];

  return F(ox, 0, 390, 844, P.bg, {
    clip: true, ch: [
      // ambient glow top left
      ...Glow(0, 160, 110, P.accent, 0.5),

      // time + date header
      T(time, 20, 52, 200, 50, { size: 42, weight: 800, fill: P.fg }),
      T(date, 20, 104, 200, 16, { size: 11, fill: P.muted, ls: 0.3 }),

      // status pill
      Pill(280, 62, '● ACTIVE', P.accent2, { w: 90 }),

      // REVENUE TODAY card
      F(20, 140, 350, 110, P.surface, {
        r: 16, stroke: P.border, sw: 1,
        ch: [
          T('REVENUE TODAY', 20, 16, 200, 10, { size: 8, fill: P.muted, ls: 1.8, weight: 600 }),
          T('$2,840', 20, 34, 200, 52, { size: 44, weight: 900, fill: P.fg }),
          T('+$640 vs yesterday', 20, 88, 200, 12, { size: 10, fill: P.accent2, weight: 500 }),
          // mini bar chart
          ...BarChart(220, 16, 110, 80, revBars, P.accent),
          // day labels
          ...revBars.map((b, i) => T(b.label, 220 + i * 17, 98, 16, 10, {
            size: 7, fill: b.today ? P.accent : P.muted, align: 'center', weight: b.today ? 700 : 400,
          })),
        ],
      }),

      // FOCUS TIME card
      F(20, 262, 165, 80, P.surface, {
        r: 16, stroke: P.border, sw: 1,
        ch: [
          T('FOCUS TIME', 14, 14, 140, 9, { size: 8, fill: P.muted, ls: 1.5, weight: 600 }),
          T('4h 20m', 14, 30, 140, 30, { size: 26, weight: 800, fill: P.fg }),
          T('73% of goal', 14, 62, 140, 10, { size: 9, fill: P.accent2 }),
        ],
      }),

      // ACTIVE CLIENTS card
      F(205, 262, 165, 80, P.surface, {
        r: 16, stroke: P.border, sw: 1,
        ch: [
          T('ACTIVE CLIENTS', 14, 14, 140, 9, { size: 8, fill: P.muted, ls: 1.5, weight: 600 }),
          T('7', 14, 30, 60, 30, { size: 26, weight: 800, fill: P.fg }),
          T('2 invoices due soon', 14, 62, 140, 10, { size: 9, fill: P.red }),
        ],
      }),

      // Today's tasks
      T("TODAY'S QUEUE", 20, 364, 200, 10, { size: 8, fill: P.muted, ls: 1.8, weight: 600 }),
      ...tasks.map((task, i) =>
        F(20, 384 + i * 64, 350, 54, P.surface, {
          r: 12, stroke: i === 1 ? P.red + '30' : P.border, sw: 1,
          ch: [
            F(0, 0, 3, 54, task.color, { r: 2 }),
            T(task.title, 14, 10, 250, 16, { size: 13, fill: P.fg, weight: 500 }),
            Pill(14, 32, task.tag, task.color),
          ],
        })
      ),

      // Noctua wordmark
      T('NOCTUA', 20, 728, 150, 14, { size: 10, fill: P.muted, ls: 3, weight: 700 }),
      Dot(172, 731, P.accent),

      NavBar(0),
    ],
  });
}

// ── Screen 2: REVENUE ─────────────────────────────────────────────────────────
function screenRevenue(ox) {
  const monthBars = [
    { value: 14200, label: 'O' },
    { value: 18700, label: 'N' },
    { value: 11900, label: 'D' },
    { value: 22400, label: 'J' },
    { value: 17600, label: 'F' },
    { value: 8400,  label: 'M', today: true },
  ];

  const clients = [
    { name: 'Orion Labs',    amount: '$4,200', pct: 0.72, color: P.accent },
    { name: 'Kestrel Co.',   amount: '$2,100', pct: 0.36, color: P.accent2 },
    { name: 'Midwinter App', amount: '$1,400', pct: 0.24, color: P.blue },
    { name: 'Vesper Studio', amount: '$700',   pct: 0.12, color: P.muted },
  ];

  const invoices = [
    { id: '#142', client: 'Kestrel Co.',   amt: '$2,100', status: 'OVERDUE',  color: P.red },
    { id: '#141', client: 'Orion Labs',    amt: '$4,200', status: 'PAID',     color: P.accent2 },
    { id: '#140', client: 'Midwinter App', amt: '$1,400', status: 'SENT',     color: P.accent },
  ];

  return F(ox, 0, 390, 844, P.bg, {
    clip: true, ch: [
      ...Glow(390, 320, 100, P.accent2, 0.4),

      T('Revenue', 20, 52, 250, 38, { size: 32, weight: 800, fill: P.fg }),
      T('March 2026', 20, 92, 200, 16, { size: 12, fill: P.muted }),

      // MTD big number
      F(20, 126, 350, 90, P.surface, {
        r: 16, stroke: P.border, sw: 1,
        ch: [
          T('MONTH TO DATE', 20, 16, 200, 9, { size: 8, fill: P.muted, ls: 1.8, weight: 600 }),
          T('$8,400', 20, 34, 220, 42, { size: 36, weight: 900, fill: P.fg }),
          T('Goal: $12,000', 20, 76, 150, 10, { size: 9, fill: P.muted }),
          // progress bar
          ...ProgressBar(20, 76, 200, 8400 / 12000, P.accent),
          T('70%', 226, 70, 50, 12, { size: 9, fill: P.accent, weight: 700 }),
        ],
      }),

      // Monthly bar chart
      F(20, 228, 350, 130, P.surface, {
        r: 16, stroke: P.border, sw: 1,
        ch: [
          T('MONTHLY HISTORY', 20, 16, 200, 9, { size: 8, fill: P.muted, ls: 1.8, weight: 600 }),
          ...BarChart(20, 36, 310, 76, monthBars, P.accent),
          ...monthBars.map((b, i) => T(b.label, 20 + i * 53, 116, 50, 10, {
            size: 8, fill: b.today ? P.accent : P.muted, align: 'center', weight: b.today ? 700 : 400,
          })),
        ],
      }),

      // Client breakdown
      T('BY CLIENT', 20, 376, 200, 9, { size: 8, fill: P.muted, ls: 1.8, weight: 600 }),
      ...clients.map((c, i) =>
        F(20, 396 + i * 52, 350, 44, P.surface, {
          r: 10, stroke: P.border, sw: 1,
          ch: [
            T(c.name, 12, 8, 180, 14, { size: 12, fill: P.fg, weight: 500 }),
            T(c.amount, 270, 8, 70, 14, { size: 12, fill: c.color, weight: 700, align: 'right' }),
            ...ProgressBar(12, 30, 326, c.pct, c.color),
          ],
        })
      ),

      // Invoices
      T('RECENT INVOICES', 20, 612, 200, 9, { size: 8, fill: P.muted, ls: 1.8, weight: 600 }),
      ...invoices.map((inv, i) =>
        F(20, 630 + i * 46, 350, 38, P.surface, {
          r: 10, stroke: i === 0 ? P.red + '30' : P.border, sw: 1,
          ch: [
            T(inv.id, 12, 11, 50, 14, { size: 11, fill: P.muted, weight: 600 }),
            T(inv.client, 62, 11, 180, 14, { size: 12, fill: P.fg }),
            T(inv.amt, 220, 11, 70, 14, { size: 12, fill: P.fg, weight: 600, align: 'right' }),
            Pill(296, 8, inv.status, inv.color),
          ],
        })
      ),

      T('NOCTUA', 20, 728, 150, 14, { size: 10, fill: P.muted, ls: 3, weight: 700 }),
      NavBar(1),
    ],
  });
}

// ── Screen 3: FOCUS ───────────────────────────────────────────────────────────
function screenFocus(ox) {
  const streakData = [
    { day: 'M', h: 5.5, active: true },
    { day: 'T', h: 6.2, active: true },
    { day: 'W', h: 3.1, active: true },
    { day: 'T', h: 7.0, active: true },
    { day: 'F', h: 5.8, active: true },
    { day: 'S', h: 2.0, active: false },
    { day: 'S', h: 4.4, active: true },
  ];

  const sessions = [
    { label: 'Deep Work',    dur: '52 min', type: 'COMPLETE', color: P.accent2 },
    { label: 'Client Review', dur: '28 min', type: 'COMPLETE', color: P.accent2 },
    { label: 'Writing',       dur: '38 min', type: 'ACTIVE',   color: P.accent },
  ];

  const RING_CX = 195;
  const RING_CY = 280;
  const RING_R  = 85;
  const progress = 0.68; // 68% session complete

  return F(ox, 0, 390, 844, P.bg, {
    clip: true, ch: [
      // large ambient glow behind ring
      ...Glow(RING_CX, RING_CY, RING_R + 40, P.accent, 0.35),
      ...Glow(RING_CX, RING_CY, RING_R - 20, P.accent, 0.25),

      T('Focus', 20, 52, 200, 38, { size: 32, weight: 800, fill: P.fg }),
      Pill(280, 60, '● WRITING', P.accent, { w: 100 }),
      T('Session in progress', 20, 92, 250, 14, { size: 11, fill: P.muted }),

      // Ambient ring (donut — fake arc with concentric ellipses + opacity trick)
      // Track ring
      E(RING_CX - RING_R, RING_CY - RING_R, RING_R*2, RING_R*2, P.surface,
        { stroke: P.border, sw: 14 }),
      // Progress ring
      E(RING_CX - RING_R, RING_CY - RING_R, RING_R*2, RING_R*2, 'transparent',
        { stroke: P.accent + 'CC', sw: 14 }),
      // Inner glow
      ...Glow(RING_CX, RING_CY, 28, P.accent, 0.8),
      // Center readout
      T('68%', RING_CX - 40, RING_CY - 26, 80, 52, { size: 44, weight: 900, fill: P.fg, align: 'center' }),
      T('COMPLETE', RING_CX - 40, RING_CY + 28, 80, 12, { size: 8, fill: P.muted, ls: 2, align: 'center', weight: 600 }),
      // Time left
      T('17 min left', RING_CX - 50, RING_CY + 50, 100, 14, { size: 11, fill: P.accent, align: 'center', weight: 500 }),

      // Weekly streak bars
      T('WEEKLY STREAK', 20, 396, 200, 9, { size: 8, fill: P.muted, ls: 1.8, weight: 600 }),
      F(20, 414, 350, 90, P.surface, {
        r: 16, stroke: P.border, sw: 1,
        ch: [
          ...streakData.map((d, i) => {
            const bh = Math.max(4, Math.round((d.h / 8) * 52));
            const bx = 20 + i * 46;
            return [
              F(bx, 12 + (52 - bh), 34, bh, d.active ? P.accent + '90' : P.muted + '40', { r: 4 }),
              T(d.day, bx, 72, 34, 10, { size: 8, fill: d.active ? P.fg : P.muted, align: 'center', weight: 600 }),
              T(d.h.toFixed(0) + 'h', bx, 10 + (52 - bh) - 14, 34, 12,
                { size: 7, fill: d.active ? P.accent : P.muted, align: 'center' }),
            ];
          }).flat(),
        ],
      }),

      // Today's sessions
      T("TODAY'S SESSIONS", 20, 520, 200, 9, { size: 8, fill: P.muted, ls: 1.8, weight: 600 }),
      ...sessions.map((s, i) =>
        F(20, 538 + i * 54, 350, 44, P.surface, {
          r: 12, stroke: i === 2 ? P.accent + '30' : P.border, sw: 1,
          ch: [
            Dot(14, 19, s.color),
            T(s.label, 28, 7, 220, 16, { size: 13, fill: P.fg, weight: 500 }),
            T(s.dur, 28, 25, 150, 12, { size: 10, fill: P.muted }),
            Pill(278, 11, s.type, s.color),
          ],
        })
      ),

      // Noctua daily stats
      F(20, 706, 350, 30, P.surface, {
        r: 10, stroke: P.border, sw: 1,
        ch: [
          T('Streak: 12 days', 14, 8, 140, 14, { size: 10, fill: P.accent2, weight: 600 }),
          T('Best: 5h 22m · Avg: 4h 38m', 175, 8, 165, 14, { size: 10, fill: P.muted, align: 'right' }),
        ],
      }),

      T('NOCTUA', 20, 743, 150, 14, { size: 10, fill: P.muted, ls: 3, weight: 700 }),
      NavBar(2),
    ],
  });
}

// ── Screen 4: PROJECTS ────────────────────────────────────────────────────────
function screenProjects(ox) {
  const projects = [
    {
      name: 'Orion Labs — Brand Identity',
      client: 'Orion Labs',
      due: 'Apr 2',
      pct: 0.82,
      status: 'ON TRACK',
      statusColor: P.accent2,
      tasks: ['Logo system', 'Color guide', 'Typography', 'Motion kit'],
      taskDone: [true, true, true, false],
      budget: '$8,400',
      earned: '$6,900',
    },
    {
      name: 'Midwinter — Mobile App UI',
      client: 'Midwinter App',
      due: 'Apr 14',
      pct: 0.41,
      status: 'AT RISK',
      statusColor: P.red,
      tasks: ['Onboarding', 'Dashboard', 'Settings', 'Notifications'],
      taskDone: [true, false, false, false],
      budget: '$5,600',
      earned: '$2,300',
    },
    {
      name: 'Kestrel — Landing Page',
      client: 'Kestrel Co.',
      due: 'Mar 31',
      pct: 0.96,
      status: 'WRAPPING',
      statusColor: P.accent,
      tasks: ['Hero', 'Features', 'Pricing', 'Launch'],
      taskDone: [true, true, true, false],
      budget: '$2,800',
      earned: '$2,688',
    },
  ];

  return F(ox, 0, 390, 844, P.bg, {
    clip: true, ch: [
      ...Glow(390, 120, 90, P.blue, 0.3),

      T('Projects', 20, 52, 250, 38, { size: 32, weight: 800, fill: P.fg }),
      T('3 active · 1 due this week', 20, 92, 280, 14, { size: 11, fill: P.muted }),

      ...projects.map((proj, i) => {
        const cardH = 196;
        const cy = 124 + i * (cardH + 14);
        return F(20, cy, 350, cardH, P.surface, {
          r: 16, stroke: proj.status === 'AT RISK' ? P.red + '28' : P.border, sw: 1,
          ch: [
            // header
            T(proj.name, 14, 14, 250, 16, { size: 13, fill: P.fg, weight: 600 }),
            Pill(240, 10, proj.status, proj.statusColor, { w: 96 }),
            T('Due ' + proj.due, 14, 34, 180, 12, { size: 10, fill: P.muted }),

            // progress
            T(Math.round(proj.pct * 100) + '%', 14, 56, 60, 20, { size: 18, weight: 800, fill: proj.statusColor }),
            T('complete', 62, 60, 80, 14, { size: 10, fill: P.muted }),
            ...ProgressBar(14, 82, 322, proj.pct, proj.statusColor),

            // task checklist
            ...proj.tasks.map((t, j) =>
              F(14, 96 + j * 20, 160, 16, 'transparent', {
                ch: [
                  F(0, 4, 8, 8, proj.taskDone[j] ? proj.statusColor : P.dim, {
                    r: 2,
                    stroke: proj.taskDone[j] ? proj.statusColor : P.border, sw: 1,
                  }),
                  T(t, 14, 0, 140, 14, {
                    size: 9, fill: proj.taskDone[j] ? P.fg : P.muted,
                    weight: proj.taskDone[j] ? 500 : 400,
                  }),
                ],
              })
            ),

            // budget
            Line(14, 170, 322, P.border),
            T('Budget: ' + proj.budget, 14, 178, 160, 12, { size: 9, fill: P.muted }),
            T('Earned: ' + proj.earned, 200, 178, 136, 12, { size: 9, fill: proj.statusColor, align: 'right', weight: 600 }),
          ],
        });
      }),

      T('NOCTUA', 20, 728, 150, 14, { size: 10, fill: P.muted, ls: 3, weight: 700 }),
      NavBar(3),
    ],
  });
}

// ── Screen 5: INSIGHTS ────────────────────────────────────────────────────────
function screenInsights(ox) {
  const insights = [
    {
      icon: '✦',
      title: 'Revenue dip on Wednesdays',
      body: 'Your last 6 Wednesdays averaged 38% less revenue than Mon–Tue. Consider moving admin tasks to Wednesday and protecting Mon–Tue for client delivery.',
      color: P.accent,
      tag: 'PATTERN',
    },
    {
      icon: '◑',
      title: 'Orion Labs is your anchor client',
      body: 'They account for 42% of monthly revenue with the fastest payment turnaround (avg 4 days). Prioritising this relationship has clear upside.',
      color: P.accent2,
      tag: 'CLIENT',
    },
    {
      icon: '⚡',
      title: 'Burnout signal: 4 weeks >45h',
      body: 'You\'ve logged over 45 working hours for 4 consecutive weeks. Your focus quality typically drops 22% after week 3 of overload.',
      color: P.red,
      tag: 'WELLBEING',
    },
  ];

  return F(ox, 0, 390, 844, P.bg, {
    clip: true, ch: [
      ...Glow(0, 400, 120, P.accent, 0.3),
      ...Glow(390, 200, 80, P.accent2, 0.25),

      T('Insights', 20, 52, 250, 38, { size: 32, weight: 800, fill: P.fg }),
      T('AI-generated · Updated weekly', 20, 92, 260, 14, { size: 11, fill: P.muted }),

      // Score card
      F(20, 124, 350, 86, P.surface, {
        r: 16, stroke: P.accent + '30', sw: 1,
        ch: [
          T('HEALTH SCORE', 20, 16, 200, 9, { size: 8, fill: P.muted, ls: 1.8, weight: 600 }),
          T('76', 20, 34, 80, 42, { size: 42, weight: 900, fill: P.accent }),
          T('/ 100', 82, 58, 40, 16, { size: 14, fill: P.muted }),
          T('Financially strong · Pace concern', 130, 34, 200, 14, { size: 11, fill: P.fg }),
          T('3 signals detected this week', 130, 52, 200, 12, { size: 10, fill: P.muted }),
          ...ProgressBar(130, 72, 200, 0.76, P.accent),
        ],
      }),

      // Insight cards
      ...insights.map((ins, i) =>
        F(20, 226 + i * 158, 350, 144, P.surface, {
          r: 16, stroke: ins.color + '22', sw: 1,
          ch: [
            // left color bar
            F(0, 0, 3, 144, ins.color, { r: 2, opacity: 0.7 }),
            // icon glow
            ...Glow(18, 24, 12, ins.color, 0.6),
            T(ins.icon, 10, 12, 24, 24, { size: 18, fill: ins.color, align: 'center' }),
            Pill(42, 12, ins.tag, ins.color),
            T(ins.title, 14, 44, 322, 18, { size: 14, fill: P.fg, weight: 700 }),
            T(ins.body, 14, 68, 322, 66, { size: 11, fill: P.fgDim, lh: 18 }),
          ],
        })
      ),

      T('NOCTUA', 20, 728, 150, 14, { size: 10, fill: P.muted, ls: 3, weight: 700 }),
      NavBar(4),
    ],
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// ASSEMBLE & SAVE
// ══════════════════════════════════════════════════════════════════════════════
const SCREEN_W = 390;
const GAP      = 80;

const doc = {
  version: '2.8',
  name: 'NOCTUA — Calm AI Revenue & Focus Companion',
  width:  5 * SCREEN_W + 6 * GAP,
  height: 844,
  fill:   P.bg,
  children: [
    screenToday    (GAP),
    screenRevenue  (GAP + (SCREEN_W + GAP)),
    screenFocus    (GAP + (SCREEN_W + GAP) * 2),
    screenProjects (GAP + (SCREEN_W + GAP) * 3),
    screenInsights (GAP + (SCREEN_W + GAP) * 4),
  ],
};

const outPath = path.join(__dirname, 'noctua.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log('✓ noctua.pen written —', Math.round(fs.statSync(outPath).size / 1024) + 'KB');
console.log('  5 screens: Today · Revenue · Focus · Projects · Insights');
console.log('  Palette: void warm black #0E0C09 · amber #E8924A · sage #7B9E87 · warm cream #EDD9A3');
