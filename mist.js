'use strict';
// ─────────────────────────────────────────────────────────────────────────────
// MIST — Luxury AI Concierge Card App
// Inspired by: Atlas Card (atlascard.com via godly.website)
// Aesthetic: atmospheric deep-indigo + platinum + warm gold, ultra-thin type
// Heartbeat #10 — RAM Design Studio
// ─────────────────────────────────────────────────────────────────────────────

const fs    = require('fs');
const https = require('https');

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:       '#07070F',   // near-black with blue tint
  surface:  '#0E0E1C',   // card surface
  surface2: '#14142A',   // elevated surface
  border:   '#1E1E38',   // subtle border
  border2:  '#2A2A48',   // brighter border
  gold:     '#C9A84C',   // warm champagne gold
  gold2:    '#E8C96A',   // lighter gold highlight
  platinum: '#B8C4D4',   // platinum/ice text
  white:    '#ECF0F8',   // primary text
  muted:    '#5A6080',   // muted labels
  muted2:   '#3A3A5C',   // very muted
  red:      '#E05A6A',   // error/negative
  teal:     '#4AC9C0',   // positive/success
};

// ── Gradient helpers ──────────────────────────────────────────────────────────
function lg(rotation, stops) {
  return { type: 'gradient', gradientType: 'linear', rotation,
    colors: stops.map(([position, color]) => ({ position, color })) };
}
function rg(stops, cx = 0.5, cy = 0.5) {
  return { type: 'gradient', gradientType: 'radial',
    center: { x: cx, y: cy }, size: { width: 1, height: 1 },
    colors: stops.map(([position, color]) => ({ position, color })) };
}

// ── Shorthand frame/text builders ─────────────────────────────────────────────
function F(x, y, w, h, fill, opts = {}) {
  return { type: 'frame', x, y, width: w, height: h, fill,
    cornerRadius: opts.r ?? 0, opacity: opts.op ?? 1,
    children: opts.children ?? [], effects: opts.fx ?? [],
    strokeWeight: opts.sw ?? 0, strokeColor: opts.sc ?? 'transparent',
    ...( opts.clip !== undefined ? { clipContent: opts.clip } : {}) };
}
function T(x, y, w, h, text, opts = {}) {
  return { type: 'text', x, y, width: w, height: h, text,
    fontSize: opts.sz ?? 14, fontWeight: opts.fw ?? 400,
    color: opts.c ?? C.white, textAlign: opts.align ?? 'left',
    letterSpacing: opts.ls ?? 0, lineHeight: opts.lh ?? 1.4,
    opacity: opts.op ?? 1 };
}
function E(x, y, w, h, fill, opts = {}) {
  return { type: 'ellipse', x, y, width: w, height: h, fill,
    opacity: opts.op ?? 1, effects: opts.fx ?? [] };
}

// ── Glow effect ───────────────────────────────────────────────────────────────
function glow(color, blur = 40, spread = 0) {
  return [{ type: 'drop-shadow', color, blur, offset: { x: 0, y: 0 }, spread }];
}

// ── Atmospheric orb ───────────────────────────────────────────────────────────
function orb(x, y, r, color, op = 0.35) {
  return E(x - r, y - r, r * 2, r * 2,
    rg([[0, color + '88'], [1, 'rgba(0,0,0,0)']]),
    { op });
}

// ── Physical card component ───────────────────────────────────────────────────
function MistCard(x, y, w, h, opts = {}) {
  const r = opts.r ?? 16;
  const children = [
    // Card body: deep indigo gradient
    F(0, 0, w, h, lg(135, [[0, '#1C1C38'], [0.5, '#252545'], [1, '#181830']]),
      { r, children: [
        // Subtle shimmer overlay
        F(0, 0, w, h * 0.5, lg(135, [[0, 'rgba(255,255,255,0.04)'], [1, 'rgba(255,255,255,0)']]),
          { r }),
        // Mist texture lines
        F(0, h * 0.6, w, 1, '#FFFFFF', { op: 0.04 }),
        F(0, h * 0.7, w, 1, '#FFFFFF', { op: 0.03 }),
        F(0, h * 0.8, w, 1, '#FFFFFF', { op: 0.02 }),
        // Gold chip
        F(28, h * 0.35, 40, 30, lg(135, [[0, C.gold2], [1, C.gold]]),
          { r: 5 }),
        // MIST wordmark
        T(28, 24, 120, 20, 'MIST', { sz: 13, fw: 300, c: C.white, ls: 6 }),
        // Card number (last 4)
        T(28, h - 52, w - 56, 16, '•••• •••• ••••  4291',
          { sz: 13, fw: 300, c: C.platinum, ls: 2 }),
        // Cardholder
        T(28, h - 28, 120, 14, opts.name ?? 'A. RAKIS',
          { sz: 10, fw: 300, c: C.muted, ls: 2 }),
        // Network logo (right)
        T(w - 56, h - 34, 40, 20, '◎', { sz: 20, fw: 300, c: C.gold, align: 'right' }),
      ]}),
  ];
  return F(x, y, w, h, 'transparent', { children,
    fx: [{ type: 'drop-shadow', color: 'rgba(180,150,60,0.20)', blur: 40, offset: { x: 0, y: 16 } }] });
}

// ── Spend bar ─────────────────────────────────────────────────────────────────
function SpendBar(x, y, w, pct, color) {
  return F(x, y, w, 4, C.border2, { r: 2, children: [
    F(0, 0, w * pct, 4, color, { r: 2 }),
  ]});
}

// ── Category chip ─────────────────────────────────────────────────────────────
function Chip(x, y, label, active = false) {
  const w = label.length * 7 + 24;
  return F(x, y, w, 28, active ? C.gold : 'transparent', { r: 14,
    sw: 1, sc: active ? C.gold : C.border2,
    children: [
      T(12, 7, w - 24, 14, label,
        { sz: 10, fw: active ? 600 : 400, c: active ? C.bg : C.muted, ls: 1.5 }),
    ]
  });
}

// ── Transaction row ───────────────────────────────────────────────────────────
function TxRow(x, y, w, icon, merchant, category, amount, positive = false) {
  return F(x, y, w, 60, 'transparent', { children: [
    // Icon circle
    E(0, 10, 40, 40, C.surface2),
    T(0, 10, 40, 40, icon, { sz: 16, align: 'center' }),
    // Merchant + category
    T(52, 14, w - 120, 16, merchant, { sz: 13, fw: 500, c: C.white }),
    T(52, 33, w - 120, 12, category, { sz: 10, fw: 400, c: C.muted, ls: 1 }),
    // Amount
    T(w - 70, 14, 70, 16, (positive ? '+' : '-') + '$' + amount,
      { sz: 13, fw: 500, c: positive ? C.teal : C.white, align: 'right' }),
    // Divider
    F(52, 58, w - 52, 1, C.border, {}),
  ]});
}

// ── Experience card ───────────────────────────────────────────────────────────
function ExpCard(x, y, w, h, emoji, name, desc, tag, tagColor) {
  return F(x, y, w, h, C.surface, { r: 12,
    sw: 1, sc: C.border,
    fx: [{ type: 'drop-shadow', color: 'rgba(0,0,0,0.4)', blur: 20, offset: { x: 0, y: 8 } }],
    children: [
      // Gradient thumb
      F(0, 0, w, h * 0.5, lg(160, [[0, C.surface2], [1, C.bg]]), { r: 12 }),
      // Emoji
      T(0, h * 0.1, w, h * 0.3, emoji, { sz: 28, align: 'center' }),
      // Tag
      F(12, 12, tag.length * 7 + 16, 20, tagColor + '22', { r: 10,
        children: [T(8, 4, tag.length * 7, 12, tag, { sz: 8, fw: 700, c: tagColor, ls: 1.5 })] }),
      // Name
      T(12, h * 0.52, w - 24, 16, name, { sz: 12, fw: 600, c: C.white }),
      // Desc
      T(12, h * 0.62, w - 24, 30, desc, { sz: 10, fw: 400, c: C.muted, lh: 1.5 }),
      // Arrow
      T(w - 28, h - 28, 16, 16, '→', { sz: 12, c: C.gold }),
    ]
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREENS
// ─────────────────────────────────────────────────────────────────────────────

function mHome() {
  const W = 375, H = 812;
  return {
    name: 'Mobile — Dashboard', type: 'frame', width: W, height: H, fill: C.bg, x: 0, y: 0,
    children: [
      // Background
      F(0, 0, W, H, C.bg, {}),
      // Atmospheric orbs
      orb(W * 0.8, 120, 140, '#4040A0', 0.25),
      orb(W * 0.1, 500, 100, '#9060C0', 0.15),
      orb(W * 0.5, 700, 80,  '#C9A84C', 0.10),

      // Status bar
      T(24, 16, 80, 14, '9:41', { sz: 12, fw: 500, c: C.white }),
      T(W - 80, 16, 60, 14, '●●● ▲', { sz: 10, c: C.muted, align: 'right' }),

      // Header
      T(24, 52, 200, 18, 'Good evening, Rakis', { sz: 13, fw: 300, c: C.muted, ls: 0.5 }),
      T(24, 72, 200, 28, 'MIST', { sz: 22, fw: 200, c: C.white, ls: 8 }),

      // Notification bell
      F(W - 56, 60, 32, 32, C.surface, { r: 16,
        sw: 1, sc: C.border,
        children: [T(0, 8, 32, 16, '🔔', { sz: 13, align: 'center' })] }),

      // MIST Card
      MistCard(24, 116, W - 48, 190),

      // Balance row
      T(24, 322, 160, 14, 'AVAILABLE BALANCE', { sz: 9, fw: 400, c: C.muted, ls: 2.5 }),
      T(24, 340, W - 48, 36, '$48,291.00', { sz: 32, fw: 200, c: C.white, ls: -0.5 }),
      T(24, 380, 120, 14, '+$2,140 this month', { sz: 11, fw: 400, c: C.teal }),

      // Quick actions
      ...['Pay', 'Request', 'Concierge', 'More'].map((label, i) => {
        const icons = ['↑', '↓', '◇', '···'];
        const ax = 24 + i * 82;
        return F(ax, 412, 68, 68, C.surface, { r: 16,
          sw: 1, sc: C.border,
          children: [
            T(0, 14, 68, 24, icons[i], { sz: 18, align: 'center', c: i === 2 ? C.gold : C.platinum }),
            T(0, 42, 68, 14, label, { sz: 9, fw: 400, c: C.muted, align: 'center', ls: 0.5 }),
          ]
        });
      }),

      // Recent transactions header
      T(24, 500, 140, 16, 'RECENT', { sz: 9, fw: 400, c: C.muted, ls: 3 }),
      T(W - 80, 500, 60, 16, 'See all →', { sz: 10, fw: 400, c: C.gold, align: 'right' }),

      // Transactions
      TxRow(24, 524, W - 48, '🍽', 'Nobu New York', 'DINING', '340.00'),
      TxRow(24, 584, W - 48, '✈', 'Delta Air Lines', 'TRAVEL', '1,240.00'),
      TxRow(24, 644, W - 48, '🏨', 'Four Seasons', 'HOTEL', '890.00'),

      // Nav bar
      F(0, 748, W, 64, C.surface, { sw: 1, sc: C.border,
        children: [
          ...['◈', '⊞', '◇', '⊙'].map((icon, i) => {
            const active = i === 0;
            return F(i * (W / 4), 0, W / 4, 64, 'transparent', { children: [
              T(0, 12, W / 4, 24, icon, { sz: 20, align: 'center', c: active ? C.gold : C.muted2 }),
              T(0, 38, W / 4, 14, ['Home','Discover','Concierge','Account'][i],
                { sz: 8, align: 'center', c: active ? C.gold : C.muted, ls: 0.5 }),
            ]});
          }),
        ]
      }),
    ]
  };
}

function mDiscover() {
  const W = 375, H = 812;
  const expData = [
    { emoji: '🍾', name: 'Masa, NYC', desc: 'Omakase · 2 seats', tag: 'DINING', color: C.gold },
    { emoji: '🏔', name: 'Aman Kyoto', desc: 'Ryokan · Suite', tag: 'HOTEL',  color: C.teal },
    { emoji: '🎭', name: 'The Met Gala', desc: 'Private access', tag: 'EVENT',  color: '#C07AE0' },
    { emoji: '🛥', name: 'Monaco GP', desc: 'Yacht berth · May', tag: 'SPORT',  color: C.red },
  ];
  return {
    name: 'Mobile — Discover', type: 'frame', width: W, height: H, fill: C.bg, x: 0, y: 0,
    children: [
      F(0, 0, W, H, C.bg, {}),
      orb(W * 0.9, 200, 160, '#5050C0', 0.20),
      orb(W * 0.0, 600, 120, '#9050A0', 0.12),

      // Header
      T(24, 60, W - 48, 18, 'Curated for you', { sz: 11, fw: 300, c: C.muted, ls: 1 }),
      T(24, 80, W - 48, 32, 'Experiences', { sz: 28, fw: 200, c: C.white, ls: -0.5 }),

      // Filter chips
      ...['All', 'Dining', 'Hotels', 'Events', 'Sport'].reduce((acc, label, i) => {
        const prev = acc.length ? acc[acc.length - 1] : null;
        const px = prev ? prev.x + prev.width + 8 : 24;
        const chip = Chip(px, 126, label, i === 0);
        chip.x = px;
        chip.y = 126;
        return [...acc, chip];
      }, []),

      // City header
      T(24, 172, W - 48, 14, '✦  NEW YORK  ·  THIS WEEK', { sz: 9, fw: 400, c: C.muted, ls: 3 }),

      // Experience cards — 2 column grid
      ...expData.map((e, i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const cw = (W - 56) / 2, ch = 170;
        return ExpCard(24 + col * (cw + 8), 196 + row * (ch + 12),
          cw, ch, e.emoji, e.name, e.desc, e.tag, e.color);
      }),

      // Concierge nudge
      F(24, 576, W - 48, 64, C.surface2, { r: 16, sw: 1, sc: C.border,
        children: [
          T(16, 12, 200, 16, 'Need something specific?', { sz: 12, fw: 500, c: C.white }),
          T(16, 32, 200, 14, 'Ask your MIST concierge →', { sz: 11, fw: 300, c: C.gold }),
          T(W - 80, 16, 40, 32, '◇', { sz: 24, c: C.gold, align: 'center' }),
        ]
      }),

      // Nav bar
      F(0, 748, W, 64, C.surface, { sw: 1, sc: C.border,
        children: [
          ...['◈', '⊞', '◇', '⊙'].map((icon, i) => {
            const active = i === 1;
            return F(i * (W / 4), 0, W / 4, 64, 'transparent', { children: [
              T(0, 12, W / 4, 24, icon, { sz: 20, align: 'center', c: active ? C.gold : C.muted2 }),
              T(0, 38, W / 4, 14, ['Home','Discover','Concierge','Account'][i],
                { sz: 8, align: 'center', c: active ? C.gold : C.muted, ls: 0.5 }),
            ]});
          }),
        ]
      }),
    ]
  };
}

function mBenefits() {
  const W = 375, H = 812;
  const perks = [
    { icon: '✈', label: 'Airport Lounges', desc: 'Global access · 1,400+ lounges', val: 'Unlimited' },
    { icon: '◇', label: 'AI Concierge', desc: 'Available 24/7 · instant response', val: 'Always on' },
    { icon: '🏨', label: 'Hotel Upgrades', desc: 'Priority status · 5,000+ properties', val: 'Auto' },
    { icon: '🛡', label: 'Travel Insurance', desc: 'Coverage up to $2M', val: '$2M' },
    { icon: '🍽', label: 'Restaurant Access', desc: 'Priority reservations', val: 'Priority' },
    { icon: '🎭', label: 'Event Access', desc: 'Sold-out events · private previews', val: 'VIP' },
  ];
  return {
    name: 'Mobile — Benefits', type: 'frame', width: W, height: H, fill: C.bg, x: 0, y: 0,
    children: [
      F(0, 0, W, H, C.bg, {}),
      orb(W * 0.7, 100, 120, '#3030A0', 0.20),

      T(24, 60, W - 48, 18, 'MIST BLACK', { sz: 9, fw: 400, c: C.gold, ls: 4 }),
      T(24, 80, W - 48, 36, 'Your benefits', { sz: 28, fw: 200, c: C.white }),

      // Benefits list
      ...perks.map((p, i) =>
        F(24, 132 + i * 90, W - 48, 78, C.surface, { r: 12,
          sw: 1, sc: C.border,
          children: [
            // Icon
            F(16, 16, 46, 46, C.surface2, { r: 23,
              children: [T(0, 12, 46, 22, p.icon, { sz: 18, align: 'center' })] }),
            // Text
            T(76, 16, W - 160, 16, p.label, { sz: 13, fw: 500, c: C.white }),
            T(76, 36, W - 160, 26, p.desc, { sz: 10, fw: 300, c: C.muted, lh: 1.6 }),
            // Value
            T(W - 100, 22, 68, 30, p.val, { sz: 11, fw: 600, c: C.gold, align: 'right' }),
          ]
        })
      ),

      // Nav bar
      F(0, 748, W, 64, C.surface, { sw: 1, sc: C.border,
        children: [
          ...['◈', '⊞', '◇', '⊙'].map((icon, i) =>
            F(i * (W / 4), 0, W / 4, 64, 'transparent', { children: [
              T(0, 12, W / 4, 24, icon, { sz: 20, align: 'center', c: C.muted2 }),
              T(0, 38, W / 4, 14, ['Home','Discover','Concierge','Account'][i],
                { sz: 8, align: 'center', c: C.muted, ls: 0.5 }),
            ]})
          ),
        ]
      }),
    ]
  };
}

function mTransaction() {
  const W = 375, H = 812;
  return {
    name: 'Mobile — Transaction Detail', type: 'frame', width: W, height: H, fill: C.bg, x: 0, y: 0,
    children: [
      F(0, 0, W, H, C.bg, {}),
      orb(W * 0.5, 200, 180, '#6030A0', 0.18),

      // Back
      T(24, 60, 40, 24, '←', { sz: 20, c: C.white }),

      // Merchant icon
      F(W / 2 - 44, 108, 88, 88, C.surface2, { r: 44, sw: 2, sc: C.border2,
        children: [T(0, 24, 88, 40, '🍽', { sz: 32, align: 'center' })] }),

      // Merchant
      T(0, 212, W, 24, 'Nobu New York', { sz: 18, fw: 300, c: C.white, align: 'center' }),
      T(0, 240, W, 16, 'DINING  ·  TRIBECA, NYC', { sz: 9, fw: 400, c: C.muted, align: 'center', ls: 2 }),

      // Amount
      T(0, 276, W, 52, '$340.00', { sz: 44, fw: 100, c: C.white, align: 'center', ls: -1 }),
      T(0, 330, W, 16, '+ $68 cashback earned', { sz: 11, fw: 400, c: C.teal, align: 'center' }),

      // Details card
      F(24, 364, W - 48, 220, C.surface, { r: 16, sw: 1, sc: C.border,
        children: [
          ...[
            ['Date', 'Mar 17, 2026  ·  8:42 PM'],
            ['Card', '•••• 4291  ·  MIST Black'],
            ['Category', 'Fine Dining'],
            ['Cashback', '+$68.00  (20%)'],
            ['Status', '✓  Settled'],
          ].map(([k, v], i) => [
            T(20, 20 + i * 38, 120, 16, k, { sz: 10, fw: 400, c: C.muted, ls: 1 }),
            T(140, 20 + i * 38, W - 200, 16, v, {
              sz: 11, fw: 400,
              c: k === 'Cashback' ? C.teal : k === 'Status' ? C.teal : C.white,
              align: 'right' }),
          ]).flat(),
        ]
      }),

      // Actions
      F(24, 600, (W - 56) / 2, 48, C.gold, { r: 12,
        children: [T(0, 14, (W - 56) / 2, 20, 'Add Note', { sz: 12, fw: 600, c: C.bg, align: 'center' })] }),
      F(24 + (W - 56) / 2 + 8, 600, (W - 56) / 2, 48, C.surface, { r: 12, sw: 1, sc: C.border,
        children: [T(0, 14, (W - 56) / 2, 20, 'Dispute', { sz: 12, fw: 400, c: C.muted, align: 'center' })] }),
    ]
  };
}

function dDashboard() {
  const W = 1440, H = 900;
  return {
    name: 'Desktop — Dashboard', type: 'frame', width: W, height: H, fill: C.bg, x: 0, y: 0,
    children: [
      F(0, 0, W, H, C.bg, {}),
      orb(W * 0.7, H * 0.3, 300, '#3030A0', 0.15),
      orb(W * 0.2, H * 0.8, 200, '#8040C0', 0.10),
      orb(W * 0.95, H * 0.8, 180, '#C9A84C', 0.08),

      // Sidebar
      F(0, 0, 220, H, C.surface, { sw: 1, sc: C.border,
        children: [
          T(28, 32, 120, 24, 'MIST', { sz: 16, fw: 200, c: C.white, ls: 6 }),
          ...['◈  Overview', '⊞  Discover', '◇  Concierge', '⧉  Analytics', '⊙  Account'].map((item, i) => {
            const active = i === 0;
            return F(12, 90 + i * 52, 196, 40,
              active ? C.surface2 : 'transparent', { r: 8,
              children: [
                T(16, 12, 164, 16, item,
                  { sz: 12, fw: active ? 500 : 400, c: active ? C.white : C.muted }),
              ]});
          }),
          // Bottom: card preview
          MistCard(20, H - 200, 180, 114, { r: 10, name: 'A. RAKIS' }),
          T(20, H - 72, 180, 14, 'MIST Black  ·  Active', { sz: 9, fw: 400, c: C.muted, ls: 1.5 }),
        ]
      }),

      // Main content
      // Header
      T(260, 40, 500, 28, 'Good evening, Rakis', { sz: 22, fw: 200, c: C.white }),
      T(260, 72, 300, 16, 'Here\'s your financial overview', { sz: 12, fw: 300, c: C.muted }),

      // KPI row
      ...[
        ['BALANCE', '$48,291', '+2.4%', C.teal],
        ['SPENT THIS MONTH', '$12,480', '-$3,200 YoY', C.muted],
        ['CASHBACK EARNED', '$2,496', '20% avg', C.gold],
        ['CONCIERGE SAVES', '14 hrs', 'this month', C.teal],
      ].map(([label, value, sub, vc], i) =>
        F(260 + i * 290, 112, 270, 100, C.surface, { r: 12, sw: 1, sc: C.border,
          children: [
            T(20, 18, 230, 12, label, { sz: 8, fw: 400, c: C.muted, ls: 2.5 }),
            T(20, 36, 230, 32, value, { sz: 26, fw: 200, c: C.white }),
            T(20, 72, 160, 16, sub, { sz: 10, fw: 400, c: vc }),
          ]
        })
      ),

      // Spending by category
      F(260, 232, 560, 320, C.surface, { r: 12, sw: 1, sc: C.border,
        children: [
          T(20, 20, 300, 16, 'SPENDING BREAKDOWN', { sz: 9, fw: 400, c: C.muted, ls: 3 }),
          ...[
            ['Dining',     0.35, C.gold,  '$4,368'],
            ['Travel',     0.28, C.teal,  '$3,494'],
            ['Hotels',     0.20, '#9060D0','$2,496'],
            ['Shopping',   0.12, C.red,   '$1,498'],
            ['Other',      0.05, C.muted2,'$624'],
          ].map(([cat, pct, color, val], i) => [
            T(20, 52 + i * 50, 100, 14, cat, { sz: 11, fw: 400, c: C.white }),
            SpendBar(130, 59 + i * 50, 320, pct, color),
            T(460, 52 + i * 50, 80, 14, val, { sz: 11, fw: 400, c: C.muted, align: 'right' }),
            // Pct label
            T(130, 72 + i * 50, 60, 10, Math.round(pct * 100) + '%',
              { sz: 9, fw: 400, c: C.muted }),
          ]).flat(),
        ]
      }),

      // Recent transactions
      F(840, 232, W - 880, 320, C.surface, { r: 12, sw: 1, sc: C.border,
        children: [
          T(20, 20, 300, 16, 'RECENT ACTIVITY', { sz: 9, fw: 400, c: C.muted, ls: 3 }),
          TxRow(20, 44, W - 920, '🍽', 'Nobu New York', 'DINING', '340.00'),
          TxRow(20, 104, W - 920, '✈', 'Delta Air Lines', 'TRAVEL', '1,240.00'),
          TxRow(20, 164, W - 920, '🏨', 'Four Seasons', 'HOTEL', '890.00'),
          TxRow(20, 224, W - 920, '◇', 'Concierge Service', 'SERVICE', '0.00'),
        ]
      }),

      // Experiences
      F(260, 572, W - 300, 200, C.surface2, { r: 12, sw: 1, sc: C.border,
        children: [
          T(20, 20, 300, 16, 'MIST SELECTS  ·  THIS WEEK', { sz: 9, fw: 400, c: C.gold, ls: 3 }),
          ...[
            { emoji: '🍾', name: 'Masa, NYC', tag: 'Dining' },
            { emoji: '🏔', name: 'Aman Kyoto', tag: 'Hotel' },
            { emoji: '🎭', name: 'The Met Gala', tag: 'Event' },
            { emoji: '🛥', name: 'Monaco GP', tag: 'Sport' },
          ].map((e, i) =>
            F(20 + i * 280, 48, 260, 132, C.surface, { r: 10, sw: 1, sc: C.border,
              children: [
                T(0, 16, 260, 36, e.emoji, { sz: 28, align: 'center' }),
                T(16, 60, 228, 16, e.name, { sz: 12, fw: 500, c: C.white, align: 'center' }),
                T(16, 80, 228, 14, e.tag, { sz: 9, fw: 400, c: C.muted, align: 'center', ls: 2 }),
                T(16, 104, 228, 14, 'Book now →', { sz: 10, fw: 400, c: C.gold, align: 'center' }),
              ]
            })
          ),
        ]
      }),

      // Top bar right
      T(W - 200, 40, 180, 20, '◇  Concierge', { sz: 13, fw: 400, c: C.gold, align: 'right' }),
      T(W - 100, 64, 80, 14, '🔔  3', { sz: 12, fw: 400, c: C.muted, align: 'right' }),
    ]
  };
}

function dAnalytics() {
  const W = 1440, H = 900;
  // Monthly spend data (12 months)
  const monthly = [820,1200,980,1560,2100,1840,2460,1980,2840,3120,2680,3490];
  const maxSpend = Math.max(...monthly);
  const barW = 36, barGap = 20, chartW = monthly.length * (barW + barGap) - barGap;
  const chartH = 180;

  return {
    name: 'Desktop — Analytics', type: 'frame', width: W, height: H, fill: C.bg, x: 0, y: 0,
    children: [
      F(0, 0, W, H, C.bg, {}),
      orb(W * 0.8, H * 0.2, 260, '#4040B0', 0.12),
      orb(W * 0.1, H * 0.7, 200, '#C9A84C', 0.08),

      // Sidebar (same as dashboard)
      F(0, 0, 220, H, C.surface, { sw: 1, sc: C.border,
        children: [
          T(28, 32, 120, 24, 'MIST', { sz: 16, fw: 200, c: C.white, ls: 6 }),
          ...['◈  Overview', '⊞  Discover', '◇  Concierge', '⧉  Analytics', '⊙  Account'].map((item, i) => {
            const active = i === 3;
            return F(12, 90 + i * 52, 196, 40,
              active ? C.surface2 : 'transparent', { r: 8,
              children: [
                T(16, 12, 164, 16, item,
                  { sz: 12, fw: active ? 500 : 400, c: active ? C.white : C.muted }),
              ]});
          }),
          MistCard(20, H - 200, 180, 114, { r: 10, name: 'A. RAKIS' }),
        ]
      }),

      // Header
      T(260, 40, 500, 28, 'Spending Analytics', { sz: 22, fw: 200, c: C.white }),
      T(260, 72, 400, 16, 'Full year overview  ·  2026', { sz: 12, fw: 300, c: C.muted }),

      // Spend chart card
      F(260, 112, W - 300, 280, C.surface, { r: 12, sw: 1, sc: C.border,
        children: [
          T(24, 20, 300, 16, 'MONTHLY SPEND', { sz: 9, fw: 400, c: C.muted, ls: 3 }),
          T(24, 40, 300, 32, '$24,070', { sz: 28, fw: 200, c: C.white }),
          T(24, 76, 200, 14, 'Total spend YTD', { sz: 10, fw: 300, c: C.muted }),
          // Chart bars
          ...monthly.map((val, i) => {
            const bh = Math.round((val / maxSpend) * chartH);
            const bx = 24 + i * (barW + barGap);
            const by = 250 - bh;
            const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];
            const isCurrentMonth = i === 2; // March
            return [
              F(bx, by, barW, bh,
                isCurrentMonth
                  ? lg(180, [[0, C.gold2], [1, C.gold]])
                  : lg(180, [[0, C.border2], [1, C.surface2]]),
                { r: 4 }),
              T(bx, 258, barW, 12, months[i],
                { sz: 8, fw: 400, c: isCurrentMonth ? C.gold : C.muted, align: 'center' }),
            ];
          }).flat(),
        ]
      }),

      // Category breakdown + top merchants row
      F(260, 412, 480, 360, C.surface, { r: 12, sw: 1, sc: C.border,
        children: [
          T(20, 20, 300, 16, 'BY CATEGORY', { sz: 9, fw: 400, c: C.muted, ls: 3 }),
          ...[
            ['🍽  Dining',   '$4,368', 0.36, C.gold],
            ['✈  Travel',   '$3,494', 0.29, C.teal],
            ['🏨  Hotels',   '$2,496', 0.21, '#9060D0'],
            ['🛍  Shopping', '$1,498', 0.12, C.red],
            ['···  Other',   '$1,214', 0.10, C.muted2],
          ].map(([cat, val, pct, color], i) => [
            T(20, 52 + i * 56, 200, 14, cat, { sz: 11, fw: 400, c: C.white }),
            T(20, 68 + i * 56, 200, 12, val, { sz: 10, fw: 400, c: C.muted }),
            SpendBar(220, 57 + i * 56, 200, pct, color),
            T(430, 52 + i * 56, 40, 14, Math.round(pct * 100) + '%',
              { sz: 10, fw: 400, c: color, align: 'right' }),
          ]).flat(),
        ]
      }),

      F(760, 412, W - 800, 360, C.surface, { r: 12, sw: 1, sc: C.border,
        children: [
          T(20, 20, 300, 16, 'TOP MERCHANTS', { sz: 9, fw: 400, c: C.muted, ls: 3 }),
          ...[
            ['🍽', 'Nobu New York',   'Dining',  '$1,840'],
            ['✈', 'Delta Air Lines', 'Travel',  '$3,240'],
            ['🏨', 'Four Seasons',    'Hotel',   '$2,680'],
            ['🎭', 'Art Basel',       'Events',  '$920'],
            ['◇', 'MIST Concierge',  'Service', '$0'],
          ].map(([icon, name, cat, amount], i) => [
            E(20, 52 + i * 56, 40, 40, C.surface2),
            T(20, 52 + i * 56, 40, 40, icon, { sz: 16, align: 'center' }),
            T(72, 56 + i * 56, 200, 14, name, { sz: 11, fw: 500, c: C.white }),
            T(72, 73 + i * 56, 120, 12, cat, { sz: 9, fw: 400, c: C.muted, ls: 1 }),
            T(W - 860, 56 + i * 56, 80, 14, amount,
              { sz: 11, fw: 400, c: C.white, align: 'right' }),
          ]).flat(),
        ]
      }),
    ]
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// BUILD PEN
// ─────────────────────────────────────────────────────────────────────────────

function buildPen() {
  return {
    version: '2.8',
    children: [
      mHome(),
      mDiscover(),
      mBenefits(),
      mTransaction(),
      dDashboard(),
      dAnalytics(),
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLISH
// ─────────────────────────────────────────────────────────────────────────────

async function postZenbin(slug, title, html, subdomain = 'ram') {
  const body = JSON.stringify({ title, html });
  return new Promise((resolve, reject) => {
    const r = https.request({
      hostname: 'zenbin.org', path: `/v1/pages/${slug}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain': subdomain,
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    r.on('error', reject);
    r.write(body); r.end();
  });
}

async function main() {
  const pen = buildPen();
  const penPath = __dirname + '/mist.pen';
  fs.writeFileSync(penPath, JSON.stringify(pen, null, 2));
  console.log('✓ mist.pen written');

  const viewerHtml = fs.readFileSync(__dirname + '/penviewer-app.html', 'utf8');
  const penJson = JSON.stringify(pen);
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  const shareHtml = viewerHtml.replace('<script>', injection + '\n<script>');

  console.log('→ Publishing mist...');
  const r = await postZenbin('mist', 'MIST — Luxury AI Concierge Card', shareHtml);
  const ok = r.status === 200 || r.status === 201;
  console.log(`  ${ok ? '✅' : '❌'} HTTP ${r.status}`);
  if (ok) console.log('  https://ram.zenbin.org/mist');
  else    console.log(' ', r.body.slice(0, 300));
}

main().catch(e => { console.error(e); process.exit(1); });
