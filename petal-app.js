'use strict';
const fs = require('fs'), path = require('path');

const SLUG = 'petal';
const NAME = 'Petal';
const TAGLINE = 'Your daily wellness garden';
const W = 390, H = 844;

// Light palette — warm cream + sage + amber
const BG     = '#FAF7F4';
const SURF   = '#FFFFFF';
const CARD   = '#F2EDE8';
const CARD2  = '#E8EFE9';
const TEXT   = '#1C1917';
const TEXT2  = '#57534E';
const TEXT3  = '#A8A29E';
const ACC    = '#5B8A6B';  // sage green
const ACC2   = '#C4873C';  // amber
const ACC3   = '#9B7EC8';  // soft violet
const DIVID  = '#E5DDD8';

function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, width: w, height: h, fill,
    rx: opts.rx ?? 0,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none',
    strokeWidth: opts.sw ?? 0,
  };
}

function text(x, y, content, size, fill, opts = {}) {
  return {
    type: 'text', x, y, content, fontSize: size, fill,
    fontWeight: opts.fw ?? 400,
    fontFamily: opts.font ?? 'Inter, sans-serif',
    textAnchor: opts.anchor ?? 'start',
    letterSpacing: opts.ls ?? 0,
    opacity: opts.opacity ?? 1,
  };
}

function circle(cx, cy, r, fill, opts = {}) {
  return {
    type: 'circle', cx, cy, r, fill,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none',
    strokeWidth: opts.sw ?? 0,
  };
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  return {
    type: 'line', x1, y1, x2, y2, stroke,
    strokeWidth: opts.sw ?? 1,
    opacity: opts.opacity ?? 1,
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function pill(x, y, w, h, fill, label, labelColor, opts = {}) {
  return [
    rect(x, y, w, h, fill, { rx: h / 2, ...opts }),
    text(x + w / 2, y + h / 2 + 5, label, 11, labelColor, { fw: 600, anchor: 'middle' }),
  ].flat();
}

function statusBar(els) {
  els.push(rect(0, 0, W, 44, BG));
  els.push(text(20, 29, '9:41', 15, TEXT, { fw: 600 }));
  els.push(text(370, 29, '●●●', 12, TEXT3, { anchor: 'end' }));
}

function bottomNav(els, active) {
  const NAV_H = 80;
  els.push(rect(0, H - NAV_H, W, NAV_H, SURF));
  els.push(line(0, H - NAV_H, W, H - NAV_H, DIVID, { sw: 1 }));
  const tabs = [
    { label: 'Garden', icon: '❀', id: 'garden' },
    { label: 'Today',  icon: '◎', id: 'today' },
    { label: 'Streaks',icon: '▲', id: 'streaks' },
    { label: 'Journal',icon: '✦', id: 'journal' },
    { label: 'Profile',icon: '○', id: 'profile' },
  ];
  const tw = W / tabs.length;
  tabs.forEach((t, i) => {
    const cx = tw * i + tw / 2;
    const isActive = t.id === active;
    if (isActive) {
      els.push(...pill(cx - 28, H - NAV_H + 10, 56, 28, ACC + '20', t.icon + ' ' + t.label, ACC));
    } else {
      els.push(text(cx, H - NAV_H + 30, t.icon, 18, TEXT3, { anchor: 'middle' }));
      els.push(text(cx, H - NAV_H + 48, t.label, 10, TEXT3, { anchor: 'middle' }));
    }
  });
}

// ── SCREEN 1 — Garden Dashboard ──────────────────────────────────────────────
function buildDashboard() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  // Header
  els.push(text(20, 80, 'Good morning,', 14, TEXT3, { fw: 400 }));
  els.push(text(20, 108, 'Your Garden', 34, TEXT, { fw: 700 }));

  // Date chip
  els.push(...pill(20, 122, 110, 26, CARD, '📅 Wed, Apr 9', TEXT2));

  // Streak banner
  els.push(rect(20, 164, W - 40, 72, ACC, { rx: 16 }));
  els.push(text(36, 191, '🔥', 20, '#fff'));
  els.push(text(66, 193, '14-day streak', 15, '#fff', { fw: 700 }));
  els.push(text(66, 212, "Keep going \u2014 you're on fire!", 11, 'rgba(255,255,255,0.75)'));
  // Streak circles
  ['M','T','W','T','F','S','S'].forEach((d, i) => {
    const cx = W - 100 + i * 11;
    els.push(circle(cx, 200, 4, i < 5 ? '#fff' : 'rgba(255,255,255,0.3)'));
  });

  // Bento grid title
  els.push(text(20, 258, 'TODAY\'S RITUALS', 11, TEXT3, { fw: 700, ls: 1.2 }));

  // Bento card 1 — large (top-left): Morning water
  const B1X = 20, B1Y = 274, B1W = 168, B1H = 148;
  els.push(rect(B1X, B1Y, B1W, B1H, SURF, { rx: 20 }));
  els.push(rect(B1X, B1Y, B1W, B1H, ACC + '08', { rx: 20 }));
  els.push(text(B1X + 14, B1Y + 30, '💧', 28, ACC));
  els.push(text(B1X + 14, B1Y + 68, 'Water', 17, TEXT, { fw: 700 }));
  els.push(text(B1X + 14, B1Y + 87, '6 of 8 glasses', 12, TEXT2));
  // Mini progress bar
  els.push(rect(B1X + 14, B1Y + 104, B1W - 28, 8, DIVID, { rx: 4 }));
  els.push(rect(B1X + 14, B1Y + 104, (B1W - 28) * 0.75, 8, ACC, { rx: 4 }));
  els.push(text(B1X + 14, B1Y + 132, '75%', 13, ACC, { fw: 700 }));
  els.push(text(B1X + B1W - 14, B1Y + 132, '2 left', 11, TEXT3, { anchor: 'end' }));

  // Bento card 2 — large (top-right): Movement
  const B2X = 202, B2Y = 274, B2W = 168, B2H = 148;
  els.push(rect(B2X, B2Y, B2W, B2H, SURF, { rx: 20 }));
  els.push(rect(B2X, B2Y, B2W, B2H, ACC2 + '0D', { rx: 20 }));
  els.push(text(B2X + 14, B2Y + 30, '🏃', 28, ACC2));
  els.push(text(B2X + 14, B2Y + 68, 'Move', 17, TEXT, { fw: 700 }));
  els.push(text(B2X + 14, B2Y + 87, '4,218 steps', 12, TEXT2));
  // Ring chart (arc approximation)
  els.push(circle(B2X + B2W / 2, B2Y + 112, 22, 'none', { stroke: DIVID, sw: 5 }));
  els.push(circle(B2X + B2W / 2, B2Y + 112, 22, 'none', { stroke: ACC2, sw: 5 }));
  els.push(text(B2X + B2W / 2, B2Y + 117, '56%', 11, ACC2, { fw: 700, anchor: 'middle' }));

  // Bento card 3 — wide (bottom-left): Mindfulness
  const B3X = 20, B3Y = 434, B3W = 224, B3H = 100;
  els.push(rect(B3X, B3Y, B3W, B3H, SURF, { rx: 20 }));
  els.push(rect(B3X, B3Y, B3W, B3H, ACC3 + '0D', { rx: 20 }));
  els.push(text(B3X + 14, B3Y + 35, '🧘', 24, ACC3));
  els.push(text(B3X + 50, B3Y + 32, 'Mindful', 15, TEXT, { fw: 700 }));
  els.push(text(B3X + 50, B3Y + 50, '10 min session', 11, TEXT2));
  els.push(...pill(B3X + 14, B3Y + 68, 54, 22, ACC3, 'Done ✓', '#fff'));

  // Bento card 4 — small (bottom-right): Sleep
  const B4X = 256, B4Y = 434, B4W = 114, B4H = 100;
  els.push(rect(B4X, B4Y, B4W, B4H, SURF, { rx: 20 }));
  els.push(text(B4X + 12, B4Y + 32, '🌙', 22, '#7C6FCD'));
  els.push(text(B4X + 12, B4Y + 60, '7h 42m', 16, TEXT, { fw: 700 }));
  els.push(text(B4X + 12, B4Y + 78, 'Last night', 10, TEXT3));

  // Upcoming section
  els.push(text(20, 556, 'UPCOMING', 11, TEXT3, { fw: 700, ls: 1.2 }));
  const upcoming = [
    { emoji: '📖', name: 'Evening read', time: '9:00 PM', done: false },
    { emoji: '🌿', name: 'Plant check-in', time: '7:30 PM', done: false },
  ];
  upcoming.forEach((u, i) => {
    const uy = 572 + i * 54;
    els.push(rect(20, uy, W - 40, 46, SURF, { rx: 14 }));
    els.push(text(36, uy + 28, u.emoji, 18, TEXT));
    els.push(text(66, uy + 22, u.name, 14, TEXT, { fw: 500 }));
    els.push(text(66, uy + 38, u.time, 11, TEXT3));
    els.push(...pill(W - 36, uy + 12, 0, 22, CARD, u.done ? '✓' : '○', TEXT3));
    els.push(text(W - 36, uy + 28, u.done ? '✓' : '○', 14, TEXT3, { anchor: 'end' }));
  });

  bottomNav(els, 'garden');
  return els;
}

// ── SCREEN 2 — Today's Rituals ────────────────────────────────────────────────
function buildToday() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  els.push(text(20, 80, 'Wednesday', 14, TEXT3));
  els.push(text(20, 108, 'Today\'s Rituals', 30, TEXT, { fw: 700 }));

  // Progress ring at top
  const cx = W - 70, cy = 90;
  els.push(circle(cx, cy, 38, 'none', { stroke: DIVID, sw: 7 }));
  els.push(circle(cx, cy, 38, 'none', { stroke: ACC, sw: 7 }));
  els.push(text(cx, cy - 8, '5', 22, ACC, { fw: 800, anchor: 'middle' }));
  els.push(text(cx, cy + 10, 'of 8', 11, TEXT3, { anchor: 'middle' }));

  const rituals = [
    { emoji: '💧', name: 'Drink water', sub: '6 of 8 glasses', done: true,  color: ACC  },
    { emoji: '🧘', name: 'Meditate',    sub: '10 min',          done: true,  color: ACC3 },
    { emoji: '🏃', name: 'Move',        sub: '4,218 / 7,500',   done: false, color: ACC2 },
    { emoji: '🌿', name: 'Gratitude',   sub: '3 things',        done: true,  color: ACC  },
    { emoji: '📖', name: 'Read',        sub: '20 pages',        done: false, color: ACC2 },
    { emoji: '🥗', name: 'Eat veggies', sub: '2 servings',      done: true,  color: '#5E9B6A'},
    { emoji: '🌙', name: 'Wind down',   sub: 'No screens 9 PM', done: false, color: ACC3 },
    { emoji: '✍️', name: 'Journal',     sub: '5 min reflect',   done: false, color: '#B08A5A'},
  ];

  els.push(text(20, 146, 'YOUR PRACTICES', 11, TEXT3, { fw: 700, ls: 1.2 }));

  rituals.forEach((r, i) => {
    const ry = 162 + i * 60;
    els.push(rect(20, ry, W - 40, 52, SURF, { rx: 16 }));
    // Left color bar
    els.push(rect(20, ry, 4, 52, r.done ? r.color : DIVID, { rx: 2 }));
    // Emoji
    els.push(text(40, ry + 31, r.emoji, 22, r.color));
    // Name + sub
    els.push(text(74, ry + 24, r.name, 14, r.done ? TEXT : TEXT2, { fw: 600 }));
    els.push(text(74, ry + 40, r.sub, 11, TEXT3));
    // Check
    if (r.done) {
      els.push(circle(W - 36, ry + 26, 11, ACC));
      els.push(text(W - 36, ry + 30, '✓', 10, '#fff', { anchor: 'middle', fw: 700 }));
    } else {
      els.push(circle(W - 36, ry + 26, 11, 'none', { stroke: DIVID, sw: 2 }));
    }
  });

  bottomNav(els, 'today');
  return els;
}

// ── SCREEN 3 — Streaks ────────────────────────────────────────────────────────
function buildStreaks() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  els.push(text(20, 80, 'Your consistency', 14, TEXT3));
  els.push(text(20, 108, 'Streaks', 34, TEXT, { fw: 700 }));

  // Top stats row
  const stats = [{ v: '14', l: 'Current', c: ACC }, { v: '23', l: 'Best', c: ACC2 }, { v: '89%', l: 'This month', c: ACC3 }];
  stats.forEach((s, i) => {
    const sx = 20 + i * 120;
    els.push(rect(sx, 128, 110, 68, SURF, { rx: 16 }));
    els.push(text(sx + 14, sx < 260 ? 158 : 158, s.v, 28, s.c, { fw: 800 }));
    els.push(text(sx + 14, 181, s.l, 11, TEXT3));
  });

  // Calendar heatmap
  els.push(text(20, 220, 'MARCH — APRIL', 11, TEXT3, { fw: 700, ls: 1.2 }));
  const days = ['M','T','W','T','F','S','S'];
  days.forEach((d, i) => {
    els.push(text(26 + i * 50, 238, d, 10, TEXT3, { anchor: 'middle', fw: 600 }));
  });
  // 4 weeks of heat cells
  const intensities = [
    [0.9, 1, 0.8, 1, 1, 0.5, 0.3],
    [1, 0.9, 1, 1, 0.7, 0.4, 0.2],
    [0.8, 1, 1, 0.9, 1, 0.6, 0.5],
    [1, 1, 0.9, 1, 0.8, 0, 0],
  ];
  intensities.forEach((week, wi) => {
    week.forEach((v, di) => {
      const cx2 = 26 + di * 50, cy2 = 258 + wi * 38;
      const alpha = Math.round(v * 255).toString(16).padStart(2, '0');
      els.push(rect(cx2 - 18, cy2, 36, 28, v > 0 ? ACC + alpha : CARD, { rx: 8 }));
      if (v > 0.7) els.push(text(cx2, cy2 + 18, '✓', 11, '#fff', { anchor: 'middle', fw: 700 }));
    });
  });

  // Habit breakdown
  els.push(text(20, 424, 'BY HABIT', 11, TEXT3, { fw: 700, ls: 1.2 }));
  const habits = [
    { name: 'Water', pct: 92, color: ACC,  streak: 14 },
    { name: 'Move',  pct: 78, color: ACC2, streak: 8  },
    { name: 'Meditate', pct: 85, color: ACC3, streak: 12 },
    { name: 'Journal',  pct: 64, color: '#B08A5A', streak: 5 },
  ];
  habits.forEach((h, i) => {
    const hy = 440 + i * 56;
    els.push(rect(20, hy, W - 40, 48, SURF, { rx: 14 }));
    els.push(text(36, hy + 30, h.name, 14, TEXT, { fw: 600 }));
    // streak badge
    els.push(...pill(W - 84, hy + 13, 64, 22, h.color + '20', '🔥 ' + h.streak + 'd', h.color));
    // progress bar
    els.push(rect(36, hy + 38, W - 92, 4, DIVID, { rx: 2 }));
    els.push(rect(36, hy + 38, (W - 92) * h.pct / 100, 4, h.color, { rx: 2 }));
    els.push(text(W - 50, hy + 28, h.pct + '%', 11, TEXT3));
  });

  bottomNav(els, 'streaks');
  return els;
}

// ── SCREEN 4 — Insights ───────────────────────────────────────────────────────
function buildInsights() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  els.push(text(20, 80, 'Patterns & reflections', 14, TEXT3));
  els.push(text(20, 108, 'Insights', 34, TEXT, { fw: 700 }));

  // Week selector
  const weeks = ['Mar 24', 'Mar 31', 'Apr 7'];
  weeks.forEach((w, i) => {
    const active = i === 2;
    els.push(...pill(20 + i * 118, 128, 108, 28, active ? ACC : SURF, w, active ? '#fff' : TEXT2));
  });

  // Big insight card
  els.push(rect(20, 174, W - 40, 130, ACC, { rx: 20 }));
  els.push(text(36, 210, '✨', 28, '#fff'));
  els.push(text(36, 242, 'Best week yet!', 20, '#fff', { fw: 700 }));
  els.push(text(36, 264, 'You completed 89% of your rituals —', 12, 'rgba(255,255,255,0.8)'));
  els.push(text(36, 282, 'highest since you started.', 12, 'rgba(255,255,255,0.8)'));
  // Score
  els.push(text(W - 32, 252, '89', 46, '#fff', { fw: 900, anchor: 'end' }));
  els.push(text(W - 32, 278, '/ 100', 13, 'rgba(255,255,255,0.65)', { anchor: 'end' }));

  // Weekly bar chart
  els.push(text(20, 330, 'DAILY COMPLETION', 11, TEXT3, { fw: 700, ls: 1.2 }));
  const days2 = ['M','T','W','T','F','S','S'];
  const vals = [82, 95, 75, 100, 88, 42, 62];
  const barW = 36, barMaxH = 100, barY = 442;
  days2.forEach((d, i) => {
    const bx = 24 + i * 50;
    const bh = barMaxH * vals[i] / 100;
    const isToday = i === 3;
    els.push(rect(bx, barY - barMaxH, barW, barMaxH, DIVID, { rx: 8 }));
    els.push(rect(bx, barY - bh, barW, bh, isToday ? ACC : ACC + '99', { rx: 8 }));
    els.push(text(bx + barW / 2, barY + 14, d, 10, isToday ? ACC : TEXT3, { anchor: 'middle', fw: isToday ? 700 : 400 }));
    els.push(text(bx + barW / 2, barY - bh - 6, vals[i] + '%', 9, TEXT3, { anchor: 'middle' }));
  });

  // Insight cards row
  els.push(text(20, 476, 'PATTERNS', 11, TEXT3, { fw: 700, ls: 1.2 }));
  const insights = [
    { icon: '🌅', title: 'Morning person', body: 'You complete 94% of AM habits' },
    { icon: '😴', title: 'Sleep gap', body: 'Late nights hurt next-day score' },
  ];
  insights.forEach((ins, i) => {
    const ix = 20 + i * 180, iy = 492;
    els.push(rect(ix, iy, 170, 96, SURF, { rx: 16 }));
    els.push(text(ix + 14, iy + 34, ins.icon, 24, TEXT));
    els.push(text(ix + 14, iy + 62, ins.title, 13, TEXT, { fw: 700 }));
    els.push(text(ix + 14, iy + 78, ins.body, 10, TEXT3));
  });

  // Suggestion card
  els.push(rect(20, 608, W - 40, 68, CARD2, { rx: 16 }));
  els.push(text(36, 636, '💡', 20, ACC));
  els.push(text(66, 632, 'Try this: Add a 5-min walk after', 13, TEXT, { fw: 600 }));
  els.push(text(66, 650, 'lunch to boost your step count.', 12, TEXT2));
  els.push(text(66, 666, 'Tap to add ritual →', 11, ACC, { fw: 600 }));

  bottomNav(els, 'garden');
  return els;
}

// ── SCREEN 5 — Journal ────────────────────────────────────────────────────────
function buildJournal() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  els.push(text(20, 80, 'Wednesday, Apr 9', 14, TEXT3));
  els.push(text(20, 108, 'Journal', 34, TEXT, { fw: 700 }));

  // Mood selector
  els.push(text(20, 148, 'How are you feeling?', 14, TEXT2, { fw: 500 }));
  const moods = ['😔','😐','🙂','😊','🤩'];
  moods.forEach((m, i) => {
    const mx = 26 + i * 70;
    const active = i === 3;
    els.push(circle(mx, 186, active ? 26 : 22, active ? ACC + '20' : SURF));
    els.push(text(mx, 193, m, active ? 24 : 20, TEXT, { anchor: 'middle' }));
    if (active) els.push(circle(mx, 215, 4, ACC));
  });

  // Gratitude section
  els.push(rect(20, 232, W - 40, 130, SURF, { rx: 20 }));
  els.push(text(36, 258, 'Gratitude', 15, TEXT, { fw: 700 }));
  els.push(text(36, 278, '3 things I\'m grateful for today', 11, TEXT3));
  const grats = ['Morning sunlight through the window', 'A long walk with my dog', 'This feels like a good week'];
  grats.forEach((g, i) => {
    const gy = 294 + i * 24;
    els.push(circle(42, gy + 5, 5, ACC));
    els.push(text(56, gy + 9, g, 12, TEXT2));
  });

  // Reflection prompt
  els.push(rect(20, 380, W - 40, 110, SURF, { rx: 20 }));
  els.push(text(36, 406, 'Today\'s reflection', 15, TEXT, { fw: 700 }));
  els.push(text(36, 426, 'What made today meaningful?', 11, TEXT3));
  els.push(text(36, 452, 'I focused on the small wins. The morning', 12, TEXT2));
  els.push(text(36, 470, 'meditation helped me stay calm during', 12, TEXT2));
  els.push(text(36, 488, 'a stressful meeting.', 12, TEXT2));

  // Past entries
  els.push(text(20, 514, 'RECENT ENTRIES', 11, TEXT3, { fw: 700, ls: 1.2 }));
  const entries = [
    { date: 'Apr 8 · Tue', mood: '😊', preview: 'Great run this morning, 5K!' },
    { date: 'Apr 7 · Mon', mood: '🙂', preview: 'Slow start but evening was good.' },
    { date: 'Apr 6 · Sun', mood: '🤩', preview: 'Best day this week, full score!' },
  ];
  entries.forEach((e, i) => {
    const ey = 530 + i * 54;
    els.push(rect(20, ey, W - 40, 46, SURF, { rx: 14 }));
    els.push(text(36, ey + 30, e.mood, 20, TEXT));
    els.push(text(66, ey + 23, e.date, 11, TEXT3));
    els.push(text(66, ey + 38, e.preview, 12, TEXT2));
    els.push(text(W - 32, ey + 30, '›', 18, TEXT3, { anchor: 'end' }));
  });

  bottomNav(els, 'journal');
  return els;
}

// ── SCREEN 6 — Profile / Settings ─────────────────────────────────────────────
function buildProfile() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  // Avatar area
  els.push(rect(0, 44, W, 180, CARD2, { rx: 0 }));
  els.push(circle(W / 2, 130, 50, SURF));
  els.push(text(W / 2, 142, '🌿', 36, ACC, { anchor: 'middle' }));
  els.push(text(W / 2, 200, 'Maya Chen', 20, TEXT, { fw: 700, anchor: 'middle' }));
  els.push(text(W / 2, 218, 'Member since March 2025', 11, TEXT3, { anchor: 'middle' }));

  // Badge row
  const badges = ['🌟 Streak Master', '💧 Hydrated', '🧘 Mindful'];
  badges.forEach((b, i) => {
    const bx = 20 + i * 118;
    els.push(...pill(bx, 230, 110, 26, SURF, b, TEXT2));
  });

  // Stats row
  els.push(rect(20, 272, W - 40, 72, SURF, { rx: 16 }));
  const pstats = [{ v: '38', l: 'Days' }, { v: '89%', l: 'Avg Score' }, { v: '6', l: 'Habits' }];
  pstats.forEach((s, i) => {
    const sx = 52 + i * 108;
    els.push(text(sx, 302, s.v, 24, ACC, { fw: 800, anchor: 'middle' }));
    els.push(text(sx, 320, s.l, 11, TEXT3, { anchor: 'middle' }));
    if (i < 2) els.push(line(sx + 54, 280, sx + 54, 336, DIVID, { sw: 1 }));
  });

  // Settings list
  els.push(text(20, 368, 'SETTINGS', 11, TEXT3, { fw: 700, ls: 1.2 }));
  const settings = [
    { icon: '🔔', label: 'Notifications', sub: '8 AM · 9 PM reminders' },
    { icon: '🎯', label: 'My Rituals',    sub: '8 habits active' },
    { icon: '🌙', label: 'Wind-down',     sub: 'Starts at 9:00 PM' },
    { icon: '📊', label: 'Weekly Report', sub: 'Every Sunday morning' },
    { icon: '🔒', label: 'Privacy',       sub: 'Data stays on device' },
  ];
  settings.forEach((s, i) => {
    const sy = 384 + i * 58;
    els.push(rect(20, sy, W - 40, 50, SURF, { rx: 14 }));
    els.push(text(38, sy + 30, s.icon, 20, TEXT));
    els.push(text(68, sy + 23, s.label, 14, TEXT, { fw: 600 }));
    els.push(text(68, sy + 39, s.sub, 11, TEXT3));
    els.push(text(W - 30, sy + 30, '›', 18, TEXT3, { anchor: 'end' }));
  });

  // Logout
  els.push(rect(20, 682, W - 40, 44, SURF, { rx: 14 }));
  els.push(text(W / 2, 709, 'Sign Out', 14, '#E57373', { fw: 600, anchor: 'middle' }));

  bottomNav(els, 'profile');
  return els;
}

// ── Build pen ────────────────────────────────────────────────────────────────

function buildSVG(elements) {
  const svgEls = elements.map(el => {
    if (el.type === 'rect') {
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" rx="${el.rx||0}" fill="${el.fill}" opacity="${el.opacity||1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
    }
    if (el.type === 'text') {
      return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${el.fontWeight||400}" font-family="${el.fontFamily||'Inter,sans-serif'}" text-anchor="${el.textAnchor||'start'}" letter-spacing="${el.letterSpacing||0}" opacity="${el.opacity||1}">${el.content}</text>`;
    }
    if (el.type === 'circle') {
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity||1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
    }
    if (el.type === 'line') {
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}" opacity="${el.opacity||1}"/>`;
    }
    return '';
  }).join('\n  ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n  ${svgEls}\n</svg>`;
}

const screens = [
  { name: 'Garden — Dashboard', buildFn: buildDashboard },
  { name: 'Today\'s Rituals',   buildFn: buildToday     },
  { name: 'Streaks',            buildFn: buildStreaks    },
  { name: 'Insights',          buildFn: buildInsights   },
  { name: 'Journal',           buildFn: buildJournal    },
  { name: 'Profile',           buildFn: buildProfile    },
];

const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    tagline: TAGLINE,
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'light',
    heartbeat: 415,
    slug: SLUG,
    palette: { BG, SURF, ACC, ACC2 },
    elements: 0,
  },
  screens: screens.map(s => {
    const elements = s.buildFn();
    return { name: s.name, svg: buildSVG(elements), elements };
  }),
};

const totalElements = pen.screens.reduce((sum, s) => sum + s.elements.length, 0);
pen.metadata.elements = totalElements;

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${pen.screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
