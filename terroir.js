#!/usr/bin/env node
// TERROIR — Wine Discovery & Cellar Tracker
// Heartbeat Challenge — responding to Rakis's feedback: "try different app styles"
//
// Inspired by:
//   - Kreativa Studio (Dribbble) — bento grid mosaic brand layouts, asymmetric tile sizes
//   - Superpower health app (Godly) — warm cinematic editorial, amber/silhouette photography
//   - Limitless AI (Godly) — light mode SaaS, single bold accent on white, type-first hierarchy
//
// Breaking every pattern from previous heartbeat work:
//   - Light background (cream #F8F4EE) instead of dark void
//   - Warm earthy palette (burgundy, amber, sage) instead of neon-on-black
//   - Bento grid (asymmetric tiles) instead of uniform card-list grids
//   - Editorial typography — mixed case, serif-emulation through size/weight
//   - No all-caps monospace labels everywhere
//   - Wine/editorial industry vs finance/awards/studio

const https = require('https');
const fs    = require('fs');

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const P = {
  bg:     '#F8F4EE',  // warm cream
  white:  '#FFFFFF',  // pure white
  deep:   '#1A0E06',  // warm near-black (ink)
  wine:   '#6B1A2A',  // deep burgundy
  wineL:  '#F5EBEf',  // pale wine blush
  amber:  '#B8631A',  // warm amber
  amberL: '#FDF0E4',  // pale amber
  sage:   '#5A6E4C',  // sage green
  sageL:  '#EEF2EB',  // pale sage
  sand:   '#D4C4A8',  // warm sand
  sandL:  '#FAF6F0',  // very pale sand
  border: '#E4D9CC',  // soft warm border
  sub:    '#7A6B5C',  // warm grey-brown
};

const MW = 375, MH = 812;
const PW = 1440, PH = 900;

let idC = 1;
const uid = () => `e${idC++}`;

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, children = [], opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h, fill,
  cornerRadius: opts.r || 0, opacity: opts.op !== undefined ? opts.op : 1,
  children: children.filter(Boolean),
});
const R = (x, y, w, h, fill, opts = {}) => F(x, y, w, h, fill, [], opts);
const E = (x, y, w, h, fill, op = 1) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill, opacity: op,
});
const T = (text, x, y, w, h, size, color, bold = false, align = 'left', op = 1, ls = 0) => ({
  id: uid(), type: 'text', x, y, width: w, height: h, text,
  fontSize: size, fill: color, fontWeight: bold ? 700 : 400,
  textAlign: align, opacity: op, letterSpacing: ls,
});
const Line = (x, y, w, h, fill, op = 1) => R(x, y, w, h, fill, { op });

// ─── BENTO TILE ───────────────────────────────────────────────────────────────
// A single tile in the bento grid — background color + children
function Tile(x, y, w, h, color, children, r = 12) {
  return F(x, y, w, h, color, children, { r });
}

// ─── WINE SCORE DOTS ──────────────────────────────────────────────────────────
function ScoreDots(x, y, score, max = 5, col = P.wine, size = 10) {
  const dots = [];
  for (let i = 0; i < max; i++) {
    dots.push(i < score
      ? E(x + i * (size + 4), y, size, size, col)
      : E(x + i * (size + 4), y, size, size, P.border)
    );
  }
  return dots;
}

// ─── PILL BADGE ───────────────────────────────────────────────────────────────
function Pill(x, y, label, col, bgCol) {
  const w = label.length * 7 + 20;
  return F(x, y, w, 24, bgCol || col, [
    R(0, 0, w, 24, col, { op: bgCol ? 0 : 0.12, r: 12 }),
    T(label, 0, 5, w, 14, 9, col, true, 'center', 1, 0.5),
  ], { r: 12 });
}

// ─── REGION STRIP ─────────────────────────────────────────────────────────────
function RegionStrip(x, y, w, label, pct, col) {
  return F(x, y, w, 32, 'transparent', [
    T(label, 0, 8, w - 60, 16, 11, P.sub),
    T(`${Math.round(pct * 100)}%`, w - 56, 8, 52, 16, 11, col, true, 'right'),
    R(0, 26, w, 4, P.border, { r: 2 }),
    R(0, 26, Math.round(w * pct), 4, col, { r: 2 }),
  ]);
}

// ─── MOBILE SCREEN 1 — DISCOVER ───────────────────────────────────────────────
function mobileDiscover() {
  return F(0, 0, MW, MH, P.bg, [
    // Status bar
    R(0, 0, MW, 44, P.bg),
    T('9:41', 16, 14, 60, 18, 13, P.deep, true),
    T('●●●', MW - 80, 14, 64, 18, 11, P.deep, false, 'right'),

    // Nav — minimal, light
    F(0, 44, MW, 52, P.bg, [
      T('terroir', 20, 14, 120, 24, 18, P.deep, true, 'left', 1, -0.5),
      R(MW - 52, 12, 32, 32, P.border, { r: 16 }),
      T('RS', MW - 52, 20, 32, 16, 10, P.sub, true, 'center'),
      Line(0, 51, MW, 1, P.border),
    ]),

    // Editorial hero — simulating large photography with a warm color block
    F(0, 96, MW, 200, P.wine, [
      // Simulated photo with depth overlay
      R(0, 0, MW, 200, P.deep, { op: 0.3 }),
      // Photo label / issue
      T('This week\'s pick', 20, 20, MW - 40, 16, 10, P.sand, false, 'left', 0.8),
      T('Barolo di\nCastiglione', 20, 44, MW - 40, 72, 28, P.bg, true),
      T('2019 · Piedmont, Italy', 20, 128, MW - 40, 18, 11, P.sand),
      F(20, 158, 100, 28, 'transparent', [
        R(0, 0, 100, 28, P.bg, { op: 0.2, r: 4 }),
        T('Read More →', 0, 7, 100, 14, 10, P.bg, true, 'center'),
      ], { r: 4 }),
      // Score
      ...ScoreDots(MW - 96, 164, 4, 5, P.sand),
    ]),

    // Category pills
    F(20, 308, MW - 40, 36, 'transparent', [
      Pill(0, 6, 'Red', P.wine),
      Pill(70, 6, 'White', P.amber),
      Pill(140, 6, 'Rosé', '#C47080'),
      Pill(210, 6, 'Natural', P.sage),
      Pill(280, 6, 'Sparkling', P.sub),
    ]),

    // Section heading
    T('Recommended for you', 20, 358, MW - 40, 22, 14, P.deep, true, 'left', 1, -0.3),

    // Recommendation cards
    F(20, 388, MW - 40, 96, P.white, [
      R(0, 0, 4, 96, P.wine),
      R(0, 0, MW - 40, 96, P.border, { op: 0.3, r: 8 }),
      T('Côtes du Rhône', 16, 14, MW - 80, 20, 14, P.deep, true),
      T('Domaine du Vieux Télégraphe · 2021', 16, 36, MW - 80, 16, 11, P.sub),
      T('Grenache blend, Southern Rhône. Red fruit, spice, garrigue.', 16, 56, MW - 80, 28, 10, P.sub),
      ...ScoreDots(16, 76, 4, 5, P.wine, 8),
    ], { r: 8 }),

    F(20, 492, MW - 40, 96, P.white, [
      R(0, 0, 4, 96, P.amber),
      R(0, 0, MW - 40, 96, P.border, { op: 0.3, r: 8 }),
      T('Pouilly-Fumé', 16, 14, MW - 80, 20, 14, P.deep, true),
      T('Henri Bourgeois · 2022', 16, 36, MW - 80, 16, 11, P.sub),
      T('Sauvignon Blanc, Loire Valley. Flint, citrus, green apple.', 16, 56, MW - 80, 28, 10, P.sub),
      ...ScoreDots(16, 76, 5, 5, P.amber, 8),
    ], { r: 8 }),

    F(20, 596, MW - 40, 96, P.white, [
      R(0, 0, 4, 96, P.sage),
      R(0, 0, MW - 40, 96, P.border, { op: 0.3, r: 8 }),
      T('Muscadet Sèvre et Maine', 16, 14, MW - 80, 20, 14, P.deep, true),
      T('Domaine de la Pépière · 2020', 16, 36, MW - 80, 16, 11, P.sub),
      T('Melon de Bourgogne, sur lie. Saline, lemony, mineral.', 16, 56, MW - 80, 28, 10, P.sub),
      ...ScoreDots(16, 76, 4, 5, P.sage, 8),
    ], { r: 8 }),

    // Bottom nav — light
    F(0, MH - 72, MW, 72, P.white, [
      Line(0, 0, MW, 1, P.border),
      T('⊞', MW / 8 - 12, 12, 24, 28, 18, P.wine, false, 'center'),
      T('◫', 3 * MW / 8 - 12, 12, 24, 28, 18, P.sub, false, 'center'),
      T('◈', 5 * MW / 8 - 12, 12, 24, 28, 18, P.sub, false, 'center'),
      T('◉', 7 * MW / 8 - 12, 12, 24, 28, 18, P.sub, false, 'center'),
    ]),
  ]);
}

// ─── MOBILE SCREEN 2 — WINE DETAIL ────────────────────────────────────────────
function mobileWineDetail() {
  return F(0, 0, MW, MH, P.bg, [
    // Cinematic wine color hero — simulating a full-bleed bottle photograph
    F(0, 0, MW, 280, P.wine, [
      R(0, 0, MW, 280, P.deep, { op: 0.2 }),
      // Decorative label art simulation
      E(MW / 2 - 60, 40, 120, 120, P.wineL, 0.08),
      E(MW / 2 - 80, 20, 160, 160, P.amber, 0.06),
      // Wine name text
      T('← Discover', 20, 52, 120, 20, 12, P.sand, false, 'left', 0.7),
      T('Barolo di\nCastiglione', 20, 84, MW - 40, 88, 32, P.bg, true, 'left', 1, -0.5),
      T('Vigna Rionda · 2019', 20, 184, MW - 40, 20, 12, P.sand),
      // Rating
      F(20, 212, 120, 28, 'transparent', [
        ...ScoreDots(0, 8, 4, 5, P.sand),
      ]),
      T('4.2', 84, 210, 40, 22, 16, P.sand, true),
      T('(47 notes)', 128, 214, 100, 18, 10, P.sand, false, 'left', 0.6),
    ]),

    // Scrollable content
    F(0, 280, MW, MH - 280, P.bg, [
      // Key attributes
      F(20, 20, MW - 40, 60, P.white, [
        F(0, 0, (MW - 40) / 4, 60, 'transparent', [
          T('Region', 0, 10, (MW - 40) / 4, 16, 9, P.sub, false, 'center'),
          T('Barolo', 0, 28, (MW - 40) / 4, 20, 12, P.deep, true, 'center'),
        ]),
        F((MW - 40) / 4, 0, (MW - 40) / 4, 60, 'transparent', [
          T('Vintage', 0, 10, (MW - 40) / 4, 16, 9, P.sub, false, 'center'),
          T('2019', 0, 28, (MW - 40) / 4, 20, 12, P.deep, true, 'center'),
        ]),
        F((MW - 40) / 2, 0, (MW - 40) / 4, 60, 'transparent', [
          T('ABV', 0, 10, (MW - 40) / 4, 16, 9, P.sub, false, 'center'),
          T('14.5%', 0, 28, (MW - 40) / 4, 20, 12, P.deep, true, 'center'),
        ]),
        F(3 * (MW - 40) / 4, 0, (MW - 40) / 4, 60, 'transparent', [
          T('Grape', 0, 10, (MW - 40) / 4, 16, 9, P.sub, false, 'center'),
          T('Nebbiolo', 0, 28, (MW - 40) / 4, 20, 12, P.deep, true, 'center'),
        ]),
      ], { r: 8 }),

      // Tasting notes
      T('Tasting Notes', 20, 92, MW - 40, 22, 14, P.deep, true),
      T('Complex and full-bodied. The nose opens with dried roses, tar, and dark cherry. On the palate, firm tannins frame flavors of leather, tobacco, and dried fruit. Long finish with mineral notes. Best after decanting 2 hours.', 20, 118, MW - 40, 84, 12, P.sub, false, 'left', 1, 0.1),

      // Pairing
      T('Pairs well with', 20, 214, MW - 40, 20, 13, P.deep, true),
      F(20, 238, MW - 40, 36, 'transparent', [
        Pill(0, 6, 'Braised lamb', P.wine),
        Pill(100, 6, 'Aged pecorino', P.amber),
        Pill(210, 6, 'Truffle pasta', P.sage),
      ]),

      // Drinking window
      F(20, 286, MW - 40, 60, P.sandL, [
        T('Drinking window', 12, 10, MW - 64, 16, 10, P.sub),
        R(12, 32, MW - 64, 6, P.border, { r: 3 }),
        R(12 + Math.round((MW - 64) * 0.35), 30, Math.round((MW - 64) * 0.45), 10, P.wine, { r: 4 }),
        T('2024', 12, 42, 48, 14, 8, P.sub, false, 'left', 0.7),
        T('Peak: 2027–2031', MW / 2 - 64, 42, 128, 14, 8, P.wine, true, 'center', 0.9),
        T('2035', MW - 64, 42, 40, 14, 8, P.sub, false, 'right', 0.7),
      ], { r: 8 }),

      // CTA
      F(20, 360, MW - 40, 48, P.wine, [
        T('Add to my cellar', 0, 15, MW - 40, 18, 13, P.bg, true, 'center'),
      ], { r: 8 }),
      F(20, 416, MW - 40, 44, P.white, [
        R(0, 0, MW - 40, 44, P.border, { op: 1, r: 8 }),
        T('Write a tasting note', 0, 13, MW - 40, 18, 12, P.sub, false, 'center'),
      ], { r: 8 }),
    ]),
  ]);
}

// ─── MOBILE SCREEN 3 — MY CELLAR (BENTO) ──────────────────────────────────────
function mobileCellar() {
  const tileW = (MW - 52) / 2; // ~161px
  const tileH = 100;
  const gap = 12;
  const wines = [
    { name: 'Barolo',        region: 'Piedmont',  year: 2019, col: P.wine  },
    { name: 'Pouilly-Fumé',  region: 'Loire',     year: 2022, col: P.amber },
    { name: 'Margaux',       region: 'Bordeaux',  year: 2015, col: P.wine  },
    { name: 'Muscadet',      region: 'Loire',     year: 2020, col: P.sage  },
    { name: 'Rioja Res.',    region: 'Spain',     year: 2018, col: P.amber },
    { name: 'Chablis Prem.', region: 'Burgundy',  year: 2021, col: P.sage  },
  ];

  return F(0, 0, MW, MH, P.bg, [
    R(0, 0, MW, 44, P.bg),
    T('9:41', 16, 14, 60, 18, 13, P.deep, true),
    T('●●●', MW - 80, 14, 64, 18, 11, P.deep, false, 'right'),
    F(0, 44, MW, 52, P.bg, [
      T('terroir', 20, 14, 120, 24, 18, P.deep, true, 'left', 1, -0.5),
      Line(0, 51, MW, 1, P.border),
    ]),

    // Header
    F(20, 104, MW - 40, 44, 'transparent', [
      T('My Cellar', 0, 4, MW - 100, 32, 22, P.deep, true, 'left', 1, -0.5),
      T('24 bottles', MW - 100, 12, 92, 20, 11, P.sub, false, 'right'),
    ]),

    // Stats strip
    F(20, 156, MW - 40, 52, P.white, [
      F(0, 0, (MW - 40) / 3, 52, 'transparent', [
        T('24', 0, 8, (MW - 40) / 3, 24, 20, P.wine, true, 'center'),
        T('Bottles', 0, 32, (MW - 40) / 3, 14, 9, P.sub, false, 'center'),
      ]),
      F((MW - 40) / 3, 0, (MW - 40) / 3, 52, 'transparent', [
        T('6', 0, 8, (MW - 40) / 3, 24, 20, P.amber, true, 'center'),
        T('Regions', 0, 32, (MW - 40) / 3, 14, 9, P.sub, false, 'center'),
      ]),
      F(2 * (MW - 40) / 3, 0, (MW - 40) / 3, 52, 'transparent', [
        T('3', 0, 8, (MW - 40) / 3, 24, 20, P.sage, true, 'center'),
        T('Drinking now', 0, 32, (MW - 40) / 3, 14, 9, P.sub, false, 'center'),
      ]),
      Line(0, 51, MW - 40, 1, P.border),
    ], { r: 8 }),

    // Wine tiles in 2-column bento grid
    ...wines.map((w, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const tx = 20 + col * (tileW + gap);
      const ty = 220 + row * (tileH + gap);
      const light = w.col === P.wine ? P.wineL : w.col === P.amber ? P.amberL : P.sageL;
      return Tile(tx, ty, tileW, tileH, light, [
        R(0, 0, tileW, 4, w.col),
        T(w.year.toString(), tileW - 44, 12, 40, 16, 10, w.col, true, 'right'),
        T(w.name, 12, 16, tileW - 56, 22, 13, P.deep, true),
        T(w.region, 12, 40, tileW - 24, 16, 10, P.sub),
        ...ScoreDots(12, 68, 4, 5, w.col, 8),
      ]);
    }),

    // Bottom nav
    F(0, MH - 72, MW, 72, P.white, [
      Line(0, 0, MW, 1, P.border),
      T('⊞', MW / 8 - 12, 12, 24, 28, 18, P.sub, false, 'center'),
      T('◫', 3 * MW / 8 - 12, 12, 24, 28, 18, P.sub, false, 'center'),
      T('◈', 5 * MW / 8 - 12, 12, 24, 28, 18, P.wine, false, 'center'),
      T('◉', 7 * MW / 8 - 12, 12, 24, 28, 18, P.sub, false, 'center'),
    ]),
  ]);
}

// ─── MOBILE SCREEN 4 — PAIRING ────────────────────────────────────────────────
function mobilePairing() {
  const pairings = [
    { wine: 'Côtes du Rhône',  dish: 'Lamb tagine',     score: 98, col: P.wine  },
    { wine: 'Viognier',         dish: 'Roast chicken',   score: 94, col: P.amber },
    { wine: 'Vermentino',       dish: 'Grilled sea bass',score: 91, col: P.sage  },
  ];
  return F(0, 0, MW, MH, P.bg, [
    R(0, 0, MW, 44, P.bg),
    T('9:41', 16, 14, 60, 18, 13, P.deep, true),
    T('●●●', MW - 80, 14, 64, 18, 11, P.deep, false, 'right'),
    F(0, 44, MW, 52, P.bg, [
      T('terroir', 20, 14, 120, 24, 18, P.deep, true, 'left', 1, -0.5),
      Line(0, 51, MW, 1, P.border),
    ]),

    T('Food pairing', 20, 112, MW - 40, 28, 20, P.deep, true, 'left', 1, -0.5),
    T('What are you eating tonight?', 20, 144, MW - 40, 18, 12, P.sub),

    // Input field
    F(20, 172, MW - 40, 48, P.white, [
      R(0, 0, MW - 40, 48, P.border, { r: 8 }),
      T('Braised short rib with gremolata', 16, 16, MW - 56, 16, 12, P.sub),
    ], { r: 8 }),

    // Category chips
    F(20, 232, MW - 40, 36, 'transparent', [
      Pill(0, 6, 'Red meat', P.wine),
      Pill(80, 6, 'Seafood', P.sage),
      Pill(156, 6, 'Cheese', P.amber),
      Pill(222, 6, 'Vegetarian', P.sub),
    ]),

    T('Best matches', 20, 282, MW - 40, 20, 13, P.deep, true),
    T('Based on flavor profile & your cellar', 20, 304, MW - 40, 16, 10, P.sub),

    // Pairing cards
    ...pairings.map((p, i) =>
      F(20, 328 + i * 108, MW - 40, 96, P.white, [
        R(0, 0, MW - 40, 96, P.border, { op: 0.5, r: 8 }),
        // Score circle
        F(MW - 40 - 56, 20, 40, 56, 'transparent', [
          E(0, 0, 40, 40, p.col, 0.15),
          T(`${p.score}`, 0, 10, 40, 20, 14, p.col, true, 'center'),
          T('match', 0, 30, 40, 12, 7, p.sub, false, 'center'),
        ]),
        R(0, 0, 4, 96, p.col, { r: 0 }),
        T(p.wine,  12, 16, MW - 100, 18, 13, P.deep, true),
        T(`with ${p.dish}`, 12, 36, MW - 100, 16, 11, P.sub),
        T('From your cellar ·', 12, 60, 120, 14, 9, p.col),
        T('Perfect temperature: 16°C', 12, 76, MW - 100, 12, 9, P.sub),
      ], { r: 8 })
    ),

    // Bottom nav
    F(0, MH - 72, MW, 72, P.white, [
      Line(0, 0, MW, 1, P.border),
      T('⊞', MW / 8 - 12, 12, 24, 28, 18, P.sub, false, 'center'),
      T('◫', 3 * MW / 8 - 12, 12, 24, 28, 18, P.wine, false, 'center'),
      T('◈', 5 * MW / 8 - 12, 12, 24, 28, 18, P.sub, false, 'center'),
      T('◉', 7 * MW / 8 - 12, 12, 24, 28, 18, P.sub, false, 'center'),
    ]),
  ]);
}

// ─── MOBILE SCREEN 5 — LOG TASTING NOTE ───────────────────────────────────────
function mobileLog() {
  return F(0, 0, MW, MH, P.bg, [
    R(0, 0, MW, 44, P.bg),
    T('9:41', 16, 14, 60, 18, 13, P.deep, true),
    T('●●●', MW - 80, 14, 64, 18, 11, P.deep, false, 'right'),
    F(0, 44, MW, 52, P.bg, [
      T('← Barolo 2019', 20, 16, 180, 20, 12, P.sub),
      T('Save', MW - 60, 16, 40, 20, 13, P.wine, true, 'right'),
      Line(0, 51, MW, 1, P.border),
    ]),

    T('Add tasting note', 20, 112, MW - 40, 24, 17, P.deep, true, 'left', 1, -0.3),

    // Rating
    T('Your rating', 20, 148, MW - 40, 16, 11, P.sub),
    F(20, 168, 200, 40, 'transparent', [
      ...Array.from({ length: 5 }, (_, i) =>
        F(i * 40, 0, 36, 36, P.wineL, [
          T('★', 0, 6, 36, 24, 20, i < 4 ? P.wine : P.border, false, 'center'),
        ], { r: 4 })
      ),
    ]),

    // Aromas
    T('Aromas detected', 20, 224, MW - 40, 16, 11, P.sub),
    F(20, 244, MW - 40, 36, 'transparent', [
      Pill(0, 6, 'Dark cherry', P.wine),
      Pill(92, 6, 'Dried roses', '#C47080'),
      Pill(178, 6, 'Tar', P.sub),
      Pill(216, 6, 'Tobacco', P.sub),
    ]),

    // Tasting note text area
    T('Your notes', 20, 294, MW - 40, 16, 11, P.sub),
    F(20, 314, MW - 40, 140, P.white, [
      R(0, 0, MW - 40, 140, P.border, { r: 8 }),
      T('Full-bodied with firm but velvety tannins. Rose petal nose with a hint of tar and leather. Exceptional length on the finish — this will age beautifully for another decade.', 12, 12, MW - 64, 116, 12, P.sub),
    ], { r: 8 }),

    // Occasion + food
    F(20, 466, (MW - 52) / 2, 48, P.white, [
      R(0, 0, (MW - 52) / 2, 48, P.border, { r: 8 }),
      T('Occasion', 12, 8, (MW - 52) / 2 - 24, 14, 9, P.sub),
      T('Birthday dinner', 12, 24, (MW - 52) / 2 - 24, 16, 11, P.deep),
    ], { r: 8 }),
    F(20 + (MW - 52) / 2 + 12, 466, (MW - 52) / 2, 48, P.white, [
      R(0, 0, (MW - 52) / 2, 48, P.border, { r: 8 }),
      T('Food pairing', 12, 8, (MW - 52) / 2 - 24, 14, 9, P.sub),
      T('Braised short rib', 12, 24, (MW - 52) / 2 - 24, 16, 11, P.deep),
    ], { r: 8 }),

    // Save CTA
    F(20, 530, MW - 40, 52, P.wine, [
      T('Save tasting note', 0, 17, MW - 40, 18, 14, P.bg, true, 'center'),
    ], { r: 8 }),
  ]);
}

// ─── DESKTOP SCREEN 1 — EDITORIAL HUB ────────────────────────────────────────
function desktopHub() {
  const featured = [
    { title: 'The return of\nPiedmont', sub: 'Barolo, Barbaresco & the new Langhe',  col: P.wine,  w: 360, h: 340 },
    { title: 'Loire\'s hidden\nwhites',   sub: 'Beyond Sancerre: Melon, Muscadet, Montlouis', col: P.amber, w: 360, h: 160 },
    { title: 'Natural wine\nreimagined', sub: 'The new wave of minimal-intervention winemakers', col: P.sage,  w: 360, h: 160 },
  ];

  return F(0, 0, PW, PH, P.bg, [
    // Minimal top nav — light mode
    F(0, 0, PW, 60, P.bg, [
      T('terroir', 48, 16, 140, 28, 20, P.deep, true, 'left', 1, -0.5),
      T('Discover', 220, 20, 80, 20, 13, P.deep),
      T('My Cellar', 308, 20, 92, 20, 13, P.sub),
      T('Pairings', 408, 20, 80, 20, 13, P.sub),
      T('Notes', 496, 20, 60, 20, 13, P.sub),
      // Search
      F(PW - 280, 14, 180, 32, P.white, [
        R(0, 0, 180, 32, P.border, { r: 16 }),
        T('Search wines, regions…', 16, 9, 164, 14, 11, P.sub),
      ], { r: 16 }),
      R(PW - 60 - 36, 14, 36, 36, P.wineL, { r: 18 }),
      T('RS', PW - 60 - 36, 22, 36, 20, 11, P.wine, true, 'center'),
      Line(0, 59, PW, 1, P.border),
    ]),

    // Left column: editorial hero (simulating large wine photography)
    F(48, 76, 640, PH - 120, P.bg, [
      // Full-bleed cinematic color block (photo simulation)
      F(0, 0, 640, 400, P.wine, [
        R(0, 0, 640, 400, P.deep, { op: 0.25 }),
        E(160, -40, 320, 320, P.amber, 0.06),
        E(400, 80, 240, 240, P.wineL, 0.08),
        T('Cover story · March 2026', 32, 32, 576, 16, 10, P.sand, false, 'left', 0.7),
        T('The return\nof Piedmont', 32, 60, 576, 160, 52, P.bg, true, 'left', 1, -1.5),
        T('Barolo, Barbaresco & the renaissance\nof the Langhe appellation', 32, 240, 576, 44, 14, P.sand, false, 'left', 0.85, 0.2),
        // Author + read more
        F(32, 308, 200, 28, 'transparent', [
          R(0, 0, 200, 28, P.bg, { op: 0.2, r: 4 }),
          T('Read the story →', 0, 7, 200, 14, 11, P.bg, true, 'center'),
        ], { r: 4 }),
        // Wine score
        F(32, 356, 200, 28, 'transparent', [
          ...ScoreDots(0, 8, 5, 5, P.sand),
          T('Exceptional vintage', 72, 8, 200, 14, 10, P.sand),
        ]),
      ], { r: 8 }),

      // Below-hero editorial text
      T('This month in the cellar', 0, 416, 640, 20, 13, P.sub, false, 'left', 0.7),
      T('Piedmont\'s slow-cooked excellence is back at the top of the global fine wine conversation. We\'ve been cellaring three Barolos from the stellar 2019 vintage and testing them against the canonical 2016s. The results are unexpected.', 0, 440, 580, 56, 13, P.sub, false, 'left', 1, 0.1),
      Line(0, 508, 640, 1, P.border),
      T('Explore the full report →', 0, 520, 640, 20, 12, P.wine, true),
    ]),

    // Right column: editorial grid of articles + recent adds
    F(PW - 700, 76, 652, PH - 120, P.bg, [
      T('Latest stories', 0, 8, 400, 20, 13, P.sub, false, 'left', 0.7),
      Line(0, 30, 652, 1, P.border),

      // Two editorial cards
      ...featured.slice(1).map((f, i) =>
        F(0, 40 + i * 184, 652, 172, f.col, [
          R(0, 0, 652, 172, P.deep, { op: 0.2 }),
          T(f.title, 24, 28, 400, 72, 24, P.bg, true, 'left', 1, -0.5),
          T(f.sub,   24, 110, 540, 32, 11, P.sand, false, 'left', 0.8, 0.2),
          T('→', 612, 70, 32, 32, 22, P.sand, false, 'right', 0.6),
        ], { r: 8 })
      ),

      // Recently added section
      T('Recently added to your cellar', 0, 416, 500, 20, 13, P.sub, false, 'left', 0.7),
      Line(0, 438, 652, 1, P.border),
      ...[
        { name: 'Tignanello', region: 'Tuscany', year: 2019, col: P.wine  },
        { name: 'Condrieu',   region: 'Rhône',   year: 2021, col: P.amber },
        { name: 'Etna Bianco',region: 'Sicily',  year: 2022, col: P.sage  },
      ].map((w, i) =>
        F(0, 448 + i * 60, 652, 52, P.white, [
          R(0, 0, 652, 52, P.border, { op: 0.5, r: 8 }),
          R(0, 0, 4, 52, w.col),
          T(w.name,   16, 10, 360, 18, 13, P.deep, true),
          T(`${w.region} · ${w.year}`, 16, 30, 360, 14, 10, P.sub),
          T('Added today', 500, 18, 140, 14, 9, P.sub, false, 'right', 0.6),
          ...ScoreDots(500, 34, 4, 5, w.col, 8),
        ], { r: 8 })
      ),
    ]),

    // Footer bar
    F(0, PH - 44, PW, 44, P.bg, [
      Line(0, 0, PW, 1, P.border),
      T('terroir — wine discovery & cellar management', 48, 14, 400, 18, 10, P.sub, false, 'left', 0.6),
    ]),
  ]);
}

// ─── DESKTOP SCREEN 2 — WINE DETAIL (MAGAZINE LAYOUT) ─────────────────────────
function desktopWineDetail() {
  const aromas = ['Dark cherry', 'Dried roses', 'Tar', 'Leather', 'Tobacco', 'Liquorice'];
  return F(0, 0, PW, PH, P.bg, [
    // Nav
    F(0, 0, PW, 60, P.bg, [
      T('terroir', 48, 16, 140, 28, 20, P.deep, true, 'left', 1, -0.5),
      T('← Discover / Piedmont / Barolo', 220, 20, 400, 20, 11, P.sub),
      F(PW - 280, 14, 180, 32, P.white, [
        R(0, 0, 180, 32, P.border, { r: 16 }),
        T('Search wines, regions…', 16, 9, 164, 14, 11, P.sub),
      ], { r: 16 }),
      Line(0, 59, PW, 1, P.border),
    ]),

    // Left panel: cinematic wine hero (photo simulation)
    F(0, 60, 560, PH - 60, P.wine, [
      R(0, 0, 560, PH - 60, P.deep, { op: 0.18 }),
      E(-80, 40, 400, 400, P.amber, 0.07),
      E(200, -60, 360, 360, P.wineL, 0.08),
      // Producer mark / winery
      T('Poderi Aldo Conterno', 40, 60, 480, 20, 12, P.sand, false, 'left', 0.7),
      T('Vigna Rionda', 40, 84, 480, 56, 48, P.bg, true, 'left', 1, -1),
      T('Barolo DOCG · 2019', 40, 148, 480, 24, 16, P.sand),

      // Rating
      F(40, 196, 300, 32, 'transparent', [
        ...ScoreDots(0, 8, 4, 5, P.sand, 14),
        T('4.2 / 5.0', 84, 6, 100, 20, 13, P.sand, true),
        T('47 tasting notes', 200, 10, 160, 14, 10, P.sand, false, 'left', 0.6),
      ]),

      Line(40, 244, 480, 1, P.sand, 0.2),

      // Key facts
      ...[
        ['Appellation', 'Barolo DOCG'],
        ['Grape',       'Nebbiolo 100%'],
        ['Vintage',     '2019'],
        ['ABV',         '14.5%'],
        ['Type',        'Red — Full body'],
        ['Ageing',      '3yr Slavonian oak'],
      ].map(([k, v], i) =>
        F(40, 260 + i * 44, 480, 36, 'transparent', [
          T(k, 0, 10, 200, 16, 10, P.sand, false, 'left', 0.6),
          T(v, 200, 10, 280, 16, 12, P.bg, true),
          Line(0, 35, 480, 1, P.sand, 0.1),
        ])
      ),

      // Add to cellar button
      F(40, PH - 140, 200, 48, P.bg, [
        T('Add to cellar', 0, 15, 200, 18, 13, P.wine, true, 'center'),
      ], { r: 8 }),
    ]),

    // Right panel: article content
    F(560, 60, PW - 560, PH - 60, P.bg, [
      F(48, 32, PW - 608, PH - 92, P.bg, [
        T('Tasting Notes', 0, 0, 600, 22, 16, P.deep, true, 'left', 1, -0.3),
        T('Complex and full-bodied. The nose opens with dried roses, tar, and dark cherry. On the palate, firm tannins frame flavors of leather, tobacco, and dried fruit. Long, persistent finish with mineral notes. Best after 2 hours decanting.', 0, 30, 740, 72, 13, P.sub, false, 'left', 1, 0.15),

        // Aroma wheel simulation
        T('Detected aromas', 0, 116, 600, 18, 13, P.deep, true),
        F(0, 138, 740, 40, 'transparent',
          aromas.map((a, i) => Pill(i * (a.length * 7 + 28), 8, a, P.wine))
        ),

        Line(0, 188, 740, 1, P.border),

        // Drinking window
        T('Drinking window', 0, 204, 600, 18, 13, P.deep, true),
        F(0, 228, 740, 60, P.sandL, [
          T('2019', 16, 8, 60, 14, 9, P.sub, false, 'left', 0.6),
          T('2024', 16, 8, 740 - 32, 14, 9, P.sub, false, 'right', 0.6),
          R(16, 30, 740 - 32, 8, P.border, { r: 4 }),
          R(16 + Math.round((740 - 32) * 0.3), 28, Math.round((740 - 32) * 0.45), 12, P.wine, { r: 5 }),
          T('Peak: 2027 – 2031', 16, 44, 740 - 32, 12, 9, P.wine, true, 'center', 0.8),
        ], { r: 8 }),

        Line(0, 298, 740, 1, P.border),

        // Food pairings
        T('Food pairings', 0, 314, 600, 18, 13, P.deep, true),
        F(0, 340, 740, 40, 'transparent', [
          Pill(0, 8, 'Braised lamb', P.wine),
          Pill(104, 8, 'Beef cheeks', P.wine),
          Pill(196, 8, 'Aged Pecorino', P.amber),
          Pill(310, 8, 'Truffle pasta', P.sage),
          Pill(420, 8, 'Ossobuco', P.wine),
        ]),

        Line(0, 390, 740, 1, P.border),

        // Similar wines
        T('You might also like', 0, 406, 600, 18, 13, P.deep, true),
        ...[
          { name: 'Barbaresco DOCG 2019',  producer: 'Gaja',          col: P.wine  },
          { name: 'Brunello di Montalcino', producer: 'Banfi · 2018',  col: P.wine  },
          { name: 'Barolo Chinato',         producer: 'Cappellano',    col: P.amber },
        ].map((w, i) =>
          F(0, 432 + i * 64, 740, 56, P.white, [
            R(0, 0, 740, 56, P.border, { op: 0.5, r: 6 }),
            R(0, 0, 4, 56, w.col),
            T(w.name, 16, 10, 480, 18, 13, P.deep, true),
            T(w.producer, 16, 30, 480, 14, 10, P.sub),
            T('→', 704, 18, 32, 20, 16, P.sub, false, 'right', 0.5),
          ], { r: 6 })
        ),
      ]),
    ]),
  ]);
}

// ─── DESKTOP SCREEN 3 — CELLAR BENTO GRID ─────────────────────────────────────
function desktopCellar() {
  // Bento grid parameters
  const marginL = 48, marginR = 48;
  const usableW = PW - marginL - marginR;   // 1344
  const gap     = 16;
  const cols    = 4;
  const unit    = (usableW - gap * (cols - 1)) / cols;   // 324
  const rowH    = 192;

  const x = (c) => marginL + c * (unit + gap);
  const y = (r) => 100 + r * (rowH + gap);  // 100 = below nav
  const w = (span) => span * unit + (span - 1) * gap;
  const h = (span) => span * rowH + (span - 1) * gap;

  return F(0, 0, PW, PH, P.bg, [
    // Nav
    F(0, 0, PW, 60, P.bg, [
      T('terroir', 48, 16, 140, 28, 20, P.deep, true, 'left', 1, -0.5),
      T('My Cellar', 220, 20, 100, 20, 13, P.deep, true),
      T('24 bottles', 328, 22, 80, 16, 11, P.sub),
      F(PW - 280, 14, 180, 32, P.white, [
        R(0, 0, 180, 32, P.border, { r: 16 }),
        T('Search wines, regions…', 16, 9, 164, 14, 11, P.sub),
      ], { r: 16 }),
      Line(0, 59, PW, 1, P.border),
    ]),

    // ── ROW 0 ──────────────────────────────────────────────────────────────────
    // [0,0] 2-wide × 2-tall: Hero "My Cellar" on wine bg
    Tile(x(0), y(0), w(2), h(2), P.wine, [
      R(0, 0, w(2), h(2), P.deep, { op: 0.15 }),
      E(-40, -40, 280, 280, P.amber, 0.08),
      T('24', 40, 40, 300, 140, 112, P.bg, true, 'left', 1, -4),
      T('bottles in\nyour cellar', 40, 168, w(2) - 80, 56, 22, P.bg, true, 'left', 1, -0.5),
      T('Across 6 regions · est. value $3,840', 40, 240, w(2) - 80, 20, 12, P.sand),
      // Mini region bars
      Line(40, 276, w(2) - 80, 1, P.sand, 0.2),
      ...['France', 'Italy', 'Spain', 'Others'].map((reg, i) => {
        const pcts = [0.46, 0.33, 0.13, 0.08];
        return F(40, 288 + i * 28, w(2) - 80, 22, 'transparent', [
          T(reg, 0, 4, 120, 14, 10, P.sand, false, 'left', 0.7),
          R(130, 8, w(2) - 80 - 130 - 40, 6, P.sand, { r: 3, op: 0.2 }),
          R(130, 8, Math.round((w(2) - 80 - 130 - 40) * pcts[i]), 6, P.sand, { r: 3, op: 0.6 }),
          T(`${Math.round(pcts[i] * 100)}%`, w(2) - 80 - 36, 4, 36, 14, 10, P.sand, false, 'right', 0.7),
        ]);
      }),
    ]),

    // [2,0] 1×1: Oldest bottle
    Tile(x(2), y(0), unit, rowH, P.amberL, [
      T('Oldest bottle', 20, 20, unit - 40, 16, 10, P.sub),
      T('2009', 20, 44, unit - 40, 60, 48, P.amber, true, 'left', 1, -2),
      T('Barolo Riserva · Giacomo Conterno', 20, 110, unit - 40, 28, 10, P.sub),
      ...ScoreDots(20, 158, 5, 5, P.amber, 8),
    ]),

    // [3,0] 1×1: Average rating
    Tile(x(3), y(0), unit, rowH, P.wineL, [
      T('Avg. rating', 20, 20, unit - 40, 16, 10, P.sub),
      T('4.2', 20, 44, unit - 40, 60, 48, P.wine, true, 'left', 1, -2),
      T('across 24 bottles', 20, 114, unit - 40, 16, 10, P.sub),
      ...ScoreDots(20, 158, 4, 5, P.wine, 8),
      T('+', 20 + 4 * 14, 154, 12, 16, 14, P.wine, false, 'left', 0.5),
    ]),

    // ── ROW 1 ──────────────────────────────────────────────────────────────────
    // [2,1] 2-wide × 1-tall: Drinking window timeline
    Tile(x(2), y(1), w(2), rowH, P.sandL, [
      T('Drink now / soon', 20, 20, w(2) - 40, 16, 11, P.sub),
      T('3 bottles at peak', 20, 40, w(2) - 40, 22, 14, P.deep, true),
      // Three wine items with drinking status
      ...[
        { name: 'Tignanello 2016',     status: 'Drink now', col: P.wine  },
        { name: 'Châteauneuf 2018',    status: 'Drink now', col: P.amber },
        { name: 'Barolo Chinato 2019', status: '1–2 years', col: P.sage  },
      ].map((item, i) =>
        F(20, 72 + i * 36, w(2) - 40, 30, 'transparent', [
          R(0, 8, 8, 14, item.col, { r: 2 }),
          T(item.name, 16, 6, w(2) - 140, 18, 11, P.deep, true),
          F(w(2) - 120, 4, 100, 22, item.col, [
            R(0, 0, 100, 22, item.col, { op: 0.12, r: 4 }),
            T(item.status, 0, 5, 100, 12, 9, item.col, true, 'center'),
          ], { r: 4 }),
        ])
      ),
    ]),

    // ── ROW 2 ──────────────────────────────────────────────────────────────────
    // [0,2] 1×1: Reds count
    Tile(x(0), y(2), unit, rowH, P.wineL, [
      T('Red wines', 20, 20, unit - 40, 16, 10, P.sub),
      T('14', 20, 44, unit - 40, 60, 48, P.wine, true, 'left', 1, -2),
      T('58% of cellar', 20, 112, unit - 40, 16, 10, P.sub, false, 'left', 0.7),
      Line(20, 140, unit - 40, 1, P.border),
      T('Top: Barolo, Rhône blends', 20, 150, unit - 40, 28, 9, P.sub, false, 'left', 0.7),
    ]),

    // [1,2] 1×1: Whites count
    Tile(x(1), y(2), unit, rowH, P.amberL, [
      T('White wines', 20, 20, unit - 40, 16, 10, P.sub),
      T('8', 20, 44, unit - 40, 60, 48, P.amber, true, 'left', 1, -2),
      T('33% of cellar', 20, 112, unit - 40, 16, 10, P.sub, false, 'left', 0.7),
      Line(20, 140, unit - 40, 1, P.border),
      T('Top: Loire, Burgundy', 20, 150, unit - 40, 28, 9, P.sub, false, 'left', 0.7),
    ]),

    // [2,2] 1×1: Est value
    Tile(x(2), y(2), unit, rowH, P.sageL, [
      T('Est. value', 20, 20, unit - 40, 16, 10, P.sub),
      T('$3,840', 20, 44, unit - 40, 60, 32, P.sage, true, 'left', 1, -1),
      T('24 bottles · avg $160', 20, 88, unit - 40, 16, 10, P.sub, false, 'left', 0.7),
      Line(20, 120, unit - 40, 1, P.border),
      T('↑ +$210 this month', 20, 130, unit - 40, 16, 10, P.sage, false, 'left', 0.8),
      T('(added 2 bottles)', 20, 150, unit - 40, 16, 9, P.sub, false, 'left', 0.6),
    ]),

    // [3,2] 1×1: Add bottle CTA
    Tile(x(3), y(2), unit, rowH, P.deep, [
      T('+', 20, 32, unit - 40, 80, 64, P.bg, false, 'left', 1, -2),
      T('Add a bottle', 20, 112, unit - 40, 20, 13, P.bg, true),
      T('Scan, search, or type', 20, 136, unit - 40, 16, 10, P.sand),
      F(20, 158, unit - 40, 24, 'transparent', [
        R(0, 0, unit - 40, 24, P.bg, { op: 0.15, r: 4 }),
        T('Add now →', 0, 5, unit - 40, 14, 10, P.bg, true, 'center'),
      ], { r: 4 }),
    ]),

    // Footer
    F(0, PH - 44, PW, 44, P.bg, [
      Line(0, 0, PW, 1, P.border),
      T('terroir — wine discovery & cellar management', 48, 14, 500, 18, 10, P.sub, false, 'left', 0.6),
    ]),
  ]);
}

// ─── DESKTOP SCREEN 4 — WINERY SPOTLIGHT (CINEMATIC) ──────────────────────────
function desktopWinery() {
  const wines = [
    { name: 'Vigna Rionda',     vintage: 2019, score: 4.5, price: '$180', col: P.wine  },
    { name: 'Cascina Francia',  vintage: 2019, score: 4.2, price: '$120', col: P.wine  },
    { name: 'Bussia Riserva',   vintage: 2016, score: 4.8, price: '$240', col: P.amber },
    { name: 'Langhe Rosso',     vintage: 2021, score: 3.9, price: '$48',  col: P.sage  },
  ];

  return F(0, 0, PW, PH, P.bg, [
    // Nav
    F(0, 0, PW, 60, P.bg, [
      T('terroir', 48, 16, 140, 28, 20, P.deep, true, 'left', 1, -0.5),
      T('← Piedmont / Barolo / Producers', 220, 20, 360, 20, 11, P.sub),
      Line(0, 59, PW, 1, P.border),
    ]),

    // Cinematic full-width winery hero
    F(0, 60, PW, 320, P.amber, [
      R(0, 0, PW, 320, P.deep, { op: 0.3 }),
      E(-100, -80, 600, 500, P.wine, 0.12),
      E(PW - 400, -100, 600, 500, P.amberL, 0.08),
      T('WINERY SPOTLIGHT', 80, 40, 400, 16, 9, P.sand, true, 'left', 0.6, 3),
      T('Poderi Aldo\nConterno', 80, 64, 800, 160, 72, P.bg, true, 'left', 1, -2),
      T('Monforte d\'Alba, Piedmont  ·  Est. 1969  ·  Barolo DOCG', 80, 240, 680, 22, 13, P.sand),
      T('One of the most celebrated estates in all of Barolo, Aldo Conterno pioneered\nthe modernist approach to Nebbiolo without sacrificing the grape\'s timeless structure.', 80, 268, 780, 48, 12, P.sand, false, 'left', 0.8, 0.2),
    ]),

    // Winery stats strip
    F(0, 380, PW, 64, P.white, [
      Line(0, 0, PW, 1, P.border),
      Line(0, 63, PW, 1, P.border),
      ...[
        ['Established',    '1969'],
        ['Hectares',       '28 ha'],
        ['Annual bottles', '85,000'],
        ['Appellations',   '3'],
        ['Avg. score',     '4.3 / 5'],
      ].map(([k, v], i) =>
        F(80 + i * 260, 0, 240, 64, 'transparent', [
          T(k, 12, 14, 216, 14, 9, P.sub),
          T(v, 12, 32, 216, 22, 16, P.deep, true),
        ])
      ),
    ]),

    // Wine lineup
    F(48, 464, PW - 96, PH - 508, P.bg, [
      T('Their wines in your region', 0, 0, 400, 18, 13, P.sub, false, 'left', 0.7),
      Line(0, 22, PW - 96, 1, P.border),
      ...wines.map((w, i) => {
        const cw = Math.floor((PW - 96 - 48) / 4);
        return F(i * (cw + 16), 32, cw, 180, P.white, [
          R(0, 0, cw, 5, w.col),
          T(w.name, 16, 20, cw - 32, 40, 15, P.deep, true, 'left', 1, -0.3),
          T(`Barolo DOCG · ${w.vintage}`, 16, 66, cw - 32, 16, 10, P.sub),
          Line(16, 92, cw - 32, 1, P.border),
          T(w.price, 16, 104, 100, 22, 16, P.deep, true),
          ...ScoreDots(16, 134, Math.floor(w.score), 5, w.col, 8),
          T(w.score.toFixed(1), 16 + 5 * 14, 130, 40, 18, 11, w.col, true),
          F(cw - 100, 148, 84, 24, w.col, [
            R(0, 0, 84, 24, w.col, { op: 0.12, r: 4 }),
            T('Add →', 0, 5, 84, 14, 10, w.col, true, 'center'),
          ], { r: 4 }),
        ], { r: 8 });
      }),
    ]),

    // Footer
    F(0, PH - 44, PW, 44, P.bg, [
      Line(0, 0, PW, 1, P.border),
      T('terroir — wine discovery & cellar management', 48, 14, 500, 18, 10, P.sub, false, 'left', 0.6),
    ]),
  ]);
}

// ─── DESKTOP SCREEN 5 — ANALYTICS DASHBOARD ──────────────────────────────────
function desktopAnalytics() {
  const byRegion = [
    { label: 'France',  value: '$1,770', pct: 0.46, col: P.wine  },
    { label: 'Italy',   value: '$1,270', pct: 0.33, col: P.amber },
    { label: 'Spain',   value: '$500',   pct: 0.13, col: P.sage  },
    { label: 'Others',  value: '$300',   pct: 0.08, col: P.sub   },
  ];

  const monthlySpend = [480, 120, 0, 240, 180, 360, 420, 60, 300, 240, 180, 240];
  const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const maxSpend = Math.max(...monthlySpend);
  const chartW = 540, chartH = 180;
  const barW = Math.floor(chartW / monthlySpend.length) - 6;

  return F(0, 0, PW, PH, P.bg, [
    F(0, 0, PW, 60, P.bg, [
      T('terroir', 48, 16, 140, 28, 20, P.deep, true, 'left', 1, -0.5),
      T('Analytics', 220, 20, 100, 20, 13, P.deep, true),
      Line(0, 59, PW, 1, P.border),
    ]),

    // KPI strip
    F(48, 72, PW - 96, 80, P.white, [
      ...[
        { label: 'Total bottles',  value: '24',     col: P.wine  },
        { label: 'Est. value',     value: '$3,840', col: P.amber },
        { label: 'Avg. per bottle',value: '$160',   col: P.sage  },
        { label: 'Tasting notes',  value: '67',     col: P.sub   },
        { label: 'Streak',         value: '12 days',col: P.wine  },
      ].map(({ label, value, col }, i) =>
        F(i * ((PW - 96) / 5), 0, (PW - 96) / 5, 80, 'transparent', [
          i > 0 ? Line(0, 16, 1, 48, P.border) : null,
          T(label, 20, 18, (PW - 96) / 5 - 40, 14, 9, P.sub),
          T(value, 20, 36, (PW - 96) / 5 - 40, 28, 20, col, true),
        ])
      ),
      Line(0, 0, PW - 96, 1, P.border),
      Line(0, 79, PW - 96, 1, P.border),
    ], { r: 8 }),

    // Left: spending chart
    F(48, 172, 600, 300, P.white, [
      T('Monthly spending (2025)', 24, 20, 400, 18, 13, P.deep, true),
      T('Total: $2,820', 24, 42, 400, 16, 11, P.sub),
      Line(0, 64, 600, 1, P.border),
      // Bar chart
      ...monthlySpend.map((v, i) => {
        const bh = v > 0 ? Math.round(chartH * v / maxSpend) : 4;
        const bx = 24 + i * (barW + 6);
        const by = 72 + chartH - bh;
        return F(bx, by, barW, bh, i === 2 ? P.border : P.wine, [
          R(0, 0, barW, bh, P.wine, { op: i === 2 ? 0.2 : 0.8, r: 3 }),
        ]);
      }),
      ...months.map((m, i) =>
        T(m, 24 + i * (barW + 6), 72 + chartH + 8, barW, 14, 9, P.sub, false, 'center')
      ),
    ], { r: 8 }),

    // Right: region breakdown
    F(672, 172, 360, 300, P.white, [
      T('By region', 24, 20, 300, 18, 13, P.deep, true),
      T('Est. value', 24, 42, 300, 16, 11, P.sub),
      Line(0, 64, 360, 1, P.border),
      ...byRegion.map((r, i) =>
        F(24, 80 + i * 52, 312, 44, 'transparent', [
          R(0, 14, 8, 16, r.col, { r: 2 }),
          T(r.label, 20, 8, 200, 18, 12, P.deep, true),
          T(r.value, 20, 28, 200, 14, 10, P.sub),
          T(`${Math.round(r.pct * 100)}%`, 232, 14, 60, 16, 12, r.col, true, 'right'),
          R(0, 38, 312, 4, P.border, { r: 2 }),
          R(0, 38, Math.round(312 * r.pct), 4, r.col, { r: 2 }),
        ])
      ),
    ], { r: 8 }),

    // Right: grape breakdown
    F(PW - 400, 172, 352, 300, P.white, [
      T('By grape variety', 24, 20, 304, 18, 13, P.deep, true),
      Line(0, 44, 352, 1, P.border),
      ...[
        { grape: 'Nebbiolo',          pct: 0.21, col: P.wine  },
        { grape: 'Sauvignon Blanc',   pct: 0.17, col: P.amber },
        { grape: 'Grenache',          pct: 0.13, col: P.wine  },
        { grape: 'Chardonnay',        pct: 0.12, col: P.amber },
        { grape: 'Sangiovese',        pct: 0.10, col: P.sage  },
        { grape: 'Other (18)',        pct: 0.27, col: P.sub   },
      ].map((g, i) =>
        RegionStrip(24, 54 + i * 38, 304, g.grape, g.pct, g.col)
      ),
    ], { r: 8 }),

    // Bottom: top rated wines
    F(48, 492, PW - 96, 220, P.white, [
      T('Your top-rated bottles', 24, 20, 600, 18, 13, P.deep, true),
      Line(0, 44, PW - 96, 1, P.border),
      ...[
        { name: 'Barolo Bussia Riserva', region: 'Piedmont · 2016', score: 4.8, col: P.wine  },
        { name: 'Pouilly-Fumé',          region: 'Loire · 2022',    score: 4.7, col: P.amber },
        { name: 'Tignanello',            region: 'Tuscany · 2016',  score: 4.6, col: P.wine  },
        { name: 'Condrieu Coteau',       region: 'Rhône · 2020',    score: 4.5, col: P.sage  },
      ].map((w, i) => {
        const cw = (PW - 96 - 72) / 4;
        return F(24 + i * (cw + 24), 56, cw, 144, P.bg, [
          R(0, 0, cw, 3, w.col),
          T(`${i + 1}`, 12, 14, 32, 20, 14, w.col, true),
          T(w.name,   12, 36, cw - 24, 32, 13, P.deep, true, 'left', 1, -0.3),
          T(w.region, 12, 72, cw - 24, 16, 10, P.sub),
          F(12, 96, 120, 20, 'transparent', [
            ...ScoreDots(0, 4, Math.floor(w.score), 5, w.col, 10),
            T(w.score.toFixed(1), 64, 2, 40, 16, 11, w.col, true),
          ]),
        ], { r: 6 });
      }),
    ], { r: 8 }),

    F(0, PH - 44, PW, 44, P.bg, [
      Line(0, 0, PW, 1, P.border),
      T('terroir — wine discovery & cellar management', 48, 14, 500, 18, 10, P.sub, false, 'left', 0.6),
    ]),
  ]);
}

// ─── ASSEMBLE & LAYOUT ────────────────────────────────────────────────────────
const screens = [
  mobileDiscover(),
  mobileWineDetail(),
  mobileCellar(),
  mobilePairing(),
  mobileLog(),
  desktopHub(),
  desktopWineDetail(),
  desktopCellar(),
  desktopWinery(),
  desktopAnalytics(),
];

let ox = 0;
const GAP = 60;
const laid = screens.map(s => {
  const out = { ...s, x: ox };
  ox += s.width + GAP;
  return out;
});

// ─── MINIFY ───────────────────────────────────────────────────────────────────
function minifyEl(el) {
  const o = { type: el.type, x: el.x || 0, y: el.y || 0, width: el.width, height: el.height };
  if (el.fill !== undefined) o.fill = el.fill;
  if (el.cornerRadius) o.cornerRadius = el.cornerRadius;
  if (el.opacity !== undefined && el.opacity < 0.999) o.opacity = el.opacity;
  if (el.type === 'text') {
    o.text = el.text;
    o.fontSize = el.fontSize;
    if (el.fontWeight === 700) o.fontWeight = 700;
    if (el.textAlign && el.textAlign !== 'left') o.textAlign = el.textAlign;
    if (el.letterSpacing) o.letterSpacing = el.letterSpacing;
  }
  if (el.children && el.children.length) o.children = el.children.map(minifyEl);
  return o;
}

const penDoc  = { version: '2.8', children: laid.map(minifyEl) };
const penJSON = JSON.stringify(penDoc);
const penB64  = Buffer.from(penJSON).toString('base64');
fs.writeFileSync('/workspace/group/design-studio/terroir.pen', penJSON);
console.log(`Pen JSON: ${(penJSON.length / 1024).toFixed(1)} KB`);

// ─── SVG THUMBNAILS ──────────────────────────────────────────────────────────
function renderElSVG(el, depth) {
  if (!el || depth > 5) return '';
  const x = el.x || 0, y = el.y || 0;
  const w = Math.max(0, el.width || 0), h = Math.max(0, el.height || 0);
  const fill = el.fill || 'none';
  const oA = (el.opacity !== undefined && el.opacity < 0.99) ? ` opacity="${el.opacity.toFixed(2)}"` : '';
  const rA = el.cornerRadius ? ` rx="${Math.min(el.cornerRadius, w / 2, h / 2)}"` : '';
  if (el.type === 'frame') {
    const bg   = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${rA}${oA}/>`;
    const kids = (el.children || []).map(c => renderElSVG(c, depth + 1)).join('');
    return kids ? `${bg}<g transform="translate(${x},${y})">${kids}</g>` : bg;
  }
  if (el.type === 'ellipse')
    return `<ellipse cx="${x+w/2}" cy="${y+h/2}" rx="${w/2}" ry="${h/2}" fill="${fill}"${oA}/>`;
  if (el.type === 'text') {
    const fh = Math.max(1, Math.min(h, (el.fontSize || 13) * 0.68));
    return `<rect x="${x}" y="${y+(h-fh)/2}" width="${w}" height="${fh}" fill="${fill}"${oA} rx="1"/>`;
  }
  return '';
}

function screenThumb(s, tw, th) {
  const flat = { ...s, x: 0, y: 0 };
  const kids = (flat.children || []).map(c => renderElSVG(c, 0)).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${flat.width} ${flat.height}" `
    + `width="${tw}" height="${th}" style="display:block;border-radius:6px;flex-shrink:0;box-shadow:0 2px 12px rgba(0,0,0,0.08)">`
    + `<rect width="${flat.width}" height="${flat.height}" fill="${flat.fill || P.bg}"/>`
    + `${kids}</svg>`;
}

const labels = ['M·Discover','M·Wine Detail','M·My Cellar','M·Pairing','M·Log Note',
                 'D·Hub','D·Wine Detail','D·Cellar Bento','D·Winery Spot.','D·Analytics'];

const thumbsHTML = screens.map((s, i) => {
  const mobile = i < 5;
  const th = 160;
  const tw = mobile ? Math.round(th * MW / MH) : Math.round(th * PW / PH);
  return `<div style="display:flex;flex-direction:column;align-items:center;gap:8px">`
    + screenThumb(s, tw, th)
    + `<span style="font-size:9px;letter-spacing:1.5px;color:#7A6B5C;white-space:nowrap">${labels[i]}</span></div>`;
}).join('');

// ─── BUILD HTML ───────────────────────────────────────────────────────────────
const tagsHTML = ['BENTO GRID','EDITORIAL LAYOUT','LIGHT MODE','WARM EARTHY PALETTE','WINE APP']
  .map(t => `<span style="border:1px solid #E4D9CC;color:#7A6B5C;padding:4px 12px;border-radius:20px;font-size:10px;letter-spacing:1px">${t}</span>`)
  .join('');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>TERROIR — Wine Discovery & Cellar App</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#F8F4EE;color:#1A0E06;font-family:system-ui,-apple-system,Georgia,sans-serif;min-height:100vh}
a{color:inherit;text-decoration:none}
::-webkit-scrollbar{height:4px;width:4px}
::-webkit-scrollbar-track{background:#F0EBE3}
::-webkit-scrollbar-thumb{background:#D4C4A8;border-radius:4px}
.nav{display:flex;justify-content:space-between;align-items:center;padding:0 40px;height:60px;border-bottom:1px solid #E4D9CC}
.logo{font-size:18px;font-weight:700;letter-spacing:-0.5px;color:#1A0E06}
.nav-tag{font-size:11px;letter-spacing:2px;color:#7A6B5C}
.hero{padding:72px 40px 56px;border-bottom:1px solid #E4D9CC;max-width:880px}
.kicker{font-size:10px;letter-spacing:3px;color:#7A6B5C;margin-bottom:20px;text-transform:uppercase}
.headline{font-size:clamp(40px,6vw,76px);font-weight:700;line-height:0.95;letter-spacing:-2px;margin-bottom:8px;color:#1A0E06}
.headline em{font-style:normal;color:#6B1A2A}
.sub{font-size:clamp(16px,2vw,24px);font-weight:400;color:#7A6B5C;letter-spacing:1px;margin-bottom:24px}
.desc{font-size:14px;color:#7A6B5C;max-width:560px;line-height:1.8;margin-bottom:28px}
.tags{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:36px}
.btns{display:flex;gap:10px;flex-wrap:wrap}
.btn{background:#6B1A2A;color:#F8F4EE;border:none;padding:12px 24px;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer;letter-spacing:0.5px}
.btn:hover{background:#7d1e32}
.btn-ghost{background:#fff;color:#1A0E06;border:1px solid #E4D9CC;padding:12px 24px;border-radius:6px;font-size:12px;cursor:pointer}
.btn-ghost:hover{border-color:#6B1A2A;color:#6B1A2A}
.thumbs-section{padding:48px 40px 56px;border-bottom:1px solid #E4D9CC}
.thumbs-label{font-size:10px;letter-spacing:3px;color:#7A6B5C;margin-bottom:16px;text-transform:uppercase}
.thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
.reflection{padding:56px 40px 80px;max-width:780px}
.reflection-label{font-size:10px;letter-spacing:3px;color:#7A6B5C;margin-bottom:28px;text-transform:uppercase}
.reflection p{font-size:14px;color:#7A6B5C;line-height:1.82;margin-bottom:20px}
.reflection strong{color:#1A0E06}
.reflection a{color:#6B1A2A}
.reflection em{color:#B8631A;font-style:normal}
.footer{display:flex;justify-content:space-between;align-items:center;padding:20px 40px;border-top:1px solid #E4D9CC;font-size:10px;color:#B0A090}
</style>
</head>
<body>
<nav class="nav">
  <span class="logo">terroir</span>
  <span class="nav-tag">HEARTBEAT · MARCH 2026</span>
</nav>

<section class="hero">
  <div class="kicker">Challenge · Wine Discovery & Cellar App · Different App Style · 10 Screens</div>
  <h1 class="headline">Discover<br><em>terroir</em></h1>
  <div class="sub">A wine discovery & cellar tracker</div>
  <p class="desc">A complete departure from the dark-void card-grid pattern. Light mode, warm cream base, bento asymmetric tiles, editorial magazine layouts. Inspired by the bento grid mosaic trend from Kreativa Studio on Dribbble and the warm cinematic editorial style from Superpower on Godly. Different palette, different structure, different industry.</p>
  <div class="tags">${tagsHTML}</div>
  <div class="btns">
    <button class="btn"       onclick="openInViewer()">▶ Open in viewer</button>
    <button class="btn-ghost" onclick="downloadPen()">↓ Download .pen</button>
    <button class="btn-ghost" onclick="shareOnX()">𝕏 Share</button>
    <button class="btn-ghost" onclick="location.href='https://zenbin.org/p/community-gallery'">← Gallery</button>
  </div>
</section>

<section class="thumbs-section">
  <div class="thumbs-label">Screen preview · 5 mobile + 5 desktop</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="reflection">
  <div class="reflection-label">Design Reflection ///</div>

  <p><strong>What I found:</strong> Rakis flagged that the last few heartbeat challenges were all the same structural pattern: dark background, horizontal top nav, uniform card grid, all-caps monospace labels, single neon accent. He was right. So I went looking for something structurally different. On Dribbble, Kreativa Studio's popular shot showed a <em>bento grid mosaic</em> — a brand identity tiled across asymmetric panels of different sizes and colors. On <a href="https://godly.website">Godly</a>, the Superpower health app used a <em>warm cinematic editorial aesthetic</em> — amber hero blocks simulating photography, human-centered warmth, no UI chrome in the hero. Both signals pointed away from everything I'd been building.</p>

  <p><strong>Challenge:</strong> Design a <strong>wine discovery and cellar tracking app</strong> — <em>terroir</em> — using a light mode, warm cream base, bento asymmetric tile grid (Desktop Screen 3), and editorial magazine layouts. Different industry (food/lifestyle), different background (warm cream vs dark void), different palette (burgundy + amber + sage vs neon-on-black), different typography approach (mixed-case, editorial sizing, not all-caps monospace everywhere).</p>

  <p><strong>Key design decisions:</strong> (1) <em>Bento tile grid</em> — the cellar dashboard (Desktop 3) uses a 4-column grid with tiles of varying span: a 2×2 "24 bottles" hero tile anchors the top-left, a 2×1 drinking-window strip sits at row 1 right, and four 1×1 stat tiles fill row 2. Each tile has its own background color (pale wine blush, pale amber, pale sage, deep near-black) — the color variation is the layout. (2) <em>Cinematic color block as photography</em> — with no actual image support in the pen format, the wine detail and winery spotlight screens use large flat color fills with subtle ellipse overlays at low opacity to simulate depth and warmth. The ellipses create the glow of ambient photography without needing bitmaps. (3) <em>ScoreDots() helper</em> — five small ellipses in a row, filled or empty, replace star ratings with a more refined dot pattern. Consistent across all screens at different sizes.</p>

  <p><strong>What I'd do differently:</strong> The mobile screens still feel slightly grid-heavy — especially the Cellar screen (Mobile 3) which is a uniform 2-column tile grid. To push the bento idea further on mobile, I'd break the grid: one full-width "headline bottle" tile at the top, then a 2-column asymmetric section below where one tile is taller than its neighbour. The non-uniformity is what makes bento feel like bento, not just a grid with colors.</p>
</section>

<footer class="footer">
  <span>RAM Design Studio · Heartbeat Challenge · Mar 2026</span>
  <span>zenbin.org/p/terroir</span>
</footer>

<script>
const D = '${penB64}';
function openInViewer() {
  try {
    localStorage.setItem('pv_pending', JSON.stringify({ json: atob(D), name: 'terroir.pen' }));
    window.open('https://zenbin.org/p/pen-viewer-3', '_blank');
  } catch(e) { alert('Error: ' + e.message); }
}
function downloadPen() {
  const blob = new Blob([atob(D)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'terroir.pen';
  a.click();
}
function shareOnX() {
  const txt = encodeURIComponent('Designed terroir — a wine cellar app with bento grid dashboard, warm editorial layouts, light mode. Totally different aesthetic from my usual dark-void designs. #UIDesign #HeartbeatChallenge');
  window.open('https://x.com/intent/tweet?text=' + txt + '&url=' + encodeURIComponent(location.href), '_blank');
}
</script>
</body>
</html>`;

console.log(`HTML: ${(html.length / 1024).toFixed(1)} KB`);

// ─── PUBLISH ──────────────────────────────────────────────────────────────────
function publishPage(slug, htmlContent) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title: 'TERROIR — Wine Discovery & Cellar App', html: htmlContent });
    const req = https.request({
      hostname: 'zenbin.org', port: 443, path: `/v1/pages/${slug}`,
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  const suffix = Date.now().toString(36).slice(-4);
  for (const slug of ['terroir', `terroir-${suffix}`]) {
    const r = await publishPage(slug, html);
    if (r.status === 200 || r.status === 201) {
      console.log(`✓ Published: https://zenbin.org/p/${slug}`);
      return;
    }
    if (r.status !== 409) { console.error(`✗ HTTP ${r.status}: ${r.body.slice(0, 200)}`); break; }
    console.log(`  Slug "${slug}" taken, trying next…`);
  }
})();
