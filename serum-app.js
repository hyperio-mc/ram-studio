// SERUM — AI Personal Skin Intelligence
// Inspired by: Overlay (lapa.ninja) — "The Future of Beauty is Automated" — soft gradient
//              light bg, facial AR tracking, beauty-tech minimal aesthetic
//              Superpower (godly.website) — health intelligence, editorial biomarker design
// Light parchment theme: #FAF7F4 bg, #C46B5A terracotta, #7B9B77 sage green
// Pencil.dev v2.8 format

const fs   = require('fs');
const path = require('path');

const BG       = '#FAF7F4';   // warm parchment
const SURFACE  = '#FFFFFF';
const SURFACE2 = '#F5F0EB';   // light blush
const TEXT     = '#1A1612';
const MUTED    = '#9A8F87';
const ACCENT   = '#C46B5A';   // terracotta rose
const ACCENT2  = '#7B9B77';   // sage green (good metrics)
const WARN     = '#C09445';   // amber (caution)
const DIM      = '#EAE3DC';
const ROSE     = '#E8C4BD';   // light rose for fills

function rect(x, y, w, h, fill, opts = {}) {
  return { type: 'rect', x, y, width: w, height: h, fill, radius: opts.radius ?? 0, opacity: opts.opacity ?? 1 };
}
function text(content, x, y, opts = {}) {
  return {
    type: 'text', content, x, y,
    fontSize: opts.size ?? 14,
    fontWeight: opts.weight ?? 'regular',
    color: opts.color ?? TEXT,
    align: opts.align ?? 'left',
    fontFamily: opts.font ?? 'Inter',
    opacity: opts.opacity ?? 1,
  };
}
function line(x1, y1, x2, y2, color = DIM, width = 1) {
  return { type: 'line', x1, y1, x2, y2, stroke: color, strokeWidth: width };
}
function circle(cx, cy, r, fill, opts = {}) {
  return { type: 'circle', cx, cy, r, fill, opacity: opts.opacity ?? 1 };
}

// ─── SCREEN 1: SCAN ──────────────────────────────────────────────────────────
function screenScan() {
  const els = [];
  const W = 390, H = 844;

  els.push(rect(0, 0, W, H, BG));
  // Soft warm gradient blob behind face
  els.push({ type: 'ellipse', cx: 195, cy: 340, rx: 180, ry: 200, fill: ROSE,    opacity: 0.35 });
  els.push({ type: 'ellipse', cx: 130, cy: 280, rx: 100, ry: 80,  fill: '#F0E8D0', opacity: 0.4 });

  // Status bar
  els.push(text('9:41', 20, 16, { size: 13, weight: 'semibold', color: TEXT }));
  els.push(text('●●●  WiFi  🔋', 280, 16, { size: 11, color: MUTED }));

  // Header
  els.push(text('SERUM', 20, 52, { size: 17, weight: 'bold', color: TEXT }));
  els.push(text('Sat, Apr 4', 20, 72, { size: 11, color: MUTED }));
  // Profile circle
  els.push(circle(358, 56, 18, SURFACE2));
  els.push(text('A', 358, 60, { size: 13, weight: 'bold', color: ACCENT, align: 'center' }));

  // Face silhouette (oval) — the scan area
  els.push({ type: 'ellipse', cx: 195, cy: 310, rx: 95, ry: 115, fill: SURFACE2, opacity: 0.7 });
  els.push({ type: 'ellipse', cx: 195, cy: 310, rx: 95, ry: 115, fill: 'none',
    // Stroke via thin ring
  });
  // Face outline ring
  els.push({ type: 'ellipse', cx: 195, cy: 310, rx: 96, ry: 116, fill: DIM, opacity: 0.6 });
  els.push({ type: 'ellipse', cx: 195, cy: 310, rx: 94, ry: 114, fill: SURFACE2, opacity: 0.7 });

  // AR tracking dots — scattered around face zone
  const trackDots = [
    // cheeks, forehead, chin, nose, eye areas
    { cx: 140, cy: 268, active: true },
    { cx: 250, cy: 268, active: true },
    { cx: 195, cy: 234, active: false },
    { cx: 160, cy: 312, active: true },
    { cx: 232, cy: 312, active: true },
    { cx: 195, cy: 360, active: true },
    { cx: 178, cy: 290, active: false },
    { cx: 214, cy: 290, active: false },
    { cx: 195, cy: 346, active: false },
    { cx: 130, cy: 300, active: true },
    { cx: 260, cy: 300, active: true },
  ];
  // Scanning frame lines (corner brackets)
  const scanInset = 88;
  els.push(line(scanInset, 170, scanInset + 24, 170, ACCENT, 1.5));
  els.push(line(scanInset, 170, scanInset, 194, ACCENT, 1.5));
  els.push(line(W - scanInset, 170, W - scanInset - 24, 170, ACCENT, 1.5));
  els.push(line(W - scanInset, 170, W - scanInset, 194, ACCENT, 1.5));
  els.push(line(scanInset, 450, scanInset + 24, 450, ACCENT, 1.5));
  els.push(line(scanInset, 450, scanInset, 426, ACCENT, 1.5));
  els.push(line(W - scanInset, 450, W - scanInset - 24, 450, ACCENT, 1.5));
  els.push(line(W - scanInset, 450, W - scanInset, 426, ACCENT, 1.5));

  trackDots.forEach(d => {
    if (d.active) {
      els.push(circle(d.cx, d.cy, 5, ACCENT, { opacity: 0.15 }));
      els.push(circle(d.cx, d.cy, 2.5, ACCENT));
    } else {
      els.push(circle(d.cx, d.cy, 2, DIM));
    }
  });
  // Cross-lines between key dots (analysis lines)
  els.push(line(140, 268, 195, 234, ACCENT, 0.5));
  els.push(line(250, 268, 195, 234, ACCENT, 0.5));
  els.push(line(130, 300, 160, 312, ACCENT, 0.5));
  els.push(line(260, 300, 232, 312, ACCENT, 0.5));

  // Skin score ring
  els.push(circle(195, 310, 30, SURFACE));
  els.push(text('74', 195, 315, { size: 18, weight: 'bold', color: ACCENT, align: 'center' }));
  els.push(text('/100', 195, 330, { size: 8, color: MUTED, align: 'center' }));

  // Status line
  els.push(text('Scan complete · 2 hours ago', 195, 474, { size: 11, color: MUTED, align: 'center' }));

  // Quick metric chips
  const chips = [
    { label: 'Hydration', val: '68%',  c: WARN },
    { label: 'Clarity',   val: '82%',  c: ACCENT2 },
    { label: 'UV',        val: 'Low',  c: ACCENT2 },
  ];
  let cx = 20;
  chips.forEach(ch => {
    const w = 108;
    els.push(rect(cx, 490, w, 48, SURFACE, { radius: 10 }));
    els.push(rect(cx, 490, w, 2, ch.c, { radius: 2 }));
    els.push(text(ch.label, cx + w/2, 510, { size: 9, color: MUTED, align: 'center' }));
    els.push(text(ch.val, cx + w/2, 528, { size: 16, weight: 'bold', color: ch.c, align: 'center' }));
    cx += w + 11;
  });

  // AI nudge
  els.push(rect(20, 554, 350, 52, 'rgba(196,107,90,0.06)', { radius: 10 }));
  els.push(rect(20, 554, 3, 52, ACCENT, { radius: 2 }));
  els.push(text('AI: Your hydration has dropped 8% this week.', 32, 572, { size: 12, color: TEXT }));
  els.push(text('Increase water intake and layer a hyaluronic serum.', 32, 590, { size: 11, color: MUTED }));

  // CTA
  els.push(rect(20, 622, 350, 48, ACCENT, { radius: 12 }));
  els.push(text('Scan Now', 195, 650, { size: 15, weight: 'bold', color: '#FFFFFF', align: 'center' }));

  // Bottom nav
  els.push(rect(0, 756, W, 88, SURFACE));
  els.push(line(0, 756, W, 756, DIM));
  const nav = ['⊙ Scan', '◫ Dashboard', '◈ Analysis', '◻ Routine', '∿ Progress'];
  nav.forEach((item, i) => {
    const nx = 39 + i * 78;
    const active = i === 0;
    els.push(text(item, nx, 800, { size: 11, weight: active ? 'semibold' : 'regular', color: active ? ACCENT : MUTED, align: 'center' }));
    if (active) els.push(rect(nx - 22, 756, 44, 2, ACCENT));
  });
  els.push(rect(155, 833, 80, 4, 'rgba(26,22,18,0.15)', { radius: 2 }));

  return { id: 'screen-1', name: 'Scan', width: W, height: H, backgroundColor: BG, elements: els };
}

// ─── SCREEN 2: DASHBOARD ─────────────────────────────────────────────────────
function screenDashboard() {
  const els = [];
  const W = 390, H = 844;

  els.push(rect(0, 0, W, H, BG));
  els.push(text('9:41', 20, 16, { size: 13, weight: 'semibold', color: TEXT }));
  els.push(text('Your Skin Today', 20, 56, { size: 20, weight: 'bold', color: TEXT }));
  els.push(text('Saturday, April 4', 20, 78, { size: 12, color: MUTED }));

  // Overall score card
  els.push(rect(20, 96, 350, 80, SURFACE, { radius: 14 }));
  els.push(rect(20, 96, 3, 80, ACCENT, { radius: 2 }));
  // Score ring visual
  els.push(circle(58, 136, 28, SURFACE2));
  els.push(text('74', 58, 140, { size: 16, weight: 'bold', color: ACCENT, align: 'center' }));
  els.push(text('/100', 58, 152, { size: 8, color: MUTED, align: 'center' }));
  els.push(text('Skin Score', 96, 120, { size: 11, weight: 'semibold', color: TEXT }));
  els.push(text('Good — 3 points up from yesterday', 96, 140, { size: 11, color: MUTED }));
  // Mini trend bars
  const bars = [52,58,61,58,66,68,74];
  bars.forEach((v, i) => {
    const bh = v * 0.25;
    els.push(rect(284 + i * 12, 168 - bh, 8, bh, i === 6 ? ACCENT : DIM, { radius: 2 }));
  });

  // 4 metric tiles in 2x2
  const metrics = [
    { label: 'Hydration',  val: '68%', status: 'Needs attention', c: WARN,   icon: '💧' },
    { label: 'Elasticity', val: '74%', status: 'Good',             c: ACCENT2, icon: '✦' },
    { label: 'Pore Clarity',val: '82%',status: 'Excellent',        c: ACCENT2, icon: '◉' },
    { label: 'UV Exposure', val: 'Low', status: 'Protected',       c: ACCENT2, icon: '☀' },
  ];
  metrics.forEach((m, i) => {
    const mx = 20 + (i % 2) * 184;
    const my = 196 + Math.floor(i / 2) * 120;
    els.push(rect(mx, my, 172, 108, SURFACE, { radius: 12 }));
    els.push(rect(mx, my, 172, 3, m.c, { radius: 2 }));
    els.push(text(m.icon, mx + 16, my + 24, { size: 16 }));
    els.push(text(m.label, mx + 14, my + 44, { size: 10, weight: 'bold', color: MUTED }));
    els.push(text(m.val, mx + 14, my + 68, { size: 24, weight: 'bold', color: m.c }));
    els.push(text(m.status, mx + 14, my + 90, { size: 10, color: MUTED }));
  });

  // 7-day skin score chart
  els.push(text('7-DAY TREND', 20, 454, { size: 10, weight: 'bold', color: MUTED }));
  els.push(rect(20, 468, 350, 110, SURFACE, { radius: 12 }));

  // Chart grid lines
  [0, 1, 2, 3].forEach(i => {
    els.push(line(44, 484 + i * 24, 356, 484 + i * 24, DIM, 0.5));
    const label = String(80 - i * 10);
    els.push(text(label, 36, 488 + i * 24, { size: 8, color: MUTED, align: 'right' }));
  });

  // Score points: Mon-Sun (55, 61, 58, 63, 68, 71, 74)
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const scores = [55, 61, 58, 63, 68, 71, 74];
  const chartX = (i) => 60 + i * 44;
  const chartY = (v) => 556 - (v - 50) * 1.5;

  // Line connecting points
  for (let i = 0; i < scores.length - 1; i++) {
    els.push(line(chartX(i), chartY(scores[i]), chartX(i+1), chartY(scores[i+1]), ACCENT, 1.5));
  }
  scores.forEach((v, i) => {
    els.push(circle(chartX(i), chartY(v), i === 6 ? 5 : 3, i === 6 ? ACCENT : DIM));
    els.push(text(days[i], chartX(i), 568, { size: 9, color: MUTED, align: 'center' }));
  });

  // Today's highlight label
  els.push(rect(chartX(6) - 14, chartY(74) - 26, 30, 18, ACCENT, { radius: 4 }));
  els.push(text('74', chartX(6), chartY(74) - 14, { size: 9, weight: 'bold', color: '#FFF', align: 'center' }));

  // AI tip card
  els.push(rect(20, 596, 350, 52, 'rgba(123,155,119,0.08)', { radius: 10 }));
  els.push(rect(20, 596, 3, 52, ACCENT2, { radius: 2 }));
  els.push(text('AI: Hydration is your focus today.', 32, 614, { size: 12, color: TEXT, weight: 'medium' }));
  els.push(text('Use your hyaluronic serum before moisturiser this AM.', 32, 632, { size: 11, color: MUTED }));

  // Bottom nav
  els.push(rect(0, 756, W, 88, SURFACE));
  els.push(line(0, 756, W, 756, DIM));
  ['⊙ Scan', '◫ Dashboard', '◈ Analysis', '◻ Routine', '∿ Progress'].forEach((item, i) => {
    const nx = 39 + i * 78;
    const active = i === 1;
    els.push(text(item, nx, 800, { size: 11, weight: active ? 'semibold' : 'regular', color: active ? ACCENT : MUTED, align: 'center' }));
    if (active) els.push(rect(nx - 22, 756, 44, 2, ACCENT));
  });
  els.push(rect(155, 833, 80, 4, 'rgba(26,22,18,0.15)', { radius: 2 }));

  return { id: 'screen-2', name: 'Dashboard', width: W, height: H, backgroundColor: BG, elements: els };
}

// ─── SCREEN 3: ANALYSIS ──────────────────────────────────────────────────────
function screenAnalysis() {
  const els = [];
  const W = 390, H = 844;

  els.push(rect(0, 0, W, H, BG));
  els.push(text('9:41', 20, 16, { size: 13, weight: 'semibold', color: TEXT }));
  els.push(text('←', 20, 56, { size: 18, color: TEXT }));
  els.push(text('AI Analysis', 195, 56, { size: 16, weight: 'semibold', color: TEXT, align: 'center' }));
  els.push(text('Apr 4, 2026', 334, 56, { size: 11, color: MUTED }));

  // Grade card
  els.push(rect(20, 76, 350, 72, SURFACE, { radius: 14 }));
  els.push(circle(58, 112, 28, SURFACE2));
  els.push(text('B+', 58, 117, { size: 16, weight: 'bold', color: ACCENT, align: 'center' }));
  els.push(text('Skin Grade', 96, 100, { size: 11, weight: 'semibold', color: TEXT }));
  els.push(text('Overall condition is good with 3 active concerns.', 96, 118, { size: 11, color: MUTED }));
  els.push(text('Next full scan recommended in 5 days.', 96, 134, { size: 10, color: MUTED }));

  // Concerns
  els.push(text('CONCERNS', 20, 166, { size: 10, weight: 'bold', color: MUTED }));

  const concerns = [
    {
      title: 'Dehydration Lines',
      severity: 'Moderate', color: WARN,
      cause: 'Low water intake + air conditioning (typical winter pattern)',
      fix: 'Hyaluronic acid serum morning + evening. Drink 8+ glasses water.',
    },
    {
      title: 'Uneven Texture',
      severity: 'Mild', color: '#C09445',
      cause: 'Product buildup around T-zone pores. Normal for your skin type.',
      fix: 'Weekly exfoliant (AHA/BHA). Cleanse AM + PM thoroughly.',
    },
    {
      title: 'Dullness',
      severity: 'Mild', color: ACCENT,
      cause: 'Vitamin C levels in surface cells below optimal range.',
      fix: 'Vitamin C serum in morning routine. SPF daily to prevent further.',
    },
  ];

  concerns.forEach((c, i) => {
    const cy = 182 + i * 146;
    els.push(rect(20, cy, 350, 134, SURFACE, { radius: 12 }));
    // Severity bar top
    const sevW = c.severity === 'Moderate' ? 110 : 70;
    els.push(rect(20, cy, sevW, 3, c.color, { radius: 2 }));
    // Header
    els.push(text(c.title, 34, cy + 20, { size: 14, weight: 'semibold', color: TEXT }));
    // Severity pill
    els.push(rect(34, cy + 32, sevW + 10, 18, `rgba(${c.color === WARN ? '192,148,69' : c.color === ACCENT ? '196,107,90' : '192,148,69'},0.12)`, { radius: 4 }));
    els.push(text(c.severity, 39, cy + 44, { size: 9, weight: 'bold', color: c.color }));
    // Cause
    els.push(text('Cause:', 34, cy + 64, { size: 9, weight: 'bold', color: MUTED }));
    els.push(text(c.cause, 34, cy + 78, { size: 11, color: MUTED }));
    // Fix
    els.push(text('Fix:', 34, cy + 100, { size: 9, weight: 'bold', color: ACCENT2 }));
    els.push(text(c.fix, 34, cy + 114, { size: 11, color: TEXT }));
  });

  // Bottom nav
  els.push(rect(0, 756, W, 88, SURFACE));
  els.push(line(0, 756, W, 756, DIM));
  ['⊙ Scan', '◫ Dashboard', '◈ Analysis', '◻ Routine', '∿ Progress'].forEach((item, i) => {
    const nx = 39 + i * 78;
    const active = i === 2;
    els.push(text(item, nx, 800, { size: 11, weight: active ? 'semibold' : 'regular', color: active ? ACCENT : MUTED, align: 'center' }));
    if (active) els.push(rect(nx - 22, 756, 44, 2, ACCENT));
  });
  els.push(rect(155, 833, 80, 4, 'rgba(26,22,18,0.15)', { radius: 2 }));

  return { id: 'screen-3', name: 'Analysis', width: W, height: H, backgroundColor: BG, elements: els };
}

// ─── SCREEN 4: ROUTINE ───────────────────────────────────────────────────────
function screenRoutine() {
  const els = [];
  const W = 390, H = 844;

  els.push(rect(0, 0, W, H, BG));
  els.push(text('9:41', 20, 16, { size: 13, weight: 'semibold', color: TEXT }));
  els.push(text('Routine', 195, 56, { size: 20, weight: 'bold', color: TEXT, align: 'center' }));
  els.push(text('+ Add product', 326, 56, { size: 12, color: ACCENT }));

  // Morning / Evening toggle
  els.push(rect(20, 76, 350, 38, SURFACE2, { radius: 10 }));
  els.push(rect(20, 76, 175, 38, SURFACE, { radius: 10 }));
  els.push(text('Morning', 107, 99, { size: 13, weight: 'semibold', color: TEXT, align: 'center' }));
  els.push(text('Evening', 283, 99, { size: 13, color: MUTED, align: 'center' }));

  // Streak card
  els.push(rect(20, 126, 350, 52, 'rgba(196,107,90,0.06)', { radius: 10 }));
  els.push(text('🔥', 34, 156, { size: 18 }));
  els.push(text('14-day streak!', 58, 145, { size: 13, weight: 'semibold', color: TEXT }));
  els.push(text("You've kept your routine for 14 days running. Keep going!", 58, 163, { size: 11, color: MUTED }));

  // Routine steps
  els.push(text('MORNING STEPS', 20, 196, { size: 10, weight: 'bold', color: MUTED }));

  const steps = [
    { n: 1, name: 'Cleanser',          brand: 'CeraVe Hydrating Cleanser',    done: true,  ai: null },
    { n: 2, name: 'Toner',             brand: 'Klairs Supple Prep Toner',      done: true,  ai: null },
    { n: 3, name: 'Vitamin C Serum',   brand: 'Paula\'s Choice C15 Super',     done: false, ai: 'Key for dullness concern today' },
    { n: 4, name: 'Moisturiser',       brand: 'Cetaphil Moisturising Cream',   done: false, ai: null },
    { n: 5, name: 'SPF 50+',           brand: 'Altruist Mineral Sunscreen',    done: false, ai: 'UV protection critical — no cloud cover today' },
  ];

  steps.forEach((s, i) => {
    const sy = 212 + i * 86;
    els.push(rect(20, sy, 350, 76, SURFACE, { radius: 12 }));
    // Step number badge
    els.push(circle(44, sy + 24, 14, s.done ? ACCENT2 : SURFACE2));
    els.push(text(s.done ? '✓' : String(s.n), 44, sy + 28, { size: 11, weight: 'bold', color: s.done ? '#FFF' : MUTED, align: 'center' }));
    // Name + brand
    els.push(text(s.name, 66, sy + 16, { size: 13, weight: 'semibold', color: s.done ? MUTED : TEXT }));
    els.push(text(s.brand, 66, sy + 34, { size: 11, color: MUTED }));
    // AI highlight
    if (s.ai) {
      els.push(rect(66, sy + 48, s.ai.length * 6 + 14, 18, 'rgba(196,107,90,0.1)', { radius: 4 }));
      els.push(text('◈ ' + s.ai, 73, sy + 60, { size: 9, color: ACCENT }));
    }
    // Done toggle
    els.push(rect(316, sy + 18, 34, 18, s.done ? 'rgba(123,155,119,0.2)' : DIM, { radius: 9 }));
    els.push(circle(s.done ? 340 : 322, sy + 27, 7, s.done ? ACCENT2 : '#CCC'));
    if (i < steps.length - 1) els.push(line(20, sy + 76, 370, sy + 76, DIM, 0.5));
  });

  // Bottom nav
  els.push(rect(0, 756, W, 88, SURFACE));
  els.push(line(0, 756, W, 756, DIM));
  ['⊙ Scan', '◫ Dashboard', '◈ Analysis', '◻ Routine', '∿ Progress'].forEach((item, i) => {
    const nx = 39 + i * 78;
    const active = i === 3;
    els.push(text(item, nx, 800, { size: 11, weight: active ? 'semibold' : 'regular', color: active ? ACCENT : MUTED, align: 'center' }));
    if (active) els.push(rect(nx - 22, 756, 44, 2, ACCENT));
  });
  els.push(rect(155, 833, 80, 4, 'rgba(26,22,18,0.15)', { radius: 2 }));

  return { id: 'screen-4', name: 'Routine', width: W, height: H, backgroundColor: BG, elements: els };
}

// ─── SCREEN 5: PROGRESS ──────────────────────────────────────────────────────
function screenProgress() {
  const els = [];
  const W = 390, H = 844;

  els.push(rect(0, 0, W, H, BG));
  els.push(text('9:41', 20, 16, { size: 13, weight: 'semibold', color: TEXT }));
  els.push(text('30-Day Progress', 195, 56, { size: 18, weight: 'bold', color: TEXT, align: 'center' }));
  els.push(text('Mar 5 → Apr 4', 195, 76, { size: 11, color: MUTED, align: 'center' }));

  // Score comparison
  els.push(rect(20, 96, 350, 80, SURFACE, { radius: 14 }));
  // Before
  els.push(text('BEFORE', 80, 116, { size: 9, weight: 'bold', color: MUTED, align: 'center' }));
  els.push(circle(80, 150, 26, SURFACE2));
  els.push(text('61', 80, 155, { size: 16, weight: 'bold', color: MUTED, align: 'center' }));
  // Arrow
  els.push(text('→', 195, 154, { size: 22, color: ACCENT2, align: 'center' }));
  // After
  els.push(text('NOW', 306, 116, { size: 9, weight: 'bold', color: MUTED, align: 'center' }));
  els.push(circle(306, 150, 26, 'rgba(123,155,119,0.15)'));
  els.push(text('74', 306, 155, { size: 16, weight: 'bold', color: ACCENT2, align: 'center' }));
  // Label
  els.push(text('+13 points', 195, 164, { size: 10, weight: 'bold', color: ACCENT2, align: 'center' }));

  // 30-day chart
  els.push(text('SKIN SCORE', 20, 196, { size: 10, weight: 'bold', color: MUTED }));
  els.push(rect(20, 210, 350, 130, SURFACE, { radius: 12 }));

  // Grid
  [0,1,2,3].forEach(i => {
    els.push(line(44, 228 + i * 26, 356, 228 + i * 26, DIM, 0.4));
    els.push(text(String(80 - i * 10), 36, 232 + i * 26, { size: 8, color: MUTED, align: 'right' }));
  });

  // Trend line (30 points, simplified as curve via many line segments)
  const trendScores = [61,62,60,63,65,62,66,67,68,65,67,69,70,68,69,71,70,72,71,73,72,73,74,72,73,74,73,74,73,74];
  const ptX = (i) => 48 + i * 10.5;
  const ptY = (v) => 328 - (v - 55) * 2.2;
  for (let i = 0; i < trendScores.length - 1; i++) {
    els.push(line(ptX(i), ptY(trendScores[i]), ptX(i+1), ptY(trendScores[i+1]), ACCENT, 1.5));
  }
  // Start + end dots
  els.push(circle(ptX(0), ptY(61), 4, DIM));
  els.push(circle(ptX(29), ptY(74), 5, ACCENT));

  // Month markers
  els.push(text('Mar 5', ptX(0), 346, { size: 8, color: MUTED, align: 'center' }));
  els.push(text('Mar 20', ptX(15), 346, { size: 8, color: MUTED, align: 'center' }));
  els.push(text('Apr 4', ptX(29), 346, { size: 8, color: MUTED, align: 'center' }));

  // Metric improvements
  els.push(text('IMPROVEMENTS', 20, 366, { size: 10, weight: 'bold', color: MUTED }));
  const improvements = [
    { label: 'Hydration',   from: 56, to: 68, delta: '+12%', c: WARN },
    { label: 'Pore Clarity',from: 64, to: 82, delta: '+18%', c: ACCENT2 },
    { label: 'Elasticity',  from: 68, to: 74, delta: '+6%',  c: ACCENT2 },
    { label: 'Dullness',    from: 72, to: 80, delta: '+8%',  c: ACCENT },
  ];
  improvements.forEach((imp, i) => {
    const iy = 382 + i * 62;
    els.push(rect(20, iy, 350, 52, SURFACE, { radius: 10 }));
    els.push(text(imp.label, 34, iy + 18, { size: 12, weight: 'semibold', color: TEXT }));
    // Progress bar
    els.push(rect(34, iy + 32, 200, 6, DIM, { radius: 3 }));
    els.push(rect(34, iy + 32, 200 * imp.from / 100, 6, DIM, { radius: 3 }));
    els.push(rect(34, iy + 32, 200 * imp.to / 100, 6, imp.c, { radius: 3 }));
    // From/to labels
    els.push(text(`${imp.from}%`, 240, iy + 20, { size: 10, color: MUTED }));
    els.push(text('→', 260, iy + 20, { size: 10, color: MUTED }));
    els.push(text(`${imp.to}%`, 276, iy + 20, { size: 10, color: imp.c }));
    // Delta pill
    els.push(rect(318, iy + 10, 40, 18, `rgba(${imp.c === ACCENT2 ? '123,155,119' : imp.c === WARN ? '192,148,69' : '196,107,90'},0.12)`, { radius: 4 }));
    els.push(text(imp.delta, 338, iy + 23, { size: 10, weight: 'bold', color: imp.c, align: 'center' }));
  });

  // AI summary
  els.push(rect(20, 636, 350, 52, 'rgba(123,155,119,0.08)', { radius: 10 }));
  els.push(rect(20, 636, 3, 52, ACCENT2, { radius: 2 }));
  els.push(text('Great progress this month, Anya.', 32, 654, { size: 12, weight: 'semibold', color: TEXT }));
  els.push(text('Consistency with Vitamin C + SPF drove most gains.', 32, 672, { size: 11, color: MUTED }));

  // Bottom nav
  els.push(rect(0, 756, W, 88, SURFACE));
  els.push(line(0, 756, W, 756, DIM));
  ['⊙ Scan', '◫ Dashboard', '◈ Analysis', '◻ Routine', '∿ Progress'].forEach((item, i) => {
    const nx = 39 + i * 78;
    const active = i === 4;
    els.push(text(item, nx, 800, { size: 11, weight: active ? 'semibold' : 'regular', color: active ? ACCENT : MUTED, align: 'center' }));
    if (active) els.push(rect(nx - 22, 756, 44, 2, ACCENT));
  });
  els.push(rect(155, 833, 80, 4, 'rgba(26,22,18,0.15)', { radius: 2 }));

  return { id: 'screen-5', name: 'Progress', width: W, height: H, backgroundColor: BG, elements: els };
}

// ─── ASSEMBLE & WRITE ────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  metadata: {
    name: 'SERUM — AI Personal Skin Intelligence',
    description: 'Light parchment AI skincare app. Scan screen with AR tracking dots and face analysis, Dashboard with 4 metric tiles and 7-day chart, Analysis with AI-graded concerns + causes + fixes, Routine tracker with step toggles and streak, and 30-day Progress with improvement bars. Inspired by Overlay beauty-tech (lapa.ninja) and Superpower health intelligence (godly.website).',
    author: 'RAM Design AI',
    created: new Date().toISOString(),
    theme: 'light',
    tags: ['light', 'health', 'skincare', 'ai', 'beauty-tech', 'dashboard'],
  },
  screens: [
    screenScan(),
    screenDashboard(),
    screenAnalysis(),
    screenRoutine(),
    screenProgress(),
  ],
};

fs.writeFileSync(path.join(__dirname, 'serum.pen'), JSON.stringify(pen, null, 2));
console.log('✓ serum.pen written —', pen.screens.length, 'screens');
