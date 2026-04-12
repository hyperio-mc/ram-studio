/**
 * designd-app.js
 * "designd." — AI Design Request Service
 * 4 screens: Submit Request / Processing / Design Ready / Request History
 *
 * Inspired by the bold-type + dark-foundation + warm-accent formula
 * seen across Awwwards nominees (Inter Tight typography, #FA5D29-range oranges,
 * card-grid modularity with glassmorphism depth)
 */

const fs = require('fs');

// ── VARIABLES ──────────────────────────────────────────────────────────────────
const vars = {
  bg:        { type: "color", value: "#080810" },
  panel:     { type: "color", value: "#10101c" },
  panelHi:   { type: "color", value: "#14142a" },
  border:    { type: "color", value: "#1c1c32" },
  borderHi:  { type: "color", value: "#2a2a48" },

  // Warm orange accent — Awwwards-inspired
  accent:    { type: "color", value: "#f04e24" },
  accentDim: { type: "color", value: "#2a1008" },
  accentMid: { type: "color", value: "#8a2a10" },

  purple:    { type: "color", value: "#7c6ef5" },
  purpleDim: { type: "color", value: "#1a1640" },
  green:     { type: "color", value: "#00d46a" },
  greenDim:  { type: "color", value: "#002a18" },
  yellow:    { type: "color", value: "#f5b800" },
  yellowDim: { type: "color", value: "#2a2000" },

  text:      { type: "color", value: "#f0f0ff" },
  muted:     { type: "color", value: "#606080" },
  subtle:    { type: "color", value: "#404060" },
  white:     { type: "color", value: "#ffffff" },
};

const W = 375;
const H = 812;

// ── HELPERS ────────────────────────────────────────────────────────────────────
const T = (content, x, y, w, h, o = {}) => ({
  type: "text", content, x, y, width: w, height: h,
  textGrowth: "fixed-width-height",
  fontSize: o.size || 13,
  fontWeight: String(o.weight || 400),
  fill: o.fill || "$text",
  textAlign: o.align || "left",
  ...(o.ls ? { letterSpacing: o.ls } : {}),
  ...(o.lh ? { lineHeight: o.lh } : {}),
  ...(o.mono ? { fontFamily: "Courier New, monospace" } : {}),
  ...(o.op !== undefined ? { opacity: o.op } : {}),
});

const F = (x, y, w, h, fill, o = {}) => ({
  type: "frame", x, y, width: w, height: h,
  fill: fill || "#00000000",
  ...(o.r !== undefined ? { cornerRadius: o.r } : {}),
  ...(o.clip ? { clip: true } : {}),
  ...(o.stroke ? { stroke: { align: "inside", thickness: o.sw || 1, fill: o.stroke } } : {}),
  ...(o.op !== undefined ? { opacity: o.op } : {}),
  children: o.ch || [],
});

const E = (x, y, w, h, fill, o = {}) => ({
  type: "ellipse", x, y, width: w, height: h,
  fill: fill || "#00000000",
  ...(o.stroke ? { stroke: { align: "inside", thickness: o.sw || 1, fill: o.stroke } } : {}),
  ...(o.op !== undefined ? { opacity: o.op } : {}),
});

const R = (x, y, w, h, fill, r = 0) => ({
  type: "rectangle", x, y, width: w, height: h,
  fill: fill || "#00000000",
  ...(r ? { cornerRadius: r } : {}),
});

// ── SHARED COMPONENTS ─────────────────────────────────────────────────────────

// Top nav bar: "designd." + right element
const Nav = (rightEl) => F(0, 0, W, 52, "$panel", {
  stroke: "$border", sw: 1,
  ch: [
    T("designd.", 20, 16, 120, 22, { size: 16, weight: 700, fill: "$accent" }),
    ...(rightEl ? [rightEl] : []),
  ],
});

// Status pill badge
const Pill = (x, y, label, bg, color, dotColor) => F(x, y, label.length * 7 + 28, 22, bg, {
  r: 11,
  ch: [
    ...(dotColor ? [E(10, 7, 8, 8, dotColor)] : []),
    T(label, dotColor ? 22 : 8, 4, label.length * 7 + 4, 14, { size: 10, weight: 700, fill: color, ls: 0.3 }),
  ],
});

// Type tag chip
const TypeTag = (x, y, label) => F(x, y, label.length * 7 + 16, 24, "$purpleDim", {
  r: 6,
  stroke: "$purple", sw: 1,
  ch: [T(label, 8, 5, label.length * 7, 14, { size: 10, weight: 600, fill: "$purple", ls: 0.3 })],
});

// Divider line
const Div = (x, y, w) => R(x, y, w, 1, "$border");

// Bottom navigation bar
const BottomNav = () => F(0, H - 56, W, 56, "$panel", {
  stroke: "$border", sw: 1,
  ch: [
    // New Request (active)
    F(16, 8, 72, 40, "$accentDim", {
      r: 10,
      ch: [
        T("+", 28, 4, 16, 20, { size: 16, weight: 700, fill: "$accent", align: "center" }),
        T("New", 20, 22, 32, 12, { size: 9, weight: 600, fill: "$accent", align: "center" }),
      ],
    }),
    // Queue
    F(W / 2 - 30, 8, 60, 40, "#00000000", {
      ch: [
        T("≡", 22, 4, 16, 20, { size: 16, weight: 400, fill: "$muted", align: "center" }),
        T("Queue", 8, 22, 44, 12, { size: 9, weight: 500, fill: "$muted", align: "center" }),
      ],
    }),
    // History
    F(W - 88, 8, 72, 40, "#00000000", {
      ch: [
        T("⊙", 28, 4, 16, 20, { size: 14, weight: 400, fill: "$muted", align: "center" }),
        T("History", 8, 22, 56, 12, { size: 9, weight: 500, fill: "$muted", align: "center" }),
      ],
    }),
  ],
});

// ── SCREEN 1: SUBMIT REQUEST ───────────────────────────────────────────────────
const screen1 = {
  type: "frame", name: "designd — New Request",
  x: 0, y: 0, width: W, height: H,
  fill: "$bg", clip: true,
  children: [
    // Subtle glow top-right
    E(W - 60, -40, 180, 180, "#f04e2412"),

    Nav(T("2 pending", W - 80, 16, 72, 20, { size: 11, weight: 600, fill: "$muted", align: "right" })),

    // Headline
    T("Describe your\ndesign.", 20, 72, W - 40, 72, { size: 28, weight: 800, fill: "$text", lh: 1.15 }),
    T("AI will generate a pencil.dev file from your prompt.", 20, 152, W - 40, 32, { size: 12, fill: "$muted", lh: 1.5 }),

    // Prompt input area
    F(20, 196, W - 40, 100, "$panel", {
      r: 14, stroke: "$borderHi", sw: 1,
      ch: [
        T("E.g. \"A dark fintech dashboard with charts,\nportfolio overview and transaction history\"", 16, 14, W - 72, 56, { size: 12, fill: "$subtle", lh: 1.6 }),
        T("140 chars", W - 88, 74, 72, 14, { size: 10, fill: "$subtle", align: "right" }),
      ],
    }),

    // Platform label
    T("PLATFORM", 20, 312, 100, 14, { size: 10, weight: 700, fill: "$muted", ls: 1 }),

    // Platform pills
    F(20, 332, 80, 32, "$accentDim", { r: 8, stroke: "$accent", sw: 1, ch: [T("Mobile", 0, 8, 80, 16, { size: 12, weight: 600, fill: "$accent", align: "center" })] }),
    F(108, 332, 60, 32, "$panel", { r: 8, stroke: "$border", sw: 1, ch: [T("Web", 0, 8, 60, 16, { size: 12, weight: 500, fill: "$muted", align: "center" })] }),
    F(176, 332, 84, 32, "$panel", { r: 8, stroke: "$border", sw: 1, ch: [T("Dashboard", 0, 8, 84, 16, { size: 12, weight: 500, fill: "$muted", align: "center" })] }),
    F(268, 332, 88, 32, "$panel", { r: 8, stroke: "$border", sw: 1, ch: [T("Landing Pg", 0, 8, 88, 16, { size: 12, weight: 500, fill: "$muted", align: "center" })] }),

    // Style label
    T("VIBE", 20, 380, 60, 14, { size: 10, weight: 700, fill: "$muted", ls: 1 }),

    // Vibe chips row 1
    ...["Dark", "Minimal", "Neon", "Brutalist"].reduce((acc, label, i) => {
      const chip = F(20 + i * 82, 396, 76, 28, i === 0 ? "$accentDim" : "$panel", {
        r: 14, stroke: i === 0 ? "$accent" : "$border", sw: 1,
        ch: [T(label, 0, 6, 76, 16, { size: 11, weight: i === 0 ? 600 : 400, fill: i === 0 ? "$accent" : "$muted", align: "center" })],
      });
      acc.push(chip); return acc;
    }, []),

    // Vibe chips row 2
    ...["Glassmorphism", "Retro", "Pastel"].reduce((acc, label, i) => {
      const w = label.length * 7 + 20;
      const chip = F(20 + (i === 0 ? 0 : i === 1 ? 146 : 224), 432, w, 28, "$panel", {
        r: 14, stroke: "$border", sw: 1,
        ch: [T(label, 0, 6, w, 16, { size: 11, fill: "$muted", align: "center" })],
      });
      acc.push(chip); return acc;
    }, []),

    // Screens count
    T("SCREENS", 20, 476, 80, 14, { size: 10, weight: 700, fill: "$muted", ls: 1 }),
    F(20, 496, 140, 36, "$panel", {
      r: 10, stroke: "$border",
      ch: [
        T("−", 12, 8, 20, 20, { size: 16, weight: 400, fill: "$muted", align: "center" }),
        T("4", 60, 8, 20, 20, { size: 14, weight: 700, fill: "$text", align: "center" }),
        T("+", 108, 8, 20, 20, { size: 16, weight: 400, fill: "$muted", align: "center" }),
      ],
    }),
    T("screens", 168, 504, 60, 20, { size: 12, fill: "$subtle" }),

    Div(20, 548, W - 40),

    // Submit CTA
    F(20, 564, W - 40, 52, "$accent", {
      r: 14,
      ch: [
        T("Generate Design →", 0, 16, W - 40, 22, { size: 15, weight: 700, fill: "$white", align: "center" }),
      ],
    }),

    T("Usually ready in 60–90 seconds", 0, 628, W, 16, { size: 11, fill: "$subtle", align: "center" }),

    BottomNav(),
  ],
};

// ── SCREEN 2: PROCESSING ────────────────────────────────────────────────────────
const screen2 = {
  type: "frame", name: "designd — Processing",
  x: 425, y: 0, width: W, height: H,
  fill: "$bg", clip: true,
  children: [
    // Orange glow center
    E(W / 2 - 80, 180, 160, 160, "#f04e2420"),

    Nav(Pill(W - 110, 15, "PROCESSING", "$accentDim", "$accent", "$accent")),

    T("Generating\nyour design.", 20, 72, W - 40, 72, { size: 28, weight: 800, fill: "$text", lh: 1.15 }),

    // Request summary card
    F(20, 152, W - 40, 72, "$panel", {
      r: 12, stroke: "$border",
      ch: [
        T("\"Dark fintech dashboard with charts,\nportfolio overview...\"", 12, 12, W - 80, 36, { size: 11, fill: "$muted", lh: 1.5 }),
        TypeTag(12, 54, "MOBILE"),
        T("4 screens", 72, 56, 80, 14, { size: 10, fill: "$subtle" }),
        T("#D4F2", W - 88, 56, 56, 14, { size: 10, fill: "$subtle", align: "right", mono: true }),
      ],
    }),

    // Progress steps
    T("PROGRESS", 20, 244, 100, 14, { size: 10, weight: 700, fill: "$muted", ls: 1 }),

    ...[
      { label: "Interpreting prompt", done: true },
      { label: "Generating screens",  done: false, active: true },
      { label: "Applying styles",      done: false },
      { label: "Polishing & fixing",   done: false },
    ].map((step, i) => {
      const y = 264 + i * 52;
      const dotFill = step.done ? "$green" : step.active ? "$accent" : "$subtle";
      const lineColor = i < 3 ? (step.done ? "$green" : "$border") : "#00000000";
      return F(20, y, W - 40, 44, "#00000000", {
        ch: [
          // Dot
          E(0, 8, 20, 20, dotFill),
          // Connector line down (except last)
          ...(i < 3 ? [R(9, 28, 2, 24, lineColor)] : []),
          // Label
          T(step.label, 28, 10, W - 100, 18, { size: 13, weight: step.done || step.active ? 600 : 400, fill: step.done ? "$text" : step.active ? "$accent" : "$muted" }),
          // Status
          ...(step.done ? [T("✓ done", W - 80, 10, 64, 18, { size: 11, weight: 600, fill: "$green", align: "right" })] : []),
          ...(step.active ? [
            // Pulsing indicator
            F(W - 90, 6, 72, 26, "$accentDim", {
              r: 13,
              ch: [T("● working", 0, 6, 72, 14, { size: 10, weight: 600, fill: "$accent", align: "center" })],
            }),
          ] : []),
        ],
      });
    }),

    Div(20, 480, W - 40),

    // ETA
    F(20, 496, W - 40, 60, "$panel", {
      r: 12, stroke: "$border",
      ch: [
        T("Estimated time remaining", 16, 12, W - 100, 16, { size: 12, fill: "$muted" }),
        T("~45 sec", 16, 32, 80, 20, { size: 20, weight: 700, fill: "$text" }),
        F(W - 80, 20, 56, 24, "$greenDim", {
          r: 8,
          ch: [T("FAST", 0, 5, 56, 14, { size: 10, weight: 700, fill: "$green", align: "center" })],
        }),
      ],
    }),

    // Cancel
    T("Cancel request", 0, 576, W, 20, { size: 12, fill: "$subtle", align: "center" }),

    BottomNav(),
  ],
};

// ── SCREEN 3: DESIGN READY ──────────────────────────────────────────────────────
const screen3 = {
  type: "frame", name: "designd — Design Ready",
  x: 850, y: 0, width: W, height: H,
  fill: "$bg", clip: true,
  children: [
    // Big green glow
    E(W / 2 - 100, 60, 200, 200, "#00d46a18"),

    Nav(Pill(W - 90, 15, "READY", "$greenDim", "$green", "$green")),

    // Success headline
    F(W / 2 - 40, 76, 80, 80, "$greenDim", {
      r: 40,
      ch: [T("✓", 0, 22, 80, 36, { size: 28, weight: 700, fill: "$green", align: "center" })],
    }),

    T("Design ready!", 0, 168, W, 32, { size: 24, weight: 800, fill: "$text", align: "center" }),
    T("Your pencil.dev file is waiting.", 0, 204, W, 20, { size: 13, fill: "$muted", align: "center" }),

    // Design preview card
    F(20, 240, W - 40, 160, "$panel", {
      r: 16, stroke: "$borderHi",
      ch: [
        // Mini screen previews (4 colored blocks)
        ...[ ["$accentDim", "$accent"], ["$purpleDim", "$purple"], ["$greenDim", "$green"], ["$yellowDim", "$yellow"] ]
          .map(([bg, acc], i) =>
            F(12 + i * 72, 12, 64, 88, bg, {
              r: 8, stroke: acc, sw: 1,
              ch: [
                R(8, 8, 48, 8, acc, 2),
                R(8, 22, 36, 5, acc, 2),
                R(8, 32, 28, 5, acc, 2),
                R(8, 44, 48, 24, acc, 4),
                R(8, 74, 48, 6, acc, 2),
              ],
            })
          ),
        T("Dark Fintech Dashboard", 12, 112, W - 80, 16, { size: 12, weight: 700 }),
        T("4 screens · pencil.dev v2.8 · 48 KB", 12, 132, W - 40, 14, { size: 10, fill: "$muted" }),
        TypeTag(12, 148, "MOBILE"),
        T("gen time: 67s", W - 96, 150, 72, 14, { size: 10, fill: "$subtle", align: "right" }),
      ],
    }),

    // Download button
    F(20, 420, W - 40, 52, "$accent", {
      r: 14,
      ch: [T("⬇  Download .pen file", 0, 16, W - 40, 22, { size: 15, weight: 700, fill: "$white", align: "center" })],
    }),

    // Secondary actions
    F(20, 484, (W - 52) / 2, 44, "$panel", {
      r: 12, stroke: "$border",
      ch: [T("View preview", 0, 13, (W - 52) / 2, 18, { size: 13, weight: 500, fill: "$muted", align: "center" })],
    }),
    F(20 + (W - 52) / 2 + 12, 484, (W - 52) / 2, 44, "$panel", {
      r: 12, stroke: "$border",
      ch: [T("Share link", 0, 13, (W - 52) / 2, 18, { size: 13, weight: 500, fill: "$muted", align: "center" })],
    }),

    Div(20, 548, W - 40),

    // Request another
    F(20, 564, W - 40, 44, "$panelHi", {
      r: 12, stroke: "$border",
      ch: [T("+ Request another design", 0, 13, W - 40, 18, { size: 13, weight: 600, fill: "$purple", align: "center" })],
    }),

    BottomNav(),
  ],
};

// ── SCREEN 4: REQUEST HISTORY ──────────────────────────────────────────────────
const screen4 = {
  type: "frame", name: "designd — History",
  x: 1275, y: 0, width: W, height: H,
  fill: "$bg", clip: true,
  children: [
    Nav(T("12 total", W - 72, 16, 56, 20, { size: 11, weight: 600, fill: "$muted", align: "right" })),

    T("Your designs.", 20, 64, W - 40, 36, { size: 26, weight: 800, fill: "$text" }),

    // Filter tabs
    F(20, 108, 250, 32, "$panel", {
      r: 8, stroke: "$border",
      ch: [
        F(2, 2, 60, 28, "$accentDim", { r: 6, ch: [T("All", 0, 7, 60, 14, { size: 11, weight: 700, fill: "$accent", align: "center" })] }),
        T("Mobile", 70, 8, 52, 16, { size: 11, fill: "$muted", align: "center" }),
        T("Web", 130, 8, 40, 16, { size: 11, fill: "$muted", align: "center" }),
        T("Dash", 178, 8, 40, 16, { size: 11, fill: "$muted", align: "center" }),
        T("Land", 222, 8, 40, 16, { size: 11, fill: "$muted", align: "center" }),
      ],
    }),

    // Stats strip
    F(20, 152, W - 40, 44, "$panel", {
      r: 10, stroke: "$border",
      ch: [
        T("12 generated", 16, 12, 120, 20, { size: 12, weight: 600, fill: "$text" }),
        R((W - 40) / 2 - 1, 8, 1, 28, "$border"),
        T("avg 71s", (W - 40) / 2 + 16, 12, 100, 20, { size: 12, weight: 600, fill: "$text" }),
        R((W - 40) * 0.75 - 1, 8, 1, 28, "$border"),
        T("4.8 ★", (W - 40) * 0.75 + 16, 12, 60, 20, { size: 12, weight: 600, fill: "$yellow" }),
      ],
    }),

    // Design cards
    ...[
      { title: "Dark Fintech Dashboard", type: "MOBILE", status: "READY",      statusBg: "$greenDim",  statusColor: "$green",  dot: "$green",  time: "2h ago",  accent: "$accent" },
      { title: "SaaS Landing — Light",   type: "WEB",    status: "READY",      statusBg: "$greenDim",  statusColor: "$green",  dot: "$green",  time: "5h ago",  accent: "$purple" },
      { title: "Crypto Portfolio App",   type: "MOBILE", status: "PROCESSING", statusBg: "$accentDim", statusColor: "$accent", dot: "$accent", time: "just now", accent: "$yellow" },
      { title: "Admin Dashboard",        type: "DASH",   status: "READY",      statusBg: "$greenDim",  statusColor: "$green",  dot: "$green",  time: "1d ago",  accent: "$green" },
    ].map((item, i) =>
      F(20, 212 + i * 100, W - 40, 88, "$panel", {
        r: 12, stroke: "$border",
        ch: [
          // Color swatch
          F(12, 16, 56, 56, item.accentDim || "$panelHi", {
            r: 10,
            ch: [
              R(8, 8, 40, 6, item.accent, 2),
              R(8, 20, 28, 4, item.accent, 2),
              R(8, 30, 40, 16, item.accent, 4),
            ],
          }),
          T(item.title, 80, 16, W - 140, 18, { size: 13, weight: 700 }),
          TypeTag(80, 38, item.type),
          T(item.time, W - 88, 16, 64, 14, { size: 10, fill: "$subtle", align: "right" }),
          Pill(80, 62, item.status, item.statusBg, item.statusColor, item.dot),
        ],
      })
    ),

    BottomNav(),
  ],
};

// ── ASSEMBLE & WRITE ──────────────────────────────────────────────────────────
const pen = {
  version: "2.8",
  variables: vars,
  children: [screen1, screen2, screen3, screen4],
};

const out = '/workspace/group/design-studio/designd-app.pen';
fs.writeFileSync(out, JSON.stringify(pen, null, 2));
const size = fs.statSync(out).size;
console.log(`✓ designd-app.pen written — ${(size / 1024).toFixed(1)} KB`);
console.log(`  Screens: ${pen.children.map(s => s.name).join(' | ')}`);
