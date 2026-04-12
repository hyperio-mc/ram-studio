'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'lumen';
const NAME = 'LUMEN';
const TAGLINE = 'precision for deep work';
const HB = 19;
const W = 390, H = 844;

// Palette
const BG     = '#F8F7F4';
const SURF   = '#FFFFFF';
const CARD   = '#F2F0EB';
const TEXT   = '#1C1A18';
const ACC    = '#E85D04';
const ACC2   = '#502BD8';
const MUTED  = 'rgba(28,26,24,0.42)';
const MUTED2 = 'rgba(28,26,24,0.18)';
const ERR    = '#DC2626';
const SUC    = '#16A34A';

// Element helpers
function rect(x,y,w,h,fill,opts={}) {
  return { type:'rect', x, y, w, h, fill, rx:opts.rx||0, opacity:opts.opacity||1, stroke:opts.stroke||'none', sw:opts.sw||1 };
}
function text(x,y,content,size,fill,opts={}) {
  return { type:'text', x, y, content, size, fill, fw:opts.fw||400, font:opts.font||'Inter', anchor:opts.anchor||'start', ls:opts.ls||0, opacity:opts.opacity||1 };
}
function circle(cx,cy,r,fill,opts={}) {
  return { type:'circle', cx, cy, r, fill, opacity:opts.opacity||1, stroke:opts.stroke||'none', sw:opts.sw||1 };
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  return { type:'line', x1, y1, x2, y2, stroke, sw:opts.sw||1, opacity:opts.opacity||1 };
}

const screens = [];

// SCREEN 1: TODAY
(function buildToday() {
  const e = [];
  e.push(rect(0,0,W,H,BG));
  e.push(text(20,52,'9:41',13,MUTED,{fw:500}));
  e.push(text(370,52,'●●●',13,MUTED,{anchor:'end'}));
  e.push(text(20,88,'Today',26,TEXT,{fw:700}));
  e.push(text(20,112,'Wednesday · Apr 9',13,MUTED));
  e.push(rect(290,72,80,28,ACC2,{rx:14,opacity:0.1}));
  e.push(text(330,91,'Focus 84%',11,ACC2,{fw:600,anchor:'middle'}));
  e.push(line(20,128,370,128,MUTED2,{sw:1}));
  e.push(rect(16,140,358,108,SURF,{rx:12}));
  e.push(rect(16,140,358,108,'none',{rx:12,stroke:MUTED2,sw:1}));
  e.push(rect(16,140,4,108,ACC,{rx:2}));
  e.push(text(36,162,'Next Session',11,MUTED,{fw:600}));
  e.push(text(36,184,'Deep Work: Design System',16,TEXT,{fw:600}));
  e.push(text(36,204,'25 min · Starts in 12 minutes',12,MUTED));
  e.push(rect(36,220,80,24,ACC,{rx:12}));
  e.push(text(76,236,'Start Now',11,SURF,{fw:600,anchor:'middle'}));
  e.push(rect(126,220,70,24,CARD,{rx:12}));
  e.push(text(161,236,'Edit',11,TEXT,{fw:500,anchor:'middle'}));
  e.push(rect(16,260,170,152,SURF,{rx:12}));
  e.push(rect(16,260,170,152,'none',{rx:12,stroke:MUTED2,sw:1}));
  e.push(text(101,280,'Goal',11,MUTED,{fw:500,anchor:'middle'}));
  e.push(circle(101,336,44,BG,{stroke:MUTED2,sw:6}));
  e.push(circle(101,336,44,BG,{stroke:ACC,sw:6,opacity:0.9}));
  e.push(text(101,332,'3.2h',18,TEXT,{fw:700,anchor:'middle'}));
  e.push(text(101,350,'of 4h',12,MUTED,{anchor:'middle'}));
  e.push(text(101,400,'72%',13,ACC,{fw:700,anchor:'middle'}));
  e.push(rect(202,260,172,72,SURF,{rx:12}));
  e.push(rect(202,260,172,72,'none',{rx:12,stroke:MUTED2,sw:1}));
  e.push(text(288,282,'Sessions',11,MUTED,{fw:500,anchor:'middle'}));
  e.push(text(288,312,'6',28,TEXT,{fw:700,anchor:'middle'}));
  e.push(rect(202,340,172,72,SURF,{rx:12}));
  e.push(rect(202,340,172,72,'none',{rx:12,stroke:MUTED2,sw:1}));
  e.push(text(288,362,'Streak',11,MUTED,{fw:500,anchor:'middle'}));
  e.push(text(288,388,'14',28,TEXT,{fw:700,anchor:'middle'}));
  e.push(text(288,400,'days',11,MUTED,{anchor:'middle'}));
  e.push(text(20,428,'Recent Sessions',13,MUTED,{fw:600}));
  const sessions = [
    {proj:'Design System', dur:'32 min', score:'91', col:ACC2},
    {proj:'Email Drafts', dur:'18 min', score:'76', col:SUC},
    {proj:'Research', dur:'45 min', score:'88', col:ACC},
    {proj:'Code Review', dur:'25 min', score:'82', col:ACC2},
  ];
  sessions.forEach((s,i) => {
    const y = 448 + i*56;
    e.push(rect(16,y,358,48,SURF,{rx:10}));
    e.push(rect(16,y,358,48,'none',{rx:10,stroke:MUTED2,sw:1}));
    e.push(circle(42,y+24,10,s.col,{opacity:0.15}));
    e.push(circle(42,y+24,5,s.col));
    e.push(text(62,y+18,s.proj,14,TEXT,{fw:500}));
    e.push(text(62,y+33,s.dur,11,MUTED));
    e.push(rect(320,y+14,36,20,CARD,{rx:10}));
    e.push(text(338,y+28,s.score,11,TEXT,{fw:600,anchor:'middle'}));
  });
  e.push(rect(0,780,W,64,SURF));
  e.push(line(0,780,W,780,MUTED2,{sw:1}));
  const navItems = [{label:'Today',x:48},{label:'Timer',x:136},{label:'Stats',x:224},{label:'Projects',x:312}];
  navItems.forEach((n,i) => {
    const active = i===0;
    e.push(circle(n.x,806,18,active?ACC:'none',{opacity:active?0.1:0}));
    e.push(circle(n.x,806,4,active?ACC:MUTED,{opacity:active?1:0.5}));
    e.push(text(n.x,828,n.label,10,active?ACC:MUTED,{fw:active?600:400,anchor:'middle'}));
  });
  screens.push({ name:'Today', svg:'', elements:e });
})();

// SCREEN 2: TIMER
(function buildTimer() {
  const e = [];
  e.push(rect(0,0,W,H,BG));
  e.push(text(20,52,'9:53',13,MUTED,{fw:500}));
  e.push(text(370,52,'●●●',13,MUTED,{anchor:'end'}));
  e.push(text(20,90,'←',18,TEXT));
  e.push(text(195,90,'Focus Session',16,TEXT,{fw:600,anchor:'middle'}));
  e.push(rect(130,108,130,28,ACC2,{rx:14,opacity:0.1}));
  e.push(text(195,126,'Design System',12,ACC2,{fw:600,anchor:'middle'}));
  e.push(rect(32,156,326,260,SURF,{rx:16}));
  e.push(rect(32,156,326,260,'none',{rx:16,stroke:MUTED2,sw:1}));
  for(let i=0;i<12;i++) {
    const angle = (i/12)*Math.PI*2 - Math.PI/2;
    const r1=116, r2=i%3===0?106:110;
    const cx=195, cy=286;
    const x1=cx+Math.cos(angle)*r1, y1=cy+Math.sin(angle)*r1;
    const x2=cx+Math.cos(angle)*r2, y2=cy+Math.sin(angle)*r2;
    e.push(line(x1,y1,x2,y2,i%3===0?TEXT:MUTED2,{sw:i%3===0?1.5:1,opacity:i%3===0?0.5:0.3}));
  }
  e.push(circle(195,286,108,BG,{stroke:MUTED2,sw:3}));
  e.push(circle(195,286,108,BG,{stroke:ACC,sw:3,opacity:0.9}));
  e.push(circle(195,286,88,BG,{stroke:MUTED2,sw:1}));
  e.push(text(195,278,'18:32',44,TEXT,{fw:700,anchor:'middle'}));
  e.push(text(195,300,'remaining',12,MUTED,{anchor:'middle'}));
  e.push(text(195,378,'elapsed',10,MUTED,{fw:500,anchor:'middle'}));
  e.push(rect(75,390,240,4,MUTED2,{rx:2}));
  e.push(rect(75,390,150,4,ACC,{rx:2}));
  e.push(line(32,430,358,430,MUTED2,{sw:1}));
  [{label:'Elapsed',val:'6:28'},{label:'Sessions',val:'3'},{label:'Target',val:'25m'}].forEach((item,i)=>{
    const x = 75+i*120;
    e.push(text(x,452,item.val,16,TEXT,{fw:700,anchor:'middle'}));
    e.push(text(x,468,item.label,10,MUTED,{anchor:'middle'}));
    if(i<2) e.push(line(x+60,436,x+60,472,MUTED2,{sw:1}));
  });
  e.push(circle(195,560,44,ACC));
  e.push(text(195,568,'pause',14,SURF,{anchor:'middle',fw:600}));
  e.push(circle(105,560,30,CARD));
  e.push(text(105,568,'reset',11,MUTED,{anchor:'middle'}));
  e.push(circle(285,560,30,CARD));
  e.push(text(285,568,'done',11,TEXT,{anchor:'middle'}));
  e.push(rect(20,624,350,60,SURF,{rx:12}));
  e.push(rect(20,624,350,60,'none',{rx:12,stroke:MUTED2,sw:1}));
  e.push(text(36,649,'Add a focus note...',14,MUTED,{opacity:0.7}));
  e.push(text(36,667,'What are you working on?',12,MUTED,{opacity:0.5}));
  e.push(rect(20,700,165,52,SURF,{rx:12}));
  e.push(rect(20,700,165,52,'none',{rx:12,stroke:MUTED2,sw:1}));
  e.push(text(103,720,'Distractions',10,MUTED,{fw:500,anchor:'middle'}));
  e.push(text(103,742,'2',18,ERR,{fw:700,anchor:'middle'}));
  e.push(rect(205,700,165,52,SURF,{rx:12}));
  e.push(rect(205,700,165,52,'none',{rx:12,stroke:MUTED2,sw:1}));
  e.push(text(288,720,'Depth',10,MUTED,{fw:500,anchor:'middle'}));
  e.push(text(288,742,'Deep',18,SUC,{fw:700,anchor:'middle'}));
  e.push(rect(0,780,W,64,SURF));
  e.push(line(0,780,W,780,MUTED2,{sw:1}));
  [{label:'Today',x:48},{label:'Timer',x:136},{label:'Stats',x:224},{label:'Projects',x:312}].forEach((n,i)=>{
    const active=i===1;
    e.push(circle(n.x,806,18,active?ACC:'none',{opacity:active?0.1:0}));
    e.push(circle(n.x,806,4,active?ACC:MUTED,{opacity:active?1:0.5}));
    e.push(text(n.x,828,n.label,10,active?ACC:MUTED,{fw:active?600:400,anchor:'middle'}));
  });
  screens.push({name:'Timer',svg:'',elements:e});
})();

// SCREEN 3: SESSION REVIEW
(function buildReview() {
  const e = [];
  e.push(rect(0,0,W,H,BG));
  e.push(text(20,52,'10:18',13,MUTED,{fw:500}));
  e.push(text(195,90,'Session Complete',18,TEXT,{fw:700,anchor:'middle'}));
  e.push(text(195,112,'Design System · 25 min',13,MUTED,{anchor:'middle'}));
  e.push(rect(32,130,326,120,SURF,{rx:16}));
  e.push(rect(32,130,326,120,'none',{rx:16,stroke:MUTED2,sw:1}));
  e.push(rect(32,130,326,4,ACC,{rx:2}));
  e.push(text(195,168,'Focus Score',12,MUTED,{fw:600,anchor:'middle'}));
  e.push(text(195,218,'92',52,ACC,{fw:800,anchor:'middle'}));
  e.push(text(195,242,'/100',16,MUTED,{anchor:'middle'}));
  const metrics = [
    {label:'Duration',val:'25:00',icon:'[T]'},
    {label:'Depth',val:'Deep',icon:'[D]'},
    {label:'Distractions',val:'1',icon:'[!]'},
    {label:'Streak',val:'15 days',icon:'[S]'},
  ];
  metrics.forEach((m,i) => {
    const col=i%2, row=Math.floor(i/2);
    const x=16+col*187, y=264+row*80;
    e.push(rect(x,y,179,72,SURF,{rx:12}));
    e.push(rect(x,y,179,72,'none',{rx:12,stroke:MUTED2,sw:1}));
    e.push(text(x+16,y+22,m.icon,11,MUTED));
    e.push(text(x+52,y+22,m.label,11,MUTED,{fw:500}));
    e.push(text(x+16,y+50,m.val,18,TEXT,{fw:700}));
  });
  e.push(rect(16,428,358,100,SURF,{rx:12}));
  e.push(rect(16,428,358,100,'none',{rx:12,stroke:MUTED2,sw:1}));
  e.push(text(32,450,'Session Notes',12,MUTED,{fw:600}));
  e.push(text(32,474,'Completed wireframes for nav component.',14,TEXT));
  e.push(text(32,494,'Good flow, minimal context switching.',14,MUTED));
  e.push(text(32,514,'Blocked on color token naming convention.',14,MUTED,{opacity:0.7}));
  e.push(rect(16,540,358,80,CARD,{rx:12}));
  e.push(text(32,562,'Daily Progress',12,MUTED,{fw:600}));
  e.push(rect(32,578,256,8,MUTED2,{rx:4}));
  e.push(rect(32,578,196,8,ACC,{rx:4}));
  e.push(text(32,604,'3.2h of 4h goal',13,TEXT,{fw:500}));
  e.push(text(369,604,'80%',13,ACC,{fw:700,anchor:'end'}));
  e.push(rect(16,636,170,52,ACC,{rx:12}));
  e.push(text(101,667,'New Session',14,SURF,{fw:600,anchor:'middle'}));
  e.push(rect(204,636,170,52,CARD,{rx:12}));
  e.push(text(289,667,'Take a Break',14,TEXT,{fw:500,anchor:'middle'}));
  e.push(rect(16,702,358,52,SURF,{rx:12}));
  e.push(rect(16,702,358,52,'none',{rx:12,stroke:MUTED2,sw:1}));
  e.push(text(32,722,'Next suggested',11,MUTED,{fw:500}));
  e.push(text(32,742,'15-min break · then 45-min deep work',13,TEXT,{fw:500}));
  e.push(text(369,732,'>',18,ACC,{anchor:'end'}));
  e.push(rect(0,780,W,64,SURF));
  e.push(line(0,780,W,780,MUTED2,{sw:1}));
  [{label:'Today',x:48},{label:'Timer',x:136},{label:'Stats',x:224},{label:'Projects',x:312}].forEach((n,i)=>{
    e.push(circle(n.x,806,4,MUTED,{opacity:0.5}));
    e.push(text(n.x,828,n.label,10,MUTED,{fw:400,anchor:'middle'}));
  });
  screens.push({name:'Session Review',svg:'',elements:e});
})();

// SCREEN 4: STATS
(function buildStats() {
  const e = [];
  e.push(rect(0,0,W,H,BG));
  e.push(text(20,52,'9:41',13,MUTED,{fw:500}));
  e.push(text(20,88,'Stats',26,TEXT,{fw:700}));
  e.push(text(20,112,'This Week',13,MUTED));
  [{label:'Day',active:false},{label:'Week',active:true},{label:'Month',active:false},{label:'Year',active:false}].forEach((p,i)=>{
    const px=180+i*52;
    if(p.active) e.push(rect(px-2,70,48,26,ACC,{rx:13}));
    e.push(text(px+22,88,p.label,11,p.active?SURF:MUTED,{fw:p.active?600:400,anchor:'middle'}));
  });
  e.push(line(20,128,370,128,MUTED2,{sw:1}));
  e.push(rect(16,140,358,180,SURF,{rx:12}));
  e.push(rect(16,140,358,180,'none',{rx:12,stroke:MUTED2,sw:1}));
  e.push(text(32,160,'Focus Hours',12,MUTED,{fw:600}));
  e.push(text(369,160,'22.4h',14,TEXT,{fw:700,anchor:'end'}));
  const days = ['M','T','W','T','F','S','S'];
  const vals = [3.2,4.1,2.8,3.8,4.2,2.0,1.2];
  const maxV = 5;
  days.forEach((d,i) => {
    const bx=42+i*44, bh=Math.round((vals[i]/maxV)*100), by=290-bh;
    const isToday=i===2;
    e.push(rect(bx,by,28,bh,isToday?ACC:ACC2,{rx:6,opacity:isToday?1:0.6}));
    e.push(text(bx+14,307,d,10,MUTED,{anchor:'middle'}));
    if(isToday) e.push(text(bx+14,by-8,vals[i].toString(),10,ACC,{fw:600,anchor:'middle'}));
  });
  e.push(line(32,252,370,252,ACC,{sw:1,opacity:0.3}));
  e.push(text(372,256,'avg',9,ACC,{opacity:0.7}));
  e.push(rect(16,332,358,136,SURF,{rx:12}));
  e.push(rect(16,332,358,136,'none',{rx:12,stroke:MUTED2,sw:1}));
  e.push(text(32,352,'Streak Calendar',12,MUTED,{fw:600}));
  e.push(text(369,352,'15 days',13,ACC,{fw:700,anchor:'end'}));
  for(let row=0;row<4;row++) {
    for(let col=0;col<7;col++) {
      const dx=42+col*46, dy=372+row*22;
      const filled = row*7+col < 22;
      const isToday = row===3&&col===2;
      e.push(rect(dx-8,dy-8,16,16,filled?ACC:MUTED2,{rx:3,opacity:filled?(isToday?1:0.7):0.2}));
    }
  }
  e.push(rect(16,480,358,100,SURF,{rx:12}));
  e.push(rect(16,480,358,100,'none',{rx:12,stroke:MUTED2,sw:1}));
  e.push(text(32,500,'Top Projects',12,MUTED,{fw:600}));
  [{name:'Design System',hrs:'8.4h',pct:84,col:ACC2},{name:'Engineering',hrs:'6.2h',pct:62,col:ACC},{name:'Research',hrs:'4.1h',pct:41,col:SUC}].forEach((p,i)=>{
    const py=518+i*22;
    e.push(text(32,py,p.name,12,TEXT,{fw:500}));
    e.push(text(369,py,p.hrs,12,TEXT,{fw:600,anchor:'end'}));
    e.push(rect(32,py+4,260,4,MUTED2,{rx:2}));
    e.push(rect(32,py+4,Math.round(260*p.pct/100),4,p.col,{rx:2}));
  });
  e.push(rect(16,592,170,108,SURF,{rx:12}));
  e.push(rect(16,592,170,108,'none',{rx:12,stroke:MUTED2,sw:1}));
  e.push(text(101,614,'Avg Focus',11,MUTED,{fw:500,anchor:'middle'}));
  e.push(text(101,654,'87',32,TEXT,{fw:800,anchor:'middle'}));
  e.push(text(101,672,'/100',12,MUTED,{anchor:'middle'}));
  e.push(text(101,692,'+3 vs last wk',10,SUC,{anchor:'middle'}));
  e.push(rect(204,592,170,108,SURF,{rx:12}));
  e.push(rect(204,592,170,108,'none',{rx:12,stroke:MUTED2,sw:1}));
  e.push(text(289,614,'Best Time',11,MUTED,{fw:500,anchor:'middle'}));
  e.push(text(289,654,'9-11am',18,TEXT,{fw:700,anchor:'middle'}));
  e.push(text(289,672,'Morning',12,MUTED,{anchor:'middle'}));
  e.push(text(289,692,'Peak Performance',10,ACC,{fw:600,anchor:'middle'}));
  e.push(rect(0,780,W,64,SURF));
  e.push(line(0,780,W,780,MUTED2,{sw:1}));
  [{label:'Today',x:48},{label:'Timer',x:136},{label:'Stats',x:224},{label:'Projects',x:312}].forEach((n,i)=>{
    const active=i===2;
    e.push(circle(n.x,806,18,active?ACC:'none',{opacity:active?0.1:0}));
    e.push(circle(n.x,806,4,active?ACC:MUTED,{opacity:active?1:0.5}));
    e.push(text(n.x,828,n.label,10,active?ACC:MUTED,{fw:active?600:400,anchor:'middle'}));
  });
  screens.push({name:'Stats',svg:'',elements:e});
})();

// SCREEN 5: PROJECTS
(function buildProjects() {
  const e = [];
  e.push(rect(0,0,W,H,BG));
  e.push(text(20,52,'9:41',13,MUTED,{fw:500}));
  e.push(text(20,88,'Projects',26,TEXT,{fw:700}));
  e.push(rect(310,72,60,30,ACC,{rx:15}));
  e.push(text(340,91,'+ New',12,SURF,{fw:600,anchor:'middle'}));
  e.push(line(20,108,370,108,MUTED2,{sw:1}));
  const projects = [
    {name:'Design System',total:'24.6h',sessions:18,goal:30,col:ACC2},
    {name:'Engineering Sprint',total:'18.2h',sessions:14,goal:20,col:ACC},
    {name:'Research & Discovery',total:'11.8h',sessions:9,goal:15,col:SUC},
    {name:'Stakeholder Comms',total:'5.4h',sessions:6,goal:8,col:'#6B7280'},
    {name:'Personal Learning',total:'8.1h',sessions:12,goal:10,col:ACC2},
  ];
  projects.forEach((p,i) => {
    const py=120+i*124;
    e.push(rect(16,py,358,116,SURF,{rx:12}));
    e.push(rect(16,py,358,116,'none',{rx:12,stroke:MUTED2,sw:1}));
    e.push(rect(16,py,4,116,p.col,{rx:2}));
    e.push(text(36,py+22,p.name,15,TEXT,{fw:600}));
    e.push(text(369,py+22,p.sessions+' sessions',11,MUTED,{anchor:'end'}));
    e.push(text(36,py+46,p.total,22,TEXT,{fw:700}));
    e.push(text(100,py+46,'focused',11,MUTED));
    const pct = Math.min(Math.round((parseFloat(p.total)/p.goal)*100),100);
    const ovr = pct>=100;
    e.push(rect(36,py+64,284,6,MUTED2,{rx:3}));
    e.push(rect(36,py+64,Math.round(284*(pct/100)),6,ovr?SUC:p.col,{rx:3}));
    e.push(text(36,py+86,'Goal: '+p.goal+'h',11,MUTED));
    e.push(text(320,py+86,pct+'%',11,ovr?SUC:TEXT,{fw:600,anchor:'end'}));
    if(ovr) e.push(text(340,py+86,'v',11,SUC,{fw:700}));
  });
  e.push(rect(0,780,W,64,SURF));
  e.push(line(0,780,W,780,MUTED2,{sw:1}));
  [{label:'Today',x:48},{label:'Timer',x:136},{label:'Stats',x:224},{label:'Projects',x:312}].forEach((n,i)=>{
    const active=i===3;
    e.push(circle(n.x,806,18,active?ACC:'none',{opacity:active?0.1:0}));
    e.push(circle(n.x,806,4,active?ACC:MUTED,{opacity:active?1:0.5}));
    e.push(text(n.x,828,n.label,10,active?ACC:MUTED,{fw:active?600:400,anchor:'middle'}));
  });
  screens.push({name:'Projects',svg:'',elements:e});
})();

// SCREEN 6: PROFILE
(function buildProfile() {
  const e = [];
  e.push(rect(0,0,W,H,BG));
  e.push(text(20,52,'9:41',13,MUTED,{fw:500}));
  e.push(text(195,88,'Profile',18,TEXT,{fw:700,anchor:'middle'}));
  e.push(text(369,88,'[settings]',11,MUTED,{anchor:'end'}));
  e.push(circle(195,158,50,ACC,{opacity:0.15}));
  e.push(circle(195,158,40,ACC,{opacity:0.3}));
  e.push(text(195,166,'JD',22,ACC,{fw:700,anchor:'middle'}));
  e.push(text(195,218,'Jordan Davis',18,TEXT,{fw:700,anchor:'middle'}));
  e.push(text(195,240,'Senior Designer · 94-day user',12,MUTED,{anchor:'middle'}));
  e.push(rect(82,256,100,26,ACC2,{rx:13,opacity:0.1}));
  e.push(text(132,273,'Early Adopter',11,ACC2,{fw:500,anchor:'middle'}));
  e.push(rect(194,256,100,26,ACC,{rx:13,opacity:0.1}));
  e.push(text(244,273,'Streak Master',11,ACC,{fw:500,anchor:'middle'}));
  e.push(line(20,294,370,294,MUTED2,{sw:1}));
  [{val:'247h',label:'Total Focus'},{val:'412',label:'Sessions'},{val:'15',label:'Day Streak'}].forEach((s,i)=>{
    const x=65+i*130;
    e.push(text(x,322,s.val,20,TEXT,{fw:700,anchor:'middle'}));
    e.push(text(x,340,s.label,10,MUTED,{anchor:'middle'}));
    if(i<2) e.push(line(x+65,300,x+65,348,MUTED2,{sw:1}));
  });
  e.push(line(20,354,370,354,MUTED2,{sw:1}));
  const settings = [
    {section:'Focus', items:['Default session length','Break reminders','Focus sounds']},
    {section:'Notifications', items:['Session start/end','Daily goal reached','Weekly report']},
  ];
  let sy=370;
  settings.forEach(sec=>{
    e.push(text(20,sy+16,sec.section,12,MUTED,{fw:700}));
    sy+=32;
    e.push(rect(16,sy,358,sec.items.length*52,SURF,{rx:12}));
    e.push(rect(16,sy,358,sec.items.length*52,'none',{rx:12,stroke:MUTED2,sw:1}));
    sec.items.forEach((item,i)=>{
      const iy=sy+i*52;
      if(i>0) e.push(line(36,iy,358,iy,MUTED2,{sw:1}));
      e.push(text(32,iy+28,item,14,TEXT,{fw:400}));
      e.push(text(369,iy+28,'>',16,MUTED,{anchor:'end'}));
    });
    sy+=sec.items.length*52+16;
  });
  e.push(rect(16,sy,358,48,SURF,{rx:12}));
  e.push(rect(16,sy,358,48,'none',{rx:12,stroke:MUTED2,sw:1}));
  e.push(text(195,sy+28,'Sign Out',14,ERR,{fw:500,anchor:'middle'}));
  e.push(rect(0,780,W,64,SURF));
  e.push(line(0,780,W,780,MUTED2,{sw:1}));
  [{label:'Today',x:48},{label:'Timer',x:136},{label:'Stats',x:224},{label:'Projects',x:312}].forEach((n,i)=>{
    e.push(circle(n.x,806,4,MUTED,{opacity:0.5}));
    e.push(text(n.x,828,n.label,10,MUTED,{fw:400,anchor:'middle'}));
  });
  screens.push({name:'Profile',svg:'',elements:e});
})();

// ASSEMBLE + WRITE
const total = screens.reduce((a,s)=>a+s.elements.length,0);
const pen = {
  version:'2.8',
  metadata:{ name:NAME, author:'RAM', date:new Date().toISOString(), theme:'light', heartbeat:HB, elements:total, slug:SLUG, tagline:TAGLINE },
  screens
};
fs.writeFileSync(path.join(__dirname,`${SLUG}.pen`), JSON.stringify(pen,null,2));
console.log(`${NAME}: ${screens.length} screens, ${total} elements`);
console.log(`Written: ${SLUG}.pen`);
