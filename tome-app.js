// TOME — Your reading life, beautifully tracked
// Inspired by:
//   1. "Current - A River of Reading" (land-book.com, Mar 2026): Editorial reading
//      app with warm paper tones, generous white space, serif title treatments.
//      Triggered the idea of treating a reading tracker as a printed almanac.
//   2. "Litbix (for book lovers)" (minimal.gallery, Mar 2026): Minimal, cream-toned
//      book-tracking UI with tight typographic hierarchy and soft category pills.
//      Borrowed the shelving / grid-of-covers layout pattern.
//   3. "Cernel: Product Onboarding for Ecommerce Teams" (land-book.com): Clean
//      milestone-progress pattern — repurposed for annual reading goal screen.
// Theme: LIGHT — warm paper #F4F0E8 + terracotta accent + forest green secondary
// Design push: Mix editorial serif type (titles as display objects) with clean
//   sans data labels; treat books like editorial artefacts, not database rows.
//   Generous margins + large vertical rhythm = calm reading energy.
// Format: Pencil.dev v2.8

const fs   = require('fs');
const path = require('path');

const W = 390, H = 844;
const SLUG = 'tome';

// ─── PALETTE ───────────────────────────────────────────────────────
const C = {
  bg:         '#F4F0E8',   // warm paper
  bgCream:    '#EDE8DF',   // deeper cream
  surface:    '#FFFEFB',   // white surface
  surface2:   '#FAF8F4',   // off-white card
  border:     '#E3DDD3',   // warm border
  borderSoft: '#EDE8DF',   // very soft divider
  text:       '#1C1714',   // warm near-black
  textSub:    '#7A6E65',   // warm muted
  textDim:    '#B0A89E',   // very muted
  accent:     '#B85C38',   // terracotta — warmth of books
  accentDim:  '#F4E8E2',   // terracotta wash
  accentDeep: '#8C3D20',   // deeper terracotta
  green:      '#4A7C59',   // forest green — growth
  greenDim:   '#E2EDE6',   // green wash
  blue:       '#3D6B8C',   // slate blue — calm
  blueDim:    '#E2EAF0',   // blue wash
  gold:       '#C49A3C',   // warm gold
  goldDim:    '#F5EDDA',   // gold wash
  purple:     '#7B5EA7',   // muted purple
  purpleDim:  '#EDE8F5',   // purple wash
  white:      '#FFFFFF',
};

// ─── PRIMITIVES ────────────────────────────────────────────────────
const el = (type, props = {}) => ({ type, ...props });

const frame = (name, children, bg = C.bg) =>
  el('FRAME', { name, width: W, height: H, x: 0, y: 0,
    fills: [solid(bg)], children });

function solid(hex, opacity = 1) {
  if (hex.startsWith('rgba')) {
    const m = hex.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (m) return { type:'SOLID', color:{ r:+m[1]/255, g:+m[2]/255, b:+m[3]/255 }, opacity:+m[4] };
  }
  const r = parseInt(hex.slice(1,3),16)/255;
  const g = parseInt(hex.slice(3,5),16)/255;
  const b = parseInt(hex.slice(5,7),16)/255;
  return { type:'SOLID', color:{ r, g, b }, opacity };
}

function rect(x, y, w, h, fill, props = {}) {
  const fills = typeof fill === 'string' ? [solid(fill)] : Array.isArray(fill) ? fill : [fill];
  return el('RECTANGLE', {
    x, y, width: Math.max(0, w), height: Math.max(0, h), fills,
    cornerRadius: props.r || 0,
    strokes: props.stroke ? [solid(props.stroke, props.strokeOpacity || 1)] : [],
    strokeWeight: props.strokeWeight || 1,
    ...props,
  });
}

function txt(str, x, y, size, color, props = {}) {
  return el('TEXT', {
    x, y, characters: String(str), fontSize: size,
    fills: [solid(color)],
    fontName: { family: props.family || 'Inter', style: props.weight || 'Regular' },
    textAlignHorizontal: props.align || 'LEFT',
    width:  props.w  || 300,
    height: props.h  || Math.ceil(size * 1.45),
    letterSpacing: props.ls || 0,
    lineHeight: props.lh ? { value: props.lh, unit: 'PIXELS' } : undefined,
  });
}

function serif(str, x, y, size, color, props = {}) {
  return txt(str, x, y, size, color, { family: 'Georgia', weight: 'Regular', ...props });
}

function pill(x, y, label, bg, fg, props = {}) {
  const pw = props.w || (label.length * 7 + 20);
  return el('FRAME', {
    x, y, width: pw, height: props.h || 24,
    fills: [solid(bg)], cornerRadius: (props.h || 24) / 2,
    children: [
      txt(label, 0, 0, props.fs || 11, fg, {
        weight: 'Medium', align: 'CENTER',
        w: pw, h: props.h || 24, ls: 0.2,
      }),
    ],
  });
}

function progressBar(x, y, w, pct, trackColor, fillColor, props = {}) {
  const h = props.h || 4;
  const filled = Math.max(h, w * pct / 100);
  return [
    rect(x, y, w, h, trackColor, { r: h / 2 }),
    rect(x, y, filled, h, fillColor, { r: h / 2 }),
  ];
}

function stars(x, y, n, color) {
  return Array.from({ length: 5 }, (_, i) =>
    txt(i < n ? '★' : '☆', x + i * 13, y, 11, i < n ? color : C.textDim, { w: 13 })
  );
}

function divider(y) {
  return rect(20, y, W - 40, 1, C.border, {});
}

// ─── STATUS BAR ─────────────────────────────────────────────────────
function statusBar(light = true) {
  const fg = light ? C.text : C.white;
  return [
    rect(0, 0, W, 44, 'rgba(0,0,0,0)'),
    txt('9:41', 20, 14, 13, fg, { weight: 'SemiBold', w: 60 }),
    txt('●●● ▼ 🔋', W - 90, 14, 11, fg, { w: 80, align: 'RIGHT' }),
  ];
}

// ─── BOTTOM NAV ─────────────────────────────────────────────────────
function nav(active) {
  const tabs = [
    { id: 'home',    icon: '⌂',  label: 'Home'     },
    { id: 'library', icon: '⊞',  label: 'Library'  },
    { id: 'log',     icon: '+',  label: 'Log'       },
    { id: 'stats',   icon: '↗',  label: 'Stats'     },
    { id: 'discover',icon: '◈',  label: 'Discover'  },
  ];
  const children = [
    rect(0, 0, W, 82, C.surface, { strokes: [solid(C.border)], strokeWeight: 1 }),
  ];
  tabs.forEach((t, i) => {
    const cx = 39 + i * 78;
    const isActive = t.id === active;
    if (isActive) children.push(rect(cx - 18, 5, 36, 2, C.accent, { r: 1 }));
    children.push(
      txt(t.icon, cx - 16, 14, isActive ? 20 : 18, isActive ? C.accent : C.textDim,
        { align: 'CENTER', w: 32 }),
      txt(t.label, cx - 18, 38, 10, isActive ? C.accent : C.textDim,
        { align: 'CENTER', w: 36, weight: isActive ? 'SemiBold' : 'Regular' })
    );
  });
  return el('FRAME', {
    x: 0, y: H - 82, width: W, height: 82,
    fills: [solid(C.surface)], children,
  });
}

// ═══════════════════════════════════════════════════════════════════
// SCREEN 1 — HOME
// ═══════════════════════════════════════════════════════════════════
function s1Home() {
  return frame('Home', [
    ...statusBar(),

    // Greeting
    txt('Wednesday, 26 March', 20, 52, 11, C.textDim, { weight: 'Regular', w: 250 }),
    serif('Good evening,\nRakis.', 20, 68, 26, C.text, { weight: 'Regular', w: 300, lh: 32 }),

    // ── Currently Reading Card ──
    txt('CURRENTLY READING', 20, 134, 10, C.textDim, { weight: 'SemiBold', ls: 1.2, w: 200 }),
    rect(20, 152, W - 40, 170, C.surface, { r: 16, stroke: C.border, strokeWeight: 1 }),

    // Cover block (terracotta)
    rect(34, 164, 84, 120, C.accent, { r: 8 }),
    rect(34, 164, 4, 120, C.accentDeep, { r: 2 }),
    // Cover text (white)
    txt('THE', 44, 178, 7, C.white, { weight: 'Bold', ls: 2, w: 72, align: 'CENTER' }),
    serif('MIDNIGHT', 38, 192, 8, C.white, { weight: 'Bold', w: 72, align: 'CENTER', ls: 0.5 }),
    serif('LIBRARY', 38, 204, 8, C.white, { weight: 'Bold', w: 72, align: 'CENTER', ls: 0.5 }),
    rect(48, 222, 50, 1, C.white, { opacity: 0.25 }),
    txt('Matt Haig', 38, 228, 7, C.white, { opacity: 0.7, w: 72, align: 'CENTER' }),
    ...stars(42, 254, 4, C.gold),

    // Book info right side
    serif('The Midnight Library', 132, 166, 15, C.text, { weight: 'Regular', w: 216, lh: 20 }),
    txt('Matt Haig', 132, 190, 12, C.textSub, { w: 200 }),
    pill(132, 210, 'Literary Fiction', C.blueDim, C.blue, { fs: 10, w: 106 }),
    txt('Page 247 of 304', 132, 240, 11, C.textSub, { w: 190 }),
    ...progressBar(132, 256, 218, 81, C.border, C.accent, { h: 7 }),
    txt('81%', 316, 250, 10, C.accent, { w: 38, weight: 'SemiBold', align: 'RIGHT' }),
    txt('38 min today  ↑ from avg', 132, 270, 10, C.green, { weight: 'Medium', w: 210 }),

    // CTA row
    rect(34, 300, 140, 34, C.accent, { r: 17 }),
    txt('Continue Reading', 34, 309, 12, C.white, { weight: 'SemiBold', w: 140, align: 'CENTER' }),
    rect(186, 300, 108, 34, C.accentDim, { r: 17 }),
    txt('+ Log Session', 186, 309, 12, C.accent, { weight: 'SemiBold', w: 108, align: 'CENTER' }),

    // ── Streak ──
    rect(20, 336, W - 40, 86, C.surface, { r: 16, stroke: C.border, strokeWeight: 1 }),
    txt('STREAK', 34, 348, 10, C.textDim, { weight: 'SemiBold', ls: 1.2, w: 100 }),
    serif('21', 34, 362, 34, C.accent, { weight: 'Regular', w: 70 }),
    txt('days', 70, 376, 14, C.textSub, { weight: 'Regular', w: 50 }),
    txt('Your longest streak yet 🔥', 34, 400, 11, C.textSub, { w: 220 }),
    // Streak row of dots
    ...Array.from({ length: 21 }, (_, i) => {
      const dotX = W - 50 - (20 - i) * 14;
      const isToday = i === 20;
      return [
        rect(dotX, 368, 10, 10, i >= 17 ? C.accentDim : C.accent, { r: 5 }),
        ...(isToday ? [rect(dotX - 2, 366, 14, 14, 'rgba(0,0,0,0)', {
          r: 7, stroke: C.accent, strokeWeight: 1.5
        })] : []),
      ];
    }).flat(),

    // ── Recent Finishes ──
    txt('RECENTLY FINISHED', 20, 438, 10, C.textDim, { weight: 'SemiBold', ls: 1.2, w: 200 }),
    // 3 mini book covers
    ...[
      { color: C.green,  title: 'Piranesi',   author: 'Clarke',  r: 5 },
      { color: C.blue,   title: 'The Aleph',  author: 'Borges',  r: 4 },
      { color: C.purple, title: 'Educated',   author: 'Westover',r: 5 },
    ].map((b, i) => {
      const bx = 20 + i * 100;
      return el('FRAME', {
        x: bx, y: 456, width: 88, height: 112,
        fills: [solid(b.color)], cornerRadius: 8,
        children: [
          rect(0, 0, 4, 112, 'rgba(0,0,0,0.2)', { r: 2 }),
          serif(b.title, 8, 14, 9, C.white, { weight: 'Bold', w: 72, lh: 12 }),
          txt(b.author, 8, 62, 7, C.white, { opacity: 0.7, w: 72 }),
          rect(8, 74, 56, 1, C.white, { opacity: 0.2 }),
          ...Array.from({ length: 5 }, (_, si) =>
            txt(si < b.r ? '★' : '☆', 8 + si * 13, 80, 10,
              si < b.r ? C.gold : 'rgba(255,255,255,0.3)', { w: 13 })
          ),
        ],
      });
    }),

    // View all link
    txt('View all 14 books →', 20, 578, 12, C.accent, { weight: 'Medium', w: 200 }),

    nav('home'),
  ]);
}

// ═══════════════════════════════════════════════════════════════════
// SCREEN 2 — LIBRARY
// ═══════════════════════════════════════════════════════════════════
function s2Library() {
  const shelf = [
    { title: 'Invisible Cities',        color: '#7B5EA7', pct: 60 },
    { title: 'Flowers for Algernon',    color: '#5C8A6E', pct: 35 },
    { title: 'House of Leaves',         color: '#2A3B5C', pct: 15 },
    { title: 'Exhalation',              color: '#C49A3C', pct: 92 },
    { title: 'Never Let Me Go',         color: '#B05060', pct: 0  },
    { title: 'NW',                      color: '#3D7070', pct: 0  },
  ];

  return frame('Library', [
    ...statusBar(),

    serif('My Library', 20, 52, 28, C.text, { weight: 'Regular' }),
    txt('47 books · 14 finished this year', 20, 86, 12, C.textSub, { w: 280 }),

    // Search
    rect(20, 108, W - 40, 40, C.surface, { r: 20, stroke: C.border, strokeWeight: 1 }),
    txt('⌕  Search your library…', 36, 121, 13, C.textDim, { w: 280 }),

    // Tabs
    ...['Reading', 'Finished', 'Want to Read'].map((label, i) => {
      const x = [20, 100, 186][i];
      const isActive = i === 0;
      return [
        txt(label, x, 162, 13, isActive ? C.accent : C.textSub,
          { weight: isActive ? 'SemiBold' : 'Regular', w: 90 }),
        ...(isActive ? [rect(x, 180, label.length * 7.5, 2, C.accent, { r: 1 })] : []),
      ];
    }).flat(),

    // Grid
    ...shelf.flatMap((b, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const bx = 20 + col * 185;
      const by = 196 + row * 178;
      const cw = 160, ch = 130;

      return [
        // Shadow
        rect(bx + 3, by + 3, cw, ch, 'rgba(28,23,20,0.05)', { r: 10 }),
        // Cover
        el('FRAME', {
          x: bx, y: by, width: cw, height: ch,
          fills: [solid(b.color)], cornerRadius: 10,
          children: [
            rect(0, 0, 4, ch, 'rgba(0,0,0,0.18)', { r: 2 }),
            rect(0, ch - 44, cw, 44, 'rgba(0,0,0,0.3)', {}),
            serif(b.title, 10, ch - 36, 9, C.white, { weight: 'Bold', w: cw - 20, lh: 12 }),
            ...(b.pct > 0 ? [
              rect(0, ch - 5, cw * b.pct / 100, 5, C.accent, {}),
              rect(cw * b.pct / 100, ch - 5, cw - cw * b.pct / 100, 5, 'rgba(255,255,255,0.2)', {}),
            ] : []),
          ],
        }),
        txt(
          b.pct > 0 ? `${b.pct}% read` : 'Not started',
          bx, by + ch + 6,
          10, b.pct > 0 ? C.accent : C.textDim,
          { weight: b.pct > 0 ? 'SemiBold' : 'Regular', w: cw }
        ),
      ];
    }),

    nav('library'),
  ]);
}

// ═══════════════════════════════════════════════════════════════════
// SCREEN 3 — BOOK DETAIL
// ═══════════════════════════════════════════════════════════════════
function s3Detail() {
  return frame('Book Detail', [
    // Header bg (terracotta)
    rect(0, 0, W, 270, C.accent, {}),
    rect(0, 220, W, 70, C.bg, { r: 20 }),

    ...statusBar(false),

    txt('← Library', 20, 52, 13, C.white, { weight: 'Medium', w: 90 }),
    txt('⋯', W - 36, 52, 20, C.white, { w: 20 }),

    // Cover (centred, hero)
    rect(W / 2 - 58, 70, 116, 160, C.accentDeep, { r: 10 }),
    rect(W / 2 - 58, 70, 5, 160, 'rgba(0,0,0,0.25)', { r: 2 }),
    txt('THE', W / 2 - 44, 86, 8, C.white, { weight: 'Bold', ls: 2, w: 88, align: 'CENTER' }),
    serif('MIDNIGHT', W / 2 - 44, 100, 10, C.white, { weight: 'Bold', w: 88, align: 'CENTER', ls: 0.5 }),
    serif('LIBRARY', W / 2 - 44, 115, 10, C.white, { weight: 'Bold', w: 88, align: 'CENTER', ls: 0.5 }),
    rect(W / 2 - 32, 136, 64, 1, C.white, { opacity: 0.25 }),
    txt('Matt Haig', W / 2 - 44, 143, 8, C.white, { opacity: 0.7, w: 88, align: 'CENTER' }),
    ...stars(W / 2 - 32, 164, 4, C.gold),
    // Bookmark icon
    rect(W / 2 + 42, 72, 28, 36, C.gold, { r: 4 }),
    txt('⊏', W / 2 + 42, 78, 18, C.white, { w: 28, align: 'CENTER' }),

    // Title block
    serif('The Midnight Library', 20, 230, 20, C.text, { weight: 'Regular', w: W - 40, align: 'CENTER' }),
    txt('Matt Haig  ·  304 pages  ·  2020', 20, 255, 11, C.textSub, { w: W - 40, align: 'CENTER' }),

    // Genre pill
    el('FRAME', {
      x: W / 2 - 55, y: 274, width: 110, height: 24,
      fills: [solid(C.blueDim)], cornerRadius: 12,
      children: [txt('Literary Fiction', 0, 0, 10, C.blue, { weight: 'Medium', align: 'CENTER', w: 110, h: 24 })],
    }),

    // Stats row
    rect(20, 308, W - 40, 76, C.surface, { r: 14, stroke: C.border, strokeWeight: 1 }),
    ...[
      { val: '81%',  label: 'Progress', color: C.accent },
      { val: '38m',  label: 'Today',    color: C.text   },
      { val: '6.2h', label: 'Total',    color: C.green  },
      { val: '7d',   label: 'Days',     color: C.blue   },
    ].flatMap(({ val, label, color }, i) => [
      ...(i > 0 ? [rect(20 + i * 88, 320, 1, 48, C.border, {})] : []),
      serif(val, 24 + i * 88, 320, 22, color, { weight: 'Regular', w: 82, align: 'CENTER' }),
      txt(label, 24 + i * 88, 348, 10, C.textDim, { w: 82, align: 'CENTER' }),
    ]),

    // Progress bar
    rect(20, 396, W - 40, 58, C.surface, { r: 14, stroke: C.border, strokeWeight: 1 }),
    txt('Page 247 of 304', 34, 408, 12, C.text, { weight: 'Medium', w: 200 }),
    txt('57 pages left  ·  ~1.5 hrs', 34, 424, 11, C.textDim, { w: 220 }),
    ...progressBar(34, 442, W - 68, 81, C.border, C.accent, { h: 8 }),
    rect(34 + (W - 68) * 0.81 - 6, 438, 12, 16, C.accent, { r: 6 }),

    // Highlight
    txt('HIGHLIGHTS', 20, 466, 10, C.textDim, { weight: 'SemiBold', ls: 1.2, w: 120 }),
    rect(20, 482, W - 40, 76, C.accentDim, { r: 12 }),
    rect(20, 482, 3, 76, C.accent, { r: 1 }),
    serif('"Between life and death there is a library,\nand within that library, the shelves go on forever."',
      34, 492, 11, C.text, { weight: 'Regular', w: W - 68, lh: 17 }),
    txt('p. 12 · Highlighted by 2,847 readers', 34, 545, 10, C.textSub, { w: 260 }),

    // CTA
    rect(20, 570, W - 40, 48, C.accent, { r: 24 }),
    txt('Continue Reading', 20, 582, 14, C.white, { weight: 'SemiBold', w: W - 40, align: 'CENTER' }),

    txt('Add a note  ·  Share  ·  Edit shelf', 20, 630, 12, C.textSub, { w: W - 40, align: 'CENTER' }),

    nav('library'),
  ]);
}

// ═══════════════════════════════════════════════════════════════════
// SCREEN 4 — DISCOVER
// ═══════════════════════════════════════════════════════════════════
function s4Discover() {
  const picks = [
    { title: 'The Dispossessed', author: 'Ursula K. Le Guin', genre: 'Science Fiction',
      color: '#4A6E8C', match: '96%', pages: 387 },
    { title: 'The Name of the Wind', author: 'Patrick Rothfuss', genre: 'Fantasy',
      color: '#6B4E8A', match: '91%', pages: 662 },
  ];

  return frame('Discover', [
    ...statusBar(),

    serif('Discover', 20, 52, 28, C.text, { weight: 'Regular' }),
    txt('Curated for your taste', 20, 86, 13, C.textSub, { w: 250 }),

    // Genre pills
    txt('YOUR TASTE', 20, 112, 10, C.textDim, { weight: 'SemiBold', ls: 1.2, w: 150 }),
    ...[
      { label: '📚 Literary Fiction', bg: C.accentDim, fg: C.accent },
      { label: '🔭 Sci-Fi',           bg: C.blueDim,   fg: C.blue   },
      { label: '🌿 Fantasy',          bg: C.greenDim,  fg: C.green  },
      { label: '+ 4',                 bg: C.bgCream,   fg: C.textSub},
    ].reduce((acc, p, i) => {
      const px = i === 0 ? 20 : acc.nextX;
      const pw = p.label.length * 7 + 20;
      acc.nodes.push(pill(px, 130, p.label, p.bg, p.fg, { fs: 11, w: pw }));
      acc.nextX = px + pw + 8;
      return acc;
    }, { nodes: [], nextX: 20 }).nodes,

    // Because you read...
    txt('BECAUSE YOU READ THE MIDNIGHT LIBRARY', 20, 168, 10, C.textDim,
      { weight: 'SemiBold', ls: 0.8, w: 340 }),

    ...picks.flatMap((b, i) => {
      const by = 188 + i * 165;
      const cw = 82, ch = 110;
      return [
        rect(20, by, W - 40, 152, C.surface, { r: 16, stroke: C.border, strokeWeight: 1 }),
        // Cover
        el('FRAME', {
          x: 32, y: by + 12, width: cw, height: ch,
          fills: [solid(b.color)], cornerRadius: 8,
          children: [
            rect(0, 0, 4, ch, 'rgba(0,0,0,0.2)', { r: 2 }),
            serif(b.title, 8, 12, 8, C.white, { weight: 'Bold', w: cw - 16, lh: 11 }),
          ],
        }),
        // Match badge
        rect(W - 80, by + 12, 52, 24, C.greenDim, { r: 12 }),
        txt(`${b.match} match`, W - 80, by + 19, 9, C.green,
          { weight: 'SemiBold', w: 52, align: 'CENTER' }),
        // Info
        serif(b.title, 128, by + 14, 14, C.text, { weight: 'Regular', w: 210, lh: 18 }),
        txt(b.author,  128, by + 38, 11, C.textSub, { w: 210 }),
        pill(128, by + 58, b.genre, C.blueDim, C.blue, { fs: 10 }),
        txt(`${b.pages} pages`, 128, by + 90, 11, C.textDim, { w: 110 }),
        txt('+ Want to read', 128, by + 112, 12, C.accent, { weight: 'Medium', w: 120 }),
        rect(W - 72, by + 106, 46, 28, C.accent, { r: 14 }),
        txt('Save', W - 72, by + 114, 12, C.white, { weight: 'SemiBold', w: 46, align: 'CENTER' }),
      ];
    }),

    // Trending
    txt('TRENDING IN LITERARY FICTION', 20, 534, 10, C.textDim,
      { weight: 'SemiBold', ls: 0.8, w: 300 }),
    ...[
      { n: '1', title: 'James',    author: 'McBride',  color: '#7B5230' },
      { n: '2', title: 'All Fours',author: 'July',     color: '#5C7B52' },
      { n: '3', title: 'Orbital',  author: 'Harvey',   color: '#52667B' },
    ].flatMap((b, i) => {
      const ty = 552 + i * 52;
      return [
        txt(b.n, 20, ty + 14, 16, C.textDim, { weight: 'Regular', w: 18 }),
        rect(44, ty, 36, 46, b.color, { r: 6 }),
        rect(44, ty, 3, 46, 'rgba(0,0,0,0.2)', {}),
        serif(b.title, 92, ty + 6, 13, C.text, { weight: 'Regular', w: 200, lh: 16 }),
        txt(b.author, 92, ty + 26, 11, C.textSub, { w: 160 }),
        txt('→', W - 36, ty + 14, 16, C.textDim, { w: 18 }),
        ...(i < 2 ? [rect(20, ty + 50, W - 40, 1, C.borderSoft, {})] : []),
      ];
    }),

    nav('discover'),
  ]);
}

// ═══════════════════════════════════════════════════════════════════
// SCREEN 5 — STATS
// ═══════════════════════════════════════════════════════════════════
function s5Stats() {
  const days = ['M','T','W','T','F','S','S'];
  const mins  = [25, 0, 45, 38, 60, 90, 12];
  const maxM  = 90;
  const barArea = { x: 34, y: 330, w: W - 68, h: 80 };

  return frame('Stats', [
    ...statusBar(),

    serif('Reading Stats', 20, 52, 28, C.text, { weight: 'Regular' }),
    txt('2026  ·  47 books goal', 20, 86, 12, C.textSub, { w: 250 }),
    pill(20, 108, '🎯  14 / 47 books · 30% done', C.accentDim, C.accent, { fs: 11, w: 195 }),

    // Annual goal card
    rect(20, 140, W - 40, 92, C.surface, { r: 14, stroke: C.border, strokeWeight: 1 }),
    txt('ANNUAL READING GOAL', 34, 152, 10, C.textDim, { weight: 'SemiBold', ls: 1.2, w: 250 }),
    serif('14', 34, 168, 34, C.accent, { weight: 'Regular', w: 60 }),
    txt('of 47 books', 34, 207, 12, C.textSub, { w: 110 }),
    ...progressBar(34, 218, W - 68, 30, C.border, C.accent, { h: 10 }),
    txt('On track — 4 books ahead of schedule', W - 40, 218, 10, C.green,
      { weight: 'Medium', w: 290, align: 'RIGHT' }),

    // Weekly card
    rect(20, 248, W - 40, 158, C.surface, { r: 14, stroke: C.border, strokeWeight: 1 }),
    txt('THIS WEEK', 34, 260, 10, C.textDim, { weight: 'SemiBold', ls: 1.2, w: 200 }),
    serif('270 min', 34, 276, 24, C.text, { weight: 'Regular', w: 180 }),
    txt('3.8 hrs  ·  avg 39 min/day', 34, 306, 11, C.textSub, { w: 220 }),

    // Bar chart
    ...days.flatMap((d, i) => {
      const slot = barArea.w / 7;
      const bw = 28;
      const bx = barArea.x + i * slot + (slot - bw) / 2;
      const m = mins[i];
      const bh = m > 0 ? Math.max(6, (m / maxM) * barArea.h) : 5;
      return [
        rect(bx, barArea.y + barArea.h - bh, bw, bh, m > 0 ? C.accent : C.borderSoft, { r: 5 }),
        txt(d, bx - 1, barArea.y + barArea.h + 6, 10, C.textSub, { align: 'CENTER', w: bw + 2 }),
        ...(m > 0 ? [txt(String(m), bx - 1, barArea.y + barArea.h - bh - 14, 9, C.accent,
          { align: 'CENTER', w: bw + 2, weight: 'SemiBold' })] : []),
      ];
    }),

    // Streak + top stats
    rect(20, 424, W - 40, 72, C.surface, { r: 14, stroke: C.border, strokeWeight: 1 }),
    ...[
      { val: '21',   label: 'Day streak',   color: C.accent },
      { val: '247',  label: 'Pages/week',   color: C.text   },
      { val: '39m',  label: 'Daily avg',    color: C.green  },
      { val: '6',    label: 'Genres',       color: C.blue   },
    ].flatMap(({ val, label, color }, i) => [
      ...(i > 0 ? [rect(20 + i * 88, 436, 1, 44, C.border, {})] : []),
      serif(val, 24 + i * 88, 436, 24, color, { weight: 'Regular', w: 82, align: 'CENTER' }),
      txt(label, 24 + i * 88, 465, 10, C.textDim, { w: 82, align: 'CENTER' }),
    ]),

    // Genre breakdown
    txt('GENRES READ IN 2026', 20, 510, 10, C.textDim, { weight: 'SemiBold', ls: 1.2, w: 250 }),
    ...[
      { label: 'Literary Fiction', pct: 45, color: C.accent  },
      { label: 'Science Fiction',  pct: 22, color: C.blue    },
      { label: 'Fantasy',          pct: 18, color: C.green   },
      { label: 'Non-Fiction',      pct: 10, color: C.gold    },
      { label: 'Other',            pct:  5, color: C.textDim },
    ].flatMap(({ label, pct, color }, i) => {
      const gy = 528 + i * 36;
      return [
        txt(label, 20, gy + 2, 12, C.text, { w: 160 }),
        ...progressBar(20, gy + 20, W - 80, pct * 2.7, C.border, color, { h: 6 }),
        txt(`${pct}%`, W - 50, gy + 14, 11, color, { w: 36, weight: 'SemiBold', align: 'RIGHT' }),
      ];
    }),

    nav('stats'),
  ]);
}

// ═══════════════════════════════════════════════════════════════════
// ASSEMBLE & WRITE
// ═══════════════════════════════════════════════════════════════════
const screens = [s1Home(), s2Library(), s3Detail(), s4Discover(), s5Stats()];
const GAP = 60;

const pen = {
  meta: {
    version: '2.8', name: 'Tome — Reading Life', slug: SLUG,
    description: 'Personal reading tracker with editorial aesthetics. Light theme, warm paper tones, serif type. Inspired by Current (land-book) and Litbix (minimal.gallery).',
    created: new Date().toISOString(),
    author: 'RAM Design Heartbeat', theme: 'light',
  },
  canvas: {
    width:  screens.length * (W + GAP) + GAP,
    height: H + 120,
    background: '#E8E3DA',
  },
  screens: screens.map((s, i) => ({ ...s, x: GAP + i * (W + GAP), y: 60 })),
};

const OUT = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(OUT, JSON.stringify(pen, null, 2));
const kb = (fs.statSync(OUT).size / 1024).toFixed(1);
console.log(`✓ ${SLUG}.pen  (${kb} KB)`);
console.log(`  Screens: ${screens.map(s => s.name).join(' · ')}`);
