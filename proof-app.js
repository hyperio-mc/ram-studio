'use strict';
const fs   = require('fs');
const path = require('path');

// ── PROOF — Customer Impact Stories ───────────────────────────────────────
// LIGHT editorial theme. Warm white + deep navy. Case study / impact storytelling.
// Inspired by Evervault's customer stories page (godly.website, Apr 2026) —
//   editorial layout with big category label, giant display type, stacked story
//   cards with company branding, bold metric callouts.
// Also: "Champions For Good" on Awwwards — impact-forward, cause-driven design.
// 6 screens, 500+ elements.

// ── PALETTE — Editorial Trust / Impact ───────────────────────────────────
const BG       = '#FAFAF7';   // warm white — paper feel
const SURFACE  = '#FFFFFF';   // pure white card
const SURFACE2 = '#F2EEE8';   // tinted off-white (inset/chips)
const SURFACE3 = '#E8E2D8';   // stronger tint
const BORDER   = '#E3DDD6';   // soft warm divider
const BORDER2  = '#CCC6BC';   // stronger border
const TEXT     = '#0E1523';   // deep navy near-black
const TEXT2    = '#364155';   // secondary navy
const TEXT3    = '#7E8BA3';   // muted blue-grey
const ACCENT   = '#1A4FDB';   // vivid cobalt blue
const ACCENT2  = '#059669';   // emerald success
const ACCENT3  = '#7C3AED';   // violet (second category accent)
const GOLD     = '#D97706';   // amber highlight
const RED      = '#DC2626';   // decrease/negative

const W = 390;
const H = 844;

let elements = [];
let eid = 1;
function uid() { return `el-${eid++}`; }

// ── PRIMITIVES ─────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  elements.push({
    id: uid(), type: 'rect',
    x, y, width: w, height: h, fill,
    ...(opts.rx !== undefined ? { rx: opts.rx } : {}),
    ...(opts.stroke ? { stroke: opts.stroke, strokeWidth: opts.strokeWidth || 1 } : {}),
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  });
}

function text(content, x, y, opts = {}) {
  elements.push({
    id: uid(), type: 'text',
    x, y, content,
    fontSize: opts.size || 14,
    fontWeight: opts.weight || '400',
    fontFamily: opts.font || 'Inter',
    fill: opts.color || TEXT,
    textAlign: opts.align || 'left',
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
    ...(opts.letterSpacing !== undefined ? { letterSpacing: opts.letterSpacing } : {}),
    ...(opts.lineHeight !== undefined ? { lineHeight: opts.lineHeight } : {}),
    ...(opts.width !== undefined ? { width: opts.width } : {}),
  });
}

function circle(cx, cy, r, fill, opts = {}) {
  elements.push({
    id: uid(), type: 'ellipse',
    cx, cy, rx: r, ry: r, fill,
    ...(opts.stroke ? { stroke: opts.stroke, strokeWidth: opts.strokeWidth || 1 } : {}),
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  });
}

function line(x1, y1, x2, y2, stroke, sw = 1, opts = {}) {
  elements.push({
    id: uid(), type: 'line',
    x1, y1, x2, y2, stroke, strokeWidth: sw,
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  });
}

// ── SHARED COMPONENTS ──────────────────────────────────────────────────────
function statusBar(yOff) {
  rect(0, yOff, W, 44, BG);
  text('9:41', 18, yOff + 28, { size: 15, weight: '600', color: TEXT });
  for (let i = 0; i < 3; i++) {
    rect(W - 58 + i * 10, yOff + 18, 6, 7 + i * 3, TEXT, { rx: 1.5 });
  }
  rect(W - 30, yOff + 17, 22, 11, 'none', { stroke: TEXT, strokeWidth: 1.5, rx: 2.5 });
  rect(W - 28, yOff + 19, 14, 7, TEXT, { rx: 1.5 });
}

function bottomNav(yOff, active) {
  rect(0, yOff, W, 82, SURFACE, { stroke: BORDER, strokeWidth: 1 });
  const tabs = [
    { label: 'STORIES', icon: '◼', id: 0 },
    { label: 'EXPLORE', icon: '◎', id: 1 },
    { label: 'COMPARE', icon: '⊟', id: 2 },
    { label: 'SAVED',   icon: '◈', id: 3 },
    { label: 'YOU',     icon: '⊕', id: 4 },
  ];
  const tabW = W / tabs.length;
  tabs.forEach((tab, i) => {
    const cx = tabW * i + tabW / 2;
    const isActive = i === active;
    if (isActive) rect(tabW * i + tabW / 2 - 20, yOff + 8, 40, 3, ACCENT, { rx: 1.5 });
    circle(cx, yOff + 26, 10, isActive ? ACCENT : 'none', { stroke: isActive ? 'none' : BORDER2, strokeWidth: 1.5 });
    text(tab.icon, cx, yOff + 31, { size: 9, color: isActive ? SURFACE : TEXT3, align: 'center', weight: '700' });
    text(tab.label, cx, yOff + 55, { size: 8.5, weight: isActive ? '700' : '500', color: isActive ? ACCENT : TEXT3, align: 'center', letterSpacing: 0.8 });
  });
  // Home indicator
  rect(W/2 - 60, yOff + 68, 120, 4, BORDER2, { rx: 2 });
}

// ── CATEGORY CHIP ──────────────────────────────────────────────────────────
function chip(label, x, y, accentColor, opts = {}) {
  const padH = opts.padH || 12;
  const padV = opts.padV || 6;
  const fw = opts.width || (label.length * 7 + padH * 2);
  const fh = opts.height || 26;
  rect(x, y, fw, fh, opts.filled ? accentColor : 'none', { rx: fh / 2, stroke: opts.filled ? 'none' : accentColor, strokeWidth: 1.2 });
  text(label, x + fw / 2, y + fh / 2 + 5, {
    size: 10, weight: '600', color: opts.filled ? SURFACE : accentColor,
    align: 'center', letterSpacing: 0.6,
  });
  return fw;
}

// ── STORY CARD ─────────────────────────────────────────────────────────────
function storyCard(x, y, w, story) {
  const h = story.compact ? 120 : 160;
  rect(x, y, w, h, SURFACE, { rx: 14, stroke: BORDER, strokeWidth: 1 });

  // Category label
  const catColor = story.catColor || ACCENT;
  chip(story.category, x + 14, y + 14, catColor, { filled: false });

  // Company logo placeholder
  const logoSize = 28;
  rect(x + w - logoSize - 14, y + 14, logoSize, logoSize, SURFACE2, { rx: 6, stroke: BORDER, strokeWidth: 1 });
  text(story.logoMark, x + w - logoSize/2 - 14, y + 14 + logoSize/2 + 5, { size: 10, weight: '700', color: TEXT2, align: 'center' });

  if (!story.compact) {
    // Headline
    text(story.headline, x + 14, y + 54, { size: 15, weight: '700', color: TEXT, width: w - 30, lineHeight: 1.35, font: 'Georgia' });
    // Metric highlight
    rect(x + 14, y + 108, w - 28, 30, SURFACE2, { rx: 8 });
    text(story.metric, x + 22, y + 129, { size: 18, weight: '800', color: catColor });
    text(story.metricLabel, x + 22 + story.metric.length * 11, y + 129, { size: 11, color: TEXT3, weight: '500' });
    // Footer
    line(x, y + 140, x + w, y + 140, BORDER, 1);
    text(story.company, x + 14, y + 156, { size: 11, weight: '600', color: TEXT2 });
    text(story.readTime, x + w - 14, y + 156, { size: 11, color: TEXT3, align: 'right' });
  } else {
    text(story.headline, x + 14, y + 52, { size: 13, weight: '700', color: TEXT, width: w - 30 });
    text(story.metric, x + 14, y + 82, { size: 22, weight: '800', color: catColor });
    text(story.company, x + 14, y + 106, { size: 11, color: TEXT3 });
  }
}

// ─────────────────────────────────────────────────────────────────────────
// SCREEN 1 — HOME: Browse Stories
// ─────────────────────────────────────────────────────────────────────────
function screen1() {
  const Y = 0;
  rect(0, Y, W, H, BG);
  statusBar(Y);

  // App name + icon
  rect(16, Y + 52, 42, 42, ACCENT, { rx: 10 });
  text('P', 37, Y + 80, { size: 24, weight: '800', color: SURFACE, align: 'center' });
  text('PROOF', 68, Y + 72, { size: 20, weight: '800', color: TEXT, letterSpacing: 1.5 });
  text('Customer Impact Stories', 68, Y + 88, { size: 11, color: TEXT3, letterSpacing: 0.3 });

  // Search bar
  rect(16, Y + 106, W - 32, 40, SURFACE2, { rx: 20, stroke: BORDER, strokeWidth: 1 });
  text('⌕', 36, Y + 131, { size: 16, color: TEXT3 });
  text('Search 2,400+ customer stories', 56, Y + 131, { size: 13, color: TEXT3 });

  // Ticker bar — live metric updates
  rect(0, Y + 158, W, 36, TEXT, { rx: 0 });
  text('⬆', 14, Y + 181, { size: 10, color: ACCENT2 });
  text('Ramp saved $2.1M this quarter', 28, Y + 181, { size: 11, weight: '500', color: SURFACE, letterSpacing: 0.2 });
  text('·', 220, Y + 181, { size: 14, color: TEXT3 });
  text('⬆', 232, Y + 181, { size: 10, color: ACCENT2 });
  text('Notion grew 340% in SMB', 246, Y + 181, { size: 11, weight: '500', color: SURFACE, letterSpacing: 0.2 });
  text('⬆', 373, Y + 181, { size: 10, color: ACCENT2, opacity: 0.6 });

  // Section: Featured — big editorial card
  rect(16, Y + 206, W - 32, 190, ACCENT, { rx: 16 });
  // Noise texture via subtle rects
  for (let i = 0; i < 6; i++) {
    rect(16 + i * 60, Y + 206, 40, 190, SURFACE, { rx: 0, opacity: 0.03 });
  }
  chip('FEATURED STORY', 30, Y + 222, SURFACE, { filled: false });
  text('How Ramp cut payment fraud by 94% using real-time vault isolation', 30, Y + 258, {
    size: 18, weight: '800', color: SURFACE, width: 320, lineHeight: 1.3, font: 'Georgia',
  });
  text('Ramp · Revenue Operations · 8 min read', 30, Y + 324, { size: 11, color: SURFACE, opacity: 0.7 });
  // Metric callout on featured card
  rect(W - 110, Y + 302, 88, 52, SURFACE, { rx: 10, opacity: 0.15 });
  text('94%', W - 98, Y + 328, { size: 26, weight: '800', color: SURFACE });
  text('fraud ↓', W - 98, Y + 346, { size: 11, color: SURFACE, opacity: 0.85 });

  // Category chips
  text('BROWSE BY OUTCOME', 16, Y + 414, { size: 10, weight: '700', color: TEXT3, letterSpacing: 1.2 });
  const cats = [
    { l: 'Revenue ↑', c: ACCENT2 },
    { l: 'Cost ↓', c: GOLD },
    { l: 'Security', c: ACCENT3 },
    { l: 'Scale', c: ACCENT },
    { l: 'Efficiency', c: RED },
  ];
  let cx2 = 16;
  cats.forEach((cat, i) => {
    const w2 = chip(cat.l, cx2, Y + 428, cat.c, { filled: i === 0 });
    cx2 += w2 + 8;
  });

  // Story cards
  storyCard(16, Y + 466, W - 32, {
    category: 'REVENUE', catColor: ACCENT2,
    company: 'Notion', logoMark: 'N',
    headline: 'Notion grew self-serve revenue 340% in 18 months without sales headcount',
    metric: '+340%', metricLabel: 'self-serve ARR',
    readTime: '6 min',
  });

  storyCard(16, Y + 644, W - 32, {
    category: 'SECURITY', catColor: ACCENT3,
    company: 'FlightHub', logoMark: 'F',
    headline: 'FlightHub eliminated card fraud losses while cutting checkout friction',
    metric: '−78%', metricLabel: 'fraud loss rate',
    readTime: '5 min',
  });

  bottomNav(Y + H - 82, 0);
}

// ─────────────────────────────────────────────────────────────────────────
// SCREEN 2 — STORY DETAIL: Full case study read
// ─────────────────────────────────────────────────────────────────────────
function screen2() {
  const Y = H;
  rect(0, Y, W, H, BG);
  statusBar(Y);

  // Back button + progress
  rect(16, Y + 52, 36, 36, SURFACE2, { rx: 18, stroke: BORDER, strokeWidth: 1 });
  text('←', 34, Y + 74, { size: 18, color: TEXT, align: 'center' });
  rect(64, Y + 66, 240, 6, BORDER, { rx: 3 });
  rect(64, Y + 66, 108, 6, ACCENT, { rx: 3 });
  text('65% read', 312, Y + 74, { size: 11, color: TEXT3 });

  // Company + category header
  rect(16, Y + 102, 44, 44, SURFACE, { rx: 10, stroke: BORDER, strokeWidth: 1 });
  text('R', 38, Y + 130, { size: 20, weight: '800', color: ACCENT, align: 'center' });
  text('RAMP', 70, Y + 118, { size: 14, weight: '700', color: TEXT });
  text('Revenue Operations · Security', 70, Y + 136, { size: 11, color: TEXT3 });
  chip('FRAUD PREVENTION', 240, Y + 112, ACCENT3, { filled: true });

  // Big display headline
  text('How Ramp cut payment fraud by 94% using real-time vault isolation', 16, Y + 164, {
    size: 22, weight: '800', color: TEXT, width: W - 32, lineHeight: 1.3, font: 'Georgia',
  });

  text('By Sarah Chen, Chief Risk Officer at Ramp · Updated March 2026', 16, Y + 262, {
    size: 11, color: TEXT3, width: W - 32,
  });
  line(16, Y + 282, W - 16, Y + 282, BORDER, 1);

  // Summary metric row
  const metrics = [
    { val: '94%', sub: 'fraud ↓', color: ACCENT2 },
    { val: '$2.1M', sub: 'saved', color: ACCENT },
    { val: '3 wks', sub: 'deploy', color: GOLD },
  ];
  metrics.forEach((m, i) => {
    const mx = 16 + i * 120;
    rect(mx, Y + 294, 108, 56, SURFACE, { rx: 10, stroke: BORDER, strokeWidth: 1 });
    text(m.val, mx + 12, Y + 324, { size: 22, weight: '800', color: m.color });
    text(m.sub, mx + 12, Y + 342, { size: 11, color: TEXT3, weight: '500' });
  });

  // Body text (article excerpt)
  text('The challenge', 16, Y + 366, { size: 13, weight: '700', color: TEXT, letterSpacing: 0.4 });
  text('When Ramp onboarded 40,000 new cards in Q3, their legacy fraud scoring could not keep pace with novel attack vectors targeting corporate spend management.', 16, Y + 384, {
    size: 13.5, color: TEXT2, width: W - 32, lineHeight: 1.6,
  });

  // Pull quote block — inspired by Evervault editorial layout
  rect(16, Y + 462, W - 32, 84, SURFACE2, { rx: 12 });
  rect(16, Y + 462, 4, 84, ACCENT, { rx: 2 });
  text('"', 30, Y + 488, { size: 48, weight: '800', color: ACCENT, opacity: 0.25, font: 'Georgia' });
  text('We went from 2-day fraud review cycles to real-time decisions. The vault model changed everything.', 40, Y + 484, {
    size: 13, weight: '600', color: TEXT, width: W - 70, lineHeight: 1.5, font: 'Georgia',
  });
  text('— Sarah Chen, CRO at Ramp', 40, Y + 540, { size: 11, color: TEXT3, weight: '500' });

  // Continue reading CTA
  text('The solution', 16, Y + 560, { size: 13, weight: '700', color: TEXT, letterSpacing: 0.4 });
  text("Ramp deployed an isolated payment vault with per-transaction runtime keys, reducing the blast radius of any single credential compromise from 40,000 cards to exactly one.", 16, Y + 578, {
    size: 13.5, color: TEXT2, width: W - 32, lineHeight: 1.6,
  });

  // Inline data callout
  rect(16, Y + 658, W - 32, 44, TEXT, { rx: 10 });
  text('↓', 30, Y + 685, { size: 14, color: ACCENT2 });
  text('94% reduction in fraud events (Q4 2025 vs Q3 2025)', 46, Y + 685, { size: 12, color: SURFACE, weight: '600' });

  // Next story teaser
  line(0, Y + 718, W, Y + 718, BORDER, 1);
  text('Up next:', 16, Y + 735, { size: 11, color: TEXT3 });
  text('FlightHub: 3DS integration that cut chargebacks', 68, Y + 735, { size: 12, color: ACCENT, weight: '600' });
  text('→', W - 24, Y + 735, { size: 14, color: ACCENT });

  bottomNav(Y + H - 82, 0);
}

// ─────────────────────────────────────────────────────────────────────────
// SCREEN 3 — METRICS EXPLORER: Before vs After
// ─────────────────────────────────────────────────────────────────────────
function screen3() {
  const Y = 2 * H;
  rect(0, Y, W, H, BG);
  statusBar(Y);

  // Header
  text('METRICS EXPLORER', 16, Y + 66, { size: 11, weight: '700', color: TEXT3, letterSpacing: 1.5 });
  text('Before vs. After', 16, Y + 86, { size: 24, weight: '800', color: TEXT, font: 'Georgia' });

  // Toggle: All / My Industry / My Size
  rect(16, Y + 118, W - 32, 36, SURFACE2, { rx: 18 });
  rect(16, Y + 118, (W - 32) / 3, 36, SURFACE, { rx: 18, stroke: BORDER, strokeWidth: 1 });
  const toggleLabels = ['All Stories', 'My Industry', 'My Size'];
  toggleLabels.forEach((l, i) => {
    text(l, 16 + ((W - 32) / 3) * i + (W - 32) / 6, Y + 141, {
      size: 12, weight: i === 0 ? '700' : '500', color: i === 0 ? TEXT : TEXT3, align: 'center',
    });
  });

  // Metric type tabs
  const mtabs = ['Fraud ↓', 'Revenue ↑', 'Cost ↓', 'Speed ↑', 'Scale ↑'];
  let mx2 = 16;
  mtabs.forEach((t, i) => {
    const tw2 = t.length * 7 + 22;
    rect(mx2, Y + 168, tw2, 28, i === 0 ? ACCENT : SURFACE, { rx: 14, stroke: i === 0 ? 'none' : BORDER, strokeWidth: 1 });
    text(t, mx2 + tw2 / 2, Y + 187, { size: 11, weight: '600', color: i === 0 ? SURFACE : TEXT3, align: 'center' });
    mx2 += tw2 + 8;
  });

  // Before / After comparison cards
  const comparisons = [
    { company: 'Ramp', before: '2.4%', after: '0.14%', label: 'fraud rate', delta: '−94%', color: ACCENT2, icon: 'R' },
    { company: 'FlightHub', before: '1.8%', after: '0.39%', label: 'chargeback rate', delta: '−78%', color: ACCENT2, icon: 'F' },
    { company: 'Tebex', before: '34h', after: '2.1h', label: 'fraud review time', delta: '−94%', color: ACCENT2, icon: 'T' },
    { company: 'Meili', before: '12 steps', after: '3 steps', label: 'checkout flow', delta: '−75%', color: ACCENT2, icon: 'M' },
  ];

  comparisons.forEach((c, i) => {
    const cardY = Y + 210 + i * 118;
    rect(16, cardY, W - 32, 106, SURFACE, { rx: 12, stroke: BORDER, strokeWidth: 1 });

    // Company
    circle(36, cardY + 26, 16, SURFACE2, { stroke: BORDER, strokeWidth: 1 });
    text(c.icon, 36, cardY + 32, { size: 13, weight: '800', color: TEXT2, align: 'center' });
    text(c.company, 60, cardY + 22, { size: 13, weight: '700', color: TEXT });
    text(c.label, 60, cardY + 38, { size: 11, color: TEXT3 });

    // Delta badge
    rect(W - 90, cardY + 14, 62, 26, ACCENT2, { rx: 13 });
    text(c.delta, W - 59, cardY + 32, { size: 13, weight: '700', color: SURFACE, align: 'center' });

    // Before/After bar
    line(16, cardY + 58, W - 16, cardY + 58, BORDER, 1);
    rect(16, cardY + 66, (W - 32) / 2 - 8, 32, SURFACE2, { rx: 8 });
    rect((W / 2) + 8, cardY + 66, (W - 32) / 2 - 8, 32, ACCENT2 + '22', { rx: 8 });

    text('BEFORE', 24, cardY + 78, { size: 9, weight: '700', color: TEXT3, letterSpacing: 0.8 });
    text(c.before, 24, cardY + 92, { size: 15, weight: '800', color: TEXT });
    text('AFTER', W / 2 + 16, cardY + 78, { size: 9, weight: '700', color: ACCENT2, letterSpacing: 0.8 });
    text(c.after, W / 2 + 16, cardY + 92, { size: 15, weight: '800', color: ACCENT2 });
  });

  // Aggregate insight bar
  rect(16, Y + H - 146, W - 32, 48, ACCENT, { rx: 12 });
  text('↑', 30, Y + H - 116, { size: 16, color: SURFACE });
  text('Companies using Proof see avg. −68% fraud in year 1', 50, Y + H - 116, { size: 12, color: SURFACE, weight: '600', width: W - 80 });

  bottomNav(Y + H - 82, 1);
}

// ─────────────────────────────────────────────────────────────────────────
// SCREEN 4 — COMPARE: Side-by-side vendor outcomes
// ─────────────────────────────────────────────────────────────────────────
function screen4() {
  const Y = 3 * H;
  rect(0, Y, W, H, BG);
  statusBar(Y);

  text('COMPARE', 16, Y + 66, { size: 11, weight: '700', color: TEXT3, letterSpacing: 1.5 });
  text('Vendor Outcomes', 16, Y + 86, { size: 24, weight: '800', color: TEXT, font: 'Georgia' });

  // Vendor A
  rect(16, Y + 118, (W - 48) / 2, 60, ACCENT, { rx: 12 });
  text('Evervault', 16 + (W - 48) / 4, Y + 142, { size: 13, weight: '700', color: SURFACE, align: 'center' });
  text('12 stories', 16 + (W - 48) / 4, Y + 162, { size: 11, color: SURFACE, align: 'center', opacity: 0.75 });

  // VS badge
  const vsX = W / 2 - 18;
  circle(W / 2, Y + 148, 18, SURFACE, { stroke: BORDER, strokeWidth: 2 });
  text('VS', W / 2, Y + 154, { size: 11, weight: '800', color: TEXT, align: 'center' });

  // Vendor B
  rect(16 + (W - 48) / 2 + 16, Y + 118, (W - 48) / 2, 60, SURFACE, { rx: 12, stroke: BORDER2, strokeWidth: 1 });
  text('Stripe Radar', 16 + (W - 48) / 2 + 16 + (W - 48) / 4, Y + 142, { size: 13, weight: '700', color: TEXT, align: 'center' });
  text('31 stories', 16 + (W - 48) / 2 + 16 + (W - 48) / 4, Y + 162, { size: 11, color: TEXT3, align: 'center' });

  // Comparison table
  const rows = [
    { label: 'Avg. Fraud Reduction', a: '94%', b: '61%', winner: 'a' },
    { label: 'Time to Deploy', a: '3 wks', b: '6 wks', winner: 'a' },
    { label: 'False Positive Rate', a: '1.2%', b: '4.7%', winner: 'a' },
    { label: 'Avg. ROI (Year 1)', a: '8.4×', b: '3.1×', winner: 'a' },
    { label: 'PCI Scope Reduction', a: '100%', b: '40%', winner: 'a' },
    { label: 'API Calls per Auth', a: '1', b: '3', winner: 'a' },
  ];

  rect(16, Y + 192, W - 32, rows.length * 56 + 20, SURFACE, { rx: 14, stroke: BORDER, strokeWidth: 1 });
  text('METRIC', 28, Y + 210, { size: 9, weight: '700', color: TEXT3, letterSpacing: 1.1 });
  text('EVERVAULT', W / 2 - 20, Y + 210, { size: 9, weight: '700', color: ACCENT, letterSpacing: 0.8, align: 'right' });
  text('STRIPE RADAR', W - 26, Y + 210, { size: 9, weight: '700', color: TEXT3, letterSpacing: 0.8, align: 'right' });

  rows.forEach((row, i) => {
    const ry = Y + 222 + i * 56;
    if (i % 2 === 1) rect(16, ry, W - 32, 56, SURFACE2, { rx: 0 });
    line(16, ry, W - 16, ry, BORDER, 1);
    text(row.label, 28, ry + 22, { size: 12, color: TEXT, weight: '500' });
    // Winner indicator
    if (row.winner === 'a') {
      rect(W / 2 - 60, ry + 30, 48, 18, ACCENT2 + '22', { rx: 9 });
      text(row.a, W / 2 - 36, ry + 43, { size: 12, weight: '700', color: ACCENT2, align: 'center' });
    } else {
      text(row.a, W / 2 - 36, ry + 43, { size: 12, weight: '500', color: TEXT3, align: 'center' });
    }
    text(row.b, W - 28, ry + 43, { size: 12, weight: '500', color: TEXT3, align: 'right' });
  });

  // CTA
  rect(16, Y + H - 148, W - 32, 48, ACCENT, { rx: 24 });
  text('See all Evervault stories →', W / 2, Y + H - 119, { size: 14, weight: '700', color: SURFACE, align: 'center' });

  bottomNav(Y + H - 82, 2);
}

// ─────────────────────────────────────────────────────────────────────────
// SCREEN 5 — SAVED: Bookmarked stories & collections
// ─────────────────────────────────────────────────────────────────────────
function screen5() {
  const Y = 4 * H;
  rect(0, Y, W, H, BG);
  statusBar(Y);

  text('SAVED', 16, Y + 66, { size: 11, weight: '700', color: TEXT3, letterSpacing: 1.5 });
  text('Your Library', 16, Y + 86, { size: 24, weight: '800', color: TEXT, font: 'Georgia' });
  text('14 stories · 3 collections', 16, Y + 108, { size: 12, color: TEXT3 });

  // Collections
  text('COLLECTIONS', 16, Y + 132, { size: 9, weight: '700', color: TEXT3, letterSpacing: 1.3 });

  const collections = [
    { name: 'Q2 Vendor Research', count: 8, color: ACCENT },
    { name: 'Security Case Studies', count: 4, color: ACCENT3 },
    { name: 'Cost Reduction', count: 2, color: GOLD },
  ];
  collections.forEach((col, i) => {
    const cardX = 16 + i * 120;
    rect(cardX, Y + 148, 110, 80, col.color, { rx: 12 });
    // Stack effect
    rect(cardX + 6, Y + 148 - 4, 98, 80, col.color, { rx: 10, opacity: 0.4 });
    rect(cardX + 12, Y + 148 - 8, 86, 80, col.color, { rx: 8, opacity: 0.2 });
    text(col.name, cardX + 8, Y + 196, { size: 11, weight: '700', color: SURFACE, width: 94, lineHeight: 1.3 });
    text(`${col.count} stories`, cardX + 8, Y + 218, { size: 10, color: SURFACE, opacity: 0.8 });
  });

  // Saved stories list
  text('RECENT SAVES', 16, Y + 250, { size: 9, weight: '700', color: TEXT3, letterSpacing: 1.3 });

  const saved = [
    { company: 'Ramp', headline: 'How Ramp cut fraud 94%', category: 'Security', catColor: ACCENT3, time: '8 min', icon: 'R', date: '2d ago' },
    { company: 'Notion', headline: 'Notion 340% self-serve ARR growth', category: 'Revenue', catColor: ACCENT2, time: '6 min', icon: 'N', date: '3d ago' },
    { company: 'Linear', headline: 'Linear scales to 50K teams without DevOps', category: 'Scale', catColor: ACCENT, time: '4 min', icon: 'L', date: '5d ago' },
    { company: 'Vercel', headline: 'Vercel: how we deploy 500M functions/day', category: 'Efficiency', catColor: GOLD, time: '7 min', icon: 'V', date: '1w ago' },
  ];

  saved.forEach((s, i) => {
    const sy = Y + 268 + i * 102;
    rect(16, sy, W - 32, 90, SURFACE, { rx: 12, stroke: BORDER, strokeWidth: 1 });

    // Company logo
    circle(44, sy + 26, 18, SURFACE2, { stroke: BORDER, strokeWidth: 1 });
    text(s.icon, 44, sy + 32, { size: 14, weight: '800', color: TEXT2, align: 'center' });

    // Content
    text(s.headline, 72, sy + 20, { size: 13, weight: '700', color: TEXT, width: W - 110 });
    chip(s.category, 72, sy + 40, s.catColor, { filled: false });
    text(s.date, W - 30, sy + 20, { size: 11, color: TEXT3, align: 'right' });

    // Footer
    line(16, sy + 70, W - 16, sy + 70, BORDER, 1);
    text(s.time + ' read', 72, sy + 82, { size: 11, color: TEXT3 });
    text('◈ Saved', W - 30, sy + 82, { size: 11, color: ACCENT, align: 'right', weight: '600' });
  });

  bottomNav(Y + H - 82, 3);
}

// ─────────────────────────────────────────────────────────────────────────
// SCREEN 6 — FILTERS / DISCOVERY: Explore by category
// ─────────────────────────────────────────────────────────────────────────
function screen6() {
  const Y = 5 * H;
  rect(0, Y, W, H, BG);
  statusBar(Y);

  text('EXPLORE', 16, Y + 66, { size: 11, weight: '700', color: TEXT3, letterSpacing: 1.5 });
  text('Find Your Story', 16, Y + 86, { size: 24, weight: '800', color: TEXT, font: 'Georgia' });

  // Active filters summary
  rect(16, Y + 118, W - 32, 40, ACCENT + '15', { rx: 10, stroke: ACCENT, strokeWidth: 1 });
  text('◎', 28, Y + 143, { size: 14, color: ACCENT });
  text('SaaS · 50–500 employees · Security · Last 6 months', 46, Y + 143, { size: 12, color: ACCENT, weight: '500' });
  text('×', W - 24, Y + 143, { size: 16, color: ACCENT, align: 'right' });

  // Outcome type selector
  text('OUTCOME TYPE', 16, Y + 174, { size: 9, weight: '700', color: TEXT3, letterSpacing: 1.3 });
  const outcomes = [
    { label: 'Revenue Growth', icon: '↑', color: ACCENT2, count: 412 },
    { label: 'Cost Reduction', icon: '↓', color: GOLD, count: 287 },
    { label: 'Fraud/Security', icon: '⊕', color: ACCENT3, count: 184 },
    { label: 'Operational Scale', icon: '⬡', color: ACCENT, count: 319 },
  ];
  outcomes.forEach((o, i) => {
    const oy = Y + 192 + i * 58;
    const isSelected = i === 2;
    rect(16, oy, W - 32, 48, isSelected ? o.color + '18' : SURFACE, { rx: 12, stroke: isSelected ? o.color : BORDER, strokeWidth: isSelected ? 1.5 : 1 });
    circle(40, oy + 24, 16, isSelected ? o.color : SURFACE2, { stroke: isSelected ? 'none' : BORDER, strokeWidth: 1 });
    text(o.icon, 40, oy + 29, { size: 14, color: isSelected ? SURFACE : TEXT3, align: 'center', weight: '700' });
    text(o.label, 66, oy + 20, { size: 14, weight: isSelected ? '700' : '500', color: isSelected ? TEXT : TEXT2 });
    text(`${o.count} stories`, 66, oy + 36, { size: 11, color: TEXT3 });
    if (isSelected) {
      rect(W - 52, oy + 16, 24, 16, o.color, { rx: 8 });
      text('✓', W - 40, oy + 28, { size: 11, color: SURFACE, align: 'center', weight: '700' });
    }
  });

  // Industry filter
  text('INDUSTRY', 16, Y + 434, { size: 9, weight: '700', color: TEXT3, letterSpacing: 1.3 });
  const industries = ['SaaS ✓', 'Fintech', 'E-comm', 'Media', 'Health', 'Logistics'];
  let chipX = 16;
  let chipY = Y + 452;
  industries.forEach((ind, i) => {
    const isSelected = ind.includes('✓');
    const cw = ind.length * 7.5 + 22;
    if (chipX + cw > W - 16) { chipX = 16; chipY += 38; }
    rect(chipX, chipY, cw, 28, isSelected ? ACCENT : SURFACE, { rx: 14, stroke: isSelected ? 'none' : BORDER, strokeWidth: 1 });
    text(ind, chipX + cw / 2, chipY + 19, { size: 11, weight: isSelected ? '700' : '400', color: isSelected ? SURFACE : TEXT2, align: 'center' });
    chipX += cw + 8;
  });

  // Company size
  text('COMPANY SIZE', 16, Y + 532, { size: 9, weight: '700', color: TEXT3, letterSpacing: 1.3 });
  const sizes = ['1–10', '11–50', '51–500 ✓', '501–5K', '5K+'];
  chipX = 16;
  sizes.forEach((s, i) => {
    const isSelected = s.includes('✓');
    const sw = s.length * 7 + 22;
    rect(chipX, Y + 550, sw, 28, isSelected ? ACCENT : SURFACE, { rx: 14, stroke: isSelected ? 'none' : BORDER, strokeWidth: 1 });
    text(s, chipX + sw / 2, Y + 569, { size: 11, weight: isSelected ? '700' : '400', color: isSelected ? SURFACE : TEXT2, align: 'center' });
    chipX += sw + 8;
  });

  // Results count + apply button
  rect(16, Y + 596, W - 32, 1, BORDER, { rx: 0 });
  text('184 matching stories found', 16, Y + 618, { size: 13, color: TEXT3 });

  rect(16, Y + 640, W - 32, 52, ACCENT, { rx: 26 });
  text('View 184 Stories →', W / 2, Y + 671, { size: 15, weight: '700', color: SURFACE, align: 'center' });

  // Trending tags
  text('TRENDING THIS WEEK', 16, Y + 710, { size: 9, weight: '700', color: TEXT3, letterSpacing: 1.3 });
  const trending = ['#vault-isolation', '#3ds-v2', '#fraud-ml', '#pci-scope'];
  let tx = 16;
  trending.forEach(tag => {
    const tw2 = tag.length * 7 + 18;
    rect(tx, Y + 726, tw2, 24, SURFACE2, { rx: 12 });
    text(tag, tx + tw2 / 2, Y + 742, { size: 10, color: TEXT3, align: 'center' });
    tx += tw2 + 8;
  });

  bottomNav(Y + H - 82, 4);
}

// ── GENERATE SCREENS ────────────────────────────────────────────────────────
screen1();
screen2();
screen3();
screen4();
screen5();
screen6();

// ── WRITE PEN FILE ──────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  metadata: {
    name:        'PROOF — Customer Impact Stories',
    description: 'Light editorial theme. Warm white + deep navy. B2B case study / impact storytelling platform. Inspired by Evervault customer stories (godly.website) — editorial layout with bold display type, stacked case study cards, metric callouts. 6 screens, 500+ elements.',
    screens:     6,
    theme:       'light',
    archetype:   'editorial-impact',
    colors:      { bg: BG, surface: SURFACE, text: TEXT, accent: ACCENT, accent2: ACCENT2 },
    created:     new Date().toISOString(),
  },
  canvas: {
    width:  W,
    height: H * 6,
    background: BG,
  },
  elements,
};

const outPath = path.join(__dirname, 'proof.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ proof.pen written — ${elements.length} elements across 6 screens`);
