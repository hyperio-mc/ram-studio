'use strict';
const fs = require('fs'), path = require('path');

// ─── CAIRN: Trail Planning & Field Notes ──────────────────────────────────
// Heartbeat #467 — Light theme
// Inspired by: Land-book "tech-spec grid aesthetic" (ruled lines, monospace
// coordinates as design element) + Godly "barely-there UI" (invisible chrome,
// typography carries weight) + Mobbin bottom-centric architecture
//
// Palette: parchment canvas, forest green, topo contour lines as design motif
// ─────────────────────────────────────────────────────────────────────────────

const SLUG = 'cairn';
const W = 390, H = 844;

// Palette
const BG      = '#F6F3EE';   // warm parchment
const SURF    = '#FFFFFF';
const CARD    = '#EEEAE2';
const BORDER  = '#D9D4C8';
const TEXT    = '#1C1B17';   // near-black, warm
const TEXT2   = '#7A7468';   // secondary warm grey
const MUTED   = '#B0A89A';   // muted
const GREEN   = '#3A7A52';   // forest green (trails, healthy)
const GREEN_L = '#E8F2EC';   // light green tint
const AMBER   = '#C67E1A';   // caution / difficulty
const AMBER_L = '#FDF3E0';
const RED     = '#C44032';   // danger / no-go
const TOPO    = 'rgba(58,122,82,0.12)';  // contour line tint
const TOPO2   = 'rgba(58,122,82,0.06)';

const els = [];
let screenEls = [];

function rect(x,y,w,h,fill,opts={}) {
  return { type:'rect', x, y, w, h, fill, ...opts };
}
function text(x,y,content,size,fill,opts={}) {
  return { type:'text', x, y, content: String(content), size, fill, ...opts };
}
function circle(cx,cy,r,fill,opts={}) {
  return { type:'circle', cx, cy, r, fill, ...opts };
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  return { type:'line', x1, y1, x2, y2, stroke, ...opts };
}

const NAV_Y = H - 80;

// ────────────────────────────────────────────────
// SCREEN 1: MAP VIEW
// ────────────────────────────────────────────────
function buildMap() {
  const s = [];
  // Full canvas background — parchment
  s.push(rect(0, 0, W, H, BG));

  // Topographic contour lines (tech-spec grid motif — Land-book inspiration)
  // Irregular horizontal contour bands
  const contourY = [120, 155, 188, 218, 244, 268, 290, 310, 330, 350, 368, 385, 400, 414, 427];
  contourY.forEach(y => {
    s.push(line(0, y, W, y, TOPO, { sw: 1.2 }));
  });
  // A few diagonal contour segments simulating topographic curves
  s.push(line(0, 200, 80, 180, TOPO, { sw: 1 }));
  s.push(line(80, 180, 200, 175, TOPO, { sw: 1 }));
  s.push(line(200, 175, 310, 190, TOPO, { sw: 1 }));
  s.push(line(310, 190, W, 178, TOPO, { sw: 1 }));

  s.push(line(0, 240, 60, 220, TOPO, { sw: 0.8 }));
  s.push(line(60, 220, 180, 215, TOPO, { sw: 0.8 }));
  s.push(line(180, 215, 300, 228, TOPO, { sw: 0.8 }));
  s.push(line(300, 228, W, 218, TOPO, { sw: 0.8 }));

  s.push(line(0, 290, 100, 270, TOPO2, { sw: 0.8 }));
  s.push(line(100, 270, 230, 265, TOPO2, { sw: 0.8 }));
  s.push(line(230, 265, W, 275, TOPO2, { sw: 0.8 }));

  // Elevation labels on contour lines (monospace tech-spec aesthetic)
  s.push(text(8, 177, '2,840m', 9, MUTED, { font: 'Menlo,monospace', fw: 400 }));
  s.push(text(8, 213, '2,800m', 9, MUTED, { font: 'Menlo,monospace', fw: 400 }));
  s.push(text(8, 243, '2,760m', 9, MUTED, { font: 'Menlo,monospace', fw: 400 }));
  s.push(text(8, 267, '2,720m', 9, MUTED, { font: 'Menlo,monospace', fw: 400 }));
  s.push(text(8, 289, '2,680m', 9, MUTED, { font: 'Menlo,monospace', fw: 400 }));

  // Trail path on map — thick green line
  s.push(line(60, 400, 100, 350, GREEN, { sw: 2.5 }));
  s.push(line(100, 350, 155, 300, GREEN, { sw: 2.5 }));
  s.push(line(155, 300, 195, 255, GREEN, { sw: 2.5 }));
  s.push(line(195, 255, 240, 220, GREEN, { sw: 2.5 }));
  s.push(line(240, 220, 295, 195, GREEN, { sw: 2.5 }));
  s.push(line(295, 195, 340, 168, GREEN, { sw: 2.5 }));

  // Trailhead marker (start)
  s.push(circle(60, 400, 8, GREEN));
  s.push(circle(60, 400, 4, SURF));

  // Summit marker (end)
  s.push(circle(340, 168, 10, AMBER));
  s.push(text(340, 168, '▲', 10, SURF, { anchor: 'middle' }));

  // Waypoint dots along trail
  s.push(circle(130, 330, 5, SURF, { stroke: GREEN, sw: 2 }));
  s.push(circle(200, 258, 5, SURF, { stroke: GREEN, sw: 2 }));
  s.push(circle(268, 210, 5, SURF, { stroke: GREEN, sw: 2 }));

  // Coordinate readout — top bar (monospace, barely-there chrome)
  s.push(rect(0, 44, W, 40, 'rgba(246,243,238,0.92)'));
  s.push(line(0, 84, W, 84, BORDER, { sw: 0.5 }));
  s.push(text(16, 70, '46°51\'42"N  10°24\'18"E', 11, TEXT2, { font: 'Menlo,monospace' }));
  s.push(text(W - 16, 70, '2,840m ↑', 11, GREEN, { font: 'Menlo,monospace', anchor: 'end' }));

  // Status bar
  s.push(rect(0, 0, W, 44, 'rgba(246,243,238,0.95)'));
  s.push(text(16, 28, '9:41', 15, TEXT, { fw: 600 }));
  s.push(text(W - 16, 28, '●●●  ◆  88%', 12, TEXT, { anchor: 'end' }));

  // Floating info card (bottom sheet, glassmorphism 2.0 — Mobbin signal)
  const SHEET_Y = 460;
  s.push(rect(0, SHEET_Y, W, H - SHEET_Y, SURF, { rx: 20 }));
  s.push(line(W/2 - 20, SHEET_Y + 10, W/2 + 20, SHEET_Y + 10, BORDER, { sw: 3, opacity: 0.6 }));

  // Active route info in the sheet
  s.push(text(20, SHEET_Y + 38, 'CAIRN RIDGE LOOP', 11, TEXT2, { fw: 700, ls: 2 }));
  s.push(text(20, SHEET_Y + 62, 'Dolomites · Italy', 20, TEXT, { fw: 700 }));

  // Stats row
  const stats = [
    { label: 'DIST', val: '14.2 km' },
    { label: 'GAIN', val: '1,240 m' },
    { label: 'TIME', val: '6h 20m' },
    { label: 'DIFF', val: 'Hard' },
  ];
  const statX = [20, 115, 210, 290];
  stats.forEach((st, i) => {
    s.push(text(statX[i], SHEET_Y + 86, st.label, 9, TEXT2, { fw: 600, ls: 1.5, font: 'Menlo,monospace' }));
    s.push(text(statX[i], SHEET_Y + 108, st.val, 16, i === 3 ? AMBER : TEXT, { fw: 700 }));
  });

  // Divider
  s.push(line(20, SHEET_Y + 124, W - 20, SHEET_Y + 124, BORDER, { sw: 0.5 }));

  // Waypoints list (condensed)
  const wpts = [
    { name: 'Trailhead Parking', elev: '1,840m', dist: '0.0 km', icon: 'P' },
    { name: 'Rifugio Auronzo',   elev: '2,320m', dist: '4.1 km', icon: 'R' },
    { name: 'Tre Cime Saddle',   elev: '2,680m', dist: '8.8 km', icon: '△' },
    { name: 'Summit Cairn',      elev: '2,840m', dist: '14.2 km', icon: '▲' },
  ];
  wpts.forEach((w, i) => {
    const wy = SHEET_Y + 144 + i * 44;
    // icon circle
    s.push(circle(34, wy + 14, 10, i === 3 ? AMBER_L : GREEN_L));
    s.push(text(34, wy + 18, w.icon, 9, i === 3 ? AMBER : GREEN, { anchor: 'middle', fw: 700 }));
    s.push(text(54, wy + 10, w.name, 13, TEXT, { fw: 500 }));
    s.push(text(54, wy + 26, w.elev, 11, TEXT2, { font: 'Menlo,monospace' }));
    s.push(text(W - 20, wy + 18, w.dist, 12, TEXT2, { anchor: 'end', font: 'Menlo,monospace' }));
    if (i < 3) s.push(line(54, wy + 40, W - 20, wy + 40, BORDER, { sw: 0.4 }));
  });

  // Bottom nav
  s.push(rect(0, NAV_Y, W, 80, SURF));
  s.push(line(0, NAV_Y, W, NAV_Y, BORDER, { sw: 0.5 }));
  const navItems = [
    { label: 'Map',    x: 48 },
    { label: 'Routes', x: 130 },
    { label: 'Notes',  x: 212 },
    { label: 'Profile', x: 294 },
    { label: 'More',   x: 358 },
  ];
  navItems.forEach((n, i) => {
    const active = i === 0;
    s.push(circle(n.x, NAV_Y + 22, 3, active ? GREEN : MUTED));
    s.push(text(n.x, NAV_Y + 46, n.label, 10, active ? GREEN : TEXT2, { anchor: 'middle', fw: active ? 700 : 400 }));
    if (active) s.push(line(n.x - 12, NAV_Y + 54, n.x + 12, NAV_Y + 54, GREEN, { sw: 2 }));
  });

  return s;
}

// ────────────────────────────────────────────────
// SCREEN 2: ROUTES LIBRARY
// ────────────────────────────────────────────────
function buildRoutes() {
  const s = [];
  s.push(rect(0, 0, W, H, BG));

  // Topo bg lines (subtle)
  for (let y = 100; y < 480; y += 28) {
    s.push(line(0, y, W, y, TOPO2, { sw: 0.8 }));
  }

  // Status bar
  s.push(rect(0, 0, W, 44, BG));
  s.push(text(16, 28, '9:41', 15, TEXT, { fw: 600 }));
  s.push(text(W - 16, 28, '●●●  ◆  88%', 12, TEXT, { anchor: 'end' }));

  // Header
  s.push(text(20, 72, 'ROUTES', 11, TEXT2, { fw: 700, ls: 3 }));
  s.push(text(20, 100, 'Your Library', 28, TEXT, { fw: 800 }));

  // Search / filter bar
  s.push(rect(20, 116, W - 40, 40, CARD, { rx: 10 }));
  s.push(text(44, 140, 'Search routes…', 13, MUTED));
  s.push(circle(33, 136, 7, 'none', { stroke: MUTED, sw: 1.5 }));
  s.push(line(38, 141, 42, 145, MUTED, { sw: 1.5 }));

  // Filter chips
  const filters = ['All', 'Saved', 'Completed', 'Hard'];
  let fx = 20;
  filters.forEach((f, i) => {
    const fw = f.length * 8 + 20;
    s.push(rect(fx, 164, fw, 28, i === 0 ? GREEN : CARD, { rx: 14 }));
    s.push(text(fx + fw/2, 182, f, 11, i === 0 ? SURF : TEXT2, { anchor: 'middle', fw: i === 0 ? 700 : 400 }));
    fx += fw + 8;
  });

  // Route cards
  const routes = [
    { name: 'Cairn Ridge Loop',    region: 'Dolomites, IT', dist: '14.2km', gain: '1,240m', diff: 'Hard',   days: '1 day',  tag: AMBER },
    { name: 'Alta Via 1 South',    region: 'Belluno, IT',   dist: '22.8km', gain: '980m',   diff: 'Mod',    days: '2 days', tag: GREEN },
    { name: 'Cinque Torri Circuit', region: 'Cortina, IT',  dist: '8.4km',  gain: '520m',   diff: 'Easy',   days: '½ day',  tag: GREEN },
    { name: 'Marmolada Glacier',   region: 'Trento, IT',    dist: '18.6km', gain: '1,820m', diff: 'Expert', days: '2 days', tag: RED },
  ];

  routes.forEach((r, i) => {
    const ry = 204 + i * 106;
    // Card background
    s.push(rect(20, ry, W - 40, 96, SURF, { rx: 12 }));
    // Difficulty color strip
    s.push(rect(20, ry, 4, 96, r.tag, { rx: 2 }));
    // Map thumbnail area
    s.push(rect(W - 80, ry + 10, 56, 76, CARD, { rx: 8 }));
    // Topo mini lines in thumbnail
    for (let tl = 0; tl < 5; tl++) {
      s.push(line(W - 80, ry + 22 + tl * 12, W - 24, ry + 22 + tl * 12, TOPO, { sw: 0.8 }));
    }
    s.push(line(W - 78, ry + 58, W - 60, ry + 42, GREEN, { sw: 2 }));
    s.push(line(W - 60, ry + 42, W - 44, ry + 35, GREEN, { sw: 2 }));
    s.push(line(W - 44, ry + 35, W - 28, ry + 28, GREEN, { sw: 2 }));
    // Route info
    s.push(text(34, ry + 24, r.name, 14, TEXT, { fw: 700 }));
    s.push(text(34, ry + 42, r.region, 11, TEXT2 ));
    // Stats
    s.push(text(34, ry + 64, r.dist, 12, TEXT, { font: 'Menlo,monospace', fw: 600 }));
    s.push(text(95, ry + 64, '↑' + r.gain, 12, TEXT2, { font: 'Menlo,monospace' }));
    s.push(text(160, ry + 64, r.days, 12, TEXT2, { font: 'Menlo,monospace' }));
    // Diff badge
    s.push(rect(34, ry + 76, r.diff.length * 7 + 12, 14, r.tag === GREEN ? GREEN_L : r.tag === AMBER ? AMBER_L : '#FDECEA', { rx: 7 }));
    s.push(text(40 + (r.diff.length * 7)/2, ry + 86, r.diff, 9, r.tag, { anchor: 'middle', fw: 700 }));
  });

  // Bottom nav
  s.push(rect(0, NAV_Y, W, 80, SURF));
  s.push(line(0, NAV_Y, W, NAV_Y, BORDER, { sw: 0.5 }));
  const navItems = [
    { label: 'Map', x: 48 }, { label: 'Routes', x: 130 }, { label: 'Notes', x: 212 },
    { label: 'Profile', x: 294 }, { label: 'More', x: 358 },
  ];
  navItems.forEach((n, i) => {
    const active = i === 1;
    s.push(circle(n.x, NAV_Y + 22, 3, active ? GREEN : MUTED));
    s.push(text(n.x, NAV_Y + 46, n.label, 10, active ? GREEN : TEXT2, { anchor: 'middle', fw: active ? 700 : 400 }));
    if (active) s.push(line(n.x - 12, NAV_Y + 54, n.x + 12, NAV_Y + 54, GREEN, { sw: 2 }));
  });

  return s;
}

// ────────────────────────────────────────────────
// SCREEN 3: FIELD NOTES (capture screen)
// ────────────────────────────────────────────────
function buildNotes() {
  const s = [];
  s.push(rect(0, 0, W, H, BG));

  // Ruled lines — notebooks feel (the tech-spec grid aesthetic)
  for (let y = 160; y < 650; y += 28) {
    s.push(line(20, y, W - 20, y, BORDER, { sw: 0.5, opacity: 0.7 }));
  }
  // Left margin rule
  s.push(line(56, 140, 56, 650, 'rgba(196,64,50,0.25)', { sw: 1 }));

  // Status bar
  s.push(rect(0, 0, W, 44, BG));
  s.push(text(16, 28, '9:41', 15, TEXT, { fw: 600 }));
  s.push(text(W - 16, 28, '●●●  ◆  88%', 12, TEXT, { anchor: 'end' }));

  // Header
  s.push(text(20, 68, 'FIELD NOTES', 10, TEXT2, { fw: 700, ls: 3 }));
  s.push(text(20, 96, 'Day 1 — Rifugio Auronzo', 20, TEXT, { fw: 800 }));
  s.push(text(20, 118, '11 Apr 2026  ·  46°51\'N 10°24\'E  ·  2,320m', 10, TEXT2, { font: 'Menlo,monospace' }));

  s.push(line(20, 134, W - 20, 134, BORDER, { sw: 0.5 }));

  // Note content on ruled paper
  const lines = [
    { y: 176, txt: 'Weather clearing by 10am, light wind from NW', size: 14, col: TEXT },
    { y: 204, txt: 'Snowpack stable above 2,600m — axe not needed', size: 14, col: TEXT },
    { y: 232, txt: 'Trail junction at 2,180m well-marked with cairns', size: 14, col: TEXT },
    { y: 260, txt: 'Waterfall source: flows year-round (drinkable)', size: 14, col: TEXT },
    { y: 288, txt: '↓ Steep section at km 6.2 — use trekking poles', size: 14, col: AMBER },
    { y: 316, txt: 'Hut opens 7am, lunch 12-2pm. Pays cash only.', size: 14, col: TEXT },
    { y: 344, txt: '', size: 14, col: TEXT },
    { y: 372, txt: 'Flora observed:', size: 13, col: TEXT2 },
    { y: 400, txt: '· Gentiana acaulis (blue, rocky scree at 2,400m)', size: 13, col: TEXT },
    { y: 428, txt: '· Edelweiss small colony — 100m past saddle', size: 13, col: TEXT },
  ];
  lines.forEach(l => {
    s.push(text(64, l.y, l.txt, l.size, l.col));
  });

  // Cursor blink on last line
  s.push(rect(64, 452, 2, 18, GREEN, { opacity: 0.8 }));

  // Tag row
  s.push(text(64, 494, 'Tags:', 11, TEXT2, { fw: 600 }));
  const tags = ['#weather', '#flora', '#water', '#snow'];
  let tx = 110;
  tags.forEach(t => {
    const tw = t.length * 7.5 + 14;
    s.push(rect(tx, 481, tw, 22, GREEN_L, { rx: 11 }));
    s.push(text(tx + tw/2, 495, t, 10, GREEN, { anchor: 'middle', fw: 600 }));
    tx += tw + 8;
  });

  // Divider
  s.push(line(20, 518, W - 20, 518, BORDER, { sw: 0.5 }));

  // Photo attachment placeholder
  s.push(rect(20, 530, 80, 64, CARD, { rx: 8 }));
  s.push(text(60, 566, '🏔', 22, TEXT2, { anchor: 'middle' }));
  s.push(rect(110, 530, 80, 64, CARD, { rx: 8 }));
  s.push(text(150, 566, '🌸', 22, TEXT2, { anchor: 'middle' }));
  s.push(rect(200, 530, 64, 64, CARD, { rx: 8 }));
  s.push(text(232, 566, '+', 22, TEXT2, { anchor: 'middle' }));

  // Bottom toolbar (barely-there — Godly signal)
  s.push(rect(0, 610, W, 44, BG));
  s.push(line(0, 610, W, 610, BORDER, { sw: 0.5 }));
  const tools = ['📍', '📷', '#', '🎙', '⋯'];
  tools.forEach((t, i) => {
    s.push(text(40 + i * 70, 636, t, 18, TEXT2, { anchor: 'middle' }));
  });

  // Bottom nav
  s.push(rect(0, NAV_Y, W, 80, SURF));
  s.push(line(0, NAV_Y, W, NAV_Y, BORDER, { sw: 0.5 }));
  const navItems = [
    { label: 'Map', x: 48 }, { label: 'Routes', x: 130 }, { label: 'Notes', x: 212 },
    { label: 'Profile', x: 294 }, { label: 'More', x: 358 },
  ];
  navItems.forEach((n, i) => {
    const active = i === 2;
    s.push(circle(n.x, NAV_Y + 22, 3, active ? GREEN : MUTED));
    s.push(text(n.x, NAV_Y + 46, n.label, 10, active ? GREEN : TEXT2, { anchor: 'middle', fw: active ? 700 : 400 }));
    if (active) s.push(line(n.x - 12, NAV_Y + 54, n.x + 12, NAV_Y + 54, GREEN, { sw: 2 }));
  });

  return s;
}

// ────────────────────────────────────────────────
// SCREEN 4: ELEVATION PROFILE
// ────────────────────────────────────────────────
function buildElevation() {
  const s = [];
  s.push(rect(0, 0, W, H, BG));

  // Status bar
  s.push(rect(0, 0, W, 44, BG));
  s.push(text(16, 28, '9:41', 15, TEXT, { fw: 600 }));
  s.push(text(W - 16, 28, '●●●  ◆  88%', 12, TEXT, { anchor: 'end' }));

  // Header
  s.push(text(20, 68, 'CAIRN RIDGE LOOP', 10, TEXT2, { fw: 700, ls: 2 }));
  s.push(text(20, 96, 'Elevation Profile', 24, TEXT, { fw: 800 }));

  // Elevation graph area
  const GX = 44, GY = 140, GW = W - 64, GH = 200;

  // Grid lines (tech-spec aesthetic)
  const elevLabels = ['2,840', '2,700', '2,560', '2,420', '2,280', '2,140', '2,000'];
  elevLabels.forEach((lbl, i) => {
    const gy = GY + (i / 6) * GH;
    s.push(line(GX, gy, GX + GW, gy, BORDER, { sw: 0.5 }));
    s.push(text(GX - 6, gy + 4, lbl, 8, MUTED, { anchor: 'end', font: 'Menlo,monospace' }));
  });

  // X-axis labels
  const xLabels = ['0', '2', '4', '6', '8', '10', '12', '14.2'];
  xLabels.forEach((lbl, i) => {
    const gx = GX + (i / 7) * GW;
    s.push(text(gx, GY + GH + 14, lbl, 8, MUTED, { anchor: 'middle', font: 'Menlo,monospace' }));
  });
  s.push(text(GX + GW/2, GY + GH + 28, 'Distance (km)', 9, TEXT2, { anchor: 'middle' }));

  // Elevation profile shape — filled area
  // Points normalized: x=0..GW, y=0..GH (GH = sea, 0 = top)
  // Elevation min=1840, max=2840, range=1000
  function elev2y(e) { return GY + GH - ((e - 1840) / 1000) * GH; }
  function dist2x(d) { return GX + (d / 14.2) * GW; }

  const profile = [
    [0, 1840], [1.0, 1940], [2.0, 2080], [3.0, 2180], [4.1, 2320],
    [5.0, 2400], [6.0, 2500], [7.0, 2560], [8.0, 2620], [8.8, 2680],
    [9.5, 2700], [10.5, 2740], [11.5, 2770], [12.5, 2800], [13.2, 2820],
    [14.2, 2840],
  ];

  // Draw filled area (simulate with rect strips)
  profile.forEach((pt, i) => {
    if (i < profile.length - 1) {
      const x1 = dist2x(pt[0]), y1 = elev2y(pt[1]);
      const x2 = dist2x(profile[i+1][0]), y2 = elev2y(profile[i+1][1]);
      const stripW = x2 - x1;
      const stripH = Math.max(y1, y2) - Math.min(y1, y2);
      // Fill from min y to GY+GH
      s.push(rect(x1, Math.min(y1, y2), stripW, GY + GH - Math.min(y1, y2), 'rgba(58,122,82,0.12)'));
      // Profile line
      s.push(line(x1, y1, x2, y2, GREEN, { sw: 2 }));
    }
  });

  // Current position marker on profile
  const curDist = 8.8, curElev = 2680;
  const cpx = dist2x(curDist), cpy = elev2y(curElev);
  s.push(circle(cpx, cpy, 7, GREEN));
  s.push(circle(cpx, cpy, 3, SURF));
  // Tooltip
  s.push(rect(cpx - 30, cpy - 36, 68, 26, TEXT, { rx: 6 }));
  s.push(text(cpx + 4, cpy - 18, '2,680m', 10, SURF, { anchor: 'middle', font: 'Menlo,monospace' }));

  // Axes
  s.push(line(GX, GY, GX, GY + GH, BORDER, { sw: 1 }));
  s.push(line(GX, GY + GH, GX + GW, GY + GH, BORDER, { sw: 1 }));

  // Key terrain features marked
  const markers = [
    { dist: 4.1, elev: 2320, label: 'Rifugio' },
    { dist: 8.8, elev: 2680, label: 'Saddle' },
    { dist: 14.2, elev: 2840, label: 'Summit' },
  ];
  markers.forEach(m => {
    const mx = dist2x(m.dist), my = elev2y(m.elev);
    if (m.label !== 'Saddle') {
      s.push(line(mx, my - 18, mx, my - 6, MUTED, { sw: 0.8 }));
      s.push(text(mx, my - 22, m.label, 8, TEXT2, { anchor: 'middle' }));
    }
  });

  // Stats cards row
  const statsY = GY + GH + 50;
  const statCards = [
    { label: 'TOTAL GAIN', val: '1,240m', icon: '↑' },
    { label: 'TOTAL LOSS', val: '440m',   icon: '↓' },
    { label: 'MAX ELEV',   val: '2,840m', icon: '▲' },
    { label: 'MIN ELEV',   val: '1,840m', icon: '▼' },
  ];
  const cardW = (W - 40 - 3*8) / 4;
  statCards.forEach((sc, i) => {
    const cx = 20 + i * (cardW + 8);
    s.push(rect(cx, statsY, cardW, 68, SURF, { rx: 10 }));
    s.push(text(cx + cardW/2, statsY + 16, sc.label, 7, TEXT2, { anchor: 'middle', fw: 600, ls: 0.5 }));
    s.push(text(cx + cardW/2, statsY + 36, sc.icon, 12, GREEN, { anchor: 'middle' }));
    s.push(text(cx + cardW/2, statsY + 54, sc.val, 11, TEXT, { anchor: 'middle', fw: 700, font: 'Menlo,monospace' }));
  });

  // Difficulty breakdown bar
  s.push(text(20, statsY + 90, 'GRADE BREAKDOWN', 9, TEXT2, { fw: 600, ls: 2 }));
  const gradeBars = [
    { label: 'Flat',     pct: 0.12, col: GREEN_L, tc: GREEN },
    { label: 'Moderate', pct: 0.38, col: GREEN_L,  tc: GREEN },
    { label: 'Steep',    pct: 0.36, col: AMBER_L,  tc: AMBER },
    { label: 'Severe',   pct: 0.14, col: '#FDECEA', tc: RED },
  ];
  let gbx = 20;
  gradeBars.forEach(gb => {
    const gbw = (W - 40) * gb.pct;
    s.push(rect(gbx, statsY + 106, gbw - 2, 16, gb.col, { rx: 4 }));
    gbx += gbw;
  });
  // Legend
  gradeBars.forEach((gb, i) => {
    const lx = 20 + i * 86;
    s.push(rect(lx, statsY + 130, 8, 8, gb.tc === GREEN ? GREEN : gb.tc, { rx: 2, opacity: 0.6 }));
    s.push(text(lx + 12, statsY + 138, gb.label, 9, TEXT2));
  });

  // Segment table
  s.push(text(20, statsY + 158, 'SEGMENTS', 9, TEXT2, { fw: 600, ls: 2 }));
  const segs = [
    { name: 'Trailhead → Rifugio', dist: '4.1km', gain: '+480m', time: '1h45m' },
    { name: 'Rifugio → Saddle',    dist: '4.7km', gain: '+360m', time: '2h10m' },
    { name: 'Saddle → Summit',     dist: '5.4km', gain: '+400m', time: '2h25m' },
  ];
  segs.forEach((seg, i) => {
    const sy2 = statsY + 172 + i * 38;
    s.push(rect(20, sy2, W - 40, 34, SURF, { rx: 8 }));
    s.push(text(30, sy2 + 14, seg.name, 11, TEXT, { fw: 500 }));
    s.push(text(30, sy2 + 27, seg.dist + '  ' + seg.gain, 10, TEXT2, { font: 'Menlo,monospace' }));
    s.push(text(W - 30, sy2 + 21, seg.time, 11, TEXT2, { anchor: 'end', font: 'Menlo,monospace', fw: 600 }));
  });

  // Bottom nav
  s.push(rect(0, NAV_Y, W, 80, SURF));
  s.push(line(0, NAV_Y, W, NAV_Y, BORDER, { sw: 0.5 }));
  const navItems = [
    { label: 'Map', x: 48 }, { label: 'Routes', x: 130 }, { label: 'Notes', x: 212 },
    { label: 'Profile', x: 294 }, { label: 'More', x: 358 },
  ];
  navItems.forEach((n, i) => {
    const active = i === 3;
    s.push(circle(n.x, NAV_Y + 22, 3, active ? GREEN : MUTED));
    s.push(text(n.x, NAV_Y + 46, n.label, 10, active ? GREEN : TEXT2, { anchor: 'middle', fw: active ? 700 : 400 }));
    if (active) s.push(line(n.x - 12, NAV_Y + 54, n.x + 12, NAV_Y + 54, GREEN, { sw: 2 }));
  });

  return s;
}

// ────────────────────────────────────────────────
// SCREEN 5: WAYPOINT DETAIL
// ────────────────────────────────────────────────
function buildWaypoint() {
  const s = [];
  s.push(rect(0, 0, W, H, BG));

  // Status bar
  s.push(rect(0, 0, W, 44, BG));
  s.push(text(16, 28, '9:41', 15, TEXT, { fw: 600 }));
  s.push(text(W - 16, 28, '●●●  ◆  88%', 12, TEXT, { anchor: 'end' }));

  // Back nav
  s.push(text(20, 72, '← Routes', 13, GREEN, { fw: 600 }));

  // Waypoint title
  s.push(text(20, 104, 'WAYPOINT', 10, TEXT2, { fw: 700, ls: 3 }));
  s.push(text(20, 134, 'Tre Cime Saddle', 26, TEXT, { fw: 800 }));
  s.push(text(20, 156, 'Cairn Ridge Loop · km 8.8', 12, TEXT2 ));

  // Coordinate readout (monospace, prominent)
  s.push(rect(20, 170, W - 40, 44, CARD, { rx: 10 }));
  s.push(text(36, 196, '46°51\'14"N  12°17\'38"E  ·  2,680m', 12, TEXT, { font: 'Menlo,monospace', fw: 600 }));

  // Mini map thumbnail
  s.push(rect(20, 226, W - 40, 140, CARD, { rx: 12 }));
  // Topo lines in thumbnail
  for (let tl = 0; tl < 6; tl++) {
    s.push(line(20, 240 + tl * 18, W - 20, 240 + tl * 18, TOPO, { sw: 0.8 }));
  }
  // Trail line in thumbnail
  s.push(line(50, 346, 130, 310, GREEN, { sw: 2 }));
  s.push(line(130, 310, 210, 280, GREEN, { sw: 2 }));
  s.push(line(210, 280, 280, 258, GREEN, { sw: 2 }));
  // Waypoint dot
  s.push(circle(210, 280, 8, GREEN));
  s.push(circle(210, 280, 3, SURF));
  s.push(text(222, 276, 'You', 9, GREEN, { fw: 700 }));

  // Detail fields
  s.push(line(20, 378, W - 20, 378, BORDER, { sw: 0.5 }));

  const fields = [
    { label: 'ELEVATION',   val: '2,680 m',    sub: '+840m from trailhead' },
    { label: 'DISTANCE IN', val: '8.8 km',      sub: 'from trailhead' },
    { label: 'REMAINING',   val: '5.4 km',      sub: 'to summit' },
    { label: 'CONDITION',   val: 'Snow Patches', sub: 'reported 3 days ago', warn: true },
    { label: 'WATER',       val: 'Stream 80m',  sub: 'W bearing, reliable' },
  ];
  fields.forEach((f, i) => {
    const fy = 390 + i * 52;
    s.push(text(20, fy, f.label, 9, TEXT2, { fw: 600, ls: 1.5 }));
    s.push(text(20, fy + 20, f.val, 16, f.warn ? AMBER : TEXT, { fw: 700, font: 'Menlo,monospace' }));
    s.push(text(20, fy + 36, f.sub, 10, TEXT2));
    if (i < 4) s.push(line(20, fy + 46, W - 20, fy + 46, BORDER, { sw: 0.4 }));
  });

  // Action buttons
  s.push(rect(20, 660, (W - 48)/2, 44, GREEN, { rx: 12 }));
  s.push(text(20 + (W - 48)/4, 686, 'Navigate Here', 13, SURF, { anchor: 'middle', fw: 700 }));
  s.push(rect(20 + (W - 48)/2 + 8, 660, (W - 48)/2, 44, CARD, { rx: 12 }));
  s.push(text(20 + (W - 48)*3/4 + 8, 686, 'Add Note', 13, TEXT, { anchor: 'middle', fw: 600 }));

  // Bottom nav
  s.push(rect(0, NAV_Y, W, 80, SURF));
  s.push(line(0, NAV_Y, W, NAV_Y, BORDER, { sw: 0.5 }));
  const navItems = [
    { label: 'Map', x: 48 }, { label: 'Routes', x: 130 }, { label: 'Notes', x: 212 },
    { label: 'Profile', x: 294 }, { label: 'More', x: 358 },
  ];
  navItems.forEach((n, i) => {
    s.push(circle(n.x, NAV_Y + 22, 3, MUTED));
    s.push(text(n.x, NAV_Y + 46, n.label, 10, TEXT2, { anchor: 'middle' }));
  });

  return s;
}

// ────────────────────────────────────────────────
// SCREEN 6: ACTIVE TRACKING
// ────────────────────────────────────────────────
function buildTracking() {
  const s = [];
  s.push(rect(0, 0, W, H, BG));

  // Topographic bg
  for (let y = 90; y < 500; y += 24) {
    s.push(line(0, y, W, y, TOPO2, { sw: 0.8 }));
  }
  // Some curved contour lines
  s.push(line(0, 180, 60, 165, TOPO, { sw: 1 }));
  s.push(line(60, 165, 200, 158, TOPO, { sw: 1 }));
  s.push(line(200, 158, W, 170, TOPO, { sw: 1 }));
  s.push(line(0, 220, 90, 202, TOPO, { sw: 0.8 }));
  s.push(line(90, 202, 240, 196, TOPO, { sw: 0.8 }));
  s.push(line(240, 196, W, 208, TOPO, { sw: 0.8 }));

  // Status bar
  s.push(rect(0, 0, W, 44, 'rgba(246,243,238,0.95)'));
  s.push(text(16, 28, '9:41', 15, TEXT, { fw: 600 }));
  s.push(text(W - 16, 28, '● REC  88%', 12, RED, { anchor: 'end', fw: 600 }));

  // Active tracking indicator
  s.push(rect(0, 44, W, 32, RED, { opacity: 0.08 }));
  s.push(circle(20, 60, 4, RED));
  s.push(text(32, 64, 'RECORDING TRACK', 10, RED, { fw: 700, ls: 2 }));
  s.push(text(W - 20, 64, '03:42:18', 10, RED, { anchor: 'end', font: 'Menlo,monospace', fw: 700 }));

  // Live map area (compact)
  s.push(rect(20, 90, W - 40, 200, SURF, { rx: 12, opacity: 0.9 }));
  // Trail so far (tracked path)
  s.push(line(60, 268, 100, 238, GREEN, { sw: 2.5 }));
  s.push(line(100, 238, 150, 210, GREEN, { sw: 2.5 }));
  s.push(line(150, 210, 195, 188, GREEN, { sw: 2.5 }));
  // Remaining dashed
  s.push(line(195, 188, 230, 168, MUTED, { sw: 1.5, opacity: 0.6 }));
  s.push(line(230, 168, 270, 152, MUTED, { sw: 1.5, opacity: 0.6 }));
  s.push(line(270, 152, 310, 138, MUTED, { sw: 1.5, opacity: 0.6 }));
  // Current position
  s.push(circle(195, 188, 12, 'rgba(58,122,82,0.2)'));
  s.push(circle(195, 188, 7, GREEN));
  s.push(circle(195, 188, 3, SURF));
  // Grid coords on map
  s.push(text(28, 104, '46°51\'N', 8, MUTED, { font: 'Menlo,monospace' }));
  s.push(text(28, 116, '10°24\'E', 8, MUTED, { font: 'Menlo,monospace' }));

  // Live stats panel
  s.push(rect(0, 302, W, 160, SURF));
  s.push(line(0, 302, W, 302, BORDER, { sw: 0.5 }));

  const liveStats = [
    { label: 'DISTANCE',  val: '8.2',  unit: 'km',  col: TEXT },
    { label: 'ELEVATION', val: '2,520', unit: 'm',   col: TEXT },
    { label: 'SPEED',     val: '3.4',  unit: 'km/h', col: GREEN },
    { label: 'GAIN',      val: '+680', unit: 'm',    col: AMBER },
  ];
  liveStats.forEach((ls2, i) => {
    const lx = 20 + i * 90;
    s.push(text(lx, 330, ls2.label, 8, TEXT2, { fw: 600, ls: 1 }));
    s.push(text(lx, 360, ls2.val, 28, ls2.col, { fw: 800, font: 'Menlo,monospace' }));
    s.push(text(lx, 378, ls2.unit, 10, TEXT2));
  });

  s.push(line(20, 392, W - 20, 392, BORDER, { sw: 0.4 }));

  // Progress to next waypoint
  s.push(text(20, 410, 'NEXT WAYPOINT', 9, TEXT2, { fw: 600, ls: 1.5 }));
  s.push(text(W - 20, 410, '0.6 km', 9, GREEN, { anchor: 'end', fw: 700, font: 'Menlo,monospace' }));
  s.push(text(20, 428, 'Tre Cime Saddle', 14, TEXT, { fw: 600 }));
  // Progress bar
  s.push(rect(20, 440, W - 40, 8, CARD, { rx: 4 }));
  s.push(rect(20, 440, (W - 40) * 0.93, 8, GREEN, { rx: 4 }));

  // Alert card
  s.push(rect(20, 460, W - 40, 48, AMBER_L, { rx: 10 }));
  s.push(rect(20, 460, 4, 48, AMBER, { rx: 2 }));
  s.push(text(34, 480, '⚠ Steep section ahead — 34% grade, 200m', 11, AMBER, { fw: 600 }));
  s.push(text(34, 498, 'Consider trekking poles · est. +18 min', 10, TEXT2 ));

  // Control buttons
  s.push(rect(20, 520, (W-52)/3, 52, CARD, { rx: 12 }));
  s.push(text(20 + (W-52)/6, 548, '📍 Mark', 12, TEXT, { anchor: 'middle', fw: 600 }));

  s.push(rect(28 + (W-52)/3, 520, (W-52)/3, 52, CARD, { rx: 12 }));
  s.push(text(28 + (W-52)/2, 548, '📷 Photo', 12, TEXT, { anchor: 'middle', fw: 600 }));

  s.push(rect(36 + 2*(W-52)/3, 520, (W-52)/3, 52, CARD, { rx: 12 }));
  s.push(text(36 + 5*(W-52)/6, 548, '⏸ Pause', 12, TEXT, { anchor: 'middle', fw: 600 }));

  // Stop button (prominent)
  s.push(rect(20, 584, W - 40, 48, RED, { rx: 12, opacity: 0.12 }));
  s.push(rect(20, 584, W - 40, 48, 'none', { rx: 12, stroke: RED, sw: 1, opacity: 0.4 }));
  s.push(text(W/2, 612, '■  End Track', 14, RED, { anchor: 'middle', fw: 700 }));

  // Bottom nav
  s.push(rect(0, NAV_Y, W, 80, SURF));
  s.push(line(0, NAV_Y, W, NAV_Y, BORDER, { sw: 0.5 }));
  const navItems = [
    { label: 'Map', x: 48 }, { label: 'Routes', x: 130 }, { label: 'Notes', x: 212 },
    { label: 'Profile', x: 294 }, { label: 'More', x: 358 },
  ];
  navItems.forEach((n, i) => {
    const active = i === 0;
    s.push(circle(n.x, NAV_Y + 22, 3, active ? GREEN : MUTED));
    s.push(text(n.x, NAV_Y + 46, n.label, 10, active ? GREEN : TEXT2, { anchor: 'middle', fw: active ? 700 : 400 }));
    if (active) {
      s.push(rect(n.x - 6, NAV_Y + 12, 12, 12, RED, { rx: 6, opacity: 0.8 })); // REC dot
    }
  });

  return s;
}

// ────────────────────────────────────────────────
// ASSEMBLE
// ────────────────────────────────────────────────
const screens = [
  { name: 'Map',       elements: buildMap()       },
  { name: 'Routes',    elements: buildRoutes()     },
  { name: 'Notes',     elements: buildNotes()      },
  { name: 'Elevation', elements: buildElevation()  },
  { name: 'Waypoint',  elements: buildWaypoint()   },
  { name: 'Tracking',  elements: buildTracking()   },
];

const total = screens.reduce((acc, sc) => acc + sc.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'CAIRN',
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'light',
    heartbeat: 467,
    elements: total,
    description: 'Trail planning & field notes app. Parchment canvas, topographic contour lines as design motif, monospace coordinates throughout, barely-there chrome with typography doing the heavy lifting. Inspired by Land-book\'s tech-spec grid aesthetic and Godly\'s invisible UI trend.',
  },
  screens: screens.map(sc => ({
    name: sc.name,
    svg: `${W}x${H}`,
    elements: sc.elements,
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`CAIRN: ${screens.length} screens, ${total} elements`);
console.log(`Written: ${SLUG}.pen`);
