'use strict';
const fs = require('fs'), path = require('path');

const SLUG = 'ridge';
const HEARTBEAT = 45;
const W = 390, H = 844;

// ── Palette — editorial dark sport
// Inspired by: Mertana ski brand (Dribbble #1 saves) — full-viewport bold condensed type, deep black
// Nixtio beauty booking — terracotta on near-black (counterintuitive dark warmth)
const VOID   = '#030404';   // deep near-black (Mertana exactly)
const COAL   = '#111214';   // slightly lighter for cards
const SLATE  = '#1E2024';   // card surface
const TEXT   = '#FAFAFA';   // pure near-white
const MUTED  = '#888C96';   // cool gray muted
const BORDER = '#2A2D33';   // subtle border
const RUST   = '#C44B1E';   // rust/terracotta accent (Nixtio-inspired, Mertana's deep rust)
const EMBER  = '#E8622A';   // brighter ember for highlights
const SILVER = '#9A9C9F';   // cool silver (Mertana palette)
const SAND   = '#D4B89A';   // warm sand, desaturated terracotta for secondary text
const CREAM  = '#F0EBE3';   // near-white with warmth
const SAGE   = '#4A6057';   // dark sage for nature elements

function rect(x, y, w, h, fill, opts = {}) {
  return { type: 'rect', x, y, width: w, height: h, fill,
    ...(opts.rx !== undefined && { rx: opts.rx }),
    ...(opts.opacity !== undefined && { opacity: opts.opacity }),
    ...(opts.stroke && { stroke: opts.stroke }),
    ...(opts.sw !== undefined && { strokeWidth: opts.sw }) };
}
function text(x, y, content, size, fill, opts = {}) {
  return { type: 'text', x, y, content, fontSize: size, fill,
    ...(opts.fw && { fontWeight: opts.fw }),
    ...(opts.font && { fontFamily: opts.font }),
    ...(opts.anchor && { textAnchor: opts.anchor }),
    ...(opts.ls !== undefined && { letterSpacing: opts.ls }),
    ...(opts.opacity !== undefined && { opacity: opts.opacity }) };
}
function circle(cx, cy, r, fill, opts = {}) {
  return { type: 'circle', cx, cy, r, fill,
    ...(opts.opacity !== undefined && { opacity: opts.opacity }),
    ...(opts.stroke && { stroke: opts.stroke }),
    ...(opts.sw !== undefined && { strokeWidth: opts.sw }) };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return { type: 'line', x1, y1, x2, y2, stroke,
    ...(opts.sw !== undefined && { strokeWidth: opts.sw }),
    ...(opts.opacity !== undefined && { opacity: opts.opacity }) };
}

// Shared components
function statusBar(elements) {
  elements.push(rect(0, 0, W, 44, VOID));
  elements.push(text(16, 28, '9:41', 13, TEXT, { fw: '500' }));
  elements.push(text(374, 28, '●●●', 10, TEXT, { anchor: 'end', opacity: 0.45 }));
}

function bottomNav(elements, active = 0) {
  const items = [
    { label: 'Today', icon: '◉' },
    { label: 'Routes', icon: '⊟' },
    { label: 'Stats', icon: '◈' },
    { label: 'Kit', icon: '◇' },
    { label: 'You', icon: '◎' },
  ];
  elements.push(rect(0, H - 76, W, 76, COAL));
  elements.push(line(0, H - 76, W, H - 76, BORDER, { sw: 1 }));
  items.forEach((item, i) => {
    const x = 39 + i * 78;
    const isActive = i === active;
    elements.push(text(x, H - 50, item.icon, 18, isActive ? EMBER : SILVER, { anchor: 'middle' }));
    elements.push(text(x, H - 28, item.label, 10, isActive ? EMBER : SILVER, { anchor: 'middle', fw: isActive ? '600' : '400' }));
  });
}

function elevLabel(elements, x, y, label) {
  elements.push(text(x, y, label.toUpperCase(), 9, RUST, { fw: '700', ls: 2 }));
  elements.push(rect(x, y + 4, 24, 1.5, RUST, { opacity: 0.5 }));
}

// ───────────────────────────────────────────────────────────
// SCREEN 1: Today — hero dashboard with editorial type
// ───────────────────────────────────────────────────────────
function screen1() {
  const elements = [];
  elements.push(rect(0, 0, W, H, VOID));
  statusBar(elements);

  // RIDGE wordmark — full width editorial style (Mertana-inspired)
  elements.push(text(16, 82, 'RIDGE', 52, TEXT, { fw: '800', ls: -1 }));
  // Thin horizontal rule
  elements.push(line(16, 90, W - 16, 90, BORDER, { sw: 1 }));

  // Date + location
  elements.push(text(16, 108, 'Thursday, April 9', 12, MUTED));
  elements.push(text(W - 16, 108, '◉ Chamonix, FR', 12, RUST, { anchor: 'end' }));

  // ─── Hero metric block ───
  // Big editorial number — full attention
  elements.push(rect(16, 118, W - 32, 148, SLATE, { rx: 12, stroke: BORDER, sw: 1 }));
  // Rust accent stripe on left
  elements.push(rect(16, 118, 3, 148, RUST, { rx: 1.5 }));
  elevLabel(elements, 30, 130, 'Today\'s Goal');
  elements.push(text(30, 172, '21.4', 64, TEXT, { fw: '800', ls: -2 }));
  elements.push(text(168, 172, 'km', 22, RUST, { fw: '700' }));
  elements.push(text(30, 194, 'of 30km planned route · 71% complete', 12, MUTED));
  // Progress bar
  elements.push(rect(30, 204, W - 60, 6, BORDER, { rx: 3 }));
  elements.push(rect(30, 204, Math.round(0.71 * (W - 60)), 6, RUST, { rx: 3 }));
  elements.push(circle(30 + Math.round(0.71 * (W - 60)), 207, 6, EMBER));

  // Quick stats row — 3 metrics
  const stats = [
    { val: '1,840', unit: 'm', label: 'Elevation' },
    { val: '4:12', unit: 'h', label: 'Moving' },
    { val: '128', unit: 'bpm', label: 'Avg HR' },
  ];
  stats.forEach((s, i) => {
    const x = 16 + i * 120;
    elements.push(rect(x, 278, 112, 68, COAL, { rx: 10, stroke: BORDER, sw: 1 }));
    elements.push(text(x + 14, 308, s.val, 22, TEXT, { fw: '700' }));
    elements.push(text(x + 14 + s.val.length * 13, 302, s.unit, 12, RUST, { fw: '600' }));
    elements.push(text(x + 14, 330, s.label, 10, MUTED));
  });

  // ─── Today's run card ───
  elements.push(rect(16, 358, W - 32, 158, SLATE, { rx: 12, stroke: BORDER, sw: 1 }));
  elevLabel(elements, 30, 370, 'Active Run');
  elements.push(text(30, 392, 'Mer de Glace Descent', 17, TEXT, { fw: '700' }));
  elements.push(text(30, 410, 'Col des Grands Montets → Chamonix · 1h 22m left', 11, MUTED));

  // Elevation profile (simulated)
  elements.push(line(30, 450, W - 30, 450, BORDER, { sw: 1 }));
  const peaks = [120, 90, 140, 70, 110, 150, 80, 60, 100, 90, 40, 20];
  peaks.forEach((p, i) => {
    const px = 30 + i * ((W - 60) / 11);
    elements.push(rect(px, 450 - p, 24, p, RUST, { rx: 2, opacity: 0.15 + (i / 11) * 0.35 }));
    elements.push(line(px + 12, 450 - p, px + 12, 450, RUST, { sw: 1, opacity: 0.3 }));
  });
  // Current position marker
  const currentX = 30 + 7 * ((W - 60) / 11);
  elements.push(circle(currentX + 12, 450 - 80, 6, EMBER));

  // Bottom info row
  elements.push(text(30, 498, '⬆ 340m remaining', 11, SAND));
  elements.push(text(W - 30, 498, '5.8km to go', 11, SAND, { anchor: 'end' }));

  // ─── Conditions ───
  elements.push(rect(16, 526, W - 32, 52, COAL, { rx: 10, stroke: BORDER, sw: 1 }));
  elements.push(text(30, 546, '◈  Mountain conditions', 12, MUTED));
  elements.push(text(30, 562, '−4°C · Wind 18km/h NW · Trail: Icy above 2,100m', 12, SAND));

  // ─── Next split ───
  elements.push(rect(16, 588, W - 32, 62, COAL, { rx: 10, stroke: BORDER, sw: 1 }));
  elements.push(text(30, 608, 'Next checkpoint', 11, MUTED));
  elements.push(text(30, 626, 'Refuge de la Mer de Glace · 2.1km · est. 24min', 13, TEXT, { fw: '500' }));
  elements.push(text(W - 30, 617, '→', 18, RUST, { anchor: 'end' }));

  // ─── Quick actions ───
  elements.push(rect(16, 660, W - 32, 44, RUST, { rx: 10 }));
  elements.push(text(W / 2, 688, '⏱  Log Split', 16, TEXT, { anchor: 'middle', fw: '700' }));
  elements.push(rect(16, 714, W - 32, 36, COAL, { rx: 8, stroke: BORDER, sw: 1 }));
  elements.push(text(W / 2, 737, '⏹  End Activity', 13, MUTED, { anchor: 'middle' }));

  bottomNav(elements, 0);
  return elements;
}

// ─────────────────────────────────────────────────────────
// SCREEN 2: Routes — editorial route discovery
// ─────────────────────────────────────────────────────────
function screen2() {
  const elements = [];
  elements.push(rect(0, 0, W, H, VOID));
  statusBar(elements);

  // Header — editorial full-width headline
  elements.push(line(16, 54, W - 16, 54, BORDER, { sw: 1 }));
  elements.push(text(16, 78, 'ROUTES', 40, TEXT, { fw: '800', ls: -1 }));
  elements.push(text(16, 98, 'Chamonix region · 847 available', 12, MUTED));
  elements.push(line(16, 106, W - 16, 106, BORDER, { sw: 1 }));

  // Filter row
  const filters = [
    { label: 'All', active: true },
    { label: 'Running', active: false },
    { label: 'Hiking', active: false },
    { label: 'Via Ferrata', active: false },
    { label: 'Ski', active: false },
  ];
  let fx = 16;
  filters.forEach(f => {
    const w = f.label.length * 7.5 + 18;
    elements.push(rect(fx, 116, w, 26, f.active ? RUST : COAL, { rx: 13, stroke: f.active ? 'none' : BORDER, sw: 1 }));
    elements.push(text(fx + w / 2, 133, f.label, 11, f.active ? TEXT : SILVER, { anchor: 'middle', fw: f.active ? '700' : '400' }));
    fx += w + 8;
  });

  // Featured route card (large)
  elements.push(rect(16, 152, W - 32, 196, SLATE, { rx: 12, stroke: BORDER, sw: 1 }));
  // Terrain visualization — jagged mountain silhouette
  elements.push(rect(16, 152, W - 32, 120, COAL, { rx: 12 }));
  // Mountain peaks
  const mountainPts = [
    [16, 272], [80, 190], [140, 215], [200, 170], [250, 195], [310, 165], [374, 210], [374, 272]
  ];
  for (let i = 0; i < mountainPts.length - 1; i++) {
    elements.push(line(mountainPts[i][0], mountainPts[i][1], mountainPts[i + 1][0], mountainPts[i + 1][1], SLATE, { sw: 2 }));
  }
  // Ridge line
  elements.push(line(16, 218, W - 16, 218, RUST, { sw: 1, opacity: 0.3 }));
  // Difficulty tag
  elements.push(rect(28, 164, 62, 20, RUST, { rx: 10, opacity: 0.9 }));
  elements.push(text(59, 178, 'EXPERT', 9, TEXT, { anchor: 'middle', fw: '700', ls: 1 }));
  // Gradient tag
  elements.push(rect(98, 164, 50, 20, COAL, { rx: 10, stroke: BORDER, sw: 1 }));
  elements.push(text(123, 178, '+2,400m', 9, SAND, { anchor: 'middle', fw: '600' }));
  // Route info
  elements.push(text(30, 296, 'Tour du Mont Blanc — Day 1', 15, TEXT, { fw: '700' }));
  elements.push(text(30, 314, 'Les Houches → Les Contamines', 11, MUTED));
  elements.push(text(30, 330, '22.4km  ·  ↑ 1,480m  ·  ↓ 920m  ·  7–9h', 11, SAND));
  elements.push(text(W - 30, 305, '★ 4.9', 13, RUST, { anchor: 'end', fw: '700' }));
  elements.push(text(W - 30, 323, '2,847 completions', 10, MUTED, { anchor: 'end' }));

  // Route list
  const routes = [
    { name: 'Aiguille du Midi to Chamonix', dist: '8.2km', elev: '+680m', grade: 'Hard', time: '3–4h', rating: '4.8', tag: 'Running' },
    { name: 'Lac Blanc Circuit', dist: '14.1km', elev: '+920m', grade: 'Moderate', time: '5–6h', rating: '4.9', tag: 'Hiking' },
    { name: 'Flégère to Planpraz', dist: '6.8km', elev: '+520m', grade: 'Moderate', time: '2–3h', rating: '4.7', tag: 'Running' },
    { name: 'Grand Balcon Nord', dist: '19.3km', elev: '+1,200m', grade: 'Hard', time: '6–8h', rating: '4.8', tag: 'Running' },
  ];

  routes.forEach((r, i) => {
    const y = 360 + i * 98;
    elements.push(rect(16, y, W - 32, 88, COAL, { rx: 10, stroke: BORDER, sw: 1 }));
    // Rust grade stripe
    const gradeColor = r.grade === 'Hard' ? RUST : r.grade === 'Expert' ? EMBER : SAGE;
    elements.push(rect(16, y, 3, 88, gradeColor, { rx: 1.5 }));
    // Elevation mini bars
    for (let b = 0; b < 5; b++) {
      const bh = 8 + (Math.sin(b + i) + 1) * 14;
      elements.push(rect(W - 22 - b * 14, y + 52 - bh, 10, bh, gradeColor, { rx: 2, opacity: 0.15 + b * 0.08 }));
    }
    elements.push(text(30, y + 24, r.name, 13, TEXT, { fw: '600' }));
    elements.push(text(30, y + 42, r.dist + '  ·  ' + r.elev + '  ·  ' + r.time, 11, MUTED));
    // Tags
    accentPill(elements, 30, y + 56, r.tag, gradeColor);
    elements.push(text(W - 30, y + 32, '★ ' + r.rating, 12, RUST, { anchor: 'end', fw: '700' }));
    elements.push(text(W - 30, y + 50, r.grade, 10, gradeColor, { anchor: 'end' }));
    elements.push(text(W - 30, y + 66, '→', 16, SILVER, { anchor: 'end', opacity: 0.5 }));
  });

  bottomNav(elements, 1);
  return elements;
}

function accentPill(elements, x, y, label, color) {
  const w = label.length * 7 + 16;
  elements.push(rect(x, y, w, 20, color, { rx: 10, opacity: 0.12 }));
  elements.push(text(x + w / 2, y + 14, label, 9, color, { anchor: 'middle', fw: '600', ls: 0.5 }));
}

// ─────────────────────────────────────────────────────────
// SCREEN 3: Route Detail — before the run
// ─────────────────────────────────────────────────────────
function screen3() {
  const elements = [];
  elements.push(rect(0, 0, W, H, VOID));
  statusBar(elements);

  elements.push(text(16, 72, '←', 18, TEXT));
  elements.push(text(W / 2, 72, 'Route', 15, TEXT, { fw: '600', anchor: 'middle' }));
  elements.push(text(W - 16, 72, '↑ Share', 13, RUST, { anchor: 'end', fw: '600' }));

  // Difficulty badge + grade
  accentPill(elements, 16, 84, 'EXPERT', RUST);
  elements.push(rect(76, 84, 54, 20, COAL, { rx: 10, stroke: BORDER, sw: 1 }));
  elements.push(text(103, 98, '★ 4.9', 10, RUST, { anchor: 'middle', fw: '700' }));

  // Route name — editorial large
  elements.push(text(16, 130, 'Tour du', 36, TEXT, { fw: '800', ls: -1 }));
  elements.push(text(16, 168, 'Mont Blanc', 36, TEXT, { fw: '800', ls: -1 }));
  elements.push(text(16, 188, 'Day 1 — Les Houches to Les Contamines', 12, MUTED));

  // ─── Stats grid ───
  elements.push(line(16, 200, W - 16, 200, BORDER, { sw: 1 }));
  const kstats = [
    ['22.4km', 'Distance'],
    ['↑ 1,480m', 'Climb'],
    ['↓ 920m', 'Descent'],
    ['7–9h', 'Duration'],
  ];
  kstats.forEach((s, i) => {
    const x = 16 + i * 92;
    elements.push(text(x + 4, 226, s[0], 14, TEXT, { fw: '700' }));
    elements.push(text(x + 4, 244, s[1], 10, MUTED));
    if (i < 3) elements.push(line(x + 88, 210, x + 88, 250, BORDER, { sw: 1 }));
  });
  elements.push(line(16, 252, W - 16, 252, BORDER, { sw: 1 }));

  // ─── Elevation profile ───
  elevLabel(elements, 16, 266, 'Elevation Profile');
  elements.push(rect(16, 282, W - 32, 90, COAL, { rx: 8, stroke: BORDER, sw: 1 }));
  // Area fill
  const profPts = [0, 30, 55, 80, 68, 85, 75, 90, 70, 60, 40, 20, 10, 0];
  const PW = W - 52;
  profPts.forEach((h, i) => {
    const px = 24 + i * (PW / (profPts.length - 1));
    const pH = Math.round((h / 90) * 64);
    elements.push(rect(px, 330 - pH, PW / (profPts.length - 1) - 2, pH, RUST, { opacity: 0.12 }));
  });
  // Profile line
  for (let i = 0; i < profPts.length - 1; i++) {
    const x1 = 24 + i * (PW / (profPts.length - 1));
    const x2 = 24 + (i + 1) * (PW / (profPts.length - 1));
    const y1 = 330 - Math.round((profPts[i] / 90) * 64);
    const y2 = 330 - Math.round((profPts[i + 1] / 90) * 64);
    elements.push(line(x1, y1, x2, y2, RUST, { sw: 2 }));
  }
  // Axis labels
  elements.push(text(24, 340, 'Les Houches 1,004m', 8, SILVER, { opacity: 0.7 }));
  elements.push(text(W - 24, 340, 'Les Contamines 1,160m', 8, SILVER, { anchor: 'end', opacity: 0.7 }));
  elements.push(text(24, 286, '2,487m', 8, SAND, { opacity: 0.7 }));

  // ─── Key waypoints ───
  elevLabel(elements, 16, 358, 'Waypoints');
  const waypoints = [
    { name: 'Col de Tricot', alt: '2,120m', dist: '8.2km', type: 'Col' },
    { name: 'Refuge de Miage', alt: '1,550m', dist: '14.7km', type: 'Refuge' },
    { name: 'Col du Bonhomme', alt: '2,487m', dist: '19.8km', type: 'Col', highlight: true },
    { name: 'Les Contamines', alt: '1,160m', dist: '22.4km', type: 'Finish' },
  ];
  waypoints.forEach((w, i) => {
    const y = 374 + i * 56;
    elements.push(rect(16, y, W - 32, 48, COAL, { rx: 8, stroke: w.highlight ? RUST : BORDER, sw: w.highlight ? 1.5 : 1 }));
    // Waypoint number
    elements.push(circle(32, y + 24, 10, w.highlight ? RUST : SLATE, { opacity: w.highlight ? 1 : 1 }));
    elements.push(text(32, y + 29, String(i + 1), 10, w.highlight ? TEXT : SILVER, { anchor: 'middle', fw: '700' }));
    elements.push(text(48, y + 20, w.name, 13, TEXT, { fw: w.highlight ? '700' : '500' }));
    elements.push(text(48, y + 36, w.alt + '  ·  at ' + w.dist, 10, MUTED));
    elements.push(text(W - 24, y + 20, w.type, 10, w.highlight ? RUST : SILVER, { anchor: 'end', fw: '600' }));
    elements.push(text(W - 24, y + 36, '→', 14, SILVER, { anchor: 'end', opacity: 0.4 }));
  });

  // ─── Gear check ───
  elements.push(rect(16, 602, W - 32, 48, SLATE, { rx: 10, stroke: RUST, sw: 1 }));
  elements.push(rect(16, 602, 3, 48, RUST, { rx: 1.5 }));
  elements.push(text(30, 622, 'Gear check required for this route', 12, TEXT, { fw: '600' }));
  elements.push(text(30, 638, 'Crampons, ice axe · Conditions forecast: icy', 11, SAND));

  // ─── Start CTA ───
  elements.push(rect(16, 660, W - 32, 50, RUST, { rx: 12 }));
  elements.push(text(W / 2, 691, 'Start Route Navigation →', 15, TEXT, { anchor: 'middle', fw: '700' }));

  elements.push(rect(16, 720, W - 32, 36, COAL, { rx: 8, stroke: BORDER, sw: 1 }));
  elements.push(text(W / 2, 743, '↓  Download for Offline', 13, SILVER, { anchor: 'middle' }));

  bottomNav(elements, 1);
  return elements;
}

// ─────────────────────────────────────────────────────────
// SCREEN 4: Stats — weekly training overview
// ─────────────────────────────────────────────────────────
function screen4() {
  const elements = [];
  elements.push(rect(0, 0, W, H, VOID));
  statusBar(elements);

  // Editorial header
  elements.push(line(16, 54, W - 16, 54, BORDER, { sw: 1 }));
  elements.push(text(16, 82, 'STATS', 40, TEXT, { fw: '800', ls: -1 }));
  elements.push(text(W - 16, 70, 'This Week', 11, MUTED, { anchor: 'end' }));
  elements.push(text(W - 16, 86, '↓ 3–9 April', 11, RUST, { anchor: 'end', fw: '600' }));
  elements.push(line(16, 96, W - 16, 96, BORDER, { sw: 1 }));

  // Weekly summary bar chart (days)
  elevLabel(elements, 16, 110, 'Daily Distance (km)');
  const days = [
    { day: 'M', km: 12.4, active: false },
    { day: 'T', km: 0, active: false },
    { day: 'W', km: 18.8, active: false },
    { day: 'T', km: 8.2, active: false },
    { day: 'F', km: 21.4, active: true },
    { day: 'S', km: 0, active: false },
    { day: 'S', km: 0, active: false },
  ];
  const maxKm = 25;
  const chartH = 80;
  const barW = 38;
  const barGap = (W - 32 - 7 * barW) / 6;
  days.forEach((d, i) => {
    const bh = Math.round((d.km / maxKm) * chartH);
    const bx = 16 + i * (barW + barGap);
    const by = 200 - bh;
    if (bh > 0) {
      elements.push(rect(bx, by, barW, bh, d.active ? RUST : SLATE, { rx: 4, stroke: d.active ? 'none' : BORDER, sw: 1 }));
      elements.push(text(bx + barW / 2, by - 6, d.km.toFixed(1), 9, d.active ? EMBER : MUTED, { anchor: 'middle' }));
    } else {
      elements.push(rect(bx, 197, barW, 3, SLATE, { rx: 1.5 }));
    }
    elements.push(text(bx + barW / 2, 212, d.day, 10, d.active ? RUST : SILVER, { anchor: 'middle', fw: d.active ? '700' : '400' }));
  });

  // Weekly totals
  const wstats = [
    ['60.8', 'km', 'Distance'],
    ['3,420', 'm', 'Elevation'],
    ['11:04', 'h', 'Moving Time'],
    ['3', '', 'Activities'],
  ];
  wstats.forEach((s, i) => {
    const x = 16 + i * ((W - 32) / 4);
    const w = (W - 32) / 4 - 4;
    elements.push(rect(x, 222, w, 62, COAL, { rx: 8, stroke: BORDER, sw: 1 }));
    elements.push(text(x + w / 2, 248, s[0], 18, TEXT, { anchor: 'middle', fw: '700' }));
    elements.push(text(x + w / 2 + s[0].length * 5, 242, s[1], 11, RUST, { fw: '600' }));
    elements.push(text(x + w / 2, 266, s[2], 9, MUTED, { anchor: 'middle' }));
  });

  // HR zones
  elevLabel(elements, 16, 300, 'HR Zones — This Week');
  const zones = [
    { name: 'Zone 1 — Recovery', pct: 8, color: SAGE },
    { name: 'Zone 2 — Aerobic', pct: 42, color: SAND },
    { name: 'Zone 3 — Tempo', pct: 31, color: EMBER },
    { name: 'Zone 4 — Threshold', pct: 14, color: RUST },
    { name: 'Zone 5 — Max', pct: 5, color: TEXT },
  ];
  zones.forEach((z, i) => {
    const y = 316 + i * 40;
    elements.push(text(16, y + 16, z.name, 11, SILVER));
    elements.push(rect(170, y + 6, W - 186, 10, BORDER, { rx: 5 }));
    elements.push(rect(170, y + 6, Math.round((z.pct / 100) * (W - 186)), 10, z.color, { rx: 5, opacity: 0.8 }));
    elements.push(text(W - 16, y + 16, z.pct + '%', 10, z.color, { anchor: 'end', fw: '600' }));
  });

  // Recent activities
  elevLabel(elements, 16, 522, 'Recent Activities');
  const acts = [
    { name: 'Mer de Glace Descent', date: 'Today', dist: '21.4km', elev: '↑ 1,840m', pace: '6:12/km' },
    { name: 'Grand Balcon Nord', date: 'Wednesday', dist: '18.8km', elev: '↑ 1,200m', pace: '5:58/km' },
    { name: 'Aiguille du Midi Run', date: 'Monday', dist: '12.4km', elev: '↑ 680m', pace: '6:34/km' },
  ];
  acts.forEach((a, i) => {
    const y = 540 + i * 82;
    elements.push(rect(16, y, W - 32, 74, COAL, { rx: 10, stroke: BORDER, sw: 1 }));
    elements.push(rect(16, y, 3, 74, RUST, { rx: 1.5 }));
    elements.push(text(30, y + 22, a.name, 13, TEXT, { fw: '600' }));
    elements.push(text(30, y + 40, a.date, 11, MUTED));
    elements.push(text(30, y + 58, a.dist + '  ·  ' + a.elev + '  ·  ' + a.pace, 11, SAND));
    elements.push(text(W - 30, y + 36, '→', 18, SILVER, { anchor: 'end', opacity: 0.4 }));
  });

  bottomNav(elements, 2);
  return elements;
}

// ─────────────────────────────────────────────────────────
// SCREEN 5: Gear — kit tracker + condition log
// ─────────────────────────────────────────────────────────
function screen5() {
  const elements = [];
  elements.push(rect(0, 0, W, H, VOID));
  statusBar(elements);

  elements.push(line(16, 54, W - 16, 54, BORDER, { sw: 1 }));
  elements.push(text(16, 82, 'KIT', 40, TEXT, { fw: '800', ls: -1 }));
  elements.push(text(16, 100, 'Gear tracking · worn km · service logs', 12, MUTED));
  elements.push(line(16, 108, W - 16, 108, BORDER, { sw: 1 }));

  // Shoe rotation — primary gear tracking
  elevLabel(elements, 16, 122, 'Shoe Rotation');
  const shoes = [
    { brand: 'Hoka', model: 'Speedgoat 5', km: 487, maxKm: 800, color: RUST, status: 'Primary', lastRun: 'Today' },
    { brand: 'Salomon', model: 'Sense Ride 5', km: 312, maxKm: 600, color: SAGE, status: 'Training', lastRun: '3 days ago' },
    { brand: 'La Sportiva', model: 'Bushido III', km: 628, maxKm: 700, color: EMBER, status: 'Race', lastRun: '2 weeks ago' },
  ];
  shoes.forEach((s, i) => {
    const y = 138 + i * 92;
    elements.push(rect(16, y, W - 32, 82, COAL, { rx: 10, stroke: BORDER, sw: 1 }));
    elements.push(rect(16, y, 3, 82, s.color, { rx: 1.5 }));
    // Worn indicator
    const pct = s.km / s.maxKm;
    const warnColor = pct > 0.85 ? EMBER : pct > 0.6 ? RUST : SAGE;
    elements.push(rect(W - 60, y + 12, 44, 18, warnColor, { rx: 9, opacity: 0.12 }));
    elements.push(text(W - 38, y + 25, s.status, 9, warnColor, { anchor: 'middle', fw: '600' }));
    elements.push(text(30, y + 24, s.brand + ' ' + s.model, 14, TEXT, { fw: '700' }));
    elements.push(text(30, y + 42, s.km + 'km of ' + s.maxKm + 'km · last worn ' + s.lastRun, 11, MUTED));
    elements.push(rect(30, y + 56, W - 60, 8, BORDER, { rx: 4 }));
    elements.push(rect(30, y + 56, Math.round(pct * (W - 60)), 8, warnColor, { rx: 4, opacity: 0.8 }));
    elements.push(text(W - 26, y + 64, Math.round(pct * 100) + '%', 9, warnColor, { anchor: 'end' }));
  });

  // Service log
  elevLabel(elements, 16, 420, 'Upcoming Service');
  const services = [
    { item: 'Crampons sharpening', due: 'Due in 2 runs', urgent: true },
    { item: 'Harness inspection', due: 'Due in 3 months', urgent: false },
    { item: 'Headlamp battery', due: 'Due now', urgent: true },
    { item: 'GPS battery calibration', due: 'Overdue', urgent: true },
  ];
  services.forEach((s, i) => {
    const y = 436 + i * 54;
    const col = s.urgent ? RUST : SILVER;
    elements.push(rect(16, y, W - 32, 46, COAL, { rx: 8, stroke: s.urgent ? RUST : BORDER, sw: s.urgent ? 1 : 1, opacity: 1 }));
    elements.push(circle(32, y + 23, 7, col, { opacity: 0.15 }));
    elements.push(text(32, y + 28, s.urgent ? '!' : '◎', 10, col, { anchor: 'middle', fw: '700' }));
    elements.push(text(46, y + 21, s.item, 13, TEXT, { fw: '500' }));
    elements.push(text(46, y + 35, s.due, 10, col, { fw: s.urgent ? '600' : '400' }));
    elements.push(text(W - 24, y + 23, '→', 14, SILVER, { anchor: 'end', opacity: 0.4 }));
  });

  // Pack weight tracker
  elevLabel(elements, 16, 660, 'Pack Weight');
  elements.push(rect(16, 676, W - 32, 56, SLATE, { rx: 10, stroke: BORDER, sw: 1 }));
  elements.push(text(30, 700, 'Race pack (today)', 12, TEXT, { fw: '600' }));
  elements.push(text(30, 718, '6.2kg — 0.4kg over target', 12, EMBER, { fw: '500' }));
  elements.push(text(W - 30, 700, 'Target', 10, MUTED, { anchor: 'end' }));
  elements.push(text(W - 30, 718, '5.8kg', 14, RUST, { anchor: 'end', fw: '700' }));

  bottomNav(elements, 3);
  return elements;
}

// ─────────────────────────────────────────────────────────
// SCREEN 6: Profile — athlete identity + training plan
// ─────────────────────────────────────────────────────────
function screen6() {
  const elements = [];
  elements.push(rect(0, 0, W, H, VOID));
  statusBar(elements);

  elements.push(line(16, 54, W - 16, 54, BORDER, { sw: 1 }));
  elements.push(text(16, 82, 'YOU', 40, TEXT, { fw: '800', ls: -1 }));
  elements.push(line(16, 96, W - 16, 96, BORDER, { sw: 1 }));

  // Profile card
  elements.push(rect(16, 108, W - 32, 88, SLATE, { rx: 12, stroke: BORDER, sw: 1 }));
  // Avatar
  elements.push(circle(52, 152, 28, COAL));
  elements.push(rect(24, 124, 56, 56, RUST, { rx: 10, opacity: 0.08 }));
  elements.push(text(52, 158, 'EK', 14, RUST, { anchor: 'middle', fw: '800' }));
  elements.push(text(92, 138, 'Elena Kovacs', 16, TEXT, { fw: '700' }));
  elements.push(text(92, 156, 'Trail Running · Chamonix', 12, MUTED));
  elements.push(text(92, 174, 'UTMB® Qualifier · 3× trail podium', 11, SAND));
  // Achievement badge
  elements.push(rect(W - 56, 118, 44, 22, RUST, { rx: 11, opacity: 0.12 }));
  elements.push(text(W - 34, 133, 'PRO', 10, RUST, { anchor: 'middle', fw: '700', ls: 1 }));

  // Season totals
  elements.push(text(16, 212, 'Season 2026', 11, MUTED, { ls: 1 }));
  const season = [
    ['847', 'km run'],
    ['48,200', 'm elev'],
    ['162:14', 'h moving'],
    ['47', 'activities'],
  ];
  season.forEach((s, i) => {
    const x = 16 + i * ((W - 32) / 4);
    const w = (W - 32) / 4 - 4;
    elements.push(rect(x, 228, w, 56, COAL, { rx: 8, stroke: BORDER, sw: 1 }));
    elements.push(text(x + w / 2, 252, s[0], 16, TEXT, { anchor: 'middle', fw: '700' }));
    elements.push(text(x + w / 2, 270, s[1], 9, MUTED, { anchor: 'middle' }));
  });

  // Training plan
  elevLabel(elements, 16, 300, 'Training Plan — UTMB Preparation');
  elements.push(rect(16, 316, W - 32, 52, COAL, { rx: 10, stroke: RUST, sw: 1 }));
  elements.push(rect(16, 316, 3, 52, RUST, { rx: 1.5 }));
  elements.push(text(30, 336, 'Week 14 of 24 — Base Building', 13, TEXT, { fw: '600' }));
  elements.push(text(30, 352, 'Target: 75km · ↑ 5,000m · 14+ hours', 12, MUTED));

  // Upcoming races
  elevLabel(elements, 16, 384, 'Race Calendar');
  const races = [
    { name: 'Marathon du Mont Blanc', date: '29 Jun', dist: '42km', status: 'Registered', daysOut: 81 },
    { name: 'Ultra-Trail des Aiguilles Rouges', date: '16 Aug', dist: '65km', status: 'Registered', daysOut: 129 },
    { name: 'UTMB® — 100 Miles du Mont Blanc', date: '22 Aug', dist: '171km', status: 'Waitlist', daysOut: 135 },
  ];
  races.forEach((r, i) => {
    const y = 400 + i * 84;
    elements.push(rect(16, y, W - 32, 76, COAL, { rx: 10, stroke: BORDER, sw: 1 }));
    elements.push(rect(16, y, 3, 76, r.status === 'Waitlist' ? SILVER : RUST, { rx: 1.5 }));
    elements.push(rect(W - 64, y + 10, 50, 20, r.status === 'Waitlist' ? COAL : RUST, { rx: 10, stroke: r.status === 'Waitlist' ? BORDER : 'none', sw: 1, opacity: r.status === 'Waitlist' ? 1 : 0.15 }));
    elements.push(text(W - 39, y + 25, r.status === 'Waitlist' ? 'Waitlist' : 'Reg ✓', 9, r.status === 'Waitlist' ? SILVER : RUST, { anchor: 'middle', fw: '600' }));
    elements.push(text(30, y + 24, r.name, 13, TEXT, { fw: '600' }));
    elements.push(text(30, y + 42, r.date + ' · ' + r.dist, 11, MUTED));
    elements.push(text(30, y + 58, r.daysOut + ' days out', 11, r.daysOut < 90 ? EMBER : SAND, { fw: r.daysOut < 90 ? '600' : '400' }));
    elements.push(text(W - 24, y + 42, '→', 16, SILVER, { anchor: 'end', opacity: 0.4 }));
  });

  // Weekly heatmap
  elevLabel(elements, 16, 660, 'Activity Heatmap');
  for (let week = 0; week < 12; week++) {
    for (let day = 0; day < 7; day++) {
      const intensity = Math.random();
      const fill = intensity < 0.25 ? BORDER
        : intensity < 0.5 ? `rgba(196,75,30,0.2)`
        : intensity < 0.75 ? `rgba(196,75,30,0.5)`
        : RUST;
      elements.push(rect(16 + week * 28, 676 + day * 11, 22, 9, fill, { rx: 2 }));
    }
  }

  bottomNav(elements, 4);
  return elements;
}

// ─── Assemble ───
const screens = [
  { name: 'Today', elements: screen1() },
  { name: 'Routes', elements: screen2() },
  { name: 'Route Detail', elements: screen3() },
  { name: 'Stats', elements: screen4() },
  { name: 'Kit', elements: screen5() },
  { name: 'You', elements: screen6() },
];

const total = screens.reduce((n, s) => n + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'RIDGE — Trail Running & Mountain Performance',
    author: 'RAM',
    date: new Date().toISOString(),
    theme: 'dark',
    heartbeat: HEARTBEAT,
    elements: total,
    palette: { VOID, COAL, SLATE, TEXT, MUTED, RUST, EMBER, SILVER, SAND },
    inspiration: [
      'Mertana ski brand (Dribbble — 13.5k saves) — full-viewport-width bold condensed editorial type, deep black #030404 + white',
      'Nixtio beauty booking (Dribbble — 8.4k saves) — terracotta #BF5A2D on near-black, counterintuitive dark warmth for consumer category',
      'Mertana palette: #030404 void + #512927 deep rust + #9A9C9F silver — sport editorial dark system',
    ],
  },
  screens: screens.map((s, i) => ({
    id: `screen-${i + 1}`,
    name: s.name,
    width: W,
    height: H,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"/>`,
    elements: s.elements,
  })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`RIDGE: ${screens.length} screens, ${total} elements`);
console.log(`Written: ${SLUG}.pen`);
