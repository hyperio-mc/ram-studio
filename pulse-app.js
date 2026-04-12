// PULSE — AI Voice Journal
// Inspired by: Format Podcasts (darkmodedesign.com) — near-black warm bg #0E0202,
// "Neue Haas Grotesk" grotesque typography, audio-first UI converting recordings to insight.
// Theme: DARK — near-black with amber warmth
// Slug: pulse-voice

const fs = require('fs');

const W = 390, H = 844;

const P = {
  bg:       '#0C0909',   // near-black, warm undertone (Format-inspired)
  surface:  '#181212',   // cards
  surface2: '#221A1A',   // elevated
  amber:    '#F5A623',   // warm gold accent — audio glow
  amber2:   '#FF6B35',   // secondary — warm coral
  amberDim: 'rgba(245,166,35,0.15)',
  text:     '#F0EBE3',   // warm off-white
  textMid:  'rgba(240,235,227,0.55)',
  textDim:  'rgba(240,235,227,0.3)',
  red:      '#E05252',
  green:    '#52C98A',
  wave:     'rgba(245,166,35,0.6)',
};

// ─── primitives ───────────────────────────────────────────────────────────────

function rect(x, y, w, h, fill, opts = {}) {
  const o = { type: 'rect', x, y, w, h, fill };
  if (opts.r) o.r = opts.r;
  if (opts.stroke) { o.stroke = opts.stroke; o.strokeWidth = opts.strokeWidth || 1; }
  if (opts.opacity !== undefined) o.opacity = opts.opacity;
  return o;
}

function text(str, x, y, opts = {}) {
  return {
    type: 'text', x, y, text: String(str),
    size: opts.size || 14,
    weight: opts.weight || 400,
    color: opts.color || P.text,
    align: opts.align || 'left',
    font: opts.font || 'SF Pro Display',
    ls: opts.ls || 0,
    lh: opts.lh || 1.4,
    ...(opts.italic ? { italic: true } : {}),
  };
}

function circle(cx, cy, r, fill, opts = {}) {
  return { type: 'ellipse', x: cx - r, y: cy - r, w: r * 2, h: r * 2, fill, ...opts };
}

function line(x1, y1, x2, y2, color, width = 1) {
  return { type: 'line', x1, y1, x2, y2, stroke: color, strokeWidth: width };
}

// ─── components ───────────────────────────────────────────────────────────────

function statusBar() {
  return [
    rect(0, 0, W, 44, P.bg),
    text('9:41', 20, 14, { size: 15, weight: 600, color: P.text }),
    text('●●●  ▶  ■■■■', W - 20, 14, { size: 11, weight: 400, color: P.text, align: 'right' }),
  ];
}

function navbar(items, activeIdx) {
  const els = [rect(0, H - 80, W, 80, P.surface)];
  const icons = ['◉', '⊕', '≡', '⚡', '○'];
  const labels = ['Today', 'Record', 'Digest', 'Insights', 'Profile'];
  items.forEach((_, i) => {
    const x = 39 + i * 78;
    const isActive = i === activeIdx;
    if (isActive) {
      els.push(rect(x - 24, H - 76, 48, 3, P.amber, { r: 2 }));
    }
    els.push(text(icons[i], x, H - 60, { size: 20, align: 'center', color: isActive ? P.amber : P.textDim }));
    els.push(text(labels[i], x, H - 34, { size: 10, weight: isActive ? 600 : 400, align: 'center', color: isActive ? P.amber : P.textDim }));
  });
  return els;
}

// Waveform visualizer
function waveform(x, y, w, h, color, seed = 42) {
  const els = [];
  const bars = 48;
  const bw = 3;
  const gap = (w - bars * bw) / (bars - 1);
  const rng = (s) => {
    let n = Math.sin(s * 127.1 + seed * 311.7) * 43758.5453;
    return Math.abs(n - Math.floor(n));
  };
  for (let i = 0; i < bars; i++) {
    const bh = 6 + rng(i) * (h - 6);
    const by = y + (h - bh) / 2;
    const bx = x + i * (bw + gap);
    const alpha = 0.3 + rng(i + 100) * 0.7;
    els.push(rect(bx, by, bw, bh, color.replace('0.6', String(alpha.toFixed(2))), { r: 2 }));
  }
  return els;
}

// Progress arc (for mood/energy)
function progressRing(cx, cy, r, pct, color) {
  const els = [];
  els.push(circle(cx, cy, r, 'none', { stroke: P.surface2, strokeWidth: 3 }));
  // Draw arc segments
  const steps = Math.floor(pct * 20);
  for (let i = 0; i < steps; i++) {
    const angle = (i / 20) * Math.PI * 2 - Math.PI / 2;
    const ax = cx + Math.cos(angle) * r;
    const ay = cy + Math.sin(angle) * r;
    els.push(circle(ax, ay, 2.5, color));
  }
  return els;
}

// Tag pill
function tag(label, x, y, color, bg) {
  const w = label.length * 7.5 + 20;
  return [
    rect(x, y, w, 24, bg, { r: 12 }),
    text(label, x + w/2, y + 5, { size: 11, weight: 600, color, align: 'center' }),
  ];
}

// ─── screens ──────────────────────────────────────────────────────────────────

function screenToday() {
  const els = [rect(0, 0, W, H, P.bg), ...statusBar()];

  // Header
  els.push(text('PULSE', 20, 54, { size: 12, weight: 700, color: P.amber, ls: 3 }));
  els.push(text('Mon, Mar 31', W - 20, 54, { size: 13, weight: 400, color: P.textMid, align: 'right' }));

  // Hero waveform card
  els.push(rect(20, 76, W - 40, 160, P.surface, { r: 16 }));
  els.push(rect(20, 76, W - 40, 160, P.amberDim, { r: 16 }));

  // AI-generated title for today
  els.push(text('Today\'s Voice', 36, 100, { size: 13, weight: 500, color: P.textMid }));
  els.push(text('"Productive morning,', 36, 122, { size: 18, weight: 700, color: P.text }));
  els.push(text(' uncertain afternoon"', 36, 144, { size: 18, weight: 700, color: P.text }));

  // Waveform in card
  els.push(...waveform(30, 168, W - 60, 40, P.wave, 77));

  // Play button
  els.push(circle(W - 50, 176, 18, P.amber));
  els.push(text('▶', W - 50, 168, { size: 14, color: P.bg, align: 'center', weight: 700 }));
  els.push(text('3 entries · 14m 22s', 36, 218, { size: 12, color: P.textDim }));

  // Section: entries today
  els.push(text('ENTRIES', 20, 254, { size: 11, weight: 700, color: P.textDim, ls: 2 }));

  const entries = [
    { time: '8:14 AM', title: 'Morning intentions', dur: '2m 07s', mood: P.amber },
    { time: '12:33 PM', title: 'Lunch thoughts on project scope', dur: '6m 42s', mood: P.textMid },
    { time: '5:51 PM', title: 'Reflection + tomorrow planning', dur: '5m 33s', mood: P.green },
  ];

  entries.forEach((e, i) => {
    const ey = 276 + i * 80;
    els.push(rect(20, ey, W - 40, 68, P.surface, { r: 12 }));
    // mood dot
    els.push(circle(44, ey + 22, 5, e.mood));
    els.push(text(e.time, 58, ey + 14, { size: 11, color: P.textDim }));
    els.push(text(e.title, 58, ey + 32, { size: 15, weight: 600, color: P.text }));
    els.push(text(e.dur, 58, ey + 50, { size: 11, color: P.textDim }));
    // waveform mini
    els.push(...waveform(W - 100, ey + 12, 70, 44, P.wave, i * 17 + 3));
  });

  // Bottom nav
  els.push(...navbar([0,1,2,3,4], 0));

  return { id: 'today', label: 'Today', elements: els };
}

function screenRecord() {
  const els = [rect(0, 0, W, H, P.bg), ...statusBar()];

  // Header
  els.push(text('Record', 20, 54, { size: 22, weight: 700, color: P.text }));

  // AI prompt
  els.push(rect(20, 80, W - 40, 50, P.surface, { r: 12 }));
  els.push(circle(38, 105, 8, P.amber));
  els.push(text('What\'s on your mind right now?', 54, 98, { size: 14, color: P.textMid }));

  // Big waveform (recording state)
  els.push(rect(20, 148, W - 40, 100, P.surface, { r: 16 }));
  els.push(...waveform(30, 155, W - 60, 86, 'rgba(245,166,35,0.8)', 88));

  // Recording timer
  els.push(text('02:47', W/2, 270, { size: 52, weight: 300, color: P.text, align: 'center' }));
  els.push(text('Recording...', W/2, 330, { size: 14, color: P.amber, align: 'center' }));

  // Animated recording indicator
  els.push(circle(W/2 - 12, 348, 4, P.red));
  els.push(circle(W/2, 348, 4, P.red, { opacity: 0.5 }));
  els.push(circle(W/2 + 12, 348, 4, P.red, { opacity: 0.2 }));

  // Stop button (large, centered)
  els.push(circle(W/2, 430, 44, P.amber));
  els.push(rect(W/2 - 12, 418, 24, 24, P.bg, { r: 4 }));

  // Cancel / pause
  els.push(text('Cancel', 70, 474, { size: 15, color: P.textMid, align: 'center' }));
  els.push(text('Pause', W - 70, 474, { size: 15, color: P.textMid, align: 'center' }));

  // AI transcription preview
  els.push(rect(20, 500, W - 40, 160, P.surface, { r: 16 }));
  els.push(text('LIVE TRANSCRIPTION', 36, 518, { size: 10, weight: 700, color: P.amber, ls: 2 }));
  els.push(line(36, 532, W - 36, 532, P.surface2));
  const transcript = '"...I\'ve been thinking about the project scope and honestly the timeline feels off. We need to push back on the Q2 deadline — three weeks just isn\'t enough to..."';
  els.push(text(transcript, 36, 542, { size: 13, color: P.textMid, lh: 1.6 }));
  els.push(text('● Transcribing', 36, 638, { size: 11, color: P.amber }));

  // Topics detected
  els.push(text('TOPICS DETECTED', 36, 656, { size: 10, weight: 700, color: P.textDim, ls: 2 }));
  els.push(...tag('Project scope', 36, 672, P.amber, P.amberDim));
  els.push(...tag('Timeline', 166, 672, P.text, P.surface2));
  els.push(...tag('Q2', 246, 672, P.text, P.surface2));

  // Bottom nav
  els.push(...navbar([0,1,2,3,4], 1));

  return { id: 'record', label: 'Record', elements: els };
}

function screenDigest() {
  const els = [rect(0, 0, W, H, P.bg), ...statusBar()];

  // Header
  els.push(text('Daily Digest', 20, 54, { size: 22, weight: 700, color: P.text }));
  els.push(text('AI-generated · Mon Mar 31', 20, 78, { size: 13, color: P.textMid }));

  // Hero audio card
  els.push(rect(20, 98, W - 40, 120, P.surface, { r: 16 }));
  els.push(rect(20, 98, W - 40, 120, P.amberDim, { r: 16 }));
  els.push(text('🎙', 40, 116, { size: 22 }));
  els.push(text('Listen to your day', 72, 114, { size: 16, weight: 700, color: P.text }));
  els.push(text('4 min · synthesized from 3 entries', 72, 136, { size: 12, color: P.textMid }));
  els.push(...waveform(36, 158, W - 72, 32, P.wave, 55));
  // Play
  els.push(circle(W - 46, 186, 20, P.amber));
  els.push(text('▶', W - 46, 178, { size: 13, color: P.bg, align: 'center', weight: 700 }));
  els.push(text('0:00', 36, 202, { size: 11, color: P.textDim }));
  els.push(text('4:12', W - 36, 202, { size: 11, color: P.textDim, align: 'right' }));

  // Mood arc summary
  els.push(text('MOOD ARC', 20, 234, { size: 11, weight: 700, color: P.textDim, ls: 2 }));
  els.push(rect(20, 250, W - 40, 80, P.surface, { r: 12 }));

  const moodPoints = [0.4, 0.6, 0.75, 0.55, 0.45, 0.7, 0.85];
  const moodLabels = ['6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm'];
  const mwx = 36, mwy = 295, mww = W - 72, mwh = 40;
  for (let i = 0; i < moodPoints.length - 1; i++) {
    const x1 = mwx + (i / (moodPoints.length - 1)) * mww;
    const y1 = mwy + mwh - moodPoints[i] * mwh;
    const x2 = mwx + ((i + 1) / (moodPoints.length - 1)) * mww;
    const y2 = mwy + mwh - moodPoints[i + 1] * mwh;
    els.push(line(x1, y1, x2, y2, P.amber, 2));
    els.push(circle(x1, y1, 3, P.amber));
  }
  els.push(circle(mwx + mww, mwy + mwh - moodPoints[6] * mwh, 3, P.amber));
  moodLabels.forEach((l, i) => {
    const x = mwx + (i / (moodLabels.length - 1)) * mww;
    els.push(text(l, x, 318, { size: 9, color: P.textDim, align: 'center' }));
  });

  // Key moments
  els.push(text('KEY MOMENTS', 20, 346, { size: 11, weight: 700, color: P.textDim, ls: 2 }));

  const moments = [
    { icon: '⚡', title: 'High energy window', detail: '8–10 AM — most clarity', color: P.amber },
    { icon: '⚠', title: 'Tension point', detail: 'Uncertainty re: Q2 deadline', color: P.amber2 },
    { icon: '✓', title: 'Resolved intent', detail: 'Will push back on timeline tomorrow', color: P.green },
  ];

  moments.forEach((m, i) => {
    const my = 366 + i * 68;
    els.push(rect(20, my, W - 40, 58, P.surface, { r: 12 }));
    els.push(text(m.icon, 38, my + 17, { size: 20, color: m.color }));
    els.push(text(m.title, 68, my + 12, { size: 14, weight: 600, color: P.text }));
    els.push(text(m.detail, 68, my + 32, { size: 12, color: P.textMid }));
  });

  // Affirmation
  els.push(rect(20, 578, W - 40, 60, P.surface, { r: 12 }));
  els.push(rect(20, 578, W - 40, 60, P.amberDim, { r: 12 }));
  els.push(text('"You spoke with conviction today.', W/2, 592, { size: 13, color: P.text, align: 'center', italic: true }));
  els.push(text('Trust that."  — Pulse AI', W/2, 614, { size: 13, color: P.amber, align: 'center', italic: true }));

  // Bottom nav
  els.push(...navbar([0,1,2,3,4], 2));

  return { id: 'digest', label: 'Digest', elements: els };
}

function screenTimeline() {
  const els = [rect(0, 0, W, H, P.bg), ...statusBar()];

  // Header
  els.push(text('Timeline', 20, 54, { size: 22, weight: 700, color: P.text }));
  els.push(text('March 2026', 20, 78, { size: 13, color: P.textMid }));

  // Month nav
  els.push(text('‹', 20, 100, { size: 22, color: P.textMid }));
  els.push(text('March 2026', W/2, 100, { size: 16, weight: 600, color: P.text, align: 'center' }));
  els.push(text('›', W - 20, 100, { size: 22, color: P.amber, align: 'right' }));

  // Streak badge
  els.push(rect(W/2 - 55, 118, 110, 28, P.amberDim, { r: 14 }));
  els.push(text('🔥 18 day streak', W/2, 127, { size: 12, weight: 600, color: P.amber, align: 'center' }));

  // Calendar grid
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  days.forEach((d, i) => {
    els.push(text(d, 34 + i * 48, 162, { size: 12, weight: 600, color: P.textDim, align: 'center' }));
  });

  // Calendar data: recorded days
  const calData = [
    [0,0,0,1,1,1,1],
    [1,1,1,1,0,1,1],
    [1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1],
    [1,1,0,0,0,0,0],
  ];
  const moodColors = [P.textDim, P.amber, P.green, P.amber2];
  const moodSeed = [0, 1, 2, 1, 3, 2, 0, 1, 1, 2, 0, 3, 2, 1, 1, 0, 2, 3, 1, 2, 0, 1, 2, 1, 3, 2, 0, 1, 2, 2, 1];
  let dayN = 0;
  calData.forEach((week, wi) => {
    week.forEach((has, di) => {
      const cx = 34 + di * 48;
      const cy = 190 + wi * 52;
      const dayNum = dayN + 1;
      if (has) {
        const mc = moodColors[moodSeed[dayN] % moodColors.length];
        els.push(circle(cx, cy, 18, P.surface));
        els.push(circle(cx, cy, 18, mc.replace('#', 'rgba(').replace(')', ',0.15)').replace('rgba(', '#').replace(',0.15)', '')));
        // Use rect for tinted bg instead
        els.push(rect(cx - 18, cy - 18, 36, 36, P.surface, { r: 18 }));
        els.push(circle(cx, cy + 10, 3, mc));
        els.push(text(String(dayNum), cx, cy - 8, { size: 13, weight: 600, color: P.text, align: 'center' }));
        els.push(...waveform(cx - 14, cy - 5, 28, 14, mc.includes('rgba') ? mc : mc + '99', dayN * 7));
      } else if (dayN < 30) {
        els.push(text(String(dayNum), cx, cy - 8, { size: 13, color: P.textDim, align: 'center' }));
      }
      dayN++;
    });
  });

  // Weekly stats strip
  els.push(rect(20, 460, W - 40, 70, P.surface, { r: 12 }));
  const stats = [
    { label: 'This Week', value: '6/7', sub: 'days' },
    { label: 'Total Time', value: '1h 42m', sub: 'recorded' },
    { label: 'Entries', value: '21', sub: 'this month' },
    { label: 'Avg', value: '4.9m', sub: 'per entry' },
  ];
  stats.forEach((s, i) => {
    const sx = 44 + i * 88;
    if (i > 0) els.push(line(sx - 20, 470, sx - 20, 520, P.surface2));
    els.push(text(s.value, sx, 476, { size: 17, weight: 700, color: P.amber, align: 'center' }));
    els.push(text(s.label, sx, 498, { size: 10, color: P.text, align: 'center' }));
    els.push(text(s.sub, sx, 513, { size: 9, color: P.textDim, align: 'center' }));
  });

  // Bottom nav
  els.push(...navbar([0,1,2,3,4], 3));

  return { id: 'timeline', label: 'Timeline', elements: els };
}

function screenInsights() {
  const els = [rect(0, 0, W, H, P.bg), ...statusBar()];

  // Header
  els.push(text('Insights', 20, 54, { size: 22, weight: 700, color: P.text }));
  els.push(text('Last 30 days', 20, 78, { size: 13, color: P.textMid }));

  // Mood distribution
  els.push(text('EMOTIONAL RANGE', 20, 104, { size: 11, weight: 700, color: P.textDim, ls: 2 }));
  els.push(rect(20, 122, W - 40, 110, P.surface, { r: 12 }));

  const moods = [
    { label: 'Focused', pct: 0.72, color: P.amber },
    { label: 'Reflective', pct: 0.58, color: P.amber2 },
    { label: 'Anxious', pct: 0.31, color: P.red },
    { label: 'Grateful', pct: 0.45, color: P.green },
  ];
  moods.forEach((m, i) => {
    const bx = 36, by = 136 + i * 22;
    els.push(text(m.label, bx, by, { size: 12, color: P.textMid }));
    els.push(rect(bx + 90, by + 1, (W - 40 - 90 - 50) * 1, 12, P.surface2, { r: 6 }));
    els.push(rect(bx + 90, by + 1, (W - 40 - 90 - 50) * m.pct, 12, m.color, { r: 6 }));
    els.push(text(Math.round(m.pct * 100) + '%', W - 46, by, { size: 11, color: P.textDim, align: 'right' }));
  });

  // Recurring topics
  els.push(text('RECURRING TOPICS', 20, 246, { size: 11, weight: 700, color: P.textDim, ls: 2 }));
  els.push(rect(20, 264, W - 40, 120, P.surface, { r: 12 }));

  const topics = [
    { name: 'Work / Projects', count: 18, size: 16 },
    { name: 'Relationships', count: 12, size: 14 },
    { name: 'Health', count: 9, size: 13 },
    { name: 'Finance', count: 6, size: 12 },
    { name: 'Ideas', count: 14, size: 15 },
    { name: 'Goals', count: 11, size: 13 },
    { name: 'Gratitude', count: 7, size: 12 },
    { name: 'Anxiety', count: 5, size: 11 },
  ];
  const positions = [
    [36, 280], [166, 278], [278, 282], [36, 304], [110, 306],
    [212, 302], [300, 304], [36, 330],
  ];
  const topicColors = [P.amber, P.text, P.textMid, P.textDim, P.amber2, P.text, P.green, P.red];
  topics.forEach((t, i) => {
    if (i < positions.length) {
      const [tx, ty] = positions[i];
      els.push(text(t.name, tx, ty, { size: t.size, weight: t.count > 10 ? 600 : 400, color: topicColors[i] }));
    }
  });

  // Best recording time
  els.push(text('YOUR PEAK RECORDING TIME', 20, 400, { size: 11, weight: 700, color: P.textDim, ls: 2 }));
  els.push(rect(20, 418, W - 40, 100, P.surface, { r: 12 }));

  const hours = [6,7,8,9,10,11,12,13,14,15,16,17,18,19,20];
  const activity = [0.1, 0.3, 0.9, 0.7, 0.8, 0.5, 0.4, 0.3, 0.2, 0.4, 0.6, 0.7, 0.5, 0.3, 0.2];
  const hbw = (W - 60) / hours.length;
  hours.forEach((h, i) => {
    const bh = activity[i] * 55;
    const bx = 30 + i * hbw;
    const by = 428 + (55 - bh);
    const isActive = activity[i] > 0.6;
    els.push(rect(bx, by, hbw - 3, bh, isActive ? P.amber : P.surface2, { r: 2 }));
  });
  els.push(text('6am', 30, 492, { size: 9, color: P.textDim }));
  els.push(text('8am', 30 + 2 * hbw, 492, { size: 9, color: P.amber }));
  els.push(text('8pm', W - 30, 492, { size: 9, color: P.textDim, align: 'right' }));
  els.push(text('You record most at 8–10am', 36, 506, { size: 12, color: P.textMid }));

  // Bottom nav
  els.push(...navbar([0,1,2,3,4], 3));

  return { id: 'insights', label: 'Insights', elements: els };
}

function screenProfile() {
  const els = [rect(0, 0, W, H, P.bg), ...statusBar()];

  // Header
  els.push(text('Your Profile', 20, 54, { size: 22, weight: 700, color: P.text }));

  // Avatar + name card
  els.push(rect(20, 76, W - 40, 100, P.surface, { r: 16 }));
  els.push(circle(60, 126, 30, P.amberDim));
  els.push(text('JR', 60, 116, { size: 18, weight: 700, color: P.amber, align: 'center' }));
  els.push(text('Jordan Rivera', 106, 108, { size: 18, weight: 700, color: P.text }));
  els.push(text('Member since Jan 2026', 106, 132, { size: 12, color: P.textMid }));
  els.push(text('✦ Pro', W - 36, 108, { size: 13, weight: 700, color: P.amber, align: 'right' }));

  // Voice stats
  els.push(rect(20, 192, W - 40, 72, P.surface, { r: 12 }));
  const vstats = [
    { v: '246', l: 'Recordings' },
    { v: '19h', l: 'Total Audio' },
    { v: '124', l: 'AI Summaries' },
    { v: '18', l: 'Day Streak' },
  ];
  vstats.forEach((s, i) => {
    const sx = 44 + i * 88;
    if (i > 0) els.push(line(sx - 20, 200, sx - 20, 255, P.surface2));
    els.push(text(s.v, sx, 208, { size: 18, weight: 700, color: P.amber, align: 'center' }));
    els.push(text(s.l, sx, 234, { size: 10, color: P.textMid, align: 'center' }));
  });

  // Settings sections
  const sections = [
    { label: 'AI Voice Model', value: 'Calm — en-US', icon: '🎙' },
    { label: 'Summary Style', value: 'Poetic & Reflective', icon: '✦' },
    { label: 'Reminder', value: '9:00 PM daily', icon: '◔' },
    { label: 'Privacy', value: 'Local-only (encrypted)', icon: '⚿' },
    { label: 'Export Journal', value: 'PDF / Audio pack', icon: '↗' },
  ];

  els.push(text('PREFERENCES', 20, 282, { size: 11, weight: 700, color: P.textDim, ls: 2 }));
  sections.forEach((s, i) => {
    const sy = 302 + i * 60;
    els.push(rect(20, sy, W - 40, 50, P.surface, { r: 12 }));
    els.push(text(s.icon, 38, sy + 13, { size: 18 }));
    els.push(text(s.label, 66, sy + 10, { size: 14, weight: 600, color: P.text }));
    els.push(text(s.value, 66, sy + 30, { size: 12, color: P.textMid }));
    els.push(text('›', W - 30, sy + 13, { size: 20, color: P.textDim, align: 'right' }));
    if (i < sections.length - 1) els.push(line(66, sy + 50, W - 20, sy + 50, P.surface2));
  });

  // Bottom nav
  els.push(...navbar([0,1,2,3,4], 4));

  return { id: 'profile', label: 'Profile', elements: els };
}

// ─── assemble pen ─────────────────────────────────────────────────────────────

const pen = {
  version: '2.8',
  meta: {
    name: 'Pulse — AI Voice Journal',
    description: 'Dark audio-first UI. Inspired by Format Podcasts on darkmodedesign.com — near-black warm bg, grotesque type, voice recordings synthesized into AI insights. DARK THEME.',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    tags: ['dark', 'audio', 'ai', 'journal', 'voice', 'waveform'],
  },
  canvas: { width: W, height: H },
  screens: [
    screenToday(),
    screenRecord(),
    screenDigest(),
    screenTimeline(),
    screenInsights(),
    screenProfile(),
  ],
};

fs.writeFileSync('/workspace/group/design-studio/pulse.pen', JSON.stringify(pen, null, 2));
console.log('✓ pulse.pen written —', pen.screens.length, 'screens');
console.log('  Screens:', pen.screens.map(s => s.label).join(', '));
