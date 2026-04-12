'use strict';
// sylvan-app.js
// SYLVAN — Slow Living, Daily Reflection
//
// Challenge: Design a warm artisanal LIGHT-mode daily reflection + habit tracker.
// Inspired by:
//
// 1. Idle Hour Matcha (Lapa.ninja, March 2026 featured) — earthy editorial
//    aesthetic, cream/terracotta palette. "Slow brand" digital products trending.
//
// 2. Emergence Magazine (Siteinspire + Lapa.ninja) — typographic editorial
//    layouts, serif headlines mixed with clean grotesque body, vast whitespace.
//
// 3. Mike Matas Portfolio (Godly #959) — minimal horizontal layout, Lab
//    Grotesque typography, strong negative space, custom hover transitions.
//
// 4. "Typographic" is the #2 category on Siteinspire (2,052 sites!) — type-led
//    design where the headline IS the hero, not a background image.
//
// Theme: LIGHT (last was ZERO — dark)
// Palette: warm ivory + terracotta + sage green + amber gold
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

// Palette
const P = {
  bg:       '#FAF8F3',   // warm ivory
  bg2:      '#F3EFE6',   // cream card bg
  bg3:      '#EDE7D9',   // linen surface
  surface:  '#FFFFFF',   // pure white
  border:   '#E0D9CC',   // parchment border
  border2:  '#CEC5B3',   // stronger border
  fg:       '#1C1917',   // deep charcoal
  fg2:      '#3D3530',   // secondary
  fg3:      '#7A6E64',   // muted warm brown
  muted:    '#A89E94',   // very muted
  accent:   '#C8614A',   // terracotta
  accent2:  '#8FAF78',   // sage green
  accent3:  '#D4A84B',   // warm amber
};

let _id = 0;
const uid = () => `sv${++_id}`;

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
  fontSize: opts.size || 13,
  fontWeight: String(opts.weight || 400),
  fill: opts.fill || P.fg,
  textAlign: opts.align || 'left',
  ...(opts.ls  !== undefined ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh  !== undefined ? { lineHeight: opts.lh } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Line = (x, y, w, fill = P.border) => F(x, y, w, 1, fill, {});

// Organic blob decoration
const Blob = (cx, cy, rx, ry, color, opacity = 0.10) => [
  E(cx - rx,      cy - ry,      rx * 2,   ry * 2,   color, { opacity }),
  E(cx - rx * 0.7, cy - ry * 0.8, rx * 1.4, ry * 1.6, color, { opacity: opacity * 0.5 }),
];

// Label
const Label = (text, x, y, w, color = P.muted) =>
  T(text, x, y, w, 16, { size: 10, weight: 600, fill: color, ls: 1.4 });

// Pill badge
const Pill = (x, y, text, color, w) => {
  const pw = w || (text.length * 6 + 18);
  return F(x, y, pw, 22, color + '18', {
    r: 11, stroke: color + '40', sw: 1,
    ch: [T(text, 0, 3, pw, 16, { size: 10, weight: 600, fill: color, align: 'center', ls: 0.4 })],
  });
};

// Nav
const Nav = (active) => {
  const tabs = [
    { id: 'Today',    icon: '☀' },
    { id: 'Journal',  icon: '✦' },
    { id: 'Habits',   icon: '◎' },
    { id: 'Garden',   icon: '❧' },
    { id: 'Insights', icon: '◈' },
  ];
  const tw = 390 / tabs.length;
  return F(0, 780, 390, 64, P.surface, {
    stroke: P.border, sw: 1,
    ch: tabs.map((t, i) => {
      const isActive = t.id === active;
      return F(i * tw, 0, tw, 64, 'transparent', {
        ch: [
          T(t.icon, i * tw, 8, tw, 24, { size: 18, align: 'center', fill: isActive ? P.accent : P.muted }),
          T(t.id, i * tw, 34, tw, 14, { size: 9, weight: isActive ? 600 : 400,
            fill: isActive ? P.accent : P.muted, align: 'center' }),
          ...(isActive ? [F(i * tw + tw / 2 - 12, 57, 24, 2, P.accent, { r: 1 })] : []),
        ],
      });
    }),
  });
};

const StatusBar = () => F(0, 0, 390, 44, P.bg, {
  ch: [
    T('9:41', 16, 14, 50, 18, { size: 12, weight: 600, fill: P.fg }),
    T('●●●  ▲ ⬛', 316, 14, 68, 16, { size: 10, fill: P.fg3, align: 'right' }),
  ],
});

// ── Screen 1: TODAY ───────────────────────────────────────────────────────────
function screenToday() {
  const s = F(0, 0, 390, 844, P.bg, { clip: true, ch: [] });
  const add = (...els) => s.children.push(...els.flat());

  add(...Blob(310, 120, 85, 70, P.accent3, 0.08));
  add(...Blob(60,  620, 65, 55, P.accent2, 0.09));

  add(StatusBar());
  add(Label('SUNDAY · MARCH 22', 20, 56, 200));
  add(T('Good morning,\nRakis.', 20, 76, 320, 76, { size: 30, weight: 700, fill: P.fg, lh: 1.15 }));

  // Mood check-in
  add(F(20, 172, 350, 98, P.surface, {
    r: 16, stroke: P.border, sw: 1,
    ch: [
      Label('HOW ARE YOU?', 16, 12, 160),
      ...[
        { e: '😔', l: 'Low'     },
        { e: '😐', l: 'Ok'      },
        { e: '🙂', l: 'Good'    },
        { e: '😊', l: 'Great'   },
        { e: '😁', l: 'Amazing' },
      ].map(({ e, l }, i) => F(14 + i * 62, 30, 54, 56, i === 3 ? P.accent + '14' : P.bg2, {
        r: 12,
        stroke: i === 3 ? P.accent + '44' : 'transparent', sw: 1.5,
        ch: [
          T(e, 0, 6, 54, 26, { size: 18, align: 'center' }),
          T(l, 0, 34, 54, 14, { size: 9, align: 'center', fill: i === 3 ? P.accent : P.muted }),
        ],
      })),
    ],
  }));

  // Intentions
  add(F(20, 286, 350, 158, P.surface, {
    r: 16, stroke: P.border, sw: 1,
    ch: [
      Label('TODAY\'S INTENTIONS', 16, 14, 220),
      ...[
        { t: 'Morning walk without headphones', done: true  },
        { t: 'Read 20 pages of Deep Work',       done: true  },
        { t: 'Call Mom in the evening',           done: false },
        { t: 'Cook something new for dinner',     done: false },
      ].map(({ t, done }, i) => F(16, 36 + i * 30, 318, 26, 'transparent', {
        ch: [
          F(0, 3, 20, 20, done ? P.accent2 + 'CC' : P.bg3, {
            r: 10, stroke: done ? 'transparent' : P.border2, sw: 1,
            ch: done ? [T('✓', 0, 2, 20, 16, { size: 10, weight: 700, fill: '#FFF', align: 'center' })] : [],
          }),
          T(t, 28, 4, 270, 18, { size: 12, fill: done ? P.fg3 : P.fg, weight: done ? 400 : 500 }),
        ],
      })),
    ],
  }));

  // Quote
  add(F(20, 460, 350, 84, P.bg3, {
    r: 16,
    ch: [
      T('"The present moment is the only time\nover which we have dominion."', 16, 12, 318, 44,
        { size: 13, fill: P.fg2, lh: 1.6 }),
      T('— Tolstoy', 16, 62, 200, 14, { size: 11, fill: P.muted }),
    ],
  }));

  // Quick log row
  add(F(20, 560, 166, 78, P.surface, {
    r: 14, stroke: P.border, sw: 1,
    ch: [
      T('💧', 14, 12, 28, 28, { size: 22, align: 'center' }),
      T('Water', 48, 14, 90, 16, { size: 12, weight: 600, fill: P.fg }),
      T('6 / 8 glasses', 48, 32, 100, 14, { size: 11, fill: P.muted }),
      F(14, 60, 138, 5, P.bg3, { r: 2.5,
        ch: [F(0, 0, 103, 5, P.accent + 'AA', { r: 2.5 })] }),
    ],
  }));
  add(F(204, 560, 166, 78, P.surface, {
    r: 14, stroke: P.border, sw: 1,
    ch: [
      T('🔥', 14, 12, 28, 28, { size: 22, align: 'center' }),
      T('Breathe', 48, 14, 90, 16, { size: 12, weight: 600, fill: P.fg }),
      T('5 min ✓', 48, 32, 100, 14, { size: 11, fill: P.accent2, weight: 600 }),
      T('Complete', 14, 58, 138, 14, { size: 10, fill: P.muted }),
    ],
  }));

  // CTA
  add(F(20, 654, 350, 50, P.accent, {
    r: 14,
    ch: [T('Begin Evening Reflection →', 0, 15, 350, 20, { size: 14, weight: 600, fill: '#FFF', align: 'center' })],
  }));

  add(Nav('Today'));
  return s;
}

// ── Screen 2: JOURNAL ─────────────────────────────────────────────────────────
function screenJournal() {
  const s = F(0, 0, 390, 844, P.bg, { clip: true, ch: [] });
  const add = (...els) => s.children.push(...els.flat());

  add(...Blob(340, 180, 75, 60, P.accent, 0.06));

  add(StatusBar());
  add(Label('YOUR JOURNAL', 20, 56, 200));
  add(T('Reflections', 20, 76, 280, 44, { size: 30, weight: 700, fill: P.fg }));
  add(F(294, 68, 86, 32, P.accent + '14', {
    r: 16, stroke: P.accent + '33', sw: 1,
    ch: [T('🔥 14 days', 0, 8, 86, 16, { size: 11, weight: 600, fill: P.accent, align: 'center' })],
  }));

  add(F(20, 128, 350, 50, P.accent, {
    r: 12,
    ch: [T('+ New Entry', 0, 15, 350, 20, { size: 14, weight: 600, fill: '#FFF', align: 'center' })],
  }));

  // Week strip
  const days = ['M','T','W','T','F','S','S'];
  const done  = [true, true, true, true, false, false, true];
  add(F(20, 194, 350, 58, P.bg2, { r: 12, ch: [
    ...days.map((d, i) => F(i * 50, 0, 50, 58, 'transparent', { ch: [
      T(d, 0, 8, 50, 14, { size: 10, fill: P.muted, align: 'center', weight: 600 }),
      F(17, 26, 16, 16, done[i] ? (i === 3 ? P.accent : P.accent2) : P.bg3, {
        r: 8, ch: done[i] ? [T('•', 0, 1, 16, 14, { size: 10, fill: '#FFF', align: 'center' })] : [],
      }),
    ]})),
  ]}));

  // Entries
  [
    { date: 'Today · Mar 22',  preview: 'I noticed how much calmer I felt after the morning walk without...', mood: '😊', tag: 'Gratitude' },
    { date: 'Yesterday · 21',  preview: 'The meeting went better than I expected. Learning to trust the...', mood: '😐', tag: 'Work'      },
    { date: 'March 20',        preview: 'Cooked a new recipe tonight. It reminded me of simpler times...', mood: '😁', tag: 'Joy'        },
  ].forEach((e, i) => {
    add(F(20, 268 + i * 138, 350, 124, P.surface, {
      r: 14, stroke: P.border, sw: 1,
      ch: [
        T(e.date, 16, 12, 200, 16, { size: 11, fill: P.muted, weight: 500 }),
        T(e.mood,  318, 8,  24, 24, { size: 18, align: 'center' }),
        Line(16, 34, 318),
        T(e.preview, 16, 46, 318, 36, { size: 13, fill: P.fg2, lh: 1.5 }),
        Pill(16, 92, e.tag, P.accent2),
      ],
    }));
  });

  add(Nav('Journal'));
  return s;
}

// ── Screen 3: HABITS ──────────────────────────────────────────────────────────
function screenHabits() {
  const s = F(0, 0, 390, 844, P.bg, { clip: true, ch: [] });
  const add = (...els) => s.children.push(...els.flat());

  add(...Blob(60, 220, 70, 55, P.accent2, 0.09));
  add(...Blob(320, 660, 65, 50, P.accent3, 0.07));

  add(StatusBar());
  add(Label('HABIT TRACKER', 20, 56, 200));
  add(T('Your Rituals', 20, 76, 240, 44, { size: 30, weight: 700, fill: P.fg }));

  // Stats
  [
    { l: 'Done Today', v: '7/9' },
    { l: 'Week Streak', v: '14' },
    { l: 'Best Streak', v: '31' },
  ].forEach((s2, i) => add(F(20 + i * 118, 132, 108, 68, P.surface, {
    r: 12, stroke: P.border, sw: 1,
    ch: [
      T(s2.v, 0, 10, 108, 30, { size: 22, weight: 700, fill: P.accent, align: 'center' }),
      T(s2.l, 0, 40, 108, 16, { size: 10, fill: P.muted, align: 'center' }),
    ],
  })));

  // Habits
  [
    { n: 'Morning Pages',       e: '📖', done: true,  st: 14, c: P.accent  },
    { n: 'Meditation 10 min',   e: '🌙', done: true,  st: 8,  c: P.accent2 },
    { n: 'No phone before 9am', e: '☀',  done: true,  st: 21, c: P.accent3 },
    { n: 'Gratitude List',      e: '✦',  done: true,  st: 14, c: P.accent  },
    { n: 'Walk / Move',         e: '🌿', done: true,  st: 5,  c: P.accent2 },
    { n: 'Read 20 pages',       e: '📚', done: false, st: 6,  c: P.accent3 },
    { n: 'Digital Sunset 9pm',  e: '🌅', done: false, st: 3,  c: P.muted   },
    { n: 'Evening Reflection',  e: '🔥', done: false, st: 14, c: P.accent  },
  ].forEach((h, i) => {
    add(F(20, 216 + i * 62, 350, 52, P.surface, {
      r: 12, stroke: P.border, sw: 1,
      ch: [
        F(10, 9, 34, 34, h.done ? h.c + '18' : P.bg2, { r: 10,
          ch: [T(h.e, 0, 7, 34, 20, { size: 14, align: 'center' })] }),
        T(h.n, 52, 8, 200, 18, { size: 13, weight: 500, fill: h.done ? P.fg : P.fg3 }),
        T(`🔥 ${h.st}d`, 52, 28, 100, 14, { size: 11, fill: P.muted }),
        F(304, 10, 32, 32, h.done ? P.accent2 + 'CC' : 'transparent', {
          r: 16, stroke: h.done ? 'transparent' : P.border2, sw: 2,
          ch: h.done ? [T('✓', 0, 7, 32, 18, { size: 13, weight: 700, fill: '#FFF', align: 'center' })] : [],
        }),
      ],
    }));
  });

  add(Nav('Habits'));
  return s;
}

// ── Screen 4: GARDEN ──────────────────────────────────────────────────────────
function screenGarden() {
  const s = F(0, 0, 390, 844, P.bg, { clip: true, ch: [] });
  const add = (...els) => s.children.push(...els.flat());

  add(...Blob(195, 400, 155, 140, P.accent2, 0.07));
  add(...Blob(80,  300, 80,  70,  P.accent3, 0.06));
  add(...Blob(310, 560, 85,  75,  P.accent,  0.05));

  add(StatusBar());
  add(Label('GROWTH GARDEN', 20, 56, 200));
  add(T('March Garden', 20, 76, 260, 44, { size: 30, weight: 700, fill: P.fg }));
  add(T('Each bloom = a completed day. Water your garden daily.', 20, 124, 270, 34, { size: 12, fill: P.fg3 }));

  add(Pill(20, 164, 'Morning Pages', P.accent, 102));
  add(Pill(130, 164, 'Meditation',   P.accent2, 82));
  add(Pill(220, 164, 'Movement',     P.accent3, 74));

  // 28-day dot garden
  const doneArr = [1,0.9,0.8,1,0.7,0.5,1, 0.8,1,0.9,0.6,1,0.8,0.4, 1,0.9,0.7,1,0.8,0.6,0.9, 1,0];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 7; col++) {
      const day = row * 7 + col;
      const gx = 26 + col * 48;
      const gy = 204 + row * 64;
      const sz = 36;
      const isPast = day < 22;
      const isToday = day === 21;
      const pct = isPast ? (doneArr[day] || 0.7) : 0;
      const leafCol = col < 3 ? P.accent2 : col < 5 ? P.accent3 : P.accent;
      add(E(gx, gy, sz, sz, leafCol, { opacity: isPast ? Math.max(0.12, pct * 0.85) : 0.06 }));
      if (isPast && pct > 0.7) add(E(gx + 7, gy + 7, sz - 14, sz - 14, leafCol, { opacity: 0.22 }));
      add(T(String(day + 1), gx, gy + 10, sz, 16, {
        size: 11, weight: isToday ? 700 : 400,
        fill: isToday ? P.accent : (isPast ? P.fg2 : P.muted),
        align: 'center',
      }));
      if (isToday) add(E(gx + 11, gy + 30, 14, 5, P.accent, { opacity: 0.5 }));
    }
  }

  add(F(20, 710, 350, 68, P.surface, {
    r: 14, stroke: P.border, sw: 1,
    ch: [
      T('This Month',                     16, 12, 150, 16, { size: 12, weight: 600, fill: P.fg }),
      T('18 of 22 days · 82% consistent', 16, 32, 240, 16, { size: 12, fill: P.fg3 }),
      T('🌱 Flourishing',                  16, 50, 120, 14, { size: 11, fill: P.accent2, weight: 600 }),
      F(256, 18, 80, 32, P.accent2 + '18', { r: 10,
        ch: [T('Best month', 0, 8, 80, 16, { size: 10, fill: P.accent2, align: 'center', weight: 600 })] }),
    ],
  }));

  add(Nav('Garden'));
  return s;
}

// ── Screen 5: INSIGHTS ────────────────────────────────────────────────────────
function screenInsights() {
  const s = F(0, 0, 390, 844, P.bg, { clip: true, ch: [] });
  const add = (...els) => s.children.push(...els.flat());

  add(...Blob(300, 160, 80, 65, P.accent3, 0.07));
  add(...Blob(60,  560, 70, 55, P.accent,  0.06));

  add(StatusBar());
  add(Label('YOUR INSIGHTS', 20, 56, 200));
  add(T('Patterns &\nGrowth', 20, 76, 280, 68, { size: 30, weight: 700, fill: P.fg, lh: 1.2 }));

  // Mood chart
  add(F(20, 162, 350, 134, P.surface, {
    r: 14, stroke: P.border, sw: 1,
    ch: [
      Label('MOOD TREND · THIS WEEK', 16, 12, 220),
      ...[
        { d: 'M', h: 58, c: P.accent2 },
        { d: 'T', h: 74, c: P.accent2 },
        { d: 'W', h: 48, c: P.muted   },
        { d: 'T', h: 80, c: P.accent2 },
        { d: 'F', h: 44, c: P.muted   },
        { d: 'S', h: 34, c: P.bg3     },
        { d: 'S', h: 70, c: P.accent2 },
      ].map(({ d, h, c }, i) => [
        F(18 + i * 46, 110 - h, 30, h, c, { r: 6 }),
        T(d, 18 + i * 46, 114, 30, 12, { size: 10, fill: P.muted, align: 'center' }),
      ]).flat(),
    ],
  }));

  // Insight cards
  [
    { e: '🌅', title: 'Best day: Tuesday',  body: 'You feel most energetic on Tuesdays. Try scheduling creative work then.', c: P.accent3 },
    { e: '📖', title: 'Reading = calm',      body: 'On days you read, your mood scores 23% higher on average.',               c: P.accent2 },
    { e: '💧', title: 'Hydration matters',   body: 'Your best reflection entries all coincide with 8+ glasses of water.',     c: P.accent  },
  ].forEach((ins, i) => {
    add(F(20, 312 + i * 118, 350, 104, P.surface, {
      r: 14, stroke: P.border, sw: 1,
      ch: [
        F(16, 16, 44, 44, ins.c + '18', { r: 12,
          ch: [T(ins.e, 0, 9, 44, 26, { size: 22, align: 'center' })] }),
        T(ins.title, 70, 16, 250, 18, { size: 14, weight: 600, fill: P.fg }),
        T(ins.body,  70, 36, 254, 44, { size: 12, fill: P.fg3, lh: 1.5 }),
        Pill(70, 82, 'Pattern Insight', ins.c, 96),
      ],
    }));
  });

  add(Nav('Insights'));
  return s;
}

// Assemble
const pen = {
  version: '2.8',
  title: 'SYLVAN — Slow Living, Daily Reflection',
  description: 'Warm artisanal light-mode mindfulness + habit tracker. Inspired by Idle Hour Matcha (Lapa Ninja), Emergence Magazine (Siteinspire), and Mike Matas portfolio (Godly). Earthy terracotta + sage green + warm ivory + amber palette.',
  viewport: { width: 390, height: 844 },
  screens: [
    { id: 'today',    label: 'Today',    width: 390, height: 844, children: [screenToday()]    },
    { id: 'journal',  label: 'Journal',  width: 390, height: 844, children: [screenJournal()]  },
    { id: 'habits',   label: 'Habits',   width: 390, height: 844, children: [screenHabits()]   },
    { id: 'garden',   label: 'Garden',   width: 390, height: 844, children: [screenGarden()]   },
    { id: 'insights', label: 'Insights', width: 390, height: 844, children: [screenInsights()] },
  ],
};

const outPath = path.join(__dirname, 'sylvan.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
console.log(`✓ sylvan.pen written (${kb} KB)`);
console.log('  Screens:', pen.screens.map(s => s.label).join(', '));
console.log('  Palette: ivory #FAF8F3 / terracotta #C8614A / sage #8FAF78 / amber #D4A84B');
