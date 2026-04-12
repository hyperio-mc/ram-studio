'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'plinth';
const NAME = 'PLINTH';
const TAGLINE = 'Your financial foundation';
const W = 390, H = 844;

// Light palette — warm cream inspired by minimal.gallery paper aesthetic
const BG     = '#F7F5F1';
const SURF   = '#FFFFFF';
const CARD   = '#EDEAE5';
const ACC    = '#0F766E'; // teal — trust, stability
const ACC2   = '#B45309'; // amber-brown — warmth
const ERR    = '#DC2626'; // red — alerts
const TEXT   = '#1C1917';
const TEXT2  = '#57534E';
const MUTED  = '#A8A29E';
const WHITE  = '#FFFFFF';
const BORDER = '#D6D3CF';

// ── primitives ──────────────────────────────────────────────────────────────
function rect(x,y,w,h,fill,opts={}) {
  const e = { type:'rect', x, y, width:w, height:h, fill };
  if (opts.rx)      e.rx      = opts.rx;
  if (opts.opacity) e.opacity = opts.opacity;
  if (opts.stroke)  { e.stroke = opts.stroke; e.strokeWidth = opts.sw||1; }
  return e;
}
function text(x,y,content,size,fill,opts={}) {
  const e = { type:'text', x, y, content, fontSize:size, fill };
  if (opts.fw)      e.fontWeight  = opts.fw;
  if (opts.font)    e.fontFamily  = opts.font;
  if (opts.anchor)  e.textAnchor  = opts.anchor;
  if (opts.ls)      e.letterSpacing = opts.ls;
  if (opts.opacity) e.opacity     = opts.opacity;
  return e;
}
function circle(cx,cy,r,fill,opts={}) {
  const e = { type:'circle', cx, cy, r, fill };
  if (opts.opacity) e.opacity = opts.opacity;
  if (opts.stroke)  { e.stroke = opts.stroke; e.strokeWidth = opts.sw||1; }
  return e;
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  return { type:'line', x1, y1, x2, y2, stroke, strokeWidth: opts.sw||1, opacity: opts.opacity||1 };
}

// ── shared components ────────────────────────────────────────────────────────
function statusBar(els) {
  els.push(rect(0,0,W,44,BG));
  els.push(text(20,28,'9:41',13,TEXT,{fw:'600'}));
  els.push(text(370,28,'●●●',11,TEXT,{anchor:'end'}));
}

function bottomNav(els, activeIdx) {
  const navH = 80;
  const navY = H - navH;
  els.push(rect(0,navY,W,navH,SURF));
  els.push(line(0,navY,W,navY,BORDER,{sw:1,opacity:0.6}));
  const tabs = [
    {label:'Home', icon:'⌂'},
    {label:'Spend', icon:'◎'},
    {label:'Goals', icon:'◈'},
    {label:'Insight', icon:'◇'},
    {label:'More', icon:'≡'},
  ];
  const tabW = W / tabs.length;
  tabs.forEach((tab,i) => {
    const cx = tabW*i + tabW/2;
    const isActive = i === activeIdx;
    els.push(text(cx, navY+28, tab.icon, 18, isActive?ACC:MUTED, {anchor:'middle'}));
    els.push(text(cx, navY+48, tab.label, 10, isActive?ACC:MUTED, {anchor:'middle', fw: isActive?'600':'400'}));
    if (isActive) {
      els.push(rect(cx-12, navY+3, 24, 3, ACC, {rx:2}));
    }
  });
}

function bentoCard(els, x, y, w, h, opts={}) {
  const fill = opts.fill || SURF;
  const r    = opts.rx   || 16;
  els.push(rect(x, y, w, h, fill, {rx:r}));
  if (opts.stroke) {
    els.push(rect(x, y, w, h, 'none', {rx:r, stroke:opts.stroke, sw:1}));
  }
}

// ── SCREEN 1: Dashboard ──────────────────────────────────────────────────────
function screen1() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  statusBar(els);

  // Header
  els.push(text(20,72,'Good morning, Alex',13,TEXT2));
  els.push(text(20,96,'Your Money',28,TEXT,{fw:'700',font:'Georgia, serif'}));
  // Avatar
  els.push(circle(362,80,18,ACC,{opacity:0.15}));
  els.push(text(362,86,'AL',11,ACC,{anchor:'middle',fw:'700'}));

  // BENTO GRID starts at y=118
  const BG_PAD = 12;
  const ROW1_Y = 118;

  // Card A — Net Worth (wide, tall) — x:20, y:118, w:226, h:160
  bentoCard(els, 20, ROW1_Y, 226, 160, {fill:ACC});
  els.push(text(36, ROW1_Y+24, 'Net Worth', 11, 'rgba(255,255,255,0.7)', {fw:'500'}));
  els.push(text(36, ROW1_Y+56, '$124,830', 30, WHITE, {fw:'700', font:'Georgia, serif'}));
  els.push(text(36, ROW1_Y+80, '+$2,140 this month', 12, 'rgba(255,255,255,0.85)'));
  // Mini spark line
  const sparkY = ROW1_Y+120;
  const sparkPoints = [0,10,4,14,8,6,16,12,20,5,24,18,28,14,32,20,36,16,40,22];
  for (let i=0; i<sparkPoints.length-2; i+=2) {
    const x1 = 36+sparkPoints[i]*4.5, y1 = sparkY+20-sparkPoints[i+1];
    const x2 = 36+sparkPoints[i+2]*4.5, y2 = sparkY+20-sparkPoints[i+3];
    els.push(line(x1,y1,x2,y2,'rgba(255,255,255,0.5)',{sw:1.5}));
  }
  els.push(rect(36, ROW1_Y+136, 90, 28, 'rgba(255,255,255,0.2)', {rx:8}));
  els.push(text(81, ROW1_Y+154, 'View history', 10, WHITE, {anchor:'middle', fw:'500'}));

  // Card B — Monthly Budget (narrow, tall) — x:254, y:118, w:116, h:160
  bentoCard(els, 254, ROW1_Y, 116, 160, {fill:CARD});
  els.push(text(312, ROW1_Y+24, 'Budget', 10, TEXT2, {anchor:'middle', fw:'500'}));
  // Donut ring
  const dCX=312, dCY=ROW1_Y+82, dR=32;
  els.push(circle(dCX,dCY,dR,'none',{stroke:BORDER,sw:6}));
  els.push(circle(dCX,dCY,dR,'none',{stroke:ACC,sw:6})); // represents 68%
  // Partial arc approximation with arc segments
  els.push(text(dCX, dCY+6, '68%', 14, ACC, {anchor:'middle', fw:'700'}));
  els.push(text(dCX, dCY+22, 'used', 10, TEXT2, {anchor:'middle'}));
  els.push(text(312, ROW1_Y+130, '$1,240', 13, TEXT, {anchor:'middle', fw:'600', font:'Georgia, serif'}));
  els.push(text(312, ROW1_Y+148, 'of $1,800', 10, MUTED, {anchor:'middle'}));

  const ROW2_Y = ROW1_Y + 160 + BG_PAD;

  // Card C — Cash Flow (wide) — x:20, y:290, w:170, h:100
  bentoCard(els, 20, ROW2_Y, 170, 100, {fill:SURF});
  els.push(text(36, ROW2_Y+22, 'Cash Flow', 10, TEXT2, {fw:'500'}));
  els.push(text(36, ROW2_Y+48, '+$840', 22, ACC, {fw:'700', font:'Georgia, serif'}));
  els.push(text(36, ROW2_Y+68, 'income - expenses', 10, MUTED));
  // Small bar indicators
  for (let i=0; i<5; i++) {
    const bh = [28,18,35,24,32][i];
    els.push(rect(100+i*12, ROW2_Y+85-bh, 8, bh, i===4?ACC:ACC,{rx:2,opacity:i===4?1:0.25}));
  }

  // Card D — Savings Rate — x:198, y:290, w:172, h:100
  bentoCard(els, 198, ROW2_Y, 172, 100, {fill:ACC2,rx:16});
  els.push(text(214, ROW2_Y+22, 'Savings Rate', 10, 'rgba(255,255,255,0.75)', {fw:'500'}));
  els.push(text(214, ROW2_Y+52, '23%', 28, WHITE, {fw:'700', font:'Georgia, serif'}));
  els.push(text(214, ROW2_Y+72, 'of monthly income', 10, 'rgba(255,255,255,0.7)'));
  els.push(rect(214, ROW2_Y+82, 140, 4, 'rgba(255,255,255,0.25)', {rx:2}));
  els.push(rect(214, ROW2_Y+82, 32, 4, WHITE, {rx:2})); // 23%

  const ROW3_Y = ROW2_Y + 100 + BG_PAD;

  // Section title
  els.push(text(20, ROW3_Y+4, 'Recent Transactions', 13, TEXT, {fw:'600'}));
  els.push(text(370, ROW3_Y+4, 'See all', 12, ACC, {anchor:'end'}));

  // Transaction rows
  const txns = [
    {icon:'☕', name:'Blue Bottle Coffee', cat:'Food', amt:'-$6.50', sign:-1},
    {icon:'🚇', name:'Transit Card', cat:'Transport', amt:'-$4.20', sign:-1},
    {icon:'⬆', name:'Payroll', cat:'Income', amt:'+$4,200', sign:1},
  ];
  txns.forEach((t,i) => {
    const ty = ROW3_Y+20 + i*52;
    els.push(rect(20, ty, W-40, 48, SURF, {rx:12}));
    els.push(circle(46, ty+24, 16, t.sign>0?'#D1FAE5':'#FEF3C7'));
    els.push(text(46, ty+28, t.icon, 13, TEXT, {anchor:'middle'}));
    els.push(text(74, ty+18, t.name, 13, TEXT, {fw:'500'}));
    els.push(text(74, ty+34, t.cat, 11, MUTED));
    els.push(text(W-30, ty+28, t.amt, 13, t.sign>0?ACC:TEXT, {anchor:'end', fw:'600'}));
  });

  bottomNav(els, 0);

  return { name:'Dashboard', svg:'', elements: els };
}

// ── SCREEN 2: Spending ────────────────────────────────────────────────────────
function screen2() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  statusBar(els);

  els.push(text(20,72,'April 2026',13,TEXT2));
  els.push(text(20,96,'Spending',28,TEXT,{fw:'700',font:'Georgia, serif'}));

  // Total spent card
  bentoCard(els, 20, 112, W-40, 100, {fill:SURF});
  els.push(text(40, 134, 'Total Spent', 11, TEXT2, {fw:'500'}));
  els.push(text(40, 166, '$1,240', 32, TEXT, {fw:'700', font:'Georgia, serif'}));
  els.push(text(40, 186, 'of $1,800 budget', 12, MUTED));
  // Progress bar
  els.push(rect(40, 196, W-80, 8, CARD, {rx:4}));
  els.push(rect(40, 196, (W-80)*0.69, 8, ACC, {rx:4}));
  els.push(text(W-30, 202, '69%', 11, ACC, {anchor:'end', fw:'600'}));

  // Category breakdown
  els.push(text(20, 232, 'By Category', 13, TEXT, {fw:'600'}));

  const cats = [
    {icon:'🏠', name:'Housing',    amt:'$1,850', pct:48, color:ACC},
    {icon:'🛒', name:'Groceries',  amt:'$340',   pct:22, color:'#7C3AED'},
    {icon:'🍽', name:'Dining Out', amt:'$210',   pct:14, color:ACC2},
    {icon:'🚗', name:'Transport',  amt:'$180',   pct:12, color:'#0891B2'},
    {icon:'🎬', name:'Entertain',  amt:'$110',   pct:7,  color:'#DB2777'},
  ];

  cats.forEach((c, i) => {
    const ry = 254 + i * 68;
    bentoCard(els, 20, ry, W-40, 60, {fill:SURF});
    // Icon circle
    els.push(circle(46, ry+30, 16, c.color,{opacity:0.12}));
    els.push(text(46, ry+34, c.icon, 14, TEXT, {anchor:'middle'}));
    // Label + amount
    els.push(text(70, ry+22, c.name, 13, TEXT, {fw:'500'}));
    els.push(text(W-30, ry+22, c.amt, 13, TEXT, {anchor:'end', fw:'600'}));
    // Progress bar
    els.push(rect(70, ry+34, W-100, 5, CARD, {rx:2}));
    els.push(rect(70, ry+34, (W-100)*(c.pct/100), 5, c.color, {rx:2}));
    els.push(text(70, ry+48, `${c.pct}% of budget`, 10, MUTED));
  });

  bottomNav(els, 1);
  return { name:'Spending', svg:'', elements: els };
}

// ── SCREEN 3: Goals ───────────────────────────────────────────────────────────
function screen3() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  statusBar(els);

  els.push(text(20,72,'3 active goals',13,TEXT2));
  els.push(text(20,96,'Goals',28,TEXT,{fw:'700',font:'Georgia, serif'}));

  // Add button
  els.push(rect(320,76,50,28,ACC,{rx:14}));
  els.push(text(345,95,'+ Add',11,WHITE,{anchor:'middle',fw:'600'}));

  // Summary bento row
  bentoCard(els, 20, 114, (W-52)/2, 80, {fill:ACC});
  els.push(text(36, 136, 'Total Saved', 10, 'rgba(255,255,255,0.75)', {fw:'500'}));
  els.push(text(36, 162, '$18,430', 20, WHITE, {fw:'700', font:'Georgia, serif'}));

  bentoCard(els, 20+(W-52)/2+12, 114, (W-52)/2, 80, {fill:CARD});
  const x2 = 20+(W-52)/2+12;
  els.push(text(x2+16, 136, 'On Track', 10, TEXT2, {fw:'500'}));
  els.push(text(x2+16, 162, '2 of 3', 20, TEXT, {fw:'700', font:'Georgia, serif'}));

  // Goal cards
  const goals = [
    {
      name:'Emergency Fund', emoji:'🛡',
      target:10000, saved:7200, color:ACC,
      timeline:'Jun 2026', monthly:450,
    },
    {
      name:'Japan Trip', emoji:'✈',
      target:5000, saved:2100, color:'#7C3AED',
      timeline:'Dec 2026', monthly:200,
    },
    {
      name:'New MacBook', emoji:'💻',
      target:2500, saved:2500, color:ACC2,
      timeline:'Done!', monthly:0,
    },
  ];

  goals.forEach((g, i) => {
    const gy = 210 + i * 160;
    const pct = Math.min(1, g.saved / g.target);
    const isDone = g.saved >= g.target;

    bentoCard(els, 20, gy, W-40, 148, {fill:SURF});

    // Goal header
    els.push(circle(46, gy+30, 18, g.color, {opacity:0.12}));
    els.push(text(46, gy+35, g.emoji, 16, TEXT, {anchor:'middle'}));
    els.push(text(72, gy+24, g.name, 14, TEXT, {fw:'600'}));
    if (isDone) {
      els.push(rect(W-80, gy+16, 50, 20, '#D1FAE5', {rx:10}));
      els.push(text(W-55, gy+29, '✓ Done', 10, ACC, {anchor:'middle', fw:'600'}));
    } else {
      els.push(text(W-30, gy+24, g.timeline, 11, TEXT2, {anchor:'end'}));
    }

    // Amounts
    els.push(text(36, gy+58, `$${g.saved.toLocaleString()}`, 22, g.color, {fw:'700', font:'Georgia, serif'}));
    els.push(text(36, gy+74, `of $${g.target.toLocaleString()}`, 12, MUTED));

    // Progress bar
    els.push(rect(36, gy+86, W-72, 8, CARD, {rx:4}));
    els.push(rect(36, gy+86, Math.max((W-72)*pct,8), 8, g.color, {rx:4}));
    els.push(text(W-30, gy+81, `${Math.round(pct*100)}%`, 11, g.color, {anchor:'end', fw:'600'}));

    // Monthly contribution
    if (!isDone) {
      els.push(text(36, gy+110, `+$${g.monthly}/mo`, 12, TEXT, {fw:'500'}));
      els.push(text(36, gy+126, 'auto-contribution', 10, MUTED));
      // Pause button
      els.push(rect(W-90, gy+102, 60, 26, CARD, {rx:13}));
      els.push(text(W-60, gy+119, '⏸ Pause', 10, TEXT2, {anchor:'middle'}));
    } else {
      els.push(text(36, gy+110, 'Congratulations! Goal reached.', 12, ACC, {fw:'500'}));
    }
  });

  bottomNav(els, 2);
  return { name:'Goals', svg:'', elements: els };
}

// ── SCREEN 4: Insights ────────────────────────────────────────────────────────
function screen4() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  statusBar(els);

  els.push(text(20,72,'Weekly digest',13,TEXT2));
  els.push(text(20,96,'Insights',28,TEXT,{fw:'700',font:'Georgia, serif'}));

  // AI insight card
  bentoCard(els, 20, 112, W-40, 120, {fill:TEXT});
  els.push(rect(36, 130, 32, 20, ACC, {rx:4}));
  els.push(text(52, 144, 'AI', 10, WHITE, {anchor:'middle', fw:'700'}));
  els.push(text(78, 140, 'Personalized insight', 11, 'rgba(255,255,255,0.6)', {fw:'500'}));
  els.push(text(36, 170, 'You spend 40% more on', 14, WHITE, {fw:'400'}));
  els.push(text(36, 188, 'dining on weekends.', 14, WHITE, {fw:'400'}));
  els.push(text(36, 210, 'Try a $50 weekly cap to save $200/mo.', 11, 'rgba(255,255,255,0.6)'));

  // Trend sparklines section
  els.push(text(20, 250, 'Spending Trends', 13, TEXT, {fw:'600'}));

  const months = ['Oct','Nov','Dec','Jan','Feb','Mar','Apr'];
  const vals   = [1100,1350,1580,1180,1280,1190,1240];
  const chartX = 30, chartY = 270, chartW = W-60, chartH = 90;
  const maxV = Math.max(...vals);

  // Grid
  [0,0.25,0.5,0.75,1].forEach(t => {
    const ly = chartY + chartH - chartH*t;
    els.push(line(chartX,ly,chartX+chartW,ly,BORDER,{sw:1,opacity:0.5}));
    const label = Math.round(maxV*t);
    if (t>0) els.push(text(chartX-4, ly+4, `$${label}`, 8, MUTED, {anchor:'end'}));
  });

  // Bars
  const barW = chartW / vals.length - 6;
  vals.forEach((v, i) => {
    const bh = (v/maxV)*chartH;
    const bx = chartX + i*(chartW/vals.length);
    const isLatest = i===vals.length-1;
    els.push(rect(bx+2, chartY+chartH-bh, barW, bh, isLatest?ACC:CARD, {rx:3}));
    els.push(text(bx+2+barW/2, chartY+chartH+12, months[i], 8, MUTED, {anchor:'middle'}));
  });

  // Insight pills row
  els.push(text(20, 384, 'Smart alerts', 13, TEXT, {fw:'600'}));

  const alerts = [
    {icon:'📈', title:'Savings up 12%', sub:'vs last month', color:ACC},
    {icon:'⚠️', title:'Dining over budget', sub:'by $40', color:ERR},
    {icon:'🎯', title:'Japan goal: on track', sub:'Dec 2026', color:'#7C3AED'},
    {icon:'💡', title:'Reduce subscriptions', sub:'Save $68/mo', color:ACC2},
  ];

  alerts.forEach((a,i) => {
    const ay = 404 + i*66;
    bentoCard(els, 20, ay, W-40, 58, {fill:SURF});
    els.push(circle(46, ay+29, 18, a.color, {opacity:0.1}));
    els.push(text(46, ay+33, a.icon, 15, TEXT, {anchor:'middle'}));
    els.push(text(70, ay+22, a.title, 13, TEXT, {fw:'600'}));
    els.push(text(70, ay+38, a.sub, 11, MUTED));
    els.push(text(W-30, ay+34, '→', 14, a.color, {anchor:'end'}));
  });

  bottomNav(els, 3);
  return { name:'Insights', svg:'', elements: els };
}

// ── SCREEN 5: Accounts ────────────────────────────────────────────────────────
function screen5() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  statusBar(els);

  els.push(text(20,72,'4 connected',13,TEXT2));
  els.push(text(20,96,'Accounts',28,TEXT,{fw:'700',font:'Georgia, serif'}));

  const accounts = [
    {type:'Checking',  bank:'Chase',       bal:4280,  icon:'🏦', color:ACC},
    {type:'Savings',   bank:'Marcus',      bal:14150, icon:'💰', color:'#7C3AED'},
    {type:'Investment',bank:'Fidelity',    bal:58400, icon:'📊', color:ACC2},
    {type:'Credit',    bank:'Amex Gold',   bal:-1240, icon:'💳', color:TEXT2},
  ];

  // Total net
  const net = accounts.reduce((s,a)=>s+a.bal,0);
  bentoCard(els, 20, 112, W-40, 88, {fill:ACC});
  els.push(text(36, 136, 'Total Balance', 11, 'rgba(255,255,255,0.7)', {fw:'500'}));
  els.push(text(36, 170, `$${net.toLocaleString()}`, 32, WHITE, {fw:'700', font:'Georgia, serif'}));
  els.push(text(W-30, 148, '↻ Sync', 12, 'rgba(255,255,255,0.8)', {anchor:'end'}));

  accounts.forEach((a,i) => {
    const ay = 218 + i * 100;
    bentoCard(els, 20, ay, W-40, 88, {fill:SURF});
    // Bank icon area
    els.push(circle(48, ay+44, 20, a.color, {opacity:0.12}));
    els.push(text(48, ay+49, a.icon, 18, TEXT, {anchor:'middle'}));
    // Details
    els.push(text(76, ay+30, a.bank, 14, TEXT, {fw:'600'}));
    els.push(text(76, ay+48, a.type, 11, MUTED));
    // Balance
    const isNeg = a.bal < 0;
    els.push(text(W-30, ay+38, `${isNeg?'-':''}$${Math.abs(a.bal).toLocaleString()}`, 16, isNeg?ERR:TEXT, {anchor:'end',fw:'700',font:'Georgia, serif'}));
    els.push(text(W-30, ay+56, isNeg?'Due in 12 days':'Last synced now', 10, MUTED, {anchor:'end'}));
    // Mini bar
    const barMax = Math.max(...accounts.map(x=>Math.abs(x.bal)));
    const bw = ((W-80) * Math.abs(a.bal) / barMax) * 0.7;
    els.push(rect(36, ay+72, W-72, 4, CARD, {rx:2}));
    els.push(rect(36, ay+72, bw, 4, a.color, {rx:2, opacity:isNeg?0.5:0.8}));
  });

  bottomNav(els, 4);
  return { name:'Accounts', svg:'', elements: els };
}

// ── SCREEN 6: Profile / Settings ─────────────────────────────────────────────
function screen6() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  statusBar(els);

  // Profile hero — full-width card
  bentoCard(els, 0, 44, W, 180, {fill:SURF, rx:0});
  els.push(circle(195, 104, 38, ACC, {opacity:0.1}));
  els.push(text(195, 112, 'AL', 22, ACC, {anchor:'middle', fw:'700'}));
  els.push(text(195, 148, 'Alex Lund', 18, TEXT, {anchor:'middle', fw:'700', font:'Georgia, serif'}));
  els.push(text(195, 168, 'alex@plinth.app', 12, MUTED, {anchor:'middle'}));
  // Tier badge
  els.push(rect(155, 182, 80, 24, ACC, {rx:12}));
  els.push(text(195, 198, 'Pro Member', 11, WHITE, {anchor:'middle', fw:'600'}));

  // Stats row
  const stats = [{v:'$18,430',l:'Saved'},{v:'23%',l:'Rate'},{v:'3',l:'Goals'}];
  stats.forEach((s,i) => {
    const sx = 20 + i*(W-20)/3;
    const sw = (W-20)/3 - 12;
    bentoCard(els, sx, 238, sw, 68, {fill:CARD});
    els.push(text(sx+sw/2, 264, s.v, 16, TEXT, {anchor:'middle', fw:'700', font:'Georgia, serif'}));
    els.push(text(sx+sw/2, 282, s.l, 10, MUTED, {anchor:'middle'}));
  });

  // Settings sections
  const sections = [
    {header:'Preferences', items:['Notifications','Currency & Region','Dark Mode']},
    {header:'Security',    items:['Face ID / Touch ID','Change Passcode','Two-Factor Auth']},
    {header:'Data',        items:['Export CSV','Connected Accounts','Delete Data']},
  ];

  let sy = 322;
  sections.forEach(sec => {
    els.push(text(20, sy+4, sec.header, 11, MUTED, {fw:'600', ls:1}));
    sy += 20;
    bentoCard(els, 20, sy, W-40, sec.items.length*50, {fill:SURF});
    sec.items.forEach((item,ii) => {
      const iy = sy + ii*50;
      els.push(text(36, iy+28, item, 14, TEXT));
      els.push(text(W-30, iy+28, '›', 16, MUTED, {anchor:'end'}));
      if (ii < sec.items.length-1) {
        els.push(line(36, iy+50, W-36, iy+50, BORDER, {sw:1, opacity:0.5}));
      }
    });
    sy += sec.items.length*50 + 12;
  });

  bottomNav(els, 4);
  return { name:'Settings', svg:'', elements: els };
}

// ── Assemble ──────────────────────────────────────────────────────────────────
const screens = [screen1(),screen2(),screen3(),screen4(),screen5(),screen6()];
const totalElements = screens.reduce((s,sc)=>s+sc.elements.length,0);

const pen = {
  version: '2.8',
  metadata: {
    name:    `${NAME} — ${TAGLINE}`,
    author:  'RAM',
    date:    new Date().toISOString().slice(0,10),
    theme:   'light',
    heartbeat: 1,
    elements: totalElements,
    slug: SLUG,
    archetype: 'personal-finance',
    palette: { bg:BG, surf:SURF, acc:ACC, acc2:ACC2, text:TEXT },
    inspiration: 'Saaspo bento grid category + minimal.gallery warm cream aesthetic',
  },
  screens,
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
