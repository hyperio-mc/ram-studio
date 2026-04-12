'use strict';
// bruut-app.js
// BRUUT — Typographic Brutalist Portfolio OS for Creative Studios
//
// Design Heartbeat — Mar 20, 2026
// Inspired by:
//   • Locomotive.ca (godly.website) — HelveticaNowDisplay, emoji-punctuated bold headlines,
//     brutal grotesque typography, zero-decoration agency energy, black/white extremes
//   • Forge Agency (darkmodedesign.com) — near-black #090D06 with olive-muted fg #97978F,
//     custom "Tttravels" font, raw editorial confidence
//   • godly.website itself — masonry/grid gallery aesthetic, minimal chrome, full-bleed thumbnails
//   • Land-book trend: "How It Wears" editorial material guide — content-forward brutalist layout
//
// Challenge: Design a dark-mode typographic brutalist portfolio OS for creative agencies —
// blending Locomotive's oversized grotesque type, Forge's near-black olive palette, and
// a savagely minimal grid system. No decorative flourishes. Type IS the design.
//
// Screens (5):
//   1. Home Feed    — BRUUT wordmark + editorial case study grid with oversized numbering
//   2. Case Study   — Full-bleed editorial layout, massive type, media panels
//   3. Discover     — Filtered gallery grid, masonry layout
//   4. Studio       — Agency profile, stats, featured work bento
//   5. New Project  — Brutalist upload form, raw field aesthetics

const fs   = require('fs');
const path = require('path');

// ── Palette — Near-Black Olive Brutalist ──────────────────────────────────────
const P = {
  bg:       '#09080A',   // near-black with slight warm purple — Forge aesthetic
  surface:  '#111013',   // slightly lifted surface
  surface2: '#181620',   // card surface
  surface3: '#1E1C2A',   // highest surface / inputs
  border:   '#232134',   // grid lines, structural borders
  border2:  '#2E2C42',   // stronger grid / active state

  // Text
  fg:       '#E0DCCC',   // warm off-white, newspaper-ish
  fg2:      '#7A7A8A',   // muted — Forge's #97978F vibe, slightly cooler
  fg3:      '#3A3A4A',   // very muted / disabled

  // Acid accent — brutalist pop (one color rule: ACID YELLOW)
  acid:     '#C8F520',   // acid yellow-green — brutalist signature
  acidDim:  '#1E2808',   // acid dark bg
  acidText: '#0A0904',   // dark text on acid

  // Structural accents
  white:    '#FFFFFF',   // pure white for hero moments
  red:      '#FF3B3B',   // error / rejection
  orange:   '#FF6B35',   // warm secondary for hover states

  // Media placeholders
  ph1:      '#1A1828',   // image placeholder dark
  ph2:      '#14121F',   // image placeholder darker
  ph3:      '#221F32',   // placeholder mid
};

let _id = 0;
const uid = () => `br${++_id}`;

// ── Primitives ─────────────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill || P.bg,
  clip: opts.clip !== undefined ? opts.clip : false,
  ...(opts.r !== undefined   ? { cornerRadius: opts.r }  : {}),
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
  ...(opts.lh !== undefined ? { lineHeight:    opts.lh } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  ...(opts.font ? { fontFamily: opts.font } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Ln = (x, y, w, fill = P.border) => F(x, y, w, 1, fill, {});

// Thick brutalist divider line
const Divider = (x, y, w, thickness = 2, color = P.fg) =>
  F(x, y, w, thickness, color, {});

// Acid pill badge
const Badge = (x, y, text, bg = P.acid, fg = P.acidText) => {
  const w = text.length * 7.5 + 20;
  return F(x, y, w, 22, bg, {
    r: 2,
    ch: [T(text, 0, 4, w, 13, { size: 9, weight: 700, fill: fg, align: 'center', ls: 1.5 })],
  });
};

// ── Screen 1: Home Feed ───────────────────────────────────────────────────────
function makeHome() {
  const W = 1440, H = 960;
  const children = [];

  // Background
  children.push(F(0, 0, W, H, P.bg));

  // ── Top nav (raw, minimal) ──
  children.push(F(0, 0, W, 56, P.bg, {
    stroke: P.border, sw: 1,
    ch: [
      // Logo wordmark — brutalist, all caps
      T('BRUUT', 32, 16, 100, 28, { size: 22, weight: 900, fill: P.white, ls: -1 }),
      // Nav items
      T('FEED', 180, 20, 60, 16, { size: 10, weight: 700, fill: P.fg2, ls: 2 }),
      T('DISCOVER', 252, 20, 80, 16, { size: 10, weight: 700, fill: P.fg2, ls: 2 }),
      T('STUDIOS', 346, 20, 70, 16, { size: 10, weight: 700, fill: P.fg2, ls: 2 }),
      // Right side
      T('+ NEW PROJECT', W - 164, 18, 140, 20, { size: 10, weight: 700, fill: P.acid, ls: 2 }),
      F(W - 44, 14, 28, 28, P.ph1, { r: 14 }),
    ],
  }));

  // ── Structural top bar — TAG LINE ──
  children.push(F(0, 56, W, 50, P.surface, {
    ch: [
      T('PORTFOLIO OS FOR STUDIOS THAT DON\'T DO DECORATIVE', 32, 16, 600, 18,
        { size: 11, weight: 700, fill: P.fg3, ls: 3 }),
      // Stat pills
      Badge(726, 15, '14,200 PROJECTS'),
      Badge(870, 15, '832 STUDIOS'),
      Badge(W - 220, 15, 'MARCH 2026', P.surface3, P.fg2),
    ],
  }));

  // ── Case study grid — brutalist editorial ──
  // Big horizontal feature card: Case #01
  children.push(F(32, 130, 900, 280, P.ph1, {
    r: 4,
    ch: [
      // Big number
      T('01', 28, 24, 160, 120, { size: 96, weight: 900, fill: P.white, ls: -4, opacity: 0.15 }),
      // Tags
      Badge(28, 28, 'BRANDING'),
      Badge(120, 28, 'MOTION'),
      // Title
      T('Rebranding the\nMost Hated Bank\nin Europe', 28, 64, 520, 140,
        { size: 40, weight: 900, fill: P.white, ls: -1.5, lh: 46 }),
      // Studio + year
      T('Locomotive® · 2026', 28, 220, 300, 16, { size: 10, weight: 600, fill: P.fg2, ls: 2 }),
      // Acid corner accent
      F(808, 0, 92, 280, P.acid, {
        r: 0,
        ch: [
          T('VIEW\nCASE', 8, 110, 76, 60,
            { size: 13, weight: 900, fill: P.acidText, ls: 1, align: 'center', lh: 18 }),
        ],
      }),
    ],
  }));

  // Side column: Case #02
  children.push(F(950, 130, 460, 280, P.surface2, {
    r: 4, stroke: P.border,
    ch: [
      T('02', 20, 16, 120, 80, { size: 64, weight: 900, fill: P.white, ls: -2, opacity: 0.12 }),
      Badge(20, 18, 'DIGITAL'),
      Badge(80, 18, 'E-COMM'),
      T('Silencio — Luxury\nNightclub Web OS', 20, 50, 400, 80,
        { size: 26, weight: 900, fill: P.white, ls: -1, lh: 34 }),
      T('Troa Studio · 2026', 20, 148, 200, 16, { size: 9, weight: 600, fill: P.fg2, ls: 2 }),
      // Preview strip
      F(0, 180, 460, 100, P.ph2, { r: 0 }),
      // Year badge
      F(384, 190, 56, 22, P.acid, { r: 2, ch: [
        T('2026', 0, 5, 56, 14, { size: 9, weight: 700, fill: P.acidText, align: 'center', ls: 1 }),
      ]}),
    ],
  }));

  // ── Second row: 3 equal cards ──
  const row2 = [
    { num: '03', tags: ['TYPE', 'PRINT'],  title: 'Good Fella\nIdentity System', studio: 'Good Fella Studio' },
    { num: '04', tags: ['UX', 'PRODUCT'],  title: 'Joby Creator\nCamera Platform', studio: 'TinyWins Inc.' },
    { num: '05', tags: ['WEB', 'MOTION'],  title: 'Aupale Vodka\nDigital Presence', studio: 'Locomotive®' },
  ];

  row2.forEach((item, i) => {
    const x = 32 + i * 470;
    children.push(F(x, 430, 446, 220, P.surface2, {
      r: 4, stroke: P.border,
      ch: [
        T(item.num, 16, 12, 80, 60, { size: 48, weight: 900, fill: P.white, ls: -2, opacity: 0.1 }),
        ...(item.tags.map((tag, ti) => Badge(16 + ti * 80, 14, tag))),
        T(item.title, 16, 44, 380, 70,
          { size: 21, weight: 900, fill: P.white, ls: -0.5, lh: 28 }),
        T(item.studio, 16, 136, 280, 16, { size: 9, weight: 600, fill: P.fg2, ls: 2 }),
        F(0, 164, 446, 56, P.ph3, { r: 0 }),
      ],
    }));
  });

  // Far right card: no image, typography only
  children.push(F(1442 - 380, 430, 346, 220, P.acidDim, {
    r: 4, stroke: P.acid, sw: 1,
    ch: [
      T('06', 16, 12, 80, 60, { size: 48, weight: 900, fill: P.acid, ls: -2, opacity: 0.3 }),
      Badge(16, 14, 'EXPERIMENTAL', P.acid),
      T('Foudre Social\nClub Identity', 16, 44, 280, 70, { size: 21, weight: 900, fill: P.acid, ls: -0.5, lh: 28 }),
      T('Troa PRO · 2026', 16, 136, 220, 16, { size: 9, weight: 600, fill: P.fg2, ls: 2 }),
      T('↗', 286, 8, 40, 40, { size: 28, weight: 900, fill: P.acid }),
    ],
  }));

  // ── Bottom filter strip ──
  children.push(F(0, H - 60, W, 60, P.surface, {
    stroke: P.border, sw: 1,
    ch: [
      T('FILTER:', 32, 22, 60, 16, { size: 9, weight: 700, fill: P.fg3, ls: 2 }),
      ...[['ALL', true], ['BRANDING', false], ['DIGITAL', false], ['MOTION', false], ['PRINT', false], ['EXPERIMENTAL', false]].map(([label, active], i) => {
        const x = 104 + i * 120;
        return F(x, 16, label.length * 8 + 24, 28, active ? P.acid : P.surface2, {
          r: 2,
          ch: [T(label, 0, 7, label.length * 8 + 24, 14, {
            size: 9, weight: 700, fill: active ? P.acidText : P.fg2, ls: 2, align: 'center',
          })],
        });
      }),
      T('1–12 of 847 projects', W - 220, 22, 200, 16, { size: 9, fill: P.fg3, ls: 1, align: 'right' }),
    ],
  }));

  return { id: uid(), type: 'frame', x: 0, y: 0, width: W, height: H, fill: P.bg, clip: true, children };
}

// ── Screen 2: Case Study ──────────────────────────────────────────────────────
function makeCaseStudy() {
  const W = 1440, H = 960;
  const children = [];

  children.push(F(0, 0, W, H, P.bg));

  // Full-width media hero
  children.push(F(0, 0, W, 480, P.ph1, {
    ch: [
      // Large case number overlay
      T('01', W - 280, 20, 240, 200, { size: 180, weight: 900, fill: P.white, ls: -8, opacity: 0.08 }),
      // Back nav
      T('← BRUUT / FEED', 32, 24, 200, 16, { size: 9, weight: 700, fill: P.fg2, ls: 2 }),
      // Tags bottom-left
      Badge(32, 440, 'BRANDING', P.acid),
      Badge(130, 440, 'MOTION', P.surface3, P.fg),
      Badge(200, 440, '2026', P.surface3, P.fg),
    ],
  }));

  // ── Two-column editorial body ──
  // Left: Big title
  children.push(F(32, 500, 640, 280, P.bg, {
    ch: [
      T('Rebranding the\nMost Hated Bank\nin Europe', 0, 0, 620, 220,
        { size: 52, weight: 900, fill: P.white, ls: -2, lh: 60 }),
      T('BY LOCOMOTIVE® · CLIENT: BANCO DIABLO', 0, 228, 400, 16,
        { size: 9, weight: 700, fill: P.fg2, ls: 2.5 }),
    ],
  }));

  // Divider
  children.push(Divider(32, 492, W - 64, 2, P.border2));

  // Right: Overview text
  children.push(F(710, 500, 480, 200, P.bg, {
    ch: [
      T('OVERVIEW', 0, 0, 200, 14, { size: 9, weight: 700, fill: P.acid, ls: 3 }),
      T('A complete brand overhaul for a financial institution that had\nbecome synonymous with consumer frustration. The challenge:\nkeep the legacy trust signals while projecting radical change.\n\nLocomotive stripped every decorative element and rebuilt the\nvisual language from pure typographic structure — no gradients,\nno icons, no stock imagery. Just type that means it.', 0, 22, 480, 160,
        { size: 12, fill: P.fg2, lh: 20 }),
    ],
  }));

  // ── Bottom 3-column metrics ──
  const metrics = [
    { label: 'CAMPAIGN REACH', val: '214M', sub: 'impressions across EU' },
    { label: 'BRAND RECALL', val: '+73%', sub: 'vs previous identity' },
    { label: 'AWARDS', val: '7×', sub: 'Awwwards, D&AD, Cannes' },
  ];

  metrics.forEach((m, i) => {
    const x = 32 + i * 350;
    children.push(F(x, 730, 320, 120, P.surface2, {
      r: 4, stroke: P.border,
      ch: [
        T(m.label, 20, 16, 280, 14, { size: 9, weight: 700, fill: P.fg3, ls: 2 }),
        T(m.val, 20, 36, 200, 60, { size: 48, weight: 900, fill: P.acid, ls: -2 }),
        T(m.sub, 20, 96, 280, 14, { size: 9, fill: P.fg2, ls: 1 }),
      ],
    }));
  });

  // ── Media strip (3 frames) ──
  [0, 1, 2].forEach(i => {
    children.push(F(32 + i * 300, 870, 278, 70, P.ph2, { r: 4 }));
  });

  // Side — Share + Studio card
  children.push(F(W - 256, 500, 224, 320, P.surface, {
    r: 4, stroke: P.border,
    ch: [
      T('STUDIO', 20, 20, 180, 14, { size: 9, weight: 700, fill: P.fg3, ls: 2 }),
      E(20, 44, 44, 44, P.acid),
      T('Locomotive®', 76, 52, 128, 18, { size: 13, weight: 700, fill: P.white }),
      T('Montreal, CA', 76, 72, 128, 14, { size: 9, fill: P.fg2 }),
      Ln(20, 105, 184, P.border),
      T('DELIVERABLES', 20, 120, 180, 14, { size: 9, weight: 700, fill: P.fg3, ls: 2 }),
      ...['Brand Identity', 'Motion System', 'Web Design', 'Campaign Assets'].map((d, i) =>
        T('— ' + d, 20, 140 + i * 20, 180, 14, { size: 10, fill: P.fg2 })
      ),
      Ln(20, 226, 184, P.border),
      F(20, 238, 184, 36, P.acid, {
        r: 2,
        ch: [T('VIEW LIVE SITE ↗', 0, 10, 184, 16, { size: 10, weight: 700, fill: P.acidText, align: 'center', ls: 1.5 })],
      }),
      T('SHARE', 20, 288, 60, 14, { size: 9, weight: 700, fill: P.fg3, ls: 2 }),
      ...['↗ X', '↗ LI', '↗ IG'].map((s, i) =>
        T(s, 90 + i * 40, 286, 40, 16, { size: 10, weight: 700, fill: P.acid })
      ),
    ],
  }));

  return { id: uid(), type: 'frame', x: 0, y: 0, width: W, height: H, fill: P.bg, clip: true, children };
}

// ── Screen 3: Discover ────────────────────────────────────────────────────────
function makeDiscover() {
  const W = 1440, H = 960;
  const children = [];

  children.push(F(0, 0, W, H, P.bg));

  // ── Hero header — DISCOVER page ──
  children.push(F(0, 0, W, 56, P.bg, {
    stroke: P.border, sw: 1,
    ch: [
      T('BRUUT', 32, 16, 100, 28, { size: 22, weight: 900, fill: P.white, ls: -1 }),
      T('DISCOVER', 180, 20, 80, 16, { size: 10, weight: 700, fill: P.acid, ls: 2 }),
      T('FEED', 272, 20, 60, 16, { size: 10, weight: 700, fill: P.fg2, ls: 2 }),
      T('STUDIOS', 344, 20, 70, 16, { size: 10, weight: 700, fill: P.fg2, ls: 2 }),
      T('+ NEW PROJECT', W - 164, 18, 140, 20, { size: 10, weight: 700, fill: P.acid, ls: 2 }),
      F(W - 44, 14, 28, 28, P.ph1, { r: 14 }),
    ],
  }));

  // Big discover header
  children.push(F(32, 72, W - 64, 100, P.bg, {
    ch: [
      T('847\nPROJECTS', 0, 0, 400, 90, { size: 68, weight: 900, fill: P.white, ls: -3, lh: 72 }),
      T('SORTED BY: RECENT ▾', 0, 68, 260, 20, {
        size: 10, weight: 700, fill: P.fg3, ls: 2,
      }),
      // Category filters
      ...['ALL', 'BRANDING', 'DIGITAL', 'MOTION', 'PRINT', 'SPATIAL', 'EXPERIMENTAL'].map((cat, i) => {
        const isActive = i === 0;
        const w = cat.length * 8 + 28;
        let x = 420;
        const offsets = [0, 60, 148, 224, 300, 364, 450];
        return F(420 + offsets[i], 36, w, 30, isActive ? P.acid : P.surface2, {
          r: 2,
          ch: [T(cat, 0, 8, w, 14, { size: 9, weight: 700, fill: isActive ? P.acidText : P.fg2, ls: 2, align: 'center' })],
        });
      }),
    ],
  }));

  // Divider
  children.push(Divider(0, 170, W, 2, P.border));

  // ── Masonry-style grid ──
  // Row 1: 4 columns
  const col1 = [
    { h: 200, tags: ['TYPE'], studio: 'Bureau Creatif',   title: 'Neon Gothic\nType Revival' },
    { h: 240, tags: ['WEB'],  studio: 'Troa Studio',      title: 'Silencio\nClub OS' },
    { h: 200, tags: ['BRAND'],studio: 'Good Fella',       title: 'Foudre\nSocial Presence' },
    { h: 240, tags: ['UI'],   studio: 'TinyWins',         title: 'Joby App\nv3 Launch' },
  ];

  const colW = 342;
  col1.forEach((item, i) => {
    const x = 32 + i * (colW + 16);
    children.push(F(x, 186, colW, item.h, P.ph1, {
      r: 4,
      ch: [
        Badge(12, 12, item.tags[0]),
        T(item.title, 12, item.h - 60, colW - 24, 40, { size: 15, weight: 900, fill: P.white, ls: -0.5, lh: 20 }),
        T(item.studio, 12, item.h - 20, 200, 14, { size: 8, fill: P.fg2, ls: 1.5 }),
      ],
    }));
  });

  // Row 2: different heights (masonry feel)
  const col2 = [
    { h: 190, tags: ['MOTION'], studio: 'Locomotive®',     title: 'Banco Diablo\nCampaign' },
    { h: 150, tags: ['PRINT'],  studio: 'Atlas Paper Co.',  title: 'Offshore\nAnnual Report' },
    { h: 190, tags: ['SPATIAL'],studio: 'Terrain Studio',  title: 'The Grid\nInstallation' },
    { h: 150, tags: ['WEB'],    studio: 'Made Bureau',      title: 'Matter\nLanding Page' },
  ];

  col2.forEach((item, i) => {
    const x = 32 + i * (colW + 16);
    children.push(F(x, 402 + (i % 2) * 0, colW, item.h, P.surface2, {
      r: 4, stroke: P.border,
      ch: [
        Badge(12, 12, item.tags[0]),
        T(item.title, 12, item.h - 58, colW - 24, 38, { size: 15, weight: 900, fill: P.white, ls: -0.5, lh: 20 }),
        T(item.studio, 12, item.h - 20, 200, 14, { size: 8, fill: P.fg2, ls: 1.5 }),
      ],
    }));
  });

  // Row 3: feature strip + 2 small
  children.push(F(32, 620, 694, 220, P.acidDim, {
    r: 4, stroke: P.acid, sw: 1,
    ch: [
      Badge(20, 20, 'FEATURED STUDIO'),
      T('LOCOMOTIVE®', 20, 54, 400, 80, { size: 52, weight: 900, fill: P.acid, ls: -2 }),
      T('Montreal-based digital agency. 12 Awwwards. 847 collaborators.', 20, 140, 620, 18,
        { size: 10, fill: P.fg2, ls: 0.5 }),
      T('VIEW ALL WORK →', 20, 172, 240, 18, { size: 10, weight: 700, fill: P.acid, ls: 2 }),
    ],
  }));

  children.push(F(742, 620, 310, 100, P.surface2, {
    r: 4, stroke: P.border,
    ch: [
      Badge(12, 12, 'AWARDED'),
      T('Awwwards SOTD\nMarch 2026', 12, 38, 280, 40, { size: 16, weight: 900, fill: P.white, ls: -0.5, lh: 22 }),
    ],
  }));

  children.push(F(742, 736, 310, 100, P.surface2, {
    r: 4, stroke: P.border,
    ch: [
      Badge(12, 12, 'TRENDING', P.surface3, P.orange),
      T('15 new brutalist\nprojects this week', 12, 38, 280, 40, { size: 16, weight: 900, fill: P.white, ls: -0.5, lh: 22 }),
    ],
  }));

  children.push(F(1068, 620, 340, 220, P.ph1, {
    r: 4,
    ch: [
      Badge(12, 12, 'EXPERIMENTAL'),
      T('The Invisible\nBrand', 12, 150, 300, 50, { size: 26, weight: 900, fill: P.white, ls: -1, lh: 32 }),
      T('Zero Studio · 2026', 12, 200, 200, 14, { size: 8, fill: P.fg2, ls: 1.5 }),
    ],
  }));

  return { id: uid(), type: 'frame', x: 0, y: 0, width: W, height: H, fill: P.bg, clip: true, children };
}

// ── Screen 4: Studio Profile ──────────────────────────────────────────────────
function makeStudio() {
  const W = 1440, H = 960;
  const children = [];

  children.push(F(0, 0, W, H, P.bg));

  // Nav
  children.push(F(0, 0, W, 56, P.bg, {
    stroke: P.border, sw: 1,
    ch: [
      T('BRUUT', 32, 16, 100, 28, { size: 22, weight: 900, fill: P.white, ls: -1 }),
      T('← BACK TO DISCOVER', 180, 20, 220, 16, { size: 9, weight: 700, fill: P.fg2, ls: 2 }),
      T('+ NEW PROJECT', W - 164, 18, 140, 20, { size: 10, weight: 700, fill: P.acid, ls: 2 }),
      F(W - 44, 14, 28, 28, P.ph1, { r: 14 }),
    ],
  }));

  // ── Studio header ──
  children.push(F(0, 56, W, 220, P.surface, {
    ch: [
      // Studio logo placeholder
      F(32, 36, 80, 80, P.acid, {
        r: 4,
        ch: [T('L', 0, 10, 80, 60, { size: 44, weight: 900, fill: P.acidText, align: 'center' })],
      }),
      T('LOCOMOTIVE®', 130, 40, 400, 50, { size: 36, weight: 900, fill: P.white, ls: -1.5 }),
      T('Digital-First Design Agency · Montreal, QC', 130, 90, 500, 20, { size: 11, fill: P.fg2, ls: 1 }),
      Badge(130, 118, 'PRO STUDIO'),
      Badge(224, 118, 'AWWWARDS MEMBER', P.surface3, P.fg2),
      // Stats
      ...[
        ['47', 'PROJECTS'],
        ['12', 'AWARDS'],
        ['1,200+', 'FOLLOWERS'],
        ['2019', 'MEMBER SINCE'],
      ].map(([val, label], i) => F(32 + i * 220 + (i > 0 ? 200 : 0), 150, 180, 60, P.surface, {
        ch: [
          T(val,   i === 0 ? 130 : 0, 4, 180, 34, { size: 28, weight: 900, fill: i === 0 ? P.acid : P.white, ls: -1 }),
          T(label, i === 0 ? 130 : 0, 38, 180, 14, { size: 8, weight: 700, fill: P.fg3, ls: 2 }),
        ],
      })),
      // Follow button
      F(W - 200, 60, 168, 40, P.acid, {
        r: 2,
        ch: [T('FOLLOW STUDIO', 0, 12, 168, 16, { size: 10, weight: 700, fill: P.acidText, align: 'center', ls: 1.5 })],
      }),
      F(W - 200, 112, 168, 36, P.surface2, {
        r: 2, stroke: P.border,
        ch: [T('SHARE PROFILE', 0, 10, 168, 16, { size: 10, weight: 700, fill: P.fg2, align: 'center', ls: 1.5 })],
      }),
    ],
  }));

  // Divider
  children.push(Divider(0, 276, W, 2, P.border));

  // ── Two-column layout ──
  // Left: work grid (bento)
  const works = [
    { w: 440, h: 200, title: 'Banco Diablo Rebrand',    tags: ['BRAND', 'MOTION'] },
    { w: 210, h: 200, title: 'Aupale\nVodka',            tags: ['WEB'] },
    { w: 210, h: 200, title: 'Aventura\nDental',         tags: ['UX'] },
    { w: 660, h: 160, title: 'Foudre Social Club — Identity System 2026', tags: ['TYPE', 'BRAND'] },
  ];

  let gy = 296;
  let gx = 32;
  works.forEach((item, i) => {
    children.push(F(gx, gy, item.w, item.h, P.ph1, {
      r: 4,
      ch: [
        ...(item.tags.map((t, ti) => Badge(12, 12, t, P.acid, P.acidText))),
        T(item.title, 12, item.h - 52, item.w - 24, 38,
          { size: i === 0 ? 18 : 14, weight: 900, fill: P.white, ls: -0.5, lh: 22 }),
      ],
    }));
    gx += item.w + 16;
    if (i === 0 || i === 2) { gx = i === 0 ? 490 : 32; }
    if (i === 2) { gy += 216; gx = 32; }
  });

  // ── Right sidebar ──
  children.push(F(W - 310, 296, 278, 640, P.surface, {
    r: 4, stroke: P.border,
    ch: [
      T('ABOUT', 20, 20, 230, 14, { size: 9, weight: 700, fill: P.fg3, ls: 2 }),
      T('"We believe every pixel you add is a word you should have written. We design what we mean."', 20, 44, 238, 80,
        { size: 11, fill: P.fg2, lh: 18 }),
      Ln(20, 134, 238, P.border),
      T('SPECIALISMS', 20, 150, 230, 14, { size: 9, weight: 700, fill: P.fg3, ls: 2 }),
      ...['Brand Identity', 'Motion Systems', 'Web Design', 'Type Design', 'Spatial Experiences'].map((s, i) =>
        F(20, 172 + i * 32, 238, 26, P.surface2, {
          r: 2,
          ch: [T(s, 12, 6, 200, 14, { size: 10, fill: P.fg })],
        })
      ),
      Ln(20, 334, 238, P.border),
      T('CONTACT', 20, 350, 230, 14, { size: 9, weight: 700, fill: P.fg3, ls: 2 }),
      T('hello@locomotive.ca', 20, 372, 238, 16, { size: 11, fill: P.acid }),
      T('locomotive.ca ↗', 20, 394, 238, 16, { size: 11, fill: P.fg2 }),
      Ln(20, 420, 238, P.border),
      T('CLIENTS', 20, 436, 230, 14, { size: 9, weight: 700, fill: P.fg3, ls: 2 }),
      T('Riot Games · Ubisoft · Aupale\nBanco Diablo · Silencio · Foudre', 20, 458, 238, 40,
        { size: 10, fill: P.fg2, lh: 18 }),
    ],
  }));

  return { id: uid(), type: 'frame', x: 0, y: 0, width: W, height: H, fill: P.bg, clip: true, children };
}

// ── Screen 5: New Project ─────────────────────────────────────────────────────
function makeNewProject() {
  const W = 1440, H = 960;
  const children = [];

  children.push(F(0, 0, W, H, P.bg));

  // Nav
  children.push(F(0, 0, W, 56, P.bg, {
    stroke: P.border, sw: 1,
    ch: [
      T('BRUUT', 32, 16, 100, 28, { size: 22, weight: 900, fill: P.white, ls: -1 }),
      T('← CANCEL', W - 148, 20, 120, 16, { size: 9, weight: 700, fill: P.fg3, ls: 2 }),
    ],
  }));

  // Big heading
  children.push(F(0, 56, W, 100, P.bg, {
    ch: [
      T('NEW PROJECT', 32, 24, 800, 60, { size: 52, weight: 900, fill: P.white, ls: -2 }),
      T('STEP 01 OF 03', W - 220, 40, 200, 20, { size: 9, weight: 700, fill: P.fg3, ls: 3 }),
    ],
  }));

  children.push(Divider(0, 154, W, 2, P.border));

  // ── Form body — two columns ──
  // Left: Upload drop zone (brutalist)
  children.push(F(32, 174, 580, 380, P.surface2, {
    r: 4, stroke: P.acid, sw: 2,
    ch: [
      T('DROP MEDIA HERE', 0, 130, 580, 40, { size: 18, weight: 900, fill: P.fg3, ls: 3, align: 'center' }),
      T('OR CLICK TO UPLOAD', 0, 178, 580, 20, { size: 10, weight: 700, fill: P.fg3, ls: 2, align: 'center' }),
      T('JPG / PNG / MP4 / GIF up to 500MB', 0, 210, 580, 16, { size: 9, fill: P.fg3, ls: 1, align: 'center' }),
      // Corner tick marks (brutalist grid markers)
      Divider(0, 0, 20, 2, P.acid),
      F(0, 0, 2, 20, P.acid, {}),
      Divider(560, 0, 20, 2, P.acid),
      F(578, 0, 2, 20, P.acid, {}),
      Divider(0, 378, 20, 2, P.acid),
      F(0, 360, 2, 20, P.acid, {}),
      Divider(560, 378, 20, 2, P.acid),
      F(578, 360, 2, 20, P.acid, {}),
    ],
  }));

  // Thumbnail preview slots
  [0, 1, 2].forEach(i => {
    children.push(F(32 + i * 196, 570, 180, 120, P.surface2, {
      r: 4, stroke: P.border,
      ch: [
        T('+', 0, 40, 180, 40, { size: 24, weight: 400, fill: P.fg3, align: 'center' }),
      ],
    }));
  });

  // Right: Form fields (brutalist style)
  const fields = [
    { label: 'PROJECT TITLE', placeholder: 'Give it a name that means something' },
    { label: 'STUDIO / AUTHOR', placeholder: 'Your studio name' },
    { label: 'CLIENT NAME', placeholder: 'Who commissioned this' },
    { label: 'YEAR COMPLETED', placeholder: '2026' },
  ];

  children.push(F(644, 174, 764, 620, P.bg, {
    ch: [
      ...fields.map((f, i) => F(0, i * 110, 764, 96, P.bg, {
        ch: [
          T(f.label, 0, 0, 500, 14, { size: 9, weight: 700, fill: P.acid, ls: 2.5 }),
          F(0, 22, 764, 52, P.surface2, {
            r: 2, stroke: P.border,
            ch: [T(f.placeholder, 16, 16, 700, 20, { size: 13, fill: P.fg3 })],
          }),
        ],
      })),

      // Category selector
      F(0, 440, 764, 96, P.bg, {
        ch: [
          T('CATEGORY', 0, 0, 300, 14, { size: 9, weight: 700, fill: P.acid, ls: 2.5 }),
          F(0, 22, 764, 60, P.bg, {
            ch: [
              ...['BRANDING', 'DIGITAL', 'MOTION', 'PRINT', 'SPATIAL', 'EXPERIMENTAL'].map((cat, i) => {
                const isSelected = i === 0;
                return F(i * 126, 0, 120, 36, isSelected ? P.acid : P.surface2, {
                  r: 2,
                  ch: [T(cat, 0, 10, 120, 16, {
                    size: 9, weight: 700, fill: isSelected ? P.acidText : P.fg2, ls: 2, align: 'center',
                  })],
                });
              }),
            ],
          }),
        ],
      }),

      // Description
      F(0, 540, 764, 60, P.bg, {
        ch: [
          T('BRIEF DESCRIPTION', 0, 0, 500, 14, { size: 9, weight: 700, fill: P.acid, ls: 2.5 }),
          F(0, 22, 764, 80, P.surface2, {
            r: 2, stroke: P.border,
            ch: [T('Describe the challenge, the approach, the outcome', 16, 16, 720, 20, { size: 13, fill: P.fg3 })],
          }),
        ],
      }),
    ],
  }));

  // ── Bottom CTA bar ──
  children.push(F(0, H - 72, W, 72, P.surface, {
    stroke: P.border, sw: 1,
    ch: [
      T('SAVE AS DRAFT', 32, 26, 180, 20, { size: 10, weight: 700, fill: P.fg2, ls: 2 }),
      F(W - 250, 16, 218, 42, P.acid, {
        r: 2,
        ch: [T('CONTINUE →', 0, 13, 218, 16, { size: 11, weight: 900, fill: P.acidText, align: 'center', ls: 2 })],
      }),
      T('01 ━━━━━ 02 ────── 03', 32, 50, 300, 12, { size: 8, fill: P.fg3, ls: 2 }),
    ],
  }));

  return { id: uid(), type: 'frame', x: 0, y: 0, width: W, height: H, fill: P.bg, clip: true, children };
}

// ── Build document ──────────────────────────────────────────────────────────
const screens = [
  makeHome(),
  makeCaseStudy(),
  makeDiscover(),
  makeStudio(),
  makeNewProject(),
];

const doc = {
  version: '2.8',
  title: 'BRUUT — Typographic Brutalist Portfolio OS',
  children: screens,
};

const outPath = path.join(__dirname, 'bruut-app.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log(`✅  Wrote ${outPath}  (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
console.log(`   Screens: ${screens.length}`);
console.log(`   Palette: bg=${P.bg}  acid=${P.acid}  fg=${P.fg}`);
