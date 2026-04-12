// SPAWN — Command your AI agents
// Inspired by: JetBrains Air "run beloved agents side by side" (lapa.ninja)
// + ultra-condensed display type filling full width (DARKROOM/URBANE on darkmodedesign.com)
// Dark theme: near-black #080810 + electric teal #00E5C8 + blue #4F6FFF
// Monospace terminal outputs mixed with condensed bold display type

const fs = require('fs');

const W = 390, H = 844;

const P = {
  bg:       '#080810',
  surface:  '#0F1020',
  surfAlt:  '#161828',
  surfCard: '#1A1C30',
  text:     '#F0F0FF',
  muted:    'rgba(240,240,255,0.40)',
  dim:      'rgba(240,240,255,0.18)',
  border:   'rgba(240,240,255,0.08)',
  teal:     '#00E5C8',
  tealSoft: 'rgba(0,229,200,0.12)',
  tealGlow: 'rgba(0,229,200,0.20)',
  blue:     '#4F6FFF',
  blueSoft: 'rgba(79,111,255,0.12)',
  red:      '#FF4F6A',
  redSoft:  'rgba(255,79,106,0.12)',
  amber:    '#F5A623',
  amberSoft:'rgba(245,166,35,0.12)',
  green:    '#00D68F',
  greenSoft:'rgba(0,214,143,0.12)',
};

const MONO = "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace";
const SANS = "'Inter', 'Helvetica Neue', system-ui, sans-serif";

function el(type, props) { return { type, ...props }; }
function rect(x,y,w,h,fill,opts={}) { return el('rect',{x,y,w,h,fill,rx:opts.rx||0,...(opts.shadow?{shadow:opts.shadow}:{}),...(opts.stroke?{stroke:opts.stroke,strokeWidth:opts.strokeWidth||1}:{})}); }
function txt(x,y,text,size,fill,opts={}) { return el('text',{x,y,text,fontSize:size,fill,fontFamily:opts.mono?MONO:SANS,fontWeight:opts.w||400,...(opts.ls?{letterSpacing:opts.ls}:{}),...(opts.lh?{lineHeight:opts.lh}:{}),...(opts.align?{textAlign:opts.align}:{})}); }
function line(x1,y1,x2,y2,stroke,opts={}) { return el('line',{x1,y1,x2,y2,stroke,strokeWidth:opts.sw||1}); }
function circle(cx,cy,r,fill,opts={}) { return el('circle',{cx,cy,r,fill,...(opts.stroke?{stroke:opts.stroke,strokeWidth:opts.strokeWidth||1}:{})}); }

// ── STATUS BAR ──────────────────────────────────────────────────────────────
function statusBar(theme='dark') {
  const fill = theme==='dark' ? P.text : P.bg;
  return [
    rect(0,0,W,44,'transparent'),
    txt(20,16,'9:41',14,fill,{w:600}),
    txt(W-60,16,'● ● ●',11,P.muted),
    txt(W-20,16,'',13,fill,{align:'right'}),
  ];
}

// ── BOTTOM NAV ──────────────────────────────────────────────────────────────
function bottomNav(active) {
  const tabs = [
    {icon:'⬡',label:'OPS',id:'ops'},
    {icon:'▶',label:'RUN',id:'run'},
    {icon:'≡',label:'QUEUE',id:'queue'},
    {icon:'◈',label:'AGENTS',id:'agents'},
    {icon:'◎',label:'LOG',id:'log'},
  ];
  const elements = [
    rect(0,H-80,W,80,P.surface),
    line(0,H-80,W,H-80,P.border),
  ];
  const tw = W/5;
  tabs.forEach((t,i) => {
    const cx = i*tw + tw/2;
    const isActive = t.id === active;
    elements.push(
      rect(i*tw+8, H-76, tw-16, 64, isActive?P.tealSoft:'transparent', {rx:10}),
      txt(cx-8, H-58, t.icon, 18, isActive?P.teal:P.muted, {w:600}),
      txt(cx-12, H-30, t.label, 9, isActive?P.teal:P.muted, {w:700,ls:'0.08em'}),
    );
  });
  return elements;
}

// ── AGENT POD CARD ───────────────────────────────────────────────────────────
function agentPod(x, y, w, h, opts) {
  const { name, task, pct, status, statusColor, icon, tally } = opts;
  const els = [
    rect(x,y,w,h,P.surfCard,{rx:14,shadow:`0 4px 20px rgba(0,0,0,0.40)`}),
    // accent top strip
    rect(x,y,w,3,statusColor,{rx:14}),
    // status dot
    circle(x+14,y+18,4,statusColor),
    txt(x+24,y+13, status, 10, statusColor, {w:700,ls:'0.06em'}),
    txt(x+w-12,y+13, tally, 10, P.dim, {w:500,align:'right'}),
    // icon + agent name
    txt(x+12,y+40, icon, 20, statusColor),
    txt(x+38,y+43, name, 13, P.text, {w:700,ls:'-0.02em'}),
    // task line
    txt(x+12,y+62, task, 10, P.muted, {lh:1.4}),
    // progress track
    rect(x+12,y+84,w-24,3,P.border,{rx:2}),
    rect(x+12,y+84,Math.round((w-24)*pct/100),3,statusColor,{rx:2}),
    txt(x+12,y+95, `${pct}%`, 9, statusColor, {w:600,ls:'0.04em'}),
    txt(x+w-12,y+95, `${Math.round((100-pct)*0.4)}s`, 9, P.dim, {align:'right'}),
  ];
  return els;
}

// ══════════════════════════════════════════════════════════════════════════
// SCREEN 1 — OPS (Dashboard / fleet overview)
// ══════════════════════════════════════════════════════════════════════════
function screenOps() {
  const els = [
    rect(0,0,W,H,P.bg),
    ...statusBar(),
    // — ambient glow
    el('rect',{x:-80,y:60,w:260,h:260,rx:130,fill:'rgba(0,229,200,0.04)'}),
    el('rect',{x:W-180,y:120,w:220,h:220,rx:110,fill:'rgba(79,111,255,0.04)'}),

    // ── HEADER ────────────────────────────────────────────────────────────
    // SPAWN wordmark — ultra-condensed display, full width
    txt(18,58,'SPAWN',46,P.text,{w:900,ls:'-0.05em'}),
    txt(180,68,'●',10,P.teal,{w:900}),
    // live count chip
    rect(228,50,104,22,P.tealSoft,{rx:11}),
    circle(240,61,4,P.teal),
    txt(250,65,'12 AGENTS LIVE',10,P.teal,{w:700,ls:'0.06em'}),

    txt(18,92,'Command Center',13,P.muted,{w:400}),

    // ── FLEET METRICS ROW ─────────────────────────────────────────────────
    rect(18,106,108,64,P.surfCard,{rx:12}),
    txt(30,124,'RUNNING',9,P.muted,{w:600,ls:'0.06em'}),
    txt(30,148,'12',28,P.teal,{w:800,ls:'-0.04em'}),
    txt(62,148,'↑',14,P.green,{w:700}),

    rect(138,106,108,64,P.surfCard,{rx:12}),
    txt(150,124,'QUEUED',9,P.muted,{w:600,ls:'0.06em'}),
    txt(150,148,'34',28,P.blue,{w:800,ls:'-0.04em'}),

    rect(258,106,114,64,P.surfCard,{rx:12}),
    txt(270,124,'DONE TODAY',9,P.muted,{w:600,ls:'0.06em'}),
    txt(270,148,'247',28,P.text,{w:800,ls:'-0.04em'}),

    // ── SECTION HEADER ────────────────────────────────────────────────────
    txt(18,190,'Active Agents',14,P.text,{w:600}),
    txt(W-18,190,'See all →',12,P.teal,{align:'right'}),
    line(18,200,W-18,200,P.border),

    // ── AGENT PODS 2×2 GRID ───────────────────────────────────────────────
    ...agentPod(18,208,168,112,{
      name:'CODEX-7',task:'Refactoring auth layer',
      pct:68,status:'RUNNING',statusColor:P.teal,icon:'◈',tally:'x2.3k'
    }),
    ...agentPod(204,208,168,112,{
      name:'LUMEN-3',task:'Summarizing research',
      pct:91,status:'RUNNING',statusColor:P.green,icon:'◉',tally:'x890'
    }),
    ...agentPod(18,328,168,112,{
      name:'PARSE-1',task:'Extracting PDF data',
      pct:45,status:'RUNNING',statusColor:P.blue,icon:'▦',tally:'x1.1k'
    }),
    ...agentPod(204,328,168,112,{
      name:'SCOUT-9',task:'Web crawl — 12 URLs',
      pct:22,status:'STARTING',statusColor:P.amber,icon:'◎',tally:'x340'
    }),

    // ── RECENT COMPLETIONS ───────────────────────────────────────────────
    txt(18,456,'Recent Completions',14,P.text,{w:600}),
    line(18,466,W-18,466,P.border),
    ...[
      {name:'DRAFT-4',task:'Blog post — Q1 review',time:'2m ago',tks:'4.2k'},
      {name:'AUDIT-2',task:'Security scan complete',time:'7m ago',tks:'1.8k'},
      {name:'SYNC-11',task:'Database migration',time:'14m ago',tks:'890'},
    ].flatMap((r,i)=>{
      const y = 476 + i*52;
      return [
        rect(18,y,W-36,46,P.surfCard,{rx:10}),
        circle(36,y+23,5,P.green),
        txt(50,y+16,r.name,11,P.text,{w:700,mono:true}),
        txt(50,y+30,r.task,10,P.muted),
        rect(W-80,y+12,62,22,P.greenSoft,{rx:11}),
        txt(W-76,y+26,'✓ DONE',9,P.green,{w:600,ls:'0.04em'}),
        txt(W-20,y+12,r.time,9,P.dim,{align:'right'}),
        txt(W-20,y+28,r.tks+' tkns',9,P.dim,{align:'right'}),
      ];
    }),

    // ── SPAWN NEW TASK BUTTON ─────────────────────────────────────────────
    rect(18,640,W-36,50,P.teal,{rx:25,shadow:'0 8px 24px rgba(0,229,200,0.30)'}),
    txt(W/2,671,'+ SPAWN NEW TASK',14,P.bg,{w:800,ls:'0.04em',align:'center'}),

    ...bottomNav('ops'),
  ];
  return { id:'ops', label:'Ops', backgroundColor:P.bg, elements:els };
}

// ══════════════════════════════════════════════════════════════════════════
// SCREEN 2 — RUN (Active agent terminal view)
// ══════════════════════════════════════════════════════════════════════════
function screenRun() {
  const LOG_LINES = [
    {t:'09:42:03',msg:'Initialized context window (128k)',c:P.muted},
    {t:'09:42:04',msg:'Reading codebase: /src/auth/**',c:P.muted},
    {t:'09:42:06',msg:'Found 23 files (8.4k tokens)',c:P.teal},
    {t:'09:42:08',msg:'Analyzing AuthController.js...',c:P.muted},
    {t:'09:42:11',msg:'  WARNING: JWT secret exposed in env',c:P.amber},
    {t:'09:42:12',msg:'  INFO: 3 deprecated method calls',c:P.muted},
    {t:'09:42:14',msg:'Generating refactor plan...',c:P.blue},
    {t:'09:42:18',msg:'Writing patch → auth.service.ts',c:P.teal},
    {t:'09:42:22',msg:'Running tests: 47/47 passing ✓',c:P.green},
  ];

  const els = [
    rect(0,0,W,H,P.bg),
    ...statusBar(),

    // ── BACK + AGENT IDENTITY ─────────────────────────────────────────────
    txt(18,58,'←',18,P.muted,{w:600}),
    txt(50,60,'AGENT RUN',11,P.muted,{w:700,ls:'0.08em'}),
    rect(W-72,50,54,24,P.tealSoft,{rx:12}),
    circle(W-67,62,4,P.teal),
    txt(W-58,65,'LIVE',10,P.teal,{w:700,ls:'0.06em'}),

    // ── AGENT HEADER ─────────────────────────────────────────────────────
    rect(18,80,W-36,88,P.surfCard,{rx:16,shadow:'0 4px 24px rgba(0,0,0,0.5)'}),
    rect(18,80,W-36,3,P.teal,{rx:16}),
    txt(36,104,'◈',20,P.teal),
    txt(64,100,'CODEX-7',18,P.text,{w:800,ls:'-0.03em'}),
    txt(64,118,'Refactoring auth layer',12,P.muted),
    // model badge
    rect(36,134,90,20,P.blueSoft,{rx:10}),
    txt(42,147,'claude-3.5-sonnet',9,P.blue,{w:600,ls:'0.02em',mono:true}),
    // tokens used
    txt(W-36,104,'2,847',16,P.text,{w:700,align:'right'}),
    txt(W-36,120,'tokens',10,P.muted,{align:'right'}),
    // progress arc simulation via bar
    rect(36,156,W-72-20,4,P.border,{rx:2}),
    rect(36,156,Math.round((W-72-20)*0.68),4,P.teal,{rx:2}),
    txt(W-36,163,'68%',10,P.teal,{w:600,align:'right'}),

    // ── TERMINAL ─────────────────────────────────────────────────────────
    rect(18,178,W-36,340,P.surface,{rx:14}),
    // terminal header
    rect(18,178,W-36,28,P.surfAlt,{rx:14}),
    circle(32,192,4,'#FF5F57'),
    circle(46,192,4,'#FEBC2E'),
    circle(60,192,4,'#28C840'),
    txt(W/2-20,195,'terminal',10,P.dim,{mono:true}),

    // log lines
    ...LOG_LINES.flatMap((ln,i) => {
      const y = 222 + i*32;
      return [
        txt(28,y,ln.t,9,P.dim,{mono:true}),
        txt(96,y,ln.msg,10,ln.c,{mono:true}),
      ];
    }),

    // cursor blink line
    rect(28,222+LOG_LINES.length*32,240,2,P.teal,{rx:1}),
    txt(28,222+LOG_LINES.length*32+8,'▍',12,P.teal,{mono:true}),

    // ── CONTROLS ─────────────────────────────────────────────────────────
    rect(18,532,W-36,64,P.surfCard,{rx:14}),
    txt(30,556,'Actions',11,P.muted,{w:600,ls:'0.04em'}),
    // pause
    rect(30,566,90,24,P.amberSoft,{rx:12}),
    txt(52,581,'⏸ PAUSE',10,P.amber,{w:700}),
    // stop
    rect(130,566,76,24,P.redSoft,{rx:12}),
    txt(148,581,'■ STOP',10,P.red,{w:700}),
    // inject prompt
    rect(216,566,130,24,P.blueSoft,{rx:12}),
    txt(228,581,'✎ INJECT PROMPT',9,P.blue,{w:700}),

    // ── CONTEXT PANEL ─────────────────────────────────────────────────────
    rect(18,608,W-36,52,P.surfCard,{rx:12}),
    txt(30,626,'Context',11,P.muted,{w:600,ls:'0.04em'}),
    txt(30,645,'src/auth/**  ·  schema.sql  ·  +5 files',10,P.text,{w:500}),
    txt(W-36,626,'Edit',11,P.teal,{align:'right'}),

    ...bottomNav('run'),
  ];
  return { id:'run', label:'Run', backgroundColor:P.bg, elements:els };
}

// ══════════════════════════════════════════════════════════════════════════
// SCREEN 3 — QUEUE (Task backlog)
// ══════════════════════════════════════════════════════════════════════════
function screenQueue() {
  const tasks = [
    {priority:'HIGH',name:'Competitor analysis',agent:'SCOUT',est:'~4m',color:P.red,icon:'◎'},
    {priority:'HIGH',name:'Weekly digest email',agent:'DRAFT',est:'~2m',color:P.red,icon:'◉'},
    {priority:'MED', name:'Translate docs → ES',agent:'LINGUA',est:'~6m',color:P.amber,icon:'◈'},
    {priority:'MED', name:'Optimize SQL queries',agent:'CODEX',est:'~3m',color:P.amber,icon:'▦'},
    {priority:'LOW', name:'Generate social copy',agent:'DRAFT',est:'~1m',color:P.blue,icon:'◉'},
    {priority:'LOW', name:'Audit log export',agent:'AUDIT',est:'~30s',color:P.blue,icon:'◎'},
  ];

  const els = [
    rect(0,0,W,H,P.bg),
    ...statusBar(),

    // ── HEADER ────────────────────────────────────────────────────────────
    txt(18,58,'QUEUE',42,P.text,{w:900,ls:'-0.05em'}),
    rect(258,52,100,22,P.blueSoft,{rx:11}),
    circle(270,63,4,P.blue),
    txt(280,66,'34 PENDING',10,P.blue,{w:700,ls:'0.05em'}),
    txt(18,88,'Scheduled task backlog',13,P.muted),

    // ── FILTER TABS ────────────────────────────────────────────────────────
    ...['ALL','HIGH','MED','LOW'].map((tab,i) => {
      const x = 18 + i*88;
      const active = tab === 'ALL';
      return [
        rect(x,100,78,26,active?P.tealSoft:P.surfCard,{rx:13}),
        txt(x+39,116,tab,10,active?P.teal:P.muted,{w:700,ls:'0.06em',align:'center'}),
      ];
    }).flat(),

    // ── TASK LIST ──────────────────────────────────────────────────────────
    line(18,136,W-18,136,P.border),
    ...tasks.flatMap((task,i) => {
      const y = 144 + i*76;
      return [
        rect(18,y,W-36,70,P.surfCard,{rx:12}),
        // priority pip
        rect(18,y,4,70,task.color,{rx:2}),
        // priority badge
        rect(30,y+8,42,18,`rgba(${task.color===P.red?'255,79,106':task.color===P.amber?'245,166,35':'79,111,255'},0.15)`,{rx:9}),
        txt(34,y+20,task.priority,8,task.color,{w:700,ls:'0.05em'}),
        // icon
        txt(80,y+20,task.icon,16,task.color),
        // task name
        txt(100,y+16,task.name,13,P.text,{w:600,ls:'-0.01em'}),
        // agent + est row
        txt(100,y+34,`${task.agent} agent`,10,P.muted),
        txt(100,y+48,'Est: '+task.est,10,P.dim,{mono:true}),
        // action buttons
        rect(W-102,y+14,42,22,P.tealSoft,{rx:11}),
        txt(W-100,y+27,'▶ RUN',9,P.teal,{w:700}),
        rect(W-54,y+14,36,22,P.border,{rx:11}),
        txt(W-52,y+27,'···',9,P.muted,{w:700}),
      ];
    }),

    // ── ADD TASK ──────────────────────────────────────────────────────────
    rect(18,608,W-36,50,'transparent',{rx:25,stroke:P.border,strokeWidth:1}),
    txt(W/2,635,'+ Add Task to Queue',14,P.dim,{align:'center'}),

    ...bottomNav('queue'),
  ];
  return { id:'queue', label:'Queue', backgroundColor:P.bg, elements:els };
}

// ══════════════════════════════════════════════════════════════════════════
// SCREEN 4 — AGENTS (Agent library)
// ══════════════════════════════════════════════════════════════════════════
function screenAgents() {
  const agents = [
    {name:'CODEX',role:'Software Engineer',tasks:'2,847',cap:['Code','Debug','Refactor'],color:P.teal,icon:'◈',active:true},
    {name:'DRAFT',role:'Content Writer',tasks:'1,203',cap:['Write','Edit','Summarize'],color:P.blue,icon:'◉',active:true},
    {name:'SCOUT',role:'Web Researcher',tasks:'987',cap:['Search','Crawl','Extract'],color:P.amber,icon:'◎',active:false},
    {name:'AUDIT',role:'Security Analyst',tasks:'456',cap:['Scan','Report','Monitor'],color:P.red,icon:'▦',active:false},
  ];

  const els = [
    rect(0,0,W,H,P.bg),
    ...statusBar(),

    txt(18,58,'AGENTS',38,P.text,{w:900,ls:'-0.05em'}),
    txt(18,86,'Your fleet · 4 configured',13,P.muted),
    rect(W-58,52,40,32,P.tealSoft,{rx:10}),
    txt(W-48,71,'+ NEW',9,P.teal,{w:700}),

    // ── AGENT CARDS ──────────────────────────────────────────────────────
    ...agents.flatMap((ag,i) => {
      const y = 102 + i*154;
      const caps = ag.cap;
      return [
        rect(18,y,W-36,146,P.surfCard,{rx:16,shadow:'0 4px 20px rgba(0,0,0,0.40)'}),
        rect(18,y,W-36,4,ag.color,{rx:16}),
        // status
        rect(W-72,y+14,54,20,ag.active?P.tealSoft:P.border,{rx:10}),
        circle(W-64,y+24,4,ag.active?P.teal:P.muted),
        txt(W-56,y+28,ag.active?'ACTIVE':'IDLE',8,ag.active?P.teal:P.muted,{w:700,ls:'0.05em'}),
        // icon + name
        txt(30,y+38,ag.icon,26,ag.color),
        txt(64,y+34,ag.name,20,P.text,{w:900,mono:true,ls:'-0.03em'}),
        txt(64,y+54,ag.role,11,P.muted),
        // tasks completed
        txt(30,y+80,'Tasks completed',10,P.muted,{w:500}),
        txt(30,y+98,ag.tasks,22,P.text,{w:800,ls:'-0.02em'}),
        // capability tags
        ...caps.map((cap,ci) => {
          const tx = 30 + ci*90;
          return [
            rect(tx,y+116,80,22,`rgba(${ag.color===P.teal?'0,229,200':ag.color===P.blue?'79,111,255':ag.color===P.amber?'245,166,35':'255,79,106'},0.10)`,{rx:11}),
            txt(tx+40,y+129,cap,9,ag.color,{w:600,align:'center',ls:'0.04em'}),
          ];
        }).flat(),
      ];
    }),

    ...bottomNav('agents'),
  ];
  return { id:'agents', label:'Agents', backgroundColor:P.bg, elements:els };
}

// ══════════════════════════════════════════════════════════════════════════
// SCREEN 5 — LOG (Audit trail)
// ══════════════════════════════════════════════════════════════════════════
function screenLog() {
  const runs = [
    {agent:'CODEX-7',task:'Auth refactor',dur:'4m 12s',tokens:'8,420',status:'SUCCESS',c:P.green},
    {agent:'DRAFT-4',task:'Q1 blog post',dur:'1m 58s',tokens:'4,210',status:'SUCCESS',c:P.green},
    {agent:'SCOUT-3',task:'Pricing research',dur:'6m 44s',tokens:'12,100',status:'SUCCESS',c:P.green},
    {agent:'AUDIT-1',task:'Dep vulnerability',dur:'2m 03s',tokens:'2,890',status:'WARN',c:P.amber},
    {agent:'DRAFT-2',task:'Social captions',dur:'0m 47s',tokens:'1,340',status:'SUCCESS',c:P.green},
    {agent:'CODEX-5',task:'DB migration',dur:'3m 19s',tokens:'6,780',status:'FAILED',c:P.red},
  ];

  const els = [
    rect(0,0,W,H,P.bg),
    ...statusBar(),

    txt(18,58,'LOG',46,P.text,{w:900,ls:'-0.05em'}),
    // date chip
    rect(98,54,160,24,P.surfCard,{rx:12}),
    txt(178,68,'◎ Today · 247 runs',10,P.muted,{align:'center'}),

    txt(18,90,'Complete run history',13,P.muted),

    // ── STATS ROW ──────────────────────────────────────────────────────────
    ...[
      {label:'AVG DURATION',val:'2m 44s',color:P.text},
      {label:'SUCCESS RATE',val:'94.7%',color:P.green},
      {label:'TOKENS TODAY',val:'2.1M',color:P.teal},
    ].map((s,i) => {
      const x = 18 + i*124;
      return [
        rect(x,102,116,56,P.surfCard,{rx:12}),
        txt(x+10,118,s.label,8,P.muted,{w:600,ls:'0.05em'}),
        txt(x+10,142,s.val,20,s.color,{w:800,ls:'-0.02em',mono:true}),
      ];
    }).flat(),

    // ── LOG ENTRIES ────────────────────────────────────────────────────────
    txt(18,174,'Today',12,P.muted,{w:600,ls:'0.04em'}),
    line(18,184,W-18,184,P.border),

    ...runs.flatMap((r,i) => {
      const y = 192 + i*72;
      const isWarn = r.status==='WARN';
      const isFail = r.status==='FAILED';
      return [
        rect(18,y,W-36,66,P.surfCard,{rx:12}),
        // status indicator
        rect(18,y,3,66,r.c,{rx:2}),
        circle(32,y+20,5,r.c),
        txt(44,y+16,r.agent,11,P.text,{w:700,mono:true}),
        txt(44,y+30,r.task,10,P.muted),
        // timing
        txt(44,y+48,r.dur,9,P.dim,{mono:true}),
        txt(100,y+48,'·',9,P.dim),
        txt(108,y+48,r.tokens+' tkns',9,P.dim,{mono:true}),
        // status badge
        rect(W-82,y+12,64,22,`rgba(${r.c===P.green?'0,214,143':r.c===P.amber?'245,166,35':'255,79,106'},0.12)`,{rx:11}),
        txt(W-82+8,y+25,
          r.status==='SUCCESS'?'✓ OK':r.status==='WARN'?'⚠ WARN':'✗ ERR',
          9,r.c,{w:700,ls:'0.04em'}),
        // time ago
        txt(W-18,y+12,[`${i+1}m ago`,'2m','5m','11m','18m','24m'][i]||`${i*4}m ago`,9,P.dim,{align:'right'}),
      ];
    }),

    ...bottomNav('log'),
  ];
  return { id:'log', label:'Log', backgroundColor:P.bg, elements:els };
}

// ══════════════════════════════════════════════════════════════════════════
// ASSEMBLE PEN FILE
// ══════════════════════════════════════════════════════════════════════════
const pen = {
  version: '2.8',
  meta: {
    name: 'Spawn',
    slug: 'spawn',
    tagline: 'Command your AI agents',
    archetype: 'developer-tool',
    created: new Date().toISOString(),
  },
  palette: {
    background: P.bg,
    surface: P.surface,
    surfaceAlt: P.surfAlt,
    text: P.text,
    textMuted: P.muted,
    border: P.border,
    accent: P.teal,
    accentSoft: P.tealSoft,
    accent2: P.blue,
    accent2Soft: P.blueSoft,
    danger: P.red,
    amber: P.amber,
    green: P.green,
  },
  typography: {
    displayFont: `'Inter', 'Helvetica Neue', system-ui, sans-serif`,
    bodyFont: `'Inter', 'Helvetica Neue', system-ui, sans-serif`,
    monoFont: MONO,
    scale: {
      display:  { size:46, weight:900, lineHeight:1.0, letterSpacing:'-0.05em' },
      heading:  { size:20, weight:700, lineHeight:1.2, letterSpacing:'-0.03em' },
      subhead:  { size:14, weight:600, lineHeight:1.3 },
      body:     { size:13, weight:400, lineHeight:1.5 },
      caption:  { size:10, weight:500, lineHeight:1.4, letterSpacing:'0.04em' },
      mono:     { size:10, weight:400, lineHeight:1.6, letterSpacing:'0.01em' },
    },
  },
  screens: [
    screenOps(),
    screenRun(),
    screenQueue(),
    screenAgents(),
    screenLog(),
  ],
};

fs.writeFileSync('/workspace/group/design-studio/spawn.pen', JSON.stringify(pen, null, 2));
console.log('✓ spawn.pen written —', pen.screens.length, 'screens');
pen.screens.forEach(s => console.log(' ', s.id, ':', s.elements.length, 'elements'));
