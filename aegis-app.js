'use strict';
// aegis-app.js
// AEGIS — Counter-UAV Operations Platform
//
// Challenge: Design a military-grade counter-drone command SaaS inspired by:
// 1. Awwwards SOTD March 21, 2026 — "Darknode" by Qream (Ukraine's 412th brigade)
//    #F90000 blood red + #14181E near-black, stealth minimal mission UI,
//    GSAP animations, Blender 3D drone aesthetics, WebGL scroll effects
// 2. Linear.app (darkmodedesign.com) — AI agent workflow integration,
//    dense information hierarchy, precise typographic rhythm
// 3. TRIONN (darkmodedesign.com) — Syne geometric font, #121315 ultra-dark bg
//
// Trend: Military / mission-critical SaaS adopting minimal stealth aesthetics
// (Darknode SOTD proving this vernacular resonates). Counter-drone is a real
// and growing market needing purpose-built tooling.
//
// Palette: Darknode-faithful #0E1114 + #F90000 + radar-cyan #00D4FF + amber #FF6B00
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#0E1114',   // stealth void (Darknode #14181E lightened slightly)
  surface:  '#141820',   // elevated surface
  surface2: '#1B2029',   // card surface
  surface3: '#222B36',   // lighter card
  border:   '#1E2730',   // subtle border
  border2:  '#2C3A48',   // visible border
  muted:    '#4A5A6B',   // muted steel
  fg:       '#D6DDE8',   // cool slate-white
  fg2:      '#8A9BAC',   // secondary text
  red:      '#F90000',   // Darknode blood-red (primary alert)
  red2:     '#C50000',   // deeper red variant
  redDim:   '#F9000022', // dimmed red fill
  cyan:     '#00D4FF',   // radar scan cyan
  cyanDim:  '#00D4FF18', // dimmed cyan fill
  amber:    '#FF8C00',   // threat amber
  amberDim: '#FF8C0020', // dimmed amber
  green:    '#0DBA74',   // secure/nominal
  greenDim: '#0DBA7418', // dimmed green
};

let _id = 0;
const uid = () => `ag${++_id}`;

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

const Rect = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'rectangle', x, y, width: w, height: h, fill,
  ...(opts.r !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Line = (x, y, w, fill = P.border) => F(x, y, w, 1, fill, {});

// ── Reusable Components ───────────────────────────────────────────────────────

// Radar glow rings — Darknode-inspired radial pulse
const RadarGlow = (cx, cy, r, color) => [
  E(cx - r*2.5, cy - r*2.5, r*5,   r*5,   color, { opacity: 0.04 }),
  E(cx - r*1.8, cy - r*1.8, r*3.6, r*3.6, color, { opacity: 0.07 }),
  E(cx - r,     cy - r,     r*2,   r*2,   color, { opacity: 0.12 }),
  E(cx - r*0.5, cy - r*0.5, r,     r,     color, { opacity: 0.2  }),
];

// Status pill
const StatusPill = (x, y, label, dotColor, bgAlpha = '22') => F(x, y, label.length * 6.5 + 26, 22, dotColor + bgAlpha, {
  r: 11,
  stroke: dotColor + '44', sw: 1,
  ch: [
    E(9, 7, 8, 8, dotColor),
    T(label, 22, 4, label.length * 6.5, 14, { size: 10, fill: dotColor, weight: 700, ls: 0.5 }),
  ],
});

// Threat bar
const ThreatBar = (x, y, w, value, color) => [
  F(x, y, w, 4, P.border2, { r: 2 }),
  F(x, y, Math.round(w * value), 4, color, { r: 2 }),
];

// Corner bracket decoration (military HUD feel)
const Bracket = (x, y, size, color, opacity = 0.4) => [
  // TL
  Rect(x, y, size, 1, color, { opacity }),
  Rect(x, y, 1, size, color, { opacity }),
  // TR
  Rect(x + 390 - 24 - size, y, size, 1, color, { opacity }),
  Rect(x + 390 - 24 - size + size - 1, y, 1, size, color, { opacity }),
];

// Mini drone icon (simplified silhouette via rectangles)
const DroneIcon = (x, y, color, scale = 1) => {
  const s = scale;
  return [
    // Body
    Rect(x + 4*s, y + 4*s, 8*s, 8*s, color, { r: 1 }),
    // Arms
    Rect(x,       y + 6*s, 16*s, 2*s, color, { opacity: 0.6 }),
    Rect(x + 7*s, y,       2*s, 16*s, color, { opacity: 0.6 }),
    // Rotors
    E(x,           y,           6*s, 6*s, color, { opacity: 0.4 }),
    E(x + 10*s,    y,           6*s, 6*s, color, { opacity: 0.4 }),
    E(x,           y + 10*s,    6*s, 6*s, color, { opacity: 0.4 }),
    E(x + 10*s,    y + 10*s,    6*s, 6*s, color, { opacity: 0.4 }),
  ];
};

// Grid dot pattern (radar background texture)
const GridDots = (x, y, cols, rows, spacing, color, opacity = 0.12) => {
  const dots = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push(E(x + c * spacing, y + r * spacing, 1.5, 1.5, color, { opacity }));
    }
  }
  return dots;
};

// ── Status Bar ────────────────────────────────────────────────────────────────
const StatusBar = (screenNum) => F(0, 0, 390, 44, P.bg, {
  ch: [
    T('09:41', 20, 14, 60, 16, { size: 12, weight: 700, fill: P.fg }),
    T(`AEGIS `, 155, 14, 80, 16, { size: 11, weight: 700, fill: P.cyan, ls: 1, align: 'center' }),
    T('▮▮▮▮', 330, 15, 48, 14, { size: 10, fill: P.fg2 }),
  ],
});

// ── Nav Bar ───────────────────────────────────────────────────────────────────
const NavBar = (activeIdx) => {
  const tabs = [
    { icon: '⊞', label: 'CMD' },
    { icon: '◎', label: 'RADAR' },
    { icon: '⬡', label: 'FLEET' },
    { icon: '≡', label: 'LOG' },
    { icon: '⊕', label: 'BRIEF' },
  ];
  return F(0, 784, 390, 60, P.surface, {
    stroke: P.border2, sw: 1,
    ch: [
      Line(0, 0, 390, P.border2),
      ...tabs.map((tab, i) => {
        const isActive = i === activeIdx;
        const x = 6 + i * 76;
        return F(x, 6, 70, 48, isActive ? P.red + '18' : 'transparent', {
          r: 6,
          ch: [
            T(tab.icon, 0, 8, 70, 16, { size: 14, fill: isActive ? P.red : P.muted, align: 'center' }),
            T(tab.label, 0, 27, 70, 12, { size: 8, fill: isActive ? P.red : P.muted, weight: isActive ? 700 : 400, ls: 0.8, align: 'center' }),
            ...(isActive ? [Rect(22, 46, 26, 2, P.red, { r: 1 })] : []),
          ],
        });
      }),
    ],
  });
};

// ══════════════════════════════════════════════════════════════════════════════
// Screen 1 — Command Center Overview
// ══════════════════════════════════════════════════════════════════════════════
function buildCommandCenter() {
  const sc = F(0, 0, 390, 844, P.bg, { clip: true });

  sc.children = [
    // Background grid dots
    ...GridDots(0, 0, 26, 12, 15, P.cyan, 0.07),

    StatusBar(1),

    // Header
    F(16, 52, 358, 44, 'transparent', { ch: [
      T('COMMAND CENTER', 0, 0, 220, 16, { size: 11, fill: P.cyan, weight: 700, ls: 2 }),
      T('SECTOR BRAVO-7', 0, 22, 220, 16, { size: 14, fill: P.fg, weight: 800 }),
      StatusPill(266, 2, 'ACTIVE', P.red),
    ]}),

    Line(16, 100, 358, P.border2),

    // Threat Level Meter — big bold Darknode-style
    F(16, 112, 358, 90, P.surface2, { r: 8, stroke: P.border2, sw: 1, ch: [
      ...RadarGlow(179, 55, 40, P.red),
      T('THREAT LEVEL', 0, 14, 358, 14, { size: 9, fill: P.muted, weight: 700, ls: 2.5, align: 'center' }),
      T('HIGH', 0, 32, 358, 40, { size: 36, fill: P.red, weight: 900, ls: -1, align: 'center' }),
      T('ELEVATED INCURSION PROBABILITY', 0, 72, 358, 12, { size: 8, fill: P.amber, ls: 1.5, align: 'center' }),
    ]}),

    // 4-stat grid
    F(16, 212, 170, 72, P.surface2, { r: 8, stroke: P.border2, sw: 1, ch: [
      T('ACTIVE THREATS', 14, 12, 142, 12, { size: 9, fill: P.muted, ls: 1 }),
      T('7', 14, 28, 60, 32, { size: 28, fill: P.red, weight: 900 }),
      T('+2 LAST HR', 74, 38, 80, 12, { size: 9, fill: P.amber }),
    ]}),
    F(204, 212, 170, 72, P.surface2, { r: 8, stroke: P.border2, sw: 1, ch: [
      T('DRONES ONLINE', 14, 12, 142, 12, { size: 9, fill: P.muted, ls: 1 }),
      T('12', 14, 28, 60, 32, { size: 28, fill: P.green, weight: 900 }),
      T('3 DEPLOYED', 74, 38, 80, 12, { size: 9, fill: P.fg2 }),
    ]}),
    F(16, 292, 170, 72, P.surface2, { r: 8, stroke: P.border2, sw: 1, ch: [
      T('INTERCEPTS', 14, 12, 142, 12, { size: 9, fill: P.muted, ls: 1 }),
      T('31', 14, 28, 60, 32, { size: 28, fill: P.cyan, weight: 900 }),
      T('TODAY', 74, 38, 80, 12, { size: 9, fill: P.fg2 }),
    ]}),
    F(204, 292, 170, 72, P.surface2, { r: 8, stroke: P.border2, sw: 1, ch: [
      T('SECTOR CLEAR', 14, 12, 142, 12, { size: 9, fill: P.muted, ls: 1 }),
      T('89%', 14, 28, 80, 32, { size: 28, fill: P.fg, weight: 900 }),
      T('CONFIDENCE', 74, 38, 80, 12, { size: 9, fill: P.fg2 }),
    ]}),

    // Active threats list
    F(16, 376, 358, 24, 'transparent', { ch: [
      T('ACTIVE THREATS', 0, 4, 200, 14, { size: 10, fill: P.fg2, ls: 1.5, weight: 700 }),
      T('VIEW ALL →', 260, 4, 98, 14, { size: 10, fill: P.cyan, align: 'right' }),
    ]}),

    // Threat cards
    ...[
      { id: 'UAV-441', type: 'CONSUMER', bearing: '043°', dist: '1.2km', threat: 0.82, color: P.red, status: 'INTERCEPTING' },
      { id: 'UAV-439', type: 'COMMERCIAL', bearing: '118°', dist: '3.4km', threat: 0.45, color: P.amber, status: 'TRACKING' },
      { id: 'UAV-437', type: 'UNKNOWN', bearing: '271°', dist: '5.1km', threat: 0.21, color: P.fg2, status: 'MONITORING' },
    ].map((t, i) => F(16, 408 + i * 72, 358, 64, P.surface2, { r: 6, stroke: i === 0 ? P.red + '44' : P.border, sw: 1, ch: [
      ...DroneIcon(12, 22, t.color, 1.2),
      T(t.id, 38, 12, 120, 14, { size: 12, fill: P.fg, weight: 700 }),
      T(t.type, 38, 30, 120, 12, { size: 9, fill: P.muted, ls: 0.5 }),
      T(t.bearing, 38, 44, 60, 12, { size: 9, fill: P.fg2 }),
      T(t.dist, 100, 44, 60, 12, { size: 9, fill: P.fg2 }),
      ...ThreatBar(180, 26, 120, t.threat, t.color),
      T(`${Math.round(t.threat * 100)}%`, 306, 20, 40, 14, { size: 11, fill: t.color, weight: 700, align: 'right' }),
      StatusPill(240, 40, t.status, t.color),
    ]})),

    NavBar(0),
  ];
  return sc;
}

// ══════════════════════════════════════════════════════════════════════════════
// Screen 2 — Radar / Threat Map
// ══════════════════════════════════════════════════════════════════════════════
function buildRadarMap() {
  const sc = F(0, 0, 390, 844, P.bg, { clip: true });
  const cx = 195, cy = 340, maxR = 165;

  sc.children = [
    // Background grid
    ...GridDots(0, 0, 26, 8, 15, P.cyan, 0.05),

    StatusBar(2),

    // Header
    F(16, 52, 358, 44, 'transparent', { ch: [
      T('SECTOR RADAR', 0, 0, 200, 16, { size: 11, fill: P.cyan, weight: 700, ls: 2 }),
      T('LIVE · 2.4GHz SWEEP', 0, 22, 220, 14, { size: 11, fill: P.fg, weight: 700 }),
      StatusPill(266, 2, 'SCANNING', P.cyan),
    ]}),

    Line(16, 100, 358, P.border2),

    // Radar scope background
    ...RadarGlow(cx, cy, maxR, P.cyan),

    // Radar rings
    E(cx - maxR,     cy - maxR,     maxR*2,     maxR*2,     'transparent', { stroke: P.cyan + '20', sw: 1 }),
    E(cx - maxR*0.7, cy - maxR*0.7, maxR*1.4, maxR*1.4, 'transparent', { stroke: P.cyan + '20', sw: 1 }),
    E(cx - maxR*0.4, cy - maxR*0.4, maxR*0.8, maxR*0.8, 'transparent', { stroke: P.cyan + '20', sw: 1 }),
    // Cross-hairs
    Rect(cx - maxR, cy - 0.5, maxR*2, 1, P.cyan + '25'),
    Rect(cx - 0.5, cy - maxR, 1, maxR*2, P.cyan + '25'),

    // Sweep indicator line (simulated)
    Rect(cx, cy - maxR, 1, maxR, P.cyan, { opacity: 0.5 }),
    // Sweep glow wedge approximated with rotated alpha rects
    ...Array.from({ length: 8 }, (_, i) => {
      const angle = (i * 5 * Math.PI) / 180;
      const len = maxR - i * 10;
      const dx = Math.sin(angle) * len;
      const dy = -Math.cos(angle) * len;
      return Rect(cx, cy, 1, Math.sqrt(dx*dx + dy*dy), P.cyan + '18', { opacity: 1 - i * 0.12 });
    }),

    // Threat blips
    // Threat 1 — High (red) at 043° bearing, 1.2km (~60% radius)
    ...RadarGlow(cx + Math.sin(43 * Math.PI/180) * maxR * 0.55, cy - Math.cos(43 * Math.PI/180) * maxR * 0.55, 12, P.red),
    E(cx + Math.sin(43 * Math.PI/180) * maxR * 0.55 - 6, cy - Math.cos(43 * Math.PI/180) * maxR * 0.55 - 6, 12, 12, P.red),
    T('441', cx + Math.sin(43 * Math.PI/180) * maxR * 0.55 + 8, cy - Math.cos(43 * Math.PI/180) * maxR * 0.55 - 8, 28, 12, { size: 8, fill: P.red, weight: 700 }),

    // Threat 2 — Medium (amber) at 118° bearing, 3.4km (~75% radius)
    E(cx + Math.sin(118 * Math.PI/180) * maxR * 0.72 - 5, cy - Math.cos(118 * Math.PI/180) * maxR * 0.72 - 5, 10, 10, P.amber),
    T('439', cx + Math.sin(118 * Math.PI/180) * maxR * 0.72 + 7, cy - Math.cos(118 * Math.PI/180) * maxR * 0.72 - 6, 28, 12, { size: 8, fill: P.amber }),

    // Threat 3 — Low (fg2) at 271° bearing, 5.1km (~90% radius)
    E(cx + Math.sin(271 * Math.PI/180) * maxR * 0.87 - 4, cy - Math.cos(271 * Math.PI/180) * maxR * 0.87 - 4, 8, 8, P.fg2),

    // Own position marker (center)
    E(cx - 8, cy - 8, 16, 16, P.green + '33'),
    E(cx - 4, cy - 4, 8, 8, P.green),
    T('HQ', cx + 8, cy - 6, 20, 12, { size: 8, fill: P.green, weight: 700 }),

    // Range labels
    T('500m', cx + maxR * 0.37 + 2, cy - 5, 36, 10, { size: 7, fill: P.muted }),
    T('1km', cx + maxR * 0.67 + 2, cy - 5, 30, 10, { size: 7, fill: P.muted }),
    T('2km', cx + maxR * 0.95 + 2, cy - 5, 28, 10, { size: 7, fill: P.muted }),

    // Legend
    F(16, 630, 358, 64, P.surface2, { r: 8, stroke: P.border2, sw: 1, ch: [
      E(16, 24, 10, 10, P.red),
      T('HIGH THREAT', 32, 20, 80, 14, { size: 10, fill: P.fg }),
      E(140, 24, 10, 10, P.amber),
      T('MEDIUM', 156, 20, 60, 14, { size: 10, fill: P.fg }),
      E(240, 24, 10, 10, P.fg2),
      T('LOW', 256, 20, 40, 14, { size: 10, fill: P.fg }),
      E(310, 24, 10, 10, P.green),
      T('BASE', 326, 20, 30, 14, { size: 10, fill: P.fg }),
    ]}),

    // Selector strip — bearing info
    F(16, 702, 358, 44, P.surface2, { r: 6, stroke: P.red + '44', sw: 1, ch: [
      T('TARGET UAV-441  ·  BRG 043°  ·  1.2km  ·  ALT 42m', 14, 14, 330, 16, { size: 11, fill: P.fg, weight: 600 }),
    ]}),

    NavBar(1),
  ];
  return sc;
}

// ══════════════════════════════════════════════════════════════════════════════
// Screen 3 — Drone Fleet Status
// ══════════════════════════════════════════════════════════════════════════════
function buildFleetStatus() {
  const sc = F(0, 0, 390, 844, P.bg, { clip: true });

  const drones = [
    { id: 'ACE-01', type: 'INTERCEPTOR', status: 'DEPLOYED', mission: 'UAV-441 PURSUIT', battery: 0.72, signal: 0.95, speed: '124 km/h', alt: '38m', color: P.red, badgeColor: P.red },
    { id: 'ACE-02', type: 'INTERCEPTOR', status: 'STANDBY', mission: 'AWAITING ORDER', battery: 0.98, signal: 1.0, speed: '0 km/h', alt: '—', color: P.cyan, badgeColor: P.cyan },
    { id: 'ACE-03', type: 'SCOUT', status: 'PATROL', mission: 'SECTOR NORTH', battery: 0.54, signal: 0.88, speed: '67 km/h', alt: '120m', color: P.amber, badgeColor: P.amber },
    { id: 'ACE-04', type: 'JAMMER', status: 'STANDBY', mission: 'FREQ BLOCK RDY', battery: 0.91, signal: 0.97, speed: '0 km/h', alt: '—', color: P.cyan, badgeColor: P.cyan },
    { id: 'ACE-05', type: 'SCOUT', status: 'CHARGING', mission: 'RTB RECHARGE', battery: 0.31, signal: 0.0, speed: '0 km/h', alt: '—', color: P.fg2, badgeColor: P.fg2 },
  ];

  sc.children = [
    ...GridDots(0, 0, 26, 6, 15, P.cyan, 0.05),
    StatusBar(3),

    F(16, 52, 358, 44, 'transparent', { ch: [
      T('DRONE FLEET', 0, 0, 180, 16, { size: 11, fill: P.cyan, weight: 700, ls: 2 }),
      T('5 UNITS · 3 ACTIVE', 0, 22, 220, 14, { size: 12, fill: P.fg, weight: 800 }),
      StatusPill(260, 2, 'NOMINAL', P.green),
    ]}),

    Line(16, 100, 358, P.border2),

    // Fleet summary mini-bar
    F(16, 112, 358, 44, P.surface2, { r: 6, stroke: P.border2, sw: 1, ch: [
      T('DEPLOYED', 14, 14, 70, 12, { size: 9, fill: P.red, ls: 1 }),
      T('1', 84, 10, 20, 20, { size: 18, fill: P.red, weight: 900 }),
      Rect(110, 20, 1, 20, P.border2),
      T('STANDBY', 122, 14, 60, 12, { size: 9, fill: P.cyan, ls: 1 }),
      T('2', 182, 10, 20, 20, { size: 18, fill: P.cyan, weight: 900 }),
      Rect(206, 20, 1, 20, P.border2),
      T('PATROL', 218, 14, 52, 12, { size: 9, fill: P.amber, ls: 1 }),
      T('1', 270, 10, 20, 20, { size: 18, fill: P.amber, weight: 900 }),
      Rect(294, 20, 1, 20, P.border2),
      T('CHRGNG', 306, 14, 52, 12, { size: 9, fill: P.muted, ls: 1 }),
      T('1', 340, 10, 20, 20, { size: 18, fill: P.muted, weight: 900 }),
    ]}),

    // Drone cards
    ...drones.map((d, i) => F(16, 168 + i * 116, 358, 108, P.surface2, {
      r: 8,
      stroke: d.status === 'DEPLOYED' ? P.red + '55' : P.border,
      sw: 1,
      ch: [
        // Top row
        ...DroneIcon(14, 14, d.color, 1.5),
        T(d.id, 50, 12, 100, 16, { size: 14, fill: P.fg, weight: 900 }),
        T(d.type, 50, 32, 100, 12, { size: 9, fill: P.muted, ls: 0.8 }),
        StatusPill(234, 12, d.status, d.badgeColor),

        // Mission line
        F(14, 52, 330, 1, P.border2),
        T('MISSION', 14, 60, 60, 12, { size: 8, fill: P.muted, ls: 1 }),
        T(d.mission, 80, 58, 270, 14, { size: 11, fill: d.status === 'DEPLOYED' ? P.red : P.fg, weight: 600 }),

        // Stats row
        // Battery
        T('BAT', 14, 82, 28, 10, { size: 8, fill: P.muted }),
        ...ThreatBar(14, 94, 60, d.battery, d.battery > 0.5 ? P.green : P.red),
        T(`${Math.round(d.battery * 100)}%`, 14, 80, 60, 12, { size: 10, fill: d.battery > 0.5 ? P.green : P.red, weight: 700, align: 'right' }),

        // Signal
        T('SIG', 92, 82, 28, 10, { size: 8, fill: P.muted }),
        ...ThreatBar(92, 94, 60, d.signal, P.cyan),

        // Speed
        T('SPD', 172, 82, 28, 10, { size: 8, fill: P.muted }),
        T(d.speed, 172, 80, 80, 12, { size: 9, fill: P.fg2 }),

        // Alt
        T('ALT', 264, 82, 28, 10, { size: 8, fill: P.muted }),
        T(d.alt, 264, 80, 80, 12, { size: 9, fill: P.fg2 }),
      ],
    })),

    NavBar(2),
  ];
  return sc;
}

// ══════════════════════════════════════════════════════════════════════════════
// Screen 4 — Intercept Mission Log
// ══════════════════════════════════════════════════════════════════════════════
function buildMissionLog() {
  const sc = F(0, 0, 390, 844, P.bg, { clip: true });

  const missions = [
    { id: 'M-0831', target: 'UAV-441', outcome: 'IN PROGRESS', time: '09:39', duration: '2m 14s', interceptor: 'ACE-01', method: 'PURSUIT', color: P.red, dot: P.red },
    { id: 'M-0830', target: 'UAV-438', outcome: 'NEUTRALIZED', time: '09:12', duration: '4m 08s', interceptor: 'ACE-02', method: 'NET CAPTURE', color: P.green, dot: P.green },
    { id: 'M-0829', target: 'UAV-436', outcome: 'LOST SIGNAL', time: '08:45', duration: '1m 32s', interceptor: 'ACE-03', method: 'FREQ JAM', color: P.fg2, dot: P.fg2 },
    { id: 'M-0828', target: 'UAV-434', outcome: 'NEUTRALIZED', time: '08:11', duration: '3m 55s', interceptor: 'ACE-01', method: 'PURSUIT', color: P.green, dot: P.green },
    { id: 'M-0827', target: 'UAV-431', outcome: 'NEUTRALIZED', time: '07:58', duration: '6m 22s', interceptor: 'ACE-04', method: 'NET CAPTURE', color: P.green, dot: P.green },
  ];

  sc.children = [
    ...GridDots(0, 0, 26, 6, 15, P.cyan, 0.05),
    StatusBar(4),

    F(16, 52, 358, 44, 'transparent', { ch: [
      T('MISSION LOG', 0, 0, 200, 16, { size: 11, fill: P.cyan, weight: 700, ls: 2 }),
      T('TODAY · 31 INTERCEPTS', 0, 22, 230, 14, { size: 12, fill: P.fg, weight: 800 }),
    ]}),

    Line(16, 100, 358, P.border2),

    // Filter chips
    F(16, 110, 358, 36, 'transparent', { ch: [
      F(0, 4, 60, 28, P.red + '22', { r: 14, stroke: P.red + '55', sw: 1, ch: [
        T('ALL', 0, 7, 60, 14, { size: 10, fill: P.red, weight: 700, ls: 0.5, align: 'center' }),
      ]}),
      F(68, 4, 100, 28, P.surface2, { r: 14, stroke: P.border2, sw: 1, ch: [
        T('NEUTRALIZED', 0, 7, 100, 14, { size: 10, fill: P.fg2, ls: 0.5, align: 'center' }),
      ]}),
      F(176, 4, 80, 28, P.surface2, { r: 14, stroke: P.border2, sw: 1, ch: [
        T('IN PROGRESS', 0, 7, 80, 14, { size: 10, fill: P.fg2, ls: 0.5, align: 'center' }),
      ]}),
      F(264, 4, 90, 28, P.surface2, { r: 14, stroke: P.border2, sw: 1, ch: [
        T('LOST SIGNAL', 0, 7, 90, 14, { size: 10, fill: P.fg2, ls: 0.5, align: 'center' }),
      ]}),
    ]}),

    // Mission entries
    ...missions.map((m, i) => F(16, 156 + i * 118, 358, 110, P.surface2, {
      r: 8,
      stroke: m.outcome === 'IN PROGRESS' ? P.red + '55' : P.border,
      sw: 1,
      ch: [
        // Mission ID + outcome badge
        T(m.id, 14, 12, 80, 16, { size: 13, fill: P.fg, weight: 900 }),
        T(m.target, 14, 32, 80, 14, { size: 11, fill: P.muted }),
        StatusPill(200, 10, m.outcome, m.dot),

        Line(14, 52, 330, P.border2),

        // Stats 3-column
        T('INTERCEPTOR', 14, 62, 110, 10, { size: 8, fill: P.muted, ls: 0.8 }),
        T(m.interceptor, 14, 76, 110, 14, { size: 12, fill: P.fg, weight: 700 }),

        T('METHOD', 134, 62, 90, 10, { size: 8, fill: P.muted, ls: 0.8 }),
        T(m.method, 134, 76, 90, 14, { size: 10, fill: P.cyan, weight: 600 }),

        T('DURATION', 254, 62, 90, 10, { size: 8, fill: P.muted, ls: 0.8 }),
        T(m.duration, 254, 76, 90, 14, { size: 12, fill: m.color, weight: 700 }),

        T(`TIME: ${m.time}`, 14, 94, 200, 12, { size: 9, fill: P.muted }),
      ],
    })),

    NavBar(3),
  ];
  return sc;
}

// ══════════════════════════════════════════════════════════════════════════════
// Screen 5 — After Action Report (AAR)
// ══════════════════════════════════════════════════════════════════════════════
function buildAfterAction() {
  const sc = F(0, 0, 390, 844, P.bg, { clip: true });

  sc.children = [
    ...GridDots(0, 0, 26, 8, 15, P.cyan, 0.05),
    StatusBar(5),

    F(16, 52, 358, 44, 'transparent', { ch: [
      T('AFTER ACTION', 0, 0, 200, 16, { size: 11, fill: P.cyan, weight: 700, ls: 2 }),
      T('BRIEF — SECTOR BRAVO-7', 0, 22, 260, 14, { size: 12, fill: P.fg, weight: 800 }),
    ]}),

    Line(16, 100, 358, P.border2),

    // Classification badge (military aesthetic)
    F(16, 112, 358, 28, P.red + '18', { r: 4, stroke: P.red + '44', sw: 1, ch: [
      T('⚠  CONFIDENTIAL — RESTRICTED CIRCULATION', 0, 7, 358, 14, { size: 9, fill: P.red, weight: 700, ls: 1.5, align: 'center' }),
    ]}),

    // Report header block
    F(16, 148, 358, 72, P.surface2, { r: 8, stroke: P.border2, sw: 1, ch: [
      T('DAILY OPERATIONS SUMMARY', 14, 12, 280, 12, { size: 9, fill: P.muted, ls: 1.5 }),
      T('21 MAR 2026  ·  SECTOR BRAVO-7', 14, 28, 280, 16, { size: 14, fill: P.fg, weight: 700 }),
      T('AEGIS v4.2.1 · CLASSIFICATION: C2', 14, 48, 260, 12, { size: 10, fill: P.muted }),
      T('[ PDF ]', 296, 28, 58, 16, { size: 11, fill: P.cyan, weight: 700, align: 'right' }),
    ]}),

    // Key metrics block
    T('OPERATIONAL METRICS', 16, 234, 200, 12, { size: 9, fill: P.muted, ls: 1.5 }),

    ...[
      { metric: 'Total Threats Detected', val: '31', sub: '↑ 18% vs yesterday', color: P.fg },
      { metric: 'Successful Intercepts', val: '29', sub: '93.5% success rate', color: P.green },
      { metric: 'Threats Escaped', val: '2', sub: 'Under review', color: P.amber },
      { metric: 'Fleet Operational Time', val: '14.2h', sub: 'ACE-01 longest sortie', color: P.cyan },
    ].map((m, i) => F(16, 254 + i * 56, 358, 48, P.surface2, { r: 6, stroke: P.border2, sw: 1, ch: [
      T(m.metric, 14, 10, 240, 13, { size: 11, fill: P.fg }),
      T(m.sub, 14, 28, 230, 12, { size: 9, fill: P.fg2 }),
      T(m.val, 298, 8, 60, 28, { size: 22, fill: m.color, weight: 900, align: 'right' }),
    ]})),

    // Recommendations
    T('AI RECOMMENDATIONS', 16, 486, 200, 12, { size: 9, fill: P.muted, ls: 1.5 }),
    F(16, 504, 358, 90, P.surface2, { r: 8, stroke: P.cyan + '33', sw: 1, ch: [
      E(14, 14, 20, 20, P.cyan + '22'),
      T('AI', 14, 14, 20, 20, { size: 9, fill: P.cyan, weight: 900, align: 'center' }),
      T('ACE-05 battery critical (31%). Recommend priority\nrecharge cycle. Threat forecasting indicates elevated\nactivity 22:00–02:00. Suggest full fleet readiness by 21:30.', 44, 12, 302, 64, { size: 10, fill: P.fg, lh: 1.6 }),
    ]}),

    // Sign-off
    F(16, 604, 358, 44, 'transparent', { ch: [
      T('OPERATOR ACKNOWLEDGEMENT', 0, 0, 260, 12, { size: 9, fill: P.muted, ls: 1.5 }),
      F(0, 20, 170, 24, P.red, { r: 4, ch: [
        T('APPROVE & SUBMIT BRIEF', 0, 5, 170, 14, { size: 10, fill: '#0E1114', weight: 800, align: 'center', ls: 0.5 }),
      ]}),
      F(178, 20, 90, 24, P.surface3, { r: 4, stroke: P.border2, sw: 1, ch: [
        T('REVISE', 0, 5, 90, 14, { size: 10, fill: P.fg, align: 'center' }),
      ]}),
      F(276, 20, 82, 24, P.surface3, { r: 4, stroke: P.border2, sw: 1, ch: [
        T('ARCHIVE', 0, 5, 82, 14, { size: 10, fill: P.fg, align: 'center' }),
      ]}),
    ]}),

    NavBar(4),
  ];
  return sc;
}

// ── Assemble Document ─────────────────────────────────────────────────────────
const SCREEN_GAP = 40;
const screens = [
  buildCommandCenter(),
  buildRadarMap(),
  buildFleetStatus(),
  buildMissionLog(),
  buildAfterAction(),
];

// Layout screens horizontally
screens.forEach((s, i) => { s.x = i * (390 + SCREEN_GAP); s.y = 0; });

const totalW = screens.length * (390 + SCREEN_GAP) - SCREEN_GAP;
const doc = {
  version: '2.8',
  name: 'AEGIS — Counter-UAV Operations Platform',
  width: totalW,
  height: 844,
  fill: '#080C10',
  children: screens,
};

fs.writeFileSync(path.join(__dirname, 'aegis.pen'), JSON.stringify(doc, null, 2));
console.log(`✓ aegis.pen written (${screens.length} screens, ${totalW}×844)`);
