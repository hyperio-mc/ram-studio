'use strict';
const fs = require('fs'), path = require('path');

// ─── KILN: Build & Deploy Pipeline Monitor ────────────────────────────────
// Heartbeat #468 — Dark theme
// Inspired by:
//   · Awwwards research: warm-tone dark palettes entirely absent from dark dashboards
//     — all competitors use cool blue/purple/neon green. Warm amber on near-black = fresh.
//   · MICRODOT (siteinspire): "clinical reference codes" as metadata aesthetic
//     (M. WORK 2508 187) — dashboard logic applied to creative work
//   · NNGroup "AI Agents as Users": semantic labels, descriptive text on all interactive
//     elements — building in agent-legibility as a first-class concern
//   · Inter Tight (condensed grotesque) — Awwwards' own type choice for data-dense UI
// ─────────────────────────────────────────────────────────────────────────────

const SLUG = 'kiln';
const W = 390, H = 844;

// ─── PALETTE ─────────────────────────────────────────────────────────────────
// Warm near-black — undertone is a smouldering brown (#120F0A)
// Against the entire cool-dark-dashboard landscape, warm reads as foundry/craft
const BASE   = '#120F0A';   // kiln dark — warm near-black
const SURF   = '#1C1711';   // surface — scorched wood
const CARD   = '#262018';   // card — slightly lighter warm
const BORDER = '#38301F';   // border — warm separation
const TEXT   = '#F5EDD8';   // text — warm off-white (not cold white)
const TEXT2  = '#A89878';   // secondary — muted amber-grey
const MUTED  = '#5C5040';   // muted — dark warm
const AMBER  = '#F59E0B';   // amber — primary accent (kiln fire)
const AMBER_L = '#2A1F08';  // amber tint bg
const AMBER_M = '#7C5209';  // amber mid
const GREEN  = '#22C55E';   // success — warm green (not neon)
const GREEN_L = '#0A1F0F';  // green tint bg
const RED    = '#EF4444';   // failure — universal
const RED_L  = '#1F0808';   // red tint bg
const YELLOW = '#EAB308';   // warning
const BLUE   = '#60A5FA';   // info / running
const BLUE_L = '#0A1020';   // blue tint bg
const MONO   = 'JetBrains Mono,Menlo,monospace';
const TIGHT  = 'Inter Tight,Inter,sans-serif'; // condensed grotesque

function rect(x,y,w,h,fill,opts={}) {
  return { type:'rect', x, y, w, h, fill, ...opts };
}
function text(x,y,content,size,fill,opts={}) {
  return { type:'text', x, y, content: String(content), size, fill, ...opts };
}
function circle(cx,cy,r,fill,opts={}) {
  return { type:'circle', cx, cy, r, fill, ...opts };
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  return { type:'line', x1, y1, x2, y2, stroke, ...opts };
}

const NAV_Y = H - 72;

// Status dot component
function statusDot(x,y,status) {
  const cols = { success:GREEN, failed:RED, running:BLUE, pending:MUTED, warning:YELLOW };
  return circle(x, y, 4, cols[status] || MUTED);
}

// Code-style label (MICRODOT clinical reference aesthetic)
function codeLabel(x,y,content,col) {
  return text(x,y,content,9,col||TEXT2,{font:MONO,fw:500,ls:0.5});
}

// ────────────────────────────────────────────────
// SCREEN 1: PIPELINE OVERVIEW
// ────────────────────────────────────────────────
function buildPipeline() {
  const s = [];
  s.push(rect(0,0,W,H,BASE));

  // Status bar
  s.push(rect(0,0,W,44,BASE));
  s.push(text(16,28,'9:41',15,TEXT,{fw:600}));
  s.push(text(W-16,28,'●●●  ◆  88%',12,TEXT,{anchor:'end'}));

  // Header
  s.push(text(20,68,'KILN',11,AMBER,{fw:800,ls:3,font:TIGHT}));
  s.push(text(20,96,'Pipeline',30,TEXT,{fw:800,font:TIGHT}));

  // Repo + branch chip
  s.push(rect(20,108,W-40,28,CARD,{rx:6}));
  s.push(codeLabel(30,126,'hyperio-mc/ram-studio',TEXT2));
  s.push(rect(W-80,111,60,22,AMBER_L,{rx:4}));
  s.push(text(W-50,125,'main',10,AMBER,{anchor:'middle',fw:700,font:MONO}));

  // Summary stats row
  s.push(line(20,144,W-20,144,BORDER,{sw:0.5}));
  const sumStats = [
    {label:'BUILDS TODAY',val:'47',col:TEXT},
    {label:'SUCCESS',val:'41',col:GREEN},
    {label:'FAILED',val:'4',col:RED},
    {label:'RUNNING',val:'2',col:BLUE},
  ];
  sumStats.forEach((ss,i)=>{
    const sx = 20+i*90;
    s.push(text(sx,164,ss.label,8,TEXT2,{fw:600,ls:1,font:TIGHT}));
    s.push(text(sx,184,ss.val,22,ss.col,{fw:800,font:TIGHT}));
  });
  s.push(line(20,200,W-20,200,BORDER,{sw:0.5}));

  // Build list
  const builds = [
    {id:'#2847',branch:'main',msg:'feat: add agent spawn endpoint',status:'success',dur:'3m 12s',ago:'2m ago',by:'rakis'},
    {id:'#2846',branch:'feat/claw-v2',msg:'fix: resolve context overflow on long runs',status:'running',dur:'1m 44s',ago:'live',by:'ram'},
    {id:'#2845',branch:'main',msg:'chore: bump dependency versions',status:'success',dur:'2m 58s',ago:'18m ago',by:'rakis'},
    {id:'#2844',branch:'feat/claw-v2',msg:'wip: streaming token counter',status:'failed',dur:'0m 42s',ago:'31m ago',by:'ram'},
    {id:'#2843',branch:'hotfix/auth',msg:'fix: jwt refresh race condition',status:'success',dur:'1m 20s',ago:'1h ago',by:'rakis'},
    {id:'#2842',branch:'main',msg:'feat: lobster fleet health endpoint',status:'success',dur:'4m 03s',ago:'2h ago',by:'ram'},
  ];

  builds.forEach((b,i)=>{
    const by = 210+i*103;
    const statusCol = {success:GREEN,failed:RED,running:BLUE,pending:MUTED}[b.status];
    const statusBg  = {success:GREEN_L,failed:RED_L,running:BLUE_L,pending:BASE}[b.status];

    // Card
    s.push(rect(20,by,W-40,93,CARD,{rx:10}));
    // Left accent strip
    s.push(rect(20,by,3,93,statusCol,{rx:2}));

    // Build ID + status
    s.push(codeLabel(32,by+16,b.id,AMBER));
    s.push(rect(W-60,by+8,50,18,statusBg,{rx:5}));
    s.push(text(W-35,by+20,b.status,9,statusCol,{anchor:'middle',fw:700,font:MONO}));

    // Branch chip
    s.push(rect(60,by+8,b.branch.length*6.5+10,18,SURF,{rx:4}));
    s.push(text(65,by+20,b.branch,9,TEXT2,{font:MONO}));

    // Commit message
    const msgTrunc = b.msg.length>44?b.msg.slice(0,41)+'…':b.msg;
    s.push(text(32,by+40,msgTrunc,12,TEXT,{fw:500}));

    // Meta row
    s.push(codeLabel(32,by+58,'⏱ '+b.dur,TEXT2));
    s.push(codeLabel(110,by+58,b.ago,MUTED));
    s.push(codeLabel(W-30,by+58,'@'+b.by,TEXT2));

    // Pipeline stage dots
    const stages = ['lint','test','build','deploy'];
    const completedCount = b.status==='success'?4:b.status==='running'?2:b.status==='failed'?2:0;
    stages.forEach((st,si)=>{
      const sdx = 32+si*52;
      const done = si<completedCount;
      const active = si===completedCount && b.status==='running';
      s.push(circle(sdx,by+76,3,done?GREEN:active?BLUE:MUTED));
      if(si<3) s.push(line(sdx+3,by+76,sdx+49,by+76,done?GREEN:MUTED,{sw:0.8}));
    });
    s.push(text(32,by+90,'lint',7,MUTED,{font:TIGHT}));
    s.push(text(84,by+90,'test',7,MUTED,{font:TIGHT}));
    s.push(text(132,by+90,'build',7,MUTED,{font:TIGHT}));
    s.push(text(180,by+90,'deploy',7,MUTED,{font:TIGHT}));
  });

  // Bottom nav
  s.push(rect(0,NAV_Y,W,72,SURF));
  s.push(line(0,NAV_Y,W,NAV_Y,BORDER,{sw:0.5}));
  const nav = [{l:'Pipeline',x:48},{l:'Deploys',x:130},{l:'Logs',x:212},{l:'Metrics',x:294},{l:'Config',x:358}];
  nav.forEach((n,i)=>{
    const active=i===0;
    s.push(rect(n.x-20,NAV_Y+8,40,3,active?AMBER:MUTED,{rx:1.5,opacity:active?1:0}));
    s.push(circle(n.x,NAV_Y+28,2,active?AMBER:MUTED));
    s.push(text(n.x,NAV_Y+52,n.l,10,active?AMBER:TEXT2,{anchor:'middle',fw:active?700:400,font:TIGHT}));
  });

  return s;
}

// ────────────────────────────────────────────────
// SCREEN 2: BUILD DETAIL
// ────────────────────────────────────────────────
function buildDetail() {
  const s = [];
  s.push(rect(0,0,W,H,BASE));

  s.push(rect(0,0,W,44,BASE));
  s.push(text(16,28,'9:41',15,TEXT,{fw:600}));
  s.push(text(W-16,28,'●●●  ◆  88%',12,TEXT,{anchor:'end'}));

  // Back + header
  s.push(text(20,70,'← Pipeline',12,AMBER,{fw:600}));
  s.push(text(20,100,'Build #2846',26,TEXT,{fw:800,font:TIGHT}));

  // Status banner
  s.push(rect(20,114,W-40,36,BLUE_L,{rx:8}));
  s.push(circle(34,132,5,BLUE));
  s.push(text(46,136,'RUNNING — 1m 44s elapsed',12,BLUE,{fw:700,font:TIGHT}));

  // Meta grid
  s.push(line(20,158,W-20,158,BORDER,{sw:0.5}));
  const metas = [
    {label:'BRANCH',val:'feat/claw-v2'},
    {label:'COMMIT',val:'a3f7c2d'},
    {label:'TRIGGERED BY',val:'@ram'},
    {label:'QUEUE TIME',val:'0m 04s'},
    {label:'RUNNER',val:'ubuntu-22-04-x64'},
    {label:'REGION',val:'us-east-1'},
  ];
  metas.forEach((m,i)=>{
    const mx = i%2===0?20:W/2+10;
    const my = 170+Math.floor(i/2)*44;
    s.push(text(mx,my,m.label,8,TEXT2,{fw:600,ls:1.5,font:TIGHT}));
    s.push(codeLabel(mx,my+18,m.val,TEXT));
  });
  s.push(line(20,302,W-20,302,BORDER,{sw:0.5}));

  // Stage timeline
  s.push(text(20,322,'STAGES',9,TEXT2,{fw:700,ls:2,font:TIGHT}));
  const stages2 = [
    {name:'lint',status:'success',dur:'0m 22s'},
    {name:'test',status:'running',dur:'1m 22s+'},
    {name:'build',status:'pending',dur:'—'},
    {name:'deploy',status:'pending',dur:'—'},
  ];
  const stageW = (W-48)/4;
  stages2.forEach((st,i)=>{
    const stx = 20+i*(stageW+4);
    const stCol = {success:GREEN,running:BLUE,pending:MUTED,failed:RED}[st.status];
    const stBg  = {success:GREEN_L,running:BLUE_L,pending:CARD,failed:RED_L}[st.status];
    s.push(rect(stx,336,stageW,56,stBg,{rx:8}));
    s.push(circle(stx+stageW/2,348,5,stCol));
    if(i<3) s.push(line(stx+stageW,359,stx+stageW+4,359,MUTED,{sw:1}));
    s.push(text(stx+stageW/2,368,st.name,9,TEXT,{anchor:'middle',fw:600,font:TIGHT}));
    s.push(codeLabel(stx+stageW/2,384,st.dur,stCol));
    // align center
    const durLen = st.dur.length;
    // already using anchor... remove manual offset
  });

  // Currently running step
  s.push(line(20,402,W-20,402,BORDER,{sw:0.5}));
  s.push(text(20,420,'RUNNING STEP',9,TEXT2,{fw:700,ls:2,font:TIGHT}));
  s.push(rect(20,432,W-40,44,CARD,{rx:8}));
  s.push(circle(34,454,4,BLUE));
  s.push(text(46,450,'Running integration tests',13,TEXT,{fw:600}));
  s.push(codeLabel(46,466,'test/integration/agent-spawn.test.ts',TEXT2));

  // Progress bar
  s.push(rect(20,484,W-40,6,SURF,{rx:3}));
  s.push(rect(20,484,(W-40)*0.62,6,BLUE,{rx:3}));
  s.push(codeLabel(20,500,'62% · 31/50 tests passed',TEXT2));
  s.push(codeLabel(W-20,500,'18 remaining',MUTED));

  // Recent log lines
  s.push(line(20,512,W-20,512,BORDER,{sw:0.5}));
  s.push(text(20,530,'LOG TAIL',9,TEXT2,{fw:700,ls:2,font:TIGHT}));
  const logLines = [
    {t:'09:41:22',level:'INFO',msg:'✓ agent-spawn: context isolation verified',col:GREEN},
    {t:'09:41:20',level:'INFO',msg:'✓ agent-spawn: tool budget enforced',col:GREEN},
    {t:'09:41:18',level:'WARN',msg:'⚠ memory usage 87% — near threshold',col:YELLOW},
    {t:'09:41:15',level:'INFO',msg:'→ Running agent-spawn integration suite',col:TEXT2},
    {t:'09:41:12',level:'INFO',msg:'✓ auth: jwt refresh race condition fixed',col:GREEN},
  ];
  logLines.forEach((l,i)=>{
    const ly = 542+i*38;
    s.push(rect(20,ly,W-40,32,CARD,{rx:4}));
    s.push(codeLabel(28,ly+12,l.t,MUTED));
    const levelCol = {INFO:BLUE,WARN:YELLOW,ERROR:RED}[l.level];
    s.push(rect(72,ly+6,30,16,BASE,{rx:3}));
    s.push(text(87,ly+16,l.level,8,levelCol,{anchor:'middle',fw:700,font:MONO}));
    const msgT = l.msg.length>38?l.msg.slice(0,35)+'…':l.msg;
    s.push(codeLabel(108,ly+20,msgT,l.col));
  });

  // Nav
  s.push(rect(0,NAV_Y,W,72,SURF));
  s.push(line(0,NAV_Y,W,NAV_Y,BORDER,{sw:0.5}));
  const nav = [{l:'Pipeline',x:48},{l:'Deploys',x:130},{l:'Logs',x:212},{l:'Metrics',x:294},{l:'Config',x:358}];
  nav.forEach((n,i)=>{
    s.push(rect(n.x-20,NAV_Y+8,40,3,MUTED,{rx:1.5,opacity:0}));
    s.push(circle(n.x,NAV_Y+28,2,MUTED));
    s.push(text(n.x,NAV_Y+52,n.l,10,TEXT2,{anchor:'middle',font:TIGHT}));
  });

  return s;
}

// ────────────────────────────────────────────────
// SCREEN 3: LIVE LOGS
// ────────────────────────────────────────────────
function buildLogs() {
  const s = [];
  s.push(rect(0,0,W,H,BASE));

  s.push(rect(0,0,W,44,BASE));
  s.push(text(16,28,'9:41',15,TEXT,{fw:600}));
  s.push(text(W-16,28,'●●●  ◆  88%',12,TEXT,{anchor:'end'}));

  // Header
  s.push(text(20,68,'LOGS',11,AMBER,{fw:800,ls:3,font:TIGHT}));
  s.push(text(20,96,'Live Stream',28,TEXT,{fw:800,font:TIGHT}));

  // Filter bar
  s.push(rect(20,112,W-40,32,CARD,{rx:8}));
  s.push(codeLabel(32,130,'#2846 · feat/claw-v2 · all levels',TEXT2));
  s.push(rect(W-54,116,36,24,AMBER_L,{rx:5}));
  s.push(text(W-36,130,'▼',10,AMBER,{anchor:'middle'}));

  // Level filter chips
  const levelChips = [{l:'ALL',active:true},{l:'INFO'},{l:'WARN'},{l:'ERROR'}];
  let lcx = 20;
  levelChips.forEach(lc=>{
    const lcw = lc.l.length*8+16;
    s.push(rect(lcx,152,lcw,22,lc.active?AMBER_L:CARD,{rx:5}));
    s.push(text(lcx+lcw/2,165,lc.l,9,lc.active?AMBER:TEXT2,{anchor:'middle',fw:lc.active?700:400,font:MONO}));
    lcx+=lcw+6;
  });

  // Live indicator
  s.push(circle(W-32,163,4,RED));
  s.push(text(W-22,167,'LIVE',8,RED,{fw:700,font:TIGHT}));

  // Log entries (terminal style)
  s.push(rect(20,182,W-40,H-182-72,SURF,{rx:10}));
  const fullLogs = [
    {t:'09:41:22.814',level:'INFO', msg:'✓ context isolation verified — budget: 8192 tok'},
    {t:'09:41:22.401',level:'INFO', msg:'✓ tool budget enforced — max_calls: 50'},
    {t:'09:41:21.988',level:'WARN', msg:'⚠ memory 87% — approaching limit (threshold: 90%)'},
    {t:'09:41:21.203',level:'INFO', msg:'→ test 31/50: agent-spawn/isolation.test.ts'},
    {t:'09:41:20.774',level:'INFO', msg:'✓ jwt refresh: race condition resolved'},
    {t:'09:41:20.102',level:'INFO', msg:'→ test 30/50: auth/refresh-token.test.ts'},
    {t:'09:41:19.556',level:'INFO', msg:'✓ claw-v2: spawn endpoint returns 202'},
    {t:'09:41:18.901',level:'DEBUG',msg:'  payload: { role: "analyst", budget: 4096 }'},
    {t:'09:41:18.205',level:'INFO', msg:'→ test 29/50: agent/claw-spawn.test.ts'},
    {t:'09:41:17.450',level:'INFO', msg:'✓ fleet health: segment calculation correct'},
    {t:'09:41:16.780',level:'ERROR',msg:'✗ test 28/50 FAILED: token count mismatch'},
    {t:'09:41:16.100',level:'INFO', msg:'→ test 28/50: agent/token-counter.test.ts'},
    {t:'09:41:15.320',level:'INFO', msg:'✓ rate limiter: 100 req/s enforced'},
  ];
  fullLogs.forEach((l,i)=>{
    const ly = 192+i*43;
    if(ly > H-72-20) return;
    const levelCol = {INFO:BLUE,WARN:YELLOW,ERROR:RED,DEBUG:MUTED}[l.level]||TEXT2;
    // timestamp
    s.push(codeLabel(28,ly+12,l.t,MUTED));
    // level badge
    const badgeW = l.level==='DEBUG'?34:l.level==='ERROR'?34:26;
    s.push(rect(108,ly+4,badgeW,16,BASE,{rx:3}));
    s.push(text(108+badgeW/2,ly+14,l.level,7,levelCol,{anchor:'middle',fw:700,font:MONO}));
    // message
    const msgT = l.msg.length>34?l.msg.slice(0,31)+'…':l.msg;
    s.push(codeLabel(148,ly+14,msgT,i===0?TEXT:i===10?RED:i===2?YELLOW:TEXT2));
    if(i<fullLogs.length-1) s.push(line(28,ly+30,W-28,ly+30,BORDER,{sw:0.3}));
  });

  // Cursor blink (last line)
  s.push(rect(28,192+fullLogs.length*43-10,6,12,AMBER,{opacity:0.8}));

  // Nav
  s.push(rect(0,NAV_Y,W,72,SURF));
  s.push(line(0,NAV_Y,W,NAV_Y,BORDER,{sw:0.5}));
  const nav = [{l:'Pipeline',x:48},{l:'Deploys',x:130},{l:'Logs',x:212},{l:'Metrics',x:294},{l:'Config',x:358}];
  nav.forEach((n,i)=>{
    const active=i===2;
    s.push(rect(n.x-20,NAV_Y+8,40,3,active?AMBER:MUTED,{rx:1.5,opacity:active?1:0}));
    s.push(circle(n.x,NAV_Y+28,2,active?AMBER:MUTED));
    s.push(text(n.x,NAV_Y+52,n.l,10,active?AMBER:TEXT2,{anchor:'middle',fw:active?700:400,font:TIGHT}));
  });

  return s;
}

// ────────────────────────────────────────────────
// SCREEN 4: DEPLOYMENTS
// ────────────────────────────────────────────────
function buildDeploys() {
  const s = [];
  s.push(rect(0,0,W,H,BASE));

  s.push(rect(0,0,W,44,BASE));
  s.push(text(16,28,'9:41',15,TEXT,{fw:600}));
  s.push(text(W-16,28,'●●●  ◆  88%',12,TEXT,{anchor:'end'}));

  s.push(text(20,68,'KILN',11,AMBER,{fw:800,ls:3,font:TIGHT}));
  s.push(text(20,96,'Deployments',28,TEXT,{fw:800,font:TIGHT}));

  // Environment tabs
  const envTabs = ['Production','Staging','Preview','Dev'];
  let etx = 20;
  envTabs.forEach((et,i)=>{
    const etw = et.length*8+16;
    s.push(rect(etx,110,etw,26,i===0?AMBER_L:CARD,{rx:6}));
    s.push(text(etx+etw/2,125,et,10,i===0?AMBER:TEXT2,{anchor:'middle',fw:i===0?700:400,font:TIGHT}));
    etx+=etw+6;
  });

  // Current production deploy card (prominent)
  s.push(rect(20,146,W-40,100,CARD,{rx:12}));
  s.push(rect(20,146,W-40,100,'none',{rx:12,stroke:GREEN,sw:1,opacity:0.4}));
  s.push(circle(34,166,6,GREEN));
  s.push(text(46,170,'LIVE',10,GREEN,{fw:800,font:TIGHT}));
  s.push(codeLabel(W-20,166,'prod-us-east-1',TEXT2));
  s.push(text(20,190,'v2.14.1 — main',18,TEXT,{fw:700,font:TIGHT}));
  s.push(codeLabel(20,212,'feat: lobster fleet health endpoint · @ram · a3f7c2d',TEXT2));
  const depStats = [{l:'DEPLOYED',v:'2h ago'},{l:'BUILD',v:'#2843'},{l:'UPTIME',v:'99.98%'}];
  depStats.forEach((ds,i)=>{
    s.push(text(20+i*118,232,ds.l,8,TEXT2,{fw:600,ls:1,font:TIGHT}));
    s.push(codeLabel(20+i*118,244,ds.v,AMBER));
  });

  // Deploy history
  s.push(line(20,258,W-20,258,BORDER,{sw:0.5}));
  s.push(text(20,276,'HISTORY',9,TEXT2,{fw:700,ls:2,font:TIGHT}));

  const deploys = [
    {ver:'v2.14.1',env:'prod',status:'live',   commit:'a3f7c2d',msg:'feat: lobster fleet health',ago:'2h ago'},
    {ver:'v2.14.0',env:'prod',status:'success', commit:'b9e1f3a',msg:'feat: agent spawn endpoint', ago:'1d ago'},
    {ver:'v2.13.5',env:'prod',status:'success', commit:'c4d2e8b',msg:'fix: jwt refresh race',      ago:'2d ago'},
    {ver:'v2.13.4',env:'prod',status:'rolled',  commit:'f1a5c9e',msg:'chore: update deps',         ago:'3d ago'},
    {ver:'v2.13.3',env:'prod',status:'success', commit:'d7b3f2c',msg:'feat: token streaming',      ago:'4d ago'},
  ];
  deploys.forEach((d,i)=>{
    const dy = 290+i*86;
    const statusCol = {live:GREEN,success:GREEN,rolled:YELLOW,failed:RED}[d.status];
    const statusBg  = {live:GREEN_L,success:GREEN_L,rolled:AMBER_L,failed:RED_L}[d.status];
    s.push(rect(20,dy,W-40,76,CARD,{rx:10}));
    s.push(rect(20,dy,3,76,statusCol,{rx:2}));
    s.push(codeLabel(32,dy+14,d.ver,AMBER));
    s.push(rect(80,dy+6,50,16,statusBg,{rx:4}));
    s.push(text(105,dy+16,d.status.toUpperCase(),8,statusCol,{anchor:'middle',fw:700,font:MONO}));
    s.push(codeLabel(W-20,dy+14,d.ago,MUTED));
    s.push(text(32,dy+36,d.msg,13,TEXT,{fw:500}));
    s.push(codeLabel(32,dy+56,d.commit+'  ·  '+d.env,TEXT2));
  });

  // Nav
  s.push(rect(0,NAV_Y,W,72,SURF));
  s.push(line(0,NAV_Y,W,NAV_Y,BORDER,{sw:0.5}));
  const nav = [{l:'Pipeline',x:48},{l:'Deploys',x:130},{l:'Logs',x:212},{l:'Metrics',x:294},{l:'Config',x:358}];
  nav.forEach((n,i)=>{
    const active=i===1;
    s.push(rect(n.x-20,NAV_Y+8,40,3,active?AMBER:MUTED,{rx:1.5,opacity:active?1:0}));
    s.push(circle(n.x,NAV_Y+28,2,active?AMBER:MUTED));
    s.push(text(n.x,NAV_Y+52,n.l,10,active?AMBER:TEXT2,{anchor:'middle',fw:active?700:400,font:TIGHT}));
  });

  return s;
}

// ────────────────────────────────────────────────
// SCREEN 5: METRICS
// ────────────────────────────────────────────────
function buildMetrics() {
  const s = [];
  s.push(rect(0,0,W,H,BASE));

  s.push(rect(0,0,W,44,BASE));
  s.push(text(16,28,'9:41',15,TEXT,{fw:600}));
  s.push(text(W-16,28,'●●●  ◆  88%',12,TEXT,{anchor:'end'}));

  s.push(text(20,68,'KILN',11,AMBER,{fw:800,ls:3,font:TIGHT}));
  s.push(text(20,96,'Metrics',28,TEXT,{fw:800,font:TIGHT}));

  // Time range chips
  const ranges = ['1h','6h','24h','7d','30d'];
  let rx2 = 20;
  ranges.forEach((r,i)=>{
    const rw = r.length*8+16;
    s.push(rect(rx2,110,rw,22,i===2?AMBER:CARD,{rx:5}));
    s.push(text(rx2+rw/2,123,r,10,i===2?BASE:TEXT2,{anchor:'middle',fw:i===2?800:400,font:MONO}));
    rx2+=rw+6;
  });

  // KPI row
  const kpis = [
    {label:'BUILD SUCCESS',val:'87.2%',trend:'↑ 3.4%',up:true},
    {label:'AVG BUILD TIME',val:'2m 41s',trend:'↓ 0.8s',up:true},
  ];
  kpis.forEach((k,i)=>{
    const kx = 20+i*(W/2-16);
    const kw = W/2-26;
    s.push(rect(kx,140,kw,68,CARD,{rx:10}));
    s.push(text(kx+10,160,k.label,8,TEXT2,{fw:600,ls:1,font:TIGHT}));
    s.push(text(kx+10,186,k.val,24,TEXT,{fw:800,font:TIGHT}));
    s.push(text(kx+10,204,k.trend,10,k.up?GREEN:RED,{fw:600}));
  });

  // Build success chart (bar chart)
  s.push(line(20,218,W-20,218,BORDER,{sw:0.5}));
  s.push(text(20,234,'BUILD SUCCESS RATE',9,TEXT2,{fw:700,ls:2,font:TIGHT}));
  s.push(codeLabel(W-20,234,'24h · hourly',MUTED));

  const GX2=24, GY2=250, GW2=W-48, GH2=100;
  const bars = [78,85,92,88,95,82,90,87,91,94,89,86,93,88,97,91,85,88,92,90,95,87,94,87];
  const bw = GW2/bars.length - 2;
  bars.forEach((b,i)=>{
    const bh = (b/100)*GH2;
    const bx = GX2+i*(bw+2);
    const by = GY2+GH2-bh;
    const isRecent = i>=22;
    s.push(rect(bx,by,bw,bh,isRecent?AMBER:SURF,{rx:2,opacity:isRecent?0.9:0.5}));
  });
  // X axis
  s.push(line(GX2,GY2+GH2,GX2+GW2,GY2+GH2,BORDER,{sw:0.5}));
  s.push(codeLabel(GX2,GY2+GH2+12,'00:00',MUTED));
  s.push(codeLabel(GX2+GW2/2,GY2+GH2+12,'12:00',MUTED));
  s.push(codeLabel(GX2+GW2,GY2+GH2+12,'now',AMBER));

  // Failure analysis
  s.push(line(20,376,W-20,376,BORDER,{sw:0.5}));
  s.push(text(20,394,'FAILURE BREAKDOWN',9,TEXT2,{fw:700,ls:2,font:TIGHT}));

  const failures = [
    {reason:'Test failures',count:8,pct:0.53,col:RED},
    {reason:'Build errors',count:4,pct:0.27,col:YELLOW},
    {reason:'Timeout',count:2,pct:0.13,col:MUTED},
    {reason:'Runner error',count:1,pct:0.07,col:MUTED},
  ];
  failures.forEach((f,i)=>{
    const fy=406+i*44;
    s.push(text(20,fy+14,f.reason,13,TEXT,{fw:500}));
    s.push(text(W-20,fy+10,String(f.count),16,f.col,{anchor:'end',fw:800,font:TIGHT}));
    s.push(rect(20,fy+22,W-40,6,SURF,{rx:3}));
    s.push(rect(20,fy+22,(W-40)*f.pct,6,f.col,{rx:3}));
    if(i<3) s.push(line(20,fy+36,W-20,fy+36,BORDER,{sw:0.3}));
  });

  // Run velocity
  s.push(line(20,582,W-20,582,BORDER,{sw:0.5}));
  s.push(text(20,600,'DAILY RUN VELOCITY',9,TEXT2,{fw:700,ls:2,font:TIGHT}));
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const vols  = [38,   52,   61,   47,  58,   21,   12 ];
  days.forEach((d,i)=>{
    const vx=24+i*50, vy=634;
    s.push(rect(vx,vy-(vols[i]/65)*60,28,( vols[i]/65)*60,i===6?AMBER:SURF,{rx:4,opacity:i===6?0.9:0.45}));
    s.push(text(vx+14,640+10,d,8,i===6?AMBER:TEXT2,{anchor:'middle',font:TIGHT}));
    s.push(codeLabel(vx+14,vy-(vols[i]/65)*60-8,String(vols[i]),i===6?AMBER:MUTED));
  });
  s.push(line(20,640,W-20,640,BORDER,{sw:0.5}));

  // Nav
  s.push(rect(0,NAV_Y,W,72,SURF));
  s.push(line(0,NAV_Y,W,NAV_Y,BORDER,{sw:0.5}));
  const nav = [{l:'Pipeline',x:48},{l:'Deploys',x:130},{l:'Logs',x:212},{l:'Metrics',x:294},{l:'Config',x:358}];
  nav.forEach((n,i)=>{
    const active=i===3;
    s.push(rect(n.x-20,NAV_Y+8,40,3,active?AMBER:MUTED,{rx:1.5,opacity:active?1:0}));
    s.push(circle(n.x,NAV_Y+28,2,active?AMBER:MUTED));
    s.push(text(n.x,NAV_Y+52,n.l,10,active?AMBER:TEXT2,{anchor:'middle',fw:active?700:400,font:TIGHT}));
  });

  return s;
}

// ────────────────────────────────────────────────
// SCREEN 6: CONFIG / SETTINGS
// ────────────────────────────────────────────────
function buildConfig() {
  const s = [];
  s.push(rect(0,0,W,H,BASE));

  s.push(rect(0,0,W,44,BASE));
  s.push(text(16,28,'9:41',15,TEXT,{fw:600}));
  s.push(text(W-16,28,'●●●  ◆  88%',12,TEXT,{anchor:'end'}));

  s.push(text(20,68,'KILN',11,AMBER,{fw:800,ls:3,font:TIGHT}));
  s.push(text(20,96,'Config',28,TEXT,{fw:800,font:TIGHT}));

  // Repo info card
  s.push(rect(20,112,W-40,60,CARD,{rx:10}));
  s.push(circle(36,132,8,AMBER));
  s.push(text(36,136,'K',9,BASE,{anchor:'middle',fw:800}));
  s.push(text(54,126,'hyperio-mc/ram-studio',14,TEXT,{fw:700}));
  s.push(codeLabel(54,142,'Connected · github.com/apps/kiln',GREEN));
  s.push(codeLabel(W-28,136,'●',GREEN));

  // Settings sections
  const sections = [
    {
      title:'PIPELINE',
      rows:[
        {label:'Default branch',val:'main',mono:true},
        {label:'Auto-deploy on push',val:'ON',toggle:true,col:GREEN},
        {label:'Parallel jobs',val:'4',mono:true},
        {label:'Build timeout',val:'10m',mono:true},
        {label:'Cache dependencies',val:'ON',toggle:true,col:GREEN},
      ]
    },
    {
      title:'NOTIFICATIONS',
      rows:[
        {label:'On failure',val:'ON',toggle:true,col:GREEN},
        {label:'On deploy',val:'ON',toggle:true,col:GREEN},
        {label:'Digest frequency',val:'daily',mono:true},
      ]
    },
    {
      title:'RUNNERS',
      rows:[
        {label:'Default runner',val:'ubuntu-22-04-x64',mono:true},
        {label:'Region',val:'us-east-1',mono:true},
        {label:'Max concurrent',val:'8',mono:true},
      ]
    },
  ];

  let sy=184;
  sections.forEach(sec=>{
    s.push(text(20,sy,sec.title,9,TEXT2,{fw:700,ls:2,font:TIGHT}));
    sy+=14;
    s.push(rect(20,sy,W-40,sec.rows.length*40,CARD,{rx:10}));
    sec.rows.forEach((row,ri)=>{
      const ry=sy+ri*40;
      s.push(text(32,ry+22,row.label,13,TEXT,{fw:400}));
      if(row.toggle){
        s.push(rect(W-62,ry+12,40,18,row.val==='ON'?GREEN_L:CARD,{rx:9}));
        s.push(circle(row.val==='ON'?W-28:W-50,ry+21,7,row.val==='ON'?GREEN:MUTED));
      } else {
        s.push(codeLabel(W-28,ry+22,row.val,TEXT2));
      }
      if(ri<sec.rows.length-1) s.push(line(32,ry+40,W-32,ry+40,BORDER,{sw:0.3}));
    });
    sy+=sec.rows.length*40+16;
  });

  // Danger zone
  s.push(rect(20,sy,W-40,2,RED,{opacity:0.3}));
  sy+=10;
  s.push(text(20,sy+8,'DANGER ZONE',9,RED,{fw:700,ls:2,font:TIGHT}));
  sy+=20;
  s.push(rect(20,sy,W-40,40,RED_L,{rx:8}));
  s.push(rect(20,sy,W-40,40,'none',{rx:8,stroke:RED,sw:0.5,opacity:0.4}));
  s.push(text(32,sy+24,'Delete All Build History',13,RED,{fw:600}));
  s.push(text(W-32,sy+24,'→',14,RED,{anchor:'end'}));

  // Nav
  s.push(rect(0,NAV_Y,W,72,SURF));
  s.push(line(0,NAV_Y,W,NAV_Y,BORDER,{sw:0.5}));
  const nav = [{l:'Pipeline',x:48},{l:'Deploys',x:130},{l:'Logs',x:212},{l:'Metrics',x:294},{l:'Config',x:358}];
  nav.forEach((n,i)=>{
    const active=i===4;
    s.push(rect(n.x-20,NAV_Y+8,40,3,active?AMBER:MUTED,{rx:1.5,opacity:active?1:0}));
    s.push(circle(n.x,NAV_Y+28,2,active?AMBER:MUTED));
    s.push(text(n.x,NAV_Y+52,n.l,10,active?AMBER:TEXT2,{anchor:'middle',fw:active?700:400,font:TIGHT}));
  });

  return s;
}

// ────────────────────────────────────────────────
// ASSEMBLE
// ────────────────────────────────────────────────
const screens = [
  { name:'Pipeline', elements: buildPipeline() },
  { name:'Build',    elements: buildDetail()   },
  { name:'Logs',     elements: buildLogs()     },
  { name:'Deploys',  elements: buildDeploys()  },
  { name:'Metrics',  elements: buildMetrics()  },
  { name:'Config',   elements: buildConfig()   },
];

const total = screens.reduce((a,sc)=>a+sc.elements.length,0);

const pen = {
  version:'2.8',
  metadata:{
    name:'KILN',
    author:'RAM',
    date:new Date().toISOString().split('T')[0],
    theme:'dark',
    heartbeat:468,
    elements:total,
    description:"Build & deploy pipeline monitor. Warm near-black base (#120F0A smouldering brown undertone) with amber accent — counter to the ubiquitous cool-dark dashboard aesthetic. Inter Tight for all labels (condensed grotesque per Awwwards own UI), JetBrains Mono for all values. MICRODOT-inspired clinical reference codes (build IDs, commit hashes, timestamps) as primary data elements. Designed for agent-legibility per NNGroup 'AI Agents as Users' — semantic text on all interactive elements.",
  },
  screens: screens.map(sc=>({ name:sc.name, svg:`${W}x${H}`, elements:sc.elements })),
};

fs.writeFileSync(path.join(__dirname,`${SLUG}.pen`), JSON.stringify(pen,null,2));
console.log(`KILN: ${screens.length} screens, ${total} elements`);
console.log(`Written: ${SLUG}.pen`);
