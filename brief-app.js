'use strict';
// brief-app.js
// BRIEF — Living design specifications, AI-powered
//
// Challenge: Design a LIGHT-themed AI-native design specification tool that
// replaces scattered spec docs. Inspired by:
//
// 1. Equals.so (land-book.com, March 2026) — "What's after Excel?" — AI-first
//    tool replacing a legacy workflow. Warm off-white bg, bold sans-serif type,
//    pastel gradient accents. "The first new spreadsheet in 20 years."
//    → Applied: same "what comes after the broken legacy tool?" framing + warm
//    parchment background (#F7F4EE), clean data-first cards.
//
// 2. 108 Supply (darkmodedesign.com) — Editorial typography mixing condensed
//    serif (GT Alpina Condensed) + monospace (Geist Mono), numbered catalog
//    items ("027 templates"), curated aesthetic for "obsessive creatives."
//    → Applied: Spec IDs in monospace (S-001, C-014), condensed serif display
//    headings, numbered section structure.
//
// 3. Arc'teryx × Re (land-book.com) — Technical grid paper aesthetic,
//    "How can we make the future more human?" — precision + warmth together.
//    → Applied: Progress bars as technical measurement indicators, warm-toned
//    palette that feels like drafting paper.
//
// Palette: warm parchment + terracotta + cobalt blue + near-black warm type
// Screens: 5 mobile (390×844) | LIGHT THEME

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#F7F4EE',   // warm parchment
  surface:  '#FFFFFE',   // pure white
  surface2: '#F0EDE4',   // tinted card
  surface3: '#E8E4D8',   // border surface
  border:   '#E2DDD0',   // warm grey border
  text:     '#1A1714',   // near-black warm
  textMid:  '#5A5550',   // mid warm grey
  textSoft: '#9A948A',   // muted
  accent:   '#C4521C',   // terracotta
  accent2:  '#3B6EF8',   // cobalt blue
  accent3:  '#2BAF6A',   // green
  warn:     '#E8931A',   // amber
  soft:     'rgba(26,23,20,0.05)',
};

const FONT_DISPLAY = "'GT Alpina Condensed', 'Playfair Display', Georgia, serif";
const FONT_BODY    = "'Inter', 'DM Sans', system-ui, sans-serif";
const FONT_MONO    = "'Geist Mono', 'JetBrains Mono', monospace";

// ── Helpers ───────────────────────────────────────────────────────────────────
function t(content, opts = {}) {
  return {
    type: 'text', content,
    x: opts.x ?? 20, y: opts.y ?? 0,
    width: opts.w ?? 350,
    fontSize: opts.size ?? 14,
    fontFamily: opts.font ?? FONT_BODY,
    fontWeight: opts.weight ?? '400',
    color: opts.color ?? P.text,
    letterSpacing: opts.ls ?? 0,
    lineHeight: opts.lh ?? 1.4,
    textAlign: opts.align ?? 'left',
    opacity: opts.opacity ?? 1,
  };
}

function rect(x, y, w, h, opts = {}) {
  return {
    type: 'rect', x, y, width: w, height: h,
    fill: opts.fill ?? P.surface,
    stroke: opts.stroke ?? 'none',
    strokeWidth: opts.sw ?? 1,
    cornerRadius: opts.r ?? 0,
    opacity: opts.opacity ?? 1,
    shadow: opts.shadow ?? null,
  };
}

function ellipse(x, y, r, fill) {
  return { type: 'ellipse', x: x - r, y: y - r, width: r * 2, height: r * 2, fill, stroke: 'none' };
}

function line(x1, y1, x2, y2, color = P.border, sw = 1) {
  return { type: 'line', x1, y1, x2, y2, stroke: color, strokeWidth: sw };
}

function pill(x, y, label, color, bg) {
  const w = Math.max(label.length * 6.8 + 20, 60);
  return [
    rect(x, y, w, 22, { fill: bg, r: 11 }),
    t(label, { x: x + 10, y: y + 4, size: 10.5, weight: '600', color, font: FONT_BODY, ls: 0.2, w }),
  ];
}

function bar(x, y, w, pct, color = P.accent2) {
  return [
    rect(x, y, w, 4, { fill: P.surface3, r: 2 }),
    rect(x, y, Math.max(4, Math.round(w * pct / 100)), 4, { fill: color, r: 2 }),
  ];
}

// ── Status bar ────────────────────────────────────────────────────────────────
function statusBar() {
  return [
    rect(0, 0, 390, 44, { fill: P.bg }),
    t('9:41', { x: 20, y: 13, size: 14, weight: '600', color: P.text }),
    t('●●●  ▶  ▮▮▮▮▮', { x: 228, y: 13, size: 11, color: P.text }),
  ];
}

// ── Bottom nav ────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'specs',      label: 'Specs',   icon: '▤' },
  { id: 'components', label: 'Comps',   icon: '◈' },
  { id: 'review',     label: 'Review',  icon: '◎' },
  { id: 'stream',     label: 'Stream',  icon: '≋' },
  { id: 'you',        label: 'You',     icon: '○' },
];

function navBar(active) {
  const Y = 844 - 72;
  const items = [
    rect(0, Y, 390, 72, { fill: P.surface, stroke: 'none' }),
    line(0, Y, 390, Y, P.border, 1),
  ];
  NAV.forEach((n, i) => {
    const x = 11 + i * 74;
    const on = n.id === active;
    items.push(t(n.icon, { x: x + 17, y: Y + 10, size: 18,
      color: on ? P.accent : P.textSoft, align: 'center', w: 36 }));
    items.push(t(n.label, { x: x + 3, y: Y + 33, size: 9.5, weight: on ? '600' : '400',
      color: on ? P.accent : P.textSoft, align: 'center', w: 66 }));
    if (on) items.push(ellipse(x + 36, Y + 64, 3, P.accent));
  });
  return items;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCREEN 1 — Specs Dashboard
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function s1() {
  const els = [
    rect(0, 0, 390, 844, { fill: P.bg }),
    ...statusBar(),

    // Wordmark
    t('BRIEF', { x: 20, y: 56, size: 26, weight: '700', font: FONT_BODY, color: P.text, ls: -0.5 }),
    t('·', { x: 80, y: 56, size: 26, color: P.accent }),
    t('Living specifications', { x: 20, y: 86, size: 13, color: P.textMid }),

    // AI nudge chip
    rect(20, 108, 280, 32, { fill: P.soft, r: 16, stroke: P.border, sw: 1 }),
    ellipse(37, 124, 7, P.accent2),
    t('AI', { x: 31, y: 117, size: 9, weight: '700', color: '#fff' }),
    t('3 specs need attention', { x: 51, y: 116, size: 12, color: P.text }),

    // Section header
    t('ACTIVE SPECS', { x: 20, y: 158, size: 10, weight: '700', color: P.textSoft, ls: 1.5 }),
    t('5 docs', { x: 342, y: 158, size: 10, color: P.textSoft }),

    // Spec cards
    ...[
      { id: 'S-001', name: 'Onboarding Flow',       by: 'Maya · 2h ago',       pct: 72, status: 'Active',  sc: P.accent,  sbg: 'rgba(196,82,28,0.08)' },
      { id: 'S-002', name: 'Navigation System',      by: 'Kai · 1d ago',        pct: 89, status: 'Review',  sc: P.warn,    sbg: 'rgba(232,147,26,0.1)' },
      { id: 'S-003', name: 'Component Library v2',   by: 'AI generated',        pct: 41, status: 'AI draft',sc: P.accent2, sbg: 'rgba(59,110,248,0.1)' },
      { id: 'S-004', name: 'Empty States Handbook',  by: 'You · 3d ago',        pct: 100,status: 'Done',    sc: P.accent3, sbg: 'rgba(43,175,106,0.1)' },
    ].map((sp, i) => {
      const y = 176 + i * 94;
      const barColor = sp.pct === 100 ? P.accent3 : sp.status === 'AI draft' ? P.accent2 : P.accent;
      return [
        rect(20, y, 350, 82, {
          fill: P.surface, r: 12,
          shadow: '0 2px 10px rgba(26,23,20,0.06)',
        }),
        t(sp.id, { x: 32, y: y + 10, size: 9.5, weight: '600', color: P.accent, font: FONT_MONO }),
        ...pill(286, y + 8, sp.status, sp.sc, sp.sbg),
        t(sp.name, { x: 32, y: y + 28, size: 15, weight: '600', color: P.text }),
        t(sp.by, { x: 32, y: y + 47, size: 11, color: P.textMid }),
        ...bar(32, y + 66, 250, sp.pct, barColor),
        t(`${sp.pct}%`, { x: 290, y: y + 57, size: 11, weight: '600', color: barColor }),
      ];
    }).flat(),

    // Coverage mini chart
    rect(20, 554, 350, 72, { fill: P.surface2, r: 12 }),
    t('Coverage by type', { x: 32, y: 568, size: 12, weight: '600', color: P.text }),
    ...[
      { label: 'Flows',  pct: 82, color: P.accent2 },
      { label: 'States', pct: 67, color: P.accent  },
      { label: 'Errors', pct: 45, color: P.warn    },
      { label: 'Copy',   pct: 91, color: P.accent3 },
    ].map((m, i) => [
      t(m.label, { x: 32 + i * 82, y: 588, size: 9, color: P.textSoft }),
      rect(32 + i * 82, 600, 68, 5, { fill: P.surface3, r: 2.5 }),
      rect(32 + i * 82, 600, Math.round(68 * m.pct / 100), 5, { fill: m.color, r: 2.5 }),
      t(`${m.pct}%`, { x: 32 + i * 82, y: 612, size: 9.5, weight: '600', color: m.color }),
    ]).flat(),

    // Recent activity feed
    t('RECENT', { x: 20, y: 642, size: 10, weight: '700', color: P.textSoft, ls: 1.5 }),
    line(32, 658, 32, 730, P.border, 1.5),
    ...[
      { dot: P.accent2, text: 'AI added 2 edge cases to S-001',     time: '11:02 AM' },
      { dot: P.accent3, text: 'Maya completed Section 02 of S-001', time: '10:44 AM' },
      { dot: P.accent,  text: 'Kai requested review on S-002',      time: '9:31 AM'  },
    ].map((ev, i) => [
      ellipse(32, 666 + i * 28, 5, ev.dot),
      t(ev.text, { x: 46, y: 659 + i * 28, size: 11.5, color: P.text }),
      t(ev.time, { x: 306, y: 659 + i * 28, size: 10, color: P.textSoft }),
    ]).flat(),

    ...navBar('specs'),
  ];
  return { id: 'specs', label: 'Specs', width: 390, height: 844, backgroundColor: P.bg, elements: els };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCREEN 2 — Brief Detail
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function s2() {
  const els = [
    rect(0, 0, 390, 844, { fill: P.bg }),
    ...statusBar(),

    t('← Specs', { x: 20, y: 56, size: 13, color: P.accent }),
    ...pill(302, 52, 'Active', P.accent, 'rgba(196,82,28,0.08)'),

    t('S-001', { x: 20, y: 80, size: 11, weight: '700', color: P.accent, font: FONT_MONO, ls: 0.5 }),
    t('Onboarding Flow', { x: 20, y: 98, size: 28, weight: '700', color: P.text,
      font: FONT_DISPLAY, lh: 1.05 }),
    t('Design spec · Updated 2h ago by Maya', { x: 20, y: 132, size: 12, color: P.textMid }),

    // Progress bar
    rect(20, 152, 350, 44, { fill: P.surface, r: 10, stroke: P.border, sw: 1 }),
    ...bar(32, 164, 316, 72, P.accent2),
    t('72% coverage', { x: 32, y: 175, size: 10.5, weight: '600', color: P.accent2 }),
    t('10 / 14 sections done', { x: 220, y: 175, size: 10, color: P.textSoft }),

    // AI banner
    rect(20, 208, 350, 52, { fill: 'rgba(59,110,248,0.05)', r: 10, stroke: 'rgba(59,110,248,0.18)', sw: 1 }),
    ellipse(36, 234, 8, P.accent2),
    t('✦', { x: 30, y: 227, size: 11, color: '#fff' }),
    t('AI detected 2 missing edge cases', { x: 52, y: 222, size: 12, weight: '600', color: P.accent2 }),
    t('Empty state + timeout not yet specified', { x: 52, y: 238, size: 11, color: P.textMid }),
    t('Review →', { x: 300, y: 230, size: 11, weight: '600', color: P.accent2 }),

    t('SECTIONS', { x: 20, y: 276, size: 10, weight: '700', color: P.textSoft, ls: 1.5 }),

    ...[
      { num: '01', title: 'Overview & Goals',      status: 'done',   pct: 100 },
      { num: '02', title: 'User Journey Map',       status: 'done',   pct: 100 },
      { num: '03', title: 'Screen Flows',           status: 'done',   pct: 100 },
      { num: '04', title: 'Component States',       status: 'active', pct: 68  },
      { num: '05', title: 'Error Handling',         status: 'ai',     pct: 22  },
      { num: '06', title: 'Copy & Microcopy',       status: 'empty',  pct: 0   },
    ].map((sec, i) => {
      const y = 294 + i * 54;
      const statusMap = {
        done:   { c: P.accent3,  bg: 'rgba(43,175,106,0.08)',   label: '✓ Done',       barC: P.accent3 },
        active: { c: P.accent,   bg: 'rgba(196,82,28,0.08)',    label: 'In progress',  barC: P.accent  },
        ai:     { c: P.accent2,  bg: 'rgba(59,110,248,0.08)',   label: 'AI draft',     barC: P.accent2 },
        empty:  { c: P.textSoft, bg: P.surface2,                label: 'Empty',        barC: P.surface3 },
      };
      const sm = statusMap[sec.status];
      return [
        rect(20, y, 350, 46, {
          fill: P.surface, r: 10,
          stroke: sec.status === 'active' ? 'rgba(196,82,28,0.2)' : P.border, sw: 1,
        }),
        t(sec.num, { x: 32, y: y + 8, size: 10, weight: '700', color: P.textSoft, font: FONT_MONO }),
        t(sec.title, { x: 60, y: y + 7, size: 13.5, weight: sec.status !== 'empty' ? '500' : '400', color: P.text }),
        ...bar(60, y + 28, 202, sec.pct, sm.barC),
        ...pill(276, y + 10, sm.label, sm.c, sm.bg),
      ];
    }).flat(),

    // Comments teaser
    rect(20, 624, 350, 56, { fill: P.surface2, r: 10 }),
    t('💬  3 open comments', { x: 32, y: 640, size: 12, color: P.text }),
    t('Maya, Kai, and you', { x: 32, y: 658, size: 11, color: P.textMid }),
    t('View', { x: 330, y: 650, size: 12, weight: '600', color: P.accent }),

    // CTA
    rect(20, 692, 350, 48, { fill: P.accent, r: 24 }),
    t('Edit specification', { x: 195, y: 710, size: 14, weight: '600', color: '#FFFFFE', align: 'center', w: 350 }),

    ...navBar('specs'),
  ];
  return { id: 'brief', label: 'Brief', width: 390, height: 844, backgroundColor: P.bg, elements: els };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCREEN 3 — Components
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function s3() {
  const comps = [
    { id: 'C-014', name: 'Button',       states: 5, done: 5,  pct: 100 },
    { id: 'C-022', name: 'Input Field',  states: 8, done: 6,  pct: 75  },
    { id: 'C-031', name: 'Modal',        states: 4, done: 4,  pct: 100 },
    { id: 'C-038', name: 'Toast',        states: 6, done: 2,  pct: 33  },
    { id: 'C-041', name: 'Nav Bar',      states: 3, done: 3,  pct: 100 },
    { id: 'C-047', name: 'Data Table',   states: 7, done: 0,  pct: 0   },
  ];

  const els = [
    rect(0, 0, 390, 844, { fill: P.bg }),
    ...statusBar(),

    t('Components', { x: 20, y: 60, size: 26, weight: '700', color: P.text }),
    t('48 tracked · 12 need specs', { x: 20, y: 89, size: 13, color: P.textMid }),

    // Filter chips
    ...[
      { l: 'All', x: 20 },
      { l: 'Inputs', x: 56 },
      { l: 'Navigation', x: 108 },
      { l: 'Feedback', x: 192 },
    ].map((chip, i) => {
      const w = chip.l.length * 7 + 22;
      return [
        rect(chip.x, 110, w, 28, {
          fill: i === 0 ? P.accent : P.surface, r: 14,
          stroke: i === 0 ? 'none' : P.border, sw: 1,
        }),
        t(chip.l, { x: chip.x + 11, y: 118, size: 11.5,
          weight: i === 0 ? '600' : '400',
          color: i === 0 ? '#fff' : P.textMid }),
      ];
    }).flat(),

    // 2-col grid
    ...comps.map((c, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = col === 0 ? 20 : 207;
      const y = 150 + row * 116;
      const dot = c.pct === 100 ? P.accent3 : c.pct === 0 ? P.accent : P.warn;
      const barC = c.pct === 100 ? P.accent3 : c.pct === 0 ? P.surface3 : P.warn;
      return [
        rect(x, y, 163, 104, {
          fill: P.surface, r: 12,
          stroke: c.pct === 0 ? 'rgba(196,82,28,0.2)' : P.border, sw: 1,
        }),
        ellipse(x + 148, y + 16, 5, dot),
        t(c.id,   { x: x + 12, y: y + 9,  size: 9, weight: '600', color: P.textSoft, font: FONT_MONO }),
        t(c.name, { x: x + 12, y: y + 27, size: 14, weight: '600', color: P.text }),
        t(`${c.states} states`, { x: x + 12, y: y + 47, size: 11, color: P.textMid }),
        t(`${c.done}/${c.states} specced`, {
          x: x + 12, y: y + 63, size: 10.5,
          color: c.pct === 100 ? P.accent3 : c.pct === 0 ? P.accent : P.textMid,
        }),
        ...bar(x + 12, y + 82, 138, c.pct, barC),
      ];
    }).flat(),

    // Warning strip
    rect(20, 502, 350, 56, { fill: 'rgba(196,82,28,0.05)', r: 12, stroke: 'rgba(196,82,28,0.2)', sw: 1 }),
    t('⚠', { x: 34, y: 516, size: 18, color: P.accent }),
    t('12 components have no spec', { x: 62, y: 516, size: 13, weight: '600', color: P.text }),
    t('AI can generate first drafts instantly', { x: 62, y: 534, size: 11, color: P.textMid }),
    t('Generate →', { x: 288, y: 526, size: 11.5, weight: '600', color: P.accent }),

    // Stats
    rect(20, 570, 350, 64, { fill: P.surface2, r: 12 }),
    ...[
      { label: 'Total',   value: '48', color: P.text     },
      { label: 'Specced', value: '36', color: P.accent3  },
      { label: 'AI draft',value: '8',  color: P.accent2  },
      { label: 'Empty',   value: '12', color: P.accent   },
    ].map((s, i) => [
      t(s.value, { x: 36 + i * 84, y: 584, size: 22, weight: '700', color: s.color }),
      t(s.label, { x: 36 + i * 84, y: 614, size: 9.5, color: P.textSoft }),
    ]).flat(),

    // Search
    rect(20, 646, 350, 48, { fill: P.surface, r: 24, stroke: P.border, sw: 1 }),
    t('⌕', { x: 44, y: 662, size: 16, color: P.textSoft }),
    t('Search components...', { x: 70, y: 664, size: 13, color: P.textSoft }),
    t('+', { x: 346, y: 658, size: 24, weight: '300', color: P.accent }),

    t('Tap any component to view or edit its spec', {
      x: 195, y: 710, size: 11, color: P.textSoft, align: 'center', w: 390,
    }),

    ...navBar('components'),
  ];
  return { id: 'components', label: 'Components', width: 390, height: 844, backgroundColor: P.bg, elements: els };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCREEN 4 — Review
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function s4() {
  const els = [
    rect(0, 0, 390, 844, { fill: P.bg }),
    ...statusBar(),

    t('Review', { x: 20, y: 60, size: 26, weight: '700', color: P.text }),
    t('2 pending · 1 approved', { x: 20, y: 89, size: 13, color: P.textMid }),

    // Pending card — accent top bar
    rect(20, 110, 350, 200, {
      fill: P.surface, r: 16,
      shadow: '0 4px 20px rgba(26,23,20,0.08)',
      stroke: 'rgba(196,82,28,0.12)', sw: 1,
    }),
    rect(20, 110, 350, 4, { fill: P.accent, r: 2 }),
    t('AWAITING YOUR REVIEW', { x: 32, y: 128, size: 9.5, weight: '700', color: P.accent, ls: 1.5 }),
    t('S-002 Navigation System', { x: 32, y: 147, size: 19, weight: '700', color: P.text }),
    t('Sent by Kai Chen · 1 day ago', { x: 32, y: 170, size: 11.5, color: P.textMid }),
    line(32, 190, 358, 190, P.border, 1),
    t('Sections: Tab nav · Gestures · Deep links · State', { x: 32, y: 202, size: 11.5, color: P.textMid }),
    // buttons
    rect(32, 224, 138, 40, { fill: P.surface2, r: 20, stroke: P.border, sw: 1 }),
    t('Request changes', { x: 101, y: 242, size: 11.5, weight: '500', color: P.text, align: 'center', w: 138 }),
    rect(184, 224, 138, 40, { fill: P.accent, r: 20 }),
    t('Approve →', { x: 253, y: 242, size: 12, weight: '600', color: '#fff', align: 'center', w: 138 }),

    // Comment input
    rect(20, 326, 350, 48, { fill: P.surface, r: 24, stroke: P.border, sw: 1 }),
    t('Add a comment...', { x: 48, y: 344, size: 13, color: P.textSoft }),
    t('↑', { x: 344, y: 342, size: 14, weight: '700', color: P.accent }),

    t('HISTORY', { x: 20, y: 390, size: 10, weight: '700', color: P.textSoft, ls: 1.5 }),

    ...[
      { spec: 'S-001 Onboarding Flow',      who: 'You',  action: 'approved',         when: '3d ago', color: P.accent3 },
      { spec: 'S-003 Component Library',    who: 'Maya', action: 'requested changes', when: '5d ago', color: P.accent  },
    ].map((rev, i) => {
      const y = 408 + i * 84;
      const sc = rev.color;
      const bg = rev.color === P.accent3 ? 'rgba(43,175,106,0.08)' : 'rgba(196,82,28,0.08)';
      return [
        rect(20, y, 350, 72, { fill: P.surface, r: 12, stroke: P.border, sw: 1 }),
        rect(20, y, 4, 72, { fill: sc, r: 2 }),
        t(rev.spec, { x: 38, y: y + 10, size: 13, weight: '600', color: P.text }),
        t(`${rev.who} ${rev.action}`, { x: 38, y: y + 29, size: 11.5, color: P.textMid }),
        t(rev.when, { x: 38, y: y + 47, size: 10.5, color: P.textSoft }),
        ...pill(260, y + 10, rev.action === 'approved' ? 'Approved' : 'Changes', sc, bg),
      ];
    }).flat(),

    // Reviewers
    rect(20, 582, 350, 68, { fill: P.surface2, r: 12 }),
    t('Team reviewers', { x: 32, y: 598, size: 12, weight: '600', color: P.text }),
    ...[P.accent, P.accent2, P.accent3, P.warn].map((c, i) => [
      ellipse(36 + i * 34, 632, 14, c),
      t(['M', 'K', 'A', 'L'][i], { x: 30 + i * 34, y: 625, size: 11, weight: '700', color: '#fff' }),
    ]).flat(),
    t('+ Invite', { x: 180, y: 626, size: 12, color: P.accent }),

    // Empty state panel
    rect(20, 662, 350, 56, { fill: P.soft, r: 12 }),
    t('Nothing else to review right now', { x: 195, y: 680, size: 12, color: P.textMid, align: 'center', w: 350 }),
    t('You\'re all caught up ✓', { x: 195, y: 698, size: 11, color: P.accent3, align: 'center', w: 350 }),

    ...navBar('review'),
  ];
  return { id: 'review', label: 'Review', width: 390, height: 844, backgroundColor: P.bg, elements: els };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCREEN 5 — Activity Stream
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function s5() {
  const events = [
    { dot: P.accent2, icon: '✦', title: 'AI suggestion',      text: 'Added 2 missing edge cases to S-001', sub: 'Error recovery + timeout state', time: '11:02 AM' },
    { dot: P.accent3, icon: '↑', title: 'Section complete',   text: 'Maya marked "User Journey Map" done',  sub: 'S-001 · Section 02',             time: '10:44 AM' },
    { dot: P.accent,  icon: '◎', title: 'Review requested',   text: 'Kai sent S-002 Navigation for review', sub: 'Awaiting your approval',         time: '9:31 AM'  },
    { dot: P.textSoft,icon: '◈', title: 'Component added',    text: 'New component: Tooltip (C-048)',       sub: 'Needs spec',                     time: '8:15 AM'  },
  ];

  const els = [
    rect(0, 0, 390, 844, { fill: P.bg }),
    ...statusBar(),

    t('Stream', { x: 20, y: 60, size: 26, weight: '700', color: P.text }),
    t('All activity across your specs', { x: 20, y: 89, size: 13, color: P.textMid }),

    // Digest card
    rect(20, 110, 350, 68, { fill: P.soft, r: 12, stroke: P.border, sw: 1 }),
    t("TODAY'S DIGEST", { x: 32, y: 124, size: 9.5, weight: '700', color: P.textSoft, ls: 1.5 }),
    t('7 changes · 3 AI suggestions · 1 review pending', { x: 32, y: 142, size: 12, color: P.text }),
    t('Tap for AI summary of your specs →', { x: 32, y: 160, size: 11, weight: '600', color: P.accent2 }),

    t('TODAY', { x: 20, y: 194, size: 10, weight: '700', color: P.textSoft, ls: 1.5 }),
    line(32, 210, 32, 560, P.border, 1.5),

    ...events.map((ev, i) => {
      const y = 210 + i * 84;
      return [
        ellipse(32, y + 10, 8, ev.dot),
        t(ev.icon, { x: 27, y: y + 4, size: 10, color: '#fff', weight: '700' }),
        rect(52, y, 310, 72, { fill: P.surface, r: 10, stroke: P.border, sw: 1 }),
        t(ev.title, { x: 64, y: y + 10, size: 10, weight: '700', color: ev.dot, ls: 0.4 }),
        t(ev.time,  { x: 318, y: y + 10, size: 10, color: P.textSoft }),
        t(ev.text,  { x: 64, y: y + 27, size: 12.5, weight: '500', color: P.text, w: 274 }),
        t(ev.sub,   { x: 64, y: y + 48, size: 11, color: P.textMid }),
      ];
    }).flat(),

    t('YESTERDAY', { x: 20, y: 568, size: 10, weight: '700', color: P.textSoft, ls: 1.5 }),
    line(32, 584, 32, 660, P.border, 1.5),
    ...[
      { dot: P.accent3, text: 'S-001 approved by Kai',      sub: 'Sections 01–03', time: 'Yesterday' },
      { dot: P.accent2, text: 'AI regenerated S-003 draft', sub: 'Component Library v2', time: 'Yesterday' },
    ].map((ev, i) => [
      ellipse(32, 593 + i * 42, 6, ev.dot),
      t(ev.text, { x: 50, y: 585 + i * 42, size: 12, color: P.text }),
      t(ev.sub,  { x: 50, y: 601 + i * 42, size: 10.5, color: P.textSoft }),
      t(ev.time, { x: 315, y: 585 + i * 42, size: 10, color: P.textSoft }),
    ]).flat(),

    // Filter chips
    rect(20, 672, 350, 44, { fill: P.surface, r: 22, stroke: P.border, sw: 1 }),
    t('Filter by: ', { x: 36, y: 688, size: 12, color: P.textMid }),
    ...[
      { label: 'All', x: 102, active: true },
      { label: 'AI',  x: 140, active: false },
      { label: 'You', x: 178, active: false },
    ].map(chip => [
      rect(chip.x, 680, chip.label.length * 7 + 16, 24, {
        fill: chip.active ? P.accent : P.surface2, r: 12,
        stroke: chip.active ? 'none' : P.border, sw: 1,
      }),
      t(chip.label, { x: chip.x + 8, y: 688, size: 11, weight: chip.active ? '600' : '400',
        color: chip.active ? '#fff' : P.textMid }),
    ]).flat(),

    ...navBar('stream'),
  ];
  return { id: 'stream', label: 'Stream', width: 390, height: 844, backgroundColor: P.bg, elements: els };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BUILD PEN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const pen = {
  version: '2.8',
  meta: {
    name: 'BRIEF — Living Design Specifications',
    slug: 'brief-specs',
    description: 'AI-native spec tool where design documentation evolves alongside your designs. Inspired by Equals.so\'s AI-first workflow replacement and 108 Supply\'s editorial typography mixing.',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    theme: 'light',
    palette: { bg: P.bg, surface: P.surface, text: P.text, accent: P.accent, accent2: P.accent2 },
    tags: ['productivity', 'design-tools', 'ai', 'specifications', 'light-theme', 'editorial'],
  },
  screens: [ s1(), s2(), s3(), s4(), s5() ],
};

const out = path.join(__dirname, 'brief.pen');
fs.writeFileSync(out, JSON.stringify(pen, null, 2));

console.log('✓  brief.pen written —', pen.screens.length, 'screens');
console.log('   Theme  : LIGHT');
console.log('   Palette: parchment #F7F4EE · terracotta #C4521C · cobalt #3B6EF8 · green #2BAF6A');
pen.screens.forEach(s => {
  console.log(`   · ${s.label.padEnd(12)} ${s.elements.length} elements`);
});
