// form-app.js — FORM premium personal training
// "train with intention"
// Dark theme — near-black + electric lime
// Inspired by Equinox (equinox.com) — pure black, all-caps grotesque confidence
// + Guarding Your Dawns/Qream (Awwwards SOTD) — dark drama + bold type
// + DVTK ASCII art (Siteinspire) — monospace-as-design texture

import fs from 'fs';

// ─── Canvas ────────────────────────────────────────────────────────────────
const W = 375, H = 812, GAP = 80, SCREENS = 5;
const CANVAS_W = SCREENS * W + (SCREENS + 1) * GAP;

// ─── Palette ───────────────────────────────────────────────────────────────
const BG      = '#080808';   // near-black
const SURFACE = '#131313';   // raised surface
const CARD    = '#1A1A1A';   // card bg
const LIME    = '#C8F044';   // electric lime — the racing stripe
const BONE    = '#F0EAE0';   // warm bone white
const GREY    = '#8A8A8A';   // mid grey
const COAL    = '#2A2A2A';   // divider / subtle surface
const RED     = '#FF3D2E';   // alert / PR accent
const GOLD    = '#E8B830';   // personal record gold
const MUTED   = 'rgba(240,234,224,0.38)';
const BORDER  = 'rgba(240,234,224,0.08)';

// ─── Node builders ─────────────────────────────────────────────────────────
let _id = 1;
const id = () => `node_${_id++}`;

function rect(name, x, y, w, h, fill, opts = {}) {
  return { type: 'RECTANGLE', id: id(), name, x, y, width: w, height: h,
    fill, cornerRadius: opts.r ?? 0,
    strokeColor: opts.stroke ?? null, strokeWidth: opts.sw ?? 0 };
}

function text(name, x, y, w, content, size, color, opts = {}) {
  return { type: 'TEXT', id: id(), name, x, y, width: w,
    content, fontSize: size, color,
    fontFamily: opts.font ?? 'Syne',
    fontWeight: opts.weight ?? 400,
    fontStyle:  opts.style  ?? 'normal',
    textAlign:  opts.align  ?? 'left',
    lineHeight: opts.lh     ?? 1.3,
    letterSpacing: opts.ls  ?? 0 };
}

// Mono text
function mono(name, x, y, w, content, size, color, opts = {}) {
  return text(name, x, y, w, content, size, color,
    { font: 'DM Mono', weight: 400, lh: 1.5, ls: 0.02, ...opts });
}

// ALL-CAPS loud headline
function loud(name, x, y, w, content, size, color, opts = {}) {
  return text(name, x, y, w, content, size, color,
    { font: 'Syne', weight: 800, ls: opts.ls ?? -0.01, lh: opts.lh ?? 0.95, ...opts });
}

// Label / eyebrow
function label(name, x, y, w, content) {
  return text(name, x, y, w, content, 10, GREY,
    { font: 'DM Mono', weight: 400, ls: 0.12, lh: 1.4 });
}

// Status bar
function statusBar(ox) {
  return [
    rect('status-bg', ox, 0, W, 44, 'transparent'),
    mono('time', ox + 20, 14, 50, '9:41', 13, BONE, { weight: 500 }),
    mono('icons', ox + W - 64, 14, 60, '●●●', 13, BONE, { align: 'right' }),
  ];
}

// Bottom nav
function navBar(ox, items) {
  const y = H - 72;
  const nodes = [rect('nav-bg', ox, y, W, 72, SURFACE)];
  items.forEach(({ icon, label: lbl, active }, i) => {
    const x = ox + 20 + i * 67;
    nodes.push(
      rect(`nv-accent-${i}`, x + 22, y + 8, 22, 2, active ? LIME : 'transparent', { r: 1 }),
      text(`nv-icon-${i}`, x, y + 16, 66, icon, 17, active ? LIME : GREY,
        { align: 'center', font: 'Syne', weight: active ? 700 : 400 }),
      mono(`nv-lbl-${i}`, x, y + 38, 66, lbl, 8, active ? LIME : GREY,
        { align: 'center', ls: 0.08 }),
    );
  });
  return nodes;
}

// Lime-filled pill tag
function limePill(ox, x, y, content) {
  const w = content.length * 7.4 + 18;
  return [
    rect(`lp-bg-${content}`, ox + x, y, w, 22, LIME, { r: 3 }),
    text(`lp-txt-${content}`, ox + x + 9, y + 4, w - 18, content, 10, BG,
      { font: 'DM Mono', weight: 500, ls: 0.06 }),
  ];
}

// Outline tag
function outlinePill(ox, x, y, content, color) {
  const w = content.length * 7.2 + 18;
  return [
    rect(`op-bg-${content}`, ox + x, y, w, 22, 'transparent', { r: 3, stroke: color ?? BORDER, sw: 1 }),
    text(`op-txt-${content}`, ox + x + 9, y + 4, w - 18, content, 10, color ?? GREY,
      { font: 'DM Mono', weight: 400, ls: 0.06 }),
  ];
}

// Exercise row
function exerciseRow(ox, y, { name, sets, reps, weight, done, idx }) {
  return [
    rect(`ex-bg-${idx}`, ox + 24, y, 327, 52, done ? CARD : SURFACE, { r: 6 }),
    rect(`ex-accent-${idx}`, ox + 24, y, 3, 52, done ? LIME : COAL, { r: 1 }),
    text(`ex-name-${idx}`, ox + 36, y + 8, 200, name, 13, done ? BONE : GREY,
      { font: 'Syne', weight: done ? 700 : 400 }),
    mono(`ex-sets-${idx}`, ox + 36, y + 28, 200,
      `${sets} × ${reps}${weight ? '  ·  ' + weight : ''}`, 11, MUTED),
    rect(`ex-check-${idx}`, ox + 326, y + 16, 18, 18, done ? LIME : COAL, { r: 9 }),
    done ? text(`ex-tick-${idx}`, ox + 326, y + 19, 18, '✓', 10, BG,
      { align: 'center', font: 'DM Mono', weight: 700 }) : null,
  ].filter(Boolean);
}

// PR badge
function prBadge(ox, x, y, value, label2) {
  return [
    rect(`pr-bg-${label2}`, ox + x, y, 100, 54, CARD, { r: 6 }),
    rect(`pr-top-${label2}`, ox + x, y, 100, 3, GOLD, { r: 1 }),
    text(`pr-val-${label2}`, ox + x + 10, y + 12, 80, value, 20, GOLD,
      { font: 'Syne', weight: 800 }),
    mono(`pr-lbl-${label2}`, ox + x + 10, y + 36, 80, label2, 9, GREY, { ls: 0.06 }),
  ];
}

// Volume bar
function volBar(ox, x, y, day, h, active) {
  const maxH = 60;
  const barH = Math.round(maxH * h);
  return [
    rect(`vb-track-${day}`, ox + x, y, 18, maxH, COAL, { r: 2 }),
    rect(`vb-fill-${day}`, ox + x, y + maxH - barH, 18, barH, active ? LIME : GREY, { r: 2 }),
    mono(`vb-lbl-${day}`, ox + x - 2, y + maxH + 6, 22, day, 8, GREY, { align: 'center' }),
  ];
}

// Week block in program
function weekBlock(ox, x, y, week, state) {
  const colors = { done: LIME, current: '#C8F04460', upcoming: COAL };
  const textColors = { done: BG, current: LIME, upcoming: GREY };
  const w = 56, h = 44;
  return [
    rect(`wk-bg-${week}`, ox + x, y, w, h, colors[state] ?? COAL, { r: 4 }),
    text(`wk-num-${week}`, ox + x, y + 6, w, `W${week}`, 12, textColors[state] ?? GREY,
      { font: 'Syne', weight: 800, align: 'center' }),
    mono(`wk-lbl-${week}`, ox + x, y + 24, w, state.toUpperCase(), 8, textColors[state] ?? GREY,
      { align: 'center', ls: 0.06 }),
  ];
}

// Metric tile
function metricTile(ox, x, y, value, lbl, color) {
  return [
    rect(`mt-bg-${lbl}`, ox + x, y, 100, 64, CARD, { r: 6 }),
    text(`mt-val-${lbl}`, ox + x + 10, y + 10, 80, value, 22, color ?? BONE,
      { font: 'Syne', weight: 800 }),
    mono(`mt-lbl-${lbl}`, ox + x + 10, y + 38, 80, lbl, 9, GREY, { ls: 0.06 }),
  ];
}

// ─── Screens ───────────────────────────────────────────────────────────────
function screenX(i) { return GAP + i * (W + GAP); }

// SCREEN 1 — Today
function s1(ox) {
  return [
    rect('bg1', ox, 0, W, H, BG),
    ...statusBar(ox),

    // Day context
    label('day-label', ox + 24, 54, 200, 'MARCH 27 · WEEK 4 OF 12'),
    loud('day-head', ox + 24, 70, 320, 'WEDNESDAY.\nPUSH DAY.', 44, BONE, { lh: 0.92 }),

    // Lime accent line
    rect('accent-line', ox + 24, 168, 48, 3, LIME, { r: 1 }),

    // Session card
    rect('session-card', ox + 24, 184, 327, 130, SURFACE, { r: 8 }),
    rect('session-lime', ox + 24, 184, 4, 130, LIME, { r: 2 }),
    label('session-eyebrow', ox + 38, 196, 200, 'TODAY\'S SESSION'),
    loud('session-name', ox + 38, 212, 270, 'UPPER\nSTRENGTH', 22, BONE),
    mono('session-meta', ox + 38, 260, 220, '5 exercises  ·  ~52 min  ·  Coach: Dara', 11, MUTED),
    rect('session-cta', ox + 226, 278, 110, 28, LIME, { r: 4 }),
    text('session-start', ox + 226, 283, 110, 'START SESSION', 9, BG,
      { font: 'DM Mono', weight: 700, align: 'center', ls: 0.06 }),

    // Exercise list preview
    label('ex-label', ox + 24, 328, 200, 'EXERCISES'),
    ...exerciseRow(ox, 344, { name: 'Bench Press', sets: 4, reps: '6', weight: '85kg', done: true, idx: 0 }),
    ...exerciseRow(ox, 404, { name: 'Incline DB Press', sets: 3, reps: '10', weight: '30kg', done: true, idx: 1 }),
    ...exerciseRow(ox, 464, { name: 'Cable Fly', sets: 3, reps: '12', weight: '15kg', done: false, idx: 2 }),
    ...exerciseRow(ox, 524, { name: 'Tricep Pushdown', sets: 4, reps: '12', weight: '25kg', done: false, idx: 3 }),
    ...exerciseRow(ox, 584, { name: 'Overhead Extension', sets: 3, reps: '10', weight: '20kg', done: false, idx: 4 }),

    // Coach note
    rect('coach-note', ox + 24, 650, 327, 44, CARD, { r: 6 }),
    mono('coach-note-txt', ox + 36, 660, 295,
      '↑ Dara: "Push the bench to 90kg today — your form looked solid Tuesday."', 11, LIME, { lh: 1.5 }),

    ...navBar(ox, [
      { icon: '◈', label: 'TODAY',    active: true  },
      { icon: '▷', label: 'SESSION',  active: false },
      { icon: '▦', label: 'PROGRAM',  active: false },
      { icon: '◎', label: 'PROGRESS', active: false },
      { icon: '⊕', label: 'COACH',    active: false },
    ]),
  ];
}

// SCREEN 2 — Live Session
function s2(ox) {
  return [
    rect('bg2', ox, 0, W, H, BG),
    ...statusBar(ox),

    // Big exercise name
    label('live-eyebrow', ox + 24, 54, 200, 'EXERCISE 3 OF 5  ·  SET 2 OF 3'),
    loud('live-name', ox + 24, 72, 327, 'CABLE\nFLY', 64, BONE, { lh: 0.90 }),

    // Set counter ring area
    rect('set-ring-bg', ox + 24, 210, 327, 120, SURFACE, { r: 8 }),
    // Big reps number
    loud('rep-count', ox + 24, 218, 200, '12', 72, LIME, { lh: 1 }),
    mono('rep-label', ox + 24, 296, 100, 'REPS', 11, GREY, { ls: 0.12 }),
    // Weight
    loud('weight-val', ox + 200, 228, 130, '15', 48, BONE),
    mono('weight-unit', ox + 200, 282, 80, 'KG', 11, GREY, { ls: 0.12 }),

    // Set dots
    rect('dot1', ox + 24, 344, 18, 18, LIME, { r: 9 }),
    rect('dot2', ox + 50, 344, 18, 18, LIME, { r: 9 }),
    rect('dot3', ox + 76, 344, 18, 18, COAL, { r: 9 }),
    mono('sets-done', ox + 104, 347, 120, '2 OF 3 SETS DONE', 10, GREY, { ls: 0.06 }),

    // Timer
    rect('timer-bg', ox + 24, 376, 327, 52, COAL, { r: 6 }),
    loud('timer-val', ox + 24, 383, 200, '01:34', 28, LIME),
    mono('timer-label', ox + 24, 416, 100, 'REST TIMER', 9, GREY, { ls: 0.1 }),
    rect('skip-btn', ox + 280, 390, 60, 28, SURFACE, { r: 4 }),
    mono('skip-txt', ox + 280, 396, 60, 'SKIP', 10, GREY, { align: 'center', ls: 0.08 }),

    // Previous sets table
    label('sets-label', ox + 24, 444, 200, 'PREVIOUS SETS'),
    rect('sets-table', ox + 24, 460, 327, 80, SURFACE, { r: 6 }),
    mono('sets-h1', ox + 36, 472, 60, 'SET', 9, GREY, { ls: 0.08 }),
    mono('sets-h2', ox + 110, 472, 60, 'REPS', 9, GREY, { ls: 0.08 }),
    mono('sets-h3', ox + 184, 472, 60, 'WEIGHT', 9, GREY, { ls: 0.08 }),
    mono('sets-h4', ox + 280, 472, 60, 'STATUS', 9, GREY, { ls: 0.08 }),
    rect('divider-s', ox + 36, 484, 290, 1, COAL, { r: 0 }),
    mono('r1c1', ox + 36, 492, 60, '1', 11, BONE),
    mono('r1c2', ox + 110, 492, 60, '12', 11, BONE),
    mono('r1c3', ox + 184, 492, 80, '15 kg', 11, BONE),
    mono('r1c4', ox + 280, 492, 60, '✓ DONE', 11, LIME),
    mono('r2c1', ox + 36, 510, 60, '2', 11, BONE),
    mono('r2c2', ox + 110, 510, 60, '12', 11, BONE),
    mono('r2c3', ox + 184, 510, 80, '15 kg', 11, BONE),
    mono('r2c4', ox + 280, 510, 60, '✓ DONE', 11, LIME),
    mono('r3c1', ox + 36, 528, 60, '3', 11, GREY),
    mono('r3c2', ox + 110, 528, 60, '—', 11, GREY),
    mono('r3c3', ox + 184, 528, 80, '—', 11, GREY),
    mono('r3c4', ox + 280, 528, 60, 'UP NEXT', 9, GREY, { ls: 0.06 }),

    // Complete set button
    rect('complete-btn', ox + 24, 560, 327, 52, LIME, { r: 6 }),
    text('complete-txt', ox + 24, 572, 327, 'COMPLETE SET', 14, BG,
      { font: 'Syne', weight: 800, align: 'center', ls: 0.06 }),

    // Next exercise
    rect('next-ex', ox + 24, 626, 327, 44, CARD, { r: 6 }),
    mono('next-label', ox + 36, 634, 120, 'UP NEXT', 9, GREY, { ls: 0.1 }),
    mono('next-name', ox + 36, 648, 200, 'Tricep Pushdown  ·  4×12  ·  25kg', 11, BONE),

    ...navBar(ox, [
      { icon: '◈', label: 'TODAY',    active: false },
      { icon: '▷', label: 'SESSION',  active: true  },
      { icon: '▦', label: 'PROGRAM',  active: false },
      { icon: '◎', label: 'PROGRESS', active: false },
      { icon: '⊕', label: 'COACH',    active: false },
    ]),
  ];
}

// SCREEN 3 — Program
function s3(ox) {
  return [
    rect('bg3', ox, 0, W, H, BG),
    ...statusBar(ox),

    label('prog-eyebrow', ox + 24, 54, 280, 'YOUR PROGRAM'),
    loud('prog-name', ox + 24, 70, 327, 'STRENGTH\nFOUNDATION\n12-WEEK', 30, BONE, { lh: 0.96, ls: -0.02 }),
    ...limePill(ox, 24, 166, 'WEEK 4 OF 12'),
    ...outlinePill(ox, 106, 166, 'PUSH / PULL / LEGS', GREY),

    // Week grid
    label('weeks-label', ox + 24, 204, 200, 'OVERVIEW'),
    // Row 1: weeks 1–4
    ...weekBlock(ox, 24,  220, 1, 'done'),
    ...weekBlock(ox, 88,  220, 2, 'done'),
    ...weekBlock(ox, 152, 220, 3, 'done'),
    ...weekBlock(ox, 216, 220, 4, 'current'),
    ...weekBlock(ox, 280, 220, 5, 'upcoming'),
    ...weekBlock(ox, 24,  272, 6, 'upcoming'),
    ...weekBlock(ox, 88,  272, 7, 'upcoming'),
    ...weekBlock(ox, 152, 272, 8, 'upcoming'),
    ...weekBlock(ox, 216, 272, 9, 'upcoming'),
    ...weekBlock(ox, 280, 272, 10,'upcoming'),

    // Phase detail
    rect('phase-card', ox + 24, 336, 327, 88, SURFACE, { r: 8 }),
    rect('phase-lime', ox + 24, 336, 4, 88, LIME, { r: 2 }),
    label('phase-label', ox + 38, 348, 200, 'CURRENT PHASE · WEEKS 3–6'),
    loud('phase-name', ox + 38, 364, 260, 'HYPERTROPHY', 20, BONE),
    mono('phase-desc', ox + 38, 390, 285,
      'Volume emphasis: 4×8–12. Progressive overload on major compounds.', 11, MUTED, { lh: 1.5 }),

    // This week sessions
    label('week-label', ox + 24, 440, 200, 'THIS WEEK'),
    rect('day-mon', ox + 24, 456, 327, 44, CARD, { r: 6 }),
    rect('day-mon-done', ox + 24, 456, 3, 44, LIME, { r: 1 }),
    mono('day-mon-d', ox + 36, 464, 60, 'MON', 10, LIME, { ls: 0.08, weight: 500 }),
    mono('day-mon-n', ox + 36, 480, 200, 'Upper Strength · DONE', 11, GREY),
    mono('day-mon-v', ox + W - 40, 468, 40, '✓', 14, LIME, { align: 'right' }),

    rect('day-tue', ox + 24, 508, 327, 44, CARD, { r: 6 }),
    rect('day-tue-done', ox + 24, 508, 3, 44, LIME, { r: 1 }),
    mono('day-tue-d', ox + 36, 516, 60, 'TUE', 10, LIME, { ls: 0.08, weight: 500 }),
    mono('day-tue-n', ox + 36, 532, 200, 'Lower Strength · DONE', 11, GREY),
    mono('day-tue-v', ox + W - 40, 520, 40, '✓', 14, LIME, { align: 'right' }),

    rect('day-wed', ox + 24, 560, 327, 44, SURFACE, { r: 6, stroke: LIME, sw: 1 }),
    rect('day-wed-acc', ox + 24, 560, 3, 44, LIME, { r: 1 }),
    mono('day-wed-d', ox + 36, 568, 60, 'WED', 10, LIME, { ls: 0.08, weight: 500 }),
    mono('day-wed-n', ox + 36, 584, 200, 'Push Day · TODAY', 11, BONE),
    text('day-wed-v', ox + W - 50, 572, 50, 'START →', 9, LIME,
      { font: 'DM Mono', weight: 500, align: 'right' }),

    rect('day-thu', ox + 24, 612, 327, 44, COAL, { r: 6 }),
    mono('day-thu-d', ox + 36, 620, 60, 'THU', 10, GREY, { ls: 0.08 }),
    mono('day-thu-n', ox + 36, 636, 200, 'Rest / Active Recovery', 11, GREY),

    rect('day-fri', ox + 24, 664, 327, 44, COAL, { r: 6 }),
    mono('day-fri-d', ox + 36, 672, 60, 'FRI', 10, GREY, { ls: 0.08 }),
    mono('day-fri-n', ox + 36, 688, 200, 'Pull Day · Deadlift focus', 11, GREY),

    ...navBar(ox, [
      { icon: '◈', label: 'TODAY',    active: false },
      { icon: '▷', label: 'SESSION',  active: false },
      { icon: '▦', label: 'PROGRAM',  active: true  },
      { icon: '◎', label: 'PROGRESS', active: false },
      { icon: '⊕', label: 'COACH',    active: false },
    ]),
  ];
}

// SCREEN 4 — Progress
function s4(ox) {
  return [
    rect('bg4', ox, 0, W, H, BG),
    ...statusBar(ox),

    label('prog-eyebrow', ox + 24, 54, 200, 'YOUR PROGRESS · WEEK 4'),
    loud('prog-head', ox + 24, 70, 300, 'GETTING\nSTRONGER.', 38, BONE, { lh: 0.92 }),

    // Personal records row
    label('pr-label', ox + 24, 158, 200, 'PERSONAL RECORDS'),
    ...prBadge(ox, 24,  174, '102.5', 'BENCH KG'),
    ...prBadge(ox, 132, 174, '160',   'SQUAT KG'),
    ...prBadge(ox, 240, 174, '195',   'DEADLIFT KG'),

    // Volume chart
    label('vol-label', ox + 24, 252, 200, 'WEEKLY VOLUME (SETS)'),
    ...volBar(ox, 24,  272, 'W1', 0.60, false),
    ...volBar(ox, 50,  272, 'W2', 0.72, false),
    ...volBar(ox, 76,  272, 'W3', 0.85, false),
    ...volBar(ox, 102, 272, 'W4', 1.00, true),
    ...volBar(ox, 128, 272, 'W5', 0.20, false),
    mono('vol-now', ox + 24, 348, 200, '↑ 22 sets this week  ·  +4 vs W3', 11, LIME, { lh: 1.5 }),

    // Key lifts table
    label('lifts-label', ox + 24, 374, 200, 'KEY LIFTS'),
    rect('lifts-table', ox + 24, 390, 327, 148, SURFACE, { r: 8 }),
    mono('lt-h1', ox + 36, 402, 120, 'EXERCISE', 9, GREY, { ls: 0.08 }),
    mono('lt-h2', ox + 200, 402, 60, 'START', 9, GREY, { ls: 0.08 }),
    mono('lt-h3', ox + 264, 402, 60, 'NOW', 9, GREY, { ls: 0.08 }),
    mono('lt-h4', ox + 320, 402, 30, '+%', 9, GREY, { ls: 0.06 }),
    rect('lt-div', ox + 36, 415, 298, 1, COAL),
    // Row 1
    mono('lt-r1n', ox + 36, 422, 120, 'Bench Press', 11, BONE),
    mono('lt-r1s', ox + 200, 422, 60, '77.5', 11, GREY),
    mono('lt-r1c', ox + 264, 422, 60, '90', 11, BONE, { weight: 500 }),
    mono('lt-r1p', ox + 320, 422, 30, '+16', 11, LIME),
    // Row 2
    mono('lt-r2n', ox + 36, 444, 120, 'Squat', 11, BONE),
    mono('lt-r2s', ox + 200, 444, 60, '130', 11, GREY),
    mono('lt-r2c', ox + 264, 444, 60, '155', 11, BONE),
    mono('lt-r2p', ox + 320, 444, 30, '+19', 11, LIME),
    // Row 3
    mono('lt-r3n', ox + 36, 466, 120, 'Deadlift', 11, BONE),
    mono('lt-r3s', ox + 200, 466, 60, '160', 11, GREY),
    mono('lt-r3c', ox + 264, 466, 60, '192.5', 11, BONE),
    mono('lt-r3p', ox + 320, 466, 30, '+20', 11, LIME),
    // Row 4
    mono('lt-r4n', ox + 36, 488, 120, 'OHP', 11, BONE),
    mono('lt-r4s', ox + 200, 488, 60, '55', 11, GREY),
    mono('lt-r4c', ox + 264, 488, 60, '65', 11, BONE),
    mono('lt-r4p', ox + 320, 488, 30, '+18', 11, LIME),
    // Row 5
    mono('lt-r5n', ox + 36, 510, 120, 'Pull-up', 11, BONE),
    mono('lt-r5s', ox + 200, 510, 60, '+0', 11, GREY),
    mono('lt-r5c', ox + 264, 510, 60, '+5kg', 11, BONE),
    mono('lt-r5p', ox + 320, 510, 30, '↑ PR', 11, GOLD),

    // Session streak
    label('streak-label', ox + 24, 554, 200, 'CONSISTENCY'),
    ...metricTile(ox, 24,  570, '18', 'SESSIONS'),
    ...metricTile(ox, 132, 570, '22d', 'STREAK'),
    ...metricTile(ox, 240, 570, '89%', 'ADHERENCE'),

    ...navBar(ox, [
      { icon: '◈', label: 'TODAY',    active: false },
      { icon: '▷', label: 'SESSION',  active: false },
      { icon: '▦', label: 'PROGRAM',  active: false },
      { icon: '◎', label: 'PROGRESS', active: true  },
      { icon: '⊕', label: 'COACH',    active: false },
    ]),
  ];
}

// SCREEN 5 — Coach
function s5(ox) {
  return [
    rect('bg5', ox, 0, W, H, BG),
    ...statusBar(ox),

    // Coach header
    rect('coach-avatar', ox + 24, 54, 52, 52, COAL, { r: 26 }),
    text('coach-init', ox + 24, 67, 52, 'DK', 18, LIME,
      { font: 'Syne', weight: 800, align: 'center' }),
    loud('coach-name', ox + 86, 60, 220, 'DARA KINSELLA', 16, BONE),
    mono('coach-title', ox + 86, 80, 220, 'STRENGTH & CONDITIONING COACH', 9, GREY, { ls: 0.06 }),
    rect('check-in-badge', ox + W - 104, 58, 80, 22, LIME + '20', { r: 11 }),
    mono('check-in-txt', ox + W - 100, 64, 72, 'CHECK-IN FRI', 9, LIME, { ls: 0.04, align: 'center' }),

    // Next check-in strip
    rect('checkin-strip', ox + 24, 120, 327, 44, SURFACE, { r: 6 }),
    mono('ci-label', ox + 36, 130, 200, 'NEXT CHECK-IN', 9, GREY, { ls: 0.1 }),
    mono('ci-val', ox + 36, 146, 200, 'Friday · 2 days away · Video call', 11, BONE),
    rect('ci-dot', ox + W - 38, 136, 10, 10, LIME, { r: 5 }),

    // Coach notes
    label('notes-label', ox + 24, 178, 200, 'PROGRAMMING NOTES'),
    rect('note1', ox + 24, 194, 327, 72, SURFACE, { r: 6 }),
    mono('note1-tag', ox + 36, 204, 80, '↑ FORM NOTE', 9, LIME, { ls: 0.06 }),
    mono('note1-txt', ox + 36, 220, 295,
      '"Bench: arch slightly, drive feet into floor. You\'re losing tightness at the top — control the negative more."', 11, BONE, { lh: 1.55 }),

    rect('note2', ox + 24, 274, 327, 56, SURFACE, { r: 6 }),
    mono('note2-tag', ox + 36, 284, 80, '▲ LOAD NOTE', 9, GOLD, { ls: 0.06 }),
    mono('note2-txt', ox + 36, 300, 295,
      '"Push bench to 90kg today. Squat is ready for 160 next session."', 11, BONE, { lh: 1.55 }),

    rect('note3', ox + 24, 338, 327, 56, SURFACE, { r: 6 }),
    mono('note3-tag', ox + 36, 348, 80, '◎ RECOVERY', 9, GREY, { ls: 0.06 }),
    mono('note3-txt', ox + 36, 364, 295,
      '"Sleep data looks good — 7h avg. Keep the Thursday rest day. No add-ons."', 11, BONE, { lh: 1.55 }),

    // Message thread
    label('msg-label', ox + 24, 408, 200, 'MESSAGES'),
    rect('msg-bg-1', ox + 24, 424, 280, 40, CARD, { r: 8 }),
    mono('msg-1', ox + 36, 434, 256, '"Felt strong on squats today — 155kg moved well."', 11, BONE, { lh: 1.5 }),
    rect('msg-dot-1', ox + 310, 438, 6, 6, LIME, { r: 3 }),

    rect('msg-bg-2', ox + 70, 472, 281, 40, SURFACE, { r: 8 }),
    mono('msg-2', ox + 82, 482, 256, '"Good. That\'s your body telling you 160 is close."', 11, LIME, { lh: 1.5 }),

    rect('msg-bg-3', ox + 24, 520, 260, 40, CARD, { r: 8 }),
    mono('msg-3', ox + 36, 530, 236, '"Should I try 157.5 or go straight to 160?"', 11, BONE, { lh: 1.5 }),

    rect('msg-bg-4', ox + 90, 568, 261, 40, SURFACE, { r: 8 }),
    mono('msg-4', ox + 102, 578, 236, '"Go for 160. You\'re ready."', 11, LIME, { lh: 1.5 }),

    // Input
    rect('input-bg', ox + 24, 626, 279, 40, COAL, { r: 20 }),
    mono('input-placeholder', ox + 38, 638, 200, 'Message Dara...', 12, GREY),
    rect('send-btn', ox + 313, 626, 38, 40, LIME, { r: 20 }),
    text('send-icon', ox + 313, 637, 38, '↑', 16, BG, { font: 'Syne', weight: 800, align: 'center' }),

    ...navBar(ox, [
      { icon: '◈', label: 'TODAY',    active: false },
      { icon: '▷', label: 'SESSION',  active: false },
      { icon: '▦', label: 'PROGRAM',  active: false },
      { icon: '◎', label: 'PROGRESS', active: false },
      { icon: '⊕', label: 'COACH',    active: true  },
    ]),
  ];
}

// ─── Assemble ──────────────────────────────────────────────────────────────
const children = [
  ...s1(screenX(0)),
  ...s2(screenX(1)),
  ...s3(screenX(2)),
  ...s4(screenX(3)),
  ...s5(screenX(4)),
];

const pen = {
  version: '2.8',
  name: 'FORM — train with intention',
  width: CANVAS_W,
  height: H,
  fill: '#050505',
  children,
};

fs.writeFileSync('form.pen', JSON.stringify(pen, null, 2));
console.log(`✅ form.pen — ${children.length} nodes, ${SCREENS} screens, ${CANVAS_W}×${H}`);
