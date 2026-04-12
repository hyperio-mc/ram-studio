'use strict';
const fs = require('fs'), path = require('path');

const SLUG = 'zest';
const NAME = 'ZEST';
const W = 390, H = 844;

// Palette — cinema dark + warm amber + royal blue
// Inspired by Attio/Clay AI-native CRM aesthetic on saaspo.com
const C = {
  bg:      '#080A0F',
  surf:    '#0F1219',
  card:    '#161C28',
  card2:   '#1D2435',
  border:  '#2A3347',
  text:    '#E2E8F0',
  muted:   '#64748B',
  faint:   '#2A3347',
  amber:   '#F59E0B',
  amberDim:'#92600A',
  amberGlo:'rgba(245,158,11,0.15)',
  blue:    '#3B82F6',
  blueDim: '#1E3A5F',
  blueGlo: 'rgba(59,130,246,0.15)',
  green:   '#10B981',
  greenDim:'#064E3B',
  red:     '#EF4444',
  redDim:  '#450A0A',
  purple:  '#A78BFA',
};

let elCount = 0;
function rect(x,y,w,h,fill,opts={}) {
  elCount++;
  return { type:'rect', x, y, w, h, fill,
    rx: opts.rx||0, opacity: opts.opacity||1,
    stroke: opts.stroke||'none', sw: opts.sw||0 };
}
function text(x,y,content,size,fill,opts={}) {
  elCount++;
  return { type:'text', x, y, content, size, fill,
    fw: opts.fw||'400', font: opts.font||'Inter,sans-serif',
    anchor: opts.anchor||'start', ls: opts.ls||'0', opacity: opts.opacity||1 };
}
function circle(cx,cy,r,fill,opts={}) {
  elCount++;
  return { type:'circle', cx, cy, r, fill, opacity: opts.opacity||1,
    stroke: opts.stroke||'none', sw: opts.sw||0 };
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  elCount++;
  return { type:'line', x1,y1,x2,y2,stroke, sw: opts.sw||1, opacity: opts.opacity||1 };
}
function pill(x,y,w,h,fill) { return rect(x,y,w,h,fill,{rx:h/2}); }

// ── CHROME ───────────────────────────────────────────────────────────────────
function chrome(statusLabel='9:41') {
  return [
    rect(0,0,W,H,C.bg),
    // status bar
    rect(0,0,W,44,C.surf,{opacity:0.9}),
    text(16,28,statusLabel,13,C.text,{fw:'600'}),
    // battery
    rect(W-50,16,30,14,C.faint,{rx:3,stroke:C.border,sw:1}),
    rect(W-49,17,18,12,C.blue,{rx:2}),
    rect(W-20,20,3,8,C.border,{rx:1}),
    // signal dots
    circle(W-62,23,2,C.text,{opacity:0.5}),
    circle(W-68,23,2,C.text,{opacity:0.7}),
    circle(W-74,23,2,C.text),
    // wifi
    circle(W-84,23,6,C.text,{opacity:0.15,stroke:C.text,sw:1.5}),
    circle(W-84,23,3,C.text,{opacity:0.5}),
  ];
}

function bottomNav(active) {
  const items = [
    { id:'pipeline', icon:'P', label:'Pipeline', x:39 },
    { id:'deals',    icon:'D', label:'Deals',    x:117 },
    { id:'insights', icon:'I', label:'Insights', x:195 },
    { id:'forecast', icon:'F', label:'Forecast', x:273 },
    { id:'more',     icon:'⋯', label:'More',     x:351 },
  ];
  const els = [
    rect(0,H-84,W,84,C.surf),
    line(0,H-84,W,H-84,C.border,{sw:0.5}),
  ];
  items.forEach(item => {
    const isActive = item.id === active;
    const col = isActive ? C.amber : C.muted;
    // icon circle
    const iconBg = isActive ? C.amberGlo : 'transparent';
    els.push(rect(item.x-18,H-72,36,32,iconBg,{rx:10}));
    els.push(text(item.x,H-50,item.icon,14,col,{fw:'700',anchor:'middle'}));
    els.push(text(item.x,H-24,item.label,9,col,{anchor:'middle',fw: isActive?'600':'400'}));
    if (isActive) {
      els.push(rect(item.x-12,H-84,24,2,C.amber,{rx:1}));
    }
  });
  return els;
}

function header(title, sub='') {
  return [
    rect(0,44,W,56,C.bg),
    text(20,82,title,22,C.text,{fw:'700',ls:'-0.5px'}),
    sub ? text(20,82,sub,13,C.muted,{fw:'400'}) : null,
  ].filter(Boolean);
}

function card(x,y,w,h,opts={}) {
  return rect(x,y,w,h,C.card,{rx:opts.rx||14,stroke:C.border,sw:0.5,...opts});
}

// ── SCREEN 1: PIPELINE ───────────────────────────────────────────────────────
function screen1() {
  const els = [
    ...chrome(),
    // header
    rect(0,44,W,60,C.bg),
    text(20,72,'Pipeline',24,C.text,{fw:'800',ls:'-0.8px'}),
    text(20,90,'Apr 2026',12,C.muted,{fw:'500'}),
    // notification bell
    rect(W-52,52,36,36,C.card,{rx:10}),
    circle(W-34,70,8,C.faint),
    text(W-34,74,'🔔',10,C.text,{anchor:'middle'}),
    circle(W-26,62,5,C.amber),

    // big revenue hero card
    rect(16,108,W-32,100,C.card,{rx:16,stroke:C.amberGlo,sw:1}),
    // amber glow strip top
    rect(16,108,W-32,3,C.amber,{rx:2,opacity:0.7}),
    text(32,134,'Total Pipeline Value',11,C.muted,{fw:'500'}),
    text(32,168,'$4.2M',36,C.text,{fw:'800',ls:'-1px'}),
    pill(W-100,128,80,22,C.amberGlo),
    text(W-60,144,'▲ 18.4%',11,C.amber,{fw:'600',anchor:'middle'}),

    // stage breakdown title
    text(20,228,'By Stage',13,C.text,{fw:'700'}),
    text(W-20,228,'6 stages',11,C.muted,{anchor:'end'}),

    // stage bars
    ...[
      { label:'Prospecting', val:820, pct:0.19, col:C.blue },
      { label:'Qualified',   val:1100, pct:0.26, col:C.purple },
      { label:'Proposal',    val:780, pct:0.19, col:C.amber },
      { label:'Negotiation', val:940, pct:0.22, col:C.green },
      { label:'Closed Won',  val:560, pct:0.13, col:C.green, dim:'#022c22' },
    ].flatMap((s,i) => {
      const y = 244 + i*48;
      const barW = Math.round((W-80)*s.pct);
      return [
        text(20,y+18,s.label,12,C.text,{fw:'500'}),
        text(20,y+32,`$${s.val}K`,11,C.muted,{fw:'400'}),
        rect(20,y+38,W-56,5,C.faint,{rx:3}),
        rect(20,y+38,barW,5,s.col,{rx:3,opacity:0.85}),
      ];
    }),

    // mini stat row
    rect(16,498,W-32,66,C.card,{rx:14,stroke:C.border,sw:0.5}),
    ...[
      {label:'Deals',  val:'47',  x:60},
      {label:'Avg Size', val:'$89K', x:165},
      {label:'Win Rate', val:'34%',  x:280},
    ].flatMap(s => [
      text(s.x,524,s.val,18,C.text,{fw:'700',anchor:'middle'}),
      text(s.x,542,s.label,10,C.muted,{anchor:'middle'}),
    ]),
    line(W/3,510,W/3,552,C.border),
    line(2*W/3,510,2*W/3,552,C.border),

    // recent activity
    text(20,582,'Recent Activity',13,C.text,{fw:'700'}),
    ...[
      { ico:'💼', name:'Acme Corp',    act:'Stage → Proposal',  time:'2m ago',  col:C.amber },
      { ico:'🏢', name:'Vertex Labs',  act:'New deal created',   time:'18m ago', col:C.blue },
      { ico:'🎯', name:'DataFlow Inc', act:'Meeting scheduled',  time:'1h ago',  col:C.green },
    ].flatMap((a,i) => {
      const y = 598 + i*52;
      return [
        rect(16,y,W-32,46,i===0?C.card2:C.bg,{rx:10,stroke:i===0?C.border:'transparent',sw:0.5}),
        circle(38,y+23,14,C.faint),
        text(38,y+27,a.ico,12,C.text,{anchor:'middle'}),
        text(60,y+19,a.name,13,C.text,{fw:'600'}),
        text(60,y+33,a.act,11,C.muted),
        pill(W-55,y+14,45,16,a.col==='#F59E0B'?C.amberGlo:C.blueGlo),
        text(W-32,y+26,a.time,9,a.col,{anchor:'end',fw:'500'}),
      ];
    }),

    ...bottomNav('pipeline'),
  ];
  return { name:'Pipeline', svg:'', elements: els };
}

// ── SCREEN 2: DEALS ──────────────────────────────────────────────────────────
function screen2() {
  const deals = [
    { name:'Acme Corp',     owner:'SL', size:'$280K', stage:'Proposal',    prob:72, hot:true  },
    { name:'Vertex Labs',   owner:'MK', size:'$145K', stage:'Qualified',   prob:45, hot:false },
    { name:'DataFlow Inc',  owner:'RJ', size:'$320K', stage:'Negotiation', prob:88, hot:true  },
    { name:'SkyNet AI',     owner:'TC', size:'$95K',  stage:'Prospecting', prob:20, hot:false },
    { name:'BlueOcean LLC', owner:'SL', size:'$210K', stage:'Closed Won',  prob:100,hot:false },
  ];
  const stageColor = s => ({ Proposal:C.amber, Qualified:C.purple, Negotiation:C.green, Prospecting:C.blue, 'Closed Won':C.green }[s]||C.muted);

  const els = [
    ...chrome(),
    rect(0,44,W,60,C.bg),
    text(20,72,'Deals',24,C.text,{fw:'800',ls:'-0.8px'}),
    text(20,90,'47 active',12,C.muted,{fw:'500'}),

    // filter chips
    ...[{l:'All',a:true},{l:'Hot 🔥',a:false},{l:'My Deals',a:false},{l:'Closing',a:false}].flatMap((f,i) => {
      const x = 16 + i*82;
      return [
        rect(x,102,72,26,f.a?C.amber:C.card,{rx:13,stroke:f.a?'none':C.border,sw:0.5}),
        text(x+36,119,f.l,11,f.a?C.bg:C.muted,{anchor:'middle',fw:f.a?'700':'400'}),
      ];
    }),

    // sort row
    text(20,146,'Sort by: Close Date',11,C.muted,{fw:'400'}),
    text(W-20,146,'⇅ Filter',11,C.amber,{anchor:'end',fw:'600'}),

    // deal cards
    ...deals.flatMap((d,i) => {
      const y = 158 + i*110;
      const sc = stageColor(d.stage);
      return [
        rect(16,y,W-32,100,d.hot?C.card2:C.card,{rx:14,stroke:d.hot?C.amber:C.border,sw:d.hot?1:0.5}),
        // hot badge
        ...(d.hot ? [
          pill(W-72,y+10,54,18,C.amberGlo),
          text(W-45,y+23,'🔥 Hot',10,C.amber,{anchor:'middle',fw:'700'}),
        ] : []),
        // owner avatar
        circle(44,y+28,14,d.stage==='Closed Won'?C.greenDim:C.blueDim),
        text(44,y+32,d.owner,10,d.stage==='Closed Won'?C.green:C.blue,{anchor:'middle',fw:'700'}),
        text(68,y+24,d.name,14,C.text,{fw:'700'}),
        text(68,y+40,d.size,12,C.amber,{fw:'600'}),
        // stage pill
        pill(68,y+52,d.stage.length*7+10,18,sc+'22'),
        text(68+d.stage.length*3.5+5,y+65,d.stage,10,sc,{anchor:'middle',fw:'600'}),
        // prob bar
        text(20,y+82,'Probability',10,C.muted,{fw:'400'}),
        rect(88,y+76,W-120,8,C.faint,{rx:4}),
        rect(88,y+76,Math.round((W-120)*(d.prob/100)),8,sc,{rx:4,opacity:0.8}),
        text(W-26,y+84,`${d.prob}%`,10,sc,{anchor:'end',fw:'600'}),
      ];
    }),

    ...bottomNav('deals'),
  ];
  return { name:'Deals', svg:'', elements: els };
}

// ── SCREEN 3: AI INSIGHTS ────────────────────────────────────────────────────
function screen3() {
  const els = [
    ...chrome(),
    rect(0,44,W,60,C.bg),
    text(20,72,'AI Insights',24,C.text,{fw:'800',ls:'-0.8px'}),
    text(20,90,'Updated just now',12,C.amber,{fw:'500'}),

    // hero insight card — glowing amber
    rect(16,108,W-32,116,C.card,{rx:16,stroke:C.amber,sw:1,opacity:0.95}),
    rect(16,108,W-32,3,C.amber,{rx:2}),
    // sparkle icon area
    circle(44,140,18,C.amberGlo),
    text(44,146,'✦',16,C.amber,{anchor:'middle',fw:'700'}),
    text(70,132,'Top Opportunity',10,C.amber,{fw:'700'}),
    text(70,152,'DataFlow Inc',16,C.text,{fw:'800'}),
    text(70,170,'88% close probability',12,C.muted),
    text(24,194,'AI predicts a close by Apr 28 based on 3 engagement signals',11,C.muted,{opacity:0.85}),
    pill(W-88,185,68,18,C.amberGlo),
    text(W-54,198,'Apr 28',10,C.amber,{anchor:'middle',fw:'600'}),

    // 3 insight cards in a row
    text(20,238,'Signals detected',13,C.text,{fw:'700'}),
    text(W-20,238,'See all',11,C.blue,{anchor:'end',fw:'500'}),

    ...([
      { icon:'📧', title:'Email opens', val:'12×', sub:'Last 7 days', col:C.blue },
      { icon:'🤝', title:'Meetings',    val:'3',   sub:'Scheduled',   col:C.purple },
      { icon:'📄', title:'Doc views',   val:'8×',  sub:'Proposal',    col:C.green },
    ].flatMap((s,i) => {
      const x = 16 + i*122;
      return [
        rect(x,252,112,92,C.card,{rx:14,stroke:C.border,sw:0.5}),
        circle(x+22,278,14,s.col+'33'),
        text(x+22,282,s.icon,12,s.col,{anchor:'middle'}),
        text(x+56,282,'',0,C.bg), // spacer
        text(x+12,300,s.title,10,C.muted,{fw:'500'}),
        text(x+12,320,s.val,22,s.col,{fw:'800'}),
        text(x+12,338,s.sub,9,C.muted),
      ];
    })),

    // risk alert
    rect(16,356,W-32,66,C.redDim,{rx:14,stroke:C.red,sw:0.5}),
    circle(40,389,14,C.red+'33'),
    text(40,393,'⚠',14,C.red,{anchor:'middle'}),
    text(62,378,'At-Risk Deal',12,C.red,{fw:'700'}),
    text(62,396,'SkyNet AI — 32 days no contact',11,C.text,{opacity:0.8}),
    text(62,410,'Re-engage now to keep deal alive',10,C.muted),
    pill(W-88,368,68,20,C.red+'33'),
    text(W-54,382,'Re-engage',9,C.red,{anchor:'middle',fw:'600'}),

    // AI recommendations list
    text(20,440,'Recommendations',13,C.text,{fw:'700'}),
    ...([
      { num:'1', text:'Send follow-up to Vertex Labs — 5 days since last contact', urgent:false },
      { num:'2', text:'DataFlow negotiation: propose 12-month contract for Q2 close', urgent:true },
      { num:'3', text:'Review BlueOcean contract — expiry risk in 18 days', urgent:false },
    ].flatMap((r,i) => {
      const y = 460 + i*64;
      return [
        rect(16,y,W-32,56,C.card,{rx:12,stroke:r.urgent?C.amber:C.border,sw:r.urgent?0.8:0.4}),
        circle(40,y+28,12,r.urgent?C.amberGlo:C.faint),
        text(40,y+32,r.num,11,r.urgent?C.amber:C.muted,{anchor:'middle',fw:'700'}),
        text(60,y+22,r.text,10,C.text,{fw:r.urgent?'600':'400',opacity:0.9}),
        text(60,y+38,'Tap to act →',10,r.urgent?C.amber:C.muted,{fw:r.urgent?'600':'400'}),
      ];
    })),

    ...bottomNav('insights'),
  ];
  return { name:'AI Insights', svg:'', elements: els };
}

// ── SCREEN 4: FORECAST ───────────────────────────────────────────────────────
function screen4() {
  const months = ['Jan','Feb','Mar','Apr','May','Jun'];
  const actuals = [310,285,340,null,null,null];
  const forecast = [null,null,null,380,420,460];
  const targets = [320,320,320,400,400,480];
  const maxVal = 500;
  const chartX = 36, chartY = 200, chartW = W-72, chartH = 160;

  const els = [
    ...chrome(),
    rect(0,44,W,60,C.bg),
    text(20,72,'Forecast',24,C.text,{fw:'800',ls:'-0.8px'}),
    text(20,90,'Q2 2026 · Revenue',12,C.muted,{fw:'500'}),

    // summary cards
    ...[
      { label:'Committed', val:'$1.2M', pct:'↑12%', col:C.green, x:16 },
      { label:'Best Case',  val:'$1.8M', pct:'↑28%', col:C.blue, x:W/2+6 },
    ].flatMap(s => [
      rect(s.x,108,W/2-24,72,C.card,{rx:14,stroke:C.border,sw:0.5}),
      text(s.x+16,130,s.label,10,C.muted,{fw:'500'}),
      text(s.x+16,158,s.val,22,C.text,{fw:'800'}),
      pill(s.x+16,164,50,18,s.col+'22'),
      text(s.x+41,176,s.pct,10,s.col,{anchor:'middle',fw:'600'}),
    ]),

    // chart background
    rect(16,192,W-32,185,C.card,{rx:16,stroke:C.border,sw:0.5}),
    text(28,212,'Monthly Revenue ($K)',10,C.muted,{fw:'500'}),

    // y-axis grid lines
    ...[0,1,2,3].map(i => {
      const y = chartY + chartH - (i/3)*chartH;
      return line(chartX,y,chartX+chartW,y,C.faint,{sw:0.4,opacity:0.5});
    }),

    // bars + forecast bars
    ...months.flatMap((m,i) => {
      const bw = 28, bx = chartX + i*(chartW/6) + (chartW/6-bw)/2;
      const a = actuals[i], f = forecast[i], t = targets[i];
      const result = [];
      // target line marker
      if (t) {
        const ty = chartY + chartH - (t/maxVal)*chartH;
        result.push(rect(bx-4,ty,bw+8,1,C.muted,{opacity:0.3}));
      }
      // actual bar
      if (a) {
        const bh = (a/maxVal)*chartH;
        result.push(rect(bx,chartY+chartH-bh,bw,bh,C.blue,{rx:4,opacity:0.85}));
        result.push(text(bx+bw/2,chartY+chartH-bh-5,`${a}`,8,C.blue,{anchor:'middle',fw:'600'}));
      }
      // forecast bar (dashed style — lighter)
      if (f) {
        const bh = (f/maxVal)*chartH;
        result.push(rect(bx,chartY+chartH-bh,bw,bh,C.amber,{rx:4,opacity:0.5}));
        result.push(text(bx+bw/2,chartY+chartH-bh-5,`${f}`,8,C.amber,{anchor:'middle',fw:'600'}));
      }
      result.push(text(bx+bw/2,chartY+chartH+14,m,9,C.muted,{anchor:'middle'}));
      return result;
    }),

    // legend
    rect(28,368,8,8,C.blue,{rx:2}),
    text(42,376,'Actual',9,C.muted),
    rect(92,368,8,8,C.amber,{rx:2,opacity:0.5}),
    text(106,376,'Forecast',9,C.muted),
    circle(156,372,4,C.muted,{opacity:0.3,stroke:C.muted,sw:1}),
    text(166,376,'Target',9,C.muted),

    // quota attainment
    text(20,402,'Quota Attainment',13,C.text,{fw:'700'}),
    text(W-20,402,'Q2 Goal: $1.44M',11,C.muted,{anchor:'end'}),
    rect(20,416,W-40,10,C.faint,{rx:5}),
    rect(20,416,Math.round((W-40)*0.78),10,C.green,{rx:5,opacity:0.85}),
    circle(20+Math.round((W-40)*0.78),421,7,C.green),
    text(20+Math.round((W-40)*0.78)+14,422,'78%',11,C.green,{fw:'700'}),

    // rep forecast table
    text(20,446,'Rep Forecast',13,C.text,{fw:'700'}),
    ...[
      { name:'Sarah L.',  q:'$420K', att:92, col:C.green },
      { name:'Marcus K.', q:'$380K', att:71, col:C.amber },
      { name:'Raj J.',    q:'$340K', att:85, col:C.green },
      { name:'Tom C.',    q:'$290K', att:58, col:C.red   },
    ].flatMap((r,i) => {
      const y = 464 + i*52;
      return [
        rect(16,y,W-32,44,C.card,{rx:10,stroke:C.border,sw:0.4}),
        circle(38,y+22,12,C.faint),
        text(38,y+26,r.name.split(' ').map(n=>n[0]).join(''),10,C.text,{anchor:'middle',fw:'700'}),
        text(60,y+19,r.name,13,C.text,{fw:'600'}),
        text(60,y+34,r.q+' target',10,C.muted),
        text(W-30,y+22,`${r.att}%`,14,r.col,{anchor:'end',fw:'700'}),
        rect(W-90,y+30,50,5,C.faint,{rx:3}),
        rect(W-90,y+30,Math.round(50*(r.att/100)),5,r.col,{rx:3,opacity:0.8}),
      ];
    }),

    ...bottomNav('forecast'),
  ];
  return { name:'Forecast', svg:'', elements: els };
}

// ── SCREEN 5: ACTIVITY ───────────────────────────────────────────────────────
function screen5() {
  const events = [
    { time:'2m',   ico:'💼', name:'DataFlow Inc',  act:'Proposal viewed (3rd time)',         col:C.amber, hot:true  },
    { time:'18m',  ico:'📧', name:'Acme Corp',     act:'Email opened — subject: Q2 pricing', col:C.blue,  hot:false },
    { time:'1h',   ico:'🤝', name:'Vertex Labs',   act:'Meeting booked — Apr 15, 2pm',       col:C.green, hot:false },
    { time:'2h',   ico:'🎯', name:'SkyNet AI',     act:'No contact for 32 days — at risk',   col:C.red,   hot:false },
    { time:'3h',   ico:'✅', name:'BlueOcean LLC', act:'Closed Won — $210K ARR',             col:C.green, hot:true  },
    { time:'5h',   ico:'📝', name:'Acme Corp',     act:'Note added: "Budget approved"',      col:C.purple,hot:false },
    { time:'1d',   ico:'🏢', name:'NewWave SaaS',  act:'New deal created — $95K opp',        col:C.blue,  hot:false },
  ];
  const els = [
    ...chrome(),
    rect(0,44,W,60,C.bg),
    text(20,72,'Activity',24,C.text,{fw:'800',ls:'-0.8px'}),
    text(W-20,80,'Filter ▾',13,C.amber,{anchor:'end',fw:'600'}),

    // today label
    text(20,118,'Today',11,C.muted,{fw:'600',ls:'1px'}),
    line(70,113,W-20,113,C.faint,{sw:0.5}),

    ...events.flatMap((ev,i) => {
      const y = 128 + i*84;
      const showDate = i===4;
      return [
        // timeline dot + line
        circle(34,y+24,7,ev.col,{opacity:0.7}),
        ...(i<events.length-1 ? [line(34,y+31,34,y+81,C.border,{sw:1,opacity:0.4})] : []),
        // card
        rect(52,y+4,W-64,68,ev.hot?C.card2:C.card,{rx:12,stroke:ev.hot?ev.col:C.border,sw:ev.hot?0.8:0.4}),
        circle(70,y+26,13,C.faint),
        text(70,y+30,ev.ico,11,C.text,{anchor:'middle'}),
        text(90,y+22,ev.name,13,C.text,{fw:'700'}),
        text(90,y+38,ev.act,11,C.muted,{opacity:0.9}),
        text(W-26,y+18,ev.time+'  ago',9,C.muted,{anchor:'end'}),
        ...(ev.hot ? [
          pill(W-80,y+46,62,16,ev.col+'22'),
          text(W-49,y+58,'AI Signal',9,ev.col,{anchor:'middle',fw:'600'}),
        ] : []),
      ];
    }),

    ...bottomNav('more'),
  ];
  return { name:'Activity', svg:'', elements: els };
}

// ── SCREEN 6: SETTINGS ───────────────────────────────────────────────────────
function screen6() {
  const integrations = [
    { name:'Salesforce', status:'Connected', icon:'☁', col:C.blue },
    { name:'HubSpot',    status:'Connected', icon:'🔶',col:C.amber },
    { name:'Slack',      status:'Connected', icon:'💬',col:C.purple },
    { name:'Gmail',      status:'Sync on',   icon:'📧',col:C.green },
    { name:'Linear',     status:'Connect',   icon:'⬡', col:C.muted },
  ];
  const els = [
    ...chrome(),
    rect(0,44,W,60,C.bg),
    text(20,72,'Settings',24,C.text,{fw:'800',ls:'-0.8px'}),

    // profile card
    rect(16,108,W-32,80,C.card,{rx:16,stroke:C.border,sw:0.5}),
    circle(52,148,26,C.amberGlo),
    text(52,154,'SL',13,C.amber,{anchor:'middle',fw:'800'}),
    text(90,136,'Sarah Li',16,C.text,{fw:'700'}),
    text(90,154,'VP of Sales · Acme Co.',12,C.muted),
    pill(90,162,58,18,C.amberGlo),
    text(119,174,'Pro Plan',10,C.amber,{anchor:'middle',fw:'600'}),
    text(W-28,148,'Edit →',11,C.blue,{anchor:'end',fw:'500'}),

    // AI preferences
    text(20,206,'AI Preferences',13,C.text,{fw:'700'}),
    ...[
      {label:'Smart alerts',       sub:'Notify on signal changes', on:true  },
      {label:'Weekly AI report',   sub:'Sent every Monday 8am',    on:true  },
      {label:'Auto-qualify leads', sub:'AI scores inbound leads',  on:false },
    ].flatMap((p,i) => {
      const y = 222 + i*58;
      return [
        rect(16,y,W-32,50,C.card,{rx:12,stroke:C.border,sw:0.4}),
        text(32,y+21,p.label,13,C.text,{fw:'600'}),
        text(32,y+36,p.sub,11,C.muted),
        // toggle
        rect(W-66,y+16,44,22,p.on?C.amber:C.faint,{rx:11}),
        circle(p.on?W-32:W-54,y+27,9,p.on?C.bg:C.muted),
      ];
    }),

    // integrations
    text(20,368,'Integrations',13,C.text,{fw:'700'}),
    text(W-20,368,'+ Add',11,C.blue,{anchor:'end',fw:'500'}),
    ...integrations.flatMap((intg,i) => {
      const y = 386 + i*56;
      const connected = intg.status !== 'Connect';
      return [
        rect(16,y,W-32,48,C.card,{rx:12,stroke:C.border,sw:0.4}),
        circle(40,y+24,14,connected?intg.col+'33':C.faint),
        text(40,y+28,intg.icon,12,intg.col,{anchor:'middle'}),
        text(64,y+21,intg.name,13,C.text,{fw:'600'}),
        pill(W-100,y+14,80,20,connected?intg.col+'22':C.faint),
        text(W-60,y+27,intg.status,10,connected?intg.col:C.muted,{anchor:'middle',fw:'600'}),
      ];
    }),

    // version footer
    text(W/2,812,'ZEST v2.1.4 · Built by RAM',10,C.muted,{anchor:'middle',opacity:0.5}),

    ...bottomNav('more'),
  ];
  return { name:'Settings', svg:'', elements: els };
}

// ── ASSEMBLE ──────────────────────────────────────────────────────────────────
const screens = [screen1(), screen2(), screen3(), screen4(), screen5(), screen6()];
const totalEls = screens.reduce((s,sc) => s + sc.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'ZEST — AI Pipeline Intelligence',
    author: 'RAM',
    date: new Date().toISOString().slice(0,10),
    theme: 'dark',
    heartbeat: 42,
    elements: totalEls,
    slug: SLUG,
    palette: { bg: C.bg, surface: C.surf, accent: C.amber, accent2: C.blue, text: C.text },
    inspiration: 'saaspo.com — Attio/Clay AI-native CRM aesthetic; bold type hierarchy, near-black editorial dark, warm amber accents',
  },
  screens,
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalEls} elements`);
console.log(`Written: ${SLUG}.pen`);
