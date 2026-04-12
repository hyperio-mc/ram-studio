'use strict';
// pen-utils.js — Gradient fills, drop shadows, and advanced visual utilities
// for the .pen format (pen-viewer-3 compatible)
//
// Discovered: the pen viewer SVG/canvas renderer fully supports:
//   • Gradient fills  → fill: { type:'gradient', gradientType:'linear'|'radial', ... }
//   • Drop shadows    → effects: [{ type:'drop-shadow', color, blur, offset:{x,y} }]
//
// Usage:
//   const U = require('./pen-utils');
//   fill: U.linearGradient(135, [[0,'#FF6B35'],[1,'#7C3AED']])
//   effects: U.dropShadow('rgba(0,0,0,0.2)', 24, 0, 8)

// ── Gradient fill constructors ─────────────────────────────────────────────────

// Linear gradient fill object — use as `fill` value in F() or E()
// rotation: 0–360 degrees (0 = top→bottom, 90 = left→right, 135 = diagonal)
// stops:    [[position 0–1, color string], ...]
function linearGradient(rotation, stops) {
  return {
    type: 'gradient',
    gradientType: 'linear',
    rotation,
    colors: stops.map(([position, color]) => ({ position, color })),
  };
}

// Radial gradient fill object — use as `fill` value in F() or E()
// cx, cy:  center of gradient (0–1 ratio) — default center 0.5, 0.5
// stops:   [[position 0–1, color string], ...]
function radialGradient(stops, cx = 0.5, cy = 0.5) {
  return {
    type: 'gradient',
    gradientType: 'radial',
    center: { x: cx, y: cy },
    size:   { width: 1, height: 1 },
    colors: stops.map(([position, color]) => ({ position, color })),
  };
}

// ── Drop shadow effect ─────────────────────────────────────────────────────────

// Returns an effects array — attach to any node as node.effects = dropShadow(...)
// or pass as opts.fx in FG() / EG() below.
// color: CSS color string (rgba recommended for transparency)
// blur:  blur radius in px
// x, y:  shadow offset in px
function dropShadow(color = 'rgba(0,0,0,0.15)', blur = 16, x = 0, y = 8) {
  return [{ type: 'drop-shadow', color, blur, offset: { x, y } }];
}

// Multiple shadows (returns effects array with >1 shadow)
function shadows(...args) {
  // Each arg: [color, blur, x, y]
  return args.map(([color, blur, x, y]) => ({
    type: 'drop-shadow', color, blur, offset: { x, y },
  }));
}

// ── Extended frame / ellipse helpers ──────────────────────────────────────────
// These mirror the standard F() and E() helpers but accept effects.

// FG — Frame with Gradient (or any) fill, optional drop shadow
// opts.r    → cornerRadius (default 0)
// opts.op   → opacity (default 1)
// opts.ch   → children array
// opts.clip → clipContent boolean
// opts.fx   → effects array (e.g. dropShadow(...))
function FG(x, y, w, h, fill, opts = {}) {
  const node = {
    type:         'frame',
    x, y,
    width:        w,
    height:       h,
    fill,
    cornerRadius: opts.r    || 0,
    opacity:      opts.op   || 1,
    children:     opts.ch   || [],
    clipContent:  opts.clip || false,
  };
  if (opts.fx) node.effects = opts.fx;
  return node;
}

// EG — Ellipse with Gradient (or any) fill, optional drop shadow
// opts.op → opacity (default 1)
// opts.fx → effects array
function EG(x, y, w, h, fill, opts = {}) {
  const node = {
    type:    'ellipse',
    x, y,
    width:   w,
    height:  h,
    fill,
    opacity: opts.op || 1,
  };
  if (opts.fx) node.effects = opts.fx;
  return node;
}

// ── Named gradient presets ─────────────────────────────────────────────────────
// Ready-to-use gradient fills for quick palette work.

const GRADIENTS = {
  // ── Warm / earthy ──────────────────────────────────────────────────────
  // Sunrise: orange → pink → purple
  sunrise:   linearGradient(135, [[0,'#FF6B35'],[0.5,'#E83D84'],[1,'#7C3AED']]),
  // Ember: dark red → vivid orange
  ember:     linearGradient(135, [[0,'#4A0000'],[0.5,'#C0392B'],[1,'#FF6D00']]),
  // Honey: warm amber → deep gold
  honey:     linearGradient(150, [[0,'#FF8F00'],[1,'#F57F17']]),

  // ── Cool / tech ────────────────────────────────────────────────────────
  // Ocean: deep blue → teal → cyan
  ocean:     linearGradient(160, [[0,'#0D47A1'],[0.5,'#006064'],[1,'#00BCD4']]),
  // Dusk: navy → purple → pink
  dusk:      linearGradient(150, [[0,'#0A0E2E'],[0.5,'#5C1F8C'],[1,'#FF4081']]),
  // Slate: cool dark panel
  slate:     linearGradient(180, [[0,'#1A1A2E'],[1,'#16213E']]),
  // Ice: pale blue → white
  ice:       linearGradient(160, [[0,'#E3F2FD'],[1,'#F8FAFF']]),

  // ── Dark mode ──────────────────────────────────────────────────────────
  // Void: pure dark depth
  void:      linearGradient(180, [[0,'#0D0D0D'],[1,'#1A1A1A']]),
  // Midnight: dark navy gradient for dashboards
  midnight:  linearGradient(135, [[0,'#0D1117'],[0.6,'#161B22'],[1,'#0D1117']]),
  // Obsidian: near-black with subtle hue
  obsidian:  radialGradient([[0,'#1C1C1E'],[1,'#0D0D0D']]),

  // ── Light / editorial ──────────────────────────────────────────────────
  // Cream: RAM Design Studio default
  cream:     linearGradient(160, [[0,'#F8F6F1'],[1,'#EDE9E0']]),
  // Ghost: soft white diffusion
  ghost:     linearGradient(180, [[0,'#FFFFFF'],[1,'#F4F2EE']]),
  // Parchment: warm editorial paper
  parchment: linearGradient(145, [[0,'#FAF7F2'],[1,'#EFEBE3']]),

  // ── Vivid / editorial accent ───────────────────────────────────────────
  // Electric: bright blue → violet
  electric:  linearGradient(135, [[0,'#0066FF'],[1,'#8B00FF']]),
  // Neon: neo-brutalist green → lime
  neon:      linearGradient(90,  [[0,'#00FF41'],[1,'#B2FF59']]),
  // Acid: brutalist yellow gradient
  acid:      linearGradient(90,  [[0,'#F5F500'],[1,'#FFE500']]),
};

// ── Shadow presets ─────────────────────────────────────────────────────────────

const SHADOWS = {
  // Soft lift — cards, panels
  soft:    dropShadow('rgba(0,0,0,0.08)', 12, 0, 4),
  // Medium elevation — modals, dropdowns
  medium:  dropShadow('rgba(0,0,0,0.15)', 24, 0, 8),
  // Strong lift — floating elements
  strong:  dropShadow('rgba(0,0,0,0.25)', 40, 0, 16),
  // Colored glow — AI orbs, highlights
  redGlow: dropShadow('rgba(192,57,43,0.4)',  32, 0, 0),
  blueGlow:dropShadow('rgba(41,128,185,0.4)', 32, 0, 0),
  // Brutalist hard shadow (no blur)
  brutal:  dropShadow('rgba(0,0,0,1)', 0, 4, 4),
};

// ── Gradient orb helper ────────────────────────────────────────────────────────
// Builds a soft glowing circular element using concentric EG() nodes.
// cx, cy: center coords; r: outer radius; colors: [outer, mid, inner]
// Returns array of 3 EG() nodes — spread into parent children.
function GlowOrb(cx, cy, r, colors, glowColor) {
  const [outer, mid, inner] = colors;
  const glow = glowColor || `${inner}66`;
  return [
    EG(cx-r,    cy-r,    r*2,    r*2,    radialGradient([[0, outer],[1,'transparent']]), { op: 0.3, fx: dropShadow(glow, r*0.8, 0, 0) }),
    EG(cx-r*0.7,cy-r*0.7,r*1.4, r*1.4, radialGradient([[0, mid],  [1,'transparent']]), { op: 0.6 }),
    EG(cx-r*0.4,cy-r*0.4,r*0.8, r*0.8, radialGradient([[0, inner],[1,'transparent']]), { op: 1 }),
  ];
}

// ── Gradient card helper ───────────────────────────────────────────────────────
// Frame with gradient background and optional drop shadow + rounded corners.
function GradientCard(x, y, w, h, gradient, children = [], opts = {}) {
  return FG(x, y, w, h, gradient, {
    r:  opts.r  || 12,
    op: opts.op || 1,
    ch: children,
    fx: opts.shadow !== false ? (opts.fx || SHADOWS.soft) : undefined,
    clip: true,
  });
}

module.exports = {
  // Constructors
  linearGradient,
  radialGradient,
  dropShadow,
  shadows,
  // Extended helpers
  FG,
  EG,
  GlowOrb,
  GradientCard,
  // Presets
  GRADIENTS,
  SHADOWS,
};
