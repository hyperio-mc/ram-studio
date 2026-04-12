'use strict';
// cuvee-app.js — CUVÉE: Wine Discovery & Cellar Management
// Inspired by: Lucci Lambrusco (Alright Studio, featured on siteinspire Mar 26 2026)
//              and Maben (Base Design) — "Big Type, Minimal" editorial aesthetic
// Theme: LIGHT — warm parchment + deep ink + burgundy + oak

const fs   = require('fs');
const path = require('path');

const P = {
  bg:         '#F9F6F1',   // warm parchment
  bgWarm:     '#F4EEE4',   // slightly warmer
  surface:    '#FFFFFF',
  surface2:   '#F0EDE8',   // card bg
  ink:        '#1A1815',   // deep ink
  inkMid:     'rgba(26,24,21,0.60)',
  muted:      'rgba(26,24,21,0.38)',
  faint:      'rgba(26,24,21,0.10)',
  faint2:     'rgba(26,24,21,0.06)',
  burg:       '#8B2635',   // wine burgundy
  burgSoft:   'rgba(139,38,53,0.10)',
  burgMid:    'rgba(139,38,53,0.18)',
  oak:        '#C4956A',   // warm oak
  oakSoft:    'rgba(196,149,106,0.15)',
  stone:      '#D4C4AD',   // warm stone
  stoneSoft:  'rgba(212,196,173,0.30)',
  cream:      '#EEE8DE',   // warm cream
  gold:       '#B8952A',   // antique gold
  goldSoft:   'rgba(184,149,42,0.15)',
  green:      '#3A6B4A',   // vineyard green
  greenSoft:  'rgba(58,107,74,0.12)',
  border:     'rgba(26,24,21,0.10)',
  border2:    'rgba(26,24,21,0.18)',
  white:      '#FFFFFF',
};

const W = 375, H = 812, GAP = 72;
let _id = 1;
const uid = () => `el${_id++}`;

function rect(x, y, w, h, fill, opts = {}) {
  const o = { type: 'RECTANGLE', id: uid(), x, y, w, h, fill, cornerRadius: opts.r || 0, opacity: opts.opacity !== undefined ? opts.opacity : 1 };
  if (opts.stroke) { o.stroke = opts.stroke; o.strokeWidth = opts.sw || 1; }
  if (opts.shadow) o.shadow = { color: opts.shadow, x: 0, y: 4, blur: 24, spread: 0 };
  return o;
}

function text(x, y, w, content, size, color, opts = {}) {
  return {
    type: 'TEXT', id: uid(), x, y, w, content,
    fontSize: size, color,
    fontFamily: opts.serif ? 'Georgia' : opts.mono ? 'JetBrains Mono' : 'Inter',
    fontWeight: opts.bold ? 700 : opts.semi ? 600 : opts.medium ? 500 : opts.light ? 300 : 400,
    letterSpacing: opts.ls !== undefined ? opts.ls : (opts.caps ? 1.6 : opts.serif ? -0.3 : 0),
    lineHeight: opts.lh || 1.35,
    textAlign: opts.center ? 'center' : opts.right ? 'right' : 'left',
    opacity: opts.opacity || 1,
    textTransform: opts.caps ? 'uppercase' : undefined,
  };
}

function circle(cx, cy, r, fill, opts = {}) {
  return { type: 'ELLIPSE', id: uid(), x: cx - r, y: cy - r, w: r * 2, h: r * 2, fill, opacity: opts.opacity || 1 };
}

function frame(x, y, w, h, children, fill = P.bg) {
  return { type: 'FRAME', id: uid(), x, y, w, h, fill, clip: true, children };
}

function line(x1, y1, x2, y2, color, opts = {}) {
  return { type: 'LINE', id: uid(), x: x1, y: y1, x2, y2, stroke: color, strokeWidth: opts.sw || 1, opacity: opts.opacity || 1 };
}

// ─── Reusable Components ──────────────────────────────────────────────────────

function statusBar(ox, y) {
  return [
    rect(ox, y, W, 44, 'transparent'),
    text(ox + 20, y + 14, 60, '9:41', 12, P.ink, { semi: true }),
    text(ox + W - 72, y + 14, 64, '▲▲▲  ●', 11, P.inkMid, { right: true }),
  ];
}

function navBar(ox, y, activeIdx) {
  const items = [
    { icon: '◉', label: 'Discover' },
    { icon: '▤', label: 'Cellar' },
    { icon: '♥', label: 'Saved' },
    { icon: '◌', label: 'Profile' },
  ];
  const ch = [];
  ch.push(rect(ox, y, W, 60, P.surface, { stroke: P.border, sw: 0.5 }));
  // thin top border
  ch.push(rect(ox, y, W, 0.5, P.border2));
  const slotW = W / items.length;
  items.forEach((item, i) => {
    const sx = ox + i * slotW;
    const isActive = i === activeIdx;
    ch.push(text(sx, y + 8, slotW, item.icon, 18, isActive ? P.burg : P.muted, { center: true }));
    ch.push(text(sx, y + 30, slotW, item.label, 9, isActive ? P.burg : P.muted, { center: true, caps: true, ls: 0.8 }));
    if (isActive) {
      ch.push(rect(sx + slotW / 2 - 12, y, 24, 2, P.burg, { r: 1 }));
    }
  });
  return ch;
}

function pill(x, y, label, active, opts = {}) {
  const fill = active ? P.burg : (opts.light ? P.faint2 : P.cream);
  const col  = active ? P.white : P.inkMid;
  return [
    rect(x, y, opts.w || 72, 28, fill, { r: 14 }),
    text(x, y + 7, opts.w || 72, label, 11, col, { center: true, caps: true, ls: 0.8 }),
  ];
}

function scoreCircle(cx, cy, score, opts = {}) {
  const r = opts.r || 20;
  const ringFill = P.bgWarm;
  const ch = [];
  ch.push(circle(cx, cy, r, ringFill));
  ch.push(circle(cx, cy, r, 'transparent', { opacity: 1 }));
  // thin ring stroke
  ch.push({ type: 'ELLIPSE', id: uid(), x: cx - r, y: cy - r, w: r * 2, h: r * 2, fill: 'transparent', stroke: P.burg, strokeWidth: 1.5, opacity: 1 });
  ch.push(text(cx - r, cy - 8, r * 2, `${score}`, opts.fs || 16, P.burg, { center: true, bold: true, serif: true }));
  if (opts.label) ch.push(text(cx - r, cy + 8, r * 2, opts.label, 7, P.muted, { center: true, caps: true, ls: 0.8 }));
  return ch;
}

// ─── Screen 1 — Discover ─────────────────────────────────────────────────────
function screenDiscover(ox) {
  const ch = [];
  ch.push(rect(ox, 0, W, H, P.bg));

  // Status bar
  ch.push(...statusBar(ox, 0));

  // Header — editorial style
  ch.push(text(ox + 20, 56, 200, 'Cuvée', 28, P.ink, { serif: true, bold: true, ls: -1 }));
  ch.push(text(ox + 20, 88, 200, 'Wine Discovery', 11, P.inkMid, { caps: true, ls: 1.6 }));
  // Season badge
  ch.push(rect(ox + W - 84, 58, 68, 24, P.cream, { r: 12 }));
  ch.push(text(ox + W - 84, 65, 68, 'Spring 2026', 9, P.inkMid, { center: true }));

  // Thin rule
  ch.push(rect(ox + 20, 112, W - 40, 0.5, P.border2));

  // Filter pills
  ch.push(...pill(ox + 20,  124, 'All',         true,  { w: 40 }));
  ch.push(...pill(ox + 68,  124, 'Red',         false, { w: 44 }));
  ch.push(...pill(ox + 120, 124, 'White',       false, { w: 52 }));
  ch.push(...pill(ox + 180, 124, 'Sparkling',   false, { w: 72 }));
  ch.push(...pill(ox + 260, 124, 'Rosé',        false, { w: 48 }));

  // ── Hero card — Feature wine ─────────────────────
  const cardY = 168;
  const cardH = 200;
  ch.push(rect(ox + 20, cardY, W - 40, cardH, P.surface, { r: 8, shadow: 'rgba(26,24,21,0.08)' }));

  // Vintage year — BIG editorial type
  ch.push(text(ox + 28, cardY + 12, 120, '2019', 56, P.cream, { serif: true, bold: true, ls: -2 }));
  // Overlay text on year
  ch.push(text(ox + 28, cardY + 18, W - 56, 'Barolo', 20, P.ink, { serif: true, bold: true, ls: -0.5 }));
  ch.push(text(ox + 28, cardY + 42, W - 56, 'Giacomo Conterno', 11, P.inkMid, { serif: true }));
  ch.push(text(ox + 28, cardY + 58, 80, 'Piedmont, IT', 9, P.muted, { caps: true, ls: 0.8 }));

  // Score circle (right side)
  ch.push(...scoreCircle(ox + W - 56, cardY + 52, '97', { r: 26, fs: 18, label: 'Score' }));

  // Thin rule in card
  ch.push(rect(ox + 28, cardY + 128, W - 96, 0.5, P.border));

  // Tasting notes strip
  ch.push(text(ox + 28, cardY + 138, W - 100, 'Tar · Roses · Dark Cherry · Leather', 10, P.inkMid, { serif: true, lh: 1.4 }));

  // Price + action
  ch.push(text(ox + 28, cardY + 165, 80, '£186', 16, P.burg, { serif: true, bold: true }));
  ch.push(rect(ox + W - 108, cardY + 160, 80, 26, P.burg, { r: 13 }));
  ch.push(text(ox + W - 108, cardY + 167, 80, 'Add to Cellar', 9, P.white, { center: true, caps: true, ls: 0.5 }));

  // ── Section heading ──────────────────────────────
  ch.push(text(ox + 20, 390, 200, 'Trending This Season', 13, P.ink, { semi: true }));
  ch.push(text(ox + W - 60, 393, 50, 'See all →', 11, P.oak, { right: true }));

  // ── Small wine cards row ─────────────────────────
  const wines = [
    { name: 'Puligny',   sub: 'Montrachet',  year: '2021', price: '£94',  score: '94', region: 'Burgundy' },
    { name: 'Amarone',   sub: 'della Val.',  year: '2016', price: '£128', score: '96', region: 'Veneto' },
    { name: 'Grüner V.', sub: 'Smaragd',    year: '2022', price: '£52',  score: '91', region: 'Wachau' },
  ];
  const cW = 104, cH = 148;
  wines.forEach((w, i) => {
    const cx = ox + 20 + i * (cW + 10);
    const cy = 414;
    ch.push(rect(cx, cy, cW, cH, P.surface, { r: 6 }));
    // Small year in muted bg strip
    ch.push(rect(cx, cy, cW, 40, P.cream, { r: 6 }));
    ch.push(text(cx, cy + 6, cW, w.year, 22, P.stone, { center: true, serif: true, bold: true, ls: -0.5 }));
    ch.push(text(cx + 8, cy + 46, cW - 16, w.name, 11, P.ink, { semi: true, serif: true }));
    ch.push(text(cx + 8, cy + 60, cW - 16, w.sub, 9, P.inkMid, { serif: true }));
    ch.push(text(cx + 8, cy + 74, cW - 16, w.region, 8, P.muted, { caps: true, ls: 0.8 }));
    // Score pill
    ch.push(rect(cx + 8, cy + 92, 30, 18, P.burgSoft, { r: 9 }));
    ch.push(text(cx + 8, cy + 96, 30, w.score, 10, P.burg, { center: true, bold: true }));
    ch.push(text(cx + 8, cy + 122, 50, w.price, 13, P.ink, { bold: true, serif: true }));
  });

  // ── Curated banner ───────────────────────────────
  const banY = 580;
  ch.push(rect(ox + 20, banY, W - 40, 76, P.bgWarm, { r: 8, stroke: P.stone, sw: 0.5 }));
  ch.push(text(ox + 32, banY + 12, 200, 'Sommeliers\' Picks', 13, P.ink, { semi: true, serif: true }));
  ch.push(text(ox + 32, banY + 30, W - 100, 'Curated selections from leading sommeliers worldwide — updated weekly.', 10, P.inkMid, { lh: 1.5 }));
  ch.push(text(ox + 32, banY + 58, 100, 'Explore →', 11, P.burg));

  // ── Promo tag ────────────────────────────────────
  ch.push(rect(ox + 20, 680, W - 40, 60, P.surface, { r: 8 }));
  ch.push(text(ox + 32, 692, 220, 'Cellar of the Month: Château Pétrus Library', 11, P.ink, { semi: true, lh: 1.4 }));
  ch.push(text(ox + 32, 716, 200, 'Private collection · 14 bottles', 9, P.muted, { caps: true, ls: 0.8 }));
  ch.push(text(ox + W - 80, 700, 60, 'View →', 11, P.burg, { right: true }));

  // Nav
  ch.push(...navBar(ox, H - 60, 0));
  return frame(ox, 0, W, H, ch, P.bg);
}

// ─── Screen 2 — Wine Profile ──────────────────────────────────────────────────
function screenWineDetail(ox) {
  const ch = [];
  ch.push(rect(ox, 0, W, H, P.bg));
  ch.push(...statusBar(ox, 0));

  // Back + share
  ch.push(text(ox + 20, 58, 60, '← Back', 12, P.inkMid));
  ch.push(text(ox + W - 52, 58, 44, '⤴ Share', 12, P.inkMid, { right: true }));

  // ── Editorial hero type ────────────────────────────
  // MASSIVE year — the editorial big type moment
  ch.push(text(ox - 10, 80, W + 20, '2019', 110, P.cream, { serif: true, bold: true, ls: -6, center: true }));

  // Wine name overlaid on giant year
  ch.push(text(ox + 24, 112, W - 48, 'Barolo', 38, P.ink, { serif: true, bold: true, ls: -1.5 }));
  ch.push(text(ox + 24, 156, W - 48, 'Giacomo Conterno', 16, P.inkMid, { serif: true, ls: -0.3 }));

  // Region + type chips
  ch.push(rect(ox + 24, 182, 78, 22, P.cream, { r: 11 }));
  ch.push(text(ox + 24, 187, 78, 'Piedmont, IT', 9, P.inkMid, { center: true, caps: true, ls: 0.6 }));
  ch.push(rect(ox + 110, 182, 42, 22, P.cream, { r: 11 }));
  ch.push(text(ox + 110, 187, 42, 'Red', 9, P.inkMid, { center: true, caps: true, ls: 0.6 }));
  ch.push(rect(ox + 160, 182, 68, 22, P.burgSoft, { r: 11 }));
  ch.push(text(ox + 160, 187, 68, 'Nebbiolo', 9, P.burg, { center: true, caps: true, ls: 0.6 }));

  // Thin rule
  ch.push(rect(ox + 24, 216, W - 48, 0.5, P.border2));

  // Score + score bar
  ch.push(text(ox + 24, 228, 120, 'Critical Score', 9, P.muted, { caps: true, ls: 1.2 }));
  ch.push(text(ox + 24, 244, 80, '97', 44, P.burg, { serif: true, bold: true }));
  ch.push(text(ox + 72, 258, 80, '/ 100', 14, P.muted, { serif: true }));
  // Score bar
  ch.push(rect(ox + 160, 248, 160, 6, P.faint, { r: 3 }));
  ch.push(rect(ox + 160, 248, 155, 6, P.burg, { r: 3 }));

  // Thin rule
  ch.push(rect(ox + 24, 302, W - 48, 0.5, P.border));

  // Tasting notes — editorial style
  ch.push(text(ox + 24, 316, 200, 'Tasting Profile', 9, P.muted, { caps: true, ls: 1.2 }));

  const notes = [
    { flavor: 'Tar & Roses', pct: 90 },
    { flavor: 'Dark Cherry',  pct: 80 },
    { flavor: 'Leather',      pct: 70 },
    { flavor: 'Dried Herbs',  pct: 55 },
    { flavor: 'Violet',       pct: 45 },
  ];
  notes.forEach((n, i) => {
    const ny = 338 + i * 30;
    ch.push(text(ox + 24, ny + 3, 130, n.flavor, 11, P.inkMid, { serif: true }));
    ch.push(rect(ox + 160, ny + 6, 140, 4, P.faint, { r: 2 }));
    ch.push(rect(ox + 160, ny + 6, Math.round(140 * n.pct / 100), 4, P.oak, { r: 2 }));
  });

  // Thin rule
  ch.push(rect(ox + 24, 496, W - 48, 0.5, P.border));

  // Winery info
  ch.push(text(ox + 24, 510, 200, 'Winery Notes', 9, P.muted, { caps: true, ls: 1.2 }));
  ch.push(text(ox + 24, 528, W - 48, 'Giacomo Conterno is one of the greatest estates in the Langhe, producing structured Barolos built for extraordinary longevity.', 11, P.inkMid, { lh: 1.6, serif: true }));

  // Price + CTA
  ch.push(rect(ox + 24, 616, W - 48, 1, P.border));
  ch.push(text(ox + 24, 630, 120, '£186 per bottle', 20, P.ink, { serif: true, bold: true }));
  ch.push(text(ox + 24, 654, 180, 'In stock · Est. delivery 3–5 days', 10, P.muted));
  ch.push(rect(ox + 24, 678, (W - 48) / 2 - 6, 44, P.burg, { r: 22 }));
  ch.push(text(ox + 24, 692, (W - 48) / 2 - 6, 'Add to Cellar', 12, P.white, { center: true, semi: true }));
  ch.push(rect(ox + (W - 48) / 2 + 30, 678, (W - 48) / 2 - 6, 44, P.surface, { r: 22, stroke: P.border2, sw: 1.5 }));
  ch.push(text(ox + (W - 48) / 2 + 30, 692, (W - 48) / 2 - 6, '♥ Save', 12, P.ink, { center: true, semi: true }));

  ch.push(...navBar(ox, H - 60, 0));
  return frame(ox, 0, W, H, ch, P.bg);
}

// ─── Screen 3 — My Cellar ─────────────────────────────────────────────────────
function screenCellar(ox) {
  const ch = [];
  ch.push(rect(ox, 0, W, H, P.bg));
  ch.push(...statusBar(ox, 0));

  // Header
  ch.push(text(ox + 20, 56, 200, 'My Cellar', 24, P.ink, { serif: true, bold: true, ls: -0.5 }));
  ch.push(text(ox + 20, 84, W - 100, '48 bottles across 12 varieties', 11, P.inkMid));
  ch.push(rect(ox + W - 44, 60, 28, 28, P.cream, { r: 14 }));
  ch.push(text(ox + W - 44, 69, 28, '+', 16, P.burg, { center: true, bold: true }));

  // ── Cellar stats ─────────────────────────────────
  ch.push(rect(ox + 20, 114, W - 40, 82, P.surface, { r: 8 }));
  const stats = [
    { val: '48',   lbl: 'Bottles' },
    { val: '£4.2k', lbl: 'Value'  },
    { val: '12',   lbl: 'Varieties' },
    { val: '6',    lbl: 'Vintages' },
  ];
  stats.forEach((s, i) => {
    const sx = ox + 20 + i * ((W - 40) / 4);
    ch.push(text(sx, 130, (W - 40) / 4, s.val, 18, P.ink, { center: true, serif: true, bold: true }));
    ch.push(text(sx, 152, (W - 40) / 4, s.lbl, 8, P.muted, { center: true, caps: true, ls: 0.8 }));
    if (i < 3) ch.push(rect(sx + (W - 40) / 4 - 0.5, 130, 0.5, 38, P.border));
  });

  // ── Section: By Region ───────────────────────────
  ch.push(text(ox + 20, 214, 200, 'By Region', 13, P.ink, { semi: true }));
  ch.push(text(ox + W - 60, 217, 50, 'View all →', 10, P.oak, { right: true }));

  const regions = [
    { name: 'Burgundy',    count: 14, pct: 29, color: P.burg },
    { name: 'Piedmont',    count: 10, pct: 21, color: P.oak },
    { name: 'Bordeaux',    count: 9,  pct: 19, color: P.gold },
    { name: 'Loire',       count: 7,  pct: 15, color: P.green },
    { name: 'Other',       count: 8,  pct: 16, color: P.stone },
  ];
  regions.forEach((r, i) => {
    const ry = 238 + i * 40;
    ch.push(rect(ox + 20, ry + 12, 6, 16, r.color, { r: 3 }));
    ch.push(text(ox + 34, ry + 10, 130, r.name, 12, P.ink, { semi: true }));
    ch.push(text(ox + 34, ry + 24, 80, `${r.count} bottles`, 10, P.muted));
    ch.push(rect(ox + 200, ry + 16, 130, 6, P.faint, { r: 3 }));
    ch.push(rect(ox + 200, ry + 16, Math.round(130 * r.pct / 100), 6, r.color, { r: 3, opacity: 0.7 }));
    ch.push(text(ox + 338, ry + 10, 30, `${r.pct}%`, 11, P.inkMid, { right: true }));
  });

  // Thin rule
  ch.push(rect(ox + 20, 444, W - 40, 0.5, P.border));

  // ── Section: Drink Soon ─────────────────────────
  ch.push(text(ox + 20, 458, 200, 'Drink Soon', 13, P.ink, { semi: true }));
  ch.push(rect(ox + 156, 456, 40, 18, P.goldSoft, { r: 9 }));
  ch.push(text(ox + 156, 461, 40, '3 wines', 8, P.gold, { center: true, bold: true }));

  const readyWines = [
    { name: 'Meursault 1er Cru',  year: '2017', by: 'Coche-Dury',    bottles: 3 },
    { name: 'Côte-Rôtie La Mouline', year: '2015', by: 'Guigal',     bottles: 2 },
    { name: 'Priorat Terroir', year: '2018', by: 'Álvaro Palacios',  bottles: 6 },
  ];
  readyWines.forEach((w, i) => {
    const wy = 488 + i * 54;
    ch.push(rect(ox + 20, wy, W - 40, 48, P.surface, { r: 6 }));
    // Year badge
    ch.push(rect(ox + 28, wy + 12, 34, 24, P.cream, { r: 4 }));
    ch.push(text(ox + 28, wy + 17, 34, w.year, 11, P.ink, { center: true, bold: true, serif: true }));
    ch.push(text(ox + 72, wy + 10, W - 140, w.name, 11, P.ink, { semi: true, serif: true }));
    ch.push(text(ox + 72, wy + 26, W - 140, w.by, 9, P.muted));
    ch.push(rect(ox + W - 68, wy + 14, 40, 20, P.greenSoft, { r: 10 }));
    ch.push(text(ox + W - 68, wy + 19, 40, `×${w.bottles}`, 10, P.green, { center: true, bold: true }));
  });

  ch.push(...navBar(ox, H - 60, 1));
  return frame(ox, 0, W, H, ch, P.bg);
}

// ─── Screen 4 — Tasting Log ───────────────────────────────────────────────────
function screenTastingLog(ox) {
  const ch = [];
  ch.push(rect(ox, 0, W, H, P.bg));
  ch.push(...statusBar(ox, 0));

  // Header
  ch.push(text(ox + 20, 56, W - 80, 'Tasting Log', 24, P.ink, { serif: true, bold: true, ls: -0.5 }));
  ch.push(text(ox + 20, 84, W - 40, '23 tastings recorded', 11, P.inkMid));
  // Add button
  ch.push(rect(ox + W - 80, 58, 64, 28, P.burg, { r: 14 }));
  ch.push(text(ox + W - 80, 65, 64, '+ Log Wine', 10, P.white, { center: true }));

  // Month header
  ch.push(text(ox + 20, 116, 200, 'March 2026', 11, P.muted, { caps: true, ls: 1.4 }));
  ch.push(rect(ox + 20, 134, W - 40, 0.5, P.border));

  // Tasting entries
  const entries = [
    { date: '26', name: 'Barolo Cascina Francia',      winery: 'Giacomo Conterno', score: 97, color: P.burg, note: 'Profound depth, singing acidity.' },
    { date: '24', name: 'Chambolle-Musigny 1er Cru',   winery: 'Roumier',          score: 95, color: P.oak, note: 'Ethereal red fruit, silky tannin.' },
    { date: '21', name: 'Grüner Veltliner Vinothek',   winery: 'Knoll',            score: 93, color: P.green, note: 'Mineral, white pepper, stunning finish.' },
    { date: '19', name: 'Priorat Les Terrasses',        winery: 'Álvaro Palacios',  score: 91, color: P.gold, note: 'Dense, warm, with great purity.' },
  ];
  entries.forEach((e, i) => {
    const ey = 148 + i * 112;
    // Date column
    ch.push(text(ox + 20, ey + 6, 28, e.date, 22, P.stone, { serif: true, bold: true, center: true }));
    ch.push(text(ox + 20, ey + 30, 28, 'Mar', 8, P.muted, { center: true, caps: true, ls: 0.5 }));
    // Vertical line connector
    if (i < entries.length - 1) {
      ch.push(rect(ox + 33, ey + 50, 1, 62, P.border2));
    }
    // Card
    ch.push(rect(ox + 56, ey, W - 76, 96, P.surface, { r: 8 }));
    // Left accent bar
    ch.push(rect(ox + 56, ey, 3, 96, e.color, { r: 2 }));

    ch.push(text(ox + 68, ey + 12, W - 120, e.name, 12, P.ink, { semi: true, serif: true }));
    ch.push(text(ox + 68, ey + 28, W - 140, e.winery, 10, P.muted));
    ch.push(text(ox + 68, ey + 48, W - 140, `"${e.note}"`, 10, P.inkMid, { serif: true, lh: 1.5, opacity: 0.85 }));

    // Score badge
    ch.push(rect(ox + W - 56, ey + 10, 32, 32, P.burgSoft, { r: 6 }));
    ch.push(text(ox + W - 56, ey + 16, 32, `${e.score}`, 15, P.burg, { center: true, bold: true, serif: true }));
  });

  ch.push(...navBar(ox, H - 60, 2));
  return frame(ox, 0, W, H, ch, P.bg);
}

// ─── Screen 5 — Food Pairing ──────────────────────────────────────────────────
function screenPairing(ox) {
  const ch = [];
  ch.push(rect(ox, 0, W, H, P.bg));
  ch.push(...statusBar(ox, 0));

  // Header
  ch.push(text(ox + 20, 56, W - 40, 'Food Pairings', 24, P.ink, { serif: true, bold: true, ls: -0.5 }));
  ch.push(text(ox + 20, 84, W - 40, 'Matched by AI sommelier', 11, P.inkMid));

  // Search bar
  ch.push(rect(ox + 20, 110, W - 40, 40, P.surface, { r: 20, stroke: P.border2, sw: 1 }));
  ch.push(text(ox + 44, 122, W - 88, 'Search wines or dishes…', 12, P.muted));
  ch.push(text(ox + W - 48, 122, 24, '⌕', 14, P.inkMid));

  // Pairing for selected wine
  ch.push(rect(ox + 20, 162, W - 40, 56, P.bgWarm, { r: 8, stroke: P.stone, sw: 0.5 }));
  ch.push(text(ox + 32, 172, 220, 'Pairing for: Barolo 2019', 9, P.muted, { caps: true, ls: 0.8 }));
  ch.push(text(ox + 32, 186, 260, 'Giacomo Conterno · Piedmont', 13, P.ink, { serif: true, semi: true }));
  ch.push(text(ox + W - 68, 188, 50, 'Change →', 10, P.oak, { right: true }));

  // Pairing cards — editorial grid
  const pairings = [
    { dish: 'Braised Short Rib',     why: 'Rich fat mirrors tannin depth',  match: 98, emoji: '🥩' },
    { dish: 'Aged Parmigiano',       why: 'Savory crystalline umami match', match: 94, emoji: '🧀' },
    { dish: 'Black Truffle Risotto', why: 'Earthy complexity in harmony',   match: 92, emoji: '🍄' },
    { dish: 'Roast Lamb with Herbs', why: 'Classic piedmontese tradition',  match: 90, emoji: '🍖' },
  ];

  pairings.forEach((p, i) => {
    const py = 234 + i * 90;
    ch.push(rect(ox + 20, py, W - 40, 80, P.surface, { r: 8 }));
    // Emoji circle
    ch.push(circle(ox + 52, py + 40, 22, P.cream));
    ch.push(text(ox + 38, py + 28, 28, p.emoji, 22, P.ink, { center: true }));
    // Dish info
    ch.push(text(ox + 84, py + 14, W - 160, p.dish, 13, P.ink, { semi: true, serif: true }));
    ch.push(text(ox + 84, py + 32, W - 160, p.why, 10, P.inkMid, { lh: 1.5 }));
    // Match score
    ch.push(text(ox + 84, py + 54, 100, 'Pairing match', 8, P.muted, { caps: true, ls: 0.6 }));
    ch.push(rect(ox + 84, py + 66, 130, 4, P.faint, { r: 2 }));
    ch.push(rect(ox + 84, py + 66, Math.round(130 * p.match / 100), 4, P.oak, { r: 2 }));
    ch.push(text(ox + W - 52, py + 60, 32, `${p.match}%`, 12, P.oak, { right: true, bold: true }));
  });

  // Tip section
  ch.push(rect(ox + 20, 600, W - 40, 68, P.surface, { r: 8, stroke: P.border, sw: 0.5 }));
  ch.push(text(ox + 32, 612, W - 100, '💡 Sommelier Tip', 11, P.ink, { semi: true }));
  ch.push(text(ox + 32, 630, W - 64, 'Decant this Barolo for at least 3 hours. The wine opens dramatically, revealing dark plum and dried rose.', 10, P.inkMid, { lh: 1.55 }));

  ch.push(...navBar(ox, H - 60, 3));
  return frame(ox, 0, W, H, ch, P.bg);
}

// ─── Assemble ─────────────────────────────────────────────────────────────────
function buildPen() {
  const screens = [
    screenDiscover(0 * (W + GAP)),
    screenWineDetail(1 * (W + GAP)),
    screenCellar(2 * (W + GAP)),
    screenTastingLog(3 * (W + GAP)),
    screenPairing(4 * (W + GAP)),
  ];

  return {
    version: '2.8',
    meta: {
      name:       'Cuvée — Wine Discovery & Cellar',
      author:     'RAM Design Heartbeat',
      created:    new Date().toISOString(),
      description:'Editorial minimal wine app. Light theme. Big type inspired by Lucci Lambrusco (Alright Studio) and Maben (Base Design) — siteinspire featured today.',
      theme: {
        name: 'Cuvée Light',
        mode: 'light',
        bg:   P.bg,
        text: P.ink,
        accent: P.burg,
      },
    },
    canvas: {
      width:  screens.length * (W + GAP) - GAP,
      height: H,
      bg:     '#EDE9E2',
    },
    screens,
    colors: P,
  };
}

const pen = buildPen();
const out = path.join(__dirname, 'cuvee.pen');
fs.writeFileSync(out, JSON.stringify(pen, null, 2));
console.log(`✓ cuvee.pen written (${(fs.statSync(out).size / 1024).toFixed(1)} KB)`);
console.log('  Screens: Discover · Wine Detail · Cellar · Tasting Log · Food Pairings');
console.log('  Theme: LIGHT — Parchment + Ink + Burgundy + Oak');
