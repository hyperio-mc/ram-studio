'use strict';
// nexus2-app.js
// NEXUS — AI Agent Orchestration Platform
// Design Heartbeat — Mar 21, 2026
//
// Inspired by:
//   • LangChain landing on land-book.com — dark navy, glowing node graph, "Ship reliable agents"
//   • Capacity on land-book.com — bento-grid capability showcase, dark + multi-panel
//   • Runlayer on land-book.com — deep dark purple/violet, isometric skill-node connections
//   • Darknode on Awwwards — pure black, AI automation workflow canvas aesthetic

const fs   = require('fs');
const path = require('path');

const P = {
  bg:        '#050810',
  surface:   '#0c0f1e',
  surface2:  '#131728',
  surface3:  '#1a2035',
  border:    '#1e2845',
  border2:   '#2a3660',
  muted:     '#3d4f7a',
  fg2:       '#8090b8',
  fg:        '#dce4f8',
  white:     '#f0f4ff',
  accent:    '#7c5cfc',
  accentLt:  '#9b80ff',
  accentDim: '#3d2e7e',
  cyan:      '#3dc9e8',
  teal:      '#22d3a8',
  amber:     '#f0a040',
  red:       '#ff4560',
  green:     '#34d99b',
};

let _id = 0;
const uid = () => `n${++_id}`;

const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill || P.bg,
  clip: opts.clip !== undefined ? opts.clip : false,
  ...(opts.r  !== undefined ? { cornerRadius: opts.r  } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.ch || [],
});

const T = (content, x, y, w, h, opts = {}) => ({
  id: uid(), type: 'text', content, x, y, width: w, height: h,
  textGrowth: 'fixed-width-height',
  fontSize: opts.size || 13,
  fontWeight: String(opts.weight || 400),
  fill: opts.fill || P.fg,
  textAlign: opts.align || 'left',
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh !== undefined ? { lineHeight:    opts.lh } : {}),
  ...(opts.opacity !== undefined ? { opacity:  opts.opacity } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const HLine = (x, y, w, col) => F(x, y, w, 1, col || P.border, {});
const VLine = (x, y, h, col) => F(x, y, 1, h, col || P.border, {});

// Radial glow
const Glow = (cx, cy, r, color, s = 1) => {
  const hex2 = n => Math.round(n).toString(16).padStart(2,'0');
  return [
    E(cx-r*2.5, cy-r*2.5, r*5,   r*5,   color+hex2(0x08*s), {}),
    E(cx-r*1.6, cy-r*1.6, r*3.2, r*3.2, color+hex2(0x12*s), {}),
    E(cx-r,     cy-r,     r*2,   r*2,   color+hex2(0x22*s), {}),
    E(cx-r*.5,  cy-r*.5,  r,     r,     color+hex2(0x38*s), {}),
  ];
};

const Pill = (x, y, text, color, w) => {
  const pw = w || text.length*7+24;
  return F(x, y, pw, 22, color+'22', { r:11, stroke:color+'44', sw:1, ch:[
    E(10,7,8,8,color,{}),
    T(text, 22,4, pw-26,14, {size:9, fill:color, weight:700, ls:0.8}),
  ]});
};

// Bento capability tile
const BentoTile = (x,y,w,h, icon, title, desc, col) => F(x,y,w,h, P.surface2, {r:12, stroke:P.border, sw:1, ch:[
  F(0,0,w,2, col+'60', {r:1}),
  E(20,20,36,36, col+'20', {}),
  T(icon, 28,28, 20,20, {size:14, fill:col, align:'center'}),
  T(title, 16,68, w-32,16, {size:11, fill:P.white, weight:700, ls:0.2}),
  T(desc,  16,88, w-32,h-104, {size:9.5, fill:P.fg2, lh:1.5}),
  E(w-20, h-20, 8,8, col+'40', {}),
]});

// Pipeline node
const Node = (x,y, label, sub, col, sz=48) => [
  E(x-sz*.65, y-sz*.65, sz*1.3,sz*1.3, col+'20', {}),
  E(x-sz/2,   y-sz/2,   sz,sz,         P.surface2, {stroke:col, sw:1.5}),
  E(x-sz*.22, y-sz*.22, sz*.44,sz*.44, col+'60', {}),
  E(x-sz*.12, y-sz*.12, sz*.24,sz*.24, col, {}),
  T(label, x-50, y+sz/2+6,  100,12, {size:9, fill:P.fg, weight:600, align:'center', ls:0.3}),
  T(sub,   x-50, y+sz/2+20, 100,11, {size:8, fill:P.muted, align:'center'}),
];

const MetricCard = (x,y,w,h, label, val, unit, change, col) => F(x,y,w,h, P.surface2, {r:10, stroke:P.border, sw:1, ch:[
  T(label,  14,14, w-28,14, {size:9, fill:P.muted, weight:500, ls:1.2}),
  T(val,    14,34, w-28,36, {size:26, fill:col||P.fg, weight:800, ls:-0.5}),
  T(unit,   14+val.length*15, 44, 40,16, {size:10, fill:P.muted}),
  T(change, 14,h-26, w-28,14, {size:9, fill:col||P.green}),
]});

// ─── SCREEN 1: Mobile Dashboard ─────────────────────────────────────────────
function mobileDashboard(ox) {
  const W=375, H=812;
  return F(ox,0,W,H, P.bg, {clip:true, ch:[
    ...Glow(340,80,80, P.accent, 0.8),

    T('9:41', 16,16,60,16, {size:12, weight:600}),
    T('◈ ◈ ◈', 296,16,64,16, {size:8, fill:P.muted}),

    T('NEXUS', 20,48,120,20, {size:15, weight:900, fill:P.white, ls:3}),
    E(350,50,8,8, P.green, {}),
    T('LIVE', 316,50,32,8, {size:7, fill:P.green, weight:700, ls:1}),

    MetricCard(16,  82,100,72, 'ACTIVE', '12','', '▲ 3 today',  P.teal),
    MetricCard(124, 82,100,72, 'RUNS',  '847','', '↑ 94% pass', P.accent),
    MetricCard(232, 82,127,72, 'LATENCY','142','ms','▼ -8ms',   P.cyan),

    T('LIVE PIPELINES', 16,170,200,14, {size:9, fill:P.muted, ls:2, weight:600}),
    T('View all →', 300,170,60,14, {size:9, fill:P.accent}),

    ...['RESEARCH AGENT','CODE REVIEW','DATA EXTRACT'].map((name,i)=>{
      const colors   = [P.teal,P.accent,P.cyan];
      const statuses = ['RUNNING','QUEUED','DONE'];
      const durations= ['2m 14s','—','8m 02s'];
      const steps=[5,3,7], done=[3,0,7];
      return F(16,192+i*86, 343,74, P.surface2, {r:10, stroke:P.border, sw:1, ch:[
        F(0,0,3,74, colors[i]+'80', {r:1}),
        T(name, 16,14, 200,14, {size:11, fill:P.fg, weight:700, ls:0.3}),
        Pill(16,36, statuses[i], colors[i]),
        T(durations[i], 220,16, 100,12, {size:10, fill:P.fg2, align:'right'}),
        F(16,56,260,4, P.border, {r:2}),
        F(16,56, Math.round(260*done[i]/steps[i]),4, colors[i]+'aa', {r:2}),
        T(`${done[i]}/${steps[i]} steps`, 284,52,60,12, {size:9, fill:P.muted, align:'right'}),
      ]});
    }),

    T('RECENT EVENTS', 16,458,200,14, {size:9, fill:P.muted, ls:2, weight:600}),
    ...['Tool call: web_search','Memory write: user_ctx','Output: report.md','Error: rate_limit'].map((ev,i)=>{
      const dots = [P.cyan,P.teal,P.green,P.red];
      const times= ['just now','12s ago','1m ago','3m ago'];
      return F(16,480+i*48, 343,38, P.surface, {r:8, stroke:P.border, sw:1, ch:[
        E(14,14,10,10, dots[i]+'40', {}),
        E(17,17,4,4,   dots[i], {}),
        T(ev,    34,12,240,14, {size:10, fill:P.fg}),
        T(times[i],280,12,60,14, {size:9, fill:P.muted, align:'right'}),
      ]});
    }),

    F(0,748,W,64, P.surface, {ch:[
      HLine(0,0,W, P.border),
      ...['Dashboard','Build','Monitor','Docs'].map((lbl,i)=>{
        const icons=['◈','⬡','◎','≡'], active=i===0;
        return F(16+i*86,8,74,48,'transparent',{ch:[
          T(icons[i],27,6,20,20, {size:14, fill:active?P.accent:P.muted, align:'center'}),
          T(lbl,0,28,74,14, {size:9, fill:active?P.accent:P.muted, weight:active?700:400, align:'center'}),
        ]});
      }),
    ]}),
  ]});
}

// ─── SCREEN 2: Mobile Build ──────────────────────────────────────────────────
function mobileBuild(ox) {
  const W=375, H=812;
  return F(ox,0,W,H, P.bg, {clip:true, ch:[
    ...Glow(60,200,60, P.cyan, 0.6),
    ...Glow(330,500,50, P.accent, 0.7),

    T('9:41', 16,16,60,16, {size:12, weight:600}),
    T('◈ ◈ ◈', 296,16,64,16, {size:8, fill:P.muted}),

    T('Build', 20,48,200,24, {size:20, weight:900, fill:P.white}),
    T('Select capabilities for your agent', 20,76,300,14, {size:11, fill:P.fg2}),

    F(16,100,343,38, P.surface2, {r:10, stroke:P.border, sw:1, ch:[
      T('⌕',12,10,18,18, {size:14, fill:P.muted}),
      T('Search tools & integrations...',34,12,280,14, {size:11, fill:P.muted}),
    ]}),

    ...['All','Tools','Memory','Models','APIs'].map((tab,i)=>{
      const active=i===0;
      return F(16+i*68,150,60,26, active?P.accent+'30':P.surface2, {r:13, stroke:active?P.accent:P.border, sw:1, ch:[
        T(tab,0,6,60,14, {size:10, fill:active?P.accent:P.fg2, weight:active?700:400, align:'center'}),
      ]});
    }),

    BentoTile(16, 190,163,150, '⌀','Web Search',  'Real-time browsing\nand extraction',    P.cyan),
    BentoTile(196,190,163,150, '◈','Code Exec',   'Sandboxed Python/JS\nexecution env',    P.accent),
    BentoTile(16, 352,100,120, '▤','Memory',      'Vector store with\nsemantic retrieval', P.teal),
    BentoTile(128,352,100,120, '≋','RAG Pipeline','Document index &\nretrieval chains',    P.accentLt),
    BentoTile(240,352,119,120, '⬡','APIs',        'REST / GraphQL\ntool connectors',       P.amber),
    BentoTile(16, 484,220,120, '◎','Multi-Agent', 'Spawn sub-agents,\nshare context',      P.accent),
    BentoTile(248,484,111,120, '△','Scheduler',   'Cron + event\ntriggers',                P.cyan),

    F(16,620,343,48, P.accent, {r:14, ch:[
      T('+ Create Agent',0,14,343,20, {size:13, fill:P.white, weight:700, align:'center', ls:0.3}),
    ]}),

    F(0,748,W,64, P.surface, {ch:[
      HLine(0,0,W,P.border),
      ...['Dashboard','Build','Monitor','Docs'].map((lbl,i)=>{
        const icons=['◈','⬡','◎','≡'], active=i===1;
        return F(16+i*86,8,74,48,'transparent',{ch:[
          T(icons[i],27,6,20,20, {size:14, fill:active?P.accent:P.muted, align:'center'}),
          T(lbl,0,28,74,14, {size:9, fill:active?P.accent:P.muted, weight:active?700:400, align:'center'}),
        ]});
      }),
    ]}),
  ]});
}

// ─── SCREEN 3: Mobile Monitor ────────────────────────────────────────────────
function mobileMonitor(ox) {
  const W=375, H=812;
  const nodes=[
    {x:187,y:195, label:'TRIGGER', sub:'cron: */5m',  col:P.cyan},
    {x:187,y:290, label:'PLANNER', sub:'gpt-4o',      col:P.accent},
    {x:100,y:385, label:'SEARCH',  sub:'web_search',  col:P.teal},
    {x:274,y:385, label:'CODE',    sub:'exec_env',    col:P.accentLt},
    {x:187,y:480, label:'WRITER',  sub:'claude-3',    col:P.amber},
    {x:187,y:572, label:'OUTPUT',  sub:'report.md',   col:P.green},
  ];
  return F(ox,0,W,H, P.bg, {clip:true, ch:[
    ...Glow(187,385,120, P.accent, 0.5),
    ...Glow(100,385, 50, P.teal,   0.6),

    T('9:41', 16,16,60,16, {size:12, weight:600}),
    T('◈ ◈ ◈', 296,16,64,16, {size:8, fill:P.muted}),

    T('Monitor', 20,48,200,24, {size:20, weight:900, fill:P.white}),
    Pill(20,78, 'RESEARCH AGENT', P.teal, 132),
    T('Run #847', 260,80,80,14, {size:10, fill:P.fg2, align:'right'}),

    // connectors
    VLine(187,217,56, P.border2),
    VLine(187,312,48, P.accent+'60'),
    HLine(100,360,87, P.border2),
    HLine(187,360,87, P.border2),
    VLine(100,360,26, P.border2),
    VLine(274,360,26, P.border2),
    VLine(100,407,56, P.teal+'60'),
    VLine(274,407,56, P.accentLt+'60'),
    HLine(100,463,87, P.border2),
    HLine(187,463,87, P.border2),
    VLine(187,463,17, P.border2),
    VLine(187,502,53, P.amber+'60'),

    ...nodes.flatMap(n=>Node(n.x,n.y, n.label,n.sub, n.col, 44)),

    F(16,634,343,60, P.surface2, {r:10, stroke:P.border, sw:1, ch:[
      VLine(110,10,40, P.border),
      VLine(220,10,40, P.border),
      T('ELAPSED',  14,10,88,12, {size:8, fill:P.muted, ls:1}),
      T('2m 14s',   14,26,88,22, {size:16, fill:P.fg, weight:700}),
      T('TOKENS',  124,10,82,12, {size:8, fill:P.muted, ls:1}),
      T('4,820',   124,26,82,22, {size:16, fill:P.cyan, weight:700}),
      T('COST',    234,10,88,12, {size:8, fill:P.muted, ls:1}),
      T('$0.014',  234,26,88,22, {size:16, fill:P.teal, weight:700}),
    ]}),

    F(16, 708,163,42, P.surface2, {r:10, stroke:P.border, sw:1, ch:[
      T('▶ Replay',0,12,163,18, {size:12, fill:P.fg2, weight:600, align:'center'}),
    ]}),
    F(196,708,163,42, P.red+'22', {r:10, stroke:P.red+'44', sw:1, ch:[
      T('■ Stop',0,12,163,18, {size:12, fill:P.red, weight:700, align:'center'}),
    ]}),

    F(0,760,W,52, P.surface, {ch:[
      HLine(0,0,W,P.border),
      ...['Dashboard','Build','Monitor','Docs'].map((lbl,i)=>{
        const icons=['◈','⬡','◎','≡'], active=i===2;
        return F(16+i*86,8,74,36,'transparent',{ch:[
          T(icons[i],27,2,20,16, {size:12, fill:active?P.accent:P.muted, align:'center'}),
          T(lbl,0,20,74,12, {size:8, fill:active?P.accent:P.muted, weight:active?700:400, align:'center'}),
        ]});
      }),
    ]}),
  ]});
}

// ─── SCREEN 4: Desktop Overview ──────────────────────────────────────────────
function desktopOverview(ox) {
  const W=1440, H=900;
  return F(ox,0,W,H, P.bg, {clip:true, ch:[
    ...Glow(820,300,260, P.accent, 0.4),
    ...Glow(1200,600,180, P.cyan, 0.3),
    ...Glow(300,600,150, P.teal, 0.3),

    F(0,0,W,60, P.surface+'ee', {ch:[
      HLine(0,59,W,P.border),
      T('NEXUS',20,18,100,24, {size:16, weight:900, fill:P.white, ls:4}),
      T('Orchestrate',180,20,100,20, {size:12, fill:P.fg2}),
      T('Deploy',     290,20, 80,20, {size:12, fill:P.fg2}),
      T('Monitor',    380,20, 90,20, {size:12, fill:P.fg2}),
      T('Docs',       478,20, 60,20, {size:12, fill:P.fg2}),
      Pill(1120,18, 'SYSTEM HEALTHY', P.green, 136),
      F(1290,14,120,32, P.accent, {r:8, ch:[
        T('Start Building',0,8,120,16, {size:11, fill:P.white, weight:700, align:'center'}),
      ]}),
    ]}),

    T('Orchestrate AI', 60,100,600,72, {size:56, fill:P.white,    weight:900, ls:-1.5}),
    T('Agents at Scale',60,168,600,72, {size:56, fill:P.accentLt, weight:900, ls:-1.5}),
    T('Build, connect, and deploy multi-agent pipelines.\nFrom prototype to production in minutes.',
      60,250,540,56, {size:16, fill:P.fg2, lh:1.7}),

    F(60,320,160,44, P.accent,  {r:10, ch:[T('Get Started →',0,12,160,20, {size:13, fill:P.white,  weight:700, align:'center'})]}),
    F(236,320,140,44,P.surface2,{r:10, stroke:P.border2, sw:1, ch:[T('View Demo',0,12,140,20, {size:13, fill:P.fg, weight:600, align:'center'})]}),

    ...['12K+','99.9%','<150ms','50+'].map((v,i)=>{
      const labels=['Agents deployed','Uptime SLA','Avg latency','Integrations'];
      const cols  =[P.teal,P.green,P.cyan,P.accentLt];
      return F(60+i*140,388,130,60,'transparent',{ch:[
        T(v, 0,4, 130,30, {size:22, fill:cols[i], weight:800, ls:-0.5}),
        T(labels[i],0,38,130,16, {size:10, fill:P.muted}),
      ]});
    }),

    // Center orchestrator node (glowing)
    ...Glow(1040,430,80, P.accent, 0.7),
    E(1040-54,430-54,108,108, P.surface2, {stroke:P.accent, sw:2}),
    E(1040-38,430-38, 76, 76, P.accentDim+'60', {}),
    E(1040-22,430-22, 44, 44, P.accent+'40', {}),
    E(1040-10,430-10, 20, 20, P.accent, {}),
    T('NEXUS',       1040-50, 430+64, 100,14, {size:10, fill:P.accentLt, weight:800, ls:2, align:'center'}),
    T('ORCHESTRATOR',1040-55, 430+80, 110,12, {size:7.5, fill:P.muted, ls:1.5, align:'center'}),

    ...[
      {x:840, y:280,label:'PLANNER',   sub:'gpt-4o',    col:P.cyan},
      {x:1240,y:280,label:'RETRIEVAL', sub:'vector-db', col:P.teal},
      {x:780, y:460,label:'SEARCH',    sub:'web_tool',  col:P.accentLt},
      {x:1300,y:460,label:'CODE',      sub:'exec_env',  col:P.amber},
      {x:840, y:640,label:'WRITER',    sub:'claude-3',  col:P.accent},
      {x:1240,y:640,label:'OUTPUT',    sub:'webhook',   col:P.green},
    ].flatMap(n=>[
      F(Math.min(n.x,1040),Math.min(n.y,430),
        Math.max(Math.abs(n.x-1040),1),Math.max(Math.abs(n.y-430),1),
        n.col+'30', {}),
      ...Node(n.x,n.y, n.label,n.sub, n.col, 50),
    ]),

    ...['Web Search','Code Exec','Vector Memory','Multi-Agent','Streaming'].map((cap,i)=>{
      const cols =[P.cyan,P.accent,P.teal,P.accentLt,P.amber];
      const icons=['⌀','◈','▤','⬡','≋'];
      return F(60+i*276,740,258,120, P.surface2, {r:10, stroke:P.border, sw:1, ch:[
        F(0,0,258,2, cols[i]+'70', {}),
        E(20,20,32,32, cols[i]+'25', {}),
        T(icons[i],26,26,20,20, {size:13, fill:cols[i], align:'center'}),
        T(cap, 62,22,180,16, {size:12, fill:P.fg, weight:700}),
        T('Built-in · Zero config', 62,42,180,14, {size:10, fill:P.muted}),
        F(16,72,80,26, cols[i]+'20', {r:6, ch:[
          T('Add →',0,6,80,14, {size:10, fill:cols[i], weight:600, align:'center'}),
        ]}),
      ]});
    }),
  ]});
}

// ─── SCREEN 5: Desktop Pipeline Builder ─────────────────────────────────────
function desktopBuilder(ox) {
  const W=1440, H=900;
  return F(ox,0,W,H, P.bg, {clip:true, ch:[
    // subtle grid dots
    ...Array.from({length:12},(_,row)=>Array.from({length:20},(_,col)=>
      E(240+col*62, 60+row*72, 2,2, P.border+'80', {})
    )).flat(),
    ...Glow(800,450,200, P.accent, 0.25),

    F(0,0,W,52, P.surface, {ch:[
      HLine(0,51,W,P.border),
      T('NEXUS',20,14,100,24, {size:14, weight:900, fill:P.white, ls:3}),
      T('Pipeline Builder',150,16,200,20, {size:12, fill:P.fg2}),
      T('research-pipeline-v3',600,16,220,20, {size:11, fill:P.muted}),
      Pill(870,14, 'AUTO-SAVED', P.green, 104),
      F(1200,10,100,32, P.surface2, {r:8, stroke:P.border2, sw:1, ch:[
        T('▶ Run Test',0,9,100,14, {size:10, fill:P.fg2, weight:600, align:'center'}),
      ]}),
      F(1312,10,110,32, P.accent, {r:8, ch:[
        T('Deploy →',0,9,110,14, {size:10, fill:P.white, weight:700, align:'center'}),
      ]}),
    ]}),

    // Left sidebar
    F(0,52,220,H-52, P.surface, {ch:[
      VLine(219,0,H-52, P.border),
      T('COMPONENTS',16,18,180,14, {size:9, fill:P.muted, ls:2, weight:600}),
      ...['Trigger','LLM Call','Tool Use','Memory R/W','Condition','Output'].map((comp,i)=>{
        const cols=[P.cyan,P.accent,P.teal,P.accentLt,P.amber,P.green];
        return F(12,48+i*52,196,42, P.surface2, {r:8, stroke:P.border, sw:1, ch:[
          E(12,12,18,18, cols[i]+'30', {}),
          E(17,17,8,8, cols[i], {}),
          T(comp,36,12,150,18, {size:11, fill:P.fg, weight:600}),
        ]});
      }),
      HLine(12,368,196, P.border),
      T('SAVED AGENTS',16,382,180,14, {size:9, fill:P.muted, ls:2, weight:600}),
      ...['research-v2','code-reviewer','data-extractor'].map((name,i)=>
        F(12,406+i*44,196,34,'transparent',{ch:[
          T('⬡',12,8,18,18, {size:12, fill:P.accent}),
          T(name,34,10,156,14, {size:10, fill:P.fg2}),
        ]})
      ),
    ]}),

    // Canvas nodes
    F(330,180,200,100, P.surface2, {r:14, stroke:P.cyan, sw:1.5, ch:[
      F(0,0,200,2, P.cyan+'80', {}),
      E(16,16,28,28, P.cyan+'25', {}), E(22,22,16,16, P.cyan+'50', {}), E(27,27,6,6, P.cyan, {}),
      T('TRIGGER',  52,12,140,12, {size:9, fill:P.cyan, weight:700, ls:1.5}),
      T('Cron Schedule',52,28,140,16, {size:12, fill:P.fg, weight:600}),
      T('*/5 * * * *', 16,62,168,14, {size:10, fill:P.muted}),
      E(192,46,12,12, P.cyan+'40', {stroke:P.cyan, sw:1}),
    ]}),

    ...Glow(430,430,50, P.accent, 0.5),
    F(330,380,200,110, P.surface2, {r:14, stroke:P.accent, sw:2, ch:[
      F(0,0,200,2, P.accent, {}),
      E(16,18,28,28, P.accent+'25', {}), E(22,24,16,16, P.accent+'50', {}), E(27,29,6,6, P.accent, {}),
      T('LLM CALL',   52,14,140,12, {size:9, fill:P.accentLt, weight:700, ls:1.5}),
      T('Planner Agent',52,30,140,16, {size:12, fill:P.fg, weight:600}),
      T('Model: gpt-4o',16,56,120,12, {size:9.5, fill:P.muted}),
      T('Temp: 0.2',   16,72,120,12, {size:9.5, fill:P.muted}),
      E(0,50,12,12, P.accent+'40', {stroke:P.accent, sw:1}),
      E(192,50,12,12, P.accent+'40', {stroke:P.accent, sw:1}),
    ]}),

    F(630,300,180,90, P.surface2, {r:12, stroke:P.teal, sw:1.5, ch:[
      F(0,0,180,2, P.teal+'70', {}),
      T('TOOL USE',  14,12,140,12, {size:9, fill:P.teal, weight:700, ls:1.5}),
      T('Web Search',14,28,150,16, {size:12, fill:P.fg, weight:600}),
      T('max_results: 5',14,52,150,12, {size:9.5, fill:P.muted}),
      E(0,40,12,12, P.teal+'40', {stroke:P.teal, sw:1}),
      E(172,40,12,12, P.teal+'40', {stroke:P.teal, sw:1}),
    ]}),
    F(630,420,180,90, P.surface2, {r:12, stroke:P.accentLt, sw:1.5, ch:[
      F(0,0,180,2, P.accentLt+'70', {}),
      T('TOOL USE', 14,12,140,12, {size:9, fill:P.accentLt, weight:700, ls:1.5}),
      T('Code Exec', 14,28,150,16, {size:12, fill:P.fg, weight:600}),
      T('runtime: python3',14,52,150,12, {size:9.5, fill:P.muted}),
      E(0,40,12,12, P.accentLt+'40', {stroke:P.accentLt, sw:1}),
      E(172,40,12,12, P.accentLt+'40', {stroke:P.accentLt, sw:1}),
    ]}),

    F(920,370,180,100, P.surface2, {r:12, stroke:P.green, sw:1.5, ch:[
      F(0,0,180,2, P.green+'70', {}),
      T('OUTPUT',  14,12,150,12, {size:9, fill:P.green, weight:700, ls:1.5}),
      T('Webhook POST',14,28,150,16, {size:12, fill:P.fg, weight:600}),
      T('url: /api/results',14,52,150,12, {size:9.5, fill:P.muted}),
      T('format: JSON',14,66,150,12, {size:9.5, fill:P.muted}),
      E(0,44,12,12, P.green+'40', {stroke:P.green, sw:1}),
    ]}),

    VLine(430,280,100, P.cyan+'60'),
    HLine(430,435,200, P.accent+'60'),
    VLine(630,345,75, P.teal+'60'),
    HLine(810,345,110, P.teal+'60'),
    HLine(810,465,110, P.accentLt+'60'),

    // Right inspector panel
    F(1180,52,260,H-52, P.surface, {ch:[
      VLine(0,0,H-52, P.border),
      T('INSPECTOR',16,18,200,14, {size:9, fill:P.muted, ls:2, weight:600}),
      T('Planner Agent',16,44,220,18, {size:14, fill:P.fg, weight:700}),
      Pill(16,70, 'LLM CALL', P.accent, 80),
      HLine(16,104,228, P.border),
      T('MODEL',16,116,100,12, {size:9, fill:P.muted, ls:1}),
      F(16,132,228,34, P.surface2, {r:8, stroke:P.border, sw:1, ch:[
        T('gpt-4o',12,10,200,14, {size:11, fill:P.fg}),
        T('▾',210,10,12,14, {size:12, fill:P.muted}),
      ]}),
      T('TEMPERATURE',16,178,120,12, {size:9, fill:P.muted, ls:1}),
      F(16,194,228,8, P.border, {r:4}),
      F(16,194,46,8, P.accent, {r:4}),
      E(57,190,16,16, P.accent, {}),
      T('0.2',200,192,40,12, {size:10, fill:P.accent}),
      T('MAX TOKENS',16,222,120,12, {size:9, fill:P.muted, ls:1}),
      F(16,238,228,34, P.surface2, {r:8, stroke:P.border, sw:1, ch:[
        T('4096',12,10,200,14, {size:11, fill:P.fg}),
      ]}),
      T('SYSTEM PROMPT',16,284,120,12, {size:9, fill:P.muted, ls:1}),
      F(16,300,228,80, P.surface2, {r:8, stroke:P.border, sw:1, ch:[
        T('You are a planning agent.\nBreak task into steps.\nReturn JSON action list.',
          10,10,208,60, {size:9.5, fill:P.fg2, lh:1.6}),
      ]}),
      HLine(16,396,228, P.border),
      T('CONNECTIONS',16,410,120,12, {size:9, fill:P.muted, ls:1, weight:600}),
      T('→ Web Search',16,428,228,14, {size:10, fill:P.teal}),
      T('→ Code Exec', 16,446,228,14, {size:10, fill:P.accentLt}),
      T('← Trigger',   16,464,228,14, {size:10, fill:P.cyan}),
    ]}),
  ]});
}

// ─── SCREEN 6: Desktop API Reference ────────────────────────────────────────
function desktopAPI(ox) {
  const W=1440, H=900;
  const codeLines=[
    {indent:0,color:P.muted,   content:'// Initialize NEXUS client'},
    {indent:0,color:P.cyan,    content:'import { NexusClient }'},
    {indent:0,color:P.fg,      content:"  from '@nexus/sdk'"},
    {indent:0,color:P.fg,      content:''},
    {indent:0,color:P.fg,      content:'const nexus = new NexusClient({'},
    {indent:1,color:P.teal,    content:"apiKey: process.env.NEXUS_KEY,"},
    {indent:1,color:P.teal,    content:"region: 'us-east-1',"},
    {indent:0,color:P.fg,      content:'});'},
    {indent:0,color:P.fg,      content:''},
    {indent:0,color:P.muted,   content:'// Run an agent pipeline'},
    {indent:0,color:P.fg,      content:'const run = await nexus.pipelines'},
    {indent:1,color:P.accentLt,content:'.run({'},
    {indent:2,color:P.teal,    content:"id: 'research-pipeline-v3',"},
    {indent:2,color:P.teal,    content:"input: { query: 'AI market 2026' },"},
    {indent:2,color:P.amber,   content:'stream: true,'},
    {indent:1,color:P.accentLt,content:'});'},
  ];
  return F(ox,0,W,H, P.bg, {clip:true, ch:[
    ...Glow(400,400,180, P.accent, 0.2),

    F(0,0,W,52, P.surface, {ch:[
      HLine(0,51,W,P.border),
      T('NEXUS',20,14,100,24, {size:14, weight:900, fill:P.white, ls:3}),
      T('API Reference',150,16,200,20, {size:12, fill:P.fg2}),
      T('v2.4.1',1300,16,80,20, {size:11, fill:P.muted}),
    ]}),

    // Left sidebar
    F(0,52,280,H-52, P.surface, {ch:[
      VLine(279,0,H-52, P.border),
      T('ENDPOINTS',20,18,220,14, {size:9, fill:P.muted, ls:2, weight:600}),
      ...[
        ['POST','/pipelines/run',    P.green],
        ['GET', '/pipelines/list',   P.cyan],
        ['GET', '/runs/{id}/status', P.cyan],
        ['DEL', '/runs/{id}/stop',   P.red],
        ['POST','/agents/create',    P.green],
        ['GET', '/agents/{id}',      P.cyan],
        ['PUT', '/agents/{id}',      P.amber],
        ['GET', '/metrics/summary',  P.cyan],
        ['POST','/webhooks/create',  P.green],
      ].map(([method,p,col],i)=>F(12,48+i*50,256,40, i===0?P.accentDim+'50':'transparent',{r:6,ch:[
        F(12,12,method.length*6+8,18, col+'25',{r:4,ch:[
          T(method,4,3,method.length*6,12, {size:8.5, fill:col, weight:700}),
        ]}),
        T(p, 12+method.length*6+16,11,200,14, {size:9.5, fill:i===0?P.fg:P.fg2}),
      ]})),
    ]}),

    // Code panel
    F(280,52,640,H-52, P.surface, {ch:[
      VLine(639,0,H-52, P.border),
      T('QUICK START',24,20,300,14, {size:9, fill:P.muted, ls:2, weight:600}),
      F(24,44,120,30, P.surface2, {r:6, stroke:P.accent+'80', sw:1, ch:[
        T('Node.js',0,8,120,14, {size:11, fill:P.accent, weight:600, align:'center'}),
      ]}),
      F(152,44,80,30,'transparent',{ch:[T('Python',0,8,80,14, {size:11, fill:P.muted, align:'center'})]}),
      F(240,44,60,30,'transparent',{ch:[T('curl',  0,8,60,14, {size:11, fill:P.muted, align:'center'})]}),

      F(24,86,592,codeLines.length*22+32, P.surface2, {r:10, stroke:P.border, sw:1, ch:[
        F(0,0,592,28, P.surface3, {r:10, ch:[
          E(16,10,8,8, P.red+'aa', {}),
          E(30,10,8,8, P.amber+'aa', {}),
          E(44,10,8,8, P.green+'aa', {}),
          T('pipeline-quickstart.js',200,8,200,12, {size:9.5, fill:P.muted, align:'center'}),
        ]}),
        ...codeLines.map((cl,i)=>T(cl.content, 16+cl.indent*16,42+i*22, 560-cl.indent*16,18, {size:11.5, fill:cl.color})),
      ]}),

      T('RESPONSE',24,86+codeLines.length*22+52,200,14, {size:9, fill:P.muted, ls:2, weight:600}),
      F(24,86+codeLines.length*22+74,592,160, P.surface2, {r:10, stroke:P.border, sw:1, ch:[
        F(0,0,592,28, P.surface3, {r:10, ch:[
          Pill(12,4,'200 OK',P.green,72),
          T('application/json',400,8,180,12, {size:9.5, fill:P.muted}),
        ]}),
        T('{',16,38,550,14, {size:11, fill:P.fg}),
        T('  "runId":    "run_abc123xyz",',   16,56,550,14, {size:11, fill:P.teal}),
        T('  "status":   "running",',         16,74,550,14, {size:11, fill:P.amber}),
        T('  "pipeline": "research-v3",',     16,92,550,14, {size:11, fill:P.teal}),
        T('  "streamUrl": "wss://stream.nexus.io/run_abc123"',16,110,550,14, {size:11, fill:P.cyan}),
        T('}',16,128,550,14, {size:11, fill:P.fg}),
      ]}),
    ]}),

    // Right: auth + params
    F(920,52,520,H-52, P.surface, {ch:[
      T('AUTHENTICATION',24,20,300,14, {size:9, fill:P.muted, ls:2, weight:600}),
      F(24,44,472,100, P.surface2, {r:12, stroke:P.border, sw:1, ch:[
        F(0,0,472,3, P.accent+'60', {}),
        T('API KEY',16,16,200,14, {size:9, fill:P.accentLt, weight:700, ls:1.5}),
        T('Bearer token in Authorization header',16,34,440,14, {size:10.5, fill:P.fg2}),
        F(16,58,340,28, P.bg, {r:6, ch:[
          T('nx_live_••••••••••••••••••••••••',12,7,300,14, {size:10, fill:P.muted}),
        ]}),
        F(368,58,88,28, P.accent+'30', {r:6, stroke:P.accent+'60', sw:1, ch:[
          T('Copy Key',0,7,88,14, {size:10, fill:P.accent, weight:600, align:'center'}),
        ]}),
      ]}),

      T('RATE LIMITS',24,164,300,14, {size:9, fill:P.muted, ls:2, weight:600}),
      ...['Starter','Pro','Enterprise'].map((tier,i)=>{
        const [runs,conc,col]=[
          ['100 runs/day','10 concurrent',P.fg2],
          ['10K runs/day','100 concurrent',P.accentLt],
          ['Unlimited','Unlimited',P.teal],
        ][i];
        return F(24,188+i*68,472,58, i===1?P.accentDim+'30':P.surface2, {r:10, stroke:i===1?P.accent+'60':P.border, sw:1, ch:[
          T(tier,16,14,120,16, {size:12, fill:col, weight:700}),
          T(runs, 220,14,120,16, {size:11, fill:P.fg2}),
          T(conc, 360,14,100,16, {size:11, fill:P.fg2}),
          ...(i===1?[Pill(16,36,'CURRENT PLAN',P.accent,104)]:[]),
        ]});
      }),

      T('POST /pipelines/run',24,408,400,14, {size:12, fill:P.fg, weight:700}),
      T('Execute a pipeline with input data.',24,428,472,14, {size:11, fill:P.fg2}),
      T('REQUEST BODY',24,460,200,14, {size:9, fill:P.muted, ls:2, weight:600}),
      ...[
        ['id',     'string', 'required','Pipeline ID to execute'],
        ['input',  'object', 'required','Input data for the pipeline'],
        ['stream', 'boolean','optional','Enable SSE streaming'],
        ['timeout','integer','optional','Max run time in seconds'],
      ].map(([param,type,req,desc],i)=>F(24,480+i*52,472,44, P.surface2, {r:8, stroke:P.border, sw:1, ch:[
        T(param,12,12,100,14, {size:10, fill:P.teal, weight:600}),
        F(118,10,type.length*6+12,22, P.surface3, {r:4, ch:[
          T(type,6,4,type.length*6,14, {size:9, fill:P.fg2}),
        ]}),
        F(230,10,req.length*6+12,22, req==='required'?P.amber+'20':P.surface3, {r:4, ch:[
          T(req,6,4,req.length*6,14, {size:9, fill:req==='required'?P.amber:P.muted}),
        ]}),
        T(desc,12,28,448,12, {size:9.5, fill:P.muted}),
      ]})
      )
    ]})
  ]});
}

// ─── Assemble + write ────────────────────────────────────────────────────────
const GAP=80, mW=375, dW=1440;
const screens=[
  mobileDashboard(0),
  mobileBuild(mW+GAP),
  mobileMonitor((mW+GAP)*2),
  desktopOverview((mW+GAP)*3),
  desktopBuilder((mW+GAP)*3+dW+GAP),
  desktopAPI((mW+GAP)*3+(dW+GAP)*2),
];

const pen={
  version:'2.8',
  name:'NEXUS — AI Agent Orchestration Platform',
  children:screens,
};

const outPath=path.join(__dirname,'nexus2.pen');
fs.writeFileSync(outPath, JSON.stringify(pen,null,2));
const kb=(fs.statSync(outPath).size/1024).toFixed(1);
function countEls(n){return 1+(n.children||[]).reduce((a,c)=>a+countEls(c),0);}
console.log(`✓ nexus2.pen — ${kb} KB`);
console.log(`  Screens: ${screens.length}`);
screens.forEach((s,i)=>console.log(`    ${i+1}: ${s.width}x${s.height}  (${countEls(s)} elements)`));
