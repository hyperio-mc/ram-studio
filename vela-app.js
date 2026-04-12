'use strict';
const fs = require('fs'), path = require('path');
const SLUG = 'vela2';
const NAME = 'VELA';
const W = 390, H = 844;

// ── palette ──────────────────────────────────────────────────────────────
const BG   = '#111111', SURF = '#191818', CARD = '#1E1E1E';
const TEXT  = '#F6F4F1', MUTED = 'rgba(246,244,241,0.38)';
const ACC  = '#00E599', ACC2 = '#00B377';
const BORDER = 'rgba(246,244,241,0.08)';

// ── primitives ────────────────────────────────────────────────────────────
function rect(x,y,w,h,fill,o={}){
  return {type:'rect',x,y,width:w,height:h,fill,
    rx:o.rx??0,opacity:o.opacity??1,stroke:o.stroke??'none',strokeWidth:o.sw??0};
}
function text(x,y,content,size,fill,o={}){
  return {type:'text',x,y,content,fontSize:size,fill,
    fontWeight:o.fw??400,fontFamily:o.font??'Inter',textAnchor:o.anchor??'start',
    letterSpacing:o.ls??0,opacity:o.opacity??1};
}
function circle(cx,cy,r,fill,o={}){
  return {type:'circle',cx,cy,r,fill,opacity:o.opacity??1,stroke:o.stroke??'none',strokeWidth:o.sw??0};
}
function line(x1,y1,x2,y2,stroke,o={}){
  return {type:'line',x1,y1,x2,y2,stroke,strokeWidth:o.sw??1,opacity:o.opacity??1};
}

// ── SCREEN 1: DASHBOARD ──────────────────────────────────────────────────
function screenDashboard(){
  const els = [];
  els.push(rect(0,0,W,H,BG));
  els.push(text(-20, 280, 'VELA', 220, TEXT, {fw:800, opacity:0.04, ls:-8}));
  els.push(rect(0,0,W,44,'transparent'));
  els.push(text(24,28,'9:41',14,TEXT,{fw:500}));
  els.push(text(330,28,'●●●',12,TEXT,{opacity:0.5}));
  els.push(rect(0,52,W,52,SURF));
  els.push(line(0,104,W,104,BORDER,{sw:1}));
  els.push(text(20,83,'VELA',16,TEXT,{fw:700,ls:3}));
  els.push(circle(68,76,3,ACC));
  els.push(rect(308,64,28,28,'transparent',{rx:6}));
  els.push(text(314,83,'⊞',14,MUTED,{fw:400}));
  els.push(rect(344,64,28,28,'transparent',{rx:6}));
  els.push(text(350,83,'◎',14,MUTED,{fw:400}));
  els.push(text(20,136,'Overview',11,MUTED,{fw:600,ls:2}));
  els.push(text(20,156,'Dashboard',22,TEXT,{fw:700}));
  els.push(rect(20,172,W-40,116,CARD,{rx:12,stroke:BORDER,sw:1}));
  els.push(text(32,240,'2.4B',56,ACC,{fw:800,ls:-2}));
  els.push(text(32,264,'events ingested today',12,MUTED,{fw:400}));
  els.push(rect(W-90,195,64,26,ACC,{rx:6,opacity:0.12}));
  els.push(text(W-84,213,'↑ 18.2%',11,ACC,{fw:600}));
  const metrics = [
    {label:'Latency',val:'0.8ms',ch:'+3%'},
    {label:'Queries/s',val:'142K',ch:'+11%'},
    {label:'Uptime',val:'99.99%',ch:'—'},
  ];
  const mW = (W-52)/3;
  metrics.forEach((m,i)=>{
    const mx = 20 + i*(mW+8);
    els.push(rect(mx,304,mW,80,CARD,{rx:10,stroke:BORDER,sw:1}));
    els.push(text(mx+12,326,m.label,10,MUTED,{fw:500,ls:1}));
    els.push(text(mx+12,350,m.val,20,TEXT,{fw:700}));
    const chCol = m.ch.startsWith('+') ? ACC : (m.ch==='-'?'#FF5A5A':MUTED);
    els.push(text(mx+12,368,m.ch,10,chCol,{fw:500}));
  });
  els.push(text(20,412,'Event Distribution',12,TEXT,{fw:600}));
  const bars = [
    {label:'api.request',pct:68,col:ACC},
    {label:'db.query',pct:51,col:ACC2},
    {label:'auth.login',pct:29,col:'rgba(246,244,241,0.5)'},
    {label:'cache.hit',pct:19,col:'rgba(246,244,241,0.3)'},
  ];
  bars.forEach((b,i)=>{
    const by = 430 + i*38;
    els.push(text(20,by+16,b.label,11,MUTED,{fw:400}));
    els.push(rect(120,by+5,W-160,16,SURF,{rx:4}));
    els.push(rect(120,by+5,Math.round((W-160)*b.pct/100),16,b.col,{rx:4,opacity:0.85}));
    els.push(text(W-32,by+16,b.pct+'%',10,MUTED,{fw:500,anchor:'end'}));
  });
  els.push(text(20,590,'Recent Queries',12,TEXT,{fw:600}));
  const queries = [
    {q:'SELECT count(*) FROM events WHERE...', t:'12ms', ago:'2s ago'},
    {q:'SELECT p50, p99 FROM latency_metrics...', t:'3ms', ago:'11s ago'},
    {q:'INSERT INTO spans VALUES ($1, $2, $3)', t:'1ms', ago:'23s ago'},
  ];
  queries.forEach((q,i)=>{
    const qy = 610+i*50;
    els.push(rect(20,qy,W-40,44,SURF,{rx:8,stroke:BORDER,sw:1}));
    els.push(text(32,qy+16,q.q,10,MUTED,{fw:400}));
    els.push(text(32,qy+32,q.ago,9,MUTED,{fw:400,opacity:0.6}));
    els.push(rect(W-70,qy+14,52,16,ACC,{rx:4,opacity:0.12}));
    els.push(text(W-68,qy+25,q.t,10,ACC,{fw:600}));
  });
  els.push(rect(0,H-72,W,72,SURF));
  els.push(line(0,H-72,W,H-72,BORDER,{sw:1}));
  const nav = [{icon:'⊞',lbl:'Home'},{icon:'◈',lbl:'Query'},{icon:'◎',lbl:'Events'},{icon:'▲',lbl:'Perf'},{icon:'◉',lbl:'Usage'}];
  nav.forEach((n,i)=>{
    const nx = 20+i*(W-40)/4.5;
    const isActive = i===0;
    els.push(text(nx+4,H-44,n.icon,18,isActive?ACC:MUTED,{fw:400,anchor:'middle'}));
    els.push(text(nx+4,H-26,n.lbl,9,isActive?ACC:MUTED,{fw:isActive?600:400,anchor:'middle'}));
    if(isActive) els.push(rect(nx-8,H-72,32,2,ACC,{rx:1}));
  });
  return {name:'Dashboard',svg:'',elements:els};
}

// ── SCREEN 2: QUERY EXPLORER ─────────────────────────────────────────────
function screenQuery(){
  const els=[];
  els.push(rect(0,0,W,H,BG));
  els.push(text(-30,320,'SQL',280,TEXT,{fw:900,opacity:0.03,ls:-10}));
  els.push(rect(0,0,W,44,'transparent'));
  els.push(text(24,28,'9:41',14,TEXT,{fw:500}));
  els.push(rect(0,52,W,52,SURF));
  els.push(line(0,104,W,104,BORDER,{sw:1}));
  els.push(text(20,83,'VELA',16,TEXT,{fw:700,ls:3}));
  els.push(circle(68,76,3,ACC));
  els.push(text(20,136,'Analytics',11,MUTED,{fw:600,ls:2}));
  els.push(text(20,156,'Query Explorer',22,TEXT,{fw:700}));
  els.push(rect(20,168,W-40,132,CARD,{rx:12,stroke:ACC,sw:1,opacity:1}));
  els.push(rect(20,168,W-40,28,ACC,{rx:12,opacity:0.08}));
  els.push(circle(32,182,4,'#FF5A5A'));
  els.push(circle(46,182,4,'#FFBD2E'));
  els.push(circle(60,182,4,'#28C941'));
  els.push(text(W-44,183,'Run',10,ACC,{fw:600}));
  els.push(rect(W-52,174,36,16,ACC,{rx:4,opacity:0.15}));
  const sqlLines = [
    {t:'SELECT',c:ACC,x:28,y:214},
    {t:'  event_type,',c:TEXT,x:28,y:228},
    {t:'  count(*) AS total,',c:TEXT,x:28,y:242},
    {t:'  avg(duration_ms) AS p50',c:TEXT,x:28,y:256},
    {t:'FROM events',c:ACC2,x:28,y:270},
    {t:'GROUP BY event_type',c:TEXT,x:28,y:284},
  ];
  sqlLines.forEach(l=>els.push(text(l.x,l.y,l.t,11,l.c,{fw:400,font:'monospace'})));
  els.push(rect(20,312,W-40,44,ACC,{rx:10}));
  els.push(text(W/2,339,'▶  Run Query',14,BG,{fw:700,anchor:'middle'}));
  els.push(text(20,378,'Results',12,TEXT,{fw:600}));
  els.push(text(W-28,378,'1,204 rows · 12ms',10,MUTED,{fw:400,anchor:'end'}));
  els.push(rect(20,390,W-40,28,ACC,{rx:6,opacity:0.1}));
  els.push(text(32,409,'event_type',10,ACC,{fw:600}));
  els.push(text(180,409,'total',10,ACC,{fw:600}));
  els.push(text(280,409,'p50 (ms)',10,ACC,{fw:600}));
  const rows=[
    ['api.request','1,840,293','0.82'],
    ['db.query','924,182','2.14'],
    ['auth.login','241,087','4.91'],
    ['cache.hit','182,440','0.11'],
    ['webhook.send','78,332','18.4'],
  ];
  rows.forEach((r,i)=>{
    const ry=420+i*34;
    if(i%2===0) els.push(rect(20,ry,W-40,34,SURF,{rx:0}));
    els.push(line(20,ry+33,W-20,ry+33,BORDER,{sw:1}));
    els.push(text(32,ry+20,r[0],11,TEXT,{fw:400}));
    els.push(text(180,ry+20,r[1],11,TEXT,{fw:400}));
    els.push(text(280,ry+20,r[2],11,ACC,{fw:500}));
  });
  els.push(text(20,600,'Saved Queries',12,TEXT,{fw:600}));
  const saved=[
    {name:'Daily active events',ago:'1h ago'},
    {name:'P99 latency by region',ago:'6h ago'},
  ];
  saved.forEach((s,i)=>{
    const sy=620+i*44;
    els.push(rect(20,sy,W-40,38,SURF,{rx:8,stroke:BORDER,sw:1}));
    els.push(text(32,sy+15,s.name,12,TEXT,{fw:500}));
    els.push(text(32,sy+29,s.ago,10,MUTED,{fw:400}));
    els.push(text(W-32,sy+19,'→',14,MUTED,{fw:400,anchor:'end'}));
  });
  els.push(rect(0,H-72,W,72,SURF));
  els.push(line(0,H-72,W,H-72,BORDER,{sw:1}));
  const nav=[{icon:'⊞',lbl:'Home'},{icon:'◈',lbl:'Query'},{icon:'◎',lbl:'Events'},{icon:'▲',lbl:'Perf'},{icon:'◉',lbl:'Usage'}];
  nav.forEach((n,i)=>{
    const nx=20+i*(W-40)/4.5;
    const isActive=i===1;
    els.push(text(nx+4,H-44,n.icon,18,isActive?ACC:MUTED,{fw:400,anchor:'middle'}));
    els.push(text(nx+4,H-26,n.lbl,9,isActive?ACC:MUTED,{fw:isActive?600:400,anchor:'middle'}));
    if(isActive) els.push(rect(nx-8,H-72,32,2,ACC,{rx:1}));
  });
  return {name:'Query Explorer',svg:'',elements:els};
}

// ── SCREEN 3: EVENTS STREAM ───────────────────────────────────────────────
function screenEvents(){
  const els=[];
  els.push(rect(0,0,W,H,BG));
  els.push(text(-10,320,'2.4B',200,TEXT,{fw:900,opacity:0.03,ls:-6}));
  els.push(rect(0,0,W,44,'transparent'));
  els.push(text(24,28,'9:41',14,TEXT,{fw:500}));
  els.push(rect(0,52,W,52,SURF));
  els.push(line(0,104,W,104,BORDER,{sw:1}));
  els.push(text(20,83,'VELA',16,TEXT,{fw:700,ls:3}));
  els.push(circle(68,76,3,ACC));
  els.push(text(20,136,'Real-time',11,MUTED,{fw:600,ls:2}));
  els.push(text(20,156,'Events Stream',22,TEXT,{fw:700}));
  els.push(rect(W-90,140,72,22,ACC,{rx:11,opacity:0.12}));
  els.push(circle(W-82,151,4,ACC));
  els.push(text(W-74,155,'LIVE',10,ACC,{fw:700,ls:1}));
  const chips=['All','API','DB','Auth','Webhook'];
  let cx=20;
  chips.forEach((c,i)=>{
    const cw=c.length*7+20;
    els.push(rect(cx,170,cw,26,i===0?ACC:SURF,{rx:13,stroke:i===0?ACC:BORDER,sw:1}));
    els.push(text(cx+cw/2,187,c,10,i===0?BG:MUTED,{fw:i===0?600:400,anchor:'middle'}));
    cx+=cw+8;
  });
  const events=[
    {type:'api.request',method:'POST',path:'/v1/ingest',code:200,ms:'0.8ms',ago:'now'},
    {type:'db.query',method:'SELECT',path:'events WHERE...',code:null,ms:'2.1ms',ago:'1s'},
    {type:'auth.login',method:'POST',path:'/v1/auth/token',code:200,ms:'4.9ms',ago:'2s'},
    {type:'api.request',method:'GET',path:'/v1/query',code:200,ms:'1.2ms',ago:'3s'},
    {type:'webhook.send',method:'POST',path:'hooks.zapier.com',code:404,ms:'18ms',ago:'5s'},
    {type:'cache.hit',method:'GET',path:'events:daily:cache',code:null,ms:'0.1ms',ago:'6s'},
    {type:'db.query',method:'INSERT',path:'spans VALUES...',code:null,ms:'1.0ms',ago:'8s'},
    {type:'api.request',method:'DELETE',path:'/v1/events/old',code:200,ms:'3.4ms',ago:'12s'},
  ];
  const typeColors={'api.request':ACC,'db.query':ACC2,'auth.login':'rgba(246,244,241,0.7)','webhook.send':'#FF8C69','cache.hit':'rgba(246,244,241,0.4)'};
  events.forEach((e,i)=>{
    const ey=208+i*70;
    if(ey>H-80) return;
    const col=typeColors[e.type]||MUTED;
    els.push(rect(20,ey,W-40,64,SURF,{rx:8,stroke:BORDER,sw:1}));
    els.push(rect(20,ey,3,64,col,{rx:1}));
    const bw=e.type.length*6+12;
    els.push(rect(32,ey+10,bw,18,col,{rx:4,opacity:0.15}));
    els.push(text(38,ey+22,e.type,9,col,{fw:600,ls:0.5}));
    els.push(rect(32+bw+6,ey+10,e.method.length*6+10,18,CARD,{rx:4}));
    els.push(text(32+bw+12,ey+22,e.method,9,MUTED,{fw:500}));
    els.push(text(32,ey+40,e.path,10,TEXT,{fw:400}));
    els.push(text(W-32,ey+22,e.ms,10,ACC,{fw:600,anchor:'end'}));
    els.push(text(W-32,ey+40,e.ago,9,MUTED,{fw:400,anchor:'end'}));
    if(e.code){
      const codeCol=e.code===200?ACC:(e.code>=400?'#FF5A5A':MUTED);
      els.push(text(W-78,ey+40,String(e.code),9,codeCol,{fw:600,anchor:'end'}));
    }
  });
  els.push(rect(0,H-72,W,72,SURF));
  els.push(line(0,H-72,W,H-72,BORDER,{sw:1}));
  const nav=[{icon:'⊞',lbl:'Home'},{icon:'◈',lbl:'Query'},{icon:'◎',lbl:'Events'},{icon:'▲',lbl:'Perf'},{icon:'◉',lbl:'Usage'}];
  nav.forEach((n,i)=>{
    const nx=20+i*(W-40)/4.5;
    const isActive=i===2;
    els.push(text(nx+4,H-44,n.icon,18,isActive?ACC:MUTED,{fw:400,anchor:'middle'}));
    els.push(text(nx+4,H-26,n.lbl,9,isActive?ACC:MUTED,{fw:isActive?600:400,anchor:'middle'}));
    if(isActive) els.push(rect(nx-8,H-72,32,2,ACC,{rx:1}));
  });
  return {name:'Events Stream',svg:'',elements:els};
}

// ── SCREEN 4: PERFORMANCE ────────────────────────────────────────────────
function screenPerf(){
  const els=[];
  els.push(rect(0,0,W,H,BG));
  els.push(text(-20,300,'PERF',210,TEXT,{fw:900,opacity:0.035,ls:-8}));
  els.push(rect(0,0,W,44,'transparent'));
  els.push(text(24,28,'9:41',14,TEXT,{fw:500}));
  els.push(rect(0,52,W,52,SURF));
  els.push(line(0,104,W,104,BORDER,{sw:1}));
  els.push(text(20,83,'VELA',16,TEXT,{fw:700,ls:3}));
  els.push(circle(68,76,3,ACC));
  els.push(text(20,136,'Metrics',11,MUTED,{fw:600,ls:2}));
  els.push(text(20,156,'Performance',22,TEXT,{fw:700}));
  const times=['1h','6h','24h','7d','30d'];
  let tx=W-20-times.length*38;
  times.forEach((t,i)=>{
    els.push(rect(tx,140,30,22,i===2?ACC:SURF,{rx:6,stroke:i===2?ACC:BORDER,sw:1}));
    els.push(text(tx+15,155,t,9,i===2?BG:MUTED,{fw:i===2?600:400,anchor:'middle'}));
    tx+=38;
  });
  els.push(rect(20,172,W-40,100,CARD,{rx:12,stroke:BORDER,sw:1}));
  els.push(text(32,192,'Query Latency (ms)',10,MUTED,{fw:500,ls:1}));
  els.push(text(32,210,'P50: 0.8ms',20,TEXT,{fw:700}));
  els.push(text(120,210,'  P99: 4.2ms',14,MUTED,{fw:400}));
  const pts=[2,8,5,12,6,3,9,4,7,2,5,8,3,6,4,9,2,7,3,5];
  const chartX=28, chartY=230, chartW=W-56, chartH=32;
  pts.forEach((p,i)=>{
    const px=chartX+i*(chartW/(pts.length-1));
    const py=chartY+chartH-(p/12)*chartH;
    if(i>0){
      const pp=pts[i-1];
      const ppx=chartX+(i-1)*(chartW/(pts.length-1));
      const ppy=chartY+chartH-(pp/12)*chartH;
      els.push(line(ppx,ppy,px,py,ACC,{sw:1.5,opacity:0.8}));
    }
    if(i===pts.length-1) els.push(circle(px,py,3,ACC));
  });
  const perfCards=[
    {label:'Avg Response',val:'1.2ms',sub:'across 48 regions',trend:'+0ms'},
    {label:'Error Rate',val:'0.003%',sub:'last 24 hours',trend:'-0.001%'},
    {label:'Throughput',val:'142K/s',sub:'events per second',trend:'+18%'},
    {label:'Cache Hit',val:'94.7%',sub:'global cache ratio',trend:'+2.1%'},
  ];
  const cw=(W-52)/2;
  perfCards.forEach((c,i)=>{
    const cx=20+(i%2)*(cw+12);
    const cy=284+(Math.floor(i/2))*92;
    els.push(rect(cx,cy,cw,84,CARD,{rx:10,stroke:BORDER,sw:1}));
    els.push(text(cx+12,cy+20,c.label,10,MUTED,{fw:500,ls:0.5}));
    els.push(text(cx+12,cy+44,c.val,22,TEXT,{fw:700}));
    els.push(text(cx+12,cy+60,c.sub,9,MUTED,{fw:400}));
    const tCol=c.trend.startsWith('+')?ACC:(c.trend.startsWith('-')&&c.label==='Error Rate'?ACC:'#FF5A5A');
    els.push(text(cx+cw-12,cy+22,c.trend,9,tCol,{fw:600,anchor:'end'}));
  });
  els.push(text(20,480,'Region Latency',12,TEXT,{fw:600}));
  const regions=[
    {name:'us-east-1 · N. Virginia',ms:'0.6ms'},
    {name:'eu-west-1 · Ireland',ms:'1.1ms'},
    {name:'ap-southeast-1 · Singapore',ms:'2.3ms'},
    {name:'us-west-2 · Oregon',ms:'0.8ms'},
  ];
  regions.forEach((r,i)=>{
    const ry=500+i*46;
    els.push(rect(20,ry,W-40,40,SURF,{rx:8,stroke:BORDER,sw:1}));
    els.push(circle(36,ry+20,5,ACC,{opacity:0.6}));
    els.push(text(50,ry+15,r.name,11,TEXT,{fw:500}));
    els.push(text(50,ry+29,'p50 latency',9,MUTED,{fw:400}));
    els.push(text(W-32,ry+22,r.ms,12,ACC,{fw:700,anchor:'end'}));
  });
  els.push(rect(0,H-72,W,72,SURF));
  els.push(line(0,H-72,W,H-72,BORDER,{sw:1}));
  const nav=[{icon:'⊞',lbl:'Home'},{icon:'◈',lbl:'Query'},{icon:'◎',lbl:'Events'},{icon:'▲',lbl:'Perf'},{icon:'◉',lbl:'Usage'}];
  nav.forEach((n,i)=>{
    const nx=20+i*(W-40)/4.5;
    const isActive=i===3;
    els.push(text(nx+4,H-44,n.icon,18,isActive?ACC:MUTED,{fw:400,anchor:'middle'}));
    els.push(text(nx+4,H-26,n.lbl,9,isActive?ACC:MUTED,{fw:isActive?600:400,anchor:'middle'}));
    if(isActive) els.push(rect(nx-8,H-72,32,2,ACC,{rx:1}));
  });
  return {name:'Performance',svg:'',elements:els};
}

// ── SCREEN 5: USAGE ──────────────────────────────────────────────────────
function screenUsage(){
  const els=[];
  els.push(rect(0,0,W,H,BG));
  els.push(text(-10,300,'$',260,TEXT,{fw:900,opacity:0.025,ls:0}));
  els.push(rect(0,0,W,44,'transparent'));
  els.push(text(24,28,'9:41',14,TEXT,{fw:500}));
  els.push(rect(0,52,W,52,SURF));
  els.push(line(0,104,W,104,BORDER,{sw:1}));
  els.push(text(20,83,'VELA',16,TEXT,{fw:700,ls:3}));
  els.push(circle(68,76,3,ACC));
  els.push(text(20,136,'Billing',11,MUTED,{fw:600,ls:2}));
  els.push(text(20,156,'Usage',22,TEXT,{fw:700}));
  els.push(rect(20,172,W-40,80,CARD,{rx:12,stroke:ACC,sw:1,opacity:1}));
  els.push(rect(20,172,W-40,80,ACC,{rx:12,opacity:0.06}));
  els.push(text(32,198,'Pro Plan',12,MUTED,{fw:600,ls:1}));
  els.push(text(32,220,'$49 / month',28,TEXT,{fw:800}));
  els.push(rect(W-96,190,72,24,ACC,{rx:12}));
  els.push(text(W-60,207,'Upgrade',10,BG,{fw:700,anchor:'middle'}));
  els.push(text(32,240,'Renews May 11, 2026',10,MUTED,{fw:400}));
  els.push(text(20,272,'This Month',12,TEXT,{fw:600}));
  const meters=[
    {label:'Events Ingested',used:2.4,limit:10,unit:'B'},
    {label:'Query Compute',used:142,limit:500,unit:'K req'},
    {label:'Data Storage',used:18.2,limit:100,unit:'GB'},
    {label:'API Calls',used:89,limit:250,unit:'K'},
  ];
  meters.forEach((m,i)=>{
    const my=292+i*60;
    els.push(rect(20,my,W-40,52,SURF,{rx:8,stroke:BORDER,sw:1}));
    els.push(text(32,my+18,m.label,11,TEXT,{fw:500}));
    const pct=Math.round(m.used/m.limit*100);
    els.push(text(W-32,my+18,`${m.used}${m.unit} / ${m.limit}${m.unit}`,10,MUTED,{fw:400,anchor:'end'}));
    els.push(rect(32,my+28,W-64,8,CARD,{rx:4}));
    const barCol=pct>80?'#FF8C69':(pct>60?'#FFBD2E':ACC);
    els.push(rect(32,my+28,Math.round((W-64)*pct/100),8,barCol,{rx:4}));
    els.push(text(32,my+46,pct+'% used',9,MUTED,{fw:400}));
  });
  els.push(text(20,540,'Invoice History',12,TEXT,{fw:600}));
  const invoices=[
    {month:'April 2026',amount:'$49.00',status:'Pending'},
    {month:'March 2026',amount:'$49.00',status:'Paid'},
    {month:'February 2026',amount:'$49.00',status:'Paid'},
  ];
  invoices.forEach((inv,i)=>{
    const iy=560+i*48;
    els.push(rect(20,iy,W-40,42,SURF,{rx:8,stroke:BORDER,sw:1}));
    els.push(text(32,iy+17,inv.month,12,TEXT,{fw:500}));
    els.push(text(32,iy+31,inv.status,10,inv.status==='Paid'?ACC:MUTED,{fw:500}));
    els.push(text(W-32,iy+24,inv.amount,14,TEXT,{fw:700,anchor:'end'}));
    els.push(text(W-32,iy+36,'↓',11,MUTED,{fw:400,anchor:'end'}));
  });
  els.push(rect(0,H-72,W,72,SURF));
  els.push(line(0,H-72,W,H-72,BORDER,{sw:1}));
  const nav=[{icon:'⊞',lbl:'Home'},{icon:'◈',lbl:'Query'},{icon:'◎',lbl:'Events'},{icon:'▲',lbl:'Perf'},{icon:'◉',lbl:'Usage'}];
  nav.forEach((n,i)=>{
    const nx=20+i*(W-40)/4.5;
    const isActive=i===4;
    els.push(text(nx+4,H-44,n.icon,18,isActive?ACC:MUTED,{fw:400,anchor:'middle'}));
    els.push(text(nx+4,H-26,n.lbl,9,isActive?ACC:MUTED,{fw:isActive?600:400,anchor:'middle'}));
    if(isActive) els.push(rect(nx-8,H-72,32,2,ACC,{rx:1}));
  });
  return {name:'Usage',svg:'',elements:els};
}

// ── SCREEN 6: SETTINGS / TEAM ─────────────────────────────────────────────
function screenSettings(){
  const els=[];
  els.push(rect(0,0,W,H,BG));
  els.push(text(-20,280,'SET',240,TEXT,{fw:900,opacity:0.03,ls:-6}));
  els.push(rect(0,0,W,44,'transparent'));
  els.push(text(24,28,'9:41',14,TEXT,{fw:500}));
  els.push(rect(0,52,W,52,SURF));
  els.push(line(0,104,W,104,BORDER,{sw:1}));
  els.push(text(20,83,'VELA',16,TEXT,{fw:700,ls:3}));
  els.push(circle(68,76,3,ACC));
  els.push(text(20,136,'Config',11,MUTED,{fw:600,ls:2}));
  els.push(text(20,156,'Settings',22,TEXT,{fw:700}));
  els.push(rect(20,172,W-40,70,CARD,{rx:12,stroke:BORDER,sw:1}));
  els.push(circle(38,207,14,ACC,{opacity:0.15}));
  els.push(text(38,213,'V',12,ACC,{fw:800,anchor:'middle'}));
  els.push(text(62,199,'acme-production',14,TEXT,{fw:600}));
  els.push(text(62,215,'us-east-1 · PostgreSQL 16',10,MUTED,{fw:400}));
  els.push(text(W-32,199,'›',18,MUTED,{fw:300,anchor:'end'}));
  els.push(text(20,262,'API Keys',12,TEXT,{fw:600}));
  const keys=[
    {name:'Production Key',prefix:'vela_prod_••••••4f2a'},
    {name:'Development Key',prefix:'vela_dev_••••••8c19'},
  ];
  keys.forEach((k,i)=>{
    const ky=280+i*56;
    els.push(rect(20,ky,W-40,50,SURF,{rx:8,stroke:BORDER,sw:1}));
    els.push(text(32,ky+18,k.name,11,TEXT,{fw:500}));
    els.push(text(32,ky+32,k.prefix,10,MUTED,{fw:400,font:'monospace'}));
    els.push(rect(W-72,ky+16,52,20,CARD,{rx:4,stroke:BORDER,sw:1}));
    els.push(text(W-46,ky+30,'Revoke',9,MUTED,{fw:500,anchor:'middle'}));
  });
  els.push(text(20,404,'Team',12,TEXT,{fw:600}));
  const team=[
    {name:'Lena Marchetti',role:'Owner',email:'lena@acme.io'},
    {name:'Josh Kim',role:'Engineer',email:'josh@acme.io'},
    {name:'Priya Nair',role:'Analyst',email:'priya@acme.io'},
  ];
  team.forEach((m,i)=>{
    const ty=424+i*52;
    els.push(rect(20,ty,W-40,46,SURF,{rx:8,stroke:BORDER,sw:1}));
    els.push(circle(42,ty+23,14,CARD,{stroke:BORDER,sw:1}));
    els.push(text(42,ty+28,m.name[0],11,ACC,{fw:700,anchor:'middle'}));
    els.push(text(64,ty+18,m.name,12,TEXT,{fw:500}));
    els.push(text(64,ty+32,m.email,9,MUTED,{fw:400}));
    const rCol=m.role==='Owner'?ACC:MUTED;
    els.push(rect(W-64,ty+14,48,18,rCol,{rx:9,opacity:m.role==='Owner'?0.15:0.08}));
    els.push(text(W-40,ty+26,m.role,9,rCol,{fw:600,anchor:'middle'}));
  });
  els.push(rect(20,584,W-40,40,ACC,{rx:10,opacity:0.12,stroke:ACC,sw:1}));
  els.push(text(W/2,609,'+ Invite Member',13,ACC,{fw:600,anchor:'middle'}));
  els.push(text(20,642,'Preferences',12,TEXT,{fw:600}));
  const prefs=['Notifications','Webhook Endpoints','Data Retention','Security & SSO'];
  prefs.forEach((p,i)=>{
    const py=660+i*42;
    if(py>H-80) return;
    els.push(rect(20,py,W-40,36,SURF,{rx:8,stroke:BORDER,sw:1}));
    els.push(text(32,py+22,p,12,TEXT,{fw:400}));
    els.push(text(W-32,py+22,'›',14,MUTED,{fw:300,anchor:'end'}));
  });
  els.push(rect(0,H-72,W,72,SURF));
  els.push(line(0,H-72,W,H-72,BORDER,{sw:1}));
  const nav=[{icon:'⊞',lbl:'Home'},{icon:'◈',lbl:'Query'},{icon:'◎',lbl:'Events'},{icon:'▲',lbl:'Perf'},{icon:'◉',lbl:'Usage'}];
  nav.forEach((n,i)=>{
    const nx=20+i*(W-40)/4.5;
    els.push(text(nx+4,H-44,n.icon,18,MUTED,{fw:400,anchor:'middle'}));
    els.push(text(nx+4,H-26,n.lbl,9,MUTED,{fw:400,anchor:'middle'}));
  });
  return {name:'Settings',svg:'',elements:els};
}

// ── COMPOSE PEN ───────────────────────────────────────────────────────────
const screens=[
  screenDashboard(),
  screenQuery(),
  screenEvents(),
  screenPerf(),
  screenUsage(),
  screenSettings(),
];

const total=screens.reduce((s,sc)=>s+sc.elements.length,0);

const pen={
  version:'2.8',
  metadata:{
    name:'VELA — Edge Analytics',
    author:'RAM',
    date:'2026-04-11',
    theme:'dark',
    heartbeat:470,
    elements:total,
    slug:SLUG,
    tagline:'Query the edge. Instantly.',
    inspiration:'Neon.com (darkmodedesign.com) + 108 Supply',
  },
  screens,
};

fs.writeFileSync(path.join(__dirname,`${SLUG}.pen`),JSON.stringify(pen,null,2));
console.log(`${NAME}: ${screens.length} screens, ${total} elements`);
console.log(`Written: ${SLUG}.pen`);
