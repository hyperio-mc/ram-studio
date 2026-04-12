// geo-pulse.js
// GEO Score Tracker — "Pulse" neon developer tool
// Dark, Space Grotesk energy, terminal meets metrics
// pencil.dev v2.8

const fs = require('fs');

const vars = {
  bg:        { type: "color", value: "#080b12" },
  panel:     { type: "color", value: "#0d1117" },
  border:    { type: "color", value: "#161b22" },
  accent:    { type: "color", value: "#00ff88" },
  accentDim: { type: "color", value: "#003322" },
  blue:      { type: "color", value: "#58a6ff" },
  blueDim:   { type: "color", value: "#0d2040" },
  orange:    { type: "color", value: "#ff6b35" },
  orangeDim: { type: "color", value: "#3d1a0a" },
  text:      { type: "color", value: "#e6edf3" },
  muted:     { type: "color", value: "#8b949e" },
  red:       { type: "color", value: "#f85149" },
  yellow:    { type: "color", value: "#d29922" },
  purple:    { type: "color", value: "#bc8cff" },
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

// ── HEADER BAR (shared) ───────────────────────────────────────
const headerBar = () => R(0, 0, W, 44, "$panel", {
  stroke: "$border", sw: 1,
  ch: [
    T("> pulse", 12, 12, 70, 20, { size: 13, weight: 800, fill: "$accent", ls: 1 }),
    T("SurrealDB  v", 150, 14, 110, 16, { size: 10, fill: "$muted" }),
    R(W - 80, 8, 70, 28, "$accent", {
      ch: [T("RUN SCAN", 0, 8, 70, 12, { size: 9, weight: 700, fill: "$bg", align: "center", ls: 0.8 })],
    }),
  ],
});

// ── BOTTOM TABS (shared) ───────────────────────────────────────
const bottomTabs = () => R(0, 764, W, 48, "$panel", {
  stroke: "$border", sw: 1,
  ch: [
    Rect(0, 0, W, 1, "$border"),
    T("dashboard", 10, 16, 60, 16, { size: 9, fill: "$accent" }),
    T("|", 72, 16, 10, 16, { size: 9, fill: "$border" }),
    T("scan", 84, 16, 36, 16, { size: 9, fill: "$muted" }),
    T("|", 122, 16, 10, 16, { size: 9, fill: "$border" }),
    T("prompts", 134, 16, 54, 16, { size: 9, fill: "$muted" }),
    T("|", 190, 16, 10, 16, { size: 9, fill: "$border" }),
    T("intel", 202, 16, 38, 16, { size: 9, fill: "$muted" }),
    T("|", 242, 16, 10, 16, { size: 9, fill: "$border" }),
    T("alerts", 254, 16, 44, 16, { size: 9, fill: "$muted" }),
  ],
});

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 1: Live Dashboard (x=0, h=812)
// ─────────────────────────────────────────────────────────────────────────────
const screen1 = {
  type: "frame", name: "Pulse — Live Dashboard",
  x: 0, y: 0, width: W, height: 812,
  fill: "$bg", clip: true,
  children: [
    headerBar(),

    // Horizontal rule
    Rect(0, 44, W, 1, "$accent", 0.3),

    // Giant score
    T("73", 0, 60, W, 96, { size: 96, weight: 900, fill: "$accent", align: "center" }),
    T("GEO SCORE", 0, 158, W, 14, { size: 11, weight: 600, fill: "$muted", align: "center", ls: 2 }),
    // Pulse ring around score
    R(W / 2 - 48, 60, 96, 96, "transparent", {
      r: 48, stroke: "$accent", sw: 1,
      ch: [],
    }),

    // Live stats bar
    R(0, 200, W, 40, "$panel", {
      ch: [
        T("MENTION 68%", 12, 12, 80, 16, { size: 9, weight: 700, fill: "$accent" }),
        T("|", 96, 12, 10, 16, { size: 9, fill: "$muted" }),
        T("POSITION 81", 108, 12, 80, 16, { size: 9, weight: 700, fill: "$blue" }),
        T("|", 190, 12, 10, 16, { size: 9, fill: "$muted" }),
        T("ACCURACY 91", 202, 12, 82, 16, { size: 9, weight: 700, fill: "$accent" }),
        T("|", 286, 12, 10, 16, { size: 9, fill: "$muted" }),
        T("SOV 34%", 298, 12, 64, 16, { size: 9, weight: 700, fill: "$yellow" }),
      ],
    }),

    // Platform live grid (2 cols x 3 rows)
    ...[
      { name: "GPT-4o",     score: 78, fill: "$blue",   delta: "+3" },
      { name: "Claude 3.5", score: 71, fill: "$accent",  delta: "+1" },
      { name: "Perplexity", score: 82, fill: "$accent",  delta: "+6" },
      { name: "Gemini",     score: 65, fill: "$yellow",  delta: "-4" },
      { name: "Grok",       score: 68, fill: "$orange",  delta: "+2" },
      { name: "DeepSeek",   score: 59, fill: "$muted",   delta: "new" },
    ].map((p, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const cx = col === 0 ? 16 : 199;
      const cy = 256 + row * 76;
      return R(cx, cy, 168, 68, "$panel", {
        r: 4, stroke: "$border", sw: 1,
        ch: [
          T(p.name, 10, 8, 120, 14, { size: 10, weight: 600, fill: "$text" }),
          T(String(p.score), 10, 26, 80, 28, { size: 28, weight: 700, fill: p.fill }),
          T("vs avg " + p.delta, 10, 52, 100, 14, { size: 9, fill: "$muted" }),
        ],
      });
    }),

    // Trend section
    T("SCORE TREND / 30D", 16, 490, 200, 14, { size: 9, weight: 700, fill: "$muted", ls: 1.5 }),
    R(16, 508, W - 32, 120, "$panel", {
      r: 4, stroke: "$border", sw: 1,
      ch: [
        // 30 vertical bars, 4px wide each, heights vary to show upward trend
        ...Array.from({ length: 30 }, (_, i) => {
          // Slight upward trend with noise
          const base = 30 + Math.round((i / 29) * 20);
          const noise = [0, 5, -3, 8, -2, 4, -6, 3, 7, -1, 2, -4, 6, 1, -3, 5, -2, 4, 3, -1, 6, 2, -3, 8, 1, 4, -2, 3, 6, 2][i] || 0;
          const h = Math.max(8, Math.min(60, base + noise));
          const color = h >= 45 ? "$accent" : h >= 30 ? "$yellow" : "$red";
          return Rect(10 + i * 11, 100 - h, 4, h, color, 0.8);
        }),
      ],
    }),

    // Alert strip
    R(0, 640, W, 40, "$orangeDim", {
      ch: [
        T("! ALERT: Gemini hallucination detected \u2014 click to review", 12, 12, W - 24, 16, { size: 10, weight: 600, fill: "$orange" }),
      ],
    }),

    // Recent runs
    R(16, 688, W - 32, 20, "transparent", {
      ch: [T("RUN #2847  --  09:14  --  90 prompts  --  $0.43", 0, 2, W - 32, 16, { size: 9, fill: "$muted" })],
    }),
    R(16, 712, W - 32, 20, "transparent", {
      ch: [T("RUN #2846  --  08:02  --  90 prompts  --  $0.41", 0, 2, W - 32, 16, { size: 9, fill: "$muted" })],
    }),

    bottomTabs(),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 2: Run Scan Terminal (x=425, h=812)
// ─────────────────────────────────────────────────────────────────────────────
const termLines = [
  { text: "$ geo scan --brand surrealdb --pack database-selection", color: "$accent" },
  { text: "Initializing scan runner...", color: "$muted" },
  { text: "[INFO] Loading 15 prompts from pack", color: "$muted" },
  { text: "[INFO] Platforms: gpt-4o, claude-3.5, perplexity", color: "$blue" },
  { text: "[RUN]  Prompt 1/15...", color: "$muted" },
  { text: "[OK]   gpt-4o: mentioned=true score=88", color: "$accent" },
  { text: "[OK]   claude-3.5: mentioned=true score=76", color: "$accent" },
  { text: "[OK]   perplexity: mentioned=true score=91", color: "$accent" },
  { text: "[RUN]  Prompt 2/15...", color: "$muted" },
  { text: "[OK]   gpt-4o: mentioned=true score=71", color: "$accent" },
  { text: "[WARN] claude-3.5: sentiment=mixed score=52", color: "$yellow" },
  { text: "[OK]   perplexity: mentioned=false score=0", color: "$red" },
  { text: "[RUN]  Prompt 3/15...", color: "$muted" },
  { text: "[OK]   gpt-4o: mentioned=true score=64", color: "$accent" },
  { text: "...", color: "$muted" },
  { text: "[COMPLETE] 15/15 prompts processed", color: "$accent" },
  { text: "[RESULT]   Overall GEO Score: 73/100 (+4)", color: "$accent", weight: 700 },
  { text: "Scan cost: $0.43 | Duration: 2m 18s", color: "$muted" },
];

const screen2 = {
  type: "frame", name: "Pulse — Run Scan Terminal",
  x: 425, y: 0, width: W, height: 812,
  fill: "$bg", clip: true,
  children: [
    headerBar(),

    // Terminal window
    R(16, 56, W - 32, 564, "$panel", {
      r: 8, stroke: "$border", sw: 1,
      ch: [
        // Title bar
        R(0, 0, W - 32, 32, "#0d1117", {
          r: 8,
          ch: [
            E(16, 16, 5, "$red"),
            E(30, 16, 5, "$yellow"),
            E(44, 16, 5, "$accent"),
            T("geo-scan --brand surrealdb", W / 2 - 80, 10, 160, 12, { size: 9, fill: "$muted", align: "center" }),
          ],
        }),
        // Terminal lines
        ...termLines.map((line, i) =>
          T(line.text, 10, 40 + i * 26, W - 52, 16, { size: 9, fill: line.color, weight: line.weight || 400 })
        ),
        // Blinking cursor
        R(10, 40 + termLines.length * 26, 8, 14, "$accent", { ch: [] }),
      ],
    }),

    // Progress section
    R(16, 632, W - 32, 80, "$panel", {
      r: 6, stroke: "$border", sw: 1,
      ch: [
        T("SCAN COMPLETE", 12, 10, 200, 14, { size: 11, weight: 700, fill: "$accent", ls: 1 }),
        T("+4 pts improvement this week", 12, 28, 240, 14, { size: 10, fill: "$accent" }),
        T("15 prompts  |  3 platforms  |  $0.43", 12, 48, 260, 14, { size: 9, fill: "$muted" }),
      ],
    }),

    bottomTabs(),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 3: Hallucination Report (x=850, h=812)
// ─────────────────────────────────────────────────────────────────────────────
const claims = [
  { status: "VERIFIED", ok: true,  claim: "SurrealDB supports ACID transactions",           source: "Verified against docs.surrealdb.com/transactions" },
  { status: "VERIFIED", ok: true,  claim: "Multi-model: documents, graphs, key-value",       source: "Verified against surrealdb.com/features" },
  { status: "FLAG",     ok: false, claim: "SurrealDB does not support transactions",          source: "HALLUCINATION: Detected in Gemini 1.5. Actual: full ACID support." },
  { status: "VERIFIED", ok: true,  claim: "Written in Rust with WebAssembly support",        source: "Verified against github.com/surrealdb/surrealdb" },
  { status: "FLAG",     ok: false, claim: "SurrealDB requires separate vector database",      source: "Outdated: native vector search available since v2.0+" },
  { status: "VERIFIED", ok: true,  claim: "Real-time subscriptions via LIVE SELECT",         source: "Verified against docs.surrealdb.com/surrealql/statements/live" },
];

const screen3 = {
  type: "frame", name: "Pulse — Accuracy Report",
  x: 850, y: 0, width: W, height: 812,
  fill: "$bg", clip: true,
  children: [
    headerBar(),

    T("ACCURACY REPORT", 16, 58, 280, 18, { size: 14, weight: 700, ls: 0.5 }),
    T("Factual claims detected in AI responses", 16, 78, W - 32, 14, { size: 10, fill: "$muted" }),

    // Summary badges
    R(16, 100, 106, 36, "$blueDim", { r: 6, stroke: "$blue", sw: 1, ch: [
      T("12 CLAIMS", 0, 10, 106, 16, { size: 9, weight: 700, fill: "$blue", align: "center", ls: 0.5 }),
    ]}),
    R(130, 100, 100, 36, "$accentDim", { r: 6, stroke: "$accent", sw: 1, ch: [
      T("10 VERIFIED", 0, 10, 100, 16, { size: 9, weight: 700, fill: "$accent", align: "center", ls: 0.5 }),
    ]}),
    R(238, 100, 80, 36, "#2a0a0a", { r: 6, stroke: "$red", sw: 1, ch: [
      T("2 FLAGS", 0, 10, 80, 16, { size: 9, weight: 700, fill: "$red", align: "center", ls: 0.5 }),
    ]}),

    // Claim list
    ...claims.map((c, i) => R(16, 152 + i * 96, W - 32, 88, "$panel", {
      r: 6, stroke: "$border", sw: 1,
      ch: [
        // Left accent border
        Rect(0, 0, 4, 88, c.ok ? "$accent" : "$red"),
        // Status badge
        R(W - 32 - 72, 10, 68, 20, c.ok ? "$accentDim" : "#2a0a0a", {
          r: 4, stroke: c.ok ? "$accent" : "$red", sw: 1,
          ch: [T(c.status, 0, 4, 68, 12, { size: 8, weight: 700, fill: c.ok ? "$accent" : "$red", align: "center" })],
        }),
        T(c.claim, 12, 10, W - 32 - 84, 14, { size: 10, weight: 600, fill: "$text" }),
        T(c.source, 12, 30, W - 32 - 20, 40, { size: 9, fill: c.ok ? "$muted" : "$red", lh: 1.5 }),
      ],
    })),

    // Action card
    R(16, 730, W - 32, 80, "$orangeDim", {
      r: 8, stroke: "$orange", sw: 1,
      ch: [
        T("2 issues need attention.", 12, 10, 240, 14, { size: 11, weight: 600, fill: "$orange" }),
        T("Export correction kit to share with content team.", 12, 28, W - 60, 14, { size: 9, fill: "$text" }),
        R(12, 48, 120, 24, "$orange", {
          r: 4, ch: [T("EXPORT FIXES", 0, 6, 120, 12, { size: 9, weight: 700, fill: "$bg", align: "center", ls: 0.5 })],
        }),
      ],
    }),

    bottomTabs(),
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 4: SOV Battle (x=1275, h=812)
// ─────────────────────────────────────────────────────────────────────────────
const sovRows = [
  { cat: "database selection", you: "34%", comp: "MongoDB 28%", delta: "+6%",  pos: true },
  { cat: "ai backends",        you: "41%", comp: "Supabase 22%", delta: "+19%", pos: true },
  { cat: "graph data",         you: "28%", comp: "Neo4j 45%",   delta: "-17%", pos: false },
  { cat: "real-time",          you: "38%", comp: "Supabase 31%", delta: "+7%",  pos: true },
  { cat: "rust backend",       you: "52%", comp: "PgSQL 20%",   delta: "+32%", pos: true },
  { cat: "vector search",      you: "29%", comp: "Pinecone 38%", delta: "-9%",  pos: false },
  { cat: "multi-model",        you: "67%", comp: "MongoDB 18%", delta: "+49%", pos: true },
];

const screen4 = {
  type: "frame", name: "Pulse — SOV Battle",
  x: 1275, y: 0, width: W, height: 812,
  fill: "$bg", clip: true,
  children: [
    headerBar(),

    T("SHARE OF VOICE", 16, 58, 260, 18, { size: 14, weight: 700, ls: 0.5 }),

    // Brand selector tabs
    ...[
      { label: "SurrealDB", active: true,  x: 16 },
      { label: "MongoDB",   active: false, x: 104 },
      { label: "PostgreSQL",active: false, x: 179 },
      { label: "Neo4j",     active: false, x: 278 },
    ].map(tab => {
      const w = tab.label.length * 7 + 16;
      return R(tab.x, 82, w, 28, "transparent", {
        ch: [
          T(tab.label, 0, 6, w, 16, { size: 10, weight: tab.active ? 700 : 400, fill: tab.active ? "$accent" : "$muted", align: "center" }),
          ...(tab.active ? [Rect(0, 26, w, 2, "$accent")] : []),
        ],
      });
    }),

    // Big SOV number
    T("34%", 16, 128, 200, 64, { size: 64, weight: 900, fill: "$accent" }),
    T("Share of Voice", 16, 196, 180, 16, { size: 11, fill: "$muted" }),
    T("vs MongoDB 28%", 220, 148, 120, 14, { size: 10, fill: "$muted" }),

    // Table header
    R(16, 220, W - 32, 24, "$panel", {
      ch: [
        T("PROMPT CATEGORY", 10, 5, 130, 14, { size: 8, weight: 700, fill: "$muted", ls: 0.5 }),
        T("YOU", 148, 5, 40, 14, { size: 8, weight: 700, fill: "$muted", align: "right" }),
        T("#1 COMP", 196, 5, 70, 14, { size: 8, weight: 700, fill: "$muted" }),
        T("DELTA", W - 32 - 44, 5, 36, 14, { size: 8, weight: 700, fill: "$muted", align: "right" }),
      ],
    }),

    // SOV rows
    ...sovRows.map((row, i) => R(16, 244 + i * 52, W - 32, 44, i % 2 === 0 ? "$panel" : "$bg", {
      ch: [
        T(row.cat, 10, 15, 130, 14, { size: 9, fill: "$text" }),
        T(row.you, 148, 15, 40, 14, { size: 10, weight: 700, fill: "$accent", align: "right" }),
        T(row.comp, 196, 15, 90, 14, { size: 9, fill: "$muted" }),
        T(row.delta, W - 32 - 44, 15, 36, 14, { size: 10, weight: 700, fill: row.pos ? "$accent" : "$red", align: "right" }),
      ],
    })),

    // Insight card
    R(16, 612, W - 32, 80, "$accentDim", {
      r: 8, stroke: "$accent", sw: 1,
      ch: [
        T("Opportunity: Graph Data category.", 12, 10, W - 60, 14, { size: 10, weight: 700, fill: "$accent" }),
        T("Neo4j leads 45% vs your 28%. Target: create content", 12, 28, W - 56, 14, { size: 9, fill: "$text" }),
        T("comparing SurrealDB + Neo4j graph capabilities.", 12, 44, W - 56, 14, { size: 9, fill: "$muted" }),
      ],
    }),

    // Timeline selector
    R(16, 708, W - 32, 36, "$panel", {
      r: 4, stroke: "$border", sw: 1,
      ch: [
        R(2, 2, 60, 32, "$accent", { r: 4, ch: [T("7D", 0, 9, 60, 14, { size: 9, weight: 700, fill: "$bg", align: "center" })] }),
        T("30D", 72, 10, 60, 16, { size: 9, fill: "$muted", align: "center" }),
        T("90D", 140, 10, 60, 16, { size: 9, fill: "$muted", align: "center" }),
        T("ALL", 208, 10, 60, 16, { size: 9, fill: "$muted", align: "center" }),
      ],
    }),

    bottomTabs(),
  ],
};

// ── ASSEMBLE & WRITE ──────────────────────────────────────────────────────────
const pen = {
  version: "2.8",
  variables: vars,
  children: [screen1, screen2, screen3, screen4],
};

fs.writeFileSync(__dirname + '/geo-pulse.pen', JSON.stringify(pen, null, 2));
const size = JSON.stringify(pen).length;
console.log(`geo-pulse.pen written — ${(size / 1024).toFixed(1)} KB, ${pen.children.length} screens`);
