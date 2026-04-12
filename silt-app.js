// silt-app.js — SILT naturalist field log
// Theme: LIGHT — sandy warm #EAE3D8 + olive #4A5E3A + terra cotta #C07845
// Inspired by:
//   Moke Valley Cabin (siteinspire) — stencil/wayfinding serif + mono system, olive + sand
//   Woset (land-book) — #eae9e5 sandy gray-beige ground
//   Cernel (land-book) — parchment yellow + dark warm brown #2b1d15 text
// Concept: App for people who pay attention to the natural world.
//   Daily observation logging, species tracking, personal patch map, seasonal patterns.

import fs from 'fs';

const W = 375, H = 812, GAP = 80, SCREENS = 5;
const canvas_w = SCREENS * W + (SCREENS + 1) * GAP;

// Palette
const BG      = '#EAE3D8';  // sandy warm ground
const SURFACE = '#F5F1EA';  // warmer surface
const CARD    = '#FFFFFF';  // white card
const INK     = '#2B2419';  // dark warm brown
const OLIVE   = '#4A5E3A';  // field olive
const OLIVE2  = '#6B8554';  // lighter olive
const TERRA   = '#C07845';  // terra cotta accent
const TERRA2  = '#D8956A';  // lighter terra
const MIST    = 'rgba(43,36,25,0.38)'; // muted ink
const DIM     = 'rgba(43,36,25,0.18)'; // very light
const CREAM   = '#F9F6EF';  // cream highlight
const RUST    = '#A0522D';  // rust for warnings/rare
const SKY     = '#7BA7C4';  // slate blue for water/sky

let nodes = [];
let id = 1;

function rect(name, x, y, w, h, fill, opts = {}) {
  nodes.push({ type:'RECTANGLE', id:`node_${id++}`, name, x, y, width:w, height:h, fill,
    cornerRadius: opts.cr||0, opacity: opts.op||1, stroke: opts.stroke||null, strokeWidth: opts.sw||0 });
}

function text(name, x, y, w, content, size, color, opts = {}) {
  nodes.push({ type:'TEXT', id:`node_${id++}`, name, x, y, width:w, content, fontSize:size, color,
    font: opts.font||'Space Mono', weight: opts.weight||400, align: opts.align||'left',
    lh: opts.lh||1.35, ls: opts.ls||0 });
}

// Shorthand helpers
function serif(name, x, y, w, content, size, color, opts={}) {
  return text(name, x, y, w, content, size, color, {font:'Spectral', weight:opts.weight||400, lh:opts.lh||1.15, ls:opts.ls||0, ...opts});
}
function mono(name, x, y, w, content, size, color, opts={}) {
  return text(name, x, y, w, content, size, color, {font:'Space Mono', weight:400, lh:opts.lh||1.4, ls:opts.ls||0.02, ...opts});
}
function sans(name, x, y, w, content, size, color, opts={}) {
  return text(name, x, y, w, content, size, color, {font:'Inter', weight:opts.weight||400, lh:opts.lh||1.4, ls:opts.ls||0, ...opts});
}

// Status bar (light theme)
function statusBar(sx) {
  rect(`sb-bg-${sx}`, sx, 0, W, 44, BG);
  mono(`time-${sx}`, sx+16, 14, 50, '9:41', 11, INK, {weight:700});
  rect(`bat-${sx}`, sx+W-54, 18, 25, 12, DIM, {cr:3});
  rect(`bat-fill-${sx}`, sx+W-53, 19, 16, 10, OLIVE, {cr:2});
  rect(`sig-${sx}`, sx+W-86, 17, 9, 13, DIM, {cr:1});
  rect(`wifi-${sx}`, sx+W-71, 19, 11, 9, DIM, {cr:2});
}

// Bottom nav bar
function bottomNav(sx, active) {
  rect(`nav-bg-${sx}`, sx, H-80, W, 80, SURFACE);
  rect(`nav-top-${sx}`, sx, H-80, W, 1, DIM);
  const tabs = [
    { label:'TODAY', icon:'○' },
    { label:'LOG',   icon:'≡' },
    { label:'LIFE',  icon:'◇' },
    { label:'PATCH', icon:'◎' },
    { label:'SELF',  icon:'∘' },
  ];
  const tw = Math.floor(W / tabs.length);
  tabs.forEach((tab, i) => {
    const tx = sx + i * tw + Math.floor(tw/2) - 18;
    const isActive = i === active;
    const col = isActive ? OLIVE : MIST;
    mono(`nav-icon-${sx}-${i}`, tx, H-62, 36, tab.icon, 14, col, {align:'center'});
    mono(`nav-lbl-${sx}-${i}`, tx-10, H-42, 56, tab.label, 7, col, {align:'center'});
    if (isActive) rect(`nav-dot-${sx}-${i}`, sx+i*tw+Math.floor(tw/2)-3, H-76, 6, 3, OLIVE, {cr:2});
  });
}

// ─── Screen 0 — TODAY'S LOG ─────────────────────────────────────────────────
function screenToday(sx) {
  rect(`s0-bg`, sx, 0, W, H, BG);
  statusBar(sx);

  // Header
  mono(`s0-date`, sx+20, 54, 200, 'SAT 28 MAR 2026', 9, TERRA, {ls:0.08});
  serif(`s0-title`, sx+20, 68, 280, 'Today\'s\nField Log', 32, INK, {weight:700, lh:1.1});
  mono(`s0-count`, sx+W-70, 72, 60, '12\nOBS', 10, OLIVE, {align:'right', lh:1.2, weight:700});

  // Seasonal context strip
  rect(`s0-season`, sx, 120, W, 38, OLIVE, {op:0.12});
  mono(`s0-season-lbl`, sx+20, 131, 200, '▲ SPRING MIGRATION PEAK', 9, OLIVE, {ls:0.05, weight:700});
  mono(`s0-season-note`, sx+W-140, 131, 130, '47 days in', 9, MIST, {align:'right'});

  // Daily prompt card
  rect(`s0-prompt-card`, sx+16, 168, W-32, 72, CARD, {cr:8});
  rect(`s0-prompt-bar`, sx+16, 168, 4, 72, TERRA, {cr:2});
  mono(`s0-prompt-lbl`, sx+32, 176, 140, 'TODAY\'S FOCUS', 8, TERRA, {ls:0.1, weight:700});
  serif(`s0-prompt-text`, sx+32, 192, W-60, 'Notice the edge habitats — where field meets forest.', 13, INK, {lh:1.35, weight:400});
  mono(`s0-prompt-date`, sx+32, 225, 200, '↳ Based on your patch history', 9, MIST);

  // Today's entries section
  mono(`s0-today-lbl`, sx+20, 254, 160, 'TODAY\'S OBSERVATIONS', 8, MIST, {ls:0.09});

  // Entry 1 — bird
  rect(`s0-e1-bg`, sx+16, 270, W-32, 66, SURFACE, {cr:8});
  rect(`s0-e1-dot`, sx+28, 288, 10, 10, OLIVE, {cr:5});
  serif(`s0-e1-name`, sx+48, 283, 200, 'Common Chiffchaff', 14, INK, {weight:600});
  mono(`s0-e1-latin`, sx+48, 299, 200, 'Phylloscopus collybita', 9, MIST);
  mono(`s0-e1-meta`, sx+48, 313, 220, '08:22 · North hedge · × 2', 9, OLIVE);
  mono(`s0-e1-badge`, sx+W-58, 282, 46, 'BIRD', 8, CARD, {align:'center'});
  rect(`s0-e1-badge-bg`, sx+W-62, 278, 50, 16, OLIVE, {cr:3});
  mono(`s0-e1-badge2`, sx+W-58, 282, 46, 'BIRD', 8, CARD, {align:'center'});

  // Entry 2 — plant
  rect(`s0-e2-bg`, sx+16, 344, W-32, 66, SURFACE, {cr:8});
  rect(`s0-e2-dot`, sx+28, 362, 10, 10, TERRA, {cr:5});
  serif(`s0-e2-name`, sx+48, 357, 200, 'Cuckooflower', 14, INK, {weight:600});
  mono(`s0-e2-latin`, sx+48, 373, 200, 'Cardamine pratensis', 9, MIST);
  mono(`s0-e2-meta`, sx+48, 387, 220, '09:10 · Wet meadow edge · patch', 9, TERRA);
  rect(`s0-e2-badge-bg`, sx+W-72, 352, 64, 16, TERRA, {cr:3, op:0.85});
  mono(`s0-e2-badge2`, sx+W-68, 356, 56, 'PLANT', 8, CARD, {align:'center'});

  // Entry 3 — fungi
  rect(`s0-e3-bg`, sx+16, 418, W-32, 66, SURFACE, {cr:8});
  rect(`s0-e3-dot`, sx+28, 436, 10, 10, RUST, {cr:5});
  serif(`s0-e3-name`, sx+48, 431, 200, 'Scarlet Elf Cup', 14, INK, {weight:600});
  mono(`s0-e3-latin`, sx+48, 447, 200, 'Sarcoscypha austriaca', 9, MIST);
  mono(`s0-e3-meta`, sx+48, 461, 220, '10:45 · Old willow log', 9, RUST);
  rect(`s0-e3-badge-bg`, sx+W-74, 426, 66, 16, RUST, {cr:3, op:0.85});
  mono(`s0-e3-badge2`, sx+W-68, 430, 56, 'FUNGI', 8, CARD, {align:'center'});

  // Log new observation CTA
  rect(`s0-log-btn`, sx+16, 496, W-32, 48, OLIVE, {cr:24});
  mono(`s0-log-txt`, sx+16, 512, W-32, '+ LOG OBSERVATION', 11, CARD, {align:'center', weight:700, ls:0.08});

  // Quick tally strip
  rect(`s0-tally-bg`, sx+16, 556, W-32, 44, SURFACE, {cr:8});
  const tallyCats = [{l:'BIRDS', v:'7', c:OLIVE}, {l:'PLANTS', v:'3', c:TERRA}, {l:'FUNGI', v:'1', c:RUST}, {l:'OTHER', v:'1', c:MIST}];
  tallyCats.forEach((t, i) => {
    const tx2 = sx+36 + i * 80;
    mono(`s0-tally-v-${i}`, tx2, 564, 58, t.v, 16, t.c, {weight:700, align:'center'});
    mono(`s0-tally-l-${i}`, tx2, 582, 58, t.l, 7, MIST, {align:'center', ls:0.05});
  });

  // Streak indicator
  rect(`s0-streak-bg`, sx+16, 612, W-32, 38, CREAM, {cr:8});
  mono(`s0-streak-txt`, sx+36, 624, 280, '🔥 14-day streak  ·  Your longest: 31 days', 10, INK);

  bottomNav(sx, 0);
}

// ─── Screen 1 — FIELD LOG ───────────────────────────────────────────────────
function screenLog(sx) {
  rect(`s1-bg`, sx, 0, W, H, BG);
  statusBar(sx);

  // Header
  serif(`s1-title`, sx+20, 54, 200, 'Field Log', 28, INK, {weight:700});
  mono(`s1-total`, sx+W-70, 62, 60, '847\nOBS', 10, OLIVE, {align:'right', weight:700, lh:1.2});

  // Filter chips
  const filters = ['ALL', 'BIRDS', 'PLANTS', 'FUNGI', 'INVERTS'];
  filters.forEach((f, i) => {
    const fw = f.length * 7 + 20;
    const fx = sx + 20 + [0,40,96,154,208][i];
    const active = i === 0;
    rect(`s1-chip-bg-${i}`, fx, 96, fw, 22, active ? OLIVE : SURFACE, {cr:11});
    mono(`s1-chip-lbl-${i}`, fx, 103, fw, f, 7, active ? CARD : MIST, {align:'center', ls:0.06, weight: active ? 700 : 400});
  });

  // Timeline entries
  const entries = [
    { date:'28 MAR', time:'10:45', name:'Scarlet Elf Cup', latin:'Sarcoscypha austriaca', loc:'Old willow log', cat:'FUNGI', color:RUST },
    { date:'28 MAR', time:'09:10', name:'Cuckooflower', latin:'Cardamine pratensis', loc:'Wet meadow edge', cat:'PLANT', color:TERRA },
    { date:'28 MAR', time:'08:22', name:'Common Chiffchaff', latin:'Phylloscopus collybita', loc:'North hedge', cat:'BIRD', color:OLIVE },
    { date:'27 MAR', time:'17:30', name:'Brimstone Butterfly', latin:'Gonepteryx rhamni', loc:'Bramble patch', cat:'INVERT', color:SKY },
    { date:'27 MAR', time:'14:15', name:'Blackthorn in bloom', latin:'Prunus spinosa', loc:'Lane edge hedge', cat:'PLANT', color:TERRA },
    { date:'26 MAR', time:'07:55', name:'Willow Warbler', latin:'Phylloscopus trochilus', loc:'Willow carr', cat:'BIRD', color:OLIVE },
  ];

  let ey = 132;
  let lastDate = '';
  entries.forEach((e, i) => {
    if (e.date !== lastDate) {
      mono(`s1-date-${i}`, sx+20, ey, 200, e.date, 8, TERRA, {ls:0.1, weight:700});
      ey += 16;
      lastDate = e.date;
    }
    rect(`s1-e-bg-${i}`, sx+16, ey, W-32, 62, SURFACE, {cr:6});
    rect(`s1-e-line-${i}`, sx+16, ey, 3, 62, e.color, {cr:2});
    serif(`s1-e-name-${i}`, sx+28, ey+8, 220, e.name, 13, INK, {weight:600});
    mono(`s1-e-lat-${i}`, sx+28, ey+24, 200, e.latin, 8, MIST, {ls:0.01});
    mono(`s1-e-meta-${i}`, sx+28, ey+38, 240, `${e.time} · ${e.loc}`, 8, e.color);
    rect(`s1-e-badge-bg-${i}`, sx+W-56, ey+8, 48, 15, e.color, {cr:3, op:0.85});
    mono(`s1-e-badge-${i}`, sx+W-52, ey+12, 40, e.cat, 7, CARD, {align:'center'});
    ey += 70;
  });

  bottomNav(sx, 1);
}

// ─── Screen 2 — LIFE LIST (Species) ─────────────────────────────────────────
function screenLife(sx) {
  rect(`s2-bg`, sx, 0, W, H, BG);
  statusBar(sx);

  serif(`s2-title`, sx+20, 54, 240, 'Life List', 28, INK, {weight:700});
  mono(`s2-sub`, sx+20, 86, 240, '128 SPECIES · 6 YEARS', 9, OLIVE, {ls:0.07, weight:700});

  // Category tabs
  const catTabs = ['BIRDS', 'PLANTS', 'FUNGI', 'INVERTS', 'MAMMALS'];
  catTabs.forEach((t, i) => {
    const active = i === 0;
    rect(`s2-tab-bg-${i}`, sx+20+i*64, 106, 58, 24, active ? OLIVE : 'transparent', {cr:12});
    mono(`s2-tab-${i}`, sx+20+i*64, 114, 58, t, 7, active ? CARD : MIST, {align:'center', ls:0.05});
  });

  // Stats row
  rect(`s2-stats-bg`, sx+16, 142, W-32, 52, SURFACE, {cr:8});
  const stats = [{v:'74', l:'UK BIRDS'}, {v:'89%', l:'LOCAL'}, {v:'23', l:'THIS YR'}, {v:'3', l:'NEW'}];
  stats.forEach((s, i) => {
    const tx = sx+36+i*82;
    serif(`s2-stat-v-${i}`, tx, 152, 70, s.v, 18, i===3?TERRA:OLIVE, {weight:700, align:'center'});
    mono(`s2-stat-l-${i}`, tx, 172, 70, s.l, 7, MIST, {align:'center', ls:0.05});
  });

  // Bird life list
  mono(`s2-list-lbl`, sx+20, 206, 200, 'RECENTLY ADDED', 8, MIST, {ls:0.08});

  const birds = [
    { name:'Yellowhammer', latin:'Emberiza citrinella', date:'14 Mar 2026', new:true },
    { name:'Hawfinch', latin:'Coccothraustes coccothraustes', date:'02 Jan 2026', new:true },
    { name:'Ring Ouzel', latin:'Turdus torquatus', date:'09 Oct 2025', new:false },
    { name:'Water Rail', latin:'Rallus aquaticus', date:'22 Aug 2025', new:false },
    { name:'Little Egret', latin:'Egretta garzetta', date:'15 Jun 2025', new:false },
    { name:'Peregrine', latin:'Falco peregrinus', date:'03 Apr 2025', new:false },
  ];

  birds.forEach((b, i) => {
    const by = 224 + i * 68;
    rect(`s2-b-bg-${i}`, sx+16, by, W-32, 62, CARD, {cr:6});
    serif(`s2-b-name-${i}`, sx+28, by+8, 220, b.name, 14, INK, {weight:600});
    mono(`s2-b-latin-${i}`, sx+28, by+26, 220, b.latin, 8, MIST, {ls:0.01});
    mono(`s2-b-date-${i}`, sx+28, by+41, 220, `First: ${b.date}`, 8, OLIVE);
    if (b.new) {
      rect(`s2-new-bg-${i}`, sx+W-56, by+8, 44, 16, TERRA, {cr:3});
      mono(`s2-new-lbl-${i}`, sx+W-53, by+12, 38, 'NEW', 8, CARD, {align:'center', weight:700});
    }
    mono(`s2-arrow-${i}`, sx+W-30, by+26, 20, '›', 16, DIM);
  });

  bottomNav(sx, 2);
}

// ─── Screen 3 — MY PATCH (location map) ─────────────────────────────────────
function screenPatch(sx) {
  rect(`s3-bg`, sx, 0, W, H, BG);
  statusBar(sx);

  serif(`s3-title`, sx+20, 54, 200, 'My Patch', 28, INK, {weight:700});
  mono(`s3-sub`, sx+20, 86, 260, 'HARTING DOWN · 2.4KM²', 9, OLIVE, {ls:0.07, weight:700});

  // Map area — topographic dot-plot representation
  rect(`s3-map-bg`, sx+16, 108, W-32, 260, SURFACE, {cr:10});
  rect(`s3-map-border`, sx+16, 108, W-32, 260, 'transparent', {cr:10, stroke:DIM, sw:1});

  // Contour-like background bands (topographic feel)
  rect(`s3-topo-1`, sx+30, 130, W-60, 30, OLIVE, {cr:4, op:0.06});
  rect(`s3-topo-2`, sx+40, 168, W-80, 50, OLIVE, {cr:4, op:0.08});
  rect(`s3-topo-3`, sx+50, 222, W-100, 60, OLIVE, {cr:4, op:0.10});
  rect(`s3-topo-4`, sx+55, 285, W-110, 40, OLIVE, {cr:4, op:0.08});

  // Grid overlay
  for (let gx = 0; gx < 8; gx++) {
    rect(`s3-gx-${gx}`, sx+16+gx*43, 108, 1, 260, DIM, {op:0.4});
  }
  for (let gy = 0; gy < 7; gy++) {
    rect(`s3-gy-${gy}`, sx+16, 108+gy*43, W-32, 1, DIM, {op:0.4});
  }

  // Observation dots — clustered realistically
  const dots = [
    {x:0.22, y:0.18, c:OLIVE, r:6, label:''},   // birds - north hedge
    {x:0.68, y:0.25, c:OLIVE, r:5, label:''},
    {x:0.35, y:0.42, c:TERRA, r:5, label:''},   // plants - meadow
    {x:0.55, y:0.38, c:TERRA, r:4, label:''},
    {x:0.72, y:0.55, c:RUST,  r:4, label:''},   // fungi - log
    {x:0.18, y:0.65, c:OLIVE, r:5, label:''},
    {x:0.45, y:0.72, c:SKY,   r:4, label:''},   // inverts
    {x:0.82, y:0.18, c:OLIVE, r:6, label:''},
    {x:0.25, y:0.35, c:TERRA, r:3, label:''},
    {x:0.60, y:0.68, c:OLIVE, r:5, label:''},
    {x:0.38, y:0.82, c:TERRA, r:4, label:''},
    {x:0.78, y:0.82, c:RUST,  r:3, label:''},
    // Hot spot cluster
    {x:0.42, y:0.44, c:OLIVE, r:8, label:''},
    {x:0.46, y:0.48, c:TERRA, r:5, label:''},
    {x:0.40, y:0.50, c:RUST,  r:4, label:''},
  ];

  const mapX = sx+16, mapY = 108, mapW = W-32, mapH = 260;
  dots.forEach((d, i) => {
    const dx = mapX + d.x * mapW;
    const dy = mapY + d.y * mapH;
    rect(`s3-dot-glow-${i}`, dx-d.r*2, dy-d.r*2, d.r*4, d.r*4, d.c, {cr:d.r*2, op:0.15});
    rect(`s3-dot-${i}`, dx-d.r/2, dy-d.r/2, d.r, d.r, d.c, {cr:d.r, op:0.9});
  });

  // Map labels
  mono(`s3-map-n`, sx+W-40, 114, 30, 'N ↑', 8, MIST, {align:'right'});
  mono(`s3-map-scale`, sx+20, 356, 120, '← 500m →', 8, MIST);

  // Hotspot callout
  rect(`s3-hot-bg`, sx+100, 210, 140, 36, CARD, {cr:6});
  rect(`s3-hot-bar`, sx+100, 210, 3, 36, TERRA, {cr:2});
  mono(`s3-hot-lbl`, sx+108, 218, 130, 'HOTSPOT', 7, TERRA, {ls:0.08, weight:700});
  mono(`s3-hot-val`, sx+108, 229, 130, '28 obs this week', 8, INK);

  // Legend
  rect(`s3-legend-bg`, sx+16, 380, W-32, 38, SURFACE, {cr:8});
  const legItems = [{c:OLIVE, l:'BIRDS'}, {c:TERRA, l:'PLANTS'}, {c:RUST, l:'FUNGI'}, {c:SKY, l:'INVERTS'}];
  legItems.forEach((li, i) => {
    const lx = sx+32 + i * 78;
    rect(`s3-leg-dot-${i}`, lx, 394, 8, 8, li.c, {cr:4});
    mono(`s3-leg-lbl-${i}`, lx+12, 393, 60, li.l, 8, MIST);
  });

  // Patch stats
  rect(`s3-patch-stats`, sx+16, 428, W-32, 56, CREAM, {cr:8});
  const pstats = [{v:'847', l:'TOTAL OBS'}, {v:'128', l:'SPECIES'}, {v:'6.2y', l:'WATCHED'}, {v:'#3', l:'LOCAL RANK'}];
  pstats.forEach((s, i) => {
    const px = sx+30 + i*82;
    serif(`s3-ps-v-${i}`, px, 438, 70, s.v, 16, i===3?TERRA:INK, {weight:700, align:'center'});
    mono(`s3-ps-l-${i}`, px, 458, 70, s.l, 7, MIST, {align:'center', ls:0.05});
  });

  // Recent sightings near patch label
  mono(`s3-nearby-lbl`, sx+20, 496, 200, 'NEARBY SIGHTINGS TODAY', 8, MIST, {ls:0.08});

  const nearby = [
    { name:'Red Kite', dist:'1.2km NE', cat:'BIRD', color:OLIVE },
    { name:'Early Purple Orchid', dist:'0.8km SW', cat:'PLANT', color:TERRA },
  ];
  nearby.forEach((n, i) => {
    const ny = 512 + i * 58;
    rect(`s3-nb-bg-${i}`, sx+16, ny, W-32, 52, SURFACE, {cr:6});
    rect(`s3-nb-line-${i}`, sx+16, ny, 3, 52, n.color, {cr:2});
    serif(`s3-nb-name-${i}`, sx+28, ny+8, 220, n.name, 13, INK, {weight:600});
    mono(`s3-nb-dist-${i}`, sx+28, ny+26, 200, `📍 ${n.dist}`, 9, n.color);
    rect(`s3-nb-badge-bg-${i}`, sx+W-56, ny+8, 48, 16, n.color, {cr:3, op:0.8});
    mono(`s3-nb-badge-${i}`, sx+W-52, ny+12, 40, n.cat, 7, CARD, {align:'center'});
  });

  bottomNav(sx, 3);
}

// ─── Screen 4 — OBSERVER PROFILE ────────────────────────────────────────────
function screenProfile(sx) {
  rect(`s4-bg`, sx, 0, W, H, BG);
  statusBar(sx);

  // Header with observer name
  serif(`s4-name`, sx+20, 54, 240, 'Mira Thatch', 26, INK, {weight:700});
  mono(`s4-since`, sx+20, 84, 240, 'NATURALIST · SINCE 2020', 9, OLIVE, {ls:0.07, weight:700});
  rect(`s4-avatar`, sx+W-68, 52, 48, 48, OLIVE, {cr:24, op:0.2});
  mono(`s4-avatar-init`, sx+W-52, 68, 24, 'MT', 13, OLIVE, {align:'center', weight:700});

  // Score card
  rect(`s4-score-bg`, sx+16, 114, W-32, 68, SURFACE, {cr:10});
  serif(`s4-score-val`, sx+28, 122, 80, '8.4', 32, OLIVE, {weight:700});
  mono(`s4-score-lbl`, sx+28, 158, 100, 'OBSERVER SCORE', 7, MIST, {ls:0.07});
  // Score descriptors
  const scoreItems = [
    {l:'STREAK', v:'14d'},
    {l:'OBS/WEEK', v:'12.3'},
    {l:'SPECIES/MO', v:'18'},
    {l:'PATCHES', v:'3'},
  ];
  scoreItems.forEach((s, i) => {
    const sx2 = sx+120 + Math.floor(i/2)*98;
    const sy2 = 122 + (i%2)*26;
    mono(`s4-sc-v-${i}`, sx2, sy2, 80, s.v, 13, INK, {weight:700});
    mono(`s4-sc-l-${i}`, sx2+52, sy2+2, 60, s.l, 7, MIST, {ls:0.04});
  });

  // Category breakdown bars
  mono(`s4-cats-lbl`, sx+20, 196, 200, 'BY CATEGORY', 8, MIST, {ls:0.08});

  const cats = [
    {l:'BIRDS',   v:74, pct:0.78, c:OLIVE},
    {l:'PLANTS',  v:32, pct:0.34, c:TERRA},
    {l:'FUNGI',   v:14, pct:0.15, c:RUST},
    {l:'INVERTS', v:8,  pct:0.09, c:SKY},
  ];
  cats.forEach((cat, i) => {
    const cy = 212 + i * 46;
    mono(`s4-cat-l-${i}`, sx+20, cy, 70, cat.l, 9, INK, {weight:700});
    mono(`s4-cat-v-${i}`, sx+W-50, cy, 40, `${cat.v}sp`, 9, cat.c, {align:'right', weight:700});
    rect(`s4-bar-bg-${i}`, sx+90, cy+2, W-130, 12, DIM, {cr:6});
    rect(`s4-bar-fill-${i}`, sx+90, cy+2, Math.round((W-130)*cat.pct), 12, cat.c, {cr:6});
    // Bar end chip
    const barEnd = sx+90 + Math.round((W-130)*cat.pct) - 16;
    rect(`s4-bar-cap-${i}`, barEnd, cy, 16, 16, cat.c, {cr:8, op:0.25});
  });

  // Personal bests
  mono(`s4-bests-lbl`, sx+20, 402, 200, 'PERSONAL BESTS', 8, MIST, {ls:0.08});
  rect(`s4-bests-bg`, sx+16, 418, W-32, 72, CREAM, {cr:8});
  const bests = [
    {l:'BEST DAY', v:'28 obs', sub:'18 Apr 2024'},
    {l:'BEST MONTH', v:'134 obs', sub:'May 2024'},
    {l:'RAREST', v:'Hawfinch', sub:'02 Jan 2026'},
  ];
  bests.forEach((b, i) => {
    const bx = sx+30+i*108;
    serif(`s4-best-v-${i}`, bx, 428, 100, b.v, 13, INK, {weight:600});
    mono(`s4-best-l-${i}`, bx, 445, 100, b.l, 7, MIST, {ls:0.05});
    mono(`s4-best-s-${i}`, bx, 458, 100, b.sub, 8, TERRA);
  });

  // Year calendar heatmap (simplified strip)
  mono(`s4-heat-lbl`, sx+20, 504, 200, 'ACTIVITY · 2026', 8, MIST, {ls:0.08});
  rect(`s4-heat-bg`, sx+16, 520, W-32, 36, SURFACE, {cr:6});

  // 13 weeks of dots (simplified weekly buckets)
  const weekVals = [2,5,8,12,7,15,9,11,6,14,10,12,8];
  weekVals.forEach((v, i) => {
    const ht = Math.min(24, Math.round(v * 1.6));
    const hx = sx+24 + i*25;
    const hy = 520 + 36 - 6 - ht;
    const op = 0.2 + v/15 * 0.8;
    rect(`s4-hbar-${i}`, hx, hy, 18, ht, OLIVE, {cr:3, op});
  });

  // Badges
  mono(`s4-badges-lbl`, sx+20, 570, 200, 'BADGES EARNED', 8, MIST, {ls:0.08});
  const badges = [
    {icon:'◈', label:'EARLY RISER', col:TERRA},
    {icon:'◉', label:'PATCH KEEPER', col:OLIVE},
    {icon:'◆', label:'FUNGI FRIEND', col:RUST},
    {icon:'◎', label:'LIFER HUNTER', col:SKY},
  ];
  badges.forEach((b, i) => {
    const bx = sx+16+i*82;
    rect(`s4-badge-bg-${i}`, bx, 586, 74, 68, SURFACE, {cr:8});
    mono(`s4-badge-icon-${i}`, bx, 600, 74, b.icon, 18, b.col, {align:'center'});
    mono(`s4-badge-lbl-${i}`, bx, 623, 74, b.label, 6, MIST, {align:'center', ls:0.04});
  });

  bottomNav(sx, 4);
}

// ─── BUILD ALL SCREENS ───────────────────────────────────────────────────────

function screenX(index) {
  return GAP + index * (W + GAP);
}

screenToday(screenX(0));
screenLog(screenX(1));
screenLife(screenX(2));
screenPatch(screenX(3));
screenProfile(screenX(4));

// Output pen file
const pen = {
  version: '2.8',
  name: 'SILT',
  width: canvas_w,
  height: H,
  fill: BG,
  children: nodes
};

fs.writeFileSync('silt.pen', JSON.stringify(pen, null, 2));
console.log(`✓ silt.pen written — ${nodes.length} nodes, canvas ${canvas_w}×${H}`);
