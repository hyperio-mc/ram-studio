// glow-app.js — Morning Energy OS
// Inspired by: Dawn (lapa.ninja) warm wellness palette + Equals (land-book.com) editorial SaaS + Litbix (minimal.gallery) cream paper tones
// Theme: LIGHT — warm cream, terracotta, sage green

const fs = require('fs');

const W = 390, H = 844;

const palette = {
  bg:       '#FBF7F3',
  surface:  '#FFFFFF',
  surface2: '#F4EFE9',
  text:     '#1C1815',
  textMid:  '#5C5248',
  textMute: '#9C9088',
  accent:   '#E8713C',  // warm terracotta amber
  accent2:  '#7AAD83',  // soft sage green
  accentSoft: '#FAE8DE', // light amber tint
  green:    '#D4EDDA',
  border:   '#EAE4DC',
  white:    '#FFFFFF',
};

function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'RECTANGLE',
    x, y, width: w, height: h,
    fill: { type: 'SOLID', color: fill },
    cornerRadius: opts.r || 0,
    opacity: opts.opacity || 1,
    ...( opts.shadow ? { shadow: { color: 'rgba(28,24,21,0.08)', x: 0, y: 2, blur: 12, spread: 0 } } : {} )
  };
}

function text(content, x, y, opts = {}) {
  return {
    type: 'TEXT',
    x, y,
    content,
    fontSize: opts.size || 14,
    fontWeight: opts.weight || 400,
    color: opts.color || palette.text,
    fontFamily: opts.font || 'Inter',
    letterSpacing: opts.ls || 0,
    lineHeight: opts.lh || 1.4,
    align: opts.align || 'left',
    width: opts.w || 300,
  };
}

function circle(x, y, r, fill, opts = {}) {
  return {
    type: 'ELLIPSE',
    x: x - r, y: y - r,
    width: r * 2, height: r * 2,
    fill: { type: 'SOLID', color: fill },
    opacity: opts.opacity || 1,
  };
}

function arc(cx, cy, r, stroke, pct, opts = {}) {
  // Approximate arc with a thick ring — we simulate with overlapping circles
  const layers = [];
  // Background ring
  layers.push({
    type: 'ELLIPSE',
    x: cx - r, y: cy - r,
    width: r * 2, height: r * 2,
    fill: { type: 'SOLID', color: 'transparent' },
    stroke: { color: palette.border, width: opts.w || 8 },
  });
  // Progress ring (just overlay as colored rect for pen format compatibility)
  layers.push({
    type: 'ELLIPSE',
    x: cx - r, y: cy - r,
    width: r * 2, height: r * 2,
    fill: { type: 'SOLID', color: 'transparent' },
    stroke: { color: stroke, width: opts.w || 8 },
    strokeDasharray: `${Math.PI * 2 * r * pct} ${Math.PI * 2 * r}`,
    opacity: 0.9,
  });
  return layers;
}

// ─── Screen builder ──────────────────────────────────────────────────────────

function statusBar(label = '9:41') {
  return [
    rect(0, 0, W, 44, palette.bg),
    text(label, 20, 14, { size: 15, weight: 600, color: palette.text }),
    text('●●●●', W - 80, 14, { size: 11, color: palette.textMute, w: 80 }),
  ];
}

function navBar(items, activeIdx) {
  const layers = [
    rect(0, H - 80, W, 80, palette.surface, { shadow: true }),
    rect(0, H - 80, W, 1, palette.border),
  ];
  const iw = W / items.length;
  items.forEach((item, i) => {
    const cx = i * iw + iw / 2;
    const isActive = i === activeIdx;
    layers.push(circle(cx, H - 48, 3, isActive ? palette.accent : 'transparent'));
    layers.push(text(item.icon, cx - 10, H - 58, { size: 18, color: isActive ? palette.accent : palette.textMute, w: 20, align: 'center' }));
    layers.push(text(item.label, cx - 22, H - 36, { size: 10, weight: isActive ? 600 : 400, color: isActive ? palette.accent : palette.textMute, w: 44, align: 'center' }));
  });
  return layers;
}

const NAV = [
  { icon: '☀', label: 'Today' },
  { icon: '⚡', label: 'Focus' },
  { icon: '~', label: 'Patterns' },
  { icon: '✦', label: 'Insights' },
  { icon: '◎', label: 'Goals' },
];

// ─── Screen 1: Today Overview ─────────────────────────────────────────────────
function screen1() {
  const layers = [
    rect(0, 0, W, H, palette.bg),
    ...statusBar('9:41'),

    // Header
    text('Good morning,', 24, 60, { size: 14, color: palette.textMid, weight: 400 }),
    text('Thursday', 24, 80, { size: 28, weight: 700, color: palette.text, lh: 1.2 }),

    // Date pill
    rect(24, 116, 120, 28, palette.surface2, { r: 14 }),
    text('March 26, 2026', 34, 124, { size: 11, color: palette.textMid, weight: 500, w: 110 }),

    // Energy ring card
    rect(16, 156, W - 32, 180, palette.surface, { r: 20, shadow: true }),

    // Ring background
    circle(W / 2, 244, 60, palette.border),
    circle(W / 2, 244, 60, 'transparent'),

    // Ring segments (arcs simulated as colored ellipses)
    {
      type: 'ELLIPSE', x: W/2 - 60, y: 184,
      width: 120, height: 120,
      fill: { type: 'SOLID', color: 'transparent' },
      stroke: { color: palette.border, width: 12 },
    },
    {
      type: 'ELLIPSE', x: W/2 - 60, y: 184,
      width: 120, height: 120,
      fill: { type: 'SOLID', color: 'transparent' },
      stroke: { color: palette.accent, width: 12 },
      opacity: 0.9,
      strokeDasharray: '226 378',
    },

    // Score in ring
    text('78', W / 2 - 20, 228, { size: 32, weight: 700, color: palette.text, w: 40, align: 'center' }),
    text('energy', W / 2 - 22, 264, { size: 11, color: palette.textMute, w: 44, align: 'center' }),

    // Ring metrics row
    text('Focus', 36, 308, { size: 11, color: palette.textMute, w: 60 }),
    text('Mood', W/2 - 18, 308, { size: 11, color: palette.textMute, w: 44, align: 'center' }),
    text('Body', W - 90, 308, { size: 11, color: palette.textMute, w: 60 }),
    text('92%', 36, 322, { size: 16, weight: 700, color: palette.accent2, w: 60 }),
    text('↑ Great', W/2 - 22, 322, { size: 16, weight: 700, color: palette.text, w: 52, align: 'center' }),
    text('84%', W - 90, 322, { size: 16, weight: 700, color: palette.accent, w: 60 }),

    // Intentions section
    text('Morning Intentions', 24, 352, { size: 13, weight: 600, color: palette.textMid, ls: 0.3 }),

    // Intention items
    rect(16, 370, W - 32, 52, palette.surface, { r: 12 }),
    rect(24, 382, 28, 28, palette.accentSoft, { r: 8 }),
    text('🧘', 30, 386, { size: 16, w: 20 }),
    text('10 min meditation', 62, 382, { size: 14, weight: 500, color: palette.text }),
    text('7:30 AM · Done', 62, 400, { size: 11, color: palette.accent2, w: 140 }),
    rect(W - 44, 384, 24, 24, palette.accent2, { r: 12 }),
    text('✓', W - 38, 388, { size: 12, weight: 700, color: palette.white, w: 12 }),

    rect(16, 428, W - 32, 52, palette.surface, { r: 12 }),
    rect(24, 440, 28, 28, palette.accentSoft, { r: 8 }),
    text('✍', 30, 444, { size: 16, w: 20 }),
    text('Journal entry', 62, 440, { size: 14, weight: 500, color: palette.text }),
    text('Write 3 gratitudes', 62, 458, { size: 11, color: palette.textMute, w: 160 }),
    rect(W - 44, 442, 24, 24, palette.border, { r: 12 }),

    rect(16, 486, W - 32, 52, palette.surface, { r: 12 }),
    rect(24, 498, 28, 28, palette.accentSoft, { r: 8 }),
    text('💧', 30, 502, { size: 16, w: 20 }),
    text('Hydration goal', 62, 498, { size: 14, weight: 500, color: palette.text }),
    text('4 of 8 glasses', 62, 516, { size: 11, color: palette.textMid, w: 140 }),
    rect(W - 44, 500, 24, 24, palette.border, { r: 12 }),

    // Tip card
    rect(16, 548, W - 32, 68, palette.accentSoft, { r: 16 }),
    text('✦ Glow insight', 28, 558, { size: 11, weight: 600, color: palette.accent }),
    text('Your energy peaks at 10am. Block\n2 hrs for deep work before lunch.', 28, 574, { size: 12, color: palette.text, lh: 1.5, w: W - 80 }),

    ...navBar(NAV, 0),
  ];
  return { id: 's1', name: 'Today', layers };
}

// ─── Screen 2: Focus Session ───────────────────────────────────────────────
function screen2() {
  return {
    id: 's2', name: 'Focus',
    layers: [
      rect(0, 0, W, H, palette.bg),
      ...statusBar('10:14'),

      text('Focus', 24, 60, { size: 28, weight: 700, color: palette.text }),
      text('Stay in the zone', 24, 94, { size: 14, color: palette.textMid }),

      // Active session card
      rect(16, 128, W - 32, 220, palette.surface, { r: 20, shadow: true }),

      // Session label
      rect(28, 140, 100, 24, palette.accentSoft, { r: 12 }),
      text('● ACTIVE', 38, 146, { size: 10, weight: 700, color: palette.accent, w: 80 }),

      text('Deep Work', 28, 176, { size: 22, weight: 700, color: palette.text }),
      text('Glow app design sprint', 28, 202, { size: 13, color: palette.textMid }),

      // Timer
      text('47:22', W/2 - 48, 226, { size: 48, weight: 700, color: palette.text, w: 120, align: 'center' }),
      text('remaining', W/2 - 28, 278, { size: 12, color: palette.textMute, w: 70, align: 'center' }),

      // Controls row
      rect(80, 308, 52, 52, palette.surface2, { r: 26 }),
      text('⟳', 98, 320, { size: 22, color: palette.textMid, w: 20 }),
      rect(W/2 - 32, 304, 64, 60, palette.accent, { r: 30 }),
      text('⏸', W/2 - 10, 322, { size: 24, color: palette.white, w: 20 }),
      rect(W - 132, 308, 52, 52, palette.surface2, { r: 26 }),
      text('✕', W - 116, 320, { size: 20, color: palette.textMid, w: 20 }),

      // Session history
      text("Today's Sessions", 24, 372, { size: 13, weight: 600, color: palette.textMid }),

      // Session blocks
      ...[
        { label: 'Email & Comms', dur: '25 min', time: '8:00', type: 'light', color: palette.accent2 },
        { label: 'Strategy Planning', dur: '50 min', time: '8:40', type: 'deep', color: palette.accent },
        { label: 'Review & Notes', dur: '25 min', time: '9:42', type: 'light', color: palette.accent2 },
      ].map((s, i) => {
        const y = 394 + i * 62;
        return [
          rect(16, y, W - 32, 52, palette.surface, { r: 12 }),
          rect(24, y + 12, 4, 28, s.color, { r: 2 }),
          text(s.label, 38, y + 10, { size: 14, weight: 500, color: palette.text }),
          text(s.time + ' · ' + s.dur, 38, y + 28, { size: 11, color: palette.textMute, w: 160 }),
          rect(W - 70, y + 14, 46, 24, s.type === 'deep' ? palette.accentSoft : palette.green, { r: 12 }),
          text(s.type, W - 64, y + 20, { size: 10, weight: 600, color: s.type === 'deep' ? palette.accent : palette.accent2, w: 36 }),
        ];
      }).flat(),

      // Daily total
      rect(16, 586, W - 32, 52, palette.surface2, { r: 12 }),
      text('⚡ Total focused today', 28, 596, { size: 13, weight: 500, color: palette.text }),
      text('2h 40m · Goal: 4h', 28, 614, { size: 11, color: palette.textMid }),
      // Progress bar
      rect(W - 160, 606, 120, 8, palette.border, { r: 4 }),
      rect(W - 160, 606, 66, 8, palette.accent, { r: 4 }),

      ...navBar(NAV, 1),
    ]
  };
}

// ─── Screen 3: Weekly Patterns ─────────────────────────────────────────────
function screen3() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const energyVals = [72, 85, 91, 88, 78, 55, 62]; // % energy each day
  const focusVals  = [120, 180, 240, 200, 150, 60, 90]; // minutes focus

  const chartX = 32;
  const chartW = W - 64;
  const colW = chartW / 7;

  return {
    id: 's3', name: 'Patterns',
    layers: [
      rect(0, 0, W, H, palette.bg),
      ...statusBar(),

      text('Patterns', 24, 60, { size: 28, weight: 700, color: palette.text }),
      text('This week · Mar 20–26', 24, 94, { size: 13, color: palette.textMid }),

      // Week summary pill row
      ...[
        { label: 'Avg Energy', val: '76%', color: palette.accent },
        { label: 'Focus hrs', val: '14.5h', color: palette.accent2 },
        { label: 'Streak', val: '8 days', color: '#9B7FCC' },
      ].map((m, i) => {
        const x = 16 + i * (W - 32) / 3;
        const w = (W - 32) / 3 - 6;
        return [
          rect(x, 118, w, 64, palette.surface, { r: 14, shadow: true }),
          text(m.val, x + 12, 130, { size: 20, weight: 700, color: m.color }),
          text(m.label, x + 12, 154, { size: 10, color: palette.textMute, w: w - 20 }),
        ];
      }).flat(),

      // Energy chart
      text('Energy Score', 24, 198, { size: 13, weight: 600, color: palette.textMid }),

      rect(16, 214, W - 32, 140, palette.surface, { r: 16 }),

      // Chart bars
      ...days.map((d, i) => {
        const val = energyVals[i];
        const bh = Math.round((val / 100) * 90);
        const bx = chartX + i * colW + colW * 0.2;
        const bw = colW * 0.6;
        const by = 214 + 130 - bh - 20;
        const isToday = i === 6;
        return [
          rect(bx, by, bw, bh, isToday ? palette.accent : palette.accentSoft, { r: 6 }),
          text(d, bx, 334, { size: 10, color: isToday ? palette.accent : palette.textMute, w: bw, align: 'center' }),
          text(val + '', bx, by - 16, { size: 9, color: isToday ? palette.accent : palette.textMute, w: bw, align: 'center' }),
        ];
      }).flat(),

      // Focus time chart
      text('Focus Minutes / Day', 24, 368, { size: 13, weight: 600, color: palette.textMid }),

      rect(16, 384, W - 32, 130, palette.surface, { r: 16 }),

      ...days.map((d, i) => {
        const val = focusVals[i];
        const bh = Math.round((val / 250) * 85);
        const bx = chartX + i * colW + colW * 0.2;
        const bw = colW * 0.6;
        const by = 384 + 120 - bh;
        return [
          rect(bx, by, bw, bh, palette.accent2, { r: 6, opacity: 0.7 + (i === 6 ? 0.3 : 0) }),
          text(d, bx, 496, { size: 10, color: palette.textMute, w: bw, align: 'center' }),
        ];
      }).flat(),

      // Insights row
      text('Weekly Highlights', 24, 526, { size: 13, weight: 600, color: palette.textMid }),

      rect(16, 544, (W - 40) / 2, 72, palette.accentSoft, { r: 14 }),
      text('Best day', 28, 554, { size: 11, color: palette.accent }),
      text('Wednesday', 28, 570, { size: 16, weight: 700, color: palette.text }),
      text('91 energy · 4h focus', 28, 590, { size: 10, color: palette.textMid }),

      rect(W / 2 + 6, 544, (W - 40) / 2, 72, palette.green, { r: 14 }),
      text('Best streak', W / 2 + 18, 554, { size: 11, color: palette.accent2 }),
      text('8 days', W / 2 + 18, 570, { size: 16, weight: 700, color: palette.text }),
      text('Above 70 energy', W / 2 + 18, 590, { size: 10, color: palette.textMid }),

      ...navBar(NAV, 2),
    ]
  };
}

// ─── Screen 4: AI Insights ──────────────────────────────────────────────────
function screen4() {
  const insights = [
    {
      emoji: '⏰',
      title: 'Peak window found',
      body: 'You consistently hit 90%+ energy between 9–11am. Schedule your hardest tasks then.',
      tag: 'Timing',
      color: palette.accent,
      bg: palette.accentSoft,
    },
    {
      emoji: '😴',
      title: 'Sleep correlation',
      body: 'On days you sleep 7.5h+, focus time increases by 38%. Last 3 nights averaged 6.2h.',
      tag: 'Sleep',
      color: '#9B7FCC',
      bg: '#F0EBF9',
    },
    {
      emoji: '🌿',
      title: 'Afternoon slump',
      body: 'Your energy dips from 2–3:30pm daily. A 10-min walk during this window boosted energy by 22% twice this week.',
      tag: 'Recovery',
      color: palette.accent2,
      bg: palette.green,
    },
  ];

  return {
    id: 's4', name: 'Insights',
    layers: [
      rect(0, 0, W, H, palette.bg),
      ...statusBar(),

      text('Insights', 24, 60, { size: 28, weight: 700, color: palette.text }),
      text('AI-generated · Updated daily', 24, 94, { size: 13, color: palette.textMid }),

      // Score summary
      rect(16, 118, W - 32, 72, palette.surface, { r: 16, shadow: true }),
      circle(48, 154, 22, palette.accentSoft),
      text('✦', 38, 142, { size: 20, w: 20 }),
      text('3 new insights this week', 80, 136, { size: 15, weight: 600, color: palette.text }),
      text('Based on 14 days of tracking', 80, 156, { size: 12, color: palette.textMid }),

      // Insight cards
      ...insights.map((ins, i) => {
        const y = 204 + i * 148;
        return [
          rect(16, y, W - 32, 136, palette.surface, { r: 18, shadow: true }),
          // Color accent left bar
          rect(16, y, 4, 136, ins.color, { r: 2 }),
          // Tag
          rect(28, y + 14, 70, 22, ins.bg, { r: 11 }),
          text(ins.tag, 38, y + 19, { size: 10, weight: 600, color: ins.color, w: 56 }),
          // Emoji
          text(ins.emoji, W - 52, y + 14, { size: 24, w: 28 }),
          // Title
          text(ins.title, 28, y + 46, { size: 16, weight: 700, color: palette.text }),
          // Body
          text(ins.body, 28, y + 68, { size: 12, color: palette.textMid, lh: 1.5, w: W - 72 }),
        ];
      }).flat(),

      ...navBar(NAV, 3),
    ]
  };
}

// ─── Screen 5: Goals & Intentions ─────────────────────────────────────────
function screen5() {
  const goals = [
    { name: 'Deep Work', target: '4h / day', progress: 68, color: palette.accent, streak: 8 },
    { name: 'Hydration', target: '8 glasses', progress: 50, color: '#5BADD4', streak: 3 },
    { name: 'Movement', target: '30 min', progress: 100, color: palette.accent2, streak: 12 },
    { name: 'Journaling', target: 'Daily', progress: 87, color: '#9B7FCC', streak: 6 },
  ];

  return {
    id: 's5', name: 'Goals',
    layers: [
      rect(0, 0, W, H, palette.bg),
      ...statusBar(),

      text('Goals', 24, 60, { size: 28, weight: 700, color: palette.text }),
      text('Track what matters', 24, 94, { size: 13, color: palette.textMid }),

      // Add goal CTA
      rect(W - 72, 56, 48, 32, palette.accent, { r: 16 }),
      text('+ Add', W - 66, 64, { size: 12, weight: 600, color: palette.white, w: 40 }),

      // Overall streak card
      rect(16, 118, W - 32, 76, palette.surface, { r: 16, shadow: true }),
      circle(50, 156, 26, palette.accentSoft),
      text('🔥', 38, 144, { size: 22, w: 24 }),
      text('12-day streak', 86, 134, { size: 18, weight: 700, color: palette.text }),
      text('Best run yet! Keep going.', 86, 156, { size: 12, color: palette.textMid }),
      text('→', W - 36, 148, { size: 18, color: palette.accent, w: 20 }),

      // Goal cards
      ...goals.map((g, i) => {
        const y = 210 + i * 100;
        const barW = W - 32 - 32; // progress bar width
        return [
          rect(16, y, W - 32, 88, palette.surface, { r: 16 }),
          // Icon accent dot
          circle(40, y + 20, 14, g.color + '22'),
          text(g.name[0], 33, y + 12, { size: 16, weight: 700, color: g.color, w: 16 }),
          // Name
          text(g.name, 62, y + 8, { size: 15, weight: 600, color: palette.text }),
          text(g.target, 62, y + 26, { size: 11, color: palette.textMute }),
          // Streak badge
          rect(W - 88, y + 8, 58, 22, g.progress === 100 ? g.color + '22' : palette.surface2, { r: 11 }),
          text('🔥 ' + g.streak + 'd', W - 82, y + 13, { size: 10, weight: 600, color: g.color, w: 50 }),
          // Progress bar track
          rect(24, y + 56, barW, 8, palette.border, { r: 4 }),
          // Progress bar fill
          rect(24, y + 56, Math.round(barW * g.progress / 100), 8, g.color, { r: 4 }),
          // % label
          text(g.progress + '%', W - 44, y + 52, { size: 11, weight: 600, color: g.color, w: 32 }),
        ];
      }).flat(),

      ...navBar(NAV, 4),
    ]
  };
}

// ─── Assemble pen ──────────────────────────────────────────────────────────
function flattenLayers(layers) {
  return layers.map((l, i) => ({ id: `l${i}`, ...l }));
}

function buildScreen(s) {
  return {
    id: s.id,
    name: s.name,
    width: W,
    height: H,
    backgroundColor: palette.bg,
    layers: flattenLayers(s.layers),
  };
}

const pen = {
  version: '2.8',
  name: 'Glow — Morning Energy OS',
  width: W,
  height: H,
  screens: [
    buildScreen(screen1()),
    buildScreen(screen2()),
    buildScreen(screen3()),
    buildScreen(screen4()),
    buildScreen(screen5()),
  ],
  theme: {
    name: 'Glow Light',
    palette,
  },
};

fs.writeFileSync('glow.pen', JSON.stringify(pen, null, 2));
console.log('✓ glow.pen written —', pen.screens.length, 'screens');
console.log('  Colors:', palette.bg, palette.accent, palette.accent2);
