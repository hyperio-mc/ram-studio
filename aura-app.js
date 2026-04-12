'use strict';
// aura-app.js
// AURA — Design Trend Intelligence Platform
//
// Challenge: Design a light-theme editorial design trend discovery platform,
// directly inspired by:
//
// 1. Dark Mode Design gallery (darkmodedesign.com) — featured "Orbi": a vivid
//    multicolor arc gradient (orange/pink/cyan/blue "aurora borealis" swirl) over
//    dark backgrounds. Adapted here as subtle aurora accent gradients on warm cream.
//
// 2. Minimal Gallery (minimal.gallery) — extreme typographic restraint: Inter at
//    different weights/opacities on pure white/cream as the entire design system.
//    "The Daily Dispatch" editorial warm-cream tones and oversized display type.
//
// 3. Awwwards trend observation — AI now the fastest-growing design category;
//    "product UI as hero" — the interface is the advertisement.
//
// Palette: warm cream (#FAF8F4) + rich near-black + violet aurora accent + amber
// Screens: 5 mobile (390×844)
// Theme: LIGHT (previous run "zero" was dark)

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#FAF8F4',   // warm cream — Minimal Gallery editorial warmth
  surface:  '#FFFFFF',   // pure white cards
  surface2: '#F3F0EA',   // slightly deeper cream for secondary surfaces
  surface3: '#EDE9DF',   // tertiary warm
  border:   '#E5E0D4',   // warm grey border
  muted:    '#B5AF9E',   // warm muted text
  fg:       '#1A1714',   // rich near-black (avoids pure black)
  fg2:      '#3D3830',   // secondary text
  fg3:      '#6B6356',   // tertiary text
  accent:   '#7B5CF0',   // aurora violet — Orbi gradient inspiration
  accent2:  '#F07840',   // aurora warm orange
  accent3:  '#1DA8F0',   // aurora cyan
  green:    '#2DB87A',   // aurora green
  pink:     '#E0508F',   // aurora pink
  // Gradient stops for aurora effects
  grad1:    '#7B5CF0',
  grad2:    '#E0508F',
  grad3:    '#F07840',
};

let _id = 0;
const uid = () => `a${++_id}`;

// ── Primitives ────────────────────────────────────────────────────────────────
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
  fill: opts.fill || P.fg,
  textAlign: opts.align || 'left',
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh !== undefined ? { lineHeight: opts.lh } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Pill = (label, x, y, bg, fg, opts = {}) => {
  const pw = opts.w || (label.length * 7 + 20);
  const ph = opts.h || 26;
  return F(x, y, pw, ph, bg, { r: ph / 2, ch: [
    T(label, 0, 0, pw, ph, { size: opts.size || 11, weight: 600, fill: fg, align: 'center', ls: 0.3 }),
  ]});
};

const Icon = (shape, x, y, size, color, opacity) => {
  size = size || 20;
  const s = size; const c = s / 2;
  const paths = {
    home: `M${c} 3 L${s-2} ${c+1} L${s-2} ${s-2} L${c+3} ${s-2} L${c+3} ${c+2} L${c-3} ${c+2} L${c-3} ${s-2} L2 ${s-2} L2 ${c+1} Z`,
    search: `M${c-1} ${c-1} m-5,0 a5,5 0 1,0 10,0 a5,5 0 1,0 -10,0 M${c+3} ${c+3} L${s-2} ${s-2}`,
    star: `M${c} 2 L${c+3} ${c-2} L${s-1} ${c-2} L${c+5} ${c+3} L${c+7} ${s-1} L${c} ${c+6} L${c-7} ${s-1} L${c-5} ${c+3} L1 ${c-2} L${c-3} ${c-2} Z`,
    plus: `M${c} 3 L${c} ${s-3} M3 ${c} L${s-3} ${c}`,
    user: `M${c} ${c-2} m-4,0 a4,4 0 1,0 8,0 a4,4 0 1,0 -8,0 M3 ${s-2} a${c-3},${c-4} 0 0,1 ${s-6},0`,
    chart: `M3 ${s-3} L3 ${c} L8 ${c-2} L8 ${s-3} M10 ${s-3} L10 ${c+3} L15 ${c+1} L15 ${s-3} M17 ${s-3} L17 ${c-4} L${s-3} ${c-4} L${s-3} ${s-3}`,
    bell: `M${c} 2 L${c} 4 M4 ${c+2} a${c-4},${c-4} 0 0,1 ${s-8},0 L${s-3} ${s-5} L3 ${s-5} Z M${c-3} ${s-4} a3,3 0 0,0 6,0`,
    layers: `M${c} 2 L${s-3} ${c-2} L${c} ${c+2} L3 ${c-2} Z M3 ${c+1} L${c} ${c+5} L${s-3} ${c+1} M3 ${c+4} L${c} ${s-3} L${s-3} ${c+4}`,
    grid: `M2 2 L${c-1} 2 L${c-1} ${c-1} L2 ${c-1} Z M${c+1} 2 L${s-2} 2 L${s-2} ${c-1} L${c+1} ${c-1} Z M2 ${c+1} L${c-1} ${c+1} L${c-1} ${s-2} L2 ${s-2} Z M${c+1} ${c+1} L${s-2} ${c+1} L${s-2} ${s-2} L${c+1} ${s-2} Z`,
    zap: `M12 2 L6 11 L11 11 L8 18 L15 9 L10 9 Z`,
    eye: `M${c} ${c} m-7,0 a7,4.5 0 1,0 14,0 a7,4.5 0 1,0 -14,0 M${c} ${c} m-2.5,0 a2.5,2.5 0 1,0 5,0 a2.5,2.5 0 1,0 -5,0`,
  };
  return {
    id: uid(), type: 'vector', x, y, width: s, height: s,
    fill: 'transparent', stroke: { fill: color || P.fg, thickness: 1.5, align: 'center' },
    data: paths[shape] || paths.star,
    ...(opacity !== undefined ? { opacity } : {}),
  };
};

// ── Status Bar ────────────────────────────────────────────────────────────────
const statusBar = (y = 0) => F(0, y, 390, 44, 'transparent', { ch: [
  T('9:41', 16, 14, 60, 16, { size: 13, weight: 600, fill: P.fg }),
  T('●●●', 310, 14, 70, 16, { size: 11, fill: P.fg2, align: 'right' }),
]});

// ── Bottom Nav ────────────────────────────────────────────────────────────────
const bottomNav = (active, y = 790) => {
  const items = [
    { id: 'home', icon: 'home',   label: 'Trends'   },
    { id: 'search', icon: 'search', label: 'Explore'  },
    { id: 'star', icon: 'star',   label: 'Saved'    },
    { id: 'grid', icon: 'grid',   label: 'Colors'   },
    { id: 'user', icon: 'user',   label: 'Profile'  },
  ];
  const bar = F(0, y, 390, 54, P.surface, { ch: [] });
  bar.stroke = { align: 'inside', thickness: 1, fill: P.border };
  items.forEach((it, i) => {
    const ix = 15 + i * 72;
    const isActive = it.id === active;
    bar.children.push(Icon(it.icon, ix + 16, 7, 20, isActive ? P.accent : P.muted));
    bar.children.push(T(it.label, ix, 30, 52, 14, {
      size: 9.5, weight: isActive ? 600 : 400,
      fill: isActive ? P.accent : P.muted, align: 'center', ls: 0.1,
    }));
  });
  return bar;
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 1: TRENDS FEED
// ─────────────────────────────────────────────────────────────────────────────
const screen1 = () => {
  const bg = F(0, 0, 390, 844, P.bg, { clip: true, ch: [] });

  // Subtle aurora glow at top (Orbi-inspired mesh gradient, adapted for light)
  bg.children.push(F(-60, -60, 280, 200, P.accent, {
    r: 140, opacity: 0.06, ch: [],
  }));
  bg.children.push(F(180, -40, 220, 180, P.accent2, {
    r: 110, opacity: 0.07, ch: [],
  }));

  bg.children.push(statusBar(0));

  // ── Header ──
  bg.children.push(T('AURA', 20, 52, 120, 28, { size: 22, weight: 800, fill: P.fg, ls: 2.5 }));
  bg.children.push(T('Design Intelligence', 20, 78, 200, 18, { size: 12, weight: 400, fill: P.fg3 }));

  // Notification bell
  bg.children.push(F(338, 54, 36, 36, P.surface2, { r: 18, ch: [
    Icon('bell', 8, 8, 20, P.fg2),
  ]}));
  // Unread dot on bell
  bg.children.push(F(352, 56, 8, 8, P.accent, { r: 4, ch: [] }));

  // ── Week Label ──
  bg.children.push(T('TRENDING THIS WEEK', 20, 106, 250, 14, {
    size: 10, weight: 700, fill: P.muted, ls: 1.8,
  }));

  // ── Hero Trend Card (aurora gradient inspired) ──
  const heroCard = F(20, 126, 350, 180, P.accent, { r: 16, ch: [], clip: true });
  // Aurora gradient layers
  heroCard.children.push(F(0, 0, 350, 180, P.accent2, { r: 0, opacity: 0.5, ch: [] }));
  heroCard.children.push(F(120, -30, 200, 160, P.pink, { r: 100, opacity: 0.35, ch: [] }));
  heroCard.children.push(F(-20, 60, 180, 140, P.accent3, { r: 90, opacity: 0.3, ch: [] }));

  // Hero card text overlay
  heroCard.children.push(Pill('↑ RISING', 16, 14, 'rgba(255,255,255,0.25)', '#FFFFFF', { w: 80, h: 22, size: 10 }));
  heroCard.children.push(T('Aurora Mesh\nGradients', 16, 44, 240, 64, {
    size: 26, weight: 800, fill: '#FFFFFF', lh: 1.2,
  }));
  heroCard.children.push(T('Soft multi-color gradient blobs over\ndark & light backgrounds', 16, 116, 300, 36, {
    size: 12, fill: 'rgba(255,255,255,0.85)', lh: 1.5,
  }));
  heroCard.children.push(T('847 sites using this →', 16, 156, 200, 16, {
    size: 11, weight: 600, fill: 'rgba(255,255,255,0.9)',
  }));
  bg.children.push(heroCard);

  // ── Section: Trending Patterns ──
  bg.children.push(T('Trending Patterns', 20, 320, 200, 18, { size: 15, weight: 700, fill: P.fg }));
  bg.children.push(T('See all', 316, 322, 60, 16, { size: 12, fill: P.accent, align: 'right' }));

  // Trend row cards
  const trendItems = [
    { title: 'Editorial\nType Scale', tag: 'Typography', col: P.surface, tc: P.fg, n: '+23%' },
    { title: 'Floating\n3D Objects', tag: 'Visual',     col: P.surface, tc: P.fg, n: '+18%' },
  ];
  trendItems.forEach((item, i) => {
    const cx = 20 + i * 178;
    const card = F(cx, 344, 168, 110, item.col, { r: 12, ch: [], stroke: P.border, sw: 1 });
    // Color swatch bar at top
    const swatchColors = [P.accent, P.accent2, P.pink, P.accent3, P.green];
    swatchColors.forEach((sc, si) => {
      card.children.push(F(10 + si * 30, 10, 28, 28, sc, { r: 14, ch: [], opacity: 0.8 }));
    });
    card.children.push(T(item.title, 10, 46, 140, 36, { size: 13, weight: 700, fill: item.tc, lh: 1.4 }));
    card.children.push(Pill(item.tag, 10, 86, P.surface2, P.fg3, { w: 82, h: 18, size: 9 }));
    card.children.push(T(item.n, 118, 87, 40, 16, { size: 11, weight: 700, fill: P.green, align: 'right' }));
    bg.children.push(card);
  });

  // ── Section: Color Stories ──
  bg.children.push(T('Color Stories', 20, 468, 200, 18, { size: 15, weight: 700, fill: P.fg }));

  const colorStories = [
    { name: 'Solstice Warmth', swatches: ['#E8875A', '#F0BC5A', '#E05858', '#7B5CF0'] },
    { name: 'Cool Northern',   swatches: ['#1DA8F0', '#2DB87A', '#7B5CF0', '#E0508F'] },
  ];
  colorStories.forEach((cs, i) => {
    const cy = 492 + i * 66;
    const row = F(20, cy, 350, 54, P.surface, { r: 12, ch: [], stroke: P.border, sw: 1 });
    cs.swatches.forEach((sw, si) => {
      row.children.push(F(12 + si * 46, 10, 36, 34, sw, { r: 8, ch: [] }));
    });
    row.children.push(T(cs.name, 200, 18, 140, 18, { size: 12, weight: 600, fill: P.fg2 }));
    row.children.push(Icon('eye', 318, 17, 18, P.muted));
    bg.children.push(row);
  });

  // ── Section: AI Design Sites ──
  bg.children.push(T('AI Design Rising', 20, 628, 200, 18, { size: 15, weight: 700, fill: P.fg }));
  bg.children.push(Pill('↑ #1 Category', 188, 626, '#EEE9FF', P.accent, { w: 112, h: 22, size: 9.5 }));

  const aiCard = F(20, 652, 350, 90, P.surface, { r: 12, ch: [], stroke: P.border, sw: 1 });
  aiCard.children.push(F(12, 12, 66, 66, '#F0EDFF', { r: 10, ch: [
    T('AI', 12, 16, 42, 34, { size: 26, weight: 800, fill: P.accent }),
  ]}));
  aiCard.children.push(T('Minimal.gallery now lists AI as\nits first and fastest-growing tag.', 88, 16, 248, 36, {
    size: 12, fill: P.fg2, lh: 1.5,
  }));
  aiCard.children.push(T('34% of new submissions → AI category', 88, 58, 248, 16, {
    size: 10, fill: P.muted, lh: 1.4,
  }));
  bg.children.push(aiCard);

  // ── Section: Week Stat Pills ──
  const stats = [
    { v: '2,847', l: 'Sites tracked' },
    { v: '134',   l: 'New this week' },
    { v: '↑ 12', l: 'Trend shifts'  },
  ];
  stats.forEach((s, i) => {
    const sx = 20 + i * 118;
    const pill = F(sx, 754, 108, 30, P.surface2, { r: 10, ch: [], stroke: P.border, sw: 1 });
    pill.children.push(T(s.v, 8, 7, 50, 16, { size: 12, weight: 700, fill: P.fg }));
    pill.children.push(T(s.l, 58, 9, 44, 12, { size: 9, fill: P.muted }));
    bg.children.push(pill);
  });

  bg.children.push(bottomNav('home', 790));
  return bg;
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 2: EXPLORE / SEARCH
// ─────────────────────────────────────────────────────────────────────────────
const screen2 = () => {
  const bg = F(420, 0, 390, 844, P.bg, { clip: true, ch: [] });

  // Subtle aurora glow
  bg.children.push(F(360+200, 200, 200, 200, P.green, { r: 100, opacity: 0.07, ch: [] }));

  bg.children.push(statusBar(0));

  // ── Header ──
  bg.children.push(T('Explore', 20, 52, 200, 28, { size: 22, weight: 800, fill: P.fg }));
  bg.children.push(T('Discover patterns & sites', 20, 78, 250, 16, { size: 12, fill: P.fg3 }));

  // ── Search Bar ──
  const searchBar = F(420, 102, 350, 44, P.surface, { r: 12, ch: [], stroke: P.border, sw: 1 });
  searchBar.x = 420 + 20; searchBar.y = 102;
  searchBar.children.push(Icon('search', 14, 12, 20, P.muted));
  searchBar.children.push(T('Search trends, patterns, colors…', 42, 13, 280, 18, { size: 13, fill: P.muted }));
  bg.children.push(searchBar);

  // ── Category Tags (Minimal Gallery inspired — horizontal scrollable pill strip) ──
  bg.children.push(T('CATEGORIES', 420+20, 158, 200, 14, { size: 10, weight: 700, fill: P.muted, ls: 1.8 }));
  const cats = ['All', 'AI', 'Typography', 'Dark Mode', 'Gradients', 'Minimal', 'SaaS', '3D'];
  let cx2 = 420 + 20;
  cats.forEach((cat, i) => {
    const isFirst = i === 0;
    const pw = cat.length * 7.5 + 20;
    const pill = F(cx2, 178, pw, 28, isFirst ? P.accent : P.surface2, {
      r: 14, ch: [],
      stroke: isFirst ? undefined : P.border, sw: 1,
    });
    pill.children.push(T(cat, 0, 0, pw, 28, {
      size: 11.5, weight: isFirst ? 700 : 500,
      fill: isFirst ? '#FFFFFF' : P.fg2, align: 'center',
    }));
    bg.children.push(pill);
    cx2 += pw + 8;
  });

  // ── Curated Sites Grid ──
  bg.children.push(T('Curated Sites', 420+20, 220, 200, 18, { size: 15, weight: 700, fill: P.fg }));

  const sites = [
    { name: 'Orbi Studio',    tag: 'Aurora UI',    col: '#1A0A2E', txt: '#C4A8FF', sub: '#A88EE8' },
    { name: 'KOMETA Type',    tag: 'Typography',   col: '#F5F200', txt: '#000000', sub: '#555500' },
    { name: 'Retro OS Chus',  tag: 'Y2K Revival',  col: '#C8F060', txt: '#0A3000', sub: '#2A5A00' },
    { name: 'Old Tom Capital',tag: 'Editorial',     col: '#1C1208', txt: '#E8D8B0', sub: '#A09060' },
  ];
  sites.forEach((site, i) => {
    const row = i % 2; const col = Math.floor(i / 2);
    const sx = 420 + 20 + col * 178;
    const sy = 244 + row * 132;
    const card = F(sx, sy, 168, 122, site.col, { r: 12, ch: [], clip: true });
    // Site mock content
    card.children.push(T(site.name, 10, 14, 148, 18, { size: 12, weight: 700, fill: site.txt }));
    card.children.push(Pill(site.tag, 10, 38, site.sub + '44', site.txt, { w: site.tag.length*7+14, h: 18, size: 9 }));
    // Mini design preview lines
    for (let li = 0; li < 3; li++) {
      const lw = [120, 90, 70][li];
      card.children.push(F(10, 66 + li * 16, lw, 6, site.sub, { r: 3, opacity: 0.6, ch: [] }));
    }
    bg.children.push(card);
  });

  // ── Trending Interactions Section ──
  bg.children.push(T('Interaction Patterns', 420+20, 514, 220, 18, { size: 15, weight: 700, fill: P.fg }));

  const interactions = [
    { title: 'Hover arrow reveal',   desc: '↗ icon appears on card hover', pct: 78 },
    { title: 'Aurora glow effect',   desc: 'Soft colored blob behind content', pct: 64 },
    { title: 'Type-as-hero visual',  desc: 'Oversized letterforms as imagery', pct: 59 },
    { title: 'Product UI as hero',   desc: 'Dark app screenshot in hero', pct: 55 },
  ];
  interactions.forEach((item, i) => {
    const iy = 538 + i * 62;
    const row = F(420+20, iy, 350, 52, P.surface, { r: 10, ch: [], stroke: P.border, sw: 1 });
    row.children.push(T(item.title, 12, 8, 210, 16, { size: 12, weight: 600, fill: P.fg }));
    row.children.push(T(item.desc, 12, 26, 240, 14, { size: 10.5, fill: P.fg3 }));
    // Progress bar
    row.children.push(F(260, 18, 78, 6, P.surface2, { r: 3, ch: [] }));
    row.children.push(F(260, 18, Math.round(78 * item.pct / 100), 6, P.accent, { r: 3, ch: [], opacity: 0.85 }));
    row.children.push(T(`${item.pct}%`, 290, 10, 48, 12, { size: 10, weight: 700, fill: P.accent, align: 'right' }));
    bg.children.push(row);
  });

  bg.children.push(bottomNav('search', 790));
  return bg;
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 3: SAVED COLLECTION
// ─────────────────────────────────────────────────────────────────────────────
const screen3 = () => {
  const bg = F(840, 0, 390, 844, P.bg, { clip: true, ch: [] });

  // Subtle aurora
  bg.children.push(F(840+260, 120, 180, 180, P.accent2, { r: 90, opacity: 0.06, ch: [] }));

  bg.children.push(statusBar(0));

  // ── Header ──
  bg.children.push(T('Saved', 840+20, 52, 200, 28, { size: 22, weight: 800, fill: P.fg }));
  bg.children.push(T('Your design library', 840+20, 78, 200, 16, { size: 12, fill: P.fg3 }));

  // Sort + Filter row
  bg.children.push(Pill('Recent', 840+20, 100, P.accent, '#FFFFFF', { w: 68, h: 26, size: 11 }));
  bg.children.push(Pill('By Type', 840+96, 100, P.surface2, P.fg2, { w: 68, h: 26, size: 11 }));
  bg.children.push(Pill('By Color', 840+172, 100, P.surface2, P.fg2, { w: 72, h: 26, size: 11 }));

  // ── Saved Items ──
  const saved = [
    {
      title: 'Aurora Mesh on Dark',
      src: 'Dark Mode Design · darkmodedesign.com',
      tags: ['Gradient', 'Dark UI'],
      accent: P.accent,
      preview: [P.accent, P.pink, P.accent2, P.accent3],
    },
    {
      title: 'KOMETA Type Foundry',
      src: 'Minimal Gallery · minimal.gallery',
      tags: ['Typography', 'Bold'],
      accent: '#F5F200',
      preview: ['#F5F200', '#000000', '#FFD700', '#E0C400'],
    },
    {
      title: 'Editorial Whitespace',
      src: 'Minimal Gallery · minimal.gallery',
      tags: ['Minimal', 'Layout'],
      accent: P.fg,
      preview: [P.fg, P.fg2, P.fg3, P.muted],
    },
    {
      title: 'Retro OS Aesthetic',
      src: 'Minimal Gallery · minimal.gallery',
      tags: ['Y2K', 'Pixel'],
      accent: '#00DD44',
      preview: ['#00DD44', '#008822', '#00FF55', '#004411'],
    },
    {
      title: 'Product UI Hero Pattern',
      src: 'Dark Mode Design · darkmodedesign.com',
      tags: ['SaaS', 'Dark UI'],
      accent: P.accent3,
      preview: [P.accent3, P.accent, P.green, P.accent2],
    },
  ];

  saved.forEach((item, i) => {
    const iy = 138 + i * 118;
    const card = F(840+20, iy, 350, 108, P.surface, { r: 14, ch: [], stroke: P.border, sw: 1 });

    // Color preview strip (4 swatches)
    item.preview.forEach((sw, si) => {
      card.children.push(F(12 + si * 36, 12, 32, 50, sw, { r: 8, ch: [] }));
    });

    // Bookmark icon (filled = saved)
    card.children.push(T('★', 316, 14, 20, 20, { size: 16, fill: '#F5C842', align: 'center' }));

    card.children.push(T(item.title, 156, 12, 180, 18, { size: 13, weight: 700, fill: P.fg }));
    card.children.push(T(item.src, 156, 32, 180, 14, { size: 10, fill: P.muted }));

    // Tags
    let tx = 156;
    item.tags.forEach(tag => {
      const tw = tag.length * 6.5 + 14;
      const tp = F(tx, card.y + 52, tw, 18, P.surface2, { r: 9, ch: [], stroke: P.border, sw: 1 });
      tp.x = tx; tp.y = 52;
      card.children.push(F(tx, 52, tw, 18, P.surface2, { r: 9, ch: [
        T(tag, 0, 0, tw, 18, { size: 9.5, weight: 500, fill: P.fg3, align: 'center' }),
      ]}));
      tx += tw + 6;
    });

    // Subtle accent dot
    card.children.push(F(340, 86, 8, 8, item.accent, { r: 4, ch: [], opacity: 0.7 }));
    card.children.push(T('Open →', 256, 86, 78, 14, { size: 10.5, weight: 600, fill: P.accent }));

    bg.children.push(card);
  });

  bg.children.push(bottomNav('star', 790));
  return bg;
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 4: COLOR PALETTE EXPLORER
// ─────────────────────────────────────────────────────────────────────────────
const screen4 = () => {
  const bg = F(1260, 0, 390, 844, P.bg, { clip: true, ch: [] });

  // Aurora glow — pink/orange tones
  bg.children.push(F(1260+150, 400, 220, 220, P.pink, { r: 110, opacity: 0.06, ch: [] }));
  bg.children.push(F(1260+0, 300, 180, 180, P.green, { r: 90, opacity: 0.05, ch: [] }));

  bg.children.push(statusBar(0));

  bg.children.push(T('Colors', 1260+20, 52, 200, 28, { size: 22, weight: 800, fill: P.fg }));
  bg.children.push(T('Trending palettes from the web', 1260+20, 78, 280, 16, { size: 12, fill: P.fg3 }));

  // ── Featured Palette of the Week (large card) ──
  bg.children.push(T('PALETTE OF THE WEEK', 1260+20, 106, 250, 14, {
    size: 10, weight: 700, fill: P.muted, ls: 1.8,
  }));

  const featCard = F(1260+20, 126, 350, 140, P.surface, { r: 16, ch: [], stroke: P.border, sw: 1 });
  // Large swatch strip — 5 colors side by side
  const featColors = ['#7B5CF0', '#E0508F', '#F07840', '#F5C842', '#2DB87A'];
  const featNames  = ['Violet', 'Orchid', 'Amber', 'Gold', 'Mint'];
  featColors.forEach((fc, fi) => {
    featCard.children.push(F(12 + fi * 66, 12, 58, 80, fc, { r: 10, ch: [] }));
    featCard.children.push(T(featNames[fi], 12 + fi * 66, 96, 58, 14, {
      size: 9, fill: P.fg3, align: 'center',
    }));
    // Hex label
    featCard.children.push(T(fc, 12 + fi * 66, 110, 58, 12, {
      size: 8, fill: P.muted, align: 'center',
    }));
  });
  featCard.children.push(T('Aurora · 2026 · ★ 2.4k saves', 12, 126, 250, 12, {
    size: 10, fill: P.muted,
  }));
  bg.children.push(featCard);

  // ── Color Families ──
  bg.children.push(T('Color Families', 1260+20, 280, 200, 18, { size: 15, weight: 700, fill: P.fg }));

  const families = [
    { name: 'Purples & Violets', count: '124 palettes', col: '#7B5CF0', shades: ['#3D1FA8', '#5B3DD4', '#7B5CF0', '#9B7FF8', '#C4AAFB', '#EDE8FF'] },
    { name: 'Warm Ambers',       count: '98 palettes',  col: '#F07840', shades: ['#8A3800', '#C05820', '#F07840', '#F8A870', '#FBD0A8', '#FFF3E8'] },
    { name: 'Aurora Greens',     count: '76 palettes',  col: '#2DB87A', shades: ['#0A4830', '#198855', '#2DB87A', '#5ACCA0', '#96E4C4', '#D4F5E8'] },
  ];
  families.forEach((fam, i) => {
    const fy = 304 + i * 110;
    const famCard = F(1260+20, fy, 350, 98, P.surface, { r: 12, ch: [], stroke: P.border, sw: 1 });
    // Shade strip
    fam.shades.forEach((sh, si) => {
      famCard.children.push(F(12 + si * 56, 12, 52, 44, sh, { r: 6, ch: [] }));
    });
    famCard.children.push(T(fam.name, 12, 64, 200, 16, { size: 12, weight: 600, fill: P.fg }));
    famCard.children.push(T(fam.count, 12, 80, 150, 14, { size: 10, fill: P.muted }));
    famCard.children.push(Icon('layers', 312, 64, 20, P.accent));
    bg.children.push(famCard);
  });

  // ── Color Contrast Checker mini section ──
  bg.children.push(T('Contrast Check', 1260+20, 644, 200, 18, { size: 15, weight: 700, fill: P.fg }));
  bg.children.push(T('WCAG-ready palettes only', 1260+20, 664, 250, 14, { size: 11, fill: P.muted }));

  const contrastCard = F(1260+20, 684, 350, 90, P.surface, { r: 12, ch: [], stroke: P.border, sw: 1 });
  // Two contrast examples
  const pairs = [
    { bg: '#7B5CF0', fg: '#FFFFFF', ratio: '7.2:1', pass: 'AAA' },
    { bg: '#FAF8F4', fg: '#1A1714', ratio: '16.8:1', pass: 'AAA' },
  ];
  pairs.forEach((pair, pi) => {
    const px = 12 + pi * 168;
    contrastCard.children.push(F(px, 10, 150, 42, pair.bg, { r: 8, ch: [
      T(pair.fg === '#FFFFFF' ? 'Aa' : 'Aa', 58, 11, 34, 20, {
        size: 16, weight: 700, fill: pair.fg, align: 'center',
      }),
    ]}));
    contrastCard.children.push(T(pair.ratio, px, 58, 80, 14, { size: 11, weight: 600, fill: P.fg }));
    contrastCard.children.push(Pill(pair.pass, px + 82, 56, '#E8FFF2', '#1A8040', { w: 36, h: 18, size: 9 }));
  });
  bg.children.push(contrastCard);

  bg.children.push(bottomNav('grid', 790));
  return bg;
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 5: SITE SPOTLIGHT DETAIL
// ─────────────────────────────────────────────────────────────────────────────
const screen5 = () => {
  const bg = F(1680, 0, 390, 844, P.bg, { clip: true, ch: [] });

  // Aurora glow
  bg.children.push(F(1680+100, -40, 260, 260, P.accent, { r: 130, opacity: 0.07, ch: [] }));
  bg.children.push(F(1680+280, 80, 200, 200, P.pink, { r: 100, opacity: 0.05, ch: [] }));

  bg.children.push(statusBar(0));

  // ── Back nav ──
  bg.children.push(T('← Trending', 1680+20, 50, 120, 18, { size: 13, weight: 500, fill: P.accent }));

  // ── Site Hero Card (simulated screenshot) ──
  const heroImg = F(1680+20, 74, 350, 200, '#1A0A2E', { r: 16, ch: [], clip: true });
  // Simulated aurora-gradient site screenshot (Orbi-inspired)
  heroImg.children.push(F(-20, -20, 250, 200, '#7B5CF0', { r: 125, opacity: 0.6, ch: [] }));
  heroImg.children.push(F(120, -10, 200, 180, '#E0508F', { r: 100, opacity: 0.5, ch: [] }));
  heroImg.children.push(F(200, 60, 180, 180, '#F07840', { r: 90, opacity: 0.4, ch: [] }));
  heroImg.children.push(F(0, 80, 160, 160, '#1DA8F0', { r: 80, opacity: 0.3, ch: [] }));
  // Site text overlay on screenshot
  heroImg.children.push(T('ORBI STUDIO', 20, 60, 200, 30, { size: 24, weight: 800, fill: '#FFFFFF', ls: 2 }));
  heroImg.children.push(T('We orbit the future', 20, 96, 280, 20, { size: 14, fill: 'rgba(255,255,255,0.75)' }));
  heroImg.children.push(Pill('SOTD · March 2026', 20, 160, 'rgba(255,255,255,0.15)', '#FFFFFF', { w: 150, h: 24, size: 10 }));
  bg.children.push(heroImg);

  // ── Site Meta ──
  bg.children.push(T('Orbi Studio', 1680+20, 288, 260, 26, { size: 20, weight: 800, fill: P.fg }));
  bg.children.push(T('Design & Technology Studio', 1680+20, 316, 260, 16, { size: 12, fill: P.fg3 }));
  bg.children.push(Pill('↗ Visit site', 1680+274, 284, P.accent, '#FFFFFF', { w: 90, h: 30, size: 11.5 }));

  // Tags row
  const detailTags = ['Aurora UI', 'Dark Mode', 'Motion Design', 'SOTD'];
  let dtx = 1680 + 20;
  detailTags.forEach(tag => {
    const tw = tag.length * 7 + 18;
    bg.children.push(Pill(tag, dtx, 344, P.surface2, P.fg2, { w: tw, h: 24, size: 10 }));
    dtx += tw + 8;
  });

  // ── Design Breakdown ──
  bg.children.push(T('Design Breakdown', 1680+20, 384, 250, 18, { size: 15, weight: 700, fill: P.fg }));

  const breakdown = [
    { label: 'Typography',   value: 'Custom display + Neue Haas Unica',  icon: 'layers' },
    { label: 'Color Palette', value: '#1A0A2E + Aurora gradient overlay', icon: 'grid'   },
    { label: 'Key Pattern',  value: 'Mesh gradient blob composition',     icon: 'zap'    },
    { label: 'Animation',    value: 'Subtle parallax, gradient shift',    icon: 'eye'    },
  ];
  breakdown.forEach((item, i) => {
    const iy = 408 + i * 60;
    const row = F(1680+20, iy, 350, 50, P.surface, { r: 10, ch: [], stroke: P.border, sw: 1 });
    row.children.push(F(12, 10, 30, 30, '#F0EDFF', { r: 8, ch: [
      Icon(item.icon, 5, 5, 20, P.accent),
    ]}));
    row.children.push(T(item.label, 52, 8, 120, 16, { size: 11, weight: 600, fill: P.fg }));
    row.children.push(T(item.value, 52, 26, 280, 14, { size: 10.5, fill: P.fg3 }));
    bg.children.push(row);
  });

  // ── Aurora Palette Extract ──
  bg.children.push(T('Extracted Palette', 1680+20, 652, 200, 18, { size: 15, weight: 700, fill: P.fg }));

  const auroraColors = [
    { hex: '#1A0A2E', name: 'Void' },
    { hex: '#7B5CF0', name: 'Violet' },
    { hex: '#E0508F', name: 'Orchid' },
    { hex: '#F07840', name: 'Ember' },
    { hex: '#1DA8F0', name: 'Arctic' },
  ];
  auroraColors.forEach((ac, ai) => {
    const ax = 1680 + 20 + ai * 68;
    bg.children.push(F(ax, 676, 60, 60, ac.hex, { r: 12, ch: [] }));
    bg.children.push(T(ac.name, ax, 740, 60, 14, { size: 9, fill: P.fg3, align: 'center' }));
    bg.children.push(T(ac.hex, ax, 754, 60, 12, { size: 8, fill: P.muted, align: 'center' }));
  });

  bg.children.push(bottomNav('search', 790));
  return bg;
};

// ─────────────────────────────────────────────────────────────────────────────
// ASSEMBLE PEN
// ─────────────────────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  meta: {
    name: 'AURA — Design Trend Intelligence',
    description: 'Light-theme design trend discovery platform. Inspired by aurora mesh gradients (Orbi on darkmodedesign.com), editorial minimalism from minimal.gallery, and the AI category explosion in design curation.',
    width: 2070,
    height: 844,
    backgroundColor: P.bg,
  },
  screens: [screen1(), screen2(), screen3(), screen4(), screen5()],
};

fs.writeFileSync(path.join(__dirname, 'aura.pen'), JSON.stringify(pen, null, 2));
console.log('✓ aura.pen written');
console.log('  Screens:', pen.screens.length);
console.log('  Canvas:', pen.meta.width + '×' + pen.meta.height);
