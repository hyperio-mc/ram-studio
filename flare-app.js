// FLARE — Premium lifestyle card & concierge companion
// Inspired by: Atlas Card (godly.website) + Shed SOTD electric indigo (awwwards.com)
// + Scandinavian minimalist finance aesthetic (land-book.com, Protean Funds Scandinavia)
// THEME: Light — warm cream canvas, editorial typography, bold electric accent

'use strict';
const fs = require('fs');

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const BG       = '#F4F1EA'; // warm cream — editorial luxury
const SURF     = '#FFFFFF'; // pure white cards
const SURF2    = '#F0EDE4'; // subtle secondary surface
const SURF3    = '#E2DDD4'; // progress bar bg / divider
const TEXT     = '#0D0B09'; // near-black warm
const MUTED    = '#8A8278'; // warm mid-tone
const BORDER   = '#E0DDD4'; // barely-there divider
const ACCENT   = '#1507D6'; // electric indigo — from Shed SOTD #0F00B0
const ACCENT_L = '#EAE8FF'; // indigo tint — for badges/surfaces
const ORANGE   = '#E8430B'; // electric orange — premium pop
const ORANGE_L = '#FFF0EB'; // orange tint
const GREEN    = '#1E7A52'; // deep emerald success
const GREEN_L  = '#E8F5EF'; // green tint
const GOLD     = '#A67820'; // muted gold — tier badge
const GOLD_L   = '#FDF4DC'; // gold tint
const SANS     = 'Inter';

const W   = 390; // phone width per screen
const GAP = 40;  // gap between screens
const H   = 844;

let _id = 1;
const id = () => `fl${_id++}`;

// ─── SHAPE HELPERS ────────────────────────────────────────────────────────────
function rect({ x, y, w, h, fill = 'transparent', r = 0, children = [] }) {
  return { id: id(), type: 'rect', x, y, width: w, height: h, fill,
    ...(r ? { radius: r } : {}),
    ...(children.length ? { children } : {}) };
}
function frame({ x, y, w, h, fill = 'transparent', children = [] }) {
  return { id: id(), type: 'frame', x, y, width: w, height: h, fill,
    clip: true, ...(children.length ? { children } : {}) };
}
function text(str, { x, y, size = 13, weight = 400, fill = TEXT,
                     font = SANS, align = 'left', width = 340, lh = 1.4, opacity = 1 }) {
  return { id: id(), type: 'text', x, y, width,
    text: str, fontSize: size, fontWeight: weight, fontFamily: font,
    fill, textAlign: align,
    ...(lh !== 1.4 ? { lineHeight: lh } : {}),
    ...(opacity !== 1 ? { opacity } : {}) };
}
function line({ x1, y1, x2, y2, stroke = BORDER, width = 1 }) {
  return { id: id(), type: 'line', x1, y1, x2, y2, stroke, strokeWidth: width };
}
function circle({ x, y, r, fill }) {
  return { id: id(), type: 'ellipse', x, y, width: r * 2, height: r * 2, fill };
}
function pill({ x, y, w, h, fill, children = [] }) {
  return { id: id(), type: 'rect', x, y, width: w, height: h, fill,
    radius: h / 2, ...(children.length ? { children } : {}) };
}
function dot(x, y, color, r = 4) {
  return circle({ x: x - r, y: y - r, r, fill: color });
}
function bar(x, y, w, h, pct, fill = ACCENT, bg = SURF3) {
  return { id: id(), type: 'group', children: [
    rect({ x, y, w, h, fill: bg, r: h / 2 }),
    rect({ x, y, w: Math.max(h, Math.round(w * pct)), h, fill, r: h / 2 }),
  ]};
}
function chevron(x, y, color = MUTED, size = 7) {
  return { id: id(), type: 'group', children: [
    line({ x1: x, y1: y, x2: x + size * 0.6, y2: y + size * 0.5, stroke: color, width: 1.5 }),
    line({ x1: x + size * 0.6, y1: y + size * 0.5, x2: x, y2: y + size, stroke: color, width: 1.5 }),
  ]};
}

// ─── LAYOUT HELPERS ──────────────────────────────────────────────────────────
const sx = (i) => i * (W + GAP); // screen x offset

function screenBg(i) {
  return rect({ x: sx(i), y: 0, w: W, h: H, fill: BG });
}
function statusBar(i) {
  const bx = sx(i);
  return { id: id(), type: 'group', children: [
    text('9:41', { x: bx + 18, y: 16, size: 12, weight: 600, fill: TEXT }),
    text('●●●  ▲  ▬', { x: bx + W - 90, y: 16, size: 9, fill: MUTED, width: 90, align: 'right' }),
  ]};
}
function bottomNav(i, active) {
  const items = [
    { label: 'Home',     icon: '⌂' },
    { label: 'Spend',    icon: '◈' },
    { label: 'Discover', icon: '✦' },
    { label: 'Rewards',  icon: '◎' },
    { label: 'Profile',  icon: '○' },
  ];
  const bx = sx(i);
  const children = [
    rect({ x: bx, y: H - 64, w: W, h: 64, fill: SURF }),
    line({ x1: bx, y1: H - 64, x2: bx + W, y2: H - 64, stroke: BORDER }),
  ];
  items.forEach((item, idx) => {
    const ix = bx + 16 + idx * ((W - 32) / 5) + (W - 32) / 10;
    const isActive = idx === active;
    children.push(
      text(item.icon, { x: ix - 8, y: H - 54, size: 14, fill: isActive ? ACCENT : MUTED, align: 'center', width: 20 }),
      text(item.label, { x: ix - 22, y: H - 36, size: 9, weight: isActive ? 600 : 400, fill: isActive ? ACCENT : MUTED, align: 'center', width: 44 }),
    );
    if (isActive) {
      children.push(rect({ x: ix - 14, y: H - 59, w: 28, h: 3, fill: ACCENT, r: 1.5 }));
    }
  });
  return { id: id(), type: 'group', children };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 1: HOME
// ═══════════════════════════════════════════════════════════════════════════════
function buildHome() {
  const i = 0;
  const bx = sx(i);
  const nodes = [
    screenBg(i),
    statusBar(i),

    // Header
    text('Good morning,', { x: bx + 20, y: 52, size: 13, fill: MUTED }),
    text('James', { x: bx + 20, y: 70, size: 26, weight: 700, fill: TEXT }),

    // Avatar
    rect({ x: bx + W - 52, y: 54, w: 36, h: 36, fill: ACCENT, r: 18 }),
    text('J', { x: bx + W - 52, y: 63, size: 16, weight: 700, fill: '#FFF', width: 36, align: 'center' }),
    circle({ x: bx + W - 19, y: 57, r: 5, fill: ORANGE }),

    // ── Card Visual ──────────────────────────────────────────────────────────
    rect({ x: bx + 20, y: 114, w: W - 40, h: 200, fill: ACCENT, r: 20 }),
    // Subtle grid lines on card
    line({ x1: bx + 20, y1: 192, x2: bx + W - 20, y2: 192, stroke: '#FFFFFF12', width: 1 }),
    line({ x1: bx + 20, y1: 228, x2: bx + W - 20, y2: 228, stroke: '#FFFFFF12', width: 1 }),
    line({ x1: bx + 120, y1: 114, x2: bx + 120, y2: 314, stroke: '#FFFFFF0A', width: 1 }),
    line({ x1: bx + 240, y1: 114, x2: bx + 240, y2: 314, stroke: '#FFFFFF0A', width: 1 }),
    // Decorative circle
    circle({ x: bx + W - 20, y: 134, r: 90, fill: '#FFFFFF06' }),
    // Chip
    rect({ x: bx + 36, y: 148, w: 38, h: 30, fill: GOLD, r: 6 }),
    line({ x1: bx + 55, y1: 148, x2: bx + 55, y2: 178, stroke: GOLD_L + 'A0', width: 1 }),
    // Available balance on card
    text('Available Balance', { x: bx + 32, y: 126, size: 9, fill: 'rgba(255,255,255,0.55)', weight: 500 }),
    text('$24,180', { x: bx + 32, y: 144, size: 22, weight: 700, fill: '#FFFFFF' }),
    // Card number
    text('•••• •••• •••• 9421', { x: bx + 32, y: 204, size: 14, weight: 400, fill: 'rgba(255,255,255,0.65)', font: 'Courier New', width: 310 }),
    // Name & type
    text('JAMES ALDERTON', { x: bx + 32, y: 248, size: 10, weight: 700, fill: 'rgba(255,255,255,0.9)' }),
    text('FLARE OBSIDIAN', { x: bx + 32, y: 264, size: 9, fill: 'rgba(255,255,255,0.45)' }),
    text('VISA', { x: bx + W - 72, y: 283, size: 14, weight: 900, fill: 'rgba(255,255,255,0.9)', width: 54, align: 'right' }),

    // ── Quick Actions ────────────────────────────────────────────────────────
    text('Quick access', { x: bx + 20, y: 332, size: 11, fill: MUTED }),
    ...[
      { icon: '🍽', label: 'Dining',  bg: ORANGE_L, fg: ORANGE },
      { icon: '🏨', label: 'Hotels',  bg: ACCENT_L, fg: ACCENT },
      { icon: '✦',  label: 'Events',  bg: GREEN_L,  fg: GREEN  },
      { icon: '✈',  label: 'Airport', bg: GOLD_L,   fg: GOLD   },
    ].flatMap(({ icon, label, bg, fg }, qi) => {
      const qx = bx + 20 + qi * 84;
      return [
        rect({ x: qx, y: 350, w: 74, h: 70, fill: SURF, r: 16 }),
        rect({ x: qx + 19, y: 361, w: 36, h: 36, fill: bg, r: 10 }),
        text(icon, { x: qx + 19, y: 367, size: 18, width: 36, align: 'center' }),
        text(label, { x: qx, y: 404, size: 10, fill: MUTED, width: 74, align: 'center' }),
      ];
    }),

    // ── AI Concierge ─────────────────────────────────────────────────────────
    rect({ x: bx + 20, y: 438, w: W - 40, h: 74, fill: SURF, r: 16 }),
    rect({ x: bx + 20, y: 438, w: 4, h: 74, fill: ACCENT, r: 2 }),
    text('✦ AI Concierge', { x: bx + 34, y: 451, size: 11, weight: 600, fill: ACCENT }),
    text('"Nobu is fully booked tonight — I secured a 8pm table at Zuma for two. Shall I confirm?"', {
      x: bx + 34, y: 467, size: 11, fill: TEXT, width: W - 72, lh: 1.3 }),
    text('Tap to reply', { x: bx + 34, y: 500, size: 10, fill: MUTED }),
    chevron(bx + W - 40, 466, MUTED, 8),

    // ── Upcoming Perks ───────────────────────────────────────────────────────
    text('Upcoming perks', { x: bx + 20, y: 530, size: 11, fill: MUTED }),
    ...[
      { title: 'Lounge Access · JFK T4',   sub: 'Today, Delta SkyClub', badge: 'TODAY',  bc: ORANGE_L, bf: ORANGE },
      { title: 'Restaurant Credit — $100', sub: 'Expires in 4 days',    badge: '4 DAYS', bc: GOLD_L,   bf: GOLD   },
    ].flatMap(({ title, sub, badge, bc, bf }, bi) => {
      const by = 548 + bi * 68;
      return [
        rect({ x: bx + 20, y: by, w: W - 40, h: 60, fill: SURF, r: 12 }),
        text(title, { x: bx + 36, y: by + 12, size: 12, weight: 600, fill: TEXT, width: 220 }),
        text(sub, { x: bx + 36, y: by + 31, size: 10, fill: MUTED, width: 220 }),
        pill({ x: bx + W - 90, y: by + 18, w: 54, h: 22, fill: bc }),
        text(badge, { x: bx + W - 90, y: by + 22, size: 9, weight: 700, fill: bf, width: 54, align: 'center' }),
      ];
    }),

    // ── Spend Snapshot ───────────────────────────────────────────────────────
    text('This month', { x: bx + 20, y: 694, size: 11, fill: MUTED }),
    rect({ x: bx + 20, y: 712, w: W - 40, h: 58, fill: SURF, r: 12 }),
    text('$4,290', { x: bx + 34, y: 726, size: 20, weight: 700, fill: TEXT }),
    text('of $12,000 limit', { x: bx + 120, y: 731, size: 10, fill: MUTED }),
    bar(bx + 34, 752, W - 80, 6, 0.358, ACCENT, SURF3),
    text('36%', { x: bx + W - 60, y: 750, size: 9, fill: MUTED, width: 46, align: 'right' }),

    bottomNav(i, 0),
  ];
  return frame({ x: bx, y: 0, w: W, h: H, fill: BG, children: nodes });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 2: SPEND
// ═══════════════════════════════════════════════════════════════════════════════
function buildSpend() {
  const i = 1;
  const bx = sx(i);

  const categories = [
    { label: 'Dining',   pct: 0.34, amt: '$1,460', color: ORANGE },
    { label: 'Hotels',   pct: 0.24, amt: '$1,030', color: ACCENT },
    { label: 'Travel',   pct: 0.18, amt: '$773',   color: GREEN  },
    { label: 'Shopping', pct: 0.14, amt: '$601',   color: GOLD   },
    { label: 'Other',    pct: 0.10, amt: '$426',   color: MUTED  },
  ];

  const recent = [
    { name: 'Nobu, Fifty Seven',   cat: 'Dining',   amt: '-$340',   date: 'Today',      color: ORANGE },
    { name: 'The Mark Hotel',       cat: 'Hotels',   amt: '-$820',   date: 'Yesterday',  color: ACCENT },
    { name: 'Delta · JFK–LHR',      cat: 'Travel',   amt: '-$2,100', date: 'Mar 20',     color: GREEN  },
    { name: 'SSENSE',               cat: 'Shopping', amt: '-$601',   date: 'Mar 19',     color: GOLD   },
  ];

  const nodes = [
    screenBg(i),
    statusBar(i),

    text('Spending', { x: bx + 20, y: 54, size: 24, weight: 700, fill: TEXT }),
    text('March 2026', { x: bx + W - 20, y: 60, size: 12, fill: MUTED, width: 100, align: 'right' }),

    // AI Insight strip
    rect({ x: bx + 20, y: 90, w: W - 40, h: 58, fill: ACCENT, r: 14 }),
    text('✦ AI Insight', { x: bx + 34, y: 102, size: 10, weight: 600, fill: 'rgba(255,255,255,0.7)' }),
    text('Dining spend ↑29% vs last month. Peak: Friday evenings.', {
      x: bx + 34, y: 118, size: 11, fill: '#FFFFFF', width: W - 78, lh: 1.3 }),

    // Total
    text('$4,290', { x: bx + 20, y: 172, size: 36, weight: 800, fill: TEXT }),
    text('spent this month', { x: bx + 24, y: 212, size: 12, fill: MUTED }),
    text('+ 3.2× points on every purchase', { x: bx + 24, y: 230, size: 10, fill: GREEN, weight: 500 }),

    // Category breakdown
    text('By category', { x: bx + 20, y: 258, size: 11, fill: MUTED }),
    ...categories.flatMap(({ label, pct, amt, color }, ci) => {
      const cy = 278 + ci * 46;
      return [
        circle({ x: bx + 23, y: cy + 9, r: 5, fill: color }),
        text(label, { x: bx + 40, y: cy + 4, size: 12, weight: 500, fill: TEXT }),
        text(amt, { x: bx + W - 24, y: cy + 4, size: 12, weight: 600, fill: TEXT, align: 'right', width: 80 }),
        bar(bx + 40, cy + 20, W - 100, 5, pct, color, SURF3),
      ];
    }),

    line({ x1: bx + 20, y1: 514, x2: bx + W - 20, y2: 514, stroke: BORDER }),

    // Recent transactions
    text('Recent', { x: bx + 20, y: 526, size: 11, fill: MUTED }),
    text('See all', { x: bx + W - 20, y: 526, size: 11, fill: ACCENT, width: 50, align: 'right' }),

    ...recent.flatMap(({ name, cat, amt, date, color }, ri) => {
      const ry = 546 + ri * 60;
      return [
        rect({ x: bx + 20, y: ry, w: W - 40, h: 52, fill: SURF, r: 12 }),
        rect({ x: bx + 32, y: ry + 14, w: 24, h: 24, fill: color + '22', r: 8 }),
        circle({ x: bx + 44, y: ry + 26, r: 5, fill: color }),
        text(name, { x: bx + 64, y: ry + 11, size: 12, weight: 500, fill: TEXT, width: 200 }),
        text(cat + ' · ' + date, { x: bx + 64, y: ry + 29, size: 10, fill: MUTED, width: 200 }),
        text(amt, { x: bx + W - 30, y: ry + 17, size: 13, weight: 600, fill: TEXT, align: 'right', width: 80 }),
      ];
    }),

    bottomNav(i, 1),
  ];
  return frame({ x: bx, y: 0, w: W, h: H, fill: BG, children: nodes });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 3: DISCOVER
// ═══════════════════════════════════════════════════════════════════════════════
function buildDiscover() {
  const i = 2;
  const bx = sx(i);

  const experiences = [
    { title: 'Zuma Tokyo',             sub: 'Japanese Contemporary · Roppongi',  badge: 'MEMBERS ONLY', bc: ORANGE_L, bf: ORANGE, imgFill: '#1A1410' },
    { title: 'Aman Venice',            sub: 'Historic Palace · Grand Canal',      badge: 'LAST ROOM',    bc: ACCENT_L, bf: ACCENT, imgFill: '#0E1520' },
    { title: 'F1 Monaco · Paddock',    sub: 'VIP Paddock Club · May 25',          badge: 'EXCLUSIVE',    bc: GREEN_L,  bf: GREEN,  imgFill: '#0E1A10' },
  ];

  const nodes = [
    screenBg(i),
    statusBar(i),

    text('Discover', { x: bx + 20, y: 54, size: 24, weight: 700, fill: TEXT }),

    // Filter pills
    ...['All', 'Dining', 'Hotels', 'Events', 'Wellness'].map((label, fi) => {
      const isActive = fi === 0;
      const widths = [32, 56, 52, 54, 70];
      const offsets = [0, 44, 112, 176, 242];
      const fw = widths[fi];
      const fpx = bx + 20 + offsets[fi];
      return { id: id(), type: 'group', children: [
        pill({ x: fpx, y: 84, w: fw, h: 28, fill: isActive ? ACCENT : SURF }),
        text(label, { x: fpx, y: 91, size: 11, weight: isActive ? 600 : 400,
          fill: isActive ? '#FFF' : MUTED, width: fw, align: 'center' }),
      ]};
    }),

    text('✦ Curated for you', { x: bx + 20, y: 130, size: 13, weight: 600, fill: TEXT }),
    text('Based on your preferences & upcoming travel', { x: bx + 20, y: 148, size: 11, fill: MUTED }),

    // Experience cards
    ...experiences.flatMap(({ title, sub, badge, bc, bf, imgFill }, ei) => {
      const ey = 168 + ei * 196;
      const bw = badge.length * 6 + 16;
      return [
        rect({ x: bx + 20, y: ey, w: W - 40, h: 180, fill: SURF, r: 20 }),
        rect({ x: bx + 20, y: ey, w: W - 40, h: 112, fill: imgFill, r: 20 }),
        // Content badge
        pill({ x: bx + 32, y: ey + 12, w: bw, h: 22, fill: bc }),
        text(badge, { x: bx + 32, y: ey + 16, size: 9, weight: 700, fill: bf, width: bw, align: 'center' }),
        // Title / sub
        text(title, { x: bx + 32, y: ey + 122, size: 14, weight: 700, fill: TEXT, width: 250 }),
        text(sub, { x: bx + 32, y: ey + 141, size: 11, fill: MUTED, width: 260 }),
        // Reserve CTA
        pill({ x: bx + W - 112, y: ey + 148, w: 80, h: 26, fill: ACCENT }),
        text('Reserve', { x: bx + W - 112, y: ey + 152, size: 11, weight: 600, fill: '#FFF', width: 80, align: 'center' }),
        // Points callout
        text('✦ 2,400 pts', { x: bx + 32, y: ey + 154, size: 10, weight: 500, fill: GOLD }),
      ];
    }),

    bottomNav(i, 2),
  ];
  return frame({ x: bx, y: 0, w: W, h: H, fill: BG, children: nodes });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 4: REWARDS
// ═══════════════════════════════════════════════════════════════════════════════
function buildRewards() {
  const i = 3;
  const bx = sx(i);

  const redeemOptions = [
    { title: 'Hotel Nights',        sub: 'Redeem at 400+ properties',    pts: '10,000 pts', color: ACCENT },
    { title: 'Dining Credits',      sub: '$50 at any Atlas Dining venue', pts: '2,000 pts',  color: ORANGE },
    { title: 'Statement Credit',    sub: '$25 back on your bill',         pts: '2,500 pts',  color: GREEN  },
    { title: 'Experience Upgrade',  sub: 'F1 Paddock VIP · Monaco',       pts: '50,000 pts', color: GOLD   },
  ];

  const nodes = [
    screenBg(i),
    statusBar(i),

    text('Rewards', { x: bx + 20, y: 54, size: 24, weight: 700, fill: TEXT }),

    // Points hero card
    rect({ x: bx + 20, y: 88, w: W - 40, h: 140, fill: SURF, r: 20 }),
    circle({ x: bx + W - 40, y: 108, r: 60, fill: ACCENT_L }),
    circle({ x: bx + W - 26, y: 192, r: 32, fill: ORANGE_L }),

    text('FLARE Points', { x: bx + 34, y: 106, size: 11, fill: MUTED }),
    text('84,290', { x: bx + 34, y: 130, size: 38, weight: 800, fill: TEXT }),
    text('pts', { x: bx + 164, y: 156, size: 16, fill: MUTED }),
    text('≈ $842 value', { x: bx + 34, y: 168, size: 12, fill: GREEN }),
    pill({ x: bx + 34, y: 190, w: 104, h: 24, fill: GOLD_L }),
    text('✦ OBSIDIAN TIER', { x: bx + 34, y: 195, size: 9, weight: 700, fill: GOLD, width: 104, align: 'center' }),
    text('+1,240 pts this month', { x: bx + 168, y: 178, size: 10, fill: ACCENT, weight: 500 }),

    // Progress to next tier
    text('Progress to Black tier', { x: bx + 20, y: 250, size: 11, fill: MUTED }),
    rect({ x: bx + 20, y: 268, w: W - 40, h: 52, fill: SURF, r: 12 }),
    text('84,290 / 100,000 pts', { x: bx + 32, y: 280, size: 11, weight: 500, fill: TEXT }),
    text('15,710 to unlock', { x: bx + W - 24, y: 280, size: 10, fill: MUTED, width: 120, align: 'right' }),
    bar(bx + 32, 296, W - 70, 6, 0.843, GOLD, SURF3),

    // Redeem options
    text('Redeem points', { x: bx + 20, y: 340, size: 11, fill: MUTED }),

    ...redeemOptions.flatMap(({ title, sub, pts, color }, ri) => {
      const ry = 360 + ri * 62;
      const pw = pts.length * 6.5 + 12;
      return [
        rect({ x: bx + 20, y: ry, w: W - 40, h: 54, fill: SURF, r: 12 }),
        rect({ x: bx + 32, y: ry + 14, w: 26, h: 26, fill: color + '22', r: 8 }),
        circle({ x: bx + 45, y: ry + 27, r: 5, fill: color }),
        text(title, { x: bx + 66, y: ry + 10, size: 12, weight: 600, fill: TEXT }),
        text(sub, { x: bx + 66, y: ry + 28, size: 10, fill: MUTED, width: 200 }),
        pill({ x: bx + W - 30 - pw, y: ry + 15, w: pw, h: 24, fill: color + '22' }),
        text(pts, { x: bx + W - 30 - pw, y: ry + 19, size: 9, weight: 700, fill: color, width: pw, align: 'center' }),
      ];
    }),

    bottomNav(i, 3),
  ];
  return frame({ x: bx, y: 0, w: W, h: H, fill: BG, children: nodes });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 5: PROFILE
// ═══════════════════════════════════════════════════════════════════════════════
function buildProfile() {
  const i = 4;
  const bx = sx(i);

  const settings = [
    { label: 'Card Controls',       sub: 'Freeze, limits, virtual cards',     icon: '◈' },
    { label: 'Notifications',       sub: 'Spend alerts, perk reminders',      icon: '◎' },
    { label: 'Payment Methods',     sub: '2 bank accounts linked',             icon: '◇' },
    { label: 'Travel Preferences',  sub: 'Airlines, hotels, dietary',          icon: '✈' },
    { label: 'Concierge History',   sub: '14 requests this month',             icon: '◑' },
    { label: 'Statements',          sub: 'Docs & cardholder agreement',        icon: '≡' },
  ];

  const nodes = [
    screenBg(i),
    statusBar(i),

    // Profile card
    rect({ x: bx + 20, y: 52, w: W - 40, h: 120, fill: SURF, r: 20 }),
    circle({ x: bx + W - 44, y: 68, r: 52, fill: ACCENT_L }),

    // Avatar
    rect({ x: bx + 36, y: 68, w: 64, h: 64, fill: ACCENT, r: 32 }),
    text('JA', { x: bx + 36, y: 86, size: 22, weight: 700, fill: '#FFF', width: 64, align: 'center' }),

    // Name & tier
    text('James Alderton', { x: bx + 116, y: 76, size: 16, weight: 700, fill: TEXT }),
    text('james@alderton.co', { x: bx + 116, y: 96, size: 11, fill: MUTED }),
    pill({ x: bx + 116, y: 116, w: 104, h: 22, fill: GOLD_L }),
    text('✦ OBSIDIAN TIER', { x: bx + 116, y: 121, size: 9, weight: 700, fill: GOLD, width: 104, align: 'center' }),

    text('Member since Oct 2022', { x: bx + W - 32, y: 150, size: 10, fill: MUTED, align: 'right', width: 160 }),

    // Concierge CTA
    rect({ x: bx + 20, y: 188, w: W - 40, h: 54, fill: ACCENT, r: 16 }),
    text('✦ Text your concierge', { x: bx + 36, y: 200, size: 12, weight: 600, fill: '#FFFFFF' }),
    text('Available 24/7 · avg reply under 2 min', { x: bx + 36, y: 220, size: 10, fill: 'rgba(255,255,255,0.65)' }),
    chevron(bx + W - 38, 212, '#FFFFFF', 8),

    // Stats row
    rect({ x: bx + 20, y: 258, w: W - 40, h: 60, fill: SURF, r: 12 }),
    ...[
      { label: 'Years member', value: '3.4' },
      { label: 'Requests',     value: '147' },
      { label: 'Saved',        value: '$2.8K' },
    ].flatMap(({ label, value }, si) => {
      const sx2 = bx + 40 + si * 104;
      return [
        text(value, { x: sx2, y: 272, size: 18, weight: 700, fill: TEXT, width: 90 }),
        text(label, { x: sx2, y: 294, size: 9, fill: MUTED, width: 90 }),
        ...(si < 2 ? [line({ x1: sx2 + 78, y1: 274, x2: sx2 + 78, y2: 308, stroke: BORDER })] : []),
      ];
    }),

    text('Account', { x: bx + 20, y: 336, size: 11, fill: MUTED }),

    ...settings.flatMap(({ label, sub, icon }, si) => {
      const sy = 354 + si * 56;
      return [
        rect({ x: bx + 20, y: sy, w: W - 40, h: 48, fill: SURF, r: 12 }),
        rect({ x: bx + 32, y: sy + 12, w: 24, h: 24, fill: SURF2, r: 8 }),
        text(icon, { x: bx + 32, y: sy + 15, size: 12, fill: MUTED, width: 24, align: 'center' }),
        text(label, { x: bx + 64, y: sy + 10, size: 12, weight: 500, fill: TEXT }),
        text(sub, { x: bx + 64, y: sy + 28, size: 10, fill: MUTED, width: 240 }),
        chevron(bx + W - 32, sy + 18, MUTED, 8),
      ];
    }),

    // Sign out
    rect({ x: bx + 20, y: H - 128, w: W - 40, h: 40, fill: SURF, r: 12 }),
    text('Sign out', { x: bx + 20, y: H - 118, size: 13, fill: ORANGE, width: W - 40, align: 'center' }),

    bottomNav(i, 4),
  ];
  return frame({ x: bx, y: 0, w: W, h: H, fill: BG, children: nodes });
}

// ═══════════════════════════════════════════════════════════════════════════════
// ASSEMBLE & WRITE
// ═══════════════════════════════════════════════════════════════════════════════
const totalW = 5 * W + 4 * GAP;
const pen = {
  version: '2.8',
  name: 'FLARE — Premium Lifestyle Card & Concierge',
  width: totalW,
  height: H,
  fill: '#E8E4D8',
  children: [
    buildHome(),
    buildSpend(),
    buildDiscover(),
    buildRewards(),
    buildProfile(),
  ],
};

fs.writeFileSync('flare.pen', JSON.stringify(pen, null, 2));
console.log('✓ flare.pen written');
console.log('  screens:', pen.children.length);
const sz = JSON.stringify(pen).length;
console.log('  size:', (sz / 1024).toFixed(1) + 'KB');
