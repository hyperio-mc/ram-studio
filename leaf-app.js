#!/usr/bin/env node
// Leaf — reading companion app
// Inspired by: minimal.gallery "Litbix (for book lovers)" + KOMETA Typefaces editorial typography trend
// + land-book editorial-forward landing pages
// Light theme: warm parchment tones, ink typography, serif editorial aesthetic

const fs = require('fs');
const path = require('path');

const SLUG = 'leaf';
const APP_NAME = 'Leaf';
const TAGLINE = 'Your reading life, beautifully kept';

const C = {
  bg:         '#F6F1E9',
  bgDeep:     '#EDE6D9',
  surface:    '#FDFAF5',
  surfaceAlt: '#F0EAE0',
  text:       '#1C1410',
  textMid:    '#5C4A38',
  textMuted:  '#9C8878',
  accent:     '#C4562A',
  accentSoft: '#EDD9CF',
  gold:       '#B8922A',
  green:      '#4A7C59',
  border:     '#D8CFBF',
  tag:        '#E8E0D4',
};

const SF = '"Playfair Display", Georgia, serif';
const SS = '"Inter", system-ui, sans-serif';

// ─── PEN STRUCTURE ────────────────────────────────────────────────────────────

function rect(x, y, w, h, fill, opts={}) {
  return { type:'rect', x, y, w, h, fill, rx: opts.rx||0,
    stroke: opts.stroke||null, strokeWidth: opts.sw||0,
    shadow: opts.shadow||null };
}
function text(x, y, content, font, fill, anchor='start') {
  return { type:'text', x, y, text: content, font, fill, anchor };
}
function pill(x, y, w, h, fill, label, font, labelFill) {
  return [
    rect(x, y, w, h, fill, { rx: Math.floor(h/2) }),
    text(x + w/2, y + h/2 + 5, label, font, labelFill, 'middle'),
  ];
}

const screens = [

  // ── SCREEN 1: MY SHELF ───────────────────────────────────────────────────────
  (() => {
    const els = [];

    // BG
    els.push(rect(0, 0, 390, 770, C.bg));

    // STATUS BAR
    els.push(text(24, 36, '9:41', `600 15px ${SS}`, C.text));
    els.push(text(366, 36, '●●●', `600 11px ${SS}`, C.text, 'end'));

    // DIVIDER
    els.push(rect(0, 52, 390, 1, C.border));

    // HEADER
    els.push(text(24, 90, 'Leaf', `700 30px ${SF}`, C.text));
    els.push(text(24, 110, 'Monday, 30 March', `300 13px ${SS}`, C.textMuted));
    // search bar
    els.push(rect(24, 124, 296, 40, C.surface, { rx:8, stroke:C.border, sw:1 }));
    els.push(text(50, 149, 'Search your library…', `400 14px ${SS}`, C.textMuted));
    els.push(text(38, 149, '⌕', `500 17px ${SS}`, C.textMuted));
    els.push(rect(330, 124, 36, 40, C.surface, { rx:8, stroke:C.border, sw:1 }));
    els.push(text(348, 149, '⊞', `500 17px ${SS}`, C.textMuted, 'middle'));

    // CURRENTLY READING
    els.push(text(24, 192, 'CURRENTLY READING', `600 10px ${SS}`, C.textMuted));

    // active book card
    els.push(rect(24, 206, 342, 120, C.surface, { rx:12, shadow:'0 2px 16px rgba(28,20,16,0.09)' }));
    els.push(rect(24, 206, 5, 120, C.accent, { rx:4 }));
    // cover
    els.push(rect(40, 218, 62, 96, C.accentSoft, { rx:6 }));
    els.push(text(71, 274, '📖', `26px ${SS}`, C.accent, 'middle'));
    // details
    els.push(text(118, 234, 'The Midnight Library', `italic 600 15px ${SF}`, C.text));
    els.push(text(118, 252, 'Matt Haig · 2020', `400 12px ${SS}`, C.textMid));
    // progress bar
    els.push(text(118, 280, 'Page 247 of 304', `400 11px ${SS}`, C.textMuted));
    els.push(rect(118, 288, 224, 4, C.tag, { rx:2 }));
    els.push(rect(118, 288, Math.round(224 * 0.81), 4, C.accent, { rx:2 }));
    els.push(text(118, 313, '~1h 20m left', `500 11px ${SS}`, C.green));
    els.push(text(340, 313, '81%', `700 12px ${SS}`, C.accent, 'end'));

    // UP NEXT
    els.push(text(24, 356, 'UP NEXT', `600 10px ${SS}`, C.textMuted));
    els.push(text(366, 356, 'See all', `400 12px ${SS}`, C.accent, 'end'));

    // 3 book covers
    const books = [
      { bg:'#D4E8D4', icon:'🌿', title:'Piranesi', author:'Clarke' },
      { bg:'#D4D8E8', icon:'🔮', title:'Klara & Sun', author:'Ishiguro' },
      { bg:'#EBE4CF', icon:'🏛️', title:'Hamnet', author:"O'Farrell" },
    ];
    books.forEach((b, i) => {
      const bx = 24 + i * 116;
      els.push(rect(bx, 370, 104, 150, b.bg, { rx:8 }));
      els.push(text(bx + 52, 450, b.icon, `30px ${SS}`, '#000', 'middle'));
      els.push(text(bx + 52, 530, b.title, `italic 500 11px ${SF}`, C.text, 'middle'));
      els.push(text(bx + 52, 544, b.author, `400 10px ${SS}`, C.textMuted, 'middle'));
    });
    // add slot
    els.push(rect(372, 370, 0, 0, 'transparent')); // placeholder spacer

    // WEEK STATS
    els.push(rect(0, 566, 390, 1, C.border));
    els.push(text(24, 594, 'THIS WEEK', `600 10px ${SS}`, C.textMuted));

    const stats = [
      { v:'3h 20m', l:'Reading Time' },
      { v:'94', l:'Pages Read' },
      { v:'6-day 🔥', l:'Streak' },
    ];
    stats.forEach((s, i) => {
      const sx = 24 + i * 118;
      els.push(rect(sx, 606, 108, 50, C.surface, { rx:10, stroke:C.border, sw:1 }));
      els.push(text(sx + 54, 627, s.v, `700 14px ${SS}`, i===2?C.accent:C.text, 'middle'));
      els.push(text(sx + 54, 644, s.l, `400 10px ${SS}`, C.textMuted, 'middle'));
    });

    // BOTTOM NAV
    els.push(rect(0, 686, 390, 84, C.surface, { stroke:C.border, sw:1 }));
    const nav = [
      {x:49,  icon:'📚', label:'Shelf',    active:true},
      {x:131, icon:'🔖', label:'Quotes',   active:false},
      {x:213, icon:'📊', label:'Stats',    active:false},
      {x:295, icon:'🔍', label:'Discover', active:false},
      {x:366, icon:'👤', label:'Profile',  active:false},
    ];
    nav.forEach(n => {
      els.push(text(n.x, 713, n.icon, `22px ${SS}`, n.active?C.accent:C.textMuted, 'middle'));
      els.push(text(n.x, 728, n.label, `${n.active?'600':'400'} 10px ${SS}`, n.active?C.accent:C.textMuted, 'middle'));
    });

    return { id:'shelf', label:'My Shelf', bg:C.bg, elements: els };
  })(),

  // ── SCREEN 2: BOOK DETAIL ────────────────────────────────────────────────────
  (() => {
    const els = [];
    els.push(rect(0, 0, 390, 770, C.bgDeep));

    // hero area
    els.push(rect(0, 0, 390, 270, C.accentSoft));
    els.push(text(24, 68, '←', `400 22px ${SS}`, C.textMid));
    els.push(text(366, 68, '⋯', `400 22px ${SS}`, C.textMid, 'end'));

    // book cover
    els.push(rect(140, 76, 110, 162, C.accent, { rx:8, shadow:'0 8px 28px rgba(196,86,42,0.3)' }));
    els.push(text(195, 162, '📖', `38px ${SS}`, 'rgba(255,255,255,0.85)', 'middle'));

    // title
    els.push(text(195, 298, 'The Midnight Library', `italic 700 21px ${SF}`, C.text, 'middle'));
    els.push(text(195, 318, 'Matt Haig  ·  2020', `400 13px ${SS}`, C.textMuted, 'middle'));

    // stars
    els.push(text(195, 346, '★ ★ ★ ★ ☆', `500 17px ${SS}`, C.gold, 'middle'));
    els.push(text(195, 364, 'Your rating: 4.0', `400 11px ${SS}`, C.textMuted, 'middle'));

    // genre tags
    const genres = ['Fiction','Fantasy','Literary'];
    let tx = 195 - 120;
    genres.forEach(g => {
      const w = g.length * 8 + 20;
      els.push(...pill(tx, 378, w, 26, g==='Literary'?C.accentSoft:C.tag, g, `500 12px ${SS}`, g==='Literary'?C.accent:C.textMid));
      tx += w + 8;
    });

    // progress card
    els.push(rect(24, 422, 342, 80, C.surface, { rx:12 }));
    els.push(text(40, 446, 'READING PROGRESS', `600 10px ${SS}`, C.textMuted));
    els.push(text(350, 446, '81%', `700 15px ${SS}`, C.accent, 'end'));
    els.push(rect(40, 455, 310, 6, C.tag, { rx:3 }));
    els.push(rect(40, 455, Math.round(310*0.81), 6, C.accent, { rx:3 }));
    els.push(text(40, 486, 'Page 247 of 304', `400 13px ${SS}`, C.textMid));
    els.push(text(350, 486, '~1h 20m left', `500 13px ${SS}`, C.green, 'end'));

    // CTA
    els.push(rect(24, 518, 342, 52, C.accent, { rx:10 }));
    els.push(text(195, 549, 'Continue Reading', `600 16px ${SS}`, C.surface, 'middle'));

    // quotes strip
    els.push(text(24, 594, 'SAVED QUOTES', `600 10px ${SS}`, C.textMuted));
    els.push(text(366, 594, '12', `600 12px ${SS}`, C.accent, 'end'));

    // quote card
    els.push(rect(24, 608, 342, 82, C.surface, { rx:10, stroke:C.border, sw:1 }));
    els.push(rect(24, 608, 4, 82, C.gold, { rx:3 }));
    els.push(text(42, 630, '"Between life and death there is a library,', `italic 400 12px ${SF}`, C.text));
    els.push(text(42, 647, 'and within that library, the shelves go on forever."', `italic 400 12px ${SF}`, C.text));
    els.push(text(42, 674, 'p. 1  ·  📌 pinned', `400 11px ${SS}`, C.textMuted));
    els.push(text(350, 674, '🔖', `13px ${SS}`, C.gold, 'end'));

    // nav
    els.push(rect(0, 686, 390, 84, C.surface, { stroke:C.border, sw:1 }));
    [
      {x:49,  icon:'📚', label:'Shelf',    active:true},
      {x:131, icon:'🔖', label:'Quotes',   active:false},
      {x:213, icon:'📊', label:'Stats',    active:false},
      {x:295, icon:'🔍', label:'Discover', active:false},
      {x:366, icon:'👤', label:'Profile',  active:false},
    ].forEach(n => {
      els.push(text(n.x, 713, n.icon, `22px ${SS}`, n.active?C.accent:C.textMuted, 'middle'));
      els.push(text(n.x, 728, n.label, `${n.active?'600':'400'} 10px ${SS}`, n.active?C.accent:C.textMuted, 'middle'));
    });

    return { id:'book-detail', label:'Book Detail', bg:C.bgDeep, elements:els };
  })(),

  // ── SCREEN 3: READING SESSION ─────────────────────────────────────────────────
  (() => {
    const els = [];
    els.push(rect(0, 0, 390, 770, '#FEFCF8'));

    // top bar
    els.push(rect(0, 0, 390, 56, '#FEFCF8', { stroke:C.border, sw:1 }));
    els.push(text(24, 35, '✕', `400 18px ${SS}`, C.textMuted));
    els.push(text(195, 36, '⏱  24:18', `600 16px ${SS}`, C.text, 'middle'));
    els.push(text(366, 35, '…', `400 20px ${SS}`, C.textMuted, 'end'));

    // goal pill
    els.push(...pill(140, 64, 110, 28, C.accentSoft, 'Goal: 45 min', `500 12px ${SS}`, C.accent));

    // chapter info
    els.push(text(24, 122, 'CHAPTER 14', `600 10px ${SS}`, C.textMuted));
    els.push(text(366, 122, 'p. 247', `400 11px ${SS}`, C.textMuted, 'end'));

    // chapter title
    els.push(text(24, 155, 'The Book of', `italic 700 28px ${SF}`, C.text));
    els.push(text(24, 185, 'Regrets', `italic 700 28px ${SF}`, C.accent));
    els.push(rect(24, 200, 48, 2, C.accent, { rx:1 }));

    // body text lines
    const lineWidths = [342,310,342,270,342,295,342,342,260,342,320,342,280,342,180];
    lineWidths.forEach((w, i) => {
      const isHighlighted = i === 7 || i === 8;
      els.push(rect(24, 220 + i * 22, w, 9, isHighlighted ? 'rgba(196,86,42,0.15)' : C.bgDeep, { rx:3 }));
    });
    // highlighted bar indicator
    els.push(rect(24, 374, 2, 44, C.accent));

    // reading controls
    els.push(rect(0, 630, 390, 140, '#FEFCF8', { stroke:C.border, sw:1 }));
    // progress scrubber
    els.push(rect(24, 646, 342, 3, C.tag, { rx:1 }));
    els.push(rect(24, 646, Math.round(342*0.81), 3, C.accent, { rx:1 }));
    els.push(rect(24+Math.round(342*0.81)-5, 641, 11, 11, C.accent, { rx:5 }));
    // page nav
    els.push(text(24, 669, '‹ Prev', `400 13px ${SS}`, C.textMuted));
    els.push(text(195, 669, '247 / 304', `500 13px ${SS}`, C.textMid, 'middle'));
    els.push(text(366, 669, 'Next ›', `400 13px ${SS}`, C.accent, 'end'));
    // action buttons
    const btns = ['🔖','Aa','✏️'];
    btns.forEach((b, i) => {
      els.push(rect(24 + i*76, 682, 66, 38, C.tag, { rx:8 }));
      els.push(text(57 + i*76, 705, b, `${i===1?'600 ':' '}${i===1?15:17}px ${SS}`, C.textMid, 'middle'));
    });
    els.push(rect(258, 682, 108, 38, C.accent, { rx:8 }));
    els.push(text(312, 705, 'Pause', `600 14px ${SS}`, C.surface, 'middle'));

    return { id:'reading-session', label:'Reading Session', bg:'#FEFCF8', elements:els };
  })(),

  // ── SCREEN 4: QUOTES JOURNAL ─────────────────────────────────────────────────
  (() => {
    const els = [];
    els.push(rect(0, 0, 390, 770, C.bg));

    // status
    els.push(text(24, 36, '9:41', `600 15px ${SS}`, C.text));
    els.push(text(366, 36, '●●●', `600 11px ${SS}`, C.text, 'end'));
    els.push(rect(0, 52, 390, 1, C.border));

    // header
    els.push(text(195, 90, 'Quotes Journal', `700 22px ${SF}`, C.text, 'middle'));
    els.push(text(195, 108, '47 saved passages', `400 12px ${SS}`, C.textMuted, 'middle'));

    // filter pills
    const filters = [{l:'All',active:true},{l:'Pinned',active:false},{l:'Fiction',active:false},{l:'Non-Fiction',active:false}];
    let fx = 24;
    filters.forEach(f => {
      const w = f.l.length * 9 + 22;
      els.push(...pill(fx, 122, w, 30, f.active?C.accent:C.surface, f.l, `500 13px ${SS}`, f.active?C.surface:C.textMid));
      if (!f.active) {
        // border effect (approximate with a slightly darker rect behind)
      }
      fx += w + 8;
    });

    // quote cards
    const quotes = [
      {
        text1: '"Between life and death there is a library,',
        text2: 'and within that library, the shelves go on forever."',
        src: 'The Midnight Library  ·  p.1',
        barColor: C.accent, h: 108, pinned: true, topAccent: true
      },
      {
        text1: '"Every book was once a heartbeat waiting',
        text2: 'to be found by the right reader."',
        src: 'Piranesi  ·  p.42',
        barColor: C.gold, h: 92, pinned: false
      },
      {
        text1: '"She was not lost. She was exploring',
        text2: 'the map of herself."',
        src: 'Klara and the Sun  ·  p.88',
        barColor: C.green, h: 92, pinned: false, liked: true
      },
      {
        text1: '"The past is not behind us — it is the very',
        text2: 'ground beneath our feet."',
        src: 'Hamnet  ·  p.156',
        barColor: C.textMuted, h: 80, pinned: false
      },
    ];
    let qy = 166;
    quotes.forEach(q => {
      els.push(rect(24, qy, 342, q.h, C.surface, { rx:12, stroke:C.border, sw:1 }));
      if (q.topAccent) els.push(rect(24, qy, 342, 4, q.barColor, { rx:4 }));
      else els.push(rect(24, qy, 3, q.h, q.barColor, { rx:3 }));
      const textOffset = q.topAccent ? 22 : 8;
      els.push(text(42, qy + textOffset + 10, q.text1, `italic 400 13px ${SF}`, C.text));
      els.push(text(42, qy + textOffset + 26, q.text2, `italic 400 13px ${SF}`, C.text));
      els.push(text(42, qy + q.h - 18, q.src, `400 11px ${SS}`, C.textMuted));
      if (q.pinned) els.push(text(350, qy + q.h - 18, '📌', `13px ${SS}`, C.gold, 'end'));
      if (q.liked)  els.push(text(350, qy + q.h - 18, '♥', `15px ${SS}`, C.accent, 'end'));
      qy += q.h + 10;
    });

    // nav
    els.push(rect(0, 686, 390, 84, C.surface, { stroke:C.border, sw:1 }));
    [
      {x:49,  icon:'📚', label:'Shelf',    active:false},
      {x:131, icon:'🔖', label:'Quotes',   active:true},
      {x:213, icon:'📊', label:'Stats',    active:false},
      {x:295, icon:'🔍', label:'Discover', active:false},
      {x:366, icon:'👤', label:'Profile',  active:false},
    ].forEach(n => {
      els.push(text(n.x, 713, n.icon, `22px ${SS}`, n.active?C.accent:C.textMuted, 'middle'));
      els.push(text(n.x, 728, n.label, `${n.active?'600':'400'} 10px ${SS}`, n.active?C.accent:C.textMuted, 'middle'));
    });

    return { id:'quotes', label:'Quotes', bg:C.bg, elements:els };
  })(),

  // ── SCREEN 5: READING STATS ───────────────────────────────────────────────────
  (() => {
    const els = [];
    els.push(rect(0, 0, 390, 770, C.bg));

    els.push(text(24, 36, '9:41', `600 15px ${SS}`, C.text));
    els.push(text(366, 36, '●●●', `600 11px ${SS}`, C.text, 'end'));
    els.push(rect(0, 52, 390, 1, C.border));

    els.push(text(24, 90, 'Reading Stats', `700 26px ${SF}`, C.text));

    // year toggle
    els.push(rect(24, 106, 120, 30, C.surface, { rx:15, stroke:C.border, sw:1 }));
    els.push(rect(24, 106, 60, 30, C.text, { rx:15 }));
    els.push(text(54, 126, '2025', `600 12px ${SS}`, C.surface, 'middle'));
    els.push(text(114, 126, 'All', `400 12px ${SS}`, C.textMuted, 'middle'));

    // big numbers row
    els.push(text(24, 186, '23', `700 64px ${SF}`, C.text));
    els.push(text(24, 210, 'books this year', `400 13px ${SS}`, C.textMuted));
    els.push(text(280, 178, '7,840', `700 42px ${SF}`, C.accent, 'middle'));
    els.push(text(280, 200, 'pages', `400 13px ${SS}`, C.textMuted, 'middle'));

    // bar chart
    els.push(text(24, 240, 'BOOKS PER MONTH', `600 10px ${SS}`, C.textMuted));
    const barH = [40,30,60,20,50,70,40,85,55,60,70,78];
    const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];
    barH.forEach((h, i) => {
      const bx = 24 + i * 29;
      const isCurrent = i === 2;
      els.push(rect(bx, 362 - h, 20, h, isCurrent ? C.accent : C.tag, { rx:3 }));
      els.push(text(bx + 10, 376, months[i], `400 9px ${SS}`, C.textMuted, 'middle'));
    });

    // streak
    els.push(text(24, 404, 'STREAK', `600 10px ${SS}`, C.textMuted));
    els.push(text(366, 404, '6 days 🔥', `700 13px ${SS}`, C.accent, 'end'));
    const days = ['M','T','W','T','F','S','S'];
    days.forEach((d, i) => {
      const isActive = i < 6;
      els.push(rect(24 + i*52, 418, 44, 44, isActive ? C.accent : C.tag, { rx:8 }));
      els.push(text(46 + i*52, 444, d, `600 14px ${SS}`, isActive ? C.surface : C.textMuted, 'middle'));
    });

    // genre breakdown
    els.push(text(24, 490, 'GENRES', `600 10px ${SS}`, C.textMuted));
    els.push(rect(24, 504, 342, 116, C.surface, { rx:12, stroke:C.border, sw:1 }));
    const genres = [
      { label:'Literary Fiction', pct:45, color:C.accent },
      { label:'Non-Fiction',      pct:28, color:C.gold },
      { label:'Sci-Fi / Fantasy', pct:18, color:C.green },
      { label:'Other',            pct: 9, color:C.textMuted },
    ];
    genres.forEach(({ label, pct, color }, i) => {
      const gy = 520 + i * 24;
      els.push(text(40, gy + 9, label, `400 12px ${SS}`, C.textMid));
      els.push(rect(178, gy, 140, 10, C.tag, { rx:5 }));
      els.push(rect(178, gy, Math.round(140 * pct / 100), 10, color, { rx:5 }));
      els.push(text(326, gy + 9, `${pct}%`, `600 11px ${SS}`, C.textMid, 'end'));
    });

    // nav
    els.push(rect(0, 686, 390, 84, C.surface, { stroke:C.border, sw:1 }));
    [
      {x:49,  icon:'📚', label:'Shelf',    active:false},
      {x:131, icon:'🔖', label:'Quotes',   active:false},
      {x:213, icon:'📊', label:'Stats',    active:true},
      {x:295, icon:'🔍', label:'Discover', active:false},
      {x:366, icon:'👤', label:'Profile',  active:false},
    ].forEach(n => {
      els.push(text(n.x, 713, n.icon, `22px ${SS}`, n.active?C.accent:C.textMuted, 'middle'));
      els.push(text(n.x, 728, n.label, `${n.active?'600':'400'} 10px ${SS}`, n.active?C.accent:C.textMuted, 'middle'));
    });

    return { id:'stats', label:'Reading Stats', bg:C.bg, elements:els };
  })(),
];

// ─── WRITE .pen ───────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  meta: {
    name: APP_NAME,
    tagline: TAGLINE,
    slug: SLUG,
    archetype: 'reading-companion',
    theme: 'light',
    palette: {
      bg:      C.bg,
      surface: C.surface,
      text:    C.text,
      accent:  C.accent,
      accent2: C.gold,
      muted:   'rgba(156,136,120,0.5)',
    },
    fontImport: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap',
    createdAt: new Date().toISOString(),
  },
  screens: screens.map(s => ({
    id: s.id,
    label: s.label,
    width: 390,
    height: 770,
    bg: s.bg,
    elements: s.elements.flat(Infinity),
  })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ ${SLUG}.pen written — ${screens.length} screens`);
console.log(`  → ${outPath}`);
