'use strict';
// phase-app.js — PHASE: Deep Work Timer for Creative Professionals
//
// Inspired by:
//   • KOMETA font foundry (land-book.com, March 2026) — "Future-Facing Fonts"
//     Pure black canvas, massive condensed display type ("Attila 'Radical' Burial 123;4"),
//     orange-red accent #FF4B1C, halftone dot texture, editorial split-panel layout.
//     Typography IS the interface — no decorative chrome, no gradient blobs.
//   • supercommon systems (land-book.com, seen again March 2026) — "time as an instrument"
//     "your brain is not a server... we built an instrument to hold that boundary."
//     The cinematic black canvas with a single glowing light source.
//
// Challenge: Design a dark-mode deep work / time tracking app for creative pros
// where TYPOGRAPHY is the primary visual element. Every screen built around
// condensed display type for time values — think film reel counter meets
// professional broadcast monitor. 5 screens.
//
// Palette: near-pure black + warm off-white + KOMETA orange-red + electric yellow
// Screens: Now (active session) · Today · Log · Projects · Insights

const fs = require('fs');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#080808',   // near-pure black — KOMETA canvas
  surface:  '#111110',   // dark surface
  surface2: '#1C1B19',   // slightly raised surface
  surface3: '#242320',   // hovered/selected surface
  border:   '#2A2925',   // subtle border
  border2:  '#3A3835',   // slightly visible border
  fg:       '#F5F1EA',   // warm off-white — not pure white, has a hint of warmth
  fg2:      '#BDB9B2',   // secondary text
  fg3:      '#7A7570',   // muted text
  fg4:      '#4A4845',   // very muted
  accent:   '#F24E1E',   // KOMETA orange-red — primary accent
  accentLo: '#F24E1E22', // accent subtle
  yellow:   '#FFD60A',   // electric yellow — timer highlight
  yellowLo: '#FFD60A18', // yellow subtle
  green:    '#2DB87E',   // completion green
  greenLo:  '#2DB87E18',
  purple:   '#8B5CF6',   // planning purple
  purpleLo: '#8B5CF618',
  blue:     '#3B9EFF',   // deep work blue
  blueLo:   '#3B9EFF18',
};

let _id = 0;
const uid = () => `ph${++_id}`;

// ── Primitives ─────────────────────────────────────────────────────────────────
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
  id: uid(), type: 'text', x, y, width: w, height: h,
  content,
  fontSize: opts.size || 14,
  fontWeight: opts.weight || 400,
  fontFamily: opts.mono ? 'JetBrains Mono' : (opts.serif ? 'Georgia' : 'Inter'),
  color: opts.color || P.fg,
  align: opts.align || 'left',
  letterSpacing: opts.ls !== undefined ? opts.ls : 0,
  lineHeight: opts.lh !== undefined ? opts.lh : 1.4,
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h,
  fill: fill || P.accent,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

// ── Helpers ───────────────────────────────────────────────────────────────────
const pw = 390, ph = 844;

// Status bar
const statusBar = () => F(0, 0, pw, 44, P.bg, { ch: [
  T('9:41', 16, 14, 60, 20, { size: 15, weight: 600, color: P.fg }),
  T('●●●●', pw/2 - 30, 15, 60, 18, { size: 12, color: P.fg3, align: 'center' }),
  T('100%', pw - 60, 14, 50, 20, { size: 14, weight: 500, color: P.fg, align: 'right' }),
]});

// Bottom nav dots
const navBar = (active) => {
  const items = ['Now', 'Today', 'Log', 'Projects', 'Insights'];
  const iconW = pw / items.length;
  const dots = items.map((label, i) => {
    const isActive = i === active;
    return F(i * iconW, 0, iconW, 56, 'transparent', { ch: [
      F(iconW/2 - 3, 8, 6, 6, isActive ? P.accent : P.surface3, { r: 3 }),
      T(label, iconW/2 - 24, 20, 48, 16, {
        size: 10, weight: isActive ? 600 : 400, color: isActive ? P.accent : P.fg3,
        align: 'center', ls: 0.02,
      }),
    ]});
  });
  return F(0, ph - 80, pw, 80, P.surface, { ch: [
    F(0, 0, pw, 1, P.border),
    ...dots,
  ]});
};

// Phase type tag
const phaseTag = (label, color, x, y) => F(x, y, label.length * 7.5 + 24, 26, color + '22', { r: 4, ch: [
  T(label, 12, 5, label.length * 7.5, 16, { size: 11, weight: 700, color, ls: 0.08, mono: true }),
]});

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — NOW (Active Session)
// KOMETA-style: massive timer in center, phase name above, project below
// ══════════════════════════════════════════════════════════════════════════════
const screen1 = () => {
  const timerW = 320, timerH = 100;
  const timerX = (pw - timerW) / 2;
  const timerY = 280;

  // Halftone-inspired dot grid texture (sparse dots in bg)
  const dots = [];
  for (let col = 0; col < 5; col++) {
    for (let row = 0; row < 3; row++) {
      dots.push(E(32 + col * 70, 160 + row * 70, 3, 3, P.border2, { opacity: 0.6 }));
    }
  }

  return F(0, 0, pw, ph, P.bg, { ch: [
    statusBar(),

    // Dot grid texture (KOMETA halftone influence)
    ...dots,

    // Phase type label
    phaseTag('DEEP WORK', P.blue, 20, 60),

    // Session label — small
    T('ACTIVE SESSION', 20, 60, 200, 18, { size: 11, weight: 700, color: P.fg3, ls: 0.12, mono: true }),

    // Phase name — condensed display
    T('Writing', 20, 88, pw - 40, 64, {
      size: 52, weight: 800, color: P.fg, ls: -0.03, lh: 1.0,
    }),

    // "Draft 02 — Brand Manifesto" subtitle
    T('Draft 02 — Brand Manifesto', 20, 152, pw - 40, 22, {
      size: 14, weight: 400, color: P.fg3,
    }),

    // ── GIANT TIMER ──────────────────────────────────────────────────
    // Subtle glow background
    F(timerX - 20, timerY - 16, timerW + 40, timerH + 32, P.yellow + '08', { r: 16 }),

    // Timer — monospace, maximum scale
    T('01:24:47', timerX, timerY, timerW, timerH, {
      size: 82, weight: 900, color: P.yellow, mono: true, ls: -0.04, lh: 1.0, align: 'center',
    }),

    // Timer label
    T('elapsed', pw/2 - 30, timerY + timerH + 4, 60, 18, {
      size: 11, weight: 400, color: P.fg4, ls: 0.08, mono: true, align: 'center',
    }),

    // ── PROGRESS BAR ─────────────────────────────────────────────────
    F(20, timerY + timerH + 36, pw - 40, 3, P.surface2, { r: 2, ch: [
      F(0, 0, (pw - 40) * 0.62, 3, P.yellow, { r: 2 }),
    ]}),

    // Progress label
    T('62% of planned 2h 15m', 20, timerY + timerH + 48, pw - 40, 18, {
      size: 12, color: P.fg3,
    }),

    // ── PROJECT TAG ───────────────────────────────────────────────────
    F(20, timerY + timerH + 82, pw - 40, 48, P.surface2, { r: 10, stroke: P.border, ch: [
      T('◈', 16, 14, 20, 20, { size: 16, color: P.fg3 }),
      T('Brand Studio — Meridian Co.', 40, 15, pw - 100, 20, { size: 13, weight: 500, color: P.fg2 }),
      T('Billable', pw - 100, 15, 72, 20, { size: 12, weight: 600, color: P.green, align: 'right' }),
    ]}),

    // ── ACTIONS ──────────────────────────────────────────────────────
    // Pause button
    F(20, ph - 185, (pw - 52) * 0.45, 52, P.surface2, { r: 12, stroke: P.border, ch: [
      T('⏸  Pause', 0, 16, (pw - 52) * 0.45, 22, { size: 14, weight: 600, color: P.fg2, align: 'center' }),
    ]}),

    // End Phase button (accent)
    F(20 + (pw - 52) * 0.45 + 12, ph - 185, (pw - 52) * 0.55, 52, P.accent, { r: 12, ch: [
      T('End Phase ✓', 0, 16, (pw - 52) * 0.55, 22, { size: 14, weight: 700, color: '#fff', align: 'center' }),
    ]}),

    navBar(0),
  ]});
};

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — TODAY
// Timeline of today's phases as typographic rows
// ══════════════════════════════════════════════════════════════════════════════
const screen2 = () => {
  const phases = [
    { label: 'Morning Ritual',   type: 'RITUAL',    color: P.purple, dur: '0:30', start: '07:00', done: true  },
    { label: 'Writing',          type: 'DEEP WORK', color: P.blue,   dur: '1:24', start: '07:32', done: true  },
    { label: 'Client Review',    type: 'REVIEW',    color: P.accent, dur: '0:45', start: '09:15', done: true  },
    { label: 'Lunch Break',      type: 'BREAK',     color: P.green,  dur: '0:60', start: '10:10', done: true  },
    { label: 'Brand Identity',   type: 'DEEP WORK', color: P.blue,   dur: '2:00', start: '11:15', active: true},
    { label: 'Admin / Email',    type: 'ADMIN',     color: P.fg3,    dur: '—',    start: '13:30', done: false },
    { label: 'Design Review',    type: 'REVIEW',    color: P.accent, dur: '—',    start: '15:00', done: false },
  ];

  const rows = phases.map((p, i) => {
    const y = i * 72;
    const isActive = p.active;
    const isDone = p.done;
    const bgColor = isActive ? P.accentLo : 'transparent';
    return F(0, y, pw, 70, bgColor, { ch: [
      // Left border color
      F(0, 8, 3, 54, isDone || isActive ? p.color : P.surface3, { r: 2 }),

      // Time
      T(p.start, 12, 14, 52, 18, { size: 12, weight: 500, color: P.fg3, mono: true }),

      // Phase name
      T(p.label, 12, 34, 200, 20, {
        size: 15, weight: isActive ? 700 : (isDone ? 500 : 400),
        color: isActive ? P.fg : (isDone ? P.fg2 : P.fg3),
      }),

      // Type tag
      F(220, 12, p.type.length * 6.5 + 16, 20, p.color + (isDone || isActive ? '25' : '10'), { r: 4, ch: [
        T(p.type, 8, 3, p.type.length * 6.5, 14, {
          size: 9, weight: 700, color: isDone || isActive ? p.color : P.fg4, ls: 0.06, mono: true,
        }),
      ]}),

      // Duration
      T(p.dur, pw - 60, 24, 48, 24, {
        size: 16, weight: 700, color: isDone ? P.fg2 : (isActive ? P.yellow : P.fg4),
        mono: true, align: 'right',
      }),

      // Separator
      F(12, 69, pw - 24, 1, P.border),
    ]});
  });

  const listH = phases.length * 72;

  return F(0, 0, pw, ph, P.bg, { ch: [
    statusBar(),

    // Header
    T('TODAY', 20, 52, 100, 28, { size: 13, weight: 700, color: P.fg3, ls: 0.14, mono: true }),
    T('Tuesday, Mar 31', 20, 76, 200, 28, { size: 22, weight: 800, color: P.fg, ls: -0.02 }),

    // Total today
    T('4h 39m', pw - 90, 56, 80, 28, { size: 22, weight: 900, color: P.yellow, mono: true, align: 'right' }),
    T('total', pw - 70, 82, 50, 14, { size: 10, color: P.fg4, mono: true, align: 'right', ls: 0.04 }),

    // Phase list
    F(0, 120, pw, listH, P.bg, { ch: rows }),

    navBar(1),
  ]});
};

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — LOG
// Chronological log of all recent phases, editorial big-duration display
// ══════════════════════════════════════════════════════════════════════════════
const screen3 = () => {
  const entries = [
    { date: 'Today',     label: 'Writing',          type: 'DEEP WORK', color: P.blue,   dur: '1h 24m', proj: 'Meridian Co.' },
    { date: 'Today',     label: 'Client Review',    type: 'REVIEW',    color: P.accent, dur: '0h 45m', proj: 'Meridian Co.' },
    { date: 'Today',     label: 'Morning Ritual',   type: 'RITUAL',    color: P.purple, dur: '0h 30m', proj: '—' },
    { date: 'Yesterday', label: 'Visual Identity',  type: 'DEEP WORK', color: P.blue,   dur: '3h 10m', proj: 'Bloom Studio' },
    { date: 'Yesterday', label: 'Brand Strategy',   type: 'DEEP WORK', color: P.blue,   dur: '2h 05m', proj: 'Bloom Studio' },
    { date: 'Mon 29',    label: 'Concept Sketching',type: 'DEEP WORK', color: P.blue,   dur: '2h 40m', proj: 'Meridian Co.' },
  ];

  let prevDate = '';
  const rows = [];
  let y = 0;

  for (const e of entries) {
    // Date separator
    if (e.date !== prevDate) {
      rows.push(F(0, y, pw, 28, P.bg, { ch: [
        T(e.date.toUpperCase(), 20, 8, pw - 40, 18, {
          size: 11, weight: 700, color: P.fg3, ls: 0.10, mono: true,
        }),
      ]}));
      y += 28;
      prevDate = e.date;
    }

    // Log entry card
    rows.push(F(12, y, pw - 24, 68, P.surface, { r: 10, stroke: P.border, ch: [
      // Left bar
      F(0, 0, 3, 68, e.color, { r: 2 }),
      // Phase name
      T(e.label, 16, 12, 200, 22, { size: 15, weight: 600, color: P.fg }),
      // Project
      T(e.proj, 16, 34, 180, 18, { size: 12, weight: 400, color: P.fg3 }),
      // Type tag
      F(pw - 140, 12, e.type.length * 6.2 + 14, 20, e.color + '25', { r: 4, ch: [
        T(e.type, 7, 3, e.type.length * 6.2, 14, { size: 9, weight: 700, color: e.color, ls: 0.06, mono: true }),
      ]}),
      // Duration — big monospace
      T(e.dur, pw - 124, 32, 110, 26, {
        size: 18, weight: 700, color: P.fg2, mono: true, align: 'right',
      }),
    ]}));
    y += 76;
  }

  return F(0, 0, pw, ph, P.bg, { ch: [
    statusBar(),

    T('PHASE LOG', 20, 52, 200, 20, { size: 12, weight: 700, color: P.fg3, ls: 0.12, mono: true }),
    T('Recent activity', 20, 74, 200, 26, { size: 20, weight: 800, color: P.fg }),

    // Search bar
    F(20, 108, pw - 40, 40, P.surface2, { r: 10, stroke: P.border, ch: [
      T('🔍', 12, 10, 24, 20, { size: 14 }),
      T('Search phases...', 40, 11, 200, 18, { size: 13, color: P.fg4 }),
    ]}),

    // Log list
    F(0, 160, pw, y, P.bg, { ch: rows }),

    navBar(2),
  ]});
};

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — PROJECTS
// Project list with hours as MASSIVE condensed display numbers
// ══════════════════════════════════════════════════════════════════════════════
const screen4 = () => {
  const projects = [
    { name: 'Meridian Co.',    sub: 'Brand Identity & Strategy',   hours: '24.5', color: P.accent,  budget: '40h',  pct: 0.61 },
    { name: 'Bloom Studio',    sub: 'Visual Identity System',       hours: '18.2', color: P.blue,    budget: '25h',  pct: 0.73 },
    { name: 'PARA Lab',        sub: 'Product Design Consultation',  hours: '11.0', color: P.purple,  budget: '20h',  pct: 0.55 },
    { name: 'Personal',        sub: 'Learning & Side Projects',     hours: '8.3',  color: P.green,   budget: '—',    pct: null  },
  ];

  const cards = projects.map((p, i) => {
    const y = i * 156;
    return F(12, y, pw - 24, 144, P.surface, { r: 14, stroke: P.border, ch: [
      // Top bar with color
      F(0, 0, pw - 24, 4, p.color, { r: 2 }),

      // Project name — large
      T(p.name, 20, 24, pw - 180, 32, { size: 18, weight: 800, color: P.fg, ls: -0.01 }),
      T(p.sub, 20, 56, pw - 180, 18, { size: 12, weight: 400, color: P.fg3 }),

      // Hours — MASSIVE condensed
      T(p.hours, pw - 140, 18, 120, 52, {
        size: 44, weight: 900, color: p.color, mono: true, align: 'right', ls: -0.03,
      }),
      T('hours', pw - 110, 66, 86, 18, {
        size: 11, weight: 500, color: P.fg3, mono: true, align: 'right',
      }),

      // Budget progress
      ...(p.pct !== null ? [
        F(20, 94, pw - 80, 4, P.surface3, { r: 2, ch: [
          F(0, 0, (pw - 80) * p.pct, 4, p.color, { r: 2 }),
        ]}),
        T(`${Math.round(p.pct * 100)}% of ${p.budget}`, 20, 104, pw - 80, 18, {
          size: 11, color: P.fg4, mono: true,
        }),
      ] : [
        T('Personal / untracked', 20, 100, pw - 80, 18, { size: 11, color: P.fg4 }),
      ]),

      // Add phase button
      T('+ Add phase', pw - 108, 108, 88, 20, {
        size: 12, weight: 600, color: p.color, align: 'right',
      }),
    ]});
  });

  return F(0, 0, pw, ph, P.bg, { ch: [
    statusBar(),

    T('PROJECTS', 20, 52, 160, 20, { size: 12, weight: 700, color: P.fg3, ls: 0.12, mono: true }),
    T('Active work', 20, 74, 200, 26, { size: 20, weight: 800, color: P.fg }),
    T('+ New', pw - 68, 74, 48, 22, { size: 14, weight: 600, color: P.accent, align: 'right' }),

    F(0, 112, pw, 620, P.bg, { ch: cards }),

    navBar(3),
  ]});
};

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — INSIGHTS
// Weekly stats in full editorial typographic treatment
// ══════════════════════════════════════════════════════════════════════════════
const screen5 = () => {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const hours = [6.2, 7.8, 5.5, 8.1, 6.9, 3.2, 0];
  const maxH = 8.1;
  const barW = (pw - 60) / 7 - 8;
  const barMaxH = 80;

  const bars = days.map((d, i) => {
    const barH = Math.round((hours[i] / maxH) * barMaxH);
    const isToday = i === 1;
    return F(30 + i * ((pw - 60) / 7), 0, barW, barMaxH + 32, 'transparent', { ch: [
      // Bar background
      F(0, barMaxH - barH, barW, barH, isToday ? P.accent : (hours[i] > 0 ? P.surface3 : P.surface2), { r: 3 }),
      // Bar fill (today has accent, past days have border highlight)
      ...(isToday ? [] : [F(0, barMaxH - barH, barW, 2, hours[i] > 0 ? P.blue : P.surface2, { r: 2 })]),
      // Hours label
      T(hours[i] > 0 ? hours[i].toFixed(1) : '—', 0, barMaxH + 4, barW, 14, {
        size: 9, weight: 600, color: isToday ? P.fg : P.fg3, mono: true, align: 'center',
      }),
      // Day label
      T(d, 0, barMaxH + 18, barW, 14, {
        size: 10, weight: isToday ? 700 : 400, color: isToday ? P.accent : P.fg3,
        align: 'center', ls: 0.04,
      }),
    ]});
  });

  // Phase type breakdown
  const breakdown = [
    { label: 'Deep Work',  pct: 0.64, color: P.blue,   hours: '24.4h' },
    { label: 'Review',     pct: 0.18, color: P.accent,  hours: '6.8h' },
    { label: 'Admin',      pct: 0.10, color: P.fg3,     hours: '3.9h' },
    { label: 'Rituals',    pct: 0.08, color: P.purple,  hours: '3.0h' },
  ];

  const bdown = breakdown.map((b, i) => F(12, i * 46, pw - 24, 42, 'transparent', { ch: [
    // Color dot
    E(0, 14, 10, 10, b.color),
    // Label
    T(b.label, 18, 12, 160, 20, { size: 14, weight: 500, color: P.fg }),
    // Percent bar
    F(180, 18, pw - 316, 6, P.surface2, { r: 3, ch: [
      F(0, 0, (pw - 316) * b.pct, 6, b.color + '99', { r: 3 }),
    ]}),
    // Hours
    T(b.hours, pw - 108, 10, 80, 22, { size: 15, weight: 700, color: P.fg2, mono: true, align: 'right' }),
    // Separator
    F(0, 42, pw - 24, 1, P.border),
  ]}));

  return F(0, 0, pw, ph, P.bg, { ch: [
    statusBar(),

    T('THIS WEEK', 20, 52, 200, 18, { size: 12, weight: 700, color: P.fg3, ls: 0.12, mono: true }),

    // Big total hours — editorial display
    T('38.2', 20, 72, 200, 76, { size: 72, weight: 900, color: P.fg, mono: true, ls: -0.04, lh: 1.0 }),
    T('hours', 20, 146, 80, 22, { size: 18, weight: 400, color: P.fg3 }),

    // Streak badge
    F(pw - 100, 88, 84, 32, P.yellowLo, { r: 16, stroke: P.yellow + '44', ch: [
      T('🔥 8 days', 12, 8, 68, 18, { size: 12, weight: 700, color: P.yellow }),
    ]}),

    // Day bars chart
    F(0, 186, pw, barMaxH + 32, P.bg, { ch: bars }),

    // Divider + section label
    F(20, 306, pw - 40, 1, P.border),
    T('BY TYPE', 20, 316, 100, 16, { size: 11, weight: 700, color: P.fg3, ls: 0.10, mono: true }),

    // Breakdown list
    F(12, 340, pw - 24, breakdown.length * 46, P.bg, { ch: bdown }),

    // Compare to last week
    F(20, ph - 160, pw - 40, 48, P.surface2, { r: 12, stroke: P.border, ch: [
      T('vs. last week', 16, 14, 120, 20, { size: 12, color: P.fg3 }),
      T('+4.1h  ↑ 12%', pw - 130, 12, 110, 24, { size: 16, weight: 700, color: P.green, mono: true, align: 'right' }),
    ]}),

    navBar(4),
  ]});
};

// ══════════════════════════════════════════════════════════════════════════════
// BUILD PEN FILE
// ══════════════════════════════════════════════════════════════════════════════
const pen = {
  version: '2.8',
  name: 'PHASE — Deep Work Timer',
  width: pw,
  height: ph,
  screens: [
    { id: 'screen-1', name: 'Now (Active)',  width: pw, height: ph, background: P.bg, children: [screen1()] },
    { id: 'screen-2', name: 'Today',         width: pw, height: ph, background: P.bg, children: [screen2()] },
    { id: 'screen-3', name: 'Log',           width: pw, height: ph, background: P.bg, children: [screen3()] },
    { id: 'screen-4', name: 'Projects',      width: pw, height: ph, background: P.bg, children: [screen4()] },
    { id: 'screen-5', name: 'Insights',      width: pw, height: ph, background: P.bg, children: [screen5()] },
  ],
};

const out = JSON.stringify(pen, null, 2);
fs.writeFileSync('phase.pen', out);
const kb = (out.length / 1024).toFixed(1);
console.log(`✓ phase.pen written — 5 screens, ${kb} KB`);
console.log(`  Palette: near-black #080808 · orange-red #F24E1E · electric yellow #FFD60A`);
console.log(`  Inspired by KOMETA typography (land-book.com) + supercommon systems`);
