'use strict';
const fs = require('fs'), path = require('path');

// ─── VANE: Hyper-local Weather Intelligence ────────────────────────────────
// Heartbeat #492 — Dark theme
// Inspired by:
//   · Godly.website signal: single-hue monochrome buildouts — entire sites built
//     around one pushed color (electric cobalt on near-black) with tone-on-tone
//     texture and full discipline (no secondary palette). High saturation, high rigor.
//   · Lapa.ninja "OWO" wearable companion + "Future" fitness app: data-rich dark
//     interfaces for outdoor/body athletes with dense metric grids and zero wasted space.
//   · NNGroup "Outcome-Oriented Design" (March 2026): nav reflects goals, not tasks.
//     VANE's Insights screen surfaces "best conditions this week" not raw logs.
//   · Lapa.ninja "Interlude" calm-tech pattern: subtle ambient glow backgrounds that
//     change with conditions rather than hard flat fills.
// ─────────────────────────────────────────────────────────────────────────────

const SLUG = 'vane';
const W = 390, H = 844;

// ─── PALETTE — Electric cobalt single-hue monochrome ─────────────────────
const BG       = '#06091A';   // deep navy near-black
const SURF     = '#0C1228';   // navy surface
const CARD     = '#101830';   // card bg
const CARD2    = '#141E38';   // elevated card
const BORDER   = 'rgba(42,100,255,0.18)';
const GLOW     = 'rgba(26,108,255,0.10)';
const TEXT     = '#DCE8FF';   // blue-tinted white
const TEXT2    = '#7A9ACC';   // blue-tinted mid
const MUTED    = '#3D5A8A';   // muted blue
const BLUE     = '#1E6EFF';   // electric cobalt primary
const BLUE_L   = '#4A8AFF';   // lighter cobalt
const BLUE_D   = '#0A3A99';   // deep cobalt
const BLUE_XL  = '#D4E2FF';   // near-white cobalt tint
const AMBER    = '#F59E0B';   // alert only — used sparingly
const RED      = '#EF4444';   // danger alert only
const GREEN    = '#22C55E';   // safe/clear only
const MONO     = 'JetBrains Mono,Menlo,monospace';
const SANS     = 'Inter,sans-serif';
const TIGHT    = 'Inter Tight,Inter,sans-serif';

const NAV_Y = H - 72;

function rect(x,y,w,h,fill,opts={}) { return { type:'rect', x, y, w, h, fill, ...opts }; }
function text(x,y,content,size,fill,opts={}) { return { type:'text', x, y, content: String(content), size, fill, ...opts }; }
function circle(cx,cy,r,fill,opts={}) { return { type:'circle', cx, cy, r, fill, ...opts }; }
function line(x1,y1,x2,y2,stroke,opts={}) { return { type:'line', x1, y1, x2, y2, stroke, ...opts }; }

// ──────────────────────────────────────────────────────
// SCREEN 1: NOW — Current conditions, hero display
// ──────────────────────────────────────────────────────
function buildNow() {
  const s = [];
  s.push(rect(0, 0, W, H, BG));

  // Ambient glow — cobalt radial hint
  s.push(rect(60, 80, 270, 270, GLOW, { rx: 135 }));
  s.push(rect(80, 100, 230, 230, 'rgba(26,110,255,0.06)', { rx: 115 }));

  // Status bar
  s.push(text(16, 28, '9:41', 15, TEXT, { fw: 500, font: MONO }));
  s.push(text(W - 16, 28, '◈ GPS  ●●●  88%', 12, TEXT2, { anchor: 'end', font: MONO }));

  // Location header
  s.push(text(20, 62, 'VANE', 13, BLUE, { fw: 700, ls: 3, font: TIGHT }));
  s.push(text(20, 84, 'Stinson Beach, CA', 22, TEXT, { fw: 600 }));
  s.push(text(20, 108, 'Updated 3 min ago', 12, TEXT2 ));

  s.push(line(20, 122, W - 20, 122, BORDER, { sw: 0.5 }));

  // BIG temperature — hero number
  s.push(text(W / 2, 220, '14°', 96, TEXT, { anchor: 'middle', fw: 200, font: MONO }));
  s.push(text(W / 2, 240, 'CELSIUS', 9, MUTED, { anchor: 'middle', ls: 3, font: TIGHT }));

  // Condition badge
  s.push(rect(W / 2 - 52, 252, 104, 28, BLUE_D, { rx: 14 }));
  s.push(text(W / 2, 270, 'Partly Cloudy', 12, BLUE_L, { anchor: 'middle', fw: 500 }));

  // Feels like + hi/lo
  s.push(text(W / 2 - 60, 302, 'Feels 11°', 13, TEXT2, { anchor: 'middle', font: MONO }));
  s.push(text(W / 2, 302, '↑ 17°', 13, BLUE_L, { anchor: 'middle', font: MONO }));
  s.push(text(W / 2 + 60, 302, '↓ 9°', 13, TEXT2, { anchor: 'middle', font: MONO }));

  // Wind section — primary outdoor metric
  s.push(line(20, 324, W - 20, 324, BORDER, { sw: 0.4 }));
  s.push(text(20, 348, 'WIND', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));
  s.push(text(20, 374, '18', 42, BLUE, { fw: 300, font: MONO }));
  s.push(text(62, 374, 'km/h', 14, TEXT2, { font: TIGHT }));
  s.push(text(20, 394, 'SSW — gusts 28 km/h', 12, TEXT2, { font: MONO }));

  // Wind compass rose — simplified
  const cx = W - 70, cy = 362;
  s.push(circle(cx, cy, 36, CARD2, { stroke: BORDER, sw: 1 }));
  s.push(circle(cx, cy, 28, 'rgba(30,110,255,0.08)'));
  // Cardinal marks
  [['N',0],['E',90],['S',180],['W',270]].forEach(([label, deg]) => {
    const rad = (deg - 90) * Math.PI / 180;
    const lx = cx + Math.cos(rad) * 22;
    const ly = cy + Math.sin(rad) * 22;
    s.push(text(lx, ly + 4, label, 8, MUTED, { anchor: 'middle', font: MONO }));
  });
  // Wind direction arrow (SSW = 202.5°)
  const arrowRad = (202.5 - 90) * Math.PI / 180;
  s.push(line(cx, cy, cx + Math.cos(arrowRad) * 20, cy + Math.sin(arrowRad) * 20, BLUE, { sw: 2 }));
  s.push(circle(cx, cy, 3, BLUE));

  s.push(line(20, 418, W - 20, 418, BORDER, { sw: 0.4 }));

  // Condition grid — 4 metrics
  const metrics = [
    { label: 'HUMIDITY', val: '78%' },
    { label: 'PRESSURE', val: '1012' },
    { label: 'VISIBILITY', val: '16 km' },
    { label: 'UV INDEX', val: '3 · Low' },
  ];
  metrics.forEach((m, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const mx = col === 0 ? 20 : W / 2 + 10;
    const my = 448 + row * 58;
    s.push(rect(mx - 4, my - 20, W / 2 - 24, 52, CARD, { rx: 10 }));
    s.push(text(mx + 8, my - 4, m.label, 9, MUTED, { fw: 600, ls: 1.5, font: TIGHT }));
    s.push(text(mx + 8, my + 22, m.val, 18, TEXT, { fw: 300, font: MONO }));
  });

  // Swell / wave height (surf-specific) — outcome-oriented
  s.push(line(20, 578, W - 20, 578, BORDER, { sw: 0.4 }));
  s.push(text(20, 600, 'SURF CONDITIONS', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));
  s.push(rect(20, 612, W - 40, 44, CARD2, { rx: 10, stroke: BORDER, sw: 1 }));
  s.push(text(36, 638, '1.2 – 1.8 m', 16, BLUE_L, { fw: 500, font: MONO }));
  s.push(text(W - 36, 638, '12s period · W swell', 12, TEXT2, { anchor: 'end', font: MONO }));

  // Air quality
  s.push(line(20, 668, W - 20, 668, BORDER, { sw: 0.4 }));
  s.push(text(20, 688, 'AIR QUALITY', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));
  s.push(rect(20, 700, W - 40, 14, CARD, { rx: 7 }));
  s.push(rect(20, 700, (W - 40) * 0.28, 14, GREEN, { rx: 7 }));
  s.push(text(20, 730, 'AQI 32 — Good', 13, GREEN, { font: MONO }));
  s.push(text(W - 20, 730, 'PM 2.5: 7 μg/m³', 12, TEXT2, { anchor: 'end', font: MONO }));

  // Bottom nav
  _addNav(s, 'now');
  return s;
}

// ──────────────────────────────────────────────────────
// SCREEN 2: FORECAST — Hourly + 7-day
// ──────────────────────────────────────────────────────
function buildForecast() {
  const s = [];
  s.push(rect(0, 0, W, H, BG));

  // Status bar
  s.push(rect(0, 0, W, 44, BG));
  s.push(text(16, 28, '9:41', 15, TEXT, { fw: 500, font: MONO }));
  s.push(text(W - 16, 28, '●●●  88%', 12, TEXT2, { anchor: 'end', font: MONO }));

  // Header
  s.push(text(20, 70, 'Forecast', 28, TEXT, { fw: 600 }));
  s.push(text(20, 96, 'Stinson Beach — Next 7 days', 13, TEXT2));

  s.push(line(20, 112, W - 20, 112, BORDER, { sw: 0.4 }));

  // HOURLY STRIP — 8 columns
  s.push(text(20, 136, 'HOURLY', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));
  const hours = ['Now','14h','15h','16h','17h','18h','19h','20h'];
  const htemps = [14, 15, 16, 16, 15, 14, 13, 12];
  const hwinds = [18, 20, 22, 24, 22, 19, 17, 15];
  const hconds = ['⛅','⛅','☁','☁','🌤','🌤','🌙','🌙'];
  hours.forEach((h, i) => {
    const hx = 24 + i * 43;
    const isNow = i === 0;
    s.push(rect(hx - 8, 148, 38, 92, isNow ? BLUE_D : CARD, { rx: 10, stroke: isNow ? BLUE : BORDER, sw: isNow ? 1.5 : 0.5 }));
    s.push(text(hx + 11, 164, h, 9, isNow ? BLUE_XL : TEXT2, { anchor: 'middle', font: MONO }));
    s.push(text(hx + 11, 186, hconds[i], 14, TEXT, { anchor: 'middle' }));
    s.push(text(hx + 11, 206, htemps[i]+'°', 13, isNow ? BLUE_XL : TEXT, { anchor: 'middle', font: MONO, fw: isNow ? 600 : 400 }));
    s.push(text(hx + 11, 224, hwinds[i]+'k', 9, TEXT2, { anchor: 'middle', font: MONO }));
  });

  // Wind forecast bar chart
  s.push(line(20, 256, W - 20, 256, BORDER, { sw: 0.4 }));
  s.push(text(20, 276, 'WIND SPEED (km/h)', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));
  const windData = [18,20,22,24,22,19,17,15];
  const maxWind = 30;
  windData.forEach((w, i) => {
    const bx = 24 + i * 43;
    const barH = (w / maxWind) * 60;
    s.push(rect(bx + 3, 342 - barH, 24, barH, i <= 3 ? BLUE : BLUE_D, { rx: 4 }));
    s.push(text(bx + 15, 356, w, 9, TEXT2, { anchor: 'middle', font: MONO }));
  });
  s.push(line(24, 342, W - 24, 342, BORDER, { sw: 0.3 }));

  s.push(line(20, 374, W - 20, 374, BORDER, { sw: 0.4 }));

  // 7-DAY FORECAST rows
  s.push(text(20, 396, '7-DAY OUTLOOK', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));
  const days = [
    { day: 'TODAY',  cond: 'Partly Cloudy', hi: 17, lo: 9,  wind: 18, icon: '⛅' },
    { day: 'MON',    cond: 'Sunny',         hi: 20, lo: 11, wind: 14, icon: '☀️' },
    { day: 'TUE',    cond: 'Sunny',         hi: 22, lo: 12, wind: 12, icon: '☀️' },
    { day: 'WED',    cond: 'Windy',         hi: 18, lo: 10, wind: 32, icon: '💨' },
    { day: 'THU',    cond: 'Rain Likely',   hi: 14, lo: 8,  wind: 24, icon: '🌧' },
    { day: 'FRI',    cond: 'Showers',       hi: 12, lo: 7,  wind: 28, icon: '🌦' },
    { day: 'SAT',    cond: 'Clearing',      hi: 16, lo: 9,  wind: 20, icon: '🌤' },
  ];
  days.forEach((d, i) => {
    const ry = 412 + i * 52;
    const isToday = i === 0;
    s.push(rect(20, ry, W - 40, 44, isToday ? 'rgba(30,110,255,0.08)' : CARD, { rx: 10, stroke: isToday ? 'rgba(30,110,255,0.3)' : BORDER, sw: 0.5 }));
    s.push(text(32, ry + 16, d.icon, 16, TEXT));
    s.push(text(60, ry + 16, d.day, 12, isToday ? BLUE_L : TEXT2, { fw: 600, font: TIGHT }));
    s.push(text(60, ry + 32, d.cond, 11, TEXT2));
    s.push(text(W - 36, ry + 16, d.hi + '°', 14, TEXT, { anchor: 'end', font: MONO, fw: 500 }));
    s.push(text(W - 36, ry + 32, d.lo + '°', 11, MUTED, { anchor: 'end', font: MONO }));
    // Wind indicator
    const windW = Math.min((d.wind / 40) * 60, 60);
    s.push(rect(W - 120, ry + 20, 60, 6, CARD2, { rx: 3 }));
    s.push(rect(W - 120, ry + 20, windW, 6, d.wind > 28 ? AMBER : BLUE_D, { rx: 3 }));
    s.push(text(W - 125, ry + 24, d.wind + 'k', 9, TEXT2, { anchor: 'end', font: MONO }));
  });

  _addNav(s, 'forecast');
  return s;
}

// ──────────────────────────────────────────────────────
// SCREEN 3: ALERTS — Weather warnings by severity
// ──────────────────────────────────────────────────────
function buildAlerts() {
  const s = [];
  s.push(rect(0, 0, W, H, BG));

  s.push(rect(0, 0, W, 44, BG));
  s.push(text(16, 28, '9:41', 15, TEXT, { fw: 500, font: MONO }));
  s.push(text(W - 16, 28, '●●●  88%', 12, TEXT2, { anchor: 'end', font: MONO }));

  s.push(text(20, 70, 'Alerts', 28, TEXT, { fw: 600 }));
  s.push(text(20, 96, '2 active · 1 expired', 13, TEXT2, { font: MONO }));

  s.push(line(20, 112, W - 20, 112, BORDER, { sw: 0.4 }));

  // ACTIVE ALERTS
  s.push(text(20, 134, 'ACTIVE', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));

  // High Wind Warning — RED severity
  s.push(rect(20, 148, W - 40, 120, 'rgba(239,68,68,0.06)', { rx: 14, stroke: 'rgba(239,68,68,0.3)', sw: 1 }));
  s.push(rect(20, 148, 4, 120, RED, { rx: 2 }));
  s.push(text(36, 170, '⚠', 16, RED));
  s.push(text(58, 170, 'HIGH WIND WARNING', 13, RED, { fw: 700, font: TIGHT }));
  s.push(text(36, 192, 'Wed Apr 13, 14:00 – 22:00', 11, TEXT2, { font: MONO }));
  s.push(line(36, 204, W - 36, 204, 'rgba(239,68,68,0.15)', { sw: 0.5 }));
  s.push(text(36, 220, 'Sustained winds 45–60 km/h. Gusts up to', 12, TEXT, { fw: 300 }));
  s.push(text(36, 237, '85 km/h possible. Avoid coastal exposure.', 12, TEXT, { fw: 300 }));
  s.push(text(36, 256, 'Issued by NWS Bay Area · Tap for details', 11, TEXT2, { font: MONO }));

  // Coastal Flood Advisory — AMBER severity
  s.push(rect(20, 282, W - 40, 110, 'rgba(245,158,11,0.06)', { rx: 14, stroke: 'rgba(245,158,11,0.28)', sw: 1 }));
  s.push(rect(20, 282, 4, 110, AMBER, { rx: 2 }));
  s.push(text(36, 304, '◈', 14, AMBER));
  s.push(text(58, 304, 'COASTAL FLOOD ADVISORY', 12, AMBER, { fw: 700, font: TIGHT }));
  s.push(text(36, 326, 'Wed Apr 13, 18:00 – 22:00', 11, TEXT2, { font: MONO }));
  s.push(line(36, 338, W - 36, 338, 'rgba(245,158,11,0.15)', { sw: 0.5 }));
  s.push(text(36, 354, 'Minor coastal flooding in low-lying areas', 12, TEXT, { fw: 300 }));
  s.push(text(36, 371, 'near tide. High tide at 19:32 (1.8m).', 12, TEXT, { fw: 300 }));
  s.push(text(36, 383, 'Issued by NWS Bay Area', 11, TEXT2, { font: MONO }));

  s.push(line(20, 410, W - 20, 410, BORDER, { sw: 0.4 }));
  s.push(text(20, 430, 'RECENT', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));

  // Expired alert
  s.push(rect(20, 444, W - 40, 84, CARD, { rx: 12, opacity: 0.5, stroke: BORDER, sw: 0.5 }));
  s.push(text(36, 466, 'Dense Fog Advisory — Expired', 13, TEXT2, { fw: 400 }));
  s.push(text(36, 484, 'Apr 11, 06:00 – 09:30', 11, MUTED, { font: MONO }));
  s.push(text(36, 502, 'Morning marine layer. Visibility < 0.4 km.', 12, MUTED, { fw: 300 }));
  s.push(text(36, 519, 'EXPIRED', 10, MUTED, { ls: 2, font: TIGHT }));

  s.push(line(20, 542, W - 20, 542, BORDER, { sw: 0.4 }));

  // Alert preferences — outcome-oriented: push what matters to you
  s.push(text(20, 562, 'YOUR ALERT PROFILE', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));
  const prefs = [
    { label: 'High Wind (> 40 km/h)', active: true },
    { label: 'Surf Alert (> 2m swell)', active: true },
    { label: 'Air Quality (AQI > 100)', active: false },
    { label: 'Frost / Freeze Warning', active: false },
  ];
  prefs.forEach((p, i) => {
    const py = 578 + i * 40;
    s.push(rect(20, py, W - 40, 34, CARD, { rx: 8 }));
    s.push(text(36, py + 20, p.label, 13, p.active ? TEXT : TEXT2));
    // Toggle
    s.push(rect(W - 56, py + 8, 36, 18, p.active ? BLUE : CARD2, { rx: 9 }));
    s.push(circle(p.active ? W - 27 : W - 45, py + 17, 7, p.active ? BLUE_XL : MUTED));
  });

  _addNav(s, 'alerts');
  return s;
}

// ──────────────────────────────────────────────────────
// SCREEN 4: LOCATIONS — Saved spots
// ──────────────────────────────────────────────────────
function buildLocations() {
  const s = [];
  s.push(rect(0, 0, W, H, BG));

  s.push(rect(0, 0, W, 44, BG));
  s.push(text(16, 28, '9:41', 15, TEXT, { fw: 500, font: MONO }));
  s.push(text(W - 16, 28, '●●●  88%', 12, TEXT2, { anchor: 'end', font: MONO }));

  s.push(text(20, 70, 'Locations', 28, TEXT, { fw: 600 }));

  // Search bar
  s.push(rect(20, 86, W - 40, 40, CARD, { rx: 12, stroke: BORDER, sw: 0.5 }));
  s.push(text(36, 111, '⊕', 14, MUTED));
  s.push(text(56, 111, 'Search or add a location…', 14, MUTED));

  s.push(line(20, 138, W - 20, 138, BORDER, { sw: 0.4 }));
  s.push(text(20, 158, 'SAVED LOCATIONS', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));

  const locs = [
    { name: 'Stinson Beach, CA',   cond: 'Partly Cloudy', temp: 14, wind: 18, surf: '1.2m', active: true },
    { name: 'Ocean Beach, SF',     cond: 'Foggy',         temp: 12, wind: 22, surf: '1.8m', active: false },
    { name: 'Bolinas, CA',         cond: 'Partly Cloudy', temp: 15, wind: 16, surf: '1.0m', active: false },
    { name: 'Half Moon Bay, CA',   cond: 'Sunny',         temp: 18, wind: 12, surf: '0.6m', active: false },
    { name: 'Santa Cruz, CA',      cond: 'Sunny',         temp: 20, wind: 10, surf: '0.8m', active: false },
  ];
  locs.forEach((loc, i) => {
    const ly = 170 + i * 106;
    s.push(rect(20, ly, W - 40, 96, loc.active ? 'rgba(30,110,255,0.07)' : CARD, { rx: 14, stroke: loc.active ? 'rgba(30,110,255,0.4)' : BORDER, sw: loc.active ? 1.5 : 0.5 }));
    if (loc.active) {
      s.push(rect(20, ly, W - 40, 24, 'rgba(30,110,255,0.12)', { rx: 14 }));
      s.push(text(W / 2, ly + 16, 'CURRENT LOCATION', 8, BLUE_L, { anchor: 'middle', ls: 2, font: TIGHT }));
    }
    const nameY = loc.active ? ly + 36 : ly + 22;
    s.push(text(32, nameY, loc.name, 15, loc.active ? TEXT : TEXT, { fw: 500 }));
    s.push(text(32, nameY + 18, loc.cond, 12, TEXT2));
    // Metrics row
    s.push(text(32, nameY + 38, loc.temp + '°C', 14, TEXT, { font: MONO, fw: 300 }));
    s.push(text(32 + 52, nameY + 38, '↕', 12, MUTED));
    s.push(text(32 + 66, nameY + 38, loc.wind + 'km/h', 12, TEXT2, { font: MONO }));
    s.push(text(W - 36, nameY + 38, '≈' + loc.surf, 12, BLUE_L, { anchor: 'end', font: MONO }));
  });

  // Add location button
  s.push(rect(20, 710, W - 40, 48, BLUE, { rx: 14 }));
  s.push(text(W / 2, 738, '+ Add Location', 15, '#FFFFFF', { anchor: 'middle', fw: 600 }));

  _addNav(s, 'locations');
  return s;
}

// ──────────────────────────────────────────────────────
// SCREEN 5: RADAR — Precipitation map display
// ──────────────────────────────────────────────────────
function buildRadar() {
  const s = [];
  s.push(rect(0, 0, W, H, BG));

  s.push(rect(0, 0, W, 44, BG));
  s.push(text(16, 28, '9:41', 15, TEXT, { fw: 500, font: MONO }));
  s.push(text(W - 16, 28, '●●●  88%', 12, TEXT2, { anchor: 'end', font: MONO }));

  s.push(text(20, 70, 'Radar', 28, TEXT, { fw: 600 }));
  s.push(text(20, 96, 'Live · Last updated 3m ago', 12, TEXT2, { font: MONO }));

  // Playback bar
  s.push(rect(20, 108, W - 40, 40, CARD, { rx: 10 }));
  s.push(text(32, 132, '▶', 12, BLUE));
  const timeMarks = ['-60m','-45m','-30m','-15m','Now'];
  timeMarks.forEach((t, i) => {
    s.push(text(64 + i * 56, 132, t, 10, i === 4 ? BLUE_L : TEXT2, { font: MONO }));
  });
  s.push(rect(20 + (W - 40) * 0.82, 114, 3, 28, BLUE, { rx: 1 }));

  // Map area — radar representation
  s.push(rect(0, 152, W, 380, CARD, { rx: 0 }));
  // Ocean background
  s.push(rect(0, 152, W, 380, '#060D24'));

  // Grid lines — lat/lon
  for (let gx = 0; gx < W; gx += 52) {
    s.push(line(gx, 152, gx, 532, 'rgba(30,110,255,0.08)', { sw: 1 }));
  }
  for (let gy = 152; gy < 532; gy += 52) {
    s.push(line(0, gy, W, gy, 'rgba(30,110,255,0.08)', { sw: 1 }));
  }

  // Coastline — abstract simplified
  const coast = [
    [0,280],[30,270],[60,260],[90,252],[120,248],[150,255],[170,270],
    [190,280],[210,278],[230,268],[250,260],[260,255],[280,258],[300,265],[320,272],[340,265],[370,260],[390,258]
  ];
  for (let ci = 0; ci < coast.length - 1; ci++) {
    const [x1,y1] = coast[ci], [x2,y2] = coast[ci+1];
    s.push(line(x1, y1, x2, y2, 'rgba(100,140,220,0.35)', { sw: 1.5 }));
  }

  // Land mass — west side
  s.push(rect(0, 152, 90, 380, 'rgba(14,24,50,0.7)'));
  s.push(rect(230, 152, 160, 140, 'rgba(14,24,50,0.7)'));

  // Precipitation cells — blue-purple tone on tone
  const cells = [
    { x: 160, y: 200, r: 40, color: 'rgba(30,110,255,0.15)' },
    { x: 180, y: 210, r: 28, color: 'rgba(30,110,255,0.25)' },
    { x: 200, y: 195, r: 18, color: 'rgba(30,110,255,0.40)' },
    { x: 280, y: 400, r: 55, color: 'rgba(30,110,255,0.10)' },
    { x: 300, y: 420, r: 35, color: 'rgba(30,110,255,0.20)' },
    { x: 315, y: 415, r: 20, color: 'rgba(60,133,255,0.35)' },
    { x: 100, y: 480, r: 30, color: 'rgba(30,110,255,0.08)' },
  ];
  cells.forEach(c => s.push(circle(c.x, c.y, c.r, c.color)));

  // Location dot
  s.push(circle(135, 290, 8, BG));
  s.push(circle(135, 290, 6, BLUE));
  s.push(circle(135, 290, 2, BLUE_XL));
  s.push(circle(135, 290, 20, 'rgba(30,110,255,0.12)'));
  s.push(text(150, 286, 'Stinson Beach', 10, TEXT, { font: TIGHT, fw: 500 }));

  // Layer controls
  s.push(line(0, 536, W, 536, BORDER, { sw: 0.5 }));
  s.push(rect(0, 536, W, 48, SURF));
  const layers = ['Precip', 'Wind', 'Temp', 'Clouds', 'Swell'];
  layers.forEach((l, i) => {
    const active = i === 0;
    s.push(rect(12 + i * 72, 546, 64, 28, active ? BLUE : CARD2, { rx: 8 }));
    s.push(text(44 + i * 72, 565, l, 11, active ? '#FFFFFF' : TEXT2, { anchor: 'middle', fw: active ? 600 : 400 }));
  });

  // Legend
  s.push(line(20, 596, W - 20, 596, BORDER, { sw: 0.4 }));
  s.push(text(20, 616, 'INTENSITY SCALE', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));
  const intensityColors = [
    'rgba(30,110,255,0.15)', 'rgba(30,110,255,0.30)',
    'rgba(30,110,255,0.55)', 'rgba(80,140,255,0.75)', 'rgba(120,160,255,0.90)'
  ];
  const intensityLabels = ['Trace','Light','Moderate','Heavy','Intense'];
  intensityColors.forEach((ic, i) => {
    s.push(rect(20 + i * 70, 624, 60, 18, ic, { rx: 4 }));
    s.push(text(50 + i * 70, 660, intensityLabels[i], 8, TEXT2, { anchor: 'middle', font: MONO }));
  });

  s.push(line(20, 672, W - 20, 672, BORDER, { sw: 0.4 }));
  s.push(text(20, 692, 'Storm cells moving SSW at 28 km/h', 13, TEXT2, { font: MONO }));
  s.push(text(20, 710, 'Rain arrives Stinson Beach ~WED 14:30', 12, BLUE_L, { font: MONO }));

  _addNav(s, 'radar');
  return s;
}

// ──────────────────────────────────────────────────────
// SCREEN 6: INSIGHTS — Outcome-oriented patterns
// ──────────────────────────────────────────────────────
function buildInsights() {
  const s = [];
  s.push(rect(0, 0, W, H, BG));

  s.push(rect(0, 0, W, 44, BG));
  s.push(text(16, 28, '9:41', 15, TEXT, { fw: 500, font: MONO }));
  s.push(text(W - 16, 28, '●●●  88%', 12, TEXT2, { anchor: 'end', font: MONO }));

  s.push(text(20, 70, 'Insights', 28, TEXT, { fw: 600 }));
  s.push(text(20, 96, 'Outcome-driven · Stinson Beach', 13, TEXT2));

  s.push(line(20, 112, W - 20, 112, BORDER, { sw: 0.4 }));

  // Top recommendation card — big
  s.push(rect(20, 128, W - 40, 96, 'rgba(30,110,255,0.08)', { rx: 16, stroke: 'rgba(30,110,255,0.35)', sw: 1 }));
  s.push(text(36, 152, '◈ BEST FOR SURFING THIS WEEK', 10, BLUE_L, { fw: 700, ls: 1.5, font: TIGHT }));
  s.push(line(36, 162, W - 36, 162, 'rgba(30,110,255,0.15)', { sw: 0.4 }));
  s.push(text(36, 180, 'Monday, Apr 13', 18, TEXT, { fw: 600 }));
  s.push(text(36, 200, '09:00 – 12:00 window', 13, TEXT2, { font: MONO }));
  s.push(text(36, 218, '1.4m swell · 12s period · SW · Wind 10km/h', 11, TEXT2, { font: MONO }));

  // Quick insight cards — 2x2 grid
  const insights = [
    { icon: '💨', label: 'WINDIEST DAY', val: 'Wednesday', sub: '45 km/h gusts expected' },
    { icon: '☀️', label: 'CLEAREST DAY', val: 'Monday',    sub: 'Vis 28 km · AQI 18' },
    { icon: '🌊', label: 'BIGGEST SWELL', val: 'Thursday',  sub: '2.2m · 14s period' },
    { icon: '🌡', label: 'WARMEST DAY',  val: 'Tuesday',   sub: '22°C high at 14:00' },
  ];
  insights.forEach((ins, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const ix = col === 0 ? 20 : W / 2 + 6;
    const iy = 240 + row * 106;
    const cardW = W / 2 - 26;
    s.push(rect(ix, iy, cardW, 96, CARD, { rx: 14, stroke: BORDER, sw: 0.5 }));
    s.push(text(ix + 16, iy + 26, ins.icon, 18, TEXT));
    s.push(text(ix + 16, iy + 46, ins.label, 9, MUTED, { fw: 700, ls: 1.5, font: TIGHT }));
    s.push(text(ix + 16, iy + 66, ins.val, 16, TEXT, { fw: 500 }));
    s.push(text(ix + 16, iy + 84, ins.sub, 10, TEXT2, { font: MONO }));
  });

  s.push(line(20, 458, W - 20, 458, BORDER, { sw: 0.4 }));

  // Wind speed history — 30-day avg
  s.push(text(20, 478, 'WIND HISTORY · LAST 30 DAYS', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));
  const windHist = [12,14,18,16,20,22,24,20,18,22,28,24,18,16,14,16,18,20,22,18,16,14,12,14,16,18,20,22,18,16];
  const maxH = 32;
  windHist.forEach((w, i) => {
    const hx = 20 + i * 11.5;
    const bh = (w / maxH) * 48;
    const isWednesday = i === 26; // spike preview
    s.push(rect(hx, 556 - bh, 8, bh, isWednesday ? 'rgba(239,68,68,0.5)' : BLUE_D, { rx: 2 }));
  });
  s.push(text(20, 570, 'Avg: 18 km/h', 10, TEXT2, { font: MONO }));
  s.push(text(W - 20, 570, 'Peak: 28 km/h', 10, TEXT2, { anchor: 'end', font: MONO }));

  s.push(line(20, 582, W - 20, 582, BORDER, { sw: 0.4 }));

  // Activity score — outcome-oriented
  s.push(text(20, 602, 'THIS WEEK FOR YOUR ACTIVITIES', 10, MUTED, { fw: 700, ls: 2, font: TIGHT }));
  const activities = [
    { name: 'Surfing',  scores: [82, 90, 58, 34, 45, 70], color: BLUE },
    { name: 'Running',  scores: [88, 92, 60, 40, 52, 78], color: BLUE_L },
    { name: 'Kitesurfing', scores: [40, 32, 88, 62, 54, 66], color: AMBER },
  ];
  activities.forEach((act, ai) => {
    const ay = 620 + ai * 42;
    s.push(text(20, ay + 14, act.name, 13, TEXT, { fw: 500 }));
    act.scores.forEach((score, si) => {
      const sx = 130 + si * 40;
      const scoreH = (score / 100) * 28;
      s.push(rect(sx, ay + 20 - scoreH, 30, scoreH, score > 75 ? act.color : `rgba(${act.color === BLUE ? '30,110,255' : act.color === BLUE_L ? '74,138,255' : '245,158,11'},0.3)`, { rx: 3 }));
    });
    s.push(text(W - 20, ay + 14, act.scores[0] + '%', 12, act.color, { anchor: 'end', font: MONO }));
  });

  // Day labels under activity chart
  const dayLabels = ['Su','Mo','Tu','We','Th','Fr'];
  dayLabels.forEach((d, i) => {
    s.push(text(145 + i * 40, 752, d, 9, MUTED, { anchor: 'middle', font: MONO }));
  });

  _addNav(s, 'insights');
  return s;
}

// ──────────────────────────────────────────────────────
// NAV helper
// ──────────────────────────────────────────────────────
function _addNav(s, active) {
  s.push(rect(0, NAV_Y, W, 72, SURF));
  s.push(line(0, NAV_Y, W, NAV_Y, BORDER, { sw: 0.5 }));
  const navItems = [
    { id: 'now',       label: 'Now',      x: 39 },
    { id: 'forecast',  label: 'Forecast', x: 117 },
    { id: 'alerts',    label: 'Alerts',   x: 195 },
    { id: 'locations', label: 'Locations',x: 273 },
    { id: 'radar',     label: 'Radar',    x: 351 },
  ];
  navItems.forEach(nav => {
    const isActive = nav.id === active;
    if (isActive) {
      s.push(rect(nav.x - 32, NAV_Y + 4, 64, 4, BLUE, { rx: 2 }));
    }
    s.push(text(nav.x, NAV_Y + 28, isActive ? '●' : '○', 10, isActive ? BLUE : MUTED, { anchor: 'middle' }));
    s.push(text(nav.x, NAV_Y + 50, nav.label, 10, isActive ? BLUE_L : TEXT2, { anchor: 'middle', fw: isActive ? 600 : 400 }));
  });
}

// ──────────────────────────────────────────────────────
// COMPOSE
// ──────────────────────────────────────────────────────
const screens = [
  { name: 'Now',       elements: buildNow() },
  { name: 'Forecast',  elements: buildForecast() },
  { name: 'Alerts',    elements: buildAlerts() },
  { name: 'Locations', elements: buildLocations() },
  { name: 'Radar',     elements: buildRadar() },
  { name: 'Insights',  elements: buildInsights() },
];

const totalElements = screens.reduce((n, s) => n + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'VANE — Hyper-local Weather Intelligence',
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'dark',
    heartbeat: 492,
    elements: totalElements,
    palette: { bg: BG, accent: BLUE, text: TEXT },
  },
  screens: screens.map(s => ({
    name: s.name,
    elements: s.elements,
    svg: '',
  })),
};

fs.writeFileSync(path.join(__dirname, 'vane.pen'), JSON.stringify(pen, null, 2));
console.log(`VANE: ${screens.length} screens, ${totalElements} elements\nWritten: vane.pen`);
