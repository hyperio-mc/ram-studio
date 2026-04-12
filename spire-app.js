/**
 * SPIRE — AI Project Intelligence
 * "Every signal, every sprint, in focus"
 *
 * Inspired by:
 *   - Linear.app (Lapa Ninja SaaS): deep warm-dark bg #08090A, muted indigo #5E6AD2,
 *     "product development for teams AND agents" — the AI-era product framing
 *   - Salt&Bits (darkmodedesign.com): warm dark #171514, warm off-white #F7F5F0,
 *     editorial typographic precision
 *   - Midday.ai: "Let agents run your business" — autonomous agent narrative
 *
 * Theme: DARK (Sol was light — rotating per heartbeat rules)
 * Palette: warm near-black + muted indigo + terracotta
 * 5 screens: Command · Projects · Agents · Signals · Timeline
 */

'use strict';
const fs   = require('fs');
const path = require('path');

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const C = {
  bg:      '#0C0B0A',
  surf:    '#181614',
  surf2:   '#222019',
  surf3:   '#2C2924',
  border:  'rgba(237,233,226,0.10)',
  border2: 'rgba(237,233,226,0.06)',
  text:    '#EDE9E2',
  text2:   'rgba(237,233,226,0.58)',
  text3:   'rgba(237,233,226,0.34)',
  accent:  '#5468D4',
  accent2: '#D4723A',
  green:   '#3DB88C',
  red:     '#C9542A',
  W: 390,
  H: 844,
};

// ─── ELEMENT BUILDERS ────────────────────────────────────────────────────────
let _id = 1;
const uid = () => `e${_id++}`;

const R = (x,y,w,h,fill,{r=0,op=1,stroke,sw=1}={}) => ({
  id:uid(), type:'rect', x,y,width:w,height:h, fill,
  radius:r, opacity:op,
  ...(stroke?{stroke,strokeWidth:sw}:{}),
});

const T = (x,y,content,fontSize,fontWeight,fill,{align='left',ff='Inter',op=1,ls=0,w=0,h=0}={}) => ({
  id:uid(), type:'text', x,y, width:w,height:h,
  content:String(content), fontSize, fontWeight:String(fontWeight),
  fill, align, fontFamily:ff, opacity:op, letterSpacing:ls,
});

const E = (cx,cy,r,fill,{op=1,stroke,sw=1}={}) => ({
  id:uid(), type:'ellipse',
  x:cx-r, y:cy-r, width:r*2, height:r*2,
  fill, opacity:op,
  ...(stroke?{stroke,strokeWidth:sw}:{}),
});

// Status pill
const pill=(x,y,label,bg,fg,{w,h=20}={})=>{
  const pw=w??(label.length*7+16);
  return [
    R(x,y,pw,h,bg,{r:h/2}),
    T(x+pw/2,y+h/2-5,label,10,'500',fg,{align:'center'}),
  ];
};

// Card (surface rect with border)
const card=(x,y,w,h,{fill,r=12,stroke}={})=>
  R(x,y,w,h,fill??C.surf,{r,stroke:stroke??C.border,sw:1});

// Progress bar (background + fill)
const bar=(x,y,w,h,pct,fg,{bg}={})=>[
  R(x,y,w,h,bg??C.surf3,{r:h/2}),
  R(x,y,Math.max(4,Math.round(w*pct/100)),h,fg,{r:h/2}),
];

// Status row: dot + label
const dot=(x,y,label,color)=>[
  E(x+4,y+5,4,color),
  T(x+14,y,label,12,'400',C.text2),
];

// Status bar
const statusBar=(bg)=>[
  R(0,0,C.W,44,bg??C.bg),
  T(16,14,'9:41',15,'600',C.text),
  T(316,15,'▲▲▲',9,'normal',C.text3,{ls:1}),
  T(354,13,'⬡',18,'normal',C.text2),
];

// Bottom nav
const bottomNav=(active)=>{
  const items=[
    {icon:'⊞',label:'Command',n:0},
    {icon:'◫',label:'Projects',n:1},
    {icon:'◈',label:'Agents',n:2},
    {icon:'◉',label:'Signals',n:3},
    {icon:'⊙',label:'Timeline',n:4},
  ];
  const els=[R(0,C.H-82,C.W,82,C.surf,{stroke:C.border,sw:1})];
  items.forEach((item,i)=>{
    const cx=Math.round(C.W*(i+0.5)/items.length);
    const isA=item.n===active;
    if(isA) els.push(R(cx-4,C.H-70,8,2,C.accent,{r:1}));
    els.push(
      T(cx,C.H-66,item.icon,20,isA?'600':'400',isA?C.accent:C.text3,{align:'center'}),
      T(cx,C.H-40,item.label,9,isA?'600':'400',isA?C.text:C.text3,{align:'center',w:40}),
    );
  });
  return els;
};

// ─── SCREEN 1: COMMAND ───────────────────────────────────────────────────────
function s1(){
  _id=1;
  const e=[
    R(0,0,C.W,C.H,C.bg),
    ...statusBar(),
    T(20,58,'SPIRE',11,'700',C.text3,{ls:2}),
    T(20,74,'Command',26,'700',C.text),
    T(20,106,'Sunday, Apr 5',13,'400',C.text3),
    E(358,88,18,C.surf3),
    T(358,82,'R',14,'700',C.accent,{align:'center'}),
  ];

  // 4 metric chips 2×2
  const metrics=[
    {x:10, y:134, label:'ACTIVE AGENTS', val:'12', sub:'↑ 3 since Mon',  color:C.green},
    {x:208,y:134, label:'OPEN SIGNALS',  val:'7',  sub:'2 high priority',color:C.red},
    {x:10, y:226, label:'ON TRACK',      val:'84%',sub:'across 9 projects',color:C.accent},
    {x:208,y:226, label:'VELOCITY',      val:'↑22',sub:'pts this sprint', color:C.accent2},
  ];
  metrics.forEach(m=>{
    e.push(
      card(m.x,m.y,178,82),
      T(m.x+14,m.y+13,m.label,9,'500',C.text3,{ls:0.5}),
      T(m.x+14,m.y+28,m.val,24,'700',m.color),
      T(m.x+14,m.y+60,m.sub,10,'400',C.text2),
    );
  });

  // Agent activity list
  e.push(
    T(20,324,'Active Agents',15,'600',C.text),
    T(316,324,'See all →',11,'400',C.accent),
    R(0,344,C.W,1,C.border),
  );

  const agents=[
    {name:'Scope Tracker',  proj:'Atlas UI',     status:'Monitoring',color:C.green},
    {name:'Risk Detector',  proj:'API Platform', status:'Alert',     color:C.red},
    {name:'Velocity Coach', proj:'Mobile App',   status:'Idle',      color:C.text3},
    {name:'PR Summariser',  proj:'Core Engine',  status:'Running',   color:C.accent2},
  ];
  agents.forEach((a,i)=>{
    const ay=352+i*60;
    e.push(
      card(10,ay,370,52,{r:10}),
      E(36,ay+26,14,C.surf3),
      T(32,ay+20,'◈',14,'400',a.color,{align:'center'}),
      T(58,ay+13,a.name,13,'600',C.text),
      T(58,ay+30,a.proj,11,'400',C.text3),
      ...dot(286,ay+21,a.status,a.color),
    );
  });

  // Sprint pulse
  e.push(
    T(20,598,'Sprint Pulse',15,'600',C.text),
    card(10,618,370,68),
    T(24,630,'Atlas UI — Sprint 14',13,'600',C.text),
    T(24,648,'12 of 18 issues closed · 3 days left',11,'400',C.text2),
    ...bar(24,664,342,6,67,C.accent),
    T(24,674,'67%',9,'600',C.accent),
    T(344,674,'18 pts left',9,'400',C.text3,{align:'right'}),
  );

  e.push(...bottomNav(0));
  return e;
}

// ─── SCREEN 2: PROJECTS ──────────────────────────────────────────────────────
function s2(){
  _id=200;
  const e=[
    R(0,0,C.W,C.H,C.bg),
    ...statusBar(),
    T(20,58,'SPIRE',11,'700',C.text3,{ls:2}),
    T(20,74,'Projects',26,'700',C.text),
  ];

  // Filter tabs
  ['All','Active','At Risk','On Hold'].forEach((tab,i)=>{
    const tw=tab.length*8+20, tx=20+i*82;
    const isA=i===0;
    e.push(
      R(tx,114,tw,28,isA?C.accent:C.surf2,{r:6}),
      T(tx+tw/2,122,tab,11,isA?'600':'400',isA?'#fff':C.text2,{align:'center'}),
    );
  });

  const projects=[
    {name:'Atlas UI Redesign',   team:'Design · Frontend', status:'On Track', pct:67, agents:3, color:C.green,  pri:'HIGH'},
    {name:'API Platform v2',     team:'Platform',          status:'At Risk',  pct:42, agents:2, color:C.red,    pri:'CRIT'},
    {name:'Mobile App Launch',   team:'Mobile',            status:'On Track', pct:81, agents:4, color:C.green,  pri:'HIGH'},
    {name:'Core Engine Refactor',team:'Backend',           status:'Delayed',  pct:28, agents:1, color:C.accent2,pri:'MED'},
    {name:'Data Pipeline',       team:'Data',              status:'On Track', pct:55, agents:2, color:C.green,  pri:'LOW'},
  ];
  const priC={HIGH:C.accent2,CRIT:C.red,MED:C.text3,LOW:C.text3};

  projects.forEach((p,i)=>{
    const py=158+i*110;
    e.push(
      card(10,py,370,100),
      // priority badge
      R(20,py+12,p.pri.length*7+12,18,priC[p.pri]+'22',{r:4}),
      T(26,py+14,p.pri,9,'700',priC[p.pri]),
      // status pill
      ...pill(270,py+10,p.status,p.color+'22',p.color,{w:80}),
      T(24,py+36,p.name,14,'600',C.text),
      T(24,py+54,p.team,11,'400',C.text3),
      ...bar(24,py+72,280,5,p.pct,p.color),
      T(316,py+68,`${p.pct}%`,10,'600',p.color),
      T(24,py+82,`◈ ${p.agents} agents`,10,'400',C.text3),
    );
  });

  e.push(...bottomNav(1));
  return e;
}

// ─── SCREEN 3: AGENTS ────────────────────────────────────────────────────────
function s3(){
  _id=400;
  const e=[
    R(0,0,C.W,C.H,C.bg),
    ...statusBar(),
    T(20,58,'SPIRE',11,'700',C.text3,{ls:2}),
    T(20,74,'Agents',26,'700',C.text),
    T(20,106,'12 running · 3 idle · 1 alerting',12,'400',C.text3),
  ];

  // Summary row
  [{label:'Running',val:'12',color:C.green,x:10},
   {label:'Idle',   val:'3', color:C.text3,x:136},
   {label:'Alert',  val:'1', color:C.red,  x:262}].forEach(c=>{
    e.push(
      card(c.x,128,114,54),
      T(c.x+14,c.x===10?138:138,c.label,9,'500',C.text3),
      T(c.x+14,c.x===10?150:150,c.val,22,'700',c.color),
    );
  });

  const agents=[
    {name:'Scope Tracker',  proj:'Atlas UI',     desc:'Monitors feature creep vs sprint scope',          status:'Running',color:C.green,  last:'2 min', signal:'Scope stable — 2 additions flagged'},
    {name:'Risk Detector',  proj:'API Platform', desc:'Cross-refs velocity & dependency graph',          status:'Alert',  color:C.red,    last:'8 min', signal:'⚠ Dependency delay — 3-day impact'},
    {name:'Velocity Coach', proj:'Mobile App',   desc:'Tracks output against historical baseline',       status:'Idle',   color:C.text3,  last:'41 min',signal:'Team at 108% avg velocity'},
    {name:'PR Summariser',  proj:'Core Engine',  desc:'Summarises merged PRs into weekly digest',        status:'Running',color:C.accent2,last:'Just now',signal:'Digest ready — 12 PRs today'},
  ];

  agents.forEach((a,i)=>{
    const ay=200+i*150;
    e.push(
      card(10,ay,370,138),
      R(10,ay,4,138,a.color,{r:0}),
      E(42,ay+30,18,C.surf3),
      T(38,ay+22,'◈',18,'400',a.color,{align:'center'}),
      T(70,ay+16,a.name,14,'600',C.text),
      ...dot(70,ay+34,a.status,a.color),
      T(70,ay+52,a.proj,11,'400',C.text3),
      T(24,ay+72,a.desc,11,'400',C.text2,{w:346}),
      R(24,ay+94,346,1,C.border),
      T(24,ay+102,a.signal,11,'400',i===1?C.red:C.green,{w:280}),
      T(24,ay+118,`Last run: ${a.last} ago`,9,'400',C.text3),
    );
  });

  e.push(...bottomNav(2));
  return e;
}

// ─── SCREEN 4: SIGNALS ───────────────────────────────────────────────────────
function s4(){
  _id=600;
  const e=[
    R(0,0,C.W,C.H,C.bg),
    ...statusBar(),
    T(20,58,'SPIRE',11,'700',C.text3,{ls:2}),
    T(20,74,'Signals',26,'700',C.text),
    T(20,106,'AI-detected risks & project insights',12,'400',C.text3),
  ];

  // Summary chips
  [{label:'Critical',val:1,color:C.red,  x:10 },
   {label:'Warning', val:4,color:C.accent2,x:136},
   {label:'Info',    val:12,color:C.accent,x:262}].forEach(c=>{
    e.push(
      card(c.x,128,114,54),
      T(c.x+14,138,c.label,9,'500',C.text3),
      T(c.x+14,150,String(c.val),22,'700',c.color),
    );
  });

  const signals=[
    {sev:'CRITICAL',sevC:C.red,    fillBg:'#1A0C0A',borderC:C.red+'44',
     title:'Dependency delay detected',
     body:'API Platform v2 blocked by auth-service v3. Est. 3-day impact on Sprint 14.',
     proj:'API Platform v2',agent:'Risk Detector',time:'8 min ago',action:'Review →'},
    {sev:'WARNING', sevC:C.accent2,fillBg:C.surf,  borderC:C.border,
     title:'Scope creep flagged',
     body:'2 new features added to Atlas UI sprint without story point allocation.',
     proj:'Atlas UI Redesign',agent:'Scope Tracker',time:'34 min ago',action:'Triage →'},
    {sev:'INFO',    sevC:C.accent, fillBg:C.surf,  borderC:C.border,
     title:'Velocity above baseline',
     body:'Mobile App team at 108% of 4-sprint baseline. Sustainable pace check recommended.',
     proj:'Mobile App Launch',agent:'Velocity Coach',time:'1 hr ago',action:'View →'},
    {sev:'INFO',    sevC:C.accent, fillBg:C.surf,  borderC:C.border,
     title:'Weekly PR digest ready',
     body:'12 pull requests merged across Core Engine. Key: auth refactor, rate limiting.',
     proj:'Core Engine',agent:'PR Summariser',time:'2 hrs ago',action:'Read →'},
  ];

  signals.forEach((s,i)=>{
    const sy=200+i*148;
    e.push(
      card(10,sy,370,136,{fill:s.fillBg,stroke:s.borderC}),
      R(10,sy,4,136,s.sevC,{r:0}),
      R(22,sy+12,s.sev.length*7+12,18,s.sevC+'22',{r:4}),
      T(28,sy+14,s.sev,9,'700',s.sevC),
      T(348,sy+14,s.time,9,'400',C.text3,{align:'right'}),
      T(22,sy+36,s.title,13,'600',C.text),
      T(22,sy+54,s.body,10,'400',C.text2,{w:346}),
      R(22,sy+94,346,1,C.border),
      T(22,sy+102,`◈ ${s.agent}`,10,'400',C.text3),
      T(22,sy+114,s.proj,10,'400',C.text3),
      T(348,sy+108,s.action,10,'600',s.sevC,{align:'right'}),
    );
  });

  e.push(...bottomNav(3));
  return e;
}

// ─── SCREEN 5: TIMELINE ──────────────────────────────────────────────────────
function s5(){
  _id=800;
  const e=[
    R(0,0,C.W,C.H,C.bg),
    ...statusBar(),
    T(20,58,'SPIRE',11,'700',C.text3,{ls:2}),
    T(20,74,'Timeline',26,'700',C.text),
    T(20,106,'Q2 2026 · Sprint 14 → 18',12,'400',C.text3),
  ];

  // Calendar strip
  ['M','T','W','T','F','S','S'].forEach((d,i)=>{
    const dx=10+i*54, isToday=i===6;
    e.push(
      R(dx,128,46,46,isToday?C.accent:C.surf2,{r:8}),
      T(dx+23,136,d,9,'500',isToday?'#fff':C.text3,{align:'center'}),
      T(dx+23,150,['30','31','1','2','3','4','5'][i],14,isToday?'700':'400',
        isToday?'#fff':C.text,{align:'center'}),
    );
  });

  // Gantt rows
  const rows=[
    {name:'Atlas UI',    spr:'Spr 14',start:0.00,end:0.55,color:C.accent, ms:[{pct:0.45,label:'Review'}]},
    {name:'API Platform',spr:'Spr 14',start:0.00,end:0.85,color:C.red,    ms:[{pct:0.35,label:'Unblock'},{pct:0.75,label:'Beta'}]},
    {name:'Mobile App',  spr:'Spr 15',start:0.20,end:0.95,color:C.green,  ms:[{pct:0.80,label:'QA'}]},
    {name:'Core Engine', spr:'Spr 16',start:0.40,end:1.00,color:C.accent2,ms:[{pct:0.50,label:'Phase 2'}]},
    {name:'Data Pipeline',spr:'Spr 14',start:0.10,end:0.72,color:C.accent,ms:[{pct:0.65,label:'Live'}]},
  ];

  const TW=280,TX=96,TY0=192;
  // Today line
  const todayX=TX+Math.round(TW*0.92);
  e.push(
    R(todayX,TY0-2,1,rows.length*76+24,C.accent,{op:0.5}),
    T(todayX-12,TY0-12,'TODAY',8,'700',C.accent),
  );

  rows.forEach((r,i)=>{
    const ry=TY0+i*76;
    const bx=TX+Math.round(TW*r.start);
    const bw=Math.round(TW*(r.end-r.start));
    e.push(
      T(12,ry+8,r.name,11,'600',C.text,{w:82}),
      T(12,ry+24,r.spr,9,'400',C.text3),
      R(TX,ry,TW,28,C.surf2,{r:5}),
      R(bx,ry+3,bw,22,r.color+'88',{r:4}),
      R(bx,ry+3,4,22,r.color,{r:3}),
    );
    r.ms.forEach(m=>{
      const mx=bx+Math.round(bw*m.pct);
      e.push(
        R(mx-4,ry+9,10,10,r.color,{r:2}),
        T(mx-4,ry+36,m.label,8,'400',C.text3),
      );
    });
  });

  // Upcoming milestones
  e.push(
    T(20,588,'Upcoming this week',14,'600',C.text),
    R(0,610,C.W,1,C.border),
  );
  [
    {proj:'Atlas UI',  ms:'Design review',  due:'Tomorrow',color:C.accent},
    {proj:'Data Pipeline',ms:'Pipeline live',due:'Apr 7',  color:C.accent},
    {proj:'API Platform',ms:'Auth unblock',  due:'Apr 8',  color:C.red},
  ].forEach((u,i)=>{
    const uy=620+i*48;
    e.push(
      card(10,uy,370,38,{r:8}),
      R(10,uy,4,38,u.color,{r:0}),
      T(26,uy+6,u.proj,10,'600',C.text3),
      T(26,uy+20,u.ms,12,'600',C.text),
      T(348,uy+14,u.due,10,'600',u.color,{align:'right'}),
    );
  });

  e.push(...bottomNav(4));
  return e;
}

// ─── WRITE PEN FILE ──────────────────────────────────────────────────────────
const pen={
  version:'2.8',
  name:'SPIRE',
  description:
    'AI Project Intelligence — Dark editorial theme. Warm near-black #0C0B0A bg, muted indigo #5468D4 + terracotta #D4723A accents. ' +
    'Inspired by Linear.app (Lapa Ninja SaaS list: "product development for teams AND agents"), ' +
    'Salt&Bits (darkmodedesign.com: warm dark #171514 + warm off-white #F7F5F0 editorial palette), ' +
    'Midday.ai ("Let agents run your business" agent-first narrative). ' +
    '5 screens: Command dashboard, Projects list, AI Agents panel, Signals feed, Timeline Gantt.',
  screens:[
    {id:'s1',label:'Command', width:390,height:844,elements:s1()},
    {id:'s2',label:'Projects',width:390,height:844,elements:s2()},
    {id:'s3',label:'Agents',  width:390,height:844,elements:s3()},
    {id:'s4',label:'Signals', width:390,height:844,elements:s4()},
    {id:'s5',label:'Timeline',width:390,height:844,elements:s5()},
  ],
};

const OUT=path.join(__dirname,'spire.pen');
fs.writeFileSync(OUT,JSON.stringify(pen,null,2));
const bytes=JSON.stringify(pen).length;
console.log(`✓ spire.pen written — ${bytes.toLocaleString()} bytes`);
pen.screens.forEach(s=>console.log(`  ${s.label}: ${s.elements.length} elements`));
