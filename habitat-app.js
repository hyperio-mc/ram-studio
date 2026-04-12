// habitat-app.js — HABITAT · Deep Work Habit Tracker · Light Warm-Cream Theme
// Inspired by: Awwwards editorial typography (Corentin Bernadou Portfolio, Unseen Studio Wrapped),
//              Linear's clean productivity UI on DarkModeDesign.com,
//              Midday's bento-grid financial dashboard aesthetic on DarkModeDesign.com
// Theme: LIGHT (previous Loom was dark → rotating to light)

const fs = require('fs');
const path = require('path');

const W = 390, H = 844;

const C = {
  bg:       '#F7F4EF',
  surface:  '#FFFFFF',
  surface2: '#F0ECE6',
  border:   '#E2DDD6',
  text:     '#1C1917',
  textSub:  '#6B6560',
  muted:    '#A8A29B',
  accent:   '#E8490A',
  accentBg: '#FEF0EB',
  teal:     '#2A6B8C',
  tealBg:   '#EAF3F8',
  green:    '#2D7A54',
  greenBg:  '#EAF5EF',
  amber:    '#D97706',
  amberBg:  '#FEF3C7',
};

function rect(x, y, w, h, fill, opts = {}) {
  return { type: 'rect', x, y, w, h, fill, r: opts.r || 0, stroke: opts.stroke, strokeWidth: opts.sw || 1, opacity: opts.opacity || 1 };
}
function txt(x, y, text, size, fill, opts = {}) {
  return { type: 'text', x, y, text: String(text), size, fill, bold: opts.bold || false, align: opts.align || 'left', italic: opts.italic || false, opacity: opts.opacity || 1 };
}
function line(x1, y1, x2, y2, stroke, sw = 1, opacity = 1) {
  return { type: 'line', x1, y1, x2, y2, stroke, strokeWidth: sw, opacity };
}

function statusBar() {
  return [
    rect(0, 0, W, 44, C.bg),
    txt(16, 28, '9:41', 13, C.text, { bold: true }),
    txt(W - 16, 28, '●●● ▌▌▌', 9, C.muted, { align: 'right' }),
  ];
}

function navBar(active) {
  const items = [
    { id: 'today',   label: 'Today',   icon: '◈' },
    { id: 'streaks', label: 'Streaks', icon: '⬡' },
    { id: 'focus',   label: 'Focus',   icon: '◎' },
    { id: 'journal', label: 'Journal', icon: '▤' },
    { id: 'profile', label: 'Profile', icon: '◉' },
  ];
  const barY = H - 80;
  const els = [
    rect(0, barY, W, 80, C.surface),
    line(0, barY, W, barY, C.border, 1),
  ];
  items.forEach((item, i) => {
    const x = 16 + i * ((W - 32) / 5) + (W - 32) / 10;
    const isActive = item.id === active;
    els.push(txt(x, barY + 28, item.icon, 20, isActive ? C.accent : C.muted, { align: 'center' }));
    els.push(txt(x, barY + 48, item.label, 9, isActive ? C.accent : C.muted, { align: 'center', bold: isActive }));
    if (isActive) els.push(rect(x - 16, barY + 2, 32, 3, C.accent, { r: 2 }));
  });
  return els;
}

function habitRow(x, y, icon, name, detail, done, color, bgColor) {
  return [
    rect(x, y, W - 40, 48, done ? bgColor : C.surface, { r: 12, stroke: done ? undefined : C.border, sw: 1 }),
    txt(x + 14, y + 28, icon, 16, done ? color : C.muted, { bold: true }),
    txt(x + 38, y + 22, name, 13, C.text, { bold: true }),
    txt(x + 38, y + 38, detail, 11, done ? color : C.muted),
    txt(W - 36, y + 28, done ? '✓' : '○', 14, done ? color : C.border),
  ];
}

// Screen 1 — Today
function screenToday() {
  return {
    id: 'today', label: "Today's Habits",
    elements: [
      rect(0, 0, W, H, C.bg),
      ...statusBar(),

      txt(20, 68, 'Wednesday', 12, C.muted),
      txt(20, 92, 'March 25', 28, C.text, { bold: true }),

      // Hero completion card
      rect(20, 112, W - 40, 100, C.surface, { r: 16, stroke: C.border, sw: 1 }),
      txt(36, 188, '72', 60, C.accent, { bold: true }),
      txt(100, 188, '%', 28, C.accent, { bold: true }),
      txt(36, 148, 'completed today', 11, C.muted),
      rect(140, 155, W - 180, 6, C.border, { r: 3 }),
      rect(140, 155, (W - 180) * 0.72, 6, C.accent, { r: 3 }),
      txt(140, 178, '13 of 18 habits done', 11, C.textSub),
      rect(W - 84, 130, 64, 24, C.accentBg, { r: 12 }),
      txt(W - 52, 146, '🔥 21d', 11, C.accent, { bold: true, align: 'center' }),

      txt(20, 234, 'MORNING', 10, C.muted, { bold: true }),
      line(20, 242, W - 20, 242, C.border, 1),

      ...habitRow(20, 252, '◉', 'Deep Work Block', '2h 30m', true, C.teal, C.tealBg),
      ...habitRow(20, 306, '◉', 'Morning Pages', '3 pages', true, C.green, C.greenBg),
      ...habitRow(20, 360, '○', 'Cold Shower', 'pending', false, C.muted, C.surface2),

      txt(20, 408, 'AFTERNOON', 10, C.muted, { bold: true }),
      line(20, 416, W - 20, 416, C.border, 1),

      ...habitRow(20, 426, '◉', 'No Social Media', '4h clean', true, C.green, C.greenBg),
      ...habitRow(20, 480, '○', 'Exercise', '30 min', false, C.muted, C.surface2),
      ...habitRow(20, 534, '○', 'Read', '20 pages', false, C.muted, C.surface2),

      rect(20, 596, W - 40, 44, C.accentBg, { r: 12, stroke: C.accent, sw: 1 }),
      txt(W / 2, 622, '+ Add habit to today', 13, C.accent, { align: 'center', bold: true }),

      ...navBar('today'),
    ]
  };
}

// Screen 2 — Streaks
function screenStreaks() {
  function streakCard(x, y, name, streak, pct, color, bg) {
    const w = (W - 52) / 2;
    return [
      rect(x, y, w, 72, bg, { r: 14 }),
      txt(x + 12, y + 36, streak, 26, color, { bold: true }),
      rect(x + 12, y + 44, w - 24, 5, 'rgba(0,0,0,0.08)', { r: 3 }),
      rect(x + 12, y + 44, Math.min((w - 24) * pct, w - 24), 5, color, { r: 3 }),
      txt(x + 12, y + 60, name, 10, color),
    ];
  }

  function heatmap(sx, sy) {
    const els = [];
    const filled = [1,1,1,1,1,0,1, 1,1,1,0,1,1,1, 1,0,1,1,1,1,0, 0,1,1,1,1,0,1, 1,1,1,1,1,0,0];
    for (let i = 0; i < 35; i++) {
      const col = i % 7, row = Math.floor(i / 7);
      const isToday = i === 24;
      els.push(rect(sx + col * 51, sy + row * 18, 44, 12,
        isToday ? C.accent : filled[i] ? C.green : C.border, { r: 3 }));
    }
    return els;
  }

  return {
    id: 'streaks', label: 'Streak Board',
    elements: [
      rect(0, 0, W, H, C.bg),
      ...statusBar(),
      txt(20, 72, 'Streaks', 26, C.text, { bold: true }),
      txt(20, 96, 'Keep the chain alive', 13, C.muted),

      rect(20, 116, W - 40, 96, C.accent, { r: 20 }),
      txt(36, 162, '21', 44, '#FFFFFF', { bold: true }),
      txt(92, 162, 'day streak', 15, 'rgba(255,255,255,0.75)'),
      txt(36, 180, 'Deep Work Block · Best ever: 34d', 11, 'rgba(255,255,255,0.6)'),
      txt(W - 36, 148, '🔥', 28, undefined, { align: 'right' }),

      txt(20, 232, 'ALL HABITS', 10, C.muted, { bold: true }),
      line(20, 242, W - 20, 242, C.border, 1),

      ...streakCard(20,      252, 'Morning Pages',   '18d', 0.53, C.green, C.greenBg),
      ...streakCard(W/2 + 6, 252, 'Cold Shower',     '7d',  0.21, C.teal,  C.tealBg),
      ...streakCard(20,      332, 'No Social Media',  '14d', 0.41, C.amber, C.amberBg),
      ...streakCard(W/2 + 6, 332, 'Exercise',        '3d',  0.09, C.accent,C.accentBg),
      ...streakCard(20,      412, 'Read',            '11d', 0.32, C.green, C.greenBg),
      ...streakCard(W/2 + 6, 412, 'Journaling',     '5d',  0.15, C.teal,  C.tealBg),

      txt(20, 502, 'MARCH HEATMAP', 10, C.muted, { bold: true }),
      line(20, 512, W - 20, 512, C.border, 1),
      ...heatmap(20, 522),
      txt(20, 620, 'Mon', 9, C.muted), txt(71, 620, 'Tue', 9, C.muted),
      txt(122, 620, 'Wed', 9, C.accent, { bold: true }),
      txt(173, 620, 'Thu', 9, C.muted), txt(224, 620, 'Fri', 9, C.muted),
      txt(275, 620, 'Sat', 9, C.muted), txt(326, 620, 'Sun', 9, C.muted),

      ...navBar('streaks'),
    ]
  };
}

// Screen 3 — Focus Timer
function screenFocus() {
  function modeChip(x, y, label, active) {
    return [
      rect(x, y, 110, 28, active ? C.accentBg : C.surface, { r: 14, stroke: active ? C.accent : C.border, sw: 1 }),
      txt(x + 55, y + 18, label, 10, active ? C.accent : C.textSub, { align: 'center', bold: active }),
    ];
  }
  return {
    id: 'focus', label: 'Focus Timer',
    elements: [
      rect(0, 0, W, H, C.bg),
      ...statusBar(),
      txt(W/2, 72, 'Focus', 16, C.text, { bold: true, align: 'center' }),
      txt(W/2, 92, 'Deep Work Block', 12, C.muted, { align: 'center' }),

      rect(20, 112, W - 40, 200, C.surface, { r: 24, stroke: C.border, sw: 1 }),
      txt(W/2, 222, '47:23', 72, C.text, { bold: true, align: 'center' }),
      txt(W/2, 258, 'remaining · Session 1 of 4', 12, C.muted, { align: 'center' }),
      rect(W/2 - 36, 276, 72, 22, C.accentBg, { r: 11 }),
      txt(W/2, 291, '61% complete', 10, C.accent, { align: 'center', bold: true }),

      rect(20, 328, W - 40, 8, C.border, { r: 4 }),
      rect(20, 328, (W - 40) * 0.61, 8, C.accent, { r: 4 }),

      rect(20, 354, W - 40, 72, C.surface, { r: 16, stroke: C.border, sw: 1 }),
      txt(W/4, 382, '2h 13m', 18, C.text, { bold: true, align: 'center' }),
      txt(W/4, 402, 'today', 10, C.muted, { align: 'center' }),
      line(W/2, 366, W/2, 414, C.border, 1),
      txt(3*W/4, 382, '8', 18, C.green, { bold: true, align: 'center' }),
      txt(3*W/4, 402, 'sessions', 10, C.muted, { align: 'center' }),

      txt(20, 450, 'WORKING ON', 10, C.muted, { bold: true }),
      rect(20, 462, W - 40, 52, C.tealBg, { r: 14 }),
      txt(36, 485, '◎', 14, C.teal),
      txt(58, 487, 'Chapter 4 — Systems Thinking', 13, C.teal, { bold: true }),
      txt(58, 504, 'Writing project', 11, C.teal, { opacity: 0.7 }),

      rect(W/2 - 36, 538, 72, 38, C.accent, { r: 19 }),
      txt(W/2, 561, '❙❙ Pause', 13, '#FFFFFF', { bold: true, align: 'center' }),
      txt(W/2 - 80, 561, '↺ Skip', 12, C.muted, { align: 'center' }),
      txt(W/2 + 80, 561, '✕ End', 12, C.muted, { align: 'center' }),

      txt(20, 600, 'MODE', 10, C.muted, { bold: true }),
      ...modeChip(20,  614, 'Classic 25/5', true),
      ...modeChip(140, 614, 'Deep 50/10', false),
      ...modeChip(260, 614, 'Flow 90/20', false),

      rect(20, 660, W - 40, 44, C.surface2, { r: 12 }),
      txt(36, 686, '♫', 14, C.muted),
      txt(56, 688, 'Lo-fi Focus Mix · Brain.fm', 13, C.textSub),
      txt(W - 36, 688, '▶', 14, C.accent, { align: 'right' }),

      ...navBar('focus'),
    ]
  };
}

// Screen 4 — Journal
function screenJournal() {
  function journalEntry(x, y, date, mood, text, color) {
    return [
      rect(x, y, W - 40, 48, C.surface, { r: 12, stroke: C.border, sw: 1 }),
      txt(x + 14, y + 18, date, 10, C.muted),
      txt(x + 14, y + 36, text, 12, C.textSub),
      txt(W - 36, y + 28, mood, 11, color, { align: 'right', bold: true }),
    ];
  }
  return {
    id: 'journal', label: 'Journal',
    elements: [
      rect(0, 0, W, H, C.bg),
      ...statusBar(),
      txt(20, 72, 'Journal', 26, C.text, { bold: true }),
      txt(20, 96, 'Wednesday, March 25', 13, C.muted),

      rect(20, 116, W - 40, 72, C.surface, { r: 16, stroke: C.border, sw: 1 }),
      txt(36, 140, 'How are you feeling?', 13, C.text, { bold: true }),
      txt(46,  168, '😔', 18), txt(96, 168, '😐', 18),
      txt(146, 168, '🙂', 18),
      rect(192, 154, 40, 40, C.accentBg, { r: 20 }),
      txt(196, 178, '😊', 18),
      txt(246, 168, '🤩', 18),

      txt(20, 210, "TODAY'S REFLECTION", 10, C.muted, { bold: true }),
      line(20, 220, W - 20, 220, C.border, 1),

      rect(20, 230, W - 40, 90, C.surface, { r: 14, stroke: C.border, sw: 1 }),
      txt(36, 252, 'What was your biggest win today?', 11, C.muted, { italic: true }),
      txt(36, 272, 'Finished the outline for Chapter 4', 13, C.text),
      txt(36, 290, 'without any distractions — 2 full', 13, C.text),
      txt(36, 308, 'Pomodoros back to back.', 13, C.text),

      rect(20, 330, W - 40, 66, C.surface, { r: 14, stroke: C.border, sw: 1 }),
      txt(36, 354, 'What do you want to improve?', 11, C.muted, { italic: true }),
      txt(36, 378, 'Tap to write...', 13, C.muted, { italic: true }),

      txt(20, 420, 'WEEKLY INTENTION', 10, C.muted, { bold: true }),
      line(20, 430, W - 20, 430, C.border, 1),
      rect(20, 440, W - 40, 60, C.tealBg, { r: 14 }),
      txt(36, 462, '"Ship the first draft of Systems', 13, C.teal, { italic: true }),
      txt(36, 480, 'Thinking without self-editing."', 13, C.teal, { italic: true }),

      txt(20, 524, 'RECENT ENTRIES', 10, C.muted, { bold: true }),
      line(20, 534, W - 20, 534, C.border, 1),
      ...journalEntry(20, 544, 'Tue Mar 24', '★ Great', 'Finished the chapter outline...', C.green),
      ...journalEntry(20, 600, 'Mon Mar 23', '◎ Okay', 'Struggled with focus early...', C.amber),
      ...journalEntry(20, 656, 'Sun Mar 22', '★ Great', 'Best session of the week...', C.green),

      ...navBar('journal'),
    ]
  };
}

// Screen 5 — Weekly Review
function screenReview() {
  function reviewCard(x, y, name, count, pct, color, bg) {
    const w = (W - 52) / 2;
    return [
      rect(x, y, w, 76, bg, { r: 14 }),
      txt(x + 12, y + 32, count, 22, color, { bold: true }),
      txt(x + 54, y + 32, `${pct}%`, 14, color),
      rect(x + 12, y + 42, w - 24, 5, 'rgba(0,0,0,0.08)', { r: 3 }),
      rect(x + 12, y + 42, (w - 24) * (pct / 100), 5, color, { r: 3 }),
      txt(x + 12, y + 60, name, 10, color),
    ];
  }
  function focusBars(x, baseY, vals) {
    const maxH = 60, maxVal = 6;
    const labels = ['M','T','W','T','F','S','S'];
    return vals.flatMap((v, i) => {
      const barH = (v / maxVal) * maxH;
      const bx = x + i * 48;
      const isToday = i === 2;
      return [
        rect(bx, baseY - maxH, 32, maxH, C.border, { r: 4 }),
        rect(bx, baseY - barH, 32, barH, isToday ? C.accent : C.teal, { r: 4 }),
        txt(bx + 16, baseY + 12, labels[i], 9, isToday ? C.accent : C.muted, { align: 'center', bold: isToday }),
        txt(bx + 16, baseY - barH - 8, v + 'h', 8, isToday ? C.accent : C.textSub, { align: 'center' }),
      ];
    });
  }
  return {
    id: 'review', label: 'Weekly Review',
    elements: [
      rect(0, 0, W, H, C.bg),
      ...statusBar(),
      txt(20, 72, 'Weekly Review', 22, C.text, { bold: true }),
      txt(20, 96, 'Mar 17–23 · Week 12', 12, C.muted),

      // Inverted hero card — dark on light
      rect(20, 116, W - 40, 88, C.text, { r: 20 }),
      txt(36, 162, '84', 52, C.bg, { bold: true }),
      txt(104, 162, '%', 26, C.bg, { bold: true }),
      txt(36, 185, 'completion · ▲ 9% vs last week', 11, 'rgba(247,244,239,0.55)'),
      txt(W - 36, 145, '🏆', 22, undefined, { align: 'right' }),
      txt(W - 36, 172, 'Best in 3 months', 10, 'rgba(247,244,239,0.5)', { align: 'right' }),

      txt(20, 226, 'HABIT BREAKDOWN', 10, C.muted, { bold: true }),
      line(20, 236, W - 20, 236, C.border, 1),

      ...reviewCard(20,      246, 'Deep Work',    '6/7', 86,  C.teal,  C.tealBg),
      ...reviewCard(W/2 + 6, 246, 'Morning Pages','5/7', 71,  C.green, C.greenBg),
      ...reviewCard(20,      330, 'Exercise',     '4/7', 57,  C.amber, C.amberBg),
      ...reviewCard(W/2 + 6, 330, 'Cold Shower',  '7/7', 100, C.accent,C.accentBg),

      txt(20, 424, 'FOCUS HOURS / DAY', 10, C.muted, { bold: true }),
      line(20, 434, W - 20, 434, C.border, 1),
      rect(20, 444, W - 40, 98, C.surface, { r: 14, stroke: C.border, sw: 1 }),
      ...focusBars(36, 520, [3.5, 2, 4.5, 3, 5, 1.5, 4]),

      txt(20, 562, 'INSIGHTS', 10, C.muted, { bold: true }),
      line(20, 572, W - 20, 572, C.border, 1),

      rect(20, 582, W - 40, 52, C.greenBg, { r: 14 }),
      txt(36, 602, '◎', 14, C.green),
      txt(56, 604, 'You focus best on Fridays (5h avg)', 12, C.green, { bold: true }),
      txt(56, 622, 'Schedule your hardest task then', 11, C.green, { opacity: 0.8 }),

      rect(20, 642, W - 40, 52, C.amberBg, { r: 14 }),
      txt(36, 662, '⚡', 14, C.amber),
      txt(56, 664, 'Weekend habits drop 42%', 12, C.amber, { bold: true }),
      txt(56, 682, 'Try a lighter Saturday routine', 11, C.amber, { opacity: 0.8 }),

      ...navBar('profile'),
    ]
  };
}

const screens = [
  screenToday(),
  screenStreaks(),
  screenFocus(),
  screenJournal(),
  screenReview(),
];

const pen = {
  version: '2.8',
  meta: {
    name: 'HABITAT — Deep Work Habit Tracker',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    description: "Light warm-cream habit tracker for deep workers. Bento grid + editorial typography inspired by Awwwards nominees and Linear's clean productivity UI on Dark Mode Design.",
    tags: ['light', 'habit-tracker', 'productivity', 'editorial', 'bento', 'warm-cream'],
  },
  canvas: { width: W, height: H },
  screens,
};

const outPath = path.join(__dirname, 'habitat.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
const totalEls = screens.reduce((a, s) => a + s.elements.length, 0);
console.log(`✓ habitat.pen written — ${screens.length} screens, ${totalEls} elements`);
