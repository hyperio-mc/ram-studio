#!/usr/bin/env node
/**
 * HAUNT — dining discovery & restaurant journal
 * RAM Design Heartbeat
 *
 * Inspired by:
 *   - Superpower (godly.website): warm amber organic premium health aesthetic
 *   - KO Collective (minimal.gallery): editorial cream/ivory, lifestyle asymmetry
 *   - land-book.com: asymmetric bento grid layouts trending strongly in 2026 landing pages
 *
 * Design challenge:
 *   Asymmetric bento grid cards in mobile app (new pattern for RAM).
 *   Dining/restaurant domain — fresh territory.
 *   Georgia serif + Inter sans type pairing.
 *   LIGHT theme: warm cream/ivory, terracotta accent.
 *
 * 5 screens: Nearby (bento), Place Detail, My Journal, Saved Lists, Log Visit
 */

'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG     = 'haunt';
const APP_NAME = 'HAUNT';
const TAGLINE  = 'Your favourite local haunts, remembered';

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const C = {
  bg:          '#FAF7F2',
  bgAlt:       '#F2EBE0',
  surface:     '#FFFFFF',
  surfaceWarm: '#FDF9F4',
  surfaceAlt:  '#EDE5D8',
  text:        '#1A1410',
  textMid:     '#6B5A4E',
  textMuted:   '#A8948A',
  accent:      '#C4622D',   // terracotta
  accentSoft:  '#F3E0D4',
  sage:        '#6E8C5F',
  sageSoft:    '#E1EAD5',
  gold:        '#C49A2A',
  goldSoft:    '#F5EDD0',
  border:      '#E2D8CC',
  borderLight: '#EDE8E0',
};

const SERIF = '"Georgia", "Times New Roman", serif';
const SANS  = '"Inter", system-ui, -apple-system, sans-serif';

const T = {
  hero:    `700 30px ${SERIF}`,
  title:   `700 20px ${SERIF}`,
  titleMd: `600 17px ${SERIF}`,
  titleSm: `600 15px ${SERIF}`,
  label:   `600 13px ${SANS}`,
  labelXs: `500 11px ${SANS}`,
  body:    `400 14px ${SANS}`,
  bodySm:  `400 13px ${SANS}`,
  numLg:   `700 28px ${SANS}`,
  numMd:   `700 20px ${SANS}`,
  numSm:   `700 16px ${SANS}`,
};

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
let _id = 1000;
const uid = () => `e${_id++}`;

function F(x, y, w, h, fill, opts) {
  opts = opts || {};
  const el = { id: uid(), type: 'RECT', x, y, width: w, height: h, fill: fill || C.bg, cornerRadius: opts.r || 0 };
  if (opts.stroke)  { el.stroke = opts.stroke; el.strokeWidth = opts.sw || 1; }
  if (opts.shadow)  el.shadow = opts.shadow;
  if (opts.clip)    el.clipContent = true;
  if (opts.ch)      el.children = opts.ch.flat(Infinity).filter(Boolean);
  return el;
}

function TX(x, y, content, font, fill, opts) {
  opts = opts || {};
  return { id: uid(), type: 'TEXT', x, y, content: String(content), font, fill: fill || C.text,
    textAlign: opts.align || 'left', letterSpacing: opts.ls || 0, lineHeight: opts.lh || 1.35,
    width: opts.w || 300 };
}

function LINE(x1, y1, x2, y2, color, w) {
  return { id: uid(), type: 'LINE', x1, y1, x2, y2, stroke: color, strokeWidth: w || 1 };
}

function PILL(x, y, w, h, bg, label, font, color, opts) {
  opts = opts || {};
  return F(x, y, w, h, bg, {
    r: Math.floor(h / 2),
    stroke: opts.stroke || null,
    sw: opts.sw || 0,
    ch: [TX(x + w / 2, y + Math.floor(h / 2) - 6, label, font, color, { align: 'center', w })],
  });
}

function STARS(x, y, n) {
  const out = [];
  for (let i = 0; i < 5; i++) {
    out.push(F(x + i * 14, y, 11, 11, i < Math.floor(n) ? C.gold : C.borderLight, { r: 2 }));
  }
  return out;
}

function STATUS_BAR() {
  return [TX(24, 16, '9:41', T.label, C.text), TX(310, 16, '◼◼◼', T.labelXs, C.text, { align: 'right', w: 56 })];
}

function TAB_BAR(active) {
  active = active || 0;
  const BAR_Y = 764;
  const tabs = [
    { icon: '⊞', label: 'Nearby' },
    { icon: '◈', label: 'Journal' },
    { icon: '♡', label: 'Saved' },
    { icon: '◎', label: 'Profile' },
  ];
  return [
    F(0, BAR_Y, 390, 80, C.surface, {
      stroke: C.borderLight, sw: 1,
      ch: tabs.map(function(t, i) {
        const tx = 20 + i * 87;
        const isA = i === active;
        return F(tx, 10, 62, 56, isA ? C.accentSoft : 'transparent', {
          r: 10,
          ch: [
            TX(tx, 18, t.icon, T.label, isA ? C.accent : C.textMuted, { align: 'center', w: 62 }),
            TX(tx, 38, t.label, T.labelXs, isA ? C.accent : C.textMuted, { align: 'center', w: 62 }),
          ],
        });
      }),
    }),
  ];
}

const W = 390;

function SCREEN(id, label, desc, elements) {
  return {
    id, label, description: desc,
    backgroundColor: C.bg,
    width: W, height: 844,
    elements: elements.flat(Infinity).filter(Boolean),
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// S1 — NEARBY  (bento grid)
// ══════════════════════════════════════════════════════════════════════════════
const S1 = SCREEN('nearby', 'Nearby', 'Asymmetric bento grid — featured + quick-stat tiles', [
  STATUS_BAR(),

  // Greeting
  TX(24, 50, 'Good evening', T.label, C.textMuted),
  TX(24, 68, 'Find your next haunt', T.hero, C.text),

  // Search
  F(24, 114, 342, 44, C.surface, {
    r: 22, stroke: C.border, sw: 1,
    ch: [
      TX(52, 14, '🔍  Cuisine, vibe, neighbourhood…', T.body, C.textMuted, { w: 270 }),
    ],
  }),

  // Filter chips
  TX(24, 174, 'TONIGHT', T.labelXs, C.textMuted, { ls: 1.2 }),
  ...(function() {
    const chips = [
      { label: 'All',      w: 36,  x: 24 },
      { label: 'Italian',  w: 54,  x: 68 },
      { label: 'Japanese', w: 70,  x: 130 },
      { label: 'Wine Bar', w: 64,  x: 208 },
      { label: 'Mexican',  w: 60,  x: 280 },
    ];
    return chips.map(function(c, i) {
      return PILL(c.x, 190, c.w, 28, i === 0 ? C.accent : C.surface, c.label, T.labelXs, i === 0 ? '#fff' : C.textMid, { stroke: i === 0 ? null : C.border, sw: 1 });
    });
  })(),

  // ── BENTO GRID ─────────────────────────────────────────────────────────────
  // Tile A — big featured (left) 214×152
  F(24, 232, 214, 152, C.surfaceAlt, {
    r: 16, stroke: C.border, sw: 1,
    ch: [
      F(0, 0, 214, 90, C.bgAlt, { r: 16, ch: [TX(0, 20, '🍝', '400 44px sans-serif', C.text, { align: 'center', w: 214 })] }),
      PILL(10, 10, 56, 20, C.accentSoft, 'FEATURED', T.labelXs, C.accent),
      TX(12, 100, 'Osteria Veneta', T.titleSm, C.text),
      TX(12, 118, '⭐ 4.7 · Italian · $$', T.labelXs, C.textMid),
      TX(12, 134, '8 min walk', T.labelXs, C.textMuted),
    ],
  }),

  // Tile B — top right: Open Now
  F(248, 232, 118, 70, C.sageSoft, {
    r: 14, stroke: C.borderLight, sw: 1,
    ch: [
      TX(12, 12, '● Open', T.labelXs, C.sage),
      TX(12, 30, '14', T.numMd, C.sage),
      TX(44, 35, 'nearby', T.labelXs, C.textMid),
    ],
  }),

  // Tile C — bottom right: Trending
  F(248, 314, 118, 70, C.goldSoft, {
    r: 14, stroke: C.borderLight, sw: 1,
    ch: [
      TX(12, 12, '🔥 Trending', T.labelXs, C.textMid),
      TX(12, 30, 'Omakase', T.titleSm, C.text),
      TX(12, 50, '+32% visits', T.labelXs, C.textMuted),
    ],
  }),

  // Tile D — bottom left: New in area
  F(24, 394, 108, 70, C.accentSoft, {
    r: 14, stroke: C.borderLight, sw: 1,
    ch: [
      TX(12, 12, 'New this week', T.labelXs, C.accent),
      TX(12, 32, '3', T.numMd, C.accent),
      TX(34, 37, 'places', T.labelXs, C.textMid),
    ],
  }),

  // Tile E — bottom right wide: Last visit
  F(142, 394, 224, 70, C.surfaceWarm, {
    r: 14, stroke: C.border, sw: 1,
    ch: [
      TX(12, 12, 'Your last visit', T.labelXs, C.textMuted),
      TX(12, 29, 'Noma Brasserie', T.titleSm, C.text),
      TX(12, 48, '2 days ago  ·  ★★★★☆', T.labelXs, C.textMid),
    ],
  }),

  // ── Nearby list ─────────────────────────────────────────────────────────────
  TX(24, 480, 'NEARBY', T.labelXs, C.textMuted, { ls: 1.2 }),
  TX(320, 480, 'See all', T.labelXs, C.accent, { align: 'right', w: 46 }),
  LINE(24, 496, 366, 496, C.borderLight),

  ...(function() {
    const places = [
      { name: 'Soba Ichi',   cat: 'Japanese · Noodles',    dist: '3 min',  price: '$',   rating: 4.5, em: '🍜' },
      { name: 'La Palma',    cat: 'Spanish · Tapas',       dist: '6 min',  price: '$$',  rating: 4.2, em: '🥘' },
      { name: 'The Larder',  cat: 'Modern British',        dist: '9 min',  price: '$$$', rating: 4.8, em: '🥗' },
    ];
    return places.map(function(p, i) {
      const y = 504 + i * 72;
      return F(24, y, 342, 64, C.surface, {
        r: 12, stroke: C.borderLight, sw: 1,
        ch: [
          F(10, 10, 44, 44, C.bgAlt, { r: 8, ch: [TX(0, 8, p.em, '400 26px sans-serif', '#000', { align: 'center', w: 44 })] }),
          TX(64, 12, p.name, T.titleSm, C.text),
          TX(64, 29, p.cat, T.labelXs, C.textMuted),
          TX(64, 45, p.dist + ' walk  ·  ' + p.price, T.labelXs, C.textMuted),
          TX(298, 12, '★ ' + p.rating, T.labelXs, C.gold, { align: 'right', w: 36 }),
          TX(338, 24, '›', T.label, C.textMuted),
        ],
      });
    });
  })(),

  TAB_BAR(0),
]);

// ══════════════════════════════════════════════════════════════════════════════
// S2 — PLACE DETAIL
// ══════════════════════════════════════════════════════════════════════════════
const S2 = SCREEN('place', 'Place Detail', 'Restaurant detail — image, tags, menu highlights, CTA', [
  // Image header
  F(0, 0, 390, 224, C.bgAlt, {
    ch: [
      TX(0, 72, '🍣', '400 64px sans-serif', C.text, { align: 'center', w: 390 }),
      F(16, 44, 36, 36, 'rgba(255,255,255,0.88)', { r: 18, ch: [TX(8, 8, '←', T.body, C.text)] }),
      F(338, 44, 36, 36, 'rgba(255,255,255,0.88)', { r: 18, ch: [TX(7, 8, '♡', T.body, '#D94848')] }),
      PILL(134, 192, 80, 22, C.sage, '● Open · 23:00', T.labelXs, '#fff'),
    ],
  }),

  TX(24, 240, 'Soba Ichi', T.hero, C.text),
  TX(24, 278, 'Japanese · Noodles · Casual', T.body, C.textMid),

  ...STARS(24, 308, 4),
  TX(94, 305, '4.5  (312 reviews)', T.bodySm, C.textMid),
  TX(24, 328, '🚶 3 min walk  ·  $  ·  No booking needed', T.bodySm, C.textMuted),

  LINE(24, 350, 366, 350, C.borderLight),

  TX(24, 360, 'KNOWN FOR', T.labelXs, C.textMuted, { ls: 0.8 }),

  // Tags
  ...(function() {
    const tags = [
      { label: 'Hand-pulled noodles', x: 24, y: 378, w: 132 },
      { label: 'Local sake', x: 164, y: 378, w: 78 },
      { label: 'Counter seating', x: 250, y: 378, w: 104 },
      { label: 'Seasonal', x: 24, y: 414, w: 72 },
    ];
    return tags.map(function(t) {
      return PILL(t.x, t.y, t.w, 26, C.surfaceAlt, t.label, T.labelXs, C.textMid, { stroke: C.border, sw: 1 });
    });
  })(),

  TX(24, 452, 'MENU HIGHLIGHTS', T.labelXs, C.textMuted, { ls: 0.8 }),
  TX(300, 452, 'Full menu', T.labelXs, C.accent, { align: 'right', w: 66 }),
  LINE(24, 468, 366, 468, C.borderLight),

  ...(function() {
    const items = [
      { name: 'Tori Paitan Ramen',  price: '£14', badge: '🔥 Popular',  badgeBg: C.accentSoft, badgeC: C.accent },
      { name: 'Cold Soba · Tororo', price: '£12', badge: null },
      { name: 'Tamago Gohan',       price: '£6',  badge: '✓ Tried',    badgeBg: C.sageSoft,   badgeC: C.sage },
    ];
    return items.map(function(m, i) {
      const y = 476 + i * 60;
      return [
        TX(24, y + 4, m.name, T.titleSm, C.text),
        TX(24, y + 22, m.price, T.body, C.textMid),
        m.badge ? PILL(232, y + 2, 106, 22, m.badgeBg, m.badge, T.labelXs, m.badgeC) : null,
        LINE(24, y + 52, 366, y + 52, C.borderLight),
      ];
    });
  })(),

  F(24, 706, 342, 50, C.accent, {
    r: 25,
    ch: [TX(0, 15, 'Log a Visit', T.label, '#fff', { align: 'center', w: 342 })],
  }),

  TAB_BAR(1),
]);

// ══════════════════════════════════════════════════════════════════════════════
// S3 — MY JOURNAL
// ══════════════════════════════════════════════════════════════════════════════
const S3 = SCREEN('journal', 'My Journal', 'Dining log — chronological entries with mood chips', [
  STATUS_BAR(),

  TX(24, 50, 'My Journal', T.hero, C.text),
  TX(24, 88, '47 visits · 23 places explored', T.body, C.textMuted),

  // Stats strip
  F(24, 114, 342, 64, C.surface, {
    r: 14, stroke: C.borderLight, sw: 1,
    ch: (function() {
      const stats = [
        { v: '6',   l: 'This month' },
        { v: '12',  l: 'Favourites' },
        { v: '4.2', l: 'Avg stars' },
      ];
      return stats.map(function(s, i) {
        return [
          TX(24 + i * 114, 12, s.v, T.numMd, C.accent),
          TX(24 + i * 114, 34, s.l, T.labelXs, C.textMuted),
          i < 2 ? LINE(24 + i * 114 + 90, 8, 24 + i * 114 + 90, 52, C.borderLight) : null,
        ];
      });
    })(),
  }),

  LINE(24, 192, 366, 192, C.borderLight),
  TX(24, 202, 'MARCH 2026', T.labelXs, C.textMuted, { ls: 1.2 }),

  ...(function() {
    const entries = [
      { name: 'Osteria Veneta', date: 'Mon 28', note: 'Cacio e pepe was perfect. Tried the house Barolo — worth every penny.', mood: '😊 Loved it', moodBg: C.sageSoft, moodC: C.sage,   score: 5 },
      { name: 'The Larder',    date: 'Thu 24', note: 'Sunday roast done right. Beef was dry-aged. The sticky toffee was a 10.', mood: '🤩 Amazing',  moodBg: C.goldSoft, moodC: C.gold,   score: 5 },
      { name: 'La Palma',      date: 'Sat 19', note: 'Patatas bravas crispy and fiery. Good sherry list. Bit loud at 9pm.', mood: '😌 Solid',    moodBg: C.bgAlt,    moodC: C.textMid, score: 3 },
      { name: 'Soba Ichi',     date: 'Tue 15', note: 'Tori paitan is exceptional — rich collagen broth. Went twice that week.', mood: '🔥 Obsessed', moodBg: C.accentSoft, moodC: C.accent, score: 5 },
    ];
    return entries.map(function(e, i) {
      const y = 222 + i * 118;
      return [
        TX(24, y, e.date, T.labelXs, C.textMuted, { ls: 0.6 }),
        LINE(74, y + 7, 366, y + 7, C.borderLight),
        F(24, y + 16, 342, 90, C.surface, {
          r: 14, stroke: C.borderLight, sw: 1,
          ch: [
            TX(12, 10, e.name, T.titleSm, C.text),
            TX(202, 10, e.mood, T.labelXs, e.moodC),
            ...STARS(12, 30, e.score),
            TX(12, 50, e.note, T.bodySm, C.textMid, { w: 314, lh: 1.4 }),
          ],
        }),
      ];
    });
  })(),

  TAB_BAR(1),
]);

// ══════════════════════════════════════════════════════════════════════════════
// S4 — SAVED LISTS
// ══════════════════════════════════════════════════════════════════════════════
const S4 = SCREEN('lists', 'Saved Lists', 'Curated collection cards — editorial 2-col grid', [
  STATUS_BAR(),

  TX(24, 50, 'My Lists', T.hero, C.text),
  TX(24, 88, 'Your curated haunts', T.body, C.textMuted),

  F(290, 50, 76, 32, C.accent, {
    r: 16,
    ch: [TX(0, 8, '+ New List', T.labelXs, '#fff', { align: 'center', w: 76 })],
  }),

  ...(function() {
    const lists = [
      { name: 'Date Night',      count: 8,  em: '🕯', bg: C.accentSoft, c: C.accent },
      { name: 'Business Lunch',  count: 5,  em: '💼', bg: C.sageSoft,   c: C.sage },
      { name: 'Solo Rituals',    count: 12, em: '☕', bg: C.goldSoft,   c: C.gold },
      { name: 'With Family',     count: 6,  em: '🍕', bg: C.surfaceAlt, c: C.textMid },
      { name: 'Weekend Brunch',  count: 9,  em: '🥞', bg: C.accentSoft, c: C.accent },
      { name: 'Hidden Gems',     count: 15, em: '💎', bg: C.bgAlt,      c: C.textMid },
    ];
    return lists.map(function(l, i) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = col === 0 ? 24 : 200;
      const y = 112 + row * 164;
      return F(x, y, 162, 150, l.bg, {
        r: 16, stroke: C.borderLight, sw: 1,
        ch: [
          TX(0, 18, l.em, '400 36px sans-serif', C.text, { align: 'center', w: 162 }),
          TX(12, 70, l.name, T.titleSm, C.text),
          TX(12, 90, l.count + ' places', T.labelXs, C.textMuted),
          F(130, 118, 22, 22, 'rgba(0,0,0,0.06)', { r: 11, ch: [TX(6, 5, '›', T.bodySm, l.c)] }),
        ],
      });
    });
  })(),

  TAB_BAR(2),
]);

// ══════════════════════════════════════════════════════════════════════════════
// S5 — LOG VISIT
// ══════════════════════════════════════════════════════════════════════════════
const S5 = SCREEN('log', 'Log Visit', 'Quick visit logger — place, rating, mood, note, photo', [
  STATUS_BAR(),

  TX(24, 50, 'Log a Visit', T.hero, C.text),

  // Place
  TX(24, 96, 'PLACE', T.labelXs, C.textMuted, { ls: 0.8 }),
  F(24, 112, 342, 48, C.surface, {
    r: 12, stroke: C.accent, sw: 1.5,
    ch: [
      TX(14, 12, 'Soba Ichi — Shoreditch', T.titleSm, C.text),
      TX(14, 30, '3 min walk · Japanese', T.labelXs, C.textMuted),
    ],
  }),

  // When
  TX(24, 174, 'WHEN', T.labelXs, C.textMuted, { ls: 0.8 }),
  F(24, 190, 162, 44, C.surface, { r: 12, stroke: C.border, sw: 1, ch: [TX(12, 13, '📅  Today, Mar 30', T.body, C.text)] }),
  F(196, 190, 170, 44, C.surface, { r: 12, stroke: C.border, sw: 1, ch: [TX(12, 13, '🕐  7:30 pm', T.body, C.text)] }),

  // Rating
  TX(24, 248, 'YOUR RATING', T.labelXs, C.textMuted, { ls: 0.8 }),
  ...(function() {
    return [1,2,3,4,5].map(function(n, i) {
      return F(24 + i * 62, 264, 52, 52, n <= 4 ? C.goldSoft : C.borderLight, {
        r: 12, stroke: n <= 4 ? C.gold : C.border, sw: n <= 4 ? 1.5 : 1,
        ch: [TX(0, 14, '★', T.numSm, n <= 4 ? C.gold : C.textMuted, { align: 'center', w: 52 })],
      });
    });
  })(),

  // Mood
  TX(24, 332, 'MOOD', T.labelXs, C.textMuted, { ls: 0.8 }),
  ...(function() {
    const moods = [
      { label: '🤩 Amazing',  x: 24,  y: 350, w: 94,  bg: C.bgAlt,      c: C.textMid },
      { label: '😊 Loved it', x: 126, y: 350, w: 84,  bg: C.bgAlt,      c: C.textMid },
      { label: '🔥 Obsessed', x: 218, y: 350, w: 94,  bg: C.accent,     c: '#fff'    },
      { label: '😌 Solid',    x: 24,  y: 388, w: 70,  bg: C.bgAlt,      c: C.textMid },
      { label: '😐 Meh',      x: 102, y: 388, w: 52,  bg: C.bgAlt,      c: C.textMid },
    ];
    return moods.map(function(m) {
      return PILL(m.x, m.y, m.w, 30, m.bg, m.label, T.bodySm, m.c, { stroke: m.c === '#fff' ? null : C.border, sw: 1 });
    });
  })(),

  // Notes
  TX(24, 432, 'NOTES', T.labelXs, C.textMuted, { ls: 0.8 }),
  F(24, 448, 342, 80, C.surface, {
    r: 12, stroke: C.border, sw: 1,
    ch: [TX(12, 12, 'The tori paitan here is exceptional — rich, collagen-heavy broth with perfect al-dente noodles…', T.body, C.text, { w: 316, lh: 1.5 })],
  }),

  // Photo strip
  ...(function() {
    return [0,1,2].map(function(i) {
      const x = 24 + i * 78;
      return F(x, 542, 66, 66, i === 0 ? C.bgAlt : C.bgAlt, {
        r: 10, stroke: C.border, sw: 1,
        ch: i === 0 ? [
          TX(0, 14, '+', '600 24px sans-serif', C.textMuted, { align: 'center', w: 66 }),
          TX(0, 44, 'Photo', T.labelXs, C.textMuted, { align: 'center', w: 66 }),
        ] : [],
      });
    });
  })(),

  // Save CTA
  F(24, 622, 342, 50, C.accent, {
    r: 25,
    ch: [TX(0, 15, 'Save to Journal', T.label, '#fff', { align: 'center', w: 342 })],
  }),

  TX(0, 688, '+ Add to a saved list', T.body, C.textMid, { align: 'center', w: 390 }),

  TAB_BAR(1),
]);

// ─── ASSEMBLE + WRITE ─────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  meta: {
    name: APP_NAME,
    slug: SLUG,
    tagline: TAGLINE,
    author: 'RAM Design Heartbeat',
    createdAt: new Date().toISOString(),
    theme: 'light',
    palette: { bg: C.bg, surface: C.surface, accent: C.accent, text: C.text },
    inspiration: [
      'Superpower (godly.website) — warm amber organic premium health aesthetic',
      'KO Collective (minimal.gallery) — editorial cream/ivory, lifestyle asymmetry',
      'land-book.com bento grid SaaS pages — asymmetric tile layouts trending 2026',
    ],
    challenge: 'Asymmetric bento grid in mobile. Dining/restaurant domain (new for RAM). Georgia serif + Inter sans pairing. Warm cream/terracotta light palette.',
  },
  screens: [S1, S2, S3, S4, S5],
};

const outPath = path.join(__dirname, SLUG + '.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log('✓ ' + SLUG + '.pen written — ' + pen.screens.length + ' screens');
console.log('  bg: ' + C.bg + '  accent: ' + C.accent + '  theme: light');
