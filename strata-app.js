'use strict';
// strata-app.js
// STRATA — Precision Soil Intelligence for Regenerative Farms
//
// Challenge: Design a dark-mode precision-agriculture intelligence dashboard
// using a large-type editorial approach for critical data values, inspired by:
//
// 1. Genesis Soil Intelligence (land-book.com, Felix Marquette, #75 likes,
//    trending 2025) — the only "data meets earth" design in land-book's top
//    recommended. Soil layers, sensor data, field intelligence.
//
// 2. Locomotive (godly.website #958) — "Large Type, Black & White, Helvetica
//    Now Display, GSAP transitions, Big Background Video" — borrowing the
//    editorial large-number hero treatment for each app screen.
//
// Dark organic palette: near-void dark olive + electric chartreuse + amber soil
// 5 screens (390×844 mobile)

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#060A05',   // near-void dark olive — earth at night
  surface:  '#0C1209',   // deep forest surface
  surface2: '#111C0E',   // raised card
  surface3: '#182A13',   // lighter card
  border:   '#243B1C',   // subtle organic border
  muted:    '#3D5C35',   // muted forest green
  fg:       '#DDF0D6',   // warm mint-white — like starlight through leaves
  accent:   '#A3E635',   // electric chartreuse — data highlight
  amber:    '#D97706',   // soil amber — warm sub-reading
  red:      '#F05454',   // alert red — stress indicator
  blue:     '#38BDF8',   // sky/water blue — moisture
  dim:      '#0F1A0B',   // deep dim
};

let _id = 0;
const uid = () => `s${++_id}`;

// ── Primitives ────────────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill || P.bg,
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
  fontWeight: String(opts.weight || 400),
  fill: opts.fill || P.fg,
  textAlign: opts.align || 'left',
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh !== undefined ? { lineHeight: opts.lh } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Line  = (x, y, w, fill = P.border) => F(x, y, w, 1, fill);
const VLine = (x, y, h, fill = P.border) => F(x, y, 1, h, fill);

// ── Glow ──────────────────────────────────────────────────────────────────────
const Glow = (cx, cy, r, color) => [
  E(cx - r*2.4, cy - r*2.4, r*4.8, r*4.8, color + '04'),
  E(cx - r*1.6, cy - r*1.6, r*3.2, r*3.2, color + '08'),
  E(cx - r,     cy - r,     r*2,   r*2,   color + '12'),
  E(cx - r*0.5, cy - r*0.5, r,     r,     color + '1E'),
];

// ── Pill badge ────────────────────────────────────────────────────────────────
const Pill = (x, y, label, color, opts = {}) => {
  const w = opts.w || (label.length * 6.2 + 18);
  return F(x, y, w, 20, color + '1A', {
    r: 10,
    stroke: color + '44',
    sw: 1,
    ch: [T(label, 0, 3, w, 14, { size: 9, fill: color, weight: 700, ls: 0.8, align: 'center' })],
  });
};

// ── Progress bar ──────────────────────────────────────────────────────────────
const Bar = (x, y, w, pct, color, opts = {}) => [
  F(x, y, w, opts.h || 4, P.dim, { r: opts.h ? opts.h / 2 : 2 }),
  F(x, y, Math.round(w * pct / 100), opts.h || 4, color, { r: opts.h ? opts.h / 2 : 2, opacity: 0.9 }),
];

// ── Soil texture dots (organic background pattern) ────────────────────────────
const SoilDots = (x, y, w, h) => {
  const dots = [];
  const positions = [
    [24, 32], [68, 18], [112, 44], [156, 28], [200, 40], [244, 16], [288, 36], [332, 22],
    [44, 58], [90, 70], [134, 54], [178, 64], [222, 48], [266, 72], [310, 56],
    [18, 84], [62, 96], [108, 80], [152, 92], [196, 76], [240, 100], [284, 88], [328, 78],
  ];
  positions.forEach(([dx, dy]) => {
    if (dx < w && dy < h) {
      dots.push(E(x + dx - 1, y + dy - 1, 2, 2, P.accent + '18'));
    }
  });
  return dots;
};

// ── Bottom nav bar ────────────────────────────────────────────────────────────
const BottomNav = (active = 0) => {
  const tabs = ['Fields', 'Soil', 'Sensors', 'AI Tips', 'Report'];
  const icons = ['▣', '◈', '◉', '◆', '◎'];
  const children = [];
  tabs.forEach((label, i) => {
    const bx = i * 78;
    const isActive = i === active;
    children.push(
      T(icons[i], bx + 26, 8, 26, 16, { size: 14, fill: isActive ? P.accent : P.muted, align: 'center' }),
      T(label, bx + 2, 26, 74, 12, { size: 8, fill: isActive ? P.accent : P.muted, weight: isActive ? 700 : 400, ls: 0.4, align: 'center' }),
    );
    if (isActive) {
      children.push(F(bx + 24, 2, 30, 2, P.accent, { r: 1 }));
    }
  });
  return F(0, 798, 390, 46, P.surface, {
    stroke: P.border, sw: 1, clip: false,
    ch: children,
  });
};

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Fields Overview (Locomotive large-type hero: health score)
// ══════════════════════════════════════════════════════════════════════════════
function screenFields(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    // ambient organic glow
    ...Glow(195, 160, 130, P.accent),
    ...Glow(330, 680, 70, P.amber),

    // soil dot texture
    ...SoilDots(0, 200, 390, 120),

    // status bar
    T('06:42', 20, 18, 60, 14, { size: 11, weight: 600, fill: P.fg }),
    T('12 ACTIVE FIELDS', 210, 18, 160, 14, { size: 9, fill: P.accent, ls: 1.2, align: 'right', weight: 700 }),

    // wordmark — Locomotive large-type influence: huge weight, generous tracking
    T('STRATA', 20, 44, 290, 52, { size: 46, weight: 900, ls: 6, fill: P.fg }),
    T('SOIL INTELLIGENCE', 20, 98, 220, 14, { size: 9, fill: P.muted, ls: 3, weight: 600 }),

    // HERO: Large editorial number — Locomotive style
    T('94', 20, 126, 180, 100, { size: 96, weight: 900, fill: P.accent, ls: -4 }),
    T('FARM', 178, 148, 80, 18, { size: 11, fill: P.fg, weight: 600, ls: 2 }),
    T('HEALTH', 178, 166, 80, 14, { size: 9, fill: P.muted, ls: 2 }),
    T('SCORE', 178, 180, 80, 14, { size: 9, fill: P.muted, ls: 2 }),

    // seasonal banner
    F(20, 238, 350, 36, P.surface2, { r: 10, stroke: P.border, sw: 1, ch: [
      T('◌', 14, 10, 18, 18, { size: 14, fill: P.amber }),
      T('AUTUMN 2025 · HARVEST SEASON', 36, 12, 280, 14, { size: 10, fill: P.amber, weight: 600, ls: 1 }),
    ]}),

    // section label
    T('YOUR FIELDS', 20, 288, 200, 13, { size: 9, fill: P.muted, weight: 700, ls: 2.5 }),

    // Field rows
    ...[
      { name: 'North Paddock', ha: '48 ha', health: 94, status: 'OPTIMAL', sc: P.accent },
      { name: 'South Pasture', ha: '62 ha', health: 81, status: 'MONITOR', sc: P.amber },
      { name: 'East Crop Zone', ha: '35 ha', health: 72, status: 'ACTION', sc: P.red },
      { name: 'West Reserve',  ha: '27 ha', health: 88, status: 'GOOD',   sc: P.accent },
    ].map((f, i) => {
      const fy = 308 + i * 90;
      return F(20, fy, 350, 80, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
        // color indicator stripe
        F(0, 0, 4, 80, f.sc, { r: 2 }),
        T(f.name, 20, 14, 200, 16, { size: 13, weight: 700, fill: P.fg }),
        T(f.ha, 20, 32, 80, 14, { size: 11, fill: P.muted }),
        Pill(20, 50, f.status, f.sc, { w: 68 }),
        // large health number on right — editorial
        T(String(f.health), 268, 10, 64, 50, { size: 42, weight: 900, fill: f.sc, align: 'right', ls: -1 }),
        T('%', 316, 36, 20, 14, { size: 10, fill: f.sc, weight: 700 }),
        ...Bar(20, 66, 236, f.health, f.sc, { h: 3 }),
      ]});
    }),

    BottomNav(0),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Soil Profile (layered strata — the app's core metaphor)
// ══════════════════════════════════════════════════════════════════════════════
function screenSoilProfile(ox) {
  const layers = [
    { depth: '0–30 cm',  label: 'TOPSOIL',    ph: '6.8', organic: 4.2, nitrogen: 82, color: P.accent,  desc: 'Rich & Active' },
    { depth: '30–60 cm', label: 'SUBSOIL',    ph: '7.1', organic: 2.1, nitrogen: 61, color: P.amber,   desc: 'Moderate Density' },
    { depth: '60–90 cm', label: 'DEEP LAYER', ph: '7.4', organic: 0.8, nitrogen: 38, color: P.muted,   desc: 'Clay Dominant' },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    // ambient glow — amber warmth (earth tones)
    ...Glow(195, 300, 150, P.amber),

    // header
    T('06:42', 20, 18, 60, 14, { size: 11, weight: 600, fill: P.fg }),
    T('← BACK', 300, 18, 70, 14, { size: 9, fill: P.muted, ls: 1, align: 'right' }),

    T('SOIL', 20, 44, 300, 52, { size: 46, weight: 900, ls: 6, fill: P.fg }),
    T('PROFILE', 20, 92, 300, 52, { size: 46, weight: 900, ls: 3, fill: P.accent }),
    T('NORTH PADDOCK · 48 HA', 20, 142, 240, 14, { size: 9, fill: P.muted, ls: 2.5, weight: 600 }),

    // vertical depth indicator line
    VLine(30, 168, 260, P.border),
    // depth tick marks
    ...[168, 252, 336, 428].map(ty => F(26, ty, 8, 1, P.muted)),

    // Layer cards
    ...layers.map((layer, i) => {
      const ly = 168 + i * 88;
      return F(44, ly, 326, 78, P.surface, { r: 14, stroke: layer.color + '33', sw: 1, ch: [
        // depth dot on left axis
        E(-20, 26, 12, 12, layer.color, { stroke: P.bg, sw: 2 }),

        // layer header
        T(layer.label, 14, 10, 160, 16, { size: 11, weight: 800, fill: layer.color, ls: 1.5 }),
        T(layer.depth, 14, 28, 100, 13, { size: 10, fill: P.muted }),
        T(layer.desc, 14, 42, 150, 13, { size: 10, fill: P.fg }),

        // pH value — editorial large number
        T(layer.ph, 230, 6, 72, 44, { size: 36, weight: 900, fill: layer.color, align: 'right', ls: -1 }),
        T('pH', 302, 30, 22, 14, { size: 10, fill: layer.color, weight: 700 }),

        // organic + nitrogen bar strip
        ...Bar(14, 62, 90, layer.organic * 20, layer.color, { h: 3 }),
        T(`OM ${layer.organic}%`, 110, 57, 80, 11, { size: 8, fill: P.muted }),
        ...Bar(196, 62, 90, layer.nitrogen, P.blue, { h: 3 }),
        T(`N ${layer.nitrogen}%`, 292, 57, 40, 11, { size: 8, fill: P.blue, align: 'right' }),
      ]});
    }),

    // soil texture visual — layered rectangle strips
    F(20, 460, 350, 90, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
      T('SOIL COMPOSITION', 14, 12, 250, 13, { size: 9, fill: P.muted, weight: 700, ls: 2 }),
      // topsoil bar
      F(14, 30, 322, 14, P.accent + '44', { r: 3, ch: [
        T('TOPSOIL', 8, 2, 80, 11, { size: 8, fill: P.accent, weight: 700 }),
        T('38%', 276, 2, 40, 11, { size: 8, fill: P.accent, weight: 600, align: 'right' }),
      ]}),
      // subsoil bar
      F(14, 48, 322, 14, P.amber + '33', { r: 3, ch: [
        T('SUBSOIL', 8, 2, 80, 11, { size: 8, fill: P.amber, weight: 700 }),
        T('34%', 276, 2, 40, 11, { size: 8, fill: P.amber, weight: 600, align: 'right' }),
      ]}),
      // clay bar
      F(14, 66, 322, 14, P.muted + '66', { r: 3, ch: [
        T('CLAY LAYER', 8, 2, 100, 11, { size: 8, fill: P.muted, weight: 700 }),
        T('28%', 276, 2, 40, 11, { size: 8, fill: P.muted, weight: 600, align: 'right' }),
      ]}),
    ]}),

    // AI summary card
    F(20, 564, 350, 60, P.accent + '0D', { r: 14, stroke: P.accent + '2A', sw: 1, ch: [
      T('◆', 14, 20, 18, 20, { size: 14, fill: P.accent }),
      T('AI INSIGHT', 36, 12, 200, 13, { size: 9, fill: P.accent, weight: 700, ls: 1.5 }),
      T('Phosphorus slightly elevated in topsoil. Reduce P-fertilizer by 15% this cycle.', 36, 28, 298, 26, { size: 10, fill: P.fg, lh: 16 }),
    ]}),

    BottomNav(1),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Live Sensors (real-time field data with editorial numbers)
// ══════════════════════════════════════════════════════════════════════════════
function screenSensors(ox) {
  const sensors = [
    { label: 'MOISTURE',    value: '68', unit: '%',  color: P.blue,   sub: 'Field Capacity 72%',  status: 'NORMAL',   icon: '◈' },
    { label: 'TEMPERATURE', value: '18', unit: '°C', color: P.amber,  sub: 'Optimal Range 15–22°', status: 'OPTIMAL',  icon: '◉' },
    { label: 'CONDUCTIVITY',value: '3.2',unit: 'dS', color: P.accent, sub: 'Salinity Threshold 4', status: 'GOOD',     icon: '◆' },
    { label: 'pH DRIFT',    value: '+0.2',unit: '',  color: P.red,    sub: 'Baseline 6.8 → 7.0',  status: 'WATCH',    icon: '△' },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    // ambient glow — blue water/moisture feel
    ...Glow(195, 200, 110, P.blue),
    ...Glow(60, 650, 80, P.accent),

    // status bar
    T('06:42', 20, 18, 60, 14, { size: 11, weight: 600, fill: P.fg }),
    T('● LIVE', 318, 17, 52, 16, { size: 9, fill: P.accent, weight: 700, ls: 0.8, align: 'right' }),

    // heading
    T('LIVE', 20, 44, 300, 52, { size: 46, weight: 900, ls: 6, fill: P.fg }),
    T('SENSORS', 20, 92, 300, 52, { size: 46, weight: 900, ls: 2, fill: P.blue }),
    T('NORTH PADDOCK · UPDATED 2 MIN AGO', 20, 144, 290, 14, { size: 9, fill: P.muted, ls: 2, weight: 600 }),

    // large hero reading — moisture is key
    T('68', 20, 172, 200, 96, { size: 88, weight: 900, fill: P.blue, ls: -4 }),
    T('%', 188, 206, 40, 30, { size: 24, weight: 900, fill: P.blue }),
    T('SOIL', 222, 196, 100, 16, { size: 12, fill: P.fg, weight: 600, ls: 2 }),
    T('MOISTURE', 222, 214, 100, 14, { size: 9, fill: P.muted, ls: 2 }),
    T('68% — NEAR FIELD CAPACITY', 20, 272, 350, 14, { size: 9, fill: P.blue, ls: 1, weight: 600 }),

    // grid divider
    Line(20, 296, 350, P.border),

    // 4 sensor cards in 2×2 grid
    ...sensors.map((s, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const sx = 20 + col * 178;
      const sy = 308 + row * 110;
      return F(sx, sy, 162, 98, P.surface, { r: 14, stroke: s.color + '2A', sw: 1, ch: [
        T(s.icon, 12, 10, 20, 18, { size: 13, fill: s.color }),
        T(s.label, 36, 12, 110, 14, { size: 8, fill: s.color, weight: 700, ls: 1.5 }),
        // big reading
        T(s.value, 12, 30, 110, 42, { size: 36, weight: 900, fill: s.color, ls: -1 }),
        T(s.unit, s.value.length * 20 + 14, 50, 24, 20, { size: 14, fill: s.color, weight: 700 }),
        T(s.sub, 12, 72, 138, 12, { size: 8, fill: P.muted, lh: 12 }),
        Pill(12, 84, s.status, s.color, { w: 62 }),
      ]});
    }),

    // last updated strip
    F(20, 542, 350, 40, P.surface2, { r: 10, stroke: P.border, sw: 1, ch: [
      T('⊙', 14, 12, 16, 16, { size: 12, fill: P.accent }),
      T('12 SENSORS ACTIVE · NODE BATTERY 87%', 34, 14, 290, 14, { size: 10, fill: P.fg, weight: 600 }),
    ]}),

    // mini sparkline rows
    F(20, 596, 350, 80, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
      T('24H MOISTURE TREND', 14, 12, 200, 13, { size: 9, fill: P.muted, weight: 700, ls: 2 }),
      // sparkline simulation: horizontal bars at varying heights
      ...[68, 70, 71, 69, 67, 65, 64, 66, 67, 68, 68, 70, 71, 70, 69, 68].map((v, i) => {
        const bh = Math.round((v - 60) * 2.5);
        return F(14 + i * 20, 58 - bh, 14, bh, P.blue + '66', { r: 2 });
      }),
      // overlay the last bar in full accent
      F(14 + 15 * 20, 58 - Math.round((68 - 60) * 2.5), 14, Math.round((68 - 60) * 2.5), P.blue, { r: 2 }),
      T('60%', 326, 50, 20, 10, { size: 8, fill: P.muted, align: 'right' }),
      T('72%', 326, 24, 20, 10, { size: 8, fill: P.blue, align: 'right' }),
    ]}),

    BottomNav(2),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — AI Recommendations (ranked action intelligence)
// ══════════════════════════════════════════════════════════════════════════════
function screenRecommendations(ox) {
  const recs = [
    { priority: '01', title: 'Reduce phosphorus inputs', detail: 'P levels 18% above threshold in topsoil. Skip next P-fertilizer application.', impact: 'HIGH', color: P.red, tag: 'SOIL BALANCE' },
    { priority: '02', title: 'Irrigate West Sector A', detail: 'Moisture at 52% — approaching stress level. Schedule irrigation within 48 hrs.', impact: 'MED', color: P.amber, tag: 'WATER STRESS' },
    { priority: '03', title: 'Cover crop window open', detail: 'Soil temperature 18°C + rain forecast. Optimal 10-day window for legume seeding.', impact: 'MED', color: P.blue, tag: 'OPPORTUNITY' },
    { priority: '04', title: 'pH adjustment recommended', detail: 'Deep layer trending alkaline. Apply 200 kg/ha agricultural lime within 3 weeks.', impact: 'LOW', color: P.accent, tag: 'SOIL HEALTH' },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    // ambient glow
    ...Glow(195, 180, 100, P.accent),
    ...Glow(350, 700, 70, P.red),

    // status bar
    T('06:42', 20, 18, 60, 14, { size: 11, weight: 600, fill: P.fg }),
    T('4 NEW', 310, 17, 60, 16, { size: 9, fill: P.red, weight: 700, ls: 0.8, align: 'right' }),

    // heading
    T('AI', 20, 44, 300, 52, { size: 46, weight: 900, ls: 6, fill: P.accent }),
    T('ACTIONS', 20, 92, 300, 52, { size: 46, weight: 900, ls: 2, fill: P.fg }),
    T('RANKED BY FIELD IMPACT · UPDATED TODAY', 20, 144, 290, 14, { size: 9, fill: P.muted, ls: 1.5, weight: 600 }),

    // recommendation cards
    ...recs.map((r, i) => {
      const ry = 172 + i * 138;
      return F(20, ry, 350, 126, P.surface, { r: 16, stroke: r.color + '22', sw: 1, ch: [
        // priority number — large editorial
        T(r.priority, 16, 10, 50, 46, { size: 40, weight: 900, fill: r.color + '33', ls: -1 }),
        T(r.priority, 16, 10, 50, 46, { size: 40, weight: 900, fill: r.color, ls: -1, opacity: 0.9 }),

        // content
        T(r.title, 68, 14, 240, 18, { size: 13, weight: 700, fill: P.fg }),
        T(r.detail, 68, 34, 256, 40, { size: 10, fill: P.muted + 'CC', lh: 15 }),

        // tags
        Pill(68, 82, r.tag, r.color, { w: r.tag.length * 6 + 16 }),
        Pill(68 + r.tag.length * 6 + 24, 82, `${r.impact} IMPACT`, r.color),

        // bottom CTA line
        Line(14, 108, 322, P.border),
        T('TAKE ACTION →', 14, 112, 200, 12, { size: 8, fill: r.color, weight: 700, ls: 1.5 }),
        T('DISMISS', 280, 112, 56, 12, { size: 8, fill: P.muted, weight: 600, ls: 1, align: 'right' }),
      ]});
    }),

    BottomNav(3),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Season Report (harvest intelligence summary)
// ══════════════════════════════════════════════════════════════════════════════
function screenReport(ox) {
  const crops = [
    { name: 'Wheat',     yield: 6.4,  target: 6.0,  ha: 48, above: true  },
    { name: 'Canola',    yield: 2.1,  target: 2.4,  ha: 35, above: false },
    { name: 'Barley',    yield: 4.8,  target: 5.0,  ha: 27, above: false },
    { name: 'Legumes',   yield: 3.2,  target: 2.8,  ha: 22, above: true  },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    // ambient glow
    ...Glow(80, 300, 100, P.accent),
    ...Glow(310, 700, 80, P.amber),

    // status bar
    T('06:42', 20, 18, 60, 14, { size: 11, weight: 600, fill: P.fg }),
    T('AUTUMN 2025', 260, 17, 110, 14, { size: 9, fill: P.amber, weight: 700, ls: 1, align: 'right' }),

    // heading
    T('SEASON', 20, 44, 300, 52, { size: 40, weight: 900, ls: 4, fill: P.fg }),
    T('REPORT', 20, 88, 300, 52, { size: 40, weight: 900, ls: 4, fill: P.amber }),
    T('ALL FIELDS · 132 HECTARES TOTAL', 20, 136, 280, 14, { size: 9, fill: P.muted, ls: 2.5, weight: 600 }),

    // hero KPI row — 3 big numbers
    F(20, 162, 350, 80, P.surface2, { r: 16, stroke: P.border, sw: 1, ch: [
      // yield
      F(0, 0, 116, 80, 'transparent', { ch: [
        T('5.2', 16, 8, 84, 38, { size: 32, weight: 900, fill: P.accent, ls: -1 }),
        T('t/ha', 74, 26, 36, 16, { size: 11, fill: P.accent, weight: 700 }),
        T('AVG YIELD', 16, 52, 90, 12, { size: 8, fill: P.muted, weight: 700, ls: 1.5 }),
      ]}),
      VLine(116, 16, 48, P.border),
      // revenue
      F(124, 0, 108, 80, 'transparent', { ch: [
        T('$842K', 8, 8, 100, 38, { size: 28, weight: 900, fill: P.fg, ls: -1 }),
        T('REVENUE', 8, 52, 100, 12, { size: 8, fill: P.muted, weight: 700, ls: 1.5 }),
      ]}),
      VLine(234, 16, 48, P.border),
      // vs target
      F(242, 0, 108, 80, 'transparent', { ch: [
        T('+4%', 8, 8, 100, 38, { size: 28, weight: 900, fill: P.accent, ls: -1 }),
        T('VS TARGET', 8, 52, 100, 12, { size: 8, fill: P.muted, weight: 700, ls: 1.5 }),
      ]}),
    ]}),

    // section label
    T('CROP PERFORMANCE', 20, 260, 200, 13, { size: 9, fill: P.muted, weight: 700, ls: 2.5 }),

    // crop rows
    ...crops.map((c, i) => {
      const cy = 280 + i * 80;
      const pct = Math.round((c.yield / c.target) * 100);
      const color = c.above ? P.accent : P.amber;
      return F(20, cy, 350, 68, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
        T(c.name, 14, 10, 140, 16, { size: 13, weight: 700, fill: P.fg }),
        T(`${c.ha} ha`, 14, 28, 80, 14, { size: 10, fill: P.muted }),
        // target vs actual
        T(`${c.yield} t/ha`, 240, 8, 90, 16, { size: 13, weight: 800, fill: color, align: 'right' }),
        T(`TGT ${c.target}`, 240, 26, 90, 13, { size: 9, fill: P.muted, align: 'right' }),
        // progress vs target bar
        ...Bar(14, 50, 260, Math.min(pct, 100), color, { h: 4 }),
        T(`${c.above ? '↑' : '↓'} ${Math.abs(pct - 100)}%`, 280, 44, 56, 14, { size: 9, fill: color, weight: 700, align: 'right' }),
      ]});
    }),

    // export/share bar
    F(20, 620, 350, 44, P.accent + '1A', { r: 14, stroke: P.accent + '44', sw: 1, ch: [
      T('◎', 14, 12, 20, 20, { size: 14, fill: P.accent }),
      T('EXPORT FULL SEASON REPORT', 38, 15, 240, 14, { size: 11, fill: P.accent, weight: 700, ls: 0.5 }),
      T('→', 318, 14, 20, 16, { size: 14, fill: P.accent, align: 'right' }),
    ]}),

    // soil health summary
    F(20, 676, 350, 60, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
      T('◈', 14, 20, 18, 20, { size: 14, fill: P.muted }),
      T('SOIL HEALTH IMPROVED +6 PTS THIS SEASON', 36, 12, 290, 13, { size: 10, fill: P.fg, weight: 600 }),
      T('Organic matter increased in 3 of 4 fields. Continue cover crop program.', 36, 28, 296, 26, { size: 10, fill: P.muted, lh: 15 }),
    ]}),

    BottomNav(4),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// ASSEMBLE DOCUMENT
// ══════════════════════════════════════════════════════════════════════════════
const SCREEN_W = 390;
const SCREEN_H = 844;
const GAP      = 60;
const SCREENS  = 5;

const screens = [
  screenFields(0 * (SCREEN_W + GAP)),
  screenSoilProfile(1 * (SCREEN_W + GAP)),
  screenSensors(2 * (SCREEN_W + GAP)),
  screenRecommendations(3 * (SCREEN_W + GAP)),
  screenReport(4 * (SCREEN_W + GAP)),
];

const doc = {
  version: '2.8',
  name: 'STRATA — Precision Soil Intelligence Platform',
  width:  SCREENS * SCREEN_W + (SCREENS - 1) * GAP,
  height: SCREEN_H,
  fill:   '#02040200',
  children: screens,
};

const outPath = path.join(__dirname, 'strata.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log(`✓ strata.pen written (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
console.log(`  ${SCREENS} screens · ${SCREEN_W}×${SCREEN_H} each`);
console.log(`  Canvas: ${doc.width}×${doc.height}`);
