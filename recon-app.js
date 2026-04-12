'use strict';
// recon-app.js
// RECON — AI-Powered Competitive Intelligence Platform
//
// Challenge: Design a dark-mode competitive intelligence dashboard inspired by:
// 1. Superset.sh (darkmodedesign.com) — terminal-aesthetic multi-agent bento UI,
//    deep near-black bg #070B12, electric violet accent, parallel workflow cards
// 2. Linear (darkmodedesign.com) — near-black, systematic product UI, indigo accents,
//    clean information density
// 3. Midday.ai (land-book.com) — "run without manual work" AI-first financial philosophy,
//    minimal dark aesthetic with real-time data
//
// Palette: Deep navy-black + electric indigo + cyan signal system
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#070B12',
  surface:  '#0D1320',
  surface2: '#111B2C',
  surface3: '#162235',
  border:   '#1C2940',
  border2:  '#243450',
  muted:    '#445A7A',
  muted2:   '#627A9E',
  fg:       '#E8F0FC',
  accent:   '#6366F1',
  accent2:  '#818CF8',
  cyan:     '#22D3EE',
  green:    '#34D399',
  amber:    '#FBBF24',
  red:      '#F87171',
  violet:   '#A78BFA',
  dim:      '#0A1018',
};

let _id = 0;
const uid = () => `rc${++_id}`;

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

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Line = (x, y, w, fill = P.border) => F(x, y, w, 1, fill, {});

// ── Glow effect ───────────────────────────────────────────────────────────────
const Glow = (cx, cy, r, color) => [
  E(cx - r*2.5, cy - r*2.5, r*5,   r*5,   color + '03'),
  E(cx - r*1.6, cy - r*1.6, r*3.2, r*3.2, color + '08'),
  E(cx - r,     cy - r,     r*2,   r*2,   color + '12'),
  E(cx - r*0.5, cy - r*0.5, r,     r,     color + '1A'),
];

// ── Status dot ────────────────────────────────────────────────────────────────
const Dot = (x, y, color) => [
  E(x - 4, y - 4, 12, 12, color + '28'),
  E(x, y, 5, 5, color),
];

// ── Pill badge ────────────────────────────────────────────────────────────────
const Pill = (x, y, label, color) => {
  const w = Math.max(label.length * 6.2 + 18, 36);
  return F(x, y, w, 20, color + '1E', {
    r: 10,
    ch: [T(label, 0, 4, w, 12, { size: 9, fill: color, weight: 700, ls: 0.5, align: 'center' })],
  });
};

// ── Sparkline bars ────────────────────────────────────────────────────────────
const Sparkline = (x, y, w, h, data, color) => {
  const maxV = Math.max(...data, 1);
  const minV = Math.min(...data);
  const range = maxV - minV || 1;
  const barW = Math.max(Math.floor((w - 4) / data.length) - 1, 2);
  return data.map((v, i) => {
    const bh = Math.max(Math.round(((v - minV) / range) * (h - 4)), 2);
    const isLast = i === data.length - 1;
    return F(x + 2 + i * (barW + 2), y + h - bh, barW, bh,
      isLast ? color : color + '55', { r: 1 });
  });
};

// ── Signal bars ───────────────────────────────────────────────────────────────
const SignalBars = (x, y, strength, color) => [3, 6, 10, 14].map((h, i) => {
  const active = i < strength;
  return F(x + i * 7, y + (14 - h), 5, h, active ? color : P.border2, { r: 1 });
});

// ── Trend badge ───────────────────────────────────────────────────────────────
const TrendBadge = (x, y, pct, up) => {
  const color = up ? P.green : P.red;
  const label = `${up ? '↑' : '↓'}${Math.abs(pct)}%`;
  const w = label.length * 7 + 16;
  return F(x, y, w, 20, color + '18', {
    r: 10,
    ch: [T(label, 0, 4, w, 12, { size: 9, fill: color, weight: 700, align: 'center' })],
  });
};

// ── Bottom nav ────────────────────────────────────────────────────────────────
const BottomNav = (active) => {
  const tabs = [['◈','Home',0],['⊛','Rivals',1],['◉','Feed',2],['▦','Reports',3],['⊡','Sources',4]];
  return F(0, 780, 390, 64, P.dim, {
    ch: [
      Line(0, 0, 390, P.border),
      ...tabs.map(([ic, lb, j]) => {
        const isActive = j === active;
        return F(j * 78, 0, 78, 64, 'transparent', {
          ch: [
            T(ic, 0, 10, 78, 18, { size: 15, fill: isActive ? P.accent : P.muted, align: 'center' }),
            T(lb, 0, 30, 78, 11, { size: 9, fill: isActive ? P.accent2 : P.muted, weight: isActive ? 600 : 400, ls: 0.3, align: 'center' }),
            ...(isActive ? [F(27, 58, 24, 2, P.accent, { r: 1 })] : []),
          ],
        });
      }),
    ],
  });
};

// ── Status bar ────────────────────────────────────────────────────────────────
const StatusBar = () => F(0, 0, 390, 44, P.bg, {
  ch: [
    T('9:41', 16, 14, 60, 16, { size: 12, fill: P.fg, weight: 600 }),
    T('●●●', 320, 14, 54, 16, { size: 9, fill: P.fg, opacity: 0.6 }),
  ],
});

// ── Page header ───────────────────────────────────────────────────────────────
const PageHeader = (title, sub, y = 44) => F(0, y, 390, 56, P.bg, {
  ch: [
    T(title, 20, 8, 280, 22, { size: 18, fill: P.fg, weight: 800, ls: -0.3 }),
    ...(sub ? [T(sub, 20, 32, 280, 13, { size: 9, fill: P.muted2, ls: 0.3 })] : []),
  ],
});

// ── Live chip ─────────────────────────────────────────────────────────────────
const LiveChip = (x, y) => [
  F(x, y, 52, 20, P.cyan + '18', {
    r: 10,
    ch: [
      E(x + 8, y + 7, 6, 6, P.cyan),
      T('LIVE', x + 18, y + 4, 34, 12, { size: 8, fill: P.cyan, weight: 700, ls: 1.2 }),
    ],
  }),
];

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = (x, y, w, h, label, value, sub, color, spark) => {
  const ch = [
    T(label.toUpperCase(), 12, 10, w - 24, 10, { size: 8, fill: P.muted, ls: 1.4, weight: 700 }),
    T(value, 12, 24, w - 28, 30, { size: 24, fill: color, weight: 800, ls: -0.5 }),
    T(sub, 12, 56, w - 24, 11, { size: 9, fill: P.muted2 }),
    ...(spark ? Sparkline(w - 56, h - 30, 48, 22, spark, color) : []),
  ];
  return F(x, y, w, h, P.surface, { r: 14, stroke: P.border, sw: 1, ch });
};

// ─────────────────────────────────────────────────────────────────────────────
//  SCREEN 1 — Overview (Bento Grid Dashboard)
// ─────────────────────────────────────────────────────────────────────────────
function buildOverview() {
  const W = 390, H = 844;
  const ch = [];

  ch.push(F(0, 0, W, H, P.bg));
  ch.push(...Glow(195, 180, 120, P.accent));
  ch.push(...Glow(340, 500, 80, P.cyan));

  ch.push(StatusBar());

  // Brand header
  ch.push(F(0, 44, W, 60, P.bg, {
    ch: [
      T('RECON', 20, 8, 200, 26, { size: 22, fill: P.fg, weight: 900, ls: 3 }),
      T('INTELLIGENCE PLATFORM', 20, 36, 200, 12, { size: 8, fill: P.muted, ls: 2.5, weight: 600 }),
      ...LiveChip(318, 52),
    ],
  }));

  // ── Row 1: Two stat cards ─────────────────────────────────────────────
  ch.push(StatCard(16, 112, 174, 92, 'Rivals', '24', 'across 8 industries', P.cyan,
    [40, 44, 48, 45, 52, 55, 58, 56, 60, 62, 62, 62]));
  ch.push(StatCard(200, 112, 174, 92, 'Signals', '137', 'in last 24h', P.accent,
    [90, 85, 102, 96, 112, 122, 108, 118, 130, 127, 133, 137]));

  // ── Threat index wide card ────────────────────────────────────────────
  ch.push(F(16, 212, 358, 98, P.surface, {
    r: 14, stroke: P.border, sw: 1,
    ch: [
      T('MARKET THREAT INDEX', 14, 12, 200, 10, { size: 8, fill: P.muted, ls: 1.4, weight: 700 }),
      T('6.4', 14, 26, 80, 36, { size: 30, fill: P.amber, weight: 900, ls: -1 }),
      T('/ 10', 74, 46, 50, 16, { size: 12, fill: P.muted2 }),
      TrendBadge(220, 20, 12, true),
      T('↑ 0.8 pts from last week', 14, 64, 220, 12, { size: 9, fill: P.amber }),
      // Progress bar bg
      F(14, 80, 330, 6, P.border2, { r: 3 }),
      // Progress bar fill
      F(14, 80, 211, 6, P.amber, { r: 3 }),
      // Marker ticks
      F(125, 77, 1, 12, P.bg, {}),
      F(211, 77, 1, 12, P.bg + 'CC', {}),
    ],
  }));

  // ── Top movers card ───────────────────────────────────────────────────
  const movers = [
    { name: 'Acme Corp', move: '+18%', color: P.green },
    { name: 'NovaTech', move: '-12%', color: P.red },
    { name: 'Vertex AI', move: '+9%', color: P.green },
  ];
  ch.push(F(16, 318, 174, 150, P.surface, {
    r: 14, stroke: P.border, sw: 1,
    ch: [
      T('TOP MOVERS', 14, 12, 140, 10, { size: 8, fill: P.muted, ls: 1.4, weight: 700 }),
      T('Today', 118, 12, 40, 10, { size: 8, fill: P.accent2, align: 'right' }),
      Line(14, 28, 146, P.border),
      ...movers.flatMap((m, i) => {
        const ry = 36 + i * 36;
        return [
          E(14, ry + 5, 10, 10, m.color + '28'),
          E(17, ry + 8, 5, 5, m.color),
          T(m.name, 30, ry + 2, 80, 14, { size: 11, fill: P.fg, weight: 600 }),
          T(m.move, 108, ry + 2, 52, 14, { size: 12, fill: m.color, weight: 700, align: 'right' }),
          ...(i < 2 ? [Line(14, ry + 32, 146, P.border)] : []),
        ];
      }),
    ],
  }));

  // ── AI insight card ───────────────────────────────────────────────────
  ch.push(F(200, 318, 174, 150, P.surface, {
    r: 14, stroke: P.border, sw: 1,
    ch: [
      T('AI INSIGHT', 14, 12, 100, 10, { size: 8, fill: P.muted, ls: 1.4, weight: 700 }),
      ...Dot(150, 17, P.violet),
      T('◈', 14, 26, 20, 20, { size: 16, fill: P.violet }),
      T('NovaTech quietly\nlaunched API beta —\nwatch integrations', 14, 50, 144, 44, { size: 10, fill: P.fg, lh: 1.5 }),
      T('3 min ago', 14, 102, 140, 12, { size: 8, fill: P.muted2 }),
      Pill(14, 118, 'HIGH PRIORITY', P.violet),
    ],
  }));

  // ── Active watches strip ──────────────────────────────────────────────
  ch.push(F(16, 476, 358, 120, P.surface, {
    r: 14, stroke: P.border, sw: 1,
    ch: [
      T('ACTIVE WATCHES', 14, 12, 200, 10, { size: 8, fill: P.muted, ls: 1.4, weight: 700 }),
      T('12 running', 288, 12, 60, 10, { size: 8, fill: P.cyan, align: 'right' }),
      Line(14, 28, 330, P.border),
      ...[
        { name: 'Pricing pages', sig: 3, color: P.accent },
        { name: 'Job postings', sig: 4, color: P.cyan },
        { name: 'Product releases', sig: 2, color: P.violet },
      ].flatMap((w, i) => {
        const ry = 36 + i * 28;
        return [
          T(w.name, 14, ry + 8, 160, 13, { size: 11, fill: P.fg }),
          ...SignalBars(238, ry + 8, w.sig, w.color),
          T(`${w.sig * 3 + 2}`, 272, ry + 8, 36, 13, { size: 10, fill: w.color, weight: 600 }),
          ...(i < 2 ? [Line(14, ry + 24, 330, P.border)] : []),
        ];
      }),
    ],
  }));

  // ── Quick action buttons ──────────────────────────────────────────────
  const actions = [['Run Scan', P.accent], ['Report', 'transparent'], ['Add Rival', 'transparent']];
  ch.push(F(16, 604, 358, 44, P.surface2, {
    r: 14, stroke: P.border, sw: 1,
    ch: actions.flatMap(([a, bg], i) => [
      F(i * 120 + 8, 6, 108, 32, bg, {
        r: 8,
        stroke: i === 0 ? undefined : P.border2,
        sw: 1,
        ch: [T(a, 0, 9, 108, 14, { size: 10, fill: i === 0 ? '#fff' : P.muted2, weight: 600, align: 'center' })],
      }),
    ]),
  }));

  ch.push(BottomNav(0));

  return { id: uid(), type: 'frame', x: 0, y: 0, width: W, height: H, fill: P.bg, children: ch };
}

// ─────────────────────────────────────────────────────────────────────────────
//  SCREEN 2 — Rival Profiles
// ─────────────────────────────────────────────────────────────────────────────
function buildRivals() {
  const W = 390, H = 844;
  const ch = [];

  ch.push(F(0, 0, W, H, P.bg));
  ch.push(...Glow(300, 280, 100, P.accent));

  ch.push(StatusBar());
  ch.push(PageHeader('RIVALS', 'COMPETITIVE LANDSCAPE'));

  // Filter row
  const tabs = ['All', 'Direct', 'Emerging', 'Watch'];
  ch.push(F(0, 100, W, 40, P.bg, {
    ch: tabs.map((t, i) => {
      const isActive = i === 0;
      const tw = [40, 54, 74, 52][i];
      const tx = [16, 68, 134, 220][i];
      return F(tx, 8, tw, 26, isActive ? P.accent : 'transparent', {
        r: 13,
        stroke: isActive ? undefined : P.border2,
        sw: 1,
        ch: [T(t, 0, 7, tw, 12, { size: 10, fill: isActive ? '#fff' : P.muted, weight: isActive ? 700 : 400, align: 'center' })],
      });
    }),
  }));

  // Rival cards
  const rivals = [
    { name: 'Acme Corp', type: 'DIRECT', score: 82, trend: 18, up: true, color: P.green, activity: 'New feature launch detected', time: '2h ago', tags: ['Pricing', 'Product'] },
    { name: 'NovaTech', type: 'EMERGING', score: 71, trend: 12, up: false, color: P.red, activity: 'API beta page published', time: '3h ago', tags: ['API', 'Dev'] },
    { name: 'Vertex AI', type: 'DIRECT', score: 64, trend: 9, up: true, color: P.cyan, activity: 'Funding round signals', time: '6h ago', tags: ['Funding'] },
    { name: 'Spectra Inc', type: 'WATCH', score: 58, trend: 4, up: false, color: P.amber, activity: 'Team restructuring signs', time: '1d ago', tags: ['Team'] },
  ];

  rivals.forEach((r, i) => {
    const ry = 148 + i * 130;
    const cardCh = [
      // Avatar
      E(14, 16, 40, 40, r.color + '20'),
      T(r.name[0], 14, 26, 40, 20, { size: 18, fill: r.color, weight: 900, align: 'center' }),
      // Name
      T(r.name, 64, 14, 190, 16, { size: 14, fill: P.fg, weight: 700 }),
      Pill(64, 34, r.type, r.color),
      // Score circle
      E(304, 24, 40, 40, r.color + '15'),
      T(String(r.score), 304, 34, 40, 20, { size: 16, fill: r.color, weight: 800, align: 'center' }),
      // Divider
      Line(14, 60, 330, P.border),
      // Activity
      T(r.activity, 14, 70, 240, 14, { size: 10, fill: P.fg }),
      T(r.time, 260, 70, 78, 14, { size: 9, fill: P.muted2, align: 'right' }),
      // Tags
      ...r.tags.map((tag, ti) => Pill(14 + ti * 60, 90, tag, P.muted2)),
      TrendBadge(278, 88, r.trend, r.up),
    ];
    ch.push(F(16, ry, 358, 114, P.surface, { r: 14, stroke: P.border, sw: 1, ch: cardCh }));
  });

  ch.push(BottomNav(1));
  return { id: uid(), type: 'frame', x: 390, y: 0, width: W, height: H, fill: P.bg, children: ch };
}

// ─────────────────────────────────────────────────────────────────────────────
//  SCREEN 3 — Signal Feed (live alerts)
// ─────────────────────────────────────────────────────────────────────────────
function buildFeed() {
  const W = 390, H = 844;
  const ch = [];

  ch.push(F(0, 0, W, H, P.bg));
  ch.push(...Glow(80, 250, 100, P.cyan));
  ch.push(...Glow(310, 560, 80, P.violet));

  ch.push(StatusBar());
  ch.push(F(0, 44, W, 56, P.bg, {
    ch: [
      T('SIGNALS', 20, 8, 200, 22, { size: 20, fill: P.fg, weight: 900, ls: 1.5 }),
      T('LIVE INTELLIGENCE FEED', 20, 32, 200, 12, { size: 8, fill: P.muted, ls: 2, weight: 600 }),
      ...LiveChip(318, 52),
      Line(0, 50, W, P.border),
    ],
  }));

  // Filter chips
  const filters = ['All', 'Critical', 'Pricing', 'Product', 'Team'];
  ch.push(F(0, 100, W, 44, P.bg, {
    ch: filters.map((f, i) => {
      const isActive = i === 0;
      const fw = [36, 60, 56, 60, 48][i];
      const fx = [16, 60, 128, 192, 260][i];
      return F(fx, 10, fw, 24, isActive ? P.accent + '22' : 'transparent', {
        r: 12,
        stroke: isActive ? P.accent : P.border,
        sw: 1,
        ch: [T(f, 0, 6, fw, 12, { size: 10, fill: isActive ? P.accent : P.muted, weight: isActive ? 700 : 400, align: 'center' })],
      });
    }),
  }));

  // Signal items
  const signals = [
    { rival: 'NovaTech', body: 'API beta page live — developer docs, pricing tiers, OAuth 2.0 flow detected', priority: 'CRITICAL', color: P.red, time: '2 min', icon: '⚡', cat: 'Product' },
    { rival: 'Acme Corp', body: 'Pricing update: Pro tier +$12/mo, Enterprise now custom quote', priority: 'HIGH', color: P.amber, time: '18 min', icon: '◈', cat: 'Pricing' },
    { rival: 'Vertex AI', body: 'LinkedIn headcount: +14 ML engineers in last 30 days', priority: 'MEDIUM', color: P.accent, time: '1h', icon: '⊛', cat: 'Team' },
    { rival: 'Spectra Inc', body: '"Why we rebuilt our pipeline" blog — signals architecture overhaul', priority: 'LOW', color: P.muted2, time: '2h', icon: '▦', cat: 'Product' },
    { rival: 'Acme Corp', body: 'Job: Head of Partnerships — 3rd strategic hire this month', priority: 'MEDIUM', color: P.accent, time: '4h', icon: '⊡', cat: 'Team' },
  ];

  signals.forEach((s, i) => {
    const sy = 152 + i * 110;
    const isFirst = i === 0;
    const cardCh = [
      T(s.icon, 14, 12, 18, 18, { size: 14, fill: s.color }),
      T(s.rival.toUpperCase(), 36, 14, 160, 11, { size: 9, fill: s.color, weight: 700, ls: 1.2 }),
      Pill(254, 10, s.priority, s.color),
      T(s.time + ' ago', 320, 14, 28, 11, { size: 8, fill: P.muted2, align: 'right' }),
      T(s.body, 14, 32, 330, 40, { size: 10, fill: P.fg, lh: 1.55 }),
      Line(14, 82, 330, P.border),
      Pill(14, 90, s.cat, P.muted2),
      T('View →', 298, 92, 50, 11, { size: 9, fill: P.accent2, align: 'right' }),
    ];
    if (isFirst) cardCh.push(...Dot(326, 18, P.cyan));
    ch.push(F(16, sy, 358, 106, isFirst ? P.surface2 : P.surface, {
      r: 14, stroke: isFirst ? P.accent + '40' : P.border, sw: 1, ch: cardCh,
    }));
  });

  ch.push(BottomNav(2));
  return { id: uid(), type: 'frame', x: 780, y: 0, width: W, height: H, fill: P.bg, children: ch };
}

// ─────────────────────────────────────────────────────────────────────────────
//  SCREEN 4 — Reports
// ─────────────────────────────────────────────────────────────────────────────
function buildReports() {
  const W = 390, H = 844;
  const ch = [];

  ch.push(F(0, 0, W, H, P.bg));
  ch.push(...Glow(195, 300, 110, P.violet));

  ch.push(StatusBar());
  ch.push(PageHeader('REPORTS', 'AI-GENERATED ANALYSIS'));

  // Generate CTA
  ch.push(F(16, 100, 358, 62, P.accent + '14', {
    r: 14, stroke: P.accent + '44', sw: 1,
    ch: [
      T('◈', 16, 20, 22, 22, { size: 17, fill: P.accent }),
      T('Generate Weekly Brief', 44, 13, 240, 15, { size: 13, fill: P.fg, weight: 600 }),
      T('AI-compiled competitor summary', 44, 30, 240, 12, { size: 9, fill: P.muted2 }),
      T('→', 334, 22, 14, 18, { size: 13, fill: P.accent }),
    ],
  }));

  // Report list
  const reports = [
    { title: 'Weekly Intelligence Brief', date: 'Mar 17, 2026', pages: 12, status: 'READY', tag: 'WEEKLY', color: P.green, pct: 0.5 },
    { title: 'Pricing Strategy Analysis', date: 'Mar 14, 2026', pages: 8, status: 'READY', tag: 'PRICING', color: P.accent, pct: 0.33 },
    { title: 'NovaTech Deep Dive', date: 'Mar 10, 2026', pages: 18, status: 'READY', tag: 'PROFILE', color: P.cyan, pct: 0.75 },
    { title: 'Q1 Market Shifts', date: 'Mar 1, 2026', pages: 24, status: 'ARCHIVE', tag: 'QUARTERLY', color: P.muted2, pct: 1.0 },
  ];

  reports.forEach((r, i) => {
    const ry = 176 + i * 100;
    ch.push(F(16, ry, 358, 90, P.surface, {
      r: 14, stroke: P.border, sw: 1,
      ch: [
        Pill(14, 10, r.tag, r.color),
        Pill(290, 10, r.status, r.color),
        T(r.title, 14, 36, 300, 16, { size: 12, fill: P.fg, weight: 700 }),
        T(r.date, 14, 54, 140, 12, { size: 9, fill: P.muted2 }),
        T(`${r.pages} pages`, 180, 54, 80, 12, { size: 9, fill: P.muted2 }),
        F(14, 72, 330, 4, P.border2, { r: 2 }),
        F(14, 72, Math.round(330 * r.pct), 4, r.color + '70', { r: 2 }),
      ],
    }));
  });

  // Stats row
  const stats = [['TOTAL', '14', P.accent], ['AVG PG', '15.6', P.violet], ['THIS WK', '3 NEW', P.green]];
  const statW = [110, 110, 122];
  const statX = [16, 134, 252];
  stats.forEach(([lbl, val, color], i) => {
    ch.push(F(statX[i], 580, statW[i], 60, P.surface, {
      r: 12, stroke: P.border, sw: 1,
      ch: [
        T(lbl, 0, 8, statW[i], 10, { size: 7, fill: P.muted, ls: 1.2, weight: 700, align: 'center' }),
        T(val, 0, 22, statW[i], 26, { size: 20, fill: color, weight: 800, align: 'center' }),
      ],
    }));
  });

  ch.push(BottomNav(3));
  return { id: uid(), type: 'frame', x: 1170, y: 0, width: W, height: H, fill: P.bg, children: ch };
}

// ─────────────────────────────────────────────────────────────────────────────
//  SCREEN 5 — Sources & Settings
// ─────────────────────────────────────────────────────────────────────────────
function buildSources() {
  const W = 390, H = 844;
  const ch = [];

  ch.push(F(0, 0, W, H, P.bg));
  ch.push(...Glow(195, 350, 100, P.accent));

  ch.push(StatusBar());
  ch.push(PageHeader('SOURCES', 'DATA INTEGRATIONS'));

  const sources = [
    { name: 'Web Crawler', desc: 'Track landing & pricing pages', count: '847 pages', color: P.cyan, on: true },
    { name: 'LinkedIn Monitor', desc: 'Headcount & job postings', count: '24 rivals', color: P.accent, on: true },
    { name: 'News API', desc: 'Press releases & media', count: '14 feeds', color: P.violet, on: true },
    { name: 'GitHub Tracker', desc: 'Repos & release notes', count: '38 repos', color: P.green, on: true },
    { name: 'G2 Reviews', desc: 'Customer sentiment', count: '2.4K reviews', color: P.amber, on: false },
    { name: 'Twitter/X', desc: 'Social mentions', count: 'Paused', color: P.muted2, on: false },
  ];

  sources.forEach((s, i) => {
    const sy = 100 + i * 92;
    ch.push(F(16, sy, 358, 80, P.surface, {
      r: 14, stroke: P.border, sw: 1,
      ch: [
        E(14, 14, 36, 36, s.color + '20'),
        T(s.name[0], 14, 24, 36, 18, { size: 15, fill: s.color, weight: 800, align: 'center' }),
        T(s.name, 60, 12, 210, 15, { size: 12, fill: P.fg, weight: 700 }),
        T(s.desc, 60, 28, 210, 12, { size: 9, fill: P.muted2 }),
        // Toggle
        F(308, 16, 36, 20, s.on ? P.accent : P.surface3, {
          r: 10,
          stroke: s.on ? undefined : P.border2,
          sw: 1,
          ch: [E(s.on ? 326 : 312, 22, 14, 14, '#fff')],
        }),
        Pill(60, 48, s.count, s.on ? s.color : P.muted),
        T(s.on ? '↻ Every 4h' : '◌ Inactive', 200, 50, 148, 11, { size: 8, fill: s.on ? P.muted2 : P.muted, align: 'right' }),
      ],
    }));
  });

  // Add source button
  ch.push(F(16, 652, 358, 44, 'transparent', {
    r: 14, stroke: P.border2, sw: 1,
    ch: [
      T('+ Add Data Source', 0, 14, 358, 16, { size: 11, fill: P.muted, align: 'center' }),
    ],
  }));

  // Footer stat
  ch.push(F(16, 706, 358, 36, P.surface2, {
    r: 10, stroke: P.border, sw: 1,
    ch: [
      T('4 active sources  ·  1,923 data points today', 0, 11, 358, 14, { size: 10, fill: P.muted2, align: 'center' }),
    ],
  }));

  ch.push(BottomNav(4));
  return { id: uid(), type: 'frame', x: 1560, y: 0, width: W, height: H, fill: P.bg, children: ch };
}

// ─────────────────────────────────────────────────────────────────────────────
//  BUILD & WRITE
// ─────────────────────────────────────────────────────────────────────────────
const doc = {
  version: '2.8',
  children: [
    buildOverview(),
    buildRivals(),
    buildFeed(),
    buildReports(),
    buildSources(),
  ],
};

const outPath = path.join(__dirname, 'recon.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
const kb = Math.round(fs.statSync(outPath).size / 1024);
console.log(`✓ recon.pen written — ${kb}KB, ${doc.children.length} screens × 390×844px`);
