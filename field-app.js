'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG    = 'field';
const NAME    = 'FIELD';
const TAGLINE = 'Document everything. Forget nothing.';
const THEME   = 'light';
const HB      = 99;

// ── Palette (warm biophilic light) ──────────────────────────────────────────
const C = {
  bg:       '#FAF7F2',
  surface:  '#FFFFFF',
  card:     '#F5F0E8',
  accent:   '#4A3728',
  accent2:  '#7B9B6B',
  amber:    '#C8821A',
  text:     '#1A1209',
  textMid:  '#6B4F3A',
  muted:    'rgba(74,55,40,0.38)',
  border:   'rgba(74,55,40,0.10)',
  borderMd: 'rgba(74,55,40,0.18)',
  green:    '#5A8A4E',
  greenBg:  '#E8F3E5',
  amberBg:  '#FBF0DC',
  sky:      '#6B8FA8',
  skyBg:    '#E5EFF5',
};

function rect(x, y, w, h, fill, opts = {}) {
  return { type: 'rect', x, y, w, h, fill,
    rx: opts.rx ?? 0, opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none', sw: opts.sw ?? 1 };
}
function text(x, y, content, size, fill, opts = {}) {
  return { type: 'text', x, y, content, size, fill,
    fw: opts.fw ?? 400, font: opts.font ?? 'system-ui',
    anchor: opts.anchor ?? 'start', ls: opts.ls ?? '0',
    opacity: opts.opacity ?? 1 };
}
function circle(cx, cy, r, fill, opts = {}) {
  return { type: 'circle', cx, cy, r, fill,
    opacity: opts.opacity ?? 1, stroke: opts.stroke ?? 'none', sw: opts.sw ?? 1 };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return { type: 'line', x1, y1, x2, y2, stroke,
    sw: opts.sw ?? 1, opacity: opts.opacity ?? 1 };
}

const W = 390, H = 844;
const PAD = 24;
const NAV_H = 80;

function statusBar(els) {
  els.push(rect(0, 0, W, 44, C.bg));
  els.push(text(PAD, 28, '9:41', 13, C.text, { fw: 600 }));
  els.push(text(W - PAD, 28, 'WiFi  100%', 12, C.text, { anchor: 'end', opacity: 0.7 }));
}

function bottomNav(els, active) {
  const tabs = [
    { label: 'Today', icon: 'o', id: 0 },
    { label: 'Journal', icon: '//', id: 1 },
    { label: 'Gallery', icon: '##', id: 2 },
    { label: 'Map', icon: '@', id: 3 },
    { label: 'You', icon: '*', id: 4 },
  ];
  const navY = H - NAV_H;
  els.push(rect(0, navY, W, NAV_H, C.surface));
  els.push(line(0, navY, W, navY, C.borderMd));
  const tw = W / tabs.length;
  tabs.forEach((t, i) => {
    const cx = i * tw + tw / 2;
    const isActive = i === active;
    const col = isActive ? C.accent : C.muted;
    if (isActive) {
      els.push(rect(cx - 16, navY + 3, 32, 3, C.accent, { rx: 2 }));
    }
    els.push(text(cx, navY + 44, t.label, 10, col, { anchor: 'middle', fw: isActive ? 700 : 400 }));
  });
}

// SCREEN 1 — Today
function screenToday() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  statusBar(els);

  els.push(text(PAD, 82, 'FIELD', 13, C.accent, { fw: 700, ls: '0.12em' }));
  els.push(text(PAD, 122, 'Thursday', 40, C.text, { fw: 300, font: 'Georgia, serif', ls: '-0.02em' }));
  els.push(text(PAD, 150, 'April 10, 2026', 15, C.textMid, {}));

  // Weather strip
  els.push(rect(PAD, 164, W - PAD * 2, 44, C.card, { rx: 10, stroke: C.border, sw: 1 }));
  els.push(text(PAD + 14, 191, 'Sun  18C  Partly cloudy  Dunmore East', 12, C.textMid, {}));
  els.push(line(PAD, 224, W - PAD, 224, C.border));
  els.push(text(PAD, 246, 'RECENT', 11, C.muted, { fw: 700, ls: '0.09em' }));

  const entries = [
    { date: 'Today 10:24', title: 'Rocky shore, low tide', tag: 'Intertidal', dot: C.sky },
    { date: 'Yesterday 15:40', title: 'Marsh grass survey grid B', tag: 'Botany', dot: C.green },
    { date: 'Apr 8 09:12', title: 'Bird count: estuary north', tag: 'Fauna', dot: C.amber },
  ];
  let ey = 260;
  entries.forEach(e => {
    els.push(rect(PAD, ey, W - PAD * 2, 80, C.surface, { rx: 12, stroke: C.border, sw: 1 }));
    els.push(rect(PAD, ey, 4, 80, e.dot, { rx: 2 }));
    els.push(text(PAD + 16, ey + 22, e.date, 11, C.muted, { fw: 500 }));
    els.push(text(PAD + 16, ey + 46, e.title, 15, C.text, { fw: 600, font: 'Georgia, serif' }));
    const tw2 = e.tag.length * 6.5 + 16;
    els.push(rect(PAD + 16, ey + 56, tw2, 18, C.card, { rx: 9 }));
    els.push(text(PAD + 16 + tw2 / 2, ey + 68, e.tag, 10, C.textMid, { anchor: 'middle', fw: 600 }));
    ey += 90;
  });

  // New Entry CTA
  els.push(rect(PAD, ey + 4, W - PAD * 2, 52, C.accent, { rx: 14 }));
  els.push(text(W / 2, ey + 36, '+ New Entry', 15, '#FAF7F2', { anchor: 'middle', fw: 700 }));
  ey += 68;

  // Stats
  const stats = [['47', 'Entries'], ['183', 'Photos'], ['12', 'Places']];
  const sw2 = (W - PAD * 2) / 3;
  stats.forEach(([v, l], i) => {
    const sx = PAD + i * sw2;
    els.push(rect(sx, ey, sw2 - 4, 64, i === 0 ? C.card : C.surface, { rx: 10, stroke: C.border, sw: 1 }));
    els.push(text(sx + sw2 / 2 - 2, ey + 32, v, 22, C.accent, { anchor: 'middle', fw: 700 }));
    els.push(text(sx + sw2 / 2 - 2, ey + 50, l, 11, C.muted, { anchor: 'middle' }));
  });

  bottomNav(els, 0);
  return { name: 'Today', elements: els };
}

// SCREEN 2 — New Entry (Compose)
function screenCompose() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  statusBar(els);

  els.push(text(PAD, 76, 'Back', 13, C.textMid, { fw: 500 }));
  els.push(text(W - PAD, 76, 'Save', 14, C.accent, { anchor: 'end', fw: 700 }));
  els.push(line(0, 88, W, 88, C.border));

  // Location chip
  els.push(rect(PAD, 100, 200, 30, C.card, { rx: 15, stroke: C.border, sw: 1 }));
  els.push(circle(PAD + 18, 115, 5, C.accent2));
  els.push(text(PAD + 28, 120, 'Cliffs of Moher  14:35', 11, C.textMid, {}));

  // Title area
  els.push(text(PAD, 162, 'TITLE', 11, C.muted, { ls: '0.09em', fw: 700 }));
  els.push(text(PAD, 198, 'First lichen survey', 26, C.text, { fw: 300, font: 'Georgia, serif', ls: '-0.01em' }));
  els.push(text(PAD, 226, 'of spring', 26, C.text, { fw: 300, font: 'Georgia, serif', ls: '-0.01em' }));
  els.push(line(PAD, 240, W - PAD, 240, C.borderMd));

  // Tags
  els.push(text(PAD, 262, 'TAGS', 11, C.muted, { ls: '0.09em', fw: 700 }));
  const tags2 = [['Botany', C.accent, '#FAF7F2'], ['Lichen', C.greenBg, C.green], ['+ Add', C.surface, C.muted]];
  let tx = PAD;
  tags2.forEach(([t, bg, fg]) => {
    const tw2 = t.length * 7 + 20;
    els.push(rect(tx, 270, tw2, 26, bg, { rx: 13, stroke: bg === C.surface ? C.borderMd : 'none', sw: 1 }));
    els.push(text(tx + tw2 / 2, 287, t, 11, fg, { anchor: 'middle', fw: 600 }));
    tx += tw2 + 8;
  });
  els.push(line(PAD, 310, W - PAD, 310, C.border));

  // Body
  els.push(text(PAD, 330, 'BODY', 11, C.muted, { ls: '0.09em', fw: 700 }));
  const bodyLines = [
    'Arrived at grid B4 around 14:20. Light overcast,',
    'temp 11C, 82% humidity. Ideal conditions.',
    '',
    'Identified Xanthoria parietina (foliose, orange)',
    'on southwest-facing limestone at ~1.2m above',
    'tide line. Coverage approx. 35% of exposed face.',
    '',
    'Also: Verrucaria maura (black, crustose) on wet',
    'lower faces. Sample ref: CM-2026-04-10-B4.',
    '',
    'Note: significant increase vs April 2025 survey.',
    '|',
  ];
  bodyLines.forEach((l, i) => {
    els.push(text(PAD, 350 + i * 20, l, 13, l === '' ? C.muted : C.text, {}));
  });

  // Toolbar
  const toolY = H - NAV_H - 52;
  els.push(rect(0, toolY, W, 52, C.surface));
  els.push(line(0, toolY, W, toolY, C.border));
  ['Img', 'Map', 'Mic', 'Bold', 'Italic', 'P'].forEach((t, i) => {
    els.push(text(PAD + i * 52 + 14, toolY + 30, t, 12, C.textMid, { anchor: 'middle', fw: i >= 3 ? 700 : 400 }));
  });

  return { name: 'Compose', elements: els };
}

// SCREEN 3 — Gallery
function screenGallery() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  statusBar(els);

  els.push(text(PAD, 82, 'Gallery', 30, C.text, { fw: 300, font: 'Georgia, serif', ls: '-0.02em' }));
  els.push(text(PAD, 106, '183 observations', 12, C.muted, {}));

  // Filter chips
  const filters = ['All', 'Flora', 'Fauna', 'Geology', 'Weather'];
  let fx = PAD;
  filters.forEach((f, i) => {
    const fw2 = f.length * 7.5 + 20;
    els.push(rect(fx, 118, fw2, 28, i === 0 ? C.accent : C.surface, { rx: 14, stroke: i === 0 ? 'none' : C.borderMd, sw: 1 }));
    els.push(text(fx + fw2 / 2, 136, f, 12, i === 0 ? '#FAF7F2' : C.textMid, { anchor: 'middle', fw: i === 0 ? 700 : 400 }));
    fx += fw2 + 8;
  });

  // Photo grid 3-col
  const gridPad = 8;
  const cellW = (W - gridPad * 4) / 3;
  const gridStartY = 158;
  const photoColors = [C.greenBg, C.skyBg, C.amberBg, C.card, C.greenBg, C.skyBg, C.amberBg, C.greenBg, C.card, C.skyBg, C.amberBg, C.greenBg, C.card, C.skyBg, C.greenBg, C.amberBg];
  const photoLabels = ['Flora', 'Shore', 'Rock', 'Fungi', 'Grass', 'Wave', 'Cloud', 'Reed', 'Insect', 'Bloom', 'Snail', 'Bug', 'Rain', 'Sun', 'Fish', 'Wind'];
  const photoColors2 = [C.green, C.sky, C.amber, C.textMid, C.green, C.sky, C.amber, C.green, C.textMid, C.sky, C.amber, C.green, C.textMid, C.sky, C.green, C.amber];

  for (let i = 0; i < 16; i++) {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const gx = gridPad + col * (cellW + gridPad);
    const gy = gridStartY + row * (cellW + gridPad);
    els.push(rect(gx, gy, cellW, cellW, photoColors[i], { rx: 10 }));
    els.push(text(gx + 8, gy + cellW - 10, photoLabels[i], 10, photoColors2[i], { fw: 600 }));
    if (i % 5 === 0) {
      els.push(circle(gx + cellW - 10, gy + 10, 8, C.accent));
      els.push(text(gx + cellW - 10, gy + 14, '*', 11, '#FAF7F2', { anchor: 'middle', fw: 700 }));
    }
  }

  bottomNav(els, 2);
  return { name: 'Gallery', elements: els };
}

// SCREEN 4 — Entry Detail
function screenDetail() {
  const els = [];
  els.push(rect(0, 0, W, H, C.surface));
  statusBar(els);

  els.push(text(PAD, 76, 'Back', 14, C.textMid, { fw: 500 }));
  els.push(text(W - PAD, 76, '...', 18, C.text, { anchor: 'end' }));

  // Hero image
  els.push(rect(0, 88, W, 188, C.skyBg));
  els.push(text(W / 2, 195, 'Shore observation photo', 14, C.sky, { anchor: 'middle' }));
  // Location badge over photo
  els.push(rect(PAD, 248, 152, 24, 'rgba(10,10,10,0.55)', { rx: 12 }));
  els.push(text(PAD + 12, 264, 'Cliffs of Moher  14:35', 10, '#FFFFFF', { fw: 500 }));

  // Tags + date
  let tx = PAD;
  [['Botany', C.greenBg, C.green], ['Lichen', C.skyBg, C.sky]].forEach(([t, bg, fg]) => {
    const tw2 = t.length * 7 + 18;
    els.push(rect(tx, 284, tw2, 24, bg, { rx: 12 }));
    els.push(text(tx + tw2 / 2, 300, t, 11, fg, { anchor: 'middle', fw: 600 }));
    tx += tw2 + 8;
  });
  els.push(text(W - PAD, 300, 'Apr 10, 2026', 11, C.muted, { anchor: 'end' }));

  // Big serif title
  els.push(text(PAD, 340, 'First lichen survey', 24, C.text, { fw: 300, font: 'Georgia, serif', ls: '-0.01em' }));
  els.push(text(PAD, 368, 'of spring', 24, C.text, { fw: 300, font: 'Georgia, serif', ls: '-0.01em' }));
  els.push(line(PAD, 384, W - PAD, 384, C.border));

  // Body
  const body = [
    'Arrived at grid B4 around 14:20. Light overcast,',
    'temp 11C, 82% humidity. Ideal conditions for',
    'lichen survey. Identified Xanthoria parietina',
    '(foliose, orange) on southwest-facing limestone',
    'at ~1.2m above tide line. Coverage ~35%.',
    '',
    'Also present: Verrucaria maura (black, crustose)',
    'on wet lower faces. Sample: CM-2026-04-10-B4.',
    '',
    'Significant increase vs April 2025 survey.',
  ];
  body.forEach((l, i) => {
    els.push(text(PAD, 402 + i * 19, l, 13, l === '' ? C.muted : C.text, {}));
  });

  // Related
  els.push(line(PAD, 594, W - PAD, 594, C.border));
  els.push(text(PAD, 612, 'ALSO IN THIS SESSION', 10, C.muted, { fw: 700, ls: '0.08em' }));
  const rw = (W - PAD * 2 - 8) / 2;
  [['Limestone B3', C.amberBg, C.amber], ['Vegetation', C.greenBg, C.green]].forEach(([l, bg, col], i) => {
    const rx2 = PAD + i * (rw + 8);
    els.push(rect(rx2, 624, rw, 52, bg, { rx: 10, stroke: C.border, sw: 1 }));
    els.push(rect(rx2, 624, rw, 3, col, { rx: 2 }));
    els.push(text(rx2 + 12, 654, l, 12, C.text, { fw: 600 }));
  });

  bottomNav(els, 1);
  return { name: 'Entry Detail', elements: els };
}

// SCREEN 5 — Map
function screenMap() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  statusBar(els);

  els.push(text(PAD, 82, 'Locations', 30, C.text, { fw: 300, font: 'Georgia, serif', ls: '-0.02em' }));
  els.push(text(PAD, 106, '12 sites visited', 12, C.muted, {}));

  // Map tile
  const mY = 118, mH = 276;
  els.push(rect(PAD, mY, W - PAD * 2, mH, C.card, { rx: 14, stroke: C.border, sw: 1 }));
  // Grid lines
  for (let i = 1; i < 4; i++) {
    els.push(line(PAD + i * ((W - PAD * 2) / 4), mY, PAD + i * ((W - PAD * 2) / 4), mY + mH, C.border));
    els.push(line(PAD, mY + i * (mH / 4), W - PAD, mY + i * (mH / 4), C.border));
  }
  // Markers
  const markers = [
    { mx: 140, my: 200, label: 'Moher', color: C.accent, r: 10 },
    { mx: 215, my: 248, label: 'Dunmore', color: C.accent2, r: 8 },
    { mx: 288, my: 178, label: 'Killarney', color: C.amber, r: 8 },
    { mx: 168, my: 318, label: 'Salthill', color: C.sky, r: 7 },
    { mx: 244, my: 294, label: 'Wicklow', color: C.green, r: 7 },
    { mx: 308, my: 230, label: 'Blarney', color: C.textMid, r: 6 },
  ];
  markers.forEach(m => {
    els.push(circle(m.mx, m.my, m.r + 5, m.color, { opacity: 0.18 }));
    els.push(circle(m.mx, m.my, m.r, m.color));
    els.push(text(m.mx, m.my - m.r - 4, m.label, 9, C.text, { anchor: 'middle', fw: 600 }));
  });

  // Location list
  els.push(text(PAD, 412, 'RECENT SITES', 10, C.muted, { fw: 700, ls: '0.09em' }));
  const sites = [
    { name: 'Cliffs of Moher', region: 'Co. Clare', count: 8, color: C.accent },
    { name: 'Dunmore East Estuary', region: 'Co. Waterford', count: 14, color: C.accent2 },
    { name: 'Killarney National Park', region: 'Co. Kerry', count: 6, color: C.amber },
  ];
  sites.forEach((s, i) => {
    const ly = 428 + i * 66;
    els.push(rect(PAD, ly, W - PAD * 2, 58, C.surface, { rx: 12, stroke: C.border, sw: 1 }));
    els.push(circle(PAD + 24, ly + 29, 10, s.color));
    els.push(text(PAD + 44, ly + 24, s.name, 14, C.text, { fw: 600 }));
    els.push(text(PAD + 44, ly + 44, s.region, 11, C.muted, {}));
    els.push(text(W - PAD - 8, ly + 34, s.count + ' entries', 12, C.textMid, { anchor: 'end' }));
  });

  bottomNav(els, 3);
  return { name: 'Map', elements: els };
}

// SCREEN 6 — Profile
function screenProfile() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  statusBar(els);

  els.push(text(PAD, 82, 'Your Field', 30, C.text, { fw: 300, font: 'Georgia, serif', ls: '-0.02em' }));

  // Profile card
  const pcY = 100;
  els.push(rect(PAD, pcY, W - PAD * 2, 94, C.surface, { rx: 14, stroke: C.border, sw: 1 }));
  els.push(circle(PAD + 38, pcY + 47, 27, C.card));
  els.push(text(PAD + 38, pcY + 56, 'SC', 16, C.accent, { anchor: 'middle', fw: 700 }));
  els.push(text(PAD + 76, pcY + 34, 'Sinead Connelly', 16, C.text, { fw: 600 }));
  els.push(text(PAD + 76, pcY + 54, 'Field researcher - Ecology', 12, C.muted, {}));
  els.push(text(PAD + 76, pcY + 72, 'Waterford, Ireland', 11, C.textMid, {}));

  // Stats grid
  els.push(text(PAD, 212, 'YOUR NUMBERS', 10, C.muted, { fw: 700, ls: '0.09em' }));
  const bigStats = [
    ['47', 'Journal entries', C.accent],
    ['183', 'Field photos', C.accent2],
    ['12', 'Sites visited', C.amber],
    ['6 yr', 'Active', C.sky],
  ];
  const bsW = (W - PAD * 2 - 10) / 2;
  bigStats.forEach(([v, l, col], i) => {
    const bx = PAD + (i % 2) * (bsW + 10);
    const by = 226 + Math.floor(i / 2) * 80;
    els.push(rect(bx, by, bsW, 70, C.surface, { rx: 12, stroke: C.border, sw: 1 }));
    els.push(rect(bx, by, bsW, 3, col, { rx: 2 }));
    els.push(text(bx + 14, by + 36, v, 26, C.text, { fw: 700, font: 'Georgia, serif' }));
    els.push(text(bx + 14, by + 56, l, 11, C.muted, {}));
  });

  // Activity bars
  els.push(line(PAD, 398, W - PAD, 398, C.border));
  els.push(text(PAD, 418, 'LAST 30 DAYS', 10, C.muted, { fw: 700, ls: '0.09em' }));
  const barData = [2,1,3,0,4,2,1,3,5,2,0,1,4,3,2,1,3,2,4,1,0,3,2,1,5,3,2,4,1,2];
  const barW2 = (W - PAD * 2) / barData.length - 1.5;
  barData.forEach((v, i) => {
    const bh = (v / 5) * 40;
    const bx = PAD + i * ((W - PAD * 2) / barData.length);
    els.push(rect(bx, 432 + 40 - bh, barW2, bh, v > 3 ? C.accent : C.card, { rx: 1 }));
  });

  // Streak
  els.push(rect(PAD, 486, W - PAD * 2, 54, C.amberBg, { rx: 12, stroke: C.border, sw: 1 }));
  els.push(text(PAD + 16, 510, 'Fire 12-day streak', 14, C.text, { fw: 600 }));
  els.push(text(PAD + 16, 528, 'Keep it going - last entry 2h ago', 11, C.muted, {}));

  // Settings
  els.push(line(PAD, 554, W - PAD, 554, C.border));
  ['Export data', 'Connected apps', 'Notifications', 'Help & feedback'].forEach((s, i) => {
    const sy = 570 + i * 44;
    els.push(text(PAD, sy, s, 14, C.text, {}));
    els.push(text(W - PAD, sy, '>', 14, C.muted, { anchor: 'end' }));
    if (i < 3) els.push(line(PAD, sy + 18, W - PAD, sy + 18, C.border, { opacity: 0.6 }));
  });

  bottomNav(els, 4);
  return { name: 'Profile', elements: els };
}

// Assemble
const screens = [screenToday(), screenCompose(), screenGallery(), screenDetail(), screenMap(), screenProfile()];
const totalEls = screens.reduce((n, s) => n + s.elements.length, 0);

function elToSvg(el) {
  if (el.type === 'rect') return `<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" rx="${el.rx||0}" fill="${el.fill}" stroke="${el.stroke||'none'}" stroke-width="${el.sw||0}" opacity="${el.opacity??1}"/>`;
  if (el.type === 'text') return `<text x="${el.x}" y="${el.y}" fill="${el.fill}" text-anchor="${el.anchor||'start'}" style="font-size:${el.size}px;font-weight:${el.fw||400};font-family:${el.font||'system-ui'};letter-spacing:${el.ls||0};opacity:${el.opacity??1};">${String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
  if (el.type === 'circle') return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" stroke="${el.stroke||'none'}" stroke-width="${el.sw||0}" opacity="${el.opacity??1}"/>`;
  if (el.type === 'line') return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.sw||1}" opacity="${el.opacity??1}"/>`;
  return '';
}

const pen = {
  version: '2.8',
  metadata: { name: NAME, tagline: TAGLINE, author: 'RAM', date: new Date().toISOString(), theme: THEME, heartbeat: HB, elements: totalEls, archetype: 'fieldwork-journal',
    palette: { bg: C.bg, surface: C.surface, accent: C.accent, accent2: C.accent2, text: C.text, muted: C.muted } },
  screens: screens.map(s => ({
    name: s.name,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" width="390" height="844">${s.elements.map(elToSvg).join('')}</svg>`,
    elements: s.elements,
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalEls} elements`);
console.log(`Written: ${SLUG}.pen`);
