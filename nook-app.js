// nook-app.js — NOOK home discovery
// "find where you belong"
// Light theme — warm parchment editorial
// Inspired by RAY (land-book.com) — warm interior photography, "More than a building. It's a place."
// + Dawn (lapa.ninja) — warm emotional palette, human-first language
// + Mike Matas (godly.website) — ultra-clean device UI, show-don't-tell

import fs from 'fs';

// ─── Canvas ────────────────────────────────────────────────────────────────
const W = 375, H = 812, GAP = 80, SCREENS = 5;
const CANVAS_W = SCREENS * W + (SCREENS + 1) * GAP;

// ─── Palette ───────────────────────────────────────────────────────────────
const BG      = '#F7F0E8';   // warm parchment
const SURFACE = '#FEFCF9';   // off-white warm
const CARD    = '#FBF6F0';   // warm card surface
const TERRA   = '#C4653A';   // terracotta / adobe brick
const SAGE    = '#6B9B7A';   // muted sage green
const GOLD    = '#B8924A';   // warm amber gold
const INK     = '#1C1510';   // warm near-black
const MUTED   = 'rgba(28,21,16,0.42)';
const BORDER  = 'rgba(28,21,16,0.10)';

// ─── Node builders ─────────────────────────────────────────────────────────
let _id = 1;
const id = () => `node_${_id++}`;

function frame(name, x, y, w, h, fill, children = [], opts = {}) {
  return { type: 'FRAME', id: id(), name, x, y, width: w, height: h,
    fill: fill ?? BG, cornerRadius: opts.r ?? 0,
    strokeColor: opts.stroke ?? null, strokeWidth: opts.sw ?? 0,
    paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0,
    children };
}

function rect(name, x, y, w, h, fill, opts = {}) {
  return { type: 'RECTANGLE', id: id(), name, x, y, width: w, height: h,
    fill, cornerRadius: opts.r ?? 0,
    strokeColor: opts.stroke ?? null, strokeWidth: opts.sw ?? 0 };
}

function text(name, x, y, w, content, size, color, opts = {}) {
  return { type: 'TEXT', id: id(), name, x, y, width: w,
    content, fontSize: size, color,
    fontFamily: opts.font ?? 'DM Sans',
    fontWeight: opts.weight ?? 400,
    fontStyle:  opts.style  ?? 'normal',
    textAlign:  opts.align  ?? 'left',
    lineHeight: opts.lh     ?? 1.45,
    letterSpacing: opts.ls  ?? 0 };
}

// ─── Components ────────────────────────────────────────────────────────────

// Serif editorial number / headline
function serif(name, x, y, w, content, size, color, opts = {}) {
  return text(name, x, y, w, content, size, color, {
    font: 'Fraunces', weight: opts.weight ?? 700, style: opts.style ?? 'italic',
    lh: opts.lh ?? 1.15, ...opts });
}

// Status bar
function statusBar(x, y) {
  return [
    rect('status-bg', x, y, W, 44, 'transparent'),
    text('time', x + 20, y + 14, 60, '9:41', 13, INK, { weight: 600 }),
    text('icons', x + W - 64, y + 14, 60, '●●●', 13, INK, { align: 'right' }),
  ];
}

// Nav bar (bottom)
function navBar(ox, items) {
  const y = H - 72;
  const nodes = [rect('nav-bg', ox, y, W, 72, SURFACE, { stroke: BORDER, sw: 1 })];
  items.forEach(({ icon, label, active }, i) => {
    const x = ox + 20 + i * 67;
    nodes.push(
      rect(`nav-dot-${i}`, x + 22, y + 10, 22, 3, active ? TERRA : 'transparent', { r: 2 }),
      text(`nav-icon-${i}`, x, y + 18, 66, icon, 18, active ? TERRA : MUTED, { align: 'center' }),
      text(`nav-label-${i}`, x, y + 40, 66, label, 9, active ? TERRA : MUTED, { weight: 500, ls: 0.04, align: 'center' }),
    );
  });
  return nodes;
}

// Section label
function eyebrow(x, y, ox, content) {
  return text('eyebrow', ox + x, y, 200, content, 10, MUTED,
    { weight: 600, ls: 0.12 });
}

// Property card — warm editorial style
function propertyCard(ox, y, { name, type, hood, price, feel, tag, tagColor, w = 327, score }) {
  const cw = w;
  const nodes = [
    // Card background
    rect(`card-bg-${name}`, ox + 24, y, cw, 148, SURFACE, { r: 14, stroke: BORDER, sw: 1 }),
    // Photo placeholder — warm gradient rectangle
    rect(`photo-${name}`, ox + 24, y, cw, 90, tagColor ?? TERRA, { r: 14 }),
    // Photo gradient overlay (bottom fade) — lighter tone
    rect(`photo-fade-${name}`, ox + 24, y + 50, cw, 40,
      'rgba(28,21,16,0.30)', { r: 0 }),
    // Tag pill
    rect(`tag-bg-${name}`, ox + 34, y + 8, 70, 20, 'rgba(255,255,255,0.85)', { r: 10 }),
    text(`tag-${name}`, ox + 38, y + 12, 62, tag, 10, INK, { weight: 600 }),
    // Price on photo
    text(`price-${name}`, ox + W - 90, y + 65, 70, price, 13, SURFACE, { weight: 600, align: 'right' }),
    // Bottom row
    text(`name-${name}`, ox + 34, y + 98, 200, name, 14, INK, { weight: 600 }),
    text(`type-${name}`, ox + 34, y + 116, 200, type, 11, MUTED ),
    text(`hood-${name}`, ox + 34, y + 130, 200, hood, 11, SAGE, { weight: 500 }),
    // Feel score
    text(`feel-${name}`, ox + W - 64, y + 100, 50, `${score ?? feel}`, 11, TERRA, { weight: 600, align: 'right' }),
    text(`feel-label-${name}`, ox + W - 64, y + 116, 52, 'feel score', 9, MUTED, { align: 'right' }),
  ];
  return nodes;
}

// Feel chip
function feelChip(ox, x, y, label, active) {
  const w = label.length * 7.5 + 20;
  return [
    rect(`chip-bg-${label}`, ox + x, y, w, 28, active ? TERRA : CARD, { r: 14, stroke: active ? 'transparent' : BORDER, sw: 1 }),
    text(`chip-${label}`, ox + x + 10, y + 7, w - 20, label, 11, active ? '#FEFCF9' : INK, { weight: 500 }),
  ];
}

// Attribute pill
function attrPill(ox, x, y, icon, label, color) {
  const w = label.length * 7 + 34;
  return [
    rect(`attr-bg-${label}`, ox + x, y, w, 24, color + '20', { r: 12 }),
    text(`attr-icon-${label}`, ox + x + 8, y + 4, 14, icon, 11, color),
    text(`attr-${label}`, ox + x + 22, y + 5, w - 26, label, 10, color, { weight: 500 }),
  ];
}

// Feel score bar
function feelBar(ox, x, y, label, pct, color) {
  return [
    text(`fb-label-${label}`, ox + x, y, 80, label, 11, INK, { weight: 400 }),
    rect(`fb-track-${label}`, ox + x + 82, y + 3, 160, 6, BORDER, { r: 3 }),
    rect(`fb-fill-${label}`, ox + x + 82, y + 3, Math.round(160 * pct), 6, color, { r: 3 }),
    text(`fb-pct-${label}`, ox + x + 248, y, 30, `${Math.round(pct * 100)}`, 11, MUTED, { align: 'right' }),
  ];
}

// Saved card (compact)
function savedCard(ox, y, { name, hood, price, score, idx }) {
  return [
    rect(`saved-card-${idx}`, ox + 24, y, 327, 68, SURFACE, { r: 12, stroke: BORDER, sw: 1 }),
    rect(`saved-photo-${idx}`, ox + 24, y, 68, 68, idx === 0 ? TERRA : idx === 1 ? SAGE : GOLD, { r: 12 }),
    text(`saved-name-${idx}`, ox + 102, y + 12, 160, name, 13, INK, { weight: 600 }),
    text(`saved-hood-${idx}`, ox + 102, y + 30, 160, hood, 11, MUTED ),
    text(`saved-price-${idx}`, ox + 102, y + 48, 100, price, 11, SAGE, { weight: 500 }),
    text(`saved-score-${idx}`, ox + W - 46, y + 16, 40, `${score}`, 16, TERRA, { weight: 700, font: 'Fraunces', style: 'italic', align: 'right' }),
    text(`saved-slbl-${idx}`, ox + W - 50, y + 36, 44, 'feel', 9, MUTED, { align: 'right' }),
  ];
}

// ─── Screens ───────────────────────────────────────────────────────────────

function screenX(i) { return GAP + i * (W + GAP); }

// SCREEN 1 — Home / Today's picks
function s1(ox) {
  const nodes = [
    rect('bg1', ox, 0, W, H, BG),
    ...statusBar(ox, 0),

    // Greeting
    serif('greeting', ox + 24, 58, 280, 'Good morning,\nAiko.', 30, INK, { weight: 700 }),
    text('date', ox + 24, 126, 220, 'Friday · March 27 · Dalston', 12, MUTED),

    // "How do you want to feel?" prompt
    rect('feel-card', ox + 24, 150, 327, 68, TERRA + '14', { r: 16 }),
    text('feel-q', ox + 38, 163, 260, 'How do you want to feel at home?', 12, INK, { weight: 500 }),
    ...feelChip(ox, 14, 185, 'Cosy', true),
    ...feelChip(ox, 80, 185, 'Airy', false),
    ...feelChip(ox, 136, 185, 'Minimal', false),
    ...feelChip(ox, 210, 185, 'Social', false),

    // Section label
    eyebrow(24, 234, ox, 'PICKED FOR YOU · 3 MATCHES'),

    // Property card 1
    ...propertyCard(ox, 250, {
      name: 'Marlowe Flat', type: '1 bed · 2nd floor', hood: 'Dalston, E8',
      price: '£1,850 /mo', tag: '✦ Perfect feel', tagColor: '#7A5A3A',
      w: 327, score: 94,
    }),
    // Property card 2 (partial, peeks at bottom)
    ...propertyCard(ox, 414, {
      name: 'Linden Studio', type: 'Studio · Ground floor', hood: 'London Fields, E8',
      price: '£1,320 /mo', tag: 'Airy + Quiet', tagColor: SAGE,
      w: 327, score: 88,
    }),

    // Bottom nav
    ...navBar(ox, [
      { icon: '⌂', label: 'HOME',    active: true  },
      { icon: '⊞', label: 'BROWSE',  active: false },
      { icon: '♡', label: 'SAVED',   active: false },
      { icon: '◉', label: 'PROFILE', active: false },
      { icon: '✉', label: 'INBOX',   active: false },
    ]),
  ];
  return nodes;
}

// SCREEN 2 — Browse / Search
function s2(ox) {
  const nodes = [
    rect('bg2', ox, 0, W, H, BG),
    ...statusBar(ox, 0),

    // Header
    text('browse-title', ox + 24, 54, 200, 'Browse', 26, INK, { font: 'Fraunces', weight: 700, style: 'italic' }),
    text('browse-sub', ox + 24, 86, 240, 'Dalston & London Fields · 24 homes', 12, MUTED),

    // Search bar
    rect('search-bg', ox + 24, 110, 327, 40, SURFACE, { r: 12, stroke: BORDER, sw: 1 }),
    text('search-icon', ox + 38, 122, 20, '⌕', 14, MUTED),
    text('search-text', ox + 58, 122, 200, 'Area, street or postcode', 13, MUTED),

    // Feel filter row
    ...feelChip(ox, 24, 162, 'All feels', true),
    ...feelChip(ox, 113, 162, 'Cosy', false),
    ...feelChip(ox, 168, 162, 'Airy', false),
    ...feelChip(ox, 222, 162, 'Quiet', false),
    ...feelChip(ox, 282, 162, 'Character', false),

    // Size row
    eyebrow(24, 204, ox, 'SIZE'),
    ...feelChip(ox, 24, 218, 'Any', true),
    ...feelChip(ox, 67, 218, 'Studio', false),
    ...feelChip(ox, 128, 218, '1 bed', false),
    ...feelChip(ox, 185, 218, '2 bed', false),
    ...feelChip(ox, 244, 218, '3+ bed', false),

    // Section label
    eyebrow(24, 260, ox, '24 HOMES · SORTED BY FEEL MATCH'),

    // Card list
    ...propertyCard(ox, 278, {
      name: 'Marlowe Flat', type: '1 bed · Dalston E8', hood: 'Dalston, E8',
      price: '£1,850 /mo', tag: '✦ 94 feel score', tagColor: '#7A5A3A',
      w: 327, score: 94,
    }),
    ...propertyCard(ox, 442, {
      name: 'Rowan House', type: '2 bed · Top floor', hood: 'Hackney Central, E9',
      price: '£2,200 /mo', tag: '91 feel score', tagColor: TERRA,
      w: 327, score: 91,
    }),
    ...propertyCard(ox, 606, {
      name: 'Linden Studio', type: 'Studio · Ground', hood: 'London Fields, E8',
      price: '£1,320 /mo', tag: '88 feel score', tagColor: SAGE,
      w: 327, score: 88,
    }),

    // Bottom nav
    ...navBar(ox, [
      { icon: '⌂', label: 'HOME',    active: false },
      { icon: '⊞', label: 'BROWSE',  active: true  },
      { icon: '♡', label: 'SAVED',   active: false },
      { icon: '◉', label: 'PROFILE', active: false },
      { icon: '✉', label: 'INBOX',   active: false },
    ]),
  ];
  return nodes;
}

// SCREEN 3 — Listing detail
function s3(ox) {
  const nodes = [
    rect('bg3', ox, 0, W, H, BG),

    // Hero photo area (warm terracotta)
    rect('listing-photo', ox, 0, W, 240, '#8B5A3A'),
    // Overlay gradient
    rect('listing-fade', ox, 180, W, 60, 'rgba(28,21,16,0.40)', { r: 0 }),
    // Back button
    rect('back-btn', ox + 20, 52, 36, 36, 'rgba(255,255,255,0.85)', { r: 18 }),
    text('back-arrow', ox + 30, 62, 16, '←', 14, INK),
    // Save button
    rect('save-btn', ox + W - 56, 52, 36, 36, 'rgba(255,255,255,0.85)', { r: 18 }),
    text('save-icon', ox + W - 47, 62, 20, '♡', 14, INK),
    // Price on photo
    text('listing-price', ox + 24, 195, 200, '£1,850 /mo', 18, SURFACE, { weight: 700, font: 'Fraunces', style: 'italic' }),

    // Title block
    serif('listing-name', ox + 24, 256, 280, 'Marlowe Flat', 24, INK, { weight: 700 }),
    text('listing-type', ox + 24, 286, 240, '1 bedroom · 2nd floor · Dalston, E8', 12, MUTED),

    // Attribute pills
    ...attrPill(ox, 24, 310, '☀', 'Bright', GOLD),
    ...attrPill(ox, 84, 310, '◑', 'Quiet', SAGE),
    ...attrPill(ox, 148, 310, '⌘', 'Period features', TERRA),
    ...attrPill(ox, 250, 310, '⊙', '12 min to city', INK),

    // Feel score breakdown
    eyebrow(24, 346, ox, 'FEEL SCORE · 94 / 100'),
    ...feelBar(ox, 24, 364, 'Light', 0.91, GOLD),
    ...feelBar(ox, 24, 384, 'Quiet', 0.85, SAGE),
    ...feelBar(ox, 24, 404, 'Space', 0.88, TERRA),
    ...feelBar(ox, 24, 424, 'Character', 0.97, '#9B6B9A'),
    ...feelBar(ox, 24, 444, 'Walkability', 0.93, '#4A8CB0'),

    // Description
    eyebrow(24, 476, ox, 'ABOUT THIS HOME'),
    text('listing-desc', ox + 24, 492, 327, 'A first-floor Victorian conversion with original cornicing and high ceilings. South-facing bay window floods the living room with light from 9am.', 12, MUTED, { lh: 1.7 }),

    // CTA
    rect('cta-bg', ox + 24, 590, 327, 48, TERRA, { r: 14 }),
    text('cta-text', ox + 24, 604, 327, 'Arrange a viewing', 15, SURFACE, { weight: 600, align: 'center' }),
    rect('ghost-bg', ox + 24, 648, 327, 44, 'transparent', { r: 14, stroke: BORDER, sw: 1 }),
    text('ghost-text', ox + 24, 660, 327, 'Ask a question', 14, INK, { weight: 500, align: 'center' }),

    ...navBar(ox, [
      { icon: '⌂', label: 'HOME',    active: false },
      { icon: '⊞', label: 'BROWSE',  active: true  },
      { icon: '♡', label: 'SAVED',   active: false },
      { icon: '◉', label: 'PROFILE', active: false },
      { icon: '✉', label: 'INBOX',   active: false },
    ]),
  ];
  return nodes;
}

// SCREEN 4 — Saved / Shortlist
function s4(ox) {
  const nodes = [
    rect('bg4', ox, 0, W, H, BG),
    ...statusBar(ox, 0),

    serif('saved-title', ox + 24, 54, 240, 'Your\nshortlist.', 30, INK, { weight: 700 }),
    text('saved-sub', ox + 24, 116, 240, '3 homes saved · updated today', 12, MUTED),

    // Compare toggle
    rect('compare-bg', ox + W - 100, 58, 76, 28, TERRA + '18', { r: 14 }),
    text('compare-text', ox + W - 96, 67, 68, 'Compare', 11, TERRA, { weight: 600 }),

    eyebrow(24, 152, ox, 'SHORTLISTED HOMES'),
    // Saved cards
    ...savedCard(ox, 170, { name: 'Marlowe Flat', hood: 'Dalston, E8', price: '£1,850 /mo', score: 94, idx: 0 }),
    ...savedCard(ox, 250, { name: 'Rowan House', hood: 'Hackney Central', price: '£2,200 /mo', score: 91, idx: 1 }),
    ...savedCard(ox, 330, { name: 'Linden Studio', hood: 'London Fields, E8', price: '£1,320 /mo', score: 88, idx: 2 }),

    // Notes section
    eyebrow(24, 412, ox, 'YOUR NOTES'),
    rect('notes-bg', ox + 24, 428, 327, 68, SURFACE, { r: 12, stroke: BORDER, sw: 1 }),
    text('notes-text', ox + 38, 442, 295, '"Marlowe has the light we want — ask about the storage and whether the upstairs neighbours are quiet."', 11, INK, { lh: 1.65 }),

    // Viewing reminders
    eyebrow(24, 510, ox, 'VIEWINGS'),
    rect('viewing-card', ox + 24, 526, 327, 56, TERRA + '12', { r: 12 }),
    text('viewing-addr', ox + 38, 540, 220, 'Marlowe Flat — Dalston', 13, INK, { weight: 600 }),
    text('viewing-time', ox + 38, 558, 220, 'Tomorrow · 10:30am · confirmed', 11, MUTED),
    rect('viewing-dot', ox + W - 38, 548, 10, 10, TERRA, { r: 5 }),

    rect('viewing-card2', ox + 24, 592, 327, 56, SAGE + '18', { r: 12 }),
    text('viewing-addr2', ox + 38, 606, 220, 'Rowan House — Hackney', 13, INK, { weight: 600 }),
    text('viewing-time2', ox + 38, 624, 220, 'Saturday · 2:00pm · pending', 11, MUTED),
    rect('viewing-dot2', ox + W - 38, 612, 10, 10, SAGE, { r: 5 }),

    // Bottom nav
    ...navBar(ox, [
      { icon: '⌂', label: 'HOME',    active: false },
      { icon: '⊞', label: 'BROWSE',  active: false },
      { icon: '♡', label: 'SAVED',   active: true  },
      { icon: '◉', label: 'PROFILE', active: false },
      { icon: '✉', label: 'INBOX',   active: false },
    ]),
  ];
  return nodes;
}

// SCREEN 5 — Profile / Home Wish
function s5(ox) {
  const nodes = [
    rect('bg5', ox, 0, W, H, BG),
    ...statusBar(ox, 0),

    // Avatar
    rect('avatar-circle', ox + 24, 54, 52, 52, TERRA + '30', { r: 26 }),
    text('avatar-init', ox + 24, 68, 52, 'AI', 20, TERRA, { weight: 700, align: 'center', font: 'Fraunces' }),
    serif('profile-name', ox + 86, 60, 200, 'Aiko Inoue', 18, INK, { weight: 700 }),
    text('profile-sub', ox + 86, 82, 200, 'Looking in East London · Move by May', 11, MUTED),

    // Move deadline
    rect('deadline-strip', ox + 24, 118, 327, 44, TERRA + '14', { r: 12 }),
    text('deadline-lbl', ox + 38, 128, 160, 'Move-in target', 11, TERRA, { weight: 600 }),
    text('deadline-date', ox + 38, 144, 200, 'May 1, 2026 · 35 days away', 11, INK, { weight: 500 }),
    rect('deadline-dot', ox + W - 38, 134, 10, 10, TERRA, { r: 5 }),

    // Your feel profile
    eyebrow(24, 176, ox, 'YOUR FEEL PROFILE'),
    // Five preference bars
    ...feelBar(ox, 24, 194, 'Light', 0.90, GOLD),
    ...feelBar(ox, 24, 214, 'Quiet', 0.80, SAGE),
    ...feelBar(ox, 24, 234, 'Space', 0.60, TERRA),
    ...feelBar(ox, 24, 254, 'Character', 0.95, '#9B6B9A'),
    ...feelBar(ox, 24, 274, 'Walkability', 0.85, '#4A8CB0'),

    // Must-haves
    eyebrow(24, 306, ox, 'MUST-HAVES'),
    ...feelChip(ox, 24, 322, 'South-facing', false),
    ...feelChip(ox, 142, 322, 'Period features', false),
    ...feelChip(ox, 256, 322, 'Quiet street', false),
    ...feelChip(ox, 24, 358, 'Within 15 min city', false),
    ...feelChip(ox, 170, 358, 'Outdoor space', false),

    // Activity
    eyebrow(24, 394, ox, 'YOUR SEARCH'),
    text('activity-stat', ox + 24, 410, 327, '3 shortlisted  ·  2 viewings arranged  ·  18 browsed', 12, MUTED),

    // Match quality meter
    rect('match-bg', ox + 24, 434, 327, 72, SURFACE, { r: 14, stroke: BORDER, sw: 1 }),
    text('match-label', ox + 38, 448, 200, 'Match quality', 12, INK, { weight: 500 }),
    text('match-sub', ox + 38, 466, 240, 'Nook found 3 strong matches (94+ feel score)\nin your preferred areas.', 11, MUTED, { lh: 1.55 }),
    text('match-score', ox + W - 52, 450, 50, '94+', 18, TERRA, { weight: 700, font: 'Fraunces', style: 'italic', align: 'right' }),

    // Recently active
    eyebrow(24, 522, ox, 'RECENTLY ACTIVE'),
    text('activity-1', ox + 24, 538, 327, '◦ Marlowe Flat · viewed 3 times this week', 12, MUTED, { lh: 1.6 }),
    text('activity-2', ox + 24, 558, 327, '◦ Rowan House · viewing confirmed for Sat', 12, MUTED, { lh: 1.6 }),
    text('activity-3', ox + 24, 578, 327, '◦ 6 new matches since you last opened the app', 12, MUTED, { lh: 1.6 }),

    // Settings strip
    rect('settings-strip', ox + 24, 600, 327, 40, CARD, { r: 12, stroke: BORDER, sw: 1 }),
    text('settings-text', ox + 38, 612, 200, 'Edit preferences & alerts →', 12, INK, { weight: 500 }),

    // Bottom nav
    ...navBar(ox, [
      { icon: '⌂', label: 'HOME',    active: false },
      { icon: '⊞', label: 'BROWSE',  active: false },
      { icon: '♡', label: 'SAVED',   active: false },
      { icon: '◉', label: 'PROFILE', active: true  },
      { icon: '✉', label: 'INBOX',   active: false },
    ]),
  ];
  return nodes;
}

// ─── Assemble ──────────────────────────────────────────────────────────────

const children = [
  ...s1(screenX(0)),
  ...s2(screenX(1)),
  ...s3(screenX(2)),
  ...s4(screenX(3)),
  ...s5(screenX(4)),
];

const pen = {
  version: '2.8',
  name: 'NOOK — find where you belong',
  width: CANVAS_W,
  height: H,
  fill: '#E8E0D8',
  children,
};

fs.writeFileSync('nook.pen', JSON.stringify(pen, null, 2));
console.log(`✅ nook.pen written — ${children.length} nodes, ${SCREENS} screens, ${CANVAS_W}×${H}`);
