// YIELD — Revenue Intelligence for Indie Makers
// Inspired by: Midday.ai (darkmodedesign.com) — dark minimal finance for solopreneurs
//              Equals GTM analytics (land-book.com) — data-forward SaaS layout
//              Mixpanel (godly.website) — clean product analytics card patterns
// Trend: "Quiet Clarity" — deep dark backgrounds, monospace number typography,
//         electric violet/mint accent system, floating card hierarchy with subtle glow
// Theme: DARK (previous was light/mira)

'use strict';
const fs = require('fs');

const SLUG = 'yield';
const APP_NAME = 'Yield';
const TAGLINE = 'Know exactly where your money comes from';

const p = {
  bg:        '#07070F',   // near-black, deep space
  surface:   '#0F0F1C',   // dark navy surface
  surface2:  '#161628',   // slightly lighter card
  surface3:  '#1E1E35',   // hover/active state
  text:      '#E6E3FF',   // soft lavender white
  textMuted: 'rgba(230,227,255,0.38)',
  accent:    '#7C6FFF',   // electric violet
  accent2:   '#3DFFC0',   // mint green (positive/up)
  accent3:   '#FF6B6B',   // coral red (negative/down)
  accent4:   '#FFD166',   // amber (neutral/goals)
  border:    'rgba(124,111,255,0.12)',
  borderDim: 'rgba(230,227,255,0.07)',
  glow:      'rgba(124,111,255,0.18)',
};

// Helper: render a pill tag
function pill(x, y, text, color, textColor = '#FFFFFF') {
  return [
    { type: 'rect', x, y, w: text.length * 7 + 14, h: 18, rx: 9, fill: color },
    { type: 'text', x: x + (text.length * 7 + 14) / 2, y: y + 12, text, fontSize: 9, fontWeight: '700', color: textColor, textAnchor: 'middle' },
  ];
}

// Helper: status bar
function statusBar(bg = p.bg) {
  return [
    { type: 'rect', x: 0, y: 0, w: 390, h: 50, fill: bg },
    { type: 'text', x: 20, y: 18, text: '9:41', fontSize: 14, fontWeight: '600', color: p.text },
    { type: 'text', x: 355, y: 18, text: '●●●', fontSize: 10, color: p.textMuted },
  ];
}

// Helper: nav bar
function navBar(active) {
  const items = [
    { id: 'revenue', icon: '◈', label: 'Revenue', x: 35 },
    { id: 'sources', icon: '◉', label: 'Sources', x: 115 },
    { id: 'audience', icon: '◎', label: 'Audience', x: 195 },
    { id: 'txns', icon: '≡', label: 'Ledger', x: 275 },
    { id: 'goals', icon: '◇', label: 'Goals', x: 355 },
  ];
  const els = [
    { type: 'rect', x: 0, y: 790, w: 390, h: 54, fill: p.surface },
    { type: 'rect', x: 0, y: 790, w: 390, h: 1, fill: p.border },
  ];
  items.forEach(item => {
    const isActive = item.id === active;
    const color = isActive ? p.accent : p.textMuted;
    els.push({ type: 'text', x: item.x, y: 815, text: item.icon, fontSize: 16, color, textAnchor: 'middle', fontWeight: isActive ? '700' : '400' });
    els.push({ type: 'text', x: item.x, y: 832, text: item.label, fontSize: 8.5, color, textAnchor: 'middle', fontWeight: isActive ? '700' : '400' });
    if (isActive) {
      els.push({ type: 'rect', x: item.x - 18, y: 790, w: 36, h: 2, rx: 1, fill: p.accent });
    }
  });
  return els;
}

// Helper: mini sparkline (simplified as path of rects)
function sparkline(x, y, w, h, values, color) {
  const els = [];
  const max = Math.max(...values);
  const barW = (w / values.length) - 2;
  values.forEach((v, i) => {
    const barH = (v / max) * h;
    const bx = x + i * (barW + 2);
    const by = y + h - barH;
    els.push({ type: 'rect', x: bx, y: by, w: barW, h: barH, rx: 2, fill: color, opacity: 0.6 + (i / values.length) * 0.4 });
  });
  return els;
}

// Helper: card
function card(x, y, w, h, rx = 18, glowAccent = false) {
  const els = [
    { type: 'rect', x, y, w, h, rx, fill: p.surface2 },
    { type: 'rect', x, y, w, h, rx, fill: 'none', stroke: p.border, strokeWidth: 1 },
  ];
  if (glowAccent) {
    els.unshift({ type: 'rect', x: x - 1, y: y - 1, w: w + 2, h: h + 2, rx: rx + 1, fill: p.glow, opacity: 0.4 });
  }
  return els;
}

// ── SCREEN 1 ── Revenue Overview
const screen1 = {
  id: 'revenue',
  name: 'Revenue',
  bg: p.bg,
  elements: [
    ...statusBar(),

    // Header
    { type: 'text', x: 20, y: 72, text: 'March 2026', fontSize: 13, color: p.textMuted },
    { type: 'text', x: 20, y: 96, text: 'Revenue', fontSize: 28, fontWeight: '800', color: p.text },
    // Avatar
    { type: 'circle', cx: 358, cy: 82, r: 18, fill: p.surface3 },
    { type: 'text', x: 358, y: 87, text: 'R', fontSize: 14, fontWeight: '700', color: p.accent, textAnchor: 'middle' },

    // MRR hero card with glow
    ...card(16, 112, 358, 148, 22, true),
    { type: 'text', x: 36, y: 142, text: 'MONTHLY RECURRING', fontSize: 9, fontWeight: '700', color: p.textMuted, letterSpacing: 1.8 },
    { type: 'text', x: 36, y: 188, text: '$12,840', fontSize: 44, fontWeight: '800', color: p.text, fontFamily: 'monospace' },
    ...pill(36, 202, '↑ +18.4%', p.accent2 + '28', p.accent2),
    { type: 'text', x: 96, y: 215, text: 'vs last month', fontSize: 10, color: p.textMuted },
    // Sparkline bars
    ...sparkline(232, 132, 120, 100, [52, 61, 58, 70, 78, 88, 94, 100], p.accent),

    // 3 sub-metrics
    ...card(16, 272, 108, 80, 16),
    { type: 'text', x: 70, y: 302, text: '$3.2K', fontSize: 18, fontWeight: '800', color: p.accent2, textAnchor: 'middle', fontFamily: 'monospace' },
    { type: 'text', x: 70, y: 320, text: 'New MRR', fontSize: 9.5, color: p.textMuted, textAnchor: 'middle' },

    ...card(140, 272, 108, 80, 16),
    { type: 'text', x: 194, y: 302, text: '$680', fontSize: 18, fontWeight: '800', color: p.accent3, textAnchor: 'middle', fontFamily: 'monospace' },
    { type: 'text', x: 194, y: 320, text: 'Churned', fontSize: 9.5, color: p.textMuted, textAnchor: 'middle' },

    ...card(262, 272, 112, 80, 16),
    { type: 'text', x: 318, y: 302, text: '94', fontSize: 18, fontWeight: '800', color: p.accent4, textAnchor: 'middle', fontFamily: 'monospace' },
    { type: 'text', x: 318, y: 320, text: 'Customers', fontSize: 9.5, color: p.textMuted, textAnchor: 'middle' },

    // Annual run rate
    ...card(16, 364, 358, 72, 18),
    { type: 'text', x: 36, y: 390, text: 'ANNUAL RUN RATE', fontSize: 9, fontWeight: '700', color: p.textMuted, letterSpacing: 1.5 },
    { type: 'text', x: 36, y: 418, text: '$154,080', fontSize: 26, fontWeight: '800', color: p.text, fontFamily: 'monospace' },
    { type: 'text', x: 260, y: 390, text: '↑ streak', fontSize: 9, color: p.accent2 },
    // Progress bar
    { type: 'rect', x: 36, y: 430, w: 318, h: 4, rx: 2, fill: p.surface3 },
    { type: 'rect', x: 36, y: 430, w: 200, h: 4, rx: 2, fill: p.accent },

    // Recent transactions header
    { type: 'text', x: 20, y: 460, text: 'Recent', fontSize: 16, fontWeight: '700', color: p.text },
    { type: 'text', x: 340, y: 460, text: 'See all →', fontSize: 11, color: p.accent },

    // Transaction rows
    ...([
      { name: 'Indie Course Bundle', amount: '+$299', time: '2m ago', tag: 'Course', color: p.accent2 },
      { name: 'Pro Membership · @kai', amount: '+$49', time: '1h ago', tag: 'Subscription', color: p.accent },
      { name: 'Stripe fee', amount: '-$8.70', time: '1h ago', tag: 'Fee', color: p.accent3 },
    ].flatMap((txn, i) => {
      const ty = 472 + i * 60;
      return [
        ...card(16, ty, 358, 50, 14),
        { type: 'circle', cx: 50, cy: ty + 25, r: 14, fill: p.surface3 },
        { type: 'text', x: 50, y: ty + 30, text: txn.tag[0], fontSize: 11, fontWeight: '700', color: txn.color, textAnchor: 'middle' },
        { type: 'text', x: 74, y: ty + 19, text: txn.name, fontSize: 12, fontWeight: '600', color: p.text },
        { type: 'text', x: 74, y: ty + 34, text: txn.time, fontSize: 10, color: p.textMuted },
        { type: 'text', x: 352, y: ty + 30, text: txn.amount, fontSize: 13, fontWeight: '700', color: txn.color, textAnchor: 'end', fontFamily: 'monospace' },
      ];
    })),

    ...navBar('revenue'),
  ],
};

// ── SCREEN 2 ── Revenue Sources
const screen2 = {
  id: 'sources',
  name: 'Sources',
  bg: p.bg,
  elements: [
    ...statusBar(),
    { type: 'text', x: 20, y: 72, text: 'Revenue', fontSize: 28, fontWeight: '800', color: p.text },
    { type: 'text', x: 20, y: 96, text: 'by Source', fontSize: 28, fontWeight: '800', color: p.accent },

    // Donut chart (simplified rings)
    { type: 'circle', cx: 195, cy: 200, r: 70, fill: 'none', stroke: p.surface2, strokeWidth: 28 },
    { type: 'arc', cx: 195, cy: 200, r: 70, startAngle: -90, endAngle: 110, stroke: p.accent, strokeWidth: 28, fill: 'none', strokeLinecap: 'butt' },
    { type: 'arc', cx: 195, cy: 200, r: 70, startAngle: 110, endAngle: 218, stroke: p.accent2, strokeWidth: 28, fill: 'none', strokeLinecap: 'butt' },
    { type: 'arc', cx: 195, cy: 200, r: 70, startAngle: 218, endAngle: 270, stroke: p.accent4, strokeWidth: 28, fill: 'none', strokeLinecap: 'butt' },
    { type: 'text', x: 195, y: 196, text: '$12.8K', fontSize: 20, fontWeight: '800', color: p.text, textAnchor: 'middle', fontFamily: 'monospace' },
    { type: 'text', x: 195, y: 214, text: 'total MRR', fontSize: 10, color: p.textMuted, textAnchor: 'middle' },

    // Legend
    ...[
      { label: 'Courses', pct: '55%', amount: '$7,062', color: p.accent },
      { label: 'Subscriptions', pct: '30%', amount: '$3,852', color: p.accent2 },
      { label: 'Consulting', pct: '15%', amount: '$1,926', color: p.accent4 },
    ].flatMap((src, i) => {
      const ly = 290 + i * 36;
      return [
        { type: 'rect', x: 70, y: ly + 4, w: 8, h: 8, rx: 2, fill: src.color },
        { type: 'text', x: 86, y: ly + 12, text: src.label, fontSize: 12, color: p.text, fontWeight: '500' },
        { type: 'text', x: 300, y: ly + 12, text: src.amount, fontSize: 12, fontWeight: '700', color: src.color, textAnchor: 'end', fontFamily: 'monospace' },
        { type: 'text', x: 352, y: ly + 12, text: src.pct, fontSize: 11, color: p.textMuted, textAnchor: 'end' },
      ];
    }),

    // Product breakdown
    { type: 'text', x: 20, y: 410, text: 'By Product', fontSize: 16, fontWeight: '700', color: p.text },

    ...[
      { name: 'Indie OS Course', rev: '$4,200', pct: 85, color: p.accent },
      { name: 'Build in Public Kit', rev: '$2,860', pct: 58, color: p.accent },
      { name: 'Monthly Membership', rev: '$2,450', pct: 50, color: p.accent2 },
      { name: 'Design Consulting', rev: '$1,926', pct: 39, color: p.accent4 },
      { name: 'Templates Bundle', rev: '$1,404', pct: 28, color: p.accent2 },
    ].flatMap((prod, i) => {
      const py = 425 + i * 60;
      return [
        ...card(16, py, 358, 50, 14),
        { type: 'text', x: 36, y: py + 19, text: prod.name, fontSize: 12, fontWeight: '600', color: p.text },
        { type: 'text', x: 352, y: py + 19, text: prod.rev, fontSize: 12, fontWeight: '700', color: p.text, textAnchor: 'end', fontFamily: 'monospace' },
        { type: 'rect', x: 36, y: py + 32, w: 286, h: 3, rx: 1.5, fill: p.surface3 },
        { type: 'rect', x: 36, y: py + 32, w: Math.round(286 * prod.pct / 100), h: 3, rx: 1.5, fill: prod.color },
        { type: 'text', x: 352, y: py + 36, text: `${prod.pct}%`, fontSize: 9, color: p.textMuted, textAnchor: 'end' },
      ];
    }),

    ...navBar('sources'),
  ],
};

// ── SCREEN 3 ── Audience
const screen3 = {
  id: 'audience',
  name: 'Audience',
  bg: p.bg,
  elements: [
    ...statusBar(),
    { type: 'text', x: 20, y: 72, text: 'Audience', fontSize: 28, fontWeight: '800', color: p.text },
    { type: 'text', x: 20, y: 96, text: 'Growth', fontSize: 28, fontWeight: '800', color: p.accent2 },

    // Total audience card
    ...card(16, 112, 358, 110, 22, false),
    { type: 'text', x: 36, y: 140, text: 'TOTAL REACH', fontSize: 9, fontWeight: '700', color: p.textMuted, letterSpacing: 1.5 },
    { type: 'text', x: 36, y: 180, text: '47,820', fontSize: 40, fontWeight: '800', color: p.text, fontFamily: 'monospace' },
    ...pill(36, 192, '↑ +2,310 this month', p.accent2 + '28', p.accent2),
    // Weekly bars
    ...sparkline(250, 125, 110, 75, [60, 65, 72, 68, 80, 88, 95, 100], p.accent2),

    // Platform breakdown
    { type: 'text', x: 20, y: 242, text: 'Platforms', fontSize: 16, fontWeight: '700', color: p.text },

    ...[
      { name: 'Newsletter', followers: '18,420', growth: '+840', icon: '✉', color: p.accent, pct: 80 },
      { name: 'Twitter / X', followers: '14,200', growth: '+620', icon: '𝕏', color: p.textMuted, pct: 60 },
      { name: 'YouTube', followers: '9,100', growth: '+390', icon: '▷', color: p.accent3, pct: 40 },
      { name: 'LinkedIn', followers: '6,100', growth: '+460', icon: 'in', color: '#0A66C2', pct: 26 },
    ].flatMap((plat, i) => {
      const py = 256 + i * 68;
      return [
        ...card(16, py, 358, 58, 16),
        { type: 'circle', cx: 50, cy: py + 29, r: 16, fill: p.surface3 },
        { type: 'text', x: 50, y: py + 34, text: plat.icon, fontSize: 12, color: plat.color, textAnchor: 'middle', fontWeight: '700' },
        { type: 'text', x: 76, y: py + 22, text: plat.name, fontSize: 13, fontWeight: '700', color: p.text },
        { type: 'text', x: 76, y: py + 38, text: plat.followers + ' followers', fontSize: 10, color: p.textMuted },
        { type: 'rect', x: 76, y: py + 44, w: 200, h: 3, rx: 1.5, fill: p.surface3 },
        { type: 'rect', x: 76, y: py + 44, w: Math.round(200 * plat.pct / 100), h: 3, rx: 1.5, fill: plat.color },
        { type: 'text', x: 352, y: py + 25, text: plat.growth, fontSize: 12, fontWeight: '700', color: p.accent2, textAnchor: 'end', fontFamily: 'monospace' },
        { type: 'text', x: 352, y: py + 41, text: 'this mo.', fontSize: 9, color: p.textMuted, textAnchor: 'end' },
      ];
    }),

    // Engagement metric
    ...card(16, 534, 358, 65, 18),
    { type: 'text', x: 36, y: 560, text: 'AVG OPEN RATE (NEWSLETTER)', fontSize: 9, fontWeight: '700', color: p.textMuted, letterSpacing: 1.2 },
    { type: 'text', x: 36, y: 588, text: '42.7%', fontSize: 26, fontWeight: '800', color: p.accent4, fontFamily: 'monospace' },
    { type: 'text', x: 170, y: 588, text: '↑ industry avg: 21%', fontSize: 11, color: p.accent2 },

    ...navBar('audience'),
  ],
};

// ── SCREEN 4 ── Ledger / Transactions
const screen4 = {
  id: 'txns',
  name: 'Ledger',
  bg: p.bg,
  elements: [
    ...statusBar(),
    { type: 'text', x: 20, y: 72, text: 'Ledger', fontSize: 28, fontWeight: '800', color: p.text },

    // Filter pills
    ...[
      { label: 'All', active: true },
      { label: 'Income', active: false },
      { label: 'Fees', active: false },
      { label: 'Refunds', active: false },
    ].flatMap((f, i) => {
      const fx = 20 + i * 72;
      return [
        { type: 'rect', x: fx, y: 86, w: 64, h: 24, rx: 12, fill: f.active ? p.accent : p.surface2 },
        { type: 'rect', x: fx, y: 86, w: 64, h: 24, rx: 12, fill: 'none', stroke: f.active ? p.accent : p.border, strokeWidth: 1 },
        { type: 'text', x: fx + 32, y: 102, text: f.label, fontSize: 10, fontWeight: '600', color: f.active ? '#FFFFFF' : p.textMuted, textAnchor: 'middle' },
      ];
    }),

    // Daily groups with transactions
    { type: 'text', x: 20, y: 134, text: 'TODAY', fontSize: 9, fontWeight: '700', color: p.textMuted, letterSpacing: 1.5 },

    ...[
      { name: 'Indie OS Course', sub: 'One-time purchase · Gumroad', amount: '+$299', color: p.accent2 },
      { name: 'Pro Membership', sub: 'Monthly renewal · @kai_builds', amount: '+$49', color: p.accent2 },
      { name: 'Stripe Processing', sub: '2.9% + 30¢ fee', amount: '-$8.98', color: p.accent3 },
    ].flatMap((txn, i) => {
      const ty = 144 + i * 64;
      return [
        ...card(16, ty, 358, 54, 14),
        { type: 'rect', x: 36, y: ty + 10, w: 34, h: 34, rx: 10, fill: p.surface3 },
        { type: 'text', x: 53, y: ty + 32, text: txn.amount[0] === '+' ? '↑' : '↓', fontSize: 16, color: txn.color, textAnchor: 'middle' },
        { type: 'text', x: 80, y: ty + 24, text: txn.name, fontSize: 12, fontWeight: '600', color: p.text },
        { type: 'text', x: 80, y: ty + 38, text: txn.sub, fontSize: 9.5, color: p.textMuted },
        { type: 'text', x: 352, y: ty + 32, text: txn.amount, fontSize: 13, fontWeight: '700', color: txn.color, textAnchor: 'end', fontFamily: 'monospace' },
      ];
    }),

    { type: 'text', x: 20, y: 364, text: 'YESTERDAY', fontSize: 9, fontWeight: '700', color: p.textMuted, letterSpacing: 1.5 },

    ...[
      { name: 'Template Pack Sale', sub: 'Lemon Squeezy · @uxstudio', amount: '+$79', color: p.accent2 },
      { name: 'Design Consultation', sub: '2hr session · @growthco', amount: '+$300', color: p.accent2 },
      { name: 'Refund · @anon_user', sub: 'Requested within 30 days', amount: '-$49', color: p.accent3 },
      { name: 'Lemon Squeezy fee', sub: '3.5% + 30¢', amount: '-$5.59', color: p.accent3 },
    ].flatMap((txn, i) => {
      const ty = 374 + i * 64;
      return [
        ...card(16, ty, 358, 54, 14),
        { type: 'rect', x: 36, y: ty + 10, w: 34, h: 34, rx: 10, fill: p.surface3 },
        { type: 'text', x: 53, y: ty + 32, text: txn.amount[0] === '+' ? '↑' : '↓', fontSize: 16, color: txn.color, textAnchor: 'middle' },
        { type: 'text', x: 80, y: ty + 24, text: txn.name, fontSize: 12, fontWeight: '600', color: p.text },
        { type: 'text', x: 80, y: ty + 38, text: txn.sub, fontSize: 9.5, color: p.textMuted },
        { type: 'text', x: 352, y: ty + 32, text: txn.amount, fontSize: 13, fontWeight: '700', color: txn.color, textAnchor: 'end', fontFamily: 'monospace' },
      ];
    }),

    ...navBar('txns'),
  ],
};

// ── SCREEN 5 ── Goals
const screen5 = {
  id: 'goals',
  name: 'Goals',
  bg: p.bg,
  elements: [
    ...statusBar(),
    { type: 'text', x: 20, y: 72, text: 'Goals', fontSize: 28, fontWeight: '800', color: p.text },
    { type: 'text', x: 20, y: 96, text: 'Milestones', fontSize: 28, fontWeight: '800', color: p.accent4 },

    // Active goal hero
    ...card(16, 112, 358, 180, 22, false),
    { type: 'text', x: 36, y: 142, text: 'ACTIVE GOAL', fontSize: 9, fontWeight: '700', color: p.textMuted, letterSpacing: 1.5 },
    { type: 'text', x: 36, y: 168, text: '$20K MRR', fontSize: 32, fontWeight: '800', color: p.text },
    { type: 'text', x: 36, y: 190, text: 'by June 2026', fontSize: 13, color: p.textMuted },

    // Large circular progress
    { type: 'circle', cx: 290, cy: 190, r: 52, fill: 'none', stroke: p.surface3, strokeWidth: 10 },
    { type: 'arc', cx: 290, cy: 190, r: 52, startAngle: -90, endAngle: 142, stroke: p.accent4, strokeWidth: 10, fill: 'none', strokeLinecap: 'round' },
    { type: 'text', x: 290, y: 186, text: '64%', fontSize: 18, fontWeight: '800', color: p.accent4, textAnchor: 'middle', fontFamily: 'monospace' },
    { type: 'text', x: 290, y: 204, text: '$12.8K', fontSize: 10, color: p.textMuted, textAnchor: 'middle' },

    // Milestone track bar
    { type: 'rect', x: 36, y: 218, w: 318, h: 6, rx: 3, fill: p.surface3 },
    { type: 'rect', x: 36, y: 218, w: Math.round(318 * 0.64), h: 6, rx: 3, fill: p.accent4 },
    { type: 'text', x: 36, y: 242, text: '$12,840 of $20,000', fontSize: 10, color: p.textMuted },
    { type: 'text', x: 352, y: 242, text: '85 days left', fontSize: 10, color: p.accent4, textAnchor: 'end' },

    // Milestones list
    { type: 'text', x: 20, y: 280, text: 'Milestones', fontSize: 16, fontWeight: '700', color: p.text },

    ...[
      { label: '$5K MRR', desc: 'First major milestone', date: 'Jan 12', done: true },
      { label: '$10K MRR', desc: 'Double digits!', date: 'Feb 28', done: true },
      { label: '$15K MRR', desc: 'Next target', date: 'Apr 15', done: false, active: true },
      { label: '$20K MRR', desc: 'Escape velocity', date: 'Jun 30', done: false },
    ].flatMap((ms, i) => {
      const my = 292 + i * 72;
      const dotColor = ms.done ? p.accent2 : ms.active ? p.accent4 : p.surface3;
      const lineColor = ms.done ? p.accent2 + '60' : p.surface3;
      return [
        // Connector line
        i < 3 ? { type: 'rect', x: 36, y: my + 20, w: 2, h: 52, rx: 1, fill: lineColor } : { type: 'rect', x: 0, y: 0, w: 0, h: 0, fill: 'none' },
        // Dot
        { type: 'circle', cx: 37, cy: my + 10, r: ms.active ? 8 : 6, fill: dotColor },
        ms.done ? { type: 'text', x: 37, y: my + 14, text: '✓', fontSize: 8, fontWeight: '800', color: '#000000', textAnchor: 'middle' } : { type: 'rect', x: 0, y: 0, w: 0, h: 0, fill: 'none' },
        // Content card
        ...card(58, my, 316, 58, 14),
        { type: 'text', x: 76, y: my + 22, text: ms.label, fontSize: 14, fontWeight: '800', color: ms.done ? p.textMuted : p.text, fontFamily: 'monospace' },
        { type: 'text', x: 76, y: my + 38, text: ms.desc, fontSize: 10, color: p.textMuted },
        { type: 'text', x: 352, y: my + 22, text: ms.date, fontSize: 10, color: ms.done ? p.accent2 : ms.active ? p.accent4 : p.textMuted, textAnchor: 'end' },
        ms.done ? { type: 'text', x: 352, y: my + 38, text: 'Achieved ✓', fontSize: 9, color: p.accent2, textAnchor: 'end' } : { type: 'rect', x: 0, y: 0, w: 0, h: 0, fill: 'none' },
      ];
    }),

    ...navBar('goals'),
  ],
};

const pen = {
  version: '2.8',
  meta: {
    name: APP_NAME,
    slug: SLUG,
    tagline: TAGLINE,
    description: 'Revenue intelligence dashboard for indie makers — track MRR, sources, audience, and milestones in a minimal dark interface.',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    theme: 'dark',
    inspiration: 'Midday.ai (darkmodedesign.com) + Equals GTM analytics (land-book.com) + Mixpanel (godly.website) — "Quiet Clarity": monospace metrics, violet/mint accent system, floating cards on near-black',
    tags: ['finance', 'analytics', 'creator', 'dark', 'saas', 'dashboard', 'indie'],
  },
  canvas: { width: 390, height: 844, platform: 'mobile' },
  palette: {
    bg: p.bg,
    surface: p.surface2,
    text: p.text,
    accent: p.accent,
    accent2: p.accent2,
    muted: p.textMuted,
  },
  screens: [screen1, screen2, screen3, screen4, screen5],
};

fs.writeFileSync('yield.pen', JSON.stringify(pen, null, 2));
console.log('✓ yield.pen written —', pen.screens.length, 'screens');
