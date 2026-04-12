// reel-app.js — REEL: Shot List & Film Production Planner
// Theme: DARK (previous design 'lume' was light)
// Inspired by:
//   darkmodedesign.com → MICRODOT.vision: near-black #0d0d0d editorial dark,
//     all-caps typography with dramatic tracking, cinematic video portfolio
//     "RENDERING IMAGINATION" — bold minimalism, full-bleed media cards.
//   darkmodedesign.com → Darkroom.au: #0f0f0f product dark, clean monospace
//     nav, elegant contrast-heavy layout, "next generation" bold statements.
//   darkmodedesign.com → Neon.com: pure-black SaaS, feature tab navigation,
//     bold heading + quiet body copy pairing, GitHub-era tech dark.
// Novelty: Cinematic "clapperboard" shot cards — each shot rendered as a
//   stylized clapperboard header with scene/shot/take labels in all-caps mono,
//   emulating the physical artifact. First film-production app in this series.

const fs = require('fs');

const W = 390, H = 844, SCREENS = 5, GAP = 80;

// ── Palette (DARK — MICRODOT near-black cinematic) ───────────────────────────
const BG       = '#0D0D0D';
const SURFACE  = '#181818';
const SURF2    = '#222222';
const SURF3    = '#2A2A2A';
const SURF4    = '#323232';
const TEXT     = '#F0EDE5';
const TEXT2    = '#8A8480';
const TEXT3    = '#5A5450';
const ACCENT   = '#D4A24F';  // golden hour amber
const ACCENT2  = '#E84545';  // record red
const ACCENT3  = '#4A9EFF';  // slate blue
const ACCENT_DIM  = 'rgba(212,162,79,0.12)';
const ACCENT_MED  = 'rgba(212,162,79,0.22)';
const ACCENT_STR  = 'rgba(212,162,79,0.55)';
const RED_DIM     = 'rgba(232,69,69,0.14)';
const RED_MED     = 'rgba(232,69,69,0.25)';
const BLUE_DIM    = 'rgba(74,158,255,0.12)';

const totalH = H * SCREENS + GAP * (SCREENS - 1);

const pen = {
  version: '2.8',
  metadata: {
    name: 'REEL',
    description: 'Shot list & film production planner — cinematic dark editorial',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    theme: 'dark',
    palette: { bg: BG, surface: SURFACE, text: TEXT, accent: ACCENT }
  },
  canvas: { width: W, height: totalH, background: BG },
  elements: []
};

let id = 0;
const uid = () => `el-${++id}`;
function el(type, props) { pen.elements.push({ id: uid(), type, ...props }); }

function rect(x, y, w, h, fill, opts) {
  opts = opts || {};
  el('rect', { x, y, width: w, height: h, fill,
    rx: opts.rx||0, ry: opts.ry||0,
    opacity: opts.opacity||1,
    stroke: opts.stroke||null,
    strokeWidth: opts.strokeWidth||0,
    rotate: opts.rotate||0,
    rotateCX: opts.rotateCX||(x+w/2),
    rotateCY: opts.rotateCY||(y+h/2),
  });
}

function text(x, y, content, size, fill, opts) {
  opts = opts || {};
  el('text', {
    x, y, content: String(content),
    fontSize: size, fill,
    fontFamily: opts.font || 'Inter, system-ui, sans-serif',
    fontWeight: opts.weight || '400',
    textAlign: opts.align || 'left',
    letterSpacing: opts.spacing || '0',
    opacity: opts.opacity || 1,
    width: opts.width || 300,
    lineHeight: opts.lineHeight || 1.4,
    fontStyle: opts.italic ? 'italic' : 'normal',
  });
}

function circle(x, y, r, fill, opts) {
  opts = opts || {};
  el('ellipse', { x: x-r, y: y-r, width: r*2, height: r*2, fill,
    opacity: opts.opacity||1,
    stroke: opts.stroke||null,
    strokeWidth: opts.strokeWidth||0,
  });
}

function line(x1, y1, x2, y2, color, w) {
  el('line', { x1, y1, x2, y2, stroke: color, strokeWidth: w||1, opacity:1 });
}

const screenTop = s => (s-1)*(H+GAP);

// ── Status bar ───────────────────────────────────────────────────────────────
function statusBar(s) {
  const Y = screenTop(s);
  text(24, Y+16, '9:41', 13, TEXT, { weight:'600', spacing:'0.3', width:60 });
  // Signal dots
  [0,1,2,3].forEach(i => {
    const h = 5 + i*2;
    rect(W-80+i*8, Y+20-h+4, 5, h, i<3 ? TEXT : TEXT3, { rx:1 });
  });
  // Battery
  rect(W-45, Y+18, 26, 11, 'transparent', { rx:3, stroke:TEXT2, strokeWidth:1 });
  rect(W-44, Y+19, 16, 9, TEXT, { rx:2 });
  rect(W-18, Y+21, 3, 7, TEXT2, { rx:1 });
  // WiFi
  [6,10,14].forEach((r,i) => {
    circle(W-58, Y+24, r, 'transparent', { stroke: i===2?TEXT3:TEXT2, strokeWidth:2, opacity: i===2?0.4:1 });
  });
}

// ── Nav bar ──────────────────────────────────────────────────────────────────
const NAV = [
  { icon:'⊞', label:'PROJECTS' },
  { icon:'≡', label:'BREAKDOWN' },
  { icon:'◧', label:'SHOTS'    },
  { icon:'◷', label:'SCHEDULE' },
];
function navBar(s, active) {
  const Y = screenTop(s);
  const NY = Y + H - 64;
  rect(0, NY, W, 64, SURF2);
  line(0, NY, W, NY, SURF3, 1);
  const nw = W / NAV.length;
  NAV.forEach(function(n, i) {
    const nx = i * nw + nw/2;
    const isActive = (i === active);
    if(isActive) {
      rect(i*nw+16, NY+6, nw-32, 3, ACCENT, { rx:2 });
    }
    text(i*nw, NY+14, n.icon, 20, isActive ? ACCENT : TEXT3, { align:'center', width:nw, weight:'500' });
    text(i*nw, NY+36, n.label, 8, isActive ? ACCENT : TEXT3, { align:'center', width:nw, weight:'600', spacing:'1.5' });
  });
}

// ────────────────────────────────────────────────────────────────────────────
// S1: PROJECTS OVERVIEW
// ────────────────────────────────────────────────────────────────────────────
{
  const s = 1, Y = screenTop(s);
  rect(0, Y, W, H, BG);
  statusBar(s);

  // Header
  text(24, Y+52, 'REEL', 11, ACCENT, { weight:'700', spacing:'4', width:100 });
  text(24, Y+68, 'My Projects', 26, TEXT, { weight:'700', spacing:'-0.5', width:260 });

  // New project button
  rect(W-72, Y+62, 52, 30, ACCENT, { rx:15 });
  text(W-72, Y+69, '+ NEW', 10, BG, { weight:'700', align:'center', width:52, spacing:'1' });

  // Sort label
  text(24, Y+110, 'IN PRODUCTION · 2 ACTIVE', 10, TEXT3, { weight:'600', spacing:'2', width:300 });

  // ── Project card 1: "DESERT RUN" (Active) ──
  const C1Y = Y+132;
  rect(16, C1Y, W-32, 140, SURFACE, { rx:16 });
  // Film strip header
  rect(16, C1Y, W-32, 56, SURF2, { rx:16 });
  rect(16, C1Y+40, W-32, 16, SURF2);

  // Film perforations (decorative)
  [0,1,2,3,4,5,6,7].forEach(i => {
    rect(28+i*42, C1Y+6, 22, 14, SURF3, { rx:3 });
    rect(28+i*42, C1Y+36, 22, 14, SURF3, { rx:3 });
  });

  // Status badge
  rect(W-80, C1Y+14, 52, 20, RED_MED, { rx:10 });
  circle(W-68, C1Y+24, 4, ACCENT2);
  text(W-62, C1Y+16, 'LIVE', 9, ACCENT2, { weight:'700', spacing:'1.5', width:34 });

  text(24, C1Y+70, 'DESERT RUN', 20, TEXT, { weight:'800', spacing:'1.5', width:280 });
  text(24, C1Y+96, 'Feature Film · 34 scenes · Day 3 of 12', 12, TEXT2, { width:300 });

  // Progress bar
  rect(24, C1Y+116, W-64, 6, SURF3, { rx:3 });
  rect(24, C1Y+116, (W-64)*0.24, 6, ACCENT, { rx:3 });
  text(24, C1Y+128, '24% complete · 8 scenes shot', 11, TEXT3, { width:240 });
  text(W-60, C1Y+128, 'EXT/INT', 11, TEXT3, { width:50 });

  // ── Project card 2: "STILL WATER" (Pre-prod) ──
  const C2Y = C1Y+158;
  rect(16, C2Y, W-32, 120, SURFACE, { rx:16 });
  rect(16, C2Y, W-32, 40, SURF2, { rx:16 });
  rect(16, C2Y+24, W-32, 16, SURF2);

  // Film perforations (smaller)
  [0,1,2,3,4,5,6,7].forEach(i => {
    rect(28+i*42, C2Y+4, 22, 10, SURF3, { rx:2 });
    rect(28+i*42, C2Y+26, 22, 10, SURF3, { rx:2 });
  });

  // Status badge - pre-production
  rect(W-100, C2Y+10, 72, 20, BLUE_DIM, { rx:10 });
  text(W-100, C2Y+12, 'PRE-PROD', 9, ACCENT3, { weight:'700', spacing:'1', align:'center', width:72 });

  text(24, C2Y+52, 'STILL WATER', 20, TEXT, { weight:'800', spacing:'1.5', width:280 });
  text(24, C2Y+78, 'Short Film · 12 scenes · Starts Apr 14', 12, TEXT2, { width:300 });

  rect(24, C2Y+100, W-64, 6, SURF3, { rx:3 });
  rect(24, C2Y+100, (W-64)*0.05, 6, ACCENT3, { rx:3 });
  text(24, C2Y+112, 'Script locked · Locations scouted', 11, TEXT3, { width:300 });

  // ── "RECENT" section ──
  const RY = C2Y+140;
  text(24, RY, 'RECENT ACTIVITY', 10, TEXT3, { weight:'600', spacing:'2', width:300 });

  const activities = [
    { icon:'◧', text:'Shot 12 of Sc.7 — approved', time:'2h ago', color: ACCENT  },
    { icon:'✎', text:'Shot list updated — Scene 12', time:'4h ago', color: TEXT2  },
    { icon:'◷', text:'Call sheet sent — Day 4',      time:'1d ago', color: ACCENT3 },
  ];
  activities.forEach(function(a, i) {
    const ay = RY+22+i*46;
    rect(16, ay, W-32, 38, SURFACE, { rx:10 });
    circle(40, ay+19, 13, SURF2);
    text(34, ay+13, a.icon, 12, a.color, { width:12, weight:'600' });
    text(60, ay+7, a.text, 12, TEXT, { weight:'500', width:240 });
    text(60, ay+23, a.time, 11, TEXT3, { width:120 });
  });

  navBar(s, 0);
}

// ────────────────────────────────────────────────────────────────────────────
// S2: SCENE BREAKDOWN (Desert Run)
// ────────────────────────────────────────────────────────────────────────────
{
  const s = 2, Y = screenTop(s);
  rect(0, Y, W, H, BG);
  statusBar(s);

  // Header with project name
  rect(0, Y+44, W, 52, SURFACE);
  text(24, Y+52, '◁  DESERT RUN', 12, TEXT2, { weight:'600', spacing:'0.5', width:200 });
  text(24, Y+68, 'Scene Breakdown', 18, TEXT, { weight:'700', spacing:'-0.3', width:260 });

  // Shoot day tabs
  const days = ['ALL', 'DAY 1', 'DAY 2', 'DAY 3', 'DAY 4'];
  const tabW = 64;
  rect(0, Y+96, W, 34, BG);
  days.forEach(function(d, i) {
    const tx = 16+i*70;
    const isActive = (i===3);
    if(isActive) {
      rect(tx-8, Y+98, tabW, 26, ACCENT_DIM, { rx:13 });
      text(tx-8, Y+104, d, 10, ACCENT, { weight:'700', align:'center', width:tabW, spacing:'1' });
      line(tx-8+8, Y+124, tx-8+tabW-8, Y+124, ACCENT, 2);
    } else {
      text(tx-8, Y+104, d, 10, TEXT3, { weight:'500', align:'center', width:tabW, spacing:'1' });
    }
  });

  // Day 3 header
  const DY = Y+142;
  rect(16, DY, W-32, 36, ACCENT_DIM, { rx:8 });
  text(24, DY+10, '◷  DAY 3 — EXTERIOR CANYON · 6 SCENES PLANNED', 10, ACCENT, { weight:'700', spacing:'1', width:W-48 });

  // Scene list
  const scenes = [
    { num:'11', int:'EXT', time:'DAY',   loc:'Canyon Ridge',    shots: 6, done: 6, status:'done',    desc:'Hero drives into canyon, establishes scale'   },
    { num:'12', int:'EXT', time:'DAY',   loc:'Canyon Floor',    shots: 9, done: 3, status:'active',  desc:'Chase sequence begins — wide establishing'     },
    { num:'13', int:'EXT', time:'DUSK',  loc:'Canyon Floor',    shots: 7, done: 0, status:'pending', desc:'Hero hides behind rock formation'              },
    { num:'14', int:'EXT', time:'DUSK',  loc:'Cliff Overlook',  shots: 4, done: 0, status:'pending', desc:'Villain reveals himself at cliff edge'         },
    { num:'15', int:'INT', time:'NIGHT', loc:'Hero\'s Vehicle', shots: 5, done: 0, status:'pending', desc:'Radio call — intercutting with base camp'      },
  ];

  const statusColors = { done: ACCENT, active: ACCENT2, pending: TEXT3 };
  const statusLabels = { done: 'DONE', active: 'FILMING', pending: '—' };

  scenes.forEach(function(sc, i) {
    const sy = DY+46+i*88;
    const isActive = sc.status === 'active';

    rect(16, sy, W-32, 78, isActive ? SURFACE : SURFACE, { rx:12,
      stroke: isActive ? ACCENT2 : 'transparent', strokeWidth: isActive?1:0 });

    // Scene number block (clapperboard style)
    rect(16, sy, 54, 78, isActive ? RED_DIM : SURF2, { rx:12 });
    // Diagonal stripes in scene block
    line(16, sy+14, 70, sy+14, isActive ? ACCENT2+'44' : SURF3, 2);

    text(16, sy+8, 'SC.', 8, isActive ? ACCENT2 : TEXT3, { weight:'700', spacing:'2', align:'center', width:54 });
    text(16, sy+22, sc.num, 22, isActive ? ACCENT2 : TEXT, { weight:'800', align:'center', width:54, spacing:'-0.5', font:"'SF Mono', 'Fira Code', monospace" });
    text(16, sy+50, sc.int, 9, isActive ? ACCENT2+'BB' : TEXT3, { weight:'700', align:'center', width:54, spacing:'1.5' });
    text(16, sy+62, sc.time, 8, isActive ? ACCENT2+'88' : TEXT3, { weight:'600', align:'center', width:54, spacing:'1' });

    // Content
    text(80, sy+10, sc.loc.toUpperCase(), 10, isActive ? ACCENT2 : TEXT3, { weight:'700', spacing:'1.5', width:200 });
    text(80, sy+28, sc.desc, 12, TEXT, { weight:'400', width:W-108, lineHeight:1.3 });

    // Shot progress
    const shotW = W-108-32;
    const barX = 80, barY = sy+56;
    rect(barX, barY, shotW, 5, SURF3, { rx:2 });
    const pct = sc.shots > 0 ? sc.done/sc.shots : 0;
    if(pct > 0) rect(barX, barY, shotW*pct, 5, statusColors[sc.status], { rx:2 });
    text(barX, barY+10, `${sc.done}/${sc.shots} shots`, 10, TEXT3, { width:100 });

    // Status badge
    const sw = sc.status==='done'?44:sc.status==='active'?68:20;
    rect(W-sw-20, sy+10, sw, 18, sc.status==='done' ? ACCENT_DIM : sc.status==='active' ? RED_DIM : 'transparent', { rx:9 });
    text(W-sw-20, sy+12, statusLabels[sc.status], 9, statusColors[sc.status], { weight:'700', align:'center', width:sw, spacing:'1' });
  });

  navBar(s, 1);
}

// ────────────────────────────────────────────────────────────────────────────
// S3: SHOT LIST — Scene 12
// ────────────────────────────────────────────────────────────────────────────
{
  const s = 3, Y = screenTop(s);
  rect(0, Y, W, H, BG);
  statusBar(s);

  // ── Clapperboard header ──
  const CLAP_H = 88;
  rect(0, Y+44, W, CLAP_H, '#111111');

  // Clapperboard diagonal stripe pattern
  const stripeCount = 12;
  const stripeW = (W*2)/stripeCount;
  for(let i=0;i<stripeCount;i++) {
    if(i%2===0) {
      // Draw alternating slanted blocks (approximated with rects)
      rect(-W/2+i*stripeW/2, Y+44, stripeW/2, 20, '#1E1E1E', { rx:0 });
    }
  }
  rect(0, Y+44, W, 4, ACCENT2); // red top edge

  // Clapperboard labels
  text(24, Y+54, 'PROD', 8, TEXT3, { weight:'700', spacing:'2', width:60 });
  text(24, Y+66, 'DESERT RUN', 13, TEXT, { weight:'800', spacing:'1', width:180 });

  text(W/2+10, Y+54, 'SCENE', 8, TEXT3, { weight:'700', spacing:'2', width:60 });
  text(W/2+10, Y+66, '12', 20, ACCENT, { weight:'800', spacing:'-0.5', width:40, font:"'SF Mono', 'Fira Code', monospace" });

  text(W-100, Y+54, 'TAKE', 8, TEXT3, { weight:'700', spacing:'2', width:40 });
  text(W-100, Y+66, '—', 16, TEXT2, { weight:'700', width:40 });

  // Clapper arm
  rect(0, Y+44+CLAP_H-16, W, 16, SURF2);
  text(24, Y+44+CLAP_H-12, 'EXT  ·  CANYON FLOOR  ·  DAY  ·  9 SHOTS PLANNED', 9, TEXT3, { weight:'600', spacing:'1.5', width:W-32 });

  // Shot filter tabs
  const shotTabs = ['ALL SHOTS', 'PENDING', 'APPROVED'];
  const tabY = Y+44+CLAP_H+10;
  shotTabs.forEach(function(t, i) {
    const tw = 110;
    const tx = 12 + i*(tw+4);
    const isA = i===0;
    rect(tx, tabY, tw, 24, isA ? ACCENT_DIM : SURF2, { rx:12 });
    text(tx, tabY+7, t, 9, isA ? ACCENT : TEXT3, { weight:'700', align:'center', width:tw, spacing:'1' });
  });

  // ── Shot cards (clapperboard card aesthetic) ──
  const shots = [
    { num:'A', type:'MASTER',    lens:'24mm',  move:'STATIC',   dur:'0:04',  notes:'Wide — car enters frame from left',    done:true  },
    { num:'B', type:'OTS HERO',  lens:'50mm',  move:'DOLLY IN', dur:'0:06',  notes:'Over shoulder, pursuers visible behind', done:true },
    { num:'C', type:'CLOSE UP',  lens:'85mm',  move:'STATIC',   dur:'0:03',  notes:'Hero\'s face — reaction to engine sound', done:true },
    { num:'D', type:'AERIAL',    lens:'DRONE', move:'FLY DOWN',  dur:'0:08', notes:'Drone — canyon scale reveal, car tiny',  done:false },
    { num:'E', type:'POV',       lens:'35mm',  move:'HANDHELD', dur:'0:05',  notes:'Through windshield — canyon walls blur',  done:false},
    { num:'F', type:'INSERT',    lens:'100mm', move:'STATIC',   dur:'0:02',  notes:'GPS screen — signal lost',               done:false},
  ];

  const cardY = tabY + 36;
  const CARD_H = 70;
  shots.forEach(function(sh, i) {
    const sy = cardY + i*(CARD_H+8);
    if(sy + CARD_H > Y+H-70) return; // don't draw past nav
    const isDone = sh.done;

    rect(16, sy, W-32, CARD_H, SURFACE, { rx:10, stroke: isDone?ACCENT+'33':'transparent', strokeWidth:1 });

    // Shot letter block
    rect(16, sy, 48, CARD_H, isDone ? ACCENT_DIM : SURF2, { rx:10 });
    text(16, sy+4, 'SHOT', 7, isDone ? ACCENT+'88' : TEXT3, { weight:'700', spacing:'2', align:'center', width:48 });
    text(16, sy+18, sh.num, 22, isDone ? ACCENT : TEXT, { weight:'800', align:'center', width:48, font:"'SF Mono', 'Fira Code', monospace" });
    text(16, sy+46, sh.dur, 9, isDone ? ACCENT+'88' : TEXT3, { weight:'600', align:'center', width:48, font:"'SF Mono', 'Fira Code', monospace" });

    // Content
    text(74, sy+8, sh.type, 11, isDone ? TEXT : TEXT, { weight:'700', spacing:'0.5', width:180 });
    text(74, sy+24, sh.notes, 11, TEXT2, { width:W-116, lineHeight:1.3 });

    // Lens/move chips
    rect(74, sy+50, 50, 16, SURF3, { rx:8 });
    text(74, sy+53, sh.lens, 9, TEXT3, { align:'center', width:50, weight:'600', font:"'SF Mono', 'Fira Code', monospace" });
    rect(130, sy+50, 64, 16, SURF3, { rx:8 });
    text(130, sy+53, sh.move, 9, TEXT3, { align:'center', width:64, weight:'600', spacing:'0.5' });

    // Done check
    if(isDone) {
      circle(W-30, sy+CARD_H/2, 11, ACCENT_DIM);
      text(W-37, sy+CARD_H/2-9, '✓', 13, ACCENT, { weight:'700', width:14 });
    } else {
      circle(W-30, sy+CARD_H/2, 11, SURF3);
      text(W-35, sy+CARD_H/2-7, '○', 11, TEXT3, { weight:'400', width:10 });
    }
  });

  navBar(s, 2);
}

// ────────────────────────────────────────────────────────────────────────────
// S4: DAILY SCHEDULE — Day 3
// ────────────────────────────────────────────────────────────────────────────
{
  const s = 4, Y = screenTop(s);
  rect(0, Y, W, H, BG);
  statusBar(s);

  // Header
  rect(0, Y+44, W, 64, SURFACE);
  text(24, Y+52, 'SHOOTING SCHEDULE', 10, ACCENT, { weight:'700', spacing:'2.5', width:280 });
  text(24, Y+68, 'Day 3 — Tuesday', 20, TEXT, { weight:'700', spacing:'-0.3', width:220 });
  rect(W-88, Y+54, 68, 24, RED_DIM, { rx:12 });
  circle(W-78, Y+66, 5, ACCENT2);
  text(W-71, Y+58, 'ACTIVE', 9, ACCENT2, { weight:'700', spacing:'1', width:54 });

  // Date/call row
  const CALL_Y = Y+122;
  rect(0, CALL_Y, W, 40, SURF2);
  text(24, CALL_Y+12, '📍 Canyon Floor, Mojave · General call 6:30 AM', 11, TEXT2, { width:W-48 });

  // Weather/sun strip
  rect(16, CALL_Y+48, W-32, 44, SURFACE, { rx:10 });
  const wxItems = [
    { icon:'☀', label:'SUNRISE', val:'6:21 AM' },
    { icon:'☁', label:'WEATHER', val:'Partly cloudy' },
    { icon:'🌡', label:'HIGH', val:'84°F' },
    { icon:'🌬', label:'WIND', val:'8 mph W' },
  ];
  wxItems.forEach(function(wx, i) {
    const wx_x = 24 + i*(W-32)/4;
    text(wx_x, CALL_Y+55, wx.icon, 14, TEXT, { width:(W-32)/4-4, align:'center' });
    text(wx_x, CALL_Y+70, wx.val, 9, TEXT2, { width:(W-32)/4-4, align:'center', spacing:'0.3' });
  });

  // Timeline blocks
  const timelineY = CALL_Y+104;

  const blocks = [
    { time:'6:30', label:'CREW CALL',         detail:'All departments',           dur:30,  color: TEXT3  },
    { time:'7:00', label:'LIGHTING SETUP',    detail:'Sc.12 wide — DOP + gaffer', dur:60,  color: ACCENT3 },
    { time:'8:00', label:'SHOOT SC. 11',      detail:'Canyon Ridge · Done',       dur:90,  color: ACCENT  },
    { time:'9:30', label:'COMPANY MOVE',      detail:'Drive to Canyon Floor',     dur:30,  color: TEXT3  },
    { time:'10:00',label:'SHOOT SC. 12A-C',   detail:'Hero coverage · Now',       dur:120, color: ACCENT2 },
    { time:'12:00',label:'MEAL BREAK',        detail:'Catering on site',          dur:30,  color: TEXT3  },
    { time:'12:30',label:'SC. 12D-F + SC.13', detail:'Drone + remaining shots',   dur:180, color: ACCENT  },
  ];

  const TL_X = 24, DOT_X = 70, TEXT_X = 88;
  line(DOT_X, timelineY, DOT_X, timelineY + blocks.length*60 - 8, SURF4, 2);

  blocks.forEach(function(b, i) {
    const by = timelineY + i*60;
    const isNow = b.label.includes('Now') || b.time==='10:00';

    // Time
    text(TL_X, by+4, b.time, 11, isNow ? ACCENT : TEXT3, { weight: isNow?'700':'500', spacing:'0.5', font:"'SF Mono', 'Fira Code', monospace", width:44 });

    // Dot on timeline
    circle(DOT_X, by+12, isNow?7:5, isNow ? ACCENT2 : b.color==='#5A5450'?SURF4:b.color);
    if(isNow) circle(DOT_X, by+12, 11, 'transparent', { stroke:ACCENT2, strokeWidth:1.5, opacity:0.4 });

    // Label
    text(TEXT_X, by+2, b.label, 12, isNow ? TEXT : TEXT, { weight: isNow?'700':'500', width:W-TEXT_X-16 });
    text(TEXT_X, by+18, b.detail, 11, isNow ? ACCENT2 : TEXT2, { width:W-TEXT_X-16 });

    // Duration chip
    const dtext = b.dur >= 60 ? `${b.dur/60}h` : `${b.dur}m`;
    rect(W-50, by+4, 36, 18, isNow ? RED_DIM : SURF2, { rx:9 });
    text(W-50, by+6, dtext, 10, isNow ? ACCENT2 : TEXT3, { align:'center', width:36, weight:'600', font:"'SF Mono', 'Fira Code', monospace" });
  });

  navBar(s, 3);
}

// ────────────────────────────────────────────────────────────────────────────
// S5: WRAP REPORT — End of Day 3
// ────────────────────────────────────────────────────────────────────────────
{
  const s = 5, Y = screenTop(s);
  rect(0, Y, W, H, BG);
  statusBar(s);

  // ── Big clapperboard "WRAP" ──
  const WRAP_H = 120;
  rect(0, Y+44, W, WRAP_H, SURF2);

  // Clapper stripe pattern (bold)
  for(let i=0;i<20;i++) {
    if(i%2===0) {
      rect(i*22-20, Y+44, 22, 30, SURF3, { rx:0 });
    }
  }
  rect(0, Y+44, W, 3, ACCENT); // gold top edge
  rect(0, Y+74, W, 3, SURF3);  // divider

  text(0, Y+82, "IT'S A WRAP", 28, TEXT, { weight:'900', align:'center', width:W, spacing:'3', lineHeight:1 });
  text(0, Y+116, 'DAY 3 COMPLETE · 12:47 PM', 10, TEXT3, { weight:'600', align:'center', width:W, spacing:'2' });

  // ── Stats row ──
  const STAT_Y = Y+44+WRAP_H+16;
  rect(16, STAT_Y, W-32, 64, SURFACE, { rx:12 });

  const stats = [
    { val:'8/9',  label:'SHOTS\nDONE',   color: ACCENT },
    { val:'2',    label:'SCENES\nWRAPPED', color: ACCENT },
    { val:'0:38', label:'CAM\nROLLING',  color: TEXT2 },
    { val:'2',    label:'DAYS\nLEFT',    color: ACCENT3 },
  ];
  stats.forEach(function(st, i) {
    const sw = (W-32)/4;
    const sx = 16 + i*sw;
    if(i>0) line(sx, STAT_Y+10, sx, STAT_Y+54, SURF3, 1);
    text(sx, STAT_Y+10, st.val, 20, st.color, { weight:'800', align:'center', width:sw, font:"'SF Mono', 'Fira Code', monospace" });
    text(sx, STAT_Y+36, st.label, 8, TEXT3, { weight:'600', align:'center', width:sw, spacing:'1', lineHeight:1.3 });
  });

  // ── Scene summary ──
  const SUM_Y = STAT_Y+80;
  text(24, SUM_Y, 'SCENE REPORT', 10, TEXT3, { weight:'600', spacing:'2', width:250 });

  const wrapScenes = [
    { num:'11', title:'Canyon Ridge',  shots:'6/6', status:'PRINT', color: ACCENT  },
    { num:'12', title:'Canyon Floor',  shots:'8/9', status:'PRINT', color: ACCENT  },
    { num:'13', title:'Hero\'s Vehicle', shots:'0/5', status:'MOVED', color: TEXT3  },
  ];
  wrapScenes.forEach(function(ws, i) {
    const wy = SUM_Y+22+i*52;
    rect(16, wy, W-32, 44, SURFACE, { rx:10 });
    rect(16, wy, 44, 44, SURF2, { rx:10 });

    text(16, wy+6, 'SC.', 7, TEXT3, { weight:'700', align:'center', width:44, spacing:'2' });
    text(16, wy+18, ws.num, 18, TEXT, { weight:'800', align:'center', width:44, font:"'SF Mono', 'Fira Code', monospace" });

    text(68, wy+8, ws.title, 13, TEXT, { weight:'600', width:200 });
    text(68, wy+26, ws.shots + ' shots', 11, TEXT2, { width:150 });

    const sbw = ws.status==='MOVED' ? 52 : 52;
    rect(W-sbw-20, wy+12, sbw, 20, ws.color==='#5A5450' ? SURF3 : ACCENT_DIM, { rx:10 });
    text(W-sbw-20, wy+14, ws.status, 9, ws.color, { weight:'700', align:'center', width:sbw, spacing:'1' });
  });

  // ── Notes field ──
  const NX = 16, NY2 = SUM_Y+182;
  rect(NX, NY2, W-32, 90, SURFACE, { rx:12 });
  text(NX+12, NY2+10, 'NOTES FOR DAY 4', 9, ACCENT, { weight:'700', spacing:'2', width:200 });
  line(NX+12, NY2+26, W-32, NY2+26, SURF3, 1);
  text(NX+12, NY2+34, 'Sc.13 moved to Day 4 AM — golden hour light better.', 12, TEXT2, { width:W-64, lineHeight:1.5 });
  text(NX+12, NY2+52, 'Drone operator confirmed for aerial on Sc.14.', 12, TEXT2, { width:W-64, lineHeight:1.5 });
  text(NX+12, NY2+70, 'Check hero car fuel line — prop dept flagged issue.', 12, TEXT2, { width:W-64, lineHeight:1.5 });

  // ── CTA button ──
  const BTN_Y = NY2+102;
  rect(16, BTN_Y, W-32, 44, ACCENT, { rx:22 });
  text(16, BTN_Y+14, 'SEND WRAP REPORT  →', 13, BG, { weight:'700', align:'center', width:W-32, spacing:'1.5' });

  navBar(s, 0);
}

fs.writeFileSync('reel.pen', JSON.stringify(pen, null, 2));
console.log('✓ reel.pen written — REEL: Shot List & Film Production Planner');
console.log(`  ${pen.elements.length} elements across ${SCREENS} screens`);
