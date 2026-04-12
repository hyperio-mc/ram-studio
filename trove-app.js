#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────
// TROVE — AI-powered freelance finance OS
// Inspired by: Midday.ai on darkmodedesign.com — "Let agents run
//   your business" + agent-first financial automation trend;
//   Evervault's editorial customer story cards (godly.website);
//   minimal.gallery SaaS tab — warm off-white, precision typography
// Theme: LIGHT — warm cream #F9F7F3, ink text, electric blue accent
// ─────────────────────────────────────────────────────────────────

const fs   = require('fs');
const path = require('path');

const W = 390, H = 844;

// ── Palette ──────────────────────────────────────────────────────
const BG       = '#F9F7F3';   // warm cream
const SURFACE  = '#FFFFFF';
const TEXT     = '#1A1816';   // near-black ink
const MUTED    = '#7C7872';   // warm grey
const ACCENT   = '#2563EB';   // electric blue
const ACCENT2  = '#16A34A';   // growth green
const WARN     = '#DC2626';   // alert red
const BORDER   = '#E8E5DF';
const BLUE_BG  = '#EFF6FF';
const GREEN_BG = '#F0FDF4';
const AMBER    = '#D97706';
const AMBER_BG = '#FFFBEB';

// ── Primitives ────────────────────────────────────────────────────
const rect = (x,y,w,h,fill,radius=0,stroke,strokeW=1) => {
  const r = { type:'rect', x, y, w, h, fill, radius };
  if (stroke) { r.stroke=stroke; r.strokeWidth=strokeW; }
  return r;
};
const text = (x,y,w,h,content,size,color,weight=400,align='left') =>
  ({ type:'text', x, y, w, h, content, fontSize:size, color, fontWeight:weight, textAlign:align });
const line = (x1,y1,x2,y2,color=BORDER,w=1) =>
  ({ type:'line', x1, y1, x2, y2, stroke:color, strokeWidth:w });
const circle = (cx,cy,r,fill,stroke,strokeW=1) => {
  const o = { type:'ellipse', cx, cy, rx:r, ry:r, fill };
  if (stroke) { o.stroke=stroke; o.strokeWidth=strokeW; }
  return o;
};

const bg    = () => rect(0,0,W,H,BG);
const card  = (x,y,w,h,r=14) => rect(x,y,w,h,SURFACE,r,BORDER,1);

// ── Shared components ─────────────────────────────────────────────
function statusBar() {
  return [
    rect(0,0,W,44,BG),
    text(20,13,80,16,'9:41',13,TEXT,600,'left'),
    text(W-80,13,60,16,'●●● ▲',11,TEXT,400,'right'),
  ];
}

function bottomNav(active) {
  const items = [
    { label:'Home',     icon:'⌂', id:'home'     },
    { label:'Money',    icon:'◈', id:'money'    },
    { label:'Work',     icon:'◫', id:'work'     },
    { label:'Insights', icon:'◉', id:'insights' },
  ];
  const els = [
    rect(0,H-80,W,80,SURFACE),
    line(0,H-80,W,H-80,BORDER,1),
  ];
  items.forEach((it,i) => {
    const x = 8 + i*94;
    const isActive = it.id === active;
    if (isActive) els.push(rect(x+8,H-72,76,56,BLUE_BG,12));
    els.push(text(x+8,H-70,76,24,it.icon,20,isActive?ACCENT:MUTED,400,'center'));
    els.push(text(x+8,H-44,76,14,it.label,10,isActive?ACCENT:MUTED,isActive?600:400,'center'));
  });
  return els;
}

function agentPill(x,y,msg,color=ACCENT,bgColor=BLUE_BG) {
  const w = W - 2*x;
  return [
    rect(x,y,w,34,bgColor,17),
    circle(x+17,y+17,8,color),
    text(x+30,y+11,w-36,14,'⚡ '+msg,11,color,500,'left'),
  ];
}

// ── Screen 1 · Home Dashboard ─────────────────────────────────────
function screen1() {
  const els = [bg(),...statusBar()];

  // Greeting + name
  els.push(text(20,52,240,20,'Good morning, Alex',13,MUTED,400,'left'));
  els.push(text(20,72,W-40,34,'Your finances,',24,TEXT,700,'left'));
  els.push(text(20,104,W-40,34,'running on autopilot.',24,TEXT,700,'left'));

  // Agent status
  els.push(...agentPill(20,148,'Agent reconciled 14 transactions today'));

  // Hero metric card
  els.push(rect(20,194,W-40,130,ACCENT,18));
  els.push(text(36,210,200,16,'Net Revenue · April 2026',12,'rgba(255,255,255,0.75)',400,'left'));
  els.push(text(36,228,240,44,'$18,420',34,'#FFFFFF',700,'left'));
  els.push(text(36,274,220,16,'↑ 23% vs last month',12,'rgba(255,255,255,0.85)',500,'left'));
  els.push(rect(248,212,106,38,SURFACE,10));
  els.push(text(250,218,102,14,'⚡ AI Forecast',10,ACCENT,600,'center'));
  els.push(text(250,230,102,14,'$22K / month',11,TEXT,700,'center'));
  els.push(text(250,242,102,12,'on current pace',9,MUTED,400,'center'));

  // Stat duo
  els.push(card(20,338,170,80,12));
  els.push(text(32,350,146,14,'Outstanding',11,MUTED,400,'left'));
  els.push(text(32,366,146,26,'$6,200',20,WARN,700,'left'));
  els.push(rect(32,394,60,20,WARN+'1A',10));
  els.push(text(34,397,56,14,'2 invoices',9,WARN,600,'center'));

  els.push(card(200,338,170,80,12));
  els.push(text(212,350,146,14,'Paid · Apr',11,MUTED,400,'left'));
  els.push(text(212,366,146,26,'$12,220',20,ACCENT2,700,'left'));
  els.push(rect(212,394,60,20,GREEN_BG,10));
  els.push(text(214,397,56,14,'8 payments',9,ACCENT2,600,'center'));

  // Recent activity
  els.push(text(20,434,200,18,'Recent Activity',14,TEXT,700,'left'));
  els.push(text(240,434,110,18,'See all →',12,ACCENT,500,'right'));

  // Tx rows
  els.push(...txRow(20,462,'Notion HQ','Design retainer','+$4,500',ACCENT2,'N','#6366F1'));
  els.push(line(20,508,W-20,508,BORDER,1));
  els.push(...txRow(20,516,'AWS','Infrastructure','−$340',WARN,'A','#FF9900'));
  els.push(line(20,562,W-20,562,BORDER,1));
  els.push(...txRow(20,570,'Stripe payout','Freelance — Acme','+$7,200',ACCENT2,'S','#635BFF'));
  els.push(line(20,616,W-20,616,BORDER,1));
  els.push(...txRow(20,624,'Adobe CC','Subscription','−$55',WARN,'Ad','#FF0000'));

  els.push(...bottomNav('home'));
  return els;
}

function txRow(x,y,title,sub,amount,amtColor,icon,iconBg) {
  return [
    rect(x,y+6,36,36,iconBg,10),
    text(x,y+12,36,24,icon,12,'#fff',700,'center'),
    text(x+44,y+6,180,18,title,13,TEXT,600,'left'),
    text(x+44,y+24,180,14,sub,11,MUTED,400,'left'),
    text(x+44+180,y+10,80,20,amount,13,amtColor,700,'right'),
  ];
}

// ── Screen 2 · Money / Transactions ───────────────────────────────
function screen2() {
  const els = [bg(),...statusBar()];

  els.push(text(20,52,240,28,'Transactions',22,TEXT,700,'left'));
  els.push(rect(W-64,56,44,26,BLUE_BG,8));
  els.push(text(W-62,61,40,16,'Filter',10,ACCENT,600,'center'));

  // Agent insight
  els.push(rect(20,88,W-40,52,GREEN_BG,12,ACCENT2,1));
  els.push(text(36,98,W-56,16,'⚡ Agent categorized 14 new transactions',12,ACCENT2,600,'left'));
  els.push(text(36,114,W-56,14,'3 flagged for review · Tap to resolve',11,'#166534',400,'left'));

  // Month summary
  els.push(text(20,156,150,16,'April 2026',13,TEXT,600,'left'));
  els.push(text(20,172,150,14,'+$18,420',12,ACCENT2,600,'left'));
  els.push(text(120,172,100,14,'−$2,180',12,WARN,600,'left'));
  els.push(line(20,196,W-20,196,BORDER,1));

  // Filter chips
  els.push(...chips(20,206,['All','Income','Expenses','⚑ Flagged']));

  // Transaction list
  els.push(...txFullRow(20,256,'Notion HQ','Apr 3','Design retainer','+$4,500',ACCENT2,'N','#6366F1','Recurring'));
  els.push(line(20,314,W-20,314,BORDER,1));
  els.push(...txFullRow(20,322,'Stripe','Apr 2','Client — Acme Corp','+$7,200',ACCENT2,'S','#635BFF','⚑ Review'));
  els.push(line(20,380,W-20,380,BORDER,1));
  els.push(...txFullRow(20,388,'AWS','Apr 2','Infrastructure','−$340',WARN,'A','#FF9900','Infra'));
  els.push(line(20,446,W-20,446,BORDER,1));
  els.push(...txFullRow(20,454,'Figma','Apr 1','Annual subscription','−$144',WARN,'F','#F24E1E','Tools'));
  els.push(line(20,512,W-20,512,BORDER,1));
  els.push(...txFullRow(20,520,'Linear','Apr 1','Pro plan','−$96',WARN,'L','#5E6AD2','Tools'));
  els.push(line(20,578,W-20,578,BORDER,1));
  els.push(...txFullRow(20,586,'Adobe','Mar 31','CC subscription','−$55',WARN,'Ad','#FF0000','Tools'));

  els.push(...bottomNav('money'));
  return els;
}

function chips(x,y,labels) {
  const els = [];
  let cx = x;
  labels.forEach((l,i) => {
    const w = l.length*6.5+22;
    const active = i===0;
    els.push(rect(cx,y,w,28,active?ACCENT:SURFACE,14,active?ACCENT:BORDER,1));
    els.push(text(cx,y+7,w,14,l,11,active?'#fff':MUTED,active?600:400,'center'));
    cx += w+8;
  });
  return els;
}

function txFullRow(x,y,title,date,sub,amount,amtColor,icon,iconBg,tag) {
  const isFlag = tag==='⚑ Review';
  const tw = tag.length*6+16;
  return [
    rect(x,y+4,36,36,iconBg,10),
    text(x,y+10,36,24,icon,12,'#fff',700,'center'),
    text(x+44,y+4,160,17,title,13,TEXT,600,'left'),
    text(x+44,y+21,200,13,sub,10,MUTED,400,'left'),
    text(x+240,y+4,W-x-244,16,amount,13,amtColor,700,'right'),
    text(x+240,y+22,W-x-244,12,date,10,MUTED,400,'right'),
    rect(x+44,y+36,tw,18,isFlag?'#FEF2F2':BLUE_BG,9),
    text(x+48,y+39,tw-8,12,tag,9,isFlag?WARN:ACCENT,600,'left'),
  ];
}

// ── Screen 3 · Projects / Work ─────────────────────────────────────
function screen3() {
  const els = [bg(),...statusBar()];

  els.push(text(20,52,240,28,'Active Work',22,TEXT,700,'left'));
  els.push(rect(W-52,56,34,28,ACCENT,10));
  els.push(text(W-52,62,34,18,'+',18,'#fff',400,'center'));

  // Agent pill
  els.push(...agentPill(20,92,'3 projects have unbilled hours — tap to invoice',AMBER,AMBER_BG));

  // Project cards
  els.push(...projectCard(20,138,'Notion HQ','Design System v3','#6366F1',72,'$180/hr','Active',12400,20000));
  els.push(...projectCard(20,274,'Acme Corp','Brand Identity','#0EA5E9',45,'$150/hr','Active',6750,10000));
  els.push(...projectCard(20,410,'Bloom Studio','Web Redesign','#F59E0B',8,'$160/hr','Starting',1280,15000));

  // Time tracker
  els.push(card(20,548,W-40,106,14));
  els.push(text(34,562,200,16,'Today\'s Time',13,TEXT,700,'left'));
  els.push(text(34,578,150,26,'4h 32m',20,TEXT,700,'left'));
  els.push(rect(34,606,W-68,10,BORDER,5));
  els.push(rect(34,606,Math.round((W-68)*(4.53/8)),10,ACCENT,5));
  els.push(text(34,620,180,14,'57% of 8hr day',11,MUTED,400,'left'));
  els.push(rect(W-104,564,80,34,GREEN_BG,10));
  els.push(text(W-102,570,76,24,'▶  Log',13,ACCENT2,600,'center'));
  els.push(text(W-104,640,80,14,'Billing now',10,ACCENT2,500,'right'));

  els.push(...bottomNav('work'));
  return els;
}

function projectCard(x,y,client,name,color,hours,rate,status,earned,budget) {
  const pct = Math.round(earned/budget*100);
  const isActive = status==='Active';
  const barW = W-2*x-36;
  return [
    card(x,y,W-2*x,122,14),
    rect(x,y,6,122,color,14),
    text(x+18,y+10,200,14,client,11,MUTED,400,'left'),
    text(x+18,y+26,220,20,name,15,TEXT,700,'left'),
    rect(W-x-92,y+12,82,24,isActive?GREEN_BG:AMBER_BG,10),
    text(W-x-90,y+16,78,16,isActive?'● Active':'Starting',10,isActive?ACCENT2:AMBER,600,'center'),
    text(x+18,y+56,120,14,`${hours} hrs logged`,11,MUTED,400,'left'),
    text(x+18,y+70,120,14,rate,11,ACCENT,500,'left'),
    text(W-x-120,y+56,110,14,`$${earned.toLocaleString()} billed`,11,ACCENT2,600,'right'),
    rect(x+18,y+90,barW,8,BORDER,4),
    rect(x+18,y+90,Math.round(barW*(pct/100)),8,color,4),
    text(x+18,y+102,200,12,`${pct}% of $${(budget/1000).toFixed(0)}K budget`,10,MUTED,400,'left'),
  ];
}

// ── Screen 4 · Invoice ────────────────────────────────────────────
function screen4() {
  const els = [bg(),...statusBar()];

  els.push(text(20,52,200,24,'← New Invoice',16,TEXT,600,'left'));
  els.push(rect(W-76,52,56,26,ACCENT,8));
  els.push(text(W-74,57,52,16,'Send',12,'#fff',600,'center'));

  // Agent banner
  els.push(rect(20,86,W-40,48,BLUE_BG,12));
  els.push(circle(36,110,10,ACCENT));
  els.push(text(52,94,W-72,14,'⚡ Agent drafted from Notion HQ project data',11,ACCENT,600,'left'));
  els.push(text(52,110,W-72,14,'Review details before sending to client',11,'#1D4ED8',400,'left'));

  // Invoice card
  els.push(card(20,144,W-40,486,14));

  // Header
  els.push(text(34,160,180,14,'INVOICE #2026-031',10,MUTED,700,'left'));
  els.push(text(34,176,200,22,'Notion HQ',17,TEXT,700,'left'));
  els.push(line(34,208,W-34,208,BORDER,1));

  // From / To
  els.push(text(34,220,120,12,'From',10,MUTED,400,'left'));
  els.push(text(34,234,170,16,'Alex Chen',12,TEXT,600,'left'));
  els.push(text(34,250,170,13,'hello@alexchen.co',10,MUTED,400,'left'));
  els.push(text(34,264,170,13,'San Francisco, CA',10,MUTED,400,'left'));

  els.push(text(230,220,120,12,'To',10,MUTED,400,'left'));
  els.push(text(230,234,140,16,'Notion Design',12,TEXT,600,'left'));
  els.push(text(230,250,140,13,'billing@notion.so',10,MUTED,400,'left'));
  els.push(text(230,264,140,13,'New York, NY',10,MUTED,400,'left'));

  els.push(line(34,288,W-34,288,BORDER,1));

  // Dates
  els.push(text(34,300,100,12,'Issue date',10,MUTED,400,'left'));
  els.push(text(34,314,100,16,'Apr 3, 2026',12,TEXT,600,'left'));
  els.push(text(230,300,100,12,'Due date',10,MUTED,400,'left'));
  els.push(text(230,314,100,16,'Apr 17, 2026',12,TEXT,600,'left'));

  els.push(line(34,340,W-34,340,BORDER,1));

  // Line items
  els.push(text(34,352,200,13,'SERVICES',9,MUTED,700,'left'));
  els.push(...lineItem(34,370,'Design System Components','32 hrs × $180',5760));
  els.push(...lineItem(34,402,'Review & Iteration','8 hrs × $180',1440));
  els.push(...lineItem(34,434,'Documentation','4 hrs × $180',720));

  els.push(line(34,470,W-34,470,BORDER,1));

  els.push(text(34,482,160,14,'Subtotal',11,MUTED,400,'left'));
  els.push(text(200,482,W-234,16,'$7,920',12,TEXT,600,'right'));
  els.push(text(34,500,160,14,'Tax (8.5%)',11,MUTED,400,'left'));
  els.push(text(200,500,W-234,14,'$673',11,MUTED,400,'right'));

  els.push(line(34,520,W-34,520,BORDER,1));
  els.push(text(34,532,100,22,'Total',16,TEXT,700,'left'));
  els.push(text(160,526,W-194,26,'$8,593',21,ACCENT,700,'right'));

  els.push(text(34,568,W-68,14,'ACH · USD · Net 14 · Agent auto-reconciles on receipt',10,MUTED,400,'center'));

  els.push(...bottomNav('work'));
  return els;
}

function lineItem(x,y,desc,qty,amt) {
  return [
    text(x,y,220,16,desc,12,TEXT,500,'left'),
    text(x,y+16,220,13,qty,10,MUTED,400,'left'),
    text(220,y,W-254,16,`$${amt.toLocaleString()}`,12,TEXT,600,'right'),
  ];
}

// ── Screen 5 · Insights ────────────────────────────────────────────
function screen5() {
  const els = [bg(),...statusBar()];

  els.push(text(20,52,200,28,'Insights',22,TEXT,700,'left'));
  els.push(rect(200,58,110,22,GREEN_BG,8));
  els.push(text(202,62,106,14,'⚡ AI-powered',10,ACCENT2,600,'center'));

  // Health score card
  els.push(card(20,88,W-40,106,16));
  els.push(text(34,102,200,16,'Financial Health Score',13,TEXT,700,'left'));
  els.push(text(W-100,102,76,16,'▲ +4 pts',12,ACCENT2,500,'right'));
  els.push(rect(34,124,W-68,20,BORDER,10));
  els.push(rect(34,124,Math.round((W-68)*0.78),20,ACCENT2,10));
  els.push(circle(34+Math.round((W-68)*0.78),134,8,'#fff',ACCENT2,2));
  els.push(text(34,150,W-68,14,'78 / 100 — Healthy · Agent: invoice faster to improve',10,MUTED,400,'center'));
  els.push(text(34,164,W-68,16,'Average 8 days to send — target is 2',11,AMBER,500,'center'));

  // Revenue trend chart
  els.push(card(20,206,W-40,166,16));
  els.push(text(34,220,200,16,'Revenue Trend',13,TEXT,700,'left'));
  els.push(text(34,236,100,14,'6 months',11,MUTED,400,'left'));
  els.push(text(W-100,220,76,16,'+23% MoM',12,ACCENT2,600,'right'));
  els.push(...barChart(34,256,W-68,106,[11200,9800,14400,12600,16800,18420]));
  els.push(text(34,358,W-68,10,'Oct    Nov    Dec    Jan    Feb    Mar',9,MUTED,400,'center'));

  // Mini metrics 2×2
  els.push(...miniMetric(20,384,165,78,'Avg invoice size','$5,840','+12%',ACCENT2));
  els.push(...miniMetric(205,384,165,78,'Days to pay','11.2d','-3 days ✓',ACCENT2));
  els.push(...miniMetric(20,472,165,78,'Utilization rate','82%','vs 75% goal',ACCENT));
  els.push(...miniMetric(205,472,165,78,'Expense ratio','12%','Low · healthy',ACCENT2));

  // Forecast
  els.push(card(20,562,W-40,80,14));
  els.push(rect(20,562,6,80,ACCENT,14));
  els.push(text(34,574,200,16,'April Forecast',13,TEXT,700,'left'));
  els.push(text(34,594,200,14,'On track for your best month',12,MUTED,400,'left'));
  els.push(text(W-130,566,106,34,'$22,400',26,ACCENT,700,'right'));
  els.push(text(W-130,600,106,14,'projected',10,MUTED,400,'right'));

  els.push(...bottomNav('insights'));
  return els;
}

function barChart(x,y,w,h,vals) {
  const max = Math.max(...vals);
  const count = vals.length;
  const gap = 6;
  const bw = Math.floor((w - gap*(count-1)) / count);
  const els = [];
  vals.forEach((v,i) => {
    const bh = Math.round((v/max)*(h-20));
    const bx = x + i*(bw+gap);
    const by = y + (h-20) - bh;
    const isLast = i===count-1;
    els.push(rect(bx,by,bw,bh,isLast?ACCENT:BLUE_BG,4));
    if (isLast) {
      els.push(text(bx,by-16,bw,14,'$18.4K',9,ACCENT,600,'center'));
    }
  });
  return els;
}

function miniMetric(x,y,w,h,label,value,sub,color) {
  return [
    card(x,y,w,h,12),
    text(x+12,y+10,w-24,13,label,10,MUTED,400,'left'),
    text(x+12,y+24,w-24,24,value,18,TEXT,700,'left'),
    text(x+12,y+50,w-24,14,sub,10,color,500,'left'),
  ];
}

// ── Assemble .pen ─────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name:    'Trove — Freelance Finance OS',
  width:   W,
  height:  H,
  screens: [
    { id:'home',     name:'01 · Dashboard',    elements: screen1() },
    { id:'money',    name:'02 · Transactions', elements: screen2() },
    { id:'work',     name:'03 · Projects',     elements: screen3() },
    { id:'invoice',  name:'04 · Invoice',      elements: screen4() },
    { id:'insights', name:'05 · Insights',     elements: screen5() },
  ],
};

const out = path.join(__dirname, 'trove.pen');
fs.writeFileSync(out, JSON.stringify(pen, null, 2));
console.log(`✓  trove.pen  ${Math.round(fs.statSync(out).size/1024)}KB`);
pen.screens.forEach(s => console.log(`   ${s.name}: ${s.elements.length} els`));
