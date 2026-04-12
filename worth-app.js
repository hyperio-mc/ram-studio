'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'worth';
const NAME = 'WORTH';
const TAGLINE = 'your money, as a story';
const HEARTBEAT = 1;

// ── Palette (Light / Warm Cream editorial) ─────────────────────────────
// Inspired by Land-Book's warm cream system: FAF7F2, Instrument Serif,
// forest green accent, bento grid layout (2025-2026 dominant trend)
const P = {
  bg:      '#FAF7F2',
  surface: '#FFFFFF',
  card:    '#F5F0E8',
  cardB:   '#EDE6D8',
  text:    '#1A1614',
  textMid: '#5A5350',
  textDim: '#9A918C',
  green:   '#2C6B3F',
  greenLt: '#EBF5EE',
  amber:   '#C47D3A',
  amberLt: '#FDF3E7',
  red:     '#C0392B',
  redLt:   '#FDECEA',
  border:  '#E8E0D4',
  white:   '#FFFFFF',
};

// ── Primitives ─────────────────────────────────────────────────────────
function rect(x,y,w,h,fill,opts={}) {
  return { type:'rect', x, y, w, h, fill,
    rx: opts.rx||0, opacity: opts.opacity||1,
    stroke: opts.stroke||'none', sw: opts.sw||1 };
}
function text(x,y,content,size,fill,opts={}) {
  return { type:'text', x, y, content: String(content), size,
    fill, fw: opts.fw||'400', font: opts.font||'Inter, sans-serif',
    anchor: opts.anchor||'start', ls: opts.ls||'0', opacity: opts.opacity||1 };
}
function circle(cx,cy,r,fill,opts={}) {
  return { type:'circle', cx, cy, r, fill,
    opacity: opts.opacity||1, stroke: opts.stroke||'none', sw: opts.sw||1 };
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  return { type:'line', x1, y1, x2, y2, stroke,
    sw: opts.sw||1, opacity: opts.opacity||1 };
}

// ── Shared components ──────────────────────────────────────────────────
const W = 390, H = 844;
const serif = 'Georgia, "Times New Roman", serif';

function statusBar(elements) {
  elements.push(rect(0,0,W,44,P.bg));
  elements.push(text(16,28,'9:41',13,P.text,{fw:'600',font:'Inter, sans-serif'}));
  elements.push(text(340,28,'●●●',13,P.text,{anchor:'middle'}));
  elements.push(text(374,28,'⚡',13,P.text,{anchor:'middle'}));
}

function navBar(elements, active) {
  const tabs = [
    {id:'overview', label:'Overview', y:0},
    {id:'accounts', label:'Accounts', y:1},
    {id:'spending', label:'Spending', y:2},
    {id:'invest',   label:'Invest',   y:3},
    {id:'goals',    label:'Goals',    y:4},
  ];
  elements.push(rect(0,H-82,W,82,P.surface));
  elements.push(line(0,H-82,W,H-82,P.border));
  const icons = ['◈','▣','◎','◆','◉'];
  tabs.forEach((t,i) => {
    const x = 16 + i * 72;
    const isActive = t.id === active;
    elements.push(text(x+18, H-52, icons[i], 16,
      isActive ? P.green : P.textDim, {anchor:'middle'}));
    elements.push(text(x+18, H-32, t.label, 9,
      isActive ? P.green : P.textDim, {anchor:'middle', fw: isActive?'600':'400'}));
  });
}

function chip(x,y,label,fill,textColor,elements) {
  elements.push(rect(x,y,label.length*7+16,22,fill,{rx:11}));
  elements.push(text(x+8,y+15,label,10,textColor,{fw:'500'}));
}

// ── SCREEN 1 — Overview ────────────────────────────────────────────────
function screenOverview() {
  const els = [];
  statusBar(els);

  // Top header
  els.push(rect(0,44,W,56,P.bg));
  els.push(text(20,80,'WORTH',13,P.green,{fw:'700',ls:'3'}));
  // Avatar
  els.push(circle(359,72,18,P.card));
  els.push(text(359,77,'EL',9,P.text,{anchor:'middle',fw:'600'}));

  // ── Hero net worth card (bento hero) ────────────────────────────────
  els.push(rect(16,106,358,148,P.white,{rx:20,stroke:P.border,sw:1}));
  els.push(text(32,130,'Net Worth',11,P.textMid,{fw:'500'}));
  // Serif display headline — key Land-Book trend
  els.push(text(32,174,'$84,290',34,P.text,{fw:'700',font:serif}));
  els.push(text(32,196,'↑ $2,140 this month',12,P.green,{fw:'500'}));
  // Sparkline
  const spPoints = [0,8,4,14,10,18,12,22,16,28,20];
  for(let i=0;i<spPoints.length-1;i++){
    const x1=190+i*14, y1=200-spPoints[i];
    const x2=190+(i+1)*14, y2=200-spPoints[i+1];
    els.push(line(x1,y1,x2,y2,P.green,{sw:2}));
  }
  els.push(circle(338,172,4,P.green));
  // Date label
  els.push(text(190,222,'Apr 2026',10,P.textDim));

  // ── Bento row 1: two half cards ────────────────────────────────────
  // Assets card
  els.push(rect(16,264,168,100,P.greenLt,{rx:16}));
  els.push(text(28,285,'Assets',10,P.green,{fw:'500'}));
  els.push(text(28,318,'$127,580',20,P.text,{fw:'700',font:serif}));
  els.push(text(28,338,'Bank + Invest',10,P.textMid));
  chip(28,348,'↑ 3.2%',P.green,P.white,els);

  // Liabilities card
  els.push(rect(196,264,178,100,P.amberLt,{rx:16}));
  els.push(text(208,285,'Liabilities',10,P.amber,{fw:'500'}));
  els.push(text(208,318,'$43,290',20,P.text,{fw:'700',font:serif}));
  els.push(text(208,338,'Loans + Credit',10,P.textMid));
  chip(208,348,'↓ 0.8%',P.amber,P.white,els);

  // ── Monthly cashflow card ───────────────────────────────────────────
  els.push(rect(16,374,358,80,P.white,{rx:16,stroke:P.border,sw:1}));
  els.push(text(28,395,'Monthly cashflow',10,P.textMid,{fw:'500'}));
  els.push(text(28,420,'+ $1,840',18,P.green,{fw:'700',font:serif}));
  els.push(text(180,395,'Income',9,P.textDim));
  els.push(text(180,412,'$5,200',13,P.text,{fw:'600'}));
  els.push(text(270,395,'Expenses',9,P.textDim));
  els.push(text(270,412,'$3,360',13,P.text,{fw:'600'}));

  // ── Recent transactions mini list ──────────────────────────────────
  els.push(text(16,474,'Recent',12,P.text,{fw:'600'}));
  els.push(text(360,474,'See all →',11,P.green,{fw:'500',anchor:'end'}));

  const txns = [
    {icon:'☕', name:'Blank Street Coffee', cat:'Food', amt:'-$6.20', col:P.text},
    {icon:'🎵', name:'Spotify Premium',     cat:'Subscriptions', amt:'-$11.99', col:P.text},
    {icon:'💰', name:'Payroll deposit',     cat:'Income', amt:'+$2,600', col:P.green},
  ];
  txns.forEach((t,i) => {
    const y=492+i*52;
    els.push(rect(16,y,358,44,P.surface,{rx:12,stroke:P.border,sw:1}));
    els.push(circle(38,y+22,14,P.card));
    els.push(text(38,y+26,t.icon,12,P.text,{anchor:'middle'}));
    els.push(text(62,y+17,t.name,11,P.text,{fw:'500'}));
    els.push(text(62,y+32,t.cat,9,P.textDim));
    els.push(text(354,y+22,t.amt,12,t.col,{fw:'600',anchor:'end'}));
  });

  navBar(els,'overview');

  return { name:'Overview', svg:'', elements: els };
}

// ── SCREEN 2 — Accounts ────────────────────────────────────────────────
function screenAccounts() {
  const els = [];
  statusBar(els);

  els.push(rect(0,44,W,H-44,P.bg));
  els.push(text(20,80,'Accounts',20,P.text,{fw:'700',font:serif}));
  els.push(text(20,98,'All linked accounts',11,P.textMid));

  // Total across accounts
  els.push(rect(16,110,358,72,P.green,{rx:18}));
  els.push(text(28,135,'Total balance',10,P.greenLt,{fw:'500'}));
  els.push(text(28,162,'$127,580',28,P.white,{fw:'700',font:serif}));
  els.push(text(280,162,'↑ $840 today',10,P.greenLt,{anchor:'end',fw:'500'}));

  // Section: Cash accounts
  els.push(text(16,196,'Cash',11,P.textMid,{fw:'600'}));

  const cashAccounts = [
    {name:'Chase Checking',  sub:'····4291', val:'$3,842', icon:'🏦'},
    {name:'Marcus Savings',  sub:'····8830', val:'$18,200', icon:'💳'},
    {name:'Robinhood Cash',  sub:'····1122', val:'$940', icon:'💸'},
  ];
  cashAccounts.forEach((a,i) => {
    const y=208+i*64;
    els.push(rect(16,y,358,56,P.white,{rx:16,stroke:P.border,sw:1}));
    els.push(circle(40,y+28,18,P.card));
    els.push(text(40,y+33,a.icon,14,P.text,{anchor:'middle'}));
    els.push(text(66,y+21,a.name,12,P.text,{fw:'600'}));
    els.push(text(66,y+36,a.sub,10,P.textDim));
    els.push(text(354,y+28,a.val,14,P.text,{fw:'700',font:serif,anchor:'end'}));
    chip(306,y+36,'Synced',P.greenLt,P.green,els);
  });

  // Section: Investments
  els.push(text(16,410,'Investments',11,P.textMid,{fw:'600'}));

  const investAccounts = [
    {name:'Fidelity 401k',   sub:'Retirement', val:'$64,820', icon:'📈', change:'+$1,200'},
    {name:'Robinhood Brokerage', sub:'Individual', val:'$29,778', icon:'📊', change:'+$380'},
  ];
  investAccounts.forEach((a,i) => {
    const y=422+i*66;
    els.push(rect(16,y,358,58,P.white,{rx:16,stroke:P.border,sw:1}));
    els.push(circle(40,y+29,18,P.card));
    els.push(text(40,y+34,a.icon,14,P.text,{anchor:'middle'}));
    els.push(text(66,y+22,a.name,12,P.text,{fw:'600'}));
    els.push(text(66,y+37,a.sub,10,P.textDim));
    els.push(text(354,y+22,a.val,14,P.text,{fw:'700',font:serif,anchor:'end'}));
    els.push(text(354,y+37,a.change,10,P.green,{anchor:'end',fw:'500'}));
  });

  // Add account button
  els.push(rect(16,562,358,48,P.card,{rx:16,stroke:P.border,sw:1}));
  els.push(text(195,591,'+ Link new account',12,P.textMid,{anchor:'middle',fw:'500'}));

  navBar(els,'accounts');

  return { name:'Accounts', svg:'', elements: els };
}

// ── SCREEN 3 — Spending ────────────────────────────────────────────────
function screenSpending() {
  const els = [];
  statusBar(els);

  els.push(rect(0,44,W,H-44,P.bg));
  els.push(text(20,80,'Spending',20,P.text,{fw:'700',font:serif}));
  els.push(text(20,98,'April 2026',11,P.textMid));

  // Month toggle
  ['Mar','Apr','May'].forEach((m,i) => {
    const x=200+i*52;
    const active=m==='Apr';
    els.push(rect(x,56,44,26,active?P.green:P.card,{rx:13}));
    els.push(text(x+22,73,m,10,active?P.white:P.textMid,{anchor:'middle',fw:active?'600':'400'}));
  });

  // Total spent hero
  els.push(rect(16,110,358,88,P.white,{rx:18,stroke:P.border,sw:1}));
  els.push(text(28,132,'Total spent',10,P.textMid,{fw:'500'}));
  els.push(text(28,162,'$3,360',30,P.text,{fw:'700',font:serif}));
  els.push(text(28,180,'of $4,000 budget',11,P.textMid));
  // Progress bar
  els.push(rect(28,188,300,6,P.cardB,{rx:3}));
  els.push(rect(28,188,252,6,P.green,{rx:3}));  // 84%

  // Bento spending categories 2×2 grid ─────────────────────────────
  els.push(text(16,216,'By category',11,P.text,{fw:'600'}));

  const cats = [
    {label:'Food & Drink',  icon:'🍽', amt:'$820', pct:24, fill:P.amberLt, acc:P.amber},
    {label:'Transport',     icon:'🚗', amt:'$340', pct:10, fill:P.greenLt, acc:P.green},
    {label:'Shopping',      icon:'🛍', amt:'$680', pct:20, fill:'#EEF2FF', acc:'#6366F1'},
    {label:'Subscriptions', icon:'📱', amt:'$156', pct:5,  fill:'#FFF0F0', acc:P.red},
    {label:'Health',        icon:'🏥', amt:'$220', pct:7,  fill:P.greenLt, acc:P.green},
    {label:'Other',         icon:'◎',  amt:'$1,144', pct:34, fill:P.card, acc:P.textMid},
  ];
  cats.forEach((c,i) => {
    const col=i%2, row=Math.floor(i/2);
    const x=16+col*184, y=228+row*102;
    const w=row===2?170:174; // slightly adjust last row
    els.push(rect(x,y,174,92,c.fill,{rx:16}));
    els.push(circle(x+18,y+18,12,c.acc,{opacity:0.15}));
    els.push(text(x+18,y+22,c.icon,11,P.text,{anchor:'middle'}));
    els.push(text(x+12,y+44,c.label,10,P.text,{fw:'500'}));
    els.push(text(x+12,y+62,c.amt,16,P.text,{fw:'700',font:serif}));
    // mini progress
    els.push(rect(x+12,y+76,150,4,P.border,{rx:2}));
    els.push(rect(x+12,y+76,Math.round(c.pct*1.5),4,c.acc,{rx:2}));
    els.push(text(x+162,y+80,`${c.pct}%`,9,P.textDim,{anchor:'end'}));
  });

  // Largest expense insight
  els.push(rect(16,538,358,56,P.white,{rx:14,stroke:P.border,sw:1}));
  els.push(text(28,558,'Insight',9,P.green,{fw:'600',ls:'1'}));
  els.push(text(28,574,'Food spending is 12% above your 3-month avg.',11,P.text,{fw:'500'}));
  els.push(text(28,588,'Consider reviewing dining out habits.',10,P.textDim));

  navBar(els,'spending');

  return { name:'Spending', svg:'', elements: els };
}

// ── SCREEN 4 — Investments ─────────────────────────────────────────────
function screenInvest() {
  const els = [];
  statusBar(els);

  els.push(rect(0,44,W,H-44,P.bg));
  els.push(text(20,80,'Portfolio',20,P.text,{fw:'700',font:serif}));
  els.push(text(20,98,'Total invested value',11,P.textMid));

  // Hero value
  els.push(rect(16,108,358,80,P.white,{rx:18,stroke:P.border,sw:1}));
  els.push(text(28,132,'$94,598',28,P.text,{fw:'700',font:serif}));
  els.push(text(28,154,'↑ $1,580  (+1.7%)',12,P.green,{fw:'600'}));
  els.push(text(280,132,'Today',9,P.textDim,{anchor:'end'}));
  els.push(text(280,148,'+$380',13,P.green,{fw:'600',anchor:'end'}));

  // Donut / allocation visualization (concentric arcs via thick circles)
  const cx=195, cy=284, r=62;
  // Background ring
  els.push(circle(cx,cy,r,P.cardB));
  els.push(circle(cx,cy,r-20,P.bg));
  // Colored segments simulated with arcs (as rect overlays with clip approximation)
  // US Stocks wedge
  els.push(rect(cx-r,cy-r,r,r*2,P.green,{opacity:0.85}));
  // Bonds wedge
  els.push(rect(cx,cy-r,r*0.6,r,P.amber,{opacity:0.75}));
  // Intl wedge
  els.push(rect(cx,cy,r*0.6,r*0.65,'#6366F1',{opacity:0.7}));
  // Hole
  els.push(circle(cx,cy,r-22,P.bg));
  // Center text
  els.push(text(cx,cy-4,'94.6k',14,P.text,{anchor:'middle',fw:'700',font:serif}));
  els.push(text(cx,cy+12,'total',9,P.textDim,{anchor:'middle'}));

  // Legend
  const alloc = [
    {label:'US Stocks',    pct:'58%', fill:P.green},
    {label:'Int\'l Stocks', pct:'18%', fill:'#6366F1'},
    {label:'Bonds',        pct:'16%', fill:P.amber},
    {label:'Cash',         pct:'8%',  fill:P.textDim},
  ];
  alloc.forEach((a,i) => {
    const x=16+i*92;
    els.push(circle(x+8,350,5,a.fill));
    els.push(text(x+18,354,a.label,8,P.textMid));
    els.push(text(x+18,364,a.pct,10,P.text,{fw:'700'}));
  });

  // Holdings list
  els.push(text(16,388,'Top holdings',11,P.text,{fw:'600'}));

  const holdings = [
    {tick:'VTI',  name:'Total Stock Market ETF',  val:'$38,200', chg:'+2.1%', pos:true},
    {tick:'FXAIX',name:'Fidelity 500 Index',      val:'$26,800', chg:'+1.8%', pos:true},
    {tick:'VXUS', name:'Total Intl Stock ETF',    val:'$17,040', chg:'-0.3%', pos:false},
    {tick:'BND',  name:'Total Bond Market ETF',   val:'$12,558', chg:'+0.1%', pos:true},
  ];
  holdings.forEach((h,i) => {
    const y=400+i*58;
    els.push(rect(16,y,358,50,P.white,{rx:14,stroke:P.border,sw:1}));
    els.push(rect(16,y,50,50,h.pos?P.greenLt:P.redLt,{rx:14}));
    els.push(text(41,y+30,h.tick,10,h.pos?P.green:P.red,{anchor:'middle',fw:'700'}));
    els.push(text(76,y+22,h.name,11,P.text,{fw:'500'}));
    els.push(text(76,y+36,h.tick,9,P.textDim));
    els.push(text(354,y+20,h.val,12,P.text,{fw:'700',font:serif,anchor:'end'}));
    els.push(text(354,y+36,h.chg,10,h.pos?P.green:P.red,{anchor:'end',fw:'500'}));
  });

  navBar(els,'invest');

  return { name:'Investments', svg:'', elements: els };
}

// ── SCREEN 5 — Goals ──────────────────────────────────────────────────
function screenGoals() {
  const els = [];
  statusBar(els);

  els.push(rect(0,44,W,H-44,P.bg));
  els.push(text(20,80,'Goals',20,P.text,{fw:'700',font:serif}));
  els.push(text(20,98,'Your financial milestones',11,P.textMid));

  // Add goal button
  els.push(rect(310,58,64,28,P.green,{rx:14}));
  els.push(text(342,76,'+ New',10,P.white,{anchor:'middle',fw:'600'}));

  const goals = [
    {
      name:'Emergency Fund', icon:'🛡', target:'$15,000', current:'$9,200',
      pct:61, fill:P.green, bg:P.greenLt, deadline:'Jun 2026'
    },
    {
      name:'Vacation — Japan', icon:'✈', target:'$4,500', current:'$3,100',
      pct:69, fill:'#6366F1', bg:'#EEF2FF', deadline:'Aug 2026'
    },
    {
      name:'New MacBook', icon:'💻', target:'$2,400', current:'$800',
      pct:33, fill:P.amber, bg:P.amberLt, deadline:'Dec 2026'
    },
    {
      name:'House down payment', icon:'🏠', target:'$60,000', current:'$18,400',
      pct:31, fill:P.text, bg:P.card, deadline:'Dec 2028'
    },
  ];

  goals.forEach((g,i) => {
    const y=112+i*138;
    els.push(rect(16,y,358,128,P.white,{rx:20,stroke:P.border,sw:1}));
    // Icon bg
    els.push(circle(44,y+28,20,g.bg));
    els.push(text(44,y+34,g.icon,15,P.text,{anchor:'middle'}));
    // Name & deadline
    els.push(text(72,y+22,g.name,13,P.text,{fw:'600'}));
    els.push(text(72,y+38,`Target by ${g.deadline}`,10,P.textDim));
    // Amount
    els.push(text(354,y+22,g.target,12,P.text,{fw:'700',font:serif,anchor:'end'}));
    els.push(text(354,y+38,'target',9,P.textDim,{anchor:'end'}));
    // Progress bar
    els.push(rect(22,y+56,326,8,P.cardB,{rx:4}));
    els.push(rect(22,y+56,Math.round(326*g.pct/100),8,g.fill,{rx:4}));
    // Stats row
    els.push(text(22,y+80,'Saved',9,P.textDim));
    els.push(text(22,y+93,g.current,13,P.text,{fw:'700',font:serif}));
    els.push(text(180,y+80,'Remaining',9,P.textDim));
    const remaining = parseInt(g.target.replace(/[$,]/g,'')) - parseInt(g.current.replace(/[$,]/g,''));
    els.push(text(180,y+93,`$${remaining.toLocaleString()}`,13,P.text,{fw:'700',font:serif}));
    els.push(text(354,y+80,'Progress',9,P.textDim,{anchor:'end'}));
    els.push(text(354,y+93,`${g.pct}%`,13,g.fill,{fw:'700',anchor:'end'}));
  });

  navBar(els,'goals');

  return { name:'Goals', svg:'', elements: els };
}

// ── SCREEN 6 — Insights (editorial "money story") ─────────────────────
function screenInsights() {
  const els = [];
  statusBar(els);

  els.push(rect(0,44,W,H-44,P.bg));

  // Editorial header — key trend: story-driven copy (Saaspo research)
  els.push(rect(0,44,W,130,P.green));
  els.push(text(24,82,'Your money',26,P.white,{fw:'700',font:serif}));
  els.push(text(24,108,'story, April',26,P.white,{fw:'700',font:serif,opacity:0.85}));
  els.push(text(24,130,'2026.',26,P.white,{fw:'700',font:serif,opacity:0.65}));
  els.push(text(320,82,'◈',22,P.white,{opacity:0.4}));

  // Score card — bento card inspired by Land-Book bento grids
  els.push(rect(16,186,170,100,P.white,{rx:18,stroke:P.border,sw:1}));
  els.push(text(28,208,'Financial Health',9,P.textMid,{fw:'600',ls:'0.5'}));
  els.push(text(28,240,'82',34,P.green,{fw:'800',font:serif}));
  els.push(text(62,240,'/100',14,P.textDim,{fw:'400',font:serif}));
  els.push(text(28,258,'↑ 4 pts this month',9,P.green,{fw:'500'}));

  els.push(rect(198,186,176,100,P.amberLt,{rx:18}));
  els.push(text(210,208,'Savings rate',9,P.textMid,{fw:'600',ls:'0.5'}));
  els.push(text(210,240,'35%',30,P.text,{fw:'800',font:serif}));
  els.push(text(210,258,'of income saved',9,P.amber,{fw:'500'}));
  els.push(text(210,272,'↑ from 28% last mo.',9,P.textMid));

  // Insight cards — editorial text blocks
  const insights = [
    {
      tag:'📊 Pattern',
      head:'Coffee is your #1 impulse spend',
      body:'You made 22 coffee purchases totalling $138 this month — 18% more than March.',
      bg: P.white, bdr: P.border,
    },
    {
      tag:'🌱 Progress',
      head:'Emergency fund on track',
      body:'At your current pace you\'ll reach $15,000 by June — right on schedule.',
      bg: P.greenLt, bdr: 'transparent',
    },
    {
      tag:'⚡ Action',
      head:'You have $680 idle in checking',
      body:'Move it to high-yield savings to earn an extra ~$34/year at current rates.',
      bg: P.amberLt, bdr: 'transparent',
    },
  ];

  insights.forEach((ins,i) => {
    const y=298+i*140;
    els.push(rect(16,y,358,130,ins.bg,{rx:18,stroke:ins.bdr,sw:1}));
    chip(28,y+14,ins.tag,P.card,P.textMid,els);
    els.push(text(28,y+58,ins.head,13,P.text,{fw:'700',font:serif}));
    // Body text — wrap at 42 chars
    const words=ins.body.split(' ');
    let line1='', line2='';
    words.forEach(w=>{
      if((line1+' '+w).trim().length<44) line1=(line1+' '+w).trim();
      else line2=(line2+' '+w).trim();
    });
    els.push(text(28,y+76,line1,10,P.textMid));
    if(line2) els.push(text(28,y+90,line2,10,P.textMid));
    els.push(text(342,y+58,'→',16,P.textDim,{anchor:'middle'}));
  });

  navBar(els,'insights');

  return { name:'Insights', svg:'', elements: els };
}

// ── Assemble ──────────────────────────────────────────────────────────
const screens = [
  screenOverview(),
  screenAccounts(),
  screenSpending(),
  screenInvest(),
  screenGoals(),
  screenInsights(),
];

const totalElements = screens.reduce((s,sc) => s+sc.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    tagline: TAGLINE,
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'light',
    heartbeat: HEARTBEAT,
    elements: totalElements,
    palette: {
      bg: P.bg, surface: P.surface, text: P.text,
      accent: P.green, accent2: P.amber,
    },
    inspiration: 'Land-Book warm cream editorial system + bento grid trend (Apr 2026)',
  },
  screens,
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
