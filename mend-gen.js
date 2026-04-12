#!/usr/bin/env node
// MEND — Recovery Intelligence for Smart Wearables
// Light theme editorial design inspired by:
//   - Dribbble #1 popular: "Smart Ring App — Health Tracking Mobile UI" (12.8k views)
//   - Dawn AI mental health app (lapa.ninja) — evidence-based, personalized AI wellness
//   - Minimal editorial warmth from minimal.gallery (organic, typographic, human)
//
// Design challenge: Typographically-led recovery dashboard with organic biometric
// wave data, editorial number hierarchy, and warm cream palette — pushing away from
// the cold dark fintech look toward something genuinely warm and human.

const fs = require('fs');
const path = require('path');

const SLUG = 'mend';

// ── Palette ────────────────────────────────────────────────────────────────
const P = {
  bg:       '#F5F2EC',   // warm parchment
  surface:  '#FDFCFA',   // near-white card
  surface2: '#EDE9E1',   // pressed / divider
  text:     '#1C1A17',   // warm near-black
  textMid:  '#6B6560',   // mid-tone body text
  textFaint:'#B0AA9F',   // muted labels
  accent:   '#3E6B4A',   // forest green (growth, health)
  accent2:  '#C4714A',   // warm terra cotta (energy, recovery)
  accent3:  '#7B5EA0',   // soft violet (deep sleep, calm)
  positive: '#3E8B5A',   // success green
  warn:     '#C4A24A',   // amber warning
};

// ── Typography scale ────────────────────────────────────────────────────────
const T = {
  heroNum:   { size: 88, weight: 700, family: 'serif', letterSpacing: -4 },
  bigNum:    { size: 56, weight: 700, family: 'serif', letterSpacing: -2 },
  scoreNum:  { size: 42, weight: 700, family: 'serif', letterSpacing: -2 },
  h1:        { size: 28, weight: 700, family: 'sans', letterSpacing: -0.5 },
  h2:        { size: 22, weight: 600, family: 'sans', letterSpacing: -0.3 },
  h3:        { size: 17, weight: 600, family: 'sans' },
  label:     { size: 13, weight: 500, family: 'sans', letterSpacing: 0.5 },
  labelSmall:{ size: 11, weight: 500, family: 'sans', letterSpacing: 0.8 },
  body:      { size: 15, weight: 400, family: 'sans' },
  bodySmall: { size: 13, weight: 400, family: 'sans' },
  caption:   { size: 12, weight: 400, family: 'sans' },
};

// ── Helper: create element ──────────────────────────────────────────────────
let _id = 1;
const el = (type, props) => ({ id: `el_${_id++}`, type, ...props });

// ── Helper: rect ───────────────────────────────────────────────────────────
const rect = (x, y, w, h, fill, radius = 0, extra = {}) =>
  el('rect', { x, y, width: w, height: h, fill, cornerRadius: radius, ...extra });

// ── Helper: text ───────────────────────────────────────────────────────────
const text = (content, x, y, typo, color, extra = {}) =>
  el('text', {
    x, y,
    content,
    fontSize: typo.size,
    fontWeight: typo.weight,
    fontFamily: typo.family === 'serif' ? 'Georgia, "Times New Roman", serif' : '-apple-system, "SF Pro Display", sans-serif',
    color,
    letterSpacing: typo.letterSpacing || 0,
    ...extra,
  });

// ── Helper: circle ─────────────────────────────────────────────────────────
const circle = (cx, cy, r, fill, extra = {}) =>
  el('ellipse', { x: cx - r, y: cy - r, width: r * 2, height: r * 2, fill, ...extra });

// ── Helper: progress arc (simulated with overlapping arcs description) ─────
const progressArc = (cx, cy, r, pct, color, label, value, x, y) => {
  const elements = [];
  // Background track circle
  elements.push(circle(cx, cy, r, 'none', { stroke: P.surface2, strokeWidth: 10 }));
  // Progress arc (approximate with clipped fill)
  elements.push(circle(cx, cy, r, 'none', {
    stroke: color,
    strokeWidth: 10,
    strokeDasharray: Math.round(2 * Math.PI * r),
    strokeDashoffset: Math.round(2 * Math.PI * r * (1 - pct / 100)),
    strokeLinecap: 'round',
  }));
  // Center number
  elements.push(text(value, cx, cy - 8, T.h2, P.text, { textAlign: 'center', anchor: 'middle' }));
  elements.push(text(label, cx, cy + 14, T.caption, P.textMid, { textAlign: 'center', anchor: 'middle' }));
  return elements;
};

// ── Helper: biometric wave ──────────────────────────────────────────────────
const wave = (x, y, w, h, color, points = 20) => {
  const pathPts = [];
  for (let i = 0; i <= points; i++) {
    const px = x + (w / points) * i;
    const t = i / points;
    // Create organic irregular wave
    const amplitude = h * 0.35;
    const base = y + h * 0.5;
    const py = base - Math.sin(t * Math.PI * 3.2 + 0.4) * amplitude
                     - Math.sin(t * Math.PI * 7.1 + 1.2) * amplitude * 0.35;
    pathPts.push({ x: Math.round(px), y: Math.round(py) });
  }
  // Build SVG-like path string (pencil stores as path points)
  return el('path', {
    x, y,
    points: pathPts,
    stroke: color,
    strokeWidth: 2.5,
    fill: 'none',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  });
};

// ── Helper: filled wave ─────────────────────────────────────────────────────
const waveFill = (x, y, w, h, stroke, fillColor, points = 24) => {
  const pathPts = [];
  for (let i = 0; i <= points; i++) {
    const px = x + (w / points) * i;
    const t = i / points;
    const amplitude = h * 0.3;
    const base = y + h * 0.42;
    const py = base - Math.sin(t * Math.PI * 4.1 + 0.2) * amplitude
                     - Math.sin(t * Math.PI * 9.3 + 0.8) * amplitude * 0.22
                     + Math.sin(t * Math.PI * 2.0 + 1.5) * amplitude * 0.18;
    pathPts.push({ x: Math.round(px), y: Math.round(py) });
  }
  return el('path', {
    x, y,
    points: pathPts,
    stroke,
    strokeWidth: 2,
    fill: fillColor,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    closePath: true,
    closeY: y + h,
  });
};

// ── Helper: tag pill ────────────────────────────────────────────────────────
const tag = (label, x, y, bg, textColor) => {
  const w = label.length * 7.5 + 20;
  return [
    rect(x, y, w, 26, bg, 13),
    text(label, x + w / 2, y + 13, T.labelSmall, textColor, { textAlign: 'center', anchor: 'middle' }),
  ];
};

// ── Helper: divider ─────────────────────────────────────────────────────────
const divider = (x, y, w) => rect(x, y, w, 1, P.surface2);

// ── Helper: metric card ─────────────────────────────────────────────────────
const metricCard = (x, y, w, h, label, value, unit, sub, color) => [
  rect(x, y, w, h, P.surface, 16),
  text(label.toUpperCase(), x + 16, y + 18, T.labelSmall, P.textFaint),
  text(value, x + 16, y + 56, T.scoreNum, color),
  text(unit, x + 16 + (value.length * 25), y + 30, T.label, P.textMid),
  text(sub, x + 16, y + h - 14, T.caption, P.textMid),
];

// ── Helper: nav bar ─────────────────────────────────────────────────────────
const navBar = (activeIdx = 0) => {
  const items = [
    { icon: '◎', label: 'Today' },
    { icon: '∿', label: 'Sleep' },
    { icon: '◈', label: 'Focus' },
    { icon: '∷', label: 'Insights' },
  ];
  const navEls = [
    rect(0, 812, 390, 78, P.surface, 0),
    rect(0, 812, 390, 1, P.surface2),
  ];
  items.forEach((item, i) => {
    const cx = 49 + i * 97;
    const isActive = i === activeIdx;
    navEls.push(text(item.icon, cx, 836, { size: 22, weight: 400, family: 'sans' }, isActive ? P.accent : P.textFaint, { textAlign: 'center', anchor: 'middle' }));
    navEls.push(text(item.label, cx, 857, T.labelSmall, isActive ? P.accent : P.textFaint, { textAlign: 'center', anchor: 'middle' }));
    if (isActive) {
      navEls.push(rect(cx - 16, 879, 32, 3, P.accent, 2));
    }
  });
  return navEls;
};

// ── Helper: status bar ──────────────────────────────────────────────────────
const statusBar = () => [
  rect(0, 0, 390, 44, P.bg),
  text('9:41', 20, 28, T.label, P.text),
  text('⬛⬛⬛  WiFi  100%', 290, 28, T.label, P.text),
];

// ── Screens ────────────────────────────────────────────────────────────────

function screenToday() {
  const els = [
    // Background
    rect(0, 0, 390, 890, P.bg),
    ...statusBar(),

    // Header
    text('MEND', 20, 72, T.h3, P.accent),
    text('Friday, Mar 28', 20, 94, T.body, P.textMid),
    // Avatar/ring indicator
    rect(330, 58, 44, 44, P.surface2, 22),
    text('○', 352, 83, { size: 22, weight: 300, family: 'sans' }, P.accent, { textAlign: 'center', anchor: 'middle' }),

    // HERO: Recovery score
    rect(20, 112, 350, 200, P.surface, 24),
    // Large editorial label
    text('RECOVERY', 40, 148, T.labelSmall, P.textFaint),
    text('SCORE', 40 + 85, 148, T.labelSmall, P.accent),
    // Giant number
    text('84', 40, 232, T.heroNum, P.text),
    // Subscript /100
    text('/ 100', 155, 218, T.h3, P.textMid),
    // Status tag
    ...tag('GOOD ↑ 6pts', 40, 244, P.accent + '22', P.accent),
    // Ring visual on right
    circle(300, 190, 52, 'none', { stroke: P.surface2, strokeWidth: 10 }),
    circle(300, 190, 52, 'none', { stroke: P.accent, strokeWidth: 10, strokeDasharray: 327, strokeDashoffset: 55, strokeLinecap: 'round' }),
    text('84%', 300, 196, T.h3, P.text, { textAlign: 'center', anchor: 'middle' }),

    // GRID: 3 metric cards
    // HRV
    rect(20, 328, 110, 100, P.surface, 16),
    text('HRV', 36, 350, T.labelSmall, P.textFaint),
    text('62', 36, 392, T.bigNum, P.accent, { fontSize: 36, fontWeight: 700 }),
    text('ms', 75, 378, T.caption, P.textMid),
    text('↑ healthy', 36, 416, T.caption, P.positive),

    // Sleep
    rect(140, 328, 110, 100, P.surface, 16),
    text('SLEEP', 156, 350, T.labelSmall, P.textFaint),
    text('7.4', 156, 392, T.bigNum, P.accent3, { fontSize: 36, fontWeight: 700 }),
    text('hrs', 198, 378, T.caption, P.textMid),
    text('↑ on track', 156, 416, T.caption, P.positive),

    // Resting HR
    rect(260, 328, 110, 100, P.surface, 16),
    text('RESTING', 276, 350, T.labelSmall, P.textFaint),
    text('58', 276, 392, T.bigNum, P.accent2, { fontSize: 36, fontWeight: 700 }),
    text('bpm', 315, 378, T.caption, P.textMid),
    text('↓ calm', 276, 416, T.caption, P.positive),

    // Today's recommendation card
    rect(20, 444, 350, 110, P.surface, 20),
    // Accent bar on left
    rect(20, 444, 4, 110, P.accent, 2),
    text('TODAY\'S FOCUS', 40, 467, T.labelSmall, P.accent),
    text('Your body is primed for', 40, 490, T.body, P.text),
    text('deep cognitive work.', 40, 510, T.body, P.text),
    text('Peak window: 10am – 1pm', 40, 534, T.bodySmall, P.textMid),
    ...tag('2.5h left', 40, 544, P.accent2 + '22', P.accent2),

    // Trend chart area
    rect(20, 570, 350, 130, P.surface, 20),
    text('WEEKLY RECOVERY TREND', 40, 592, T.labelSmall, P.textFaint),
    // Days
    ...[0,1,2,3,4,5,6].map(i => {
      const days = ['M','T','W','T','F','S','S'];
      const scores = [71, 68, 75, 79, 82, 78, 84];
      const x = 40 + i * 46;
      const barH = Math.round((scores[i] / 100) * 64);
      return [
        rect(x, 686 - barH, 26, barH, i === 6 ? P.accent : P.surface2, 4),
        text(days[i], x + 13, 698, T.caption, i === 6 ? P.accent : P.textFaint, { textAlign: 'center', anchor: 'middle' }),
      ];
    }).flat(),

    ...navBar(0),
  ];
  return {
    id: 'screen_today',
    name: 'Today',
    width: 390,
    height: 890,
    background: P.bg,
    elements: els,
  };
}

function screenSleep() {
  const els = [
    rect(0, 0, 390, 890, P.bg),
    ...statusBar(),

    // Header
    text('← Sleep', 20, 72, T.h3, P.text),
    text('Last Night', 20, 96, T.bodySmall, P.textMid),

    // Large editorial header
    text('7', 20, 190, T.heroNum, P.accent3),
    text('hrs', 108, 160, T.h2, P.textMid),
    text('24 min', 20, 222, T.h2, P.textMid),

    // Tag row
    ...tag('DEEP 22%', 20, 236, P.accent3 + '22', P.accent3),
    ...tag('REM 19%', 104, 236, P.accent + '22', P.accent),
    ...tag('Light 59%', 188, 236, P.textFaint + '22', P.textFaint),

    divider(20, 272, 350),

    // Sleep hypnogram (stage graph)
    rect(20, 280, 350, 140, P.surface, 20),
    text('SLEEP STAGES', 40, 304, T.labelSmall, P.textFaint),
    text('10pm', 40, 410, T.caption, P.textFaint),
    text('2am', 155, 410, T.caption, P.textFaint),
    text('6am', 305, 410, T.caption, P.textFaint),

    // Stage bars (simplified hypnogram rows)
    // Awake strip
    rect(40, 318, 310, 12, P.surface2, 2),
    rect(40, 318, 20, 12, P.warn, 2),
    rect(290, 318, 20, 12, P.warn, 2),
    // REM strip
    rect(40, 336, 310, 12, P.surface2, 2),
    rect(90, 336, 55, 12, P.accent, 2),
    rect(195, 336, 60, 12, P.accent, 2),
    rect(285, 336, 30, 12, P.accent, 2),
    // Deep strip
    rect(40, 354, 310, 12, P.surface2, 2),
    rect(55, 354, 70, 12, P.accent3, 2),
    rect(160, 354, 45, 12, P.accent3, 2),
    // Labels
    text('Awake', 356, 328, T.caption, P.textFaint),
    text('REM', 356, 346, T.caption, P.accent),
    text('Deep', 356, 364, T.caption, P.accent3),
    text('Light', 356, 382, T.caption, P.textFaint),
    // Light strip (rest)
    rect(40, 372, 310, 12, P.surface2, 2),
    rect(130, 372, 55, 12, P.textFaint + '88', 2),
    rect(230, 372, 40, 12, P.textFaint + '88', 2),

    // HRV during sleep — wave visualization
    rect(20, 436, 350, 130, P.surface, 20),
    text('HRV DURING SLEEP', 40, 460, T.labelSmall, P.textFaint),
    text('avg 62ms', 310, 460, T.caption, P.accent),
    waveFill(30, 470, 330, 80, P.accent, P.accent + '18'),
    // Baseline
    rect(30, 546, 330, 1, P.surface2),

    // Sleep quality score breakdown
    rect(20, 582, 350, 160, P.surface, 20),
    text('QUALITY BREAKDOWN', 40, 606, T.labelSmall, P.textFaint),

    ...[
      { label: 'Duration', score: 88, color: P.accent },
      { label: 'Efficiency', score: 91, color: P.accent },
      { label: 'Timing', score: 74, color: P.warn },
      { label: 'Restfulness', score: 82, color: P.accent3 },
    ].map((m, i) => {
      const y = 622 + i * 28;
      const barW = Math.round((m.score / 100) * 220);
      return [
        text(m.label, 40, y + 10, T.bodySmall, P.textMid),
        rect(150, y, 220, 14, P.surface2, 7),
        rect(150, y, barW, 14, m.color, 7),
        text(`${m.score}`, 376, y + 10, T.bodySmall, P.text, { textAlign: 'right', anchor: 'end' }),
      ];
    }).flat(),

    // Insight
    rect(20, 756, 350, 44, P.accent + '14', 12),
    text('💡 Sleep debt: 0.8 hrs this week — you\'re catching up well', 32, 778, T.caption, P.accent),

    ...navBar(1),
  ];
  return {
    id: 'screen_sleep',
    name: 'Sleep',
    width: 390,
    height: 890,
    background: P.bg,
    elements: els,
  };
}

function screenFocus() {
  const els = [
    rect(0, 0, 390, 890, P.bg),
    ...statusBar(),

    // Header
    text('Focus Windows', 20, 72, T.h1, P.text),
    text('AI-optimised for your biometrics', 20, 99, T.bodySmall, P.textMid),

    // Hero window card
    rect(20, 116, 350, 170, P.surface, 24),
    rect(20, 116, 350, 4, P.accent, 2),
    text('PEAK WINDOW', 40, 148, T.labelSmall, P.accent),
    text('10:00', 40, 210, T.heroNum, P.text, { fontSize: 64, letterSpacing: -3 }),
    text('—', 165, 196, T.h2, P.textMid),
    text('1:00 pm', 185, 210, T.heroNum, P.text, { fontSize: 64, letterSpacing: -3 }),
    text('Deep work · Strategy · Learning', 40, 234, T.body, P.textMid),
    ...tag('HRV ↑ 14%', 40, 252, P.accent + '22', P.accent),
    ...tag('Cortisol low', 120, 252, P.accent2 + '22', P.accent2),

    // Window timeline
    rect(20, 302, 350, 300, P.surface, 24),
    text('TODAY\'S WINDOWS', 40, 328, T.labelSmall, P.textFaint),

    // Timeline items
    ...[
      { time: '7:00 – 8:30', type: 'Morning Reset', sub: 'Light activity, hydration', color: P.accent3, icon: '○', active: false },
      { time: '10:00 – 1:00', type: 'Peak Cognitive', sub: 'Deep work, learning', color: P.accent, icon: '◉', active: true },
      { time: '2:00 – 3:30', type: 'Creative Flow', sub: 'Ideation, brainstorm', color: P.accent2, icon: '◎', active: false },
      { time: '5:00 – 6:30', type: 'Physical Prime', sub: 'Exercise, movement', color: P.warn, icon: '△', active: false },
    ].map((w, i) => {
      const y = 346 + i * 62;
      return [
        w.active ? rect(30, y - 6, 330, 52, P.accent + '10', 12) : null,
        text(w.icon, 46, y + 15, { size: 20, weight: 300, family: 'sans' }, w.color, { textAlign: 'center', anchor: 'middle' }),
        text(w.time, 68, y + 8, T.labelSmall, w.color),
        text(w.type, 68, y + 26, T.h3, w.active ? P.text : P.textMid),
        text(w.sub, 68, y + 42, T.caption, P.textFaint),
        w.active ? text('NOW →', 330, y + 28, T.labelSmall, P.accent, { textAlign: 'right', anchor: 'end' }) : null,
      ].filter(Boolean);
    }).flat(),

    // Readiness drivers
    rect(20, 618, 350, 150, P.surface, 24),
    text('READINESS DRIVERS', 40, 644, T.labelSmall, P.textFaint),

    ...[
      { label: 'Sleep quality', val: 84, color: P.accent },
      { label: 'HRV baseline', val: 91, color: P.accent },
      { label: 'Activity balance', val: 72, color: P.warn },
      { label: 'Stress load', val: 68, color: P.accent2 },
    ].map((d, i) => {
      const y = 660 + i * 24;
      const barW = Math.round((d.val / 100) * 180);
      return [
        text(d.label, 40, y + 9, T.bodySmall, P.textMid),
        rect(188, y, 180, 12, P.surface2, 6),
        rect(188, y, barW, 12, d.color, 6),
        text(`${d.val}`, 372, y + 9, T.caption, P.text, { textAlign: 'right', anchor: 'end' }),
      ];
    }).flat(),

    ...navBar(2),
  ];
  return {
    id: 'screen_focus',
    name: 'Focus',
    width: 390,
    height: 890,
    background: P.bg,
    elements: els,
  };
}

function screenInsights() {
  const els = [
    rect(0, 0, 390, 890, P.bg),
    ...statusBar(),

    // Header
    text('Insights', 20, 72, T.h1, P.text),
    text('Personalised · Updated daily', 20, 99, T.bodySmall, P.textMid),

    // Weekly summary editorial block
    rect(20, 116, 350, 130, P.surface, 24),
    text('THIS WEEK', 40, 142, T.labelSmall, P.textFaint),
    // Three big editorial stats in a row
    ...[
      { val: '84', label: 'avg recovery', color: P.accent },
      { val: '7.2', label: 'avg sleep hrs', color: P.accent3 },
      { val: '↑12%', label: 'hrv trend', color: P.positive },
    ].map((s, i) => {
      const x = 40 + i * 112;
      return [
        text(s.val, x, 202, T.scoreNum, s.color),
        text(s.label, x, 224, T.caption, P.textFaint),
        i < 2 ? rect(x + 96, 162, 1, 72, P.surface2) : null,
      ].filter(Boolean);
    }).flat(),

    // AI Insight cards
    ...[
      {
        icon: '◎',
        title: 'HRV trending up for 5 days',
        body: 'Your nervous system is responding well to this week\'s lighter training load. Keep it consistent.',
        tag: 'Recovery',
        tagColor: P.accent,
        y: 262,
      },
      {
        icon: '∿',
        title: 'Sleep timing shifted earlier',
        body: 'You\'re falling asleep ~40 min earlier this week. This correlates with your improved morning HRV.',
        tag: 'Sleep',
        tagColor: P.accent3,
        y: 390,
      },
      {
        icon: '△',
        title: 'Cortisol spike Wed afternoon',
        body: 'Elevated stress markers detected 2–4pm Wednesday. Consider a 10-min breathing session in that window.',
        tag: 'Stress',
        tagColor: P.accent2,
        y: 518,
      },
      {
        icon: '◈',
        title: 'Your peak focus window is stable',
        body: '10am–1pm has been consistently your highest cognitive readiness window for 9 days running.',
        tag: 'Focus',
        tagColor: P.positive,
        y: 646,
      },
    ].map(card => [
      rect(20, card.y, 350, 112, P.surface, 20),
      rect(20, card.y, 4, 112, card.tagColor, 2),
      text(card.icon, 44, card.y + 26, { size: 22, weight: 300, family: 'sans' }, card.tagColor, { anchor: 'middle', textAlign: 'center' }),
      ...tag(card.tag, 66, card.y + 16, card.tagColor + '22', card.tagColor),
      text(card.title, 66, card.y + 48, T.h3, P.text),
      text(card.body.slice(0, 55), 66, card.y + 68, T.caption, P.textMid),
      text(card.body.slice(55), 66, card.y + 82, T.caption, P.textMid),
      text('→', 356, card.y + 56, T.body, P.textFaint, { anchor: 'end', textAlign: 'right' }),
    ]).flat(),

    ...navBar(3),
  ];
  return {
    id: 'screen_insights',
    name: 'Insights',
    width: 390,
    height: 890,
    background: P.bg,
    elements: els,
  };
}

function screenOnboarding() {
  const els = [
    rect(0, 0, 390, 890, P.bg),
    ...statusBar(),

    // Large breathing animation placeholder
    // Concentric soft circles
    circle(195, 320, 140, P.accent + '08'),
    circle(195, 320, 108, P.accent + '12'),
    circle(195, 320, 76, P.accent + '1A'),
    circle(195, 320, 48, P.accent + '2A'),
    circle(195, 320, 22, P.accent + '40'),

    // Ring label
    text('○', 195, 327, { size: 32, weight: 300, family: 'sans' }, P.accent, { anchor: 'middle', textAlign: 'center' }),

    // Welcome copy
    text('Good morning,', 195, 494, T.label, P.textFaint, { anchor: 'middle', textAlign: 'center' }),
    text('Alex.', 195, 530, { size: 48, weight: 700, family: 'serif', letterSpacing: -2 }, P.text, { anchor: 'middle', textAlign: 'center' }),

    divider(80, 550, 230),

    text('Your recovery score is ready.', 195, 580, T.body, P.textMid, { anchor: 'middle', textAlign: 'center' }),

    // CTA
    rect(40, 618, 310, 56, P.accent, 28),
    text('See Today\'s Score', 195, 651, T.h3, '#FFFFFF', { anchor: 'middle', textAlign: 'center' }),

    // Secondary
    text('Connected to MEND Ring · Synced 2 min ago', 195, 694, T.caption, P.textFaint, { anchor: 'middle', textAlign: 'center' }),

    // Bottom tips
    rect(20, 726, 350, 64, P.surface, 16),
    text('⚡', 40, 763, { size: 22, weight: 400, family: 'sans' }, P.accent2),
    text('Your weekly streak: 14 days active', 72, 750, T.bodySmall, P.text),
    text('Longest ever — keep it going.', 72, 768, T.caption, P.textFaint),

    ...navBar(0),
  ];
  return {
    id: 'screen_onboarding',
    name: 'Welcome',
    width: 390,
    height: 890,
    background: P.bg,
    elements: els,
  };
}

// ── Assemble pen file ───────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'MEND — Recovery Intelligence',
  description: 'Light-mode smart ring companion app. Warm parchment (#F5F2EC) base, editorial serif numbers, forest green + terra cotta palette. Inspired by Dribbble\'s #1 popular shot "Smart Ring App — Health Tracking Mobile UI" (12.8k views) and Dawn AI mental health app (lapa.ninja). Challenge: typographically-driven biometric dashboard using editorial number hierarchy and organic wave data visualizations in a genuinely warm light theme.',
  metadata: {
    theme: 'light',
    archetype: 'health-wearable',
    slug: SLUG,
    palette: {
      primary: P.accent,
      secondary: P.accent2,
      tertiary: P.accent3,
      bg: P.bg,
      surface: P.surface,
      text: P.text,
    },
    inspiration: 'Dribbble popular #1 "Smart Ring App — Health Tracking Mobile UI" (12.8k views); Dawn AI mental health app on lapa.ninja ("evidence-based AI for mental wellness"); minimal.gallery editorial warmth — organic, typographic, human.',
    designChallenge: 'Build a smart ring biometric companion using large editorial serif numbers as primary visual hero, organic HRV wave visualizations, and warm parchment palette — shifting away from cold-dashboard clichés toward something human and tactile.',
    createdAt: new Date().toISOString(),
    version: '1.0',
  },
  screens: [
    screenOnboarding(),
    screenToday(),
    screenSleep(),
    screenFocus(),
    screenInsights(),
  ],
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ Wrote ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
console.log(`  Screens: ${pen.screens.length}`);
console.log(`  Slug: ${SLUG}`);
console.log(`  Theme: ${pen.metadata.theme}`);
