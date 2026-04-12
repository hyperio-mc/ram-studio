'use strict';
/**
 * PULSAR — Real-time API Pulse Monitor
 * Heartbeat #49 | Dark theme
 *
 * Inspired by:
 * - Orbi (darkmodedesign.com): pure black base + multicolor aurora light-streak gradient
 * - Neon DB (darkmodedesign.com): terminal green scan-line aesthetic on black
 * - Bento-grid feature showcase pattern (land-book.com)
 *
 * Pure black #000000 luxury base with aurora violet/cyan/green palette.
 * 6 screens: Dashboard, Endpoint Detail, Alert Center, Log Stream, Integrations, Settings
 */

const fs   = require('fs');
const path = require('path');

const SLUG  = 'pulsar';
const NAME  = 'PULSAR';
const DATE  = new Date().toISOString().slice(0, 10);
const W = 390, H = 844;

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  black:    '#000000',
  surface:  '#0A0A0C',
  card:     '#0F0F14',
  cardHi:   '#141420',
  border:   '#1E1E2A',
  borderHi: '#2A2A3E',
  violet:   '#A855F7',
  violetDim:'#6D28D9',
  cyan:     '#22D3EE',
  cyanDim:  '#0891B2',
  green:    '#10F58C',
  greenDim: '#059669',
  coral:    '#FF4757',
  amber:    '#F59E0B',
  text:     '#E2E8F0',
  textMid:  '#94A3B8',
  textDim:  '#475569',
  white:    '#FFFFFF',
};

// ─── Primitives ──────────────────────────────────────────────────────────────
const els = [];
function rect(x,y,w,h,fill,opts={}) {
  const e = { type:'rect', x, y, width:w, height:h, fill };
  if (opts.rx !== undefined) e.rx = opts.rx;
  if (opts.opacity !== undefined) e.opacity = opts.opacity;
  if (opts.stroke) { e.stroke = opts.stroke; e.strokeWidth = opts.sw || 1; }
  els.push(e); return e;
}
function text(x,y,content,size,fill,opts={}) {
  const e = { type:'text', x, y, content, fontSize:size, fill };
  if (opts.fw) e.fontWeight = opts.fw;
  if (opts.font) e.fontFamily = opts.font;
  if (opts.anchor) e.textAnchor = opts.anchor;
  if (opts.ls) e.letterSpacing = opts.ls;
  if (opts.opacity !== undefined) e.opacity = opts.opacity;
  els.push(e); return e;
}
function circle(cx,cy,r,fill,opts={}) {
  const e = { type:'circle', cx, cy, r, fill };
  if (opts.opacity !== undefined) e.opacity = opts.opacity;
  if (opts.stroke) { e.stroke = opts.stroke; e.strokeWidth = opts.sw || 1; }
  els.push(e); return e;
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  const e = { type:'line', x1, y1, x2, y2, stroke };
  e.strokeWidth = opts.sw || 1;
  if (opts.opacity !== undefined) e.opacity = opts.opacity;
  els.push(e); return e;
}

// ─── Screens ─────────────────────────────────────────────────────────────────
const screens = [];
function newScreen(name) {
  const snap = els.length;
  return { name, snap };
}
function closeScreen(s) {
  const screen = { name: s.name, svg: `<svg width="${W}" height="${H}"/>`, elements: [] };
  const added = els.slice(s.snap);
  screen.elements = added;
  screens.push(screen);
}

// ─── Shared header ────────────────────────────────────────────────────────────
function header(title, sub, dot) {
  rect(0,0,W,H,C.black);
  // aurora glow strip at top
  rect(0,0,W,3,'#A855F7',{opacity:0.6});
  rect(0,0,W,1,'#22D3EE',{opacity:0.8});
  // status bar
  text(20,20,'9:41',12,C.textDim);
  text(W-20,20,'●●●',11,C.textDim,{anchor:'end'});
  // nav bar bg
  rect(0,36,W,48,C.surface);
  line(0,84,W,84,C.border);
  // app wordmark
  text(20,66,NAME,18,C.white,{fw:'700',ls:'-0.04em',font:'monospace'});
  // status dot
  circle(75+NAME.length*8,60,4,dot||C.green);
  // right icons
  rect(W-44,46,28,28,C.card,{rx:8});
  text(W-30,64,'⚡',14,C.violet,{anchor:'middle'});
  // screen title
  text(20,106,title,20,C.white,{fw:'600',ls:'-0.02em'});
  if (sub) text(20,126,sub,12,C.textDim);
}

// ────────────────────────────────────────────────────────────────────────────
// SCREEN 1 — Dashboard
// ────────────────────────────────────────────────────────────────────────────
{
const s = newScreen('Dashboard');

header('API Health', 'Live monitor · 24 services', C.green);

// Aurora gradient strip — multicolor band (Orbi-inspired)
rect(0,138,W,56,C.surface,{opacity:0.0});
// gradient bars simulated as stacked rects
rect(0,138,80,56,'#A855F7',{opacity:0.12});
rect(80,138,80,56,'#22D3EE',{opacity:0.10});
rect(160,138,70,56,'#F59E0B',{opacity:0.08});
rect(230,138,80,56,'#10F58C',{opacity:0.10});
rect(310,138,80,56,'#FF4757',{opacity:0.08});
// summary stats row
const stats = [
  {label:'UPTIME',  val:'99.8%', col:C.green},
  {label:'P95',     val:'142ms', col:C.cyan},
  {label:'ERRORS',  val:'0.2%',  col:C.coral},
  {label:'RPM',     val:'58.4K', col:C.violet},
];
stats.forEach((st,i) => {
  const x = 8 + i*96;
  rect(x,142,88,44,C.card,{rx:8,stroke:C.border,sw:1});
  text(x+44,158,st.val,15,st.col,{fw:'700',anchor:'middle',font:'monospace'});
  text(x+44,170,st.label,8,C.textDim,{anchor:'middle',ls:'0.08em'});
});

// section label
text(20,200,'ENDPOINTS',10,C.textDim,{ls:'0.12em'});
line(20,206,W-20,206,C.border,{opacity:0.5});

// Bento-style endpoint grid — 3x4 health tiles
const endpoints = [
  {name:'/api/v2/users',    ms:  45, ok:true},
  {name:'/api/v2/events',   ms: 189, ok:true},
  {name:'/api/v2/metrics',  ms:  67, ok:true},
  {name:'/api/v2/auth',     ms: 301, ok:false},
  {name:'/api/v2/payments', ms:  92, ok:true},
  {name:'/api/v2/webhooks', ms: 440, ok:false},
  {name:'/api/v2/search',   ms: 128, ok:true},
  {name:'/api/v2/upload',   ms:  55, ok:true},
  {name:'/api/v2/notify',   ms: 213, ok:true},
];
endpoints.forEach((ep,i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  const x = 12 + col * 124;
  const y = 214 + row * 74;
  const isWarn = ep.ms > 250;
  const statusCol = !ep.ok ? C.coral : isWarn ? C.amber : C.green;
  rect(x,y,116,66,C.card,{rx:10,stroke:ep.ok ? C.border : '#FF475730',sw:1});
  // status dot
  circle(x+12,y+14,4,statusCol);
  // tiny bar graph
  [0.8,0.6,0.9,0.4,1.0,0.7].forEach((h,j) => {
    const bx = x+70+j*7;
    const bh = h * 22;
    rect(bx,y+32-bh,5,bh,statusCol,{opacity:0.4+(j===5?0.4:0),rx:1});
  });
  text(x+22,y+16,ep.name.replace('/api/v2',''),9,C.text,{fw:'500'});
  text(x+8,y+30,ep.ms+'ms',11,statusCol,{fw:'600',font:'monospace'});
  const methodLabel = ep.ok ? 'GET 200' : 'GET 504';
  text(x+8,y+44,methodLabel,8,ep.ok ? C.textDim : C.coral);
  text(x+8,y+56,'avg 30m',8,C.textDim);
});

// live feed ticker at bottom
rect(0,454,W,36,C.surface);
line(0,454,W,454,C.border);
text(20,476,'● LIVE',9,C.green,{ls:'0.08em',font:'monospace'});
text(56,476,'GET /api/v2/payments → 201  92ms  just now',9,C.textMid,{font:'monospace'});

// bottom mini chart — latency sparkline
rect(0,490,W,130,C.surface);
line(0,490,W,490,C.border);
text(20,508,'LATENCY TREND',9,C.textDim,{ls:'0.10em'});
text(W-20,508,'Last 60min',9,C.textDim,{anchor:'end'});
const sparkPoints = [55,42,61,48,53,70,88,65,44,52,59,63,72,80,67,55,48,60,142,89,67,45,52,61,48,55,70,88,65,49];
sparkPoints.forEach((v,i) => {
  const x = 20 + i * 11.5;
  const bh = (v / 150) * 72;
  const col = v > 100 ? C.amber : C.cyan;
  rect(x,590-bh,8,bh,col,{rx:2,opacity:0.6+(v>100?0.3:0)});
});
text(20,600,'0',9,C.textDim);
text(20,528,'150ms',9,C.textDim);

// nav bar
rect(0,H-60,W,60,C.surface);
line(0,H-60,W,H-60,C.border);
const navItems = [{icon:'⬡',label:'Monitor',active:true},{icon:'◎',label:'Alerts'},{icon:'≡',label:'Logs'},{icon:'⊕',label:'Connect'},{icon:'◦',label:'Settings'}];
navItems.forEach((n,i) => {
  const nx = 39+i*78;
  const col = n.active ? C.violet : C.textDim;
  text(nx,H-34,n.icon,16,col,{anchor:'middle'});
  text(nx,H-18,n.label,8,col,{anchor:'middle'});
  if (n.active) rect(nx-16,H-60,32,2,C.violet,{rx:1});
});

closeScreen(s);
}

// ────────────────────────────────────────────────────────────────────────────
// SCREEN 2 — Endpoint Detail
// ────────────────────────────────────────────────────────────────────────────
{
const s = newScreen('Endpoint Detail');

header('Endpoint Detail', '/api/v2/auth  ·  GET', C.coral);

// back nav
rect(20,140,70,26,C.card,{rx:13,stroke:C.border,sw:1});
text(55,157,'← Back',10,C.textMid,{anchor:'middle'});

// status badge
rect(W-80,140,64,26,C.coral+'20',{rx:13,stroke:C.coral+'60',sw:1});
text(W-48,157,'● DOWN',9,C.coral,{anchor:'middle',ls:'0.06em'});

// key metrics row
const detailStats = [
  {label:'P50 LATENCY', val:'289ms', col:C.amber},
  {label:'ERROR RATE',  val:'4.7%',  col:C.coral},
  {label:'UPTIME',      val:'94.2%', col:C.amber},
];
detailStats.forEach((ds,i) => {
  rect(12+i*124,178,116,56,C.card,{rx:10,stroke:C.border,sw:1});
  text(70+i*124,202,ds.val,16,ds.col,{fw:'700',anchor:'middle',font:'monospace'});
  text(70+i*124,216,ds.label,8,C.textDim,{anchor:'middle',ls:'0.06em'});
});

// latency histogram
text(20,248,'RESPONSE TIME — 24 hours',9,C.textDim,{ls:'0.08em'});
line(20,254,W-20,254,C.border,{opacity:0.5});
const histBars = [180,245,310,280,320,450,520,400,350,290,330,380,420,390,340,300,280,310,350,390,430,480,520,440];
histBars.forEach((v,i) => {
  const x = 24 + i * 14.5;
  const bh = (v / 600) * 80;
  const col = v > 400 ? C.coral : v > 300 ? C.amber : C.cyan;
  rect(x,346-bh,10,bh,col,{rx:2,opacity:0.7});
});
text(24,350,'00:00',8,C.textDim);
text(W-24,350,'23:59',8,C.textDim,{anchor:'end'});

// error log
text(20,370,'RECENT ERRORS',9,C.textDim,{ls:'0.08em'});
line(20,376,W-20,376,C.border,{opacity:0.5});
const errors = [
  {code:'504',msg:'Gateway timeout · upstream >500ms', time:'2m ago'},
  {code:'503',msg:'Service unavailable · pod restart',  time:'8m ago'},
  {code:'504',msg:'Gateway timeout · upstream >500ms', time:'14m ago'},
  {code:'401',msg:'Auth token expired · client error',  time:'31m ago'},
];
errors.forEach((er,i) => {
  const ey = 384 + i * 56;
  rect(12,ey,W-24,48,C.card,{rx:8,stroke:i===0 ? C.coral+'40' : C.border,sw:1});
  rect(12,ey,3,48,i===0 ? C.coral : C.amber,{rx:0});
  rect(20,ey+10,32,18,C.coral+'25',{rx:4});
  text(36,ey+23,er.code,10,C.coral,{fw:'700',anchor:'middle',font:'monospace'});
  text(60,ey+22,er.msg,10,C.text);
  text(60,ey+36,er.time,9,C.textDim);
});

// action buttons
rect(12,608,W/2-18,44,C.violet+'20',{rx:12,stroke:C.violet+'60',sw:1});
text(W/4,634,'⚡ Trigger Alert',13,C.violet,{anchor:'middle',fw:'500'});
rect(W/2+6,608,W/2-18,44,C.card,{rx:12,stroke:C.border,sw:1});
text(W*3/4,634,'≡ View Logs',13,C.textMid,{anchor:'middle',fw:'500'});

// nav bar
rect(0,H-60,W,60,C.surface);
line(0,H-60,W,H-60,C.border);
const nav2 = [{icon:'⬡',label:'Monitor'},{icon:'◎',label:'Alerts'},{icon:'≡',label:'Logs'},{icon:'⊕',label:'Connect'},{icon:'◦',label:'Settings'}];
nav2.forEach((n,i) => {
  const nx = 39+i*78;
  text(nx,H-34,n.icon,16,C.textDim,{anchor:'middle'});
  text(nx,H-18,n.label,8,C.textDim,{anchor:'middle'});
});

closeScreen(s);
}

// ────────────────────────────────────────────────────────────────────────────
// SCREEN 3 — Alert Center
// ────────────────────────────────────────────────────────────────────────────
{
const s = newScreen('Alert Center');

header('Alert Center', '3 active · 1 critical', C.coral);

// Filter pills
const filters = ['All','Critical','Warning','Resolved'];
filters.forEach((f,i) => {
  const fw = 60 + (f === 'All' ? 0 : 10);
  const fx = 20 + i * 82;
  const isActive = f === 'Critical';
  rect(fx,140,74,28,isActive ? C.coral+'25' : C.card,{rx:14,stroke:isActive ? C.coral+'60' : C.border,sw:1});
  text(fx+37,158,f,10,isActive ? C.coral : C.textMid,{anchor:'middle',fw:isActive?'600':'400'});
});

// Severity summary row
rect(12,178,W-24,52,C.card,{rx:10,stroke:C.border,sw:1});
const sevs = [{label:'Critical',val:'1',col:C.coral},{label:'Warning',val:'2',col:C.amber},{label:'Healthy',val:'21',col:C.green}];
sevs.forEach((sv,i) => {
  const sx = W/2 - 1;
  if (i>0) line(sx*(i===1?0.35:0.65),186,sx*(i===1?0.35:0.65),222,C.border);
  const tx = 66 + i*118;
  text(tx,202,sv.val,20,sv.col,{fw:'700',anchor:'middle',font:'monospace'});
  text(tx,218,sv.label,9,C.textDim,{anchor:'middle',ls:'0.06em'});
});

// Alert cards
const alerts = [
  {sev:'CRITICAL',  endpoint:'/api/v2/auth',     msg:'Gateway timeouts exceeding SLA threshold (4.7% err rate)', since:'12m',  col:C.coral,  ack:false},
  {sev:'WARNING',   endpoint:'/api/v2/webhooks',  msg:'P95 latency spiked to 440ms (threshold: 300ms)',            since:'34m',  col:C.amber,  ack:false},
  {sev:'WARNING',   endpoint:'/api/v2/events',    msg:'Request volume 2.4× above baseline, auto-scaling pending',  since:'1h 2m',col:C.amber,  ack:true},
];
alerts.forEach((al,i) => {
  const ay = 242 + i * 126;
  rect(12,ay,W-24,118,C.card,{rx:12,stroke:al.col+'30',sw:1});
  rect(12,ay,3,118,al.col,{rx:0});
  // header row
  rect(20,ay+10,52,18,al.col+'25',{rx:4});
  text(46,ay+23,al.sev,8,al.col,{anchor:'middle',fw:'700',ls:'0.06em'});
  text(80,ay+23,al.endpoint,10,C.text,{fw:'500',font:'monospace'});
  if (al.ack) {
    rect(W-70,ay+12,54,16,C.green+'20',{rx:8,stroke:C.green+'40',sw:1});
    text(W-43,ay+23,'✓ ACK',8,C.green,{anchor:'middle'});
  }
  // message
  text(20,ay+42,al.msg,10,C.textMid);
  text(20,ay+58,al.msg.length>40 ? '' : '',9,C.textDim);
  // since
  text(20,ay+76,'Since: '+al.since+' ago',9,C.textDim);
  // spark line
  [0.5,0.7,0.9,0.6,1,0.8,0.95,0.7,0.5,0.6].forEach((v,j) => {
    rect(W-104+j*8,ay+68,5,(v*28),al.col,{rx:1,opacity:0.5});
  });
  // action row
  rect(20,ay+90,70,20,al.ack ? C.card : al.col+'20',{rx:10,stroke:al.ack ? C.border : al.col+'50',sw:1});
  text(55,ay+104,al.ack ? 'Unack' : '⚡ Ack',9,al.ack ? C.textDim : al.col,{anchor:'middle'});
  rect(100,ay+90,80,20,C.card,{rx:10,stroke:C.border,sw:1});
  text(140,ay+104,'→ Detail',9,C.textMid,{anchor:'middle'});
  rect(192,ay+90,70,20,C.card,{rx:10,stroke:C.border,sw:1});
  text(227,ay+104,'⊘ Silence',9,C.textMid,{anchor:'middle'});
});

// nav bar
rect(0,H-60,W,60,C.surface);
line(0,H-60,W,H-60,C.border);
const nav3 = [{icon:'⬡',label:'Monitor'},{icon:'◎',label:'Alerts',active:true},{icon:'≡',label:'Logs'},{icon:'⊕',label:'Connect'},{icon:'◦',label:'Settings'}];
nav3.forEach((n,i) => {
  const nx = 39+i*78;
  const col = n.active ? C.violet : C.textDim;
  text(nx,H-34,n.icon,16,col,{anchor:'middle'});
  text(nx,H-18,n.label,8,col,{anchor:'middle'});
  if (n.active) rect(nx-16,H-60,32,2,C.violet,{rx:1});
  if (n.label==='Alerts') {
    circle(nx+12,H-38,6,C.coral);
    text(nx+12,H-34,'3',7,C.white,{anchor:'middle',fw:'700'});
  }
});

closeScreen(s);
}

// ────────────────────────────────────────────────────────────────────────────
// SCREEN 4 — Log Stream (Terminal aesthetic)
// ────────────────────────────────────────────────────────────────────────────
{
const s = newScreen('Log Stream');

rect(0,0,W,H,C.black);
rect(0,0,W,3,'#10F58C',{opacity:0.7});

// status bar
text(20,20,'9:41',12,C.textDim);
text(W-20,20,'●●●',11,C.textDim,{anchor:'end'});

// nav bar
rect(0,36,W,48,C.surface);
line(0,84,W,84,C.border);
text(20,66,NAME,18,C.white,{fw:'700',ls:'-0.04em',font:'monospace'});
circle(94,60,4,C.green);
rect(W-44,46,28,28,C.card,{rx:8});
text(W-30,64,'⚡',14,C.violet,{anchor:'middle'});

text(20,106,'Log Stream',20,C.white,{fw:'600',ls:'-0.02em'});
text(20,126,'Live tail · /api/v2/*',12,C.textDim);

// Filter bar
rect(12,140,W-24,32,C.card,{rx:8,stroke:C.border,sw:1});
text(24,160,'Filter logs...',12,C.textDim);
rect(W-60,146,48,20,C.green+'20',{rx:6,stroke:C.green+'50',sw:1});
text(W-36,160,'● LIVE',8,C.green,{anchor:'middle',font:'monospace'});

// Log level pills
const levels = ['ALL','ERROR','WARN','INFO','DEBUG'];
levels.forEach((lv,i) => {
  const lx = 12 + i*72;
  const isActive = lv === 'ALL';
  const lcol = lv==='ERROR' ? C.coral : lv==='WARN' ? C.amber : lv==='INFO' ? C.cyan : lv==='DEBUG' ? C.textDim : C.green;
  rect(lx,180,64,22,isActive ? C.green+'20' : C.card,{rx:11,stroke:isActive ? C.green+'50' : C.border,sw:1});
  text(lx+32,195,lv,8,isActive ? C.green : lcol,{anchor:'middle',ls:'0.06em'});
});

// Terminal-style log entries
line(0,210,W,210,C.border);
const logs = [
  {ts:'09:41:08',lvl:'INFO', col:C.cyan,   path:'/api/v2/payments', msg:'POST 201  92ms  user_id=u_882'},
  {ts:'09:41:07',lvl:'INFO', col:C.cyan,   path:'/api/v2/users',    msg:'GET  200  45ms  page=2 limit=20'},
  {ts:'09:41:06',lvl:'WARN', col:C.amber,  path:'/api/v2/webhooks', msg:'GET  200  440ms  latency spike'},
  {ts:'09:41:05',lvl:'ERROR',col:C.coral,  path:'/api/v2/auth',     msg:'GET  504  timeout  upstream=dead'},
  {ts:'09:41:04',lvl:'INFO', col:C.cyan,   path:'/api/v2/metrics',  msg:'GET  200  67ms  rows=1400'},
  {ts:'09:41:03',lvl:'ERROR',col:C.coral,  path:'/api/v2/auth',     msg:'GET  504  timeout  retry=2/3'},
  {ts:'09:41:02',lvl:'INFO', col:C.cyan,   path:'/api/v2/search',   msg:'GET  200  128ms  hits=87'},
  {ts:'09:41:01',lvl:'WARN', col:C.amber,  path:'/api/v2/events',   msg:'POST 200  189ms  queue_depth=340'},
  {ts:'09:41:00',lvl:'DEBUG',col:C.textDim,path:'/api/v2/notify',   msg:'POST 200  213ms  recipients=4'},
  {ts:'09:40:59',lvl:'INFO', col:C.cyan,   path:'/api/v2/upload',   msg:'PUT  201  55ms  size=2.4MB'},
];
logs.forEach((lg,i) => {
  const ly = 214 + i * 52;
  const isErr = lg.lvl === 'ERROR';
  if (isErr) rect(0,ly,W,50,C.coral,{opacity:0.04});
  rect(0,ly,3,50,lg.col);
  // terminal font mono style
  text(10,ly+16,lg.ts,8,C.textDim,{font:'monospace'});
  rect(68,ly+6,34,14,lg.col+'25',{rx:3});
  text(85,ly+17,lg.lvl,8,lg.col,{anchor:'middle',fw:'600',font:'monospace'});
  text(108,ly+16,lg.path,8,C.violet,{font:'monospace'});
  text(10,ly+32,lg.msg,9,isErr ? C.coral+'CC' : C.textMid,{font:'monospace'});
  line(0,ly+50,W,ly+50,C.border,{opacity:0.4});
});

// Bottom pause button
rect(0,H-60,W,60,C.surface);
line(0,H-60,W,H-60,C.border);
rect(W/2-50,H-50,100,34,C.green+'20',{rx:17,stroke:C.green+'50',sw:1});
text(W/2,H-28,'⏸ Pause',12,C.green,{anchor:'middle',fw:'500'});

closeScreen(s);
}

// ────────────────────────────────────────────────────────────────────────────
// SCREEN 5 — Integrations
// ────────────────────────────────────────────────────────────────────────────
{
const s = newScreen('Integrations');

header('Integrations', '9 connected · 2 available', C.cyan);

// Search
rect(12,140,W-24,36,C.card,{rx:10,stroke:C.border,sw:1});
text(32,162,'⌕  Search integrations...',12,C.textDim);

// Connected section
text(20,192,'CONNECTED',9,C.textDim,{ls:'0.10em'});
line(20,198,W-20,198,C.border,{opacity:0.5});

const integrations = [
  {name:'PagerDuty',   cat:'Alerting',   icon:'🔔',col:C.coral,  connected:true,  active:true},
  {name:'Slack',       cat:'Notify',     icon:'💬',col:C.violet, connected:true,  active:true},
  {name:'DataDog',     cat:'Metrics',    icon:'◈', col:C.amber,  connected:true,  active:true},
  {name:'GitHub',      cat:'Deploys',    icon:'⎇', col:C.text,   connected:true,  active:true},
  {name:'AWS SNS',     cat:'Events',     icon:'▲', col:C.amber,  connected:true,  active:false},
  {name:'Grafana',     cat:'Viz',        icon:'▦', col:C.cyan,   connected:true,  active:true},
  {name:'Sentry',      cat:'Errors',     icon:'◉', col:C.coral,  connected:true,  active:true},
  {name:'Twilio',      cat:'SMS',        icon:'✉', col:C.green,  connected:true,  active:true},
  {name:'Webhook',     cat:'Custom',     icon:'⇢', col:C.violet, connected:true,  active:true},
  {name:'OpsGenie',   cat:'Alerting',   icon:'⚡',col:C.amber,  connected:false, active:false},
  {name:'Prometheus', cat:'Metrics',    icon:'◷', col:C.cyan,   connected:false, active:false},
];
let yOff = 206;
let inAvail = false;
integrations.forEach((intg,i) => {
  if (!intg.connected && !inAvail) {
    inAvail = true;
    yOff += 8;
    text(20,yOff,'AVAILABLE',9,C.textDim,{ls:'0.10em'});
    line(20,yOff+6,W-20,yOff+6,C.border,{opacity:0.5});
    yOff += 16;
  }
  const iy = yOff;
  rect(12,iy,W-24,52,C.card,{rx:10,stroke:intg.active ? intg.col+'30' : C.border,sw:1});
  // icon circle
  circle(42,iy+26,16,intg.col+'20');
  text(42,iy+30,intg.icon,14,intg.col,{anchor:'middle'});
  // name + cat
  text(66,iy+22,intg.name,13,C.text,{fw:'500'});
  text(66,iy+38,intg.cat,10,C.textDim);
  // status
  if (intg.connected) {
    const statusCol = intg.active ? C.green : C.amber;
    const statusLabel = intg.active ? '● Active' : '○ Paused';
    rect(W-80,iy+14,64,24,statusCol+'20',{rx:12,stroke:statusCol+'50',sw:1});
    text(W-48,iy+30,statusLabel,9,statusCol,{anchor:'middle'});
  } else {
    rect(W-80,iy+14,64,24,C.violet+'20',{rx:12,stroke:C.violet+'50',sw:1});
    text(W-48,iy+30,'+ Connect',9,C.violet,{anchor:'middle'});
  }
  yOff += 60;
});

// nav bar
rect(0,H-60,W,60,C.surface);
line(0,H-60,W,H-60,C.border);
const nav5 = [{icon:'⬡',label:'Monitor'},{icon:'◎',label:'Alerts'},{icon:'≡',label:'Logs'},{icon:'⊕',label:'Connect',active:true},{icon:'◦',label:'Settings'}];
nav5.forEach((n,i) => {
  const nx = 39+i*78;
  const col = n.active ? C.violet : C.textDim;
  text(nx,H-34,n.icon,16,col,{anchor:'middle'});
  text(nx,H-18,n.label,8,col,{anchor:'middle'});
  if (n.active) rect(nx-16,H-60,32,2,C.violet,{rx:1});
});

closeScreen(s);
}

// ────────────────────────────────────────────────────────────────────────────
// SCREEN 6 — Settings / Team
// ────────────────────────────────────────────────────────────────────────────
{
const s = newScreen('Settings');

header('Settings', 'Team & thresholds', C.violet);

// Profile section
rect(12,140,W-24,72,C.card,{rx:12,stroke:C.border,sw:1});
circle(46,176,24,C.violet+'30');
text(46,180,'JL',12,C.violet,{anchor:'middle',fw:'700'});
text(82,168,'Jordan Lee',14,C.text,{fw:'500'});
text(82,184,'Admin · Acme Corp',10,C.textDim);
rect(W-68,152,52,20,C.card,{rx:10,stroke:C.border,sw:1});
text(W-42,165,'Edit',10,C.textMid,{anchor:'middle'});

// Section: Alert thresholds
text(20,228,'ALERT THRESHOLDS',9,C.textDim,{ls:'0.10em'});
line(20,234,W-20,234,C.border,{opacity:0.5});
const thresholds = [
  {label:'Error rate',         val:'> 2%',   current:'0.2%', col:C.coral},
  {label:'P95 Latency',        val:'> 300ms', current:'142ms',col:C.amber},
  {label:'Downtime window',    val:'> 30s',   current:'OK',   col:C.green},
  {label:'Request spike',      val:'> 3× avg',current:'1.1×', col:C.cyan},
];
thresholds.forEach((th,i) => {
  const ty = 242 + i * 56;
  rect(12,ty,W-24,48,C.card,{rx:8,stroke:C.border,sw:1});
  text(20,ty+18,th.label,12,C.text);
  text(20,ty+34,th.current,9,th.col,{font:'monospace'});
  rect(W-96,ty+12,80,24,C.cardHi,{rx:8,stroke:C.border,sw:1});
  text(W-56,ty+28,th.val,10,C.textMid,{anchor:'middle',font:'monospace'});
  rect(W-22,ty+18,12,12,C.textDim,{rx:2,opacity:0.4});
  text(W-16,ty+28,'⋯',10,C.textDim,{anchor:'middle'});
});

// Section: Team members
text(20,474,'TEAM',9,C.textDim,{ls:'0.10em'});
line(20,480,W-20,480,C.border,{opacity:0.5});
const team = [
  {name:'Jordan Lee',   role:'Admin',  avatar:'JL',col:C.violet},
  {name:'Sam Rivera',   role:'Editor', avatar:'SR',col:C.cyan},
  {name:'Alex Chen',    role:'Viewer', avatar:'AC',col:C.green},
];
team.forEach((tm,i) => {
  const tmy = 488 + i * 56;
  rect(12,tmy,W-24,48,C.card,{rx:8,stroke:C.border,sw:1});
  circle(38,tmy+24,16,tm.col+'30');
  text(38,tmy+28,tm.avatar,9,tm.col,{anchor:'middle',fw:'700'});
  text(62,tmy+20,tm.name,13,C.text,{fw:'500'});
  text(62,tmy+36,tm.role,10,C.textDim);
  const rCol = tm.role==='Admin' ? C.violet : tm.role==='Editor' ? C.cyan : C.textDim;
  rect(W-80,tmy+14,64,20,rCol+'20',{rx:10,stroke:rCol+'40',sw:1});
  text(W-48,tmy+28,tm.role,9,rCol,{anchor:'middle'});
});

// Invite button
rect(12,656,W-24,44,C.violet+'20',{rx:12,stroke:C.violet+'60',sw:1});
text(W/2,682,'+ Invite teammate',13,C.violet,{anchor:'middle',fw:'500'});

// Danger zone
rect(12,710,W-24,40,C.coral+'10',{rx:8,stroke:C.coral+'30',sw:1});
text(W/2,734,'⊘ Delete workspace',12,C.coral,{anchor:'middle',opacity:0.7});

// nav bar
rect(0,H-60,W,60,C.surface);
line(0,H-60,W,H-60,C.border);
const nav6 = [{icon:'⬡',label:'Monitor'},{icon:'◎',label:'Alerts'},{icon:'≡',label:'Logs'},{icon:'⊕',label:'Connect'},{icon:'◦',label:'Settings',active:true}];
nav6.forEach((n,i) => {
  const nx = 39+i*78;
  const col = n.active ? C.violet : C.textDim;
  text(nx,H-34,n.icon,16,col,{anchor:'middle'});
  text(nx,H-18,n.label,8,col,{anchor:'middle'});
  if (n.active) rect(nx-16,H-60,32,2,C.violet,{rx:1});
});

closeScreen(s);
}

// ─── Write .pen file ─────────────────────────────────────────────────────────
const totalEls = screens.reduce((a,s) => a + s.elements.length, 0);
const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    author: 'RAM',
    date: DATE,
    theme: 'dark',
    heartbeat: 49,
    elements: totalEls,
    slug: SLUG,
    tagline: 'Real-time API pulse monitor',
    archetype: 'developer-tools',
    inspired_by: 'Orbi (darkmodedesign.com) aurora streaks + Neon terminal green + land-book bento grid',
  },
  screens: screens.map(s => ({
    name: s.name,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"/>`,
    elements: s.elements,
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalEls} elements`);
console.log(`Written: ${SLUG}.pen`);
