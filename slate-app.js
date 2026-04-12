'use strict';
/**
 * SLATE — Every surface, perfectly specified.
 *
 * Inspired by:
 * 1. Darkroom (darkmodedesign.com, Mar 2026) — monochromatic dark UI with a
 *    floating material/finish selector (CAN/PAPER/SATIN/GLOSS). That panel
 *    interaction — choosing a surface type and seeing the preview update in
 *    real-time — is the core pattern borrowed for Slate's Finish Explorer.
 * 2. GQ & AP The Extraordinary Lab (awwwards.com SOTD Mar 26, 2026) — immersive
 *    Immersive Garden build. Viewport-filling bold display typography as hero
 *    element. Drove Slate's oversized type on the Material Detail screen.
 * 3. Veo Sports Cameras (land-book.com, Mar 2026) — numbered feature sections
 *    with large display numerals (01, 02, 03). Used in Slate's Spec Sheet.
 *
 * Theme: DARK — near-black #0A0A0A, warm-dark surface #141414,
 *               warm white text #F2EDE8, brass accent #C9B99A
 */

const fs   = require('fs');
const path = require('path');

// ── Palette ────────────────────────────────────────────────────────────────────
const T = {
  bg:          '#0A0A0A',
  surface:     '#141414',
  surface2:    '#1C1C1C',
  surface3:    '#252525',
  border:      'rgba(242,237,232,0.07)',
  border2:     'rgba(242,237,232,0.12)',
  text:        '#F2EDE8',
  text2:       'rgba(242,237,232,0.50)',
  text3:       'rgba(242,237,232,0.28)',
  brass:       '#C9B99A',
  brassPale:   'rgba(201,185,154,0.12)',
  brassDim:    '#8C7F70',
  red:         '#E05252',
  redPale:     'rgba(224,82,82,0.12)',
  green:       '#5CB87A',
  greenPale:   'rgba(92,184,122,0.12)',
};

const W = 375, H = 812, GAP = 80;
let _id = 0;
const uid = () => `sl${++_id}`;

// ── Primitives ─────────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return { r: 0.08, g: 0.08, b: 0.08 };
  if (hex.startsWith('rgba(')) {
    const parts = hex.match(/[\d.]+/g);
    if (parts && parts.length >= 4) {
      return { r: +parts[0]/255, g: +parts[1]/255, b: +parts[2]/255, a: +parts[3] };
    }
    if (parts && parts.length === 3) return { r: +parts[0]/255, g: +parts[1]/255, b: +parts[2]/255 };
  }
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const n = parseInt(hex, 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

function solidFill(color, opacity) {
  const rgb = hexToRgb(color);
  const op = opacity ?? rgb.a ?? 1;
  return [{ type: 'SOLID', color: { r: rgb.r, g: rgb.g, b: rgb.b }, opacity: op }];
}

function rect(x, y, w, h, fill, opts = {}) {
  return {
    id: uid(), type: 'RECTANGLE', x, y, width: w, height: h,
    fills: solidFill(fill, opts.opacity),
    cornerRadius: opts.r ?? 0,
    strokeWeight: opts.strokeWeight ?? 0,
    strokes: opts.stroke ? [{ type: 'SOLID', color: hexToRgb(opts.stroke), opacity: opts.strokeOpacity ?? 1 }] : [],
    effects: opts.shadow ? [{
      type: 'DROP_SHADOW',
      color: { r: 0, g: 0, b: 0, a: opts.shadowAlpha ?? 0.45 },
      offset: { x: 0, y: opts.shadowY ?? 4 },
      radius: opts.shadowR ?? 20, spread: 0, visible: true, blendMode: 'NORMAL',
    }] : [],
  };
}

function text(x, y, w, content, size, color, opts = {}) {
  const rgb = hexToRgb(color);
  const op = opts.opacity ?? rgb.a ?? 1;
  return {
    id: uid(), type: 'TEXT', x, y, width: w, height: opts.h ?? size * 1.4,
    characters: String(content),
    style: {
      fontFamily: opts.font ?? 'Inter',
      fontWeight: opts.weight ?? 400,
      fontSize: size,
      letterSpacing: opts.ls ?? 0,
      lineHeight: opts.lh ?? (size * 1.4),
      textAlignHorizontal: opts.align ?? 'LEFT',
      textAlignVertical: 'CENTER',
    },
    fills: [{ type: 'SOLID', color: { r: rgb.r, g: rgb.g, b: rgb.b }, opacity: op }],
  };
}

function circle(x, y, r, fill, opts = {}) {
  const rgb = hexToRgb(fill);
  return {
    id: uid(), type: 'ELLIPSE', x: x - r, y: y - r, width: r * 2, height: r * 2,
    fills: [{ type: 'SOLID', color: { r: rgb.r, g: rgb.g, b: rgb.b }, opacity: opts.opacity ?? rgb.a ?? 1 }],
    strokeWeight: opts.strokeWeight ?? 0,
    strokes: opts.stroke ? [{ type: 'SOLID', color: hexToRgb(opts.stroke), opacity: opts.strokeOpacity ?? 1 }] : [],
    effects: [],
  };
}

function line(x1, y1, x2, y2, color, opts = {}) {
  return {
    id: uid(), type: 'LINE', x: x1, y: y1, width: x2 - x1, height: 0,
    fills: [],
    strokes: [{ type: 'SOLID', color: hexToRgb(color), opacity: opts.opacity ?? 0.12 }],
    strokeWeight: opts.w ?? 1,
  };
}

function frame(name, yOff, nodes) {
  return {
    id: uid(), type: 'FRAME', name,
    x: 0, y: yOff, width: W, height: H,
    fills: solidFill(T.bg),
    children: nodes.flat(),
  };
}

function card(x, y, w, h, opts = {}) {
  return rect(x, y, w, h, opts.fill ?? T.surface, {
    r: opts.r ?? 16,
    stroke: opts.stroke ?? T.border2,
    strokeWeight: 1,
    shadow: opts.shadow ?? true,
    shadowY: opts.shadowY ?? 8, shadowR: opts.shadowR ?? 24, shadowAlpha: opts.shadowAlpha ?? 0.5,
    opacity: opts.opacity,
  });
}

function statusBar(y) {
  return [
    rect(0, y, W, 44, T.bg),
    text(16, y + 14, 60, '9:41', 15, T.text, { weight: 600 }),
    text(W - 80, y + 14, 70, '●●● ◀ ▮▮▮', 10, T.text, { opacity: 0.3, align: 'RIGHT' }),
  ];
}

function navBar(activeIdx, y) {
  const labels = ['Library', 'Explore', 'Add', 'Projects', 'Profile'];
  const icons  = ['⊞', '◎', '＋', '⊡', '○'];
  const nodes  = [
    rect(0, y, W, 80, T.surface, { stroke: T.border2, strokeWeight: 1 }),
  ];
  labels.forEach((label, i) => {
    const cx = (W / 5) * i + W / 10;
    const isActive = i === activeIdx;
    const col = isActive ? T.brass : T.text3;
    if (isActive) {
      nodes.push(rect(cx - 20, y + 2, 40, 2, T.brass, { r: 1 }));
    }
    nodes.push(text(cx - 16, y + 10, 32, icons[i], isActive ? 20 : 18, col, { align: 'CENTER', weight: isActive ? 700 : 400 }));
    nodes.push(text(cx - 28, y + 36, 56, label, 9, col, { align: 'CENTER', weight: isActive ? 600 : 400 }));
  });
  return nodes;
}

function chip(x, y, label, textColor, bgColor, opts = {}) {
  const w = opts.w || (label.length * 7.5 + 20);
  const h = opts.h || 24;
  return [
    rect(x, y, w, h, bgColor, { r: opts.r ?? h / 2, stroke: opts.stroke, strokeWeight: opts.strokeWeight ?? 1 }),
    text(x + 4, y + (h - 12) / 2, w - 8, label, 11, textColor, { weight: opts.weight ?? 600, align: 'CENTER', lh: 12 }),
  ];
}

function divider(y) {
  return line(20, y, W - 20, y, T.border2, { opacity: 0.6 });
}

// ── Material swatch block ──────────────────────────────────────────────────────
function swatchRow(x, y, swatches) {
  // swatches: [{color, label, active}]
  const nodes = [];
  swatches.forEach((s, i) => {
    const sx = x + i * 62;
    const isActive = s.active;
    nodes.push(rect(sx, y, 52, 52, s.color, {
      r: 12,
      stroke: isActive ? T.brass : T.border2,
      strokeWeight: isActive ? 2 : 1,
      shadow: isActive, shadowY: 4, shadowR: 14, shadowAlpha: 0.5,
    }));
    if (isActive) {
      nodes.push(circle(sx + 52, y, 6, T.brass));
      nodes.push(circle(sx + 52, y, 3, T.bg));
    }
    nodes.push(text(sx, y + 58, 52, s.label, 9, isActive ? T.brass : T.text3, { align: 'CENTER', weight: isActive ? 600 : 400, lh: 12 }));
  });
  return nodes;
}

// ── Finish button row (Darkroom-inspired) ──────────────────────────────────────
function finishPanel(x, y, finishes, activeIdx) {
  // Floating panel with finish options — key borrowed interaction from Darkroom
  const panelW = W - x * 2;
  const panelH = 64;
  const nodes  = [
    card(x, y, panelW, panelH, { r: 20, fill: T.surface2, shadow: true, shadowR: 32, shadowAlpha: 0.7 }),
  ];
  finishes.forEach((f, i) => {
    const fw  = panelW / finishes.length;
    const fx  = x + fw * i;
    const isA = i === activeIdx;
    if (isA) nodes.push(rect(fx + 6, y + 8, fw - 12, panelH - 16, T.surface3, { r: 12 }));
    nodes.push(text(fx, y + 16, fw, f, 12, isA ? T.brass : T.text3, { align: 'CENTER', weight: isA ? 700 : 400, lh: 16 }));
  });
  return nodes;
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Library (Material Boards)
// ══════════════════════════════════════════════════════════════════════════════
function screenLibrary(yOff) {
  const y = yOff;
  const nodes = [
    ...statusBar(y),
    // Header
    text(20, y + 54, 200, 'Material Library', 22, T.text, { weight: 700, lh: 28 }),
    text(20, y + 84, 200, '48 materials  ·  6 boards', 13, T.text2),
    // Search bar
    rect(20, y + 112, W - 40, 40, T.surface2, { r: 12, stroke: T.border2, strokeWeight: 1 }),
    text(48, y + 120, 200, 'Search materials…', 13, T.text3),
    circle(36, y + 132, 8, T.text3, { opacity: 0.4 }),
    // Filter chips
    ...chip(20,  y + 166, 'All',      T.bg,      T.brass,  { w: 40, r: 10 }),
    ...chip(68,  y + 166, 'Metal',    T.text3,   T.surface3, { w: 52 }),
    ...chip(128, y + 166, 'Fabric',   T.text3,   T.surface3, { w: 56 }),
    ...chip(192, y + 166, 'Plastic',  T.text3,   T.surface3, { w: 60 }),
    ...chip(260, y + 166, 'Ceramic',  T.text3,   T.surface3, { w: 62 }),
    // ── Board: Metals & Finishes ──
    text(20, y + 206, 200, 'Metals & Finishes', 13, T.text, { weight: 600 }),
    text(20, y + 222, 200, '12 materials', 11, T.text3),
    // 3-up swatch grid
    ...materialCard(20,  y + 244, '#2C2C2C', 'Matte Black\nAnodized', 'Al 6061', true),
    ...materialCard(138, y + 244, '#8C8C8C', 'Brushed\nAluminum', 'Al 5052', false),
    ...materialCard(255, y + 244, '#C4A862', 'Polished\nBrass', 'Cu/Zn', false),
    // ── Board: Textiles ──
    text(20, y + 402, 200, 'Textiles', 13, T.text, { weight: 600 }),
    text(20, y + 418, 200, '8 materials', 11, T.text3),
    ...materialCard(20,  y + 440, '#1A3A2A', 'Forest\nWool', 'Merino 18µ', false),
    ...materialCard(138, y + 440, '#3B2C1A', 'Cognac\nLeather', 'Full-grain', false),
    ...materialCard(255, y + 440, '#E8E0D5', 'Alabaster\nLinen', '100% Linen', false),
    // Spacer + nav
    divider(y + 600),
    text(20, y + 614, 335, 'Recently viewed', 13, T.text, { weight: 600 }),
    ...navBar(0, y + H - 80),
  ];
  return frame('Library', yOff, nodes);
}

function materialCard(x, y, color, name, spec, active) {
  const w = 100, h = 130;
  return [
    card(x, y, w, h, { r: 14, fill: T.surface, strokeWeight: active ? 0 : 1 }),
    rect(x + 10, y + 10, w - 20, 70, color, { r: 10 }),
    // subtle texture lines
    ...Array.from({ length: 4 }, (_, i) =>
      line(x + 10, y + 22 + i * 16, x + w - 10, y + 22 + i * 16, '#FFFFFF', { opacity: 0.04, w: 1 })
    ),
    text(x + 10, y + 88, w - 20, name.replace('\n', ' '), 10, T.text, { weight: 600, lh: 14, h: 24 }),
    text(x + 10, y + 112, w - 20, spec, 9, T.text3, { lh: 12 }),
    ...(active ? [rect(x, y, w, h, T.brass, { r: 14, opacity: 0, stroke: T.brass, strokeWeight: 2 })] : []),
  ];
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Material Detail (Matte Black Anodized)
// Inspired by: awwwards SOTD "GQ & AP Extraordinary Lab" — viewport-filling
// bold display type as hero; and Darkroom's dark monochromatic product preview
// ══════════════════════════════════════════════════════════════════════════════
function screenDetail(yOff) {
  const y = yOff;
  const nodes = [
    ...statusBar(y),
    // Back
    text(20, y + 52, 100, '← Library', 13, T.text2, { weight: 500 }),
    // MASSIVE display type hero — inspired by GQ & AP Extraordinary Lab
    text(20, y + 82, W - 40, 'MATTE', 64, T.text, { weight: 800, ls: -2, lh: 68 }),
    text(20, y + 148, W - 40, 'BLACK', 64, T.brass, { weight: 800, ls: -2, lh: 68 }),
    text(20, y + 214, W - 40, 'ANODIZED', 36, T.text2, { weight: 700, ls: -1, lh: 44 }),
    // Material preview box (dark rect with texture simulation)
    rect(20, y + 268, W - 40, 180, '#1A1A1A', { r: 20, stroke: T.border2, strokeWeight: 1 }),
    ...Array.from({ length: 12 }, (_, i) =>
      line(20, y + 280 + i * 14, W - 20, y + 280 + i * 14, '#FFFFFF', { opacity: 0.025, w: 1 })
    ),
    // surface sheen highlights
    rect(40, y + 280, 120, 60, '#FFFFFF', { r: 8, opacity: 0.03 }),
    text(W / 2 - 60, y + 342, 120, 'Al 6061-T6', 12, T.brass, { align: 'CENTER', weight: 600 }),
    // Spec row
    ...specPill(20,  y + 462, 'FINISH', 'Type II Anodize'),
    ...specPill(20,  y + 510, 'THICKNESS', '12–25 µm'),
    ...specPill(20,  y + 558, 'HARDNESS', '350–500 HV'),
    ...specPill(20,  y + 606, 'SUPPLIER', 'Anodize Labs Inc.'),
    ...chip(20, y + 650, 'Add to Board', T.bg, T.brass, { w: 130, h: 36, r: 10 }),
    ...chip(162, y + 650, 'Export Spec', T.brass, T.surface2, { w: 120, h: 36, r: 10 }),
    ...navBar(0, y + H - 80),
  ];
  return frame('Material Detail', yOff, nodes);
}

function specPill(x, y, label, value) {
  return [
    rect(x, y, W - 40, 38, T.surface2, { r: 10 }),
    text(x + 14, y + 10, 140, label, 10, T.text3, { weight: 700, ls: 0.5, lh: 16 }),
    text(x + 14 + 140, y + 10, W - 40 - 160, value, 13, T.text, { weight: 500, align: 'RIGHT', lh: 16 }),
  ];
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Finish Explorer (core Darkroom-inspired interaction)
// The floating finish selector panel is directly derived from Darkroom's
// CAN/PAPER/SATIN/GLOSS material chooser seen on darkmodedesign.com
// ══════════════════════════════════════════════════════════════════════════════
function screenFinish(yOff) {
  const y = yOff;
  const finishes  = ['MATTE', 'SATIN', 'GLOSS', 'BRUSH'];
  const materials = [
    { color: '#1A1A1A', label: 'Matte\nBlack', selected: true },
    { color: '#6B6B6B', label: 'Satin\nGray',  selected: false },
    { color: '#C4C4C4', label: 'Mirror\nSilver', selected: false },
    { color: '#2A1F12', label: 'Dark\nBronze', selected: false },
    { color: '#D4A855', label: 'Gold\nBrass',  selected: false },
  ];
  const nodes = [
    ...statusBar(y),
    text(20, y + 54, 300, 'Finish Explorer', 22, T.text, { weight: 700 }),
    text(20, y + 82, 300, 'Tap a finish to preview all variants', 13, T.text3),
    // Large preview area
    rect(20, y + 114, W - 40, 220, '#111111', { r: 24, stroke: T.border2, strokeWeight: 1 }),
    // Simulated surface preview with lines for finish texture
    ...Array.from({ length: 14 }, (_, i) =>
      line(20, y + 126 + i * 15, W - 20, y + 126 + i * 15, '#FFFFFF', { opacity: 0.025 + i * 0.004, w: 1 })
    ),
    circle(W / 2, y + 224, 48, '#1A1A1A', { strokeWeight: 2 }),
    circle(W / 2, y + 224, 48, T.brass, { opacity: 0.0 }),
    // sheen circle highlight
    circle(W / 2 - 14, y + 210, 16, '#FFFFFF', { opacity: 0.06 }),
    text(W / 2 - 40, y + 316, 80, 'MATTE', 11, T.brass, { align: 'CENTER', weight: 700, ls: 1.5 }),
    // ── Finish panel (THE Darkroom-inspired interaction) ──
    ...finishPanel(20, y + 348, finishes, 0),
    // Swatch row
    text(20, y + 432, 200, 'Color variants', 13, T.text, { weight: 600 }),
    ...swatchRow(20, y + 456, materials.slice(0, 4).map(m => ({
      color: m.color, label: m.label.split('\n')[0], active: m.selected
    }))),
    // Properties section
    text(20, y + 564, 200, 'Surface Properties', 13, T.text, { weight: 600 }),
    ...propertyBar(20, y + 588, 'Roughness', 0.88),
    ...propertyBar(20, y + 618, 'Reflectance', 0.12),
    ...propertyBar(20, y + 648, 'UV Resistance', 0.95),
    ...navBar(1, y + H - 80),
  ];
  return frame('Finish Explorer', yOff, nodes);
}

function propertyBar(x, y, label, value) {
  const w = W - 40;
  const barW = w - 130;
  const fillW = Math.round(barW * value);
  return [
    text(x, y + 4, 110, label, 11, T.text2),
    rect(x + 118, y + 8, barW, 6, T.surface3, { r: 3 }),
    rect(x + 118, y + 8, fillW, 6, T.brass, { r: 3 }),
    text(x + 118 + barW + 6, y + 4, 36, `${Math.round(value * 100)}%`, 11, T.brass, { weight: 600, align: 'RIGHT' }),
  ];
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Spec Sheet (numbered sections — inspired by land-book Veo layout)
// ══════════════════════════════════════════════════════════════════════════════
function screenSpec(yOff) {
  const y = yOff;
  const nodes = [
    ...statusBar(y),
    text(20, y + 54, 300, 'Spec Sheet', 22, T.text, { weight: 700 }),
    text(20, y + 80, 300, 'Matte Black Anodized · Al 6061', 13, T.text2 ),
    // Export button
    ...chip(W - 100, y + 60, 'Export PDF', T.brass, T.surface2, { w: 88, h: 28, r: 8 }),
    divider(y + 110),
    // Large numbered specs — inspired by Veo "01" numbered features on land-book
    ...specSection(y + 124, '01', 'PROCESS', 'Type II Sulphuric Acid Anodize per MIL-A-8625F. Bath temp 18–22°C, current density 1.2 A/dm².'),
    divider(y + 254),
    ...specSection(y + 268, '02', 'THICKNESS', 'Coating 12–25 µm. Seal with hot DI water 95°C for 20 min minimum. Verify with eddy-current probe.'),
    divider(y + 394),
    ...specSection(y + 408, '03', 'HARDNESS', '350–500 HV Vickers. Meets ISO 7599:2018 Class C corrosion resistance standard.'),
    divider(y + 524),
    ...specSection(y + 538, '04', 'TOLERANCE', 'Dimensional change ±0.005 mm per surface. No masking unless noted on drawing.'),
    ...navBar(2, y + H - 80),
  ];
  return frame('Spec Sheet', yOff, nodes);
}

function specSection(y, num, title, body) {
  return [
    // Large display number
    text(20, y, 56, num, 48, T.brass, { weight: 800, ls: -2, lh: 56, opacity: 0.6 }),
    text(80, y + 6, 200, title, 11, T.text3, { weight: 700, ls: 1.5 }),
    text(20, y + 58, W - 40, body, 12, T.text2, { lh: 18, h: 64 }),
  ];
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Collab Board
// ══════════════════════════════════════════════════════════════════════════════
function screenCollab(yOff) {
  const y = yOff;
  const nodes = [
    ...statusBar(y),
    text(20, y + 54, 260, 'Project Board', 22, T.text, { weight: 700 }),
    text(20, y + 80, 260, 'NX-7 Industrial Camera · 3 contributors', 13, T.text2),
    // Team avatars
    circle(W - 26, y + 68, 14, '#5CB87A'),
    text(W - 40, y + 62, 28, 'KL', 9, T.bg, { align: 'CENTER', weight: 700 }),
    circle(W - 52, y + 68, 14, '#C9B99A'),
    text(W - 66, y + 62, 28, 'MR', 9, T.bg, { align: 'CENTER', weight: 700 }),
    circle(W - 78, y + 68, 14, '#E05252'),
    text(W - 92, y + 62, 28, 'SJ', 9, T.bg, { align: 'CENTER', weight: 700 }),
    divider(y + 106),
    // ── Approved materials ──
    text(20, y + 118, 200, 'Approved', 12, T.green, { weight: 700, ls: 0.5 }),
    ...boardRow(y + 142, '#1A1A1A', 'Matte Black Anodized', 'Body shell · Final', true,  'KL · 2h ago'),
    ...boardRow(y + 194, '#8C8C8C', 'Brushed Aluminum',     'Heat sink · Final',  true,  'MR · 5h ago'),
    divider(y + 252),
    // ── In review ──
    text(20, y + 264, 200, 'In Review', 12, T.brass, { weight: 700, ls: 0.5 }),
    ...boardRow(y + 288, '#C4A862', 'Polished Brass',        'Lens ring · v2',     false, 'SJ · 1d ago'),
    ...boardRow(y + 340, '#3B2C1A', 'Cognac Leather',        'Grip wrap · sample', false, 'KL · 1d ago'),
    divider(y + 398),
    // ── Comment thread ──
    text(20, y + 410, 200, 'Comments', 12, T.text3, { weight: 700, ls: 0.5 }),
    ...comment(y + 434, 'KL', '#5CB87A', 'Brass ring update approved. Verify anodize doesn\'t conflict with lens coating spec.'),
    ...comment(y + 506, 'SJ', '#E05252', 'Leather grip sample incoming Mon. UV test results attached.'),
    // Add comment bar
    rect(20, y + 576, W - 40, 40, T.surface2, { r: 20, stroke: T.border2, strokeWeight: 1 }),
    text(52, y + 586, W - 80, 'Add a comment…', 13, T.text3),
    circle(38, y + 596, 10, T.brass),
    ...navBar(3, y + H - 80),
  ];
  return frame('Collab Board', yOff, nodes);
}

function boardRow(y, swatchColor, name, sub, approved, meta) {
  return [
    rect(20, y, W - 40, 44, T.surface, { r: 12, stroke: T.border2, strokeWeight: 1 }),
    rect(32, y + 10, 24, 24, swatchColor, { r: 6 }),
    text(64, y + 10, 200, name, 13, T.text, { weight: 600, lh: 16 }),
    text(64, y + 26, 180, sub, 10, T.text3, { lh: 12 }),
    ...chip(W - 110, y + 12, approved ? 'Approved' : 'In Review',
      approved ? T.green : T.brass,
      approved ? T.greenPale : T.brassPale,
      { w: 78, h: 20, r: 6 }
    ),
  ];
}

function comment(y, initials, color, body) {
  return [
    circle(32, y + 18, 14, color),
    text(18, y + 12, 28, initials, 9, T.bg, { align: 'CENTER', weight: 700 }),
    rect(52, y, W - 72, 64, T.surface2, { r: 12, stroke: T.border2, strokeWeight: 1 }),
    text(64, y + 12, W - 88, body, 11, T.text2, { lh: 16, h: 44 }),
  ];
}

// ══════════════════════════════════════════════════════════════════════════════
// ASSEMBLE & WRITE
// ══════════════════════════════════════════════════════════════════════════════
const screens = [
  screenLibrary(0),
  screenDetail(H + GAP),
  screenFinish((H + GAP) * 2),
  screenSpec((H + GAP) * 3),
  screenCollab((H + GAP) * 4),
];

const pen = {
  version:    '2.8',
  name:       'Slate — Every surface, perfectly specified.',
  width:      W,
  height:     screens.length * (H + GAP) - GAP,
  background: T.bg,
  screens:    screens,
  frames:     screens,
};

const outPath = path.join(__dirname, 'slate.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ slate.pen written — ${screens.length} screens, ${JSON.stringify(pen).length} bytes`);
