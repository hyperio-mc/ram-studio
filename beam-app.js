'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG = 'beam';
const NAME = 'BEAM';
const W = 390, H = 844;

// ── Palette (DARK — navy-dark inspired by Antimetal/Saaspo research) ──────────
const C = {
  bg:      '#090D1A',
  surf:    '#0D1220',
  card:    '#131A2E',
  card2:   '#0F1728',
  acc:     '#00D4FF',    // electric cyan
  acc2:    '#FF5B35',    // flame orange (errors)
  green:   '#10B981',
  warn:    '#F59E0B',
  text:    '#E2E8F0',
  muted:   'rgba(148,163,184,0.55)',
  border:  'rgba(255,255,255,0.06)',
  cyan10:  'rgba(0,212,255,0.10)',
  cyan20:  'rgba(0,212,255,0.20)',
  orange10:'rgba(255,91,53,0.12)',
  green10: 'rgba(16,185,129,0.12)',
  warn10:  'rgba(245,158,11,0.10)',
  white06: 'rgba(255,255,255,0.06)',
  white12: 'rgba(255,255,255,0.12)',
  white30: 'rgba(255,255,255,0.30)',
};

// ── Element registry ──────────────────────────────────────────────────────────
const allEls = [];
function push(obj) { allEls.push(obj); return obj; }

function rect(x,y,w,h,fill,opts={}) {
  return push({ type:'rect', x, y, width:w, height:h, fill,
    rx: opts.rx||0, opacity: opts.opacity!==undefined?opts.opacity:1,
    stroke: opts.stroke||'none', strokeWidth: opts.sw||0 });
}
function text(x,y,content,size,fill,opts={}) {
  return push({ type:'text', x, y, content, fontSize:size, fill,
    fontWeight: opts.fw||400, fontFamily: opts.font||'Inter',
    textAnchor: opts.anchor||'start', letterSpacing: opts.ls||0,
    opacity: opts.opacity!==undefined?opts.opacity:1 });
}
function circle(cx,cy,r,fill,opts={}) {
  return push({ type:'circle', cx, cy, r, fill,
    opacity: opts.opacity!==undefined?opts.opacity:1,
    stroke: opts.stroke||'none', strokeWidth: opts.sw||0 });
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  return push({ type:'line', x1, y1, x2, y2, stroke,
    strokeWidth: opts.sw||1, opacity: opts.opacity!==undefined?opts.opacity:1 });
}

// ── Reusable components ───────────────────────────────────────────────────────
function statusBar() {
  rect(0,0,W,44,C.bg);
  text(20,28,'9:41',13,C.text,{fw:600});
  for(let i=0;i<3;i++) circle(W-60+i*10,22,3,C.text,{opacity:0.35+i*0.25});
  rect(W-38,18,4,10,C.text,{rx:1,opacity:0.8});
  rect(W-31,14,4,14,C.text,{rx:1,opacity:0.8});
  rect(W-24,10,4,18,C.text,{rx:1,opacity:0.8});
  rect(W-14,16,12,14,C.white30,{rx:2});
  rect(W-13,17,10,12,C.text,{rx:1.5,opacity:0.9});
}

function navBar(activeIdx) {
  rect(0,H-82,W,82,C.surf);
  line(0,H-82,W,H-82,C.border,{sw:1});
  const tabs=[
    {icon:'◈',label:'Overview'},
    {icon:'⊹',label:'Traces'},
    {icon:'⌥',label:'Graph'},
    {icon:'⚡',label:'Alerts'},
    {icon:'◎',label:'Config'},
  ];
  const tw=(W-32)/5;
  tabs.forEach((t,i)=>{
    const tx=16+i*tw+tw/2;
    const active=i===activeIdx;
    if(active){
      rect(tx-22,H-78,44,4,C.acc,{rx:2});
      circle(tx,H-50,16,C.cyan10);
    }
    text(tx,H-43,t.icon,18,active?C.acc:C.muted,{anchor:'middle',fw:active?700:400});
    text(tx,H-27,t.label,10,active?C.acc:C.muted,{anchor:'middle',fw:active?600:400});
  });
}

function sectionLabel(x,y,label,action) {
  text(x,y,label.toUpperCase(),10,C.muted,{fw:700,ls:1.4});
  if(action) text(W-x,y,action,10,C.acc,{anchor:'end',fw:500});
}

// ── Collect per-screen element slices ─────────────────────────────────────────
const screens = [];
function beginScreen() { return allEls.length; }
function endScreen(label, startIdx) {
  screens.push({ label, start: startIdx, count: allEls.length - startIdx });
}

// ─────────────────────────────────────────────────────────────────────────────
// S1 — Overview dashboard (bento grid)
// ─────────────────────────────────────────────────────────────────────────────
{
  const s0 = beginScreen();
  rect(0,0,W,H,C.bg); // base
  statusBar();

  // Top bar
  rect(0,44,W,52,C.surf);
  text(20,70,'BEAM',20,C.acc,{fw:800,ls:3});
  text(82,70,'observability',13,C.muted);
  circle(W-46,66,5,C.green);
  text(W-38,70,'LIVE',11,C.green,{fw:700,ls:1.2});

  // Stat bento row (3 cells)
  const bw=Math.floor((W-40)/3);
  [
    {l:'UPTIME',v:'99.97%',s:'30d avg',c:C.green},
    {l:'P99 LAT',v:'142ms',s:'↓ 12ms',c:C.acc},
    {l:'ERR RATE',v:'0.03%',s:'↑ 0.01%',c:C.warn},
  ].forEach((d,i)=>{
    const bx=16+i*(bw+4);
    rect(bx,108,bw,80,C.card,{rx:12});
    rect(bx,108,bw,3,d.c,{rx:2}); // accent top
    text(bx+12,128,d.l,9,C.muted,{fw:700,ls:1.1});
    text(bx+12,155,d.v,20,d.c,{fw:800});
    text(bx+12,171,d.s,9,C.muted);
  });

  // Latency sparkline card
  rect(16,200,W-32,110,C.card,{rx:12});
  text(28,220,'Request Latency — P99',12,C.muted,{fw:600});
  text(28,244,'142',30,C.text,{fw:800});
  text(74,244,'ms',15,C.muted,{fw:400});
  text(W-28,240,'↓12ms this hour',11,C.green,{anchor:'end',fw:500});

  // sparkline
  const spts=[65,70,55,80,50,60,44,50,40,45,38,42,55,48,38,32,36,40,34,36];
  const [sl,st,sw2,sh]=[28,265,334,28];
  rect(sl,st,sw2,sh,C.cyan10,{rx:4,opacity:0.5});
  spts.forEach((p,i)=>{
    if(!i) return;
    const x1=sl+(i-1)*(sw2/(spts.length-1)), y1=st+sh-(spts[i-1]/80*sh);
    const x2=sl+i*(sw2/(spts.length-1)),     y2=st+sh-(p/80*sh);
    line(x1,y1,x2,y2,C.acc,{sw:1.5});
  });
  const lx=sl+sw2, ly=st+sh-(spts[spts.length-1]/80*sh);
  circle(lx,ly,4,C.acc);
  circle(lx,ly,9,C.cyan20,{opacity:0.5});
  ['6h ago','4h','2h','now'].forEach((t,i)=>text(sl+i*(sw2/3),306,t,9,C.muted));

  // Two half-width bentos
  const hw=(W-36)/2;
  // left — req/min
  rect(16,322,hw,90,C.card,{rx:12});
  text(28,344,'Requests / min',11,C.muted,{fw:500});
  text(28,370,'8,420',24,C.text,{fw:700});
  [0.55,0.7,0.5,0.85,0.65,0.9,1.0].forEach((h,i)=>{
    const bh=h*28;
    rect(28+i*14,406-bh,10,bh,i===6?C.acc:C.cyan10,{rx:2,opacity:i===6?1:0.7});
  });
  // right — services healthy
  rect(16+hw+4,322,hw,90,C.card,{rx:12});
  text(16+hw+16,344,'Services',11,C.muted,{fw:500});
  text(16+hw+16,370,'24',24,C.green,{fw:700});
  text(16+hw+46,370,'/24 online',12,C.muted);
  for(let r=0;r<3;r++) for(let c=0;c<8;c++){
    const dc=r===0&&c===7?C.warn:(r===2&&c===5?C.acc2:C.green);
    circle(16+hw+16+c*16,388+r*10,4,dc,{opacity:dc===C.green?0.7:1});
  }

  // Services list
  sectionLabel(16,428,'Top Services','all →');
  [
    {n:'api-gateway',rps:'2,340/s',lat:'98ms',c:C.green},
    {n:'auth-service',rps:'1,820/s',lat:'45ms',c:C.green},
    {n:'data-pipeline',rps:'940/s',lat:'312ms',c:C.warn},
    {n:'notification',rps:'620/s',lat:'67ms',c:C.green},
  ].forEach((sv,i)=>{
    const ry=444+i*48;
    rect(16,ry,W-32,44,C.card,{rx:10});
    circle(32,ry+22,5,sv.c);
    text(44,ry+18,sv.n,12,C.text,{fw:500,font:'monospace'});
    text(44,ry+33,sv.rps,10,C.muted);
    text(W-20,ry+18,sv.lat,12,sv.lat==='312ms'?C.warn:C.muted,{anchor:'end',fw:600});
    line(44,ry+38,W-20,ry+38,C.border,{sw:1,opacity:0.6});
  });

  navBar(0);
  endScreen('Overview', s0);
}

// ─────────────────────────────────────────────────────────────────────────────
// S2 — Trace Explorer (waterfall)
// ─────────────────────────────────────────────────────────────────────────────
{
  const s0 = beginScreen();
  rect(0,0,W,H,C.bg);
  statusBar();

  rect(0,44,W,52,C.surf);
  text(20,70,'Trace Explorer',17,C.text,{fw:700});
  text(20,84,'Distributed span timeline',11,C.muted);

  // Search bar
  rect(16,104,W-32,40,C.card,{rx:10,stroke:C.border,sw:1});
  text(32,129,'⌕',16,C.muted);
  text(52,129,'Search trace ID or service…',12,C.muted);

  // Filter chips
  const chips=[{l:'All',a:true},{l:'Error',a:false},{l:'>200ms',a:false},{l:'Critical',a:false}];
  let chipX=16;
  chips.forEach(ch=>{
    const cw=ch.l.length*7+20;
    rect(chipX,152,cw,26,ch.a?C.cyan20:C.white06,{rx:13,stroke:ch.a?C.acc:C.border,sw:1});
    text(chipX+cw/2,169,ch.l,11,ch.a?C.acc:C.muted,{anchor:'middle',fw:ch.a?600:400});
    chipX+=cw+8;
  });

  // Selected trace card
  rect(16,190,W-32,52,C.card,{rx:12});
  rect(16,190,4,52,C.acc2,{rx:2});
  text(28,210,'POST /api/checkout',13,C.text,{fw:600,font:'monospace'});
  text(28,228,'trace_7f2a1c · api-gateway',11,C.muted);
  text(W-20,210,'524ms',13,C.acc2,{anchor:'end',fw:700});
  text(W-20,228,'SLOW',10,C.acc2,{anchor:'end',fw:700,ls:1});

  // Waterfall
  sectionLabel(16,258,'Spans','12 total');
  const spans=[
    {n:'api-gateway',  st:0,    dur:1.0,  c:C.acc,   d:0, ms:'524ms'},
    {n:'auth-service', st:0.02, dur:0.08, c:C.green, d:1, ms:'42ms'},
    {n:'user-store',   st:0.04, dur:0.05, c:C.green, d:2, ms:'26ms'},
    {n:'cart-service', st:0.10, dur:0.55, c:C.warn,  d:1, ms:'289ms'},
    {n:'inventory-db', st:0.12, dur:0.20, c:C.warn,  d:2, ms:'105ms'},
    {n:'pricing-eng',  st:0.32, dur:0.32, c:C.acc2,  d:2, ms:'168ms'},
    {n:'payment-svc',  st:0.65, dur:0.30, c:C.acc,   d:1, ms:'157ms'},
    {n:'stripe-api',   st:0.67, dur:0.26, c:C.green, d:2, ms:'136ms'},
  ];
  const [wtl,wtr]=[16,W-16], wtw=wtr-wtl, barStart=wtl+130;
  spans.forEach((sp,i)=>{
    const ry=274+i*44;
    rect(wtl,ry,W-32,40,i%2===0?C.white06:'transparent',{rx:8});
    if(sp.d>0){ rect(wtl+sp.d*10-4,ry+10,2,20,C.border,{rx:1}); }
    text(wtl+sp.d*10+6,ry+15,sp.n,10,C.text,{fw:500,font:'monospace'});
    const bx=barStart+((wtr-barStart)*sp.st);
    const bw3=Math.max(4,(wtr-barStart)*sp.dur);
    rect(bx,ry+25,bw3,10,sp.c,{rx:5,opacity:0.8});
    text(W-20,ry+15,sp.ms,10,sp.c,{anchor:'end',fw:600});
  });

  // Timescale
  ['0','100','200','300','400','500ms'].forEach((t,i)=>
    text(barStart+i*((W-16-barStart)/5),275+spans.length*44+14,t,9,C.muted)
  );

  navBar(1);
  endScreen('Trace Explorer', s0);
}

// ─────────────────────────────────────────────────────────────────────────────
// S3 — Service Dependency Graph
// ─────────────────────────────────────────────────────────────────────────────
{
  const s0 = beginScreen();
  rect(0,0,W,H,C.bg);
  statusBar();

  rect(0,44,W,52,C.surf);
  text(20,70,'Service Graph',17,C.text,{fw:700});
  text(20,84,'Dependency topology · live',11,C.muted);

  // canvas
  rect(0,100,W,500,C.surf,{opacity:0.35});
  for(let gx=20;gx<W;gx+=28) for(let gy=112;gy<600;gy+=28)
    circle(gx,gy,1,C.white12,{opacity:0.25});

  // nodes
  const nodes=[
    {id:'api',  x:195, y:185, s:'API\nGW',   c:C.acc,   r:28, rps:'8.4k'},
    {id:'auth', x:85,  y:295, s:'AUTH',      c:C.green, r:22, rps:'1.8k'},
    {id:'usr',  x:90,  y:405, s:'USER',      c:C.green, r:17, rps:'920'},
    {id:'cart', x:195, y:345, s:'CART',      c:C.warn,  r:24, rps:'2.3k'},
    {id:'inv',  x:130, y:465, s:'INV',       c:C.warn,  r:17, rps:'640'},
    {id:'prc',  x:255, y:455, s:'PRICE',     c:C.acc2,  r:18, rps:'760'},
    {id:'pay',  x:315, y:295, s:'PAY',       c:C.acc,   r:22, rps:'920'},
    {id:'ntf',  x:320, y:420, s:'NOTIF',     c:C.green, r:16, rps:'310'},
  ];
  const nmap={};
  nodes.forEach(n=>nmap[n.id]=n);

  // edges
  const edges=[
    ['api','auth'],['api','cart'],['api','pay'],
    ['auth','usr'],['cart','inv'],['cart','prc'],
    ['pay','ntf'],
  ];
  edges.forEach(([a,b])=>{
    const na=nmap[a], nb=nmap[b];
    const slow=a==='cart'&&b==='prc';
    line(na.x,na.y,nb.x,nb.y,slow?C.warn:C.white12,{sw:slow?2:1.5,opacity:slow?0.6:0.4});
    circle((na.x+nb.x)/2,(na.y+nb.y)/2,3,slow?C.warn:C.acc,{opacity:0.4});
  });

  // node circles
  nodes.forEach(n=>{
    circle(n.x,n.y,n.r+7,n.c,{opacity:0.10});
    circle(n.x,n.y,n.r,C.card);
    circle(n.x,n.y,n.r,n.c,{opacity:0.15,stroke:n.c,sw:1.5});
    text(n.x,n.y+4,n.s,9,n.c,{anchor:'middle',fw:700,font:'monospace'});
    // rps badge
    text(n.x,n.y+n.r+14,n.rps,9,C.muted,{anchor:'middle'});
  });

  // legend
  rect(16,612,W-32,64,C.card,{rx:12});
  [{l:'Healthy',c:C.green},{l:'Degraded',c:C.warn},{l:'Error',c:C.acc2},{l:'Core',c:C.acc}]
    .forEach((lg,i)=>{
      circle(30+i*88,644,6,lg.c);
      text(40+i*88,648,lg.l,10,C.muted);
    });
  text(W/2,668,'24 services · updated 3s ago',10,C.muted,{anchor:'middle'});

  navBar(2);
  endScreen('Service Graph', s0);
}

// ─────────────────────────────────────────────────────────────────────────────
// S4 — Incidents & Alerts
// ─────────────────────────────────────────────────────────────────────────────
{
  const s0 = beginScreen();
  rect(0,0,W,H,C.bg);
  statusBar();

  rect(0,44,W,52,C.surf);
  text(20,70,'Incidents',17,C.text,{fw:700});

  // summary chips
  [{n:'2',l:'Critical',c:C.acc2},{n:'5',l:'Warning',c:C.warn},{n:'14',l:'Info',c:C.acc},{n:'21',l:'Total',c:C.muted}]
    .forEach((s,i)=>{
      const cw=(W-36)/4, cx=16+i*(cw+4);
      rect(cx,108,cw,54,C.card,{rx:10});
      text(cx+cw/2,130,s.n,22,s.c,{anchor:'middle',fw:700});
      text(cx+cw/2,148,s.l,9,C.muted,{anchor:'middle',fw:500});
    });

  // incident list
  sectionLabel(16,178,'Active','filter');
  const incidents=[
    {t:'pricing-engine P99 > 200ms',  sv:'pricing',  age:'4m ago', sev:'CRITICAL',c:C.acc2, msg:'Spike in response time detected'},
    {t:'cart-service 5xx elevated',   sv:'cart',     age:'18m',    sev:'CRITICAL',c:C.acc2, msg:'Error rate: 0.42% (threshold 0.1%)'},
    {t:'inventory-db slow queries',   sv:'inventory',age:'1h ago', sev:'WARNING', c:C.warn, msg:'P95 query duration: 340ms'},
    {t:'auth token refresh rate +42%',sv:'auth',     age:'2h ago', sev:'WARNING', c:C.warn, msg:'Refresh req/s above baseline'},
    {t:'notification queue depth',    sv:'notify',   age:'3h ago', sev:'INFO',    c:C.acc,  msg:'Queue depth: 2,840 pending'},
  ];
  incidents.forEach((inc,i)=>{
    const iy=194+i*110;
    rect(16,iy,W-32,102,C.card,{rx:12});
    rect(16,iy,4,102,inc.c,{rx:2});
    // sev chip
    const chipW=inc.sev.length*6.5+14;
    rect(28,iy+12,chipW,20,inc.c,{rx:10,opacity:0.15});
    text(35,iy+25,inc.sev,10,inc.c,{fw:700,ls:0.8});
    text(W-20,iy+25,inc.age,10,C.muted,{anchor:'end'});
    text(28,iy+50,inc.t,12,C.text,{fw:600});
    text(28,iy+66,inc.sv,10,C.acc,{fw:500,font:'monospace'});
    text(28,iy+82,inc.msg,10,C.muted);
    text(W-20,iy+78,'···',14,C.muted,{anchor:'end'});
  });

  navBar(3);
  endScreen('Incidents', s0);
}

// ─────────────────────────────────────────────────────────────────────────────
// S5 — Performance Report
// ─────────────────────────────────────────────────────────────────────────────
{
  const s0 = beginScreen();
  rect(0,0,W,H,C.bg);
  statusBar();

  rect(0,44,W,52,C.surf);
  text(20,70,'Performance',17,C.text,{fw:700});
  text(20,84,'Weekly report · Apr 3–9',11,C.muted);

  // health score hero card
  rect(16,108,W-32,94,C.card,{rx:14});
  rect(16,108,W-32,3,C.acc,{rx:2});
  text(28,133,'Overall Health Score',12,C.muted,{fw:500,ls:0.4});
  text(28,166,'97.4',44,C.green,{fw:800});
  text(88,166,'/100',17,C.muted);
  text(W-20,133,'↑ 2.1 pts',12,C.green,{anchor:'end',fw:600});
  text(W-20,155,'vs last week',10,C.muted,{anchor:'end'});
  rect(28,182,(W-56)*0.974,8,C.green,{rx:4,opacity:0.85});
  rect(28,182,W-56,8,C.white06,{rx:4});
  rect(28,182,(W-56)*0.974,8,C.green,{rx:4,opacity:0.85});

  // SLO bars
  sectionLabel(16,220,'SLO Compliance','this week');
  [
    {l:'Availability',p:99.97,t:'99.9%',c:C.green},
    {l:'P99 Latency < 200ms',p:96.4,t:'95%',c:C.acc},
    {l:'Error Rate < 0.1%',p:87.2,t:'99%',c:C.warn},
    {l:'P50 Latency < 80ms',p:99.1,t:'98%',c:C.green},
  ].forEach((s,i)=>{
    const sy=238+i*68;
    rect(16,sy,W-32,60,C.card,{rx:10});
    text(28,sy+20,s.l,12,C.text,{fw:500});
    text(W-20,sy+20,s.p+'%',12,s.c,{anchor:'end',fw:700});
    text(28,sy+35,'Target: '+s.t,10,C.muted);
    rect(28,sy+44,W-56,6,C.white06,{rx:3});
    rect(28,sy+44,(W-56)*(s.p/100),6,s.c,{rx:3,opacity:0.8});
  });

  // Request volume bars
  sectionLabel(16,524,'Request Volume','by service');
  [
    {n:'api-gateway', p:1.00, v:'8,420/min'},
    {n:'cart-service',p:0.55, v:'4,620/min'},
    {n:'auth-service',p:0.43, v:'3,620/min'},
    {n:'payment-svc', p:0.22, v:'1,840/min'},
    {n:'notify',      p:0.07, v:'620/min'},
  ].forEach((v,i)=>{
    const vy=542+i*40;
    text(16,vy+14,v.n,11,C.muted,{font:'monospace'});
    const bx=126, bw=W-32-110;
    rect(bx,vy+4,bw,15,C.white06,{rx:4});
    rect(bx,vy+4,bw*v.p,15,i===0?C.acc:C.white12,{rx:4,opacity:i===0?0.75:0.45});
    text(W-16,vy+14,v.v,10,C.muted,{anchor:'end',fw:500});
  });

  navBar(0);
  endScreen('Performance', s0);
}

// ─────────────────────────────────────────────────────────────────────────────
// S6 — Configuration & Integrations
// ─────────────────────────────────────────────────────────────────────────────
{
  const s0 = beginScreen();
  rect(0,0,W,H,C.bg);
  statusBar();

  rect(0,44,W,52,C.surf);
  text(20,70,'Configuration',17,C.text,{fw:700});

  // team card
  rect(16,108,W-32,78,C.card,{rx:12});
  text(28,132,'Team Workspace',12,C.text,{fw:600});
  text(28,150,'Acme Corp · Pro plan',11,C.muted);
  const avCs=[C.acc,C.green,C.warn,C.acc2,'#A78BFA'];
  const avIs=['AK','BR','CS','DJ','EL'];
  avCs.forEach((c,i)=>{
    circle(28+i*36,170,14,c,{opacity:0.18});
    circle(28+i*36,170,14,c,{stroke:c,sw:1.5,opacity:0.35});
    text(28+i*36,174,avIs[i],8,c,{anchor:'middle',fw:700});
  });
  text(W-20,170,'+ 8 more',10,C.muted,{anchor:'end'});

  // Integrations
  sectionLabel(16,206,'Integrations','manage');
  [
    {n:'PagerDuty', st:'Connected',     on:true,  ic:'⚡', d:'Alert routing & on-call'},
    {n:'Slack',     st:'Connected',     on:true,  ic:'◈',  d:'#ops-alerts channel'},
    {n:'DataDog',   st:'Sync active',   on:true,  ic:'⊹',  d:'Metrics forwarding'},
    {n:'GitHub',    st:'Not connected', on:false, ic:'◎',  d:'Deploy event tracking'},
    {n:'Jira',      st:'Not connected', on:false, ic:'⌥',  d:'Auto-create incidents'},
  ].forEach((ig,i)=>{
    const iy=222+i*70;
    rect(16,iy,W-32,62,C.card,{rx:12});
    rect(28,iy+13,34,34,ig.on?C.cyan10:C.white06,{rx:9});
    text(45,iy+34,ig.ic,15,ig.on?C.acc:C.muted,{anchor:'middle'});
    text(70,iy+30,ig.n,13,C.text,{fw:600});
    text(70,iy+46,ig.d,10,C.muted);
    const chipW=ig.st.length*6+16;
    rect(W-20-chipW,iy+20,chipW,20,ig.on?C.green10:C.white06,{rx:10});
    text(W-20,iy+33,ig.st,9,ig.on?C.green:C.muted,{anchor:'end',fw:ig.on?600:400});
  });

  // Thresholds
  sectionLabel(16,596,'Alert Thresholds','edit');
  [
    {l:'Error rate',  v:'0.1%',  ic:'⚠'},
    {l:'P99 latency', v:'200ms', ic:'⏱'},
    {l:'CPU usage',   v:'80%',   ic:'◉'},
  ].forEach((th,i)=>{
    const ty=614+i*42;
    rect(16,ty,W-32,36,C.card,{rx:8});
    text(28,ty+23,th.ic,12,C.muted);
    text(44,ty+23,th.l,12,C.muted,{fw:400});
    text(W-20,ty+23,th.v,12,C.acc,{anchor:'end',fw:600,font:'monospace'});
  });

  navBar(4);
  endScreen('Configuration', s0);
}

// ─────────────────────────────────────────────────────────────────────────────
// Assemble pen file
// ─────────────────────────────────────────────────────────────────────────────
function toSvg(els) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n` +
    els.map(e=>{
      if(e.type==='rect')
        return `<rect x="${e.x}" y="${e.y}" width="${e.width}" height="${e.height}" fill="${e.fill}" rx="${e.rx||0}" opacity="${e.opacity!==undefined?e.opacity:1}" stroke="${e.stroke||'none'}" stroke-width="${e.strokeWidth||0}"/>`;
      if(e.type==='text')
        return `<text x="${e.x}" y="${e.y}" font-size="${e.fontSize}" fill="${e.fill}" font-weight="${e.fontWeight||400}" font-family="${e.fontFamily||'Inter'}" text-anchor="${e.textAnchor||'start'}" letter-spacing="${e.letterSpacing||0}" opacity="${e.opacity!==undefined?e.opacity:1}">${e.content}</text>`;
      if(e.type==='circle')
        return `<circle cx="${e.cx}" cy="${e.cy}" r="${e.r}" fill="${e.fill}" opacity="${e.opacity!==undefined?e.opacity:1}" stroke="${e.stroke||'none'}" stroke-width="${e.strokeWidth||0}"/>`;
      if(e.type==='line')
        return `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${e.stroke}" stroke-width="${e.strokeWidth||1}" opacity="${e.opacity!==undefined?e.opacity:1}"/>`;
      return '';
    }).join('\n') + '\n</svg>';
}

const pen = {
  version: '2.8',
  metadata: {
    name: 'BEAM — API Observability Platform',
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'dark',
    heartbeat: 42,
    elements: allEls.length,
    description: "Distributed tracing + API observability. Inspired by Antimetal's asymmetric bento grid (saaspo.com) and navy-dark palettes from darkmodedesign.com. Linear-design-but-bolder aesthetic with monospace type as brand signal.",
  },
  screens: screens.map(s=>({
    name: s.label,
    svg: toSvg(allEls.slice(s.start, s.start+s.count)),
    elements: allEls.slice(s.start, s.start+s.count),
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${allEls.length} elements total`);
screens.forEach(s=>console.log(`  · ${s.label}: ${s.count} elements`));
console.log(`Written: ${SLUG}.pen`);
