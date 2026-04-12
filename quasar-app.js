'use strict';
// quasar-app.js
// QUASAR — AI Agent Fleet Observatory
//
// Challenge: Dark-mode monitoring dashboard for fleets of autonomous AI coding agents.
// Track throughput, latency, cost, and task health across multiple agents in real time.
//
// Inspired by:
// 1. relace.ai (via lapa.ninja) — "Models built for coding agents", scientific model naming
//    (FIG-001, FIG-003), "10,000 tok/s" metric display, dark infrastructure aesthetic
//    treating AI models as precision instruments with observatory-style readouts
// 2. linear.app (via darkmodedesign.com) — minimal dark chrome, "built for the AI era",
//    status-aware colour coding, subtle surface hierarchy
// 3. godly.website — Evervault, Twingate — deep charcoal backgrounds, neon-accent callouts,
//    monospace code integration, security/infra SaaS node-graph metaphors
//
// Theme: DARK — #0A0C12 + violet #8B6FEE + mint #2CE5A8
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

const P = {
  bg:       '#0A0C12',
  surface:  '#111420',
  surface2: '#181D2E',
  border:   '#222840',
  muted:    '#5A6180',
  dim:      '#36405A',
  fg:       '#E8EAEF',
  fg2:      '#B8BDCC',
  violet:   '#8B6FEE',
  violetLt: '#B09FF5',
  violetGl: '#3B2E8A',
  mint:     '#2CE5A8',
  mintBg:   '#0D2B20',
  amber:    '#F5A623',
  amberBg:  '#261A06',
  red:      '#F25C5C',
  redBg:    '#220E0E',
  sky:      '#5BB8FF',
  skyBg:    '#0E1E32',
};

let _id = 0;
const uid = () => `q${++_id}`;

const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill || P.bg, clip: false,
  ...(opts.r   !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  children: opts.ch || [],
});

const T = (content, x, y, w, h, opts = {}) => ({
  id: uid(), type: 'text', content, x, y, width: w, height: h,
  textGrowth: 'fixed-width-height',
  style: {
    fontFamily:    opts.font   || 'Inter',
    fontSize:      opts.size   || 14,
    fontWeight:    opts.weight || 400,
    lineHeight:    opts.lh     || (opts.size ? opts.size * 1.4 : 20),
    letterSpacing: opts.ls     !== undefined ? opts.ls : 0,
    color:         opts.color  || P.fg,
    textAlign:     opts.align  || 'left',
  },
});

const M = (content, x, y, w, h, opts = {}) =>
  T(content, x, y, w, h, { font: 'JetBrains Mono', ...opts });

const E = (x, y, d, color) => ({
  id: uid(), type: 'ellipse', x, y, width: d, height: d, fill: color,
});

const pill = (label, color, bg, x, y) => {
  const pw = label.length * 6.2 + 20;
  return F(x, y, pw, 20, bg, { r: 10, ch: [
    T(label, 9, 3, pw - 18, 14, { size: 10, weight: 700, color, ls: 0.5 }),
  ] });
};

const spark = (x, y, w, h, bars, col, hlCol) => {
  const n = bars.length, bw = Math.floor((w - (n-1)*2)/n);
  return F(x, y, w, h, 'transparent', { ch: bars.map((v, i) => {
    const bh = Math.max(2, Math.round(v * h));
    return F(i*(bw+2), h-bh, bw, bh, (hlCol && v>=0.9) ? hlCol : col, { r: 1 });
  }) });
};

const statusBar = () => F(0, 0, 390, 44, 'transparent', { ch: [
  M('9:41', 16, 14, 50, 16, { size: 13, weight: 700, color: P.fg }),
  T('⠿ ▮▮▮', 318, 14, 60, 16, { size: 13, color: P.fg2, align: 'right' }),
] });

const NAV = ['Fleet','Observe','Tasks','Budget','Alerts'];
const NAV_ICONS = ['⬡','◎','≡','◈','⚐'];
const navBar = (active) => F(0, 784, 390, 60, P.surface, { ch: [
  F(0, 0, 390, 1, P.border),
  ...NAV.map((label, i) => {
    const x = i * 78, isA = i === active;
    return F(x, 0, 78, 60, 'transparent', { ch: [
      T(NAV_ICONS[i], x+29, 8, 20, 20, { size: 18, color: isA ? P.violet : P.muted, align: 'center' }),
      T(label, x, 30, 78, 14, { size: 10, color: isA ? P.violetLt : P.muted, align: 'center', weight: isA ? 600 : 400 }),
    ] });
  }),
] });

// ── Screen 1 · Fleet ────────────────────────────────────────────────────────
function s1() {
  const agents = [
    { name:'scout-01',  st:'ACTIVE', tasks:'1,482', tps:'9.2k',  lat:'148ms', cost:'$0.42', bars:[0.5,0.7,0.8,0.9,0.8,1.0,0.9,0.8,0.7,0.9,0.8,0.6] },
    { name:'forge-02',  st:'ACTIVE', tasks:'987',   tps:'7.8k',  lat:'203ms', cost:'$0.31', bars:[0.5,0.6,0.8,0.6,0.9,0.7,0.8,0.5,0.9,0.7,0.8,0.7] },
    { name:'relay-03',  st:'IDLE',   tasks:'234',   tps:'—',     lat:'—',     cost:'$0.08', bars:[0.4,0.3,0.5,0.2,0.1,0.0,0.0,0.0,0.0,0.0,0.0,0.0] },
    { name:'cipher-04', st:'ERROR',  tasks:'56',    tps:'—',     lat:'—',     cost:'$0.02', bars:[0.7,0.6,0.8,0.4,0.2,0.1,0.0,0.0,0.0,0.0,0.0,0.0] },
  ];
  const sC={ACTIVE:P.mint,IDLE:P.amber,ERROR:P.red};
  const sBg={ACTIVE:P.mintBg,IDLE:P.amberBg,ERROR:P.redBg};
  const spk={ACTIVE:P.mint,IDLE:P.dim,ERROR:P.red};

  return { id:uid(), label:'Fleet', width:390, height:844, fill:P.bg, children:[
    statusBar(),
    // header
    F(0,44,390,54,'transparent',{ch:[
      T('QUASAR',16,12,180,26,{size:24,weight:800,color:P.fg,ls:3}),
      T('Agent Observatory',16,40,200,14,{size:11,color:P.muted,ls:0.3}),
      F(306,15,68,22,P.mintBg,{r:11,stroke:P.mint,sw:1,ch:[
        E(316,21,10,P.mint),
        T('LIVE',330,16,36,14,{size:11,weight:700,color:P.mint,ls:1}),
      ]}),
    ]}),
    // summary
    F(16,106,358,50,P.surface,{r:10,stroke:P.border,sw:1,ch:[
      T('4 agents',14,8,120,14,{size:11,weight:600,color:P.fg}),
      T('2 active · 1 idle · 1 error',14,26,220,14,{size:11,color:P.muted}),
      M('2,759',258,6,86,20,{size:16,weight:700,color:P.violetLt,align:'right'}),
      T('tasks today',258,28,86,12,{size:10,color:P.muted,align:'right'}),
    ]}),
    // agent cards
    ...agents.map((ag,i)=>{
      const cy=168+i*142;
      return F(16,cy,358,130,P.surface,{r:12,stroke:P.border,sw:1,ch:[
        M(ag.name,14,14,180,18,{size:13,weight:700,color:P.fg}),
        pill(ag.st,sC[ag.st],sBg[ag.st],240,13),
        F(14,38,330,1,P.border),
        T('TASKS',14,50,60,11,{size:9,color:P.muted,weight:600,ls:0.8}),
        T('TOK/S',92,50,60,11,{size:9,color:P.muted,weight:600,ls:0.8}),
        T('P50 LAT',170,50,60,11,{size:9,color:P.muted,weight:600,ls:0.8}),
        T('COST',268,50,60,11,{size:9,color:P.muted,weight:600,ls:0.8}),
        M(ag.tasks,14,64,72,22,{size:18,weight:700,color:P.fg}),
        M(ag.tps,92,64,72,22,{size:18,weight:700,color:ag.st==='ACTIVE'?P.violetLt:P.muted}),
        M(ag.lat,170,64,72,22,{size:18,weight:700,color:P.fg}),
        M(ag.cost,268,64,72,22,{size:18,weight:700,color:ag.st==='ACTIVE'?P.mint:P.muted}),
        spark(14,96,330,22,ag.bars,spk[ag.st],ag.st==='ACTIVE'?P.violetLt:null),
      ]});
    }),
    navBar(0),
  ]};
}

// ── Screen 2 · Observe ──────────────────────────────────────────────────────
function s2() {
  const bigBars=[0.4,0.5,0.6,0.7,0.65,0.8,0.9,0.75,0.85,0.95,0.85,0.9,1.0,0.9,0.88,0.82,0.9,0.88,0.92,0.87];
  return { id:uid(), label:'Observe', width:390, height:844, fill:P.bg, children:[
    statusBar(),
    T('← Fleet',16,52,80,18,{size:13,color:P.violetLt,weight:600}),
    M('scout-01',16,74,220,30,{size:26,weight:700,color:P.fg}),
    pill('ACTIVE',P.mint,P.mintBg,16,108),
    M('shard: us-east-2 · runtime: 4h 12m',16,132,340,14,{size:10,color:P.muted}),
    // throughput chart
    F(16,156,358,112,P.surface,{r:12,stroke:P.border,sw:1,ch:[
      T('THROUGHPUT — last 20 min',14,12,240,11,{size:9,color:P.muted,weight:600,ls:0.8}),
      M('9.2k tok/s',268,8,76,14,{size:12,weight:700,color:P.violet,align:'right'}),
      F(14,28,bigBars.length*17,68,'transparent',{ch:bigBars.map((v,i)=>{
        const bh=Math.round(v*68);
        return F(i*17,68-bh,14,bh,v>=0.9?P.violet:P.violetGl,{r:2});
      })}),
      T('avg 8.1k',14,102,80,10,{size:9,color:P.dim}),
      T('peak 10k',268,102,76,10,{size:9,color:P.violetLt,align:'right'}),
    ]}),
    // 4 metric cards
    ...[
      {label:'TASKS DONE', val:'1,482',sub:'↑ 12% vs yesterday',sc:P.mint, x:16, y:280},
      {label:'P50 LATENCY',val:'148ms',sub:'↑ 8ms vs baseline', sc:P.amber,x:204,y:280},
      {label:'ERRORS',     val:'3',    sub:'0.2% error rate ↓', sc:P.mint, x:16, y:368},
      {label:'TOKEN COST', val:'$0.42',sub:'↓ 18% from target', sc:P.mint, x:204,y:368},
    ].map(m=>F(m.x,m.y,170,76,P.surface,{r:10,stroke:P.border,sw:1,ch:[
      T(m.label,12,12,146,11,{size:9,color:P.muted,weight:600,ls:0.8}),
      M(m.val,12,28,146,26,{size:22,weight:700,color:P.fg}),
      T(m.sub,12,56,146,12,{size:10,color:m.sc}),
    ]})),
    // model card
    F(16,456,358,76,P.surface2,{r:10,stroke:P.border,sw:1,ch:[
      T('MODEL',14,12,80,11,{size:9,color:P.muted,weight:600,ls:0.8}),
      T('CONTEXT',142,12,80,11,{size:9,color:P.muted,weight:600,ls:0.8}),
      T('VERSION',282,12,62,11,{size:9,color:P.muted,weight:600,ls:0.8}),
      M('FIG-003',14,30,120,22,{size:18,weight:700,color:P.violetLt}),
      M('128k',142,30,100,22,{size:18,weight:700,color:P.fg}),
      M('v2.1.4',282,30,62,22,{size:14,weight:700,color:P.fg}),
      F(14,58,160,6,P.border,{r:3,ch:[F(0,0,90,6,P.violet,{r:3})]}),
      T('56% ctx used',182,56,120,10,{size:9,color:P.muted}),
    ]}),
    // latest task
    F(16,544,358,76,P.surface,{r:10,stroke:P.border,sw:1,ch:[
      T('LATEST TASK',14,12,200,11,{size:9,color:P.muted,weight:600,ls:0.8}),
      M('#1482',292,8,52,14,{size:11,color:P.dim,align:'right'}),
      T('Refactor auth middleware to use JWT refresh tokens',14,30,330,16,{size:12,color:P.fg}),
      T('Completed · 2.3s · 4,820 tok',14,52,200,12,{size:10,color:P.muted}),
      E(328,54,10,P.mint),
    ]}),
    // buttons
    F(16,634,170,44,P.surface2,{r:10,stroke:P.border,sw:1,ch:[
      T('⏸  PAUSE',0,12,170,20,{size:13,weight:600,color:P.fg,align:'center'}),
    ]}),
    F(204,634,170,44,P.redBg,{r:10,stroke:P.red,sw:1,ch:[
      T('⏹  TERMINATE',0,12,170,20,{size:13,weight:600,color:P.red,align:'center'}),
    ]}),
    navBar(1),
  ]};
}

// ── Screen 3 · Tasks ────────────────────────────────────────────────────────
function s3() {
  const tasks=[
    {id:'#1482',ag:'scout-01',  label:'Refactor auth middleware → JWT refresh',dur:'2.3s', tok:'4.8k', st:'DONE' },
    {id:'#1481',ag:'forge-02',  label:'Generate OpenAPI spec for /payments',   dur:'4.1s', tok:'9.2k', st:'DONE' },
    {id:'#1480',ag:'scout-01',  label:'Write unit tests for UserService',      dur:'6.8s', tok:'12.4k',st:'DONE' },
    {id:'#1479',ag:'forge-02',  label:'Debug race condition in task scheduler',dur:'18.2s',tok:'31.0k',st:'DONE' },
    {id:'#1478',ag:'cipher-04', label:'Analyse codebase dependency graph',     dur:'—',    tok:'—',    st:'ERROR'},
    {id:'#1477',ag:'scout-01',  label:'Improve error messages in CLI output',  dur:'1.9s', tok:'3.2k', st:'DONE' },
  ];
  const stC={DONE:P.mint,ERROR:P.red};
  const stBg={DONE:P.mintBg,ERROR:P.redBg};

  return { id:uid(), label:'Tasks', width:390, height:844, fill:P.bg, children:[
    statusBar(),
    T('Task Stream',16,56,200,26,{size:22,weight:700,color:P.fg}),
    T('Real-time · all agents',16,86,200,14,{size:12,color:P.muted}),
    // filter chips
    F(16,108,358,28,'transparent',{ch:
      ['All','Done','Error','Active'].map((c,i)=>{
        const cw=c.length*8+20, cx=[0,56,112,166][i], active=i===0;
        return F(cx,0,cw,26,active?P.violetGl:P.surface,{r:13,stroke:active?P.violet:P.border,sw:1,ch:[
          T(c,10,5,cw-20,16,{size:11,weight:active?600:400,color:active?P.violetLt:P.muted,align:'center'}),
        ]});
      })
    }),
    F(16,144,358,18,'transparent',{ch:[
      T('TASK',0,2,200,12,{size:9,color:P.dim,weight:600,ls:0.8}),
      T('DUR',220,2,60,12,{size:9,color:P.dim,weight:600,ls:0.8}),
      T('STATUS',302,2,52,12,{size:9,color:P.dim,weight:600,ls:0.8}),
    ]}),
    ...tasks.map((t,i)=>F(16,168+i*88,358,80,P.surface,{r:10,stroke:P.border,sw:1,ch:[
      M(t.id,14,12,50,14,{size:11,weight:700,color:P.dim}),
      T(t.ag,72,12,130,14,{font:'JetBrains Mono',size:11,color:P.muted}),
      T(t.label,14,32,296,16,{size:12,color:P.fg,weight:500}),
      M(t.dur,14,56,54,14,{size:11,color:P.fg2}),
      M(t.tok+' tok',74,56,80,14,{size:11,color:P.muted}),
      pill(t.st,stC[t.st],stBg[t.st],268,52),
    ]})),
    navBar(2),
  ]};
}

// ── Screen 4 · Budget ───────────────────────────────────────────────────────
function s4() {
  const dBars=[0.4,0.5,0.5,0.7,0.6,0.8,0.75,0.65,0.9,0.7,0.85,0.95,0.8,1.0,0.88];
  const agC=[
    {name:'scout-01', cost:'$0.42',pct:51,color:P.violet},
    {name:'forge-02', cost:'$0.31',pct:37,color:P.sky},
    {name:'relay-03', cost:'$0.08',pct:10,color:P.amber},
    {name:'cipher-04',cost:'$0.02',pct:2, color:P.red},
  ];
  return { id:uid(), label:'Budget', width:390, height:844, fill:P.bg, children:[
    statusBar(),
    T('Budget',16,56,200,26,{size:22,weight:700,color:P.fg}),
    T('Token spend · March 2026',16,86,220,14,{size:12,color:P.muted}),
    F(16,110,358,90,P.surface,{r:12,stroke:P.border,sw:1,ch:[
      T("TODAY'S SPEND",14,14,160,11,{size:9,color:P.muted,weight:600,ls:0.8}),
      T('MONTHLY LIMIT',200,14,140,11,{size:9,color:P.muted,weight:600,ls:0.8}),
      M('$0.83',14,32,120,36,{size:32,weight:800,color:P.fg}),
      M('$24.00',200,32,140,28,{size:22,weight:700,color:P.muted}),
      F(14,74,200,6,P.border,{r:3,ch:[F(0,0,14,6,P.mint,{r:3})]}),
      T('3.5% used',222,70,120,12,{size:10,color:P.mint}),
    ]}),
    F(16,212,358,108,P.surface,{r:12,stroke:P.border,sw:1,ch:[
      T('DAILY COST — last 15 days',14,12,250,11,{size:9,color:P.muted,weight:600,ls:0.8}),
      M('Mar 30',290,8,54,14,{size:10,color:P.violet,align:'right'}),
      F(14,28,dBars.length*22,62,'transparent',{ch:dBars.map((v,i)=>{
        const bh=Math.round(v*62);
        return F(i*22,62-bh,18,bh,i===14?P.violet:P.violetGl,{r:2});
      })}),
      T('Mar 16',14,96,60,10,{size:9,color:P.dim}),
      T('Today',314,96,40,10,{size:9,color:P.dim,align:'right'}),
    ]}),
    F(16,332,358,72,P.surface2,{r:10,stroke:P.border,sw:1,ch:[
      T('MONTHLY PROJECTION',14,12,200,11,{size:9,color:P.muted,weight:600,ls:0.8}),
      M('$8.20',14,30,120,26,{size:22,weight:700,color:P.mint}),
      T('↓ 66% under budget · at current rate',140,40,200,14,{size:11,color:P.mint}),
      T('Limit: $24.00 / mo',14,56,200,12,{size:10,color:P.muted}),
    ]}),
    T('SPEND BY AGENT',16,414,200,11,{size:9,color:P.muted,weight:600,ls:0.8}),
    ...agC.map((a,i)=>F(16,432+i*62,358,52,P.surface,{r:8,stroke:P.border,sw:1,ch:[
      E(16,22,8,a.color),
      M(a.name,32,12,140,14,{size:12,color:P.fg}),
      F(32,32,220,6,P.border,{r:3,ch:[F(0,0,Math.round(220*a.pct/100),6,a.color,{r:3})]}),
      M(a.cost,290,14,54,18,{size:15,weight:700,color:P.fg,align:'right'}),
      T(a.pct+'%',290,34,54,12,{size:10,color:P.muted,align:'right'}),
    ]})),
    navBar(3),
  ]};
}

// ── Screen 5 · Alerts ───────────────────────────────────────────────────────
function s5() {
  const alerts=[
    {level:'CRITICAL',title:'cipher-04 unresponsive',
      detail:'No heartbeat for 47m. Auto-restart failed ×3. Manual intervention required.',
      color:P.red,bg:P.redBg,time:'47m'},
    {level:'WARNING',title:'forge-02 latency spike',
      detail:'P95 latency exceeded 2,000ms threshold for 8 consecutive tasks.',
      color:P.amber,bg:P.amberBg,time:'2h'},
    {level:'INFO',title:'scout-01 context at 56%',
      detail:'Context window above 50%. Consider compressing or splitting this task.',
      color:P.sky,bg:P.skyBg,time:'3h'},
    {level:'RESOLVED',title:'relay-03 queue drained',
      detail:'Queue emptied at 07:14 UTC. Agent idle, pending new assignment.',
      color:P.mint,bg:P.mintBg,time:'4h'},
  ];
  const chipX=[0,96,186,244];
  const chipLabels=['1 critical','1 warning','1 info','1 resolved'];
  const chipC=[P.red,P.amber,P.sky,P.mint];
  const chipBg=[P.redBg,P.amberBg,P.skyBg,P.mintBg];

  return { id:uid(), label:'Alerts', width:390, height:844, fill:P.bg, children:[
    statusBar(),
    T('Alerts',16,56,200,26,{size:22,weight:700,color:P.fg}),
    F(16,90,358,28,'transparent',{ch:chipLabels.map((label,i)=>{
      const cw=label.length*7+20;
      return F(chipX[i],0,cw,26,chipBg[i],{r:13,stroke:chipC[i],sw:1,ch:[
        T(label,10,5,cw-20,16,{size:11,weight:600,color:chipC[i]}),
      ]});
    })}),
    ...alerts.map((a,i)=>{
      const cy=130+i*148;
      return F(16,cy,358,136,a.bg,{r:12,stroke:a.color,sw:1,ch:[
        pill(a.level,a.color,a.bg,14,14),
        T(a.time+' ago',298,18,46,12,{size:10,color:P.muted,align:'right'}),
        T(a.title,14,42,330,18,{size:14,weight:700,color:P.fg}),
        T(a.detail,14,64,330,44,{size:11,color:P.fg2,lh:17}),
        T(a.level==='RESOLVED'?'View log →':'Investigate →',14,114,200,14,{size:11,weight:600,color:a.color}),
      ]});
    }),
    navBar(4),
  ]};
}

// ── Assemble ────────────────────────────────────────────────────────────────
const screens=[s1(),s2(),s3(),s4(),s5()];
const pen={
  version:'2.8',
  name:'QUASAR — AI Agent Fleet Observatory',
  screens:screens.map((s,i)=>({...s,x:i*430,y:0})),
};

const outPath=path.join(__dirname,'quasar.pen');
fs.writeFileSync(outPath,JSON.stringify(pen,null,2));
console.log('✓ quasar.pen written —',screens.length,'screens,',Math.round(JSON.stringify(pen).length/1024)+'KB');
console.log('  Screens: Fleet · Observe · Tasks · Budget · Alerts');
console.log('  Dark palette: #0A0C12 + violet #8B6FEE + mint #2CE5A8');
