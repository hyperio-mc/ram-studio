'use strict';
const fs   = require('fs');
const path = require('path');

// ─── MELD — Unified Data Pipeline Monitor ──────────────────────────────────
// Heartbeat design — DARK theme
// Inspired by:
//   • darkmodedesign.com — Qase (QA platform): deep navy backgrounds with
//     cosmic/galactic glow effects; Cosmos Studio: ambient orb backgrounds;
//     Darkroom: inner-glow stroke effects on interactive elements
//   • saaspo.com — Betterstack: bento grid feature cards + developer-tool dark
//     palettes; transparency on pricing/metrics as primary design element
// Challenge: Dark glassmorphism with ambient orb glow backgrounds, frosted
//   glass card panels using inner-stroke simulation, neon inner-glow buttons,
//   and bento-grid dashboard layout — none of which RAM has used in this form.
// ──────────────────────────────────────────────────────────────────────────

const SLUG = 'meld';
const NAME = 'MELD';
const W    = 390;
const H    = 844;

// Palette — deep navy dark glassmorphism
const BG   = '#060C18';
const SURF = '#0D1625';
const CARD = '#132030';
const ACC  = '#3A82FF';  // electric blue
const ACC2 = '#22C55E';  // neon green
const PUR  = '#8B5CF6';  // purple accent
const WARN = '#F59E0B';  // amber
const ERR  = '#EF4444';  // red
const TEXT = '#E0E8F8';
const MUTE = '#5E78A0';

function h2r(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return [r,g,b];
}
function rgba(hex, a) {
  const [r,g,b] = h2r(hex);
  return `rgba(${r},${g},${b},${a})`;
}

// ── Primitives ──────────────────────────────────────────────────────────────
function rect(x,y,w,h,fill,o={}) {
  return { type:'rect', x:Math.round(x), y:Math.round(y),
    w:Math.max(1,Math.round(w)), h:Math.max(1,Math.round(h)), fill,
    rx: o.rx??0, opacity: o.opacity??1,
    stroke: o.stroke??'none', sw: o.sw??0 };
}
function text(x,y,content,size,fill,o={}) {
  return { type:'text', x:Math.round(x), y:Math.round(y),
    content:String(content), size, fill,
    fw: o.fw??400, font: o.font??'Inter',
    anchor: o.anchor??'start', ls: o.ls??0, opacity: o.opacity??1 };
}
function circle(cx,cy,r,fill,o={}) {
  return { type:'circle', cx:Math.round(cx), cy:Math.round(cy),
    r:Math.max(1,Math.round(r)), fill,
    opacity: o.opacity??1, stroke: o.stroke??'none', sw: o.sw??0 };
}
function line(x1,y1,x2,y2,stroke,o={}) {
  return { type:'line',
    x1:Math.round(x1),y1:Math.round(y1),
    x2:Math.round(x2),y2:Math.round(y2),
    stroke, sw: o.sw??1, opacity: o.opacity??1 };
}

// ── Compound components ──────────────────────────────────────────────────────

// Ambient glow orb — layers of circles simulating radial gradient
function orb(cx, cy, R, color, peak=0.12) {
  const e = [];
  const steps = 6;
  for (let i = steps; i >= 1; i--) {
    const r = R * (i/steps);
    const op = peak * Math.pow(1 - (i-1)/steps, 1.5) * 0.6;
    e.push(circle(cx, cy, r, color, { opacity: op }));
  }
  e.push(circle(cx, cy, R*0.18, color, { opacity: peak }));
  return e;
}

// Glass card — frosted panel simulation
function glass(x,y,w,h,o={}) {
  const { rx=12, accentTop=false, accentColor=ACC, glowRing=false } = o;
  const e = [];
  if (glowRing) {
    e.push(rect(x-3,y-3,w+6,h+6,'none',{ rx:rx+3, stroke:rgba(accentColor,0.1), sw:1 }));
  }
  e.push(rect(x,y,w,h, SURF, { rx, opacity:0.88 }));
  // Outer border
  e.push(rect(x,y,w,h,'none',{ rx, stroke:'rgba(255,255,255,0.07)', sw:1 }));
  // Top highlight
  e.push(rect(x+2,y+1,w-4,1,'rgba(255,255,255,0.10)',{ rx:0 }));
  if (accentTop) {
    e.push(rect(x+1,y,w-2,2,accentColor,{ rx:1, opacity:0.55 }));
  }
  return e;
}

// Status pill
function pill(x,y,label,color) {
  const w = 14 + label.length * 6.8;
  const e = [];
  e.push(rect(x,y-9,w,17,rgba(color,0.15),{ rx:9 }));
  e.push(rect(x,y-9,w,17,'none',{ rx:9, stroke:rgba(color,0.3), sw:1 }));
  e.push(circle(x+8,y-0.5,3,color,{ opacity:0.9 }));
  e.push(text(x+16,y+4,label,9,color,{ fw:700, font:'Inter' }));
  return e;
}

// Inner-glow button
function btn(x,y,w,h,label,color=ACC) {
  const e = [];
  e.push(rect(x-2,y-2,w+4,h+4,'none',{ rx:h/2+2, stroke:rgba(color,0.18), sw:1 }));
  e.push(rect(x,y,w,h,rgba(color,0.18),{ rx:h/2 }));
  e.push(rect(x,y,w,h,'none',{ rx:h/2, stroke:rgba(color,0.45), sw:1 }));
  e.push(rect(x+2,y+1,w-4,1,rgba(color,0.25),{ rx:1 }));
  e.push(text(x+w/2,y+h/2+4,label,12,color,{ fw:600, anchor:'middle' }));
  return e;
}

// Progress bar with glow tip
function prog(x,y,w,pct,color=ACC) {
  const e = [];
  e.push(rect(x,y,w,4,'rgba(255,255,255,0.07)',{ rx:2 }));
  const fw = Math.max(4, w*pct);
  e.push(rect(x,y,fw,4,color,{ rx:2 }));
  e.push(circle(x+fw,y+2,3,color,{ opacity:0.6 }));
  return e;
}

// Sparkline
function spark(x,y,W2,data,color=ACC) {
  const e = [];
  const step = W2/(data.length-1);
  const mx = Math.max(...data), mn = Math.min(...data);
  const rng = mx-mn||1;
  const SH = 28;
  for (let i=0;i<data.length-1;i++) {
    const y1 = y+SH - ((data[i]-mn)/rng)*SH;
    const y2 = y+SH - ((data[i+1]-mn)/rng)*SH;
    e.push(line(x+i*step,y1,x+(i+1)*step,y2,color,{ sw:1.5, opacity:0.85 }));
  }
  const lx=x+(data.length-1)*step;
  const ly=y+SH-((data[data.length-1]-mn)/rng)*SH;
  e.push(circle(lx,ly,3,color));
  e.push(circle(lx,ly,5,color,{ opacity:0.2 }));
  return e;
}

// Toggle switch
function toggle(x,y,on,color=ACC) {
  const e = [];
  const tw=44, th=24;
  e.push(rect(x,y,tw,th,on?rgba(color,0.25):'rgba(255,255,255,0.07)',{ rx:th/2 }));
  e.push(rect(x,y,tw,th,'none',{ rx:th/2, stroke:on?rgba(color,0.45):'rgba(255,255,255,0.12)', sw:1 }));
  const kx = on ? x+tw-th/2-2 : x+th/2+2;
  e.push(circle(kx,y+th/2,th/2-3,on?color:'#4A5F7C'));
  if (on) e.push(circle(kx,y+th/2,4,'rgba(255,255,255,0.85)'));
  return e;
}

// Bottom nav bar
function nav(active) {
  const tabs=['Home','Sources','Log','Alerts','Settings'];
  const e = [];
  e.push(rect(0,H-60,W,60,'#07101F',{ opacity:0.97 }));
  e.push(line(0,H-60,W,H-60,'rgba(255,255,255,0.06)'));
  tabs.forEach((lbl,i) => {
    const tx = (W/tabs.length)*(i+0.5);
    const isA = i===active;
    const clr = isA ? ACC : MUTE;
    if (isA) {
      e.push(rect(tx-22,H-57,44,3,ACC,{ rx:1.5 }));
      e.push(circle(tx,H-38,11,rgba(ACC,0.12)));
    }
    e.push(circle(tx,H-38,isA?6:5,clr,{ opacity:isA?1:0.75 }));
    e.push(text(tx,H-12,lbl,9,clr,{ anchor:'middle', fw:isA?600:400 }));
  });
  return e;
}

// Status bar
function statusBar() {
  return [
    rect(0,0,W,44,BG),
    text(16,30,'9:41',13,TEXT,{ fw:600 }),
    text(W-16,30,'●●●  ◀  87%',11,MUTE,{ anchor:'end' }),
  ];
}

// ── SCREENS ──────────────────────────────────────────────────────────────────

function buildDashboard() {
  const e = [];
  e.push(rect(0,0,W,H,BG));
  // Ambient orbs
  e.push(...orb(330,190,148,ACC,0.11));
  e.push(...orb(55,600,110,ACC2,0.09));
  e.push(...orb(195,760,72,PUR,0.07));
  e.push(...statusBar());

  // Header
  e.push(text(16,70,'MELD',22,TEXT,{ fw:700, ls:3 }));
  e.push(text(16,88,'Pipeline Monitor',11,MUTE));
  e.push(...pill(W-94,78,'ALL LIVE',ACC2));

  // ── Hero metric card ──
  const hy=106;
  e.push(...glass(12,hy,W-24,102,{ rx:16, accentTop:true, accentColor:ACC }));
  e.push(text(24,hy+20,'Events Processed',10,MUTE));
  e.push(text(24,hy+56,'2,847,391',30,TEXT,{ fw:700 }));
  e.push(text(24,hy+76,'▲ 14.2%',11,ACC2));
  e.push(text(90,hy+76,'vs yesterday',11,MUTE));
  e.push(...spark(W-128,hy+30,106,[40,55,48,62,58,72,68,81,79,93,88,100],ACC));

  // ── Row 1: 2 metric cards ──
  const r1y=hy+112;
  const hw=(W-24-8)/2;
  // Card A: Sources Online
  e.push(...glass(12,r1y,hw,96,{ rx:12 }));
  e.push(text(22,r1y+18,'Sources',10,MUTE));
  e.push(text(22,r1y+50,'12',28,ACC,{ fw:700 }));
  e.push(text(22,r1y+72,'connected',10,ACC2));
  [0,1,2].forEach(c=>[0,1].forEach(r=>{
    e.push(circle(60+c*14,r1y+46+r*12,3,ACC2,{ opacity:0.25+r*0.2+c*0.05 }));
  }));
  // Card B: Avg Latency
  e.push(...glass(12+hw+8,r1y,hw,96,{ rx:12 }));
  e.push(text(22+hw+8,r1y+18,'Avg Latency',10,MUTE));
  e.push(text(22+hw+8,r1y+50,'38ms',28,TEXT,{ fw:700 }));
  e.push(text(22+hw+8,r1y+72,'▼ 4ms faster',10,ACC2));

  // ── Row 2: 3 small stat cards ──
  const r2y=r1y+106;
  const tw=(W-24-16)/3;
  const stats=[
    { lbl:'Success', val:'99.7%', clr:ACC2, pct:0.997 },
    { lbl:'Errors',  val:'8',    clr:ERR,  pct:0.008 },
    { lbl:'Warns',   val:'24',   clr:WARN, pct:0.024 },
  ];
  stats.forEach((s,i) => {
    const sx=12+i*(tw+8);
    e.push(...glass(sx,r2y,tw,80,{ rx:10 }));
    e.push(text(sx+8,r2y+16,s.lbl,9,MUTE));
    e.push(text(sx+8,r2y+44,s.val,18,s.clr,{ fw:700 }));
    e.push(...prog(sx+6,r2y+58,tw-12,s.pct,s.clr));
  });

  // ── Live events card ──
  const ley=r2y+92;
  e.push(...glass(12,ley,W-24,170,{ rx:12 }));
  e.push(text(22,ley+18,'Live Events',11,TEXT,{ fw:600 }));
  e.push(circle(W-28,ley+14,4,ERR,{ opacity:0.9 }));
  e.push(circle(W-28,ley+14,7,ERR,{ opacity:0.15 }));
  e.push(text(W-20,ley+18,'LIVE',9,ERR,{ fw:700 }));
  e.push(line(12,ley+28,W-12,ley+28,'rgba(255,255,255,0.05)'));

  const evts=[
    { msg:'shopify.orders → warehouse.db',    t:'0s',  c:ACC2 },
    { msg:'stripe.events → analytics.pipe',   t:'1s',  c:ACC2 },
    { msg:'auth.failed → alerts.queue',        t:'3s',  c:ERR  },
    { msg:'postgres.sync → data.lake',         t:'5s',  c:ACC  },
    { msg:'salesforce.crm → events.stream',   t:'8s',  c:ACC  },
  ];
  evts.forEach((ev,i) => {
    const ey2=ley+42+i*24;
    e.push(circle(25,ey2,3,ev.c,{ opacity:0.85 }));
    e.push(text(36,ey2+4,ev.msg,10,rgba(TEXT,0.82),{ font:'Inter Mono' }));
    e.push(text(W-18,ey2+4,ev.t+' ago',9,MUTE,{ anchor:'end' }));
    if(i<evts.length-1) e.push(line(16,ey2+14,W-16,ey2+14,'rgba(255,255,255,0.04)'));
  });

  // ── Throughput mini-card ──
  const thy=ley+182;
  e.push(...glass(12,thy,W-24,94,{ rx:12 }));
  e.push(text(22,thy+18,'Throughput (1h)',11,MUTE));
  e.push(text(22,thy+42,'2.8k',22,TEXT,{ fw:700 }));
  e.push(text(70,thy+42,'events/min',11,MUTE));
  e.push(...spark(W-148,thy+20,130,[60,72,68,85,79,90,88,95,100,92,98,102,110,106,112],ACC2));
  e.push(text(22,thy+60,'Peak: 4.2k',10,MUTE));
  e.push(text(22,thy+76,'Last spike: 2h ago',10,MUTE));

  e.push(...nav(0));
  return { name:'Dashboard', elements:e };
}

function buildSources() {
  const e = [];
  e.push(rect(0,0,W,H,BG));
  e.push(...orb(340,260,118,ACC2,0.08));
  e.push(...orb(40,700,85,ACC,0.06));
  e.push(...statusBar());

  e.push(text(16,70,'Sources',20,TEXT,{ fw:700 }));
  e.push(text(16,88,'12 connected · 0 errors',11,MUTE));
  e.push(...btn(W-96,62,82,28,'+ Connect',ACC));

  const sources=[
    { n:'Shopify Orders', tp:'E-commerce',  s:'LIVE', sc:ACC2, eps:'240 eps', lat:'12ms' },
    { n:'Stripe Events',  tp:'Payments',    s:'LIVE', sc:ACC2, eps:'85 eps',  lat:'8ms'  },
    { n:'PostgreSQL Main',tp:'Database',    s:'LIVE', sc:ACC2, eps:'1.2k eps',lat:'4ms'  },
    { n:'Auth Service',   tp:'Internal API',s:'WARN', sc:WARN, eps:'340 eps', lat:'45ms' },
    { n:'Analytics DB',   tp:'Database',    s:'LIVE', sc:ACC2, eps:'520 eps', lat:'6ms'  },
    { n:'Salesforce CRM', tp:'CRM',         s:'IDLE', sc:MUTE, eps:'0 eps',   lat:'—'    },
    { n:'Kafka Stream',   tp:'Message Bus', s:'LIVE', sc:ACC2, eps:'3.1k eps',lat:'2ms'  },
    { n:'SendGrid Events',tp:'Email',       s:'LIVE', sc:ACC2, eps:'22 eps',  lat:'15ms' },
  ];

  sources.forEach((src,i) => {
    const sy=106+i*84;
    const isA=src.s==='LIVE';
    e.push(...glass(12,sy,W-24,74,{ rx:12, accentTop:isA, accentColor:rgba(src.sc,0.5) }));
    // Icon
    e.push(circle(40,sy+36,20,rgba(ACC,0.12)));
    e.push(circle(40,sy+36,20,'none',{ stroke:rgba(ACC,0.22), sw:1 }));
    e.push(text(40,sy+41,src.n[0],14,ACC,{ anchor:'middle', fw:700 }));
    // Info
    e.push(text(68,sy+22,src.n,13,TEXT,{ fw:600 }));
    e.push(text(68,sy+38,src.tp,10,MUTE));
    e.push(...pill(68,sy+60,src.s,src.sc));
    // Metrics
    e.push(text(W-18,sy+22,src.eps,12,TEXT,{ anchor:'end', fw:500 }));
    e.push(text(W-18,sy+38,src.lat,10,MUTE,{ anchor:'end' }));
    // Chevron
    e.push(text(W-18,sy+55,'›',16,src.sc,{ anchor:'end', opacity:0.6 }));
    if(i<sources.length-1) e.push(line(16,sy+74,W-16,sy+74,'rgba(255,255,255,0.04)'));
  });

  e.push(...nav(1));
  return { name:'Sources', elements:e };
}

function buildEventLog() {
  const e = [];
  e.push(rect(0,0,W,H,BG));
  e.push(...orb(80,340,105,PUR,0.07));
  e.push(...orb(320,640,80,ACC,0.06));
  e.push(...statusBar());

  e.push(text(16,70,'Event Log',20,TEXT,{ fw:700 }));
  e.push(text(16,88,'Real-time · 2.8k/min',11,MUTE));

  // Filter pills
  const filts=['All','Errors','Warns','Info'];
  filts.forEach((f,i) => {
    const isA=i===0;
    const fx=12+i*84;
    e.push(rect(fx,98,76,24,isA?rgba(ACC,0.18):'rgba(255,255,255,0.05)',{ rx:12 }));
    e.push(rect(fx,98,76,24,'none',{ rx:12, stroke:isA?rgba(ACC,0.4):'rgba(255,255,255,0.07)', sw:1 }));
    e.push(text(fx+38,114,f,11,isA?ACC:MUTE,{ anchor:'middle', fw:isA?600:400 }));
  });

  const logs=[
    { t:'07:11:42.038', lvl:'INFO', c:ACC2, msg:'shopify.order #58230 → warehouse', det:'schema:v3 · size:2.1kb' },
    { t:'07:11:42.021', lvl:'INFO', c:ACC2, msg:'stripe.charge.ok → analytics',     det:'amt:$142.00 · u_83kxp' },
    { t:'07:11:41.996', lvl:'WARN', c:WARN, msg:'auth.latency spike /login',         det:'p99:890ms · limit:500ms' },
    { t:'07:11:41.883', lvl:'INFO', c:ACC2, msg:'pg.batch_insert → data.lake',       det:'rows:1,240 · tbl:events' },
    { t:'07:11:41.772', lvl:'ERR',  c:ERR,  msg:'auth.failed brute-force detect',    det:'ip:192.168.x · rate:44/s' },
    { t:'07:11:41.614', lvl:'INFO', c:ACC2, msg:'salesforce.sync started',            det:'delta:8 records' },
    { t:'07:11:41.422', lvl:'WARN', c:WARN, msg:'postgres slow query detected',      det:'tbl:orders · 2.1s avg' },
    { t:'07:11:41.300', lvl:'INFO', c:ACC,  msg:'kafka.consumer lag recovered',      det:'lag:0ms · part:12' },
  ];

  logs.forEach((log,i) => {
    const ly=134+i*84;
    e.push(...glass(12,ly,W-24,74,{ rx:10 }));
    // Left accent stripe
    e.push(rect(12,ly,3,74,log.c,{ rx:1, opacity:0.65 }));
    // Level badge
    const bw=log.lvl.length*7.5+12;
    e.push(rect(22,ly+10,bw,16,rgba(log.c,0.15),{ rx:4 }));
    e.push(text(22+bw/2,ly+22,log.lvl,9,log.c,{ anchor:'middle', fw:700, font:'Inter Mono' }));
    // Time
    e.push(text(22+bw+8,ly+22,log.t,9,MUTE,{ font:'Inter Mono' }));
    // Message
    e.push(text(22,ly+42,log.msg,11,TEXT,{ fw:500, font:'Inter Mono' }));
    // Detail
    e.push(text(22,ly+58,log.det,9,MUTE,{ font:'Inter Mono' }));
  });

  e.push(...nav(2));
  return { name:'Event Log', elements:e };
}

function buildAlerts() {
  const e = [];
  e.push(rect(0,0,W,H,BG));
  e.push(...orb(360,180,96,ERR,0.07));
  e.push(...orb(30,650,82,WARN,0.06));
  e.push(...statusBar());

  e.push(text(16,70,'Alerts',20,TEXT,{ fw:700 }));
  e.push(text(16,88,'2 critical · 5 warnings',11,MUTE));
  // Critical badge
  e.push(circle(W-26,74,14,rgba(ERR,0.2)));
  e.push(circle(W-26,74,14,'none',{ stroke:rgba(ERR,0.35), sw:1 }));
  e.push(text(W-26,78,'2',12,ERR,{ anchor:'middle', fw:700 }));

  const alerts=[
    { title:'Brute-force detected',     src:'Auth Service',     sev:'CRITICAL', sc:ERR,  t:'3m', det:'44 failed logins/sec from 192.168.x.x' },
    { title:'Auth latency critical',    src:'Auth Service',     sev:'CRITICAL', sc:ERR,  t:'8m', det:'p99:890ms — threshold is 500ms' },
    { title:'Slow query on orders',     src:'PostgreSQL Main',  sev:'WARNING',  sc:WARN, t:'12m',det:'orders table avg 2.1s, up 340%' },
    { title:'Schema drift — v3 field',  src:'Shopify Orders',   sev:'WARNING',  sc:WARN, t:'1h', det:'New: shipping_instructions (TEXT)' },
    { title:'Throughput burst spike',   src:'Stripe Events',    sev:'WARNING',  sc:WARN, t:'2h', det:'Peak 3.4k eps vs 2k limit' },
    { title:'Disk usage at 78%',        src:'data.lake storage',sev:'INFO',     sc:ACC,  t:'3h', det:'Projected full in ~9 days at current rate' },
  ];

  alerts.forEach((a,i) => {
    const ay=106+i*108;
    const isCrit=a.sev==='CRITICAL';
    e.push(...glass(12,ay,W-24,96,{ rx:12, accentTop:isCrit, accentColor:a.sc, glowRing:isCrit }));
    // Left stripe
    e.push(rect(12,ay,4,96,a.sc,{ rx:2, opacity:0.7 }));
    // Severity + time
    e.push(...pill(26,ay+16,a.sev,a.sc));
    e.push(text(W-18,ay+18,a.t+' ago',10,MUTE,{ anchor:'end' }));
    // Title
    e.push(text(26,ay+38,a.title,13,TEXT,{ fw:600 }));
    // Source
    e.push(text(26,ay+56,a.src,10,MUTE));
    // Detail
    e.push(text(26,ay+74,a.det,10,rgba(TEXT,0.62)));
    // Action arrow
    e.push(text(W-18,ay+58,'›',18,a.sc,{ anchor:'end', fw:600, opacity:0.8 }));
    if(i<alerts.length-1) e.push(line(16,ay+96,W-16,ay+96,'rgba(255,255,255,0.04)'));
  });

  e.push(...nav(3));
  return { name:'Alerts', elements:e };
}

function buildSchema() {
  const e = [];
  e.push(rect(0,0,W,H,BG));
  e.push(...orb(200,380,120,ACC,0.07));
  e.push(...statusBar());

  e.push(text(16,70,'Schema',20,TEXT,{ fw:700 }));
  e.push(text(16,88,'shopify.orders → warehouse.db',11,MUTE,{ font:'Inter Mono' }));

  // Source→Dest header card
  e.push(...glass(12,104,W-24,60,{ rx:12 }));
  e.push(text(22,124,'shopify.orders',12,ACC,{ fw:600, font:'Inter Mono' }));
  e.push(text(22,140,'v3.2 · 28 fields',10,MUTE));
  e.push(text(W/2,130,'→',16,MUTE,{ anchor:'middle' }));
  e.push(text(W-18,124,'warehouse.db',12,ACC2,{ fw:600, anchor:'end', font:'Inter Mono' }));
  e.push(text(W-18,140,'v2.8 · 24 fields',10,MUTE,{ anchor:'end' }));

  // Coverage bar
  e.push(text(16,182,'Field Coverage',12,TEXT,{ fw:600 }));
  e.push(text(W-16,182,'86%',12,ACC2,{ anchor:'end', fw:600 }));
  e.push(...prog(16,192,W-32,0.86,ACC2));

  // Field legend
  e.push(circle(16,210,4,ACC2,{ opacity:0.8 }));
  e.push(text(24,214,'Mapped',9,MUTE));
  e.push(circle(76,210,4,WARN,{ opacity:0.8 }));
  e.push(text(84,214,'Transform',9,MUTE));
  e.push(circle(142,210,4,ERR,{ opacity:0.8 }));
  e.push(text(150,214,'Unmapped',9,MUTE));

  const fields=[
    { sf:'order_id',               df:'id',               tp:'INT',      s:'ok',     sc:ACC2 },
    { sf:'created_at',             df:'timestamp',         tp:'DATETIME', s:'ok',     sc:ACC2 },
    { sf:'customer_email',         df:'user_email',        tp:'VARCHAR',  s:'ok',     sc:ACC2 },
    { sf:'line_items',             df:'items_json',        tp:'JSONB',    s:'ok',     sc:ACC2 },
    { sf:'shipping_address',       df:'address',           tp:'TEXT',     s:'warn',   sc:WARN },
    { sf:'shipping_instructions',  df:'—',                 tp:'TEXT',     s:'unmapped',sc:ERR },
    { sf:'discount_codes',         df:'promo_ids',         tp:'ARRAY',    s:'warn',   sc:WARN },
  ];

  e.push(text(16,226,'Field Mappings',11,MUTE,{ fw:500 }));

  fields.forEach((f,i) => {
    const fy=238+i*68;
    e.push(...glass(12,fy,W-24,58,{ rx:10 }));
    const sfW=140;
    e.push(rect(22,fy+12,sfW,20,rgba(ACC,0.10),{ rx:5 }));
    e.push(text(28,fy+25,f.sf,10,ACC,{ fw:500, font:'Inter Mono' }));
    e.push(text(W/2,fy+27,'→',12,MUTE,{ anchor:'middle' }));
    e.push(rect(W-162,fy+12,140,20,rgba(f.sc,0.10),{ rx:5 }));
    e.push(text(W-156,fy+25,f.df,10,f.s==='unmapped'?ERR:ACC2,{ fw:500, font:'Inter Mono' }));
    e.push(text(22,fy+48,f.tp,9,MUTE,{ font:'Inter Mono' }));
    e.push(circle(W-22,fy+33,5,f.sc,{ opacity:0.85 }));
    if(i<fields.length-1) e.push(line(16,fy+58,W-16,fy+58,'rgba(255,255,255,0.04)'));
  });

  e.push(...nav(1));
  return { name:'Schema', elements:e };
}

function buildSettings() {
  const e = [];
  e.push(rect(0,0,W,H,BG));
  e.push(...orb(290,580,96,PUR,0.08));
  e.push(...statusBar());

  e.push(text(16,70,'Settings',20,TEXT,{ fw:700 }));
  e.push(text(16,88,'Privacy & data controls',11,MUTE));

  // Profile card
  e.push(...glass(12,104,W-24,76,{ rx:14, accentTop:true, accentColor:PUR }));
  e.push(circle(44,142,22,rgba(PUR,0.2)));
  e.push(circle(44,142,22,'none',{ stroke:rgba(PUR,0.3), sw:1 }));
  e.push(text(44,147,'AJ',13,'#A78BFA',{ anchor:'middle', fw:700 }));
  e.push(text(78,132,'Amir Jalali',14,TEXT,{ fw:600 }));
  e.push(text(78,150,'amir@company.io',11,MUTE));
  e.push(...pill(W-92,142,'PRO PLAN',ACC2));

  // Section label
  e.push(text(16,200,'Privacy Controls',11,MUTE,{ fw:600, ls:1 }));

  const ctls=[
    { lbl:'Data Masking',    sub:'Auto-redact PII in event payloads', on:true,  c:ACC2 },
    { lbl:'Encrypt at Rest', sub:'AES-256 for stored events',          on:true,  c:ACC2 },
    { lbl:'Schema Alerts',   sub:'Notify on field drift or additions', on:true,  c:ACC  },
    { lbl:'Debug Mode',      sub:'Verbose logging (perf impact)',      on:false, c:WARN },
    { lbl:'Share Analytics', sub:'Help improve MELD with usage data',  on:false, c:MUTE },
  ];

  ctls.forEach((ctl,i) => {
    const cy=210+i*72;
    e.push(...glass(12,cy,W-24,62,{ rx:10 }));
    e.push(text(22,cy+22,ctl.lbl,13,TEXT,{ fw:500 }));
    e.push(text(22,cy+40,ctl.sub,10,MUTE));
    e.push(...toggle(W-22-44,cy+18,ctl.on,ctl.c));
    if(i<ctls.length-1) e.push(line(16,cy+62,W-16,cy+62,'rgba(255,255,255,0.04)'));
  });

  // Danger zone
  e.push(text(16,580,'Danger Zone',11,MUTE,{ fw:600, ls:1 }));
  e.push(...glass(12,592,W-24,52,{ rx:10 }));
  e.push(rect(12,592,W-24,52,rgba(ERR,0.04),{ rx:10 }));
  e.push(rect(12,592,W-24,52,'none',{ rx:10, stroke:rgba(ERR,0.12), sw:1 }));
  e.push(text(22,621,'Purge all pipeline data',13,ERR,{ fw:500 }));
  e.push(text(W-18,621,'›',18,ERR,{ anchor:'end', fw:600 }));

  // Version
  e.push(text(W/2,664,'MELD v2.4.1 · Privacy-first data sync',10,rgba(TEXT,0.25),{ anchor:'middle' }));

  e.push(...nav(4));
  return { name:'Settings', elements:e };
}

// ── Assemble ────────────────────────────────────────────────────────────────
const screens=[
  buildDashboard(),
  buildSources(),
  buildEventLog(),
  buildAlerts(),
  buildSchema(),
  buildSettings(),
];

const total=screens.reduce((s,sc)=>s+sc.elements.length,0);

const pen={
  version:'2.8',
  metadata:{
    name:'MELD — Unified Data Pipeline Monitor',
    author:'RAM',
    date: new Date().toISOString().split('T')[0],
    theme:'dark',
    heartbeat:18,
    elements:total,
    palette:{ bg:BG, surface:SURF, accent:ACC, accent2:ACC2, text:TEXT, muted:MUTE },
    inspiration:'darkmodedesign.com (Qase cosmic-navy glow, Cosmos Studio orb BGs, Darkroom inner-glow strokes) + saaspo.com (Betterstack bento grids + developer dark palettes)',
  },
  screens,
};

const out=path.join(__dirname,`${SLUG}.pen`);
fs.writeFileSync(out,JSON.stringify(pen,null,2));
console.log(`${NAME}: ${screens.length} screens, ${total} elements`);
console.log(`Written: ${SLUG}.pen`);
