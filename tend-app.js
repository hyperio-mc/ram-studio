'use strict';
// tend-app.js
// TEND — presence without performance. connection without capture.
// Dark organic forest palette — slow social, anti-anxiety connection app
// Inspired by Interlude (lapa.ninja: "presence without performance, connection without capture")
// + Lucci Lambrusco condensed serif editorial aesthetic (siteinspire)
// Theme: DARK

const fs   = require('fs');
const path = require('path');

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const P = {
  bg:       '#0B0C09',   // near-black, forest floor
  surface:  '#131510',   // deep forest card
  surfaceB: '#1A1D16',   // elevated element
  border:   '#252A1E',   // organic border
  text:     '#E4E0D6',   // warm parchment
  muted:    'rgba(228,224,214,0.38)',
  sage:     '#6B9A72',   // forest sage — growth, present
  amber:    '#C49040',   // warm honey — tending, warmth
  rose:     '#C47076',   // quiet rose — presence, soft signal
  bark:     '#9B7A54',   // warm bark — grounding
  night:    '#2A3020',   // deep forest green — background accent
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
    fontFamily: opts.mono ? 'JetBrains Mono' : opts.serif ? 'Playfair Display' : 'Inter',
    textAlign: opts.center ? 'center' : opts.right ? 'right' : 'left',
    lineHeight: opts.lh || (size <= 12 ? 1.5 : size <= 16 ? 1.5 : 1.3),
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

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
function statusBar(x, y) {
  return [
    rect(x, y, W, 44, P.bg),
    text(x + 16, y + 14, 60, '9:41', 13, P.text, { medium: true, mono: true }),
    text(x + W - 64, y + 14, 52, '● ◆ ▮', 11, P.muted, { right: true }),
  ];
}

function topBar(x, y, title, sub) {
  return [
    rect(x, y, W, 54, P.bg),
    text(x + 20, y + 8, W - 40, title, 22, P.text, { serif: true, bold: true }),
    sub ? text(x + 20, y + 35, W - 40, sub, 9, P.muted, { ls: 0.1 }) : null,
  ];
}

function navBar(x, y, activeIdx) {
  const tabs = [
    { icon: '◉', label: 'Present' },
    { icon: '❧', label: 'Tend'    },
    { icon: '◌', label: 'Moment'  },
    { icon: '∼', label: 'Thread'  },
    { icon: '⋮', label: 'Ground'  },
  ];
  const tw = W / 5;
  return [
    rect(x, y, W, 80, P.surface, { stroke: P.border, sw: 1 }),
    rect(x + W / 2 - 60, y + 70, 120, 4, P.surfaceB, { r: 2 }),
    ...tabs.map((t, i) => {
      const tx = x + i * tw;
      const on = i === activeIdx;
      return [
        on ? rect(tx + tw / 2 - 18, y + 8, 36, 36, `${P.sage}18`, { r: 10 }) : null,
        text(tx, y + 14, tw, t.icon, 16, on ? P.sage : P.muted, { center: true }),
        text(tx, y + 38, tw, t.label, 8, on ? P.sage : P.muted, { center: true }),
      ];
    }),
  ];
}

function card(x, y, w, h, children, accentColor) {
  return [
    rect(x, y, w, h, P.surface, { r: 16, stroke: accentColor || P.border, sw: 1 }),
    ...children.flat(Infinity).filter(Boolean),
  ];
}

function chip(x, y, label, color) {
  const cw = label.length * 7 + 20;
  return [
    rect(x, y, cw, 22, `${color}18`, { r: 11, stroke: `${color}30`, sw: 1 }),
    text(x, y + 4, cw, label, 9, color, { center: true, medium: true, ls: 0.06 }),
  ];
}

function sectionLabel(x, y, label) {
  return text(x, y, 280, label, 9, P.muted, { ls: 0.12 });
}

function divider(x, y) {
  return rect(x, y, W - 40, 1, P.border);
}

// ─── SCREEN 1 — PRESENT ──────────────────────────────────────────────────────
// Who's quietly here right now — ambient presence circles
function screenPresent(ox, oy) {
  const x = ox, y = oy;

  // presence people data
  const people = [
    { name: 'Maya',   initials: 'M', color: P.sage,  status: 'Walking in Battersea Park',        time: '14m' },
    { name: 'Tom',    initials: 'T', color: P.amber, status: 'Reading — quiet time',              time: '2m'  },
    { name: 'Lena',   initials: 'L', color: P.rose,  status: 'Having coffee',                     time: '31m' },
    { name: 'Rohan',  initials: 'R', color: P.bark,  status: 'Working from home, not deep focus', time: '1h'  },
    { name: 'Wren',   initials: 'W', color: P.sage,  status: 'Offline — last seen yesterday',     time: '—'   },
  ];

  return frame(x, y, W, H, [
    ...statusBar(x, y),
    ...topBar(x, y + 44, 'Tend', 'THURSDAY · MARCH 26'),

    // Ambient header
    text(x + 20, y + 100, W - 40,
      'No performance required.\nJust who\'s here.', 15, P.text, { lh: 1.6, light: true }),

    // Presence count
    sectionLabel(x + 20, y + 148, '4 PEOPLE PRESENT NOW'),
    ...chip(x + 20, y + 164, 'No notifications sent', P.sage),

    // Presence rows
    ...people.map((p, i) => {
      const ry = y + 200 + i * 72;
      const present = p.time !== '—';
      return [
        // card bg
        rect(x + 16, ry, W - 32, 60, present ? P.surface : `${P.surface}80`, { r: 14, stroke: P.border, sw: 1 }),
        // avatar circle
        rect(x + 28, ry + 12, 36, 36, `${p.color}22`, { r: 18, stroke: `${p.color}50`, sw: 2 }),
        text(x + 28, ry + 20, 36, p.initials, 14, p.color, { center: true, bold: true }),
        // presence dot
        present ? rect(x + 54, ry + 40, 10, 10, P.sage, { r: 5 }) : null,
        // name + status
        text(x + 74, ry + 14, W - 120, p.name, 14, present ? P.text : P.muted, { medium: true }),
        text(x + 74, ry + 33, W - 130, p.status, 11, P.muted, { lh: 1.4 }),
        // time
        text(x + W - 52, ry + 22, 40, p.time, 10, P.muted, { right: true, mono: true }),
      ];
    }),

    // Insight strip
    rect(x + 16, y + 572, W - 32, 46, P.night, { r: 12 }),
    text(x + 24, y + 583, W - 48,
      '✦ Tend is quiet by design — no push alerts when someone is present.', 11, `${P.sage}CC`, { lh: 1.55 }),

    ...navBar(x, y + H - 80, 0),
  ]);
}

// ─── SCREEN 2 — TEND ─────────────────────────────────────────────────────────
// Relationship garden — care indicators, not follower counts
function screenTend(ox, oy) {
  const x = ox, y = oy;

  const relationships = [
    { name: 'Maya',  sub: 'close friend · 3y',   last: '2d ago',  score: 0.88, color: P.sage  },
    { name: 'Tom',   sub: 'partner · 4y',         last: 'today',   score: 0.94, color: P.amber },
    { name: 'Lena',  sub: 'old flatmate · 5y',    last: '12d ago', score: 0.42, color: P.rose  },
    { name: 'Rohan', sub: 'colleague · 1.5y',     last: '7d ago',  score: 0.67, color: P.bark  },
  ];

  return frame(x, y, W, H, [
    ...statusBar(x, y),
    ...topBar(x, y + 44, 'Tend', 'YOUR GARDEN'),

    sectionLabel(x + 20, y + 106, 'RELATIONSHIP HEALTH — NO FOLLOWER COUNTS'),

    // Relationship cards
    ...relationships.map((r, i) => {
      const ry = y + 126 + i * 122;
      const barW = W - 120;
      const fillW = Math.round(barW * r.score);
      return [
        ...card(x + 16, ry, W - 32, 108, [
          // avatar
          rect(x + 28, ry + 16, 40, 40, `${r.color}22`, { r: 20, stroke: `${r.color}50`, sw: 2 }),
          text(x + 28, ry + 24, 40, r.name[0], 15, r.color, { center: true, bold: true }),
          // name + sub
          text(x + 78, ry + 17, W - 130, r.name, 15, P.text, { medium: true }),
          text(x + 78, ry + 36, W - 140, r.sub, 10, P.muted),
          // last contact
          text(x + W - 52, ry + 17, 40, r.last, 10, P.muted, { right: true, mono: true }),
          // health bar
          sectionLabel(x + 28, ry + 65, 'CONNECTION HEALTH'),
          rect(x + 28, ry + 80, barW, 6, P.surfaceB, { r: 3 }),
          rect(x + 28, ry + 80, fillW, 6, r.color, { r: 3 }),
          text(x + 28 + barW + 8, ry + 76, 36, `${Math.round(r.score * 100)}%`, 10, r.color, { mono: true }),
        ]),
      ];
    }),

    // Tend nudge
    rect(x + 16, y + 618, W - 32, 50, P.amber, { r: 14, opacity: 0.12 }),
    text(x + 24, y + 629, W - 48,
      '↗ Lena is drifting — it\'s been 12 days. A short message could matter.', 11, P.amber, { lh: 1.55 }),

    ...navBar(x, y + H - 80, 1),
  ]);
}

// ─── SCREEN 3 — MOMENT ───────────────────────────────────────────────────────
// Share a quiet moment — no likes, no counts
function screenMoment(ox, oy) {
  const x = ox, y = oy;

  return frame(x, y, W, H, [
    ...statusBar(x, y),
    ...topBar(x, y + 44, 'Moment', 'SHARE SOMETHING SMALL'),

    // Compose area
    ...card(x + 16, y + 106, W - 32, 200, [
      text(x + 24, y + 118, W - 48,
        'Late afternoon light through the window. Nothing special — just noticing it.',
        14, P.text, { lh: 1.7 }),
      // photo thumb placeholder
      rect(x + 24, y + 210, 70, 64, P.surfaceB, { r: 10 }),
      rect(x + 34, y + 230, 50, 24, P.night, { r: 6 }),
      text(x + 24, y + 237, 70, '📷', 18, P.muted, { center: true }),
      // mood
      sectionLabel(x + 104, y + 218, 'MOOD'),
      ...chip(x + 104, y + 234, 'Quiet', P.sage),
      ...chip(x + 148, y + 234, 'Noticing', P.amber),
    ]),

    // Circle selector
    sectionLabel(x + 20, y + 318, 'SHARE WITH'),
    ...card(x + 16, y + 336, W - 32, 78, [
      ...['Maya', 'Tom', 'Lena', 'Rohan', 'All 4'].map((name, i) => {
        const colors = [P.sage, P.amber, P.rose, P.bark, P.text];
        const sel = i < 2;
        const cx = x + 28 + i * 62;
        return [
          rect(cx, y + 350, 44, 44, sel ? `${colors[i]}28` : P.surfaceB, { r: 22, stroke: sel ? colors[i] : 'transparent', sw: 2 }),
          text(cx, y + 357, 44, i === 4 ? '✦' : name[0], 14, sel ? colors[i] : P.muted, { center: true, bold: true }),
          text(cx - 4, y + 398, 52, i === 4 ? 'All' : name, 8, sel ? colors[i] : P.muted, { center: true }),
        ];
      }),
    ]),

    // No metrics notice
    rect(x + 16, y + 426, W - 32, 52, P.night, { r: 12 }),
    text(x + 24, y + 438, W - 48,
      '◌  No likes. No view counts. They\'ll simply know you shared this.', 12, `${P.sage}CC`, { lh: 1.55 }),

    // Recent moments
    sectionLabel(x + 20, y + 492, 'RECENT MOMENTS'),
    ...[
      { name: 'Tom',  preview: 'The coffee this morning was perfect', time: '8:42 AM' },
      { name: 'Maya', preview: 'First rain of spring ☁️', time: 'Yesterday' },
      { name: 'Lena', preview: 'Found my old notebook', time: '2d ago' },
    ].map((m, i) => {
      const my = y + 510 + i * 58;
      return [
        rect(x + 16, my, W - 32, 48, P.surface, { r: 12, stroke: P.border, sw: 1 }),
        text(x + 28, my + 9, 70, m.name, 12, P.text, { medium: true }),
        text(x + 28, my + 26, W - 100, m.preview, 11, P.muted),
        text(x + W - 60, my + 9, 44, m.time, 9, P.muted, { right: true, mono: true }),
      ];
    }),

    ...navBar(x, y + H - 80, 2),
  ]);
}

// ─── SCREEN 4 — THREAD ───────────────────────────────────────────────────────
// Slow exchange with one person — like letters, not chat
function screenThread(ox, oy) {
  const x = ox, y = oy;

  const messages = [
    { from: 'Maya', msg: 'Thinking about that walk we did last autumn. Should do it again.', time: 'Mar 24', mine: false },
    { from: 'You',  msg: 'Yes. Before it gets too warm. I miss when things felt slower.',   time: 'Mar 24', mine: true  },
    { from: 'Maya', msg: 'That\'s the whole thing, isn\'t it. Slow is the point.',            time: 'Mar 25', mine: false },
    { from: 'You',  msg: 'Saturday morning?',                                                time: 'Today',  mine: true  },
  ];

  return frame(x, y, W, H, [
    ...statusBar(x, y),
    // header
    rect(x, y + 44, W, 58, P.surface, { stroke: P.border, sw: 1 }),
    rect(x + 20, y + 54, 36, 36, `${P.sage}22`, { r: 18, stroke: `${P.sage}50`, sw: 2 }),
    text(x + 20, y + 62, 36, 'M', 14, P.sage, { center: true, bold: true }),
    text(x + 66, y + 54, 200, 'Maya', 15, P.text, { medium: true }),
    text(x + 66, y + 72, 200, 'close friend · present now', 9, P.muted),
    text(x + W - 50, y + 60, 40, '···', 18, P.muted, { right: true }),

    // slow-thread note
    rect(x + 60, y + 110, W - 120, 24, P.night, { r: 12 }),
    text(x + 60, y + 117, W - 120, 'Slow exchange — no read receipts', 9, P.muted, { center: true }),

    // Messages
    ...messages.map((m, i) => {
      const my = y + 148 + i * 90;
      const bw = 240;
      const bx = m.mine ? x + W - bw - 16 : x + 16;
      const bg = m.mine ? `${P.amber}22` : P.surface;
      const border = m.mine ? `${P.amber}40` : P.border;
      return [
        rect(bx, my, bw, 70, bg, { r: 14, stroke: border, sw: 1 }),
        text(bx + 14, my + 10, bw - 28, m.msg, 12, P.text, { lh: 1.6 }),
        text(bx + 14, my + 55, bw - 28, m.time, 9, P.muted, { right: m.mine }),
      ];
    }),

    // Reply input
    rect(x + 16, y + 512, W - 32, 52, P.surface, { r: 16, stroke: P.border, sw: 1 }),
    text(x + 28, y + 528, W - 80, 'Write something unhurried…', 13, P.muted, { italic: true }),
    rect(x + W - 60, y + 520, 36, 36, P.sage, { r: 18 }),
    text(x + W - 60, y + 528, 36, '↑', 16, P.bg, { center: true, bold: true }),

    // Thread note
    rect(x + 16, y + 578, W - 32, 46, P.night, { r: 12 }),
    text(x + 24, y + 590, W - 48,
      '✦ Tend doesn\'t show when messages are read — take your time.', 11, `${P.sage}CC`, { lh: 1.55 }),

    ...navBar(x, y + H - 80, 3),
  ]);
}

// ─── SCREEN 5 — GROUND ───────────────────────────────────────────────────────
// Your roots — connection history, memory archive
function screenGround(ox, oy) {
  const x = ox, y = oy;

  return frame(x, y, W, H, [
    ...statusBar(x, y),
    ...topBar(x, y + 44, 'Ground', 'YOUR ROOTS'),

    // Memory summary
    ...card(x + 16, y + 106, W - 32, 72, [
      text(x + 24, y + 118, W - 48,
        '"Slow is the point."', 18, P.text, { serif: true, italic: true, light: true, lh: 1.5 }),
      text(x + 24, y + 152, W - 48, '— Maya, Mar 25', 10, P.muted),
    ], P.sage),

    // Stats strip
    ...card(x + 16, y + 190, W - 32, 60, [
      ...[
        { label: 'Moments', value: '84'    },
        { label: 'Threads', value: '12'    },
        { label: 'Together', value: '4 people' },
      ].map((s, i) => {
        const sx = x + 28 + i * (W - 32) / 3;
        return [
          text(sx, y + 202, (W - 32) / 3, s.value, 16, P.text, { bold: true, center: true }),
          text(sx, y + 222, (W - 32) / 3, s.label, 9, P.muted, { center: true }),
        ];
      }),
    ]),

    // Archive entries
    sectionLabel(x + 20, y + 264, 'SHARED MEMORIES'),
    ...[
      { icon: '📍', title: 'Hampstead walk · October',  sub: 'With Maya — first cold day of autumn',        time: 'Oct 2025' },
      { icon: '☕', title: 'Sunday morning ritual',     sub: 'With Tom — 44 mornings logged',                time: 'Ongoing'  },
      { icon: '🌧', title: 'First rain of spring',      sub: 'Maya shared · you were both outside',         time: 'Mar 2026' },
      { icon: '📖', title: '\'Slow\' reading circle',   sub: 'With Lena, Tom — 3 books, 6 sessions',        time: 'Jan 2026' },
    ].map((e, i) => {
      const ey = y + 284 + i * 64;
      return [
        rect(x + 16, ey, W - 32, 54, P.surface, { r: 12, stroke: P.border, sw: 1 }),
        text(x + 28, ey + 16, 26, e.icon, 16, P.text),
        text(x + 58, ey + 10, W - 120, e.title, 13, P.text, { medium: true }),
        text(x + 58, ey + 28, W - 120, e.sub, 10, P.muted),
        text(x + W - 52, ey + 14, 44, e.time, 9, P.muted, { right: true, mono: true }),
      ];
    }),

    // Manifesto
    rect(x + 16, y + 548, W - 32, 80, P.night, { r: 14, stroke: `${P.sage}25`, sw: 1 }),
    text(x + 24, y + 560, W - 48,
      'Tend doesn\'t store your data to optimise you.\nIt stores your memories so you remember what matters.',
      12, P.text, { lh: 1.7, light: true }),

    ...navBar(x, y + H - 80, 4),
  ]);
}

// ─── ASSEMBLE CANVAS ─────────────────────────────────────────────────────────
const screens = [
  screenPresent(0, 0),
  screenTend(W + GAP, 0),
  screenMoment((W + GAP) * 2, 0),
  screenThread((W + GAP) * 3, 0),
  screenGround((W + GAP) * 4, 0),
];

const canvasW = W * 5 + GAP * 4;   // 2195
const canvasH = H;                   // 812

const pen = {
  version: '2.8',
  name:    'TEND — presence without performance',
  width:   canvasW,
  height:  canvasH,
  fill:    P.bg,
  children: screens,
};

const total = JSON.stringify(pen).match(/"id"/g)?.length ?? 0;
const outPath = path.join(__dirname, 'tend.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ tend.pen saved (${canvasW}×${canvasH}, ${total} nodes)`);
