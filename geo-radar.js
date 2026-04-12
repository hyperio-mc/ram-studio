// geo-radar.js
// GEO Score Tracker — "Radar" clean modern SaaS, light theme
// Notion/Linear energy, Inter-style clean weights
// pencil.dev v2.8

const fs = require('fs');

const vars = {
  bg:          { type: "color", value: "#f8fafc" },
  card:        { type: "color", value: "#ffffff" },
  border:      { type: "color", value: "#e2e8f0" },
  accent:      { type: "color", value: "#6366f1" },
  accentLight: { type: "color", value: "#eef2ff" },
  text:        { type: "color", value: "#1e293b" },
  muted:       { type: "color", value: "#94a3b8" },
  green:       { type: "color", value: "#16a34a" },
  greenLight:  { type: "color", value: "#dcfce7" },
  red:         { type: "color", value: "#dc2626" },
  redLight:    { type: "color", value: "#fee2e2" },
  yellow:      { type: "color", value: "#d97706" },
  yellowLight: { type: "color", value: "#fef3c7" },
  orange:      { type: "color", value: "#ea580c" },
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

// ── NAV BAR (shared) ──────────────────────────────────────────
const navBar = () => R(0, 0, W, 56, "$card", {
  stroke: "$border", sw: 1,
  ch: [
    Rect(0, 55, W, 1, "$border"),
    T("radar", 16, 18, 60, 20, { size: 15, weight: 800, fill: "$accent" }),
    T("Dashboard", 100, 20, 64, 16, { size: 10, weight: 500, fill: "$muted" }),
    T("Prompts", 168, 20, 52, 16, { size: 10, weight: 500, fill: "$muted" }),
    T("Citations", 224, 20, 58, 16, { size: 10, weight: 500, fill: "$muted" }),
    R(W - 76, 14, 64, 28, "$accent", {
      r: 8, ch: [T("New Scan", 0, 7, 64, 14, { size: 9, weight: 700, fill: "#fff", align: "center" })],
    }),
  ],
});

// ── BOTTOM TAB BAR (shared) ──────────────────────────────────
const bottomTabs = (h) => R(0, h - 64, W, 64, "$card", {
  stroke: "$border", sw: 1,
  ch: [
    Rect(0, 0, W, 1, "$border"),
    T("Home", 14, 22, 50, 20, { size: 10, weight: 600, fill: "$accent", align: "center" }),
    T("Scans", 89, 22, 50, 20, { size: 10, weight: 400, fill: "$muted", align: "center" }),
    T("Prompts", 155, 22, 60, 20, { size: 10, weight: 400, fill: "$muted", align: "center" }),
    T("Citations", 223, 22, 66, 20, { size: 10, weight: 400, fill: "$muted", align: "center" }),
    T("Alerts", 300, 22, 50, 20, { size: 10, weight: 400, fill: "$muted", align: "center" }),
  ],
});

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 1: Overview Dashboard (x=0, h=900)
// ─────────────────────────────────────────────────────────────────────────────
const screen1 = {
  type: "frame", name: "Radar — Overview",
  x: 0, y: 0, width: W, height: 900,
  fill: "$bg", clip: true,
  children: [
    navBar(),

    // Score hero
    R(16, 72, W - 32, 120, "$card", {
      r: 16, stroke: "$border", sw: 1,
      ch: [
        T("73", 0, 12, W - 32, 60, { size: 80, weight: 700, fill: "$accent", align: "center" }),
        T("/100", 220, 44, 52, 32, { size: 22, weight: 400, fill: "$muted" }),
        T("GEO SCORE", 0, 76, W - 32, 16, { size: 10, weight: 600, fill: "$muted", align: "center", ls: 2 }),
        R(W / 2 - 64, 96, 128, 22, "$greenLight", {
          r: 11, ch: [T("+4 pts this week", 0, 4, 128, 14, { size: 9, weight: 700, fill: "$green", align: "center" })],
        }),
      ],
    }),

    // 4 stat cards bento 2x2
    ...[
      { label: "Mention Rate", val: "68%",   valFill: "$green",  x: 16,  y: 208 },
      { label: "Position Score",val: "81/100",valFill: "$accent", x: 184, y: 208 },
      { label: "Accuracy",     val: "91%",   valFill: "$green",  x: 16,  y: 300 },
      { label: "Platforms",    val: "6/6",   valFill: "$accent", x: 184, y: 300 },
    ].map(s => R(s.x, s.y, 156, 80, "$card", {
      r: 12, stroke: "$border", sw: 1,
      ch: [
        T(s.val, 0, 16, 156, 32, { size: 26, weight: 700, fill: s.valFill, align: "center" }),
        T(s.label, 0, 52, 156, 16, { size: 10, weight: 400, fill: "$muted", align: "center" }),
      ],
    })),

    // SOV donut placeholder
    T("SHARE OF VOICE", 16, 394, 200, 14, { size: 9, weight: 700, fill: "$muted", ls: 1.5 }),
    R(16, 412, W - 32, 156, "$card", {
      r: 12, stroke: "$border", sw: 1,
      ch: [
        // Circle outline for donut
        E(78, 78, 52, "transparent"),
        {
          type: "ellipse", x: 26, y: 26, width: 104, height: 104,
          fill: "transparent", stroke: { align: "inside", thickness: 2, fill: "$border" },
        },
        T("SOV", 52, 64, 52, 16, { size: 11, weight: 700, fill: "$muted", align: "center" }),
        // Legend
        T("SurrealDB", 155, 20, 100, 14, { size: 11, weight: 600, fill: "$text" }),
        T("34%", 268, 20, 50, 14, { size: 11, weight: 700, fill: "$accent", align: "right" }),
        T("MongoDB", 155, 44, 100, 14, { size: 11, weight: 600, fill: "$text" }),
        T("28%", 268, 44, 50, 14, { size: 11, weight: 700, fill: "$red", align: "right" }),
        T("PostgreSQL", 155, 68, 100, 14, { size: 11, weight: 600, fill: "$text" }),
        T("22%", 268, 68, 50, 14, { size: 11, weight: 700, fill: "$yellow", align: "right" }),
        T("Neo4j", 155, 92, 100, 14, { size: 11, weight: 600, fill: "$text" }),
        T("16%", 268, 92, 50, 14, { size: 11, weight: 700, fill: "$muted", align: "right" }),
      ],
    }),

    // Top prompts
    T("TOP PERFORMING PROMPTS", 16, 580, 260, 14, { size: 9, weight: 700, fill: "$muted", ls: 1.5 }),
    ...[
      { text: "Vector + graph database for knowledge base?", score: 91, fill: "$green" },
      { text: "What database for AI agent memory?",          score: 88, fill: "$green" },
      { text: "Multi-model database for AI apps?",           score: 84, fill: "$green" },
    ].map((p, i) => R(16, 598 + i * 60, W - 32, 52, "$card", {
      r: 8, stroke: "$border", sw: 1,
      ch: [
        T(p.text, 12, 18, W - 90, 16, { size: 10, weight: 500 }),
        R(W - 32 - 40, 16, 36, 20, p.fill === "$green" ? "$greenLight" : "$accentLight", {
          r: 4, ch: [T(String(p.score), 0, 3, 36, 14, { size: 10, weight: 700, fill: p.fill, align: "center" })],
        }),
      ],
    })),

    bottomTabs(900),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 2: Prompt Library (x=425, h=900)
// ─────────────────────────────────────────────────────────────────────────────
const screen2 = {
  type: "frame", name: "Radar — Prompt Library",
  x: 425, y: 0, width: W, height: 900,
  fill: "$bg", clip: true,
  children: [
    navBar(),

    T("Prompt Library", 16, 68, 200, 24, { size: 20, weight: 700 }),
    R(W - 100, 66, 84, 28, "$bg", {
      r: 6, stroke: "$border", sw: 1,
      ch: [T("Import Pack", 0, 7, 84, 14, { size: 9, weight: 600, fill: "$muted", align: "center" })],
    }),

    // Filter tabs
    R(16, 108, W - 32, 36, "$card", {
      r: 18, stroke: "$border", sw: 1,
      ch: [
        R(2, 2, 30, 32, "$accent", { r: 16, ch: [T("All", 0, 8, 30, 16, { size: 9, weight: 700, fill: "#fff", align: "center" })] }),
        T("Databases", 38, 10, 68, 16, { size: 9, weight: 500, fill: "$muted", align: "center" }),
        T("AI Backends", 110, 10, 76, 16, { size: 9, weight: 500, fill: "$muted", align: "center" }),
        T("Graph", 190, 10, 46, 16, { size: 9, weight: 500, fill: "$muted", align: "center" }),
        T("Real-time", 240, 10, 64, 16, { size: 9, weight: 500, fill: "$muted", align: "center" }),
      ],
    }),

    ...[
      { cat: "database-selection", catFill: "$orange", catBg: "#fff7ed", prompt: "What database for AI agent memory and graph?", plats: "GPT  CL  PX", score: 88, time: "2h ago" },
      { cat: "database-selection", catFill: "$orange", catBg: "#fff7ed", prompt: "Best multi-model database 2025?",              plats: "all",         score: 71, time: "2h ago" },
      { cat: "ai-backends",        catFill: "$accent", catBg: "$accentLight", prompt: "Vector + graph database for knowledge base?",plats: "GPT  PX",    score: 91, time: "2h ago" },
      { cat: "graph-data",         catFill: "$green",  catBg: "$greenLight",  prompt: "SurrealDB vs Neo4j for knowledge graph?",   plats: "GPT  CL",    score: 77, time: "1d ago" },
      { cat: "ai-backends",        catFill: "$accent", catBg: "$accentLight", prompt: "Database for persistent AI agent memory?",  plats: "GPT  CL  PX",score: 84, time: "1d ago" },
      { cat: "real-time",          catFill: "#2563eb", catBg: "#eff6ff",      prompt: "Database with live queries and change feeds?",plats: "GPT",       score: 62, time: "3d ago" },
    ].map((card, i) => R(16, 156 + i * 96, W - 32, 88, "$card", {
      r: 8, stroke: "$border", sw: 1,
      ch: [
        R(12, 12, card.cat.length * 6 + 12, 20, card.catBg, {
          r: 10, ch: [T(card.cat, 6, 3, card.cat.length * 6, 14, { size: 8, weight: 600, fill: card.catFill })],
        }),
        T(card.prompt, 12, 38, W - 80, 28, { size: 10, weight: 500, lh: 1.5 }),
        T(card.plats, 12, 68, 120, 14, { size: 9, fill: "$muted" }),
        T(card.time, W - 32 - 50, 68, 42, 14, { size: 9, fill: "$muted", align: "right" }),
        R(W - 32 - 54, 10, 36, 20, card.score >= 80 ? "$greenLight" : "$yellowLight", {
          r: 4, ch: [T(String(card.score), 0, 3, 36, 14, { size: 10, weight: 700, fill: card.score >= 80 ? "$green" : "$yellow", align: "center" })],
        }),
      ],
    })),

    bottomTabs(900),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 3: Citation Map (x=850, h=900)
// ─────────────────────────────────────────────────────────────────────────────
const screen3 = {
  type: "frame", name: "Radar — Citation Map",
  x: 850, y: 0, width: W, height: 900,
  fill: "$bg", clip: true,
  children: [
    navBar(),

    T("Citation Map", 16, 66, 200, 24, { size: 20, weight: 700 }),
    T("Perplexity source URLs driving recommendations", 16, 92, W - 32, 14, { size: 10, fill: "$muted" }),

    // Summary stats
    ...[
      { text: "142 citations", x: 16  },
      { text: "68% your domain", x: 134 },
      { text: "23 competitor URLs", x: 252 },
    ].map(s => R(s.x, 112, 112, 32, "$card", {
      r: 16, stroke: "$border", sw: 1,
      ch: [T(s.text, 0, 8, 112, 16, { size: 9, weight: 600, fill: "$text", align: "center" })],
    })),

    // Citation rows
    ...[
      { domain: "docs.surrealdb.com",       path: "/querying",               times: 47, pct: 0.33, color: "$green",  bg: "$greenLight" },
      { domain: "surrealdb.com",            path: "/blog/ai-agents",          times: 38, pct: 0.27, color: "$green",  bg: "$greenLight" },
      { domain: "mongodb.com",              path: "/docs/atlas/vector-search", times: 31, pct: 0.22, color: "$red",    bg: "$redLight" },
      { domain: "neo4j.com",               path: "/docs/graph-data-science",  times: 18, pct: 0.13, color: "$red",    bg: "$redLight" },
      { domain: "dev.to",                  path: "/comparing-databases",      times: 12, pct: 0.08, color: "$muted",  bg: "$border" },
      { domain: "stackoverflow.com",        path: "/questions/surrealdb",      times:  9, pct: 0.06, color: "$muted",  bg: "$border" },
      { domain: "supabase.com",            path: "/docs/guides/ai",           times:  8, pct: 0.06, color: "$red",    bg: "$redLight" },
    ].map((row, i) => R(16, 156 + i * 72, W - 32, 64, "$card", {
      r: 8, stroke: "$border", sw: 1,
      ch: [
        R(12, 20, 24, 24, row.bg, { r: 6, ch: [T(row.domain[0].toUpperCase(), 0, 5, 24, 14, { size: 10, weight: 700, fill: row.color, align: "center" })] }),
        T(row.domain, 44, 10, 180, 14, { size: 10, weight: 600 }),
        T(row.path, 44, 28, 180, 14, { size: 9, fill: "$muted" }),
        T("cited " + row.times + "x", W - 32 - 60, 10, 52, 14, { size: 9, weight: 700, fill: row.color, align: "right" }),
        Rect(44, 48, Math.round((W - 32 - 60) * row.pct), 6, row.color),
        Rect(44, 48, W - 32 - 60, 6, "$border", 0.3),
      ],
    })),

    // Insight card
    R(16, 692, W - 32, 100, "$accentLight", {
      r: 12, stroke: "$accent", sw: 1,
      ch: [
        T("Content Gap", 12, 12, 120, 14, { size: 10, weight: 700, fill: "$accent" }),
        T("No page ranks for 'Rust backend database' queries.", 12, 30, W - 60, 14, { size: 10, fill: "$text" }),
        T("Competitor mongodb.com/rust is cited 24x.", 12, 48, W - 60, 14, { size: 10, fill: "$text" }),
        T("Create content targeting this gap to improve SOV.", 12, 66, W - 60, 14, { size: 10, fill: "$muted" }),
      ],
    }),

    bottomTabs(900),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 4: Reports (x=1275, h=900)
// ─────────────────────────────────────────────────────────────────────────────
const screen4 = {
  type: "frame", name: "Radar — Reports",
  x: 1275, y: 0, width: W, height: 900,
  fill: "$bg", clip: true,
  children: [
    navBar(),

    T("Weekly Report", 16, 66, 200, 24, { size: 20, weight: 700 }),
    T("Mar 7\u201313, 2026", 16, 92, 160, 16, { size: 11, fill: "$muted" }),

    // Executive summary card
    R(16, 116, W - 32, 120, "$card", {
      r: 12, stroke: "$border", sw: 1,
      ch: [
        Rect(0, 0, 4, 120, "$accent"),
        T("GEO Score 73", 16, 12, 200, 18, { size: 14, weight: 700 }),
        T("up from 69 last week  (+4 pts)", 16, 32, 260, 14, { size: 10, fill: "$green" }),
        T("+ Perplexity mentions up 18%", 16, 52, 260, 14, { size: 10, fill: "$text" }),
        T("+ New citation: docs.surrealdb.com/querying", 16, 68, 300, 14, { size: 10, fill: "$text" }),
        T("- Graph category SOV -3pts (Neo4j gaining)", 16, 84, 300, 14, { size: 10, fill: "$red" }),
        T("- Gemini hallucination on transaction support", 16, 100, 300, 14, { size: 10, fill: "$red" }),
      ],
    }),

    // Score trend chart
    T("Score Trend  (Mon\u2013Sun)", 16, 250, 240, 14, { size: 9, weight: 700, fill: "$muted", ls: 1.5 }),
    R(16, 268, W - 32, 96, "$card", {
      r: 8, stroke: "$border", sw: 1,
      ch: [
        // 7 day labels
        ...["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) =>
          T(d, 12 + i * 48, 74, 36, 14, { size: 8, fill: "$muted", align: "center" })
        ),
        // Data point circles connected by rough line segments (as rectangles)
        ...([69, 73, 71, 75, 73, 72, 73]).map((v, i) => {
          const cx = 12 + i * 48 + 18;
          const cy = 68 - (v - 65) * 4;
          return E(cx, cy, 4, "$accent");
        }),
        // Connector lines
        ...([69, 73, 71, 75, 73, 72, 73]).map((v, i) => {
          if (i === 0) return null;
          const prev = [69, 73, 71, 75, 73, 72, 73][i - 1];
          const x1 = 12 + (i - 1) * 48 + 18;
          const y1 = 68 - (prev - 65) * 4;
          const x2 = 12 + i * 48 + 18;
          const y2 = 68 - (v - 65) * 4;
          const dx = x2 - x1;
          const dy = y2 - y1;
          const len = Math.round(Math.sqrt(dx * dx + dy * dy));
          return Rect(x1, Math.min(y1, y2), len, 2, "$accent", 0.5);
        }).filter(Boolean),
      ],
    }),

    // Platform breakdown
    T("PLATFORM BREAKDOWN", 16, 376, 240, 14, { size: 9, weight: 700, fill: "$muted", ls: 1.5 }),
    ...[
      { name: "GPT-4o",     score: 78, delta: "+3",  pos: true },
      { name: "Claude 3.5", score: 71, delta: "+1",  pos: true },
      { name: "Perplexity", score: 82, delta: "+6",  pos: true },
      { name: "Gemini",     score: 65, delta: "-4",  pos: false },
      { name: "Grok",       score: 68, delta: "+2",  pos: true },
      { name: "DeepSeek",   score: 59, delta: "new", pos: true },
    ].map((p, i) => R(16, 394 + i * 28, W - 32, 24, i % 2 === 0 ? "$card" : "$bg", {
      r: 4, ch: [
        T(p.name, 12, 5, 100, 14, { size: 10, weight: 500 }),
        T(String(p.score), 120, 5, 40, 14, { size: 10, weight: 700, fill: "$accent" }),
        T(p.delta, W - 32 - 50, 5, 44, 14, { size: 10, weight: 600, fill: p.pos ? "$green" : "$red", align: "right" }),
      ],
    })),

    // Competitor delta
    T("COMPETITOR SOV DELTA", 16, 574, 240, 14, { size: 9, weight: 700, fill: "$muted", ls: 1.5 }),
    ...[
      { brand: "SurrealDB", now: "34%", prev: "30%", delta: "+4%", pos: true },
      { brand: "MongoDB",   now: "28%", prev: "26%", delta: "+2%", pos: false },
      { brand: "Neo4j",     now: "22%", prev: "24%", delta: "-2%", pos: true },
      { brand: "PostgreSQL",now: "16%", prev: "20%", delta: "-4%", pos: true },
    ].map((r, i) => R(16, 592 + i * 36, W - 32, 32, i % 2 === 0 ? "$card" : "$bg", {
      r: 4, ch: [
        T(r.brand, 12, 8, 100, 16, { size: 10, weight: 600 }),
        T(r.now, 120, 8, 40, 16, { size: 10, fill: "$text" }),
        T(r.prev, 170, 8, 40, 16, { size: 10, fill: "$muted" }),
        T(r.delta, W - 32 - 50, 8, 44, 16, { size: 10, weight: 700, fill: r.pos ? "$green" : "$red", align: "right" }),
      ],
    })),

    // Export buttons
    R(16, 752, 120, 40, "$accent", { r: 8, ch: [T("PDF Export", 0, 12, 120, 16, { size: 11, weight: 600, fill: "#fff", align: "center" })] }),
    R(148, 752, 100, 40, "$card", { r: 8, stroke: "$border", sw: 1, ch: [T("CSV Export", 0, 12, 100, 16, { size: 11, weight: 600, fill: "$text", align: "center" })] }),
    R(260, 752, 99, 40, "$card", { r: 8, stroke: "$border", sw: 1, ch: [T("Share Link", 0, 12, 99, 16, { size: 11, weight: 600, fill: "$text", align: "center" })] }),

    bottomTabs(900),
  ],
};

// ── ASSEMBLE & WRITE ──────────────────────────────────────────────────────────
const pen = {
  version: "2.8",
  variables: vars,
  children: [screen1, screen2, screen3, screen4],
};

fs.writeFileSync(__dirname + '/geo-radar.pen', JSON.stringify(pen, null, 2));
const size = JSON.stringify(pen).length;
console.log(`geo-radar.pen written — ${(size / 1024).toFixed(1)} KB, ${pen.children.length} screens`);
