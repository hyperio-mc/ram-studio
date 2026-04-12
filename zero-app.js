'use strict';
// zero-app.js
// ZERO — Autonomous Drone Fleet Intelligence Platform
//
// Challenge: Design a stealth-mode tactical operations dashboard for autonomous
// drone fleet management, inspired by:
//
// 1. DARKNODE (Awwwards SOTD March 21, 2026) — "mission-like site blending
//    minimal UI and stealth" for Ukraine's 412th Nemesis interceptor drone unit.
//    Only 2 colors, hero screen video, 3D animations. Maximum signal, zero noise.
//
// 2. Linear.app (darkmodedesign.com) — functional dark precision, dense data
//    hierarchies, sidebar nav. "The product development system for teams and agents"
//
// 3. Evervault (godly.website featured) — clean security-product dark UI,
//    "Leading companies build on Evervault" — understated authority
//
// Palette: near-void black + neon mint (tactical HUD phosphor) + alert red
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#080810',   // near-void black (darker than typical dark mode)
  surface:  '#0F0F1C',   // elevated surface
  surface2: '#16162A',   // card surface
  surface3: '#1E1E38',   // lighter card
  border:   '#262640',   // subtle tactical border
  muted:    '#44445E',   // muted dim
  fg:       '#C2C4D8',   // cool-white HUD text
  accent:   '#00FFAA',   // neon mint — tactical HUD phosphor (Darknode 2-color influence)
  red:      '#FF3158',   // alert red
  amber:    '#FFB930',   // warning amber
  dim:      '#1A1A30',   // dim fill
};

let _id = 0;
const uid = () => `z${++_id}`;

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

const Line  = (x, y, w, fill = P.border) => F(x, y, w, 1, fill, {});
const VLine = (x, y, h, fill = P.border) => F(x, y, 1, h, fill, {});

// ── Glow ──────────────────────────────────────────────────────────────────────
const Glow = (cx, cy, r, color) => [
  E(cx - r*2.4, cy - r*2.4, r*4.8, r*4.8, color + '04'),
  E(cx - r*1.6, cy - r*1.6, r*3.2, r*3.2, color + '0a'),
  E(cx - r,     cy - r,     r*2,   r*2,   color + '14'),
  E(cx - r*0.5, cy - r*0.5, r,     r,     color + '22'),
];

// ── Status pill ───────────────────────────────────────────────────────────────
const Pill = (x, y, label, color, opts = {}) => {
  const w = opts.w || (label.length * 6.4 + 20);
  return F(x, y, w, 20, color + '1A', {
    r: 10,
    stroke: color + '44',
    sw: 1,
    ch: [
      T(label, 0, 3, w, 14, { size: 9, fill: color, weight: 700, ls: 0.8, align: 'center' }),
    ],
  });
};

// ── Battery bar ───────────────────────────────────────────────────────────────
const BatteryBar = (x, y, pct, color) => [
  F(x, y, 80, 5, P.dim, { r: 2 }),
  F(x, y, Math.round(80 * pct / 100), 5, color, { r: 2, opacity: 0.9 }),
];

// ── Signal dots ───────────────────────────────────────────────────────────────
const SignalDots = (x, y, strength, color) => {
  const dots = [];
  for (let i = 0; i < 4; i++) {
    const h = 4 + i * 3;
    const on = i < strength;
    dots.push(F(x + i * 8, y + (12 - h), 5, h, on ? color : P.muted, { r: 1 }));
  }
  return dots;
};

// ── Coordinate display ────────────────────────────────────────────────────────
const Coord = (x, y, lat, lon) => [
  T(`${lat}° N`, x, y,    100, 12, { size: 9, fill: P.accent, weight: 600, ls: 0.3 }),
  T(`${lon}° E`, x, y+14, 100, 12, { size: 9, fill: P.muted, ls: 0.3 }),
];

// ── Scan line overlay (tactical HUD feel) ────────────────────────────────────
const ScanLine = (x, y, w) => [
  F(x, y, w, 1, P.accent, { opacity: 0.06 }),
  F(x, y + 4, w, 1, P.border, { opacity: 0.5 }),
];

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Mission Control
// ══════════════════════════════════════════════════════════════════════════════
function screenMissionControl(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    // ambient glow — mint signal from active drones
    ...Glow(195, 180, 120, P.accent),
    ...Glow(350, 600, 80, P.red),

    // tactical scan lines
    ...Array.from({length: 8}, (_, i) => ScanLine(0, 90 + i * 94, 390)).flat(),

    // status bar
    T('21:47', 20, 16, 60, 16, { size: 12, weight: 600, fill: P.fg }),
    T('SYS NOMINAL', 270, 16, 100, 16, { size: 9, fill: P.accent, ls: 1, align: 'right', weight: 700 }),

    // wordmark — Darknode-inspired: maximum weight, maximum letter-spacing
    T('ZERO', 20, 48, 280, 44, { size: 40, weight: 900, ls: 8, fill: P.fg }),
    T('FLEET INTELLIGENCE', 20, 96, 240, 14, { size: 9, fill: P.muted, ls: 2.5, weight: 600 }),

    // large hero stat — Darknode's 2-color minimal approach
    T('12', 20, 124, 150, 90, { size: 80, weight: 900, fill: P.accent, ls: -3 }),
    T('ACTIVE', 148, 152, 80, 18, { size: 11, fill: P.fg, weight: 600, ls: 1.5 }),
    T('DRONES', 148, 170, 80, 14, { size: 9, fill: P.muted, ls: 2 }),

    // fleet status strip
    F(20, 218, 350, 60, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
      VLine(116, 10, 40, P.border),
      VLine(233, 10, 40, P.border),
      // AIRBORNE
      T('AIRBORNE', 10, 8, 96, 11, { size: 8, fill: P.muted, ls: 1.5 }),
      T('8', 10, 22, 60, 28, { size: 24, weight: 900, fill: P.accent }),
      // STANDBY
      T('STANDBY', 126, 8, 96, 11, { size: 8, fill: P.muted, ls: 1.5 }),
      T('3', 126, 22, 60, 28, { size: 24, weight: 900, fill: P.fg }),
      // RTB
      T('RTB', 244, 8, 96, 11, { size: 8, fill: P.muted, ls: 1.5 }),
      T('1', 244, 22, 60, 28, { size: 24, weight: 900, fill: P.amber }),
    ]}),

    // active missions header
    T('ACTIVE MISSIONS', 20, 296, 240, 14, { size: 9, fill: P.muted, ls: 2 }),
    Pill(296, 292, '3 RUNNING', P.accent),

    // mission cards — 2x2 bento
    ...[
      ['MSN-0447', 'PERIMETER SCAN', 'ZONE 7', P.accent, 'ACTIVE',  0, 0],
      ['MSN-0448', 'CARGO DELIVERY',  'ZONE 3', P.fg,    'ACTIVE',  1, 0],
      ['MSN-0441', 'INTERCEPT OPS',   'ZONE 11', P.red,  'CRITICAL', 0, 1],
      ['MSN-0439', 'RECON SWEEP',     'ZONE 5', P.amber, 'WARNING', 1, 1],
    ].map(([id, name, zone, color, status, col, row]) =>
      F(20 + col * 178, 318 + row * 104, 166, 92, P.surface2, {
        r: 12, stroke: row === 1 && col === 0 ? P.red + '55' : P.border, sw: row === 1 && col === 0 ? 1 : 1, ch: [
          // left accent bar
          F(0, 0, 3, 92, color, { r: 2, opacity: 0.8 }),
          T(id, 14, 12, 130, 14, { size: 10, fill: color, weight: 700, ls: 0.5 }),
          T(name, 14, 30, 148, 14, { size: 11, weight: 600, fill: P.fg }),
          T(zone, 14, 48, 100, 12, { size: 9, fill: P.muted }),
          Pill(14, 66, status, color),
        ],
      })
    ),

    // alert banner — intercepted threat
    F(20, 536, 350, 44, P.red + '16', { r: 10, stroke: P.red + '44', sw: 1, ch: [
      F(14, 12, 6, 20, P.red, { r: 3 }),
      T('UAV INTERCEPT ACTIVE — ZONE 11', 28, 13, 300, 18, { size: 10, fill: P.red, weight: 700, ls: 0.5 }),
      T('MSN-0441 · T+00:12:34', 28, 28, 280, 12, { size: 8, fill: P.red, opacity: 0.6, ls: 0.3 }),
    ]}),

    // quick intel strip
    F(20, 594, 350, 80, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
      VLine(174, 12, 56, P.border),
      T('TOTAL FLIGHT HRS', 16, 10, 150, 11, { size: 8, fill: P.muted, ls: 1.2 }),
      T('2,847', 16, 24, 150, 30, { size: 26, weight: 900, fill: P.fg, ls: -1 }),
      T('THIS MONTH', 16, 56, 150, 12, { size: 8, fill: P.muted }),
      T('MISSIONS TODAY', 184, 10, 150, 11, { size: 8, fill: P.muted, ls: 1.2 }),
      T('7', 184, 24, 60, 30, { size: 26, weight: 900, fill: P.accent }),
      T('/12 SCHEDULED', 224, 38, 110, 14, { size: 9, fill: P.muted }),
    ]}),

    // bottom nav
    F(0, 764, 390, 80, P.surface, { ch: [
      Line(0, 0, 390, P.border),
      ...[['⊙', 'OPS', 0], ['◈', 'FLEET', 1], ['◎', 'MISSION', 2], ['⚡', 'ALERTS', 3], ['◉', 'OPERATOR', 4]].map(([ic, lb, j]) => {
        const nx = 8 + j * 75;
        return [
          j === 0 ? F(nx + 14, 6, 46, 46, P.accent + '18', { r: 23 }) : null,
          T(ic, nx + 16, 12, 42, 22, { size: 16, fill: j === 0 ? P.accent : P.muted, align: 'center' }),
          T(lb, nx + 4, 38, 60, 12, { size: 7, fill: j === 0 ? P.accent : P.muted, align: 'center', weight: j === 0 ? 700 : 400, ls: 0.5 }),
        ].filter(Boolean);
      }).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Fleet Status
// ══════════════════════════════════════════════════════════════════════════════
function screenFleet(ox) {
  const drones = [
    { id: 'ZR-001', name: 'ZERO-ONE',  status: 'AIRBORNE',  color: P.accent, bat: 78, sig: 4, lat: '50.4501', lon: '30.5234' },
    { id: 'ZR-002', name: 'ZERO-TWO',  status: 'AIRBORNE',  color: P.accent, bat: 62, sig: 3, lat: '50.4523', lon: '30.5267' },
    { id: 'ZR-003', name: 'ZERO-THREE',status: 'CRITICAL',  color: P.red,    bat: 18, sig: 2, lat: '50.4488', lon: '30.5198' },
    { id: 'ZR-004', name: 'ZERO-FOUR', status: 'STANDBY',   color: P.muted,  bat: 94, sig: 4, lat: '50.4510', lon: '30.5210' },
    { id: 'ZR-005', name: 'ZERO-FIVE', status: 'RTB',       color: P.amber,  bat: 24, sig: 3, lat: '50.4455', lon: '30.5180' },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(300, 150, 80, P.accent),

    T('21:47', 20, 16, 60, 16, { size: 12, weight: 600, fill: P.fg }),
    T('12 UNITS', 290, 16, 80, 16, { size: 9, fill: P.muted, ls: 1, align: 'right' }),

    T('FLEET', 20, 48, 280, 36, { size: 30, weight: 900, ls: 6, fill: P.fg }),
    T('STATUS OVERVIEW', 20, 88, 220, 14, { size: 9, fill: P.muted, ls: 2 }),

    // search field
    F(20, 110, 350, 36, P.surface, { r: 8, stroke: P.border, sw: 1, ch: [
      T('⊙', 12, 8, 20, 20, { size: 16, fill: P.muted }),
      T('SEARCH UNIT ID OR ZONE', 36, 10, 280, 16, { size: 10, fill: P.muted, ls: 0.5 }),
    ]}),

    // column headers
    T('UNIT', 20, 158, 80, 12, { size: 8, fill: P.muted, ls: 1.5, weight: 600 }),
    T('STATUS', 140, 158, 70, 12, { size: 8, fill: P.muted, ls: 1.5, weight: 600 }),
    T('BATTERY', 220, 158, 60, 12, { size: 8, fill: P.muted, ls: 1.5, weight: 600 }),
    T('SIG', 300, 158, 30, 12, { size: 8, fill: P.muted, ls: 1.5, weight: 600 }),
    Line(20, 174, 350, P.border),

    // drone rows
    ...drones.map((d, i) =>
      F(20, 180 + i * 106, 350, 96, d.status === 'CRITICAL' ? P.surface2 : P.surface, {
        r: 12,
        stroke: d.status === 'CRITICAL' ? P.red + '44' : P.border,
        sw: 1,
        ch: [
          // left accent
          F(0, 0, 3, 96, d.color, { r: 2, opacity: d.status === 'AIRBORNE' ? 0.9 : 0.4 }),
          // Unit ID + name
          T(d.id, 14, 12, 100, 14, { size: 11, weight: 800, fill: d.color, ls: 0.5 }),
          T(d.name, 14, 30, 120, 12, { size: 8, fill: P.muted, ls: 1 }),
          // Status pill
          Pill(14, 52, d.status, d.color),
          // Coordinates
          ...Coord(14, 72, d.lat, d.lon),
          // Battery
          T(`${d.bat}%`, 210, 12, 50, 14, { size: 11, fill: d.bat < 25 ? P.red : d.bat < 50 ? P.amber : P.fg, weight: 700, align: 'right' }),
          ...BatteryBar(210, 30, d.bat, d.bat < 25 ? P.red : d.bat < 50 ? P.amber : P.accent),
          T('POWER', 210, 40, 80, 11, { size: 7, fill: P.muted, ls: 1 }),
          // Signal
          ...SignalDots(296, 14, d.sig, d.color),
          T(`${d.sig}/4`, 296, 32, 40, 12, { size: 8, fill: P.muted }),
          // Altitude
          T('ALT', 310, 52, 40, 11, { size: 7, fill: P.muted, ls: 1 }),
          T(`${(120 + i * 17)}m`, 296, 64, 54, 14, { size: 10, fill: P.fg, weight: 600, align: 'right' }),
        ],
      })
    ),

    // bottom nav
    F(0, 764, 390, 80, P.surface, { ch: [
      Line(0, 0, 390, P.border),
      ...[['⊙', 'OPS', 0], ['◈', 'FLEET', 1], ['◎', 'MISSION', 2], ['⚡', 'ALERTS', 3], ['◉', 'OPERATOR', 4]].map(([ic, lb, j]) => {
        const nx = 8 + j * 75;
        return [
          j === 1 ? F(nx + 14, 6, 46, 46, P.accent + '18', { r: 23 }) : null,
          T(ic, nx + 16, 12, 42, 22, { size: 16, fill: j === 1 ? P.accent : P.muted, align: 'center' }),
          T(lb, nx + 4, 38, 60, 12, { size: 7, fill: j === 1 ? P.accent : P.muted, align: 'center', weight: j === 1 ? 700 : 400, ls: 0.5 }),
        ].filter(Boolean);
      }).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Active Mission Briefing
// ══════════════════════════════════════════════════════════════════════════════
function screenMission(ox) {
  const waypoints = [
    { id: 'WP-01', label: 'LAUNCH PAD ALPHA', time: '21:35:00', done: true,  color: P.accent },
    { id: 'WP-02', label: 'WAYPOINT NORTH', time: '21:37:22', done: true,  color: P.accent },
    { id: 'WP-03', label: 'TARGET ZONE 11',  time: '21:41:58', done: false, color: P.red, active: true },
    { id: 'WP-04', label: 'HOLDING PATTERN', time: '21:45:00', done: false, color: P.muted },
    { id: 'WP-05', label: 'RETURN TO BASE',  time: '21:52:00', done: false, color: P.muted },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(195, 280, 100, P.red),

    T('21:47', 20, 16, 60, 16, { size: 12, weight: 600, fill: P.fg }),
    Pill(290, 12, 'LIVE', P.red, { w: 60 }),

    // large mission ID — editorial Darknode influence
    T('MSN-0441', 20, 48, 350, 52, { size: 38, weight: 900, ls: 1, fill: P.fg }),
    T('INTERCEPT OPERATION · ZONE 11', 20, 104, 320, 14, { size: 9, fill: P.muted, ls: 2 }),

    // mission status bar
    F(20, 128, 350, 64, P.surface, { r: 12, stroke: P.red + '33', sw: 1, ch: [
      VLine(116, 10, 44, P.border),
      VLine(233, 10, 44, P.border),
      T('ELAPSED', 12, 8, 94, 11, { size: 8, fill: P.muted, ls: 1.2 }),
      T('00:12:34', 12, 22, 100, 24, { size: 18, weight: 800, fill: P.fg }),
      T('ALTITUDE', 128, 8, 94, 11, { size: 8, fill: P.muted, ls: 1.2 }),
      T('137m', 128, 22, 100, 24, { size: 18, weight: 800, fill: P.fg }),
      T('VELOCITY', 244, 8, 94, 11, { size: 8, fill: P.muted, ls: 1.2 }),
      T('42 m/s', 244, 22, 100, 24, { size: 18, weight: 800, fill: P.accent }),
    ]}),

    // progress bar
    T('MISSION PROGRESS', 20, 208, 200, 12, { size: 8, fill: P.muted, ls: 1.5 }),
    T('40%', 340, 208, 30, 12, { size: 8, fill: P.red, align: 'right', weight: 700 }),
    F(20, 224, 350, 6, P.dim, { r: 3 }),
    F(20, 224, 140, 6, P.red, { r: 3, opacity: 0.9 }),

    // waypoint timeline
    T('WAYPOINTS', 20, 248, 200, 12, { size: 8, fill: P.muted, ls: 2 }),
    ...waypoints.map((wp, i) => {
      const y = 268 + i * 82;
      const dotColor = wp.done ? P.accent : wp.active ? P.red : P.muted;
      return [
        // timeline line
        i < waypoints.length - 1 ? F(33, y + 28, 2, 64, wp.done ? P.accent + '66' : P.border) : null,
        // dot
        E(24, y + 8, 20, 20, wp.done ? P.accent + '22' : wp.active ? P.red + '22' : P.dim),
        E(28, y + 12, 12, 12, dotColor, { opacity: wp.done ? 0.9 : wp.active ? 1 : 0.35 }),
        // card
        F(56, y, 294, 70, wp.active ? P.surface2 : P.surface, {
          r: 10,
          stroke: wp.active ? P.red + '55' : P.border,
          sw: 1,
          ch: [
            T(wp.id, 12, 10, 60, 13, { size: 9, fill: dotColor, weight: 700, ls: 0.5 }),
            T(wp.label, 12, 27, 220, 16, { size: 12, weight: 600, fill: wp.done ? P.muted : P.fg }),
            T(wp.time, 12, 48, 100, 12, { size: 9, fill: P.muted }),
            wp.done ? T('✓ COMPLETE', 185, 48, 100, 12, { size: 8, fill: P.accent, align: 'right', weight: 700, ls: 0.5 }) : null,
            wp.active ? T('● IN PROGRESS', 185, 48, 100, 12, { size: 8, fill: P.red, align: 'right', weight: 700, ls: 0.5 }) : null,
          ].filter(Boolean),
        }),
      ].filter(Boolean);
    }).flat(),

    // abort / confirm — only show for current mission (truncated by screen height)

    // bottom nav
    F(0, 764, 390, 80, P.surface, { ch: [
      Line(0, 0, 390, P.border),
      ...[['⊙', 'OPS', 0], ['◈', 'FLEET', 1], ['◎', 'MISSION', 2], ['⚡', 'ALERTS', 3], ['◉', 'OPERATOR', 4]].map(([ic, lb, j]) => {
        const nx = 8 + j * 75;
        return [
          j === 2 ? F(nx + 14, 6, 46, 46, P.accent + '18', { r: 23 }) : null,
          T(ic, nx + 16, 12, 42, 22, { size: 16, fill: j === 2 ? P.accent : P.muted, align: 'center' }),
          T(lb, nx + 4, 38, 60, 12, { size: 7, fill: j === 2 ? P.accent : P.muted, align: 'center', weight: j === 2 ? 700 : 400, ls: 0.5 }),
        ].filter(Boolean);
      }).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Alerts Feed
// ══════════════════════════════════════════════════════════════════════════════
function screenAlerts(ox) {
  const alerts = [
    {
      id: 'ALT-009', type: 'INTERCEPT',  sev: 'CRITICAL',
      msg: 'Hostile UAV detected in Zone 11 airspace. ZR-003 intercept initiated.',
      time: '21:35', color: P.red,
    },
    {
      id: 'ALT-008', type: 'LOW BATTERY', sev: 'HIGH',
      msg: 'ZR-003 battery at 18%. Return to base recommended immediately.',
      time: '21:41', color: P.red,
    },
    {
      id: 'ALT-007', type: 'RTB ALERT',  sev: 'MEDIUM',
      msg: 'ZR-005 returning to base. Battery 24%. ETA 00:08:22.',
      time: '21:42', color: P.amber,
    },
    {
      id: 'ALT-006', type: 'SIGNAL LOSS',sev: 'MEDIUM',
      msg: 'ZR-002 signal degraded to 75% in Zone 7 north sector.',
      time: '21:44', color: P.amber,
    },
    {
      id: 'ALT-005', type: 'MISSION END', sev: 'INFO',
      msg: 'MSN-0440 completed. ZR-006 returned to base. Flight time: 47m.',
      time: '21:22', color: P.muted,
    },
    {
      id: 'ALT-004', type: 'SYSTEM',     sev: 'INFO',
      msg: 'Scheduled maintenance check passed. All 12 units operational.',
      time: '20:00', color: P.muted,
    },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(80, 100, 70, P.red),

    T('21:47', 20, 16, 60, 16, { size: 12, weight: 600, fill: P.fg }),
    F(290, 12, 18, 18, P.red, { r: 9, ch: [T('2', 0, 2, 18, 14, { size: 10, fill: P.bg, weight: 900, align: 'center' })] }),

    T('ALERTS', 20, 48, 280, 36, { size: 30, weight: 900, ls: 6, fill: P.fg }),
    T('REAL-TIME THREAT FEED', 20, 88, 240, 14, { size: 9, fill: P.muted, ls: 2 }),

    // Filter chips
    ...[['ALL', true, 0], ['CRITICAL', false, 1], ['HIGH', false, 2], ['INFO', false, 3]].map(([lbl, active, i]) =>
      F(20 + i * 82, 108, 74, 26, active ? P.accent + '22' : P.surface, {
        r: 13,
        stroke: active ? P.accent + '55' : P.border,
        sw: 1,
        ch: [T(lbl, 0, 5, 74, 16, { size: 9, fill: active ? P.accent : P.muted, align: 'center', weight: active ? 700 : 400, ls: 0.5 })],
      })
    ),

    // Alert cards
    ...alerts.map((a, i) =>
      F(20, 148 + i * 96, 350, 84, P.surface, {
        r: 12,
        stroke: i < 2 ? a.color + '44' : P.border,
        sw: 1,
        ch: [
          // left severity bar
          F(0, 0, 3, 84, a.color, { r: 2, opacity: i < 2 ? 0.9 : 0.35 }),
          // ID + severity chip
          T(a.id, 14, 10, 70, 13, { size: 9, fill: a.color, weight: 700, ls: 0.5 }),
          Pill(220, 8, a.sev, a.color),
          T(a.time, 306, 10, 44, 13, { size: 9, fill: P.muted, align: 'right' }),
          // type label
          T(a.type, 14, 26, 180, 14, { size: 11, weight: 700, fill: i < 2 ? P.fg : P.muted }),
          // message
          T(a.msg, 14, 44, 326, 32, { size: 10, fill: P.muted, lh: 1.5, opacity: 0.8 }),
        ],
      })
    ),

    // bottom nav
    F(0, 764, 390, 80, P.surface, { ch: [
      Line(0, 0, 390, P.border),
      ...[['⊙', 'OPS', 0], ['◈', 'FLEET', 1], ['◎', 'MISSION', 2], ['⚡', 'ALERTS', 3], ['◉', 'OPERATOR', 4]].map(([ic, lb, j]) => {
        const nx = 8 + j * 75;
        return [
          j === 3 ? F(nx + 14, 6, 46, 46, P.accent + '18', { r: 23 }) : null,
          T(ic, nx + 16, 12, 42, 22, { size: 16, fill: j === 3 ? P.accent : P.muted, align: 'center' }),
          T(lb, nx + 4, 38, 60, 12, { size: 7, fill: j === 3 ? P.accent : P.muted, align: 'center', weight: j === 3 ? 700 : 400, ls: 0.5 }),
        ].filter(Boolean);
      }).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Operator Profile
// ══════════════════════════════════════════════════════════════════════════════
function screenOperator(ox) {
  const stats = [
    ['TOTAL MISSIONS', '312',  P.fg],
    ['FLIGHT HOURS',   '847',  P.accent],
    ['SUCCESS RATE',   '99.4%',P.accent],
    ['INTERCEPTS',     '28',   P.red],
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    ...Glow(195, 140, 90, P.accent),

    T('21:47', 20, 16, 60, 16, { size: 12, weight: 600, fill: P.fg }),
    Pill(274, 12, 'CLEARANCE: ALPHA', P.accent, { w: 116 }),

    T('OPERATOR', 20, 48, 280, 36, { size: 28, weight: 900, ls: 4, fill: P.fg }),
    T('PROFILE & MISSION HISTORY', 20, 88, 260, 14, { size: 9, fill: P.muted, ls: 2 }),

    // avatar + name
    // avatar ring
    E(20, 116, 72, 72, P.accent + '18'),
    E(28, 124, 56, 56, P.surface2, { stroke: P.accent + '44', sw: 1.5 }),
    T('KZ', 28, 136, 56, 32, { size: 20, weight: 900, fill: P.accent, align: 'center' }),

    T('K. ZHUKOVA', 104, 124, 250, 22, { size: 18, weight: 800, fill: P.fg }),
    T('LEAD DRONE OPERATOR · SQUADRON 7', 104, 150, 260, 12, { size: 9, fill: P.muted, ls: 0.5 }),
    Pill(104, 168, '● ONLINE', P.accent, { w: 80 }),

    // divider
    Line(20, 204, 350, P.border),

    // stats grid — 2x2
    T('PERFORMANCE METRICS', 20, 220, 280, 12, { size: 8, fill: P.muted, ls: 2 }),
    ...[0,1,2,3].map(i => {
      const [label, value, color] = stats[i];
      const col = i % 2;
      const row = Math.floor(i / 2);
      return F(20 + col * 178, 238 + row * 80, 166, 68, P.surface, {
        r: 10, stroke: P.border, sw: 1, ch: [
          T(label, 14, 10, 140, 11, { size: 8, fill: P.muted, ls: 1.2 }),
          T(value, 14, 26, 140, 30, { size: 26, weight: 900, fill: color }),
        ],
      });
    }),

    // recent missions
    T('RECENT MISSIONS', 20, 416, 280, 12, { size: 8, fill: P.muted, ls: 2 }),
    ...[
      ['MSN-0441', 'Intercept · Zone 11', 'ACTIVE',     P.red],
      ['MSN-0439', 'Recon · Zone 5',      'WARNING',    P.amber],
      ['MSN-0434', 'Perimeter · Zone 2',  'COMPLETE',   P.accent],
      ['MSN-0428', 'Delivery · Zone 3',   'COMPLETE',   P.accent],
      ['MSN-0421', 'Recon · Zone 8',      'COMPLETE',   P.accent],
    ].map(([id, detail, status, color], i) =>
      F(20, 436 + i * 54, 350, 46, P.surface, {
        r: 10, stroke: i === 0 ? P.red + '33' : P.border, sw: 1, ch: [
          F(0, 0, 3, 46, color, { r: 2, opacity: 0.7 }),
          T(id, 14, 10, 80, 14, { size: 10, fill: color, weight: 700 }),
          T(detail, 14, 28, 200, 12, { size: 9, fill: P.muted }),
          Pill(260, 12, status, color),
        ],
      })
    ),

    // sign out button
    F(20, 714, 350, 36, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      T('SIGN OUT', 0, 9, 350, 18, { size: 11, fill: P.muted, align: 'center', weight: 600, ls: 1.5 }),
    ]}),

    // bottom nav
    F(0, 764, 390, 80, P.surface, { ch: [
      Line(0, 0, 390, P.border),
      ...[['⊙', 'OPS', 0], ['◈', 'FLEET', 1], ['◎', 'MISSION', 2], ['⚡', 'ALERTS', 3], ['◉', 'OPERATOR', 4]].map(([ic, lb, j]) => {
        const nx = 8 + j * 75;
        return [
          j === 4 ? F(nx + 14, 6, 46, 46, P.accent + '18', { r: 23 }) : null,
          T(ic, nx + 16, 12, 42, 22, { size: 16, fill: j === 4 ? P.accent : P.muted, align: 'center' }),
          T(lb, nx + 4, 38, 60, 12, { size: 7, fill: j === 4 ? P.accent : P.muted, align: 'center', weight: j === 4 ? 700 : 400, ls: 0.5 }),
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
  name: 'ZERO — Autonomous Drone Fleet Intelligence',
  width:  5 * SCREEN_W + 6 * GAP,
  height: 844,
  fill:   '#050508',
  children: [
    screenMissionControl(GAP),
    screenFleet         (GAP + (SCREEN_W + GAP)),
    screenMission       (GAP + (SCREEN_W + GAP) * 2),
    screenAlerts        (GAP + (SCREEN_W + GAP) * 3),
    screenOperator      (GAP + (SCREEN_W + GAP) * 4),
  ],
};

const outPath = path.join(__dirname, 'zero.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log('✓ zero.pen written —', Math.round(fs.statSync(outPath).size / 1024) + 'KB');
console.log('  5 screens: Mission Control · Fleet Status · Active Mission · Alerts · Operator');
console.log('  Palette: void black #080810 · neon mint #00FFAA · alert red #FF3158');
