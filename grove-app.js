'use strict';
// grove-app.js — Heartbeat #13 (LIGHT)
// GROVE — Deep Work Session Tracker
// "Deep work, by design."
// Inspired by: Sandbar (minimal.gallery) — warm cream bg #FAF8F0, near-black text,
//              clean Messina Sans-style sans-serif, extremely minimal editorial UI.
//              Also: editorial focus-block Gantt aesthetic from JetBrains Air (lapa.ninja)
// Palette: Warm cream #F9F7EF + near-black #111008 + sage green #4A7C59 + warm amber #C4874A

const fs   = require('fs');
const path = require('path');

// ── Pencil.dev v2.8 primitives
const elements = [];
let eid = 1;
function el(type, props) { elements.push({ id: `e${eid++}`, type, ...props }); }
function rect(x,y,w,h,fill,opts={}) {
  el('rect',{x,y,width:w,height:h,fill,
    rx:opts.rx??0,ry:opts.ry??0,
    opacity:opts.opacity??1,stroke:opts.stroke??'none',
    strokeWidth:opts.sw??0});
}
function text(x,y,content,size,fill,opts={}) {
  el('text',{x,y,content:String(content),fontSize:size,fill,
    fontWeight:opts.fw??400,fontFamily:opts.font??'Inter',
    textAnchor:opts.anchor??'start',opacity:opts.opacity??1,
    letterSpacing:opts.ls??0});
}
function circle(cx,cy,r,fill,opts={}) {
  el('circle',{cx,cy,r,fill,opacity:opts.opacity??1,
    stroke:opts.stroke??'none',strokeWidth:opts.sw??0});
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  el('line',{x1,y1,x2,y2,stroke,strokeWidth:opts.sw??1,opacity:opts.opacity??1});
}

// ── Palette
const P = {
  BG:       '#F9F7EF',
  SURF:     '#F2EFE4',
  CARD:     '#FFFFFF',
  CARD2:    '#EEE9DA',
  BORDER:   '#E0DAC8',
  BORDER2:  '#D0C9B4',
  SAGE:     '#4A7C59',
  SAGE2:    '#3A6347',
  SAGE3:    '#A8C5B2',
  AMBER:    '#C4874A',
  AMBER2:   '#9E6234',
  AMBER3:   '#E8C49A',
  ROSE:     '#C4564A',
  TEXT:     '#111008',
  TEXT2:    '#5C574A',
  TEXT3:    '#9E9A8E',
};

const W = 390, H = 844;

function statusBar(bg) {
  bg = bg || P.BG;
  rect(0,0,W,44,bg);
  text(20,28,'9:41',13,P.TEXT2,{fw:500,font:'Inter'});
  text(340,28,'●●●',12,P.TEXT3);
}
function bottomNav(active) {
  var navH = 82;
  rect(0,H-navH,W,navH,P.BG);
  line(0,H-navH,W,H-navH,P.BORDER,{sw:1});
  var items = [
    { icon:'⌂', label:'Today', id:0 },
    { icon:'◉', label:'Focus',  id:1 },
    { icon:'≡', label:'Log',    id:2 },
    { icon:'◈', label:'Review', id:3 },
    { icon:'⊙', label:'You',    id:4 },
  ];
  var iw = W / items.length;
  items.forEach(function(item, i) {
    var x = i * iw + iw/2;
    var isActive = i === active;
    var col = isActive ? P.SAGE : P.TEXT3;
    text(x, H-navH+26, item.icon, 18, col, {anchor:'middle'});
    text(x, H-navH+45, item.label, 10, col, {anchor:'middle', fw: isActive?600:400});
    if(isActive) {
      rect(x-16, H-navH-1, 32, 2, P.SAGE, {rx:1});
    }
  });
}

var screens = [];

// ─── SCREEN 1: Today's Focus Plan ────────────────────────────────────────────
{
  elements.length = 0; eid = 1;
  rect(0,0,W,H,P.BG);
  statusBar();

  rect(0,44,W,64,P.BG);
  text(20,74,'Today',22,P.TEXT,{fw:700,font:'Georgia'});
  text(20,92,'Tuesday, April 8',12,P.TEXT3);
  rect(W-116,55,100,32,P.CARD2,{rx:16});
  text(W-66,75,'6h 30m left',10,P.TEXT2,{anchor:'middle',fw:500});
  line(0,108,W,108,P.BORDER,{sw:1});

  // Energy bar
  rect(20,120,350,4,P.BORDER,{rx:2});
  rect(20,120,220,4,P.SAGE,{rx:2});
  text(20,143,'Energy',10,P.TEXT3,{fw:500,ls:0.5});
  text(W-20,143,'63%',10,P.SAGE,{anchor:'end',fw:600});

  text(20,168,'Focus Blocks',13,P.TEXT,{fw:600});
  text(W-20,168,'+ Add',12,P.SAGE,{anchor:'end',fw:500});

  var blocks = [
    { label:'Deep work — Product spec', time:'7:00–8:30',  pct:1.0, col:P.SAGE,  tag:'Work',     done:true  },
    { label:'Research — Competitor UX', time:'9:00–10:30', pct:1.0, col:P.SAGE,  tag:'Research', done:true  },
    { label:'Writing — Quarterly OKRs', time:'11:00–12:00',pct:0.4, col:P.AMBER, tag:'Writing',  done:false },
    { label:'Code review — API layer',  time:'2:00–3:30',  pct:0.0, col:P.TEXT3, tag:'Dev',      done:false },
    { label:'1:1 with team',            time:'4:00–4:30',  pct:0.0, col:P.TEXT3, tag:'Meeting',  done:false },
  ];

  var by = 182;
  blocks.forEach(function(b) {
    var bh = 52;
    var bg2 = b.done ? '#F5F3EC' : P.CARD;
    rect(20, by, 350, bh, bg2, {rx:10, stroke:P.BORDER, sw:1});
    rect(20, by, 4, bh, b.done ? P.SAGE3 : (b.pct>0 ? b.col : P.BORDER2), {rx:2});
    if(b.pct > 0) {
      rect(24, by+bh-6, 326, 4, P.BORDER, {rx:2, opacity:0.5});
      rect(24, by+bh-6, Math.round(326*b.pct), 4, b.col, {rx:2});
    }
    var doneMark = b.done ? '✓' : '○';
    var markCol  = b.done ? P.SAGE : P.TEXT3;
    circle(42, by+22, 9, b.done ? P.SAGE3 : P.BORDER, {stroke:b.done?P.SAGE:P.BORDER2, sw:1.5});
    text(42, by+26, doneMark, 9, markCol, {anchor:'middle', fw:700});
    text(56, by+20, b.label, 11, b.done?P.TEXT3:P.TEXT, {fw:b.done?400:500});
    text(56, by+36, b.time, 10, P.TEXT3);
    rect(W-66, by+12, 44, 18, b.done?P.CARD2:P.SURF, {rx:9});
    text(W-44, by+24, b.tag, 9, P.TEXT3, {anchor:'middle',fw:500});
    by += bh + 8;
  });

  by += 4;
  rect(20, by, 350, 58, P.CARD, {rx:12, stroke:P.BORDER, sw:1});
  var stats = [
    {label:'FOCUSED',   val:'2h 45m', col:P.SAGE},
    {label:'REMAINING', val:'3h 45m', col:P.AMBER},
    {label:'STREAK',    val:'12 days',col:P.TEXT},
  ];
  stats.forEach(function(s,i) {
    var sx = 20 + i * Math.round(350/3) + Math.round(350/3)/2;
    text(sx, by+24, s.val, 14, s.col, {anchor:'middle',fw:700});
    text(sx, by+41, s.label, 8, P.TEXT3, {anchor:'middle',fw:600,ls:0.8});
    if(i < 2) line(20 + (i+1)*Math.round(350/3), by+14, 20+(i+1)*Math.round(350/3), by+44, P.BORDER, {sw:1});
  });

  bottomNav(0);
  screens.push({ name:'Today', elements:[...elements] });
}

// ─── SCREEN 2: Active Focus Session ──────────────────────────────────────────
{
  elements.length = 0; eid = 1;
  rect(0,0,W,H,P.BG);
  statusBar();

  rect(0,44,W,56,P.BG);
  text(20,74,'Focus Session',16,P.TEXT,{fw:600});
  text(W-20,74,'End',14,P.ROSE,{anchor:'end',fw:500});
  line(0,100,W,100,P.BORDER,{sw:1});

  text(W/2,130,'Writing — Quarterly OKRs',12,P.TEXT2,{anchor:'middle'});
  rect(W/2-28,140,56,20,P.SAGE3,{rx:10});
  text(W/2,154,'Writing',10,P.SAGE2,{anchor:'middle',fw:600});

  var cx = W/2, cy = 320;
  circle(cx,cy,118,'none',{stroke:P.BORDER,sw:12});
  circle(cx,cy,118,'none',{stroke:P.SAGE3,sw:12});
  circle(cx,cy,118,'none',{stroke:P.SAGE,sw:4,opacity:0.9});
  circle(cx,cy,100,P.CARD,{stroke:P.BORDER,sw:1});

  text(cx,cy-12,'37:22',42,P.TEXT,{anchor:'middle',fw:300,font:'Georgia'});
  text(cx,cy+18,'remaining',12,P.TEXT3,{anchor:'middle'});

  for(var i=0;i<36;i++) {
    var angle = (i/36)*Math.PI*2 - Math.PI/2;
    var r1=128, r2=134;
    var x1=cx+r1*Math.cos(angle), y1=cy+r1*Math.sin(angle);
    var x2=cx+r2*Math.cos(angle), y2=cy+r2*Math.sin(angle);
    var isDone = i <= 22;
    line(x1,y1,x2,y2, isDone?P.SAGE:P.BORDER, {sw:isDone?2:1.5,opacity:isDone?0.8:0.5});
  }

  text(cx,cy+52,'Phase 2 of 3  ·  Session 40 min',10,P.TEXT3,{anchor:'middle'});

  var ctrlY = cy+88;
  rect(W/2-64,ctrlY,128,48,P.SAGE,{rx:24});
  text(W/2,ctrlY+28,'⏸  Pause',14,P.CARD,{anchor:'middle',fw:600});
  rect(W/2+80,ctrlY+4,72,40,'none',{stroke:P.BORDER,rx:20,sw:1.5});
  text(W/2+116,ctrlY+28,'Skip →',12,P.TEXT2,{anchor:'middle',fw:500});
  rect(W/2-152,ctrlY+4,68,40,'none',{stroke:P.BORDER,rx:20,sw:1.5});
  text(W/2-118,ctrlY+28,'+5 min',12,P.TEXT2,{anchor:'middle',fw:500});

  var icy = ctrlY + 72;
  rect(20,icy,350,80,P.CARD,{rx:14,stroke:P.BORDER,sw:1});
  text(36,icy+24,'Session Goal',11,P.TEXT3,{fw:500});
  text(36,icy+46,'Draft Eng OKRs for Q2 — delivery velocity',12,P.TEXT);
  text(36,icy+64,'and reliability metrics',12,P.TEXT2);

  var erow = icy + 92;
  rect(20,erow,168,48,P.SURF,{rx:12,stroke:P.BORDER,sw:1});
  text(36,erow+20,'Ambient',10,P.TEXT3,{fw:500});
  text(36,erow+38,'☁  Lo-fi Rain',12,P.TEXT,{fw:500});
  rect(202,erow,168,48,P.SURF,{rx:12,stroke:P.BORDER,sw:1});
  text(218,erow+20,'Do Not Disturb',10,P.TEXT3,{fw:500});
  text(218,erow+38,'⊘  Active',12,P.SAGE,{fw:600});

  var prow = erow + 64;
  text(20,prow,'Today\'s pace',11,P.TEXT3,{fw:500});
  text(W-20,prow,'On track',11,P.SAGE,{anchor:'end',fw:500});
  rect(20,prow+10,350,6,P.BORDER,{rx:3});
  rect(20,prow+10,218,6,P.SAGE,{rx:3});

  bottomNav(1);
  screens.push({ name:'Active Session', elements:[...elements] });
}

// ─── SCREEN 3: Session Log ────────────────────────────────────────────────────
{
  elements.length = 0; eid = 1;
  rect(0,0,W,H,P.BG);
  statusBar();

  rect(0,44,W,56,P.BG);
  text(20,74,'Session Log',18,P.TEXT,{fw:700,font:'Georgia'});
  text(W-20,74,'⊡  Filter',12,P.TEXT3,{anchor:'end'});
  line(0,100,W,100,P.BORDER,{sw:1});

  // Week mini bar chart
  rect(20,112,350,52,P.CARD,{rx:12,stroke:P.BORDER,sw:1});
  var wk = [{d:'M',h:3.5},{d:'T',h:4.0},{d:'W',h:2.8},{d:'T',h:5.2},{d:'F',h:0},{d:'S',h:1.5},{d:'S',h:0}];
  var barW=30, gap=10, startX=28, maxH=5.5, barMaxH=30;
  wk.forEach(function(day,i) {
    var x = startX + i*(barW+gap);
    var bh2 = Math.round((day.h/maxH)*barMaxH);
    var isToday = i===1;
    rect(x,112+52-8-bh2,barW,bh2, isToday?P.SAGE:(day.h>0?P.SAGE3:P.BORDER),{rx:4});
    text(x+barW/2,112+52-4,day.d,8,isToday?P.SAGE:P.TEXT3,{anchor:'middle',fw:isToday?700:400});
  });
  text(W-36,128,'15h',14,P.TEXT,{anchor:'end',fw:700});
  text(W-36,146,'this week',10,P.TEXT3,{anchor:'end'});

  text(20,182,'Today',11,P.TEXT3,{fw:600,ls:1});
  line(0,194,W,194,P.BORDER,{sw:0.5});

  var sessions = [
    {label:'Writing — Quarterly OKRs', dur:'23 min', time:'11:02',tag:'Writing',col:P.AMBER,note:'Drafted intro section',score:'●●●●○'},
    {label:'Research — Competitor UX', dur:'1h 32m', time:'9:00', tag:'Research',col:P.SAGE, note:'Analyzed 4 products',  score:'●●●●●'},
    {label:'Deep work — Product spec', dur:'1h 28m', time:'7:04', tag:'Work',    col:P.SAGE, note:'Finished v1.2 spec doc',score:'●●●●●'},
  ];

  var sy = 202;
  sessions.forEach(function(s) {
    var sh = 74;
    rect(20,sy,350,sh,P.CARD,{rx:12,stroke:P.BORDER,sw:1});
    rect(20,sy,4,sh,s.col,{rx:2});
    text(34,sy+20,s.label,12,P.TEXT,{fw:500});
    rect(W-74,sy+8,50,18,P.SURF,{rx:9});
    text(W-49,sy+20,s.tag,9,P.TEXT3,{anchor:'middle',fw:500});
    text(34,sy+38,s.note,11,P.TEXT3);
    text(34,sy+58,s.score,10,s.col,{ls:2});
    text(W-36,sy+38,s.dur,12,P.TEXT,{anchor:'end',fw:600});
    text(W-36,sy+58,s.time,10,P.TEXT3,{anchor:'end'});
    sy += sh + 8;
  });

  text(20,sy+8,'Yesterday',11,P.TEXT3,{fw:600,ls:1});
  line(0,sy+20,W,sy+20,P.BORDER,{sw:0.5});
  sy += 28;

  var yest = [
    {label:'Code review — API layer',dur:'2h 01m',time:'3:00',tag:'Dev',    col:P.SAGE, note:'Reviewed 3 PRs',     score:'●●●●○'},
    {label:'Writing — Blog draft',   dur:'1h 15m',time:'9:30',tag:'Writing',col:P.AMBER,note:'First draft outline', score:'●●●○○'},
  ];
  yest.forEach(function(s) {
    var sh = 74;
    rect(20,sy,350,sh,'#F7F5EC',{rx:12,stroke:P.BORDER,sw:1});
    rect(20,sy,4,sh,P.TEXT3,{rx:2});
    text(34,sy+20,s.label,12,P.TEXT2,{fw:500});
    rect(W-74,sy+8,50,18,P.SURF,{rx:9});
    text(W-49,sy+20,s.tag,9,P.TEXT3,{anchor:'middle',fw:500});
    text(34,sy+38,s.note,11,P.TEXT3);
    text(34,sy+58,s.score,10,P.TEXT3,{ls:2});
    text(W-36,sy+38,s.dur,12,P.TEXT2,{anchor:'end',fw:600});
    text(W-36,sy+58,s.time,10,P.TEXT3,{anchor:'end'});
    sy += sh + 8;
  });

  bottomNav(2);
  screens.push({ name:'Session Log', elements:[...elements] });
}

// ─── SCREEN 4: Weekly Review ──────────────────────────────────────────────────
{
  elements.length = 0; eid = 1;
  rect(0,0,W,H,P.BG);
  statusBar();

  rect(0,44,W,62,P.BG);
  text(20,72,'Weekly Review',20,P.TEXT,{fw:700,font:'Georgia'});
  text(20,90,'Apr 1 – 8, 2026',12,P.TEXT3);
  rect(W-80,55,64,26,P.SAGE,{rx:13});
  text(W-48,72,'Week 14',9,P.CARD,{anchor:'middle',fw:600,ls:0.3});
  line(0,106,W,106,P.BORDER,{sw:1});

  rect(20,118,350,78,P.CARD,{rx:16,stroke:P.BORDER,sw:1});
  text(W/2,152,'15h 42m',34,P.TEXT,{anchor:'middle',fw:300,font:'Georgia'});
  text(W/2,174,'deep work this week',12,P.TEXT3,{anchor:'middle'});
  rect(W/2-46,182,92,20,P.SAGE3,{rx:10});
  text(W/2,195,'↑ 18% vs last week',9,P.SAGE2,{anchor:'middle',fw:600});

  text(20,216,'by category',11,P.TEXT3,{fw:600,ls:0.8});

  var cats = [
    {label:'Work',     h:7.2, col:P.SAGE },
    {label:'Research', h:4.5, col:P.AMBER},
    {label:'Writing',  h:2.8, col:P.ROSE },
    {label:'Dev',      h:1.2, col:P.TEXT2},
  ];
  var cbh = 100, cbMaxH = 70, cbW = 68;
  rect(20,228,350,cbh+20,P.CARD,{rx:14,stroke:P.BORDER,sw:1});
  var maxCat = Math.max.apply(null,cats.map(function(c){return c.h;}));
  cats.forEach(function(c,i) {
    var x = 30 + i*(cbW+16);
    var bh3 = Math.round((c.h/maxCat)*cbMaxH);
    rect(x,228+8,cbW,cbh,P.SURF,{rx:8});
    rect(x,228+8+cbh-bh3,cbW,bh3,c.col,{rx:8,opacity:0.9});
    text(x+cbW/2,228+cbh+4,c.h+'h',11,P.TEXT,{anchor:'middle',fw:600});
    text(x+cbW/2,228+cbh+20,c.label,9,P.TEXT3,{anchor:'middle'});
  });

  var rowy = 228+cbh+40;
  rect(20,rowy,165,90,P.CARD,{rx:14,stroke:P.BORDER,sw:1});
  circle(75,rowy+44,30,'none',{stroke:P.BORDER,sw:8});
  circle(75,rowy+44,30,'none',{stroke:P.SAGE,sw:8,opacity:0.85});
  text(75,rowy+48,'87',14,P.TEXT,{anchor:'middle',fw:700});
  text(75,rowy+64,'Focus Score',9,P.TEXT3,{anchor:'middle'});

  rect(197,rowy,173,90,P.CARD,{rx:14,stroke:P.BORDER,sw:1});
  text(W/2+35,rowy+32,'12',26,P.AMBER,{anchor:'middle',fw:700,font:'Georgia'});
  text(W/2+35,rowy+52,'Best streak',10,P.TEXT3,{anchor:'middle'});
  text(W/2+35,rowy+68,'Current: 5 days',11,P.TEXT2,{anchor:'middle',fw:500});

  var irow = rowy + 104;
  text(20,irow,'Insights',13,P.TEXT,{fw:600});
  var insights = [
    {icon:'◎',text:'Best focus: Tuesday mornings (avg 2h 10m)',col:P.SAGE},
    {icon:'◑',text:'Writing sessions have lowest completion rate',col:P.AMBER},
    {icon:'◐',text:'You focus 40% more in the morning',col:P.TEXT2},
  ];
  insights.forEach(function(ins,i) {
    var iy = irow+16 + i*40;
    rect(20,iy,350,34,P.CARD,{rx:10,stroke:P.BORDER,sw:1});
    circle(40,iy+17,10,P.SURF,{stroke:P.BORDER,sw:1});
    text(40,iy+21,ins.icon,10,ins.col,{anchor:'middle'});
    text(58,iy+21,ins.text,10,P.TEXT);
  });

  var nrow = irow + 16 + insights.length*40 + 8;
  rect(20,nrow,350,50,P.SAGE,{rx:14});
  text(36,nrow+20,'Set next week\'s intention →',13,P.CARD,{fw:600});
  text(36,nrow+38,'Plan your grove for Apr 9–15',11,'rgba(255,255,255,0.7)');

  bottomNav(3);
  screens.push({ name:'Weekly Review', elements:[...elements] });
}

// ─── SCREEN 5: Set Intention (Onboarding/Morning) ────────────────────────────
{
  elements.length = 0; eid = 1;
  rect(0,0,W,H,P.BG);
  statusBar();
  rect(0,44,W,H-44,P.BG);

  text(20,90,'Good morning,',14,P.TEXT3);
  text(20,120,'What will you',32,P.TEXT,{fw:300,font:'Georgia'});
  text(20,155,'grow today?',32,P.SAGE,{fw:700,font:'Georgia'});

  circle(W-60,112,40,P.SAGE3,{opacity:0.25});
  circle(W-60,112,30,'none',{stroke:P.SAGE3,sw:1.5,opacity:0.5});
  circle(W-60,112,20,P.SAGE3,{opacity:0.15});
  text(W-60,118,'✦',16,P.SAGE,{anchor:'middle',opacity:0.6});

  line(0,178,W,178,P.BORDER,{sw:1});

  text(20,200,'Today\'s intention',11,P.TEXT3,{fw:600,ls:0.8});
  rect(20,212,350,64,P.CARD,{rx:12,stroke:P.SAGE,sw:1.5});
  text(34,240,'Finish the API spec and review with',12,P.TEXT);
  text(34,258,'the team before 3pm.',12,P.TEXT);
  text(34,274,'_',13,P.SAGE,{fw:600,opacity:0.6});

  text(20,298,'Focus duration',11,P.TEXT3,{fw:600,ls:0.8});
  var durations = ['25 min','40 min','60 min','90 min'];
  var dw = Math.round((350-24)/4);
  durations.forEach(function(d,i) {
    var dx = 20 + i*(dw+8);
    var isSelected = i===1;
    rect(dx,308,dw,38, isSelected?P.SAGE:P.CARD, {rx:10, stroke:isSelected?P.SAGE:P.BORDER, sw:isSelected?0:1});
    text(dx+dw/2,331,d, 11, isSelected?P.CARD:P.TEXT2, {anchor:'middle',fw:isSelected?700:400});
  });

  text(20,368,'Priority blocks',11,P.TEXT3,{fw:600,ls:0.8});
  var pblocks = [
    {label:'Deep work',active:true, icon:'▣'},
    {label:'Research', active:false,icon:'◈'},
    {label:'Writing',  active:true, icon:'✎'},
    {label:'Learning', active:false,icon:'◎'},
    {label:'Planning', active:false,icon:'⊡'},
    {label:'Meetings', active:false,icon:'⊙'},
  ];
  var pbx=20, pby=380;
  pblocks.forEach(function(b,i) {
    var bww=100, bh4=42;
    if(i===3) { pbx=20; pby+=50; }
    rect(pbx,pby,bww,bh4, b.active?P.SAGE3:P.CARD, {rx:12, stroke:b.active?P.SAGE:P.BORDER, sw:b.active?1.5:1});
    text(pbx+14,pby+26,b.icon,12,b.active?P.SAGE:P.TEXT3);
    text(pbx+30,pby+26,b.label,11,b.active?P.SAGE2:P.TEXT2,{fw:b.active?600:400});
    pbx += bww+8;
  });

  var erow2 = pby+56;
  text(20,erow2,'Environment',11,P.TEXT3,{fw:600,ls:0.8});
  var envs = [
    {label:'☁  Rain',     active:true, w:88},
    {label:'Forest',      active:false,w:88},
    {label:'Brown Noise', active:false,w:158},
  ];
  var ex=20;
  envs.forEach(function(e) {
    rect(ex,erow2+12,e.w,36, e.active?P.SAGE3:P.SURF, {rx:18, stroke:e.active?P.SAGE:P.BORDER, sw:1});
    text(ex+e.w/2,erow2+34,e.label,11,e.active?P.SAGE2:P.TEXT2,{anchor:'middle',fw:500});
    ex += e.w+8;
  });

  var ctaY = erow2+66;
  rect(20,ctaY,350,56,P.SAGE,{rx:28});
  text(W/2,ctaY+32,'Begin Focus Session',15,P.CARD,{anchor:'middle',fw:600});
  text(W/2,ctaY+74,'or schedule for later',11,P.TEXT3,{anchor:'middle'});

  screens.push({ name:'Set Intention', elements:[...elements] });
}

// ─── SCREEN 6: Session Complete / Reflection ──────────────────────────────────
{
  elements.length = 0; eid = 1;
  rect(0,0,W,H,P.BG);
  statusBar();
  rect(0,44,W,H-44,P.BG);

  var dots = [
    [60,100,5,P.SAGE],[120,80,4,P.AMBER],[200,70,6,P.SAGE3],
    [280,90,4,P.AMBER3],[340,110,5,P.SAGE],[160,120,3,P.ROSE],
    [80,140,4,P.AMBER],[320,75,3,P.SAGE3],
  ];
  dots.forEach(function(d) { circle(d[0],d[1],d[2],d[3],{opacity:0.6}); });

  text(W/2,96,'Session Complete',13,P.TEXT3,{anchor:'middle',fw:500,ls:0.5});
  text(W/2,135,'Well grown.',30,P.TEXT,{anchor:'middle',fw:700,font:'Georgia'});

  rect(20,152,350,72,P.SAGE,{rx:18});
  text(W/2,186,'1h 03m',36,P.CARD,{anchor:'middle',fw:300,font:'Georgia'});
  text(W/2,210,'deep focus',12,'rgba(255,255,255,0.75)',{anchor:'middle'});

  var srow=238;
  rect(20,srow,170,68,P.CARD,{rx:14,stroke:P.BORDER,sw:1});
  text(35,srow+24,'Focus Quality',10,P.TEXT3,{fw:500});
  text(35,srow+46,'●●●●○',14,P.SAGE,{ls:4});
  text(35,srow+63,'4 / 5',10,P.TEXT2);

  rect(200,srow,170,68,P.CARD,{rx:14,stroke:P.BORDER,sw:1});
  text(215,srow+24,'Interruptions',10,P.TEXT3,{fw:500});
  text(215,srow+46,'2',26,P.AMBER,{fw:700,font:'Georgia'});
  text(215,srow+63,'vs 3 avg',10,P.TEXT2);

  var rfrow=srow+84;
  text(20,rfrow,'Reflect',13,P.TEXT,{fw:600});
  text(20,rfrow+18,'What moved forward?',11,P.TEXT3);
  rect(20,rfrow+30,350,64,P.CARD,{rx:12,stroke:P.BORDER,sw:1});
  text(34,rfrow+54,'Drafted the complete API spec.',12,P.TEXT2);
  text(34,rfrow+72,'Just need the review pass.',12,P.TEXT2);
  text(34,rfrow+88,'_',13,P.SAGE,{fw:600,opacity:0.5});

  var nxrow=rfrow+110;
  text(20,nxrow,'Up next in your grove',11,P.TEXT3,{fw:600,ls:0.8});
  rect(20,nxrow+14,350,54,P.CARD,{rx:12,stroke:P.BORDER,sw:1});
  rect(20,nxrow+14,4,54,P.AMBER,{rx:2});
  text(34,nxrow+34,'Code review — API layer',12,P.TEXT,{fw:500});
  text(34,nxrow+52,'Scheduled · 2:00–3:30',10,P.TEXT3);
  rect(W-66,nxrow+22,48,30,P.SURF,{rx:10});
  text(W-42,nxrow+41,'Start →',10,P.SAGE,{anchor:'middle',fw:600});

  var mlrow=nxrow+84;
  rect(20,mlrow,350,52,P.AMBER3,{rx:14});
  text(38,mlrow+22,'3h milestone reached!',13,P.AMBER2,{fw:600});
  text(38,mlrow+40,'On track for your best day this week.',11,P.AMBER2,{opacity:0.8});

  var abrow=mlrow+68;
  rect(20,abrow,165,48,P.SAGE,{rx:24});
  text(102,abrow+28,'Take a break',12,P.CARD,{anchor:'middle',fw:600});
  rect(205,abrow,165,48,'none',{rx:24,stroke:P.SAGE,sw:1.5});
  text(287,abrow+28,'Next session',12,P.SAGE,{anchor:'middle',fw:600});

  text(W/2,abrow+72,'← Back to Today',12,P.TEXT3,{anchor:'middle'});

  screens.push({ name:'Session Complete', elements:[...elements] });
}

// ─── Assemble pen file ────────────────────────────────────────────────────────
var penData = {
  version: '2.8',
  meta: {
    name:        'GROVE — Deep Work Session Tracker',
    theme:       'light',
    palette:     'Warm cream · sage green · amber',
    author:      'RAM Design Heartbeat #13',
    created:     new Date().toISOString(),
    inspiration: 'Sandbar (minimal.gallery) — warm cream editorial minimal UI',
  },
  device: { width:W, height:H, platform:'ios' },
  screens: screens.map(function(s,i) {
    return {
      id:       'screen_' + (i+1),
      name:     s.name,
      width:    W,
      height:   H,
      elements: s.elements,
    };
  }),
};

var outPath = path.join(__dirname, 'grove.pen');
fs.writeFileSync(outPath, JSON.stringify(penData, null, 2));
console.log('grove.pen written — ' + screens.length + ' screens');
console.log('Screens: ' + screens.map(function(s){return s.name;}).join(' · '));
