'use strict';
const fs = require('fs'), path = require('path');

const SLUG = 'hook';
const W = 390, H = 844;

// ─── PALETTE — Linear-inspired dark developer tool ───────────────────────────
const INK    = '#0E1015';   // base background — near-black with blue undertone
const SURF   = '#151921';   // surface level 1 — cards
const CARD   = '#1C2130';   // surface level 2 — elevated / focused
const RAIL   = '#232B3C';   // surface level 3 — modals, active states
const TEXT   = '#E8EAEF';   // primary text
const MUTED  = 'rgba(232,234,239,0.45)';
const DIM    = 'rgba(232,234,239,0.2)';
const INDIGO = '#5E6AD2';   // primary — actions, links, active nav
const TEAL   = '#14B69C';   // success — 2xx, delivered
const RED    = '#E5484D';   // error — 4xx/5xx, failed
const AMBER  = '#F0A020';   // warning — retrying, slow
const CYAN   = '#00C9D4';   // highlight — new events

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
    rect(0,0,W,44,INK),
    text(18,28,'9:41',13,TEXT,{fw:600}),
    text(W-18,28,'●●●',11,TEXT,{anchor:'end'}),
  ];
}

// ─── BOTTOM NAV ──────────────────────────────────────────────────────────────
function bottomNav(active) {
  const items = [
    { id:'dashboard', icon:'◉', label:'Live'    },
    { id:'endpoints', icon:'⊟', label:'Hooks'   },
    { id:'logs',      icon:'≡',  label:'Logs'    },
    { id:'alerts',    icon:'◈', label:'Alerts'  },
    { id:'settings',  icon:'◎', label:'Settings'},
  ];
  const els = [
    rect(0,H-82,W,82,SURF,{stroke:'rgba(232,234,239,0.07)',sw:1}),
    line(0,H-82,W,H-82,'rgba(232,234,239,0.07)'),
  ];
  items.forEach((it,i) => {
    const x = 39 + i*78;
    const isActive = it.id===active;
    els.push(
      text(x,H-50,it.icon,22,isActive?INDIGO:MUTED,{anchor:'middle',fw:isActive?700:400}),
      text(x,H-28,it.label,10,isActive?INDIGO:MUTED,{anchor:'middle',fw:isActive?600:400}),
    );
    if (isActive) {
      els.push(rect(x-18,H-82,36,2,INDIGO,{rx:1}));
    }
  });
  return els;
}

// ─── STATUS DOT ──────────────────────────────────────────────────────────────
function statusDot(x,y,status) {
  const col = status==='ok'?TEAL:status==='fail'?RED:status==='warn'?AMBER:MUTED;
  return circle(x,y,4,col,{opacity:0.9});
}

// ─── SCREEN 1: LIVE DASHBOARD ─────────────────────────────────────────────────
function screenDashboard() {
  const els = [];
  els.push(rect(0,0,W,H,INK));
  statusBar().forEach(e=>els.push(e));

  // Header
  els.push(text(24,72,'HOOK',18,TEXT,{fw:700,ls:2}));
  els.push(rect(W-56,60,40,20,TEAL,{rx:10,opacity:0.15}));
  els.push(circle(W-44,70,4,TEAL,{opacity:0.8}));
  els.push(text(W-38,74,'live',10,TEAL,{fw:600}));

  // Hero stat strip
  els.push(rect(16,86,W-32,60,SURF,{rx:12}));
  const heroStats = [
    {label:'Events / min', value:'142'},
    {label:'Success rate', value:'99.3%'},
    {label:'P95 latency',  value:'48ms'},
  ];
  heroStats.forEach((s,i) => {
    const x = 56+i*104;
    const col = i===1?TEAL:i===2?CYAN:TEXT;
    els.push(text(x,110,s.value,17,col,{fw:700,anchor:'middle'}));
    els.push(text(x,124,s.label,9,MUTED,{anchor:'middle'}));
    if(i<2) els.push(line(x+52,92,x+52,138,'rgba(232,234,239,0.07)'));
  });

  // Live event feed
  els.push(text(24,164,'Live Events',13,TEXT,{fw:600}));
  els.push(text(W-24,164,'pause',11,MUTED,{anchor:'end'}));

  const events = [
    { method:'POST', path:'/webhooks/stripe',    code:200, ms:23,  ts:'now',   status:'ok'   },
    { method:'POST', path:'/webhooks/github',    code:200, ms:31,  ts:'1s',    status:'ok'   },
    { method:'POST', path:'/webhooks/sendgrid',  code:500, ms:1204,ts:'2s',    status:'fail' },
    { method:'POST', path:'/webhooks/shopify',   code:200, ms:18,  ts:'4s',    status:'ok'   },
    { method:'POST', path:'/webhooks/twilio',    code:200, ms:44,  ts:'6s',    status:'ok'   },
    { method:'POST', path:'/webhooks/pagerduty', code:429, ms:88,  ts:'9s',    status:'warn' },
    { method:'POST', path:'/webhooks/linear',    code:200, ms:29,  ts:'11s',   status:'ok'   },
  ];

  events.forEach((ev,i) => {
    const y = 180+i*62;
    const isNew = i===0;
    els.push(rect(16,y,W-32,54,isNew?CARD:SURF,{rx:10,stroke:isNew?'rgba(94,106,210,0.3)':'none',sw:1}));
    if(isNew) els.push(rect(16,y,3,54,INDIGO,{rx:2}));
    statusDot(38, y+18, ev.status);
    const codeCol = ev.code<400?TEAL:ev.code<500?AMBER:RED;
    els.push(text(50,y+20,ev.code.toString(),12,codeCol,{fw:700}));
    els.push(text(50,y+36,ev.path,11,MUTED));
    els.push(text(W-24,y+20,ev.ms+'ms',11,ev.ms>500?AMBER:MUTED,{anchor:'end',fw:ev.ms>500?600:400}));
    els.push(text(W-24,y+36,ev.ts,10,DIM,{anchor:'end'}));
  });

  bottomNav('dashboard').forEach(e=>els.push(e));
  return { name:'Live', svg:'', elements: els };
}

// ─── SCREEN 2: ENDPOINTS (HOOKS) ─────────────────────────────────────────────
function screenEndpoints() {
  const els = [];
  els.push(rect(0,0,W,H,INK));
  statusBar().forEach(e=>els.push(e));

  els.push(text(24,72,'Endpoints',18,TEXT,{fw:700}));
  els.push(rect(W-44,60,30,22,INDIGO,{rx:11}));
  els.push(text(W-29,74,'+',14,TEXT,{anchor:'middle',fw:600}));

  // Search
  els.push(rect(16,84,W-32,38,SURF,{rx:19,stroke:'rgba(232,234,239,0.08)',sw:1}));
  els.push(text(44,108,'⊕  Search endpoints…',13,MUTED));

  // Filter row
  const filters = ['All','Active','Failing','Paused'];
  let fx = 16;
  filters.forEach((f,i) => {
    const w = f.length*7+24;
    const isActive = i===0;
    els.push(rect(fx,130,w,26,isActive?INDIGO:SURF,{rx:13,stroke:isActive?'none':'rgba(232,234,239,0.08)',sw:1}));
    els.push(text(fx+w/2,147,f,11,isActive?TEXT:MUTED,{anchor:'middle',fw:isActive?600:400}));
    fx += w+8;
  });

  // Endpoint list
  const endpoints = [
    { name:'stripe-events',   url:'wh.acme.co/stripe',   rate:1240, success:99.8, status:'ok'   },
    { name:'github-webhooks', url:'wh.acme.co/github',   rate:88,   success:100,  status:'ok'   },
    { name:'sendgrid-bounce', url:'wh.acme.co/email',    rate:34,   success:67.2, status:'fail' },
    { name:'shopify-orders',  url:'wh.acme.co/shopify',  rate:206,  success:99.1, status:'ok'   },
    { name:'pagerduty-alerts',url:'wh.acme.co/pd',       rate:12,   success:83.3, status:'warn' },
    { name:'linear-events',   url:'wh.acme.co/linear',   rate:55,   success:100,  status:'ok'   },
  ];

  endpoints.forEach((ep,i) => {
    const y = 168+i*88;
    const sCol = ep.status==='ok'?TEAL:ep.status==='fail'?RED:AMBER;
    els.push(rect(16,y,W-32,80,SURF,{rx:12}));
    // Status stripe
    els.push(rect(16,y,3,80,sCol,{rx:2}));
    // Status dot + name
    statusDot(34,y+18,ep.status);
    els.push(text(44,y+22,ep.name,13,TEXT,{fw:600}));
    els.push(text(30,y+36,ep.url,10,MUTED));
    // Rate bar
    const barW = W-32-20-60;
    els.push(rect(30,y+50,barW,8,CARD,{rx:4}));
    els.push(rect(30,y+50,barW*(ep.success/100),8,sCol,{rx:4,opacity:0.7}));
    els.push(text(30+barW+8,y+57,ep.success+'%',10,sCol,{fw:600}));
    // Rate
    els.push(text(W-24,y+22,ep.rate+'/hr',10,MUTED,{anchor:'end'}));
    els.push(line(30,y+80,W-22,y+80,'rgba(232,234,239,0.05)'));
  });

  bottomNav('endpoints').forEach(e=>els.push(e));
  return { name:'Hooks', svg:'', elements: els };
}

// ─── SCREEN 3: REQUEST INSPECTOR ─────────────────────────────────────────────
function screenInspector() {
  const els = [];
  els.push(rect(0,0,W,H,INK));
  statusBar().forEach(e=>els.push(e));

  // Back + title
  els.push(text(24,72,'← Logs',12,INDIGO,{fw:500}));
  els.push(text(24,92,'Request Detail',17,TEXT,{fw:700}));

  // Request summary card
  els.push(rect(16,106,W-32,72,SURF,{rx:12}));
  els.push(rect(16,106,3,72,RED,{rx:2}));
  els.push(text(30,124,'POST /webhooks/sendgrid',13,TEXT,{fw:600}));
  els.push(text(30,140,'stripe-events endpoint · 2s ago',10,MUTED));
  els.push(rect(W-82,114,60,20,RED,{rx:10,opacity:0.15}));
  els.push(text(W-52,128,'500 ERR',10,RED,{anchor:'middle',fw:700}));
  els.push(text(30,158,'Response time: 1,204ms',11,AMBER,{fw:500}));

  // Tabs
  const tabs = ['Headers','Payload','Response','Replay'];
  tabs.forEach((t,i) => {
    const isActive = i===1;
    const tx = 24+i*86;
    els.push(text(tx,194,t,12,isActive?TEXT:MUTED,{fw:isActive?600:400}));
    if(isActive) els.push(rect(tx,200,t.length*7.2,2,INDIGO,{rx:1}));
  });
  els.push(line(16,204,W-16,204,'rgba(232,234,239,0.08)'));

  // Payload viewer — JSON syntax highlight style
  els.push(rect(16,212,W-32,216,CARD,{rx:10}));
  const json = [
    { indent:0, text:'{',                              col:TEXT    },
    { indent:1, text:'"event": "email.bounced",',      col:TEXT    },
    { indent:1, text:'"timestamp": 1744243200,',       col:TEXT    },
    { indent:1, text:'"email": "user@example.com",',   col:TEXT    },
    { indent:1, text:'"reason": "550 5.1.1 User',      col:AMBER   },
    { indent:1, text:'          unknown.",',            col:AMBER   },
    { indent:1, text:'"bounce_type": "hard",',         col:RED     },
    { indent:1, text:'"sg_event_id": "abc123xyz",',    col:TEXT    },
    { indent:0, text:'}',                              col:TEXT    },
  ];
  json.forEach((j,i) => {
    els.push(text(28+j.indent*12,232+i*22,j.text,10,j.col,{font:'monospace'}));
  });

  // Error trace
  els.push(text(24,440,'Error Trace',13,TEXT,{fw:600}));
  els.push(rect(16,456,W-32,68,RAIL,{rx:10}));
  els.push(text(28,472,'Error: Database write failed',11,RED,{font:'monospace'}));
  els.push(text(28,488,'  at processEvent (handlers.js:142)',10,MUTED,{font:'monospace'}));
  els.push(text(28,504,'  at POST /webhooks/sendgrid',10,MUTED,{font:'monospace'}));
  els.push(text(28,516,'  at router.handle (express.js:284)',10,MUTED,{font:'monospace'}));

  // Action buttons
  els.push(rect(16,538,W/2-22,40,CARD,{rx:10}));
  els.push(text(W/4+5,562,'↺ Replay',13,AMBER,{anchor:'middle',fw:600}));
  els.push(rect(W/2+6,538,W/2-22,40,INDIGO,{rx:10}));
  els.push(text(W*3/4+5,562,'→ Debug',13,TEXT,{anchor:'middle',fw:600}));

  // Timeline
  els.push(text(24,596,'Delivery Timeline',13,TEXT,{fw:600}));
  els.push(rect(16,612,W-32,72,SURF,{rx:10}));
  const timeline = [
    {label:'Request received', t:'0ms',   col:TEAL },
    {label:'Auth verified',    t:'4ms',   col:TEAL },
    {label:'Handler invoked',  t:'12ms',  col:TEAL },
    {label:'DB write failed',  t:'1204ms',col:RED  },
  ];
  timeline.forEach((tl,i) => {
    const x = 28+i*84;
    els.push(circle(x,626,5,tl.col,{opacity:0.8}));
    if(i<3) els.push(line(x+5,626,x+79,626,MUTED,{opacity:0.2}));
    els.push(text(x,642,tl.label,8,MUTED,{anchor:'middle'}));
    els.push(text(x,656,tl.t,9,tl.col,{anchor:'middle',fw:600}));
  });

  bottomNav('logs').forEach(e=>els.push(e));
  return { name:'Inspector', svg:'', elements: els };
}

// ─── SCREEN 4: LOGS ──────────────────────────────────────────────────────────
function screenLogs() {
  const els = [];
  els.push(rect(0,0,W,H,INK));
  statusBar().forEach(e=>els.push(e));

  els.push(text(24,72,'Logs',18,TEXT,{fw:700}));
  els.push(text(W-24,72,'Filter ⌃',12,MUTED,{anchor:'end'}));

  // Filter row
  const filters = ['All','Failed','2xx','4xx','5xx','Slow'];
  let fx = 16;
  filters.forEach((f,i) => {
    const w = f.length*7+18;
    const col = f==='Failed'?RED:f==='Slow'?AMBER:f.startsWith('2')?TEAL:INDIGO;
    const isActive = i===0;
    els.push(rect(fx,82,w,24,isActive?INDIGO:SURF,{rx:12,stroke:isActive?'none':'rgba(232,234,239,0.08)',sw:1}));
    els.push(text(fx+w/2,98,f,10,isActive?TEXT:MUTED,{anchor:'middle',fw:isActive?600:400}));
    fx += w+6;
  });

  // Log rows — compact terminal-style
  const logs = [
    { code:200, method:'POST', path:'/webhooks/stripe',    ms:23,   ts:'09:41:02', ep:'stripe-events'},
    { code:200, method:'POST', path:'/webhooks/github',    ms:31,   ts:'09:41:01', ep:'github-webhooks'},
    { code:500, method:'POST', path:'/webhooks/sendgrid',  ms:1204, ts:'09:41:00', ep:'sendgrid-bounce'},
    { code:200, method:'POST', path:'/webhooks/shopify',   ms:18,   ts:'09:40:58', ep:'shopify-orders'},
    { code:429, method:'POST', path:'/webhooks/pagerduty', ms:88,   ts:'09:40:55', ep:'pagerduty-alerts'},
    { code:200, method:'POST', path:'/webhooks/linear',    ms:29,   ts:'09:40:53', ep:'linear-events'},
    { code:200, method:'POST', path:'/webhooks/stripe',    ms:21,   ts:'09:40:50', ep:'stripe-events'},
    { code:200, method:'POST', path:'/webhooks/shopify',   ms:17,   ts:'09:40:48', ep:'shopify-orders'},
    { code:500, method:'POST', path:'/webhooks/sendgrid',  ms:987,  ts:'09:40:45', ep:'sendgrid-bounce'},
    { code:200, method:'POST', path:'/webhooks/github',    ms:34,   ts:'09:40:43', ep:'github-webhooks'},
  ];

  logs.forEach((log,i) => {
    const y = 116+i*58;
    const codeCol = log.code<400?TEAL:log.code===429?AMBER:RED;
    els.push(rect(16,y,W-32,50,SURF,{rx:8}));
    if(log.code>=500) els.push(rect(16,y,2,50,RED,{rx:1}));
    else if(log.code===429) els.push(rect(16,y,2,50,AMBER,{rx:1}));
    // Code badge
    els.push(rect(24,y+10,38,20,codeCol,{rx:5,opacity:0.12}));
    els.push(text(43,y+23,log.code.toString(),10,codeCol,{anchor:'middle',fw:700}));
    // Path
    els.push(text(70,y+20,log.path,11,TEXT,{fw:500}));
    els.push(text(70,y+34,log.ep,9,MUTED));
    // Right side
    els.push(text(W-24,y+20,log.ms+'ms',10,log.ms>500?AMBER:MUTED,{anchor:'end',fw:log.ms>500?600:400}));
    els.push(text(W-24,y+34,log.ts,9,DIM,{anchor:'end'}));
  });

  bottomNav('logs').forEach(e=>els.push(e));
  return { name:'Logs', svg:'', elements: els };
}

// ─── SCREEN 5: ALERTS ────────────────────────────────────────────────────────
function screenAlerts() {
  const els = [];
  els.push(rect(0,0,W,H,INK));
  statusBar().forEach(e=>els.push(e));

  els.push(text(24,72,'Alerts',18,TEXT,{fw:700}));
  els.push(rect(W-48,60,32,22,INDIGO,{rx:11}));
  els.push(text(W-32,74,'+ New',9,TEXT,{anchor:'middle',fw:500}));

  // Active incident banner
  els.push(rect(16,84,W-32,64,RED,{rx:12,opacity:0.1,stroke:RED,sw:1}));
  els.push(rect(16,84,3,64,RED,{rx:2}));
  els.push(circle(32,100,5,RED,{opacity:0.8}));
  els.push(text(44,104,'Active Incident',12,RED,{fw:700}));
  els.push(text(44,120,'sendgrid-bounce: error rate 32.8% — 8m ago',11,TEXT));
  els.push(text(44,134,'3 people notified · incident #247',10,MUTED));

  // Alert rules
  els.push(text(24,166,'Alert Rules',14,TEXT,{fw:700}));

  const rules = [
    { name:'Error rate spike',    cond:'> 5% over 2 min',  ch:'Slack, PagerDuty', active:true,  col:RED   },
    { name:'Success rate drop',   cond:'< 95% over 5 min', ch:'Slack',            active:true,  col:AMBER },
    { name:'Latency P95 high',    cond:'> 500ms 3 min avg', ch:'PagerDuty',        active:true,  col:AMBER },
    { name:'Zero events received',cond:'0 events > 10 min', ch:'Slack, Email',     active:true,  col:RED   },
    { name:'Endpoint paused',     cond:'On manual pause',   ch:'Email',            active:false, col:MUTED },
  ];

  rules.forEach((r,i) => {
    const y = 184+i*80;
    els.push(rect(16,y,W-32,72,SURF,{rx:10}));
    els.push(rect(16,y,3,72,r.active?r.col:MUTED,{rx:2}));
    // Toggle pill
    const tBg = r.active?INDIGO:'rgba(232,234,239,0.12)';
    els.push(rect(W-56,y+10,40,20,tBg,{rx:10}));
    const tDotX = r.active ? W-26 : W-44;
    els.push(circle(tDotX,y+20,7,TEXT,{opacity:r.active?1:0.4}));
    // Name
    els.push(text(30,y+20,r.name,13,TEXT,{fw:600}));
    els.push(text(30,y+36,r.cond,10,MUTED));
    els.push(text(30,y+52,'→ '+r.ch,10,INDIGO,{fw:500,opacity:0.8}));
    els.push(line(30,y+72,W-22,y+72,'rgba(232,234,239,0.05)'));
  });

  bottomNav('alerts').forEach(e=>els.push(e));
  return { name:'Alerts', svg:'', elements: els };
}

// ─── SCREEN 6: ENDPOINT DETAIL ───────────────────────────────────────────────
function screenEndpointDetail() {
  const els = [];
  els.push(rect(0,0,W,H,INK));
  statusBar().forEach(e=>els.push(e));

  els.push(text(24,72,'← Hooks',12,INDIGO,{fw:500}));
  els.push(text(24,92,'stripe-events',17,TEXT,{fw:700}));

  // Health summary
  els.push(rect(16,108,W-32,54,SURF,{rx:12}));
  const epStats = [
    {label:'Requests/hr', value:'1,240'},
    {label:'Success',     value:'99.8%'},
    {label:'P95 latency', value:'23ms' },
    {label:'Uptime',      value:'99.9%'},
  ];
  epStats.forEach((s,i) => {
    const x = 44+i*82;
    const col = i===1||i===3?TEAL:i===2?CYAN:TEXT;
    els.push(text(x,128,s.value,14,col,{fw:700,anchor:'middle'}));
    els.push(text(x,142,s.label,9,MUTED,{anchor:'middle'}));
    if(i<3) els.push(line(x+41,114,x+41,156,'rgba(232,234,239,0.07)'));
  });

  // Latency chart
  els.push(text(24,178,'Latency — Last 24 hours',13,TEXT,{fw:600}));
  els.push(rect(16,194,W-32,80,SURF,{rx:12}));
  // Y-axis labels
  ['100ms','50ms','0ms'].forEach((l,i) => {
    els.push(text(22,208+i*28,l,8,MUTED));
  });
  // Chart grid lines
  [0,28,56].forEach(dy => {
    els.push(line(52,208+dy,W-22,208+dy,'rgba(232,234,239,0.06)'));
  });
  // Latency bars — 24 samples, mostly ok, one spike
  const latencies = [12,18,14,22,19,16,20,24,17,21,13,15,19,23,18,21,72,85,44,18,21,19,23,16];
  const barW = (W-32-38)/24;
  latencies.forEach((v,i) => {
    const barH = (v/100)*56;
    const barCol = v>50?AMBER:TEAL;
    const bx = 52+i*(barW+1);
    els.push(rect(bx,264-barH,barW,barH,barCol,{rx:1,opacity:0.7}));
  });
  // X-axis labels
  ['0h','6h','12h','18h','24h'].forEach((l,i) => {
    els.push(text(52+i*(W-52-22)/4,284,l,8,MUTED,{anchor:'middle'}));
  });

  // Recent errors
  els.push(text(24,300,'Recent Errors (2)',13,TEXT,{fw:600}));
  const errs = [
    {code:500,path:'/webhooks/sendgrid',ms:1204,ts:'2s ago'},
    {code:503,path:'/webhooks/sendgrid',ms:2034,ts:'3m ago'},
  ];
  errs.forEach((e,i)=>{
    const y = 318+i*58;
    els.push(rect(16,y,W-32,50,SURF,{rx:8}));
    els.push(rect(16,y,3,50,RED,{rx:2}));
    els.push(rect(24,y+10,32,20,RED,{rx:5,opacity:0.12}));
    els.push(text(40,y+23,e.code.toString(),10,RED,{anchor:'middle',fw:700}));
    els.push(text(64,y+20,e.path,11,TEXT,{fw:500}));
    els.push(text(64,y+34,e.ms+'ms',10,AMBER,{fw:600}));
    els.push(text(W-24,y+20,e.ts,9,MUTED,{anchor:'end'}));
    els.push(text(W-24,y+34,'View →',9,INDIGO,{anchor:'end',fw:500}));
  });

  // Config section
  els.push(text(24,446,'Configuration',13,TEXT,{fw:600}));
  const configItems = [
    {key:'URL',          value:'https://wh.acme.co/stripe'},
    {key:'Secret',       value:'whsec_●●●●●●●●●●'},
    {key:'Timeout',      value:'30 seconds'},
    {key:'Retry policy', value:'3× exponential backoff'},
    {key:'Signing',      value:'HMAC-SHA256'},
  ];
  configItems.forEach((c,i) => {
    const y = 464+i*42;
    els.push(rect(16,y,W-32,34,SURF,{rx:8}));
    els.push(text(28,y+20,c.key,11,MUTED));
    els.push(text(W-24,y+20,c.value,11,TEXT,{anchor:'end',fw:500}));
    els.push(line(28,y+34,W-24,y+34,'rgba(232,234,239,0.05)'));
  });

  // Actions
  els.push(rect(16,676,W/2-22,38,CARD,{rx:10,stroke:'rgba(232,234,239,0.1)',sw:1}));
  els.push(text(W/4+5,699,'⏸ Pause',13,AMBER,{anchor:'middle',fw:500}));
  els.push(rect(W/2+6,676,W/2-22,38,INDIGO,{rx:10}));
  els.push(text(W*3/4+5,699,'↺ Replay All',13,TEXT,{anchor:'middle',fw:500}));

  bottomNav('endpoints').forEach(e=>els.push(e));
  return { name:'Endpoint', svg:'', elements: els };
}

// ─── ASSEMBLE ─────────────────────────────────────────────────────────────────
const screens = [
  screenDashboard(),
  screenEndpoints(),
  screenInspector(),
  screenLogs(),
  screenAlerts(),
  screenEndpointDetail(),
];

let total = 0;
screens.forEach(s => { total += s.elements.length; });

const pen = {
  version: '2.8',
  metadata: {
    name: 'HOOK',
    author: 'RAM',
    date: '2026-04-10',
    theme: 'dark',
    heartbeat: 47,
    elements: total,
  },
  screens,
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`HOOK: ${screens.length} screens, ${total} elements`);
console.log(`Written: ${SLUG}.pen`);
