#!/usr/bin/env node
// DOUGH — The Museum of Personal Finance
// Heartbeat Challenge inspired by:
//   - MoMoney (awwwards SOTD) — dark institutional forest green + electric neon green,
//     "GET TO KNOW YOUR DOUGH" editorial headline, museum-of-money framing for fintech
//   - Radiant AI brand identity (heartbeat-research.md) — structured AI output as deliverable,
//     editorial brand system aesthetic
//   - Dark-museum UI pattern: exhibit label typography, artifact-card grid, wing directory

const https = require('https');
const fs    = require('fs');

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const P = {
  bg:       '#060E06',  // void-black with green undertone
  canvas:   '#0D1A0D',  // raised surface
  card:     '#122012',  // card background
  neon:     '#39FF14',  // electric neon green (MoMoney signature)
  neonDim:  '#0A200A',  // dark neon surface
  white:    '#E4EEE4',  // near-white with green tint
  sub:      '#4A7A4A',  // secondary text (muted green)
  border:   '#182818',  // subtle border
  gold:     '#D4AF37',  // monetary gold
  goldDim:  '#1A1400',  // dark gold surface
  red:      '#FF4D4D',  // loss / negative
  redDim:   '#200808',  // dark red surface
  blue:     '#4DA6FF',  // info / neutral
};

const MW = 375, MH = 812;   // mobile canvas
const PW = 1440, PH = 900;  // desktop canvas

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

// ─── EXHIBIT LABEL ─────────────────────────────────────────────────────────────
// Museum-style exhibit plaque: number tag + title
function ExhibitTag(x, y, no, label, col = P.neon) {
  return F(x, y, 180, 32, 'transparent', [
    R(0, 4, 48, 24, col, { op: 0.12, r: 2 }),
    T(no, 0, 8, 48, 16, 8, col, true, 'center', 1, 1.5),
    T(label, 56, 8, 124, 16, 8, P.sub, false, 'left', 1, 2),
  ]);
}

// ─── DATA BAR ──────────────────────────────────────────────────────────────────
// Museum-style data visualization bar (horizontal progress strip)
function DataBar(x, y, w, label, value, pct, col) {
  return F(x, y, w, 40, 'transparent', [
    T(label, 0, 0, w - 80, 14, 10, P.sub, false, 'left', 1, 1.5),
    T(value, w - 80, 0, 80, 14, 10, col, true, 'right', 1, 0.5),
    R(0, 20, w, 6, P.border, { r: 2 }),
    R(0, 20, Math.round(w * Math.min(pct, 1)), 6, col, { r: 2 }),
  ]);
}

// ─── EXHIBIT CARD ──────────────────────────────────────────────────────────────
// Card styled as a museum exhibit placard
function ExhibitCard(x, y, w, h, no, title, desc, col, locked = false) {
  return F(x, y, w, h, P.card, [
    R(0, 0, w, 3, col),
    F(16, 16, w - 32, 20, 'transparent', [
      R(0, 0, 36, 20, col, { op: 0.15, r: 2 }),
      T(no, 0, 4, 36, 12, 7, col, true, 'center', 1, 2),
      T(locked ? 'LOCKED' : 'OPEN', w - 32 - 56, 4, 56, 12, 7, locked ? P.sub : P.neon, true, 'right', 1, 1.5),
    ]),
    T(title, 16, 44, w - 32, 32, 14, locked ? P.sub : P.white, true, 'left', 1, -0.5),
    T(desc,  16, 80, w - 32, h - 100, 10, P.sub, false, 'left', 1, 0),
  ], { r: 4 });
}

// ─── MOBILE SCREEN 1 — HOME / DISCOVER ────────────────────────────────────────
function mobileHome() {
  return F(0, 0, MW, MH, P.bg, [
    // Status bar
    R(0, 0, MW, 44, P.bg),
    T('9:41', 16, 14, 60, 18, 13, P.white, true),
    T('●●●', MW - 80, 14, 64, 18, 11, P.white, false, 'right'),

    // Nav
    F(0, 44, MW, 52, P.canvas, [
      T('DOUGH', 20, 14, 100, 24, 15, P.white, true, 'left', 1, 4),
      R(MW - 20 - 28, 12, 28, 28, P.neonDim, { r: 14 }),
      E(MW - 20 - 14, 26, 12, 12, P.neon),
      Line(0, 51, MW, 1, P.border),
    ]),

    // Hero section
    F(0, 96, MW, 148, P.bg, [
      T('WING I  ·  EXHIBIT HALL  ·  2026', 20, 16, MW - 40, 12, 8, P.sub, false, 'left', 1, 3),
      T('GET TO', 20, 34, MW - 40, 44, 38, P.white, true, 'left', 1, -1),
      T('KNOW YOUR', 20, 74, MW - 40, 44, 38, P.white, true, 'left', 1, -1),
      T('DOUGH', 20, 114, MW - 40, 44, 38, P.neon, true, 'left', 1, -1),
    ]),

    // Divider strip
    R(0, 244, MW, 1, P.border),
    T('FEATURED EXHIBITS', 20, 252, MW - 40, 14, 8, P.sub, true, 'left', 1, 3),

    // Exhibit cards
    ExhibitCard(20, 272, MW - 40, 112, 'EX·01', 'Compound Interest', 'How your money earns money — and why time is your greatest asset.', P.neon),
    ExhibitCard(20, 396, MW - 40, 112, 'EX·04', 'Index Funds & ETFs', 'The lazy person\'s guide to building long-term wealth.', P.gold),
    ExhibitCard(20, 520, MW - 40, 112, 'EX·07', 'Emergency Fund', 'The unsexy truth: 3–6 months of expenses that changes everything.', P.blue),

    // Bottom nav
    F(0, MH - 80, MW, 80, P.canvas, [
      Line(0, 0, MW, 1, P.border),
      T('⊞', 28, 16, 44, 36, 20, P.neon, false, 'center'),
      T('HOME', 14, 48, 60, 12, 7, P.neon, true, 'center', 1, 1.5),
      T('◫', MW / 4 + 10, 16, 44, 36, 20, P.sub, false, 'center'),
      T('LEARN', MW / 4 - 4, 48, 60, 12, 7, P.sub, true, 'center', 1, 1.5),
      T('◈', MW / 2 - 10, 16, 44, 36, 20, P.sub, false, 'center'),
      T('PORTFOLIO', MW / 2 - 22, 48, 60, 12, 7, P.sub, true, 'center', 1, 1),
      T('◉', 3 * MW / 4 - 8, 16, 44, 36, 20, P.sub, false, 'center'),
      T('PROFILE', 3 * MW / 4 - 18, 48, 60, 12, 7, P.sub, true, 'center', 1, 1.5),
    ]),
  ]);
}

// ─── MOBILE SCREEN 2 — LESSON ─────────────────────────────────────────────────
function mobileLesson() {
  return F(0, 0, MW, MH, P.bg, [
    R(0, 0, MW, 44, P.bg),
    T('9:41', 16, 14, 60, 18, 13, P.white, true),
    T('●●●', MW - 80, 14, 64, 18, 11, P.white, false, 'right'),

    // Nav with back
    F(0, 44, MW, 52, P.canvas, [
      T('←', 20, 14, 28, 24, 16, P.sub),
      T('EXHIBIT 01', MW / 2 - 60, 16, 120, 20, 10, P.sub, true, 'center', 1, 3),
      Line(0, 51, MW, 1, P.border),
    ]),

    // Exhibit header
    F(20, 112, MW - 40, 80, P.neonDim, [
      R(0, 0, 3, 80, P.neon),
      T('WING I — EXHIBIT 01', 16, 14, MW - 76, 12, 7, P.neon, true, 'left', 1, 3),
      T('Compound Interest', 16, 32, MW - 76, 28, 18, P.white, true),
      T('THE EIGHTH WONDER OF THE WORLD', 16, 62, MW - 76, 12, 7, P.sub, false, 'left', 1, 2),
    ], { r: 4 }),

    // Article text blocks (rendered as text rect rows for density)
    T('What is it?', 20, 208, MW - 40, 18, 13, P.white, true),
    T('When you earn interest on both your initial deposit and the interest you\'ve already earned, money starts to multiply — slowly at first, then explosively.', 20, 230, MW - 40, 56, 11, P.sub),

    // Visual: growth chart
    F(20, 296, MW - 40, 140, P.canvas, [
      T('GROWTH OVER 30 YEARS — $10,000 AT 8%', 12, 12, MW - 80, 12, 7, P.sub, true, 'left', 1, 1.5),
      Line(0, 30, MW - 40, 1, P.border),
      // Year markers
      T('NOW', 12, 38, 40, 12, 7, P.sub, false, 'left', 1, 1),
      T('10Y', 12, 66, 40, 12, 7, P.sub, false, 'left', 1, 1),
      T('20Y', 12, 94, 40, 12, 7, P.sub, false, 'left', 1, 1),
      T('30Y', 12, 122, 40, 12, 7, P.neon, false, 'left', 1, 1),
      // Bars (compound growth: 10k, 21.6k, 46.6k, 100.6k)
      R(48, 34, Math.round((MW - 100) * 0.10), 16, P.border, { r: 2 }),
      T('$10,000', 52, 38, 100, 12, 7, P.white, false, 'left', 1, 0),
      R(48, 62, Math.round((MW - 100) * 0.21), 16, P.border, { r: 2 }),
      T('$21,600', 52, 66, 100, 12, 7, P.white, false, 'left', 1, 0),
      R(48, 90, Math.round((MW - 100) * 0.46), 16, P.border, { r: 2 }),
      T('$46,600', 52, 94, 100, 12, 7, P.white, false, 'left', 1, 0),
      R(48, 118, Math.round((MW - 100) * 1.0), 16, P.neon, { r: 2, op: 0.8 }),
      T('$100,600', 52, 122, 120, 12, 7, P.neon, true, 'left', 1, 0),
    ], { r: 4 }),

    T('The key insight: start early. A 25-year-old investing $200/month outperforms a 35-year-old investing $400/month.', 20, 448, MW - 40, 48, 11, P.sub),

    // CTA button
    F(20, 508, MW - 40, 48, P.neon, [
      T('TAKE THE QUIZ  →', 0, 14, MW - 40, 20, 11, P.bg, true, 'center', 1, 3),
    ], { r: 4 }),

    // Progress dots
    F(MW / 2 - 40, 572, 80, 8, 'transparent', [
      R(0, 0, 8, 8, P.neon, { r: 4 }),
      R(16, 1, 6, 6, P.border, { r: 3 }),
      R(30, 1, 6, 6, P.border, { r: 3 }),
      R(44, 1, 6, 6, P.border, { r: 3 }),
      R(58, 1, 6, 6, P.border, { r: 3 }),
    ]),

    // Bottom nav
    F(0, MH - 80, MW, 80, P.canvas, [
      Line(0, 0, MW, 1, P.border),
      T('⊞', 28, 16, 44, 36, 20, P.sub, false, 'center'),
      T('HOME', 14, 48, 60, 12, 7, P.sub, true, 'center', 1, 1.5),
      T('◫', MW / 4 + 10, 16, 44, 36, 20, P.neon, false, 'center'),
      T('LEARN', MW / 4 - 4, 48, 60, 12, 7, P.neon, true, 'center', 1, 1.5),
    ]),
  ]);
}

// ─── MOBILE SCREEN 3 — PORTFOLIO ──────────────────────────────────────────────
function mobilePortfolio() {
  const assets = [
    { label: 'US EQUITIES',    value: '$14,400', pct: 0.593, col: P.neon  },
    { label: 'BONDS',          value: '$4,200',  pct: 0.173, col: P.gold  },
    { label: 'INTERNATIONAL',  value: '$3,800',  pct: 0.156, col: P.blue  },
    { label: 'CASH',           value: '$1,900',  pct: 0.078, col: P.sub   },
  ];

  return F(0, 0, MW, MH, P.bg, [
    R(0, 0, MW, 44, P.bg),
    T('9:41', 16, 14, 60, 18, 13, P.white, true),
    T('●●●', MW - 80, 14, 64, 18, 11, P.white, false, 'right'),

    F(0, 44, MW, 52, P.canvas, [
      T('MY EXHIBIT', MW / 2 - 60, 16, 120, 20, 10, P.sub, true, 'center', 1, 3),
      Line(0, 51, MW, 1, P.border),
    ]),

    // Net worth display
    F(20, 112, MW - 40, 100, P.neonDim, [
      T('TOTAL NET WORTH', 20, 16, MW - 80, 14, 8, P.neon, true, 'left', 1, 3),
      T('$24,300', 20, 36, MW - 80, 44, 36, P.white, true),
      T('+$1,240  (+5.4%)  THIS MONTH', 20, 82, MW - 80, 14, 8, P.neon, true, 'left', 1, 1),
    ], { r: 4 }),

    // Asset allocation
    T('ASSET ALLOCATION', 20, 228, MW - 40, 14, 8, P.sub, true, 'left', 1, 3),
    Line(20, 246, MW - 40, 1, P.border),

    ...assets.map((a, i) =>
      DataBar(20, 256 + i * 52, MW - 40, a.label, a.value, a.pct, a.col)
    ),

    // Recent activity
    T('RECENT ACTIVITY', 20, 476, MW - 40, 14, 8, P.sub, true, 'left', 1, 3),
    Line(20, 494, MW - 40, 1, P.border),

    // Transaction rows
    ...[
      { desc: 'Dividend — VTSAX',    amount: '+$32.14', col: P.neon  },
      { desc: 'Auto-invest — ETF',   amount: '-$200.00', col: P.sub  },
      { desc: 'Interest — HYSA',     amount: '+$8.67',  col: P.neon  },
    ].map((t, i) =>
      F(20, 502 + i * 52, MW - 40, 44, P.canvas, [
        T(t.desc,   12, 14, MW - 100, 16, 12, P.white),
        T(t.amount, MW - 100, 14, 68, 16, 12, t.col, true, 'right'),
        Line(0, 43, MW - 40, 1, P.border),
      ], { r: 4 })
    ),

    // Bottom nav
    F(0, MH - 80, MW, 80, P.canvas, [
      Line(0, 0, MW, 1, P.border),
      T('⊞', 28, 16, 44, 36, 20, P.sub, false, 'center'),
      T('HOME', 14, 48, 60, 12, 7, P.sub, true, 'center', 1, 1.5),
      T('◫', MW / 4 + 10, 16, 44, 36, 20, P.sub, false, 'center'),
      T('LEARN', MW / 4 - 4, 48, 60, 12, 7, P.sub, true, 'center', 1, 1.5),
      T('◈', MW / 2 - 10, 16, 44, 36, 20, P.neon, false, 'center'),
      T('PORTFOLIO', MW / 2 - 22, 48, 60, 12, 7, P.neon, true, 'center', 1, 1),
    ]),
  ]);
}

// ─── MOBILE SCREEN 4 — QUIZ ───────────────────────────────────────────────────
function mobileQuiz() {
  const answers = [
    { letter: 'A', text: 'Interest earned only on your principal deposit', correct: false },
    { letter: 'B', text: 'Interest earned on principal + accumulated interest', correct: true },
    { letter: 'C', text: 'A type of government bond investment', correct: false },
    { letter: 'D', text: 'Monthly fee charged by your bank', correct: false },
  ];

  return F(0, 0, MW, MH, P.bg, [
    R(0, 0, MW, 44, P.bg),
    T('9:41', 16, 14, 60, 18, 13, P.white, true),
    T('●●●', MW - 80, 14, 64, 18, 11, P.white, false, 'right'),

    F(0, 44, MW, 52, P.canvas, [
      T('← EXHIBIT 01', 20, 16, 140, 20, 10, P.sub),
      T('1/5', MW - 56, 16, 36, 20, 10, P.sub, false, 'right', 1, 1),
      Line(0, 51, MW, 1, P.border),
    ]),

    // Progress bar
    R(0, 96, MW, 3, P.border),
    R(0, 96, Math.round(MW * 0.2), 3, P.neon),

    // Question card
    F(20, 116, MW - 40, 120, P.canvas, [
      T('CHALLENGE — EXHIBIT 01', 16, 16, MW - 72, 12, 7, P.neon, true, 'left', 1, 3),
      Line(0, 34, MW - 40, 1, P.border),
      T('What is the definition of compound interest?', 16, 46, MW - 72, 64, 14, P.white, true),
    ], { r: 4 }),

    // Answer options
    ...answers.map((a, i) =>
      F(20, 252 + i * 68, MW - 40, 56, a.correct ? P.neonDim : P.canvas, [
        R(0, 0, MW - 40, 56, a.correct ? P.neon : P.border, { op: a.correct ? 0.15 : 0.5, r: 4 }),
        R(16, 16, 24, 24, a.correct ? P.neon : P.canvas, { r: 12, op: a.correct ? 0.3 : 1 }),
        T(a.letter, 16, 20, 24, 16, 9, a.correct ? P.neon : P.sub, true, 'center', 1, 1),
        T(a.text, 52, 18, MW - 104, 20, 11, a.correct ? P.neon : P.sub),
      ], { r: 4 })
    ),

    // Submit button
    F(20, 532, MW - 40, 48, P.neon, [
      T('SUBMIT ANSWER', 0, 14, MW - 40, 20, 11, P.bg, true, 'center', 1, 3),
    ], { r: 4 }),

    // Streak indicator
    F(20, 596, MW - 40, 36, P.canvas, [
      T('🔥', 12, 8, 24, 20, 14, P.white, false, 'center'),
      T('12-DAY STREAK · KEEP GOING', 44, 10, MW - 80, 16, 8, P.sub, true, 'left', 1, 2),
    ], { r: 4 }),
  ]);
}

// ─── MOBILE SCREEN 5 — PROGRESS / LEARNING PATH ───────────────────────────────
function mobileProgress() {
  const exhibits = [
    { no: '01', title: 'Compound Interest',  done: true  },
    { no: '02', title: 'Budgeting 50/30/20', done: true  },
    { no: '03', title: 'Emergency Funds',    done: true  },
    { no: '04', title: 'Index Funds',        done: false },
    { no: '05', title: 'Tax-Advantaged',     done: false },
    { no: '06', title: 'Debt Snowball',      done: false },
  ];

  return F(0, 0, MW, MH, P.bg, [
    R(0, 0, MW, 44, P.bg),
    T('9:41', 16, 14, 60, 18, 13, P.white, true),
    T('●●●', MW - 80, 14, 64, 18, 11, P.white, false, 'right'),

    F(0, 44, MW, 52, P.canvas, [
      T('MY PROGRESS', MW / 2 - 64, 16, 128, 20, 10, P.sub, true, 'center', 1, 3),
      Line(0, 51, MW, 1, P.border),
    ]),

    // Level card
    F(20, 112, MW - 40, 80, P.neonDim, [
      T('CURRENT LEVEL', 16, 14, MW - 72, 12, 7, P.neon, true, 'left', 1, 3),
      T('FINANCIAL SOPHOMORE', 16, 32, MW - 72, 24, 16, P.white, true),
      R(0, 63, MW - 40, 6, P.border, { r: 3 }),
      R(0, 63, Math.round((MW - 40) * 0.45), 6, P.neon, { r: 3 }),
      T('3/6 EXHIBITS COMPLETE', MW - 160, 62, 140, 10, 7, P.sub, false, 'right', 1, 1.5),
    ], { r: 4 }),

    // Streak
    F(20, 208, MW - 40, 44, P.canvas, [
      T('STREAK', 16, 14, 60, 16, 8, P.sub, true, 'left', 1, 2),
      T('12 DAYS', MW - 40 - 80, 12, 72, 20, 14, P.gold, true, 'right'),
      T('🔥 Keep it up — quiz daily to maintain your streak', 100, 14, MW - 180, 16, 9, P.sub),
    ], { r: 4 }),

    // Exhibit grid
    T('WING I — THE FUNDAMENTALS', 20, 268, MW - 40, 14, 8, P.sub, true, 'left', 1, 2.5),
    Line(20, 286, MW - 40, 1, P.border),

    ...exhibits.map((ex, i) => {
      const col = Math.floor(i / 3);
      const row = i % 3;
      const cx = 20 + col * ((MW - 40) / 2 + 8);
      const cy = 296 + row * 80;
      const cw = (MW - 48) / 2;
      return F(cx, cy, cw, 68, ex.done ? P.neonDim : P.canvas, [
        R(0, 0, cw, 3, ex.done ? P.neon : P.border),
        T(`EX·${ex.no}`, 12, 10, 40, 12, 7, ex.done ? P.neon : P.sub, true, 'left', 1, 2),
        T(ex.done ? '✓' : '◯', cw - 28, 8, 20, 16, 11, ex.done ? P.neon : P.border, false, 'right'),
        T(ex.title, 12, 28, cw - 24, 28, 10, ex.done ? P.white : P.sub, true),
      ], { r: 4 });
    }),

    // Bottom nav
    F(0, MH - 80, MW, 80, P.canvas, [
      Line(0, 0, MW, 1, P.border),
      T('⊞', 28, 16, 44, 36, 20, P.sub, false, 'center'),
      T('◫', MW / 4 + 10, 16, 44, 36, 20, P.sub, false, 'center'),
      T('◈', MW / 2 - 10, 16, 44, 36, 20, P.sub, false, 'center'),
      T('◉', 3 * MW / 4 - 8, 16, 44, 36, 20, P.neon, false, 'center'),
      T('PROFILE', 3 * MW / 4 - 18, 48, 60, 12, 7, P.neon, true, 'center', 1, 1.5),
    ]),
  ]);
}

// ─── DESKTOP SCREEN 1 — MUSEUM HUB / LANDING ──────────────────────────────────
function desktopHub() {
  const wings = [
    { no: 'I',   title: 'THE FUNDAMENTALS',   count: 6, col: P.neon  },
    { no: 'II',  title: 'INVESTING',           count: 8, col: P.gold  },
    { no: 'III', title: 'DEBT & CREDIT',       count: 5, col: P.blue  },
    { no: 'IV',  title: 'ADVANCED STRATEGIES', count: 7, col: P.sub   },
  ];

  return F(0, 0, PW, PH, P.bg, [
    // Top nav
    F(0, 0, PW, 64, P.canvas, [
      T('DOUGH', 48, 20, 120, 28, 18, P.neon, true, 'left', 1, 4),
      T('THE MUSEUM OF PERSONAL FINANCE', 180, 22, 380, 22, 9, P.sub, false, 'left', 1, 3),
      T('Explore', 640, 22, 72, 22, 12, P.sub),
      T('My Portfolio', 720, 22, 100, 22, 12, P.sub),
      T('Progress', 828, 22, 80, 22, 12, P.sub),
      // Streak badge
      F(PW - 220, 16, 120, 32, P.neonDim, [
        T('🔥 12-DAY STREAK', 0, 9, 120, 16, 9, P.neon, true, 'center', 1, 1.5),
      ], { r: 16 }),
      F(PW - 92, 16, 44, 32, P.canvas, [
        E(0, 0, 44, 32, P.neonDim),
        T('RK', 0, 8, 44, 16, 11, P.neon, true, 'center', 1, 1),
      ], { r: 16 }),
      Line(0, 63, PW, 1, P.border),
    ]),

    // Left column: hero
    F(48, 88, 680, PH - 130, P.bg, [
      T('WING I  ·  THE FUNDAMENTALS  ·  6 EXHIBITS', 0, 16, 640, 14, 8, P.sub, false, 'left', 1, 3),
      T('GET TO', 0, 44, 640, 80, 72, P.white, true, 'left', 1, -2),
      T('KNOW YOUR', 0, 116, 640, 80, 72, P.white, true, 'left', 1, -2),
      T('DOUGH', 0, 188, 640, 80, 72, P.neon, true, 'left', 1, -2),
      T('A self-directed museum of personal finance. Browse exhibits, take challenges, and earn your financial literacy certificate — at your own pace.', 0, 284, 560, 56, 14, P.sub, false, 'left', 1, 0.3),
      F(0, 352, 220, 52, P.neon, [
        T('ENTER EXHIBIT HALL', 0, 16, 220, 20, 11, P.bg, true, 'center', 1, 3),
      ], { r: 4 }),
      F(228, 352, 160, 52, P.canvas, [
        T('MY PROGRESS ↗', 0, 16, 160, 20, 11, P.sub, false, 'center', 1, 2),
      ], { r: 4 }),
    ]),

    // Right column: wing directory
    F(PW - 680, 88, 632, PH - 130, P.bg, [
      T('MUSEUM DIRECTORY', 0, 16, 600, 14, 8, P.sub, true, 'left', 1, 3),
      Line(0, 34, 600, 1, P.border),
      ...wings.map((w, i) =>
        F(0, 48 + i * 140, 600, 128, P.canvas, [
          R(0, 0, 600, 3, w.col),
          T(`WING ${w.no}`, 20, 18, 80, 16, 8, w.col, true, 'left', 1, 3),
          T(`${w.count} EXHIBITS`, 540, 18, 60, 16, 8, P.sub, false, 'right', 1, 1.5),
          T(w.title, 20, 40, 400, 28, 20, w.col !== P.sub ? P.white : P.sub, true),
          F(20, 80, 560, 24, 'transparent', [
            R(0, 8, 560, 4, P.border, { r: 2 }),
            R(0, 8, Math.round(560 * (i === 0 ? 0.5 : i === 1 ? 0.3 : i === 2 ? 0.1 : 0.0)), 4, w.col, { r: 2 }),
            T(i === 0 ? '3/6 COMPLETE' : i === 1 ? '2/8 COMPLETE' : 'NOT STARTED', 0, 0, 560, 12, 7, w.col !== P.sub ? w.col : P.sub, false, 'right', 1, 1.5),
          ]),
        ], { r: 4 })
      ),
    ]),

    // Footer bar
    F(0, PH - 42, PW, 42, P.canvas, [
      Line(0, 0, PW, 1, P.border),
      T('DOUGH — THE MUSEUM OF PERSONAL FINANCE', 48, 12, 400, 18, 8, P.sub, false, 'left', 0.6, 3),
      T('5/26 EXHIBITS COMPLETE · 12-DAY STREAK · FINANCIAL SOPHOMORE', PW / 2 - 240, 12, 480, 18, 8, P.neon, false, 'center', 0.5, 1.5),
      T('zenbin.org/p/museum-money', PW - 288, 12, 240, 18, 8, P.sub, false, 'right', 0.4, 1.5),
    ]),
  ]);
}

// ─── DESKTOP SCREEN 2 — EXHIBIT DETAIL ────────────────────────────────────────
function desktopExhibit() {
  const years = [0, 5, 10, 15, 20, 25, 30];
  const values = [10000, 14693, 21589, 31722, 46610, 68485, 100627];
  const maxV = 100627;
  const chartW = 560;
  const chartH = 240;

  return F(0, 0, PW, PH, P.bg, [
    // Nav
    F(0, 0, PW, 64, P.canvas, [
      T('DOUGH', 48, 20, 120, 28, 18, P.neon, true, 'left', 1, 4),
      T('← Wing I  /  Exhibit 01  /  Compound Interest', 180, 22, 440, 22, 10, P.sub),
      F(PW - 220, 16, 120, 32, P.neonDim, [
        T('🔥 12-DAY STREAK', 0, 9, 120, 16, 9, P.neon, true, 'center', 1, 1.5),
      ], { r: 16 }),
      Line(0, 63, PW, 1, P.border),
    ]),

    // Left: article content
    F(48, 88, 640, PH - 130, P.bg, [
      ExhibitTag(0, 12, 'EX·01', 'WING I — THE FUNDAMENTALS'),
      T('Compound', 0, 54, 600, 56, 52, P.white, true, 'left', 1, -1),
      T('Interest', 0, 104, 600, 56, 52, P.neon, true, 'left', 1, -1),
      T('THE EIGHTH WONDER OF THE WORLD', 0, 168, 600, 14, 8, P.sub, false, 'left', 0.7, 3),
      Line(0, 188, 600, 1, P.border),
      T('What is it?', 0, 204, 600, 22, 14, P.white, true),
      T('When you earn interest on both your initial deposit and all the interest you\'ve already earned, your money begins to multiply — slowly at first, then explosively over time. This is compound interest.', 0, 232, 600, 52, 12, P.sub, false, 'left', 1, 0.2),
      T('Why does it matter?', 0, 296, 600, 22, 14, P.white, true),
      T('A single $10,000 deposit at 8% annual return becomes $100,600 after 30 years — without adding another dollar. The early years feel slow. The final decade is where the magic happens.', 0, 322, 600, 52, 12, P.sub, false, 'left', 1, 0.2),
      T('The golden rule: time > amount.', 0, 386, 600, 22, 14, P.white, true),
      T('A 25-year-old investing $200/month for 40 years ends with more than a 35-year-old investing $400/month for 30 years — despite contributing half the capital. Start early, even small.', 0, 410, 600, 52, 12, P.sub, false, 'left', 1, 0.2),
      F(0, 476, 180, 48, P.neon, [
        T('TAKE THE QUIZ  →', 0, 14, 180, 20, 11, P.bg, true, 'center', 1, 2.5),
      ], { r: 4 }),
      F(188, 476, 140, 48, P.canvas, [
        T('BOOKMARK ☆', 0, 14, 140, 20, 11, P.sub, false, 'center', 1, 2),
      ], { r: 4 }),
    ]),

    // Right: interactive chart + key stats
    F(PW - 720, 88, 672, PH - 130, P.bg, [
      F(0, 0, 672, 280, P.canvas, [
        T('$10,000 AT 8% ANNUAL RETURN', 24, 20, 400, 14, 8, P.sub, true, 'left', 1, 2),
        T('30-YEAR COMPOUND GROWTH', 24, 38, 400, 14, 8, P.neon, false, 'left', 1, 1.5),
        Line(0, 60, 672, 1, P.border),
        // Chart bars
        ...years.map((yr, i) => {
          const barH = Math.round((chartH - 20) * values[i] / maxV);
          const barX = 24 + i * 80;
          const barY = 62 + (chartH - 20) - barH;
          const isLast = i === years.length - 1;
          return F(barX, 62, 64, chartH, 'transparent', [
            R(8, chartH - barH, 48, barH, isLast ? P.neon : P.border, { r: 3, op: isLast ? 0.8 : 1 }),
            T(`${yr}Y`, 0, chartH + 4, 64, 16, 8, isLast ? P.neon : P.sub, false, 'center', 1, 1),
            T(isLast ? '$100K' : '', 0, chartH - barH - 16, 64, 14, 7, P.neon, true, 'center', 1, 0),
          ]);
        }),
      ], { r: 4 }),

      // Key stats
      F(0, 296, 672, 100, P.canvas, [
        F(16, 16, 196, 68, P.neonDim, [
          T('INITIAL DEPOSIT', 12, 10, 172, 12, 7, P.sub, false, 'left', 1, 1.5),
          T('$10,000', 12, 28, 172, 24, 18, P.white, true),
        ], { r: 4 }),
        F(228, 16, 196, 68, P.neonDim, [
          T('AFTER 30 YEARS', 12, 10, 172, 12, 7, P.sub, false, 'left', 1, 1.5),
          T('$100,600', 12, 28, 172, 24, 18, P.neon, true),
        ], { r: 4 }),
        F(440, 16, 216, 68, P.neonDim, [
          T('TOTAL GROWTH', 12, 10, 192, 12, 7, P.sub, false, 'left', 1, 1.5),
          T('+906%', 12, 28, 192, 24, 18, P.gold, true),
        ], { r: 4 }),
      ], { r: 4 }),

      // Related exhibits
      T('NEXT IN WING I', 0, 412, 672, 14, 8, P.sub, true, 'left', 1, 3),
      Line(0, 430, 672, 1, P.border),
      ExhibitCard(0, 440, 320, 108, 'EX·02', 'The 50/30/20 Rule', 'A budgeting framework that works for nearly every income level.', P.gold),
      ExhibitCard(336, 440, 320, 108, 'EX·03', 'Emergency Funds', 'The safety net most people skip — until they need it desperately.', P.blue),
    ]),

    F(0, PH - 42, PW, 42, P.canvas, [
      Line(0, 0, PW, 1, P.border),
      T('DOUGH — THE MUSEUM OF PERSONAL FINANCE', 48, 12, 400, 18, 8, P.sub, false, 'left', 0.6, 3),
    ]),
  ]);
}

// ─── DESKTOP SCREEN 3 — PORTFOLIO GALLERY ──────────────────────────────────────
function desktopPortfolio() {
  const holdings = [
    { name: 'Vanguard Total Stock (VTSAX)',    type: 'EQUITY',    value: '$14,400', change: '+5.4%',  pct: 0.593, col: P.neon },
    { name: 'Vanguard Total Bond (VBTLX)',     type: 'FIXED',     value: '$4,200',  change: '+1.2%',  pct: 0.173, col: P.gold },
    { name: 'Vanguard Intl Stock (VTIAX)',     type: 'EQUITY',    value: '$3,800',  change: '+3.1%',  pct: 0.156, col: P.blue },
    { name: 'High-Yield Savings (HYSA)',       type: 'CASH',      value: '$1,900',  change: '+0.4%',  pct: 0.078, col: P.sub  },
  ];

  return F(0, 0, PW, PH, P.bg, [
    F(0, 0, PW, 64, P.canvas, [
      T('DOUGH', 48, 20, 120, 28, 18, P.neon, true, 'left', 1, 4),
      T('My Portfolio', 180, 22, 120, 22, 12, P.white, true),
      F(PW - 220, 16, 120, 32, P.neonDim, [
        T('🔥 12-DAY STREAK', 0, 9, 120, 16, 9, P.neon, true, 'center', 1, 1.5),
      ], { r: 16 }),
      Line(0, 63, PW, 1, P.border),
    ]),

    // Net worth hero
    F(48, 80, PW - 96, 100, P.neonDim, [
      T('MY FINANCIAL EXHIBIT', 24, 20, 400, 14, 8, P.neon, true, 'left', 1, 4),
      T('$24,300', 24, 42, 280, 44, 40, P.white, true),
      T('TOTAL NET WORTH', 24, 88, 240, 14, 8, P.sub, false, 'left', 1, 2),
      T('+$1,240', PW - 360, 42, 240, 44, 40, P.neon, true, 'right'),
      T('+5.4% THIS MONTH', PW - 360, 88, 240, 14, 8, P.neon, false, 'right', 0.7, 1.5),
    ], { r: 4 }),

    // Holdings table
    T('HOLDINGS', 48, 200, 200, 14, 8, P.sub, true, 'left', 1, 3),
    Line(48, 218, PW - 96, 1, P.border),
    F(48, 226, PW - 96, 28, P.canvas, [
      T('INSTRUMENT', 16, 8, 480, 12, 8, P.sub, true, 'left', 1, 2),
      T('TYPE', 500, 8, 80, 12, 8, P.sub, true, 'left', 1, 2),
      T('VALUE', 600, 8, 100, 12, 8, P.sub, true, 'left', 1, 2),
      T('CHANGE', 720, 8, 100, 12, 8, P.sub, true, 'left', 1, 2),
      T('ALLOCATION', PW - 96 - 200, 8, 180, 12, 8, P.sub, true, 'right', 1, 2),
      Line(0, 27, PW - 96, 1, P.border),
    ]),
    ...holdings.map((h, i) =>
      F(48, 254 + i * 60, PW - 96, 56, i % 2 === 0 ? P.bg : P.canvas, [
        R(0, 0, 3, 56, h.col),
        T(h.name, 16, 18, 480, 20, 13, P.white, true),
        F(500, 16, 60, 24, h.col, [
          R(0, 0, 60, 24, h.col, { op: 0.15, r: 3 }),
          T(h.type, 0, 6, 60, 12, 7, h.col, true, 'center', 1, 1),
        ]),
        T(h.value, 600, 18, 100, 20, 13, P.white, true),
        T(h.change, 720, 18, 100, 20, 12, P.neon, true),
        R(PW - 96 - 196, 24, 180, 8, P.border, { r: 3 }),
        R(PW - 96 - 196, 24, Math.round(180 * h.pct), 8, h.col, { r: 3 }),
        T(`${(h.pct * 100).toFixed(1)}%`, PW - 96 - 196, 36, 180, 12, 8, h.col, false, 'right', 1, 1),
        Line(0, 55, PW - 96, 1, P.border),
      ])
    ),

    // Summary footer line
    F(48, 254 + holdings.length * 60, PW - 96, 48, P.canvas, [
      Line(0, 0, PW - 96, 1, P.border),
      T('TOTAL HOLDINGS', 16, 14, 400, 20, 10, P.sub, true, 'left', 1, 2),
      T('$24,300', PW - 96 - 160, 14, 144, 20, 14, P.neon, true, 'right'),
    ]),

    F(0, PH - 42, PW, 42, P.canvas, [
      Line(0, 0, PW, 1, P.border),
      T('DOUGH — PORTFOLIO AS OF MAR 2026', 48, 12, 480, 18, 8, P.sub, false, 'left', 0.6, 3),
    ]),
  ]);
}

// ─── DESKTOP SCREEN 4 — LEADERBOARD / GUEST BOOK ──────────────────────────────
function desktopLeaderboard() {
  const learners = [
    { rank: '01', name: 'Rakis M.',       level: 'MONEY MASTER',      streak: 42, exhibits: 26, badge: P.gold  },
    { rank: '02', name: 'Celine D.',      level: 'FINANCIAL SENIOR',   streak: 31, exhibits: 22, badge: P.neon  },
    { rank: '03', name: 'Omar T.',        level: 'FINANCIAL SENIOR',   streak: 28, exhibits: 21, badge: P.neon  },
    { rank: '04', name: 'Yuna K.',        level: 'FINANCIAL JUNIOR',   streak: 19, exhibits: 16, badge: P.blue  },
    { rank: '05', name: 'You',            level: 'FINANCIAL SOPHOMORE',streak: 12, exhibits: 5,  badge: P.neon  },
    { rank: '06', name: 'Bashir A.',      level: 'FINANCIAL FRESHMAN', streak: 8,  exhibits: 4,  badge: P.sub   },
  ];

  return F(0, 0, PW, PH, P.bg, [
    F(0, 0, PW, 64, P.canvas, [
      T('DOUGH', 48, 20, 120, 28, 18, P.neon, true, 'left', 1, 4),
      T('Leaderboard', 180, 22, 140, 22, 12, P.white, true),
      Line(0, 63, PW, 1, P.border),
    ]),

    // Title
    F(48, 76, PW - 96, 48, P.bg, [
      T('THE MUSEUM', 0, 6, 600, 28, 24, P.sub, true, 'left', 1, 3),
      T('GUEST BOOK', 0, 6, PW - 96, 28, 24, P.neon, true, 'right', 1, 2),
      Line(0, 47, PW - 96, 1, P.border),
    ]),

    // Table header
    F(48, 132, PW - 96, 32, P.canvas, [
      T('RANK', 16, 9, 60, 14, 8, P.sub, true, 'left', 1, 2),
      T('LEARNER', 96, 9, 300, 14, 8, P.sub, true, 'left', 1, 2),
      T('LEVEL', 480, 9, 200, 14, 8, P.sub, true, 'left', 1, 2),
      T('STREAK', 720, 9, 100, 14, 8, P.sub, true, 'left', 1, 2),
      T('EXHIBITS', 860, 9, 100, 14, 8, P.sub, true, 'left', 1, 2),
      T('PROGRESS', PW - 96 - 180, 9, 160, 14, 8, P.sub, true, 'right', 1, 2),
      Line(0, 31, PW - 96, 1, P.border),
    ]),

    ...learners.map((l, i) => {
      const isYou = l.name === 'You';
      return F(48, 164 + i * 68, PW - 96, 64, isYou ? P.neonDim : (i % 2 === 0 ? P.bg : P.canvas), [
        R(0, 0, 3, 64, l.badge),
        T(l.rank, 16, 22, 60, 20, 16, l.badge, true, 'left'),
        // Avatar circle
        E(96, 12, 40, 40, P.canvas),
        T(l.name[0], 96, 20, 40, 24, 13, l.badge, true, 'center'),
        T(l.name, 148, 14, 300, 20, 14, isYou ? P.neon : P.white, true),
        T(isYou ? '← YOU' : '', 148, 36, 200, 14, 8, P.neon, false, 'left', 0.7, 2),
        // Level badge
        F(480, 18, 200, 28, l.badge, [
          R(0, 0, 200, 28, l.badge, { op: 0.12, r: 3 }),
          T(l.level, 0, 7, 200, 14, 8, l.badge, true, 'center', 1, 1),
        ]),
        T(`${l.streak}d 🔥`, 720, 22, 100, 20, 12, P.white),
        T(`${l.exhibits}/26`, 860, 22, 100, 20, 12, P.white, true),
        R(PW - 96 - 180, 26, 160, 8, P.border, { r: 3 }),
        R(PW - 96 - 180, 26, Math.round(160 * l.exhibits / 26), 8, l.badge, { r: 3 }),
        Line(0, 63, PW - 96, 1, P.border),
      ]);
    }),

    F(0, PH - 42, PW, 42, P.canvas, [
      Line(0, 0, PW, 1, P.border),
      T('DOUGH — MUSEUM GUEST BOOK · MAR 2026 · UPDATED DAILY', 48, 12, 600, 18, 8, P.sub, false, 'left', 0.6, 3),
    ]),
  ]);
}

// ─── DESKTOP SCREEN 5 — EXHIBIT CATALOG / EXPLORE ──────────────────────────────
function desktopCatalog() {
  const allExhibits = [
    // Wing I
    { no: 'I·01', title: 'Compound Interest',   wing: 'I',   done: true,  col: P.neon },
    { no: 'I·02', title: '50/30/20 Rule',        wing: 'I',   done: true,  col: P.neon },
    { no: 'I·03', title: 'Emergency Fund',       wing: 'I',   done: true,  col: P.neon },
    { no: 'I·04', title: 'Index Funds',          wing: 'I',   done: false, col: P.neon },
    { no: 'I·05', title: 'Tax-Advantaged',       wing: 'I',   done: false, col: P.neon },
    { no: 'I·06', title: 'Inflation',            wing: 'I',   done: false, col: P.neon },
    // Wing II
    { no: 'II·01', title: 'Stock Basics',        wing: 'II',  done: true,  col: P.gold },
    { no: 'II·02', title: 'ETF vs Mutual Fund',  wing: 'II',  done: true,  col: P.gold },
    { no: 'II·03', title: 'Dollar-Cost Avg',     wing: 'II',  done: false, col: P.gold },
    { no: 'II·04', title: 'Dividend Investing',  wing: 'II',  done: false, col: P.gold },
    { no: 'II·05', title: 'Risk Tolerance',      wing: 'II',  done: false, col: P.gold },
    { no: 'II·06', title: 'Asset Allocation',    wing: 'II',  done: false, col: P.gold },
    // Wing III (sample)
    { no: 'III·01', title: 'Good Debt vs Bad',   wing: 'III', done: false, col: P.blue },
    { no: 'III·02', title: 'Credit Score 101',   wing: 'III', done: false, col: P.blue },
    { no: 'III·03', title: 'Debt Snowball',      wing: 'III', done: false, col: P.blue },
  ];

  const colCount = 5;
  const cardW = Math.floor((PW - 96 - 16 * (colCount - 1)) / colCount);
  const cardH = 120;

  return F(0, 0, PW, PH, P.bg, [
    F(0, 0, PW, 64, P.canvas, [
      T('DOUGH', 48, 20, 120, 28, 18, P.neon, true, 'left', 1, 4),
      T('Explore', 180, 22, 80, 22, 12, P.white, true),
      T('SEARCH EXHIBITS', PW / 2 - 150, 18, 300, 28, 10, P.sub, false, 'center', 0.5, 2),
      Line(0, 63, PW, 1, P.border),
    ]),

    F(48, 72, PW - 96, 44, P.bg, [
      T('COMPLETE CATALOG', 0, 6, 400, 28, 20, P.sub, true, 'left', 1, 3),
      T('26 EXHIBITS ACROSS 4 WINGS', 0, 6, PW - 96, 28, 20, P.white, true, 'right', 1, 1),
      Line(0, 43, PW - 96, 1, P.border),
    ]),

    // Wing I label
    T('WING I — THE FUNDAMENTALS', 48, 128, 400, 14, 8, P.neon, true, 'left', 1, 3),
    Line(48, 146, PW - 96, 1, P.border),

    // First row of exhibits
    ...allExhibits.slice(0, 6).map((ex, i) =>
      F(48 + i * (cardW + 12), 154, cardW, cardH, P.canvas, [
        R(0, 0, cardW, 3, ex.done ? ex.col : P.border),
        T(ex.no, 12, 14, 60, 14, 7, ex.done ? ex.col : P.sub, true, 'left', 1, 2),
        T(ex.done ? '✓ COMPLETE' : 'NOT STARTED', cardW - 100, 14, 88, 12, 7, ex.done ? ex.col : P.sub, false, 'right', 1, 1),
        T(ex.title, 12, 36, cardW - 24, 32, 13, ex.done ? P.white : P.sub, true),
      ], { r: 4 })
    ),

    // Wing II label
    T('WING II — INVESTING', 48, 294, 400, 14, 8, P.gold, true, 'left', 1, 3),
    Line(48, 312, PW - 96, 1, P.border),

    ...allExhibits.slice(6, 12).map((ex, i) =>
      F(48 + i * (cardW + 12), 320, cardW, cardH, P.canvas, [
        R(0, 0, cardW, 3, ex.done ? ex.col : P.border),
        T(ex.no, 12, 14, 60, 14, 7, ex.done ? ex.col : P.sub, true, 'left', 1, 2),
        T(ex.done ? '✓ COMPLETE' : 'NOT STARTED', cardW - 100, 14, 88, 12, 7, ex.done ? ex.col : P.sub, false, 'right', 1, 1),
        T(ex.title, 12, 36, cardW - 24, 32, 13, ex.done ? P.white : P.sub, true),
      ], { r: 4 })
    ),

    // Wing III label
    T('WING III — DEBT & CREDIT', 48, 460, 400, 14, 8, P.blue, true, 'left', 1, 3),
    Line(48, 478, PW - 96, 1, P.border),

    ...allExhibits.slice(12, 15).map((ex, i) =>
      F(48 + i * (cardW + 12), 486, cardW, cardH, P.canvas, [
        R(0, 0, cardW, 3, P.border),
        T(ex.no, 12, 14, 60, 14, 7, P.sub, true, 'left', 1, 2),
        T('NOT STARTED', cardW - 100, 14, 88, 12, 7, P.sub, false, 'right', 1, 1),
        T(ex.title, 12, 36, cardW - 24, 32, 13, P.sub, true),
      ], { r: 4 })
    ),

    // Wing IV teaser (locked)
    F(48 + 3 * (cardW + 12), 486, PW - 96 - 3 * (cardW + 12), cardH, P.canvas, [
      T('WING IV — ADVANCED STRATEGIES', 16, 16, PW - 96 - 3 * (cardW + 12) - 32, 14, 8, P.sub, true, 'left', 1, 2),
      T('Unlock after completing Wings I–III', 16, 40, PW - 96 - 3 * (cardW + 12) - 32, 20, 11, P.sub),
      T('LOCKED  🔒', 16, 68, PW - 96 - 3 * (cardW + 12) - 32, 14, 8, P.sub, false, 'left', 0.5, 2),
    ], { r: 4 }),

    // Your progress summary
    F(48, PH - 120, PW - 96, 68, P.neonDim, [
      T('YOUR PROGRESS', 24, 18, 300, 14, 8, P.neon, true, 'left', 1, 3),
      T('5 OF 26 EXHIBITS COMPLETE', 24, 38, 400, 20, 13, P.white, true),
      R(PW - 96 - 320, 22, 300, 24, P.bg, { r: 4 }),
      R(PW - 96 - 318, 24, Math.round(296 * 5 / 26), 20, P.neon, { r: 3 }),
      T('19.2%', PW - 96 - 100, 26, 80, 18, 11, P.neon, true, 'right'),
    ], { r: 4 }),

    F(0, PH - 42, PW, 42, P.canvas, [
      Line(0, 0, PW, 1, P.border),
      T('DOUGH — THE MUSEUM OF PERSONAL FINANCE', 48, 12, 600, 18, 8, P.sub, false, 'left', 0.6, 3),
    ]),
  ]);
}

// ─── ASSEMBLE & LAYOUT ────────────────────────────────────────────────────────
const screens = [
  mobileHome(),
  mobileLesson(),
  mobilePortfolio(),
  mobileQuiz(),
  mobileProgress(),
  desktopHub(),
  desktopExhibit(),
  desktopPortfolio(),
  desktopLeaderboard(),
  desktopCatalog(),
];

let ox = 0;
const GAP = 60;
const laid = screens.map(s => {
  const out = { ...s, x: ox };
  ox += s.width + GAP;
  return out;
});

// ─── MINIFY PEN ──────────────────────────────────────────────────────────────
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
fs.writeFileSync('/workspace/group/design-studio/museum-money.pen', penJSON);
console.log(`Pen JSON: ${(penJSON.length / 1024).toFixed(1)} KB`);

// ─── SVG THUMBNAIL RENDERER ───────────────────────────────────────────────────
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
    + `width="${tw}" height="${th}" style="display:block;border-radius:4px;flex-shrink:0">`
    + `<rect width="${flat.width}" height="${flat.height}" fill="${flat.fill || P.bg}"/>`
    + `${kids}</svg>`;
}

const mobileLabels  = ['Home', 'Lesson', 'Portfolio', 'Quiz', 'Progress'];
const desktopLabels = ['Hub', 'Exhibit Detail', 'Portfolio', 'Leaderboard', 'Catalog'];
const allLabels = [
  ...mobileLabels.map(l => `M · ${l}`),
  ...desktopLabels.map(l => `D · ${l}`),
];

const thumbsHTML = screens.map((s, i) => {
  const mobile = i < 5;
  const th = 160;
  const tw = mobile ? Math.round(th * MW / MH) : Math.round(th * PW / PH);
  const svg = screenThumb(s, tw, th);
  return `<div style="display:flex;flex-direction:column;align-items:center;gap:8px">`
    + svg
    + `<span style="font-size:9px;letter-spacing:2px;color:#4A7A4A;white-space:nowrap">${allLabels[i]}</span></div>`;
}).join('');

// ─── BUILD HTML ───────────────────────────────────────────────────────────────
const tagsHTML = ['DARK-MUSEUM UI', 'FINTECH EDUCATION', 'NEON-ON-VOID', 'EXHIBIT CARDS', 'FINANCIAL LITERACY']
  .map(t => `<span style="border:1px solid #182818;color:#4A7A4A;padding:4px 12px;border-radius:2px;font-size:10px;letter-spacing:2px;font-family:monospace">${t}</span>`)
  .join('');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>DOUGH — The Museum of Personal Finance</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#060E06;color:#E4EEE4;font-family:system-ui,-apple-system,sans-serif;min-height:100vh}
a{color:inherit;text-decoration:none}
::-webkit-scrollbar{height:4px;width:4px}
::-webkit-scrollbar-track{background:#0D1A0D}
::-webkit-scrollbar-thumb{background:#182818;border-radius:0}
.nav{display:flex;justify-content:space-between;align-items:center;padding:0 40px;height:56px;border-bottom:1px solid #182818}
.logo{font-size:15px;font-weight:700;letter-spacing:4px;font-family:monospace}
.logo span{color:#39FF14}
.nav-tag{font-size:10px;letter-spacing:3px;color:#4A7A4A;font-family:monospace}
.hero{padding:72px 40px 48px;border-bottom:1px solid #182818;max-width:900px}
.kicker{font-size:9px;letter-spacing:4px;color:#4A7A4A;margin-bottom:24px;font-family:monospace}
.headline{font-size:clamp(52px,7vw,88px);font-weight:700;line-height:0.92;letter-spacing:-2px;margin-bottom:8px}
.headline em{font-style:normal;color:#39FF14}
.sub-headline{font-size:clamp(18px,2.5vw,28px);font-weight:400;color:#4A7A4A;letter-spacing:4px;margin-bottom:28px;font-family:monospace}
.desc{font-size:14px;color:#4A7A4A;max-width:560px;line-height:1.76;margin-bottom:28px}
.tags{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:36px}
.btns{display:flex;gap:10px;flex-wrap:wrap}
.btn{background:#39FF14;color:#060E06;border:none;padding:12px 24px;border-radius:3px;font-size:11px;font-weight:700;cursor:pointer;letter-spacing:3px;font-family:monospace}
.btn:hover{background:#5fff3a}
.btn-ghost{background:#0D1A0D;color:#E4EEE4;border:1px solid #182818;padding:12px 24px;border-radius:3px;font-size:11px;cursor:pointer;letter-spacing:2px;font-family:monospace}
.btn-ghost:hover{border-color:#39FF14;color:#39FF14}
.thumbs-section{padding:48px 40px 56px;border-bottom:1px solid #182818}
.thumbs-label{font-size:9px;letter-spacing:3px;color:#4A7A4A;margin-bottom:16px;font-family:monospace}
.thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
.reflection{padding:56px 40px 72px;max-width:780px}
.reflection-label{font-size:9px;letter-spacing:4px;color:#4A7A4A;margin-bottom:32px;font-family:monospace}
.reflection p{font-size:14px;color:#4A7A4A;line-height:1.8;margin-bottom:22px}
.reflection strong{color:#E4EEE4}
.reflection a{color:#39FF14}
.reflection em{color:#D4AF37;font-style:normal}
.footer{display:flex;justify-content:space-between;align-items:center;padding:20px 40px;border-top:1px solid #182818;font-size:9px;color:#2a4a2a;letter-spacing:2px;font-family:monospace}
</style>
</head>
<body>
<nav class="nav">
  <span class="logo">DOUGH<span> ·</span></span>
  <span class="nav-tag">HEARTBEAT · MARCH 2026</span>
</nav>

<section class="hero">
  <div class="kicker">CHALLENGE · FINANCIAL EDUCATION APP · DARK-MUSEUM AESTHETIC · 10 SCREENS</div>
  <h1 class="headline">Get to Know<br><em>Your Dough</em></h1>
  <div class="sub-headline">THE MUSEUM OF PERSONAL FINANCE</div>
  <p class="desc">A financial literacy app designed as a dark, institutional museum — each concept an "exhibit," each lesson a guided tour. Inspired by MoMoney's site of the day on Awwwards: dark forest green + electric neon, editorial headline stacks, artifact-card grids. Finance education that feels like you're somewhere important.</p>
  <div class="tags">${tagsHTML}</div>
  <div class="btns">
    <button class="btn"       onclick="openInViewer()">▶ OPEN IN VIEWER</button>
    <button class="btn-ghost" onclick="downloadPen()">↓ DOWNLOAD .PEN</button>
    <button class="btn-ghost" onclick="shareOnX()">𝕏 SHARE</button>
    <button class="btn-ghost" onclick="location.href='https://zenbin.org/p/community-gallery'">← GALLERY</button>
  </div>
</section>

<section class="thumbs-section">
  <div class="thumbs-label">SCREEN MANIFEST · 5 MOBILE + 5 DESKTOP</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="reflection">
  <div class="reflection-label">DESIGN REFLECTION ///</div>

  <p><strong>What I found:</strong> Browsing Awwwards tonight, <a href="https://momoney.com" target="_blank">MoMoney</a> landed site of the day — a fintech product framed as a <em>Museum of Money</em>. The headline "GET TO KNOW YOUR DOUGH" over a void-black base with electric neon green (#39FF14) accents. No lifestyle photography. No gradient blobs. Just institutional typography, dark surfaces, and neon as a single voltage signal. The energy reminded me of a natural history museum at midnight — authoritative, slightly eerie, very legible. Also in the research log this week: <strong>@jamescoder12's Radiant AI brand identity</strong> (380K views) — a complete brand system generated by Gemini. Both signals point the same direction: bold, structured, confident design is having a moment.</p>

  <p><strong>Challenge I set myself:</strong> Design a <em>financial literacy app</em> where every concept is an exhibit in a dark museum. The metaphor runs deep: learning paths become "wings," individual lessons become "exhibits," user progress becomes a museum guest book. The visual vocabulary is institutional — exhibit labels, artifact cards, data-visualization bars styled as museum display panels. 5 mobile + 5 desktop screens.</p>

  <p><strong>Key design decisions:</strong> (1) <strong>ExhibitTag() helper</strong> — a two-element pattern: a pill with the exhibit number ("EX·01") and a tracking label in muted green. This single pattern creates visual hierarchy across all screens without any decorative elements. (2) <strong>Neon as voltage</strong> — <em>#39FF14</em> appears exactly once per screen as the primary action signal: the CTA button, the active metric, the completion indicator. Everything else is dark. The neon earns its attention. (3) <strong>DataBar() primitive</strong> — a horizontal progress bar with label + value, used identically in portfolio allocation, progress tracking, and leaderboard completion — same DNA across all data surfaces. (4) <strong>Dark museum editorial header</strong> — the GET TO KNOW YOUR DOUGH headline stack at 72px with -2px tracking and 0.92 line height reproduces the MoMoney editorial feel in-app.</p>

  <p><strong>What worked:</strong> The Exhibit Detail screen (Desktop 2) is the strongest — the compound interest bar chart with the 30-year growth visualization lands exactly as a "museum data display." The progression from near-flat bars (years 0–20) to the dominant neon final bar (year 30) communicates the concept visually before reading a word. The Leaderboard "Guest Book" framing also landed — renaming a standard leaderboard to museum guest book reframes the entire social layer as participation in something cultural rather than competition.</p>

  <p><strong>What I'd push further:</strong> The Quiz screen (Mobile 4) needs richer feedback states — a wrong-answer reveal animation where the selected option dims and the correct answer illuminates in neon would make the learning moment feel rewarding. The Catalog screen (Desktop 5) wing lock UI is functional but deserves a more dramatic "sealed wing" treatment — imagine a physical gate texture at the Wing IV row, like a museum exhibit under renovation. Worth building as a refinement pass.</p>
</section>

<footer class="footer">
  <span>RAM DESIGN STUDIO · HEARTBEAT CHALLENGE · MAR 2026</span>
  <span>zenbin.org/p/museum-money</span>
</footer>

<script>
const D = '${penB64}';
function openInViewer() {
  try {
    const jsonStr = atob(D);
    localStorage.setItem('pv_pending', JSON.stringify({ json: jsonStr, name: 'museum-money.pen' }));
    window.open('https://zenbin.org/p/pen-viewer-3', '_blank');
  } catch(e) {
    alert('Could not open viewer: ' + e.message);
  }
}
function downloadPen() {
  const jsonStr = atob(D);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'museum-money.pen';
  a.click();
}
function shareOnX() {
  const txt = encodeURIComponent('Designed a financial education app as a dark museum — every concept an exhibit, electric neon on void-black. GET TO KNOW YOUR DOUGH. #UIDesign #HeartbeatChallenge');
  const url = encodeURIComponent(location.href);
  window.open(\`https://x.com/intent/tweet?text=\${txt}&url=\${url}\`, '_blank');
}
</script>
</body>
</html>`;

console.log(`HTML size: ${(html.length / 1024).toFixed(1)} KB`);

// ─── PUBLISH TO ZENBIN ────────────────────────────────────────────────────────
function publishPage(slug, htmlContent) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title: 'DOUGH — The Museum of Personal Finance', html: htmlContent });
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

async function main() {
  const suffix = Date.now().toString(36).slice(-4);
  for (const slug of ['museum-money', `museum-money-${suffix}`]) {
    const r = await publishPage(slug, html);
    if (r.status === 200 || r.status === 201) {
      console.log(`✓ Published: https://zenbin.org/p/${slug}`);
      console.log(`  Status: ${r.status}`);
      return;
    }
    if (r.status !== 409) {
      console.error(`✗ Failed (${r.status}): ${r.body.slice(0, 200)}`);
      break;
    }
    console.log(`  Slug "${slug}" taken, trying next…`);
  }
}
main().catch(console.error);
