'use strict';
// lull-app.js — LULL: Calm Daily Reflection & Mindfulness Journal
// Inspired by:
//   1. lapa.ninja health/fitness category (Mar 24, 2026): Dawn ("Evidence-based AI for mental
//      health. Personalized support for everyday emotional challenges. Private, science-backed."),
//      Super Chill ("A fresh and calm mind"), Baba Care ("The assistant for self-care") —
//      all warm, light, editorial, heavily breathing-room-led. Mental wellness is a surging
//      design category with strong aesthetic conventions.
//   2. minimal.gallery: KO Collective, Old Tom Capital, Litbix — large serif wordmarks, near-
//      white backgrounds, generous line height, editorial silence as a design tool.
// Theme: LIGHT — warm off-white, sage green, clay — the tonal antithesis of GRIT's brutalism.
// Design push: Whitespace and typography rhythm as the interface. No chrome, no cards stacked.
//   The page breathes. Serif headings establish warmth. Natural palette for psychological ease.

const fs   = require('fs');
const path = require('path');

// ─── palette ─────────────────────────────────────────────────────────────────
const C = {
  bg:       '#F7F4EF',
  surface:  '#FFFFFF',
  surface2: '#EEE9E0',
  text:     '#1D1A14',
  muted:    'rgba(29,26,20,0.42)',
  sage:     '#5A7856',    // primary — calm sage green
  clay:     '#A0694A',    // secondary — warm clay
  border:   'rgba(29,26,20,0.10)',
  success:  '#5A9A6C',
  blush:    '#F0E8DE',
};

// ─── pen helpers ─────────────────────────────────────────────────────────────
let _id = 1;
const uid  = () => `lull-${_id++}`;
const rect = (x, y, w, h, fill) => ({ id: uid(), type: 'rect', x, y, width: w, height: h, fill });
const text = (x, y, w, h, content, fontSize, color, weight = '400', align = 'left', family = 'Georgia') =>
  ({ id: uid(), type: 'text', x, y, width: w, height: h, content, fontSize, color, fontWeight: weight, textAlign: align, fontFamily: family });
const textSans = (x, y, w, h, content, fontSize, color, weight = '400', align = 'left') =>
  text(x, y, w, h, content, fontSize, color, weight, align, 'Inter');
const frame = (x, y, w, h, fill, children) => ({ id: uid(), type: 'frame', x, y, width: w, height: h, fill, clip: true, children });

const FW = 390; const FH = 844;

// ─── nav bar ─────────────────────────────────────────────────────────────────
const NAV_LABELS = ['Morning', 'Journal', 'Prompts', 'Mood', 'Insights'];
function navBar(active) {
  const els = [];
  NAV_LABELS.forEach((label, i) => {
    const nx = Math.round(i * (FW / NAV_LABELS.length));
    const nw = Math.round(FW / NAV_LABELS.length);
    const isActive = i === active;
    if (isActive) {
      els.push(rect(nx + 8, FH - 6, nw - 16, 2, C.sage));
    }
    els.push(textSans(nx, FH - 52, nw, 14, label, 10, isActive ? C.sage : C.muted, isActive ? '600' : '400', 'center'));
  });
  return els;
}

function header(title, sub) {
  return [
    rect(0, 0, FW, 72, C.bg),
    text(20, 14, FW - 40, 30, 'lull', 22, C.sage, '400', 'left', 'Georgia'),
    text(20, 46, FW - 40, 18, title, 12, C.muted, '400', 'left', 'Inter'),
    ...(sub ? [textSans(FW - 100, 46, 88, 18, sub, 11, C.clay, '500', 'right')] : []),
  ];
}

function moodDot(x, y, label, color, active) {
  return [
    rect(x, y, 52, 52, active ? color : C.surface2),
    textSans(x, y + 56, 52, 16, label, 10, C.muted, '400', 'center'),
  ];
}

function intentionCard(x, y, w, text_content, done) {
  return [
    rect(x, y, w, 52, C.surface),
    rect(x, y + 51, w, 1, C.border),
    rect(x, y, 3, 52, done ? C.sage : C.surface2),
    textSans(x + 16, y + 10, w - 60, 16, text_content, 13, done ? C.muted : C.text, '400'),
    textSans(x + 16, y + 30, w - 60, 16, done ? 'Completed ✓' : 'Tap to complete', 10, done ? C.sage : C.muted, done ? '600' : '400'),
    textSans(w - 44, y + 16, 32, 18, done ? '✓' : '○', 18, done ? C.sage : C.border, '400', 'center'),
  ];
}

function quoteBlock(x, y, w, quote, attr) {
  return [
    rect(x, y, 3, quote.length > 60 ? 80 : 60, C.sage),
    text(x + 16, y, w - 20, quote.length > 60 ? 72 : 54, `"${quote}"`, 14, C.text, '400', 'left', 'Georgia'),
    textSans(x + 16, y + (quote.length > 60 ? 76 : 58), 200, 16, `— ${attr}`, 10, C.muted, '400'),
  ];
}

function moodBar(x, y, w, label, value, color) {
  const filled = Math.round((w - 0) * value / 10);
  return [
    textSans(x, y, 100, 18, label, 11, C.text, '500'),
    textSans(w - 32, y, 28, 18, `${value}/10`, 11, color, '700', 'right'),
    rect(x, y + 22, w, 4, C.surface2),
    rect(x, y + 22, filled, 4, color),
  ];
}

// ─── SCREEN 1: Morning ────────────────────────────────────────────────────────
function screenMorning() {
  const children = [
    rect(0, 0, FW, FH, C.bg),
    ...header('Morning', 'MON 24 MAR'),

    // Greeting — serif, generous
    text(20, 80, FW - 40, 28, 'Good morning.', 24, C.text, '400', 'left', 'Georgia'),
    textSans(20, 112, FW - 40, 18, 'Take a breath. You have a moment.', 13, C.muted, '400'),
    rect(20, 136, FW - 40, 1, C.border),

    // Mood check-in
    textSans(20, 150, FW - 40, 16, 'HOW ARE YOU ARRIVING TODAY?', 10, C.muted, '700'),
    ...moodDot(24, 174, 'Calm', C.sage, true),
    ...moodDot(88, 174, 'Anxious', '#D4956A', false),
    ...moodDot(152, 174, 'Tired', '#9BA8B4', false),
    ...moodDot(216, 174, 'Hopeful', '#7BB88A', false),
    ...moodDot(280, 174, 'Heavy', '#A08090', false),
    ...moodDot(344, 174, 'Clear', '#7BACC4', false),

    rect(20, 252, FW - 40, 1, C.border),

    // Today's intention
    textSans(20, 264, FW - 40, 16, 'TODAY\'S INTENTION', 10, C.muted, '700'),
    rect(20, 282, FW - 40, 80, C.surface),
    rect(20, 282, FW - 40, 3, C.sage),
    text(32, 294, FW - 64, 56, 'Be present with the people around me.', 16, C.text, '400', 'left', 'Georgia'),

    // Micro-intentions
    textSans(20, 376, FW - 40, 16, 'THREE THINGS', 10, C.muted, '700'),
    ...intentionCard(20, 394, FW - 40, 'Drink water before coffee', true),
    ...intentionCard(20, 446, FW - 40, 'Take a 10-minute walk after lunch', false),
    ...intentionCard(20, 498, FW - 40, 'Call Mum — she asked about Sunday', false),

    rect(20, 558, FW - 40, 1, C.border),

    // Prompt teaser
    textSans(20, 570, FW - 40, 16, "TODAY'S PROMPT", 10, C.muted, '700'),
    rect(20, 588, FW - 40, 64, C.blush),
    textSans(32, 600, FW - 64, 16, '"What would make today feel complete?"', 13, C.text, '500'),
    textSans(32, 622, FW - 64, 16, 'Tap to journal ↗', 11, C.clay, '600'),

    // Bottom nav
    rect(0, FH - 64, FW, 64, C.surface),
    rect(0, FH - 64, FW, 1, C.border),
    ...navBar(0),
  ];
  return frame(0, 0, FW, FH, C.bg, children);
}

// ─── SCREEN 2: Journal ────────────────────────────────────────────────────────
function screenJournal() {
  const children = [
    rect(0, 0, FW, FH, C.bg),
    ...header('Journal', 'FREE WRITE'),

    text(20, 80, FW - 40, 28, 'Write freely.', 24, C.text, '400', 'left', 'Georgia'),
    textSans(20, 110, FW - 40, 18, 'No structure, no judgement. Just words.', 13, C.muted, '400'),
    rect(20, 132, FW - 40, 1, C.border),

    // Entry area — open, spacious
    rect(20, 148, FW - 40, 280, C.surface),
    text(32, 162, FW - 64, 252,
      'It\'s strange how some mornings carry a different\nweight. Not heavy, exactly — more like the air\nbefore rain. I woke up thinking about the\nconversation from last night and I still don\'t\nknow what I was trying to say.\n\nI think I want more space in my days. Not\nnecessarily time — just room to breathe between\nthings. Room to finish one thought before starting\nthe next one.',
      14, C.text, '400', 'left', 'Georgia'),
    // blinking cursor hint
    rect(32 + 9 * 10, 162 + 196, 8, 18, C.sage),

    // Entry meta
    rect(20, 428, FW - 40, 1, C.border),
    textSans(20, 438, 200, 16, 'Monday 24 March · 7:42 am', 11, C.muted, '400'),
    textSans(FW - 80, 438, 60, 16, '187 words', 11, C.muted, '400', 'right'),

    // Past entries
    textSans(20, 464, FW - 40, 16, 'RECENT ENTRIES', 10, C.muted, '700'),
    rect(20, 482, FW - 40, 52, C.surface),
    rect(20, 533, FW - 40, 1, C.border),
    text(32, 490, FW - 80, 22, 'The rhythm of ordinary days', 14, C.text, '400', 'left', 'Georgia'),
    textSans(32, 514, FW - 80, 16, 'Sun 23 Mar · 3 min read', 11, C.muted, '400'),
    rect(20, 534, FW - 40, 52, C.surface),
    rect(20, 585, FW - 40, 1, C.border),
    text(32, 542, FW - 80, 22, 'Why I keep starting things', 14, C.text, '400', 'left', 'Georgia'),
    textSans(32, 566, FW - 80, 16, 'Thu 20 Mar · 5 min read', 11, C.muted, '400'),

    rect(0, FH - 64, FW, 64, C.surface),
    rect(0, FH - 64, FW, 1, C.border),
    ...navBar(1),
  ];
  return frame(390, 0, FW, FH, C.bg, children);
}

// ─── SCREEN 3: Prompts ────────────────────────────────────────────────────────
function screenPrompts() {
  const children = [
    rect(0, 0, FW, FH, C.bg),
    ...header('Prompts', 'GUIDED'),

    text(20, 80, FW - 40, 28, 'A question worth sitting with.', 22, C.text, '400', 'left', 'Georgia'),
    textSans(20, 112, FW - 40, 18, 'Each prompt is chosen to open something new.', 13, C.muted, '400'),
    rect(20, 134, FW - 40, 1, C.border),

    // Today's featured prompt — large, centred
    rect(20, 148, FW - 40, 140, C.blush),
    rect(20, 148, FW - 40, 3, C.sage),
    textSans(20, 158, FW - 40, 14, 'TODAY', 10, C.sage, '700', 'center'),
    text(32, 178, FW - 64, 80,
      '"What would make today\nfeel complete?"',
      18, C.text, '400', 'center', 'Georgia'),
    textSans(20, 270, FW - 40, 18, 'Tap to begin journaling ↗', 12, C.clay, '600', 'center'),

    // Prompt categories
    textSans(20, 308, FW - 40, 16, 'EXPLORE BY THEME', 10, C.muted, '700'),

    ...[[C.sage, 'Gratitude', '12 prompts'],
      [C.clay, 'Relationships', '9 prompts'],
      ['#7BACC4', 'Work & Purpose', '11 prompts'],
      ['#A08090', 'Inner Life', '14 prompts']].flatMap(([color, label, count], i) => [
      rect(20, 328 + i * 56, FW - 40, 52, C.surface),
      rect(20, 379 + i * 56, FW - 40, 1, C.border),
      rect(20, 328 + i * 56, 3, 52, color),
      textSans(36, 338 + i * 56, 200, 18, label, 14, C.text, '500'),
      textSans(36, 358 + i * 56, 200, 16, count, 11, C.muted, '400'),
      textSans(FW - 60, 344 + i * 56, 36, 18, '→', 16, color, '600', 'right'),
    ]),

    rect(0, FH - 64, FW, 64, C.surface),
    rect(0, FH - 64, FW, 1, C.border),
    ...navBar(2),
  ];
  return frame(780, 0, FW, FH, C.bg, children);
}

// ─── SCREEN 4: Mood ───────────────────────────────────────────────────────────
function screenMood() {
  const children = [
    rect(0, 0, FW, FH, C.bg),
    ...header('Mood', 'THIS WEEK'),

    text(20, 80, FW - 40, 28, 'Your emotional weather.', 22, C.text, '400', 'left', 'Georgia'),
    textSans(20, 110, FW - 40, 18, 'Tracked gently, without pressure.', 13, C.muted, '400'),
    rect(20, 132, FW - 40, 1, C.border),

    // Mood week visual — simple dot heatmap
    textSans(20, 146, FW - 40, 16, 'MON — SUN', 10, C.muted, '700'),
    ...[['Mon', C.sage, 8], ['Tue', '#9BA8B4', 5], ['Wed', C.sage, 7],
       ['Thu', C.clay, 4], ['Fri', '#7BB88A', 9], ['Sat', C.sage, 8], ['Sun', '#9BA8B4', 6]]
      .flatMap(([day, color, val], i) => {
        const x = 20 + i * 50;
        return [
          rect(x + 8, 164, 32, Math.round(60 * val / 10), color + '80'),
          rect(x + 8, 164 + Math.round(60 * val / 10) - 4, 32, 4, color),
          textSans(x + 4, 230, 40, 14, day, 9, C.muted, '400', 'center'),
        ];
      }),

    rect(20, 252, FW - 40, 1, C.border),

    // Today's detail
    textSans(20, 264, FW - 40, 16, "TODAY'S DETAIL", 10, C.muted, '700'),
    ...moodBar(20, 284, FW - 40, 'Energy', 7, C.sage),
    ...moodBar(20, 316, FW - 40, 'Anxiety', 3, C.clay),
    ...moodBar(20, 348, FW - 40, 'Focus', 8, '#7BACC4'),
    ...moodBar(20, 380, FW - 40, 'Connection', 6, '#7BB88A'),

    rect(20, 416, FW - 40, 1, C.border),

    // Insight
    textSans(20, 428, FW - 40, 16, 'THIS WEEK\'S PATTERN', 10, C.muted, '700'),
    ...quoteBlock(20, 448, FW - 40,
      'Your mood lifts consistently on days you journal in the morning.',
      'LULL observation'),

    textSans(20, 546, FW - 40, 32, '21 consecutive days of check-ins ✦', 13, C.sage, '600'),

    rect(0, FH - 64, FW, 64, C.surface),
    rect(0, FH - 64, FW, 1, C.border),
    ...navBar(3),
  ];
  return frame(1170, 0, FW, FH, C.bg, children);
}

// ─── SCREEN 5: Insights ───────────────────────────────────────────────────────
function screenInsights() {
  const children = [
    rect(0, 0, FW, FH, C.bg),
    ...header('Insights', 'MARCH 2026'),

    text(20, 80, FW - 40, 30, 'Patterns, surfaced gently.', 22, C.text, '400', 'left', 'Georgia'),
    textSans(20, 114, FW - 40, 16, 'Based on 21 days of reflection.', 12, C.muted, '400'),
    rect(20, 134, FW - 40, 1, C.border),

    // Key stats
    rect(20, 148, 165, 80, C.surface),
    rect(20, 148, 165, 3, C.sage),
    textSans(32, 160, 120, 14, 'JOURNAL STREAK', 9, C.muted, '700'),
    text(32, 176, 100, 40, '21', 36, C.sage, '400', 'left', 'Georgia'),
    textSans(32, 218, 100, 14, 'days', 11, C.muted, '400'),

    rect(205, 148, 165, 80, C.surface),
    rect(205, 148, 165, 3, C.clay),
    textSans(217, 160, 120, 14, 'WORDS WRITTEN', 9, C.muted, '700'),
    text(217, 176, 120, 40, '4,820', 26, C.clay, '400', 'left', 'Georgia'),
    textSans(217, 218, 120, 14, 'this month', 11, C.muted, '400'),

    rect(20, 240, FW - 40, 1, C.border),

    // Themes
    textSans(20, 254, FW - 40, 16, 'RECURRING THEMES', 10, C.muted, '700'),
    ...[
      ['Relationships', 14, C.sage],
      ['Work & purpose', 11, '#7BACC4'],
      ['Rest & recovery', 9, C.clay],
      ['Creativity', 8, '#7BB88A'],
    ].flatMap(([label, count, color], i) => {
      const barW = Math.round((FW - 40) * count / 16);
      return [
        textSans(20, 278 + i * 30, 160, 16, label, 12, C.text, '400'),
        rect(20, 296 + i * 30, barW, 6, color + 'CC'),
        textSans(barW + 28, 292 + i * 30, 40, 16, `${count}x`, 11, color, '700'),
      ];
    }),

    rect(20, 402, FW - 40, 1, C.border),

    textSans(20, 416, FW - 40, 16, 'LULL REFLECTION', 10, C.muted, '700'),
    ...quoteBlock(20, 436, FW - 40,
      'You write longest on Sundays and shortest on Wednesdays. Your energy and word count align closely.',
      'Based on your March patterns'),

    textSans(20, 540, FW - 40, 16, 'NEXT MILESTONE', 10, C.muted, '700'),
    rect(20, 558, FW - 40, 52, C.blush),
    rect(20, 558, FW - 40, 3, C.sage),
    textSans(32, 570, FW - 64, 18, '30 days of morning check-ins', 13, C.text, '600'),
    textSans(32, 590, FW - 64, 16, '9 days to go · You\'re building something real.', 11, C.muted, '400'),

    rect(0, FH - 64, FW, 64, C.surface),
    rect(0, FH - 64, FW, 1, C.border),
    ...navBar(4),
  ];
  return frame(1560, 0, FW, FH, C.bg, children);
}

// ─── assemble pen ─────────────────────────────────────────────────────────────
const pen = {
  version:  '2.8',
  name:     'LULL — Calm Daily Reflection Journal',
  width:    2000,
  height:   FH,
  fill:     C.bg,
  children: [
    screenMorning(),
    screenJournal(),
    screenPrompts(),
    screenMood(),
    screenInsights(),
  ],
};

fs.writeFileSync(path.join(__dirname, 'lull.pen'), JSON.stringify(pen, null, 2));
console.log('✓ lull.pen written —', pen.children.length, 'screens');
