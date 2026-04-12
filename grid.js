#!/usr/bin/env node
// grid.js — GRID: Generational Wealth Platform
// Heartbeat #11 — inspired by Yamauchi No.10 Family Office (y-n10.com)
// Retro pixel-grid / CRT aesthetic applied to serious financial content.
// Aesthetic: charcoal #1a1a1a, scattered pixel squares, CRT-framed elements,
//            pixel-block typography, bold white + bilingual institutional copy.

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:       '#111116',    // near-black charcoal
  surface:  '#1a1a22',    // panel surface
  panel:    '#222230',    // elevated panel
  border:   '#333344',    // panel border
  muted:    '#55556a',    // secondary text
  fg:       '#f0eeee',    // primary text
  dim:      '#aaaabc',    // dimmed text

  // Pixel dot colors — game-board scattered squares
  red:      '#cc3322',
  yellow:   '#f5c400',
  green:    '#22aa44',
  blue:     '#4499dd',
  amber:    '#d4863a',
  white:    '#ffffff',

  // CRT accent
  phosphor: '#33ff88',    // green CRT glow
  scanline: '#0a0a12',    // scanline dark strip
};

const W  = 390;  // mobile width
const H  = 844;  // mobile height
const DW = 1440; // desktop width
const DH = 900;  // desktop height

// ── Helpers ───────────────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, extra = {}) => ({
  type: 'frame', x, y, width: w, height: h, fill,
  cornerRadius: extra.r || 0,
  strokeColor: extra.stroke || null,
  strokeWidth: extra.sw || 0,
  opacity: extra.opacity !== undefined ? extra.opacity : 1,
  children: extra.children || [],
  ...extra,
});

const T = (x, y, text, size, color, extra = {}) => ({
  type: 'text', x, y, text,
  fontSize: size,
  fill: color,
  fontWeight: extra.bold ? 'bold' : (extra.weight || 'normal'),
  fontFamily: extra.mono ? 'monospace' : (extra.serif ? 'Georgia, serif' : 'system-ui, sans-serif'),
  letterSpacing: extra.tracking !== undefined ? extra.tracking : 0,
  textTransform: extra.upper ? 'uppercase' : 'none',
  opacity: extra.opacity !== undefined ? extra.opacity : 1,
  textAlign: extra.align || 'left',
  lineHeight: extra.lh || 1.3,
  width: extra.w || undefined,
});

const E = (x, y, w, h, fill, extra = {}) => ({
  type: 'ellipse', x, y, width: w, height: h, fill,
  opacity: extra.opacity !== undefined ? extra.opacity : 1,
  strokeColor: extra.stroke || null,
  strokeWidth: extra.sw || 0,
});

// Pixel square — 8x8 retro dot
const px = (x, y, color, size = 8) => F(x, y, size, size, color, { r: 0 });

// CRT frame — bordered rectangle with phosphor border
const CRT = (x, y, w, h, extra = {}) => F(x, y, w, h, extra.fill || C.surface, {
  stroke: extra.phosphor ? C.phosphor : C.border,
  sw: extra.thick ? 2 : 1,
  r: 0,
  children: extra.children || [],
});

// Scatter pixel dots across a region (decorative background pattern)
function pixelCloud(x, y, w, h, count, colors) {
  const dots = [];
  const dotColors = colors || [C.red, C.yellow, C.green, C.blue];
  // Deterministic scatter using a simple LCG
  let seed = x * 7 + y * 13;
  const lcg = () => { seed = (seed * 1664525 + 1013904223) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let i = 0; i < count; i++) {
    const dx = Math.floor(lcg() * w);
    const dy = Math.floor(lcg() * h);
    const col = dotColors[Math.floor(lcg() * dotColors.length)];
    const sz  = lcg() > 0.7 ? 12 : 8;
    dots.push(px(x + dx, y + dy, col, sz));
  }
  return dots;
}

// Pixel-block letter row (decorative "NO.10" style header)
function pixelWordmark(x, y, label) {
  return [
    CRT(x, y, 140, 36, {
      phosphor: true, thick: true,
      children: [
        T(8, 9, label, 14, C.phosphor, { mono: true, bold: true, upper: true, tracking: 4 }),
      ],
    }),
  ];
}

// Data row — mono label + value
const dataRow = (x, y, label, value, color = C.fg) => [
  T(x, y,      label.toUpperCase(), 9,  C.muted, { mono: true, tracking: 2 }),
  T(x, y + 14, value,               13, color,   { mono: true, bold: true }),
];

// Asset bar — pixel-segmented progress bar
function assetBar(x, y, w, label, pct, color) {
  const filled = Math.floor(w * pct / 100);
  const segs = [];
  const segW = 6, gap = 2, totalSeg = segW + gap;
  for (let i = 0; i * totalSeg < w; i++) {
    const sx = x + i * totalSeg;
    segs.push(F(sx, y + 14, segW, 6, i * totalSeg < filled ? color : C.border, {}));
  }
  return [
    T(x, y, label.toUpperCase(), 9, C.muted, { mono: true, tracking: 2 }),
    ...segs,
    T(x + w + 6, y + 12, `${pct}%`, 10, color, { mono: true }),
  ];
}

// ── MOBILE SCREENS ─────────────────────────────────────────────────────────────

function mHome() {
  const dots = pixelCloud(0, 0, W, H, 40, [C.red, C.yellow, C.green, C.blue]);

  const navBar = F(0, 0, W, 52, C.bg, {
    stroke: C.border, sw: 1,
    children: [
      ...pixelWordmark(16, 10, 'GRID'),
      F(W - 52, 10, 32, 32, C.panel, { r: 0,
        children: [
          F(8, 8, 16, 16, C.surface, {
            stroke: C.phosphor, sw: 1, r: 0,
            children: [ T(3, 2, 'R', 10, C.phosphor, { mono: true, bold: true }) ],
          }),
        ],
      }),
    ],
  });

  // Hero CRT card
  const heroCard = CRT(16, 68, W - 32, 160, {
    phosphor: true, thick: true,
    fill: C.surface,
    children: [
      T(12, 12, 'PORTFOLIO VALUE', 9, C.phosphor, { mono: true, tracking: 3 }),
      T(12, 28, '$4,812,650', 34, C.fg, { mono: true, bold: true }),
      T(12, 68, 'GENERATION III · FAMILY TRUST A', 9, C.muted, { mono: true, tracking: 2 }),
      // Pixel divider
      F(12, 82, W - 56, 1, C.border, {}),
      // Stats row
      ...dataRow(12,  90, '12M RETURN',   '+$284K',   C.green),
      ...dataRow(120, 90, 'DRAWDOWN',     '-2.1%',    C.red),
      ...dataRow(230, 90, 'GENERATIONS',  '3',        C.yellow),
      // Pixel-segmented sparkline
      ...(() => {
        const pts = [40, 55, 48, 62, 58, 70, 65, 72, 68, 80, 75, 88, 84, 90, 88];
        return pts.map((v, i) => F(12 + i * 22, 138 - Math.floor(v * 0.3), 18, Math.floor(v * 0.3), C.phosphor, {}));
      })(),
    ],
  });

  // Asset allocation — pixel bars
  const allocCard = CRT(16, 244, W - 32, 180, {
    fill: C.surface,
    children: [
      T(12, 12, 'ASSET ALLOCATION', 9, C.muted, { mono: true, tracking: 3 }),
      ...assetBar(12,  36,  W - 80, 'EQUITIES',       58, C.blue),
      ...assetBar(12,  72,  W - 80, 'REAL ESTATE',    22, C.yellow),
      ...assetBar(12,  108, W - 80, 'PRIVATE EQUITY', 12, C.green),
      ...assetBar(12,  144, W - 80, 'ALTERNATIVES',   8,  C.red),
    ],
  });

  // Recent events — minimal list
  const eventsCard = CRT(16, 440, W - 32, 180, {
    fill: C.surface,
    children: [
      T(12, 12, 'RECENT EVENTS', 9, C.muted, { mono: true, tracking: 3 }),
      // Event rows
      ...[[C.green, 'DIV RECEIVED',    '+ $14,200',  'VANGUARD TOTAL MKT'],
          [C.yellow,'TRUST MEETING',   'MAR 20',     'Q1 REVIEW · GEN III'],
          [C.blue,  'REBALANCE',       'PENDING',    'DRIFT +2.3%'],
          [C.red,   'TAX FILING',      'APR 15',     '2025 K-1 DISTRIBUTION'],
      ].flatMap(([col, label, val, sub], i) => [
        F(12, 36 + i * 36, 8, 8, col, {}),
        T(28, 34 + i * 36, label, 10, C.fg,   { mono: true }),
        T(28, 47 + i * 36, sub,   8,  C.muted, { mono: true }),
        T(W - 90, 34 + i * 36, val, 10, col, { mono: true }),
      ]),
    ],
  });

  // Bottom nav — pixel icons
  const tabBar = F(0, H - 64, W, 64, C.bg, {
    stroke: C.border, sw: 1,
    children: [
      ...['HOME', 'ASSETS', 'FAMILY', 'DOCS', 'YOU'].flatMap((label, i) => {
        const tx = 15 + i * (W / 5);
        const active = i === 0;
        return [
          F(tx + 8, H - 56, 16, 16, active ? C.phosphor : C.border, {}),
          T(tx, H - 34, label, 7, active ? C.phosphor : C.muted, { mono: true, tracking: 1, w: W / 5, align: 'center' }),
        ];
      }),
    ],
  });

  return {
    name: 'Mobile — Dashboard',
    type: 'frame', x: 0, y: 0,
    width: W, height: H,
    fill: C.bg,
    children: [...dots, navBar, heroCard, allocCard, eventsCard, tabBar],
  };
}

function mAssets() {
  const dots = pixelCloud(0, 200, W, 400, 25, [C.blue, C.yellow]);

  const navBar = F(0, 0, W, 52, C.bg, {
    stroke: C.border, sw: 1,
    children: [
      T(16, 18, 'ASSETS', 14, C.fg, { mono: true, bold: true, tracking: 4 }),
      T(W - 80, 20, 'ADD +', 10, C.phosphor, { mono: true, tracking: 2 }),
    ],
  });

  // Asset category tiles — bento grid
  const tiles = [
    { label: 'PUBLIC EQUITIES', value: '$2.79M', sub: '+8.4% YTD', color: C.blue,   w: W - 32,    h: 80  },
    { label: 'REAL ESTATE',     value: '$1.06M', sub: '+3.1% YTD', color: C.yellow, w: (W-40)/2,  h: 100 },
    { label: 'PRIVATE EQUITY',  value: '$578K',  sub: 'ILLIQUID',   color: C.green,  w: (W-40)/2,  h: 100 },
    { label: 'ALTERNATIVES',    value: '$385K',  sub: 'MACRO FUND', color: C.red,    w: (W-40)/2,  h: 100 },
    { label: 'CASH & EQUIV',    value: '$192K',  sub: '5.2% YIELD', color: C.amber,  w: (W-40)/2,  h: 100 },
  ];

  let ty = 64;
  const tileNodes = [];
  let row = [];
  for (const t of tiles) {
    const isWide = t.w > W / 2;
    if (isWide) {
      if (row.length) { ty += 108; row = []; }
      tileNodes.push(CRT(16, ty, t.w, t.h, {
        fill: C.surface,
        children: [
          F(12, 12, 8, 8, t.color, {}),
          T(28, 10, t.label, 9, t.color, { mono: true, tracking: 2 }),
          T(12, 28, t.value, 24, C.fg,  { mono: true, bold: true }),
          T(12, 58, t.sub,   9,  t.color, { mono: true }),
          // mini pixel bars
          ...Array.from({length: 12}, (_, i) => F(12 + i * 22, t.h - 20, 18, 8 + Math.sin(i * 0.8) * 6, t.color + '88', {})),
        ],
      }));
      ty += t.h + 8;
    } else {
      const rx = row.length === 0 ? 16 : 16 + (W - 40) / 2 + 8;
      row.push(CRT(rx, ty, t.w, t.h, {
        fill: C.surface,
        children: [
          F(12, 12, 6, 6, t.color, {}),
          T(26, 10, t.label, 8, t.color, { mono: true, tracking: 1 }),
          T(12, 26, t.value, 18, C.fg, { mono: true, bold: true }),
          T(12, 50, t.sub,   8,  t.color, { mono: true }),
        ],
      }));
      if (row.length === 2) { ty += t.h + 8; row = []; }
    }
  }

  const tabBar = F(0, H - 64, W, 64, C.bg, {
    stroke: C.border, sw: 1,
    children: [
      ...['HOME', 'ASSETS', 'FAMILY', 'DOCS', 'YOU'].flatMap((label, i) => {
        const tx = 15 + i * (W / 5);
        const active = i === 1;
        return [
          F(tx + 8, H - 56, 16, 16, active ? C.phosphor : C.border, {}),
          T(tx, H - 34, label, 7, active ? C.phosphor : C.muted, { mono: true, tracking: 1, w: W / 5, align: 'center' }),
        ];
      }),
    ],
  });

  return {
    name: 'Mobile — Assets',
    type: 'frame', x: 0, y: 0,
    width: W, height: H,
    fill: C.bg,
    children: [...dots, navBar, ...tileNodes, tabBar],
  };
}

function mFamily() {
  const dots = pixelCloud(0, 100, W, 600, 30, [C.red, C.green, C.yellow, C.blue]);

  const navBar = F(0, 0, W, 52, C.bg, {
    stroke: C.border, sw: 1,
    children: [
      T(16, 18, 'FAMILY', 14, C.fg, { mono: true, bold: true, tracking: 4 }),
    ],
  });

  // Generation header
  const genHeader = CRT(16, 60, W - 32, 40, {
    phosphor: true,
    children: [
      T(12, 12, 'GENERATION TREE · YAMAUCHI FAMILY OFFICE MODEL', 8, C.phosphor, { mono: true, tracking: 1 }),
    ],
  });

  // Gen I
  const g1Card = CRT(W / 2 - 60, 120, 120, 56, {
    fill: C.panel,
    children: [
      F(12, 12, 8, 8, C.yellow, {}),
      T(28, 10, 'GEN I', 8, C.yellow, { mono: true, tracking: 2 }),
      T(12, 26, 'FOUNDERS', 10, C.fg, { mono: true, bold: true }),
      T(12, 40, '1 MEMBER', 8, C.muted, { mono: true }),
    ],
  });

  // Connector line
  const conn1 = F(W / 2 - 1, 176, 2, 20, C.border, {});

  // Gen II row
  const g2a = CRT(40, 216, 120, 56, {
    fill: C.panel,
    children: [
      F(12, 12, 8, 8, C.blue, {}),
      T(28, 10, 'GEN II-A', 8, C.blue, { mono: true, tracking: 2 }),
      T(12, 26, 'BRANCH A', 10, C.fg, { mono: true, bold: true }),
      T(12, 40, '3 MEMBERS', 8, C.muted, { mono: true }),
    ],
  });
  const g2b = CRT(W - 160, 216, 120, 56, {
    fill: C.panel,
    children: [
      F(12, 12, 8, 8, C.green, {}),
      T(28, 10, 'GEN II-B', 8, C.green, { mono: true, tracking: 2 }),
      T(12, 26, 'BRANCH B', 10, C.fg, { mono: true, bold: true }),
      T(12, 40, '2 MEMBERS', 8, C.muted, { mono: true }),
    ],
  });

  // Horizontal connector
  const conn2h = F(100, 244, W - 200, 2, C.border, {});
  const conn2La = F(99, 196, 2, 68, C.border, {});
  const conn2Lb = F(W - 101, 196, 2, 68, C.border, {});

  // Gen III members
  const g3members = ['KENJI', 'YUKI', 'HIRO', 'SATO', 'MIKO'].map((name, i) => {
    const colors = [C.red, C.yellow, C.green, C.blue, C.amber];
    const gx = 16 + i * ((W - 32) / 5);
    return CRT(gx, 304, (W - 48) / 5, 80, {
      fill: C.surface,
      children: [
        E(((W - 48) / 5) / 2 - 16, 8, 32, 32, colors[i] + '44', { stroke: colors[i], sw: 1 }),
        T(0, 48, name, 8, colors[i], { mono: true, tracking: 1, w: (W - 48) / 5, align: 'center' }),
        T(0, 62, 'G III', 7, C.muted, { mono: true, w: (W - 48) / 5, align: 'center' }),
      ],
    });
  });

  // Distribution schedule card
  const distCard = CRT(16, 408, W - 32, 140, {
    fill: C.surface,
    children: [
      T(12, 12, 'DISTRIBUTION SCHEDULE', 9, C.muted, { mono: true, tracking: 3 }),
      ...[['Q1 2026', '$82,500/member', C.phosphor],
          ['Q2 2026', '$82,500/member', C.muted],
          ['Q3 2026', 'TBD · VOTE REQ', C.muted],
          ['Q4 2026', 'TBD · VOTE REQ', C.muted],
      ].flatMap(([q, amt, col], i) => [
        F(12, 32 + i * 26, 6, 6, col, {}),
        T(26, 30 + i * 26, q, 10, C.fg, { mono: true }),
        T(W - 140, 30 + i * 26, amt, 9, col, { mono: true }),
      ]),
    ],
  });

  // Governance panel
  const govCard = CRT(16, 564, W - 32, 100, {
    fill: C.surface,
    children: [
      T(12, 12, 'NEXT GOVERNANCE EVENT', 9, C.muted, { mono: true, tracking: 3 }),
      T(12, 32, 'ANNUAL FAMILY ASSEMBLY', 14, C.fg, { mono: true, bold: true }),
      T(12, 52, 'MARCH 20, 2026 · 10:00 JST', 10, C.yellow, { mono: true }),
      T(12, 68, '12 MEMBERS · QUORUM: 8', 9, C.muted, { mono: true }),
    ],
  });

  const tabBar = F(0, H - 64, W, 64, C.bg, {
    stroke: C.border, sw: 1,
    children: [
      ...['HOME', 'ASSETS', 'FAMILY', 'DOCS', 'YOU'].flatMap((label, i) => {
        const tx = 15 + i * (W / 5);
        const active = i === 2;
        return [
          F(tx + 8, H - 56, 16, 16, active ? C.phosphor : C.border, {}),
          T(tx, H - 34, label, 7, active ? C.phosphor : C.muted, { mono: true, tracking: 1, w: W / 5, align: 'center' }),
        ];
      }),
    ],
  });

  return {
    name: 'Mobile — Family Tree',
    type: 'frame', x: 0, y: 0,
    width: W, height: H,
    fill: C.bg,
    children: [
      ...dots, navBar, genHeader, g1Card, conn1,
      conn2h, conn2La, conn2Lb, g2a, g2b,
      ...g3members, distCard, govCard, tabBar,
    ],
  };
}

function mDocs() {
  const dots = pixelCloud(0, 0, W, H, 20, [C.amber, C.blue]);

  const navBar = F(0, 0, W, 52, C.bg, {
    stroke: C.border, sw: 1,
    children: [
      T(16, 18, 'DOCUMENTS', 14, C.fg, { mono: true, bold: true, tracking: 4 }),
      T(W - 70, 20, 'SEARCH', 9, C.muted, { mono: true, tracking: 2 }),
    ],
  });

  // Doc categories — CRT-framed filter row
  const filterBar = F(16, 60, W - 32, 32, C.panel, {
    stroke: C.border, sw: 1,
    children: [
      ...['ALL', 'TRUST', 'TAX', 'LEGAL', 'REPORTS'].map((label, i) => {
        const active = i === 0;
        return F(8 + i * 68, 4, 60, 24, active ? C.phosphor : 'transparent', {
          r: 0,
          children: [
            T(0, 6, label, 8, active ? C.bg : C.muted, { mono: true, tracking: 1, w: 60, align: 'center' }),
          ],
        });
      }),
    ],
  });

  // Document list
  const docs = [
    { icon: C.yellow, type: 'TRUST',  name: 'FAMILY TRUST AGREEMENT 2024',  date: '2024-12-01', pages: 48 },
    { icon: C.red,    type: 'TAX',    name: 'K-1 PARTNERSHIP STATEMENTS',    date: '2025-03-15', pages: 12 },
    { icon: C.blue,   type: 'LEGAL',  name: 'SUCCESSION PLAN REVISION 3',   date: '2025-01-22', pages: 94 },
    { icon: C.green,  type: 'REPORT', name: 'Q4 2025 PERFORMANCE REVIEW',   date: '2026-01-10', pages: 28 },
    { icon: C.amber,  type: 'LEGAL',  name: 'INVESTMENT POLICY STATEMENT',  date: '2025-06-30', pages: 32 },
    { icon: C.red,    type: 'TAX',    name: 'CHARITABLE TRUST SCHEDULE',    date: '2025-04-01', pages: 8  },
  ].map((doc, i) => CRT(16, 108 + i * 92, W - 32, 84, {
    fill: C.surface,
    children: [
      // File type badge
      F(12, 12, 48, 18, doc.icon + '22', {
        stroke: doc.icon, sw: 1,
        children: [ T(0, 3, doc.type, 7, doc.icon, { mono: true, tracking: 1, w: 48, align: 'center' }) ],
      }),
      T(68, 12, doc.name, 9, C.fg, { mono: true, bold: true, w: W - 120 }),
      T(68, 30, doc.date, 8, C.muted, { mono: true }),
      T(68, 44, `${doc.pages} PAGES`, 8, C.muted, { mono: true }),
      // Download pixel icon
      F(W - 56, 12, 32, 32, C.panel, {
        stroke: C.border, sw: 1,
        children: [
          F(12, 8, 8, 8, doc.icon, {}),
          F(12, 18, 8, 6, doc.icon + '88', {}),
        ],
      }),
    ],
  }));

  const tabBar = F(0, H - 64, W, 64, C.bg, {
    stroke: C.border, sw: 1,
    children: [
      ...['HOME', 'ASSETS', 'FAMILY', 'DOCS', 'YOU'].flatMap((label, i) => {
        const tx = 15 + i * (W / 5);
        const active = i === 3;
        return [
          F(tx + 8, H - 56, 16, 16, active ? C.phosphor : C.border, {}),
          T(tx, H - 34, label, 7, active ? C.phosphor : C.muted, { mono: true, tracking: 1, w: W / 5, align: 'center' }),
        ];
      }),
    ],
  });

  return {
    name: 'Mobile — Documents',
    type: 'frame', x: 0, y: 0,
    width: W, height: H,
    fill: C.bg,
    children: [...dots, navBar, filterBar, ...docs, tabBar],
  };
}

// ── DESKTOP ────────────────────────────────────────────────────────────────────

function dDashboard() {
  const dots = pixelCloud(0, 0, DW, DH, 80, [C.red, C.yellow, C.green, C.blue]);

  const sidebar = F(0, 0, 240, DH, C.surface, {
    stroke: C.border, sw: 1,
    children: [
      // Logo lockup
      F(20, 20, 200, 48, C.panel, {
        stroke: C.phosphor, sw: 2,
        children: [
          T(12, 14, 'GRID', 22, C.phosphor, { mono: true, bold: true, tracking: 6 }),
          T(12, 36, 'WEALTH PLATFORM', 7, C.muted, { mono: true, tracking: 2 }),
        ],
      }),

      // Scanline effect strip
      F(0, 74, 240, 4, C.scanline, {}),

      // Nav items
      ...['PORTFOLIO', 'ASSETS', 'FAMILY', 'DOCUMENTS', 'REPORTS', 'SETTINGS'].map((label, i) => {
        const active = i === 0;
        return F(0, 90 + i * 48, 240, 40, active ? C.panel : 'transparent', {
          stroke: active ? C.phosphor : null, sw: active ? 1 : 0,
          children: [
            F(16, 14, 8, 8, active ? C.phosphor : C.border, {}),
            T(34, 12, label, 10, active ? C.phosphor : C.muted, { mono: true, tracking: 2 }),
          ],
        });
      }),

      // Generation indicator
      CRT(16, DH - 100, 208, 60, {
        phosphor: true,
        children: [
          T(12, 10, 'ACTIVE SESSION', 8, C.phosphor, { mono: true, tracking: 2 }),
          T(12, 26, 'KENJI Y.', 12, C.fg, { mono: true, bold: true }),
          T(12, 42, 'GENERATION III · TRUSTEE', 8, C.muted, { mono: true }),
        ],
      }),
    ],
  });

  // Main content
  const main = F(240, 0, DW - 240, DH, C.bg, {
    children: [
      // Top bar
      F(0, 0, DW - 240, 52, C.surface, {
        stroke: C.border, sw: 1,
        children: [
          T(24, 18, 'PORTFOLIO OVERVIEW — Q1 2026', 11, C.muted, { mono: true, tracking: 3 }),
          T(DW - 400, 18, 'LAST SYNC: 09:41:22 JST', 9, C.phosphor, { mono: true }),
          T(DW - 270, 18, 'MARCH 18, 2026', 9, C.muted, { mono: true }),
        ],
      }),

      // KPI row
      ...([
        ['TOTAL AUM',     '$4,812,650', '+6.2%',  C.phosphor],
        ['ANNUAL RETURN', '$284,120',   '+8.4%',  C.green],
        ['DISTRIBUTIONS', '$330,000',   'YTD',    C.yellow],
        ['NEXT MEETING',  'MAR 20',     '2 DAYS', C.amber],
      ].map(([label, value, sub, color], i) =>
        CRT(24 + i * 262, 68, 246, 90, {
          fill: C.surface,
          children: [
            T(12, 12, label, 9, C.muted, { mono: true, tracking: 2 }),
            T(12, 28, value, 22, C.fg, { mono: true, bold: true }),
            T(12, 60, sub,   10, color, { mono: true }),
            F(180, 12, 8, 8, color, {}),
          ],
        })
      )),

      // Large allocation chart area
      CRT(24, 174, 540, DH - 222, {
        fill: C.surface,
        children: [
          T(12, 12, 'ASSET ALLOCATION · LIVE', 9, C.muted, { mono: true, tracking: 3 }),
          // Pixel-segmented vertical bars (chart)
          ...(['EQUITIES', 'REAL EST', 'PRIV EQ', 'ALTS', 'CASH'].map((label, i) => {
            const vals  = [58, 22, 12, 5, 3];
            const cols  = [C.blue, C.yellow, C.green, C.red, C.amber];
            const barH  = Math.floor((DH - 350) * vals[i] / 100);
            const bx    = 40 + i * 96;
            const by    = DH - 320;
            return [
              // Bar made of 8px pixel segments
              ...Array.from({ length: Math.floor(barH / 10) }, (_, j) =>
                F(bx, by - j * 10, 48, 8, cols[i] + (j % 2 === 0 ? 'cc' : '88'), {})
              ),
              T(bx, by + 8,  `${vals[i]}%`, 10, cols[i], { mono: true }),
              T(bx - 4, by + 22, label, 8, C.muted, { mono: true }),
            ];
          })).flat(),
        ],
      }),

      // Events + Performance column
      CRT(580, 174, DW - 240 - 604, 200, {
        fill: C.surface,
        children: [
          T(12, 12, 'UPCOMING EVENTS', 9, C.muted, { mono: true, tracking: 3 }),
          ...[['MAR 20', 'FAMILY ASSEMBLY', C.yellow],
              ['APR 15', 'TAX FILING DL',   C.red],
              ['APR 30', 'Q1 CLOSE',         C.green],
              ['MAY 01', 'DISTRIBUTION',     C.phosphor],
          ].flatMap(([date, label, col], i) => [
            F(12, 32 + i * 36, 6, 6, col, {}),
            T(26, 30 + i * 36, date,  9,  col,    { mono: true }),
            T(80, 30 + i * 36, label, 9,  C.fg,   { mono: true }),
          ]),
        ],
      }),
      CRT(580, 390, DW - 240 - 604, DH - 438, {
        fill: C.surface,
        children: [
          T(12, 12, 'PERFORMANCE SINCE INCEPTION', 9, C.muted, { mono: true, tracking: 3 }),
          // Pixel sparkline (big)
          ...(() => {
            const vals = [20, 30, 25, 40, 38, 55, 50, 68, 60, 80, 72, 90, 85, 95, 92];
            const sw = Math.floor((DW - 240 - 628) / vals.length);
            return vals.map((v, i) =>
              F(12 + i * sw, 180 - Math.floor(v * 1.4), sw - 2, Math.floor(v * 1.4), C.phosphor + (i % 2 === 0 ? 'cc' : '66'), {})
            );
          })(),
          T(12, 188, '2020', 8, C.muted, { mono: true }),
          T(DW - 240 - 650, 188, '2026', 8, C.muted, { mono: true }),
        ],
      }),
    ],
  });

  return {
    name: 'Desktop — Portfolio',
    type: 'frame', x: 0, y: 0,
    width: DW, height: DH,
    fill: C.bg,
    children: [...dots, sidebar, main],
  };
}

function dAssets() {
  const dots = pixelCloud(0, 0, DW, DH, 60, [C.blue, C.yellow, C.green]);

  const sidebar = F(0, 0, 240, DH, C.surface, {
    stroke: C.border, sw: 1,
    children: [
      F(20, 20, 200, 48, C.panel, {
        stroke: C.phosphor, sw: 2,
        children: [
          T(12, 14, 'GRID', 22, C.phosphor, { mono: true, bold: true, tracking: 6 }),
          T(12, 36, 'WEALTH PLATFORM', 7, C.muted, { mono: true, tracking: 2 }),
        ],
      }),
      F(0, 74, 240, 4, C.scanline, {}),
      ...['PORTFOLIO', 'ASSETS', 'FAMILY', 'DOCUMENTS', 'REPORTS', 'SETTINGS'].map((label, i) => {
        const active = i === 1;
        return F(0, 90 + i * 48, 240, 40, active ? C.panel : 'transparent', {
          stroke: active ? C.phosphor : null, sw: active ? 1 : 0,
          children: [
            F(16, 14, 8, 8, active ? C.phosphor : C.border, {}),
            T(34, 12, label, 10, active ? C.phosphor : C.muted, { mono: true, tracking: 2 }),
          ],
        });
      }),
      CRT(16, DH - 100, 208, 60, {
        phosphor: true,
        children: [
          T(12, 10, 'ACTIVE SESSION', 8, C.phosphor, { mono: true, tracking: 2 }),
          T(12, 26, 'KENJI Y.', 12, C.fg, { mono: true, bold: true }),
          T(12, 42, 'GENERATION III · TRUSTEE', 8, C.muted, { mono: true }),
        ],
      }),
    ],
  });

  // Holdings table
  const main = F(240, 0, DW - 240, DH, C.bg, {
    children: [
      F(0, 0, DW - 240, 52, C.surface, {
        stroke: C.border, sw: 1,
        children: [
          T(24, 18, 'ASSET HOLDINGS — FULL REGISTER', 11, C.muted, { mono: true, tracking: 3 }),
          F(DW - 380, 14, 120, 26, C.phosphor, {
            children: [ T(0, 6, 'ADD HOLDING +', 9, C.bg, { mono: true, tracking: 1, w: 120, align: 'center' }) ],
          }),
        ],
      }),

      // Table header
      F(24, 60, DW - 288, 32, C.panel, {
        stroke: C.border, sw: 1,
        children: [
          ...(['HOLDING', 'TYPE', 'VALUE', 'COST BASIS', 'GAIN/LOSS', 'YIELD', 'STATUS']).map((h, i) => {
            const cols = [0, 220, 340, 460, 580, 690, 780];
            return T(cols[i] + 12, 10, h, 8, C.muted, { mono: true, tracking: 2 });
          }),
        ],
      }),

      // Holdings rows
      ...([
        ['VANGUARD TOTAL MKT', 'EQUITY', '$1,240,000', '$980,000',  '+$260K', '1.8%', C.green  ],
        ['APPLE INC',          'EQUITY', '$480,000',   '$320,000',  '+$160K', '0.5%', C.green  ],
        ['MICROSOFT CORP',     'EQUITY', '$390,000',   '$280,000',  '+$110K', '0.9%', C.green  ],
        ['BLACKROCK REIT',     'REAL EST','$680,000',  '$580,000',  '+$100K', '4.2%', C.yellow ],
        ['TOKYO PROPERTY I',   'REAL EST','$380,000',  '$350,000',  '+$30K',  '3.8%', C.yellow ],
        ['SEQUOIA FUND VIII',  'PRIV EQ', '$320,000',  '$300,000',  'ILLIQ',  '—',    C.muted  ],
        ['MACRO FUND LP',      'ALTS',    '$240,000',  '$220,000',  '+$20K',  '—',    C.amber  ],
        ['TREASURY BILLS',     'CASH EQ', '$192,000',  '$192,000',  '+$6K',   '5.2%', C.phosphor],
      ].map(([name, type, val, cost, gl, yield_, col], i) =>
        F(24, 92 + i * 44, DW - 288, 40, i % 2 === 0 ? C.surface : C.bg, {
          stroke: C.border, sw: 1,
          children: [
            F(12, 14, 6, 6, col, {}),
            T(24, 12, name, 10, C.fg, { mono: true, bold: true }),
            T(232, 12, type, 9, C.muted, { mono: true }),
            T(352, 12, val,  10, C.fg, { mono: true }),
            T(472, 12, cost, 10, C.muted, { mono: true }),
            T(592, 12, gl,   10, col, { mono: true }),
            T(702, 12, yield_, 10, C.muted, { mono: true }),
            F(792, 8, 56, 22, col + '22', {
              stroke: col, sw: 1,
              children: [ T(0, 5, 'VIEW', 8, col, { mono: true, w: 56, align: 'center' }) ],
            }),
          ],
        })
      )),
    ],
  });

  return {
    name: 'Desktop — Holdings',
    type: 'frame', x: 0, y: 0,
    width: DW, height: DH,
    fill: C.bg,
    children: [...dots, sidebar, main],
  };
}

// ── Assemble document ─────────────────────────────────────────────────────────
const screens = [mHome(), mAssets(), mFamily(), mDocs(), dDashboard(), dAssets()];

const pen = {
  version: '2.8',
  children: screens,
};

const outPath = path.join(__dirname, 'grid.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));

const size = (fs.statSync(outPath).size / 1024).toFixed(1);
console.log(`✓ Written: grid.pen (${size} KB)`);
console.log(`  Screens: ${screens.map(s => s.name).join(', ')}`);
console.log(`  Palette: charcoal bg, phosphor green CRT, pixel dot scatter`);
console.log(`  Inspiration: Yamauchi No.10 Family Office — y-n10.com`);
