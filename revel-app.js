'use strict';
const fs = require('fs'), path = require('path');

const SLUG      = 'revel';
const NAME      = 'REVEL';
const TAGLINE   = 'Find what\'s happening around you';
const HEARTBEAT = 394;

// Palette — Warm Editorial Light
// Inspired by: Lapa Ninja serif revival trend (Victor Serif + Messina Sans combos on Future.app)
// and Land-book's 1950s–60s warm earthy advertising palette (ochre, rust, cream)
// Counter-trend to the dark SaaS default — warmth & editorial print feel
const BG      = '#FAF6F0';   // warm cream
const SURF    = '#FFFFFF';   // clean white surface
const CARD    = '#F5EFE6';   // slightly darker cream
const ACC     = '#C4511A';   // terracotta / rust
const ACC2    = '#4A7B4A';   // forest green
const TEXT    = '#1C1712';   // dark warm brown
const MUTED   = 'rgba(28,23,18,0.45)';
const DIVIDER = 'rgba(28,23,18,0.10)';
const LACC    = '#F5E6DC';   // light terracotta wash

const W = 390, H = 844;
let elCount = 0;

function rect(x,y,w,h,fill,opts={}) {
  elCount++;
  return { type:'rect', x, y, width:w, height:h, fill,
    rx: opts.rx||0, opacity: opts.opacity!==undefined?opts.opacity:1,
    stroke: opts.stroke||'none', strokeWidth: opts.sw||0 };
}
function text(x,y,content,size,fill,opts={}) {
  elCount++;
  return { type:'text', x, y, content, fontSize:size, fill,
    fontFamily: opts.font||'Inter, sans-serif',
    fontWeight: opts.fw||400,
    textAnchor: opts.anchor||'start',
    letterSpacing: opts.ls!==undefined?opts.ls:0,
    opacity: opts.opacity!==undefined?opts.opacity:1 };
}
function circle(cx,cy,r,fill,opts={}) {
  elCount++;
  return { type:'circle', cx, cy, r, fill,
    opacity: opts.opacity!==undefined?opts.opacity:1,
    stroke: opts.stroke||'none', strokeWidth: opts.sw||0 };
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  elCount++;
  return { type:'line', x1, y1, x2, y2, stroke,
    strokeWidth: opts.sw||1, opacity: opts.opacity!==undefined?opts.opacity:1 };
}

const screens = [];

// ─────────────────────────────────────────────────────────────────
// SCREEN 1 · DISCOVER
// ─────────────────────────────────────────────────────────────────
(function buildDiscover() {
  const el = [];
  el.push(rect(0,0,W,H,BG));

  // Status bar
  el.push(text(20,50,'9:41',13,TEXT,{fw:600}));
  el.push(text(370,50,'●●●',11,TEXT,{anchor:'end',opacity:0.5}));

  // Header
  el.push(text(20,92,'Discover',36,TEXT,{fw:700,font:'Georgia, serif',ls:-0.5}));

  // Location chip
  el.push(rect(20,102,138,32,CARD,{rx:16}));
  el.push(circle(36,118,5,ACC));
  el.push(text(46,122,'San Francisco  ▾',12,TEXT,{fw:500}));

  // Filter pills
  const filters = ['Today','This Week','Weekend','Free'];
  filters.forEach((f,i) => {
    const px = 20+i*90, active = i===0;
    el.push(rect(px,144,82,28,active?ACC:CARD,{rx:14}));
    el.push(text(px+41,162,f,12,active?SURF:TEXT,{anchor:'middle',fw:active?600:400}));
  });

  // Featured hero card
  el.push(rect(20,184,350,178,ACC,{rx:16}));
  // Texture rows
  for(let i=0;i<6;i++) el.push(rect(20,184+i*30,350,30,i%2===0?'rgba(0,0,0,0.07)':'rgba(0,0,0,0)',{rx:0}));
  // Pattern dots
  for(let row=0;row<3;row++) for(let col=0;col<7;col++)
    el.push(circle(36+col*52,200+row*58,2.5,'rgba(255,255,255,0.18)'));
  // FEATURED badge
  el.push(rect(32,198,74,20,`rgba(255,255,255,0.2)`,{rx:10}));
  el.push(text(69,212,'FEATURED',9,SURF,{anchor:'middle',fw:700,ls:1.5}));
  // Event name
  el.push(text(32,306,'Jazz Under',28,SURF,{fw:700,font:'Georgia, serif',ls:-0.3}));
  el.push(text(32,340,'the Stars',28,SURF,{fw:700,font:'Georgia, serif',ls:-0.3}));
  // Date line
  el.push(text(32,362,'FRI APR 11  ·  Yerba Buena Gardens',11,'rgba(255,255,255,0.82)',{fw:400}));
  // Pagination dots
  [0,1,2].forEach(i=>el.push(circle(175+i*14,365,3.5,i===0?SURF:'rgba(255,255,255,0.35)')));

  // Section header
  el.push(text(20,388,'This Week',20,TEXT,{fw:700,font:'Georgia, serif'}));
  el.push(text(370,388,'See all →',12,ACC,{anchor:'end',fw:500}));

  // Event row helper
  function eventRow(y, dateTop, dateNum, color, bgColor, title, subtitle, category, catColor, going) {
    el.push(rect(20,y,350,88,SURF,{rx:12}));
    el.push(rect(20,y,4,88,color,{rx:2}));
    el.push(rect(32,y+12,46,44,bgColor,{rx:8}));
    el.push(text(55,y+26,dateTop,8,color,{anchor:'middle',fw:700,ls:1.2}));
    el.push(text(55,y+48,dateNum,20,color,{anchor:'middle',fw:700,font:'Georgia, serif'}));
    el.push(text(92,y+28,title,15,TEXT,{fw:700,font:'Georgia, serif'}));
    el.push(text(92,y+48,subtitle,12,MUTED));
    el.push(rect(92,y+58,category.length*8+12,18,catColor+'28',{rx:9}));
    el.push(text(92+(category.length*8+12)/2,y+70,category.toUpperCase(),8,catColor,{anchor:'middle',fw:700,ls:1}));
    el.push(text(360,y+28,going,11,MUTED,{anchor:'end'}));
    el.push(text(360,y+70,'›',16,MUTED,{anchor:'end'}));
  }

  eventRow(406,'APR','12',ACC,LACC,'Latinx Art Exhibition','SFMOMA · Free admission','Art','#8B5E3C','234 going');
  eventRow(506,'APR','13',ACC2,'#E8F2E8','Ferry Building Market','Ferry Building · $0–$40','Food',ACC2,'89 going');
  eventRow(606,'APR','14','#8B5E3C','#F5EAE2','Alamo Cinema Night','Alamo Square Park · $12','Film','#DC2626','156 going');

  // Bottom nav
  el.push(rect(0,762,W,82,SURF));
  el.push(line(0,762,W,762,DIVIDER));
  [
    {icon:'◉',label:'Discover',active:true,x:58},
    {icon:'⊙',label:'Map',active:false,x:140},
    {icon:'◎',label:'Saved',active:false,x:222},
    {icon:'○',label:'Profile',active:false,x:304},
  ].forEach(n=>{
    const c=n.active?ACC:MUTED;
    el.push(text(n.x,790,n.icon,20,c,{anchor:'middle'}));
    el.push(text(n.x,808,n.label,10,c,{anchor:'middle',fw:n.active?600:400}));
  });
  // FAB
  el.push(circle(348,790,24,ACC));
  el.push(text(348,797,'+',20,SURF,{anchor:'middle',fw:300}));

  screens.push({name:'Discover',svg:null,elements:el});
})();

// ─────────────────────────────────────────────────────────────────
// SCREEN 2 · EVENT DETAIL
// ─────────────────────────────────────────────────────────────────
(function buildDetail() {
  const el = [];
  el.push(rect(0,0,W,H,BG));

  // Hero image — terracotta
  el.push(rect(0,0,W,296,ACC));
  for(let i=0;i<5;i++) el.push(rect(0,i*60,W,60,i%2===0?'rgba(0,0,0,0.07)':'rgba(0,0,0,0)'));
  for(let row=0;row<4;row++) for(let col=0;col<7;col++)
    el.push(circle(28+col*58,32+row*64,2.5,'rgba(255,255,255,0.15)'));

  // Nav buttons
  el.push(circle(30,54,18,'rgba(0,0,0,0.22)'));
  el.push(text(30,60,'←',16,SURF,{anchor:'middle'}));
  el.push(circle(360,54,18,'rgba(0,0,0,0.22)'));
  el.push(text(360,60,'↑',15,SURF,{anchor:'middle'}));

  // Category tag
  el.push(rect(20,108,60,22,'rgba(255,255,255,0.22)',{rx:11}));
  el.push(text(50,122,'MUSIC',10,SURF,{anchor:'middle',fw:700,ls:1.5}));

  // Title on hero
  el.push(text(20,186,'Jazz Under',38,SURF,{fw:700,font:'Georgia, serif',ls:-0.5}));
  el.push(text(20,230,'the Stars',38,SURF,{fw:700,font:'Georgia, serif',ls:-0.5}));
  el.push(text(20,256,'Annual Summer Jazz Festival 2026',13,'rgba(255,255,255,0.82)'));

  // Heart & share
  el.push(circle(348,222,20,'rgba(0,0,0,0.22)'));
  el.push(text(348,228,'♡',16,SURF,{anchor:'middle'}));

  // Rounded top of content
  el.push(rect(0,282,W,H-282,BG,{rx:0}));

  // Info cards
  function infoCard(y,iconEmoji,iconBg,iconColor,line1,line2,rightText) {
    el.push(rect(20,y,350,60,SURF,{rx:12}));
    el.push(rect(28,y+10,40,40,iconBg,{rx:8}));
    el.push(text(48,y+34,iconEmoji,18,iconColor,{anchor:'middle'}));
    el.push(text(82,y+26,line1,14,TEXT,{fw:600}));
    el.push(text(82,y+44,line2,12,MUTED));
    if(rightText) el.push(text(360,y+26,rightText,12,ACC,{anchor:'end',fw:500}));
  }
  infoCard(302,  '📅',LACC,ACC, 'Friday, April 11, 2026','7:00 PM – 10:30 PM');
  infoCard(372,  '📍','#E8F2E8',ACC2,'Yerba Buena Gardens','750 Howard St, San Francisco','Map →');

  el.push(line(20,442,370,442,DIVIDER));

  // About
  el.push(text(20,464,'About',18,TEXT,{fw:700,font:'Georgia, serif'}));
  el.push(text(20,486,'An evening of world-class jazz in the heart of',13,MUTED));
  el.push(text(20,504,'San Francisco. Featuring five ensembles across',13,MUTED));
  el.push(text(20,522,'two stages, food vendors, and a wine garden.',13,MUTED));

  el.push(line(20,542,370,542,DIVIDER));

  // Attendees
  el.push(text(20,562,'Attending',18,TEXT,{fw:700,font:'Georgia, serif'}));
  el.push(text(20,580,'234 people are going',12,MUTED));
  const avColors=[ACC,ACC2,'#8B5E3C','#6B7280','#D97706'];
  const avInit=['JK','AM','RS','TL','PH'];
  avColors.forEach((c,i)=>{
    el.push(circle(28+i*30,614,14,c));
    el.push(text(28+i*30,619,avInit[i],8,SURF,{anchor:'middle',fw:700}));
  });
  el.push(rect(182,600,58,28,CARD,{rx:14}));
  el.push(text(211,618,'+229',11,MUTED,{anchor:'middle',fw:500}));

  el.push(line(20,648,370,648,DIVIDER));

  // Pricing + CTAs
  el.push(text(20,668,'From',12,MUTED));
  el.push(text(20,696,'$25',30,TEXT,{fw:700,font:'Georgia, serif'}));
  el.push(text(68,696,' / person',13,MUTED));

  el.push(rect(20,716,156,52,CARD,{rx:26,stroke:DIVIDER,sw:1}));
  el.push(text(98,748,'♡  Save',14,TEXT,{anchor:'middle',fw:500}));
  el.push(rect(186,716,184,52,ACC,{rx:26}));
  el.push(text(278,748,'Get Tickets →',14,SURF,{anchor:'middle',fw:600}));

  screens.push({name:'Event Detail',svg:null,elements:el});
})();

// ─────────────────────────────────────────────────────────────────
// SCREEN 3 · BROWSE
// ─────────────────────────────────────────────────────────────────
(function buildBrowse() {
  const el = [];
  el.push(rect(0,0,W,H,BG));

  el.push(text(20,50,'9:41',13,TEXT,{fw:600}));
  el.push(text(370,50,'●●●',11,TEXT,{anchor:'end',opacity:0.5}));
  el.push(text(20,92,'Browse',36,TEXT,{fw:700,font:'Georgia, serif',ls:-0.5}));

  // Search
  el.push(rect(20,100,308,44,SURF,{rx:22,stroke:DIVIDER,sw:1}));
  el.push(text(50,126,'🔍  Search events, venues…',13,MUTED));
  el.push(rect(338,100,44,44,ACC,{rx:22}));
  el.push(text(360,126,'⊞',18,SURF,{anchor:'middle'}));

  // Categories
  el.push(text(20,162,'Categories',18,TEXT,{fw:700,font:'Georgia, serif'}));
  const cats=[
    {name:'Music', icon:'♪', color:ACC,      bg:LACC},
    {name:'Art',   icon:'◈', color:'#8B5E3C',bg:'#F5EAE2'},
    {name:'Food',  icon:'◉', color:ACC2,     bg:'#E8F2E8'},
    {name:'Sports',icon:'◎', color:'#1D4ED8',bg:'#EFF6FF'},
    {name:'Night', icon:'◑', color:'#7C3AED',bg:'#F3F0FF'},
    {name:'Outdoor',icon:'◐',color:'#059669',bg:'#ECFDF5'},
    {name:'Film',  icon:'▶', color:'#DC2626',bg:'#FEF2F2'},
    {name:'Culture',icon:'◆',color:'#D97706',bg:'#FFFBEB'},
  ];
  cats.forEach((c,i)=>{
    const col=i%4, row=Math.floor(i/4);
    const cx=20+col*91, cy=178+row*90;
    el.push(rect(cx,cy,80,72,c.bg,{rx:12}));
    el.push(text(cx+40,cy+30,c.icon,24,c.color,{anchor:'middle'}));
    el.push(text(cx+40,cy+58,c.name,11,TEXT,{anchor:'middle',fw:500}));
  });

  el.push(line(20,372,370,372,DIVIDER,{opacity:0.5}));
  el.push(text(20,396,'Trending Near You',18,TEXT,{fw:700,font:'Georgia, serif'}));
  el.push(text(370,396,'See all →',12,ACC,{anchor:'end',fw:500}));

  // 2-col trending grid
  const trending=[
    {title:'Neon Nights Festival',cat:'Music',date:'Apr 18',color:ACC},
    {title:'Botanical Garden Tour',cat:'Outdoor',date:'Apr 19',color:ACC2},
    {title:'Ramen Pop-Up Night',cat:'Food',date:'Apr 20',color:'#8B5E3C'},
    {title:'Short Film Showcase',cat:'Film',date:'Apr 21',color:'#DC2626'},
  ];
  trending.forEach((ev,i)=>{
    const col=i%2, row=Math.floor(i/2);
    const tx=20+col*186, ty=410+row*155;
    el.push(rect(tx,ty,168,140,SURF,{rx:12}));
    el.push(rect(tx,ty,168,82,ev.color,{rx:12}));
    el.push(rect(tx,ty+70,168,12,ev.color)); // fill gap
    el.push(rect(tx+8,ty+8,54,20,'rgba(255,255,255,0.24)',{rx:10}));
    el.push(text(tx+35,ty+22,ev.date,10,SURF,{anchor:'middle',fw:600}));
    el.push(text(tx+10,ty+100,ev.title,13,TEXT,{fw:600,font:'Georgia, serif'}));
    el.push(text(tx+10,ty+118,ev.cat,11,MUTED));
    el.push(text(tx+152,ty+118,'♡',14,ACC,{anchor:'end'}));
  });

  // Bottom nav
  el.push(rect(0,762,W,82,SURF));
  el.push(line(0,762,W,762,DIVIDER));
  [
    {icon:'○',label:'Discover',active:false,x:58},
    {icon:'◉',label:'Browse',active:true,x:140},
    {icon:'◎',label:'Saved',active:false,x:222},
    {icon:'○',label:'Profile',active:false,x:304},
  ].forEach(n=>{
    const c=n.active?ACC:MUTED;
    el.push(text(n.x,790,n.icon,20,c,{anchor:'middle'}));
    el.push(text(n.x,808,n.label,10,c,{anchor:'middle',fw:n.active?600:400}));
  });
  el.push(circle(348,790,24,ACC));
  el.push(text(348,797,'+',20,SURF,{anchor:'middle',fw:300}));

  screens.push({name:'Browse',svg:null,elements:el});
})();

// ─────────────────────────────────────────────────────────────────
// SCREEN 4 · MAP
// ─────────────────────────────────────────────────────────────────
(function buildMap() {
  const el = [];
  // Map background — warm parchment
  el.push(rect(0,0,W,H,'#E8E2D8'));

  // Street grid — warm white lines
  for(let i=0;i<8;i++){
    el.push(rect(0,80+i*68,W,2,'rgba(255,255,255,0.65)'));
    el.push(rect(i*50,0,2,600,'rgba(255,255,255,0.65)'));
  }
  // City blocks
  const blocks=[
    [28,90,88,54],[138,88,78,58],[238,94,96,48],
    [28,162,68,58],[126,158,108,62],[258,168,78,58],
    [28,242,82,52],[142,238,88,58],[252,250,88,46],
    [28,320,98,54],[148,316,78,58],[248,330,86,46],
    [28,400,88,52],[138,396,98,56],[256,406,80,46],
    [28,476,80,50],[136,472,100,54],[256,480,82,46],
  ];
  blocks.forEach(([x,y,w,h])=>el.push(rect(x,y,w,h,'#CEC8BE',{rx:3})));

  // Park
  el.push(rect(108,295,116,100,'#BDD4B0',{rx:8}));
  el.push(text(166,352,'PARK',9,ACC2,{anchor:'middle',fw:700,ls:2}));

  // Water area
  el.push(rect(240,390,148,120,'#BDD0E8',{rx:6}));
  el.push(text(314,456,'BAY',9,'#3A6FA8',{anchor:'middle',fw:700,ls:2}));

  // Header overlay
  el.push(rect(0,0,W,82,'rgba(250,246,240,0.96)'));
  el.push(text(20,50,'9:41',13,TEXT,{fw:600}));
  el.push(text(195,50,'Map',17,TEXT,{anchor:'middle',fw:700}));
  el.push(rect(20,58,308,40,SURF,{rx:20,stroke:DIVIDER,sw:1}));
  el.push(text(46,82,'🔍  Search area…',13,MUTED));
  el.push(rect(336,58,40,40,ACC,{rx:20}));
  el.push(text(356,82,'⊞',16,SURF,{anchor:'middle'}));

  // Event pins
  const pins=[
    {x:198,y:210,label:'Jazz',color:ACC},
    {x:88,y:295,label:'Art',color:'#8B5E3C'},
    {x:294,y:358,label:'Film',color:'#DC2626'},
    {x:162,y:450,label:'Food',color:ACC2},
    {x:322,y:178,label:'Music',color:'#7C3AED'},
  ];
  pins.forEach(p=>{
    el.push(circle(p.x,p.y+3,13,'rgba(0,0,0,0.18)'));
    el.push(circle(p.x,p.y,17,p.color));
    el.push(text(p.x,p.y+5,'♦',11,SURF,{anchor:'middle'}));
    el.push(rect(p.x-22,p.y-36,44,18,SURF,{rx:9,stroke:p.color,sw:1}));
    el.push(text(p.x,p.y-24,p.label,9,p.color,{anchor:'middle',fw:700}));
  });
  // Selected pin — larger
  el.push(circle(198,207,22,ACC));
  el.push(text(198,213,'♦',14,SURF,{anchor:'middle'}));
  el.push(circle(198,229,4,ACC));

  // Locate button
  el.push(circle(352,548,22,SURF,{stroke:DIVIDER,sw:1}));
  el.push(text(352,554,'◎',17,ACC,{anchor:'middle'}));

  // Bottom sheet
  el.push(rect(0,580,W,H-580,SURF));
  el.push(rect(0,580,W,24,SURF,{rx:20}));
  el.push(rect(175,590,40,4,DIVIDER,{rx:2}));

  el.push(text(20,622,'5 events near you',18,TEXT,{fw:700,font:'Georgia, serif'}));
  el.push(text(20,640,'Within 1.5 miles · updated just now',12,MUTED));

  // Swipeable cards
  const nearby=[
    {title:'Jazz Under the Stars',sub:'Yerba Buena · 0.4mi',color:ACC},
    {title:'Latinx Art Exhibition',sub:'SFMOMA · 0.6mi',color:'#8B5E3C'},
    {title:'Ramen Pop-Up',sub:'Civic Center · 0.8mi',color:ACC2},
  ];
  nearby.forEach((ev,i)=>{
    const tx=20+i*172;
    el.push(rect(tx,658,158,82,CARD,{rx:12}));
    el.push(rect(tx,658,4,82,ev.color,{rx:2}));
    el.push(text(tx+14,678,ev.title,13,TEXT,{fw:600,font:'Georgia, serif'}));
    el.push(text(tx+14,696,ev.sub,11,MUTED));
    el.push(rect(tx+14,706,66,18,ev.color+'22',{rx:9}));
    el.push(text(tx+47,718,'Tap to view',9,ev.color,{anchor:'middle',fw:600}));
  });

  // Bottom nav
  el.push(rect(0,762,W,82,SURF));
  el.push(line(0,762,W,762,DIVIDER));
  [
    {icon:'○',label:'Discover',active:false,x:58},
    {icon:'◉',label:'Map',active:true,x:140},
    {icon:'◎',label:'Saved',active:false,x:222},
    {icon:'○',label:'Profile',active:false,x:304},
  ].forEach(n=>{
    const c=n.active?ACC:MUTED;
    el.push(text(n.x,790,n.icon,20,c,{anchor:'middle'}));
    el.push(text(n.x,808,n.label,10,c,{anchor:'middle',fw:n.active?600:400}));
  });
  el.push(circle(348,790,24,ACC));
  el.push(text(348,797,'+',20,SURF,{anchor:'middle',fw:300}));

  screens.push({name:'Map',svg:null,elements:el});
})();

// ─────────────────────────────────────────────────────────────────
// SCREEN 5 · SAVED
// ─────────────────────────────────────────────────────────────────
(function buildSaved() {
  const el = [];
  el.push(rect(0,0,W,H,BG));

  el.push(text(20,50,'9:41',13,TEXT,{fw:600}));
  el.push(text(370,50,'●●●',11,TEXT,{anchor:'end',opacity:0.5}));
  el.push(text(20,92,'Saved',36,TEXT,{fw:700,font:'Georgia, serif',ls:-0.5}));
  el.push(text(20,112,'8 events saved',13,MUTED));

  el.push(text(20,136,'APRIL 2026',10,MUTED,{fw:700,ls:2}));
  el.push(line(20,144,370,144,DIVIDER));

  const saved=[
    {title:'Jazz Under the Stars',    venue:'Yerba Buena Gardens',date:'FRI APR 11',color:ACC,      cat:'Music'},
    {title:'Latinx Art Exhibition',   venue:'SFMOMA',             date:'SAT APR 12',color:'#8B5E3C',cat:'Art'},
    {title:'Ferry Building Market',   venue:'Ferry Building',     date:'SUN APR 13',color:ACC2,     cat:'Food'},
    {title:'Alamo Cinema Night',      venue:'Alamo Square Park',  date:'SUN APR 14',color:'#DC2626',cat:'Film'},
    {title:'Neon Nights Festival',    venue:'Mission District',   date:'FRI APR 18',color:'#7C3AED',cat:'Music'},
  ];
  saved.forEach((ev,i)=>{
    const y=152+i*96;
    el.push(rect(20,y,350,84,SURF,{rx:12}));
    el.push(rect(20,y,4,84,ev.color,{rx:2}));
    // Date badge
    const dp=ev.date.split(' ');
    el.push(rect(32,y+12,48,48,ev.color+'26',{rx:8}));
    el.push(text(56,y+27,dp[0],8,ev.color,{anchor:'middle',fw:700,ls:1}));
    el.push(text(56,y+40,dp[1],9,ev.color,{anchor:'middle',fw:600}));
    el.push(text(56,y+54,dp[2],15,ev.color,{anchor:'middle',fw:700,font:'Georgia, serif'}));
    // Info
    el.push(text(94,y+28,ev.title,14,TEXT,{fw:700,font:'Georgia, serif'}));
    el.push(text(94,y+46,ev.venue,12,MUTED));
    const catW=ev.cat.length*8+14;
    el.push(rect(94,y+56,catW,18,ev.color+'22',{rx:9}));
    el.push(text(94+catW/2,y+68,ev.cat.toUpperCase(),8,ev.color,{anchor:'middle',fw:700,ls:1}));
    // Actions
    el.push(text(360,y+28,'♥',15,ACC,{anchor:'end'}));
    el.push(text(360,y+64,'›',18,MUTED,{anchor:'end'}));
  });

  // May section
  el.push(text(20,642,'MAY 2026',10,MUTED,{fw:700,ls:2}));
  el.push(line(20,650,370,650,DIVIDER));
  el.push(rect(20,658,350,66,SURF,{rx:12}));
  el.push(rect(20,658,4,66,'#7C3AED',{rx:2}));
  el.push(rect(32,670,48,42,'#F3F0FF',{rx:8}));
  el.push(text(56,683,'MAY',8,'#7C3AED',{anchor:'middle',fw:700,ls:1}));
  el.push(text(56,698,'17',15,'#7C3AED',{anchor:'middle',fw:700,font:'Georgia, serif'}));
  el.push(text(94,680,'Bay to Breakers Race',14,TEXT,{fw:700,font:'Georgia, serif'}));
  el.push(text(94,698,'Golden Gate Park · Free',12,MUTED));

  // Bottom nav
  el.push(rect(0,762,W,82,SURF));
  el.push(line(0,762,W,762,DIVIDER));
  [
    {icon:'○',label:'Discover',active:false,x:58},
    {icon:'⊙',label:'Map',active:false,x:140},
    {icon:'◉',label:'Saved',active:true,x:222},
    {icon:'○',label:'Profile',active:false,x:304},
  ].forEach(n=>{
    const c=n.active?ACC:MUTED;
    el.push(text(n.x,790,n.icon,20,c,{anchor:'middle'}));
    el.push(text(n.x,808,n.label,10,c,{anchor:'middle',fw:n.active?600:400}));
  });
  el.push(circle(348,790,24,ACC));
  el.push(text(348,797,'+',20,SURF,{anchor:'middle',fw:300}));

  screens.push({name:'Saved',svg:null,elements:el});
})();

// ─────────────────────────────────────────────────────────────────
// SCREEN 6 · PROFILE
// ─────────────────────────────────────────────────────────────────
(function buildProfile() {
  const el = [];
  el.push(rect(0,0,W,H,BG));

  el.push(text(20,50,'9:41',13,TEXT,{fw:600}));
  el.push(text(370,50,'●●●',11,TEXT,{anchor:'end',opacity:0.5}));
  el.push(text(20,92,'My Profile',34,TEXT,{fw:700,font:'Georgia, serif',ls:-0.5}));

  // Avatar
  el.push(circle(195,174,52,ACC+'33'));
  el.push(circle(195,174,44,ACC));
  el.push(text(195,182,'AK',22,SURF,{anchor:'middle',fw:700}));
  el.push(text(195,234,'Alex Kim',20,TEXT,{anchor:'middle',fw:700,font:'Georgia, serif'}));
  el.push(text(195,252,'San Francisco, CA',13,MUTED,{anchor:'middle'}));
  el.push(rect(143,264,104,30,CARD,{rx:15,stroke:DIVIDER,sw:1}));
  el.push(text(195,283,'Edit Profile',12,TEXT,{anchor:'middle',fw:500}));

  // Stats
  el.push(rect(20,306,350,64,SURF,{rx:12}));
  el.push(line(151,316,151,360,DIVIDER));
  el.push(line(239,316,239,360,DIVIDER));
  [{val:'47',label:'Attended',x:85},{val:'8',label:'Saved',x:195},{val:'12',label:'Reviews',x:305}]
    .forEach(s=>{
      el.push(text(s.x,334,s.val,22,TEXT,{anchor:'middle',fw:700,font:'Georgia, serif'}));
      el.push(text(s.x,352,s.label,11,MUTED,{anchor:'middle'}));
    });

  // Interests
  el.push(text(20,392,'My Interests',18,TEXT,{fw:700,font:'Georgia, serif'}));
  el.push(text(370,392,'Edit →',12,ACC,{anchor:'end',fw:500}));
  const interests=[
    {name:'Music',color:ACC,bg:LACC},
    {name:'Art',color:'#8B5E3C',bg:'#F5EAE2'},
    {name:'Outdoor',color:ACC2,bg:'#E8F2E8'},
    {name:'Food & Drink',color:'#D97706',bg:'#FFFBEB'},
    {name:'Film',color:'#DC2626',bg:'#FEF2F2'},
    {name:'Culture',color:'#7C3AED',bg:'#F3F0FF'},
  ];
  let tx=20,ty=410;
  interests.forEach(it=>{
    const w=it.name.length*8+20;
    if(tx+w>370){tx=20;ty+=36;}
    el.push(rect(tx,ty,w,28,it.bg,{rx:14,stroke:it.color+'44',sw:1}));
    el.push(text(tx+w/2,ty+18,it.name,12,it.color,{anchor:'middle',fw:600}));
    tx+=w+8;
  });

  // Notifications
  el.push(line(20,490,370,490,DIVIDER));
  el.push(text(20,514,'Notifications',18,TEXT,{fw:700,font:'Georgia, serif'}));
  const notifs=[
    {label:'New events near me',on:true},
    {label:'Event reminders',on:true},
    {label:'Friend activity',on:false},
  ];
  notifs.forEach((n,i)=>{
    const y=532+i*48;
    el.push(text(20,y+14,n.label,14,TEXT));
    el.push(rect(316,y,46,26,n.on?ACC:DIVIDER,{rx:13}));
    el.push(circle(n.on?351:329,y+13,10,SURF));
    el.push(line(20,y+38,370,y+38,DIVIDER));
  });

  // Sign out
  el.push(rect(20,686,350,48,CARD,{rx:12}));
  el.push(text(195,718,'Sign Out',14,'#DC2626',{anchor:'middle',fw:500}));

  // Bottom nav
  el.push(rect(0,762,W,82,SURF));
  el.push(line(0,762,W,762,DIVIDER));
  [
    {icon:'○',label:'Discover',active:false,x:58},
    {icon:'⊙',label:'Map',active:false,x:140},
    {icon:'◎',label:'Saved',active:false,x:222},
    {icon:'◉',label:'Profile',active:true,x:304},
  ].forEach(n=>{
    const c=n.active?ACC:MUTED;
    el.push(text(n.x,790,n.icon,20,c,{anchor:'middle'}));
    el.push(text(n.x,808,n.label,10,c,{anchor:'middle',fw:n.active?600:400}));
  });
  el.push(circle(348,790,24,ACC));
  el.push(text(348,797,'+',20,SURF,{anchor:'middle',fw:300}));

  screens.push({name:'Profile',svg:null,elements:el});
})();

// ─────────────────────────────────────────────────────────────────
// WRITE PEN FILE
// ─────────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    tagline: TAGLINE,
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'light',
    heartbeat: HEARTBEAT,
    elements: elCount,
    inspiration: 'Lapa Ninja serif revival (Victor Serif / Messina Sans on Future.app) + Land-book 1950s warm earthy palette',
    palette: { bg:BG, surface:SURF, accent:ACC, accent2:ACC2, text:TEXT },
  },
  screens,
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${elCount} elements`);
console.log(`Written: ${SLUG}.pen`);
