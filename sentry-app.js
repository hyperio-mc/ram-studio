// sentry-app.js
// "SENTRY" — AI agent ops & security monitoring platform
// Inspired by Linear's deep-black SaaS aesthetic on DarkModeDesign.com
// + Evervault's customer story card grid on Godly.website
// Palette: near-black #08090A + indigo #7170FF + lavender mist #DFE1F4 + warning amber #FFB547
// pencil.dev v2.8

const fs = require('fs');
const path = require('path');

// ── Design tokens ──────────────────────────────────────────────────────────────
const vars = {
  bg:       { type: "color", value: "#08090A" },
  surface:  { type: "color", value: "#0F1117" },
  card:     { type: "color", value: "#14161C" },
  elevated: { type: "color", value: "#1C1F2B" },
  border:   { type: "color", value: "#1E2235" },
  indigo:   { type: "color", value: "#7170FF" },
  indigoDim:{ type: "color", value: "#1A1A3A" },
  lav:      { type: "color", value: "#DFE1F4" },  // Evervault-inspired lavender
  lavDim:   { type: "color", value: "#9698B8" },
  amber:    { type: "color", value: "#FFB547" },
  amberDim: { type: "color", value: "#2A1E08" },
  green:    { type: "color", value: "#22C55E" },
  red:      { type: "color", value: "#EF4444" },
  muted:    { type: "color", value: "#3A3D52" },
  text:     { type: "color", value: "#F7F8F8" },
};

// ── Shorthand helpers ──────────────────────────────────────────────────────────
const T = (content, x, y, w, h, opts = {}) => ({
  type: "text", content, x, y, width: w, height: h,
  fontSize: opts.size || 13,
  fontWeight: opts.weight || 400,
  fill: opts.fill || "$text",
  textAlign: opts.align || "left",
  letterSpacing: opts.ls,
  lineHeight: opts.lh,
  opacity: opts.opacity,
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

const Line = (x, y, w, color, opts = {}) =>
  R(x, y, w, 1, color, { opacity: opts.opacity });

const Pill = (x, y, w, h, fill, label, textFill, opts = {}) => ({
  type: "frame", x, y, width: w, height: h,
  fill, cornerRadius: h / 2,
  children: label ? [T(label, 0, 0, w, h, { size: opts.size || 9, weight: 700, fill: textFill || "$bg", align: "center", ls: 0.8 })] : [],
});

const Dot = (x, y, r, fill) => ({
  type: "ellipse", x: x - r, y: y - r, width: r * 2, height: r * 2, fill,
});

const Card = (x, y, w, h, children, opts = {}) => ({
  type: "frame", x, y, width: w, height: h,
  fill: opts.fill || "$card",
  cornerRadius: opts.r || 12,
  strokeColor: opts.stroke || "$border",
  strokeWidth: opts.sw || 1,
  children,
});

// ── Status bar ────────────────────────────────────────────────────────────────
const statusBar = (bg) => R(0, 0, 390, 48, bg || "$bg", {
  children: [
    T("9:41", 20, 16, 40, 16, { size: 12, weight: 600, fill: "$lavDim" }),
    T("●●● ◀ ▐▐▌", 300, 16, 70, 16, { size: 10, fill: "$lavDim", align: "right" }),
  ]
});

// ── Mobile nav bar ────────────────────────────────────────────────────────────
const mobileNav = (active) => {
  const tabs = [
    { icon: "⬡", label: "Agents" },
    { icon: "◈", label: "Alerts" },
    { icon: "⬢", label: "Monitor" },
    { icon: "◯", label: "Config" },
  ];
  const w = 390, h = 64, iw = w / tabs.length;
  return {
    type: "frame", x: 0, y: 760, width: w, height: h,
    fill: "$surface",
    strokeColor: "$border", strokeWidth: 1,
    children: [
      Line(0, 0, w, "$border"),
      ...tabs.map((t, i) => ({
        type: "frame", x: i * iw, y: 0, width: iw, height: h,
        fill: "transparent",
        children: [
          T(t.icon, 0, 10, iw, 18, { size: 16, fill: i === active ? "$indigo" : "$muted", align: "center" }),
          T(t.label, 0, 34, iw, 14, { size: 8, weight: i === active ? 700 : 400, fill: i === active ? "$indigo" : "$muted", align: "center", ls: 0.5 }),
          ...(i === active ? [Dot(iw / 2, 2, 2, "$indigo")] : []),
        ],
      })),
    ],
  };
};

// ── SCREEN 1: Mobile Dashboard ────────────────────────────────────────────────
function mobileScreen1() {
  // Agent status cards in bento grid, Linear aesthetic
  const agentCards = [
    { name: "GPT-4 Turbo", role: "Payment classifier", status: "ACTIVE", color: "$green", tasks: "1,247", latency: "124ms" },
    { name: "Claude-3.5", role: "Fraud detector", status: "ACTIVE", color: "$green", tasks: "891", latency: "98ms" },
    { name: "Mistral-7B", role: "Risk scorer", status: "WARN", color: "$amber", tasks: "432", latency: "341ms" },
    { name: "Llama-3.1", role: "Compliance check", status: "ERROR", color: "$red", tasks: "0", latency: "—" },
  ];

  const cardRows = agentCards.map((a, i) => {
    const cy = 200 + i * 84;
    return Card(16, cy, 358, 72, [
      // Status dot
      Dot(20, 22, 5, a.color),
      T(a.name, 34, 12, 160, 18, { size: 13, weight: 700, fill: "$lav" }),
      T(a.role, 34, 30, 180, 14, { size: 10, fill: "$lavDim" }),
      // Status pill
      Pill(260, 14, 68, 18, a.color === "$green" ? "$green" : a.color === "$amber" ? "$amber" : "$red",
        a.status, "$bg", { size: 8 }),
      // Metrics
      T("TASKS", 34, 48, 50, 12, { size: 7, fill: "$muted", ls: 1 }),
      T(a.tasks, 80, 48, 60, 12, { size: 10, weight: 700, fill: "$text" }),
      T("LATENCY", 160, 48, 60, 12, { size: 7, fill: "$muted", ls: 1 }),
      T(a.latency, 220, 48, 60, 12, { size: 10, weight: 700, fill: "$text" }),
      // Right arrow
      T("›", 348, 24, 12, 18, { size: 16, fill: "$muted", align: "right" }),
    ]);
  });

  // Pulse/activity bar (mini bar chart)
  const bars = [6, 10, 7, 14, 11, 9, 16, 13, 8, 12, 15, 10, 7, 14, 11, 9].map((h, i) => ({
    type: "frame", x: i * 20, y: 60 - h, width: 14, height: h,
    fill: "$indigo", cornerRadius: 2,
    opacity: 0.3 + (i / 16) * 0.7,
  }));

  return {
    width: 390, height: 844,
    fill: "$bg",
    type: "frame",
    name: "M · Dashboard",
    vars,
    children: [
      statusBar(),
      // Header
      T("SENTRY", 20, 56, 200, 32, { size: 22, weight: 900, fill: "$lav", ls: 4 }),
      T("Agent ops", 20, 88, 200, 18, { size: 11, fill: "$lavDim" }),
      // Alert badge
      R(288, 56, 82, 28, "$indigoDim", {
        r: 14, stroke: "$indigo", sw: 1,
        children: [
          Dot(16, 14, 4, "$red"),
          T("3 ALERTS", 24, 7, 58, 14, { size: 9, weight: 700, fill: "$indigo" }),
        ],
      }),

      // Activity pulse card
      Card(16, 116, 358, 76, [
        T("SYSTEM THROUGHPUT · 24H", 16, 12, 240, 12, { size: 8, fill: "$muted", ls: 1.5, weight: 700 }),
        T("2,570", 16, 28, 80, 22, { size: 18, weight: 900, fill: "$lav" }),
        T("tx/min", 98, 38, 50, 12, { size: 10, fill: "$lavDim" }),
        // Bar chart
        {
          type: "frame", x: 176, y: 16, width: 170, height: 48,
          fill: "transparent",
          children: bars,
        },
      ]),

      // Section label
      T("ACTIVE AGENTS", 16, 192, 200, 14, { size: 8, weight: 700, fill: "$muted", ls: 2 }),

      // Agent cards
      ...cardRows,

      mobileNav(0),
    ],
  };
}

// ── SCREEN 2: Mobile Alert Detail ─────────────────────────────────────────────
function mobileScreen2() {
  // Severity scale dots
  const severityDots = Array.from({ length: 10 }, (_, i) => ({
    type: "ellipse",
    x: i * 32, y: 0,
    width: 22, height: 22,
    fill: i < 8 ? (i < 4 ? "$green" : i < 7 ? "$amber" : "$red") : "$red",
    opacity: i < 8 ? 0.3 + (i / 10) * 0.7 : 1,
  }));

  const timelineEvents = [
    { time: "14:23:01", event: "Agent initiated transaction batch", icon: "○", color: "$lavDim" },
    { time: "14:23:07", event: "Unusual pattern detected: 47 sequential TXNs", icon: "◈", color: "$amber" },
    { time: "14:23:08", event: "Risk scorer returned 0.94 confidence", icon: "▲", color: "$red" },
    { time: "14:23:09", event: "Auto-pause triggered — PCI-DSS rule 6.2", icon: "■", color: "$red" },
    { time: "14:23:12", event: "Escalated to compliance review queue", icon: "→", color: "$indigo" },
  ];

  const timeline = timelineEvents.map((ev, i) => {
    const ey = i * 60;
    return {
      type: "frame", x: 0, y: ey, width: 330, height: 52,
      fill: "transparent",
      children: [
        // Vertical line
        ...(i < timelineEvents.length - 1 ? [R(9, 20, 1, 40, "$border")] : []),
        Dot(10, 10, 6, ev.color),
        T(ev.time, 24, 0, 80, 14, { size: 9, fill: "$muted", weight: 700 }),
        T(ev.event, 24, 16, 300, 28, { size: 11, fill: "$lav", lh: 1.5 }),
      ],
    };
  });

  return {
    width: 390, height: 844,
    fill: "$bg",
    type: "frame",
    name: "M · Alert Detail",
    vars,
    children: [
      statusBar(),

      // Back nav
      T("‹ Alerts", 16, 56, 100, 20, { size: 13, fill: "$indigo", weight: 600 }),

      // Alert header card
      Card(16, 84, 358, 120, [
        Pill(16, 14, 60, 20, "$red", "CRITICAL", "$bg"),
        T("ALERT-2847", 88, 14, 120, 20, { size: 9, weight: 700, fill: "$muted", ls: 1 }),
        T("Anomalous Transaction Burst", 16, 44, 320, 22, { size: 16, weight: 800, fill: "$lav" }),
        T("Agent: Mistral-7B · Risk Scorer · Production", 16, 70, 300, 14, { size: 10, fill: "$lavDim" }),
        T("14:23 · 3 min ago", 16, 88, 200, 14, { size: 10, fill: "$muted" }),
      ], { fill: "$surface", stroke: "$red", sw: 1 }),

      // Severity scale
      T("SEVERITY SCALE", 16, 216, 200, 12, { size: 8, weight: 700, fill: "$muted", ls: 1.5 }),
      {
        type: "frame", x: 16, y: 232, width: 320, height: 22,
        fill: "transparent",
        children: severityDots,
      },
      T("8.4 / 10", 290, 230, 80, 22, { size: 13, weight: 900, fill: "$red", align: "right" }),

      // Affected scope
      Card(16, 272, 358, 72, [
        T("AFFECTED SCOPE", 16, 12, 200, 12, { size: 8, weight: 700, fill: "$muted", ls: 1.5 }),
        T("47 transactions", 16, 28, 120, 20, { size: 14, weight: 700, fill: "$lav" }),
        T("$12,340 at risk", 16, 48, 140, 14, { size: 11, fill: "$amber" }),
        T("3 merchant IDs", 180, 28, 130, 20, { size: 14, weight: 700, fill: "$lav" }),
        T("Auto-paused ✓", 180, 48, 130, 14, { size: 11, fill: "$green" }),
      ]),

      // Timeline
      T("EVENT TIMELINE", 16, 360, 200, 12, { size: 8, weight: 700, fill: "$muted", ls: 1.5 }),
      {
        type: "frame", x: 28, y: 380, width: 330, height: 300,
        fill: "transparent",
        children: timeline,
      },

      // Action buttons
      R(16, 710, 168, 44, "$red", {
        r: 10,
        children: [T("ESCALATE", 0, 13, 168, 18, { size: 11, weight: 700, fill: "$bg", align: "center", ls: 1 })],
      }),
      R(202, 710, 172, 44, "$indigoDim", {
        r: 10, stroke: "$indigo", sw: 1,
        children: [T("DISMISS", 0, 13, 172, 18, { size: 11, weight: 700, fill: "$indigo", align: "center", ls: 1 })],
      }),

      mobileNav(1),
    ],
  };
}

// ── SCREEN 3: Mobile Agent Config / Permissions ───────────────────────────────
function mobileScreen3() {
  const perms = [
    { scope: "Read transactions", status: true, risk: "LOW" },
    { scope: "Write transaction flags", status: true, risk: "MED" },
    { scope: "Access PII data", status: false, risk: "HIGH" },
    { scope: "Trigger auto-disputes", status: false, risk: "HIGH" },
    { scope: "Email notifications", status: true, risk: "LOW" },
    { scope: "Webhook callbacks", status: true, risk: "MED" },
  ];

  const permRows = perms.map((p, i) => {
    const py = i * 56;
    const riskColor = p.risk === "LOW" ? "$green" : p.risk === "MED" ? "$amber" : "$red";
    return {
      type: "frame", x: 0, y: py, width: 326, height: 48,
      fill: "transparent",
      children: [
        Line(0, 47, 326, "$border"),
        T(p.scope, 0, 14, 200, 16, { size: 12, fill: "$lav" }),
        Pill(200, 14, 34, 16, riskColor === "$green" ? "$green" : riskColor === "$amber" ? "$amber" : "$red",
          p.risk, "$bg", { size: 7 }),
        // Toggle
        R(264, 12, 40, 22, p.status ? "$indigo" : "$muted", {
          r: 11,
          children: [
            {
              type: "ellipse",
              x: p.status ? 20 : 2, y: 2,
              width: 18, height: 18,
              fill: p.status ? "$bg" : "$elevated",
            },
          ],
        }),
      ],
    };
  });

  return {
    width: 390, height: 844,
    fill: "$bg",
    type: "frame",
    name: "M · Agent Config",
    vars,
    children: [
      statusBar(),

      // Header
      T("‹", 16, 56, 20, 24, { size: 20, fill: "$indigo" }),
      T("Agent Config", 44, 56, 220, 24, { size: 16, weight: 700, fill: "$lav" }),

      // Agent identity card
      Card(16, 92, 358, 80, [
        // Avatar / model icon
        R(16, 16, 48, 48, "$indigoDim", {
          r: 12, stroke: "$indigo", sw: 1,
          children: [T("M7", 0, 15, 48, 18, { size: 13, weight: 900, fill: "$indigo", align: "center" })],
        }),
        T("Mistral-7B · Risk Scorer", 76, 16, 220, 18, { size: 13, weight: 700, fill: "$lav" }),
        T("v0.3.2 · Production · US-EAST-1", 76, 36, 240, 14, { size: 10, fill: "$lavDim" }),
        Pill(76, 56, 60, 16, "$amberDim", "WARNING", "$amber", { size: 7 }),
        T("Updated 2h ago", 148, 56, 120, 16, { size: 9, fill: "$muted" }),
      ]),

      // Rate limits
      T("RATE LIMITS", 16, 184, 200, 12, { size: 8, weight: 700, fill: "$muted", ls: 1.5 }),
      Card(16, 200, 358, 72, [
        T("Requests / min", 16, 12, 160, 16, { size: 12, fill: "$lav" }),
        T("500", 280, 12, 60, 16, { size: 12, weight: 700, fill: "$indigo", align: "right" }),
        // Progress bar
        R(16, 36, 326, 6, "$muted", { r: 3 }),
        R(16, 36, 180, 6, "$amber", { r: 3 }),  // 360% utilization
        T("Tokens / day", 16, 50, 160, 14, { size: 11, fill: "$lavDim" }),
        T("1.2M / 2M", 220, 50, 106, 14, { size: 11, fill: "$text", align: "right" }),
      ]),

      // Permission scopes
      T("PERMISSION SCOPES", 16, 284, 200, 12, { size: 8, weight: 700, fill: "$muted", ls: 1.5 }),
      {
        type: "frame", x: 32, y: 300, width: 326, height: 336,
        fill: "transparent",
        children: permRows,
      },

      // Save button
      R(16, 754, 358, 46, "$indigo", {
        r: 10,
        children: [T("SAVE CONFIGURATION", 0, 13, 358, 20, { size: 11, weight: 700, fill: "$bg", align: "center", ls: 1 })],
      }),
    ],
  };
}

// ── SCREEN 4: Desktop Command Center ──────────────────────────────────────────
function desktopScreen4() {
  const W = 1440, H = 900;

  // Sidebar
  const sidebar = R(0, 0, 220, H, "$surface", {
    stroke: "$border", sw: 1,
    children: [
      // Logo
      T("SENTRY", 24, 28, 140, 28, { size: 18, weight: 900, fill: "$lav", ls: 4 }),
      T("Agent Ops", 24, 56, 140, 16, { size: 10, fill: "$lavDim" }),
      Line(16, 80, 188, "$border"),

      // Nav items
      ...["Agents", "Alerts", "Activity", "Compliance", "Config"].map((label, i) => {
        const isActive = i === 0;
        const navY = 100 + i * 48;
        return R(12, navY, 196, 36, isActive ? "$indigoDim" : "transparent", {
          r: 8,
          children: [
            T(label, 16, 9, 164, 18, { size: 12, weight: isActive ? 700 : 400, fill: isActive ? "$indigo" : "$lavDim" }),
            ...(i === 1 ? [Pill(144, 9, 28, 18, "$red", "3", "$bg", { size: 9 })] : []),
          ],
        });
      }),

      Line(16, 352, 188, "$border"),

      // System status
      T("SYSTEM STATUS", 16, 368, 190, 12, { size: 7, weight: 700, fill: "$muted", ls: 1.5 }),
      Dot(28, 392, 4, "$green"),
      T("All systems operational", 40, 384, 164, 16, { size: 10, fill: "$lavDim" }),

      // Bottom user
      Line(16, H - 60, 188, "$border"),
      R(24, H - 48, 32, 32, "$indigoDim", {
        r: 8,
        children: [T("JK", 0, 9, 32, 14, { size: 9, weight: 700, fill: "$indigo", align: "center" })],
      }),
      T("j.kim@acme.com", 64, H - 44, 140, 16, { size: 10, fill: "$lavDim" }),
      T("Admin", 64, H - 30, 100, 14, { size: 9, fill: "$muted" }),
    ],
  });

  // Main content
  const mainX = 236, mainW = W - mainX - 16;

  // Top bar
  const topBar = R(mainX, 0, mainW, 64, "transparent", {
    children: [
      T("Command Center", mainX, 18, 300, 28, { size: 20, weight: 800, fill: "$lav" }),
      T("Live · Updated 2s ago", mainX, 44, 240, 16, { size: 10, fill: "$lavDim" }),
      // Time filter pills
      ...["1H", "6H", "24H", "7D"].map((label, i) => {
        const isActive = i === 2;
        return Pill(W - 200 + i * 44, 22, 36, 22, isActive ? "$indigo" : "$surface",
          label, isActive ? "$bg" : "$lavDim", { size: 9 });
      }),
    ],
  });

  // KPI row
  const kpis = [
    { label: "ACTIVE AGENTS", value: "12", sub: "3 warning", color: "$lav" },
    { label: "TRANSACTIONS / MIN", value: "2,570", sub: "+14% vs yesterday", color: "$green" },
    { label: "OPEN ALERTS", value: "3", sub: "1 critical", color: "$red" },
    { label: "AVG LATENCY", value: "118ms", sub: "p99: 341ms", color: "$amber" },
  ];
  const kpiW = (mainW - 48) / 4;
  const kpiCards = kpis.map((k, i) =>
    Card(mainX + i * (kpiW + 16), 72, kpiW, 88, [
      T(k.label, 16, 14, kpiW - 32, 12, { size: 8, weight: 700, fill: "$muted", ls: 1.5 }),
      T(k.value, 16, 30, kpiW - 32, 28, { size: 22, weight: 900, fill: k.color }),
      T(k.sub, 16, 60, kpiW - 32, 16, { size: 10, fill: "$lavDim" }),
    ])
  );

  // Bento grid: top row
  // Left: Agent status grid (large)
  const agentTableData = [
    { name: "GPT-4 Turbo", role: "Payment classifier", status: "ACTIVE", tasks: "1,247", lat: "124ms", err: "0.01%", color: "$green" },
    { name: "Claude-3.5", role: "Fraud detector", status: "ACTIVE", tasks: "891", lat: "98ms", err: "0.00%", color: "$green" },
    { name: "Mistral-7B", role: "Risk scorer", status: "WARN", tasks: "432", lat: "341ms", err: "2.30%", color: "$amber" },
    { name: "Llama-3.1", role: "Compliance check", status: "ERROR", tasks: "0", lat: "—", err: "100%", color: "$red" },
    { name: "Cohere R+", role: "KYC verifier", status: "ACTIVE", tasks: "564", lat: "210ms", err: "0.10%", color: "$green" },
    { name: "Phi-3.5", role: "Chargeback analyst", status: "ACTIVE", tasks: "318", lat: "167ms", err: "0.05%", color: "$green" },
  ];
  const tableW = mainW * 0.55;
  const tableH = 270;
  const tableHeaders = ["AGENT", "ROLE", "STATUS", "TASKS", "LATENCY", "ERR RATE"];
  const tableColW = [160, 160, 80, 70, 80, 70];
  const agentTable = Card(mainX, 176, tableW, tableH, [
    T("AGENT FLEET", 20, 16, 300, 14, { size: 9, weight: 700, fill: "$muted", ls: 1.5 }),
    Line(16, 36, tableW - 32, "$border"),
    // Headers
    ...tableHeaders.map((h, i) => {
      const hx = 20 + tableColW.slice(0, i).reduce((a, b) => a + b, 0);
      return T(h, hx, 44, tableColW[i], 12, { size: 7, weight: 700, fill: "$muted", ls: 1 });
    }),
    Line(16, 60, tableW - 32, "$border"),
    // Rows
    ...agentTableData.map((a, ri) => {
      const ry = 68 + ri * 32;
      const cols = [a.name, a.role, a.status, a.tasks, a.lat, a.err];
      return {
        type: "frame", x: 0, y: ry, width: tableW, height: 30,
        fill: ri % 2 === 0 ? "transparent" : "$surface",
        children: [
          Dot(26, 15, 4, a.color),
          ...cols.map((val, ci) => {
            const cx = 20 + tableColW.slice(0, ci).reduce((a, b) => a + b, 0);
            const fill = ci === 2 ? a.color : ci === 0 ? "$lav" : "$lavDim";
            return T(val, ci === 0 ? 38 : cx, 8, tableColW[ci], 14, { size: 11, fill, weight: ci === 0 ? 600 : 400 });
          }),
        ],
      };
    }),
  ]);

  // Right: Alert feed (narrow)
  const alertW = mainW - tableW - 32;
  const alertsData = [
    { id: "ALT-2847", title: "Anomalous TX burst", sev: "CRITICAL", age: "3m", color: "$red" },
    { id: "ALT-2844", title: "Latency spike >300ms", sev: "WARNING", age: "18m", color: "$amber" },
    { id: "ALT-2839", title: "Model drift detected", sev: "WARNING", age: "1h", color: "$amber" },
  ];
  const alertFeed = Card(mainX + tableW + 16, 176, alertW, tableH, [
    T("ACTIVE ALERTS", 16, 16, alertW - 32, 14, { size: 9, weight: 700, fill: "$muted", ls: 1.5 }),
    Pill(alertW - 46, 14, 30, 18, "$red", "3", "$bg", { size: 9 }),
    Line(12, 36, alertW - 24, "$border"),
    ...alertsData.map((a, i) => {
      const ay = 48 + i * 72;
      return {
        type: "frame", x: 12, y: ay, width: alertW - 24, height: 64,
        fill: "$surface", cornerRadius: 8,
        strokeColor: i === 0 ? "$red" : "$border", strokeWidth: 1,
        children: [
          Dot(14, 22, 5, a.color),
          T(a.id, 28, 12, 100, 14, { size: 9, weight: 700, fill: "$muted" }),
          T(a.age, alertW - 60, 12, 36, 14, { size: 9, fill: "$muted", align: "right" }),
          T(a.title, 28, 26, alertW - 80, 16, { size: 12, weight: 600, fill: "$lav" }),
          Pill(28, 46, a.sev === "CRITICAL" ? 64 : 60, 14, a.sev === "CRITICAL" ? "#2A0A0A" : "$amberDim",
            a.sev, a.color, { size: 7 }),
        ],
      };
    }),
  ]);

  // Bottom row: Activity log + throughput chart placeholders
  const actW = mainW * 0.6;
  const actH = 200;
  const actY = 176 + tableH + 16;
  const actEvents = [
    { time: "14:28:01", agent: "GPT-4 Turbo", event: "Batch processed 128 transactions", type: "INFO" },
    { time: "14:27:44", agent: "Claude-3.5", event: "Fraud flag raised — TXN #889234", type: "WARN" },
    { time: "14:27:31", agent: "Mistral-7B", event: "Latency threshold exceeded", type: "WARN" },
    { time: "14:27:10", agent: "Cohere R+", event: "KYC pass · user@mail.com verified", type: "INFO" },
    { time: "14:26:58", agent: "Llama-3.1", event: "Connection timeout — restarting", type: "ERROR" },
  ];
  const actLog = Card(mainX, actY, actW, actH, [
    T("LIVE ACTIVITY LOG", 16, 14, 300, 12, { size: 8, weight: 700, fill: "$muted", ls: 1.5 }),
    Line(12, 32, actW - 24, "$border"),
    ...actEvents.map((e, i) => {
      const ly = 40 + i * 32;
      const tc = e.type === "ERROR" ? "$red" : e.type === "WARN" ? "$amber" : "$lavDim";
      return {
        type: "frame", x: 12, y: ly, width: actW - 24, height: 28,
        fill: "transparent",
        children: [
          T(e.time, 0, 7, 70, 14, { size: 9, fill: "$muted", weight: 600 }),
          T(e.agent, 78, 7, 100, 14, { size: 9, fill: "$indigo", weight: 600 }),
          T(e.event, 186, 7, actW - 280, 14, { size: 10, fill: "$lav" }),
          T(e.type, actW - 72, 7, 60, 14, { size: 8, weight: 700, fill: tc, align: "right" }),
        ],
      };
    }),
  ]);

  // Throughput mini chart (right)
  const chartW = mainW - actW - 32;
  const chartH = actH;
  const sparkPoints = [40, 55, 48, 62, 70, 58, 65, 72, 68, 76, 80, 71, 75, 82, 79, 85].map((v, i) => ({
    type: "frame",
    x: i * (chartW - 52) / 15,
    y: chartH - 60 - v * 0.9,
    width: (chartW - 52) / 16,
    height: v * 0.9,
    fill: "$indigo",
    cornerRadius: 2,
    opacity: 0.35 + (i / 16) * 0.65,
  }));
  const throughputChart = Card(mainX + actW + 16, actY, chartW, chartH, [
    T("THROUGHPUT · 24H", 16, 14, chartW - 32, 12, { size: 8, weight: 700, fill: "$muted", ls: 1.5 }),
    T("2,570", 16, 28, 100, 24, { size: 20, weight: 900, fill: "$lav" }),
    T("tx/min peak", 118, 44, 80, 14, { size: 9, fill: "$lavDim" }),
    {
      type: "frame", x: 16, y: 60, width: chartW - 32, height: chartH - 80,
      fill: "transparent",
      children: sparkPoints,
    },
  ]);

  return {
    width: W, height: H,
    fill: "$bg",
    type: "frame",
    name: "D · Command Center",
    vars,
    children: [
      sidebar,
      topBar,
      ...kpiCards,
      agentTable,
      alertFeed,
      actLog,
      throughputChart,
    ],
  };
}

// ── SCREEN 5: Desktop Activity Feed ───────────────────────────────────────────
function desktopScreen5() {
  const W = 1440, H = 900;

  // Sidebar (same as screen 4 but "Activity" active)
  const sidebar = R(0, 0, 220, H, "$surface", {
    stroke: "$border", sw: 1,
    children: [
      T("SENTRY", 24, 28, 140, 28, { size: 18, weight: 900, fill: "$lav", ls: 4 }),
      T("Agent Ops", 24, 56, 140, 16, { size: 10, fill: "$lavDim" }),
      Line(16, 80, 188, "$border"),
      ...["Agents", "Alerts", "Activity", "Compliance", "Config"].map((label, i) => {
        const isActive = i === 2;
        const navY = 100 + i * 48;
        return R(12, navY, 196, 36, isActive ? "$indigoDim" : "transparent", {
          r: 8,
          children: [
            T(label, 16, 9, 164, 18, { size: 12, weight: isActive ? 700 : 400, fill: isActive ? "$indigo" : "$lavDim" }),
            ...(i === 1 ? [Pill(144, 9, 28, 18, "$red", "3", "$bg", { size: 9 })] : []),
          ],
        });
      }),
      Line(16, H - 60, 188, "$border"),
      R(24, H - 48, 32, 32, "$indigoDim", {
        r: 8,
        children: [T("JK", 0, 9, 32, 14, { size: 9, weight: 700, fill: "$indigo", align: "center" })],
      }),
      T("j.kim@acme.com", 64, H - 44, 140, 16, { size: 10, fill: "$lavDim" }),
    ],
  });

  const mainX = 236, mainW = W - mainX - 32;

  // Header
  const header = R(mainX, 0, mainW, 64, "transparent", {
    children: [
      T("Live Activity", mainX, 18, 300, 28, { size: 20, weight: 800, fill: "$lav" }),
      T("Streaming · 5,420 events today", mainX, 44, 300, 16, { size: 10, fill: "$lavDim" }),
    ],
  });

  // Filter bar
  const filterLabels = ["All", "GPT-4 Turbo", "Claude-3.5", "Mistral-7B", "Errors only"];
  const filterBar = {
    type: "frame", x: mainX, y: 72, width: mainW, height: 36,
    fill: "transparent",
    children: filterLabels.map((f, i) => {
      const isActive = i === 0;
      return Pill(i * 120, 0, 108, 28, isActive ? "$indigo" : "$surface",
        f, isActive ? "$bg" : "$lavDim", { size: 9 });
    }),
  };

  // Event rows (dense table)
  const allEvents = [
    { ts: "14:28:07", agent: "GPT-4 Turbo", event_type: "BATCH_COMPLETE", message: "128 transactions classified — 2 flagged", latency: "104ms", status: "OK" },
    { ts: "14:28:04", agent: "Claude-3.5", event_type: "FRAUD_FLAG", message: "High-risk pattern — merchant: DK-8821", latency: "89ms", status: "WARN" },
    { ts: "14:27:59", agent: "Cohere R+", event_type: "KYC_PASS", message: "Identity verified — user id: u_48291", latency: "198ms", status: "OK" },
    { ts: "14:27:54", agent: "Phi-3.5", event_type: "ANALYSIS", message: "Chargeback probability 0.12 — below threshold", latency: "145ms", status: "OK" },
    { ts: "14:27:48", agent: "Mistral-7B", event_type: "LATENCY_HIGH", message: "P99 latency exceeded 300ms threshold", latency: "387ms", status: "WARN" },
    { ts: "14:27:41", agent: "GPT-4 Turbo", event_type: "BATCH_START", message: "Processing batch of 96 transactions", latency: "—", status: "OK" },
    { ts: "14:27:38", agent: "Llama-3.1", event_type: "TIMEOUT", message: "Connection timeout after 30s — restarting", latency: "—", status: "ERROR" },
    { ts: "14:27:33", agent: "Claude-3.5", event_type: "BATCH_COMPLETE", message: "64 fraud checks passed — 0 flags", latency: "92ms", status: "OK" },
    { ts: "14:27:28", agent: "GPT-4 Turbo", event_type: "MODEL_CALL", message: "Invoked GPT-4o-mini for edge case review", latency: "234ms", status: "OK" },
    { ts: "14:27:21", agent: "Cohere R+", event_type: "RATE_LIMIT", message: "Approaching daily token budget — 88% used", latency: "—", status: "WARN" },
    { ts: "14:27:14", agent: "Phi-3.5", event_type: "ANALYSIS", message: "Dispute pattern matched rule #R-442", latency: "167ms", status: "OK" },
    { ts: "14:27:09", agent: "Mistral-7B", event_type: "SCORE_HIGH", message: "Risk score 0.94 — auto-paused batch", latency: "341ms", status: "ERROR" },
    { ts: "14:27:02", agent: "GPT-4 Turbo", event_type: "BATCH_COMPLETE", message: "256 transactions classified — 5 flagged", latency: "118ms", status: "OK" },
    { ts: "14:26:55", agent: "Claude-3.5", event_type: "FRAUD_FLAG", message: "Velocity anomaly — card: ****4892", latency: "97ms", status: "WARN" },
  ];

  const colWidths = [90, 120, 130, 340, 80, 80];
  const colHeaders = ["TIME", "AGENT", "EVENT", "MESSAGE", "LATENCY", "STATUS"];
  const colXs = colWidths.reduce((acc, w, i) => { acc.push(i === 0 ? 16 : acc[i - 1] + colWidths[i - 1] + 12); return acc; }, []);

  const tableHeader = {
    type: "frame", x: mainX, y: 116, width: mainW, height: 28,
    fill: "$surface",
    children: [
      ...colHeaders.map((h, i) =>
        T(h, mainX + colXs[i], 8, colWidths[i], 12, { size: 7, weight: 700, fill: "$muted", ls: 1.5 })
      ),
    ],
  };

  const eventRows = allEvents.map((ev, i) => {
    const ry = 144 + i * 52;
    const sc = ev.status === "ERROR" ? "$red" : ev.status === "WARN" ? "$amber" : "$green";
    return {
      type: "frame", x: mainX, y: ry, width: mainW, height: 48,
      fill: i % 2 === 0 ? "transparent" : "$surface",
      strokeColor: i === 0 ? "$border" : "transparent",
      children: [
        Line(0, 47, mainW, "$border", { opacity: 0.4 }),
        T(ev.ts, mainX + colXs[0], 16, colWidths[0], 16, { size: 10, fill: "$muted", weight: 600 }),
        T(ev.agent, mainX + colXs[1], 16, colWidths[1], 16, { size: 10, fill: "$indigo", weight: 600 }),
        // Event type pill
        Pill(mainX + colXs[2], 14, Math.min(colWidths[2] - 8, ev.event_type.length * 6.5 + 12), 20,
          ev.status === "ERROR" ? "#2A0A0A" : ev.status === "WARN" ? "$amberDim" : "$indigoDim",
          ev.event_type, sc, { size: 7 }),
        T(ev.message, mainX + colXs[3], 16, colWidths[3], 16, { size: 10, fill: "$lav" }),
        T(ev.latency, mainX + colXs[4], 16, colWidths[4], 16, { size: 10, fill: "$lavDim" }),
        T(ev.status, mainX + colXs[5], 16, colWidths[5], 16, { size: 10, weight: 700, fill: sc }),
      ],
    };
  });

  return {
    width: W, height: H,
    fill: "$bg",
    type: "frame",
    name: "D · Activity Feed",
    vars,
    children: [
      sidebar,
      header,
      filterBar,
      tableHeader,
      ...eventRows,
    ],
  };
}

// ── SCREEN 6: Desktop Compliance Report ───────────────────────────────────────
function desktopScreen6() {
  const W = 1440, H = 900;

  const sidebar = R(0, 0, 220, H, "$surface", {
    stroke: "$border", sw: 1,
    children: [
      T("SENTRY", 24, 28, 140, 28, { size: 18, weight: 900, fill: "$lav", ls: 4 }),
      T("Agent Ops", 24, 56, 140, 16, { size: 10, fill: "$lavDim" }),
      Line(16, 80, 188, "$border"),
      ...["Agents", "Alerts", "Activity", "Compliance", "Config"].map((label, i) => {
        const isActive = i === 3;
        const navY = 100 + i * 48;
        return R(12, navY, 196, 36, isActive ? "$indigoDim" : "transparent", {
          r: 8,
          children: [
            T(label, 16, 9, 164, 18, { size: 12, weight: isActive ? 700 : 400, fill: isActive ? "$indigo" : "$lavDim" }),
          ],
        });
      }),
      Line(16, H - 60, 188, "$border"),
      R(24, H - 48, 32, 32, "$indigoDim", {
        r: 8,
        children: [T("JK", 0, 9, 32, 14, { size: 9, weight: 700, fill: "$indigo", align: "center" })],
      }),
      T("j.kim@acme.com", 64, H - 44, 140, 16, { size: 10, fill: "$lavDim" }),
    ],
  });

  const mainX = 236, mainW = W - mainX - 32;

  // Header
  const header = R(mainX, 0, mainW, 64, "transparent", {
    children: [
      T("Compliance Report", mainX, 18, 400, 28, { size: 20, weight: 800, fill: "$lav" }),
      T("PCI-DSS v4.0 · Auto-generated · March 18, 2026", mainX, 44, 400, 16, { size: 10, fill: "$lavDim" }),
      R(W - 200, 18, 152, 36, "$indigo", {
        r: 8,
        children: [T("EXPORT PDF", 0, 10, 152, 16, { size: 10, weight: 700, fill: "$bg", align: "center", ls: 1 })],
      }),
    ],
  });

  // Compliance score bento (top section)
  const scoreCard = Card(mainX, 72, 280, 200, [
    T("COMPLIANCE SCORE", 20, 16, 240, 12, { size: 8, weight: 700, fill: "$muted", ls: 1.5 }),
    // Big score
    T("94", 20, 36, 100, 80, { size: 72, weight: 900, fill: "$lav" }),
    T("%", 122, 60, 30, 40, { size: 24, weight: 900, fill: "$indigo" }),
    T("PCI-DSS compliant", 20, 118, 200, 16, { size: 11, fill: "$green" }),
    T("Last audit: 2026-03-01", 20, 136, 220, 14, { size: 10, fill: "$muted" }),
    // Score bar
    R(20, 160, 240, 8, "$muted", { r: 4 }),
    R(20, 160, 225, 8, "$green", { r: 4 }),
  ]);

  // Rule categories
  const rules = [
    { cat: "Build & Maintain Secure Network", score: 100, color: "$green", issues: 0 },
    { cat: "Protect Cardholder Data", score: 96, color: "$green", issues: 1 },
    { cat: "Vulnerability Management", score: 100, color: "$green", issues: 0 },
    { cat: "Access Control Measures", score: 88, color: "$amber", issues: 2 },
    { cat: "Regular Monitoring & Testing", score: 92, color: "$green", issues: 1 },
    { cat: "Information Security Policy", score: 100, color: "$green", issues: 0 },
  ];

  const rulesCard = Card(mainX + 296, 72, mainW - 296, 200, [
    T("CONTROL REQUIREMENTS", 16, 16, 400, 12, { size: 8, weight: 700, fill: "$muted", ls: 1.5 }),
    ...rules.map((r, i) => {
      const ry = 36 + i * 28;
      const barW = (mainW - 296 - 200) * r.score / 100;
      return {
        type: "frame", x: 0, y: ry, width: mainW - 296, height: 24,
        fill: "transparent",
        children: [
          T(r.cat, 16, 5, mainW - 480, 14, { size: 10, fill: "$lav" }),
          R(mainW - 340, 8, mainW - 480 < 0 ? 100 : 140, 8, "$muted", { r: 4 }),
          R(mainW - 340, 8, Math.max(0, barW * 0.6), 8, r.color, { r: 4 }),
          T(`${r.score}%`, mainW - 186, 5, 40, 14, { size: 10, weight: 700, fill: r.color }),
          T(r.issues > 0 ? `${r.issues} issue${r.issues > 1 ? "s" : ""}` : "✓", mainW - 140, 5, 80, 14, { size: 9, fill: r.issues > 0 ? "$amber" : "$green" }),
        ],
      };
    }),
  ]);

  // Agent-level compliance grid (Evervault-inspired customer card grid)
  const agentCompliance = [
    { name: "GPT-4 Turbo", score: 98, issues: [], role: "Payment classifier" },
    { name: "Claude-3.5", score: 97, issues: [], role: "Fraud detector" },
    { name: "Mistral-7B", score: 72, issues: ["Latency SLA breach", "Scope violation attempt"], role: "Risk scorer" },
    { name: "Llama-3.1", score: 55, issues: ["Repeated timeouts", "PII access denied x3", "Compliance block"], role: "Compliance check" },
    { name: "Cohere R+", score: 95, issues: ["Token budget warning"], role: "KYC verifier" },
    { name: "Phi-3.5", score: 99, issues: [], role: "Chargeback analyst" },
  ];

  const bentoW = (mainW - 48) / 3;
  const bentoH = 180;
  const agentBento = agentCompliance.map((a, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const bx = mainX + col * (bentoW + 16);
    const by = 288 + row * (bentoH + 16);
    const sc = a.score >= 90 ? "$green" : a.score >= 70 ? "$amber" : "$red";
    return Card(bx, by, bentoW, bentoH, [
      T(a.name, 16, 16, bentoW - 80, 18, { size: 13, weight: 700, fill: "$lav" }),
      T(a.role, 16, 36, bentoW - 32, 14, { size: 10, fill: "$lavDim" }),
      // Score ring placeholder
      T(`${a.score}%`, bentoW - 70, 12, 52, 28, { size: 22, weight: 900, fill: sc, align: "right" }),
      // Score bar
      R(16, 60, bentoW - 32, 4, "$muted", { r: 2 }),
      R(16, 60, (bentoW - 32) * a.score / 100, 4, sc, { r: 2 }),
      // Issues
      T(a.issues.length === 0 ? "All controls passing" : `${a.issues.length} active issue${a.issues.length > 1 ? "s" : ""}`,
        16, 76, bentoW - 32, 14, { size: 10, fill: a.issues.length === 0 ? "$green" : "$amber" }),
      ...a.issues.slice(0, 2).map((issue, ii) => ({
        type: "frame", x: 16, y: 96 + ii * 28, width: bentoW - 32, height: 24,
        fill: "$surface", cornerRadius: 6,
        children: [
          Dot(12, 12, 3, "$amber"),
          T(issue, 22, 5, bentoW - 60, 14, { size: 9, fill: "$lav" }),
        ],
      })),
      // Timestamp
      T("Assessed 2h ago", 16, bentoH - 22, bentoW - 32, 14, { size: 9, fill: "$muted" }),
    ]);
  });

  return {
    width: W, height: H,
    fill: "$bg",
    type: "frame",
    name: "D · Compliance",
    vars,
    children: [
      sidebar,
      header,
      scoreCard,
      rulesCard,
      T("AGENT COMPLIANCE OVERVIEW", mainX, 272, 400, 12, { size: 8, weight: 700, fill: "$muted", ls: 1.5 }),
      ...agentBento,
    ],
  };
}

// ── Assemble & write ───────────────────────────────────────────────────────────
function resolveVars(obj, vars) {
  if (typeof obj === 'string') {
    if (obj.startsWith('$')) {
      const key = obj.slice(1);
      return vars[key] ? vars[key].value : obj;
    }
    return obj;
  }
  if (Array.isArray(obj)) return obj.map(item => resolveVars(item, vars));
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = resolveVars(v, vars);
    }
    return out;
  }
  return obj;
}

const screens = [
  mobileScreen1(),
  mobileScreen2(),
  mobileScreen3(),
  desktopScreen4(),
  desktopScreen5(),
  desktopScreen6(),
];

const doc = {
  version: "2.8",
  name: "SENTRY — AI Agent Ops Platform",
  children: screens.map(s => resolveVars(s, vars)),
};

const outPath = path.join(__dirname, 'sentry-app.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log(`✓ Generated sentry-app.pen (${(fs.statSync(outPath).size / 1024).toFixed(0)} KB, ${screens.length} screens)`);
screens.forEach((s, i) => console.log(`  ${i + 1}. ${s.name} — ${s.width}×${s.height}`));
