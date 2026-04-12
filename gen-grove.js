'use strict';
// gen-grove.js — GROVE: Members-only wellness & lifestyle access club
//
// Theme: LIGHT (warm ivory/parchment)
// Inspired by:
//   • Atlas Card on godly.website — ultra-luxury all-caps editorial typography,
//     invitation model, pure restraint, "Sequel Sans Book" feel, no-noise layout
//   • Veo Sports on land-book — electric green accent (rgb 61,214,79) on white surfaces
//   • Minimal.gallery curation — card grids with extreme white space, editorial hierarchy
//
// Design choices:
//   1. ALL-CAPS section headers with wide letter-spacing (unprecedented in my portfolio)
//   2. Warm parchment bg (#F4F0EB) vs sterile white — elevated feel
//   3. Deep forest green (#2C5F47) accent — premium, earthy, trustworthy
//   4. Editorial full-bleed feature cards with photo-weight placeholder masses
//   5. Generous white space — nothing crammed, every element breathes
//
// Palette: bg #F4F0EB, surface #FFF, accent #2C5F47, text #1A1714
// Screens: Home · Discover · Experience · Schedule · Membership

const fs   = require('fs');
const path = require('path');

// ── Palette ─────────────────────────────────────────────────────────────────
const P = {
  bg:        '#F4F0EB',
  surface:   '#FFFFFF',
  surface2:  '#EDE9E3',
  surface3:  '#E5E0D8',
  border:    '#D8D2C9',
  border2:   '#C9C3BA',
  fg:        '#1A1714',
  fg2:       '#6B6560',
  fg3:       '#ADA8A2',
  fg4:       '#D0CBC5',
  forest:    '#2C5F47',
  forestLo:  '#2C5F4714',
  forestMid: '#2C5F4730',
  sage:      '#85B89A',
  sageLo:    '#85B89A20',
  gold:      '#BF8C28',
  goldLo:    '#BF8C2815',
  amber:     '#D4742A',
  red:       '#C04040',
  redLo:     '#C0404015',
  // photo stand-ins — warm tonal fills
  photo1:    '#B8C9BD',  // muted sage
  photo2:    '#C9B8A8',  // warm stone
  photo3:    '#A8B8C9',  // cool slate
  photo4:    '#C9C0A8',  // sand
  photo5:    '#B0C4B8',  // pale sage
};

let _id = 0;
const uid = () => `gv${++_id}`;

// ── Primitives ───────────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill || P.bg,
  clip: opts.clip !== undefined ? opts.clip : false,
  ...(opts.r  !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.ch || [],
});

const T = (content, x, y, w, h, opts = {}) => ({
  id: uid(), type: 'text', content, x, y, width: w, height: h,
  textGrowth: 'fixed-width-height',
  fontSize:   opts.size   || 13,
  fontWeight: String(opts.weight || 400),
  fill:       opts.fill   || P.fg,
  textAlign:  opts.align  || 'left',
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh !== undefined ? { lineHeight: opts.lh }   : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
});

const Line = (x, y, w, fill, h = 1) => F(x, y, w, h, fill || P.border, {});

// All-caps label — signature GROVE typography
const Label = (text, x, y, fill, size = 8) =>
  T(text.toUpperCase(), x, y, text.length * (size * 0.65) + 12, size + 4, {
    size, fill: fill || P.fg3, weight: 600, ls: size > 9 ? 3 : 2,
  });

// Category pill — forest outline style
const CatPill = (text, x, y, active = false) => {
  const w = text.length * 6.8 + 22;
  return F(x, y, w, 22, active ? P.forest : 'transparent', {
    r: 11, stroke: active ? P.forest : P.border2, sw: 1,
    ch: [T(text.toUpperCase(), 6, 4, w - 12, 14, {
      size: 8, fill: active ? P.surface : P.fg2, weight: 600, ls: 1.5, align: 'center',
    })],
  });
};

// Status bar — light style
const StatusBar = () => F(0, 0, 390, 44, 'transparent', { ch: [
  T('9:41', 16, 14, 50, 16, { size: 12, fill: P.fg, weight: 600 }),
  T('◻◻◻  ▲  ●●●●', 260, 14, 120, 16, { size: 10, fill: P.fg2, align: 'right' }),
]});

// Bottom nav — minimal, all-caps labels
const NavBar = (selected) => {
  const tabs = [
    { label: 'HOME',      icon: '⌂' },
    { label: 'DISCOVER',  icon: '◎' },
    { label: 'SCHEDULE',  icon: '▦' },
    { label: 'MEMBERS',   icon: '◉' },
  ];
  const ch = [];
  ch.push(Line(0, 0, 390, P.border));
  tabs.forEach((tab, i) => {
    const ix  = 4 + i * 95;
    const sel = i === selected;
    ch.push(T(tab.icon, ix + 4, 8, 87, 18, {
      size: 16, fill: sel ? P.forest : P.fg3, weight: sel ? 700 : 400, align: 'center',
    }));
    ch.push(T(tab.label, ix + 4, 30, 87, 12, {
      size: 7, fill: sel ? P.forest : P.fg3, weight: sel ? 700 : 500, align: 'center', ls: 2,
    }));
    if (sel) {
      // active dot
      ch.push(E(ix + 38, 2, 10, 3, P.forest, {}));
    }
  });
  return F(0, 796, 390, 48, P.surface, { ch });
};

// ── Feature Card — full-bleed editorial (inspired by Atlas Card photography sections)
const FeatureCard = (x, y, w, h, photoFill, eyebrow, title, sub, tag, opts = {}) => {
  const ch = [];
  // photo mass
  ch.push(F(0, 0, w, h, photoFill, { r: 0 }));
  // subtle gradient overlay at bottom
  ch.push(F(0, h - 80, w, 80, 'linear-gradient(transparent, rgba(26,23,20,0.65))', {}));
  // eyebrow
  ch.push(T(eyebrow.toUpperCase(), 14, 14, w - 28, 12, { size: 8, fill: 'rgba(255,255,255,0.7)', weight: 600, ls: 2.5 }));
  // title
  ch.push(T(title, 14, h - 58, w - 28, 28, { size: 19, fill: '#FFF', weight: 300, lh: 1.3 }));
  // sub
  ch.push(T(sub, 14, h - 28, w - 60, 14, { size: 10, fill: 'rgba(255,255,255,0.65)', weight: 400 }));
  // tag pill
  const tw = tag.length * 6.2 + 16;
  ch.push(F(w - tw - 12, 12, tw, 18, 'rgba(255,255,255,0.18)', { r: 9, ch: [
    T(tag.toUpperCase(), 8, 3, tw - 12, 12, { size: 7.5, fill: '#FFF', weight: 600, ls: 1.5 }),
  ]}));
  return F(x, y, w, h, photoFill, { r: opts.r !== undefined ? opts.r : 14, clip: true, ch });
};

// ── Experience mini-card
const ExperienceCard = (x, y, w, h, photoFill, category, name, detail, price) => {
  const ch = [];
  ch.push(F(0, 0, w, h * 0.55, photoFill, { r: 0 }));
  ch.push(T(category.toUpperCase(), 10, h * 0.55 + 10, w - 14, 10,
    { size: 7.5, fill: P.fg3, weight: 600, ls: 2 }));
  ch.push(T(name, 10, h * 0.55 + 24, w - 14, 28,
    { size: 13, fill: P.fg, weight: 500, lh: 1.3 }));
  ch.push(T(detail, 10, h * 0.55 + 56, w - 14, 12,
    { size: 10, fill: P.fg2 }));
  if (price) {
    ch.push(F(10, h - 22, 50, 16, P.forestLo, { r: 4, ch: [
      T(price, 6, 2, 44, 12, { size: 9, fill: P.forest, weight: 600 }),
    ]}));
  }
  return F(x, y, w, h, P.surface, { r: 12, stroke: P.border, ch });
};

// ── Stat block
const StatBlock = (x, y, w, label, value, unit = '') => F(x, y, w, 52, P.surface, {
  r: 10, stroke: P.border, ch: [
    T(value + unit, 12, 8, w - 16, 22, { size: 18, fill: P.fg, weight: 600 }),
    T(label.toUpperCase(), 12, 32, w - 16, 12, { size: 7.5, fill: P.fg3, weight: 600, ls: 1.5 }),
  ],
});

// ── Screen 1: HOME ──────────────────────────────────────────────────────────
function s1() {
  const ch = [];
  ch.push(F(0, 0, 390, 844, P.bg, {}));
  ch.push(StatusBar());

  // Header
  ch.push(T('GROVE', 20, 54, 80, 18, { size: 12, fill: P.forest, weight: 800, ls: 5 }));
  // Date label — editorial all-caps
  ch.push(T('TUESDAY, APRIL 1', 210, 56, 170, 14, { size: 9, fill: P.fg3, weight: 500, ls: 1.5, align: 'right' }));

  // Greeting
  ch.push(T('Good morning,', 20, 84, 240, 18, { size: 15, fill: P.fg2, weight: 300 }));
  ch.push(T('Alexandra.', 20, 104, 240, 26, { size: 22, fill: P.fg, weight: 400 }));

  // Divider
  ch.push(Line(20, 138, 350, P.border));

  // Section label
  ch.push(Label('TODAY\'S SELECTION', 20, 152));

  // Hero feature card — 358 wide, tall
  ch.push(FeatureCard(16, 172, 358, 200, P.photo1,
    'WELLNESS · FEATURED',
    'Sunrise Pilates\nat The Foundry',
    'Tomorrow · 7:00 AM · SoHo',
    'RESERVED',
    { r: 16 }
  ));

  // 2-col quick cards
  ch.push(FeatureCard(16, 386, 172, 120, P.photo2,
    'DINING',
    'Café Flora\nPower Lunch',
    'Today · 12:30 PM',
    'AVAILABLE',
    { r: 12 }
  ));
  ch.push(FeatureCard(202, 386, 172, 120, P.photo3,
    'CULTURE',
    'Private Viewing\nGagosian',
    'Fri · 6:00 PM',
    '3 SPOTS',
    { r: 12 }
  ));

  // Section label
  ch.push(Label('MEMBER STATUS', 20, 522));

  // Stats row
  ch.push(StatBlock(16,  540, 110, 'credits', '840'));
  ch.push(StatBlock(136, 540, 118, 'bookings', '12'));
  ch.push(StatBlock(264, 540, 110, 'tier', 'GOLD'));

  // Recommendation strip
  ch.push(F(16, 606, 358, 44, P.forestLo, { r: 10, stroke: P.forestMid, ch: [
    T('◈', 14, 12, 18, 20, { size: 14, fill: P.forest }),
    T('3 experiences curated for you this week', 36, 13, 262, 16, { size: 11, fill: P.fg, weight: 400 }),
    T('VIEW →', 310, 15, 48, 14, { size: 9, fill: P.forest, weight: 700, ls: 1, align: 'right' }),
  ]}));

  // Upcoming strip
  ch.push(Label('UPCOMING', 20, 664));
  const upcomings = [
    { time: 'WED', name: 'Cold Plunge · Remedy Place', tag: 'WELLNESS' },
    { time: 'THU', name: 'Chef\'s Table · Atomix', tag: 'DINING' },
  ];
  upcomings.forEach((u, i) => {
    const uy = 682 + i * 50;
    ch.push(F(16, uy, 358, 42, P.surface, { r: 10, stroke: P.border, ch: [
      F(0, 0, 42, 42, P.surface2, { r: 10, ch: [
        T(u.time, 4, 13, 34, 16, { size: 9, fill: P.fg2, weight: 600, ls: 0.5, align: 'center' }),
      ]}),
      T(u.name, 52, 14, 220, 16, { size: 12, fill: P.fg, weight: 400 }),
      F(286, 12, 60, 18, P.forestLo, { r: 6, ch: [
        T(u.tag, 4, 3, 52, 12, { size: 7.5, fill: P.forest, weight: 600, ls: 1, align: 'center' }),
      ]}),
    ]}));
  });

  ch.push(NavBar(0));

  return { name: 'Home', width: 390, height: 844, children: ch };
}

// ── Screen 2: DISCOVER ──────────────────────────────────────────────────────
function s2() {
  const ch = [];
  ch.push(F(0, 0, 390, 844, P.bg, {}));
  ch.push(StatusBar());

  // Header
  ch.push(T('GROVE', 20, 54, 80, 18, { size: 12, fill: P.forest, weight: 800, ls: 5 }));
  ch.push(Label('DISCOVER', 254, 56));

  // Search
  ch.push(F(16, 82, 358, 40, P.surface, { r: 12, stroke: P.border, ch: [
    T('⌕', 12, 10, 20, 20, { size: 15, fill: P.fg3 }),
    T('Search experiences, studios…', 34, 12, 300, 16, { size: 12, fill: P.fg3 }),
  ]}));

  // Category pills
  const cats = ['ALL', 'WELLNESS', 'DINING', 'STAYS', 'CULTURE', 'FITNESS'];
  let cx = 16;
  cats.forEach((c, i) => {
    const pill = CatPill(c, cx, 134, i === 0);
    cx += (c.length * 6.8 + 22) + 8;
    ch.push(pill);
  });

  // Featured section
  ch.push(Label('FEATURED THIS WEEK', 20, 170));
  ch.push(FeatureCard(16, 188, 358, 180, P.photo5,
    'WELLNESS · MEMBERS ONLY',
    'The Bathhouse\nChelsea Rooftop',
    'Available Mon–Sat · From 800 credits',
    'NEW',
    { r: 16 }
  ));

  // Grid section
  ch.push(Label('ALL EXPERIENCES', 20, 384));

  const experiences = [
    { photo: P.photo1, cat: 'FITNESS', name: 'Reformer Pilates', detail: 'Equinox Hudson Yards', price: '200 CR' },
    { photo: P.photo4, cat: 'DINING',  name: 'Omakase Tasting', detail: 'Ko · East Village', price: '600 CR' },
    { photo: P.photo3, cat: 'CULTURE', name: 'Gallery Opening', detail: 'Pace Gallery, 57th', price: 'Free' },
    { photo: P.photo2, cat: 'WELLNESS',name: 'Sound Bath',       detail: 'Maha Rose · Greenpoint', price: '150 CR' },
  ];
  experiences.forEach((exp, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    ch.push(ExperienceCard(
      16 + col * 183,
      402 + row * 178,
      175, 170,
      exp.photo, exp.cat, exp.name, exp.detail, exp.price
    ));
  });

  ch.push(NavBar(1));

  return { name: 'Discover', width: 390, height: 844, children: ch };
}

// ── Screen 3: EXPERIENCE DETAIL ─────────────────────────────────────────────
function s3() {
  const ch = [];
  ch.push(F(0, 0, 390, 844, P.bg, {}));

  // Large hero photo mass — 390 × 340
  ch.push(F(0, 0, 390, 340, P.photo1, { r: 0 }));
  // Overlay gradient
  ch.push(F(0, 260, 390, 80, 'linear-gradient(transparent, rgba(244,240,235,0.95))', {}));

  // Back arrow
  ch.push(F(14, 48, 36, 36, 'rgba(255,255,255,0.85)', { r: 18, ch: [
    T('←', 8, 8, 20, 20, { size: 16, fill: P.fg, align: 'center' }),
  ]}));
  // Bookmark
  ch.push(F(340, 48, 36, 36, 'rgba(255,255,255,0.85)', { r: 18, ch: [
    T('♡', 9, 8, 20, 20, { size: 14, fill: P.fg, align: 'center' }),
  ]}));

  // Category over photo
  ch.push(T('WELLNESS · PILATES', 16, 300, 200, 14, { size: 8, fill: P.fg3, weight: 600, ls: 2.5 }));

  // Content area
  ch.push(F(16, 322, 358, 2, P.border, {}));

  // Title
  ch.push(T('Sunrise Reformer Pilates', 16, 334, 280, 28, { size: 22, fill: P.fg, weight: 300, lh: 1.25 }));

  // Studio name
  ch.push(T('THE FOUNDRY STUDIO · SOHO', 16, 366, 280, 12, { size: 9, fill: P.forest, weight: 600, ls: 2 }));

  // Rating
  ch.push(T('★★★★★  4.9  ·  218 members attended', 16, 386, 280, 14, { size: 10.5, fill: P.fg2 }));

  // Divider
  ch.push(Line(16, 408, 358, P.border));

  // Info row
  const infos = [
    { icon: '◷', label: 'DURATION', value: '50 min' },
    { icon: '◉', label: 'SPOTS LEFT', value: '4 of 12' },
    { icon: '◈', label: 'CREDITS', value: '200 CR' },
  ];
  infos.forEach((info, i) => {
    const ix = 16 + i * 122;
    ch.push(T(info.icon, ix, 422, 20, 18, { size: 16, fill: P.forest }));
    ch.push(T(info.label, ix, 444, 110, 12, { size: 7.5, fill: P.fg3, weight: 600, ls: 1.5 }));
    ch.push(T(info.value, ix, 458, 110, 16, { size: 13, fill: P.fg, weight: 500 }));
  });

  ch.push(Line(16, 482, 358, P.border));

  // Description
  ch.push(Label('ABOUT THIS EXPERIENCE', 16, 494));
  ch.push(T(
    'A signature 50-minute Reformer Pilates class designed for strength, flexibility, and total-body awareness. Led by certified instructors at The Foundry\'s signature SoHo studio, this class is exclusive to GROVE members.',
    16, 512, 358, 56, { size: 11.5, fill: P.fg2, lh: 1.65, weight: 300 }
  ));

  // Schedule section
  ch.push(Label('SELECT A TIME', 16, 578));
  const slots = [
    { time: 'Wed Apr 2', hour: '7:00 AM', avail: true },
    { time: 'Wed Apr 2', hour: '8:15 AM', avail: true },
    { time: 'Thu Apr 3', hour: '7:00 AM', avail: false },
  ];
  slots.forEach((slot, i) => {
    const sx = 16 + i * 120;
    const active = i === 0;
    ch.push(F(sx, 596, 112, 52, active ? P.forest : P.surface, {
      r: 10, stroke: active ? P.forest : P.border, ch: [
        T(slot.time, 10, 8, 92, 12, { size: 8, fill: active ? 'rgba(255,255,255,0.7)' : P.fg3, weight: 500, ls: 0.5 }),
        T(slot.hour, 10, 24, 92, 18, { size: 14, fill: active ? '#FFF' : (slot.avail ? P.fg : P.fg3), weight: 500 }),
        ...(!slot.avail ? [T('FULL', 10, 40, 92, 10, { size: 7.5, fill: P.fg4, weight: 600, ls: 1 })] : []),
      ],
    }));
  });

  // CTA button
  ch.push(F(16, 668, 358, 52, P.forest, { r: 14, ch: [
    T('RESERVE WITH 200 CREDITS', 0, 15, 358, 22, { size: 11.5, fill: '#FFF', weight: 700, ls: 2, align: 'center' }),
  ]}));

  // Cancel note
  ch.push(T('Free cancellation up to 12 hours before · 200 credits returned', 16, 730, 358, 14,
    { size: 10, fill: P.fg3, align: 'center' }));

  return { name: 'Experience', width: 390, height: 844, children: ch };
}

// ── Screen 4: SCHEDULE ───────────────────────────────────────────────────────
function s4() {
  const ch = [];
  ch.push(F(0, 0, 390, 844, P.bg, {}));
  ch.push(StatusBar());

  ch.push(T('GROVE', 20, 54, 80, 18, { size: 12, fill: P.forest, weight: 800, ls: 5 }));
  ch.push(Label('MY SCHEDULE', 220, 56));

  // Week strip
  ch.push(F(16, 82, 358, 68, P.surface, { r: 12, stroke: P.border, ch: [] }));
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const dates = ['31', '1', '2', '3', '4', '5', '6'];
  days.forEach((d, i) => {
    const dx = 18 + i * 50;
    const active = i === 1; // Tuesday = today
    if (active) {
      ch.push(F(dx, 86, 38, 56, P.forest, { r: 8 }));
    }
    ch.push(T(d, dx, 94, 38, 12, { size: 7.5, fill: active ? '#FFF' : P.fg3, weight: 600, ls: 1, align: 'center' }));
    ch.push(T(dates[i], dx, 110, 38, 20, { size: 14, fill: active ? '#FFF' : P.fg, weight: active ? 600 : 400, align: 'center' }));
  });

  // Month label
  ch.push(Label('UPCOMING RESERVATIONS', 20, 166));

  // Reservation cards
  const reservations = [
    { date: 'WED APR 2', time: '7:00 AM', name: 'Reformer Pilates', location: 'The Foundry · SoHo', credits: '200 CR', cat: 'WELLNESS', status: 'CONFIRMED', photo: P.photo1 },
    { date: 'WED APR 2', time: '12:30 PM', name: 'Power Lunch',      location: 'Café Flora · Nolita', credits: '0 CR',    cat: 'DINING',   status: 'CONFIRMED', photo: P.photo2 },
    { date: 'THU APR 3', time: '7:00 PM',  name: 'Omakase Tasting',  location: 'Ko · East Village',   credits: '600 CR',  cat: 'DINING',   status: 'CONFIRMED', photo: P.photo4 },
    { date: 'FRI APR 4', time: '6:00 PM',  name: 'Gallery Opening',  location: 'Pace · 57th Street',  credits: 'Free',    cat: 'CULTURE',  status: 'WAITLIST',  photo: P.photo3 },
  ];

  reservations.forEach((r, i) => {
    const ry = 186 + i * 110;
    const isWaitlist = r.status === 'WAITLIST';
    ch.push(F(16, ry, 358, 100, P.surface, { r: 12, stroke: P.border, ch: [
      // left photo bar
      F(0, 0, 68, 100, r.photo, { r: 0 }),
      F(0, 0, 68, 100, P.fg, { r: 0, opacity: 0.08 }),
      // date tag
      F(0, 0, 68, 24, 'rgba(26,23,20,0.35)', { r: 0, ch: [
        T(r.cat, 4, 5, 60, 14, { size: 7, fill: '#FFF', weight: 700, ls: 1, align: 'center' }),
      ]}),
      // content
      T(r.date, 82, 12, 200, 12, { size: 8, fill: P.fg3, weight: 600, ls: 1.5 }),
      T(r.time, 82, 26, 120, 16, { size: 13, fill: P.fg, weight: 500 }),
      T(r.name, 82, 44, 200, 16, { size: 13, fill: P.fg, weight: 400 }),
      T(r.location, 82, 62, 200, 12, { size: 10, fill: P.fg2 }),
      // credits badge
      F(262, 64, 78, 18, isWaitlist ? P.goldLo : P.forestLo, { r: 6, ch: [
        T(isWaitlist ? 'WAITLIST' : r.credits, 4, 3, 70, 12, { size: 7.5, fill: isWaitlist ? P.gold : P.forest, weight: 700, ls: 1, align: 'center' }),
      ]}),
      // cancel X (small)
      F(330, 8, 20, 20, P.surface2, { r: 10, ch: [
        T('×', 5, 2, 12, 16, { size: 13, fill: P.fg3, align: 'center' }),
      ]}),
    ]}));
  });

  // Bottom note
  ch.push(F(16, 636, 358, 36, P.surface2, { r: 10, ch: [
    T('◈  Credits never expire · Cancellations returned in full up to 12h before', 12, 10, 334, 14, { size: 9.5, fill: P.fg2 }),
  ]}));

  ch.push(NavBar(2));

  return { name: 'Schedule', width: 390, height: 844, children: ch };
}

// ── Screen 5: MEMBERSHIP ─────────────────────────────────────────────────────
function s5() {
  const ch = [];
  ch.push(F(0, 0, 390, 844, P.bg, {}));
  ch.push(StatusBar());

  // Header
  ch.push(T('GROVE', 20, 54, 80, 18, { size: 12, fill: P.forest, weight: 800, ls: 5 }));
  ch.push(Label('MEMBERSHIP', 250, 56));

  // Member card — editorial premium
  ch.push(F(16, 82, 358, 180, P.fg, { r: 18, ch: [
    // subtle texture pattern
    E(-30, -30, 160, 160, P.forest, { opacity: 0.18 }),
    E(260, 100, 200, 200, P.forest, { opacity: 0.12 }),
    // card content
    T('GROVE', 20, 20, 80, 18, { size: 12, fill: P.surface, weight: 800, ls: 5 }),
    T('GOLD', 310, 18, 50, 20, { size: 13, fill: P.gold, weight: 700, ls: 2, align: 'right' }),
    T('ALEXANDRA CHEN', 20, 130, 250, 16, { size: 11.5, fill: 'rgba(255,255,255,0.7)', weight: 500, ls: 1.5 }),
    T('MEMBER SINCE 2024', 20, 150, 250, 12, { size: 8, fill: 'rgba(255,255,255,0.4)', weight: 500, ls: 2 }),
    T('♦', 20, 58, 20, 20, { size: 18, fill: P.gold, opacity: 0.9 }),
    T('840 CREDITS', 20, 90, 160, 22, { size: 16, fill: '#FFF', weight: 300, ls: 1 }),
    T('available balance', 20, 114, 160, 14, { size: 9, fill: 'rgba(255,255,255,0.45)', weight: 400 }),
    T('▶▶▶▶▶▶▶▶▶', 180, 92, 160, 16, { size: 9, fill: 'rgba(255,255,255,0.08)', align: 'right' }),
  ]}));

  // Tier progress
  ch.push(Label('TIER STATUS', 20, 278));
  ch.push(F(16, 296, 358, 60, P.surface, { r: 12, stroke: P.border, ch: [
    T('GOLD', 14, 10, 60, 16, { size: 11, fill: P.gold, weight: 700, ls: 2 }),
    T('→  PLATINUM at 1,200 annual bookings', 68, 12, 260, 14, { size: 10, fill: P.fg2 }),
    // progress bar
    F(14, 36, 330, 6, P.surface2, { r: 3, ch: [
      F(0, 0, 210, 6, P.gold, { r: 3 }),  // 64% to platinum
    ]}),
    T('840 / 1,200 bookings this year', 14, 46, 240, 12, { size: 8.5, fill: P.fg3 }),
    T('64%', 310, 46, 36, 12, { size: 8.5, fill: P.gold, weight: 600, align: 'right' }),
  ]}));

  // Benefits
  ch.push(Label('YOUR BENEFITS', 20, 374));
  const benefits = [
    { icon: '◎', name: 'Unlimited Discoveries', desc: 'Browse & save without limit', active: true },
    { icon: '◷', name: '48-Hour Early Access', desc: 'Book before Standard members', active: true },
    { icon: '◈', name: 'AI Concierge', desc: 'Personalized weekly curation', active: true },
    { icon: '◉', name: 'Guest Passes', desc: '2 complimentary per month', active: true },
    { icon: '♦', name: 'Priority Support', desc: '24/7 dedicated member line', active: false },
  ];
  benefits.forEach((b, i) => {
    const by = 392 + i * 52;
    ch.push(F(16, by, 358, 44, P.surface, { r: 10, stroke: P.border, ch: [
      F(10, 8, 28, 28, b.active ? P.forestLo : P.surface2, { r: 8, ch: [
        T(b.icon, 5, 5, 18, 18, { size: 13, fill: b.active ? P.forest : P.fg3 }),
      ]}),
      T(b.name, 48, 8, 220, 14, { size: 12, fill: b.active ? P.fg : P.fg3, weight: 500 }),
      T(b.desc, 48, 24, 220, 12, { size: 10, fill: P.fg3 }),
      b.active
        ? T('✓', 328, 13, 18, 18, { size: 13, fill: P.forest, weight: 600, align: 'center' })
        : F(320, 10, 24, 24, P.gold, { r: 8, ch: [
            T('GO', 2, 7, 20, 10, { size: 7.5, fill: '#FFF', weight: 700, ls: 0.5, align: 'center' }),
          ]}),
    ]}));
  });

  // Upgrade note
  ch.push(F(16, 660, 358, 40, P.goldLo, { r: 10, stroke: P.gold, sw: 1, ch: [
    T('♦  Upgrade to Platinum for Priority Support & 4 Guest Passes/mo', 14, 12, 330, 14, { size: 10, fill: P.gold, weight: 500 }),
  ]}));

  ch.push(NavBar(3));

  return { name: 'Membership', width: 390, height: 844, children: ch };
}

// ── Assemble & write ────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  title:   'GROVE — Members-Only Wellness & Lifestyle Access',
  screens: [s1(), s2(), s3(), s4(), s5()],
};

const outPath = path.join(__dirname, 'grove.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ grove.pen written (${Math.round(fs.statSync(outPath).size / 1024)}KB)`);
