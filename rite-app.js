'use strict';
// rite-app.js
// RITE — skin intelligence built on ritual
// Light editorial skincare ritual tracker
// Inspired by: Overlay.com (lapa.ninja) — "The Future of Beauty is Automated"
//   PP Editorial Old serif typography (thin italic + bold contrast)
//   Iridescent soft gradient palette, cream/lavender/blush
// Theme: LIGHT

const fs   = require('fs');
const path = require('path');

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const P = {
  bg:       '#FAF8F5',   // warm cream
  surface:  '#FFFFFF',   // white card
  surfaceB: '#F4F0EC',   // tinted card
  border:   '#E8E2DA',   // soft warm border
  text:      '#1A1720',  // deep mauve-black
  muted:    'rgba(26,23,32,0.38)',
  // Iridescent palette inspired by Overlay's light refractions
  violet:   '#8B7FD4',   // soft lavender-violet — primary
  blush:    '#D4847A',   // warm blush-terracotta — warmth
  sage:     '#7BA48A',   // sage green — natural
  gold:     '#C9A45A',   // warm gold — premium
  rose:     '#C4768A',   // dusty rose — glow
  // Gradient tints for cards
  gradV:    '#F0EDFF',   // very soft violet tint
  gradR:    '#FFF0EE',   // very soft blush tint
  gradS:    '#EEFAF2',   // very soft sage tint
};

const W = 375;
const H = 812;
const GAP = 80;

let _id = 1;
const uid = () => `n${_id++}`;

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'RECTANGLE', id: uid(), x, y, w, h, fill,
    cornerRadius: opts.r || 0,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
    ...(opts.stroke ? { stroke: opts.stroke, strokeWidth: opts.sw || 1 } : {}),
  };
}

function text(x, y, w, content, size, color, opts = {}) {
  return {
    type: 'TEXT', id: uid(), x, y, w, content,
    fontSize: size, color,
    fontWeight: opts.bold ? 700 : opts.medium ? 500 : opts.light ? 300 : 400,
    fontStyle: opts.italic ? 'italic' : 'normal',
    fontFamily: opts.serif ? 'Playfair Display' : opts.mono ? 'JetBrains Mono' : 'Inter',
    textAlign: opts.center ? 'center' : opts.right ? 'right' : 'left',
    lineHeight: opts.lh || (size <= 12 ? 1.5 : size <= 16 ? 1.55 : 1.25),
    letterSpacing: opts.ls || 0,
    opacity: opts.opacity || 1,
  };
}

function frame(x, y, w, h, children, opts = {}) {
  return {
    type: 'FRAME', id: uid(), x, y, w, h,
    fill: opts.fill || P.bg,
    clip: true,
    children: children.flat(Infinity).filter(Boolean),
  };
}

// ─── SHARED ───────────────────────────────────────────────────────────────────
function statusBar(x, y) {
  return [
    rect(x, y, W, 44, P.bg),
    text(x + 16, y + 14, 60, '9:41', 13, P.text, { medium: true, mono: true }),
    text(x + W - 64, y + 14, 52, '● ◆ ▮', 11, P.muted, { right: true }),
  ];
}

function topBar(x, y, title, sub, accentColor) {
  return [
    rect(x, y, W, 56, P.bg),
    // editorial serif title — inspired by PP Editorial Old mixed weight treatment
    text(x + 20, y + 8, W - 40, title, 24, P.text, { serif: true, bold: true, ls: -0.02 }),
    sub ? text(x + 20, y + 36, W - 40, sub, 9, accentColor || P.muted, { ls: 0.12 }) : null,
  ];
}

function navBar(x, y, activeIdx) {
  const tabs = [
    { icon: '☀', label: 'Ritual'  },
    { icon: '◎', label: 'Track'   },
    { icon: '✦', label: 'Shelf'   },
    { icon: '◇', label: 'Insight' },
    { icon: '◌', label: 'Profile' },
  ];
  const tw = W / 5;
  return [
    rect(x, y, W, 80, P.surface, { stroke: P.border, sw: 1 }),
    rect(x + W / 2 - 60, y + 72, 120, 4, P.surfaceB, { r: 2 }),
    ...tabs.map((t, i) => {
      const tx = x + i * tw;
      const on = i === activeIdx;
      return [
        on ? rect(tx + tw / 2 - 18, y + 8, 36, 36, P.gradV, { r: 10 }) : null,
        text(tx, y + 14, tw, t.icon, 16, on ? P.violet : P.muted, { center: true }),
        text(tx, y + 38, tw, t.label, 8, on ? P.violet : P.muted, { center: true }),
      ];
    }),
  ];
}

function card(x, y, w, h, bg, children) {
  return [
    rect(x, y, w, h, bg || P.surface, { r: 16, stroke: P.border, sw: 1 }),
    ...children.flat(Infinity).filter(Boolean),
  ];
}

function sectionLabel(x, y, label, color) {
  return text(x, y, 280, label, 9, color || P.muted, { ls: 0.12 });
}

function progressBar(x, y, w, pct, color) {
  return [
    rect(x, y, w, 6, P.surfaceB, { r: 3 }),
    rect(x, y, Math.round(w * pct), 6, color, { r: 3 }),
  ];
}

function chip(x, y, label, color) {
  const cw = label.length * 6.8 + 20;
  return [
    rect(x, y, cw, 22, `${color}18`, { r: 11, stroke: `${color}30`, sw: 1 }),
    text(x, y + 4, cw, label, 9, color, { center: true, medium: true }),
  ];
}

// Large editorial serif number — the key typographic motif from PP Editorial Old / Overlay
function editorialNum(x, y, value, unit, color) {
  const vw = value.length * 22;
  return [
    text(x, y, vw, value, 48, color, { serif: true, bold: true, italic: true, ls: -0.03 }),
    text(x + vw + 6, y + 28, 60, unit, 14, P.muted),
  ];
}

// ─── SCREEN 1 — RITUAL ────────────────────────────────────────────────────────
// Today's skincare ritual — step-by-step sequence
function screenRitual(ox, oy) {
  const x = ox, y = oy;

  const steps = [
    { name: 'Cleanser',    brand: 'CeraVe Hydrating',         time: '60s',  done: true,  color: P.sage  },
    { name: 'Toner',       brand: 'Paula\'s Choice BHA',      time: '30s',  done: true,  color: P.violet},
    { name: 'Vitamin C',   brand: 'SkinCeuticals C E Ferulic', time: '60s', done: false, color: P.gold  },
    { name: 'Moisturiser', brand: 'La Roche-Posay Toleriane',  time: '30s', done: false, color: P.blush },
    { name: 'SPF 50',      brand: 'Altruist Sunscreen',        time: '30s', done: false, color: P.rose  },
  ];

  return frame(x, y, W, H, [
    ...statusBar(x, y),
    ...topBar(x, y + 44, 'Morning', 'FRIDAY · MARCH 27', P.violet),

    // Editorial number — day streak
    ...editorialNum(x + 20, y + 106, '14', 'day streak', P.violet),
    text(x + 20, y + 162, W - 40, '2 of 5 steps done · 3 min remaining', 11, P.muted),

    sectionLabel(x + 20, y + 184, 'TODAY\'S RITUAL'),

    ...steps.map((s, i) => {
      const sy = y + 202 + i * 64;
      return [
        rect(x + 16, sy, W - 32, 52, s.done ? `${s.color}0E` : P.surface, {
          r: 14, stroke: s.done ? `${s.color}30` : P.border, sw: 1,
        }),
        // step circle
        rect(x + 28, sy + 12, 28, 28, s.done ? s.color : P.surfaceB, { r: 14, stroke: s.done ? 'transparent' : P.border, sw: 1 }),
        text(x + 28, sy + 18, 28, s.done ? '✓' : `${i+1}`, 11, s.done ? '#FFF' : P.muted, { center: true, bold: true }),
        // name + brand
        text(x + 66, sy + 10, W - 120, s.name, 14, s.done ? P.muted : P.text, { medium: true }),
        text(x + 66, sy + 28, W - 130, s.brand, 10, P.muted),
        // time
        text(x + W - 52, sy + 20, 36, s.time, 10, s.color, { right: true, mono: true }),
      ];
    }),

    // Insight strip
    rect(x + 16, y + 528, W - 32, 50, P.gradV, { r: 14, stroke: `${P.violet}20`, sw: 1 }),
    text(x + 24, y + 540, W - 48,
      '✦ UV index 6 today — don\'t skip SPF. Your skin is drier than usual this week.', 11, P.violet, { lh: 1.55 }),

    ...navBar(x, y + H - 80, 0),
  ]);
}

// ─── SCREEN 2 — TRACK ─────────────────────────────────────────────────────────
// Skin tracking — photo log, hydration score, streak
function screenTrack(ox, oy) {
  const x = ox, y = oy;

  return frame(x, y, W, H, [
    ...statusBar(x, y),
    ...topBar(x, y + 44, 'Skin Log', 'TRACK YOUR PROGRESS', P.blush),

    // Skin score — large editorial number
    ...editorialNum(x + 20, y + 106, '78', '/ 100 skin score', P.blush),
    text(x + 20, y + 162, W - 40, '↑ +4 pts vs last week · hydration improving', 11, P.muted),

    // Metric row
    ...card(x + 16, y + 186, W - 32, 66, P.surface, [
      ...[ { l: 'Hydration', v: '72%', c: P.violet }, { l: 'Barrier', v: '81%', c: P.sage }, { l: 'Texture', v: '68%', c: P.gold } ]
        .map((m, i) => {
          const mx = x + 28 + i * ((W - 44) / 3);
          return [
            text(mx, y + 198, (W - 44) / 3, m.v, 18, m.c, { bold: true, serif: true }),
            text(mx, y + 222, (W - 44) / 3, m.l, 9, P.muted),
          ];
        }),
    ]),

    // Photo log row — thumbnail grid
    sectionLabel(x + 20, y + 266, 'RECENT PHOTOS'),
    ...[ '#FDE8D8', '#F0E8F8', '#E8F4EC', '#FDF0E0', '#F8E8F0' ].map((bg, i) => {
      const px = x + 20 + i * 62;
      const isToday = i === 0;
      return [
        rect(px, y + 282, 54, 72, bg, { r: 10, stroke: isToday ? P.violet : P.border, sw: isToday ? 2 : 1 }),
        text(px, y + 318, 54, ['27', '26', '25', '24', '23'][i], 10, isToday ? P.violet : P.muted, { center: true, bold: true }),
        text(px, y + 332, 54, ['Today', 'Thu', 'Wed', 'Tue', 'Mon'][i], 8, P.muted, { center: true }),
      ];
    }),

    // Week chart
    sectionLabel(x + 20, y + 368, '7-DAY SKIN SCORE'),
    ...card(x + 16, y + 386, W - 32, 90, P.gradV, [
      ...[72, 68, 74, 71, 76, 74, 78].map((v, i) => {
        const bx = x + 28 + i * 44;
        const bh = Math.round((v / 100) * 54);
        return [
          rect(bx + 8, y + 426 - bh, 28, bh, P.violet, { r: 3, opacity: 0.6 + i * 0.06 }),
          text(bx, y + 432, 44, ['M','T','W','T','F','S','S'][i], 8, P.muted, { center: true }),
        ];
      }),
    ]),

    // Observations
    sectionLabel(x + 20, y + 490, 'OBSERVATIONS'),
    ...[ { t: 'Dryness detected', s: 'Cheek area — 3 days consistent', c: P.gold },
         { t: 'Glow improving',   s: 'Consistent Vit C application',  c: P.sage } ].map((obs, i) => {
      const oy2 = y + 508 + i * 58;
      return [
        rect(x + 16, oy2, W - 32, 48, i === 0 ? P.gradR : P.gradS, { r: 12, stroke: `${obs.c}25`, sw: 1 }),
        rect(x + 28, oy2 + 14, 20, 20, `${obs.c}22`, { r: 10 }),
        text(x + 28, oy2 + 17, 20, '●', 10, obs.c, { center: true }),
        text(x + 58, oy2 + 9, W - 100, obs.t, 13, P.text, { medium: true }),
        text(x + 58, oy2 + 27, W - 100, obs.s, 10, P.muted),
      ];
    }),

    ...navBar(x, y + H - 80, 1),
  ]);
}

// ─── SCREEN 3 — SHELF ─────────────────────────────────────────────────────────
// Product inventory — what's on your shelf
function screenShelf(ox, oy) {
  const x = ox, y = oy;

  const products = [
    { name: 'CeraVe Hydrating',     type: 'Cleanser',    score: 9.2, color: P.sage,   days: 28 },
    { name: 'SkinCeuticals C E Fer.','type': 'Vitamin C', score: 9.6, color: P.gold,   days: 14 },
    { name: 'La Roche-Posay Tol.',  type: 'Moisturiser', score: 8.8, color: P.blush,  days: 45 },
    { name: 'Altruist SPF 50',      type: 'Sunscreen',   score: 8.4, color: P.violet, days: 60 },
    { name: 'Paula\'s Choice BHA',  type: 'Exfoliant',   score: 9.0, color: P.rose,   days: 7  },
  ];

  return frame(x, y, W, H, [
    ...statusBar(x, y),
    ...topBar(x, y + 44, 'Shelf', 'YOUR RITUAL PRODUCTS', P.gold),

    // summary stat
    ...editorialNum(x + 20, y + 106, '5', 'products, 3 replenish soon', P.gold),

    sectionLabel(x + 20, y + 162, 'ACTIVE PRODUCTS'),

    ...products.map((p, i) => {
      const py = y + 180 + i * 70;
      const daysLow = p.days < 20;
      return [
        rect(x + 16, py, W - 32, 58, P.surface, { r: 14, stroke: daysLow ? `${P.blush}40` : P.border, sw: 1 }),
        // color swatch
        rect(x + 28, py + 12, 34, 34, `${p.color}20`, { r: 10, stroke: `${p.color}40`, sw: 1 }),
        text(x + 28, py + 22, 34, p.type[0], 12, p.color, { center: true, bold: true }),
        // name + type
        text(x + 72, py + 12, W - 140, p.name, 13, P.text, { medium: true }),
        text(x + 72, py + 30, W - 140, p.type, 10, P.muted),
        // score
        text(x + W - 70, py + 12, 50, `★ ${p.score}`, 11, p.color, { right: true }),
        // days strip
        daysLow
          ? [
              rect(x + 72, py + 43, W - 98, 4, `${P.blush}18`, { r: 2 }),
              rect(x + 72, py + 43, Math.round((W - 98) * (p.days / 60)), 4, P.blush, { r: 2 }),
              text(x + W - 62, py + 41, 50, `${p.days}d left`, 8, P.blush, { right: true }),
            ]
          : text(x + 72, py + 43, W - 100, `${p.days} days supply remaining`, 8, P.muted),
      ];
    }),

    // Add product CTA
    rect(x + 16, y + 535, W - 32, 44, P.gradV, { r: 14, stroke: `${P.violet}25`, sw: 1 }),
    text(x + 16, y + 551, W - 32, '+ Add product to your shelf', 13, P.violet, { center: true, medium: true }),

    ...navBar(x, y + H - 80, 2),
  ]);
}

// ─── SCREEN 4 — INSIGHT ───────────────────────────────────────────────────────
// AI skin intelligence — analysis and recommendations
function screenInsight(ox, oy) {
  const x = ox, y = oy;

  return frame(x, y, W, H, [
    ...statusBar(x, y),
    ...topBar(x, y + 44, 'Insight', 'YOUR SKIN INTELLIGENCE', P.violet),

    // Editorial intro
    text(x + 20, y + 106, W - 40,
      'Your barrier is strengthening.', 22, P.text, { serif: true, italic: true, lh: 1.3 }),
    text(x + 20, y + 140, W - 40,
      'Three weeks of consistent morning ritual have measurably improved your hydration and reduced trans-epidermal water loss.',
      12, P.muted, { lh: 1.7, light: true }),

    // Metrics grid
    ...card(x + 16, y + 210, W - 32, 72, P.surface, [
      ...[
        { l: 'TEWL',      v: '−12%', c: P.sage,  note: 'vs 30d ago' },
        { l: 'Hydration', v: '+8pt', c: P.violet, note: 'vs baseline' },
        { l: 'Redness',   v: '−5%',  c: P.blush,  note: 'this week'  },
      ].map((m, i) => {
        const mx = x + 28 + i * ((W - 44) / 3);
        return [
          text(mx, y + 222, (W - 44) / 3, m.v, 17, m.c, { bold: true, serif: true }),
          text(mx, y + 244, (W - 44) / 3, m.l, 8, P.muted),
        ];
      }),
    ]),

    // Ranked recommendations
    sectionLabel(x + 20, y + 296, 'RECOMMENDED ADJUSTMENTS'),
    ...[
      {
        rank: '01', title: 'Add a peptide serum', sub: 'Your barrier metrics suggest collagen support would accelerate improvement.',
        impact: 'High impact', color: P.violet,
      },
      {
        rank: '02', title: 'Reapply SPF at noon', sub: 'UV index 6+ on 4 of your last 7 active days. Mid-day reapplication reduces pigmentation risk.',
        impact: 'Medium impact', color: P.gold,
      },
      {
        rank: '03', title: 'Reduce BHA frequency', sub: 'Your skin is showing mild sensitivity markers. Try 2×/week instead of daily.',
        impact: 'Caution', color: P.blush,
      },
    ].map((r, i) => {
      const ry = y + 314 + i * 90;
      return [
        ...card(x + 16, ry, W - 32, 78, r.color === P.violet ? P.gradV : r.color === P.gold ? '#FDFAF0' : P.gradR, [
          text(x + 24, ry + 8, 30, r.rank, 13, r.color, { mono: true, bold: true }),
          text(x + 24, ry + 24, W - 52, r.title, 14, P.text, { medium: true }),
          text(x + 24, ry + 42, W - 52, r.sub, 10, P.muted, { lh: 1.55 }),
          ...chip(x + 24, ry + 60, r.impact, r.color),
        ]),
      ];
    }),

    ...navBar(x, y + H - 80, 3),
  ]);
}

// ─── SCREEN 5 — PROFILE ───────────────────────────────────────────────────────
// Skin profile — type, goals, consistency stats
function screenProfile(ox, oy) {
  const x = ox, y = oy;

  return frame(x, y, W, H, [
    ...statusBar(x, y),
    ...topBar(x, y + 44, 'Your Skin', 'PROFILE & GOALS', P.rose),

    // Portrait area + skin type — inspired by Overlay's centered face motif
    rect(x + W / 2 - 48, y + 106, 96, 96, P.gradV, { r: 48, stroke: `${P.violet}30`, sw: 2 }),
    // iridescent ring hint
    rect(x + W / 2 - 56, y + 98, 112, 112, 'transparent', { r: 56, stroke: `${P.violet}18`, sw: 6 }),
    text(x + W / 2 - 48, y + 146, 96, 'EP', 28, P.violet, { center: true, bold: true, serif: true }),

    text(x, y + 212, W, 'Elise Pemberton', 18, P.text, { center: true, medium: true }),
    text(x, y + 234, W, 'Combination · Sensitive · 28', 11, P.muted, { center: true }),

    // Goal chips row
    ...[ 'Hydration', 'Even tone', 'Barrier repair' ].reduce((acc, tag, i) => {
      const prev = acc.xOff;
      const cw = tag.length * 7 + 22;
      acc.nodes.push(...chip(x + prev, y + 258, tag, P.violet));
      acc.xOff += cw + 8;
      return acc;
    }, { nodes: [], xOff: 20 }).nodes,

    // Consistency stats
    sectionLabel(x + 20, y + 294, 'RITUAL CONSISTENCY'),
    ...card(x + 16, y + 312, W - 32, 76, P.surface, [
      ...[ { l: 'Morning', v: '86%', pct: 0.86, c: P.violet }, { l: 'Evening', v: '71%', pct: 0.71, c: P.blush } ]
        .map((s, i) => {
          const sy = y + 326 + i * 30;
          return [
            text(x + 28, sy, 90, s.l, 12, P.text, { medium: true }),
            ...progressBar(x + 110, sy + 4, W - 152, s.pct, s.c),
            text(x + W - 52, sy, 36, s.v, 12, s.c, { right: true, mono: true }),
          ];
        }),
    ]),

    // Skin history / milestones
    sectionLabel(x + 20, y + 404, 'MILESTONES'),
    ...[
      { icon: '✦', title: '14-day morning streak',         when: 'Today',     color: P.violet },
      { icon: '◎', title: 'Barrier score crossed 80',      when: 'Last week', color: P.sage   },
      { icon: '◌', title: 'First routine completed',       when: 'Mar 1',     color: P.gold   },
    ].map((m, i) => {
      const my = y + 422 + i * 60;
      return [
        rect(x + 16, my, W - 32, 50, i === 0 ? P.gradV : P.surface, { r: 12, stroke: i === 0 ? `${P.violet}25` : P.border, sw: 1 }),
        rect(x + 28, my + 13, 24, 24, `${m.color}18`, { r: 12 }),
        text(x + 28, my + 17, 24, m.icon, 11, m.color, { center: true }),
        text(x + 62, my + 10, W - 110, m.title, 13, P.text, { medium: true }),
        text(x + 62, my + 28, 120, m.when, 10, P.muted),
      ];
    }),

    // Skin type note — editorial quote treatment
    rect(x + 16, y + 608, W - 32, 60, P.gradV, { r: 14, stroke: `${P.violet}20`, sw: 1 }),
    text(x + 24, y + 620, W - 48,
      '"Combination skin needs a ritual with intention — not more products, better ones."', 11, P.violet, { lh: 1.6, italic: true, serif: true }),

    ...navBar(x, y + H - 80, 4),
  ]);
}

// ─── ASSEMBLE CANVAS ─────────────────────────────────────────────────────────
const screens = [
  screenRitual(0, 0),
  screenTrack(W + GAP, 0),
  screenShelf((W + GAP) * 2, 0),
  screenInsight((W + GAP) * 3, 0),
  screenProfile((W + GAP) * 4, 0),
];

const canvasW = W * 5 + GAP * 4;   // 2195
const canvasH = H;                  // 812

const pen = {
  version: '2.8',
  name:    'RITE — skin intelligence built on ritual',
  width:   canvasW,
  height:  canvasH,
  fill:    P.bg,
  children: screens,
};

const total = JSON.stringify(pen).match(/"id"/g)?.length ?? 0;
const outPath = path.join(__dirname, 'rite.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ rite.pen saved (${canvasW}×${canvasH}, ${total} nodes)`);
