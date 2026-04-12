'use strict';
// TORCH — Intelligence. Illuminated.
// Heartbeat #47 | Dark theme
// Inspired by: WyrVox torch-and-shadow effect (darkmodedesign.com),
//              bento grid trend (saaspo/land-book),
//              purple as the AI color of 2026
// Palette: deep ink-black + purple + amber

const fs   = require('fs');
const path = require('path');

const SLUG    = 'torch';
const NAME    = 'TORCH';
const TAGLINE = 'Intelligence. Illuminated.';
const W       = 390;
const H       = 844;

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:      '#07060F',   // ink black with subtle violet undertone
  surf:    '#0E0C1E',   // dark navy-purple surface
  card:    '#16132B',   // elevated card
  card2:   '#1D1A35',   // deeper card variant
  stroke:  '#2A2650',   // subtle border
  accent:  '#8B5CF6',   // violet — AI/intelligence (purple is the AI color of 2026)
  accent2: '#F59E0B',   // amber — torch light, warmth
  accent3: '#22D3EE',   // cyan — data/precision accent
  text:    '#EDE9FF',   // slightly violet-tinted white
  textDim: '#9D93CC',   // muted purple-grey
  green:   '#10B981',   // positive/signal confirmed
  red:     '#F43F5E',   // alert/critical
  white:   '#FFFFFF',
};

// ─── Primitives ───────────────────────────────────────────────────────────────
const els = [];
let sc = [];

function rect(x, y, w, h, fill, opts = {}) {
  return { type: 'rect', x, y, width: w, height: h, fill, rx: opts.rx || 0, opacity: opts.opacity || 1, stroke: opts.stroke || 'none', strokeWidth: opts.sw || 0 };
}
function text(x, y, content, size, fill, opts = {}) {
  return { type: 'text', x, y, content: String(content), fontSize: size, fill, fontWeight: opts.fw || 400, fontFamily: opts.font || 'Inter', textAnchor: opts.anchor || 'start', letterSpacing: opts.ls || 0, opacity: opts.opacity || 1 };
}
function circle(cx, cy, r, fill, opts = {}) {
  return { type: 'circle', cx, cy, r, fill, opacity: opts.opacity || 1, stroke: opts.stroke || 'none', strokeWidth: opts.sw || 0 };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return { type: 'line', x1, y1, x2, y2, stroke, strokeWidth: opts.sw || 1, opacity: opts.opacity || 1 };
}

// Helper: push elements to current screen
function add(...items) { items.forEach(i => { if (i) sc.push(i); }); }

// ─── Reusable components ──────────────────────────────────────────────────────
function statusBar(dark = true) {
  const bg   = dark ? C.bg : C.surf;
  add(rect(0, 0, W, 44, bg));
  add(text(16, 28, '9:41', 14, C.textDim, { fw: 500 }));
  add(text(W - 16, 28, '●●● ▼ 100%', 11, C.textDim, { anchor: 'end' }));
}

function bottomNav(active = 0) {
  const tabs = [
    { icon: '◈', label: 'Command' },
    { icon: '◉', label: 'Signals' },
    { icon: '◎', label: 'Topics' },
    { icon: '⊞', label: 'Briefs' },
    { icon: '○', label: 'Profile' },
  ];
  add(rect(0, H - 80, W, 80, C.surf));
  add(line(0, H - 80, W, H - 80, C.stroke, { sw: 1 }));
  tabs.forEach((tab, i) => {
    const x = 39 + i * 78;
    const isActive = i === active;
    const col = isActive ? C.accent : C.textDim;
    add(text(x, H - 52, tab.icon, 20, col, { anchor: 'middle', fw: isActive ? 700 : 400 }));
    add(text(x, H - 30, tab.label, 10, col, { anchor: 'middle', fw: isActive ? 600 : 400 }));
    if (isActive) {
      add(rect(x - 20, H - 80, 40, 2, C.accent, { rx: 1 }));
    }
  });
}

function sectionHeader(x, y, label) {
  add(text(x, y, label.toUpperCase(), 10, C.textDim, { fw: 700, ls: 2 }));
  return y + 20;
}

// ─── SCREEN 1: Command Center (bento dashboard) ────────────────────────────
function buildScreen1() {
  sc = [];
  add(rect(0, 0, W, H, C.bg));
  // Ambient background glow elements (subtle atmosphere)
  add(circle(320, 180, 120, C.accent, { opacity: 0.04 }));
  add(circle(70, 400, 90, C.accent2, { opacity: 0.035 }));
  add(circle(200, 700, 140, C.accent3, { opacity: 0.025 }));
  statusBar();

  // App header
  add(rect(0, 44, W, 56, C.bg));
  add(text(20, 82, 'TORCH', 22, C.white, { fw: 800, ls: 3 }));
  add(circle(90, 72, 5, C.accent, { opacity: 0.9 }));
  add(text(W - 20, 75, 'Apr 9', 13, C.textDim, { anchor: 'end' }));
  add(text(W - 20, 91, '2026', 11, C.textDim, { anchor: 'end', opacity: 0.6 }));

  // ── Bento grid row 1 (spans full width minus padding) ──────────────────
  // Big card: Active Signals (60% width)
  const bigW = 222; const smallW = 132; const cardH = 130;
  const row1Y = 112; const gutter = 12;
  const lx = 16; const rx = lx + bigW + gutter;

  // Big card left
  add(rect(lx, row1Y, bigW, cardH, C.card, { rx: 16 }));
  add(rect(lx, row1Y, bigW, cardH, C.accent, { rx: 16, opacity: 0.06 })); // tint
  add(text(lx + 16, row1Y + 24, 'Active Signals', 11, C.textDim, { fw: 600 }));
  add(text(lx + 16, row1Y + 62, '247', 40, C.white, { fw: 800 }));
  add(text(lx + 16, row1Y + 80, '+12 today', 11, C.green, { fw: 500 }));
  // Spark line (7 bars)
  const sparkData = [40, 55, 38, 65, 72, 58, 80];
  sparkData.forEach((v, i) => {
    const bx = lx + bigW - 80 + i * 11;
    const bh = Math.round(v * 0.45);
    const by = row1Y + cardH - 14 - bh;
    add(rect(bx, by, 8, bh, C.accent, { rx: 2, opacity: i === 6 ? 1 : 0.4 + i * 0.07 }));
  });
  // Accent glow dot
  add(circle(lx + 16, row1Y + 16, 5, C.accent, { opacity: 0.8 }));

  // Small card right: Intelligence Score
  add(rect(rx, row1Y, smallW, cardH, C.card, { rx: 16 }));
  add(rect(rx, row1Y, smallW, cardH, C.accent2, { rx: 16, opacity: 0.05 }));
  add(circle(rx + 16, row1Y + 16, 5, C.accent2, { opacity: 0.8 }));
  add(text(rx + 16, row1Y + 24, 'Intel Score', 11, C.textDim, { fw: 600 }));
  add(text(rx + 66, row1Y + 72, '94', 38, C.accent2, { fw: 800, anchor: 'middle' }));
  // Small ring indicator
  add(circle(rx + 66, row1Y + 72, 28, 'none', { stroke: C.accent2, sw: 3, opacity: 0.2 }));
  add(circle(rx + 66, row1Y + 72, 28, 'none', { stroke: C.accent2, sw: 3, opacity: 0.8 })); // simplified arc (full for now)
  add(text(rx + 66, row1Y + 110, 'Excellent', 10, C.accent2, { anchor: 'middle', opacity: 0.7 }));

  // ── Bento grid row 2 ────────────────────────────────────────────────────
  const row2Y = row1Y + cardH + gutter;
  const halfW = (W - 16 * 2 - gutter) / 2; // ~175

  // New Insights card
  add(rect(lx, row2Y, halfW, 100, C.card, { rx: 16 }));
  add(rect(lx, row2Y, halfW, 100, C.accent3, { rx: 16, opacity: 0.05 }));
  add(circle(lx + 16, row2Y + 16, 5, C.accent3, { opacity: 0.8 }));
  add(text(lx + 16, row2Y + 24, 'New Insights', 11, C.textDim, { fw: 600 }));
  add(text(lx + 16, row2Y + 60, '31', 34, C.accent3, { fw: 800 }));
  add(text(lx + 16, row2Y + 80, 'last 24h', 10, C.textDim, { opacity: 0.6 }));

  // Critical Alerts card
  const rx2 = lx + halfW + gutter;
  add(rect(rx2, row2Y, halfW, 100, C.card, { rx: 16 }));
  add(rect(rx2, row2Y, halfW, 100, C.red, { rx: 16, opacity: 0.08 }));
  add(circle(rx2 + 16, row2Y + 16, 5, C.red, { opacity: 0.9 }));
  add(text(rx2 + 16, row2Y + 24, 'Critical Alerts', 11, C.textDim, { fw: 600 }));
  add(text(rx2 + 16, row2Y + 60, '3', 34, C.red, { fw: 800 }));
  add(text(rx2 + 16, row2Y + 80, 'needs review', 10, C.textDim, { opacity: 0.6 }));

  // ── Recent Signals list ─────────────────────────────────────────────────
  const listY = row2Y + 100 + 20;
  const nextY = sectionHeader(16, listY, 'Recent Signals');
  const signals = [
    { topic: 'AI', text: 'OpenAI announces GPT-5 multimodal update', score: 98, ago: '4m', col: C.accent },
    { topic: 'MARKET', text: 'NVIDIA Q1 earnings beat consensus by 18%', score: 87, ago: '12m', col: C.accent2 },
    { topic: 'POLICY', text: 'EU AI Act enforcement begins Q3 2026', score: 74, ago: '1h', col: C.accent3 },
  ];
  signals.forEach((s, i) => {
    const sy = nextY + i * 62;
    add(rect(16, sy, W - 32, 54, C.card, { rx: 12 }));
    // Topic badge
    add(rect(16, sy, 46, 54, s.col, { rx: 12, opacity: 0.15 }));
    add(text(39, sy + 31, s.topic, 9, s.col, { fw: 700, anchor: 'middle', ls: 0.5 }));
    // Text
    add(text(72, sy + 20, s.text, 11.5, C.text, { fw: 500 }));
    add(text(72, sy + 37, s.ago + ' ago', 10, C.textDim, { opacity: 0.7 }));
    // Score badge
    add(rect(W - 56, sy + 14, 36, 24, s.col, { rx: 8, opacity: 0.15 }));
    add(text(W - 38, sy + 30, String(s.score), 12, s.col, { fw: 700, anchor: 'middle' }));
  });

  // Weekly trend mini-graph in command center footer area
  const trendY = H - 164;
  add(rect(16, trendY, W - 32, 52, C.card, { rx: 12 }));
  add(circle(28, trendY + 14, 4, C.accent3, { opacity: 0.8 }));
  add(text(38, trendY + 18, 'Weekly pulse', 10, C.textDim, { fw: 600 }));
  add(text(W - 20, trendY + 18, '↑ +23% vs last week', 10, C.green, { anchor: 'end', fw: 600 }));
  // Week bars (14 days)
  const weekData = [30, 42, 38, 55, 47, 63, 71, 58, 66, 74, 69, 82, 78, 90];
  weekData.forEach((v, i) => {
    const bx = 20 + i * 25;
    const bh = Math.round(v * 0.28);
    add(rect(bx, trendY + 50 - bh, 18, bh, C.accent, { rx: 2, opacity: i >= 10 ? 0.7 + i * 0.03 : 0.25 + i * 0.02 }));
  });

  bottomNav(0);
  return sc;
}

// ─── SCREEN 2: Signal Feed ─────────────────────────────────────────────────
function buildScreen2() {
  sc = [];
  add(rect(0, 0, W, H, C.bg));
  add(circle(350, 300, 100, C.accent, { opacity: 0.03 }));
  add(circle(40, 600, 80, C.accent2, { opacity: 0.03 }));
  statusBar();

  // Header
  add(rect(0, 44, W, 56, C.bg));
  add(text(20, 78, 'Signal Feed', 20, C.white, { fw: 700 }));
  // Unread badge
  add(rect(128, 64, 28, 18, C.accent, { rx: 9 }));
  add(text(142, 77, '47', 10, C.white, { fw: 700, anchor: 'middle' }));

  // Filter chips
  const filterY = 104;
  add(rect(0, filterY, W, 36, C.bg));
  const filters = [
    { label: 'All', active: true },
    { label: 'AI', active: false },
    { label: 'Markets', active: false },
    { label: 'Policy', active: false },
    { label: 'Tech', active: false },
  ];
  let chipX = 16;
  filters.forEach(f => {
    const chipW = f.label.length * 8 + 20;
    add(rect(chipX, filterY + 4, chipW, 26, f.active ? C.accent : C.card, { rx: 13 }));
    add(text(chipX + chipW / 2, filterY + 22, f.label, 11, f.active ? C.white : C.textDim, { anchor: 'middle', fw: f.active ? 700 : 400 }));
    chipX += chipW + 8;
  });

  // Signal cards
  const feedItems = [
    { topic: 'AI', title: 'GPT-5 multimodal API now in public beta', source: 'TechCrunch', score: 98, time: '4m', urgency: 'critical', col: C.accent, summary: 'Major capability leap with real-time vision + audio processing built into a single API endpoint.' },
    { topic: 'MARKET', title: 'NVIDIA beats Q1 earnings by 18% on AI chip demand', source: 'Reuters', score: 87, time: '12m', urgency: 'high', col: C.accent2, summary: 'Data center revenue up 340% YoY as hyperscalers accelerate GPU procurement.' },
    { topic: 'POLICY', title: 'EU AI Act enforcement timeline moves to Q3', source: 'Politico', score: 74, time: '1h', urgency: 'medium', col: C.accent3, summary: 'Regulators confirm high-risk AI systems must comply by September 2026.' },
    { topic: 'TECH', title: 'Apple Intelligence 3.0 expands to 40 languages', source: 'The Verge', score: 61, time: '2h', urgency: 'low', col: C.green, summary: 'On-device processing improvements cut latency by 60% versus previous generation.' },
  ];

  const cardStartY = 148;
  feedItems.forEach((item, i) => {
    const cy = cardStartY + i * 152;
    add(rect(16, cy, W - 32, 140, C.card, { rx: 14 }));
    // Left accent bar
    add(rect(16, cy, 4, 140, item.col, { rx: 2 }));
    // Topic + time header
    add(rect(28, cy + 12, 38, 20, item.col, { rx: 10, opacity: 0.2 }));
    add(text(47, cy + 26, item.topic, 9, item.col, { fw: 700, anchor: 'middle', ls: 0.5 }));
    add(text(W - 28, cy + 26, item.time + ' ago', 10, C.textDim, { anchor: 'end' }));
    // Score
    const urgencyCol = item.urgency === 'critical' ? C.red : item.urgency === 'high' ? C.accent2 : item.urgency === 'medium' ? C.accent3 : C.textDim;
    add(circle(W - 48, cy + 20, 10, urgencyCol, { opacity: 0.15 }));
    add(text(W - 48, cy + 24, item.score, 9, urgencyCol, { fw: 700, anchor: 'middle' }));
    // Title
    add(text(28, cy + 52, item.title, 13, C.text, { fw: 600 }));
    // Summary
    add(text(28, cy + 72, item.summary.substring(0, 52), 11, C.textDim, { opacity: 0.85 }));
    add(text(28, cy + 88, item.summary.substring(52, 100), 11, C.textDim, { opacity: 0.85 }));
    // Source + read more
    add(text(28, cy + 112, item.source, 10, item.col, { fw: 500, opacity: 0.9 }));
    add(text(W - 28, cy + 112, 'View →', 10, C.textDim, { anchor: 'end', opacity: 0.7 }));
    // Divider
    add(line(28, cy + 127, W - 28, cy + 127, C.stroke, { sw: 1, opacity: 0.6 }));
  });

  // 5th signal card (partially visible, shows there's more)
  const cy5 = cardStartY + 4 * 152;
  add(rect(16, cy5, W - 32, 100, C.card, { rx: 14 }));
  add(rect(16, cy5, 4, 100, C.accent, { rx: 2 }));
  add(rect(28, cy5 + 12, 58, 20, C.accent, { rx: 10, opacity: 0.2 }));
  add(text(57, cy5 + 26, 'SPACE', 9, C.accent, { fw: 700, anchor: 'middle', ls: 0.5 }));
  add(text(W - 28, cy5 + 26, '3h ago', 10, C.textDim, { anchor: 'end' }));
  add(text(28, cy5 + 52, 'SpaceX Starship V4 orbital test succeeds', 13, C.text, { fw: 600 }));
  add(text(28, cy5 + 70, 'Full orbital profile achieved with payload', 11, C.textDim, { opacity: 0.8 }));
  // Load more indicator
  add(text(W / 2, cy5 + 118, '↓ 42 more signals', 12, C.accent, { anchor: 'middle', fw: 600, opacity: 0.8 }));

  bottomNav(1);
  return sc;
}

// ─── SCREEN 3: Topic Cluster (visual map) ─────────────────────────────────
function buildScreen3() {
  sc = [];
  add(rect(0, 0, W, H, C.bg));
  statusBar();

  // Header
  add(rect(0, 44, W, 56, C.bg));
  add(text(20, 78, 'Topic Map', 20, C.white, { fw: 700 }));
  add(text(W - 20, 78, '14 Topics', 12, C.textDim, { anchor: 'end' }));

  // Sub header
  add(text(20, 108, 'Monitoring pulse — signals by topic cluster', 12, C.textDim, { opacity: 0.8 }));

  // ── Cluster visualization ─────────────────────────────────────────────
  const mapY = 130; const mapH = 380;
  add(rect(16, mapY, W - 32, mapH, C.card, { rx: 20 }));

  // Center glow
  add(circle(W / 2, mapY + mapH / 2 - 10, 90, C.accent, { opacity: 0.04 }));
  add(circle(W / 2, mapY + mapH / 2 - 10, 60, C.accent, { opacity: 0.06 }));

  // Topic nodes (positioned in cluster layout)
  const nodes = [
    { label: 'AI', signals: 89, r: 48, x: W / 2, y: mapY + mapH / 2 - 10, col: C.accent, active: true },
    { label: 'Markets', signals: 45, r: 34, x: W / 2 - 95, y: mapY + 100, col: C.accent2 },
    { label: 'Policy', signals: 31, r: 29, x: W / 2 + 90, y: mapY + 95, col: C.accent3 },
    { label: 'Tech', signals: 27, r: 26, x: W / 2 - 80, y: mapY + 260, col: C.green },
    { label: 'Health', signals: 18, r: 22, x: W / 2 + 85, y: mapY + 275, col: '#F472B6' },
    { label: 'Energy', signals: 12, r: 18, x: W / 2 - 20, y: mapY + 340, col: '#FB923C' },
    { label: 'Defense', signals: 8, r: 14, x: W / 2 + 30, y: mapY + 155, col: C.red },
  ];

  // Connection lines (from AI center to clusters)
  nodes.slice(1).forEach(n => {
    add(line(nodes[0].x, nodes[0].y, n.x, n.y, n.col, { sw: 1, opacity: 0.2 }));
  });

  // Draw nodes
  nodes.forEach(n => {
    // Outer ring
    add(circle(n.x, n.y, n.r + 8, n.col, { opacity: 0.08 }));
    // Main circle
    add(circle(n.x, n.y, n.r, n.col, { opacity: n.active ? 0.25 : 0.15 }));
    // Inner
    add(circle(n.x, n.y, n.r * 0.6, n.col, { opacity: n.active ? 0.5 : 0.3 }));
    // Label
    add(text(n.x, n.y + 4, n.label, n.active ? 13 : 11, n.active ? C.white : n.col, { fw: n.active ? 800 : 600, anchor: 'middle' }));
    if (n.active) add(text(n.x, n.y + 20, String(n.signals), 10, C.white, { anchor: 'middle', opacity: 0.8 }));
  });

  // Extra pulse rings around center node
  add(circle(nodes[0].x, nodes[0].y, nodes[0].r + 20, C.accent, { opacity: 0.04 }));
  add(circle(nodes[0].x, nodes[0].y, nodes[0].r + 36, C.accent, { opacity: 0.025 }));

  // Legend
  const legendY = mapY + mapH + 18;
  add(text(16, legendY + 14, '● Circle size = signal volume', 11, C.textDim, { opacity: 0.7 }));
  add(text(W - 16, legendY + 14, 'Active: AI ↑', 11, C.accent, { anchor: 'end', fw: 600 }));

  // Topic list below
  const listStartY = legendY + 30;
  const topTopics = nodes.slice(0, 4);
  add(text(16, listStartY + 14, 'TOP TOPICS', 10, C.textDim, { fw: 700, ls: 2 }));
  topTopics.forEach((t, i) => {
    const ty = listStartY + 28 + i * 44;
    add(rect(16, ty, W - 32, 36, C.card, { rx: 10 }));
    add(circle(36, ty + 18, 8, t.col, { opacity: 0.7 }));
    add(text(52, ty + 22, t.label, 13, C.text, { fw: 600 }));
    add(text(W - 20, ty + 22, String(t.signals) + ' signals', 11, t.col, { anchor: 'end', fw: 500 }));
    // Progress bar
    const pct = t.signals / nodes[0].signals;
    add(rect(52, ty + 30, (W - 80) * pct, 2, t.col, { rx: 1, opacity: 0.5 }));
    add(rect(52, ty + 30, W - 80, 2, t.col, { rx: 1, opacity: 0.1 }));
  });

  bottomNav(2);
  return sc;
}

// ─── SCREEN 4: Insight Detail ──────────────────────────────────────────────
function buildScreen4() {
  sc = [];
  add(rect(0, 0, W, H, C.bg));
  add(circle(300, 150, 110, C.accent, { opacity: 0.035 }));
  add(circle(80, 500, 85, C.red, { opacity: 0.025 }));
  statusBar();

  // Back nav
  add(rect(0, 44, W, 52, C.bg));
  add(text(20, 74, '← Feed', 13, C.textDim, { fw: 500 }));
  add(text(W - 20, 74, '⊞', 20, C.textDim, { anchor: 'end' }));

  // Topic badge + time
  add(rect(20, 106, 38, 22, C.accent, { rx: 11, opacity: 0.2 }));
  add(text(39, 122, 'AI', 10, C.accent, { fw: 700, anchor: 'middle', ls: 0.5 }));
  add(text(68, 122, '·', 12, C.textDim));
  add(text(76, 122, 'TechCrunch', 11, C.textDim));
  add(text(W - 20, 122, '4m ago', 11, C.textDim, { anchor: 'end' }));

  // Score badge (large)
  add(rect(W - 56, 136, 44, 26, C.red, { rx: 13, opacity: 0.15 }));
  add(text(W - 34, 153, '98', 12, C.red, { fw: 800, anchor: 'middle' }));
  add(circle(W - 18, 143, 5, C.red, { opacity: 0.7 })); // pulsing dot

  // Headline
  add(text(20, 150, 'GPT-5 multimodal API', 19, C.white, { fw: 800 }));
  add(text(20, 172, 'now in public beta', 19, C.white, { fw: 800 }));

  // Divider
  add(line(20, 186, W - 20, 186, C.stroke, { sw: 1 }));

  // AI Summary label
  add(rect(20, 196, 82, 22, C.accent, { rx: 11, opacity: 0.15 }));
  add(circle(34, 207, 5, C.accent, { opacity: 0.8 }));
  add(text(44, 212, 'AI Summary', 10, C.accent, { fw: 600 }));

  // Summary paragraphs
  const summaryLines = [
    'OpenAI has released GPT-5 into public beta with',
    'full multimodal capabilities including real-time',
    'vision and audio processing in a single unified',
    'API. Developers report a significant capability',
    'leap over GPT-4o, particularly in agentic tasks.',
  ];
  summaryLines.forEach((l, i) => {
    add(text(20, 234 + i * 18, l, 13, C.text, { opacity: 0.9 }));
  });

  // Key quotes
  add(line(20, 340, W - 20, 340, C.stroke, { sw: 1, opacity: 0.5 }));
  add(rect(20, 350, 3, 60, C.accent2, { rx: 2 }));
  add(text(32, 368, '"This changes the entire agentic stack.', 12, C.textDim, { opacity: 0.8 }));
  add(text(32, 386, 'Nothing looks the same after GPT-5."', 12, C.textDim, { opacity: 0.8 }));
  add(text(32, 404, '— Andrej Karpathy, X', 11, C.accent2, { fw: 500, opacity: 0.8 }));

  // Related signals
  add(line(20, 422, W - 20, 422, C.stroke, { sw: 1, opacity: 0.5 }));
  sectionHeader(20, 432, 'Related Signals');
  const related = [
    { t: 'Claude 4 Opus benchmark results surface', ago: '1h', col: C.accent },
    { t: 'Gemini Ultra 2 API pricing cut by 40%', ago: '3h', col: C.green },
  ];
  related.forEach((r, i) => {
    const ry = 462 + i * 52;
    add(rect(20, ry, W - 40, 44, C.card, { rx: 10 }));
    add(circle(36, ry + 22, 5, r.col, { opacity: 0.8 }));
    add(text(50, ry + 18, r.t, 11.5, C.text, { fw: 500 }));
    add(text(50, ry + 34, r.ago + ' ago', 10, C.textDim, { opacity: 0.6 }));
  });

  // Metadata row (reading time, views, bookmark)
  add(line(20, 568, W - 20, 568, C.stroke, { sw: 1, opacity: 0.4 }));
  add(text(20, 585, '⏱ 2 min read', 11, C.textDim, { opacity: 0.65 }));
  add(text(120, 585, '· 1.2K views', 11, C.textDim, { opacity: 0.65 }));
  add(text(W - 20, 585, '🔖 Save', 11, C.accent, { anchor: 'end', fw: 500 }));

  // Add to brief button
  add(rect(20, 598, W - 40, 48, C.accent, { rx: 14 }));
  add(rect(20, 598, W - 40, 48, C.white, { rx: 14, opacity: 0.05 }));
  add(text(W / 2, 627, '+ Add to Brief', 14, C.white, { fw: 700, anchor: 'middle' }));
  // Secondary share button
  add(rect(20, 655, W - 40, 40, C.card, { rx: 12 }));
  add(text(W / 2, 679, '↗ Share Signal', 13, C.textDim, { anchor: 'middle', fw: 500 }));

  bottomNav(1);
  return sc;
}

// ─── SCREEN 5: Brief Builder ───────────────────────────────────────────────
function buildScreen5() {
  sc = [];
  add(rect(0, 0, W, H, C.bg));
  add(circle(340, 200, 120, C.accent2, { opacity: 0.03 }));
  add(circle(50, 650, 80, C.accent, { opacity: 0.025 }));
  statusBar();

  // Header
  add(rect(0, 44, W, 56, C.bg));
  add(text(20, 78, 'Brief Builder', 20, C.white, { fw: 700 }));

  // Generate CTA button (top right)
  add(rect(W - 114, 58, 98, 32, C.accent2, { rx: 16 }));
  add(text(W - 65, 79, '⚡ Generate', 12, C.bg, { fw: 700, anchor: 'middle' }));

  // Time range selector
  let nextY = 112;
  add(text(20, nextY + 14, 'TIME RANGE', 10, C.textDim, { fw: 700, ls: 2 }));
  const ranges = ['Today', '7 Days', '30 Days', 'Custom'];
  let rx2 = 20;
  ranges.forEach((r, i) => {
    const rw = r.length * 8 + 20;
    add(rect(rx2, nextY + 24, rw, 28, i === 1 ? C.accent : C.card, { rx: 14 }));
    add(text(rx2 + rw / 2, nextY + 42, r, 11, i === 1 ? C.white : C.textDim, { anchor: 'middle', fw: i === 1 ? 700 : 400 }));
    rx2 += rw + 8;
  });
  nextY += 62;

  // Topics included
  add(text(20, nextY + 14, 'TOPICS INCLUDED', 10, C.textDim, { fw: 700, ls: 2 }));
  const topics = [
    { t: 'AI', col: C.accent, active: true },
    { t: 'Markets', col: C.accent2, active: true },
    { t: 'Policy', col: C.accent3, active: false },
    { t: 'Tech', col: C.green, active: true },
    { t: 'Health', col: '#F472B6', active: false },
  ];
  let tx = 20;
  topics.forEach(tp => {
    const tw = tp.t.length * 8 + 22;
    add(rect(tx, nextY + 26, tw, 26, tp.col, { rx: 13, opacity: tp.active ? 0.2 : 0.08 }));
    add(text(tx + tw / 2, nextY + 43, tp.t, 11, tp.active ? tp.col : C.textDim, { anchor: 'middle', fw: tp.active ? 700 : 400 }));
    tx += tw + 8;
  });
  nextY += 64;

  // Brief preview
  add(text(20, nextY + 14, 'BRIEF PREVIEW', 10, C.textDim, { fw: 700, ls: 2 }));
  nextY += 28;

  // Brief card
  add(rect(20, nextY, W - 40, 340, C.card, { rx: 16 }));

  // Brief header
  add(rect(20, nextY, W - 40, 44, C.accent, { rx: 16, opacity: 0.15 }));
  add(circle(38, nextY + 22, 6, C.accent, { opacity: 0.8 }));
  add(text(52, nextY + 26, 'Intelligence Brief — Apr 9, 2026', 12, C.text, { fw: 700 }));

  const sections = [
    { icon: '▲', label: 'Executive Summary', lines: ['AI landscape shift as GPT-5 enters beta.', 'Markets rally on chip demand surge.'] },
    { icon: '◈', label: 'Key Signals (31)', lines: ['Critical: 3  ·  High: 8  ·  Med: 12  ·  Low: 8'] },
    { icon: '◉', label: 'Top Insight', lines: ['GPT-5 multimodal API signals agent-first', 'development paradigm shift by H2 2026.'] },
  ];

  let briefY = nextY + 52;
  sections.forEach((s, i) => {
    if (i > 0) add(line(28, briefY, W - 28, briefY, C.stroke, { sw: 1, opacity: 0.5 }));
    briefY += 8;
    add(text(28, briefY + 14, s.icon, 11, C.accent, { fw: 700 }));
    add(text(44, briefY + 14, s.label, 12, C.text, { fw: 600 }));
    s.lines.forEach((l, j) => add(text(28, briefY + 30 + j * 16, l, 11, C.textDim, { opacity: 0.8 })));
    briefY += 24 + s.lines.length * 16 + 10;
  });

  // Additional context in brief
  add(line(28, briefY, W - 28, briefY, C.stroke, { sw: 1, opacity: 0.5 }));
  briefY += 8;
  add(text(28, briefY + 14, '⬡', 11, C.green, { fw: 700 }));
  add(text(44, briefY + 14, 'Trending', 12, C.text, { fw: 600 }));
  add(text(28, briefY + 30, 'Agentic AI development up 340% vs Q1', 11, C.textDim, { opacity: 0.8 }));
  briefY += 52;

  // Action buttons
  const btnY = nextY + 350;
  add(rect(20, btnY, (W - 52) / 2, 46, C.card2, { rx: 14 }));
  add(text(20 + (W - 52) / 4, btnY + 27, '⬇ Export PDF', 13, C.text, { anchor: 'middle', fw: 600 }));
  add(rect(20 + (W - 52) / 2 + 12, btnY, (W - 52) / 2, 46, C.accent, { rx: 14 }));
  add(text(20 + (W - 52) * 0.75 + 12, btnY + 27, '↗ Share Brief', 13, C.white, { anchor: 'middle', fw: 600 }));

  bottomNav(3);
  return sc;
}

// ─── SCREEN 6: Profile / Settings ─────────────────────────────────────────
function buildScreen6() {
  sc = [];
  add(rect(0, 0, W, H, C.bg));
  add(circle(340, 120, 90, C.accent, { opacity: 0.04 }));
  statusBar();

  // Header
  add(rect(0, 44, W, 56, C.bg));
  add(text(20, 78, 'Profile', 20, C.white, { fw: 700 }));
  add(text(W - 20, 78, '⚙', 20, C.textDim, { anchor: 'end' }));

  // User card
  add(rect(16, 108, W - 32, 92, C.card, { rx: 16 }));
  // Avatar
  add(circle(64, 154, 28, C.accent, { opacity: 0.2 }));
  add(circle(64, 154, 22, C.accent, { opacity: 0.5 }));
  add(text(64, 160, 'R', 20, C.white, { fw: 800, anchor: 'middle' }));
  // User info
  add(text(102, 148, 'Rakis', 17, C.white, { fw: 700 }));
  add(text(102, 166, 'rakis@torch.ai', 12, C.textDim, { opacity: 0.7 }));
  // Plan badge
  add(rect(W - 82, 143, 56, 22, C.accent2, { rx: 11, opacity: 0.2 }));
  add(text(W - 54, 158, '⚡ Pro', 11, C.accent2, { fw: 700, anchor: 'middle' }));

  // Stats row
  const statsY = 216;
  add(text(20, statsY + 14, 'YOUR ACTIVITY', 10, C.textDim, { fw: 700, ls: 2 }));
  const stats = [
    { label: 'Signals', value: '2.4K', col: C.accent },
    { label: 'Briefs', value: '37', col: C.accent2 },
    { label: 'Topics', value: '14', col: C.accent3 },
    { label: 'Streak', value: '21d', col: C.green },
  ];
  const sW = (W - 32 - 12) / 4;
  stats.forEach((s, i) => {
    const sx = 16 + i * (sW + 4);
    add(rect(sx, statsY + 28, sW, 66, C.card, { rx: 12 }));
    add(text(sx + sW / 2, statsY + 62, s.value, 20, s.col, { fw: 800, anchor: 'middle' }));
    add(text(sx + sW / 2, statsY + 80, s.label, 10, C.textDim, { anchor: 'middle' }));
  });

  // Settings sections
  let setY = statsY + 112;
  const settingGroups = [
    {
      header: 'Preferences',
      items: [
        { label: 'Alert sensitivity', value: 'High', hasToggle: false },
        { label: 'Push notifications', value: '', hasToggle: true, on: true },
        { label: 'Daily digest', value: '8:00 AM', hasToggle: false },
      ],
    },
    {
      header: 'Intelligence',
      items: [
        { label: 'AI model', value: 'Torch-Ultra', hasToggle: false },
        { label: 'Auto-brief generation', value: '', hasToggle: true, on: true },
      ],
    },
  ];

  settingGroups.forEach(g => {
    add(text(20, setY + 12, g.header.toUpperCase(), 10, C.textDim, { fw: 700, ls: 2 }));
    setY += 22;
    add(rect(16, setY, W - 32, g.items.length * 46, C.card, { rx: 14 }));
    g.items.forEach((item, j) => {
      const iy = setY + j * 46;
      add(text(28, iy + 28, item.label, 13, C.text, { fw: 500 }));
      if (item.hasToggle) {
        const onColor = item.on ? C.accent : C.textDim;
        add(rect(W - 68, iy + 17, 44, 24, onColor, { rx: 12, opacity: item.on ? 0.3 : 0.15 }));
        add(circle(item.on ? W - 30 : W - 50, iy + 29, 9, onColor, { opacity: 0.9 }));
      } else {
        add(text(W - 28, iy + 28, item.value, 12, C.textDim, { anchor: 'end', opacity: 0.7 }));
        add(text(W - 16, iy + 28, '›', 14, C.textDim, { anchor: 'end' }));
      }
      if (j < g.items.length - 1) {
        add(line(28, iy + 46, W - 28, iy + 46, C.stroke, { sw: 1, opacity: 0.5 }));
      }
    });
    setY += g.items.length * 46 + 16;
  });

  // Sign out
  add(rect(16, setY, W - 32, 46, C.red, { rx: 14, opacity: 0.1 }));
  add(text(W / 2, setY + 27, 'Sign Out', 14, C.red, { anchor: 'middle', fw: 600, opacity: 0.9 }));

  // Version info
  setY += 56;
  add(text(W / 2, setY, 'TORCH v2.4.1 — Intelligence. Illuminated.', 10, C.textDim, { anchor: 'middle', opacity: 0.4 }));

  bottomNav(4);
  return sc;
}

// ─── Assemble & write ─────────────────────────────────────────────────────
const screens = [
  { name: 'Command Center', elements: buildScreen1() },
  { name: 'Signal Feed',    elements: buildScreen2() },
  { name: 'Topic Map',      elements: buildScreen3() },
  { name: 'Insight Detail', elements: buildScreen4() },
  { name: 'Brief Builder',  elements: buildScreen5() },
  { name: 'Profile',        elements: buildScreen6() },
];

const totalEls = screens.reduce((s, sc) => s + sc.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name:      NAME,
    tagline:   TAGLINE,
    author:    'RAM',
    date:      new Date().toISOString().split('T')[0],
    theme:     'dark',
    heartbeat: 47,
    elements:  totalEls,
    archetype: 'ai-research-intelligence',
    palette: {
      bg:      C.bg,
      surface: C.surf,
      accent:  C.accent,
      accent2: C.accent2,
      text:    C.text,
    },
    inspiration: 'WyrVox torch-shadow (darkmodedesign.com), bento grid trend (saaspo/land-book), purple as AI color of 2026',
  },
  canvas: { width: W, height: H },
  screens: screens.map(s => ({
    name:     s.name,
    svg:      `<!-- ${s.name} -->`,
    elements: s.elements,
  })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalEls} elements`);
console.log(`Written: ${SLUG}.pen`);
