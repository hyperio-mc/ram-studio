'use strict';
const fs = require('fs'), path = require('path');

const SLUG      = 'hilt';
const NAME      = 'HILT';
const TAGLINE   = 'Get a grip on your wealth';
const HEARTBEAT = 395;

// Palette — Deep Navy Wealth OS (DARK)
// Inspired by: darkmodedesign.com Revolut 3D mockup style + deep navy finance apps
//              scrnshts.club "bento interior" pattern — unequal grid cells per screen
//              godly.website bento grid showcase — one idea per cell, exaggerated corners
const BG      = '#080F1C';   // near-midnight navy
const SURF    = '#0D1830';   // deep navy surface
const CARD    = '#111F3A';   // elevated card
const CARD2   = '#162848';   // higher elevation
const ACC     = '#D4A843';   // old gold / amber
const ACC2    = '#4DB6AC';   // cool teal (secondary)
const RED     = '#E05C5C';   // loss indicator
const GREEN   = '#56C97B';   // gain indicator
const TEXT    = '#E8ECF4';   // off-white text
const MUTED   = 'rgba(232,236,244,0.45)';
const DIVIDER = 'rgba(212,168,67,0.15)';
const GLOW    = 'rgba(212,168,67,0.08)';

const W = 390, H = 844;

// ── Primitives ─────────────────────────────────────────────────────────────
function rect(x,y,w,h,fill,opts={}) {
  return { type:'rect', x, y, width:w, height:h, fill,
    rx: opts.rx||0, opacity: opts.opacity!=null?opts.opacity:1,
    stroke: opts.stroke||'none', strokeWidth: opts.sw||0 };
}
function text(x,y,content,size,fill,opts={}) {
  return { type:'text', x, y, content:String(content), fontSize:size, fill,
    fontWeight: opts.fw||'400', fontFamily: opts.font||'Inter',
    textAnchor: opts.anchor||'start', letterSpacing: opts.ls||'0',
    opacity: opts.opacity!=null?opts.opacity:1 };
}
function circle(cx,cy,r,fill,opts={}) {
  return { type:'circle', cx, cy, r, fill,
    opacity: opts.opacity!=null?opts.opacity:1,
    stroke: opts.stroke||'none', strokeWidth: opts.sw||0 };
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  return { type:'line', x1, y1, x2, y2, stroke,
    strokeWidth: opts.sw||1, opacity: opts.opacity!=null?opts.opacity:1 };
}
function pill(x,y,w,h,fill,opts={}) { return rect(x,y,w,h,fill,{...opts,rx:h/2}); }

// ── Status bar ──────────────────────────────────────────────────────────────
function statusBar(els, time='9:41') {
  els.push(rect(0,0,W,44,BG));
  els.push(text(20,28,time,14,TEXT,{fw:'600'}));
  els.push(text(W-20,28,'●●●',12,MUTED,{anchor:'end',ls:'4px'}));
}

// ── Nav bar ─────────────────────────────────────────────────────────────────
function navBar(els, active=0) {
  els.push(rect(0,H-80,W,80,SURF,{rx:0}));
  els.push(line(0,H-80,W,H-80,DIVIDER));
  const tabs = ['◈ Home','◉ Portfolio','⊕','◎ Markets','⊘ You'];
  const positions = [32,100,195,280,358];
  tabs.forEach((t,i)=>{
    const x = positions[i];
    const col = i===active ? ACC : MUTED;
    if(i===2) {
      // FAB-style center button
      els.push(circle(195,H-42,24,ACC));
      els.push(text(195,H-36,'+',22,'#080F1C',{anchor:'middle',fw:'700'}));
    } else {
      const icon = ['⌂','⬡','','◐','○'][i];
      const label = ['Home','Portfolio','','Markets','You'][i];
      els.push(text(x,H-50,icon,18,col,{anchor:'middle'}));
      els.push(text(x,H-28,label,10,col,{anchor:'middle'}));
    }
  });
}

// ── Bento card helper ────────────────────────────────────────────────────────
function bentoCard(els, x,y,w,h,opts={}) {
  const r = opts.radius || 16;
  els.push(rect(x,y,w,h,opts.fill||CARD,{rx:r,
    stroke: opts.border||DIVIDER, sw:1}));
  if(opts.glow) {
    els.push(rect(x,y,w,h,GLOW,{rx:r}));
  }
}

// ── Sparkline ────────────────────────────────────────────────────────────────
function sparkline(els, x,y,w,h,points,color) {
  const n = points.length;
  const minV = Math.min(...points), maxV = Math.max(...points);
  const range = maxV - minV || 1;
  const coords = points.map((v,i)=>({
    px: x + (i/(n-1))*w,
    py: y + h - ((v-minV)/range)*h
  }));
  for(let i=1;i<coords.length;i++){
    els.push(line(coords[i-1].px,coords[i-1].py,coords[i].px,coords[i].py,color,{sw:1.5}));
  }
}

// ── Donut ring ───────────────────────────────────────────────────────────────
function donutRing(els, cx,cy,r,sw,pct,color,bg) {
  // bg ring
  els.push(circle(cx,cy,r,bg,{stroke:DIVIDER,sw:sw}));
  // approximate arc as overlapping lines (SVG arc not primitives) 
  // Use multiple thin rect segments around circumference
  const total = 360;
  const filled = Math.round(pct * total);
  for(let deg=0; deg<filled; deg+=4) {
    const rad = (deg-90)*(Math.PI/180);
    const x1 = cx + (r-sw/2)*Math.cos(rad);
    const y1 = cy + (r-sw/2)*Math.sin(rad);
    const x2 = cx + (r+sw/2)*Math.cos(rad);
    const y2 = cy + (r+sw/2)*Math.sin(rad);
    els.push(line(x1,y1,x2,y2,color,{sw:2.5}));
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — DASHBOARD (bento grid)
// ════════════════════════════════════════════════════════════════════════════
function screen1() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  
  // Subtle background glow — top center
  els.push(circle(195,200,280,ACC,{opacity:0.04}));
  
  statusBar(els,'9:41');

  // Header row
  els.push(text(20,72,'Good morning,',14,MUTED));
  els.push(text(20,96,'Marcus',24,TEXT,{fw:'700'}));
  // avatar
  els.push(circle(W-36,80,20,CARD2));
  els.push(text(W-36,86,'M',14,ACC,{anchor:'middle',fw:'700'}));

  // ─── BENTO ROW 1: Full-width hero card ───
  const heroY = 112;
  bentoCard(els, 16, heroY, W-32, 140, {fill:CARD2, glow:true, radius:20});
  els.push(text(28, heroY+28, 'Net Worth', 12, MUTED));
  els.push(text(28, heroY+62, '$247,830', 36, TEXT, {fw:'800', font:'Inter'}));
  els.push(text(28, heroY+88, '↑ +$3,241  +1.32% today', 13, GREEN));
  // mini sparkline in hero card
  const sp1 = [42,44,41,46,48,45,50,49,52,55,53,57,60,58,62,64,61,66,68,65,70];
  sparkline(els, W-130, heroY+30, 100, 80, sp1, ACC);
  els.push(text(W-80, heroY+120, '30d chart', 10, MUTED, {anchor:'middle'}));

  // ─── BENTO ROW 2: 2-col ───
  const r2y = heroY + 152;
  // Left card: Investments
  bentoCard(els, 16, r2y, 174, 110, {fill:CARD, radius:16});
  els.push(text(28, r2y+24, 'Investments', 11, MUTED));
  els.push(text(28, r2y+50, '$184,200', 22, TEXT, {fw:'700'}));
  els.push(text(28, r2y+72, '↑ +2.4%', 12, GREEN));
  els.push(pill(28, r2y+86, 60, 18, 'rgba(86,201,123,0.15)', {rx:9}));
  els.push(text(58, r2y+99, 'Bull run', 10, GREEN, {anchor:'middle'}));

  // Right card: Savings
  bentoCard(els, 200, r2y, 174, 110, {fill:CARD, radius:16});
  els.push(text(212, r2y+24, 'Savings', 11, MUTED));
  els.push(text(212, r2y+50, '$63,630', 22, TEXT, {fw:'700'}));
  els.push(text(212, r2y+72, '↑ +0.4%', 12, GREEN));
  els.push(pill(212, r2y+86, 56, 18, 'rgba(77,182,172,0.15)', {rx:9}));
  els.push(text(240, r2y+99, 'HYSA', 10, ACC2, {anchor:'middle'}));

  // ─── BENTO ROW 3: 3-col micro stats ───
  const r3y = r2y + 122;
  const microW = 112, microH = 72;
  const microItems = [
    {label:'Monthly In',val:'+$8,400',col:GREEN},
    {label:'Monthly Out',val:'-$5,230',col:RED},
    {label:'Cash Flow',val:'+$3,170',col:ACC},
  ];
  microItems.forEach((m,i)=>{
    const mx = 16 + i*(microW+7);
    bentoCard(els, mx, r3y, microW, microH, {fill:CARD, radius:14});
    els.push(text(mx+10, r3y+22, m.label, 10, MUTED));
    els.push(text(mx+10, r3y+48, m.val, 14, m.col, {fw:'700'}));
  });

  // ─── BENTO ROW 4: Recent transactions + allocation ───
  const r4y = r3y + 84;
  // Left: recent transactions preview
  bentoCard(els, 16, r4y, 220, 140, {fill:CARD, radius:16});
  els.push(text(28, r4y+22, 'Recent', 11, MUTED));
  const txns = [
    {icon:'☕',name:'Blue Bottle',amt:'-$6.80',col:TEXT},
    {icon:'⛽',name:'Chevron',amt:'-$82.40',col:TEXT},
    {icon:'↑',name:'Dividend',amt:'+$124',col:GREEN},
  ];
  txns.forEach((t,i)=>{
    const ty = r4y + 42 + i*32;
    els.push(text(28, ty, t.icon, 14, MUTED));
    els.push(text(50, ty, t.name, 12, TEXT));
    els.push(text(228, ty, t.amt, 12, t.col, {anchor:'end',fw:'600'}));
  });

  // Right: allocation mini
  bentoCard(els, 248, r4y, 126, 140, {fill:CARD, radius:16});
  els.push(text(311, r4y+22, 'Allocation', 11, MUTED, {anchor:'middle'}));
  donutRing(els, 311, r4y+78, 36, 12, 0.74, ACC, CARD2);
  els.push(text(311, r4y+83, '74%', 13, TEXT, {anchor:'middle', fw:'700'}));
  els.push(text(311, r4y+97, 'Invested', 9, MUTED, {anchor:'middle'}));
  els.push(text(311, r4y+112, '26% cash', 9, MUTED, {anchor:'middle'}));

  navBar(els, 0);
  return { name: 'Dashboard', elements: els };
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — PORTFOLIO
// ════════════════════════════════════════════════════════════════════════════
function screen2() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  els.push(circle(300,150,200,ACC2,{opacity:0.04}));

  statusBar(els,'9:41');

  els.push(text(20,72,'Portfolio',22,TEXT,{fw:'800'}));
  els.push(text(20,96,'$184,200  ↑ +4.1% YTD',14,GREEN));

  // Segment tabs
  const tabs2 = ['All','Stocks','ETFs','Crypto'];
  tabs2.forEach((t,i)=>{
    const tx = 20+i*84;
    if(i===0) {
      els.push(pill(tx, 108, 54, 26, ACC, {rx:13}));
      els.push(text(tx+27, 126, t, 12, '#080F1C', {anchor:'middle',fw:'700'}));
    } else {
      els.push(pill(tx, 108, 54, 26, CARD, {rx:13}));
      els.push(text(tx+27, 126, t, 12, MUTED, {anchor:'middle'}));
    }
  });

  // Holdings list
  const holdings = [
    {sym:'AAPL',name:'Apple Inc.',shares:'42 sh',val:'$9,240',chg:'+2.1%',col:GREEN,pct:0.82},
    {sym:'VTI', name:'Vanguard Total',shares:'180 sh',val:'$38,520',chg:'+1.8%',col:GREEN,pct:0.76},
    {sym:'NVDA',name:'NVIDIA',shares:'15 sh',val:'$14,850',chg:'+4.3%',col:GREEN,pct:0.90},
    {sym:'BRK.B',name:'Berkshire B',shares:'88 sh',val:'$31,240',chg:'+0.5%',col:GREEN,pct:0.55},
    {sym:'MSFT',name:'Microsoft',shares:'28 sh',val:'$11,032',chg:'-0.3%',col:RED,pct:0.48},
    {sym:'BTC', name:'Bitcoin',shares:'0.42 BTC',val:'$26,460',chg:'+5.1%',col:GREEN,pct:0.95},
  ];

  holdings.forEach((h,i)=>{
    const hy = 148 + i*84;
    bentoCard(els, 16, hy, W-32, 74, {fill:CARD, radius:14});
    
    // Symbol badge
    els.push(rect(28, hy+16, 44, 44, CARD2, {rx:10}));
    els.push(text(50, hy+43, h.sym.length<=3?h.sym:h.sym.slice(0,3), 11, ACC, {anchor:'middle',fw:'700',ls:'-0.5px'}));
    
    // Name and shares
    els.push(text(84, hy+28, h.name, 13, TEXT, {fw:'600'}));
    els.push(text(84, hy+48, h.shares, 11, MUTED));
    
    // Value and change
    els.push(text(W-28, hy+28, h.val, 14, TEXT, {anchor:'end',fw:'700'}));
    els.push(text(W-28, hy+48, h.chg, 12, h.col, {anchor:'end'}));
    
    // Performance bar
    els.push(rect(84, hy+60, W-116, 4, CARD2, {rx:2}));
    els.push(rect(84, hy+60, (W-116)*h.pct, 4, h.col, {rx:2, opacity:0.7}));
  });

  navBar(els, 1);
  return { name: 'Portfolio', elements: els };
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — ANALYTICS
// ════════════════════════════════════════════════════════════════════════════
function screen3() {
  const els = [];
  els.push(rect(0,0,W,H,BG));

  statusBar(els,'9:41');
  els.push(text(20,72,'Analytics',22,TEXT,{fw:'800'}));

  // Time range selector
  const ranges = ['1W','1M','3M','6M','YTD','1Y'];
  ranges.forEach((r,i)=>{
    const rx = 20 + i*58;
    if(i===3) {
      els.push(pill(rx,94,40,22,ACC,{rx:11}));
      els.push(text(rx+20,110,r,11,'#080F1C',{anchor:'middle',fw:'700'}));
    } else {
      els.push(text(rx+20,110,r,11,MUTED,{anchor:'middle'}));
    }
  });

  // Large chart area
  bentoCard(els, 16, 124, W-32, 200, {fill:CARD, radius:18});
  const chartData = [88,84,87,82,85,90,88,92,89,95,93,97,94,100,98,102,99,104,108,105,110,107,112,115,113,118,116,121,119,124];
  const lossData  = [88,84,87,82,85,90,88,92,89,95]; // first part lower
  
  // Y-axis labels
  const yLabels = ['$180K','$200K','$220K','$240K'];
  yLabels.forEach((l,i)=>{
    const ly = 295 - i*48;
    els.push(text(28, ly, l, 9, MUTED));
    els.push(line(70, ly, W-26, ly, DIVIDER, {sw:0.5}));
  });

  // Chart line (performance)
  const chartX = 76, chartW = W-100, chartH = 150, chartY2 = 296;
  const minC = Math.min(...chartData), maxC = Math.max(...chartData);
  const rangeC = maxC-minC;
  const cCoords = chartData.map((v,i)=>({
    px: chartX + (i/(chartData.length-1))*chartW,
    py: chartY2 - ((v-minC)/rangeC)*chartH
  }));
  for(let i=1;i<cCoords.length;i++){
    els.push(line(cCoords[i-1].px,cCoords[i-1].py,cCoords[i].px,cCoords[i].py, ACC, {sw:2}));
  }
  // Endpoint dot
  const last = cCoords[cCoords.length-1];
  els.push(circle(last.px, last.py, 5, ACC));
  els.push(circle(last.px, last.py, 9, ACC, {opacity:0.2}));

  // X-axis labels
  const xLabels = ['Oct','Nov','Dec','Jan','Feb','Mar'];
  xLabels.forEach((l,i)=>{
    els.push(text(chartX + i*(chartW/5), 320, l, 9, MUTED, {anchor:'middle'}));
  });

  // Stats row
  const statsY = 336;
  const stats = [
    {label:'Total Gain',val:'+$36,082',col:GREEN},
    {label:'Return',val:'+24.4%',col:GREEN},
    {label:'Best Day',val:'+$2,840',col:GREEN},
    {label:'Worst Day',val:'-$3,210',col:RED},
  ];
  stats.forEach((s,i)=>{
    const sx = 16 + i*93;
    bentoCard(els, sx, statsY, 85, 70, {fill:CARD, radius:14});
    els.push(text(sx+42, statsY+24, s.label, 9, MUTED, {anchor:'middle'}));
    els.push(text(sx+42, statsY+48, s.val, 13, s.col, {anchor:'middle',fw:'700'}));
  });

  // Benchmark comparison
  const benchY = statsY + 84;
  bentoCard(els, 16, benchY, W-32, 120, {fill:CARD, radius:16});
  els.push(text(28, benchY+26, 'vs. Benchmarks', 13, TEXT, {fw:'600'}));
  
  const benchItems = [
    {name:'Your Portfolio',pct:24.4,col:ACC},
    {name:'S&P 500',pct:18.2,col:ACC2},
    {name:'NASDAQ',pct:21.7,col:MUTED},
  ];
  benchItems.forEach((b,i)=>{
    const by = benchY+50+i*26;
    els.push(text(28, by, b.name, 11, b.name==='Your Portfolio'?TEXT:MUTED));
    const barW = (W-100)*(b.pct/30);
    els.push(rect(150, by-12, W-170, 14, CARD2, {rx:7}));
    els.push(rect(150, by-12, barW, 14, b.col, {rx:7, opacity:0.8}));
    els.push(text(W-28, by, `+${b.pct}%`, 11, b.col, {anchor:'end',fw:'600'}));
  });

  // Insights teaser
  const insY = benchY + 132;
  bentoCard(els, 16, insY, W-32, 68, {fill:CARD, glow:true, radius:16});
  els.push(circle(44, insY+34, 18, ACC, {opacity:0.15}));
  els.push(text(44, insY+39, '◈', 16, ACC, {anchor:'middle'}));
  els.push(text(72, insY+26, 'Smart Insight', 12, ACC, {fw:'600'}));
  els.push(text(72, insY+44, 'On pace to exceed last year\'s gains by 8%', 11, MUTED));

  navBar(els, 0);
  return { name: 'Analytics', elements: els };
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — TRANSACTIONS
// ════════════════════════════════════════════════════════════════════════════
function screen4() {
  const els = [];
  els.push(rect(0,0,W,H,BG));

  statusBar(els,'9:41');
  els.push(text(20,72,'Transactions',22,TEXT,{fw:'800'}));
  
  // Search bar
  bentoCard(els, 16, 84, W-32, 44, {fill:CARD, radius:22});
  els.push(text(44, 112, '⌕', 16, MUTED));
  els.push(text(66, 112, 'Search transactions...', 13, MUTED));

  // Category filter chips
  const cats = ['All','Food','Transport','Income','Invest'];
  let chipX = 16;
  cats.forEach((c,i)=>{
    const cw = c.length*8+24;
    if(i===0) {
      els.push(pill(chipX, 138, cw, 26, ACC, {rx:13}));
      els.push(text(chipX+cw/2, 156, c, 12, '#080F1C', {anchor:'middle',fw:'700'}));
    } else {
      els.push(pill(chipX, 138, cw, 26, CARD, {rx:13}));
      els.push(text(chipX+cw/2, 156, c, 12, MUTED, {anchor:'middle'}));
    }
    chipX += cw+8;
  });

  // Transaction groups
  const groups = [
    { date: 'Today', txns: [
      {icon:'☕',cat:'Food & Drink',name:'Blue Bottle Coffee',loc:'Castro St',amt:'-$6.80',col:TEXT},
      {icon:'🎵',cat:'Entertainment',name:'Spotify Premium',loc:'Subscription',amt:'-$9.99',col:TEXT},
    ]},
    { date: 'Yesterday', txns: [
      {icon:'↑',cat:'Investment',name:'AAPL Dividend',loc:'Brokerage',amt:'+$124.00',col:GREEN},
      {icon:'⛽',cat:'Transport',name:'Chevron Gas',loc:'Market St',amt:'-$82.40',col:TEXT},
      {icon:'🛒',cat:'Groceries',name:'Trader Joe\'s',loc:'Valencia St',amt:'-$67.23',col:TEXT},
    ]},
    { date: 'Apr 6', txns: [
      {icon:'💼',cat:'Income',name:'Salary Deposit',loc:'Direct Deposit',amt:'+$4,200',col:GREEN},
    ]},
  ];

  let gy = 174;
  groups.forEach(g=>{
    els.push(text(20, gy, g.date, 11, MUTED, {fw:'600', ls:'0.5px'}));
    gy += 22;
    g.txns.forEach(t=>{
      bentoCard(els, 16, gy, W-32, 64, {fill:CARD, radius:14});
      // Icon bubble
      els.push(circle(50, gy+32, 20, CARD2));
      els.push(text(50, gy+38, t.icon, 15, TEXT, {anchor:'middle'}));
      // Details
      els.push(text(80, gy+24, t.name, 13, TEXT, {fw:'600'}));
      els.push(text(80, gy+44, t.loc, 11, MUTED));
      // Amount
      els.push(text(W-28, gy+24, t.amt, 14, t.col, {anchor:'end',fw:'700'}));
      els.push(text(W-28, gy+44, t.cat, 10, MUTED, {anchor:'end'}));
      gy += 72;
    });
    gy += 12;
  });

  navBar(els, 0);
  return { name: 'Transactions', elements: els };
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — MARKETS WATCHLIST
// ════════════════════════════════════════════════════════════════════════════
function screen5() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  els.push(circle(80,300,220,RED,{opacity:0.03}));

  statusBar(els,'9:41');
  els.push(text(20,72,'Markets',22,TEXT,{fw:'800'}));
  els.push(text(20,96,'Apr 8, 2026  •  NYSE Open',12,MUTED));

  // Market pulse bar
  bentoCard(els, 16, 108, W-32, 56, {fill:CARD, radius:16});
  const pulseItems = [
    {name:'S&P 500',val:'5,482',chg:'+0.82%',col:GREEN},
    {name:'NASDAQ',val:'17,241',chg:'+1.14%',col:GREEN},
    {name:'DOW',val:'41,890',chg:'-0.21%',col:RED},
    {name:'VIX',val:'14.2',chg:'-3.1%',col:GREEN},
  ];
  pulseItems.forEach((p,i)=>{
    const px = 28 + i*90;
    els.push(text(px, 130, p.name, 9, MUTED));
    els.push(text(px, 148, p.val, 12, TEXT, {fw:'700'}));
    els.push(text(px+40, 148, p.chg, 10, p.col, {anchor:'end'}));
  });

  els.push(text(20, 182, 'Watchlist', 14, TEXT, {fw:'700'}));

  // Watchlist items with sparklines
  const watchItems = [
    {sym:'NVDA',name:'NVIDIA',price:'$989.80',chg:'+4.3%',chg$:'+$40.72',col:GREEN,sp:[82,80,84,82,87,85,90,88,93,91,96,94,98,97,100]},
    {sym:'TSLA',name:'Tesla',price:'$241.60',chg:'-1.2%',chg$:'-$2.94',col:RED,sp:[100,98,97,99,96,94,95,93,92,94,91,90,92,91,89]},
    {sym:'META',name:'Meta',price:'$542.30',chg:'+2.7%',chg$:'+$14.26',col:GREEN,sp:[78,80,79,82,81,84,83,87,85,88,87,90,88,92,91]},
    {sym:'AMZN',name:'Amazon',price:'$193.40',chg:'+0.9%',chg$:'+$1.73',col:GREEN,sp:[88,87,89,88,90,89,91,90,92,91,93,92,94,93,95]},
    {sym:'GOOGL',name:'Alphabet',price:'$176.50',chg:'-0.4%',chg$:'-$0.71',col:RED,sp:[95,94,96,95,94,96,95,94,93,95,94,93,94,93,92]},
    {sym:'BTC',name:'Bitcoin',price:'$63,000',chg:'+5.1%',chg$:'+$3,060',col:GREEN,sp:[60,64,62,68,65,72,68,75,71,78,74,82,78,86,90]},
  ];

  watchItems.forEach((w,i)=>{
    const wy = 196 + i*82;
    bentoCard(els, 16, wy, W-32, 72, {fill:CARD, radius:14});
    
    // Symbol
    els.push(rect(28, wy+14, 44, 44, CARD2, {rx:10}));
    els.push(text(50, wy+41, w.sym.length<=3?w.sym:w.sym.slice(0,3), 10, ACC, {anchor:'middle',fw:'700',ls:'-0.5px'}));
    
    els.push(text(84, wy+26, w.name, 13, TEXT, {fw:'600'}));
    els.push(text(84, wy+46, w.chg$, 11, w.col));
    
    // Mini sparkline
    sparkline(els, W-140, wy+18, 80, 36, w.sp, w.col);
    
    els.push(text(W-28, wy+26, w.price, 14, TEXT, {anchor:'end',fw:'700'}));
    els.push(text(W-28, wy+46, w.chg, 12, w.col, {anchor:'end',fw:'600'}));
  });

  navBar(els, 3);
  return { name: 'Markets', elements: els };
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 6 — PROFILE & SETTINGS
// ════════════════════════════════════════════════════════════════════════════
function screen6() {
  const els = [];
  els.push(rect(0,0,W,H,BG));

  statusBar(els,'9:41');
  els.push(text(20,72,'Profile',22,TEXT,{fw:'800'}));

  // User card
  bentoCard(els, 16, 88, W-32, 110, {fill:CARD2, glow:true, radius:20});
  els.push(circle(60, 143, 36, CARD));
  els.push(text(60, 149, 'M', 22, ACC, {anchor:'middle',fw:'800'}));
  els.push(text(108, 128, 'Marcus Chen', 18, TEXT, {fw:'700'}));
  els.push(text(108, 150, 'marcus@icloud.com', 12, MUTED));
  els.push(pill(108, 162, 80, 22, 'rgba(212,168,67,0.15)', {rx:11}));
  els.push(text(148, 177, '⭐ Gold Tier', 11, ACC, {anchor:'middle'}));

  // Wealth score card
  bentoCard(els, 16, 210, W-32, 80, {fill:CARD, radius:16});
  els.push(text(28, 232, 'Wealth Score', 13, MUTED));
  els.push(text(28, 262, '847', 30, TEXT, {fw:'800'}));
  // score bar
  els.push(rect(120, 232, 220, 10, CARD2, {rx:5}));
  els.push(rect(120, 232, 220*0.847, 10, ACC, {rx:5}));
  els.push(text(340, 232, 'Excellent', 11, ACC, {anchor:'end'}));
  els.push(text(120, 260, 'Based on savings rate, diversification & growth', 11, MUTED));

  // Stats grid
  const statGrid = [
    {label:'Member Since',val:'Mar 2022'},
    {label:'Total Trades',val:'847'},
    {label:'Watchlists',val:'3'},
    {label:'Alerts Active',val:'12'},
  ];
  statGrid.forEach((s,i)=>{
    const sx = 16 + (i%2)*187;
    const sy = 302 + Math.floor(i/2)*78;
    bentoCard(els, sx, sy, 179, 68, {fill:CARD, radius:14});
    els.push(text(sx+12, sy+24, s.label, 11, MUTED));
    els.push(text(sx+12, sy+50, s.val, 16, TEXT, {fw:'700'}));
  });

  // Settings list
  const settingsY = 462;
  els.push(text(20, settingsY, 'Settings', 14, MUTED, {fw:'600', ls:'0.5px'}));
  const settings = [
    {icon:'🔔',label:'Notifications',sub:'Alerts & price targets'},
    {icon:'🔒',label:'Privacy & Security',sub:'Biometrics, 2FA'},
    {icon:'🏦',label:'Linked Accounts',sub:'Chase, Robinhood, Coinbase'},
    {icon:'◈', label:'Hilt Premium',sub:'$4.99/mo · Renews Apr 15'},
    {icon:'⬡', label:'Export Data',sub:'CSV, PDF statements'},
  ];
  settings.forEach((s,i)=>{
    const sy = settingsY + 22 + i*62;
    bentoCard(els, 16, sy, W-32, 52, {fill:CARD, radius:14});
    els.push(circle(50, sy+26, 18, CARD2));
    els.push(text(50, sy+31, s.icon, 13, ACC, {anchor:'middle'}));
    els.push(text(78, sy+19, s.label, 13, TEXT, {fw:'600'}));
    els.push(text(78, sy+37, s.sub, 11, MUTED));
    els.push(text(W-28, sy+28, '›', 18, MUTED, {anchor:'end'}));
  });

  navBar(els, 4);
  return { name: 'Profile', elements: els };
}

// ════════════════════════════════════════════════════════════════════════════
// BUILD PEN FILE
// ════════════════════════════════════════════════════════════════════════════
const screens = [screen1(),screen2(),screen3(),screen4(),screen5(),screen6()];
const totalElements = screens.reduce((a,s)=>a+s.elements.length,0);

const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    tagline: TAGLINE,
    author: 'RAM',
    date: new Date().toISOString().slice(0,10),
    theme: 'dark',
    palette: { bg:BG, surface:SURF, card:CARD, accent:ACC, accent2:ACC2, text:TEXT },
    heartbeat: HEARTBEAT,
    elements: totalElements,
    screens: screens.length,
    inspiration: 'darkmodedesign.com Revolut 3D navy + scrnshts.club bento interior pattern + godly.website bento grid',
  },
  screens: screens.map(s=>({
    name: s.name,
    width: W,
    height: H,
    elements: s.elements,
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
