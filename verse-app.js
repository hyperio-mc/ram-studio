'use strict';
// verse-app.js
// VERSE — Editorial Dark Journaling for Writers
//
// Inspired by:
//   • Linear's "Last Year You Said Next Year" manifesto page — godly.website
//     https://linear.app/change (massive serif type, pure black, editorial confrontation)
//   • Dark Mode Design gallery nominees (darkmodedesign.com) — Midday, Flomodia, Forge
//   • Awwwards nominees Mar 2026 — "Good Fella", "THIBAULT GUIGNAND PORTFOLIO"
//   • Compound: Membership (withcompound.com/membership) — lavender on dark finance

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#0A0A0A',   // near-void black (editorial void)
  surface:  '#131313',   // elevated card surface
  surface2: '#1A1A1A',   // higher surface
  border:   '#242424',   // subtle separator
  border2:  '#2E2E2E',   // slightly stronger
  muted:    '#404040',   // muted chrome
  dim:      '#606060',   // dimmed secondary text
  fg:       '#E8E3D8',   // cream / parchment white (like aged paper in linear serif)
  fg2:      '#9A9487',   // secondary text — warm gray
  amber:    '#C8A96E',   // aged amber — accent / warmth
  lavender: '#8B7CF8',   // soft lavender — AI / prompts (inspired by Compound)
  sage:     '#5B8A6E',   // muted sage green — streak / consistency
  red:      '#E55A4E',   // rare urgency
  paper:    '#F5F0E8',   // warm parchment (used only for display text glow reference)
};

let _id = 0;
const uid = () => `v${++_id}`;

// ── Core primitives ───────────────────────────────────────────────────────────
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

const Line  = (x, y, w, fill = P.border)  => F(x, y, w, 1, fill, {});
const VLine = (x, y, h, fill = P.border)  => F(x, y, 1, h, fill, {});

const Pill = (x, y, text, bg, fg) => {
  const w = text.length * 6 + 18;
  return F(x, y, w, 20, bg, {
    r: 10,
    ch: [T(text, 9, 3, w - 18, 14, { size: 9, fill: fg, weight: 700, ls: 0.6 })],
  });
};

// Horizontal scan-line pattern (editorial dithered effect — like Linear's manifesto)
function ScanLines(x, y, w, h, color, opacity = 0.06) {
  const lines = [];
  for (let i = 0; i < h; i += 4) {
    lines.push(F(x, y + i, w, 1, color, { opacity }));
  }
  return lines;
}

// Word-count dot grid (pixel / year-in-words visualization)
function WordDotGrid(ox, oy, weeks = 26, rows = 7) {
  const cells = [];
  const dotW = 9, dotH = 9, gap = 3;
  const wordCounts = [
    // simulate writing activity — sparse at start, peaks mid-year
    [0,1,2,3,2,1,0], [0,1,3,2,3,2,0], [1,2,3,4,3,2,1], [0,1,2,2,1,0,0],
    [0,0,1,3,2,1,0], [1,2,4,4,3,2,1], [0,1,2,3,4,3,2], [1,3,4,4,4,3,1],
    [0,1,3,3,2,1,0], [0,2,3,4,4,3,2], [1,2,3,4,3,2,1], [0,0,1,2,1,0,0],
    [0,1,2,3,2,1,0], [1,2,4,4,4,3,2], [0,1,2,3,3,2,1], [1,3,4,4,4,3,2],
    [0,1,3,3,3,2,1], [0,2,3,4,4,3,2], [1,2,4,4,3,2,1], [0,1,2,3,2,1,0],
    [1,2,3,4,4,3,2], [0,1,3,3,3,2,1], [1,2,4,4,4,3,1], [0,1,2,3,2,1,0],
    [1,3,4,4,4,4,2], [0,1,2,3,3,2,1],
  ];
  const colorMap = [P.muted, P.border2, P.sage + '66', P.sage + 'AA', P.amber];
  for (let w = 0; w < weeks; w++) {
    for (let r = 0; r < rows; r++) {
      const level = (wordCounts[w] || [])[r] || 0;
      const color = colorMap[Math.min(level, colorMap.length - 1)];
      cells.push(F(ox + w * (dotW + gap), oy + r * (dotH + gap), dotW, dotH, color, { r: 2 }));
    }
  }
  return cells;
}

// Single journal entry row
function EntryRow(x, y, opts) {
  const { date, preview, wordCount, mood, isToday } = opts;
  return F(x, y, 335, 64, isToday ? P.amber + '12' : P.surface, {
    r: 10,
    stroke: isToday ? P.amber + '55' : P.border,
    sw: 1,
    ch: [
      // left accent bar for today
      ...(isToday ? [F(0, 0, 3, 64, P.amber, { r: 2 })] : []),
      // date
      T(date, isToday ? 14 : 12, 10, 80, 12, { size: 9, fill: isToday ? P.amber : P.dim, ls: 0.8, weight: isToday ? 700 : 400 }),
      // preview text
      T(preview, isToday ? 14 : 12, 26, 240, 28, { size: 12, fill: P.fg, lh: 18, weight: isToday ? 500 : 400 }),
      // word count
      T(`${wordCount}w`, 280, 26, 44, 14, { size: 11, fill: mood === 'flow' ? P.amber : P.dim, align: 'right', weight: 600 }),
      // mood indicator
      T(mood === 'flow' ? '◆' : mood === 'good' ? '◇' : '·', 316, 10, 12, 14, { size: 10, fill: mood === 'flow' ? P.amber : P.muted }),
    ],
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — MANIFESTO / ONBOARDING
// Inspired directly by: Linear "Last Year You Said Next Year" (godly.website)
// Pure editorial: huge serif display, scan-line dithering, confrontational copy
// ══════════════════════════════════════════════════════════════════════════════
function screenManifesto(ox) {
  return F(ox, 0, 375, 812, P.bg, { clip: true, ch: [

    // ── ambient glow (warm amber atmosphere top-right) ──
    E(180, -80, 320, 320, P.amber, { opacity: 0.04 }),
    E(-100, 600, 300, 300, P.lavender, { opacity: 0.03 }),

    // ── scan-line dithering on top (editorial texture — Linear manifesto effect) ──
    ...ScanLines(0, 60, 375, 300, P.fg, 0.025),

    // ── small wordmark ──
    T('VERSE', 24, 28, 80, 18, { size: 12, weight: 700, fill: P.fg, ls: 4 }),
    T('◆', 326, 28, 16, 18, { size: 10, fill: P.amber }),

    // ── MASSIVE editorial headline — "You haven't written today." ──
    T('You haven\'t', 24, 72,   320, 60, { size: 50, weight: 900, fill: P.fg,    ls: -2   }),
    T('written',    24, 128,   280, 60, { size: 50, weight: 900, fill: P.fg,    ls: -2   }),
    T('today.',     24, 184,   260, 60, { size: 50, weight: 900, fill: P.amber, ls: -2   }),

    // ── editorial sub copy ──
    T('That thought you had in the shower\nat 7am? Already gone.', 24, 268, 315, 42,
      { size: 16, fill: P.fg2, lh: 26, weight: 400 }),

    // ── divider rule ──
    Line(24, 328, 80, P.amber),

    // ── body copy ──
    T('VERSE gives every day an empty page.\nWrite anything. One sentence. One paragraph.\nThe year you keep not writing ends today.', 24, 344, 315, 60,
      { size: 13, fill: P.fg2, lh: 20, weight: 400 }),

    // ── primary CTA — large, editorial ──
    F(24, 430, 327, 56, P.fg, { r: 4, ch: [
      T('Start writing', 0, 16, 327, 24, { size: 16, weight: 700, fill: P.bg, align: 'center', ls: 0.3 }),
    ]}),

    // ── ghost CTA ──
    F(24, 498, 327, 44, '#00000000', { r: 4, stroke: P.border2, sw: 1, ch: [
      T('I\'ve been here before →', 0, 12, 327, 20, { size: 13, fill: P.fg2, align: 'center' }),
    ]}),

    // ── small print ──
    T('No notifications. No streaks. Just your words.', 24, 560, 327, 16, { size: 11, fill: P.muted, align: 'center', ls: 0.2 }),

    // ── editorial footer detail ──
    T('VERSE 2.0 · MARCH 2026', 24, 680, 327, 14, { size: 9, fill: P.muted, ls: 2, align: 'center', weight: 600 }),

    // ── decorative scan-line band at bottom ──
    ...ScanLines(0, 720, 375, 80, P.fg, 0.02),

  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — TODAY'S PAGE (writing surface)
// A blank editorial page with minimal chrome. Current date as large serif.
// ══════════════════════════════════════════════════════════════════════════════
function screenToday(ox) {
  return F(ox, 0, 375, 812, P.bg, { clip: true, ch: [

    // ── ambient glow ──
    E(200, -60, 200, 200, P.amber, { opacity: 0.03 }),

    // ── status bar ──
    T('9:41', 16, 14, 60, 14, { size: 11, weight: 600, fill: P.fg }),
    T('●●●', 308, 14, 48, 14, { size: 8, fill: P.muted }),

    // ── nav bar ──
    T('VERSE', 20, 38, 80, 18, { size: 12, weight: 700, fill: P.fg, ls: 4 }),
    F(330, 34, 24, 24, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
      T('☰', 5, 4, 14, 16, { size: 10, fill: P.fg2, align: 'center' }),
    ]}),

    Line(0, 64, 375, P.border),

    // ── Today's date — editorial large serif treatment ──
    T('Thursday', 20, 84, 280, 44, { size: 36, weight: 900, fill: P.fg, ls: -1.5 }),
    T('March 19', 20, 126, 200, 28, { size: 22, weight: 400, fill: P.fg2, ls: -0.5 }),

    // ── word count strip ──
    F(0, 162, 375, 28, P.surface, { ch: [
      Line(0, 0, 375, P.border),
      Line(0, 27, 375, P.border),
      T('0 words', 20, 7, 120, 14, { size: 10, fill: P.muted }),
      T('EMPTY PAGE', 240, 7, 115, 14, { size: 9, fill: P.muted, align: 'right', ls: 1.5, weight: 600 }),
    ]}),

    // ── writing prompt (lavender — AI-generated, daily) ──
    F(20, 202, 335, 56, P.lavender + '12', { r: 8, stroke: P.lavender + '33', sw: 1, ch: [
      T('TODAY\'S PROMPT', 14, 10, 200, 10, { size: 8, fill: P.lavender, ls: 1.5, weight: 700 }),
      T('"What did you believe last year\nthat you no longer believe?"', 14, 24, 306, 24,
        { size: 12, fill: P.fg2, lh: 18, weight: 400 }),
    ]}),

    // ── writing area — empty parchment surface ──
    F(20, 272, 335, 356, P.surface, { r: 8, stroke: P.border, sw: 1, ch: [
      // cursor blink simulation
      F(16, 16, 2, 20, P.amber, { r: 1 }),
      // faint ruled lines
      ...Array.from({ length: 12 }, (_, i) =>
        F(12, 40 + i * 26, 310, 1, P.border, { opacity: 0.5 })
      ),
      T('Start typing...', 20, 14, 280, 18, { size: 14, fill: P.muted, weight: 400 }),
    ]}),

    // ── floating action toolbar ──
    F(64, 642, 247, 44, P.surface2, { r: 22, stroke: P.border2, sw: 1, ch: [
      ...[['B', 'bold'], ['/', 'italic'], ['❝', 'quote'], ['—', 'rule'], ['↵', 'break']].map(([icon, _], i) => [
        ...(i > 0 ? [VLine(45 + i * 44, 10, 24, P.border)] : []),
        T(icon, 12 + i * 44, 10, 30, 24, { size: 13, fill: P.fg2, align: 'center', weight: icon === 'B' ? 700 : 400 }),
      ]).flat(),
    ]}),

    // ── bottom nav ──
    F(0, 732, 375, 80, P.surface, { ch: [
      Line(0, 0, 375, P.border),
      ...[['📄','Today',0,true], ['📚','Archive',1,false], ['◆','Year',2,false], ['⚙','Settings',3,false]].map(([icon,label,i,active]) => {
        const nx = 28 + i * 82;
        return [
          F(nx + 10, 8, 44, 44, active ? P.amber + '18' : '#00000000', { r: 22 }),
          T(icon, nx+14, 14, 36, 24, { size: 16, fill: active ? P.amber : P.muted }),
          T(label, nx, 42, 64, 14, { size: 9, fill: active ? P.amber : P.muted, align: 'center', weight: active?700:400 }),
        ];
      }).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — ARCHIVE / ENTRY LIST
// All past entries in a clean editorial list
// ══════════════════════════════════════════════════════════════════════════════
function screenArchive(ox) {
  const entries = [
    { date: 'WEDNESDAY · MAR 18', preview: 'The cursor just sat there. I typed a sentence and deleted it four times before accepting...', wordCount: 312, mood: 'flow', isToday: false },
    { date: 'TUESDAY · MAR 17', preview: 'Woke up and the city was quiet for once. Wrote about the commute that never happened...', wordCount: 88, mood: 'good', isToday: false },
    { date: 'MONDAY · MAR 16', preview: 'Nothing. Not a word. The page won\'t judge you but I will.', wordCount: 0, mood: 'empty', isToday: false },
    { date: 'SUNDAY · MAR 15', preview: 'Long one today. About the version of myself I was trying to become two years ago and how...', wordCount: 847, mood: 'flow', isToday: false },
    { date: 'SATURDAY · MAR 14', preview: 'Short notes. The smell of coffee. Rain against the window. That\'s enough.', wordCount: 143, mood: 'good', isToday: false },
  ];

  return F(ox, 0, 375, 812, P.bg, { clip: true, ch: [

    // ── ambient glow ──
    E(-80, 200, 250, 250, P.amber, { opacity: 0.025 }),

    // ── status bar ──
    T('9:41', 16, 14, 60, 14, { size: 11, weight: 600, fill: P.fg }),
    T('●●●', 308, 14, 48, 14, { size: 8, fill: P.muted }),

    // ── header ──
    T('Archive', 20, 38, 200, 28, { size: 22, weight: 900, fill: P.fg, ls: -0.5 }),
    F(316, 38, 28, 28, P.surface, { r: 8, stroke: P.border, sw: 1, ch: [
      T('⌕', 6, 5, 16, 18, { size: 12, fill: P.fg2 }),
    ]}),

    Line(0, 74, 375, P.border),

    // ── month heading ──
    T('MARCH 2026', 20, 86, 200, 14, { size: 9, fill: P.amber, ls: 2, weight: 700 }),
    T('14 entries · 4,200 words', 220, 86, 135, 14, { size: 9, fill: P.dim, align: 'right', ls: 0.5 }),

    // ── entry list ──
    ...entries.map((e, i) => EntryRow(20, 112 + i * 72, e)),

    // ── streak summary card ──
    F(20, 482, 335, 60, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      VLine(110, 12, 36, P.border),
      VLine(220, 12, 36, P.border),
      T('4', 36, 12, 36, 20, { size: 18, weight: 900, fill: P.sage, align: 'center' }),
      T('DAY STREAK', 18, 36, 72, 10, { size: 8, fill: P.dim, ls: 0.8, align: 'center', weight: 600 }),
      T('847', 148, 12, 36, 20, { size: 18, weight: 900, fill: P.amber, align: 'center' }),
      T('BEST ENTRY', 130, 36, 72, 10, { size: 8, fill: P.dim, ls: 0.8, align: 'center', weight: 600 }),
      T('4.2K', 248, 12, 50, 20, { size: 18, weight: 900, fill: P.fg2, align: 'center' }),
      T('WORDS · MARCH', 226, 36, 80, 10, { size: 8, fill: P.dim, ls: 0.8, align: 'center', weight: 600 }),
    ]}),

    // ── bottom nav ──
    F(0, 732, 375, 80, P.surface, { ch: [
      Line(0, 0, 375, P.border),
      ...[['📄','Today',0,false], ['📚','Archive',1,true], ['◆','Year',2,false], ['⚙','Settings',3,false]].map(([icon,label,i,active]) => {
        const nx = 28 + i * 82;
        return [
          F(nx + 10, 8, 44, 44, active ? P.amber + '18' : '#00000000', { r: 22 }),
          T(icon, nx+14, 14, 36, 24, { size: 16, fill: active ? P.amber : P.muted }),
          T(label, nx, 42, 64, 14, { size: 9, fill: active ? P.amber : P.muted, align: 'center', weight: active?700:400 }),
        ];
      }).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — YEAR IN WORDS (dot grid visualization)
// A pixel/heatmap grid of the entire year — writing consistency at a glance
// Inspired by GitHub contribution graph but with editorial warmth
// ══════════════════════════════════════════════════════════════════════════════
function screenYearView(ox) {
  return F(ox, 0, 375, 812, P.bg, { clip: true, ch: [

    // ── ambient glow ──
    E(100, -50, 280, 280, P.amber, { opacity: 0.035 }),
    E(-60, 700, 200, 200, P.lavender, { opacity: 0.025 }),

    // ── status bar ──
    T('9:41', 16, 14, 60, 14, { size: 11, weight: 600, fill: P.fg }),
    T('●●●', 308, 14, 48, 14, { size: 8, fill: P.muted }),

    // ── header ──
    T('2026', 20, 38, 140, 36, { size: 28, weight: 900, fill: P.fg, ls: -1 }),
    T('in words', 115, 50, 120, 20, { size: 14, fill: P.fg2, weight: 300 }),

    Line(0, 80, 375, P.border),

    // ── month labels (Jan → Jun) ──
    T('JAN', 20, 90, 36, 12, { size: 8, fill: P.dim, ls: 0.8, weight: 600 }),
    T('FEB', 88, 90, 36, 12, { size: 8, fill: P.dim, ls: 0.8, weight: 600 }),
    T('MAR', 156, 90, 36, 12, { size: 8, fill: P.amber, ls: 0.8, weight: 700 }),
    T('APR', 224, 90, 36, 12, { size: 8, fill: P.dim, ls: 0.8, weight: 600 }),
    T('MAY', 292, 90, 36, 12, { size: 8, fill: P.dim, ls: 0.8, weight: 600 }),

    // ── day labels ──
    ...['M','T','W','T','F','S','S'].map((d, i) =>
      T(d, 4, 108 + i * 12, 12, 10, { size: 7, fill: P.muted, align: 'center' })
    ),

    // ── dot grid ──
    ...WordDotGrid(20, 106, 26, 7),

    // ── legend ──
    T('LESS', 20, 198, 36, 10, { size: 7, fill: P.muted }),
    ...[P.muted, P.border2, P.sage + '66', P.sage + 'AA', P.amber].map((c, i) =>
      F(60 + i * 14, 196, 10, 10, c, { r: 2 })
    ),
    T('MORE', 134, 198, 36, 10, { size: 7, fill: P.muted }),

    Line(0, 216, 375, P.border),

    // ── year stats ──
    T('YOUR 2026 SO FAR', 20, 228, 280, 12, { size: 9, fill: P.amber, ls: 2, weight: 700 }),

    F(20, 250, 335, 88, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      VLine(160, 12, 64, P.border),
      T('TOTAL WORDS', 16, 12, 130, 10, { size: 8, fill: P.dim, ls: 1, weight: 600 }),
      T('12,847', 16, 28, 130, 28, { size: 24, weight: 900, fill: P.fg }),
      T('+14% vs 2025 pace', 16, 60, 140, 12, { size: 10, fill: P.sage }),
      T('ACTIVE DAYS', 176, 12, 130, 10, { size: 8, fill: P.dim, ls: 1, weight: 600 }),
      T('38', 176, 28, 100, 28, { size: 24, weight: 900, fill: P.amber }),
      T('of 79 so far', 176, 60, 100, 12, { size: 10, fill: P.fg2 }),
    ]}),

    // ── Monthly breakdown bars ──
    T('BY MONTH', 20, 354, 200, 12, { size: 9, fill: P.dim, ls: 1.5, weight: 600 }),
    F(20, 372, 335, 104, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      ...[
        ['JAN', 3420, 0.4, P.fg2],
        ['FEB', 5180, 0.6, P.fg2],
        ['MAR', 4247, 0.5, P.amber],
      ].map(([month, words, pct, color], i) => [
        T(month, 16, 14 + i * 28, 40, 14, { size: 11, fill: color, weight: month === 'MAR' ? 700 : 400 }),
        F(60, 18 + i * 28, Math.round(220 * pct), 10, color, { r: 3, opacity: month === 'MAR' ? 0.9 : 0.5 }),
        F(60, 18 + i * 28, 220, 10, color, { r: 3, opacity: 0.1 }),
        T(`${words.toLocaleString()}w`, 292, 14 + i * 28, 36, 14, { size: 10, fill: color, align: 'right', weight: 600 }),
      ]).flat(),
    ]}),

    // ── AI reflection card ──
    F(20, 492, 335, 72, P.lavender + '10', { r: 10, stroke: P.lavender + '30', sw: 1, ch: [
      T('◆ VERSE INSIGHT', 14, 12, 200, 10, { size: 8, fill: P.lavender, ls: 1.5, weight: 700 }),
      T('You write 3× more on Sundays. Your longest\nentries always start with a weather observation.\nYour best writing happens after 10pm.', 14, 28, 306, 38,
        { size: 11, fill: P.fg2, lh: 18 }),
    ]}),

    // ── Best entry highlight ──
    F(20, 580, 335, 56, P.surface2, { r: 10, stroke: P.border, sw: 1, ch: [
      T('BEST ENTRY', 14, 10, 160, 10, { size: 8, fill: P.amber, ls: 1.5, weight: 700 }),
      T('"...the version of myself I was trying to become..."', 14, 26, 300, 14, { size: 12, fill: P.fg, weight: 400 }),
      T('Mar 15 · 847 words', 14, 44, 160, 10, { size: 9, fill: P.dim }),
    ]}),

    // ── bottom nav ──
    F(0, 732, 375, 80, P.surface, { ch: [
      Line(0, 0, 375, P.border),
      ...[['📄','Today',0,false], ['📚','Archive',1,false], ['◆','Year',2,true], ['⚙','Settings',3,false]].map(([icon,label,i,active]) => {
        const nx = 28 + i * 82;
        return [
          F(nx + 10, 8, 44, 44, active ? P.amber + '18' : '#00000000', { r: 22 }),
          T(icon, nx+14, 14, 36, 24, { size: 16, fill: active ? P.amber : P.muted }),
          T(label, nx, 42, 64, 14, { size: 9, fill: active ? P.amber : P.muted, align: 'center', weight: active?700:400 }),
        ];
      }).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — READING AN ENTRY (editorial single entry view)
// Typography-first. The writing takes center stage.
// ══════════════════════════════════════════════════════════════════════════════
function screenEntry(ox) {
  return F(ox, 0, 375, 812, P.bg, { clip: true, ch: [

    // ── scan-line texture (editorial magazine feel) ──
    ...ScanLines(0, 0, 375, 100, P.fg, 0.018),

    // ── status bar ──
    T('9:41', 16, 14, 60, 14, { size: 11, weight: 600, fill: P.fg }),
    T('●●●', 308, 14, 48, 14, { size: 8, fill: P.muted }),

    // ── back nav ──
    T('← Archive', 20, 38, 100, 18, { size: 12, fill: P.fg2 }),
    F(312, 34, 28, 28, P.surface, { r: 8, stroke: P.border, sw: 1, ch: [
      T('⋯', 6, 5, 16, 18, { size: 14, fill: P.fg2 }),
    ]}),

    Line(0, 68, 375, P.border),

    // ── editorial date header ──
    T('Sunday', 20, 84, 200, 40, { size: 34, weight: 900, fill: P.fg, ls: -1 }),
    T('March 15, 2026', 20, 126, 200, 20, { size: 14, fill: P.fg2, weight: 300 }),
    T('847 words · 4 min read', 20, 150, 200, 14, { size: 10, fill: P.amber, ls: 0.5, weight: 600 }),

    // ── decorative rule ──
    F(20, 174, 30, 2, P.amber, { r: 1 }),

    // ── entry text ──
    T('The version of myself I was trying to become\ntwo years ago would be confused by who I am\nnow. Not disappointed — confused.', 20, 188, 335, 58,
      { size: 15, fill: P.fg, lh: 26, weight: 400 }),

    T('He was running toward something he could\nname. A title. A number. A city. Now I can\'t\ntell you what I\'m running toward, only that\nI\'m still moving.', 20, 260, 335, 74,
      { size: 15, fill: P.fg, lh: 26, weight: 400 }),

    // ── pull quote — editorial highlight ──
    F(0, 348, 6, 80, P.amber, {}),
    T('"Maybe that\'s the point. Maybe you\nhave to stop being able to see it\nbefore you can actually reach it."', 26, 354, 330, 68,
      { size: 14, fill: P.fg, lh: 24, weight: 300 }),

    T('The coffee went cold. I kept writing.', 20, 442, 335, 20, { size: 15, fill: P.fg2, lh: 26 }),

    Line(20, 476, 335, P.border),

    // ── entry metadata footer ──
    F(20, 490, 335, 60, P.surface, { r: 8, stroke: P.border, sw: 1, ch: [
      VLine(110, 10, 40, P.border),
      VLine(220, 10, 40, P.border),
      T('MOD', 16, 10, 80, 10, { size: 7, fill: P.dim, ls: 1, weight: 600 }),
      T('FLOW', 16, 26, 80, 18, { size: 15, weight: 800, fill: P.amber }),
      T('state', 16, 46, 80, 10, { size: 8, fill: P.dim }),
      T('WORDS', 126, 10, 80, 10, { size: 7, fill: P.dim, ls: 1, weight: 600 }),
      T('847', 126, 26, 80, 18, { size: 15, weight: 800, fill: P.fg }),
      T('this entry', 126, 46, 80, 10, { size: 8, fill: P.dim }),
      T('TIME', 236, 10, 80, 10, { size: 7, fill: P.dim, ls: 1, weight: 600 }),
      T('10:47 pm', 236, 26, 80, 18, { size: 13, weight: 600, fill: P.fg2 }),
      T('written', 236, 46, 80, 10, { size: 8, fill: P.dim }),
    ]}),

    // ── AI reflection ──
    F(20, 566, 335, 52, P.lavender + '10', { r: 8, stroke: P.lavender + '28', sw: 1, ch: [
      T('◆ VERSE REFLECTION', 14, 10, 200, 10, { size: 8, fill: P.lavender, ls: 1.5, weight: 700 }),
      T('This is one of your 5 highest-quality entries.\nYou often write your best work after 10pm on weekends.', 14, 26, 306, 20,
        { size: 11, fill: P.fg2, lh: 16 }),
    ]}),

    // ── nav actions ──
    F(20, 634, 155, 44, P.surface, { r: 8, stroke: P.border, sw: 1, ch: [
      T('← Previous', 0, 12, 155, 20, { size: 12, fill: P.fg2, align: 'center' }),
    ]}),
    F(200, 634, 155, 44, P.surface, { r: 8, stroke: P.border, sw: 1, ch: [
      T('Next →', 0, 12, 155, 20, { size: 12, fill: P.fg2, align: 'center' }),
    ]}),

    // ── bottom nav ──
    F(0, 732, 375, 80, P.surface, { ch: [
      Line(0, 0, 375, P.border),
      ...[['📄','Today',0,false], ['📚','Archive',1,true], ['◆','Year',2,false], ['⚙','Settings',3,false]].map(([icon,label,i,active]) => {
        const nx = 28 + i * 82;
        return [
          F(nx + 10, 8, 44, 44, active ? P.amber + '18' : '#00000000', { r: 22 }),
          T(icon, nx+14, 14, 36, 24, { size: 16, fill: active ? P.amber : P.muted }),
          T(label, nx, 42, 64, 14, { size: 9, fill: active ? P.amber : P.muted, align: 'center', weight: active?700:400 }),
        ];
      }).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// ASSEMBLE .PEN DOC
// ══════════════════════════════════════════════════════════════════════════════
const GAP = 60;
const SW  = 375;

const doc = {
  version: '2.8',
  width:   (SW + GAP) * 5 + GAP,
  height:  812,
  children: [
    screenManifesto(GAP + 0 * (SW + GAP)),
    screenToday    (GAP + 1 * (SW + GAP)),
    screenArchive  (GAP + 2 * (SW + GAP)),
    screenYearView (GAP + 3 * (SW + GAP)),
    screenEntry    (GAP + 4 * (SW + GAP)),
  ],
};

const penPath = path.join(__dirname, 'verse-app.pen');
fs.writeFileSync(penPath, JSON.stringify(doc, null, 2));
console.log('✓ verse-app.pen written');
console.log(`  Screens: ${doc.children.length}`);
console.log(`  Canvas:  ${doc.width} × ${doc.height}`);
console.log(`  File:    ${(fs.statSync(penPath).size / 1024).toFixed(1)} KB`);
