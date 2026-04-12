'use strict';
// sift-app.js
// SIFT — AI Research Intelligence Platform
//
// Design Challenge:
// Design a LIGHT-MODE, editorial-minimal AI research tool inspired by:
//   1. Factory.ai (minimal.gallery/tag/ai, March 2026) — "Agent-Native Software
//      Development", off-white #EEEEEE bg, Geist font, near-zero decoration.
//      The editorial restraint and "agent-native" positioning is the design canon.
//   2. Einride (minimal.gallery/tag/ai, March 2026) — Bold display typography,
//      confident asymmetric layout, "intelligent movement" brand DNA.
//   3. Forge (darkmodedesign.com, March 2026) — Precision developer productivity
//      tools, strong structural grid — here inverted into light mode.
//
// The challenge: Most AI tools are dark-mode. SIFT deliberately goes light —
// warm off-white editorial paper (#F2F1EC) + ink black + single deep-blue accent.
// The result is a research tool that feels like a premium academic journal
// rather than a cyberpunk dashboard.
//
// Palette: warm off-white #F2F1EC · ink #111111 · deep blue #0046D5 ·
//          surface white #FAFAF8 · muted #6B6B6B
// Typography: editorial bold display for headlines, precise monospace for data
// Screens: 5 mobile (390×844) — Landing · Dashboard · Source Review · Evidence · Export

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  canvas:   '#F2F1EC',   // warm off-white (paper) — Factory.ai inspired
  bg:       '#F2F1EC',   // main screen bg
  surface:  '#FAFAF8',   // card / panel surface (near-white)
  surface2: '#EDEDEA',   // slightly darker surface for contrast
  border:   '#D8D7D1',   // subtle warm gray border
  border2:  '#C8C7C0',   // stronger border
  muted:    '#8A8A84',   // muted secondary text
  muted2:   '#6B6B6B',   // slightly darker muted
  ink:      '#111111',   // near-black ink text
  ink2:     '#333333',   // secondary ink
  accent:   '#0046D5',   // deep research blue (primary)
  accentLt: '#2563EB',   // lighter blue for hover states
  accentBg: '#EFF4FF',   // tinted blue bg
  green:    '#16A34A',   // success / found
  amber:    '#D97706',   // caution / in-progress
  red:      '#DC2626',   // error / conflict
  purple:   '#7C3AED',   // secondary accent — AI synthesis
  purpleBg: '#F3EEFF',   // purple tint bg
};

let _id = 0;
const uid = () => `sf${++_id}`;

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
  fill: opts.fill || P.ink,
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

const Line  = (x, y, w, fill = P.border) => F(x, y, w, 1, fill, {});
const VLine = (x, y, h, fill = P.border) => F(x, y, 1, h, fill, {});

// ── Pill tag ──────────────────────────────────────────────────────────────────
const Pill = (x, y, label, color = P.accent, bg = P.accentBg) => {
  const w = label.length * 6.2 + 18;
  return F(x, y, w, 20, bg, {
    r: 10,
    ch: [T(label, 0, 3, w, 14, { size: 9, fill: color, weight: 700, ls: 0.6, align: 'center' })],
  });
};

// ── Top nav bar ───────────────────────────────────────────────────────────────
const NavBar = (ox, title = 'SIFT', subtitle = '') => [
  F(ox, 0, 390, 52, P.surface, {
    stroke: P.border,
    sw: 1,
    ch: [
      // Logo mark — a stylized S
      F(16, 12, 28, 28, P.ink, {
        r: 6,
        ch: [T('S', 0, 3, 28, 22, { size: 16, fill: P.surface, weight: 900, align: 'center' })],
      }),
      T('SIFT', 52, 6, 80, 18, { size: 12, fill: P.ink, weight: 800, ls: 2 }),
      ...(subtitle ? [T(subtitle, 52, 24, 180, 14, { size: 10, fill: P.muted, ls: 0.5 })] : []),
      // Right — avatar circle
      E(348, 14, 24, 24, P.accentBg, { stroke: P.accent, sw: 1.5 }),
      T('R', 348, 19, 24, 14, { size: 11, fill: P.accent, weight: 700, align: 'center' }),
    ],
  }),
];

// ── Bottom tab bar ─────────────────────────────────────────────────────────────
const TabBar = (ox, active = 0) => {
  const tabs = [
    { label: 'Search', icon: '⌕' },
    { label: 'Library', icon: '▤' },
    { label: 'Reports', icon: '◫' },
    { label: 'Settings', icon: '◌' },
  ];
  return F(ox, 788, 390, 56, P.surface, {
    stroke: P.border,
    sw: 1,
    ch: [
      ...tabs.map((tab, i) => {
        const tx = 20 + i * 88;
        const isActive = i === active;
        return F(tx, 4, 70, 48, isActive ? P.accentBg : 'transparent', {
          r: 8,
          ch: [
            T(tab.icon, 0, 5, 70, 20, { size: 16, fill: isActive ? P.accent : P.muted, align: 'center' }),
            T(tab.label, 0, 26, 70, 14, { size: 9, fill: isActive ? P.accent : P.muted, weight: isActive ? 700 : 400, ls: 0.3, align: 'center' }),
          ],
        });
      }),
    ],
  });
};

// ── Source confidence bar ─────────────────────────────────────────────────────
const ConfidenceBar = (x, y, w, pct, color = P.accent) => [
  F(x, y, w, 4, P.border, { r: 2 }),
  F(x, y, Math.round(w * pct), 4, color, { r: 2 }),
];

// ── Mini line sparkline ───────────────────────────────────────────────────────
const Sparkline = (x, y, w, h, points, color = P.accent) => {
  // Render as a series of thin rectangles (bar chart style — works in pen format)
  const bars = points.map((v, i) => {
    const bw = Math.floor(w / points.length) - 1;
    const bh = Math.round(v * h);
    return F(x + i * (bw + 1), y + h - bh, bw, bh, color + 'CC', {});
  });
  return bars;
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — LANDING HERO
// Light editorial, Factory.ai DNA — big type, maximum negative space
// ═══════════════════════════════════════════════════════════════════════════════
function screenLanding(ox) {
  return F(ox, 0, 390, 844, P.canvas, {
    clip: true,
    ch: [
      // Status bar
      F(0, 0, 390, 44, P.canvas, { ch: [
        T('9:41', 16, 12, 60, 18, { size: 13, weight: 700, fill: P.ink }),
        T('◉◉◉◉', 298, 13, 76, 16, { size: 10, fill: P.muted, align: 'right' }),
      ]}),

      // ── Hero section ──
      // Oversize number / research metric (editorial flourish)
      T('24M', 22, 56, 300, 80, { size: 80, weight: 900, fill: P.ink, ls: -4 }),
      T('SOURCES INDEXED', 22, 132, 240, 16, { size: 10, weight: 600, fill: P.muted, ls: 3 }),

      Line(22, 160, 346),

      // Main headline — editorial large weight
      T('Research that\nfinds what\nyou can\'t.', 22, 176, 346, 120,
        { size: 36, weight: 800, fill: P.ink, lh: 1.15, ls: -1.5 }),

      // Descriptor line
      T('AI agents that scan, synthesize, and surface\nthe exact evidence your argument needs.', 22, 304, 346, 48,
        { size: 13, fill: P.muted2, lh: 1.6 }),

      // CTA button — solid ink
      F(22, 372, 200, 48, P.ink, {
        r: 8,
        ch: [
          T('Start researching →', 0, 14, 200, 20, { size: 13, fill: P.surface, weight: 600, align: 'center' }),
        ],
      }),
      // Secondary CTA
      T('See how it works', 236, 388, 120, 16, { size: 12, fill: P.accent, weight: 500 }),

      // Divider
      Line(22, 444, 346),

      // ── Social proof strip ──
      T('TRUSTED BY RESEARCHERS AT', 22, 460, 346, 14, { size: 9, fill: P.muted, ls: 2, weight: 600 }),

      // Institution pills
      Pill(22,  484, 'MIT', P.ink, P.surface2),
      Pill(64,  484, 'Stanford', P.ink, P.surface2),
      Pill(132, 484, 'Oxford', P.ink, P.surface2),
      Pill(194, 484, 'Y Combinator', P.ink, P.surface2),
      Pill(22,  512, 'McKinsey', P.ink, P.surface2),
      Pill(100, 512, 'The Economist', P.ink, P.surface2),

      // ── Feature preview card ──
      F(22, 548, 346, 200, P.surface, {
        r: 14,
        stroke: P.border,
        sw: 1,
        ch: [
          // Query input mock
          F(16, 16, 314, 40, P.canvas, {
            r: 8,
            stroke: P.accent,
            sw: 1.5,
            ch: [
              T('What caused the 2008 financial crisis?', 12, 11, 280, 18,
                { size: 12, fill: P.ink }),
              F(288, 8, 24, 24, P.ink, { r: 6,
                ch: [T('→', 0, 4, 24, 16, { size: 11, fill: P.surface, align: 'center' })] }),
            ],
          }),
          // Divider
          Line(16, 64, 314),
          // Agent status row
          T('SIFT AGENTS WORKING', 16, 74, 200, 12, { size: 9, fill: P.muted, ls: 1.5, weight: 600 }),
          T('3 active', 280, 74, 60, 12, { size: 9, fill: P.green, weight: 600, align: 'right' }),
          // Result rows
          ...['Brookings Institution Report (2009)', 'Federal Reserve Economic Review', 'BIS Working Paper #306'].map((src, i) =>
            F(16, 94 + i * 30, 314, 24, i === 0 ? P.accentBg : 'transparent', {
              r: 4,
              ch: [
                E(12, 8, 8, 8, P.green),
                T(src, 26, 4, 260, 16, { size: 11, fill: P.ink }),
                T('94%', 286, 4, 28, 16, { size: 10, fill: P.muted, align: 'right' }),
              ],
            })
          ),
        ],
      }),

      // Bottom tagline
      T('Powered by SIFT Research Agents', 0, 764, 390, 16,
        { size: 10, fill: P.muted, ls: 0.5, align: 'center' }),
      T('sift.ai', 0, 782, 390, 14,
        { size: 11, fill: P.accent, weight: 600, align: 'center' }),
    ],
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — DASHBOARD
// Dark precision grid — Forge-inspired, but with warm canvas undertones
// Actually staying light — showing active research queries in a bento grid
// ═══════════════════════════════════════════════════════════════════════════════
function screenDashboard(ox) {
  const queries = [
    { q: 'Causes of inflation 2024–25', status: 'DONE', sources: 142, conf: 0.91, time: '4m', color: P.green },
    { q: 'Quantum computing timeline', status: 'RUNNING', sources: 78, conf: 0.72, time: '2m', color: P.amber },
    { q: 'GPT-5 vs Gemini Ultra capability comparison', status: 'RUNNING', sources: 54, conf: 0.68, time: '1m', color: P.amber },
    { q: 'Carbon capture cost curves 2025', status: 'DONE', sources: 230, conf: 0.95, time: '6m', color: P.green },
    { q: 'Remote work productivity research', status: 'QUEUED', sources: 0, conf: 0, time: '—', color: P.muted },
  ];

  return F(ox, 0, 390, 844, P.canvas, {
    clip: true,
    ch: [
      // Top bar
      ...NavBar(0, 'SIFT', 'Research Hub'),

      // Section header
      T('Active Queries', 16, 64, 220, 22, { size: 18, weight: 800, fill: P.ink, ls: -0.5 }),
      T('+ New', 312, 70, 62, 18, { size: 12, fill: P.accent, weight: 600, align: 'right' }),

      // Running badge
      F(16, 94, 96, 20, P.amber + '18', {
        r: 10,
        ch: [
          E(10, 6, 8, 8, P.amber),
          T('2 RUNNING', 24, 3, 66, 14, { size: 9, fill: P.amber, weight: 700, ls: 0.5 }),
        ],
      }),
      F(120, 94, 80, 20, P.green + '18', {
        r: 10,
        ch: [
          T('2 COMPLETE', 0, 3, 80, 14, { size: 9, fill: P.green, weight: 700, ls: 0.5, align: 'center' }),
        ],
      }),

      Line(0, 122, 390, P.border),

      // Query cards
      ...queries.map((q, i) => F(14, 130 + i * 116, 362, 106, P.surface, {
        r: 12,
        stroke: q.status === 'RUNNING' ? P.amber + '50' : P.border,
        sw: 1,
        ch: [
          // Status indicator line (left edge)
          F(0, 0, 3, 106, q.color, { r: 1 }),

          // Query text
          T(q.q, 16, 12, 318, 34, { size: 13, fill: P.ink, weight: 600, lh: 1.4 }),

          // Meta row
          T(`${q.sources} sources`, 16, 52, 100, 14, { size: 10, fill: P.muted }),
          T(q.time + ' ago', 120, 52, 80, 14, { size: 10, fill: P.muted }),

          // Status pill
          Pill(270, 48, q.status,
            q.status === 'DONE' ? P.green : q.status === 'RUNNING' ? P.amber : P.muted,
            q.status === 'DONE' ? P.green + '15' : q.status === 'RUNNING' ? P.amber + '18' : P.surface2
          ),

          // Confidence bar (only if has sources)
          ...(q.sources > 0 ? [
            T('Confidence', 16, 74, 80, 12, { size: 9, fill: P.muted, ls: 0.5, weight: 600 }),
            ...ConfidenceBar(16, 90, 240, q.conf, q.status === 'RUNNING' ? P.amber : P.accent),
            T(`${Math.round(q.conf * 100)}%`, 264, 84, 40, 14, { size: 11, fill: q.color, weight: 700 }),
          ] : [
            T('Waiting in queue...', 16, 80, 200, 12, { size: 10, fill: P.muted, opacity: 0.7 }),
          ]),

          // Chevron
          T('›', 344, 40, 16, 24, { size: 18, fill: P.muted2, align: 'center' }),
        ],
      })),

      // Bottom bar
      TabBar(0, 0),
    ],
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — SOURCE REVIEW
// Editorial card-based source verification — the "research librarian" screen
// ═══════════════════════════════════════════════════════════════════════════════
function screenSourceReview(ox) {
  const sources = [
    { title: 'The Subprime Solution', author: 'Robert Shiller, Princeton UP', year: '2008', type: 'BOOK', rel: 0.97, bias: 'CENTER', verified: true },
    { title: 'Too Big to Fail', author: 'Andrew Ross Sorkin, Viking', year: '2009', type: 'BOOK', rel: 0.94, bias: 'CENTER-L', verified: true },
    { title: 'FCIC Final Report', author: 'Financial Crisis Inquiry Commission', year: '2011', type: 'GOV', rel: 0.99, bias: 'GOV', verified: true },
    { title: 'Bailout Nation', author: 'Barry Ritholtz, Wiley', year: '2009', type: 'BOOK', rel: 0.88, bias: 'CENTER', verified: false },
  ];

  const biasColors = {
    'CENTER': P.accent,
    'CENTER-L': P.purple,
    'GOV': P.muted2,
    'RIGHT': P.amber,
  };

  return F(ox, 0, 390, 844, P.canvas, {
    clip: true,
    ch: [
      // Top bar with back nav
      F(0, 0, 390, 52, P.surface, {
        stroke: P.border, sw: 1,
        ch: [
          T('←', 14, 14, 24, 24, { size: 16, fill: P.ink }),
          T('Sources', 46, 12, 200, 28, { size: 15, fill: P.ink, weight: 700 }),
          // Filter button
          F(318, 10, 60, 30, P.surface2, {
            r: 8, stroke: P.border, sw: 1,
            ch: [T('Filter ▾', 0, 8, 60, 14, { size: 10, fill: P.ink, align: 'center' })],
          }),
        ],
      }),

      // Query reference
      F(14, 60, 362, 44, P.accentBg, {
        r: 8,
        ch: [
          T('Q:', 12, 14, 20, 16, { size: 11, fill: P.accent, weight: 800 }),
          T('What caused the 2008 financial crisis?', 34, 14, 316, 16, { size: 11, fill: P.accent, lh: 1.4 }),
        ],
      }),

      // Sort / count row
      T('142 sources · sorted by relevance', 16, 116, 280, 14, { size: 10, fill: P.muted }),

      // Source cards
      ...sources.map((s, i) => F(14, 138 + i * 162, 362, 150, P.surface, {
        r: 12,
        stroke: s.verified ? P.border : P.amber + '40',
        sw: 1,
        ch: [
          // Type badge top-right
          Pill(286, 12, s.type,
            s.type === 'GOV' ? P.muted2 : P.accent,
            s.type === 'GOV' ? P.surface2 : P.accentBg
          ),

          // Title
          T(s.title, 14, 14, 260, 34, { size: 13, fill: P.ink, weight: 700, lh: 1.35 }),

          // Author / publisher
          T(s.author, 14, 52, 320, 14, { size: 10, fill: P.muted2 }),
          T(s.year, 14, 66, 60, 12, { size: 10, fill: P.muted }),

          Line(14, 84, 334),

          // Relevance bar
          T('RELEVANCE', 14, 94, 80, 10, { size: 8, fill: P.muted, ls: 1, weight: 600 }),
          ...ConfidenceBar(14, 106, 200, s.rel),
          T(`${Math.round(s.rel * 100)}%`, 222, 100, 40, 14, { size: 11, fill: P.accent, weight: 700 }),

          // Bias indicator
          T('BIAS', 280, 94, 60, 10, { size: 8, fill: P.muted, ls: 1, weight: 600 }),
          F(280, 106, 70, 18, (biasColors[s.bias] || P.muted) + '18', {
            r: 9,
            ch: [T(s.bias, 0, 3, 70, 12, { size: 8, fill: biasColors[s.bias] || P.muted, weight: 700, ls: 0.3, align: 'center' })],
          }),

          // Verified badge
          ...(s.verified
            ? [T('✓ SIFT verified', 14, 126, 140, 14, { size: 9, fill: P.green, weight: 600, ls: 0.3 })]
            : [T('⚠ Unverified source', 14, 126, 160, 14, { size: 9, fill: P.amber, weight: 600, ls: 0.3 })]),

          T('View excerpt →', 270, 126, 92, 14, { size: 9, fill: P.accent, weight: 600, align: 'right' }),
        ],
      })),

      // Load more
      F(14, 784, 362, 36, P.surface2, {
        r: 8, stroke: P.border, sw: 1,
        ch: [T('Load 138 more sources', 0, 10, 362, 16, { size: 12, fill: P.muted2, align: 'center' })],
      }),

      TabBar(0, 0),
    ],
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — EVIDENCE VIEW
// Structured synthesis — the academic "annotated bibliography" view
// ═══════════════════════════════════════════════════════════════════════════════
function screenEvidence(ox) {
  return F(ox, 0, 390, 844, P.canvas, {
    clip: true,
    ch: [
      // Nav
      F(0, 0, 390, 52, P.surface, {
        stroke: P.border, sw: 1,
        ch: [
          T('←', 14, 14, 24, 24, { size: 16, fill: P.ink }),
          T('Evidence', 46, 12, 180, 28, { size: 15, fill: P.ink, weight: 700 }),
          Pill(290, 15, 'AI SYNTHESIS', P.purple, P.purpleBg),
        ],
      }),

      // Query summary header
      F(0, 52, 390, 80, P.ink, {
        ch: [
          T('QUERY', 16, 10, 100, 12, { size: 8, fill: P.muted, ls: 2, weight: 600 }),
          T('What caused the 2008 financial crisis?', 16, 24, 358, 34,
            { size: 14, fill: P.surface, weight: 700, lh: 1.3 }),
          T('142 sources · 91% confidence · 4 min', 16, 62, 300, 14, { size: 10, fill: P.muted }),
        ],
      }),

      // AI Synthesis block
      F(14, 148, 362, 148, P.purpleBg, {
        r: 12,
        stroke: P.purple + '30',
        sw: 1,
        ch: [
          // AI label
          F(14, 12, 90, 20, P.purple + '22', {
            r: 10,
            ch: [
              T('SIFT SYNTHESIS', 0, 3, 90, 14, { size: 8, fill: P.purple, weight: 700, ls: 0.5, align: 'center' }),
            ],
          }),
          T('The 2008 crisis stemmed from the convergence of three systemic failures: (1) over-leveraged mortgage-backed securities with inadequate risk disclosure, (2) regulatory arbitrage by shadow banking institutions outside Fed oversight, and (3) credit rating agency conflicts of interest that masked underlying default risk.', 14, 40, 334, 96,
            { size: 11, fill: P.ink, lh: 1.6 }),
        ],
      }),

      // Key themes
      T('KEY THEMES', 16, 308, 200, 14, { size: 9, fill: P.muted, ls: 2, weight: 600 }),

      ...['Mortgage securitization risk', 'Regulatory gaps (Glass–Steagall)', 'Rating agency failures (AAA CDOs)', 'Federal Reserve policy (2003–06)', 'Lehman Brothers contagion'].map((theme, i) =>
        F(14, 326 + i * 50, 362, 40, P.surface, {
          r: 8,
          stroke: P.border, sw: 1,
          ch: [
            // Numbered badge
            F(12, 10, 20, 20, P.accentBg, { r: 4,
              ch: [T(`${i + 1}`, 0, 3, 20, 14, { size: 9, fill: P.accent, weight: 700, align: 'center' })] }),
            T(theme, 38, 11, 256, 18, { size: 12, fill: P.ink, weight: 500 }),
            // Source count
            T(`${[24, 18, 31, 19, 22][i]}`, 314, 11, 40, 18, { size: 11, fill: P.muted, align: 'right' }),
          ],
        })
      ),

      // Confidence breakdown
      T('CONFIDENCE BREAKDOWN', 16, 584, 240, 12, { size: 9, fill: P.muted, ls: 2, weight: 600 }),
      F(14, 602, 362, 80, P.surface, {
        r: 10, stroke: P.border, sw: 1,
        ch: [
          ...[
            { label: 'Primary sources', pct: 0.94, color: P.green },
            { label: 'Secondary analysis', pct: 0.88, color: P.accent },
            { label: 'Expert opinion', pct: 0.76, color: P.amber },
          ].map((item, i) => [
            T(item.label, 12, 10 + i * 22, 160, 14, { size: 10, fill: P.muted2 }),
            ...ConfidenceBar(12, 26 + i * 22, 240, item.pct, item.color),
            T(`${Math.round(item.pct * 100)}%`, 262, 20 + i * 22, 40, 14, { size: 10, fill: item.color, weight: 600 }),
          ]).flat(),
        ],
      }),

      // Export CTA
      F(14, 696, 362, 48, P.ink, {
        r: 10,
        ch: [
          T('Export Research Report →', 0, 14, 362, 20, { size: 14, fill: P.surface, weight: 600, align: 'center' }),
        ],
      }),
      T('Export as PDF, Markdown, or Notion page', 0, 754, 390, 14, { size: 10, fill: P.muted, align: 'center' }),

      TabBar(0, 2),
    ],
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — EXPORT / REPORT
// Clean editorial report view — the deliverable
// ═══════════════════════════════════════════════════════════════════════════════
function screenExport(ox) {
  return F(ox, 0, 390, 844, P.canvas, {
    clip: true,
    ch: [
      // Status bar
      F(0, 0, 390, 44, P.canvas, {
        ch: [
          T('9:41', 16, 12, 60, 18, { size: 13, weight: 700, fill: P.ink }),
          T('◉◉◉◉', 298, 13, 76, 16, { size: 10, fill: P.muted, align: 'right' }),
        ],
      }),

      // Report card — large editorial preview
      F(14, 52, 362, 480, P.surface, {
        r: 16,
        stroke: P.border, sw: 1,
        ch: [
          // Report header area
          F(0, 0, 362, 130, P.ink, {
            r: 16,
            ch: [
              // Clip bottom corners
              F(0, 110, 362, 36, P.ink),

              T('RESEARCH REPORT', 20, 20, 280, 14, { size: 9, fill: P.muted, ls: 2.5, weight: 600 }),
              T('What caused the\n2008 financial\ncrisis?', 20, 40, 310, 78,
                { size: 24, fill: P.surface, weight: 800, lh: 1.2, ls: -0.8 }),
            ],
          }),

          // Meta strip
          F(0, 130, 362, 44, P.surface2, {
            ch: [
              T('SIFT Research', 16, 14, 140, 16, { size: 10, fill: P.ink, weight: 600 }),
              T('Mar 21, 2026', 16, 30, 140, 12, { size: 9, fill: P.muted }),
              T('142 sources', 200, 14, 100, 16, { size: 10, fill: P.ink, weight: 600 }),
              T('91% confidence', 200, 30, 120, 12, { size: 9, fill: P.green }),
            ],
          }),

          Line(0, 174, 362),

          // Abstract preview
          T('ABSTRACT', 16, 182, 100, 12, { size: 8, fill: P.muted, ls: 2, weight: 600 }),
          T('The 2008 financial crisis emerged from a confluence of deregulation, innovation in complex financial instruments, and systemic risk mispricing that collectively overwhelmed the global financial system...', 16, 200, 330, 72,
            { size: 11, fill: P.ink2, lh: 1.65 }),

          Line(0, 276, 362),

          // Contents
          T('CONTENTS', 16, 286, 100, 12, { size: 8, fill: P.muted, ls: 2, weight: 600 }),
          ...['Executive Summary', 'Key Findings (12)', 'Source Analysis', 'Expert Consensus', 'Dissenting Views', 'Bibliography (142)'].map((item, i) =>
            F(16, 304 + i * 24, 330, 20, 'transparent', {
              ch: [
                T(`${i + 1}.`, 0, 2, 20, 16, { size: 11, fill: P.muted }),
                T(item, 22, 2, 280, 16, { size: 11, fill: i === 0 ? P.accent : P.ink }),
                T('›', 322, 2, 16, 16, { size: 12, fill: P.muted, align: 'right' }),
              ],
            })
          ),
        ],
      }),

      // Export format row
      T('EXPORT AS', 14, 548, 200, 14, { size: 9, fill: P.muted, ls: 2, weight: 600 }),

      ...[
        { fmt: 'PDF', icon: '⬡', color: P.red },
        { fmt: 'Markdown', icon: '✦', color: P.accent },
        { fmt: 'Notion', icon: '◈', color: P.ink },
        { fmt: 'Docs', icon: '◻', color: P.green },
      ].map((f, i) => F(14 + i * 88, 568, 80, 68, P.surface, {
        r: 10, stroke: P.border, sw: 1,
        ch: [
          T(f.icon, 0, 10, 80, 24, { size: 20, fill: f.color, align: 'center' }),
          T(f.fmt, 0, 40, 80, 16, { size: 10, fill: P.ink, weight: 600, align: 'center' }),
        ],
      })),

      // Share row
      F(14, 648, 362, 48, P.accentBg, {
        r: 10, stroke: P.accent + '40', sw: 1,
        ch: [
          T('Share link', 16, 14, 120, 20, { size: 13, fill: P.accent, weight: 600 }),
          T('Copy report link →', 200, 14, 150, 20, { size: 12, fill: P.accent, align: 'right' }),
        ],
      }),

      // Bottom note
      T('Report generated by SIFT Research Agents', 0, 712, 390, 14, { size: 10, fill: P.muted, align: 'center' }),
      T('sift.ai · Research Intelligence Platform', 0, 728, 390, 14, { size: 10, fill: P.muted, align: 'center' }),

      TabBar(0, 2),
    ],
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// ASSEMBLE & SAVE
// ═══════════════════════════════════════════════════════════════════════════════
const SCREEN_W = 390;
const GAP      = 80;

const doc = {
  version: '2.8',
  name: 'SIFT — AI Research Intelligence Platform',
  width:  5 * SCREEN_W + 6 * GAP,
  height: 844,
  fill:   '#E8E7E2',
  children: [
    screenLanding     (GAP),
    screenDashboard   (GAP + (SCREEN_W + GAP)),
    screenSourceReview(GAP + (SCREEN_W + GAP) * 2),
    screenEvidence    (GAP + (SCREEN_W + GAP) * 3),
    screenExport      (GAP + (SCREEN_W + GAP) * 4),
  ],
};

const outPath = path.join(__dirname, 'sift.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log('✓ sift.pen written —', Math.round(fs.statSync(outPath).size / 1024) + 'KB');
console.log('  5 screens: Landing · Dashboard · Source Review · Evidence · Export');
console.log('  Palette: warm off-white #F2F1EC · ink #111111 · deep blue #0046D5');
console.log('  Inspired by: Factory.ai (minimal.gallery) + Einride + Forge (darkmodedesign.com)');
