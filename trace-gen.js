// TRACE — API Observability Engine
// Pen generator — direct SVG per screen
// Inspired by:
//   Evervault.com (Godly.website) — dark enterprise precision, white on near-black
//   Locomotive.ca (Awwwards) — large editorial counter numbers as visual anchors
//   Format Podcasts (darkmodedesign.com) — refined dark UI, monospace data hierarchy
// Theme: DARK

'use strict';
const fs   = require('fs');
const path = require('path');

const W = 390, H = 844;

// ── Palette ──────────────────────────────────────────────────────────────────
const BG       = '#080B14';
const SURFACE  = '#0F1420';
const SURFACE2 = '#151B2E';
const BORDER   = '#1E2840';
const TEXT     = '#E8EDF5';
const MUTED    = '#4A5568';
const ACCENT   = '#00FF88';   // electric green
const ACCENTD  = '#00CC6E';
const BLUE     = '#5B8DEF';
const WARN     = '#FFB547';
const DANGER   = '#FF4D6D';
const MONO     = 'Courier New,Courier,monospace';
const SANS     = 'Inter,Helvetica Neue,Arial,sans-serif';

// ── SVG helpers ──────────────────────────────────────────────────────────────
const e = (s) => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function rect(x,y,w,h,fill,opts={}) {
  const r   = opts.r  ? ` rx="${opts.r}"` : '';
  const op  = opts.op !== undefined ? ` opacity="${opts.op}"` : '';
  const str = opts.stroke ? ` stroke="${opts.stroke}" stroke-width="${opts.sw||1}"` : '';
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${r}${op}${str}/>`;
}

function line(x1,y1,x2,y2,color=BORDER,op=1,sw=1) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${sw}" opacity="${op}"/>`;
}

function circle(cx,cy,r,fill,op=1) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${op}"/>`;
}

function txt(x,y,content,size,color,opts={}) {
  const fw  = opts.bold?'700':opts.semi?'600':opts.med?'500':'400';
  const ff  = opts.mono ? MONO : SANS;
  const op  = opts.op !== undefined ? ` opacity="${opts.op}"` : '';
  const ls  = opts.ls ? ` letter-spacing="${opts.ls}"` : '';
  const anchor = opts.align==='center'?'middle':opts.align==='right'?'end':'start';
  const tx  = opts.align==='center' ? x+(opts.w||0)/2 : opts.align==='right' ? x+(opts.w||0) : x;
  return `<text x="${tx}" y="${y+size}" font-family="${ff}" font-size="${size}" font-weight="${fw}" fill="${color}" text-anchor="${anchor}"${ls}${op}>${e(content)}</text>`;
}

// Locomotive-style large headline number
function bigNum(x,y,value,unit,color,size=72) {
  return `
    ${txt(x, y, value, size, color, {bold:true, mono:true})}
    ${txt(x + value.length*(size*0.58) + 2, y+size-22, unit, 20, color+'BB', {mono:true})}
  `;
}

// Metric card
function metricCard(x,y,w,h,label,value,unit,sub,vc,glow=false) {
  const strokeC = glow ? vc : BORDER;
  const sw = glow ? 1.5 : 1;
  return `
    ${rect(x,y,w,h,SURFACE,{r:10,stroke:strokeC,sw})}
    ${txt(x+14, y+8, label, 8, MUTED, {ls:1.5})}
    ${txt(x+14, y+22, value, 32, vc, {bold:true,mono:true})}
    ${txt(x+14+value.length*19, y+36, unit, 11, MUTED, {mono:true})}
    ${txt(x+14, y+h-14, sub, 9, MUTED)}
    ${glow ? circle(x+w-14, y+14, 5, vc) : ''}
  `;
}

// Pill badge
function badge(x,y,w,h,label,textColor,fill=SURFACE2,stroke='') {
  const strokeAttr = stroke ? ` stroke="${stroke}" stroke-width="1"` : '';
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h/2}" fill="${fill}"${strokeAttr}/>
    <text x="${x+w/2}" y="${y+h*0.72}" font-family="${SANS}" font-size="${Math.round(h*0.55)}" font-weight="600" fill="${textColor}" text-anchor="middle" letter-spacing="0.8">${e(label)}</text>
  `;
}

// Sparkline
function sparkline(x,y,w,h,color,vals) {
  const max=Math.max(...vals), min=Math.min(...vals), range=max-min||1;
  const step=w/(vals.length-1);
  const lines = vals.slice(0,-1).map((v,i)=>{
    const x1=x+i*step, y1=y+h-((v-min)/range)*h;
    const x2=x+(i+1)*step, y2=y+h-((vals[i+1]-min)/range)*h;
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="2" stroke-linecap="round" opacity="0.85"/>`;
  });
  return lines.join('');
}

// Health bar
function healthBar(x,y,w,h,pct,color) {
  return `
    ${rect(x,y,w,h,SURFACE2,{r:h/2})}
    ${rect(x,y,Math.round(w*pct/100),h,color,{r:h/2})}
  `;
}

// Toggle switch
function toggle(x,y,on) {
  const bg = on ? ACCENT : MUTED;
  const cx = on ? x+34 : x+18;
  return `
    <rect x="${x}" y="${y}" width="44" height="24" rx="12" fill="${bg}" opacity="${on?1:0.4}"/>
    <circle cx="${cx}" cy="${y+12}" r="9" fill="white"/>
  `;
}

// ── Nav bar ──────────────────────────────────────────────────────────────────
function navBar(activeIdx) {
  const tabs = [
    {l:'Overview',i:'◈'},{l:'Endpoints',i:'⌥'},
    {l:'Incidents',i:'⚡'},{l:'Logs',i:'≡'},{l:'Alerts',i:'◎'}
  ];
  const tw = W/tabs.length;
  const items = tabs.map((t,i) => {
    const cx = tw*i + tw/2;
    const isA = i===activeIdx;
    const ic = isA ? ACCENT : MUTED;
    const tc = isA ? TEXT : MUTED;
    return `
      ${isA ? rect(cx-tw/2+8, H-70, tw-16, 2, ACCENT, {r:1}) : ''}
      ${txt(cx, H-62, t.i, 16, ic, {align:'center',w:tw})}
      ${txt(cx, H-42, t.l, 9, tc, {align:'center',w:tw})}
    `;
  }).join('');
  return `
    ${rect(0, H-78, W, 78, SURFACE)}
    ${line(0, H-78, W, H-78)}
    ${items}
  `;
}

// ── Screen 1: Overview ────────────────────────────────────────────────────────
function screen1() {
  const epData = [
    {path:'/api/v2/auth',  rps:'2,841',lat:'67ms', sc:ACCENT},
    {path:'/api/v2/data',  rps:'1,920',lat:'142ms',sc:BLUE},
    {path:'/api/v2/events',rps:'1,204',lat:'89ms', sc:ACCENT},
    {path:'/api/v1/legacy',rps:'340',  lat:'312ms',sc:WARN},
  ];
  const sparkVals = [4200,5100,6800,7200,6500,8400,9100,8800,9400,8100,7600,8400];

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <clipPath id="c1"><rect width="${W}" height="${H}"/></clipPath>
    </defs>
    <g clip-path="url(#c1)">
    ${rect(0,0,W,H,BG)}

    <!-- Header -->
    ${rect(0,0,W,56,SURFACE)}
    ${line(0,56,W,56)}
    ${txt(20, 8, 'TRACE', 16, TEXT, {bold:true, ls:3})}
    ${txt(20, 30, 'API OBSERVABILITY ENGINE', 8, MUTED, {ls:2})}
    <!-- Live pill -->
    <rect x="${W-72}" y="18" width="60" height="22" rx="11" fill="#001A0D" stroke="${ACCENT}" stroke-width="1"/>
    ${circle(W-59, 29, 4, ACCENT)}
    ${txt(W-52, 19, 'LIVE', 9, ACCENT, {ls:1.5})}

    <!-- ── Locomotive-style editorial uptime anchor ── -->
    ${txt(20, 66, 'SYSTEM HEALTH', 9, MUTED, {ls:2})}
    ${line(20, 82, W-20, 82)}
    ${bigNum(16, 86, '99.97', '%', ACCENT, 74)}
    ${txt(20, 168, 'UPTIME · LAST 90 DAYS', 8, MUTED, {ls:1.5})}

    <!-- 3 metric cards -->
    ${metricCard(16, 182, 110, 80, 'LATENCY', '142', 'ms', 'p95 avg', BLUE)}
    ${metricCard(136, 182, 110, 80, 'REQ/SEC', '8.4k', '', 'current', TEXT)}
    ${metricCard(256, 182, 118, 80, 'ERR RATE', '0.03', '%', '24h avg', ACCENT, true)}

    <!-- Sparkline section -->
    ${txt(20, 274, 'REQUESTS · LAST 6H', 9, MUTED, {ls:2})}
    ${line(20, 290, W-20, 290)}
    ${rect(16, 298, W-32, 72, SURFACE, {r:8})}
    ${sparkline(28, 304, W-56, 58, BLUE, sparkVals)}
    ${txt(W-52, 304, '9.4k', 8, MUTED, {mono:true})}
    ${txt(W-52, 344, '4.2k', 8, MUTED, {mono:true})}

    <!-- Top endpoints -->
    ${txt(20, 382, 'TOP ENDPOINTS', 9, MUTED, {ls:2})}
    ${line(20, 398, W-20, 398)}
    ${epData.map((ep,i) => {
      const y = 406 + i*52;
      return `
        ${rect(16, y, W-32, 46, SURFACE, {r:8, stroke:BORDER, sw:1})}
        ${txt(28, y+10, ep.path, 11, TEXT, {mono:true})}
        ${txt(28, y+26, ep.rps+' rps', 9, MUTED, {mono:true})}
        ${badge(W-82, y+10, 66, 22, ep.lat, ep.sc, SURFACE2, ep.sc)}
      `;
    }).join('')}

    ${navBar(0)}
    </g>
  </svg>`;
}

// ── Screen 2: Endpoints ───────────────────────────────────────────────────────
function screen2() {
  const eps = [
    {m:'GET',   path:'/api/v2/auth',     p50:'42ms',  p99:'89ms',  rps:'2.8k',h:100,   sc:ACCENT},
    {m:'POST',  path:'/api/v2/data',     p50:'98ms',  p99:'201ms', rps:'1.9k',h:99.8,  sc:ACCENT},
    {m:'GET',   path:'/api/v2/events',   p50:'61ms',  p99:'138ms', rps:'1.2k',h:100,   sc:ACCENT},
    {m:'DELETE',path:'/api/v2/resources',p50:'74ms',  p99:'160ms', rps:'420', h:99.9,  sc:ACCENT},
    {m:'POST',  path:'/api/v1/legacy',   p50:'220ms', p99:'890ms', rps:'340', h:97.2,  sc:WARN},
    {m:'GET',   path:'/api/v2/webhooks', p50:'55ms',  p99:'120ms', rps:'88',  h:100,   sc:ACCENT},
    {m:'PUT',   path:'/api/v2/config',   p50:'102ms', p99:'245ms', rps:'12',  h:99.5,  sc:BLUE},
  ];
  const mc = {GET:BLUE, POST:ACCENT, DELETE:DANGER, PUT:WARN};

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs><clipPath id="c2"><rect width="${W}" height="${H}"/></clipPath></defs>
    <g clip-path="url(#c2)">
    ${rect(0,0,W,H,BG)}
    ${rect(0,0,W,56,SURFACE)} ${line(0,56,W,56)}
    ${txt(20, 8, 'ENDPOINTS', 15, TEXT, {bold:true, ls:2})}
    ${txt(20, 30, '14 ACTIVE · 0 ERRORS', 8, ACCENT, {ls:1.5})}

    <!-- Search -->
    ${rect(16, 64, W-32, 34, SURFACE, {r:8, stroke:BORDER, sw:1})}
    ${txt(28, 70, '⌕  search endpoints…', 12, MUTED)}

    <!-- Column headers -->
    ${txt(20, 112, 'METHOD', 8, MUTED, {ls:1.5})}
    ${txt(80, 112, 'PATH', 8, MUTED, {ls:1.5})}
    ${txt(W-106, 112, 'P50', 8, MUTED, {ls:1.5})}
    ${txt(W-56, 112, 'P99', 8, MUTED, {ls:1.5})}
    ${line(16, 126, W-16, 126)}

    ${eps.map((ep,i) => {
      const y = 134 + i*92;
      const mc2 = mc[ep.m]||MUTED;
      return `
        ${rect(16,y,W-32,86,SURFACE,{r:10,stroke:BORDER,sw:1})}
        ${badge(24,y+12,46,18,ep.m,mc2,SURFACE2,mc2)}
        ${txt(80, y+12, ep.path, 10, TEXT, {mono:true})}
        ${healthBar(24, y+40, W-64, 4, ep.h, ep.sc)}
        ${txt(24, y+52, ep.h.toFixed(1)+'% health', 9, ep.sc, {mono:true})}
        ${txt(W-110, y+12, ep.p50, 11, TEXT, {mono:true})}
        ${txt(W-62, y+12, ep.p99, 11, MUTED, {mono:true})}
        ${txt(W-110, y+52, ep.rps+' rps', 9, MUTED, {mono:true})}
      `;
    }).join('')}

    ${navBar(1)}
    </g>
  </svg>`;
}

// ── Screen 3: Incidents ───────────────────────────────────────────────────────
function screen3() {
  const incs = [
    {id:'INC-0041',title:'Elevated p99 latency on /api/v1/legacy',sev:'WARN', sc:WARN,  dur:'14m',ep:'/api/v1/legacy',when:'2h ago', st:'ONGOING'},
    {id:'INC-0040',title:'Auth service spike — 503 burst',          sev:'CRIT', sc:DANGER,dur:'4m', ep:'/api/v2/auth',  when:'6h ago', st:'RESOLVED'},
    {id:'INC-0039',title:'DB connection pool exhausted',             sev:'CRIT', sc:DANGER,dur:'11m',ep:'/api/v2/data',  when:'1d ago', st:'RESOLVED'},
    {id:'INC-0038',title:'Webhook delivery rate drop',               sev:'WARN', sc:WARN,  dur:'8m', ep:'/api/v2/webhooks',when:'3d ago',st:'RESOLVED'},
  ];

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs><clipPath id="c3"><rect width="${W}" height="${H}"/></clipPath></defs>
    <g clip-path="url(#c3)">
    ${rect(0,0,W,H,BG)}
    ${rect(0,0,W,56,SURFACE)} ${line(0,56,W,56)}
    ${txt(20, 8, 'INCIDENTS', 15, TEXT, {bold:true, ls:2})}
    ${txt(20, 30, '1 ACTIVE · 3 RESOLVED', 8, WARN, {ls:1.5})}

    <!-- Locomotive editorial MTTR stat -->
    ${rect(16, 64, W-32, 72, SURFACE, {r:10, stroke:BORDER, sw:1})}
    ${txt(28, 72, 'MEAN TIME TO RESOLVE', 8, MUTED, {ls:1.5})}
    ${bigNum(28, 82, '6.8', 'min', ACCENT, 42)}
    ${txt(W-118, 72, 'INCIDENT RATE', 8, MUTED, {ls:1.5})}
    ${bigNum(W-106, 82, '0.4', '/day', BLUE, 32)}

    <!-- Incident cards -->
    ${incs.map((inc,i) => {
      const y = 150+i*106;
      const isOn = inc.st==='ONGOING';
      return `
        ${rect(16,y,W-32,100,SURFACE,{r:10,stroke:isOn?inc.sc:BORDER,sw:isOn?1.5:1})}
        ${badge(24, y+12, 40, 18, inc.sev, inc.sc, SURFACE2, inc.sc)}
        ${badge(W-90, y+12, 74, 18, inc.st, isOn?WARN:MUTED, isOn?'#1A0A00':SURFACE2, isOn?WARN:MUTED)}
        ${txt(24, y+38, inc.title.slice(0,42), 11, TEXT)}
        ${txt(24, y+57, inc.id, 9, MUTED, {mono:true})}
        ${txt(104, y+57, inc.ep, 9, BLUE, {mono:true})}
        ${txt(24, y+76, '⏱ '+inc.dur, 9, MUTED)}
        ${txt(W-70, y+76, inc.when, 9, MUTED)}
      `;
    }).join('')}

    ${navBar(2)}
    </g>
  </svg>`;
}

// ── Screen 4: Live Logs ───────────────────────────────────────────────────────
function screen4() {
  const logs = [
    {lv:'INFO', t:'14:22:01.441',msg:'GET /api/v2/auth 200 42ms'},
    {lv:'INFO', t:'14:22:01.388',msg:'POST /api/v2/data 201 98ms'},
    {lv:'WARN', t:'14:22:00.901',msg:'POST /api/v1/legacy 200 445ms'},
    {lv:'INFO', t:'14:22:00.774',msg:'GET /api/v2/events 200 61ms'},
    {lv:'ERROR',t:'14:21:59.221',msg:'GET /api/v2/config 503 timeout'},
    {lv:'INFO', t:'14:21:59.101',msg:'DELETE /api/v2/resources 204 74ms'},
    {lv:'WARN', t:'14:21:58.442',msg:'POST /api/v1/legacy 200 612ms'},
    {lv:'INFO', t:'14:21:58.312',msg:'GET /api/v2/auth 200 39ms'},
    {lv:'INFO', t:'14:21:57.880',msg:'GET /api/v2/webhooks 200 55ms'},
    {lv:'ERROR',t:'14:21:57.201',msg:'POST /api/v2/data 429 rate limited'},
  ];
  const lvC = {INFO:BLUE, WARN:WARN, ERROR:DANGER};

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs><clipPath id="c4"><rect width="${W}" height="${H}"/></clipPath></defs>
    <g clip-path="url(#c4)">
    ${rect(0,0,W,H,BG)}
    ${rect(0,0,W,56,SURFACE)} ${line(0,56,W,56)}
    ${txt(20, 8, 'LIVE LOGS', 15, TEXT, {bold:true, ls:2})}
    ${circle(W-54, 26, 5, ACCENT)}
    ${txt(W-46, 18, 'LIVE', 9, ACCENT, {ls:1.5})}

    <!-- Filter bar -->
    ${rect(16, 64, W-32, 30, SURFACE, {r:6, stroke:BORDER, sw:1})}
    ${txt(28, 69, 'ALL  ·  INFO  ·  WARN  ·  ERROR', 9, MUTED, {mono:true})}
    ${line(28, 93, 44, 93, ACCENT, 1, 2)}

    <!-- Log entries -->
    ${logs.map((log,i) => {
      const y = 104+i*66;
      const rowBg = i%2===0 ? SURFACE : BG;
      const msgC = log.lv==='ERROR'?DANGER:TEXT;
      return `
        ${rect(16,y,W-32,60,rowBg,{r:6,stroke:BORDER,sw:0.5})}
        ${badge(24, y+10, 42, 16, log.lv, lvC[log.lv], SURFACE2, lvC[log.lv])}
        ${txt(74, y+10, log.t, 9, MUTED, {mono:true})}
        ${txt(24, y+34, log.msg.slice(0,42)+(log.msg.length>42?'…':''), 10, msgC, {mono:true})}
      `;
    }).join('')}

    ${navBar(3)}
    </g>
  </svg>`;
}

// ── Screen 5: Alert Rules ─────────────────────────────────────────────────────
function screen5() {
  const channels = [
    {n:'PagerDuty',  sc:ACCENT},
    {n:'Slack #ops', sc:ACCENT},
    {n:'Email digest',sc:BLUE},
  ];
  const rules = [
    {n:'Latency p99 > 500ms',scope:'all endpoints', active:true,  cd:'5m'},
    {n:'Error rate > 1%',    scope:'all endpoints', active:true,  cd:'10m'},
    {n:'Uptime < 99.9%',     scope:'account-wide',  active:true,  cd:'30m'},
    {n:'No requests > 10m',  scope:'/api/v2/auth',  active:false, cd:'15m'},
  ];

  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs><clipPath id="c5"><rect width="${W}" height="${H}"/></clipPath></defs>
    <g clip-path="url(#c5)">
    ${rect(0,0,W,H,BG)}
    ${rect(0,0,W,56,SURFACE)} ${line(0,56,W,56)}
    ${txt(20, 8, 'ALERT RULES', 15, TEXT, {bold:true, ls:2})}
    ${txt(20, 30, '3 ACTIVE · 1 PAUSED', 8, MUTED, {ls:1.5})}

    <!-- Channels -->
    ${txt(20, 64, 'NOTIFY CHANNELS', 9, MUTED, {ls:2})}
    ${line(20, 78, W-20, 78)}
    ${channels.map((ch,i) => {
      const y = 86+i*46;
      return `
        ${rect(16,y,W-32,40,SURFACE,{r:8,stroke:BORDER,sw:1})}
        ${circle(32, y+20, 5, ch.sc)}
        ${txt(46, y+12, ch.n, 12, TEXT)}
        ${txt(W-24, y+14, 'CONNECTED', 9, ch.sc, {ls:1, align:'right', w:0})}
      `;
    }).join('')}

    <!-- Rules -->
    ${txt(20, 228, 'ALERT RULES', 9, MUTED, {ls:2})}
    ${line(20, 242, W-20, 242)}
    ${rules.map((r,i) => {
      const y = 250+i*92;
      const op = r.active ? 1 : 0.55;
      return `
        <g opacity="${op}">
        ${rect(16,y,W-32,86,SURFACE,{r:10,stroke:r.active?BORDER:SURFACE2,sw:1})}
        ${toggle(W-62, y+14, r.active)}
        ${txt(24, y+14, r.n, 11, r.active?TEXT:MUTED, {bold:true})}
        ${txt(24, y+34, r.scope, 9, MUTED, {mono:true})}
        ${txt(24, y+56, 'COOLDOWN', 8, MUTED, {ls:1.5})}
        ${txt(96, y+56, r.cd, 9, BLUE, {mono:true})}
        ${rect(16,y+82,W-32,2,r.active?ACCENT:MUTED,{r:1,op:0.25})}
        ${r.active ? rect(16,y+82,Math.round((W-32)*0.72),2,ACCENT,{r:1}) : ''}
        </g>
      `;
    }).join('')}

    ${txt(20, H-92, 'TRACE · API WORKSPACE · v2.4.1', 9, MUTED, {op:0.6})}

    ${navBar(4)}
    </g>
  </svg>`;
}

// ── Assemble pen ──────────────────────────────────────────────────────────────
const screens = [
  {id:'s1', label:'Overview',   svg: screen1()},
  {id:'s2', label:'Endpoints',  svg: screen2()},
  {id:'s3', label:'Incidents',  svg: screen3()},
  {id:'s4', label:'Live Logs',  svg: screen4()},
  {id:'s5', label:'Alert Rules',svg: screen5()},
];

const pen = {
  version:'2.8',
  meta: {
    name:'TRACE — API Observability Engine',
    description:'Dark-mode API observability dashboard. Inspired by Evervault.com precision dark SaaS (Godly.website) and Locomotive.ca editorial number-anchor layout (Awwwards). Electric green health indicators on deep navy-black.',
    author:'RAM Design Heartbeat',
    created: new Date().toISOString(),
    tags:['dark','dashboard','api','developer-tool','observability','editorial'],
  },
  screens,
};

fs.writeFileSync(path.join(__dirname, 'trace.pen'), JSON.stringify(pen, null, 2));
console.log('✓ trace.pen written —', screens.length, 'screens');
console.log('  Palette: bg='+BG+' accent='+ACCENT+' blue='+BLUE);
