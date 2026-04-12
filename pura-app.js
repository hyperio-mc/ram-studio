'use strict';
// pura-app.js
// PURA — Skincare ritual tracker
// Heartbeat #12 — inspired by Aevi Skincare (liveaevi.com) warm-minimal editorial aesthetic
// Research source: Land-Book / Godly — warm off-white, muted indigo, 300-weight type
//
// Counter-trend to RAM's dark-heavy portfolio. First warm, light-mode design system.
// Palette: warm off-white + muted indigo + light slate + hairline borders

const fs   = require('fs');
const path = require('path');

// ── IDs ───────────────────────────────────────────────────────────────────────
let _id = 0;
const uid = (p = 'p') => `${p}${++_id}`;

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:     '#F7F3EE',   // warm off-white (Aevi-inspired)
  cream:  '#EDE8DF',   // surface / card bg
  rule:   '#D8D2C8',   // hairline border
  ink:    '#1C1917',   // near-black warm text
  stone:  '#7A7068',   // secondary text / muted
  dust:   '#B5AFA7',   // tertiary / placeholder
  blue:   '#2A4ABB',   // muted indigo — primary accent
  slate:  '#8BA5C4',   // light blue-grey — secondary
  rose:   '#C4907A',   // warm rose / ritual accent
  sage:   '#7A9B84',   // botanical green / progress
};

// ── Primitives ────────────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill || C.bg,
  clip: opts.clip !== undefined ? opts.clip : false,
  ...(opts.r !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.ch || [],
});

const T = (content, x, y, w, h, opts = {}) => ({
  id: uid(), type: 'text', content, x, y, width: w, height: h,
  textGrowth: 'fixed-width-height',
  fontSize: opts.size || 13,
  fontWeight: String(opts.weight || 300),
  fill: opts.fill || C.ink,
  textAlign: opts.align || 'left',
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh !== undefined ? { lineHeight: opts.lh } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h,
  fill: fill || C.ink,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

// Hairline horizontal rule
const Rule = (x, y, w, opacity = 0.4) =>
  F(x, y, w, 1, C.rule, { opacity });

// Pill badge
const Pill = (label, x, y, bg, fg, w) => {
  const pw = w || (label.length * 6.5 + 20);
  return F(x, y, pw, 22, bg, {
    r: 11,
    ch: [T(label, 10, 4, pw - 20, 14, { size: 9, fill: fg, weight: 500, ls: 0.8 })],
  });
};

// Ritual progress ring — filled arc via layered ellipses (approximation using opacity)
const Ring = (cx, cy, r, progress, trackColor, fillColor) => {
  const rings = [
    E(cx - r, cy - r, r * 2, r * 2, trackColor, { opacity: 0.25 }),
  ];
  // Simulate progress: stack filled wedges as opaque arc fill
  // Use a frame with colored arc approximated by opacity wedges
  // For pen format, we layer concentric ellipses + center fill
  const outer = r;
  const inner = r - 8;
  rings.push(E(cx - outer, cy - outer, outer * 2, outer * 2, trackColor, { opacity: 0.15 }));
  // Progress fill — approximate with a sector using frame clip
  // Use a colored ring filled from 0 to progress angle:
  // Technique: draw full ring in accent color, then cover the "empty" portion
  // with background color arc. Simplified: draw colored full ring + bg partial cover
  rings.push(E(cx - outer, cy - outer, outer * 2, outer * 2, fillColor, { opacity: progress }));
  // Donut hole
  rings.push(E(cx - inner, cy - inner, inner * 2, inner * 2, C.bg));
  return rings;
};

// Step indicator row
const StepRow = (x, y, w, num, title, duration, done) => {
  const check = done
    ? F(x, y + 2, 18, 18, C.sage, { r: 9, ch: [T('✓', 4, 2, 10, 14, { size: 9, fill: '#fff', weight: 600 })] })
    : F(x, y + 2, 18, 18, 'none', { r: 9, stroke: C.rule, sw: 1.5 });
  return [
    check,
    T(num, x + 26, y, 20, 18, { size: 9, fill: C.dust, weight: 400, ls: 0.5 }),
    T(title, x + 44, y, w - 100, 18, { size: 12, fill: done ? C.stone : C.ink, weight: done ? 300 : 400, opacity: done ? 0.6 : 1 }),
    T(duration, x + w - 48, y + 2, 44, 14, { size: 10, fill: C.dust, weight: 300, align: 'right' }),
  ];
};

// Product card (compact)
const ProductCard = (x, y, w, h, name, brand, tag, tagColor) => F(x, y, w, h, C.cream, {
  r: 10,
  ch: [
    // swatch square
    F(12, 12, h - 24, h - 24, C.rule, { r: 6 }),
    T(brand, h - 8, 14, w - h - 12, 12, { size: 8, fill: C.stone, weight: 300, ls: 0.8 }),
    T(name, h - 8, 28, w - h - 12, 16, { size: 12, fill: C.ink, weight: 400 }),
    Pill(tag, h - 8, h - 26, tagColor + '22', tagColor, 50),
  ],
});

// Ingredient row
const IngRow = (x, y, w, name, rating, ratingColor) => [
  Rule(x, y, w),
  T(name, x, y + 10, w - 80, 16, { size: 12, fill: C.ink, weight: 300 }),
  T(rating, x + w - 70, y + 10, 70, 16, { size: 10, fill: ratingColor, weight: 500, align: 'right', ls: 0.3 }),
];

// ── MOBILE SCREEN BUILDER (390 × 844) ────────────────────────────────────────
const MW = 390, MH = 844;

// ── M1: Home — Daily ritual overview ─────────────────────────────────────────
function mHome() {
  const date = T('TUESDAY, 18 MAR', 20, 60, MW - 40, 14, { size: 9, fill: C.stone, weight: 300, ls: 2 });
  const greeting = T('Good morning,\nClara.', 20, 80, MW - 40, 80, { size: 34, fill: C.ink, weight: 300, lh: 1.2 });

  // Today's rings
  const morningRings = Ring(90, 240, 42, 0.75, C.blue, C.blue);
  const eveningRings = Ring(200, 240, 42, 0.30, C.rose, C.rose);
  const weekRings    = Ring(310, 240, 42, 0.57, C.sage, C.sage);

  const mLabel = T('MORNING', 64, 292, 52, 12, { size: 8, fill: C.stone, weight: 300, ls: 1, align: 'center' });
  const eLabel = T('EVENING', 174, 292, 52, 12, { size: 8, fill: C.stone, weight: 300, ls: 1, align: 'center' });
  const wLabel = T('WEEKLY', 284, 292, 52, 12, { size: 8, fill: C.stone, weight: 300, ls: 1, align: 'center' });
  const mPct   = T('75%', 71, 230, 38, 20, { size: 14, fill: C.blue, weight: 400, align: 'center' });
  const ePct   = T('30%', 181, 230, 38, 20, { size: 14, fill: C.rose, weight: 400, align: 'center' });
  const wPct   = T('4/7', 291, 230, 38, 20, { size: 14, fill: C.sage, weight: 400, align: 'center' });

  // Next step
  const nextRule = Rule(20, 328, MW - 40);
  const nextLabel = T('NEXT UP', 20, 340, 80, 12, { size: 9, fill: C.stone, weight: 300, ls: 2 });
  const nextCard  = F(20, 360, MW - 40, 72, C.cream, {
    r: 10,
    ch: [
      T('Vitamin C Serum', 16, 14, 200, 16, { size: 13, fill: C.ink, weight: 400 }),
      T('Step 3 · Morning', 16, 34, 160, 12, { size: 10, fill: C.stone, weight: 300 }),
      F(MW - 80, 20, 60, 32, C.blue, { r: 8, ch: [T('START', 10, 9, 40, 14, { size: 9, fill: '#fff', weight: 600, ls: 1.5 })] }),
    ],
  });

  // Skin diary quick-log
  const logRule  = Rule(20, 450, MW - 40);
  const logLabel = T('TODAY\'S LOG', 20, 462, 120, 12, { size: 9, fill: C.stone, weight: 300, ls: 2 });
  const feel1 = Pill('HYDRATED', 20, 484, C.sage + '20', C.sage, 80);
  const feel2 = Pill('BALANCED', 110, 484, C.blue + '20', C.blue, 80);
  const feel3 = Pill('+ ADD', 200, 484, C.cream, C.dust, 60);

  // Recent products
  const prodRule  = Rule(20, 524, MW - 40);
  const prodLabel = T('RECENTLY USED', 20, 536, 140, 12, { size: 9, fill: C.stone, weight: 300, ls: 2 });
  const prod1 = ProductCard(20, 556, 165, 60, 'Gentle Cleanser', 'CETAPHIL', 'CLEANSER', C.blue);
  const prod2 = ProductCard(195, 556, 165, 60, 'Vit C Serum', 'MAELOVE', 'SERUM', C.rose);

  // Nav bar
  const nav = F(0, MH - 80, MW, 80, C.bg, {
    stroke: C.rule, sw: 1, sw_top_only: true,
    ch: [
      T('⬛', 40, 16, 30, 20, { size: 20, fill: C.blue, align: 'center' }),
      T('□', 130, 16, 30, 20, { size: 20, fill: C.dust, align: 'center' }),
      T('◯', 220, 16, 30, 20, { size: 20, fill: C.dust, align: 'center' }),
      T('≡', 310, 16, 30, 20, { size: 20, fill: C.dust, align: 'center' }),
      T('HOME', 28, 38, 54, 10, { size: 8, fill: C.blue, weight: 500, ls: 1, align: 'center' }),
      T('RITUAL', 118, 38, 54, 10, { size: 8, fill: C.dust, weight: 300, ls: 1, align: 'center' }),
      T('LOG', 208, 38, 54, 10, { size: 8, fill: C.dust, weight: 300, ls: 1, align: 'center' }),
      T('LIBRARY', 298, 38, 54, 10, { size: 8, fill: C.dust, weight: 300, ls: 1, align: 'center' }),
    ],
  });

  return F(0, 0, MW, MH, C.bg, { type: 'frame', ch: [
    date, greeting,
    ...morningRings, ...eveningRings, ...weekRings,
    mLabel, eLabel, wLabel, mPct, ePct, wPct,
    nextRule, nextLabel, nextCard,
    logRule, logLabel, feel1, feel2, feel3,
    prodRule, prodLabel, prod1, prod2,
    nav,
  ]});
}

// ── M2: Morning Ritual ────────────────────────────────────────────────────────
function mRitual() {
  const header = T('MORNING RITUAL', 20, 60, MW - 40, 14, { size: 9, fill: C.stone, weight: 300, ls: 2 });
  const title  = T('7-step\nroutine', 20, 80, MW - 40, 80, { size: 34, fill: C.ink, weight: 300, lh: 1.2 });
  const progress = T('Step 3 of 7 · 12 min left', 20, 170, MW - 40, 16, { size: 11, fill: C.stone, weight: 300 });

  // Progress bar
  const barBg   = F(20, 194, MW - 40, 3, C.rule, { r: 2 });
  const barFill = F(20, 194, (MW - 40) * 0.43, 3, C.blue, { r: 2 });

  const r1 = Rule(20, 214, MW - 40);
  const steps = [
    StepRow(20, 224, MW - 40, '01', 'Double Cleanse', '3 min', true),
    Rule(20, 252, MW - 40, 0.2),
    StepRow(20, 262, MW - 40, '02', 'Toner', '1 min', true),
    Rule(20, 290, MW - 40, 0.2),
    // Active step
    F(10, 298, MW - 20, 52, C.cream, { r: 8, ch: [
      ...StepRow(10, 10, MW - 40, '03', 'Vitamin C Serum', '2 min', false),
      T('3 drops · pat gently', 54, 30, MW - 100, 14, { size: 10, fill: C.stone, weight: 300 }),
    ]}),
    Rule(20, 358, MW - 40, 0.2),
    StepRow(20, 368, MW - 40, '04', 'Hyaluronic Acid', '1 min', false),
    Rule(20, 396, MW - 40, 0.2),
    StepRow(20, 406, MW - 40, '05', 'Eye Cream', '1 min', false),
    Rule(20, 434, MW - 40, 0.2),
    StepRow(20, 444, MW - 40, '06', 'Moisturiser', '1 min', false),
    Rule(20, 472, MW - 40, 0.2),
    StepRow(20, 482, MW - 40, '07', 'SPF 50+', '2 min', false),
  ].flat();

  // Timer and CTA
  const timer = F(20, 548, MW - 40, 80, C.blue, { r: 12, ch: [
    T('SET TIMER', 0, 12, MW - 40, 12, { size: 9, fill: 'rgba(255,255,255,0.5)', weight: 300, ls: 2, align: 'center' }),
    T('2:00', 0, 30, MW - 40, 32, { size: 28, fill: '#fff', weight: 300, align: 'center' }),
  ]});

  const skip = T('SKIP STEP', 0, 642, MW, 14, { size: 9, fill: C.stone, weight: 300, ls: 2, align: 'center' });

  // Note
  const note = F(20, 668, MW - 40, 60, C.cream, { r: 8, ch: [
    T('PRODUCT NOTE', 16, 12, 120, 10, { size: 8, fill: C.stone, weight: 300, ls: 1.5 }),
    T('Apply 3 drops, pat from inside out.\nAvoid eye area.', 16, 26, MW - 72, 28, { size: 11, fill: C.stone, weight: 300, lh: 1.5 }),
  ]});

  const nav = F(0, MH - 80, MW, 80, C.bg, { ch: [
    T('□', 40, 16, 30, 20, { size: 20, fill: C.dust, align: 'center' }),
    T('⬛', 130, 16, 30, 20, { size: 20, fill: C.blue, align: 'center' }),
    T('◯', 220, 16, 30, 20, { size: 20, fill: C.dust, align: 'center' }),
    T('≡', 310, 16, 30, 20, { size: 20, fill: C.dust, align: 'center' }),
    T('HOME', 28, 38, 54, 10, { size: 8, fill: C.dust, weight: 300, ls: 1, align: 'center' }),
    T('RITUAL', 118, 38, 54, 10, { size: 8, fill: C.blue, weight: 500, ls: 1, align: 'center' }),
    T('LOG', 208, 38, 54, 10, { size: 8, fill: C.dust, weight: 300, ls: 1, align: 'center' }),
    T('LIBRARY', 298, 38, 54, 10, { size: 8, fill: C.dust, weight: 300, ls: 1, align: 'center' }),
  ]});

  return F(0, 0, MW, MH, C.bg, { ch: [
    header, title, progress,
    barBg, barFill, r1,
    ...steps, timer, skip, note, nav,
  ]});
}

// ── M3: Skin Log ──────────────────────────────────────────────────────────────
function mLog() {
  const header = T('SKIN LOG', 20, 60, MW - 40, 14, { size: 9, fill: C.stone, weight: 300, ls: 2 });
  const title  = T('How does\nyour skin feel?', 20, 80, MW - 40, 80, { size: 28, fill: C.ink, weight: 300, lh: 1.25 });
  const sub    = T('Tuesday, 18 March', 20, 164, MW - 40, 16, { size: 11, fill: C.stone, weight: 300 });

  // Condition selectors (pill grid)
  const condLabel = T('CONDITION', 20, 196, MW - 40, 12, { size: 9, fill: C.stone, weight: 300, ls: 2 });
  const conds = [
    ['HYDRATED', C.sage], ['OILY', C.stone], ['DRY', C.dust],
    ['GLOWING', C.rose], ['IRRITATED', '#E07070'], ['BALANCED', C.blue],
  ];
  const condPills = conds.map(([ label, color ], i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 20 + col * 120;
    const y = 214 + row * 36;
    const selected = i === 0 || i === 5;
    return F(x, y, 112, 28, selected ? color + '22' : C.cream, {
      r: 14,
      stroke: selected ? color : 'none',
      sw: 1,
      ch: [T(label, 8, 7, 96, 14, { size: 9, fill: selected ? color : C.stone, weight: selected ? 500 : 300, ls: 0.5, align: 'center' })],
    });
  });

  // Concern areas (face map)
  const faceRule = Rule(20, 292, MW - 40);
  const faceLabel = T('CONCERN AREAS', 20, 304, MW - 40, 12, { size: 9, fill: C.stone, weight: 300, ls: 2 });
  // Simplified face outline using ellipses and frames
  const face = [
    E(MW/2 - 44, 326, 88, 110, C.cream),       // face shape
    E(MW/2 - 30, 342, 12, 12, C.rule),          // left eye area
    E(MW/2 + 18, 342, 12, 12, C.rule),          // right eye area
    F(MW/2 - 16, 366, 32, 4, C.rule, { r: 2 }), // nose
    F(MW/2 - 22, 388, 44, 6, C.rule, { r: 3 }), // mouth
    // T-zone highlight
    F(MW/2 - 8, 330, 16, 60, C.rose, { r: 8, opacity: 0.3 }),
    T('T-ZONE', MW/2 - 20, 396, 40, 10, { size: 7, fill: C.rose, weight: 400, ls: 0.5, align: 'center' }),
  ];

  // Notes
  const noteRule = Rule(20, 462, MW - 40);
  const noteLabel = T('NOTES', 20, 474, MW - 40, 12, { size: 9, fill: C.stone, weight: 300, ls: 2 });
  const noteBox = F(20, 494, MW - 40, 80, C.cream, { r: 8, ch: [
    T('Noticed some tightness around nose after\ncleanser — may switch to oil cleanse only\nthis week.', 16, 14, MW - 72, 54, { size: 12, fill: C.ink, weight: 300, lh: 1.6 }),
  ]});

  const saveBtn = F(20, 590, MW - 40, 48, C.ink, { r: 10, ch: [
    T('SAVE LOG', 0, 16, MW - 40, 16, { size: 11, fill: C.bg, weight: 500, ls: 2, align: 'center' }),
  ]});

  return F(0, 0, MW, MH, C.bg, { ch: [
    header, title, sub, condLabel,
    ...condPills, faceRule, faceLabel, ...face,
    noteRule, noteLabel, noteBox, saveBtn,
  ]});
}

// ── M4: Product Library ───────────────────────────────────────────────────────
function mLibrary() {
  const header = T('LIBRARY', 20, 60, MW - 40, 14, { size: 9, fill: C.stone, weight: 300, ls: 2 });
  const title  = T('12 products', 20, 80, MW - 40, 40, { size: 28, fill: C.ink, weight: 300 });

  // Filter chips
  const filters = ['ALL', 'MORNING', 'EVENING', 'SERUM', 'SPF'];
  const filterRow = filters.map((f, i) => {
    const active = i === 0;
    return F(20 + i * 72, 132, 68, 26, active ? C.ink : C.cream, {
      r: 13,
      ch: [T(f, 8, 6, 52, 14, { size: 9, fill: active ? C.bg : C.stone, weight: active ? 500 : 300, ls: 0.5, align: 'center' })],
    });
  });

  // Product list
  const products = [
    { name: 'Gentle Cleanser', brand: 'CETAPHIL', tag: 'AM/PM', color: C.blue },
    { name: 'BHA Toner', brand: 'COSRX', tag: 'AM', color: C.sage },
    { name: 'Vit C 15% Serum', brand: 'MAELOVE', tag: 'AM', color: C.rose },
    { name: 'HA Serum', brand: 'THE ORDINARY', tag: 'AM/PM', color: C.slate },
    { name: 'Night Cream', brand: 'CERAVE', tag: 'PM', color: C.stone },
    { name: 'SPF 50+ Fluid', brand: 'LA ROCHE', tag: 'AM', color: C.blue },
    { name: 'Retinol 0.3%', brand: 'THE ORDINARY', tag: 'PM', color: C.rose },
  ];

  const r1 = Rule(20, 172, MW - 40);
  const productRows = products.map((p, i) => {
    const y = 172 + i * 74;
    return [
      ProductCard(20, y + 7, MW - 40, 60, p.name, p.brand, p.tag, p.color),
    ];
  }).flat();

  return F(0, 0, MW, MH, C.bg, { ch: [
    header, title, ...filterRow, r1, ...productRows,
  ]});
}

// ── M5: Progress / 28-Day Tracking ───────────────────────────────────────────
function mProgress() {
  const header = T('PROGRESS', 20, 60, MW - 40, 14, { size: 9, fill: C.stone, weight: 300, ls: 2 });
  const title  = T('28 days in.', 20, 80, MW - 40, 40, { size: 32, fill: C.ink, weight: 300 });
  const sub    = T('Skin consistency improved by 34%.', 20, 126, MW - 40, 20, { size: 12, fill: C.stone, weight: 300 });

  // Mini bar chart — adherence over 4 weeks
  const chartBg = F(20, 158, MW - 40, 100, C.cream, { r: 10 });
  const weeks = ['W1', 'W2', 'W3', 'W4'];
  const heights = [54, 68, 82, 90];
  const bars = weeks.map((w, i) => {
    const bw = 28;
    const x = 40 + i * 74;
    const h = heights[i];
    return [
      F(x, 238 - h, bw, h, C.blue, { r: 4, opacity: 0.15 + i * 0.2 }),
      T(w, x + 2, 246, bw, 10, { size: 8, fill: C.stone, weight: 300, ls: 0.5, align: 'center' }),
    ];
  }).flat();
  const chartLabel = T('RITUAL ADHERENCE', 20, 148, MW - 40, 10, { size: 9, fill: C.stone, weight: 300, ls: 2 });

  // Streak stats
  const statsRule = Rule(20, 280, MW - 40);
  const stats = [
    { label: 'CURRENT STREAK', val: '14 days' },
    { label: 'BEST STREAK', val: '21 days' },
    { label: 'COMPLETION', val: '89%' },
  ];
  const statRows = stats.map((s, i) => [
    T(s.label, 20, 294 + i * 44, MW - 120, 12, { size: 9, fill: C.stone, weight: 300, ls: 1.5 }),
    T(s.val, MW - 100, 294 + i * 44, 80, 16, { size: 14, fill: C.ink, weight: 300, align: 'right' }),
    Rule(20, 318 + i * 44, MW - 40, 0.2),
  ]).flat();

  // Skin photo diary
  const photoRule = Rule(20, 430, MW - 40);
  const photoLabel = T('SKIN DIARY', 20, 442, MW - 40, 12, { size: 9, fill: C.stone, weight: 300, ls: 2 });
  const weeks2 = ['DAY 1', 'DAY 7', 'DAY 14', 'DAY 21'];
  const photos = weeks2.map((w, i) => {
    const x = 20 + i * 88;
    return [
      F(x, 462, 80, 80, C.cream, { r: 8 }),
      T(w, x, 548, 80, 12, { size: 8, fill: C.stone, weight: 300, ls: 0.5, align: 'center' }),
    ];
  }).flat();

  // Concern trend pills
  const trendRule = Rule(20, 578, MW - 40);
  const trendLabel = T('IMPROVEMENTS', 20, 590, MW - 40, 12, { size: 9, fill: C.stone, weight: 300, ls: 2 });
  const trends = [
    Pill('↓ DRYNESS', 20, 610, C.sage + '20', C.sage, 90),
    Pill('↓ REDNESS', 120, 610, C.rose + '20', C.rose, 90),
    Pill('↑ GLOW', 220, 610, C.blue + '20', C.blue, 70),
  ];

  return F(0, 0, MW, MH, C.bg, { ch: [
    header, title, sub, chartLabel, chartBg, ...bars,
    statsRule, ...statRows,
    photoRule, photoLabel, ...photos,
    trendRule, trendLabel, ...trends,
  ]});
}

// ── DESKTOP SCREEN BUILDER (1440 × 900) ──────────────────────────────────────
const DW = 1440, DH = 900;
const SB = 240;  // sidebar width
const CO = 60;   // content padding

// ── D1: Desktop Dashboard ─────────────────────────────────────────────────────
function dDashboard() {
  // Sidebar
  const sidebar = F(0, 0, SB, DH, C.cream, { ch: [
    T('PURA', 28, 32, SB - 56, 20, { size: 11, fill: C.ink, weight: 500, ls: 4 }),
    // Nav items
    ...[
      ['Dashboard', true],
      ['Morning Ritual', false],
      ['Evening Ritual', false],
      ['Skin Log', false],
      ['Library', false],
      ['Progress', false],
      ['Discover', false],
    ].map(([label, active], i) => F(16, 80 + i * 44, SB - 32, 36, active ? C.blue + '15' : 'none', {
      r: 6,
      ch: [T(label, 12, 9, SB - 56, 18, { size: 12, fill: active ? C.blue : C.stone, weight: active ? 500 : 300 })],
    })),
    // User info
    Rule(20, DH - 88, SB - 40),
    E(20, DH - 68, 32, 32, C.rule),
    T('Clara M.', 60, DH - 62, 120, 16, { size: 12, fill: C.ink, weight: 300 }),
    T('28-day plan', 60, DH - 46, 120, 12, { size: 10, fill: C.stone, weight: 300 }),
  ]});

  const main = SB + CO;
  const mw   = DW - SB - CO * 2;

  // Header
  const dateHdr   = T('DASHBOARD · TUESDAY 18 MARCH', main, 36, 400, 12, { size: 9, fill: C.stone, weight: 300, ls: 2 });
  const titleHdr  = T('Today\'s overview', main, 54, 500, 40, { size: 32, fill: C.ink, weight: 300 });

  // Stat cards row (bento top)
  const statCards = [
    { label: 'STREAK', val: '14', unit: 'days' },
    { label: 'MORNING', val: '75', unit: '%' },
    { label: 'EVENING', val: '30', unit: '%' },
    { label: 'PRODUCTS', val: '12', unit: 'active' },
  ].map((s, i) => F(main + i * 245, 108, 233, 90, C.cream, {
    r: 10,
    ch: [
      T(s.label, 20, 14, 160, 12, { size: 9, fill: C.stone, weight: 300, ls: 1.5 }),
      T(s.val, 20, 32, 80, 44, { size: 36, fill: C.ink, weight: 300 }),
      T(s.unit, 20 + (s.val.length * 20), 52, 60, 16, { size: 11, fill: C.stone, weight: 300 }),
    ],
  }));

  // Adherence chart (large bento left)
  const chartCard = F(main, 216, mw * 0.55, 220, C.cream, {
    r: 10,
    ch: [
      T('RITUAL ADHERENCE — 4 WEEKS', 20, 16, 300, 12, { size: 9, fill: C.stone, weight: 300, ls: 1.5 }),
      // bar chart
      ...[54, 68, 78, 82, 72, 88, 90].map((h, i) => F(20 + i * 64, 210 - h, 44, h, C.blue, {
        r: 4, opacity: 0.15 + i * 0.11,
      })),
      ...[54, 68, 78, 82, 72, 88, 90].map((h, i) => T(['M', 'T', 'W', 'T', 'F', 'S', 'S'][i], 20 + i * 64, 214, 44, 10, {
        size: 9, fill: C.stone, weight: 300, align: 'center',
      })),
    ],
  });

  // Upcoming ritual (bento right)
  const ritualCard = F(main + mw * 0.57, 216, mw * 0.43, 220, C.blue, {
    r: 10,
    ch: [
      T('NEXT RITUAL', 20, 16, 200, 12, { size: 9, fill: 'rgba(255,255,255,0.5)', weight: 300, ls: 1.5 }),
      T('Evening\nRoutine', 20, 36, 260, 60, { size: 28, fill: '#fff', weight: 300, lh: 1.2 }),
      T('7:30 PM · 5 steps · 11 min', 20, 104, 260, 16, { size: 11, fill: 'rgba(255,255,255,0.6)', weight: 300 }),
      F(20, 142, 120, 40, 'rgba(255,255,255,0.15)', { r: 8, ch: [
        T('START RITUAL', 10, 12, 100, 16, { size: 10, fill: '#fff', weight: 500, ls: 1 }),
      ]}),
    ],
  });

  // Products due restock
  const restockCard = F(main, 452, mw * 0.42, 130, C.cream, {
    r: 10,
    ch: [
      T('RUNNING LOW', 20, 16, 200, 12, { size: 9, fill: C.stone, weight: 300, ls: 1.5 }),
      ...['Vit C Serum · 3 uses left', 'SPF Fluid · 1 week', 'HA Serum · 5 uses'].map((p, i) => [
        T(p, 20, 38 + i * 30, 280, 16, { size: 12, fill: C.ink, weight: 300 }),
        Rule(20, 60 + i * 30, mw * 0.42 - 40, 0.2),
      ]).flat(),
    ],
  });

  // Recent log
  const logCard = F(main + mw * 0.44, 452, mw * 0.56, 130, C.cream, {
    r: 10,
    ch: [
      T('LATEST LOG — TODAY', 20, 16, 300, 12, { size: 9, fill: C.stone, weight: 300, ls: 1.5 }),
      T('Skin feeling hydrated and balanced.\nSlight tightness near nose post-cleanse.', 20, 36, mw * 0.56 - 40, 44, { size: 12, fill: C.ink, weight: 300, lh: 1.7 }),
      Pill('HYDRATED', 20, 96, C.sage + '20', C.sage),
      Pill('BALANCED', 110, 96, C.blue + '20', C.blue),
    ],
  });

  // Skin photo strip
  const photoCard = F(main, 598, mw, 86, C.cream, {
    r: 10,
    ch: [
      T('28-DAY SKIN DIARY', 16, 16, 200, 12, { size: 9, fill: C.stone, weight: 300, ls: 1.5 }),
      ...['DAY 1', 'DAY 7', 'DAY 14', 'DAY 21', 'TODAY'].map((d, i) => [
        F(16 + i * ((mw - 32) / 5), 34, (mw - 48) / 5, 40, C.rule, { r: 6, opacity: 0.5 }),
        T(d, 16 + i * ((mw - 32) / 5), 76, (mw - 48) / 5, 10, { size: 8, fill: C.stone, weight: 300, align: 'center' }),
      ]).flat(),
    ],
  });

  return F(0, 0, DW, DH, C.bg, { ch: [
    sidebar, dateHdr, titleHdr,
    ...statCards, chartCard, ritualCard,
    restockCard, logCard, photoCard,
  ]});
}

// ── D2: Routine Builder ───────────────────────────────────────────────────────
function dRoutine() {
  // Sidebar (same)
  const sidebar = F(0, 0, SB, DH, C.cream, { ch: [
    T('PURA', 28, 32, SB - 56, 20, { size: 11, fill: C.ink, weight: 500, ls: 4 }),
    ...[
      ['Dashboard', false],
      ['Morning Ritual', true],
    ].map(([label, active], i) => F(16, 80 + i * 44, SB - 32, 36, active ? C.blue + '15' : 'none', {
      r: 6,
      ch: [T(label, 12, 9, SB - 56, 18, { size: 12, fill: active ? C.blue : C.stone, weight: active ? 500 : 300 })],
    })),
  ]});

  const main = SB + CO;
  const mw   = DW - SB - CO * 2;

  const hdr   = T('MORNING RITUAL', main, 36, 400, 12, { size: 9, fill: C.stone, weight: 300, ls: 2 });
  const title = T('Edit routine', main, 54, 500, 40, { size: 32, fill: C.ink, weight: 300 });

  // Two-column: step list (left) + product detail (right)
  const lw = mw * 0.55;
  const rw = mw * 0.42;
  const rx = main + lw + 30;

  // Step list card
  const stepList = F(main, 108, lw, DH - 140, C.cream, {
    r: 10,
    ch: [
      T('ROUTINE STEPS', 20, 20, 200, 12, { size: 9, fill: C.stone, weight: 300, ls: 1.5 }),
      Rule(20, 42, lw - 40),
      ...['Double Cleanse', 'BHA Toner', 'Vitamin C Serum', 'Hyaluronic Acid', 'Eye Cream', 'Moisturiser', 'SPF 50+'].map((s, i) => [
        F(20, 50 + i * 70, lw - 40, 60, i === 2 ? C.blue + '10' : 'none', {
          r: 6,
          ch: [
            T(`${String(i+1).padStart(2,'0')}`, 12, 20, 28, 20, { size: 9, fill: C.dust, weight: 300 }),
            T(s, 44, 10, lw - 120, 20, { size: 13, fill: i === 2 ? C.blue : C.ink, weight: 400 }),
            T(['3 min', '1 min', '2 min', '1 min', '1 min', '1 min', '2 min'][i], 44, 30, lw - 120, 14, { size: 10, fill: C.stone, weight: 300 }),
            F(lw - 76, 18, 24, 24, 'none', { r: 12, stroke: C.rule, sw: 1 }),  // drag handle
          ],
        }),
        Rule(20, 110 + i * 70, lw - 40, 0.15),
      ]).flat(),
      // Add step button
      F(20, 550, lw - 40, 44, 'none', {
        r: 8, stroke: C.rule, sw: 1,
        ch: [T('+ ADD STEP', 0, 14, lw - 40, 16, { size: 10, fill: C.stone, weight: 400, ls: 1.5, align: 'center' })],
      }),
    ],
  });

  // Product detail panel
  const detail = F(rx, 108, rw, DH - 140, C.cream, {
    r: 10,
    ch: [
      T('STEP 3 — ACTIVE', 20, 20, 200, 12, { size: 9, fill: C.blue, weight: 300, ls: 1.5 }),
      Rule(20, 42, rw - 40),
      // Product swatch
      F(20, 52, rw - 40, 100, C.rule, { r: 8, opacity: 0.4 }),
      T('Maelove The Glow Maker', 20, 164, rw - 40, 20, { size: 14, fill: C.ink, weight: 400 }),
      T('15% Vitamin C + E + Ferulic', 20, 186, rw - 40, 16, { size: 11, fill: C.stone, weight: 300 }),
      Rule(20, 212, rw - 40),
      // Timing
      T('TIMING', 20, 224, 80, 12, { size: 9, fill: C.stone, weight: 300, ls: 1.5 }),
      F(20, 242, (rw - 52) / 2, 36, C.blue + '15', { r: 6, ch: [T('MORNING', 8, 10, (rw - 52) / 2 - 16, 16, { size: 10, fill: C.blue, weight: 500, ls: 1 })] }),
      // Instructions
      Rule(20, 290, rw - 40),
      T('INSTRUCTIONS', 20, 302, 140, 12, { size: 9, fill: C.stone, weight: 300, ls: 1.5 }),
      T('Apply 3 drops to face.\nPat gently from inside out.\nAvoid eye area.', 20, 320, rw - 40, 54, { size: 12, fill: C.stone, weight: 300, lh: 1.6 }),
      // Key ingredients
      Rule(20, 384, rw - 40),
      T('KEY INGREDIENTS', 20, 396, 200, 12, { size: 9, fill: C.stone, weight: 300, ls: 1.5 }),
      ...['Ascorbic Acid 15%', 'Vitamin E', 'Ferulic Acid'].map((ing, i) => [
        T(ing, 20, 414 + i * 28, rw - 40, 16, { size: 12, fill: C.ink, weight: 300 }),
        Rule(20, 432 + i * 28, rw - 40, 0.15),
      ]).flat(),
      // Save btn
      F(20, DH - 180, rw - 40, 44, C.ink, { r: 8, ch: [T('SAVE CHANGES', 0, 14, rw - 40, 16, { size: 10, fill: C.bg, weight: 500, ls: 2, align: 'center' })] }),
    ],
  });

  return F(0, 0, DW, DH, C.bg, { ch: [sidebar, hdr, title, stepList, detail] });
}

// ── D3: Ingredient Analysis ───────────────────────────────────────────────────
function dIngredients() {
  const sidebar = F(0, 0, SB, DH, C.cream, { ch: [
    T('PURA', 28, 32, SB - 56, 20, { size: 11, fill: C.ink, weight: 500, ls: 4 }),
  ]});

  const main = SB + CO;
  const mw   = DW - SB - CO * 2;

  const hdr   = T('INGREDIENT ANALYSIS', main, 36, 400, 12, { size: 9, fill: C.stone, weight: 300, ls: 2 });
  const title = T('12 products, 87 ingredients.', main, 54, 600, 40, { size: 30, fill: C.ink, weight: 300 });

  // Search bar
  const search = F(main, 106, mw, 44, C.cream, {
    r: 8,
    ch: [T('Search ingredients or products...', 16, 14, mw - 32, 16, { size: 13, fill: C.dust, weight: 300 })],
  });

  const lw = mw * 0.55;
  const rw = mw * 0.42;
  const rx = main + lw + 30;

  // Ingredient list (left)
  const ingList = F(main, 162, lw, DH - 194, C.cream, { r: 10, ch: [
    T('ALL INGREDIENTS', 20, 18, 200, 12, { size: 9, fill: C.stone, weight: 300, ls: 1.5 }),
    Rule(20, 40, lw - 40),
    ...[
      ['Niacinamide', 'BENEFICIAL', C.sage],
      ['Ascorbic Acid', 'BENEFICIAL', C.sage],
      ['Retinol', 'USE WITH CARE', C.rose],
      ['Fragrance', 'AVOID', '#E07070'],
      ['Hyaluronic Acid', 'BENEFICIAL', C.sage],
      ['AHA/BHA', 'USE WITH CARE', C.rose],
      ['Ceramides', 'BENEFICIAL', C.sage],
      ['Alcohol Denat.', 'MONITOR', C.stone],
      ['Zinc Oxide', 'BENEFICIAL', C.sage],
    ].map(([ name, rating, color ], i) => IngRow(main + 20 - main, 50 + i * 44, lw - 40, name, rating, color)).flat(),
  ]});

  // Detail panel (right)
  const detail = F(rx, 162, rw, 280, C.cream, { r: 10, ch: [
    T('NIACINAMIDE', 20, 20, rw - 40, 16, { size: 14, fill: C.ink, weight: 400, ls: 1 }),
    T('Vitamin B3 · Water-Soluble', 20, 40, rw - 40, 14, { size: 11, fill: C.stone, weight: 300 }),
    Rule(20, 62, rw - 40),
    T('SAFETY', 20, 74, 60, 12, { size: 9, fill: C.stone, weight: 300, ls: 1.5 }),
    Pill('BENEFICIAL', 20, 92, C.sage + '20', C.sage, 100),
    Rule(20, 126, rw - 40),
    T('FOUND IN', 20, 138, 80, 12, { size: 9, fill: C.stone, weight: 300, ls: 1.5 }),
    ...[['CeraVe Moisturiser', '4%'], ['Paula\'s Choice BHA', '2%']].map(([p, conc], i) => [
      T(p, 20, 156 + i * 30, rw - 80, 16, { size: 12, fill: C.ink, weight: 300 }),
      T(conc, rw - 60, 156 + i * 30, 40, 16, { size: 11, fill: C.stone, weight: 300, align: 'right' }),
    ]).flat(),
    Rule(20, 222, rw - 40),
    T('BENEFITS', 20, 234, 80, 12, { size: 9, fill: C.stone, weight: 300, ls: 1.5 }),
    T('Reduces pore appearance, brightens\nskin tone, strengthens barrier.', 20, 252, rw - 40, 40, { size: 12, fill: C.stone, weight: 300, lh: 1.6 }),
  ]});

  // Conflict alerts
  const conflicts = F(rx, 454, rw, 200, C.cream, { r: 10, ch: [
    T('CONFLICTS DETECTED', 20, 18, rw - 40, 12, { size: 9, fill: '#E07070', weight: 300, ls: 1.5 }),
    Rule(20, 40, rw - 40),
    ...[
      ['Retinol + Vit C', 'Use on separate nights'],
      ['AHA/BHA + Fragrance', 'Potential irritation'],
    ].map(([pair, note], i) => [
      T(pair, 20, 52 + i * 60, rw - 40, 16, { size: 12, fill: C.ink, weight: 400 }),
      T(note, 20, 70 + i * 60, rw - 40, 14, { size: 11, fill: C.stone, weight: 300 }),
      Rule(20, 100 + i * 60, rw - 40, 0.2),
    ]).flat(),
    T('VIEW ALL CONFLICTS →', 20, 168, rw - 40, 14, { size: 10, fill: C.blue, weight: 400, ls: 0.5 }),
  ]});

  return F(0, 0, DW, DH, C.bg, { ch: [
    sidebar, hdr, title, search, ingList, detail, conflicts,
  ]});
}

// ── D4: Progress Analytics ────────────────────────────────────────────────────
function dProgress() {
  const sidebar = F(0, 0, SB, DH, C.cream, { ch: [
    T('PURA', 28, 32, SB - 56, 20, { size: 11, fill: C.ink, weight: 500, ls: 4 }),
  ]});

  const main = SB + CO;
  const mw   = DW - SB - CO * 2;

  const hdr   = T('PROGRESS', main, 36, 400, 12, { size: 9, fill: C.stone, weight: 300, ls: 2 });
  const title = T('28-day skin journey.', main, 54, 600, 40, { size: 32, fill: C.ink, weight: 300 });

  // Photo timeline
  const photoStrip = F(main, 108, mw, 120, C.cream, { r: 10, ch: [
    T('SKIN DIARY — 28 DAYS', 20, 16, 300, 12, { size: 9, fill: C.stone, weight: 300, ls: 1.5 }),
    ...['DAY 1', 'DAY 7', 'DAY 14', 'DAY 21', 'TODAY'].map((d, i) => [
      F(20 + i * 200, 36, 180, 64, C.rule, { r: 6, opacity: 0.4 }),
      T(d, 20 + i * 200, 102, 180, 12, { size: 8, fill: C.stone, weight: 300, align: 'center' }),
    ]).flat(),
  ]});

  // Multi-line sparklines
  const chartCard = F(main, 244, mw * 0.6, 280, C.cream, { r: 10, ch: [
    T('SKIN METRICS — 4 WEEKS', 20, 16, 300, 12, { size: 9, fill: C.stone, weight: 300, ls: 1.5 }),
    // Grid lines
    ...[0, 1, 2, 3].map(i => F(20, 42 + i * 54, mw * 0.6 - 40, 1, C.rule, { opacity: 0.3 })),
    // Hydration line (blue)
    ...[60, 65, 72, 75, 68, 80, 84].map((v, i) => F(20 + i * 56, 230 - v, 44, 4, C.blue, { r: 2, opacity: 0.6 })),
    // Clarity line (sage)
    ...[40, 52, 58, 65, 70, 75, 80].map((v, i) => F(20 + i * 56, 230 - v + 6, 44, 4, C.sage, { r: 2, opacity: 0.6 })),
    // Legend
    F(mw * 0.6 - 180, 248, 14, 4, C.blue, { r: 2 }),
    T('Hydration', mw * 0.6 - 164, 244, 80, 14, { size: 11, fill: C.stone, weight: 300 }),
    F(mw * 0.6 - 80, 248, 14, 4, C.sage, { r: 2 }),
    T('Clarity', mw * 0.6 - 64, 244, 60, 14, { size: 11, fill: C.stone, weight: 300 }),
  ]});

  // Adherence + streak (right bento)
  const adherence = F(main + mw * 0.62, 244, mw * 0.38, 130, C.blue, { r: 10, ch: [
    T('RITUAL STREAK', 20, 18, 200, 12, { size: 9, fill: 'rgba(255,255,255,0.5)', weight: 300, ls: 1.5 }),
    T('14', 20, 36, 80, 60, { size: 52, fill: '#fff', weight: 300 }),
    T('CONSECUTIVE DAYS', 20, 96, 200, 12, { size: 9, fill: 'rgba(255,255,255,0.5)', weight: 300, ls: 1.5 }),
  ]});

  const completion = F(main + mw * 0.62, 386, mw * 0.38, 138, C.cream, { r: 10, ch: [
    T('COMPLETION RATE', 20, 18, 200, 12, { size: 9, fill: C.stone, weight: 300, ls: 1.5 }),
    T('89%', 20, 36, 100, 48, { size: 40, fill: C.ink, weight: 300 }),
    T('of all steps completed\nacross morning + evening', 20, 86, 200, 36, { size: 11, fill: C.stone, weight: 300, lh: 1.5 }),
  ]});

  // Improvement callouts
  const improvCard = F(main, 540, mw, 90, C.cream, { r: 10, ch: [
    T('KEY IMPROVEMENTS', 20, 18, 250, 12, { size: 9, fill: C.stone, weight: 300, ls: 1.5 }),
    ...['↓ 40% Dryness', '↑ 34% Glow', '↓ 28% Redness', '↑ 22% Elasticity'].map((item, i) => F(20 + i * 260, 38, 240, 40, i % 2 === 0 ? C.sage + '15' : C.blue + '10', {
      r: 8,
      ch: [T(item, 16, 12, 210, 16, { size: 13, fill: i % 2 === 0 ? C.sage : C.blue, weight: 400 })],
    })),
  ]});

  return F(0, 0, DW, DH, C.bg, { ch: [
    sidebar, hdr, title, photoStrip, chartCard, adherence, completion, improvCard,
  ]});
}

// ── D5: Product Discovery ─────────────────────────────────────────────────────
function dDiscover() {
  const sidebar = F(0, 0, SB, DH, C.cream, { ch: [
    T('PURA', 28, 32, SB - 56, 20, { size: 11, fill: C.ink, weight: 500, ls: 4 }),
  ]});

  const main = SB + CO;
  const mw   = DW - SB - CO * 2;

  const hdr   = T('DISCOVER', main, 36, 400, 12, { size: 9, fill: C.stone, weight: 300, ls: 2 });
  const title = T('Recommended for you.', main, 54, 600, 40, { size: 30, fill: C.ink, weight: 300 });
  const sub   = T('Based on your skin type, concerns, and current routine.', main, 96, 500, 16, { size: 12, fill: C.stone, weight: 300 });

  // Filter row
  const filterCats = ['ALL', 'SERUMS', 'MOISTURISERS', 'SPF', 'CLEANSERS', 'TREATMENTS'];
  const filters = filterCats.map((f, i) => F(main + i * 130, 124, 124, 28, i === 0 ? C.ink : C.cream, {
    r: 14,
    ch: [T(f, 10, 7, 104, 14, { size: 9, fill: i === 0 ? C.bg : C.stone, weight: i === 0 ? 500 : 300, ls: 0.5, align: 'center' })],
  }));

  // Product bento grid (2 rows × 4 cols)
  const prods = [
    { name: 'Melting Cleansing Oil', brand: 'KIEHL\'S', tag: 'CLEANSER', price: '$36', match: '98% match', color: C.stone },
    { name: 'Brightening Serum', brand: 'PAULA\'S CHOICE', tag: 'SERUM', price: '$44', match: '94% match', color: C.rose },
    { name: 'Barrier Moisturiser', brand: 'LA ROCHE-POSAY', tag: 'MOISTURISER', price: '$28', match: '91% match', color: C.blue },
    { name: 'Tinted SPF 50+', brand: 'ELTA MD', tag: 'SPF', price: '$52', match: '89% match', color: C.sage },
    { name: 'Glycolic Toner', brand: 'PIXI', tag: 'TONER', price: '$18', match: '86% match', color: C.slate },
    { name: 'Peptide Eye Cream', brand: 'OLAY', tag: 'EYE', price: '$22', match: '84% match', color: C.rose },
    { name: 'Retinol 0.5%', brand: 'DIFFERIN', tag: 'TREATMENT', price: '$31', match: '80% match', color: C.stone },
    { name: 'Mist + Hydrating Spray', brand: 'MARIO BADESCU', tag: 'MIST', price: '$12', match: '78% match', color: C.sage },
  ];

  const cw = (mw - 30) / 4;
  const prodCards = prods.map((p, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = main + col * (cw + 10);
    const y = 168 + row * 190;
    return F(x, y, cw, 180, C.cream, { r: 10, ch: [
      F(0, 0, cw, 90, p.color, { r: [10, 10, 0, 0], opacity: 0.12 }),
      T(p.brand, 16, 16, cw - 32, 12, { size: 9, fill: C.stone, weight: 300, ls: 1 }),
      T(p.name, 16, 30, cw - 32, 36, { size: 13, fill: C.ink, weight: 400, lh: 1.3 }),
      Pill(p.tag, 16, 70, p.color + '20', p.color),
      Rule(16, 96, cw - 32),
      T(p.match, 16, 108, cw - 80, 16, { size: 11, fill: p.color, weight: 400 }),
      T(p.price, cw - 60, 108, 44, 16, { size: 13, fill: C.ink, weight: 400, align: 'right' }),
      T('ADD TO LIBRARY +', 16, 148, cw - 32, 14, { size: 9, fill: C.blue, weight: 500, ls: 1 }),
    ]});
  });

  return F(0, 0, DW, DH, C.bg, { ch: [
    sidebar, hdr, title, sub, ...filters, ...prodCards,
  ]});
}

// ── Assemble doc ──────────────────────────────────────────────────────────────
const screens = [
  mHome(), mRitual(), mLog(), mLibrary(), mProgress(),
  dDashboard(), dRoutine(), dIngredients(), dProgress(), dDiscover(),
];

const doc = {
  version:  '2.8',
  children: screens,
};

// Write pen file
const penPath = path.join(__dirname, 'pura.pen');
fs.writeFileSync(penPath, JSON.stringify(doc, null, 2));
console.log(`✓ pura.pen written — ${screens.length} screens`);
console.log(`  Mobile: ${screens.filter(s => s.width < 500).length} screens (390×844)`);
console.log(`  Desktop: ${screens.filter(s => s.width >= 500).length} screens (1440×900)`);
