'use strict';
// grain-app.js
// GRAIN — know what you wear
// Fabric transparency app for conscious fashion consumers
// Light editorial theme — stone/sage/terracotta palette
// Inspired by "How It Wears" (land-book) + Isaac Powell/SHED editorial clean style (Awwwards SOTD)

const fs   = require('fs');
const path = require('path');

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const P = {
  bg:      '#F7F5F1',   // warm stone
  surface: '#FFFFFF',
  surfaceB:'#EDE9E2',   // linen
  border:  '#DDD8CF',
  text:    '#1C1916',   // near-black warm
  muted:   '#8A8178',
  sage:    '#5E8A66',   // muted sage — eco
  terra:   '#C4763A',   // warm terracotta — care
  sky:     '#5B7FA6',   // muted blue — water
  cream:   '#F0EBE1',
};

const W = 375;   // frame width
const H = 812;   // frame height
const FRAME_GAP = 80;

// ─── PRIMITIVES ──────────────────────────────────────────────────────────────
let _id = 1;
const uid = () => `n${_id++}`;

function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'RECTANGLE',
    id: uid(),
    x, y, w, h,
    fill,
    cornerRadius: opts.r || 0,
    opacity: opts.opacity || 1,
    ...(opts.stroke ? { stroke: opts.stroke, strokeWidth: opts.strokeWidth || 1 } : {}),
  };
}

function text(x, y, w, content, fontSize, color, opts = {}) {
  return {
    type: 'TEXT',
    id: uid(),
    x, y, w,
    content,
    fontSize,
    color,
    fontWeight: opts.bold ? 600 : opts.medium ? 500 : 400,
    fontStyle: opts.italic ? 'italic' : 'normal',
    textAlign: opts.center ? 'center' : opts.right ? 'right' : 'left',
    lineHeight: opts.lineHeight || (fontSize <= 12 ? 1.5 : fontSize <= 16 ? 1.5 : 1.3),
    letterSpacing: opts.ls || 0,
    opacity: opts.opacity || 1,
  };
}

function frame(x, y, children, name) {
  return {
    type: 'FRAME',
    id: uid(),
    name,
    x, y,
    w: W,
    h: H,
    fill: P.bg,
    clip: true,
    children,
  };
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
function statusBar(y = 0) {
  return [
    rect(0, y, W, 44, P.bg),
    text(16, y + 14, 60, '9:41', 12, P.text, { bold: true }),
    text(W - 80, y + 14, 70, '●●● WiFi 100%', 11, P.muted, { right: true }),
  ];
}

function navBar(activeIdx, labels = ['Closet','Details','Materials','Impact','Scan']) {
  const items = [];
  const icons = ['▣', '◎', '◈', '◉', '⊕'];
  const tabW = W / labels.length;
  items.push(rect(0, H - 80, W, 80, P.surface));
  items.push(rect(0, H - 80, W, 1, P.border));
  labels.forEach((label, i) => {
    const cx = i * tabW + tabW / 2;
    const isActive = i === activeIdx;
    items.push(text(cx - 20, H - 68, 40, icons[i], 18, isActive ? P.sage : P.muted, { center: true }));
    items.push(text(cx - 24, H - 46, 48, label, 9, isActive ? P.sage : P.muted, {
      center: true, bold: isActive, ls: 0.3,
    }));
    if (isActive) {
      items.push(rect(cx - 12, H - 80, 24, 3, P.sage, { r: 2 }));
    }
  });
  return items;
}

function topBar(title, subtitle) {
  const els = [...statusBar(0)];
  els.push(text(16, 52, W - 80, title, 22, P.text, { bold: true }));
  if (subtitle) {
    els.push(text(16, 78, W - 80, subtitle, 12, P.muted));
  }
  return els;
}

// Composition bar: label, pct, color
function compositionBar(x, y, w, label, pct, color, detail) {
  const els = [];
  els.push(text(x, y, w * 0.55, label, 13, P.text, { medium: true }));
  els.push(text(x + w * 0.55, y, w * 0.2, `${pct}%`, 13, P.terra, { bold: true, right: true }));
  els.push(rect(x, y + 20, w, 6, P.surfaceB, { r: 3 }));
  els.push(rect(x, y + 20, Math.round(w * pct / 100), 6, color, { r: 3 }));
  if (detail) {
    els.push(text(x, y + 32, w, detail, 10, P.muted));
  }
  return els;
}

// Care symbol chip
function careChip(x, y, symbol, label, color) {
  return [
    rect(x, y, 60, 60, color + '18', { r: 10 }),
    rect(x + 1, y + 1, 58, 58, 'transparent', { r: 9, stroke: color + '40', strokeWidth: 1 }),
    text(x, y + 10, 60, symbol, 22, color, { center: true }),
    text(x, y + 36, 60, label, 8, P.muted, { center: true, ls: 0.2 }),
  ];
}

// Sustainability score pill
function scorePill(x, y, score, label, color) {
  return [
    rect(x, y, 80, 36, color + '18', { r: 18 }),
    text(x, y + 8, 80, `${score}`, 18, color, { center: true, bold: true }),
    text(x + 85, y + 4, 100, label, 11, P.text),
    text(x + 85, y + 18, 100, 'eco score', 10, P.muted),
  ];
}

function garmentRow(x, y, w, brand, name, composition, score, scoreColor) {
  const els = [];
  // Garment swatch block
  els.push(rect(x, y, 52, 68, P.surfaceB, { r: 8 }));
  els.push(rect(x + 8, y + 16, 36, 36, P.border, { r: 4 }));  // placeholder icon
  // Info
  els.push(text(x + 62, y + 4, w - 80, brand, 10, P.muted, { ls: 0.5 }));
  els.push(text(x + 62, y + 18, w - 80, name, 13, P.text, { medium: true }));
  els.push(text(x + 62, y + 36, w - 80, composition, 11, P.muted));
  // Score pill
  els.push(rect(x + w - 50, y + 8, 44, 22, scoreColor + '20', { r: 11 }));
  els.push(text(x + w - 50, y + 13, 44, `${score}/10`, 10, scoreColor, { center: true, bold: true }));
  // Divider
  els.push(rect(x, y + 70, w, 1, P.border));
  return els;
}

// ─── SCREEN 1: CLOSET ─────────────────────────────────────────────────────────
function buildCloset(fx, fy) {
  const els = [];
  const OX = fx;
  const OY = fy;

  // Header
  els.push(...topBar('My Closet', '24 items · avg score 6.8'));

  // Filter chips
  const chips = ['All', 'Tops', 'Bottoms', 'Outerwear', 'Footwear'];
  let cx = 16;
  chips.forEach((chip, i) => {
    const chipW = chip.length * 7.5 + 20;
    const active = i === 0;
    els.push(rect(cx, 100, chipW, 28, active ? P.sage : P.surfaceB, { r: 14 }));
    els.push(text(cx, 107, chipW, chip, 11, active ? P.surface : P.muted, { center: true, medium: true }));
    cx += chipW + 8;
  });

  // Sort row
  els.push(text(16, 140, 100, 'Recently added', 11, P.muted));
  els.push(text(W - 80, 140, 70, '↕ Sort', 11, P.sage, { right: true }));

  // Garment list
  const items = [
    { brand: 'MUJI', name: 'Organic Cotton Tee', comp: '100% organic cotton', score: 9.1, col: P.sage },
    { brand: 'COS', name: 'Linen Blend Shirt', comp: '70% linen · 30% cotton', score: 7.4, col: P.sage },
    { brand: 'ZARA', name: 'Slim Chino Trousers', comp: '98% cotton · 2% elastane', score: 5.2, col: P.terra },
    { brand: 'H&M', name: 'Polyester Puffer', comp: '100% recycled polyester', score: 6.8, col: '#D4A020' },
    { brand: 'ACNE', name: 'Merino Wool Sweater', comp: '100% merino wool', score: 8.3, col: P.sage },
  ];
  let gy = 162;
  items.forEach(item => {
    els.push(...garmentRow(16, gy, W - 32, item.brand, item.name, item.comp, item.score, item.col));
    gy += 80;
  });

  return frame(OX, OY, els, 'Closet');
}

// ─── SCREEN 2: ITEM DETAIL ────────────────────────────────────────────────────
function buildDetail(fx, fy) {
  const els = [];

  // Top image area
  els.push(rect(0, 0, W, 200, P.surfaceB));
  els.push(rect(0, 0, W, 44, P.bg + 'CC'));  // status bar overlay
  els.push(...statusBar(0));

  // Back button
  els.push(rect(12, 52, 32, 32, P.surface, { r: 16 }));
  els.push(text(12, 60, 32, '←', 14, P.text, { center: true }));

  // Fabric swatch simulation
  els.push(rect(80, 48, 215, 140, P.border, { r: 12 }));
  els.push(rect(88, 56, 199, 124, '#DEDAD3', { r: 8 }));
  // Texture lines
  for (let i = 0; i < 8; i++) {
    els.push(rect(88, 56 + i * 16, 199, 1, '#C8C4BC60'));
  }
  els.push(text(100, 110, 175, 'LINEN BLEND', 10, '#8A8178', { center: true, ls: 3 }));

  // Brand + name
  els.push(text(16, 208, 200, 'COS', 10, P.muted, { ls: 2 }));
  els.push(text(16, 224, W - 32, 'Linen Blend Shirt', 20, P.text, { bold: true }));
  els.push(text(16, 250, 120, 'Made in Portugal 🇵🇹', 11, P.muted));

  // Eco score
  els.push(...scorePill(W - 120, 220, 7.4, 'Good', P.sage));

  // Divider
  els.push(rect(16, 276, W - 32, 1, P.border));

  // Composition section
  els.push(text(16, 288, 120, 'COMPOSITION', 10, P.muted, { ls: 2 }));
  els.push(...compositionBar(16, 308, W - 32, 'Linen', 70, P.sage, 'Flax plant · low water · biodegradable'));
  els.push(...compositionBar(16, 360, W - 32, 'Cotton', 30, '#D4A020', 'GOTS certified organic'));

  // Divider
  els.push(rect(16, 406, W - 32, 1, P.border));

  // Care section
  els.push(text(16, 418, 120, 'CARE', 10, P.muted, { ls: 2 }));
  const careSymbols = [
    { sym: '30°', label: 'Gentle wash', col: P.sky },
    { sym: '◻', label: 'Do not bleach', col: '#E05555' },
    { sym: '▽', label: 'Drip dry', col: P.sage },
    { sym: '○', label: 'Cool iron', col: P.terra },
  ];
  careSymbols.forEach((c, i) => {
    els.push(...careChip(16 + i * 72, 436, c.sym, c.label, c.col));
  });

  // Divider
  els.push(rect(16, 504, W - 32, 1, P.border));

  // Environmental impact
  els.push(text(16, 516, 180, 'ENVIRONMENTAL IMPACT', 10, P.muted, { ls: 2 }));
  const impacts = [
    { label: '💧 Water usage', val: 'Low', col: P.sky },
    { label: '🌿 CO₂ footprint', val: 'Medium', col: '#D4A020' },
    { label: '🧵 Microplastics', val: 'None', col: P.sage },
    { label: '♻️ End of life', val: 'Compostable', col: P.sage },
  ];
  impacts.forEach((item, i) => {
    const iy = 536 + i * 32;
    els.push(text(16, iy, 180, item.label, 12, P.text));
    els.push(text(W - 110, iy, 90, item.val, 12, item.col, { bold: true, right: true }));
    if (i < impacts.length - 1) {
      els.push(rect(16, iy + 24, W - 32, 1, P.border + '60'));
    }
  });

  // Nav
  els.push(...navBar(0));

  return frame(fx, fy, els, 'Item Detail');
}

// ─── SCREEN 3: MATERIALS ──────────────────────────────────────────────────────
function buildMaterials(fx, fy) {
  const els = [];

  els.push(...topBar('Materials', 'What your clothes are made of'));

  // Search bar
  els.push(rect(16, 100, W - 32, 40, P.surface, { r: 10, stroke: P.border, strokeWidth: 1 }));
  els.push(text(44, 112, W - 80, 'Search materials…', 13, P.muted));
  els.push(text(24, 113, 16, '⌕', 14, P.muted));

  // Category chips
  const cats = ['All', '🌿 Natural', '♻️ Recycled', '⚠️ Synthetic'];
  let cx2 = 16;
  cats.forEach((c, i) => {
    const cw = c.length * 7 + 20;
    els.push(rect(cx2, 152, cw, 26, i === 0 ? P.sage : P.surfaceB, { r: 13 }));
    els.push(text(cx2, 158, cw, c, 11, i === 0 ? '#FFF' : P.muted, { center: true }));
    cx2 += cw + 8;
  });

  // Material cards
  const materials = [
    {
      name: 'Linen', family: 'Natural · Plant-based',
      badges: ['Low water', 'Biodegradable', 'GOTS'],
      score: 9.2, col: P.sage,
      desc: 'Made from flax plant. One of the oldest textiles — and one of the most sustainable. Gets softer with every wash.',
    },
    {
      name: 'Merino Wool', family: 'Natural · Animal-based',
      badges: ['Renewable', 'Biodegradable', 'ZQ certified'],
      score: 8.1, col: P.sage,
      desc: 'Temperature-regulating, odour-resistant. Needs less washing. Choose ZQ or RWS certified for animal welfare.',
    },
    {
      name: 'Organic Cotton', family: 'Natural · Plant-based',
      badges: ['GOTS certified', 'No pesticides'],
      score: 7.8, col: '#D4A020',
      desc: 'Better than conventional cotton, but still water-intensive. Look for GOTS certification.',
    },
    {
      name: 'Recycled Polyester', family: 'Recycled · Synthetic',
      badges: ['From PET bottles', 'GRS certified'],
      score: 6.2, col: '#D4A020',
      desc: 'Reduces landfill and uses less energy than virgin polyester. Releases microplastics when washed.',
    },
  ];

  let my = 190;
  materials.forEach(m => {
    const cardH = 110;
    els.push(rect(16, my, W - 32, cardH, P.surface, { r: 12, stroke: P.border, strokeWidth: 1 }));
    // Score dot
    els.push(rect(W - 56, my + 12, 36, 20, m.col + '25', { r: 10 }));
    els.push(text(W - 56, my + 15, 36, `${m.score}`, 12, m.col, { center: true, bold: true }));
    // Name + family
    els.push(text(24, my + 12, 180, m.name, 14, P.text, { bold: true }));
    els.push(text(24, my + 30, W - 80, m.family, 10, P.muted, { ls: 0.5 }));
    // Badges
    let bx = 24;
    m.badges.forEach(b => {
      const bw = b.length * 5.5 + 12;
      els.push(rect(bx, my + 48, bw, 18, m.col + '18', { r: 9 }));
      els.push(text(bx, my + 52, bw, b, 9, m.col, { center: true }));
      bx += bw + 6;
    });
    // Description
    els.push(text(24, my + 74, W - 56, m.desc, 10, P.muted, { lineHeight: 1.5 }));
    my += cardH + 10;
  });

  els.push(...navBar(2));

  return frame(fx, fy, els, 'Materials');
}

// ─── SCREEN 4: IMPACT ────────────────────────────────────────────────────────
function buildImpact(fx, fy) {
  const els = [];

  els.push(...topBar('Your Impact', 'Based on your closet of 24 items'));

  // Big hero metric
  els.push(rect(16, 100, W - 32, 100, P.sage + '15', { r: 16 }));
  els.push(rect(16, 100, W - 32, 100, 'transparent', { r: 16, stroke: P.sage + '30', strokeWidth: 1 }));
  els.push(text(16, 116, W - 32, '7.1', 48, P.sage, { center: true, bold: true }));
  els.push(text(16, 166, W - 32, 'avg closet score · Good', 12, P.muted, { center: true }));

  // Score bar (distribution)
  els.push(text(16, 212, W - 32, 'SCORE DISTRIBUTION', 10, P.muted, { ls: 2 }));
  const dist = [
    { range: '0–3', count: 1, pct: 4, col: '#E05555' },
    { range: '3–5', count: 4, pct: 17, col: P.terra },
    { range: '5–7', count: 8, pct: 33, col: '#D4A020' },
    { range: '7–9', count: 9, pct: 38, col: P.sage },
    { range: '9–10', count: 2, pct: 8, col: '#3A8A44' },
  ];
  dist.forEach((d, i) => {
    const bx = 16 + i * (W - 32) / 5;
    const bw = (W - 32) / 5 - 4;
    const bh = Math.round(d.pct * 0.8);
    els.push(rect(bx, 280 - bh, bw, bh, d.col + 'AA', { r: 3 }));
    els.push(text(bx, 283, bw, d.range, 9, P.muted, { center: true }));
    els.push(text(bx, 296, bw, `${d.count}`, 10, d.col, { center: true, bold: true }));
  });

  // Divider
  els.push(rect(16, 316, W - 32, 1, P.border));

  // Metrics grid
  els.push(text(16, 328, 180, 'ENVIRONMENTAL METRICS', 10, P.muted, { ls: 2 }));
  const metrics = [
    { icon: '💧', label: 'Water saved vs fast fashion', val: '34,200L', sub: 'equiv. 229 showers', col: P.sky },
    { icon: '🌿', label: 'CO₂ avoided', val: '18.4 kg', sub: 'equiv. 74 km not driven', col: P.sage },
    { icon: '🧵', label: 'Microplastics risk items', val: '3 items', sub: 'puffer + 2 synthetics', col: P.terra },
    { icon: '♻️', label: 'Recyclable or compostable', val: '17 / 24', sub: '71% of your closet', col: '#D4A020' },
  ];
  metrics.forEach((m, i) => {
    const my2 = 348 + i * 76;
    els.push(rect(16, my2, W - 32, 68, P.surface, { r: 10, stroke: P.border, strokeWidth: 1 }));
    els.push(text(24, my2 + 12, 28, m.icon, 20, m.col));
    els.push(text(56, my2 + 10, W - 100, m.label, 11, P.muted));
    els.push(text(56, my2 + 26, W - 100, m.val, 18, m.col, { bold: true }));
    els.push(text(56, my2 + 48, W - 100, m.sub, 10, P.muted));
  });

  els.push(...navBar(3));

  return frame(fx, fy, els, 'Impact');
}

// ─── SCREEN 5: SCAN ──────────────────────────────────────────────────────────
function buildScan(fx, fy) {
  const els = [];

  // Dark camera overlay at top
  els.push(rect(0, 0, W, 340, '#1C1916'));
  els.push(...statusBar(0));

  // Status bar on dark
  els.push(rect(0, 0, W, 44, '#1C1916'));
  els.push(text(16, 14, 60, '9:41', 12, '#F7F5F1', { bold: true }));
  els.push(text(W - 80, 14, 70, '●●● WiFi 100%', 11, '#8A817890', { right: true }));

  // Camera viewfinder
  els.push(rect(60, 60, W - 120, 200, '#2A2620', { r: 12 }));
  // Corner guides
  const corners = [[68, 68], [W - 80, 68], [68, 248], [W - 80, 248]];
  corners.forEach(([cx, cy]) => {
    els.push(rect(cx, cy, 20, 3, P.sage, { r: 1 }));
    els.push(rect(cx, cy, 3, 20, P.sage, { r: 1 }));
  });
  // Label inside viewfinder
  els.push(text(60, 148, W - 120, '🏷 Point at care label', 13, '#F7F5F190', { center: true }));

  // Instruction
  els.push(text(16, 278, W - 32, 'Scan the care label inside your garment', 13, '#F7F5F170', { center: true }));
  els.push(text(16, 300, W - 32, 'or enter manually below', 11, '#F7F5F150', { center: true }));

  // Light panel below
  els.push(rect(0, 340, W, H - 340, P.bg));

  // Manual entry section
  els.push(text(16, 356, 160, 'ADD MANUALLY', 10, P.muted, { ls: 2 }));

  // Brand input
  els.push(rect(16, 376, W - 32, 44, P.surface, { r: 10, stroke: P.border, strokeWidth: 1 }));
  els.push(text(24, 390, 80, 'Brand', 12, P.muted));
  els.push(text(120, 390, W - 144, 'e.g. COS, Muji, Arket…', 12, P.border));

  // Material input
  els.push(rect(16, 428, W - 32, 44, P.surface, { r: 10, stroke: P.sage, strokeWidth: 1.5 }));
  els.push(text(24, 442, 120, 'Composition', 12, P.muted));
  els.push(text(24, 460, W - 48, '70% linen, 30% cotton', 12, P.text));

  // Country input
  els.push(rect(16, 480, W - 32, 44, P.surface, { r: 10, stroke: P.border, strokeWidth: 1 }));
  els.push(text(24, 494, 120, 'Made in', 12, P.muted));
  els.push(text(24, 512, W - 48, 'Portugal', 12, P.border));

  // Add button
  els.push(rect(16, 534, W - 32, 48, P.sage, { r: 12 }));
  els.push(text(16, 550, W - 32, 'Add to Closet', 15, '#FFFFFF', { center: true, bold: true }));

  // Recent scans
  els.push(text(16, 596, 160, 'RECENTLY ADDED', 10, P.muted, { ls: 2 }));
  const recent = ['MUJI — Organic Cotton Tee', 'COS — Linen Blend Shirt'];
  recent.forEach((r, i) => {
    const ry = 616 + i * 36;
    els.push(rect(16, ry, W - 32, 28, P.surface, { r: 6 }));
    els.push(text(26, ry + 7, W - 80, r, 12, P.text));
    els.push(text(W - 42, ry + 7, 24, '↗', 13, P.muted));
  });

  els.push(...navBar(4));

  return frame(fx, fy, els, 'Scan');
}

// ─── BUILD DOCUMENT ───────────────────────────────────────────────────────────
function buildDocument() {
  const screens = [
    buildCloset(0, 0),
    buildDetail(W + FRAME_GAP, 0),
    buildMaterials((W + FRAME_GAP) * 2, 0),
    buildImpact((W + FRAME_GAP) * 3, 0),
    buildScan((W + FRAME_GAP) * 4, 0),
  ];

  const totalW = (W + FRAME_GAP) * screens.length - FRAME_GAP;

  return {
    version: '2.8',
    name: 'GRAIN — know what you wear',
    width: totalW,
    height: H,
    fill: '#E8E4DC',
    meta: {
      appName: 'GRAIN',
      tagline: 'know what you wear',
      archetype: 'sustainability',
      theme: 'light',
      palette: {
        bg: P.bg, surface: P.surface, text: P.text,
        accent: P.sage, accent2: P.terra, muted: P.muted,
      },
    },
    children: screens,
  };
}

// ─── WRITE ────────────────────────────────────────────────────────────────────
const doc = buildDocument();
const outPath = path.join(__dirname, 'grain.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log(`✓ Written: ${outPath}`);
console.log(`  Screens: ${doc.children.length}`);
console.log(`  Canvas:  ${doc.width} × ${doc.height}`);
console.log(`  Nodes:   ${JSON.stringify(doc).match(/"type"/g).length}`);
