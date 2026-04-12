// refract-app.js
// "REFRACT" — AI-powered code refactoring tool
// Inspired by:
//   - Linear's pure-black minimal SaaS aesthetic (darkmodedesign.com)
//   - Steven Kotler's massive editorial typography (darkmodedesign.com)
//   - Good Fella's bold 2-color brand (Awwwards SOTD Mar 18 2026)
// Palette: near-black #070708 + electric mint #5EFFC3 + warm code-yellow #FFE566
// pencil.dev v2.8

const fs = require('fs');

const vars = {
  bg:       { type: "color", value: "#070708" },
  surface:  { type: "color", value: "#0D0E10" },
  card:     { type: "color", value: "#111215" },
  border:   { type: "color", value: "#1E1F23" },
  border2:  { type: "color", value: "#2A2B30" },
  mint:     { type: "color", value: "#5EFFC3" },
  mintDim:  { type: "color", value: "#0D2E21" },
  mintGlow: { type: "color", value: "#1A4A35" },
  yellow:   { type: "color", value: "#FFE566" },
  yellowDim:{ type: "color", value: "#2A2510" },
  red:      { type: "color", value: "#FF5C5C" },
  redDim:   { type: "color", value: "#2A1010" },
  text:     { type: "color", value: "#EEEEF0" },
  muted:    { type: "color", value: "#5A5C65" },
  dim:      { type: "color", value: "#2E2F35" },
};

// ── Primitives ────────────────────────────────────────────────────────────────
const T = (content, x, y, w, h, opts = {}) => ({
  type: "text", content, x, y, width: w, height: h,
  fontSize: opts.size || 14,
  fontWeight: opts.weight || 400,
  fill: opts.fill || "$text",
  textAlign: opts.align || "left",
  letterSpacing: opts.ls,
  lineHeight: opts.lh,
  opacity: opts.opacity,
  fontFamily: opts.mono ? "'Fira Code', 'Courier New', monospace" : undefined,
});

const R = (x, y, w, h, fill, opts = {}) => ({
  type: "frame", x, y, width: w, height: h,
  fill: fill || "transparent",
  cornerRadius: opts.r,
  strokeColor: opts.stroke,
  strokeWidth: opts.sw || 1,
  opacity: opts.opacity,
  children: opts.children || [],
});

const Line = (x, y, w, color, h = 1) => R(x, y, w, h, color);

const Pill = (x, y, w, h, fill, label, textFill, opts = {}) => ({
  type: "frame", x, y, width: w, height: h,
  fill, cornerRadius: h / 2,
  strokeColor: opts.stroke,
  strokeWidth: opts.sw || 1,
  children: label ? [T(label, 0, 0, w, h, { size: opts.size || 10, weight: 700, fill: textFill || "$bg", align: "center", ls: opts.ls || 0.5 })] : [],
});

const Dot = (x, y, r, fill, stroke) => ({
  type: "ellipse", x: x - r, y: y - r, width: r * 2, height: r * 2,
  fill: fill || "transparent",
  strokeColor: stroke,
  strokeWidth: 1,
});

// ── Status Bar ────────────────────────────────────────────────────────────────
const statusBar = (bg) => R(0, 0, 390, 50, bg || "$bg", {
  children: [
    T("9:41", 20, 16, 50, 18, { size: 12, weight: 600, fill: "$muted" }),
    T("● ▲  ■", 300, 16, 70, 18, { size: 10, weight: 500, fill: "$muted", align: "right" }),
  ]
});

// ── Nav Bar (mobile bottom) ───────────────────────────────────────────────────
const mobileNav = (active) => {
  const items = [
    { label: "Home",    icon: "⌂" },
    { label: "Diffs",   icon: "≠" },
    { label: "Repos",   icon: "⊞" },
    { label: "Team",    icon: "◎" },
    { label: "Settings",icon: "⚙" },
  ];
  return {
    type: "frame", x: 0, y: 788, width: 390, height: 60,
    fill: "$surface", cornerRadius: 0,
    strokeColor: "$border", strokeWidth: 1,
    children: items.map((item, i) => {
      const iw = 78;
      const isActive = i === active;
      return {
        type: "frame", x: i * iw, y: 0, width: iw, height: 60,
        fill: "transparent",
        children: [
          isActive ? Dot(iw / 2, 6, 3, "$mint") : { type: "frame", x: 0, y: 0, width: 1, height: 1, fill: "transparent", children: [] },
          T(item.icon, 0, 10, iw, 22, { size: 18, weight: isActive ? 700 : 400, fill: isActive ? "$mint" : "$muted", align: "center" }),
          T(item.label, 0, 36, iw, 14, { size: 9, weight: isActive ? 700 : 400, fill: isActive ? "$mint" : "$muted", align: "center", ls: 0.5 }),
        ]
      };
    })
  };
};

// ── Desktop Nav ───────────────────────────────────────────────────────────────
const desktopNav = (w) => R(0, 0, w, 64, "$bg", {
  stroke: "$border", sw: 1,
  children: [
    T("REFRACT", 40, 20, 120, 24, { size: 15, weight: 900, fill: "$mint", ls: 3 }),
    T("AI CODE REFACTORING", 166, 24, 180, 16, { size: 10, weight: 500, fill: "$muted", ls: 1.5 }),
    T("Features", w - 420, 22, 80, 20, { size: 13, weight: 500, fill: "$muted", align: "center" }),
    T("Pricing", w - 340, 22, 70, 20, { size: 13, weight: 500, fill: "$muted", align: "center" }),
    T("Docs", w - 270, 22, 50, 20, { size: 13, weight: 500, fill: "$muted", align: "center" }),
    T("Blog", w - 220, 22, 50, 20, { size: 13, weight: 500, fill: "$muted", align: "center" }),
    Pill(w - 155, 16, 115, 32, "$mint", "START FOR FREE", "$bg", { size: 10, ls: 1 }),
  ]
});

// ── Code Line Helper ──────────────────────────────────────────────────────────
const codeLine = (x, y, w, lineNum, code, opts = {}) => ({
  type: "frame", x, y, width: w, height: 20,
  fill: opts.fill || "transparent",
  cornerRadius: opts.r || 0,
  children: [
    T(String(lineNum).padStart(3, ' '), 0, 2, 32, 16, { size: 10, fill: "$muted", mono: true }),
    T(code, 36, 2, w - 40, 16, { size: 11, fill: opts.codeFill || "$text", mono: true, weight: opts.bold ? 600 : 400 }),
  ]
});

// ══════════════════════════════════════════════════════════════════════════════
// MOBILE SCREENS
// ══════════════════════════════════════════════════════════════════════════════

// ── M1: Hero / Landing ────────────────────────────────────────────────────────
const mobile_hero = {
  type: "frame", name: "Mobile - Hero", width: 390, height: 844,
  fill: "$bg",
  children: [
    statusBar("$bg"),

    // Top nav
    R(0, 50, 390, 50, "$bg", {
      children: [
        T("REFRACT", 20, 14, 100, 22, { size: 14, weight: 900, fill: "$mint", ls: 2 }),
        Pill(310, 12, 70, 28, "$mintDim", "MENU", "$mint", { size: 9, ls: 1, stroke: "$mintGlow", sw: 1 }),
      ]
    }),

    // Kicker badge
    R(20, 116, 220, 26, "$mintDim", {
      r: 13, stroke: "$mintGlow", sw: 1,
      children: [
        Dot(18, 13, 4, "$mint"),
        T("AI-NATIVE CODE REFACTORING", 28, 5, 186, 16, { size: 9, weight: 700, fill: "$mint", ls: 1 }),
      ]
    }),

    // Big headline — editorial stacked
    T("WRITE", 20, 158, 350, 78, { size: 72, weight: 900, fill: "$text", ls: -3 }),
    T("BETTER", 20, 228, 350, 78, { size: 72, weight: 900, fill: "$mint", ls: -3 }),
    T("CODE.", 20, 298, 350, 78, { size: 72, weight: 900, fill: "$text", ls: -3 }),

    // Tagline
    T("Refract analyzes your codebase, spots patterns, and ships production-ready refactors in seconds.", 20, 388, 350, 60, { size: 13, weight: 400, fill: "$muted", lh: 1.7 }),

    // CTA row
    R(20, 464, 218, 44, "$mint", { r: 8, children: [T("START REFACTORING", 0, 13, 218, 18, { size: 11, weight: 800, fill: "$bg", align: "center", ls: 0.8 })] }),
    R(248, 464, 122, 44, "transparent", { r: 8, stroke: "$border2", sw: 1, children: [T("WATCH DEMO ▶", 0, 13, 122, 18, { size: 10, weight: 600, fill: "$muted", align: "center", ls: 0.5 })] }),

    // Social proof
    T("Trusted by 12,400+ engineers", 20, 526, 250, 16, { size: 11, fill: "$muted" }),
    // Avatar dots
    ...[-1,0,1,2,3].map((n,i) => Dot(278 + i * 18, 534, 8, "$card", "$border2")),
    T("+9k", 362, 527, 30, 16, { size: 10, weight: 700, fill: "$mint" }),

    // Mini dashboard preview card
    R(20, 560, 350, 200, "$surface", {
      r: 16, stroke: "$border", sw: 1,
      children: [
        // Card header
        R(0, 0, 350, 40, "$card", { r: 16, children: [
          Dot(20, 20, 5, "$mint"),
          T("refract analyze src/", 32, 12, 200, 16, { size: 11, weight: 600, fill: "$text", mono: true }),
          Pill(280, 10, 58, 20, "$mintDim", "RUNNING", "$mint", { size: 8, ls: 0.5, stroke: "$mintGlow", sw: 1 }),
        ]}),
        // Progress bar
        R(16, 50, 318, 4, "$dim", { r: 2 }),
        R(16, 50, 240, 4, "$mint", { r: 2 }),
        T("73% complete · 14 files analyzed", 16, 62, 280, 14, { size: 10, fill: "$muted" }),
        // Stats row
        R(16, 84, 94, 56, "$mintDim", {
          r: 8, stroke: "$mintGlow", sw: 1,
          children: [
            T("47", 0, 8, 94, 24, { size: 22, weight: 900, fill: "$mint", align: "center" }),
            T("issues found", 0, 34, 94, 14, { size: 9, fill: "$muted", align: "center" }),
          ]
        }),
        R(118, 84, 94, 56, "$yellowDim", {
          r: 8, stroke: "$yellow", sw: 1, opacity: 0.5,
          children: [
            T("12", 0, 8, 94, 24, { size: 22, weight: 900, fill: "$yellow", align: "center" }),
            T("auto-fixable", 0, 34, 94, 14, { size: 9, fill: "$muted", align: "center" }),
          ]
        }),
        R(220, 84, 94, 56, "$card", {
          r: 8, stroke: "$border2", sw: 1,
          children: [
            T("3.2x", 0, 8, 94, 24, { size: 22, weight: 900, fill: "$text", align: "center" }),
            T("perf gain", 0, 34, 94, 14, { size: 9, fill: "$muted", align: "center" }),
          ]
        }),
        // Bottom line
        T("↳ Next: Apply fixes to auth/session.ts", 16, 152, 310, 32, { size: 10, fill: "$mint", mono: true }),
      ]
    }),

    mobileNav(0),
  ]
};

// ── M2: Features Bento ────────────────────────────────────────────────────────
const mobile_features = {
  type: "frame", name: "Mobile - Features", width: 390, height: 844,
  fill: "$bg",
  children: [
    statusBar(),

    // Header
    R(0, 50, 390, 56, "$bg", {
      children: [
        T("Features", 20, 16, 200, 24, { size: 22, weight: 800, fill: "$text" }),
        T("What REFRACT does", 20, 40, 250, 16, { size: 11, fill: "$muted" }),
      ]
    }),

    // Bento card 1 - Full width - AI Review
    R(16, 122, 358, 130, "$surface", {
      r: 14, stroke: "$border", sw: 1,
      children: [
        R(0, 0, 358, 130, "transparent", {
          r: 14,
          children: [
            T("◈", 20, 20, 30, 28, { size: 24, fill: "$mint" }),
            T("Smart Diff Engine", 60, 22, 240, 22, { size: 16, weight: 700, fill: "$text" }),
            T("Understands semantic meaning, not just lines. Diffs that make sense to humans.", 20, 54, 318, 42, { size: 12, fill: "$muted", lh: 1.6 }),
            Line(20, 104, 318, "$border"),
            T("↳ git diff with intent", 20, 112, 200, 14, { size: 10, fill: "$mint", mono: true }),
          ]
        })
      ]
    }),

    // Bento row 2 — two cards
    R(16, 264, 170, 120, "$surface", {
      r: 14, stroke: "$border", sw: 1,
      children: [
        T("⚡", 16, 16, 30, 28, { size: 22, fill: "$yellow" }),
        T("Auto-Fix", 16, 48, 138, 20, { size: 15, weight: 700, fill: "$text" }),
        T("Applies fixes instantly with one click.", 16, 72, 138, 36, { size: 11, fill: "$muted", lh: 1.5 }),
      ]
    }),
    R(204, 264, 170, 120, "$mintDim", {
      r: 14, stroke: "$mintGlow", sw: 1,
      children: [
        T("◉", 16, 16, 30, 28, { size: 22, fill: "$mint" }),
        T("AI Review", 16, 48, 138, 20, { size: 15, weight: 700, fill: "$text" }),
        T("GPT-4 code review on every commit.", 16, 72, 138, 36, { size: 11, fill: "$muted", lh: 1.5 }),
      ]
    }),

    // Bento row 3 — two cards
    R(16, 396, 170, 120, "$surface", {
      r: 14, stroke: "$border", sw: 1,
      children: [
        T("∞", 16, 16, 30, 28, { size: 22, fill: "$muted" }),
        T("Zero Config", 16, 48, 138, 20, { size: 15, weight: 700, fill: "$text" }),
        T("Works with any stack. No setup required.", 16, 72, 138, 36, { size: 11, fill: "$muted", lh: 1.5 }),
      ]
    }),
    R(204, 396, 170, 120, "$surface", {
      r: 14, stroke: "$border", sw: 1,
      children: [
        T("⊙", 16, 16, 30, 28, { size: 22, fill: "$muted" }),
        T("Team Sync", 16, 48, 138, 20, { size: 15, weight: 700, fill: "$text" }),
        T("Shared rules and style guides for your org.", 16, 72, 138, 36, { size: 11, fill: "$muted", lh: 1.5 }),
      ]
    }),

    // Bento row 4 — full width CLI
    R(16, 528, 358, 90, "$card", {
      r: 14, stroke: "$border2", sw: 1,
      children: [
        T("$", 16, 28, 20, 28, { size: 18, weight: 900, fill: "$mint", mono: true }),
        T("npx refract analyze --fix", 38, 30, 280, 24, { size: 14, weight: 600, fill: "$text", mono: true }),
        T("zero install · works everywhere", 16, 62, 280, 16, { size: 10, fill: "$muted" }),
        Pill(304, 30, 44, 22, "$mintDim", "CLI", "$mint", { size: 9, ls: 0.5, stroke: "$mintGlow", sw: 1 }),
      ]
    }),

    mobileNav(1),
  ]
};

// ── M3: Code Diff Viewer ──────────────────────────────────────────────────────
const mobile_diff = {
  type: "frame", name: "Mobile - Diff Viewer", width: 390, height: 844,
  fill: "$bg",
  children: [
    statusBar(),

    // Header
    R(0, 50, 390, 52, "$bg", {
      children: [
        T("←", 20, 14, 24, 24, { size: 18, fill: "$muted" }),
        T("auth/session.ts", 50, 16, 220, 20, { size: 14, weight: 600, fill: "$text", mono: true }),
        Pill(310, 14, 64, 24, "$mintDim", "2 FIXES", "$mint", { size: 9, ls: 0.5, stroke: "$mintGlow", sw: 1 }),
      ]
    }),

    // AI Suggestion chip
    R(16, 110, 358, 54, "$mintDim", {
      r: 12, stroke: "$mintGlow", sw: 1,
      children: [
        Dot(24, 27, 6, "$mint"),
        T("Refract AI suggests: Replace async chain with Promise.all for 3.2x speedup", 38, 8, 300, 36, { size: 11, fill: "$text", lh: 1.5 }),
      ]
    }),

    // Tab bar: Before / After
    R(16, 176, 358, 36, "$surface", {
      r: 10, stroke: "$border", sw: 1,
      children: [
        R(2, 2, 176, 32, "$card", { r: 8, children: [T("BEFORE", 0, 9, 176, 14, { size: 10, weight: 700, fill: "$muted", align: "center", ls: 1 })] }),
        R(180, 2, 176, 32, "$mint", { r: 8, children: [T("AFTER", 0, 9, 176, 14, { size: 10, weight: 700, fill: "$bg", align: "center", ls: 1 })] }),
      ]
    }),

    // Code panel
    R(16, 224, 358, 380, "$surface", {
      r: 12, stroke: "$border", sw: 1,
      children: [
        // After code (shown by default)
        ...([
          [1, "import { auth } from './auth';",      "$muted",  false],
          [2, "import { cache } from './cache';",     "$muted",  false],
          [3, "",                                     "$muted",  false],
          [4, "export async function getSession(",    "$text",   false],
          [5, "  userId: string,",                    "$text",   false],
          [6, "  options: SessionOptions",            "$text",   false],
          [7, ") {",                                   "$text",   false],
          [8, "  const [user, perms] =",              "$mint",   true ],
          [9, "    await Promise.all([",              "$mint",   true ],
          [10,"      auth.getUser(userId),",          "$mint",   true ],
          [11,"      auth.getPerms(userId),",         "$mint",   true ],
          [12,"    ]);",                              "$mint",   true ],
          [13,"  return { user, perms };",            "$text",   false],
          [14,"}",                                    "$text",   false],
        ]).map(([ln, code, color, isFix], i) =>
          R(0, i * 22, 358, 22, isFix ? "$mintDim" : "transparent", {
            children: [codeLine(8, 0, 342, ln, code, { codeFill: color })]
          })
        ),
      ]
    }),

    // Action buttons
    R(16, 616, 170, 44, "$mint", {
      r: 10, children: [T("✓ APPLY FIX", 0, 13, 170, 18, { size: 11, weight: 800, fill: "$bg", align: "center", ls: 0.5 })]
    }),
    R(196, 616, 178, 44, "transparent", {
      r: 10, stroke: "$border2", sw: 1,
      children: [T("⊘ SKIP", 0, 13, 178, 18, { size: 11, weight: 600, fill: "$muted", align: "center", ls: 0.5 })]
    }),

    // Performance badge
    R(16, 672, 358, 60, "$yellowDim", {
      r: 12, stroke: "$yellow", sw: 1, opacity: 0.6,
      children: [
        T("▲", 20, 18, 20, 24, { size: 18, fill: "$yellow" }),
        T("Expected speedup after fix", 46, 10, 240, 16, { size: 11, fill: "$muted" }),
        T("3.2× faster", 46, 28, 200, 20, { size: 16, weight: 800, fill: "$yellow" }),
        T("+3.2×", 308, 18, 40, 24, { size: 14, weight: 900, fill: "$yellow", align: "right" }),
      ]
    }),

    mobileNav(1),
  ]
};

// ── M4: Pricing ───────────────────────────────────────────────────────────────
const mobile_pricing = {
  type: "frame", name: "Mobile - Pricing", width: 390, height: 844,
  fill: "$bg",
  children: [
    statusBar(),

    R(0, 50, 390, 56, "$bg", {
      children: [
        T("Simple pricing.", 20, 10, 350, 28, { size: 22, weight: 800, fill: "$text" }),
        T("No surprises. Cancel any time.", 20, 38, 350, 18, { size: 12, fill: "$muted" }),
      ]
    }),

    // Toggle monthly/annual
    R(92, 118, 206, 36, "$surface", {
      r: 18, stroke: "$border", sw: 1,
      children: [
        R(2, 2, 100, 32, "$mint", { r: 16, children: [T("MONTHLY", 0, 9, 100, 14, { size: 9, weight: 700, fill: "$bg", align: "center", ls: 0.8 })] }),
        R(104, 2, 100, 32, "transparent", { r: 16, children: [T("ANNUAL −20%", 0, 9, 100, 14, { size: 9, weight: 600, fill: "$muted", align: "center", ls: 0.6 })] }),
      ]
    }),

    // Free card
    R(16, 168, 358, 152, "$surface", {
      r: 14, stroke: "$border", sw: 1,
      children: [
        T("Free", 20, 20, 150, 24, { size: 18, weight: 700, fill: "$text" }),
        T("$0", 20, 48, 80, 36, { size: 32, weight: 900, fill: "$text" }),
        T("/mo", 68, 62, 50, 20, { size: 13, fill: "$muted" }),
        T("✓  500 lines/month", 20, 94, 280, 16, { size: 12, fill: "$muted" }),
        T("✓  3 repos", 20, 114, 280, 16, { size: 12, fill: "$muted" }),
        T("✓  Community support", 20, 134, 280, 16, { size: 12, fill: "$muted" }),
        R(248, 20, 90, 28, "transparent", {
          r: 8, stroke: "$border2", sw: 1,
          children: [T("GET STARTED", 0, 7, 90, 14, { size: 8, weight: 700, fill: "$muted", align: "center", ls: 0.5 })]
        }),
      ]
    }),

    // Pro card — highlighted
    R(16, 332, 358, 180, "$mintDim", {
      r: 14, stroke: "$mint", sw: 2,
      children: [
        Pill(20, 16, 54, 22, "$mint", "POPULAR", "$bg", { size: 8, ls: 0.8 }),
        T("Pro", 20, 46, 150, 24, { size: 18, weight: 700, fill: "$text" }),
        T("$19", 20, 74, 80, 40, { size: 34, weight: 900, fill: "$mint" }),
        T("/mo", 74, 90, 50, 20, { size: 13, fill: "$muted" }),
        T("✓  Unlimited lines", 20, 124, 280, 16, { size: 12, fill: "$text" }),
        T("✓  25 repos · CI/CD integration", 20, 142, 280, 16, { size: 12, fill: "$text" }),
        T("✓  AI review + auto-fix", 20, 160, 280, 16, { size: 12, fill: "$text" }),
        R(248, 46, 90, 36, "$mint", {
          r: 8, children: [T("START PRO", 0, 10, 90, 16, { size: 9, weight: 800, fill: "$bg", align: "center", ls: 0.5 })]
        }),
      ]
    }),

    // Team card
    R(16, 524, 358, 160, "$surface", {
      r: 14, stroke: "$border", sw: 1,
      children: [
        T("Team", 20, 20, 150, 24, { size: 18, weight: 700, fill: "$text" }),
        T("$49", 20, 48, 80, 38, { size: 32, weight: 900, fill: "$text" }),
        T("/seat/mo", 78, 64, 80, 18, { size: 11, fill: "$muted" }),
        T("✓  Everything in Pro", 20, 96, 280, 16, { size: 12, fill: "$muted" }),
        T("✓  Shared rulebooks & style guides", 20, 114, 280, 16, { size: 12, fill: "$muted" }),
        T("✓  Priority support + SLA", 20, 132, 280, 16, { size: 12, fill: "$muted" }),
        R(248, 20, 90, 28, "transparent", {
          r: 8, stroke: "$border2", sw: 1,
          children: [T("CONTACT US", 0, 7, 90, 14, { size: 8, weight: 700, fill: "$muted", align: "center", ls: 0.5 })]
        }),
      ]
    }),

    mobileNav(3),
  ]
};

// ── M5: Onboarding ────────────────────────────────────────────────────────────
const mobile_onboarding = {
  type: "frame", name: "Mobile - Onboarding", width: 390, height: 844,
  fill: "$bg",
  children: [
    statusBar(),

    // Progress steps
    R(20, 60, 350, 6, "$surface", {
      r: 3,
      children: [
        R(0, 0, 200, 6, "$mint", { r: 3 }),
      ]
    }),
    T("Step 2 of 3 — Connect your repo", 20, 76, 350, 16, { size: 10, fill: "$muted", ls: 0.5 }),

    // Title
    T("Where does", 20, 108, 350, 50, { size: 38, weight: 900, fill: "$text", ls: -1.5 }),
    T("your code live?", 20, 152, 350, 50, { size: 38, weight: 900, fill: "$mint", ls: -1.5 }),

    // Provider cards
    ...[
      { name: "GitHub", sub: "github.com/your-repos", icon: "◆", active: true, y: 214 },
      { name: "GitLab", sub: "gitlab.com/your-repos", icon: "◇", active: false, y: 292 },
      { name: "Bitbucket", sub: "bitbucket.org/your-repos", icon: "◈", active: false, y: 370 },
    ].map(p => R(16, p.y, 358, 68, p.active ? "$mintDim" : "$surface", {
      r: 14, stroke: p.active ? "$mint" : "$border", sw: p.active ? 2 : 1,
      children: [
        T(p.icon, 20, 20, 28, 28, { size: 24, fill: p.active ? "$mint" : "$muted" }),
        T(p.name, 58, 12, 200, 22, { size: 16, weight: 700, fill: p.active ? "$text" : "$muted" }),
        T(p.sub, 58, 36, 240, 16, { size: 11, fill: "$muted", mono: true }),
        p.active ? Dot(338, 34, 8, "$mint") : R(322, 20, 20, 20, "transparent", {
          r: 10, stroke: "$border2", sw: 1, children: []
        }),
      ]
    })),

    // Private repos toggle
    R(16, 450, 358, 56, "$surface", {
      r: 14, stroke: "$border", sw: 1,
      children: [
        T("Include private repos", 20, 18, 240, 20, { size: 14, weight: 600, fill: "$text" }),
        T("Requires additional OAuth scope", 20, 36, 280, 14, { size: 10, fill: "$muted" }),
        // Toggle ON
        R(304, 18, 44, 22, "$mint", {
          r: 11,
          children: [Dot(33, 11, 9, "$bg")]
        }),
      ]
    }),

    // Permissions note
    R(16, 518, 358, 56, "$yellowDim", {
      r: 12, stroke: "$yellow", sw: 1, opacity: 0.5,
      children: [
        T("⚠", 16, 16, 20, 24, { size: 16, fill: "$yellow" }),
        T("We only request read access. Your code never leaves your infra.", 42, 8, 296, 36, { size: 11, fill: "$muted", lh: 1.5 }),
      ]
    }),

    // CTA
    R(16, 590, 358, 52, "$mint", {
      r: 12, children: [T("CONNECT GITHUB →", 0, 16, 358, 20, { size: 12, weight: 800, fill: "$bg", align: "center", ls: 1 })]
    }),

    T("← Back", 148, 656, 94, 16, { size: 12, fill: "$muted", align: "center" }),

    mobileNav(0),
  ]
};

// ══════════════════════════════════════════════════════════════════════════════
// DESKTOP SCREENS
// ══════════════════════════════════════════════════════════════════════════════
const DW = 1440;
const DH = 900;

// ── D1: Desktop Hero ──────────────────────────────────────────────────────────
const desktop_hero = {
  type: "frame", name: "Desktop - Hero", width: DW, height: DH,
  fill: "$bg",
  children: [
    desktopNav(DW),

    // Horizontal rule
    Line(0, 64, DW, "$border"),

    // Left content zone
    // Badge
    R(80, 120, 280, 30, "$mintDim", {
      r: 15, stroke: "$mintGlow", sw: 1,
      children: [
        Dot(18, 15, 5, "$mint"),
        T("Now in public beta — 12,400+ engineers", 30, 7, 244, 16, { size: 11, weight: 600, fill: "$mint", ls: 0.3 }),
      ]
    }),

    // Headline — huge editorial stacked type
    T("WRITE", 80, 170, 680, 140, { size: 128, weight: 900, fill: "$text", ls: -6, lh: 1 }),
    T("BETTER", 80, 296, 740, 140, { size: 128, weight: 900, fill: "$mint", ls: -6, lh: 1 }),
    T("CODE.", 80, 422, 640, 140, { size: 128, weight: 900, fill: "$text", ls: -6, lh: 1 }),

    // Tagline
    T("Refract analyzes your codebase, identifies patterns, and ships\nproduction-ready refactors in seconds. Built for the AI era.", 80, 578, 520, 56, { size: 16, fill: "$muted", lh: 1.7 }),

    // CTA
    R(80, 648, 220, 52, "$mint", { r: 10, children: [T("START FOR FREE →", 0, 16, 220, 20, { size: 12, weight: 800, fill: "$bg", align: "center", ls: 1 })] }),
    R(316, 648, 160, 52, "transparent", { r: 10, stroke: "$border2", sw: 1, children: [T("WATCH DEMO ▶", 0, 16, 160, 20, { size: 11, weight: 600, fill: "$muted", align: "center", ls: 0.5 })] }),

    // Social proof
    T("Trusted by engineers at", 80, 720, 180, 16, { size: 11, fill: "$muted" }),
    ...["Linear", "Vercel", "Notion", "Stripe"].map((name, i) =>
      T(name, 268 + i * 96, 720, 84, 16, { size: 12, weight: 700, fill: "$dim", align: "center" })
    ),

    // Right: Dashboard panel
    R(760, 80, 620, 780, "$surface", {
      r: 20, stroke: "$border", sw: 1,
      children: [
        // Terminal header bar
        R(0, 0, 620, 48, "$card", {
          r: 20, children: [
            Dot(24, 24, 6, "#FF5C5C"),
            Dot(44, 24, 6, "$yellow"),
            Dot(64, 24, 6, "$mint"),
            T("refract — analyze src/ --fix --ai", 90, 15, 380, 18, { size: 12, weight: 500, fill: "$muted", mono: true }),
          ]
        }),

        // Left sidebar
        R(0, 48, 180, 732, "$bg", {
          children: [
            T("FILES ANALYZED", 16, 20, 148, 14, { size: 9, fill: "$muted", ls: 1 }),
            ...[
              ["auth/session.ts", true, 3],
              ["api/routes.ts", false, 0],
              ["utils/cache.ts", true, 1],
              ["components/Nav.tsx", false, 0],
              ["hooks/useAuth.ts", true, 2],
              ["lib/db.ts", false, 0],
              ["middleware.ts", false, 0],
              ["pages/index.tsx", true, 1],
            ].map(([name, hasIssue, count], i) => R(8, 44 + i * 38, 164, 32, hasIssue ? "$mintDim" : "transparent", {
              r: 6, stroke: hasIssue ? "$mintGlow" : "transparent", sw: 1,
              children: [
                T(name, 10, 8, 120, 16, { size: 10, fill: hasIssue ? "$text" : "$muted", mono: true }),
                count > 0 ? Pill(140, 7, 20, 18, "$mint", String(count), "$bg", { size: 8 }) : { type: "frame", x: 0, y: 0, width: 1, height: 1, fill: "transparent", children: [] },
              ]
            })),
            Line(0, 354, 180, "$border"),
            T("SUMMARY", 16, 370, 148, 14, { size: 9, fill: "$muted", ls: 1 }),
            T("47", 16, 392, 60, 32, { size: 28, weight: 900, fill: "$mint" }),
            T("issues", 16, 424, 80, 14, { size: 10, fill: "$muted" }),
            T("12", 80, 392, 60, 32, { size: 28, weight: 900, fill: "$yellow" }),
            T("auto-fix", 80, 424, 80, 14, { size: 10, fill: "$muted" }),
          ]
        }),

        // Vertical divider
        Line(180, 48, 1, "$border", 732),

        // Main diff view
        R(181, 48, 439, 732, "transparent", {
          children: [
            // Diff header
            R(0, 0, 439, 48, "$card", {
              children: [
                T("auth/session.ts", 20, 14, 200, 20, { size: 13, weight: 600, fill: "$text", mono: true }),
                Pill(354, 12, 72, 24, "$mintDim", "3 ISSUES", "$mint", { size: 9, ls: 0.5, stroke: "$mintGlow", sw: 1 }),
              ]
            }),
            // Code lines
            ...([
              ["BEFORE", 1, "// Fetch user and permissions", "$muted", false],
              ["BEFORE", 2, "const user = await auth.getUser(id);", "#FF7070", false],
              ["BEFORE", 3, "const perms = await auth.getPerms(id);", "#FF7070", false],
              ["BEFORE", 4, "", "$muted", false],
              ["AFTER",  5, "// Parallel fetch — 3.2× faster", "$mint", true],
              ["AFTER",  6, "const [user, perms] =", "$mint", true],
              ["AFTER",  7, "  await Promise.all([", "$mint", true],
              ["AFTER",  8, "    auth.getUser(id),", "$mint", true],
              ["AFTER",  9, "    auth.getPerms(id),", "$mint", true],
              ["AFTER",  10, "  ]);", "$mint", true],
              ["SAME",   11, "", "$muted", false],
              ["SAME",   12, "return { user, perms };", "$text", false],
              ["SAME",   13, "}", "$text", false],
            ]).map(([kind, ln, code, color, isFix], i) =>
              R(0, 48 + i * 26, 439, 26, isFix ? "$mintDim" : kind === "BEFORE" ? "$redDim" : "transparent", {
                children: [
                  T(kind === "AFTER" ? "+" : kind === "BEFORE" ? "−" : " ", 4, 5, 14, 16, { size: 12, weight: 700, fill: isFix ? "$mint" : kind === "BEFORE" ? "$red" : "$muted", mono: true }),
                  codeLine(20, 0, 410, ln, code, { codeFill: color }),
                ]
              })
            ),

            // Bottom action bar
            R(0, 684, 439, 48, "$card", {
              children: [
                R(10, 8, 140, 32, "$mint", { r: 8, children: [T("✓ APPLY ALL FIXES", 0, 8, 140, 16, { size: 10, weight: 800, fill: "$bg", align: "center", ls: 0.5 })] }),
                R(162, 8, 100, 32, "transparent", { r: 8, stroke: "$border2", sw: 1, children: [T("SKIP FILE", 0, 8, 100, 16, { size: 10, weight: 600, fill: "$muted", align: "center" })] }),
                T("↑ 2 more files", 340, 14, 90, 16, { size: 10, fill: "$muted" }),
              ]
            }),
          ]
        }),
      ]
    }),
  ]
};

// ── D2: Features Page ─────────────────────────────────────────────────────────
const desktop_features = {
  type: "frame", name: "Desktop - Features", width: DW, height: DH,
  fill: "$bg",
  children: [
    desktopNav(DW),
    Line(0, 64, DW, "$border"),

    // Section header
    T("FEATURES", 80, 100, 160, 20, { size: 10, fill: "$mint", weight: 700, ls: 3 }),
    T("Everything you need to ship\ncleaner code, faster.", 80, 128, 600, 90, { size: 48, weight: 900, fill: "$text", ls: -2, lh: 1.1 }),
    T("Built for modern teams who take code quality seriously.", 80, 234, 480, 24, { size: 15, fill: "$muted" }),

    // Bento grid — 3 cols
    // Row 1
    R(80, 276, 380, 220, "$surface", {
      r: 16, stroke: "$border", sw: 1,
      children: [
        T("◈", 28, 28, 40, 40, { size: 34, fill: "$mint" }),
        T("Smart Diff Engine", 28, 76, 320, 28, { size: 20, weight: 700, fill: "$text" }),
        T("Understands semantic meaning, not just line diffs. Every suggestion is grounded in how your code actually works.", 28, 110, 320, 60, { size: 13, fill: "$muted", lh: 1.65 }),
        Line(28, 178, 324, "$border"),
        T("Works with JS, TS, Python, Go, Rust, Ruby", 28, 190, 320, 16, { size: 10, fill: "$muted" }),
      ]
    }),
    R(476, 276, 380, 220, "$mintDim", {
      r: 16, stroke: "$mint", sw: 1,
      children: [
        T("⚡", 28, 28, 40, 40, { size: 34, fill: "$yellow" }),
        T("One-Click Auto-Fix", 28, 76, 320, 28, { size: 20, weight: 700, fill: "$text" }),
        T("Review a suggestion and apply it instantly. No copy-paste. Refract patches your working tree and stages the change.", 28, 110, 320, 60, { size: 13, fill: "$muted", lh: 1.65 }),
        Line(28, 178, 324, "$border"),
        T("Supports staged, unstaged, and stash workflows", 28, 190, 320, 16, { size: 10, fill: "$muted" }),
      ]
    }),
    R(872, 276, 488, 220, "$surface", {
      r: 16, stroke: "$border", sw: 1,
      children: [
        T("◉", 28, 28, 40, 40, { size: 34, fill: "$mint" }),
        T("AI Code Review", 28, 76, 400, 28, { size: 20, weight: 700, fill: "$text" }),
        T("Every PR gets a full code review from Refract's AI — catching security flaws, anti-patterns, and performance issues before they reach main.", 28, 110, 436, 60, { size: 13, fill: "$muted", lh: 1.65 }),
        Line(28, 178, 432, "$border"),
        T("Integrates with GitHub, GitLab, Bitbucket", 28, 190, 400, 16, { size: 10, fill: "$muted" }),
      ]
    }),

    // Row 2
    R(80, 512, 488, 180, "$card", {
      r: 16, stroke: "$border2", sw: 1,
      children: [
        // CLI demo block
        R(0, 0, 488, 44, "$surface", {
          r: 16, children: [
            Dot(20, 22, 5, "#FF5C5C"), Dot(36, 22, 5, "$yellow"), Dot(52, 22, 5, "$mint"),
            T("Terminal", 72, 13, 100, 18, { size: 11, fill: "$muted" }),
          ]
        }),
        T("$ npx refract analyze --fix --ai", 16, 58, 420, 20, { size: 13, weight: 600, fill: "$mint", mono: true }),
        T("✓ 47 issues found  · 12 auto-fixed  · 3.2× avg speedup", 16, 82, 440, 18, { size: 12, fill: "$text", mono: true }),
        T("↳ Committing: fix(auth): parallel session fetch", 16, 104, 440, 18, { size: 12, fill: "$muted", mono: true }),
        T("Zero install  ·  Works in CI  ·  Configurable rules", 16, 148, 440, 18, { size: 11, fill: "$muted" }),
      ]
    }),
    R(584, 512, 280, 180, "$surface", {
      r: 16, stroke: "$border", sw: 1,
      children: [
        T("∞", 28, 24, 40, 48, { size: 40, fill: "$muted" }),
        T("Zero Config", 28, 74, 220, 28, { size: 20, weight: 700, fill: "$text" }),
        T("Drop it in. Works out of the box with any stack.", 28, 106, 220, 48, { size: 13, fill: "$muted", lh: 1.5 }),
      ]
    }),
    R(880, 512, 480, 180, "$surface", {
      r: 16, stroke: "$border", sw: 1,
      children: [
        T("⊙", 28, 24, 40, 48, { size: 40, fill: "$muted" }),
        T("Team Sync", 28, 74, 400, 28, { size: 20, weight: 700, fill: "$text" }),
        T("Shared rulebooks, style guides, and refactoring patterns across your entire org. One source of truth.", 28, 106, 420, 48, { size: 13, fill: "$muted", lh: 1.5 }),
      ]
    }),

    // Bottom CTA
    T("Ready to write better code?", 80, 720, 500, 40, { size: 28, weight: 800, fill: "$text", ls: -1 }),
    R(80, 770, 200, 48, "$mint", { r: 10, children: [T("START FOR FREE →", 0, 13, 200, 22, { size: 11, weight: 800, fill: "$bg", align: "center", ls: 1 })] }),
  ]
};

// ── D3: Diff / Code View ──────────────────────────────────────────────────────
const desktop_diff = {
  type: "frame", name: "Desktop - Diff Viewer", width: DW, height: DH,
  fill: "$bg",
  children: [
    desktopNav(DW),
    Line(0, 64, DW, "$border"),

    // Left sidebar - file list
    R(0, 64, 260, DH - 64, "$surface", {
      stroke: "$border", sw: 1,
      children: [
        T("CHANGED FILES", 20, 20, 220, 14, { size: 9, fill: "$muted", ls: 1.5, weight: 700 }),
        T("47 issues · 12 auto-fixable", 20, 40, 220, 14, { size: 10, fill: "$muted" }),
        Line(0, 62, 260, "$border"),
        ...[
          ["auth/session.ts", 3, true],
          ["api/routes.ts", 0, false],
          ["utils/cache.ts", 1, true],
          ["components/Nav.tsx", 0, false],
          ["hooks/useAuth.ts", 2, true],
          ["lib/db.ts", 0, false],
          ["middleware.ts", 0, false],
          ["pages/index.tsx", 1, true],
          ["services/email.ts", 5, true],
          ["types/index.ts", 0, false],
          ["store/actions.ts", 2, true],
          ["config/next.ts", 0, false],
        ].map(([name, count, active], i) => R(8, 72 + i * 40, 244, 34, active && i === 0 ? "$mintDim" : "transparent", {
          r: 6, stroke: active && i === 0 ? "$mintGlow" : "transparent", sw: 1,
          children: [
            T(name, 12, 9, 180, 16, { size: 11, fill: i === 0 ? "$text" : "$muted", mono: true }),
            count > 0 ? Pill(212, 7, 24, 20, i === 0 ? "$mint" : "$dim", String(count), i === 0 ? "$bg" : "$muted", { size: 9 }) : { type: "frame", x: 0, y: 0, width: 1, height: 1, fill: "transparent", children: [] },
          ]
        })),
      ]
    }),

    // Main content
    R(260, 64, DW - 260, DH - 64, "transparent", {
      children: [
        // File header
        R(0, 0, DW - 260, 56, "$card", {
          children: [
            T("auth/session.ts", 24, 16, 300, 24, { size: 14, weight: 600, fill: "$text", mono: true }),
            Pill(340, 16, 80, 24, "$mintDim", "3 ISSUES", "$mint", { size: 9, ls: 0.5, stroke: "$mintGlow", sw: 1 }),
            // View toggles
            R(DW - 560, 12, 200, 32, "$surface", {
              r: 8, stroke: "$border", sw: 1,
              children: [
                R(2, 2, 98, 28, "$mint", { r: 6, children: [T("SPLIT VIEW", 0, 8, 98, 12, { size: 9, weight: 700, fill: "$bg", align: "center", ls: 0.8 })] }),
                R(100, 2, 98, 28, "transparent", { children: [T("UNIFIED", 0, 8, 98, 12, { size: 9, weight: 600, fill: "$muted", align: "center", ls: 0.8 })] }),
              ]
            }),
            R(DW - 348, 12, 156, 32, "$mint", { r: 8, children: [T("✓ APPLY ALL FIXES", 0, 9, 156, 14, { size: 9, weight: 800, fill: "$bg", align: "center", ls: 0.8 })] }),
            R(DW - 180, 12, 108, 32, "transparent", { r: 8, stroke: "$border2", sw: 1, children: [T("⊘ SKIP FILE", 0, 9, 108, 14, { size: 9, weight: 600, fill: "$muted", align: "center" })] }),
          ]
        }),

        // AI suggestion banner
        R(16, 72, DW - 292, 52, "$mintDim", {
          r: 10, stroke: "$mintGlow", sw: 1,
          children: [
            Dot(24, 26, 7, "$mint"),
            T("REFRACT AI:", 40, 12, 90, 14, { size: 9, weight: 700, fill: "$mint", ls: 1 }),
            T("Replace sequential awaits with Promise.all to run auth.getUser() and auth.getPerms() in parallel. Expected speedup: 3.2×.", 136, 12, 800, 28, { size: 12, fill: "$text", lh: 1.5 }),
            Pill(DW - 376, 14, 66, 24, "$mint", "+3.2×", "$bg", { size: 11, ls: 0.3 }),
          ]
        }),

        // Split pane
        // Before panel
        R(16, 140, (DW - 292) / 2 - 8, 680, "$surface", {
          r: 12, stroke: "$border", sw: 1,
          children: [
            R(0, 0, (DW - 292) / 2 - 8, 36, "$card", {
              r: 10, children: [
                T("BEFORE", 16, 10, 80, 16, { size: 10, weight: 700, fill: "$muted", ls: 1 }),
                T("Sequential await (slow)", (DW - 292) / 2 - 230, 10, 200, 16, { size: 10, fill: "$muted" }),
              ]
            }),
            ...([
              [1, "export async function getSession(", "$text"],
              [2, "  userId: string,", "$text"],
              [3, "  options: SessionOptions", "$text"],
              [4, ") {", "$text"],
              [5, "  // Sequential — blocks on each await", "$muted"],
              [6, "  const user = await auth.getUser(", "$red"],
              [7, "    userId", "$red"],
              [8, "  );", "$red"],
              [9, "  const perms = await auth.getPerms(", "$red"],
              [10,"    userId", "$red"],
              [11,"  );", "$red"],
              [12,"  return { user, perms };", "$text"],
              [13,"}", "$text"],
            ]).map(([ln, code, fill], i) =>
              R(0, 36 + i * 28, (DW - 292) / 2 - 8, 28, fill === "$red" ? "$redDim" : "transparent", {
                children: [
                  T(fill === "$red" ? "−" : " ", 8, 6, 14, 16, { size: 12, weight: 700, fill: "$red", mono: true }),
                  codeLine(24, 0, (DW - 292) / 2 - 40, ln, code, { codeFill: fill }),
                ]
              })
            ),
          ]
        }),

        // After panel
        R((DW - 292) / 2 + 8, 140, (DW - 292) / 2 - 8, 680, "$surface", {
          r: 12, stroke: "$mint", sw: 1,
          children: [
            R(0, 0, (DW - 292) / 2 - 8, 36, "$mintDim", {
              r: 10, children: [
                T("AFTER", 16, 10, 80, 16, { size: 10, weight: 700, fill: "$mint", ls: 1 }),
                T("Parallel fetch (3.2× faster)", (DW - 292) / 2 - 260, 10, 220, 16, { size: 10, fill: "$mint" }),
              ]
            }),
            ...([
              [1, "export async function getSession(", "$text"],
              [2, "  userId: string,", "$text"],
              [3, "  options: SessionOptions", "$text"],
              [4, ") {", "$text"],
              [5, "  // Parallel — runs both in one hop", "$mint"],
              [6, "  const [user, perms] =", "$mint"],
              [7, "    await Promise.all([", "$mint"],
              [8, "      auth.getUser(userId),", "$mint"],
              [9, "      auth.getPerms(userId),", "$mint"],
              [10,"    ]);", "$mint"],
              [11,"", "$muted"],
              [12,"  return { user, perms };", "$text"],
              [13,"}", "$text"],
            ]).map(([ln, code, fill], i) =>
              R(0, 36 + i * 28, (DW - 292) / 2 - 8, 28, fill === "$mint" ? "$mintDim" : "transparent", {
                children: [
                  T(fill === "$mint" ? "+" : " ", 8, 6, 14, 16, { size: 12, weight: 700, fill: "$mint", mono: true }),
                  codeLine(24, 0, (DW - 292) / 2 - 40, ln, code, { codeFill: fill }),
                ]
              })
            ),
          ]
        }),
      ]
    }),
  ]
};

// ── D4: Pricing ───────────────────────────────────────────────────────────────
const desktop_pricing = {
  type: "frame", name: "Desktop - Pricing", width: DW, height: DH,
  fill: "$bg",
  children: [
    desktopNav(DW),
    Line(0, 64, DW, "$border"),

    // Section header
    T("PRICING", 0, 100, DW, 20, { size: 10, fill: "$mint", weight: 700, ls: 3, align: "center" }),
    T("Simple, honest pricing.", 0, 128, DW, 60, { size: 48, weight: 900, fill: "$text", ls: -2, align: "center" }),
    T("No seats. No surprises. Cancel any time.", 0, 196, DW, 24, { size: 16, fill: "$muted", align: "center" }),

    // Toggle
    R(DW / 2 - 120, 236, 240, 40, "$surface", {
      r: 20, stroke: "$border", sw: 1,
      children: [
        R(2, 2, 116, 36, "$mint", { r: 18, children: [T("MONTHLY", 0, 10, 116, 16, { size: 10, weight: 700, fill: "$bg", align: "center", ls: 1 })] }),
        R(120, 2, 118, 36, "transparent", { children: [T("ANNUAL  −20%", 0, 10, 118, 16, { size: 9, weight: 600, fill: "$muted", align: "center", ls: 0.6 })] }),
      ]
    }),

    // Pricing cards
    // Free
    R(DW / 2 - 570, 296, 340, 480, "$surface", {
      r: 20, stroke: "$border", sw: 1,
      children: [
        T("Free", 32, 36, 200, 30, { size: 22, weight: 700, fill: "$text" }),
        T("For solo devs exploring AI refactoring.", 32, 72, 276, 40, { size: 13, fill: "$muted", lh: 1.5 }),
        T("$0", 32, 128, 120, 56, { size: 52, weight: 900, fill: "$text", ls: -2 }),
        T("/ month", 122, 152, 90, 22, { size: 14, fill: "$muted" }),
        Line(32, 200, 276, "$border"),
        ...[
          "500 lines/month",
          "3 repositories",
          "Basic diff engine",
          "Community support",
          "CLI access",
        ].map((feat, i) => R(32, 216 + i * 36, 276, 30, "transparent", {
          children: [
            T("✓", 0, 6, 20, 18, { size: 12, fill: "$muted", weight: 700 }),
            T(feat, 22, 6, 250, 18, { size: 13, fill: "$muted" }),
          ]
        })),
        R(32, 432, 276, 40, "transparent", {
          r: 10, stroke: "$border2", sw: 1,
          children: [T("GET STARTED →", 0, 11, 276, 18, { size: 11, weight: 700, fill: "$muted", align: "center", ls: 0.8 })]
        }),
      ]
    }),

    // Pro — highlighted
    R(DW / 2 - 200, 260, 400, 520, "$mintDim", {
      r: 20, stroke: "$mint", sw: 2,
      children: [
        Pill(32, 20, 80, 24, "$mint", "POPULAR", "$bg", { size: 8, ls: 1 }),
        T("Pro", 32, 54, 200, 30, { size: 22, weight: 700, fill: "$text" }),
        T("For professional engineers who ship daily.", 32, 90, 330, 40, { size: 13, fill: "$muted", lh: 1.5 }),
        T("$19", 32, 146, 120, 56, { size: 52, weight: 900, fill: "$mint", ls: -2 }),
        T("/ month", 132, 168, 90, 22, { size: 14, fill: "$muted" }),
        Line(32, 218, 336, "$mintGlow"),
        ...[
          "Unlimited lines",
          "25 repositories",
          "AI review on every PR",
          "One-click auto-fix",
          "CI/CD integration",
          "Priority support",
        ].map((feat, i) => R(32, 232 + i * 36, 336, 30, "transparent", {
          children: [
            T("✓", 0, 6, 20, 18, { size: 12, fill: "$mint", weight: 700 }),
            T(feat, 22, 6, 310, 18, { size: 13, fill: "$text" }),
          ]
        })),
        R(32, 460, 336, 44, "$mint", {
          r: 10, children: [T("START PRO →", 0, 12, 336, 20, { size: 11, weight: 800, fill: "$bg", align: "center", ls: 1 })]
        }),
      ]
    }),

    // Team
    R(DW / 2 + 230, 296, 340, 480, "$surface", {
      r: 20, stroke: "$border", sw: 1,
      children: [
        T("Team", 32, 36, 200, 30, { size: 22, weight: 700, fill: "$text" }),
        T("For orgs that take code quality seriously.", 32, 72, 276, 40, { size: 13, fill: "$muted", lh: 1.5 }),
        T("$49", 32, 128, 120, 56, { size: 52, weight: 900, fill: "$text", ls: -2 }),
        T("/ seat/mo", 122, 152, 100, 22, { size: 12, fill: "$muted" }),
        Line(32, 200, 276, "$border"),
        ...[
          "Everything in Pro",
          "Unlimited repos",
          "Shared rulebooks",
          "Org-level style guides",
          "SLA + dedicated support",
        ].map((feat, i) => R(32, 216 + i * 36, 276, 30, "transparent", {
          children: [
            T("✓", 0, 6, 20, 18, { size: 12, fill: "$muted", weight: 700 }),
            T(feat, 22, 6, 250, 18, { size: 13, fill: "$muted" }),
          ]
        })),
        R(32, 432, 276, 40, "transparent", {
          r: 10, stroke: "$border2", sw: 1,
          children: [T("CONTACT SALES →", 0, 11, 276, 18, { size: 11, weight: 700, fill: "$muted", align: "center", ls: 0.8 })]
        }),
      ]
    }),

    // FAQ teaser
    T("Questions? See our FAQ or talk to us.", 0, 844, DW, 24, { size: 14, fill: "$muted", align: "center" }),
    T("hello@refract.dev", 0, 868, DW, 20, { size: 13, fill: "$mint", align: "center" }),
  ]
};

// ── D5: Onboarding ────────────────────────────────────────────────────────────
const desktop_onboarding = {
  type: "frame", name: "Desktop - Onboarding", width: DW, height: DH,
  fill: "$bg",
  children: [
    desktopNav(DW),
    Line(0, 64, DW, "$border"),

    // Left panel — brand context
    R(0, 64, 480, DH - 64, "$surface", {
      stroke: "$border", sw: 1,
      children: [
        // Brand
        T("REFRACT", 60, 60, 200, 30, { size: 18, weight: 900, fill: "$mint", ls: 3 }),
        T("AI Code Refactoring", 60, 92, 200, 18, { size: 12, fill: "$muted", ls: 0.5 }),

        // Step tracker
        ...([
          { label: "Create account", done: true,   active: false, y: 160 },
          { label: "Connect your repo", done: false, active: true,  y: 220 },
          { label: "Run first analysis", done: false, active: false, y: 280 },
        ]).map(step => R(48, step.y, 360, 44, "transparent", {
          children: [
            // Step dot
            step.done
              ? R(0, 12, 20, 20, "$mint", { r: 10, children: [T("✓", 0, 3, 20, 14, { size: 11, weight: 800, fill: "$bg", align: "center" })] })
              : step.active
              ? Dot(10, 22, 10, "$mintDim", "$mint")
              : Dot(10, 22, 10, "transparent", "$border2"),
            T(step.label, 36, 12, 300, 20, {
              size: 15, weight: step.active ? 700 : 400,
              fill: step.active ? "$text" : step.done ? "$muted" : "$dim",
            }),
            // Vertical connector
            step.done || step.active
              ? Line(9, 44, 2, step.done ? "$mint" : "$border", 40)
              : { type: "frame", x: 0, y: 0, width: 1, height: 1, fill: "transparent", children: [] },
          ]
        })),

        // Social proof
        R(48, 360, 384, 120, "$card", {
          r: 16, stroke: "$border2", sw: 1,
          children: [
            T('"Refract shipped 30 auto-fixes\nin under 2 minutes."', 20, 20, 344, 48, { size: 15, weight: 600, fill: "$text", lh: 1.5 }),
            T("— Priya S., Senior Engineer at Vercel", 20, 76, 344, 18, { size: 12, fill: "$muted" }),
          ]
        }),

        // Stats
        T("12,400+", 60, 510, 160, 36, { size: 28, weight: 900, fill: "$mint" }),
        T("engineers using Refract", 60, 546, 200, 18, { size: 11, fill: "$muted" }),
        T("4.9 ★", 260, 510, 100, 36, { size: 28, weight: 900, fill: "$yellow" }),
        T("on Product Hunt", 260, 546, 160, 18, { size: 11, fill: "$muted" }),
      ]
    }),

    // Right panel — form
    R(480, 64, DW - 480, DH - 64, "transparent", {
      children: [
        // Step indicator
        R(0, 0, DW - 480, 8, "$dim", { children: [R(0, 0, (DW - 480) * 0.6, 8, "$mint", {})] }),

        T("Step 2 of 3", 60, 28, 200, 16, { size: 11, fill: "$muted", ls: 0.5 }),
        T("CONNECT YOUR REPO", 60, 44, 500, 16, { size: 10, weight: 700, fill: "$mint", ls: 2 }),

        T("Where does", 60, 82, 600, 54, { size: 48, weight: 900, fill: "$text", ls: -2 }),
        T("your code live?", 60, 130, 600, 54, { size: 48, weight: 900, fill: "$mint", ls: -2 }),

        T("We'll connect to your VCS, scan for refactoring opportunities,\nand never store your code.", 60, 200, 540, 44, { size: 14, fill: "$muted", lh: 1.65 }),

        // Provider cards
        ...[
          { name: "GitHub", sub: "Most popular · OAuth 2.0", icon: "◆", active: true,  y: 262 },
          { name: "GitLab", sub: "Self-hosted supported",    icon: "◇", active: false, y: 330 },
          { name: "Bitbucket", sub: "Atlassian SSO supported", icon: "◈", active: false, y: 398 },
        ].map(p => R(60, p.y, 540, 58, p.active ? "$mintDim" : "$surface", {
          r: 12, stroke: p.active ? "$mint" : "$border", sw: p.active ? 2 : 1,
          children: [
            T(p.icon, 22, 16, 26, 26, { size: 22, fill: p.active ? "$mint" : "$muted" }),
            T(p.name, 58, 12, 200, 22, { size: 16, weight: 700, fill: p.active ? "$text" : "$muted" }),
            T(p.sub, 58, 34, 300, 14, { size: 11, fill: "$muted" }),
            p.active ? Pill(484, 17, 50, 24, "$mint", "✓", "$bg", { size: 14 }) : R(478, 17, 24, 24, "transparent", { r: 12, stroke: "$border2", sw: 1, children: [] }),
          ]
        })),

        // Privacy note
        R(60, 468, 540, 48, "$yellowDim", {
          r: 10, stroke: "$yellow", sw: 1, opacity: 0.5,
          children: [
            T("⚠", 16, 12, 20, 24, { size: 16, fill: "$yellow" }),
            T("We request read-only access. Your source code never leaves your infrastructure.", 44, 12, 476, 24, { size: 12, fill: "$muted", lh: 1.5 }),
          ]
        }),

        // CTA
        R(60, 534, 270, 52, "$mint", {
          r: 12, children: [T("CONNECT GITHUB →", 0, 15, 270, 22, { size: 12, weight: 800, fill: "$bg", align: "center", ls: 1 })]
        }),
        T("← Back to step 1", 352, 549, 200, 22, { size: 12, fill: "$muted" }),

        // Security badge
        T("🔒  Read-only · No code storage · SOC 2 Type II", 60, 606, 400, 18, { size: 11, fill: "$muted" }),
      ]
    }),
  ]
};

// ══════════════════════════════════════════════════════════════════════════════
// ASSEMBLE + WRITE
// ══════════════════════════════════════════════════════════════════════════════

const pen = {
  version: "2.8",
  variables: vars,
  children: [
    mobile_hero,
    mobile_features,
    mobile_diff,
    mobile_pricing,
    mobile_onboarding,
    desktop_hero,
    desktop_features,
    desktop_diff,
    desktop_pricing,
    desktop_onboarding,
  ]
};

fs.writeFileSync('refract-app.pen', JSON.stringify(pen, null, 2));
console.log('✓ refract-app.pen written');
console.log(`  Screens: ${pen.children.length} (5 mobile + 5 desktop)`);
