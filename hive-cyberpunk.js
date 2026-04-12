// hive-cyberpunk.js
// Hive — Neon Cyberpunk design concept in pencil.dev v2.8 format
// Palette: #0a0a0f bg · #ff0080 magenta · #00ffee cyan · #39ff14 green
// 4 screens: Hero / Terminal / Features / CTA

const fs = require('fs');

// ── VARIABLES ──────────────────────────────────────────────────
const vars = {
  bg:       { type: "color", value: "#0a0a0f" },
  grid:     { type: "color", value: "#0f0f1a" },
  card:     { type: "color", value: "#0d0d18" },
  border:   { type: "color", value: "#1a1a2e" },
  mg:       { type: "color", value: "#ff0080" },   // hot magenta
  cy:       { type: "color", value: "#00ffee" },   // electric cyan
  gn:       { type: "color", value: "#39ff14" },   // neon green
  mgDim:    { type: "color", value: "#1a0010" },
  cyDim:    { type: "color", value: "#001a18" },
  white:    { type: "color", value: "#f0f0ff" },
  muted:    { type: "color", value: "#4a4a6a" },
  dimText:  { type: "color", value: "#2a2a4a" },
};

// ── HELPERS ────────────────────────────────────────────────────
const W = 375;

const T = (content, x, y, w, h, opts = {}) => ({
  type: "text", content, x, y, width: w, height: h,
  textGrowth: "fixed-width-height",
  fontSize: opts.size || 13,
  fontWeight: String(opts.weight || 400),
  fill: opts.fill || "$white",
  textAlign: opts.align || "left",
  ...(opts.ls ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh ? { lineHeight: opts.lh } : {}),
  ...(opts.mono ? { fontFamily: "Courier New, monospace" } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Rect = (x, y, w, h, fill, opts = {}) => ({
  type: "frame", x, y, width: w, height: h,
  fill: fill || "transparent",
  ...(opts.r !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke ? { stroke: { align: "inside", thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.children || [],
});

const Line = (x, y, w, h, color, opacity) => ({
  type: "rectangle",
  x, y, width: w, height: h,
  fill: color,
  ...(opacity !== undefined ? { opacity } : {}),
});

const Dot = (x, y, r, fill) => ({
  type: "ellipse",
  x: x - r, y: y - r,
  width: r * 2, height: r * 2,
  fill: fill || "$mg",
});

// ── GRID BACKGROUND ────────────────────────────────────────────
// Subtle perspective grid lines
const gridBg = (frameH) => {
  const lines = [];
  // Horizontal lines
  for (let y = 0; y < frameH; y += 40) {
    lines.push(Line(0, y, W, 1, "#00ffee", 0.04));
  }
  // Vertical lines
  for (let x = 0; x < W; x += 40) {
    lines.push(Line(x, 0, 1, frameH, "#ff0080", 0.04));
  }
  return lines;
};

// Scatter some particle dots
const particles = (frameH, count = 12) => {
  const dots = [];
  const positions = [
    [30, 80], [320, 120], [60, 280], [340, 200], [15, 450],
    [360, 380], [180, 60], [290, 500], [80, 600], [350, 650],
    [120, 750], [250, 700], [40, 160], [300, 300],
  ];
  const colors = ["$mg", "$cy", "$gn", "$cy", "$mg", "$gn", "$cy", "$mg"];
  for (let i = 0; i < Math.min(count, positions.length); i++) {
    const [px, py] = positions[i];
    if (py < frameH) {
      dots.push(Dot(px, py, i % 3 === 0 ? 2 : 1.5, colors[i % colors.length]));
    }
  }
  return dots;
};

// ── SCREEN 1: HERO ─────────────────────────────────────────────
const heroH = 812;

const nav = Rect(0, 0, W, 52, "$bg", {
  stroke: "$border", sw: 1,
  children: [
    // Scanline strip
    Rect(0, 0, W, 1, "$mg", { opacity: 0.4 }),
    // Logo "> hive"
    T("> hive", 20, 16, 80, 20, { size: 16, weight: 800, fill: "$mg", ls: 2 }),
    // Nav items
    T("features", W - 270, 18, 60, 16, { size: 10, weight: 600, fill: "$muted", ls: 1 }),
    T("how it works", W - 200, 18, 75, 16, { size: 10, weight: 600, fill: "$muted", ls: 1 }),
    T("api", W - 112, 18, 24, 16, { size: 10, weight: 600, fill: "$muted", ls: 1 }),
    // Github CTA button
    Rect(W - 80, 13, 68, 26, "transparent", {
      r: 4, stroke: "$mg", sw: 1,
      children: [T("github ↗", 0, 5, 68, 16, { size: 10, weight: 700, fill: "$mg", align: "center", ls: 1 })],
    }),
  ],
});

// Pill badge
const badge = Rect(20, 72, 196, 24, "$mgDim", {
  r: 12, stroke: "$mg", sw: 1,
  children: [
    Dot(12, 12, 3, "$mg"),
    T("LOCAL-FIRST AGENT RUNTIME", 22, 5, 164, 14, { size: 9, weight: 700, fill: "$mg", ls: 1.5 }),
  ],
});

// Glitch title — magenta shadow layer
const titleShadowMg = T("your agents.", 18, 110, W - 36, 52, {
  size: 40, weight: 900, fill: "$mg", opacity: 0.5,
});
// Cyan shadow layer
const titleShadowCy = T("your agents.", 22, 114, W - 36, 52, {
  size: 40, weight: 900, fill: "$cy", opacity: 0.3,
});
// Main title
const titleMain1 = T("your agents.", 20, 112, W - 36, 52, {
  size: 40, weight: 900, fill: "$white",
});
// Second line — magenta
const titleMain2 = T("one hive.", 20, 164, W - 36, 52, {
  size: 40, weight: 900, fill: "$mg",
});

// Subtitle
const subtitle = Rect(20, 228, W - 40, 56, "transparent", {
  children: [
    Rect(0, 0, 3, 56, "$cy", { opacity: 0.5 }),
    T("shared channels · @mention spawning\ndurable history · real-time SSE\nembedded LMDB · port 7373", 12, 6, W - 56, 44, {
      size: 11, weight: 400, fill: "$cy", lh: 1.7, mono: true,
    }),
  ],
});

// Buttons
const btnClone = Rect(20, 296, 148, 40, "$mg", {
  r: 4,
  children: [T("$ git clone", 0, 11, 148, 18, { size: 13, weight: 700, fill: "$bg", align: "center", mono: true })],
});
const btnWeb = Rect(176, 296, 148, 40, "transparent", {
  r: 4, stroke: "$cy", sw: 1,
  children: [T("open hive web →", 0, 11, 148, 18, { size: 12, weight: 600, fill: "$cy", align: "center" })],
});

// Decorative scan lines (hero bottom)
const scanLines = [];
for (let i = 0; i < 6; i++) {
  scanLines.push(Line(0, 350 + i * 8, W, 1, "#00ffee", 0.06));
}

// Floating stat badges
const badge1 = Rect(W - 140, 182, 120, 28, "$cyDim", {
  r: 6, stroke: "$cy", sw: 1,
  children: [
    Dot(12, 14, 4, "$gn"),
    T("agent spawned", 22, 7, 90, 14, { size: 9, weight: 600, fill: "$cy" }),
  ],
});
const badge2 = Rect(W - 150, 218, 130, 28, "$mgDim", {
  r: 6, stroke: "$mg", sw: 1,
  children: [
    T("⚡ 47ms response", 8, 7, 114, 14, { size: 9, weight: 600, fill: "$mg" }),
  ],
});

// Bottom decorative bar
const hiveBar = Rect(0, 380, W, 30, "$mgDim", {
  stroke: "$mg", sw: 1,
  children: [
    T("HIVE v1.0 // LOCALHOST:7373 // MULTI-AGENT RUNTIME", 12, 8, W - 24, 14, {
      size: 8, weight: 600, fill: "$mg", ls: 1.5, mono: true,
    }),
  ],
});

// Large dim "HIVE" watermark
const watermark = T("HIVE", 20, 420, 320, 120, {
  size: 110, weight: 900, fill: "$mg", opacity: 0.04,
});

// CTA row
const heroCTA = Rect(20, 560, W - 40, 1, "$mg", { opacity: 0.2 });
const ctaText = T("deploy your hive.", 20, 580, W - 40, 40, {
  size: 28, weight: 900, fill: "$white",
});
const ctaSub = T("bun install && bun run dev — three curl commands", 20, 626, W - 40, 16, {
  size: 10, weight: 400, fill: "$muted", mono: true,
});

// Footer
const footer = Rect(0, heroH - 56, W, 56, "$bg", {
  stroke: "$border", sw: 1,
  children: [
    Rect(0, 0, W, 1, "$mg", { opacity: 0.3 }),
    T("⬡ hive — local-first agent runtime — mit", 20, 20, W - 100, 16, {
      size: 9, weight: 500, fill: "$muted", ls: 0.5,
    }),
    T("github  docs", W - 90, 20, 72, 16, {
      size: 9, weight: 600, fill: "$cy",
    }),
  ],
});

const screen1 = {
  type: "frame",
  name: "01 — Hero",
  x: 0, y: 0,
  width: W, height: heroH,
  fill: "$bg",
  clip: true,
  children: [
    ...gridBg(heroH),
    ...particles(heroH, 12),
    watermark,
    nav,
    badge,
    titleShadowMg,
    titleShadowCy,
    titleMain1,
    titleMain2,
    subtitle,
    btnClone,
    btnWeb,
    badge1,
    badge2,
    ...scanLines,
    hiveBar,
    heroCTA,
    ctaText,
    ctaSub,
    footer,
  ],
};

// ── SCREEN 2: TERMINAL ─────────────────────────────────────────
const termH = 812;

const termScreen = () => {
  const SX = W + 50; // frame x position only — children use local coords

  const termCard = Rect(16, 80, W - 32, 480, "$card", {
    r: 12, stroke: "$mg", sw: 1,
    children: [
      // Title bar
      Rect(0, 0, W - 32, 36, "$mgDim", {
        r: 12, children: [
          Dot(18, 18, 5, "#ff5f57"),
          Dot(34, 18, 5, "#febc2e"),
          Dot(50, 18, 5, "#28c840"),
          T("hive — localhost:7373", (W - 32) / 2 - 60, 10, 120, 16, {
            size: 10, weight: 500, fill: "$muted", align: "center", mono: true,
          }),
        ],
      }),
      // Code content
      ...([
        ["// register an agent",                        "$muted",  56],
        ["$ curl -X POST localhost:7373/agents",        "$cy",     76],
        ['  -d \'{"id":"coder","spawnCommand":"opencode"}\'', "$cy", 94],
        ['{"success":true,"data":{"id":"coder"}}',      "$gn",    112],
        ["",                                            "$muted", 132],
        ["// mention to spawn",                         "$muted", 152],
        ["$ curl -X POST localhost:7373/posts",         "$cy",    172],
        ['  -d \'{"content":"@coder fix auth bug"}\'',  "$cy",    190],
        ["[task.started] agent=coder",                  "$muted", 212],
        ["[task.completed] agent=coder  47s",           "$gn",    230],
      ].map(([text, color, y]) =>
        T(text, 20, y, W - 72, 16, { size: 10, weight: 400, fill: color, mono: true })
      )),
      // Blinking cursor block
      Rect(20, 248, 8, 14, "$gn"),
    ],
  });

  const label = T("// quick_start.sh", 16, 56, 200, 18, {
    size: 11, weight: 600, fill: "$muted", mono: true, ls: 0.5,
  });

  // Step indicators
  const steps = [
    ["01", "register agent",  "curl POST /agents with id + spawnCommand",  120],
    ["02", "mention to spawn","curl POST /posts with @agent-id content",   230],
    ["03", "agent executes",  "output captured, posted back to channel",   340],
  ].map(([num, title, desc, y]) =>
    Rect(16, 576 + (y - 120) * 0.52, W - 32, 64, "$card", {
      r: 8, stroke: "$border", sw: 1,
      children: [
        T(num, 16, 20, 24, 24, { size: 20, weight: 900, fill: "$mg", opacity: 0.4 }),
        T(title, 52, 12, W - 120, 16, { size: 11, weight: 700, fill: "$white", ls: 0.5 }),
        T(desc, 52, 30, W - 120, 14, { size: 9, weight: 400, fill: "$muted", mono: true }),
      ],
    })
  );

  return {
    type: "frame",
    name: "02 — Terminal",
    x: SX, y: 0,
    width: W, height: termH,
    fill: "$bg",
    clip: true,
    children: [
      ...gridBg(termH),
      ...particles(termH, 8),
      // Section header
      T("QUICK START", 16, 26, 120, 16, { size: 10, weight: 700, fill: "$cy", ls: 3 }),
      label,
      termCard,
      ...steps,
    ],
  };
};

// ── SCREEN 3: FEATURES ─────────────────────────────────────────
const featH = 900;

const featScreen = () => {
  const SX = (W + 50) * 2;

  const feats = [
    ["#",   "Shared Channels",   "Group agents around projects\nwith durable history + cwd.",   "$mg"],
    ["@",   "@Mention Spawning", "Post @agent-id to spawn with\nfull context injected via env.", "$cy"],
    ["db",  "LMDB Storage",      "All data in embedded LMDB.\nNo external database needed.",    "$gn"],
    [">_",  "Agent Spawning",    "Process lifecycle, timeouts,\noutput capture — all managed.",  "$mg"],
    ["sse", "Real-Time Events",  "SSE stream for live updates.\nDurable and replayable.",        "$cy"],
    ["{}",  "JSONL Output",      "Structured output parsing.\nClean posts + raw fallback.",      "$gn"],
  ];

  const cards = feats.map(([sym, title, desc, accent], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cw = (W - 48) / 2;
    return Rect(16 + col * (cw + 16), 88 + row * 130, cw, 120, "$card", {
      r: 10, stroke: "$border", sw: 1,
      children: [
        // Accent corner line
        Rect(0, 0, cw, 2, accent, { r: 0 }),
        // Symbol badge
        Rect(12, 18, 32, 32, "transparent", {
          r: 8, stroke: accent, sw: 1,
          children: [T(sym, 0, 6, 32, 20, { size: 12, weight: 800, fill: accent, align: "center", mono: true })],
        }),
        T(title, 52, 20, cw - 64, 16, { size: 11, weight: 700, fill: "$white" }),
        T(desc, 12, 60, cw - 24, 36, { size: 9.5, weight: 400, fill: "$muted", lh: 1.6, mono: true }),
      ],
    });
  });

  // Section label
  const sectionLabel = T("CORE CAPABILITIES", 16, 50, W - 32, 20, {
    size: 11, weight: 700, fill: "$cy", ls: 3,
  });
  const underline = Rect(16, 72, 48, 2, "$cy");

  // Bottom deploy prompt
  const deployBox = Rect(16, featH - 160, W - 32, 80, "$mgDim", {
    r: 10, stroke: "$mg", sw: 1,
    children: [
      T("DEPLOY YOUR HIVE", 16, 14, W - 64, 20, { size: 14, weight: 900, fill: "$mg", ls: 1.5 }),
      T("bun install && bun run dev", 16, 38, W - 64, 16, { size: 11, weight: 400, fill: "$cy", mono: true }),
      T("port 7373 · three curl commands away", 16, 56, W - 64, 14, { size: 9, weight: 400, fill: "$muted", mono: true }),
    ],
  });

  return {
    type: "frame",
    name: "03 — Features",
    x: SX, y: 0,
    width: W, height: featH,
    fill: "$bg",
    clip: true,
    children: [
      ...gridBg(featH),
      ...particles(featH, 10),
      sectionLabel,
      underline,
      ...cards,
      deployBox,
    ],
  };
};

// ── SCREEN 4: DEPLOY CTA ────────────────────────────────────────
const ctaH = 812;

const ctaScreen = () => {
  const SX = (W + 50) * 3;

  // Big glitch title
  const bigShadow = T("DEPLOY\nYOUR\nHIVE.", 18, 82, W - 36, 220, {
    size: 72, weight: 900, fill: "$mg", opacity: 0.2,
  });
  const bigMain = T("DEPLOY\nYOUR\nHIVE.", 20, 80, W - 36, 220, {
    size: 72, weight: 900, fill: "$white", lh: 1.0,
  });
  const bigAccent = T("HIVE.", 20, 80 + 144, W - 36, 76, {
    size: 72, weight: 900, fill: "$mg",
  });

  const divider = Rect(20, 320, W - 40, 1, "$mg", { opacity: 0.3 });

  const steps = [
    ["01", "$ bun install && bun run dev",          "starts hive on port 7373"],
    ["02", "$ POST /agents {id, spawnCommand}",      "register your first agent"],
    ["03", "$ POST /posts {content: '@agent ...'}",  "mention to trigger a task"],
  ].map(([n, cmd, desc], i) =>
    Rect(20, 338 + i * 88, W - 40, 76, "$card", {
      r: 8, stroke: "$border", sw: 1,
      children: [
        T(n, 12, 24, 20, 28, { size: 22, weight: 900, fill: "$mg", opacity: 0.35 }),
        T(cmd, 44, 16, W - 104, 16, { size: 10, weight: 700, fill: "$cy", mono: true }),
        T(desc, 44, 36, W - 104, 14, { size: 9, weight: 400, fill: "$muted" }),
        Rect(W - 60, 28, 1, 20, "$mg", { opacity: 0.3 }),
        Dot(W - 44, 38, 4, "$gn"),
      ],
    })
  );

  // Github button
  const ghBtn = Rect(20, 606, W - 40, 52, "$mg", {
    r: 6,
    children: [
      T("get hive on github ↗", 0, 16, W - 40, 20, {
        size: 14, weight: 800, fill: "$bg", align: "center", ls: 1,
      }),
    ],
  });

  // Web link
  const webLink = Rect(20, 670, W - 40, 44, "transparent", {
    r: 6, stroke: "$cy", sw: 1,
    children: [
      T("open hive-web.app →", 0, 12, W - 40, 20, {
        size: 13, weight: 600, fill: "$cy", align: "center",
      }),
    ],
  });

  // Bottom bar
  const bottomBar = Rect(0, ctaH - 60, W, 60, "$card", {
    stroke: "$border", sw: 1,
    children: [
      Rect(0, 0, W, 1, "$cy", { opacity: 0.3 }),
      T("open source · mit license · scoutos-labs", 16, 22, W - 32, 16, {
        size: 9, weight: 500, fill: "$muted", ls: 1,
      }),
    ],
  });

  // Corner decoration dots
  const cornerDots = [
    Dot(8, 8, 3, "$mg"),
    Dot(W - 8, 8, 3, "$cy"),
    Dot(8, ctaH - 8, 3, "$cy"),
    Dot(W - 8, ctaH - 8, 3, "$mg"),
  ];

  return {
    type: "frame",
    name: "04 — Deploy CTA",
    x: SX, y: 0,
    width: W, height: ctaH,
    fill: "$bg",
    clip: true,
    children: [
      ...gridBg(ctaH),
      ...particles(ctaH, 10),
      bigShadow,
      bigMain,
      bigAccent,
      divider,
      ...steps,
      ghBtn,
      webLink,
      bottomBar,
      ...cornerDots,
    ],
  };
};

// ── COMPOSE ────────────────────────────────────────────────────
const pen = {
  version: "2.8",
  variables: vars,
  children: [
    screen1,
    termScreen(),
    featScreen(),
    ctaScreen(),
  ],
};

fs.writeFileSync(
  __dirname + '/hive-cyberpunk.pen',
  JSON.stringify(pen, null, 2)
);
console.log('Written hive-cyberpunk.pen');
console.log('Size:', (JSON.stringify(pen).length / 1024).toFixed(1) + ' KB');
console.log('Screens:', pen.children.length);
