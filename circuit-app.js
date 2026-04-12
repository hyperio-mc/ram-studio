'use strict';
const fs   = require('fs');
const path = require('path');

// ── Identity ────────────────────────────────────────────────────────────────
const SLUG      = 'circuit';
const NAME      = 'CIRCUIT';
const TAGLINE   = 'Infrastructure topology, decoded';
const HEARTBEAT = 391;
const W = 390, H = 844;

// ── Palette — DARK  ─────────────────────────────────────────────────────────
// Inspired by: saaspo.com raw/blueprint aesthetic (Oxide, Crezco)
// Counter to Linear-clone purple; uses electric green + grid texture
const BG    = '#0A0C10';
const SURF  = '#111318';
const CARD  = '#161B24';
const CARD2 = '#1C2230';
const ACC   = '#00FF87';   // electric green — contrasting against purple dominance
const ACC2  = '#38BDF8';   // sky blue / cyan
const RED   = '#FF4545';   // error
const AMB   = '#FFB800';   // warning amber
const TEXT  = '#E2E8F0';
const MID   = '#8B9EB7';
const MUTED = 'rgba(139,158,183,0.45)';
const DIM   = 'rgba(139,158,183,0.18)';
const GL    = 'rgba(0,255,135,0.12)'; // green glow card border
const BL    = 'rgba(56,189,248,0.12)';// blue glow card border
const GRID  = 'rgba(139,158,183,0.055)'; // subtle grid line

// ── Primitives ───────────────────────────────────────────────────────────────
function rect(x,y,w,h,fill,opts={}) {
  return { type:'rect', x, y, width:w, height:h, fill,
    rx: opts.rx??0, opacity: opts.opacity!=null?opts.opacity:1,
    stroke: opts.stroke||'none', strokeWidth: opts.sw||0 };
}
function text(x,y,content,size,fill,opts={}) {
  return { type:'text', x, y, content, fontSize:size, fill,
    fontWeight: opts.fw||'normal',
    fontFamily: opts.font||'monospace',
    textAnchor: opts.anchor||'start',
    letterSpacing: opts.ls||0, opacity: opts.opacity!=null?opts.opacity:1 };
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

const screens = [];

// ── Shared Components ────────────────────────────────────────────────────────

function gridBg(els) {
  // Base background
  els.push(rect(0,0,W,H,BG));
  // Horizontal grid lines every 48px (sparse blueprint grid)
  for (let y=48; y<H; y+=48) {
    els.push(line(0,y,W,y,GRID,{sw:1}));
  }
  // Vertical grid lines every 48px
  for (let x=48; x<W; x+=48) {
    els.push(line(x,0,x,H,GRID,{sw:1}));
  }
}

function topBar(els, screenTitle, badge) {
  els.push(rect(0,0,W,60,SURF));
  els.push(line(0,60,W,60,'rgba(0,255,135,0.22)',{sw:1}));
  // Logo / brand mark
  els.push(rect(20,16,28,28,BG,{stroke:ACC,sw:1.5}));
  els.push(text(27,35,'⬡',14,ACC,{fw:'700'}));
  els.push(text(56,24,'CIRCUIT',10,ACC,{fw:'700',ls:3}));
  els.push(text(56,40,screenTitle,12,TEXT,{fw:'600',ls:1}));
  // Live status
  els.push(circle(W-16,20,4,ACC,{opacity:0.9}));
  els.push(text(W-26,24,'LIVE',8,ACC,{anchor:'end',ls:2}));
  if (badge) {
    els.push(rect(W-70,34,54,18,RED,{rx:0,opacity:0.12}));
    els.push(rect(W-70,34,54,18,'none',{stroke:RED,sw:1,rx:0,opacity:0.5}));
    els.push(text(W-43,47,badge,9,RED,{anchor:'middle',ls:1}));
  }
}

function bottomNav(els, active) {
  const Y = H-70;
  els.push(rect(0,Y,W,70,SURF));
  els.push(line(0,Y,W,Y,'rgba(139,158,183,0.15)',{sw:1}));
  const tabs = [
    {label:'TOPO', icon:'⬡'},
    {label:'PIPE', icon:'▶'},
    {label:'SVCS', icon:'◫'},
    {label:'LOG',  icon:'≡'},
    {label:'ALRT', icon:'△'},
  ];
  const tabW = W / tabs.length;
  tabs.forEach((t,i) => {
    const cx = tabW*i + tabW/2;
    const isActive = i===active;
    const col = isActive ? ACC : 'rgba(139,158,183,0.5)';
    if (isActive) els.push(rect(cx-20,Y,40,2,ACC));
    els.push(text(cx,Y+28,t.icon,15,col,{anchor:'middle'}));
    els.push(text(cx,Y+48,t.label,8,col,{anchor:'middle',ls:2,opacity:isActive?1:0.6}));
  });
}

function sectionLabel(els,x,y,txt) {
  els.push(text(x,y,'// '+txt,8,MID,{ls:2,opacity:0.7}));
  els.push(line(x,y+6,W-x,y+6,DIM,{sw:1}));
}

function statusDot(els,cx,cy,status) {
  const col = status==='ok'?ACC : status==='warn'?AMB : RED;
  els.push(circle(cx,cy,4,col,{opacity:0.9}));
}

// Infrastructure node (square blueprint style)
function infraNode(els,cx,cy,label,status,sz=36) {
  const col = status==='ok'?ACC : status==='warn'?AMB : RED;
  const half = sz/2;
  // Outer square (blueprint style)
  els.push(rect(cx-half,cy-half,sz,sz,CARD2,{stroke:col,sw:1.5}));
  // Inner dot
  els.push(circle(cx,cy,3,col,{opacity:0.9}));
  // Label below
  els.push(text(cx,cy+half+14,label,8,TEXT,{anchor:'middle',ls:1}));
}

// L-shaped connector between nodes
function connector(els,x1,y1,x2,y2,col,opts={}) {
  const mid = (y1+y2)/2;
  const op = opts.opacity??0.4;
  const sw = opts.sw??1;
  els.push(line(x1,y1,x1,mid,col,{sw,opacity:op}));
  els.push(line(x1,mid,x2,mid,col,{sw,opacity:op}));
  els.push(line(x2,mid,x2,y2,col,{sw,opacity:op}));
}

// Metric card
function metricCard(els,x,y,w,h,label,value,unit,col,glow) {
  els.push(rect(x,y,w,h,CARD,{stroke:glow||DIM,sw:1}));
  els.push(text(x+12,y+18,label,8,MID,{ls:2}));
  els.push(text(x+12,y+h-12,value,20,col,{fw:'700'}));
  if(unit) els.push(text(x+12+value.length*12+4,y+h-12,unit,9,MID));
}

// Thin sparkline helper
function sparkline(els,x,y,w,data,col) {
  const mx = Math.max(...data)||1;
  const pts = data.map((v,i)=>({
    px: x+i*(w/(data.length-1)),
    py: y-Math.round((v/mx)*28)
  }));
  for(let i=0;i<pts.length-1;i++) {
    els.push(line(pts[i].px,pts[i].py,pts[i+1].px,pts[i+1].py,col,{sw:1.5,opacity:0.8}));
  }
}

// ── SCREEN 1: TOPOLOGY MAP ───────────────────────────────────────────────────
{
  const els = [];
  gridBg(els);
  topBar(els,'TOPOLOGY','2 CRIT');

  // Summary strip
  els.push(rect(20,68,106,42,CARD,{stroke:GL,sw:1}));
  els.push(text(32,82,'NODES',8,MID,{ls:2}));
  els.push(text(32,100,'24',17,ACC,{fw:'700'}));

  els.push(rect(142,68,106,42,CARD,{stroke:BL,sw:1}));
  els.push(text(154,82,'EDGES',8,MID,{ls:2}));
  els.push(text(154,100,'38',17,ACC2,{fw:'700'}));

  els.push(rect(264,68,106,42,CARD,{stroke:'rgba(255,69,69,0.2)',sw:1}));
  els.push(text(276,82,'ISSUES',8,MID,{ls:2}));
  els.push(text(276,100,'2',17,RED,{fw:'700'}));

  sectionLabel(els,20,120,'PRODUCTION CLUSTER — us-east-1');

  // Root node — API Gateway
  const RX=195, RY=178;
  infraNode(els,RX,RY,'API-GW','ok',40);

  // Layer 2 — 3 service nodes
  const L2=[
    {x:90, y:265,label:'AUTH',  st:'ok'},
    {x:195,y:265,label:'USER',  st:'warn'},
    {x:300,y:265,label:'DATA',  st:'ok'},
  ];
  L2.forEach(n=>{
    connector(els,RX,RY+21,n.x,n.y-19,DIM,{opacity:0.5});
    infraNode(els,n.x,n.y,n.label,n.st,34);
  });

  // Layer 3 — 5 backend nodes
  const L3=[
    {x:60, y:356,label:'REDIS',st:'ok'},
    {x:128,y:356,label:'JWT',  st:'ok'},
    {x:195,y:356,label:'CACHE',st:'warn'},
    {x:262,y:356,label:'PG-R', st:'ok'},
    {x:330,y:356,label:'PG-W', st:'err'},
  ];
  connector(els,L2[0].x,L2[0].y+18,L3[0].x,L3[0].y-17,DIM,{opacity:0.35});
  connector(els,L2[0].x,L2[0].y+18,L3[1].x,L3[1].y-17,DIM,{opacity:0.35});
  connector(els,L2[1].x,L2[1].y+18,L3[2].x,L3[2].y-17,AMB,{opacity:0.25});
  connector(els,L2[2].x,L2[2].y+18,L3[3].x,L3[3].y-17,DIM,{opacity:0.35});
  connector(els,L2[2].x,L2[2].y+18,L3[4].x,L3[4].y-17,RED,{opacity:0.35});
  L3.forEach(n=>infraNode(els,n.x,n.y,n.label,n.st,30));

  // Layer 4 — 2 storage nodes
  const L4=[
    {x:120,y:440,label:'S3',  st:'ok'},
    {x:270,y:440,label:'CDN', st:'ok'},
  ];
  connector(els,L3[1].x,L3[1].y+16,L4[0].x,L4[0].y-14,DIM,{opacity:0.25});
  connector(els,L3[3].x,L3[3].y+16,L4[1].x,L4[1].y-14,DIM,{opacity:0.25});
  L4.forEach(n=>infraNode(els,n.x,n.y,n.label,n.st,26));

  // Legend
  els.push(circle(24,490,4,ACC));
  els.push(text(34,494,'HEALTHY',8,MID,{ls:1}));
  els.push(circle(110,490,4,AMB));
  els.push(text(120,494,'DEGRADED',8,MID,{ls:1}));
  els.push(circle(210,490,4,RED));
  els.push(text(220,494,'CRITICAL',8,MID,{ls:1}));

  // Metric cards row
  metricCard(els,20,506,168,54,'UPTIME','99.98','%',ACC,GL);
  metricCard(els,202,506,168,54,'LATENCY P50','12','ms',ACC2,BL);

  // Traffic sparkline
  sectionLabel(els,20,572,'INBOUND TRAFFIC — 6H');
  const traffic=[8,12,10,18,14,22,17,26,20,24,19,22,25,20,28];
  sparkline(els,20,640,350,traffic,ACC);
  els.push(text(20,648,'6h ago',8,MID,{opacity:0.45}));
  els.push(text(195,648,'3h ago',8,MID,{anchor:'middle',opacity:0.45}));
  els.push(text(370,648,'now',8,MID,{anchor:'end',opacity:0.45}));

  // Region selector
  els.push(rect(20,658,350,34,CARD,{stroke:DIM,sw:1}));
  els.push(text(32,680,'▸  us-east-1 (primary)',10,TEXT));
  els.push(text(362,680,'▼',10,MID,{anchor:'end'}));

  bottomNav(els,0);
  screens.push({name:'Topology',svg:'',elements:els});
}

// ── SCREEN 2: PIPELINE ───────────────────────────────────────────────────────
{
  const els = [];
  gridBg(els);
  topBar(els,'PIPELINE','');

  sectionLabel(els,20,70,'ACTIVE DEPLOYMENT — main@a3f82d1');

  // Deploy pipeline stages as connected boxes
  const stages = [
    {label:'BUILD',   sub:'2m 14s', st:'done',  note:'passed 847 tests'},
    {label:'TEST',    sub:'4m 02s', st:'done',  note:'coverage 94.2%'},
    {label:'STAGING', sub:'1m 55s', st:'done',  note:'smoke tests OK'},
    {label:'CANARY',  sub:'running',st:'active',note:'1% traffic → v2.3.1'},
    {label:'PROD',    sub:'queued', st:'queue',  note:'awaiting approval'},
  ];
  stages.forEach((s,i)=>{
    const y = 98+i*94;
    const col = s.st==='done'?ACC : s.st==='active'?ACC2 : s.st==='fail'?RED : MID;
    const borderCol = s.st==='done'?GL : s.st==='active'?BL : DIM;
    // Stage card
    els.push(rect(20,y,350,80,CARD,{stroke:borderCol,sw:1.5}));
    // Left accent bar
    els.push(rect(20,y,3,80,col));
    // Stage number
    els.push(text(36,y+20,String(i+1).padStart(2,'0'),9,col,{ls:2}));
    // Stage name
    els.push(text(36,y+42,s.label,14,TEXT,{fw:'600'}));
    // Duration
    els.push(text(36,y+62,s.sub,9,MID,{ls:1}));
    // Status badge
    const badgeCol = s.st==='done'?ACC : s.st==='active'?ACC2 : MID;
    const badgeTxt = s.st==='done'?'✓ DONE' : s.st==='active'?'● RUNNING' : '○ QUEUED';
    els.push(rect(W-110,y+12,90,22,BG,{stroke:badgeCol,sw:1,opacity:0.8}));
    els.push(text(W-65,y+27,badgeTxt,8,badgeCol,{anchor:'middle',ls:1}));
    // Note
    els.push(text(W-20,y+62,s.note,8,MID,{anchor:'end',opacity:0.6}));
    // Connector line to next stage
    if(i<stages.length-1) {
      els.push(line(W/2,y+80,W/2,y+94,col==='ACC'?ACC:DIM,{sw:1,opacity:0.35}));
      els.push(line(W/2-4,y+86,W/2,y+80,DIM,{sw:1,opacity:0.35}));
      els.push(line(W/2+4,y+86,W/2,y+80,DIM,{sw:1,opacity:0.35}));
    }
  });

  // Approve CTA (for PROD stage)
  els.push(rect(20,H-148,350,44,BG,{stroke:ACC,sw:1.5}));
  els.push(text(195,H-120,'⬡  APPROVE FOR PRODUCTION',11,ACC,{anchor:'middle',ls:2,fw:'700'}));
  els.push(rect(20,H-96,350,20,BG,{stroke:DIM,sw:1}));
  els.push(text(195,H-82,'TRIGGERED BY: rakis@hyperio.io · a3f82d1 · 3m ago',8,MID,{anchor:'middle',ls:0.5}));

  bottomNav(els,1);
  screens.push({name:'Pipeline',svg:'',elements:els});
}

// ── SCREEN 3: SERVICES ───────────────────────────────────────────────────────
{
  const els = [];
  gridBg(els);
  topBar(els,'SERVICES','');

  // Filter chips
  els.push(rect(20,68,60,28,ACC,{rx:0}));
  els.push(text(50,87,'ALL',9,BG,{anchor:'middle',fw:'700',ls:2}));
  els.push(rect(88,68,70,28,CARD,{stroke:DIM,sw:1,rx:0}));
  els.push(text(123,87,'WARN',9,AMB,{anchor:'middle',ls:2}));
  els.push(rect(166,68,70,28,CARD,{stroke:DIM,sw:1,rx:0}));
  els.push(text(201,87,'CRIT',9,RED,{anchor:'middle',ls:2}));

  sectionLabel(els,20,108,'24 SERVICES — 21 HEALTHY · 1 DEGRADED · 2 CRITICAL');

  const services = [
    {name:'api-gateway',    ver:'v2.3.1', st:'ok',   cpu:28, mem:42, lat:'11ms', reqs:'2.4k'},
    {name:'user-service',   ver:'v3.1.2', st:'warn',  cpu:71, mem:68, lat:'38ms', reqs:'1.1k'},
    {name:'cache-layer',    ver:'v1.2.1', st:'warn',  cpu:83, mem:79, lat:'55ms', reqs:'3.8k'},
    {name:'pg-writer',      ver:'v1.0.9', st:'err',   cpu:99, mem:95, lat:'err',  reqs:'0'},
    {name:'cdn-router',     ver:'v4.0.1', st:'ok',   cpu:22, mem:18, lat:'2ms',  reqs:'12k'},
  ];
  services.forEach((s,i)=>{
    const y = 126+i*80;
    if(y > H-100) return;
    const col = s.st==='ok'?ACC : s.st==='warn'?AMB : RED;
    const bg  = s.st==='err' ? 'rgba(255,69,69,0.06)' : CARD;
    els.push(rect(20,y,350,72,bg,{stroke:s.st==='err'?'rgba(255,69,69,0.3)':DIM,sw:1}));
    // Status accent stripe
    els.push(rect(20,y,3,72,col));
    // Name + version
    els.push(text(36,y+18,s.name,12,TEXT,{fw:'600'}));
    els.push(text(36,y+34,s.ver,9,MID,{ls:1}));
    // Status dot
    statusDot(els,W-18,y+18,s.st);
    // Metrics row
    els.push(line(20,y+44,370,y+44,DIM,{sw:1,opacity:0.5}));
    els.push(text(36,y+60,'CPU',7,MID,{ls:2}));
    els.push(text(60,y+60,s.cpu+'%',9,col,{fw:'600'}));
    els.push(text(110,y+60,'MEM',7,MID,{ls:2}));
    els.push(text(134,y+60,s.mem+'%',9,TEXT));
    els.push(text(184,y+60,'P50',7,MID,{ls:2}));
    els.push(text(208,y+60,s.lat,9,TEXT));
    els.push(text(262,y+60,'RPS',7,MID,{ls:2}));
    els.push(text(286,y+60,s.reqs,9,TEXT));
    // Progress bar for CPU
    els.push(rect(W-60,y+50,48,6,BG,{stroke:DIM,sw:1}));
    const pctW = Math.round((s.cpu/100)*48);
    if(pctW>0) els.push(rect(W-60,y+50,pctW,6,col,{opacity:0.8}));
  });

  // "+17 more" hint
  els.push(rect(20,H-148,350,30,CARD,{stroke:DIM,sw:1}));
  els.push(text(195,H-128,'+17 more services  ▼',9,MID,{anchor:'middle',ls:1}));

  bottomNav(els,2);
  screens.push({name:'Services',svg:'',elements:els});
}

// ── SCREEN 4: CONSOLE ────────────────────────────────────────────────────────
{
  const els = [];
  gridBg(els);
  topBar(els,'CONSOLE','');

  // Toolbar
  els.push(rect(0,60,W,36,CARD));
  els.push(line(0,96,W,96,'rgba(0,255,135,0.15)',{sw:1}));
  els.push(text(20,83,'FILTER:',9,MID,{ls:2}));
  const chips=[{t:'ALL',a:true},{t:'ERR',a:false},{t:'WARN',a:false},{t:'INFO',a:false}];
  let cx=80;
  chips.forEach(c=>{
    const col=c.a?ACC:MID;
    const bg=c.a?'rgba(0,255,135,0.1)':CARD2;
    els.push(rect(cx,65,38,24,bg,{stroke:col,sw:c.a?1.5:0.5}));
    els.push(text(cx+19,81,c.t,8,col,{anchor:'middle',ls:1}));
    cx+=46;
  });
  els.push(text(W-20,83,'TAIL',9,ACC,{anchor:'end',ls:2}));

  // Log lines — terminal aesthetic
  const logLines=[
    {t:'09:41:38.221',lvl:'ERR', svc:'pg-writer',    msg:'connection refused: dial tcp :5432'},
    {t:'09:41:38.218',lvl:'WARN',svc:'cache-layer',  msg:'eviction rate high: 83% mem utilization'},
    {t:'09:41:36.891',lvl:'INFO',svc:'api-gateway',  msg:'GET /v2/users 200 11ms [2.4k/s]'},
    {t:'09:41:36.012',lvl:'ERR', svc:'pg-writer',    msg:'health check failed (attempt 7/10)'},
    {t:'09:41:34.442',lvl:'INFO',svc:'cdn-router',   msg:'cache HIT ratio 94.7% — nominal'},
    {t:'09:41:33.110',lvl:'WARN',svc:'user-service', msg:'p99 latency 312ms — above threshold'},
    {t:'09:41:31.872',lvl:'INFO',svc:'auth-service', msg:'JWT rotation complete — new key active'},
    {t:'09:41:30.004',lvl:'INFO',svc:'data-pipeline',msg:'batch job completed: 8.2k records'},
  ];

  logLines.forEach((l,i)=>{
    const y=108+i*55;
    if(y>H-82) return;
    const col=l.lvl==='ERR'?RED:l.lvl==='WARN'?AMB:MID;
    const bgLine=l.lvl==='ERR'?'rgba(255,69,69,0.05)':'transparent';
    if(l.lvl==='ERR') els.push(rect(0,y,W,50,bgLine));
    els.push(line(0,y,W,y,DIM,{sw:1,opacity:0.3}));
    // Timestamp
    els.push(text(20,y+14,l.t,8,'rgba(139,158,183,0.5)',{ls:0.5}));
    // Level badge
    els.push(rect(W-54,y+6,46,18,col,{opacity:0.12}));
    els.push(text(W-31,y+19,l.lvl,8,col,{anchor:'middle',ls:2}));
    // Service name
    els.push(text(20,y+30,l.svc+'>',9,ACC2,{fw:'600'}));
    // Message
    const msgX=20+l.svc.length*6+22;
    const maxChars=Math.floor((W-msgX-20)/6.2);
    els.push(text(msgX,y+30,l.msg.slice(0,maxChars),9,TEXT,{opacity:0.85}));
    if(l.msg.length>maxChars) {
      els.push(text(20,y+44,l.msg.slice(maxChars,maxChars+54),8,TEXT,{opacity:0.5}));
    }
  });

  // Bottom input bar
  els.push(rect(0,H-82,W,82,SURF));
  els.push(line(0,H-82,W,H-82,'rgba(0,255,135,0.2)',{sw:1}));
  els.push(rect(20,H-62,300,32,BG,{stroke:'rgba(0,255,135,0.3)',sw:1}));
  els.push(text(32,H-42,'> filter svc:pg-writer lvl:ERR',10,ACC,{opacity:0.7}));
  els.push(rect(328,H-62,42,32,ACC,{opacity:0.15}));
  els.push(text(349,H-42,'RUN',9,ACC,{anchor:'middle',ls:1,fw:'700'}));

  bottomNav(els,3);
  screens.push({name:'Console',svg:'',elements:els});
}

// ── SCREEN 5: ALERTS ─────────────────────────────────────────────────────────
{
  const els = [];
  gridBg(els);
  topBar(els,'ALERTS','3 ACTIVE');

  // Stats strip
  els.push(rect(20,68,90,40,CARD,{stroke:'rgba(255,69,69,0.3)',sw:1}));
  els.push(text(30,82,'CRITICAL',7,RED,{ls:2}));
  els.push(text(30,100,'2',16,RED,{fw:'700'}));

  els.push(rect(120,68,90,40,CARD,{stroke:'rgba(255,184,0,0.25)',sw:1}));
  els.push(text(130,82,'WARNING',7,AMB,{ls:2}));
  els.push(text(130,100,'1',16,AMB,{fw:'700'}));

  els.push(rect(220,68,150,40,CARD,{stroke:DIM,sw:1}));
  els.push(text(230,82,'RESOLVED 24H',7,MID,{ls:2}));
  els.push(text(230,100,'14',16,ACC,{fw:'700'}));

  sectionLabel(els,20,118,'OPEN INCIDENTS — SORTED BY SEVERITY');

  const alerts=[
    {
      id:'INC-2847',sev:'CRIT',svc:'pg-writer',
      title:'PostgreSQL writer connection failure',
      detail:'Health checks failing. 0 RPS. Replica failover imminent.',
      time:'3m ago',age:'00:03:22',actions:['ESCALATE','SILENCE','RUNBOOK']
    },
    {
      id:'INC-2846',sev:'CRIT',svc:'pg-writer',
      title:'WAL sender disconnected unexpectedly',
      detail:'Replication stream broken. Data durability at risk.',
      time:'6m ago',age:'00:06:49',actions:['ESCALATE','SILENCE']
    },
    {
      id:'INC-2843',sev:'WARN',svc:'cache-layer',
      title:'Memory utilisation above 80% threshold',
      detail:'Eviction rate rising. Cache hit ratio degrading.',
      time:'18m ago',age:'00:18:11',actions:['SILENCE','RUNBOOK']
    },
  ];

  alerts.forEach((a,i)=>{
    const y=134+i*172;
    if(y>H-90) return;
    const col=a.sev==='CRIT'?RED:AMB;
    const bgA=a.sev==='CRIT'?'rgba(255,69,69,0.05)':CARD;
    els.push(rect(20,y,350,158,bgA,{stroke:a.sev==='CRIT'?'rgba(255,69,69,0.35)':'rgba(255,184,0,0.3)',sw:1.5}));
    // Accent stripe
    els.push(rect(20,y,3,158,col));
    // Header row
    els.push(text(32,y+18,a.id,9,col,{ls:2,fw:'700'}));
    els.push(rect(W-76,y+8,56,20,col,{opacity:0.15}));
    els.push(text(W-48,y+22,a.sev,9,col,{anchor:'middle',ls:2}));
    // Service
    els.push(text(32,y+36,a.svc+' ›',9,ACC2,{fw:'600'}));
    // Title
    els.push(text(32,y+56,a.title,11,TEXT,{fw:'600'}));
    // Detail
    els.push(text(32,y+74,a.detail.slice(0,48),9,MID,{opacity:0.75}));
    if(a.detail.length>48) els.push(text(32,y+89,a.detail.slice(48),9,MID,{opacity:0.75}));
    // Time bar
    els.push(line(32,y+106,338,y+106,DIM,{sw:1,opacity:0.5}));
    els.push(text(32,y+122,'DURATION:',7,MID,{ls:2}));
    els.push(text(96,y+122,a.age,9,col,{fw:'600'}));
    els.push(text(W-22,y+122,a.time,8,MID,{anchor:'end',opacity:0.6}));
    // Action buttons
    a.actions.forEach((act,j)=>{
      const bx=32+j*90;
      const isFirst=j===0;
      els.push(rect(bx,y+132,82,18,isFirst?col:'none',{stroke:isFirst?col:DIM,sw:1,opacity:isFirst?0.15:1}));
      els.push(text(bx+41,y+145,act,7,isFirst?col:MID,{anchor:'middle',ls:1.5,fw:isFirst?'700':'normal'}));
    });
  });

  bottomNav(els,4);
  screens.push({name:'Alerts',svg:'',elements:els});
}

// ── SCREEN 6: DEPLOY CONTROL ─────────────────────────────────────────────────
{
  const els = [];
  gridBg(els);
  topBar(els,'DEPLOY','');

  sectionLabel(els,20,70,'DEPLOYMENT CONTROL — OPERATOR CONSOLE');

  // Commit info
  els.push(rect(20,88,350,60,CARD,{stroke:GL,sw:1}));
  els.push(rect(20,88,3,60,ACC));
  els.push(text(32,106,'COMMIT',7,MID,{ls:2}));
  els.push(text(32,124,'main · a3f82d1 · "feat: add canary deploy routing"',10,TEXT,{fw:'600'}));
  els.push(text(32,140,'rakis@hyperio.io · 14 minutes ago',9,MID,{opacity:0.7}));

  // Target env
  sectionLabel(els,20,162,'TARGET ENVIRONMENT');
  const envs=[{n:'CANARY',  d:'1% traffic — current',  st:'active'},
               {n:'STAGING', d:'full replica env',       st:'idle'},
               {n:'PROD',    d:'production — 24 nodes',  st:'idle'}];
  envs.forEach((e,i)=>{
    const y=178+i*62;
    const isActive=i===0;
    const col=isActive?ACC:MID;
    els.push(rect(20,y,350,54,CARD,{stroke:isActive?GL:DIM,sw:isActive?1.5:1}));
    if(isActive) els.push(rect(20,y,3,54,ACC));
    els.push(circle(38,y+27,8,BG,{stroke:col,sw:isActive?2:1}));
    if(isActive) els.push(circle(38,y+27,4,ACC));
    els.push(text(54,y+22,e.n,11,isActive?TEXT:MID,{fw:isActive?'700':'normal'}));
    els.push(text(54,y+38,e.d,9,MID,{opacity:0.7}));
    els.push(text(W-22,y+30,e.st.toUpperCase(),8,col,{anchor:'end',ls:2}));
  });

  // Config panel
  sectionLabel(els,20,368,'DEPLOY PARAMETERS');
  const params=[
    {k:'STRATEGY',  v:'ROLLING',     note:'5% increments'},
    {k:'REPLICAS',  v:'24',          note:'current: 24'},
    {k:'MAX SURGE', v:'3',           note:'+12.5%'},
    {k:'TIMEOUT',   v:'300s',        note:'global'},
    {k:'ROLLBACK',  v:'AUTO',        note:'on error rate >2%'},
  ];
  params.forEach((p,i)=>{
    const y=384+i*42;
    els.push(line(20,y,370,y,DIM,{sw:1,opacity:0.4}));
    els.push(text(22,y+16,p.k,8,MID,{ls:2}));
    els.push(text(140,y+16,p.v,10,TEXT,{fw:'600'}));
    els.push(text(W-22,y+16,p.note,8,MID,{anchor:'end',opacity:0.55}));
  });
  els.push(line(20,594,370,594,DIM,{sw:1,opacity:0.4}));

  // Progress indicator (canary status)
  sectionLabel(els,20,604,'CANARY HEALTH — LAST 10 MIN');
  // Progress bar
  els.push(rect(20,622,350,10,CARD,{stroke:DIM,sw:1}));
  els.push(rect(20,622,350*0.01,10,ACC,{opacity:0.9})); // 1% canary traffic

  els.push(text(20,648,'1%',9,ACC,{fw:'700'}));
  els.push(text(195,648,'traffic sample',9,MID,{anchor:'middle'}));
  els.push(text(W-20,648,'error 0.02%',9,ACC2,{anchor:'end'}));

  // Deploy button
  els.push(rect(20,H-148,350,50,BG,{stroke:ACC,sw:2}));
  els.push(text(195,H-118,'⬡  PROMOTE TO PRODUCTION',11,ACC,{anchor:'middle',ls:2,fw:'700'}));

  // Secondary action
  els.push(rect(20,H-90,168,28,CARD,{stroke:DIM,sw:1}));
  els.push(text(104,H-72,'ROLLBACK',9,AMB,{anchor:'middle',ls:2}));
  els.push(rect(202,H-90,168,28,CARD,{stroke:DIM,sw:1}));
  els.push(text(286,H-72,'VIEW LOGS',9,MID,{anchor:'middle',ls:2}));

  bottomNav(els,1);
  screens.push({name:'Deploy',svg:'',elements:els});
}

// ── Output ───────────────────────────────────────────────────────────────────
const totalEls = screens.reduce((s,sc)=>s+sc.elements.length,0);

const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    tagline: TAGLINE,
    author: 'RAM',
    date: new Date().toISOString().slice(0,10),
    theme: 'dark',
    heartbeat: HEARTBEAT,
    elements: totalEls,
    slug: SLUG,
    palette: { bg:BG, surface:SURF, accent:ACC, accent2:ACC2 },
    inspiration: 'saaspo.com raw/wireframe aesthetic (Oxide, Crezco) — blueprint grid + electric green counter to Linear purple',
  },
  screens,
};

const outFile = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outFile, JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalEls} elements`);
console.log(`Written: ${SLUG}.pen`);
