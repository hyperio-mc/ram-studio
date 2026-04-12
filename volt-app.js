// VOLT — Know Your Energy
// Athlete biometrics & energy tracking app
// Dark theme: #0B0C12 bg, #CAFF00 volt-yellow accent
// Inspired by Fluid Glass (Awwwards SOTD) + Mortons "Created by light" (DarkModeDesign)

const fs = require('fs');

const W = 390, H = 844;

function pen(id, name, bg, elements) {
  return { id, name, backgroundColor: bg, width: W, height: H, elements };
}

function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, width: w, height: h,
    fill, opacity: opts.opacity ?? 1,
    cornerRadius: opts.r ?? 0,
    stroke: opts.stroke, strokeWidth: opts.strokeWidth ?? 1,
  };
}

function text(content, x, y, size, color, opts = {}) {
  return {
    type: 'text', content, x, y,
    fontSize: size, color,
    fontWeight: opts.weight ?? 400,
    fontFamily: opts.font ?? 'Inter',
    textAlign: opts.align ?? 'left',
    width: opts.w ?? 320,
    opacity: opts.opacity ?? 1,
    letterSpacing: opts.ls ?? 0,
  };
}

function circle(cx, cy, r, fill, opts = {}) {
  return {
    type: 'ellipse',
    x: cx - r, y: cy - r,
    width: r * 2, height: r * 2,
    fill,
    stroke: opts.stroke, strokeWidth: opts.strokeWidth ?? 2,
    opacity: opts.opacity ?? 1,
  };
}

function line(x1, y1, x2, y2, color, w = 1, opacity = 1) {
  return {
    type: 'line', x1, y1, x2, y2,
    stroke: color, strokeWidth: w, opacity,
  };
}

// ── PALETTE ─────────────────────────────────────
const BG      = '#0B0C12';
const SURF    = '#13141E';
const SURF2   = '#1C1D2C';
const VOLT    = '#CAFF00';  // electric yellow-green
const STRAIN  = '#FF4C60';  // strain / high intensity red
const BLUE    = '#4C9FFF';  // recovery blue
const TEXT    = '#F0F0FA';
const MUTED   = 'rgba(240,240,250,0.45)';
const DIM     = 'rgba(240,240,250,0.18)';

// ── STATUS BAR ───────────────────────────────────
function statusBar() {
  return [
    text('9:41', 16, 14, 12, TEXT, { weight: 600, w: 60 }),
    text('●●●  ▶  ▮▮▮', 290, 14, 10, TEXT, { w: 100, align: 'right' }),
  ];
}

// ── NAV BAR ──────────────────────────────────────
function navBar(active) {
  const items = [
    { label: 'Today',    icon: '⚡', id: 0 },
    { label: 'Train',    icon: '◈',  id: 1 },
    { label: 'Recovery', icon: '◑',  id: 2 },
    { label: 'Body',     icon: '◎',  id: 3 },
    { label: 'Insights', icon: '✦',  id: 4 },
  ];
  const els = [
    rect(0, H - 76, W, 76, SURF, { r: 0 }),
    line(0, H - 76, W, H - 76, DIM, 1),
  ];
  items.forEach((item, i) => {
    const x = 16 + i * 73;
    const isActive = i === active;
    els.push(text(item.icon, x + 12, H - 60, 18, isActive ? VOLT : MUTED, { w: 30, align: 'center' }));
    els.push(text(item.label, x, H - 36, 9, isActive ? VOLT : MUTED, { w: 54, align: 'center', weight: isActive ? 600 : 400 }));
    if (isActive) {
      els.push(rect(x + 18, H - 76, 18, 2, VOLT, { r: 1 }));
    }
  });
  return els;
}

// ── SCREEN 1: TODAY ─────────────────────────────
function screenToday() {
  const els = [
    rect(0, 0, W, H, BG),
    ...statusBar(),

    // Header
    text('VOLT', 20, 44, 11, VOLT, { weight: 700, ls: 3 }),
    text('SAT, APR 4', 20, 60, 10, MUTED, { ls: 1 }),
    // settings icon
    text('⚙', 350, 44, 18, MUTED, { w: 30 }),

    // Readiness ring hero
    // Outer glow ring (simulated with concentric circles)
    circle(195, 210, 90, 'transparent', { stroke: 'rgba(202,255,0,0.08)', strokeWidth: 18 }),
    circle(195, 210, 90, 'transparent', { stroke: 'rgba(202,255,0,0.15)', strokeWidth: 12 }),
    circle(195, 210, 90, 'transparent', { stroke: DIM, strokeWidth: 2 }),
    circle(195, 210, 74, 'transparent', { stroke: VOLT, strokeWidth: 8 }),
    // Center readiness score
    text('88', 140, 186, 52, TEXT, { weight: 700, w: 110, align: 'center' }),
    text('READINESS', 140, 242, 9, VOLT, { weight: 700, ls: 2, w: 110, align: 'center' }),

    // Status label
    rect(141, 264, 108, 22, 'rgba(202,255,0,0.12)', { r: 11 }),
    text('PEAK — READY TO PUSH', 147, 269, 8, VOLT, { weight: 700, ls: 1, w: 96, align: 'center' }),

    // Key metrics row
    rect(16, 300, 110, 72, SURF, { r: 12 }),
    text('HRV', 26, 312, 9, MUTED, { weight: 600, ls: 1 }),
    text('68', 26, 328, 28, TEXT, { weight: 700 }),
    text('ms  ↑4', 26, 358, 9, VOLT, { weight: 600 }),

    rect(140, 300, 110, 72, SURF, { r: 12 }),
    text('SLEEP', 150, 312, 9, MUTED, { weight: 600, ls: 1 }),
    text('7h 42m', 150, 328, 22, TEXT, { weight: 700 }),
    text('Deep 1h 28m', 150, 358, 9, MUTED),

    rect(264, 300, 110, 72, SURF, { r: 12 }),
    text('STRAIN', 274, 312, 9, MUTED, { weight: 600, ls: 1 }),
    text('11.2', 274, 328, 28, TEXT, { weight: 700 }),
    text('Recovery day', 274, 358, 9, BLUE, { weight: 600 }),

    // Recommendation card
    rect(16, 386, 358, 80, SURF, { r: 14 }),
    rect(16, 386, 4, 80, VOLT, { r: 2 }),
    text('⚡  Today\'s Recommendation', 28, 398, 10, VOLT, { weight: 700, ls: 0.5 }),
    text('Your body is primed. HRV 14% above baseline — ideal\nfor a high-intensity session or race simulation.', 28, 415, 11, TEXT, { w: 340 }),
    text('See plan  →', 28, 452, 10, VOLT, { weight: 600 }),

    // Activity timeline
    text('ACTIVITY LOG', 20, 482, 9, MUTED, { weight: 700, ls: 2 }),
    // timeline items
    ...[
      { time: '6:15 AM', label: 'Morning run', sub: '8.2 km · 52:10 · HR avg 152', strain: '9.8', color: STRAIN },
      { time: '11:00 AM', label: 'Mobility session', sub: '22 min · stretching focus', strain: '2.1', color: VOLT },
      { time: '3:30 PM', label: 'Walking', sub: '4,230 steps', strain: '1.4', color: BLUE },
    ].flatMap((item, i) => {
      const y = 498 + i * 58;
      return [
        rect(16, y, 358, 50, SURF, { r: 10 }),
        text(item.time, 28, y + 9, 9, MUTED),
        text(item.label, 28, y + 22, 12, TEXT, { weight: 600 }),
        text(item.sub, 28, y + 36, 9, MUTED),
        text(item.strain, 316, y + 14, 16, item.color, { weight: 700, w: 50 }),
        text('STRAIN', 314, y + 33, 7, MUTED, { ls: 1, w: 54 }),
      ];
    }),

    ...navBar(0),
  ];
  return pen('today', 'Today', BG, els);
}

// ── SCREEN 2: TRAINING ───────────────────────────
function screenTrain() {
  const els = [
    rect(0, 0, W, H, BG),
    ...statusBar(),

    text('TRAINING', 20, 44, 11, VOLT, { weight: 700, ls: 3 }),
    text('Active session', 20, 60, 10, MUTED, { ls: 0.5 }),

    // Live strain gauge
    text('LIVE STRAIN', 20, 90, 9, MUTED, { weight: 700, ls: 2 }),
    rect(16, 106, 358, 10, SURF2, { r: 5 }),
    rect(16, 106, 238, 10, STRAIN, { r: 5 }),  // 66% of session
    text('14.7', 20, 124, 36, STRAIN, { weight: 700 }),
    text('/ 21.0 max', 120, 134, 11, MUTED, { w: 120 }),
    text('HIGH', 310, 120, 10, STRAIN, { weight: 700, w: 60 }),

    // Heart rate hero
    rect(16, 170, 358, 90, SURF, { r: 14 }),
    text('HEART RATE', 28, 182, 9, MUTED, { weight: 600, ls: 1 }),
    text('172', 28, 198, 40, STRAIN, { weight: 700 }),
    text('bpm', 110, 218, 12, MUTED, { w: 40 }),
    text('MAX 188  ·  AVG 164', 28, 248, 9, MUTED),
    // mini zone bar
    ...[
      { label: 'Z1', pct: 5, color: BLUE },
      { label: 'Z2', pct: 12, color: '#4CFFB0' },
      { label: 'Z3', pct: 25, color: VOLT },
      { label: 'Z4', pct: 38, color: '#FF9A3C' },
      { label: 'Z5', pct: 20, color: STRAIN },
    ].reduce((acc, z, i) => {
      const totalW = 200;
      const prevPct = [0, 5, 17, 42, 80][i];
      return [
        ...acc,
        rect(200 + prevPct * 1.6, 195, z.pct * 1.6, 22, z.color, { r: 2, opacity: 0.85 }),
        text(z.label, 200 + prevPct * 1.6, 220, 7, z.color, { w: 20 }),
      ];
    }, []),

    // Workout details grid
    text('SESSION STATS', 20, 272, 9, MUTED, { weight: 700, ls: 2 }),
    ...[
      { label: 'Duration', val: '48:22', unit: '' },
      { label: 'Distance', val: '9.4', unit: 'km' },
      { label: 'Elevation', val: '142', unit: 'm ↑' },
      { label: 'Cadence', val: '176', unit: 'spm' },
      { label: 'Calories', val: '620', unit: 'kcal' },
      { label: 'Pace', val: '5:08', unit: '/km' },
    ].map((s, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = col === 0 ? 16 : 204;
      const y = 288 + row * 72;
      return [
        rect(x, y, 170, 62, SURF, { r: 12 }),
        text(s.label, x + 12, y + 10, 9, MUTED, { weight: 600 }),
        text(s.val, x + 12, y + 26, 24, TEXT, { weight: 700 }),
        text(s.unit, x + 12 + (s.val.length * 14), y + 36, 10, MUTED, { w: 60 }),
      ];
    }).flat(),

    // End workout CTA
    rect(16, 726, 358, 46, STRAIN, { r: 23 }),
    text('⏹  Finish Workout', 100, 741, 14, '#0B0C12', { weight: 700, w: 190, align: 'center' }),

    ...navBar(1),
  ];
  return pen('train', 'Training', BG, els);
}

// ── SCREEN 3: RECOVERY ───────────────────────────
function screenRecovery() {
  const hrv = [52, 58, 61, 55, 63, 66, 68];
  const labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const chartH = 80, chartW = 330, chartX = 28, chartY = 290;
  const maxV = 75, minV = 48;
  const points = hrv.map((v, i) => ({
    x: chartX + i * (chartW / 6),
    y: chartY + chartH - ((v - minV) / (maxV - minV)) * chartH,
  }));

  const els = [
    rect(0, 0, W, H, BG),
    ...statusBar(),

    text('RECOVERY', 20, 44, 11, VOLT, { weight: 700, ls: 3 }),
    text('Last night data loaded', 20, 60, 10, MUTED),

    // Recovery score
    rect(16, 80, 174, 90, SURF, { r: 14 }),
    text('RECOVERY', 28, 92, 9, MUTED, { weight: 700, ls: 1 }),
    text('76%', 28, 108, 36, VOLT, { weight: 700 }),
    text('Green zone', 28, 148, 9, VOLT, { weight: 600 }),

    rect(204, 80, 170, 90, SURF, { r: 14 }),
    text('RESTING HR', 216, 92, 9, MUTED, { weight: 700, ls: 1 }),
    text('48', 216, 108, 36, BLUE, { weight: 700 }),
    text('bpm  −2 from avg', 216, 148, 9, MUTED),

    // HRV 7-day chart
    rect(16, 184, 358, 118, SURF, { r: 14 }),
    text('HRV — 7 DAYS', 28, 196, 9, MUTED, { weight: 700, ls: 1 }),
    text('68 ms', 300, 196, 10, VOLT, { weight: 700, w: 68, align: 'right' }),
    // chart lines
    ...points.slice(0, -1).map((p, i) => line(p.x, p.y, points[i + 1].x, points[i + 1].y, VOLT, 2)),
    // chart dots
    ...points.map((p, i) => circle(p.x, p.y, i === 6 ? 5 : 3, i === 6 ? VOLT : 'rgba(202,255,0,0.4)')),
    // day labels
    ...labels.map((l, i) => text(l, chartX + i * (chartW / 6) - 6, chartY + chartH + 8, 9, MUTED, { w: 16, align: 'center' })),

    // Sleep breakdown
    text('SLEEP BREAKDOWN', 20, 316, 9, MUTED, { weight: 700, ls: 2 }),
    rect(16, 332, 358, 78, SURF, { r: 14 }),
    // Sleep stage bar
    rect(28, 344, 264, 14, 'rgba(240,240,250,0.1)', { r: 7 }),
    rect(28, 344, 60, 14, '#1A4FFF', { r: 7 }),   // REM
    rect(88, 344, 85, 14, BLUE, { r: 0 }),          // Deep
    rect(173, 344, 119, 14, SURF2, { r: 7 }),       // Light
    // legend
    text('● REM  1h 12m', 28, 364, 9, '#6B8FFF', { weight: 500 }),
    text('● Deep  1h 28m', 28, 378, 9, BLUE, { weight: 500 }),
    text('● Light  2h 46m', 28, 392, 9, MUTED, { weight: 500 }),
    text('7h 42', 308, 340, 20, TEXT, { weight: 700, w: 60 }),
    text('hrs', 308, 360, 9, MUTED, { w: 40 }),

    // Stress load
    text('STRESS LOAD — TODAY', 20, 424, 9, MUTED, { weight: 700, ls: 2 }),
    rect(16, 440, 358, 52, SURF, { r: 12 }),
    // Stress timeline bars (hourly)
    ...[0.2, 0.3, 0.5, 0.7, 0.9, 0.6, 0.4, 0.3, 0.2, 0.5, 0.8, 0.6].map((v, i) => {
      const h = v * 30;
      return rect(28 + i * 27, 480 - h, 18, h, v > 0.7 ? STRAIN : v > 0.4 ? VOLT : BLUE, { r: 3, opacity: 0.8 });
    }),
    text('6AM', 28, 494, 8, MUTED, { w: 30 }),
    text('12PM', 140, 494, 8, MUTED, { w: 36 }),
    text('6PM', 310, 494, 8, MUTED, { w: 30 }),

    // Breathing score
    rect(16, 508, 174, 70, SURF, { r: 12 }),
    text('BREATHING', 28, 520, 9, MUTED, { weight: 700, ls: 1 }),
    text('14.3', 28, 536, 26, BLUE, { weight: 700 }),
    text('breaths/min', 28, 562, 9, MUTED),

    rect(204, 508, 170, 70, SURF, { r: 12 }),
    text('SKIN TEMP', 216, 520, 9, MUTED, { weight: 700, ls: 1 }),
    text('+0.2°', 216, 536, 26, TEXT, { weight: 700 }),
    text('Baseline normal', 216, 562, 9, MUTED),

    // Tomorrow forecast
    rect(16, 590, 358, 64, 'rgba(76,159,255,0.1)', { r: 14 }),
    rect(16, 590, 4, 64, BLUE, { r: 2 }),
    text('◑  Tomorrow Forecast', 28, 602, 10, BLUE, { weight: 700 }),
    text('If sleep hits 7h30m+ you\'ll wake green. Avoid alcohol\nand late training to protect HRV gains.', 28, 618, 11, TEXT, { w: 336 }),

    ...navBar(2),
  ];
  return pen('recovery', 'Recovery', BG, els);
}

// ── SCREEN 4: BODY ───────────────────────────────
function screenBody() {
  const weights = [82.4, 82.1, 81.8, 82.0, 81.6, 81.4, 81.2];
  const wLabels = ['Mar 29', 'Mar 30', 'Mar 31', 'Apr 1', 'Apr 2', 'Apr 3', 'Apr 4'];
  const chartH = 70, chartX = 28, chartY = 248;
  const maxW = 82.5, minW = 81.0;
  const wPoints = weights.map((v, i) => ({
    x: chartX + i * (320 / 6),
    y: chartY + chartH - ((v - minW) / (maxW - minW)) * chartH,
  }));

  const els = [
    rect(0, 0, W, H, BG),
    ...statusBar(),

    text('BODY', 20, 44, 11, VOLT, { weight: 700, ls: 3 }),
    text('Composition tracking', 20, 60, 10, MUTED, { ls: 0.5 }),

    // Weight hero
    text('81.2', 20, 96, 56, TEXT, { weight: 700 }),
    text('kg', 164, 122, 16, MUTED, { w: 40 }),
    text('↓ 1.2 kg this month', 20, 152, 11, VOLT, { weight: 600 }),
    text('Goal: 79.5 kg  ·  1.7 kg to go', 20, 168, 10, MUTED),

    // Weight chart
    rect(16, 190, 358, 120, SURF, { r: 14 }),
    text('7-DAY TREND', 28, 202, 9, MUTED, { weight: 700, ls: 1 }),
    // reference line
    line(chartX, chartY + chartH * 0.4, chartX + 326, chartY + chartH * 0.4, DIM, 1),
    // area fill (simulated with thin rect)
    rect(chartX, chartY + chartH * 0.4, 326, chartH * 0.6, 'rgba(202,255,0,0.04)', { r: 0 }),
    // line segments
    ...wPoints.slice(0, -1).map((p, i) => line(p.x, p.y, wPoints[i + 1].x, wPoints[i + 1].y, VOLT, 2)),
    // dots
    ...wPoints.map((p, i) => circle(p.x, p.y, i === 6 ? 5 : 3, i === 6 ? VOLT : 'rgba(202,255,0,0.4)')),
    // week labels (every other)
    text('Mar 29', chartX - 8, chartY + chartH + 8, 8, MUTED, { w: 40 }),
    text('Apr 1', chartX + 160, chartY + chartH + 8, 8, MUTED, { w: 36 }),
    text('Today', chartX + 306, chartY + chartH + 8, 8, VOLT, { weight: 600, w: 36 }),

    // Body composition
    text('COMPOSITION', 20, 328, 9, MUTED, { weight: 700, ls: 2 }),
    rect(16, 344, 358, 88, SURF, { r: 14 }),
    // body fat bar
    text('Body fat', 28, 356, 9, MUTED),
    text('14.2%', 310, 356, 10, TEXT, { weight: 600, w: 60, align: 'right' }),
    rect(28, 368, 326, 8, DIM, { r: 4 }),
    rect(28, 368, 46, 8, VOLT, { r: 4 }),
    // muscle mass bar
    text('Muscle mass', 28, 382, 9, MUTED),
    text('65.8 kg', 310, 382, 10, TEXT, { weight: 600, w: 60, align: 'right' }),
    rect(28, 394, 326, 8, DIM, { r: 4 }),
    rect(28, 394, 232, 8, BLUE, { r: 4 }),
    // water
    text('Hydration', 28, 408, 9, MUTED),
    text('61%', 310, 408, 10, TEXT, { weight: 600, w: 60, align: 'right' }),
    rect(28, 420, 326, 8, DIM, { r: 4 }),
    rect(28, 420, 199, 8, '#4CFFB0', { r: 4 }),

    // Muscle activation tags
    text('MUSCLE ACTIVITY — LAST 7 DAYS', 20, 446, 9, MUTED, { weight: 700, ls: 1 }),
    ...[
      { label: 'Quads', pct: 92, color: STRAIN },
      { label: 'Hamstrings', pct: 74, color: VOLT },
      { label: 'Calves', pct: 88, color: STRAIN },
      { label: 'Core', pct: 60, color: BLUE },
      { label: 'Shoulders', pct: 32, color: MUTED },
      { label: 'Back', pct: 45, color: MUTED },
    ].flatMap((m, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const x = col === 0 ? 16 : 198;
      const y = 462 + row * 44;
      const w = 174;
      return [
        rect(x, y, w, 36, SURF, { r: 10 }),
        text(m.label, x + 12, y + 7, 9, MUTED, { weight: 600 }),
        rect(x + 12, y + 22, w - 24, 5, DIM, { r: 2 }),
        rect(x + 12, y + 22, Math.floor((w - 24) * m.pct / 100), 5, m.color, { r: 2 }),
        text(`${m.pct}%`, x + w - 32, y + 7, 9, m.color, { weight: 700, w: 28, align: 'right' }),
      ];
    }),

    // Log entry CTA
    rect(16, 674, 358, 46, SURF2, { r: 23 }),
    text('+ Log measurement', 100, 690, 13, VOLT, { weight: 600, w: 190, align: 'center' }),

    ...navBar(3),
  ];
  return pen('body', 'Body', BG, els);
}

// ── SCREEN 5: INSIGHTS ───────────────────────────
function screenInsights() {
  const insights = [
    {
      icon: '⚡',
      title: 'HRV climbing — 3-week high',
      body: 'Your HRV has risen 18% over 21 days. Your structured easy weeks are paying off. Maintain this periodization pattern.',
      tag: 'Trending up',
      tagColor: VOLT,
    },
    {
      icon: '◑',
      title: 'Sleep consistency improving',
      body: 'Average bed time: 10:42 PM (±18 min) — down from ±52 min last month. Consistency drives better recovery windows.',
      tag: 'Positive habit',
      tagColor: BLUE,
    },
    {
      icon: '⚠',
      title: 'Strain:Recovery ratio at limit',
      body: 'Last 5 days: avg strain 13.4 against recovery avg 71%. Pushing over 14 strain tomorrow risks a recovery debt.',
      tag: 'Watch closely',
      tagColor: STRAIN,
    },
  ];

  const els = [
    rect(0, 0, W, H, BG),
    ...statusBar(),

    text('INSIGHTS', 20, 44, 11, VOLT, { weight: 700, ls: 3 }),
    text('AI pattern analysis', 20, 60, 10, MUTED),

    // Streak + week summary
    rect(16, 80, 174, 70, SURF, { r: 14 }),
    text('ACTIVE STREAK', 28, 92, 9, MUTED, { weight: 700, ls: 1 }),
    text('14', 28, 108, 36, VOLT, { weight: 700 }),
    text('days', 88, 122, 12, MUTED, { w: 40 }),

    rect(204, 80, 170, 70, SURF, { r: 14 }),
    text('THIS WEEK', 216, 92, 9, MUTED, { weight: 700, ls: 1 }),
    text('4 / 5', 216, 108, 30, TEXT, { weight: 700 }),
    text('sessions done', 216, 142, 9, MUTED),

    // Weekly dots
    rect(16, 162, 358, 42, SURF, { r: 12 }),
    ...[
      { day: 'M', done: true },
      { day: 'T', done: true },
      { day: 'W', done: true },
      { day: 'T', done: false },
      { day: 'F', done: true },
      { day: 'S', done: false },
      { day: 'S', done: false },
    ].flatMap((d, i) => [
      circle(46 + i * 46, 183, 12, d.done ? VOLT : SURF2),
      text(d.day, 40 + i * 46, 178, 9, d.done ? '#0B0C12' : MUTED, { w: 12, align: 'center', weight: d.done ? 700 : 400 }),
    ]),

    // Insights cards
    text('AI INSIGHTS', 20, 218, 9, MUTED, { weight: 700, ls: 2 }),
    ...insights.flatMap((ins, i) => {
      const y = 234 + i * 128;
      return [
        rect(16, y, 358, 118, SURF, { r: 14 }),
        rect(16, y, 4, 118, ins.tagColor, { r: 2 }),
        text(ins.icon, 30, y + 12, 16, ins.tagColor, { w: 26 }),
        text(ins.title, 56, y + 12, 13, TEXT, { weight: 700, w: 280 }),
        rect(56, y + 30, 76, 16, `rgba(${ins.tagColor === VOLT ? '202,255,0' : ins.tagColor === BLUE ? '76,159,255' : '255,76,96'},0.15)`, { r: 8 }),
        text(ins.tag, 60, y + 33, 8, ins.tagColor, { weight: 700, ls: 0.5, w: 68 }),
        text(ins.body, 28, y + 54, 11, MUTED, { w: 330 }),
      ];
    }),

    // Next milestone
    rect(16, 622, 358, 60, 'rgba(202,255,0,0.07)', { r: 14 }),
    text('✦  Next milestone', 28, 634, 10, VOLT, { weight: 700 }),
    text('21-day streak in 7 days  ·  HRV personal best within reach', 28, 650, 11, TEXT, { w: 330 }),
    text('Track →', 28, 666, 10, VOLT, { weight: 600 }),

    ...navBar(4),
  ];
  return pen('insights', 'Insights', BG, els);
}

// ── ASSEMBLE .PEN FILE ───────────────────────────
const penFile = {
  version: '2.8',
  name: 'VOLT — Know Your Energy',
  description: 'Athlete biometrics & energy tracking. Dark #0B0C12 + volt-yellow #CAFF00. Inspired by Fluid Glass (Awwwards SOTD) and Mortons "Created by light" (DarkModeDesign) — premium dark product aesthetic with singular glowing accent.',
  screens: [
    screenToday(),
    screenTrain(),
    screenRecovery(),
    screenBody(),
    screenInsights(),
  ],
};

fs.writeFileSync('volt.pen', JSON.stringify(penFile, null, 2));
const sz = (fs.statSync('volt.pen').size / 1024).toFixed(1);
console.log(`✓ volt.pen written — ${sz} KB, ${penFile.screens.length} screens`);
