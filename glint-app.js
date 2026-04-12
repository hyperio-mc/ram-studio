// glint-app.js
// "GLINT" — AI Writing Assistant Landing Page
// Challenge: Design a landing page using the word-pill typographic hero style
// Inspired by:
//   - OWO's word-pill capsule typography (darkmodedesign.com, Mar 20 2026)
//     Each word of headline sits inside a distinct colored rounded capsule on dark bg
//   - Locomotive.ca's editorial-first bold typographic energy (godly.website)
//   - Hemispherical Stacks' deep purple sci-fi aesthetic (minimal.gallery)
// Palette: #070710 near-void + #3DFF9A acid green + #7C3AED violet + #F43F5E hot pink + #FBBF24 amber
// pencil.dev v2.8 — 5 mobile screens + 5 desktop screens

const fs = require('fs');

const vars = {
  bg:        { type: "color", value: "#070710" },
  surface:   { type: "color", value: "#0C0C1A" },
  card:      { type: "color", value: "#111122" },
  border:    { type: "color", value: "#1A1A2E" },
  border2:   { type: "color", value: "#252540" },
  // Word-pill accent colors (OWO-inspired)
  green:     { type: "color", value: "#3DFF9A" },
  greenDim:  { type: "color", value: "#0A2618" },
  violet:    { type: "color", value: "#7C3AED" },
  violetDim: { type: "color", value: "#1A0D30" },
  pink:      { type: "color", value: "#F43F5E" },
  pinkDim:   { type: "color", value: "#2A0A10" },
  amber:     { type: "color", value: "#FBBF24" },
  amberDim:  { type: "color", value: "#2A1D06" },
  text:      { type: "color", value: "#F0EFF8" },
  muted:     { type: "color", value: "#4A4A6A" },
  dim:       { type: "color", value: "#16162A" },
};

// ── Primitives ─────────────────────────────────────────────────────────────────
const T = (content, x, y, w, h, opts = {}) => ({
  type: "text", content, x, y, width: w, height: h,
  fontSize: opts.size || 14,
  fontWeight: opts.weight || 400,
  fill: opts.fill || "$text",
  textAlign: opts.align || "left",
  letterSpacing: opts.ls,
  lineHeight: opts.lh,
  opacity: opts.opacity,
  fontFamily: opts.mono ? "'Fira Code', monospace" : undefined,
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

const Pill = (x, y, w, h, fill, label, textFill, opts = {}) => ({
  type: "frame", x, y, width: w, height: h,
  fill, cornerRadius: h / 2,
  strokeColor: opts.stroke,
  strokeWidth: opts.sw || 1,
  children: label ? [T(label, 8, 0, w - 16, h, { size: opts.size || 10, weight: 700, fill: textFill || "$bg", align: "center", ls: opts.ls })] : [],
});

const Dot = (x, y, r, fill, stroke) => ({
  type: "ellipse", x: x - r, y: y - r, width: r * 2, height: r * 2,
  fill: fill || "transparent",
  strokeColor: stroke,
  strokeWidth: 1,
});

const Line = (x, y, w, color, h = 1) => R(x, y, w, h, color);

// ── Status bar ─────────────────────────────────────────────────────────────────
const statusBar = (bg) => R(0, 0, 390, 44, bg || "$bg", {
  children: [
    T("9:41", 20, 14, 50, 16, { size: 12, weight: 600, fill: "$muted" }),
    T("●  ▲  ■", 300, 14, 70, 16, { size: 9, weight: 500, fill: "$muted", align: "right" }),
  ]
});

// ── Mobile Nav ─────────────────────────────────────────────────────────────────
const mobileNav = (active) => {
  const items = [
    { icon: "✦", label: "Write", key: "write" },
    { icon: "◈", label: "Edit", key: "edit" },
    { icon: "◎", label: "Ideas", key: "ideas" },
    { icon: "⊞", label: "Library", key: "library" },
    { icon: "◆", label: "Publish", key: "publish" },
  ];
  return R(0, 762, 390, 72, "$surface", {
    stroke: "$border", sw: 1,
    children: items.map((item, i) => {
      const isActive = item.key === active;
      const x = i * 78;
      return R(x, 0, 78, 72, "transparent", {
        children: [
          T(item.icon, 0, 12, 78, 24, { size: 20, fill: isActive ? "$green" : "$muted", align: "center" }),
          T(item.label, 0, 38, 78, 18, { size: 10, weight: isActive ? 700 : 400, fill: isActive ? "$text" : "$muted", align: "center" }),
        ]
      });
    })
  });
};

// ── Reusable: Word Pill (OWO-inspired) ────────────────────────────────────────
const WordPill = (x, y, text, fillColor, textColor, size = 32) => {
  const w = text.length * size * 0.62 + 28;
  const h = size + 18;
  return {
    type: "frame", x, y, width: w, height: h,
    fill: fillColor, cornerRadius: h / 2,
    children: [T(text, 14, 0, w - 28, h, { size, weight: 800, fill: textColor || "$bg", align: "center" })]
  };
};

// ── Screen 1: MOBILE HERO ──────────────────────────────────────────────────────
function mobileHero() {
  const children = [
    statusBar(),

    // Nav bar
    R(0, 44, 390, 56, "$surface", {
      stroke: "$border", sw: 1,
      children: [
        T("GLINT", 20, 16, 80, 24, { size: 16, weight: 900, fill: "$text", ls: 2 }),
        Pill(280, 12, 90, 32, "$green", "Try Free", "$bg", { size: 11 }),
      ]
    }),

    // Hero label
    T("AI WRITING ASSISTANT", 20, 128, 350, 20, { size: 9, weight: 700, fill: "$muted", ls: 3 }),

    // Word-pill headline row 1
    WordPill(20, 154, "Generate", "$green", "$bg", 28),
    WordPill(208, 154, "ideas", "$violetDim", "$violet", 28),

    // Word-pill headline row 2
    WordPill(20, 206, "Polish", "$violet", "$text", 28),
    WordPill(148, 206, "every", "$pinkDim", "$pink", 28),
    WordPill(260, 206, "word", "$pinkDim", "$pink", 28),

    // Word-pill headline row 3
    WordPill(20, 258, "Publish", "$amberDim", "$amber", 28),
    WordPill(168, 258, "anywhere.", "$amberDim", "$amber", 28),

    // Tagline
    T("From blank page to polished post in seconds.\nGLINT writes, edits, and adapts your voice.", 20, 312, 350, 52, { size: 13, fill: "$muted", lh: 1.7 }),

    // CTA
    R(20, 380, 350, 52, "$green", {
      r: 26,
      children: [T("Start Writing Free", 0, 0, 350, 52, { size: 15, weight: 800, fill: "$bg", align: "center" })]
    }),

    // Social proof
    T("★★★★★  12,000+ writers trust GLINT", 20, 448, 350, 20, { size: 12, fill: "$muted", align: "center" }),

    // Feature strip
    R(0, 486, 390, 1, "$border"),
    T("WHAT GLINT DOES", 20, 502, 350, 16, { size: 9, weight: 700, fill: "$muted", ls: 2 }),

    // Feature pills row
    Pill(20, 528, 108, 30, "$card", "✦ Generate", "$green", { size: 10, stroke: "$border", sw: 1 }),
    Pill(136, 528, 92, 30, "$card", "◈ Polish", "$violet", { size: 10, stroke: "$border", sw: 1 }),
    Pill(236, 528, 92, 30, "$card", "◆ Publish", "$pink", { size: 10, stroke: "$border", sw: 1 }),

    // Mini feature cards
    R(20, 572, 165, 120, "$card", {
      r: 14, stroke: "$border", sw: 1,
      children: [
        T("✦", 20, 18, 30, 28, { size: 20, fill: "$green" }),
        T("AI Drafts", 20, 50, 125, 18, { size: 14, weight: 700, fill: "$text" }),
        T("Blog posts, emails,\nsocial — in seconds.", 20, 72, 125, 34, { size: 10, fill: "$muted", lh: 1.6 }),
      ]
    }),
    R(205, 572, 165, 120, "$card", {
      r: 14, stroke: "$border", sw: 1,
      children: [
        T("◈", 20, 18, 30, 28, { size: 20, fill: "$violet" }),
        T("Your Voice", 20, 50, 125, 18, { size: 14, weight: 700, fill: "$text" }),
        T("Learns your style.\nAlways sounds like you.", 20, 72, 125, 34, { size: 10, fill: "$muted", lh: 1.6 }),
      ]
    }),
    R(20, 702, 165, 120, "$card", {
      r: 14, stroke: "$border", sw: 1,
      children: [
        T("◎", 20, 18, 30, 28, { size: 20, fill: "$pink" }),
        T("Idea Sparks", 20, 50, 125, 18, { size: 14, weight: 700, fill: "$text" }),
        T("Never face blank\npage again.", 20, 72, 125, 34, { size: 10, fill: "$muted", lh: 1.6 }),
      ]
    }),
    R(205, 702, 165, 120, "$card", {
      r: 14, stroke: "$border", sw: 1,
      children: [
        T("◆", 20, 18, 30, 28, { size: 20, fill: "$amber" }),
        T("1-Click Publish", 20, 50, 125, 18, { size: 14, weight: 700, fill: "$text" }),
        T("Medium, Ghost,\nSubstack & more.", 20, 72, 125, 34, { size: 10, fill: "$muted", lh: 1.6 }),
      ]
    }),

    mobileNav("write"),
  ];

  return {
    name: "M · Hero",
    width: 390, height: 834,
    fill: "$bg",
    children,
  };
}

// ── Screen 2: MOBILE EDITOR ────────────────────────────────────────────────────
function mobileEditor() {
  const children = [
    statusBar(),

    // Header
    R(0, 44, 390, 56, "$surface", {
      stroke: "$border", sw: 1,
      children: [
        T("←", 20, 16, 24, 24, { size: 18, fill: "$muted" }),
        T("Blog Post", 56, 14, 200, 28, { size: 16, weight: 700, fill: "$text" }),
        T("⊞", 340, 16, 30, 24, { size: 18, fill: "$green" }),
      ]
    }),

    // Toolbar
    R(0, 100, 390, 44, "$card", {
      stroke: "$border", sw: 1,
      children: [
        T("B", 16, 10, 24, 24, { size: 14, weight: 800, fill: "$text" }),
        T("I", 48, 10, 24, 24, { size: 14, weight: 400, fill: "$muted" }),
        T("H", 80, 10, 24, 24, { size: 14, weight: 700, fill: "$muted" }),
        Line(112, 8, 1, "$border2", 28),
        Pill(120, 8, 72, 28, "$greenDim", "✦ AI Write", "$green", { size: 9 }),
        Pill(200, 8, 68, 28, "$violetDim", "◈ Polish", "$violet", { size: 9 }),
        Pill(276, 8, 72, 28, "$pinkDim", "◎ Expand", "$pink", { size: 9 }),
      ]
    }),

    // Document area
    R(0, 144, 390, 474, "$bg", {
      children: [
        T("The Future of Remote Work", 24, 20, 342, 36, { size: 22, weight: 800, fill: "$text", lh: 1.2 }),
        T("March 20, 2026 · 5 min read", 24, 62, 342, 18, { size: 11, fill: "$muted" }),
        Line(24, 88, 342, "$border"),

        T("Remote work has fundamentally changed how we collaborate. In 2026, the lines between home and office have blurred completely, and teams operate across timezones with a fluidity that would have been impossible five years ago.", 24, 104, 342, 68, { size: 13, fill: "$text", lh: 1.75, opacity: 0.8 }),

        // AI suggestion box
        R(24, 184, 342, 80, "$violetDim", {
          r: 10, stroke: "$violet", sw: 1,
          children: [
            T("◈ AI SUGGESTION", 14, 12, 200, 16, { size: 9, weight: 700, fill: "$violet", ls: 1.5 }),
            T("Add a statistic here? \"78% of knowledge workers now prefer hybrid models\" — cite from Future Work Index 2026.", 14, 32, 314, 38, { size: 11, fill: "$text", lh: 1.6, opacity: 0.85 }),
          ]
        }),

        T("The real challenge isn't technology anymore — it's culture. Companies that thrive are those that have rebuilt their rituals...", 24, 278, 342, 48, { size: 13, fill: "$text", lh: 1.75, opacity: 0.8 }),

        // Cursor
        R(24, 336, 2, 22, "$green", { r: 1 }),
        T("Write more...", 30, 336, 200, 22, { size: 13, fill: "$muted", opacity: 0.4 }),
      ]
    }),

    // Bottom AI bar
    R(0, 618, 390, 76, "$card", {
      stroke: "$border", sw: 1,
      children: [
        R(16, 16, 270, 44, "$surface", {
          r: 22, stroke: "$border2", sw: 1,
          children: [
            T("Ask GLINT anything...", 20, 0, 230, 44, { size: 13, fill: "$muted" }),
          ]
        }),
        R(298, 16, 76, 44, "$green", {
          r: 22,
          children: [T("Send", 0, 0, 76, 44, { size: 13, weight: 700, fill: "$bg", align: "center" })]
        }),
      ]
    }),

    // Word count / stats
    R(0, 694, 390, 36, "$surface", {
      stroke: "$border", sw: 1,
      children: [
        T("342 words", 20, 8, 100, 20, { size: 11, fill: "$muted" }),
        T("Reading: 1.7 min", 140, 8, 110, 20, { size: 11, fill: "$muted" }),
        Pill(290, 6, 84, 24, "$greenDim", "● Writing", "$green", { size: 9 }),
      ]
    }),

    mobileNav("edit"),
  ];

  return {
    name: "M · Editor",
    width: 390, height: 834,
    fill: "$bg",
    children,
  };
}

// ── Screen 3: MOBILE IDEAS ─────────────────────────────────────────────────────
function mobileIdeas() {
  const ideas = [
    { title: "Why AI Won't Replace Writers", tags: ["Essay", "AI"], color: "$green" },
    { title: "10 Morning Routines of Top Founders", tags: ["Listicle", "Productivity"], color: "$violet" },
    { title: "The Quiet Revolution in B2B SaaS", tags: ["Analysis", "Startups"], color: "$pink" },
    { title: "Your Brand Voice: A Deep Dive", tags: ["Marketing", "Brand"], color: "$amber" },
    { title: "Remote Teams: What Actually Works", tags: ["Teams", "Culture"], color: "$green" },
  ];

  const children = [
    statusBar(),

    // Header
    R(0, 44, 390, 56, "$surface", {
      stroke: "$border", sw: 1,
      children: [
        T("◎ Idea Sparks", 20, 14, 200, 28, { size: 18, weight: 800, fill: "$text" }),
        Pill(290, 12, 80, 32, "$violetDim", "+ New", "$violet", { size: 11, stroke: "$violet", sw: 1 }),
      ]
    }),

    // Generate ideas prompt
    R(16, 116, 358, 68, "$card", {
      r: 14, stroke: "$border", sw: 1,
      children: [
        T("✦ Generate ideas about...", 16, 16, 280, 22, { size: 13, fill: "$muted" }),
        Pill(246, 12, 96, 44, "$green", "✦ Spark", "$bg", { size: 12 }),
      ]
    }),

    T("SAVED IDEAS · 12", 16, 204, 200, 16, { size: 9, weight: 700, fill: "$muted", ls: 2 }),

    // Idea cards
    ...ideas.slice(0, 4).map((idea, i) => {
      const y = 228 + i * 110;
      return R(16, y, 358, 96, "$card", {
        r: 14, stroke: "$border", sw: 1,
        children: [
          R(16, 18, 4, 60, idea.color, { r: 2 }),
          T(idea.title, 32, 16, 290, 40, { size: 15, weight: 700, fill: "$text", lh: 1.35 }),
          ...idea.tags.map((tag, ti) =>
            Pill(32 + ti * 80, 64, 70, 22, "$surface", tag, idea.color, { size: 9, stroke: "$border2", sw: 1 })
          ),
          T("→", 322, 32, 20, 32, { size: 14, fill: "$muted", align: "center" }),
        ]
      });
    }),

    mobileNav("ideas"),
  ];

  return {
    name: "M · Ideas",
    width: 390, height: 834,
    fill: "$bg",
    children,
  };
}

// ── Screen 4: MOBILE PUBLISH ───────────────────────────────────────────────────
function mobilePublish() {
  const platforms = [
    { name: "Substack", icon: "◎", color: "$amber", connected: true },
    { name: "Medium", icon: "◆", color: "$green", connected: true },
    { name: "Ghost", icon: "✦", color: "$violet", connected: false },
    { name: "LinkedIn", icon: "⊞", color: "$pink", connected: false },
  ];

  const children = [
    statusBar(),

    // Header
    R(0, 44, 390, 56, "$surface", {
      stroke: "$border", sw: 1,
      children: [
        T("◆ Publish", 20, 14, 180, 28, { size: 18, weight: 800, fill: "$text" }),
        Pill(270, 12, 100, 32, "$pinkDim", "● Scheduled", "$pink", { size: 10, stroke: "$pink", sw: 1 }),
      ]
    }),

    // Current draft
    R(16, 116, 358, 100, "$card", {
      r: 14, stroke: "$border", sw: 1,
      children: [
        T("Ready to publish", 16, 14, 200, 18, { size: 11, weight: 700, fill: "$muted", ls: 1 }),
        T("The Future of Remote Work", 16, 36, 290, 26, { size: 16, weight: 800, fill: "$text" }),
        T("342 words · 1.7 min read · SEO: 87%", 16, 68, 290, 16, { size: 11, fill: "$muted" }),
        Pill(274, 36, 68, 26, "$greenDim", "✓ Ready", "$green", { size: 9 }),
      ]
    }),

    T("PUBLISH TO", 16, 234, 200, 16, { size: 9, weight: 700, fill: "$muted", ls: 2 }),

    // Platform cards
    ...platforms.map((p, i) => {
      const y = 258 + i * 86;
      const connected = p.connected;
      return R(16, y, 358, 72, "$card", {
        r: 14, stroke: connected ? `${p.color.replace('$', '')}` : "$border", sw: 1,
        children: [
          T(p.icon, 20, 0, 40, 72, { size: 24, fill: p.color }),
          T(p.name, 64, 20, 160, 22, { size: 15, weight: 700, fill: "$text" }),
          T(connected ? "Connected" : "Connect →", 64, 44, 160, 16, { size: 11, fill: connected ? "$green" : "$muted" }),
          R(298, 22, 44, 28, connected ? "$greenDim" : "$surface", {
            r: 6, stroke: connected ? "$green" : "$border2", sw: 1,
            children: [T(connected ? "Post" : "+", 0, 0, 44, 28, { size: 11, weight: 700, fill: connected ? "$green" : "$muted", align: "center" })]
          }),
        ]
      });
    }),

    // Schedule option
    R(16, 608, 358, 56, "$amberDim", {
      r: 14, stroke: "$amber", sw: 1,
      children: [
        T("◎", 20, 0, 30, 56, { size: 18, fill: "$amber" }),
        T("Schedule for best time", 56, 12, 240, 18, { size: 13, weight: 600, fill: "$text" }),
        T("GLINT suggests 9AM Tuesday", 56, 32, 240, 16, { size: 11, fill: "$amber" }),
      ]
    }),

    mobileNav("publish"),
  ];

  return {
    name: "M · Publish",
    width: 390, height: 834,
    fill: "$bg",
    children,
  };
}

// ── Screen 5: MOBILE PRICING ───────────────────────────────────────────────────
function mobilePricing() {
  const children = [
    statusBar(),

    // Header
    R(0, 44, 390, 56, "$surface", {
      stroke: "$border", sw: 1,
      children: [
        T("←", 20, 16, 24, 24, { size: 18, fill: "$muted" }),
        T("Plans", 56, 14, 180, 28, { size: 18, weight: 800, fill: "$text" }),
      ]
    }),

    // Headline
    T("Start free,\nscale when ready.", 20, 120, 350, 68, { size: 32, weight: 900, fill: "$text", lh: 1.15 }),

    // Toggle
    R(20, 208, 350, 44, "$card", {
      r: 22, stroke: "$border", sw: 1,
      children: [
        R(4, 4, 171, 36, "$surface", { r: 18 }),
        T("Monthly", 4, 0, 171, 44, { size: 13, weight: 700, fill: "$text", align: "center" }),
        T("Annual · Save 40%", 175, 0, 175, 44, { size: 13, weight: 400, fill: "$muted", align: "center" }),
      ]
    }),

    // Free plan
    R(20, 268, 350, 176, "$card", {
      r: 16, stroke: "$border", sw: 1,
      children: [
        T("Spark", 20, 20, 200, 24, { size: 18, weight: 800, fill: "$text" }),
        T("Free forever", 20, 48, 200, 18, { size: 13, fill: "$muted" }),
        T("$0", 20, 74, 200, 36, { size: 30, weight: 900, fill: "$text" }),
        T("/month", 88, 88, 80, 18, { size: 13, fill: "$muted" }),
        T("✓  50 AI generations/mo", 20, 120, 310, 18, { size: 12, fill: "$muted" }),
        T("✓  5 publish destinations", 20, 142, 310, 18, { size: 12, fill: "$muted" }),
      ]
    }),

    // Pro plan — highlighted
    R(20, 460, 350, 220, "$card", {
      r: 16, stroke: "$green", sw: 2,
      children: [
        Pill(20, 16, 80, 24, "$green", "POPULAR", "$bg", { size: 9 }),
        T("Flow", 20, 48, 200, 24, { size: 18, weight: 800, fill: "$text" }),
        T("For serious writers", 20, 76, 200, 18, { size: 13, fill: "$muted" }),
        T("$19", 20, 102, 100, 40, { size: 36, weight: 900, fill: "$green" }),
        T("/month", 102, 118, 80, 18, { size: 13, fill: "$muted" }),
        T("✓  Unlimited generations", 20, 150, 310, 18, { size: 12, fill: "$text" }),
        T("✓  Voice learning model", 20, 172, 310, 18, { size: 12, fill: "$text" }),
        T("✓  All publish integrations", 20, 194, 310, 18, { size: 12, fill: "$text" }),
      ]
    }),

    R(20, 696, 350, 52, "$green", {
      r: 26,
      children: [T("Get Flow — $19/mo", 0, 0, 350, 52, { size: 15, weight: 800, fill: "$bg", align: "center" })]
    }),

    mobileNav("write"),
  ];

  return {
    name: "M · Pricing",
    width: 390, height: 834,
    fill: "$bg",
    children,
  };
}

// ── Desktop Sidebar ────────────────────────────────────────────────────────────
function desktopSidebar(active) {
  const items = [
    { icon: "✦", label: "Write", key: "write" },
    { icon: "◈", label: "Polish", key: "edit" },
    { icon: "◎", label: "Ideas", key: "ideas" },
    { icon: "⊞", label: "Library", key: "library" },
    { icon: "◆", label: "Publish", key: "publish" },
    { icon: "◉", label: "Analytics", key: "analytics" },
  ];

  return R(0, 0, 220, 900, "$surface", {
    stroke: "$border", sw: 1,
    children: [
      // Logo
      R(0, 0, 220, 64, "transparent", {
        stroke: "$border", sw: 1,
        children: [
          T("✦", 20, 16, 24, 32, { size: 22, fill: "$green" }),
          T("GLINT", 52, 18, 100, 28, { size: 16, weight: 900, fill: "$text", ls: 2 }),
        ]
      }),

      // Nav items
      ...items.map((item, i) => {
        const isActive = item.key === active;
        const y = 80 + i * 52;
        return R(12, y, 196, 44, isActive ? "$dim" : "transparent", {
          r: 8,
          children: [
            T(item.icon, 16, 0, 24, 44, { size: 16, fill: isActive ? "$green" : "$muted" }),
            T(item.label, 48, 0, 120, 44, { size: 14, weight: isActive ? 700 : 400, fill: isActive ? "$text" : "$muted" }),
            isActive ? R(186, 16, 4, 12, "$green", { r: 2 }) : null,
          ].filter(Boolean)
        });
      }),

      // Divider
      Line(20, 412, 180, "$border"),

      // User / workspace
      R(12, 424, 196, 52, "transparent", {
        children: [
          Dot(28, 452, 16, "$violet"),
          T("Alex M.", 52, 432, 100, 18, { size: 13, weight: 600, fill: "$text" }),
          T("Pro · 2,341 words", 52, 452, 130, 16, { size: 11, fill: "$muted" }),
        ]
      }),

      // Daily goal
      R(16, 820, 188, 60, "$dim", {
        r: 10,
        children: [
          T("Daily Goal", 14, 12, 120, 16, { size: 10, weight: 700, fill: "$muted", ls: 1 }),
          T("2,341 / 3,000 words", 14, 30, 160, 18, { size: 12, fill: "$text" }),
          R(14, 48, 160, 4, "$border2", { r: 2,
            children: [R(0, 0, 125, 4, "$green", { r: 2 })]
          }),
        ]
      }),
    ]
  });
}

// ── Screen 6: DESKTOP HERO / LANDING ─────────────────────────────────────────
function desktopHero() {
  return {
    name: "D · Landing",
    width: 1440, height: 900,
    fill: "$bg",
    children: [
      // Nav
      R(0, 0, 1440, 72, "$surface", {
        stroke: "$border", sw: 1,
        children: [
          T("✦ GLINT", 40, 22, 100, 28, { size: 20, weight: 900, fill: "$text", ls: 1 }),
          T("Features", 220, 24, 80, 24, { size: 14, fill: "$muted" }),
          T("Pricing", 320, 24, 70, 24, { size: 14, fill: "$muted" }),
          T("Blog", 410, 24, 50, 24, { size: 14, fill: "$muted" }),
          Pill(1200, 18, 100, 36, "$card", "Sign In", "$muted", { size: 13, stroke: "$border", sw: 1 }),
          Pill(1316, 18, 104, 36, "$green", "Start Free", "$bg", { size: 13 }),
        ]
      }),

      // Hero section
      T("AI WRITING STUDIO", 120, 146, 400, 22, { size: 11, weight: 700, fill: "$muted", ls: 3 }),

      // WORD PILL HEADLINE — main OWO-inspired element
      // Row 1
      { type: "frame", x: 120, y: 178, width: 214, height: 72, fill: "$green", cornerRadius: 36,
        children: [T("Generate", 18, 0, 178, 72, { size: 40, weight: 900, fill: "$bg", align: "center" })] },
      { type: "frame", x: 348, y: 178, width: 152, height: 72, fill: "$dim", cornerRadius: 36,
        children: [T("ideas,", 16, 0, 120, 72, { size: 40, weight: 900, fill: "$violet", align: "center" })] },
      { type: "frame", x: 514, y: 178, width: 148, height: 72, fill: "$pinkDim", cornerRadius: 36,
        children: [T("polish", 16, 0, 116, 72, { size: 40, weight: 900, fill: "$pink", align: "center" })] },

      // Row 2
      { type: "frame", x: 120, y: 264, width: 148, height: 72, fill: "$amberDim", cornerRadius: 36,
        children: [T("every", 16, 0, 116, 72, { size: 40, weight: 900, fill: "$amber", align: "center" })] },
      { type: "frame", x: 282, y: 264, width: 138, height: 72, fill: "$dim", cornerRadius: 36,
        children: [T("word,", 16, 0, 106, 72, { size: 40, weight: 900, fill: "$text", align: "center" })] },
      { type: "frame", x: 434, y: 264, width: 180, height: 72, fill: "$violetDim", cornerRadius: 36,
        children: [T("publish", 16, 0, 148, 72, { size: 40, weight: 900, fill: "$violet", align: "center" })] },

      // Row 3
      { type: "frame", x: 120, y: 350, width: 250, height: 72, fill: "$greenDim", cornerRadius: 36,
        children: [T("everywhere.", 16, 0, 218, 72, { size: 40, weight: 900, fill: "$green", align: "center" })] },

      // Tagline
      T("From first idea to polished post. GLINT learns your voice,\ngenerates drafts, and publishes across every platform.", 120, 454, 600, 56, { size: 18, fill: "$muted", lh: 1.6 }),

      // CTAs
      R(120, 532, 200, 56, "$green", {
        r: 28,
        children: [T("Start Writing Free", 0, 0, 200, 56, { size: 15, weight: 800, fill: "$bg", align: "center" })]
      }),
      R(336, 532, 160, 56, "$dim", {
        r: 28, stroke: "$border", sw: 1,
        children: [T("Watch Demo →", 0, 0, 160, 56, { size: 15, fill: "$text", align: "center" })]
      }),

      // Social proof
      T("★★★★★", 120, 606, 90, 20, { size: 14, fill: "$amber" }),
      T("Loved by 12,000+ writers · No credit card required", 218, 606, 360, 20, { size: 13, fill: "$muted" }),

      // Right side — floating editor preview
      R(760, 88, 620, 760, "$card", {
        r: 20, stroke: "$border", sw: 1,
        children: [
          // Editor chrome
          R(0, 0, 620, 48, "$surface", {
            r: 20,
            children: [
              Dot(20, 24, 6, "#FF5F56"),
              Dot(38, 24, 6, "#FFBD2E"),
              Dot(56, 24, 6, "#27C93F"),
              T("The Future of Remote Work.md", 80, 12, 300, 24, { size: 12, fill: "$muted" }),
              Pill(490, 10, 110, 28, "$greenDim", "● AI Writing", "$green", { size: 10 }),
            ]
          }),
          // Toolbar strip
          R(0, 48, 620, 36, "$dim", {
            children: [
              T("B  I  H₁  H₂  ─", 16, 8, 140, 20, { size: 12, fill: "$muted" }),
              Pill(200, 6, 80, 24, "$violetDim", "◈ Polish", "$violet", { size: 10 }),
              Pill(290, 6, 80, 24, "$pinkDim", "◎ Expand", "$pink", { size: 10 }),
              Pill(380, 6, 80, 24, "$amberDim", "⊞ Outline", "$amber", { size: 10 }),
            ]
          }),
          // Document
          T("The Future of Remote Work", 30, 110, 560, 34, { size: 24, weight: 800, fill: "$text" }),
          T("March 20, 2026  ·  5 min read  ·  SEO score: 87%", 30, 150, 560, 18, { size: 11, fill: "$muted" }),
          Line(30, 176, 560, "$border"),
          T("Remote work has fundamentally changed how we collaborate. In 2026, the lines between home and office have blurred completely, and teams operate across timezones with a fluidity that would have been impossible just five years ago.", 30, 194, 560, 52, { size: 13, fill: "$text", lh: 1.75, opacity: 0.8 }),

          // AI suggestion card
          R(30, 258, 560, 88, "$violetDim", {
            r: 10, stroke: "$violet", sw: 1,
            children: [
              T("◈ AI SUGGESTION", 16, 12, 200, 16, { size: 9, weight: 700, fill: "$violet", ls: 1.5 }),
              T("Add supporting data: \"78% of knowledge workers prefer hybrid models in 2026.\" Cite from the Future Work Index.", 16, 34, 524, 36, { size: 12, fill: "$text", lh: 1.6, opacity: 0.85 }),
              Pill(464, 54, 80, 24, "$violetDim", "Accept →", "$violet", { size: 9, stroke: "$violet", sw: 1 }),
            ]
          }),

          T("The real challenge isn't technology anymore — it's culture. Companies that genuinely thrive are those that have rebuilt their communication rituals from scratch for a distributed world.", 30, 358, 560, 52, { size: 13, fill: "$text", lh: 1.75, opacity: 0.8 }),

          // Word count bar
          R(0, 700, 620, 36, "$surface", {
            r: 10,
            children: [
              T("342 words · 1.7 min", 16, 9, 160, 18, { size: 11, fill: "$muted" }),
              T("Flesch: 68 · Grade 9", 200, 9, 160, 18, { size: 11, fill: "$muted" }),
              Pill(490, 6, 110, 24, "$greenDim", "● Auto-saving", "$green", { size: 10 }),
            ]
          }),
        ]
      }),
    ]
  };
}

// ── Screen 7: DESKTOP FEATURES ────────────────────────────────────────────────
function desktopFeatures() {
  return {
    name: "D · Features",
    width: 1440, height: 900,
    fill: "$bg",
    children: [
      // Nav
      R(0, 0, 1440, 64, "$surface", {
        stroke: "$border", sw: 1,
        children: [
          T("✦ GLINT", 40, 18, 100, 28, { size: 18, weight: 900, fill: "$text", ls: 1 }),
          Pill(1316, 14, 104, 36, "$green", "Start Free", "$bg", { size: 13 }),
        ]
      }),

      // Headline
      T("Everything you need\nto write better, faster.", 120, 96, 700, 96, { size: 52, weight: 900, fill: "$text", lh: 1.1 }),
      T("CORE FEATURES", 120, 80, 300, 16, { size: 10, weight: 700, fill: "$green", ls: 3 }),

      // Bento grid — inspired by Capacity/LangChain bento on landbook.com
      // Large card top-left
      R(120, 220, 440, 320, "$card", {
        r: 20, stroke: "$border", sw: 1,
        children: [
          T("✦", 30, 28, 40, 40, { size: 32, fill: "$green" }),
          T("AI Drafts", 30, 78, 360, 30, { size: 24, weight: 800, fill: "$text" }),
          T("Generate complete blog posts,\nemails, and social content.\nJust describe what you need.", 30, 118, 380, 60, { size: 14, fill: "$muted", lh: 1.7 }),

          // Mini demo
          R(30, 192, 380, 100, "$surface", {
            r: 10,
            children: [
              T("\"Write a 500-word post about remote work\"", 16, 16, 348, 20, { size: 12, fill: "$muted" }),
              Line(16, 44, 348, "$border"),
              T("Generating... The Future of Remote Work: How Teams in 2026 Stay Connected Without an Office...", 16, 58, 348, 32, { size: 12, fill: "$green", lh: 1.5 }),
            ]
          }),
        ]
      }),

      // Top-center card
      R(576, 220, 280, 152, "$card", {
        r: 20, stroke: "$border", sw: 1,
        children: [
          T("◈", 24, 24, 32, 32, { size: 26, fill: "$violet" }),
          T("Your Voice", 24, 64, 220, 24, { size: 18, weight: 800, fill: "$text" }),
          T("Learns your writing style.\nAlways sounds like you.", 24, 94, 220, 40, { size: 12, fill: "$muted", lh: 1.6 }),
        ]
      }),

      // Top-right card
      R(872, 220, 448, 152, "$card", {
        r: 20, stroke: "$border", sw: 1,
        children: [
          T("◎  Idea Sparks", 24, 24, 300, 24, { size: 18, weight: 800, fill: "$text" }),
          T("Never face the blank page. GLINT generates\nfresh angles on any topic, on demand.", 24, 58, 400, 36, { size: 12, fill: "$muted", lh: 1.6 }),
          Pill(24, 106, 90, 28, "$pinkDim", "Try it →", "$pink", { size: 11, stroke: "$pink", sw: 1 }),
        ]
      }),

      // Middle row
      R(576, 388, 280, 152, "$amberDim", {
        r: 20, stroke: "$amber", sw: 1,
        children: [
          T("◆", 24, 24, 32, 32, { size: 26, fill: "$amber" }),
          T("1-Click Publish", 24, 64, 220, 24, { size: 18, weight: 800, fill: "$text" }),
          T("Substack, Medium, Ghost,\nLinkedIn — all from one place.", 24, 94, 220, 40, { size: 12, fill: "$amber", lh: 1.6, opacity: 0.85 }),
        ]
      }),

      R(872, 388, 212, 152, "$card", {
        r: 20, stroke: "$border", sw: 1,
        children: [
          T("SEO", 24, 24, 80, 36, { size: 28, weight: 900, fill: "$green" }),
          T("Built-in optimizer. Score in real-time.", 24, 68, 164, 36, { size: 12, fill: "$muted", lh: 1.6 }),
        ]
      }),

      R(1100, 388, 220, 152, "$card", {
        r: 20, stroke: "$border", sw: 1,
        children: [
          T("✓", 24, 24, 40, 36, { size: 28, weight: 900, fill: "$pink" }),
          T("Grammar & Clarity", 24, 68, 172, 18, { size: 13, weight: 700, fill: "$text" }),
          T("Powered by the latest\nlanguage models.", 24, 90, 172, 36, { size: 11, fill: "$muted", lh: 1.6 }),
        ]
      }),

      // Bottom row — wide testimonial
      R(120, 556, 500, 128, "$card", {
        r: 20, stroke: "$green", sw: 1,
        children: [
          T("\"GLINT tripled my output. I publish 3× more content without sacrificing quality. It really does sound like me.\"", 24, 20, 452, 56, { size: 14, fill: "$text", lh: 1.6 }),
          Dot(24, 92, 18, "$violet"),
          T("Sarah K. · Creator, 48k followers", 52, 80, 320, 24, { size: 12, fill: "$muted" }),
          Pill(410, 80, 64, 24, "$greenDim", "★★★★★", "$green", { size: 10 }),
        ]
      }),

      R(636, 556, 684, 128, "$card", {
        r: 20, stroke: "$border", sw: 1,
        children: [
          T("STATS", 24, 20, 120, 16, { size: 10, weight: 700, fill: "$muted", ls: 2 }),
          T("2.3M", 24, 42, 120, 48, { size: 40, weight: 900, fill: "$green" }),
          T("posts published", 24, 90, 160, 20, { size: 12, fill: "$muted" }),
          T("12K+", 200, 42, 120, 48, { size: 40, weight: 900, fill: "$violet" }),
          T("active writers", 200, 90, 140, 20, { size: 12, fill: "$muted" }),
          T("3×", 376, 42, 80, 48, { size: 40, weight: 900, fill: "$amber" }),
          T("avg output increase", 360, 90, 180, 20, { size: 12, fill: "$muted" }),
          T("87%", 530, 42, 100, 48, { size: 40, weight: 900, fill: "$pink" }),
          T("avg SEO score", 530, 90, 140, 20, { size: 12, fill: "$muted" }),
        ]
      }),
    ]
  };
}

// ── Screen 8: DESKTOP EDITOR ──────────────────────────────────────────────────
function desktopEditor() {
  return {
    name: "D · Editor",
    width: 1440, height: 900,
    fill: "$bg",
    children: [
      desktopSidebar("edit"),

      // Top bar
      R(220, 0, 1220, 56, "$surface", {
        stroke: "$border", sw: 1,
        children: [
          T("The Future of Remote Work", 24, 14, 400, 28, { size: 16, weight: 700, fill: "$text" }),
          T("Last saved 2s ago", 440, 18, 160, 20, { size: 11, fill: "$muted" }),
          Pill(1000, 10, 80, 36, "$violetDim", "◈ Polish", "$violet", { size: 12, stroke: "$violet", sw: 1 }),
          Pill(1092, 10, 80, 36, "$pinkDim", "◎ Expand", "$pink", { size: 12, stroke: "$pink", sw: 1 }),
          Pill(1184, 10, 100, 36, "$greenDim", "◆ Publish", "$green", { size: 12, stroke: "$green", sw: 1 }),
          R(1300, 10, 100, 36, "$green", {
            r: 6,
            children: [T("Preview", 0, 0, 100, 36, { size: 12, weight: 700, fill: "$bg", align: "center" })]
          }),
        ]
      }),

      // Format bar
      R(220, 56, 1220, 40, "$card", {
        stroke: "$border", sw: 1,
        children: [
          T("B  I  U  ─  H₁  H₂  H₃  •  ≡  \"", 16, 8, 280, 24, { size: 12, fill: "$muted" }),
          Line(308, 6, 1, "$border", 28),
          Pill(320, 6, 80, 28, "$dim", "Normal", "$muted", { size: 11 }),
          Pill(408, 6, 68, 28, "$violetDim", "◈ AI Edit", "$violet", { size: 11 }),
          Pill(484, 6, 76, 28, "$pinkDim", "◎ Longer", "$pink", { size: 11 }),
          Pill(568, 6, 72, 28, "$amberDim", "⊞ Outline", "$amber", { size: 11 }),
          T("Words: 342 · SEO: 87 · Flesch: 68", 760, 9, 300, 22, { size: 11, fill: "$muted" }),
          Pill(1140, 6, 80, 28, "$greenDim", "● Saving", "$green", { size: 10 }),
        ]
      }),

      // Main document column
      R(220, 96, 800, 804, "$bg", {
        children: [
          T("The Future of Remote Work", 60, 60, 680, 52, { size: 38, weight: 900, fill: "$text", lh: 1.15 }),
          T("March 20, 2026  ·  5 min read  ·  SEO: 87%  ·  642 words", 60, 120, 680, 22, { size: 12, fill: "$muted" }),
          Line(60, 150, 680, "$border"),

          T("Remote work has fundamentally changed how we collaborate. In 2026, the lines between home and office have blurred completely, and teams operate across timezones with a fluidity that would have been impossible just five years ago.", 60, 170, 680, 60, { size: 14, fill: "$text", lh: 1.8, opacity: 0.85 }),

          // AI suggestion inline
          R(60, 244, 680, 96, "$violetDim", {
            r: 10, stroke: "$violet", sw: 1,
            children: [
              T("◈ AI SUGGESTION · click to accept", 16, 12, 400, 16, { size: 9, weight: 700, fill: "$violet", ls: 1.5 }),
              T("Add supporting stat: \"78% of knowledge workers prefer hybrid models (Future Work Index 2026)\" — or dismiss to write your own.", 16, 34, 600, 36, { size: 12, fill: "$text", lh: 1.65, opacity: 0.9 }),
              Pill(568, 54, 96, 26, "$violet", "Accept ✓", "$bg", { size: 10 }),
            ]
          }),

          T("The real challenge isn't technology anymore — it's culture. Companies that genuinely thrive are those that have rebuilt their communication rituals from scratch for a distributed world.\n\nWhat does that look like in practice? It means asynchronous-first documentation, deliberate synchronous time for creative work, and a radical transparency that would make most traditional managers uncomfortable.", 60, 356, 680, 120, { size: 14, fill: "$text", lh: 1.8, opacity: 0.85 }),

          // Section heading in doc
          T("The Three Pillars of Remote Culture", 60, 490, 680, 30, { size: 18, weight: 800, fill: "$text" }),
          T("Teams that get remote right have mastered three disciplines: async communication, intentional presence, and outcome-based trust...", 60, 528, 680, 48, { size: 14, fill: "$text", lh: 1.8, opacity: 0.85 }),

          // Cursor
          R(60, 584, 2, 22, "$green", { r: 1 }),
        ]
      }),

      // Right panel — AI assistant
      R(1020, 96, 420, 804, "$surface", {
        stroke: "$border", sw: 1,
        children: [
          T("◈ AI ASSISTANT", 20, 20, 300, 18, { size: 10, weight: 700, fill: "$violet", ls: 2 }),
          Line(20, 46, 380, "$border"),

          // Quick actions
          T("QUICK ACTIONS", 20, 62, 200, 14, { size: 9, fill: "$muted", ls: 1.5 }),
          ...["Make it shorter", "Add an example", "Improve flow", "Add a CTA", "Check SEO"].map((action, i) => {
            const color = ["$violet", "$green", "$pink", "$amber", "$violet"][i];
            return R(20, 82 + i * 46, 380, 36, "$card", {
              r: 8, stroke: "$border", sw: 1,
              children: [
                T(action, 14, 0, 300, 36, { size: 12, fill: "$text" }),
                T("→", 364, 0, 16, 36, { size: 12, fill: color, align: "right" }),
              ]
            });
          }),

          Line(20, 324, 380, "$border"),

          T("CHAT WITH GLINT", 20, 340, 200, 14, { size: 9, fill: "$muted", ls: 1.5 }),

          // Chat messages
          R(20, 362, 380, 64, "$dim", { r: 10,
            children: [T("How should I structure the conclusion for maximum impact?", 14, 14, 352, 36, { size: 12, fill: "$text", lh: 1.6 })]
          }),
          R(20, 438, 380, 80, "$violetDim", { r: 10, stroke: "$violet", sw: 1,
            children: [
              T("◈ GLINT", 14, 10, 100, 16, { size: 9, weight: 700, fill: "$violet", ls: 1 }),
              T("End with a forward-looking call to action — challenge readers to audit one remote ritual this week.", 14, 30, 352, 40, { size: 12, fill: "$text", lh: 1.6 })
            ]
          }),

          // Input
          R(20, 744, 380, 44, "$card", {
            r: 22, stroke: "$border2", sw: 1,
            children: [
              T("Ask anything about your draft...", 18, 0, 290, 44, { size: 12, fill: "$muted" }),
              R(330, 8, 44, 28, "$green", { r: 14,
                children: [T("→", 0, 0, 44, 28, { size: 14, weight: 700, fill: "$bg", align: "center" })]
              }),
            ]
          }),
        ]
      }),
    ]
  };
}

// ── Screen 9: DESKTOP IDEAS ───────────────────────────────────────────────────
function desktopIdeas() {
  const ideasData = [
    { title: "Why AI Won't Replace Writers (But Will Replace Bad Ones)", tag: "Essay", color: "$green" },
    { title: "10 Morning Routines of Top Founders in 2026", tag: "Listicle", color: "$violet" },
    { title: "The Quiet Revolution Happening in B2B SaaS", tag: "Analysis", color: "$pink" },
    { title: "Building Your Brand Voice: A Deep Dive", tag: "Marketing", color: "$amber" },
    { title: "Remote Teams: What Actually Works vs. What Feels Like It Works", tag: "Culture", color: "$green" },
    { title: "The Substack Playbook for First 1,000 Subscribers", tag: "Growth", color: "$violet" },
  ];

  return {
    name: "D · Ideas",
    width: 1440, height: 900,
    fill: "$bg",
    children: [
      desktopSidebar("ideas"),

      // Header
      R(220, 0, 1220, 64, "$surface", {
        stroke: "$border", sw: 1,
        children: [
          T("◎ Idea Sparks", 24, 16, 240, 32, { size: 20, weight: 800, fill: "$text" }),
          T("12 saved", 280, 22, 80, 20, { size: 12, fill: "$muted" }),
          Pill(1200, 14, 116, 36, "$violetDim", "+ Generate Ideas", "$violet", { size: 12, stroke: "$violet", sw: 1 }),
        ]
      }),

      // Generate prompt bar
      R(240, 88, 960, 64, "$card", {
        r: 14, stroke: "$border", sw: 1,
        children: [
          T("✦", 20, 0, 28, 64, { size: 20, fill: "$green" }),
          T("Generate ideas about... e.g. \"remote work in 2026\"", 56, 0, 720, 64, { size: 14, fill: "$muted" }),
          R(820, 14, 120, 36, "$green", {
            r: 8,
            children: [T("✦ Spark", 0, 0, 120, 36, { size: 13, weight: 700, fill: "$bg", align: "center" })]
          }),
        ]
      }),

      T("SAVED IDEAS · 12", 240, 176, 300, 16, { size: 10, weight: 700, fill: "$muted", ls: 2 }),

      // 3-column grid
      ...ideasData.map((idea, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 240 + col * 320;
        const y = 200 + row * 200;
        return R(x, y, 296, 176, "$card", {
          r: 16, stroke: "$border", sw: 1,
          children: [
            R(20, 16, 4, 100, idea.color, { r: 2 }),
            Pill(28, 16, 72, 22, "$surface", idea.tag, idea.color, { size: 9, stroke: "$border2", sw: 1 }),
            T(idea.title, 28, 46, 248, 60, { size: 14, weight: 700, fill: "$text", lh: 1.4 }),
            T("Write it →", 28, 136, 100, 20, { size: 11, fill: idea.color }),
            T("▲ Save", 196, 136, 80, 20, { size: 11, fill: "$muted" }),
          ]
        });
      }),
    ]
  };
}

// ── Screen 10: DESKTOP PRICING ────────────────────────────────────────────────
function desktopPricing() {
  const plans = [
    {
      name: "Spark", price: "$0", period: "/mo", sub: "Free forever", color: "$muted",
      features: ["50 AI generations/month", "5 publish destinations", "Basic voice learning", "Standard editor"],
      cta: "Get Started Free", ctaBg: "$card", ctaText: "$text", border: "$border"
    },
    {
      name: "Flow", price: "$19", period: "/mo", sub: "For serious writers", color: "$green",
      features: ["Unlimited AI generations", "All publish integrations", "Deep voice learning", "SEO optimizer", "Priority support"],
      cta: "Start Flow — $19/mo", ctaBg: "$green", ctaText: "$bg", border: "$green"
    },
    {
      name: "Studio", price: "$49", period: "/mo", sub: "For teams & agencies", color: "$violet",
      features: ["Everything in Flow", "5 team seats", "Brand voice library", "Analytics dashboard", "Custom integrations"],
      cta: "Start Studio", ctaBg: "$violetDim", ctaText: "$violet", border: "$violet"
    },
  ];

  return {
    name: "D · Pricing",
    width: 1440, height: 900,
    fill: "$bg",
    children: [
      // Nav
      R(0, 0, 1440, 64, "$surface", {
        stroke: "$border", sw: 1,
        children: [
          T("✦ GLINT", 40, 18, 100, 28, { size: 18, weight: 900, fill: "$text", ls: 1 }),
          Pill(1200, 14, 100, 36, "$card", "Sign In", "$muted", { size: 13, stroke: "$border", sw: 1 }),
          Pill(1316, 14, 104, 36, "$green", "Start Free", "$bg", { size: 13 }),
        ]
      }),

      T("PRICING", 0, 92, 1440, 20, { size: 10, weight: 700, fill: "$green", ls: 4, align: "center" }),
      T("Start free. Scale with your ambition.", 0, 120, 1440, 56, { size: 44, weight: 900, fill: "$text", align: "center" }),
      T("Every plan includes our core AI writing engine. No hidden fees.", 0, 182, 1440, 28, { size: 16, fill: "$muted", align: "center" }),

      // Plan cards
      ...plans.map((plan, i) => {
        const x = 200 + i * 360;
        const isPopular = i === 1;
        return R(x, 240, 320, 560, "$card", {
          r: 20, stroke: plan.border, sw: isPopular ? 2 : 1,
          children: [
            ...(isPopular ? [Pill(20, 16, 80, 24, "$green", "POPULAR", "$bg", { size: 9 })] : []),
            T(plan.name, 24, isPopular ? 50 : 24, 200, 28, { size: 22, weight: 900, fill: "$text" }),
            T(plan.sub, 24, isPopular ? 84 : 58, 200, 20, { size: 13, fill: "$muted" }),
            T(plan.price, 24, isPopular ? 114 : 88, 120, 52, { size: 44, weight: 900, fill: plan.color }),
            T(plan.period, 110, isPopular ? 134 : 110, 60, 20, { size: 14, fill: "$muted" }),
            Line(24, isPopular ? 178 : 152, 272, "$border"),
            ...plan.features.map((f, fi) =>
              T("✓  " + f, 24, (isPopular ? 196 : 170) + fi * 36, 272, 24, { size: 13, fill: "$text", opacity: 0.8 })
            ),
            R(24, 488, 272, 48, plan.ctaBg, {
              r: 24, stroke: plan.border, sw: 1,
              children: [T(plan.cta, 0, 0, 272, 48, { size: 14, weight: 700, fill: plan.ctaText, align: "center" })]
            }),
          ]
        });
      }),

      // Footer note
      T("All plans include 14-day free trial. Cancel anytime. Billed monthly.", 0, 828, 1440, 24, { size: 13, fill: "$muted", align: "center" }),

      // Guarantee badge
      R(620, 854, 200, 36, "$card", {
        r: 18, stroke: "$green", sw: 1,
        children: [T("✦ 30-day money-back guarantee", 16, 0, 168, 36, { size: 11, fill: "$green" })]
      }),
    ]
  };
}

// ── Assemble document ──────────────────────────────────────────────────────────
function resolveVars(obj) {
  const json = JSON.stringify(obj);
  let resolved = json;
  for (const [key, val] of Object.entries(vars)) {
    const color = val.value;
    resolved = resolved.replace(new RegExp(`"\\$${key}"`, 'g'), `"${color}"`);
  }
  return JSON.parse(resolved);
}

const doc = resolveVars({
  version: "2.8",
  name: "GLINT — AI Writing Assistant",
  variables: vars,
  children: [
    mobileHero(),
    mobileEditor(),
    mobileIdeas(),
    mobilePublish(),
    mobilePricing(),
    desktopHero(),
    desktopFeatures(),
    desktopEditor(),
    desktopIdeas(),
    desktopPricing(),
  ]
});

fs.writeFileSync('glint.pen', JSON.stringify(doc, null, 2));
console.log('✓ glint.pen written —', doc.children.length, 'screens');
doc.children.forEach((s, i) => console.log(`  [${i + 1}] ${s.name}  ${s.width}×${s.height}`));
