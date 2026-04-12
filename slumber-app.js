'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'slumber';
const W = 390, H = 844;

// ─── Palette ───────────────────────────────────────────────────────────────
const BG     = '#080C14';   // deep midnight
const SURF   = '#0F1726';   // card surface
const ELEV   = '#162138';   // elevated card
const GLASS  = '#1A2540';   // glassmorphic layer
const ACC    = '#34D399';   // emerald
const ACC2   = '#818CF8';   // soft indigo
const TEXT   = '#E2E8F0';
const MUTED  = '#94A3B8';
const DIM    = '#4A5568';
const WARN   = '#F59E0B';
const PURP   = '#A78BFA';
const TEAL   = '#2DD4BF';

// ─── Primitives ────────────────────────────────────────────────────────────
function rect(x,y,w,h,fill,opts={}) {
  return { type:'rect', x, y, width:w, height:h, fill,
    rx: opts.rx||0, opacity: opts.opacity!=null?opts.opacity:1,
    stroke: opts.stroke||'none', strokeWidth: opts.sw||0 };
}
function text(x,y,content,size,fill,opts={}) {
  return { type:'text', x, y, content, fontSize:size, fill,
    fontWeight: opts.fw||400, fontFamily: opts.font||'Inter, sans-serif',
    textAnchor: opts.anchor||'start', letterSpacing: opts.ls||0,
    opacity: opts.opacity!=null?opts.opacity:1 };
}
function circle(cx,cy,r,fill,opts={}) {
  return { type:'circle', cx, cy, r, fill,
    opacity: opts.opacity!=null?opts.opacity:1,
    stroke: opts.stroke||'none', strokeWidth: opts.sw||0 };
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  return { type:'line', x1, y1, x2, y2, stroke,
    strokeWidth: opts.sw||1, opacity: opts.opacity!=null?opts.opacity:1 };
}
function arc(cx,cy,r,startDeg,endDeg,stroke,sw,opts={}) {
  // Build SVG arc path element
  const toRad = d => (d-90)*Math.PI/180;
  const x1 = cx + r*Math.cos(toRad(startDeg));
  const y1 = cy + r*Math.sin(toRad(startDeg));
  const x2 = cx + r*Math.cos(toRad(endDeg));
  const y2 = cy + r*Math.sin(toRad(endDeg));
  const large = (endDeg - startDeg) > 180 ? 1 : 0;
  return { type:'path',
    d:`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`,
    fill:'none', stroke, strokeWidth:sw,
    strokeLinecap:'round', opacity: opts.opacity||1 };
}
function pill(x,y,w,h,fill,opts={}) {
  return rect(x,y,w,h,fill,{...opts, rx:h/2});
}

// ─── Shared UI Components ──────────────────────────────────────────────────
function statusBar(elements) {
  elements.push(rect(0,0,W,44,BG));
  elements.push(text(20,28,'9:41',13,TEXT,{fw:600}));
  elements.push(text(370,28,'●●●',10,TEXT,{anchor:'end',opacity:0.7}));
}

function navBar(elements, activeIdx) {
  const items = [
    {icon:'◎', label:'Sleep'},
    {icon:'◈', label:'Body'},
    {icon:'✦', label:'AI'},
    {icon:'〜', label:'Trends'},
    {icon:'◉', label:'Profile'},
  ];
  elements.push(rect(0,780,W,64,SURF));
  elements.push(line(0,780,W,780,'rgba(255,255,255,0.06)'));
  items.forEach((item, i) => {
    const x = 39 + i * 78;
    const col = i === activeIdx ? ACC : MUTED;
    elements.push(text(x,808,item.icon,16,col,{anchor:'middle',fw:i===activeIdx?700:400}));
    elements.push(text(x,824,item.label,9,col,{anchor:'middle',fw:i===activeIdx?600:400}));
  });
}

// ─── Aurora gradient blobs (simulated with overlapping translucent circles) ─
function aurora(elements) {
  // Blob 1: purple at top-left
  elements.push(circle(80,200,160,PURP,{opacity:0.07}));
  // Blob 2: teal at right
  elements.push(circle(330,300,140,TEAL,{opacity:0.06}));
  // Blob 3: indigo at bottom
  elements.push(circle(150,620,180,ACC2,{opacity:0.05}));
}

// ─── Screen 1: Sleep Score Dashboard ───────────────────────────────────────
function screen1() {
  const els = [];
  statusBar(els);

  // Background
  els.push(rect(0,0,W,H,BG));
  aurora(els);

  // Date header
  els.push(text(20,70,'Tuesday, Apr 8',13,MUTED,{fw:400}));
  els.push(text(20,95,'Last Night',26,TEXT,{fw:700}));

  // Large sleep score ring (simulated)
  const cx = 195, cy = 270, R = 95;
  // Outer track
  els.push(circle(cx,cy,R,'none',{stroke:'rgba(255,255,255,0.08)',sw:12}));
  // Score arc: 84% = ~302 degrees
  els.push(arc(cx,cy,R,0,302,ACC,12,{opacity:1}));
  // Glow dot at arc end
  const endRad = (302-90)*Math.PI/180;
  const gx = cx + R*Math.cos(endRad);
  const gy = cy + R*Math.sin(endRad);
  els.push(circle(gx,gy,7,ACC,{opacity:0.9}));
  els.push(circle(gx,gy,12,ACC,{opacity:0.3}));

  // Score value
  els.push(text(cx,255,'84',52,TEXT,{fw:800,anchor:'middle'}));
  els.push(text(cx,278,'SLEEP SCORE',9,MUTED,{anchor:'middle',ls:2,fw:600}));

  // Quality badge
  els.push(pill(162,292,66,22,ACC,{opacity:0.15}));
  els.push(text(195,307,'EXCELLENT',9,ACC,{anchor:'middle',fw:700,ls:1}));

  // Sleep time row
  els.push(rect(16,385,358,72,SURF,{rx:14}));
  els.push(line(17,385,373,385,'rgba(255,255,255,0.07)'));

  els.push(text(36,408,'Bedtime',10,MUTED));
  els.push(text(36,428,'10:42 PM',16,TEXT,{fw:700,font:'JetBrains Mono, monospace'}));
  els.push(line(195,398,195,450,DIM,{opacity:0.3}));
  els.push(text(210,408,'Wake',10,MUTED));
  els.push(text(210,428,'6:28 AM',16,TEXT,{fw:700,font:'JetBrains Mono, monospace'}));

  // Duration & efficiency
  els.push(text(36,448,'7h 46m total',11,MUTED));
  els.push(text(210,448,'94% efficient',11,ACC));

  // Mini stage bars
  els.push(text(20,480,'Sleep Stages',12,MUTED,{fw:600}));

  const stages = [
    {label:'Awake', pct:4, col:'rgba(255,255,255,0.25)', mins:'18m'},
    {label:'Light',  pct:28, col:ACC2, mins:'2h 10m'},
    {label:'Deep',   pct:24, col:ACC, mins:'1h 52m'},
    {label:'REM',    pct:44, col:PURP, mins:'3h 26m'},
  ];
  const barW = 350;
  let bx = 20;
  stages.forEach(s => {
    const w = barW * s.pct / 100;
    els.push(rect(bx,496,w,8,s.col,{rx:4}));
    bx += w + 2;
  });

  // Stage legend
  stages.forEach((s,i) => {
    const x = 20 + i*88;
    els.push(circle(x+4,525,4,s.col));
    els.push(text(x+12,529,s.label,9,MUTED));
    els.push(text(x+12,543,s.mins,10,TEXT,{fw:600}));
  });

  // Recovery metrics row
  const metrics = [
    {label:'HRV', value:'62', unit:'ms', icon:'♡'},
    {label:'Resting HR', value:'52', unit:'bpm', icon:'◎'},
    {label:'SpO₂', value:'98', unit:'%', icon:'❄'},
  ];
  metrics.forEach((m,i) => {
    const x = 16 + i*122, y = 565;
    els.push(rect(x,y,114,82,SURF,{rx:12}));
    els.push(text(x+12,y+22,m.icon,14,ACC));
    els.push(text(x+12,y+42,m.value,24,TEXT,{fw:800,font:'JetBrains Mono, monospace'}));
    els.push(text(x+12+20+m.value.length*11,y+42,m.unit,10,MUTED));
    els.push(text(x+12,y+62,m.label,10,MUTED,{fw:500}));
  });

  // CTA
  els.push(rect(16,665,358,52,ACC,{rx:14}));
  els.push(text(195,695,'View Full Analysis →',14,BG,{anchor:'middle',fw:700}));

  navBar(els, 0);
  return els;
}

// ─── Screen 2: Body Metrics (Bento Grid) ───────────────────────────────────
function screen2() {
  const els = [];
  statusBar(els);
  els.push(rect(0,0,W,H,BG));
  aurora(els);

  els.push(text(20,70,'Body Metrics',22,TEXT,{fw:700}));
  els.push(text(20,92,'Last night · Apr 8',12,MUTED));

  // Bento grid layout
  // Big card top-left: HRV
  const hrvCard = {x:16,y:108,w:180,h:160};
  els.push(rect(hrvCard.x,hrvCard.y,hrvCard.w,hrvCard.h,SURF,{rx:14}));
  els.push(circle(hrvCard.x+24,hrvCard.y+30,10,ACC,{opacity:0.15}));
  els.push(text(hrvCard.x+14,hrvCard.y+30,'HRV',10,ACC,{fw:700,ls:1}));
  els.push(text(hrvCard.x+14,hrvCard.y+72,'62',48,TEXT,{fw:800,font:'JetBrains Mono, monospace'}));
  els.push(text(hrvCard.x+14+36,hrvCard.y+72,'ms',13,MUTED));
  els.push(text(hrvCard.x+14,hrvCard.y+95,'Heart Rate Variability',9,MUTED));
  // Mini HRV trend line
  const hrv = [55,58,54,61,60,62,62];
  hrv.forEach((v,i) => {
    if(i>0) {
      const x1=hrvCard.x+14+(i-1)*24, y1=hrvCard.y+130-(hrv[i-1]-50)*1.5;
      const x2=hrvCard.x+14+i*24, y2=hrvCard.y+130-(v-50)*1.5;
      els.push(line(x1,y1,x2,y2,ACC,{sw:2}));
    }
    els.push(circle(hrvCard.x+14+i*24,hrvCard.y+130-(v-50)*1.5,2.5,ACC));
  });
  els.push(text(hrvCard.x+14,hrvCard.y+152,'↑ 8ms vs avg',10,ACC));

  // Top-right: Resting HR
  const hrCard = {x:204,y:108,w:170,h:76};
  els.push(rect(hrCard.x,hrCard.y,hrCard.w,hrCard.h,SURF,{rx:14}));
  els.push(text(hrCard.x+14,hrCard.y+22,'♡  Resting HR',10,MUTED));
  els.push(text(hrCard.x+14,hrCard.y+50,'52',30,TEXT,{fw:800,font:'JetBrains Mono, monospace'}));
  els.push(text(hrCard.x+14+22,hrCard.y+50,'bpm',11,MUTED));
  els.push(pill(hrCard.x+hrCard.w-66,hrCard.y+16,56,20,'rgba(52,211,153,0.15)'));
  els.push(text(hrCard.x+hrCard.w-38,hrCard.y+29,'Optimal',8,ACC,{anchor:'middle',fw:600}));
  els.push(text(hrCard.x+14,hrCard.y+68,'Normal range 45–70',9,MUTED));

  // Mid-right: SpO₂
  const spo2Card = {x:204,y:192,w:170,h:76};
  els.push(rect(spo2Card.x,spo2Card.y,spo2Card.w,spo2Card.h,SURF,{rx:14}));
  els.push(text(spo2Card.x+14,spo2Card.y+22,'❄  Blood Oxygen',10,MUTED));
  els.push(text(spo2Card.x+14,spo2Card.y+50,'98',30,TEXT,{fw:800,font:'JetBrains Mono, monospace'}));
  els.push(text(spo2Card.x+14+22,spo2Card.y+50,'%',11,MUTED));
  els.push(text(spo2Card.x+14,spo2Card.y+68,'SpO₂ stable all night',9,MUTED));

  // Wide card: Breathing Rate
  const brCard = {x:16,y:276,w:358,h:80};
  els.push(rect(brCard.x,brCard.y,brCard.w,brCard.h,SURF,{rx:14}));
  els.push(text(brCard.x+14,brCard.y+24,'Breathing Rate',11,MUTED));
  els.push(text(brCard.x+14,brCard.y+55,'14.2',28,TEXT,{fw:800,font:'JetBrains Mono, monospace'}));
  els.push(text(brCard.x+14+30,brCard.y+55,'breaths/min',11,MUTED));
  // Breathing wave
  const bw = [14,14.5,13.8,14.2,14.0,14.3,14.2,14.1,14.4,14.2];
  bw.forEach((v,i) => {
    if(i>0) {
      const x1=brCard.x+180+(i-1)*18, y1=brCard.y+50-(bw[i-1]-13.5)*18;
      const x2=brCard.x+180+i*18, y2=brCard.y+50-(v-13.5)*18;
      els.push(line(x1,y1,x2,y2,TEAL,{sw:2,opacity:0.8}));
    }
  });
  els.push(text(brCard.x+14,brCard.y+72,'Normal range 12–20',9,MUTED));

  // Body Temp
  const tempCard = {x:16,y:364,w:170,h:80};
  els.push(rect(tempCard.x,tempCard.y,tempCard.w,tempCard.h,SURF,{rx:14}));
  els.push(text(tempCard.x+14,tempCard.y+22,'Skin Temp',10,MUTED));
  els.push(text(tempCard.x+14,tempCard.y+50,'+0.3',28,TEXT,{fw:800,font:'JetBrains Mono, monospace'}));
  els.push(text(tempCard.x+14+22,tempCard.y+50,'°C',11,MUTED));
  els.push(text(tempCard.x+14,tempCard.y+70,'vs your baseline',9,MUTED));

  // Movement
  const movCard = {x:204,y:364,w:170,h:80};
  els.push(rect(movCard.x,movCard.y,movCard.w,movCard.h,SURF,{rx:14}));
  els.push(text(movCard.x+14,movCard.y+22,'Movement',10,MUTED));
  els.push(text(movCard.x+14,movCard.y+50,'3',28,TEXT,{fw:800,font:'JetBrains Mono, monospace'}));
  els.push(text(movCard.x+14+10,movCard.y+50,'disturbances',11,MUTED));
  els.push(text(movCard.x+14,movCard.y+70,'Below your average',9,MUTED));

  // Recovery score
  els.push(rect(16,452,358,90,ELEV,{rx:14}));
  // subtle border
  els.push(rect(16,452,358,90,'none',{rx:14,stroke:'rgba(52,211,153,0.2)',sw:1}));
  els.push(text(30,474,'Overall Recovery',12,MUTED,{fw:600}));
  els.push(text(30,508,'91',36,TEXT,{fw:800,font:'JetBrains Mono, monospace'}));
  els.push(text(30+26,508,'/ 100',14,MUTED));
  // Recovery bar
  els.push(rect(30,524,298,6,'rgba(255,255,255,0.1)',{rx:3}));
  els.push(rect(30,524,298*0.91,6,ACC,{rx:3}));
  els.push(pill(30,538,80,16,'rgba(52,211,153,0.12)'));
  els.push(text(70,549,'Ready to train',8,ACC,{anchor:'middle',fw:600}));

  // Smart alarm
  els.push(rect(16,550,358,60,SURF,{rx:14}));
  els.push(text(30,572,'Smart Alarm',12,TEXT,{fw:600}));
  els.push(text(30,590,'6:28 AM — caught during light sleep',11,MUTED));
  // toggle
  els.push(rect(320,560,34,18,ACC,{rx:9}));
  els.push(circle(343,569,7,'#fff'));

  // Noise
  els.push(rect(16,618,358,60,SURF,{rx:14}));
  els.push(text(30,640,'Noise Events',12,TEXT,{fw:600}));
  els.push(text(30,658,'0 disturbances detected',11,MUTED));
  els.push(pill(320,628,46,20,'rgba(52,211,153,0.15)'));
  els.push(text(343,641,'Quiet',8,ACC,{anchor:'middle',fw:600}));

  navBar(els, 1);
  return els;
}

// ─── Screen 3: AI Insights ──────────────────────────────────────────────────
function screen3() {
  const els = [];
  statusBar(els);
  els.push(rect(0,0,W,H,BG));

  // Aurora blobs — stronger on this screen to echo AI feel
  els.push(circle(80,180,200,ACC2,{opacity:0.1}));
  els.push(circle(310,420,160,ACC,{opacity:0.07}));
  els.push(circle(60,600,140,PURP,{opacity:0.06}));

  els.push(text(20,70,'AI Insights',22,TEXT,{fw:700}));
  els.push(text(20,92,'Based on last night',12,MUTED));

  // AI summary card — glassmorphic
  els.push(rect(16,110,358,140,GLASS,{rx:16}));
  els.push(rect(16,110,358,140,'none',{rx:16,stroke:'rgba(129,140,248,0.2)',sw:1}));
  // AI icon
  els.push(circle(42,134,12,ACC2,{opacity:0.2}));
  els.push(text(42,138,'✦',10,ACC2,{anchor:'middle'}));
  els.push(text(60,130,'SLUMBER AI',9,ACC2,{fw:700,ls:1.5}));
  els.push(text(60,146,'Generated · just now',9,MUTED));
  els.push(text(28,172,'Your sleep was exceptional tonight. Your REM',12,TEXT,{opacity:0.9}));
  els.push(text(28,190,'duration hit a 30-day high, and your HRV of 62ms',12,TEXT,{opacity:0.9}));
  els.push(text(28,208,'signals strong autonomic recovery. You\'re ready',12,TEXT,{opacity:0.9}));
  els.push(text(28,226,'for a high-intensity training session today.',12,TEXT,{opacity:0.9}));

  // Three action cards
  const actions = [
    {
      icon:'◈', title:'Train Hard Today', tag:'PERFORMANCE',
      col: ACC, tagBg:'rgba(52,211,153,0.12)',
      body:'Your recovery metrics support high-intensity training. Ideal window: 10am–2pm.',
    },
    {
      icon:'◎', title:'Maintain Bedtime', tag:'CONSISTENCY',
      col: PURP, tagBg:'rgba(167,139,250,0.12)',
      body:'10:42 PM is your optimal bedtime. Staying consistent will strengthen your circadian rhythm.',
    },
    {
      icon:'❄', title:'Hydrate Early', tag:'WELLNESS',
      col: TEAL, tagBg:'rgba(45,212,191,0.12)',
      body:'Slight skin temp rise detected. Drink 500ml water within the first hour of waking.',
    },
  ];

  actions.forEach((a,i) => {
    const y = 260 + i*140;
    els.push(rect(16,y,358,128,SURF,{rx:14}));
    // Color accent left bar
    els.push(rect(16,y,3,128,a.col,{rx:2}));
    // Tag
    els.push(pill(36,y+14,70,18,a.tagBg));
    els.push(text(71,y+26,a.tag,7,a.col,{anchor:'middle',fw:700,ls:1}));
    // Icon
    els.push(circle(352,y+24,14,a.col,{opacity:0.12}));
    els.push(text(352,y+28,a.icon,12,a.col,{anchor:'middle'}));
    // Title
    els.push(text(36,y+52,a.title,15,TEXT,{fw:700}));
    // Body
    const words = a.body;
    els.push(text(36,y+72,words.slice(0,44),11,MUTED));
    els.push(text(36,y+88,words.slice(44,88),11,MUTED));
    els.push(text(36,y+104,words.slice(88),11,MUTED));
  });

  navBar(els, 2);
  return els;
}

// ─── Screen 4: Trends ───────────────────────────────────────────────────────
function screen4() {
  const els = [];
  statusBar(els);
  els.push(rect(0,0,W,H,BG));
  aurora(els);

  els.push(text(20,70,'Trends',22,TEXT,{fw:700}));

  // Period selector
  const periods = ['7D','30D','90D','1Y'];
  els.push(rect(16,84,230,30,SURF,{rx:15}));
  periods.forEach((p,i) => {
    if(i===0) {
      els.push(pill(20,87,48,24,ACC,{opacity:0.9}));
      els.push(text(44,103,p,11,BG,{anchor:'middle',fw:700}));
    } else {
      els.push(text(20+60+i*54,103,p,11,MUTED,{anchor:'middle'}));
    }
  });

  // Average score callout
  els.push(text(20,136,'7-day average',11,MUTED));
  els.push(text(20,162,'79',32,TEXT,{fw:800,font:'JetBrains Mono, monospace'}));
  els.push(text(60,162,'/ 100',13,MUTED));
  els.push(pill(110,148,68,20,'rgba(52,211,153,0.15)'));
  els.push(text(144,161,'↑ 5 pts',9,ACC,{anchor:'middle',fw:700}));

  // Sleep score bar chart (7 days)
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const scores = [74,68,72,80,76,77,84];
  const maxH = 120;
  const barW2 = 36, gap = 12, startX = 24;

  days.forEach((d,i) => {
    const x = startX + i*(barW2+gap);
    const bh = (scores[i]/100)*maxH;
    const by = 300 - bh;

    // Background track
    els.push(rect(x,300-maxH,barW2,maxH,'rgba(255,255,255,0.05)',{rx:6}));

    // Score gradient bar — 3 layered rects to simulate gradient
    const stageColors = [PURP,ACC,ACC2];
    const heights = [bh*0.44,bh*0.24,bh*0.28]; // REM, Deep, Light
    let cy2 = by;
    heights.forEach((sh,si) => {
      els.push(rect(x,cy2,barW2,sh,stageColors[si],{rx:si===0?6:0,opacity:0.85}));
      cy2 += sh;
    });

    // Score label
    const isToday = i===6;
    els.push(text(x+barW2/2,by-8,String(scores[i]),11,isToday?ACC:TEXT,{anchor:'middle',fw:isToday?700:500}));
    els.push(text(x+barW2/2,318,d,9,MUTED,{anchor:'middle'}));

    // Today marker
    if(isToday) {
      els.push(circle(x+barW2/2,325,2.5,ACC));
    }
  });

  // Legend
  const legend = [{col:PURP,label:'REM'},{col:ACC,label:'Deep'},{col:ACC2,label:'Light'}];
  legend.forEach((l,i) => {
    const lx = 20 + i*90;
    els.push(circle(lx+4,342,4,l.col));
    els.push(text(lx+14,346,l.label,10,MUTED));
  });

  // Weekly summary
  els.push(text(20,368,'Weekly Insights',13,TEXT,{fw:700}));

  const summaries = [
    {label:'Best night', val:'84', sub:'Sunday · Apr 8'},
    {label:'Worst night', val:'68', sub:'Tuesday · Apr 2'},
    {label:'Avg REM', val:'3h 12m', sub:'Recommended 3h+'},
    {label:'Avg Deep', val:'1h 44m', sub:'Recommended 1.5–2h'},
  ];
  summaries.forEach((s,i) => {
    const row = Math.floor(i/2), col = i%2;
    const x = 16 + col*182, y = 388 + row*72;
    els.push(rect(x,y,172,60,SURF,{rx:12}));
    els.push(text(x+12,y+22,s.label,10,MUTED));
    els.push(text(x+12,y+44,s.val,18,TEXT,{fw:700,font:'JetBrains Mono, monospace'}));
    els.push(text(x+12,y+58,s.sub,9,MUTED));
  });

  // Streak
  els.push(rect(16,534,358,64,ELEV,{rx:14}));
  els.push(rect(16,534,358,64,'none',{rx:14,stroke:'rgba(52,211,153,0.15)',sw:1}));
  els.push(text(30,558,'🔥 Sleep Streak',13,TEXT,{fw:600}));
  els.push(text(30,576,'12 nights · 75+ score — personal best!',11,MUTED));
  els.push(text(354,558,'12',22,ACC,{anchor:'end',fw:800,font:'JetBrains Mono, monospace'}));

  // Circadian chart
  els.push(text(20,616,'Circadian Rhythm',13,TEXT,{fw:700}));
  els.push(text(20,632,'Bedtime consistency over 7 days',11,MUTED));
  // Bedtime dots on timeline
  const bedtimes = [22.7, 23.0, 22.9, 22.6, 23.1, 23.3, 22.7];
  const timeStart=21, timeEnd=24.5, tW=350;
  // Timeline axis
  els.push(line(20,680,370,680,'rgba(255,255,255,0.1)'));
  ['9PM','10PM','11PM','Mid'].forEach((t,i) => {
    const tx = 20 + (i*3/3.5)*tW/3;
    els.push(text(tx,694,t,8,MUTED,{anchor:'middle'}));
  });
  bedtimes.forEach((bt,i) => {
    const tx = 20 + ((bt-timeStart)/(timeEnd-timeStart))*350;
    els.push(circle(tx,680,5,i===6?ACC:PURP,{opacity:i===6?1:0.6}));
    els.push(text(tx,670,days[i],7,MUTED,{anchor:'middle'}));
  });
  // Ideal window indicator
  els.push(rect(20+((22.5-timeStart)/(timeEnd-timeStart))*350,672,
    ((0.5)/(timeEnd-timeStart))*350,16,ACC,{rx:3,opacity:0.15}));

  navBar(els, 3);
  return els;
}

// ─── Screen 5: Sleep Goals / Profile ────────────────────────────────────────
function screen5() {
  const els = [];
  statusBar(els);
  els.push(rect(0,0,W,H,BG));
  aurora(els);

  // Avatar area
  els.push(circle(195,110,46,SURF));
  els.push(circle(195,110,46,'none',{stroke:ACC,sw:2,opacity:0.5}));
  els.push(text(195,118,'J',24,TEXT,{anchor:'middle',fw:700}));
  els.push(text(195,148,'Jordan',16,TEXT,{fw:600,anchor:'middle'}));
  els.push(text(195,166,'Premium · Day 34',11,MUTED,{anchor:'middle'}));

  // Level badge
  els.push(pill(154,178,82,22,ACC,{opacity:0.15}));
  els.push(text(195,193,'✦  Sleep Expert',10,ACC,{anchor:'middle',fw:600}));

  // Stats strip
  els.push(rect(16,210,358,64,SURF,{rx:14}));
  const pstats = [
    {label:'Avg Score',val:'79'},
    {label:'Best Sleep',val:'91'},
    {label:'Streak',val:'12d'},
  ];
  pstats.forEach((s,i) => {
    const x = 60 + i*112;
    els.push(text(x,234,s.val,20,TEXT,{anchor:'middle',fw:800,font:'JetBrains Mono, monospace'}));
    els.push(text(x,252,s.label,9,MUTED,{anchor:'middle'}));
    if(i<2) els.push(line(x+56,222,x+56,262,DIM,{opacity:0.4}));
  });

  // Sleep Goals
  els.push(text(20,292,'Sleep Goals',14,TEXT,{fw:700}));

  const goals = [
    {label:'Target duration', val:'8h 00m', progress:0.97, col:ACC},
    {label:'Bedtime', val:'10:30 PM', progress:0.92, col:PURP},
    {label:'REM target', val:'3h 30m', progress:0.91, col:ACC2},
    {label:'HRV goal', val:'65 ms', progress:0.95, col:TEAL},
  ];
  goals.forEach((g,i) => {
    const y = 312 + i*66;
    els.push(rect(16,y,358,56,SURF,{rx:12}));
    els.push(text(28,y+22,g.label,11,MUTED));
    els.push(text(362,y+22,g.val,12,TEXT,{anchor:'end',fw:600}));
    els.push(rect(28,y+34,302,5,'rgba(255,255,255,0.08)',{rx:3}));
    els.push(rect(28,y+34,302*g.progress,5,g.col,{rx:3}));
    const pct = Math.round(g.progress*100);
    els.push(text(362,y+40,pct+'%',10,g.col,{anchor:'end',fw:600}));
  });

  // Connected Devices
  els.push(text(20,580,'Devices',14,TEXT,{fw:700}));
  const devices = [
    {name:'Apple Watch Ultra 2', status:'Connected', icon:'◉'},
    {name:'Oura Ring Gen 4', status:'Connected', icon:'◎'},
  ];
  devices.forEach((d,i) => {
    const y = 600 + i*58;
    els.push(rect(16,y,358,50,SURF,{rx:12}));
    els.push(circle(38,y+25,12,ACC,{opacity:0.15}));
    els.push(text(38,y+29,d.icon,10,ACC,{anchor:'middle'}));
    els.push(text(56,y+22,d.name,12,TEXT,{fw:600}));
    els.push(pill(56,y+32,62,14,'rgba(52,211,153,0.12)'));
    els.push(text(87,y+42,d.status,8,ACC,{anchor:'middle',fw:600}));
    els.push(text(362,y+28,'›',16,MUTED,{anchor:'end'}));
  });

  // Notification prefs
  els.push(rect(16,718,358,50,SURF,{rx:12}));
  els.push(text(28,740,'Smart Alarm & Notifications',12,TEXT,{fw:600}));
  els.push(text(28,756,'Wind-down 30m before target bedtime',10,MUTED));
  els.push(rect(326,726,34,18,ACC,{rx:9}));
  els.push(circle(349,735,7,'#fff'));

  navBar(els, 3);
  return els;
}

// ─── Screen 6: Sleep Log Detail ─────────────────────────────────────────────
function screen6() {
  const els = [];
  statusBar(els);
  els.push(rect(0,0,W,H,BG));
  aurora(els);

  // Back nav
  els.push(text(20,70,'‹',20,MUTED));
  els.push(text(195,72,'Sleep Analysis',14,TEXT,{anchor:'middle',fw:700}));
  els.push(text(370,70,'Share',12,ACC,{anchor:'end',fw:600}));

  // Night detail header
  els.push(text(195,98,'Tuesday, Apr 8',11,MUTED,{anchor:'middle'}));
  els.push(rect(16,110,358,60,SURF,{rx:14}));
  els.push(text(28,136,'Asleep',10,MUTED));
  els.push(text(28,152,'10:42 PM',14,TEXT,{fw:700,font:'JetBrains Mono, monospace'}));
  els.push(line(195,120,195,162,'rgba(255,255,255,0.1)'));
  els.push(text(210,136,'Awake',10,MUTED));
  els.push(text(210,152,'6:28 AM',14,TEXT,{fw:700,font:'JetBrains Mono, monospace'}));
  els.push(text(354,136,'Total',10,MUTED,{anchor:'end'}));
  els.push(text(354,152,'7h 46m',14,TEXT,{fw:700,font:'JetBrains Mono, monospace',anchor:'end'}));

  // Hypnogram (sleep stages timeline)
  els.push(text(20,190,'Hypnogram',12,TEXT,{fw:700}));
  els.push(text(20,206,'Sleep stage progression across the night',10,MUTED));

  // Y-axis labels
  const stageLabels = ['Awake','REM','Light','Deep'];
  const yPositions = [250,270,290,310];
  stageLabels.forEach((sl,i) => {
    els.push(text(16,yPositions[i]+4,sl,8,MUTED,{anchor:'start'}));
  });

  // Hypnogram segments (simplified)
  const segments = [
    {stage:2,start:0,end:0.08},   // Light sleep
    {stage:3,start:0.08,end:0.2}, // Deep
    {stage:1,start:0.2,end:0.3},  // REM
    {stage:2,start:0.3,end:0.38}, // Light
    {stage:3,start:0.38,end:0.5}, // Deep
    {stage:1,start:0.5,end:0.65}, // REM
    {stage:2,start:0.65,end:0.72},// Light
    {stage:1,start:0.72,end:0.88},// REM
    {stage:0,start:0.88,end:0.92},// Awake brief
    {stage:1,start:0.92,end:1.0}, // REM
  ];
  const hypW=306, hypX=60;
  const stageY = [248,268,288,308];
  const stageCols=[WARN,PURP,ACC2,ACC];
  segments.forEach(seg => {
    const x = hypX + seg.start*hypW;
    const w = (seg.end-seg.start)*hypW;
    const y = stageY[seg.stage];
    els.push(rect(x,y,w,14,stageCols[seg.stage],{rx:2,opacity:0.85}));
  });

  // Time axis
  ['10P','12A','2A','4A','6A'].forEach((t,i) => {
    const tx = hypX + i*(hypW/4);
    els.push(line(tx,248,tx,324,'rgba(255,255,255,0.05)',{sw:1}));
    els.push(text(tx,334,t,8,MUTED,{anchor:'middle'}));
  });

  // Cycles
  els.push(text(20,352,'Sleep Cycles',12,TEXT,{fw:700}));
  els.push(text(20,368,'5 complete cycles detected',10,MUTED));

  const cycles = [
    {n:1,dur:'88m',deep:'28m',rem:'12m'},
    {n:2,dur:'92m',deep:'24m',rem:'22m'},
    {n:3,dur:'96m',deep:'14m',rem:'34m'},
    {n:4,dur:'100m',deep:'6m',rem:'48m'},
    {n:5,dur:'50m',deep:'0m',rem:'42m'},
  ];
  cycles.forEach((c,i) => {
    const y = 380 + i*56;
    els.push(rect(16,y,358,48,SURF,{rx:10}));
    els.push(circle(38,y+24,14,SURF));
    els.push(text(38,y+28,String(c.n),11,TEXT,{anchor:'middle',fw:700}));
    els.push(text(60,y+20,`Cycle ${c.n}`,12,TEXT,{fw:600}));
    els.push(text(60,y+36,`${c.dur} · ${c.deep} deep · ${c.rem} REM`,10,MUTED));
    // mini bar
    const barTotal=parseInt(c.dur), dPct=parseInt(c.deep)/barTotal, rPct=parseInt(c.rem)/barTotal;
    const bx=220, bw2=120;
    els.push(rect(bx,y+18,bw2,10,'rgba(255,255,255,0.06)',{rx:5}));
    els.push(rect(bx,y+18,bw2*dPct,10,ACC,{rx:3}));
    els.push(rect(bx+bw2*dPct,y+18,bw2*rPct,10,PURP,{rx:3}));
  });

  navBar(els, 0);
  return els;
}

// ─── Assemble pen ───────────────────────────────────────────────────────────
const screens = [
  { name:'Sleep Score', elements: screen1() },
  { name:'Body Metrics', elements: screen2() },
  { name:'AI Insights', elements: screen3() },
  { name:'Trends', elements: screen4() },
  { name:'Profile', elements: screen5() },
  { name:'Sleep Analysis', elements: screen6() },
];

const totalEls = screens.reduce((s,sc)=>s+sc.elements.length,0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'SLUMBER — AI Sleep & Recovery',
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'dark',
    heartbeat: 42,
    elements: totalEls,
    slug: SLUG,
    palette: { bg:BG, surface:SURF, accent:ACC, accent2:ACC2, text:TEXT, muted:MUTED },
    inspiration: 'Glassmorphism revival (DarkModeDesign), ambient aurora backgrounds (Godly), AI health/wellness category rise (Saaspo)',
  },
  screens,
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`SLUMBER: ${screens.length} screens, ${totalEls} elements`);
console.log(`Written: ${SLUG}.pen`);
