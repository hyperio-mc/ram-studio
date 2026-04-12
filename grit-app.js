'use strict';
// grit-app.js — GRIT: Brutalist Dark Strength Training Tracker
// Inspired by:
//   1. SiteInspire (Mar 24, 2026): Typographic is the #1 most-saved style (2052 entries).
//      Heavy type-led sites like Singer Reimagined, High Society, New Genre, KO Collective
//      all use massive numerals and stark contrast as pure design elements.
//   2. Godly.website: Dark developer infrastructure tools (Evervault, Linear, Railway, Phantom)
//      show that purposeful darkness + single accent color = authority.
//   3. Land-book: Tracebit "The answer to Assume Breach" — stark high-contrast dark security UI,
//      zero ornament, data-forward layout. Applied to fitness: numbers ARE the narrative.
// Theme: DARK — brutalist, typographic, no-nonsense
// Design push: Typography as primary visual element. PRs and weight numbers rendered at 56-72px.
//              No rounded corners. Thick accent borders. Grid discipline. Pure brutalism.

const fs   = require('fs');
const path = require('path');

// ─── colour palette ───────────────────────────────────────────────────────────
const C = {
  bg:       '#0B0B0B',
  surface:  '#161616',
  surface2: '#1E1E1E',
  text:     '#EDEDED',
  muted:    'rgba(237,237,237,0.38)',
  ember:    '#FF4500',   // primary accent — molten orange-red
  gold:     '#FFB800',   // secondary — amber
  border:   'rgba(237,237,237,0.12)',
  borderHi: 'rgba(255,69,0,0.5)',
};

// ─── pen helpers ─────────────────────────────────────────────────────────────
let _id = 1;
const uid  = () => `grit-${_id++}`;
const rect = (x, y, w, h, fill) => ({ id: uid(), type: 'rect', x, y, width: w, height: h, fill });
const text = (x, y, w, h, content, fontSize, color, weight = '400', align = 'left', family = 'Inter') =>
  ({ id: uid(), type: 'text', x, y, width: w, height: h, content, fontSize, color, fontWeight: weight, textAlign: align, fontFamily: family });
const frame = (x, y, w, h, fill, children) => ({ id: uid(), type: 'frame', x, y, width: w, height: h, fill, clip: true, children });

const FW = 390; const FH = 844;

// ─── reusable components ──────────────────────────────────────────────────────

function header(label, sub) {
  return [
    rect(0, 0, FW, 64, C.bg),
    text(20, 18, 200, 28, 'GRIT', 18, C.ember, '800'),
    text(20, 40, 200, 16, label.toUpperCase(), 11, C.muted, '600'),
    ...(sub ? [text(FW - 120, 40, 110, 16, sub, 11, C.gold, '500', 'right')] : []),
  ];
}

function statBlock(x, y, label, value, unit, change) {
  const els = [
    rect(x, y, 170, 100, C.surface),
    rect(x, y, 3, 100, C.ember),  // accent border left
    text(x + 12, y + 12, 146, 14, label.toUpperCase(), 10, C.muted, '600'),
    text(x + 12, y + 28, 146, 52, value, 46, C.text, '800', 'left', 'Inter'),
  ];
  if (unit) els.push(text(x + 12, y + 76, 80, 14, unit, 11, C.muted, '400'));
  if (change) els.push(text(x + 12, y + 76, 146, 14, change, 11, C.ember, '600', 'right'));
  return els;
}

function bigStat(x, y, label, value, sub) {
  return [
    rect(x, y, FW - x*2, 110, C.surface2),
    rect(x, y, FW - x*2, 3, C.ember),  // top accent line
    text(x + 16, y + 14, 200, 14, label.toUpperCase(), 10, C.muted, '600'),
    text(x + 16, y + 32, 300, 58, value, 56, C.text, '900', 'left', 'Inter'),
    text(x + 16, y + 88, 300, 16, sub, 12, C.muted, '400'),
  ];
}

function progressBar(x, y, w, label, pct, color) {
  const filled = Math.round((w - 16) * pct / 100);
  return [
    rect(x, y, w, 44, C.surface),
    rect(x, y + 38, w, 1, C.border),
    text(x + 8, y + 8, w - 60, 14, label, 12, C.text, '500'),
    text(x + 8, y + 24, w - 60, 14, '', 10, C.muted, '400'),
    // bar track
    rect(x, y + 38, w, 2, C.surface2),
    rect(x, y + 38, filled + 8, 2, color || C.ember),
    text(w - 40, y + 14, 40, 14, `${pct}%`, 12, pct >= 80 ? C.ember : C.gold, '700', 'right'),
  ];
}

function listRow(x, y, w, label, sub, right, accent) {
  return [
    rect(x, y, w, 60, C.surface),
    rect(x, y + 59, w, 1, C.border),
    rect(x, y, 3, 60, accent || C.border),
    text(x + 14, y + 12, w - 80, 20, label, 14, C.text, '600'),
    text(x + 14, y + 34, w - 80, 15, sub, 11, C.muted, '400'),
    text(w - 60, y + 20, 52, 18, right || '', 14, C.gold, '700', 'right'),
  ];
}

function tagRow(x, y, tags) {
  const els = [];
  let tx = x;
  tags.forEach(t => {
    const w = t.length * 8 + 20;
    els.push(rect(tx, y, w, 24, 'transparent'));
    els.push({ id: uid(), type: 'rect', x: tx, y, width: w, height: 24, fill: 'transparent', stroke: C.border, strokeWidth: 1 });
    els.push(text(tx + 4, y + 5, w - 8, 14, t, 10, C.muted, '500'));
    tx += w + 8;
  });
  return els;
}

// ─── SCREEN 1: Today ──────────────────────────────────────────────────────────
function screenToday() {
  const children = [
    rect(0, 0, FW, FH, C.bg),
    ...header('Today', 'MON 24 MAR'),

    // Big workout heading
    text(20, 72, FW - 40, 30, 'PUSH DAY A', 22, C.text, '800'),
    text(20, 100, FW - 40, 18, 'Upper · Strength Focus · 4 exercises remaining', 12, C.muted, '400'),
    rect(20, 120, FW - 40, 1, C.border),

    // Current exercise - huge number focus
    rect(20, 130, FW - 40, 130, C.surface2),
    rect(20, 130, FW - 40, 3, C.ember),
    text(36, 142, 200, 14, 'BENCH PRESS', 10, C.muted, '600'),
    text(36, 158, 200, 14, 'SET 3 OF 5', 10, C.gold, '700'),
    text(36, 178, 180, 72, '102.5', 66, C.text, '900', 'left', 'Inter'),
    text(220, 220, 80, 28, 'kg', 22, C.ember, '700'),
    text(36, 248, 200, 18, '× 5 reps  ·  Last: 100 kg × 5', 13, C.muted, '400'),
    text(FW - 80, 180, 64, 32, '+2.5', 16, C.ember, '700', 'right'),
    text(FW - 80, 210, 64, 16, 'pr climb', 10, C.muted, '500', 'right'),

    // Session stats row
    ...statBlock(20, 276, 'Volume', '4,850', 'kg today', '↑ 12%'),
    ...statBlock(200, 276, 'Intensity', '84', '% 1RM avg', null),

    // Exercise queue
    text(20, 392, 200, 18, 'REMAINING', 11, C.muted, '600'),
    ...listRow(20, 410, FW - 40, 'Incline DB Press', '4 × 8  ·  85% 1RM', '32 kg', null),
    ...listRow(20, 470, FW - 40, 'Cable Fly', '3 × 12  ·  moderate', '20 kg', null),
    ...listRow(20, 530, FW - 40, 'Tricep Pushdown', '3 × 15  ·  isolation', '25 kg', null),

    // Complete button
    rect(20, 608, FW - 40, 52, C.ember),
    text(20, 620, FW - 40, 28, 'LOG SET & CONTINUE', 14, '#0B0B0B', '800', 'center'),

    // bottom nav
    rect(0, FH - 80, FW, 80, C.surface),
    rect(0, FH - 80, FW, 1, C.border),
    ...navBar(0),
  ];
  return frame(0, 0, FW, FH, C.bg, children);
}

// ─── SCREEN 2: Programs ───────────────────────────────────────────────────────
function screenPrograms() {
  const children = [
    rect(0, 0, FW, FH, C.bg),
    ...header('Programs', '3 ACTIVE'),
    text(20, 72, FW - 40, 28, 'TRAINING PLANS', 18, C.text, '800'),
    text(20, 98, FW - 40, 16, 'Built around your goals · Auto-progresses each week', 12, C.muted, '400'),
    rect(20, 118, FW - 40, 1, C.border),

    // Active program — prominent
    rect(20, 128, FW - 40, 160, C.surface),
    rect(20, 128, FW - 40, 3, C.ember),
    rect(20, 128, 3, 160, C.ember),
    text(36, 142, 200, 14, 'CURRENT PROGRAM', 10, C.gold, '700'),
    text(36, 160, FW - 76, 32, 'STRONGLIFTS 5×5', 26, C.text, '800'),
    text(36, 194, FW - 76, 18, 'Linear progression · Powerlifting base', 13, C.muted, '400'),
    text(36, 216, 160, 16, 'WEEK 12 OF 16', 12, C.ember, '700'),
    text(FW - 80, 216, 56, 16, '76%', 14, C.gold, '700', 'right'),
    rect(36, 236, FW - 76, 6, C.surface2),
    rect(36, 236, Math.round((FW - 76) * 0.76), 6, C.ember),
    text(36, 248, FW - 76, 16, '48 sessions · 412 sets · 284,000 kg lifted', 11, C.muted, '400'),
    text(FW - 80, 248, 60, 16, 'ACTIVE', 10, C.ember, '600', 'right'),

    // Other programs
    text(20, 306, 200, 16, 'OTHER PROGRAMS', 10, C.muted, '600'),
    ...listRow(20, 324, FW - 40, 'GZCLP Hypertrophy', 'High volume · 4 days/wk', 'PAUSED', null),
    ...listRow(20, 384, FW - 40, 'Tactical Conditioning', 'MetCon + strength · 5 days/wk', 'SAVED', null),
    ...listRow(20, 444, FW - 40, 'Wendler 5/3/1', 'Periodised · 3-4 days/wk', 'SAVED', null),

    // Create new
    rect(20, 522, FW - 40, 52, 'transparent'),
    { id: uid(), type: 'rect', x: 20, y: 522, width: FW - 40, height: 52, fill: 'transparent', stroke: C.ember, strokeWidth: 1 },
    text(20, 534, FW - 40, 28, '+ BUILD CUSTOM PROGRAM', 13, C.ember, '700', 'center'),

    rect(0, FH - 80, FW, 80, C.surface),
    rect(0, FH - 80, FW, 1, C.border),
    ...navBar(1),
  ];
  return frame(350, 0, FW, FH, C.bg, children);
}

// ─── SCREEN 3: History ────────────────────────────────────────────────────────
function screenHistory() {
  const children = [
    rect(0, 0, FW, FH, C.bg),
    ...header('History', 'MARCH 2026'),
    text(20, 72, FW - 40, 28, '124 SESSIONS', 26, C.text, '800'),
    text(20, 100, FW - 40, 18, 'Since Jan 2025 · 87% consistency rate', 12, C.muted, '400'),
    rect(20, 122, FW - 40, 1, C.border),

    // Heatmap placeholder - raw grid
    ...Array.from({ length: 5 }, (_, row) =>
      Array.from({ length: 12 }, (_, col) => {
        const intensity = Math.random();
        const fill = intensity > 0.7 ? C.ember : intensity > 0.4 ? C.gold : intensity > 0.2 ? C.surface2 : C.surface;
        return rect(20 + col * 29, 132 + row * 20, 25, 16, fill);
      })
    ).flat(),

    text(20, 240, 200, 14, 'RECENT SESSIONS', 10, C.muted, '600'),
    ...listRow(20, 258, FW - 40, 'Push Day A', 'Today · 58 min · 4,850 kg', '+2.5 kg PR', C.ember),
    ...listRow(20, 318, FW - 40, 'Pull Day B', 'Sat · 62 min · 5,120 kg', 'Completed', null),
    ...listRow(20, 378, FW - 40, 'Leg Day C', 'Thu · 71 min · 8,400 kg', 'Completed', null),
    ...listRow(20, 438, FW - 40, 'Push Day A', 'Mon · 55 min · 4,650 kg', 'Completed', null),
    ...listRow(20, 498, FW - 40, 'Pull Day B', 'Sat · 60 min · 4,980 kg', '+5 kg PR', C.gold),

    rect(0, FH - 80, FW, 80, C.surface),
    rect(0, FH - 80, FW, 1, C.border),
    ...navBar(2),
  ];
  return frame(700, 0, FW, FH, C.bg, children);
}

// ─── SCREEN 4: Progress ───────────────────────────────────────────────────────
function screenProgress() {
  const children = [
    rect(0, 0, FW, FH, C.bg),
    ...header('Progress', 'ALL TIME'),
    text(20, 72, FW - 40, 28, 'PERSONAL RECORDS', 22, C.text, '800'),
    text(20, 100, FW - 40, 16, 'Calculated from best sets · Updated after every session', 12, C.muted, '400'),
    rect(20, 120, FW - 40, 1, C.border),

    // PRs - big typographic numbers
    ...bigStat(20, 130, 'Bench Press · 1RM estimated', '115 kg', '↑ 15 kg in 90 days · Elite for bodyweight'),
    ...bigStat(20, 254, 'Squat · 1RM estimated', '145 kg', '↑ 25 kg in 90 days · Advanced category'),
    ...bigStat(20, 378, 'Deadlift · 1RM estimated', '185 kg', '↑ 35 kg in 90 days · Near elite level'),

    text(20, 500, 200, 16, 'BODY COMPOSITION', 10, C.muted, '600'),
    ...statBlock(20, 520, 'Weight', '84.2', 'kg', null),
    ...statBlock(200, 520, 'Body Fat', '14.8', '%', '↓ 2.1%'),

    rect(0, FH - 80, FW, 80, C.surface),
    rect(0, FH - 80, FW, 1, C.border),
    ...navBar(3),
  ];
  return frame(1050, 0, FW, FH, C.bg, children);
}

// ─── SCREEN 5: Recovery ───────────────────────────────────────────────────────
function screenRecovery() {
  const children = [
    rect(0, 0, FW, FH, C.bg),
    ...header('Recovery', 'TODAY'),
    text(20, 72, FW - 40, 30, 'RECOVERY SCORE', 20, C.text, '800'),
    rect(20, 106, FW - 40, 1, C.border),

    // Big recovery score
    rect(20, 116, FW - 40, 130, C.surface2),
    rect(20, 116, FW - 40, 3, C.gold),
    text(36, 128, 200, 14, 'READINESS INDEX', 10, C.muted, '600'),
    text(36, 148, 200, 72, '87', 68, C.text, '900', 'left', 'Inter'),
    text(200, 192, 80, 28, '/ 100', 22, C.muted, '400'),
    text(36, 230, 300, 18, 'Good · Ready to train hard', 14, C.gold, '700'),

    text(20, 262, 200, 16, 'SIGNALS', 10, C.muted, '600'),
    ...progressBar(20, 280, FW - 40, 'Sleep Quality', 82, C.gold),
    ...progressBar(20, 326, FW - 40, 'HRV Score', 74, C.ember),
    ...progressBar(20, 372, FW - 40, 'Muscle Soreness (inverse)', 90, C.gold),
    ...progressBar(20, 418, FW - 40, 'Energy Level', 88, C.ember),

    text(20, 476, FW - 40, 16, 'RECOMMENDATION', 10, C.muted, '600'),
    rect(20, 494, FW - 40, 72, C.surface),
    rect(20, 494, 3, 72, C.gold),
    text(36, 506, FW - 76, 16, '✦ High readiness. Run Push Day A as planned.', 13, C.text, '600'),
    text(36, 526, FW - 76, 32, 'Prioritise compound lifts early. Target new bench PR at 105 kg. Sleep +30 min tonight.', 12, C.muted, '400'),

    rect(0, FH - 80, FW, 80, C.surface),
    rect(0, FH - 80, FW, 1, C.border),
    ...navBar(4),
  ];
  return frame(1400, 0, FW, FH, C.bg, children);
}

// ─── nav bar ──────────────────────────────────────────────────────────────────
const NAV = ['Today', 'Programs', 'History', 'Progress', 'Recovery'];
function navBar(active) {
  const els = [];
  NAV.forEach((label, i) => {
    const nx = Math.round(i * (FW / NAV.length));
    const nw = Math.round(FW / NAV.length);
    const isActive = i === active;
    if (isActive) els.push(rect(nx, FH - 80, nw, 2, C.ember));
    els.push(text(nx, FH - 56, nw, 14, label, 10, isActive ? C.ember : C.muted, isActive ? '700' : '400', 'center'));
  });
  return els;
}

// ─── assemble pen ─────────────────────────────────────────────────────────────
const pen = {
  version:  '2.8',
  name:     'GRIT — Brutalist Strength Tracker',
  width:    1800,
  height:   FH,
  fill:     C.bg,
  children: [
    screenToday(),
    screenPrograms(),
    screenHistory(),
    screenProgress(),
    screenRecovery(),
  ],
};

fs.writeFileSync(path.join(__dirname, 'grit.pen'), JSON.stringify(pen, null, 2));
console.log('✓ grit.pen written —', pen.children.length, 'screens');
