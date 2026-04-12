// quill-app.js — QUILL personal writing & journaling app
// Inspired by: editorial typographic trend on Siteinspire (#2 category, 2,052 sites)
// Specifically: PW Magazine and QP Magazine editorial grid layouts
// Theme: LIGHT — warm paper (#FAF7F0), dark ink (#1C1714), copper accent (#B5742A)

const fs = require('fs');
const path = require('path');

const SLUG = 'quill';
const APP_NAME = 'QUILL';
const TAGLINE = 'Write every day. Keep what matters.';

const BG        = '#FAF7F0';
const SURFACE   = '#FFFFFF';
const SURFACE2  = '#F5F0E8';
const TEXT      = '#1C1714';
const TEXT_MUTE = 'rgba(28,23,20,0.45)';
const ACCENT    = '#B5742A';
const ACCENT2   = '#7C5C3B';
const BORDER    = 'rgba(28,23,20,0.10)';

const SERIF = '"Georgia", "Times New Roman", serif';
const SANS  = '"Inter", "Helvetica Neue", sans-serif';

function pen(screens) {
  return {
    version: '2.8',
    meta: {
      name: APP_NAME,
      slug: SLUG,
      tagline: TAGLINE,
      theme: 'light',
      created: new Date().toISOString(),
      designer: 'RAM Design Heartbeat',
      inspiration: 'Siteinspire editorial typographic trend — PW Magazine, QP Magazine grid layouts',
    },
    palette: { bg: BG, surface: SURFACE, text: TEXT, accent: ACCENT, accent2: ACCENT2, muted: TEXT_MUTE },
    screens,
  };
}

// ── Screen 1: Home / Today ─────────────────────────────────────────────────
const screenHome = {
  id: 'home',
  label: 'Today',
  bg: BG,
  statusBar: { style: 'dark', time: '9:14', bg: BG },
  elements: [
    { type: 'text', text: 'QUILL', font: SERIF, size: 28, weight: '700', fill: TEXT, x: 24, y: 58, tracking: 0.12, style: 'italic' },
    { type: 'text', text: 'Friday, April 4', font: SANS, size: 12, fill: TEXT_MUTE, x: 24, y: 92, tracking: 0.06 },
    { type: 'circle', cx: 351, cy: 70, r: 20, fill: SURFACE2, stroke: BORDER, strokeWidth: 1 },
    { type: 'text', text: 'R', font: SERIF, size: 16, weight: '600', fill: ACCENT, x: 345, y: 62 },
    { type: 'rect', x: 24, y: 110, w: 327, h: 2, fill: TEXT },
    { type: 'rect', x: 24, y: 115, w: 327, h: 1, fill: TEXT },
    { type: 'text', text: "TODAY'S PROMPT", font: SANS, size: 9, weight: '700', fill: TEXT_MUTE, x: 24, y: 132, tracking: 0.12 },
    { type: 'rect', x: 24, y: 144, w: 327, h: 88, r: 4, fill: SURFACE2, stroke: BORDER, strokeWidth: 1 },
    { type: 'text', text: '"What did you notice today\nthat you almost missed?"', font: SERIF, size: 17, fill: TEXT, x: 36, y: 161, lineHeight: 1.5, style: 'italic', maxWidth: 303 },
    { type: 'text', text: 'Prompt #312 · Observation', font: SANS, size: 10, fill: TEXT_MUTE, x: 36, y: 218 },
    { type: 'rect', x: 24, y: 248, w: 327, h: 48, r: 4, fill: TEXT },
    { type: 'text', text: 'Start Writing  →', font: SANS, size: 15, weight: '600', fill: '#FAF7F0', x: 130, y: 268, tracking: 0.02 },
    { type: 'rect', x: 24, y: 316, w: 327, h: 1, fill: BORDER },
    { type: 'text', text: 'YOUR WEEK', font: SANS, size: 9, weight: '700', fill: TEXT_MUTE, x: 24, y: 330, tracking: 0.12 },
    ...['M','T','W','T','F','S','S'].map((d, i) => {
      const x = 24 + i * 48;
      const filled = i < 5;
      const isToday = i === 4;
      return [
        { type: 'rect', x, y: 345, w: 40, h: 40, r: 3, fill: isToday ? ACCENT : filled ? SURFACE2 : '#EEE9DF', stroke: isToday ? ACCENT : BORDER, strokeWidth: isToday ? 0 : 1 },
        { type: 'text', text: d, font: SANS, size: 11, weight: isToday ? '700' : '400', fill: isToday ? '#FFFFFF' : filled ? TEXT : TEXT_MUTE, x: x + 14, y: 361 },
      ];
    }).flat(),
    { type: 'rect', x: 264, y: 345, w: 87, h: 40, r: 3, fill: ACCENT + '18', stroke: ACCENT + '40', strokeWidth: 1 },
    { type: 'text', text: '14', font: SERIF, size: 20, weight: '700', fill: ACCENT, x: 285, y: 358, style: 'italic' },
    { type: 'text', text: 'day streak', font: SANS, size: 9, fill: ACCENT2, x: 280, y: 375 },
    { type: 'rect', x: 24, y: 402, w: 327, h: 1, fill: BORDER },
    { type: 'text', text: 'RECENT ENTRIES', font: SANS, size: 9, weight: '700', fill: TEXT_MUTE, x: 24, y: 416, tracking: 0.12 },
    { type: 'rect', x: 24, y: 430, w: 327, h: 72, r: 4, fill: SURFACE, stroke: BORDER, strokeWidth: 1 },
    { type: 'text', text: 'The coffee shop on Third', font: SERIF, size: 15, fill: TEXT, x: 36, y: 448, style: 'italic' },
    { type: 'text', text: 'Apr 3 · 247 words · 8 min read', font: SANS, size: 10, fill: TEXT_MUTE, x: 36, y: 466 },
    { type: 'text', text: 'A man in a yellow hat reading...', font: SANS, size: 11, fill: TEXT_MUTE, x: 36, y: 483 },
    { type: 'rect', x: 24, y: 512, w: 327, h: 72, r: 4, fill: SURFACE, stroke: BORDER, strokeWidth: 1 },
    { type: 'text', text: 'On forgetting names', font: SERIF, size: 15, fill: TEXT, x: 36, y: 530, style: 'italic' },
    { type: 'text', text: 'Apr 2 · 412 words · 12 min read', font: SANS, size: 10, fill: TEXT_MUTE, x: 36, y: 548 },
    { type: 'text', text: 'Memory is selective, but...', font: SANS, size: 11, fill: TEXT_MUTE, x: 36, y: 565 },
    { type: 'rect', x: 0, y: 720, w: 375, h: 1, fill: BORDER },
    { type: 'rect', x: 0, y: 721, w: 375, h: 75, fill: BG },
    ...[ { label: '▦', sub: 'Today', x: 40, active: true }, { label: '✎', sub: 'Write', x: 120, active: false }, { label: '⊞', sub: 'Library', x: 195, active: false }, { label: '∿', sub: 'Insights', x: 272, active: false }, { label: '◎', sub: 'Profile', x: 345, active: false } ].map(n => ([ { type: 'text', text: n.label, font: SANS, size: 20, fill: n.active ? ACCENT : TEXT_MUTE, x: n.x, y: 741 }, { type: 'text', text: n.sub, font: SANS, size: 9, fill: n.active ? ACCENT : TEXT_MUTE, x: n.x - 6, y: 762, weight: n.active ? '600' : '400' } ])).flat(),
  ],
};

// ── Screen 2: Write (editor) ────────────────────────────────────────────────
const screenWrite = {
  id: 'write',
  label: 'Write',
  bg: BG,
  statusBar: { style: 'dark', time: '9:22', bg: BG },
  elements: [
    { type: 'text', text: '←', font: SANS, size: 20, fill: TEXT, x: 24, y: 60 },
    { type: 'text', text: 'New Entry', font: SANS, size: 13, weight: '600', fill: TEXT, x: 150, y: 62, tracking: 0.04 },
    { type: 'text', text: 'Done', font: SANS, size: 14, weight: '600', fill: ACCENT, x: 328, y: 62 },
    { type: 'rect', x: 0, y: 80, w: 375, h: 1, fill: BORDER },
    { type: 'text', text: 'Friday, April 4, 2026', font: SANS, size: 11, fill: TEXT_MUTE, x: 24, y: 100 },
    { type: 'rect', x: 200, y: 90, w: 94, h: 22, r: 3, fill: ACCENT + '18', stroke: ACCENT + '40', strokeWidth: 1 },
    { type: 'text', text: 'OBSERVATION', font: SANS, size: 8, weight: '700', fill: ACCENT, x: 210, y: 104, tracking: 0.08 },
    { type: 'text', text: 'What I almost\nmissed today', font: SERIF, size: 30, weight: '700', fill: TEXT, x: 24, y: 130, lineHeight: 1.3, style: 'italic', maxWidth: 327 },
    { type: 'rect', x: 24, y: 200, w: 327, h: 1, fill: BORDER },
    { type: 'text', text: 'There was a moment this morning, between the second\nalarm and the first coffee, where everything was\nperfectly still. The window was fogged and a single\ndrop ran down the glass in that unhurried way —\nthe same way a thought sometimes arrives.', font: SERIF, size: 16, fill: TEXT, x: 24, y: 220, lineHeight: 1.75, maxWidth: 327 },
    { type: 'rect', x: 24, y: 368, w: 2, h: 20, fill: ACCENT },
    { type: 'rect', x: 0, y: 700, w: 375, h: 1, fill: BORDER },
    { type: 'rect', x: 0, y: 701, w: 375, h: 44, fill: SURFACE },
    { type: 'text', text: '87 words', font: SANS, size: 11, fill: TEXT_MUTE, x: 24, y: 722 },
    { type: 'text', text: 'B', font: SERIF, size: 16, weight: '700', fill: TEXT, x: 195, y: 722 },
    { type: 'text', text: 'I', font: SERIF, size: 16, style: 'italic', fill: TEXT, x: 220, y: 722 },
    { type: 'text', text: '"…"', font: SERIF, size: 14, fill: TEXT, x: 244, y: 722 },
    { type: 'text', text: '—', font: SANS, size: 16, fill: TEXT, x: 278, y: 722 },
    { type: 'text', text: '⌨', font: SANS, size: 16, fill: TEXT_MUTE, x: 336, y: 722 },
  ],
};

// ── Screen 3: Library ───────────────────────────────────────────────────────
const screenLibrary = {
  id: 'library',
  label: 'Library',
  bg: BG,
  statusBar: { style: 'dark', time: '9:31', bg: BG },
  elements: [
    { type: 'text', text: 'Library', font: SERIF, size: 28, weight: '700', fill: TEXT, x: 24, y: 62, style: 'italic' },
    { type: 'text', text: '84 entries · 32,481 words', font: SANS, size: 11, fill: TEXT_MUTE, x: 24, y: 92 },
    { type: 'rect', x: 24, y: 106, w: 327, h: 40, r: 4, fill: SURFACE2, stroke: BORDER, strokeWidth: 1 },
    { type: 'text', text: '⌕  Search entries…', font: SANS, size: 13, fill: TEXT_MUTE, x: 40, y: 124 },
    { type: 'rect', x: 24, y: 160, w: 327, h: 2, fill: TEXT },
    { type: 'rect', x: 24, y: 165, w: 327, h: 1, fill: TEXT },
    ...['All', 'Observation', 'Reflection', 'Story', 'Dream'].map((f, i) => {
      const filled = i === 0;
      const xs = [24, 62, 159, 250, 314];
      const ws = [28, 107, 101, 74, 72];
      return [
        { type: 'rect', x: xs[i], y: 177, w: ws[i], h: 26, r: 13, fill: filled ? TEXT : 'transparent', stroke: filled ? TEXT : BORDER, strokeWidth: 1 },
        { type: 'text', text: f, font: SANS, size: 11, fill: filled ? BG : TEXT_MUTE, x: xs[i] + 8, y: 192, weight: filled ? '600' : '400' },
      ];
    }).flat(),
    // 2-col grid of entry cards
    { type: 'rect', x: 24, y: 220, w: 156, h: 170, r: 4, fill: SURFACE, stroke: BORDER, strokeWidth: 1 },
    { type: 'rect', x: 24, y: 220, w: 156, h: 58, r: 4, fill: ACCENT + '15' },
    { type: 'text', text: 'APR', font: SANS, size: 9, weight: '700', fill: ACCENT, x: 36, y: 240, tracking: 0.1 },
    { type: 'text', text: '04', font: SERIF, size: 26, weight: '700', fill: ACCENT, x: 36, y: 258, style: 'italic' },
    { type: 'text', text: 'What I almost\nmissed today', font: SERIF, size: 14, fill: TEXT, x: 36, y: 292, lineHeight: 1.4, style: 'italic' },
    { type: 'text', text: '87 words', font: SANS, size: 10, fill: TEXT_MUTE, x: 36, y: 370 },
    { type: 'rect', x: 195, y: 220, w: 156, h: 170, r: 4, fill: SURFACE, stroke: BORDER, strokeWidth: 1 },
    { type: 'rect', x: 195, y: 220, w: 156, h: 58, r: 4, fill: TEXT + '10' },
    { type: 'text', text: 'APR', font: SANS, size: 9, weight: '700', fill: TEXT_MUTE, x: 207, y: 240, tracking: 0.1 },
    { type: 'text', text: '03', font: SERIF, size: 26, weight: '700', fill: TEXT, x: 207, y: 258, style: 'italic' },
    { type: 'text', text: 'The coffee\nshop on Third', font: SERIF, size: 14, fill: TEXT, x: 207, y: 292, lineHeight: 1.4, style: 'italic' },
    { type: 'text', text: '247 words', font: SANS, size: 10, fill: TEXT_MUTE, x: 207, y: 370 },
    { type: 'rect', x: 24, y: 402, w: 156, h: 170, r: 4, fill: SURFACE, stroke: BORDER, strokeWidth: 1 },
    { type: 'rect', x: 24, y: 402, w: 156, h: 58, r: 4, fill: ACCENT2 + '20' },
    { type: 'text', text: 'APR', font: SANS, size: 9, weight: '700', fill: ACCENT2, x: 36, y: 422, tracking: 0.1 },
    { type: 'text', text: '02', font: SERIF, size: 26, weight: '700', fill: ACCENT2, x: 36, y: 440, style: 'italic' },
    { type: 'text', text: 'On forgetting\nnames', font: SERIF, size: 14, fill: TEXT, x: 36, y: 474, lineHeight: 1.4, style: 'italic' },
    { type: 'text', text: '412 words', font: SANS, size: 10, fill: TEXT_MUTE, x: 36, y: 552 },
    { type: 'rect', x: 195, y: 402, w: 156, h: 170, r: 4, fill: SURFACE, stroke: BORDER, strokeWidth: 1 },
    { type: 'rect', x: 195, y: 402, w: 156, h: 58, r: 4, fill: TEXT + '08' },
    { type: 'text', text: 'APR', font: SANS, size: 9, weight: '700', fill: TEXT_MUTE, x: 207, y: 422, tracking: 0.1 },
    { type: 'text', text: '01', font: SERIF, size: 26, weight: '700', fill: TEXT, x: 207, y: 440, style: 'italic' },
    { type: 'text', text: 'The lamp\nthat went out', font: SERIF, size: 14, fill: TEXT, x: 207, y: 474, lineHeight: 1.4, style: 'italic' },
    { type: 'text', text: '156 words', font: SANS, size: 10, fill: TEXT_MUTE, x: 207, y: 552 },
    { type: 'rect', x: 0, y: 720, w: 375, h: 1, fill: BORDER },
    { type: 'rect', x: 0, y: 721, w: 375, h: 75, fill: BG },
    ...[ { label: '▦', sub: 'Today', x: 40, active: false }, { label: '✎', sub: 'Write', x: 120, active: false }, { label: '⊞', sub: 'Library', x: 195, active: true }, { label: '∿', sub: 'Insights', x: 272, active: false }, { label: '◎', sub: 'Profile', x: 345, active: false } ].map(n => ([ { type: 'text', text: n.label, font: SANS, size: 20, fill: n.active ? ACCENT : TEXT_MUTE, x: n.x, y: 741 }, { type: 'text', text: n.sub, font: SANS, size: 9, fill: n.active ? ACCENT : TEXT_MUTE, x: n.x - 6, y: 762, weight: n.active ? '600' : '400' } ])).flat(),
  ],
};

// ── Screen 4: Insights ──────────────────────────────────────────────────────
const screenInsights = {
  id: 'insights',
  label: 'Insights',
  bg: BG,
  statusBar: { style: 'dark', time: '9:44', bg: BG },
  elements: [
    { type: 'text', text: 'Insights', font: SERIF, size: 28, weight: '700', fill: TEXT, x: 24, y: 62, style: 'italic' },
    { type: 'text', text: 'April 2026 · 14-day streak', font: SANS, size: 11, fill: TEXT_MUTE, x: 24, y: 92 },
    { type: 'rect', x: 24, y: 108, w: 327, h: 2, fill: TEXT },
    { type: 'rect', x: 24, y: 113, w: 327, h: 1, fill: TEXT },
    { type: 'text', text: 'THIS MONTH', font: SANS, size: 9, weight: '700', fill: TEXT_MUTE, x: 24, y: 130, tracking: 0.12 },
    ...[ { val: '18', label: 'entries', x: 24 }, { val: '7.2K', label: 'words', x: 130 }, { val: '24m', label: 'avg time', x: 240 } ].map(s => [
      { type: 'text', text: s.val, font: SERIF, size: 34, weight: '700', fill: TEXT, x: s.x, y: 168, style: 'italic' },
      { type: 'text', text: s.label, font: SANS, size: 10, fill: TEXT_MUTE, x: s.x, y: 185 },
    ]).flat(),
    { type: 'rect', x: 118, y: 140, w: 1, h: 50, fill: BORDER },
    { type: 'rect', x: 228, y: 140, w: 1, h: 50, fill: BORDER },
    { type: 'rect', x: 24, y: 205, w: 327, h: 1, fill: BORDER },
    { type: 'text', text: 'WRITING DAYS', font: SANS, size: 9, weight: '700', fill: TEXT_MUTE, x: 24, y: 220, tracking: 0.12 },
    ...[...Array(35)].map((_, i) => {
      const day = i - 1;
      const inMonth = day >= 0 && day < 30;
      const hasEntry = inMonth && [0,1,2,3,6,7,8,9,10,13,14,15,16,20,21].includes(day);
      const isToday = day === 3;
      const col = i % 7;
      const row = Math.floor(i / 7);
      return { type: 'rect', x: 24 + col * 47, y: 232 + row * 34, w: 38, h: 26, r: 3, fill: isToday ? ACCENT : hasEntry ? ACCENT + '40' : inMonth ? '#EEE9DF' : BORDER };
    }),
    { type: 'rect', x: 24, y: 408, w: 327, h: 1, fill: BORDER },
    { type: 'text', text: 'TOP THEMES', font: SANS, size: 9, weight: '700', fill: TEXT_MUTE, x: 24, y: 422, tracking: 0.12 },
    ...[ { label: 'Observation', pct: 82, n: 15 }, { label: 'Reflection', pct: 61, n: 11 }, { label: 'Story', pct: 44, n: 8 }, { label: 'Memory', pct: 28, n: 5 } ].map((t, i) => {
      const y = 436 + i * 38;
      return [
        { type: 'text', text: t.label, font: SANS, size: 12, fill: TEXT, x: 24, y: y + 12 },
        { type: 'text', text: String(t.n), font: SERIF, size: 13, fill: TEXT_MUTE, x: 340, y: y + 12, style: 'italic' },
        { type: 'rect', x: 24, y: y + 18, w: 327, h: 6, r: 3, fill: '#EEE9DF' },
        { type: 'rect', x: 24, y: y + 18, w: Math.round(327 * t.pct / 100), h: 6, r: 3, fill: ACCENT },
      ];
    }).flat(),
    { type: 'rect', x: 0, y: 720, w: 375, h: 1, fill: BORDER },
    { type: 'rect', x: 0, y: 721, w: 375, h: 75, fill: BG },
    ...[ { label: '▦', sub: 'Today', x: 40, active: false }, { label: '✎', sub: 'Write', x: 120, active: false }, { label: '⊞', sub: 'Library', x: 195, active: false }, { label: '∿', sub: 'Insights', x: 272, active: true }, { label: '◎', sub: 'Profile', x: 345, active: false } ].map(n => ([ { type: 'text', text: n.label, font: SANS, size: 20, fill: n.active ? ACCENT : TEXT_MUTE, x: n.x, y: 741 }, { type: 'text', text: n.sub, font: SANS, size: 9, fill: n.active ? ACCENT : TEXT_MUTE, x: n.x - 6, y: 762, weight: n.active ? '600' : '400' } ])).flat(),
  ],
};

// ── Screen 5: Entry Detail ──────────────────────────────────────────────────
const screenDetail = {
  id: 'detail',
  label: 'Entry',
  bg: BG,
  statusBar: { style: 'dark', time: '9:52', bg: BG },
  elements: [
    { type: 'text', text: '←', font: SANS, size: 20, fill: TEXT, x: 24, y: 60 },
    { type: 'text', text: '…', font: SANS, size: 22, fill: TEXT, x: 343, y: 58 },
    { type: 'rect', x: 24, y: 80, w: 327, h: 2, fill: TEXT },
    { type: 'rect', x: 24, y: 85, w: 327, h: 1, fill: TEXT },
    { type: 'text', text: 'Thursday, April 3, 2026  ·  OBSERVATION  ·  247 words', font: SANS, size: 9, fill: TEXT_MUTE, x: 24, y: 100, tracking: 0.06 },
    { type: 'text', text: 'The coffee\nshop on Third', font: SERIF, size: 34, weight: '700', fill: TEXT, x: 24, y: 122, lineHeight: 1.2, style: 'italic', maxWidth: 327 },
    { type: 'rect', x: 24, y: 200, w: 327, h: 1, fill: BORDER },
    { type: 'text', text: 'A man in a yellow hat was reading a newspaper —\nan actual newspaper, folded in half the way they do\n— and the sound of the pages turning was audible\nover the espresso machine.', font: SERIF, size: 16, fill: TEXT, x: 24, y: 218, lineHeight: 1.75, maxWidth: 327 },
    { type: 'text', text: 'Nobody does that anymore. There was something\nstrange and slightly ceremonial about it, like\nwatching someone perform a ritual that has\nlost its audience.', font: SERIF, size: 16, fill: TEXT, x: 24, y: 348, lineHeight: 1.75, maxWidth: 327 },
    { type: 'rect', x: 24, y: 474, w: 4, h: 60, fill: ACCENT },
    { type: 'text', text: '"A ritual that has\nlost its audience."', font: SERIF, size: 17, fill: ACCENT2, x: 42, y: 480, lineHeight: 1.5, style: 'italic' },
    { type: 'text', text: '∎', font: SERIF, size: 16, fill: TEXT_MUTE, x: 24, y: 550 },
    { type: 'rect', x: 0, y: 700, w: 375, h: 1, fill: BORDER },
    { type: 'rect', x: 0, y: 701, w: 375, h: 50, fill: BG },
    { type: 'text', text: '8 min read  ·  Apr 3, 09:14', font: SANS, size: 11, fill: TEXT_MUTE, x: 24, y: 724 },
    { type: 'rect', x: 288, y: 706, w: 63, h: 34, r: 4, fill: TEXT },
    { type: 'text', text: 'Edit', font: SANS, size: 13, weight: '600', fill: BG, x: 307, y: 724 },
  ],
};

const design = pen([screenHome, screenWrite, screenLibrary, screenInsights, screenDetail]);
const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(design, null, 2));
console.log(`✓ ${outPath} written (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
