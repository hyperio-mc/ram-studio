/**
 * AURUM — Personal Wealth Intelligence
 * LIGHT theme: warm ivory + antique gold + forest green
 * Inspired by: godly.website featuring Atlas Card (atlascard.com) —
 * ultra-premium fintech with invite-only luxury positioning, serif
 * editorial typography, full-bleed photography — combined with
 * Midday.ai's structured financial data layout (from darkmodedesign.com).
 * The emerging trend: premium financial tools leaving cold fintech blue
 * for warm editorial tones — ivory, gold, forest green, terracotta.
 * RAM Design Heartbeat — 2026-03-28
 */

const fs = require('fs');

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:        '#FAF8F3',
  bg2:       '#F3EFE6',
  surface:   '#FFFFFF',
  surface2:  '#F8F5EE',
  border:    'rgba(139,107,50,0.14)',
  border2:   'rgba(139,107,50,0.07)',
  gold:      '#9B7B3D',
  gold2:     '#C49A3C',
  goldBg:    'rgba(155,123,61,0.08)',
  goldBg2:   'rgba(155,123,61,0.15)',
  forest:    '#2F5D4E',
  forest2:   '#3D7A65',
  forestBg:  'rgba(47,93,78,0.09)',
  rose:      '#B05040',
  roseBg:    'rgba(176,80,64,0.09)',
  text:      '#1A1510',
  textMid:   '#5C4E3A',
  textDim:   '#8C7B62',
  textFaint: 'rgba(92,78,58,0.40)',
  white:     '#FFFFFF',
  black:     '#0E0C08',
};

let eid = 0;
const id = () => `e${++eid}`;

const r = (x, y, w, h, fill, opts = {}) =>
  ({ id: id(), type: 'rect', x, y, w, h, fill, ...opts });
const t = (x, y, str, size, weight, fill, opts = {}) =>
  ({ id: id(), type: 'text', x, y, text: str, fontSize: size, fontWeight: weight, fill, ...opts });
const el = (x, y, rx, ry, fill, opts = {}) =>
  ({ id: id(), type: 'ellipse', x, y, w: rx*2, h: ry*2, fill, ...opts });
const ln = (x1, y1, x2, y2, stroke, sw = 1, opts = {}) =>
  ({ id: id(), type: 'line', x1, y1, x2, y2, stroke, strokeWidth: sw, ...opts });

const W = 390, H = 844;

function statusBar(y=0, dark=false) {
  const tc = dark ? 'rgba(255,255,255,0.7)' : C.textDim;
  return [
    r(0, y, W, 44, dark ? 'rgba(14,12,8,0.95)' : C.bg),
    t(20, y+14, '9:41', 12, '600', dark ? C.white : C.text),
    t(W-68, y+14, '●●● ▲', 10, '500', tc),
  ];
}

function navBar(active=0) {
  const y = H-83;
  const tabs = [
    {label:'Overview', icon:'◈'},
    {label:'Accounts', icon:'◉'},
    {label:'Moves',    icon:'⇄'},
    {label:'Goals',    icon:'◎'},
    {label:'AI Guide', icon:'✦'},
  ];
  const out = [];
  out.push(r(0, y, W, 83, C.surface));
  out.push(ln(0, y, W, y, C.border, 1));
  tabs.forEach((tab, i) => {
    const tx = 8 + i*75;
    const isA = i===active;
    if (isA) out.push(r(tx+4, y+1, 66, 3, C.gold, {cornerRadius:2}));
    out.push(t(tx+18, y+11, tab.icon, 17, '400', isA ? C.gold : C.textDim));
    out.push(t(tx+4, y+33, tab.label, 9, isA?'600':'400', isA ? C.gold : C.textDim));
  });
  return out;
}

function chip(x, y, label, active) {
  const w = label.length*6.8+20;
  return [
    r(x, y, w, 26, active ? C.gold : C.surface, {cornerRadius:13, stroke: active?'none':C.border, strokeWidth:1}),
    t(x+10, y+7, label, 10, active?'700':'400', active ? C.white : C.textMid),
  ];
}

function sparkline(x, y, pts, color, w=80, h=28) {
  const shapes = [];
  const mx = Math.max(...pts), mn = Math.min(...pts), rng = mx-mn||1;
  const step = w/(pts.length-1);
  for(let i=0;i<pts.length-1;i++){
    shapes.push(ln(
      x+i*step,     y+h-((pts[i]-mn)/rng)*h,
      x+(i+1)*step, y+h-((pts[i+1]-mn)/rng)*h,
      color, 1.5
    ));
  }
  return shapes;
}

// ─── Screen 1: Splash / Onboarding ────────────────────────────────────────────
function screenSplash() {
  const els = [];
  els.push(r(0,0,W,H,C.black));
  // Subtle grid texture
  for(let i=0;i<7;i++) for(let j=0;j<13;j++)
    els.push(r(i*58-4, j*68-4, 50, 60, 'none', {stroke:'rgba(155,123,61,0.05)', strokeWidth:1, cornerRadius:6}));

  // Central mark
  els.push(el(W/2-44, 160, 48, 48, 'rgba(155,123,61,0.10)', {stroke:C.gold, strokeWidth:1.5}));
  els.push(t(W/2-10, 194, 'A', 28, '300', C.gold));

  els.push(t(W/2, 268, 'AURUM', 38, '700', C.white, {textAlign:'center', letterSpacing:7}));
  els.push(t(W/2, 308, 'Personal Wealth Intelligence', 13, '300', 'rgba(255,255,255,0.45)', {textAlign:'center', letterSpacing:1.5}));

  // Horizontal rule
  els.push(ln(W/2-32, 332, W/2+32, 332, C.gold, 0.75));

  els.push(t(W/2, 356, 'Complete clarity over your wealth.', 12, '300', 'rgba(255,255,255,0.38)', {textAlign:'center'}));
  els.push(t(W/2, 374, 'Invite-only · Available to qualified members.', 10, '300', 'rgba(155,123,61,0.55)', {textAlign:'center'}));

  // Main CTA
  els.push(r(48, 510, W-96, 54, C.gold, {cornerRadius:27}));
  els.push(t(W/2, 531, 'Request Membership', 14, '600', C.black, {textAlign:'center', letterSpacing:0.5}));

  // Secondary
  els.push(r(48, 578, W-96, 48, 'none', {cornerRadius:24, stroke:C.gold, strokeWidth:1}));
  els.push(t(W/2, 597, 'Sign In', 13, '500', C.gold, {textAlign:'center'}));

  // Trust
  els.push(t(W/2, 658, 'FDIC Insured  ·  AES-256 Encrypted  ·  SOC2 Type II', 9, '400', 'rgba(155,123,61,0.40)', {textAlign:'center'}));

  return {id:'screen-splash', label:'Welcome', elements:els, width:W, height:H};
}

// ─── Screen 2: Overview ────────────────────────────────────────────────────────
function screenOverview() {
  const els = [];
  els.push(r(0,0,W,H,C.bg));
  els.push(...statusBar());

  // Header row
  els.push(t(20, 52, 'AURUM', 20, '700', C.text, {letterSpacing:3}));
  els.push(t(20, 74, 'Good morning, James', 12, '400', C.textDim));
  els.push(el(352-18, 62-18, 18, 18, C.goldBg2, {stroke:C.gold, strokeWidth:1.5}));
  els.push(t(343, 54, 'JM', 10, '600', C.gold));

  // Net Worth hero card
  els.push(r(20, 98, W-40, 156, C.surface, {cornerRadius:18, stroke:C.border, strokeWidth:1, shadow:'0 4px 24px rgba(139,107,50,0.10)'}));
  els.push(r(20, 98, W-40, 4, C.gold, {cornerRadius:2}));
  els.push(t(36, 114, 'NET WORTH', 9, '700', C.textDim, {letterSpacing:2}));
  els.push(t(36, 132, '$4,287,340', 32, '300', C.text, {letterSpacing:-0.5}));
  els.push(t(36, 170, '↑  +$164,200  this month', 11, '400', C.forest));
  // Sparkline
  els.push(...sparkline(220, 118, [42,55,48,66,71,63,79,86,91,89,97,100], C.gold, 128, 38));
  // YTD badge
  els.push(r(36, 192, 90, 22, C.forestBg, {cornerRadius:11}));
  els.push(t(50, 197, '+8.4% YTD', 9, '700', C.forest));
  els.push(t(148, 192, 'Q1 2026 performance', 10, '400', C.textDim));

  // Allocation cards row
  els.push(t(20, 266, 'ALLOCATION', 9, '700', C.textDim, {letterSpacing:2}));
  const allocs = [
    {label:'Equities', val:'$2.05M', pct:'48%', color:C.gold, bg:C.goldBg},
    {label:'Real Estate', val:'$1.20M', pct:'28%', color:C.forest, bg:C.forestBg},
    {label:'Private', val:'$600K', pct:'14%', color:C.textMid, bg:'rgba(92,78,58,0.08)'},
    {label:'Cash', val:'$429K', pct:'10%', color:C.textDim, bg:'rgba(140,123,98,0.08)'},
  ];
  allocs.forEach((a,i) => {
    const ax = 20 + i*87;
    els.push(r(ax, 282, 82, 92, C.surface, {cornerRadius:14, stroke:C.border, strokeWidth:1}));
    els.push(t(ax+8, 296, a.label, 9, '600', C.textMid, {letterSpacing:0.3}));
    els.push(t(ax+8, 318, a.pct, 20, '600', a.color));
    els.push(t(ax+8, 344, a.val, 9, '400', C.textDim));
    els.push(r(ax+8, 360, 66, 5, C.bg2, {cornerRadius:3}));
    els.push(r(ax+8, 360, 66*(parseInt(a.pct)/100), 5, a.color, {cornerRadius:3}));
  });

  // Recent activity
  els.push(t(20, 390, 'RECENT ACTIVITY', 9, '700', C.textDim, {letterSpacing:2}));
  const acts = [
    {icon:'✈', name:'NetJets Charter', sub:'Travel · Atlas Card', amt:'-$4,200', pos:false},
    {icon:'◉', name:'Dividend: AAPL', sub:'JPMorgan · Income', amt:'+$1,240', pos:true},
    {icon:'⬡', name:'Nobu Tokyo', sub:'Dining · Atlas Card', amt:'-$680', pos:false},
    {icon:'◻', name:'RE Rental Income', sub:'Passive Income', amt:'+$8,500', pos:true},
  ];
  acts.forEach((a,i) => {
    const ay = 408+i*52;
    els.push(r(20,ay,W-40,46,C.surface,{cornerRadius:12,stroke:C.border2,strokeWidth:1}));
    els.push(t(34,ay+12,a.icon,14,'400',C.gold));
    els.push(t(58,ay+11,a.name,12,'600',C.text));
    els.push(t(58,ay+27,a.sub,9,'400',C.textDim));
    els.push(t(W-28,ay+11,a.amt,12,'600',a.pos?C.forest:C.rose,{textAlign:'right'}));
  });

  // AI insight bar
  els.push(r(20,H-160,W-40,52,C.goldBg,{cornerRadius:12,stroke:C.border,strokeWidth:1}));
  els.push(t(36,H-150,'✦  AI Insight',9,'700',C.gold,{letterSpacing:1}));
  els.push(t(36,H-135,'Equities +2.1% vs target. Consider rebalancing into private credit.',10,'400',C.textMid));
  els.push(t(36,H-120,'Estimated tax impact: $18K',10,'400',C.textDim));

  els.push(...navBar(0));
  return {id:'screen-overview', label:'Overview', elements:els, width:W, height:H};
}

// ─── Screen 3: Accounts ─────────────────────────────────────────────────────
function screenAccounts() {
  const els = [];
  els.push(r(0,0,W,H,C.bg));
  els.push(...statusBar());

  els.push(t(20,52,'Accounts',26,'600',C.text));
  els.push(t(20,82,'7 accounts across 4 institutions',12,'400',C.textDim));

  // Filter chips
  const filters = ['All','Investments','Banking','Property'];
  let cx2=20;
  filters.forEach((f,i) => {
    const chips = chip(cx2, 108, f, i===0);
    els.push(...chips);
    cx2 += f.length*6.8+30;
  });

  const accounts = [
    {name:'JPMorgan Private', type:'Wealth Management', bal:'$2,840,000', delta:'+$48,200 today', pos:true,  icon:'◈'},
    {name:'Atlas Card',       type:'Premium Credit',    bal:'-$12,800',   delta:'Due Apr 15',    pos:false, icon:'◉'},
    {name:'Blackstone RE',    type:'Real Estate Fund',  bal:'$1,200,000', delta:'+3.2% Q1 2026', pos:true,  icon:'⬡'},
    {name:'Goldman Sachs',    type:'Investment',        bal:'$420,000',   delta:'+$7,100 today', pos:true,  icon:'◈'},
    {name:'BofA Private',     type:'Checking',          bal:'$429,340',   delta:'Active today',  pos:null,  icon:'◻'},
  ];
  accounts.forEach((acc,i) => {
    const ay = 144+i*86;
    if(ay+80>H-90) return;
    els.push(r(20,ay,W-40,78,C.surface,{cornerRadius:14,stroke:C.border,strokeWidth:1,shadow:'0 2px 12px rgba(139,107,50,0.05)'}));
    els.push(el(48-18,ay+39-18,18,18,C.goldBg2,{stroke:C.border,strokeWidth:1}));
    els.push(t(41,ay+31,acc.icon,13,'400',C.gold));
    els.push(t(76,ay+16,acc.name,13,'600',C.text));
    els.push(t(76,ay+34,acc.type,9,'500',C.textDim,{letterSpacing:0.5}));
    const dc = acc.pos===true?C.forest2:acc.pos===false?C.rose:C.textDim;
    els.push(t(76,ay+52,acc.delta,10,'400',dc));
    els.push(t(W-28,ay+22,acc.bal,14,'600',C.text,{textAlign:'right'}));
    const arr = acc.pos===true?'↑':acc.pos===false?'↓':'→';
    els.push(t(W-28,ay+44,arr,15,'400',acc.pos===true?C.forest:acc.pos===false?C.rose:C.textDim,{textAlign:'right'}));
  });

  els.push(r(20,H-152,W-40,42,'none',{cornerRadius:12,stroke:C.border,strokeWidth:1.5,strokeDash:'5,5'}));
  els.push(t(W/2-50,H-136,'+ Link New Account',12,'500',C.gold,{textAlign:'center'}));

  els.push(...navBar(1));
  return {id:'screen-accounts', label:'Accounts', elements:els, width:W, height:H};
}

// ─── Screen 4: Moves / Transactions ──────────────────────────────────────────
function screenMoves() {
  const els = [];
  els.push(r(0,0,W,H,C.bg));
  els.push(...statusBar());

  els.push(t(20,52,'Money Moves',26,'600',C.text));
  els.push(t(20,82,'March 2026',12,'400',C.textDim));

  // In / Out summary
  els.push(r(20,104,W-40,64,C.surface,{cornerRadius:14,stroke:C.border,strokeWidth:1}));
  els.push(t(36,118,'IN',9,'700',C.textDim,{letterSpacing:2}));
  els.push(t(36,136,'+$64,500',18,'600',C.forest));
  els.push(ln(W/2,112,W/2,160,C.border,1));
  els.push(t(W/2+16,118,'OUT',9,'700',C.textDim,{letterSpacing:2}));
  els.push(t(W/2+16,136,'-$28,340',18,'600',C.rose));
  els.push(t(36,158,'Net +$36,160',10,'400',C.textDim));
  els.push(t(W-28,158,'Mar 1 – 28',10,'400',C.textDim,{textAlign:'right'}));

  // Spend categories
  els.push(t(20,182,'SPENDING',9,'700',C.textDim,{letterSpacing:2}));
  const cats = [
    {icon:'✈',label:'Travel & Experiences',amt:'-$8,200',pct:0.29,c:C.gold},
    {icon:'⬡',label:'Dining & Concierge',  amt:'-$4,800',pct:0.17,c:C.forest},
    {icon:'◉',label:'Services & Wellness', amt:'-$3,100',pct:0.11,c:C.gold2},
    {icon:'◻',label:'Property & Utilities',amt:'-$6,400',pct:0.23,c:C.textDim},
    {icon:'✦',label:'Other',               amt:'-$5,840',pct:0.20,c:C.roseBg},
  ];
  cats.forEach((cat,i) => {
    const cy = 200+i*42;
    els.push(t(22,cy+5,cat.icon,13,'400',cat.c));
    els.push(t(46,cy+4,cat.label,12,'500',C.text));
    els.push(t(W-28,cy+4,cat.amt,11,'500',C.rose,{textAlign:'right'}));
    els.push(r(46,cy+22,220,5,C.bg2,{cornerRadius:3}));
    els.push(r(46,cy+22,220*cat.pct,5,cat.c,{cornerRadius:3}));
  });

  // Recent txns
  els.push(t(20,414,'RECENT',9,'700',C.textDim,{letterSpacing:2}));
  const txns = [
    {name:'Nobu Tokyo',       sub:'Dining · Atlas Card',   amt:'-$680',   time:'2h ago',  pos:false},
    {name:'Dividend: AAPL',   sub:'Investment Income',      amt:'+$1,240', time:'Today',   pos:true},
    {name:'NetJets Charter',  sub:'Travel · Atlas Card',   amt:'-$4,200', time:'Yesterday',pos:false},
    {name:'JPM Advisory',     sub:'Wealth Management',     amt:'-$2,500', time:'Mar 27',  pos:false},
    {name:'RE Rental Income', sub:'Passive Income',        amt:'+$8,500', time:'Mar 25',  pos:true},
  ];
  txns.forEach((tx,i) => {
    const ty = 432+i*52;
    if(ty+46>H-90) return;
    els.push(r(20,ty,W-40,46,C.surface,{cornerRadius:12,stroke:C.border2,strokeWidth:1}));
    els.push(t(36,ty+10,tx.name,12,'600',C.text));
    els.push(t(36,ty+26,tx.sub,9,'400',C.textDim));
    els.push(t(W-28,ty+10,tx.amt,12,'600',tx.pos?C.forest:C.rose,{textAlign:'right'}));
    els.push(t(W-28,ty+26,tx.time,9,'400',C.textDim,{textAlign:'right'}));
  });

  els.push(...navBar(2));
  return {id:'screen-moves', label:'Moves', elements:els, width:W, height:H};
}

// ─── Screen 5: Goals ──────────────────────────────────────────────────────────
function screenGoals() {
  const els = [];
  els.push(r(0,0,W,H,C.bg));
  els.push(...statusBar());

  els.push(t(20,52,'Wealth Goals',26,'600',C.text));
  els.push(t(20,82,'3 of 5 goals on track',12,'400',C.textDim));

  // Priority goal - dark card
  els.push(r(20,104,W-40,148,C.black,{cornerRadius:18}));
  els.push(r(20,104,W-40,4,C.gold,{cornerRadius:2}));
  els.push(t(36,120,'PRIORITY',9,'700',C.gold,{letterSpacing:2}));
  els.push(t(36,140,'Lake Como Villa',20,'600',C.white));
  els.push(t(36,164,'$3.2M target · Q4 2028',11,'300','rgba(255,255,255,0.50)'));
  els.push(r(36,184,W-72,8,'rgba(255,255,255,0.10)',{cornerRadius:4}));
  els.push(r(36,184,(W-72)*0.67,8,C.gold,{cornerRadius:4}));
  els.push(t(36,198,'67% — $2,144,000 saved',10,'400','rgba(255,255,255,0.55)'));
  els.push(t(W-28,198,'Q2 2028 on current pace',10,'400','rgba(155,123,61,0.7)',{textAlign:'right'}));
  els.push(t(36,222,'✓ On track — ahead by ~2 quarters',10,'400','rgba(61,122,101,0.9)'));

  // Other goals
  const goals = [
    {name:'Early Retirement',  target:'$8M by 2034',    pct:0.53,status:'On Track',sc:C.forest,  sbg:C.forestBg},
    {name:'Art Collection',    target:'$500K by 2027',  pct:0.88,status:'Ahead',   sc:C.gold,    sbg:C.goldBg},
    {name:'Yacht Charter Fund',target:'$200K annual',   pct:0.40,status:'Behind',  sc:C.rose,    sbg:C.roseBg},
    {name:'Philanthropy',      target:'$1M by 2030',    pct:0.22,status:'On Track',sc:C.forest,  sbg:C.forestBg},
  ];
  goals.forEach((g,i) => {
    const gy = 266+i*88;
    if(gy+82>H-90) return;
    els.push(r(20,gy,W-40,80,C.surface,{cornerRadius:14,stroke:C.border,strokeWidth:1}));
    els.push(t(36,gy+14,g.name,14,'600',C.text));
    els.push(t(36,gy+32,g.target,10,'400',C.textDim));
    // Status badge
    const bw = g.status.length*6+18;
    els.push(r(W-28-bw,gy+14,bw,20,g.sbg,{cornerRadius:10}));
    els.push(t(W-28-bw+8,gy+19,g.status,9,'600',g.sc));
    // Progress
    els.push(r(36,gy+52,W-72,7,C.bg2,{cornerRadius:4}));
    els.push(r(36,gy+52,(W-72)*g.pct,7,g.sc,{cornerRadius:4}));
    els.push(t(36,gy+64,`${Math.round(g.pct*100)}%`,9,'600',g.sc));
  });

  els.push(...navBar(3));
  return {id:'screen-goals', label:'Goals', elements:els, width:W, height:H};
}

// ─── Screen 6: AI Concierge ──────────────────────────────────────────────────
function screenConcierge() {
  const els = [];
  els.push(r(0,0,W,H,C.bg));
  els.push(...statusBar());

  els.push(t(20,52,'AI Concierge',26,'600',C.text));
  els.push(t(20,82,'Your private financial advisor',12,'400',C.textDim));

  // AI identity card
  els.push(r(20,104,W-40,68,C.black,{cornerRadius:16}));
  els.push(el(52-20,140-20,20,20,'rgba(155,123,61,0.20)',{stroke:C.gold,strokeWidth:1.5}));
  els.push(t(43,132,'✦',17,'400',C.gold));
  els.push(t(84,116,'AURUM AI',11,'700',C.gold,{letterSpacing:2}));
  els.push(t(84,134,'Understands your complete wealth picture',10,'400','rgba(255,255,255,0.50)'));
  els.push(t(84,150,'End-to-end encrypted · Data never leaves your vault',9,'400','rgba(155,123,61,0.55)'));

  // Quick action chips
  els.push(t(20,186,'QUICK INSIGHTS',9,'700',C.textDim,{letterSpacing:2}));
  const qa = ['Rebalance Review','Tax-Loss Harvest','Monthly Summary','Estate Check'];
  qa.forEach((q,i) => {
    const qx = i%2===0?20:W/2+5;
    const qy = 202+Math.floor(i/2)*44;
    els.push(r(qx,qy,(W-50)/2,36,C.surface,{cornerRadius:10,stroke:C.border,strokeWidth:1}));
    els.push(t(qx+12,qy+12,q,11,'500',C.textMid));
  });

  // Chat messages
  const msgs = [
    {role:'user',text:'Should I rebalance given current equity valuations?'},
    {role:'ai',  text:'Your equity allocation at 48% is 3pts above target. I suggest trimming $120K into private credit for yield. Tax impact ~$18K.'},
    {role:'user',text:'What\'s the Villa timeline looking like?'},
    {role:'ai',  text:'At $52K/mo savings rate you hit $3.2M by Q2 2028 — two quarters ahead of schedule. Accelerate by $8K/mo to close by Q4 2027.'},
  ];

  let msgY = 298;
  msgs.forEach(m => {
    const isUser = m.role==='user';
    const chars = m.text.length;
    const lines = Math.ceil(chars/40);
    const bh = lines*15+22;
    const bx = isUser?48:20;
    const bw = W-68;
    els.push(r(bx, msgY, bw, bh, isUser?C.goldBg2:C.surface, {
      cornerRadius:12, stroke:C.border, strokeWidth:1
    }));
    const words = m.text.split(' ');
    let rows = ['']; let ri=0;
    words.forEach(w => {
      if((rows[ri]+w).length<42) rows[ri]+=(rows[ri]?(' '+w):w);
      else { ri++; rows[ri]=w; }
    });
    rows.forEach((row,li)=>{
      if(row) els.push(t(bx+12, msgY+10+li*15, row, 10, '400', isUser?C.textMid:C.text));
    });
    msgY+=bh+8;
  });

  // Input bar
  if(msgY<H-100) {
    els.push(r(20,H-106,W-40,42,C.surface,{cornerRadius:21,stroke:C.border,strokeWidth:1.5}));
    els.push(t(44,H-90,'Ask about your wealth...',12,'400',C.textFaint));
    els.push(el(W-36-16,H-85-16,16,16,C.gold));
    els.push(t(W-43,H-93,'↑',13,'700',C.white));
  }

  els.push(...navBar(4));
  return {id:'screen-concierge', label:'AI Guide', elements:els, width:W, height:H};
}

// ─── Assemble & write ─────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'AURUM — Personal Wealth Intelligence',
  description: 'Premium wealth intelligence app. LIGHT theme — warm ivory, antique gold, forest green. Inspired by Atlas Card (godly.website) and Midday.ai (darkmodedesign.com). Trend: luxury fintech moving from cold blue to warm editorial palettes.',
  author: 'RAM Design Heartbeat',
  createdAt: new Date().toISOString(),
  screens: [
    screenSplash(),
    screenOverview(),
    screenAccounts(),
    screenMoves(),
    screenGoals(),
    screenConcierge(),
  ],
};

fs.writeFileSync('aurum.pen', JSON.stringify(pen, null, 2));
const totalEls = pen.screens.reduce((s,sc)=>s+sc.elements.length,0);
console.log(`✓ aurum.pen written — ${pen.screens.length} screens, ${totalEls} elements`);
