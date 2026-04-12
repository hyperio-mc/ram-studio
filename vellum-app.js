'use strict';
/**
 * VELLUM — A literary reading journal
 * RAM Design Heartbeat · 2026-04-08
 *
 * Design challenge: Treat books as beautiful artifacts. Editorial typography
 * as UI. Drop caps, book-spine vertical navigation, annotation-as-poem layout.
 *
 * Inspired by:
 *  - Litbix (minimal.gallery) — books visualised as art objects
 *  - KOMETA Typefaces (minimal.gallery) — typography IS the interface
 *  - The "warm editorial" web trend: paper-white + ink-black + earthy accent
 *
 * LIGHT THEME (prev design ZERO was dark)
 * 5 screens · 390×844
 */

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#F5F0E8',   // warm parchment
  surface:  '#FDFAF5',   // cream white
  surface2: '#EDE6D8',   // deeper parchment
  border:   'rgba(28,20,16,0.10)',
  borderMd: 'rgba(28,20,16,0.20)',
  text:     '#1C1410',   // warm ink black
  textMid:  '#5C4A3A',   // mid-tone warm brown
  muted:    '#9A8878',   // muted warm
  accent:   '#8B4513',   // saddle brown (aged leather)
  accentLt: 'rgba(139,69,19,0.10)',
  green:    '#4A6741',   // reading lamp green
  greenLt:  'rgba(74,103,65,0.12)',
  gold:     '#9A7A3A',   // antique gold
  goldLt:   'rgba(154,122,58,0.12)',
  white:    '#FFFFFF',
  // book spine colors
  spine1:   '#2C4A6E',  // navy
  spine2:   '#8B4513',  // tan
  spine3:   '#4A6741',  // forest
  spine4:   '#6B3A5C',  // plum
  spine5:   '#3A5C5C',  // teal
  spine6:   '#7A5238',  // sienna
};

let _id = 0;
const uid = () => `v${++_id}`;

// ── Primitives ────────────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, opts = {}) => {
  const el = {
    id: uid(), type: 'frame', x, y, width: w, height: h,
    fill: fill || P.bg,
    clip: opts.clip !== undefined ? opts.clip : false,
  };
  if (opts.r  !== undefined) el.cornerRadius = opts.r;
  if (opts.stroke)           el.stroke = { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke };
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  el.children = opts.ch || [];
  return el;
};

const T = (content, x, y, w, h, opts = {}) => {
  const el = {
    id: uid(), type: 'text', content: String(content),
    x, y, width: w, height: h,
    textGrowth: 'fixed-width-height',
    fontSize: opts.size || 13,
    fontWeight: String(opts.weight || 400),
    fill: opts.fill || P.text,
    textAlign: opts.align || 'left',
  };
  if (opts.ls  !== undefined) el.letterSpacing = opts.ls;
  if (opts.lh  !== undefined) el.lineHeight    = opts.lh;
  if (opts.opacity !== undefined) el.opacity   = opts.opacity;
  return el;
};

const E = (x, y, w, h, fill, opts = {}) => {
  const el = { id: uid(), type: 'ellipse', x, y, width: w, height: h, fill };
  if (opts.stroke) el.stroke = { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke };
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  return el;
};

const Line  = (x, y, w, fill = P.border)   => F(x, y, w, 1, fill, {});
const VLine = (x, y, h, fill = P.border)   => F(x, y, 1, h, fill, {});

// ── Shared Chrome ─────────────────────────────────────────────────────────────
function statusBar() {
  return [
    F(0, 0, 390, 44, P.bg),
    T('9:41', 20, 14, 60, 16, { size: 15, weight: 600, fill: P.text }),
    T('▲▲▲  ⬡  88%', 290, 14, 100, 16, { size: 11, weight: 500, fill: P.text, align: 'right' }),
  ];
}

function navBar(title, sub) {
  const layers = [
    F(0, 44, 390, 64, P.bg),
    Line(0, 44, 390, P.text),          // thick rule top
    Line(0, 46, 390, P.borderMd),      // hairline below
    T('VELLUM', 20, 58, 80, 12, {
      size: 9, weight: 700, fill: P.accent, ls: 3.5,
    }),
    T(title, 0, 76, 390, 28, {
      size: 22, weight: 700, fill: P.text, align: 'center',
    }),
    Line(0, 108, 390, P.borderMd),
  ];
  if (sub) {
    layers.push(T(sub, 0, 92, 390, 14, {
      size: 11, weight: 400, fill: P.muted, align: 'center', ls: 0.3
    }));
  }
  return layers;
}

function tabBar(active) {
  const tabs = ['Shelf', 'Reading', 'Notes', 'Log', 'Year'];
  const tw = 390 / tabs.length;
  const layers = [
    F(0, 762, 390, 82, P.surface, { stroke: P.borderMd, sw: 1 }),
    Line(0, 762, 390, P.borderMd),
  ];
  tabs.forEach((tab, i) => {
    const cx = tw * i + tw / 2;
    const isActive = i === active;
    layers.push(
      T(tab, cx - 28, 782, 56, 14, {
        size: 10, weight: isActive ? 700 : 400,
        fill: isActive ? P.accent : P.muted,
        align: 'center', ls: 0.2
      })
    );
    if (isActive) {
      layers.push(F(cx - 16, 762, 32, 2, P.accent, { r: 1 }));
    }
  });
  return layers;
}

// ── SCREEN 1: Shelf ───────────────────────────────────────────────────────────
function screen1() {
  const ch = [
    F(0, 0, 390, 844, P.bg),
    ...statusBar(),
    ...navBar('My Shelf', '47 books curated'),
  ];

  // Filter pills
  const filters = ['All', 'Reading', 'Finished', 'Wishlist'];
  filters.forEach((f, i) => {
    const x = 16 + i * 82;
    const isActive = i === 0;
    ch.push(
      F(x, 118, 72, 24, isActive ? P.text : P.surface, {
        r: 12, stroke: isActive ? P.text : P.border, sw: 1, ch: [
          T(f, 0, 4, 72, 16, {
            size: 11, weight: isActive ? 600 : 400,
            fill: isActive ? P.bg : P.textMid,
            align: 'center', ls: 0.2
          })
        ]
      })
    );
  });

  Line(0, 150, 390, P.border);

  // Section label
  ch.push(
    T('CURRENTLY READING', 20, 158, 200, 11, {
      size: 9, weight: 700, fill: P.accent, ls: 1.8
    }),
    Line(20, 172, 350, P.border)
  );

  // Featured book — large horizontal card
  ch.push(
    F(16, 180, 358, 120, P.surface, {
      r: 8, stroke: P.border, sw: 1,
      ch: [
        // Book spine accent
        F(0, 0, 8, 120, P.spine1, { r: 4 }),
        // Book cover swatch
        F(16, 12, 60, 96, P.spine1, { r: 4 }),
        T('T', 16, 14, 60, 90, { size: 64, weight: 700, fill: '#fff', align: 'center', opacity: 0.18 }),
        T('T', 26, 42, 34, 46, { size: 38, weight: 800, fill: '#FFFFFF', align: 'center' }),
        T('Tomorrow, and Tomorrow,', 86, 16, 240, 16, { size: 14, weight: 700, fill: P.text }),
        T('and Tomorrow', 86, 34, 240, 14, { size: 14, weight: 700, fill: P.text }),
        T('Gabrielle Zevin', 86, 56, 200, 13, { size: 12, weight: 400, fill: P.textMid }),
        // Progress bar track
        F(86, 78, 240, 4, P.surface2, { r: 2 }),
        // Progress bar fill
        F(86, 78, 154, 4, P.accent, { r: 2 }),
        T('64%  ·  p. 348 of 546', 86, 88, 220, 12, { size: 11, weight: 400, fill: P.muted }),
        T('Continue →', 260, 88, 86, 12, { size: 11, weight: 600, fill: P.accent, align: 'right' }),
      ]
    })
  );

  // Section: Recently finished
  ch.push(
    T('RECENTLY FINISHED', 20, 312, 200, 11, { size: 9, weight: 700, fill: P.muted, ls: 1.8 }),
    Line(20, 326, 350, P.border)
  );

  // Book row — spine-style columns
  const books = [
    { title: 'The Creative Act', author: 'Rubin', color: P.spine2, initial: 'C' },
    { title: 'Piranesi', author: 'Clarke', color: P.spine3, initial: 'P' },
    { title: 'Four Thousand Weeks', author: 'Burkeman', color: P.spine4, initial: 'F' },
    { title: 'The Dawn of Everything', author: 'Graeber', color: P.spine5, initial: 'D' },
  ];

  books.forEach((b, i) => {
    const x = 16 + i * 88;
    ch.push(
      F(x, 334, 76, 108, b.color, {
        r: 6,
        ch: [
          T(b.initial, 0, 12, 76, 76, { size: 52, weight: 800, fill: '#fff', align: 'center', opacity: 0.18 }),
          T(b.initial, 0, 28, 76, 48, { size: 36, weight: 800, fill: '#FFFFFF', align: 'center' }),
          F(0, 92, 76, 16, 'rgba(0,0,0,0.22)', {
            ch: [
              T('★★★★★', 0, 2, 76, 12, { size: 8, fill: '#FFE08A', align: 'center' })
            ]
          }),
        ]
      }),
      T(b.title, x, 448, 76, 28, {
        size: 10, weight: 600, fill: P.text, lh: 1.35
      }),
      T(b.author, x, 478, 76, 12, { size: 9, weight: 400, fill: P.muted })
    );
  });

  // Wishlist strip
  ch.push(
    T('ON THE WISHLIST', 20, 502, 200, 11, { size: 9, weight: 700, fill: P.muted, ls: 1.8 }),
    Line(20, 516, 350, P.border),
  );

  const wishlist = [
    'The Women', 'James', 'Orbital', 'Intermezzo'
  ];
  wishlist.forEach((title, i) => {
    const y = 524 + i * 46;
    ch.push(
      F(16, y, 358, 38, P.surface, { r: 4, stroke: P.border, sw: 1,
        ch: [
          F(0, 0, 4, 38, P.gold, { r: 2 }),
          T(title, 16, 10, 250, 18, { size: 14, weight: 500, fill: P.text }),
          T('+ Add', 320, 10, 38, 18, { size: 11, weight: 600, fill: P.accent, align: 'right' })
        ]
      })
    );
  });

  ch.push(...tabBar(0));
  return { id: uid(), type: 'frame', x: 0, y: 0, width: 390, height: 844,
    fill: P.bg, clip: true, name: 'Shelf', children: ch };
}

// ── SCREEN 2: Open Book (Current Read) ────────────────────────────────────────
function screen2() {
  const ch = [
    F(0, 0, 390, 844, P.bg),
    ...statusBar(),
    F(0, 44, 390, 64, P.bg),
    Line(0, 44, 390, P.text),
    Line(0, 46, 390, P.borderMd),
    T('← Back', 20, 62, 80, 16, { size: 14, weight: 500, fill: P.accent }),
    T('READING NOW', 0, 64, 390, 14, { size: 9, weight: 700, fill: P.accent, align: 'center', ls: 3 }),
    T('⋯', 360, 62, 24, 16, { size: 18, fill: P.muted }),
    Line(0, 108, 390, P.borderMd),
  ];

  // Book hero
  ch.push(
    F(16, 116, 358, 140, P.spine1, {
      r: 8,
      ch: [
        F(0, 0, 358, 140, P.spine1, { r: 8 }),
        // Texture overlay
        F(0, 0, 358, 140, 'rgba(255,255,255,0.04)', { r: 8 }),
        // Big letter watermark
        T('T', 0, -20, 200, 180, { size: 180, weight: 900, fill: '#FFFFFF', align: 'center', opacity: 0.06 }),
        T('Tomorrow, and Tomorrow,', 20, 18, 318, 24, { size: 20, weight: 800, fill: '#FFFFFF' }),
        T('and Tomorrow', 20, 44, 318, 22, { size: 20, weight: 800, fill: '#FFFFFF' }),
        T('Gabrielle Zevin', 20, 76, 318, 16, { size: 13, weight: 400, fill: 'rgba(255,255,255,0.65)' }),
        T('LITERARY FICTION · 2022', 20, 96, 318, 12, {
          size: 8, weight: 600, fill: 'rgba(255,255,255,0.45)', ls: 1.5
        }),
        // Progress
        F(20, 116, 318, 4, 'rgba(255,255,255,0.18)', { r: 2 }),
        F(20, 116, 203, 4, 'rgba(255,255,255,0.85)', { r: 2 }),
        T('p.348 of 546  ·  64%', 20, 124, 180, 12, {
          size: 10, weight: 400, fill: 'rgba(255,255,255,0.55)'
        }),
        T('2h 18m left', 280, 124, 100, 12, {
          size: 10, weight: 500, fill: 'rgba(255,255,255,0.75)', align: 'right'
        }),
      ]
    })
  );

  // Session stats
  ch.push(
    F(16, 264, 358, 56, P.surface, { r: 8, stroke: P.border, sw: 1,
      ch: [
        F(0, 0, 1, 56, P.accent),  // left border accent
        T('Today', 16, 10, 80, 12, { size: 9, weight: 600, fill: P.muted, ls: 1 }),
        T('38 min', 16, 24, 80, 22, { size: 18, weight: 700, fill: P.text }),
        T('Session', 16, 42, 80, 12, { size: 9, weight: 400, fill: P.muted }),
        F(118, 16, 1, 24, P.border),
        T('22 pg', 128, 24, 70, 22, { size: 18, weight: 700, fill: P.text }),
        T('Read today', 128, 42, 80, 12, { size: 9, weight: 400, fill: P.muted }),
        F(210, 16, 1, 24, P.border),
        T('30 pg/hr', 220, 24, 90, 22, { size: 18, weight: 700, fill: P.text }),
        T('Avg pace', 220, 42, 80, 12, { size: 9, weight: 400, fill: P.muted }),
        F(312, 16, 1, 24, P.border),
        T('9', 322, 24, 30, 22, { size: 18, weight: 700, fill: P.green }),
        T('Day streak', 322, 42, 40, 12, { size: 9, weight: 400, fill: P.muted }),
      ]
    })
  );

  // Chapter view — editorial drop cap style
  ch.push(
    T('CHAPTER 24  ·  "FAILURENOTES"', 20, 332, 350, 12, {
      size: 8, weight: 700, fill: P.muted, ls: 1.5
    }),
    Line(20, 346, 350, P.border)
  );

  // Drop cap paragraph
  ch.push(
    T('S', 20, 352, 44, 54, { size: 52, weight: 800, fill: P.accent }),
    T('am had not meant to say it quite', 68, 360, 298, 16, {
      size: 13, weight: 400, fill: P.text, lh: 1.6
    }),
    T('like that. But the words came out whole, like', 20, 380, 350, 16, {
      size: 13, weight: 400, fill: P.text, lh: 1.6
    }),
    T('something long-rehearsed and never spoken.', 20, 398, 350, 16, {
      size: 13, weight: 400, fill: P.text, lh: 1.6
    }),
    T('Sadie looked at him. The silence between', 20, 418, 350, 16, {
      size: 13, weight: 400, fill: P.text, lh: 1.6
    }),
    T('them was neither comfortable nor awkward —', 20, 436, 350, 16, {
      size: 13, weight: 400, fill: P.text, lh: 1.6
    }),
    T('it was the silence of two people who had', 20, 454, 350, 16, {
      size: 13, weight: 400, fill: P.text, lh: 1.6
    }),
    T('already said too much.', 20, 472, 350, 16, {
      size: 13, weight: 400, fill: P.text, lh: 1.6
    }),
  );

  // Highlight a passage
  ch.push(
    F(16, 492, 358, 54, P.goldLt, { r: 6, stroke: P.gold + '40', sw: 1,
      ch: [
        T('★', 14, 8, 20, 20, { size: 16, fill: P.gold }),
        T('"It was the silence of two people who', 36, 10, 310, 14, {
          size: 12, weight: 400, fill: P.textMid, lh: 1.5
        }),
        T('had already said too much."', 36, 26, 310, 14, {
          size: 12, weight: 400, fill: P.textMid, lh: 1.5
        }),
        T('Highlighted · p.348', 36, 42, 200, 11, { size: 9, fill: P.gold, weight: 500 })
      ]
    })
  );

  // Start session button
  ch.push(
    F(16, 558, 358, 52, P.text, { r: 26,
      ch: [
        T('Begin Reading Session', 0, 16, 358, 20, {
          size: 14, weight: 700, fill: P.bg, align: 'center', ls: 0.3
        })
      ]
    }),
    F(16, 618, 166, 44, P.surface, { r: 22, stroke: P.border, sw: 1,
      ch: [T('Add Note', 0, 12, 166, 20, { size: 13, weight: 500, fill: P.text, align: 'center' })]
    }),
    F(208, 618, 166, 44, P.accentLt, { r: 22, stroke: P.accent + '40', sw: 1,
      ch: [T('Bookmark', 0, 12, 166, 20, { size: 13, weight: 600, fill: P.accent, align: 'center' })]
    })
  );

  ch.push(...tabBar(1));
  return { id: uid(), type: 'frame', x: 0, y: 0, width: 390, height: 844,
    fill: P.bg, clip: true, name: 'Open Book', children: ch };
}

// ── SCREEN 3: Annotations (Notes as Literary Excerpts) ────────────────────────
function screen3() {
  const ch = [
    F(0, 0, 390, 844, P.surface),
    ...statusBar(),
    ...navBar('Annotations', '18 notes · 47 highlights'),
  ];

  // Pull quote — hero annotation
  ch.push(
    F(0, 110, 390, 180, P.surface2),
    Line(0, 110, 390, P.borderMd),
    Line(0, 290, 390, P.borderMd),
    T('"', 20, 112, 60, 60, { size: 80, weight: 800, fill: P.accent, opacity: 0.25 }),
    T('The blank page is not empty.', 32, 152, 326, 22, {
      size: 18, weight: 700, fill: P.text, lh: 1.3
    }),
    T('It is full of everything', 32, 176, 326, 22, {
      size: 18, weight: 700, fill: P.text, lh: 1.3
    }),
    T('you have not yet said.', 32, 200, 326, 22, {
      size: 18, weight: 700, fill: P.text, lh: 1.3
    }),
    T('The Creative Act  ·  Rick Rubin  ·  p.112', 32, 236, 326, 14, {
      size: 11, weight: 400, fill: P.muted, ls: 0.3
    }),
    T('Your note: "Return to this before any project"', 32, 256, 326, 14, {
      size: 11, weight: 400, fill: P.green, ls: 0.2
    })
  );

  // Timeline of annotations
  ch.push(
    T('ALL NOTES', 20, 298, 200, 12, { size: 9, weight: 700, fill: P.accent, ls: 1.8 }),
    Line(20, 312, 350, P.border)
  );

  const notes = [
    {
      book: 'Tomorrow, and Tomorrow…', page: '348', type: 'Highlight',
      text: '"It was the silence of two people who had already said too much."',
      date: 'Today',  color: P.gold
    },
    {
      book: 'The Creative Act', page: '112', type: 'Note',
      text: '"The blank page is not empty. It is full of everything you have not yet said."',
      date: 'Mar 28', color: P.accent
    },
    {
      book: 'Piranesi', page: '189', type: 'Highlight',
      text: '"The Beauty of the House is immeasurable; its Kindness infinite."',
      date: 'Feb 12', color: P.green
    },
    {
      book: 'Four Thousand Weeks', page: '67', type: 'Earmark',
      text: '"The problem is not finishing things. It is choosing which things are worth starting."',
      date: 'Jan 22', color: P.spine4
    },
  ];

  notes.forEach((n, i) => {
    const y = 320 + i * 96;
    ch.push(
      F(16, y, 358, 88, P.surface, { r: 6, stroke: P.border, sw: 1,
        ch: [
          F(0, 0, 4, 88, n.color, { r: 3 }),
          F(12, 10, 60, 16, n.color + '22', { r: 3 }),
          T(n.type, 16, 13, 52, 10, { size: 8, weight: 700, fill: n.color, ls: 0.8 }),
          T(n.book.length > 28 ? n.book.slice(0, 27) + '…' : n.book, 82, 12, 220, 13,
            { size: 11, weight: 500, fill: P.textMid }),
          T('p.' + n.page, 310, 12, 40, 13, { size: 11, weight: 400, fill: P.muted, align: 'right' }),
          T(n.text.length > 74 ? n.text.slice(0, 73) + '…' : n.text,
            12, 32, 330, 36, { size: 12, weight: 400, fill: P.text, lh: 1.5 }),
          T(n.date, 12, 70, 80, 12, { size: 10, fill: P.muted }),
          T('Share  ·  Export', 258, 70, 100, 12, {
            size: 10, fill: P.accent, weight: 500, align: 'right'
          }),
        ]
      })
    );
  });

  ch.push(...tabBar(2));
  return { id: uid(), type: 'frame', x: 0, y: 0, width: 390, height: 844,
    fill: P.surface, clip: true, name: 'Annotations', children: ch };
}

// ── SCREEN 4: Reading Log (Calendar) ─────────────────────────────────────────
function screen4() {
  const ch = [
    F(0, 0, 390, 844, P.bg),
    ...statusBar(),
    ...navBar('Reading Log', 'April 2026'),
  ];

  // Week headers
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  days.forEach((d, i) => {
    ch.push(T(d, 20 + i * 50, 116, 40, 14, {
      size: 10, weight: 600, fill: P.muted, align: 'center', ls: 0.5
    }));
  });
  Line(20, 132, 350, P.border);

  // Calendar days — April 2026 (starts Tuesday)
  const activity = {
    1:0, 2:0, 3:22, 4:0, 5:0, 6:45, 7:30,
    8:38, 9:55, 10:0, 11:0, 12:62, 13:18, 14:42,
    15:0, 16:72, 17:88, 18:0, 19:30, 20:45, 21:60,
    22:0, 23:0, 24:55, 25:42, 26:18, 27:66, 28:80,
    29:0, 30:42
  };

  for (let day = 1; day <= 30; day++) {
    const startOffset = 1; // April 1 is a Wednesday (col 2)
    const adjDay = day + startOffset;
    const col = (adjDay - 1) % 7;
    const row = Math.floor((adjDay - 1) / 7);
    const x = 20 + col * 50;
    const y = 140 + row * 50;
    const mins = activity[day] || 0;
    const isToday = day === 8;

    const intensity = mins === 0 ? P.surface2 :
      mins < 30  ? P.accentLt :
      mins < 60  ? 'rgba(139,69,19,0.25)' :
                   'rgba(139,69,19,0.55)';

    ch.push(
      F(x, y, 40, 40, isToday ? P.accent : intensity, {
        r: isToday ? 20 : 6,
        stroke: isToday ? P.accent : P.border, sw: 1,
        ch: [
          T(String(day), 0, isToday ? 8 : 6, 40, 18, {
            size: 13, weight: isToday ? 700 : 400,
            fill: isToday ? '#fff' : (mins > 0 ? P.text : P.muted),
            align: 'center'
          }),
          ...(mins > 0 && !isToday ? [
            T(mins + 'm', 0, 24, 40, 12, {
              size: 8, weight: 500, fill: P.accent, align: 'center'
            })
          ] : []),
          ...(isToday ? [
            T('38m', 0, 24, 40, 12, {
              size: 8, weight: 600, fill: 'rgba(255,255,255,0.85)', align: 'center'
            })
          ] : [])
        ]
      })
    );
  }

  // Legend
  ch.push(
    T('READING INTENSITY', 20, 406, 200, 12, { size: 8, weight: 700, fill: P.muted, ls: 1.5 }),
    F(20, 420, 20, 12, P.surface2, { r: 3 }),
    F(48, 420, 20, 12, P.accentLt, { r: 3 }),
    F(76, 420, 20, 12, 'rgba(139,69,19,0.25)', { r: 3 }),
    F(104, 420, 20, 12, 'rgba(139,69,19,0.55)', { r: 3 }),
    T('0   < 30m   < 60m   60m+', 132, 420, 200, 12, { size: 9, fill: P.muted })
  );

  // Monthly summary
  ch.push(
    Line(20, 440, 350, P.border),
    T('APRIL SUMMARY', 20, 448, 200, 12, { size: 9, weight: 700, fill: P.accent, ls: 1.5 }),
    Line(20, 462, 350, P.border),
    F(16, 470, 170, 64, P.surface, { r: 8, stroke: P.border, sw: 1,
      ch: [
        T('13 h 20 m', 12, 10, 146, 24, { size: 20, weight: 700, fill: P.text }),
        T('Total reading time', 12, 36, 146, 14, { size: 11, weight: 400, fill: P.muted }),
        T('↑ 28% vs March', 12, 50, 146, 12, { size: 10, weight: 600, fill: P.green }),
      ]
    }),
    F(204, 470, 170, 64, P.surface, { r: 8, stroke: P.border, sw: 1,
      ch: [
        T('3 books', 12, 10, 146, 24, { size: 20, weight: 700, fill: P.text }),
        T('Completed this month', 12, 36, 146, 14, { size: 11, weight: 400, fill: P.muted }),
        T('Goal: 2  ✓', 12, 50, 146, 12, { size: 10, weight: 600, fill: P.green }),
      ]
    }),
    F(16, 542, 170, 64, P.surface, { r: 8, stroke: P.border, sw: 1,
      ch: [
        T('9 days', 12, 10, 146, 24, { size: 20, weight: 700, fill: P.text }),
        T('Current streak', 12, 36, 146, 14, { size: 11, weight: 400, fill: P.muted }),
        T('Best: 21 days', 12, 50, 146, 12, { size: 10, weight: 500, fill: P.muted }),
      ]
    }),
    F(204, 542, 170, 64, P.surface, { r: 8, stroke: P.border, sw: 1,
      ch: [
        T('28 pg/day', 12, 10, 146, 24, { size: 20, weight: 700, fill: P.text }),
        T('Avg daily pages', 12, 36, 146, 14, { size: 11, weight: 400, fill: P.muted }),
        T('↑ from 22 last month', 12, 50, 146, 12, { size: 10, weight: 600, fill: P.green }),
      ]
    })
  );

  // Pace sparkline (simulated with frames)
  ch.push(
    T('READING PACE — LAST 12 MONTHS', 20, 618, 300, 12, { size: 8, weight: 700, fill: P.muted, ls: 1.5 }),
    Line(20, 632, 350, P.border)
  );

  const paceData = [14, 22, 18, 30, 12, 8, 26, 32, 20, 28, 24, 34];
  paceData.forEach((v, i) => {
    const x = 20 + i * 28;
    const maxH = 60;
    const h = Math.round((v / 40) * maxH);
    ch.push(
      F(x, 640 + maxH - h, 20, h, P.accentLt, { r: 2 }),
      F(x, 640 + maxH - h, 20, Math.min(h, 2), P.accent, { r: 1 })
    );
  });

  const months12 = ['M','J','J','A','S','O','N','D','J','F','M','A'];
  months12.forEach((m, i) => {
    ch.push(T(m, 20 + i * 28, 706, 20, 12, {
      size: 8, fill: P.muted, align: 'center'
    }));
  });

  ch.push(...tabBar(3));
  return { id: uid(), type: 'frame', x: 0, y: 0, width: 390, height: 844,
    fill: P.bg, clip: true, name: 'Reading Log', children: ch };
}

// ── SCREEN 5: Year in Books (Editorial Poster) ────────────────────────────────
function screen5() {
  const ch = [
    F(0, 0, 390, 844, P.bg),
    ...statusBar(),
  ];

  // Full-bleed editorial header
  ch.push(
    F(0, 44, 390, 100, P.text),
    T('YEAR', 20, 60, 350, 36, { size: 32, weight: 800, fill: P.bg }),
    T('IN BOOKS', 20, 96, 350, 28, { size: 24, weight: 300, fill: P.bg, ls: 8 }),
    T('2024 ANNUAL REPORT · VELLUM', 20, 126, 350, 14, {
      size: 8, weight: 600, fill: 'rgba(245,240,232,0.45)', ls: 2
    }),
  );

  // Big stat
  ch.push(
    F(16, 152, 358, 88, P.surface, { r: 8, stroke: P.border, sw: 1,
      ch: [
        T('12', 16, 8, 100, 60, { size: 56, weight: 900, fill: P.accent }),
        T('books', 112, 38, 80, 22, { size: 18, weight: 300, fill: P.textMid }),
        T('read this year', 112, 58, 200, 14, { size: 12, weight: 400, fill: P.muted }),
        T('Your best year yet', 200, 16, 150, 14, { size: 11, weight: 500, fill: P.green, align: 'right' }),
        T('↑ 4 more than 2023', 200, 34, 150, 14, { size: 11, weight: 400, fill: P.muted, align: 'right' }),
      ]
    })
  );

  // Genre donut (simulated)
  ch.push(
    Line(20, 248, 350, P.border),
    T('READING DNA', 20, 256, 200, 12, { size: 9, weight: 700, fill: P.accent, ls: 1.8 }),
    Line(20, 270, 350, P.border),
  );

  const genres = [
    { label: 'Literary Fiction', pct: 42, color: P.accent },
    { label: 'Non-Fiction',      pct: 28, color: P.green },
    { label: 'Philosophy',       pct: 17, color: P.spine4 },
    { label: 'Other',            pct: 13, color: P.gold },
  ];

  genres.forEach((g, i) => {
    const y = 278 + i * 36;
    ch.push(
      F(16, y, g.pct * 2.8, 20, g.color + '33', { r: 3 }),
      F(16, y, Math.max(g.pct, 8), 20, g.color, { r: 3,
        ch: [T(String(g.pct) + '%', 4, 3, 60, 14, { size: 9, weight: 700, fill: '#fff' })]
      }),
      T(g.label, 20 + Math.max(g.pct * 2.8 + 8, 80), y + 3, 200, 14,
        { size: 12, weight: 400, fill: P.text })
    );
  });

  // Books spine mosaic
  ch.push(
    Line(20, 428, 350, P.border),
    T('YOUR 2024 SHELF', 20, 436, 200, 12, { size: 9, weight: 700, fill: P.muted, ls: 1.8 }),
    Line(20, 450, 350, P.border),
  );

  const spineColors = [P.spine1, P.spine2, P.spine3, P.spine4, P.spine5, P.spine6,
                       P.spine1, P.accent, P.green, P.gold, P.spine5, P.spine2];
  const spineWidths = [28, 22, 32, 18, 26, 30, 24, 22, 28, 20, 32, 26];

  let spineX = 16;
  spineColors.forEach((c, i) => {
    const w = spineWidths[i];
    ch.push(
      F(spineX, 458, w, 88, c, { r: 3,
        ch: [
          T(String.fromCharCode(65 + i), 0, 10, w, w, {
            size: Math.max(w - 8, 10), weight: 800, fill: '#fff', align: 'center', opacity: 0.35
          })
        ]
      })
    );
    spineX += w + 2;
  });

  // Standout moments
  ch.push(
    Line(20, 554, 350, P.border),
    T('STANDOUT MOMENTS', 20, 562, 200, 12, { size: 9, weight: 700, fill: P.accent, ls: 1.5 }),
    Line(20, 576, 350, P.border),
  );

  const moments = [
    { icon: '⚡', label: 'Fastest read', value: 'Piranesi · 2 days' },
    { icon: '⏳', label: 'Longest read', value: 'Tomorrow… · 3 months' },
    { icon: '★', label: 'Top rated', value: 'Tomorrow… · 5 stars' },
    { icon: '📖', label: 'Most annotated', value: 'The Creative Act · 22 notes' },
  ];

  moments.forEach((m, i) => {
    const y = 584 + i * 40;
    ch.push(
      T(m.icon, 20, y + 10, 30, 20, { size: 16 }),
      T(m.label, 56, y + 6, 120, 14, { size: 11, weight: 500, fill: P.muted }),
      T(m.value, 56, y + 22, 280, 14, { size: 13, weight: 600, fill: P.text }),
      Line(20, y + 38, 350, P.border)
    );
  });

  // CTA banner
  ch.push(
    F(16, 750, 358, 44, P.text, { r: 8,
      ch: [
        T('Share your 2024 Reading Year →', 0, 12, 358, 20, {
          size: 13, weight: 600, fill: P.bg, align: 'center', ls: 0.3
        })
      ]
    })
  );

  ch.push(...tabBar(4));
  return { id: uid(), type: 'frame', x: 0, y: 0, width: 390, height: 844,
    fill: P.bg, clip: true, name: 'Year in Books', children: ch };
}

// ── Assemble ──────────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'Vellum',
  width: 390,
  height: 844,
  fill: P.bg,
  children: [screen1(), screen2(), screen3(), screen4(), screen5()],
};

const outPath = path.join(__dirname, 'vellum.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ vellum.pen written — ${pen.children.length} screens, ${
  pen.children.reduce((a, s) => a + s.children.length, 0)} top-level layers`);
