// fathom-app.js — Fathom: Personal Finance Clarity
// Inspiration: "Fluid Glass" by Exo Ape (Awwwards) + "Midday" on Dark Mode Design
// Trend: Liquid glass morphism on deep void backgrounds, iridescent gradient overlays
// Theme: DARK (Vela was light — rotating)

const fs = require('fs');

const SLUG = 'fathom';
const APP_NAME = 'Fathom';
const VERSION = '2.8';

// Dark palette: deep navy void + glass surfaces + indigo/emerald
const p = {
  bg:        '#07090F',  // deep space navy-black
  bg2:       '#0D1120',  // slightly lighter layer
  surface:   '#121729',  // card base (dark glass base)
  surfaceGl: '#1A2235',  // glass surface highlight
  text:      '#EEF2FF',  // icy white
  textSub:   '#8892B0',  // muted blue-gray
  accent:    '#7C6FF7',  // violet-indigo
  accent2:   '#34D399',  // emerald green (money positive)
  accentR:   '#F87171',  // red (money negative)
  accentY:   '#FBBF24',  // amber
  muted:     'rgba(238,242,255,0.30)',
  border:    'rgba(124,111,247,0.18)',
  borderD:   'rgba(238,242,255,0.08)',
  glass:     'rgba(255,255,255,0.04)',
  glassH:    'rgba(255,255,255,0.08)',
  glow:      'rgba(124,111,247,0.35)',
  glow2:     'rgba(52,211,153,0.20)',
};

function px(n) { return { value: n, unit: 'px' }; }
function pct(n) { return { value: n, unit: '%' }; }

function box(id, x, y, w, h, opts = {}) {
  return {
    id, type: 'box',
    x: px(x), y: px(y), width: px(w), height: px(h),
    backgroundColor: opts.bg || p.surface,
    borderRadius: px(opts.radius !== undefined ? opts.radius : 16),
    borderWidth: px(opts.border !== undefined ? opts.border : 0),
    borderColor: opts.borderColor || p.borderD,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
    ...(opts.shadow ? { shadowColor: opts.shadowColor || p.glow, shadowBlur: px(opts.shadowBlur || 24), shadowOffsetX: px(0), shadowOffsetY: px(opts.shadowY || 8) } : {}),
  };
}

function text(id, content, x, y, w, h, opts = {}) {
  return {
    id, type: 'text', content,
    x: px(x), y: px(y), width: px(w), height: px(h),
    fontSize: px(opts.size || 14),
    fontWeight: opts.weight || '400',
    color: opts.color || p.text,
    textAlign: opts.align || 'left',
    lineHeight: opts.leading || 1.4,
    letterSpacing: opts.tracking !== undefined ? opts.tracking : 0,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
  };
}

function circle(id, cx, cy, r, opts = {}) {
  return box(id, cx - r, cy - r, r * 2, r * 2, { ...opts, radius: r });
}

function line(id, x, y, w, h, opts = {}) {
  return box(id, x, y, w, h, { bg: opts.color || p.borderD, radius: opts.radius !== undefined ? opts.radius : 1, border: 0 });
}

// ─── SCREEN 1: NET WORTH OVERVIEW ──────────────────────────────────────────
function screenNetWorth() {
  const elements = [];

  // Background
  elements.push(box('bg', 0, 0, 390, 844, { bg: p.bg, radius: 0, border: 0 }));

  // Ambient glow top — iridescent violet blur
  elements.push(box('glow-top', -40, -60, 300, 300, {
    bg: 'rgba(124,111,247,0.12)', radius: 150, border: 0, opacity: 1,
    shadow: true, shadowColor: 'rgba(124,111,247,0.20)', shadowBlur: 80, shadowY: 0,
  }));
  // Ambient glow right — emerald
  elements.push(box('glow-right', 220, 100, 200, 200, {
    bg: 'rgba(52,211,153,0.08)', radius: 100, border: 0,
    shadow: true, shadowColor: 'rgba(52,211,153,0.15)', shadowBlur: 60, shadowY: 0,
  }));

  // Status bar
  elements.push(text('time', '9:41', 16, 14, 60, 20, { size: 15, weight: '600', color: p.text }));
  elements.push(text('status-icons', '●●●', 310, 14, 64, 20, { size: 11, color: p.textSub, align: 'right' }));

  // Header
  elements.push(text('greeting', 'Good morning, Alex', 20, 48, 240, 22, { size: 13, color: p.textSub, weight: '400' }));
  elements.push(circle('avatar', 362, 58, 20, { bg: p.accent, border: 0 }));
  elements.push(text('avatar-init', 'A', 354, 50, 16, 16, { size: 13, weight: '700', color: p.text, align: 'center' }));

  // Net Worth Hero card — glass with glow border
  elements.push(box('hero-card', 16, 82, 358, 160, {
    bg: p.surfaceGl, radius: 24, border: 1, borderColor: p.border,
    shadow: true, shadowColor: p.glow, shadowBlur: 32, shadowY: 12,
  }));
  elements.push(text('nw-label', 'NET WORTH', 32, 100, 180, 16, { size: 10, weight: '700', color: p.accent, tracking: 2 }));
  elements.push(text('nw-delta', '+2.4% this month', 200, 100, 158, 16, { size: 11, weight: '500', color: p.accent2, align: 'right' }));
  elements.push(text('nw-amount', '$248,619', 32, 120, 326, 52, { size: 42, weight: '700', color: p.text, tracking: -1 }));

  // Mini sparkline (geometric approx)
  const spkY = [192, 188, 194, 182, 175, 178, 170, 172, 165, 168, 160, 162];
  for (let i = 0; i < spkY.length - 1; i++) {
    const x1 = 32 + i * 26;
    elements.push(line(`spk-${i}`, x1, spkY[i], 28, 2, { color: p.accent, radius: 1 }));
  }
  // Sparkline dot at end
  elements.push(circle('spk-dot', 306, 163, 4, { bg: p.accent2, border: 0 }));
  elements.push(text('spk-sub', 'Last 12 months', 32, 212, 200, 14, { size: 11, color: p.textSub }));

  // Quick stats row
  const stats = [
    { label: 'Assets', val: '$312,041', color: p.accent2 },
    { label: 'Debt',   val: '$63,422',  color: p.accentR },
    { label: 'Cash',   val: '$18,290',  color: p.accentY },
  ];
  stats.forEach((s, i) => {
    const x = 16 + i * 126;
    elements.push(box(`stat-card-${i}`, x, 256, 118, 72, {
      bg: p.surface, radius: 14, border: 1, borderColor: p.borderD,
    }));
    elements.push(text(`stat-val-${i}`, s.val, x + 12, 268, 94, 24, { size: 15, weight: '700', color: s.color }));
    elements.push(text(`stat-lbl-${i}`, s.label, x + 12, 295, 94, 16, { size: 11, color: p.textSub }));
  });

  // Section: Recent Moves
  elements.push(text('moves-title', 'Recent Moves', 20, 344, 200, 20, { size: 14, weight: '700', color: p.text }));
  elements.push(text('moves-all', 'See all', 310, 344, 60, 20, { size: 12, color: p.accent, align: 'right' }));

  const txns = [
    { name: 'Rent Payment',        cat: 'Housing',    amt: '–$2,200', color: p.accentR, icon: '🏠' },
    { name: 'Freelance Deposit',   cat: 'Income',     amt: '+$3,500', color: p.accent2, icon: '💼' },
    { name: 'AAPL Purchase',       cat: 'Investing',  amt: '–$890',  color: p.accentY, icon: '📈' },
  ];
  txns.forEach((t, i) => {
    const y = 372 + i * 76;
    elements.push(box(`txn-bg-${i}`, 16, y, 358, 64, {
      bg: i === 0 ? p.surfaceGl : p.surface, radius: 14, border: 1, borderColor: p.borderD,
    }));
    elements.push(text(`txn-icon-${i}`, t.icon, 28, y + 16, 28, 28, { size: 20, align: 'center' }));
    elements.push(text(`txn-name-${i}`, t.name, 64, y + 12, 200, 18, { size: 14, weight: '600', color: p.text }));
    elements.push(text(`txn-cat-${i}`, t.cat, 64, y + 32, 200, 16, { size: 11, color: p.textSub }));
    elements.push(text(`txn-amt-${i}`, t.amt, 264, y + 18, 94, 20, { size: 14, weight: '700', color: t.color, align: 'right' }));
  });

  // Bottom nav
  elements.push(box('nav-bg', 0, 762, 390, 82, { bg: p.bg2, radius: 0, border: 1, borderColor: p.borderD }));
  const navItems = [
    { icon: '◈', label: 'Overview', active: true  },
    { icon: '◉', label: 'Spending', active: false },
    { icon: '◎', label: 'Goals',    active: false },
    { icon: '⊙', label: 'Profile',  active: false },
  ];
  navItems.forEach((n, i) => {
    const x = 20 + i * 88;
    const col = n.active ? p.accent : p.textSub;
    elements.push(text(`nav-icon-${i}`, n.icon, x + 20, 774, 48, 22, { size: 22, color: col, align: 'center' }));
    elements.push(text(`nav-lbl-${i}`, n.label, x + 4, 798, 80, 16, { size: 10, weight: n.active ? '700' : '400', color: col, align: 'center' }));
  });
  if (navItems[0].active) {
    elements.push(circle('nav-dot', 64, 770, 3, { bg: p.accent, border: 0 }));
  }

  return { id: 'net-worth', label: 'Net Worth', backgroundColor: p.bg, elements };
}

// ─── SCREEN 2: CASH FLOW ───────────────────────────────────────────────────
function screenCashFlow() {
  const elements = [];

  elements.push(box('bg', 0, 0, 390, 844, { bg: p.bg, radius: 0, border: 0 }));
  elements.push(box('glow-a', 100, -80, 280, 280, {
    bg: 'rgba(52,211,153,0.09)', radius: 140, border: 0,
    shadow: true, shadowColor: 'rgba(52,211,153,0.12)', shadowBlur: 80, shadowY: 0,
  }));

  elements.push(text('time', '9:41', 16, 14, 60, 20, { size: 15, weight: '600', color: p.text }));
  elements.push(text('title', 'Cash Flow', 20, 48, 200, 28, { size: 22, weight: '800', color: p.text, tracking: -0.5 }));
  elements.push(text('period', 'March 2026', 20, 80, 200, 18, { size: 13, color: p.textSub }));

  // Month selector pills
  const months = ['Jan', 'Feb', 'Mar', 'Apr'];
  months.forEach((m, i) => {
    const x = 20 + i * 76;
    elements.push(box(`mpill-${i}`, x, 108, 68, 28, {
      bg: m === 'Mar' ? p.accent : p.surface, radius: 14, border: 0,
    }));
    elements.push(text(`mpill-lbl-${i}`, m, x, 112, 68, 20, {
      size: 12, weight: m === 'Mar' ? '700' : '400',
      color: m === 'Mar' ? p.text : p.textSub, align: 'center',
    }));
  });

  // Income vs Spend summary
  elements.push(box('income-card', 16, 148, 172, 76, {
    bg: p.surfaceGl, radius: 16, border: 1, borderColor: 'rgba(52,211,153,0.25)',
  }));
  elements.push(text('income-lbl', 'INCOME', 28, 160, 100, 14, { size: 10, weight: '700', color: p.accent2, tracking: 2 }));
  elements.push(text('income-val', '$7,840', 28, 176, 148, 28, { size: 22, weight: '800', color: p.text }));
  elements.push(text('income-sub', '+$340 vs Feb', 28, 206, 148, 14, { size: 11, color: p.accent2 }));

  elements.push(box('spend-card', 202, 148, 172, 76, {
    bg: p.surfaceGl, radius: 16, border: 1, borderColor: 'rgba(248,113,113,0.25)',
  }));
  elements.push(text('spend-lbl', 'SPENT', 214, 160, 100, 14, { size: 10, weight: '700', color: p.accentR, tracking: 2 }));
  elements.push(text('spend-val', '$5,210', 214, 176, 148, 28, { size: 22, weight: '800', color: p.text }));
  elements.push(text('spend-sub', '–$180 vs Feb', 214, 206, 148, 14, { size: 11, color: p.accent2 }));

  // Bar chart — weekly cash flow
  elements.push(text('chart-title', 'Weekly Cash Flow', 20, 238, 240, 18, { size: 13, weight: '700', color: p.text }));
  const bars = [
    { label: 'W1', income: 100, spend: 72 },
    { label: 'W2', income: 88,  spend: 94 },
    { label: 'W3', income: 110, spend: 60 },
    { label: 'W4', income: 90,  spend: 78 },
  ];
  bars.forEach((b, i) => {
    const x = 28 + i * 84;
    const maxH = 100;
    const iH = Math.round((b.income / 120) * maxH);
    const sH = Math.round((b.spend / 120) * maxH);
    // Income bar
    elements.push(box(`bar-i-${i}`, x, 360 - iH, 30, iH, { bg: p.accent2, radius: 6, border: 0 }));
    // Spend bar
    elements.push(box(`bar-s-${i}`, x + 36, 360 - sH, 30, sH, { bg: p.accent, radius: 6, border: 0, opacity: 0.7 }));
    elements.push(text(`bar-lbl-${i}`, b.label, x, 366, 66, 16, { size: 11, color: p.textSub, align: 'center' }));
  });

  // Legend
  elements.push(circle('leg-i-dot', 32, 394, 5, { bg: p.accent2, border: 0 }));
  elements.push(text('leg-i', 'Income', 42, 388, 60, 16, { size: 11, color: p.textSub }));
  elements.push(circle('leg-s-dot', 114, 394, 5, { bg: p.accent, border: 0 }));
  elements.push(text('leg-s', 'Spending', 124, 388, 70, 16, { size: 11, color: p.textSub }));

  // Category breakdown
  elements.push(text('cat-title', 'Top Categories', 20, 420, 240, 18, { size: 13, weight: '700', color: p.text }));
  const cats = [
    { name: 'Housing',   pct: 42, val: '$2,200', color: p.accent  },
    { name: 'Food',      pct: 18, val: '$940',   color: p.accentY },
    { name: 'Transport', pct: 12, val: '$626',   color: p.accent2 },
    { name: 'Health',    pct: 9,  val: '$469',   color: '#A78BFA' },
    { name: 'Other',     pct: 19, val: '$975',   color: p.textSub },
  ];
  cats.forEach((c, i) => {
    const y = 446 + i * 52;
    elements.push(text(`cat-name-${i}`, c.name, 20, y, 120, 18, { size: 13, weight: '500', color: p.text }));
    elements.push(text(`cat-val-${i}`, c.val, 280, y, 90, 18, { size: 13, weight: '600', color: p.text, align: 'right' }));
    // Progress bar track
    elements.push(box(`cat-track-${i}`, 20, y + 22, 350, 6, { bg: p.surface, radius: 3, border: 0 }));
    // Progress bar fill
    elements.push(box(`cat-fill-${i}`, 20, y + 22, Math.round(350 * c.pct / 100), 6, { bg: c.color, radius: 3, border: 0 }));
  });

  // Bottom nav
  elements.push(box('nav-bg', 0, 762, 390, 82, { bg: p.bg2, radius: 0, border: 1, borderColor: p.borderD }));
  const navItems = [
    { icon: '◈', label: 'Overview', active: false },
    { icon: '◉', label: 'Spending', active: true  },
    { icon: '◎', label: 'Goals',    active: false },
    { icon: '⊙', label: 'Profile',  active: false },
  ];
  navItems.forEach((n, i) => {
    const x = 20 + i * 88;
    const col = n.active ? p.accent : p.textSub;
    elements.push(text(`nav-icon-${i}`, n.icon, x + 20, 774, 48, 22, { size: 22, color: col, align: 'center' }));
    elements.push(text(`nav-lbl-${i}`, n.label, x + 4, 798, 80, 16, { size: 10, weight: n.active ? '700' : '400', color: col, align: 'center' }));
  });
  elements.push(circle('nav-dot', 152, 770, 3, { bg: p.accent, border: 0 }));

  return { id: 'cash-flow', label: 'Cash Flow', backgroundColor: p.bg, elements };
}

// ─── SCREEN 3: SPENDING BREAKDOWN ─────────────────────────────────────────
function screenSpending() {
  const elements = [];

  elements.push(box('bg', 0, 0, 390, 844, { bg: p.bg, radius: 0, border: 0 }));
  elements.push(box('glow-c', -60, 200, 280, 280, {
    bg: 'rgba(124,111,247,0.10)', radius: 140, border: 0,
    shadow: true, shadowColor: 'rgba(124,111,247,0.14)', shadowBlur: 90, shadowY: 0,
  }));

  elements.push(text('time', '9:41', 16, 14, 60, 20, { size: 15, weight: '600', color: p.text }));
  elements.push(text('title', 'Spending', 20, 48, 200, 28, { size: 22, weight: '800', color: p.text, tracking: -0.5 }));
  elements.push(text('sub', 'March · $5,210 total', 20, 80, 220, 18, { size: 13, color: p.textSub }));

  // Big ring chart (geometric approximation with concentric boxes)
  const cx = 195, cy = 220, rO = 88, rI = 54;
  elements.push(circle('ring-outer', cx, cy, rO, { bg: 'rgba(124,111,247,0.18)', border: 0 }));
  elements.push(circle('ring-inner', cx, cy, rI, { bg: p.bg, border: 0 }));
  // Ring segments approximated with overlapping colored arcs (boxes at angles)
  const segments = [
    { color: p.accent,  label: 'Housing', pct: '42%', w: 60, x: cx + 40, y: cy - 70 },
    { color: p.accentY, label: 'Food',    pct: '18%', w: 36, x: cx + 80, y: cy + 10 },
    { color: p.accent2, label: 'Transport',pct: '12%',w: 28, x: cx + 30, y: cy + 70 },
    { color: '#A78BFA', label: 'Health',  pct: '9%',  w: 22, x: cx - 50, y: cy + 60 },
    { color: p.textSub, label: 'Other',   pct: '19%', w: 42, x: cx - 90, y: cy - 10 },
  ];
  segments.forEach((s, i) => {
    const angle = (i / segments.length) * Math.PI * 2 - Math.PI / 2;
    const r = (rO + rI) / 2;
    const dotX = cx + Math.cos(angle) * r;
    const dotY = cy + Math.sin(angle) * r;
    elements.push(circle(`seg-dot-${i}`, dotX, dotY, 10, { bg: s.color, border: 0 }));
  });
  // Center label
  elements.push(text('ring-lbl', '$5,210', cx - 50, cy - 18, 100, 24, { size: 18, weight: '800', color: p.text, align: 'center' }));
  elements.push(text('ring-sub', 'total', cx - 30, cy + 8, 60, 16, { size: 11, color: p.textSub, align: 'center' }));

  // Category cards grid
  segments.forEach((s, i) => {
    const col = i % 2 === 0 ? 16 : 204;
    const row = Math.floor(i / 2);
    const y = 328 + row * 80;
    const w = i === 4 ? 358 : 170;
    const x = i === 4 ? 16 : col;
    elements.push(box(`cat-card-${i}`, x, y, w, 68, {
      bg: p.surfaceGl, radius: 14, border: 1, borderColor: p.borderD,
    }));
    elements.push(circle(`cat-dot-${i}`, x + 24, y + 26, 8, { bg: s.color, border: 0 }));
    elements.push(text(`cat-name-${i}`, s.label, x + 38, y + 14, w - 50, 16, { size: 12, weight: '600', color: p.text }));
    elements.push(text(`cat-pct-${i}`, s.pct, x + 38, y + 32, w - 50, 14, { size: 11, color: s.color, weight: '700' }));
    elements.push(text(`cat-trend-${i}`, i % 2 === 0 ? '↑ +3%' : '↓ –5%', x + 38, y + 48, w - 50, 14, {
      size: 10, color: i % 2 === 0 ? p.accentR : p.accent2,
    }));
  });

  // Bottom nav
  elements.push(box('nav-bg', 0, 762, 390, 82, { bg: p.bg2, radius: 0, border: 1, borderColor: p.borderD }));
  const navItems = [
    { icon: '◈', label: 'Overview', active: false },
    { icon: '◉', label: 'Spending', active: true  },
    { icon: '◎', label: 'Goals',    active: false },
    { icon: '⊙', label: 'Profile',  active: false },
  ];
  navItems.forEach((n, i) => {
    const x = 20 + i * 88;
    const col = n.active ? p.accent : p.textSub;
    elements.push(text(`nav-icon-${i}`, n.icon, x + 20, 774, 48, 22, { size: 22, color: col, align: 'center' }));
    elements.push(text(`nav-lbl-${i}`, n.label, x + 4, 798, 80, 16, { size: 10, weight: n.active ? '700' : '400', color: col, align: 'center' }));
  });
  elements.push(circle('nav-dot', 152, 770, 3, { bg: p.accent, border: 0 }));

  return { id: 'spending', label: 'Spending', backgroundColor: p.bg, elements };
}

// ─── SCREEN 4: GOALS ──────────────────────────────────────────────────────
function screenGoals() {
  const elements = [];

  elements.push(box('bg', 0, 0, 390, 844, { bg: p.bg, radius: 0, border: 0 }));
  elements.push(box('glow-g', 60, -40, 260, 260, {
    bg: 'rgba(251,191,36,0.07)', radius: 130, border: 0,
    shadow: true, shadowColor: 'rgba(251,191,36,0.10)', shadowBlur: 80, shadowY: 0,
  }));

  elements.push(text('time', '9:41', 16, 14, 60, 20, { size: 15, weight: '600', color: p.text }));
  elements.push(text('title', 'Goals', 20, 48, 200, 28, { size: 22, weight: '800', color: p.text, tracking: -0.5 }));
  elements.push(text('sub', '3 active · 1 completed', 20, 80, 220, 18, { size: 13, color: p.textSub }));

  // Add goal FAB
  elements.push(box('fab', 330, 46, 44, 44, {
    bg: p.accent, radius: 22, border: 0,
    shadow: true, shadowColor: p.glow, shadowBlur: 20, shadowY: 6,
  }));
  elements.push(text('fab-plus', '+', 330, 52, 44, 32, { size: 22, weight: '300', color: p.text, align: 'center' }));

  const goals = [
    {
      name: 'Emergency Fund',
      icon: '🛡',
      target: '$20,000',
      saved: '$14,200',
      pct: 71,
      color: p.accent2,
      months: '4 months left',
    },
    {
      name: 'Japan Trip',
      icon: '✈️',
      target: '$8,000',
      saved: '$3,640',
      pct: 46,
      color: p.accent,
      months: '8 months left',
    },
    {
      name: 'MacBook Pro',
      icon: '💻',
      target: '$3,500',
      saved: '$2,100',
      pct: 60,
      color: p.accentY,
      months: '3 months left',
    },
    {
      name: 'Index Fund Top-up',
      icon: '📈',
      target: '$5,000',
      saved: '$5,000',
      pct: 100,
      color: p.accent2,
      months: 'Completed ✓',
      done: true,
    },
  ];

  goals.forEach((g, i) => {
    const y = 110 + i * 152;
    const isActive = !g.done;
    elements.push(box(`goal-card-${i}`, 16, y, 358, 136, {
      bg: g.done ? 'rgba(52,211,153,0.05)' : p.surfaceGl,
      radius: 20, border: 1,
      borderColor: g.done ? 'rgba(52,211,153,0.30)' : p.borderD,
      shadow: isActive,
      shadowColor: `${g.color}40`,
      shadowBlur: 16, shadowY: 4,
    }));
    elements.push(text(`goal-icon-${i}`, g.icon, 28, y + 16, 36, 36, { size: 26, align: 'center' }));
    elements.push(text(`goal-name-${i}`, g.name, 72, y + 18, 190, 20, { size: 15, weight: '700', color: p.text }));
    elements.push(text(`goal-months-${i}`, g.months, 72, y + 40, 200, 16, { size: 11, color: g.done ? p.accent2 : p.textSub }));
    elements.push(text(`goal-saved-${i}`, g.saved, 264, y + 18, 78, 20, { size: 14, weight: '700', color: g.color, align: 'right' }));
    elements.push(text(`goal-target-${i}`, `of ${g.target}`, 264, y + 40, 78, 16, { size: 10, color: p.textSub, align: 'right' }));
    // Progress track
    elements.push(box(`goal-track-${i}`, 28, y + 70, 326, 8, { bg: p.surface, radius: 4, border: 0 }));
    elements.push(box(`goal-fill-${i}`, 28, y + 70, Math.round(326 * g.pct / 100), 8, { bg: g.color, radius: 4, border: 0 }));
    // Pct label
    elements.push(text(`goal-pct-${i}`, `${g.pct}%`, 28, y + 86, 326, 16, {
      size: 11, weight: '600', color: g.color,
    }));
    // Monthly auto-save
    if (!g.done) {
      elements.push(text(`goal-auto-${i}`, `Auto-saving $${Math.round(parseInt(g.target.replace(/\D/g,'')) / 24)} / mo`, 28, y + 104, 250, 16, {
        size: 11, color: p.textSub,
      }));
    }
  });

  // Bottom nav
  elements.push(box('nav-bg', 0, 762, 390, 82, { bg: p.bg2, radius: 0, border: 1, borderColor: p.borderD }));
  const navItems = [
    { icon: '◈', label: 'Overview', active: false },
    { icon: '◉', label: 'Spending', active: false },
    { icon: '◎', label: 'Goals',    active: true  },
    { icon: '⊙', label: 'Profile',  active: false },
  ];
  navItems.forEach((n, i) => {
    const x = 20 + i * 88;
    const col = n.active ? p.accent : p.textSub;
    elements.push(text(`nav-icon-${i}`, n.icon, x + 20, 774, 48, 22, { size: 22, color: col, align: 'center' }));
    elements.push(text(`nav-lbl-${i}`, n.label, x + 4, 798, 80, 16, { size: 10, weight: n.active ? '700' : '400', color: col, align: 'center' }));
  });
  elements.push(circle('nav-dot', 240, 770, 3, { bg: p.accent, border: 0 }));

  return { id: 'goals', label: 'Goals', backgroundColor: p.bg, elements };
}

// ─── SCREEN 5: AI INSIGHTS ────────────────────────────────────────────────
function screenInsights() {
  const elements = [];

  elements.push(box('bg', 0, 0, 390, 844, { bg: p.bg, radius: 0, border: 0 }));
  // Iridescent glow - violet + emerald blend
  elements.push(box('glow-v', 80, 40, 300, 300, {
    bg: 'rgba(124,111,247,0.10)', radius: 150, border: 0,
    shadow: true, shadowColor: 'rgba(124,111,247,0.15)', shadowBlur: 100, shadowY: 0,
  }));
  elements.push(box('glow-e', 180, 160, 200, 200, {
    bg: 'rgba(52,211,153,0.08)', radius: 100, border: 0,
  }));

  elements.push(text('time', '9:41', 16, 14, 60, 20, { size: 15, weight: '600', color: p.text }));
  elements.push(text('title', 'AI Insights', 20, 48, 220, 28, { size: 22, weight: '800', color: p.text, tracking: -0.5 }));
  elements.push(text('sub', 'Personalised by Fathom Intelligence', 20, 80, 280, 18, { size: 11, color: p.textSub }));

  // AI Badge
  elements.push(box('ai-badge', 16, 110, 358, 56, {
    bg: 'rgba(124,111,247,0.12)', radius: 16, border: 1, borderColor: 'rgba(124,111,247,0.35)',
    shadow: true, shadowColor: 'rgba(124,111,247,0.25)', shadowBlur: 24, shadowY: 6,
  }));
  elements.push(text('ai-icon', '⚡', 28, 122, 28, 28, { size: 20 }));
  elements.push(text('ai-msg', 'You\'re on track to save $340 more than last month', 60, 122, 286, 20, { size: 12, weight: '600', color: p.text }));
  elements.push(text('ai-tag', 'FATHOM AI', 60, 144, 120, 14, { size: 9, weight: '700', color: p.accent, tracking: 2 }));

  // Insight cards
  const insights = [
    {
      type: 'Warning',
      icon: '⚠️',
      color: p.accentY,
      title: 'Subscription creep detected',
      body: 'You\'re paying for 11 subscriptions totalling $284/mo. 3 haven\'t been used in 60+ days.',
      action: 'Review subscriptions',
    },
    {
      type: 'Opportunity',
      icon: '💡',
      color: p.accent2,
      title: 'High-yield savings gap',
      body: 'Moving $8,000 from your checking account to a HYSA at 4.8% APY would earn ~$384/year more.',
      action: 'Explore options',
    },
    {
      type: 'Pattern',
      icon: '📊',
      color: p.accent,
      title: 'Weekend spending spike',
      body: 'You spend 38% more on Saturdays vs weekdays. Most of this goes to dining and entertainment.',
      action: 'Set weekend budget',
    },
  ];

  insights.forEach((ins, i) => {
    const y = 178 + i * 172;
    elements.push(box(`ins-card-${i}`, 16, y, 358, 156, {
      bg: p.surfaceGl, radius: 20, border: 1, borderColor: p.borderD,
    }));
    // Type badge
    elements.push(box(`ins-badge-${i}`, 28, y + 16, 80, 22, { bg: `${ins.color}20`, radius: 11, border: 0 }));
    elements.push(text(`ins-type-${i}`, ins.type.toUpperCase(), 28, y + 20, 80, 14, {
      size: 9, weight: '700', color: ins.color, align: 'center', tracking: 1,
    }));
    elements.push(text(`ins-icon-${i}`, ins.icon, 320, y + 12, 28, 28, { size: 20, align: 'center' }));
    elements.push(text(`ins-title-${i}`, ins.title, 28, y + 44, 318, 20, { size: 14, weight: '700', color: p.text }));
    elements.push(text(`ins-body-${i}`, ins.body, 28, y + 68, 322, 44, {
      size: 12, color: p.textSub, leading: 1.5,
    }));
    // Action link
    elements.push(text(`ins-action-${i}`, `${ins.action} →`, 28, y + 120, 200, 20, {
      size: 12, weight: '600', color: ins.color,
    }));
  });

  // Bottom nav
  elements.push(box('nav-bg', 0, 762, 390, 82, { bg: p.bg2, radius: 0, border: 1, borderColor: p.borderD }));
  const navItems = [
    { icon: '◈', label: 'Overview', active: false },
    { icon: '◉', label: 'Spending', active: false },
    { icon: '◎', label: 'Goals',    active: false },
    { icon: '⊙', label: 'Profile',  active: false },
  ];
  navItems.forEach((n, i) => {
    const x = 20 + i * 88;
    const col = n.active ? p.accent : p.textSub;
    elements.push(text(`nav-icon-${i}`, n.icon, x + 20, 774, 48, 22, { size: 22, color: col, align: 'center' }));
    elements.push(text(`nav-lbl-${i}`, n.label, x + 4, 798, 80, 16, { size: 10, weight: n.active ? '700' : '400', color: col, align: 'center' }));
  });

  return { id: 'insights', label: 'AI Insights', backgroundColor: p.bg, elements };
}

// ─── SCREEN 6: BILLS & SUBSCRIPTIONS ──────────────────────────────────────
function screenBills() {
  const elements = [];

  elements.push(box('bg', 0, 0, 390, 844, { bg: p.bg, radius: 0, border: 0 }));
  elements.push(box('glow-b', 200, -50, 250, 250, {
    bg: 'rgba(248,113,113,0.07)', radius: 125, border: 0,
    shadow: true, shadowColor: 'rgba(248,113,113,0.10)', shadowBlur: 80, shadowY: 0,
  }));

  elements.push(text('time', '9:41', 16, 14, 60, 20, { size: 15, weight: '600', color: p.text }));
  elements.push(text('title', 'Bills & Subs', 20, 48, 220, 28, { size: 22, weight: '800', color: p.text, tracking: -0.5 }));
  elements.push(text('sub', 'April 2026 · $284 / month', 20, 80, 240, 18, { size: 13, color: p.textSub }));

  // Upcoming strip
  elements.push(box('upcoming-bg', 16, 110, 358, 52, {
    bg: 'rgba(248,113,113,0.10)', radius: 14, border: 1, borderColor: 'rgba(248,113,113,0.25)',
  }));
  elements.push(text('upcoming-icon', '🔔', 26, 124, 24, 24, { size: 18 }));
  elements.push(text('upcoming-txt', '3 bills due in the next 7 days  →', 54, 124, 300, 20, {
    size: 13, weight: '600', color: p.accentR,
  }));

  // Bills list
  const bills = [
    { name: 'Rent',          icon: '🏠', amt: '$2,200', due: 'Apr 1',  tag: 'AUTO',  color: p.accentR, freq: 'Monthly' },
    { name: 'Netflix',       icon: '🎬', amt: '$22.99', due: 'Apr 5',  tag: 'AUTO',  color: p.accent,  freq: 'Monthly' },
    { name: 'Spotify',       icon: '🎵', amt: '$11.99', due: 'Apr 7',  tag: 'AUTO',  color: p.accent2, freq: 'Monthly' },
    { name: 'iCloud 200GB',  icon: '☁️', amt: '$2.99',  due: 'Apr 14', tag: 'AUTO',  color: p.accentY, freq: 'Monthly' },
    { name: 'Adobe CC',      icon: '🎨', amt: '$54.99', due: 'Apr 22', tag: 'UNUSED',color: p.textSub, freq: 'Monthly' },
    { name: 'Gym',           icon: '💪', amt: '$49.99', due: 'Apr 28', tag: 'UNUSED',color: p.textSub, freq: 'Monthly' },
  ];
  bills.forEach((b, i) => {
    const y = 172 + i * 92;
    elements.push(box(`bill-card-${i}`, 16, y, 358, 80, {
      bg: p.surfaceGl, radius: 16, border: 1,
      borderColor: b.tag === 'UNUSED' ? 'rgba(248,113,113,0.20)' : p.borderD,
      opacity: b.tag === 'UNUSED' ? 0.8 : 1,
    }));
    elements.push(text(`bill-icon-${i}`, b.icon, 28, y + 20, 32, 32, { size: 24, align: 'center' }));
    elements.push(text(`bill-name-${i}`, b.name, 68, y + 16, 180, 20, { size: 14, weight: '600', color: p.text }));
    elements.push(text(`bill-due-${i}`, `Due ${b.due}`, 68, y + 38, 130, 16, { size: 11, color: p.textSub }));
    // Tag
    const tagColor = b.tag === 'UNUSED' ? p.accentR : p.accent2;
    elements.push(box(`bill-tag-bg-${i}`, 196, y + 36, b.tag === 'UNUSED' ? 56 : 38, 20, {
      bg: `${tagColor}20`, radius: 10, border: 0,
    }));
    elements.push(text(`bill-tag-${i}`, b.tag, 196, y + 39, b.tag === 'UNUSED' ? 56 : 38, 14, {
      size: 8, weight: '700', color: tagColor, align: 'center', tracking: 1,
    }));
    elements.push(text(`bill-amt-${i}`, b.amt, 264, y + 24, 78, 20, { size: 14, weight: '700', color: p.text, align: 'right' }));
  });

  // Bottom nav
  elements.push(box('nav-bg', 0, 762, 390, 82, { bg: p.bg2, radius: 0, border: 1, borderColor: p.borderD }));
  const navItems = [
    { icon: '◈', label: 'Overview', active: false },
    { icon: '◉', label: 'Spending', active: false },
    { icon: '◎', label: 'Goals',    active: false },
    { icon: '⊙', label: 'Profile',  active: false },
  ];
  navItems.forEach((n, i) => {
    const x = 20 + i * 88;
    const col = n.active ? p.accent : p.textSub;
    elements.push(text(`nav-icon-${i}`, n.icon, x + 20, 774, 48, 22, { size: 22, color: col, align: 'center' }));
    elements.push(text(`nav-lbl-${i}`, n.label, x + 4, 798, 80, 16, { size: 10, weight: n.active ? '700' : '400', color: col, align: 'center' }));
  });

  return { id: 'bills', label: 'Bills', backgroundColor: p.bg, elements };
}

// ─── ASSEMBLE & WRITE .PEN ────────────────────────────────────────────────
const pen = {
  version: VERSION,
  name: APP_NAME,
  description: 'Personal finance clarity with dark glass morphism UI',
  screens: [
    screenNetWorth(),
    screenCashFlow(),
    screenSpending(),
    screenGoals(),
    screenInsights(),
    screenBills(),
  ],
};

fs.writeFileSync('fathom.pen', JSON.stringify(pen, null, 2));
console.log('✓ fathom.pen written —', pen.screens.length, 'screens');
console.log('  Palette: Deep void navy + violet + emerald (DARK)');
console.log('  Inspiration: Fluid Glass (Awwwards) + Midday (Dark Mode Design)');
