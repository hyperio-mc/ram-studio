'use strict';
const fs = require('fs'), path = require('path');

const SLUG = 'splice';
const HEARTBEAT = 44;
const W = 390, H = 844;

// ── Palette — dark near-black with Jitter-inspired multi-hue accent system ──
// Inspired by: Jitter (Mobbin Site of Year) multi-color: cyan + acid yellow + violet + coral
// Floating pill nav from Mobbin's own glassmorphism floating navigation
const INK    = '#0B0C0F';   // deep near-black (richer than #000)
const SURF   = '#12141A';   // dark surface
const CARD   = '#1A1D26';   // card background
const CARD2  = '#22263A';   // elevated card
const TEXT   = '#F0F0F2';   // near-white text
const MUTED  = '#8892AA';   // muted blue-grey
const BORDER = '#252A38';   // subtle border
// Multi-hue accents (Jitter palette directly cited)
const CYAN   = '#00B2FF';   // electric cyan (Jitter primary)
const YELLOW = '#F0FF50';   // acid yellow (Jitter secondary)
const VIOLET = '#7A40ED';   // deep violet (Jitter tertiary)
const CORAL  = '#FD3456';   // coral red (Jitter quaternary)
const AQUA   = '#5FF3E0';   // aqua highlight

function rect(x, y, w, h, fill, opts = {}) {
  return { type: 'rect', x, y, width: w, height: h, fill,
    ...(opts.rx !== undefined && { rx: opts.rx }),
    ...(opts.opacity !== undefined && { opacity: opts.opacity }),
    ...(opts.stroke && { stroke: opts.stroke }),
    ...(opts.sw !== undefined && { strokeWidth: opts.sw }) };
}
function text(x, y, content, size, fill, opts = {}) {
  return { type: 'text', x, y, content, fontSize: size, fill,
    ...(opts.fw && { fontWeight: opts.fw }),
    ...(opts.font && { fontFamily: opts.font }),
    ...(opts.anchor && { textAnchor: opts.anchor }),
    ...(opts.ls !== undefined && { letterSpacing: opts.ls }),
    ...(opts.opacity !== undefined && { opacity: opts.opacity }) };
}
function circle(cx, cy, r, fill, opts = {}) {
  return { type: 'circle', cx, cy, r, fill,
    ...(opts.opacity !== undefined && { opacity: opts.opacity }),
    ...(opts.stroke && { stroke: opts.stroke }),
    ...(opts.sw !== undefined && { strokeWidth: opts.sw }) };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return { type: 'line', x1, y1, x2, y2, stroke,
    ...(opts.sw !== undefined && { strokeWidth: opts.sw }),
    ...(opts.opacity !== undefined && { opacity: opts.opacity }) };
}

// Shared components
function statusBar(elements) {
  elements.push(rect(0, 0, W, 44, INK));
  elements.push(text(16, 28, '9:41', 13, TEXT, { fw: '500' }));
  elements.push(text(374, 28, '●●●', 10, TEXT, { anchor: 'end', opacity: 0.5 }));
}

// Floating pill nav — inspired by Mobbin's glassmorphism floating pill nav
// Instead of a bottom bar, it floats above a dark backdrop blur area
function pillNav(elements, active = 0) {
  const items = ['Projects', 'Review', 'Timeline', 'Assets', 'Team'];
  const PILL_W = 340;
  const PILL_X = (W - PILL_W) / 2;
  const PILL_Y = H - 72;
  const PILL_H = 50;

  // Backdrop area
  elements.push(rect(0, H - 90, W, 90, INK, { opacity: 0.85 }));
  // Pill background (glass effect simulated)
  elements.push(rect(PILL_X, PILL_Y, PILL_W, PILL_H, CARD2, { rx: 25, stroke: BORDER, sw: 1 }));
  // Active indicator — coloured pill
  const itemW = PILL_W / items.length;
  elements.push(rect(PILL_X + 4 + active * itemW, PILL_Y + 5, itemW - 8, PILL_H - 10, CYAN, { rx: 20, opacity: 0.15 }));

  items.forEach((label, i) => {
    const x = PILL_X + itemW * i + itemW / 2;
    const isActive = i === active;
    const accentCol = [CYAN, CORAL, YELLOW, VIOLET, AQUA][i];
    elements.push(text(x, PILL_Y + PILL_H / 2 + 5, label, 11, isActive ? accentCol : MUTED,
      { anchor: 'middle', fw: isActive ? '600' : '400' }));
  });
}

function accentTag(elements, x, y, label, color) {
  const w = label.length * 6.5 + 16;
  elements.push(rect(x, y, w, 20, color, { rx: 10, opacity: 0.15 }));
  elements.push(text(x + w/2, y + 14, label, 9, color, { anchor: 'middle', fw: '600', ls: 0.5 }));
  return w;
}

// ────────────────────────────────────────────────
// SCREEN 1: Projects — motion project grid
// ────────────────────────────────────────────────
function screen1() {
  const elements = [];
  elements.push(rect(0, 0, W, H, INK));
  statusBar(elements);

  // Header
  elements.push(text(20, 72, 'SPLICE', 20, TEXT, { fw: '700', ls: 2 }));
  elements.push(text(W - 20, 72, '⊕', 20, CYAN, { anchor: 'end' }));

  // Filter row
  const filters = [
    { label: 'All', color: CYAN, active: true },
    { label: 'In Review', color: CORAL, active: false },
    { label: 'Approved', color: AQUA, active: false },
    { label: 'Archived', color: MUTED, active: false },
  ];
  let fx = 20;
  filters.forEach(f => {
    const w = f.label.length * 7 + 20;
    elements.push(rect(fx, 88, w, 26, f.active ? f.color : CARD, { rx: 13, stroke: f.active ? 'none' : BORDER, sw: 1 }));
    elements.push(text(fx + w/2, 105, f.label, 11, f.active ? INK : MUTED, { anchor: 'middle', fw: f.active ? '700' : '400' }));
    fx += w + 8;
  });

  // Projects
  const projects = [
    { name: 'Brand Refresh — Hero', client: 'Neon Studio', status: 'In Review', frames: 180, dur: '0:06', color: CYAN, pct: 65 },
    { name: 'Product Launch Loop', client: 'Orchard Labs', status: 'Approved', frames: 360, dur: '0:12', color: AQUA, pct: 100 },
    { name: 'Social Kit — Reels', client: 'Vast.space', status: 'In Review', frames: 90, dur: '0:03', color: CORAL, pct: 40 },
    { name: 'Explainer — V3', client: 'Parity Systems', status: 'Drafting', frames: 540, dur: '0:18', color: YELLOW, pct: 20 },
  ];

  projects.forEach((p, i) => {
    const y = 130 + i * 158;
    elements.push(rect(20, y, 350, 148, CARD, { rx: 12, stroke: BORDER, sw: 1 }));
    // Preview area (simulated video frame with gradient)
    elements.push(rect(20, y, 350, 86, SURF, { rx: 12 }));
    // Gradient overlay on preview
    elements.push(rect(20, y + 60, 350, 26, INK, { opacity: 0.5 }));
    // Frame count bar
    elements.push(rect(20, y + 82, 350, 4, BORDER));
    elements.push(rect(20, y + 82, Math.round(p.pct / 100 * 350), 4, p.color, { opacity: 0.8 }));
    // Preview dots (simulated waveform/keyframes)
    for (let f = 0; f < 12; f++) {
      const kh = 4 + (Math.sin(f * 0.7 + i) + 1) * 8;
      elements.push(rect(24 + f * 28, y + 52 - kh, 18, kh, p.color, { rx: 2, opacity: 0.35 + (f/12)*0.4 }));
    }
    // Duration badge
    elements.push(rect(W - 24 - 40, y + 8, 40, 20, INK, { rx: 10, opacity: 0.7 }));
    elements.push(text(W - 24 - 20, y + 22, p.dur, 11, TEXT, { anchor: 'middle', fw: '600' }));
    // Status badge
    accentTag(elements, 28, y + 8, p.status, p.color);
    // Project name
    elements.push(text(28, y + 106, p.name, 13, TEXT, { fw: '600' }));
    elements.push(text(28, y + 124, p.client, 11, MUTED));
    // Frames
    elements.push(text(W - 28, y + 106, `${p.frames}f`, 11, MUTED, { anchor: 'end' }));
    // Avatars
    [CYAN, VIOLET, CORAL].slice(0, 2 + (i % 2)).forEach((c, a) => {
      elements.push(circle(W - 28 - a * 16, y + 132, 8, c, { opacity: 0.2 }));
      elements.push(circle(W - 28 - a * 16, y + 132, 8, 'none', { stroke: INK, sw: 2 }));
    });
  });

  pillNav(elements, 0);
  return elements;
}

// ──────────────────────────────────────────────────
// SCREEN 2: Review — video playback with annotations
// ──────────────────────────────────────────────────
function screen2() {
  const elements = [];
  elements.push(rect(0, 0, W, H, INK));
  statusBar(elements);

  // Header
  elements.push(text(20, 72, '←', 18, TEXT));
  elements.push(text(W/2, 72, 'Brand Refresh — Hero', 14, TEXT, { fw: '600', anchor: 'middle' }));
  elements.push(text(W - 20, 72, '⋯', 18, MUTED, { anchor: 'end' }));

  // Status + version
  elements.push(rect(20, 84, 350, 30, CARD, { rx: 8 }));
  accentTag(elements, 28, 91, 'In Review', CORAL);
  elements.push(text(W/2, 103, 'v4 · 180 frames · 0:06', 11, MUTED, { anchor: 'middle' }));
  elements.push(text(W - 28, 103, 'Neon Studio', 11, CYAN, { anchor: 'end' }));

  // Video preview frame (16:9 ish)
  const VX = 20, VY = 124, VW = 350, VH = 197;
  elements.push(rect(VX, VY, VW, VH, CARD2, { rx: 10, stroke: BORDER, sw: 1 }));
  // Simulated motion frame content
  elements.push(rect(VX + 20, VY + 30, VW - 40, 30, CYAN, { rx: 4, opacity: 0.08 }));
  elements.push(rect(VX + 20, VY + 70, VW - 80, 20, CYAN, { rx: 4, opacity: 0.05 }));
  for (let bar = 0; bar < 8; bar++) {
    const bh = 20 + bar * 8 + (bar % 3) * 12;
    elements.push(rect(VX + 20 + bar * 40, VY + VH - 10 - bh, 28, bh, CYAN, { rx: 3, opacity: 0.12 + bar * 0.04 }));
  }
  // Gradient overlay
  elements.push(rect(VX, VY + VH - 50, VW, 50, INK, { rx: 10, opacity: 0.6 }));
  // Annotation pin (yellow dot with comment)
  elements.push(circle(VX + 200, VY + 80, 10, YELLOW, { opacity: 0.9 }));
  elements.push(text(VX + 200, VY + 85, '3', 10, INK, { anchor: 'middle', fw: '700' }));
  elements.push(circle(VX + 90, VY + 120, 10, CORAL, { opacity: 0.9 }));
  elements.push(text(VX + 90, VY + 125, '1', 10, INK, { anchor: 'middle', fw: '700' }));
  // Play button
  circle(VX + VW/2, VY + VH/2, 24, INK, { opacity: 0.7 });
  elements.push(circle(VX + VW/2, VY + VH/2, 24, 'none', { stroke: CYAN, sw: 1.5 }));
  elements.push(text(VX + VW/2 + 2, VY + VH/2 + 6, '▶', 16, CYAN, { anchor: 'middle' }));
  // Timecode
  elements.push(text(VX + 10, VY + VH - 10, '00:03:12', 11, TEXT, { fw: '500' }));
  elements.push(text(VX + VW - 10, VY + VH - 10, '00:06:00', 11, MUTED, { anchor: 'end' }));

  // Scrubber
  elements.push(rect(20, 325, 350, 6, CARD2, { rx: 3 }));
  elements.push(rect(20, 325, 190, 6, CYAN, { rx: 3, opacity: 0.7 }));
  elements.push(circle(210, 328, 8, CYAN));

  // Frame marker ticks
  for (let t = 0; t < 12; t++) {
    elements.push(rect(20 + t * 30, 333, 1, 6, BORDER, { opacity: 0.6 }));
  }

  // Action row
  const actions = ['◁◁', '◁', '▶', '▷', '▷▷'];
  actions.forEach((a, i) => {
    const x = 70 + i * 62;
    const isPlay = i === 2;
    if (isPlay) {
      elements.push(rect(x - 18, 345, 36, 36, CYAN, { rx: 18, opacity: 0.15 }));
    }
    elements.push(text(x, 367, a, isPlay ? 18 : 14, isPlay ? CYAN : MUTED, { anchor: 'middle' }));
  });

  // Comments section
  elements.push(text(20, 402, 'Annotations', 12, TEXT, { fw: '600' }));
  elements.push(text(W - 20, 402, '3 comments', 11, MUTED, { anchor: 'end' }));

  const comments = [
    { n: '1', at: '00:01:04', user: 'Mara K', text: 'Transition feels abrupt here — maybe ease-in?', color: CORAL, resolved: false },
    { n: '2', at: '00:02:18', user: 'Juno T', text: 'Love this section. Logo entrance is clean.', color: YELLOW, resolved: true },
    { n: '3', at: '00:03:12', user: 'Alex P', text: 'The grid shift feels off-brand. Can we snap to 8pt?', color: YELLOW, resolved: false },
  ];

  comments.forEach((c, i) => {
    const y = 418 + i * 98;
    elements.push(rect(20, y, 350, 88, CARD, { rx: 10, stroke: c.resolved ? BORDER : c.color, sw: c.resolved ? 1 : 1, opacity: 1 }));
    if (c.resolved) elements.push(rect(W - 28, y + 12, 60, 18, AQUA, { rx: 9, opacity: 0.15 }));
    if (c.resolved) elements.push(text(W - 28, y + 25, '✓ Done', 9, AQUA, { anchor: 'end' }));
    // Pin
    elements.push(circle(36, y + 22, 10, c.color, { opacity: 0.2 }));
    elements.push(text(36, y + 27, c.n, 11, c.color, { anchor: 'middle', fw: '700' }));
    // Timecode
    elements.push(text(52, y + 18, `at ${c.at}`, 10, MUTED));
    elements.push(text(52, y + 34, c.user, 11, TEXT, { fw: '500' }));
    elements.push(text(28, y + 54, c.text, 12, MUTED));
    elements.push(text(28, y + 72, 'Reply', 11, CYAN));
  });

  pillNav(elements, 1);
  return elements;
}

// ──────────────────────────────────────────────────────────
// SCREEN 3: Timeline — frame-by-frame motion layer editor
// ──────────────────────────────────────────────────────────
function screen3() {
  const elements = [];
  elements.push(rect(0, 0, W, H, INK));
  statusBar(elements);

  elements.push(text(20, 72, '←', 18, TEXT));
  elements.push(text(W/2, 72, 'Timeline', 15, TEXT, { fw: '600', anchor: 'middle' }));
  elements.push(text(W - 20, 72, 'Export', 13, CYAN, { anchor: 'end', fw: '600' }));

  // Version + frame counter
  elements.push(rect(20, 84, 350, 28, CARD, { rx: 7 }));
  elements.push(text(30, 103, 'v4 · Brand Refresh Hero', 12, TEXT));
  elements.push(text(W - 30, 103, '72 / 180f', 11, YELLOW, { anchor: 'end', fw: '600' }));

  // Mini preview
  elements.push(rect(20, 120, 350, 120, CARD2, { rx: 8, stroke: BORDER, sw: 1 }));
  elements.push(text(W/2, 185, '▶  Frame 72', 14, CYAN, { anchor: 'middle', fw: '600' }));
  // Simulated frame content
  for (let b = 0; b < 6; b++) {
    const bw = 30 + b * 8;
    elements.push(rect(30 + b * 52, 138, bw, 40, [CYAN,VIOLET,YELLOW,CORAL,AQUA,CYAN][b], { rx: 4, opacity: 0.12 + b * 0.03 }));
  }

  // Scrubber on mini preview
  elements.push(rect(20, 237, 350, 4, CARD2, { rx: 2 }));
  elements.push(rect(20, 237, 140, 4, CYAN, { rx: 2, opacity: 0.7 }));
  elements.push(circle(160, 239, 7, CYAN));

  // Layer panel
  elements.push(text(20, 260, 'Layers', 12, TEXT, { fw: '600', ls: 0.5 }));
  elements.push(text(W - 20, 260, '+ Layer', 11, CYAN, { anchor: 'end' }));

  const layers = [
    { name: 'Logo Mark', type: 'shape', color: CYAN, startF: 0, endF: 180, locked: false, vis: true },
    { name: 'Headline Text', type: 'text', color: YELLOW, startF: 20, endF: 160, locked: false, vis: true },
    { name: 'Background Grid', type: 'shape', color: VIOLET, startF: 0, endF: 180, locked: true, vis: true },
    { name: 'Noise Overlay', type: 'fx', color: CORAL, startF: 0, endF: 180, locked: false, vis: false },
    { name: 'Camera Pan', type: 'camera', color: AQUA, startF: 40, endF: 140, locked: false, vis: true },
  ];

  // Timeline header ticks
  elements.push(rect(108, 272, W - 128, 16, CARD, { rx: 4 }));
  for (let t = 0; t <= 10; t++) {
    const tx = 108 + Math.round((t / 10) * (W - 128));
    elements.push(line(tx, 272, tx, 288, BORDER, { sw: 1 }));
    elements.push(text(tx, 287, `${t * 18}`, 8, MUTED, { anchor: 'middle' }));
  }
  // Playhead
  elements.push(line(108 + 140, 272, 108 + 140, 550, YELLOW, { sw: 1.5, opacity: 0.7 }));
  elements.push(rect(108 + 134, 269, 12, 8, YELLOW, { rx: 3 }));

  layers.forEach((l, i) => {
    const ly = 290 + i * 50;
    // Layer row BG
    elements.push(rect(20, ly, W - 40, 42, CARD, { rx: 7, stroke: BORDER, sw: 1 }));
    // Layer color dot
    elements.push(rect(28, ly + 12, 4, 18, l.color, { rx: 2 }));
    // Layer name
    elements.push(text(38, ly + 16, l.name, 12, l.vis ? TEXT : MUTED, { fw: '500' }));
    elements.push(text(38, ly + 32, l.type, 9, MUTED));
    // Lock / vis icons
    if (l.locked) elements.push(text(100, ly + 21, '🔒', 9));
    if (!l.vis) elements.push(text(l.locked ? 112 : 100, ly + 21, '◌', 10, MUTED));
    // Timeline bar
    const TW = W - 40 - 108;
    const bx = 108 + Math.round((l.startF / 180) * TW);
    const bw = Math.round(((l.endF - l.startF) / 180) * TW);
    elements.push(rect(bx, ly + 8, bw, 26, l.color, { rx: 4, opacity: l.vis ? 0.2 : 0.08 }));
    elements.push(rect(bx, ly + 8, 4, 26, l.color, { rx: 2, opacity: 0.7 }));
    elements.push(rect(bx + bw - 4, ly + 8, 4, 26, l.color, { rx: 2, opacity: 0.7 }));
    // Keyframe diamonds (2 per layer)
    [bx + 30, bx + bw - 30].forEach(kx => {
      elements.push(rect(kx - 5, ly + 16, 10, 10, l.color, { opacity: 0.8 }));
    });
  });

  // Transport controls
  elements.push(rect(20, H - 100, W - 40, 36, CARD, { rx: 10, stroke: BORDER, sw: 1 }));
  ['⏮', '◁', '▶', '▷', '⏭'].forEach((icon, i) => {
    elements.push(text(44 + i * 68, H - 77, icon, 16, i === 2 ? CYAN : MUTED, { anchor: 'middle' }));
  });
  elements.push(text(W - 28, H - 77, 'FPS 24', 11, YELLOW, { anchor: 'end' }));

  pillNav(elements, 2);
  return elements;
}

// ─────────────────────────────────────────────────────
// SCREEN 4: Feedback — threaded review with frame refs
// ─────────────────────────────────────────────────────
function screen4() {
  const elements = [];
  elements.push(rect(0, 0, W, H, INK));
  statusBar(elements);

  elements.push(text(20, 72, '←', 18, TEXT));
  elements.push(text(W/2, 72, 'Feedback', 15, TEXT, { fw: '600', anchor: 'middle' }));
  // Status counts
  elements.push(rect(W - 90, 60, 36, 22, CORAL, { rx: 11, opacity: 0.15 }));
  elements.push(text(W - 72, 75, '5 open', 10, CORAL, { anchor: 'middle', fw: '600' }));
  elements.push(rect(W - 50, 60, 36, 22, AQUA, { rx: 11, opacity: 0.15 }));
  elements.push(text(W - 32, 75, '3 done', 10, AQUA, { anchor: 'middle', fw: '600' }));

  // Filter tabs
  const tabs = ['All (8)', 'Open (5)', 'Mine (2)', 'Resolved (3)'];
  let tx = 20;
  tabs.forEach((tab, i) => {
    const active = i === 0;
    const w = tab.length * 7.5 + 16;
    elements.push(rect(tx, 84, w, 26, active ? CYAN : 'none', { rx: 13, stroke: active ? 'none' : BORDER, sw: 1, opacity: active ? 0.15 : 1 }));
    elements.push(text(tx + w/2, 101, tab, 11, active ? CYAN : MUTED, { anchor: 'middle' }));
    tx += w + 8;
  });

  // Feedback threads
  const threads = [
    {
      pin: '1', at: '00:01:04', frame: 32, user: 'Mara Kowalski', role: 'Art Director',
      msg: 'The transition from frame 30–35 feels too linear. Can we add a bit of spring? The brand guide calls for "energetic but not jarring."',
      replies: 2, open: true, color: CORAL,
    },
    {
      pin: '3', at: '00:03:12', frame: 72, user: 'Alex Petrov', role: 'Creative Lead',
      msg: 'Grid alignment is off by 4px here. Logo is snapped to a 7pt grid but everything else is 8pt. Needs fixing before client delivery.',
      replies: 1, open: true, color: YELLOW,
    },
    {
      pin: '2', at: '00:02:18', frame: 54, user: 'Juno Tran', role: 'Motion Designer',
      msg: 'Logo entrance is perfect. The ease matches the opening of the previous hero perfectly. Marking this resolved.',
      replies: 0, open: false, color: CYAN,
    },
    {
      pin: '4', at: '00:04:30', frame: 108, user: 'Sam Liu', role: 'Client Contact',
      msg: 'Can the background use the darker charcoal from brand doc p.12? Current version is slightly too green.',
      replies: 3, open: true, color: VIOLET,
    },
  ];

  threads.forEach((t, i) => {
    const y = 122 + i * 168;
    const h = 158;
    elements.push(rect(20, y, 350, h, CARD, { rx: 12, stroke: t.open ? BORDER : AQUA, sw: t.open ? 1 : 1 }));
    if (!t.open) elements.push(rect(20, y, 350, h, AQUA, { rx: 12, opacity: 0.03 }));

    // Pin + frame ref
    elements.push(circle(36, y + 22, 10, t.color, { opacity: 0.2 }));
    elements.push(text(36, y + 27, t.pin, 11, t.color, { anchor: 'middle', fw: '700' }));
    elements.push(text(54, y + 18, `Frame ${t.frame}`, 12, TEXT, { fw: '600' }));
    elements.push(text(54, y + 34, t.at, 10, MUTED));
    // Status badge
    if (t.open) {
      accentTag(elements, W - 74, y + 12, 'Open', t.color);
    } else {
      accentTag(elements, W - 82, y + 12, 'Resolved', AQUA);
    }

    // User
    elements.push(circle(36, y + 66, 14, t.color, { opacity: 0.1 }));
    elements.push(text(36, y + 71, t.user[0], 12, t.color, { anchor: 'middle', fw: '700' }));
    elements.push(text(56, y + 62, t.user, 12, TEXT, { fw: '600' }));
    elements.push(text(56, y + 76, t.role, 10, MUTED));

    // Comment text
    const lineA = t.msg.slice(0, 52);
    const lineB = t.msg.slice(52, 104);
    const lineC = t.msg.slice(104, 156);
    elements.push(text(28, y + 96, lineA, 11, TEXT, { opacity: 0.8 }));
    if (lineB) elements.push(text(28, y + 112, lineB, 11, TEXT, { opacity: 0.8 }));
    if (lineC) elements.push(text(28, y + 128, lineC.slice(0, 50) + '...', 11, TEXT, { opacity: 0.8 }));

    // Action row
    elements.push(line(28, y + 142, W - 28, y + 142, BORDER, { sw: 1 }));
    elements.push(text(28, y + 156, `↩ Reply (${t.replies})`, 11, CYAN));
    elements.push(text(W - 28, y + 156, t.open ? '✓ Resolve' : '↩ Reopen', 11, t.open ? AQUA : MUTED, { anchor: 'end' }));
  });

  pillNav(elements, 1);
  return elements;
}

// ─────────────────────────────────────────────────
// SCREEN 5: Assets — design asset library
// ─────────────────────────────────────────────────
function screen5() {
  const elements = [];
  elements.push(rect(0, 0, W, H, INK));
  statusBar(elements);

  elements.push(text(W/2, 72, 'Assets', 16, TEXT, { fw: '600', anchor: 'middle' }));
  elements.push(text(W - 20, 72, '↑ Upload', 13, CYAN, { anchor: 'end', fw: '600' }));

  // Search
  elements.push(rect(20, 84, 350, 40, CARD, { rx: 8, stroke: BORDER, sw: 1 }));
  elements.push(text(44, 109, 'Search assets...', 13, MUTED, { opacity: 0.7 }));
  elements.push(circle(34, 104, 7, 'none', { stroke: MUTED, sw: 1.5 }));

  // Type tabs
  const types = ['All', 'Fonts', 'Colors', 'Motions', 'Sounds'];
  const typeColors = [CYAN, YELLOW, CORAL, VIOLET, AQUA];
  let ftx = 20;
  types.forEach((t, i) => {
    const active = i === 0;
    const w = t.length * 7 + 18;
    elements.push(rect(ftx, 136, w, 24, active ? typeColors[i] : CARD, { rx: 12, stroke: active ? 'none' : BORDER, sw: 1, opacity: active ? 0.2 : 1 }));
    elements.push(text(ftx + w/2, 152, t, 11, active ? typeColors[i] : MUTED, { anchor: 'middle' }));
    ftx += w + 8;
  });

  // Colors section
  elements.push(text(20, 175, 'Brand Colors', 11, MUTED, { ls: 1 }));
  const brandColors = [
    { hex: '#00B2FF', name: 'Cyan Primary' },
    { hex: '#F0FF50', name: 'Acid Yellow' },
    { hex: '#7A40ED', name: 'Violet' },
    { hex: '#FD3456', name: 'Coral' },
    { hex: '#5FF3E0', name: 'Aqua' },
    { hex: '#0B0C0F', name: 'Ink Black' },
  ];
  brandColors.forEach((c, i) => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const x = 20 + col * 118;
    const y = 190 + row * 72;
    elements.push(rect(x, y, 108, 52, CARD, { rx: 8, stroke: BORDER, sw: 1 }));
    elements.push(rect(x + 8, y + 8, 32, 32, c.hex, { rx: 6 }));
    elements.push(text(x + 48, y + 20, c.hex, 10, TEXT, { fw: '600' }));
    elements.push(text(x + 48, y + 34, c.name, 9, MUTED));
  });

  // Fonts section
  elements.push(text(20, 343, 'Typography', 11, MUTED, { ls: 1 }));
  const fonts = [
    { name: 'TWK Lausanne', weight: '800', sample: 'Aa', use: 'Display headings', color: CYAN },
    { name: 'Inter Variable', weight: '400–700', sample: 'Aa', use: 'Body + UI', color: VIOLET },
    { name: 'JetBrains Mono', weight: '400', sample: '<>', use: 'Code / timecodes', color: YELLOW },
  ];
  fonts.forEach((f, i) => {
    const y = 360 + i * 62;
    elements.push(rect(20, y, 350, 52, CARD, { rx: 8, stroke: BORDER, sw: 1 }));
    elements.push(rect(20, y, 4, 52, f.color, { rx: 2 }));
    elements.push(text(36, y + 22, f.sample, 22, f.color, { fw: '700' }));
    elements.push(line(72, y + 10, 72, y + 42, BORDER, { sw: 1 }));
    elements.push(text(82, y + 22, f.name, 13, TEXT, { fw: '600' }));
    elements.push(text(82, y + 38, `${f.weight} · ${f.use}`, 10, MUTED));
    elements.push(text(W - 28, y + 22, 'Copy', 11, CYAN, { anchor: 'end' }));
  });

  // Motion presets section
  elements.push(text(20, 554, 'Motion Presets', 11, MUTED, { ls: 1 }));
  const motions = [
    { name: 'Spring Bounce', dur: '0.4s', ease: 'spring(1,80,10,0)', color: CORAL },
    { name: 'Ease In Expo', dur: '0.6s', ease: 'cubic-bezier(.9,0,1,1)', color: VIOLET },
    { name: 'Smooth Out', dur: '0.3s', ease: 'cubic-bezier(0,0,.2,1)', color: AQUA },
  ];
  motions.forEach((m, i) => {
    const x = 20 + i * 118;
    elements.push(rect(x, 572, 108, 72, CARD, { rx: 8, stroke: BORDER, sw: 1 }));
    // Mini curve visualisation
    elements.push(line(x + 14, 614, x + 14 + 80, 580, m.color, { sw: 1.5, opacity: 0.4 }));
    elements.push(text(x + 54, 640, m.name, 9, TEXT, { anchor: 'middle', fw: '600' }));
    elements.push(text(x + 54, 654, m.dur, 9, MUTED, { anchor: 'middle' }));
  });

  pillNav(elements, 3);
  return elements;
}

// ──────────────────────────────────────────────────
// SCREEN 6: Team — activity feed + collaborators
// ──────────────────────────────────────────────────
function screen6() {
  const elements = [];
  elements.push(rect(0, 0, W, H, INK));
  statusBar(elements);

  elements.push(text(W/2, 72, 'Team', 16, TEXT, { fw: '600', anchor: 'middle' }));
  elements.push(text(W - 20, 72, '+ Invite', 13, CYAN, { anchor: 'end', fw: '600' }));

  // Team capacity bar
  elements.push(rect(20, 84, 350, 54, CARD, { rx: 10, stroke: BORDER, sw: 1 }));
  elements.push(text(32, 104, 'Workspace · Neon Studio', 13, TEXT, { fw: '600' }));
  elements.push(text(32, 122, '5 members · 12 projects active', 11, MUTED));
  elements.push(text(W - 32, 104, '4.2 GB', 12, YELLOW, { anchor: 'end', fw: '600' }));
  elements.push(text(W - 32, 122, 'of 10 GB', 10, MUTED, { anchor: 'end' }));
  // Storage bar
  elements.push(rect(20, 136, 350, 4, BORDER));
  elements.push(rect(20, 136, 148, 4, YELLOW, { opacity: 0.7 }));

  // Members
  elements.push(text(20, 158, 'Members', 11, MUTED, { ls: 1 }));
  const members = [
    { name: 'Alex Petrov', role: 'Creative Lead', status: 'online', color: CORAL, initial: 'A', projects: 4 },
    { name: 'Mara Kowalski', role: 'Art Director', status: 'online', color: YELLOW, initial: 'M', projects: 3 },
    { name: 'Juno Tran', role: 'Motion Designer', status: 'idle', color: CYAN, initial: 'J', projects: 5 },
    { name: 'Sam Liu', role: 'Client Contact', status: 'offline', color: VIOLET, initial: 'S', projects: 2 },
    { name: 'Priya N', role: 'Designer', status: 'online', color: AQUA, initial: 'P', projects: 3 },
  ];
  members.forEach((m, i) => {
    const y = 174 + i * 58;
    elements.push(rect(20, y, 350, 48, CARD, { rx: 8, stroke: BORDER, sw: 1 }));
    // Avatar
    elements.push(circle(44, y + 24, 16, m.color, { opacity: 0.15 }));
    elements.push(text(44, y + 29, m.initial, 14, m.color, { anchor: 'middle', fw: '700' }));
    // Online dot
    const dotColor = m.status === 'online' ? AQUA : m.status === 'idle' ? YELLOW : BORDER;
    elements.push(circle(56, y + 12, 5, dotColor));
    elements.push(text(66, y + 21, m.name, 13, TEXT, { fw: '600' }));
    elements.push(text(66, y + 37, m.role, 11, MUTED));
    elements.push(text(W - 28, y + 21, `${m.projects} projects`, 11, MUTED, { anchor: 'end' }));
    elements.push(text(W - 28, y + 37, m.status, 10, dotColor, { anchor: 'end' }));
  });

  // Activity feed
  elements.push(text(20, 472, 'Recent Activity', 11, MUTED, { ls: 1 }));
  const activity = [
    { user: 'Mara K', action: 'left a comment on', target: 'Brand Refresh Hero', time: '2m ago', color: YELLOW },
    { user: 'Juno T', action: 'resolved annotation in', target: 'Product Launch Loop', time: '18m ago', color: CYAN },
    { user: 'Alex P', action: 'uploaded a new version of', target: 'Social Kit Reels', time: '1h ago', color: CORAL },
    { user: 'Priya N', action: 'added assets to', target: 'Motion Presets', time: '2h ago', color: AQUA },
    { user: 'Sam L', action: 'approved', target: 'Explainer v2', time: 'Yesterday', color: VIOLET },
  ];
  activity.forEach((a, i) => {
    const y = 488 + i * 52;
    elements.push(rect(20, y, 350, 44, CARD, { rx: 8, stroke: BORDER, sw: 1 }));
    elements.push(circle(36, y + 22, 10, a.color, { opacity: 0.2 }));
    elements.push(text(36, y + 27, a.user[0], 10, a.color, { anchor: 'middle', fw: '700' }));
    elements.push(text(52, y + 18, a.user, 12, TEXT, { fw: '600' }));
    elements.push(text(52, y + 33, a.action + ' ' + a.target, 11, MUTED));
    elements.push(text(W - 28, y + 22, a.time, 10, MUTED, { anchor: 'end' }));
  });

  pillNav(elements, 4);
  return elements;
}

// ─── Assemble pen ───
const screens = [
  { name: 'Projects', elements: screen1() },
  { name: 'Review', elements: screen2() },
  { name: 'Timeline', elements: screen3() },
  { name: 'Feedback', elements: screen4() },
  { name: 'Assets', elements: screen5() },
  { name: 'Team', elements: screen6() },
];

const total = screens.reduce((n, s) => n + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'SPLICE — Motion Design Review',
    author: 'RAM',
    date: new Date().toISOString(),
    theme: 'dark',
    heartbeat: HEARTBEAT,
    elements: total,
    palette: { INK, SURF, CARD, TEXT, CYAN, YELLOW, VIOLET, CORAL, AQUA },
    inspiration: [
      'Jitter (Mobbin Site of the Year) — multi-color accent system: cyan + acid yellow + violet + coral on dark',
      'Mobbin floating pill nav — glassmorphism pill floating above content instead of anchored tab bar',
      'Headspace (Mobbin iOS App of the Year) — punchy multi-hue palette that cuts through category norms',
    ],
  },
  screens: screens.map((s, i) => ({
    id: `screen-${i+1}`,
    name: s.name,
    width: W,
    height: H,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"/>`,
    elements: s.elements,
  })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`SPLICE: ${screens.length} screens, ${total} elements`);
console.log(`Written: ${SLUG}.pen`);
