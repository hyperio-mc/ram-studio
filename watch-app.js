/**
 * WATCH — Infrastructure uptime & incident monitoring
 * Inspired by:
 *   - "Interfere › Build software that never breaks" (land-book.com)
 *     → dev-tool dark monitoring aesthetic, technical, no-nonsense
 *   - "Neon" category on darkmodedesign.com
 *     → neon cyan/green accent on near-pure black, selective glow
 *   - Linear: Change (godly.website)
 *     → deep charcoal palette (#0A0B0D), single vivid accent, tight monospace data
 * Theme: DARK — near-pure black #070709, neon mint #00FFB0, indigo secondary
 */

const fs   = require('fs');
const path = require('path');

const P = {
  bg:           '#070709',
  bgDeep:       '#040406',
  surface:      '#0D0E12',
  surfaceUp:    '#12141A',
  surfaceHigh:  '#181B23',
  border:       'rgba(255,255,255,0.06)',
  borderUp:     'rgba(255,255,255,0.11)',
  borderAccent: 'rgba(0,255,176,0.28)',
  text:         '#E8E9F3',
  textMid:      '#888CA8',
  textFaint:    'rgba(232,233,243,0.30)',
  accent:       '#00FFB0',
  accentSoft:   'rgba(0,255,176,0.10)',
  accentMid:    'rgba(0,255,176,0.20)',
  accent2:      '#6366F1',
  accent2Soft:  'rgba(99,102,241,0.12)',
  amber:        '#F59E0B',
  amberSoft:    'rgba(245,158,11,0.12)',
  red:          '#F43F5E',
  redSoft:      'rgba(244,63,94,0.12)',
  mono:         '#4A4E6A',
};

const LP = {
  bg:           '#F2F4FF',
  bgDeep:       '#E8EAF8',
  surface:      '#FFFFFF',
  surfaceUp:    '#F7F8FF',
  surfaceHigh:  '#EDEFFE',
  border:       'rgba(99,102,241,0.10)',
  borderUp:     'rgba(99,102,241,0.18)',
  borderAccent: 'rgba(99,102,241,0.35)',
  text:         '#0D0F1A',
  textMid:      '#5B5F80',
  textFaint:    'rgba(13,15,26,0.35)',
  accent:       '#059669',
  accentSoft:   'rgba(5,150,105,0.10)',
  accentMid:    'rgba(5,150,105,0.20)',
  accent2:      '#6366F1',
  accent2Soft:  'rgba(99,102,241,0.12)',
  amber:        '#D97706',
  amberSoft:    'rgba(217,119,6,0.12)',
  red:          '#E11D48',
  redSoft:      'rgba(225,29,72,0.12)',
  mono:         '#9CA3AF',
};

const uuid = () => {
  const hex = Array.from({length:32},()=>Math.floor(Math.random()*16).toString(16)).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-${['8','9','a','b'][Math.floor(Math.random()*4)]}${hex.slice(17,20)}-${hex.slice(20,32)}`;
};
const px = v => ({ value: v, unit: 'px' });
function hex2rgb(h) {
  const n = h.replace('#','');
  return { r:parseInt(n.slice(0,2),16), g:parseInt(n.slice(2,4),16), b:parseInt(n.slice(4,6),16) };
}
function col(h, a=1) {
  if (h.startsWith('rgba')) { const m=h.match(/[\d.]+/g)||[]; return {r:+m[0],g:+m[1],b:+m[2],a:+m[3]||a}; }
  if (h.startsWith('rgb')) { const m=h.match(/[\d.]+/g)||[]; return {r:+m[0],g:+m[1],b:+m[2],a}; }
  const {r,g,b}=hex2rgb(h); return {r,g,b,a};
}

function rect({id,name='rect',x=0,y=0,w=390,h=60,fill='#000',fillA=1,stroke,strokeA=1,strokeW=1,radius=0,opacity=1}) {
  return {
    id:id||uuid(), name, type:'RECTANGLE',
    x:px(x), y:px(y), width:px(w), height:px(h),
    opacity, cornerRadius:radius, clipsContent:false,
    fills:[{type:'SOLID',color:col(fill,fillA),visible:true}],
    strokes: stroke?[{type:'SOLID',color:col(stroke,strokeA),lineWidth:strokeW}]:[],
  };
}

function txt({id,name,x=0,y=0,w=300,h=20,content='',size=13,weight='400',color=P.text,colorA=1,align='left',mono=false,italic=false,lineH=1.4,tracking=0,opacity=1}) {
  const family = mono?'"IBM Plex Mono","Courier New",monospace':'"Inter","Helvetica Neue",system-ui,sans-serif';
  return {
    id:id||uuid(), name:name||content.slice(0,20)||'text', type:'TEXT',
    x:px(x), y:px(y), width:px(w), height:px(h),
    opacity,
    style:{ fontFamily:family, fontSize:px(size), fontWeight:weight, fontStyle:italic?'italic':'normal',
            color:col(color,colorA), textAlign:align, lineHeight:lineH, letterSpacing:tracking },
    content,
  };
}

const W = 390;

const SERVICES = [
  { name:'API Gateway',      status:'ok',      uptime:'99.98', rt:'42ms',  region:'us-east-1' },
  { name:'Auth Service',     status:'ok',      uptime:'100.0', rt:'18ms',  region:'global'    },
  { name:'Database Cluster', status:'degraded',uptime:'99.12', rt:'187ms', region:'us-west-2' },
  { name:'CDN Edge',         status:'ok',      uptime:'99.99', rt:'8ms',   region:'global'    },
  { name:'Webhooks',         status:'ok',      uptime:'99.87', rt:'67ms',  region:'eu-west-1' },
  { name:'Queue Worker',     status:'outage',  uptime:'97.43', rt:'—',     region:'us-east-1' },
];

const SC = { ok:P.accent, degraded:P.amber, outage:P.red };
const SL = { ok:'Operational', degraded:'Degraded', outage:'Outage' };

const NAV = [
  {icon:'◉',label:'Dashboard',active:false},
  {icon:'≡', label:'Services', active:false},
  {icon:'⚡',label:'Incidents',active:false},
  {icon:'🔔',label:'Alerts',   active:false},
  {icon:'⟳', label:'On-Call',  active:false},
];
function bottomNav(nodes, activeIndex) {
  nodes.push(rect({x:0,y:738,w:W,h:74,fill:P.surface,stroke:P.border,strokeA:1}));
  NAV.forEach((n,i) => {
    const act = i===activeIndex;
    nodes.push(txt({x:i*(W/5),y:750,w:W/5,h:16,content:n.icon,size:16,color:act?P.accent:P.textMid,align:'center'}));
    nodes.push(txt({x:i*(W/5),y:770,w:W/5,h:11,content:n.label,size:9,weight:act?'600':'400',color:act?P.accent:P.textFaint,align:'center'}));
  });
}

// ── SCREEN 1: DASHBOARD ───────────────────────────────────────────────────────
function buildDashboard() {
  const n = [];
  n.push(rect({name:'bg',x:0,y:0,w:W,h:812,fill:P.bg}));

  // Top bar
  n.push(txt({x:20,y:52,w:160,h:14,content:'WATCH',size:13,weight:'700',color:P.text,mono:true,tracking:0.08}));
  n.push(txt({x:W-90,y:52,w:78,h:14,content:'All Systems',size:9,weight:'500',color:P.accent,mono:true,align:'right'}));
  n.push(rect({x:W-20,y:55,w:8,h:8,fill:P.accent,radius:4}));

  // Last check timestamp
  n.push(txt({x:20,y:70,w:200,h:12,content:'checked 12s ago · 16 services',size:9,weight:'400',color:P.textFaint,mono:true}));

  // Score donut area (simplified as text + ring)
  n.push(rect({x:W/2-52,y:94,w:104,h:104,fill:P.surface,stroke:P.borderAccent,strokeA:1,radius:52}));
  n.push(txt({x:W/2-52,y:122,w:104,h:36,content:'99.8%',size:28,weight:'700',color:P.accent,align:'center',mono:true}));
  n.push(txt({x:W/2-52,y:160,w:104,h:14,content:'health',size:10,weight:'400',color:P.textMid,align:'center'}));

  // Stat row
  const stats = [{l:'SERVICES',v:'16',s:'online'},{l:'INCIDENTS',v:'4',s:'open'},{l:'P95',v:'64ms',s:'avg resp'}];
  stats.forEach((s,i) => {
    const cx = 20 + i*120;
    n.push(rect({x:cx,y:210,w:110,h:62,fill:P.surface,stroke:P.border,strokeA:1,radius:8}));
    n.push(txt({x:cx+10,y:220,w:90,h:11,content:s.l,size:7.5,weight:'600',color:P.textMid,mono:true,tracking:0.10}));
    n.push(txt({x:cx+10,y:234,w:90,h:20,content:s.v,size:17,weight:'700',color:P.text,mono:true}));
    n.push(txt({x:cx+10,y:256,w:90,h:11,content:s.s,size:8,weight:'400',color:P.textFaint,mono:true}));
  });

  // Services section
  n.push(txt({x:20,y:286,w:200,h:14,content:'SERVICE STATUS',size:8,weight:'600',color:P.textMid,mono:true,tracking:0.12}));
  n.push(txt({x:W-80,y:286,w:66,h:14,content:'View all →',size:9,weight:'400',color:P.accent,align:'right'}));

  SERVICES.slice(0,4).forEach((svc,i) => {
    const ry = 308 + i*60;
    const sc = SC[svc.status];
    n.push(rect({x:20,y:ry,w:W-40,h:52,fill:P.surface,stroke:P.border,strokeA:1,radius:9}));
    n.push(rect({x:36,y:ry+21,w:8,h:8,fill:sc,radius:4}));
    n.push(txt({x:52,y:ry+12,w:180,h:15,content:svc.name,size:12,weight:'500',color:P.text}));
    n.push(txt({x:52,y:ry+29,w:140,h:12,content:svc.region,size:8,weight:'400',color:P.textFaint,mono:true}));
    n.push(txt({x:W-100,y:ry+12,w:72,h:14,content:svc.uptime+'%',size:12,weight:'600',color:sc,mono:true,align:'right'}));
    n.push(txt({x:W-100,y:ry+29,w:72,h:12,content:svc.rt,size:8,weight:'400',color:P.textMid,mono:true,align:'right'}));
  });

  // 90-day pulse bar chart
  n.push(txt({x:20,y:554,w:240,h:13,content:'90-DAY UPTIME PULSE',size:7.5,weight:'600',color:P.textFaint,mono:true,tracking:0.12}));
  n.push(txt({x:W-80,y:554,w:66,h:13,content:'99.93% avg',size:8,weight:'400',color:P.accent,mono:true,align:'right'}));
  const barCount=46, barW=(W-42)/barCount-1;
  for(let i=0;i<barCount;i++){
    const down=Math.random()>0.97, deg=!down&&Math.random()>0.96;
    const bfill=down?P.red:deg?P.amber:P.accent;
    const bh=down?12+Math.random()*10:deg?18+Math.random()*8:24+Math.random()*8;
    n.push(rect({x:21+i*(barW+1),y:578-bh,w:barW,h:bh,fill:bfill,fillA:bfill===P.accent?0.55:0.85,radius:2}));
  }

  // Active incident banner
  n.push(rect({x:20,y:592,w:W-40,h:44,fill:P.redSoft,stroke:P.red,strokeA:0.25,radius:10}));
  n.push(txt({x:36,y:604,w:240,h:14,content:'⚡ INC-0291 · Queue Worker outage',size:11,weight:'600',color:P.red}));
  n.push(txt({x:36,y:620,w:200,h:11,content:'Ongoing · 2h 14m · View →',size:8,weight:'400',color:P.textMid,mono:true}));

  // Response time sparkline row (decorative mini chart)
  n.push(txt({x:20,y:650,w:200,h:12,content:'RESPONSE TIME — 1H',size:7.5,weight:'600',color:P.textFaint,mono:true,tracking:0.12}));
  const rtPoints=[42,38,45,41,39,55,43,40,187,210,195,220,63,48,42,44,40,43,42,40];
  const rtMax=Math.max(...rtPoints);
  rtPoints.forEach((v,i) => {
    const bh=Math.round((v/rtMax)*30)+2;
    const bfill=v>100?P.amber:P.accent;
    n.push(rect({x:20+i*((W-40)/rtPoints.length),y:694-bh,w:Math.floor((W-40)/rtPoints.length)-2,h:bh,fill:bfill,fillA:0.7,radius:1}));
  });

  bottomNav(n, 0);
  return {id:'dashboard',label:'Dashboard',description:'Health score ring · service status grid · 90-day uptime bars · incident banner',bgColor:P.bg,nodes:n};
}

// ── SCREEN 2: SERVICES ────────────────────────────────────────────────────────
function buildServices() {
  const n = [];
  n.push(rect({name:'bg',x:0,y:0,w:W,h:812,fill:P.bg}));
  n.push(rect({x:0,y:0,w:W,h:88,fill:P.bgDeep}));
  n.push(txt({x:20,y:52,w:200,h:22,content:'Services',size:20,weight:'700',color:P.text}));
  n.push(txt({x:W-100,y:56,w:84,h:16,content:'+ Add service',size:11,weight:'500',color:P.accent,align:'right'}));

  // Filter chips
  const filters=['All','OK','Degraded','Outage'];
  let fx=20;
  filters.forEach((f,i)=>{
    const fw=f.length*7.8+20;
    const act=i===0;
    n.push(rect({x:fx,y:96,w:fw,h:26,fill:act?P.accentSoft:P.surface,stroke:act?P.accent:P.border,strokeA:act?0.5:1,radius:13}));
    n.push(txt({x:fx,y:102,w:fw,h:14,content:f,size:11,weight:act?'600':'400',color:act?P.accent:P.textMid,align:'center'}));
    fx+=fw+8;
  });

  SERVICES.forEach((svc,i)=>{
    const ry=136+i*97;
    const sc=SC[svc.status];
    const sl=SL[svc.status];
    const isOk=svc.status==='ok';

    n.push(rect({x:20,y:ry,w:W-40,h:85,fill:P.surface,stroke:isOk?P.border:sc,strokeA:isOk?1:0.4,radius:12}));
    if(!isOk) n.push(rect({x:20,y:ry,w:3,h:85,fill:sc,radius:12}));

    n.push(txt({x:40,y:ry+12,w:220,h:17,content:svc.name,size:13,weight:'600',color:P.text}));
    n.push(txt({x:40,y:ry+31,w:140,h:12,content:svc.region,size:8.5,weight:'400',color:P.textFaint,mono:true}));

    // Status pill
    n.push(rect({x:W-115,y:ry+12,w:75,h:20,fill:sc,fillA:0.12,stroke:sc,strokeA:0.3,radius:10}));
    n.push(txt({x:W-115,y:ry+17,w:75,h:12,content:sl,size:8.5,weight:'600',color:sc,align:'center',mono:true}));

    // Uptime bar
    const bw=W-80;
    n.push(rect({x:40,y:ry+53,w:bw,h:4,fill:P.border,radius:2}));
    n.push(rect({x:40,y:ry+53,w:Math.round(bw*parseFloat(svc.uptime)/100),h:4,fill:sc,radius:2}));
    n.push(txt({x:40,y:ry+63,w:100,h:12,content:svc.uptime+'% uptime',size:8.5,weight:'500',color:sc,mono:true}));
    n.push(txt({x:W-60,y:ry+63,w:44,h:12,content:svc.rt,size:8.5,weight:'400',color:P.textMid,mono:true,align:'right'}));
  });

  bottomNav(n, 1);
  return {id:'services',label:'Services',description:'All services · status pills · uptime bars · left accent stripe on issues',bgColor:P.bg,nodes:n};
}

// ── SCREEN 3: INCIDENTS ───────────────────────────────────────────────────────
function buildIncidents() {
  const n = [];
  n.push(rect({name:'bg',x:0,y:0,w:W,h:812,fill:P.bg}));
  n.push(rect({x:0,y:0,w:W,h:88,fill:P.bgDeep}));
  n.push(txt({x:20,y:52,w:200,h:22,content:'Incidents',size:20,weight:'700',color:P.text}));

  // Toggle
  n.push(rect({x:W-170,y:54,w:155,h:26,fill:P.surface,stroke:P.border,strokeA:1,radius:13}));
  n.push(rect({x:W-170,y:54,w:76,h:26,fill:P.surfaceHigh,radius:13}));
  n.push(txt({x:W-170,y:60,w:76,h:14,content:'Open  4',size:10,weight:'600',color:P.text,align:'center'}));
  n.push(txt({x:W-94,y:60,w:76,h:14,content:'Resolved',size:10,weight:'400',color:P.textMid,align:'center'}));

  const incidents=[
    {id:'INC-0291',svc:'Queue Worker',sev:'critical',dur:'2h 14m',started:'Today 08:42',note:'Connection pool exhausted — growing queue backlog',open:true},
    {id:'INC-0290',svc:'Database Cluster',sev:'warning',dur:'43m',started:'Today 11:20',note:'Elevated query latency — p99 above SLA threshold',open:true},
    {id:'INC-0289',svc:'API Gateway',sev:'info',dur:'5m',started:'Yesterday 22:10',note:'Planned deploy — brief 30s 5xx spike, auto-resolved',open:false},
    {id:'INC-0288',svc:'Auth Service',sev:'info',dur:'2m',started:'Mar 30 15:40',note:'Token refresh storm from misconfigured client batch job',open:false},
  ];
  const SEVC={critical:P.red,warning:P.amber,info:P.accent2};

  incidents.forEach((inc,i)=>{
    const iy=104+i*152;
    const sc=SEVC[inc.sev];
    n.push(rect({x:20,y:iy,w:W-40,h:140,fill:P.surface,stroke:inc.open?sc:P.border,strokeA:inc.open?0.3:1,radius:12}));
    if(inc.open) n.push(rect({x:20,y:iy,w:3,h:140,fill:sc,radius:12}));

    n.push(txt({x:36,y:iy+14,w:120,h:14,content:inc.id,size:9.5,weight:'600',color:sc,mono:true}));
    n.push(rect({x:W-90,y:iy+12,w:58,h:18,fill:inc.open?P.redSoft:P.accentSoft,radius:9}));
    n.push(txt({x:W-90,y:iy+16,w:58,h:12,content:inc.open?'● OPEN':'✓ DONE',size:8,weight:'700',color:inc.open?P.red:P.accent,align:'center',mono:true}));

    n.push(txt({x:36,y:iy+32,w:240,h:17,content:inc.svc,size:13,weight:'500',color:P.text}));
    n.push(rect({x:36,y:iy+56,w:W-72,h:1,fill:P.border}));
    n.push(txt({x:36,y:iy+64,w:W-72,h:32,content:inc.note,size:10.5,weight:'400',color:P.textMid,lineH:1.55}));
    n.push(txt({x:36,y:iy+108,w:100,h:13,content:'⏱ '+inc.dur,size:9,weight:'500',color:inc.open?P.red:P.textFaint,mono:true}));
    n.push(txt({x:W-100,y:iy+108,w:80,h:13,content:inc.started,size:8.5,weight:'400',color:P.textFaint,mono:true,align:'right'}));
  });

  bottomNav(n, 2);
  return {id:'incidents',label:'Incidents',description:'Incident log · severity · open/resolved · duration timeline',bgColor:P.bg,nodes:n};
}

// ── SCREEN 4: ALERTS ─────────────────────────────────────────────────────────
function buildAlerts() {
  const n = [];
  n.push(rect({name:'bg',x:0,y:0,w:W,h:812,fill:P.bg}));
  n.push(rect({x:0,y:0,w:W,h:88,fill:P.bgDeep}));
  n.push(txt({x:20,y:52,w:200,h:22,content:'Alert Rules',size:20,weight:'700',color:P.text}));
  n.push(txt({x:W-60,y:56,w:44,h:16,content:'+ New',size:11,weight:'500',color:P.accent,align:'right'}));

  const alerts=[
    {name:'p99 Latency > 200ms',  svc:'API Gateway',      ch:'PagerDuty', on:true, last:'Never triggered'},
    {name:'Error rate > 1%',       svc:'All services',     ch:'Slack',     on:true, last:'2 days ago'},
    {name:'Uptime < 99.5%',        svc:'DB Cluster',       ch:'Email',     on:true, last:'Today 11:20'},
    {name:'Queue depth > 10k',     svc:'Queue Worker',     ch:'PagerDuty', on:true, last:'Today 08:42'},
    {name:'CPU spike > 85%',       svc:'All services',     ch:'Slack',     on:false,last:'7 days ago'},
    {name:'Memory > 90%',          svc:'Worker nodes',     ch:'Email',     on:false,last:'12 days ago'},
  ];

  alerts.forEach((al,i)=>{
    const ay=104+i*102;
    n.push(rect({x:20,y:ay,w:W-40,h:90,fill:P.surface,stroke:al.on?P.borderAccent:P.border,strokeA:1,radius:10}));
    n.push(txt({x:36,y:ay+13,w:W-120,h:16,content:al.name,size:12.5,weight:'600',color:al.on?P.text:P.textMid}));
    n.push(txt({x:36,y:ay+32,w:180,h:13,content:al.svc+' · '+al.ch,size:8.5,weight:'400',color:P.textFaint,mono:true}));

    // Toggle
    const tx=W-76, ty=ay+14;
    n.push(rect({x:tx,y:ty,w:44,h:24,fill:al.on?P.accentSoft:P.surfaceHigh,stroke:al.on?P.accent:P.border,strokeA:al.on?0.5:1,radius:12}));
    n.push(rect({x:al.on?tx+22:tx+4,y:ty+5,w:14,h:14,fill:al.on?P.accent:P.textFaint,radius:7}));

    n.push(rect({x:36,y:ay+52,w:W-72,h:1,fill:P.border}));
    n.push(txt({x:36,y:ay+62,w:200,h:13,content:'Last: '+al.last,size:8.5,weight:'400',color:P.textFaint,mono:true}));
    n.push(txt({x:W-66,y:ay+62,w:50,h:13,content:'Edit →',size:9,weight:'500',color:P.textMid,align:'right'}));
  });

  bottomNav(n, 3);
  return {id:'alerts',label:'Alerts',description:'Alert rules · channel routing · active toggle · last trigger history',bgColor:P.bg,nodes:n};
}

// ── SCREEN 5: ON-CALL ─────────────────────────────────────────────────────────
function buildOnCall() {
  const n = [];
  n.push(rect({name:'bg',x:0,y:0,w:W,h:812,fill:P.bg}));
  n.push(rect({x:0,y:0,w:W,h:88,fill:P.bgDeep}));
  n.push(txt({x:20,y:52,w:200,h:22,content:'On-Call',size:20,weight:'700',color:P.text}));
  n.push(txt({x:W-100,y:56,w:84,h:16,content:'Edit rotation',size:11,weight:'500',color:P.textMid,align:'right'}));

  // Hero card — current on-call
  n.push(rect({x:20,y:100,w:W-40,h:106,fill:P.surfaceUp,stroke:P.borderAccent,strokeA:1,radius:14}));
  n.push(txt({x:36,y:114,w:200,h:12,content:'ON-CALL NOW',size:7.5,weight:'700',color:P.accent,mono:true,tracking:0.12}));
  n.push(rect({x:36,y:132,w:44,h:44,fill:P.accent2Soft,stroke:P.accent2,strokeA:0.4,radius:22}));
  n.push(txt({x:36,y:148,w:44,h:16,content:'SL',size:12,weight:'700',color:P.accent2,align:'center'}));
  n.push(txt({x:92,y:132,w:200,h:18,content:'Sofia Lin',size:15,weight:'600',color:P.text}));
  n.push(txt({x:92,y:152,w:200,h:14,content:'Senior SRE · US West',size:11,weight:'400',color:P.textMid}));
  n.push(txt({x:92,y:170,w:170,h:12,content:'Until Apr 2, 09:00 · 21h left',size:8.5,weight:'400',color:P.textFaint,mono:true}));
  n.push(rect({x:W-106,y:128,w:82,h:28,fill:P.amberSoft,stroke:P.amber,strokeA:0.35,radius:8}));
  n.push(txt({x:W-106,y:135,w:82,h:15,content:'Escalate ↑',size:10,weight:'600',color:P.amber,align:'center'}));

  // Rotation schedule
  n.push(txt({x:20,y:222,w:200,h:14,content:'THIS WEEK',size:7.5,weight:'600',color:P.textFaint,mono:true,tracking:0.12}));

  const rota=[
    {name:'Sofia Lin',  init:'SL', shift:'Today → Apr 2',  role:'Primary', st:'active', c:P.accent2},
    {name:'Marcus Oto', init:'MO', shift:'Apr 2 → Apr 4',  role:'Primary', st:'next',   c:'#EC4899'},
    {name:'Priya Nair', init:'PN', shift:'Apr 4 → Apr 6',  role:'Primary', st:'future', c:'#F59E0B'},
    {name:'James Wei',  init:'JW', shift:'Apr 6 → Apr 8',  role:'Backup',  st:'future', c:'#10B981'},
  ];

  rota.forEach((m,i)=>{
    const my=242+i*76;
    const act=m.st==='active', nxt=m.st==='next';
    n.push(rect({x:20,y:my,w:W-40,h:64,fill:act?P.surfaceUp:P.surface,stroke:act?P.borderAccent:P.border,strokeA:1,radius:10}));
    n.push(rect({x:36,y:my+13,w:38,h:38,fill:m.c+'22',stroke:m.c,strokeA:0.35,radius:19}));
    n.push(txt({x:36,y:my+22,w:38,h:18,content:m.init,size:11,weight:'700',color:m.c,align:'center'}));
    n.push(txt({x:86,y:my+14,w:170,h:16,content:m.name,size:13,weight:act?'600':'500',color:act?P.text:P.textMid}));
    n.push(txt({x:86,y:my+32,w:160,h:12,content:m.shift,size:8.5,weight:'400',color:P.textFaint,mono:true}));
    const bc=act?P.accent:nxt?P.amber:P.textFaint;
    const bl=act?'● NOW':nxt?'→ NEXT':'◦ SCHED';
    n.push(txt({x:W-76,y:my+22,w:60,h:13,content:bl,size:8,weight:'700',color:bc,mono:true,align:'right'}));
    n.push(txt({x:W-76,y:my+37,w:60,h:12,content:m.role,size:8,weight:'400',color:P.textFaint,mono:true,align:'right'}));
  });

  // MTTA/MTTR stats
  n.push(txt({x:20,y:556,w:240,h:13,content:'30-DAY RESPONSE STATS',size:7.5,weight:'600',color:P.textFaint,mono:true,tracking:0.12}));
  const rs=[{l:'MTTA',v:'3m 24s',s:'to acknowledge'},{l:'MTTR',v:'47m',s:'to resolve'},{l:'ACKS',v:'98.2%',s:'in < 5 min'}];
  rs.forEach((r,i)=>{
    const rx=20+i*((W-40)/3), rw=(W-40)/3-8;
    n.push(rect({x:rx,y:578,w:rw,h:64,fill:P.surface,stroke:P.border,strokeA:1,radius:8}));
    n.push(txt({x:rx+10,y:590,w:rw-20,h:12,content:r.l,size:7.5,weight:'600',color:P.textMid,mono:true,tracking:0.08}));
    n.push(txt({x:rx+10,y:606,w:rw-20,h:18,content:r.v,size:14,weight:'700',color:P.accent,mono:true}));
    n.push(txt({x:rx+10,y:628,w:rw-20,h:11,content:r.s,size:7.5,weight:'400',color:P.textFaint}));
  });

  bottomNav(n, 4);
  return {id:'oncall',label:'On-Call',description:'On-call hero card · rotation schedule · MTTA/MTTR stats',bgColor:P.bg,nodes:n};
}

// ── ASSEMBLE & WRITE ──────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  meta: {
    name:        'WATCH',
    tagline:     'Your stack, always on.',
    archetype:   'dev-monitoring',
    author:      'RAM Design Heartbeat',
    created:     new Date().toISOString(),
    theme:       'dark',
    inspiration: '"Interfere › Build software that never breaks" (land-book.com) — dev monitoring dark tool. "Neon" UI category (darkmodedesign.com) — selective neon accent on near-pure black. Linear: Change (godly.website) — deep #070709 charcoal, monospace data density, single vivid accent.',
  },
  palette:      P,
  lightPalette: LP,
  typography: {
    display: { family:'Inter, system-ui', weight:700, tracking:'-0.03em' },
    mono:    { family:'IBM Plex Mono, Courier New, monospace', weight:400 },
    monoMed: { family:'IBM Plex Mono, Courier New, monospace', weight:600 },
    body:    { family:'Inter, system-ui', weight:400 },
    label:   { family:'IBM Plex Mono, Courier New, monospace', weight:600, tracking:'0.10em', uppercase:true },
  },
  screens: [
    buildDashboard(),
    buildServices(),
    buildIncidents(),
    buildAlerts(),
    buildOnCall(),
  ],
};

const out = path.join(__dirname, 'watch.pen');
fs.writeFileSync(out, JSON.stringify(pen, null, 2));
const kb = (fs.statSync(out).size/1024).toFixed(1);
console.log(`✓ watch.pen written (${kb} KB)`);
console.log(`  Screens: ${pen.screens.map(s=>s.label).join(', ')}`);
