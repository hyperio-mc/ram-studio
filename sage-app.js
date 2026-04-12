'use strict';
// sage-app.js — SAGE: Research Intelligence, Distilled
//
// Inspired by:
//   • Land-book: Keytail — "Be the Answer Everywhere People Search" (Mar 2026)
//     Clean AI-search SaaS, editorial layout, clear information hierarchy,
//     warm neutrals with a focused single-accent hero.
//   • Awwwards nominees: Unseen Studio "2025 Wrapped" — data as editorial art,
//     generous whitespace, oversized stat callouts.
//   • Godly.website: Evervault Customers — clean enterprise SaaS grid,
//     "understated authority" — minimal chrome, maximum content density.
//   • Minimal.gallery: AI & Startup category — warm cream/parchment backgrounds
//     replacing cold white; natural accent colors (sage, amber, slate).
//
// Challenge: Design a 5-screen LIGHT-theme AI research companion where the
// editorial warm-parchment trend from minimal.gallery + Keytail's "AI that
// answers everywhere" concept converge. Think Perplexity meets a premium
// research notebook. Sage green (#4B7A5E) + amber (#C4853A) against warm
// parchment (#F6F3EE). Big display type for insight callouts (Awwwards editorial
// influence). Clean card grids (Evervault grid influence).
//
// Screens: Discovery · Active Research · Source Explorer · Library · Synthesis

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#F6F3EE',   // warm parchment — editorial notebook feel
  surface:  '#FFFFFF',   // pure white cards
  surface2: '#EFF0EB',   // slightly warm off-white
  surface3: '#E6E4DC',   // warm light border fill
  border:   '#DDD9CF',   // warm border
  border2:  '#CBC8BE',   // slightly darker border
  fg:       '#1A1916',   // near-black warm
  fg2:      '#6B6860',   // medium warm grey
  fg3:      '#B8B5AE',   // light warm grey
  sage:     '#4B7A5E',   // sage green — primary accent
  sageLo:   '#4B7A5E14', // sage low
  sageMid:  '#4B7A5E30', // sage mid
  amber:    '#C4853A',   // warm amber — secondary accent
  amberLo:  '#C4853A14',
  red:      '#C54040',   // muted terracotta red
  redLo:    '#C5404014',
  blue:     '#3A6FB5',   // deep reference blue
  blueLo:   '#3A6FB514',
};

let _id = 0;
const uid = () => `s${++_id}`;

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

const Line  = (x, y, w, fill = P.border) => F(x, y, w, 1, fill, {});
const VLine = (x, y, h, fill = P.border) => F(x, y, 1, h, fill, {});

// ── Pill / badge ──────────────────────────────────────────────────────────────
const Pill = (x, y, label, color, opts = {}) => {
  const w = opts.w || Math.max(label.length * 6.2 + 18, 40);
  return F(x, y, w, 20, color + '1A', {
    r: 10,
    stroke: color + '44', sw: 1,
    ch: [ T(label, 0, 4, w, 13, { size: 8.5, fill: color, weight: 700, ls: 0.5, align: 'center' }) ],
  });
};

// ── Source chip ───────────────────────────────────────────────────────────────
const SourceChip = (x, y, domain, num) => {
  const w = domain.length * 6.5 + 30;
  return F(x, y, w, 22, P.surface2, {
    r: 11, stroke: P.border, sw: 1,
    ch: [
      E(8, 5, 12, 12, P.sage, { opacity: 0.7 }),
      T(String(num), 8, 5, 12, 12, { size: 7, fill: P.surface, weight: 800, align: 'center' }),
      T(domain, 24, 5, w - 30, 12, { size: 8, fill: P.fg2, weight: 500 }),
    ],
  });
};

// ── Progress bar ──────────────────────────────────────────────────────────────
const Progress = (x, y, w, pct, color) => [
  F(x, y, w, 4, P.surface3, { r: 2 }),
  F(x, y, Math.round(w * pct / 100), 4, color, { r: 2 }),
];

// ── Confidence ring (editorial big-type inspired) ─────────────────────────────
const ConfRing = (cx, cy, r, pct, color) => {
  const strokeW = 6;
  return [
    E(cx - r, cy - r, r * 2, r * 2, 'transparent', { stroke: P.surface3, sw: strokeW }),
    E(cx - r, cy - r, r * 2, r * 2, 'transparent', { stroke: color, sw: strokeW, opacity: 0.85 }),
  ];
};

// ── Nav bar ───────────────────────────────────────────────────────────────────
const NavBar = (active) => {
  const items = [
    ['◎', 'Discover', 0],
    ['⊙', 'Research', 1],
    ['◈', 'Sources',  2],
    ['⬡', 'Library',  3],
    ['◉', 'Synthesis', 4],
  ];
  return F(0, 764, 390, 80, P.surface, {
    stroke: P.border, sw: 1,
    ch: [
      Line(0, 0, 390, P.border),
      ...items.map(([ic, lb, j]) => {
        const nx = 5 + j * 76;
        const isActive = j === active;
        return [
          isActive ? F(nx + 12, 4, 52, 48, P.sageLo, { r: 14 }) : null,
          T(ic, nx + 14, 10, 48, 20, { size: 14, fill: isActive ? P.sage : P.fg3, align: 'center' }),
          T(lb, nx + 2, 34, 72, 12, { size: 7, fill: isActive ? P.sage : P.fg3, align: 'center', weight: isActive ? 700 : 400, ls: 0.2 }),
        ].filter(Boolean);
      }).flat(),
    ],
  });
};

// ── Status bar ────────────────────────────────────────────────────────────────
const StatusBar = (right = '') => [
  T('9:41', 20, 14, 60, 16, { size: 12, weight: 600, fill: P.fg }),
  T(right, 200, 14, 170, 16, { size: 10, fill: P.fg2, align: 'right' }),
];

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Discovery (home)
// ══════════════════════════════════════════════════════════════════════════════
function screenDiscovery(ox) {
  const threads = [
    { q: 'How does Anthropic train Constitutional AI?', time: '12m ago', tags: ['AI', 'Safety'], sources: 14, color: P.sage },
    { q: 'Rust vs Go for high-throughput API services', time: '2h ago', tags: ['Engineering'], sources: 9, color: P.blue },
    { q: 'Mediterranean diet meta-analysis 2024–2025', time: 'Yesterday', tags: ['Health', 'Research'], sources: 22, color: P.amber },
    { q: 'Fermi estimation: global lithium reserves', time: '3d ago', tags: ['Science'], sources: 11, color: P.red },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    // ambient soft glow — editorial warmth
    E(-60, -80, 300, 300, P.sage, { opacity: 0.04 }),
    E(160, 500, 240, 240, P.amber, { opacity: 0.05 }),

    // Status bar
    ...StatusBar('Sage · Research'),

    // Wordmark — editorial big-type (Awwwards influence)
    T('SAGE', 20, 44, 220, 52, { size: 46, weight: 900, fill: P.fg, ls: -1 }),
    T('Research intelligence, distilled.', 20, 100, 320, 18, { size: 13, fill: P.fg2, lh: 1.4 }),

    // Search bar — Keytail-inspired hero search
    F(20, 130, 350, 48, P.surface, {
      r: 16, stroke: P.border, sw: 1,
      ch: [
        T('◎', 14, 12, 24, 24, { size: 16, fill: P.fg3 }),
        T('Ask anything, research anything…', 42, 14, 258, 20, { size: 12, fill: P.fg3, ls: -0.1 }),
        F(304, 10, 28, 28, P.sage, { r: 8, ch: [
          T('↵', 0, 5, 28, 18, { size: 13, fill: P.surface, align: 'center', weight: 700 }),
        ]}),
      ],
    }),

    // Topic chips
    T('POPULAR TOPICS', 20, 194, 200, 12, { size: 8, fill: P.fg3, ls: 1.5, weight: 600 }),
    ...['Climate tech', 'LLM evals', 'Biotech', 'Markets'].map((t, i) =>
      Pill(20 + [0, 80, 160, 238][i], 212, t, P.sage, { w: [68, 70, 58, 60][i] })
    ),

    // Divider
    Line(20, 246, 350, P.border),

    // Recent threads header
    T('RECENT RESEARCH', 20, 260, 200, 12, { size: 8, fill: P.fg3, ls: 1.5, weight: 600 }),
    T('4 threads', 290, 258, 80, 14, { size: 10, fill: P.sage, align: 'right', weight: 600 }),

    // Thread cards
    ...threads.map((th, i) =>
      F(20, 280 + i * 108, 350, 96, P.surface, {
        r: 14, stroke: P.border, sw: 1,
        ch: [
          // accent left line
          F(0, 12, 3, 72, th.color, { r: 2, opacity: 0.6 }),
          // Query text
          T(th.q, 14, 12, 306, 36, { size: 12, fill: P.fg, weight: 600, lh: 1.45 }),
          // Meta row
          T(th.time, 14, 54, 80, 14, { size: 9, fill: P.fg3 }),
          T(`${th.sources} sources`, 14, 68, 80, 14, { size: 9, fill: th.color, weight: 600 }),
          // Tags
          ...th.tags.map((tag, j) => Pill(200 + j * 72, 54, tag, th.color)),
        ],
      })
    ),

    NavBar(0),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Active Research (streaming query)
// ══════════════════════════════════════════════════════════════════════════════
function screenActiveResearch(ox) {
  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    E(300, -40, 200, 200, P.sage, { opacity: 0.05 }),

    ...StatusBar(''),

    // Back arrow + query pill
    F(20, 42, 28, 28, P.surface2, { r: 8, stroke: P.border, sw: 1, ch: [
      T('←', 0, 6, 28, 16, { size: 13, fill: P.fg2, align: 'center' }),
    ]}),
    F(56, 42, 294, 28, P.surface, { r: 8, stroke: P.border, sw: 1, ch: [
      T('◎', 8, 6, 20, 16, { size: 12, fill: P.sage }),
      T('How does Constitutional AI work?', 30, 7, 250, 14, { size: 10.5, fill: P.fg, weight: 500, ls: -0.1 }),
    ]}),

    // Status — typing/generating
    F(20, 80, 190, 22, P.sageLo, { r: 11, stroke: P.sageMid, sw: 1, ch: [
      E(10, 5, 12, 12, P.sage, { opacity: 0.7 }),
      T('Researching · 14 sources', 26, 4, 160, 14, { size: 9, fill: P.sage, weight: 600, ls: 0.3 }),
    ]}),

    // Big editorial confidence display — Awwwards "big type" trend
    T('94%', 20, 112, 200, 72, { size: 64, weight: 900, fill: P.sage, ls: -2 }),
    T('CONFIDENCE', 20, 186, 150, 14, { size: 9, fill: P.fg3, ls: 2, weight: 600 }),
    T('Based on 14 peer-reviewed sources', 20, 202, 300, 14, { size: 10, fill: P.fg2 }),

    // Streaming answer card
    F(20, 224, 350, 164, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
      T('SYNTHESIS', 16, 14, 120, 12, { size: 8, fill: P.fg3, ls: 1.5, weight: 600 }),
      Line(0, 32, 350, P.border),
      T(
        'Constitutional AI (CAI) trains models to be helpful, harmless, and honest by having them critique and revise their own outputs against a written "constitution" of principles.\n\nThe key insight: instead of relying solely on human feedback for harmful outputs, the AI learns to self-identify and correct problematic responses…',
        16, 40, 318, 112, { size: 11, fill: P.fg, lh: 1.6, weight: 400 }
      ),
      // Streaming cursor
      F(70, 146, 8, 14, P.sage, { r: 2 }),
    ]}),

    // Source strip
    T('SOURCES', 20, 400, 100, 12, { size: 8, fill: P.fg3, ls: 1.5, weight: 600 }),
    T('View all 14 →', 270, 398, 100, 14, { size: 10, fill: P.sage, align: 'right', weight: 600 }),

    ...['arxiv.org', 'anthropic.com', 'nature.com', 'openai.com'].map((domain, i) => {
      const row = Math.floor(i / 2);
      const col = i % 2;
      return F(20 + col * 178, 418 + row * 52, 166, 40, P.surface, {
        r: 10, stroke: P.border, sw: 1,
        ch: [
          E(10, 10, 20, 20, P.sage, { opacity: 0.12 }),
          T(String(i + 1), 10, 10, 20, 20, { size: 9, fill: P.sage, weight: 800, align: 'center' }),
          T(domain, 36, 8, 118, 14, { size: 10, fill: P.fg, weight: 500 }),
          T('Primary', 36, 22, 80, 12, { size: 8, fill: P.fg3 }),
        ],
      });
    }),

    // Follow-up suggestions
    T('DIG DEEPER', 20, 532, 150, 12, { size: 8, fill: P.fg3, ls: 1.5, weight: 600 }),
    ...['How does the "constitution" get written?', 'Compare CAI vs RLHF results', 'Real-world safety failures despite CAI'].map((q, i) =>
      F(20, 550 + i * 50, 350, 38, P.surface2, {
        r: 10, stroke: P.border, sw: 1,
        ch: [
          T('→', 12, 10, 20, 18, { size: 12, fill: P.sage }),
          T(q, 34, 11, 300, 16, { size: 11, fill: P.fg2, weight: 500 }),
        ],
      })
    ),

    NavBar(1),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Source Explorer
// ══════════════════════════════════════════════════════════════════════════════
function screenSources(ox) {
  const sources = [
    { num: 1, domain: 'arxiv.org', title: 'Constitutional AI: Harmlessness from AI Feedback', year: 2022, citations: 1840, rel: 98, type: 'Paper' },
    { num: 2, domain: 'anthropic.com', title: "Claude's Constitution — Official Documentation", year: 2023, citations: null, rel: 95, type: 'Docs' },
    { num: 3, domain: 'nature.com', title: 'Value alignment in large language models: a systematic review', year: 2024, citations: 342, rel: 88, type: 'Review' },
    { num: 4, domain: 'openai.com', title: 'RLHF: Aligning language models to follow instructions', year: 2022, citations: 2910, rel: 82, type: 'Paper' },
    { num: 5, domain: 'deepmind.com', title: 'Scalable oversight and AI safety approaches', year: 2024, citations: 189, rel: 74, type: 'Paper' },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    E(-40, 600, 180, 180, P.blue, { opacity: 0.04 }),

    ...StatusBar('14 sources'),

    // Header
    F(20, 42, 28, 28, P.surface2, { r: 8, stroke: P.border, sw: 1, ch: [
      T('←', 0, 6, 28, 16, { size: 13, fill: P.fg2, align: 'center' }),
    ]}),
    T('Source Explorer', 56, 44, 200, 22, { size: 15, weight: 700, fill: P.fg, ls: -0.3 }),
    Pill(280, 46, 'VERIFIED', P.sage, { w: 66 }),

    // Filter chips
    ...['All', 'Papers', 'Docs', 'Reviews'].map((f, i) => {
      const w = [30, 54, 42, 60][i];
      return F(20 + [0, 42, 106, 158][i], 80, w + 20, 26, i === 0 ? P.sage : P.surface2, {
        r: 13, stroke: i === 0 ? P.sage : P.border, sw: 1,
        ch: [ T(f, 0, 6, w + 20, 14, { size: 9, fill: i === 0 ? P.surface : P.fg2, weight: i === 0 ? 700 : 400, align: 'center' }) ],
      });
    }),

    // Coverage summary — editorial big stat
    F(20, 118, 350, 70, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
      VLine(174, 12, 46, P.border),
      T('14', 20, 10, 80, 40, { size: 34, weight: 900, fill: P.sage, ls: -1 }),
      T('SOURCES', 20, 50, 80, 12, { size: 8, fill: P.fg3, ls: 1.5 }),
      T('5,281', 184, 10, 100, 40, { size: 34, weight: 900, fill: P.fg, ls: -1 }),
      T('TOTAL CITATIONS', 184, 50, 160, 12, { size: 8, fill: P.fg3, ls: 1.5 }),
    ]}),

    // Source list
    T('BY RELEVANCE', 20, 200, 180, 12, { size: 8, fill: P.fg3, ls: 1.5, weight: 600 }),

    ...sources.map((src, i) =>
      F(20, 218 + i * 106, 350, 94, P.surface, {
        r: 13, stroke: P.border, sw: 1,
        ch: [
          // Relevance bar — left edge
          F(0, 0, 3, 94, P.sage, { r: 2, opacity: src.rel / 100 }),

          // Source number badge
          E(14, 12, 22, 22, P.sage, { opacity: 0.15 }),
          T(String(src.num), 14, 12, 22, 22, { size: 9, fill: P.sage, weight: 800, align: 'center' }),

          // Content
          T(src.title, 44, 10, 288, 30, { size: 10.5, fill: P.fg, weight: 600, lh: 1.45 }),
          T(src.domain, 44, 44, 120, 12, { size: 8.5, fill: P.fg2 }),
          T(String(src.year), 44, 58, 60, 12, { size: 8.5, fill: P.fg3 }),

          // Type pill
          Pill(270, 44, src.type, P.blue),

          // Relevance %
          T(`${src.rel}%`, 300, 58, 40, 14, { size: 10, fill: P.sage, weight: 700, align: 'right' }),
          T('REL', 320, 72, 24, 10, { size: 7, fill: P.fg3, ls: 0.5 }),

          // Citations
          src.citations ? T(`${src.citations.toLocaleString()} citations`, 44, 72, 140, 12, { size: 8, fill: P.fg3 }) : null,
        ].filter(Boolean),
      })
    ),

    NavBar(2),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Library (saved threads)
// ══════════════════════════════════════════════════════════════════════════════
function screenLibrary(ox) {
  const collections = [
    { name: 'AI Safety & Alignment', count: 12, color: P.sage, updated: 'Today' },
    { name: 'Engineering Deep Dives', count: 8, color: P.blue, updated: 'Yesterday' },
  ];
  const saved = [
    { q: 'Constitutional AI: a deep synthesis', sources: 14, time: '12m ago', tags: ['AI', 'Safety'], note: true },
    { q: 'Rust async runtime internals', sources: 9, time: '2h ago', tags: ['Engineering'], note: false },
    { q: 'Mediterranean diet: what the evidence actually says', sources: 22, time: 'Yesterday', tags: ['Health'], note: true },
    { q: 'Lithium global supply constraints 2025–2035', sources: 11, time: '3d ago', tags: ['Markets', 'Science'], note: false },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    E(280, -30, 160, 160, P.amber, { opacity: 0.06 }),

    ...StatusBar('Library'),

    // Header
    T('Library', 20, 44, 200, 32, { size: 26, weight: 800, fill: P.fg, ls: -0.5 }),
    F(310, 44, 40, 32, P.sage, { r: 10, ch: [
      T('+', 0, 4, 40, 24, { size: 18, fill: P.surface, align: 'center', weight: 300 }),
    ]}),

    // Collections row
    T('COLLECTIONS', 20, 86, 180, 12, { size: 8, fill: P.fg3, ls: 1.5, weight: 600 }),
    ...collections.map((col, i) =>
      F(20 + i * 178, 104, 162, 72, P.surface, {
        r: 14, stroke: P.border, sw: 1,
        ch: [
          F(0, 0, 162, 72, col.color, { r: 14, opacity: 0.06 }),
          T(String(col.count), 14, 10, 60, 28, { size: 22, weight: 900, fill: col.color, ls: -0.5 }),
          T('threads', 14, 38, 80, 14, { size: 9, fill: P.fg3 }),
          T(col.name, 14, 54, 140, 14, { size: 9.5, fill: P.fg, weight: 600, lh: 1.3 }),
          T(col.updated, 126, 10, 28, 12, { size: 8, fill: P.fg3, align: 'right' }),
        ],
      })
    ),

    // Divider
    Line(20, 188, 350, P.border),

    // Search bar
    F(20, 200, 350, 38, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
      T('◎', 12, 9, 20, 20, { size: 13, fill: P.fg3 }),
      T('Search saved research…', 36, 11, 280, 16, { size: 11, fill: P.fg3 }),
    ]}),

    // All saved threads
    T('ALL THREADS', 20, 252, 180, 12, { size: 8, fill: P.fg3, ls: 1.5, weight: 600 }),
    T('Sort ↓', 300, 250, 70, 14, { size: 10, fill: P.sage, align: 'right', weight: 600 }),

    ...saved.map((item, i) =>
      F(20, 270 + i * 108, 350, 96, P.surface, {
        r: 13, stroke: P.border, sw: 1,
        ch: [
          // Bookmark indicator
          item.note ? F(330, 0, 10, 28, P.amber, { r: 2, opacity: 0.8 }) : null,
          // Query
          T(item.q, 14, 12, 310, 34, { size: 11.5, fill: P.fg, weight: 600, lh: 1.45 }),
          // Meta
          T(item.time, 14, 52, 80, 12, { size: 8.5, fill: P.fg3 }),
          T(`${item.sources} sources`, 90, 52, 80, 12, { size: 8.5, fill: P.sage, weight: 600 }),
          // Tags
          ...item.tags.map((tag, j) => Pill(14 + j * 68, 68, tag, P.sage)),
          // Arrow
          T('→', 330, 52, 20, 16, { size: 14, fill: P.fg3 }),
        ].filter(Boolean),
      })
    ),

    NavBar(3),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Synthesis (weekly insight digest)
// ══════════════════════════════════════════════════════════════════════════════
function screenSynthesis(ox) {
  const topics = [
    { label: 'AI / ML', pct: 48, color: P.sage },
    { label: 'Engineering', pct: 22, color: P.blue },
    { label: 'Health & Science', pct: 18, color: P.amber },
    { label: 'Markets', pct: 12, color: P.red },
  ];

  return F(ox, 0, 390, 844, P.bg, { clip: true, ch: [
    E(300, 680, 200, 200, P.sage, { opacity: 0.05 }),
    E(-40, 200, 120, 120, P.amber, { opacity: 0.06 }),

    ...StatusBar('Week of Mar 24'),

    // Header — editorial big type (Awwwards "Unseen Wrapped" influence)
    T('Week', 20, 44, 280, 50, { size: 42, weight: 900, fill: P.fg, ls: -1 }),
    T('in Review', 20, 92, 320, 50, { size: 42, weight: 900, fill: P.sage, ls: -1 }),
    T('Mar 17–24, 2025 · 4 threads · 56 sources', 20, 144, 340, 16, { size: 10.5, fill: P.fg2 }),

    // Top stat trio
    F(20, 168, 350, 66, P.surface, { r: 14, stroke: P.border, sw: 1, ch: [
      VLine(116, 10, 46, P.border),
      VLine(232, 10, 46, P.border),
      T('56', 16, 8, 80, 34, { size: 28, weight: 900, fill: P.sage, ls: -1 }),
      T('SOURCES', 16, 44, 80, 14, { size: 7, fill: P.fg3, ls: 1.5 }),
      T('4', 130, 8, 60, 34, { size: 28, weight: 900, fill: P.fg, ls: -1 }),
      T('THREADS', 130, 44, 80, 14, { size: 7, fill: P.fg3, ls: 1.5 }),
      T('2', 248, 8, 60, 34, { size: 28, weight: 900, fill: P.amber, ls: -1 }),
      T('SAVED NOTES', 248, 44, 100, 14, { size: 7, fill: P.fg3, ls: 1.5 }),
    ]}),

    // Topic breakdown
    T('RESEARCH BREAKDOWN', 20, 248, 240, 12, { size: 8, fill: P.fg3, ls: 1.5, weight: 600 }),

    ...topics.map((t, i) => [
      T(t.label, 20, 268 + i * 42, 160, 14, { size: 11, fill: P.fg, weight: 500 }),
      T(`${t.pct}%`, 330, 268 + i * 42, 40, 14, { size: 11, fill: t.color, weight: 700, align: 'right' }),
      ...Progress(20, 286 + i * 42, 350, t.pct, t.color),
    ]).flat(),

    Line(20, 444, 350, P.border),

    // Key insight card — editorial callout (Awwwards big-type influence)
    F(20, 456, 350, 120, P.surface, { r: 14, stroke: P.sageMid, sw: 1.5, ch: [
      F(0, 0, 350, 120, P.sage, { r: 14, opacity: 0.04 }),
      T('KEY INSIGHT', 16, 14, 200, 12, { size: 8, fill: P.sage, ls: 1.5, weight: 700 }),
      Line(0, 32, 350, P.sageMid),
      T(
        '"Constitutional AI represents a shift from external to internal alignment — the model learns to police itself, reducing the dependency on adversarial red-teaming."',
        16, 42, 318, 68, { size: 10.5, fill: P.fg, lh: 1.6, weight: 400 }
      ),
    ]}),

    // Most cited this week
    T('MOST CITED', 20, 590, 200, 12, { size: 8, fill: P.fg3, ls: 1.5, weight: 600 }),
    ...['arxiv.org · 14 references', 'anthropic.com · 9 references', 'nature.com · 8 references'].map((cite, i) =>
      F(20, 608 + i * 46, 350, 36, P.surface, {
        r: 10, stroke: P.border, sw: 1,
        ch: [
          E(10, 8, 20, 20, P.sage, { opacity: i === 0 ? 0.18 : 0.08 }),
          T(String(i + 1), 10, 8, 20, 20, { size: 9, fill: P.sage, weight: 800, align: 'center' }),
          T(cite, 36, 10, 290, 16, { size: 10.5, fill: P.fg, weight: i === 0 ? 600 : 400 }),
        ],
      })
    ),

    NavBar(4),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// Assemble pen
// ══════════════════════════════════════════════════════════════════════════════
const SCREENS = 5;
const W = 390;
const GAP = 80;
const TOTAL_W = GAP + SCREENS * (W + GAP);  // 80 + 5*(390+80) = 2430

function flatten(node) {
  if (!node) return [];
  const { children, ...rest } = node;
  const kids = (children || []).filter(Boolean);
  return [{ ...rest, children: kids.map(c => flatten(c)).flat() }];
}

// Recursively fix: children should be direct arrays of nodes, not nested
function fix(node) {
  if (!node) return null;
  const kids = (node.children || [])
    .filter(Boolean)
    .map(fix)
    .filter(Boolean);
  return { ...node, children: kids };
}

const screenFns = [
  screenDiscovery,
  screenActiveResearch,
  screenSources,
  screenLibrary,
  screenSynthesis,
];

const screens = screenFns.map((fn, i) => fix(fn(GAP + i * (W + GAP))));

const pen = {
  version: '2.8',
  name: 'SAGE — Research Intelligence, Distilled',
  width: TOTAL_W,
  height: 844,
  fill: P.bg,
  children: screens,
};

const outPath = path.join(__dirname, 'sage.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ sage.pen written — ${screens.length} screens, ${JSON.stringify(pen).length} bytes`);
