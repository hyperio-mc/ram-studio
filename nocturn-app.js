/**
 * NOCTURN — Protect your deep work
 * Pencil.dev v2.8 generator
 * Inspired by: Dark Mode Design showcase (Midday, Obsidian) —
 * rich dark productivity tools with amber accents + glass surfaces
 */

const fs = require('fs');

const W = 390, H = 844;
const PAL = {
  bg:       '#0B0C0F',
  surface:  '#141519',
  surface2: '#1C1E24',
  border:   'rgba(255,255,255,0.07)',
  text:     '#E8E4DC',
  muted:    'rgba(232,228,220,0.42)',
  accent:   '#F5A623',  // amber gold
  accent2:  '#8B6FFF',  // soft violet
  danger:   '#FF6B6B',
  green:    '#4ECBA0',
};

function rect(x, y, w, h, fill, opts = {}) {
  return { type: 'rect', x, y, width: w, height: h, fill,
    cornerRadius: opts.r ?? 0, strokeColor: opts.stroke ?? null, strokeWidth: opts.sw ?? 1 };
}
function text(str, x, y, opts = {}) {
  return { type: 'text', content: str, x, y,
    fontSize: opts.size ?? 14, fontWeight: opts.weight ?? 400,
    color: opts.color ?? PAL.text, textAlign: opts.align ?? 'left',
    fontFamily: opts.font ?? 'Inter', opacity: opts.opacity ?? 1 };
}
function circle(cx, cy, r, fill, opts = {}) {
  return { type: 'ellipse', x: cx - r, y: cy - r, width: r*2, height: r*2,
    fill, strokeColor: opts.stroke ?? null, strokeWidth: opts.sw ?? 1 };
}
function line(x1, y1, x2, y2, color, w = 1) {
  return { type: 'line', x1, y1, x2, y2, strokeColor: color, strokeWidth: w };
}

// ── Status Bar ────────────────────────────────────────────────────────────────
function statusBar() {
  return [
    rect(0, 0, W, 44, PAL.bg),
    text('9:41', 20, 14, { size: 15, weight: 600 }),
    text('●●●●  WiFi  100%', W - 16, 14, { size: 11, color: PAL.muted, align: 'right' }),
  ];
}

// ── Bottom Nav ────────────────────────────────────────────────────────────────
function bottomNav(active = 0) {
  const items = [
    { label: 'Today',    icon: '⬡' },
    { label: 'Sessions', icon: '◈' },
    { label: 'Projects', icon: '▣' },
    { label: 'Stats',    icon: '◉' },
    { label: 'Profile',  icon: '○' },
  ];
  const out = [
    rect(0, H - 84, W, 84, PAL.surface, { r: 0 }),
    line(0, H - 84, W, H - 84, PAL.border),
  ];
  const seg = W / items.length;
  items.forEach((item, i) => {
    const cx = seg * i + seg / 2;
    const isActive = i === active;
    const col = isActive ? PAL.accent : PAL.muted;
    if (isActive) {
      out.push(rect(cx - 22, H - 80, 44, 3, PAL.accent, { r: 2 }));
    }
    out.push(text(item.icon, cx, H - 70, { size: 20, color: col, align: 'center' }));
    out.push(text(item.label, cx, H - 46, { size: 10, color: col, align: 'center', weight: isActive ? 600 : 400 }));
  });
  return out;
}

// ── Radial Ring helper ────────────────────────────────────────────────────────
function ringArc(cx, cy, r, color, thickness = 8) {
  // Draw arc as a thick circle with a gap — simulated via rect + circles
  const out = [];
  // Background ring
  out.push({ type: 'ellipse', x: cx - r, y: cy - r, width: r*2, height: r*2,
    fill: 'transparent', strokeColor: PAL.surface2, strokeWidth: thickness });
  // Progress arc (approximated as full ring, real arc needs path)
  out.push({ type: 'ellipse', x: cx - r, y: cy - r, width: r*2, height: r*2,
    fill: 'transparent', strokeColor: color, strokeWidth: thickness,
    strokeDashArray: `${Math.PI * 2 * r * 0.72} ${Math.PI * 2 * r * 0.28}`,
    strokeDashOffset: Math.PI * 2 * r * 0.25 });
  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 1 — TODAY (Focus Dashboard)
// ─────────────────────────────────────────────────────────────────────────────
function screen1() {
  const elements = [
    rect(0, 0, W, H, PAL.bg),
    // Ambient glow top
    { type: 'ellipse', x: 80, y: -60, width: 230, height: 200,
      fill: 'rgba(245,166,35,0.06)', strokeColor: null },
    ...statusBar(),

    // Header
    text('Sunday', 20, 58, { size: 13, color: PAL.muted }),
    text('March 22', 20, 78, { size: 26, weight: 700 }),
    // Avatar
    circle(W - 36, 72, 20, PAL.surface2, { stroke: PAL.border, sw: 1.5 }),
    text('R', W - 36, 65, { size: 14, weight: 700, color: PAL.accent, align: 'center' }),

    // Active session card — glass surface
    rect(16, 108, W - 32, 148, PAL.surface, { r: 20 }),
    rect(16, 108, W - 32, 148, 'rgba(245,166,35,0.04)', { r: 20 }),
    { type: 'rect', x: 16, y: 108, width: W - 32, height: 148,
      fill: 'transparent', cornerRadius: 20,
      strokeColor: 'rgba(245,166,35,0.18)', strokeWidth: 1.5 },

    // Live indicator
    circle(36, 126, 5, PAL.accent),
    { type: 'ellipse', x: 26, y: 116, width: 20, height: 20,
      fill: 'rgba(245,166,35,0.2)', strokeColor: null },
    text('DEEP WORK IN PROGRESS', 50, 131, { size: 10, weight: 700, color: PAL.accent }),
    text('2:47:13', 24, 165, { size: 42, weight: 800, color: PAL.text }),
    text('of 3h 00m goal', 24, 196, { size: 13, color: PAL.muted }),

    // Progress bar
    rect(24, 212, W - 64, 6, PAL.surface2, { r: 3 }),
    rect(24, 212, (W - 64) * 0.92, 6, PAL.accent, { r: 3 }),

    // Session type tag
    rect(W - 110, 116, 90, 24, 'rgba(245,166,35,0.12)', { r: 12 }),
    text('Product Design', W - 65, 128, { size: 10, color: PAL.accent, align: 'center' }),

    // Today's blocks
    text('TODAY\'S BLOCKS', 20, 278, { size: 11, weight: 700, color: PAL.muted }),

    // Block items
    ...[
      { label: 'Inbox zero + planning', time: '08:00 – 09:00', status: 'done', pct: 1.0 },
      { label: 'Product Design (active)', time: '09:30 – 12:30', status: 'active', pct: 0.92 },
      { label: 'Code review & shipping', time: '14:00 – 16:00', status: 'upcoming', pct: 0 },
      { label: 'Writing & thinking', time: '16:30 – 18:00', status: 'upcoming', pct: 0 },
    ].flatMap((b, i) => {
      const y = 300 + i * 68;
      const isActive = b.status === 'active';
      const isDone = b.status === 'done';
      const dotCol = isDone ? PAL.green : isActive ? PAL.accent : PAL.surface2;
      const cardFill = isActive ? 'rgba(245,166,35,0.05)' : PAL.surface;
      const cardStroke = isActive ? 'rgba(245,166,35,0.2)' : PAL.border;
      return [
        rect(16, y, W - 32, 58, cardFill, { r: 14 }),
        { type: 'rect', x: 16, y, width: W - 32, height: 58,
          fill: 'transparent', cornerRadius: 14, strokeColor: cardStroke, strokeWidth: 1 },
        circle(36, y + 18, 5, dotCol),
        text(b.label, 52, y + 12, { size: 13, weight: isActive ? 600 : 400 }),
        text(b.time, 52, y + 32, { size: 11, color: PAL.muted }),
        ...(b.pct > 0 ? [
          rect(W - 60, y + 20, 36, 4, PAL.surface2, { r: 2 }),
          rect(W - 60, y + 20, 36 * b.pct, 4, isDone ? PAL.green : PAL.accent, { r: 2 }),
        ] : [
          text('→', W - 38, y + 18, { size: 16, color: PAL.muted }),
        ]),
      ];
    }),

    // Streak badge
    rect(16, H - 106, 120, 32, PAL.surface, { r: 16 }),
    text('🔥 14 day streak', 76, H - 96, { size: 12, color: PAL.text, align: 'center' }),
    rect(152, H - 106, 110, 32, PAL.surface, { r: 16 }),
    text('⚡ 5.2h today', 207, H - 96, { size: 12, color: PAL.accent, align: 'center' }),

    ...bottomNav(0),
  ];
  return { id: 'screen-today', name: 'Today', elements };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 2 — SESSIONS (History + Analytics mini)
// ─────────────────────────────────────────────────────────────────────────────
function screen2() {
  const sessions = [
    { label: 'Product Design', duration: '2h 47m', tag: 'Design', color: PAL.accent,  date: 'Today' },
    { label: 'Deep Code Sprint', duration: '3h 12m', tag: 'Eng',   color: PAL.accent2, date: 'Today' },
    { label: 'Research & Reading', duration: '1h 30m', tag: 'Learn', color: PAL.green, date: 'Yesterday' },
    { label: 'Feature scoping', duration: '2h 05m', tag: 'Design', color: PAL.accent,  date: 'Yesterday' },
    { label: 'API integration', duration: '4h 01m', tag: 'Eng',    color: PAL.accent2, date: 'Mar 21' },
    { label: 'Writing docs', duration: '1h 55m', tag: 'Write',    color: '#E879F9',    date: 'Mar 21' },
  ];

  const bars = [0.62, 0.78, 0.45, 0.91, 0.55, 0.73, 0.88];
  const maxH = 48;

  return {
    id: 'screen-sessions', name: 'Sessions',
    elements: [
      rect(0, 0, W, H, PAL.bg),
      { type: 'ellipse', x: -40, y: 100, width: 200, height: 200,
        fill: 'rgba(139,111,255,0.05)', strokeColor: null },
      ...statusBar(),

      text('Sessions', 20, 70, { size: 26, weight: 700 }),
      text('This week', 20, 98, { size: 13, color: PAL.muted }),

      // Week summary card
      rect(16, 114, W - 32, 96, PAL.surface, { r: 18 }),
      { type: 'rect', x: 16, y: 114, width: W - 32, height: 96,
        fill: 'transparent', cornerRadius: 18, strokeColor: PAL.border, strokeWidth: 1 },
      text('28h 41m', 32, 140, { size: 30, weight: 800, color: PAL.text }),
      text('total deep work', 32, 166, { size: 12, color: PAL.muted }),
      text('+12% vs last week', 32, 186, { size: 12, color: PAL.green }),

      // Mini bar chart
      ...bars.flatMap((v, i) => {
        const bx = W - 100 + i * 12;
        const bh = Math.round(maxH * v);
        const days = ['M','T','W','T','F','S','S'];
        const isToday = i === 6;
        return [
          rect(bx, 162 - bh + maxH, 8, bh, isToday ? PAL.accent : PAL.surface2, { r: 3 }),
          text(days[i], bx + 4, 210, { size: 8, color: isToday ? PAL.accent : PAL.muted, align: 'center' }),
        ];
      }),

      // Section header
      text('RECENT', 20, 232, { size: 11, weight: 700, color: PAL.muted }),

      // Session list
      ...sessions.flatMap((s, i) => {
        const y = 252 + i * 76;
        return [
          rect(16, y, W - 32, 64, PAL.surface, { r: 16 }),
          { type: 'rect', x: 16, y, width: W - 32, height: 64,
            fill: 'transparent', cornerRadius: 16, strokeColor: PAL.border, strokeWidth: 1 },
          // Color bar left
          rect(16, y + 12, 3, 40, s.color, { r: 2 }),
          text(s.label, 32, y + 14, { size: 14, weight: 600 }),
          text(s.date, 32, y + 36, { size: 11, color: PAL.muted }),
          // Tag
          rect(W - 90, y + 14, 60, 20, `${s.color}22`, { r: 10 }),
          text(s.tag, W - 60, y + 24, { size: 10, color: s.color, align: 'center' }),
          text(s.duration, W - 32, y + 14, { size: 14, weight: 700, align: 'right' }),
        ];
      }),

      ...bottomNav(1),
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 3 — PROJECTS
// ─────────────────────────────────────────────────────────────────────────────
function screen3() {
  const projects = [
    { name: 'RAM Design Studio', category: 'Design', hours: '42h', pct: 0.68, color: PAL.accent },
    { name: 'Backend API v3', category: 'Engineering', hours: '28h', pct: 0.45, color: PAL.accent2 },
    { name: 'Reading List 2026', category: 'Learning', hours: '16h', pct: 0.27, color: PAL.green },
    { name: 'Personal Writing', category: 'Writing', hours: '11h', pct: 0.18, color: '#E879F9' },
  ];
  return {
    id: 'screen-projects', name: 'Projects',
    elements: [
      rect(0, 0, W, H, PAL.bg),
      ...statusBar(),

      text('Projects', 20, 70, { size: 26, weight: 700 }),

      // Add button
      rect(W - 56, 58, 40, 32, PAL.surface, { r: 16 }),
      { type: 'rect', x: W - 56, y: 58, width: 40, height: 32,
        fill: 'transparent', cornerRadius: 16, strokeColor: PAL.border, strokeWidth: 1 },
      text('+', W - 36, 70, { size: 18, color: PAL.accent, align: 'center' }),

      // Focus allocation donut (simulated)
      circle(W / 2, 198, 72, 'transparent', { stroke: PAL.surface2, sw: 18 }),
      // Accent arc slice
      { type: 'ellipse', x: W/2 - 72, y: 198 - 72, width: 144, height: 144,
        fill: 'transparent', strokeColor: PAL.accent, strokeWidth: 18,
        strokeDashArray: `${Math.PI*2*72*0.42} ${Math.PI*2*72*0.58}`,
        strokeDashOffset: Math.PI*2*72*0.25 },
      // Accent2 arc
      { type: 'ellipse', x: W/2 - 72, y: 198 - 72, width: 144, height: 144,
        fill: 'transparent', strokeColor: PAL.accent2, strokeWidth: 18,
        strokeDashArray: `${Math.PI*2*72*0.27} ${Math.PI*2*72*0.73}`,
        strokeDashOffset: Math.PI*2*72*(0.25 - 0.42) },
      text('97h', W/2, 190, { size: 24, weight: 800, align: 'center' }),
      text('this month', W/2, 210, { size: 11, color: PAL.muted, align: 'center' }),

      text('ALLOCATION', 20, 298, { size: 11, weight: 700, color: PAL.muted }),

      ...projects.flatMap((p, i) => {
        const y = 320 + i * 88;
        return [
          rect(16, y, W - 32, 76, PAL.surface, { r: 18 }),
          { type: 'rect', x: 16, y, width: W - 32, height: 76,
            fill: 'transparent', cornerRadius: 18, strokeColor: PAL.border, strokeWidth: 1 },
          // Color dot
          circle(40, y + 22, 8, p.color),
          { type: 'ellipse', x: 27, y: y + 9, width: 26, height: 26,
            fill: `${p.color}22`, strokeColor: null },
          text(p.name, 60, y + 14, { size: 14, weight: 600 }),
          text(p.category, 60, y + 34, { size: 11, color: PAL.muted }),
          text(p.hours, W - 32, y + 14, { size: 16, weight: 700, align: 'right' }),
          // Progress bar
          rect(24, y + 56, W - 64, 5, PAL.surface2, { r: 3 }),
          rect(24, y + 56, (W - 64) * p.pct, 5, p.color, { r: 3 }),
          text(`${Math.round(p.pct * 100)}%`, W - 32, y + 56, { size: 10, color: p.color, align: 'right' }),
        ];
      }),

      ...bottomNav(2),
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 4 — STATS (Weekly deep work analytics)
// ─────────────────────────────────────────────────────────────────────────────
function screen4() {
  const weekData = [
    { day: 'Mon', h: 5.2 }, { day: 'Tue', h: 6.8 }, { day: 'Wed', h: 4.1 },
    { day: 'Thu', h: 7.3 }, { day: 'Fri', h: 3.9 }, { day: 'Sat', h: 2.4 }, { day: 'Sun', h: 5.2 },
  ];
  const maxH = 100;
  const maxVal = 8;

  return {
    id: 'screen-stats', name: 'Stats',
    elements: [
      rect(0, 0, W, H, PAL.bg),
      { type: 'ellipse', x: 100, y: -80, width: 300, height: 280,
        fill: 'rgba(139,111,255,0.05)', strokeColor: null },
      ...statusBar(),

      text('Stats', 20, 70, { size: 26, weight: 700 }),
      // Week picker
      rect(W - 110, 58, 94, 30, PAL.surface, { r: 15 }),
      { type: 'rect', x: W - 110, y: 58, width: 94, height: 30,
        fill: 'transparent', cornerRadius: 15, strokeColor: PAL.border, strokeWidth: 1 },
      text('This week  ▾', W - 63, 69, { size: 12, color: PAL.muted, align: 'center' }),

      // Bar chart
      rect(16, 104, W - 32, 170, PAL.surface, { r: 20 }),
      { type: 'rect', x: 16, y: 104, width: W - 32, height: 170,
        fill: 'transparent', cornerRadius: 20, strokeColor: PAL.border, strokeWidth: 1 },

      ...weekData.flatMap((d, i) => {
        const bw = 30, gap = (W - 64 - bw * 7) / 6;
        const bx = 28 + i * (bw + gap);
        const bh = Math.round(maxH * (d.h / maxVal));
        const isToday = i === 6;
        const barFill = isToday ? PAL.accent
          : d.h >= 6 ? PAL.accent2
          : PAL.surface2;
        return [
          rect(bx, 104 + 130 - bh, bw, bh + 4, barFill, { r: 6 }),
          text(d.day, bx + bw/2, 248, { size: 10, color: isToday ? PAL.accent : PAL.muted, align: 'center' }),
          text(`${d.h}h`, bx + bw/2, 104 + 130 - bh - 12, { size: 9, color: isToday ? PAL.accent : PAL.muted, align: 'center' }),
        ];
      }),

      // Stats row
      ...([
        { label: 'Avg / day', value: '4.9h',  sub: 'this week', color: PAL.text },
        { label: 'Best day',  value: '7.3h',  sub: 'Thursday',  color: PAL.accent2 },
        { label: 'Streak',    value: '14d',   sub: 'ongoing',   color: PAL.accent },
      ].flatMap((s, i) => {
        const x = 24 + i * ((W - 32) / 3);
        const w = (W - 64) / 3;
        return [
          rect(x, 294, w, 72, PAL.surface, { r: 16 }),
          { type: 'rect', x, y: 294, width: w, height: 72,
            fill: 'transparent', cornerRadius: 16, strokeColor: PAL.border, strokeWidth: 1 },
          text(s.value, x + w/2, 316, { size: 20, weight: 800, color: s.color, align: 'center' }),
          text(s.label, x + w/2, 338, { size: 10, color: PAL.muted, align: 'center' }),
          text(s.sub, x + w/2, 354, { size: 9, color: PAL.muted, align: 'center' }),
        ];
      })),

      // Focus score
      rect(16, 386, W - 32, 90, PAL.surface, { r: 18 }),
      { type: 'rect', x: 16, y: 386, width: W - 32, height: 90,
        fill: 'rgba(245,166,35,0.04)', cornerRadius: 18,
        strokeColor: 'rgba(245,166,35,0.15)', strokeWidth: 1.5 },
      text('Focus Score', 32, 406, { size: 12, color: PAL.muted }),
      text('84', 32, 436, { size: 38, weight: 800, color: PAL.accent }),
      text('/ 100', 85, 440, { size: 16, color: PAL.muted }),
      text('Top 12% of users this month', 32, 462, { size: 11, color: PAL.muted }),
      // Score bar
      rect(W - 140, 416, 110, 8, PAL.surface2, { r: 4 }),
      rect(W - 140, 416, 110 * 0.84, 8, PAL.accent, { r: 4 }),

      // Insights
      text('INSIGHTS', 20, 498, { size: 11, weight: 700, color: PAL.muted }),
      ...([
        { icon: '◈', msg: 'Your peak focus window is 9–12am.' },
        { icon: '▣', msg: 'Design sessions average 2.8h — above your goal.' },
        { icon: '◉', msg: 'Wednesday dips are a pattern. Protect that slot.' },
      ].flatMap((ins, i) => {
        const y = 518 + i * 58;
        return [
          rect(16, y, W - 32, 46, PAL.surface, { r: 14 }),
          { type: 'rect', x: 16, y, width: W - 32, height: 46,
            fill: 'transparent', cornerRadius: 14, strokeColor: PAL.border, strokeWidth: 1 },
          text(ins.icon, 36, y + 14, { size: 16, color: PAL.accent2 }),
          text(ins.msg, 60, y + 18, { size: 12, color: PAL.text }),
        ];
      })),

      ...bottomNav(3),
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 5 — PROFILE / SETTINGS
// ─────────────────────────────────────────────────────────────────────────────
function screen5() {
  return {
    id: 'screen-profile', name: 'Profile',
    elements: [
      rect(0, 0, W, H, PAL.bg),
      ...statusBar(),

      // Avatar area
      { type: 'ellipse', x: W/2 - 90, y: 20, width: 180, height: 180,
        fill: 'rgba(245,166,35,0.06)', strokeColor: null },
      circle(W/2, 98, 42, PAL.surface, { stroke: 'rgba(245,166,35,0.3)', sw: 2 }),
      text('R', W/2, 88, { size: 28, weight: 800, color: PAL.accent, align: 'center' }),
      text('Rakis', W/2, 154, { size: 20, weight: 700, align: 'center' }),
      text('Focus craftsman · 14 day streak 🔥', W/2, 176, { size: 12, color: PAL.muted, align: 'center' }),

      // Stats row
      ...([
        { label: 'Sessions', value: '218' },
        { label: 'Total hours', value: '412h' },
        { label: 'Best streak', value: '31d' },
      ].flatMap((s, i) => {
        const x = 24 + i * ((W - 32) / 3);
        const w = (W - 48) / 3 - 4;
        return [
          rect(x, 198, w, 60, PAL.surface, { r: 14 }),
          text(s.value, x + w/2, 218, { size: 18, weight: 800, color: PAL.text, align: 'center' }),
          text(s.label, x + w/2, 238, { size: 10, color: PAL.muted, align: 'center' }),
        ];
      })),

      // Settings sections
      text('FOCUS SETTINGS', 20, 286, { size: 11, weight: 700, color: PAL.muted }),
      ...([
        { label: 'Daily goal',       value: '6h 00m',        icon: '◎' },
        { label: 'Session reminder', value: 'Every 25 min',  icon: '◷' },
        { label: 'Focus mode',       value: 'DND + dim',     icon: '◐' },
        { label: 'Start of day',     value: '08:00',         icon: '◑' },
      ].flatMap((s, i) => {
        const y = 308 + i * 60;
        return [
          rect(16, y, W - 32, 48, PAL.surface, { r: 14 }),
          { type: 'rect', x: 16, y, width: W - 32, height: 48,
            fill: 'transparent', cornerRadius: 14, strokeColor: PAL.border, strokeWidth: 1 },
          text(s.icon, 36, y + 15, { size: 18, color: PAL.accent }),
          text(s.label, 62, y + 18, { size: 14 }),
          text(s.value, W - 32, y + 18, { size: 13, color: PAL.muted, align: 'right' }),
          text('›', W - 24, y + 15, { size: 16, color: PAL.muted, align: 'right' }),
        ];
      })),

      // Upgrade banner
      rect(16, 560, W - 32, 70, PAL.surface, { r: 18 }),
      { type: 'rect', x: 16, y: 560, width: W - 32, height: 70,
        fill: 'rgba(139,111,255,0.08)', cornerRadius: 18,
        strokeColor: 'rgba(139,111,255,0.2)', strokeWidth: 1.5 },
      text('NOCTURN PRO', 32, 578, { size: 11, weight: 700, color: PAL.accent2 }),
      text('Unlock streaks, exports & team stats', 32, 596, { size: 13, color: PAL.text }),
      text('Try free →', 32, 616, { size: 13, color: PAL.accent2, weight: 600 }),
      rect(W - 100, 580, 72, 28, PAL.accent2, { r: 14 }),
      text('Upgrade', W - 64, 590, { size: 12, color: '#0B0C0F', weight: 700, align: 'center' }),

      // Sign out
      rect(W/2 - 60, 650, 120, 36, 'transparent', { r: 18 }),
      text('Sign out', W/2, 663, { size: 14, color: PAL.muted, align: 'center' }),

      ...bottomNav(4),
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Assemble .pen file
// ─────────────────────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  meta: {
    name: 'NOCTURN',
    tagline: 'Protect your deep work',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    theme: 'dark',
    colors: PAL,
    description: 'Dark mode focus & deep work companion. Inspired by Midday + Obsidian on darkmodedesign.com — rich dark productivity tools with amber accents, glass surfaces, and dense data layouts.',
  },
  canvas: { width: W, height: H },
  screens: [screen1(), screen2(), screen3(), screen4(), screen5()],
};

fs.writeFileSync('nocturn.pen', JSON.stringify(pen, null, 2));
console.log('✓ nocturn.pen written —', pen.screens.length, 'screens');
console.log('  Total elements:', pen.screens.reduce((a, s) => a + s.elements.length, 0));
