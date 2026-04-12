/**
 * VELA — creative sprint rhythm app
 * Inspired by: Interval for macOS (Land-book) "time as an instrument" + Fluid Glass (Awwwards SOTD)
 * Theme: LIGHT — warm cream/paper aesthetic, forest green + clay accents
 */

const fs = require('fs');

const W = 390, H = 844;

const palette = {
  bg:       '#F5F2ED',
  surface:  '#FEFCF8',
  surface2: '#EDE9E2',
  border:   '#DDD9D2',
  text:     '#1A1714',
  textMid:  '#5A5550',
  textMute: '#9A9590',
  accent:   '#2E6B4A',   // forest green
  accentLt: '#EBF4EF',   // light green tint
  accent2:  '#C4682A',   // clay/burnt orange
  accent2Lt:'#FAEEE5',   // light clay tint
  white:    '#FEFCF8',
  black:    '#1A1714',
};

function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect',
    x, y, width: w, height: h,
    fill,
    cornerRadius: opts.r ?? 0,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? null,
    strokeWidth: opts.sw ?? 0,
  };
}

function text(content, x, y, opts = {}) {
  return {
    type: 'text',
    x, y,
    content,
    fontSize: opts.size ?? 14,
    fontFamily: opts.font ?? 'Inter',
    fontWeight: opts.weight ?? '400',
    fill: opts.color ?? palette.text,
    textAlign: opts.align ?? 'left',
    opacity: opts.opacity ?? 1,
    letterSpacing: opts.ls ?? 0,
  };
}

function line(x1, y1, x2, y2, color, opts = {}) {
  return {
    type: 'line',
    x1, y1, x2, y2,
    stroke: color,
    strokeWidth: opts.sw ?? 1,
    opacity: opts.opacity ?? 1,
  };
}

function circle(cx, cy, r, fill, opts = {}) {
  return {
    type: 'ellipse',
    x: cx - r, y: cy - r,
    width: r * 2, height: r * 2,
    fill,
    stroke: opts.stroke ?? null,
    strokeWidth: opts.sw ?? 0,
    opacity: opts.opacity ?? 1,
  };
}

// ─── Screen helpers ───────────────────────────────────────────────────────────

function statusBar(y = 44) {
  return [
    text('9:41', 20, y, { size: 15, weight: '600', color: palette.text }),
    text('●●●', W - 80, y, { size: 11, color: palette.textMute }),
    text('100%', W - 48, y, { size: 13, weight: '500', color: palette.text }),
  ];
}

function bottomNav(activeIdx = 0) {
  const tabs = [
    { label: 'Sprint', icon: '◎' },
    { label: 'Flow',   icon: '≋' },
    { label: 'Tasks',  icon: '≡' },
    { label: 'Insight',icon: '◈' },
    { label: 'Profile',icon: '○' },
  ];
  const items = [];
  const barH = 82;
  const barY = H - barH;
  items.push(rect(0, barY, W, barH, palette.surface, { r: 0 }));
  items.push(line(0, barY, W, barY, palette.border, { sw: 1 }));
  tabs.forEach((tab, i) => {
    const x = (W / tabs.length) * i + (W / tabs.length) / 2;
    const isActive = i === activeIdx;
    items.push(text(tab.icon, x - 8, barY + 14, { size: 18, color: isActive ? palette.accent : palette.textMute }));
    items.push(text(tab.label, x - (tab.label.length * 3.2), barY + 38, {
      size: 10,
      color: isActive ? palette.accent : palette.textMute,
      weight: isActive ? '600' : '400',
    }));
    if (isActive) {
      items.push(rect(x - 16, barY + 56, 32, 3, palette.accent, { r: 2 }));
    }
  });
  return items;
}

// ─── SCREEN 1: ACTIVE SPRINT ──────────────────────────────────────────────────
function screen1() {
  const els = [
    rect(0, 0, W, H, palette.bg),
    ...statusBar(52),

    // Top label
    text('ACTIVE SPRINT', 24, 80, { size: 10, weight: '700', color: palette.accent, ls: 2 }),

    // Sprint name
    text('Deep Work', 24, 104, { size: 28, weight: '700', color: palette.text }),
    text('Pentimento — Brand Identity', 24, 136, { size: 14, color: palette.textMid }),

    // Giant timer — the hero element, inspired by Interval's large countdown
    text('42', 24, 230, { size: 120, weight: '200', color: palette.text, font: 'Inter' }),
    text(':17', 142, 230, { size: 120, weight: '200', color: palette.textMute, font: 'Inter' }),
    text('remaining', W - 24 - 80, 270, { size: 13, color: palette.textMid }),

    // Thin progress arc hint (text-based)
    text('───────────────────── 58%', 24, 295, { size: 11, color: palette.accent, ls: 0 }),
    text('of 90 min session', 24, 312, { size: 12, color: palette.textMute }),

    // Flow state pill
    rect(24, 338, 140, 36, palette.accentLt, { r: 18 }),
    text('⟳ IN FLOW STATE', 42, 360, { size: 11, weight: '600', color: palette.accent, ls: 1 }),

    // Divider
    line(24, 400, W - 24, 400, palette.border),

    // Current task
    text('CURRENT TASK', 24, 424, { size: 10, weight: '700', color: palette.textMute, ls: 2 }),
    rect(24, 442, W - 48, 60, palette.surface, { r: 12, stroke: palette.border, sw: 1 }),
    text('Refine wordmark — weight study', 40, 462, { size: 14, weight: '500', color: palette.text }),
    text('3 of 5 tasks complete', 40, 482, { size: 12, color: palette.textMute }),

    // Action buttons
    rect(24, 522, (W - 56) / 2, 52, palette.accent, { r: 14 }),
    text('Pause', 24 + (W - 56) / 4 - 20, 554, { size: 15, weight: '600', color: palette.white }),
    rect(24 + (W - 56) / 2 + 8, 522, (W - 56) / 2, 52, palette.surface2, { r: 14 }),
    text('End Sprint', 24 + (W - 56) / 2 + 8 + (W - 56) / 4 - 34, 554, { size: 15, weight: '500', color: palette.textMid }),

    // Bottom hint
    text('stillness vs motion  ·  trust the rhythm', W/2 - 100, 595, { size: 11, color: palette.textMute, align: 'center' }),

    ...bottomNav(0),
  ];
  return els;
}

// ─── SCREEN 2: FLOW MAP ───────────────────────────────────────────────────────
function screen2() {
  const els = [
    rect(0, 0, W, H, palette.bg),
    ...statusBar(52),

    text('YOUR FLOW MAP', 24, 80, { size: 10, weight: '700', color: palette.accent, ls: 2 }),
    text('This Week', 24, 104, { size: 28, weight: '700', color: palette.text }),

    // Week strip
    text('Mon  Tue  Wed  Thu  Fri  Sat  Sun', 24, 148, { size: 12, color: palette.textMute, ls: 1 }),
  ];

  // Bar chart — daily flow hours
  const days = [
    { d: 'M', h: 3.5, flow: 0.8 },
    { d: 'T', h: 5.0, flow: 0.9 },
    { d: 'W', h: 4.2, flow: 0.7 },
    { d: 'T', h: 2.0, flow: 0.4 },
    { d: 'F', h: 6.1, flow: 1.0 },  // today
    { d: 'S', h: 0,   flow: 0 },
    { d: 'S', h: 0,   flow: 0 },
  ];

  const barMaxH = 100;
  const barW = 28;
  const startX = 30;
  const barY = 290;
  const gap = (W - 60 - 7 * barW) / 6;

  days.forEach((day, i) => {
    const x = startX + i * (barW + gap);
    const h = (day.h / 7) * barMaxH;
    const isToday = i === 4;
    const fillColor = isToday ? palette.accent : day.flow > 0.7 ? palette.accent2 + '99' : palette.border;

    if (h > 0) {
      els.push(rect(x, barY - h, barW, h, fillColor, { r: 6 }));
      // flow overlay
      const fh = h * day.flow;
      if (!isToday && day.flow > 0) {
        els.push(rect(x, barY - fh, barW, fh, isToday ? palette.accent : palette.accent2, { r: 6, opacity: 0.6 }));
      }
    }
    els.push(text(day.d, x + barW / 2 - 5, barY + 16, { size: 11, color: isToday ? palette.accent : palette.textMute, weight: isToday ? '700' : '400' }));
    if (h > 0) {
      els.push(text(day.h.toFixed(1) + 'h', x, barY - h - 18, { size: 10, color: isToday ? palette.text : palette.textMute }));
    }
  });

  // Divider
  els.push(line(24, barY + 36, W - 24, barY + 36, palette.border));

  // Stats row
  const stats = [
    { label: 'Sprint Hours', value: '20.8h' },
    { label: 'Flow Ratio',   value: '74%' },
    { label: 'Avg Session',  value: '68 min' },
  ];
  stats.forEach((s, i) => {
    const x = 24 + i * ((W - 48) / 3);
    els.push(text(s.value, x, barY + 66, { size: 22, weight: '700', color: palette.text }));
    els.push(text(s.label,  x, barY + 88, { size: 11, color: palette.textMute }));
  });

  // Flow insight card
  els.push(rect(24, barY + 110, W - 48, 76, palette.accentLt, { r: 16 }));
  els.push(text('Peak Flow Window', 40, barY + 134, { size: 13, weight: '600', color: palette.accent }));
  els.push(text('You enter deep focus most reliably', 40, barY + 154, { size: 12, color: palette.textMid }));
  els.push(text('between 9 am – 12 pm. Protect it.', 40, barY + 170, { size: 12, color: palette.textMid }));

  // Rhythm type pill
  els.push(rect(24, barY + 200, 160, 36, palette.surface, { r: 18, stroke: palette.border, sw: 1 }));
  els.push(text('⟡ Morning Archetype', 40, barY + 222, { size: 11, weight: '500', color: palette.textMid }));

  els.push(...bottomNav(1));
  return els;
}

// ─── SCREEN 3: TASKS / SPRINTS ────────────────────────────────────────────────
function screen3() {
  const els = [
    rect(0, 0, W, H, palette.bg),
    ...statusBar(52),

    text('SPRINTS', 24, 80, { size: 10, weight: '700', color: palette.accent, ls: 2 }),
    text('Active Projects', 24, 104, { size: 28, weight: '700', color: palette.text }),
  ];

  const projects = [
    { name: 'Pentimento', type: 'Brand Identity', tasks: 5, done: 3, accent: palette.accent, color: palette.accentLt, sessions: '4 sprints this week' },
    { name: 'Wayfarer',   type: 'App UI Design',  tasks: 8, done: 2, accent: palette.accent2, color: palette.accent2Lt, sessions: '2 sprints this week' },
    { name: 'Noctua',     type: 'Editorial',      tasks: 3, done: 3, accent: '#7B6FA0', color: '#F0EEF7', sessions: '1 sprint this week' },
  ];

  let cardY = 144;
  projects.forEach((p) => {
    const cardH = 112;
    els.push(rect(24, cardY, W - 48, cardH, palette.surface, { r: 16, stroke: palette.border, sw: 1 }));

    // Left accent bar
    els.push(rect(24, cardY, 4, cardH, p.accent, { r: 0 }));

    // Project details
    els.push(text(p.name, 44, cardY + 24, { size: 18, weight: '700', color: palette.text }));
    els.push(text(p.type, 44, cardY + 46, { size: 12, color: palette.textMid }));

    // Progress bar
    const progW = W - 48 - 40;
    const pct = p.done / p.tasks;
    els.push(rect(44, cardY + 64, progW, 4, palette.surface2, { r: 2 }));
    els.push(rect(44, cardY + 64, progW * pct, 4, p.accent, { r: 2 }));

    // Progress text
    els.push(text(`${p.done}/${p.tasks} tasks`, 44, cardY + 82, { size: 11, color: palette.textMute }));
    els.push(text(p.sessions, W - 24 - 100, cardY + 82, { size: 11, color: p.accent, weight: '500' }));

    cardY += cardH + 12;
  });

  // New Sprint button
  els.push(rect(24, cardY + 8, W - 48, 52, palette.accent, { r: 14 }));
  els.push(text('+ New Sprint', W / 2 - 42, cardY + 40, { size: 15, weight: '600', color: palette.white }));

  els.push(...bottomNav(2));
  return els;
}

// ─── SCREEN 4: INSIGHTS ───────────────────────────────────────────────────────
function screen4() {
  const els = [
    rect(0, 0, W, H, palette.bg),
    ...statusBar(52),

    text('INSIGHTS', 24, 80, { size: 10, weight: '700', color: palette.accent, ls: 2 }),
    text('Rhythm Report', 24, 104, { size: 28, weight: '700', color: palette.text }),
    text('Mar 24 – 30, 2026', 24, 134, { size: 14, color: palette.textMute }),
  ];

  // Score card
  els.push(rect(24, 160, W - 48, 120, palette.accent, { r: 20 }));
  els.push(text('RHYTHM SCORE', 44, 188, { size: 10, weight: '700', color: '#FFFFFF99', ls: 2 }));
  els.push(text('87', 44, 248, { size: 72, weight: '200', color: palette.white }));
  els.push(text('/ 100', 130, 248, { size: 28, weight: '300', color: '#FFFFFF88' }));
  els.push(text('↑ 12 pts from last week', W - 48 - 140, 220, { size: 12, color: '#FFFFFF99' }));
  els.push(text('Your best rhythm yet.', W - 48 - 140, 238, { size: 13, weight: '600', color: palette.white }));

  // Metrics grid
  const metrics = [
    { label: 'Consistency', value: '92%', icon: '◎', color: palette.accent },
    { label: 'Depth',       value: '74%', icon: '≋', color: palette.accent2 },
    { label: 'Recovery',    value: '88%', icon: '○', color: '#7B6FA0' },
    { label: 'Momentum',    value: '81%', icon: '◈', color: '#2A7A8A' },
  ];

  const gridY = 300;
  const cellW = (W - 48 - 12) / 2;
  metrics.forEach((m, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 24 + col * (cellW + 12);
    const y = gridY + row * 88;
    els.push(rect(x, y, cellW, 76, palette.surface, { r: 14, stroke: palette.border, sw: 1 }));
    els.push(text(m.icon, x + 16, y + 26, { size: 16, color: m.color }));
    els.push(text(m.value, x + 40, y + 28, { size: 22, weight: '700', color: palette.text }));
    els.push(text(m.label, x + 16, y + 52, { size: 11, color: palette.textMute }));
  });

  // Insight text
  els.push(rect(24, gridY + 188, W - 48, 72, palette.accent2Lt, { r: 14 }));
  els.push(text('Observation', 40, gridY + 210, { size: 12, weight: '600', color: palette.accent2 }));
  els.push(text('You perform 31% better after a', 40, gridY + 228, { size: 12, color: palette.textMid }));
  els.push(text('20-min break. Build in more rest.', 40, gridY + 244, { size: 12, color: palette.textMid }));

  els.push(...bottomNav(3));
  return els;
}

// ─── SCREEN 5: NEW SPRINT SETUP ──────────────────────────────────────────────
function screen5() {
  const els = [
    rect(0, 0, W, H, palette.bg),
    ...statusBar(52),

    // Header with back arrow
    text('←', 24, 100, { size: 22, color: palette.text }),
    text('New Sprint', W / 2 - 44, 104, { size: 20, weight: '700', color: palette.text }),

    text('What are you creating?', 24, 148, { size: 22, weight: '600', color: palette.text }),
    text('Name your session intention.', 24, 174, { size: 14, color: palette.textMute }),

    // Project selector
    text('PROJECT', 24, 214, { size: 10, weight: '700', color: palette.textMute, ls: 2 }),
    rect(24, 230, W - 48, 52, palette.surface, { r: 12, stroke: palette.accent, sw: 2 }),
    text('Pentimento — Brand Identity', 40, 262, { size: 14, weight: '500', color: palette.text }),
    text('▾', W - 50, 262, { size: 16, color: palette.textMid }),

    // Task name
    text('INTENTION', 24, 306, { size: 10, weight: '700', color: palette.textMute, ls: 2 }),
    rect(24, 322, W - 48, 52, palette.surface, { r: 12, stroke: palette.border, sw: 1 }),
    text('Refine wordmark — weight study', 40, 354, { size: 14, color: palette.textMid }),

    // Duration selector
    text('DURATION', 24, 400, { size: 10, weight: '700', color: palette.textMute, ls: 2 }),
  ];

  // Duration pills
  const durations = ['25 min', '45 min', '90 min', '120 min'];
  durations.forEach((d, i) => {
    const pillW = 78;
    const x = 24 + i * (pillW + 8);
    const isActive = i === 2;
    els.push(rect(x, 416, pillW, 36, isActive ? palette.accent : palette.surface, { r: 18, stroke: isActive ? 'none' : palette.border, sw: 1 }));
    els.push(text(d, x + pillW / 2 - d.length * 3.5, 440, { size: 12, weight: isActive ? '600' : '400', color: isActive ? palette.white : palette.textMid }));
  });

  // Ambience selector
  els.push(text('AMBIENCE', 24, 478, { size: 10, weight: '700', color: palette.textMute, ls: 2 }));
  const ambienceItems = ['Silent', 'Rain', 'Café', 'Forest'];
  ambienceItems.forEach((a, i) => {
    const icons = ['○', '~', '◫', '♧'];
    const pillW = 78;
    const x = 24 + i * (pillW + 8);
    const isActive = i === 0;
    els.push(rect(x, 494, pillW, 36, isActive ? palette.accent2Lt : palette.surface, { r: 18, stroke: isActive ? palette.accent2 : palette.border, sw: isActive ? 2 : 1 }));
    els.push(text(icons[i] + ' ' + a, x + 12, 518, { size: 12, weight: isActive ? '600' : '400', color: isActive ? palette.accent2 : palette.textMid }));
  });

  // Divider + CTA
  els.push(line(24, 556, W - 24, 556, palette.border));
  els.push(rect(24, 572, W - 48, 56, palette.accent, { r: 16 }));
  els.push(text('Begin Sprint', W / 2 - 42, 606, { size: 16, weight: '700', color: palette.white }));
  els.push(text('your brain is not a server  ·  rest is part of the work', W/2 - 130, 648, { size: 11, color: palette.textMute, align: 'center' }));

  els.push(...bottomNav(0));
  return els;
}

// ─── Build .pen file ──────────────────────────────────────────────────────────
const screens = [
  { id: 'sprint-active',  name: 'Active Sprint',   elements: screen1() },
  { id: 'flow-map',       name: 'Flow Map',         elements: screen2() },
  { id: 'projects',       name: 'Projects',         elements: screen3() },
  { id: 'insights',       name: 'Rhythm Report',    elements: screen4() },
  { id: 'new-sprint',     name: 'New Sprint',       elements: screen5() },
];

const pen = {
  version: '2.8',
  meta: {
    name: 'VELA — work in rhythm, not in rows',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    description: 'Creative sprint rhythm app. Light theme. Inspired by Interval for macOS (Land-book) "time as an instrument" philosophy.',
  },
  canvas: { width: W, height: H, background: palette.bg },
  screens,
  colors: palette,
};

fs.writeFileSync('vela.pen', JSON.stringify(pen, null, 2));
console.log('✓ vela.pen written —', screens.length, 'screens,', screens.reduce((a, s) => a + s.elements.length, 0), 'elements');
