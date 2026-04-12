/**
 * KEEL — Freelance Finance OS
 * "Balance your business. Own your runway."
 *
 * Inspired by:
 *   - Midday.ai (featured on darkmodedesign.com): deep charcoal UI with warm
 *     tints, transaction reconciliation with receipt-matching status badges,
 *     time tracking connected to project billing, and an AI "explain the numbers"
 *     strip — treating the product dashboard as the hero of the experience.
 *   - Lapa.ninja trending: "MoMoney" & "OWO" showing tabbed pipeline flows
 *     and business metric cards with clear status coloring (green/amber/red).
 *
 * Theme: DARK (Glyph was light — alternating)
 * Palette: near-black charcoal #0D1017 + electric indigo #4F72FF + warm amber #F5A430
 * 5 screens: Overview · Pipeline · Time · Cash Flow · Tax Reserve
 */

'use strict';
const fs   = require('fs');
const path = require('path');

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const C = {
  bg:        '#0D1017',
  surf:      '#141820',
  surf2:     '#1C2230',
  border:    'rgba(255,255,255,0.07)',
  border2:   'rgba(255,255,255,0.04)',
  text:      '#EEE8DE',
  text2:     'rgba(238,232,222,0.55)',
  text3:     'rgba(238,232,222,0.30)',
  accent:    '#4F72FF',
  accentG:   'rgba(79,114,255,0.16)',
  amber:     '#F5A430',
  amberG:    'rgba(245,164,48,0.14)',
  green:     '#3CC98D',
  greenG:    'rgba(60,201,141,0.13)',
  red:       '#F06464',
  redG:      'rgba(240,100,100,0.13)',
  W: 390,
  H: 844,
};

// ─── ELEMENT BUILDERS ────────────────────────────────────────────────────────
let _id = 1;
const uid = () => `k${_id++}`;

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

const bar = (x,y,w,h,pct,fg,bgc) => [
  R(x,y,w,h,bgc??C.surf2,{r:h/2}),
  R(x,y,Math.max(4,Math.round(w*pct/100)),h,fg,{r:h/2}),
];

const pill = (x,y,label,bg,fg,{pw,ph=18}={}) => {
  const bw = pw ?? (label.length*6.5+14);
  return [
    R(x,y,bw,ph,bg,{r:ph/2}),
    T(x+bw/2,y+ph/2-5,label,9,'600',fg,{align:'center'}),
  ];
};

const card = (x,y,w,h,{fill,r=12,stroke}={}) =>
  R(x,y,w,h,fill??C.surf,{r,stroke:stroke??C.border,sw:1});

const statusBar = () => [
  R(0,0,C.W,44,C.bg),
  T(20,14,'9:41',14,'600',C.text),
  T(320,15,'▲▲▲',8,'normal',C.text3,{ls:1}),
  T(358,13,'⬡',16,'normal',C.text2),
];

const sectionLabel = (x,y,label) =>
  T(x,y,label,9,'700',C.text3,{ls:2});

// ─── BOTTOM NAV ──────────────────────────────────────────────────────────────
const bottomNav = (active) => {
  const items = [
    {icon:'◈', label:'Overview', n:0},
    {icon:'◫', label:'Pipeline', n:1},
    {icon:'◷', label:'Time',     n:2},
    {icon:'∿', label:'Flow',     n:3},
    {icon:'⊟', label:'Reserve',  n:4},
  ];
  const els = [R(0,C.H-82,C.W,82,C.surf,{stroke:C.border,sw:1})];
  items.forEach((item,i) => {
    const cx = Math.round(C.W*(i+0.5)/items.length);
    const isA = item.n === active;
    if(isA) els.push(R(cx-18,C.H-82,36,3,C.accent,{r:2}));
    els.push(
      T(cx,C.H-68,item.icon,20,isA?'700':'400',isA?C.accent:C.text3,{align:'center'}),
      T(cx,C.H-42,item.label,9,isA?'700':'400',isA?C.text:C.text3,{align:'center',w:56}),
    );
  });
  return els;
};

// ─── SCREEN 1: OVERVIEW ──────────────────────────────────────────────────────
function s1() {
  const e = [];
  e.push(R(0,0,C.W,C.H,C.bg));
  e.push(...statusBar());

  // Header
  e.push(
    T(20,52,'KEEL',11,'800',C.text,{ls:4}),
    T(20,70,'Overview',24,'700',C.text),
    T(310,74,'Apr 2025',12,'400',C.text2,{align:'right'}),
  );

  // ── Cash balance card
  e.push(
    card(20,100,350,128,{r:16}),
    T(36,120,'Available Balance',10,'600',C.text3,{ls:1}),
    T(36,150,'$24,380',36,'800',C.text),
    T(36,192,'+$3,200 this month',12,'500',C.green),
    // runway pill
    R(240,116,108,24,C.accentG,{r:12}),
    T(294,122,'72 day runway',10,'600',C.accent,{align:'center',w:108}),
  );

  // ── 3-stat mini cards
  const stats = [
    {label:'Pending',    val:'$7,400', color:C.amber},
    {label:'This week',  val:'24.5h',  color:C.text},
    {label:'Tax reserve',val:'$4,876', color:C.green},
  ];
  stats.forEach((s,i) => {
    const x = 20+i*118;
    e.push(
      card(x,246,108,68,{r:12}),
      T(x+54,262,s.label,9,'600',C.text3,{align:'center',w:80}),
      T(x+54,288,s.val,16,'800',s.color,{align:'center',w:80}),
    );
  });

  // ── Recent transactions
  e.push(sectionLabel(24,336,'RECENT'));

  const txns = [
    {icon:'◈',iconBg:C.accentG,iconC:C.accent, name:'Acme Corp — Invoice #041', sub:'Paid · Apr 4',   amt:'+$4,200', amtC:C.green,  badge:'matched', badgeC:C.green,  badgeG:C.greenG},
    {icon:'◫',iconBg:C.amberG, iconC:C.amber,  name:'Vercel — Monthly',          sub:'Recurring · Apr 1',amt:'-$20',  amtC:C.text2,  badge:null},
    {icon:'⊠',iconBg:C.redG,   iconC:C.red,    name:'Studio Collective',          sub:'Pending · sent Apr 3',amt:'$3,200',amtC:C.amber,  badge:'pending', badgeC:C.amber,  badgeG:C.amberG},
    {icon:'◷',iconBg:C.greenG, iconC:C.green,  name:'Radius Labs — Time',         sub:'Billed · Apr 2',amt:'+$2,800', amtC:C.green,  badge:'matched', badgeC:C.green,  badgeG:C.greenG},
  ];
  txns.forEach((tx,i) => {
    const y = 354+i*70;
    e.push(
      card(20,y,350,58,{r:12}),
      R(32,y+12,32,32,tx.iconBg,{r:8}),
      T(48,y+26,tx.icon,14,'400',tx.iconC,{align:'center'}),
      T(74,y+16,tx.name,12,'600',C.text),
      T(74,y+34,tx.sub,10,'400',C.text2),
      T(358,y+22,tx.amt,13,'700',tx.amtC,{align:'right'}),
    );
    if(tx.badge) {
      e.push(...pill(295,y+36,tx.badge,tx.badgeG,tx.badgeC));
    }
  });

  // ── AI insight strip
  e.push(
    R(20,644,350,50,'rgba(79,114,255,0.09)',{r:12,stroke:'rgba(79,114,255,0.22)',sw:1}),
    T(36,660,'✦',13,'400',C.accent),
    T(56,659,'You earned 18% more than March.',12,'600',C.text),
    T(56,675,'3 invoices account for 89% of revenue.',11,'400',C.text2),
  );

  e.push(...bottomNav(0));
  return e.flat();
}

// ─── SCREEN 2: PIPELINE ──────────────────────────────────────────────────────
function s2() {
  const e = [];
  e.push(R(0,0,C.W,C.H,C.bg));
  e.push(...statusBar());

  e.push(
    T(20,52,'KEEL',11,'800',C.text,{ls:4}),
    T(20,70,'Invoices',24,'700',C.text),
    // new invoice button
    R(296,62,78,28,C.accent,{r:14}),
    T(335,69,'+ New',11,'700','#fff',{align:'center',w:78}),
  );

  e.push(sectionLabel(24,108,'PIPELINE'));

  // Stage flow cards
  const stages = [
    {label:'Draft',   count:2, amt:'$1,800', c:C.text3,   g:C.border2},
    {label:'Sent',    count:3, amt:'$7,400', c:C.accent,  g:C.accentG},
    {label:'Viewed',  count:1, amt:'$3,200', c:C.amber,   g:C.amberG},
    {label:'Paid',    count:8, amt:'$18,600',c:C.green,   g:C.greenG},
  ];
  stages.forEach((s,i) => {
    const sx = 20+i*86;
    const isActive = s.label === 'Sent';
    e.push(
      card(sx,122,72,72,{r:12,stroke:isActive?'rgba(79,114,255,0.35)':C.border}),
      T(sx+36,140,s.label,9,'600',C.text3,{align:'center',w:72}),
      T(sx+36,162,String(s.count),22,'800',s.c,{align:'center',w:72}),
      T(sx+36,176,s.amt,8,'500',C.text3,{align:'center',w:72}),
    );
    if(i<3) e.push(T(sx+78,156,'›',14,'400',C.text3,{align:'center'}));
  });

  // Active invoice list
  e.push(sectionLabel(24,214,'SENT & ACTIVE'));

  const invoices = [
    {name:'Acme Corp',          num:'#042', sub:'Due Apr 15',    amt:'$4,200', status:'Sent',    sc:C.accent, sg:C.accentG},
    {name:'Studio Collective',  num:'#040', sub:'Viewed · Apr 4',amt:'$3,200', status:'Viewed',  sc:C.amber,  sg:C.amberG},
    {name:'Radius Labs',        num:'#039', sub:'Due Apr 12',    amt:'$2,800', status:'Sent',    sc:C.accent, sg:C.accentG},
    {name:'Maple Digital',      num:'#038', sub:'Overdue 3 days',amt:'$1,400', status:'Overdue', sc:C.red,    sg:C.redG},
  ];
  invoices.forEach((inv,i) => {
    const y = 230+i*70;
    e.push(
      card(20,y,350,60,{r:12}),
      T(36,y+14,inv.name,13,'600',C.text),
      T(36,y+34,inv.num+' · '+inv.sub,10,'400',C.text2),
      T(356,y+20,inv.amt,14,'700',C.text,{align:'right'}),
      ...pill(296,y+36,inv.status,inv.sg,inv.sc),
    );
  });

  // Paid strip
  e.push(
    R(20,514,350,52,'rgba(60,201,141,0.07)',{r:12,stroke:'rgba(60,201,141,0.18)',sw:1}),
    T(36,534,'Paid this month',12,'500',C.text2),
    T(356,540,'$18,600',18,'800',C.green,{align:'right'}),
    T(36,552,'8 invoices cleared',10,'400',C.text3),
  );

  e.push(...bottomNav(1));
  return e.flat();
}

// ─── SCREEN 3: TIME TRACKING ─────────────────────────────────────────────────
function s3() {
  const e = [];
  e.push(R(0,0,C.W,C.H,C.bg));
  e.push(...statusBar());

  e.push(
    T(20,52,'KEEL',11,'800',C.text,{ls:4}),
    T(20,70,'Time',24,'700',C.text),
    T(320,74,'Week Apr 1',11,'400',C.text2,{align:'right'}),
  );

  // ── Active timer card
  e.push(
    card(20,100,350,108,{r:16,stroke:'rgba(79,114,255,0.28)',sw:1}),
    // pulse indicator
    E(42,128,8,C.accentG),
    E(42,128,5,C.accent),
    T(58,120,'Acme Corp — Sprint 12',13,'600',C.text),
    T(58,138,'Recording…',10,'500',C.accent),
    T(195,168,'2:14:32',34,'800',C.text,{align:'center',w:350}),
    // stop button
    R(312,108,44,44,'rgba(240,100,100,0.14)',{r:10,stroke:'rgba(240,100,100,0.28)',sw:1}),
    T(334,122,'■',18,'400',C.red,{align:'center'}),
  );

  // ── Week summary
  e.push(
    card(20,226,350,62,{r:12}),
    T(52,246,'24.5h',20,'800',C.text),
    T(52,268,'tracked',10,'400',C.text2),
    T(160,246,'$3,675',20,'800',C.green),
    T(160,268,'billable',10,'400',C.text2),
    T(270,246,'19.6h',20,'800',C.accent),
    T(270,268,'billable hrs',10,'400',C.text2),
  );

  // ── Projects
  e.push(sectionLabel(24,308,'BY PROJECT'));

  const projs = [
    {name:'Acme Corp',          hrs:'12.5h', pct:82, c:C.accent},
    {name:'Studio Collective',  hrs:'7.0h',  pct:46, c:C.amber},
    {name:'Internal / admin',   hrs:'5.0h',  pct:33, c:C.text3},
  ];
  projs.forEach((p,i) => {
    const y = 324+i*52;
    e.push(
      T(24,y+12,p.name,12,'600',C.text),
      T(356,y+12,p.hrs,11,'600',C.text2,{align:'right'}),
      ...bar(24,y+24,342,7,p.pct,p.c,C.surf2),
    );
  });

  // ── Day bars (Mon–Fri)
  e.push(sectionLabel(24,486,'THIS WEEK'));

  const days = [{d:'M',h:6.2,b:68},{d:'T',h:4.5,b:50},{d:'W',h:7.0,b:77},{d:'T',h:3.8,b:42},{d:'F',h:3.0,b:33}];
  days.forEach((dy,i) => {
    const bx = 36+i*66;
    const isToday = i===2;
    e.push(
      R(bx,570-dy.b,38,dy.b,isToday?C.accent:C.surf2,{r:6}),
      T(bx+19,580,dy.d,11,'500',isToday?C.text:C.text3,{align:'center'}),
      T(bx+19,560-dy.b,dy.h+'h',9,'500',isToday?C.accent:C.text3,{align:'center'}),
    );
  });

  // AI insight
  e.push(
    R(20,600,350,52,'rgba(79,114,255,0.08)',{r:12,stroke:'rgba(79,114,255,0.18)',sw:1}),
    T(36,618,'✦',12,'400',C.accent),
    T(54,617,'At this rate, you\'ll bill $8,200+ this month.',12,'600',C.text),
    T(54,633,'Ahead of last month by 2.3 hours.',11,'400',C.text2),
  );

  e.push(...bottomNav(2));
  return e.flat();
}

// ─── SCREEN 4: CASH FLOW ─────────────────────────────────────────────────────
function s4() {
  const e = [];
  e.push(R(0,0,C.W,C.H,C.bg));
  e.push(...statusBar());

  e.push(
    T(20,52,'KEEL',11,'800',C.text,{ls:4}),
    T(20,70,'Cash Flow',24,'700',C.text),
  );

  // Tab toggle
  e.push(
    R(20,102,350,34,C.surf,{r:17,stroke:C.border,sw:1}),
    R(22,104,114,30,C.accent,{r:15}),
    T(79,110,'Monthly',11,'700','#fff',{align:'center',w:114}),
    T(195,110,'Quarterly',11,'400',C.text3,{align:'center',w:114}),
    T(316,110,'Annual',11,'400',C.text3,{align:'center',w:86}),
  );

  // Net hero
  e.push(
    card(20,150,350,80,{r:14}),
    T(36,172,'Net this month',11,'500',C.text2),
    T(36,198,'+$5,280',32,'800',C.green),
    R(243,158,1,56,C.border),
    T(256,172,'IN   $21,800',11,'500',C.text2),
    T(256,190,'OUT  $16,520',11,'500',C.text2),
    T(256,208,'NET  +$5,280',11,'600',C.green),
  );

  // Bar chart — 6 months
  e.push(sectionLabel(24,248,'NOV 2024 – APR 2025'));

  const months = [
    {m:'N',in:14200,out:12100},{m:'D',in:19800,out:11900},
    {m:'J',in:9400,out:10200},{m:'F',in:16200,out:12800},
    {m:'M',in:18500,out:14200},{m:'A',in:21800,out:16520},
  ];
  const maxV=22000, bh=100;
  months.forEach((mo,i) => {
    const bx = 28+i*56;
    const isA = i===5;
    const ih = Math.round(bh*mo.in/maxV);
    const oh = Math.round(bh*mo.out/maxV);
    e.push(
      R(bx,264+(bh-oh),18,oh,isA?'rgba(240,100,100,0.55)':'rgba(240,100,100,0.22)',{r:4}),
      R(bx+22,264+(bh-ih),18,ih,isA?C.green:'rgba(60,201,141,0.32)',{r:4}),
      T(bx+20,372,mo.m,9,'500',isA?C.text:C.text3,{align:'center'}),
    );
  });

  // Legend
  e.push(
    R(24,386,10,10,'rgba(60,201,141,0.5)',{r:2}),
    T(40,396,'Income',9,'500',C.text2),
    R(90,386,10,10,'rgba(240,100,100,0.5)',{r:2}),
    T(106,396,'Expenses',9,'500',C.text2),
  );

  // Top expenses
  e.push(sectionLabel(24,416,'TOP EXPENSES'));

  const exps = [
    {cat:'Contractors',   amt:'$8,200',  pct:50, c:C.accent},
    {cat:'SaaS tools',    amt:'$1,840',  pct:11, c:C.amber},
    {cat:'Tax reserved',  amt:'$4,876',  pct:30, c:C.green},
    {cat:'Other',         amt:'$1,604',  pct:9,  c:C.text3},
  ];
  exps.forEach((ex,i) => {
    const y = 432+i*50;
    e.push(
      T(24,y+12,ex.cat,12,'500',C.text),
      T(356,y+12,ex.amt,12,'600',C.text,{align:'right'}),
      ...bar(24,y+22,302,6,ex.pct,ex.c,C.surf2),
      T(334,y+28,ex.pct+'%',9,'500',C.text3),
    );
  });

  e.push(...bottomNav(3));
  return e.flat();
}

// ─── SCREEN 5: TAX RESERVE ───────────────────────────────────────────────────
function s5() {
  const e = [];
  e.push(R(0,0,C.W,C.H,C.bg));
  e.push(...statusBar());

  e.push(
    T(20,52,'KEEL',11,'800',C.text,{ls:4}),
    T(20,70,'Tax Reserve',24,'700',C.text),
  );

  // Reserve hero card
  e.push(
    card(20,100,350,128,{r:16,stroke:'rgba(60,201,141,0.28)',sw:1}),
    T(36,124,'Current Reserve',10,'600',C.text3,{ls:1}),
    T(36,150,'$4,876',36,'800',C.green),
    T(36,192,'Next Q1 payment · Jun 15 · est. $5,200',11,'400',C.text2),
    // ring progress (simulated)
    E(320,162,36,'rgba(60,201,141,0.1)',{stroke:'rgba(60,201,141,0.22)',sw:2}),
    T(320,154,'28%',15,'800',C.green,{align:'center'}),
    T(320,174,'set aside',9,'500',C.text3,{align:'center'}),
  );

  // Auto-reserve rule toggle
  e.push(
    R(20,244,350,50,'rgba(79,114,255,0.08)',{r:12,stroke:'rgba(79,114,255,0.2)',sw:1}),
    T(36,264,'Auto-reserve 28% of every payment',12,'600',C.text),
    T(36,280,'Active · runs on payment receipt',10,'500',C.accent),
    R(318,256,36,20,C.accent,{r:10}),
    E(344,266,8,'#fff'),
  );

  // Quarterly breakdown
  e.push(sectionLabel(24,312,'QUARTERLY BREAKDOWN'));

  const quarters = [
    {q:'Q1 2025', due:'Due Jun 15',  est:'$5,200', status:'Upcoming', sc:C.amber, sg:C.amberG, paid:false},
    {q:'Q4 2024', due:'Paid Jan 15', est:'$4,800', status:'Paid',     sc:C.green, sg:C.greenG, paid:true},
    {q:'Q3 2024', due:'Paid Oct 15', est:'$3,900', status:'Paid',     sc:C.green, sg:C.greenG, paid:true},
  ];
  quarters.forEach((q,i) => {
    const y = 328+i*66;
    e.push(
      card(20,y,350,58,{r:12,stroke:q.paid?C.border:'rgba(245,164,48,0.22)',sw:1}),
      T(36,y+14,q.q,13,'700',C.text),
      T(36,y+34,q.due,10,'400',C.text2),
      T(356,y+22,q.est,15,'700',C.text,{align:'right'}),
      ...pill(290,y+36,q.status,q.sg,q.sc),
    );
    if(q.paid) e.push(T(355,y+14,'✓',13,'700',C.green,{align:'right'}));
  });

  // Top-up insight
  e.push(
    R(20,534,350,66,'rgba(79,114,255,0.08)',{r:12,stroke:'rgba(79,114,255,0.15)',sw:1}),
    T(36,556,'✦',12,'400',C.accent),
    T(54,554,'At current revenue, you\'ll need $5,200 for Q1.',12,'600',C.text),
    T(54,572,'You\'re $324 short — top up your reserve?',11,'400',C.text2),
    R(252,558,106,26,C.accent,{r:13}),
    T(305,565,'Top up $324',10,'700','#fff',{align:'center',w:106}),
  );

  // Summary stats
  e.push(
    card(20,620,164,58,{r:12}),
    T(102,638,'Eff. rate',9,'600',C.text3,{align:'center',w:164}),
    T(102,658,'24.8%',20,'800',C.text,{align:'center',w:164}),
    card(206,620,164,58,{r:12}),
    T(288,638,'YTD reserved',9,'600',C.text3,{align:'center',w:164}),
    T(288,658,'$14,230',20,'800',C.green,{align:'center',w:164}),
  );

  e.push(...bottomNav(4));
  return e.flat();
}

// ─── WRITE PEN FILE ──────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'KEEL',
  description:
    'Freelance Finance OS — Dark mode, deep charcoal #0D1017, electric indigo #4F72FF + warm amber #F5A430. ' +
    'Inspired by Midday.ai on darkmodedesign.com: transaction reconciliation with receipt-matching status badges, ' +
    'time tracking connected to invoicing, AI "explain the numbers" insight strips. ' +
    '5 screens: Overview (cash + txn feed), Pipeline (invoice stages), Time (active timer + bars), ' +
    'Cash Flow (monthly bars + expense breakdown), Tax Reserve (auto-set-aside + quarterly payments).',
  screens: [
    {id:'s1',label:'Overview',  width:390,height:844,elements:s1()},
    {id:'s2',label:'Pipeline',  width:390,height:844,elements:s2()},
    {id:'s3',label:'Time',      width:390,height:844,elements:s3()},
    {id:'s4',label:'Cash Flow', width:390,height:844,elements:s4()},
    {id:'s5',label:'Reserve',   width:390,height:844,elements:s5()},
  ],
};

const OUT = path.join(__dirname,'keel.pen');
fs.writeFileSync(OUT, JSON.stringify(pen,null,2));
const bytes = JSON.stringify(pen).length;
console.log(`✓ keel.pen written — ${bytes.toLocaleString()} bytes`);
pen.screens.forEach(s => console.log(`  ${s.label}: ${s.elements.length} elements`));
