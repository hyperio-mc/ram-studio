'use strict';
// axiom-app.js
// AXIOM — AI Model Exchange  (editorial brutalism × deep indigo dark mode)
//
// Challenge: Design a dark-mode AI model marketplace / API hub inspired by:
// 1. SILENCIO (godly.website) — "CONSUME RESPONSIBLY", "LIMITED QUANTITY",
//    "AUTHENTIC DIGITAL PRODUCTS", editorial brutalism, Neue Haas Grotesk,
//    ALL CAPS, anti-design anti-marketing aesthetic
// 2. Stripe Sessions 2026 (godly.website) — deep purple-black #20033C,
//    near-white #F9F7F7, Söhne font, high-contrast type-first layout
// 3. Atlas Card (godly.website) — electric indigo #001391, stark 3-color
//    palette, Sequel Sans, "zero visual noise" product landing
// 4. Dark Mode Design trends (darkmodedesign.com) — Linear, Midday, Forge —
//    clean developer-focused productivity tools with editorial restraint
//
// The synthesis: an API marketplace that treats AI models as limited-edition
// products. Brutalist editorial copy, deep indigo palette, monospace data,
// intentional ALL CAPS navigation — a SaaS product that feels like a gallery.
//
// Palette: deep indigo-black + electric indigo + cool off-white + hot pink
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#050311',   // deep indigo-black (Stripe Sessions ×darker)
  surface:  '#0B0820',   // lifted surface
  surface2: '#110E2B',   // card surface
  surface3: '#171437',   // lighter card
  surface4: '#1E1B43',   // active/hover state
  border:   '#201C45',   // subtle purple border
  border2:  '#2E2860',   // visible border
  muted:    '#4E4882',   // muted purple
  muted2:   '#7B74B0',   // lighter muted
  fg:       '#F4F2FF',   // cool near-white (violet tint)
  fg2:      '#C4BFEE',   // secondary cool text
  accent:   '#3B2EFF',   // electric indigo (Atlas Card #001391 → brightened)
  accentLt: '#6B5FFF',   // lighter indigo for glows
  accent2:  '#FF2E6C',   // hot pink/red (SILENCIO editorial pop)
  green:    '#00E87A',   // neon green (success/online)
  amber:    '#FFB930',   // amber (limited/warning)
  mono:     '#A8FFDC',   // mint (terminal/code output)
};

let _id = 0;
const uid = () => `ax${++_id}`;

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

// ── Electric glow (indigo) ────────────────────────────────────────────────────
const Glow = (cx, cy, r, color) => [
  E(cx - r * 2.5, cy - r * 2.5, r * 5.0, r * 5.0, color + '05'),
  E(cx - r * 1.6, cy - r * 1.6, r * 3.2, r * 3.2, color + '0C'),
  E(cx - r,       cy - r,       r * 2.0, r * 2.0, color + '18'),
  E(cx - r * 0.4, cy - r * 0.4, r * 0.8, r * 0.8, color + '40'),
];

// ── Pill badge ────────────────────────────────────────────────────────────────
const Pill = (x, y, label, color, opts = {}) => {
  const textLen = label.length;
  const w = Math.max(textLen * 6 + 20, 36);
  return F(x, y, w, opts.h || 20, opts.filled ? color : color + '1A', {
    r: opts.r !== undefined ? opts.r : 10,
    stroke: opts.stroke ? color + '44' : undefined,
    ch: [T(label, 0, opts.h ? Math.floor((opts.h - 10) / 2) : 5, w, 10,
      { size: opts.size || 8, fill: opts.filled ? P.bg : color,
        weight: 700, ls: opts.ls !== undefined ? opts.ls : 0.8, align: 'center' })],
  });
};

// ── Status bar ────────────────────────────────────────────────────────────────
const StatusBar = () => [
  T('9:41', 20, 14, 60, 14, { size: 12, weight: 600, fill: P.fg }),
  T('◆ ◆ ◆', 310, 15, 60, 12, { size: 7, fill: P.muted, align: 'right' }),
];

// ── Nav bar (brutalist ALL CAPS) ──────────────────────────────────────────────
const NavBar = (y, active = 0, count = 5) => {
  const labels = ['HOME', 'MODELS', 'CONSOLE', 'USAGE', 'ACCOUNT'];
  const iconW = 390 / count;
  return [
    F(0, y, 390, 56, P.surface, {
      stroke: P.border, sw: 1,
      ch: [
        ...labels.map((l, i) => [
          F(i * iconW, 0, iconW, 56, i === active ? P.surface2 : 'transparent', {
            ch: [
              T(l, 0, 8, iconW, 10,
                { size: 7, fill: i === active ? P.accent : P.muted, weight: 700,
                  ls: 0.8, align: 'center' }),
              F(iconW * 0.35, 36, iconW * 0.30, 2,
                i === active ? P.accent : 'transparent', { r: 1 }),
            ],
          }),
        ]).flat(),
      ],
    }),
  ];
};

// ── Section header (SILENCIO style) ──────────────────────────────────────────
const SectionHead = (x, y, label, sub = '') => [
  T(label.toUpperCase(), x, y, 350, 10, { size: 8, fill: P.accent, weight: 700, ls: 2 }),
  ...(sub ? [T(sub, x, y + 16, 350, 12, { size: 11, fill: P.muted2, weight: 400 })] : []),
];

// ── Model card ────────────────────────────────────────────────────────────────
const ModelCard = (x, y, name, provider, latency, cost, tags, statusColor, available) => {
  const ch = [
    // provider label
    T(provider.toUpperCase(), 14, 12, 200, 9, { size: 7, fill: P.muted, ls: 1.5, weight: 600 }),
    // model name (large, editorial)
    T(name, 14, 26, 250, 22, { size: 16, fill: P.fg, weight: 700, ls: -0.2 }),
    // divider
    Line(14, 54, 292),
    // metrics row
    T('LATENCY', 14, 62, 80, 8, { size: 6, fill: P.muted, ls: 1.5, weight: 700 }),
    T(latency, 14, 72, 80, 13, { size: 11, fill: P.fg, weight: 600 }),
    T('COST / 1K', 100, 62, 80, 8, { size: 6, fill: P.muted, ls: 1.5, weight: 700 }),
    T(cost, 100, 72, 80, 13, { size: 11, fill: P.fg, weight: 600 }),
    // status dot
    E(270, 66, 8, 8, statusColor),
    T(available ? 'AVAILABLE' : 'LIMITED', 282, 67, 70, 9,
      { size: 7, fill: available ? P.green : P.amber, weight: 700, ls: 0.6 }),
    // tags
    ...tags.slice(0, 2).map((tag, i) =>
      Pill(14 + i * 64, 94, tag, P.accentLt, { stroke: true })
    ),
  ];
  return F(x, y, 320, 122, P.surface2, {
    r: 10, stroke: P.border, sw: 1, ch,
  });
};

// ── Benchmark bar ─────────────────────────────────────────────────────────────
const BenchBar = (x, y, label, score, maxScore, color) => {
  const barW = 200;
  const filled = Math.round((score / maxScore) * barW);
  return [
    T(label.toUpperCase(), x, y, 120, 9, { size: 7, fill: P.muted, ls: 1, weight: 600 }),
    T(String(score), x + 220, y, 40, 9, { size: 8, fill: color, weight: 700, align: 'right' }),
    F(x + 130, y + 1, barW, 7, P.border, { r: 3 }),
    F(x + 130, y + 1, Math.max(filled, 4), 7, color, { r: 3 }),
  ];
};

// ── Terminal line ─────────────────────────────────────────────────────────────
const TermLine = (x, y, prefix, content, color = P.fg2) => [
  T(prefix, x, y, 30, 13, { size: 10, fill: P.accentLt, weight: 700 }),
  T(content, x + 24, y, 310, 13, { size: 10, fill: color, lh: 1.5 }),
];

// ── Donut arc (usage chart) ───────────────────────────────────────────────────
// Using concentric rings as stand-in for gauge
const DonutRing = (cx, cy, r, pct, color) => [
  E(cx - r, cy - r, r * 2, r * 2, 'transparent', { stroke: P.border, sw: 10 }),
  // Fill arc (approximated as partial ellipse overlay — use opacity trick)
  E(cx - r * 0.7, cy - r * 0.7, r * 1.4, r * 1.4, color + '28'),
  E(cx - r * 0.3, cy - r * 0.3, r * 0.6, r * 0.6, P.surface2),
];

// ── Usage sparkline (bar chart) ───────────────────────────────────────────────
const Sparkline = (x, y, values, w, h, color) => {
  const max = Math.max(...values);
  const barW = Math.floor(w / values.length) - 2;
  return values.map((v, i) => {
    const bh = Math.max(2, Math.round((v / max) * h));
    return F(x + i * (barW + 2), y + h - bh, barW, bh, color + (i === values.length - 1 ? 'FF' : '66'), { r: 1 });
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 1: HOME — Brutalist hero (SILENCIO aesthetic)
// ─────────────────────────────────────────────────────────────────────────────
const buildScreen1 = () => {
  const ch = [
    // background glow (deep indigo)
    ...Glow(195, 280, 140, P.accent),
    ...Glow(195, 280, 60, P.accent2),

    // status bar
    ...StatusBar(),

    // Header strip — SILENCIO-style ticker
    F(0, 44, 390, 28, P.surface, {
      stroke: P.border, sw: 1,
      ch: [
        T('© AXIOM EXCHANGE  ·  AI MODELS  ·  LIMITED ACCESS  ·  CONSUME RESPONSIBLY  ·  API FIRST  ·  © AXIOM EXCHANGE  ·  AI MODELS  ·',
          8, 10, 900, 10, { size: 8, fill: P.muted, ls: 1, weight: 600 }),
      ],
    }),

    // Giant brutalist wordmark
    T('AX', 20, 84, 350, 90,
      { size: 96, fill: P.fg, weight: 900, ls: -4 }),
    T('IOM', 20, 170, 350, 80,
      { size: 96, fill: P.accent, weight: 900, ls: -4 }),

    // tagline (editorial)
    T('THE AI MODEL EXCHANGE', 20, 268, 300, 12,
      { size: 10, fill: P.muted2, ls: 2.5, weight: 700 }),

    // divider
    Line(20, 290, 350, P.border2),

    // Stats row (brutalist numbers)
    F(20, 302, 104, 56, 'transparent', {
      ch: [
        T('247', 0, 0, 104, 36, { size: 32, fill: P.fg, weight: 900, ls: -1 }),
        T('MODELS LIVE', 0, 38, 104, 10, { size: 7, fill: P.muted, ls: 1.5, weight: 700 }),
      ],
    }),
    F(140, 302, 104, 56, 'transparent', {
      ch: [
        T('99.9%', 0, 0, 104, 36, { size: 28, fill: P.green, weight: 900, ls: -1 }),
        T('UPTIME', 0, 38, 104, 10, { size: 7, fill: P.muted, ls: 1.5, weight: 700 }),
      ],
    }),
    F(258, 302, 112, 56, 'transparent', {
      ch: [
        T('1.2ms', 0, 0, 112, 36, { size: 28, fill: P.amber, weight: 900, ls: -1 }),
        T('AVG LATENCY', 0, 38, 112, 10, { size: 7, fill: P.muted, ls: 1.5, weight: 700 }),
      ],
    }),

    // "CONSUME RESPONSIBLY" badge — SILENCIO reference
    F(20, 376, 230, 24, P.accent2 + '1A', {
      r: 4, stroke: P.accent2 + '44', sw: 1,
      ch: [
        T('⚠  CONSUME RESPONSIBLY', 12, 8, 200, 9,
          { size: 8, fill: P.accent2, weight: 700, ls: 1.2 }),
      ],
    }),

    // divider
    Line(20, 416, 350, P.border),

    // Featured models section
    ...SectionHead(20, 428, 'FEATURED THIS WEEK', '3 new models added'),

    // Model card
    ModelCard(20, 456, 'GPT-4o Ultra', 'OPENAI', '142ms', '$0.018', ['VISION', 'CODE'], P.green, true),

    // Second card
    ModelCard(20, 588, 'Claude 4 Sonnet', 'ANTHROPIC', '89ms', '$0.014', ['ANALYSIS', 'LONG CTX'], P.amber, false),

    // CTA button
    F(20, 720, 350, 44, P.accent, {
      r: 6,
      ch: [
        T('BROWSE ALL MODELS →', 0, 15, 350, 14,
          { size: 11, fill: P.fg, weight: 700, ls: 2, align: 'center' }),
      ],
    }),

    // Nav bar
    ...NavBar(788, 0),
  ];

  return {
    id: uid(), type: 'frame', x: 0, y: 0, width: 390, height: 844,
    fill: P.bg, children: ch,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 2: MODEL BROWSER — Grid of AI models
// ─────────────────────────────────────────────────────────────────────────────
const buildScreen2 = () => {
  const models = [
    { name: 'GPT-4o Ultra',   provider: 'OPENAI',    lat: '142ms', cost: '$0.018', tags: ['VISION', 'CODE'],   col: P.green, avail: true  },
    { name: 'Claude 4',       provider: 'ANTHROPIC', lat: '89ms',  cost: '$0.014', tags: ['LONG CTX'],         col: P.amber, avail: false },
    { name: 'Gemini 2.5 Pro', provider: 'GOOGLE',    lat: '210ms', cost: '$0.011', tags: ['MULTIMODAL'],       col: P.green, avail: true  },
    { name: 'Llama 4 Scout',  provider: 'META',      lat: '61ms',  cost: '$0.003', tags: ['OPEN', 'FAST'],     col: P.green, avail: true  },
    { name: 'Mistral Large',  provider: 'MISTRAL',   lat: '78ms',  cost: '$0.006', tags: ['EU', 'PRIVATE'],    col: P.green, avail: true  },
  ];

  const ch = [
    // status bar
    ...StatusBar(),

    // Page header
    T('MODELS', 20, 48, 200, 30, { size: 28, fill: P.fg, weight: 900, ls: -0.5 }),
    T(models.length + ' MODELS AVAILABLE', 20, 82, 200, 10,
      { size: 7, fill: P.muted, ls: 2, weight: 700 }),

    // Filter chips
    ...['ALL', 'TEXT', 'VISION', 'FAST', 'CHEAP', 'OPEN'].map((f, i) =>
      Pill(20 + i * 54, 102, f, i === 0 ? P.accent : P.muted2,
        { stroke: true, h: 22, r: 4, size: 7, ls: 0.8, filled: i === 0 })
    ),

    // Sort bar
    F(20, 136, 350, 20, 'transparent', {
      ch: [
        T('SORT BY:', 0, 5, 60, 10, { size: 7, fill: P.muted, ls: 1, weight: 700 }),
        T('POPULARITY ▾', 70, 5, 100, 10, { size: 7, fill: P.accent, ls: 1, weight: 700 }),
      ],
    }),

    Line(20, 160, 350, P.border),

    // Model cards
    ...models.slice(0, 4).map((m, i) =>
      ModelCard(20, 170 + i * 133, m.name, m.provider, m.lat, m.cost, m.tags, m.col, m.avail)
    ),

    // Nav bar
    ...NavBar(788, 1),
  ];

  return {
    id: uid(), type: 'frame',
    x: 410, y: 0, width: 390, height: 844,
    fill: P.bg, children: ch,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 3: API CONSOLE — Terminal playground
// ─────────────────────────────────────────────────────────────────────────────
const buildScreen3 = () => {
  const ch = [
    // Indigo glow behind console
    ...Glow(195, 500, 100, P.accent),

    ...StatusBar(),

    // Header
    T('API CONSOLE', 20, 48, 250, 14, { size: 13, fill: P.fg, weight: 900, ls: 1 }),
    Pill(200, 50, 'BETA', P.accent2, { stroke: true, size: 7 }),

    // Model selector
    F(20, 72, 350, 36, P.surface2, {
      r: 6, stroke: P.border, sw: 1,
      ch: [
        T('MODEL', 14, 8, 60, 8, { size: 7, fill: P.muted, ls: 1.5, weight: 700 }),
        T('GPT-4o Ultra', 14, 20, 200, 12, { size: 11, fill: P.fg, weight: 600 }),
        T('▾', 320, 14, 20, 14, { size: 12, fill: P.accent, align: 'right' }),
      ],
    }),

    // Request editor
    ...SectionHead(20, 120, 'REQUEST'),
    F(20, 138, 350, 164, P.surface, {
      r: 8, stroke: P.border2, sw: 1, clip: true,
      ch: [
        // terminal prompt lines
        F(0, 0, 350, 164, P.surface, {
          ch: [
            // line numbers
            F(0, 0, 28, 164, P.surface2, {
              ch: ['1','2','3','4','5','6','7','8'].map((n, i) =>
                T(n, 0, 10 + i * 19, 28, 12, { size: 9, fill: P.muted, align: 'center' })
              ),
            }),
            // code lines
            ...TermLine(36, 12, '', '{', P.border2),
            ...TermLine(36, 30, '', '  "model": "gpt-4o-ultra",', P.mono),
            ...TermLine(36, 48, '', '  "messages": [', P.fg2),
            ...TermLine(36, 66, '', '    { "role": "user",', P.fg2),
            ...TermLine(36, 84, '', '      "content": "Explain', P.amber),
            ...TermLine(36, 102, '', '       quantum entanglement"', P.amber),
            ...TermLine(36, 120, '', '    }', P.fg2),
            ...TermLine(36, 138, '', '  ], "max_tokens": 800', P.fg2),
          ],
        }),
      ],
    }),

    // Run button
    F(20, 312, 350, 40, P.accent, {
      r: 6,
      ch: [
        T('▶  RUN REQUEST', 0, 14, 350, 12,
          { size: 10, fill: P.fg, weight: 700, ls: 2, align: 'center' }),
      ],
    }),

    // Response section
    ...SectionHead(20, 366, 'RESPONSE'),

    // Metrics strip
    F(20, 384, 350, 32, P.surface2, {
      r: 6, stroke: P.border,
      ch: [
        T('LATENCY', 14, 6, 60, 8, { size: 6, fill: P.muted, ls: 1.5, weight: 700 }),
        T('138ms', 14, 18, 60, 10, { size: 9, fill: P.green, weight: 700 }),
        T('TOKENS', 100, 6, 60, 8, { size: 6, fill: P.muted, ls: 1.5, weight: 700 }),
        T('812', 100, 18, 60, 10, { size: 9, fill: P.fg, weight: 700 }),
        T('COST', 186, 6, 60, 8, { size: 6, fill: P.muted, ls: 1.5, weight: 700 }),
        T('$0.015', 186, 18, 60, 10, { size: 9, fill: P.amber, weight: 700 }),
        Pill(264, 9, 'SUCCESS', P.green, { h: 16, r: 4, size: 6 }),
      ],
    }),

    // Response output
    F(20, 426, 350, 200, P.surface, {
      r: 8, stroke: P.border, sw: 1, clip: true,
      ch: [
        F(0, 0, 350, 200, P.surface, {
          ch: [
            F(0, 0, 28, 200, P.surface2, {
              ch: ['1','2','3','4','5','6','7','8','9','10'].map((n, i) =>
                T(n, 0, 8 + i * 19, 28, 12, { size: 9, fill: P.muted, align: 'center' })
              ),
            }),
            T('Quantum entanglement is a phenomenon', 36, 8, 300, 12, { size: 9, fill: P.mono, weight: 400 }),
            T('where two particles become connected', 36, 26, 300, 12, { size: 9, fill: P.mono }),
            T('in such a way that the state of one', 36, 44, 300, 12, { size: 9, fill: P.mono }),
            T('instantly correlates with the state', 36, 62, 300, 12, { size: 9, fill: P.mono }),
            T('of the other — no matter how far', 36, 80, 300, 12, { size: 9, fill: P.mono }),
            T('apart they are. Einstein called it', 36, 98, 300, 12, { size: 9, fill: P.mono }),
            T('"spooky action at a distance."', 36, 116, 300, 12, { size: 9, fill: P.amber }),
          ],
        }),
      ],
    }),

    // History button
    F(20, 640, 168, 36, P.surface2, {
      r: 6, stroke: P.border,
      ch: [T('HISTORY ↑', 0, 13, 168, 10, { size: 9, fill: P.muted2, weight: 700, ls: 1, align: 'center' })],
    }),
    F(202, 640, 168, 36, P.surface2, {
      r: 6, stroke: P.border,
      ch: [T('SAVE →', 0, 13, 168, 10, { size: 9, fill: P.accent, weight: 700, ls: 1, align: 'center' })],
    }),

    // Nav bar
    ...NavBar(788, 2),
  ];

  return {
    id: uid(), type: 'frame',
    x: 820, y: 0, width: 390, height: 844,
    fill: P.bg, children: ch,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 4: USAGE ANALYTICS — Bento grid dashboard
// ─────────────────────────────────────────────────────────────────────────────
const buildScreen4 = () => {
  const sparkData = [44, 58, 72, 51, 88, 96, 110, 103, 142, 139, 167, 180, 196, 220];

  const ch = [
    ...StatusBar(),

    T('USAGE', 20, 48, 200, 24, { size: 22, fill: P.fg, weight: 900, ls: -0.5 }),
    T('MARCH 2026', 20, 76, 200, 10, { size: 8, fill: P.muted, ls: 2, weight: 700 }),

    // Period tabs
    ...['7D', '30D', '90D', 'ALL'].map((t, i) =>
      F(20 + i * 56, 96, 48, 22, i === 1 ? P.surface3 : 'transparent', {
        r: 4, stroke: i === 1 ? P.border2 : undefined,
        ch: [T(t, 0, 7, 48, 10, { size: 8, fill: i === 1 ? P.fg : P.muted, weight: 700, ls: 0.5, align: 'center' })],
      })
    ),

    Line(20, 124, 350, P.border),

    // ── Bento grid ──
    // Requests card (wide)
    F(20, 134, 350, 88, P.surface2, {
      r: 10, stroke: P.border,
      ch: [
        T('REQUESTS', 14, 12, 100, 8, { size: 7, fill: P.muted, ls: 2, weight: 700 }),
        T('2,847,392', 14, 26, 220, 34, { size: 30, fill: P.fg, weight: 900, ls: -1 }),
        T('↑ 22% vs last period', 14, 66, 180, 10, { size: 8, fill: P.green, weight: 600 }),
        // sparkline
        ...Sparkline(230, 18, sparkData, 110, 56, P.accent),
      ],
    }),

    // Cost card (half)
    F(20, 232, 168, 88, P.surface2, {
      r: 10, stroke: P.border,
      ch: [
        T('SPEND', 14, 12, 100, 8, { size: 7, fill: P.muted, ls: 2, weight: 700 }),
        T('$284.11', 14, 26, 140, 28, { size: 22, fill: P.amber, weight: 900, ls: -0.5 }),
        T('of $500 budget', 14, 60, 140, 10, { size: 8, fill: P.muted2 }),
        F(14, 72, 140, 6, P.border, { r: 3, ch: [F(0, 0, 80, 6, P.amber, { r: 3 })] }),
      ],
    }),

    // Quota card (half)
    F(202, 232, 168, 88, P.surface2, {
      r: 10, stroke: P.border,
      ch: [
        T('QUOTA', 14, 12, 100, 8, { size: 7, fill: P.muted, ls: 2, weight: 700 }),
        T('56.8%', 14, 26, 140, 28, { size: 22, fill: P.accentLt, weight: 900, ls: -0.5 }),
        T('1.42M / 2.5M tokens', 14, 60, 140, 10, { size: 8, fill: P.muted2 }),
        F(14, 72, 140, 6, P.border, { r: 3, ch: [F(0, 0, 80, 6, P.accentLt, { r: 3 })] }),
      ],
    }),

    // Model breakdown
    ...SectionHead(20, 334, 'BY MODEL'),
    ...['GPT-4o Ultra', 'Claude 4', 'Llama 4 Scout', 'Gemini 2.5'].map((m, i) => {
      const pcts = [42, 28, 18, 12];
      const colors = [P.accent, P.accent2, P.green, P.amber];
      const pct = pcts[i];
      return [
        F(20, 354 + i * 42, 350, 34, P.surface2, {
          r: 6, stroke: P.border,
          ch: [
            T(m, 14, 12, 160, 12, { size: 11, fill: P.fg, weight: 600 }),
            T(pct + '%', 280, 12, 56, 12, { size: 11, fill: colors[i], weight: 700, align: 'right' }),
            F(14, 26, 322, 4, P.border, {
              r: 2,
              ch: [F(0, 0, Math.round(322 * pct / 100), 4, colors[i], { r: 2 })],
            }),
          ],
        }),
      ];
    }).flat(),

    // Errors card
    F(20, 530, 350, 70, P.surface2, {
      r: 10, stroke: P.border,
      ch: [
        T('ERROR RATE', 14, 12, 120, 8, { size: 7, fill: P.muted, ls: 2, weight: 700 }),
        T('0.12%', 14, 26, 100, 26, { size: 22, fill: P.green, weight: 900 }),
        T('↓ 0.04% vs last period — EXCELLENT', 120, 30, 220, 10, { size: 7, fill: P.green, ls: 0.5 }),
        ...Sparkline(120, 40, [2,1,3,1,2,0,1,2,1,0,1,2,1,1], 220, 20, P.green),
      ],
    }),

    // Export button
    F(20, 614, 350, 36, P.surface, {
      r: 6, stroke: P.border,
      ch: [T('EXPORT REPORT  →', 0, 13, 350, 10, { size: 9, fill: P.muted2, weight: 700, ls: 1.5, align: 'center' })],
    }),

    // Nav bar
    ...NavBar(788, 3),
  ];

  return {
    id: uid(), type: 'frame',
    x: 1230, y: 0, width: 390, height: 844,
    fill: P.bg, children: ch,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 5: MODEL DETAIL — SILENCIO "product page" aesthetic
// ─────────────────────────────────────────────────────────────────────────────
const buildScreen5 = () => {
  const ch = [
    ...Glow(195, 200, 90, P.accent),

    ...StatusBar(),

    // Back + model header
    T('← MODELS', 20, 50, 100, 10, { size: 9, fill: P.muted, weight: 700, ls: 0.5 }),

    // Model name — SILENCIO oversized editorial style
    T('GPT-4o', 20, 74, 350, 44, { size: 44, fill: P.fg, weight: 900, ls: -1.5 }),
    T('ULTRA', 20, 114, 350, 44, { size: 44, fill: P.accent, weight: 900, ls: -1.5 }),

    // Provider + availability
    T('BY OPENAI  ·  ONE REF. PRODUCT', 20, 162, 300, 10,
      { size: 7, fill: P.muted, ls: 1.5, weight: 700 }),
    Pill(20, 178, 'AVAILABLE NOW', P.green, { stroke: true, h: 22, r: 4, size: 7 }),
    Pill(104, 178, 'GPT-4 FAMILY', P.muted2, { stroke: true, h: 22, r: 4, size: 7 }),

    Line(20, 210, 350, P.border2),

    // Key specs grid
    F(20, 222, 350, 70, P.surface2, {
      r: 8, stroke: P.border,
      ch: [
        // 3 specs
        F(0, 0, 116, 70, 'transparent', {
          ch: [
            T('LATENCY', 14, 12, 88, 8, { size: 6, fill: P.muted, ls: 1.5, weight: 700 }),
            T('142ms', 14, 26, 88, 22, { size: 18, fill: P.fg, weight: 900 }),
            T('p50 median', 14, 52, 88, 9, { size: 8, fill: P.muted2 }),
          ],
        }),
        F(1, 10, 1, 50, P.border, {}),
        F(118, 0, 116, 70, 'transparent', {
          ch: [
            T('CTX WINDOW', 14, 12, 88, 8, { size: 6, fill: P.muted, ls: 1.5, weight: 700 }),
            T('128K', 14, 26, 88, 22, { size: 18, fill: P.accent, weight: 900 }),
            T('tokens', 14, 52, 88, 9, { size: 8, fill: P.muted2 }),
          ],
        }),
        F(1, 10, 1, 50, P.border, {}),
        F(236, 0, 114, 70, 'transparent', {
          ch: [
            T('COST/1K', 14, 12, 86, 8, { size: 6, fill: P.muted, ls: 1.5, weight: 700 }),
            T('$0.018', 14, 26, 86, 22, { size: 18, fill: P.amber, weight: 900 }),
            T('input tokens', 14, 52, 86, 9, { size: 8, fill: P.muted2 }),
          ],
        }),
      ],
    }),

    // Capabilities
    ...SectionHead(20, 306, 'CAPABILITIES'),
    ...['Text Generation', 'Code Synthesis', 'Vision / Image', 'Function Calling', 'Long Context'].map((cap, i) => {
      const enabled = [true, true, true, true, true];
      return F(20, 326 + i * 34, 350, 26, P.surface, {
        r: 5, stroke: P.border,
        ch: [
          T(cap.toUpperCase(), 14, 9, 220, 10, { size: 8, fill: enabled[i] ? P.fg : P.muted, ls: 0.5, weight: 600 }),
          F(316, 9, 10, 10, enabled[i] ? P.green : P.muted, { r: 5 }),
        ],
      });
    }),

    // Benchmarks
    ...SectionHead(20, 504, 'BENCHMARKS · MMLU / HumanEval / MT-Bench'),
    ...BenchBar(20, 526, 'MMLU', 92.4, 100, P.accentLt),
    ...BenchBar(20, 550, 'HUMANEVAL', 88.1, 100, P.accent2),
    ...BenchBar(20, 574, 'MT-BENCH', 9.4, 10, P.amber),

    // SILENCIO-style warning copy
    F(20, 610, 350, 32, P.accent2 + '15', {
      r: 6, stroke: P.accent2 + '33',
      ch: [
        T('VERY LIMITED CAPACITY AVAILABLE  ·  REQUEST DEMO', 14, 12, 322, 9,
          { size: 7, fill: P.accent2, weight: 700, ls: 1.2 }),
      ],
    }),

    // CTA buttons
    F(20, 654, 168, 44, P.accent, {
      r: 6,
      ch: [T('ADD TO PROJECT', 0, 16, 168, 12, { size: 9, fill: P.fg, weight: 700, ls: 1, align: 'center' })],
    }),
    F(202, 654, 168, 44, P.surface2, {
      r: 6, stroke: P.border,
      ch: [T('VIEW DOCS →', 0, 16, 168, 12, { size: 9, fill: P.fg, weight: 700, ls: 1, align: 'center' })],
    }),

    // Nav bar
    ...NavBar(788, 1),
  ];

  return {
    id: uid(), type: 'frame',
    x: 1640, y: 0, width: 390, height: 844,
    fill: P.bg, children: ch,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Assemble .pen file
// ─────────────────────────────────────────────────────────────────────────────
const screens = [
  buildScreen1(),
  buildScreen2(),
  buildScreen3(),
  buildScreen4(),
  buildScreen5(),
];

const pen = {
  id: 'axiom-design',
  version: '2.8',
  name: 'AXIOM — AI Model Exchange',
  description: 'Editorial brutalism × deep indigo dark mode. An AI model marketplace designed as a gallery product.',
  children: screens,
};

const outPath = path.join(__dirname, 'axiom.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ Written: ${outPath} (${screens.length} screens)`);
console.log(`  Palette: ${JSON.stringify({ bg: P.bg, accent: P.accent, fg: P.fg, accent2: P.accent2 })}`);
