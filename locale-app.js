'use strict';
// locale-app.js — Pencil.dev pen generator for LOCALE
// LOCALE — Discover your neighborhood's hidden gems
// Theme: LIGHT — warm parchment + terracotta + sage
// Inspired by: "Idle Hour Matcha" (land-book.com) artisanal/warm aesthetic
//              "Good Fella" editorial layouts (awwwards.com)
//              "Voy" health-companion warm palettes (land-book.com)

const fs   = require('fs');
const path = require('path');

// ── PALETTE ───────────────────────────────────────────────────────────────────
const P = {
  bg:         '#F5F0E8',   // warm parchment/cream
  surface:    '#FFFFFF',   // clean white cards
  surfaceWarm:'#FDF8F2',   // very warm white for alt surfaces
  border:     'rgba(192,90,40,0.12)',
  borderSub:  'rgba(26,21,16,0.08)',
  text:       '#1A1510',   // dark warm brown
  textMuted:  'rgba(26,21,16,0.45)',
  textSub:    'rgba(26,21,16,0.62)',
  accent:     '#C05A28',   // terracotta / burnt orange
  accentDim:  'rgba(192,90,40,0.10)',
  accent2:    '#5C7040',   // sage / olive green
  accent2Dim: 'rgba(92,112,64,0.12)',
  yellow:     '#D4A017',   // warm amber for stars
  tag:        '#E8E2D8',   // warm grey tag bg
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
let uid = 1;
const id  = () => `e${uid++}`;
const px  = v => typeof v === 'number' ? v : v;

const view = (x, y, w, h, children = [], style = {}) => ({
  id: id(), type: 'view',
  layout: { x, y, width: w, height: h },
  style: { backgroundColor: 'transparent', borderRadius: 0, ...style },
  children,
});

const card = (x, y, w, h, bg = P.surface, radius = 16, border) => ({
  id: id(), type: 'view',
  layout: { x, y, width: w, height: h },
  style: {
    backgroundColor: bg,
    borderRadius: radius,
    border: border || `1px solid ${P.borderSub}`,
    shadowColor: 'rgba(26,21,16,0.06)',
    shadowOffsetX: 0, shadowOffsetY: 2,
    shadowBlur: 12, shadowSpread: 0,
  },
  children: [],
});

const row = (x, y, w, h, bg = 'transparent') => ({
  id: id(), type: 'view',
  layout: { x, y, width: w, height: h },
  style: { backgroundColor: bg, borderRadius: 0, border: 'none' },
  children: [],
});

const text = (x, y, w, h, content, style = {}) => ({
  id: id(), type: 'text',
  layout: { x, y, width: w, height: h },
  style: {
    color: P.text,
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'SF Pro Text',
    letterSpacing: 0,
    lineHeight: 1.4,
    ...style,
  },
  content,
});

const rect = (x, y, w, h, bg, radius = 0) => ({
  id: id(), type: 'view',
  layout: { x, y, width: w, height: h },
  style: { backgroundColor: bg, borderRadius: radius, border: 'none' },
  children: [],
});

const circle = (x, y, r, bg) => ({
  id: id(), type: 'view',
  layout: { x: x - r, y: y - r, width: r * 2, height: r * 2 },
  style: { backgroundColor: bg, borderRadius: r, border: 'none' },
  children: [],
});

const pill = (x, y, label, bg, color, w = 70, h = 24, r = 12) => ({
  id: id(), type: 'view',
  layout: { x, y, width: w, height: h },
  style: { backgroundColor: bg, borderRadius: r, border: 'none' },
  children: [
    text(0, 0, w, h, label, {
      fontSize: 10, fontWeight: '600', color,
      textAlign: 'center', letterSpacing: 0.3,
    }),
  ],
});

const icon = (x, y, size, color, shape = 'circle') => ({
  id: id(), type: 'view',
  layout: { x, y, width: size, height: size },
  style: {
    backgroundColor: color,
    borderRadius: shape === 'circle' ? size / 2 : size * 0.2,
    border: 'none',
  },
  children: [],
});

const divider = (x, y, w) => rect(x, y, w, 1, P.borderSub);

const starRow = (x, y, rating, count) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(rect(x + i * 14, y, 11, 11, i < Math.floor(rating) ? P.yellow : P.tag, 2));
  }
  stars.push(text(x + 5 * 14, y - 1, 60, 13, `${rating} (${count})`, {
    fontSize: 11, color: P.textMuted,
  }));
  return stars;
};

const statusBar = (bg = P.bg) => ({
  id: id(), type: 'view',
  layout: { x: 0, y: 0, width: 393, height: 50 },
  style: { backgroundColor: bg, borderRadius: 0, border: 'none', time: '09:41', color: P.text },
  children: [],
});

const navBar = (activeIdx = 0) => {
  const labels = ['Discover', 'Nearby', 'Events', 'Saved'];
  const icons  = ['✦', '◎', '◇', '♡'];
  const items  = labels.map((lbl, i) => {
    const active = i === activeIdx;
    const x = 16 + i * 90;
    return [
      text(x, 10, 60, 16, icons[i], {
        fontSize: 16, textAlign: 'center',
        color: active ? P.accent : P.textMuted,
      }),
      text(x, 28, 60, 12, lbl, {
        fontSize: 9, textAlign: 'center', fontWeight: active ? '600' : '400',
        color: active ? P.accent : P.textMuted, letterSpacing: 0.2,
      }),
    ];
  }).flat();

  return {
    id: id(), type: 'view',
    layout: { x: 0, y: 787, width: 393, height: 85 },
    style: {
      backgroundColor: P.surface,
      borderRadius: 0,
      border: `1px solid ${P.borderSub}`,
      borderBottom: 'none',
    },
    children: [
      ...items,
      // active indicator bar
      rect(16 + activeIdx * 90 + 4, 4, 52, 3, P.accent, 2),
    ],
  };
};

// ── IMAGE PLACEHOLDER ─────────────────────────────────────────────────────────
const imgPlaceholder = (x, y, w, h, color1, color2, radius = 12) => ({
  id: id(), type: 'view',
  layout: { x, y, width: w, height: h },
  style: {
    backgroundColor: color1,
    borderRadius: radius,
    border: 'none',
    background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
  },
  children: [],
});

// ── SCREEN: DISCOVER ──────────────────────────────────────────────────────────
function screenDiscover() {
  const elems = [];

  // Status bar
  elems.push(statusBar(P.bg));

  // Header
  elems.push(text(20, 58, 280, 28, 'Good morning, Maya', {
    fontSize: 22, fontWeight: '700', color: P.text,
    fontFamily: 'SF Pro Display',
  }));
  elems.push(text(20, 88, 240, 16, 'Dalston, London · Sunny 18°', {
    fontSize: 12, color: P.textMuted,
  }));

  // Search bar
  const srch = card(20, 112, 313, 44, P.surface, 22, `1px solid ${P.borderSub}`);
  srch.children.push(
    text(48, 14, 220, 16, 'Search spots, cafés, events…', {
      fontSize: 13, color: P.textMuted,
    }),
    rect(16, 14, 16, 16, P.textMuted, 8),
  );
  elems.push(srch);
  // Filter icon
  const filterBtn = card(341, 112, 44, 44, P.accent, 22, 'none');
  filterBtn.children.push(
    text(0, 0, 44, 44, '⊞', { fontSize: 16, color: '#FFF', textAlign: 'center' }),
  );
  elems.push(filterBtn);

  // Category chips
  const cats = ['☕ Cafés', '🍜 Eats', '🌿 Markets', '🎨 Arts', '🍷 Bars'];
  cats.forEach((cat, i) => {
    const active = i === 0;
    const w = [72, 60, 80, 60, 60][i];
    elems.push(pill(
      20 + [0, 80, 148, 236, 304][i], 172,
      cat,
      active ? P.accent : P.tag,
      active ? '#FFF' : P.text,
      w, 30, 15,
    ));
  });

  // Section label
  elems.push(text(20, 216, 200, 18, 'Featured Spots', {
    fontSize: 15, fontWeight: '700', color: P.text,
  }));
  elems.push(text(300, 216, 73, 18, 'See all →', {
    fontSize: 12, color: P.accent, textAlign: 'right',
  }));

  // Hero spot card (large)
  const heroCard = card(20, 242, 353, 200, P.surface, 20, 'none');
  heroCard.children.push(
    imgPlaceholder(0, 0, 353, 200, '#D4A882', '#B87A52', 20),
    // overlay bottom gradient
    {
      id: id(), type: 'view',
      layout: { x: 0, y: 110, width: 353, height: 90 },
      style: {
        backgroundColor: 'transparent',
        background: 'linear-gradient(180deg, transparent 0%, rgba(26,16,8,0.72) 100%)',
        borderRadius: 0, border: 'none',
        borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
      },
      children: [],
    },
    text(16, 120, 220, 20, 'Idle Hour Coffee Roasters', {
      fontSize: 16, fontWeight: '700', color: '#FFF',
    }),
    text(16, 142, 200, 14, 'Artisan café · 0.3 mi away', {
      fontSize: 11, color: 'rgba(255,255,255,0.75)',
    }),
    pill(260, 118, '4.9 ★', P.yellow, '#1A1510', 56, 24, 12),
    pill(16, 160, 70, 22, 'Open now', 'rgba(92,112,64,0.85)', '#C8E6A0', 70, 22, 11),
  );
  elems.push(heroCard);

  // Two small cards in a row
  const spots = [
    { name: 'Petite Maison', type: 'French bistro', dist: '0.5 mi', rating: '4.7', color1: '#C8A882', color2: '#A07850' },
    { name: 'Spice Route', type: 'Indian fusion', dist: '0.7 mi', rating: '4.6', color1: '#A8C4A0', color2: '#7A9872' },
  ];
  spots.forEach((s, i) => {
    const sc = card(20 + i * 181, 458, 172, 130, P.surface, 16, `1px solid ${P.borderSub}`);
    sc.children.push(
      imgPlaceholder(0, 0, 172, 75, s.color1, s.color2, 16),
      text(12, 83, 120, 16, s.name, { fontSize: 12, fontWeight: '700' }),
      text(12, 100, 100, 13, s.type, { fontSize: 10, color: P.textMuted }),
      text(12, 113, 100, 12, s.dist, { fontSize: 9, color: P.textMuted }),
      pill(118, 80, s.rating + ' ★', P.accentDim, P.accent, 48, 22, 11),
    );
    elems.push(sc);
  });

  // "Trending nearby" label
  elems.push(text(20, 600, 200, 18, 'Trending This Week', {
    fontSize: 15, fontWeight: '700', color: P.text,
  }));

  // Three trending rows
  const trending = [
    { name: 'The Bread Shelf', tag: 'Bakery', rating: '4.8', dist: '1.1 mi' },
    { name: 'Fernwood Garden Bar', tag: 'Bar', rating: '4.5', dist: '0.9 mi' },
    { name: 'Sunday Market LDN', tag: 'Market', rating: '4.7', dist: '1.4 mi' },
  ];
  trending.forEach((t, i) => {
    const y = 626 + i * 52;
    const tr = row(20, y, 353, 44);
    tr.children.push(
      imgPlaceholder(0, 4, 38, 38, ['#D4B8A0','#B8D4C0','#D4C8A0'][i], ['#B08060','#88B098','#B0A060'][i], 10),
      text(50, 4, 200, 18, t.name, { fontSize: 13, fontWeight: '600' }),
      text(50, 24, 160, 14, `${t.tag} · ${t.dist}`, { fontSize: 10, color: P.textMuted }),
      text(290, 4, 63, 18, t.rating + ' ★', { fontSize: 12, color: P.accent, textAlign: 'right', fontWeight: '600' }),
    );
    tr.children.push(divider(0, 44, 353));
    elems.push(tr);
  });

  // Bottom nav
  elems.push(navBar(0));

  return {
    id: id(), type: 'frame',
    name: 'Discover',
    layout: { x: 0, y: 0, width: 393, height: 872 },
    style: { backgroundColor: P.bg },
    children: elems,
  };
}

// ── SCREEN: NEARBY ─────────────────────────────────────────────────────────────
function screenNearby() {
  const elems = [];
  elems.push(statusBar(P.bg));

  // Header
  elems.push(text(20, 58, 250, 26, 'Nearby', {
    fontSize: 24, fontWeight: '700', color: P.text, fontFamily: 'SF Pro Display',
  }));
  elems.push(text(20, 86, 260, 16, 'Showing 24 spots within 1 mile', {
    fontSize: 12, color: P.textMuted,
  }));

  // Map area placeholder
  const mapCard = card(20, 112, 353, 220, P.surfaceWarm, 20, 'none');
  mapCard.style.background = 'linear-gradient(145deg, #E8DDCC 0%, #D8CCBA 100%)';
  // Grid lines for map effect
  for (let gx = 0; gx < 5; gx++) {
    mapCard.children.push(rect(gx * 72, 0, 1, 220, 'rgba(26,21,16,0.06)', 0));
  }
  for (let gy = 0; gy < 4; gy++) {
    mapCard.children.push(rect(0, gy * 55, 353, 1, 'rgba(26,21,16,0.06)', 0));
  }
  // Location pins
  const pins = [
    { x: 60, y: 70, color: P.accent, label: 'Coffee' },
    { x: 180, y: 100, color: P.accent2, label: 'Food' },
    { x: 260, y: 50, color: P.accent, label: 'Bar' },
    { x: 120, y: 160, color: P.accent2, label: 'Market' },
    { x: 310, y: 140, color: P.yellow, label: 'Event' },
  ];
  pins.forEach(p => {
    mapCard.children.push(
      rect(p.x - 20, p.y - 10, 40, 22, p.color, 11),
      text(p.x - 18, p.y - 8, 36, 18, p.label, {
        fontSize: 8, fontWeight: '600', color: '#FFF', textAlign: 'center',
      }),
      // pin tail
      rect(p.x - 3, p.y + 12, 6, 8, p.color, 3),
    );
  });
  // "You are here" dot
  mapCard.children.push(
    circle(176, 110, 10, 'rgba(192,90,40,0.2)'),
    circle(176, 110, 6, P.accent),
    circle(176, 110, 3, '#FFF'),
  );
  elems.push(mapCard);

  // List/map toggle
  const togBg = card(20, 344, 100, 32, P.tag, 16, 'none');
  togBg.children.push(
    rect(2, 2, 48, 28, P.surface, 14),
    text(2, 6, 48, 20, 'List', { fontSize: 11, fontWeight: '600', textAlign: 'center' }),
    text(52, 6, 46, 20, 'Map', { fontSize: 11, textAlign: 'center', color: P.textMuted }),
  );
  elems.push(togBg);

  // Sort/filter
  const sortBtn = pill(300, 344, 'Sort: Nearest', P.accentDim, P.accent, 90, 32, 16);
  elems.push(sortBtn);

  // Nearby spots list
  const nearbySpots = [
    { name: 'Idle Hour Coffee', type: 'Artisan café', dist: '0.3 mi', rating: 4.9, open: true,  color1: '#D4A882', color2: '#B87A52' },
    { name: 'Fernwood Garden Bar', type: 'Natural wine bar', dist: '0.9 mi', rating: 4.5, open: true, color1: '#A0B890', color2: '#708060' },
    { name: 'The Bread Shelf', type: 'Bakery', dist: '1.1 mi', rating: 4.8, open: false, color1: '#D4C8A0', color2: '#B0A060' },
    { name: 'Spice Route', type: 'Indian fusion', dist: '0.7 mi', rating: 4.6, open: true, color1: '#C8A882', color2: '#A07850' },
  ];
  nearbySpots.forEach((s, i) => {
    const y = 388 + i * 94;
    const sc = card(20, y, 353, 84, P.surface, 16, `1px solid ${P.borderSub}`);
    sc.children.push(
      imgPlaceholder(12, 12, 60, 60, s.color1, s.color2, 12),
      text(84, 12, 200, 18, s.name, { fontSize: 14, fontWeight: '700' }),
      text(84, 32, 180, 14, s.type, { fontSize: 11, color: P.textSub }),
      text(84, 50, 80, 14, `${s.rating} ★`, { fontSize: 12, color: P.accent, fontWeight: '600' }),
      text(84, 50, 160, 14, s.dist, { fontSize: 11, color: P.textMuted, textAlign: 'right' }),
      pill(260, 12, s.open ? 'Open' : 'Closed', s.open ? P.accent2Dim : 'rgba(180,60,60,0.08)',
        s.open ? P.accent2 : '#B43C3C', 54, 22, 11),
    );
    elems.push(sc);
  });

  elems.push(navBar(1));
  return {
    id: id(), type: 'frame', name: 'Nearby',
    layout: { x: 430, y: 0, width: 393, height: 872 },
    style: { backgroundColor: P.bg },
    children: elems,
  };
}

// ── SCREEN: SPOT DETAIL ────────────────────────────────────────────────────────
function screenSpotDetail() {
  const elems = [];
  elems.push(statusBar(P.surface));

  // Back button + share
  elems.push(text(16, 58, 40, 32, '←', { fontSize: 20, color: P.text }));
  elems.push(text(337, 58, 40, 32, '↑', { fontSize: 20, color: P.text, textAlign: 'right' }));
  elems.push(text(297, 58, 40, 32, '♡', { fontSize: 20, color: P.textMuted, textAlign: 'right' }));

  // Hero image area
  const heroImg = imgPlaceholder(0, 96, 393, 240, '#D4A882', '#B87A52', 0);
  elems.push(heroImg);

  // Image dots
  for (let d = 0; d < 5; d++) {
    elems.push(circle(158 + d * 20, 318, d === 0 ? 5 : 3, d === 0 ? '#FFF' : 'rgba(255,255,255,0.5)'));
  }

  // Content card (pulls up from bottom)
  const contentCard = card(0, 320, 393, 552, P.surface, 0, 'none');
  contentCard.style.borderTopLeftRadius = 24;
  contentCard.style.borderTopRightRadius = 24;
  contentCard.style.borderRadius = 0;

  contentCard.children.push(
    // Handle
    rect(176, 12, 40, 4, P.tag, 2),

    // Name + type
    ...[
      text(20, 28, 280, 26, 'Idle Hour Coffee Roasters', {
        fontSize: 22, fontWeight: '700', fontFamily: 'SF Pro Display',
      }),
      text(20, 57, 200, 16, 'Artisan café · Dalston, E8', { fontSize: 13, color: P.textSub }),
    ],

    // Rating row
    ...starRow(20, 82, 4.9, 312),
    text(130, 80, 120, 16, '312 reviews', { fontSize: 11, color: P.textMuted }),

    // Tags row
    ...['Single origin', 'Specialty roast', 'Vegan menu', 'Dog friendly'].map((t, i) =>
      pill(20 + [0, 100, 200, 312][i], 106, t, P.tag, P.text,
        [88, 110, 100, 100][i], 26, 13)
    ),

    divider(20, 144, 353),

    // Info rows
    ...[
      { icon: '◷', label: 'Mon–Fri 7:30–18:00, Sat–Sun 8:00–17:00' },
      { icon: '◎', label: '14 Kingsland Road, Dalston, E8 2NS' },
      { icon: '☏', label: '+44 20 7254 1122' },
    ].map((info, i) => [
      text(20, 152 + i * 36, 16, 18, info.icon, { fontSize: 14, color: P.accent }),
      text(44, 152 + i * 36, 300, 18, info.label, { fontSize: 12, color: P.textSub }),
      divider(20, 186 + i * 36, 353),
    ]).flat(),

    // About
    text(20, 264, 100, 18, 'About', { fontSize: 15, fontWeight: '700' }),
    text(20, 286, 353, 60, 'Small-batch roastery tucked into an old Dalston railway arch. We source directly from farms in Colombia, Ethiopia, and Guatemala, roasting on-site every Thursday morning.', {
      fontSize: 12, color: P.textSub, lineHeight: 1.5,
    }),

    divider(20, 350, 353),

    // Photo grid label
    text(20, 360, 120, 18, 'Photos', { fontSize: 15, fontWeight: '700' }),
    // 3 small photo thumbs
    imgPlaceholder(20, 382, 108, 80, '#D4A882', '#C08060', 10),
    imgPlaceholder(136, 382, 108, 80, '#A0C4B0', '#708890', 10),
    imgPlaceholder(252, 382, 101, 80, '#D4C8A0', '#B0A060', 10),

    // CTA
    {
      id: id(), type: 'view',
      layout: { x: 20, y: 480, width: 353, height: 52 },
      style: { backgroundColor: P.accent, borderRadius: 26, border: 'none' },
      children: [
        text(0, 0, 353, 52, 'Get Directions', {
          fontSize: 16, fontWeight: '700', color: '#FFF', textAlign: 'center',
        }),
      ],
    },
  );
  elems.push(contentCard);

  return {
    id: id(), type: 'frame', name: 'Spot Detail',
    layout: { x: 860, y: 0, width: 393, height: 872 },
    style: { backgroundColor: P.surface },
    children: elems,
  };
}

// ── SCREEN: EVENTS ─────────────────────────────────────────────────────────────
function screenEvents() {
  const elems = [];
  elems.push(statusBar(P.bg));

  elems.push(text(20, 58, 250, 26, 'Events', {
    fontSize: 24, fontWeight: '700', color: P.text, fontFamily: 'SF Pro Display',
  }));
  elems.push(text(20, 86, 260, 16, 'What\'s on in your neighbourhood', {
    fontSize: 12, color: P.textMuted,
  }));

  // Filter chips
  const evtCats = ['All', '🎵 Music', '🍴 Food', '🎨 Arts', '🌿 Markets'];
  evtCats.forEach((cat, i) => {
    const active = i === 0;
    const w = [38, 80, 68, 68, 84][i];
    elems.push(pill(
      20 + [0, 46, 134, 210, 286][i], 112,
      cat,
      active ? P.accent : P.tag,
      active ? '#FFF' : P.text,
      w, 30, 15,
    ));
  });

  // Date strip
  const days = ['Mon\n24', 'Tue\n25', 'Wed\n26', 'Thu\n27', 'Fri\n28', 'Sat\n29'];
  days.forEach((d, i) => {
    const active = i === 1;
    const dc = card(20 + i * 58, 152, 50, 54,
      active ? P.accent : P.surface, 14,
      active ? 'none' : `1px solid ${P.borderSub}`
    );
    dc.children.push(
      text(0, 6, 50, 18, d.split('\n')[0], {
        fontSize: 9, textAlign: 'center', color: active ? 'rgba(255,255,255,0.7)' : P.textMuted,
        fontWeight: '500',
      }),
      text(0, 22, 50, 24, d.split('\n')[1], {
        fontSize: 18, textAlign: 'center', color: active ? '#FFF' : P.text, fontWeight: '700',
      }),
    );
    elems.push(dc);
  });

  // Events list
  const events = [
    {
      name: 'Sunday Vinyl Market',
      venue: 'Ridley Road Market', time: '10:00 – 16:00',
      tag: 'Market', tagColor: P.accent2, date: 'Tue 25 Mar',
      color1: '#A8C4A0', color2: '#78986A', attendees: 142,
    },
    {
      name: 'Ethiopian Coffee Ceremony',
      venue: 'Idle Hour Coffee', time: '14:00 – 16:00',
      tag: 'Food', tagColor: P.accent, date: 'Tue 25 Mar',
      color1: '#D4A882', color2: '#B07850', attendees: 28,
    },
    {
      name: 'Jazz & Negronis Night',
      venue: 'Fernwood Garden Bar', time: '19:00 – 23:00',
      tag: 'Music', tagColor: '#8B6BAE', date: 'Tue 25 Mar',
      color1: '#C0A8D4', color2: '#907090', attendees: 84,
    },
    {
      name: 'Ceramics Workshop',
      venue: 'The Clay Room', time: '11:00 – 13:00',
      tag: 'Arts', tagColor: '#C8823C', date: 'Tue 25 Mar',
      color1: '#D4B890', color2: '#A07848', attendees: 16,
    },
  ];

  events.forEach((ev, i) => {
    const y = 216 + i * 132;
    const ec = card(20, y, 353, 120, P.surface, 16, `1px solid ${P.borderSub}`);
    ec.children.push(
      imgPlaceholder(12, 12, 96, 96, ev.color1, ev.color2, 12),
      pill(16, 82, ev.tag, `${ev.tagColor}20`, ev.tagColor, 56, 22, 11),
      text(120, 12, 220, 20, ev.name, { fontSize: 14, fontWeight: '700' }),
      text(120, 34, 200, 14, ev.venue, { fontSize: 11, color: P.textSub }),
      text(120, 52, 200, 14, `⏱ ${ev.time}`, { fontSize: 11, color: P.textMuted }),
      text(120, 70, 100, 14, `👥 ${ev.attendees} going`, { fontSize: 10, color: P.textMuted }),
      // RSVP button
      {
        id: id(), type: 'view',
        layout: { x: 256, y: 88, width: 85, height: 28 },
        style: { backgroundColor: P.accentDim, borderRadius: 14, border: `1px solid ${P.accent}` },
        children: [
          text(0, 0, 85, 28, 'RSVP →', {
            fontSize: 11, fontWeight: '600', color: P.accent, textAlign: 'center',
          }),
        ],
      },
    );
    elems.push(ec);
  });

  elems.push(navBar(2));
  return {
    id: id(), type: 'frame', name: 'Events',
    layout: { x: 1290, y: 0, width: 393, height: 872 },
    style: { backgroundColor: P.bg },
    children: elems,
  };
}

// ── SCREEN: SAVED ──────────────────────────────────────────────────────────────
function screenSaved() {
  const elems = [];
  elems.push(statusBar(P.surface));

  elems.push(text(20, 58, 250, 26, 'My Locale', {
    fontSize: 24, fontWeight: '700', color: P.text, fontFamily: 'SF Pro Display',
  }));

  // Avatar + user info
  const avatarCircle = circle(330, 72, 28, P.accentDim);
  elems.push(avatarCircle);
  elems.push(text(302, 56, 56, 28, 'M', {
    fontSize: 20, fontWeight: '700', color: P.accent, textAlign: 'center',
  }));

  // Stats row
  const stats = [['12', 'Saved spots'], ['3', 'Lists'], ['7', 'Reviews']];
  stats.forEach((st, i) => {
    const sc = card(20 + i * 115, 98, 106, 58, P.surfaceWarm, 14, `1px solid ${P.borderSub}`);
    sc.children.push(
      text(0, 10, 106, 24, st[0], { fontSize: 22, fontWeight: '700', textAlign: 'center', color: P.accent }),
      text(0, 36, 106, 14, st[1], { fontSize: 9, textAlign: 'center', color: P.textMuted }),
    );
    elems.push(sc);
  });

  // Collections
  elems.push(text(20, 170, 200, 18, 'My Collections', {
    fontSize: 15, fontWeight: '700',
  }));
  elems.push(text(300, 170, 73, 18, 'New +', { fontSize: 12, color: P.accent, textAlign: 'right' }));

  const collections = [
    { name: 'Morning Rituals', count: 4, color1: '#D4A882', color2: '#B07850' },
    { name: 'Date Night Spots', count: 6, color1: '#C0A8D4', color2: '#907090' },
    { name: 'Weekend Markets', count: 3, color1: '#A8C4A0', color2: '#78986A' },
  ];
  collections.forEach((col, i) => {
    const cc = card(20, 196 + i * 84, 353, 74, P.surface, 16, `1px solid ${P.borderSub}`);
    cc.children.push(
      imgPlaceholder(12, 12, 50, 50, col.color1, col.color2, 10),
      text(74, 14, 220, 20, col.name, { fontSize: 14, fontWeight: '700' }),
      text(74, 36, 220, 14, `${col.count} spots`, { fontSize: 11, color: P.textMuted }),
      text(310, 24, 24, 28, '›', { fontSize: 18, color: P.textMuted }),
    );
    elems.push(cc);
  });

  // Recent reviews
  elems.push(text(20, 456, 200, 18, 'My Reviews', { fontSize: 15, fontWeight: '700' }));

  const reviews = [
    { name: 'Idle Hour Coffee', rating: 5, time: '2 days ago', review: 'Best flat white in Dalston, hands down. The Ethiopian single origin this month is exceptional.' },
    { name: 'Sunday Vinyl Market', rating: 4, time: '1 week ago', review: 'Great vibe and selection. Arrived early to get the best finds — worth it every time.' },
  ];
  reviews.forEach((rv, i) => {
    const y = 480 + i * 140;
    const rc = card(20, y, 353, 128, P.surface, 16, `1px solid ${P.borderSub}`);
    rc.children.push(
      text(14, 12, 250, 18, rv.name, { fontSize: 13, fontWeight: '700' }),
      text(14, 32, 240, 12, rv.time, { fontSize: 10, color: P.textMuted }),
      ...starRow(14, 50, rv.rating, 0).slice(0, 5),
      text(14, 68, 325, 52, rv.review, { fontSize: 11, color: P.textSub, lineHeight: 1.5 }),
    );
    elems.push(rc);
  });

  elems.push(navBar(3));
  return {
    id: id(), type: 'frame', name: 'Saved',
    layout: { x: 1720, y: 0, width: 393, height: 872 },
    style: { backgroundColor: P.surface },
    children: elems,
  };
}

// ── ASSEMBLE & WRITE ──────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'Locale',
  description: 'Discover your neighbourhood\'s hidden gems — artisan cafés, local markets, and community events.',
  frames: [
    screenDiscover(),
    screenNearby(),
    screenSpotDetail(),
    screenEvents(),
    screenSaved(),
  ],
};

const outPath = path.join(__dirname, 'locale.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ locale.pen written (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
console.log(`  Frames: ${pen.frames.map(f => f.name).join(', ')}`);
