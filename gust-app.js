#!/usr/bin/env node
/**
 * GUST — Home Air Quality & Climate Wellness
 * RAM Design Heartbeat
 *
 * Theme: LIGHT (Recto was dark — alternating)
 *
 * Inspiration:
 *   1. "Fluid Glass" by Exo Ape (SOTD on Awwwards) — glass morphism, translucent
 *      layered card surfaces with soft blur quality
 *   2. "Gluwz – Household Harmony" (Awwwards nominee) — home management UI with
 *      warm, organic palette and ambient data displays
 *   3. Minimal.gallery editorial typography — large typographic data reads
 *
 * Palette: warm bone (#F4F2EE bg), forest green (#2E7D52), amber (#E07B3C),
 *          deep charcoal text (#1C1A18), glass surface cards
 *
 * 6 screens: Dashboard · Rooms · Air Detail · Plants · Insights · Settings
 */

'use strict';
const fs = require('fs');
const path = require('path');

// ─── Pencil v2.8 helpers ──────────────────────────────────────────────────────
const W = 390, H = 844;

function pen(screens) {
  return JSON.stringify({
    version: '2.8',
    meta: {
      name: 'Gust — Home Air & Climate Wellness',
      description: 'Light-theme home air quality monitor. Warm bone/cream backgrounds, forest green accents, amber alerts. Glass morphism card surfaces inspired by Fluid Glass (Awwwards SOTD by Exo Ape) and Gluwz Household Harmony (Awwwards nominee). Biophilic palette: clean white surfaces with earthy accents, large typographic air quality scores, room-by-room climate breakdown. 6 screens: Dashboard, Rooms, Air Detail, Plants, Insights, Settings.',
      theme: 'light',
      width: W,
      height: H,
    },
    screens,
  }, null, 2);
}

// colours
const C = {
  bg:       '#F4F2EE',
  surface:  '#FFFFFF',
  surfaceT: 'rgba(255,255,255,0.72)',  // glass card
  text:     '#1C1A18',
  text2:    '#5A5650',
  text3:    '#9A9490',
  green:    '#2E7D52',
  greenL:   '#E8F5EE',
  greenM:   'rgba(46,125,82,0.14)',
  amber:    '#E07B3C',
  amberL:   '#FDF0E8',
  amberM:   'rgba(224,123,60,0.14)',
  red:      '#D94F3D',
  redL:     '#FDECEB',
  blue:     '#3B82C4',
  blueL:    '#EBF4FC',
  divider:  'rgba(28,26,24,0.08)',
  shadow:   'rgba(28,26,24,0.06)',
};

// shape primitives
function R(x,y,w,h,fill,opts={}) {
  return { type:'rect', x, y, w, h, fill, rx: opts.r??0, ry: opts.r??0,
           stroke: opts.stroke??null, strokeWidth: opts.sw??0,
           opacity: opts.opacity??1, shadow: opts.shadow??null };
}
function Ci(cx,cy,r,fill,opts={}) {
  return { type:'circle', cx, cy, r, fill, stroke: opts.stroke??null, strokeWidth: opts.sw??0, opacity: opts.opacity??1 };
}
function T(x,y,text,size,weight,fill,opts={}) {
  return { type:'text', x, y, text: String(text), fontSize: size, fontWeight: weight,
           fill, align: opts.align??'left', w: opts.w??300, opacity: opts.opacity??1,
           letterSpacing: opts.ls??0 };
}
function L(x1,y1,x2,y2,stroke,sw=1,opts={}) {
  return { type:'line', x1, y1, x2, y2, stroke, strokeWidth: sw, opacity: opts.opacity??1 };
}
function P(points,fill,opts={}) {
  return { type:'polygon', points, fill, stroke: opts.stroke??null, strokeWidth: opts.sw??0,
           opacity: opts.opacity??1 };
}
function Arc(cx,cy,r,startDeg,endDeg,stroke,sw,opts={}) {
  const toR = d => (d-90)*Math.PI/180;
  const s = toR(startDeg), e = toR(endDeg);
  const la = (endDeg - startDeg) > 180 ? 1 : 0;
  const x1 = cx + r*Math.cos(s), y1 = cy + r*Math.sin(s);
  const x2 = cx + r*Math.cos(e), y2 = cy + r*Math.sin(e);
  return { type:'path',
           d: `M ${x1} ${y1} A ${r} ${r} 0 ${la} 1 ${x2} ${y2}`,
           fill:'none', stroke, strokeWidth:sw, strokeLinecap:'round', opacity: opts.opacity??1 };
}

// ── shared nav bar ────────────────────────────────────────────────────────────
function navBar(active) {
  const items = [
    {id:0, label:'Home',    icon:'⌂'},
    {id:1, label:'Rooms',   icon:'▦'},
    {id:2, label:'Air',     icon:'◎'},
    {id:3, label:'Plants',  icon:'✿'},
    {id:4, label:'Insights',icon:'◈'},
  ];
  const out = [];
  out.push(R(0, H-72, W, 72, C.surface, {shadow: {color:C.shadow, blur:12, x:0, y:-2}}));
  out.push(L(0, H-72, W, H-72, C.divider, 0.5));
  const step = W / items.length;
  items.forEach(it => {
    const cx = step*it.id + step/2;
    const isA = it.id === active;
    if (isA) out.push(R(cx-28, H-68, 56, 36, C.greenM, {r:18}));
    out.push(T(cx, H-52, it.icon, isA?18:16, isA?'700':'400', isA?C.green:C.text3, {align:'center', w:56}));
    out.push(T(cx, H-30, it.label, 9, isA?'600':'400', isA?C.green:C.text3, {align:'center', w:56}));
  });
  return out;
}

// ── status bar ────────────────────────────────────────────────────────────────
function statusBar() {
  return [
    R(0, 0, W, 44, C.bg),
    T(20, 14, '9:41', 13, '600', C.text),
    T(W-20, 14, '● ● ●', 11, '400', C.text2, {align:'right', w:60}),
  ];
}

// ── Screen 1: Dashboard ───────────────────────────────────────────────────────
function screenDashboard() {
  const els = [...statusBar()];

  // header
  els.push(T(22, 56, 'Good morning, Alex', 13, '400', C.text2));
  els.push(T(22, 76, 'Your Home', 26, '700', C.text, {ls:-0.5}));
  els.push(R(W-54, 52, 34, 34, C.greenM, {r:17}));
  els.push(T(W-37, 63, '🔔', 15, '400', C.green, {align:'center', w:34}));

  // hero AQI card — glass morphism
  els.push(R(16, 116, W-32, 160, C.surfaceT, {r:24, shadow:{color:'rgba(46,125,82,0.1)',blur:24,x:0,y:8}}));
  els.push(R(16, 116, W-32, 160, C.green, {r:24, opacity:0.04}));
  // large AQI number
  els.push(T(W/2, 152, '42', 72, '800', C.green, {align:'center', w:W-32, ls:-2}));
  els.push(T(W/2, 226, 'AQI · Good', 13, '600', C.green, {align:'center', w:W-32, ls:1}));
  // gradient arc background
  els.push(Arc(W/2, 196, 58, -60, 240, C.greenL, 10, {opacity:0.6}));
  els.push(Arc(W/2, 196, 58, -60, 130, C.green, 10, {opacity:0.9}));

  // quick stats row
  const stats = [
    {icon:'🌡', label:'Temp', val:'21°C'},
    {icon:'💧', label:'Humidity', val:'48%'},
    {icon:'💨', label:'CO₂', val:'612 ppm'},
    {icon:'✦', label:'PM2.5', val:'8 µg'},
  ];
  stats.forEach((s,i) => {
    const x = 16 + i*(W-32)/4;
    const cw = (W-32)/4 - 4;
    els.push(R(x+2, 294, cw, 70, C.surface, {r:16, shadow:{color:C.shadow,blur:8,x:0,y:2}}));
    els.push(T(x + cw/2 + 2, 312, s.icon, 18, '400', C.text, {align:'center', w:cw}));
    els.push(T(x + cw/2 + 2, 334, s.val, 12, '700', C.text, {align:'center', w:cw}));
    els.push(T(x + cw/2 + 2, 350, s.label, 9, '400', C.text3, {align:'center', w:cw}));
  });

  // rooms strip
  els.push(T(22, 386, 'Rooms', 15, '700', C.text));
  els.push(T(W-20, 386, 'See all →', 12, '500', C.green, {align:'right', w:80}));

  const rooms = [
    {name:'Living',  aq:'Good', score:42, icon:'🛋', c:C.green,  bg:C.greenL},
    {name:'Bedroom', aq:'Fair', score:68, icon:'🛏', c:C.amber,  bg:C.amberL},
    {name:'Kitchen', aq:'Good', score:38, icon:'🍳', c:C.green,  bg:C.greenL},
  ];
  rooms.forEach((r,i) => {
    const x = 16 + i*124;
    els.push(R(x, 406, 116, 102, C.surface, {r:20, shadow:{color:C.shadow,blur:8,x:0,y:2}}));
    els.push(R(x+10, 416, 36, 36, r.bg, {r:12}));
    els.push(T(x+28, 433, r.icon, 17, '400', r.c, {align:'center', w:36}));
    els.push(T(x+12, 464, r.name, 12, '700', C.text));
    els.push(T(x+12, 480, r.aq, 10, '500', r.c));
    els.push(T(x+94, 480, String(r.score), 12, '700', r.c, {align:'right', w:28}));
    // mini progress
    els.push(R(x+12, 494, 92, 4, 'rgba(28,26,24,0.07)', {r:2}));
    els.push(R(x+12, 494, Math.round(92*r.score/100), 4, r.c, {r:2}));
  });

  // recent alert
  els.push(R(16, 524, W-32, 54, C.amberL, {r:16}));
  els.push(T(22, 540, '⚠', 16, '400', C.amber));
  els.push(T(46, 538, 'Bedroom CO₂ rising', 13, '600', C.text));
  els.push(T(46, 554, 'Open window to improve air quality', 11, '400', C.text2));
  els.push(T(W-22, 548, '→', 16, '600', C.amber, {align:'right', w:20}));

  // outdoor vs indoor banner
  els.push(R(16, 594, W-32, 48, C.blueL, {r:16}));
  els.push(T(22, 611, '🌤', 16, '400', C.blue));
  els.push(T(46, 609, 'Outdoor AQI: 55 · Moderate', 12, '600', C.blue));
  els.push(T(46, 625, 'Indoor air is better today — keep windows closed', 10, '400', C.text2));

  els.push(...navBar(0));
  return { id:'dashboard', name:'Dashboard', elements: els };
}

// ── Screen 2: Rooms ───────────────────────────────────────────────────────────
function screenRooms() {
  const els = [...statusBar()];
  els.push(T(22, 56, 'All Rooms', 26, '700', C.text, {ls:-0.5}));
  els.push(T(22, 86, '5 rooms · Home is healthy overall', 13, '400', C.text2));

  const rooms = [
    {name:'Living Room',  temp:'21°', hum:'46%', co2:'580',  aq:'Good',     score:42,  icon:'🛋', c:C.green, bg:C.greenL},
    {name:'Bedroom',      temp:'20°', hum:'52%', co2:'724',  aq:'Fair',     score:68,  icon:'🛏', c:C.amber, bg:C.amberL},
    {name:'Kitchen',      temp:'23°', hum:'44%', co2:'540',  aq:'Good',     score:38,  icon:'🍳', c:C.green, bg:C.greenL},
    {name:'Bathroom',     temp:'24°', hum:'68%', co2:'420',  aq:'Good',     score:29,  icon:'🚿', c:C.green, bg:C.greenL},
    {name:'Home Office',  temp:'21°', hum:'41%', co2:'890',  aq:'Moderate', score:82,  icon:'💻', c:C.red,   bg:C.redL},
  ];

  rooms.forEach((r,i) => {
    const y = 112 + i * 116;
    els.push(R(16, y, W-32, 106, C.surface, {r:20, shadow:{color:C.shadow,blur:8,x:0,y:2}}));

    // icon
    els.push(R(22, y+12, 48, 48, r.bg, {r:16}));
    els.push(T(46, y+34, r.icon, 22, '400', r.c, {align:'center', w:48}));

    // name + status
    els.push(T(82, y+18, r.name, 15, '700', C.text));
    els.push(T(82, y+38, r.aq, 11, '600', r.c));
    // AQI badge
    els.push(R(W-44, y+14, 34, 22, r.bg, {r:11}));
    els.push(T(W-27, y+23, String(r.score), 11, '700', r.c, {align:'center', w:34}));

    // mini metrics
    const mx = [
      {icon:'🌡',val:r.temp},{icon:'💧',val:r.hum},{icon:'💨',val:'CO₂ '+r.co2},
    ];
    mx.forEach((m,mi) => {
      const mx_ = 82 + mi*90;
      els.push(T(mx_, y+60, m.icon+' '+m.val, 11, '500', C.text2));
    });

    // progress bar
    els.push(R(22, y+86, W-54, 6, 'rgba(28,26,24,0.07)', {r:3}));
    els.push(R(22, y+86, Math.round((W-54)*r.score/100), 6, r.c, {r:3}));
  });

  els.push(...navBar(1));
  return { id:'rooms', name:'Rooms', elements: els };
}

// ── Screen 3: Air Detail ──────────────────────────────────────────────────────
function screenAirDetail() {
  const els = [...statusBar()];
  els.push(T(22, 56, 'Air Quality', 26, '700', C.text, {ls:-0.5}));

  // AQI gauge hero
  els.push(R(16, 98, W-32, 180, C.surface, {r:24, shadow:{color:C.shadow,blur:12,x:0,y:4}}));
  els.push(Arc(W/2, 212, 70, -60, 240, 'rgba(28,26,24,0.07)', 10));
  // color segments
  const segs = [{c:C.green,s:-60,e:30},{c:'#B6D96A',s:30,e:90},{c:C.amber,s:90,e:150},{c:C.red,s:150,e:240}];
  segs.forEach(sg => els.push(Arc(W/2, 212, 70, sg.s, sg.e, sg.c, 10, {opacity:0.4})));
  els.push(Arc(W/2, 212, 70, -60, 20, C.green, 10));
  // needle
  const needleAngle = (-60 + 80)*Math.PI/180 - Math.PI/2;
  els.push(L(W/2, 212, W/2 + 60*Math.cos(needleAngle), 212 + 60*Math.sin(needleAngle), C.green, 3));
  els.push(Ci(W/2, 212, 6, C.green));
  els.push(T(W/2, 250, '42', 32, '800', C.green, {align:'center', w:80}));
  els.push(T(W/2, 270, 'GOOD', 10, '700', C.green, {align:'center', w:80, ls:2}));
  // scale labels
  els.push(T(42, 268, 'Good', 9, '500', C.green, {align:'center', w:40}));
  els.push(T(W-42, 268, 'Hazard', 9, '500', C.red, {align:'right', w:50}));

  // pollutant breakdown
  els.push(T(22, 300, 'Pollutants', 15, '700', C.text));

  const pollutants = [
    {name:'PM2.5',   val:'8 µg/m³',   max:25,  curr:8,  status:'Good',    c:C.green},
    {name:'PM10',    val:'14 µg/m³',  max:50,  curr:14, status:'Good',    c:C.green},
    {name:'CO₂',     val:'612 ppm',   max:1000,curr:61, status:'Fair',    c:C.amber},
    {name:'VOC',     val:'0.3 mg/m³', max:1.0, curr:30, status:'Good',    c:C.green},
    {name:'NO₂',     val:'12 µg/m³',  max:40,  curr:12, status:'Good',    c:C.green},
  ];
  pollutants.forEach((p,i) => {
    const y = 326 + i*72;
    els.push(R(16, y, W-32, 62, C.surface, {r:16, shadow:{color:C.shadow,blur:6,x:0,y:2}}));
    els.push(T(28, y+14, p.name, 13, '700', C.text));
    els.push(T(28, y+32, p.val, 11, '400', C.text2));
    // status pill
    els.push(R(W-76, y+12, 60, 20, p.c === C.green ? C.greenL : C.amberL, {r:10}));
    els.push(T(W-46, y+20, p.status, 10, '600', p.c, {align:'center', w:60}));
    // bar
    els.push(R(28, y+46, W-72, 6, 'rgba(28,26,24,0.07)', {r:3}));
    els.push(R(28, y+46, Math.round((W-72)*p.curr/100), 6, p.c, {r:3}));
  });

  els.push(...navBar(2));
  return { id:'air-detail', name:'Air Detail', elements: els };
}

// ── Screen 4: Plants ──────────────────────────────────────────────────────────
function screenPlants() {
  const els = [...statusBar()];
  els.push(T(22, 56, 'Plant Care', 26, '700', C.text, {ls:-0.5}));
  els.push(T(22, 86, 'Your plants help clean the air', 13, '400', C.text2));

  // air purification score
  els.push(R(16, 108, W-32, 80, C.greenL, {r:22}));
  els.push(T(26, 128, '✿', 26, '400', C.green));
  els.push(T(60, 124, 'Plants absorbing ~12% of indoor VOCs', 12, '600', C.green));
  els.push(T(60, 140, 'Add 2 more plants for optimal filtration', 11, '400', C.text2));
  els.push(R(16, 174, Math.round((W-32)*0.6), 8, C.green, {r:4, opacity:0.25}));
  els.push(R(16, 174, Math.round((W-32)*0.6*0.7), 8, C.green, {r:4}));

  // plant cards
  els.push(T(22, 204, 'Your Plants', 15, '700', C.text));
  els.push(T(W-20, 204, '+ Add', 12, '600', C.green, {align:'right', w:50}));

  const plants = [
    {name:'Peace Lily',   sci:'Spathiphyllum', water:'2 days',   light:'Low',    health:92, icon:'🌿', need:'Water today', needC:C.blue,  needBg:C.blueL},
    {name:'Snake Plant',  sci:'Sansevieria',   water:'10 days',  light:'Any',    health:100,icon:'🌵', need:'Thriving',    needC:C.green, needBg:C.greenL},
    {name:'Pothos',       sci:'Epipremnum',    water:'4 days',   light:'Medium', health:78, icon:'🍃', need:'Needs light',  needC:C.amber, needBg:C.amberL},
    {name:'Spider Plant', sci:'Chlorophytum',  water:'6 days',   light:'Bright', health:88, icon:'🌱', need:'Good',        needC:C.green, needBg:C.greenL},
  ];
  plants.forEach((p,i) => {
    const y = 226 + i*138;
    els.push(R(16, y, W-32, 126, C.surface, {r:20, shadow:{color:C.shadow,blur:8,x:0,y:2}}));

    // icon blob
    els.push(R(22, y+12, 54, 54, C.greenL, {r:18}));
    els.push(T(49, y+37, p.icon, 26, '400', C.green, {align:'center', w:54}));

    // info
    els.push(T(88, y+16, p.name, 14, '700', C.text));
    els.push(T(88, y+34, p.sci, 10, '400', C.text3, {ls:0.2}));

    // health ring
    els.push(Ci(W-38, y+30, 20, 'rgba(28,26,24,0.05)'));
    els.push(Arc(W-38, y+30, 18, -90, -90+p.health*3.6, C.green, 4));
    els.push(T(W-38, y+34, String(p.health), 9, '700', C.green, {align:'center', w:40}));

    // need badge
    els.push(R(88, y+54, 120, 22, p.needBg, {r:11}));
    els.push(T(148, y+63, p.need, 10, '600', p.needC, {align:'center', w:120}));

    // details
    els.push(T(88, y+86, '💧 '+p.water+'  ·  ☀ '+p.light, 11, '400', C.text2));

    // watering bar
    els.push(R(22, y+108, W-54, 6, 'rgba(28,26,24,0.07)', {r:3}));
    const fillW = Math.round((W-54)*(p.health/100));
    els.push(R(22, y+108, fillW, 6, p.health > 80 ? C.green : C.amber, {r:3}));
  });

  els.push(...navBar(3));
  return { id:'plants', name:'Plants', elements: els };
}

// ── Screen 5: Insights ────────────────────────────────────────────────────────
function screenInsights() {
  const els = [...statusBar()];
  els.push(T(22, 56, 'Weekly Insights', 24, '700', C.text, {ls:-0.4}));
  els.push(T(22, 85, 'Mar 30 – Apr 5, 2026', 12, '400', C.text3));

  // summary score card
  els.push(R(16, 106, W-32, 90, C.greenL, {r:22}));
  els.push(T(32, 122, '◈', 22, '400', C.green));
  els.push(T(62, 120, 'Air Health Score', 13, '700', C.green));
  els.push(T(62, 138, 'Your home air was Good 6 of 7 days', 11, '400', C.text2));
  els.push(T(W-32, 122, '84', 28, '800', C.green, {align:'right', w:60}));
  els.push(T(W-32, 152, '↑ 6pts', 11, '600', C.green, {align:'right', w:60}));
  els.push(R(22, 182, W-54, 6, C.greenL, {r:3}));
  els.push(R(22, 182, Math.round((W-54)*0.84), 6, C.green, {r:3}));

  // 7-day AQI trend bars
  els.push(T(22, 210, 'Daily AQI', 14, '700', C.text));

  const days   = ['M','T','W','T','F','S','S'];
  const aqiVals= [44, 38, 52, 67, 41, 36, 42];
  const maxAqi = Math.max(...aqiVals);
  const barW = 30, barGap = 12;
  const totalW = days.length*(barW+barGap) - barGap;
  const startX = (W-totalW)/2;
  const chartH = 90, chartY = 232;

  // grid line
  els.push(L(startX, chartY, startX+totalW, chartY, C.divider, 0.5));
  els.push(L(startX, chartY+chartH, startX+totalW, chartY+chartH, C.divider, 0.5));

  days.forEach((d,i) => {
    const bx = startX + i*(barW+barGap);
    const bh = Math.round(chartH * aqiVals[i]/100);
    const isToday = i===6;
    const col = aqiVals[i] > 60 ? C.amber : C.green;
    els.push(R(bx, chartY+(chartH-bh), barW, bh, isToday ? col : col+'44', {r:8}));
    if (isToday) els.push(R(bx, chartY+(chartH-bh), barW, bh, col, {r:8}));
    els.push(T(bx+barW/2, chartY+chartH+12, d, 10, isToday?'700':'400', isToday?C.text:C.text3, {align:'center', w:barW}));
    if (isToday) {
      els.push(R(bx-2, chartY+(chartH-bh)-18, barW+4, 16, C.text, {r:5}));
      els.push(T(bx+barW/2, chartY+(chartH-bh)-7, String(aqiVals[i]), 9, '700', C.surface, {align:'center', w:barW+4}));
    }
  });

  // recommendations
  els.push(T(22, 356, 'Recommendations', 15, '700', C.text));

  const recs = [
    {icon:'🪟', title:'Ventilate Bedroom',       body:'CO₂ peaks nightly. Open window before sleep.',    c:C.amber, bg:C.amberL},
    {icon:'🌿', title:'Add 1–2 plants',           body:'Boost VOC absorption in the home office.',         c:C.green, bg:C.greenL},
    {icon:'🔄', title:'Replace HVAC filter',      body:'Filter due in 12 days for optimal air quality.',   c:C.blue,  bg:C.blueL},
  ];
  recs.forEach((r,i) => {
    const y = 380 + i*86;
    els.push(R(16, y, W-32, 76, C.surface, {r:18, shadow:{color:C.shadow,blur:6,x:0,y:2}}));
    els.push(R(22, y+12, 38, 38, r.bg, {r:12}));
    els.push(T(41, y+29, r.icon, 18, '400', r.c, {align:'center', w:38}));
    els.push(T(72, y+16, r.title, 13, '700', C.text));
    els.push(T(72, y+34, r.body, 10, '400', C.text2, {w:W-100}));
    els.push(T(W-22, y+30, '→', 14, '600', r.c, {align:'right', w:20}));
  });

  els.push(...navBar(4));
  return { id:'insights', name:'Insights', elements: els };
}

// ── Screen 6: Settings ────────────────────────────────────────────────────────
function screenSettings() {
  const els = [...statusBar()];

  // profile header
  els.push(R(0, 44, W, 156, C.surface));
  els.push(Ci(W/2, 100, 38, C.greenM));
  els.push(T(W/2, 106, '🏡', 30, '400', C.green, {align:'center', w:80}));
  els.push(T(W/2, 148, "Alex's Home", 18, '700', C.text, {align:'center', w:220}));
  els.push(T(W/2, 168, 'San Francisco · 4 sensors · 4 plants', 11, '400', C.text3, {align:'center', w:280}));

  // sections
  const sections = [
    {title:'Devices', items:[
      {icon:'📡', label:'Sensors',         val:'4 connected'},
      {icon:'🌡', label:'Thermostats',     val:'2 linked'},
    ]},
    {title:'Notifications', items:[
      {icon:'🔔', label:'Air Quality Alerts',  val:'On'},
      {icon:'💧', label:'Plant Care Reminders',val:'On'},
      {icon:'📊', label:'Weekly Report',       val:'Sunday 9am'},
    ]},
    {title:'Home', items:[
      {icon:'📍', label:'Location',   val:'SF Bay Area'},
      {icon:'🏠', label:'Home Type',  val:'Apartment'},
    ]},
  ];

  let y = 216;
  sections.forEach(sec => {
    els.push(T(22, y, sec.title, 12, '700', C.text3, {ls:0.5}));
    y += 22;
    sec.items.forEach((it,ii) => {
      const isLast = ii === sec.items.length-1;
      els.push(R(16, y, W-32, 52, C.surface, {r: ii===0 && isLast ? 16 : ii===0 ? 0 : isLast ? 0 : 0,
                 shadow: ii===0 ? {color:C.shadow,blur:4,x:0,y:1} : null}));
      // round top/bottom corners manually with two rects
      if (ii===0) els.push(R(16, y, W-32, 4, C.surface));
      if (isLast) els.push(R(16, y+48, W-32, 4, C.surface));
      els.push(R(28, y+14, 26, 26, C.greenM, {r:8}));
      els.push(T(41, y+25, it.icon, 13, '400', C.green, {align:'center', w:26}));
      els.push(T(66, y+24, it.label, 13, '500', C.text));
      els.push(T(W-24, y+24, it.val, 11, '400', C.text3, {align:'right', w:120}));
      if (!isLast) els.push(L(62, y+52, W-16, y+52, C.divider, 0.5));
      y += 52;
    });
    y += 18;
  });

  // version
  els.push(T(W/2, y+10, 'Gust v1.2.0 · Made with ♥', 11, '400', C.text3, {align:'center', w:280}));

  els.push(...navBar(2));  // dummy active for settings
  return { id:'settings', name:'Settings', elements: els };
}

// ─── Build & write ────────────────────────────────────────────────────────────
const screens = [
  screenDashboard(),
  screenRooms(),
  screenAirDetail(),
  screenPlants(),
  screenInsights(),
  screenSettings(),
];

const output = pen(screens);
const outPath = path.join(__dirname, 'gust.pen');
fs.writeFileSync(outPath, output);

const parsed = JSON.parse(output);
let totalEls = 0;
parsed.screens.forEach(s => { totalEls += s.elements.length; });
console.log(`✓ gust.pen written`);
console.log(`  ${parsed.screens.length} screens  ·  ${totalEls} elements total`);
console.log(`  Theme: LIGHT  ·  Palette: bone/cream + forest green + amber`);
console.log(`  Inspired by: Fluid Glass (Awwwards) + Gluwz Household Harmony`);
