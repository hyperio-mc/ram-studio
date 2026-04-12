// WANE — AI Circadian Rhythm Companion
// Inspired by: land-book.com featured "Dawn: AI for Mental Health" (top slot Apr 1 2026)
//              + darkmodedesign.com neon-glow UI trend (Neon, Darkroom, Format sites)
// Dark theme: deep midnight indigo (#080B18) + violet glow (#7C5CFC) + teal neon (#00D4C8)
// New technique: ambient radial glow blobs as atmospheric depth layer (haven't done this before)

const fs = require('fs');
const path = require('path');

const W = 390, H = 844;

function makeId() { return Math.random().toString(36).slice(2, 10); }

function rect(x, y, w, h, fill, opts = {}) {
  return { id: makeId(), type: 'rect', x, y, width: w, height: h,
    fill, opacity: opts.opacity ?? 1, cornerRadius: opts.r ?? 0,
    stroke: opts.stroke ?? null, strokeWidth: opts.sw ?? 0, shadow: opts.shadow ?? null };
}
function text(x, y, content, opts = {}) {
  return { id: makeId(), type: 'text', x, y, content: String(content),
    fontSize: opts.size ?? 14, fontFamily: opts.font ?? 'Inter',
    fontWeight: opts.weight ?? '400', fill: opts.fill ?? '#E8E6FF',
    opacity: opts.opacity ?? 1, letterSpacing: opts.ls ?? 0,
    lineHeight: opts.lh ?? 1.3, align: opts.align ?? 'left', width: opts.w ?? 300 };
}
function circle(x, y, r, fill, opts = {}) {
  return { id: makeId(), type: 'ellipse', x: x - r, y: y - r,
    width: r * 2, height: r * 2, fill, opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? null, strokeWidth: opts.sw ?? 0, shadow: opts.shadow ?? null };
}
function line(x1, y1, x2, y2, stroke, sw = 1, opts = {}) {
  return { id: makeId(), type: 'line', x1, y1, x2, y2, stroke, strokeWidth: sw, opacity: opts.opacity ?? 1 };
}

// ── PALETTE — deep midnight navy + neon glow accent ──────────────────────────
const P = {
  bg:       '#080B18',
  surface:  '#0F1326',
  surface2: '#161B38',
  border:   '#1F2750',
  text:     '#E8E6FF',
  textDim:  '#7B7FA8',
  accent:   '#7C5CFC',   // violet — focus energy
  accent2:  '#00D4C8',   // teal neon — clarity
  accent3:  '#F5A653',   // amber — warmth/sleep
  glow:     'rgba(124,92,252,0.18)',
  glow2:    'rgba(0,212,200,0.12)',
  glowAmb:  'rgba(245,166,83,0.14)',
  success:  '#34D399',
  warning:  '#FBBF24',
};

function statusBar(els) {
  els.push(rect(0, 0, W, 44, P.bg));
  els.push(text(20, 14, '9:41', { size: 15, weight: '600', fill: P.text }));
  els.push(text(310, 16, '▲  ■  ●●●', { size: 9, fill: P.textDim, w: 70 }));
}

function navBar(els, active) {
  const navH = 80, y0 = H - navH;
  els.push(rect(0, y0, W, navH, P.surface, { stroke: P.border, sw: 0.5 }));
  const tabs = [
    { icon: '◎', label: 'Today',    id: 'today' },
    { icon: '◉', label: 'Focus',    id: 'focus' },
    { icon: '◍', label: 'Reflect',  id: 'reflect' },
    { icon: '◐', label: 'Sleep',    id: 'sleep' },
    { icon: '⊹', label: 'Insights', id: 'insights' },
  ];
  const tw = W / tabs.length;
  tabs.forEach((t, i) => {
    const cx = tw * i + tw / 2;
    const isActive = t.id === active;
    const col = isActive ? P.accent : P.textDim;
    if (isActive) els.push(rect(tw * i + 12, y0 + 6, tw - 24, 3, P.accent, { r: 2 }));
    els.push(text(cx - 8, y0 + 16, t.icon, { size: 18, weight: '300', fill: col, align: 'center', w: 16 }));
    els.push(text(cx - 25, y0 + 40, t.label, { size: 10, weight: isActive ? '600' : '400', fill: col, align: 'center', w: 50 }));
  });
}

// ── S1: TODAY DASHBOARD ───────────────────────────────────────────────────────
function screen1() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  // ambient glow blobs
  els.push(circle(60, 200, 130, P.glow, { opacity: 0.55 }));
  els.push(circle(340, 440, 100, P.glow2, { opacity: 0.45 }));

  statusBar(els);

  els.push(text(20, 58, 'Good evening', { size: 13, weight: '400', fill: P.textDim, ls: 0.5 }));
  els.push(text(20, 76, 'Anya.', { size: 34, weight: '700', fill: P.text }));

  // Mood pill
  els.push(rect(20, 120, 350, 44, P.surface2, { r: 22, stroke: P.border, sw: 1 }));
  els.push(text(40, 136, '✦', { size: 13, fill: P.accent }));
  els.push(text(58, 138, 'How are you feeling right now?', { size: 13, fill: P.textDim, w: 240 }));
  els.push(text(330, 137, '→', { size: 16, fill: P.accent }));

  // Focus score hero card
  els.push(rect(20, 176, 350, 148, P.surface, { r: 20, shadow: { blur: 30, color: 'rgba(124,92,252,0.18)', x: 0, y: 8 } }));
  els.push(circle(195, 242, 54, P.glow, { opacity: 0.7 }));
  els.push(circle(195, 242, 48, 'transparent', { stroke: P.border, sw: 3 }));
  els.push(circle(195, 242, 48, 'transparent', { stroke: P.accent, sw: 3 }));
  els.push(text(180, 228, '84', { size: 28, weight: '700', fill: P.text, align: 'center', w: 32 }));
  els.push(text(165, 258, 'Focus Score', { size: 9, fill: P.textDim, align: 'center', w: 62 }));
  // left
  els.push(text(32, 196, 'Today', { size: 11, weight: '600', fill: P.textDim, ls: 1 }));
  els.push(text(32, 214, 'Deep\nFocus', { size: 20, weight: '700', fill: P.text, lh: 1.15, w: 120 }));
  els.push(text(32, 270, '+6 pts from yesterday', { size: 11, fill: P.success, w: 130 }));
  // right stats
  els.push(text(272, 196, '2h 40m', { size: 15, weight: '700', fill: P.text }));
  els.push(text(272, 216, 'focused today', { size: 9, fill: P.textDim }));
  els.push(text(272, 240, '3', { size: 15, weight: '700', fill: P.accent2 }));
  els.push(text(272, 260, 'sessions done', { size: 9, fill: P.textDim }));
  els.push(text(272, 284, '94%', { size: 15, weight: '700', fill: P.accent3 }));
  els.push(text(272, 304, 'sleep quality', { size: 9, fill: P.textDim }));

  // Quick start
  els.push(text(20, 340, 'QUICK START', { size: 10, weight: '600', fill: P.textDim, ls: 1.5 }));
  const actions = [
    { label: 'Deep Work',  sub: '25 min', col: P.accent,  icon: '▷', g: P.glow },
    { label: 'Flow State', sub: '45 min', col: P.accent2, icon: '∿', g: P.glow2 },
    { label: 'Wind Down',  sub: '10 min', col: P.accent3, icon: '◑', g: P.glowAmb },
  ];
  actions.forEach((a, i) => {
    const x = 20 + i * 120;
    els.push(rect(x, 358, 112, 98, P.surface2, { r: 16, stroke: P.border, sw: 1 }));
    els.push(circle(x + 56, 388, 22, a.g, { opacity: 1 }));
    els.push(text(x + 47, 378, a.icon, { size: 18, fill: a.col }));
    els.push(text(x + 6, 414, a.label, { size: 11, weight: '600', fill: P.text, align: 'center', w: 100 }));
    els.push(text(x + 6, 430, a.sub, { size: 10, fill: P.textDim, align: 'center', w: 100 }));
  });

  // Streak / reflect row
  els.push(rect(20, 470, 168, 78, P.surface, { r: 16, stroke: P.border, sw: 1 }));
  els.push(text(34, 488, '🔥', { size: 15 }));
  els.push(text(54, 488, '12', { size: 20, weight: '700', fill: P.accent3 }));
  els.push(text(34, 512, 'day streak', { size: 11, fill: P.textDim }));
  els.push(text(34, 528, 'Personal best!', { size: 10, fill: P.accent3 }));

  els.push(rect(202, 470, 168, 78, P.surface, { r: 16, stroke: P.border, sw: 1 }));
  els.push(text(216, 488, '✎', { size: 16, fill: P.accent2 }));
  els.push(text(216, 510, 'Evening\nReflection', { size: 13, weight: '600', fill: P.text, lh: 1.2, w: 140 }));
  els.push(text(216, 540, 'Not logged yet', { size: 10, fill: P.textDim }));

  // Tonight's ritual
  els.push(text(20, 564, "TONIGHT'S RITUAL", { size: 10, weight: '600', fill: P.textDim, ls: 1.5 }));
  [
    { time: '9:30', label: 'Meditation' },
    { time: '10:00', label: 'Screens off' },
    { time: '10:30', label: 'Sleep mode' },
  ].forEach((r, i) => {
    const ry = 582 + i * 42;
    els.push(rect(20, ry, 350, 36, P.surface, { r: 10, stroke: P.border, sw: 0.5 }));
    els.push(circle(42, ry + 18, 7, 'transparent', { stroke: P.accent, sw: 1.5 }));
    els.push(text(56, ry + 10, r.label, { size: 13, fill: P.text, w: 230 }));
    els.push(text(310, ry + 10, r.time, { size: 11, fill: P.textDim, align: 'right', w: 48 }));
  });

  navBar(els, 'today');
  return els;
}

// ── S2: FOCUS SESSION ─────────────────────────────────────────────────────────
function screen2() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  els.push(circle(195, 350, 190, P.glow, { opacity: 0.45 }));
  els.push(circle(195, 350, 120, 'rgba(124,92,252,0.08)', { opacity: 1 }));

  statusBar(els);
  els.push(text(20, 58, '←', { size: 20, fill: P.textDim }));
  els.push(text(140, 63, 'Deep Work', { size: 14, weight: '600', fill: P.text, align: 'center', w: 110 }));
  els.push(text(125, 100, 'Session 2 of 3', { size: 11, fill: P.textDim, align: 'center', w: 140 }));

  // Mode pills
  ['Forest', 'Rain', 'Cosmos', 'Silence'].forEach((m, i) => {
    const px = 20 + i * 88;
    const active = i === 2;
    els.push(rect(px, 124, 80, 28, active ? P.accent : P.surface2, { r: 14, stroke: active ? 'transparent' : P.border, sw: 1 }));
    els.push(text(px + 4, 132, m, { size: 11, weight: active ? '600' : '400', fill: active ? '#fff' : P.textDim, align: 'center', w: 72 }));
  });

  // Timer ring
  const tY = 300;
  els.push(circle(195, tY, 118, 'transparent', { stroke: P.surface2, sw: 8 }));
  els.push(circle(195, tY, 118, 'transparent', { stroke: P.accent, sw: 8 }));
  els.push(circle(195 + 118, tY, 7, P.accent, { shadow: { blur: 14, color: P.accent, x: 0, y: 0 } }));
  els.push(circle(195, tY, 96, P.glow, { opacity: 0.6 }));
  els.push(text(148, tY - 24, '14:32', { size: 46, weight: '700', fill: P.text, align: 'center', w: 100 }));
  els.push(text(162, tY + 30, 'remaining', { size: 12, fill: P.textDim, align: 'center', w: 70 }));
  els.push(text(56, tY + 60, '✦  Q2 strategy deck — section 3', { size: 12, fill: P.textDim, align: 'center', w: 278 }));
  els.push(text(125, tY + 88, 'Breathe in… 4s', { size: 11, fill: P.accent, opacity: 0.8, align: 'center', w: 140 }));

  // Controls
  const cY = 480;
  els.push(circle(100, cY, 28, P.surface2, { stroke: P.border, sw: 1 }));
  els.push(text(89, cY - 9, '⏮', { size: 18, fill: P.textDim }));
  els.push(circle(195, cY, 44, P.accent, { shadow: { blur: 22, color: 'rgba(124,92,252,0.55)', x: 0, y: 0 } }));
  els.push(text(182, cY - 12, '⏸', { size: 24, fill: '#fff' }));
  els.push(circle(290, cY, 28, P.surface2, { stroke: P.border, sw: 1 }));
  els.push(text(280, cY - 9, '■', { size: 16, fill: P.textDim }));

  // Session stats
  els.push(rect(20, 552, 350, 66, P.surface, { r: 16, stroke: P.border, sw: 1 }));
  [
    { v: '2 done',  l: 'Sessions' },
    { v: '91',      l: 'Flow score', hi: true },
    { v: '0',       l: 'Distractions' },
    { v: '12d',     l: 'Streak' },
  ].forEach((s, i) => {
    const sx = 34 + i * 84;
    els.push(text(sx, 564, s.v, { size: 14, weight: '700', fill: s.hi ? P.accent : P.text, align: 'center', w: 66 }));
    els.push(text(sx, 586, s.l, { size: 9, fill: P.textDim, align: 'center', w: 66 }));
    if (i < 3) els.push(line(sx + 78, 558, sx + 78, 614, P.border, 1));
  });

  els.push(rect(20, 634, 350, 40, P.surface2, { r: 12, stroke: P.border, sw: 0.5 }));
  els.push(text(40, 650, '✎  Add a focus note…', { size: 13, fill: P.textDim }));

  navBar(els, 'focus');
  return els;
}

// ── S3: REFLECT ───────────────────────────────────────────────────────────────
function screen3() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  els.push(circle(195, 200, 150, P.glow2, { opacity: 0.3 }));

  statusBar(els);
  els.push(text(20, 58, '←', { size: 20, fill: P.textDim }));
  els.push(text(20, 98, 'Session\nReflection', { size: 28, weight: '700', fill: P.text, lh: 1.15, w: 280 }));
  els.push(text(20, 158, 'Deep Work  ·  45 min  ·  3:30 PM', { size: 12, fill: P.textDim }));

  // Mood
  els.push(text(20, 190, 'How did that feel?', { size: 13, weight: '600', fill: P.text }));
  els.push(rect(20, 212, 350, 54, P.surface, { r: 14, stroke: P.border, sw: 1 }));
  ['😞','😐','😊','😄','🤩'].forEach((m, i) => {
    const mx = 44 + i * 68;
    const active = i === 3;
    if (active) els.push(circle(mx, 239, 18, P.glow));
    els.push(text(mx - 10, active ? 226 : 229, m, { size: active ? 22 : 18 }));
  });

  // Energy slider
  els.push(text(20, 282, 'Energy level', { size: 13, weight: '600', fill: P.text }));
  els.push(rect(20, 304, 350, 10, P.surface2, { r: 5 }));
  els.push(rect(20, 304, 242, 10, P.accent, { r: 5 }));
  els.push(circle(262, 309, 10, P.accent, { stroke: '#fff', sw: 2, shadow: { blur: 8, color: 'rgba(124,92,252,0.6)', x:0,y:0 } }));
  els.push(text(20, 322, 'Low', { size: 10, fill: P.textDim }));
  els.push(text(340, 322, 'High', { size: 10, fill: P.textDim, align: 'right', w: 32 }));

  // Focus quality chips
  els.push(text(20, 350, 'Focus quality', { size: 13, weight: '600', fill: P.text }));
  ['Scattered','Moderate','Good','Deep flow'].forEach((q, i) => {
    const active = i === 3;
    els.push(rect(20 + i * 88, 370, 80, 30, active ? P.accent : P.surface2, { r: 10, stroke: active ? 'transparent' : P.border, sw: 1 }));
    els.push(text(24 + i * 88, 380, q, { size: 10, weight: active ? '600' : '400', fill: active ? '#fff' : P.textDim, align: 'center', w: 72 }));
  });

  // Notes area
  els.push(text(20, 420, 'Capture a thought', { size: 13, weight: '600', fill: P.text }));
  els.push(rect(20, 442, 350, 96, P.surface, { r: 14, stroke: P.border, sw: 1 }));
  els.push(text(34, 458, '"Finished the financial section faster than expected.\nThe Cosmos ambient really helped me lock in.\nNeed to prep section 4 for tomorrow."', { size: 12, fill: P.textDim, lh: 1.5, w: 320 }));
  els.push(rect(34, 528, 2, 14, P.accent, { r: 1 }));

  // AI insight
  els.push(rect(20, 552, 350, 62, 'rgba(124,92,252,0.08)', { r: 14, stroke: 'rgba(124,92,252,0.28)', sw: 1 }));
  els.push(text(34, 566, '✦  WANE insight', { size: 10, weight: '600', fill: P.accent, ls: 0.5 }));
  els.push(text(34, 582, 'Your best deep focus happens 3–5 PM on Wednesdays. Your next session is right in that window.', { size: 12, fill: P.textDim, lh: 1.4, w: 320 }));

  // CTA
  els.push(rect(20, 630, 350, 52, P.accent, { r: 26, shadow: { blur: 20, color: 'rgba(124,92,252,0.4)', x: 0, y: 4 } }));
  els.push(text(115, 650, 'Save reflection', { size: 15, weight: '600', fill: '#fff', align: 'center', w: 160 }));

  navBar(els, 'reflect');
  return els;
}

// ── S4: SLEEP RITUAL ──────────────────────────────────────────────────────────
function screen4() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  els.push(circle(195, 290, 160, P.glowAmb, { opacity: 0.48 }));
  els.push(circle(195, 290, 90, 'rgba(245,166,83,0.07)', { opacity: 1 }));

  statusBar(els);
  els.push(text(20, 58, 'Sleep Ritual', { size: 28, weight: '700', fill: P.text }));
  els.push(text(20, 94, 'Target: 10:30 PM  ·  8 hour window', { size: 12, fill: P.textDim }));

  // Readiness ring
  els.push(circle(195, 218, 70, P.glowAmb, { opacity: 0.5 }));
  els.push(circle(195, 218, 64, 'transparent', { stroke: P.surface2, sw: 8 }));
  els.push(circle(195, 218, 64, 'transparent', { stroke: P.accent3, sw: 8 }));
  els.push(text(169, 200, '78', { size: 32, weight: '700', fill: P.text, align: 'center', w: 54 }));
  els.push(text(162, 234, 'Readiness', { size: 10, fill: P.textDim, align: 'center', w: 68 }));
  els.push(text(152, 254, 'Good sleep likely', { size: 11, fill: P.accent3, align: 'center', w: 88 }));

  // Checklist
  els.push(text(20, 302, 'WIND-DOWN CHECKLIST', { size: 10, weight: '600', fill: P.textDim, ls: 1.5 }));
  [
    { icon: '🧘', label: 'Body scan meditation',   sub: '8 min',  done: true  },
    { icon: '📵', label: 'Screens off',             sub: 'Done',   done: true  },
    { icon: '📔', label: 'Gratitude journal',       sub: '5 min',  done: false },
    { icon: '🌡️', label: 'Room temp: 66°F',        sub: 'Adjust', done: false },
    { icon: '🎵', label: 'Sleep sounds: Rainfall',  sub: '→ Start',done: false },
  ].forEach((s, i) => {
    const sy = 322 + i * 52;
    els.push(rect(20, sy, 350, 44, s.done ? 'rgba(124,92,252,0.07)' : P.surface, { r: 13, stroke: s.done ? 'rgba(124,92,252,0.18)' : P.border, sw: 1 }));
    els.push(circle(44, sy + 22, 9, s.done ? P.accent : 'transparent', { stroke: s.done ? P.accent : P.border, sw: 1.5 }));
    if (s.done) els.push(text(39, sy + 15, '✓', { size: 11, fill: '#fff', weight: '600' }));
    els.push(text(62, sy + 10, s.icon, { size: 13 }));
    els.push(text(82, sy + 10, s.label, { size: 13, weight: '500', fill: s.done ? P.textDim : P.text, w: 210 }));
    els.push(text(316, sy + 10, s.sub, { size: 11, fill: s.done ? P.textDim : P.accent3, align: 'right', w: 48 }));
  });

  // Countdown
  els.push(rect(20, 594, 350, 54, 'rgba(245,166,83,0.09)', { r: 14, stroke: 'rgba(245,166,83,0.28)', sw: 1 }));
  els.push(text(38, 610, '◑', { size: 15, fill: P.accent3 }));
  els.push(text(60, 610, 'Sleep in  1h 22min', { size: 14, weight: '600', fill: P.text }));
  els.push(text(60, 630, 'On track for your 8-hour goal', { size: 11, fill: P.textDim }));

  // CTA
  els.push(rect(20, 662, 350, 52, P.accent3, { r: 26, shadow: { blur: 16, color: 'rgba(245,166,83,0.35)', x: 0, y: 4 } }));
  els.push(text(116, 681, 'Begin wind-down', { size: 15, weight: '600', fill: '#1A0D00', align: 'center', w: 158 }));

  navBar(els, 'sleep');
  return els;
}

// ── S5: INSIGHTS ──────────────────────────────────────────────────────────────
function screen5() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  els.push(circle(320, 120, 80, P.glow, { opacity: 0.2 }));
  els.push(circle(80, 520, 70, P.glow2, { opacity: 0.18 }));

  statusBar(els);
  els.push(text(20, 58, 'Insights', { size: 28, weight: '700', fill: P.text }));

  // Period tabs
  ['Week','Month','Year'].forEach((t, i) => {
    const active = i === 0;
    els.push(rect(20 + i * 90, 96, 82, 28, active ? P.accent : P.surface2, { r: 14, stroke: active ? 'transparent' : P.border, sw: 1 }));
    els.push(text(24 + i * 90, 105, t, { size: 12, weight: active ? '600' : '400', fill: active ? '#fff' : P.textDim, align: 'center', w: 74 }));
  });

  // Bar chart — focus hours
  els.push(text(20, 142, 'DAILY FOCUS HOURS', { size: 10, weight: '600', fill: P.textDim, ls: 1.5 }));
  const days = ['M','T','W','T','F','S','S'];
  const vals = [2.5, 3.1, 4.2, 2.8, 3.6, 1.2, 0.8];
  const maxV = 5, barH = 96, barW = 34, barY0 = 262;
  days.forEach((d, i) => {
    const bx = 24 + i * 50;
    const h = (vals[i] / maxV) * barH;
    const isToday = i === 4;
    els.push(rect(bx, barY0 - barH, barW, barH, P.surface2, { r: 6 }));
    els.push(rect(bx, barY0 - h, barW, h, isToday ? P.accent : 'rgba(124,92,252,0.45)', { r: 6 }));
    if (isToday) els.push(rect(bx, barY0 - h, barW, h, P.glow, { r: 6 }));
    els.push(text(bx + 2, barY0 - h - 18, vals[i] + 'h', { size: 9, fill: isToday ? P.accent : P.textDim, align: 'center', w: barW }));
    els.push(text(bx + 4, barY0 + 8, d, { size: 11, fill: isToday ? P.text : P.textDim, weight: isToday ? '600' : '400', align: 'center', w: barW - 4 }));
  });

  // 2x2 metric grid
  [
    { label: 'Avg focus/day', val: '2h 51m', sub: '+18% vs last week', col: P.accent },
    { label: 'Sleep quality',  val: '81',    sub: 'avg score',         col: P.accent3 },
    { label: 'Peak window',    val: '3–5 PM',sub: 'best focus time',   col: P.accent2 },
    { label: 'Streak',         val: '12 days',sub: 'personal best 🎉', col: P.success },
  ].forEach((m, i) => {
    const mx = 20 + (i % 2) * 180;
    const my = 290 + Math.floor(i / 2) * 86;
    els.push(rect(mx, my, 170, 74, P.surface, { r: 14, stroke: P.border, sw: 1 }));
    els.push(text(mx + 14, my + 12, m.val, { size: 20, weight: '700', fill: m.col }));
    els.push(text(mx + 14, my + 36, m.label, { size: 10, fill: P.textDim, w: 138 }));
    els.push(text(mx + 14, my + 52, m.sub, { size: 10, fill: P.textDim, w: 138, opacity: 0.6 }));
  });

  // AI summary
  const aiY = 474;
  els.push(rect(20, aiY, 350, 80, 'rgba(124,92,252,0.08)', { r: 16, stroke: 'rgba(124,92,252,0.24)', sw: 1 }));
  els.push(text(34, aiY + 14, '✦  WANE weekly pattern', { size: 10, weight: '600', fill: P.accent, ls: 0.5 }));
  els.push(text(34, aiY + 30, 'You focus 40% better after your wind-down ritual.\nWednesday is your peak performance day — protect it.\nSleep readiness climbs when screens off by 10 PM.', { size: 11, fill: P.textDim, lh: 1.5, w: 318 }));

  // Mood line
  els.push(text(20, aiY + 96, 'MOOD ACROSS THE WEEK', { size: 10, weight: '600', fill: P.textDim, ls: 1.5 }));
  const moodY = aiY + 116;
  els.push(rect(20, moodY, 350, 58, P.surface, { r: 14, stroke: P.border, sw: 1 }));
  [3,4,5,3,5,2,4].forEach((v, i) => {
    const dx = 40 + i * 46, dy = moodY + 48 - (v / 5) * 38;
    els.push(circle(dx, dy, 4, P.accent2, { opacity: 0.9 }));
    if (i > 0) {
      const px = 40 + (i-1) * 46, py = moodY + 48 - ([3,4,5,3,5,2,4][i-1] / 5) * 38;
      els.push(line(px, py, dx, dy, 'rgba(0,212,200,0.4)', 1.5));
    }
  });

  navBar(els, 'insights');
  return els;
}

// ── S6: MOOD CHECK-IN MODAL ───────────────────────────────────────────────────
function screen6() {
  const els = [];
  els.push(rect(0, 0, W, H, P.bg));
  els.push(circle(195, 340, 180, P.glow, { opacity: 0.22 }));
  statusBar(els);
  // Scrim
  els.push(rect(0, 44, W, H - 44, 'rgba(8,11,24,0.68)'));
  // Bottom sheet
  els.push(rect(0, 270, W, H - 270, P.surface, { r: 28 }));
  els.push(rect(165, 288, 60, 4, P.border, { r: 2 }));

  els.push(text(24, 308, 'How are you\nfeeling right now?', { size: 26, weight: '700', fill: P.text, lh: 1.2, w: 320 }));
  els.push(text(24, 370, 'Helps WANE personalize your session\nand track patterns over time.', { size: 13, fill: P.textDim, lh: 1.5, w: 318 }));

  const moods = [
    { em: '😴', label: 'Exhausted' }, { em: '😞', label: 'Low' },
    { em: '😐', label: 'Neutral'  }, { em: '😊', label: 'Good' },
    { em: '🔥', label: 'Energized'}, { em: '🌊', label: 'In flow' },
  ];
  moods.forEach((m, i) => {
    const mx = 24 + (i % 3) * 116;
    const my = 428 + Math.floor(i / 2) * 88;
    const active = i === 3;
    els.push(rect(mx, my, 108, 74, active ? P.glow : P.surface2, { r: 16, stroke: active ? 'rgba(124,92,252,0.5)' : P.border, sw: active ? 1.5 : 1 }));
    els.push(text(mx + 34, my + 12, m.em, { size: 24 }));
    els.push(text(mx + 4, my + 50, m.label, { size: 11, fill: active ? P.accent : P.textDim, align: 'center', w: 100 }));
  });

  els.push(rect(24, 618, 342, 52, P.accent, { r: 26, shadow: { blur: 18, color: 'rgba(124,92,252,0.4)', x: 0, y: 4 } }));
  els.push(text(115, 637, 'Log & continue', { size: 15, weight: '600', fill: '#fff', align: 'center', w: 160 }));
  els.push(text(140, 690, 'Skip for now', { size: 13, fill: P.textDim, align: 'center', w: 110 }));

  navBar(els, 'today');
  return els;
}

// ── BUILD PEN ─────────────────────────────────────────────────────────────────
const screens = [
  { id: makeId(), name: 'Today — Dashboard',    elements: screen1() },
  { id: makeId(), name: 'Focus Session',         elements: screen2() },
  { id: makeId(), name: 'Session Reflection',   elements: screen3() },
  { id: makeId(), name: 'Sleep Ritual',          elements: screen4() },
  { id: makeId(), name: 'Insights',              elements: screen5() },
  { id: makeId(), name: 'Mood Check-in Modal',  elements: screen6() },
];

const pen = {
  version: '2.8',
  name: 'WANE — AI Circadian Rhythm Companion',
  description: 'Dark-mode AI wellness companion covering focus sessions, nightly rituals, mood check-ins, and sleep readiness. Inspired by darkmodedesign.com neon-glow trend + land-book "Dawn: AI for Mental Health" Apr 2026.',
  canvas: { width: W, height: H, background: P.bg },
  screens,
  createdAt: new Date().toISOString(),
  author: 'RAM Design Heartbeat',
};

const outPath = path.join(__dirname, 'wane.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
const totalEls = screens.reduce((a, s) => a + s.elements.length, 0);
console.log(`✓ wane.pen written — ${screens.length} screens, ${totalEls} elements`);
