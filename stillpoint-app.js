/**
 * STILLPOINT — Enter the stillness.
 * Cinematic dark focus-session app. Inspired by supercommon systems (land-book.com) —
 * their "stillness vs motion" concept: ultra-dark near-black bg, cinematic negative
 * space, minimal serif copy, stripped-back chrome. Dark theme.
 *
 * Run: node stillpoint-app.js
 */

const fs = require('fs');

// ── Palette ───────────────────────────────────────────────────────────────────
const p = {
  bg:       '#06060E',   // near-black with faint blue depth
  surface:  '#0D0D1E',   // deep navy surface
  surfaceB: '#14142C',   // slightly lifted surface
  border:   '#1C1C3A',   // subtle border
  text:     '#EDE8E0',   // warm off-white
  textMid:  '#A8A39A',   // mid warm gray
  textLow:  '#585462',   // muted violet-gray
  accent:   '#8BB8FF',   // ice blue — calm electric
  accent2:  '#C4A882',   // warm amber/gold
  glow:     'rgba(139,184,255,0.12)', // ice blue glow
  glowWarm: 'rgba(196,168,130,0.10)', // amber glow
};

const W = 390, H = 844;

// ── Helpers ───────────────────────────────────────────────────────────────────
let idCounter = 1;
const uid = () => `el_${(idCounter++).toString(36)}`;

function rect(x, y, w, h, fill, opts = {}) {
  return { id: uid(), type: 'rect', x, y, w, h, fill,
    rx: opts.rx ?? 0, opacity: opts.opacity ?? 1,
    stroke: opts.stroke, strokeWidth: opts.strokeWidth ?? 1 };
}
function text(x, y, str, size, color, opts = {}) {
  return { id: uid(), type: 'text', x, y, text: str, size, color,
    font: opts.font ?? 'Inter', weight: opts.weight ?? 400,
    align: opts.align ?? 'left', opacity: opts.opacity ?? 1,
    letterSpacing: opts.ls ?? 0, lineHeight: opts.lh ?? 1.4 };
}
function circle(x, y, r, fill, opts = {}) {
  return { id: uid(), type: 'circle', x, y, r, fill,
    stroke: opts.stroke, strokeWidth: opts.strokeWidth ?? 1,
    opacity: opts.opacity ?? 1 };
}
function line(x1, y1, x2, y2, color, opts = {}) {
  return { id: uid(), type: 'line', x1, y1, x2, y2, stroke: color,
    strokeWidth: opts.w ?? 1, opacity: opts.opacity ?? 1 };
}
function arc(cx, cy, r, startDeg, endDeg, color, opts = {}) {
  // Arc as SVG path approximation stored as polygon for pencil compatibility
  const start = (startDeg - 90) * Math.PI / 180;
  const end   = (endDeg - 90) * Math.PI / 180;
  const pts = [];
  const steps = 64;
  for (let i = 0; i <= steps; i++) {
    const a = start + (end - start) * (i / steps);
    pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }
  return { id: uid(), type: 'polyline', points: pts, stroke: color,
    strokeWidth: opts.w ?? 2, fill: 'none', opacity: opts.opacity ?? 1 };
}
function dot(x, y, r, fill) {
  return circle(x, y, r, fill);
}

// ── Status Bar ────────────────────────────────────────────────────────────────
function statusBar(elements) {
  elements.push(text(20, 14, '9:41', 13, p.textMid, { weight: 500 }));
  elements.push(text(W - 20, 14, '●●●', 9, p.textMid, { align: 'right' }));
}

// ── Bottom Nav ────────────────────────────────────────────────────────────────
function bottomNav(elements, active) {
  const navY = H - 72;
  elements.push(rect(0, navY, W, 72, p.bg));
  elements.push(line(0, navY, W, navY, p.border));
  const tabs = [
    { label: 'FOCUS', x: W * 0.17 },
    { label: 'LOG',   x: W * 0.5  },
    { label: 'SELF',  x: W * 0.83 },
  ];
  tabs.forEach((t, i) => {
    const isActive = i === active;
    const c = isActive ? p.accent : p.textLow;
    elements.push(text(t.x, navY + 24, t.label, 9, c,
      { align: 'center', weight: isActive ? 600 : 400, ls: 2 }));
    if (isActive) {
      elements.push(rect(t.x - 12, navY + 2, 24, 1, p.accent, { rx: 1 }));
    }
  });
}

// ── Screen 1: STILLPOINT — Ready State ───────────────────────────────────────
function screenReady() {
  const els = [];
  els.push(rect(0, 0, W, H, p.bg));
  statusBar(els);

  // Ambient glow — very faint circle behind timer
  els.push(circle(W / 2, 320, 160, p.glow, { opacity: 0.6 }));
  els.push(circle(W / 2, 320, 100, p.glow, { opacity: 0.4 }));

  // Wordmark top center
  els.push(text(W / 2, 58, 'STILLPOINT', 11, p.textLow,
    { align: 'center', weight: 600, ls: 4 }));

  // Session type label
  els.push(text(W / 2, 200, 'DEEP WORK', 10, p.textLow,
    { align: 'center', weight: 500, ls: 3 }));

  // Large duration display
  els.push(text(W / 2, 270, '90', 96, p.text,
    { align: 'center', weight: 200, font: 'Inter', ls: -4 }));
  els.push(text(W / 2, 315, 'minutes', 13, p.textMid,
    { align: 'center', weight: 300, ls: 1 }));

  // Thin divider
  els.push(line(W / 2 - 32, 348, W / 2 + 32, 348, p.border, { w: 1 }));

  // Philosophical line — the "stillness vs motion" concept
  els.push(text(W / 2, 380, 'enter the stillness.', 14, p.text,
    { align: 'center', weight: 300, ls: 0.5, lh: 1.6 }));
  els.push(text(W / 2, 404, 'silence all motion.', 13, p.textMid,
    { align: 'center', weight: 300, ls: 0.5, lh: 1.6 }));

  // Begin button — minimal capsule
  els.push(rect(W / 2 - 72, 464, 144, 44, p.accent, { rx: 22 }));
  els.push(text(W / 2, 491, 'BEGIN', 12, '#06060E',
    { align: 'center', weight: 700, ls: 3 }));

  // Adjust duration — subtle links
  els.push(text(W / 2 - 52, 536, '60 min', 12, p.textLow,
    { align: 'center', weight: 400 }));
  els.push(text(W / 2, 536, '·', 12, p.textLow, { align: 'center' }));
  els.push(text(W / 2 + 52, 536, '120 min', 12, p.textLow,
    { align: 'center', weight: 400 }));

  // Ambient bottom note
  els.push(text(W / 2, 610, 'last session · 3h 20m yesterday', 11, p.textLow,
    { align: 'center', weight: 300 }));

  bottomNav(els, 0);
  return els;
}

// ── Screen 2: IN SESSION — Active Focus ──────────────────────────────────────
function screenInSession() {
  const els = [];
  els.push(rect(0, 0, W, H, p.bg));
  statusBar(els);

  // Ambient warm glow for "in the zone"
  els.push(circle(W / 2, 300, 180, p.glowWarm, { opacity: 0.5 }));
  els.push(circle(W / 2, 300, 110, p.glowWarm, { opacity: 0.3 }));

  // Session label
  els.push(text(W / 2, 64, 'IN SESSION', 10, p.textLow,
    { align: 'center', weight: 500, ls: 3 }));

  // Outer ring track (faint)
  els.push({ id: uid(), type: 'circle', x: W / 2, y: 300, r: 128,
    fill: 'none', stroke: p.border, strokeWidth: 2 });

  // Progress arc — 68% complete (drawn as partial ring using polyline)
  els.push(arc(W / 2, 300, 128, 0, 245, p.accent, { w: 2 }));

  // Arc end dot
  const arcEndAngle = (245 - 90) * Math.PI / 180;
  const arcEndX = W / 2 + Math.cos(arcEndAngle) * 128;
  const arcEndY = 300 + Math.sin(arcEndAngle) * 128;
  els.push(circle(arcEndX, arcEndY, 5, p.accent));

  // Timer remaining
  els.push(text(W / 2, 278, '28:44', 52, p.text,
    { align: 'center', weight: 200, ls: -2 }));
  els.push(text(W / 2, 315, 'remaining', 12, p.textMid,
    { align: 'center', weight: 300, ls: 0.5 }));

  // Pulsing dot indicator
  els.push(circle(W / 2, 340, 3, p.accent2));
  els.push(circle(W / 2, 340, 7, p.glowWarm, { opacity: 0.6 }));

  // Session meta
  els.push(text(W / 2, 466, 'DEEP WORK · SESSION 3', 10, p.textLow,
    { align: 'center', weight: 500, ls: 2 }));

  // Ambient quote
  els.push(text(W / 2, 510, '"stillness is where clarity is born"', 13,
    p.textMid, { align: 'center', weight: 300, ls: 0 }));

  // Control row — pause + end
  const btnY = 576;
  els.push(rect(W / 2 - 100, btnY, 88, 40, p.surfaceB, { rx: 20,
    stroke: p.border, strokeWidth: 1 }));
  els.push(text(W / 2 - 56, btnY + 25, 'PAUSE', 11, p.textMid,
    { align: 'center', weight: 500, ls: 2 }));

  els.push(rect(W / 2 + 12, btnY, 88, 40, p.surfaceB, { rx: 20,
    stroke: p.border, strokeWidth: 1 }));
  els.push(text(W / 2 + 56, btnY + 25, 'END', 11, p.textLow,
    { align: 'center', weight: 500, ls: 2 }));

  // Distraction counter
  els.push(text(W / 2, 648, '0 distractions', 11, p.textLow,
    { align: 'center', weight: 300 }));

  bottomNav(els, 0);
  return els;
}

// ── Screen 3: BREAK — Motion State ───────────────────────────────────────────
function screenBreak() {
  const els = [];
  els.push(rect(0, 0, W, H, p.bg));
  statusBar(els);

  // Slight green-teal tint for rest/motion state
  const restGlow = 'rgba(80,200,160,0.08)';
  els.push(circle(W / 2, 310, 200, restGlow));

  els.push(text(W / 2, 64, 'MOTION', 10, p.textLow,
    { align: 'center', weight: 500, ls: 3 }));

  // Break headline
  els.push(text(W / 2, 180, 'surface.', 42, p.text,
    { align: 'center', weight: 200, ls: -1 }));
  els.push(text(W / 2, 228, 'breathe. move. return.', 14, p.textMid,
    { align: 'center', weight: 300, ls: 0.5 }));

  // Break timer
  els.push(text(W / 2, 308, '05:00', 64, p.text,
    { align: 'center', weight: 100, ls: -3 }));
  els.push(text(W / 2, 352, 'short break', 12, p.textLow,
    { align: 'center', weight: 300, ls: 1 }));

  // Thin divider
  els.push(line(W / 2 - 40, 380, W / 2 + 40, 380, p.border));

  // Session progress dots
  els.push(text(W / 2, 420, 'session progress', 10, p.textLow,
    { align: 'center', weight: 400, ls: 1 }));
  const dotData = [
    { done: true }, { done: true }, { done: true }, { done: false }
  ];
  dotData.forEach((d, i) => {
    const dx = W / 2 - 42 + i * 28;
    els.push(rect(dx, 438, 18, 4,
      d.done ? p.accent2 : p.border, { rx: 2 }));
  });

  // Mindful prompt
  els.push(text(W / 2, 490, 'What will you focus on next?', 13, p.textMid,
    { align: 'center', weight: 300, ls: 0 }));

  // Single input-style field
  els.push(rect(40, 514, W - 80, 44, p.surfaceB, { rx: 8,
    stroke: p.border, strokeWidth: 1 }));
  els.push(text(60, 541, 'intention for next session…', 13, p.textLow,
    { weight: 300 }));

  // Return button
  els.push(rect(W / 2 - 64, 592, 128, 44, 'rgba(139,184,255,0.12)', { rx: 22,
    stroke: p.accent, strokeWidth: 1 }));
  els.push(text(W / 2, 619, 'RESUME FOCUS', 11, p.accent,
    { align: 'center', weight: 600, ls: 2 }));

  // Skip break
  els.push(text(W / 2, 660, 'skip break', 12, p.textLow,
    { align: 'center', weight: 300 }));

  bottomNav(els, 0);
  return els;
}

// ── Screen 4: SESSION COMPLETE ────────────────────────────────────────────────
function screenComplete() {
  const els = [];
  els.push(rect(0, 0, W, H, p.bg));
  statusBar(els);

  // Warm radial glow — completion warmth
  els.push(circle(W / 2, 260, 200, p.glowWarm, { opacity: 0.7 }));
  els.push(circle(W / 2, 260, 110, p.glowWarm, { opacity: 0.5 }));

  els.push(text(W / 2, 64, 'STILLPOINT', 10, p.textLow,
    { align: 'center', weight: 500, ls: 4 }));

  // Completion badge — minimal ring check
  els.push(circle(W / 2, 188, 40, 'none',
    { stroke: p.accent2, strokeWidth: 1 }));
  els.push(text(W / 2, 196, '✓', 22, p.accent2, { align: 'center' }));

  // Headline
  els.push(text(W / 2, 268, 'session complete.', 26, p.text,
    { align: 'center', weight: 200, ls: -0.5 }));
  els.push(text(W / 2, 300, 'you held the stillness.', 14, p.textMid,
    { align: 'center', weight: 300 }));

  // Stats grid — 2×2 minimal cards
  const statsY = 344;
  const cardW = (W - 56) / 2;
  const stats = [
    { label: 'FOCUSED', value: '1h 30m', sub: 'session length' },
    { label: 'DEPTH',   value: '94',     sub: 'focus score'    },
    { label: 'STREAK',  value: '7',      sub: 'days running'   },
    { label: 'TODAY',   value: '3h 20m', sub: 'total deep work' },
  ];
  stats.forEach((s, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const sx = 20 + col * (cardW + 16);
    const sy = statsY + row * 90;
    els.push(rect(sx, sy, cardW, 76, p.surfaceB, { rx: 8,
      stroke: p.border, strokeWidth: 1 }));
    els.push(text(sx + 14, sy + 20, s.label, 8, p.textLow,
      { weight: 600, ls: 2 }));
    els.push(text(sx + 14, sy + 44, s.value, 24, p.text, { weight: 200 }));
    els.push(text(sx + 14, sy + 62, s.sub, 10, p.textLow, { weight: 300 }));
  });

  // CTA
  els.push(rect(W / 2 - 80, 558, 160, 44, p.accent, { rx: 22 }));
  els.push(text(W / 2, 585, 'NEW SESSION', 11, '#06060E',
    { align: 'center', weight: 700, ls: 2 }));

  // Share
  els.push(text(W / 2, 624, 'share · reflect · rest', 12, p.textLow,
    { align: 'center', weight: 300, ls: 1 }));

  bottomNav(els, 0);
  return els;
}

// ── Screen 5: LOG — History ───────────────────────────────────────────────────
function screenLog() {
  const els = [];
  els.push(rect(0, 0, W, H, p.bg));
  statusBar(els);

  els.push(text(20, 56, 'LOG', 20, p.text, { weight: 200, ls: 3 }));
  els.push(text(20, 80, 'your stillness record', 12, p.textLow, { weight: 300 }));

  // Weekly bar chart — minimal
  els.push(text(20, 114, 'THIS WEEK', 9, p.textLow, { weight: 600, ls: 2 }));
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const heights = [80, 50, 100, 90, 65, 30, 0];
  const maxH = 100;
  const barW = 30, gap = (W - 40 - days.length * barW) / (days.length - 1);
  days.forEach((d, i) => {
    const bx = 20 + i * (barW + gap);
    const h = heights[i];
    const isToday = i === 3;
    const barColor = isToday ? p.accent : p.surfaceB;
    // empty bar track
    els.push(rect(bx, 130, barW, maxH, p.surfaceB, { rx: 4 }));
    if (h > 0) {
      els.push(rect(bx, 130 + (maxH - h), barW, h,
        isToday ? p.accent : p.border, { rx: 4 }));
    }
    els.push(text(bx + barW / 2, 244, d, 9,
      isToday ? p.accent : p.textLow, { align: 'center', weight: isToday ? 600 : 400 }));
  });
  // Today highlight value
  els.push(text(20 + 3 * (barW + gap) + barW / 2, 122, '5h',
    9, p.accent, { align: 'center', weight: 600 }));

  // Divider
  els.push(line(20, 266, W - 20, 266, p.border));

  // Session list
  els.push(text(20, 286, 'RECENT', 9, p.textLow, { weight: 600, ls: 2 }));
  const sessions = [
    { time: 'Today, 9:00 AM',   dur: '90m', score: '94', type: 'Deep Work' },
    { time: 'Today, 7:10 AM',   dur: '60m', score: '87', type: 'Writing'  },
    { time: 'Yesterday, 3 PM',  dur: '120m',score: '91', type: 'Deep Work' },
    { time: 'Yesterday, 8 AM',  dur: '45m', score: '78', type: 'Reading'  },
  ];
  sessions.forEach((s, i) => {
    const sy = 306 + i * 72;
    els.push(rect(20, sy, W - 40, 60, p.surfaceB, { rx: 8,
      stroke: p.border, strokeWidth: 1 }));
    els.push(text(36, sy + 20, s.type, 13, p.text, { weight: 400 }));
    els.push(text(36, sy + 40, s.time, 11, p.textLow, { weight: 300 }));
    // Duration badge
    els.push(rect(W - 56, sy + 14, 36, 22, p.border, { rx: 4 }));
    els.push(text(W - 38, sy + 29, s.dur, 10, p.textMid,
      { align: 'center', weight: 500 }));
    // Score dot
    els.push(circle(W - 68, sy + 25, 5,
      parseInt(s.score) >= 90 ? p.accent : p.accent2));
  });

  bottomNav(els, 1);
  return els;
}

// ── Screen 6: SELF — Profile / Settings ──────────────────────────────────────
function screenSelf() {
  const els = [];
  els.push(rect(0, 0, W, H, p.bg));
  statusBar(els);

  els.push(text(20, 56, 'SELF', 20, p.text, { weight: 200, ls: 3 }));

  // Avatar ring
  els.push(circle(W - 52, 66, 28, p.surfaceB,
    { stroke: p.border, strokeWidth: 1 }));
  els.push(text(W - 52, 74, 'AK', 13, p.textMid,
    { align: 'center', weight: 500 }));

  // Stats headline row
  const kpiY = 106;
  els.push(line(0, kpiY, W, kpiY, p.border));
  const kpis = [
    { v: '247', l: 'SESSIONS' },
    { v: '7',   l: 'DAY STREAK' },
    { v: '312h', l: 'TOTAL FOCUS' },
  ];
  kpis.forEach((k, i) => {
    const kx = 40 + i * 110;
    els.push(text(kx, kpiY + 28, k.v, 22, p.text,
      { align: 'center', weight: 200 }));
    els.push(text(kx, kpiY + 46, k.l, 8, p.textLow,
      { align: 'center', weight: 600, ls: 1.5 }));
  });
  els.push(line(0, kpiY + 62, W, kpiY + 62, p.border));

  // Rhythm settings
  els.push(text(20, 192, 'RHYTHM', 9, p.textLow, { weight: 600, ls: 2 }));
  const settings = [
    { label: 'Focus duration',   val: '90 min'  },
    { label: 'Short break',      val: '5 min'   },
    { label: 'Long break',       val: '20 min'  },
    { label: 'Sessions per set', val: '4'       },
  ];
  settings.forEach((s, i) => {
    const sy = 212 + i * 52;
    els.push(line(20, sy, W - 20, sy, p.border));
    els.push(text(20, sy + 26, s.label, 13, p.text, { weight: 300 }));
    els.push(text(W - 20, sy + 26, s.val, 13, p.accent, { align: 'right', weight: 400 }));
  });
  els.push(line(20, 212 + settings.length * 52, W - 20, 212 + settings.length * 52, p.border));

  // Ambient mode toggle
  const ambY = 440;
  els.push(text(20, ambY, 'AMBIENT', 9, p.textLow, { weight: 600, ls: 2 }));
  const toggles = [
    { label: 'Focus sounds',   on: true  },
    { label: 'Break prompts',  on: true  },
    { label: 'Lock distractions', on: false },
    { label: 'Notifications',  on: false },
  ];
  toggles.forEach((t, i) => {
    const ty = 460 + i * 52;
    els.push(line(20, ty, W - 20, ty, p.border));
    els.push(text(20, ty + 26, t.label, 13, p.text, { weight: 300 }));
    // Toggle pill
    const twOn = t.on;
    els.push(rect(W - 60, ty + 16, 40, 20,
      twOn ? p.accent : p.surfaceB, { rx: 10 }));
    els.push(circle(twOn ? W - 28 : W - 48, ty + 26, 7, p.bg));
  });

  bottomNav(els, 2);
  return els;
}

// ── Build PEN ─────────────────────────────────────────────────────────────────
const screens = [
  { name: 'Ready — Enter',      elements: screenReady()      },
  { name: 'In Session',         elements: screenInSession()   },
  { name: 'Break — Motion',     elements: screenBreak()       },
  { name: 'Session Complete',   elements: screenComplete()    },
  { name: 'Log — History',      elements: screenLog()         },
  { name: 'Self — Settings',    elements: screenSelf()        },
];

const pen = {
  version: '2.8',
  meta: {
    name: 'STILLPOINT',
    description: 'Enter the stillness. Cinematic dark focus-session app.',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
  },
  canvas: { width: W, height: H, background: p.bg },
  screens: screens.map((s, i) => ({
    id: `screen_${i + 1}`,
    name: s.name,
    width: W,
    height: H,
    background: p.bg,
    elements: s.elements,
  })),
};

fs.writeFileSync('stillpoint.pen', JSON.stringify(pen, null, 2));
console.log('✓ stillpoint.pen written —', screens.length, 'screens,',
  screens.reduce((a, s) => a + s.elements.length, 0), 'elements');
