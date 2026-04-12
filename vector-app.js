// VECTOR — Autonomous Freight Intelligence
// Design Heartbeat #7
// Inspired by: Waabi (Awwwards SOTD) cinematic Physical AI brand +
//              Atlas Card (godly.website) ultra-premium dark luxury aesthetic
// NEW: Mobile (375×812) + Desktop (1440×900) views in one file
//
// Palette: near-black #050509, warm-white #f4f0e8, brass #c8a84b, signal-blue #3a8fff
// 5 mobile screens + 5 desktop screens = 10 total

const fs = require('fs');

// ── IDs ─────────────────────────────────────────────────────────────────────
let _id = 0;
const uid = () => `v${++_id}`;

// ── Palette ──────────────────────────────────────────────────────────────────
const VOID   = '#050509';
const INK    = '#0b0b12';
const SURFACE= '#111118';
const DIM    = '#1a1a24';
const BORDER = '#242430';
const MUTED  = '#5a5a70';
const WARM   = '#f4f0e8';
const BRASS  = '#c8a84b';
const BLUE   = '#3a8fff';
const GREEN  = '#3acd7a';
const RED    = '#cd3a4e';
const AMBER  = '#cd8c3a';

// ── Canvas layout ─────────────────────────────────────────────────────────
const MW = 375, MH = 812;    // mobile
const DW = 1440, DH = 900;   // desktop
const MGAP = 60;              // gap between mobile screens
const DGAP = 100;             // gap between desktop screens

// mobile screens start at x=0
const MSX = i => i * (MW + MGAP);
// desktop screens start after all mobile screens + 200px clearance
const DESKTOP_START = 5 * (MW + MGAP) + 200;
const DSX = i => DESKTOP_START + i * (DW + DGAP);

// ── Helpers ──────────────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill || VOID,
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
  fill: opts.fill || WARM,
  textAlign: opts.align || 'left',
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh !== undefined ? { lineHeight: opts.lh } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h,
  fill: fill || VOID,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Line = (x, y, w, opts = {}) => F(x, y, w, 1, opts.fill || BORDER, {});
const VLine = (x, y, h, opts = {}) => F(x, y, 1, h, opts.fill || BORDER, {});

// Corner bracket marks (technical drawing aesthetic from APEX)
const CB = (x, y, w, h, color = BRASS, sz = 10, opacity = 0.6) => [
  F(x, y, sz, 1, color, { opacity }),
  F(x, y, 1, sz, color, { opacity }),
  F(x + w - sz, y, sz, 1, color, { opacity }),
  F(x + w - 1, y, 1, sz, color, { opacity }),
  F(x, y + h - 1, sz, 1, color, { opacity }),
  F(x, y + h - sz, 1, sz, color, { opacity }),
  F(x + w - sz, y + h - 1, sz, 1, color, { opacity }),
  F(x + w - 1, y + h - sz, 1, sz, color, { opacity }),
];

// Stat block
const StatBlock = (x, y, w, h, value, label, accent) => F(x, y, w, h, SURFACE, {
  stroke: BORDER, sw: 1,
  ch: [
    T(value, 0, h/2 - 22, w, 24, { size: 20, weight: 700, fill: accent || BRASS, align: 'center' }),
    T(label, 0, h/2 + 6, w, 14, { size: 9, fill: MUTED, align: 'center', ls: 0.8, weight: 500 }),
  ],
});

// Status pill
const Pill = (label, x, y, bg, fg) => F(x, y, label.length * 6.5 + 16, 22, bg, {
  r: 11,
  ch: [T(label, 8, 4, label.length * 6.5, 14, { size: 10, fill: fg || WARM, weight: 600, ls: 0.3 })],
});

// ═══════════════════════════════════════════════════════════════════
// MOBILE SCREENS (375×812)
// ═══════════════════════════════════════════════════════════════════

// ── Mobile 1 — Hero / Landing ────────────────────────────────────
const mobile1 = F(MSX(0), 0, MW, MH, VOID, { clip: true, ch: [
  // cinematic background grid lines
  ...Array.from({length: 6}, (_, i) => VLine(60 * i + 18, 0, MH, { fill: DIM })),
  Line(0, MH * 0.35, MW, { fill: DIM }),
  Line(0, MH * 0.7, MW, { fill: DIM }),

  // status bar
  T('9:41', 16, 14, 60, 16, { size: 12, weight: 600 }),
  T('●●●●', MW - 80, 14, 70, 16, { size: 9, fill: MUTED }),

  // logo nav
  T('VECTOR', 20, 46, 140, 22, { size: 16, weight: 800, ls: 3, fill: WARM }),
  T('▤', MW - 36, 46, 20, 20, { size: 18, fill: MUTED }),

  // hero headline — cinematic oversized
  T('Move more.', 20, 110, 335, 60, { size: 46, weight: 800, ls: -1.5, lh: 52, fill: WARM }),
  T('Think less.', 20, 162, 335, 60, { size: 46, weight: 800, ls: -1.5, fill: BRASS }),

  // subhead
  T('Autonomous freight intelligence\nfor fleets that can\'t afford to stop.', 20, 232, 310, 42, {
    size: 13, fill: MUTED, ls: 0.1, lh: 21,
  }),

  // CTA button
  F(20, 290, 200, 50, BRASS, { r: 4, ch: [
    T('Request access', 0, 14, 200, 22, { size: 13, weight: 700, fill: VOID, align: 'center', ls: 0.5 }),
  ]}),
  T('Invite only', 228, 305, 100, 18, { size: 10, fill: MUTED, ls: 0.3 }),

  // divider
  Line(20, 360, 335, { fill: BORDER }),

  // social proof
  T('TRUSTED BY', 20, 376, 120, 14, { size: 9, fill: MUTED, ls: 2, weight: 600 }),
  T('FedEx  ·  DHL  ·  Volvo  ·  J.B. Hunt', 20, 396, 320, 16, { size: 12, fill: MUTED, opacity: 0.7, ls: 0.3 }),

  // metrics
  F(20, 430, 335, 100, SURFACE, { stroke: BORDER, ch: [
    ...CB(0, 0, 335, 100, BRASS, 8),
    StatBlock(8, 8, 100, 84, '99.4%', 'UPTIME', GREEN),
    VLine(108, 8, 84, { fill: BORDER }),
    StatBlock(109, 8, 108, 84, '2.4B mi', 'AUTONOMOUS', BLUE),
    VLine(217, 8, 84, { fill: BORDER }),
    StatBlock(218, 8, 109, 84, '0.003%', 'INCIDENT', RED),
  ]}),

  // bottom tagline
  T('Physical AI for the logistics edge.', 20, 548, 300, 16, { size: 11, fill: MUTED, ls: 0.2 }),
  T('Built to think. Born to haul.', 20, 568, 280, 16, { size: 11, fill: BRASS, ls: 0.2 }),

  // scroll indicator
  T('scroll ↓', MW/2 - 30, MH - 80, 60, 14, { size: 10, fill: MUTED, align: 'center', ls: 1 }),
  Line(0, MH - 1, MW, { fill: BORDER }),
]});

// ── Mobile 2 — Fleet Overview ─────────────────────────────────────
const truckRow = (x, y, id, route, status, eta, statusCol) => F(x, y, 335, 64, SURFACE, {
  stroke: BORDER,
  ch: [
    // status bar left
    F(0, 8, 3, 48, statusCol, { r: 2 }),
    // truck ID
    T(id, 14, 10, 80, 16, { size: 12, weight: 700, fill: WARM }),
    // route
    T(route, 14, 30, 200, 13, { size: 10, fill: MUTED }),
    // status pill
    Pill(status, 220, 12, statusCol + '22', statusCol),
    // ETA
    T('ETA ' + eta, 220, 34, 110, 12, { size: 10, fill: MUTED }),
    // arrow
    T('›', MW - 36, 22, 16, 20, { size: 18, fill: MUTED }),
  ],
});

const mobile2 = F(MSX(1), 0, MW, MH, VOID, { clip: true, ch: [
  // grid bg
  ...Array.from({length: 4}, (_, i) => VLine(80 * i + 20, 0, MH, { fill: DIM })),

  // status bar
  T('9:41', 16, 14, 60, 16, { size: 12, weight: 600 }),

  // header
  T('VECTOR', 20, 46, 140, 22, { size: 16, weight: 800, ls: 3, fill: WARM }),
  T('Fleet', 20, 74, 200, 28, { size: 22, weight: 800, ls: -0.5, fill: WARM }),
  T('24 active  ·  3 alerts', 20, 104, 200, 15, { size: 11, fill: MUTED }),

  // filter tabs
  F(20, 126, 335, 34, DIM, { r: 6, ch: [
    F(2, 2, 80, 30, SURFACE, { r: 4, ch: [T('All', 0, 7, 80, 16, { size: 11, fill: WARM, align: 'center', weight: 600 })] }),
    T('Active', 92, 9, 60, 16, { size: 11, fill: MUTED, align: 'center' }),
    T('Alert', 162, 9, 50, 16, { size: 11, fill: MUTED, align: 'center' }),
    T('Idle', 222, 9, 40, 16, { size: 11, fill: MUTED, align: 'center' }),
  ]}),

  // truck list
  truckRow(20, 172, 'VX-1041', 'Dallas → Memphis', 'ON ROUTE', '14:22', GREEN),
  truckRow(20, 246, 'VX-1038', 'Chicago → Detroit', 'ALERT', '16:05', RED),
  truckRow(20, 320, 'VX-1052', 'LA → Phoenix', 'ON ROUTE', '11:40', GREEN),
  truckRow(20, 394, 'VX-1019', 'Houston → Austin', 'ON ROUTE', '09:55', GREEN),
  truckRow(20, 468, 'VX-1063', 'Atlanta → Miami', 'IDLE', '—', MUTED),
  truckRow(20, 542, 'VX-1077', 'Denver → SLC', 'ON ROUTE', '18:10', GREEN),

  // summary bar
  F(0, MH - 80, MW, 80, SURFACE, { ch: [
    Line(0, 0, MW),
    StatBlock(0, 4, MW / 3, 72, '24', 'ACTIVE', GREEN),
    VLine(MW/3, 8, 56, {}),
    StatBlock(MW/3, 4, MW/3, 72, '3', 'ALERTS', RED),
    VLine(MW*2/3, 8, 56, {}),
    StatBlock(MW*2/3, 4, MW/3, 72, '7', 'IDLE', MUTED),
  ]}),
]});

// ── Mobile 3 — Route Detail ───────────────────────────────────────
const mobile3 = F(MSX(2), 0, MW, MH, VOID, { clip: true, ch: [
  // grid
  ...Array.from({length: 4}, (_, i) => VLine(80 * i + 20, 0, 300, { fill: DIM })),
  Line(0, 300, MW, { fill: DIM }),

  // status bar
  T('9:41', 16, 14, 60, 16, { size: 12, weight: 600 }),
  T('← Fleet', 16, 46, 80, 16, { size: 11, fill: MUTED }),

  // truck hero
  T('VX-1041', 20, 70, 280, 30, { size: 24, weight: 800, ls: -0.5, fill: WARM }),
  T('Dallas, TX  →  Memphis, TN', 20, 104, 310, 16, { size: 12, fill: MUTED }),
  Pill('ON ROUTE', 20, 126, GREEN + '22', GREEN),

  // map placeholder
  F(0, 156, MW, 144, DIM, { ch: [
    // simulated route line
    F(30, 72, 315, 2, BRASS, { opacity: 0.4 }),
    // origin dot
    E(24, 64, 16, 16, GREEN + '33', {}),
    E(28, 68, 8, 8, GREEN, {}),
    // destination dot
    E(320, 64, 16, 16, BRASS + '33', {}),
    E(324, 68, 8, 8, BRASS, {}),
    // truck position
    E(168, 64, 20, 20, BLUE + '44', {}),
    E(174, 70, 8, 8, BLUE, {}),
    // grid lines
    ...Array.from({length: 5}, (_, i) => Line(0, i * 28 + 14, MW, { fill: SURFACE })),
    ...Array.from({length: 8}, (_, i) => VLine(i * 50 + 12, 0, 144, { fill: SURFACE })),
    // labels
    T('Dallas', 20, 82, 60, 12, { size: 9, fill: GREEN }),
    T('Memphis', 298, 82, 60, 12, { size: 9, fill: BRASS }),
    T('ETA 14:22', 150, 82, 80, 12, { size: 9, fill: BLUE, align: 'center' }),
  ]}),

  // route metrics
  F(20, 316, 335, 80, SURFACE, { stroke: BORDER, ch: [
    StatBlock(0, 0, 80, 80, '847 mi', 'TOTAL', WARM),
    VLine(80, 8, 64, {}),
    StatBlock(81, 0, 80, 80, '312 mi', 'REMAIN', BLUE),
    VLine(161, 8, 64, {}),
    StatBlock(162, 0, 80, 80, '63 mph', 'AVG SPD', GREEN),
    VLine(242, 8, 64, {}),
    StatBlock(243, 0, 92, 80, '5h 22m', 'ETA', BRASS),
  ]}),

  // telemetry
  T('TELEMETRY', 20, 412, 140, 14, { size: 9, fill: MUTED, ls: 2, weight: 600 }),
  Line(20, 428, 335, { fill: BORDER }),

  ...[
    ['Engine temp', '187°F', GREEN],
    ['Fuel level', '68%', WARM],
    ['Tire pressure', '102 PSI', GREEN],
    ['Brake wear', '23%', AMBER],
    ['Load weight', '42,800 lbs', WARM],
    ['Driver hours', '4h 12m', GREEN],
  ].flatMap(([label, value, col], i) => [
    T(label, 20, 436 + i * 36, 200, 16, { size: 12, fill: MUTED }),
    T(value, MW - 100, 436 + i * 36, 80, 16, { size: 12, fill: col, align: 'right', weight: 600 }),
    Line(20, 436 + i * 36 + 26, 335, { fill: BORDER }),
  ]),
]});

// ── Mobile 4 — Safety Dashboard ──────────────────────────────────
const mobile4 = F(MSX(3), 0, MW, MH, VOID, { clip: true, ch: [
  // bg
  ...Array.from({length: 4}, (_, i) => VLine(80 * i + 20, 0, MH, { fill: DIM })),

  T('9:41', 16, 14, 60, 16, { size: 12, weight: 600 }),
  T('VECTOR', 20, 46, 140, 22, { size: 16, weight: 800, ls: 3, fill: WARM }),
  T('Safety', 20, 74, 200, 28, { size: 22, weight: 800, ls: -0.5, fill: WARM }),
  T('Last 30 days', 20, 104, 140, 15, { size: 11, fill: MUTED }),

  // big safety score
  F(20, 126, 335, 110, SURFACE, {
    stroke: BORDER,
    ch: [
      ...CB(0, 0, 335, 110, BRASS, 8),
      T('99.4%', 0, 26, 335, 46, { size: 40, weight: 800, fill: GREEN, align: 'center', ls: -1 }),
      T('FLEET SAFETY SCORE', 0, 76, 335, 14, { size: 9, fill: MUTED, align: 'center', ls: 2, weight: 600 }),
      T('▲ 0.2% from last month', 0, 92, 335, 14, { size: 10, fill: GREEN, align: 'center' }),
    ],
  }),

  // 4-stat grid
  F(20, 248, 335, 100, '#00000000', { ch: [
    StatBlock(0, 0, 163, 100, '0', 'INCIDENTS', GREEN),
    StatBlock(172, 0, 163, 100, '2', 'NEAR-MISS', AMBER),
  ]}),
  F(20, 356, 335, 100, '#00000000', { ch: [
    StatBlock(0, 0, 163, 100, '99.8%', 'UPTIME', BLUE),
    StatBlock(172, 0, 163, 100, '14.2K', 'SAFE MILES', WARM),
  ]}),

  // recent events
  T('RECENT EVENTS', 20, 468, 200, 14, { size: 9, fill: MUTED, ls: 2, weight: 600 }),
  Line(20, 484, 335, { fill: BORDER }),

  ...[
    [GREEN, '✓', 'VX-1041 completed route', '2h ago'],
    [GREEN, '✓', 'VX-1052 AEB test passed', '5h ago'],
    [AMBER, '!', 'VX-1038 lane departure warning', '8h ago'],
    [GREEN, '✓', 'VX-1019 completed route', '11h ago'],
  ].flatMap(([col, icon, text, time], i) => [
    E(20, 492 + i * 44, 10, 10, col + '33', {}),
    E(23, 495 + i * 44, 4, 4, col, {}),
    T(text, 40, 490 + i * 44, 240, 15, { size: 11, fill: WARM }),
    T(time, 300, 490 + i * 44, 60, 14, { size: 10, fill: MUTED, align: 'right' }),
    Line(20, 492 + i * 44 + 30, 335, { fill: BORDER }),
  ]),
]});

// ── Mobile 5 — Operator Profile ──────────────────────────────────
const mobile5 = F(MSX(4), 0, MW, MH, VOID, { clip: true, ch: [
  T('9:41', 16, 14, 60, 16, { size: 12, weight: 600 }),
  T('← Fleet', 16, 46, 80, 16, { size: 11, fill: MUTED }),

  // profile header
  F(0, 68, MW, 140, SURFACE, { ch: [
    Line(0, 0, MW, { fill: BORDER }),
    E(20, 24, 56, 56, BRASS + '33', {}),
    T('MA', 32, 40, 32, 24, { size: 18, weight: 800, fill: BRASS, align: 'center' }),
    T('Marcus Alvarez', 90, 28, 200, 20, { size: 16, weight: 700 }),
    T('Senior Operator  ·  ID #1041', 90, 52, 220, 15, { size: 11, fill: MUTED }),
    Pill('CERTIFIED', 90, 72, BRASS + '22', BRASS),
    Line(0, 104, MW, { fill: BORDER }),
    StatBlock(0, 105, MW/3, 35, '4.9', 'SCORE', GREEN),
    VLine(MW/3, 108, 28, {}),
    StatBlock(MW/3, 105, MW/3, 35, '87K mi', 'DRIVEN', BLUE),
    VLine(MW*2/3, 108, 28, {}),
    StatBlock(MW*2/3, 105, MW/3, 35, '0', 'INCIDENTS', GREEN),
  ]}),

  // current assignment
  T('CURRENT ASSIGNMENT', 20, 222, 220, 14, { size: 9, fill: MUTED, ls: 2, weight: 600 }),
  Line(20, 238, 335, { fill: BORDER }),
  F(20, 244, 335, 70, DIM, { stroke: BORDER, ch: [
    T('VX-1041', 16, 12, 140, 18, { size: 14, weight: 700 }),
    T('Dallas → Memphis', 16, 34, 200, 14, { size: 11, fill: MUTED }),
    Pill('ON ROUTE', 222, 12, GREEN + '22', GREEN),
    T('ETA 14:22', 222, 36, 100, 14, { size: 10, fill: MUTED }),
  ]}),

  // certifications
  T('CERTIFICATIONS', 20, 330, 200, 14, { size: 9, fill: MUTED, ls: 2, weight: 600 }),
  Line(20, 346, 335, { fill: BORDER }),

  ...[
    ['Autonomous Systems L3', '2024', GREEN],
    ['HazMat Transport', '2023', GREEN],
    ['Night Operations', '2023', GREEN],
    ['Mountain Routes', '2022', AMBER],
  ].flatMap(([cert, year, col], i) => [
    T(cert, 20, 354 + i * 40, 240, 16, { size: 12 }),
    T(year, MW - 60, 354 + i * 40, 44, 16, { size: 11, fill: col, align: 'right', weight: 600 }),
    Line(20, 354 + i * 40 + 30, 335, { fill: BORDER }),
  ]),

  // route history
  T('RECENT ROUTES', 20, 524, 180, 14, { size: 9, fill: MUTED, ls: 2, weight: 600 }),
  Line(20, 540, 335, { fill: BORDER }),
  ...[
    ['Dallas → Memphis', '847 mi', 'MAR 14'],
    ['Chicago → Detroit', '281 mi', 'MAR 13'],
    ['LA → Phoenix', '372 mi', 'MAR 11'],
  ].flatMap(([route, dist, date], i) => [
    T(route, 20, 548 + i * 38, 200, 16, { size: 12 }),
    T(dist, 230, 548 + i * 38, 60, 16, { size: 11, fill: BLUE, align: 'right' }),
    T(date, 298, 548 + i * 38, 50, 16, { size: 10, fill: MUTED, align: 'right' }),
    Line(20, 548 + i * 38 + 28, 335, { fill: BORDER }),
  ]),
]});

// ═══════════════════════════════════════════════════════════════════
// DESKTOP SCREENS (1440×900)
// ═══════════════════════════════════════════════════════════════════

// ── Desktop 1 — Landing Page Hero ────────────────────────────────
const desktop1 = F(DSX(0), 0, DW, DH, VOID, { clip: true, ch: [
  // full-bleed cinematic grid
  ...Array.from({length: 12}, (_, i) => VLine(i * 120 + 60, 0, DH, { fill: DIM })),
  ...Array.from({length: 8}, (_, i) => Line(0, i * 112 + 56, DW, { fill: DIM })),

  // top nav
  F(0, 0, DW, 64, VOID, { ch: [
    Line(0, 63, DW, { fill: BORDER }),
    T('VECTOR', 60, 20, 200, 26, { size: 20, weight: 800, ls: 4, fill: WARM }),
    T('Platform', 280, 24, 80, 18, { size: 13, fill: MUTED }),
    T('Fleet', 370, 24, 60, 18, { size: 13, fill: MUTED }),
    T('Safety', 440, 24, 60, 18, { size: 13, fill: MUTED }),
    T('Company', 510, 24, 80, 18, { size: 13, fill: MUTED }),
    F(DW - 220, 14, 120, 36, '#00000000', { stroke: BORDER, r: 4, ch: [
      T('Sign in', 0, 9, 120, 18, { size: 13, fill: MUTED, align: 'center' }),
    ]}),
    F(DW - 90, 14, 30, 36, BRASS, { r: 4, ch: [] }),
    F(DW - 88, 14, 26, 36, BRASS, { r: 4, ch: [
      T('→', 4, 9, 18, 18, { size: 14, fill: VOID, align: 'center', weight: 800 }),
    ]}),
  ]}),

  // hero — left column (cinematic text)
  T('AUTONOMOUS\nFREIGHT\nINTELLIGENCE.', 60, 120, 620, 360, {
    size: 96, weight: 900, ls: -3, lh: 100, fill: WARM,
  }),

  // brass accent line
  F(60, 480, 80, 4, BRASS, {}),

  T('Physical AI for fleets that move the world.\nBuilt to think. Born to haul.', 60, 500, 560, 52, {
    size: 18, fill: MUTED, lh: 28, ls: 0.1,
  }),

  F(60, 570, 220, 52, BRASS, { r: 4, ch: [
    T('Request Access', 0, 14, 220, 24, { size: 15, weight: 700, fill: VOID, align: 'center', ls: 0.8 }),
  ]}),
  F(296, 570, 160, 52, '#00000000', { stroke: BORDER, r: 4, ch: [
    T('Watch demo', 0, 14, 160, 24, { size: 15, fill: WARM, align: 'center', ls: 0.3 }),
  ]}),

  T('Invite only. Powered by Physical AI.', 60, 638, 300, 18, { size: 12, fill: MUTED, ls: 0.2 }),

  // right column — cinematic stat panel
  F(760, 64, 680, DH - 64, DIM, { clip: true, ch: [
    // inner grid
    ...Array.from({length: 6}, (_, i) => VLine(i * 113 + 1, 0, DH - 64, { fill: BORDER })),
    ...Array.from({length: 8}, (_, i) => Line(0, i * 104, 680, { fill: BORDER })),

    // corner brackets
    ...CB(20, 20, 640, DH - 104, BRASS, 14, 0.7),

    // big live counter
    T('2,412,844,012', 0, 80, 680, 80, { size: 56, weight: 800, fill: BRASS, align: 'center', ls: -2 }),
    T('AUTONOMOUS MILES LOGGED', 0, 156, 680, 20, { size: 11, fill: MUTED, align: 'center', ls: 3, weight: 600 }),

    Line(40, 196, 600, { fill: BORDER }),

    // 3 stat boxes
    F(40, 216, 184, 100, SURFACE, { stroke: BORDER, ch: [
      T('99.4%', 0, 24, 184, 32, { size: 26, weight: 800, fill: GREEN, align: 'center' }),
      T('FLEET UPTIME', 0, 62, 184, 14, { size: 9, fill: MUTED, align: 'center', ls: 1.5, weight: 600 }),
    ]}),
    F(248, 216, 184, 100, SURFACE, { stroke: BORDER, ch: [
      T('0.003%', 0, 24, 184, 32, { size: 26, weight: 800, fill: RED, align: 'center' }),
      T('INCIDENT RATE', 0, 62, 184, 14, { size: 9, fill: MUTED, align: 'center', ls: 1.5, weight: 600 }),
    ]}),
    F(456, 216, 184, 100, SURFACE, { stroke: BORDER, ch: [
      T('1B+', 0, 24, 184, 32, { size: 26, weight: 800, fill: BLUE, align: 'center' }),
      T('USD RAISED', 0, 62, 184, 14, { size: 9, fill: MUTED, align: 'center', ls: 1.5, weight: 600 }),
    ]}),

    Line(40, 336, 600, { fill: BORDER }),

    // trust logos
    T('TRUSTED BY', 40, 356, 200, 14, { size: 9, fill: MUTED, ls: 2, weight: 600 }),
    ...[['FedEx', 40], ['DHL', 160], ['Volvo', 270], ['J.B. Hunt', 364], ['Amazon', 480]].map(([name, x]) =>
      T(name, x, 382, 100, 20, { size: 14, fill: MUTED, weight: 600, opacity: 0.5 })
    ),

    Line(40, 420, 600, { fill: BORDER }),

    // feature pills
    T('PLATFORM CAPABILITIES', 40, 440, 280, 14, { size: 9, fill: MUTED, ls: 2, weight: 600 }),
    ...[
      ['Real-time telemetry', 40, 466],
      ['Predictive routing', 40, 502],
      ['Autonomous ops', 40, 538],
      ['AI safety monitoring', 300, 466],
      ['Fleet command center', 300, 502],
      ['Compliance reporting', 300, 538],
    ].flatMap(([label, x, y]) => [
      F(x, y, label.length * 7 + 24, 26, SURFACE, { r: 4, stroke: BORDER, ch: [
        T(label, 10, 6, label.length * 7 + 4, 14, { size: 10, fill: MUTED, weight: 500 }),
      ]}),
    ]),

    // bottom credibility line
    Line(40, 590, 600, { fill: BORDER }),
    T('"Built to think. Born to haul."', 40, 608, 400, 20, { size: 14, fill: BRASS, weight: 600, ls: 0.3 }),
    T('VECTOR INC.  ·  EST. 2024  ·  SAN FRANCISCO, CA', 40, 636, 500, 16, { size: 10, fill: MUTED, ls: 2 }),
  ]}),

  // bottom bar
  F(0, DH - 48, DW, 48, SURFACE, { ch: [
    Line(0, 0, DW, { fill: BORDER }),
    T('© 2024 Vector Inc.  ·  Physical AI for autonomous freight', 60, 14, 500, 18, { size: 12, fill: MUTED }),
    T('Invite only  ·  vector.ai', DW - 200, 14, 160, 18, { size: 12, fill: MUTED, align: 'right' }),
  ]}),
]});

// ── Desktop 2 — Fleet Command Center ─────────────────────────────
const desktop2 = F(DSX(1), 0, DW, DH, VOID, { clip: true, ch: [
  // sidebar
  F(0, 0, 240, DH, SURFACE, { ch: [
    VLine(239, 0, DH, { fill: BORDER }),
    T('VECTOR', 24, 24, 160, 26, { size: 18, weight: 800, ls: 4, fill: WARM }),
    Line(0, 64, 240, { fill: BORDER }),
    // nav items
    ...[
      ['◈ Dashboard', 24, 80, MUTED, false],
      ['◉ Fleet',     24, 116, WARM, true],
      ['◎ Routes',    24, 152, MUTED, false],
      ['◇ Safety',    24, 188, MUTED, false],
      ['◻ Reports',   24, 224, MUTED, false],
    ].flatMap(([label, x, y, fill, active]) => [
      ...(active ? [F(0, y - 8, 3, 36, BRASS, {})] : []),
      T(label, x, y, 180, 20, { size: 13, fill, weight: active ? 600 : 400, ls: active ? 0.3 : 0 }),
    ]),
    Line(0, DH - 80, 240, { fill: BORDER }),
    E(24, DH - 56, 32, 32, BRASS + '33', {}),
    T('MA', 30, DH - 49, 20, 18, { size: 11, fill: BRASS, align: 'center', weight: 700 }),
    T('M. Alvarez', 68, DH - 52, 140, 16, { size: 12, fill: WARM }),
    T('Supervisor', 68, DH - 36, 120, 14, { size: 10, fill: MUTED }),
  ]}),

  // main content area
  // top bar
  F(240, 0, DW - 240, 64, VOID, { ch: [
    Line(0, 63, DW - 240, { fill: BORDER }),
    T('Fleet Overview', 32, 20, 280, 26, { size: 20, weight: 700, ls: -0.3, fill: WARM }),
    T('24 active  ·  3 alerts  ·  7 idle', 340, 24, 300, 18, { size: 13, fill: MUTED }),
    F(DW - 380, 14, 120, 36, '#00000000', { stroke: BORDER, r: 4, ch: [
      T('+ Add truck', 0, 9, 120, 18, { size: 12, fill: MUTED, align: 'center' }),
    ]}),
    F(DW - 250, 14, 140, 36, BRASS, { r: 4, ch: [
      T('Export report', 0, 9, 140, 18, { size: 12, fill: VOID, align: 'center', weight: 700 }),
    ]}),
  ]}),

  // 4-stat summary row
  F(240, 64, DW - 240, 90, VOID, { ch: [
    Line(0, 89, DW - 240, { fill: BORDER }),
    StatBlock(32, 8, 240, 74, '24', 'ACTIVE TRUCKS', GREEN),
    VLine(272, 16, 56, {}),
    StatBlock(278, 8, 240, 74, '3', 'ALERTS', RED),
    VLine(518, 16, 56, {}),
    StatBlock(524, 8, 240, 74, '7', 'IDLE', MUTED),
    VLine(764, 16, 56, {}),
    StatBlock(770, 8, 240, 74, '99.4%', 'UPTIME', BLUE),
  ]}),

  // map area placeholder
  F(240, 154, DW - 240 - 420, DH - 154 - 48, DIM, { ch: [
    Line(0, 0, DW - 240 - 420, { fill: BORDER }),
    // grid lines
    ...Array.from({length: 8}, (_, i) => VLine(i * 97 + 48, 0, DH - 154 - 48, { fill: SURFACE })),
    ...Array.from({length: 6}, (_, i) => Line(0, i * 120 + 60, DW - 660, { fill: SURFACE })),
    T('LIVE MAP', 32, 32, 200, 20, { size: 11, fill: MUTED, ls: 3, weight: 600 }),
    T('Real-time fleet positions', 32, 56, 300, 16, { size: 12, fill: MUTED }),
    // truck dots scattered across map
    ...[[240, 200], [380, 310], [180, 380], [520, 260], [440, 420], [160, 180]].map(([x, y], i) => [
      E(x, y, 20, 20, GREEN + '33', {}),
      E(x + 4, y + 4, 12, 12, GREEN, {}),
    ]).flat(),
    // alert truck
    E(340, 360, 24, 24, RED + '33', {}),
    E(344, 364, 16, 16, RED, {}),
    // route lines (thin)
    F(180, 193, 200, 1, BRASS, { opacity: 0.3 }),
    F(340, 280, 180, 1, BRASS, { opacity: 0.3 }),
  ]}),

  // right panel — truck list
  F(DW - 420, 154, 420, DH - 154 - 48, SURFACE, { clip: true, ch: [
    VLine(0, 0, DH - 154 - 48, { fill: BORDER }),
    T('ACTIVE FLEET', 20, 20, 200, 14, { size: 9, fill: MUTED, ls: 2, weight: 600 }),
    Line(0, 44, 420, { fill: BORDER }),
    // truck rows
    ...[
      ['VX-1041', 'Dallas → Memphis', GREEN, '14:22'],
      ['VX-1038', 'Chicago → Detroit', RED, '—'],
      ['VX-1052', 'LA → Phoenix', GREEN, '11:40'],
      ['VX-1019', 'Houston → Austin', GREEN, '09:55'],
      ['VX-1063', 'Atlanta → Miami', MUTED, '—'],
      ['VX-1077', 'Denver → SLC', GREEN, '18:10'],
      ['VX-1084', 'Seattle → Portland', GREEN, '13:05'],
      ['VX-1092', 'Boston → NYC', AMBER, '14:50'],
    ].flatMap(([id, route, col, eta], i) => [
      F(0, 52 + i * 72, 420, 70, i % 2 === 0 ? '#00000000' : DIM, { ch: [
        F(0, 10, 4, 50, col, { r: 2 }),
        T(id, 20, 14, 120, 18, { size: 14, weight: 700, fill: WARM }),
        T(route, 20, 36, 240, 14, { size: 11, fill: MUTED }),
        Pill(eta === '—' ? 'IDLE' : 'ACTIVE', 300, 14, col + '22', col),
        T(eta !== '—' ? 'ETA ' + eta : '', 300, 38, 100, 12, { size: 10, fill: MUTED }),
        Line(0, 69, 420, { fill: BORDER }),
      ]}),
    ]),
  ]}),

  // bottom bar
  F(240, DH - 48, DW - 240, 48, SURFACE, { ch: [
    Line(0, 0, DW - 240, { fill: BORDER }),
    T('VECTOR Fleet Command  ·  Live data  ·  Updated 0:04 ago', 32, 14, 500, 18, { size: 12, fill: MUTED }),
  ]}),
]});

// ── Desktop 3 — Route Analytics ───────────────────────────────────
const desktop3 = F(DSX(2), 0, DW, DH, VOID, { clip: true, ch: [
  // sidebar (same nav)
  F(0, 0, 240, DH, SURFACE, { ch: [
    VLine(239, 0, DH, { fill: BORDER }),
    T('VECTOR', 24, 24, 160, 26, { size: 18, weight: 800, ls: 4, fill: WARM }),
    Line(0, 64, 240, { fill: BORDER }),
    ...[
      ['◈ Dashboard', 24, 80, MUTED, false],
      ['◉ Fleet',     24, 116, MUTED, false],
      ['◎ Routes',    24, 152, WARM, true],
      ['◇ Safety',    24, 188, MUTED, false],
      ['◻ Reports',   24, 224, MUTED, false],
    ].flatMap(([label, x, y, fill, active]) => [
      ...(active ? [F(0, y - 8, 3, 36, BRASS, {})] : []),
      T(label, x, y, 180, 20, { size: 13, fill, weight: active ? 600 : 400, ls: active ? 0.3 : 0 }),
    ]),
    Line(0, DH - 80, 240, { fill: BORDER }),
    E(24, DH - 56, 32, 32, BRASS + '33', {}),
    T('MA', 30, DH - 49, 20, 18, { size: 11, fill: BRASS, align: 'center', weight: 700 }),
    T('M. Alvarez', 68, DH - 52, 140, 16, { size: 12, fill: WARM }),
    T('Supervisor', 68, DH - 36, 120, 14, { size: 10, fill: MUTED }),
  ]}),

  // top bar
  F(240, 0, DW - 240, 64, VOID, { ch: [
    Line(0, 63, DW - 240, { fill: BORDER }),
    T('Route Analytics', 32, 20, 300, 26, { size: 20, weight: 700, ls: -0.3, fill: WARM }),
    T('VX-1041  ·  Dallas → Memphis', 350, 24, 380, 18, { size: 13, fill: MUTED }),
    Pill('ON ROUTE', DW - 300, 20, GREEN + '22', GREEN),
    T('ETA 14:22  ·  312 mi remain', DW - 300, 42, 200, 14, { size: 11, fill: MUTED }),
  ]}),

  // left — map + route details
  F(240, 64, 720, DH - 112, DIM, { ch: [
    Line(0, 0, 720, { fill: BORDER }),
    // map grid
    ...Array.from({length: 8}, (_, i) => VLine(i * 90, 0, 560, { fill: SURFACE })),
    ...Array.from({length: 7}, (_, i) => Line(0, i * 80 + 40, 720, { fill: SURFACE })),
    T('ROUTE MAP', 24, 20, 200, 14, { size: 9, fill: MUTED, ls: 2, weight: 600 }),
    // route line
    F(60, 220, 600, 3, BRASS, { opacity: 0.5 }),
    // origin
    E(48, 208, 24, 24, GREEN + '33', {}),
    E(54, 214, 12, 12, GREEN, {}),
    T('Dallas', 36, 242, 80, 14, { size: 10, fill: GREEN }),
    // destination
    E(636, 208, 24, 24, BRASS + '33', {}),
    E(642, 214, 12, 12, BRASS, {}),
    T('Memphis', 628, 242, 80, 14, { size: 10, fill: BRASS }),
    // truck
    E(330, 208, 28, 28, BLUE + '44', {}),
    E(336, 214, 16, 16, BLUE, {}),
    T('37% complete', 312, 250, 100, 14, { size: 10, fill: BLUE, align: 'center' }),

    // metrics below map
    Line(0, 400, 720, { fill: BORDER }),
    T('ROUTE METRICS', 24, 416, 200, 14, { size: 9, fill: MUTED, ls: 2, weight: 600 }),
    StatBlock(24, 440, 152, 80, '847 mi', 'TOTAL DIST', WARM),
    StatBlock(184, 440, 152, 80, '312 mi', 'REMAINING', BLUE),
    StatBlock(344, 440, 152, 80, '63 mph', 'AVG SPEED', GREEN),
    StatBlock(504, 440, 152, 80, '5h 22m', 'ETA', BRASS),
    Line(24, 536, 672, { fill: BORDER }),
    T('Fuel used: 124 gal  ·  Efficiency: 6.8 mpg  ·  CO2: 1.2T  ·  Cost: $432', 24, 554, 680, 16, {
      size: 12, fill: MUTED,
    }),
  ]}),

  // right — telemetry panel
  F(960, 64, DW - 960, DH - 112, SURFACE, { clip: true, ch: [
    VLine(0, 0, DH - 112, { fill: BORDER }),
    T('TELEMETRY', 24, 20, 200, 14, { size: 9, fill: MUTED, ls: 2, weight: 600 }),
    Line(0, 44, DW - 960, { fill: BORDER }),
    ...[
      ['Engine temp', '187°F', GREEN],
      ['Fuel level', '68%', WARM],
      ['Tire pressure FR', '102 PSI', GREEN],
      ['Tire pressure RL', '100 PSI', GREEN],
      ['Brake wear F', '23%', AMBER],
      ['Brake wear R', '31%', RED],
      ['Load weight', '42,800 lbs', WARM],
      ['Driver hours', '4h 12m', GREEN],
      ['GPS accuracy', '±2m', BLUE],
      ['Network', '5G / LTE', BLUE],
    ].flatMap(([label, value, col], i) => [
      T(label, 24, 56 + i * 42, 250, 16, { size: 12, fill: MUTED }),
      T(value, DW - 1020, 56 + i * 42, 100, 16, { size: 12, fill: col, align: 'right', weight: 600 }),
      Line(0, 56 + i * 42 + 30, DW - 960, { fill: BORDER }),
    ]),
  ]}),

  // bottom bar
  F(240, DH - 48, DW - 240, 48, SURFACE, { ch: [
    Line(0, 0, DW - 240, { fill: BORDER }),
    T('Route data  ·  Live telemetry feed  ·  Autonomous mode active', 32, 14, 500, 18, { size: 12, fill: MUTED }),
  ]}),
]});

// ── Desktop 4 — Safety Dashboard ──────────────────────────────────
const desktop4 = F(DSX(3), 0, DW, DH, VOID, { clip: true, ch: [
  // sidebar
  F(0, 0, 240, DH, SURFACE, { ch: [
    VLine(239, 0, DH, { fill: BORDER }),
    T('VECTOR', 24, 24, 160, 26, { size: 18, weight: 800, ls: 4, fill: WARM }),
    Line(0, 64, 240, { fill: BORDER }),
    ...[
      ['◈ Dashboard', 24, 80, MUTED, false],
      ['◉ Fleet',     24, 116, MUTED, false],
      ['◎ Routes',    24, 152, MUTED, false],
      ['◇ Safety',    24, 188, WARM, true],
      ['◻ Reports',   24, 224, MUTED, false],
    ].flatMap(([label, x, y, fill, active]) => [
      ...(active ? [F(0, y - 8, 3, 36, BRASS, {})] : []),
      T(label, x, y, 180, 20, { size: 13, fill, weight: active ? 600 : 400 }),
    ]),
  ]}),

  // top bar
  F(240, 0, DW - 240, 64, VOID, { ch: [
    Line(0, 63, DW - 240, { fill: BORDER }),
    T('Safety Dashboard', 32, 20, 300, 26, { size: 20, weight: 700, ls: -0.3, fill: WARM }),
    T('Last 30 days  ·  All trucks', 340, 24, 280, 18, { size: 13, fill: MUTED }),
    Pill('99.4% SCORE', DW - 220, 20, GREEN + '22', GREEN),
  ]}),

  // big score + grid
  F(240, 64, 360, DH - 112, DIM, { ch: [
    Line(0, 0, 360, { fill: BORDER }),
    ...CB(20, 20, 320, DH - 152, BRASS, 12, 0.5),
    T('99.4%', 0, 120, 360, 80, { size: 64, weight: 900, fill: GREEN, align: 'center', ls: -2 }),
    T('FLEET SAFETY\nSCORE', 0, 208, 360, 48, { size: 14, fill: MUTED, align: 'center', ls: 3, lh: 22, weight: 600 }),
    Line(40, 276, 280, { fill: BORDER }),
    T('▲ 0.2% from last period', 0, 296, 360, 18, { size: 12, fill: GREEN, align: 'center' }),
    T('Industry average: 96.1%', 0, 320, 360, 16, { size: 11, fill: MUTED, align: 'center' }),
    Line(40, 356, 280, { fill: BORDER }),
    T('BREAKDOWN', 40, 374, 200, 14, { size: 9, fill: MUTED, ls: 2, weight: 600 }),
    ...[
      ['Incidents', '0', GREEN, 400],
      ['Near-miss', '2', AMBER, 436],
      ['Violations', '0', GREEN, 472],
      ['Hard braking', '7', AMBER, 508],
      ['Speeding', '1', RED, 544],
      ['Lane departures', '3', AMBER, 580],
    ].flatMap(([label, val, col, y]) => [
      T(label, 40, y, 200, 16, { size: 12, fill: MUTED }),
      T(val, 280, y, 40, 16, { size: 12, fill: col, align: 'right', weight: 700 }),
      Line(40, y + 26, 280, { fill: BORDER }),
    ]),
  ]}),

  // middle — events feed
  F(600, 64, 480, DH - 112, VOID, { ch: [
    VLine(0, 0, DH - 112, { fill: BORDER }),
    VLine(479, 0, DH - 112, { fill: BORDER }),
    T('RECENT EVENTS', 24, 20, 280, 14, { size: 9, fill: MUTED, ls: 2, weight: 600 }),
    Line(0, 44, 480, { fill: BORDER }),
    ...[
      [GREEN,  '✓', 'VX-1041 completed route safely', 'Dallas → Memphis', '2h ago'],
      [GREEN,  '✓', 'VX-1052 AEB system test passed', 'LA → Phoenix', '5h ago'],
      [AMBER,  '!', 'VX-1038 lane departure detected', 'Chicago', '8h ago'],
      [GREEN,  '✓', 'VX-1019 completed route safely', 'Houston → Austin', '11h ago'],
      [GREEN,  '✓', 'VX-1077 weather reroute success', 'Denver → SLC', '14h ago'],
      [RED,    '✕', 'VX-1092 hard braking event', 'Boston, MA', '18h ago'],
      [AMBER,  '!', 'VX-1063 speed limit advisory', 'Atlanta', '22h ago'],
      [GREEN,  '✓', 'VX-1084 completed route safely', 'Seattle → Portland', '1d ago'],
    ].flatMap(([col, icon, text, loc, time], i) => [
      E(24, 62 + i * 68, 12, 12, col + '33', {}),
      E(28, 66 + i * 68, 4, 4, col, {}),
      T(text, 50, 58 + i * 68, 340, 16, { size: 12, fill: WARM }),
      T(loc + '  ·  ' + time, 50, 78 + i * 68, 340, 14, { size: 10, fill: MUTED }),
      Line(0, 62 + i * 68 + 48, 480, { fill: BORDER }),
    ]),
  ]}),

  // right — compliance
  F(1080, 64, DW - 1080, DH - 112, SURFACE, { ch: [
    VLine(0, 0, DH - 112, { fill: BORDER }),
    T('COMPLIANCE', 24, 20, 200, 14, { size: 9, fill: MUTED, ls: 2, weight: 600 }),
    Line(0, 44, DW - 1080, { fill: BORDER }),
    ...[
      ['FMCSA Hours of Service', '100%', GREEN],
      ['DOT Vehicle Inspections', '100%', GREEN],
      ['ELD Mandate', '100%', GREEN],
      ['Drug & Alcohol Testing', '98%', GREEN],
      ['Cargo Securement', '99%', GREEN],
      ['Hazmat Compliance', 'N/A', MUTED],
    ].flatMap(([label, value, col], i) => [
      T(label, 24, 58 + i * 52, 260, 16, { size: 12 }),
      T(value, DW - 1140, 58 + i * 52, 60, 16, { size: 12, fill: col, align: 'right', weight: 700 }),
      Line(0, 58 + i * 52 + 36, DW - 1080, { fill: BORDER }),
    ]),
    T('CERTIFICATIONS', 24, 380, 200, 14, { size: 9, fill: MUTED, ls: 2, weight: 600 }),
    Line(0, 396, DW - 1080, { fill: BORDER }),
    ...[
      'ISO 26262 Functional Safety',
      'UL 4600 Autonomous Safety',
      'SAE Level 4 Certification',
    ].flatMap(([label], i) => [
      T(label || '', 24, 412 + i * 44, 300, 16, { size: 12, fill: MUTED }),
      Pill('CERTIFIED', DW - 1140, 412 + i * 44, BRASS + '22', BRASS),
      Line(0, 412 + i * 44 + 34, DW - 1080, { fill: BORDER }),
    ]),
  ]}),

  // bottom bar
  F(240, DH - 48, DW - 240, 48, SURFACE, { ch: [
    Line(0, 0, DW - 240, { fill: BORDER }),
    T('Safety data  ·  30-day rolling window  ·  All 24 trucks included', 32, 14, 600, 18, { size: 12, fill: MUTED }),
  ]}),
]});

// ── Desktop 5 — Company / About ────────────────────────────────────
const desktop5 = F(DSX(4), 0, DW, DH, VOID, { clip: true, ch: [
  // full-bleed cinematic bg lines
  ...Array.from({length: 10}, (_, i) => VLine(i * 144 + 72, 0, DH, { fill: DIM })),
  ...Array.from({length: 7}, (_, i) => Line(0, i * 128 + 64, DW, { fill: DIM })),

  // nav
  F(0, 0, DW, 64, VOID, { ch: [
    Line(0, 63, DW, { fill: BORDER }),
    T('VECTOR', 60, 20, 200, 26, { size: 20, weight: 800, ls: 4, fill: WARM }),
    T('Platform', 280, 24, 80, 18, { size: 13, fill: MUTED }),
    T('Fleet', 370, 24, 60, 18, { size: 13, fill: MUTED }),
    T('Safety', 440, 24, 60, 18, { size: 13, fill: MUTED }),
    T('Company', 510, 24, 80, 18, { size: 13, fill: WARM, weight: 600 }),
    F(DW - 180, 16, 120, 32, BRASS, { r: 4, ch: [
      T('Request Access', 0, 7, 120, 18, { size: 11, fill: VOID, align: 'center', weight: 700 }),
    ]}),
  ]}),

  // left hero text
  T('Moving the world\nforward.', 60, 120, 640, 200, {
    size: 72, weight: 900, ls: -2.5, lh: 84, fill: WARM,
  }),
  F(60, 324, 60, 4, BRASS, {}),
  T('We build the intelligence layer for autonomous freight.\nOur Physical AI platform doesn\'t just drive trucks—\nit thinks like a fleet operator.', 60, 344, 560, 80, {
    size: 16, fill: MUTED, lh: 28, ls: 0.1,
  }),
  T('Founded 2024  ·  San Francisco, CA  ·  Series B', 60, 440, 400, 18, { size: 12, fill: MUTED, ls: 0.5 }),

  // right — team panel
  F(760, 64, DW - 760, DH - 64, DIM, { clip: true, ch: [
    VLine(0, 0, DH - 64, { fill: BORDER }),
    T('TEAM', 32, 28, 200, 14, { size: 9, fill: MUTED, ls: 3, weight: 600 }),
    Line(0, 56, DW - 760, { fill: BORDER }),
    ...[
      ['SD', 'Sarah Danovich', 'CEO & Co-Founder', 'ex-Waymo, Stanford AI Lab'],
      ['RK', 'Raj Kumar', 'CTO & Co-Founder', 'ex-Uber ATG, MIT CSAIL'],
      ['MV', 'Maria Vargas', 'VP Engineering', 'ex-Tesla Autopilot'],
      ['JL', 'James Liu', 'VP Safety', 'ex-NHTSA, ex-Boeing'],
      ['AP', 'Anya Petrov', 'VP Product', 'ex-Google, ex-Lyft'],
    ].flatMap(([initials, name, title, bg], i) => [
      E(32, 76 + i * 90, 44, 44, BRASS + '22', {}),
      T(initials, 32, 88 + i * 90, 44, 20, { size: 13, fill: BRASS, align: 'center', weight: 800 }),
      T(name, 90, 80 + i * 90, 400, 18, { size: 14, weight: 700 }),
      T(title, 90, 100 + i * 90, 300, 15, { size: 11, fill: MUTED }),
      T(bg, 90, 118 + i * 90, 400, 13, { size: 10, fill: MUTED, opacity: 0.6 }),
      Line(0, 76 + i * 90 + 74, DW - 760, { fill: BORDER }),
    ]),
    T('BACKED BY', 32, 540, 200, 14, { size: 9, fill: MUTED, ls: 3, weight: 600 }),
    Line(0, 560, DW - 760, { fill: BORDER }),
    ...[['a16z', 80], ['Sequoia', 210], ['Khosla', 360], ['NVIDIA', 500], ['Volvo', 640]].map(([name, x]) =>
      T(name, x, 578, 100, 20, { size: 15, fill: MUTED, weight: 700, opacity: 0.5 })
    ),
    Line(0, 620, DW - 760, { fill: BORDER }),
    T('"We\'re building the operating system for autonomous freight.\nEvery mile logged makes the system smarter."', 32, 638, DW - 820, 44, {
      size: 13, fill: MUTED, lh: 22,
    }),
    T('— Sarah Danovich, CEO', 32, 694, 300, 16, { size: 12, fill: BRASS }),
  ]}),

  // bottom mission bar
  F(0, DH - 48, DW, 48, SURFACE, { ch: [
    Line(0, 0, DW, { fill: BORDER }),
    F(60, 12, 4, 24, BRASS, {}),
    T('Built to think. Born to haul.  ·  VECTOR Inc.  ·  Physical AI for autonomous freight', 76, 14, 700, 18, {
      size: 12, fill: MUTED,
    }),
    T('vector.ai  ·  Invite only', DW - 200, 14, 160, 18, { size: 12, fill: MUTED, align: 'right' }),
  ]}),
]});

// ── Document ─────────────────────────────────────────────────────────────────
const doc = {
  version: '2.8',
  variables: {
    void:    { type: 'color', value: VOID },
    warm:    { type: 'color', value: WARM },
    brass:   { type: 'color', value: BRASS },
    blue:    { type: 'color', value: BLUE },
    muted:   { type: 'color', value: MUTED },
    surface: { type: 'color', value: SURFACE },
  },
  children: [
    mobile1, mobile2, mobile3, mobile4, mobile5,
    desktop1, desktop2, desktop3, desktop4, desktop5,
  ],
};

fs.writeFileSync('vector-app.pen', JSON.stringify(doc, null, 2));
console.log('Wrote vector-app.pen');
console.log('Screens:', doc.children.length, '(5 mobile + 5 desktop)');
let count = 0;
function countNodes(n) { count++; if (n.children) n.children.forEach(countNodes); }
doc.children.forEach(countNodes);
console.log('Total nodes:', count);
