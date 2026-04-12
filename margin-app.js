'use strict';
// margin-app.js
// MARGIN — AI Arbitrage Intelligence for Marketplace Flippers
//
// Inspired by:
//   • Spread.app deal-scoring cards on land-book.com (joinspread.app)
//   • Midday.ai dark finance transactions UI on darkmodedesign.com
//   • Stripe Sessions' large type + scrolling animation (godly.website FT.961)
//   • Good Fella studio's minimal premium dark feel — Awwwards SOTD Mar 18, 2026

const https = require('https');
const fs    = require('fs');
const path  = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#080808',   // near-void black
  surface:  '#111111',   // elevated surface
  card:     '#171717',   // card background
  border:   '#202020',   // subtle border
  border2:  '#2a2a2a',   // stronger border
  muted:    '#454545',   // muted / disabled
  dim:      '#333333',   // dimmed text
  fg:       '#f0f0f0',   // primary text
  fg2:      '#aaaaaa',   // secondary text
  profit:   '#00e87a',   // electric green — profit / positive
  loss:     '#ff5555',   // red — loss / negative
  warn:     '#f5c842',   // amber — medium score
  ai:       '#4d9eff',   // AI blue — score, analysis
  orange:   '#ff6b35',   // risk / medium risk
};

let _id = 0;
const uid = () => `m${++_id}`;

// ── Primitives ────────────────────────────────────────────────────────────────
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
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Line  = (x, y, w, fill = P.border)  => F(x, y, w, 1, fill, {});
const VLine = (x, y, h, fill = P.border)  => F(x, y, 1, h, fill, {});

// ── Status dot ────────────────────────────────────────────────────────────────
const Dot = (x, y, color) => E(x, y, 7, 7, color, {});

// ── Pill badge ────────────────────────────────────────────────────────────────
const Pill = (x, y, text, bg, fg) => {
  const w = text.length * 6.5 + 18;
  return F(x, y, w, 20, bg, {
    r: 10,
    ch: [T(text, 9, 3, w - 18, 14, { size: 9, fill: fg, weight: 700, ls: 0.6 })],
  });
};

// ── Score arc (simplified as nested ellipses) ─────────────────────────────────
const ScoreRing = (cx, cy, score, color) => {
  const r1 = 28, r2 = 22;
  return [
    E(cx - r1, cy - r1, r1 * 2, r1 * 2, P.border2, {}),
    E(cx - r2, cy - r2, r2 * 2, r2 * 2, P.bg,      {}),
    // colored partial fill based on score
    E(cx - r1, cy - r1, r1 * 2, r1 * 2, color, { opacity: (score / 100) * 0.6 }),
    E(cx - r2, cy - r2, r2 * 2, r2 * 2, P.bg,      {}),
    T(String(score), cx - 20, cy - 12, 40, 24, { size: 18, weight: 900, fill: color, align: 'center' }),
  ];
};

// ── Bar chart segment ─────────────────────────────────────────────────────────
const Bar = (x, y, w, totalH, pct, fill) => {
  const bh = Math.round(totalH * pct);
  return [
    F(x, y, w, totalH, P.surface, { r: 3 }),
    F(x, y + (totalH - bh), w, bh, fill, { r: 3 }),
  ];
};

// ── Deal row (compact list item) ──────────────────────────────────────────────
function DealRow(x, y, opts) {
  const { icon, name, platform, listed, resale, profit, score, color, last } = opts;
  const ch = [
    // icon box
    F(0, 8, 32, 32, P.border2, { r: 8, ch: [
      T(icon, 0, 6, 32, 20, { size: 14, align: 'center' }),
    ]}),
    // name + platform
    T(name, 42, 8, 160, 16, { size: 13, weight: 600, fill: P.fg }),
    T(platform, 42, 27, 120, 12, { size: 10, fill: P.fg2 }),
    // prices
    T(`$${listed}`, 200, 8, 55, 14, { size: 12, fill: P.fg2, align: 'right' }),
    T(`→ $${resale}`, 258, 8, 60, 14, { size: 12, fill: P.profit, weight: 600, align: 'right' }),
    T(`+$${profit}`, 200, 26, 118, 14, { size: 11, fill: color, weight: 700, align: 'right' }),
    // score dot
    ...ScoreRing(337, 24, score, color).slice(0, 1), // just the outer ring as dot
    Dot(333, 20, color),
    T(String(score), 326, 14, 22, 14, { size: 10, weight: 800, fill: color, align: 'right' }),
  ];
  if (!last) ch.push(Line(0, 49, 360));
  return F(x, y, 360, 50, '#00000000', { ch });
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — HERO / LANDING
// ══════════════════════════════════════════════════════════════════════════════
function screenHero(ox) {
  return F(ox, 0, 375, 812, P.bg, { clip: true, ch: [

    // ── ambient glow top ──
    E(-60, -60, 280, 280, P.profit, { opacity: 0.04 }),
    E(200, 600, 200, 200, P.ai,    { opacity: 0.05 }),

    // ── Nav ──
    T('MARGIN', 20, 24, 120, 20, { size: 15, weight: 900, ls: 3, fill: P.fg }),
    Pill(280, 22, 'BETA', P.profit + '22', P.profit),

    // ── Hero copy ──
    T('Find what\'s', 20, 80, 280, 52, { size: 44, weight: 900, fill: P.fg, ls: -1.5 }),
    T('underpriced.', 20, 132, 300, 52, { size: 44, weight: 900, fill: P.profit, ls: -1.5 }),
    T('Sell it for', 20, 184, 250, 52, { size: 44, weight: 900, fill: P.fg, ls: -1.5 }),
    T('what it\'s worth.', 20, 236, 330, 52, { size: 44, weight: 900, fill: P.fg, ls: -1.5 }),

    T('AI scans every marketplace, scores every deal,\nand drafts your listing in one tap.', 20, 300, 320, 44,
      { size: 14, fill: P.fg2, lh: 22, weight: 400 }),

    // ── CTA buttons ──
    F(20, 362, 200, 48, P.profit, { r: 8, ch: [
      T('Start for free', 0, 14, 200, 20, { size: 14, weight: 700, fill: P.bg, align: 'center' }),
    ]}),
    F(232, 362, 123, 48, '#00000000', { r: 8, stroke: P.border2, sw: 1, ch: [
      T('See a deal →', 0, 14, 123, 20, { size: 13, fill: P.fg2, align: 'center' }),
    ]}),

    // ── Floating deal preview card ──
    F(20, 430, 335, 108, P.surface, { r: 16, stroke: P.border2, sw: 1, ch: [
      // score ring stub
      F(0, 0, 4, 108, P.profit, { r: 2 }),
      // header
      T('🔥 AI DEAL SCORE', 16, 14, 160, 12, { size: 9, weight: 700, fill: P.profit, ls: 1.5 }),
      T('94', 290, 10, 32, 24, { size: 22, weight: 900, fill: P.profit, align: 'right' }),
      T('/100', 300, 26, 24, 12, { size: 9, fill: P.fg2 }),
      // item
      T('Breville Oracle Touch Espresso', 16, 34, 260, 16, { size: 13, weight: 600, fill: P.fg }),
      T('FB Marketplace · Nashville', 16, 54, 200, 12, { size: 10, fill: P.fg2 }),
      // price row
      F(16, 74, 298, 1, P.border, {}),
      T('Listed', 16, 82, 60, 12, { size: 9, fill: P.fg2 }),
      T('Resale', 120, 82, 60, 12, { size: 9, fill: P.fg2 }),
      T('Profit', 240, 82, 60, 12, { size: 9, fill: P.profit, weight: 700 }),
      T('$1,200', 16, 94, 80, 14, { size: 12, fill: P.fg }),
      T('$1,800', 120, 94, 80, 14, { size: 12, fill: P.fg }),
      T('+$500', 240, 94, 80, 14, { size: 13, weight: 800, fill: P.profit }),
    ]}),

    // ── Stats strip ──
    F(20, 556, 335, 60, P.surface, { r: 12, ch: [
      VLine(110, 12, 36, P.border),
      VLine(222, 12, 36, P.border),
      T('6', 36, 10, 36, 20, { size: 18, weight: 900, fill: P.profit, align: 'center' }),
      T('PLATFORMS', 18, 32, 72, 12, { size: 8, fill: P.fg2, ls: 0.8, align: 'center' }),
      T('12s', 148, 10, 36, 20, { size: 18, weight: 900, fill: P.ai, align: 'center' }),
      T('AVG ALERT', 130, 32, 72, 12, { size: 8, fill: P.fg2, ls: 0.8, align: 'center' }),
      T('$380', 250, 10, 60, 20, { size: 18, weight: 900, fill: P.warn, align: 'center' }),
      T('AVG PROFIT', 232, 32, 72, 12, { size: 8, fill: P.fg2, ls: 0.8, align: 'center' }),
    ]}),

    // ── Ticker tape ──
    F(0, 634, 375, 28, P.surface, { ch: [
      Line(0, 0, 375, P.border),
      Line(0, 27, 375, P.border),
      T('NEW DEAL ↗ · Technics SL-1200GR · +$305 · NEW DEAL ↗ · Le Creuset Dutch Oven · +$107 · NEW DEAL ↗ · Aeron Chair · +$240 ·', 0, 7, 800, 14,
        { size: 10, fill: P.profit, weight: 600, ls: 0.5 }),
    ]}),

    // ── Social proof ──
    T('Trusted by 2,400+ active flippers', 20, 676, 280, 16, { size: 12, fill: P.fg2, align: 'center' }),
    T('★★★★★  4.9 / 5.0', 90, 698, 190, 16, { size: 13, weight: 700, fill: P.warn, align: 'center' }),

    // ── Bottom nav ──
    F(0, 732, 375, 80, P.surface, { ch: [
      Line(0, 0, 375, P.border),
      ...[['⚡','Deals',0,true], ['📊','Analytics',1,false], ['🎯','Niches',2,false], ['👤','Profile',3,false]].map(([icon,label,i,active]) => {
        const nx = 28 + i * 82;
        return [
          F(nx + 10, 8, 44, 44, active ? P.profit + '18' : '#00000000', { r: 22 }),
          T(icon, nx+14, 14, 36, 24, { size: 16, fill: active ? P.profit : P.muted }),
          T(label, nx, 42, 64, 14, { size: 9, fill: active ? P.profit : P.muted, align: 'center', weight: active?700:400 }),
        ];
      }).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — DEAL FEED
// ══════════════════════════════════════════════════════════════════════════════
function screenFeed(ox) {
  const deals = [
    { icon:'☕', name:'Breville Oracle Touch',    platform:'FB Marketplace · Nashville', listed:'1,200', resale:'1,800', profit:'500', score:94, color:P.profit },
    { icon:'🪑', name:'Herman Miller Aeron B',    platform:'Craigslist · Austin',        listed:'480',   resale:'710',   profit:'195', score:91, color:P.profit },
    { icon:'🔊', name:'Technics SL-1200GR',       platform:'FB Marketplace · Portland',  listed:'900',   resale:'1,280', profit:'305', score:88, color:P.profit },
    { icon:'🍳', name:'Le Creuset Dutch Oven 7qt', platform:'OfferUp · Chicago',         listed:'180',   resale:'260',   profit:'62',  score:76, color:P.warn   },
    { icon:'📷', name:'Sony A7 III Body',         platform:'FB Marketplace · Denver',    listed:'1,100', resale:'1,340', profit:'185', score:72, color:P.warn   },
    { icon:'💻', name:'M1 MacBook Pro 14"',       platform:'Craigslist · LA',            listed:'1,450', resale:'1,680', profit:'178', score:68, color:P.warn   },
    { icon:'🔧', name:'DeWalt 20V Drill Kit',     platform:'OfferUp · Houston',          listed:'95',    resale:'155',   profit:'43',  score:55, color:P.orange },
  ];

  const rows = deals.map((d, i) =>
    DealRow(8, 14 + i * 54, { ...d, last: i === deals.length - 1 })
  );

  return F(ox, 0, 375, 812, P.bg, { clip: true, ch: [

    // ── status bar ──
    T('9:41', 16, 14, 60, 14, { size: 11, weight: 600 }),
    T('●●●', 310, 14, 48, 14, { size: 8, fill: P.muted }),

    // ── header ──
    T('MARGIN', 20, 36, 100, 20, { size: 15, weight: 900, ls: 3 }),
    Pill(252, 34, 'LIVE', P.profit + '22', P.profit),
    Dot(284, 38, P.profit),
    F(310, 30, 40, 28, P.surface, { r: 8, stroke: P.border, sw: 1, ch: [
      T('⚙', 0, 5, 40, 18, { size: 13, align: 'center' }),
    ]}),

    // ── filter strip ──
    F(0, 64, 375, 36, P.surface, { ch: [
      Line(0, 0, 375, P.border),
      Line(0, 35, 375, P.border),
      ...[['All', true], ['Score 80+', false], ['< $500', false], ['Electronics', false]].map(([label, active], i) => {
        const px = 12 + i * 88;
        return F(px, 6, label.length * 7 + 18, 24, active ? P.profit : '#00000000', {
          r: 12, stroke: active ? P.profit : P.border, sw: 1,
          ch: [T(label, 9, 5, label.length * 7, 14, { size: 10, fill: active ? P.bg : P.fg2, weight: active?700:400 })],
        });
      }),
    ]}),

    // ── deal count ──
    T('247 live opportunities', 16, 112, 200, 16, { size: 11, fill: P.fg2 }),
    T('updated 8s ago', 260, 112, 96, 16, { size: 10, fill: P.profit, align: 'right' }),

    // ── deal list ──
    F(8, 134, 360, deals.length * 54, P.surface, { r: 12, stroke: P.border, sw: 1, ch: rows }),

    // ── AI insight card ──
    F(8, 530, 360, 64, P.ai + '12', { r: 12, stroke: P.ai + '44', sw: 1, ch: [
      T('⚡ AI INSIGHT', 14, 12, 160, 12, { size: 9, weight: 800, fill: P.ai, ls: 1.5 }),
      T('Espresso machines up 22% on eBay this week.\nConsider targeting La Marzocco and Rocket Espresso.', 14, 28, 330, 30,
        { size: 11, fill: P.fg2, lh: 16 }),
    ]}),

    // ── bottom nav ──
    F(0, 732, 375, 80, P.surface, { ch: [
      Line(0, 0, 375, P.border),
      ...[['⚡','Deals',0,true], ['📊','Analytics',1,false], ['🎯','Niches',2,false], ['👤','Profile',3,false]].map(([icon,label,i,active]) => {
        const nx = 28 + i * 82;
        return [
          F(nx + 10, 8, 44, 44, active ? P.profit + '18' : '#00000000', { r: 22 }),
          T(icon, nx+14, 14, 36, 24, { size: 16, fill: active ? P.profit : P.muted }),
          T(label, nx, 42, 64, 14, { size: 9, fill: active ? P.profit : P.muted, align: 'center', weight: active?700:400 }),
        ];
      }).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — DEAL DETAIL
// ══════════════════════════════════════════════════════════════════════════════
function screenDetail(ox) {
  return F(ox, 0, 375, 812, P.bg, { clip: true, ch: [

    // status
    T('9:41', 16, 14, 60, 14, { size: 11, weight: 600 }),

    // back header
    T('← Back', 16, 36, 80, 18, { size: 13, fill: P.fg2 }),
    T('Deal Analysis', 96, 36, 180, 18, { size: 13, weight: 700, fill: P.fg, align: 'center' }),

    // score hero
    F(20, 64, 335, 120, P.surface, { r: 16, stroke: P.border, sw: 1, ch: [
      F(0, 0, 4, 120, P.profit, { r: 2 }),

      // score ring
      ...ScoreRing(52, 60, 94, P.profit),
      T('AI SCORE', 28, 88, 52, 12, { size: 8, fill: P.profit, ls: 0.8, align: 'center' }),

      // title block
      T('Breville Oracle Touch', 88, 12, 228, 18, { size: 15, weight: 700, fill: P.fg }),
      T('Espresso Machine', 88, 34, 228, 14, { size: 11, fill: P.fg2 }),
      Pill(88, 54, 'FB Marketplace', P.border2, P.fg2),
      Pill(196, 54, 'Nashville, TN', P.border2, P.fg2),

      // profit tag
      F(88, 82, 100, 28, P.profit + '22', { r: 8, ch: [
        T('+$500 profit', 8, 6, 84, 16, { size: 11, weight: 800, fill: P.profit }),
      ]}),
      Pill(200, 86, 'HIGH CONFIDENCE', P.profit + '18', P.profit),
    ]}),

    // price breakdown
    F(20, 198, 335, 96, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
      T('PRICE BREAKDOWN', 16, 12, 200, 12, { size: 9, fill: P.fg2, ls: 1.5, weight: 600 }),
      Line(0, 28, 335, P.border),

      VLine(110, 36, 48, P.border),
      VLine(220, 36, 48, P.border),

      T('LISTED AT', 16, 36, 80, 10, { size: 8, fill: P.fg2, ls: 1 }),
      T('$1,200', 16, 50, 86, 20, { size: 18, weight: 900, fill: P.fg }),

      T('RESALE VALUE', 124, 36, 90, 10, { size: 8, fill: P.fg2, ls: 1 }),
      T('$1,800', 124, 50, 90, 20, { size: 18, weight: 900, fill: P.profit }),

      T('NET PROFIT', 232, 36, 90, 10, { size: 8, fill: P.profit, ls: 1, weight: 700 }),
      T('+$500', 232, 50, 90, 20, { size: 18, weight: 900, fill: P.profit }),
      T('after ~$100 fees', 232, 76, 90, 12, { size: 9, fill: P.fg2 }),
    ]}),

    // AI analysis
    F(20, 308, 335, 128, P.ai + '10', { r: 12, stroke: P.ai + '33', sw: 1, ch: [
      T('⚡ AI ANALYSIS', 14, 12, 200, 12, { size: 9, fill: P.ai, ls: 1.5, weight: 800 }),
      Line(0, 28, 335, P.ai + '22'),
      T('Breville Oracle Touch retails at $2,799 new. Used market\non eBay shows 23 sold listings averaging $1,820 in the\nlast 30 days. Listing at $1,750 will sell in 2–5 days.\nSuggest cash offer of $950–$1,050.', 14, 36, 308, 72,
        { size: 12, fill: P.fg2, lh: 18 }),
      T('⟳ Refreshed 4m ago', 14, 112, 200, 12, { size: 9, fill: P.ai, opacity: 0.7 }),
    ]}),

    // platform comparison
    F(20, 450, 335, 96, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
      T('BEST PLATFORMS TO RELIST', 16, 12, 240, 12, { size: 9, fill: P.fg2, ls: 1.5, weight: 600 }),
      Line(0, 28, 335, P.border),
      ...[
        ['eBay', '$1,820', 'Best', P.profit],
        ['Reverb', '$1,680', 'Good', P.warn],
        ['Facebook', '$1,550', 'Fast', P.ai],
      ].map(([platform, price, tag, color], i) => [
        T(platform, 16, 40 + i * 20, 80, 14, { size: 12, fill: P.fg }),
        T(price, 140, 40 + i * 20, 70, 14, { size: 12, weight: 700, fill: color }),
        Pill(230, 38 + i * 20, tag, color + '22', color),
      ]).flat(),
    ]}),

    // action buttons
    F(20, 560, 335, 48, P.profit, { r: 10, ch: [
      T('Generate Listing + Opener', 0, 14, 335, 20, { size: 14, weight: 700, fill: P.bg, align: 'center' }),
    ]}),
    F(20, 620, 160, 44, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      T('📋 Copy Message', 0, 12, 160, 20, { size: 12, fill: P.fg, align: 'center' }),
    ]}),
    F(195, 620, 160, 44, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      T('↗ Open Listing', 0, 12, 160, 20, { size: 12, fill: P.fg, align: 'center' }),
    ]}),

    // opener message preview
    F(20, 678, 335, 56, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      T('AI OPENER DRAFT', 12, 8, 160, 10, { size: 8, fill: P.ai, ls: 1.5, weight: 700 }),
      T('"Hi — is this still available? I can pick up\ntoday. Would you take $1,050 cash?"', 12, 22, 310, 28,
        { size: 11, fill: P.fg2, lh: 16 }),
    ]}),

    // bottom nav
    F(0, 752, 375, 60, P.surface, { ch: [
      Line(0, 0, 375, P.border),
      ...[['⚡','Deals',0,true], ['📊','Analytics',1,false], ['🎯','Niches',2,false], ['👤','Profile',3,false]].map(([icon,label,i,active]) => {
        const nx = 28 + i * 82;
        return [
          T(icon, nx+14, 10, 36, 22, { size: 16, fill: active ? P.profit : P.muted }),
          T(label, nx, 34, 64, 14, { size: 9, fill: active ? P.profit : P.muted, align: 'center', weight: active?700:400 }),
        ];
      }).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — NICHE SELECTOR
// ══════════════════════════════════════════════════════════════════════════════
function screenNiches(ox) {
  const niches = [
    { icon:'☕', name:'Espresso Machines', avg:'$320', hot:true  },
    { icon:'🎶', name:'Vinyl Records',     avg:'$85',  hot:false },
    { icon:'📷', name:'Camera Gear',       avg:'$280', hot:true  },
    { icon:'🪑', name:'Mid-Century Furn.', avg:'$450', hot:false },
    { icon:'🔧', name:'Power Tools',       avg:'$175', hot:false },
    { icon:'💎', name:'Vintage Watches',   avg:'$580', hot:true  },
    { icon:'👟', name:'Sneakers',          avg:'$95',  hot:false },
    { icon:'🎸', name:'Guitar / Amps',     avg:'$210', hot:false },
    { icon:'💻', name:'Mac / Apple Gear',  avg:'$340', hot:true  },
    { icon:'🎮', name:'Gaming Consoles',   avg:'$125', hot:false },
    { icon:'🏋️', name:'Gym Equipment',     avg:'$155', hot:false },
    { icon:'🪴', name:'Designer Handbags', avg:'$420', hot:false },
  ];

  return F(ox, 0, 375, 812, P.bg, { clip: true, ch: [

    // header
    T('9:41', 16, 14, 60, 14, { size: 11, weight: 600 }),
    T('← Back', 16, 36, 70, 18, { size: 13, fill: P.fg2 }),
    T('My Niches', 100, 36, 175, 18, { size: 14, weight: 700, fill: P.fg, align: 'center' }),

    // subtitle
    T('Choose categories you know. AI scans all\nmarketplaces across your selected niches 24/7.', 20, 62, 335, 36,
      { size: 13, fill: P.fg2, lh: 20 }),

    // search bar
    F(20, 106, 335, 40, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      T('🔍', 12, 11, 22, 18, { size: 14 }),
      T('Search a niche — vintage, audio, tools...', 38, 12, 268, 16, { size: 12, fill: P.muted }),
    ]}),

    // active count
    T('4 ACTIVE NICHES', 20, 158, 160, 12, { size: 9, fill: P.profit, ls: 1.5, weight: 700 }),
    T('Recommended →', 240, 158, 115, 12, { size: 9, fill: P.ai, align: 'right' }),

    // niche grid (2 cols)
    ...niches.map((n, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const nx  = 20 + col * 174;
      const ny  = 178 + row * 82;
      const active = [0, 2, 5, 8].includes(i);
      return F(nx, ny, 162, 70, active ? P.profit + '14' : P.surface, {
        r: 12,
        stroke: active ? P.profit + '66' : P.border,
        sw: 1,
        ch: [
          T(n.icon, 12, 10, 28, 28, { size: 20 }),
          T(n.name, 44, 10, 106, 16, { size: 11, weight: 600, fill: P.fg }),
          T('avg +' + n.avg, 44, 30, 80, 12, { size: 10, fill: active ? P.profit : P.fg2 }),
          ...(n.hot ? [Pill(44, 48, '🔥 HOT', P.orange + '22', P.orange)] : []),
          ...(active ? [
            F(134, 10, 20, 20, P.profit, { r: 10, ch: [
              T('✓', 4, 2, 12, 16, { size: 11, weight: 800, fill: P.bg }),
            ]}),
          ] : []),
        ],
      });
    }),

    // CTA
    F(20, 724, 335, 48, P.profit, { r: 10, ch: [
      T('Save Niches (4 selected)', 0, 14, 335, 20, { size: 14, weight: 700, fill: P.bg, align: 'center' }),
    ]}),

    // bottom nav
    F(0, 780, 375, 32, P.surface, { ch: [
      Line(0, 0, 375, P.border),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — PROFIT ANALYTICS
// ══════════════════════════════════════════════════════════════════════════════
function screenAnalytics(ox) {
  const barData = [
    { label:'M', h:0.42, color: P.muted },
    { label:'T', h:0.65, color: P.muted },
    { label:'W', h:0.88, color: P.profit },
    { label:'T', h:0.55, color: P.muted },
    { label:'F', h:0.72, color: P.muted },
    { label:'S', h:0.38, color: P.muted },
    { label:'S', h:0.91, color: P.profit },
  ];

  return F(ox, 0, 375, 812, P.bg, { clip: true, ch: [

    // status
    T('9:41', 16, 14, 60, 14, { size: 11, weight: 600 }),

    // header
    T('Analytics', 20, 36, 200, 22, { size: 18, weight: 900, fill: P.fg }),
    Pill(240, 38, 'THIS WEEK', P.border2, P.fg2),

    // big profit number
    T('Total Profit', 20, 74, 180, 14, { size: 11, fill: P.fg2 }),
    T('$2,847', 20, 92, 220, 44, { size: 40, weight: 900, fill: P.profit, ls: -1.5 }),
    T('+18% vs last week', 20, 140, 200, 14, { size: 11, fill: P.profit }),

    // stat row
    F(20, 164, 335, 72, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
      VLine(110, 12, 48, P.border),
      VLine(222, 12, 48, P.border),

      T('DEALS', 16, 12, 80, 10, { size: 8, fill: P.fg2, ls: 1 }),
      T('14', 16, 28, 80, 24, { size: 22, weight: 900, fill: P.fg }),
      T('closed', 16, 54, 80, 12, { size: 9, fill: P.fg2 }),

      T('WIN RATE', 126, 12, 80, 10, { size: 8, fill: P.fg2, ls: 1 }),
      T('79%', 126, 28, 80, 24, { size: 22, weight: 900, fill: P.profit }),
      T('of deals closed', 126, 54, 88, 12, { size: 9, fill: P.fg2 }),

      T('BEST DEAL', 238, 12, 80, 10, { size: 8, fill: P.fg2, ls: 1 }),
      T('+$500', 238, 28, 80, 24, { size: 22, weight: 900, fill: P.profit }),
      T('Oracle Touch', 238, 54, 80, 12, { size: 9, fill: P.fg2 }),
    ]}),

    // bar chart
    T('DAILY PROFIT', 20, 252, 200, 12, { size: 9, fill: P.fg2, ls: 1.5, weight: 600 }),
    F(20, 270, 335, 120, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
      ...barData.map((b, i) => {
        const bx = 20 + i * 42;
        return [
          ...Bar(bx, 12, 32, 80, b.h, b.color),
          T(b.label, bx, 98, 32, 12, { size: 9, fill: P.fg2, align: 'center' }),
        ];
      }).flat(),
    ]}),

    // platform breakdown
    T('BY PLATFORM', 20, 406, 200, 12, { size: 9, fill: P.fg2, ls: 1.5, weight: 600 }),
    F(20, 424, 335, 132, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
      ...[
        ['eBay',        1480, 0.52, P.profit],
        ['FB Marketplace', 820, 0.29, P.ai   ],
        ['Reverb',      380, 0.13, P.warn  ],
        ['OfferUp',     167, 0.06, P.orange],
      ].map(([label, amt, pct, color], i) => [
        T(label, 16, 14 + i * 28, 100, 14, { size: 12, fill: P.fg }),
        F(120, 18 + i * 28, Math.round(160 * pct), 8, color, { r: 4, opacity: 0.8 }),
        F(120, 18 + i * 28, 160, 8, color, { r: 4, opacity: 0.12 }),
        T(`$${amt.toLocaleString()}`, 296, 14 + i * 28, 56, 14, { size: 12, fill: color, weight: 700, align: 'right' }),
      ]).flat(),
    ]}),

    // AI insight
    F(20, 572, 335, 56, P.ai + '10', { r: 12, stroke: P.ai + '33', sw: 1, ch: [
      T('⚡ AI PATTERN DETECTED', 14, 10, 220, 10, { size: 9, fill: P.ai, ls: 1.5, weight: 800 }),
      T('Espresso machine deals convert 2.4x faster than\nyour other niches. Consider increasing your budget.', 14, 26, 306, 26,
        { size: 11, fill: P.fg2, lh: 16 }),
    ]}),

    // monthly total
    F(20, 642, 335, 60, P.surface, { r: 12, stroke: P.border, sw: 1, ch: [
      T('MONTH TO DATE', 16, 10, 200, 10, { size: 9, fill: P.fg2, ls: 1.5, weight: 600 }),
      T('$8,240', 16, 28, 180, 24, { size: 22, weight: 900, fill: P.profit }),
      T('March 2026', 200, 28, 120, 24, { size: 11, fill: P.fg2, align: 'right' }),
      T('+31% vs February', 16, 52, 180, 12, { size: 9, fill: P.profit }),
    ]}),

    // bottom nav
    F(0, 732, 375, 80, P.surface, { ch: [
      Line(0, 0, 375, P.border),
      ...[['⚡','Deals',0,false], ['📊','Analytics',1,true], ['🎯','Niches',2,false], ['👤','Profile',3,false]].map(([icon,label,i,active]) => {
        const nx = 28 + i * 82;
        return [
          F(nx + 10, 8, 44, 44, active ? P.profit + '18' : '#00000000', { r: 22 }),
          T(icon, nx+14, 14, 36, 24, { size: 16, fill: active ? P.profit : P.muted }),
          T(label, nx, 42, 64, 14, { size: 9, fill: active ? P.profit : P.muted, align: 'center', weight: active?700:400 }),
        ];
      }).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// ASSEMBLE .PEN DOC
// ══════════════════════════════════════════════════════════════════════════════
const GAP = 60;
const SW  = 375;

const doc = {
  version: '2.8',
  width:  (SW + GAP) * 5 + GAP,
  height: 812,
  children: [
    screenHero    (GAP + 0 * (SW + GAP)),
    screenFeed    (GAP + 1 * (SW + GAP)),
    screenDetail  (GAP + 2 * (SW + GAP)),
    screenNiches  (GAP + 3 * (SW + GAP)),
    screenAnalytics(GAP + 4 * (SW + GAP)),
  ],
};

const penPath = path.join(__dirname, 'margin-app.pen');
fs.writeFileSync(penPath, JSON.stringify(doc, null, 2));
console.log('✓ margin-app.pen written');
console.log(`  Screens: ${doc.children.length}`);
console.log(`  Canvas:  ${doc.width} × ${doc.height}`);
console.log(`  File:    ${(fs.statSync(penPath).size / 1024).toFixed(1)} KB`);
