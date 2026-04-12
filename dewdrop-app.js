/**
 * DEWDROP — daily mood & micro-journal for emotional intelligence
 * Light editorial theme: cream whites, sage green, warm coral
 * Inspired by:
 *   - "Voy: Your Proactive Companion for Healthy Living" (17♥ on land-book)
 *   - "Dawn" health/fitness app from Lapa Ninja
 *   - Litbix (book tracker, minimal.gallery) — type-as-UI, no card shadows
 * Style: Swiss editorial — large numerals as data, line separators only, zero card chrome
 */

const fs = require('fs');
const path = require('path');

// ─── Palette ───────────────────────────────────────────────────────────────
const C = {
  bg:       '#F9F6F1',   // warm cream
  surface:  '#EDE9E0',   // warm parchment
  ink:      '#1A1817',   // near-black
  sage:     '#7B9E87',   // sage green accent
  coral:    '#D4856A',   // warm coral accent 2
  lavender: '#9B8FB5',   // soft lavender for calm
  amber:    '#D4A853',   // warm amber for energy
  divider:  '#D5D0C6',   // very light warm gray
  muted:    'rgba(26,24,23,0.38)',
  mutedMed: 'rgba(26,24,23,0.55)',
  sageBg:   'rgba(123,158,135,0.12)',
  coralBg:  'rgba(212,133,106,0.12)',
  lavBg:    'rgba(155,143,181,0.12)',
  amberBg:  'rgba(212,168,83,0.12)',
  white:    '#FFFFFF',
};

// ─── ID generator ──────────────────────────────────────────────────────────
let idCounter = 1000;
function uid() {
  idCounter++;
  return `dw${idCounter.toString(36)}`;
}

// ─── Primitive builders ────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return {
    id: uid(), type: 'rectangle',
    x, y, width: w, height: h, fill,
    cornerRadius: opts.r ?? 0,
    opacity: opts.opacity ?? 1,
    ...(opts.stroke ? { stroke: opts.stroke, strokeWidth: opts.strokeWidth ?? 1 } : {}),
  };
}

function text(x, y, content, fontSize, color, opts = {}) {
  return {
    id: uid(), type: 'text',
    x, y, content: String(content),
    fontSize,
    fontWeight: opts.weight ?? 400,
    fontFamily: opts.family ?? 'Inter',
    fill: color,
    width: opts.width ?? 358,
    letterSpacing: opts.ls ?? 0,
    opacity: opts.opacity ?? 1,
    textAlign: opts.align ?? 'left',
    lineHeight: opts.lh ?? undefined,
  };
}

function line(x, y, w, color) {
  return rect(x, y, w, 1, color);
}

function circle(x, y, r, fill) {
  return { id: uid(), type: 'ellipse', x, y, width: r*2, height: r*2, fill };
}

// ─── Shared components ─────────────────────────────────────────────────────
function statusBar(bg = C.bg) {
  return [
    rect(0, 0, 390, 44, bg),
    text(16, 14, '9:41', 15, C.ink, { weight: 500, width: 60 }),
    text(0, 14, '●●●●○  WiFi  ▮▮▮▮', 12, C.ink, { align: 'right', width: 374, opacity: 0.4 }),
  ];
}

function bottomNav(active) {
  // active: 'today' | 'log' | 'patterns' | 'journal' | 'insights'
  const items = [
    { id: 'today',    label: 'Today',    icon: '◎' },
    { id: 'log',      label: 'Log',      icon: '+' },
    { id: 'patterns', label: 'Patterns', icon: '≋' },
    { id: 'journal',  label: 'Journal',  icon: '❧' },
    { id: 'insights', label: 'Insights', icon: '✦' },
  ];
  const navBg = rect(0, 784, 390, 60, C.bg);
  const navLine = line(0, 784, 390, C.divider);
  const elements = [navBg, navLine];
  items.forEach((item, i) => {
    const xCenter = 39 + i * 78;
    const isActive = item.id === active;
    const color = isActive ? C.sage : C.muted;
    elements.push(
      text(xCenter - 16, 794, item.icon, isActive ? 20 : 18, color,
        { weight: isActive ? 600 : 400, width: 32, align: 'center' }),
      text(xCenter - 20, 818, item.label, 10, color,
        { weight: isActive ? 600 : 400, width: 40, align: 'center', ls: 0.3 }),
    );
    if (isActive) {
      elements.push(rect(xCenter - 16, 780, 32, 3, C.sage, { r: 2 }));
    }
  });
  return elements;
}

// ─── SCREEN 1: Today ───────────────────────────────────────────────────────
function screenToday() {
  const els = [
    rect(0, 0, 390, 844, C.bg),
    ...statusBar(),

    // Greeting
    text(20, 58, 'Good morning', 13, C.muted, { weight: 400, ls: 0.5 }),
    text(20, 76, 'Rakis', 26, C.ink, { weight: 700, width: 200 }),

    // Date
    text(20, 112, 'Wednesday · March 25', 13, C.muted, { weight: 400, ls: 0.2 }),

    // Divider
    line(20, 136, 350, C.divider),

    // HERO — large mood number
    text(20, 152, '7', 120, C.ink, { weight: 700, width: 150, family: 'Georgia' }),
    text(134, 200, '/ 10', 22, C.muted, { weight: 300, width: 80 }),
    text(20, 278, 'Feeling good today ✦', 16, C.sage, { weight: 600, ls: 0.2 }),

    // Emotion tags
    rect(20, 306, 72, 28, C.sageBg, { r: 14 }),
    text(26, 313, 'Calm', 12, C.sage, { weight: 600, width: 60, ls: 0.3 }),

    rect(100, 306, 82, 28, C.coralBg, { r: 14 }),
    text(108, 313, 'Focused', 12, C.coral, { weight: 600, width: 70, ls: 0.3 }),

    rect(190, 306, 80, 28, C.amberBg, { r: 14 }),
    text(198, 313, 'Rested', 12, C.amber, { weight: 600, width: 66, ls: 0.3 }),

    // Divider
    line(20, 348, 350, C.divider),

    // Week rhythm strip
    text(20, 362, 'THIS WEEK', 10, C.muted, { weight: 700, ls: 1.5, width: 200 }),

    // 7-day heat dots
    ...['M','T','W','T','F','S','S'].map((day, i) => {
      const scores = [5, 6, 8, 7, null, null, null];
      const score = scores[i];
      const xPos = 20 + i * 50;
      const dotColor = score === null ? C.surface
        : score >= 8 ? C.sage
        : score >= 6 ? C.amber
        : C.coral;
      const els2 = [
        text(xPos, 382, day, 10, C.muted, { weight: 600, width: 30, align: 'center' }),
        rect(xPos, 396, 30, 30, dotColor, { r: 15 }),
      ];
      if (score) els2.push(
        text(xPos, 403, String(score), 12, i === 2 ? C.white : C.ink, { weight: 700, width: 30, align: 'center' })
      );
      return els2;
    }).flat(),

    // Streak
    rect(20, 440, 350, 52, C.sageBg, { r: 12 }),
    text(40, 456, '🔥', 20, C.ink, { width: 30 }),
    text(74, 454, '3-day streak', 14, C.ink, { weight: 600, width: 200 }),
    text(74, 472, 'Keep going — you\'re building a habit', 12, C.muted, { weight: 400, width: 240 }),
    text(316, 456, '→', 18, C.sage, { weight: 400, width: 24 }),

    // Divider
    line(20, 506, 350, C.divider),

    // Last check-in
    text(20, 520, 'LAST CHECK-IN', 10, C.muted, { weight: 700, ls: 1.5, width: 200 }),
    text(20, 538, 'Yesterday at 9:30 PM', 13, C.ink, { weight: 400 }),
    rect(20, 558, 350, 60, C.surface, { r: 12 }),
    text(36, 570, '"Felt a bit tired after the long calls but the sunset walk helped a lot."', 12, C.ink, { weight: 400, width: 300, lh: 1.5 }),
    circle(336, 575, 10, C.amber),
    text(331, 578, '6', 10, C.ink, { weight: 700, width: 20, align: 'center' }),

    // CTA button
    rect(20, 730, 350, 48, C.ink, { r: 24 }),
    text(20, 746, 'Log today\'s mood', 15, C.white, { weight: 600, align: 'center', width: 350 }),

    ...bottomNav('today'),
  ];
  return { id: uid(), type: 'frame', name: 'Today', x: 0, y: 0, width: 390, height: 844, fill: C.bg, clip: true, children: els };
}

// ─── SCREEN 2: Log Mood ────────────────────────────────────────────────────
function screenLog() {
  const els = [
    rect(0, 0, 390, 844, C.bg),
    ...statusBar(),

    // Header
    text(20, 58, 'LOG MOOD', 10, C.muted, { weight: 700, ls: 2, width: 200 }),
    text(20, 76, 'How are you feeling?', 24, C.ink, { weight: 700, width: 280 }),

    line(20, 116, 350, C.divider),

    // Large mood selector
    text(20, 128, 'INTENSITY', 10, C.muted, { weight: 700, ls: 1.5, width: 200 }),

    // Number strip 1-10
    ...[1,2,3,4,5,6,7,8,9,10].map((n, i) => {
      const xPos = 14 + i * 37;
      const isSelected = n === 7;
      const fill = isSelected ? C.ink : 'transparent';
      const textColor = isSelected ? C.white : (n < 5 ? C.coral : n > 7 ? C.sage : C.mutedMed);
      return [
        rect(xPos, 144, 33, 44, fill, { r: 8 }),
        text(xPos, 153, String(n), 20, textColor, { weight: isSelected ? 700 : 400, width: 33, align: 'center' }),
      ];
    }).flat(),

    // Scale labels
    text(14, 194, 'Low', 10, C.muted, { weight: 500, width: 60 }),
    text(20, 194, 'High', 10, C.muted, { weight: 500, align: 'right', width: 350 }),

    line(20, 210, 350, C.divider),

    // Emotion palette
    text(20, 224, 'EMOTIONS', 10, C.muted, { weight: 700, ls: 1.5, width: 200 }),

    // Row 1 of emotions
    ...[
      { label: 'Calm', fill: C.sageBg, text: C.sage },
      { label: 'Energized', fill: C.amberBg, text: C.amber },
      { label: 'Joyful', fill: 'rgba(212,133,106,0.15)', text: C.coral },
      { label: 'Focused', fill: C.sageBg, text: C.sage },
    ].map((e, i) => {
      const xPos = 20 + (i % 2) * 180;
      const yPos = 242 + Math.floor(i / 2) * 40;
      const isSelected = e.label === 'Calm' || e.label === 'Focused';
      return [
        rect(xPos, yPos, 160, 30, isSelected ? C.sage : e.fill, { r: 15 }),
        text(xPos, yPos + 8, (isSelected ? '✓ ' : '') + e.label, 13, isSelected ? C.white : e.text,
          { weight: 600, width: 160, align: 'center' }),
      ];
    }).flat(),

    ...[
      { label: 'Anxious', fill: C.coralBg, text: C.coral },
      { label: 'Tired', fill: C.lavBg, text: C.lavender },
      { label: 'Grateful', fill: C.amberBg, text: C.amber },
      { label: 'Overwhelmed', fill: C.lavBg, text: C.lavender },
    ].map((e, i) => {
      const xPos = 20 + (i % 2) * 180;
      const yPos = 326 + Math.floor(i / 2) * 40;
      return [
        rect(xPos, yPos, 160, 30, e.fill, { r: 15 }),
        text(xPos, yPos + 8, e.label, 13, e.text, { weight: 600, width: 160, align: 'center' }),
      ];
    }).flat(),

    line(20, 414, 350, C.divider),

    // Thought capture
    text(20, 428, 'WHAT\'S ON YOUR MIND', 10, C.muted, { weight: 700, ls: 1.5, width: 200 }),
    rect(20, 446, 350, 80, C.surface, { r: 12 }),
    text(36, 462, 'Morning meetings drained me but I managed a short walk outside — that small reset really helped clear my head.', 13,
      C.ink, { weight: 400, width: 314, lh: 1.6 }),

    // Context pills
    text(20, 540, 'CONTEXT', 10, C.muted, { weight: 700, ls: 1.5, width: 200 }),
    ...[
      { label: '🌅 Morning', active: true },
      { label: '💼 Work', active: true },
      { label: '🚶 Exercise', active: false },
    ].map((pill, i) => {
      const xPos = 20 + i * 110;
      return [
        rect(xPos, 558, 100, 28, pill.active ? C.ink : C.surface, { r: 14 }),
        text(xPos, 566, pill.label, 12, pill.active ? C.white : C.muted,
          { weight: 600, width: 100, align: 'center' }),
      ];
    }).flat(),

    // Gratitude micro-field
    line(20, 600, 350, C.divider),
    text(20, 614, 'ONE THING I\'M GRATEFUL FOR', 10, C.muted, { weight: 700, ls: 1.5, width: 260 }),
    text(20, 632, 'The quiet 10 minutes with coffee this morning ✨', 13, C.ink, { weight: 400, width: 320 }),
    line(20, 656, 350, C.divider),

    // Save button
    rect(20, 668, 350, 52, C.sage, { r: 26 }),
    text(20, 684, 'Save this moment', 16, C.white, { weight: 600, align: 'center', width: 350 }),

    // Skip
    text(20, 730, 'Skip gratitude', 13, C.muted, { weight: 400, align: 'center', width: 350 }),

    ...bottomNav('log'),
  ];
  return { id: uid(), type: 'frame', name: 'Log Mood', x: 0, y: 0, width: 390, height: 844, fill: C.bg, clip: true, children: els };
}

// ─── SCREEN 3: Patterns ────────────────────────────────────────────────────
function screenPatterns() {
  const els = [
    rect(0, 0, 390, 844, C.bg),
    ...statusBar(),

    text(20, 58, 'PATTERNS', 10, C.muted, { weight: 700, ls: 2, width: 200 }),
    text(20, 76, 'Your rhythm', 26, C.ink, { weight: 700, width: 280 }),

    // Month selector
    text(20, 116, '← February', 12, C.muted, { weight: 400, width: 100 }),
    text(20, 116, 'March 2026', 13, C.ink, { weight: 600, align: 'center', width: 350 }),
    text(270, 116, 'April →', 12, C.muted, { weight: 400, width: 100 }),

    line(20, 138, 350, C.divider),

    // Big average stat
    text(20, 152, 'AVG MOOD', 10, C.muted, { weight: 700, ls: 1.5, width: 200 }),
    text(20, 170, '7.2', 64, C.ink, { weight: 700, width: 130, family: 'Georgia' }),
    text(110, 208, '↑ 0.8 from last month', 12, C.sage, { weight: 600, width: 200 }),

    // Stats row
    line(20, 238, 350, C.divider),
    ...[
      { label: 'Logs', value: '18', sub: 'this month' },
      { label: 'Best day', value: '9', sub: 'March 12' },
      { label: 'Streak', value: '3', sub: 'days 🔥' },
    ].map((stat, i) => {
      const xPos = 20 + i * 118;
      return [
        text(xPos, 252, stat.value, 32, C.ink, { weight: 700, width: 100, family: 'Georgia' }),
        text(xPos, 289, stat.label, 10, C.muted, { weight: 700, ls: 1, width: 100 }),
        text(xPos, 304, stat.sub, 10, C.mutedMed, { weight: 400, width: 100 }),
        i < 2 ? line(xPos + 108, 252, 1, C.divider) : null,
      ].filter(Boolean);
    }).flat(),

    line(20, 322, 350, C.divider),

    // Weekly heatmap
    text(20, 336, 'DAILY MOODS — MARCH', 10, C.muted, { weight: 700, ls: 1.5, width: 250 }),

    // Week labels
    ...['W1','W2','W3','W4'].map((w, i) =>
      text(20 + i * 88, 354, w, 10, C.muted, { weight: 600, width: 80, align: 'center' })
    ),

    // 4 weeks × 7 days grid
    ...(function() {
      const days = [6,7,5,8,7,null,null, 4,5,6,7,8,9,8, 7,6,8,7,null,null,null, 8,9,7,null,null,null,null];
      const gridEls = [];
      days.forEach((score, i) => {
        const week = Math.floor(i / 7);
        const day = i % 7;
        const x = 20 + week * 88 + day * 12;
        const y = 366;
        const color = score === null ? C.surface
          : score >= 9 ? C.sage
          : score >= 7 ? C.amber
          : score >= 5 ? C.coralBg
          : 'rgba(212,133,106,0.5)';
        gridEls.push(rect(x, y, 10, 10, color, { r: 3 }));
      });
      return gridEls;
    })(),

    // Day labels (Mon-Sun)
    ...['M','T','W','T','F','S','S'].map((d, i) =>
      text(20 + i * 12, 382, d, 8, C.muted, { weight: 500, width: 10, align: 'center' })
    ),

    line(20, 400, 350, C.divider),

    // Emotion frequency
    text(20, 414, 'TOP EMOTIONS THIS MONTH', 10, C.muted, { weight: 700, ls: 1.5, width: 250 }),

    ...[
      { emotion: 'Calm', pct: 68, color: C.sage },
      { emotion: 'Focused', pct: 54, color: C.amber },
      { emotion: 'Tired', pct: 42, color: C.lavender },
      { emotion: 'Anxious', pct: 28, color: C.coral },
    ].map((e, i) => {
      const y = 434 + i * 44;
      return [
        text(20, y, e.emotion, 13, C.ink, { weight: 500, width: 100 }),
        text(334, y, `${e.pct}%`, 12, e.color, { weight: 700, width: 36, align: 'right' }),
        rect(20, y + 18, 310, 6, C.surface, { r: 3 }),
        rect(20, y + 18, Math.round(310 * e.pct / 100), 6, e.color, { r: 3 }),
      ];
    }).flat(),

    line(20, 616, 350, C.divider),

    // Time of day pattern
    text(20, 630, 'BEST TIME TO LOG', 10, C.muted, { weight: 700, ls: 1.5, width: 200 }),
    ...[
      { label: 'Morning', hour: '7–10am', score: 7.8 },
      { label: 'Afternoon', hour: '1–4pm', score: 6.2 },
      { label: 'Evening', hour: '8–10pm', score: 7.4 },
    ].map((t, i) => {
      const x = 20 + i * 118;
      return [
        rect(x, 648, 106, 60, i === 0 ? C.sageBg : C.surface, { r: 12 }),
        text(x + 10, 658, t.label, 11, C.ink, { weight: 600, width: 86 }),
        text(x + 10, 674, t.score.toFixed(1), 22, i === 0 ? C.sage : C.mutedMed, { weight: 700, width: 60, family: 'Georgia' }),
        text(x + 10, 698, t.hour, 10, C.muted, { weight: 400, width: 80 }),
      ];
    }).flat(),

    ...bottomNav('patterns'),
  ];
  return { id: uid(), type: 'frame', name: 'Patterns', x: 0, y: 0, width: 390, height: 844, fill: C.bg, clip: true, children: els };
}

// ─── SCREEN 4: Journal ─────────────────────────────────────────────────────
function screenJournal() {
  const entries = [
    { date: 'Today', time: '9:30 AM', score: 7, mood: 'Calm · Focused', color: C.sage,
      text: 'Morning coffee ritual + short focus session. Calls felt manageable today.' },
    { date: 'Yesterday', time: '9:15 PM', score: 6, mood: 'Tired · Calm', color: C.amber,
      text: 'Long work day. The sunset walk at 7pm was a lifesaver. Need more of those.' },
    { date: 'Monday', time: '8:45 PM', score: 8, mood: 'Energized · Joyful', color: C.sage,
      text: 'Crushed my weekly goals by noon. Afternoon was pure flow state.' },
    { date: 'Sunday', time: '7:00 PM', score: 5, mood: 'Tired · Anxious', color: C.coral,
      text: 'Pre-week dread. Journaling helped name it. Tomorrow will be different.' },
    { date: 'Saturday', time: '2:30 PM', score: 9, mood: 'Joyful · Rested', color: C.sage,
      text: 'Farmers market morning → long lunch with friends. Peak weekend.' },
  ];

  const els = [
    rect(0, 0, 390, 844, C.bg),
    ...statusBar(),

    text(20, 58, 'JOURNAL', 10, C.muted, { weight: 700, ls: 2, width: 200 }),
    text(20, 76, 'Reflections', 26, C.ink, { weight: 700, width: 280 }),

    // Search bar
    rect(20, 118, 350, 36, C.surface, { r: 18 }),
    text(42, 128, '🔍  Search entries...', 13, C.muted, { weight: 400, width: 280 }),

    line(20, 164, 350, C.divider),
  ];

  entries.forEach((e, i) => {
    const y = 174 + i * 116;
    els.push(
      // Score circle
      circle(20, y + 8, 18, e.color + '22'),
      text(20, y + 16, String(e.score), 18, e.color, { weight: 700, width: 36, align: 'center', family: 'Georgia' }),

      // Date + time
      text(62, y + 8, e.date, 14, C.ink, { weight: 700, width: 160 }),
      text(62, y + 26, e.time, 12, C.muted, { weight: 400, width: 120 }),

      // Mood tags
      text(198, y + 8, e.mood, 11, e.color, { weight: 600, width: 168, align: 'right' }),

      // Entry text
      text(62, y + 48, e.text, 13, C.ink, { weight: 400, width: 300, lh: 1.5 }),

      // Divider
      line(20, y + 108, 350, C.divider),
    );
  });

  els.push(...bottomNav('journal'));
  return { id: uid(), type: 'frame', name: 'Journal', x: 0, y: 0, width: 390, height: 844, fill: C.bg, clip: true, children: els };
}

// ─── SCREEN 5: Insights ────────────────────────────────────────────────────
function screenInsights() {
  const els = [
    rect(0, 0, 390, 844, C.bg),
    ...statusBar(),

    text(20, 58, 'INSIGHTS', 10, C.muted, { weight: 700, ls: 2, width: 200 }),
    text(20, 76, 'Weekly wrap', 26, C.ink, { weight: 700, width: 280 }),
    text(20, 112, 'March 17 – 23, 2026', 13, C.muted, { weight: 400, ls: 0.2 }),

    line(20, 136, 350, C.divider),

    // AI summary card
    rect(20, 150, 350, 108, C.sageBg, { r: 16 }),
    text(36, 162, '✦ DEWDROP SUMMARY', 10, C.sage, { weight: 700, ls: 1.5, width: 280 }),
    text(36, 180, 'Your best week in a month. Morning routines drove\nhigher scores — 7.8 avg before noon vs 6.2 in the\nafternoon. Exercise days were your emotional peak.', 13,
      C.ink, { weight: 400, width: 305, lh: 1.6 }),

    // Trend number
    text(20, 272, 'WEEK SCORE', 10, C.muted, { weight: 700, ls: 1.5, width: 200 }),
    text(20, 290, '7.4', 72, C.ink, { weight: 700, width: 160, family: 'Georgia' }),
    text(112, 330, '↑ from 6.8', 14, C.sage, { weight: 600, width: 160 }),
    text(112, 348, 'last week', 12, C.muted, { weight: 400, width: 120 }),

    line(20, 374, 350, C.divider),

    // Key moments
    text(20, 388, 'KEY MOMENTS', 10, C.muted, { weight: 700, ls: 1.5, width: 200 }),
    ...[
      { icon: '⭐', title: 'Peak day', detail: 'Monday · 9/10 — flow state afternoon', color: C.sage },
      { icon: '↓', title: 'Low point', detail: 'Thursday · 5/10 — high meeting load', color: C.coral },
      { icon: '🚶', title: 'Pattern', detail: 'Walks raised mood avg by +1.4 points', color: C.amber },
    ].map((m, i) => {
      const y = 408 + i * 60;
      return [
        text(20, y + 6, m.icon, 22, m.color, { width: 30 }),
        text(56, y + 4, m.title, 13, C.ink, { weight: 700, width: 200 }),
        text(56, y + 22, m.detail, 12, C.muted, { weight: 400, width: 280 }),
        line(20, y + 52, 350, C.divider),
      ];
    }).flat(),

    // Recommendation
    text(20, 592, 'THIS WEEK, TRY', 10, C.muted, { weight: 700, ls: 1.5, width: 200 }),
    rect(20, 610, 350, 76, C.surface, { r: 14 }),
    text(36, 624, 'Morning movement', 15, C.ink, { weight: 700, width: 280 }),
    text(36, 644, 'Your data shows physical activity before 10am\ncorrelates with a +1.6 mood lift by afternoon.', 12,
      C.ink, { weight: 400, width: 300, lh: 1.55 }),
    text(346, 624, '→', 18, C.sage, { weight: 400, width: 24 }),

    // Share week button
    rect(20, 702, 350, 48, C.ink, { r: 24 }),
    text(20, 718, 'Share your week recap', 15, C.white, { weight: 600, align: 'center', width: 350 }),

    // Archive
    text(20, 762, 'View all weekly wraps', 13, C.muted, { weight: 400, align: 'center', width: 350 }),

    ...bottomNav('insights'),
  ];
  return { id: uid(), type: 'frame', name: 'Insights', x: 0, y: 0, width: 390, height: 844, fill: C.bg, clip: true, children: els };
}

// ─── Assemble ──────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'DEWDROP — Daily Mood & Micro-Journal',
  width: 390,
  height: 844,
  fill: C.bg,
  children: [
    screenToday(),
    screenLog(),
    screenPatterns(),
    screenJournal(),
    screenInsights(),
  ],
};

const out = path.join(__dirname, 'dewdrop.pen');
fs.writeFileSync(out, JSON.stringify(pen, null, 2));
console.log('✓ dewdrop.pen written —', (fs.statSync(out).size / 1024).toFixed(1) + 'KB');
console.log('  Screens:', pen.children.map(s => s.name).join(', '));
