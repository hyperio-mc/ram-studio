// geo-signal.js
// GEO Score Tracker — "Signal" dark analytics dashboard
// Bloomberg Terminal meets Linear aesthetic
// pencil.dev v2.8

const fs = require('fs');

const vars = {
  bg:        { type: "color", value: "#0a0d14" },
  panel:     { type: "color", value: "#111827" },
  border:    { type: "color", value: "#1f2937" },
  accent:    { type: "color", value: "#3b82f6" },
  accentDim: { type: "color", value: "#1e3a5f" },
  text:      { type: "color", value: "#f1f5f9" },
  muted:     { type: "color", value: "#64748b" },
  green:     { type: "color", value: "#22c55e" },
  red:       { type: "color", value: "#ef4444" },
  yellow:    { type: "color", value: "#f59e0b" },
  purple:    { type: "color", value: "#a855f7" },
};

const W = 375;

const T = (content, x, y, w, h, opts = {}) => ({
  type: "text", content, x, y, width: w, height: h,
  textGrowth: "fixed-width-height",
  fontSize: opts.size || 13,
  fontWeight: String(opts.weight || 400),
  fill: opts.fill || "$text",
  textAlign: opts.align || "left",
  ...(opts.ls ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh ? { lineHeight: opts.lh } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const R = (x, y, w, h, fill, opts = {}) => ({
  type: "frame", x, y, width: w, height: h,
  fill: fill || "transparent",
  ...(opts.r !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke ? { stroke: { align: "inside", thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.ch || [],
});

const Rect = (x, y, w, h, fill, op) => ({
  type: "rectangle", x, y, width: w, height: h,
  fill: fill || "$accent",
  ...(op !== undefined ? { opacity: op } : {}),
});

const E = (x, y, r, fill) => ({
  type: "ellipse", x: x - r, y: y - r, width: r * 2, height: r * 2,
  fill: fill || "$accent",
});

// ── TOP BAR (shared) ───────────────────────────────────────────
const topBar = () => R(0, 0, W, 48, "$panel", {
  stroke: "$border", sw: 1,
  ch: [
    Rect(0, 47, W, 1, "$border"),
    T("> geo", 16, 14, 60, 20, { size: 14, weight: 800, fill: "$accent", ls: 1 }),
    T("overview", 100, 16, 56, 16, { size: 10, weight: 500, fill: "$muted", ls: 0.5 }),
    T("scans", 162, 16, 40, 16, { size: 10, weight: 500, fill: "$muted", ls: 0.5 }),
    T("prompts", 207, 16, 50, 16, { size: 10, weight: 500, fill: "$muted", ls: 0.5 }),
    T("alerts", 263, 16, 40, 16, { size: 10, weight: 500, fill: "$muted", ls: 0.5 }),
  ],
});

// ── BOTTOM NAV (shared) ─────────────────────────────────────────
const bottomNav = () => R(0, 756, W, 56, "$panel", {
  stroke: "$border", sw: 1,
  ch: [
    Rect(0, 0, W, 1, "$border"),
    T("~", 18, 10, 20, 16, { size: 14, weight: 600, fill: "$accent", align: "center" }),
    T("home", 8, 30, 40, 14, { size: 8, weight: 500, fill: "$accent", align: "center", ls: 0.5 }),
    T("#", 90, 10, 20, 16, { size: 14, weight: 600, fill: "$muted", align: "center" }),
    T("scan", 80, 30, 40, 14, { size: 8, weight: 500, fill: "$muted", align: "center", ls: 0.5 }),
    T("@", 162, 10, 20, 16, { size: 14, weight: 600, fill: "$muted", align: "center" }),
    T("prompt", 148, 30, 48, 14, { size: 8, weight: 500, fill: "$muted", align: "center", ls: 0.5 }),
    T("!", 234, 10, 20, 16, { size: 14, weight: 600, fill: "$muted", align: "center" }),
    T("alert", 222, 30, 44, 14, { size: 8, weight: 500, fill: "$muted", align: "center", ls: 0.5 }),
    T("*", 305, 10, 20, 16, { size: 14, weight: 600, fill: "$muted", align: "center" }),
    T("report", 293, 30, 44, 14, { size: 8, weight: 500, fill: "$muted", align: "center", ls: 0.5 }),
  ],
});

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 1: Dashboard (x=0)
// ─────────────────────────────────────────────────────────────────────────────
const screen1 = {
  type: "frame", name: "Signal — Dashboard",
  x: 0, y: 0, width: W, height: 812,
  fill: "$bg", clip: true,
  children: [
    topBar(),

    // Score card
    R(16, 64, W - 32, 160, "$panel", {
      r: 12, stroke: "$border", sw: 1,
      ch: [
        T("73", 0, 16, W - 32, 72, { size: 72, weight: 700, fill: "$text", align: "center" }),
        T("GEO SCORE", 0, 92, W - 32, 16, { size: 10, weight: 600, fill: "$muted", align: "center", ls: 2 }),
        // 3 mini stats
        R(12, 116, 100, 32, "$bg", { r: 6, ch: [
          T("MENTION RATE", 8, 4, 84, 12, { size: 8, weight: 600, fill: "$muted", ls: 0.8 }),
          T("68%", 8, 16, 84, 14, { size: 13, weight: 700, fill: "$green" }),
        ]}),
        R(119, 116, 100, 32, "$bg", { r: 6, ch: [
          T("POSITION", 8, 4, 84, 12, { size: 8, weight: 600, fill: "$muted", ls: 0.8 }),
          T("81", 8, 16, 84, 14, { size: 13, weight: 700, fill: "$accent" }),
        ]}),
        R(226, 116, 101, 32, "$bg", { r: 6, ch: [
          T("SENTIMENT", 8, 4, 85, 12, { size: 8, weight: 600, fill: "$muted", ls: 0.8 }),
          T("74", 8, 16, 85, 14, { size: 13, weight: 700, fill: "$purple" }),
        ]}),
        T("+4.2 pts this week", 0, 152, W - 32, 12, { size: 10, weight: 600, fill: "$green", align: "center" }),
      ],
    }),

    // Platform grid label
    T("PLATFORM SCORES", 16, 242, 200, 14, { size: 9, weight: 700, fill: "$muted", ls: 1.5 }),

    // Platform rows
    ...[
      { name: "GPT-4o",     score: 78, pct: 0.78, fill: "$accent" },
      { name: "Claude 3.5", score: 71, pct: 0.71, fill: "$purple" },
      { name: "Perplexity", score: 82, pct: 0.82, fill: "$green" },
      { name: "Gemini",     score: 65, pct: 0.65, fill: "$yellow" },
    ].map((p, i) => {
      const barW = 220;
      return R(16, 260 + i * 44, W - 32, 36, "$panel", {
        r: 6, stroke: "$border", sw: 1,
        ch: [
          T(p.name, 12, 10, 80, 16, { size: 11, weight: 600 }),
          Rect(100, 14, barW, 8, "$border"),
          Rect(100, 14, Math.round(barW * p.pct), 8, p.fill),
          T(String(p.score), W - 32 - 40, 10, 28, 16, { size: 11, weight: 700, fill: p.fill, align: "right" }),
        ],
      });
    }),

    // SOV section
    T("SHARE OF VOICE", 16, 446, 200, 14, { size: 9, weight: 700, fill: "$muted", ls: 1.5 }),
    R(16, 464, W - 32, 120, "$panel", {
      r: 8, stroke: "$border", sw: 1,
      ch: [
        // Stacked bar
        Rect(12, 12, 127, 20, "$accent"),
        Rect(139, 12, 105, 20, "$red"),
        Rect(244, 12, 82, 20, "$yellow"),
        Rect(326, 12, 15, 20, "$muted"),
        // Labels
        T("SurrealDB 34%", 12, 40, 110, 14, { size: 9, weight: 600, fill: "$accent" }),
        T("MongoDB 28%", 122, 40, 95, 14, { size: 9, weight: 600, fill: "$red" }),
        T("PostgreSQL 22%", 217, 40, 100, 14, { size: 9, weight: 600, fill: "$yellow" }),
        T("Neo4j 16%", 12, 58, 80, 14, { size: 9, weight: 500, fill: "$muted" }),
        // Legend dots
        E(12 + 4, 78 + 4, 4, "$accent"),
        T("SurrealDB", 22, 72, 80, 14, { size: 9, fill: "$muted" }),
        E(112 + 4, 78 + 4, 4, "$red"),
        T("MongoDB", 122, 72, 70, 14, { size: 9, fill: "$muted" }),
        E(202 + 4, 78 + 4, 4, "$yellow"),
        T("PostgreSQL", 212, 72, 80, 14, { size: 9, fill: "$muted" }),
        E(302 + 4, 78 + 4, 4, "$muted"),
        T("Neo4j", 312, 72, 40, 14, { size: 9, fill: "$muted" }),
      ],
    }),

    // Recent alerts
    T("RECENT ALERTS", 16, 598, 200, 14, { size: 9, weight: 700, fill: "$muted", ls: 1.5 }),
    R(16, 616, W - 32, 48, "$panel", {
      r: 6, stroke: "$border", sw: 1,
      ch: [
        E(20, 24, 4, "$red"),
        T("Score drop detected  -8pts", 32, 10, 280, 14, { size: 11, weight: 500 }),
        T("2h ago", W - 32 - 50, 10, 40, 14, { size: 9, fill: "$muted", align: "right" }),
      ],
    }),
    R(16, 668, W - 32, 48, "$panel", {
      r: 6, stroke: "$border", sw: 1,
      ch: [
        E(20, 24, 4, "$green"),
        T("New citation: docs.surrealdb.com", 32, 10, 280, 14, { size: 11, weight: 500 }),
        T("4h ago", W - 32 - 50, 10, 40, 14, { size: 9, fill: "$muted", align: "right" }),
      ],
    }),

    bottomNav(),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 2: Scan Results (x=425)
// ─────────────────────────────────────────────────────────────────────────────

const scorePill = (x, y, score, color) => R(x, y, 36, 20, color, {
  r: 4, ch: [
    T(String(score), 0, 2, 36, 16, { size: 10, weight: 700, fill: "$bg", align: "center" }),
  ],
});

const screen2 = {
  type: "frame", name: "Signal — Scan Results",
  x: 425, y: 0, width: W, height: 812,
  fill: "$bg", clip: true,
  children: [
    topBar(),

    // Scan header
    T("RUN #2847", 16, 68, 200, 28, { size: 22, weight: 700 }),
    T("Mar 13 2026  09:14", 16, 98, 200, 16, { size: 11, fill: "$muted" }),
    R(W - 100, 72, 80, 24, "#052e16", {
      r: 6, stroke: "$green", sw: 1,
      ch: [T("COMPLETE", 0, 4, 80, 16, { size: 9, weight: 700, fill: "$green", align: "center", ls: 0.8 })],
    }),

    // Stats row
    ...[
      { label: "15 PROMPTS", x: 16 },
      { label: "6 PLATFORMS", x: 144 },
      { label: "$0.43 COST", x: 272 },
    ].map(s => R(s.x, 120, 112, 44, "$panel", {
      r: 6, stroke: "$border", sw: 1,
      ch: [T(s.label, 0, 13, 112, 18, { size: 10, weight: 700, fill: "$text", align: "center", ls: 0.5 })],
    })),

    // Prompt results
    T("PROMPT RESULTS", 16, 178, 200, 14, { size: 9, weight: 700, fill: "$muted", ls: 1.5 }),

    ...[
      { prompt: "What database for AI agent memory?",    plats: "GPT CL PX", score: 88, color: "$green" },
      { prompt: "Best multi-model database 2025?",       plats: "GPT CL PX", score: 71, color: "$yellow" },
      { prompt: "SurrealDB vs MongoDB realtime?",        plats: "GPT CL",    score: 64, color: "$yellow" },
      { prompt: "Vector + graph database?",              plats: "GPT PX",    score: 91, color: "$green" },
      { prompt: "Rust backend database?",                plats: "GPT CL PX", score: 55, color: "$yellow" },
      { prompt: "ACID + graph queries?",                 plats: "GPT CL PX", score: 77, color: "$accent" },
      { prompt: "Knowledge graph semantic search?",      plats: "PX",        score: 83, color: "$green" },
      { prompt: "AI-native database 2025?",              plats: "all",       score: 69, color: "$yellow" },
    ].map((row, i) => R(16, 196 + i * 56, W - 32, 48, "$panel", {
      r: 6, stroke: "$border", sw: 1,
      ch: [
        T(row.prompt, 12, 8, 210, 14, { size: 10, weight: 500 }),
        T(row.plats, 12, 26, 110, 14, { size: 9, fill: "$muted" }),
        scorePill(W - 32 - 44, 14, row.score, row.color),
      ],
    })),

    bottomNav(),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 3: Competitor Intel (x=850)
// ─────────────────────────────────────────────────────────────────────────────
const screen3 = {
  type: "frame", name: "Signal — Competitor Intel",
  x: 850, y: 0, width: W, height: 812,
  fill: "$bg", clip: true,
  children: [
    topBar(),

    T("COMPETITOR INTEL", 16, 62, 300, 20, { size: 13, weight: 700, ls: 1.5 }),

    // Brand selector tabs
    ...[
      { label: "SurrealDB", active: true,  x: 16 },
      { label: "MongoDB",   active: false, x: 104 },
      { label: "PostgreSQL",active: false, x: 179 },
      { label: "Neo4j",     active: false, x: 278 },
    ].map(tab => R(tab.x, 90, tab.label.length * 7 + 16, 28, tab.active ? "$accentDim" : "transparent", {
      r: 6,
      stroke: tab.active ? "$accent" : "$border", sw: 1,
      ch: [T(tab.label, 8, 6, tab.label.length * 7, 16, { size: 10, weight: tab.active ? 700 : 400, fill: tab.active ? "$accent" : "$muted" })],
    })),

    // Co-mention heatmap
    T("CO-MENTION HEATMAP", 16, 136, 240, 14, { size: 9, weight: 700, fill: "$muted", ls: 1.5 }),
    R(16, 154, W - 32, 168, "$panel", {
      r: 8, stroke: "$border", sw: 1,
      ch: [
        // Header row
        T("", 8, 8, 80, 14, { size: 9, fill: "$muted" }),
        T("MongoDB", 100, 8, 60, 14, { size: 9, fill: "$muted", align: "center" }),
        T("PgSQL", 168, 8, 50, 14, { size: 9, fill: "$muted", align: "center" }),
        T("Neo4j", 226, 8, 50, 14, { size: 9, fill: "$muted", align: "center" }),
        T("Supabase", 282, 8, 56, 14, { size: 9, fill: "$muted", align: "center" }),
        // Rows
        ...[
          { label: "db selection", vals: [0.8, 0.5, 0.3, 0.4] },
          { label: "ai backends",  vals: [0.4, 0.2, 0.2, 0.7] },
          { label: "graph data",   vals: [0.3, 0.2, 0.9, 0.1] },
          { label: "real-time",    vals: [0.5, 0.3, 0.2, 0.6] },
        ].flatMap((row, ri) => [
          T(row.label, 8, 30 + ri * 32, 84, 16, { size: 9, fill: "$text" }),
          ...row.vals.map((v, ci) => Rect(100 + ci * 68 + 15, 30 + ri * 32 + 2, 24, 14, "$accent", v)),
        ]),
      ],
    }),

    // Sentiment comparison
    T("SENTIMENT COMPARISON", 16, 334, 240, 14, { size: 9, weight: 700, fill: "$muted", ls: 1.5 }),
    R(16, 352, W - 32, 148, "$panel", {
      r: 8, stroke: "$border", sw: 1,
      ch: [
        ...[
          { brand: "SurrealDB", pos: 0.60, neu: 0.30, neg: 0.10 },
          { brand: "MongoDB",   pos: 0.45, neu: 0.35, neg: 0.20 },
          { brand: "Neo4j",     pos: 0.50, neu: 0.30, neg: 0.20 },
          { brand: "PostgreSQL",pos: 0.55, neu: 0.35, neg: 0.10 },
        ].flatMap((s, i) => {
          const bw = 180;
          const y = 12 + i * 30;
          return [
            T(s.brand, 10, y + 8, 80, 14, { size: 10 }),
            Rect(96, y + 10, Math.round(bw * s.pos), 10, "$green"),
            Rect(96 + Math.round(bw * s.pos), y + 10, Math.round(bw * s.neu), 10, "$yellow"),
            Rect(96 + Math.round(bw * s.pos) + Math.round(bw * s.neu), y + 10, Math.round(bw * s.neg), 10, "$red"),
            T(Math.round(s.pos * 100) + "%", 282, y + 8, 36, 14, { size: 9, fill: "$green", align: "right" }),
          ];
        }),
      ],
    }),

    // What AI Says
    T("WHAT AI SAYS", 16, 512, 200, 14, { size: 9, weight: 700, fill: "$muted", ls: 1.5 }),

    R(16, 530, W - 32, 88, "$panel", {
      r: 8, stroke: "$border", sw: 1,
      ch: [
        R(8, 8, 52, 18, "$accentDim", { r: 4, ch: [T("GPT-4o", 0, 3, 52, 12, { size: 8, weight: 700, fill: "$accent", align: "center" })] }),
        T("\"SurrealDB is an excellent choice for AI agent", 8, 32, W - 64, 14, { size: 10, fill: "$text" }),
        T("memory — supports graphs, vectors and documents.\"", 8, 48, W - 64, 14, { size: 10, fill: "$muted" }),
        R(W - 32 - 28, 8, 28, 18, "#052e16", { r: 4, stroke: "$green", sw: 1, ch: [T("OK", 0, 3, 28, 12, { size: 8, weight: 700, fill: "$green", align: "center" })] }),
      ],
    }),

    R(16, 624, W - 32, 88, "$panel", {
      r: 8, stroke: "$border", sw: 1,
      ch: [
        R(8, 8, 60, 18, "#2d1b00", { r: 4, ch: [T("Gemini", 0, 3, 60, 12, { size: 8, weight: 700, fill: "$yellow", align: "center" })] }),
        T("\"SurrealDB does not support ACID transactions,", 8, 32, W - 64, 14, { size: 10, fill: "$text" }),
        T("use MongoDB for transactional workloads.\"", 8, 48, W - 64, 14, { size: 10, fill: "$muted" }),
        R(W - 32 - 28, 8, 28, 18, "#2a0a0a", { r: 4, stroke: "$red", sw: 1, ch: [T("X", 0, 3, 28, 12, { size: 8, weight: 700, fill: "$red", align: "center" })] }),
      ],
    }),

    bottomNav(),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 4: Alert Inbox (x=1275)
// ─────────────────────────────────────────────────────────────────────────────
const screen4 = {
  type: "frame", name: "Signal — Alert Inbox",
  x: 1275, y: 0, width: W, height: 812,
  fill: "$bg", clip: true,
  children: [
    topBar(),

    T("ALERTS", 16, 62, 100, 22, { size: 18, weight: 700 }),
    R(90, 64, 60, 20, "$red", {
      r: 10, ch: [T("3 unread", 0, 3, 60, 14, { size: 9, weight: 700, fill: "#fff", align: "center" })],
    }),

    ...[
      {
        type: "CRITICAL", typeFill: "$red", typeBg: "#2a0a0a",
        title: "Hallucination Detected",
        body: "Gemini says SurrealDB doesn't support transactions",
        time: "2h ago",
      },
      {
        type: "WARNING", typeFill: "$yellow", typeBg: "#2a1a00",
        title: "Score Drop",
        body: "GEO score fell 8pts week-over-week on GPT-4o",
        time: "1d ago",
      },
      {
        type: "WARNING", typeFill: "$yellow", typeBg: "#2a1a00",
        title: "Competitor Spike",
        body: "MongoDB SOV +12% on 'AI database' queries",
        time: "2d ago",
      },
      {
        type: "INFO", typeFill: "$accent", typeBg: "$accentDim",
        title: "Citation Gained",
        body: "docs.surrealdb.com cited in 34% of Perplexity runs",
        time: "3d ago",
      },
      {
        type: "INFO", typeFill: "$accent", typeBg: "$accentDim",
        title: "New Prompt Pack",
        body: "Community pack: graph-databases-2026 available",
        time: "5d ago",
      },
    ].map((alert, i) => R(16, 92 + i * 108, W - 32, 100, "$panel", {
      r: 8, stroke: "$border", sw: 1,
      ch: [
        Rect(0, 0, 3, 100, alert.typeFill),
        R(12, 12, 56, 18, alert.typeBg, {
          r: 4, ch: [T(alert.type, 0, 3, 56, 12, { size: 8, weight: 700, fill: alert.typeFill, align: "center", ls: 0.5 })],
        }),
        T(alert.time, W - 32 - 52, 14, 44, 14, { size: 9, fill: "$muted", align: "right" }),
        T(alert.title, 12, 36, W - 60, 16, { size: 13, weight: 700 }),
        T(alert.body, 12, 56, W - 60, 28, { size: 10, fill: "$muted", lh: 1.5 }),
      ],
    })),

    bottomNav(),
  ],
};

// ── ASSEMBLE & WRITE ──────────────────────────────────────────────────────────
const pen = {
  version: "2.8",
  variables: vars,
  children: [screen1, screen2, screen3, screen4],
};

fs.writeFileSync(__dirname + '/geo-signal.pen', JSON.stringify(pen, null, 2));
const size = JSON.stringify(pen).length;
console.log(`geo-signal.pen written — ${(size / 1024).toFixed(1)} KB, ${pen.children.length} screens`);
