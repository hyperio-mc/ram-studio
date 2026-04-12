'use strict';
const fs = require('fs'), path = require('path');

const SLUG = 'vitals';
const W = 390, H = 844;

// ─── PALETTE — Reflect-inspired #030014 purple-black + per-metric hue system ─
const VOID   = '#030014';  // Reflect-sourced near-black with purple undertone
const SURF   = '#0D0A1F';  // surface level 1 — elevated slightly
const CARD   = '#141028';  // card / panel level
const RAIL   = '#1C1638';  // rail / active surfaces
const TEXT   = 'rgba(255,255,255,0.92)';  // opacity-based hierarchy
const TEXT2  = 'rgba(255,255,255,0.60)';
const TEXT3  = 'rgba(255,255,255,0.35)';

// Per-metric hue system (Phantom model)
const CORAL  = '#FC5F2B';   // Heart Rate — Superpower-sourced orange-coral
const PURPLE = '#7B4FE9';   // Sleep — Reflect purple
const TEAL   = '#00C9D4';   // HRV — precision/data
const GREEN  = '#00B982';   // Recovery — Augen green
const AMBER  = '#FCA311';   // Stress — Augen yellow

// ─── PRIMITIVES ──────────────────────────────────────────────────────────────
function rect(x,y,w,h,fill,opts={}) {
  return { type:'rect', x, y, w, h, fill,
    rx: opts.rx||0, opacity: opts.opacity||1,
    stroke: opts.stroke||'none', sw: opts.sw||1 };
}
function text(x,y,content,size,fill,opts={}) {
  return { type:'text', x, y, content, size, fill,
    fw: opts.fw||400, font: opts.font||'Inter,sans-serif',
    anchor: opts.anchor||'start', ls: opts.ls||0, opacity: opts.opacity||1 };
}
function circle(cx,cy,r,fill,opts={}) {
  return { type:'circle', cx, cy, r, fill,
    opacity: opts.opacity||1, stroke: opts.stroke||'none', sw: opts.sw||1 };
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  return { type:'line', x1, y1, x2, y2, stroke, sw: opts.sw||1, opacity: opts.opacity||1 };
}

// ─── STATUS BAR ──────────────────────────────────────────────────────────────
function statusBar() {
  return [
    rect(0,0,W,44,VOID),
    text(18,28,'9:41',13,TEXT,{fw:600}),
    text(W-18,28,'●●●',11,TEXT,{anchor:'end'}),
  ];
}

// ─── PILL NAV (Reflect-inspired pill container) ───────────────────────────────
function bottomNav(active) {
  const items = [
    { id:'today',    icon:'◉', label:'Today'   },
    { id:'heart',    icon:'♡',  label:'Heart'   },
    { id:'sleep',    icon:'◑',  label:'Sleep'   },
    { id:'hrv',      icon:'◈', label:'HRV'     },
    { id:'insights', icon:'◇', label:'Insights'},
  ];
  // Pill container
  const els = [
    rect(0,H-88,W,88,VOID),
    rect(12,H-80,W-24,68,SURF,{rx:34}),  // pill background
  ];
  items.forEach((it,i) => {
    const x = 47 + i*74;
    const isActive = it.id===active;
    const hue = it.id==='heart'?CORAL:it.id==='sleep'?PURPLE:it.id==='hrv'?TEAL:it.id==='today'?GREEN:AMBER;
    if(isActive) {
      // Active item gets a colored pill background within the nav pill
      els.push(rect(x-26,H-74,52,36,hue,{rx:18,opacity:0.18}));
      els.push(text(x,H-54,it.icon,18,hue,{anchor:'middle',fw:700}));
      els.push(text(x,H-34,it.label,9,hue,{anchor:'middle',fw:600}));
    } else {
      els.push(text(x,H-54,it.icon,18,TEXT2,{anchor:'middle'}));
      els.push(text(x,H-34,it.label,9,TEXT3,{anchor:'middle'}));
    }
  });
  return els;
}

// ─── METRIC CARD helper ───────────────────────────────────────────────────────
function metricCard(x,y,w,h,label,value,unit,change,hue,trend='up') {
  const els = [];
  els.push(rect(x,y,w,h,CARD,{rx:16}));
  // Colored top accent stripe
  els.push(rect(x,y,w,3,hue,{rx:2}));
  // Hue glow circle in corner
  els.push(circle(x+w-20,y+20,24,hue,{opacity:0.08}));
  // Label
  els.push(text(x+14,y+20,label,10,TEXT2,{fw:500}));
  // Value + unit
  els.push(text(x+14,y+46,value,24,TEXT,{fw:700}));
  els.push(text(x+14+value.length*14,y+46,unit,12,TEXT2,{fw:400}));
  // Change indicator
  const changeCol = trend==='up'?GREEN:CORAL;
  const arrow = trend==='up'?'↑':'↓';
  els.push(text(x+14,y+h-14,arrow+' '+change,10,changeCol,{fw:600}));
  return els;
}

// ─── SCREEN 1: TODAY ─────────────────────────────────────────────────────────
function screenToday() {
  const els = [];
  els.push(rect(0,0,W,H,VOID));
  // Star-field dots (Reflect-inspired ambient background)
  [[40,80],[120,50],[280,70],[350,40],[60,200],[310,160],[180,130],[80,320],[340,280]].forEach(([cx,cy]) => {
    els.push(circle(cx,cy,1.5,'rgba(255,255,255,0.25)'));
  });
  statusBar().forEach(e=>els.push(e));

  // Header
  els.push(text(24,72,'VITALS',16,TEXT,{fw:700,ls:3}));
  els.push(text(W-24,72,'Thu, Apr 10',12,TEXT2,{anchor:'end'}));

  // Readiness score — big hero ring
  els.push(circle(W/2,170,68,VOID,{stroke:RAIL,sw:10}));
  // Colored arc (83% = ~300° of 360° — approximate with concentric rings)
  els.push(circle(W/2,170,68,'none',{stroke:GREEN,sw:10,opacity:0.8}));
  els.push(circle(W/2,170,68,'none',{stroke:VOID,sw:11,opacity:0.17})); // partial mask
  els.push(text(W/2,162,'83',28,TEXT,{anchor:'middle',fw:700}));
  els.push(text(W/2,180,'Readiness',11,TEXT2,{anchor:'middle'}));
  els.push(text(W/2,196,'Optimal',10,GREEN,{anchor:'middle',fw:600}));

  // Green glow behind ring
  els.push(circle(W/2,170,52,GREEN,{opacity:0.05}));

  // Section label
  els.push(text(24,248,'Today\'s Metrics',13,TEXT,{fw:600}));

  // 2×2 metric card grid
  const cards = [
    { label:'Heart Rate',  value:'62',  unit:'bpm',  change:'−4 vs yesterday', hue:CORAL,  trend:'down', x:16,   y:266 },
    { label:'HRV',         value:'68',  unit:'ms',   change:'+7 vs yesterday', hue:TEAL,   trend:'up',   x:W/2+4,y:266 },
    { label:'Sleep Score', value:'91',  unit:'/100', change:'↑ above avg',     hue:PURPLE, trend:'up',   x:16,   y:370 },
    { label:'Recovery',    value:'87',  unit:'%',    change:'+12 vs 7-day',   hue:GREEN,  trend:'up',   x:W/2+4,y:370 },
  ];
  cards.forEach(c => {
    metricCard(c.x,c.y,W/2-20,88,c.label,c.value,c.unit,c.change,c.hue,c.trend).forEach(e=>els.push(e));
  });

  // Stress strip
  els.push(rect(16,474,W-32,52,CARD,{rx:14}));
  els.push(rect(16,474,3,52,AMBER,{rx:2}));
  els.push(text(28,494,'Stress Level',11,TEXT2));
  els.push(text(28,510,'Low — 22% of day elevated',12,TEXT,{fw:500}));
  // Stress mini bar
  const sbW = W-32-100;
  els.push(rect(W-24-sbW,484,sbW,12,RAIL,{rx:6}));
  els.push(rect(W-24-sbW,484,sbW*0.22,12,AMBER,{rx:6,opacity:0.7}));

  // Activity summary
  els.push(rect(16,538,W-32,56,CARD,{rx:14}));
  const actItems = [{label:'Steps',value:'8,420'},{label:'Active min',value:'42'},{label:'Cal',value:'1,840'},{label:'Floors',value:'12'}];
  actItems.forEach((a,i) => {
    const ax = 44+i*82;
    els.push(text(ax,562,a.value,13,TEXT,{fw:700,anchor:'middle'}));
    els.push(text(ax,576,a.label,9,TEXT2,{anchor:'middle'}));
    if(i<3) els.push(line(ax+41,544,ax+41,582,TEXT3,{opacity:0.3}));
  });

  // Tip / insight
  els.push(rect(16,606,W-32,40,PURPLE,{rx:12,opacity:0.1,stroke:PURPLE,sw:1}));
  els.push(text(30,620,'◇',10,PURPLE));
  els.push(text(46,620,'HRV up 7ms — good training window today',11,TEXT2));

  bottomNav('today').forEach(e=>els.push(e));
  return { name:'Today', svg:'', elements: els };
}

// ─── SCREEN 2: HEART RATE ────────────────────────────────────────────────────
function screenHeart() {
  const els = [];
  els.push(rect(0,0,W,H,VOID));
  // Coral ambient glow
  els.push(circle(W/2,300,160,CORAL,{opacity:0.04}));
  statusBar().forEach(e=>els.push(e));

  // Section header with hue
  els.push(rect(16,52,W-32,56,CORAL,{rx:16,opacity:0.1}));
  els.push(text(30,72,'♡',18,CORAL));
  els.push(text(56,76,'Heart Rate',14,TEXT,{fw:700}));
  els.push(text(56,90,'Resting · Today',10,TEXT2));
  els.push(text(W-24,76,'62 bpm',14,CORAL,{anchor:'end',fw:700}));

  // Live reading hero
  els.push(text(W/2,160,'62',64,TEXT,{anchor:'middle',fw:700}));
  els.push(text(W/2,186,'beats per minute',12,TEXT2,{anchor:'middle'}));
  // Pulse rings
  [88,76,64].forEach((r,i) => {
    els.push(circle(W/2,160,r,CORAL,{opacity:0.04+i*0.02,stroke:CORAL,sw:1}));
  });

  // 24h graph
  els.push(text(24,218,'Last 24 hours',12,TEXT2,{fw:500}));
  els.push(rect(16,232,W-32,80,CARD,{rx:14}));
  // Simulate line chart — vertical bars with varying heights
  const hrData = [58,60,62,59,58,57,56,58,62,68,72,75,71,68,65,63,62,64,66,64,62,60,59,62];
  const maxHR = 80, minHR = 50;
  hrData.forEach((v,i) => {
    const barH = ((v-minHR)/(maxHR-minHR))*60;
    const bx = 28+i*(W-56)/24;
    const isMorning = i>=6&&i<=9;
    els.push(rect(bx,306-barH,(W-56)/24-2,barH,isMorning?CORAL:CORAL,{rx:2,opacity:isMorning?0.85:0.3}));
  });
  // Axis labels
  ['12a','6a','12p','6p','12a'].forEach((l,i) => {
    els.push(text(28+i*(W-56)/4.2,320,l,8,TEXT3,{anchor:'middle'}));
  });

  // Zones
  els.push(text(24,334,'Heart Rate Zones — Today',12,TEXT2,{fw:500}));
  const zones = [
    {name:'Zone 1 — Rest',    pct:68, col:'rgba(255,255,255,0.25)'},
    {name:'Zone 2 — Fat burn', pct:20, col:CORAL},
    {name:'Zone 3 — Cardio',  pct:8,  col:AMBER},
    {name:'Zone 4 — Peak',    pct:4,  col:'#FF2D55'},
  ];
  zones.forEach((z,i) => {
    const y = 350+i*46;
    els.push(text(24,y+14,z.name,12,TEXT,{fw:500}));
    const bw = W-32-80;
    els.push(rect(130,y+4,bw,10,RAIL,{rx:5}));
    els.push(rect(130,y+4,bw*(z.pct/100),10,z.col,{rx:5}));
    els.push(text(130+bw+8,y+14,z.pct+'%',10,TEXT2,{fw:500}));
    els.push(line(24,y+36,W-24,y+36,TEXT3,{opacity:0.2}));
  });

  // Resting HR trend
  els.push(rect(16,540,W-32,64,CARD,{rx:14}));
  els.push(text(28,558,'7-Day Resting HR',11,TEXT2,{fw:500}));
  els.push(text(28,576,'62 bpm avg',16,TEXT,{fw:700}));
  els.push(text(28,590,'↓ 3 bpm lower than last week',11,GREEN,{fw:500}));
  // Small sparkline
  const rhrData = [66,65,64,63,64,62,62];
  rhrData.forEach((v,i) => {
    const bx = W-24-50+i*8;
    const bh = ((v-58)/12)*28;
    els.push(rect(bx,592-bh,6,bh,CORAL,{rx:2,opacity:0.6}));
  });

  bottomNav('heart').forEach(e=>els.push(e));
  return { name:'Heart Rate', svg:'', elements: els };
}

// ─── SCREEN 3: SLEEP ─────────────────────────────────────────────────────────
function screenSleep() {
  const els = [];
  els.push(rect(0,0,W,H,VOID));
  // Purple ambient glow
  els.push(circle(W/2,360,180,PURPLE,{opacity:0.06}));
  statusBar().forEach(e=>els.push(e));

  // Section header
  els.push(rect(16,52,W-32,56,PURPLE,{rx:16,opacity:0.1}));
  els.push(text(30,72,'◑',18,PURPLE));
  els.push(text(56,76,'Sleep',14,TEXT,{fw:700}));
  els.push(text(56,90,'Last night · Apr 9–10',10,TEXT2));
  els.push(text(W-24,76,'91 / 100',14,PURPLE,{anchor:'end',fw:700}));

  // Duration hero
  els.push(text(W/2,150,'7h 42m',48,TEXT,{anchor:'middle',fw:700}));
  els.push(text(W/2,176,'10:48 pm → 6:30 am',12,TEXT2,{anchor:'middle'}));
  // Sleep quality badge
  els.push(rect(W/2-36,186,72,22,PURPLE,{rx:11,opacity:0.2}));
  els.push(text(W/2,201,'Excellent',11,PURPLE,{anchor:'middle',fw:600}));

  // Sleep stages — horizontal stacked bar
  els.push(text(24,224,'Sleep Stages',12,TEXT2,{fw:500}));
  els.push(rect(16,238,W-32,18,RAIL,{rx:9}));
  // Proportional stage fill: Awake 4%, Light 46%, Deep 21%, REM 29%
  const stages = [
    {pct:0.04,col:CORAL},
    {pct:0.46,col:'rgba(255,255,255,0.2)'},
    {pct:0.21,col:PURPLE},
    {pct:0.29,col:TEAL},
  ];
  let sx = 16;
  stages.forEach(s => {
    const sw = (W-32)*s.pct;
    els.push(rect(sx,238,sw,18,s.col,{rx:0}));
    sx += sw;
  });
  // Round the corners on first and last
  els.push(rect(16,238,12,18,stages[0].col,{rx:9}));
  els.push(rect(W-28,238,12,18,stages[stages.length-1].col,{rx:9}));

  // Stage legend + time
  const stageLegend = [
    {name:'Awake',  t:'18m', col:CORAL},
    {name:'Light',  t:'3h 32m',col:'rgba(255,255,255,0.3)'},
    {name:'Deep',   t:'1h 37m',col:PURPLE},
    {name:'REM',    t:'2h 15m',col:TEAL},
  ];
  stageLegend.forEach((s,i) => {
    const sx2 = i<2 ? 16+i*176 : 16+(i-2)*176;
    const sy2 = i<2 ? 268 : 294;
    els.push(circle(sx2+6,sy2,5,s.col,{opacity:0.8}));
    els.push(text(sx2+16,sy2+4,s.name,10,TEXT2));
    els.push(text(sx2+16,sy2+16,s.t,11,TEXT,{fw:600}));
  });

  // Timeline chart
  els.push(text(24,320,'Stage Timeline',12,TEXT2,{fw:500}));
  els.push(rect(16,334,W-32,80,CARD,{rx:14}));
  // Simplified stage blocks across the night (10:48pm to 6:30am ≈ 7.7h)
  const stageBlocks = [
    {stage:'light',start:0,dur:0.07,col:'rgba(255,255,255,0.2)'},
    {stage:'deep', start:0.07,dur:0.14,col:PURPLE},
    {stage:'light',start:0.21,dur:0.1,col:'rgba(255,255,255,0.2)'},
    {stage:'rem',  start:0.31,dur:0.15,col:TEAL},
    {stage:'light',start:0.46,dur:0.08,col:'rgba(255,255,255,0.2)'},
    {stage:'deep', start:0.54,dur:0.1,col:PURPLE},
    {stage:'light',start:0.64,dur:0.08,col:'rgba(255,255,255,0.2)'},
    {stage:'rem',  start:0.72,dur:0.18,col:TEAL},
    {stage:'awake',start:0.90,dur:0.04,col:CORAL},
    {stage:'rem',  start:0.94,dur:0.06,col:TEAL},
  ];
  const chartW = W-32-16;
  stageBlocks.forEach(b => {
    const bx = 24 + b.start*chartW;
    const bw = b.dur*chartW;
    const by = b.stage==='deep'?350:b.stage==='rem'?360:b.stage==='awake'?340:365;
    const bh = b.stage==='deep'?24:b.stage==='rem'?20:b.stage==='awake'?12:14;
    els.push(rect(bx,by,bw,bh,b.col,{rx:3}));
  });
  // Time labels
  ['11p','1a','3a','5a'].forEach((l,i) => {
    els.push(text(24+i*(chartW/3.5),416,l,8,TEXT3,{anchor:'middle'}));
  });

  // Insights
  els.push(text(24,430,'Sleep Insights',12,TEXT2,{fw:500}));
  const sleepInsights = [
    {icon:'◈',text:'2h 15m REM — above your 7-day avg of 1h 52m',col:TEAL  },
    {icon:'◇',text:'Consistent sleep time — within 18 min of average',col:GREEN },
    {icon:'♡',text:'Resting HR 58 bpm during deep sleep — good',col:CORAL },
  ];
  sleepInsights.forEach((ins,i) => {
    const y = 448+i*54;
    els.push(rect(16,y,W-32,46,CARD,{rx:10}));
    els.push(rect(16,y,3,46,ins.col,{rx:2}));
    els.push(text(28,y+16,ins.icon,11,ins.col));
    els.push(text(44,y+20,ins.text,11,TEXT2));
  });

  bottomNav('sleep').forEach(e=>els.push(e));
  return { name:'Sleep', svg:'', elements: els };
}

// ─── SCREEN 4: HRV ───────────────────────────────────────────────────────────
function screenHRV() {
  const els = [];
  els.push(rect(0,0,W,H,VOID));
  // Teal ambient glow
  els.push(circle(W/2,380,160,TEAL,{opacity:0.04}));
  statusBar().forEach(e=>els.push(e));

  // Section header
  els.push(rect(16,52,W-32,56,TEAL,{rx:16,opacity:0.1}));
  els.push(text(30,72,'◈',18,TEAL));
  els.push(text(56,76,'HRV',14,TEXT,{fw:700}));
  els.push(text(56,90,'Heart Rate Variability',10,TEXT2));
  els.push(text(W-24,76,'68 ms',14,TEAL,{anchor:'end',fw:700}));

  // Hero score
  els.push(text(W/2,148,'68',52,TEXT,{anchor:'middle',fw:700}));
  els.push(text(W/2,172,'ms RMSSD',12,TEXT2,{anchor:'middle'}));
  // Context badge
  els.push(rect(W/2-44,180,88,22,TEAL,{rx:11,opacity:0.18}));
  els.push(text(W/2,195,'Above baseline',11,TEAL,{anchor:'middle',fw:600}));

  // 30-day trend chart
  els.push(text(24,220,'30-Day Trend',12,TEXT2,{fw:500}));
  els.push(rect(16,234,W-32,90,CARD,{rx:14}));
  const hrvData = [52,55,54,58,60,57,56,59,62,61,60,63,65,64,62,65,68,66,64,66,68,70,67,65,63,66,68,67,66,68];
  const maxHRV = 75, minHRV = 48;
  const cw2 = (W-56)/30;
  hrvData.forEach((v,i) => {
    const bh = ((v-minHRV)/(maxHRV-minHRV))*70;
    const bx = 28+i*cw2;
    els.push(rect(bx,316-bh,cw2-1,bh,TEAL,{rx:1,opacity:0.4+((v-minHRV)/(maxHRV-minHRV))*0.5}));
  });
  // Trend line (simplified as a few key points)
  ['30d ago','15d ago','Today'].forEach((l,i) => {
    els.push(text(28+i*(W-56)/2,328,l,8,TEXT3,{anchor:'middle'}));
  });
  // Baseline marker
  els.push(line(28,290,W-24,290,TEXT3,{sw:1,opacity:0.3}));
  els.push(text(W-24,288,'baseline',8,TEXT3,{anchor:'end'}));

  // Training readiness
  els.push(text(24,342,'Training Recommendation',12,TEXT2,{fw:500}));
  els.push(rect(16,358,W-32,72,CARD,{rx:14,stroke:GREEN,sw:1}));
  els.push(circle(32,394,12,GREEN,{opacity:0.2}));
  els.push(text(32,397,'✓',10,GREEN,{anchor:'middle',fw:700}));
  els.push(text(52,378,'Good training window',13,TEXT,{fw:600}));
  els.push(text(52,394,'HRV is 7ms above your 7-day avg.',11,TEXT2));
  els.push(text(52,410,'High-intensity session recommended.',11,TEXT2));

  // AI disclosure (Cosmos pattern)
  els.push(rect(16,442,W-32,38,RAIL,{rx:10}));
  els.push(text(28,462,'◇ How was this calculated?',11,TEAL,{fw:500}));
  els.push(text(W-24,462,'▸',11,TEXT3,{anchor:'end'}));

  // Contributing factors
  els.push(text(24,494,'Contributing Factors',12,TEXT2,{fw:500}));
  const factors = [
    {name:'Sleep quality',     val:91, col:PURPLE, good:true },
    {name:'Resting heart rate',val:62, col:CORAL,  good:true },
    {name:'Recent workouts',   val:2,  col:GREEN,  good:true, unit:'days rest'},
    {name:'Stress yesterday',  val:22, col:AMBER,  good:true, unit:'% elevated'},
  ];
  factors.forEach((f,i) => {
    const y = 512+i*52;
    els.push(rect(16,y,W-32,44,CARD,{rx:10}));
    els.push(circle(30,y+22,7,f.col,{opacity:0.7}));
    els.push(text(44,y+18,f.name,12,TEXT,{fw:500}));
    const valStr = f.unit ? f.val+' '+f.unit : f.val.toString();
    els.push(text(44,y+32,valStr,10,TEXT2));
    els.push(text(W-24,y+22,f.good?'✓ Positive':'! Watch',10,f.good?GREEN:AMBER,{anchor:'end',fw:600}));
    els.push(line(44,y+44,W-24,y+44,TEXT3,{opacity:0.15}));
  });

  bottomNav('hrv').forEach(e=>els.push(e));
  return { name:'HRV', svg:'', elements: els };
}

// ─── SCREEN 5: INSIGHTS ──────────────────────────────────────────────────────
function screenInsights() {
  const els = [];
  els.push(rect(0,0,W,H,VOID));
  // Amber ambient glow for insights/AI
  els.push(circle(W-40,120,80,AMBER,{opacity:0.05}));
  statusBar().forEach(e=>els.push(e));

  // Header
  els.push(text(24,72,'Insights',18,TEXT,{fw:700}));
  els.push(text(W-24,72,'AI-generated',11,AMBER,{anchor:'end',fw:500,opacity:0.8}));
  els.push(line(24,82,W-24,82,'rgba(255,255,255,0.06)'));

  // Today's summary card
  els.push(rect(16,90,W-32,80,CARD,{rx:16,stroke:GREEN,sw:1}));
  els.push(circle(W/2,130,38,GREEN,{opacity:0.06}));
  els.push(text(28,112,'Today\'s Readiness Summary',12,TEXT2,{fw:500}));
  els.push(text(28,132,'83 / 100 — Optimal performance window.',13,TEXT,{fw:600}));
  els.push(text(28,150,'All 4 key metrics trending positive.',12,TEXT2));

  // AI Disclosure (Cosmos pattern — Show/Blur/Hide provenance)
  els.push(rect(16,180,W-32,36,RAIL,{rx:10,stroke:AMBER,sw:1}));
  els.push(text(28,200,'◇ AI generated · tap to see how',11,AMBER,{fw:500}));
  els.push(text(W-24,200,'Show ▸',10,TEXT2,{anchor:'end'}));

  // Weekly pattern insight
  els.push(text(24,232,'Pattern Detected',13,TEXT,{fw:700}));
  els.push(rect(16,248,W-32,96,CARD,{rx:14}));
  els.push(rect(16,248,4,96,TEAL,{rx:2}));
  els.push(text(28,268,'HRV + Sleep correlation',12,TEXT,{fw:600}));
  els.push(text(28,284,'Your HRV rises 8–12ms on nights after you',11,TEXT2));
  els.push(text(28,298,'sleep 7h+. Below 6h: HRV drops avg 15ms.',11,TEXT2));
  els.push(text(28,316,'Confidence: 87% · Based on 34 nights',10,TEXT3));
  els.push(text(W-24,268,'◈ HRV',10,TEAL,{anchor:'end'}));

  // Action cards
  els.push(text(24,360,'Recommended Actions',13,TEXT,{fw:700}));
  const actions = [
    {hue:CORAL,  icon:'♡', title:'Keep cardio moderate today', sub:'Zone 2 only — heart rate recovery still elevated from Tuesday\'s session', col:CORAL  },
    {hue:PURPLE, icon:'◑', title:'Prioritise 8h sleep tonight', sub:'Your HRV has risen 7ms over 3 nights of 7h+ sleep. Continue the streak.',col:PURPLE},
    {hue:AMBER,  icon:'◇', title:'Evening screen cutoff at 9pm', sub:'Blue light suppression correlates with +14min deep sleep in your data.',  col:AMBER },
    {hue:GREEN,  icon:'◉', title:'Mobility work this morning', sub:'Low-intensity movement improves HRV recovery — 20 min walk/stretch ideal.',col:GREEN },
  ];
  actions.forEach((a,i) => {
    const y = 380+i*90;
    els.push(rect(16,y,W-32,82,CARD,{rx:12}));
    els.push(rect(16,y,4,82,a.hue,{rx:2}));
    els.push(text(28,y+18,a.icon,14,a.hue));
    els.push(text(46,y+22,a.title,12,TEXT,{fw:600}));
    const sub1 = a.sub.slice(0,44);
    const sub2 = a.sub.slice(44,88);
    els.push(text(28,y+38,sub1,10,TEXT2));
    if(sub2) els.push(text(28,y+52,sub2+(a.sub.length>88?'…':''),10,TEXT2));
    els.push(text(28,y+68,'Done ✓  Dismiss  Tell me more',10,TEXT3));
    els.push(line(28,y+82,W-24,y+82,TEXT3,{opacity:0.12}));
  });

  bottomNav('insights').forEach(e=>els.push(e));
  return { name:'Insights', svg:'', elements: els };
}

// ─── SCREEN 6: RECOVERY ──────────────────────────────────────────────────────
function screenRecovery() {
  const els = [];
  els.push(rect(0,0,W,H,VOID));
  // Green ambient glow
  els.push(circle(W/2,400,160,GREEN,{opacity:0.05}));
  statusBar().forEach(e=>els.push(e));

  // Header
  els.push(text(24,72,'Recovery',18,TEXT,{fw:700}));
  els.push(text(W-24,72,'7-day view',12,TEXT2,{anchor:'end'}));

  // Recovery score hero
  els.push(text(W/2,148,'87',52,TEXT,{anchor:'middle',fw:700}));
  els.push(text(W/2,172,'Recovery Score',12,TEXT2,{anchor:'middle'}));
  // Gauge arc approximation
  [80,70,60].forEach((r,i) => {
    els.push(circle(W/2,148,r,GREEN,{opacity:0.03+i*0.01}));
  });
  // Green badge
  els.push(rect(W/2-34,180,68,22,GREEN,{rx:11,opacity:0.18}));
  els.push(text(W/2,195,'High',11,GREEN,{anchor:'middle',fw:600}));

  // 7-day recovery bars
  els.push(text(24,222,'7-Day Recovery',12,TEXT2,{fw:500}));
  els.push(rect(16,236,W-32,80,CARD,{rx:14}));
  const recData = [{day:'M',v:72},{day:'T',v:65},{day:'W',v:58},{day:'T',v:71},{day:'F',v:80},{day:'S',v:84},{day:'S',v:87}];
  recData.forEach((d,i) => {
    const bx = 38+i*46;
    const bh = (d.v/100)*58;
    const col = d.v>=80?GREEN:d.v>=65?TEAL:CORAL;
    els.push(rect(bx,308-bh,28,bh,col,{rx:6,opacity:0.7}));
    els.push(text(bx+14,314,d.day,9,TEXT2,{anchor:'middle'}));
    els.push(text(bx+14,296-bh,d.v.toString(),9,col,{anchor:'middle',fw:600}));
  });

  // Load vs Recovery
  els.push(text(24,334,'Training Load vs Recovery',12,TEXT2,{fw:500}));
  const loadItems = [
    {day:'Mon',load:62,rec:72},{day:'Tue',load:85,rec:65},{day:'Wed',load:45,rec:58},
    {day:'Thu',load:70,rec:71},{day:'Fri',load:30,rec:80},{day:'Sat',load:40,rec:84},{day:'Sun',load:20,rec:87},
  ];
  loadItems.forEach((li,i) => {
    const y = 352+i*46;
    els.push(rect(16,y,W-32,38,CARD,{rx:8}));
    els.push(text(24,y+24,li.day,11,TEXT2));
    // Load bar
    els.push(rect(72,y+14,(W-32-100)*0.4*(li.load/100),10,CORAL,{rx:4,opacity:0.6}));
    // Recovery bar
    els.push(rect(72,y+26,(W-32-100)*0.4*(li.rec/100),10,GREEN,{rx:4,opacity:0.6}));
    els.push(text(W-24,y+20,li.load+'%',9,CORAL,{anchor:'end'}));
    els.push(text(W-24,y+32,li.rec+'%',9,GREEN,{anchor:'end'}));
  });

  // Legend
  els.push(circle(24,680,5,CORAL,{opacity:0.8}));
  els.push(text(34,684,'Training Load',10,TEXT2));
  els.push(circle(140,680,5,GREEN,{opacity:0.8}));
  els.push(text(150,684,'Recovery',10,TEXT2));

  // Weekly summary
  els.push(rect(16,692,W-32,44,CARD,{rx:12,stroke:GREEN,sw:1}));
  els.push(text(28,710,'Weekly balance: well-recovered.',12,TEXT,{fw:600}));
  els.push(text(28,726,'Load averaged 50% — sustainable for your goals.',11,TEXT2));

  bottomNav('insights').forEach(e=>els.push(e));
  return { name:'Recovery', svg:'', elements: els };
}

// ─── ASSEMBLE ─────────────────────────────────────────────────────────────────
const screens = [
  screenToday(),
  screenHeart(),
  screenSleep(),
  screenHRV(),
  screenInsights(),
  screenRecovery(),
];

let total = 0;
screens.forEach(s => { total += s.elements.length; });

const pen = {
  version: '2.8',
  metadata: {
    name: 'VITALS',
    author: 'RAM',
    date: '2026-04-10',
    theme: 'dark',
    heartbeat: 49,
    elements: total,
  },
  screens,
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`VITALS: ${screens.length} screens, ${total} elements`);
console.log(`Written: ${SLUG}.pen`);
