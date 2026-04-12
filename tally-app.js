// TALLY — Financial clarity for indie founders
// Inspired by: land-book.com "Equals GTM Analytics" — editorial data density, clean table/grid UI
//              darkmodedesign.com "Midday" — business stack for founders, bento feature grid
//              awwwards "Artefakt" (Mar 2026) — monospaced typographic elements, ASCII data display
// Trend: "Editorial Data" — warm parchment light, tabular monospace numbers,
//         newspaper-column dashboard grids, honest financial clarity for solo/indie founders
// Theme: LIGHT (previous CONCLAVE was dark)
//
// Challenge: Design a financial OS that feels like a beautifully typeset spreadsheet —
//            bento metrics grid, ASCII-inspired bar charts, editorial column layout,
//            all on warm off-white parchment. Push the "print-quality data" aesthetic
//            that Equals pioneered but hasn't been explored in mobile.

const fs = require('fs');

const p = {
  bg:        '#F4F0E6',   // warm parchment — editorial print
  bg2:       '#EDE8D8',   // deeper parchment
  surface:   '#FFFFFF',   // clean white cards
  surface2:  '#FAF8F2',   // off-white elevated
  border:    '#DDD7C8',   // warm gray divider
  border2:   '#C9C2AF',   // stronger border
  text:      '#1B1916',   // near-black warm — charcoal ink
  textMuted: 'rgba(27,25,22,0.52)',
  textDim:   'rgba(27,25,22,0.28)',
  accent:    '#1A6B4A',   // deep forest green — growth / revenue
  accent2:   '#B84C2A',   // burnt sienna — expense / alert
  accent3:   '#2B4D8E',   // oxford blue — neutral data
  green:     '#2DA06E',   // mid green — positive delta
  greenBg:   '#E6F4EE',   // green tint
  redBg:     '#FAEBE4',   // sienna tint
  blueBg:    '#E8EEF9',   // blue tint
  purpleBg:  '#F0EBF7',   // purple tint
  purple:    '#7052A3',   // purple accent
};

function statusBar(bg) {
  return [
    { type: 'rect', x: 0, y: 0, w: 390, h: 48, fill: bg || p.bg },
    { type: 'text', x: 20, y: 17, text: '9:41', fontSize: 13, fontWeight: '600', color: p.text },
    { type: 'text', x: 336, y: 17, text: '▪ ▪ ▪', fontSize: 8, color: p.textMuted },
    { type: 'text', x: 368, y: 16, text: '▪', fontSize: 12, color: p.textMuted },
  ];
}

function navBar(active) {
  const items = [
    { id: 'overview',     label: 'Overview', icon: '◈' },
    { id: 'transactions', label: 'Ledger',   icon: '≡' },
    { id: 'runway',       label: 'Runway',   icon: '◐' },
    { id: 'reports',      label: 'Reports',  icon: '⊞' },
    { id: 'insights',     label: 'Insights', icon: '✦' },
  ];
  const els = [
    { type: 'rect', x: 0, y: 790, w: 390, h: 78, fill: p.surface },
    { type: 'line', x1: 0, y1: 790, x2: 390, y2: 790, color: p.border, width: 1 },
  ];
  items.forEach((item, i) => {
    const x = 16 + i * 72;
    const isActive = item.id === active;
    els.push(
      { type: 'text', x: x + 16, y: 808, text: item.icon, fontSize: 18,
        color: isActive ? p.accent : p.textDim, fontWeight: isActive ? '700' : '400' },
      { type: 'text', x: x + (item.label.length <= 5 ? 10 : 4), y: 836,
        text: item.label, fontSize: 9,
        color: isActive ? p.accent : p.textMuted,
        fontWeight: isActive ? '700' : '400' }
    );
    if (isActive) {
      els.push({ type: 'rect', x: x + 8, y: 792, w: 36, h: 2, fill: p.accent, rx: 1 });
    }
  });
  return els;
}

function tag(x, y, text, color, bg) {
  const w = text.length * 5.8 + 12;
  return [
    { type: 'rect', x, y, w, h: 18, fill: bg, rx: 3 },
    { type: 'text', x: x + 6, y: y + 5, text, fontSize: 8, fontWeight: '700', color },
  ];
}

function delta(x, y, text, positive) {
  return [
    { type: 'rect', x, y, w: 56, h: 18, fill: positive ? p.greenBg : p.redBg, rx: 3 },
    { type: 'text', x: x + 6, y: y + 5, text: (positive ? '↑ ' : '↓ ') + text,
      fontSize: 8.5, fontWeight: '700', color: positive ? p.accent : p.accent2 },
  ];
}

// ASCII bar chart helper — creates monospaced bar using block chars
function asciiBars(x, y, values, maxVal, width) {
  const chars = ' ▁▂▃▄▅▆▇█';
  const els = [];
  values.forEach((v, i) => {
    const idx = Math.min(8, Math.round((v / maxVal) * 8));
    const bh = idx * 3 + (idx > 0 ? 2 : 0);
    const bx = x + i * (width / values.length);
    if (bh > 0) {
      els.push({ type: 'rect', bx, y: y - bh, w: Math.max(8, width / values.length - 2), h: bh,
        fill: 'rgba(26,107,74,0.18)', rx: 1 });
      els.push({ type: 'rect', x: bx, y: y - bh, w: Math.max(8, width / values.length - 2), h: 2,
        fill: p.accent, rx: 1 });
    }
  });
  return els;
}

// ═══════════════════════════════════════════════════════════
// SCREEN 1 — OVERVIEW DASHBOARD
// ═══════════════════════════════════════════════════════════
function screen1() {
  const mrrTrend = [18.2, 19.4, 20.1, 21.3, 22.0, 23.1, 24.18];
  const maxMrr = 26;

  const els = [
    { type: 'rect', x: 0, y: 0, w: 390, h: 868, fill: p.bg },
    ...statusBar(p.bg),

    // Logo + wordmark
    { type: 'text', x: 20, y: 64, text: 'TALLY', fontSize: 12, fontWeight: '800',
      color: p.accent, letterSpacing: 4 },
    { type: 'text', x: 20, y: 88, text: 'March 2026', fontSize: 24, fontWeight: '700', color: p.text },
    { type: 'text', x: 20, y: 110, text: 'Financial pulse', fontSize: 12, color: p.textMuted },

    // Avatar / greeting
    { type: 'rect', x: 340, y: 58, w: 36, h: 36, fill: p.bg2, rx: 18,
      stroke: p.border, strokeWidth: 1.5 },
    { type: 'text', x: 351, y: 74, text: '👤', fontSize: 14 },

    // ── Hero MRR Card ──
    { type: 'rect', x: 20, y: 128, w: 350, h: 108, fill: p.accent, rx: 14 },
    // Subtle grid texture on hero
    ...[0, 1, 2, 3, 4, 5, 6].map(i => ({
      type: 'line',
      x1: 20 + i * 50, y1: 128, x2: 20 + i * 50, y2: 236,
      color: 'rgba(255,255,255,0.05)', width: 1
    })),
    { type: 'text', x: 36, y: 152, text: 'MRR', fontSize: 9,
      color: 'rgba(255,255,255,0.6)', fontWeight: '700', letterSpacing: 3 },
    { type: 'text', x: 36, y: 186, text: '$24,180', fontSize: 32, fontWeight: '700',
      color: '#FFFFFF', fontFamily: 'monospace' },
    ...delta(36, 196, '12.4%', true),
    { type: 'text', x: 100, y: 204, text: 'vs Feb', fontSize: 9,
      color: 'rgba(255,255,255,0.5)' },
    // Mini ASCII bars trend
    ...mrrTrend.map((v, i) => {
      const bh = Math.round((v / maxMrr) * 40);
      return [
        { type: 'rect', x: 252 + i * 16, y: 228 - bh, w: 12, h: bh,
          fill: 'rgba(255,255,255,0.18)', rx: 2 },
        { type: 'rect', x: 252 + i * 16, y: 226 - bh, w: 12, h: 2,
          fill: 'rgba(255,255,255,0.7)', rx: 1 },
      ];
    }).flat(),
    { type: 'text', x: 252, y: 244, text: '7-month trend', fontSize: 8,
      color: 'rgba(255,255,255,0.4)' },

    // ── 2×2 metric bento ──
    // Top-left: ARR
    { type: 'rect', x: 20, y: 252, w: 168, h: 82, fill: p.surface, rx: 10,
      stroke: p.border, strokeWidth: 1 },
    { type: 'text', x: 36, y: 272, text: 'ARR', fontSize: 8, color: p.textMuted,
      fontWeight: '700', letterSpacing: 2 },
    { type: 'text', x: 36, y: 296, text: '$290K', fontSize: 20, fontWeight: '700',
      color: p.text, fontFamily: 'monospace' },
    ...delta(36, 308, '8.9%', true),

    // Top-right: Churn
    { type: 'rect', x: 202, y: 252, w: 168, h: 82, fill: p.surface, rx: 10,
      stroke: p.border, strokeWidth: 1 },
    { type: 'text', x: 218, y: 272, text: 'CHURN', fontSize: 8, color: p.textMuted,
      fontWeight: '700', letterSpacing: 2 },
    { type: 'text', x: 218, y: 296, text: '1.8%', fontSize: 20, fontWeight: '700',
      color: p.accent, fontFamily: 'monospace' },
    ...delta(218, 308, '0.3pp', true),

    // ── Revenue split horizontal stacked bar ──
    { type: 'rect', x: 20, y: 350, w: 350, h: 98, fill: p.surface, rx: 10,
      stroke: p.border, strokeWidth: 1 },
    { type: 'text', x: 36, y: 368, text: 'REVENUE BREAKDOWN', fontSize: 8,
      color: p.textMuted, fontWeight: '700', letterSpacing: 1.5 },
    // Stacked bar
    { type: 'rect', x: 36, y: 380, w: 245, h: 14, fill: p.accent, rx: 0 },
    { type: 'rect', x: 281, y: 380, w: 70, h: 14, fill: p.accent3, rx: 0 },
    { type: 'rect', x: 351, y: 380, w: 19, h: 14, fill: p.border, rx: 0 },
    // Rounded ends
    { type: 'rect', x: 36, y: 380, w: 6, h: 14, fill: p.accent, rx: 3 },
    { type: 'rect', x: 362, y: 380, w: 6, h: 14, fill: p.border, rx: 3 },
    // Labels row
    { type: 'rect', x: 36, y: 402, w: 10, h: 10, fill: p.accent, rx: 2 },
    { type: 'text', x: 50, y: 411, text: 'Pro  $16,920  70%', fontSize: 9,
      color: p.text, fontWeight: '500', fontFamily: 'monospace' },
    { type: 'rect', x: 36, y: 420, w: 10, h: 10, fill: p.accent3, rx: 2 },
    { type: 'text', x: 50, y: 429, text: 'Biz  $4,860   20%', fontSize: 9,
      color: p.text, fontFamily: 'monospace' },
    { type: 'rect', x: 202, y: 420, w: 10, h: 10, fill: p.border2, rx: 2 },
    { type: 'text', x: 216, y: 429, text: 'Free $2,400  10%', fontSize: 9,
      color: p.text, fontFamily: 'monospace' },

    // ── Bottom row: Cash + Burn ──
    { type: 'rect', x: 20, y: 464, w: 168, h: 80, fill: p.surface2, rx: 10,
      stroke: p.border, strokeWidth: 1 },
    { type: 'text', x: 36, y: 484, text: 'CASH', fontSize: 8, color: p.textMuted,
      fontWeight: '700', letterSpacing: 2 },
    { type: 'text', x: 36, y: 506, text: '$182K', fontSize: 18, fontWeight: '700',
      color: p.text, fontFamily: 'monospace' },
    { type: 'text', x: 36, y: 524, text: 'in accounts', fontSize: 9, color: p.textMuted },

    { type: 'rect', x: 202, y: 464, w: 168, h: 80, fill: p.surface2, rx: 10,
      stroke: p.border, strokeWidth: 1 },
    { type: 'text', x: 218, y: 484, text: 'BURN', fontSize: 8, color: p.textMuted,
      fontWeight: '700', letterSpacing: 2 },
    { type: 'text', x: 218, y: 506, text: '$8,240', fontSize: 18, fontWeight: '700',
      color: p.accent2, fontFamily: 'monospace' },
    { type: 'text', x: 218, y: 524, text: 'per month', fontSize: 9, color: p.textMuted },

    // ── Runway banner ──
    { type: 'rect', x: 20, y: 560, w: 350, h: 56, fill: p.blueBg, rx: 10,
      stroke: '#BFD0EE', strokeWidth: 1 },
    { type: 'text', x: 36, y: 580, text: '◐  Cash runway', fontSize: 12,
      color: p.accent3, fontWeight: '700' },
    { type: 'text', x: 36, y: 600, text: '22 months · Default alive at current growth rate', fontSize: 9.5,
      color: p.textMuted },
    { type: 'text', x: 312, y: 586, text: '22mo', fontSize: 16, fontWeight: '800',
      color: p.accent3, fontFamily: 'monospace' },

    // ── Quick actions ──
    { type: 'text', x: 20, y: 640, text: 'Quick actions', fontSize: 10, color: p.textMuted, fontWeight: '500' },
    { type: 'rect', x: 20, y: 655, w: 106, h: 40, fill: p.surface, rx: 8,
      stroke: p.border, strokeWidth: 1 },
    { type: 'text', x: 32, y: 672, text: '+ Invoice', fontSize: 11, color: p.text, fontWeight: '500' },
    { type: 'rect', x: 136, y: 655, w: 106, h: 40, fill: p.surface, rx: 8,
      stroke: p.border, strokeWidth: 1 },
    { type: 'text', x: 148, y: 672, text: '⊞ Export', fontSize: 11, color: p.text, fontWeight: '500' },
    { type: 'rect', x: 252, y: 655, w: 118, h: 40, fill: p.accent, rx: 8 },
    { type: 'text', x: 268, y: 672, text: '✦ Ask AI', fontSize: 11, color: '#FFF', fontWeight: '700' },

    ...navBar('overview'),
  ];
  return els;
}

// ═══════════════════════════════════════════════════════════
// SCREEN 2 — TRANSACTION LEDGER
// ═══════════════════════════════════════════════════════════
function screen2() {
  const txns = [
    { date: 'Mar 27', desc: 'Stripe — Pro Subscription', cat: 'Revenue',  amt: '+$79.00',   pos: true  },
    { date: 'Mar 27', desc: 'AWS EC2 & RDS',             cat: 'Infra',    amt: '-$312.40',  pos: false },
    { date: 'Mar 26', desc: 'Stripe — 14 renewals',      cat: 'Revenue',  amt: '+$1,106',   pos: true  },
    { date: 'Mar 26', desc: 'Linear — Annual Plan',      cat: 'Tools',    amt: '-$144.00',  pos: false },
    { date: 'Mar 25', desc: 'Stripe — Business Sub',     cat: 'Revenue',  amt: '+$299.00',  pos: true  },
    { date: 'Mar 25', desc: 'Payroll — March run',       cat: 'Payroll',  amt: '-$4,800',   pos: false },
    { date: 'Mar 24', desc: 'Figma — Org Plan',          cat: 'Design',   amt: '-$45.00',   pos: false },
    { date: 'Mar 24', desc: 'Stripe — 8 renewals',       cat: 'Revenue',  amt: '+$632.00',  pos: true  },
    { date: 'Mar 23', desc: 'Cloudflare — Annual',       cat: 'Infra',    amt: '-$200.00',  pos: false },
    { date: 'Mar 23', desc: 'Stripe — 6 renewals',       cat: 'Revenue',  amt: '+$474.00',  pos: true  },
  ];
  const catColors = {
    Revenue: { c: p.accent, bg: p.greenBg },
    Infra:   { c: p.accent3, bg: p.blueBg },
    Tools:   { c: p.purple, bg: p.purpleBg },
    Payroll: { c: p.accent2, bg: p.redBg },
    Design:  { c: '#A07040', bg: '#F5EDDF' },
  };

  const els = [
    { type: 'rect', x: 0, y: 0, w: 390, h: 868, fill: p.bg },
    ...statusBar(p.bg),

    { type: 'text', x: 20, y: 64, text: 'TALLY', fontSize: 12, fontWeight: '800',
      color: p.accent, letterSpacing: 4 },
    { type: 'text', x: 20, y: 88, text: 'Transaction Ledger', fontSize: 22, fontWeight: '700', color: p.text },

    // Totals row
    { type: 'rect', x: 20, y: 110, w: 168, h: 38, fill: p.greenBg, rx: 8 },
    { type: 'text', x: 36, y: 125, text: '↑ +$2,590.00', fontSize: 12, fontWeight: '700',
      color: p.accent, fontFamily: 'monospace' },
    { type: 'text', x: 36, y: 140, text: 'income this month', fontSize: 8, color: p.accent },
    { type: 'rect', x: 202, y: 110, w: 168, h: 38, fill: p.redBg, rx: 8 },
    { type: 'text', x: 218, y: 125, text: '↓ -$5,501.40', fontSize: 12, fontWeight: '700',
      color: p.accent2, fontFamily: 'monospace' },
    { type: 'text', x: 218, y: 140, text: 'expenses this month', fontSize: 8, color: p.accent2 },

    // Search + filter
    { type: 'rect', x: 20, y: 158, w: 280, h: 34, fill: p.surface, rx: 8,
      stroke: p.border, strokeWidth: 1 },
    { type: 'text', x: 38, y: 172, text: '⌕', fontSize: 14, color: p.textDim },
    { type: 'text', x: 58, y: 174, text: 'Search transactions...', fontSize: 11, color: p.textDim },
    { type: 'rect', x: 308, y: 158, w: 62, h: 34, fill: p.surface, rx: 8,
      stroke: p.border, strokeWidth: 1 },
    { type: 'text', x: 318, y: 174, text: '⊞ Filter', fontSize: 10, color: p.text, fontWeight: '500' },

    // Column header
    { type: 'rect', x: 20, y: 202, w: 350, h: 22, fill: p.bg2, rx: 5 },
    { type: 'text', x: 28, y: 213, text: 'DATE', fontSize: 7.5, color: p.textMuted,
      fontWeight: '700', letterSpacing: 1 },
    { type: 'text', x: 80, y: 213, text: 'DESCRIPTION & CATEGORY', fontSize: 7.5,
      color: p.textMuted, fontWeight: '700', letterSpacing: 0.5 },
    { type: 'text', x: 316, y: 213, text: 'AMOUNT', fontSize: 7.5, color: p.textMuted,
      fontWeight: '700', letterSpacing: 0.5 },
  ];

  txns.forEach((tx, i) => {
    const y = 240 + i * 56;
    if (i >= 10) return;
    const cc = catColors[tx.cat] || { c: p.textMuted, bg: p.bg2 };

    if (i % 2 === 0) {
      els.push({ type: 'rect', x: 12, y: y - 8, w: 366, h: 50, fill: p.surface2, rx: 6 });
    }
    // Left accent bar
    els.push({ type: 'rect', x: 16, y: y - 2, w: 3, h: 36, fill: tx.pos ? p.accent : p.accent2, rx: 1.5 });
    // Date
    els.push({ type: 'text', x: 26, y: y + 6, text: tx.date, fontSize: 8.5,
      color: p.textMuted, fontFamily: 'monospace' });
    // Desc
    els.push({ type: 'text', x: 78, y: y + 6, text: tx.desc, fontSize: 10.5,
      color: p.text, fontWeight: '500' });
    // Cat tag
    els.push(...tag(78, y + 18, tx.cat, cc.c, cc.bg));
    // Amount
    els.push({ type: 'text', x: 312, y: y + 15, text: tx.amt, fontSize: 12,
      color: tx.pos ? p.accent : p.accent2, fontWeight: '700', fontFamily: 'monospace' });
  });

  els.push(...navBar('transactions'));
  return els;
}

// ═══════════════════════════════════════════════════════════
// SCREEN 3 — RUNWAY PLANNER
// ═══════════════════════════════════════════════════════════
function screen3() {
  const cashData   = [182, 189, 198, 207, 217, 230, 244, 256, 270, 285, 300, 316];
  const labels     = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const burnItems  = [
    { l: 'Payroll',        amt: '$4,800', pct: 58, c: p.accent2 },
    { l: 'Infrastructure', amt: '$1,840', pct: 22, c: p.accent3 },
    { l: 'Tools & SaaS',   amt: '$820',   pct: 10, c: p.purple  },
    { l: 'Marketing',      amt: '$540',   pct:  7, c: '#A07040' },
    { l: 'Misc & Ops',     amt: '$240',   pct:  3, c: p.border2 },
  ];

  const chartX = 36, chartY = 330, chartW = 300, chartH = 100;

  const els = [
    { type: 'rect', x: 0, y: 0, w: 390, h: 868, fill: p.bg },
    ...statusBar(p.bg),

    { type: 'text', x: 20, y: 64, text: 'TALLY', fontSize: 12, fontWeight: '800',
      color: p.accent, letterSpacing: 4 },
    { type: 'text', x: 20, y: 88, text: 'Runway Planner', fontSize: 22, fontWeight: '700', color: p.text },
    { type: 'text', x: 20, y: 109, text: 'Base scenario · Projection to Mar 2027', fontSize: 11,
      color: p.textMuted },

    // Scenario toggle
    { type: 'rect', x: 20, y: 124, w: 240, h: 28, fill: p.surface, rx: 8,
      stroke: p.border, strokeWidth: 1 },
    { type: 'rect', x: 22, y: 126, w: 76, h: 24, fill: p.accent, rx: 6 },
    { type: 'text', x: 40, y: 135, text: 'Base', fontSize: 10, color: '#FFF', fontWeight: '700' },
    { type: 'text', x: 108, y: 135, text: 'Bull', fontSize: 10, color: p.textMuted },
    { type: 'text', x: 172, y: 135, text: 'Bear', fontSize: 10, color: p.textMuted },

    // Key stats row
    { type: 'rect', x: 20, y: 166, w: 168, h: 66, fill: p.surface, rx: 10,
      stroke: p.border, strokeWidth: 1 },
    { type: 'text', x: 36, y: 184, text: 'RUNWAY', fontSize: 8, color: p.textMuted,
      fontWeight: '700', letterSpacing: 2 },
    { type: 'text', x: 36, y: 206, text: '22 months', fontSize: 16, fontWeight: '700',
      color: p.accent3, fontFamily: 'monospace' },
    { type: 'text', x: 36, y: 222, text: 'until Jan 2028', fontSize: 9, color: p.textMuted },

    { type: 'rect', x: 202, y: 166, w: 168, h: 66, fill: p.surface, rx: 10,
      stroke: p.border, strokeWidth: 1 },
    { type: 'text', x: 218, y: 184, text: 'DEFAULT ALIVE', fontSize: 8, color: p.textMuted,
      fontWeight: '700', letterSpacing: 1.5 },
    { type: 'text', x: 218, y: 206, text: 'Aug 2026', fontSize: 16, fontWeight: '700',
      color: p.accent, fontFamily: 'monospace' },
    { type: 'text', x: 218, y: 222, text: 'at $34,600 MRR', fontSize: 9, color: p.textMuted },

    // Cash projection chart
    { type: 'rect', x: 20, y: 246, w: 350, h: 150, fill: p.surface, rx: 10,
      stroke: p.border, strokeWidth: 1 },
    { type: 'text', x: 36, y: 264, text: 'CASH PROJECTION ($K)', fontSize: 8,
      color: p.textMuted, fontWeight: '700', letterSpacing: 1.5 },

    // Grid & bars
    ...[100, 150, 200, 250, 300].map(v => {
      const gy = 380 - ((v - 80) / 240) * chartH;
      return [
        { type: 'line', x1: chartX, y1: gy, x2: chartX + chartW, y2: gy,
          color: p.border, width: 0.5 },
        { type: 'text', x: 14, y: gy + 3, text: v.toString(), fontSize: 7, color: p.textDim },
      ];
    }).flat(),

    ...cashData.map((v, i) => {
      const barH = ((v - 80) / 240) * chartH;
      const bx = chartX + 4 + i * (chartW / 12);
      return [
        { type: 'rect', x: bx, y: 380 - barH, w: 18, h: barH,
          fill: 'rgba(26,107,74,0.13)', rx: 2 },
        { type: 'rect', x: bx, y: 378 - barH, w: 18, h: 3,
          fill: i < 2 ? p.accent : 'rgba(26,107,74,0.5)', rx: 1 },
      ];
    }).flat(),

    ...labels.map((l, i) => ({
      type: 'text',
      x: chartX + 4 + i * (chartW / 12) + 1,
      y: 394,
      text: l,
      fontSize: 7,
      color: p.textDim,
    })),

    // Burn breakdown
    { type: 'rect', x: 20, y: 410, w: 350, h: 140, fill: p.surface, rx: 10,
      stroke: p.border, strokeWidth: 1 },
    { type: 'text', x: 36, y: 428, text: 'MONTHLY BURN  $8,240', fontSize: 9,
      color: p.textMuted, fontWeight: '700', letterSpacing: 1 },

    ...burnItems.map((item, i) => {
      const y = 444 + i * 20;
      return [
        { type: 'text', x: 36, y: y + 11, text: item.l, fontSize: 9.5,
          color: p.text, fontWeight: '400' },
        { type: 'rect', x: 136, y: y + 3, w: item.pct * 1.55, h: 9,
          fill: item.c, rx: 2, opacity: 0.7 },
        { type: 'text', x: 296, y: y + 11, text: item.amt, fontSize: 9.5,
          color: p.text, fontFamily: 'monospace' },
        { type: 'text', x: 348, y: y + 11, text: `${item.pct}%`, fontSize: 8.5,
          color: p.textMuted },
      ];
    }).flat(),

    // Adjust levers
    { type: 'rect', x: 20, y: 566, w: 350, h: 68, fill: p.bg2, rx: 10 },
    { type: 'text', x: 36, y: 584, text: 'Scenario levers', fontSize: 11,
      color: p.text, fontWeight: '600' },
    { type: 'text', x: 36, y: 604, text: 'Growth: +12.4%/mo', fontSize: 10,
      color: p.accent, fontFamily: 'monospace' },
    { type: 'rect', x: 36, y: 614, w: 140, h: 7, fill: p.border, rx: 3 },
    { type: 'rect', x: 36, y: 614, w: 88, h: 7, fill: p.accent, rx: 3 },
    { type: 'text', x: 188, y: 604, text: 'Burn: $8,240/mo', fontSize: 10,
      color: p.accent2, fontFamily: 'monospace' },
    { type: 'rect', x: 188, y: 614, w: 140, h: 7, fill: p.border, rx: 3 },
    { type: 'rect', x: 188, y: 614, w: 100, h: 7, fill: p.accent2, rx: 3 },

    ...navBar('runway'),
  ];
  return els;
}

// ═══════════════════════════════════════════════════════════
// SCREEN 4 — P&L REPORT
// ═══════════════════════════════════════════════════════════
function screen4() {
  const rows = [
    { label: 'Gross Revenue',     q4: '$61,440', q1: '$73,280', delta: '+19.3%', pos: true,  bold: false },
    { label: 'Refunds',           q4: '-$820',   q1: '-$940',   delta: '-14.6%', pos: false, bold: false },
    { label: 'Net Revenue',       q4: '$60,620', q1: '$72,340', delta: '+19.4%', pos: true,  bold: true  },
    { divider: true },
    { label: 'Payroll',           q4: '-$13,200', q1: '-$14,400', delta: '-9.1%',  pos: false, bold: false },
    { label: 'Infrastructure',    q4: '-$4,920',  q1: '-$5,520',  delta: '-12.2%', pos: false, bold: false },
    { label: 'Tools & SaaS',      q4: '-$2,160',  q1: '-$2,460',  delta: '-13.9%', pos: false, bold: false },
    { label: 'Marketing',         q4: '-$1,440',  q1: '-$1,620',  delta: '-12.5%', pos: false, bold: false },
    { label: 'Total OpEx',        q4: '-$21,720', q1: '-$24,000', delta: '-10.5%', pos: false, bold: true  },
    { divider: true },
    { label: 'Net Profit',        q4: '$38,900', q1: '$48,340', delta: '+24.3%', pos: true, bold: true, hl: true },
    { label: 'Margin',            q4: '64.2%',   q1: '66.8%',   delta: '+2.6pp', pos: true, bold: false },
  ];

  const els = [
    { type: 'rect', x: 0, y: 0, w: 390, h: 868, fill: p.bg },
    ...statusBar(p.bg),

    { type: 'text', x: 20, y: 64, text: 'TALLY', fontSize: 12, fontWeight: '800',
      color: p.accent, letterSpacing: 4 },
    { type: 'text', x: 20, y: 88, text: 'P&L Report', fontSize: 22, fontWeight: '700', color: p.text },
    { type: 'text', x: 20, y: 110, text: 'Q4 2025  →  Q1 2026  ·  QoQ comparison', fontSize: 11,
      color: p.textMuted, fontFamily: 'monospace' },

    // Period chips
    ...tag(20, 126, 'Quarterly', p.surface, p.accent),
    { type: 'rect', x: 20, y: 126, w: 62, h: 18, fill: p.accent, rx: 3 },
    { type: 'text', x: 28, y: 132, text: 'Quarterly', fontSize: 8, color: '#FFF', fontWeight: '700' },
    ...tag(90, 126, 'Monthly', p.textMuted, p.bg2),
    ...tag(148, 126, 'Annual', p.textMuted, p.bg2),

    // Table header
    { type: 'rect', x: 20, y: 154, w: 350, h: 24, fill: p.bg2, rx: 6 },
    { type: 'text', x: 28, y: 166, text: 'LINE ITEM', fontSize: 7.5, color: p.textMuted,
      fontWeight: '700', letterSpacing: 1 },
    { type: 'text', x: 196, y: 166, text: 'Q4 2025', fontSize: 7.5, color: p.textMuted,
      fontWeight: '700', fontFamily: 'monospace' },
    { type: 'text', x: 264, y: 166, text: 'Q1 2026', fontSize: 7.5, color: p.textMuted,
      fontWeight: '700', fontFamily: 'monospace' },
    { type: 'text', x: 330, y: 166, text: 'ΔCHG', fontSize: 7.5, color: p.textMuted,
      fontWeight: '700', letterSpacing: 1 },
  ];

  let y = 192;
  rows.forEach(row => {
    if (row.divider) {
      els.push({ type: 'line', x1: 20, y1: y, x2: 370, y2: y, color: p.border2, width: 0.8 });
      y += 12;
      return;
    }
    if (row.hl) {
      els.push({ type: 'rect', x: 16, y: y - 10, w: 358, h: 28, fill: p.greenBg, rx: 6 });
    }
    els.push(
      { type: 'text', x: 28, y, text: row.label, fontSize: 10,
        color: row.hl ? p.accent : p.text, fontWeight: row.bold ? '700' : '400' },
      { type: 'text', x: 192, y, text: row.q4, fontSize: 10,
        color: row.q4.startsWith('-') ? p.accent2 : p.text,
        fontFamily: 'monospace', fontWeight: row.bold ? '700' : '400' },
      { type: 'text', x: 260, y, text: row.q1, fontSize: 10,
        color: row.q1.startsWith('-') ? p.accent2 : p.text,
        fontFamily: 'monospace', fontWeight: row.bold ? '700' : '400' },
      { type: 'text', x: 328, y, text: row.delta, fontSize: 9.5,
        color: row.pos ? p.accent : p.accent2,
        fontFamily: 'monospace', fontWeight: '600' }
    );
    y += 26;
  });

  els.push(
    { type: 'rect', x: 20, y: 556, w: 350, h: 42, fill: p.accent, rx: 10 },
    { type: 'text', x: 124, y: 574, text: '⊞  Export to CSV / PDF', fontSize: 12,
      color: '#FFF', fontWeight: '700' },
    ...navBar('reports')
  );
  return els;
}

// ═══════════════════════════════════════════════════════════
// SCREEN 5 — AI INSIGHTS
// ═══════════════════════════════════════════════════════════
function screen5() {
  const insights = [
    {
      icon: '↑', iconColor: p.accent, iconBg: p.greenBg,
      tag: 'Growth', tagColor: p.accent, tagBg: p.greenBg,
      title: 'MRR growth accelerating',
      lines: [
        '3-month MRR trend: +12.4% vs +9.1%',
        'prior quarter. Annual cohort retention',
        'improved to 87.3% — all-time high.',
      ],
      cta: 'View cohort analysis →',
    },
    {
      icon: '⚠', iconColor: p.accent2, iconBg: p.redBg,
      tag: 'Cost Alert', tagColor: p.accent2, tagBg: p.redBg,
      title: 'Infrastructure scaling faster than rev.',
      lines: [
        'AWS costs +22% QoQ vs revenue +19.4%.',
        'Reserved instances could cut EC2 ~35%',
        'saving ~$644/mo at current usage.',
      ],
      cta: 'Optimize infra spend →',
    },
    {
      icon: '◈', iconColor: p.accent3, iconBg: p.blueBg,
      tag: 'Upsell', tagColor: p.accent3, tagBg: p.blueBg,
      title: 'Business tier conversion opportunity',
      lines: [
        '34 Pro users have 3+ members.',
        'Upgrading adds $3,400 MRR — that is',
        '14% growth in a single push.',
      ],
      cta: 'See the segment →',
    },
    {
      icon: '✦', iconColor: p.purple, iconBg: p.purpleBg,
      tag: 'Hiring', tagColor: p.purple, tagBg: p.purpleBg,
      title: 'Safe to hire in Q3 2026',
      lines: [
        'At current growth, payroll stays below',
        '60% of burn through Q4. You can afford',
        'one more senior hire without extending.',
      ],
      cta: 'Model the hire →',
    },
  ];

  const els = [
    { type: 'rect', x: 0, y: 0, w: 390, h: 868, fill: p.bg },
    ...statusBar(p.bg),

    { type: 'text', x: 20, y: 64, text: 'TALLY', fontSize: 12, fontWeight: '800',
      color: p.accent, letterSpacing: 4 },
    { type: 'text', x: 20, y: 88, text: 'AI Insights', fontSize: 22, fontWeight: '700', color: p.text },
    { type: 'text', x: 20, y: 109, text: 'Powered by your live financial data', fontSize: 11, color: p.textMuted },

    // Ask bar
    { type: 'rect', x: 20, y: 126, w: 350, h: 42, fill: p.surface, rx: 10,
      stroke: p.accent, strokeWidth: 1.5 },
    { type: 'text', x: 40, y: 144, text: '✦', fontSize: 14, color: p.accent },
    { type: 'text', x: 62, y: 145, text: 'Ask about your finances...', fontSize: 12, color: p.textDim },
    { type: 'rect', x: 314, y: 134, w: 44, h: 22, fill: p.accent, rx: 6 },
    { type: 'text', x: 326, y: 142, text: 'Ask', fontSize: 10, color: '#FFF', fontWeight: '700' },

    // Summary bar
    { type: 'rect', x: 20, y: 182, w: 350, h: 36, fill: p.bg2, rx: 8 },
    { type: 'text', x: 36, y: 196, text: '4 insights  ·  2 require action  ·  Updated 5 min ago',
      fontSize: 9.5, color: p.textMuted },
    { type: 'text', x: 283, y: 207, text: 'See history →', fontSize: 9, color: p.accent, fontWeight: '600' },
  ];

  insights.forEach((ins, i) => {
    const y = 232 + i * 134;
    els.push(
      { type: 'rect', x: 20, y, w: 350, h: 122, fill: p.surface, rx: 10,
        stroke: p.border, strokeWidth: 1 },
      // Icon badge
      { type: 'rect', x: 36, y: y + 14, w: 32, h: 32, fill: ins.iconBg, rx: 8 },
      { type: 'text', x: 45, y: y + 25, text: ins.icon, fontSize: 14,
        color: ins.iconColor, fontWeight: '700' },
      // Tag
      ...tag(290, y + 14, ins.tag, ins.tagColor, ins.tagBg),
      // Title
      { type: 'text', x: 78, y: y + 28, text: ins.title, fontSize: 11,
        color: p.text, fontWeight: '700' },
      // Body lines
      ...ins.lines.map((l, li) => ({
        type: 'text', x: 36, y: y + 56 + li * 14, text: l, fontSize: 9.5, color: p.textMuted,
      })),
      // CTA
      { type: 'text', x: 36, y: y + 108, text: ins.cta, fontSize: 9.5,
        color: ins.iconColor, fontWeight: '700' }
    );
  });

  els.push(...navBar('insights'));
  return els;
}

// ═══════════════════════════════════════════════════════════
// BUILD + WRITE PEN
// ═══════════════════════════════════════════════════════════
const pen = {
  version: '2.8',
  meta: {
    name: 'TALLY — Financial Clarity for Founders',
    description:
      'A financial operating system for indie founders. ' +
      'Warm parchment light theme, tabular monospace numbers, bento metric grid, ' +
      'editorial-print-quality data density. ' +
      'Inspired by Equals GTM Analytics (land-book.com), Midday (darkmodedesign.com), ' +
      'and Artefakt ASCII typographic aesthetics (awwwards.com, Mar 2026).',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    tags: ['fintech', 'dashboard', 'light-theme', 'editorial', 'analytics', 'saas', 'founders'],
    artboardWidth: 390,
    artboardHeight: 868,
  },
  screens: [
    { id: 's1', name: 'Overview',     width: 390, height: 868, elements: screen1() },
    { id: 's2', name: 'Ledger',       width: 390, height: 868, elements: screen2() },
    { id: 's3', name: 'Runway',       width: 390, height: 868, elements: screen3() },
    { id: 's4', name: 'P&L Report',   width: 390, height: 868, elements: screen4() },
    { id: 's5', name: 'AI Insights',  width: 390, height: 868, elements: screen5() },
  ],
};

fs.writeFileSync('tally.pen', JSON.stringify(pen, null, 2));
console.log('✓ tally.pen written —', pen.screens.length, 'screens,',
  pen.screens.reduce((a, s) => a + s.elements.length, 0), 'total elements');
