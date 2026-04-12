// TRACE — API Observability Engine
// Inspired by:
//   • Evervault.com (Godly.website) — dark enterprise precision, white on near-black
//   • Locomotive.ca (Awwwards featured) — large editorial counter numbers as visual anchors
//   • Format Podcasts / Cushion (darkmodedesign.com) — refined dark UIs, careful hierarchy
// Theme: DARK — deep navy-black #080B14, electric green health indicators, monospace data

const fs = require('fs');

const W = 390, H = 844;

// Palette
const bg       = '#080B14';
const surface  = '#0F1420';
const surface2 = '#151B2E';
const border   = '#1E2840';
const text     = '#E8EDF5';
const muted    = '#4A5568';
const accent   = '#00FF88';   // electric green — health/uptime
const accentD  = '#00CC6E';
const blue     = '#5B8DEF';   // latency / secondary
const warn     = '#FFB547';
const danger   = '#FF4D6D';
const mono     = "'Courier New', Courier, monospace";
const sans     = "'Inter', 'Helvetica Neue', Arial, sans-serif";

function C(type, props) { return { type, ...props }; }

function rect(x, y, w, h, fill, opts={}) {
  return C('rectangle', {x, y, width:w, height:h, fill,
    opacity: opts.opacity??1, cornerRadius: opts.r??0,
    strokeColor: opts.stroke??null, strokeWidth: opts.sw??0});
}
function txt(x, y, content, size, color, opts={}) {
  return C('text', {x, y, text:content, fontSize:size, color,
    fontWeight: opts.bold?'700':opts.semi?'600':opts.med?'500':'400',
    fontFamily: opts.mono?mono:sans,
    letterSpacing: opts.ls??0, opacity: opts.opacity??1,
    textAlign: opts.align??'left', width: opts.width??(W-x*2)});
}
function ln(x1,y1,x2,y2,color=border,opacity=1) {
  return C('line',{x1,y1,x2,y2,strokeColor:color,strokeWidth:1,opacity});
}
function circle(cx,cy,r,fill,opts={}) {
  return C('ellipse',{x:cx-r,y:cy-r,width:r*2,height:r*2,fill,opacity:opts.opacity??1});
}
function pill(x,y,w,h,fill,opts={}) { return rect(x,y,w,h,fill,{r:h/2,...opts}); }

function sparkline(x,y,w,h,color,values) {
  const max=Math.max(...values), min=Math.min(...values), range=max-min||1;
  const step=w/(values.length-1);
  return values.slice(0,-1).map((v,i)=>({
    type:'line',
    x1:x+i*step, y1:y+h-((v-min)/range)*h,
    x2:x+(i+1)*step, y2:y+h-((values[i+1]-min)/range)*h,
    strokeColor:color, strokeWidth:2, opacity:0.85
  }));
}

function navBar(activeIdx) {
  const tabs=[
    {l:'Overview',i:'◈'},{l:'Endpoints',i:'⌥'},
    {l:'Incidents',i:'⚡'},{l:'Logs',i:'≡'},{l:'Alerts',i:'◎'}
  ];
  const tw=W/tabs.length;
  const layers=[
    rect(0,H-72,W,72,surface),
    ln(0,H-72,W,H-72,border)
  ];
  tabs.forEach((t,i)=>{
    const cx=tw*i+tw/2, isA=i===activeIdx;
    if(isA) layers.push(rect(cx-tw/2+8,H-66,tw-16,2,accent,{r:1}));
    layers.push(txt(cx-tw/2,H-56,t.i,16,isA?accent:muted,{align:'center',width:tw}));
    layers.push(txt(cx-tw/2,H-36,t.l,9,isA?text:muted,{align:'center',width:tw}));
  });
  return layers;
}

// ─── Screen 1: Overview ────────────────────────────────────────────────────
function s1() {
  return {
    id:'s1', label:'Overview', width:W, height:H, backgroundColor:bg,
    layers:[
      rect(0,0,W,H,bg),
      // header
      rect(0,0,W,52,surface), ln(0,52,W,52),
      txt(20,16,'TRACE',15,text,{bold:true,ls:3}),
      txt(20,33,'API OBSERVABILITY ENGINE',8,muted,{ls:2}),
      pill(W-70,17,58,20,'#001A0D',{stroke:accent,sw:1}),
      circle(W-57,27,4,accent),
      txt(W-49,19,'LIVE',9,accent,{ls:1.5}),

      // Locomotive-style editorial BIG number anchor
      txt(20,62,'SYSTEM HEALTH',9,muted,{ls:2}),
      ln(20,76,W-20,76),
      txt(18,82,'99.97',74,accent,{bold:true,mono:true}),
      txt(188,106,'%',24,accentD,{mono:true}),
      txt(20,160,'UPTIME · LAST 90 DAYS',8,muted,{ls:1.5}),

      // 3 metric cards
      rect(16,176,107,80,surface,{r:10,stroke:border,sw:1}),
      txt(24,184,'LATENCY',8,muted,{ls:1.5}),
      txt(24,198,'142',38,blue,{bold:true,mono:true}),
      txt(96,214,'ms',13,muted,{mono:true}),
      txt(24,246,'p95 · avg',9,muted),

      rect(135,176,107,80,surface,{r:10,stroke:border,sw:1}),
      txt(143,184,'REQ/SEC',8,muted,{ls:1.5}),
      txt(143,198,'8.4k',38,text,{bold:true,mono:true}),
      txt(143,246,'current',9,muted),

      rect(254,176,120,80,surface,{r:10,stroke:accent,sw:1}),
      txt(262,184,'ERR RATE',8,muted,{ls:1.5}),
      txt(262,198,'0.03',38,accent,{bold:true,mono:true}),
      txt(330,214,'%',13,accentD,{mono:true}),
      circle(356,190,5,accent),
      txt(262,246,'24h avg',9,muted),

      // Sparkline
      txt(20,268,'REQUESTS · LAST 6H',9,muted,{ls:2}),
      ln(20,282,W-20,282),
      rect(16,290,W-32,70,surface,{r:8}),
      ...sparkline(26,296,W-52,56,blue,[4200,5100,6800,7200,6500,8400,9100,8800,9400,8100,7600,8400]),
      txt(W-52,296,'9.4k',8,muted,{mono:true}),
      txt(W-52,334,'4.2k',8,muted,{mono:true}),

      // Top endpoints
      txt(20,374,'TOP ENDPOINTS',9,muted,{ls:2}),
      ln(20,388,W-20,388),
      ...[
        {path:'/api/v2/auth',  rps:'2,841',latency:'67ms', sc:accent},
        {path:'/api/v2/data',  rps:'1,920',latency:'142ms',sc:blue},
        {path:'/api/v2/events',rps:'1,204',latency:'89ms', sc:accent},
        {path:'/api/v1/legacy',rps:'340',  latency:'312ms',sc:warn},
      ].flatMap((ep,i)=>{
        const y=396+i*50;
        return [
          rect(16,y,W-32,44,surface,{r:8,stroke:border,sw:1}),
          txt(28,y+10,ep.path,11,text,{mono:true}),
          txt(28,y+28,ep.rps+' rps',9,muted,{mono:true}),
          pill(W-82,y+12,66,20,surface2,{stroke:ep.sc,sw:1}),
          txt(W-82,y+14,ep.latency,10,ep.sc,{mono:true,align:'center',width:66}),
        ];
      }),

      ...navBar(0),
    ]
  };
}

// ─── Screen 2: Endpoints ──────────────────────────────────────────────────
function s2() {
  const eps=[
    {m:'GET',   path:'/api/v2/auth',      p50:'42ms',  p99:'89ms',  rps:'2.8k',h:100,   sc:accent},
    {m:'POST',  path:'/api/v2/data',       p50:'98ms',  p99:'201ms', rps:'1.9k',h:99.8,  sc:accent},
    {m:'GET',   path:'/api/v2/events',     p50:'61ms',  p99:'138ms', rps:'1.2k',h:100,   sc:accent},
    {m:'DELETE',path:'/api/v2/resources',  p50:'74ms',  p99:'160ms', rps:'420', h:99.9,  sc:accent},
    {m:'POST',  path:'/api/v1/legacy',     p50:'220ms', p99:'890ms', rps:'340', h:97.2,  sc:warn},
    {m:'GET',   path:'/api/v2/webhooks',   p50:'55ms',  p99:'120ms', rps:'88',  h:100,   sc:accent},
    {m:'PUT',   path:'/api/v2/config',     p50:'102ms', p99:'245ms', rps:'12',  h:99.5,  sc:blue},
  ];
  const mc={GET:blue,POST:accent,DELETE:danger,PUT:warn};

  return {
    id:'s2',label:'Endpoints',width:W,height:H,backgroundColor:bg,
    layers:[
      rect(0,0,W,H,bg),
      rect(0,0,W,52,surface), ln(0,52,W,52),
      txt(20,16,'ENDPOINTS',15,text,{bold:true,ls:2}),
      txt(20,33,'14 ACTIVE · 0 ERRORS',8,accent,{ls:1.5}),

      rect(16,60,W-32,36,surface,{r:8,stroke:border,sw:1}),
      txt(28,70,'⌕  search endpoints…',12,muted),

      txt(20,110,'METHOD',8,muted,{ls:1.5}),
      txt(80,110,'PATH',8,muted,{ls:1.5}),
      txt(W-104,110,'P50',8,muted,{ls:1.5}),
      txt(W-56,110,'P99',8,muted,{ls:1.5}),
      ln(16,124,W-16,124),

      ...eps.flatMap((ep,i)=>{
        const y=132+i*92;
        return [
          rect(16,y,W-32,86,surface,{r:10,stroke:border,sw:1}),
          pill(24,y+12,48,18,surface2,{stroke:mc[ep.m]||muted,sw:1}),
          txt(24,y+14,ep.m,8,mc[ep.m]||muted,{align:'center',width:48,ls:1}),
          txt(80,y+12,ep.path,10,text,{mono:true}),
          // health bar
          rect(24,y+38,W-64,4,surface2,{r:2}),
          rect(24,y+38,Math.round((W-64)*ep.h/100),4,ep.sc,{r:2}),
          txt(24,y+50,ep.h.toFixed(1)+'% health',9,ep.sc,{mono:true}),
          // latency
          txt(W-112,y+12,ep.p50,11,text,{mono:true}),
          txt(W-62,y+12,ep.p99,11,muted,{mono:true}),
          txt(W-112,y+50,ep.rps+' rps',9,muted,{mono:true}),
        ];
      }),

      ...navBar(1),
    ]
  };
}

// ─── Screen 3: Incidents ──────────────────────────────────────────────────
function s3() {
  const incs=[
    {id:'INC-0041',title:'Elevated p99 latency on /api/v1/legacy',sev:'WARN',sc:warn,dur:'14m',ep:'/api/v1/legacy',when:'2h ago',st:'ONGOING'},
    {id:'INC-0040',title:'Auth service spike — 503 burst',sev:'CRIT',sc:danger,dur:'4m',ep:'/api/v2/auth',when:'6h ago',st:'RESOLVED'},
    {id:'INC-0039',title:'DB connection pool exhausted',sev:'CRIT',sc:danger,dur:'11m',ep:'/api/v2/data',when:'1d ago',st:'RESOLVED'},
    {id:'INC-0038',title:'Webhook delivery rate drop',sev:'WARN',sc:warn,dur:'8m',ep:'/api/v2/webhooks',when:'3d ago',st:'RESOLVED'},
  ];

  return {
    id:'s3',label:'Incidents',width:W,height:H,backgroundColor:bg,
    layers:[
      rect(0,0,W,H,bg),
      rect(0,0,W,52,surface), ln(0,52,W,52),
      txt(20,16,'INCIDENTS',15,text,{bold:true,ls:2}),
      txt(20,33,'1 ACTIVE · 3 RESOLVED',8,warn,{ls:1.5}),

      // Locomotive editorial MTTR stat
      rect(16,60,W-32,72,surface,{r:10,stroke:border,sw:1}),
      txt(28,72,'MEAN TIME TO RESOLVE',8,muted,{ls:1.5}),
      txt(28,88,'6.8',44,accent,{bold:true,mono:true}),
      txt(106,106,'min',14,accentD,{mono:true}),
      txt(W-116,72,'INCIDENT RATE',8,muted,{ls:1.5}),
      txt(W-104,88,'0.4',32,blue,{bold:true,mono:true}),
      txt(W-72,106,'/day',12,muted,{mono:true}),

      ...incs.flatMap((inc,i)=>{
        const y=148+i*104;
        const isOn=inc.st==='ONGOING';
        return [
          rect(16,y,W-32,98,surface,{r:10,stroke:isOn?inc.sc:border,sw:isOn?1.5:1}),
          pill(24,y+12,40,16,surface2,{stroke:inc.sc,sw:1}),
          txt(24,y+13,inc.sev,8,inc.sc,{align:'center',width:40,ls:1}),
          pill(W-92,y+12,72,16,isOn?'#1A0A00':surface2,{stroke:isOn?warn:muted,sw:1}),
          txt(W-92,y+13,inc.st,8,isOn?warn:muted,{align:'center',width:72,ls:0.5}),
          txt(24,y+36,inc.title,11,text),
          txt(24,y+56,inc.id,9,muted,{mono:true}),
          txt(24,y+72,inc.ep,9,blue,{mono:true}),
          txt(24,y+88,'⏱ '+inc.dur,9,muted),
          txt(W-70,y+88,inc.when,9,muted,{align:'right',width:54}),
        ];
      }),

      ...navBar(2),
    ]
  };
}

// ─── Screen 4: Live Logs ──────────────────────────────────────────────────
function s4() {
  const logs=[
    {lv:'INFO', t:'14:22:01.441',msg:'GET /api/v2/auth 200 42ms',sc:blue},
    {lv:'INFO', t:'14:22:01.388',msg:'POST /api/v2/data 201 98ms',sc:blue},
    {lv:'WARN', t:'14:22:00.901',msg:'POST /api/v1/legacy 200 445ms slow',sc:warn},
    {lv:'INFO', t:'14:22:00.774',msg:'GET /api/v2/events 200 61ms',sc:blue},
    {lv:'ERROR',t:'14:21:59.221',msg:'GET /api/v2/config 503 timeout',sc:danger},
    {lv:'INFO', t:'14:21:59.101',msg:'DELETE /api/v2/resources 204 74ms',sc:blue},
    {lv:'WARN', t:'14:21:58.442',msg:'POST /api/v1/legacy 200 612ms slow',sc:warn},
    {lv:'INFO', t:'14:21:58.312',msg:'GET /api/v2/auth 200 39ms',sc:blue},
    {lv:'INFO', t:'14:21:57.880',msg:'GET /api/v2/webhooks 200 55ms',sc:blue},
    {lv:'ERROR',t:'14:21:57.201',msg:'POST /api/v2/data 429 rate limited',sc:danger},
  ];

  return {
    id:'s4',label:'Live Logs',width:W,height:H,backgroundColor:bg,
    layers:[
      rect(0,0,W,H,bg),
      rect(0,0,W,52,surface), ln(0,52,W,52),
      txt(20,16,'LIVE LOGS',15,text,{bold:true,ls:2}),
      circle(W-52,26,5,accent), txt(W-44,19,'LIVE',9,accent,{ls:1.5}),

      // Filter bar
      rect(16,60,W-32,32,surface,{r:6,stroke:border,sw:1}),
      txt(28,70,'ALL  ·  INFO  ·  WARN  ·  ERROR',9,muted,{mono:true}),
      ln(28,91,46,91,accent),

      ...logs.flatMap((log,i)=>{
        const y=104+i*64;
        const lvC={INFO:blue,WARN:warn,ERROR:danger};
        return [
          rect(16,y,W-32,58,i%2===0?surface:bg,{r:6,stroke:border,sw:0.5}),
          pill(24,y+10,42,16,surface2,{stroke:lvC[log.lv],sw:1}),
          txt(24,y+11,log.lv,8,lvC[log.lv],{align:'center',width:42}),
          txt(74,y+11,log.t,9,muted,{mono:true}),
          txt(24,y+33,log.msg.slice(0,40)+(log.msg.length>40?'…':''),10,log.lv==='ERROR'?danger:text,{mono:true}),
        ];
      }),

      ...navBar(3),
    ]
  };
}

// ─── Screen 5: Alert Rules ────────────────────────────────────────────────
function s5() {
  const channels=[
    {n:'PagerDuty',sc:accent},{n:'Slack #ops',sc:accent},{n:'Email digest',sc:blue}
  ];
  const rules=[
    {n:'Latency p99 > 500ms',scope:'all endpoints',active:true, cd:'5m'},
    {n:'Error rate > 1%',    scope:'all endpoints',active:true, cd:'10m'},
    {n:'Uptime < 99.9%',     scope:'account-wide', active:true, cd:'30m'},
    {n:'No requests > 10m',  scope:'/api/v2/auth', active:false,cd:'15m'},
  ];

  return {
    id:'s5',label:'Alert Rules',width:W,height:H,backgroundColor:bg,
    layers:[
      rect(0,0,W,H,bg),
      rect(0,0,W,52,surface), ln(0,52,W,52),
      txt(20,16,'ALERT RULES',15,text,{bold:true,ls:2}),
      txt(20,33,'3 ACTIVE · 1 PAUSED',8,muted,{ls:1.5}),

      txt(20,62,'NOTIFY CHANNELS',9,muted,{ls:2}),
      ln(20,76,W-20,76),

      ...channels.flatMap((ch,i)=>{
        const y=84+i*44;
        return [
          rect(16,y,W-32,38,surface,{r:8,stroke:border,sw:1}),
          circle(32,y+19,5,ch.sc),
          txt(46,y+12,ch.n,12,text),
          txt(W-100,y+14,'CONNECTED',9,ch.sc,{align:'right',width:84,ls:1}),
        ];
      }),

      txt(20,226,'ALERT RULES',9,muted,{ls:2}),
      ln(20,240,W-20,240),

      ...rules.flatMap((r,i)=>{
        const y=248+i*92;
        return [
          rect(16,y,W-32,86,surface,{r:10,stroke:r.active?border:surface2,sw:1,opacity:r.active?1:0.55}),
          // toggle
          rect(W-54,y+14,38,22,r.active?accent:muted,{r:11,opacity:r.active?1:0.4}),
          circle(r.active?W-23:W-41,y+25,9,'#fff'),
          txt(24,y+14,r.n,11,r.active?text:muted,{bold:true}),
          txt(24,y+34,r.scope,9,muted,{mono:true}),
          txt(24,y+56,'COOLDOWN',8,muted,{ls:1.5}),
          txt(96,y+56,r.cd,9,blue,{mono:true}),
          rect(16,y+82,W-32,2,r.active?accent:muted,{r:1,opacity:0.25}),
          rect(16,y+82,Math.round((W-32)*(r.active?0.72:0)),2,r.active?accent:muted,{r:1,opacity:r.active?0.75:0}),
        ];
      }),

      txt(20,H-84,'TRACE · API WORKSPACE · v2.4.1',9,muted,{ls:1,opacity:0.6}),

      ...navBar(4),
    ]
  };
}

// Build pen
const pen = {
  version:'2.8',
  name:'TRACE — API Observability Engine',
  description:'Dark-mode API observability dashboard. Inspired by Evervault.com precision dark SaaS (Godly.website) and Locomotive.ca editorial number-anchor layout (Awwwards). Electric green health indicators on deep navy-black.',
  screens:[s1(),s2(),s3(),s4(),s5()],
};

fs.writeFileSync('trace.pen', JSON.stringify(pen,null,2));
console.log('✓ trace.pen written —',pen.screens.length,'screens');
