// MINT — Freelance Finance, editorial-magazine aesthetic
// Heartbeat #7 | LIGHT theme
// Inspired by: QP/PW Magazine editorial layouts on siteinspire.com — type as visual, numbers as heroes
// Palette: warm parchment/cream, deep forest green accent, warm gold highlights

const fs = require('fs');
const path = require('path');

const SLUG = 'mint';
const W = 390, H = 844;

// Palette
const BG      = '#F5F0E8';  // warm parchment
const SURFACE = '#FEFCF7';  // cream white
const SURF2   = '#EDE8DE';  // deeper parchment for contrast zones
const TEXT     = '#1C1A16';  // warm near-black
const TEXT2    = '#5A5448';  // warm medium
const TEXT3    = '#9A9080';  // warm muted
const ACCENT   = '#2A4D2A';  // deep forest green
const ACCENT_L = '#E3EEE3';  // green tint
const GOLD     = '#C8973C';  // warm gold
const GOLD_L   = '#FAF0DC';  // gold tint
const BORDER   = '#DDD5C5';  // warm divider
const RED      = '#C0392B';  // expense red
const RED_L    = '#FDECEA';

function rect(x,y,w,h,fill,opts={}) {
  return { type:'rect', x, y, width:w, height:h, fill,
    stroke:opts.stroke||'none', strokeWidth:opts.sw||0,
    rx:opts.rx||0, ry:opts.ry||0, opacity:opts.opacity||1 };
}
function text(x,y,content,size,fill,opts={}) {
  return { type:'text', x, y, content, fontSize:size, fill,
    fontWeight:opts.weight||400, textAnchor:opts.anchor||'start',
    fontFamily:opts.font||'Inter, -apple-system, sans-serif',
    letterSpacing:opts.ls||0, opacity:opts.opacity||1 };
}
function line(x1,y1,x2,y2,stroke,sw=1,opts={}) {
  return { type:'line', x1,y1,x2,y2, stroke, strokeWidth:sw, opacity:opts.opacity||1 };
}
function circle(cx,cy,r,fill,opts={}) {
  return { type:'circle', cx,cy,r, fill, stroke:opts.stroke||'none',
    strokeWidth:opts.sw||0, opacity:opts.opacity||1 };
}

// ── STATUS BAR ─────────────────────────────────────────────────────────────────
function statusBar(els) {
  els.push(rect(0,0,W,44,SURFACE));
  els.push(text(16,28,'9:41',13,TEXT,{weight:600}));
  els.push(text(W-80,28,'●●● ▲ 🔋',11,TEXT,{anchor:'start'}));
}

// ── NAV BAR ──────────────────────────────────────────────────────────────────
function navBar(els, active='overview') {
  const tabs = [
    { id:'overview', icon:'◉', label:'Home' },
    { id:'invoices', icon:'◈', label:'Invoices' },
    { id:'cashflow', icon:'◎', label:'Cash' },
    { id:'clients', icon:'◍', label:'Clients' },
    { id:'profile', icon:'◌', label:'Me' },
  ];
  const y = H - 76;
  els.push(rect(0,y,W,76,SURFACE));
  els.push(line(0,y,W,y,BORDER,1));
  tabs.forEach((t,i) => {
    const x = (W/5)*i + W/10;
    const isActive = t.id === active;
    els.push(text(x,y+22,t.icon,18,isActive?ACCENT:TEXT3,{anchor:'middle',weight:isActive?700:400}));
    els.push(text(x,y+40,t.label,9,isActive?ACCENT:TEXT3,{anchor:'middle',weight:isActive?700:400}));
    if (isActive) els.push(rect(x-18,y-2,36,3,ACCENT,{rx:2}));
  });
}

// ══════════════════════════════════════════════════════════════
// SCREEN 1 — OVERVIEW (editorial hero: giant revenue number)
// ══════════════════════════════════════════════════════════════
function screen1() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  statusBar(els);

  // Masthead bar (thin editorial stripe)
  els.push(rect(0,44,W,32,ACCENT));
  els.push(text(W/2,64,'MINT  ·  FREELANCE FINANCE',9,'#FFFFFF',{anchor:'middle',weight:700,ls:3}));

  // Month label + greeting
  els.push(text(20,102,'APRIL 2026',10,TEXT3,{weight:700,ls:2}));
  els.push(text(20,120,'Good morning, Rakis.',18,TEXT,{weight:300}));

  // EDITORIAL HERO — massive revenue number
  // Label above
  els.push(text(20,168,'MONTHLY REVENUE',9,TEXT3,{weight:700,ls:2}));
  els.push(line(20,174,W-20,174,BORDER,1));
  // Giant number — the typographic hero
  els.push(text(16,256,'$14,820',88,ACCENT,{weight:700,ls:-4,font:'Inter, sans-serif'}));
  // Variance badge inline
  els.push(rect(22,268,72,22,ACCENT_L,{rx:4}));
  els.push(text(58,283,'↑ 18.4%',11,ACCENT,{anchor:'middle',weight:700}));
  // vs last month footnote
  els.push(text(104,283,'vs March',11,TEXT3,{weight:400}));

  // Thin divider line
  els.push(line(20,302,W-20,302,BORDER,1));

  // Three editorial metric columns
  const metrics = [
    { label:'INVOICED', val:'$18,200', sub:'4 sent' },
    { label:'COLLECTED', val:'$14,820', sub:'2 pending' },
    { label:'EXPENSES', val:'-$2,140', sub:'12 items' },
  ];
  metrics.forEach((m,i) => {
    const x = 20 + i*(W-40)/3;
    if (i>0) els.push(line(x-2,310,x-2,370,BORDER,1));
    els.push(text(x+4,318,m.label,8,TEXT3,{weight:700,ls:1.5}));
    const isRed = m.val.startsWith('-');
    els.push(text(x+4,342,m.val,17,isRed?RED:TEXT,{weight:700}));
    els.push(text(x+4,357,m.sub,10,TEXT3,{}));
  });

  els.push(line(20,374,W-20,374,BORDER,1));

  // Cash position editorial callout
  els.push(text(20,396,'CASH POSITION',9,TEXT3,{weight:700,ls:2}));
  els.push(rect(20,404,W-40,72,SURFACE,{rx:10,stroke:BORDER,sw:1}));
  // Bar
  els.push(rect(32,428,254,8,ACCENT_L,{rx:4}));
  els.push(rect(32,428,192,8,ACCENT,{rx:4}));  // 75% filled
  els.push(text(32,422,'Business account',11,TEXT2,{weight:600}));
  els.push(text(W-32,422,'$12,450',11,TEXT,{weight:700,anchor:'end'}));
  els.push(text(32,452,'$4,200 available after upcoming bills',10,TEXT3,{}));
  els.push(text(W-32,452,'75%',10,TEXT3,{anchor:'end'}));

  // Upcoming due editorial strip
  els.push(text(20,496,'NEXT DUE',9,TEXT3,{weight:700,ls:2}));
  const dues = [
    { name:'Hyper63 — Sprint Invoice', amount:'$3,800', date:'Apr 12' },
    { name:'ElevenLabs — Copy Retainer', amount:'$1,200', date:'Apr 18' },
  ];
  dues.forEach((d,i) => {
    const y = 510 + i*52;
    els.push(rect(20,y,W-40,44,SURFACE,{rx:8,stroke:BORDER,sw:1}));
    // Gold left bar
    els.push(rect(20,y,4,44,GOLD,{rx:2}));
    els.push(text(32,y+16,d.name,12,TEXT,{weight:600}));
    els.push(text(32,y+32,'Due '+d.date,10,TEXT3,{}));
    els.push(text(W-28,y+27,d.amount,14,TEXT,{weight:700,anchor:'end'}));
  });

  // Quick actions row
  els.push(text(20,630,'QUICK ACTIONS',9,TEXT3,{weight:700,ls:2}));
  const actions = [
    { label:'+ Invoice', icon:'◈' },
    { label:'Log Exp', icon:'◧' },
    { label:'Time Log', icon:'◷' },
    { label:'Report', icon:'◉' },
  ];
  actions.forEach((a,i) => {
    const x = 20 + i*84;
    els.push(rect(x,642,78,60,SURFACE,{rx:10,stroke:BORDER,sw:1}));
    els.push(text(x+39,668,a.icon,22,ACCENT,{anchor:'middle'}));
    els.push(text(x+39,685,a.label,10,TEXT2,{anchor:'middle',weight:600}));
  });

  navBar(els,'overview');
  return { id:'screen-1', name:'Overview', width:W, height:H, elements:els };
}

// ══════════════════════════════════════════════════════════════
// SCREEN 2 — INVOICES (editorial table, typographic emphasis)
// ══════════════════════════════════════════════════════════════
function screen2() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  statusBar(els);

  els.push(rect(0,44,W,32,ACCENT));
  els.push(text(W/2,64,'MINT  ·  INVOICES',9,'#FFFFFF',{anchor:'middle',weight:700,ls:3}));

  // Header
  els.push(text(20,104,'Invoices',28,TEXT,{weight:700}));
  els.push(text(20,124,'April 2026',13,TEXT3,{}));

  // Summary strip (editorial numbers)
  els.push(rect(20,136,W-40,62,ACCENT,{rx:10}));
  const sums = [
    {label:'TOTAL',val:'$18,200'},
    {label:'PAID',val:'$14,820'},
    {label:'PENDING',val:'$3,380'},
  ];
  sums.forEach((s,i) => {
    const x = 36 + i*110;
    els.push(text(x,154,s.label,7,'rgba(255,255,255,0.6)',{weight:700,ls:1.5}));
    els.push(text(x,174,s.val,16,'#FFFFFF',{weight:700}));
    if (i<2) els.push(line(x+96,148,x+96,184,'rgba(255,255,255,0.2)',1));
  });

  // Column headers
  const colY = 218;
  els.push(line(20,colY-8,W-20,colY-8,BORDER,1));
  els.push(text(20,colY,'CLIENT',8,TEXT3,{weight:700,ls:1.5}));
  els.push(text(200,colY,'DATE',8,TEXT3,{weight:700,ls:1.5}));
  els.push(text(280,colY,'AMOUNT',8,TEXT3,{weight:700,ls:1.5}));
  els.push(text(W-20,colY,'STATUS',8,TEXT3,{weight:700,ls:1.5,anchor:'end'}));
  els.push(line(20,colY+8,W-20,colY+8,BORDER,1));

  const invoices = [
    { client:'Hyper63', num:'INV-2026-012', date:'Apr 2', amount:'$3,800', status:'Pending', statusC:GOLD },
    { client:'ElevenLabs', num:'INV-2026-011', date:'Mar 28', amount:'$1,200', status:'Paid', statusC:ACCENT },
    { client:'Clay Design', num:'INV-2026-010', date:'Mar 22', amount:'$5,400', status:'Paid', statusC:ACCENT },
    { client:'RunwayML', num:'INV-2026-009', date:'Mar 14', amount:'$2,600', status:'Paid', statusC:ACCENT },
    { client:'Sanity.io', num:'INV-2026-008', date:'Mar 7', amount:'$3,820', status:'Overdue', statusC:RED },
    { client:'Stripe', num:'INV-2026-007', date:'Feb 28', amount:'$2,400', status:'Paid', statusC:ACCENT },
  ];

  invoices.forEach((inv,i) => {
    const y = 240 + i*56;
    if (i%2===0) els.push(rect(20,y-6,W-40,52,SURFACE,{rx:8}));
    els.push(text(24,y+12,inv.client,13,TEXT,{weight:700}));
    els.push(text(24,y+28,inv.num,10,TEXT3,{}));
    els.push(text(200,y+14,inv.date,11,TEXT2,{}));
    els.push(text(280,y+14,inv.amount,14,TEXT,{weight:700}));
    // Status pill
    const statusBg = inv.status==='Paid'?ACCENT_L:inv.status==='Overdue'?RED_L:GOLD_L;
    els.push(rect(W-20-60,y+4,60,20,statusBg,{rx:10}));
    els.push(text(W-20-30,y+18,inv.status,9,inv.statusC,{anchor:'middle',weight:700}));
  });

  // Footer action
  els.push(rect(20,H-100,W-40,40,ACCENT,{rx:10}));
  els.push(text(W/2,H-75,'+ Create New Invoice',13,'#FFFFFF',{anchor:'middle',weight:600}));

  navBar(els,'invoices');
  return { id:'screen-2', name:'Invoices', width:W, height:H, elements:els };
}

// ══════════════════════════════════════════════════════════════
// SCREEN 3 — CASH FLOW (editorial chart + annotations)
// ══════════════════════════════════════════════════════════════
function screen3() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  statusBar(els);

  els.push(rect(0,44,W,32,ACCENT));
  els.push(text(W/2,64,'MINT  ·  CASH FLOW',9,'#FFFFFF',{anchor:'middle',weight:700,ls:3}));

  els.push(text(20,104,'Cash Flow',28,TEXT,{weight:700}));
  els.push(text(20,124,'6-month trend',13,TEXT3,{}));

  // Month tabs
  const months = ['NOV','DEC','JAN','FEB','MAR','APR'];
  months.forEach((m,i) => {
    const x = 20 + i*56;
    const active = i===5;
    if (active) els.push(rect(x-4,132,48,22,ACCENT,{rx:6}));
    els.push(text(x+20,147,m,9,active?'#FFFFFF':TEXT3,{anchor:'middle',weight:active?700:400}));
  });

  // Chart area
  const chartY = 175, chartH = 180, chartW = W-40;
  els.push(rect(20,chartY,chartW,chartH,SURFACE,{rx:12,stroke:BORDER,sw:1}));

  // Grid lines
  for(let i=0;i<=4;i++) {
    const y = chartY+20+i*(chartH-40)/4;
    els.push(line(36,y,W-36,y,BORDER,1,{opacity:0.5}));
    const val = ['$20k','$15k','$10k','$5k','$0'][i];
    els.push(text(32,y+3,val,8,TEXT3,{anchor:'end'}));
  }

  // Bar chart — income bars (green) + expense bars (red/warm) side by side
  const data = [
    {in:9200,out:3100},{in:11400,out:2800},{in:8800,out:3400},
    {in:12600,out:2200},{in:13200,out:2800},{in:14820,out:2140}
  ];
  const maxVal = 20000;
  const barAreaW = (chartW-52)/6;
  data.forEach((d,i) => {
    const bx = 40 + i*barAreaW + 4;
    const inH = (d.in/maxVal)*(chartH-50);
    const outH = (d.out/maxVal)*(chartH-50);
    const baseY = chartY+chartH-24;
    // Income bar (green)
    els.push(rect(bx,baseY-inH,barAreaW/2-3,inH,ACCENT,{rx:3}));
    // Expense bar (red-warm)
    els.push(rect(bx+barAreaW/2,baseY-outH,barAreaW/2-3,outH,GOLD,{rx:3}));
    els.push(text(bx+barAreaW/2-2,baseY+12,months[i],7,TEXT3,{anchor:'middle'}));
  });

  // Legend
  els.push(rect(W-120,chartY+12,12,10,ACCENT,{rx:2}));
  els.push(text(W-104,chartY+20,'Income',9,TEXT2,{}));
  els.push(rect(W-120,chartY+26,12,10,GOLD,{rx:2}));
  els.push(text(W-104,chartY+34,'Expenses',9,TEXT2,{}));

  // Editorial annotation — pull-quote style
  els.push(rect(20,368,W-40,54,GOLD_L,{rx:10,stroke:GOLD,sw:1}));
  els.push(rect(20,368,4,54,GOLD,{rx:2}));
  els.push(text(32,382,'Best April on record',13,TEXT,{weight:700}));
  els.push(text(32,398,'↑ Revenue up 18.4% from March. Two retainer',10,TEXT2,{}));
  els.push(text(32,412,'clients renewed at higher rates.',10,TEXT2,{}));

  // Net income summary
  els.push(text(20,444,'NET INCOME — APRIL',9,TEXT3,{weight:700,ls:2}));
  els.push(line(20,450,W-20,450,BORDER,1));
  const netRows = [
    { label:'Gross Revenue', amount:'$14,820', color:TEXT },
    { label:'Business Expenses', amount:'-$2,140', color:RED },
    { label:'Platform Fees', amount:'-$420', color:RED },
    { label:'Net Profit', amount:'$12,260', color:ACCENT, bold:true },
  ];
  netRows.forEach((r,i) => {
    const y = 470+i*38;
    if (r.bold) {
      els.push(rect(20,y-10,W-40,36,ACCENT_L,{rx:8}));
      els.push(line(20,y-10,W-20,y-10,ACCENT,1,{opacity:0.3}));
    }
    els.push(text(28,y+6,r.label,12,r.bold?ACCENT:TEXT2,{weight:r.bold?700:400}));
    els.push(text(W-28,y+6,r.amount,13,r.color,{weight:700,anchor:'end'}));
  });

  // Tax reserve notice
  const taxY = 636;
  els.push(rect(20,taxY,W-40,44,SURFACE,{rx:8,stroke:BORDER,sw:1}));
  els.push(rect(20,taxY,4,44,GOLD,{}));
  els.push(text(32,taxY+16,'💡 Tax Reserve Tip',11,TEXT,{weight:700}));
  els.push(text(32,taxY+30,'Set aside $3,065 (25%) for Q2 taxes',10,TEXT3,{}));

  navBar(els,'cashflow');
  return { id:'screen-3', name:'Cash Flow', width:W, height:H, elements:els };
}

// ══════════════════════════════════════════════════════════════
// SCREEN 4 — CLIENTS (editorial profile cards)
// ══════════════════════════════════════════════════════════════
function screen4() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  statusBar(els);

  els.push(rect(0,44,W,32,ACCENT));
  els.push(text(W/2,64,'MINT  ·  CLIENTS',9,'#FFFFFF',{anchor:'middle',weight:700,ls:3}));

  els.push(text(20,104,'Clients',28,TEXT,{weight:700}));
  els.push(text(W-20,104,'+ Add',13,ACCENT,{anchor:'end',weight:700}));

  // Search bar
  els.push(rect(20,116,W-40,36,SURFACE,{rx:10,stroke:BORDER,sw:1}));
  els.push(text(36,138,'🔍 Search clients…',12,TEXT3,{}));

  // Stats strip
  els.push(text(20,175,'6 active clients  ·  $48,220 YTD',11,TEXT3,{}));
  els.push(line(20,183,W-20,183,BORDER,1));

  const clients = [
    { name:'Hyper63', role:'Engineering Sprint', ytd:'$16,400', status:'Active', heat:95, initials:'H63', color:'#2A4D2A' },
    { name:'ElevenLabs', role:'Copy & Content Retainer', ytd:'$8,400', status:'Active', heat:72, initials:'EL', color:'#7C3AED' },
    { name:'Clay Design', role:'UI/UX Consulting', ytd:'$10,800', status:'Active', heat:85, initials:'CD', color:'#C8973C' },
    { name:'RunwayML', role:'Workflow Automation', ytd:'$5,200', status:'Active', heat:60, initials:'RM', color:'#1D4ED8' },
    { name:'Sanity.io', role:'Content Architecture', ytd:'$4,820', status:'Overdue', heat:40, initials:'SN', color:'#DC2626' },
    { name:'Stripe', role:'Integration Consulting', ytd:'$2,600', status:'Complete', heat:30, initials:'ST', color:'#6366F1' },
  ];

  clients.forEach((c,i) => {
    const y = 196 + i*92;
    els.push(rect(20,y,W-40,84,SURFACE,{rx:12,stroke:BORDER,sw:1}));
    // Avatar
    els.push(rect(32,y+14,44,44,c.color,{rx:10}));
    els.push(text(54,y+40,c.initials,12,'#FFFFFF',{anchor:'middle',weight:700}));
    // Name + role
    els.push(text(86,y+26,c.name,14,TEXT,{weight:700}));
    els.push(text(86,y+42,c.role,10,TEXT2,{}));
    // YTD + status
    els.push(text(86,y+62,c.ytd+' YTD',11,ACCENT,{weight:700}));
    const sBg = c.status==='Active'?ACCENT_L:c.status==='Overdue'?RED_L:SURF2;
    const sC  = c.status==='Active'?ACCENT:c.status==='Overdue'?RED:TEXT3;
    els.push(rect(W-76,y+10,60,20,sBg,{rx:10}));
    els.push(text(W-46,y+23,c.status,8,sC,{anchor:'middle',weight:700}));
    // Heat bar
    els.push(rect(86,y+68,200,4,SURF2,{rx:2}));
    els.push(rect(86,y+68,Math.round(200*c.heat/100),4,c.status==='Overdue'?RED:ACCENT,{rx:2}));
    els.push(text(W-28,y+72,c.heat+'%',8,TEXT3,{anchor:'end'}));
  });

  navBar(els,'clients');
  return { id:'screen-4', name:'Clients', width:W, height:H, elements:els };
}

// ══════════════════════════════════════════════════════════════
// SCREEN 5 — EXPENSE LOG (journal style)
// ══════════════════════════════════════════════════════════════
function screen5() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  statusBar(els);

  els.push(rect(0,44,W,32,ACCENT));
  els.push(text(W/2,64,'MINT  ·  EXPENSES',9,'#FFFFFF',{anchor:'middle',weight:700,ls:3}));

  els.push(text(20,104,'Expenses',28,TEXT,{weight:700}));

  // Summary editorial box — minimalist
  const sumX=20, sumY=118, sumW=W-40, sumH=52;
  els.push(rect(sumX,sumY,sumW,sumH,SURF2,{rx:10}));
  els.push(text(sumX+16,sumY+16,'APR TOTAL',8,TEXT3,{weight:700,ls:1.5}));
  els.push(text(sumX+16,sumY+36,'$2,140',20,RED,{weight:700}));
  els.push(text(sumX+110,sumY+36,'vs $2,800 last month',10,TEXT3,{}));
  els.push(rect(sumX+sumW-80,sumY+14,68,24,ACCENT_L,{rx:8}));
  els.push(text(sumX+sumW-46,sumY+30,'↓ 23.6%',10,ACCENT,{anchor:'middle',weight:700}));

  // Category chips
  const cats = ['All','Software','Travel','Equipment','Office','Meals'];
  let cx = 20;
  cats.forEach((c,i) => {
    const w = c.length*7+16;
    const active = i===0;
    els.push(rect(cx,178,w,24,active?ACCENT:SURFACE,{rx:12,stroke:active?ACCENT:BORDER,sw:1}));
    els.push(text(cx+w/2,194,c,9,active?'#FFFFFF':TEXT2,{anchor:'middle',weight:active?700:400}));
    cx += w+6;
  });

  // Expense journal
  els.push(text(20,218,'APR 5',8,TEXT3,{weight:700,ls:1.5}));
  els.push(line(52,213,W-20,213,BORDER,1));

  const expenses = [
    { name:'Figma Professional', cat:'Software', amount:'-$45', icon:'🎨', date:'Apr 5' },
    { name:'Notion AI', cat:'Software', amount:'-$16', icon:'📓', date:'Apr 5' },
    { name:'AWS EC2 — us-east-1', cat:'Software', amount:'-$124', icon:'☁', date:'Apr 4' },
    { name:'Client lunch — Hyper63', cat:'Meals', amount:'-$87', icon:'🍱', date:'Apr 3' },
    { name:'External SSD 2TB', cat:'Equipment', amount:'-$189', icon:'💾', date:'Apr 2' },
    { name:'Coworking — Day pass', cat:'Office', amount:'-$35', icon:'🏢', date:'Apr 1' },
    { name:'Adobe CC Monthly', cat:'Software', amount:'-$54', icon:'🔲', date:'Apr 1' },
    { name:'Flight SFO → NYC', cat:'Travel', amount:'-$380', icon:'✈', date:'Mar 31' },
  ];

  const catColors = {Software:ACCENT,Travel:'#7C3AED',Equipment:GOLD,Office:TEXT2,Meals:RED};

  let curDate = '';
  let eY = 226;
  expenses.forEach((e,i) => {
    if (e.date !== curDate) {
      if (i>0) {
        eY += 6;
        els.push(text(20,eY,e.date.toUpperCase().replace('-',' '),8,TEXT3,{weight:700,ls:1.5}));
        els.push(line(56,eY-4,W-20,eY-4,BORDER,1));
        eY += 10;
      }
      curDate = e.date;
    }
    const rY = eY;
    els.push(rect(20,rY,W-40,44,SURFACE,{rx:8,stroke:BORDER,sw:1}));
    // Category color bar
    const catC = catColors[e.cat] || TEXT3;
    els.push(rect(20,rY,3,44,catC,{rx:1}));
    // Icon circle
    els.push(circle(42,rY+22,14,SURF2));
    els.push(text(42,rY+27,e.icon,13,'',{anchor:'middle'}));
    els.push(text(60,rY+16,e.name,12,TEXT,{weight:600}));
    els.push(text(60,rY+30,e.cat,9,catC,{weight:700}));
    els.push(text(W-28,rY+24,e.amount,13,RED,{weight:700,anchor:'end'}));
    eY += 50;
  });

  navBar(els,'cashflow');
  return { id:'screen-5', name:'Expense Log', width:W, height:H, elements:els };
}

// ══════════════════════════════════════════════════════════════
// SCREEN 6 — PROFILE / SETTINGS (editorial "about me")
// ══════════════════════════════════════════════════════════════
function screen6() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  statusBar(els);

  // Hero band
  els.push(rect(0,44,W,160,ACCENT));
  // Abstract editorial lines
  for(let i=0;i<6;i++) {
    els.push(line(0,44+i*28,W,44+i*28,'rgba(255,255,255,0.04)',1));
  }
  // Avatar circle
  els.push(circle(60,130,38,'rgba(255,255,255,0.15)'));
  els.push(circle(60,130,32,SURFACE));
  els.push(text(60,137,'R',18,ACCENT,{anchor:'middle',weight:700}));
  // Name + title
  els.push(text(110,116,'Rakis',22,'#FFFFFF',{weight:700}));
  els.push(text(110,134,'Freelance Designer & Developer',11,'rgba(255,255,255,0.7)',{}));
  // Edit
  els.push(rect(W-72,56,56,24,SURFACE,{rx:12}));
  els.push(text(W-44,72,'Edit',11,ACCENT,{anchor:'middle',weight:700}));

  // Stats editorial row
  const stats = [
    {label:'YTD EARNED',val:'$48,220'},
    {label:'CLIENTS',val:'6 active'},
    {label:'INVOICES',val:'12 sent'},
  ];
  els.push(rect(0,204,W,62,SURF2));
  stats.forEach((s,i) => {
    const x = 20 + i*120;
    if (i>0) els.push(line(x-8,214,x-8,256,BORDER,1));
    els.push(text(x,218,s.label,7,TEXT3,{weight:700,ls:1.5}));
    els.push(text(x,238,s.val,14,TEXT,{weight:700}));
  });

  // Settings list — editorial clean
  const sections = [
    { header:'ACCOUNT', items:[
      {icon:'◉',label:'Business Profile',sub:'Name, address, tax ID'},
      {icon:'◈',label:'Payment Methods',sub:'Bank · PayPal · Stripe'},
      {icon:'◎',label:'Billing & Plan',sub:'Pro — $12/mo'},
    ]},
    { header:'PREFERENCES', items:[
      {icon:'◍',label:'Currency & Region',sub:'USD · US English'},
      {icon:'◌',label:'Notifications',sub:'Email · Push'},
      {icon:'◧',label:'Invoice Defaults',sub:'Net 30 · auto-remind'},
    ]},
    { header:'DATA', items:[
      {icon:'◑',label:'Export Data',sub:'CSV, PDF, QuickBooks'},
      {icon:'◉',label:'Tax Reports',sub:'1099 ready exports'},
    ]},
  ];

  let sY = 278;
  sections.forEach(sec => {
    els.push(text(20,sY,sec.header,8,TEXT3,{weight:700,ls:1.5}));
    sY += 12;
    sec.items.forEach(item => {
      els.push(rect(20,sY,W-40,46,SURFACE,{rx:10,stroke:BORDER,sw:1}));
      els.push(circle(42,sY+23,14,ACCENT_L));
      els.push(text(42,sY+28,item.icon,14,ACCENT,{anchor:'middle'}));
      els.push(text(62,sY+18,item.label,13,TEXT,{weight:600}));
      els.push(text(62,sY+32,item.sub,10,TEXT3,{}));
      els.push(text(W-28,sY+24,'›',16,TEXT3,{anchor:'end'}));
      sY += 52;
    });
    sY += 6;
  });

  // Sign out
  els.push(rect(20,sY,W-40,40,SURFACE,{rx:10,stroke:BORDER,sw:1}));
  els.push(text(W/2,sY+24,'Sign Out',13,RED,{anchor:'middle',weight:600}));

  navBar(els,'profile');
  return { id:'screen-6', name:'Profile', width:W, height:H, elements:els };
}

const design = {
  version: '2.8',
  metadata: {
    appName: 'MINT',
    tagline: 'Freelance Finance, Clearly',
    archetype: 'editorial-finance',
    theme: 'light',
    palette: { bg:BG, surface:SURFACE, text:TEXT, accent:ACCENT, accent2:GOLD, muted:TEXT3 },
    heartbeat: 7,
    generatedAt: new Date().toISOString(),
  },
  screens: [ screen1(), screen2(), screen3(), screen4(), screen5(), screen6() ],
};

const total = design.screens.reduce((s,sc)=>s+sc.elements.length,0);
console.log(`MINT — ${design.screens.length} screens, ${total} elements`);

const outPath = path.join(__dirname,'mint.pen');
fs.writeFileSync(outPath, JSON.stringify(design,null,2));
console.log('Saved:', outPath);
