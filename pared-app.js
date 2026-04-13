'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG    = 'pared';
const NAME    = 'PARED';
const TAGLINE = 'personal finance, stripped bare';
const HEARTBEAT = 102;

// ─── Palette ─────────────────────────────────────────────
// Inspired by Minimal Gallery / ProtoEditions:
// warm off-white, near-black, single vibrant lime accent
const P = {
  bg:      '#F8F6F2',   // warm off-white canvas
  surf:    '#FFFFFF',   // card surface
  card:    '#EEEBe6',   // barely-there card tint
  text:    '#1A1818',   // warm near-black
  muted:   '#7A7875',   // muted warm gray
  dim:     '#B8B5B0',   // dimmer divider gray
  accent:  '#AAFB5C',   // vibrant lime — the single chromatic pop (from ProtoEditions #c7fb85 spirit)
  accent2: '#3D3B38',   // dark warm mid-tone for secondary elements
  neg:     '#E05A5A',   // soft red for negative values
  pos:     '#3DAE7C',   // forest green for positive values
};

const W = 390;
const H = 844;

// ─── Primitives ───────────────────────────────────────────
let eid = 0;
function rect(x,y,w,h,fill,opts={}) {
  return { id:`e${++eid}`, type:'rect', x,y,w,h,fill,
    rx: opts.rx??0, opacity: opts.opacity??1,
    stroke: opts.stroke??'none', strokeWidth: opts.sw??1 };
}
function text(x,y,content,size,fill,opts={}) {
  return { id:`e${++eid}`, type:'text', x,y,content,fontSize:size,fill,
    fontWeight: opts.fw??400, fontFamily: opts.font??'Inter',
    textAnchor: opts.anchor??'start', letterSpacing: opts.ls??0,
    opacity: opts.opacity??1 };
}
function circle(cx,cy,r,fill,opts={}) {
  return { id:`e${++eid}`, type:'circle', cx,cy,r,fill,
    opacity: opts.opacity??1, stroke: opts.stroke??'none', strokeWidth: opts.sw??1 };
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  return { id:`e${++eid}`, type:'line', x1,y1,x2,y2,stroke,
    strokeWidth: opts.sw??1, opacity: opts.opacity??1 };
}
function pill(x,y,w,h,fill,opts={}) {
  return rect(x,y,w,h,fill,{...opts, rx: h/2});
}

// ─── Shared Components ────────────────────────────────────

function statusBar(els) {
  els.push(rect(0,0,W,44,P.surf));
  els.push(text(16,28,'9:41',13,P.text,{fw:600,font:'SF Pro Display'}));
  els.push(text(340,28,'●●●',11,P.muted,{anchor:'end'}));
  els.push(text(370,28,'⌁',13,P.muted,{anchor:'end'}));
}

function bottomNav(els, active) {
  const tabs = [
    { id:'home',    label:'Portfolio', icon:'◈', x:48  },
    { id:'alloc',   label:'Allocate',  icon:'◎', x:130 },
    { id:'txn',     label:'Activity',  icon:'≡', x:212 },
    { id:'insight', label:'Insights',  icon:'◇', x:294 },
    { id:'goals',   label:'Goals',     icon:'◉', x:370-24 },
  ];
  // nav bar
  els.push(rect(0,H-82,W,82,P.surf));
  els.push(line(0,H-82,W,H-82,P.dim,{sw:0.5}));
  for (const t of tabs) {
    const isActive = t.id === active;
    const col = isActive ? P.text : P.muted;
    // active indicator — lime pill above icon
    if (isActive) els.push(pill(t.x-14,H-79,28,3,P.accent));
    els.push(text(t.x,H-52,t.icon,16,col,{anchor:'middle',fw:isActive?700:400}));
    els.push(text(t.x,H-35,t.label,9,col,{anchor:'middle',fw:isActive?600:400}));
  }
}

// thin divider
function divider(y,els) {
  els.push(line(16,y,W-16,y,P.dim,{sw:0.5,opacity:0.6}));
}

// ─── Screen 1 — Portfolio ─────────────────────────────────
function screenPortfolio() {
  const els = [];
  statusBar(els);

  // Header
  els.push(text(20,72,'PARED',11,P.muted,{fw:600,ls:3}));
  els.push(text(20,98,'Portfolio',28,P.text,{fw:700}));
  els.push(text(W-20,78,'Apr 2026',11,P.muted,{anchor:'end'}));

  // Net worth hero block
  els.push(rect(16,114,W-32,96,P.card,{rx:3}));
  els.push(text(32,138,'Net Worth',10,P.muted,{fw:500,ls:1}));
  els.push(text(32,170,'$142,816',34,P.text,{fw:300,font:'Inter'}));
  // change badge
  els.push(pill(32,178,68,20,P.accent));
  els.push(text(66,191,'+8.4% YTD',10,P.text,{anchor:'middle',fw:600}));
  els.push(text(W-32,170,'vs last month',10,P.muted,{anchor:'end'}));
  els.push(text(W-32,183,'+$2,140',12,P.pos,{anchor:'end',fw:600}));

  // Sparkline area (mini chart)
  const sparkY = [222,218,225,212,208,215,205,198,202,195,199,192,196,188,192];
  const sparkBase = 240;
  const sW = W-32;
  const step = sW / (sparkY.length-1);
  // area fill (rects approximate)
  for (let i=0;i<sparkY.length-1;i++) {
    const x1=16+i*step, x2=16+(i+1)*step;
    const y1=sparkY[i], y2=sparkY[i+1];
    const top=Math.min(y1,y2);
    const bot=sparkBase;
    els.push(rect(x1,top,x2-x1+1,bot-top,P.card,{opacity:0.8}));
  }
  // sparkline
  for (let i=0;i<sparkY.length-1;i++) {
    const x1=16+i*step, x2=16+(i+1)*step;
    els.push(line(x1,sparkY[i],x2,sparkY[i+1],P.accent2,{sw:1.5}));
  }
  // end dot
  els.push(circle(16+(sparkY.length-1)*step,sparkY[sparkY.length-1],3,P.accent));

  // Holdings header
  els.push(text(20,262,'Holdings',13,P.text,{fw:600}));
  els.push(text(W-20,262,'6 assets',11,P.muted,{anchor:'end'}));
  divider(272,els);

  // Holdings list
  const holdings = [
    { ticker:'AAPL', name:'Apple Inc.',      alloc:28, val:'$39,988', chg:'+1.2%', up:true  },
    { ticker:'BTC',  name:'Bitcoin',          alloc:22, val:'$31,420', chg:'+4.7%', up:true  },
    { ticker:'VWCE', name:'Vanguard FTSE',   alloc:19, val:'$27,135', chg:'+0.8%', up:true  },
    { ticker:'TSLA', name:'Tesla Inc.',       alloc:14, val:'$19,994', chg:'-2.1%', up:false },
    { ticker:'MSFT', name:'Microsoft Corp.', alloc:11, val:'$15,710', chg:'+0.4%', up:true  },
    { ticker:'CASH', name:'Cash & Equiv.',   alloc:6,  val:'$8,569',  chg:'—',    up:true  },
  ];

  let hy = 280;
  for (const h of holdings) {
    // allocation bar (slim, left edge)
    const barW = (h.alloc/100)*(W-80);
    els.push(rect(16,hy+2,barW,3,P.dim,{rx:1.5,opacity:0.5}));
    els.push(rect(16,hy+2,barW*(h.alloc/30),3,P.accent2,{rx:1.5}));

    els.push(text(20,hy+20,h.ticker,13,P.text,{fw:700}));
    els.push(text(20,hy+34,h.name,10,P.muted));
    els.push(text(W-20,hy+20,h.val,13,P.text,{fw:500,anchor:'end'}));
    els.push(text(W-20,hy+34,h.chg,10,h.up?P.pos:P.neg,{anchor:'end',fw:500}));

    hy += 52;
    if (hy < H-90) divider(hy-6,els);
  }

  bottomNav(els,'home');

  return { name:'Portfolio', elements: els, svg: '' };
}

// ─── Screen 2 — Allocation ────────────────────────────────
function screenAllocation() {
  const els = [];
  statusBar(els);

  els.push(text(20,72,'PARED',11,P.muted,{fw:600,ls:3}));
  els.push(text(20,98,'Allocation',28,P.text,{fw:700}));

  // Donut chart (approximate with concentric circles + wedge rects)
  const cx = W/2, cy = 262, r=90, inner=58;
  els.push(circle(cx,cy,r,P.dim,{opacity:0.15}));
  // Segments as arcs approximated with layered circles + clipping rects
  // Segment 1: AAPL 28% — lime accent (top-right quarter-ish)
  els.push(circle(cx,cy,r,P.accent,{opacity:0.9}));
  els.push(rect(cx,cy-r-2,r+4,r+2,P.bg)); // mask top-right
  els.push(rect(cx-r-2,cy-r-2,r+4,r+r+4,P.bg,{opacity:0.0})); // keep left

  // Simplified: use arc slices as thick ring via stacked circles
  // Better approach: use colored wedge rects at center
  // Clear and draw simplified donuts
  els.length = 0;
  statusBar(els);
  els.push(text(20,72,'PARED',11,P.muted,{fw:600,ls:3}));
  els.push(text(20,98,'Allocation',28,P.text,{fw:700}));

  // Draw donut as overlapping arcs using line segments
  // Simple approach: N colored ring segments
  const segments = [
    { label:'Equities', pct:53, color:P.accent2 },
    { label:'Crypto',   pct:22, color:P.accent   },
    { label:'Bonds',    pct:15, color:P.dim       },
    { label:'Cash',     pct:10, color:P.muted     },
  ];

  // Donut via stacked rects in a circle pattern (simplified SVG approach)
  const DCX=W/2, DCY=250, DR=80, DI=52;
  // background ring
  els.push(circle(DCX,DCY,DR,P.dim,{opacity:0.2}));
  els.push(circle(DCX,DCY,DI,P.surf,{}));

  // Draw colored arc segments using thin rect wedges rotated
  // We'll use rect approximations placed around the ring
  let cumAngle = -90; // start top
  for (const seg of segments) {
    const angle = (seg.pct/100)*360;
    const midA = (cumAngle + angle/2) * Math.PI/180;
    const midX = DCX + (DR+DI)/2 * Math.cos(midA);
    const midY = DCY + (DR+DI)/2 * Math.sin(midA);
    // small colored block at midpoint of arc
    const blockW = DR-DI;
    // draw multiple thin rects along the arc
    const steps = Math.max(3,Math.round(angle/15));
    for (let s=0;s<steps;s++) {
      const a = (cumAngle + (s+0.5)*(angle/steps)) * Math.PI/180;
      const innerX = DCX + DI*Math.cos(a);
      const innerY = DCY + DI*Math.sin(a);
      const outerX = DCX + DR*Math.cos(a);
      const outerY = DCY + DR*Math.sin(a);
      els.push(line(innerX,innerY,outerX,outerY,seg.color,{sw:14,opacity:0.95}));
    }
    cumAngle += angle;
  }
  // inner white circle to create donut hole
  els.push(circle(DCX,DCY,DI,P.surf,{}));
  // center text
  els.push(text(DCX,DCY-6,'53%',18,P.text,{fw:700,anchor:'middle'}));
  els.push(text(DCX,DCY+10,'Equities',9,P.muted,{anchor:'middle'}));

  // Gap lines between segments
  cumAngle = -90;
  for (const seg of segments) {
    const a = cumAngle * Math.PI/180;
    els.push(line(DCX+DI*Math.cos(a),DCY+DI*Math.sin(a),
                  DCX+DR*Math.cos(a),DCY+DR*Math.sin(a),P.surf,{sw:2}));
    cumAngle += (seg.pct/100)*360;
  }

  // Legend
  let lx=20, ly=355;
  for (const seg of segments) {
    els.push(rect(lx,ly-9,10,10,seg.color,{rx:2}));
    els.push(text(lx+14,ly,seg.label,11,P.text,{fw:500}));
    els.push(text(lx+90,ly,seg.pct+'%',11,P.muted,{fw:400}));
    lx += 100;
    if (lx > W-80) { lx=20; ly+=22; }
  }

  // Breakdown cards
  divider(400,els);
  els.push(text(20,420,'Breakdown',13,P.text,{fw:600}));

  const breakdown = [
    { label:'US Equities',    val:'$58,240', chg:'+9.2%',  bar:0.53, up:true  },
    { label:'Crypto Assets',  val:'$31,420', chg:'+24.1%', bar:0.22, up:true  },
    { label:'Fixed Income',   val:'$21,390', chg:'-0.3%',  bar:0.15, up:false },
    { label:'Cash Reserves',  val:'$14,270', chg:'+0.5%',  bar:0.10, up:true  },
  ];
  let by = 438;
  for (const b of breakdown) {
    els.push(text(20,by,b.label,11,P.text,{fw:500}));
    els.push(text(W-20,by,b.val,11,P.text,{anchor:'end',fw:600}));
    // bar track
    const bw = W-40;
    els.push(rect(20,by+7,bw,3,P.card,{rx:1.5}));
    els.push(rect(20,by+7,bw*b.bar,3,P.accent,{rx:1.5}));
    els.push(text(20,by+24,b.chg,9,b.up?P.pos:P.neg,{fw:500}));
    by += 42;
    if (by < H-90) divider(by-8,els);
  }

  bottomNav(els,'alloc');
  return { name:'Allocation', elements: els, svg: '' };
}

// ─── Screen 3 — Activity ──────────────────────────────────
function screenActivity() {
  const els = [];
  statusBar(els);

  els.push(text(20,72,'PARED',11,P.muted,{fw:600,ls:3}));
  els.push(text(20,98,'Activity',28,P.text,{fw:700}));

  // Filter pills
  const filters = ['All','Buys','Sells','Dividends'];
  let fx = 20;
  for (let i=0;i<filters.length;i++) {
    const w = filters[i].length*6.5+16;
    const active = i===0;
    els.push(pill(fx,114,w,24,active?P.text:P.card));
    els.push(text(fx+w/2,130,filters[i],10,active?P.surf:P.muted,{anchor:'middle',fw:active?600:400}));
    fx += w+8;
  }

  // Monthly group header
  els.push(text(20,160,'This Month',10,P.muted,{fw:600,ls:1}));
  divider(168,els);

  const txns = [
    { type:'buy',  icon:'↑', ticker:'AAPL',  name:'Apple Inc.',  date:'Apr 10', amt:'-$3,240', shares:'+18 sh', col:P.text },
    { type:'div',  icon:'◈', ticker:'VWCE',  name:'Dividend',    date:'Apr 8',  amt:'+$124',   shares:'Q1 2026', col:P.pos  },
    { type:'sell', icon:'↓', ticker:'NVDA',  name:'Nvidia Corp.',date:'Apr 5',  amt:'+$5,800', shares:'-12 sh', col:P.pos  },
    { type:'buy',  icon:'↑', ticker:'BTC',   name:'Bitcoin',     date:'Apr 2',  amt:'-$1,500', shares:'+0.02',  col:P.text },
    { type:'buy',  icon:'↑', ticker:'MSFT',  name:'Microsoft',   date:'Apr 1',  amt:'-$890',   shares:'+3 sh',  col:P.text },
  ];

  let ty = 178;
  for (const t of txns) {
    // icon circle
    const icCol = t.type==='sell'?P.pos : t.type==='div'?P.accent : P.card;
    els.push(circle(36,ty+18,14,icCol,{}));
    els.push(text(36,ty+23,t.icon,10,t.type==='sell'?P.surf:t.type==='div'?P.text:P.muted,{anchor:'middle',fw:700}));

    els.push(text(58,ty+14,t.ticker,13,P.text,{fw:700}));
    els.push(text(58,ty+28,t.name,10,P.muted));
    els.push(text(W-20,ty+14,t.amt,13,t.col,{anchor:'end',fw:600}));
    els.push(text(W-20,ty+28,t.shares,10,P.muted,{anchor:'end'}));
    els.push(text(20,ty+42,t.date,9,P.dim,{fw:400}));

    ty += 56;
    if (ty < H-100) divider(ty-6,els);
  }

  // Previous month header
  if (ty < H-120) {
    els.push(text(20,ty+8,'Last Month',10,P.muted,{fw:600,ls:1}));
    divider(ty+16,els);
    const prev = [
      { type:'buy', icon:'↑', ticker:'TSLA', name:'Tesla Inc.', date:'Mar 28', amt:'-$2,100', shares:'+9 sh', col:P.text },
    ];
    let py = ty+24;
    for (const t of prev) {
      els.push(circle(36,py+18,14,P.card,{}));
      els.push(text(36,py+23,t.icon,10,P.muted,{anchor:'middle',fw:700}));
      els.push(text(58,py+14,t.ticker,13,P.text,{fw:700}));
      els.push(text(58,py+28,t.name,10,P.muted));
      els.push(text(W-20,py+14,t.amt,13,t.col,{anchor:'end',fw:600}));
      els.push(text(W-20,py+28,t.shares,10,P.muted,{anchor:'end'}));
    }
  }

  bottomNav(els,'txn');
  return { name:'Activity', elements: els, svg: '' };
}

// ─── Screen 4 — Insights ─────────────────────────────────
function screenInsights() {
  const els = [];
  statusBar(els);

  els.push(text(20,72,'PARED',11,P.muted,{fw:600,ls:3}));
  els.push(text(20,98,'Insights',28,P.text,{fw:700}));

  // Featured insight card — editorial large type
  els.push(rect(16,114,W-32,160,P.text,{rx:4}));
  els.push(text(30,138,'MARKET NOTE',8,P.accent,{fw:700,ls:2}));
  els.push(text(30,162,'Tech equities',20,P.surf,{fw:700}));
  els.push(text(30,182,'outperform by',20,P.surf,{fw:300}));
  els.push(text(30,202,'14.2% YTD',20,P.surf,{fw:700}));
  els.push(text(30,226,'Your portfolio beats benchmark',10,P.dim,{fw:400}));
  els.push(text(W-30,250,'Read more →',10,P.accent,{anchor:'end',fw:500}));

  // Stat row
  els.push(text(20,294,'Your Numbers',12,P.text,{fw:600}));
  divider(304,els);

  const stats = [
    { label:'Sharpe Ratio',  val:'1.42',  good:true  },
    { label:'Beta',          val:'0.87',  good:true  },
    { label:'Max Drawdown',  val:'-11.2%',good:false },
    { label:'Volatility',    val:'16.3%', good:null  },
  ];
  let sx = 16;
  const sw = (W-32)/2 - 4;
  let sy = 316;
  for (let i=0;i<stats.length;i++) {
    const s = stats[i];
    const col = s.good===true?P.pos : s.good===false?P.neg : P.muted;
    els.push(rect(sx,sy,sw,60,P.card,{rx:3}));
    els.push(text(sx+10,sy+18,s.label,9,P.muted,{fw:500}));
    els.push(text(sx+10,sy+42,s.val,18,col,{fw:700}));
    sx += sw+8;
    if (i%2===1) { sx=16; sy+=68; }
  }

  // Tips list
  sy += 8;
  els.push(text(20,sy+8,'Recommendations',12,P.text,{fw:600}));
  divider(sy+18,els);

  const tips = [
    { title:'Rebalance Crypto',    body:'BTC position exceeds target by 4.2%. Consider trimming.',  badge:'Action' },
    { title:'Dividend Reinvest',   body:'$124 VWCE dividend available to reinvest automatically.', badge:'Income' },
    { title:'Tax-Loss Harvest',    body:'TSLA position shows -$340 unrealised loss, offset gains.', badge:'Tax'    },
  ];
  let tiy = sy+28;
  for (const tip of tips) {
    if (tiy > H-100) break;
    els.push(pill(20,tiy,44,16,P.accent));
    els.push(text(42,tiy+11,tip.badge,8,P.text,{anchor:'middle',fw:600}));
    els.push(text(72,tiy+11,tip.title,11,P.text,{fw:600}));
    els.push(text(20,tiy+26,tip.body,10,P.muted));
    divider(tiy+38,els);
    tiy += 50;
  }

  bottomNav(els,'insight');
  return { name:'Insights', elements: els, svg: '' };
}

// ─── Screen 5 — Goals ─────────────────────────────────────
function screenGoals() {
  const els = [];
  statusBar(els);

  els.push(text(20,72,'PARED',11,P.muted,{fw:600,ls:3}));
  els.push(text(20,98,'Goals',28,P.text,{fw:700}));
  els.push(text(W-20,98,'+ Add',12,P.accent2,{anchor:'end',fw:500}));

  const goals = [
    { name:'House Deposit',  target:60000, saved:38400, deadline:'Dec 2026', icon:'⌂',  col:P.accent },
    { name:'Emergency Fund', target:20000, saved:18750, deadline:'Jul 2026',  icon:'◈',  col:P.pos    },
    { name:'Travel Fund',    target:8000,  saved:3200,  deadline:'Sep 2026',  icon:'◎',  col:P.muted  },
    { name:'Retirement',     target:500000,saved:142816,deadline:'2045',      icon:'◉',  col:P.accent2},
  ];

  let gy = 116;
  for (const g of goals) {
    const pct = Math.round(g.saved/g.target*100);
    const barW = W-32;

    els.push(rect(16,gy,W-32,88,P.surf,{rx:4}));
    // subtle border
    els.push(rect(16,gy,W-32,88,'none',{rx:4,stroke:P.dim,sw:0.5}));

    els.push(text(32,gy+22,g.icon,14,g.col,{fw:400}));
    els.push(text(52,gy+22,g.name,13,P.text,{fw:600}));
    els.push(text(W-32,gy+22,pct+'%',13,g.col,{anchor:'end',fw:700}));

    // progress bar
    els.push(rect(32,gy+34,barW-32,4,P.card,{rx:2}));
    els.push(rect(32,gy+34,(barW-32)*(pct/100),4,g.col,{rx:2}));

    els.push(text(32,gy+54,'$'+g.saved.toLocaleString(),11,P.text,{fw:600}));
    els.push(text(W-32,gy+54,'of $'+g.target.toLocaleString(),10,P.muted,{anchor:'end'}));
    els.push(text(32,gy+70,'Target '+g.deadline,9,P.muted));

    gy += 98;
    if (gy > H-90) break;
  }

  bottomNav(els,'goals');
  return { name:'Goals', elements: els, svg: '' };
}

// ─── Screen 6 — Onboarding / Welcome ─────────────────────
function screenOnboarding() {
  const els = [];
  // Full light background
  els.push(rect(0,0,W,H,P.bg));

  // Large editorial type
  els.push(text(W/2,200,'PARED',48,P.text,{fw:700,anchor:'middle',ls:6}));
  els.push(text(W/2,232,'personal finance,',16,P.muted,{fw:300,anchor:'middle'}));
  els.push(text(W/2,254,'stripped bare.',16,P.text,{fw:300,anchor:'middle'}));

  // Lime accent underline
  els.push(rect(W/2-50,262,100,3,P.accent,{rx:1.5}));

  // Value props — minimal, editorial style
  const props = [
    { num:'01', text:'Connect your brokers in one place'     },
    { num:'02', text:'See allocations without the noise'     },
    { num:'03', text:'Goals tracked, not gamified'           },
  ];
  let py = 310;
  for (const p of props) {
    divider(py-8,els);
    els.push(text(20,py+8,p.num,10,P.accent,{fw:700}));
    els.push(text(20,py+24,p.text,13,P.text,{fw:400}));
    py += 48;
  }

  divider(py+4,els);

  // CTA
  els.push(rect(20,H-140,W-40,48,P.text,{rx:4}));
  els.push(text(W/2,H-110,'Get started',15,P.surf,{anchor:'middle',fw:600}));

  els.push(text(W/2,H-54,'Already have an account?',11,P.muted,{anchor:'middle'}));
  els.push(text(W/2,H-36,'Sign in →',11,P.text,{anchor:'middle',fw:600}));

  // Status bar
  statusBar(els);

  return { name:'Onboarding', elements: els, svg: '' };
}

// ─── Assemble ─────────────────────────────────────────────
const screens = [
  screenOnboarding(),
  screenPortfolio(),
  screenAllocation(),
  screenActivity(),
  screenInsights(),
  screenGoals(),
];

const totalElements = screens.reduce((s,sc)=>s+sc.elements.length,0);

const pen = {
  version: '2.8',
  meta: {
    name: NAME,
    tagline: TAGLINE,
    slug: SLUG,
    theme: 'light',
    heartbeat: HEARTBEAT,
    archetype: 'personal-finance',
    date: new Date().toISOString().split('T')[0],
    author: 'RAM',
    elements: totalElements,
    palette: {
      bg: P.bg, surface: P.surf, card: P.card,
      accent: P.accent, accent2: P.accent2, text: P.text, muted: P.muted,
    },
    inspiration: 'Minimal Gallery / ProtoEditions — barely-there UI, warm off-white, single lime accent',
  },
  screens: screens.map(sc => ({
    name: sc.name,
    elements: sc.elements,
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
