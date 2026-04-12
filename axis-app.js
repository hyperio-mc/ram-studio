// axis-app.js
// "AXIS" — AI Agent Operations Dashboard
// Inspired by:
//   - Linear's dark-mode "for teams AND agents" UI (darkmodedesign.com, Mar 18 2026)
//   - Good Fella's subscription model + numbered process craft (Awwwards SOTD Mar 18 2026, good-fella.com)
//   - Stripe Sessions event-card layout (godly.website)
// Palette: #08090C near-black + #6C5CE7 electric violet + #BAFF39 acid lime + #F0F0F2 warm white
// pencil.dev v2.8

const fs = require('fs');

const vars = {
  bg:        { type: "color", value: "#08090C" },
  surface:   { type: "color", value: "#0D0F14" },
  card:      { type: "color", value: "#12141A" },
  border:    { type: "color", value: "#1C1E26" },
  border2:   { type: "color", value: "#2A2D3A" },
  violet:    { type: "color", value: "#6C5CE7" },
  violetDim: { type: "color", value: "#15123A" },
  violetMid: { type: "color", value: "#2A2560" },
  lime:      { type: "color", value: "#BAFF39" },
  limeDim:   { type: "color", value: "#1C2A08" },
  amber:     { type: "color", value: "#FF9F43" },
  amberDim:  { type: "color", value: "#2A1C08" },
  red:       { type: "color", value: "#FF5C78" },
  redDim:    { type: "color", value: "#2A0E16" },
  text:      { type: "color", value: "#F0F0F2" },
  muted:     { type: "color", value: "#5A5D6E" },
  dim:       { type: "color", value: "#1E2130" },
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
  fontFamily: opts.mono ? "'Fira Code', 'JetBrains Mono', monospace" : undefined,
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
    T("●  ▲  ■", 300, 16, 70, 18, { size: 10, weight: 500, fill: "$muted", align: "right" }),
  ]
});

// ── Mobile Nav ────────────────────────────────────────────────────────────────
const mobileNav = (active) => {
  const items = [
    { icon: "⊞", label: "Hub", key: "hub" },
    { icon: "◎", label: "Agents", key: "agents" },
    { icon: "▦", label: "Queue", key: "queue" },
    { icon: "∿", label: "Review", key: "review" },
    { icon: "◈", label: "Config", key: "config" },
  ];
  return R(0, 762, 390, 72, "$surface", {
    stroke: "$border", sw: 1,
    children: items.map((item, i) => {
      const isActive = item.key === active;
      const x = i * 78;
      return R(x, 0, 78, 72, "transparent", {
        children: [
          T(item.icon, 0, 12, 78, 24, { size: 20, fill: isActive ? "$violet" : "$muted", align: "center" }),
          T(item.label, 0, 38, 78, 18, { size: 10, weight: isActive ? 700 : 400, fill: isActive ? "$text" : "$muted", align: "center" }),
        ]
      });
    })
  });
};

// ── Agent Avatar ──────────────────────────────────────────────────────────────
const agentAvatar = (x, y, name, status, color) => {
  const statusColor = status === 'active' ? "$lime" : status === 'queued' ? "$amber" : "$muted";
  return R(x, y, 44, 44, color || "$violetDim", {
    r: 12, stroke: color || "$violetMid", sw: 1,
    children: [
      T(name.substring(0, 2).toUpperCase(), 0, 0, 44, 44, { size: 14, weight: 800, fill: "$violet", align: "center" }),
      Dot(36, 36, 6, statusColor, "$bg"),
    ]
  });
};

// ── Progress Bar ──────────────────────────────────────────────────────────────
const progressBar = (x, y, w, pct, color) => R(x, y, w, 4, "$dim", {
  r: 2,
  children: [R(0, 0, Math.round(w * pct), 4, color || "$violet", { r: 2 })]
});

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Mobile: Dashboard (Hub)
// ════════════════════════════════════════════════════════════════════════════
const mobile_dashboard = {
  type: "frame", name: "01 · Dashboard (Mobile)",
  x: 0, y: 0, width: 390, height: 844,
  fill: "$bg",
  children: [
    statusBar(),

    // Header
    R(20, 58, 350, 50, "transparent", {
      children: [
        R(0, 5, 36, 36, "$violetDim", {
          r: 9, stroke: "$violetMid", sw: 1,
          children: [T("⊕", 0, 0, 36, 36, { size: 18, fill: "$violet", align: "center" })]
        }),
        T("AXIS", 46, 6, 100, 24, { size: 18, weight: 900, fill: "$text", ls: 2 }),
        T("Hub", 46, 28, 100, 14, { size: 10, fill: "$muted", ls: 0.5 }),
        // Status badge
        Pill(290, 8, 60, 22, "$limeDim", "● LIVE", "$lime", { size: 9, sw: 1, stroke: "$lime" }),
      ]
    }),

    // Summary row
    R(20, 118, 350, 80, "$card", {
      r: 16, stroke: "$border", sw: 1,
      children: [
        // 3 quick stats
        R(0, 0, 116, 80, "transparent", {
          children: [
            T("6", 0, 14, 116, 32, { size: 28, weight: 900, fill: "$violet", align: "center" }),
            T("Active", 0, 50, 116, 18, { size: 10, fill: "$muted", align: "center" }),
          ]
        }),
        Line(116, 16, 1, "$border", 48),
        R(118, 0, 116, 80, "transparent", {
          children: [
            T("23", 0, 14, 116, 32, { size: 28, weight: 900, fill: "$lime", align: "center" }),
            T("Merged Today", 0, 50, 116, 18, { size: 10, fill: "$muted", align: "center" }),
          ]
        }),
        Line(234, 16, 1, "$border", 48),
        R(236, 0, 114, 80, "transparent", {
          children: [
            T("4", 0, 14, 114, 32, { size: 28, weight: 900, fill: "$amber", align: "center" }),
            T("Waiting Review", 0, 50, 114, 18, { size: 10, fill: "$muted", align: "center" }),
          ]
        }),
      ]
    }),

    // Section title
    T("ACTIVE AGENTS", 20, 214, 200, 16, { size: 10, weight: 700, fill: "$muted", ls: 1.5 }),

    // Agent cards
    ...[
      { name: "Codex",  task: "Fixing cache invalidation bug in auth flow", status: "active",  pct: 0.72, color: "$violetDim", stroke: "$violetMid", accent: "$violet",  time: "2m", repo: "api-server" },
      { name: "Claude", task: "Refactoring legacy payment module to Stripe v3", status: "active",  pct: 0.41, color: "$limeDim",  stroke: "$lime",    accent: "$lime",    time: "8m", repo: "billing" },
      { name: "Cursor", task: "Writing unit tests for UserService class",  status: "queued",  pct: 0.15, color: "$amberDim", stroke: "$amber",   accent: "$amber",   time: "—",  repo: "core" },
    ].map((agent, i) => R(20, 238 + i * 100, 350, 88, "$card", {
      r: 14, stroke: "$border", sw: 1,
      children: [
        agentAvatar(16, 20, agent.name, agent.status, agent.color),
        T(agent.name, 70, 20, 160, 18, { size: 14, weight: 700, fill: "$text" }),
        Pill(240, 20, agent.status === 'active' ? 52 : 56, 18, agent.status === 'active' ? "$limeDim" : "$amberDim", agent.status === 'active' ? "ACTIVE" : "QUEUED", agent.accent, { size: 8, stroke: agent.accent, sw: 1 }),
        T(agent.task, 70, 40, 264, 26, { size: 11, fill: "$muted", lh: 1.4 }),
        T(agent.repo, 16, 66, 80, 14, { size: 10, fill: "$muted", mono: true }),
        progressBar(108, 70, 178, agent.pct, agent.accent),
        T(Math.round(agent.pct * 100) + "%", 294, 62, 40, 18, { size: 11, fill: agent.accent, align: "right" }),
      ]
    })),

    // Activity feed title
    T("RECENT ACTIVITY", 20, 546, 200, 16, { size: 10, weight: 700, fill: "$muted", ls: 1.5 }),

    // Feed items
    ...[
      { icon: "✓", color: "$lime",   label: "Codex merged PR #482 · api-server",     time: "1m ago" },
      { icon: "⊕", color: "$violet", label: "Claude opened PR #483 · billing",         time: "3m ago" },
      { icon: "▲", color: "$amber",  label: "Cursor queued task #203 · core",           time: "5m ago" },
      { icon: "✓", color: "$lime",   label: "Codex merged PR #481 · api-server",     time: "11m ago" },
    ].map((item, i) => R(20, 570 + i * 46, 350, 38, "transparent", {
      children: [
        Dot(10, 18, 5, item.color, undefined),
        T(item.label, 24, 8, 248, 22, { size: 12, fill: "$text" }),
        T(item.time, 300, 8, 48, 22, { size: 10, fill: "$muted", align: "right" }),
      ]
    })),

    mobileNav("hub"),
  ]
};

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Mobile: Agent Detail
// ════════════════════════════════════════════════════════════════════════════
const mobile_agent_detail = {
  type: "frame", name: "02 · Agent Detail (Mobile)",
  x: 420, y: 0, width: 390, height: 844,
  fill: "$bg",
  children: [
    statusBar(),

    // Back + title
    T("← Hub", 20, 60, 60, 20, { size: 13, fill: "$violet" }),
    T("Agent Profile", 90, 60, 200, 20, { size: 13, fill: "$muted" }),

    // Agent hero card
    R(20, 92, 350, 120, "$card", {
      r: 16, stroke: "$violetMid", sw: 2,
      children: [
        R(18, 24, 52, 52, "$violetDim", {
          r: 14, stroke: "$violet", sw: 2,
          children: [T("CO", 0, 0, 52, 52, { size: 18, weight: 900, fill: "$violet", align: "center" })]
        }),
        T("Codex", 84, 20, 150, 26, { size: 22, weight: 900, fill: "$text" }),
        Pill(84, 48, 52, 20, "$limeDim", "ACTIVE", "$lime", { size: 8, stroke: "$lime", sw: 1 }),
        T("OpenAI Codex · v2.1", 84, 72, 200, 16, { size: 11, fill: "$muted" }),
        // Uptime
        T("Uptime 99.2%", 200, 48, 130, 18, { size: 11, fill: "$lime", align: "right" }),
        T("6h 42m session", 200, 66, 130, 18, { size: 11, fill: "$muted", align: "right" }),
      ]
    }),

    // Current task
    T("CURRENT TASK", 20, 226, 200, 14, { size: 9, weight: 700, fill: "$muted", ls: 1.5 }),
    R(20, 244, 350, 100, "$violetDim", {
      r: 14, stroke: "$violet", sw: 1,
      children: [
        T("Fixing cache invalidation bug in auth flow", 16, 14, 318, 36, { size: 14, weight: 600, fill: "$text", lh: 1.45 }),
        T("api-server / src/auth/cache.ts", 16, 54, 240, 16, { size: 10, fill: "$muted", mono: true }),
        progressBar(16, 76, 318, 0.72, "$violet"),
        T("72%", 292, 68, 42, 16, { size: 11, fill: "$violet", align: "right" }),
      ]
    }),

    // Stats row
    T("TODAY'S STATS", 20, 360, 200, 14, { size: 9, weight: 700, fill: "$muted", ls: 1.5 }),
    R(20, 378, 350, 80, "$card", {
      r: 14, stroke: "$border", sw: 1,
      children: [
        R(0, 0, 87, 80, "transparent", {
          children: [
            T("12", 0, 14, 87, 28, { size: 24, weight: 900, fill: "$lime", align: "center" }),
            T("PRs Merged", 0, 46, 87, 16, { size: 9, fill: "$muted", align: "center" }),
          ]
        }),
        Line(87, 14, 1, "$border", 52),
        R(89, 0, 87, 80, "transparent", {
          children: [
            T("847", 0, 14, 87, 28, { size: 24, weight: 900, fill: "$violet", align: "center" }),
            T("Lines Changed", 0, 46, 87, 16, { size: 9, fill: "$muted", align: "center" }),
          ]
        }),
        Line(176, 14, 1, "$border", 52),
        R(178, 0, 87, 80, "transparent", {
          children: [
            T("96%", 0, 14, 87, 28, { size: 24, weight: 900, fill: "$amber", align: "center" }),
            T("Test Pass Rate", 0, 46, 87, 16, { size: 9, fill: "$muted", align: "center" }),
          ]
        }),
        Line(265, 14, 1, "$border", 52),
        R(267, 0, 83, 80, "transparent", {
          children: [
            T("2.4h", 0, 14, 83, 28, { size: 24, weight: 900, fill: "$text", align: "center" }),
            T("Avg Task Time", 0, 46, 83, 16, { size: 9, fill: "$muted", align: "center" }),
          ]
        }),
      ]
    }),

    // Recent tasks
    T("RECENT TASKS", 20, 474, 200, 14, { size: 9, weight: 700, fill: "$muted", ls: 1.5 }),
    ...[
      { title: "Add rate limiting to /api/users endpoint", status: "merged",  time: "32m" },
      { title: "Fix broken redirect after OAuth login",     status: "merged",  time: "1h" },
      { title: "Refactor UserModel to use Prisma ORM",      status: "review",  time: "2h" },
      { title: "Add OpenTelemetry tracing to Express",      status: "merged",  time: "3h" },
    ].map((task, i) => R(20, 494 + i * 54, 350, 44, "$card", {
      r: 10, stroke: "$border", sw: 1,
      children: [
        Dot(20, 22, 4, task.status === 'merged' ? "$lime" : "$amber", undefined),
        T(task.title, 34, 6, 258, 32, { size: 12, fill: "$text", lh: 1.45 }),
        T(task.time + " ago", 300, 12, 44, 20, { size: 10, fill: "$muted", align: "right" }),
        Pill(300, 26, task.status === 'merged' ? 44 : 48, 14, task.status === 'merged' ? "$limeDim" : "$amberDim", task.status === 'merged' ? "MERGED" : "REVIEW", task.status === 'merged' ? "$lime" : "$amber", { size: 7 }),
      ]
    })),

    mobileNav("agents"),
  ]
};

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Mobile: Task Queue (Kanban)
// ════════════════════════════════════════════════════════════════════════════
const mobile_queue = {
  type: "frame", name: "03 · Task Queue (Mobile)",
  x: 840, y: 0, width: 390, height: 844,
  fill: "$bg",
  children: [
    statusBar(),

    // Header
    R(20, 58, 350, 44, "transparent", {
      children: [
        T("Task Queue", 0, 4, 180, 28, { size: 20, weight: 800, fill: "$text" }),
        T("47 tasks · 3 repos", 0, 30, 200, 14, { size: 11, fill: "$muted" }),
        Pill(290, 8, 60, 24, "$limeDim", "+ New Task", "$lime", { size: 9, stroke: "$lime", sw: 1 }),
      ]
    }),

    // Column tabs
    R(20, 112, 350, 36, "$surface", {
      r: 10, stroke: "$border", sw: 1,
      children: [
        R(2, 2, 112, 32, "$violetDim", { r: 8, children: [T("In Progress", 0, 0, 112, 32, { size: 11, weight: 700, fill: "$violet", align: "center" })] }),
        R(116, 0, 116, 36, "transparent", { children: [T("Review  4", 0, 0, 116, 36, { size: 11, fill: "$muted", align: "center" })] }),
        R(234, 0, 116, 36, "transparent", { children: [T("Done  23", 0, 0, 116, 36, { size: 11, fill: "$muted", align: "center" })] }),
      ]
    }),

    // Queue items — In Progress
    ...[
      {
        id: "AX-204", title: "Cache invalidation in auth flow",
        agent: "Codex", pct: 0.72, priority: "HIGH", repo: "api-server", accent: "$violet"
      },
      {
        id: "AX-203", title: "Refactor legacy payment module to Stripe v3",
        agent: "Claude", pct: 0.41, priority: "HIGH", repo: "billing", accent: "$lime"
      },
      {
        id: "AX-201", title: "Write unit tests for UserService",
        agent: "Cursor", pct: 0.15, priority: "MED", repo: "core", accent: "$amber"
      },
      {
        id: "AX-199", title: "Add pagination to /api/products list",
        agent: "Codex", pct: 0.88, priority: "LOW", repo: "storefront", accent: "$violet"
      },
    ].map((task, i) => R(20, 162 + i * 116, 350, 106, "$card", {
      r: 14, stroke: "$border", sw: 1,
      children: [
        // Priority + ID
        Pill(14, 14, task.priority === 'HIGH' ? 40 : task.priority === 'MED' ? 36 : 32, 18, task.priority === 'HIGH' ? "$redDim" : task.priority === 'MED' ? "$amberDim" : "$dim", task.priority, task.priority === 'HIGH' ? "$red" : task.priority === 'MED' ? "$amber" : "$muted", { size: 8 }),
        T(task.id, 330, 14, 60, 18, { size: 9, fill: "$muted", align: "right", mono: true }),
        // Title
        T(task.title, 14, 38, 322, 30, { size: 13, weight: 600, fill: "$text", lh: 1.4 }),
        // Agent + repo
        Pill(14, 74, 52, 18, task.accent === "$violet" ? "$violetDim" : task.accent === "$lime" ? "$limeDim" : "$amberDim", task.agent, task.accent, { size: 8 }),
        T(task.repo, 74, 74, 120, 18, { size: 10, fill: "$muted", mono: true }),
        // Progress
        progressBar(14, 90, 250, task.pct, task.accent),
        T(Math.round(task.pct * 100) + "%", 272, 82, 64, 18, { size: 11, fill: task.accent, align: "right" }),
      ]
    })),

    mobileNav("queue"),
  ]
};

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Mobile: Code Review
// ════════════════════════════════════════════════════════════════════════════
const mobile_review = {
  type: "frame", name: "04 · Code Review (Mobile)",
  x: 1260, y: 0, width: 390, height: 844,
  fill: "$bg",
  children: [
    statusBar(),

    // Header
    T("← Queue", 20, 60, 70, 20, { size: 13, fill: "$violet" }),

    R(20, 86, 350, 72, "$card", {
      r: 14, stroke: "$violetMid", sw: 2,
      children: [
        T("PR #483 · billing", 14, 10, 220, 18, { size: 13, weight: 700, fill: "$text" }),
        Pill(270, 10, 66, 18, "$amberDim", "REVIEW", "$amber", { size: 8, stroke: "$amber", sw: 1 }),
        T("Refactor legacy payment module to Stripe v3", 14, 30, 322, 28, { size: 12, fill: "$muted", lh: 1.45 }),
        T("claude · 2 files · +124 / -89", 14, 62, 230, 14, { size: 10, fill: "$muted", mono: true }),
      ]
    }),

    // AI Summary
    R(20, 168, 350, 76, "$violetDim", {
      r: 12, stroke: "$violet", sw: 1,
      children: [
        Pill(14, 12, 72, 18, "$violetMid", "AI REVIEW", "$violet", { size: 8 }),
        T("Clean refactor. Uses Stripe v3 PaymentIntent API correctly. Test coverage at 94%. One potential issue: missing idempotency key on retry logic.", 14, 36, 322, 38, { size: 11, fill: "$text", lh: 1.5 }),
      ]
    }),

    // Diff view
    T("CHANGED FILES", 20, 256, 200, 14, { size: 9, weight: 700, fill: "$muted", ls: 1.5 }),

    // File 1
    R(20, 274, 350, 28, "$surface", {
      r: 8, stroke: "$border", sw: 1,
      children: [
        T("▾  billing/stripe.service.ts", 12, 6, 240, 16, { size: 11, fill: "$text", mono: true }),
        T("+98 / -72", 286, 6, 64, 16, { size: 10, fill: "$lime", align: "right", mono: true }),
      ]
    }),

    // Diff code block
    R(20, 304, 350, 180, "$surface", {
      r: 10, stroke: "$border", sw: 1,
      children: [
        // Line numbers col
        R(0, 0, 36, 180, "$dim", { r: 10, children: [] }),
        ...[
          { n: "84", code: "  charge = await stripe.charges.create({", type: "del" },
          { n: "85", code: '    amount: total,', type: "del" },
          { n: "86", code: '    currency: "usd",', type: "del" },
          { n: "",   code: "",  type: "gap" },
          { n: "84", code: '  intent = await stripe.paymentIntents', type: "add" },
          { n: "85", code: '    .create({', type: "add" },
          { n: "86", code: '      amount: total,', type: "add" },
          { n: "87", code: '      currency: "usd",', type: "add" },
          { n: "88", code: '      automatic_payment_methods:', type: "add" },
        ].map((line, i) => R(0, i * 20, 350, 20,
          line.type === "del" ? "#1A0A0C" : line.type === "add" ? "#0A1A0C" : "transparent", {
          children: [
            T(line.n, 4, 2, 28, 16, { size: 9, fill: "$muted", mono: true, align: "right" }),
            line.type === "del" ? T("-", 38, 2, 12, 16, { size: 10, fill: "$red", mono: true }) : undefined,
            line.type === "add" ? T("+", 38, 2, 12, 16, { size: 10, fill: "$lime", mono: true }) : undefined,
            T(line.code, 52, 2, 290, 16, {
              size: 9, mono: true,
              fill: line.type === "del" ? "$red" : line.type === "add" ? "$lime" : "$muted"
            }),
          ].filter(Boolean)
        })),
      ]
    }),

    // Action buttons
    R(20, 496, 168, 48, "$lime", {
      r: 12,
      children: [T("✓  Approve & Merge", 0, 0, 168, 48, { size: 13, weight: 700, fill: "$bg", align: "center" })]
    }),
    R(198, 496, 172, 48, "$surface", {
      r: 12, stroke: "$border", sw: 1,
      children: [T("✎  Request Changes", 0, 0, 172, 48, { size: 12, weight: 600, fill: "$text", align: "center" })]
    }),

    // Comment thread
    T("COMMENTS (2)", 20, 560, 200, 14, { size: 9, weight: 700, fill: "$muted", ls: 1.5 }),
    ...[
      { author: "You", msg: "Is the idempotency key handled for retries?", time: "2m ago", accent: "$violet" },
      { author: "Claude", msg: "Good catch — adding idempotency_key in the next commit. I'll use a hash of the order ID.", time: "1m ago", accent: "$lime" },
    ].map((c, i) => R(20, 580 + i * 84, 350, 74, "$card", {
      r: 12, stroke: "$border", sw: 1,
      children: [
        Pill(14, 12, c.author === 'Claude' ? 52 : 36, 18, c.accent === "$violet" ? "$violetDim" : "$limeDim", c.author, c.accent, { size: 9 }),
        T(c.time, 300, 14, 46, 14, { size: 9, fill: "$muted", align: "right" }),
        T(c.msg, 14, 36, 322, 30, { size: 12, fill: "$text", lh: 1.5 }),
      ]
    })),

    mobileNav("review"),
  ]
};

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Mobile: Settings / Integrations
// ════════════════════════════════════════════════════════════════════════════
const mobile_settings = {
  type: "frame", name: "05 · Integrations (Mobile)",
  x: 1680, y: 0, width: 390, height: 844,
  fill: "$bg",
  children: [
    statusBar(),

    T("Settings", 20, 62, 200, 28, { size: 22, weight: 800, fill: "$text" }),

    // Profile
    T("WORKSPACE", 20, 104, 200, 14, { size: 9, weight: 700, fill: "$muted", ls: 1.5 }),
    R(20, 122, 350, 68, "$card", {
      r: 14, stroke: "$border", sw: 1,
      children: [
        R(14, 14, 40, 40, "$violetDim", {
          r: 10, stroke: "$violetMid", sw: 1,
          children: [T("RK", 0, 0, 40, 40, { size: 14, weight: 800, fill: "$violet", align: "center" })]
        }),
        T("Rakis's Workspace", 64, 12, 220, 20, { size: 15, weight: 700, fill: "$text" }),
        T("Pro Plan · 6 agents · 8 repos", 64, 34, 220, 18, { size: 11, fill: "$muted" }),
        T("›", 330, 22, 16, 24, { size: 18, fill: "$muted" }),
      ]
    }),

    // Connected agents
    T("CONNECTED AGENTS", 20, 206, 200, 14, { size: 9, weight: 700, fill: "$muted", ls: 1.5 }),

    ...[
      { name: "Codex",      sub: "OpenAI · v2.1 · 12 tasks/day",   active: true,  accent: "$violet" },
      { name: "Claude",     sub: "Anthropic · claude-3-7 · 8/day",  active: true,  accent: "$lime" },
      { name: "Cursor",     sub: "Anysphere · Cursor v0.48 · 6/day", active: true,  accent: "$amber" },
      { name: "Copilot",    sub: "GitHub · Not connected",           active: false, accent: "$muted" },
    ].map((agent, i) => R(20, 224 + i * 62, 350, 52, "$card", {
      r: 12, stroke: "$border", sw: 1,
      children: [
        R(14, 8, 36, 36, agent.active ? (agent.accent === "$violet" ? "$violetDim" : agent.accent === "$lime" ? "$limeDim" : "$amberDim") : "$dim", {
          r: 9,
          children: [T(agent.name.substring(0, 2).toUpperCase(), 0, 0, 36, 36, { size: 12, weight: 800, fill: agent.active ? agent.accent : "$muted", align: "center" })]
        }),
        T(agent.name, 60, 8, 200, 20, { size: 14, weight: 700, fill: agent.active ? "$text" : "$muted" }),
        T(agent.sub, 60, 28, 220, 16, { size: 10, fill: "$muted" }),
        // Toggle
        R(310, 14, 30, 20, agent.active ? "$violet" : "$dim", {
          r: 10, children: [
            Dot(agent.active ? 22 : 8, 10, 7, "$text", undefined),
          ]
        }),
      ]
    })),

    // Plan section
    T("BILLING", 20, 482, 200, 14, { size: 9, weight: 700, fill: "$muted", ls: 1.5 }),
    R(20, 500, 350, 100, "$violetDim", {
      r: 16, stroke: "$violetMid", sw: 1,
      children: [
        T("PRO", 20, 18, 60, 22, { size: 10, weight: 900, fill: "$violet", ls: 2 }),
        Pill(70, 18, 60, 20, "$violet", "ACTIVE", "$bg", { size: 8 }),
        T("$49 / month", 20, 44, 200, 26, { size: 22, weight: 800, fill: "$text" }),
        T("6 agents · 50 repos · Unlimited reviews", 20, 72, 280, 16, { size: 10, fill: "$muted" }),
        T("Manage ›", 300, 44, 50, 20, { size: 12, fill: "$violet", align: "right" }),
      ]
    }),

    // Notif + security rows
    ...[
      { label: "Email Digest",       sub: "Daily summary of agent activity",   on: true },
      { label: "PR Notifications",   sub: "Ping when review needed",           on: true },
      { label: "Security Scan",      sub: "Audit agent actions for anomalies", on: false },
    ].map((row, i) => R(20, 616 + i * 56, 350, 46, "transparent", {
      children: [
        T(row.label, 0, 4, 220, 20, { size: 14, fill: "$text", weight: 600 }),
        T(row.sub, 0, 26, 260, 16, { size: 10, fill: "$muted" }),
        R(310, 12, 30, 20, row.on ? "$violet" : "$dim", {
          r: 10, children: [Dot(row.on ? 22 : 8, 10, 7, "$text", undefined)]
        }),
      ]
    })),

    mobileNav("config"),
  ]
};

// ════════════════════════════════════════════════════════════════════════════
// DESKTOP SCREENS
// ════════════════════════════════════════════════════════════════════════════

const DW = 1440;
const DH = 900;

// ── Sidebar ───────────────────────────────────────────────────────────────────
const sidebar = (active) => {
  const items = [
    { icon: "⊞", label: "Hub",     key: "hub" },
    { icon: "◎", label: "Agents",  key: "agents" },
    { icon: "▦", label: "Queue",   key: "queue" },
    { icon: "∿", label: "Review",  key: "review" },
    { icon: "◈", label: "Config",  key: "config" },
  ];
  return R(0, 0, 220, DH, "$surface", {
    stroke: "$border", sw: 1,
    children: [
      // Logo
      R(24, 20, 172, 44, "transparent", {
        children: [
          R(0, 4, 36, 36, "$violetDim", {
            r: 9, stroke: "$violetMid", sw: 1,
            children: [T("⊕", 0, 0, 36, 36, { size: 18, fill: "$violet", align: "center" })]
          }),
          T("AXIS", 46, 4, 80, 24, { size: 16, weight: 900, fill: "$text", ls: 2.5 }),
          T("v1.4.2", 46, 26, 80, 14, { size: 9, fill: "$muted", ls: 0.5 }),
        ]
      }),
      Line(0, 72, 220, "$border"),

      // Nav items
      ...items.map((item, i) => {
        const isActive = item.key === active;
        return R(12, 88 + i * 48, 196, 40, isActive ? "$violetDim" : "transparent", {
          r: 10,
          children: [
            T(item.icon, 14, 0, 28, 40, { size: 18, fill: isActive ? "$violet" : "$muted", align: "center" }),
            T(item.label, 48, 0, 130, 40, { size: 13, weight: isActive ? 700 : 400, fill: isActive ? "$text" : "$muted" }),
            isActive ? R(188, 8, 4, 24, "$violet", { r: 2, children: [] }) : { type: "frame", x: 0, y: 0, width: 1, height: 1, fill: "transparent", children: [] },
          ]
        });
      }),

      Line(0, 330, 220, "$border"),

      // Status
      T("SYSTEM STATUS", 24, 346, 172, 14, { size: 9, weight: 700, fill: "$muted", ls: 1 }),
      ...[
        { label: "API Gateway",  status: "ok" },
        { label: "Agent Pool",   status: "ok" },
        { label: "Code Runner",  status: "warn" },
        { label: "Queue Worker", status: "ok" },
      ].map((s, i) => R(24, 368 + i * 28, 172, 22, "transparent", {
        children: [
          Dot(7, 11, 4, s.status === 'ok' ? "$lime" : "$amber", undefined),
          T(s.label, 20, 3, 120, 16, { size: 11, fill: "$muted" }),
          T(s.status === 'ok' ? "OK" : "WARN", 144, 3, 40, 16, { size: 9, fill: s.status === 'ok' ? "$lime" : "$amber", align: "right" }),
        ]
      })),

      Line(0, 490, 220, "$border"),

      // User section at bottom
      R(12, DH - 68, 196, 52, "$card", {
        r: 10, stroke: "$border", sw: 1,
        children: [
          R(10, 10, 32, 32, "$violetDim", {
            r: 8, children: [T("RK", 0, 0, 32, 32, { size: 11, weight: 800, fill: "$violet", align: "center" })]
          }),
          T("Rakis", 52, 6, 110, 18, { size: 13, weight: 700, fill: "$text" }),
          T("Pro Plan", 52, 24, 110, 14, { size: 10, fill: "$muted" }),
          T("⋯", 172, 14, 20, 20, { size: 16, fill: "$muted" }),
        ]
      }),
    ]
  });
};

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 6 — Desktop: Dashboard
// ════════════════════════════════════════════════════════════════════════════
const desktop_dashboard = {
  type: "frame", name: "06 · Dashboard (Desktop)",
  x: 0, y: 920, width: DW, height: DH,
  fill: "$bg",
  children: [
    sidebar("hub"),

    // Main content
    R(220, 0, DW - 220, DH, "transparent", {
      children: [
        // Top bar
        R(0, 0, DW - 220, 64, "$surface", {
          stroke: "$border", sw: 1,
          children: [
            T("Hub Overview", 32, 20, 200, 24, { size: 18, weight: 800, fill: "$text" }),
            T("March 18, 2026 · Real-time", 32, 44, 240, 16, { size: 11, fill: "$muted" }),
            R(DW - 220 - 320, 16, 300, 32, "$card", {
              r: 8, stroke: "$border", sw: 1,
              children: [
                T("⌕", 12, 6, 20, 20, { size: 16, fill: "$muted" }),
                T("Search tasks, agents, repos…", 36, 6, 240, 20, { size: 12, fill: "$muted" }),
                T("⌘K", DW - 220 - 320 + 270 - (DW - 220 - 320), 6, 44, 20, { size: 10, fill: "$muted", align: "right" }),
              ]
            }),
          ]
        }),

        // Stat cards row
        ...[
          { label: "Active Agents",   value: "6",  sub: "3 repos · 6h avg session", accent: "$violet", icon: "◎" },
          { label: "PRs Merged Today", value: "23", sub: "+8 from yesterday",         accent: "$lime",   icon: "✓" },
          { label: "Awaiting Review",  value: "4",  sub: "2 flagged high priority",   accent: "$amber",  icon: "∿" },
          { label: "Lines Changed",    value: "4.2k", sub: "Today's total delta",     accent: "$text",   icon: "∼" },
        ].map((stat, i) => R(32 + i * 280, 80, 260, 100, "$card", {
          r: 16, stroke: "$border", sw: 1,
          children: [
            T(stat.icon, 20, 18, 28, 28, { size: 22, fill: stat.accent }),
            T(stat.value, 58, 12, 180, 40, { size: 34, weight: 900, fill: stat.accent }),
            T(stat.label, 20, 60, 200, 18, { size: 12, weight: 600, fill: "$text" }),
            T(stat.sub, 20, 78, 220, 14, { size: 10, fill: "$muted" }),
          ]
        })),

        // Agent cards grid
        T("ACTIVE AGENTS", 32, 196, 300, 16, { size: 10, weight: 700, fill: "$muted", ls: 1.5 }),

        ...[
          { name: "Codex",  repo: "api-server", task: "Fixing cache invalidation bug in auth flow", pct: 0.72, status: "active", accent: "$violet" },
          { name: "Claude", repo: "billing",    task: "Refactoring legacy payment module",           pct: 0.41, status: "active", accent: "$lime" },
          { name: "Cursor", repo: "core",       task: "Writing unit tests for UserService",          pct: 0.15, status: "queued", accent: "$amber" },
          { name: "GPT-4",  repo: "infra",      task: "Generating Terraform for AWS Lambda set",    pct: 0.60, status: "active", accent: "$violet" },
          { name: "Gemini", repo: "docs",       task: "Auto-generating API documentation",           pct: 0.90, status: "active", accent: "$lime" },
          { name: "Mistral",repo: "analytics",  task: "Optimizing BigQuery aggregation pipeline",    pct: 0.28, status: "paused", accent: "$muted" },
        ].map((agent, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          return R(32 + col * 380, 220 + row * 130, 360, 116, "$card", {
            r: 14, stroke: "$border", sw: 1,
            children: [
              // Avatar
              R(16, 16, 44, 44, agent.accent === "$violet" ? "$violetDim" : agent.accent === "$lime" ? "$limeDim" : agent.accent === "$amber" ? "$amberDim" : "$dim", {
                r: 12, stroke: agent.accent === "$muted" ? "$border" : agent.accent, sw: agent.accent === "$muted" ? 1 : 2,
                children: [T(agent.name.substring(0, 2).toUpperCase(), 0, 0, 44, 44, { size: 14, weight: 800, fill: agent.accent === "$muted" ? "$muted" : agent.accent, align: "center" })]
              }),
              Dot(52, 54, 5, agent.status === 'active' ? "$lime" : agent.status === 'queued' ? "$amber" : "$muted", "$bg"),
              T(agent.name, 72, 16, 180, 22, { size: 16, weight: 700, fill: "$text" }),
              T(agent.repo, 72, 38, 180, 16, { size: 10, fill: "$muted", mono: true }),
              Pill(270, 16, agent.status === 'active' ? 56 : agent.status === 'queued' ? 56 : 56, 20, agent.status === 'active' ? "$limeDim" : agent.status === 'queued' ? "$amberDim" : "$dim", agent.status.toUpperCase(), agent.status === 'active' ? "$lime" : agent.status === 'queued' ? "$amber" : "$muted", { size: 8, stroke: agent.status === 'active' ? "$lime" : agent.status === 'queued' ? "$amber" : "$border" }),
              T(agent.task, 16, 68, 330, 28, { size: 12, fill: "$muted", lh: 1.4 }),
              progressBar(16, 98, 260, agent.pct, agent.accent === "$muted" ? "$dim" : agent.accent),
              T(Math.round(agent.pct * 100) + "%", 284, 90, 60, 18, { size: 11, fill: agent.accent === "$muted" ? "$muted" : agent.accent, align: "right" }),
            ]
          });
        }),

        // Activity feed side column
        R(32 + 3 * 380 - 12, 196, 260, 472, "$card", {
          r: 16, stroke: "$border", sw: 1,
          children: [
            T("Live Feed", 20, 20, 160, 22, { size: 15, weight: 700, fill: "$text" }),
            Pill(180, 20, 60, 20, "$limeDim", "● LIVE", "$lime", { size: 8, stroke: "$lime", sw: 1 }),
            Line(0, 52, 260, "$border"),
            ...[
              { icon: "✓", color: "$lime",   label: "Codex merged PR #482",      sub: "api-server",  time: "1m" },
              { icon: "⊕", color: "$violet", label: "Claude opened PR #483",     sub: "billing",     time: "3m" },
              { icon: "✓", color: "$lime",   label: "Gemini docs PR #112 merged", sub: "docs",       time: "4m" },
              { icon: "▲", color: "$amber",  label: "Cursor queued AX-203",      sub: "core",        time: "5m" },
              { icon: "✓", color: "$lime",   label: "GPT-4 applied fix AX-199",  sub: "infra",       time: "8m" },
              { icon: "⊕", color: "$violet", label: "Codex opened PR #481",      sub: "api-server",  time: "11m" },
              { icon: "✓", color: "$lime",   label: "Claude merged PR #480",     sub: "billing",     time: "14m" },
              { icon: "∿", color: "$amber",  label: "Review requested AX-201",   sub: "core",        time: "16m" },
            ].map((item, i) => R(0, 60 + i * 50, 260, 44, "transparent", {
              children: [
                Dot(16, 22, 5, item.color, undefined),
                T(item.label, 30, 4, 180, 18, { size: 11, weight: 600, fill: "$text" }),
                T(item.sub, 30, 22, 120, 16, { size: 10, fill: "$muted", mono: true }),
                T(item.time + "m", 220, 12, 30, 16, { size: 10, fill: "$muted", align: "right" }),
              ]
            })),
          ]
        }),
      ]
    }),
  ]
};

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 7 — Desktop: Task Queue (Kanban)
// ════════════════════════════════════════════════════════════════════════════
const desktop_queue = {
  type: "frame", name: "07 · Task Queue (Desktop)",
  x: 1460, y: 920, width: DW, height: DH,
  fill: "$bg",
  children: [
    sidebar("queue"),

    R(220, 0, DW - 220, DH, "transparent", {
      children: [
        // Top bar
        R(0, 0, DW - 220, 64, "$surface", {
          stroke: "$border", sw: 1,
          children: [
            T("Task Queue", 32, 20, 200, 24, { size: 18, weight: 800, fill: "$text" }),
            T("47 tasks across 8 repositories", 32, 44, 280, 16, { size: 11, fill: "$muted" }),
            R(DW - 440, 16, 120, 32, "$violet", {
              r: 8, children: [T("+ New Task", 0, 0, 120, 32, { size: 12, weight: 700, fill: "$bg", align: "center" })]
            }),
          ]
        }),

        // Kanban columns
        ...[
          {
            title: "Backlog", count: 18, accent: "$muted",
            tasks: [
              { id: "AX-212", title: "Add Redis caching to search API", agent: null, priority: "MED", repo: "api-server" },
              { id: "AX-211", title: "Migrate from REST to tRPC", agent: null, priority: "LOW", repo: "frontend" },
              { id: "AX-210", title: "Set up Datadog APM", agent: null, priority: "HIGH", repo: "infra" },
            ]
          },
          {
            title: "In Progress", count: 6, accent: "$violet",
            tasks: [
              { id: "AX-204", title: "Cache invalidation in auth flow", agent: "Codex", priority: "HIGH", repo: "api-server", pct: 0.72 },
              { id: "AX-203", title: "Refactor payment to Stripe v3", agent: "Claude", priority: "HIGH", repo: "billing", pct: 0.41 },
              { id: "AX-201", title: "Unit tests for UserService", agent: "Cursor", priority: "MED", repo: "core", pct: 0.15 },
            ]
          },
          {
            title: "Review", count: 4, accent: "$amber",
            tasks: [
              { id: "AX-199", title: "Pagination on /api/products", agent: "Codex", priority: "LOW", repo: "storefront", pct: 1.0 },
              { id: "AX-198", title: "Terraform for Lambda scale", agent: "GPT-4", priority: "HIGH", repo: "infra", pct: 1.0 },
            ]
          },
          {
            title: "Done (Today)", count: 23, accent: "$lime",
            tasks: [
              { id: "AX-197", title: "Rate limiting on /api/users",     agent: "Codex",  priority: "HIGH", repo: "api-server", pct: 1.0 },
              { id: "AX-196", title: "Fix OAuth redirect bug",           agent: "Claude", priority: "MED",  repo: "auth",       pct: 1.0 },
              { id: "AX-195", title: "Auto-generate API docs",           agent: "Gemini", priority: "LOW",  repo: "docs",       pct: 1.0 },
            ]
          },
        ].map((col, ci) => R(32 + ci * 290, 80, 272, DH - 96, "transparent", {
          children: [
            // Column header
            R(0, 0, 272, 40, "$card", {
              r: 10, stroke: "$border", sw: 1,
              children: [
                Dot(16, 20, 4, col.accent, undefined),
                T(col.title, 28, 4, 160, 32, { size: 13, weight: 700, fill: "$text" }),
                Pill(220, 10, 40, 20, col.accent === "$lime" ? "$limeDim" : col.accent === "$violet" ? "$violetDim" : col.accent === "$amber" ? "$amberDim" : "$dim", String(col.count), col.accent, { size: 10 }),
              ]
            }),

            // Task cards
            ...col.tasks.map((task, ti) => R(0, 48 + ti * 124, 272, 114, "$card", {
              r: 12, stroke: col.title === 'In Progress' ? (task.agent === 'Codex' ? "$violetMid" : task.agent === 'Claude' ? "$lime" : "$amber") : "$border", sw: col.title === 'In Progress' ? 1 : 1,
              children: [
                // Priority + ID
                Pill(12, 12, task.priority === 'HIGH' ? 36 : task.priority === 'MED' ? 32 : 32, 16, task.priority === 'HIGH' ? "$redDim" : task.priority === 'MED' ? "$amberDim" : "$dim", task.priority, task.priority === 'HIGH' ? "$red" : task.priority === 'MED' ? "$amber" : "$muted", { size: 7 }),
                T(task.id, 200, 12, 60, 16, { size: 9, fill: "$muted", align: "right", mono: true }),
                T(task.title, 12, 34, 248, 36, { size: 12, weight: 600, fill: col.title === 'Done (Today)' ? "$muted" : "$text", lh: 1.45 }),
                T(task.repo, 12, 76, 100, 14, { size: 9, fill: "$muted", mono: true }),
                task.agent ? Pill(120, 72, task.agent.length * 7 + 16, 18, col.accent === "$lime" ? "$limeDim" : col.accent === "$violet" ? "$violetDim" : col.accent === "$amber" ? "$amberDim" : "$limeDim", task.agent, col.accent === "$lime" ? "$lime" : col.accent === "$violet" ? "$violet" : col.accent === "$amber" ? "$amber" : "$lime", { size: 8 }) : { type: "frame", x: 0, y: 0, width: 1, height: 1, fill: "transparent", children: [] },
                task.pct !== undefined ? progressBar(12, 96, 248, task.pct, col.accent) : { type: "frame", x: 0, y: 0, width: 1, height: 1, fill: "transparent", children: [] },
              ]
            })),
          ]
        })),
      ]
    }),
  ]
};

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 8 — Desktop: Code Review (Split Pane)
// ════════════════════════════════════════════════════════════════════════════
const desktop_review = {
  type: "frame", name: "08 · Code Review (Desktop)",
  x: 2920, y: 920, width: DW, height: DH,
  fill: "$bg",
  children: [
    sidebar("review"),

    R(220, 0, DW - 220, DH, "transparent", {
      children: [
        // Top bar
        R(0, 0, DW - 220, 64, "$surface", {
          stroke: "$border", sw: 1,
          children: [
            T("← Queue", 32, 22, 80, 20, { size: 12, fill: "$violet" }),
            T("PR #483 · Refactor payment module to Stripe v3", 116, 22, 560, 20, { size: 14, weight: 700, fill: "$text" }),
            Pill(690, 20, 66, 24, "$amberDim", "REVIEW", "$amber", { size: 9, stroke: "$amber", sw: 1 }),
            // Action buttons
            R(DW - 440, 14, 100, 36, "$lime", {
              r: 8, children: [T("✓ Approve", 0, 0, 100, 36, { size: 12, weight: 700, fill: "$bg", align: "center" })]
            }),
            R(DW - 330, 14, 130, 36, "$surface", {
              r: 8, stroke: "$border", sw: 1,
              children: [T("✎ Request Changes", 0, 0, 130, 36, { size: 11, weight: 600, fill: "$text", align: "center" })]
            }),
          ]
        }),

        // Left panel — file tree + AI summary
        R(0, 64, 300, DH - 64, "$surface", {
          stroke: "$border", sw: 1,
          children: [
            T("CHANGED FILES (2)", 20, 16, 260, 14, { size: 9, weight: 700, fill: "$muted", ls: 1 }),
            ...[
              { file: "billing/stripe.service.ts", changes: "+98 / -72", expanded: true },
              { file: "billing/stripe.types.ts", changes: "+26 / -17", expanded: false },
            ].map((f, i) => R(0, 36 + i * 40, 300, 36, f.expanded ? "$violetDim" : "transparent", {
              children: [
                T(f.expanded ? "▾" : "▸", 12, 8, 16, 20, { size: 11, fill: "$muted" }),
                T(f.file, 28, 8, 200, 20, { size: 11, fill: f.expanded ? "$text" : "$muted", mono: true }),
                T(f.changes, 220, 8, 72, 20, { size: 9, fill: "$lime", align: "right", mono: true }),
              ]
            })),

            Line(0, 120, 300, "$border"),

            // AI Review Summary
            T("AI REVIEW", 20, 134, 260, 14, { size: 9, weight: 700, fill: "$muted", ls: 1 }),
            R(12, 152, 276, 100, "$violetDim", {
              r: 12, stroke: "$violetMid", sw: 1,
              children: [
                Pill(12, 12, 62, 18, "$violetMid", "CLAUDE", "$violet", { size: 8 }),
                T("Clean refactor. Correct use of PaymentIntents API. Test coverage 94%. One flag: missing idempotency key on retry.", 12, 38, 252, 54, { size: 11, fill: "$text", lh: 1.55 }),
              ]
            }),

            Line(0, 264, 300, "$border"),

            // Checks
            T("CI CHECKS", 20, 278, 260, 14, { size: 9, weight: 700, fill: "$muted", ls: 1 }),
            ...[
              { name: "Build",        pass: true },
              { name: "Unit Tests",   pass: true },
              { name: "Type Check",   pass: true },
              { name: "Security Scan",pass: false },
            ].map((c, i) => R(12, 296 + i * 34, 276, 28, "transparent", {
              children: [
                Dot(8, 14, 5, c.pass ? "$lime" : "$red", undefined),
                T(c.name, 22, 6, 180, 16, { size: 12, fill: "$text" }),
                T(c.pass ? "✓ Pass" : "✗ Fail", 220, 6, 56, 16, { size: 10, fill: c.pass ? "$lime" : "$red", align: "right" }),
              ]
            })),

            Line(0, 432, 300, "$border"),

            // Comments summary
            T("DISCUSSION (4)", 20, 446, 260, 14, { size: 9, weight: 700, fill: "$muted", ls: 1 }),
            ...[
              { author: "You",    msg: "Is idempotency key handled for retries?", time: "2m" },
              { author: "Claude", msg: "Adding idempotency_key in next commit.", time: "1m" },
            ].map((c, i) => R(12, 466 + i * 70, 276, 60, "$card", {
              r: 10, stroke: "$border", sw: 1,
              children: [
                Pill(10, 10, c.author === 'Claude' ? 52 : 36, 16, c.author === 'Claude' ? "$limeDim" : "$violetDim", c.author, c.author === 'Claude' ? "$lime" : "$violet", { size: 8 }),
                T(c.time + "m", 240, 10, 36, 16, { size: 9, fill: "$muted", align: "right" }),
                T(c.msg, 10, 32, 256, 24, { size: 11, fill: "$text", lh: 1.45 }),
              ]
            })),
          ]
        }),

        // Right panel — diff viewer
        R(300, 64, DW - 220 - 300, DH - 64, "$bg", {
          children: [
            // File tab
            R(0, 0, DW - 220 - 300, 40, "$surface", {
              stroke: "$border", sw: 1,
              children: [
                R(0, 0, 310, 40, "$violetDim", {
                  stroke: "$violetMid", sw: 1,
                  children: [T("billing/stripe.service.ts", 16, 10, 278, 20, { size: 12, fill: "$text", mono: true })]
                }),
                R(312, 0, 260, 40, "$surface", {
                  children: [T("billing/stripe.types.ts", 16, 10, 228, 20, { size: 12, fill: "$muted", mono: true })]
                }),
              ]
            }),

            // Diff lines
            R(0, 40, DW - 220 - 300, DH - 64 - 40, "$bg", {
              children: [
                ...[
                  { n1: "80", n2: "80", code: '  async createCharge(order: Order) {', type: "ctx" },
                  { n1: "81", n2: "81", code: '    const { total, currency, customer } = order;', type: "ctx" },
                  { n1: "82", n2: "",   code: "    // DEPRECATED: Stripe Charges API", type: "del" },
                  { n1: "83", n2: "",   code: '    const charge = await stripe.charges.create({', type: "del" },
                  { n1: "84", n2: "",   code: '      amount: total,', type: "del" },
                  { n1: "85", n2: "",   code: '      currency: currency,', type: "del" },
                  { n1: "86", n2: "",   code: '      customer: customer.stripeId,', type: "del" },
                  { n1: "87", n2: "",   code: '    });', type: "del" },
                  { n1: "",   n2: "82", code: "    // v3: PaymentIntents API (3D Secure ready)", type: "add" },
                  { n1: "",   n2: "83", code: '    const intent = await stripe.paymentIntents.create({', type: "add" },
                  { n1: "",   n2: "84", code: '      amount: total,', type: "add" },
                  { n1: "",   n2: "85", code: '      currency: currency,', type: "add" },
                  { n1: "",   n2: "86", code: '      customer: customer.stripeId,', type: "add" },
                  { n1: "",   n2: "87", code: '      automatic_payment_methods: { enabled: true },', type: "add" },
                  { n1: "",   n2: "88", code: '      // TODO: add idempotency_key for retry safety', type: "warn" },
                  { n1: "",   n2: "89", code: '    });', type: "add" },
                  { n1: "88", n2: "90", code: '    return intent;', type: "ctx" },
                  { n1: "89", n2: "91", code: '  }', type: "ctx" },
                ].map((line, i) => R(0, i * 28, DW - 220 - 300, 28,
                  line.type === "del"  ? "#1C0E10" :
                  line.type === "add"  ? "#0C1C0E" :
                  line.type === "warn" ? "#1C180A" : "transparent", {
                  children: [
                    // Gutter
                    R(0, 0, 80, 28, line.type === "del" ? "#1A0C0E" : line.type === "add" ? "#0A1A0C" : line.type === "warn" ? "#1A160A" : "$surface", {
                      children: [
                        T(line.n1, 4, 4, 32, 20, { size: 11, fill: "$muted", mono: true, align: "right" }),
                        T(line.n2, 40, 4, 32, 20, { size: 11, fill: "$muted", mono: true, align: "right" }),
                      ]
                    }),
                    T(line.type === "del" ? " - " : line.type === "add" ? " + " : line.type === "warn" ? " ⚠ " : "   ", 80, 4, 28, 20, {
                      size: 11, mono: true,
                      fill: line.type === "del" ? "$red" : line.type === "add" ? "$lime" : line.type === "warn" ? "$amber" : "$muted"
                    }),
                    T(line.code, 112, 4, DW - 220 - 300 - 120, 20, {
                      size: 11, mono: true,
                      fill: line.type === "del" ? "$red" : line.type === "add" ? "$lime" : line.type === "warn" ? "$amber" : "$muted"
                    }),
                  ]
                })),
              ]
            }),
          ]
        }),
      ]
    }),
  ]
};

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 9 — Desktop: Insights / Analytics
// ════════════════════════════════════════════════════════════════════════════
const desktop_insights = {
  type: "frame", name: "09 · Insights (Desktop)",
  x: 4380, y: 920, width: DW, height: DH,
  fill: "$bg",
  children: [
    sidebar("hub"),

    R(220, 0, DW - 220, DH, "transparent", {
      children: [
        R(0, 0, DW - 220, 64, "$surface", {
          stroke: "$border", sw: 1,
          children: [
            T("Insights", 32, 20, 200, 24, { size: 18, weight: 800, fill: "$text" }),
            T("Week of March 11–18, 2026", 32, 44, 280, 16, { size: 11, fill: "$muted" }),
            // Period tabs
            ...[["Day", false], ["Week", true], ["Month", false]].map(([label, active], i) =>
              R(DW - 460 + i * 90, 18, 80, 28, active ? "$violetDim" : "transparent", {
                r: 8, stroke: active ? "$violet" : "$border", sw: 1,
                children: [T(label, 0, 0, 80, 28, { size: 12, weight: active ? 700 : 400, fill: active ? "$text" : "$muted", align: "center" })]
              })
            ),
          ]
        }),

        // Big number row
        ...[
          { label: "PRs Merged",     value: "127",  delta: "+34%", accent: "$lime" },
          { label: "Lines Changed",  value: "28.4k", delta: "+18%", accent: "$violet" },
          { label: "Test Coverage",  value: "94.1%", delta: "+2.1pp", accent: "$amber" },
          { label: "Avg Task Time",  value: "2.4h",  delta: "-0.3h", accent: "$text" },
        ].map((s, i) => R(32 + i * 290, 80, 272, 90, "$card", {
          r: 14, stroke: "$border", sw: 1,
          children: [
            T(s.value, 20, 10, 200, 42, { size: 36, weight: 900, fill: s.accent }),
            T(s.label, 20, 54, 180, 18, { size: 12, fill: "$muted" }),
            Pill(200, 54, 60, 18, s.accent === "$lime" ? "$limeDim" : s.accent === "$violet" ? "$violetDim" : "$amberDim", s.delta, s.accent, { size: 9 }),
          ]
        })),

        // PR velocity chart (simulated bar chart)
        R(32, 186, 720, 260, "$card", {
          r: 16, stroke: "$border", sw: 1,
          children: [
            T("PR Velocity by Day", 20, 18, 300, 20, { size: 14, weight: 700, fill: "$text" }),
            T("Merged PRs per day this week", 20, 40, 280, 16, { size: 11, fill: "$muted" }),
            // Chart bars (Mon-Sun)
            ...[
              { day: "Mon", val: 14, pct: 0.56 },
              { day: "Tue", val: 18, pct: 0.72 },
              { day: "Wed", val: 22, pct: 0.88 },
              { day: "Thu", val: 11, pct: 0.44 },
              { day: "Fri", val: 25, pct: 1.00 },
              { day: "Sat", val: 20, pct: 0.80 },
              { day: "Sun", val: 17, pct: 0.68 },
            ].map((b, i) => R(60 + i * 90, 66, 70, 166, "transparent", {
              children: [
                // Bar background
                R(10, 0, 50, 140, "$dim", { r: 6 }),
                // Bar fill
                R(10, 140 - Math.round(140 * b.pct), 50, Math.round(140 * b.pct), b.day === 'Fri' ? "$violet" : "$violetDim", {
                  r: 6,
                  children: b.day === 'Fri' ? [
                    T(String(b.val), 0, -22, 50, 18, { size: 11, weight: 700, fill: "$violet", align: "center" })
                  ] : []
                }),
                T(b.day, 0, 146, 70, 16, { size: 10, fill: "$muted", align: "center" }),
              ]
            })),
          ]
        }),

        // Agent breakdown
        R(764, 186, 450, 260, "$card", {
          r: 16, stroke: "$border", sw: 1,
          children: [
            T("Agent Contribution", 20, 18, 300, 20, { size: 14, weight: 700, fill: "$text" }),
            T("PRs merged this week by agent", 20, 40, 280, 16, { size: 11, fill: "$muted" }),
            ...[
              { name: "Codex",   pct: 0.38, count: 48,  accent: "$violet" },
              { name: "Claude",  pct: 0.28, count: 36,  accent: "$lime" },
              { name: "GPT-4",   pct: 0.18, count: 23,  accent: "$amber" },
              { name: "Cursor",  pct: 0.10, count: 13,  accent: "$muted" },
              { name: "Gemini",  pct: 0.06, count: 7,   accent: "$text" },
            ].map((a, i) => R(20, 68 + i * 36, 410, 28, "transparent", {
              children: [
                T(a.name, 0, 4, 80, 20, { size: 12, fill: "$text", weight: 600 }),
                R(88, 10, 260, 8, "$dim", {
                  r: 4, children: [R(0, 0, Math.round(260 * a.pct), 8, a.accent === "$muted" ? "$dim" : a.accent, { r: 4 })]
                }),
                T(String(a.count) + " PRs", 356, 4, 54, 20, { size: 11, fill: a.accent === "$text" ? "$muted" : a.accent, align: "right" }),
              ]
            })),
          ]
        }),

        // Repos row
        R(32, 462, 1182, 120, "$card", {
          r: 16, stroke: "$border", sw: 1,
          children: [
            T("Most Active Repositories", 20, 18, 300, 20, { size: 14, weight: 700, fill: "$text" }),
            ...[
              { name: "api-server",  prs: 42, agents: 2, accent: "$violet" },
              { name: "billing",     prs: 28, agents: 1, accent: "$lime" },
              { name: "core",        prs: 19, agents: 2, accent: "$amber" },
              { name: "frontend",    prs: 16, agents: 1, accent: "$violet" },
              { name: "infra",       prs: 12, agents: 1, accent: "$lime" },
              { name: "docs",        prs: 10, agents: 1, accent: "$muted" },
            ].map((r, i) => R(20 + i * 192, 48, 178, 58, "$surface", {
              r: 10, stroke: "$border", sw: 1,
              children: [
                T(r.name, 12, 8, 120, 18, { size: 12, weight: 600, fill: "$text", mono: true }),
                T(String(r.prs) + " PRs · " + String(r.agents) + " agents", 12, 30, 154, 16, { size: 10, fill: "$muted" }),
                Dot(158, 16, 5, r.accent, undefined),
              ]
            })),
          ]
        }),

        // Time saved callout
        R(32, 598, 570, 90, "$violetDim", {
          r: 16, stroke: "$violetMid", sw: 1,
          children: [
            T("⏱", 24, 20, 32, 40, { size: 32, fill: "$violet" }),
            T("62 hours saved this week", 68, 12, 400, 30, { size: 24, weight: 900, fill: "$text" }),
            T("vs. estimated manual development time across all agents", 68, 46, 480, 18, { size: 12, fill: "$muted" }),
          ]
        }),

        R(616, 598, 598, 90, "$limeDim", {
          r: 16, stroke: "$lime", sw: 1,
          children: [
            T("✓", 24, 20, 32, 40, { size: 32, fill: "$lime" }),
            T("94.1% test pass rate", 68, 12, 400, 30, { size: 24, weight: 900, fill: "$text" }),
            T("Up from 91.8% last week — AI agents improving code quality over time", 68, 46, 516, 18, { size: 12, fill: "$muted" }),
          ]
        }),
      ]
    }),
  ]
};

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 10 — Desktop: Onboarding (Agent Setup)
// ════════════════════════════════════════════════════════════════════════════
const desktop_onboarding = {
  type: "frame", name: "10 · Onboarding (Desktop)",
  x: 5840, y: 920, width: DW, height: DH,
  fill: "$bg",
  children: [
    // Split layout — left brand panel, right form
    R(0, 0, 480, DH, "$surface", {
      stroke: "$border", sw: 1,
      children: [
        // Logo
        R(40, 40, 36, 36, "$violetDim", {
          r: 9, stroke: "$violetMid", sw: 1,
          children: [T("⊕", 0, 0, 36, 36, { size: 18, fill: "$violet", align: "center" })]
        }),
        T("AXIS", 84, 46, 100, 24, { size: 18, weight: 900, fill: "$text", ls: 2.5 }),

        // Big headline
        T("One dashboard.\nEvery AI agent.", 40, 130, 400, 120, { size: 42, weight: 900, fill: "$text", lh: 1.1, ls: -1.5 }),
        T("Connect Codex, Claude, Cursor, and every\nother AI coding agent in one place.", 40, 268, 400, 48, { size: 15, fill: "$muted", lh: 1.6 }),

        // Feature bullets
        ...[
          { icon: "◎", label: "Monitor all agents in real-time",    desc: "See what's running, what's queued, what needs review" },
          { icon: "∿", label: "AI-powered code review",             desc: "Every PR gets a review before you see it" },
          { icon: "⊞", label: "Unified task queue",                 desc: "One kanban board, every repo, every agent" },
        ].map((f, i) => R(40, 348 + i * 90, 400, 78, "transparent", {
          children: [
            R(0, 0, 40, 40, "$violetDim", {
              r: 10, stroke: "$violetMid", sw: 1,
              children: [T(f.icon, 0, 0, 40, 40, { size: 18, fill: "$violet", align: "center" })]
            }),
            T(f.label, 52, 2, 340, 20, { size: 14, weight: 700, fill: "$text" }),
            T(f.desc, 52, 24, 340, 32, { size: 12, fill: "$muted", lh: 1.5 }),
          ]
        })),

        // Social proof
        R(40, 618, 400, 80, "$card", {
          r: 14, stroke: "$border", sw: 1,
          children: [
            T('"AXIS cut our review bottleneck in half.\nCodex ships, Claude reviews, we ship."', 20, 12, 360, 40, { size: 13, weight: 600, fill: "$text", lh: 1.5 }),
            T("— Priya S., Lead Engineer @ Vercel", 20, 56, 360, 16, { size: 11, fill: "$muted" }),
          ]
        }),
      ]
    }),

    // Right panel — setup form
    R(480, 0, DW - 480, DH, "transparent", {
      children: [
        // Progress bar
        R(0, 0, DW - 480, 8, "$dim", {
          r: 0,
          children: [R(0, 0, (DW - 480) * 0.4, 8, "$violet", { r: 0, children: [] })]
        }),

        T("Step 1 of 3", 60, 28, 200, 16, { size: 11, fill: "$muted", ls: 0.5 }),
        T("CONNECT YOUR AGENTS", 60, 44, 400, 16, { size: 10, weight: 700, fill: "$violet", ls: 2 }),

        T("Which AI agents", 60, 80, 600, 54, { size: 48, weight: 900, fill: "$text", ls: -2 }),
        T("do you use?", 60, 128, 600, 54, { size: 48, weight: 900, fill: "$violet", ls: -2 }),
        T("Select all that apply. You can add more later.", 60, 194, 480, 24, { size: 14, fill: "$muted" }),

        // Agent selector grid
        ...[
          { name: "Codex",      org: "OpenAI",    icon: "◆", accent: "$violet", selected: true },
          { name: "Claude",     org: "Anthropic", icon: "◇", accent: "$lime",   selected: true },
          { name: "Cursor",     org: "Anysphere", icon: "◈", accent: "$amber",  selected: false },
          { name: "GitHub Copilot", org: "GitHub", icon: "◉", accent: "$muted", selected: false },
          { name: "GPT-4",      org: "OpenAI",    icon: "◆", accent: "$violet", selected: true },
          { name: "Gemini",     org: "Google",    icon: "◇", accent: "$lime",   selected: false },
        ].map((a, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          return R(60 + col * 230, 228 + row * 90, 218, 76, a.selected ? "$violetDim" : "$card", {
            r: 14, stroke: a.selected ? "$violet" : "$border", sw: a.selected ? 2 : 1,
            children: [
              T(a.icon, 16, 16, 26, 26, { size: 20, fill: a.selected ? a.accent : "$muted" }),
              T(a.name, 50, 12, 130, 22, { size: 14, weight: 700, fill: a.selected ? "$text" : "$muted" }),
              T(a.org, 50, 32, 130, 16, { size: 10, fill: "$muted" }),
              a.selected ? Pill(182, 14, 24, 24, "$violet", "✓", "$bg", { size: 14 }) : R(178, 14, 24, 24, "transparent", { r: 12, stroke: "$border2", sw: 1, children: [] }),
            ]
          });
        }),

        T("Don't see your agent? You can add a custom one.", 60, 412, 500, 20, { size: 12, fill: "$muted" }),

        // CTA
        R(60, 444, 280, 56, "$violet", {
          r: 14, children: [T("CONNECT AGENTS →", 0, 0, 280, 56, { size: 14, weight: 800, fill: "$text", align: "center", ls: 1 })]
        }),
        T("Continue without connecting ›", 360, 456, 240, 32, { size: 12, fill: "$muted" }),

        // Stats at bottom
        T("Trusted by 4,200+ engineering teams", 60, 524, 400, 20, { size: 12, fill: "$muted" }),
        ...[
          { icon: "★", val: "4.9",    sub: "Product Hunt" },
          { icon: "◆", val: "12,400+", sub: "Engineers" },
          { icon: "✓", val: "240k+",   sub: "PRs reviewed" },
        ].map((s, i) => R(60 + i * 200, 552, 180, 60, "$card", {
          r: 12, stroke: "$border", sw: 1,
          children: [
            T(s.icon, 16, 12, 24, 24, { size: 18, fill: "$violet" }),
            T(s.val, 48, 8, 130, 28, { size: 22, weight: 900, fill: "$text" }),
            T(s.sub, 48, 34, 130, 18, { size: 10, fill: "$muted" }),
          ]
        })),
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
    mobile_dashboard,
    mobile_agent_detail,
    mobile_queue,
    mobile_review,
    mobile_settings,
    desktop_dashboard,
    desktop_queue,
    desktop_review,
    desktop_insights,
    desktop_onboarding,
  ]
};

fs.writeFileSync('axis-app.pen', JSON.stringify(pen, null, 2));
console.log('✓ axis-app.pen written');
console.log(`  Screens: ${pen.children.length} (5 mobile + 5 desktop)`);
console.log(`  Palette: near-black #08090C + electric violet #6C5CE7 + acid lime #BAFF39 + warm white #F0F0F2`);
