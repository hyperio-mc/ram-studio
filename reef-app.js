'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG = 'reef';
const W = 390, H = 844;

// ─── palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:      '#060A10',
  surf:    '#0B1018',
  card:    '#111823',
  card2:   '#0E1520',
  glass:   'rgba(11,22,40,0.72)',
  border:  'rgba(0,207,255,0.12)',
  border2: 'rgba(255,255,255,0.06)',
  acc:     '#00CFFF',   // bioluminescent cyan
  acc2:    '#05F080',   // bioluminescent green
  warn:    '#F5A623',
  danger:  '#FF4B6E',
  txt:     '#E2EEF8',
  txt2:    '#7A9BB5',
  txt3:    '#4A6A82',
  muted:   'rgba(122,155,181,0.4)',
};

// ─── primitives ───────────────────────────────────────────────────────────────
function rect(x,y,w,h,fill,o={}) {
  return { type:'rect', x, y, width:w, height:h, fill,
    rx: o.rx||0, opacity: o.op||1, stroke: o.stroke||'none',
    strokeWidth: o.sw||0 };
}
function text(x,y,content,size,fill,o={}) {
  return { type:'text', x, y, content, fontSize:size, fill,
    fontWeight: o.fw||400, fontFamily: o.font||'Inter, sans-serif',
    textAnchor: o.anchor||'start', letterSpacing: o.ls||0, opacity: o.op||1 };
}
function circle(cx,cy,r,fill,o={}) {
  return { type:'circle', cx, cy, r, fill, opacity: o.op||1,
    stroke: o.stroke||'none', strokeWidth: o.sw||0 };
}
function line(x1,y1,x2,y2,stroke,o={}) {
  return { type:'line', x1, y1, x2, y2, stroke, strokeWidth: o.sw||1, opacity: o.op||1 };
}
function polyline(points,stroke,o={}) {
  return { type:'polyline', points, stroke, strokeWidth: o.sw||1.5,
    fill:'none', opacity: o.op||1 };
}

// ─── helpers ──────────────────────────────────────────────────────────────────
function pill(x,y,w,h,fill,o={}) {
  return [rect(x,y,w,h,fill,{...o, rx:h/2})];
}
function card(x,y,w,h,o={}) {
  const r = o.rx||14;
  return [
    rect(x,y,w,h, C.card,  {rx:r, op:0.97}),
    rect(x,y,w,h, 'none',  {rx:r, stroke:o.border||C.border2, sw:1}),
  ];
}
function glassCard(x,y,w,h,o={}) {
  return [
    rect(x,y,w,h, C.glass, {rx:o.rx||14, op:0.9}),
    rect(x,y,w,h, 'none',  {rx:o.rx||14, stroke:C.border, sw:1}),
  ];
}
// ambient glow blob
function glow(cx,cy,r,color,op=0.18) {
  return { type:'ellipse', cx, cy, rx:r, ry:r*0.6, fill:color, opacity:op,
    filter:'blur(40px)' };
}
// sparkline from array of 0-1 values
function spark(x,y,w,h,vals,color,o={}) {
  const pts = vals.map((v,i)=>{
    const px = x + (i/(vals.length-1))*w;
    const py = y + h - v*h;
    return `${px.toFixed(1)},${py.toFixed(1)}`;
  }).join(' ');
  return polyline(pts, color, {sw: o.sw||2, op: o.op||1});
}
// stat badge
function statBadge(x,y,val,label,color) {
  return [
    text(x,y,val,22,color,{fw:700}),
    text(x,y+18,label,11,C.txt2),
  ];
}
// section header bar
function sectionHeader(y,title) {
  return [
    text(20,y,title,11,C.txt3,{fw:600,ls:1.5}),
    line(20,y+10, W-20,y+10, C.border2,{sw:1}),
  ];
}
// progress bar
function progressBar(x,y,w,pct,color) {
  return [
    rect(x,y,w,5, C.card2, {rx:3}),
    rect(x,y,Math.round(w*pct),5, color, {rx:3}),
  ];
}
// icon dot
function iconDot(cx,cy,color) {
  return [circle(cx,cy,8,color,{op:0.15}), circle(cx,cy,4,color)];
}
// tab row
function tabRow(y,tabs,activeIdx) {
  const tw = (W-40)/tabs.length;
  const els = [];
  tabs.forEach((t,i)=>{
    const tx = 20 + i*tw;
    const isA = i===activeIdx;
    if(isA) {
      els.push(...glassCard(tx,y,tw-4,32,{rx:10}));
      els.push(text(tx+tw/2-5,y+20,t,12,C.acc,{fw:600,anchor:'middle'}));
    } else {
      els.push(text(tx+tw/2-5,y+20,t,12,C.txt2,{anchor:'middle'}));
    }
  });
  return els;
}

// ─── nav bar (shared) ──────────────────────────────────────────────────────────
const NAV_ICONS = ['⌂','◉','⚠','📊','◈'];
const NAV_LABELS = ['Home','Monitor','Alerts','Reports','Map'];
function navbar(activeIdx) {
  const els = [
    rect(0,788,W,56, C.surf, {op:0.97}),
    line(0,788,W,788, C.border2, {sw:1}),
  ];
  const iw = W/5;
  NAV_ICONS.forEach((ic,i)=>{
    const cx = iw*i + iw/2;
    const isA = i===activeIdx;
    if(isA) els.push(circle(cx,808,20, C.acc, {op:0.12}));
    els.push(text(cx,812,ic,16,isA?C.acc:C.txt3,{anchor:'middle'}));
    els.push(text(cx,828,NAV_LABELS[i],9,isA?C.acc:C.txt3,{anchor:'middle',fw:isA?600:400}));
  });
  return els;
}

// ─── status bar ──────────────────────────────────────────────────────────────
function statusBar() {
  return [
    text(20,22,'9:41',13,C.txt,{fw:600}),
    text(W-20,22,'●●●',12,C.txt2,{anchor:'end'}),
  ];
}

// ─── S1: DASHBOARD ────────────────────────────────────────────────────────────
function s1() {
  const els = [];
  // bg
  els.push(rect(0,0,W,H, C.bg));
  // ambient glows
  els.push(glow(80,200, 180, C.acc, 0.10));
  els.push(glow(310,500, 140, C.acc2, 0.08));

  els.push(...statusBar());

  // header
  els.push(text(20,52,'REEF',20,C.acc,{fw:800,ls:3}));
  els.push(text(W-20,52,'Apr 10',12,C.txt2,{anchor:'end'}));
  els.push(text(20,72,'Ocean Health Monitor',13,C.txt2));

  // big hero stat bento card (full width)
  els.push(...glassCard(20,85,W-40,110,{rx:18}));
  els.push(glow(195,130,100, C.acc, 0.12));
  els.push(text(W/2,128,'Ocean Health Index',11,C.txt2,{anchor:'middle',ls:1}));
  els.push(text(W/2,162,'87.4',48,C.acc,{fw:800,anchor:'middle'}));
  els.push(text(W/2,182,'/ 100',14,C.txt3,{anchor:'middle'}));
  els.push(...pill(W/2-30,188,60,18, C.acc, {op:0.15, rx:9}));
  els.push(text(W/2,200,'▲ 2.1 pts this week',10,C.acc,{anchor:'middle',fw:600}));

  // bento grid row 1: 2 cards
  const bw = (W-48)/2;
  // card 1: Water Temp
  els.push(...card(20,210,bw,90));
  els.push(...iconDot(36,230, C.acc));
  els.push(text(52,234,'Water Temp',11,C.txt2));
  els.push(text(28,264,'18.4°C',24,C.txt,{fw:700}));
  els.push(text(28,283,'Pacific Shelf',10,C.txt3));
  const tempSpark = [0.4,0.5,0.45,0.6,0.55,0.7,0.62,0.8,0.75,0.85,0.78,0.9];
  els.push(spark(28,273,bw-16,30,tempSpark,C.acc,{sw:2}));

  // card 2: pH Level
  els.push(...card(28+bw,210,bw,90));
  els.push(...iconDot(44+bw,230, C.acc2));
  els.push(text(60+bw,234,'pH Level',11,C.txt2));
  els.push(text(36+bw,264,'8.12',24,C.txt,{fw:700}));
  els.push(text(36+bw,283,'Slightly alkaline',10,C.txt3));
  const phSpark = [0.7,0.65,0.72,0.68,0.75,0.70,0.73,0.69,0.71,0.74,0.72,0.75];
  els.push(spark(36+bw,273,bw-16,30,phSpark,C.acc2,{sw:2}));

  // bento grid row 2: wide + narrow
  const bw2 = (W-48)*0.62, bw3 = (W-48)*0.38;
  els.push(...card(20,312,bw2,100));
  els.push(text(32,332,'Dissolved Oxygen',11,C.txt2));
  els.push(text(32,360,'6.8 mg/L',22,C.txt,{fw:700}));
  els.push(...pill(32,368,52,18, '#4ade80', {op:0.15, rx:9}));
  els.push(text(58,380,'Optimal',10,C.acc2,{fw:600,anchor:'middle'}));
  const o2Spark = [0.5,0.55,0.6,0.58,0.65,0.72,0.68,0.75,0.8,0.78,0.82,0.85];
  els.push(spark(32,375,bw2-24,30,o2Spark,C.acc2,{sw:2}));

  els.push(...card(28+bw2,312,bw3,100));
  els.push(text(40+bw2,332,'Salinity',11,C.txt2));
  els.push(text(40+bw2,360,'34.7‰',18,C.txt,{fw:700}));
  els.push(text(40+bw2,380,'PSU',10,C.txt3));
  // mini circle gauge
  els.push(circle(48+bw2+bw3/2,370,22, C.acc, {op:0.08}));
  els.push({ type:'arc', cx:48+bw2+bw3/2, cy:370, r:22, startAngle:-90, endAngle:200, stroke:C.acc, sw:3, fill:'none' });

  // bento row 3: single narrow + wide
  els.push(...card(20,424,bw3+4,90));
  els.push(text(32,444,'Turbidity',11,C.txt2));
  els.push(text(32,470,'1.4 NTU',18,C.txt,{fw:700}));
  els.push(...pill(32,478,44,18,'#60a5fa',{op:0.15,rx:9}));
  els.push(text(54,490,'Clear',10,'#60a5fa',{fw:600,anchor:'middle'}));

  const bw4 = W-48-bw3-4-4;
  els.push(...card(32+bw3,424,bw4,90));
  els.push(text(44+bw3,444,'Active Sensors',11,C.txt2));
  els.push(text(44+bw3,468,'42 / 47',22,C.txt,{fw:700}));
  els.push(...progressBar(44+bw3,475,bw4-24,42/47,C.acc2));
  els.push(text(44+bw3,492,'5 offline',10,C.warn));

  // alert strip
  els.push(...glassCard(20,526,W-40,44,{rx:12}));
  els.push(circle(40,548,8,C.warn,{op:0.2}));
  els.push(circle(40,548,4,C.warn));
  els.push(text(54,544,'Algae bloom detected — Sector 7',12,C.warn,{fw:500}));
  els.push(text(54,558,'Monterey Bay · 2 hrs ago',10,C.txt3));
  els.push(text(W-32,548,'›',16,C.txt2,{anchor:'middle'}));

  // last sync
  els.push(text(W/2,588,'Last sync: 3 min ago  ·  12 buoys online',10,C.txt3,{anchor:'middle'}));

  els.push(...navbar(0));
  return { name:'Dashboard', elements:els };
}

// ─── S2: MONITOR (Live Data) ──────────────────────────────────────────────────
function s2() {
  const els = [];
  els.push(rect(0,0,W,H, C.bg));
  els.push(glow(300,180,160, C.acc,0.09));
  els.push(...statusBar());
  els.push(text(20,52,'Live Monitor',20,C.txt,{fw:700}));
  els.push(text(W-20,52,'● LIVE',12,C.acc2,{anchor:'end',fw:600}));

  // tabs
  els.push(...tabRow(65,['Buoys','Satellites','Probes'],0));

  // selected buoy card header
  els.push(...glassCard(20,112,W-40,60,{rx:14}));
  els.push(circle(44,140,14,C.acc,{op:0.15}));
  els.push(text(44,135,'◉',14,C.acc,{anchor:'middle'}));
  els.push(text(62,134,'Buoy B-12 · Pacific Shelf',13,C.txt,{fw:600}));
  els.push(text(62,150,'36.7°N, 121.9°W · Depth 2.4m',11,C.txt2));
  els.push(...pill(W-70,130,52,20,C.acc2,{op:0.15}));
  els.push(text(W-44,143,'Online',11,C.acc2,{fw:600,anchor:'middle'}));

  // big chart card
  els.push(...card(20,184,W-40,180));
  els.push(text(32,204,'Temperature  ·  Last 24h',11,C.txt2,{ls:0.5}));
  els.push(text(W-32,204,'18.4°C',13,C.acc,{anchor:'end',fw:700}));
  // y-axis labels
  [['22°',210],['20°',232],['18°',254],['16°',276]].forEach(([l,y])=>{
    els.push(text(32,y,l,9,C.txt3));
    els.push(line(52,y-4,W-32,y-4,C.border2,{sw:1}));
  });
  // sparkline data
  const temps = [0.4,0.35,0.3,0.38,0.42,0.50,0.55,0.48,0.60,0.68,0.72,0.65,0.70,0.75,0.80,0.78,0.82,0.85,0.80,0.84,0.88,0.85,0.82,0.90];
  els.push(spark(52,218,W-84,68,temps,C.acc,{sw:2.5}));
  // fill under spark
  els.push({ type:'polygon', points: (() => {
    const pts = temps.map((v,i)=>{
      const px = 52 + (i/(temps.length-1))*(W-84);
      const py = 218+68 - v*68;
      return `${px.toFixed(1)},${py.toFixed(1)}`;
    });
    pts.push(`${(W-32).toFixed(1)},${(218+68).toFixed(1)}`);
    pts.push(`52,${(218+68).toFixed(1)}`);
    return pts.join(' ');
  })(), fill: C.acc, opacity:0.07 });
  els.push(text(52,360,'00:00',9,C.txt3));
  els.push(text(W/2,360,'12:00',9,C.txt3,{anchor:'middle'}));
  els.push(text(W-32,360,'24:00',9,C.txt3,{anchor:'end'}));

  // metric row
  const mw = (W-52)/3;
  [
    {label:'Min',val:'15.8°C', color:C.txt},
    {label:'Max',val:'22.1°C', color:C.danger},
    {label:'Avg',val:'18.4°C', color:C.acc},
  ].forEach((m,i)=>{
    const mx = 20+i*(mw+6);
    els.push(...card(mx,374,mw,52,{}));
    els.push(text(mx+mw/2,393,m.label,9,C.txt3,{anchor:'middle'}));
    els.push(text(mx+mw/2,412,m.val,14,m.color,{fw:700,anchor:'middle'}));
  });

  // secondary sensors list
  els.push(...sectionHeader(442,'OTHER SENSORS'));
  const sensors = [
    {name:'pH',      val:'8.12', unit:'',      color:C.acc2,  pct:0.81},
    {name:'Dissolved O₂',val:'6.8',unit:'mg/L',color:'#60a5fa',pct:0.68},
    {name:'Turbidity',val:'1.4', unit:'NTU',   color:C.acc,  pct:0.28},
  ];
  sensors.forEach((s,i)=>{
    const sy = 460+i*56;
    els.push(...card(20,sy,W-40,48,{}));
    els.push(...iconDot(40,sy+24,s.color));
    els.push(text(56,sy+20,s.name,12,C.txt,{fw:500}));
    els.push(text(56,sy+36,s.val+' '+s.unit,11,C.txt2));
    els.push(...progressBar(100,sy+28,W-164,s.pct,s.color));
    els.push(text(W-28,sy+24,s.val,13,s.color,{fw:700,anchor:'end'}));
  });

  els.push(...navbar(1));
  return { name:'Monitor', elements:els };
}

// ─── S3: ALERTS ───────────────────────────────────────────────────────────────
function s3() {
  const els = [];
  els.push(rect(0,0,W,H, C.bg));
  els.push(glow(80,300,140,C.danger,0.07));
  els.push(glow(310,200,120,C.warn,0.06));
  els.push(...statusBar());

  els.push(text(20,52,'Alerts',20,C.txt,{fw:700}));
  els.push(...pill(W-74,38,56,26,C.danger,{op:0.15}));
  els.push(text(W-46,55,'3 Active',10,C.danger,{anchor:'middle',fw:600}));

  // alert severity summary
  const severities = [{label:'Critical',n:1,color:C.danger},{label:'Warning',n:2,color:C.warn},{label:'Info',n:5,color:'#60a5fa'}];
  const sw2 = (W-52)/3;
  severities.forEach((s,i)=>{
    const sx = 20+i*(sw2+6);
    els.push(...glassCard(sx,66,sw2,56,{rx:12}));
    els.push(text(sx+sw2/2,88,String(s.n),22,s.color,{fw:800,anchor:'middle'}));
    els.push(text(sx+sw2/2,104,s.label,10,C.txt2,{anchor:'middle'}));
  });

  const alerts = [
    { severity:'CRITICAL', color:C.danger, title:'Algae Bloom — Sector 7',
      body:'Chlorophyll-a exceeds 30 μg/L threshold', time:'2h ago', loc:'Monterey Bay' },
    { severity:'WARNING',  color:C.warn,   title:'Low pH Trend — Buoy C-3',
      body:'pH dropping 0.05 units/day for 6 days',    time:'5h ago', loc:'Carmel Shelf' },
    { severity:'WARNING',  color:C.warn,   title:'Sensor Offline — B-09',
      body:'No telemetry received for 4 hours',        time:'4h ago', loc:'Point Sur' },
    { severity:'INFO',     color:'#60a5fa',title:'Temperature Peak Recorded',
      body:'22.1°C at Buoy B-12 — seasonal high',     time:'1d ago', loc:'Pacific Shelf' },
    { severity:'INFO',     color:'#60a5fa',title:'Whale Migration Pattern',
      body:'Blue whale pods detected via hydrophone',   time:'2d ago', loc:'Cordell Bank' },
  ];

  els.push(...sectionHeader(138,'ACTIVE ALERTS'));
  alerts.forEach((a,i)=>{
    const ay = 156 + i*116;
    if(ay > 750) return;
    els.push(...card(20,ay,W-40,106,{}));
    // severity pill
    els.push(...pill(32,ay+14,66,20,a.color,{op:0.15}));
    els.push(circle(40,ay+24,4,a.color));
    els.push(text(50,ay+27,a.severity,9,a.color,{fw:700}));
    els.push(text(W-32,ay+24,a.time,10,C.txt3,{anchor:'end'}));
    els.push(text(32,ay+50,a.title,14,C.txt,{fw:600}));
    els.push(text(32,ay+68,a.body,11,C.txt2));
    els.push(line(32,ay+80,W-32,ay+80,C.border2,{sw:1}));
    els.push(...iconDot(44,ay+93,C.txt3));
    els.push(text(56,ay+97,a.loc,11,C.txt2));
    els.push(text(W-32,ay+97,'View →',11,a.color,{anchor:'end',fw:500}));
  });

  els.push(...navbar(2));
  return { name:'Alerts', elements:els };
}

// ─── S4: REPORTS / TRENDS ────────────────────────────────────────────────────
function s4() {
  const els = [];
  els.push(rect(0,0,W,H, C.bg));
  els.push(glow(300,300,160,C.acc2,0.08));
  els.push(...statusBar());

  els.push(text(20,52,'Reports',20,C.txt,{fw:700}));
  els.push(text(W-20,52,'Export ↗',12,C.acc,{anchor:'end',fw:500}));

  // period tabs
  els.push(...tabRow(65,['7d','30d','90d','1yr'],1));

  // headline KPIs bento
  els.push(...glassCard(20,110,W-40,68,{rx:14}));
  const kpis = [{label:'Avg Health',val:'84.2'},{label:'Alerts',val:'47'},{label:'Sensors Up',val:'94%'}];
  const kw = (W-40)/3;
  kpis.forEach((k,i)=>{
    const kx = 20+i*kw + kw/2 - 10;
    els.push(text(kx,132,k.val,22,i===0?C.acc:i===1?C.warn:C.acc2,{fw:800}));
    els.push(text(kx,152,k.label,10,C.txt2));
    if(i<2) els.push(line(20+(i+1)*kw,116,20+(i+1)*kw,170,C.border2,{sw:1}));
  });

  // Ocean Health chart
  els.push(...card(20,190,W-40,160,{}));
  els.push(text(32,210,'Ocean Health Index — 30 days',11,C.txt2));
  const healthData = [0.78,0.80,0.76,0.82,0.81,0.84,0.79,0.85,0.83,0.86,0.88,0.84,0.87,0.89,0.85,0.88,0.90,0.87,0.84,0.86,0.88,0.91,0.87,0.89,0.92,0.88,0.90,0.87,0.89,0.87];
  [['90',220],['80',250],['70',280]].forEach(([l,y])=>{
    els.push(text(28,y,l,9,C.txt3));
    els.push(line(46,y-4,W-28,y-4,C.border2,{sw:1}));
  });
  els.push(spark(46,220,W-74,70,healthData,C.acc,{sw:2}));
  els.push({ type:'polygon', points: (() => {
    const pts = healthData.map((v,i)=>{
      const px = 46+(i/(healthData.length-1))*(W-74);
      const py = 220+70-v*70;
      return `${px.toFixed(1)},${py.toFixed(1)}`;
    });
    pts.push(`${(W-28).toFixed(1)},${(220+70).toFixed(1)}`);
    pts.push(`46,${(220+70).toFixed(1)}`);
    return pts.join(' ');
  })(), fill:C.acc, opacity:0.08 });
  els.push(text(46,344,'Apr 1',9,C.txt3));
  els.push(text(W-28,344,'Apr 10',9,C.txt3,{anchor:'end'}));
  els.push(...pill(W-80,205,60,18,C.acc,{op:0.12}));
  els.push(text(W-50,216,'▲ 3.2%',10,C.acc,{anchor:'middle',fw:600}));

  // category breakdown
  els.push(...sectionHeader(364,'BY PARAMETER'));
  const params = [
    {label:'Temperature',  pct:0.92, trend:'stable',  color:C.acc},
    {label:'pH Level',     pct:0.81, trend:'▼ watch',  color:C.warn},
    {label:'Dissolved O₂', pct:0.88, trend:'▲ good',   color:C.acc2},
    {label:'Turbidity',    pct:0.76, trend:'stable',  color:'#60a5fa'},
  ];
  params.forEach((p,i)=>{
    const py = 382+i*52;
    if(py>750) return;
    els.push(...card(20,py,W-40,44,{}));
    els.push(text(32,py+16,p.label,12,C.txt,{fw:500}));
    els.push(text(32,py+32,`${Math.round(p.pct*100)}% healthy`,10,C.txt3));
    els.push(...progressBar(130,py+22,W-196,p.pct,p.color));
    els.push(text(W-28,py+26,p.trend,10,p.color,{anchor:'end',fw:500}));
  });

  els.push(...navbar(3));
  return { name:'Reports', elements:els };
}

// ─── S5: MAP VIEW ─────────────────────────────────────────────────────────────
function s5() {
  const els = [];
  els.push(rect(0,0,W,H, '#050A0D'));
  // stylized dark map bg
  els.push(rect(0,0,W,H,'#07111A',{op:0.7}));
  // ocean grid lines
  for(let i=0;i<15;i++) {
    els.push(line(0,i*60,W,i*60,'rgba(0,207,255,0.04)',{sw:1}));
    els.push(line(i*28,0,i*28,H,'rgba(0,207,255,0.04)',{sw:1}));
  }
  // depth contours (organic curves approximated as polylines)
  els.push(polyline('0,300 60,280 130,310 200,290 280,320 350,300 390,285','rgba(0,207,255,0.08)',{sw:1.5}));
  els.push(polyline('0,400 70,380 160,420 240,390 320,410 390,395','rgba(0,207,255,0.06)',{sw:1}));
  els.push(polyline('0,500 90,490 180,510 270,495 390,505','rgba(0,207,255,0.05)',{sw:1}));

  els.push(...statusBar());

  // header overlay
  els.push(rect(0,0,W,70,C.bg,{op:0.85}));
  els.push(text(20,52,'Sensor Map',20,C.txt,{fw:700}));
  els.push(text(W-20,52,'⊕ Add',13,C.acc,{anchor:'end',fw:500}));

  // buoy markers
  const buoys = [
    {x:80,y:250,name:'B-12',status:'ok',    val:'18.4°',color:C.acc2},
    {x:170,y:320,name:'B-09',status:'warn', val:'Offline',color:C.warn},
    {x:260,y:280,name:'B-15',status:'ok',   val:'17.9°',color:C.acc2},
    {x:130,y:410,name:'C-03',status:'warn', val:'pH 7.9',color:C.warn},
    {x:310,y:380,name:'C-07',status:'ok',   val:'6.8mg/L',color:C.acc2},
    {x:60,y:480,name:'D-01',status:'ok',    val:'18.1°',color:C.acc2},
    {x:230,y:470,name:'D-04',status:'crit', val:'Bloom!',color:C.danger},
    {x:340,y:500,name:'D-08',status:'ok',   val:'19.2°',color:C.acc2},
  ];
  buoys.forEach(b=>{
    // pulse ring for active
    if(b.status==='ok') els.push(circle(b.x,b.y,18,b.color,{op:0.08}));
    if(b.status==='crit') {
      els.push(circle(b.x,b.y,22,b.color,{op:0.12}));
      els.push(circle(b.x,b.y,30,b.color,{op:0.05}));
    }
    els.push(circle(b.x,b.y,10,b.color,{op:0.25}));
    els.push(circle(b.x,b.y,5,b.color));
    // label tag
    els.push(rect(b.x-20,b.y-32,40,20,C.surf,{rx:5,op:0.92}));
    els.push(text(b.x,b.y-19,b.name,8,b.color,{anchor:'middle',fw:700}));
  });

  // bloom alert overlay
  els.push(...glassCard(20,590,W-40,82,{rx:16}));
  els.push(circle(40,630,20,C.danger,{op:0.15}));
  els.push(text(40,625,'!',18,C.danger,{fw:800,anchor:'middle'}));
  els.push(text(68,616,'ACTIVE INCIDENT',9,C.danger,{fw:700,ls:1}));
  els.push(text(68,634,'Algae Bloom — Sector D-04',14,C.txt,{fw:600}));
  els.push(text(68,650,'Chlorophyll-a: 42 μg/L  ·  Coverage: 12 km²',10,C.txt2));
  els.push(text(68,664,'Expanding NW @ 1.2 km/h',10,C.warn));
  els.push(text(W-32,640,'›',20,C.txt2,{anchor:'middle'}));

  // legend
  els.push(rect(20,682,W-40,48,C.bg,{rx:10,op:0.9}));
  [{c:C.acc2,l:'Normal'},{c:C.warn,l:'Warning'},{c:C.danger,l:'Critical'}].forEach((lv,i)=>{
    const lx = 40+i*110;
    els.push(circle(lx,706,5,lv.c));
    els.push(text(lx+12,710,lv.l,10,C.txt2));
  });

  els.push(...navbar(4));
  return { name:'Map', elements:els };
}

// ─── S6: SPECIES (Biodiversity) ───────────────────────────────────────────────
function s6() {
  const els = [];
  els.push(rect(0,0,W,H, C.bg));
  els.push(glow(200,200,180,C.acc2,0.09));
  els.push(...statusBar());

  els.push(text(20,52,'Biodiversity',20,C.txt,{fw:700}));
  els.push(text(W-20,52,'Apr 2026',12,C.txt2,{anchor:'end'}));

  // hero index card
  els.push(...glassCard(20,66,W-40,80,{rx:16}));
  els.push(text(W/2,90,'Shannon Diversity Index',11,C.txt2,{anchor:'middle',ls:0.5}));
  els.push(text(W/2,122,'3.84',40,C.acc2,{fw:800,anchor:'middle'}));
  els.push(text(W/2,140,'▲ 0.12 vs last quarter',11,C.acc2,{anchor:'middle',fw:500}));

  // species list
  els.push(...sectionHeader(160,'OBSERVED SPECIES'));
  const species = [
    {icon:'🐋',name:'Blue Whale',latin:'Balaenoptera musculus', count:4,  trend:'+1', status:'Endangered'},
    {icon:'🐬',name:'Bottlenose Dolphin',latin:'Tursiops truncatus',count:47, trend:'+12','status':'Least Concern'},
    {icon:'🦈',name:'Great White Shark',latin:'Carcharodon carcharias',count:6, trend:'0', status:'Vulnerable'},
    {icon:'🐙',name:'Giant Squid',latin:'Architeuthis dux',      count:2,  trend:'+2', status:'Unknown'},
    {icon:'🐟',name:'Pacific Salmon',latin:'Oncorhynchus tshawytscha',count:312,trend:'-8',status:'Near Threatened'},
  ];
  species.forEach((sp,i)=>{
    const sy = 178+i*100;
    if(sy>730) return;
    els.push(...card(20,sy,W-40,88,{}));
    // icon circle
    els.push(circle(46,sy+44,20,C.acc2,{op:0.1}));
    els.push(text(46,sy+50,sp.icon,18,C.txt,{anchor:'middle'}));
    els.push(text(74,sy+32,sp.name,13,C.txt,{fw:600}));
    els.push(text(74,sy+50,sp.latin,10,C.txt3));
    const tcolor = sp.trend.startsWith('+') ? C.acc2 : sp.trend==='0' ? C.txt2 : C.danger;
    els.push(text(74,sy+68,sp.trend+' this month',10,tcolor,{fw:500}));
    // status pill
    const scolor = sp.status==='Endangered'?C.danger:sp.status==='Vulnerable'?C.warn:sp.status==='Near Threatened'?'#f97316':'#60a5fa';
    els.push(...pill(W-80,sy+14,72,18,scolor,{op:0.15}));
    els.push(text(W-44,sy+27,sp.status,8,scolor,{anchor:'middle',fw:600}));
    // count
    els.push(text(W-32,sy+60,String(sp.count),18,C.txt,{fw:700,anchor:'end'}));
    els.push(text(W-32,sy+76,'observed',10,C.txt3,{anchor:'end'}));
  });

  els.push(...navbar(1));
  return { name:'Species', elements:els };
}

// ─── ASSEMBLE ────────────────────────────────────────────────────────────────
const screens = [s1(),s2(),s3(),s4(),s5(),s6()];
const total = screens.reduce((a,s)=>a+s.elements.length,0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'REEF',
    tagline: 'Ocean Health. Monitored.',
    author: 'RAM',
    date: new Date().toISOString().slice(0,10),
    theme: 'dark',
    heartbeat: 42,
    concept: 'Ocean environmental monitoring platform — dark glassmorphism bento cards, bioluminescent palette',
    inspiration: 'darkmodedesign.com glassmorphism + saaspo.com bento grid pattern',
    palette: {
      bg:'#060A10', surface:'#0B1018', card:'#111823',
      accent:'#00CFFF', accent2:'#05F080', muted:'rgba(122,155,181,0.4)',
    },
    elements: total,
  },
  screens,
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`REEF: ${screens.length} screens, ${total} elements`);
console.log(`Written: ${SLUG}.pen`);
