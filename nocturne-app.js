'use strict';
// nocturne-app.js
// NOCTURNE — Luxury AI Private-Member Concierge App
//
// Design Heartbeat — Mar 19, 2026
// Inspired by:
//   • Atlas Card (atlascard.com via godly.website) — pure black bg, deep royal navy #001391,
//     "Sequel Sans", ALL CAPS editorial headings, invite-only exclusivity gate
//   • Evervault Customers (evervault.com via godly.website) — #010314 deep dark, encrypted
//     running-text visual language, Inter + monospace data aesthetic
//   • Lusion.co (lusion.co via godly.website) — electric blue #1A2FFB, dark cinema
//     production tone, large display type, "Beyond Visions / Within Reach"
//   • Land-book.com / recent — luxury e-commerce dark sites (Aevi Nordic, Zia Tile)
//     informing the editorial layout rhythm

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#000000',   // Atlas Card pure black
  surface:  '#0A0A0A',   // elevated card
  surface2: '#111111',   // higher elevation / input bg
  border:   '#1C1C1C',   // subtle border
  border2:  '#2A2A2A',   // stronger border / active
  navy:     '#001391',   // Atlas Card deep royal blue (exact)
  navyHi:   '#0019CC',   // slightly lighter navy for hovers
  blue:     '#1A2FFB',   // Lusion electric blue — interactive
  blueHi:   '#4A5EFF',   // lighter blue for secondary actions
  gold:     '#C9A84C',   // premium gold — member tier
  goldHi:   '#E8C86A',   // lighter gold for highlights
  fg:       '#F5F5F0',   // warm off-white (body text)
  fg2:      '#8A8A82',   // muted warm secondary
  fg3:      '#4A4A44',   // very muted tertiary
  green:    '#4ADE80',   // confirmed/live state
  red:      '#F87171',   // decline/error
  cream:    '#FAF8F3',   // near-white highlight
};

let _id = 0;
const uid = () => `nct${++_id}`;

// ── Core primitives ───────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill || P.bg,
  clip: opts.clip !== undefined ? opts.clip : false,
  ...(opts.r !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.ch || [],
});

const T = (content, x, y, w, h, opts = {}) => ({
  id: uid(), type: 'text', content, x, y, width: w, height: h,
  textGrowth: 'fixed-width-height',
  fontSize: opts.size || 13,
  fontWeight: String(opts.weight || 400),
  fill: opts.fill || P.fg,
  textAlign: opts.align || 'left',
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh !== undefined ? { lineHeight: opts.lh } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  ...(opts.font ? { fontFamily: opts.font } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Line  = (x, y, w, fill = P.border)  => F(x, y, w, 1, fill, {});
const VLine = (x, y, h, fill = P.border)  => F(x, y, 1, h, fill, {});

// Thin pill badge
const Pill = (x, y, text, bg, fg, opts = {}) => {
  const w = Math.max(text.length * 6.5 + 20, 40);
  return F(x, y, w, 20, bg, {
    r: 10,
    ch: [T(text, 10, 3, w - 20, 14, { size: 9, fill: fg, weight: 700, ls: 0.8, align: 'center' })],
    ...(opts.stroke ? { stroke: { align: 'inside', thickness: 1, fill: opts.stroke } } : {}),
  });
};

const Dot = (x, y, color) => E(x, y, 6, 6, color);

// ── Shared layout constants ───────────────────────────────────────────────────
const W = 375;
const H = 812;
const PAD = 20;
const SW  = W - PAD * 2;

// ── Status bar ────────────────────────────────────────────────────────────────
function StatusBar(dark = true) {
  const fg = dark ? P.fg2 : P.fg2;
  return F(0, 0, W, 44, 'transparent', {
    ch: [
      T('9:41', 16, 14, 50, 16, { size: 12, fill: fg, weight: 600 }),
      T('●●●●', W - 68, 14, 60, 16, { size: 10, fill: fg, weight: 400, align: 'right' }),
    ],
  });
}

// ── Nav bar (bottom) ─────────────────────────────────────────────────────────
function BottomNav(activeIdx = 0) {
  const items = ['Home', 'Dining', 'Chat', 'More'];
  const icons = ['◈', '✦', '◎', '⋯'];
  const itemW = W / items.length;
  const ch = [];
  ch.push(F(0, 0, W, 1, P.border, {}));
  items.forEach((label, i) => {
    const active = i === activeIdx;
    const cx = i * itemW + itemW / 2;
    ch.push(T(icons[i], cx - 10, 10, 20, 20, { size: 16, fill: active ? P.gold : P.fg3, align: 'center' }));
    ch.push(T(label.toUpperCase(), cx - 24, 32, 48, 12, { size: 8, fill: active ? P.gold : P.fg3, weight: 700, ls: 0.8, align: 'center' }));
  });
  return F(0, H - 80, W, 80, P.bg, { ch, stroke: P.border });
}

// ── Screen 1: Invite Gate ─────────────────────────────────────────────────────
// Inspired by Atlas Card's pure-black invite-only entry screen with encrypted text
function buildScreen1() {
  const ch = [];

  // Pure black background gradient — subtle navy glow at bottom
  ch.push(F(0, 0, W, H, P.bg, {}));
  ch.push(F(0, H - 300, W, 300, P.navy, { opacity: 0.08 }));   // subtle navy ambient
  ch.push(E(W/2 - 150, H - 260, 300, 260, P.navy, { opacity: 0.12 }));

  // Status bar
  ch.push(StatusBar());

  // NOCTURNE wordmark — all caps editorial (Atlas Card aesthetic)
  ch.push(T('NOCTURNE', W/2 - 120, 88, 240, 52, {
    size: 36, weight: 800, fill: P.fg, ls: 8, align: 'center',
  }));
  ch.push(T('PRIVATE MEMBER', W/2 - 80, 148, 160, 14, {
    size: 9, weight: 700, fill: P.gold, ls: 3.5, align: 'center',
  }));

  // Thin divider
  ch.push(F(W/2 - 40, 174, 80, 1, P.fg3, {}));

  // Encrypted-text visual (Evervault-inspired running cipher) — 4 rows
  const cipherRows = [
    'X7K3M9P2L8Q4R6T1',
    'A2F9W5N1C8J6E3B7',
    '4QH2D8K5Y9G1M7X3',
    'R6T4P3N8W2L1F5C9',
  ];
  cipherRows.forEach((row, i) => {
    ch.push(T(row, PAD, 210 + i * 22, SW, 18, {
      size: 11, fill: P.fg3, ls: 2, font: 'monospace', opacity: 0.6,
    }));
  });

  // Member card — inspired by Atlas Card physical card aesthetic
  const cardY = 320;
  const cardH = 180;
  ch.push(F(PAD, cardY, SW, cardH, P.navy, {
    r: 16,
    ch: [
      // Card inner frame
      F(0, 0, SW, cardH, P.navy, { r: 16, ch: [
        // Subtle grid overlay
        ...Array.from({ length: 8 }, (_, i) =>
          F(0, i * (cardH / 8), SW, 1, P.fg, { opacity: 0.04 })
        ),
        // Member chip
        F(20, 20, 36, 28, P.gold, { r: 5, ch: [
          T('◈', 8, 4, 20, 20, { size: 14, fill: P.navy, weight: 700 }),
        ]}),
        // Tier badge
        Pill(SW - 90, 20, 'OBSIDIAN', P.bg, P.gold),
        // Encrypted member number
        T('4521 •••• •••• 8847', 20, 72, SW - 40, 18, { size: 14, fill: P.cream, weight: 300, ls: 1.5, font: 'monospace' }),
        // Name
        T('JAMES WESTFIELD', 20, 100, 200, 14, { size: 10, fill: P.fg, weight: 700, ls: 2 }),
        // Expiry
        T('VALID THRU 12/28', 20, 118, 150, 12, { size: 8, fill: P.fg2, ls: 1 }),
        // NOCTURNE bottom
        T('NOCTURNE', SW - 90, 148, 70, 14, { size: 9, fill: P.gold, weight: 800, ls: 2.5, align: 'right' }),
        // Emboss circle
        E(SW - 52, cardH - 50, 60, 60, P.bg, { opacity: 0.2 }),
        E(SW - 34, cardH - 50, 60, 60, P.gold, { opacity: 0.15 }),
      ]}),
    ],
  }));

  // Encrypted status text
  ch.push(T('IDENTITY VERIFIED · ACCESS GRANTED', W/2 - 140, 520, 280, 14, {
    size: 9, fill: P.green, weight: 700, ls: 1.5, align: 'center',
  }));
  ch.push(Dot(W/2 - 148, 524, P.green));

  // CTA button — navy with electric blue border
  ch.push(F(PAD, 554, SW, 52, P.navy, {
    r: 8,
    stroke: P.blue,
    sw: 1,
    ch: [
      T('ENTER NOCTURNE', SW/2 - 65, 16, 130, 20, { size: 12, fill: P.cream, weight: 800, ls: 3, align: 'center' }),
    ],
  }));

  // Secondary link
  ch.push(T('Request Membership', W/2 - 70, 626, 140, 14, { size: 11, fill: P.blue, align: 'center' }));

  // Fine print
  ch.push(T('Membership is invite-only. Qualifying individuals only.', W/2 - 150, 660, 300, 24, {
    size: 9, fill: P.fg3, align: 'center', lh: 1.6,
  }));

  // Bottom version
  ch.push(T('v2.1.0 · Secure Connection · AES-256', W/2 - 130, 720, 260, 12, {
    size: 8, fill: P.fg3, align: 'center', font: 'monospace',
  }));

  return { id: uid(), type: 'frame', name: 'S1-InviteGate', x: 0, y: 0, width: W, height: H, fill: P.bg, clip: false, children: ch };
}

// ── Screen 2: Member Home Dashboard ──────────────────────────────────────────
// Bento grid layout — AI status, upcoming reservation, weather, concierge credit
function buildScreen2() {
  const ch = [];
  ch.push(F(0, 0, W, H, P.bg, {}));
  ch.push(StatusBar());

  // Header
  ch.push(T('Good evening,', PAD, 52, 200, 16, { size: 12, fill: P.fg2 }));
  ch.push(T('James.', PAD, 68, 200, 32, { size: 26, fill: P.fg, weight: 800, ls: -0.5 }));
  ch.push(Pill(W - PAD - 68, 74, 'OBSIDIAN', P.navy, P.gold));

  // Member avatar (initials)
  ch.push(E(W - PAD - 36, 52, 36, 36, P.navy, { stroke: P.gold, sw: 1 }));
  ch.push(T('JW', W - PAD - 30, 61, 24, 18, { size: 10, fill: P.gold, weight: 700, align: 'center' }));

  // Divider
  ch.push(Line(PAD, 108, SW));

  // ── BENTO GRID — 3 rows ────────────────────────────────────────────────────
  const CARD_W2 = (SW - 12) / 2;   // half-width card

  // Row 1: Full-width upcoming reservation card
  const resY = 122;
  ch.push(F(PAD, resY, SW, 120, P.surface, {
    r: 12,
    stroke: P.border2,
    ch: [
      T('TONIGHT', 16, 14, 100, 10, { size: 8, fill: P.gold, weight: 700, ls: 2 }),
      T('Nobu Fifty Seven', 16, 30, 240, 20, { size: 16, fill: P.fg, weight: 700 }),
      T('57th Street · 8:30 PM · Party of 2', 16, 54, 260, 14, { size: 11, fill: P.fg2 }),
      Line(16, 76, SW - 32),
      T('Chef\'s Omakase · Private Room Reserved', 16, 84, 280, 12, { size: 9, fill: P.fg2 }),
      Pill(SW - 100, 12, 'CONFIRMED', P.green + '22', P.green),
      // Arrow →
      T('→', SW - 28, 44, 20, 20, { size: 16, fill: P.gold }),
    ],
  }));

  // Row 2: Half-width cards
  const row2Y = resY + 120 + 12;

  // Weather card
  ch.push(F(PAD, row2Y, CARD_W2, 90, P.surface, {
    r: 12,
    stroke: P.border,
    ch: [
      T('WEATHER · NYC', 14, 12, CARD_W2 - 28, 10, { size: 7, fill: P.fg3, weight: 700, ls: 1.5 }),
      T('62°F', 14, 28, 80, 30, { size: 28, fill: P.fg, weight: 800 }),
      T('Clear skies', 14, 62, CARD_W2 - 28, 14, { size: 10, fill: P.fg2 }),
      T('☀', CARD_W2 - 36, 24, 24, 28, { size: 22, fill: P.gold }),
    ],
  }));

  // Concierge credit card
  ch.push(F(PAD + CARD_W2 + 12, row2Y, CARD_W2, 90, P.navy, {
    r: 12,
    ch: [
      T('CONCIERGE CREDITS', 14, 12, CARD_W2 - 28, 10, { size: 7, fill: P.gold, weight: 700, ls: 1.5 }),
      T('24', 14, 28, 60, 30, { size: 28, fill: P.cream, weight: 800 }),
      T('of 30 remaining', 14, 62, CARD_W2 - 28, 14, { size: 10, fill: P.fg, opacity: 0.7 }),
      // Progress bar
      F(14, 48, CARD_W2 - 28, 4, P.navy + 'AA', { r: 2, ch: [
        F(0, 0, Math.round((CARD_W2 - 28) * 0.8), 4, P.gold, { r: 2 }),
      ]}),
    ],
  }));

  // Row 3: AI concierge prompt + travel card
  const row3Y = row2Y + 90 + 12;

  // AI status card — full width
  ch.push(F(PAD, row3Y, SW, 80, P.surface2, {
    r: 12,
    stroke: P.blue + '44',
    sw: 1,
    ch: [
      // Pulsing dot
      E(16, 30, 8, 8, P.blue, {}),
      T('AI CONCIERGE', 32, 27, 160, 10, { size: 8, fill: P.blue, weight: 700, ls: 2 }),
      T('3 recommendations ready for you', 32, 42, 240, 14, { size: 11, fill: P.fg }),
      T('View suggestions →', SW - 130, 42, 110, 14, { size: 11, fill: P.blue }),
    ],
  }));

  // Row 4: Upcoming travel + recent activity
  const row4Y = row3Y + 80 + 12;

  // Upcoming travel
  ch.push(F(PAD, row4Y, CARD_W2, 100, P.surface, {
    r: 12,
    stroke: P.border,
    ch: [
      T('NEXT TRIP', 14, 14, CARD_W2 - 28, 10, { size: 7, fill: P.fg3, weight: 700, ls: 1.5 }),
      T('Tokyo', 14, 30, 150, 22, { size: 20, fill: P.fg, weight: 800 }),
      T('April 14 – 21', 14, 56, 140, 14, { size: 10, fill: P.fg2 }),
      Pill(14, 74, 'HOTEL BOOKED', P.gold + '22', P.gold),
    ],
  }));

  // Recent activity
  ch.push(F(PAD + CARD_W2 + 12, row4Y, CARD_W2, 100, P.surface, {
    r: 12,
    stroke: P.border,
    ch: [
      T('RECENT', 14, 14, CARD_W2 - 28, 10, { size: 7, fill: P.fg3, weight: 700, ls: 1.5 }),
      T('3 Requests', 14, 30, 150, 18, { size: 14, fill: P.fg, weight: 700 }),
      T('Last 7 days', 14, 52, 130, 12, { size: 9, fill: P.fg2 }),
      T('Fulfilled', 14, 66, 130, 14, { size: 10, fill: P.green }),
      Dot(80, 70, P.green),
    ],
  }));

  // Bottom nav
  ch.push(BottomNav(0));

  return { id: uid(), type: 'frame', name: 'S2-MemberHome', x: 0, y: 0, width: W, height: H, fill: P.bg, clip: false, children: ch };
}

// ── Screen 3: Dining Concierge ────────────────────────────────────────────────
// Dark luxury restaurant detail / reservation view
function buildScreen3() {
  const ch = [];
  ch.push(F(0, 0, W, H, P.bg, {}));

  // Full-bleed dark hero image placeholder
  ch.push(F(0, 0, W, 260, P.surface2, {
    ch: [
      // Simulated dark image — abstract grid lines suggesting interior
      ...Array.from({ length: 12 }, (_, i) =>
        F(0, i * 22, W, 1, P.fg, { opacity: 0.03 })
      ),
      ...Array.from({ length: 8 }, (_, i) =>
        F(i * 48, 0, 1, 260, P.fg, { opacity: 0.03 })
      ),
      // Venue name overlay
      F(0, 170, W, 90, P.bg, { opacity: 0.7, ch: [] }),
      T('RESTAURANT DETAIL', PAD, 186, 200, 10, { size: 8, fill: P.gold, weight: 700, ls: 2.5 }),
      T('Nobu Fifty Seven', PAD, 202, W - PAD * 2, 32, { size: 24, fill: P.cream, weight: 800 }),
      // Michelin stars
      T('★ ★  Michelin Guide', PAD, 238, 160, 14, { size: 11, fill: P.gold }),
    ],
  }));

  // Back button
  ch.push(F(PAD, 48, 32, 32, P.bg, { r: 16, opacity: 0.7, stroke: P.border2, ch: [
    T('←', 8, 7, 16, 18, { size: 14, fill: P.fg }),
  ]}));

  // Status bar
  ch.push(StatusBar());

  // Restaurant info
  const infoY = 272;
  ch.push(T('57th Street, New York · $$$$', PAD, infoY, SW, 14, { size: 11, fill: P.fg2 }));
  ch.push(T('Contemporary Japanese · Prix Fixe', PAD, infoY + 18, SW, 14, { size: 11, fill: P.fg2 }));

  // Tags
  ch.push(Pill(PAD, infoY + 40, 'PRIVATE ROOM', P.navy, P.fg));
  ch.push(Pill(PAD + 104, infoY + 40, 'OMAKASE', P.surface, P.gold, { stroke: P.border2 }));
  ch.push(Pill(PAD + 104 + 80, infoY + 40, 'LATE SEATING', P.surface, P.fg2, { stroke: P.border2 }));

  ch.push(Line(PAD, infoY + 72, SW));

  // Booking section
  const bookY = infoY + 84;
  ch.push(T('RESERVATION DETAILS', PAD, bookY, 200, 10, { size: 8, fill: P.fg3, weight: 700, ls: 2 }));

  // Date picker row
  ch.push(F(PAD, bookY + 18, SW, 48, P.surface, {
    r: 8,
    stroke: P.border2,
    ch: [
      T('DATE', 14, 10, 60, 10, { size: 8, fill: P.fg3, weight: 700, ls: 1.5 }),
      T('Friday, March 21, 2026', 14, 24, 200, 16, { size: 13, fill: P.fg, weight: 500 }),
      T('▾', SW - 30, 16, 16, 16, { size: 14, fill: P.fg2 }),
    ],
  }));

  // Time slots
  ch.push(T('AVAILABLE TIMES', PAD, bookY + 78, 200, 10, { size: 8, fill: P.fg3, weight: 700, ls: 2 }));
  const times = ['6:00 PM', '8:30 PM', '10:00 PM'];
  times.forEach((t, i) => {
    const active = i === 1;
    ch.push(F(PAD + i * 104, bookY + 92, 96, 40, active ? P.navy : P.surface, {
      r: 8,
      stroke: active ? P.blue : P.border,
      ch: [
        T(t, active ? 14 : 16, 12, 80, 16, { size: 12, fill: active ? P.cream : P.fg2, weight: active ? 700 : 400, align: 'center' }),
      ],
    }));
  });

  // Guest count
  ch.push(T('GUESTS', PAD, bookY + 146, 80, 10, { size: 8, fill: P.fg3, weight: 700, ls: 2 }));
  ch.push(F(PAD, bookY + 160, 120, 40, P.surface, {
    r: 8,
    stroke: P.border2,
    ch: [
      T('−', 12, 12, 20, 16, { size: 14, fill: P.fg2 }),
      T('2', 44, 10, 32, 20, { size: 14, fill: P.fg, weight: 700, align: 'center' }),
      T('+', 88, 12, 20, 16, { size: 14, fill: P.fg2 }),
    ],
  }));

  // Occasion note
  ch.push(T('Special request (optional)', PAD, bookY + 212, SW, 12, { size: 9, fill: P.fg3 }));
  ch.push(F(PAD, bookY + 226, SW, 48, P.surface, {
    r: 8,
    stroke: P.border,
    ch: [T('Anniversary dinner — please arrange floral arrangement', 14, 14, SW - 28, 20, { size: 11, fill: P.fg3 })],
  }));

  // Book CTA
  ch.push(F(PAD, H - 140, SW, 52, P.navy, {
    r: 10,
    stroke: P.blue,
    ch: [
      T('CONFIRM RESERVATION', SW/2 - 85, 16, 170, 20, { size: 12, fill: P.cream, weight: 800, ls: 2.5, align: 'center' }),
    ],
  }));
  ch.push(T('1 concierge credit will be applied', W/2 - 110, H - 80, 220, 14, {
    size: 10, fill: P.fg3, align: 'center',
  }));

  // Bottom nav
  ch.push(BottomNav(1));

  return { id: uid(), type: 'frame', name: 'S3-DiningConcierge', x: 0, y: 0, width: W, height: H, fill: P.bg, clip: false, children: ch };
}

// ── Screen 4: AI Concierge Chat ───────────────────────────────────────────────
// Dark conversational interface — luxury AI assistant
function buildScreen4() {
  const ch = [];
  ch.push(F(0, 0, W, H, P.bg, {}));
  ch.push(StatusBar());

  // Header
  ch.push(F(0, 44, W, 52, P.bg, {
    stroke: P.border,
    ch: [
      E(PAD, 10, 32, 32, P.navy, { stroke: P.blue, sw: 1 }),
      T('N', PAD + 8, 17, 16, 18, { size: 12, fill: P.blue, weight: 800, align: 'center' }),
      Dot(PAD + 26, 10, P.green),
      T('NOCTURNE AI', PAD + 44, 10, 160, 14, { size: 12, fill: P.fg, weight: 700 }),
      T('Your concierge · Online', PAD + 44, 27, 160, 12, { size: 9, fill: P.green }),
      T('⋯', W - PAD - 16, 16, 16, 20, { size: 18, fill: P.fg2 }),
    ],
  }));

  // Message thread
  const msgY = 106;

  // AI message 1 — date context
  ch.push(T('Today, March 19', W/2 - 52, msgY, 104, 14, { size: 9, fill: P.fg3, align: 'center', weight: 500 }));

  // AI bubble 1
  ch.push(F(PAD, msgY + 22, 240, 64, P.surface, {
    r: 12,
    stroke: P.border,
    ch: [
      T('Good evening, James. You have a reservation tonight at Nobu Fifty Seven at 8:30 PM. Shall I arrange a car?', 14, 12, 212, 40, {
        size: 11, fill: P.fg, lh: 1.6,
      }),
    ],
  }));

  // User bubble 1
  ch.push(F(W - PAD - 160, msgY + 96, 140, 40, P.navy, {
    r: 12,
    ch: [T('Yes, please arrange that.', 14, 12, 112, 16, { size: 11, fill: P.cream })],
  }));

  // AI bubble 2 — car details
  ch.push(F(PAD, msgY + 146, 260, 90, P.surface, {
    r: 12,
    stroke: P.border,
    ch: [
      T('I\'ve requested your preferred Escalade from Carey NYC. Driver: Marcus T. arriving 7:45 PM at 1 Central Park W.', 14, 12, 232, 54, {
        size: 11, fill: P.fg, lh: 1.6,
      }),
      // Confirmation row
      Dot(14, 72, P.green),
      T('Car confirmed · ETA updates in-app', 28, 70, 220, 12, { size: 9, fill: P.green }),
    ],
  }));

  // User bubble 2
  ch.push(F(W - PAD - 200, msgY + 248, 180, 40, P.navy, {
    r: 12,
    ch: [T('Also book the omakase upgrade.', 14, 12, 152, 16, { size: 11, fill: P.cream })],
  }));

  // AI bubble 3
  ch.push(F(PAD, msgY + 300, 260, 70, P.surface, {
    r: 12,
    stroke: P.border,
    ch: [
      T('Chef\'s Omakase added (+$180/person). Your table has been confirmed as a private room. Anything else?', 14, 12, 232, 46, {
        size: 11, fill: P.fg, lh: 1.6,
      }),
    ],
  }));

  // Quick reply chips
  const qrY = msgY + 382;
  ch.push(T('QUICK REPLIES', PAD, qrY, 120, 10, { size: 7, fill: P.fg3, weight: 700, ls: 2 }));
  const replies = ['Recommend wine pairing', 'Book tomorrow\'s hotel', 'Cancel reservation'];
  replies.forEach((r, i) => {
    const rW = r.length * 6.5 + 24;
    ch.push(F(PAD, qrY + 16 + i * 38, rW, 30, P.surface, {
      r: 15,
      stroke: P.border2,
      ch: [T(r, 12, 7, rW - 24, 16, { size: 11, fill: P.fg })],
    }));
  });

  // Input bar
  ch.push(F(0, H - 130, W, 50, P.surface, {
    stroke: P.border2,
    ch: [
      F(PAD, 8, SW - 48, 34, P.bg, {
        r: 17,
        stroke: P.border,
        ch: [T('Ask your concierge anything...', 14, 9, SW - 76, 16, { size: 11, fill: P.fg3 })],
      }),
      F(W - PAD - 34, 8, 34, 34, P.navy, {
        r: 17,
        ch: [T('↑', 9, 7, 16, 20, { size: 14, fill: P.cream, align: 'center' })],
      }),
    ],
  }));

  // Bottom nav
  ch.push(BottomNav(2));

  return { id: uid(), type: 'frame', name: 'S4-AIChat', x: 0, y: 0, width: W, height: H, fill: P.bg, clip: false, children: ch };
}

// ── Screen 5: Benefits & Member Tiers ─────────────────────────────────────────
// Grid of member perks cards with tier system
function buildScreen5() {
  const ch = [];
  ch.push(F(0, 0, W, H, P.bg, {}));
  ch.push(StatusBar());

  // Header
  ch.push(T('MEMBERSHIP', PAD, 52, 200, 10, { size: 9, fill: P.gold, weight: 700, ls: 3 }));
  ch.push(T('Your Benefits', PAD, 66, 240, 32, { size: 26, fill: P.fg, weight: 800 }));
  ch.push(T('OBSIDIAN TIER', W - PAD - 100, 74, 94, 14, { size: 9, fill: P.gold, weight: 700, ls: 1.5, align: 'right' }));

  // Tier progress bar
  ch.push(F(PAD, 104, SW, 6, P.surface2, { r: 3, ch: [
    F(0, 0, SW * 0.76, 6, P.gold, { r: 3 }),
  ]}));
  ch.push(T('$124,200 of $150,000 to APEX', PAD, 116, 200, 12, { size: 9, fill: P.fg3 }));

  ch.push(Line(PAD, 136, SW));

  // Benefits grid — 3 rows × 2 columns
  const BCARD_W = (SW - 12) / 2;
  const benefits = [
    { icon: '✈', title: 'Private Aviation', desc: '10 hrs/year Wheels Up', color: P.navy },
    { icon: '♜', title: 'Fine Dining', desc: 'Nobu, Eleven Madison +', color: P.surface },
    { icon: '◈', title: 'Hotel Access', desc: '400+ luxury properties', color: P.surface },
    { icon: '⚕', title: 'Medical Concierge', desc: '24/7 specialist access', color: P.surface },
    { icon: '◎', title: 'Events & Culture', desc: 'Front row, sold out +', color: P.surface },
    { icon: '⬡', title: 'AI Concierge', desc: '30 requests/month', color: P.navy },
  ];

  benefits.forEach((b, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const bx  = PAD + col * (BCARD_W + 12);
    const by  = 150 + row * 102;
    ch.push(F(bx, by, BCARD_W, 90, b.color, {
      r: 12,
      stroke: col === 0 && (i === 0 || i === 5) ? P.blue + '44' : P.border,
      ch: [
        T(b.icon, 14, 14, 28, 28, { size: 22, fill: P.gold }),
        T(b.title, 14, 46, BCARD_W - 28, 14, { size: 11, fill: P.fg, weight: 700 }),
        T(b.desc, 14, 62, BCARD_W - 28, 12, { size: 9, fill: P.fg2 }),
        // Subtle active indicator for included tiers
        Dot(BCARD_W - 20, 16, P.green),
      ],
    }));
  });

  // Upgrade CTA
  ch.push(F(PAD, H - 180, SW, 60, P.surface, {
    r: 12,
    stroke: P.gold + '55',
    ch: [
      T('Upgrade to APEX', 16, 12, 180, 16, { size: 14, fill: P.fg, weight: 700 }),
      T('Unlimited aviation · Dedicated 24/7 agent', 16, 32, 260, 14, { size: 10, fill: P.fg2 }),
      T('→', SW - 28, 20, 16, 20, { size: 16, fill: P.gold }),
    ],
  }));

  ch.push(T('$2,500/month · Annual billing available', W/2 - 130, H - 112, 260, 14, {
    size: 9, fill: P.fg3, align: 'center',
  }));

  // Bottom nav
  ch.push(BottomNav(3));

  return { id: uid(), type: 'frame', name: 'S5-Benefits', x: 0, y: 0, width: W, height: H, fill: P.bg, clip: false, children: ch };
}

// ── Assemble & write ──────────────────────────────────────────────────────────
const doc = {
  version: '2.8',
  width: 375,
  height: 812,
  children: [
    buildScreen1(),
    buildScreen2(),
    buildScreen3(),
    buildScreen4(),
    buildScreen5(),
  ],
};

const outPath = path.join(__dirname, 'nocturne-app.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
const stat = fs.statSync(outPath);
console.log(`✓ nocturne-app.pen written — ${(stat.size / 1024).toFixed(1)} KB, ${doc.children.length} screens`);
doc.children.forEach((s, i) => {
  console.log(`  Screen ${i + 1}: ${s.name} — ${s.children.length} nodes`);
});
