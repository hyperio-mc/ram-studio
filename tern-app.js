'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG  = 'tern';
const NAME  = 'TERN';
const HB    = 491;
const W     = 390;
const H     = 844;

// ─── Palette ────────────────────────────────────────────────────────────────
const BG      = '#0A0B10';
const SURF    = '#111320';
const CARD    = '#181C30';
const CARD2   = '#1E2238';
const ACC     = '#7C3AED';  // electric violet
const ACC2    = '#06B6D4';  // cyan
const WARM    = '#F97316';  // warm coral
const TEXT    = '#E2E8F0';
const MUTED   = 'rgba(148,163,184,0.55)';
const DIM     = 'rgba(148,163,184,0.30)';
const WHITE8  = 'rgba(255,255,255,0.08)';
const WHITE12 = 'rgba(255,255,255,0.12)';
const WHITE20 = 'rgba(255,255,255,0.20)';

// ─── Primitives ─────────────────────────────────────────────────────────────
function rect(x,y,w,h,fill,o={}){
  return {type:'rect',x,y,width:w,height:h,fill,
    rx:o.rx??0, opacity:o.opacity??1,
    stroke:o.stroke??'none', strokeWidth:o.sw??0};
}
function text(x,y,content,size,fill,o={}){
  return {type:'text',x,y,content,fontSize:size,fill,
    fontWeight:o.fw??400, fontFamily:o.font??'Inter,sans-serif',
    textAnchor:o.anchor??'start', letterSpacing:o.ls??0, opacity:o.opacity??1};
}
function circle(cx,cy,r,fill,o={}){
  return {type:'circle',cx,cy,r,fill, opacity:o.opacity??1,
    stroke:o.stroke??'none', strokeWidth:o.sw??0};
}
function line(x1,y1,x2,y2,stroke,o={}){
  return {type:'line',x1,y1,x2,y2,stroke, strokeWidth:o.sw??1, opacity:o.opacity??1};
}
function pill(x,y,w,h,fill,o={}){
  return rect(x,y,w,h,fill,{rx:h/2,...o});
}

// ─── Reusable Components ─────────────────────────────────────────────────────
function card(x,y,w,h,o={}){
  const els = [];
  // ambient glow behind card
  if(o.glow){
    els.push({...circle(x+w/2, y+h/2, Math.max(w,h)*0.55, o.glow, {opacity:0.12})});
  }
  els.push(rect(x,y,w,h, o.fill??CARD,{rx:o.rx??16,opacity:o.opacity??1,
    stroke:o.border??WHITE8, sw:1}));
  return els;
}

function topBar(label, showBack=false){
  const els = [];
  els.push(rect(0,0,W,52,SURF));
  // Status bar dots
  els.push(text(16,18,'9:41',12,TEXT,{fw:600}));
  els.push(circle(W-60,16,4,WHITE20));
  els.push(circle(W-48,16,4,WHITE20));
  els.push(circle(W-36,16,4,WHITE20));
  // Page title
  if(showBack){
    // back arrow
    els.push(line(24,36,16,30,TEXT,{sw:2}));
    els.push(line(16,30,24,24,TEXT,{sw:2}));
  }
  els.push(text(W/2,36,label,16,TEXT,{fw:700,anchor:'middle'}));
  return els;
}

function bottomNav(active){
  const tabs = [
    {id:'home',  icon:'⬡', label:'Home'},
    {id:'search',icon:'◎', label:'Discover'},
    {id:'chart', icon:'◈', label:'Stats'},
    {id:'user',  icon:'◉', label:'Profile'},
  ];
  const els = [];
  els.push(rect(0,H-80,W,80,SURF,{stroke:WHITE8,sw:1}));
  // safe-area line
  els.push(rect(W/2-20,H-12,40,4,'rgba(255,255,255,0.3)',{rx:2}));
  tabs.forEach((t,i)=>{
    const x = 24 + i*(W-48)/3;
    const isActive = t.id===active;
    const col = isActive?ACC:MUTED;
    const iSize = isActive?22:18;
    els.push(text(x+18,H-50,t.icon,iSize,col,{anchor:'middle',fw:isActive?700:400}));
    els.push(text(x+18,H-32,t.label,10,col,{anchor:'middle',fw:isActive?600:400}));
    if(isActive){
      els.push(rect(x+8,H-82,20,3,ACC,{rx:2}));
    }
  });
  return els;
}

function sparkLine(x,y,w,h,data,color){
  const max = Math.max(...data);
  const els = [];
  for(let i=0;i<data.length-1;i++){
    const x1 = x + i*(w/(data.length-1));
    const y1 = y + h - (data[i]/max)*h;
    const x2 = x + (i+1)*(w/(data.length-1));
    const y2 = y + h - (data[i+1]/max)*h;
    els.push(line(x1,y1,x2,y2,color,{sw:2,opacity:0.9}));
  }
  return els;
}

function miniBar(x,y,w,h,pct,color,bg=WHITE8){
  return [
    rect(x,y,w,h,bg,{rx:3}),
    rect(x,y,Math.max(4,w*pct),h,color,{rx:3}),
  ];
}

function genreArc(cx,cy,r,startAngle,sweepAngle,color,sw=12){
  // Approximate arc as a thick line segment (SVG path would be ideal but using ellipse approx)
  const mid = startAngle + sweepAngle/2;
  const x1 = cx + r*Math.cos(startAngle);
  const y1 = cy + r*Math.sin(startAngle);
  const x2 = cx + r*Math.cos(startAngle+sweepAngle);
  const y2 = cy + r*Math.sin(startAngle+sweepAngle);
  // Draw multiple chord lines to approximate arc
  const els = [];
  const steps = Math.max(3, Math.round(Math.abs(sweepAngle)*8));
  for(let i=0;i<steps;i++){
    const a1 = startAngle + (i/steps)*sweepAngle;
    const a2 = startAngle + ((i+1)/steps)*sweepAngle;
    const px1 = cx + r*Math.cos(a1);
    const py1 = cy + r*Math.sin(a1);
    const px2 = cx + r*Math.cos(a2);
    const py2 = cy + r*Math.sin(a2);
    els.push(line(px1,py1,px2,py2,color,{sw,opacity:1}));
  }
  return els;
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — BENTO DASHBOARD
// ════════════════════════════════════════════════════════════════════════════
function screen1(){
  const els = [];
  // Background
  els.push(rect(0,0,W,H,BG));
  // Ambient orbs
  els.push(circle(320,180,130,ACC,{opacity:0.10}));
  els.push(circle(60,580,110,ACC2,{opacity:0.09}));
  els.push(circle(180,380,80,WARM,{opacity:0.05}));

  // Top bar
  els.push(rect(0,0,W,56,BG));
  els.push(text(16,20,'9:41',12,TEXT,{fw:600}));
  els.push(circle(W-48,18,3.5,WHITE20));
  els.push(circle(W-36,18,3.5,WHITE20));
  els.push(circle(W-24,18,3.5,WHITE20));
  els.push(text(16,45,'Good evening',12,MUTED,{fw:400}));
  els.push(text(16,64,'Your Sound',24,TEXT,{fw:800,ls:-0.5}));
  // Avatar
  els.push(circle(W-28,52,20,CARD2,{stroke:ACC,sw:2}));
  els.push(text(W-28,57,'M',13,ACC,{anchor:'middle',fw:700}));

  // ── BENTO ROW 1: Playing Now (wide) + Streak (narrow) ──
  const ROW1Y = 88;
  // Playing Now card (2x height feel, wide)
  const pnW=232, pnH=110;
  els.push(...card(12,ROW1Y,pnW,pnH,{fill:'rgba(24,28,48,0.9)',glow:ACC,rx:18,border:WHITE12}));
  // Album art placeholder
  els.push(rect(20,ROW1Y+10,72,72,'rgba(124,58,237,0.25)',{rx:10}));
  // Vinyl rings
  els.push(circle(56,ROW1Y+46,26,CARD,{stroke:ACC,sw:1,opacity:0.6}));
  els.push(circle(56,ROW1Y+46,16,'rgba(124,58,237,0.3)',{stroke:WHITE12,sw:1}));
  els.push(circle(56,ROW1Y+46,5,ACC));
  // Song info
  els.push(text(102,ROW1Y+24,'Now Playing',10,MUTED,{fw:500}));
  els.push(text(102,ROW1Y+40,'Neon Bloom',14,TEXT,{fw:700}));
  els.push(text(102,ROW1Y+56,'Bicep',12,MUTED,{fw:400}));
  // Progress
  els.push(...miniBar(102,ROW1Y+70,112,3,0.42,ACC,'rgba(124,58,237,0.2)'));
  els.push(text(102,ROW1Y+84,'2:14',9,MUTED));
  els.push(text(195,ROW1Y+84,'5:12',9,MUTED,{anchor:'end'}));
  // Heart badge
  els.push(pill(190,ROW1Y+10,30,20,'rgba(249,115,22,0.15)',{rx:10}));
  els.push(text(205,ROW1Y+23,'♡',11,WARM,{anchor:'middle'}));

  // Streak card (narrow, right)
  const skX=252, skW=126, skH=pnH;
  els.push(...card(skX,ROW1Y,skW,skH,{fill:CARD,rx:18,glow:WARM}));
  els.push(text(skX+12,ROW1Y+22,'Streak',10,MUTED,{fw:500}));
  els.push(text(skX+12,ROW1Y+50,'31',32,TEXT,{fw:800}));
  els.push(text(skX+12,ROW1Y+66,'days',11,MUTED));
  // Flame icon
  els.push(text(skX+skW-20,ROW1Y+22,'🔥',13,WARM,{anchor:'middle'}));
  // Mini calendar dots
  ['#7C3AED','#7C3AED','#7C3AED','#7C3AED','#7C3AED','#06B6D4','rgba(255,255,255,0.15)']
    .forEach((c,i)=>{
      els.push(circle(skX+12+i*16, ROW1Y+88, 5, c));
    });

  // ── BENTO ROW 2: Genre ring (square) + Top Artist + Mins ──
  const ROW2Y = ROW1Y+pnH+8;
  // Genre ring card
  const grW=130, grH=130;
  els.push(...card(12,ROW2Y,grW,grH,{fill:CARD,rx:18}));
  els.push(text(12+grW/2,ROW2Y+18,'Genre Mix',10,MUTED,{anchor:'middle',fw:500}));
  // Donut arcs
  const cx2=12+grW/2, cy2=ROW2Y+78;
  const genreData=[
    {pct:0.38,color:ACC,label:'Electronic'},
    {pct:0.27,color:ACC2,label:'Ambient'},
    {pct:0.20,color:WARM,label:'Indie'},
    {pct:0.15,color:'#A78BFA',label:'Jazz'},
  ];
  let angle=-Math.PI/2;
  genreData.forEach(g=>{
    const sweep=g.pct*2*Math.PI*0.88;
    els.push(...genreArc(cx2,cy2,36,angle,sweep,g.color,9));
    angle+=sweep+0.08;
  });
  // Center label
  els.push(text(cx2,cy2+4,'38%',11,TEXT,{anchor:'middle',fw:700}));
  els.push(text(cx2,cy2+16,'Electronic',7,MUTED,{anchor:'middle'}));

  // Top artist card (medium)
  const taX=150, taW=110, taH=grH;
  els.push(...card(taX,ROW2Y,taW,taH,{fill:CARD,rx:18,glow:ACC2}));
  els.push(text(taX+8,ROW2Y+20,'Top Artist',10,MUTED,{fw:500}));
  els.push(circle(taX+taW/2,ROW2Y+60,28,'rgba(6,182,212,0.2)',{stroke:ACC2,sw:1}));
  els.push(text(taX+taW/2,ROW2Y+65,'BC',15,ACC2,{anchor:'middle',fw:700}));
  els.push(text(taX+taW/2,ROW2Y+86,'Bicep',11,TEXT,{anchor:'middle',fw:600}));
  els.push(text(taX+taW/2,ROW2Y+100,'142 plays',9,MUTED,{anchor:'middle'}));
  els.push(text(taX+taW/2,ROW2Y+114,'this week',9,MUTED,{anchor:'middle'}));

  // Minutes card (narrow tall)
  const minX=268, minW=W-268-12, minH=grH;
  els.push(...card(minX,ROW2Y,minW,minH,{fill:CARD,rx:18}));
  els.push(text(minX+8,ROW2Y+20,'Mins',10,MUTED,{fw:500}));
  els.push(text(minX+8,ROW2Y+50,'284',26,TEXT,{fw:800}));
  els.push(text(minX+8,ROW2Y+66,'today',9,MUTED));
  // Sparkline
  els.push(...sparkLine(minX+6,ROW2Y+82,minW-12,30,
    [40,80,55,120,90,140,100,130,170,140,200,284],ACC));

  // ── BENTO ROW 3: Activity bars (full width) ──
  const ROW3Y = ROW2Y+grH+8;
  const actH=82;
  els.push(...card(12,ROW3Y,W-24,actH,{fill:CARD,rx:16}));
  els.push(text(20,ROW3Y+20,'Weekly Listening',11,MUTED,{fw:500}));
  const days=['M','T','W','T','F','S','S'];
  const vals=[65,80,45,90,100,75,40];
  const maxH=40;
  days.forEach((d,i)=>{
    const bx=24+i*48, by=ROW3Y+24;
    const bh=Math.round((vals[i]/100)*maxH);
    const isToday=i===5;
    const col=isToday?ACC:ACC2;
    // bar track
    els.push(rect(bx,by,28,maxH,'rgba(255,255,255,0.05)',{rx:6}));
    // bar fill
    els.push(rect(bx,by+maxH-bh,28,bh,col,{rx:6,opacity:isToday?1:0.55}));
    // label
    els.push(text(bx+14,ROW3Y+72,d,9,isToday?TEXT:MUTED,{anchor:'middle',fw:isToday?700:400}));
  });

  // Bottom nav
  els.push(...bottomNav('home'));

  return {name:'Dashboard',svg:`${W}x${H}`,elements:els};
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — DISCOVER
// ════════════════════════════════════════════════════════════════════════════
function screen2(){
  const els = [];
  els.push(rect(0,0,W,H,BG));
  // Ambient orbs
  els.push(circle(300,120,120,ACC2,{opacity:0.09}));
  els.push(circle(80,700,90,ACC,{opacity:0.08}));

  els.push(...topBar('Discover'));

  // Search bar
  els.push(...card(12,64,W-24,44,{fill:CARD2,rx:22,border:WHITE12}));
  els.push(text(44,91,'Search artists, songs, moods...',13,MUTED));
  // Search icon circle
  els.push(circle(29,86,10,WHITE8));
  els.push(text(29,90,'⊛',10,MUTED,{anchor:'middle'}));

  // Tabs
  const tabs=['For You','Trending','Moods','New'];
  els.push(rect(0,118,W,40,BG));
  tabs.forEach((t,i)=>{
    const tx=16+i*92;
    const active=i===0;
    els.push(text(tx,140,t,13,active?ACC:MUTED,{fw:active?700:400}));
    if(active) els.push(rect(tx-2,144,t.length*7+4,2,ACC,{rx:1}));
  });

  // Section: Based on your sound
  els.push(text(16,176,'Based on Your Sound',14,TEXT,{fw:700}));

  // Horizontal scroll cards
  const recCards=[
    {name:'Late Night Drive',artist:'Four Tet',col:ACC,mood:'Ambient'},
    {name:'Crystalline',artist:'Objekt',col:ACC2,mood:'Techno'},
    {name:'Sundream',artist:'Bonobo',col:WARM,mood:'Electronic'},
  ];
  recCards.forEach((rc,i)=>{
    const cx=16+i*130;
    const cy=186;
    els.push(...card(cx,cy,120,150,{fill:CARD,rx:14,glow:rc.col}));
    // Album art
    els.push(rect(cx+8,cy+8,104,80,'rgba(255,255,255,0.05)',{rx:10}));
    // Gradient overlay
    els.push(rect(cx+8,cy+50,104,38,`rgba(10,11,16,0.7)`,{rx:10}));
    // Mood pill
    els.push(pill(cx+12,cy+14,60,18,'rgba(255,255,255,0.1)'));
    els.push(text(cx+42,cy+26,rc.mood,9,TEXT,{anchor:'middle',fw:500}));
    // Visualizer bars (decorative)
    [0.4,0.8,0.5,0.9,0.6,0.7,0.3].forEach((v,j)=>{
      els.push(rect(cx+28+j*9,cy+90-v*24,6,v*24,rc.col,{rx:2,opacity:0.7}));
    });
    els.push(text(cx+8,cy+105,rc.name,11,TEXT,{fw:600}));
    els.push(text(cx+8,cy+120,rc.artist,10,MUTED));
    // Play button
    els.push(circle(cx+96,cy+120,14,rc.col,{opacity:0.9}));
    els.push(text(cx+96,cy+125,'▷',9,TEXT,{anchor:'middle',fw:700}));
  });

  // Section: Mood Playlists
  els.push(text(16,354,'Mood Playlists',14,TEXT,{fw:700}));
  const moods=[
    {label:'Focus Flow',sub:'Deep concentration',col:ACC,icon:'◎',tracks:'24'},
    {label:'Late Night',sub:'2am discoveries',col:'#A78BFA',icon:'◑',tracks:'18'},
    {label:'Sunday Slow',sub:'Easy morning',col:WARM,icon:'◌',tracks:'31'},
    {label:'Peak Hours',sub:'High energy',col:ACC2,icon:'◈',tracks:'12'},
  ];
  moods.forEach((m,i)=>{
    const my=370+i*64;
    els.push(...card(12,my,W-24,56,{fill:CARD,rx:14}));
    // Icon
    els.push(circle(42,my+28,20,`${m.col}22`));
    els.push(text(42,my+34,m.icon,16,m.col,{anchor:'middle'}));
    // Text
    els.push(text(72,my+24,m.label,13,TEXT,{fw:600}));
    els.push(text(72,my+40,m.sub,11,MUTED));
    // Tracks + arrow
    els.push(text(W-48,my+32,`${m.tracks} tracks`,10,MUTED,{anchor:'end'}));
    els.push(text(W-20,my+32,'›',16,MUTED,{anchor:'middle'}));
    // Accent bar
    els.push(rect(12,my,3,56,m.col,{rx:2}));
  });

  els.push(...bottomNav('search'));
  return {name:'Discover',svg:`${W}x${H}`,elements:els};
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — LISTENING STATS
// ════════════════════════════════════════════════════════════════════════════
function screen3(){
  const els = [];
  els.push(rect(0,0,W,H,BG));
  els.push(circle(350,200,150,ACC,{opacity:0.08}));
  els.push(circle(40,600,100,ACC2,{opacity:0.07}));

  els.push(...topBar('Your Stats'));

  // Period tabs
  const periods=['Week','Month','Year','All'];
  els.push(rect(12,60,W-24,36,'rgba(255,255,255,0.04)',{rx:18}));
  periods.forEach((p,i)=>{
    const active=i===0;
    const px=16+i*88;
    if(active) els.push(pill(px,62,80,32,ACC,{rx:16}));
    els.push(text(px+40,82,p,12,active?TEXT:MUTED,{anchor:'middle',fw:active?700:400}));
  });

  // Big stat hero
  els.push(...card(12,108,W-24,110,{fill:CARD,rx:20,glow:ACC}));
  els.push(text(24,132,'Total Listening Time',11,MUTED,{fw:500}));
  els.push(text(24,172,'47h 23m',36,TEXT,{fw:800,ls:-1}));
  els.push(text(24,192,'this week',12,MUTED));
  // Badge
  els.push(pill(W-80,120,60,24,'rgba(16,185,129,0.15)',{rx:12}));
  els.push(text(W-50,136,'+12%',11,'#10B981',{anchor:'middle',fw:600}));
  // Sparkline in the corner
  els.push(...sparkLine(24,200,W-48-24,16,[30,50,42,80,60,100,90,110,95,140,120,160],ACC));

  // Stats row
  const stats=[
    {label:'Artists',value:'28',icon:'◎',col:ACC2},
    {label:'Songs',value:'312',icon:'◈',col:WARM},
    {label:'Genres',value:'7',icon:'◉',col:'#A78BFA'},
  ];
  stats.forEach((s,i)=>{
    const sx=12+i*(W-24)/3;
    els.push(...card(sx+2,228,116,76,{fill:CARD2,rx:14}));
    els.push(text(sx+14,250,s.icon,14,s.col));
    els.push(text(sx+14,278,s.value,22,TEXT,{fw:800}));
    els.push(text(sx+14,294,s.label,10,MUTED,{fw:500}));
  });

  // Top tracks this week
  els.push(text(16,326,'Top Tracks',13,TEXT,{fw:700}));
  const tracks=[
    {rank:'01',name:'Neon Bloom',artist:'Bicep',plays:'47',pct:0.92,col:ACC},
    {rank:'02',name:'Late Night Feelings',artist:'Mark Ronson',plays:'38',pct:0.75,col:ACC2},
    {rank:'03',name:'Lavender',artist:'Bonobo',plays:'31',pct:0.61,col:'#A78BFA'},
    {rank:'04',name:'Crystalline',artist:'Objekt',plays:'26',pct:0.51,col:WARM},
    {rank:'05',name:'Pulse Width',artist:'Aphex Twin',plays:'22',pct:0.43,col:'#10B981'},
  ];
  tracks.forEach((t,i)=>{
    const ty=342+i*72;
    els.push(...card(12,ty,W-24,64,{fill:CARD,rx:14}));
    // Rank
    els.push(text(28,ty+22,'#'+t.rank.slice(-2),9,MUTED,{fw:600,anchor:'middle'}));
    // Color line
    els.push(rect(12,ty,3,64,t.col,{rx:2}));
    // Album art
    els.push(rect(42,ty+8,48,48,'rgba(255,255,255,0.05)',{rx:8}));
    els.push(text(66,ty+38,t.rank,14,t.col,{anchor:'middle',fw:700,opacity:0.6}));
    // Track info
    els.push(text(100,ty+24,t.name,12,TEXT,{fw:600}));
    els.push(text(100,ty+40,t.artist,10,MUTED));
    // Plays + bar
    els.push(...miniBar(100,ty+50,160,4,t.pct,t.col,'rgba(255,255,255,0.05)'));
    els.push(text(W-24,ty+38,`${t.plays}×`,10,MUTED,{anchor:'end'}));
  });

  els.push(...bottomNav('chart'));
  return {name:'Stats',svg:`${W}x${H}`,elements:els};
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — ARTIST DEEP DIVE
// ════════════════════════════════════════════════════════════════════════════
function screen4(){
  const els = [];
  els.push(rect(0,0,W,H,BG));

  // Hero gradient
  els.push(rect(0,0,W,240,'rgba(124,58,237,0.25)',{rx:0}));
  els.push(circle(200,80,180,ACC,{opacity:0.18}));

  // Back + more
  els.push(text(16,40,'←',18,TEXT,{fw:400}));
  els.push(text(W-16,40,'⋯',18,TEXT,{anchor:'end'}));

  // Artist avatar
  els.push(circle(W/2,140,60,CARD2,{stroke:WHITE20,sw:2}));
  els.push(text(W/2,148,'BC',28,ACC,{anchor:'middle',fw:700}));

  // Verified badge
  els.push(pill(W/2-30,188,60,22,'rgba(6,182,212,0.15)',{rx:11}));
  els.push(text(W/2,203,'✓ Bicep',11,ACC2,{anchor:'middle',fw:600}));

  // Stats
  const aStats=[
    {label:'Plays',val:'142'},
    {label:'Rank',val:'#1'},
    {label:'Hours',val:'11.8'},
  ];
  aStats.forEach((s,i)=>{
    const ax=56+i*120;
    els.push(text(ax,236,s.val,18,TEXT,{anchor:'middle',fw:800}));
    els.push(text(ax,252,s.label,10,MUTED,{anchor:'middle'}));
    if(i<2) els.push(line(ax+56,228,ax+56,256,WHITE8,{sw:1}));
  });

  // Divider
  els.push(line(16,264,W-16,264,WHITE8,{sw:1}));

  // Listening timeline
  els.push(text(16,284,'Listening Timeline',13,TEXT,{fw:700}));
  els.push(...card(12,298,W-24,90,{fill:CARD,rx:14}));
  const tlData=[8,12,18,35,28,45,60,52,78,90,80,142];
  els.push(...sparkLine(24,360,W-48-24,20,tlData,ACC));
  // Fill area (approximate with rects)
  tlData.forEach((_,i)=>{
    if(i===tlData.length-1) return;
    const max=142,ww=(W-72)/(tlData.length-1);
    const hh=(tlData[i]/max)*20;
    els.push(rect(24+i*ww,360+20-hh,ww,hh,'rgba(124,58,237,0.12)',{rx:0}));
  });
  // Month labels
  ['J','F','M','A','M','J','J','A','S','O','N','D'].forEach((m,i)=>{
    const lx=24+i*((W-72)/11);
    if(i%3===0) els.push(text(lx,380,m,8,MUTED,{anchor:'middle'}));
  });
  els.push(text(24,316,'Your plays: Jan–Dec 2025',10,MUTED));

  // Top songs by this artist
  els.push(text(16,402,'Top Songs',13,TEXT,{fw:700}));
  const aSongs=[
    {n:'Glue',plays:'58',dur:'4:52'},
    {n:'Neon Bloom',plays:'47',dur:'5:12'},
    {n:'Vale',plays:'24',dur:'6:08'},
    {n:'Hawk',plays:'13',dur:'7:24'},
  ];
  aSongs.forEach((s,i)=>{
    const sy=418+i*58;
    els.push(...card(12,sy,W-24,50,{fill:CARD,rx:12}));
    els.push(text(24,sy+20,`${i+1}`,11,MUTED,{fw:600}));
    els.push(text(44,sy+22,s.n,13,TEXT,{fw:600}));
    els.push(text(44,sy+38,s.plays+' plays',10,MUTED));
    els.push(text(W-24,sy+30,s.dur,10,MUTED,{anchor:'end'}));
    // inline mini vis
    [0.3,0.7,0.5,0.9,0.6,0.4].forEach((v,j)=>{
      els.push(rect(W-72+j*7,sy+26-v*10,4,v*10,ACC,{rx:1,opacity:0.4}));
    });
    // Accent line
    els.push(rect(12,sy,2,50,ACC,{rx:1,opacity:i===1?1:0.3}));
  });

  els.push(...bottomNav('home'));
  return {name:'Artist',svg:`${W}x${H}`,elements:els};
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — SOUND MAP (Mood Grid)
// ════════════════════════════════════════════════════════════════════════════
function screen5(){
  const els = [];
  els.push(rect(0,0,W,H,BG));
  // Mood gradient bg
  els.push(circle(280,300,200,ACC,{opacity:0.07}));
  els.push(circle(110,500,160,ACC2,{opacity:0.07}));
  els.push(circle(200,150,120,WARM,{opacity:0.05}));

  els.push(...topBar('Sound Map'));

  // Subtitle
  els.push(text(W/2,72,'Your musical landscape this week',11,MUTED,{anchor:'middle'}));

  // Axis labels
  els.push(text(W/2,100,'ENERGETIC',10,MUTED,{anchor:'middle',ls:1.5,fw:600}));
  els.push(text(W/2,690,'CALM',10,MUTED,{anchor:'middle',ls:1.5,fw:600}));
  els.push(text(16,400,'DARK',10,MUTED,{ls:1.5,fw:600}));
  els.push(text(W-16,400,'BRIGHT',10,MUTED,{anchor:'end',ls:1.5,fw:600}));

  // Cross-hair axes
  els.push(line(W/2,108,W/2,682,WHITE8,{sw:1}));
  els.push(line(24,400,W-24,400,WHITE8,{sw:1}));

  // Grid dots
  for(let gx=0;gx<=4;gx++){
    for(let gy=0;gy<=4;gy++){
      const dx=48+gx*(W-96)/4;
      const dy=116+gy*(570)/4;
      if(gx===2&&gy===2) continue;
      els.push(circle(dx,dy,2,'rgba(255,255,255,0.08)'));
    }
  }

  // Bubble clusters (genres/artists)
  const bubbles=[
    {x:260,y:160,r:42,col:ACC,label:'Techno',sub:'38%',opacity:0.85},
    {x:140,y:220,r:30,col:ACC2,label:'Ambient',sub:'27%',opacity:0.75},
    {x:300,y:440,r:24,col:WARM,label:'Indie',sub:'20%',opacity:0.7},
    {x:110,y:500,r:18,col:'#A78BFA',label:'Jazz',sub:'15%',opacity:0.65},
    {x:230,y:340,r:14,col:'#10B981',label:'Soul',sub:'8%',opacity:0.6},
    {x:170,y:370,r:10,col:'#F472B6',label:'Dream',sub:'5%',opacity:0.55},
    {x:290,y:260,r:10,col:ACC,label:'House',sub:'5%',opacity:0.5},
  ];
  bubbles.forEach(b=>{
    // Glow
    els.push(circle(b.x,b.y,b.r+8,b.col,{opacity:0.08}));
    // Main bubble
    els.push(circle(b.x,b.y,b.r,b.col,{opacity:b.opacity*0.3}));
    els.push(circle(b.x,b.y,b.r,b.col,{opacity:0,stroke:b.col,sw:1.5}));
    // Label
    if(b.r>=24){
      els.push(text(b.x,b.y+2,b.label,Math.round(b.r/4)+7,TEXT,{anchor:'middle',fw:700}));
      els.push(text(b.x,b.y+14,b.sub,9,WHITE20,{anchor:'middle'}));
    } else if(b.r>=16){
      els.push(text(b.x,b.y+4,b.label,9,TEXT,{anchor:'middle',fw:600}));
    }
  });

  // Legend card
  els.push(...card(12,696,W-24,72,{fill:CARD,rx:14}));
  els.push(text(20,716,'Bubble size = listening volume',11,MUTED));
  els.push(text(20,732,'Position = energy × mood axis',11,MUTED));
  const legColors=[ACC,ACC2,WARM,'#A78BFA'];
  legColors.forEach((c,i)=>{
    els.push(circle(20+i*44,750,6,c));
  });
  ['Electronic','Ambient','Indie','Jazz'].forEach((l,i)=>{
    els.push(text(32+i*44,754,l,7,MUTED));
  });

  els.push(...bottomNav('chart'));
  return {name:'Sound Map',svg:`${W}x${H}`,elements:els};
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 6 — PROFILE + SETTINGS
// ════════════════════════════════════════════════════════════════════════════
function screen6(){
  const els = [];
  els.push(rect(0,0,W,H,BG));
  els.push(circle(300,150,160,ACC,{opacity:0.08}));

  els.push(...topBar('Profile'));

  // Avatar hero
  els.push(circle(W/2,130,50,CARD2,{stroke:ACC,sw:2}));
  els.push(text(W/2,138,'MR',22,ACC,{anchor:'middle',fw:700}));
  els.push(text(W/2,196,'Marcus Rivera',17,TEXT,{anchor:'middle',fw:700}));
  els.push(text(W/2,214,'@marcus · since 2021',11,MUTED,{anchor:'middle'}));

  // Edit profile pill
  els.push(pill(W/2-48,222,96,28,'rgba(124,58,237,0.15)',{rx:14,border:WHITE12}));
  els.push(text(W/2,240,'Edit Profile',11,ACC,{anchor:'middle',fw:600}));

  // Listener rank badge
  els.push(...card(16,264,W-32,50,{fill:'rgba(124,58,237,0.1)',rx:14,border:'rgba(124,58,237,0.2)'}));
  els.push(text(30,294,'◈',16,ACC));
  els.push(text(54,286,'Top Listener Rank',11,ACC,{fw:600}));
  els.push(text(54,302,'Top 1% of Bicep listeners globally',10,MUTED));
  els.push(text(W-24,294,'#247',12,ACC,{anchor:'end',fw:700}));

  // Settings sections
  const sections = [
    {
      title:'Sound Preferences',
      items:[
        {label:'Audio Quality',val:'Lossless',icon:'◎'},
        {label:'Crossfade',val:'3s',icon:'◑'},
        {label:'Normalization',val:'On',icon:'◌'},
      ]
    },
    {
      title:'Notifications',
      items:[
        {label:'New releases',val:'On',icon:'◉'},
        {label:'Artist activity',val:'Off',icon:'◈'},
      ]
    },
    {
      title:'Account',
      items:[
        {label:'Subscription',val:'TERN Pro',icon:'◎'},
        {label:'Connected services',val:'Spotify',icon:'◑'},
      ]
    },
  ];

  let sy = 326;
  sections.forEach(sec=>{
    els.push(text(16,sy+14,sec.title,11,MUTED,{fw:600,ls:0.5}));
    sy+=22;
    sec.items.forEach(item=>{
      els.push(...card(12,sy,W-24,44,{fill:CARD,rx:12}));
      els.push(text(30,sy+16,item.icon,13,MUTED));
      els.push(text(50,sy+26,item.label,13,TEXT));
      els.push(text(W-24,sy+26,item.val,12,MUTED,{anchor:'end'}));
      els.push(text(W-10,sy+26,'›',14,MUTED,{anchor:'end'}));
      sy+=48;
    });
    sy+=6;
  });

  // Logout
  els.push(...card(12,sy,W-24,42,{fill:'rgba(239,68,68,0.06)',rx:12,border:'rgba(239,68,68,0.12)'}));
  els.push(text(W/2,sy+25,'Log out',13,'#EF4444',{anchor:'middle',fw:600}));

  els.push(...bottomNav('user'));
  return {name:'Profile',svg:`${W}x${H}`,elements:els};
}

// ─── Assemble ────────────────────────────────────────────────────────────────
const screens = [screen1(),screen2(),screen3(),screen4(),screen5(),screen6()];
const total   = screens.reduce((a,s)=>a+s.elements.length,0);

const pen = {
  version: '2.8',
  metadata: {
    name:      'TERN — Know Your Sound',
    author:    'RAM',
    date:      new Date().toISOString().slice(0,10),
    theme:     'dark',
    heartbeat: HB,
    elements:  total,
    slug:      SLUG,
    archetype: 'music-intelligence',
    palette: { BG,SURF,CARD,ACC,ACC2,TEXT },
    inspiration: 'Bento grid from saaspo.com + ambient glassmorphism from darkmodedesign.com',
  },
  screens,
};

fs.writeFileSync(path.join(__dirname,`${SLUG}.pen`), JSON.stringify(pen,null,2));
console.log(`${NAME}: ${screens.length} screens, ${total} elements`);
console.log(`Written: ${SLUG}.pen`);
