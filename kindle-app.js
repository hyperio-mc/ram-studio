/**
 * KINDLE — Emotional Performance OS
 * Dark cinematic amber+charcoal theme
 * Inspired by: "Superpower" health app (Godly.website) — cinematic warm amber
 *              + "Dawn" mental health AI (Lapa.ninja) — emotional gradient storytelling
 * Challenge: Push past cold "tech health" blue into warm, editorial,
 *   human-feeling dark warmth — like a luxury journal crossed with a biometric dashboard.
 */

const fs = require('fs');

const W = 390;
const H = 844;

const P = {
  bg:        '#0C0A07',
  surface:   '#161210',
  surface2:  '#1D1814',
  border:    '#2A231C',
  text:      '#F0E8D5',
  textMid:   '#A89880',
  textDim:   '#5E4E3E',
  amber:     '#D4943A',
  amberHi:   '#E8A84A',
  violet:    '#7A5BBF',
  violetHi:  '#9B7EDB',
  green:     '#4A9E6A',
  red:       '#BF5545',
};

function el(type, x, y, w, h, props = {}) {
  return { type, x, y, width: w, height: h,
    fill: 'transparent', stroke: 'transparent', strokeWidth: 0, radius: 0, opacity: 1,
    ...props };
}
function tx(text, x, y, w, h, props = {}) {
  return { type: 'text', x, y, width: w, height: h, text,
    fontSize: 14, fontWeight: '400', fontFamily: 'Inter',
    color: P.text, align: 'left', opacity: 1, lineHeight: 1.4, letterSpacing: 0,
    ...props };
}

function statusBar(yOff = 0) {
  return [
    el('rect', 0, yOff, W, 44, { fill: 'transparent' }),
    tx('9:41', 20, yOff + 14, 50, 16, { fontSize: 13, fontWeight: '600', color: P.text }),
    el('rect', W - 68, yOff + 16, 20, 10, { fill: 'transparent', stroke: P.textMid, strokeWidth: 1, radius: 2 }),
    el('rect', W - 67, yOff + 17, 14, 8, { fill: P.textMid, radius: 1 }),
    el('rect', W - 46, yOff + 14, 12, 14, { fill: P.textMid, radius: 2, opacity: 0.5 }),
    el('rect', W - 32, yOff + 13, 12, 16, { fill: P.textMid, radius: 2, opacity: 0.7 }),
    el('rect', W - 18, yOff + 13, 12, 16, { fill: P.textMid, radius: 2 }),
  ];
}

function nav(active = 0) {
  const y = 782;
  const items = [
    { icon: '⊙', lbl: 'Today' },
    { icon: '◎', lbl: 'Log' },
    { icon: '◉', lbl: 'Focus' },
    { icon: '◈', lbl: 'Trends' },
    { icon: '◔', lbl: 'Me' },
  ];
  const out = [
    el('rect', 0, y, W, 62, { fill: P.surface, stroke: P.border, strokeWidth: 1 }),
    el('rect', 0, y, W, 1, { fill: P.border }),
  ];
  items.forEach((it, i) => {
    const cx = 39 + i * 78;
    const isA = i === active;
    out.push(
      tx(it.icon, cx - 14, y + 8, 28, 24, { fontSize: 20, align: 'center', color: isA ? P.amber : P.textDim }),
      tx(it.lbl, cx - 22, y + 32, 44, 14, { fontSize: 10, align: 'center', color: isA ? P.amber : P.textDim, letterSpacing: 0.3 }),
    );
    if (isA) out.push(el('rect', cx - 12, y + 2, 24, 2, { fill: P.amber, radius: 1 }));
  });
  return out;
}

// ── S1: TODAY ─────────────────────────────────────────────────────────────────
function s1() {
  const e = [
    el('rect', 0, 0, W, H, { fill: P.bg }),
    ...statusBar(),
  ];

  // subtle amber gradient orb top-right
  e.push(el('ellipse', W - 60, 40, 120, 80, { fill: 'rgba(212,148,58,0.07)', radius: 60 }));

  // GREETING
  e.push(
    tx('KINDLE', 24, 54, 100, 16, { fontSize: 10, fontWeight: '700', color: P.amber, letterSpacing: 3 }),
    tx('Evening,', 24, 76, 240, 28, { fontSize: 22, fontWeight: '300', color: P.textMid }),
    tx('Alex.', 24, 100, 260, 42, { fontSize: 40, fontWeight: '800', color: P.text, letterSpacing: -1.5 }),
  );

  // EMOTIONAL STATE — hero card
  e.push(
    el('rect', 20, 158, W - 40, 118, { fill: P.surface2, radius: 20, stroke: P.border, strokeWidth: 1 }),
    el('ellipse', 24, 158, 70, 44, { fill: 'rgba(212,148,58,0.1)' }),
    tx('CURRENT STATE', 36, 172, 160, 12, { fontSize: 9, fontWeight: '700', color: P.textDim, letterSpacing: 2 }),
    tx('Focused', 36, 188, 190, 36, { fontSize: 30, fontWeight: '800', color: P.text, letterSpacing: -0.8 }),
    tx('& Energized', 36, 222, 220, 24, { fontSize: 18, fontWeight: '300', color: P.amber }),
    // state orb
    el('ellipse', W - 88, 180, 52, 52, { fill: 'rgba(212,148,58,0.12)', stroke: P.amber, strokeWidth: 1.5 }),
    tx('⚡', W - 74, 195, 24, 24, { fontSize: 18, align: 'center', color: P.amber }),
    // confidence bar
    el('rect', 36, 252, 200, 4, { fill: P.border, radius: 2 }),
    el('rect', 36, 252, 140, 4, { fill: P.amber, radius: 2 }),
    tx('70%', 178, 258, 40, 12, { fontSize: 10, color: P.amber }),
  );

  // VITALS ROW
  const vitals = [
    { lbl: 'HRV', val: '68', unit: 'ms', col: P.green },
    { lbl: 'SLEEP', val: '7.4', unit: 'h', col: P.violetHi },
    { lbl: 'FOCUS', val: '84', unit: '%', col: P.amber },
  ];
  vitals.forEach((v, i) => {
    const vx = 20 + i * 118;
    e.push(
      el('rect', vx, 292, 108, 80, { fill: P.surface, radius: 14, stroke: P.border, strokeWidth: 1 }),
      tx(v.lbl, vx + 12, 306, 84, 12, { fontSize: 9, fontWeight: '700', color: P.textDim, letterSpacing: 2 }),
      tx(v.val, vx + 12, 322, 60, 28, { fontSize: 24, fontWeight: '800', color: v.col }),
      tx(v.unit, vx + 12 + (v.val.length * 14), 334, 24, 14, { fontSize: 11, color: P.textDim }),
    );
  });

  // RHYTHM BAR CHART
  e.push(
    tx('Daily Rhythm', 24, 390, 180, 18, { fontSize: 15, fontWeight: '600', color: P.text }),
    el('rect', 20, 414, W - 40, 90, { fill: P.surface, radius: 14, stroke: P.border, strokeWidth: 1 }),
  );
  const bars = [0.25, 0.65, 0.9, 0.82, 0.55, 0.38, 0.2, 0.15];
  bars.forEach((v, i) => {
    const bw = Math.floor((W - 60) / 8);
    const bx = 30 + i * bw;
    const bh = Math.floor(v * 54);
    const by = 414 + 72 - bh;
    e.push(
      el('rect', bx, by, bw - 4, bh, {
        fill: i === 4 ? P.amber : `rgba(212,148,58,${0.12 + v * 0.22})`,
        radius: 3,
      }),
    );
  });
  ['6A', '9', '12', '3P', '6', '9P'].forEach((h, i) => {
    e.push(tx(h, 30 + i * Math.floor((W - 60) / 6), 488, 28, 12, { fontSize: 9, color: P.textDim }));
  });

  // INTENTIONS
  e.push(tx('Intentions', 24, 524, 150, 18, { fontSize: 15, fontWeight: '600', color: P.text }));
  e.push(tx('3 of 5', W - 56, 526, 36, 14, { fontSize: 12, color: P.textMid }));

  const intentions = [
    { text: '20 min deep work block', done: true },
    { text: 'Evening reflection', done: true },
    { text: 'No screens after 10pm', done: false },
  ];
  intentions.forEach((it, i) => {
    const iy = 550 + i * 44;
    e.push(
      el('rect', 20, iy, W - 40, 36, {
        fill: it.done ? 'rgba(74,158,106,0.07)' : P.surface,
        radius: 10,
        stroke: it.done ? 'rgba(74,158,106,0.18)' : P.border,
        strokeWidth: 1,
      }),
      el('ellipse', 40, iy + 11, 14, 14, { fill: it.done ? P.green : 'transparent', stroke: it.done ? P.green : P.textDim, strokeWidth: 1.5 }),
      tx(it.done ? '✓' : '', 35, iy + 11, 14, 14, { fontSize: 9, align: 'center', color: P.bg, fontWeight: '800' }),
      tx(it.text, 64, iy + 10, W - 100, 16, { fontSize: 13, color: it.done ? P.textMid : P.text, opacity: it.done ? 0.7 : 1 }),
    );
  });

  // ADD BUTTON
  e.push(
    el('rect', 20, 688, W - 40, 50, { fill: P.amber, radius: 14 }),
    tx('+ Log How You Feel', 0, 704, W, 18, { fontSize: 14, fontWeight: '700', color: '#0C0A07', align: 'center', letterSpacing: 0.3 }),
  );

  e.push(...nav(0));
  return { id: 's1', name: 'Today', width: W, height: H, background: P.bg, elements: e };
}

// ── S2: MOOD LOG ──────────────────────────────────────────────────────────────
function s2() {
  const e = [el('rect', 0, 0, W, H, { fill: P.bg }), ...statusBar()];

  e.push(
    tx('Mood Log', 24, 58, 220, 28, { fontSize: 24, fontWeight: '800', color: P.text, letterSpacing: -0.5 }),
    tx('How are you, really?', 24, 90, W - 48, 18, { fontSize: 14, color: P.textMid, fontWeight: '300' }),
  );

  // EMOTION GRID
  e.push(
    el('rect', 20, 118, W - 40, 188, { fill: P.surface, radius: 18, stroke: P.border, strokeWidth: 1 }),
    tx('SELECT YOUR STATE', 36, 134, 200, 12, { fontSize: 9, fontWeight: '700', color: P.textDim, letterSpacing: 2 }),
  );

  const emotions = [
    { lbl: 'Joyful',   clr: '#D4943A', ic: '✦', r: 0, c: 0 },
    { lbl: 'Calm',     clr: '#4A9E6A', ic: '◎', r: 0, c: 1 },
    { lbl: 'Focused',  clr: '#7A5BBF', ic: '◉', r: 0, c: 2 },
    { lbl: 'Anxious',  clr: '#C8883A', ic: '◈', r: 0, c: 3 },
    { lbl: 'Grateful', clr: '#E8A84A', ic: '◇', r: 1, c: 0 },
    { lbl: 'Tired',    clr: '#5E7A8A', ic: '◔', r: 1, c: 1 },
    { lbl: 'Creative', clr: '#9B7EDB', ic: '◑', r: 1, c: 2 },
    { lbl: 'Sad',      clr: '#5C6A88', ic: '○', r: 1, c: 3 },
  ];

  emotions.forEach((em) => {
    const ex = 30 + em.c * 82;
    const ey = 158 + em.r * 64;
    const isA = em.lbl === 'Focused';
    e.push(
      el('rect', ex, ey, 72, 52, {
        fill: isA ? `${em.clr}20` : 'rgba(255,255,255,0.02)',
        radius: 12,
        stroke: isA ? em.clr : P.border,
        strokeWidth: isA ? 1.5 : 1,
      }),
      tx(em.ic, ex + 8, ey + 7, 22, 22, { fontSize: 17, color: em.clr }),
      tx(em.lbl, ex + 8, ey + 30, 56, 14, { fontSize: 10, color: isA ? em.clr : P.textMid, fontWeight: isA ? '700' : '400' }),
    );
  });

  // INTENSITY SLIDER
  e.push(
    tx('Intensity', 24, 322, 100, 18, { fontSize: 14, fontWeight: '600', color: P.text }),
    tx('7/10', W - 56, 324, 32, 14, { fontSize: 13, color: P.amber, fontWeight: '700' }),
    el('rect', 24, 348, W - 48, 6, { fill: P.border, radius: 3 }),
    el('rect', 24, 348, Math.floor((W - 48) * 0.7), 6, { fill: P.amber, radius: 3 }),
    el('ellipse', 24 + Math.floor((W - 48) * 0.7) - 10, 342, 20, 20, { fill: P.bg, stroke: P.amber, strokeWidth: 2 }),
  );

  // CONTEXT TAGS
  e.push(tx('Context', 24, 382, 100, 18, { fontSize: 14, fontWeight: '600', color: P.text }));
  const tags = ['Work', 'Post-exercise', 'Social', 'Morning', 'Rest'];
  const active = ['Work', 'Post-exercise'];
  let tx2 = 24; let ty2 = 408;
  tags.forEach((t) => {
    const tw = t.length * 7.8 + 22;
    if (tx2 + tw > W - 24) { tx2 = 24; ty2 += 38; }
    const isA = active.includes(t);
    e.push(
      el('rect', tx2, ty2, tw, 28, { fill: isA ? 'rgba(212,148,58,0.14)' : P.surface, radius: 14, stroke: isA ? P.amber : P.border, strokeWidth: 1 }),
      tx(t, tx2 + 11, ty2 + 7, tw - 22, 14, { fontSize: 12, color: isA ? P.amber : P.textMid }),
    );
    tx2 += tw + 8;
  });

  // NOTE AREA
  const noteY = ty2 + 48;
  e.push(
    el('rect', 20, noteY, W - 40, 74, { fill: P.surface, radius: 14, stroke: P.amber, strokeWidth: 1 }),
    tx('Add a note about this moment...', 36, noteY + 14, W - 80, 46, { fontSize: 13, color: P.textDim, fontWeight: '300', lineHeight: 1.5 }),
    el('rect', 36, noteY + 14, 2, 16, { fill: P.amber }),
  );

  // LOG BUTTON
  const btnY = noteY + 88;
  e.push(
    el('rect', 20, btnY, W - 40, 50, { fill: P.amber, radius: 14 }),
    tx('Log This Moment', 0, btnY + 16, W, 18, { fontSize: 15, fontWeight: '700', color: '#0C0A07', align: 'center', letterSpacing: 0.5 }),
  );

  e.push(...nav(1));
  return { id: 's2', name: 'Mood Log', width: W, height: H, background: P.bg, elements: e };
}

// ── S3: FOCUS SESSION ─────────────────────────────────────────────────────────
function s3() {
  const e = [el('rect', 0, 0, W, H, { fill: P.bg }), ...statusBar()];

  e.push(
    tx('Focus', 24, 58, 150, 28, { fontSize: 24, fontWeight: '800', color: P.text, letterSpacing: -0.5 }),
    tx('Deep Work Mode', 24, 90, W - 48, 18, { fontSize: 14, color: P.textMid, fontWeight: '300' }),
  );

  const cx = W / 2;
  const cy = 320;
  const r = 108;

  // GLOW RINGS
  e.push(
    el('ellipse', cx - 132, cy - 132, 264, 264, { fill: 'rgba(212,148,58,0.04)', stroke: 'rgba(212,148,58,0.07)', strokeWidth: 1 }),
    el('ellipse', cx - 120, cy - 120, 240, 240, { fill: 'rgba(212,148,58,0.05)', stroke: 'rgba(212,148,58,0.1)', strokeWidth: 1 }),
    el('ellipse', cx - r, cy - r, r * 2, r * 2, { fill: P.surface, stroke: P.amber, strokeWidth: 2 }),
  );

  // TIMER
  e.push(
    tx('23:17', cx - 58, cy - 30, 116, 60, { fontSize: 50, fontWeight: '200', color: P.text, align: 'center', letterSpacing: 3 }),
    tx('remaining', cx - 50, cy + 34, 100, 16, { fontSize: 11, color: P.textDim, align: 'center', letterSpacing: 2 }),
  );

  // SESSION MODES
  const modes = [
    { lbl: '25 min', sub: 'Pomodoro', a: false },
    { lbl: 'Deep', sub: '90 min', a: true },
    { lbl: 'Flow', sub: 'Open', a: false },
  ];
  modes.forEach((m, i) => {
    const mx = 20 + i * 118;
    e.push(
      el('rect', mx, 464, 108, 54, { fill: m.a ? 'rgba(212,148,58,0.14)' : P.surface, radius: 14, stroke: m.a ? P.amber : P.border, strokeWidth: m.a ? 1.5 : 1 }),
      tx(m.lbl, mx + 12, 478, 84, 18, { fontSize: 15, fontWeight: m.a ? '800' : '500', color: m.a ? P.amber : P.text }),
      tx(m.sub, mx + 12, 496, 84, 14, { fontSize: 11, color: P.textDim }),
    );
  });

  // AMBIENT SOUND
  e.push(
    tx('Ambient', 24, 534, 120, 18, { fontSize: 14, fontWeight: '600', color: P.text }),
    tx('On ●', W - 54, 536, 34, 14, { fontSize: 12, color: P.green }),
  );
  const sounds = [
    { ic: '♪', lbl: 'Forest', a: true },
    { ic: '♬', lbl: 'Rain', a: false },
    { ic: '∿', lbl: 'Ocean', a: false },
    { ic: '·', lbl: 'White', a: false },
  ];
  sounds.forEach((s, i) => {
    const sx = 20 + i * 87;
    e.push(
      el('rect', sx, 558, 78, 52, { fill: s.a ? 'rgba(74,158,106,0.1)' : P.surface, radius: 12, stroke: s.a ? P.green : P.border, strokeWidth: 1 }),
      tx(s.ic, sx + 8, 570, 62, 22, { fontSize: 18, color: s.a ? P.green : P.textDim, align: 'center' }),
      tx(s.lbl, sx + 8, 594, 62, 14, { fontSize: 10, color: s.a ? P.green : P.textDim, align: 'center' }),
    );
  });

  // CONTROLS
  e.push(
    el('ellipse', cx - 76, 658, 50, 50, { fill: P.surface, stroke: P.border, strokeWidth: 1 }),
    tx('⟨⟨', cx - 76 + 7, 672, 36, 22, { fontSize: 16, color: P.textMid, align: 'center' }),

    el('ellipse', cx - 34, 646, 68, 68, { fill: P.amber }),
    tx('■', cx - 34 + 10, 668, 48, 22, { fontSize: 20, color: '#0C0A07', align: 'center', fontWeight: '700' }),

    el('ellipse', cx + 26, 658, 50, 50, { fill: P.surface, stroke: P.border, strokeWidth: 1 }),
    tx('⟩⟩', cx + 26 + 7, 672, 36, 22, { fontSize: 16, color: P.textMid, align: 'center' }),
  );

  e.push(tx('End Session', 0, 744, W, 16, { fontSize: 12, color: P.textDim, align: 'center', letterSpacing: 0.5 }));

  e.push(...nav(2));
  return { id: 's3', name: 'Focus', width: W, height: H, background: P.bg, elements: e };
}

// ── S4: TRENDS / INSIGHTS ─────────────────────────────────────────────────────
function s4() {
  const e = [el('rect', 0, 0, W, H, { fill: P.bg }), ...statusBar()];

  e.push(
    tx('Trends', 24, 58, 180, 28, { fontSize: 24, fontWeight: '800', color: P.text, letterSpacing: -0.5 }),
    tx('Last 7 days', 24, 90, 120, 18, { fontSize: 14, color: P.textMid, fontWeight: '300' }),
    el('rect', W - 96, 86, 76, 26, { fill: P.surface, radius: 13, stroke: P.border, strokeWidth: 1 }),
    tx('Week ∨', W - 86, 94, 56, 14, { fontSize: 12, color: P.text }),
  );

  // MOOD CHART
  e.push(
    tx('Mood Trend', 24, 126, 150, 18, { fontSize: 14, fontWeight: '600', color: P.text }),
    el('rect', 20, 150, W - 40, 110, { fill: P.surface, radius: 16, stroke: P.border, strokeWidth: 1 }),
  );
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const moods = [5, 4, 8, 7, 9, 6, 8];
  days.forEach((d, i) => {
    const bx = 34 + i * 46;
    const bh = moods[i] * 7;
    const by = 244 - bh;
    const isT = i === 6;
    e.push(
      el('rect', bx, by, 32, bh, { fill: isT ? P.amber : `rgba(212,148,58,${0.12 + moods[i] * 0.05})`, radius: 4 }),
      tx(d, bx + 4, 248, 24, 12, { fontSize: 9, color: isT ? P.amber : P.textDim, letterSpacing: 0.3 }),
      tx(moods[i].toString(), bx + 8, by - 16, 16, 14, { fontSize: 9, color: isT ? P.amber : P.textMid, fontWeight: isT ? '700' : '400' }),
    );
  });

  // CORRELATIONS
  e.push(tx('What drives your state', 24, 278, W - 48, 20, { fontSize: 14, fontWeight: '600', color: P.text }));
  const cors = [
    { fac: 'Deep work sessions', imp: '+2.1', up: true, pct: 84 },
    { fac: 'Sleep quality',      imp: '+1.8', up: true, pct: 72 },
    { fac: 'Screen time >3hrs',  imp: '-1.4', up: false, pct: 56 },
    { fac: 'Exercise',           imp: '+1.2', up: true, pct: 48 },
  ];
  cors.forEach((c, i) => {
    const cy = 304 + i * 56;
    e.push(
      el('rect', 20, cy, W - 40, 46, { fill: P.surface, radius: 12, stroke: P.border, strokeWidth: 1 }),
      tx(c.up ? '↑' : '↓', 34, cy + 11, 18, 24, { fontSize: 15, color: c.up ? P.green : P.red, fontWeight: '800' }),
      tx(c.fac, 58, cy + 13, W - 130, 16, { fontSize: 13, color: P.text }),
      el('rect', 58, cy + 32, W - 130, 4, { fill: P.border, radius: 2 }),
      el('rect', 58, cy + 32, Math.floor((W - 130) * c.pct / 100), 4, { fill: c.up ? 'rgba(74,158,106,0.55)' : 'rgba(191,85,69,0.55)', radius: 2 }),
      tx(c.imp, W - 62, cy + 13, 42, 16, { fontSize: 14, fontWeight: '700', color: c.up ? P.green : P.red, align: 'right' }),
    );
  });

  // AI PATTERN CARD
  e.push(
    el('rect', 20, 536, W - 40, 88, { fill: 'rgba(122,91,191,0.1)', radius: 16, stroke: 'rgba(122,91,191,0.22)', strokeWidth: 1 }),
    el('ellipse', 40, 556, 26, 26, { fill: 'rgba(122,91,191,0.2)' }),
    tx('◉', 36, 558, 28, 22, { fontSize: 16, color: P.violetHi, align: 'center' }),
    tx('AI PATTERN', 76, 546, 160, 12, { fontSize: 9, fontWeight: '700', color: P.violetHi, letterSpacing: 2 }),
    tx('You score 31% higher on days\nwith a morning focus block before 9am.', 76, 562, W - 114, 40, { fontSize: 13, color: P.text, lineHeight: 1.5 }),
    tx('Try it tomorrow →', 76, 608, 140, 14, { fontSize: 12, color: P.violetHi, fontWeight: '600' }),
  );

  // STREAKS
  e.push(tx('Streaks', 24, 642, 120, 18, { fontSize: 14, fontWeight: '600', color: P.text }));
  e.push(
    el('rect', 20, 666, 165, 58, { fill: P.surface, radius: 14, stroke: P.border, strokeWidth: 1 }),
    tx('🔥', 36, 680, 28, 26, { fontSize: 20 }),
    tx('12', 66, 678, 70, 24, { fontSize: 20, fontWeight: '800', color: P.amber }),
    tx('day streak', 66, 700, 90, 14, { fontSize: 11, color: P.textDim }),

    el('rect', 196, 666, 174, 58, { fill: P.surface, radius: 14, stroke: P.border, strokeWidth: 1 }),
    tx('◉', 212, 680, 26, 26, { fontSize: 18, color: P.violet }),
    tx('5', 242, 678, 50, 24, { fontSize: 20, fontWeight: '800', color: P.violet }),
    tx('focus sessions', 242, 700, 110, 14, { fontSize: 11, color: P.textDim }),
  );

  e.push(...nav(3));
  return { id: 's4', name: 'Trends', width: W, height: H, background: P.bg, elements: e };
}

// ── S5: PROFILE ───────────────────────────────────────────────────────────────
function s5() {
  const e = [el('rect', 0, 0, W, H, { fill: P.bg }), ...statusBar()];

  // subtle amber orb
  e.push(el('ellipse', W / 2 - 80, 90, 160, 100, { fill: 'rgba(212,148,58,0.06)' }));

  e.push(
    tx('Profile', 24, 58, 150, 28, { fontSize: 24, fontWeight: '800', color: P.text, letterSpacing: -0.5 }),
    tx('Settings', W - 72, 66, 50, 18, { fontSize: 13, color: P.textDim }),
  );

  // AVATAR
  e.push(
    el('ellipse', W / 2 - 42, 106, 84, 84, { fill: P.surface2, stroke: P.amber, strokeWidth: 2 }),
    tx('A', W / 2 - 18, 130, 36, 36, { fontSize: 32, fontWeight: '800', color: P.amber, align: 'center' }),
    el('rect', W / 2 + 20, 158, 34, 20, { fill: P.amber, radius: 10 }),
    tx('Lv7', W / 2 + 23, 164, 28, 14, { fontSize: 10, fontWeight: '800', color: '#0C0A07', letterSpacing: 0.5 }),
    tx('Alex Rivera', 0, 204, W, 24, { fontSize: 20, fontWeight: '700', color: P.text, align: 'center' }),
    tx('Emotional Athlete · 41 days', 0, 228, W, 18, { fontSize: 12, color: P.textDim, align: 'center' }),
    // XP bar
    el('rect', 48, 256, W - 96, 6, { fill: P.border, radius: 3 }),
    el('rect', 48, 256, Math.floor((W - 96) * 0.63), 6, { fill: P.amber, radius: 3 }),
    tx('2,340 / 3,700 XP', 0, 268, W, 14, { fontSize: 11, color: P.textDim, align: 'center' }),
  );

  // STATS
  const stats = [
    { lbl: 'Check-ins', val: '41' },
    { lbl: 'Focus hrs', val: '68' },
    { lbl: 'Insights', val: '127' },
  ];
  stats.forEach((s, i) => {
    const sx = 26 + i * 114;
    e.push(
      el('rect', sx, 294, 104, 62, { fill: P.surface, radius: 14, stroke: P.border, strokeWidth: 1 }),
      tx(s.val, sx + 12, 310, 80, 24, { fontSize: 22, fontWeight: '800', color: P.amber }),
      tx(s.lbl, sx + 12, 334, 80, 14, { fontSize: 11, color: P.textDim }),
    );
  });

  // DAILY RITUAL
  e.push(tx('Daily Ritual', 24, 374, 180, 20, { fontSize: 15, fontWeight: '600', color: P.text }));
  e.push(tx('Edit', W - 48, 376, 28, 16, { fontSize: 13, color: P.amber }));

  const ritual = [
    { time: '7:00 AM', act: 'Morning check-in', done: true },
    { time: '9:00 AM', act: 'Deep focus block', done: true },
    { time: '1:00 PM', act: 'Midday mood log', done: false },
    { time: '9:00 PM', act: 'Evening reflection', done: false },
  ];
  ritual.forEach((r, i) => {
    const ry = 400 + i * 50;
    e.push(
      el('rect', 20, ry, W - 40, 42, {
        fill: r.done ? 'rgba(212,148,58,0.06)' : P.surface,
        radius: 12, stroke: r.done ? 'rgba(212,148,58,0.14)' : P.border, strokeWidth: 1,
      }),
      el('ellipse', 40, ry + 14, 14, 14, { fill: r.done ? P.amber : 'transparent', stroke: r.done ? P.amber : P.textDim, strokeWidth: 1.5 }),
      tx(r.done ? '✓' : '', 34, ry + 14, 14, 14, { fontSize: 9, align: 'center', color: P.bg, fontWeight: '800' }),
      tx(r.act, 64, ry + 13, W - 140, 16, { fontSize: 13, color: r.done ? P.textMid : P.text, opacity: r.done ? 0.7 : 1 }),
      tx(r.time, W - 80, ry + 13, 60, 16, { fontSize: 11, color: P.textDim, align: 'right' }),
    );
  });

  // PREMIUM BANNER
  e.push(
    el('rect', 20, 612, W - 40, 76, { fill: 'rgba(212,148,58,0.09)', radius: 16, stroke: P.amber, strokeWidth: 1 }),
    el('ellipse', 26, 618, 36, 28, { fill: 'rgba(212,148,58,0.18)' }),
    tx('◈', 30, 636, 26, 20, { fontSize: 15, color: P.amber }),
    tx('KINDLE Gold', 64, 626, W - 120, 20, { fontSize: 15, fontWeight: '800', color: P.amberHi }),
    tx('Unlock AI coaching & advanced patterns', 64, 648, W - 120, 16, { fontSize: 12, color: P.textMid }),
    el('rect', W - 100, 634, 76, 28, { fill: P.amber, radius: 14 }),
    tx('Upgrade', W - 96, 643, 68, 16, { fontSize: 12, fontWeight: '700', color: '#0C0A07', align: 'center' }),
  );

  e.push(...nav(4));
  return { id: 's5', name: 'Profile', width: W, height: H, background: P.bg, elements: e };
}

// ── ASSEMBLE ──────────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  meta: {
    name: 'KINDLE',
    tagline: 'Your emotional performance OS',
    description: 'Inspired by Superpower (Godly.website) cinematic amber health aesthetic and Dawn mental health AI (Lapa.ninja) gradient storytelling. Pushes past cold tech-health blue into warm editorial charcoal+amber warmth.',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    tags: ['wellness', 'emotional', 'dark', 'amber', 'cinematic', 'ai', 'performance'],
  },
  theme: { primary: '#D4943A', background: '#0C0A07', surface: '#161210', text: '#F0E8D5', mode: 'dark' },
  screens: [s1(), s2(), s3(), s4(), s5()],
};

fs.writeFileSync('kindle.pen', JSON.stringify(pen, null, 2));
console.log('✓ kindle.pen written —', pen.screens.length, 'screens');
console.log('  Screens:', pen.screens.map(s => s.name).join(', '));
