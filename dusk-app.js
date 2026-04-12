'use strict';
// dusk-app.js
// DUSK — Privacy-First Web Analytics
// Design Heartbeat — Mar 21, 2026
// Inspired by:
//   • Fathom Analytics 3D globe visualization featured on godly.website
//     ("Web analytics in 2026 should look like this")
//   • OWO site on darkmodedesign.com — hot pink/magenta on pure dark, extreme contrast
//   • Flomodia on darkmodedesign.com — oversized condensed numbers as KPI display
// Challenge: Dark-glassmorphism web analytics dashboard with geographic globe view,
//   hot-pink neon accent, and condensed oversized metric typography.

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:        '#08000F',   // near-black with deep violet tint
  surface:   '#120020',   // glassmorphism card base
  surface2:  '#1C0030',   // elevated surface
  surface3:  '#260040',   // highest elevation
  border:    '#3D0060',   // subtle border
  border2:   '#5C0090',   // stronger border
  accent:    '#FF2D78',   // hot pink — OWO / darkmodedesign.com
  accentDim: '#4D0020',   // dimmed accent bg
  accentHi:  '#FF80AA',   // lighter pink highlight
  accent2:   '#9D4EDD',   // purple gradient pair
  accent2Dim:'#2D0050',   // dimmed purple
  fg:        '#FAFAFA',   // near-white
  fg2:       '#B0A0C0',   // muted lavender-white
  fg3:       '#604080',   // very muted purple-grey
  green:     '#00E5A0',   // mint success
  amber:     '#FFB930',   // warning / highlight
  red:       '#FF4D6A',   // error / decline
  blue:      '#4DB8FF',   // info
};

// ── Pen structure helpers ─────────────────────────────────────────────────────
function frame(name, x, y, w, h, fill, children = [], opts = {}) {
  return { type: 'frame', name, x, y, width: w, height: h, fill: fill || P.bg,
    cornerRadius: opts.r || 0, opacity: opts.o || 1, children };
}
function rect(x, y, w, h, fill, opts = {}) {
  return { type: 'frame', x, y, width: w, height: h, fill, cornerRadius: opts.r || 0,
    opacity: opts.o || 1, children: opts.children || [] };
}
function text(x, y, w, h, fill, opts = {}) {
  return { type: 'text', x, y, width: w, height: h, fill };
}
function ellipse(x, y, w, h, fill, opts = {}) {
  return { type: 'ellipse', x, y, width: w, height: h, fill, opacity: opts.o || 1 };
}

// ── Screen 1: Overview Dashboard ─────────────────────────────────────────────
function overviewScreen() {
  const W = 390, H = 844;
  const ch = [];

  // Deep ambient glows — glassmorphism depth
  ch.push(ellipse(-80, -60, 300, 300, P.accent, { o: 0.08 }));
  ch.push(ellipse(200, 500, 240, 240, P.accent2, { o: 0.06 }));
  ch.push(ellipse(150, 200, 180, 180, P.accent, { o: 0.04 }));

  // Status bar
  ch.push(rect(0, 0, W, 44, 'transparent', { children: [
    text(16, 14, 40, 14, P.fg2),
    text(300, 14, 74, 14, P.fg2),
  ]}));

  // Logo bar
  ch.push(rect(0, 44, W, 56, 'transparent', { children: [
    // Logo mark — D in pill
    rect(16, 12, 36, 32, P.accentDim, { r: 8, children: [
      text(10, 8, 16, 16, P.accent),
    ]}),
    text(62, 16, 80, 18, P.fg),   // "DUSK"
    text(62, 36, 140, 12, P.fg3), // "Analytics"
    // Live pill
    rect(270, 20, 84, 24, P.accentDim, { r: 12, children: [
      ellipse(10, 7, 10, 10, P.accent, { o: 1 }),
      text(24, 4, 54, 14, P.accent),
    ]}),
  ]}));

  // Period selector
  ch.push(rect(16, 106, W - 32, 36, P.surface, { r: 8, children: [
    rect(4, 4, 68, 28, P.accent, { r: 6, children: [text(14, 6, 40, 16, P.bg)] }), // "Today" selected
    text(88, 10, 50, 16, P.fg3), // "7 days"
    text(152, 10, 50, 16, P.fg3), // "30 days"
    text(216, 10, 60, 16, P.fg3), // "Custom"
    rect(W - 64, 6, 48, 24, P.surface2, { r: 6, children: [text(8, 4, 32, 16, P.fg3)] }),
  ]}));

  // Hero metrics — 2x2 grid with oversized condensed numbers
  const metrics = [
    { val: P.fg,     valW: 120, labelFill: P.fg2, subFill: P.green },
    { val: P.fg,     valW: 120, labelFill: P.fg2, subFill: P.accent },
    { val: P.fg,     valW: 80,  labelFill: P.fg2, subFill: P.green },
    { val: P.amber,  valW: 80,  labelFill: P.fg2, subFill: P.red },
  ];
  metrics.forEach((m, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 16 + col * 183, y = 158 + row * 106;
    const cardW = 179;
    ch.push(rect(x, y, cardW, 98, P.surface, { r: 14, children: [
      // Glassmorphism border
      rect(0, 0, cardW, 98, 'transparent', { r: 14, children: [] }),
      // Label
      text(16, 14, cardW - 32, 12, P.fg3),
      // Big number (condensed display)
      text(16, 30, m.valW, 32, m.val),
      // Subtext / trend
      text(16, 66, cardW - 32, 14, m.subFill),
      text(16, 82, cardW - 32, 10, P.fg3),
    ]}));
  });

  // Chart area — sparkline / bar chart
  ch.push(rect(16, 374, W - 32, 160, P.surface, { r: 14, children: [
    text(16, 14, 160, 13, P.fg2),
    text(W - 80, 14, 64, 13, P.fg3),
    // Chart bars (24-hour view)
    ...[0.3, 0.5, 0.4, 0.7, 0.6, 0.9, 0.8, 0.7, 0.5, 0.6, 0.8, 0.9, 1.0, 0.85, 0.7, 0.6, 0.55, 0.65, 0.8, 0.75, 0.5, 0.4, 0.3, 0.25].map((v, i) => {
      const bH = Math.round(v * 80);
      const bW = 10;
      const bX = 16 + i * (bW + 3);
      const isToday = i >= 20;
      return rect(bX, 100 - bH, bW, bH, isToday ? P.accent : P.surface3, { r: 2, o: isToday ? 1 : 0.7 });
    }),
  ]}));

  // Top pages preview
  ch.push(rect(16, 546, W - 32, 200, P.surface, { r: 14, children: [
    text(16, 14, 120, 13, P.fg2),
    text(W - 80, 14, 60, 12, P.accentHi),
    // Page rows
    ...[0, 1, 2, 3].map(i => {
      const y = 36 + i * 40;
      return rect(0, y, W - 32, 38, 'transparent', { children: [
        rect(16, 9, 8, 20, P.accent, { r: 2 }),     // accent bar
        text(32, 9, 180, 13, P.fg),                   // page path
        text(32, 24, 120, 10, P.fg3),                 // url
        text(W - 80, 9, 64, 13, P.fg2),               // visitors
        text(W - 80, 24, 64, 10, P.green),             // trend
        rect(0, 37, W - 32, 1, P.border, {}),          // divider
      ]});
    }),
  ]}));

  // Bottom nav
  ch.push(rect(0, H - 82, W, 82, P.surface, { children: [
    rect(0, 0, W, 1, P.border, {}),
    ...[
      { fill: P.accent }, { fill: P.fg3 }, { fill: P.fg3 }, { fill: P.fg3 }, { fill: P.fg3 },
    ].map((n, i) => {
      const x = 16 + i * 72;
      return rect(x, 10, 52, 52, 'transparent', { children: [
        ellipse(12, 4, 28, 28, i === 0 ? P.accentDim : 'transparent'),
        text(14, 6, 24, 24, n.fill),
        text(6, 32, 40, 12, i === 0 ? P.accent : P.fg3),
      ]});
    }),
  ]}));

  return frame('Overview', 0, 0, W, H, P.bg, ch);
}

// ── Screen 2: Traffic Sources ─────────────────────────────────────────────────
function sourcesScreen() {
  const W = 390, H = 844;
  const ch = [];

  ch.push(ellipse(200, -100, 260, 260, P.accent2, { o: 0.07 }));
  ch.push(ellipse(-60, 400, 200, 200, P.accent, { o: 0.05 }));

  // Status + header
  ch.push(rect(0, 0, W, 44, 'transparent', { children: [
    text(16, 14, 40, 14, P.fg2),
    text(300, 14, 74, 14, P.fg2),
  ]}));
  ch.push(rect(0, 44, W, 56, 'transparent', { children: [
    rect(16, 16, 28, 28, P.surface2, { r: 8, children: [text(6, 5, 16, 18, P.fg2)] }),
    text(54, 18, 200, 20, P.fg),
    text(54, 40, 160, 12, P.fg3),
  ]}));

  // Donut chart area
  ch.push(rect(16, 110, W - 32, 220, P.surface, { r: 14, children: [
    // Donut rings (simplified as concentric ellipses)
    ellipse(W / 2 - 16 - 70, 30, 140, 140, P.surface2),
    ellipse(W / 2 - 16 - 55, 45, 110, 110, P.surface3),
    // Arc segments (color fills — simplified as ellipses layered)
    ellipse(W / 2 - 16 - 70, 30, 140, 140, P.accent, { o: 0.5 }),
    ellipse(W / 2 - 16 - 55, 45, 110, 110, P.surface3),
    // Center metric
    text(W / 2 - 16 - 40, 95, 80, 22, P.fg),
    text(W / 2 - 16 - 36, 119, 72, 11, P.fg3),
    // Legend
    ...[
      { fill: P.accent },
      { fill: P.accent2 },
      { fill: P.blue },
      { fill: P.amber },
    ].map((l, i) => rect(W - 130 - 16, 40 + i * 36, 114, 28, 'transparent', { children: [
      ellipse(0, 6, 16, 16, l.fill),
      text(24, 4, 90, 13, P.fg2),
      text(24, 18, 70, 10, P.fg3),
    ]})),
  ]}));

  // Source breakdown bars
  const sources = [
    { color: P.accent,  pct: 0.42 },
    { color: P.accent2, pct: 0.28 },
    { color: P.blue,    pct: 0.18 },
    { color: P.amber,   pct: 0.12 },
    { color: P.green,   pct: 0.06 },
  ];
  ch.push(rect(16, 342, W - 32, 280, P.surface, { r: 14, children: [
    text(16, 14, 160, 13, P.fg2),
    text(W - 96, 14, 80, 12, P.fg3),
    ...sources.map((s, i) => rect(0, 42 + i * 48, W - 32, 46, 'transparent', { children: [
      // Source icon placeholder
      ellipse(16, 13, 20, 20, P.surface2),
      text(44, 11, 140, 14, P.fg),
      text(44, 27, 120, 10, P.fg3),
      // Bar track
      rect(16, 38, W - 64, 4, P.surface3, { r: 2 }),
      // Bar fill
      rect(16, 38, Math.round((W - 64) * s.pct), 4, s.color, { r: 2 }),
      // Value
      text(W - 80, 11, 64, 14, P.fg2),
      text(W - 80, 27, 64, 10, s.color),
    ]})),
  ]}));

  // Referrers mini-table
  ch.push(rect(16, 634, W - 32, 120, P.surface, { r: 14, children: [
    text(16, 14, 140, 13, P.fg2),
    ...[0, 1, 2].map(i => rect(0, 36 + i * 28, W - 32, 26, 'transparent', { children: [
      text(16, 7, 200, 13, P.fg2),
      text(W - 96, 7, 80, 13, P.fg3),
      rect(0, 25, W - 32, 1, P.border, {}),
    ]})),
  ]}));

  // Bottom nav
  ch.push(rect(0, H - 82, W, 82, P.surface, { children: [
    rect(0, 0, W, 1, P.border, {}),
    ...[
      { fill: P.fg3 }, { fill: P.accent }, { fill: P.fg3 }, { fill: P.fg3 }, { fill: P.fg3 },
    ].map((n, i) => {
      const x = 16 + i * 72;
      return rect(x, 10, 52, 52, 'transparent', { children: [
        ellipse(12, 4, 28, 28, i === 1 ? P.accentDim : 'transparent'),
        text(14, 6, 24, 24, n.fill),
        text(6, 32, 40, 12, i === 1 ? P.accent : P.fg3),
      ]});
    }),
  ]}));

  return frame('Sources', 0, 0, W, H, P.bg, ch);
}

// ── Screen 3: Top Pages ──────────────────────────────────────────────────────
function pagesScreen() {
  const W = 390, H = 844;
  const ch = [];

  ch.push(ellipse(280, 100, 220, 220, P.accent, { o: 0.06 }));
  ch.push(ellipse(-50, 600, 200, 200, P.accent2, { o: 0.05 }));

  ch.push(rect(0, 0, W, 44, 'transparent', { children: [
    text(16, 14, 40, 14, P.fg2), text(300, 14, 74, 14, P.fg2),
  ]}));

  ch.push(rect(0, 44, W, 56, 'transparent', { children: [
    rect(16, 16, 28, 28, P.surface2, { r: 8, children: [text(6, 5, 16, 18, P.fg2)] }),
    text(54, 18, 160, 20, P.fg),
    text(54, 40, 120, 12, P.fg3),
    rect(W - 100, 16, 84, 28, P.surface, { r: 8, children: [
      text(12, 6, 60, 16, P.fg3),
    ]}),
  ]}));

  // Sort/filter pills
  ch.push(rect(16, 106, W - 32, 36, 'transparent', { children: [
    rect(0, 4, 80, 28, P.accent, { r: 14, children: [text(16, 6, 48, 16, P.bg)] }),
    rect(88, 4, 96, 28, P.surface, { r: 14, children: [text(14, 6, 68, 16, P.fg3)] }),
    rect(192, 4, 90, 28, P.surface, { r: 14, children: [text(14, 6, 62, 16, P.fg3)] }),
    rect(290, 4, 84, 28, P.surface, { r: 14, children: [text(14, 6, 56, 16, P.fg3)] }),
  ]}));

  // Pages table
  const pageColors = [P.green, P.accent, P.accent2, P.blue, P.green, P.amber, P.red, P.green];
  for (let i = 0; i < 8; i++) {
    const y = 154 + i * 72;
    const isExpanded = i === 0;
    ch.push(rect(16, y, W - 32, isExpanded ? 64 : 60, P.surface, { r: 12, children: [
      // Rank
      text(14, isExpanded ? 20 : 18, 20, 22, P.fg3),
      // Sparkline area
      ...[0.4, 0.5, 0.3, 0.7, 0.6, 0.8, 1.0, 0.9].map((v, si) => {
        const bH = Math.round(v * 28);
        return rect(40 + si * 12, (isExpanded ? 28 : 26) - bH, 8, bH, i === 0 ? P.accent : P.surface3, { r: 1 });
      }),
      // Page path
      text(144, isExpanded ? 12 : 10, 140, 13, P.fg),
      text(144, isExpanded ? 28 : 26, 120, 10, P.fg3),
      // Visitors metric
      text(W - 80, isExpanded ? 12 : 10, 64, 14, P.fg2),
      // Trend badge
      rect(W - 80, isExpanded ? 30 : 28, 64, 18, pageColors[i] + '22', { r: 4, children: [
        text(8, 2, 48, 14, pageColors[i]),
      ]}),
      // Expanded extra row
      ...(isExpanded ? [
        rect(16, 46, 60, 14, P.surface2, { r: 4, children: [text(6, 2, 48, 10, P.fg3)] }),
        rect(82, 46, 80, 14, P.surface2, { r: 4, children: [text(6, 2, 68, 10, P.fg3)] }),
      ] : []),
    ]}));
  }

  // Bottom nav
  ch.push(rect(0, H - 82, W, 82, P.surface, { children: [
    rect(0, 0, W, 1, P.border, {}),
    ...[
      { fill: P.fg3 }, { fill: P.fg3 }, { fill: P.accent }, { fill: P.fg3 }, { fill: P.fg3 },
    ].map((n, i) => {
      const x = 16 + i * 72;
      return rect(x, 10, 52, 52, 'transparent', { children: [
        ellipse(12, 4, 28, 28, i === 2 ? P.accentDim : 'transparent'),
        text(14, 6, 24, 24, n.fill),
        text(6, 32, 40, 12, i === 2 ? P.accent : P.fg3),
      ]});
    }),
  ]}));

  return frame('Top Pages', 0, 0, W, H, P.bg, ch);
}

// ── Screen 4: Geography (Globe View) ─────────────────────────────────────────
function geographyScreen() {
  const W = 390, H = 844;
  const ch = [];

  // Globe glow — inspired by Fathom Analytics 3D globe on godly.website
  ch.push(ellipse(195 - 140, 200 - 140, 280, 280, P.accent, { o: 0.12 }));
  ch.push(ellipse(195 - 140, 200 - 140, 280, 280, P.accent2, { o: 0.06 }));

  ch.push(rect(0, 0, W, 44, 'transparent', { children: [
    text(16, 14, 40, 14, P.fg2), text(300, 14, 74, 14, P.fg2),
  ]}));

  ch.push(rect(0, 44, W, 56, 'transparent', { children: [
    rect(16, 16, 28, 28, P.surface2, { r: 8, children: [text(6, 5, 16, 18, P.fg2)] }),
    text(54, 18, 160, 20, P.fg),
    text(54, 40, 120, 12, P.fg3),
  ]}));

  // Globe visualization — large circular map representation
  const globeX = W / 2 - 155, globeY = 110;
  const globeR = 310;

  // Globe base — dark sphere
  ch.push(ellipse(globeX, globeY, globeR, globeR, P.surface2));
  // Globe rim glow
  ch.push(ellipse(globeX + 10, globeY + 10, globeR - 20, globeR - 20, P.surface3));

  // Continent blobs (simplified geography)
  // North America
  ch.push(rect(globeX + 20, globeY + 60, 80, 100, P.accent2, { r: 8, o: 0.7 }));
  // Europe
  ch.push(rect(globeX + 140, globeY + 60, 60, 70, P.accent2, { r: 6, o: 0.6 }));
  // Asia
  ch.push(rect(globeX + 190, globeY + 50, 90, 90, P.accent2, { r: 10, o: 0.65 }));
  // South America
  ch.push(rect(globeX + 50, globeY + 160, 50, 80, P.accent2, { r: 8, o: 0.5 }));
  // Africa
  ch.push(rect(globeX + 140, globeY + 130, 55, 90, P.accent2, { r: 8, o: 0.55 }));
  // Australia
  ch.push(rect(globeX + 220, globeY + 170, 50, 40, P.accent2, { r: 6, o: 0.5 }));

  // Hotspot dots — active visitor clusters
  const dots = [
    { x: globeX + 55,  y: globeY + 90,  r: 18, o: 0.9, c: P.accent },  // USA
    { x: globeX + 158, y: globeY + 80,  r: 14, o: 0.8, c: P.accent },  // UK/Europe
    { x: globeX + 215, y: globeY + 70,  r: 16, o: 0.85, c: P.accent }, // Asia
    { x: globeX + 72,  y: globeY + 185, r: 8,  o: 0.6, c: P.accentHi },// Brazil
    { x: globeX + 155, y: globeY + 155, r: 10, o: 0.65, c: P.accentHi }// Africa
  ];
  dots.forEach(d => {
    ch.push(ellipse(d.x - d.r, d.y - d.r, d.r * 2, d.r * 2, d.c, { o: d.o * 0.3 })); // outer glow
    ch.push(ellipse(d.x - d.r * 0.5, d.y - d.r * 0.5, d.r, d.r, d.c, { o: d.o })); // core
  });

  // Globe overlay gradient (bottom fade)
  ch.push(rect(globeX, globeY + globeR - 80, globeR, 80, P.bg, { o: 0.6 }));

  // Country breakdown list
  ch.push(rect(16, 440, W - 32, 306, P.surface, { r: 14, children: [
    text(16, 14, 160, 13, P.fg2),
    text(W - 110, 14, 80, 12, P.fg3),
    // Country rows
    ...[
      { color: P.accent,  pct: 0.38 },
      { color: P.accent2, pct: 0.22 },
      { color: P.blue,    pct: 0.16 },
      { color: P.green,   pct: 0.11 },
      { color: P.amber,   pct: 0.07 },
      { color: P.fg3,     pct: 0.06 },
    ].map((c, i) => rect(0, 36 + i * 44, W - 32, 42, 'transparent', { children: [
      // Flag placeholder
      rect(16, 11, 24, 20, P.surface2, { r: 4 }),
      text(48, 11, 140, 14, P.fg),
      text(48, 27, 100, 10, P.fg3),
      // Bar
      rect(16, 36, W - 64, 3, P.surface3, { r: 2 }),
      rect(16, 36, Math.round((W - 64) * c.pct), 3, c.color, { r: 2 }),
      // Pct
      text(W - 80, 11, 64, 14, P.fg2),
      text(W - 80, 27, 64, 10, c.color),
      rect(0, 40, W - 32, 1, P.border, {}),
    ]})),
  ]}));

  // Bottom nav
  ch.push(rect(0, H - 82, W, 82, P.surface, { children: [
    rect(0, 0, W, 1, P.border, {}),
    ...[
      { fill: P.fg3 }, { fill: P.fg3 }, { fill: P.fg3 }, { fill: P.accent }, { fill: P.fg3 },
    ].map((n, i) => {
      const x = 16 + i * 72;
      return rect(x, 10, 52, 52, 'transparent', { children: [
        ellipse(12, 4, 28, 28, i === 3 ? P.accentDim : 'transparent'),
        text(14, 6, 24, 24, n.fill),
        text(6, 32, 40, 12, i === 3 ? P.accent : P.fg3),
      ]});
    }),
  ]}));

  return frame('Geography', 0, 0, W, H, P.bg, ch);
}

// ── Screen 5: Privacy Settings ────────────────────────────────────────────────
function settingsScreen() {
  const W = 390, H = 844;
  const ch = [];

  ch.push(ellipse(260, -80, 200, 200, P.accent2, { o: 0.06 }));

  ch.push(rect(0, 0, W, 44, 'transparent', { children: [
    text(16, 14, 40, 14, P.fg2), text(300, 14, 74, 14, P.fg2),
  ]}));

  ch.push(rect(0, 44, W, 56, 'transparent', { children: [
    rect(16, 16, 28, 28, P.surface2, { r: 8, children: [text(6, 5, 16, 18, P.fg2)] }),
    text(54, 18, 160, 20, P.fg),
    text(54, 40, 120, 12, P.fg3),
  ]}));

  // Privacy score card
  ch.push(rect(16, 110, W - 32, 110, P.accentDim, { r: 14, children: [
    rect(0, 0, W - 32, 110, P.accent, { r: 14, o: 0.08 }),
    // Shield icon
    ellipse(20, 28, 50, 50, P.accentDim),
    text(30, 38, 30, 30, P.accent),
    // Score
    text(90, 18, 80, 36, P.accent),  // "A+"
    text(90, 58, 200, 14, P.fg),
    text(90, 74, 180, 11, P.fg2),
    text(90, 88, 200, 11, P.fg3),
    // Bar
    rect(16, 94, W - 64, 6, P.accentDim, { r: 3 }),
    rect(16, 94, Math.round((W - 64) * 0.94), 6, P.accent, { r: 3 }),
  ]}));

  // Settings sections
  const sections = [
    { label: 'DATA COLLECTION', count: 3 },
    { label: 'EXCLUSIONS',      count: 2 },
    { label: 'RETENTION',       count: 2 },
    { label: 'INTEGRATIONS',    count: 3 },
  ];

  let yOff = 234;
  sections.forEach((sec) => {
    ch.push(text(16, yOff, 200, 11, P.fg3));
    yOff += 18;

    for (let r = 0; r < sec.count; r++) {
      const isToggle = r < 2;
      ch.push(rect(16, yOff, W - 32, 52, P.surface, { r: 12, children: [
        text(16, 13, 200, 15, P.fg),
        text(16, 30, 220, 11, P.fg3),
        // Toggle or chevron
        ...(isToggle ? [
          rect(W - 76, 14, 60, 24, r === 0 ? P.accent : P.surface3, { r: 12, children: [
            ellipse(r === 0 ? 34 : 4, 4, 16, 16, P.bg),
          ]}),
        ] : [
          rect(W - 40, 18, 24, 16, 'transparent', { children: [text(4, 2, 16, 12, P.fg3)] }),
        ]),
      ]}));
      yOff += 60;
    }
    yOff += 8;
  });

  // Danger zone
  ch.push(rect(16, yOff, W - 32, 60, '#1A0008', { r: 12, children: [
    rect(0, 0, W - 32, 60, P.red, { r: 12, o: 0.08 }),
    text(16, 14, 200, 14, P.red),
    text(16, 30, 220, 11, P.fg3),
    rect(W - 100, 18, 84, 24, '#300010', { r: 8, children: [
      text(12, 4, 60, 16, P.red),
    ]}),
  ]}));

  // Bottom nav
  ch.push(rect(0, H - 82, W, 82, P.surface, { children: [
    rect(0, 0, W, 1, P.border, {}),
    ...[
      { fill: P.fg3 }, { fill: P.fg3 }, { fill: P.fg3 }, { fill: P.fg3 }, { fill: P.accent },
    ].map((n, i) => {
      const x = 16 + i * 72;
      return rect(x, 10, 52, 52, 'transparent', { children: [
        ellipse(12, 4, 28, 28, i === 4 ? P.accentDim : 'transparent'),
        text(14, 6, 24, 24, n.fill),
        text(6, 32, 40, 12, i === 4 ? P.accent : P.fg3),
      ]});
    }),
  ]}));

  return frame('Privacy Settings', 0, 0, W, H, P.bg, ch);
}

// ── Assemble pen ──────────────────────────────────────────────────────────────
const pen = {
  version:  '2.8',
  name:     'DUSK — Privacy-First Web Analytics',
  children: [
    overviewScreen(),
    sourcesScreen(),
    pagesScreen(),
    geographyScreen(),
    settingsScreen(),
  ],
};

const outPath = path.join(__dirname, 'dusk.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ Written: ${outPath}`);
console.log(`  Screens : ${pen.children.length}`);
console.log(`  Size    : ${(fs.statSync(outPath).size / 1024).toFixed(1)} KB`);
