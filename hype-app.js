// hype-app.js
// "HYPE" — Gen Z Peer-to-Peer Payment App
// Inspired by:
//   - OWO's expressive warm cream + hot pink + electric yellow palette (lapa.ninja, Mar 2026)
//     https://owo.app — "Send money like you chat, with Owo" — bg #FFF8DC + pink #FF009D + yellow #FFF527
//   - Midday.ai's "new wave of one-person companies" positioning (darkmodedesign.com)
//   - Lusion.co's kinetic split typography (godly.website)
// Challenge: Light-mode, expressionist fintech contrasting the dominant dark SaaS trend.
//   Cream backgrounds, hot pink + electric yellow accents, oversized display type, bento grid.
// Palette: #FAF0D0 warm cream + #FF0099 hot pink + #FFE500 electric yellow + #15000C deep ink
// pencil.dev v2.8

'use strict';
const fs = require('fs');

// ── VARIABLES ─────────────────────────────────────────────────────────────────
const vars = {
  bg:        { type: "color", value: "#FAF0D0" },
  surface:   { type: "color", value: "#FFF8E8" },
  card:      { type: "color", value: "#FFFFFF" },
  border:    { type: "color", value: "#E8D8A0" },
  border2:   { type: "color", value: "#D4C080" },
  pink:      { type: "color", value: "#FF0099" },
  pinkDim:   { type: "color", value: "#FFE0F4" },
  pinkMid:   { type: "color", value: "#FFB3E0" },
  yellow:    { type: "color", value: "#FFE500" },
  yellowDim: { type: "color", value: "#FFF9C0" },
  green:     { type: "color", value: "#00C47A" },
  greenDim:  { type: "color", value: "#C0FFE8" },
  ink:       { type: "color", value: "#15000C" },
  muted:     { type: "color", value: "#7A5A30" },
  dim:       { type: "color", value: "#EBD8A8" },
};

// ── PRIMITIVES ────────────────────────────────────────────────────────────────
const T = (content, x, y, w, h, opts = {}) => ({
  type: "text", content, x, y, width: w, height: h,
  fontSize: opts.size || 14,
  fontWeight: opts.weight || 400,
  fill: opts.fill || "$ink",
  textAlign: opts.align || "left",
  letterSpacing: opts.ls !== undefined ? opts.ls : undefined,
  lineHeight: opts.lh,
  opacity: opts.opacity,
  fontFamily: opts.display
    ? "'Helvetica Neue', Arial Black, 'Arial', sans-serif"
    : undefined,
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
  children: label ? [T(label, 0, 0, w, h, {
    size: opts.size || 10, weight: 700,
    fill: textFill || "$bg", align: "center",
    ls: opts.ls !== undefined ? opts.ls : 0.5,
  })] : [],
});

const Dot = (x, y, r, fill, stroke) => ({
  type: "ellipse", x: x - r, y: y - r, width: r * 2, height: r * 2,
  fill: fill || "transparent", strokeColor: stroke, strokeWidth: 1,
});

const Avatar = (x, y, r, initials, fill, textFill) => ({
  type: "frame", x: x - r, y: y - r, width: r * 2, height: r * 2,
  fill, cornerRadius: r,
  children: [T(initials, 0, 0, r * 2, r * 2, { size: r * 0.7, weight: 800, fill: textFill || "$ink", align: "center" })],
});

const Line = (x, y, w, color, h = 1) => R(x, y, w, h, color);

// ── STATUS BAR (light) ─────────────────────────────────────────────────────
const statusBar = (bg) => R(0, 0, 390, 44, bg || "$bg", {
  children: [
    T("9:41", 20, 14, 50, 18, { size: 13, weight: 600, fill: "$ink" }),
    T("●●  ▲  ■", 300, 14, 70, 18, { size: 9, weight: 500, fill: "$muted", align: "right" }),
  ],
});

// ── BOTTOM NAV ──────────────────────────────────────────────────────────────
const bottomNav = (active) => {
  const items = [
    { icon: "⌂", label: "Home",    id: 0 },
    { icon: "↗", label: "Send",    id: 1 },
    { icon: "↓", label: "Request", id: 2 },
    { icon: "◎", label: "Profile", id: 3 },
  ];
  return R(0, 796, 390, 48, "$card", {
    stroke: "$border", sw: 1,
    children: [
      ...items.map((it) =>
        R(it.id * 97, 0, 97, 48, "transparent", {
          children: [
            T(it.icon, 0, 6, 97, 20, { size: 18, fill: it.id === active ? "$pink" : "$muted", align: "center" }),
            T(it.label, 0, 28, 97, 16, { size: 9, weight: 700, fill: it.id === active ? "$pink" : "$muted", align: "center", ls: 0.5 }),
          ],
        })
      ),
      // Active indicator
      R(active * 97 + 36, 44, 24, 3, "$pink", { r: 2, children: [] }),
    ],
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Desktop: Hero Landing (1440×900)
// ═══════════════════════════════════════════════════════════════════════════
const DW = 1440, DH = 900;
const desktop_hero = {
  type: "frame", name: "01 · Landing Hero (Desktop)",
  x: 0, y: 0, width: DW, height: DH,
  fill: "$bg",
  children: [
    // Nav
    R(0, 0, DW, 64, "$bg", {
      stroke: "$border", sw: 1,
      children: [
        // Logo
        R(48, 18, 36, 28, "$pink", {
          r: 6, children: [T("H", 0, 0, 36, 28, { size: 16, weight: 900, fill: "$bg", align: "center" })],
        }),
        T("HYPE", 92, 18, 80, 28, { size: 20, weight: 900, fill: "$ink", ls: -1 }),
        // Nav links
        T("Product", 320, 22, 80, 20, { size: 13, fill: "$muted" }),
        T("Pricing", 410, 22, 70, 20, { size: 13, fill: "$muted" }),
        T("Blog", 490, 22, 60, 20, { size: 13, fill: "$muted" }),
        // CTAs
        R(1216, 16, 108, 32, "$pink", {
          r: 8, children: [T("GET HYPE", 0, 0, 108, 32, { size: 11, weight: 800, fill: "$bg", align: "center", ls: 1 })],
        }),
        T("Log in", 1148, 22, 60, 20, { size: 13, fill: "$ink" }),
      ],
    }),

    // Hero: left column
    R(48, 100, 700, 700, "transparent", {
      children: [
        // Kicker pill
        Pill(0, 0, 180, 28, "$yellowDim", "✦ BUILT FOR THE BOLD", "$ink", { size: 9, ls: 1.5 }),
        // Massive headline — split-color inspired by Lusion.co
        T("MOVE", 0, 40, 700, 130, { size: 136, weight: 900, fill: "$ink", ls: -6, lh: 1, display: true }),
        T("MONEY.", 0, 160, 700, 130, { size: 136, weight: 900, fill: "$pink", ls: -6, lh: 1, display: true }),
        T("MAKE", 0, 280, 700, 130, { size: 136, weight: 900, fill: "$ink", ls: -6, lh: 1, display: true }),
        T("HYPE.", 0, 400, 700, 130, { size: 136, weight: 900, fill: "$yellow", ls: -6, lh: 1, display: true }),

        T("Send money like you chat. Split instantly.\nPay forward. No fees. No friction. All fun.", 0, 548, 560, 52, { size: 17, fill: "$muted", lh: 1.6 }),

        // CTA row
        R(0, 620, 220, 60, "$ink", {
          r: 12, children: [T("START FOR FREE →", 0, 0, 220, 60, { size: 13, weight: 800, fill: "$bg", align: "center" })],
        }),
        R(236, 620, 200, 60, "$yellow", {
          r: 12, children: [T("WATCH DEMO ▶", 0, 0, 200, 60, { size: 13, weight: 800, fill: "$ink", align: "center" })],
        }),

        T("4.9 ★ on App Store · 600k+ transactions/day · $0 fees", 0, 698, 500, 20, { size: 11, fill: "$muted", ls: 0.3 }),
      ],
    }),

    // Hero: right — app phone mockup bento grid (cards)
    R(800, 80, 600, 780, "transparent", {
      children: [
        // Big balance card
        R(0, 0, 580, 220, "$pink", {
          r: 24,
          children: [
            T("YOUR BALANCE", 28, 24, 300, 16, { size: 9, weight: 700, fill: "$bg", ls: 2, opacity: 0.7 }),
            T("$2,480.00", 28, 50, 420, 80, { size: 68, weight: 900, fill: "$bg", ls: -3, lh: 1, display: true }),
            T("+$340 this week  ↑", 28, 134, 300, 20, { size: 13, fill: "$pinkDim" }),
            // Card chip
            R(476, 24, 80, 48, "$pinkMid", { r: 8, children: [T("HYPE\nVISA", 10, 4, 60, 40, { size: 10, weight: 700, fill: "$bg", lh: 1.4 })] }),
            // Card number dots
            T("•••• •••• •••• 4291", 28, 168, 300, 24, { size: 13, weight: 600, fill: "$pinkDim", ls: 2 }),
          ],
        }),

        // Quick-actions strip
        ...([
          { icon: "↗", label: "SEND",    fill: "$yellow",   text: "$ink" },
          { icon: "↓", label: "REQUEST", fill: "$ink",      text: "$bg" },
          { icon: "⇌", label: "SPLIT",   fill: "$green",    text: "$bg" },
          { icon: "☆", label: "REWARDS", fill: "$pinkDim",  text: "$pink" },
        ].map((a, i) => R(i * 147, 232, 137, 80, a.fill, {
          r: 16,
          children: [
            T(a.icon, 20, 14, 40, 32, { size: 22, fill: a.text }),
            T(a.label, 0, 50, 137, 16, { size: 9, weight: 700, fill: a.text, align: "center", ls: 1.5 }),
          ],
        }))),

        // Feed header
        T("RECENT ACTIVITY", 0, 330, 300, 16, { size: 9, weight: 700, fill: "$muted", ls: 2 }),

        // Transaction tiles (bento)
        ...([
          { from: "Jordan M.", msg: "dinner @ Nobu 🍣", amt: "+$48.50", fill: "$card", tag: "food", accent: "$green" },
          { from: "Sam K.",    msg: "uber pool split 🚗", amt: "-$12.00", fill: "$yellowDim", tag: "transport", accent: "$yellow" },
          { from: "Taylor R.", msg: "concert tix 🎵",   amt: "+$80.00", fill: "$pinkDim",   tag: "fun", accent: "$pink" },
          { from: "Alex P.",   msg: "groceries 🛒",     amt: "-$34.20", fill: "$card",      tag: "food", accent: "$green" },
        ].map((tx, i) => R(0, 356 + i * 86, 580, 76, tx.fill, {
          r: 14, stroke: "$border", sw: 1,
          children: [
            // Avatar
            Avatar(36, 38, 22, tx.from.slice(0, 2).toUpperCase(), tx.accent === "$green" ? "$greenDim" : tx.accent === "$pink" ? "$pinkDim" : "$yellowDim", "$ink"),
            T(tx.from, 68, 12, 280, 20, { size: 13, weight: 700, fill: "$ink" }),
            T(tx.msg, 68, 34, 280, 18, { size: 11, fill: "$muted" }),
            T(tx.amt, 460, 18, 110, 24, {
              size: 18, weight: 800,
              fill: tx.amt.startsWith("+") ? "$green" : "$ink",
              align: "right",
            }),
            Pill(480, 46, 90, 20, tx.accent === "$green" ? "$greenDim" : tx.accent === "$pink" ? "$pinkDim" : "$yellowDim",
              tx.tag.toUpperCase(), tx.accent === "$green" ? "$green" : tx.accent, { size: 8, ls: 1 }),
          ],
        }))),
      ],
    }),

    // Social proof
    R(0, 854, DW, 46, "$dim", {
      children: [
        T("Trusted by 600k+ bold people  ·  ★ 4.9 App Store  ·  Zero fees always  ·  Bank-grade security  ·  Instant transfers  ·  Split anything", DW / 2 - 450, 14, 900, 18, { size: 11, fill: "$muted", align: "center", ls: 0.5 }),
      ],
    }),
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Mobile: Onboarding (390×844)
// ═══════════════════════════════════════════════════════════════════════════
const MW = 390, MH = 844;
const mobile_onboarding = {
  type: "frame", name: "02 · Onboarding (Mobile)",
  x: 1480, y: 0, width: MW, height: MH,
  fill: "$ink",
  children: [
    statusBar("$ink"),

    // Big kinetic headline — Lusion-inspired split type
    T("MONEY", 32, 80, 340, 100, { size: 88, weight: 900, fill: "$yellow", ls: -4, lh: 1, display: true }),
    T("MOVES", 32, 170, 340, 100, { size: 88, weight: 900, fill: "$bg", ls: -4, lh: 1, display: true }),
    T("WITH", 32, 260, 340, 100, { size: 88, weight: 900, fill: "$bg", ls: -4, lh: 1, display: true }),
    T("YOU.", 32, 350, 340, 100, { size: 88, weight: 900, fill: "$pink", ls: -4, lh: 1, display: true }),

    T("Split bills. Pay friends. Collect your share.\nZero fees. Instant. Bold.", 32, 476, 326, 52, { size: 15, fill: "$muted", lh: 1.6 }),

    // CTA button
    R(32, 548, MW - 64, 60, "$pink", {
      r: 14,
      children: [T("CREATE FREE ACCOUNT →", 0, 0, MW - 64, 60, { size: 14, weight: 800, fill: "$bg", align: "center" })],
    }),
    R(32, 622, MW - 64, 56, "transparent", {
      r: 14, stroke: "$border2", sw: 1,
      children: [T("LOG IN", 0, 0, MW - 64, 56, { size: 14, weight: 800, fill: "$bg", align: "center", ls: 1 })],
    }),

    // Onboarding steps progress
    R(32, 704, 326, 2, "$muted", { r: 1, children: [R(0, 0, 108, 2, "$pink", { r: 1, children: [] })] }),
    T("1 OF 3", 32, 716, 100, 16, { size: 9, weight: 700, fill: "$muted", ls: 2 }),

    // Social proof strip
    T("600k+ users  ·  4.9★  ·  $0 fees", 0, 748, MW, 16, { size: 10, fill: "$muted", align: "center", ls: 0.5 }),

    // Bottom indicator
    R(MW / 2 - 60, 812, 120, 4, "$muted", { r: 2, children: [] }),
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Mobile: Home / Wallet (390×844)
// ═══════════════════════════════════════════════════════════════════════════
const mobile_home = {
  type: "frame", name: "03 · Home / Wallet (Mobile)",
  x: 1900, y: 0, width: MW, height: MH,
  fill: "$bg",
  children: [
    statusBar(),

    // Greeting
    T("Hey, Jordan 👋", 24, 52, 300, 24, { size: 18, weight: 700, fill: "$ink" }),
    Pill(306, 54, 60, 24, "$pink", "HYPE+", "$bg", { size: 9, ls: 1 }),
    T("Thursday, March 19", 24, 82, 200, 16, { size: 11, fill: "$muted" }),

    // Balance card
    R(20, 106, MW - 40, 170, "$pink", {
      r: 24,
      children: [
        T("TOTAL BALANCE", 24, 20, 280, 14, { size: 9, weight: 700, fill: "$bg", ls: 2, opacity: 0.7 }),
        T("$2,480.00", 24, 42, 310, 72, { size: 58, weight: 900, fill: "$bg", ls: -3, lh: 1, display: true }),
        T("+$340 this week", 24, 122, 200, 18, { size: 11, fill: "$pinkDim" }),
        // Mini chart line (fake)
        R(248, 100, 100, 40, "$pinkMid", {
          r: 8, opacity: 0.5,
          children: [T("↗", 30, 6, 40, 28, { size: 22, fill: "$bg", align: "center" })],
        }),
      ],
    }),

    // Quick action buttons
    T("QUICK ACTIONS", 24, 292, 200, 14, { size: 9, weight: 700, fill: "$muted", ls: 2 }),
    ...([
      { icon: "↗", label: "Send",    fill: "$yellow", text: "$ink" },
      { icon: "↓", label: "Request", fill: "$ink",    text: "$bg"  },
      { icon: "⇌", label: "Split",   fill: "$pinkDim", text: "$pink" },
    ].map((a, i) => R(24 + i * 113, 312, 103, 80, a.fill, {
      r: 16,
      children: [
        T(a.icon, 0, 12, 103, 32, { size: 24, fill: a.text, align: "center" }),
        T(a.label, 0, 48, 103, 18, { size: 11, weight: 700, fill: a.text, align: "center", ls: 0.5 }),
      ],
    }))),

    // Friend payment shortcuts
    T("SEND AGAIN", 24, 408, 200, 14, { size: 9, weight: 700, fill: "$muted", ls: 2 }),
    ...([
      { initials: "JO", name: "Jordan", fill: "$yellowDim" },
      { initials: "SA", name: "Sam",    fill: "$pinkDim"   },
      { initials: "TA", name: "Taylor", fill: "$greenDim"  },
      { initials: "AL", name: "Alex",   fill: "$dim"       },
      { initials: "+",  name: "More",   fill: "$surface"   },
    ].map((f, i) => R(24 + i * 70, 428, 60, 72, "transparent", {
      children: [
        Avatar(30, 22, 22, f.initials, f.fill, "$ink"),
        T(f.name, 0, 50, 60, 16, { size: 10, fill: "$ink", align: "center", weight: 500 }),
      ],
    }))),

    // Recent transactions
    T("RECENT", 24, 512, 200, 14, { size: 9, weight: 700, fill: "$muted", ls: 2 }),
    Line(24, 530, MW - 48, "$border"),

    ...([
      { from: "Jordan M.", msg: "dinner @ Nobu 🍣",    amt: "+$48.50", fill: "$greenDim",  acc: "$green" },
      { from: "Sam K.",    msg: "uber pool 🚗",         amt: "-$12.00", fill: "$yellowDim", acc: "$muted" },
      { from: "Taylor R.", msg: "concert tix 🎵",       amt: "+$80.00", fill: "$pinkDim",   acc: "$pink"  },
      { from: "HYPE+",     msg: "cashback reward ⭐",   amt: "+$5.00",  fill: "$yellowDim", acc: "$yellow" },
    ].map((tx, i) => R(20, 536 + i * 62, MW - 40, 54, "$card", {
      r: 12, stroke: "$border", sw: 1,
      children: [
        Avatar(28, 27, 18, tx.from.slice(0, 2).toUpperCase(), tx.fill, "$ink"),
        T(tx.from, 54, 8, 200, 18, { size: 12, weight: 700, fill: "$ink" }),
        T(tx.msg, 54, 28, 200, 16, { size: 10, fill: "$muted" }),
        T(tx.amt, 270, 14, 80, 20, {
          size: 15, weight: 800,
          fill: tx.amt.startsWith("+") ? "$green" : "$ink",
          align: "right",
        }),
      ],
    }))),

    bottomNav(0),
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Mobile: Send Money (390×844)
// ═══════════════════════════════════════════════════════════════════════════
const mobile_send = {
  type: "frame", name: "04 · Send Money (Mobile)",
  x: 2320, y: 0, width: MW, height: MH,
  fill: "$bg",
  children: [
    statusBar(),

    // Header
    T("←", 24, 54, 32, 24, { size: 20, fill: "$ink" }),
    T("SEND MONEY", MW / 2 - 100, 56, 200, 22, { size: 13, weight: 800, fill: "$ink", align: "center", ls: 2 }),

    // Big amount display
    R(24, 96, MW - 48, 120, "$pinkDim", {
      r: 20,
      children: [
        T("$", 24, 28, 36, 64, { size: 36, weight: 900, fill: "$pink" }),
        T("0.00", 60, 20, 260, 80, { size: 72, weight: 900, fill: "$ink", ls: -3, display: true }),
        T("ENTER AMOUNT", 0, 96, MW - 48, 14, { size: 9, weight: 700, fill: "$muted", align: "center", ls: 1.5 }),
      ],
    }),

    // To: field
    T("SEND TO", 24, 230, 200, 14, { size: 9, weight: 700, fill: "$muted", ls: 2 }),
    R(24, 250, MW - 48, 64, "$card", {
      r: 16, stroke: "$border", sw: 1,
      children: [
        Avatar(28, 32, 20, "SA", "$yellowDim", "$ink"),
        T("Sam Kim", 56, 14, 200, 18, { size: 14, weight: 700, fill: "$ink" }),
        T("@samkim · HYPE member", 56, 36, 200, 16, { size: 10, fill: "$muted" }),
        Pill(282, 20, 52, 24, "$green", "✓ HYPE", "$bg", { size: 8 }),
      ],
    }),

    // For: note input
    T("WHAT'S IT FOR?", 24, 330, 200, 14, { size: 9, weight: 700, fill: "$muted", ls: 2 }),
    R(24, 350, MW - 48, 52, "$card", {
      r: 14, stroke: "$border", sw: 1,
      children: [
        T("🎵  concert tickets", 16, 16, 280, 20, { size: 13, fill: "$ink" }),
        T("optional", 290, 16, 76, 20, { size: 10, fill: "$muted" }),
      ],
    }),

    // Quick amount pills
    T("QUICK AMOUNTS", 24, 418, 200, 14, { size: 9, weight: 700, fill: "$muted", ls: 2 }),
    ...(["$10", "$20", "$50", "$100"].map((amt, i) => Pill(24 + i * 84, 438, 74, 34, i === 2 ? "$yellow" : "$card", amt, i === 2 ? "$ink" : "$muted", { size: 12, stroke: "$border" }))),

    // Number pad
    ...([
      ["1","2","3"],
      ["4","5","6"],
      ["7","8","9"],
      ["⌫","0","↵"],
    ].flatMap((row, ri) =>
      row.map((key, ci) => R(24 + ci * 116, 492 + ri * 68, 106, 56, key === "↵" ? "$pink" : "$card", {
        r: 14, stroke: "$border", sw: 1,
        children: [T(key, 0, 0, 106, 56, { size: key === "↵" ? 18 : 22, weight: key === "↵" ? 800 : 500, fill: key === "↵" ? "$bg" : "$ink", align: "center" })],
      }))
    )),

    // Send button
    R(24, 776, MW - 48, 56, "$ink", {
      r: 14,
      children: [T("SEND $0.00 →", 0, 0, MW - 48, 56, { size: 15, weight: 800, fill: "$bg", align: "center" })],
    }),
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Mobile: Transaction Feed (390×844)
// ═══════════════════════════════════════════════════════════════════════════
const mobile_feed = {
  type: "frame", name: "05 · Transaction Feed (Mobile)",
  x: 2740, y: 0, width: MW, height: MH,
  fill: "$bg",
  children: [
    statusBar(),

    // Header
    T("Activity", 24, 54, 200, 28, { size: 22, weight: 900, fill: "$ink", ls: -0.5 }),
    Pill(320, 58, 46, 24, "$pinkDim", "LIVE", "$pink", { size: 9, ls: 1 }),

    // Tabs
    ...([
      { label: "All",        active: true  },
      { label: "Sent",       active: false },
      { label: "Received",   active: false },
      { label: "Splits",     active: false },
    ].map((tab, i) => R(24 + i * 86, 92, 80, 30, tab.active ? "$pink" : "$card", {
      r: 8, stroke: tab.active ? "transparent" : "$border", sw: 1,
      children: [T(tab.label, 0, 0, 80, 30, { size: 11, weight: tab.active ? 700 : 500, fill: tab.active ? "$bg" : "$muted", align: "center" })],
    }))),

    // Month header + summary
    R(24, 136, MW - 48, 50, "$yellowDim", {
      r: 12, stroke: "$border", sw: 1,
      children: [
        T("March 2026", 16, 8, 140, 16, { size: 11, weight: 700, fill: "$ink" }),
        T("Spent $312 · Received $428 · Net +$116", 16, 28, 330, 14, { size: 10, fill: "$muted" }),
        T("+$116", 278, 12, 76, 24, { size: 18, weight: 900, fill: "$green", align: "right" }),
      ],
    }),

    // Transaction list
    ...([
      { date: "Today",    from: "Taylor R.", msg: "concert tix 🎵",     amt: "+$80.00",  fill: "$pinkDim",   acc: "$pink",   tag: "FUN"    },
      { date: "Today",    from: "Sam K.",    msg: "uber pool 🚗",        amt: "-$12.00",  fill: "$yellowDim", acc: "$muted",  tag: "TRAVEL" },
      { date: "Mar 18",   from: "Jordan M.", msg: "dinner @ Nobu 🍣",   amt: "+$48.50",  fill: "$greenDim",  acc: "$green",  tag: "FOOD"   },
      { date: "Mar 17",   from: "HYPE+",     msg: "cashback ⭐",         amt: "+$5.00",   fill: "$yellowDim", acc: "$yellow", tag: "REWARD" },
      { date: "Mar 17",   from: "Alex P.",   msg: "groceries 🛒",        amt: "-$34.20",  fill: "$card",      acc: "$muted",  tag: "FOOD"   },
      { date: "Mar 15",   from: "Chris N.",  msg: "weekend trip ✈️",     amt: "+$120.00", fill: "$pinkDim",   acc: "$pink",   tag: "TRAVEL" },
      { date: "Mar 14",   from: "Jamie O.",  msg: "coffee run ☕",       amt: "-$8.50",   fill: "$card",      acc: "$muted",  tag: "FOOD"   },
      { date: "Mar 13",   from: "Riley B.",  msg: "gym membership 🏋️",  amt: "+$45.00",  fill: "$greenDim",  acc: "$green",  tag: "HEALTH" },
    ].map((tx, i) => R(20, 200 + i * 68, MW - 40, 60, tx.fill, {
      r: 14, stroke: "$border", sw: 1,
      children: [
        Avatar(26, 30, 20, tx.from.slice(0, 2).toUpperCase(), tx.fill === "$card" ? "$dim" : tx.fill, "$ink"),
        T(tx.from, 54, 8, 180, 17, { size: 12, weight: 700, fill: "$ink" }),
        T(tx.msg, 54, 28, 180, 16, { size: 10, fill: "$muted" }),
        T(tx.date, 244, 8, 80, 16, { size: 9, fill: "$muted", align: "right", ls: 0.3 }),
        T(tx.amt, 244, 28, 80, 18, {
          size: 15, weight: 800,
          fill: tx.amt.startsWith("+") ? "$green" : "$ink",
          align: "right",
        }),
        Pill(24, 44, 52, 14, tx.acc === "$green" ? "$greenDim" : tx.acc === "$pink" ? "$pinkDim" : tx.acc === "$yellow" ? "$yellowDim" : "$dim", tx.tag, tx.acc === "$muted" ? "$muted" : tx.acc, { size: 7, ls: 1 }),
      ],
    }))),

    bottomNav(0),
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 6 — Mobile: Profile & Rewards (390×844)
// ═══════════════════════════════════════════════════════════════════════════
const mobile_profile = {
  type: "frame", name: "06 · Profile & Rewards (Mobile)",
  x: 3160, y: 0, width: MW, height: MH,
  fill: "$bg",
  children: [
    statusBar(),

    // Profile header
    Avatar(MW / 2, 84, 44, "JM", "$pink", "$bg"),
    T("Jordan Mills", 0, 134, MW, 28, { size: 20, weight: 900, fill: "$ink", align: "center", ls: -0.5 }),
    T("@jordanmills · HYPE+ member", 0, 164, MW, 18, { size: 11, fill: "$muted", align: "center" }),
    Pill(MW / 2 - 60, 188, 120, 26, "$yellow", "★ TOP SENDER", "$ink", { size: 9, ls: 1 }),

    // Stats row
    ...([
      { val: "128", label: "Payments"  },
      { val: "$12k", label: "Moved"     },
      { val: "34",   label: "Friends"   },
    ].map((s, i) => R(24 + i * 116, 226, 106, 64, "$card", {
      r: 14, stroke: "$border", sw: 1,
      children: [
        T(s.val, 0, 10, 106, 30, { size: 24, weight: 900, fill: "$ink", align: "center", display: true }),
        T(s.label.toUpperCase(), 0, 42, 106, 14, { size: 8, weight: 700, fill: "$muted", align: "center", ls: 1.5 }),
      ],
    }))),

    // Rewards section
    T("YOUR REWARDS", 24, 306, 200, 14, { size: 9, weight: 700, fill: "$muted", ls: 2 }),
    R(20, 326, MW - 40, 100, "$yellow", {
      r: 20,
      children: [
        T("★", 24, 20, 40, 50, { size: 40, fill: "$ink" }),
        T("2,480 HYPE points", 74, 14, 260, 24, { size: 18, weight: 800, fill: "$ink", ls: -0.5 }),
        T("≈ $24.80 in rewards · Expires never", 74, 44, 260, 18, { size: 11, fill: "$muted" }),
        Pill(260, 66, 90, 24, "$ink", "REDEEM →", "$yellow", { size: 9, ls: 1 }),
      ],
    }),

    // Streak
    R(20, 438, MW - 40, 70, "$pinkDim", {
      r: 16, stroke: "$pinkMid", sw: 1,
      children: [
        T("🔥", 20, 16, 36, 36, { size: 28 }),
        T("14-day sending streak!", 64, 10, 240, 22, { size: 15, weight: 800, fill: "$pink" }),
        T("Keep it up — 6 more days for bonus rewards", 64, 36, 260, 18, { size: 10, fill: "$muted" }),
      ],
    }),

    // Referral
    T("REFER & EARN", 24, 524, 200, 14, { size: 9, weight: 700, fill: "$muted", ls: 2 }),
    R(20, 544, MW - 40, 72, "$card", {
      r: 16, stroke: "$border", sw: 1,
      children: [
        T("Share your code, earn $5 per friend:", 16, 12, 340, 18, { size: 12, fill: "$ink" }),
        R(16, 36, 260, 26, "$yellowDim", {
          r: 8,
          children: [T("JORDAN-HYPE2026", 10, 4, 240, 18, { size: 12, weight: 700, fill: "$ink", ls: 1 })],
        }),
        T("COPY", 284, 40, 70, 18, { size: 11, weight: 800, fill: "$pink" }),
      ],
    }),

    // Settings links
    ...([
      { icon: "⚙", label: "Account settings"    },
      { icon: "🔔", label: "Notifications"       },
      { icon: "🔒", label: "Privacy & security"  },
      { icon: "↗", label: "Share HYPE app"       },
    ].map((item, i) => R(20, 630 + i * 42, MW - 40, 36, "$card", {
      r: 10, stroke: "$border", sw: 1,
      children: [
        T(item.icon, 16, 8, 24, 20, { size: 16 }),
        T(item.label, 46, 10, 260, 16, { size: 12, fill: "$ink" }),
        T("›", 324, 8, 24, 20, { size: 16, fill: "$muted" }),
      ],
    }))),

    bottomNav(3),
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// ASSEMBLE + WRITE
// ═══════════════════════════════════════════════════════════════════════════
const pen = {
  version: "2.8",
  variables: vars,
  children: [
    desktop_hero,
    mobile_onboarding,
    mobile_home,
    mobile_send,
    mobile_feed,
    mobile_profile,
  ],
};

fs.writeFileSync('hype-app.pen', JSON.stringify(pen, null, 2));
console.log('✓ hype-app.pen written');
console.log(`  Screens: ${pen.children.length} (1 desktop + 5 mobile)`);
console.log('  Palette: cream #FAF0D0 + hot pink #FF0099 + electric yellow #FFE500 + deep ink #15000C');
console.log('  Inspired by: OWO (lapa.ninja) · Midday.ai (darkmodedesign.com) · Lusion (godly.website)');
