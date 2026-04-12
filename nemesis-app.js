'use strict';
// nemesis-app.js
// NEMESIS — Tactical UAV Swarm Commander
//
// Challenge: Design a dark tactical ops mobile app inspired by:
// 1. Darknode (Awwwards SOTD March 21, 2026) — "mission-like site blending
//    minimal UI and stealth" for Ukraine's 412th Nemesis brigade drone division.
//    Ultra-sparse 2-color palette, military precision, stealth aesthetic.
// 2. Dark Mode Design showcase — ultra-minimal dark UIs (Linear, Midday, Forge)
//    all trending toward near-black + single electric accent.
// 3. Land-book Runlayer landing — "Enterprise MCPs, Skills & Agents" —
//    terminal/operator grid aesthetic for serious AI/drone tooling.
//
// Palette: near-void black (#080A0A) + electric teal (#00E5B0) — 2 colors only
// Secondary: cool gray text, danger red for threat indicators
// Typography: monospace-heavy, all-caps labels, military brevity
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#080A0A',   // near-void black (Darknode influence — deep stealth)
  surface:  '#0D1010',   // slightly elevated surface
  surface2: '#121515',   // card background
  surface3: '#171C1C',   // lighter card
  border:   '#1E2626',   // subtle dark border
  border2:  '#243030',   // slightly more visible border
  muted:    '#3A4848',   // muted dark teal-gray
  fg:       '#D8E8E8',   // cool near-white
  fg2:      '#8AABAB',   // secondary text (teal-tinted)
  accent:   '#00E5B0',   // electric teal — THE single accent (Darknode 2-color)
  accentDim:'#00E5B044', // dim accent for fills
  danger:   '#FF3A3A',   // threat/danger red
  dangerDim:'#FF3A3A33',
  warn:     '#FFB830',   // warning amber
  warnDim:  '#FFB83033',
  dim:      '#0D1515',   // very dark
};

let _id = 0;
const uid = () => `nm${++_id}`;

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
  fontSize: opts.size || 12,
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

// ── Ambient scan-line grid (Darknode stealth aesthetic) ───────────────────────
const GridLines = (x, y, w, h, spacing = 28) => {
  const lines = [];
  for (let gx = 0; gx < w; gx += spacing) {
    lines.push(F(x + gx, y, 1, h, P.accent + '08'));
  }
  for (let gy = 0; gy < h; gy += spacing) {
    lines.push(F(x, y + gy, w, 1, P.accent + '08'));
  }
  return lines;
};

// ── Radar glow (stealth targeting) ───────────────────────────────────────────
const RadarGlow = (cx, cy, maxR, color = P.accent) => [
  E(cx - maxR*2,   cy - maxR*2,   maxR*4,   maxR*4,   color + '04'),
  E(cx - maxR*1.4, cy - maxR*1.4, maxR*2.8, maxR*2.8, color + '07'),
  E(cx - maxR,     cy - maxR,     maxR*2,   maxR*2,   color + '0D'),
  E(cx - maxR*0.5, cy - maxR*0.5, maxR,     maxR,     color + '16'),
];

// ── Status pill (military brevity) ────────────────────────────────────────────
const TacticalPill = (x, y, label, color) => F(x, y, label.length * 6.8 + 20, 20, color + '1A', {
  r: 3,
  stroke: color + '44',
  sw: 1,
  ch: [
    T(label, 10, 4, label.length * 6.8, 12, { size: 9, fill: color, weight: 700, ls: 1.2 }),
  ],
});

// ── Drone marker (tactical map icon) ─────────────────────────────────────────
const DroneMarker = (x, y, size, color, active = true) => [
  E(x - size/2, y - size/2, size, size, color + (active ? '30' : '18')),
  E(x - size*0.3, y - size*0.3, size*0.6, size*0.6, color + (active ? '60' : '30')),
  F(x - 2, y - 2, 4, 4, color, { r: 1, opacity: active ? 1 : 0.5 }),
];

// ── Threat indicator ──────────────────────────────────────────────────────────
const ThreatDiamond = (x, y, size, color) => [
  F(x - size*0.7, y,          size*1.4, 1,      color + '60'),
  F(x,            y - size*0.7, 1,      size*1.4, color + '60'),
  F(x - size*0.5, y - size*0.5, size,   size,   color + '1A', { r: 3 }),
  F(x - 3, y - 3, 6, 6, color, { r: 1 }),
];

// ── Stat tile ─────────────────────────────────────────────────────────────────
const StatTile = (x, y, w, h, label, value, sub, color) =>
  F(x, y, w, h, P.surface2, { r: 6, stroke: P.border2, sw: 1, ch: [
    T(label, 12, 10, w - 24, 11, { size: 8, fill: P.fg2, ls: 1.8, weight: 700 }),
    T(value, 12, 26, w - 24, 34, { size: 28, fill: color, weight: 800, ls: -1 }),
    T(sub,   12, 60, w - 24, 12, { size: 9, fill: P.muted }),
  ]});

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Mission Operations Overview
// ══════════════════════════════════════════════════════════════════════════════
function screenMissionOverview(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    // subtle grid — Darknode stealth aesthetic
    ...GridLines(0, 0, 390, 844, 40),

    // accent glow (single accent color — 2-color principle)
    ...RadarGlow(195, 420, 180, P.accent),
    ...RadarGlow(340, 80, 60, P.accent),

    // status bar
    T('09:41', 20, 16, 60, 14, { size: 11, weight: 700, fill: P.fg }),
    T('GPS · SIG ●●●●', 260, 16, 110, 14, { size: 9, fill: P.fg2, align: 'right' }),

    // wordmark — massive all-caps, Darknode editorial treatment
    T('NEMESIS', 20, 50, 350, 44, { size: 40, weight: 900, fill: P.accent, ls: 8 }),
    T('TACTICAL UAV OPERATIONS', 20, 96, 300, 13, { size: 9, fill: P.fg2, ls: 3, weight: 600 }),

    // divider
    Line(20, 118, 350, P.border2),

    // THREAT LEVEL — massive centered editorial number
    T('THREAT LEVEL', 20, 136, 350, 12, { size: 9, fill: P.fg2, ls: 2.5, weight: 700 }),
    T('3', 20, 152, 200, 80, { size: 80, fill: P.warn, weight: 900, ls: -4 }),
    T('/5', 144, 192, 60, 32, { size: 22, fill: P.muted }),
    TacticalPill(20, 244, 'ELEVATED', P.warn),
    T('4 enemy UAVs detected in sector', 120, 246, 230, 14, { size: 10, fill: P.fg2 }),

    Line(20, 272, 350, P.border),

    // Mission stat tiles — 2×2 grid
    T('MISSION STATUS', 20, 290, 250, 12, { size: 9, fill: P.fg2, ls: 2.5 }),
    StatTile(20,  308, 166, 86, 'ACTIVE MISSIONS', '3',    'concurrent ops',    P.accent),
    StatTile(204, 308, 166, 86, 'INTERCEPTORS UP', '12',   'drones deployed',   P.fg),
    StatTile(20,  402, 166, 86, 'KILLS TODAY',     '7',    'neutralised UAVs',  P.accent),
    StatTile(204, 402, 166, 86, 'FLIGHT HOURS',    '18.4', 'hours logged',      P.fg2),

    Line(20, 498, 350, P.border),

    // Active missions list
    T('ACTIVE OPERATIONS', 20, 516, 250, 12, { size: 9, fill: P.fg2, ls: 2.5 }),
    ...([
      ['OP-ALPHA-7', 'Sector N-14 · Search & Intercept', 'LIVE',   P.accent, 0],
      ['OP-BRAVO-2', 'Sector W-06 · Holding pattern',    'HOLD',   P.warn,   1],
      ['OP-DELTA-9', 'Sector E-21 · Return to base',     'RTB',    P.fg2,    2],
    ].map(([code, desc, status, color, i]) =>
      F(20, 534 + i * 66, 350, 58, P.surface2, { r: 6, stroke: i === 0 ? P.accent + '33' : P.border, sw: 1, ch: [
        // left accent bar
        F(0, 0, 3, 58, color, { opacity: i === 0 ? 1 : 0.4 }),
        T(code, 14, 11, 180, 14, { size: 11, weight: 800, fill: P.fg, ls: 1 }),
        T(desc, 14, 30, 260, 13, { size: 10, fill: P.fg2 }),
        TacticalPill(280, 18, status, color),
      ]})
    )),

    // bottom nav
    F(0, 764, 390, 80, P.surface, { ch: [
      Line(0, 0, 390, P.border2),
      ...[['■', 'OPS', 0], ['◎', 'MAP', 1], ['◈', 'SWARM', 2], ['⚠', 'ALERTS', 3]].map(([ic, lb, j]) => {
        const nx = 16 + j * 90;
        return [
          j === 0 ? F(nx + 16, 8, 58, 48, P.accent + '15', { r: 4 }) : null,
          T(ic, nx + 20, 12, 50, 22, { size: 16, fill: j === 0 ? P.accent : P.muted, align: 'center' }),
          T(lb, nx + 8, 38, 68, 12, { size: 9, fill: j === 0 ? P.accent : P.muted, align: 'center', weight: j === 0 ? 800 : 400, ls: 1 }),
        ].filter(Boolean);
      }).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Tactical Map (Grid-based, Darknode spatial aesthetic)
// ══════════════════════════════════════════════════════════════════════════════
function screenTacticalMap(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    // base grid — strong tactical grid, central to Darknode stealth UI
    ...GridLines(0, 0, 390, 460, 30),

    // Map zone background
    F(0, 56, 390, 420, P.dim),

    // Map grid overlay (tighter over the map area)
    ...GridLines(0, 56, 390, 420, 30),

    // Status bar
    T('09:41', 20, 16, 60, 14, { size: 11, weight: 700, fill: P.fg }),
    T('GPS · SIG ●●●●', 260, 16, 110, 14, { size: 9, fill: P.fg2, align: 'right' }),

    // Screen title
    T('TACTICAL MAP', 20, 36, 200, 14, { size: 9, fill: P.accent, ls: 3, weight: 800 }),
    TacticalPill(280, 32, 'LIVE', P.accent),

    // Sector labels (military grid)
    ...[['N-14', 30, 80], ['N-15', 140, 80], ['N-16', 250, 80], ['N-17', 340, 80]].map(([l,x,y]) =>
      T(l, x, y, 80, 10, { size: 8, fill: P.muted, ls: 0.5 })
    ),
    ...[['W-06', 4, 140], ['W-07', 4, 200], ['E-21', 4, 260], ['E-22', 4, 320]].map(([l,x,y]) =>
      T(l, x, y, 28, 10, { size: 7, fill: P.muted, ls: 0 })
    ),

    // Sector zones
    F(32, 96, 118, 100, P.accent + '08', { r: 2, stroke: P.accent + '30', sw: 1 }),   // Alpha zone
    F(32, 200, 118, 80, P.warn + '08',   { r: 2, stroke: P.warn + '25',   sw: 1 }),   // Bravo zone
    F(180, 280, 100, 90, P.fg2 + '06',  { r: 2, stroke: P.fg2 + '18',    sw: 1 }),   // Delta zone

    // Friendly interceptor drones (teal markers)
    ...DroneMarker(80,  142, 18, P.accent, true),   // Alpha-1 active
    ...DroneMarker(112, 162, 18, P.accent, true),   // Alpha-2 active
    ...DroneMarker(60,  162, 18, P.accent, true),   // Alpha-3 active
    ...DroneMarker(80,  225, 16, P.warn, true),     // Bravo-1 holding
    ...DroneMarker(230, 320, 14, P.fg2, false),     // Delta returning

    // Enemy UAV threats (danger markers — crosshairs)
    ...ThreatDiamond(200, 120, 10, P.danger),
    ...ThreatDiamond(290, 150, 10, P.danger),
    ...ThreatDiamond(160, 200, 8,  P.danger),
    ...ThreatDiamond(250, 190, 8,  P.danger),

    // Targeting ring around main threat
    E(180, 100, 60, 60, P.danger + '00', { stroke: P.danger + '50', sw: 1 }),
    E(175, 95, 70, 70, P.danger + '00', { stroke: P.danger + '20', sw: 1 }),

    // intercept vector line (simulated)
    F(80, 142, 120, 1, P.accent + '50'),
    F(80, 142, 1, 60, P.accent + '30'),

    // Map overlay divider
    Line(0, 476, 390, P.border2),

    // Legend + status strip
    F(0, 476, 390, 44, P.surface2, { ch: [
      T('■ FRIENDLY', 16, 15, 90, 14, { size: 9, fill: P.accent, weight: 700 }),
      T('◆ THREAT', 120, 15, 80, 14, { size: 9, fill: P.danger, weight: 700 }),
      T('● HOLDING', 214, 15, 80, 14, { size: 9, fill: P.warn, weight: 700 }),
      T('○ RTB', 300, 15, 60, 14, { size: 9, fill: P.fg2, weight: 700 }),
    ]}),

    // Intercept data table
    T('INTERCEPT VECTORS', 20, 532, 250, 12, { size: 9, fill: P.fg2, ls: 2.5 }),
    ...([
      ['ALPHA-7 → T-214', '280° · 1.2km', '14s ETA', P.accent],
      ['ALPHA-7 → T-219', '264° · 2.1km', '28s ETA', P.accent],
      ['BRAVO-2 → T-183', 'On hold',      '—',        P.warn],
    ].map(([title, vec, eta, color], i) =>
      F(20, 550 + i * 60, 350, 52, P.surface2, { r: 6, stroke: P.border, sw: 1, ch: [
        F(0, 0, 3, 52, color, { opacity: 0.6 }),
        T(title, 14, 9, 200, 14, { size: 11, weight: 700, fill: P.fg }),
        T(vec, 14, 27, 200, 13, { size: 10, fill: P.fg2 }),
        T(eta, 280, 18, 60, 14, { size: 11, fill: color, align: 'right', weight: 700 }),
      ]})
    )),

    // bottom nav
    F(0, 764, 390, 80, P.surface, { ch: [
      Line(0, 0, 390, P.border2),
      ...[['■', 'OPS', 0], ['◎', 'MAP', 1], ['◈', 'SWARM', 2], ['⚠', 'ALERTS', 3]].map(([ic, lb, j]) => {
        const nx = 16 + j * 90;
        return [
          j === 1 ? F(nx + 16, 8, 58, 48, P.accent + '15', { r: 4 }) : null,
          T(ic, nx + 20, 12, 50, 22, { size: 16, fill: j === 1 ? P.accent : P.muted, align: 'center' }),
          T(lb, nx + 8, 38, 68, 12, { size: 9, fill: j === 1 ? P.accent : P.muted, align: 'center', weight: j === 1 ? 800 : 400, ls: 1 }),
        ].filter(Boolean);
      }).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Swarm Status (Individual drone health grid)
// ══════════════════════════════════════════════════════════════════════════════
function screenSwarmStatus(ox) {
  const drones = [
    { id: 'NMS-01', mission: 'OP-ALPHA-7', battery: 78, signal: 94, alt: 120, status: 'INTERCEPT', color: P.accent },
    { id: 'NMS-02', mission: 'OP-ALPHA-7', battery: 65, signal: 88, alt: 115, status: 'PURSUIT',   color: P.accent },
    { id: 'NMS-03', mission: 'OP-ALPHA-7', battery: 52, signal: 91, alt: 108, status: 'PATROL',    color: P.accent },
    { id: 'NMS-04', mission: 'OP-BRAVO-2', battery: 88, signal: 76, alt: 80,  status: 'HOLDING',   color: P.warn   },
    { id: 'NMS-05', mission: 'OP-BRAVO-2', battery: 71, signal: 82, alt: 85,  status: 'HOLDING',   color: P.warn   },
    { id: 'NMS-06', mission: 'OP-DELTA-9', battery: 24, signal: 68, alt: 60,  status: 'RTB ⚠',     color: P.danger },
    { id: 'NMS-07', mission: 'OP-DELTA-9', battery: 38, signal: 72, alt: 55,  status: 'RTB',       color: P.fg2    },
    { id: 'NMS-08', mission: '—',          battery: 100,signal: 0,  alt: 0,   status: 'STANDBY',   color: P.muted  },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...GridLines(0, 0, 390, 844, 44),
    ...RadarGlow(330, 100, 80, P.accent),

    T('09:41', 20, 16, 60, 14, { size: 11, weight: 700, fill: P.fg }),
    T('GPS · SIG ●●●●', 260, 16, 110, 14, { size: 9, fill: P.fg2, align: 'right' }),

    T('SWARM', 20, 46, 250, 36, { size: 34, weight: 900, fill: P.accent, ls: 6 }),
    T('UNIT STATUS — 8 INTERCEPTORS', 20, 86, 300, 13, { size: 9, fill: P.fg2, ls: 2.5 }),

    // Fleet summary strip
    F(20, 106, 350, 52, P.surface2, { r: 6, stroke: P.border2, sw: 1, ch: [
      VLine(88, 10, 32, P.border),
      VLine(176, 10, 32, P.border),
      VLine(264, 10, 32, P.border),
      T('ACTIVE',  10, 9, 76, 12, { size: 8, fill: P.fg2, ls: 1.5 }),
      T('5',       10, 24, 76, 20, { size: 18, weight: 800, fill: P.accent }),
      T('HOLDING',  98, 9, 76, 12, { size: 8, fill: P.fg2, ls: 1.5 }),
      T('2',        98, 24, 76, 20, { size: 18, weight: 800, fill: P.warn }),
      T('RTB',     186, 9, 76, 12, { size: 8, fill: P.fg2, ls: 1.5 }),
      T('2',       186, 24, 76, 20, { size: 18, weight: 800, fill: P.fg2 }),
      T('STANDBY', 274, 9, 76, 12, { size: 8, fill: P.fg2, ls: 1.5 }),
      T('1',       274, 24, 76, 20, { size: 18, weight: 800, fill: P.muted }),
    ]}),

    Line(20, 166, 350, P.border),
    T('UNIT TELEMETRY', 20, 180, 250, 12, { size: 9, fill: P.fg2, ls: 2.5 }),

    // Drone rows
    ...drones.map((d, i) => {
      const battColor = d.battery < 30 ? P.danger : d.battery < 55 ? P.warn : P.accent;
      const battW = Math.round(100 * d.battery / 100);
      return F(20, 198 + i * 70, 350, 62, i === 5 ? P.dangerDim : P.surface2, {
        r: 6,
        stroke: d.status.includes('⚠') ? P.danger + '44' : P.border,
        sw: 1,
        ch: [
          F(0, 0, 3, 62, d.color, { opacity: 0.8 }),
          // ID + mission
          T(d.id, 12, 9, 90, 14, { size: 11, weight: 800, fill: P.fg }),
          T(d.mission, 12, 27, 100, 12, { size: 9, fill: P.fg2 }),
          TacticalPill(12, 42, d.status, d.color),
          // battery bar
          T('BAT', 122, 9, 30, 10, { size: 7, fill: P.muted, ls: 1 }),
          F(122, 20, 100, 6, P.border2, { r: 3 }),
          F(122, 20, battW, 6, battColor, { r: 3 }),
          T(d.battery + '%', 230, 16, 36, 12, { size: 9, fill: battColor, weight: 700, align: 'right' }),
          // signal + alt
          T('SIG', 270, 9, 30, 10, { size: 7, fill: P.muted, ls: 1 }),
          T(d.signal + '%', 270, 20, 70, 14, { size: 11, fill: P.fg2, weight: 600 }),
          T('ALT', 270, 36, 30, 10, { size: 7, fill: P.muted, ls: 1 }),
          T(d.alt + 'm', 270, 46, 70, 14, { size: 11, fill: d.alt > 0 ? P.fg : P.muted, weight: 600 }),
        ],
      });
    }),

    // bottom nav
    F(0, 764, 390, 80, P.surface, { ch: [
      Line(0, 0, 390, P.border2),
      ...[['■', 'OPS', 0], ['◎', 'MAP', 1], ['◈', 'SWARM', 2], ['⚠', 'ALERTS', 3]].map(([ic, lb, j]) => {
        const nx = 16 + j * 90;
        return [
          j === 2 ? F(nx + 16, 8, 58, 48, P.accent + '15', { r: 4 }) : null,
          T(ic, nx + 20, 12, 50, 22, { size: 16, fill: j === 2 ? P.accent : P.muted, align: 'center' }),
          T(lb, nx + 8, 38, 68, 12, { size: 9, fill: j === 2 ? P.accent : P.muted, align: 'center', weight: j === 2 ? 800 : 400, ls: 1 }),
        ].filter(Boolean);
      }).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Mission Brief (Classified document aesthetic)
// ══════════════════════════════════════════════════════════════════════════════
function screenMissionBrief(ox) {
  const briefLines = [
    ['OPERATION CODE',    'ALPHA-7'],
    ['CLASSIFICATION',    '// TOP SECRET //'],
    ['SECTOR',            'NORTH GRID N-14'],
    ['PRIMARY OBJECTIVE', 'NEUTRALIZE HOSTILE UAV SWARM'],
    ['THREAT CLASS',      'ENEMY KAMIKAZE DRONES × 4'],
    ['ENGAGEMENT RULES',  'INTERCEPT ONLY — NO KINETIC'],
    ['ALT BAND',          '80m – 200m AGL'],
    ['COMM FREQ',         '433.92 MHz / AES-256'],
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...GridLines(0, 0, 390, 844, 44),

    T('09:41', 20, 16, 60, 14, { size: 11, weight: 700, fill: P.fg }),
    T('GPS · SIG ●●●●', 260, 16, 110, 14, { size: 9, fill: P.fg2, align: 'right' }),

    // CLASSIFIED header — Darknode minimal editorial
    F(20, 46, 350, 44, P.danger + '18', { r: 4, stroke: P.danger + '44', sw: 1, ch: [
      T('// CLASSIFIED //  TOP SECRET  // CLASSIFIED //', 0, 14, 350, 16,
        { size: 9, fill: P.danger, align: 'center', ls: 2, weight: 800 }),
    ]}),

    T('MISSION\nBRIEF', 20, 100, 350, 72, { size: 40, weight: 900, fill: P.fg, ls: -1, lh: 1.1 }),
    T('OP-ALPHA-7 · ISSUED 09:00 UTC · 2026-03-21', 20, 174, 350, 13, { size: 9, fill: P.accent, ls: 1.5 }),

    Line(20, 194, 350, P.border2),

    // Brief data table
    ...briefLines.map(([label, value], i) =>
      F(20, 204 + i * 48, 350, 40, i % 2 === 0 ? P.surface2 : P.dim, { r: 4, ch: [
        T(label, 12, 13, 150, 14, { size: 9, fill: P.fg2, weight: 700, ls: 1 }),
        T(value, 170, 13, 168, 14, { size: 10, fill: label === 'CLASSIFICATION' ? P.danger : P.accent, weight: 700, ls: 0.5 }),
      ]})
    ),

    Line(20, 592, 350, P.border2),

    // Coordinates block
    T('TARGET COORDINATES', 20, 608, 250, 12, { size: 9, fill: P.fg2, ls: 2.5 }),
    F(20, 626, 350, 72, P.surface2, { r: 6, stroke: P.accent + '30', sw: 1, ch: [
      T('48.127° N', 16, 12, 150, 22, { size: 18, weight: 800, fill: P.accent }),
      T('37.744° E', 16, 36, 150, 22, { size: 18, weight: 800, fill: P.accent }),
      T('LAT',  190, 14, 50, 12, { size: 8, fill: P.muted, ls: 1 }),
      T('LON',  190, 38, 50, 12, { size: 8, fill: P.muted, ls: 1 }),
      T('DONBAS FRONT SECTOR N-14', 246, 20, 90, 24, { size: 9, fill: P.fg2, align: 'right', lh: 1.4 }),
    ]}),

    // Authorize button
    F(20, 712, 350, 44, P.accent, { r: 6, ch: [
      T('AUTHORIZE & DEPLOY', 0, 12, 350, 20, { size: 12, weight: 900, fill: P.bg, align: 'center', ls: 3 }),
    ]}),

    // bottom nav
    F(0, 764, 390, 80, P.surface, { ch: [
      Line(0, 0, 390, P.border2),
      ...[['■', 'OPS', 0], ['◎', 'MAP', 1], ['◈', 'SWARM', 2], ['⚠', 'ALERTS', 3]].map(([ic, lb, j]) => {
        const nx = 16 + j * 90;
        return [
          T(ic, nx + 20, 12, 50, 22, { size: 16, fill: P.muted, align: 'center' }),
          T(lb, nx + 8, 38, 68, 12, { size: 9, fill: P.muted, align: 'center', ls: 1 }),
        ];
      }).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Alert Log (Intercept events & threat feed)
// ══════════════════════════════════════════════════════════════════════════════
function screenAlertLog(ox) {
  const alerts = [
    { time: '09:38:12', code: 'INTERCEPT',  msg: 'NMS-01 neutralized T-214 @ N-14', color: P.accent, icon: '✓' },
    { time: '09:36:47', code: 'THREAT',     msg: 'New UAV T-219 detected N-14',     color: P.danger, icon: '◆' },
    { time: '09:34:22', code: 'INTERCEPT',  msg: 'NMS-02 closing on T-219 · 14s',   color: P.accent, icon: '→' },
    { time: '09:31:05', code: 'LOW BAT ⚠',  msg: 'NMS-06 battery critical · 24%',   color: P.danger, icon: '!' },
    { time: '09:28:44', code: 'THREAT',     msg: 'Swarm cluster detected W-06',     color: P.warn,   icon: '◆' },
    { time: '09:25:18', code: 'INTERCEPT',  msg: 'NMS-04 neutralized T-207 @ W-06', color: P.accent, icon: '✓' },
    { time: '09:22:03', code: 'MISSION',    msg: 'OP-DELTA-9 objective complete',    color: P.fg2,    icon: '■' },
    { time: '09:18:55', code: 'THREAT',     msg: 'Hostile IFF ping N-17 · 3 UAVs',  color: P.danger, icon: '◆' },
    { time: '09:15:30', code: 'SYSTEM',     msg: 'Comm handover AES-256 rotated',   color: P.muted,  icon: '◎' },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...GridLines(0, 0, 390, 844, 44),
    ...RadarGlow(60, 760, 100, P.danger),

    T('09:41', 20, 16, 60, 14, { size: 11, weight: 700, fill: P.fg }),
    T('GPS · SIG ●●●●', 260, 16, 110, 14, { size: 9, fill: P.fg2, align: 'right' }),

    T('ALERTS', 20, 46, 280, 36, { size: 34, weight: 900, fill: P.fg, ls: 4 }),
    T('LIVE INTERCEPT & THREAT FEED', 20, 86, 300, 13, { size: 9, fill: P.fg2, ls: 2.5 }),

    // Alert count summary
    F(20, 106, 350, 44, P.surface2, { r: 6, stroke: P.border2, sw: 1, ch: [
      VLine(100, 10, 24, P.border),
      VLine(200, 10, 24, P.border),
      VLine(296, 10, 24, P.border),
      T('INTERCEPTS', 10, 8, 90, 10, { size: 7, fill: P.muted, ls: 1 }),
      T('4', 10, 20, 90, 16, { size: 14, weight: 800, fill: P.accent }),
      T('THREATS',   110, 8, 82, 10, { size: 7, fill: P.muted, ls: 1 }),
      T('3', 110, 20, 82, 16, { size: 14, weight: 800, fill: P.danger }),
      T('WARNINGS',  210, 8, 82, 10, { size: 7, fill: P.muted, ls: 1 }),
      T('2', 210, 20, 82, 16, { size: 14, weight: 800, fill: P.warn }),
      T('SYSTEM',    306, 8, 60, 10, { size: 7, fill: P.muted, ls: 1 }),
      T('1', 306, 20, 60, 16, { size: 14, weight: 800, fill: P.muted }),
    ]}),

    Line(20, 158, 350, P.border2),

    // Alert rows
    ...alerts.map((a, i) =>
      F(20, 166 + i * 64, 350, 56, a.code === 'LOW BAT ⚠' ? P.dangerDim : P.surface2, {
        r: 4,
        stroke: a.code.includes('THREAT') ? P.danger + '33' : P.border,
        sw: 1,
        ch: [
          F(0, 0, 3, 56, a.color, { opacity: 0.7 }),
          T(a.icon, 10, 18, 18, 20, { size: 14, fill: a.color, align: 'center' }),
          T(a.code, 32, 9, 120, 12, { size: 8, fill: a.color, weight: 800, ls: 1.5 }),
          T(a.msg, 32, 26, 240, 14, { size: 10, fill: P.fg }),
          T(a.time, 294, 9, 56, 12, { size: 8, fill: P.muted, align: 'right', ls: 0.5 }),
        ],
      })
    ),

    // bottom nav
    F(0, 764, 390, 80, P.surface, { ch: [
      Line(0, 0, 390, P.border2),
      ...[['■', 'OPS', 0], ['◎', 'MAP', 1], ['◈', 'SWARM', 2], ['⚠', 'ALERTS', 3]].map(([ic, lb, j]) => {
        const nx = 16 + j * 90;
        return [
          j === 3 ? F(nx + 16, 8, 58, 48, P.accent + '15', { r: 4 }) : null,
          j === 3 ? F(nx + 58, 8, 12, 12, P.danger, { r: 6 }) : null,
          T(ic, nx + 20, 12, 50, 22, { size: 16, fill: j === 3 ? P.accent : P.muted, align: 'center' }),
          T(lb, nx + 8, 38, 68, 12, { size: 9, fill: j === 3 ? P.accent : P.muted, align: 'center', weight: j === 3 ? 800 : 400, ls: 1 }),
        ].filter(Boolean);
      }).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// ASSEMBLE & SAVE
// ══════════════════════════════════════════════════════════════════════════════
const SCREEN_W = 390;
const GAP      = 80;

const doc = {
  version: '2.8',
  name: 'NEMESIS — Tactical UAV Swarm Commander',
  width:  5 * SCREEN_W + 6 * GAP,
  height: 844,
  fill:   '#040606',
  children: [
    screenMissionOverview(GAP),
    screenTacticalMap    (GAP + (SCREEN_W + GAP)),
    screenSwarmStatus    (GAP + (SCREEN_W + GAP) * 2),
    screenMissionBrief   (GAP + (SCREEN_W + GAP) * 3),
    screenAlertLog       (GAP + (SCREEN_W + GAP) * 4),
  ],
};

const outPath = path.join(__dirname, 'nemesis.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log('✓ nemesis.pen written —', Math.round(fs.statSync(outPath).size / 1024) + 'KB');
console.log('  5 screens: Mission Overview · Tactical Map · Swarm Status · Mission Brief · Alert Log');
console.log('  Palette: void black #080A0A · electric teal #00E5B0 (2-color Darknode principle)');
