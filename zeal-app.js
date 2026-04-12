// zeal-app.js — ZEAL: Database Branch Intelligence
// Theme: DARK (previous design 'wire' was LIGHT #F7F4EE cream)
// Inspired by:
//   Neon.com (via darkmodedesign.com) — pure near-black bg, electric teal accent,
//     developer infra tool, branch-as-a-feature concept, monospace code snippets
//   Evervault (via godly.website) — dark, gradient, colourful SaaS, Inter + Roobert,
//     security-focused dark aesthetic with purple gradients
//   Minimal.gallery SAAS filter — clean, sparse, high-contrast data-dense UIs

const fs = require('fs');
const path = require('path');

const W = 390, H = 844;

// DARK palette — near-black with electric teal + violet
const BG      = '#080C14';   // deep navy-black
const SURFACE = '#0F1422';   // elevated surface
const SURF2   = '#151A2B';   // secondary surface
const TEXT    = '#DCE5F7';   // cool white
const TEXT2   = '#7B8DB8';   // muted blue-grey
const ACCENT  = '#3DFFC0';   // electric mint (Neon.com teal lineage)
const ACCENT2 = '#9B7BFF';   // electric violet (Evervault purple lineage)
const BORDER  = 'rgba(220,229,247,0.07)';
const BORD2   = 'rgba(220,229,247,0.12)';
const GREEN   = '#3DFFC0';
const ORANGE  = '#FF9F43';
const RED     = '#FF5470';
const CODE    = '#7FDBFF';   // monospace highlight

let _id = 1;
const uid = () => `el_${_id++}`;

const rect = (x,y,w,h,fill,r=0) => ({
  id:uid(),type:'rect',x,y,width:w,height:h,fill,cornerRadius:r,stroke:'none',strokeWidth:0
});
const bordRect = (x,y,w,h,r,stroke=BORDER,sw=1) => ({
  id:uid(),type:'rect',x,y,width:w,height:h,fill:'none',cornerRadius:r,stroke,strokeWidth:sw
});
const fillBordRect = (x,y,w,h,fill,r,stroke=BORDER,sw=1) => ({
  id:uid(),type:'rect',x,y,width:w,height:h,fill,cornerRadius:r,stroke,strokeWidth:sw
});
const line = (x1,y1,x2,y2,stroke=BORDER,sw=0.5) => ({
  id:uid(),type:'line',x1,y1,x2,y2,stroke,strokeWidth:sw
});
const txt = (content,x,y,size,fill,weight='regular',align='left',width=0) => ({
  id:uid(),type:'text',content,x,y,fontSize:size,fill,fontWeight:weight,textAlign:align,
  ...(width>0?{width}:{})
});
const circ = (cx,cy,r,fill) => ({
  id:uid(),type:'ellipse',x:cx-r,y:cy-r,width:r*2,height:r*2,fill,stroke:'none',strokeWidth:0
});
const pill = (x,y,w,h,fill,r=999) => ({
  id:uid(),type:'rect',x,y,width:w,height:h,fill,cornerRadius:r,stroke:'none',strokeWidth:0
});

// ── Nav bar ──────────────────────────────────────────────────────────────────
function nav(sx, active) {
  const navY = H - 80;
  const items = [
    {icon:'◈',label:'Overview'},
    {icon:'⎇',label:'Branches'},
    {icon:'⚡',label:'Queries'},
    {icon:'⬡',label:'Connect'},
    {icon:'◎',label:'Alerts'},
  ];
  const els = [
    rect(sx,navY,W,80,SURFACE),
    line(sx,navY,sx+W,navY,BORD2,1),
  ];
  const cw = W/items.length;
  items.forEach(({icon,label},i) => {
    const cx = sx+cw*i+cw/2;
    const isActive = i===active;
    const col = isActive ? ACCENT : TEXT2;
    if (isActive) {
      els.push(rect(cx-18,navY,36,2,ACCENT,1));
    }
    els.push(txt(icon, cx-10, navY+10, 18, col));
    els.push(txt(label, cx-cw/2+2, navY+34, 9, col, isActive?'semibold':'regular', 'center', cw-4));
  });
  return els;
}

// ── Status bar ───────────────────────────────────────────────────────────────
function statusBar(sx) {
  return [
    rect(sx,0,W,44,BG),
    txt('9:41',sx+16,13,13,TEXT,'semibold'),
    txt('◈ ▲ ◉',sx+W-56,13,11,TEXT2),
  ];
}

// ── Section header ───────────────────────────────────────────────────────────
function screenHeader(sx, title, sub='') {
  return [
    rect(sx,44,W,58,BG),
    txt(title, sx+20, 50, 22, TEXT, 'bold'),
    ...(sub ? [txt(sub, sx+20, 78, 10.5, TEXT2)] : []),
    line(sx,102,sx+W,102,BORDER,0.5),
  ];
}

// ── Mini sparkline (SVG path sim via rects) ───────────────────────────────────
function sparkline(sx,y,data,color=ACCENT) {
  const els = [];
  const maxV = Math.max(...data);
  const barW = 4; const gap = 3;
  data.forEach((v,i) => {
    const bh = Math.round((v/maxV)*24);
    const bx = sx+i*(barW+gap);
    const by = y+(24-bh);
    els.push(rect(bx,by,barW,bh, color, 1));
  });
  return els;
}

// ── Screen 1: Overview ───────────────────────────────────────────────────────
function overviewScreen(sx) {
  const els = [rect(sx,0,W,H,BG), ...statusBar(sx), ...screenHeader(sx,'Overview','main · aws-us-east-1 · 0ms lag')];

  // Hero metric card — p99 latency
  els.push(fillBordRect(sx+16,108,W-32,80,SURFACE,10,BORD2,1));
  els.push(txt('p99 Latency', sx+28, 117, 9.5, TEXT2, 'medium'));
  els.push(txt('18ms', sx+28, 135, 30, ACCENT, 'bold'));
  els.push(txt('↓ 4ms vs last hour', sx+28, 173, 10, GREEN));
  // sparkline
  const spark = [8,12,9,15,11,18,14,16,12,10,13,18];
  sparkline(sx+W-120, 130, spark, ACCENT).forEach(e => { e.x += 0; els.push(e); });

  // 3-col metric row
  const metrics = [
    {label:'QPS',value:'4.2K',delta:'+12%',pos:true},
    {label:'p50',value:'3ms',delta:'stable',pos:null},
    {label:'Errors',value:'0.02%',delta:'−0.01%',pos:true},
  ];
  const mw = (W-32)/3;
  metrics.forEach((m,i) => {
    const mx = sx+16+i*mw;
    els.push(fillBordRect(mx, 202, mw-6, 64, SURFACE, 8, BORD2, 1));
    els.push(txt(m.label, mx+10, 212, 9, TEXT2));
    els.push(txt(m.value, mx+10, 228, 17, TEXT, 'bold'));
    const dc = m.pos===true?GREEN:m.pos===false?RED:TEXT2;
    els.push(txt(m.delta, mx+10, 251, 9, dc));
  });

  // Branch health list header
  els.push(txt('Branch Health', sx+20, 282, 11, TEXT2, 'semibold'));
  const branches = [
    {name:'main',status:'healthy',latency:'18ms',color:GREEN},
    {name:'dev/feature-auth',status:'healthy',latency:'22ms',color:GREEN},
    {name:'staging',status:'degraded',latency:'84ms',color:ORANGE},
    {name:'preview/pr-412',status:'healthy',latency:'15ms',color:GREEN},
  ];
  branches.forEach((b,i) => {
    const by = 300+i*54;
    els.push(fillBordRect(sx+16,by,W-32,48,SURFACE,8,BORD2,1));
    els.push(circ(sx+35,by+24,5,b.color));
    els.push(txt(b.name, sx+50, by+13, 12, TEXT, 'medium'));
    els.push(txt(b.status, sx+50, by+31, 9.5, b.color));
    els.push(txt(b.latency, sx+W-52, by+17, 13, TEXT, 'semibold'));
    els.push(txt('p99', sx+W-52, by+33, 9, TEXT2));
  });

  // Active connections footer
  els.push(txt('CONNECTIONS', sx+20, 528, 9, TEXT2, 'semibold'));
  els.push(fillBordRect(sx+16,544,W-32,56,SURFACE,8,BORD2,1));
  // connection pool bar
  els.push(rect(sx+28,568,W-72,8,SURF2,4));
  els.push(rect(sx+28,568,Math.round((W-72)*0.68),8,ACCENT,4));
  els.push(txt('68 / 100 connections used', sx+28, 588, 9.5, TEXT2));
  els.push(txt('68%', sx+W-52, 565, 13, ACCENT, 'semibold'));

  els.push(...nav(sx,0));
  return els;
}

// ── Screen 2: Branches ───────────────────────────────────────────────────────
function branchesScreen(sx) {
  const els = [rect(sx,0,W,H,BG), ...statusBar(sx), ...screenHeader(sx,'Branches','4 branches · 0 conflicts')];

  // Branch tree visual
  const branchList = [
    {name:'main',sha:'a3f9d21',age:'2h ago',qps:'4.2K',latency:'18ms',status:'healthy'},
    {name:'dev/feature-auth',sha:'c91bb44',age:'5h ago',qps:'0.8K',latency:'22ms',status:'healthy'},
    {name:'staging',sha:'7d3a10e',age:'1d ago',qps:'1.1K',latency:'84ms',status:'degraded'},
    {name:'preview/pr-412',sha:'f023c88',age:'3h ago',qps:'0.2K',latency:'15ms',status:'healthy'},
  ];

  let yOff = 108;
  branchList.forEach((b,i) => {
    const isMain = i===0;
    const col = b.status==='healthy'?GREEN:b.status==='degraded'?ORANGE:RED;

    els.push(fillBordRect(sx+16,yOff,W-32,78,isMain?SURF2:SURFACE,10,isMain?ACCENT+'30':BORD2,isMain?1:1));
    if (isMain) {
      // "main" badge
      els.push(pill(sx+20,yOff+8,40,16,'rgba(61,255,192,0.15)',8));
      els.push(txt('main', sx+27, yOff+12, 9, ACCENT, 'semibold'));
      els.push(txt(b.name, sx+66, yOff+13, 11, TEXT, 'semibold'));
    } else {
      // branch connector line
      els.push(line(sx+30,yOff+2,sx+30,yOff-6,TEXT2+'60',1));
      els.push(line(sx+30,yOff+2,sx+46,yOff+2,TEXT2+'60',1));
      els.push(txt(b.name, sx+50, yOff+13, 11, TEXT, 'medium'));
    }
    // sha pill
    els.push(pill(sx+W-88,yOff+10,68,16,SURF2,4));
    els.push(txt(b.sha, sx+W-82, yOff+14, 8.5, CODE));
    // metrics row
    els.push(txt(`${b.qps} QPS`, sx+50, yOff+34, 10, TEXT2));
    els.push(txt('·', sx+50+b.qps.length*6+10, yOff+34, 10, TEXT2));
    els.push(txt(`p99: ${b.latency}`, sx+50+b.qps.length*6+20, yOff+34, 10, TEXT2));
    els.push(circ(sx+W-30,yOff+36,5,col));
    // age
    els.push(txt(b.age, sx+50, yOff+52, 9, TEXT2));

    yOff += 88;
  });

  // New branch CTA
  els.push(fillBordRect(sx+16,yOff+4,W-32,44,'rgba(155,123,255,0.06)',10,ACCENT2+'40',1));
  els.push(txt('⎇  Create branch from main', sx+W/2, yOff+16, 12, ACCENT2, 'medium', 'center', W-32));

  els.push(...nav(sx,1));
  return els;
}

// ── Screen 3: Queries ────────────────────────────────────────────────────────
function queriesScreen(sx) {
  const els = [rect(sx,0,W,H,BG), ...statusBar(sx), ...screenHeader(sx,'Slow Queries','p99 > 50ms · last 1h')];

  // Filter chips
  const chips = ['All','> 50ms','> 100ms','Errors'];
  let cx = sx+16;
  chips.forEach((c,i) => {
    const cw = c.length*7.5+20;
    const active = i===0;
    els.push(pill(cx, 108, cw, 24, active?ACCENT:'transparent', 12));
    if (!active) els.push(bordRect(cx,108,cw,24,12,BORD2,1));
    els.push(txt(c, cx+cw/2, 115, 10, active?BG:TEXT2, active?'semibold':'regular', 'center', cw));
    cx += cw+8;
  });

  // Query cards
  const queries = [
    {rank:1,ms:312,query:'SELECT u.*, p.plan_id FROM users u JOIN plans p ON...', table:'users ∩ plans',type:'JOIN',reads:'84K'},
    {rank:2,ms:214,query:'UPDATE analytics_events SET processed=true WHERE batch...', table:'analytics_events',type:'UPDATE',reads:'52K'},
    {rank:3,ms:189,query:'SELECT COUNT(*) FROM audit_log WHERE created_at >...', table:'audit_log',type:'COUNT',reads:'203K'},
    {rank:4,ms:97,query:'INSERT INTO job_queue SELECT * FROM pending_jobs WHERE...', table:'job_queue',type:'INSERT',reads:'12K'},
    {rank:5,ms:68,query:'SELECT DISTINCT user_id FROM sessions WHERE expires_at <...', table:'sessions',type:'SELECT',reads:'31K'},
  ];

  queries.forEach((q,i) => {
    const qy = 142+i*120;
    if (qy+112 > H-80) return;
    els.push(fillBordRect(sx+16,qy,W-32,112,SURFACE,8,BORD2,1));
    // rank + ms badge
    const msCol = q.ms>200?RED:q.ms>100?ORANGE:ACCENT;
    els.push(pill(sx+26,qy+10,34,18,msCol+'20',4));
    els.push(txt(`${q.ms}ms`, sx+30, qy+14, 9, msCol, 'bold'));
    // type badge
    els.push(pill(sx+68,qy+10,36,18,SURF2,4));
    els.push(txt(q.type, sx+72, qy+14, 9, TEXT2));
    // table
    els.push(txt(q.table, sx+W-32-q.table.length*6.5, qy+14, 9.5, TEXT2));
    // query text (truncated)
    const qShort = q.query.length > 58 ? q.query.slice(0,55)+'...' : q.query;
    els.push(txt(qShort, sx+26, qy+38, 10.5, TEXT, 'regular', 'left', W-52));
    // reads
    els.push(txt(`${q.reads} rows read`, sx+26, qy+65, 9.5, TEXT2));
    // divider
    els.push(line(sx+26,qy+82,sx+W-26,qy+82,BORDER,0.5));
    els.push(txt('View explain plan →', sx+26, qy+91, 9.5, ACCENT));
  });

  els.push(...nav(sx,2));
  return els;
}

// ── Screen 4: Connections ────────────────────────────────────────────────────
function connectionsScreen(sx) {
  const els = [rect(sx,0,W,H,BG), ...statusBar(sx), ...screenHeader(sx,'Connections','pooler: us-east-1')];

  // Big donut-like gauge (simulated with arcs as rects)
  // Use a large circle with text overlay
  const gaugeY = 150;
  els.push(circ(sx+W/2,gaugeY,56,SURF2));
  els.push(circ(sx+W/2,gaugeY,44,BG));
  // Arc segments (faked with 4 rects arranged radially — approximate)
  // Left arc = used (68%)
  for (let a=0;a<12;a++) {
    const angle = (a/16)*Math.PI*2 - Math.PI/2;
    const used = a < Math.round(12*0.68);
    const r = 52;
    const ex = sx+W/2 + Math.cos(angle)*r;
    const ey = gaugeY + Math.sin(angle)*r;
    els.push(circ(ex,ey,4,used?ACCENT:SURF2));
  }
  els.push(txt('68', sx+W/2-16, gaugeY-14, 26, TEXT, 'bold'));
  els.push(txt('/ 100', sx+W/2-14, gaugeY+14, 10, TEXT2, 'regular','center',32));

  // Stats row
  const stats = [
    {label:'Active',value:'68',color:ACCENT},
    {label:'Idle',value:'21',color:TEXT2},
    {label:'Waiting',value:'11',color:ORANGE},
  ];
  const sw = (W-32)/3;
  stats.forEach((s,i) => {
    const smx = sx+16+i*sw;
    els.push(fillBordRect(smx,222,sw-6,52,SURFACE,8,BORD2,1));
    els.push(txt(s.value, smx+10, 233, 20, s.color, 'bold'));
    els.push(txt(s.label, smx+10, 259, 9.5, TEXT2));
  });

  // Connection endpoint list
  els.push(txt('ACTIVE ENDPOINTS', sx+20, 288, 9, TEXT2, 'semibold'));
  const endpoints = [
    {host:'app-prod-01',pool:'pgbouncer',conns:28,status:'active'},
    {host:'worker-fleet',pool:'pgbouncer',conns:22,status:'active'},
    {host:'analytics-svc',pool:'direct',conns:12,status:'active'},
    {host:'cron-runner',pool:'pgbouncer',conns:6,status:'idle'},
  ];
  endpoints.forEach((ep,i) => {
    const ey = 304+i*58;
    els.push(fillBordRect(sx+16,ey,W-32,52,SURFACE,8,BORD2,1));
    els.push(circ(sx+34,ey+26,5,ep.status==='active'?GREEN:TEXT2+'80'));
    els.push(txt(ep.host, sx+48, ey+14, 12, TEXT, 'medium'));
    els.push(txt(`${ep.pool} · ${ep.conns} conns`, sx+48, ey+32, 10, TEXT2));
    els.push(txt(`${ep.conns}`, sx+W-42, ey+16, 14, TEXT, 'semibold'));
  });

  // Pool config
  els.push(txt('POOL CONFIG', sx+20, 540, 9, TEXT2, 'semibold'));
  els.push(fillBordRect(sx+16,556,W-32,52,SURFACE,8,BORD2,1));
  els.push(txt('pool_mode', sx+28, 568, 10, TEXT2));
  els.push(txt('transaction', sx+W-96, 568, 10, CODE));
  els.push(line(sx+28,582,sx+W-28,582,BORDER,0.5));
  els.push(txt('max_client_conn', sx+28, 591, 10, TEXT2));
  els.push(txt('500', sx+W-52, 591, 10, CODE));

  els.push(...nav(sx,3));
  return els;
}

// ── Screen 5: Alerts ─────────────────────────────────────────────────────────
function alertsScreen(sx) {
  const els = [rect(sx,0,W,H,BG), ...statusBar(sx), ...screenHeader(sx,'Alerts','1 firing · 2 pending')];

  // Alert summary row
  els.push(fillBordRect(sx+16,108,W-32,56,`rgba(255,84,112,0.08)`,10,RED+'40',1));
  els.push(circ(sx+38,108+28,8,RED));
  els.push(txt('1 alert firing', sx+54, 108+14, 13, RED, 'semibold'));
  els.push(txt('staging branch p99 > 80ms threshold', sx+54, 108+32, 10, TEXT2,'regular','left',W-80));

  // Alert cards
  const alerts = [
    {
      name:'High Latency — staging',
      rule:'p99 > 80ms for 5min',
      since:'14 min ago',
      severity:'critical',
      branch:'staging',
      value:'84ms',
      firing:true,
    },
    {
      name:'Connection Spike',
      rule:'connections > 85% capacity',
      since:'—',
      severity:'warning',
      branch:'main',
      value:'68%',
      firing:false,
    },
    {
      name:'Error Rate Rise',
      rule:'error_rate > 0.5% for 3min',
      since:'—',
      severity:'warning',
      branch:'all',
      value:'0.02%',
      firing:false,
    },
  ];

  alerts.forEach((a,i) => {
    const ay = 178+i*96;
    const col = a.severity==='critical'?RED:ORANGE;
    const bgTint = a.firing?`rgba(255,84,112,0.06)`:`rgba(255,159,67,0.04)`;
    els.push(fillBordRect(sx+16,ay,W-32,90,a.firing?bgTint:SURFACE,8,a.firing?RED+'40':BORD2,1));

    // severity badge
    const badgeCol = a.severity==='critical'?RED:ORANGE;
    els.push(pill(sx+26,ay+10,a.firing?48:56,16,badgeCol+'20',4));
    els.push(txt(a.firing?'FIRING':a.severity.toUpperCase(), sx+30, ay+14, 8.5, badgeCol, 'bold'));

    // branch badge
    els.push(pill(sx+W-80,ay+10,64,16,SURF2,4));
    els.push(txt('⎇ '+a.branch, sx+W-76, ay+14, 8.5, TEXT2));

    els.push(txt(a.name, sx+26, ay+34, 12, TEXT, 'semibold'));
    els.push(txt(a.rule, sx+26, ay+52, 10, TEXT2));

    // current value
    els.push(txt(a.value, sx+W-60, ay+44, 14, col, 'bold'));
    els.push(txt('current', sx+W-60, ay+62, 9, TEXT2));
    if (a.firing) {
      els.push(txt(`for ${a.since}`, sx+26, ay+70, 9.5, col));
    }
  });

  // Alert rules section
  els.push(txt('ALERT RULES', sx+20, 470, 9, TEXT2, 'semibold'));
  els.push(fillBordRect(sx+16,486,W-32,120,SURFACE,8,BORD2,1));
  const rules = [
    {name:'Latency SLO',cond:'p99 > 80ms / 5m',status:'active'},
    {name:'Connection Limit',cond:'conns > 85% / 2m',status:'active'},
    {name:'Error Budget',cond:'errors > 0.5% / 3m',status:'active'},
  ];
  rules.forEach((r,j) => {
    const ry = 496+j*36;
    els.push(circ(sx+30,ry+8,4,ACCENT));
    els.push(txt(r.name, sx+44, ry, 11, TEXT, 'medium'));
    els.push(txt(r.cond, sx+44, ry+16, 9, TEXT2));
    els.push(txt(r.status, sx+W-64, ry+6, 9.5, GREEN, 'medium'));
    if (j<2) els.push(line(sx+26,ry+30,sx+W-26,ry+30,BORDER,0.5));
  });

  els.push(...nav(sx,4));
  return els;
}

// ── Compose all screens ──────────────────────────────────────────────────────
const screens = [
  overviewScreen(0),
  branchesScreen(W+80),
  queriesScreen((W+80)*2),
  connectionsScreen((W+80)*3),
  alertsScreen((W+80)*4),
];

const allElements = screens.flat();
const totalW = W*5+80*4;

const pen = {
  version: '2.8',
  name: 'ZEAL — Database Branch Intelligence',
  description: 'Dark-themed developer tool for real-time database branch monitoring. Near-black navy (#080C14) meets electric mint (#3DFFC0) and violet (#9B7BFF). Inspired by Neon.com infrastructure UI (via darkmodedesign.com) + Evervault dark gradient aesthetic (via godly.website). 5 screens: Overview, Branches, Slow Queries, Connections, Alerts.',
  width: totalW,
  height: H,
  background: BG,
  elements: allElements,
};

fs.writeFileSync(path.join(__dirname,'zeal.pen'), JSON.stringify(pen,null,2));
console.log(`zeal.pen written — ${allElements.length} elements, ${totalW}×${H}px`);
