// PATCH — Precision Agriculture Intelligence Platform
// Dark theme | Sixth heartbeat | "Know your land."
// Inspired by: RonDesignLab satellite zone UI, Drink Mockly bold dark typography

import fs from 'fs';

const W = 390, H = 844;
const BG      = '#0A0F07';
const SURFACE = '#111A0C';
const SURFACE2= '#192010';
const ACCENT  = '#6ED940'; // vivid grass green
const ACCENT2 = '#E8B233'; // harvest amber
const RED     = '#E84040'; // alert red
const TEXT    = '#E8F0E2';
const MUTED   = 'rgba(232,240,226,0.45)';
const DIM     = 'rgba(232,240,226,0.18)';

let id = 1;
const uid = () => `el_${id++}`;

const rect = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'rect', x, y, width: w, height: h, fill,
  stroke: opts.stroke || 'none', strokeWidth: opts.sw || 0,
  cornerRadius: opts.r || 0, opacity: opts.opacity ?? 1
});

const text = (x, y, content, fontSize, fill, opts = {}) => ({
  id: uid(), type: 'text', x, y, content, fontSize, fill,
  fontWeight: opts.fw || 'normal', fontFamily: opts.ff || 'Inter',
  textAlign: opts.align || 'left', opacity: opts.opacity ?? 1,
  letterSpacing: opts.ls || 0
});

const circle = (cx, cy, r, fill, opts = {}) => ({
  id: uid(), type: 'circle', cx, cy, r, fill,
  stroke: opts.stroke || 'none', strokeWidth: opts.sw || 0, opacity: opts.opacity ?? 1
});

const line = (x1, y1, x2, y2, stroke, sw = 1, opts = {}) => ({
  id: uid(), type: 'line', x1, y1, x2, y2, stroke, strokeWidth: sw, opacity: opts.opacity ?? 1
});

// ─── SCREEN 1: Field Map ─────────────────────────────────────────────────────
// Satellite zone-selection view inspired by RonDesignLab
function screenFieldMap() {
  const els = [];

  // BG
  els.push(rect(0, 0, W, H, BG));

  // === TOP STATUS BAR ===
  els.push(text(16, 52, '9:41', 15, TEXT, { fw: '600' }));
  els.push(text(350, 52, '●●●', 13, MUTED));

  // === HEADER ===
  els.push(text(16, 80, 'PATCH', 22, ACCENT, { fw: '800', ls: 3 }));
  els.push(text(16, 107, 'Willow Creek Farm', 17, TEXT, { fw: '600' }));
  els.push(text(16, 128, '847 acres · Henderson County', 13, MUTED));

  // Notification badge
  els.push(rect(320, 80, 56, 26, RED, { r: 13 }));
  els.push(text(335, 97, '3 ALERTS', 10, '#FFFFFF', { fw: '700' }));

  // === SATELLITE MAP AREA ===
  const mapY = 158;
  const mapH = 340;

  // Map base — dark green-brown terrain tones (layered rects to simulate satellite)
  els.push(rect(0, mapY, W, mapH, '#0D1A08'));

  // Terrain patches (simulate satellite field texture)
  els.push(rect(20,  mapY+20,  180, 120, '#142B0E', { r: 4 }));
  els.push(rect(210, mapY+10,  160, 100, '#1A3510', { r: 4 }));
  els.push(rect(30,  mapY+150, 140, 90,  '#0F2309', { r: 4 }));
  els.push(rect(180, mapY+120, 190, 110, '#162C0C', { r: 4 }));
  els.push(rect(50,  mapY+250, 280, 70,  '#1B3811', { r: 4 }));

  // ── Zone overlays (3 field zones with transparent fills + borders) ──
  // Zone A — healthy (green)
  els.push(rect(24, mapY+22, 170, 110, 'rgba(110,217,64,0.15)', { r: 4, stroke: ACCENT, sw: 2 }));
  els.push(text(34, mapY+42, 'A', 11, ACCENT, { fw: '700' }));
  els.push(text(34, mapY+56, 'HEALTHY', 9, ACCENT, { fw: '600', ls: 1 }));
  els.push(circle(100, mapY+90, 8, 'rgba(110,217,64,0.3)', { stroke: ACCENT, sw: 2 }));
  els.push(text(96, mapY+95, '94', 8, ACCENT, { fw: '700' }));

  // Zone B — stress (amber)
  els.push(rect(212, mapY+12, 152, 92, 'rgba(232,178,51,0.15)', { r: 4, stroke: ACCENT2, sw: 2 }));
  els.push(text(222, mapY+32, 'B', 11, ACCENT2, { fw: '700' }));
  els.push(text(222, mapY+46, 'STRESS', 9, ACCENT2, { fw: '600', ls: 1 }));
  els.push(circle(295, mapY+62, 8, 'rgba(232,178,51,0.3)', { stroke: ACCENT2, sw: 2 }));
  els.push(text(290, mapY+67, '71', 8, ACCENT2, { fw: '700' }));

  // Zone C — critical (red)
  els.push(rect(32, mapY+152, 132, 82, 'rgba(232,64,64,0.15)', { r: 4, stroke: RED, sw: 2 }));
  els.push(text(42, mapY+172, 'C', 11, RED, { fw: '700' }));
  els.push(text(42, mapY+186, 'CRITICAL', 9, RED, { fw: '600', ls: 1 }));
  els.push(circle(98, mapY+198, 8, 'rgba(232,64,64,0.3)', { stroke: RED, sw: 2 }));
  els.push(text(94, mapY+203, '48', 8, RED, { fw: '700' }));

  // Zone D — healthy (green)
  els.push(rect(183, mapY+122, 183, 102, 'rgba(110,217,64,0.1)', { r: 4, stroke: ACCENT, sw: 1.5 }));
  els.push(text(193, mapY+142, 'D', 11, ACCENT, { fw: '700' }));
  els.push(text(193, mapY+156, 'HEALTHY', 9, ACCENT, { fw: '600', ls: 1 }));

  // GPS crosshair pin
  els.push(circle(197, mapY+170, 12, 'rgba(110,217,64,0.2)', { stroke: ACCENT, sw: 2 }));
  els.push(line(197, mapY+158, 197, mapY+182, ACCENT, 1.5));
  els.push(line(185, mapY+170, 209, mapY+170, ACCENT, 1.5));
  els.push(circle(197, mapY+170, 3, ACCENT));

  // Map scale bar
  els.push(rect(16, mapY+mapH-28, 60, 3, MUTED, { r: 1 }));
  els.push(text(16, mapY+mapH-10, '0.5 mi', 10, MUTED));

  // Map mode chip
  els.push(rect(270, mapY+mapH-36, 104, 24, 'rgba(0,0,0,0.6)', { r: 12 }));
  els.push(text(285, mapY+mapH-20, '⊙  NDVI MODE', 9, ACCENT, { fw: '600' }));

  // === ZONE LEGEND STRIP ===
  const legY = mapY + mapH + 10;
  els.push(rect(16, legY, 108, 48, SURFACE2, { r: 10 }));
  els.push(circle(32, legY+14, 5, ACCENT));
  els.push(text(42, legY+18, 'Healthy', 11, TEXT));
  els.push(circle(32, legY+34, 5, ACCENT2));
  els.push(text(42, legY+38, 'Stress', 11, TEXT));

  els.push(rect(132, legY, 108, 48, SURFACE2, { r: 10 }));
  els.push(circle(148, legY+14, 5, RED));
  els.push(text(158, legY+18, 'Critical', 11, TEXT));
  els.push(circle(148, legY+34, 5, DIM));
  els.push(text(158, legY+38, 'No Data', 11, MUTED));

  // Alert count chip
  els.push(rect(252, legY+8, 122, 32, 'rgba(232,64,64,0.15)', { r: 16, stroke: RED, sw: 1 }));
  els.push(text(268, legY+28, '⚠ Zone C alert', 12, RED, { fw: '600' }));

  // === BOTTOM ACTION STRIP ===
  const actY = legY + 62;
  els.push(rect(16, actY, 170, 52, ACCENT, { r: 14 }));
  els.push(text(50, actY+30, 'INSPECT ZONE', 15, '#0A0F07', { fw: '700' }));

  els.push(rect(198, actY, 176, 52, SURFACE2, { r: 14, stroke: DIM, sw: 1 }));
  els.push(text(232, actY+30, 'ADD TASK', 15, TEXT, { fw: '600' }));

  // === NAV BAR ===
  const navY = H - 84;
  els.push(rect(0, navY, W, 84, SURFACE, { stroke: DIM, sw: 0.5 }));
  const tabs = [
    { label: 'MAP',      x: 40 },
    { label: 'FARM',     x: 120 },
    { label: 'SENSORS',  x: 210 },
    { label: 'THREATS',  x: 300 },
  ];
  tabs.forEach((t, i) => {
    const active = i === 0;
    if (active) {
      els.push(rect(t.x - 18, navY + 8, 60, 26, 'rgba(110,217,64,0.12)', { r: 8 }));
    }
    els.push(text(t.x, navY + 48, t.label, 10, active ? ACCENT : MUTED, { fw: active ? '700' : '500', ls: 1 }));
  });

  return { id: 'screen-field-map', name: 'Field Map', width: W, height: H, elements: els };
}

// ─── SCREEN 2: Farm Overview Dashboard ───────────────────────────────────────
function screenFarmOverview() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));

  // Header
  els.push(text(16, 52, '9:41', 15, TEXT, { fw: '600' }));
  els.push(text(16, 80, 'FARM OVERVIEW', 18, TEXT, { fw: '800', ls: 2 }));
  els.push(text(16, 104, 'Season health · Spring 2026', 13, MUTED));

  // Overall health ring
  const ringCX = 195, ringCY = 200, ringR = 72;
  els.push(circle(ringCX, ringCY, ringR, SURFACE2));
  els.push(circle(ringCX, ringCY, ringR, 'none', { stroke: DIM, sw: 12 }));
  // Arc segment (simulate 78% fill with a thick arc — approximate with ellipse)
  els.push(circle(ringCX, ringCY, ringR, 'none', { stroke: ACCENT, sw: 12 }));
  // Inner content
  els.push(circle(ringCX, ringCY, 52, BG));
  els.push(text(ringCX - 18, ringCY + 8, '78', 36, ACCENT, { fw: '800' }));
  els.push(text(ringCX - 22, ringCY + 26, 'FARM SCORE', 9, MUTED, { fw: '600', ls: 1 }));

  // Score label
  els.push(text(ringCX - 26, ringCY + 80, '▲ +4 pts this week', 12, ACCENT));

  // ── 4 metric tiles ──
  const tileY = 308;
  const tiles = [
    { label: 'SOIL\nMOISTURE',  val: '68%',    color: ACCENT,  x: 16  },
    { label: 'CROP\nSTRESS',    val: '3 ZONES', color: ACCENT2, x: 113 },
    { label: 'PEST\nRISK',      val: 'HIGH',    color: RED,     x: 210 },
    { label: 'YIELD\nFORECAST', val: '94 bu',   color: ACCENT,  x: 307 },
  ];
  tiles.forEach(t => {
    els.push(rect(t.x, tileY, 67, 72, SURFACE2, { r: 10 }));
    // Colored top accent
    els.push(rect(t.x, tileY, 67, 3, t.color, { r: 2 }));
    els.push(text(t.x + 8, tileY + 22, t.label, 9, MUTED, { fw: '600', ls: 0.5 }));
    els.push(text(t.x + 8, tileY + 56, t.val, 16, t.color, { fw: '800' }));
  });

  // ── Weekly activity bar chart ──
  const chartY = 402;
  els.push(text(16, chartY, 'SOIL MOISTURE — 7 DAY', 11, MUTED, { fw: '700', ls: 1 }));
  const chartData = [72, 69, 74, 68, 65, 70, 68];
  const days = ['M','T','W','T','F','S','S'];
  const barW = 34, barMaxH = 70, barBaseY = chartY + 90;
  const barColors = [ACCENT, ACCENT, ACCENT, ACCENT2, ACCENT2, ACCENT, ACCENT];
  chartData.forEach((val, i) => {
    const bh = (val / 100) * barMaxH;
    const bx = 16 + i * (barW + 6);
    els.push(rect(bx, barBaseY - bh, barW, bh, barColors[i], { r: 4 }));
    els.push(text(bx + 10, barBaseY + 14, days[i], 10, MUTED));
    if (i === 6) {
      // Today indicator
      els.push(rect(bx - 2, barBaseY - bh - 6, barW + 4, bh + 4, 'none', { r: 5, stroke: ACCENT, sw: 1.5 }));
    }
  });

  // ── Field summary list ──
  const listY = 528;
  els.push(text(16, listY, 'FIELD STATUS', 11, MUTED, { fw: '700', ls: 1 }));
  const fields = [
    { name: 'North Field (Zone A)', acres: '212 ac', score: 94, color: ACCENT  },
    { name: 'East Field (Zone B)',  acres: '180 ac', score: 71, color: ACCENT2 },
    { name: 'South Field (Zone C)', acres: '156 ac', score: 48, color: RED     },
    { name: 'West Field (Zone D)',  acres: '299 ac', score: 82, color: ACCENT  },
  ];
  fields.forEach((f, i) => {
    const fy = listY + 24 + i * 48;
    els.push(rect(16, fy, W - 32, 40, SURFACE2, { r: 10 }));
    els.push(circle(36, fy + 20, 6, f.color));
    els.push(text(50, fy + 14, f.name, 13, TEXT, { fw: '600' }));
    els.push(text(50, fy + 30, f.acres, 11, MUTED));
    // Score bar
    els.push(rect(260, fy + 14, 80, 4, DIM, { r: 2 }));
    els.push(rect(260, fy + 14, (f.score / 100) * 80, 4, f.color, { r: 2 }));
    els.push(text(348, fy + 18, `${f.score}`, 12, f.color, { fw: '700' }));
  });

  // NAV
  const navY = H - 84;
  els.push(rect(0, navY, W, 84, SURFACE, { stroke: DIM, sw: 0.5 }));
  const tabs = ['MAP','FARM','SENSORS','THREATS'];
  tabs.forEach((t, i) => {
    const active = i === 1;
    const tx = [40, 120, 210, 300][i];
    if (active) els.push(rect(tx - 18, navY + 8, 60, 26, 'rgba(110,217,64,0.12)', { r: 8 }));
    els.push(text(tx, navY + 48, t, 10, active ? ACCENT : MUTED, { fw: active ? '700' : '500', ls: 1 }));
  });

  return { id: 'screen-farm-overview', name: 'Farm Overview', width: W, height: H, elements: els };
}

// ─── SCREEN 3: Sensor Detail ──────────────────────────────────────────────────
function screenSensorDetail() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));

  // Header
  els.push(text(16, 52, '9:41', 15, TEXT, { fw: '600' }));
  els.push(text(16, 80, '← NORTH FIELD', 14, MUTED, { fw: '600', ls: 1 }));
  els.push(text(16, 108, 'Soil Intelligence', 20, TEXT, { fw: '800' }));
  els.push(text(16, 132, 'Live sensor readings · 212 acres', 13, MUTED));

  // ── 2x3 sensor grid ──
  const gridY = 158;
  const sensors = [
    { label: 'MOISTURE',  val: '68%',     sub: 'Optimal >60%',  color: ACCENT,  icon: '◎' },
    { label: 'TEMP',      val: '61°F',    sub: 'Soil depth 4"', color: ACCENT2, icon: '◈' },
    { label: 'N LEVEL',   val: '42 ppm',  sub: 'Low — alert',   color: RED,     icon: '⬡' },
    { label: 'PH',        val: '6.8',     sub: 'Ideal 6.0–7.0', color: ACCENT,  icon: '⊕' },
    { label: 'ORGANIC C', val: '3.2%',    sub: 'Above avg',     color: ACCENT,  icon: '◉' },
    { label: 'SALINITY',  val: '0.4 dS',  sub: 'Normal',        color: MUTED,   icon: '◌' },
  ];
  sensors.forEach((s, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const sx = 16 + col * 191;
    const sy = gridY + row * 94;
    els.push(rect(sx, sy, 179, 82, SURFACE2, { r: 12 }));
    // Subtle left border
    els.push(rect(sx, sy, 3, 82, s.color, { r: 2 }));
    els.push(text(sx + 14, sy + 22, s.icon + '  ' + s.label, 10, MUTED, { fw: '700', ls: 1 }));
    els.push(text(sx + 14, sy + 52, s.val, 26, s.color, { fw: '800' }));
    els.push(text(sx + 14, sy + 70, s.sub, 10, MUTED));
  });

  // ── AI Recommendation banner ──
  const aiY = gridY + 3 * 94 + 12;
  els.push(rect(16, aiY, W - 32, 70, 'rgba(110,217,64,0.08)', { r: 14, stroke: ACCENT, sw: 1 }));
  els.push(text(32, aiY + 20, '◈ AI INSIGHT', 10, ACCENT, { fw: '700', ls: 1 }));
  els.push(text(32, aiY + 38, 'Nitrogen deficiency detected in Zone A.', 13, TEXT, { fw: '600' }));
  els.push(text(32, aiY + 54, 'Apply 30 lbs/ac before Thursday rain event.', 12, MUTED));

  // ── 30-day trend chart ──
  const trendY = aiY + 86;
  els.push(text(16, trendY, 'MOISTURE TREND — 30 DAYS', 11, MUTED, { fw: '700', ls: 1 }));
  // Simple polyline approximation with lines
  const tPoints = [70,68,72,74,69,65,68,71,73,68,66,64,68,72,70,68,66,68,70,72,69,65,63,68,70,72,74,68,66,68];
  const tChartW = W - 32, tChartH = 60, tBaseY = trendY + 76;
  // Background
  els.push(rect(16, trendY + 14, tChartW, tChartH, SURFACE2, { r: 8 }));
  // Grid lines
  [25, 50, 75].forEach(pct => {
    const ly = trendY + 14 + (1 - pct / 100) * tChartH;
    els.push(line(16, ly, 16 + tChartW, ly, DIM, 0.5));
    els.push(text(20, ly - 2, `${pct}%`, 8, DIM));
  });
  // Trend line segments
  for (let i = 0; i < tPoints.length - 1; i++) {
    const x1 = 16 + (i / (tPoints.length - 1)) * tChartW;
    const x2 = 16 + ((i + 1) / (tPoints.length - 1)) * tChartW;
    const y1 = trendY + 14 + (1 - tPoints[i] / 100) * tChartH;
    const y2 = trendY + 14 + (1 - tPoints[i + 1] / 100) * tChartH;
    els.push(line(x1, y1, x2, y2, ACCENT, 2));
  }
  // Last point dot
  const lastX = 16 + tChartW;
  const lastY = trendY + 14 + (1 - tPoints[29] / 100) * tChartH;
  els.push(circle(lastX, lastY, 5, ACCENT));

  // ── Action buttons ──
  const btnY = trendY + 92;
  els.push(rect(16, btnY, 176, 48, ACCENT, { r: 12 }));
  els.push(text(36, btnY + 29, 'LOG TREATMENT', 14, '#0A0F07', { fw: '700' }));
  els.push(rect(204, btnY, 170, 48, SURFACE2, { r: 12, stroke: DIM, sw: 1 }));
  els.push(text(224, btnY + 29, 'SET ALERT', 14, TEXT, { fw: '600' }));

  // NAV
  const navY = H - 84;
  els.push(rect(0, navY, W, 84, SURFACE, { stroke: DIM, sw: 0.5 }));
  ['MAP','FARM','SENSORS','THREATS'].forEach((t, i) => {
    const active = i === 2;
    const tx = [40, 120, 210, 300][i];
    if (active) els.push(rect(tx - 18, navY + 8, 60, 26, 'rgba(110,217,64,0.12)', { r: 8 }));
    els.push(text(tx, navY + 48, t, 10, active ? ACCENT : MUTED, { fw: active ? '700' : '500', ls: 1 }));
  });

  return { id: 'screen-sensor-detail', name: 'Sensor Detail', width: W, height: H, elements: els };
}

// ─── SCREEN 4: Pest & Disease Alerts ─────────────────────────────────────────
function screenPestAlerts() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));

  // Header
  els.push(text(16, 52, '9:41', 15, TEXT, { fw: '600' }));
  els.push(text(16, 80, 'THREATS', 20, TEXT, { fw: '800', ls: 2 }));
  els.push(text(16, 104, 'AI-detected · Spring 2026 season', 13, MUTED));
  // Alert count badge
  els.push(rect(296, 82, 78, 28, RED, { r: 14 }));
  els.push(text(310, 100, '3 ACTIVE', 12, '#FFFFFF', { fw: '700' }));

  // ── Critical alert (full width) ──
  const alert1Y = 140;
  els.push(rect(16, alert1Y, W - 32, 108, 'rgba(232,64,64,0.08)', { r: 14, stroke: RED, sw: 1.5 }));
  els.push(rect(16, alert1Y, W - 32, 3, RED, { r: 2 }));
  els.push(text(32, alert1Y + 22, '⚠ CRITICAL  —  ZONE C', 11, RED, { fw: '700', ls: 1 }));
  els.push(text(32, alert1Y + 44, 'Corn Rootworm', 18, TEXT, { fw: '800' }));
  els.push(text(32, alert1Y + 66, 'Larval population density exceeding economic', 12, MUTED));
  els.push(text(32, alert1Y + 82, 'injury level. Immediate intervention required.', 12, MUTED));
  els.push(rect(32, alert1Y + 86, 120, 28, RED, { r: 10 }));
  els.push(text(46, alert1Y + 104, 'VIEW ACTION PLAN', 10, '#FFFFFF', { fw: '700', ls: 0.5 }));
  els.push(rect(162, alert1Y + 86, 80, 28, 'rgba(232,64,64,0.2)', { r: 10 }));
  els.push(text(178, alert1Y + 104, 'DISMISS', 10, RED, { fw: '700', ls: 0.5 }));
  // Severity chips
  els.push(rect(W - 120, alert1Y + 22, 104, 20, 'rgba(232,64,64,0.2)', { r: 10 }));
  els.push(text(W - 110, alert1Y + 36, '● HIGH SEVERITY', 10, RED, { fw: '600' }));

  // ── Warning alert ──
  const alert2Y = alert1Y + 122;
  els.push(rect(16, alert2Y, W - 32, 90, SURFACE2, { r: 14, stroke: ACCENT2, sw: 1 }));
  els.push(text(32, alert2Y + 20, '⚡ WARNING  —  ZONE B', 11, ACCENT2, { fw: '700', ls: 1 }));
  els.push(text(32, alert2Y + 40, 'Gray Leaf Spot Risk', 16, TEXT, { fw: '700' }));
  els.push(text(32, alert2Y + 58, 'Humidity + temperature conditions favorable.', 12, MUTED));
  els.push(text(32, alert2Y + 74, 'Scout fields before next rain event.', 12, MUTED));
  els.push(rect(W - 100, alert2Y + 30, 84, 22, 'rgba(232,178,51,0.15)', { r: 11 }));
  els.push(text(W - 92, alert2Y + 45, '● MODERATE', 10, ACCENT2, { fw: '600' }));

  // ── Watch alert ──
  const alert3Y = alert2Y + 104;
  els.push(rect(16, alert3Y, W - 32, 78, SURFACE2, { r: 14, stroke: DIM, sw: 1 }));
  els.push(text(32, alert3Y + 20, 'ℹ WATCH  —  ZONE A, D', 11, MUTED, { fw: '700', ls: 1 }));
  els.push(text(32, alert3Y + 40, 'Aphid Population Monitoring', 15, TEXT, { fw: '600' }));
  els.push(text(32, alert3Y + 58, 'Low count detected. Continue weekly scouting.', 12, MUTED));
  els.push(rect(W - 86, alert3Y + 28, 70, 22, SURFACE, { r: 11, stroke: DIM, sw: 1 }));
  els.push(text(W - 78, alert3Y + 43, '● LOW', 10, MUTED, { fw: '600' }));

  // ── AI Weather Risk Analysis ──
  const aiY = alert3Y + 94;
  els.push(rect(16, aiY, W - 32, 80, 'rgba(110,217,64,0.06)', { r: 14, stroke: ACCENT, sw: 1 }));
  els.push(text(32, aiY + 20, '◈ AI WEATHER RISK MODEL', 10, ACCENT, { fw: '700', ls: 1 }));
  els.push(text(32, aiY + 38, '3-day window: High disease pressure likely', 14, TEXT, { fw: '600' }));
  els.push(text(32, aiY + 56, 'in NE quadrant. Recommend fungicide', 12, MUTED));
  els.push(text(32, aiY + 70, 'application within 48 hrs.', 12, MUTED));

  // ── Seasonal forecast strip ──
  const forecastY = aiY + 96;
  els.push(text(16, forecastY, 'HISTORICAL THREAT INDEX', 11, MUTED, { fw: '700', ls: 1 }));
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP'];
  const threat  = [10,   8,   22,   48,   72,   65,   58,   44,   20 ];
  months.forEach((m, i) => {
    const bx = 16 + i * 40;
    const bh = (threat[i] / 100) * 50;
    const bc = threat[i] > 60 ? RED : threat[i] > 40 ? ACCENT2 : ACCENT;
    els.push(rect(bx, forecastY + 66 - bh, 28, bh, bc, { r: 3 }));
    els.push(text(bx + 2, forecastY + 80, m, 8, MUTED));
    // APR marker (current)
    if (i === 3) {
      els.push(line(bx + 14, forecastY + 10, bx + 14, forecastY + 64, ACCENT2, 1, { opacity: 0.5 }));
      els.push(text(bx - 2, forecastY + 6, 'NOW', 8, ACCENT2, { fw: '700' }));
    }
  });

  // NAV
  const navY = H - 84;
  els.push(rect(0, navY, W, 84, SURFACE, { stroke: DIM, sw: 0.5 }));
  ['MAP','FARM','SENSORS','THREATS'].forEach((t, i) => {
    const active = i === 3;
    const tx = [40, 120, 210, 300][i];
    if (active) els.push(rect(tx - 18, navY + 8, 60, 26, 'rgba(110,217,64,0.12)', { r: 8 }));
    els.push(text(tx, navY + 48, t, 10, active ? ACCENT : MUTED, { fw: active ? '700' : '500', ls: 1 }));
  });

  return { id: 'screen-pest-alerts', name: 'Pest & Disease', width: W, height: H, elements: els };
}

// ─── SCREEN 5: Yield Forecast ─────────────────────────────────────────────────
function screenYieldForecast() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));

  // Header
  els.push(text(16, 52, '9:41', 15, TEXT, { fw: '600' }));
  els.push(text(16, 80, 'YIELD FORECAST', 20, TEXT, { fw: '800', ls: 1 }));
  els.push(text(16, 104, 'AI projection · 2026 corn season', 13, MUTED));

  // ── Big forecast number ──
  els.push(rect(16, 122, W - 32, 120, SURFACE2, { r: 16 }));
  els.push(text(32, 152, 'PROJECTED YIELD', 11, MUTED, { fw: '700', ls: 1 }));
  els.push(text(32, 198, '194 bu/ac', 42, ACCENT, { fw: '900' }));
  els.push(text(32, 222, '▲ +12 bu vs. last season avg', 13, ACCENT));
  // Confidence pill
  els.push(rect(W - 130, 148, 114, 30, 'rgba(110,217,64,0.12)', { r: 15, stroke: ACCENT, sw: 1 }));
  els.push(text(W - 122, 167, '87% confidence', 12, ACCENT, { fw: '600' }));

  // ── Scenario sliders ──
  const sliderY = 264;
  els.push(text(16, sliderY, 'SCENARIO INPUTS', 11, MUTED, { fw: '700', ls: 1 }));
  const sliders = [
    { label: 'Rainfall',    sub: '24" projected',    pct: 72 },
    { label: 'Fertilizer',  sub: 'Optimal rate',      pct: 85 },
    { label: 'Pest Pressure',sub: 'Moderate',         pct: 42 },
    { label: 'Heat Stress', sub: 'Low risk',          pct: 20 },
  ];
  sliders.forEach((s, i) => {
    const sy = sliderY + 24 + i * 54;
    els.push(text(16, sy + 4, s.label, 13, TEXT, { fw: '600' }));
    els.push(text(16, sy + 20, s.sub, 11, MUTED));
    // Track
    els.push(rect(16, sy + 32, W - 32, 6, DIM, { r: 3 }));
    // Fill
    const fillColor = s.pct > 70 ? ACCENT : s.pct > 40 ? ACCENT2 : RED;
    els.push(rect(16, sy + 32, ((W - 32) * s.pct) / 100, 6, fillColor, { r: 3 }));
    // Thumb
    const thumbX = 16 + ((W - 32) * s.pct) / 100;
    els.push(circle(thumbX, sy + 35, 9, BG, { stroke: fillColor, sw: 2 }));
    els.push(circle(thumbX, sy + 35, 4, fillColor));
    // Pct label
    els.push(text(thumbX + 14, sy + 39, `${s.pct}%`, 11, fillColor, { fw: '700' }));
  });

  // ── 5-year comparison chart ──
  const compY = sliderY + 24 + 4 * 54 + 12;
  els.push(text(16, compY, '5-YEAR YIELD HISTORY', 11, MUTED, { fw: '700', ls: 1 }));
  const years = ['2022','2023','2024','2025','2026'];
  const yields = [168, 178, 182, 188, 194];
  const compMaxH = 60;
  const yieldMin = 160;
  years.forEach((yr, i) => {
    const bx = 22 + i * 70;
    const bh = ((yields[i] - yieldMin) / 40) * compMaxH;
    const bColor = i === 4 ? ACCENT : 'rgba(110,217,64,0.35)';
    const bBaseY = compY + 16 + compMaxH;
    els.push(rect(bx, bBaseY - bh, 48, bh, bColor, { r: 6 }));
    els.push(text(bx + 2, bBaseY - bh - 14, `${yields[i]}`, 11, i === 4 ? ACCENT : MUTED, { fw: i === 4 ? '800' : '500' }));
    els.push(text(bx + 4, bBaseY + 14, yr, 10, i === 4 ? TEXT : MUTED, { fw: i === 4 ? '700' : '400' }));
    // Trend connect line
    if (i < 4) {
      const nx = 22 + (i + 1) * 70 + 24;
      const cx = bx + 24;
      const bBaseYL = compY + 16 + compMaxH;
      const cy1 = bBaseYL - bh;
      const nh = ((yields[i + 1] - yieldMin) / 40) * compMaxH;
      const cy2 = bBaseYL - nh;
      els.push(line(cx, cy1, nx, cy2, ACCENT, 1, { opacity: 0.4 }));
    }
  });

  // ── Prescriptive action ──
  const actY = compY + compMaxH + 50;
  els.push(rect(16, actY, W - 32, 70, 'rgba(110,217,64,0.07)', { r: 14, stroke: ACCENT, sw: 1 }));
  els.push(text(32, actY + 20, '◈ TOP RECOMMENDATION', 10, ACCENT, { fw: '700', ls: 1 }));
  els.push(text(32, actY + 40, 'Address Zone C pest issue to recover +8 bu/ac', 13, TEXT, { fw: '600' }));
  els.push(text(32, actY + 58, 'potential yield loss. Est. ROI: $2,400/field.', 12, MUTED));

  // CTA
  const ctaY = actY + 84;
  els.push(rect(16, ctaY, W - 32, 52, ACCENT, { r: 14 }));
  els.push(text(100, ctaY + 32, 'GENERATE FULL SEASON PLAN', 16, '#0A0F07', { fw: '800' }));

  // NAV
  const navY = H - 84;
  els.push(rect(0, navY, W, 84, SURFACE, { stroke: DIM, sw: 0.5 }));
  ['MAP','FARM','SENSORS','THREATS'].forEach((t, i) => {
    const tx = [40, 120, 210, 300][i];
    els.push(text(tx, navY + 48, t, 10, MUTED, { fw: '500', ls: 1 }));
  });
  // YIELD is its own special screen — add yield tab indicator
  els.push(text(195, navY + 10, '⬤', 8, ACCENT));

  return { id: 'screen-yield-forecast', name: 'Yield Forecast', width: W, height: H, elements: els };
}

// ─── ASSEMBLE & WRITE ────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  metadata: {
    name: 'PATCH',
    description: 'Precision agriculture intelligence platform. Know your land.',
    author: 'RAM Design AI',
    theme: 'dark',
    palette: { bg: BG, surface: SURFACE, accent: ACCENT, accent2: ACCENT2, text: TEXT }
  },
  screens: [
    screenFieldMap(),
    screenFarmOverview(),
    screenSensorDetail(),
    screenPestAlerts(),
    screenYieldForecast(),
  ]
};

fs.writeFileSync('patch.pen', JSON.stringify(pen, null, 2));
console.log(`✅ patch.pen written — ${pen.screens.length} screens, ${pen.screens.reduce((a,s) => a + s.elements.length, 0)} elements`);
