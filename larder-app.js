'use strict';
// larder-app.js
// LARDER — farm-to-table ingredient provenance platform for premium kitchens
//
// Inspired by:
//   - Lucci Lambrusco (siteinspire.com) — warm cream #F5F0E8 + terracotta red, bold
//     condensed editorial type, marquee ticker strip, vintage Italian craftsmanship feel
//   - KOMETA Typefaces (minimal.gallery) — "We make fonts that AI couldn't invent"
//     ultra-clean white with one bold color-block accent panel
//   - Isa de Burgh portfolio (lapa.ninja) — editorial typography, generous whitespace,
//     minimal label system for complex information
//
// NEW PATTERN: Editorial bold display headings + warm cream tones + marquee ticker
// as info band + split-column ingredient cards + seasonal arc chart
// Theme: LIGHT — warm cream + terracotta + deep brown text

const fs   = require('fs');
const path = require('path');

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const P = {
  bg:         '#F4EFE6',  // warm cream — main background
  bg2:        '#EDE7DA',  // slightly deeper cream for alternating sections
  surface:    '#FAFAF7',  // near-white card surface
  surface2:   '#F0EBE1',  // warm tinted card
  surface3:   '#EAE3D8',  // pressed/hovered card
  terra:      '#C84831',  // terracotta — primary accent (Lucci Lambrusco inspired)
  terraSoft:  'rgba(200,72,49,0.10)',
  terraMid:   'rgba(200,72,49,0.20)',
  clay:       '#8B4A3A',  // warm clay — secondary accent
  claySoft:   'rgba(139,74,58,0.12)',
  amber:      '#D97706',  // harvest amber — positive / ripe
  amberSoft:  'rgba(217,119,6,0.12)',
  sage:       '#5B7B5E',  // organic green — certified/fresh
  sageSoft:   'rgba(91,123,94,0.12)',
  sand:       '#C4A882',  // warm sand — muted accent
  sandSoft:   'rgba(196,168,130,0.15)',
  text:       '#1A1410',  // near-black warm brown
  textMid:    'rgba(26,20,16,0.60)',
  muted:      'rgba(26,20,16,0.38)',
  border:     'rgba(26,20,16,0.10)',
  border2:    'rgba(26,20,16,0.18)',
  divider:    'rgba(26,20,16,0.06)',
  white:      '#FDFCFA',
};

const W   = 375;
const H   = 812;
const GAP = 72;

let _id = 1;
const uid = () => `el${_id++}`;

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  const o = {
    type: 'RECTANGLE', id: uid(), x, y, w, h, fill,
    cornerRadius: opts.r || 0,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
  };
  if (opts.stroke) { o.stroke = opts.stroke; o.strokeWidth = opts.sw || 1; }
  return o;
}

function text(x, y, w, content, size, color, opts = {}) {
  return {
    type: 'TEXT', id: uid(), x, y, w, content,
    fontSize: size, color,
    fontWeight: opts.bold ? 700 : opts.semi ? 600 : opts.medium ? 500 : opts.light ? 300 : 400,
    fontFamily: opts.serif ? 'Georgia, serif' : (opts.mono ? 'JetBrains Mono, monospace' : 'Inter'),
    textAlign: opts.center ? 'center' : opts.right ? 'right' : 'left',
    lineHeight: opts.lh || (size <= 11 ? 1.5 : size <= 15 ? 1.45 : 1.25),
    letterSpacing: opts.ls || (opts.caps ? 1.2 : 0),
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
  };
}

function frame(x, y, w, h, children, bg, opts = {}) {
  const f = {
    type: 'FRAME', id: uid(), x, y, w, h,
    fill: bg || 'transparent', clip: true,
    children: children.filter(Boolean).flat(),
  };
  if (opts.r) f.cornerRadius = opts.r;
  if (opts.stroke) { f.stroke = opts.stroke; f.strokeWidth = opts.sw || 1; }
  return f;
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

// Status bar
function statusBar(ox, oy) {
  return [
    rect(ox, oy, W, 44, P.bg),
    text(ox + 16, oy + 14, 50, '9:41', 13, P.text, { semi: true }),
    text(ox + W - 70, oy + 14, 60, '●●● ▼', 11, P.text, { right: true, opacity: 0.7 }),
  ];
}

// Bottom nav bar — LARDER tabs
function navBar(ox, oy, active) {
  const tabs = [
    { icon: '⟁', label: 'Harvest' },
    { icon: '◈', label: 'Suppliers' },
    { icon: '❋', label: 'Calendar' },
    { icon: '⊡', label: 'Orders' },
    { icon: '⊙', label: 'Profile' },
  ];
  const ch = [];
  ch.push(rect(ox, oy, W, 60, P.surface, { stroke: P.border, sw: 1 }));
  tabs.forEach((t, i) => {
    const tx = ox + 12 + i * 70;
    const isActive = i === active;
    ch.push(text(tx, oy + 8, 60, t.icon, 18, isActive ? P.terra : P.muted, { center: true }));
    ch.push(text(tx, oy + 32, 60, t.label, 9, isActive ? P.terra : P.muted, { center: true, semi: isActive }));
    if (isActive) {
      ch.push(rect(tx + 20, oy + 2, 20, 2, P.terra, { r: 1 }));
    }
  });
  return ch;
}

// Label chip (spice-label inspired)
function chip(x, y, label, textColor, bg, opts = {}) {
  const w = opts.w || label.length * 6.5 + 16;
  const h = opts.h || 22;
  const r = opts.r !== undefined ? opts.r : 4;
  return [
    rect(x, y, w, h, bg, { r, stroke: opts.stroke, sw: opts.sw }),
    text(x + 8, y + (h - (opts.size || 10)) / 2 - 1, w - 16, label.toUpperCase(), opts.size || 10, textColor, { semi: true, ls: 0.8 }),
  ];
}

// Horizontal rule
function rule(x, y, w, opts = {}) {
  return rect(x, y, w, 1, opts.color || P.divider, {});
}

// Marquee/ticker strip — farm names scrolling by (Lucci Lambrusco signature element)
function tickerStrip(ox, oy, items) {
  const ch = [];
  ch.push(rect(ox, oy, W, 32, P.terra));
  let tx = ox + 12;
  items.forEach((item, i) => {
    const tw = item.length * 7.5 + 24;
    ch.push(text(tx, oy + 9, tw, item.toUpperCase(), 11, P.white, { semi: true, ls: 1.0 }));
    if (i < items.length - 1) {
      ch.push(text(tx + tw, oy + 9, 20, '·', 12, 'rgba(253,252,250,0.5)', {}));
    }
    tx += tw + 20;
  });
  return ch;
}

// Section heading with decorative rule
function sectionHead(ox, oy, label, opts = {}) {
  const ch = [];
  ch.push(text(ox, oy, W - 32, label.toUpperCase(), opts.size || 10, P.muted, { semi: true, ls: 1.5 }));
  if (!opts.noLine) ch.push(rule(ox, oy + 18, W - 32, { color: P.border }));
  return ch;
}

// Freshness arc (days since harvest as a small arc indicator)
function freshnessArc(cx, cy, r, pct, color) {
  // Represented as a circle progress using two overlapping rects with clip (simplified)
  return [
    rect(cx - r, cy - r, r * 2, r * 2, 'transparent', { r, stroke: P.border2, sw: 2 }),
    // Top arc segment approximation (just the track)
    rect(cx - r + 2, cy - r + 2, r * 2 - 4, r * 2 - 4, 'transparent', { r: r - 2, stroke: color, sw: 3 }),
    text(cx - 12, cy - 6, 24, pct + '%', 10, color, { center: true, bold: true }),
    text(cx - 12, cy + 4, 24, 'fresh', 8, P.muted, { center: true }),
  ];
}

// ─── SCREEN 1: TODAY'S HARVEST — dashboard ────────────────────────────────────
function screenHarvest(ox, oy) {
  const ch = [];

  // Background
  ch.push(rect(ox, oy, W, H, P.bg));
  ch.push(...statusBar(ox, oy));

  // Header — LARDER wordmark (editorial condensed style)
  ch.push(rect(ox, oy + 44, W, 56, P.bg));
  ch.push(text(ox + 20, oy + 56, 200, 'LARDER', 32, P.text, { bold: true, ls: 3, serif: false }));
  ch.push(text(ox + 20, oy + 88, 180, 'Thursday, 26 March', 12, P.muted, {}));
  ch.push(text(ox + W - 52, oy + 60, 40, '⊙', 22, P.terra));

  // Ticker strip (Lucci Lambrusco signature)
  ch.push(...tickerStrip(ox, oy + 102, [
    'Hawkstone Farm', 'Cob & Co', 'Solé Grains', 'Fernhill Dairy', 'The Salt House'
  ]));

  // Today's summary cards
  ch.push(text(ox + 20, oy + 148, W - 40, 'Today\'s Deliveries', 17, P.text, { semi: true }));

  // Big stat card — hero number
  ch.push(rect(ox + 16, oy + 174, W - 32, 92, P.terra, { r: 16 }));
  ch.push(text(ox + 28, oy + 186, 200, '14', 52, P.white, { bold: true, lh: 1.0 }));
  ch.push(text(ox + 100, oy + 190, 120, 'ingredients\narriving today', 12, 'rgba(253,252,250,0.80)', { lh: 1.4 }));
  ch.push(text(ox + 28, oy + 246, 200, '↑ 3 more than yesterday', 11, 'rgba(253,252,250,0.65)', {}));

  // Two small stats
  ch.push(rect(ox + 16, oy + 278, (W - 44) / 2, 66, P.surface, { r: 14, stroke: P.border, sw: 1 }));
  ch.push(text(ox + 28, oy + 292, 80, '6', 28, P.amber, { bold: true }));
  ch.push(text(ox + 28, oy + 322, 100, 'Suppliers\nscheduled', 10, P.textMid, { lh: 1.4 }));

  const r2x = ox + 16 + (W - 44) / 2 + 12;
  ch.push(rect(r2x, oy + 278, (W - 44) / 2, 66, P.surface, { r: 14, stroke: P.border, sw: 1 }));
  ch.push(text(r2x + 12, oy + 292, 80, '2', 28, P.clay, { bold: true }));
  ch.push(text(r2x + 12, oy + 322, 100, 'Items\nnearing end', 10, P.textMid, { lh: 1.4 }));

  // Upcoming arrivals
  ch.push(...sectionHead(ox + 20, oy + 362, 'Arriving Next'));

  const arrivals = [
    { name: 'Purple Heritage Carrots', supplier: 'Hawkstone Farm', time: '08:00', tag: 'CERTIFIED', tagColor: P.sage, tagBg: P.sageSoft },
    { name: 'White Truffle, Grade A', supplier: 'Solé Grains', time: '10:30', tag: 'PREMIUM', tagColor: P.clay, tagBg: P.claySoft },
    { name: 'Veal Sweetbreads', supplier: 'Cob & Co', time: '11:00', tag: 'CHILLED', tagColor: P.amber, tagBg: P.amberSoft },
  ];

  arrivals.forEach((a, i) => {
    const ay = oy + 390 + i * 82;
    ch.push(rect(ox + 16, ay, W - 32, 72, P.surface, { r: 14, stroke: P.border, sw: 1 }));

    // Time column — editorial left column
    ch.push(rect(ox + 16, ay, 52, 72, P.surface2, { r: 14 }));
    ch.push(rect(ox + 52, ay, 1, 72, P.border));
    ch.push(text(ox + 20, ay + 20, 44, a.time.split(':')[0], 20, P.terra, { bold: true, center: true }));
    ch.push(text(ox + 20, ay + 44, 44, ':' + a.time.split(':')[1], 11, P.muted, { center: true }));

    // Content
    ch.push(text(ox + 64, ay + 14, W - 110, a.name, 13, P.text, { semi: true }));
    ch.push(text(ox + 64, ay + 34, W - 110, a.supplier, 11, P.textMid, {}));
    ch.push(...chip(ox + 64, ay + 50, a.tag, a.tagColor, a.tagBg, { h: 16, r: 3, size: 9 }));
  });

  ch.push(...navBar(ox, oy + H - 60, 0));
  return frame(ox, oy, W, H, ch, P.bg, {});
}

// ─── SCREEN 2: SUPPLIERS DIRECTORY ────────────────────────────────────────────
function screenSuppliers(ox, oy) {
  const ch = [];
  ch.push(rect(ox, oy, W, H, P.bg));
  ch.push(...statusBar(ox, oy));

  // Header
  ch.push(text(ox + 20, oy + 54, 240, 'Suppliers', 26, P.text, { bold: true, ls: -0.3 }));
  ch.push(text(ox + 20, oy + 84, 200, '18 active partnerships', 13, P.muted, {}));

  // Search bar — styled as editorial input
  ch.push(rect(ox + 16, oy + 108, W - 32, 42, P.surface, { r: 12, stroke: P.border2, sw: 1 }));
  ch.push(text(ox + 40, oy + 119, 20, '⌕', 16, P.muted));
  ch.push(text(ox + 64, oy + 122, W - 100, 'Search farms, regions…', 13, P.muted, {}));

  // Filter chips
  const filters = ['All', 'Organic', 'Local', 'Seasonal', 'Certified'];
  let fx = ox + 16;
  filters.forEach((f, i) => {
    const fw = f.length * 7 + 18;
    const isActive = i === 0;
    ch.push(rect(fx, oy + 162, fw, 28, isActive ? P.terra : P.surface, { r: 14, stroke: isActive ? 'transparent' : P.border2, sw: 1 }));
    ch.push(text(fx + 9, oy + 168, fw - 12, f, 11, isActive ? P.white : P.textMid, { semi: true }));
    fx += fw + 8;
  });

  // Supplier cards
  const suppliers = [
    {
      name: 'Hawkstone Farm',
      region: 'Devon, UK · 34 mi',
      specialty: 'Root vegetables, heritage varieties',
      rating: '98',
      since: '2019',
      badge: 'ORGANIC',
      badgeColor: P.sage,
      badgeBg: P.sageSoft,
    },
    {
      name: 'Solé Grains & Truffles',
      region: 'Périgord, FR · Import',
      specialty: 'Truffles, rare fungi, ferments',
      rating: '97',
      since: '2021',
      badge: 'PREMIUM',
      badgeColor: P.clay,
      badgeBg: P.claySoft,
    },
    {
      name: 'Fernhill Dairy',
      region: 'Somerset, UK · 12 mi',
      specialty: 'Artisan cheese, cultured butter',
      rating: '95',
      since: '2020',
      badge: 'CERTIFIED',
      badgeColor: P.amber,
      badgeBg: P.amberSoft,
    },
    {
      name: 'Cob & Co Meats',
      region: 'Yorkshire, UK · 56 mi',
      specialty: 'Rare breed, aged beef, game',
      rating: '96',
      since: '2018',
      badge: 'HERITAGE',
      badgeColor: P.terra,
      badgeBg: P.terraSoft,
    },
  ];

  suppliers.forEach((s, i) => {
    const sy = oy + 202 + i * 110;
    ch.push(rect(ox + 16, sy, W - 32, 98, P.surface, { r: 16, stroke: P.border, sw: 1 }));

    // Colored left accent bar
    const accentColors = [P.sage, P.clay, P.amber, P.terra];
    ch.push(rect(ox + 16, sy + 14, 3, 70, accentColors[i], { r: 2 }));

    // Rating badge — right side (editorial score)
    ch.push(rect(ox + W - 52, sy + 14, 40, 40, P.bg2, { r: 10 }));
    ch.push(text(ox + W - 52, sy + 20, 40, s.rating, 18, P.terra, { bold: true, center: true }));
    ch.push(text(ox + W - 52, sy + 42, 40, 'score', 8, P.muted, { center: true }));

    // Content
    ch.push(text(ox + 30, sy + 16, W - 110, s.name, 14, P.text, { semi: true }));
    ch.push(text(ox + 30, sy + 36, W - 110, s.region, 11, P.muted, {}));
    ch.push(text(ox + 30, sy + 54, W - 110, s.specialty, 11, P.textMid, { lh: 1.3 }));
    ch.push(...chip(ox + 30, sy + 74, s.badge, s.badgeColor, s.badgeBg, { h: 18, r: 3, size: 9 }));
    ch.push(text(ox + 30 + s.badge.length * 6.5 + 36, sy + 78, 80, 'Since ' + s.since, 9, P.muted, {}));
  });

  ch.push(...navBar(ox, oy + H - 60, 1));
  return frame(ox, oy, W, H, ch, P.bg, {});
}

// ─── SCREEN 3: INGREDIENT DETAIL ──────────────────────────────────────────────
function screenIngredient(ox, oy) {
  const ch = [];
  ch.push(rect(ox, oy, W, H, P.bg));
  ch.push(...statusBar(ox, oy));

  // Back header
  ch.push(text(ox + 20, oy + 54, 40, '←', 18, P.terra));
  ch.push(text(ox + 50, oy + 56, 200, 'Ingredient Detail', 16, P.text, { semi: true }));

  // Hero — ingredient name section (KOMETA-inspired bold editorial block)
  ch.push(rect(ox + 16, oy + 88, W - 32, 130, P.terra, { r: 20 }));

  // Decorative texture layer (dots pattern)
  for (let di = 0; di < 5; di++) {
    ch.push(rect(ox + W - 60 + di * 8, oy + 90, 5, 126, 'rgba(253,252,250,0.04)', {}));
  }

  ch.push(text(ox + 28, oy + 102, W - 60, 'Purple Heritage', 13, 'rgba(253,252,250,0.65)', { ls: 0.5 }));
  ch.push(text(ox + 28, oy + 116, W - 60, 'Carrots', 38, P.white, { bold: true, ls: -0.5, lh: 1.0 }));
  ch.push(text(ox + 28, oy + 162, 160, 'Daucus carota sativus', 11, 'rgba(253,252,250,0.55)', { light: true }));

  // Badges in hero
  ch.push(...chip(ox + 28, oy + 184, 'ORGANIC', 'rgba(253,252,250,0.9)', 'rgba(253,252,250,0.18)', { h: 20, r: 10, size: 9 }));
  ch.push(...chip(ox + 112, oy + 184, 'IN SEASON', 'rgba(253,252,250,0.9)', 'rgba(253,252,250,0.18)', { h: 20, r: 10, size: 9 }));

  // Provenance section
  ch.push(...sectionHead(ox + 20, oy + 232, 'Provenance'));

  // Farm card
  ch.push(rect(ox + 16, oy + 258, W - 32, 68, P.surface, { r: 14, stroke: P.border, sw: 1 }));
  ch.push(rect(ox + 28, oy + 272, 40, 40, P.bg2, { r: 8 }));
  ch.push(text(ox + 28, oy + 278, 40, '⟁', 22, P.sage, { center: true }));
  ch.push(text(ox + 80, oy + 268, W - 120, 'Hawkstone Farm', 14, P.text, { semi: true }));
  ch.push(text(ox + 80, oy + 286, W - 120, 'Devon · 34 miles · Certified Organic', 11, P.muted, {}));
  ch.push(text(ox + 80, oy + 304, W - 120, 'Harvested 24 Mar · Lot #HF-2024-C7', 11, P.textMid, {}));

  // Quality metrics — editorial data row
  ch.push(...sectionHead(ox + 20, oy + 340, 'Quality Report'));

  const metrics = [
    { label: 'Freshness', value: '94%', color: P.sage },
    { label: 'Moisture', value: '82%', color: P.amber },
    { label: 'Brix', value: '8.2°', color: P.clay },
  ];

  metrics.forEach((m, i) => {
    const mx = ox + 16 + i * ((W - 32) / 3);
    const mw = (W - 32) / 3 - 4;
    ch.push(rect(mx, oy + 366, mw, 64, P.surface, { r: 12, stroke: P.border, sw: 1 }));
    ch.push(text(mx, oy + 378, mw, m.value, 22, m.color, { bold: true, center: true }));
    ch.push(text(mx, oy + 404, mw, m.label, 10, P.muted, { center: true }));
  });

  // Journey timeline (provenance chain)
  ch.push(...sectionHead(ox + 20, oy + 444, 'Journey'));

  const steps = [
    { label: 'Soil to Seed', date: '14 Oct', icon: '❋', color: P.sage },
    { label: 'Harvest', date: '24 Mar', icon: '⟁', color: P.amber },
    { label: 'Cold Chain', date: '24 Mar', icon: '◈', color: P.clay },
    { label: 'Your Kitchen', date: '26 Mar', icon: '⊡', color: P.terra },
  ];

  steps.forEach((s, i) => {
    const sx = ox + 20 + i * 82;
    ch.push(rect(sx, oy + 470, 60, 60, i === 3 ? P.terra : P.surface, { r: 14, stroke: i === 3 ? 'transparent' : P.border, sw: 1 }));
    ch.push(text(sx, oy + 480, 60, s.icon, 18, i === 3 ? P.white : s.color, { center: true }));
    ch.push(text(sx - 8, oy + 502, 76, s.label, 9, i === 3 ? P.terra : P.muted, { center: true, semi: i === 3 }));
    ch.push(text(sx - 8, oy + 514, 76, s.date, 8, P.muted, { center: true }));
    // Connector line
    if (i < steps.length - 1) {
      ch.push(rect(sx + 62, oy + 498, 18, 1, P.border2));
    }
  });

  // Chef's note
  ch.push(rect(ox + 16, oy + 542, W - 32, 80, P.bg2, { r: 14, stroke: P.border, sw: 1 }));
  ch.push(text(ox + 28, oy + 554, 60, '"', 32, P.terra, { bold: true }));
  ch.push(text(ox + 28, oy + 562, W - 56, 'Best roasted at 200°C with thyme and preserved lemon. Pairs beautifully with pan-seared duck.', 11, P.textMid, { lh: 1.5 }));
  ch.push(text(ox + 28, oy + 608, W - 56, '— Head Chef, notes from last season', 10, P.muted, { light: true }));

  ch.push(...navBar(ox, oy + H - 60, 0));
  return frame(ox, oy, W, H, ch, P.bg, {});
}

// ─── SCREEN 4: SEASONAL CALENDAR ──────────────────────────────────────────────
function screenCalendar(ox, oy) {
  const ch = [];
  ch.push(rect(ox, oy, W, H, P.bg));
  ch.push(...statusBar(ox, oy));

  ch.push(text(ox + 20, oy + 54, 240, 'Seasonal Calendar', 22, P.text, { bold: true }));
  ch.push(text(ox + 20, oy + 80, 200, 'What\'s peaking right now', 13, P.muted, {}));

  // Month selector — editorial pill
  ch.push(rect(ox + 16, oy + 104, W - 32, 38, P.surface, { r: 12, stroke: P.border2, sw: 1 }));
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  months.forEach((m, i) => {
    const mx = ox + 20 + i * 55;
    const isActive = i === 2;
    if (isActive) ch.push(rect(mx - 2, oy + 108, 46, 30, P.terra, { r: 8 }));
    ch.push(text(mx - 2, oy + 115, 46, m, 12, isActive ? P.white : P.muted, { center: true, semi: isActive }));
  });

  // Seasonal arc bars — horizontal bar chart (beautiful editorial grid)
  ch.push(...sectionHead(ox + 20, oy + 156, 'Peak Season — March'));

  const items = [
    { name: 'Purple Carrots', pct: 92, color: P.clay },
    { name: 'Wild Garlic',    pct: 88, color: P.sage },
    { name: 'Jersey Royals',  pct: 76, color: P.amber },
    { name: 'Blood Orange',   pct: 71, color: P.terra },
    { name: 'Rhubarb',        pct: 95, color: '#9B59B6' },
    { name: 'Morel Mushroom',  pct: 84, color: P.sand },
    { name: 'Sea Kale',        pct: 68, color: P.sage },
  ];

  items.forEach((item, i) => {
    const iy = oy + 182 + i * 54;
    ch.push(text(ox + 20, iy, W - 80, item.name, 12, P.text, { semi: true }));
    ch.push(text(ox + W - 48, iy, 40, item.pct + '%', 11, item.color, { right: true, bold: true }));

    // Track + fill bar (editorial, full-width)
    ch.push(rect(ox + 20, iy + 18, W - 40, 8, P.surface, { r: 4, stroke: P.border, sw: 1 }));
    ch.push(rect(ox + 20, iy + 18, Math.round((W - 40) * item.pct / 100), 8, item.color, { r: 4, opacity: 0.85 }));
  });

  // Coming next week section
  ch.push(rect(ox + 16, oy + 568, W - 32, 54, P.terraSoft, { r: 14, stroke: P.terra, sw: 1 }));
  ch.push(text(ox + 28, oy + 578, 20, '→', 14, P.terra, { bold: true }));
  ch.push(text(ox + 50, oy + 576, W - 80, 'Asparagus coming into peak season in 4 days', 12, P.terra, { semi: true, lh: 1.4 }));
  ch.push(text(ox + 50, oy + 600, W - 80, 'Early supplier orders recommended', 10, P.clay, {}));

  ch.push(...navBar(ox, oy + H - 60, 2));
  return frame(ox, oy, W, H, ch, P.bg, {});
}

// ─── SCREEN 5: ORDERS & PROCUREMENT ──────────────────────────────────────────
function screenOrders(ox, oy) {
  const ch = [];
  ch.push(rect(ox, oy, W, H, P.bg));
  ch.push(...statusBar(ox, oy));

  ch.push(text(ox + 20, oy + 54, 240, 'Orders', 26, P.text, { bold: true, ls: -0.3 }));
  ch.push(text(ox + 20, oy + 84, 200, 'This week', 13, P.muted, {}));

  // Week summary strip
  ch.push(rect(ox + 16, oy + 108, W - 32, 78, P.terra, { r: 18 }));

  // Three mini stats inside
  const weekStats = [
    { val: '£2,840', label: 'Spent' },
    { val: '12', label: 'Orders' },
    { val: '94%', label: 'On-time' },
  ];

  weekStats.forEach((s, i) => {
    const sx = ox + 28 + i * 110;
    if (i > 0) ch.push(rect(sx - 14, oy + 124, 1, 44, 'rgba(253,252,250,0.2)', {}));
    ch.push(text(sx, oy + 120, 100, s.val, 22, P.white, { bold: true }));
    ch.push(text(sx, oy + 148, 100, s.label, 10, 'rgba(253,252,250,0.65)', {}));
  });

  // Order list
  ch.push(...sectionHead(ox + 20, oy + 200, 'Pending'));

  const orders = [
    {
      id: '#ORD-4821',
      supplier: 'Hawkstone Farm',
      items: '3 items · 12 kg',
      total: '£186',
      status: 'CONFIRMED',
      statusColor: P.sage,
      statusBg: P.sageSoft,
      date: 'Thu 27',
    },
    {
      id: '#ORD-4820',
      supplier: 'Solé Grains',
      items: '1 item · 250 g',
      total: '£310',
      status: 'IN TRANSIT',
      statusColor: P.amber,
      statusBg: P.amberSoft,
      date: 'Thu 27',
    },
    {
      id: '#ORD-4819',
      supplier: 'Fernhill Dairy',
      items: '5 items · 8 kg',
      total: '£124',
      status: 'DELIVERED',
      statusColor: P.clay,
      statusBg: P.claySoft,
      date: 'Wed 26',
    },
  ];

  orders.forEach((o, i) => {
    const oy2 = oy + 228 + i * 106;
    ch.push(rect(ox + 16, oy2, W - 32, 94, P.surface, { r: 16, stroke: P.border, sw: 1 }));

    // Header row
    ch.push(text(ox + 28, oy2 + 16, 120, o.id, 12, P.textMid, { mono: true }));
    ch.push(text(ox + W - 70, oy2 + 14, 58, o.total, 20, P.text, { bold: true, right: true }));

    // Supplier & items
    ch.push(text(ox + 28, oy2 + 36, W - 80, o.supplier, 14, P.text, { semi: true }));
    ch.push(text(ox + 28, oy2 + 56, W - 80, o.items, 11, P.muted, {}));

    // Status + date
    ch.push(...chip(ox + 28, oy2 + 70, o.status, o.statusColor, o.statusBg, { h: 18, r: 4, size: 9 }));
    const chipW = o.status.length * 6 + 20;
    ch.push(text(ox + 28 + chipW + 8, oy2 + 72, 80, 'Delivery ' + o.date, 10, P.muted, {}));
  });

  // CTA — new order
  ch.push(rect(ox + 16, oy + 558, W - 32, 48, P.text, { r: 14 }));
  ch.push(text(ox + 16, oy + 568, W - 32, '+ Place New Order', 14, P.white, { center: true, semi: true }));

  ch.push(...navBar(ox, oy + H - 60, 3));
  return frame(ox, oy, W, H, ch, P.bg, {});
}

// ── COMPOSE ───────────────────────────────────────────────────────────────────
const totalW = W * 5 + GAP * 4;
const pen = {
  version: '2.8',
  name: 'LARDER — ingredient provenance for premium kitchens',
  width: totalW,
  height: H,
  fill: P.bg,
  children: [
    screenHarvest(0,            0),
    screenSuppliers(W + GAP,    0),
    screenIngredient((W+GAP)*2, 0),
    screenCalendar((W+GAP)*3,   0),
    screenOrders((W+GAP)*4,     0),
  ],
};

const out = path.join(__dirname, 'larder.pen');
fs.writeFileSync(out, JSON.stringify(pen, null, 2));
const n = (JSON.stringify(pen).match(/"type"/g) || []).length;
console.log(`✓ Written: ${out}`);
console.log(`  Screens: 5`);
console.log(`  Canvas:  ${totalW} × ${H}`);
console.log(`  Nodes:   ~${n}`);
console.log(`  Theme:   LIGHT — Cream #F4EFE6 + Terracotta #C84831`);
console.log(`  Inspired by: Lucci Lambrusco (siteinspire.com) + KOMETA (minimal.gallery)`);
