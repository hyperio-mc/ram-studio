'use strict';
const fs = require('fs'), path = require('path');

const SLUG = 'lobster';
const W = 390, H = 844;

// ─── PALETTE — Warm cream + lobster coral + teal for status ──────────────────
// Concept: LOBSTER — agent fleet management. "Claws" = individual agents.
// Light theme. Coral accent = lobster identity. Teal = healthy/running state.
// Inspired by: Rakis request to design an agent management UI for Claw
const BG     = '#FAF8F5';  // warm cream
const SURF   = '#FFFFFF';  // card surface
const CARD   = '#F5F0E8';  // secondary card — warmer
const BORDER = '#EAE4D8';  // warm border
const TEXT   = '#1A140E';  // warm near-black (has orange undertone)
const TEXT2  = '#6B5E4E';  // muted warm brown-gray
const TEXT3  = '#B09C88';  // very muted

const CORAL  = '#E85D2F';  // lobster coral — primary accent
const CORAL_L= '#FDF0EB';  // coral tint for chip/bg
const TEAL   = '#0D7377';  // running/healthy state
const TEAL_L = '#E8F4F4';  // teal tint
const AMBER  = '#D4820A';  // waiting/queued state
const AMB_L  = '#FDF4E3';  // amber tint
const RED    = '#C94040';  // error/failed state
const RED_L  = '#FAEAEA';  // red tint
const MUTED  = '#C8C0B4';  // disabled/idle

// Agent status system:
// TEAL  = running
// AMBER = queued / waiting
// CORAL = spawning
// RED   = failed / errored
// MUTED = idle

// ─── PRIMITIVES ──────────────────────────────────────────────────────────────
function rect(x,y,w,h,fill,opts={}) {
  return { type:'rect', x,y,w,h,fill,
    rx: opts.rx||0, opacity: opts.opacity||1,
    stroke: opts.stroke||'none', sw: opts.sw||0 };
}
function text(x,y,content,size,fill,opts={}) {
  return { type:'text', x,y,content,size,fill,
    fw: opts.fw||400, font: opts.font||'Inter,sans-serif',
    anchor: opts.anchor||'start', ls: opts.ls||0, opacity: opts.opacity||1 };
}
function circle(cx,cy,r,fill,opts={}) {
  return { type:'circle', cx,cy,r,fill,
    opacity: opts.opacity||1, stroke: opts.stroke||'none', sw: opts.sw||0 };
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  return { type:'line', x1,y1,x2,y2,stroke,
    sw: opts.sw||1, opacity: opts.opacity||1 };
}

// ─── SHARED ──────────────────────────────────────────────────────────────────
function statusBar() {
  return [
    rect(0,0,W,44,BG),
    text(18,28,'9:41',14,TEXT,{fw:600}),
    text(W-18,28,'●●●',13,TEXT2,{anchor:'end'}),
  ];
}

function tabBar(active) {
  const items = [
    { id:'fleet',  icon:'◎', label:'Fleet'  },
    { id:'spawn',  icon:'✦', label:'Spawn'  },
    { id:'tasks',  icon:'⊞', label:'Tasks'  },
    { id:'logs',   icon:'≡', label:'Logs'   },
    { id:'config', icon:'◈', label:'Config' },
  ];
  const NAV_Y = H - 80;
  const els = [
    rect(16, NAV_Y, W-32, 64, SURF, {rx:32}),
    rect(16, NAV_Y, W-32, 64, 'none', {rx:32, stroke:BORDER, sw:1}),
  ];
  const iW = (W-32)/items.length;
  items.forEach((item,i) => {
    const cx = 16 + i*iW + iW/2;
    const isActive = item.id === active;
    if (isActive) {
      els.push(rect(cx-26, NAV_Y+8, 52, 48, CORAL_L, {rx:20}));
    }
    els.push(text(cx, NAV_Y+32, item.icon, 17, isActive?CORAL:TEXT3, {anchor:'middle', fw:isActive?700:400}));
    els.push(text(cx, NAV_Y+52, item.label, 10, isActive?CORAL:TEXT2, {anchor:'middle', fw:isActive?700:400}));
  });
  return els;
}

function statusDot(x, y, status) {
  const colors = { running:TEAL, queued:AMBER, spawning:CORAL, failed:RED, idle:MUTED };
  return [circle(x, y, 5, colors[status]||MUTED)];
}

function badge(x, y, label, bg, fg, w) {
  const bw = w || label.length*7+16;
  return [
    rect(x, y, bw, 22, bg, {rx:11}),
    text(x+bw/2, y+15, label, 11, fg, {anchor:'middle', fw:700}),
  ];
}

// ─── SCREEN 1: FLEET OVERVIEW ─────────────────────────────────────────────────
function screenFleet() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  els.push(...statusBar());

  // Header
  els.push(text(20,68,'Fleet',28,TEXT,{fw:800,ls:-0.5}));
  els.push(text(20,90,'8 claws active · 2 queued · 1 failed',13,TEXT2));

  // System health strip
  els.push(rect(20,104,W-40,48,SURF,{rx:14,stroke:BORDER,sw:1}));
  // Health bar segments: 8 running (teal), 2 queued (amber), 1 failed (red)
  const totalClaws = 11;
  const segments = [{n:8,c:TEAL},{n:2,c:AMBER},{n:1,c:RED}];
  let segX = 32;
  const segW = (W-80)/totalClaws;
  segments.forEach(s => {
    for(let i=0;i<s.n;i++) {
      els.push(rect(segX, 120, segW-2, 18, s.c, {rx:4}));
      segX += segW;
    }
  });
  els.push(text(32,142,'8 running',11,TEAL,{fw:700}));
  els.push(text(W/2,142,'2 queued',11,AMBER,{anchor:'middle',fw:700}));
  els.push(text(W-32,142,'1 failed',11,RED,{anchor:'end',fw:700}));

  // Spawn new button
  els.push(rect(W-80,50,60,30,CORAL,{rx:15}));
  els.push(text(W-50,70,'+ Spawn',11,'#FFFFFF',{anchor:'middle',fw:700}));

  // Agent list
  const agents = [
    { name:'claw-01',  role:'researcher',   task:'Browse awwwards.com for design trends',         status:'running',  cpu:'23%', mem:'180MB', age:'14m' },
    { name:'claw-02',  role:'coder',        task:'Write heartbeat generator for LOBSTER design',   status:'running',  cpu:'61%', mem:'420MB', age:'8m'  },
    { name:'claw-03',  role:'reviewer',     task:'Audit gallery queue for broken entries',          status:'running',  cpu:'12%', mem:'110MB', age:'32m' },
    { name:'claw-04',  role:'writer',       task:'Draft journal post — 51 beats in.',              status:'running',  cpu:'8%',  mem:'95MB',  age:'45m' },
    { name:'claw-05',  role:'tester',       task:'Run Svelte mock validation suite',               status:'running',  cpu:'34%', mem:'280MB', age:'6m'  },
    { name:'claw-06',  role:'researcher',   task:'Fetch NNGroup articles — mobile UX 2026',       status:'queued',   cpu:'—',   mem:'—',     age:'0m'  },
    { name:'claw-07',  role:'coder',        task:'Waiting for claw-02 output before starting',    status:'queued',   cpu:'—',   mem:'—',     age:'0m'  },
    { name:'claw-08',  role:'analyst',      task:'FAILED: Context limit exceeded at step 14',     status:'failed',   cpu:'—',   mem:'—',     age:'72m' },
  ];

  agents.forEach((a,i) => {
    const y = 164 + i * 72;
    if(y + 68 > H - 90) return; // clip to screen
    const sbg = a.status==='running'?TEAL_L:a.status==='queued'?AMB_L:RED_L;
    const sfg = a.status==='running'?TEAL:a.status==='queued'?AMBER:RED;
    els.push(rect(20,y,W-40,64,SURF,{rx:14}));
    els.push(rect(20,y,3,64,sfg,{rx:2}));
    els.push(...statusDot(35,y+14,a.status));
    els.push(text(46,y+16,a.name,13,TEXT,{fw:700}));
    els.push(text(46,y+32,a.role,11,TEXT2,{fw:500}));
    els.push(...badge(W-24-a.status.length*7-16,y+8,a.status,sbg,sfg));
    // Task truncated
    const taskDisplay = a.task.length > 42 ? a.task.slice(0,42)+'…' : a.task;
    els.push(text(20+16,y+50,taskDisplay,11,TEXT2));
    // CPU / mem (only for running)
    if(a.status==='running') {
      els.push(text(W-28,y+32,a.cpu,11,TEXT3,{anchor:'end'}));
    }
  });

  els.push(...tabBar('fleet'));
  return { name:'Fleet', elements: els };
}

// ─── SCREEN 2: SPAWN AGENT ───────────────────────────────────────────────────
function screenSpawn() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  els.push(...statusBar());

  els.push(text(20,68,'Spawn Claw',26,TEXT,{fw:800,ls:-0.5}));
  els.push(text(20,90,'Configure and launch a new agent',13,TEXT2));

  // Agent type selector
  els.push(text(20,112,'Agent Type',12,TEXT2,{fw:600,ls:0.3}));
  const types = [
    { id:'researcher', icon:'◎', desc:'Browse & gather', active:true  },
    { id:'coder',      icon:'⌨', desc:'Write code',      active:false },
    { id:'reviewer',   icon:'◷', desc:'Audit & check',   active:false },
    { id:'writer',     icon:'✍', desc:'Draft content',   active:false },
  ];
  types.forEach((t,i) => {
    const tx = 20 + i*88;
    els.push(rect(tx,124,80,68,t.active?CORAL_L:SURF,{rx:14,stroke:t.active?CORAL:BORDER,sw:t.active?1.5:1}));
    els.push(text(tx+40,152,t.icon,18,t.active?CORAL:TEXT2,{anchor:'middle'}));
    els.push(text(tx+40,170,t.id,11,t.active?CORAL:TEXT,{anchor:'middle',fw:t.active?700:600}));
    els.push(text(tx+40,182,t.desc,9,TEXT3,{anchor:'middle'}));
  });

  // Task prompt
  els.push(text(20,208,'Task Prompt',12,TEXT2,{fw:600,ls:0.3}));
  els.push(rect(20,220,W-40,80,SURF,{rx:12,stroke:BORDER,sw:1}));
  els.push(text(30,242,'Browse awwwards.com + godly.website for dark',13,TEXT,{fw:400}));
  els.push(text(30,258,'UI palette trends in Apr 2026. Return: 5 hex',13,TEXT,{fw:400}));
  els.push(text(30,274,'palette clusters with source citations.',13,TEXT2,{fw:400}));

  // Context allowance
  els.push(text(20,314,'Context Budget',12,TEXT2,{fw:600,ls:0.3}));
  els.push(rect(20,326,W-40,40,SURF,{rx:12,stroke:BORDER,sw:1}));
  const ctxOpts = ['4k','16k','32k','64k'];
  ctxOpts.forEach((c,i) => {
    const cx = 32+i*82;
    els.push(rect(cx,332,72,28,i===2?CORAL_L:CARD,{rx:14}));
    els.push(text(cx+36,351,c,12,i===2?CORAL:TEXT2,{anchor:'middle',fw:i===2?700:500}));
  });

  // Tools
  els.push(text(20,380,'Tools Allowed',12,TEXT2,{fw:600,ls:0.3}));
  const tools = ['web_fetch','bash','read','grep','write','agent'];
  let tx2 = 20;
  let ty2 = 392;
  tools.forEach((t,i) => {
    const tw = t.length*7+18;
    if(tx2+tw > W-20) { tx2=20; ty2+=32; }
    const active = ['web_fetch','read','grep'].includes(t);
    els.push(rect(tx2,ty2,tw,24,active?TEAL_L:CARD,{rx:12}));
    els.push(text(tx2+tw/2,ty2+16,t,11,active?TEAL:TEXT3,{anchor:'middle',fw:active?700:400}));
    tx2+=tw+8;
  });

  // Isolation mode
  els.push(text(20,458,'Isolation',12,TEXT2,{fw:600,ls:0.3}));
  const isoOpts = ['none','worktree','sandbox'];
  let ix=20;
  isoOpts.forEach((o,i) => {
    const iw = o.length*9+22;
    els.push(rect(ix,470,iw,28,i===1?CORAL_L:SURF,{rx:14,stroke:i===1?CORAL:BORDER,sw:1}));
    els.push(text(ix+iw/2,489,o,12,i===1?CORAL:TEXT2,{anchor:'middle',fw:i===1?700:400}));
    ix+=iw+10;
  });

  // Max turns
  els.push(text(20,514,'Max Turns',12,TEXT2,{fw:600,ls:0.3}));
  els.push(rect(20,526,W-40,38,SURF,{rx:12,stroke:BORDER,sw:1}));
  els.push(text(32,549,'20 turns',14,TEXT,{fw:600}));
  els.push(text(W-28,549,'▾',14,TEXT2,{anchor:'end'}));

  // Spawn button
  els.push(rect(20,580,W-40,52,CORAL,{rx:16}));
  els.push(text(W/2,612,'✦  Spawn Claw',16,'#FFFFFF',{anchor:'middle',fw:800}));

  // Quick templates
  els.push(text(20,648,'Quick Templates',12,TEXT2,{fw:600,ls:0.3}));
  const templates = ['Design Research','Code Review','Gallery Audit','Journal Draft'];
  let tmpX=20, tmpY=662;
  templates.forEach((t,i) => {
    const tw = t.length*7+20;
    if(tmpX+tw>W-20){tmpX=20;tmpY+=36;}
    els.push(rect(tmpX,tmpY,tw,28,CARD,{rx:14,stroke:BORDER,sw:1}));
    els.push(text(tmpX+tw/2,tmpY+19,t,12,TEXT2,{anchor:'middle',fw:500}));
    tmpX+=tw+8;
  });

  // Team context toggle
  els.push(rect(20,714,W-40,44,CARD,{rx:14}));
  els.push(text(32,740,'Inherit team context',13,TEXT,{fw:600}));
  els.push(rect(W-56,722,36,24,TEAL,{rx:12}));
  els.push(circle(W-32,734,10,SURF));

  els.push(...tabBar('spawn'));
  return { name:'Spawn', elements: els };
}

// ─── SCREEN 3: TASK QUEUE ────────────────────────────────────────────────────
function screenTasks() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  els.push(...statusBar());

  els.push(text(20,68,'Task Queue',26,TEXT,{fw:800,ls:-0.5}));
  els.push(text(20,90,'12 total · 5 running · 2 queued · 3 done · 1 failed · 1 blocked',12,TEXT2));

  // Filter chips
  const filters = ['All','Running','Queued','Done','Failed'];
  let fx=20;
  filters.forEach((f,i)=>{
    const fw=f.length*7.5+18;
    els.push(rect(fx,104,fw,26,i===0?CORAL_L:BG,{rx:13,stroke:i===0?CORAL:BORDER,sw:1}));
    els.push(text(fx+fw/2,121,f,11,i===0?CORAL:TEXT2,{anchor:'middle',fw:i===0?700:500}));
    fx+=fw+8;
  });

  // Tasks list
  const tasks = [
    { id:'T-041', title:'Browse awwwards — dark palettes',         agent:'claw-01', status:'running',  pct:68, priority:'high'   },
    { id:'T-042', title:'Write LOBSTER generator script',          agent:'claw-02', status:'running',  pct:34, priority:'high'   },
    { id:'T-043', title:'Gallery queue audit',                     agent:'claw-03', status:'running',  pct:81, priority:'medium' },
    { id:'T-044', title:'Draft journal — 51 beats in.',           agent:'claw-04', status:'done',     pct:100,priority:'medium' },
    { id:'T-045', title:'Svelte mock validation',                  agent:'claw-05', status:'running',  pct:52, priority:'low'    },
    { id:'T-046', title:'Fetch NNGroup articles',                  agent:'claw-06', status:'queued',   pct:0,  priority:'medium' },
    { id:'T-047', title:'Blocked: awaiting T-042 output',         agent:'claw-07', status:'queued',   pct:0,  priority:'high'   },
    { id:'T-048', title:'FAILED: context exceeded at step 14',    agent:'claw-08', status:'failed',   pct:0,  priority:'high'   },
  ];
  tasks.forEach((t,i)=>{
    const y=138+i*74;
    if(y+70>H-90) return;
    const sbg=t.status==='running'?TEAL_L:t.status==='queued'?AMB_L:t.status==='done'?'#E8F5EC':t.status==='failed'?RED_L:CARD;
    const sfg=t.status==='running'?TEAL:t.status==='queued'?AMBER:t.status==='done'?'#1A6A3A':t.status==='failed'?RED:TEXT3;
    const pbg=t.priority==='high'?CORAL_L:t.priority==='medium'?AMB_L:CARD;
    const pfg=t.priority==='high'?CORAL:t.priority==='medium'?AMBER:TEXT3;
    els.push(rect(20,y,W-40,66,SURF,{rx:14}));
    els.push(rect(20,y,3,66,sfg,{rx:2}));
    // Task id + title
    els.push(text(32,y+18,t.id,11,TEXT3,{fw:700,ls:0.3}));
    els.push(text(32,y+34,t.title,13,TEXT,{fw:600}));
    // Agent
    els.push(text(32,y+52,t.agent,11,TEXT2,{fw:500}));
    // Status + priority badges
    els.push(...badge(W-24-t.status.length*7-16,y+8,t.status,sbg,sfg));
    els.push(...badge(W-24-t.priority.length*7-16,y+32,t.priority,pbg,pfg));
    // Progress bar for running
    if(t.status==='running') {
      els.push(rect(32,y+56,W-80,3,BORDER,{rx:2}));
      els.push(rect(32,y+56,Math.round((W-80)*t.pct/100),3,TEAL,{rx:2}));
    }
    if(t.status==='done') {
      els.push(text(W-28,y+52,'✓ complete',11,'#1A6A3A',{anchor:'end',fw:700}));
    }
  });

  els.push(...tabBar('tasks'));
  return { name:'Tasks', elements: els };
}

// ─── SCREEN 4: AGENT DETAIL ──────────────────────────────────────────────────
function screenAgent() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  els.push(...statusBar());

  // Back
  els.push(text(20,58,'‹',22,TEXT2,{fw:400}));
  els.push(text(W/2,58,'claw-02',15,TEXT,{anchor:'middle',fw:700}));

  // Agent identity card
  els.push(rect(20,72,W-40,108,SURF,{rx:20}));
  // Claw avatar — stylized lobster claw shape via circles
  els.push(circle(52,116,24,CORAL_L));
  els.push(text(52,122,'✦',18,CORAL,{anchor:'middle'}));
  els.push(text(86,100,'claw-02',18,TEXT,{fw:800}));
  els.push(text(86,120,'coder  ·  worktree isolation',13,TEXT2));
  els.push(text(86,140,'Running · 8 min · 34% context used',12,TEAL,{fw:600}));
  // Status dot
  els.push(...statusDot(W-36,96,'running'));
  // Kill button
  els.push(rect(W-76,110,52,26,RED_L,{rx:13}));
  els.push(text(W-50,128,'Stop',11,RED,{anchor:'middle',fw:700}));

  // Current task
  els.push(text(20,196,'Current Task',12,TEXT2,{fw:600,ls:0.3}));
  els.push(rect(20,208,W-40,72,CORAL_L,{rx:14}));
  els.push(rect(20,208,4,72,CORAL,{rx:2}));
  els.push(text(32,228,'T-042 · Write LOBSTER generator script',13,TEXT,{fw:700}));
  els.push(text(32,248,'Priority: HIGH · Spawned by RAM · Team: design',12,TEXT2));
  els.push(text(32,268,'Context: 32k budget · 10,880 tokens used (34%)',12,TEXT2));

  // Resource meters
  els.push(text(20,298,'Resources',12,TEXT2,{fw:600,ls:0.3}));
  const resources = [
    { label:'CPU', val:'61%', pct:61, c:CORAL },
    { label:'Memory', val:'420MB / 1GB', pct:42, c:TEAL },
    { label:'Context', val:'34%', pct:34, c:AMBER },
    { label:'Tool calls', val:'23 / 100', pct:23, c:TEXT2 },
  ];
  resources.forEach((r,i)=>{
    const ry=312+i*40;
    els.push(text(20,ry+12,r.label,12,TEXT2,{fw:600}));
    els.push(text(W-20,ry+12,r.val,12,TEXT2,{anchor:'end'}));
    els.push(rect(20,ry+18,W-40,5,BORDER,{rx:3}));
    els.push(rect(20,ry+18,Math.round((W-40)*r.pct/100),5,r.c,{rx:3}));
  });

  // Turn log
  els.push(text(20,486,'Recent Turns',12,TEXT2,{fw:600,ls:0.3}));
  const turns = [
    { n:23, tool:'Write',    note:'Wrote lobster-app.js (428 lines)',      time:'just now' },
    { n:22, tool:'Bash',     note:'node lobster-app.js → 512 elements',   time:'12s ago'  },
    { n:21, tool:'Read',     note:'Read mark-app.js for reference',        time:'28s ago'  },
    { n:20, tool:'Write',    note:'Wrote lobster-app.js (initial draft)',  time:'1m ago'   },
    { n:19, tool:'Bash',     note:'ls *.pen — checking for slug conflicts', time:'2m ago'  },
  ];
  turns.forEach((t,i)=>{
    const ty=500+i*54;
    els.push(rect(20,ty,W-40,46,SURF,{rx:12}));
    els.push(text(32,ty+16,'#'+t.n,11,TEXT3,{fw:700}));
    els.push(text(32,ty+32,t.tool,11,CORAL,{fw:700}));
    els.push(text(70,ty+16,t.note,12,TEXT,{fw:500}));
    els.push(text(W-20,ty+16,t.time,11,TEXT3,{anchor:'end'}));
  });

  els.push(...tabBar('fleet'));
  return { name:'Agent Detail', elements: els };
}

// ─── SCREEN 5: LOGS ──────────────────────────────────────────────────────────
function screenLogs() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  els.push(...statusBar());

  els.push(text(20,68,'Logs',26,TEXT,{fw:800,ls:-0.5}));
  els.push(text(20,90,'Live stream · All claws',13,TEXT2));

  // Filter + stream controls
  els.push(rect(W-76,54,56,28,TEAL_L,{rx:14}));
  els.push(text(W-48,72,'● LIVE',11,TEAL,{anchor:'middle',fw:700}));

  const logFilters = ['All','claw-01','claw-02','claw-03','Errors'];
  let lx=20;
  els.push(rect(lx-2,100,W-36,28,'none',{rx:0}));
  logFilters.forEach((f,i)=>{
    const lw=f.length*7+16;
    els.push(rect(lx,104,lw,24,i===0?CORAL_L:BG,{rx:12}));
    els.push(text(lx+lw/2,120,f,11,i===0?CORAL:TEXT2,{anchor:'middle',fw:i===0?700:400}));
    lx+=lw+8;
  });

  // Log lines — dark card with monospace feel
  els.push(rect(20,136,W-40,H-226,CARD,{rx:16}));
  const logLines = [
    { time:'09:41:22', agent:'claw-02', level:'info',  msg:'Writing lobster-app.js' },
    { time:'09:41:18', agent:'claw-02', level:'info',  msg:'node lobster-app.js → 512 el' },
    { time:'09:41:05', agent:'claw-01', level:'info',  msg:'Fetched awwwards.com/websites' },
    { time:'09:40:58', agent:'claw-03', level:'info',  msg:'Queue audit: 51 entries checked' },
    { time:'09:40:44', agent:'claw-02', level:'info',  msg:'Read mark-app.js (452 lines)' },
    { time:'09:40:31', agent:'claw-05', level:'warn',  msg:'Svelte build: 2 unused vars' },
    { time:'09:40:18', agent:'claw-02', level:'info',  msg:'ls *.pen — slug check' },
    { time:'09:40:03', agent:'claw-08', level:'error', msg:'FAILED: context limit exceeded' },
    { time:'09:39:47', agent:'claw-04', level:'info',  msg:'Journal draft: 820 words' },
    { time:'09:39:32', agent:'claw-01', level:'info',  msg:'Fetched godly.website' },
    { time:'09:39:18', agent:'claw-03', level:'info',  msg:'Found 3 stale entries' },
    { time:'09:38:59', agent:'claw-04', level:'info',  msg:'Starting journal entry draft' },
  ];
  const lColors = { info:TEXT2, warn:AMBER, error:RED };
  const lBg = { info:'none', warn:AMB_L, error:RED_L };
  logLines.forEach((l,i)=>{
    const ly=144+i*44;
    if(ly+40>H-96) return;
    if(l.level!=='info') els.push(rect(28,ly,W-56,36,lBg[l.level],{rx:8}));
    els.push(text(28,ly+12,l.time,10,TEXT3,{fw:500,font:'Menlo,monospace'}));
    els.push(text(80,ly+12,l.agent,10,CORAL,{fw:700}));
    els.push(text(136,ly+12,l.level.toUpperCase(),9,lColors[l.level],{fw:700,ls:0.3}));
    els.push(text(28,ly+28,l.msg,12,l.level==='error'?RED:TEXT,{fw:l.level==='error'?600:400}));
  });

  els.push(...tabBar('logs'));
  return { name:'Logs', elements: els };
}

// ─── SCREEN 6: CONFIG ────────────────────────────────────────────────────────
function screenConfig() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  els.push(...statusBar());

  els.push(text(20,68,'Config',26,TEXT,{fw:800,ls:-0.5}));
  els.push(text(20,90,'Fleet settings & defaults',13,TEXT2));

  // Team info card
  els.push(rect(20,106,W-40,70,SURF,{rx:16}));
  els.push(circle(44,141,20,CORAL_L));
  els.push(text(44,147,'🦞',14,CORAL,{anchor:'middle'}));
  els.push(text(72,127,'Lobster Fleet',16,TEXT,{fw:700}));
  els.push(text(72,145,'Team: design · Owner: RAM',13,TEXT2));
  els.push(text(72,163,'11 claws · 3 role types · Active',12,TEAL,{fw:600}));
  els.push(text(W-28,135,'Edit',13,CORAL,{anchor:'end',fw:600}));

  // Settings groups
  const sections = [
    {
      label:'SPAWN DEFAULTS',
      items:[
        { label:'Default context budget', val:'32k', toggle:false },
        { label:'Isolation mode', val:'worktree', toggle:false },
        { label:'Max turns per agent', val:'20', toggle:false },
        { label:'Auto-retry on failure', val:'', toggle:true, on:true },
      ],
    },
    {
      label:'NOTIFICATIONS',
      items:[
        { label:'Agent completed', val:'', toggle:true, on:true },
        { label:'Agent failed', val:'', toggle:true, on:true },
        { label:'Context >80% used', val:'', toggle:true, on:false },
        { label:'Fleet status digest', val:'hourly', toggle:false },
      ],
    },
    {
      label:'LIMITS',
      items:[
        { label:'Max concurrent agents', val:'12', toggle:false },
        { label:'Max total context/day', val:'500k tokens', toggle:false },
        { label:'Auto-kill idle agents', val:'30m', toggle:false },
      ],
    },
  ];

  let sy = 192;
  sections.forEach(sec => {
    els.push(line(20,sy,W-20,sy,BORDER));
    els.push(text(20,sy+14,sec.label,10,TEXT3,{fw:700,ls:1}));
    sy+=22;
    sec.items.forEach(item => {
      els.push(rect(20,sy,W-40,44,SURF,{rx:12}));
      els.push(text(32,sy+16,item.label,13,TEXT,{fw:500}));
      if(item.toggle) {
        els.push(rect(W-60,sy+10,40,24,item.on?TEAL:BORDER,{rx:12}));
        els.push(circle(item.on?W-28:W-52,sy+22,10,SURF));
      } else {
        els.push(text(W-28,sy+16,item.val,13,TEXT2,{anchor:'end',fw:500}));
        els.push(text(W-28,sy+32,'›',14,TEXT3,{anchor:'end'}));
      }
      sy+=52;
    });
  });

  // Danger zone
  els.push(line(20,sy,W-20,sy,BORDER));
  els.push(text(20,sy+14,'DANGER',10,RED,{fw:700,ls:1}));
  sy+=22;
  els.push(rect(20,sy,W-40,40,RED_L,{rx:12,stroke:RED,sw:1}));
  els.push(text(32,sy+16,'Kill all running claws',13,RED,{fw:600}));
  els.push(text(W-28,sy+16,'⏹ Stop all',12,RED,{anchor:'end',fw:700}));

  els.push(...tabBar('config'));
  return { name:'Config', elements: els };
}

// ─── ASSEMBLE ─────────────────────────────────────────────────────────────────
const screens = [
  screenFleet(),
  screenSpawn(),
  screenTasks(),
  screenAgent(),
  screenLogs(),
  screenConfig(),
];

const totalElements = screens.reduce((sum,s) => sum + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'LOBSTER — Agent Fleet Manager',
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'light',
    heartbeat: 52,
    elements: totalElements,
    palette: { BG, SURF, CARD, TEXT, TEXT2, CORAL, TEAL, AMBER, RED },
    inspiration: [
      'Rakis — "create a lobster design app built to manage claws (agents)"',
      'Agent fleet management: spawn, monitor, kill, log individual AI agents',
      'CORAL accent = lobster identity. TEAL = running/healthy. AMBER = queued.',
      'Floating pill tab nav (Mobbin 2025). Warm cream light theme.',
    ],
  },
  screens: screens.map(s=>({
    name: s.name,
    svg: `${W}x${H}`,
    elements: s.elements,
  })),
};

fs.writeFileSync(path.join(__dirname,`${SLUG}.pen`), JSON.stringify(pen,null,2));
console.log(`LOBSTER: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
