// lume-app.js — LUME: Ambient Focus Sessions App
// Theme: LIGHT (previous design 'ink' was dark)
// Inspired by:
//   lapa.ninja — Overlay beauty app: pure white canvas, scattered/rotated floating
//     images at organic +-8deg rotations, PP Editorial Old serif, editorial-meets-tech.
//   minimal.gallery — KO Collective: warm cream background, editorial fashion
//     photography, confident serif headlines, whisper-quiet nav.
//   lapa.ninja — Dawn (mental health): warm atmosphere signals safety & calm.
// Novelty: "scattered scene cards" pattern — cards float at unique rotations on cream
//   canvas, like physical photos pinned to a board. Light editorial aesthetic applied
//   to a productivity/focus app for the first time in this series.

const fs = require('fs');

const W = 390, H = 844, SCREENS = 5, GAP = 80;

const BG       = '#F8F4EE';
const SURFACE  = '#FFFFFF';
const SURF2    = '#F1EDE6';
const SURF3    = '#E8E2D9';
const TEXT     = '#1A1815';
const TEXT2    = '#7A736B';
const TEXT3    = '#B5ADA5';
const ACCENT   = '#5F8B6A';
const ACCENT2  = '#B87C4C';
const ACCENT_DIM = 'rgba(95,139,106,0.10)';
const ACCENT_MED = 'rgba(95,139,106,0.22)';
const AMBER_DIM  = 'rgba(184,124,76,0.12)';

const totalH = H * SCREENS + GAP * (SCREENS - 1);
const pen = {
  version: '2.8',
  metadata: {
    name: 'LUME',
    description: 'Ambient focus sessions — light editorial aesthetic',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    theme: 'light',
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
    opacity: opts.opacity||1, stroke: opts.stroke||null, strokeWidth: opts.strokeWidth||0 });
}

function line(x1, y1, x2, y2, stroke, w, opacity) {
  w = w || 1; opacity = opacity || 1;
  el('line', { x1, y1, x2, y2, stroke, strokeWidth: w, opacity });
}

function screenTop(s) { return s * (H + GAP); }

function statusBar(s) {
  const Y = screenTop(s);
  rect(0, Y, W, 44, BG);
  text(20, Y+14, '9:41', 15, TEXT, { weight:'600', spacing:'0.3' });
  text(W-80, Y+14, '●●●', 11, TEXT3, { weight:'400', align:'right', width:64 });
}

function navBar(s, active) {
  const Y = screenTop(s) + H - 80;
  rect(0, Y, W, 80, SURFACE);
  line(0, Y, W, Y, SURF3, 1, 0.8);

  const items = [
    { icon:'⊙', label:'Home' },
    { icon:'◫', label:'Scenes' },
    { icon:'◎', label:'Session' },
    { icon:'◻', label:'Stats' },
    { icon:'○', label:'Profile' },
  ];
  const step = W / items.length;
  items.forEach(function(item, i) {
    const cx = step * i + step / 2;
    const isActive = i === active;
    const col = isActive ? ACCENT : TEXT3;
    text(cx - step/2, Y+10, item.icon, 20, col, { align:'center', width:step, weight: isActive?'600':'400' });
    text(cx - step/2, Y+34, item.label, 9, isActive ? ACCENT : TEXT3, { align:'center', width:step, weight: isActive?'600':'400', spacing:'0.3' });
    if (isActive) {
      rect(cx-12, Y+56, 24, 2, ACCENT, { rx:1 });
    }
  });
}

// S0: HOME — Scattered floating scene cards
{
  const s = 0, Y = screenTop(s);
  rect(0, Y, W, H, BG);
  statusBar(s);

  text(24, Y+56, 'Good afternoon,', 13, TEXT2, { weight:'400', spacing:'0.1' });
  text(24, Y+76, 'James.', 28, TEXT, { weight:'700', font:"Georgia, 'Times New Roman', serif", spacing:'-0.5', width:260 });

  rect(W-104, Y+78, 84, 26, AMBER_DIM, { rx:13 });
  text(W-104, Y+84, '🔥 12 days', 12, ACCENT2, { weight:'600', align:'center', width:84 });

  text(24, Y+126, 'PICK YOUR SCENE', 10, TEXT3, { weight:'600', spacing:'2.5', width:200 });

  const scenes = [
    { name: 'Forest Rain',  sub: '25 min · Focus',  color:'#6B9E78', emoji:'🌲', rot: -6,  cx: 100, cy: Y+240 },
    { name: 'Golden Hour',  sub: '45 min · Deep',   color:'#C4916A', emoji:'☀', rot:  4,  cx: 256, cy: Y+226 },
    { name: 'Coffee Shop',  sub: '30 min · Flow',   color:'#8B7355', emoji:'☕', rot: -3,  cx: 186, cy: Y+330 },
    { name: 'Ocean Drift',  sub: '60 min · Rest',   color:'#6B9EB8', emoji:'🌊', rot:  7,  cx: 76,  cy: Y+388 },
    { name: 'Night Studio', sub: '25 min · Create', color:'#8A6B9E', emoji:'♫', rot: -5,  cx: 294, cy: Y+390 },
  ];

  const CW = 148, CH = 88;
  scenes.forEach(function(sc) {
    const cx = sc.cx, cy = sc.cy;
    const x = cx - CW/2, y = cy - CH/2;
    rect(x+4, y+6, CW, CH, 'rgba(26,24,21,0.07)', { rx:12, rotate: sc.rot, rotateCX: cx, rotateCY: cy });
    rect(x, y, CW, CH, SURFACE, { rx:12, rotate: sc.rot, rotateCX: cx, rotateCY: cy });
    rect(x, y, CW, 34, sc.color + '22', { rx:12, rotate: sc.rot, rotateCX: cx, rotateCY: cy });
    rect(x, y+18, CW, 16, sc.color + '22', { rotate: sc.rot, rotateCX: cx, rotateCY: cy });
    text(x+12, y+7, sc.emoji, 18, TEXT, { rotate: sc.rot, rotateCX: cx, rotateCY: cy });
    text(x+10, y+42, sc.name, 13, TEXT, { weight:'600', font:"Georgia, 'Times New Roman', serif", width:CW-20, rotate: sc.rot, rotateCX: cx, rotateCY: cy });
    text(x+10, y+60, sc.sub, 11, TEXT2, { width:CW-20, rotate: sc.rot, rotateCX: cx, rotateCY: cy });
  });

  // Active session ribbon
  rect(16, Y+480, W-32, 64, SURFACE, { rx:16 });
  rect(16, Y+480, W-32, 64, ACCENT_DIM, { rx:16 });
  rect(16, Y+490, 3, 44, ACCENT, { rx:2 });
  text(30, Y+490, 'NOW PLAYING', 9, ACCENT, { weight:'700', spacing:'1.5' });
  text(30, Y+506, 'Forest Rain · 14:32 remaining', 13, TEXT, { weight:'500', width:240 });
  rect(30, Y+530, W-76, 4, SURF3, { rx:2 });
  rect(30, Y+530, (W-76)*0.42, 4, ACCENT, { rx:2 });
  circle(W-36, Y+512, 18, ACCENT);
  text(W-44, Y+505, '⏸', 15, SURFACE, { weight:'700', width:16 });

  const stats = [
    { label:'Today', val:'1h 24m' },
    { label:'Streak', val:'12d' },
    { label:'Sessions', val:'47' },
  ];
  const sw = (W-32)/3;
  stats.forEach(function(st, i) {
    const sx = 16 + i*sw;
    text(sx, Y+562, st.val, 18, TEXT, { weight:'700', align:'center', width:sw, font:"Georgia, 'Times New Roman', serif" });
    text(sx, Y+585, st.label, 9, TEXT3, { weight:'600', align:'center', width:sw, spacing:'0.8' });
  });
  line(16+sw, Y+562, 16+sw, Y+600, SURF3, 1, 0.7);
  line(16+sw*2, Y+562, 16+sw*2, Y+600, SURF3, 1, 0.7);

  navBar(s, 0);
}

// S1: SCENES BROWSER
{
  const s = 1, Y = screenTop(s);
  rect(0, Y, W, H, BG);
  statusBar(s);

  text(24, Y+58, 'SCENES', 10, TEXT3, { weight:'600', spacing:'3', width:200 });
  text(24, Y+76, 'Choose your\natmosphere.', 26, TEXT, { weight:'700', font:"Georgia, 'Times New Roman', serif", spacing:'-0.4', width:260, lineHeight:1.25 });

  const filters = ['All', 'Focus', 'Deep Work', 'Rest', 'Create'];
  let fx = 24;
  filters.forEach(function(f, i) {
    const isActive = i===0;
    const pw = f.length * 8.5 + 20;
    rect(fx, Y+132, pw, 28, isActive ? ACCENT : SURFACE, { rx:14, stroke: isActive ? null : SURF3, strokeWidth: isActive ? 0 : 1 });
    text(fx, Y+138, f, 12, isActive ? SURFACE : TEXT2, { weight: isActive?'600':'400', align:'center', width:pw });
    fx += pw + 8;
  });

  const sceneGrid = [
    { name:'Forest Rain',  duration:'25 min', vibe:'Focus',  color:'#6B9E78', emoji:'🌲', badge:'Popular' },
    { name:'Golden Hour',  duration:'45 min', vibe:'Deep',   color:'#C4916A', emoji:'☀', badge:'New'     },
    { name:'Coffee Shop',  duration:'30 min', vibe:'Flow',   color:'#8B7355', emoji:'☕', badge:''        },
    { name:'Ocean Drift',  duration:'60 min', vibe:'Rest',   color:'#6B9EB8', emoji:'🌊', badge:''        },
    { name:'Night Studio', duration:'25 min', vibe:'Create', color:'#8A6B9E', emoji:'♫', badge:'Pro'     },
    { name:'White Noise',  duration:'Loop',   vibe:'Flow',   color:'#9E9E9E', emoji:'〜', badge:''        },
  ];

  const GW = (W-52)/2, GH = 120;
  sceneGrid.forEach(function(sc, i) {
    const col = i%2, row = Math.floor(i/2);
    const gx = 16 + col*(GW+20);
    const gy = Y + 178 + row*(GH+14);

    rect(gx, gy, GW, GH, SURFACE, { rx:14 });
    rect(gx, gy, GW, 50, sc.color+'30', { rx:14 });
    rect(gx, gy+34, GW, 16, sc.color+'30');
    text(gx+12, gy+10, sc.emoji, 24, TEXT, { width:36 });
    if(sc.badge) {
      const isPro = sc.badge === 'Pro';
      const bw = sc.badge.length*7+14;
      rect(gx+GW-bw-8, gy+10, bw, 20, isPro ? AMBER_DIM : ACCENT_DIM, { rx:10 });
      text(gx+GW-bw-8, gy+13, sc.badge, 10, isPro ? ACCENT2 : ACCENT, { weight:'600', align:'center', width:bw });
    }
    text(gx+12, gy+60, sc.name, 14, TEXT, { weight:'600', font:"Georgia, 'Times New Roman', serif", width:GW-24 });
    text(gx+12, gy+80, sc.duration + ' · ' + sc.vibe, 11, TEXT2, { width:GW-24 });
    circle(gx+GW-18, gy+GH-18, 13, ACCENT_DIM);
    text(gx+GW-25, gy+GH-25, '▷', 12, ACCENT, { weight:'700', width:14 });
  });

  navBar(s, 1);
}

// S2: ACTIVE SESSION
{
  const s = 2, Y = screenTop(s);
  rect(0, Y, W, H, BG);
  statusBar(s);

  const bw2 = 128;
  rect((W-bw2)/2, Y+54, bw2, 28, ACCENT_DIM, { rx:14 });
  text((W-bw2)/2, Y+60, '🌲 Forest Rain', 12, ACCENT, { weight:'600', align:'center', width:bw2 });

  text(0, Y+108, '14:32', 72, TEXT, { weight:'700', font:"Georgia, 'Times New Roman', serif", align:'center', width:W, spacing:'-2', lineHeight:1 });
  text(0, Y+190, 'remaining', 14, TEXT2, { align:'center', width:W, spacing:'1.5' });

  // Decorative ring (concentric circles)
  const cx = W/2, cy = Y+310;
  circle(cx, cy, 96, 'transparent', { stroke: SURF3, strokeWidth:8 });
  circle(cx, cy, 96, 'transparent', { stroke: ACCENT, strokeWidth:8, opacity:0.22 });
  circle(cx, cy, 76, SURF2);
  circle(cx, cy, 76, ACCENT_DIM);

  text(0, cy-18, '58%', 30, ACCENT, { weight:'700', font:"Georgia, 'Times New Roman', serif", align:'center', width:W });
  text(0, cy+16, 'complete', 12, TEXT2, { align:'center', width:W, spacing:'0.8' });

  text(0, cy+58, 'Deep Focus phase · 6 min until break', 12, TEXT2, { align:'center', width:W });

  // Controls
  const ctrlY = cy + 110;
  // Skip
  circle(cx-90, ctrlY, 24, SURF2);
  text(cx-90-10, ctrlY-9, '⟨⟨', 14, TEXT3, { align:'center', width:20, weight:'600' });
  text(cx-90-16, ctrlY+13, 'Skip', 9, TEXT3, { align:'center', width:32, spacing:'0.5' });
  // Pause (big)
  circle(cx, ctrlY, 32, ACCENT);
  text(cx-12, ctrlY-11, '⏸', 20, SURFACE, { weight:'700', width:24 });
  text(cx-16, ctrlY+20, 'Pause', 9, TEXT2, { align:'center', width:32, spacing:'0.5' });
  // End
  circle(cx+90, ctrlY, 24, SURF2);
  text(cx+90-8, ctrlY-9, '✕', 14, TEXT3, { align:'center', width:16, weight:'600' });
  text(cx+90-14, ctrlY+13, 'End', 9, TEXT3, { align:'center', width:28, spacing:'0.5' });

  // Info chips
  const chipData = ['25 min', 'Focus mode', 'Binaural'];
  const chipW = 90;
  const chipStartX = (W - chipData.length*chipW - (chipData.length-1)*8) / 2;
  chipData.forEach(function(c, i) {
    const chipX = chipStartX + i*(chipW+8);
    rect(chipX, ctrlY+50, chipW, 28, SURFACE, { rx:14 });
    text(chipX, ctrlY+57, c, 11, TEXT2, { align:'center', width:chipW });
  });

  navBar(s, 2);
}

// S3: WEEKLY STATS
{
  const s = 3, Y = screenTop(s);
  rect(0, Y, W, H, BG);
  statusBar(s);

  text(24, Y+58, 'THIS WEEK', 10, TEXT3, { weight:'600', spacing:'2.5', width:200 });
  text(24, Y+76, 'Focus\nJournal.', 30, TEXT, { weight:'700', font:"Georgia, 'Times New Roman', serif", spacing:'-0.5', width:240, lineHeight:1.2 });

  const topStats = [
    { val:'6h 42m', label:'Total Focus', col: ACCENT },
    { val:'12',     label:'Day Streak',  col: ACCENT2 },
    { val:'87%',    label:'Goal Hit',    col: TEXT },
  ];
  topStats.forEach(function(st, i) {
    const sw2 = (W-40)/3;
    const sx = 16 + i*(sw2+4);
    rect(sx, Y+148, sw2-4, 70, SURFACE, { rx:12 });
    text(sx, Y+162, st.val, 19, st.col, { weight:'700', align:'center', width:sw2-4, font:"Georgia, 'Times New Roman', serif" });
    text(sx, Y+186, st.label, 10, TEXT3, { weight:'500', align:'center', width:sw2-4, spacing:'0.3' });
  });

  // Bar chart
  const days  = ['M','T','W','T','F','S','S'];
  const hours = [1.2, 2.5, 1.8, 2.0, 3.1, 0.8, 0.5];
  const maxHrs = 3.5, barMaxH = 80, barW = 28;
  const chartX = 24, chartY = Y+240;
  const barSpacing = (W-48)/7;

  text(24, chartY-16, 'Daily hours', 11, TEXT2, { weight:'500' });

  days.forEach(function(d, i) {
    const bx = chartX + i*barSpacing + (barSpacing-barW)/2;
    const frac = hours[i]/maxHrs;
    const bh = Math.max(barMaxH * frac, 6);
    const isToday = i===4;
    rect(bx, chartY, barW, barMaxH, SURF2, { rx:6 });
    rect(bx, chartY + barMaxH - bh, barW, bh, isToday ? ACCENT : ACCENT+'88', { rx:6 });
    text(bx, chartY - 14, hours[i].toFixed(1), 9, isToday ? ACCENT : TEXT3, { align:'center', width:barW, weight: isToday?'700':'400' });
    text(bx, chartY + barMaxH + 6, d, 11, isToday ? TEXT : TEXT3, { align:'center', width:barW, weight: isToday?'700':'400' });
  });

  // Scene breakdown
  text(24, Y+388, 'TOP SCENES', 10, TEXT3, { weight:'600', spacing:'2.5', width:200 });

  const topScenes = [
    { name:'Forest Rain', pct:42, color:'#6B9E78' },
    { name:'Golden Hour', pct:28, color:'#C4916A' },
    { name:'Coffee Shop', pct:18, color:'#8B7355' },
    { name:'Other',       pct:12, color: TEXT3    },
  ];

  topScenes.forEach(function(sc, i) {
    const sy = Y+410 + i*46;
    circle(36, sy+12, 6, sc.color);
    text(50, sy+5, sc.name, 13, TEXT, { weight:'500', width:160 });
    text(50, sy+22, sc.pct+'% of sessions', 11, TEXT2, { width:160 });
    const barTW = W-116;
    rect(W-barTW-16, sy+10, barTW, 5, SURF2, { rx:3 });
    rect(W-barTW-16, sy+10, barTW*sc.pct/100, 5, sc.color, { rx:3 });
  });

  navBar(s, 3);
}

// S4: PROFILE
{
  const s = 4, Y = screenTop(s);
  rect(0, Y, W, H, BG);
  statusBar(s);

  circle(W/2, Y+104, 44, SURF2);
  text(W/2-22, Y+84, 'J', 36, TEXT, { weight:'700', font:"Georgia, 'Times New Roman', serif", align:'center', width:44 });
  text(0, Y+158, 'James Alcott', 18, TEXT, { weight:'700', align:'center', width:W, font:"Georgia, 'Times New Roman', serif" });
  text(0, Y+180, '12-day streak  ·  47 sessions', 12, TEXT2, { align:'center', width:W });

  // Premium banner
  rect(16, Y+210, W-32, 70, ACCENT, { rx:16 });
  text(28, Y+224, '✦ Unlock all 24 scenes', 15, SURFACE, { weight:'700', width:200 });
  text(28, Y+244, 'Forest archives, binaural labs &\ncustom durations.', 12, SURFACE, { width:200, lineHeight:1.35, opacity:0.8 });
  rect(W-100, Y+228, 76, 30, SURFACE, { rx:15 });
  text(W-100, Y+234, 'Try Free', 12, ACCENT, { weight:'700', align:'center', width:76 });

  const settings = [
    { icon:'◎', label:'Focus Reminders',   sub:'Daily at 9:00 AM',           on:true,  toggle:true  },
    { icon:'♫', label:'Ambient Sounds',    sub:'Auto-play on session start',  on:true,  toggle:true  },
    { icon:'◑', label:'Appearance',        sub:'Light theme',                 on:false, toggle:false },
    { icon:'☁', label:'iCloud Sync',       sub:'Last synced 2 min ago',       on:false, toggle:true  },
    { icon:'◻', label:'Haptic Feedback',   sub:'Tap on milestones',           on:true,  toggle:true  },
    { icon:'○', label:'Account & Privacy', sub:'',                            on:false, toggle:false },
  ];

  settings.forEach(function(s2, i) {
    const sy = Y+298 + i*54;
    if(i>0) line(56, sy, W-16, sy, SURF3, 1, 0.5);
    circle(32, sy+20, 14, s2.on ? ACCENT_DIM : SURF2);
    text(20, sy+13, s2.icon, 14, s2.on ? ACCENT : TEXT3, { align:'center', width:24 });
    text(56, sy+8, s2.label, 14, TEXT, { weight:'500', width:190 });
    if(s2.sub) text(56, sy+26, s2.sub, 11, TEXT3, { width:200 });
    if(s2.toggle) {
      const tx = W-56, ty = sy+16, tw=36, th=20;
      rect(tx, ty, tw, th, s2.on ? ACCENT : SURF3, { rx:10 });
      circle(s2.on ? tx+tw-10 : tx+10, ty+th/2, 8, SURFACE);
    } else {
      text(W-28, sy+13, '›', 20, TEXT3, { align:'center', width:16 });
    }
  });

  navBar(s, 4);
}

fs.writeFileSync('lume.pen', JSON.stringify(pen, null, 2));
console.log(`✓ lume.pen written — ${pen.elements.length} elements across ${SCREENS} screens`);
