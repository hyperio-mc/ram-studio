'use strict';
// halo-app.js
// HALO — Podcast Growth Intelligence
//
// Challenge: Design a podcast analytics SaaS with a warm editorial magazine
// aesthetic — directly inspired by:
//
// 1. Format Podcasts (darkmodedesign.com) — "Personalized customer insights in
//    weekly podcasts." Deep amber background, warm-lit photography, editorial
//    serif display text, dual pill CTAs. Warm terracotta/amber proves this palette
//    works for data-heavy tools, not just branding.
//
// 2. Land-book gallery UI itself (land-book.com) — the filter pill bar, minimal
//    chrome, content-first grid. Adopted as the "Episodes" tab's layout pattern.
//
// 3. V7 Go (land-book.com) — "AI Agent Platform for Finance, Legal & Insurance"
//    peach/coral gradient hero treatment — influenced the warm gradient cards.
//
// New patterns tried:
//   · Waveform visualization as a data element (rectangles of varied heights)
//   · Editorial "chapter card" layout with time anchors
//   · Revenue/CPM table in magazine-column style (not sterile grid)
//
// LIGHT theme (zero was dark, aurum already used the warm/light slot — but aurum
// was from 2 runs ago, so light is correct for today)
//
// Palette: warm off-white + terracotta amber + forest green accent
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

const P = {
  bg:        '#FBF7F0',  // warm off-white
  surface:   '#FFFFFF',  // pure white card
  surface2:  '#F5EFE5',  // warm ivory
  surface3:  '#EDE4D6',  // deeper warm
  border:    '#E0D5C4',  // warm border
  muted:     '#B09878',  // warm mid muted
  text:      '#1A1410',  // rich near-black
  sub:       '#5E4830',  // warm brown sub-text
  accent:    '#B5622A',  // terracotta amber (Format Podcasts homage)
  accent2:   '#E8924A',  // lighter amber glow
  highlight: '#F4E3D0',  // soft amber highlight
  green:     '#2D7A56',  // forest green (positive / growth)
  red:       '#8B3A2A',  // terracotta red (decline)
  wave:      '#D4895A',  // waveform color (warm mid-amber)
};

let _id = 0;
const uid = () => `h${++_id}`;

const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill || P.bg,
  clip: opts.clip !== undefined ? opts.clip : false,
  ...(opts.r !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.ch || [],
});

const T = (content, x, y, w, h, opts = {}) => ({
  id: uid(), type: 'text', content, x, y, width: w, height: h,
  textGrowth: 'fixed-width-height',
  fontSize: opts.size || 13,
  fontWeight: String(opts.weight || 400),
  fill: opts.fill || P.text,
  textAlign: opts.align || 'left',
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh !== undefined ? { lineHeight: opts.lh } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  ...(opts.italic ? { italic: true } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.ch || [],
});

const Line = (x, y, w, fill = P.border) => F(x, y, w, 1, fill, {});
const Rule = (x, y, h, color = P.accent) => F(x, y, 4, h, color, {});
const Pill = (x, y, w, h, fill, r = 99, opts = {}) => F(x, y, w, h, fill, { r, ...opts });

// ── Waveform ──────────────────────────────────────────────────────────────────
// Represents audio waveform as varied-height bars
const Waveform = (x, y, w, h, color, progress = 0.38) => {
  const seed = [0.3,0.6,0.9,0.5,0.7,0.4,0.8,0.6,0.95,0.5,0.3,0.7,1.0,0.6,0.4,
                0.8,0.5,0.9,0.7,0.3,0.6,0.8,0.4,0.7,0.95,0.5,0.6,0.3,0.8,0.4,
                0.9,0.7,0.5,0.6,0.8,0.4,0.3,0.9,0.7,0.5,0.6,0.4,0.8,0.3,0.7];
  const barW = 6, gap = 3, total = Math.floor(w / (barW + gap));
  const bars = [];
  const cutoff = Math.floor(total * progress);
  for (let i = 0; i < total; i++) {
    const bh = Math.max(4, Math.round(seed[i % seed.length] * h));
    const by = Math.round((h - bh) / 2);
    const col = i < cutoff ? color : P.surface3;
    bars.push(F(x + i * (barW + gap), y + by, barW, bh, col, { r: 2 }));
  }
  // Playhead
  bars.push(F(x + cutoff * (barW + gap) - 1, y, 2, h, color, { opacity: 0.8 }));
  return bars;
};

// ── Status Bar ────────────────────────────────────────────────────────────────
const StatusBar = () => F(0, 0, 390, 44, P.bg, { ch: [
  T('9:41', 16, 14, 60, 16, { size: 15, weight: 600, fill: P.text }),
  F(330, 18, 25, 12, 'transparent', { r: 3, stroke: P.text, sw: 1.5, opacity: 0.5, ch: [
    F(1, 1, 18, 10, P.text, { r: 2, opacity: 0.5 }),
    F(25, 4, 3, 5, P.text, { r: 1, opacity: 0.5 }),
  ]}),
  F(305, 19, 3, 10, P.text, { r: 1, opacity: 0.3 }),
  F(310, 17, 3, 12, P.text, { r: 1, opacity: 0.45 }),
  F(315, 15, 3, 14, P.text, { r: 1, opacity: 0.6 }),
  F(320, 13, 3, 16, P.text, { r: 1, opacity: 0.75 }),
]});

// ── Bottom Nav ────────────────────────────────────────────────────────────────
const NAV = [
  { label: 'Home',     sym: '◈' },
  { label: 'Episodes', sym: '▶' },
  { label: 'Audience', sym: '◉' },
  { label: 'Revenue',  sym: '◆' },
  { label: 'Profile',  sym: '◍' },
];

const BottomNav = (active) => {
  const itemW = 78;
  const items = NAV.map((n, i) => {
    const x = i * itemW;
    const isActive = i === active;
    return [
      isActive ? Pill(x + 12, 6, 54, 40, P.highlight, 10, {}) : null,
      T(n.sym, x, 8, itemW, 18, {
        size: 16, fill: isActive ? P.accent : P.muted, align: 'center', weight: isActive ? 700 : 400,
      }),
      T(n.label, x, 27, itemW, 14, {
        size: 9, fill: isActive ? P.accent : P.muted, align: 'center',
        weight: isActive ? 600 : 400, ls: isActive ? 0.3 : 0,
      }),
    ].filter(Boolean);
  }).flat();
  return F(0, 792, 390, 52, P.surface, {
    ch: [Line(0, 0, 390, P.border), ...items],
  });
};

// ── Screen 1: HOME / DASHBOARD ────────────────────────────────────────────────
const screen1 = () => {
  const ch = [];
  ch.push(StatusBar());

  // Masthead
  ch.push(T('HALO', 24, 52, 100, 28, { size: 24, weight: 700, fill: P.accent, ls: 4 }));
  ch.push(T('Good morning, Maya 👋', 24, 83, 270, 16, { size: 13, fill: P.sub }));
  // Avatar
  ch.push(E(346, 50, 36, 36, P.highlight, {}));
  ch.push(T('M', 346, 61, 36, 16, { size: 15, weight: 700, fill: P.accent, align: 'center' }));

  ch.push(Line(24, 108, 342, P.border));

  // THIS WEEK hero stat — editorial pull-quote style
  ch.push(Rule(24, 118, 80));
  ch.push(T('THIS WEEK', 36, 118, 200, 14, { size: 10, fill: P.muted, ls: 2.5, weight: 600 }));
  ch.push(T('48,210', 36, 134, 260, 52, { size: 48, weight: 700, fill: P.text, lh: 1.0 }));
  ch.push(T('total listens', 36, 186, 200, 16, { size: 13, fill: P.sub }));
  ch.push(T('+12.4%', 280, 150, 86, 28, { size: 22, weight: 700, fill: P.green, align: 'right' }));
  ch.push(T('vs last week', 274, 178, 92, 14, { size: 10, fill: P.muted, align: 'right' }));

  ch.push(Line(24, 212, 342, P.border));

  // 3 KPI tiles
  const kpi = (x, label, val, delta, dColor) => F(x, 220, 104, 68, P.surface, {
    r: 12, stroke: P.border, sw: 1, ch: [
      T(label, 10, 8,  84, 12, { size: 9,  fill: P.muted, weight: 600, ls: 1.5 }),
      T(val,   10, 22, 84, 24, { size: 18, weight: 700, fill: P.text }),
      T(delta, 10, 48, 84, 14, { size: 10, fill: dColor }),
    ]
  });
  ch.push(kpi(24,  'SUBSCRIBERS', '12.4K', '+340 this wk', P.green));
  ch.push(kpi(140, 'AVG LISTEN',  '23m 40s', '+2m 10s',   P.green));
  ch.push(kpi(256, 'REVENUE',     '$1,840', '+$220 MoM',  P.accent));

  // Latest episode card
  ch.push(T('Latest Episode', 24, 302, 200, 18, { size: 14, weight: 600, fill: P.text }));
  ch.push(T('Published yesterday', 200, 304, 142, 16, { size: 11, fill: P.muted, align: 'right' }));

  ch.push(F(24, 326, 342, 116, P.surface, { r: 16, stroke: P.border, sw: 1, ch: [
    // Amber header strip with episode number
    F(0, 0, 342, 44, P.accent, { r: 16, ch: [
      F(0, 24, 342, 20, P.accent, {}),  // bottom fill for rounded top only
      T('EP 147', 20, 12, 80, 20, { size: 13, weight: 700, fill: '#FFF', ls: 1 }),
      T('54m 22s', 260, 12, 82, 20, { size: 12, fill: 'rgba(255,255,255,0.7)', align: 'right' }),
    ]}),
    T('The Future of Voice Search', 20, 54, 260, 20, { size: 15, weight: 700, fill: P.text }),
    T('w/ Dr. Sarah Okonkwo', 20, 76, 220, 14, { size: 11, fill: P.sub }),
    T('4,820 listens', 268, 58, 74, 16, { size: 11, fill: P.muted, align: 'right' }),
    // Play button
    E(278, 76, 28, 28, P.highlight, {}),
    T('▶', 278, 83, 28, 14, { size: 12, fill: P.accent, align: 'center', weight: 700 }),
  ]}));

  // Weekly listens sparkline
  ch.push(T('LISTENS THIS WEEK', 24, 456, 200, 14, { size: 10, fill: P.muted, ls: 2, weight: 600 }));
  const wData = [6200, 5800, 7400, 8100, 6900, 7600, 6210];
  const wMax  = Math.max(...wData);
  const days  = ['M','T','W','T','F','S','S'];
  wData.forEach((v, i) => {
    const bh = Math.round((v / wMax) * 60);
    const x  = 24 + i * 48;
    ch.push(F(x, 530 - bh, 36, bh, i === 6 ? P.accent2 : P.surface3, { r: 4 }));
    ch.push(T(days[i], x, 534, 36, 12, { size: 9, fill: i===6 ? P.accent : P.sub, align: 'center', weight: i===6 ? 700 : 400 }));
  });

  // Editorial pull-quote
  ch.push(F(24, 560, 342, 72, P.highlight, { r: 14, ch: [
    Rule(16, 14, 44),
    T('"Voice is the next frontier for brand storytelling."', 30, 12, 298, 30,
      { size: 12, fill: P.accent, italic: true, lh: 1.55, weight: 400 }),
    T('· Trending on Spotify Podcast Charts', 30, 46, 298, 16, { size: 10, fill: P.sub }),
  ]}));

  ch.push(Line(0, 682, 390, P.border));
  ch.push(BottomNav(0));
  return { id: 'screen1', label: 'Home', width: 390, height: 844, fill: P.bg, children: ch };
};

// ── Screen 2: EPISODE PLAYER ──────────────────────────────────────────────────
const screen2 = () => {
  const ch = [];
  ch.push(F(0, 0, 390, 844, P.bg, {}));  // base bg

  // Full amber header zone (Format Podcasts inspired deep amber top)
  ch.push(F(0, 0, 390, 260, P.accent, { ch: [
    // Status bar on amber
    T('9:41', 16, 14, 60, 16, { size: 15, weight: 600, fill: '#FFF' }),
    F(330, 18, 25, 12, 'transparent', { r: 3, stroke: '#FFF', sw: 1.5, opacity: 0.7, ch: [
      F(1, 1, 18, 10, '#FFF', { r: 2, opacity: 0.7 }),
      F(25, 4, 3, 5, '#FFF', { r: 1, opacity: 0.7 }),
    ]}),
    // Back arrow
    T('← Episodes', 16, 52, 120, 18, { size: 13, fill: 'rgba(255,255,255,0.8)', weight: 500 }),
    // Share
    T('Share ↗', 290, 52, 80, 18, { size: 13, fill: 'rgba(255,255,255,0.7)', align: 'right' }),
    // Podcast title + episode
    T('THE VOICE LAB', 24, 82, 340, 16, { size: 11, fill: 'rgba(255,255,255,0.65)', ls: 2, weight: 600 }),
    T('The Future of\nVoice Search', 24, 100, 310, 64, { size: 28, weight: 700, fill: '#FFF', lh: 1.2 }),
    T('w/ Dr. Sarah Okonkwo', 24, 168, 300, 18, { size: 13, fill: 'rgba(255,255,255,0.75)' }),
    T('EP 147  ·  54m 22s  ·  Apr 2, 2026', 24, 188, 300, 16, { size: 11, fill: 'rgba(255,255,255,0.55)' }),
    // Listen count pill
    Pill(24, 210, 90, 26, 'rgba(255,255,255,0.15)', 13, { ch: [
      T('4,820 listens', 0, 5, 90, 16, { size: 11, fill: '#FFF', align: 'center', weight: 500 }),
    ]}),
    // Top-3 chip
    Pill(122, 210, 78, 26, 'rgba(255,255,255,0.15)', 13, { ch: [
      T('🏆 Top 3 today', 4, 5, 74, 16, { size: 10, fill: '#FFF', align: 'center' }),
    ]}),
  ]}));

  // Waveform player (the new interaction pattern — audio waveform as data)
  ch.push(F(24, 268, 342, 72, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
    T('19:24', 12, 10, 50, 14, { size: 11, fill: P.sub, weight: 600 }),
    T('54:22', 282, 10, 50, 14, { size: 11, fill: P.muted, align: 'right' }),
    // Waveform bars within the card (inline, lower)
    ...Waveform(12, 28, 318, 32, P.wave, 0.36).map(el => ({
      ...el, x: el.x, y: el.y,
    })),
  ]}));

  // Playback controls
  ch.push(F(24, 350, 342, 56, 'transparent', { ch: [
    T('⏮', 40, 10, 36, 36, { size: 28, fill: P.muted, align: 'center' }),
    T('⏪', 100, 10, 36, 36, { size: 24, fill: P.sub, align: 'center' }),
    // Play button — prominent amber circle
    E(153, 5, 46, 46, P.accent, {}),
    T('⏸', 153, 15, 46, 26, { size: 20, fill: '#FFF', align: 'center' }),
    T('⏩', 220, 10, 36, 36, { size: 24, fill: P.sub, align: 'center' }),
    T('⏭', 280, 10, 36, 36, { size: 28, fill: P.muted, align: 'center' }),
  ]}));

  // Speed / bookmark row
  ch.push(F(24, 416, 342, 34, P.surface2, { r: 10, ch: [
    Pill(8, 6, 44, 22, P.surface3, 11, { ch: [T('1×', 0, 4, 44, 14, { size: 12, fill: P.sub, align: 'center', weight: 600 })] }),
    T('1.25×', 60, 8, 44, 18, { size: 11, fill: P.muted, align: 'center' }),
    T('1.5×', 110, 8, 44, 18, { size: 11, fill: P.muted, align: 'center' }),
    T('2×',   158, 8, 36, 18, { size: 11, fill: P.muted, align: 'center' }),
    T('🔖 Save clip', 232, 8, 94, 18, { size: 11, fill: P.accent, align: 'right', weight: 500 }),
  ]}));

  // Chapter markers — editorial treatment (the new pattern)
  ch.push(T('CHAPTERS', 24, 464, 200, 14, { size: 10, fill: P.muted, ls: 2, weight: 600 }));
  ch.push(T('6 total', 310, 464, 56, 14, { size: 11, fill: P.sub, align: 'right' }));

  const chapter = (y, time, title, active) => F(24, y, 342, 52, active ? P.highlight : 'transparent', {
    r: active ? 12 : 0,
    ch: [
      Rule(active ? 12 : 0, active ? 10 : 0, active ? 32 : 0, P.accent),
      Pill(active ? 24 : 0, active ? 14 : 16, 52, 24, active ? P.accent : P.surface3, 12, { ch: [
        T(time, 0, 5, 52, 14, { size: 10, fill: active ? '#FFF' : P.sub, align: 'center', weight: 600 }),
      ]}),
      T(title, active ? 84 : 60, active ? 14 : 16, 240, 18,
        { size: 13, fill: active ? P.text : P.sub, weight: active ? 600 : 400 }),
      active ? T('▶ Now', 298, 18, 40, 14, { size: 10, fill: P.accent, align: 'right', weight: 600 }) : null,
      Line(0, 51, 342, P.border),
    ].filter(Boolean),
  });

  ch.push(chapter(484, '0:00',  'Intro & Guest Background', false));
  ch.push(chapter(538, '8:14',  'State of Voice Assistants', false));
  ch.push(chapter(592, '19:24', 'Voice SEO Strategies', true));
  ch.push(chapter(648, '32:10', 'Brand Voice Identity', false));
  ch.push(chapter(702, '44:05', 'The 2026 Prediction', false));

  ch.push(BottomNav(1));
  return { id: 'screen2', label: 'Episode', width: 390, height: 844, fill: P.bg, children: ch };
};

// ── Screen 3: AUDIENCE ────────────────────────────────────────────────────────
const screen3 = () => {
  const ch = [];
  ch.push(StatusBar());

  ch.push(T('Audience', 24, 52, 200, 28, { size: 22, weight: 700, fill: P.text }));
  ch.push(T('12,480 subscribers', 24, 82, 240, 16, { size: 13, fill: P.sub, italic: true }));

  // Period picker
  ch.push(F(204, 56, 162, 30, P.surface2, { r: 15, ch: [
    Pill(2, 2, 78, 26, P.accent, 13, { ch: [
      T('30 Days', 0, 5, 78, 16, { size: 11, fill: '#FFF', align: 'center', weight: 600 }),
    ]}),
    T('90 Days', 84, 7, 74, 16, { size: 11, fill: P.sub, align: 'center' }),
  ]}));

  ch.push(Line(24, 108, 342, P.border));

  // Subscriber growth pull-quote
  ch.push(Rule(24, 118, 64));
  ch.push(T('NEW SUBSCRIBERS', 36, 118, 280, 14, { size: 10, fill: P.muted, ls: 2, weight: 600 }));
  ch.push(T('+340', 36, 134, 180, 40, { size: 38, weight: 700, fill: P.green, lh: 1.0 }));
  ch.push(T('this week', 36, 174, 180, 16, { size: 13, fill: P.sub }));
  ch.push(T('↑28% vs prev week', 240, 148, 126, 18, { size: 13, fill: P.green, align: 'right', weight: 500 }));

  ch.push(Line(24, 194, 342, P.border));

  // Listening platforms
  ch.push(T('PLATFORMS', 24, 206, 200, 14, { size: 10, fill: P.muted, ls: 2, weight: 600 }));

  const platforms = [
    { name: 'Spotify',       pct: 44, color: P.green   },
    { name: 'Apple Podcasts',pct: 31, color: P.accent   },
    { name: 'Google',        pct: 14, color: P.accent2  },
    { name: 'Other',         pct: 11, color: P.muted    },
  ];

  platforms.forEach((p, i) => {
    const y = 226 + i * 46;
    ch.push(F(24, y, 342, 40, 'transparent', { ch: [
      E(0, 10, 20, 20, p.color, {}),
      T(p.name, 28, 8, 196, 18, { size: 13, fill: P.text, weight: 500 }),
      T(`${p.pct}%`, 294, 8, 48, 18, { size: 13, fill: P.text, weight: 700, align: 'right' }),
      F(28, 28, 290, 6, P.surface3, { r: 3, ch: [
        F(0, 0, Math.round((p.pct / 100) * 290), 6, p.color, { r: 3 }),
      ]}),
      Line(0, 40, 342, P.border),
    ]}));
  });

  // Demographics section
  ch.push(T('LISTENER PROFILE', 24, 416, 200, 14, { size: 10, fill: P.muted, ls: 2, weight: 600 }));

  // Age distribution mini bars
  const ages = [
    { range: '18–24', pct: 18 },
    { range: '25–34', pct: 41 },
    { range: '35–44', pct: 27 },
    { range: '45+',   pct: 14 },
  ];
  const maxAge = Math.max(...ages.map(a => a.pct));
  ages.forEach((a, i) => {
    const x = 24 + i * 84;
    const bh = Math.round((a.pct / maxAge) * 60);
    ch.push(F(x + 14, 490 - bh, 48, bh, i === 1 ? P.accent : P.surface3, { r: 4 }));
    ch.push(T(`${a.pct}%`, x, 494, 76, 14, { size: 11, fill: i === 1 ? P.accent : P.sub, align: 'center', weight: i === 1 ? 700 : 400 }));
    ch.push(T(a.range, x, 510, 76, 14, { size: 10, fill: P.muted, align: 'center' }));
  });
  ch.push(T('25–34 is your core audience', 24, 530, 342, 14, { size: 11, fill: P.sub, align: 'center', italic: true }));

  // Top countries
  ch.push(T('TOP COUNTRIES', 24, 554, 200, 14, { size: 10, fill: P.muted, ls: 2, weight: 600 }));
  const countries = [
    { flag: '🇺🇸', name: 'United States', pct: 52 },
    { flag: '🇬🇧', name: 'United Kingdom', pct: 18 },
    { flag: '🇨🇦', name: 'Canada', pct: 11 },
    { flag: '🇦🇺', name: 'Australia', pct: 8 },
  ];
  countries.forEach((c, i) => {
    const y = 574 + i * 40;
    ch.push(F(24, y, 342, 34, 'transparent', { ch: [
      T(c.flag, 0, 6, 28, 22, { size: 18 }),
      T(c.name, 36, 7, 220, 18, { size: 13, fill: P.text }),
      T(`${c.pct}%`, 294, 7, 48, 18, { size: 13, fill: P.text, weight: 700, align: 'right' }),
      Line(0, 34, 342, P.border),
    ]}));
  });

  // Retention editorial callout
  ch.push(F(24, 738, 342, 44, P.highlight, { r: 12, ch: [
    Rule(12, 8, 28),
    T('Avg. completion rate: 73%  ·  Industry avg: 52%', 24, 12, 310, 18,
      { size: 12, fill: P.accent, weight: 600 }),
  ]}));

  ch.push(BottomNav(2));
  return { id: 'screen3', label: 'Audience', width: 390, height: 844, fill: P.bg, children: ch };
};

// ── Screen 4: REVENUE ─────────────────────────────────────────────────────────
const screen4 = () => {
  const ch = [];
  ch.push(StatusBar());

  ch.push(T('Revenue', 24, 52, 200, 28, { size: 22, weight: 700, fill: P.text }));
  ch.push(T('April 2026', 24, 82, 200, 16, { size: 13, fill: P.sub, italic: true }));
  ch.push(T('$1,840 earned', 290, 60, 100, 16, { size: 13, fill: P.sub, align: 'right' }));
  ch.push(T('+$220 vs Mar', 290, 78, 100, 14, { size: 11, fill: P.green, align: 'right' }));

  ch.push(Line(24, 108, 342, P.border));

  // Revenue hero pull-quote
  ch.push(Rule(24, 118, 72));
  ch.push(T('MONTHLY REVENUE', 36, 118, 280, 14, { size: 10, fill: P.muted, ls: 2.5, weight: 600 }));
  ch.push(T('$1,840', 36, 134, 240, 50, { size: 44, weight: 700, fill: P.text, lh: 1.0 }));
  ch.push(T('+13.6%', 36, 184, 180, 16, { size: 13, fill: P.green, weight: 500 }));
  ch.push(T('Projected: $2,100', 230, 190, 136, 14, { size: 11, fill: P.muted, align: 'right' }));

  ch.push(Line(24, 202, 342, P.border));

  // Revenue streams — magazine-column table style
  ch.push(T('STREAMS', 24, 214, 200, 14, { size: 10, fill: P.muted, ls: 2, weight: 600 }));

  const streams = [
    { icon: '🎙️', name: 'Sponsorships',    val: '$1,200', pct: 65, color: P.accent  },
    { icon: '🌟', name: 'Listener Support', val: '$380',   pct: 21, color: P.accent2 },
    { icon: '🎓', name: 'Course Upsell',    val: '$180',   pct: 10, color: P.green   },
    { icon: '📦', name: 'Merch',            val: '$80',    pct:  4, color: P.muted   },
  ];

  streams.forEach((s, i) => {
    const y = 234 + i * 52;
    ch.push(F(24, y, 342, 46, 'transparent', { ch: [
      F(0, 8, 34, 30, P.highlight, { r: 8, ch: [T(s.icon, 0, 5, 34, 20, { size: 16, align: 'center' })] }),
      T(s.name, 44, 8, 196, 17, { size: 13, fill: P.text, weight: 500 }),
      T(`${s.pct}% of total`, 44, 28, 150, 14, { size: 10, fill: P.muted }),
      T(s.val, 258, 8, 84, 18, { size: 15, weight: 700, fill: P.text, align: 'right' }),
      F(44, 38, 260, 5, P.surface3, { r: 3, ch: [
        F(0, 0, Math.round((s.pct / 100) * 260), 5, s.color, { r: 3 }),
      ]}),
      Line(0, 46, 342, P.border),
    ]}));
  });

  // Active sponsorship deals
  ch.push(T('ACTIVE DEALS', 24, 448, 200, 14, { size: 10, fill: P.muted, ls: 2, weight: 600 }));

  const deal = (y, brand, eps, cpm, total, status, sColor) => F(24, y, 342, 64, P.surface, {
    r: 14, stroke: P.border, sw: 1, ch: [
      T(brand,  16, 10, 200, 18, { size: 14, weight: 700, fill: P.text }),
      T(`${eps} episodes  ·  $${cpm} CPM`, 16, 30, 240, 14, { size: 11, fill: P.sub }),
      T(total, 258, 10, 84, 18, { size: 15, weight: 700, fill: P.text, align: 'right' }),
      Pill(258, 32, 84, 22, sColor + '22', 11, { ch: [
        T(status, 0, 4, 84, 14, { size: 10, fill: sColor, align: 'center', weight: 600 }),
      ]}),
    ]
  });

  ch.push(deal(468, 'Descript Studio',  4, '28', '$600', 'Active',    P.green));
  ch.push(deal(540, 'Headliner.app',    2, '22', '$400', 'Invoiced',  P.accent2));
  ch.push(deal(612, 'Adobe Podcast',    1, '20', '$200', 'Pending',   P.muted));

  // CPM insight callout
  ch.push(F(24, 688, 342, 44, P.highlight, { r: 12, ch: [
    Rule(12, 8, 28),
    T('Your CPM of $26 is 2.1× the podcast industry average.', 24, 11, 308, 18,
      { size: 12, fill: P.accent, weight: 500 }),
  ]}));

  ch.push(BottomNav(3));
  return { id: 'screen4', label: 'Revenue', width: 390, height: 844, fill: P.bg, children: ch };
};

// ── Screen 5: PROFILE / SETTINGS ─────────────────────────────────────────────
const screen5 = () => {
  const ch = [];
  ch.push(StatusBar());

  // Profile header — warm amber band
  ch.push(F(0, 44, 390, 168, P.accent, { ch: [
    // Podcast artwork (warm circle)
    E(24, 24, 80, 80, 'rgba(255,255,255,0.2)', {}),
    T('🎙', 40, 44, 48, 36, { size: 34 }),
    T('THE VOICE LAB', 118, 28, 240, 18, { size: 13, weight: 700, fill: '#FFF', ls: 1.5 }),
    T('with Maya Chen', 118, 50, 240, 18, { size: 15, fill: 'rgba(255,255,255,0.85)' }),
    T('Hosted by Maya Chen', 118, 72, 240, 16, { size: 12, fill: 'rgba(255,255,255,0.6)' }),
    // Stats row on amber
    F(24, 114, 342, 38, 'rgba(0,0,0,0.15)', { r: 10, ch: [
      T('147', 28, 8, 60, 22, { size: 18, weight: 700, fill: '#FFF', align: 'center' }),
      T('eps', 28, 28, 60, 12, { size: 9, fill: 'rgba(255,255,255,0.65)', align: 'center' }),
      F(100, 6, 1, 26, 'rgba(255,255,255,0.2)', {}),
      T('12.4K', 112, 8, 70, 22, { size: 18, weight: 700, fill: '#FFF', align: 'center' }),
      T('listeners', 106, 28, 82, 12, { size: 9, fill: 'rgba(255,255,255,0.65)', align: 'center' }),
      F(196, 6, 1, 26, 'rgba(255,255,255,0.2)', {}),
      T('4.8★', 208, 8, 60, 22, { size: 18, weight: 700, fill: '#FFF', align: 'center' }),
      T('rating', 208, 28, 60, 12, { size: 9, fill: 'rgba(255,255,255,0.65)', align: 'center' }),
      F(280, 6, 1, 26, 'rgba(255,255,255,0.2)', {}),
      T('$1,840', 288, 8, 70, 22, { size: 16, weight: 700, fill: '#FFF', align: 'center' }),
      T('this mo.', 288, 28, 70, 12, { size: 9, fill: 'rgba(255,255,255,0.65)', align: 'center' }),
    ]}),
  ]}));

  // Show settings
  ch.push(T('SHOW SETTINGS', 24, 230, 200, 14, { size: 10, fill: P.muted, ls: 2, weight: 600 }));

  const settRow = (y, icon, label, val, accent) => F(24, y, 342, 48, P.surface, {
    r: 12, stroke: P.border, sw: 1, ch: [
      T(icon, 14, 12, 24, 24, { size: 18 }),
      T(label, 50, 14, 200, 18, { size: 13, fill: P.text }),
      T(val, 240, 14, 90, 18, { size: 12, fill: accent || P.muted, align: 'right' }),
      T('›', 326, 15, 16, 16, { size: 16, fill: P.border }),
    ]
  });

  ch.push(settRow(248, '📡', 'RSS Feed',           'Active',   P.green));
  ch.push(settRow(300, '🎵', 'Distribution',        '8 platforms'));
  ch.push(settRow(352, '💬', 'Auto-Transcription',  'Enabled',  P.accent));
  ch.push(settRow(404, '📊', 'Analytics Plan',      'Pro',      P.accent2));
  ch.push(settRow(456, '💳', 'Billing',             'Monthly'));

  // Plan card
  ch.push(T('YOUR PLAN', 24, 522, 200, 14, { size: 10, fill: P.muted, ls: 2, weight: 600 }));
  ch.push(F(24, 540, 342, 80, P.highlight, { r: 16, stroke: P.border, sw: 1, ch: [
    Rule(16, 14, 52),
    T('HALO Pro', 30, 14, 150, 20, { size: 16, weight: 700, fill: P.accent }),
    T('$29/month  ·  Renews May 1', 30, 36, 220, 16, { size: 12, fill: P.sub }),
    T('Unlimited episodes, custom domain,\nfull analytics & monetization tools', 30, 52, 260, 24,
      { size: 10, fill: P.muted, lh: 1.5 }),
    Pill(272, 24, 70, 26, P.accent, 13, { ch: [
      T('Upgrade', 0, 5, 70, 16, { size: 11, fill: '#FFF', align: 'center', weight: 600 }),
    ]}),
  ]}));

  // Account
  ch.push(T('ACCOUNT', 24, 638, 200, 14, { size: 10, fill: P.muted, ls: 2, weight: 600 }));
  ch.push(settRow(656, '🔔', 'Notifications', 'Customized'));
  ch.push(settRow(708, '🔒', 'Password & Security', 'Strong'));
  ch.push(settRow(760, '👥', 'Team Members', '2 members'));

  ch.push(BottomNav(4));
  return { id: 'screen5', label: 'Profile', width: 390, height: 844, fill: P.bg, children: ch };
};

// ── Assemble ──────────────────────────────────────────────────────────────────
const pen = {
  fileVersion: '2.8',
  name: 'HALO — Podcast Growth Intelligence',
  screens: [screen1(), screen2(), screen3(), screen4(), screen5()],
};

fs.writeFileSync(path.join(__dirname, 'halo.pen'), JSON.stringify(pen, null, 2), 'utf8');
console.log(`✓ halo.pen written — ${pen.screens.length} screens, ${JSON.stringify(pen).length.toLocaleString()} bytes`);
