'use strict';
// gen-ember.js — EMBER: AI-powered podcast discovery and insights companion
//
// Theme: DARK (warm dark amber) — previous entry was Sona (light), so rotating to dark
// Inspired by:
//   • Format Podcasts on darkmodedesign.com — warm dark editorial, amber accent, editorial hierarchy
//   • Neon Postgres glowing vertical bars — luminous amber glow effects on bar charts
//   • "Warm dark" bifurcation of AI product aesthetics — #0D0907 near-black + amber embers
//
// Palette: bg #0D0907, accent #C45E1A amber, text #E8D5C4 warm white
// Screens: Discover · Episode Detail · AI Insights · Listening Stats · Profile

const fs   = require('fs');
const path = require('path');

// ── Palette ─────────────────────────────────────────────────────────────────
const P = {
  bg:        '#0D0907',
  surface:   '#160D08',
  surface2:  '#1E1009',
  surface3:  '#28150C',
  border:    '#2E1A0F',
  border2:   '#3D2416',
  fg:        '#E8D5C4',
  fg2:       '#9A7A65',
  fg3:       '#4A3020',
  amber:     '#C45E1A',
  amberLo:   '#C45E1A18',
  amberMid:  '#C45E1A35',
  amberGlow: '#E8821A',
  gold:      '#F0A030',
  goldLo:    '#F0A03018',
  red:       '#D94040',
  redLo:     '#D9404018',
  teal:      '#3ABFB0',
  tealLo:    '#3ABFB018',
};

let _id = 0;
const uid = () => `em${++_id}`;

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

const Line = (x, y, w, fill = P.border) => F(x, y, w, 1, fill, {});

const Pill = (x, y, text, fill, textFill) => {
  const w = text.length * 6.2 + 18;
  return F(x, y, w, 20, fill, { r: 10, ch: [
    T(text, 9, 3, w - 14, 14, { size: 9, fill: textFill || P.bg, weight: 700, ls: 0.3 }),
  ]});
};

// Glow bar — inspired by Neon Postgres vertical bars
const GlowBar = (x, y, w, h, color, glowColor, pct = 1) => {
  const barH = Math.round(h * pct);
  const barY = h - barH;
  return F(x, y, w, h, 'transparent', { ch: [
    // glow halo
    F(x - 2, barY - 4, w + 4, barH + 8, glowColor, { r: w / 2, opacity: 0.25 }),
    // solid bar
    F(0, barY, w, barH, color, { r: Math.min(4, w / 2) }),
  ]});
};

const StatusBar = () => F(0, 0, 390, 44, 'transparent', { ch: [
  T('9:41', 16, 14, 50, 16, { size: 12, fill: P.fg, weight: 600 }),
  T('▲  ◉  ●●●', 290, 14, 90, 16, { size: 10, fill: P.fg2, align: 'right' }),
]});

const NavBar = (selected) => {
  const tabs = [
    { label: 'Discover', icon: '◎' },
    { label: 'Episode',  icon: '▷' },
    { label: 'Insights', icon: '◈' },
    { label: 'Stats',    icon: '▦' },
    { label: 'Profile',  icon: '○' },
  ];
  const ch = [];
  ch.push(Line(0, 0, 390, P.border));
  tabs.forEach((tab, i) => {
    const ix  = 4 + i * 76;
    const sel = i === selected;
    if (sel) {
      ch.push(F(ix, 0, 76, 3, P.amber, { r: 0 }));
      ch.push(F(ix + 4, 4, 68, 42, P.amberLo, { r: 6 }));
    }
    ch.push(T(tab.icon, ix + 4, 8, 68, 18, {
      size: 16, fill: sel ? P.amber : P.fg3, weight: sel ? 700 : 400, align: 'center',
    }));
    ch.push(T(tab.label, ix + 4, 30, 68, 12, {
      size: 8, fill: sel ? P.amber : P.fg3, weight: sel ? 700 : 400, align: 'center', ls: 0.3,
    }));
  });
  return F(0, 796, 390, 48, P.surface, { ch });
};

// ── Screen 1: Discover ──────────────────────────────────────────────────────
function s1() {
  const ch = [];
  ch.push(F(0, 0, 390, 844, P.bg, {}));
  ch.push(StatusBar());

  // Ambient glow at top
  ch.push(E(100, -60, 200, 160, P.amberGlow, { opacity: 0.06 }));

  // Header
  ch.push(T('EMBER', 20, 54, 100, 20, { size: 13, fill: P.amber, weight: 800, ls: 4 }));
  ch.push(T('DISCOVER', 264, 56, 110, 16, { size: 9, fill: P.fg3, weight: 700, ls: 2, align: 'right' }));

  // Search bar
  ch.push(F(16, 80, 358, 40, P.surface2, { r: 12, stroke: P.border2, ch: [
    T('⌕', 14, 10, 20, 20, { size: 16, fill: P.fg3 }),
    T('Search podcasts, topics, episodes…', 38, 12, 290, 16, { size: 12, fill: P.fg3 }),
  ]}));

  // AI suggestion strip
  ch.push(F(16, 130, 358, 36, P.amberLo, { r: 8, stroke: P.border2, ch: [
    T('◈', 12, 9, 16, 18, { size: 13, fill: P.amber }),
    T('AI for you · 4 new episodes match your taste', 32, 10, 280, 16, { size: 11, fill: P.fg, weight: 500 }),
    T('→', 330, 10, 20, 16, { size: 12, fill: P.amber }),
  ]}));

  // Section: Trending Now
  ch.push(T('TRENDING NOW', 16, 180, 150, 13, { size: 8.5, fill: P.fg3, weight: 700, ls: 2 }));
  ch.push(T('View all →', 295, 180, 80, 13, { size: 9, fill: P.amber, align: 'right' }));

  // Podcast cards row - horizontal
  const trending = [
    { title: 'Hard Fork',        host: 'NYT Tech',         ep: '247', genre: 'Tech',      hot: true  },
    { title: 'Acquired',         host: 'Ben & David',      ep: '184', genre: 'Business',  hot: false },
    { title: 'Lex Fridman',      host: 'Lex Fridman',      ep: '411', genre: 'AI',        hot: true  },
  ];
  trending.forEach((pod, i) => {
    const cx = 16 + i * 122;
    const cardCh = [];
    // Artwork placeholder
    cardCh.push(F(0, 0, 110, 110, P.surface3, { r: 10, stroke: P.border2 }));
    // Genre gradient overlay on artwork
    cardCh.push(F(0, 70, 110, 40, P.amber, { r: 10, opacity: 0.15 }));
    // "HOT" badge
    if (pod.hot) cardCh.push(Pill(6, 6, '● HOT', P.amber, P.bg));
    // Cover icon (abstract circle)
    cardCh.push(E(40, 25, 30, 30, P.amberMid, {}));
    cardCh.push(E(45, 30, 20, 20, P.amber, { opacity: 0.6 }));
    cardCh.push(T(pod.title, 0, 118, 110, 16, { size: 11, fill: P.fg, weight: 700, align: 'left' }));
    cardCh.push(T(pod.host, 0, 135, 110, 13, { size: 9.5, fill: P.fg2, align: 'left' }));
    cardCh.push(T(`Ep. ${pod.ep}`, 0, 150, 60, 13, { size: 9, fill: P.fg3 }));
    const genW = pod.genre.length * 6.2 + 14;
    cardCh.push(F(110 - genW, 150, genW, 16, P.amberLo, { r: 8, ch: [
      T(pod.genre, 7, 2, genW - 8, 12, { size: 8, fill: P.amber, weight: 600 }),
    ]}));
    ch.push(F(cx, 200, 110, 166, 'transparent', { ch: cardCh }));
  });

  // Section: For You (AI-curated)
  ch.push(Line(16, 384, 358));
  ch.push(T('FOR YOU', 16, 396, 100, 13, { size: 8.5, fill: P.amber, weight: 700, ls: 2 }));
  ch.push(F(96, 393, 60, 18, P.amberLo, { r: 9, ch: [
    T('AI PICKS', 9, 3, 50, 12, { size: 8, fill: P.amber, weight: 700, ls: 0.5 }),
  ]}));

  const forYou = [
    { show: 'The Knowledge Project', ep: 'Mental Models #92', dur: '1h 12m', match: '97%' },
    { show: 'Y Combinator',          ep: 'Founder Lessons 2026', dur: '54m',    match: '94%' },
    { show: 'Huberman Lab',          ep: 'Sleep Optimization',  dur: '2h 04m', match: '91%' },
    { show: 'The Tim Ferriss Show',  ep: 'Naval Ravikant',       dur: '3h 11m', match: '89%' },
  ];
  forYou.forEach((ep, i) => {
    const ey = 420 + i * 82;
    ch.push(F(16, ey, 358, 74, P.surface, { r: 10, stroke: P.border, ch: [
      // Artwork dot
      E(18, 17, 40, 40, P.surface3, {}),
      E(23, 22, 30, 30, P.amberMid, { opacity: 0.7 }),
      // Info
      T(ep.show, 70, 11, 200, 14, { size: 11, fill: P.fg2, weight: 500 }),
      T(ep.ep,   70, 28, 200, 16, { size: 13, fill: P.fg,  weight: 700 }),
      T(ep.dur,  70, 50, 80,  12, { size: 10, fill: P.fg3 }),
      // Match badge
      F(290, 11, 52, 20, P.amberLo, { r: 10, ch: [
        T(`◈ ${ep.match}`, 8, 4, 40, 12, { size: 8.5, fill: P.amber, weight: 700 }),
      ]}),
      T('▷', 320, 48, 20, 16, { size: 14, fill: P.amber }),
    ]}));
  });

  ch.push(NavBar(0));
  return F(0, 0, 390, 844, P.bg, { ch });
}

// ── Screen 2: Episode Detail ─────────────────────────────────────────────────
function s2() {
  const ch = [];
  ch.push(F(0, 0, 390, 844, P.bg, {}));
  ch.push(StatusBar());

  // Header
  ch.push(T('← Back', 16, 54, 80, 16, { size: 12, fill: P.fg2, weight: 500 }));
  ch.push(T('EPISODE', 264, 56, 110, 14, { size: 9, fill: P.fg3, weight: 700, ls: 2, align: 'right' }));

  // Large artwork
  ch.push(F(60, 80, 270, 270, P.surface2, { r: 18, stroke: P.border2 }));
  // Artwork ambient glow
  ch.push(E(80, 100, 230, 230, P.amber, { opacity: 0.05 }));
  // Abstract cover art
  ch.push(E(100, 120, 190, 190, P.surface3, {}));
  ch.push(E(130, 150, 130, 130, P.amberMid, { opacity: 0.4 }));
  ch.push(E(160, 180, 70, 70, P.amber, { opacity: 0.7 }));
  ch.push(E(180, 200, 30, 30, P.gold, {}));

  // Show + episode title
  ch.push(T('The Knowledge Project', 16, 368, 358, 16, { size: 12, fill: P.fg2, weight: 500, align: 'center' }));
  ch.push(T('Mental Models That Work', 16, 386, 358, 26, { size: 20, fill: P.fg, weight: 800, align: 'center', ls: -0.5 }));
  ch.push(T('Ep. 92  ·  1h 12m  ·  Sep 14, 2026', 16, 416, 358, 14, { size: 10, fill: P.fg3, align: 'center' }));

  // AI Match + Actions
  ch.push(F(100, 440, 80, 28, P.amberLo, { r: 14, stroke: P.amber + '40', ch: [
    T('◈ 97% match', 12, 7, 66, 14, { size: 9.5, fill: P.amber, weight: 700 }),
  ]}));
  ch.push(F(188, 440, 90, 28, P.surface2, { r: 14, stroke: P.border2, ch: [
    T('♡  Save', 15, 7, 66, 14, { size: 9.5, fill: P.fg2, weight: 600 }),
  ]}));

  // Playback bar
  ch.push(F(16, 480, 358, 64, P.surface, { r: 12, stroke: P.border, ch: [
    // Progress track
    F(16, 10, 326, 4, P.border2, { r: 2, ch: [
      F(0, 0, 210, 4, P.amber, { r: 2 }),
    ]}),
    // Scrubber dot
    E(226, 8, 10, 10, P.amber, {}),
    T('29:14', 16, 24, 60, 14, { size: 10, fill: P.fg2 }),
    T('1:12:34', 302, 24, 56, 14, { size: 10, fill: P.fg2, align: 'right' }),
    // Controls
    T('⏮', 100, 38, 40, 18, { size: 20, fill: P.fg2, align: 'center' }),
    F(162, 36, 36, 22, P.amber, { r: 11, ch: [
      T('▷', 0, 3, 36, 16, { size: 14, fill: P.bg, align: 'center', weight: 700 }),
    ]}),
    T('⏭', 252, 38, 40, 18, { size: 20, fill: P.fg2, align: 'center' }),
    T('1×', 332, 40, 22, 16, { size: 10, fill: P.fg2, weight: 700 }),
  ]}));

  // AI Insights preview
  ch.push(F(16, 556, 358, 84, P.surface2, { r: 12, stroke: P.border2, ch: [
    F(0, 0, 4, 84, P.amber, { r: 2 }),
    T('◈  AI INSIGHTS', 16, 12, 180, 14, { size: 9, fill: P.amber, weight: 700, ls: 1.5 }),
    T('3 key ideas · 2 quotes · 1 action item', 16, 28, 280, 14, { size: 11, fill: P.fg2 }),
    T('"Inversion is the most powerful mental model — ask what you want to avoid, not what you want."', 16, 46, 326, 26, { size: 10.5, fill: P.fg, lh: 1.5 }),
  ]}));

  // Description
  ch.push(T('DESCRIPTION', 16, 652, 180, 13, { size: 8.5, fill: P.fg3, weight: 700, ls: 2 }));
  ch.push(T('Shane Parrish digs into the 12 mental models used by the world\'s sharpest thinkers — from Charlie Munger\'s latticework to inversion, Bayes, and second-order thinking.', 16, 670, 358, 52, { size: 11.5, fill: P.fg2, lh: 1.65 }));

  // Tags
  const tags = ['Mental Models', 'Decision Making', 'Charlie Munger'];
  let tx = 16;
  tags.forEach(tag => {
    const tw = tag.length * 6.5 + 20;
    ch.push(F(tx, 730, tw, 22, P.surface2, { r: 11, stroke: P.border2, ch: [
      T(tag, 10, 4, tw - 14, 14, { size: 9, fill: P.fg2, weight: 500 }),
    ]}));
    tx += tw + 8;
  });

  ch.push(NavBar(1));
  return F(0, 0, 390, 844, P.bg, { ch });
}

// ── Screen 3: AI Insights ────────────────────────────────────────────────────
function s3() {
  const ch = [];
  ch.push(F(0, 0, 390, 844, P.bg, {}));
  ch.push(StatusBar());

  // Ambient glow
  ch.push(E(300, 80, 180, 180, P.amber, { opacity: 0.05 }));

  // Header
  ch.push(T('EMBER', 20, 54, 100, 20, { size: 13, fill: P.amber, weight: 800, ls: 4 }));
  ch.push(T('AI INSIGHTS', 240, 56, 134, 14, { size: 9, fill: P.fg3, weight: 700, ls: 2, align: 'right' }));

  // Context card
  ch.push(F(16, 80, 358, 58, P.surface, { r: 12, stroke: P.border2, ch: [
    E(14, 9, 40, 40, P.surface3, {}),
    E(19, 14, 30, 30, P.amberMid, { opacity: 0.6 }),
    T('Mental Models That Work', 68, 10, 270, 16, { size: 12.5, fill: P.fg, weight: 700 }),
    T('The Knowledge Project  ·  Ep. 92  ·  1h 12m', 68, 30, 270, 13, { size: 10, fill: P.fg2 }),
    T('29:14 in', 68, 44, 100, 13, { size: 9, fill: P.fg3 }),
  ]}));

  // KEY IDEAS
  ch.push(T('KEY IDEAS', 16, 152, 120, 13, { size: 8.5, fill: P.fg3, weight: 700, ls: 2 }));
  ch.push(T('3 extracted', 220, 152, 120, 13, { size: 9, fill: P.amber, align: 'right' }));
  ch.push(Line(16, 170, 358));

  const ideas = [
    {
      num: '01',
      title: 'Inversion thinking',
      desc: 'Identify what leads to failure before planning for success. Avoiding stupid mistakes matters more than being clever.',
      ts: '0:00–8:42',
    },
    {
      num: '02',
      title: 'Second-order consequences',
      desc: 'Every decision has downstream effects. Most people stop at first-order thinking — train yourself to go deeper.',
      ts: '12:15–24:30',
    },
    {
      num: '03',
      title: 'Circle of competence',
      desc: 'Know what you know. Operating outside your circle without recognizing it is the root of most catastrophic errors.',
      ts: '31:00–48:20',
    },
  ];
  ideas.forEach((idea, i) => {
    const iy = 178 + i * 106;
    ch.push(F(16, iy, 358, 98, P.surface, { r: 10, stroke: P.border, ch: [
      F(0, 0, 4, 98, i === 0 ? P.amber : i === 1 ? P.gold : P.teal, { r: 2 }),
      T(idea.num, 14, 12, 30, 18, { size: 14, fill: P.fg3, weight: 800, ls: 1 }),
      T(idea.title, 48, 12, 260, 18, { size: 14, fill: P.fg, weight: 700 }),
      T(idea.desc, 14, 36, 330, 38, { size: 10.5, fill: P.fg2, lh: 1.6 }),
      T(idea.ts, 14, 76, 100, 13, { size: 9, fill: P.fg3 }),
      T('▷ Jump to', 278, 76, 80, 13, { size: 9, fill: P.amber, align: 'right' }),
    ]}));
  });

  // NOTABLE QUOTES
  ch.push(T('NOTABLE QUOTES', 16, 506, 160, 13, { size: 8.5, fill: P.fg3, weight: 700, ls: 2 }));
  ch.push(Line(16, 524, 358));

  ch.push(F(16, 530, 358, 80, P.surface2, { r: 10, stroke: P.border2, ch: [
    T('"', 14, 8, 20, 30, { size: 28, fill: P.amber, weight: 900 }),
    T('Inversion is the most powerful mental model — ask what you want to avoid, not what you want.', 34, 12, 306, 40, { size: 11, fill: P.fg, lh: 1.65 }),
    T('— Shane Parrish, 7:02', 34, 58, 200, 13, { size: 9, fill: P.fg3 }),
  ]}));

  // ACTION ITEM
  ch.push(T('ACTION ITEM', 16, 622, 120, 13, { size: 8.5, fill: P.fg3, weight: 700, ls: 2 }));
  ch.push(Line(16, 640, 358));
  ch.push(F(16, 646, 358, 60, P.amberLo, { r: 10, stroke: P.amber + '30', ch: [
    T('✓', 14, 18, 20, 20, { size: 16, fill: P.amber }),
    T('Write down 3 decisions you regret and apply inversion to each one.', 38, 12, 302, 36, { size: 11.5, fill: P.fg, lh: 1.6 }),
  ]}));

  ch.push(T('RELATED EPISODES', 16, 720, 180, 13, { size: 8.5, fill: P.fg3, weight: 700, ls: 2 }));
  const related = ['Decision Making 101', 'Charlie Munger on Models'];
  related.forEach((ep, i) => {
    ch.push(F(16 + i * 180, 738, 170, 34, P.surface, { r: 8, stroke: P.border, ch: [
      T('▷', 10, 9, 18, 16, { size: 12, fill: P.amber }),
      T(ep, 32, 10, 130, 14, { size: 11, fill: P.fg, weight: 600 }),
    ]}));
  });

  ch.push(NavBar(2));
  return F(0, 0, 390, 844, P.bg, { ch });
}

// ── Screen 4: Listening Stats ────────────────────────────────────────────────
function s4() {
  const ch = [];
  ch.push(F(0, 0, 390, 844, P.bg, {}));
  ch.push(StatusBar());

  ch.push(T('EMBER', 20, 54, 100, 20, { size: 13, fill: P.amber, weight: 800, ls: 4 }));
  ch.push(T('STATS', 280, 56, 94, 14, { size: 9, fill: P.fg3, weight: 700, ls: 2, align: 'right' }));

  // Time range selector
  const ranges = ['7D', '30D', '90D', 'All'];
  let rx = 16;
  ranges.forEach((r, i) => {
    const active = i === 1;
    ch.push(F(rx, 78, 52, 24, active ? P.amber : P.surface, { r: 6, stroke: active ? P.amber : P.border, ch: [
      T(r, 0, 4, 52, 16, { size: 9.5, fill: active ? P.bg : P.fg2, weight: 700, align: 'center' }),
    ]}));
    rx += 60;
  });

  // Big hero stat — listening time
  ch.push(T('LISTENING TIME · 30 DAYS', 16, 116, 240, 13, { size: 8, fill: P.fg3, weight: 700, ls: 1.5 }));
  ch.push(T('48', 16, 134, 120, 72, { size: 66, fill: P.fg, weight: 900, ls: -3 }));
  ch.push(T('hrs', 130, 172, 50, 22, { size: 18, fill: P.fg2, weight: 300 }));
  ch.push(T('+18% vs last month', 16, 206, 200, 14, { size: 10, fill: P.amberGlow }));

  // Metrics grid
  const metrics = [
    { label: 'EPISODES',    val: '37',   sub: '5.6/wk average', color: P.amber },
    { label: 'SHOWS',       val: '12',   sub: '3 new this month', color: P.fg   },
    { label: 'AI INSIGHTS', val: '184',  sub: 'ideas captured',   color: P.gold },
    { label: 'STREAK',      val: '21d',  sub: '🔥 Personal best', color: P.amberGlow },
  ];
  metrics.forEach((m, i) => {
    const mx = 16 + (i % 2) * 184;
    const my = 230 + Math.floor(i / 2) * 88;
    ch.push(F(mx, my, 174, 78, P.surface, { r: 8, stroke: P.border, ch: [
      T(m.label, 12, 10, 150, 11, { size: 7.5, fill: P.fg3, weight: 700, ls: 1.5 }),
      T(m.val,   12, 26, 150, 32, { size: 26, fill: m.color, weight: 800, ls: -0.5 }),
      T(m.sub,   12, 60, 150, 11, { size: 9, fill: P.fg2 }),
    ]}));
  });

  // Weekly chart — glowing bars (Neon Postgres-inspired)
  ch.push(T('WEEKLY LISTENING · HRS', 16, 424, 220, 13, { size: 8, fill: P.fg3, weight: 700, ls: 1.5 }));
  const dayLabels = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const dayVals   = [0.55, 0.80, 0.90, 0.65, 1.0, 0.45, 0.70];
  const dayHrs    = [2.6, 3.8, 4.3, 3.1, 4.8, 2.1, 3.3];
  const BAR_H = 72;
  const BAR_W = 28;
  dayLabels.forEach((d, i) => {
    const bx = 20 + i * 50;
    const v = dayVals[i];
    const bh = Math.round(BAR_H * v);
    const isToday = i === 6;
    const color = isToday ? P.amberGlow : P.amber;
    const glowC = isToday ? P.amberGlow + '60' : P.amber + '40';
    // Glow halo
    ch.push(F(bx - 4, 444 + BAR_H - bh - 4, BAR_W + 8, bh + 8, glowC, { r: BAR_W / 2 + 4, opacity: isToday ? 0.5 : 0.3 }));
    // Bar
    ch.push(F(bx, 444 + BAR_H - bh, BAR_W, bh, color, { r: 4 }));
    // Hrs label
    ch.push(T(`${dayHrs[i]}`, bx - 4, 436 + BAR_H - bh - 16, BAR_W + 8, 13, { size: 8.5, fill: isToday ? P.amberGlow : P.fg2, align: 'center', weight: 700 }));
    // Day label
    ch.push(T(d, bx - 4, 522, BAR_W + 8, 13, { size: 7, fill: isToday ? P.amber : P.fg3, weight: 700, align: 'center' }));
  });
  ch.push(Line(16, 540, 358));

  // Top shows
  ch.push(T('TOP SHOWS', 16, 552, 120, 13, { size: 8.5, fill: P.fg3, weight: 700, ls: 2 }));
  const topShows = [
    { name: 'The Knowledge Project', hrs: 12.4, pct: 100 },
    { name: 'Huberman Lab',          hrs: 8.2,  pct: 66  },
    { name: 'Y Combinator',          hrs: 6.1,  pct: 49  },
    { name: 'Lex Fridman Podcast',   hrs: 5.8,  pct: 47  },
  ];
  topShows.forEach((s, i) => {
    const sy = 572 + i * 48;
    ch.push(T(`${i + 1}`, 16, sy + 8, 18, 18, { size: 11, fill: P.fg3, weight: 700 }));
    ch.push(T(s.name, 36, sy + 6, 220, 16, { size: 12, fill: P.fg, weight: 600 }));
    ch.push(T(`${s.hrs}h`, 36, sy + 24, 80, 13, { size: 9.5, fill: P.fg2 }));
    // Progress bar
    ch.push(F(260, sy + 8, 80, 6, P.border2, { r: 3, ch: [
      F(0, 0, Math.round(80 * s.pct / 100), 6, P.amber, { r: 3 }),
    ]}));
    if (i < topShows.length - 1) ch.push(Line(36, sy + 47, 336));
  });

  ch.push(NavBar(3));
  return F(0, 0, 390, 844, P.bg, { ch });
}

// ── Screen 5: Profile ────────────────────────────────────────────────────────
function s5() {
  const ch = [];
  ch.push(F(0, 0, 390, 844, P.bg, {}));
  ch.push(StatusBar());

  // Ambient glow
  ch.push(E(195, -40, 260, 200, P.amber, { opacity: 0.04 }));

  ch.push(T('EMBER', 20, 54, 100, 20, { size: 13, fill: P.amber, weight: 800, ls: 4 }));
  ch.push(T('PROFILE', 264, 56, 110, 14, { size: 9, fill: P.fg3, weight: 700, ls: 2, align: 'right' }));

  // Avatar + name
  ch.push(E(155, 80, 80, 80, P.surface2, {}));
  ch.push(E(160, 85, 70, 70, P.amberMid, { opacity: 0.5 }));
  ch.push(E(172, 97, 46, 46, P.amber, { opacity: 0.3 }));
  ch.push(T('AK', 179, 110, 32, 24, { size: 18, fill: P.fg, weight: 800, align: 'center' }));

  ch.push(T('Alex Kim', 16, 172, 358, 24, { size: 18, fill: P.fg, weight: 700, align: 'center' }));
  ch.push(T('Curious generalist · Podcast addict since 2018', 16, 198, 358, 14, { size: 11, fill: P.fg2, align: 'center' }));

  // AI taste profile
  ch.push(F(16, 222, 358, 64, P.surface, { r: 12, stroke: P.border, ch: [
    F(0, 0, 4, 64, P.amber, { r: 2 }),
    T('◈  AI TASTE PROFILE', 14, 10, 200, 14, { size: 9, fill: P.amber, weight: 700, ls: 1.5 }),
    T('Deep-dives on mental models, longevity, AI, and indie business. Prefers 45–90 min episodes. Morning listener.', 14, 28, 330, 28, { size: 10.5, fill: P.fg2, lh: 1.6 }),
  ]}));

  // Stats row
  const stats = [
    { val: '48h',  label: 'This month' },
    { val: '37',   label: 'Episodes'   },
    { val: '184',  label: 'Insights'   },
    { val: '21d',  label: 'Streak'     },
  ];
  stats.forEach((s, i) => {
    const sx = 16 + i * 90;
    ch.push(F(sx, 296, 82, 58, P.surface, { r: 8, stroke: P.border, ch: [
      T(s.val, 0, 10, 82, 24, { size: 20, fill: P.amber, weight: 800, align: 'center', ls: -0.5 }),
      T(s.label, 0, 38, 82, 14, { size: 9, fill: P.fg3, align: 'center' }),
    ]}));
  });

  // Genre radar (simplified visual)
  ch.push(T('LISTENING GENRES', 16, 368, 180, 13, { size: 8.5, fill: P.fg3, weight: 700, ls: 2 }));
  ch.push(Line(16, 386, 358));
  const genres = [
    { name: 'Business & Startups', pct: 34 },
    { name: 'Science & Health',    pct: 28 },
    { name: 'Technology & AI',     pct: 22 },
    { name: 'Philosophy & Ideas',  pct: 11 },
    { name: 'News & Politics',     pct: 5  },
  ];
  genres.forEach((g, i) => {
    const gy = 394 + i * 44;
    ch.push(T(g.name, 16, gy + 3, 190, 14, { size: 12, fill: P.fg, weight: 500 }));
    ch.push(T(`${g.pct}%`, 342, gy + 3, 32, 14, { size: 11, fill: P.amber, weight: 700, align: 'right' }));
    ch.push(F(16, gy + 22, 358, 6, P.border2, { r: 3, ch: [
      F(0, 0, Math.round(358 * g.pct / 100), 6, g.pct > 20 ? P.amber : P.amberMid, { r: 3 }),
    ]}));
  });

  // Settings list
  ch.push(T('PREFERENCES', 16, 624, 180, 13, { size: 8.5, fill: P.fg3, weight: 700, ls: 2 }));
  ch.push(Line(16, 642, 358));
  const prefs = [
    { label: 'AI Insights',        val: 'Enabled' },
    { label: 'Auto-next episode',  val: 'On'      },
    { label: 'Download quality',   val: 'High'    },
    { label: 'Listening reminders',val: '8:00 AM' },
  ];
  prefs.forEach((pref, i) => {
    const py = 648 + i * 36;
    ch.push(T(pref.label, 16, py + 8, 200, 14, { size: 12, fill: P.fg, weight: 500 }));
    ch.push(T(pref.val, 0, py + 8, 374, 14, { size: 11, fill: P.amber, weight: 600, align: 'right' }));
    if (i < prefs.length - 1) ch.push(Line(16, py + 35, 358));
  });

  ch.push(NavBar(4));
  return F(0, 0, 390, 844, P.bg, { ch });
}

// ── Assemble .pen ─────────────────────────────────────────────────────────────
const doc = {
  version: '2.8',
  width: 390, height: 844,
  background: P.bg,
  children: [s1(), s2(), s3(), s4(), s5()],
};

const OUT = path.join(__dirname, 'ember.pen');
fs.writeFileSync(OUT, JSON.stringify(doc, null, 2));
console.log('✓ ember.pen written —', fs.statSync(OUT).size, 'bytes');
