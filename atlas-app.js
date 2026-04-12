/**
 * ATLAS — Wealth, privately commanded.
 *
 * Inspired by:
 * 1. Atlas Card (atlascard.com via Godly.website) — ultra-premium dark membership
 *    app with editorial photography insets, bold serif display type, invitation-only
 *    exclusivity, and luxury concierge services UX pattern
 * 2. Darkroom (darkmodedesign.com) — premium dark near-black app with high
 *    contrast typography, minimal chrome, confident editorial whitespace
 * 3. Lapa Ninja "Dawn" — calm metric-forward dashboard with clean data hierarchy
 *
 * Theme: DARK — near-black with champagne gold accents
 * Palette: near-black bg, champagne gold accent, warm cream text, emerald positive
 */

const fs = require('fs');

const T = {
  bg:        '#070605',
  surface:   '#0D0C0A',
  surface2:  '#151310',
  surface3:  '#1E1C18',
  text:      '#F0EBE0',
  textMid:   '#A89F8C',
  textMute:  '#554F44',
  gold:      '#C8A96B',
  goldLt:    'rgba(200,169,107,0.11)',
  goldMid:   'rgba(200,169,107,0.22)',
  ember:     '#C96B42',
  emberLt:   'rgba(201,107,66,0.12)',
  emerald:   '#4A9B7A',
  emeraldLt: 'rgba(74,155,122,0.12)',
  sapphire:  '#4A7BB5',
  sapphireLt:'rgba(74,123,181,0.12)',
  border:    'rgba(200,169,107,0.13)',
  borderDim: 'rgba(240,235,224,0.055)',
  shadow:    'rgba(0,0,0,0.55)',
  serif:     'Georgia, "Times New Roman", serif',
  sans:      '"Inter", "Helvetica Neue", Arial, sans-serif',
};

const uid = () => Math.random().toString(36).slice(2, 9);

function r(x, y, w, h, fill, opts = {}) {
  return {
    id: uid(), type: 'rectangle',
    x, y, width: w, height: h,
    fill: fill || 'transparent',
    cornerRadius: opts.r ?? 0,
    opacity: opts.opacity ?? 1,
    shadow: opts.shadow ? { x: 0, y: 4, blur: 20, color: T.shadow } : undefined,
    border: opts.border ? { color: opts.border, width: opts.bw ?? 1 } : undefined,
  };
}

function t(x, y, w, content, opts = {}) {
  return {
    id: uid(), type: 'text',
    x, y, width: w, content,
    fontSize: opts.size ?? 14,
    fontFamily: opts.font ?? T.sans,
    fontWeight: opts.weight ?? '400',
    color: opts.color ?? T.text,
    lineHeight: opts.lh ?? 1.45,
    letterSpacing: opts.ls ?? 0,
    align: opts.align ?? 'left',
    opacity: opts.opacity ?? 1,
  };
}

function el(x, y, sz, fill, opts = {}) {
  return {
    id: uid(), type: 'ellipse',
    x: x - sz, y: y - sz,
    width: sz * 2, height: sz * 2,
    fill: fill || 'transparent',
    border: opts.border ? { color: opts.border, width: opts.bw ?? 1.5 } : undefined,
  };
}

function clean(obj) {
  if (Array.isArray(obj)) return obj.filter(Boolean).map(clean);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) out[k] = clean(v);
    }
    return out;
  }
  return obj;
}

function statusBar() {
  return [
    r(0, 0, 390, 50, T.bg),
    t(20, 15, 60, '9:41', { size: 15, weight: '600', color: T.text }),
    t(294, 15, 76, '◆ ▲ ■', { size: 10, color: T.textMid, align: 'right' }),
  ];
}

function bottomNav(active) {
  const items = [
    { icon: '⬡', label: 'Wealth' },
    { icon: '◈', label: 'Portfolio' },
    { icon: '✦', label: 'Concierge' },
    { icon: '≡', label: 'Statements' },
    { icon: '◎', label: 'Membership' },
  ];
  const els = [
    r(0, 752, 390, 92, T.surface),
    r(0, 752, 390, 0.5, T.border),
  ];
  items.forEach((item, i) => {
    const x = 3 + i * 77;
    const isActive = i === active;
    if (isActive) {
      els.push(r(x + 4, 757, 68, 72, T.goldLt, { r: 12 }));
      els.push(el(x + 38, 816, 3, T.gold));
    }
    els.push(t(x, 767, 76, item.icon, { size: 18, align: 'center', color: isActive ? T.gold : T.textMute }));
    els.push(t(x, 790, 76, item.label, {
      size: 9, align: 'center', ls: 0.2,
      color: isActive ? T.gold : T.textMute,
      weight: isActive ? '600' : '400',
    }));
  });
  return els;
}

function divider(y, opts = {}) {
  return r(opts.x ?? 20, y, opts.w ?? 350, 0.5, opts.color ?? T.borderDim);
}

function pill(x, y, label, color, bg) {
  const w = label.length * 6.4 + 18;
  return [
    r(x, y, w, 20, bg, { r: 10 }),
    t(x + 9, y + 4, w - 18, label, { size: 9, color, weight: '700', ls: 0.7 }),
  ];
}

function progressBar(x, y, w, pct, fillColor, opts = {}) {
  return [
    r(x, y, w, opts.h ?? 4, T.borderDim, { r: opts.r ?? 2 }),
    r(x, y, Math.max(4, Math.round(w * pct)), opts.h ?? 4, fillColor, { r: opts.r ?? 2 }),
  ];
}

function statCard(x, y, w, h, label, value, sub, opts = {}) {
  return [
    r(x, y, w, h, T.surface2, { r: 12, border: T.borderDim }),
    t(x + 14, y + 13, w - 28, label, { size: 9, color: T.textMute, weight: '700', ls: 1 }),
    t(x + 14, y + 29, w - 28, value, { size: opts.vs ?? 20, font: T.serif, weight: '700', color: opts.vc ?? T.text }),
    t(x + 14, y + 56, w - 28, sub, { size: 10, color: opts.sc ?? T.textMid }),
  ];
}

// ─── SCREEN 1: WEALTH OVERVIEW ───────────────────────────────────────────────
function buildWealth() {
  const rows = [
    { icon: '◈', label: 'Vanguard ETF Dividend', date: 'Today', amt: '+$1,240', pos: true },
    { icon: '✈', label: 'Four Seasons Tokyo — Concierge', date: 'Yesterday', amt: '-$8,400', pos: false },
    { icon: '◆', label: 'Goldman Sachs — Allocation', date: 'Mar 25', amt: '+$24,000', pos: true },
    { icon: '⬡', label: 'Graff Diamonds, New York', date: 'Mar 22', amt: '-$6,400', pos: false },
  ];
  return {
    id: uid(), title: 'Wealth', elements: clean([
      r(0, 0, 390, 844, T.bg),
      ...statusBar(),

      // Header
      t(20, 54, 200, 'ATLAS', { size: 10, weight: '700', color: T.gold, ls: 5 }),
      ...pill(316, 54, 'PRIVATE', T.gold, T.goldLt),

      t(20, 76, 260, 'Good morning,', { size: 13, color: T.textMid }),
      t(20, 96, 310, 'James Whitmore.', { size: 27, font: T.serif, weight: '700', lh: 1.1 }),

      // Hero wealth card
      r(16, 136, 358, 160, T.surface, { r: 20, border: T.border, shadow: true }),
      t(32, 152, 200, 'TOTAL NET WORTH', { size: 9, color: T.textMute, weight: '700', ls: 1.5 }),
      r(32, 166, 52, 1.5, T.gold),
      t(32, 176, 310, '$4,872,340', { size: 40, font: T.serif, weight: '700', lh: 1 }),
      t(32, 220, 220, '↑ +$38,210  (+0.79%) today', { size: 12, color: T.emerald, weight: '500' }),
      ...progressBar(32, 242, 160, 0.79, T.emerald, { h: 3 }),
      t(32, 252, 160, 'vs yesterday', { size: 9, color: T.textMute }),
      // YTD badge
      r(242, 178, 116, 50, T.emeraldLt, { r: 10 }),
      t(254, 186, 92, '▲ YTD +12.4%', { size: 11, color: T.emerald, weight: '600' }),
      t(254, 204, 92, 'vs S&P +9.1%', { size: 10, color: T.textMid }),
      t(254, 218, 92, 'outperforming', { size: 9, color: T.textMute }),

      // Stat row
      ...statCard(16, 310, 112, 86, 'LIQUID', '$248K', 'Cash & equiv.', { vs: 17 }),
      ...statCard(140, 310, 112, 86, 'INVESTED', '$3.9M', 'Across 14 assets', { vs: 17 }),
      ...statCard(264, 310, 110, 86, 'CREDIT', '$0', 'No outstanding', { vs: 17, vc: T.emerald }),

      // Activity
      t(20, 412, 200, 'RECENT ACTIVITY', { size: 9, color: T.textMute, weight: '700', ls: 1.5 }),
      t(304, 412, 66, 'View all →', { size: 11, color: T.gold, align: 'right' }),
      divider(430),

      ...rows.map((row, i) => {
        const y = 438 + i * 62;
        return [
          el(42, y + 20, 18, T.surface2, { border: T.borderDim }),
          t(28, y + 12, 28, row.icon, { size: 14, color: T.gold, align: 'center' }),
          t(72, y + 10, 210, row.label, { size: 13, weight: '500' }),
          t(72, y + 28, 130, row.date, { size: 11, color: T.textMute }),
          t(270, y + 10, 100, row.amt, { size: 14, weight: '600', align: 'right', color: row.pos ? T.emerald : T.text }),
          divider(y + 56),
        ];
      }).flat(),

      // Concierge highlight
      r(16, 692, 358, 50, T.goldLt, { r: 14, border: T.border }),
      t(30, 704, 20, '✦', { size: 14, color: T.gold }),
      t(56, 704, 240, 'Concierge: Tokyo dining confirmed Apr 8', { size: 12, weight: '600' }),
      t(56, 720, 180, '3 guests · Saito Restaurant', { size: 10, color: T.textMid }),
      t(300, 708, 56, 'View →', { size: 11, color: T.gold, align: 'right' }),

      ...bottomNav(0),
    ].flat()),
  };
}

// ─── SCREEN 2: PORTFOLIO ─────────────────────────────────────────────────────
function buildPortfolio() {
  const assets = [
    { label: 'Public Equities', pct: 0.52, value: '$2.04M', color: T.gold },
    { label: 'Private Equity', pct: 0.18, value: '$706K', color: T.sapphire },
    { label: 'Fixed Income', pct: 0.14, value: '$549K', color: T.emerald },
    { label: 'Real Estate', pct: 0.10, value: '$392K', color: T.ember },
    { label: 'Alternatives', pct: 0.06, value: '$235K', color: T.textMid },
  ];
  const periods = ['1D', '1W', '1M', '3M', 'YTD', 'ALL'];
  const bars = [0.55, 0.62, 0.58, 0.71, 0.66, 0.76, 0.73, 0.81, 0.78, 0.86, 0.83, 0.92, 0.88, 0.97, 1.0];
  return {
    id: uid(), title: 'Portfolio', elements: clean([
      r(0, 0, 390, 844, T.bg),
      ...statusBar(),

      t(20, 54, 280, 'Portfolio', { size: 28, font: T.serif, weight: '700' }),
      t(20, 86, 260, 'Managed by Goldman Sachs PWM', { size: 11, color: T.textMute }),

      // Period tabs
      ...periods.map((p, i) => [
        r(14 + i * 62, 108, 56, 24, i === 0 ? T.goldMid : 'transparent', { r: 12 }),
        t(14 + i * 62, 114, 56, p, { size: 11, color: i === 0 ? T.gold : T.textMute, weight: i === 0 ? '700' : '400', align: 'center', ls: 0.3 }),
      ]).flat(),

      t(20, 146, 300, '$3,924,100', { size: 36, font: T.serif, weight: '700' }),
      t(20, 186, 240, '↑ +$312,680  (+8.66%) YTD', { size: 12, color: T.emerald, weight: '500' }),

      // Chart area
      r(16, 210, 358, 118, T.surface, { r: 16, border: T.borderDim }),
      ...bars.map((h, i) => r(28 + i * 23, 210 + 118 - 14 - Math.round(h * 82), 16, Math.round(h * 82), T.goldLt, { r: 3 })),
      r(28, 324, 320, 1.5, T.gold, { r: 1 }),
      t(304, 216, 48, '+8.66%', { size: 10, color: T.gold, weight: '700', align: 'right' }),

      // Allocation
      t(20, 344, 200, 'ALLOCATION', { size: 9, color: T.textMute, weight: '700', ls: 1.5 }),

      ...assets.map((a, i) => {
        const y = 364 + i * 58;
        return [
          r(16, y, 358, 48, T.surface, { r: 10, border: T.borderDim }),
          el(36, y + 24, 8, a.color),
          t(56, y + 10, 190, a.label, { size: 13, weight: '500' }),
          t(56, y + 28, 110, `${Math.round(a.pct * 100)}% of portfolio`, { size: 10, color: T.textMute }),
          t(290, y + 10, 68, a.value, { size: 13, weight: '600', align: 'right' }),
          ...progressBar(56, y + 42, 140, a.pct, a.color, { h: 3 }),
        ];
      }).flat(),

      ...bottomNav(1),
    ].flat()),
  };
}

// ─── SCREEN 3: CONCIERGE ─────────────────────────────────────────────────────
function buildConcierge() {
  const services = [
    { icon: '◈', label: 'Fine Dining', sub: '280+ restaurants', color: T.gold },
    { icon: '✈', label: 'Private Travel', sub: 'Jets, yachts & suites', color: T.sapphire },
    { icon: '◆', label: 'Exclusive Events', sub: 'Before public access', color: T.ember },
    { icon: '⬡', label: 'Health & Wellness', sub: 'Elite clinics & retreats', color: T.emerald },
  ];
  const past = [
    { icon: '◆', label: 'Wimbledon Royal Box seats', date: 'Jul 2024' },
    { icon: '✈', label: 'Laucala Island — 10 nights', date: 'Dec 2023' },
    { icon: '◈', label: 'Nobu Matsuhisa — 12 guests', date: 'Nov 2023' },
  ];
  return {
    id: uid(), title: 'Concierge', elements: clean([
      r(0, 0, 390, 844, T.bg),
      ...statusBar(),

      t(20, 54, 280, 'Concierge', { size: 28, font: T.serif, weight: '700' }),
      t(20, 86, 260, 'Your personal requests manager', { size: 11, color: T.textMute }),
      r(268, 56, 106, 32, T.gold, { r: 16 }),
      t(276, 65, 90, '+ New Request', { size: 11, weight: '700', color: T.bg, align: 'center' }),

      // Active request
      r(16, 108, 358, 130, T.surface, { r: 16, border: T.border, shadow: true }),
      ...pill(32, 120, 'ACTIVE', T.emerald, T.emeraldLt),
      t(32, 148, 300, 'Private Dining at Saito, Tokyo', { size: 17, font: T.serif, weight: '700' }),
      t(32, 172, 280, 'Apr 8 · 7:30 PM · 3 guests · Omakase', { size: 11, color: T.textMid }),
      t(32, 190, 260, 'Confirmed · Your concierge: Mei Yamamoto', { size: 11, color: T.textMute }),
      t(298, 188, 58, 'Message →', { size: 11, color: T.gold, weight: '600', align: 'right' }),

      // Services header
      t(20, 254, 200, 'SERVICES', { size: 9, color: T.textMute, weight: '700', ls: 1.5 }),

      ...services.map((s, i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const x = 16 + col * 184, y = 274 + row * 98;
        return [
          r(x, y, 174, 86, T.surface2, { r: 14, border: T.borderDim }),
          r(x + 14, y + 14, 36, 36, T.goldLt, { r: 10 }),
          t(x + 17, y + 19, 30, s.icon, { size: 16, color: s.color, align: 'center' }),
          t(x + 58, y + 16, 106, s.label, { size: 13, weight: '600' }),
          t(x + 58, y + 34, 106, s.sub, { size: 10, color: T.textMute, lh: 1.3 }),
        ];
      }).flat(),

      // Past requests
      t(20, 488, 200, 'PAST REQUESTS', { size: 9, color: T.textMute, weight: '700', ls: 1.5 }),
      divider(506),

      ...past.map((p, i) => {
        const y = 514 + i * 62;
        return [
          el(42, y + 20, 17, T.surface2, { border: T.borderDim }),
          t(28, y + 12, 28, p.icon, { size: 14, color: T.textMid, align: 'center' }),
          t(70, y + 10, 230, p.label, { size: 13, weight: '500' }),
          t(70, y + 28, 130, p.date, { size: 11, color: T.textMute }),
          ...pill(280, y + 13, 'Completed', T.emerald, T.emeraldLt),
          divider(y + 56),
        ];
      }).flat(),

      ...bottomNav(2),
    ].flat()),
  };
}

// ─── SCREEN 4: STATEMENTS ────────────────────────────────────────────────────
function buildStatements() {
  const txns = [
    { icon: '◈', label: 'Saito Restaurant, Tokyo', cat: 'Dining', date: 'Mar 26', amt: '-$840', pos: false },
    { icon: '✈', label: 'NetJets — Charter LAX-JFK', cat: 'Travel', date: 'Mar 24', amt: '-$14,200', pos: false },
    { icon: '◆', label: 'Graff Diamonds, New York', cat: 'Luxury', date: 'Mar 22', amt: '-$6,400', pos: false },
    { icon: '⬡', label: 'Goldman Sachs — Interest', cat: 'Income', date: 'Mar 20', amt: '+$3,210', pos: true },
    { icon: '✈', label: 'The Ritz, Paris — Deposit', cat: 'Travel', date: 'Mar 18', amt: '-$2,800', pos: false },
    { icon: '◈', label: 'Masa, New York', cat: 'Dining', date: 'Mar 15', amt: '-$590', pos: false },
  ];
  const catColors = { Dining: T.gold, Travel: T.sapphire, Luxury: T.ember, Income: T.emerald };
  return {
    id: uid(), title: 'Statements', elements: clean([
      r(0, 0, 390, 844, T.bg),
      ...statusBar(),

      t(20, 54, 280, 'Statements', { size: 28, font: T.serif, weight: '700' }),

      // Month selector
      r(16, 90, 358, 36, T.surface, { r: 11, border: T.borderDim }),
      t(26, 101, 50, '‹', { size: 18, color: T.textMid }),
      t(60, 101, 270, 'March 2026', { size: 14, weight: '600', align: 'center' }),
      t(330, 101, 28, '›', { size: 18, color: T.textMid, align: 'right' }),

      // Summary card
      r(16, 138, 358, 90, T.surface, { r: 16, border: T.border }),
      t(32, 152, 200, 'MONTH SPEND', { size: 9, color: T.textMute, weight: '700', ls: 1.5 }),
      t(32, 168, 200, '$24,830', { size: 32, font: T.serif, weight: '700' }),
      t(32, 204, 170, 'of $40,000 budget · 62%', { size: 11, color: T.textMute }),
      ...progressBar(32, 220, 200, 0.62, T.gold, { h: 5 }),
      // Category mini-bars
      ...['Dining', 'Travel', 'Luxury', 'Income'].map((cat, i) => {
        const pcts = [0.38, 0.31, 0.22, 0.09];
        return [
          r(238 + i * 28, 164, 22, Math.round(pcts[i] * 46), catColors[cat], { r: 3 }),
          t(238 + i * 28, 213, 22, cat.slice(0, 3), { size: 8, color: T.textMute, align: 'center', ls: 0 }),
        ];
      }).flat(),

      t(20, 244, 200, 'TRANSACTIONS', { size: 9, color: T.textMute, weight: '700', ls: 1.5 }),
      t(304, 244, 66, 'Export →', { size: 11, color: T.gold, align: 'right' }),
      divider(262),

      ...txns.map((txn, i) => {
        const y = 270 + i * 60;
        const c = catColors[txn.cat] || T.textMid;
        return [
          el(38, y + 20, 14, `${c}1A`, { border: c }),
          t(62, y + 10, 200, txn.label, { size: 13, weight: '500' }),
          t(62, y + 28, 120, `${txn.cat} · ${txn.date}`, { size: 10, color: T.textMute }),
          t(268, y + 12, 102, txn.amt, { size: 13, weight: '600', align: 'right', color: txn.pos ? T.emerald : T.text }),
          divider(y + 54),
        ];
      }).flat(),

      ...bottomNav(3),
    ].flat()),
  };
}

// ─── SCREEN 5: MEMBERSHIP ────────────────────────────────────────────────────
function buildMembership() {
  const benefits = [
    { label: 'Concierge Requests', used: 'Unlimited', bar: false },
    { label: 'Travel Credits Used', detail: '$42K of $75K', pct: 0.56 },
    { label: 'Event Access', detail: '8 of 20 included', pct: 0.40 },
    { label: 'Annual Spend', detail: '$24.8K of $40K', pct: 0.62 },
  ];
  return {
    id: uid(), title: 'Membership', elements: clean([
      r(0, 0, 390, 844, T.bg),
      ...statusBar(),

      t(20, 54, 280, 'Membership', { size: 28, font: T.serif, weight: '700' }),
      t(20, 86, 200, 'Private Client Status', { size: 11, color: T.textMute }),

      // Physical card aesthetic
      r(16, 112, 358, 188, T.surface, { r: 24, border: T.border, shadow: true }),
      // Gold shimmer panel
      r(218, 112, 156, 188, T.goldLt, { r: 24 }),
      r(218, 112, 156, 188, 'transparent', { r: 24, border: T.border }),
      // Card content
      t(34, 136, 180, 'ATLAS', { size: 20, font: T.serif, weight: '700', color: T.gold, ls: 10 }),
      t(34, 160, 100, 'PRIVATE', { size: 9, weight: '700', color: T.textMute, ls: 4 }),
      r(34, 174, 56, 1.5, T.gold),
      t(34, 184, 240, 'James Whitmore', { size: 16, font: T.serif, weight: '600' }),
      t(34, 206, 200, 'Member since 2019', { size: 11, color: T.textMid }),
      t(34, 228, 200, '**** **** **** 7291', { size: 12, weight: '600', ls: 2, color: T.textMid }),
      t(34, 248, 140, 'Tier I · Renews Jan 2027', { size: 10, color: T.textMute }),
      // Card corner emblem
      t(264, 136, 86, '✦', { size: 30, color: T.gold, align: 'right' }),
      t(264, 170, 86, 'TIER I', { size: 9, weight: '700', color: T.gold, ls: 2, align: 'right' }),
      t(264, 264, 86, 'VISA', { size: 13, weight: '800', color: T.textMid, align: 'right' }),

      // Benefits
      t(20, 318, 280, 'ANNUAL BENEFITS', { size: 9, color: T.textMute, weight: '700', ls: 1.5 }),

      ...benefits.map((b, i) => {
        const y = 338 + i * 62;
        return [
          r(16, y, 358, 52, T.surface, { r: 10, border: T.borderDim }),
          t(32, y + 10, 220, b.label, { size: 13, weight: '500' }),
          b.bar === false
            ? t(32, y + 28, 200, b.used || b.detail, { size: 11, color: T.gold, weight: '600' })
            : [
                t(32, y + 28, 200, b.detail, { size: 11, color: T.textMid }),
                ...progressBar(32, y + 45, 180, b.pct, T.gold, { h: 3 }),
              ],
        ];
      }).flat(),

      // Renewal block
      r(16, 590, 358, 58, T.goldLt, { r: 14, border: T.border }),
      t(32, 604, 260, 'Membership renews Jan 1, 2027', { size: 13, weight: '600' }),
      t(32, 622, 200, 'Annual fee: $45,000', { size: 11, color: T.textMid }),
      t(296, 607, 62, 'Manage →', { size: 11, color: T.gold, weight: '600', align: 'right' }),

      // Concierge CTA
      r(16, 660, 358, 50, T.surface, { r: 14, border: T.borderDim }),
      el(42, 685, 16, T.goldLt, { border: T.borderDim }),
      t(28, 676, 28, '✦', { size: 13, color: T.gold, align: 'center' }),
      t(68, 676, 220, 'Contact your concierge', { size: 13, weight: '600' }),
      t(68, 694, 200, 'Available 24/7 · Mei Yamamoto', { size: 11, color: T.textMute }),
      t(298, 680, 60, 'Call →', { size: 11, color: T.gold, weight: '600', align: 'right' }),

      ...bottomNav(4),
    ].flat()),
  };
}

// ─── ASSEMBLE & WRITE ─────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'ATLAS — Wealth, Privately Commanded',
  description: 'Ultra-premium private wealth management app. Near-black luxury palette with champagne gold accents and editorial serif typography. Inspired by Atlas Card concierge UX (Godly.website) and Darkroom dark app aesthetic (darkmodedesign.com).',
  width: 390,
  height: 844,
  screens: [
    buildWealth(),
    buildPortfolio(),
    buildConcierge(),
    buildStatements(),
    buildMembership(),
  ],
};

fs.writeFileSync('atlas.pen', JSON.stringify(clean(pen), null, 2));
console.log('✓ atlas.pen written —', pen.screens.length, 'screens');
pen.screens.forEach(s => {
  const count = Array.isArray(s.elements) ? s.elements.length : 0;
  console.log('  ' + s.title + ':', count, 'elements');
});
