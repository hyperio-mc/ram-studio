// wire-app.js — WIRE: AI Workflow Orchestration Platform
// Theme: LIGHT (previous design 'patch' was dark #0A0F07)
// Inspired by:
//   Neon.com (via darkmodedesign.com) — pure black bg, green #34D59A agent status dots,
//     code-adjacent terminal CTA "$ npx neonctl init", Inter + GeistMono typography
//   Midday.ai — warm cream palette #F7F5F0, editorial serif "Hedvig Letters", business
//     finance dashboard clarity
//   Lapa.ninja trending — Ape AI, JetBrains Air: agentic developer tooling UX boom

const fs = require('fs');
const path = require('path');

const W = 390, H = 844, SCREENS = 5, GAP = 80;

// Light palette — warm cream + Neon-green agent indicators
const BG      = '#F7F4EE';  // warm cream, editorial
const SURFACE = '#FFFFFF';
const SURF2   = '#F0EDE5';  // recessed surfaces
const TEXT    = '#1A1918';
const TEXT2   = '#6B6560';
const ACCENT  = '#00C97A';  // Neon-inspired agent-green
const ACCENT2 = '#7B5CF6';  // violet for secondary
const BORDER  = '#E5E0D6';
const ERROR   = '#E5484D';

let _id = 1;
const uid = () => `el_${_id++}`;

const rect = (x,y,w,h,fill,r=0) => ({
  id:uid(),type:'rect',x,y,width:w,height:h,fill,cornerRadius:r,stroke:'none',strokeWidth:0
});
const bordRect = (x,y,w,h,r,stroke=BORDER,sw=1) => ({
  id:uid(),type:'rect',x,y,width:w,height:h,fill:'none',cornerRadius:r,stroke,strokeWidth:sw
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

function nav(sx, active) {
  const navY = H - 82;
  const items = [
    {icon:'⚡',label:'Flows'},
    {icon:'◈',label:'Agents'},
    {icon:'▶',label:'Runs'},
    {icon:'◉',label:'Stats'},
    {icon:'⚙',label:'Config'},
  ];
  const els = [
    rect(sx,navY,W,82,SURFACE),
    line(sx,navY,sx+W,navY,BORDER,1),
  ];
  const cw = W/items.length;
  items.forEach(({icon,label},i) => {
    const cx = sx+cw*i+cw/2;
    const isActive = i===active;
    const col = isActive ? ACCENT : TEXT2;
    if (isActive) els.push(rect(cx-16,navY,32,3,ACCENT,2));
    els.push(txt(icon, cx-8, navY+12, 18, col));
    els.push(txt(label, cx-cw/2+4, navY+36, 9.5, col, isActive?'semibold':'regular', 'center', cw-8));
  });
  return els;
}

function statusBar(sx) {
  return [
    rect(sx,0,W,50,BG),
    txt('9:41',sx+16,14,14,TEXT,'semibold'),
    txt('▲◥ 📶',sx+W-60,14,11,TEXT2),
  ];
}

function header(sx,title,sub='') {
  return [
    rect(sx,50,W,64,BG),
    txt(title,sx+20,58,24,TEXT,'bold'),
    ...(sub?[txt(sub,sx+20,88,11,TEXT2)]:[]),
    line(sx,114,sx+W,114,BORDER,0.5),
  ];
}

// ── Screen 1: Flows (Workflow Grid) ──────────────────────────────────────────
function flowsScreen(sx) {
  const els = [rect(sx,0,W,H,BG),...statusBar(sx),...header(sx,'Flows','6 active · 2 paused')];

  // Summary pill row
  const pills = [
    {label:'14 runs today',fg:ACCENT,bg:'#E6FAF1'},
    {label:'98.2% success',fg:'#008F52',bg:'#E6FAF1'},
    {label:'1 error',fg:ERROR,bg:'#FEE9EA'},
  ];
  let px = sx+16;
  pills.forEach(({label,fg,bg}) => {
    const pw = label.length*7.2+20;
    els.push(rect(px,122,pw,26,bg,13));
    els.push(txt(label,px+10,129,10.5,fg,'semibold'));
    px += pw+8;
  });

  // Workflow cards
  const flows = [
    {name:'Customer Onboarding',agents:3,last:'2m ago', runs:847, status:'live',  pct:84},
    {name:'Invoice Processing', agents:2,last:'11m ago',runs:2104,status:'live',  pct:62},
    {name:'Support Triage',     agents:4,last:'34s ago',runs:412, status:'live',  pct:91},
    {name:'Data Sync — EU',     agents:1,last:'1h ago', runs:3301,status:'paused',pct:0},
    {name:'Weekly Report Gen',  agents:2,last:'6h ago', runs:88,  status:'error', pct:0},
  ];

  flows.forEach((f,i) => {
    const cy = 160+i*98;
    if (cy+92>H-90) return;
    const sc = f.status==='live'?ACCENT:f.status==='error'?ERROR:TEXT2;
    const sl = f.status==='live'?'● Live':f.status==='error'?'⚠ Error':'⏸ Paused';

    els.push(rect(sx+16,cy,W-32,92,SURFACE,10));
    els.push(bordRect(sx+16,cy,W-32,92,10));
    if(f.status!=='paused') els.push(rect(sx+16,cy,3,92,sc,10));

    els.push(txt(f.name,sx+28,cy+12,14,TEXT,'semibold','left',W-80));
    els.push(txt(`${f.agents} agents`,sx+28,cy+34,11,TEXT2));
    els.push(txt(f.last,sx+28,cy+50,11,TEXT2));

    const spw=62;
    const spBg=f.status==='live'?'#E6FAF1':f.status==='error'?'#FEE9EA':SURF2;
    els.push(rect(sx+W-32-spw,cy+12,spw,22,spBg,11));
    els.push(txt(sl,sx+W-32-spw+8,cy+17,9.5,sc,'semibold'));
    els.push(txt(`${f.runs.toLocaleString()} runs`,sx+W-32-spw,cy+46,10,TEXT2,'regular','right',spw));

    if(f.status==='live') {
      const bw=W-64;
      els.push(rect(sx+28,cy+80,bw,3,SURF2,2));
      els.push(rect(sx+28,cy+80,bw*f.pct/100,3,ACCENT,2));
    }
  });

  // FAB
  els.push(circ(sx+W-40,H-104,22,ACCENT));
  els.push(txt('+',sx+W-48,H-116,22,'#000','bold'));

  return [...els,...nav(sx,0)];
}

// ── Screen 2: Agents ─────────────────────────────────────────────────────────
function agentsScreen(sx) {
  const els=[rect(sx,0,W,H,BG),...statusBar(sx),...header(sx,'Agents','8 agents · 5 active')];

  const agents = [
    {name:'Intake',   role:'Classifier',  q:3, up:99.9,status:'busy', model:'claude-3.5'},
    {name:'Sorter',   role:'Router',      q:0, up:99.7,status:'idle', model:'gpt-4o-mini'},
    {name:'Drafter',  role:'Generator',   q:7, up:98.1,status:'busy', model:'claude-3.5'},
    {name:'Verifier', role:'QA',          q:2, up:100, status:'busy', model:'gemini-1.5'},
    {name:'Notifier', role:'Messenger',   q:0, up:97.4,status:'idle', model:'gpt-4o-mini'},
    {name:'Extractor',role:'Parser',      q:0, up:0,   status:'error',model:'claude-3.5'},
  ];

  agents.forEach((ag,i) => {
    const ry = 130+i*74;
    if(ry+74>H-90) return;
    const sc=ag.status==='busy'?ACCENT:ag.status==='error'?ERROR:TEXT2;

    els.push(line(sx+16,ry+74,sx+W-16,ry+74,BORDER,0.5));

    const avBg=ag.status==='busy'?'#E6FAF1':ag.status==='error'?'#FEE9EA':SURF2;
    els.push(circ(sx+34,ry+37,18,avBg));
    els.push(circ(sx+46,ry+25,5,sc)); // status dot
    els.push(txt(ag.name[0],sx+28,ry+29,14,TEXT,'bold'));

    els.push(txt(ag.name,sx+60,ry+14,14,TEXT,'semibold'));
    els.push(txt(ag.role,sx+60,ry+32,11,TEXT2));
    els.push(txt(ag.model,sx+60,ry+50,10,TEXT2));

    // Right side
    els.push(txt(`${ag.q} queued`,sx+W-76,ry+14,11,ag.q>0?TEXT:TEXT2,'regular','right',60));
    els.push(txt(`${ag.up}% up`,sx+W-76,ry+32,11,ag.up>99?'#008F52':TEXT2,'regular','right',60));

    const sbW=42;
    const sbBg=ag.status==='busy'?'#E6FAF1':ag.status==='error'?'#FEE9EA':SURF2;
    els.push(rect(sx+W-sbW-16,ry+50,sbW,18,sbBg,9));
    els.push(txt(ag.status,sx+W-sbW-10,ry+54,9.5,sc,'semibold'));
  });

  return [...els,...nav(sx,1)];
}

// ── Screen 3: Run Log ─────────────────────────────────────────────────────────
function runsScreen(sx) {
  const els=[rect(sx,0,W,H,BG),...statusBar(sx),...header(sx,'Run Log','Live · refreshing')];

  // Live pulse
  els.push(circ(sx+W-30,76,5,ACCENT));
  els.push(txt('LIVE',sx+W-58,70,10,ACCENT,'bold'));

  // Filter tabs
  ['All','Running','Errors'].forEach((tab,i) => {
    const tw=60; const tx=sx+16+i*(tw+8);
    const active=i===0;
    els.push(rect(tx,122,tw,26,active?ACCENT:SURF2,13));
    els.push(txt(tab,tx+tw/2-tab.length*3.2,129,11,active?'#000':TEXT2,active?'bold':'regular'));
  });

  const runs=[
    {id:'#8823',wf:'Customer Onboarding',agent:'Intake',   ts:'just now', dur:'—',   status:'running',log:'Classifying inbound message...'},
    {id:'#8822',wf:'Invoice Processing', agent:'Drafter',  ts:'1m ago',   dur:'4.2s',status:'done',   log:'Generated invoice draft → Acme Corp'},
    {id:'#8821',wf:'Support Triage',     agent:'Verifier', ts:'2m ago',   dur:'1.8s',status:'done',   log:'QA passed — routing to tier-2'},
    {id:'#8820',wf:'Customer Onboarding',agent:'Notifier', ts:'4m ago',   dur:'0.9s',status:'done',   log:'Welcome email sent → j@acme.co'},
    {id:'#8819',wf:'Data Sync — EU',     agent:'Extractor',ts:'1h ago',   dur:'—',   status:'error',  log:'Connection timeout: postgres://eu-west'},
  ];

  runs.forEach((r,i) => {
    const ey=160+i*94;
    if(ey+88>H-90) return;
    const sc=r.status==='running'?ACCENT:r.status==='error'?ERROR:TEXT2;
    const strip=r.status==='running'?ACCENT:r.status==='error'?ERROR:'#C8EBD8';

    els.push(rect(sx+16,ey,W-32,88,SURFACE,8));
    els.push(bordRect(sx+16,ey,W-32,88,8));
    els.push(rect(sx+16,ey,3,88,strip,8));

    els.push(txt(r.id,sx+28,ey+10,10,TEXT2));
    els.push(txt(r.wf,sx+62,ey+10,10,TEXT2));
    els.push(txt(r.agent,sx+28,ey+28,13,TEXT,'semibold'));

    const sw=r.status==='running'?52:r.status==='error'?38:34;
    const sbg=r.status==='running'?'#E6FAF1':r.status==='error'?'#FEE9EA':SURF2;
    els.push(rect(sx+W-36-sw,ey+10,sw,18,sbg,9));
    els.push(txt(r.status,sx+W-36-sw+6,ey+14,9,sc,'semibold'));

    // Terminal log line
    els.push(rect(sx+28,ey+50,W-72,20,BG,4));
    els.push(txt('›  '+r.log,sx+34,ey+54,9.5,TEXT2,'regular','left',W-78));

    els.push(txt(r.ts,sx+28,ey+76,9.5,TEXT2));
    if(r.dur!=='—') els.push(txt(r.dur,sx+W-44,ey+76,9.5,TEXT2));
  });

  return [...els,...nav(sx,2)];
}

// ── Screen 4: Stats (Analytics) ───────────────────────────────────────────────
function statsScreen(sx) {
  const els=[rect(sx,0,W,H,BG),...statusBar(sx),...header(sx,'Analytics','Last 7 days')];

  // Range tabs
  ['24h','7d','30d','90d'].forEach((r,i) => {
    const rw=48; const rx=sx+16+i*(rw+6);
    const active=i===1;
    els.push(rect(rx,122,rw,24,active?TEXT:SURF2,12));
    els.push(txt(r,rx+rw/2-r.length*3.8,129,11,active?BG:TEXT2,active?'bold':'regular'));
  });

  // 2x2 metric cards
  const metrics=[
    {label:'Total Runs',  value:'12,847',sub:'+18% vs last wk',up:true},
    {label:'Success Rate',value:'98.6%', sub:'-0.3% vs last wk',up:false},
    {label:'Avg Latency', value:'2.4s',  sub:'-12% vs last wk',up:true},
    {label:'Active Flows',value:'6',     sub:'2 paused',up:null},
  ];
  const mw=(W-48)/2;
  metrics.forEach((m,i)=>{
    const col=i%2; const row=Math.floor(i/2);
    const mx=sx+16+col*(mw+8);
    const my=158+row*90;
    els.push(rect(mx,my,mw,82,SURFACE,10));
    els.push(bordRect(mx,my,mw,82,10));
    els.push(txt(m.label,mx+12,my+12,10,TEXT2));
    els.push(txt(m.value,mx+12,my+30,22,TEXT,'bold'));
    const tc=m.up===null?TEXT2:m.up?ACCENT:ERROR;
    const ti=m.up===null?'':m.up?'↑ ':'↓ ';
    els.push(txt(ti+m.sub,mx+12,my+60,10,tc));
  });

  // Bar chart
  const chartY=342; const chartH=100; const chartW=W-32;
  const bars=[58,72,65,88,95,84,100];
  const days=['M','T','W','T','F','S','S'];
  const bw2=(chartW-40)/bars.length;

  els.push(rect(sx+16,chartY,chartW,chartH+48,SURFACE,10));
  els.push(bordRect(sx+16,chartY,chartW,chartH+48,10));
  els.push(txt('Daily Run Volume',sx+28,chartY+12,12,TEXT,'semibold'));

  [0.25,0.5,0.75,1].forEach(pct=>{
    const gy=chartY+30+chartH*(1-pct);
    els.push(line(sx+36,gy,sx+16+chartW-8,gy,BORDER,0.5));
  });

  bars.forEach((pct,i)=>{
    const bh=chartH*(pct/100);
    const bx=sx+36+i*bw2+2;
    const by=chartY+30+chartH-bh;
    const isToday=i===6;
    els.push(rect(bx,by,bw2-4,bh,isToday?ACCENT:'#C8EBD8',3));
    els.push(txt(days[i],bx,chartY+30+chartH+8,9,TEXT2,'regular','center',bw2-4));
  });

  // Agent perf table
  const tableY=chartY+chartH+64;
  els.push(txt('Agent Performance',sx+16,tableY,12,TEXT,'semibold'));
  ['Agent','Runs','Lat.','OK%'].forEach((h,i)=>{
    const xpos=[sx+16,sx+150,sx+232,sx+W-40];
    els.push(txt(h,xpos[i],tableY+18,10,TEXT2));
  });

  const agPerf=[
    {name:'Drafter',  runs:'4,201',lat:'3.1s',ok:'99.1%'},
    {name:'Verifier', runs:'3,847',lat:'1.8s',ok:'99.8%'},
    {name:'Intake',   runs:'2,912',lat:'0.9s',ok:'97.4%'},
  ];
  agPerf.forEach((a,i)=>{
    const ry=tableY+36+i*26;
    els.push(txt(a.name,sx+16,ry,12,TEXT,'semibold'));
    els.push(txt(a.runs,sx+150,ry,11,TEXT));
    els.push(txt(a.lat,sx+232,ry,11,TEXT));
    els.push(txt(a.ok,sx+W-40,ry,11,ACCENT,'semibold'));
    if(i<agPerf.length-1) els.push(line(sx+16,ry+18,sx+W-16,ry+18,BORDER,0.5));
  });

  return [...els,...nav(sx,3)];
}

// ── Screen 5: Config (Settings) ───────────────────────────────────────────────
function configScreen(sx) {
  const els=[rect(sx,0,W,H,BG),...statusBar(sx),...header(sx,'Config','Workspace: Acme Corp')];

  // Profile card
  const pcY=126;
  els.push(rect(sx+16,pcY,W-32,72,SURFACE,10));
  els.push(bordRect(sx+16,pcY,W-32,72,10));
  els.push(circ(sx+44,pcY+36,22,'#E6FAF1'));
  els.push(txt('A',sx+38,pcY+28,16,TEXT,'bold'));
  els.push(txt('Acme Corp',sx+74,pcY+20,14,TEXT,'semibold'));
  els.push(txt('Pro Plan · 8 agents · 50k runs/mo',sx+74,pcY+40,10,TEXT2));
  els.push(txt('Upgrade ›',sx+W-80,pcY+24,11,ACCENT,'semibold'));

  // Integrations
  const sy1=210;
  els.push(txt('Integrations',sx+16,sy1,12,TEXT2,'semibold'));
  els.push(line(sx+16,sy1+18,sx+W-16,sy1+18,BORDER,0.5));

  const integs=[
    {name:'Slack',      sub:'Connected · #wire-ops',  on:true},
    {name:'GitHub',     sub:'Connected · hyperio-mc', on:true},
    {name:'PostgreSQL', sub:'Not connected',           on:false},
    {name:'Zapier',     sub:'3 active zaps',           on:true},
  ];
  integs.forEach(({name,sub,on},i)=>{
    const iy=sy1+26+i*50;
    els.push(rect(sx+16,iy,W-32,44,SURFACE,8));
    els.push(bordRect(sx+16,iy,W-32,44,8));
    els.push(circ(sx+38,iy+22,14,on?'#E6FAF1':SURF2));
    els.push(txt(name[0],sx+32,iy+15,12,TEXT,'bold'));
    els.push(txt(name,sx+60,iy+10,13,TEXT,'semibold'));
    els.push(txt(sub,sx+60,iy+28,10,TEXT2));
    const tgx=sx+W-56; const tgBg=on?ACCENT:SURF2;
    els.push(rect(tgx,iy+11,40,22,tgBg,11));
    const knobX=on?tgx+40-20+2:tgx+2;
    els.push(circ(knobX+9,iy+22,9,SURFACE));
  });

  // API key
  const apiY=sy1+26+integs.length*50+14;
  els.push(txt('API & Webhooks',sx+16,apiY,12,TEXT2,'semibold'));
  els.push(line(sx+16,apiY+18,sx+W-16,apiY+18,BORDER,0.5));
  const keyY=apiY+26;
  els.push(rect(sx+16,keyY,W-32,44,SURF2,8));
  els.push(bordRect(sx+16,keyY,W-32,44,8));
  els.push(txt('sk-wire-••••••••••••••••••••••••••••',sx+28,keyY+14,11,TEXT2,'regular','left',W-90));
  els.push(txt('Copy',sx+W-56,keyY+14,11,ACCENT,'semibold'));

  // Danger zone
  const dzY=keyY+58;
  els.push(rect(sx+16,dzY,W-32,44,'#FFF4F4',8));
  els.push(bordRect(sx+16,dzY,W-32,44,8,'#F9C0C2',1));
  els.push(txt('Delete workspace',sx+28,dzY+14,13,ERROR,'semibold'));
  els.push(txt('This action cannot be undone',sx+28,dzY+30,10,'#C4727A'));

  return [...els,...nav(sx,4)];
}

// ── Assemble ─────────────────────────────────────────────────────────────────
const allEls = [];
[flowsScreen, agentsScreen, runsScreen, statsScreen, configScreen].forEach((fn,i) => {
  allEls.push(...fn(i*(W+GAP)));
});

const pen = {
  version: '2.8',
  name: 'Wire — AI Workflow Orchestration',
  description: 'Light-themed AI agent workflow platform. Warm cream palette (#F7F4EE) meets Neon-green (#00C97A) agent status indicators. Inspired by Neon.com agentic dev tooling + Midday.ai editorial warmth.',
  width: SCREENS*(W+GAP)-GAP,
  height: H,
  background: '#E8E4DA',
  elements: allEls,
  metadata: {
    designer: 'RAM Heartbeat',
    created: new Date().toISOString(),
    inspiration: ['neon.com','midday.ai','darkmodedesign.com','lapa.ninja'],
    theme: 'light',
    palette: {BG,SURFACE,TEXT,ACCENT,ACCENT2,BORDER},
  }
};

const out = path.join(__dirname,'wire.pen');
fs.writeFileSync(out, JSON.stringify(pen, null, 2));
console.log(`✓ wire.pen → ${Math.round(fs.statSync(out).size/1024)}KB, ${allEls.length} elements`);
