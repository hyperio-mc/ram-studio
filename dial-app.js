'use strict';
const fs = require('fs'), path = require('path');

const SLUG = 'dial';
const W = 390, H = 844;

// ─── PALETTE — Bloomberg Terminal × AI Glow  ─────────────────────────────────
// Inspired by: godly.website (Sci-Fi / Bloomberg Terminal + cyberpunk terminals)
// + saaspo.com (AI SaaS glow effects, deep navy + electric cyan bento cards)
// + darkmodedesign.com (parallel dark systems, multi-preset, glow CTAs)
const BG      = '#07090F';            // near-black abyss
const SURF    = '#0D101A';            // dark navy surface
const CARD    = '#111827';            // card background
const CARD2   = '#1A2235';            // elevated / chip bg
const BORDER  = 'rgba(0,212,255,0.13)';  // subtle cyan border
const BHARD   = 'rgba(0,212,255,0.30)';  // stronger cyan border
const ACC     = '#00D4FF';            // electric cyan — primary
const ACC_D   = 'rgba(0,212,255,0.16)';  // glow fill
const ACC2    = '#10D988';            // mint green — bullish / positive
const ACC2D   = 'rgba(16,217,136,0.16)';
const WARN    = '#F59E0B';            // amber
const WARND   = 'rgba(245,158,11,0.16)';
const BEAR    = '#FF4D6D';            // rose red — bearish / negative
const BEARD   = 'rgba(255,77,109,0.16)';
const PURP    = '#A78BFA';            // violet — AI/signal
const PURPD   = 'rgba(167,139,250,0.16)';
const TEXT    = '#E2E8F0';            // primary text
const TEXT2   = 'rgba(148,163,184,0.78)';  // secondary
const TEXT3   = 'rgba(100,116,139,0.56)';  // tertiary / muted
const SL      = 'rgba(0,212,255,0.025)';   // scanline tint

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
const R = (x,y,w,h,fill,o={}) => ({
  type:'rect', x, y, width:w, height:h, fill,
  rx:o.rx||0, opacity:o.op||1, stroke:o.stroke||'none', strokeWidth:o.sw||0
});
const T = (x,y,s,sz,fill,o={}) => ({
  type:'text', x, y, content:String(s), fontSize:sz, fill,
  fontWeight:o.fw||400,
  fontFamily:o.mono?"'JetBrains Mono','Fira Code',monospace":(o.font||'Inter,sans-serif'),
  textAnchor:o.a||'start', letterSpacing:o.ls||0, opacity:o.op||1
});
const C = (cx,cy,r,fill,o={}) => ({
  type:'circle', cx, cy, r, fill, opacity:o.op||1,
  stroke:o.stroke||'none', strokeWidth:o.sw||0
});
const L = (x1,y1,x2,y2,stroke,o={}) => ({
  type:'line', x1, y1, x2, y2, stroke,
  strokeWidth:o.sw||1, opacity:o.op||1
});

// ─── SCANLINES ────────────────────────────────────────────────────────────────
function scanlines(el) {
  for (let y=44; y<792; y+=4) el.push(R(0,y,W,1,SL));
}

// ─── STATUS BAR ───────────────────────────────────────────────────────────────
function statusBar(el) {
  el.push(R(0,0,W,44,SURF));
  el.push(L(0,44,W,44,BORDER,{sw:1}));
  el.push(T(16,27,'DIAL',11,ACC,{fw:800,ls:3.5,mono:true}));
  el.push(T(60,27,'TERMINAL v2',9,TEXT3,{fw:400,ls:1.5,mono:true}));
  el.push(C(W-52,22,4,ACC2));
  el.push(C(W-52,22,8,ACC2,{op:0.25}));
  el.push(T(W-42,27,'LIVE',9,ACC2,{fw:700,ls:2,mono:true}));
  el.push(T(W-10,27,'◉',9,ACC2,{fw:400}));
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
function bottomNav(el, active) {
  const tabs = ['MKTX','SIGNALS','PORT','WATCH','FEED'];
  el.push(R(0,792,W,52,SURF));
  el.push(L(0,792,W,792,BORDER,{sw:1}));
  tabs.forEach((t,i) => {
    const cx = 19+i*78;
    if (i===active) el.push(R(cx-14,793,36,2,ACC,{rx:1}));
    el.push(T(cx+4,821,t,8.5,i===active?ACC:TEXT3,{fw:i===active?700:400,a:'middle',ls:1.2,mono:true}));
  });
}

// ─── MINI SPARKLINE ───────────────────────────────────────────────────────────
function spark(x,y,w,h,pts,color) {
  const el=[], n=pts.length;
  const mn=Math.min(...pts), mx=Math.max(...pts), rng=mx-mn||1;
  for (let i=0;i<n-1;i++) {
    const x1=x+(i/(n-1))*w, y1=y+h-((pts[i]-mn)/rng)*h;
    const x2=x+((i+1)/(n-1))*w, y2=y+h-((pts[i+1]-mn)/rng)*h;
    el.push(L(x1,y1,x2,y2,color,{sw:1.5,op:0.88}));
    const bH=Math.max(1,(y+h)-Math.min(y1,y2));
    el.push(R(x1,Math.min(y1,y2),w/(n-1),bH,color,{op:0.10}));
  }
  return el;
}

// ─── SCREEN 1: MARKETS OVERVIEW ──────────────────────────────────────────────
function s1() {
  const el=[];
  el.push(R(0,0,W,H,BG));
  scanlines(el);
  statusBar(el);

  // Title
  el.push(T(16,68,'Markets',23,TEXT,{fw:700}));
  el.push(T(16,87,'Overview',23,'rgba(148,163,184,0.4)',{fw:300}));
  el.push(T(16,108,'Apr 10, 2026  ·  09:47 EST',10,TEXT3,{fw:400,mono:true,ls:0.4}));

  // ── Bento row 1: 2 × index card ────────────────────────────────────────
  // S&P 500
  el.push(R(16,120,174,92,CARD,{rx:10,stroke:BORDER,sw:1}));
  el.push(R(16,120,174,92,ACC_D,{rx:10,op:0.35}));
  el.push(R(16,120,3,92,ACC,{rx:1.5}));
  el.push(T(28,140,'S&P 500',10,TEXT2,{fw:500,ls:0.4}));
  el.push(T(28,161,'5,842.61',20,TEXT,{fw:700,mono:true}));
  el.push(R(28,168,56,18,ACC2D,{rx:9}));
  el.push(T(33,180,'+1.24%',10,ACC2,{fw:700}));
  el.push(...spark(28,188,152,20,[5710,5740,5680,5760,5800,5790,5843],ACC2));

  // NASDAQ
  el.push(R(200,120,174,92,CARD,{rx:10,stroke:BORDER,sw:1}));
  el.push(R(200,120,3,92,BEAR,{rx:1.5}));
  el.push(T(212,140,'NASDAQ',10,TEXT2,{fw:500,ls:0.4}));
  el.push(T(212,161,'18,224.1',20,TEXT,{fw:700,mono:true}));
  el.push(R(212,168,56,18,BEARD,{rx:9}));
  el.push(T(217,180,'-0.38%',10,BEAR,{fw:700}));
  el.push(...spark(212,188,152,20,[18400,18310,18350,18280,18260,18290,18224],BEAR));

  // ── Bento row 2: BTC wide + GOLD mini ──────────────────────────────────
  el.push(R(16,222,252,84,CARD,{rx:10,stroke:BORDER,sw:1}));
  el.push(R(16,222,3,84,WARN,{rx:1.5}));
  el.push(T(28,242,'BITCOIN',10,TEXT2,{fw:500,ls:1}));
  el.push(T(28,262,'$87,420',22,TEXT,{fw:700,mono:true}));
  el.push(R(28,268,56,18,WARND,{rx:9}));
  el.push(T(33,280,'+2.87%',10,WARN,{fw:700}));
  el.push(T(28,298,'24h vol: $48.2B',8,TEXT3,{fw:400,mono:true}));
  el.push(...spark(102,232,156,60,[82000,84500,83200,85800,86400,87000,87420],WARN));

  el.push(R(278,222,96,84,CARD,{rx:10,stroke:BORDER,sw:1}));
  el.push(R(278,222,3,84,PURP,{rx:1.5}));
  el.push(T(290,242,'GOLD',9,TEXT2,{fw:500,ls:1}));
  el.push(T(290,262,'$3,147',16,TEXT,{fw:700,mono:true}));
  el.push(R(290,268,46,16,PURPD,{rx:8}));
  el.push(T(294,279,'+0.62%',9,PURP,{fw:700}));
  el.push(...spark(290,288,68,14,[3100,3115,3108,3130,3142,3147],PURP));

  // ── Top Movers ─────────────────────────────────────────────────────────
  el.push(T(16,326,'Top Movers',12,TEXT,{fw:600,ls:0.3}));
  el.push(T(W-16,326,'See all',10,ACC,{fw:500,a:'end'}));

  const movers=[
    {sym:'NVDA',name:'NVIDIA Corp',   chg:'+4.12%',price:'$892.40',c:ACC2,cd:ACC2D},
    {sym:'TSLA',name:'Tesla Inc',     chg:'-2.84%',price:'$174.20',c:BEAR,cd:BEARD},
    {sym:'META',name:'Meta Platforms',chg:'+3.31%',price:'$518.60',c:ACC2,cd:ACC2D},
    {sym:'AMZN',name:'Amazon.com',    chg:'+1.97%',price:'$186.10',c:ACC2,cd:ACC2D},
  ];
  movers.forEach((m,i)=>{
    const y=342+i*52;
    el.push(R(16,y-2,W-32,44,i%2===0?'rgba(255,255,255,0.018)':'none',{rx:6}));
    el.push(R(16,y+4,52,22,CARD2,{rx:6}));
    el.push(T(42,y+19,m.sym,10,ACC,{fw:700,a:'middle',mono:true}));
    el.push(T(78,y+14,m.name,11,TEXT,{fw:500}));
    el.push(T(78,y+29,m.price,10,TEXT2,{fw:400,mono:true}));
    el.push(R(W-80,y+4,64,22,m.cd,{rx:11}));
    el.push(T(W-16,y+19,m.chg,11,m.c,{fw:700,a:'end'}));
    el.push(...spark(W-80-66,y+4,58,24,m.c===ACC2?[40,42,41,44,46,48,50]:[50,48,47,44,43,42,40],m.c));
    if(i<3) el.push(L(16,y+42,W-16,y+42,BORDER,{sw:0.5}));
  });

  // ── AI Pulse strip ─────────────────────────────────────────────────────
  el.push(R(16,556,W-32,58,CARD,{rx:10,stroke:BHARD,sw:1}));
  el.push(R(16,556,W-32,58,ACC_D,{rx:10,op:0.35}));
  el.push(C(36,585,8,ACC_D));
  el.push(C(36,585,4,ACC));
  el.push(T(52,580,'AI Market Pulse',12,ACC,{fw:700}));
  el.push(T(52,597,'3 high-confidence signals ready to review',10,TEXT2,{fw:400}));
  el.push(T(W-28,585,'›',16,ACC,{fw:400,a:'end'}));

  // ── Sector Heatmap ─────────────────────────────────────────────────────
  el.push(T(16,632,'Sector Heat',12,TEXT,{fw:600,ls:0.3}));
  const sectors=[
    {l:'TECH',v:+2.1,c:ACC2},{l:'ENRG',v:+0.8,c:ACC2},
    {l:'HLTH',v:-0.4,c:BEAR},{l:'FINC',v:+1.2,c:ACC2},
    {l:'INDU',v:-1.1,c:BEAR},{l:'UTIL',v:+0.3,c:WARN},
  ];
  const sw2=(W-32)/6;
  sectors.forEach((s,i)=>{
    const sx=16+i*sw2;
    const inten=Math.abs(s.v)/3;
    const fill=s.c===ACC2?`rgba(16,217,136,${inten*0.65})`
      :s.v>0?`rgba(245,158,11,${inten*0.55})`:`rgba(255,77,109,${inten*0.65})`;
    el.push(R(sx,648,sw2-2,48,fill,{rx:6}));
    el.push(T(sx+sw2/2-2,667,s.l,8,s.c,{fw:700,a:'middle',ls:1,mono:true}));
    el.push(T(sx+sw2/2-2,683,(s.v>0?'+':'')+s.v+'%',9,s.c,{fw:600,a:'middle',mono:true}));
  });

  el.push(T(16,724,'Mkt Cap: $42.8T',10,TEXT3,{fw:400,mono:true,ls:0.3}));
  el.push(T(W-16,724,'Vol: $284B',10,TEXT3,{fw:400,a:'end',mono:true}));

  bottomNav(el,0);
  return {name:'Markets',svg:'',elements:el};
}

// ─── SCREEN 2: AI SIGNALS ─────────────────────────────────────────────────────
function s2() {
  const el=[];
  el.push(R(0,0,W,H,BG));
  scanlines(el);
  statusBar(el);

  el.push(T(16,68,'AI',23,TEXT,{fw:700}));
  el.push(T(16,87,'Signals',23,PURP,{fw:700}));
  el.push(T(16,107,'DIAL-α model  ·  Updated 2m ago',10,TEXT3,{fw:400,mono:true,ls:0.4}));

  // Summary
  el.push(R(16,118,W-32,54,CARD,{rx:10,stroke:BORDER,sw:1}));
  [{l:'BULLISH',v:'7',c:ACC2},{l:'NEUTRAL',v:'3',c:WARN},{l:'BEARISH',v:'4',c:BEAR},{l:'CONF>85%',v:'5',c:ACC}]
    .forEach((s,i)=>{
      const sx=28+i*88;
      el.push(T(sx,139,s.v,18,s.c,{fw:700,mono:true}));
      el.push(T(sx,157,s.l,8,TEXT3,{fw:500,ls:0.8}));
      if(i<3) el.push(L(sx+64,126,sx+64,164,BORDER,{sw:0.5}));
    });

  const sigs=[
    {sym:'NVDA',dir:'LONG', cf:92,tf:'4H',reason:'Breakout above 200-day MA with vol confirmation. RSI divergence bullish.',entry:'880.00',tgt:'940.00',stop:'860.00',c:ACC2,cd:ACC2D},
    {sym:'META',dir:'LONG', cf:87,tf:'1D',reason:'AI revenue beat expectations. Cup & handle pattern completing.',entry:'505.00',tgt:'545.00',stop:'490.00',c:ACC2,cd:ACC2D},
    {sym:'TSLA',dir:'SHORT',cf:78,tf:'1D',reason:'Head & shoulders breakdown. Deliveries miss catalyst unwinding.',entry:'178.00',tgt:'158.00',stop:'185.00',c:BEAR,cd:BEARD},
    {sym:'BTC', dir:'LONG', cf:84,tf:'1W',reason:'Post-halving accumulation. Institutional inflow +$1.2B detected.',entry:'85,000',tgt:'95,000',stop:'80,000',c:ACC2,cd:ACC2D},
  ];
  sigs.forEach((s,i)=>{
    const cy=184+i*142;
    el.push(R(16,cy,W-32,132,CARD,{rx:10,stroke:BORDER,sw:1}));
    el.push(R(16,cy,W-32,38,CARD2,{rx:10}));
    el.push(R(16,cy+28,W-32,10,CARD2));
    // ticker chip
    el.push(R(24,cy+8,52,22,s.cd,{rx:5}));
    el.push(T(50,cy+23,s.sym,11,s.c,{fw:700,a:'middle',mono:true}));
    // direction
    el.push(R(84,cy+8,44,22,s.cd,{rx:5}));
    el.push(T(106,cy+23,s.dir,10,s.c,{fw:700,a:'middle',ls:1}));
    el.push(T(138,cy+23,s.tf,10,TEXT2,{fw:500,mono:true}));
    // conf
    el.push(T(W-32,cy+14,'CONF',8,TEXT3,{fw:500,a:'end',ls:0.8}));
    el.push(T(W-28,cy+30,s.cf+'%',13,s.cf>=85?ACC:TEXT,{fw:700,a:'end',mono:true}));
    if(s.cf>=85){
      el.push(C(W-18,cy+22,4,ACC));
      el.push(C(W-18,cy+22,8,ACC,{op:0.3}));
    }
    // reason
    el.push(T(24,cy+57,s.reason,10,TEXT2,{fw:400,op:0.85}));
    // entry / target / stop
    [{l:'ENTRY',v:'$'+s.entry,c:TEXT},{l:'TARGET',v:'$'+s.tgt,c:ACC2},{l:'STOP',v:'$'+s.stop,c:BEAR}]
      .forEach((e,j)=>{
        const ex=24+j*((W-50)/3);
        el.push(R(ex,cy+88,(W-54)/3-2,34,SURF,{rx:6}));
        el.push(T(ex+8,cy+104,e.l,8,TEXT3,{fw:400,ls:0.8}));
        el.push(T(ex+8,cy+119,e.v,11,e.c,{fw:600,mono:true}));
      });
  });

  bottomNav(el,1);
  return {name:'Signals',svg:'',elements:el};
}

// ─── SCREEN 3: PORTFOLIO ─────────────────────────────────────────────────────
function s3() {
  const el=[];
  el.push(R(0,0,W,H,BG));
  scanlines(el);
  statusBar(el);

  el.push(T(16,68,'Portfolio',23,TEXT,{fw:700}));
  el.push(T(W-16,68,'$128,420',18,TEXT,{fw:700,a:'end',mono:true}));

  // P&L banner
  el.push(R(16,90,W-32,72,CARD,{rx:10,stroke:BHARD,sw:1}));
  el.push(R(16,90,W-32,72,ACC2D,{rx:10,op:0.55}));
  el.push(T(28,110,'Total Return',11,TEXT2,{fw:500}));
  el.push(T(28,134,'+$14,820',24,ACC2,{fw:700,mono:true}));
  el.push(R(28,140,62,18,ACC2D,{rx:9}));
  el.push(T(33,152,'+13.06%',10,ACC2,{fw:700}));
  el.push(L(W/2,98,W/2,154,BORDER,{sw:0.5}));
  el.push(T(W/2+12,110,'Today',11,TEXT2,{fw:500}));
  el.push(T(W/2+12,134,'+$820',18,ACC2,{fw:600,mono:true}));
  el.push(T(W/2+12,151,'+0.64% today',10,TEXT3,{fw:400}));

  // Allocation donut (ring approximation)
  const cx=W/2, cy=290;
  const segs=[
    {l:'Equities',p:58,c:ACC},
    {l:'Crypto',  p:22,c:PURP},
    {l:'ETF/Index',p:12,c:ACC2},
    {l:'Bonds',   p:5, c:WARN},
    {l:'Cash',    p:3, c:TEXT3},
  ];
  let cum=0;
  segs.forEach(s=>{
    const a1=(cum/100)*Math.PI*2-Math.PI/2;
    const a2=((cum+s.p)/100)*Math.PI*2-Math.PI/2;
    const steps=Math.max(2,Math.floor(s.p*1.2));
    for(let k=0;k<steps;k++){
      const ang=a1+(k+0.5)/steps*(a2-a1);
      const ox=cx+62*Math.cos(ang), oy=cy+62*Math.sin(ang);
      el.push(R(ox-5,oy-5,10,10,s.c,{rx:2,op:0.88}));
    }
    cum+=s.p;
  });
  el.push(C(cx,cy,46,BG));
  el.push(T(cx,cy-7,'$128K',14,TEXT,{fw:700,a:'middle'}));
  el.push(T(cx,cy+9,'Portfolio',9,TEXT3,{a:'middle'}));

  // Legend
  segs.forEach((s,i)=>{
    const ly=376+i*20;
    el.push(C(24,ly-4,5,s.c));
    el.push(T(36,ly,s.l,10,TEXT2,{fw:400}));
    el.push(T(W-20,ly,s.p+'%',10,s.c,{fw:600,a:'end'}));
  });

  // Holdings
  el.push(L(16,460,W-16,460,BORDER,{sw:0.5}));
  el.push(T(16,478,'Holdings',12,TEXT,{fw:600}));
  const holds=[
    {sym:'NVDA',sh:'24',  val:'$21,418',chg:'+4.12%',c:ACC2},
    {sym:'BTC', sh:'0.5', val:'$43,710',chg:'+2.87%',c:WARN},
    {sym:'SPY', sh:'60',  val:'$31,062',chg:'+1.24%',c:ACC2},
    {sym:'META',sh:'35',  val:'$18,151',chg:'+3.31%',c:ACC2},
  ];
  holds.forEach((h,i)=>{
    const hy=494+i*56;
    el.push(R(16,hy,W-32,46,i%2===0?'rgba(255,255,255,0.02)':'none',{rx:6}));
    el.push(R(24,hy+10,40,26,CARD2,{rx:5}));
    el.push(T(44,hy+27,h.sym,10,ACC,{fw:700,a:'middle',mono:true}));
    el.push(T(76,hy+22,h.sh+' shares',11,TEXT,{fw:500}));
    el.push(T(W-20,hy+20,h.val,12,TEXT,{fw:600,a:'end',mono:true}));
    el.push(T(W-20,hy+36,h.chg,10,h.c,{fw:700,a:'end'}));
    if(i<3) el.push(L(16,hy+46,W-16,hy+46,BORDER,{sw:0.5}));
  });

  bottomNav(el,2);
  return {name:'Portfolio',svg:'',elements:el};
}

// ─── SCREEN 4: WATCHLIST ─────────────────────────────────────────────────────
function s4() {
  const el=[];
  el.push(R(0,0,W,H,BG));
  scanlines(el);
  statusBar(el);

  el.push(T(16,68,'Watchlist',23,TEXT,{fw:700}));
  el.push(T(16,88,'24 symbols',10,TEXT3,{fw:400,mono:true,ls:0.3}));

  // Filter tabs
  ['All','Stocks','Crypto','ETF','Forex'].forEach((t,i)=>{
    const tx=16+i*74;
    const a=i===0;
    el.push(R(tx,100,66,26,a?ACC_D:'none',{rx:13,stroke:a?BHARD:BORDER,sw:1}));
    el.push(T(tx+33,117,t,10,a?ACC:TEXT3,{a:'middle',fw:a?600:400}));
  });

  el.push(L(16,136,W-16,136,BORDER,{sw:0.5}));
  el.push(T(16,152,'SYMBOL',8,TEXT3,{ls:1,mono:true}));
  el.push(T(154,152,'7D',8,TEXT3,{ls:1,a:'middle',mono:true}));
  el.push(T(W-16,152,'PRICE / CHG',8,TEXT3,{ls:1,a:'end',mono:true}));
  el.push(L(16,158,W-16,158,BORDER,{sw:0.5}));

  const items=[
    {s:'NVDA',n:'NVIDIA',  p:'892.40',chg:'+4.12%',c:ACC2,pts:[60,62,61,68,74,80,84]},
    {s:'AAPL',n:'Apple',   p:'223.80',chg:'+0.84%',c:ACC2,pts:[70,71,70,72,73,71,74]},
    {s:'TSLA',n:'Tesla',   p:'174.20',chg:'-2.84%',c:BEAR,pts:[85,82,80,77,74,76,72]},
    {s:'MSFT',n:'Microsoft',p:'418.60',chg:'+1.48%',c:ACC2,pts:[62,64,63,65,67,66,68]},
    {s:'ETH', n:'Ethereum',p:'3,214', chg:'+5.22%',c:PURP,pts:[55,58,56,62,68,72,78]},
    {s:'BTC', n:'Bitcoin', p:'87,420',chg:'+2.87%',c:WARN,pts:[60,62,65,63,68,72,74]},
    {s:'SPY', n:'S&P ETF', p:'584.26',chg:'+1.24%',c:ACC2,pts:[65,66,64,67,68,70,72]},
    {s:'AMZN',n:'Amazon',  p:'186.10',chg:'+1.97%',c:ACC2,pts:[60,61,62,62,64,65,66]},
    {s:'GOOGL',n:'Alphabet',p:'181.40',chg:'-0.52%',c:BEAR,pts:[70,68,69,67,68,67,66]},
    {s:'GLD', n:'Gold ETF',p:'316.20',chg:'+0.62%',c:WARN,pts:[60,61,60,62,63,64,65]},
  ];
  items.forEach((item,i)=>{
    const iy=170+i*60;
    el.push(R(16,iy-2,W-32,52,i%2===0?'rgba(255,255,255,0.018)':'none',{rx:6}));
    el.push(R(16,iy+4,48,22,CARD2,{rx:5}));
    el.push(T(40,iy+19,item.s,8,ACC,{fw:700,a:'middle',mono:true}));
    el.push(T(74,iy+16,item.n,11,TEXT,{fw:500}));
    el.push(...spark(128,iy+2,72,36,item.pts,item.c));
    el.push(T(W-20,iy+18,'$'+item.p,12,TEXT,{fw:600,a:'end',mono:true}));
    el.push(T(W-20,iy+36,item.chg,10,item.c,{fw:700,a:'end'}));
    if(i<items.length-1) el.push(L(16,iy+50,W-16,iy+50,BORDER,{sw:0.5,op:0.45}));
  });

  bottomNav(el,3);
  return {name:'Watchlist',svg:'',elements:el};
}

// ─── SCREEN 5: ALERT FEED ─────────────────────────────────────────────────────
function s5() {
  const el=[];
  el.push(R(0,0,W,H,BG));
  scanlines(el);
  statusBar(el);

  el.push(T(16,68,'Alert',23,TEXT,{fw:700}));
  el.push(T(16,87,'Feed',23,BEAR,{fw:700}));
  el.push(C(W-22,62,5,BEAR));
  el.push(C(W-22,62,10,BEAR,{op:0.3}));
  el.push(T(W-34,68,'12',10,BEAR,{fw:700,a:'end',mono:true}));

  // Filter chips
  [{l:'All  12',c:ACC,a:true},{l:'Signal 5',c:PURP},{l:'Price  4',c:WARN},{l:'News  3',c:TEXT2}]
    .forEach((n,i)=>{
      el.push(R(16+i*92,96,84,26,n.a?ACC_D:'none',{rx:13,stroke:n.a?BHARD:BORDER,sw:1}));
      el.push(T(16+i*92+42,113,n.l,10,n.a?ACC:TEXT3,{a:'middle',fw:n.a?600:400}));
    });

  const alerts=[
    {tp:'SIGNAL',tm:'09:32',title:'NVDA breakout confirmed',body:'Price crossed $880 resistance with 2.4× avg volume. DIAL-α confidence: 92%',c:ACC2,cd:ACC2D,ic:'▲'},
    {tp:'PRICE', tm:'09:18',title:'TSLA -3% alert triggered',body:'Tesla crossed your $178 stop-watch. Daily channel breakdown in progress.',c:BEAR,cd:BEARD,ic:'▼'},
    {tp:'SIGNAL',tm:'09:05',title:'BTC weekly signal active',body:'Post-halving accumulation phase. Institutional inflow: +$1.2B (72h)',c:PURP,cd:PURPD,ic:'◈'},
    {tp:'NEWS',  tm:'08:47',title:'Fed minutes: rates on hold',body:'FOMC minutes signal no change through Q3 2026. Risk assets to benefit.',c:ACC,cd:ACC_D,ic:'◉'},
    {tp:'PRICE', tm:'08:30',title:'ETH $3,200 target hit',body:'Ethereum reached your price target. 41% gain from entry.',c:ACC2,cd:ACC2D,ic:'⬡'},
    {tp:'SIGNAL',tm:'08:00',title:'Market open briefing',body:'3 signals overnight. Macro: bullish bias. Sector rotation to tech.',c:ACC,cd:ACC_D,ic:'✦'},
  ];
  alerts.forEach((a,i)=>{
    const ay=134+i*102;
    el.push(R(16,ay,W-32,92,CARD,{rx:10,stroke:BORDER,sw:1}));
    el.push(R(24,ay+10,54,18,a.cd,{rx:4}));
    el.push(T(51,ay+22,a.tp,8,a.c,{fw:700,a:'middle',ls:0.8}));
    el.push(T(W-28,ay+22,a.tm,9,TEXT3,{fw:400,a:'end',mono:true}));
    el.push(T(W-14,ay+22,a.ic,11,a.c,{a:'end',op:0.75}));
    el.push(T(24,ay+44,a.title,12,TEXT,{fw:600}));
    el.push(T(24,ay+60,a.body,10,TEXT2,{fw:400,op:0.8}));
    el.push(T(24,ay+75,a.body.slice(0,50)+'...',9,TEXT3,{fw:400,op:0.55}));
  });

  bottomNav(el,4);
  return {name:'Feed',svg:'',elements:el};
}

// ─── SCREEN 6: DATA SOURCES ──────────────────────────────────────────────────
function s6() {
  const el=[];
  el.push(R(0,0,W,H,BG));
  scanlines(el);
  statusBar(el);

  el.push(T(16,68,'Data',23,TEXT,{fw:700}));
  el.push(T(16,87,'Sources',23,ACC,{fw:300}));

  // Status banner
  el.push(R(16,100,W-32,56,CARD,{rx:10,stroke:BORDER,sw:1}));
  el.push(C(36,128,7,ACC2));
  el.push(C(36,128,13,ACC2,{op:0.2}));
  el.push(T(56,122,'All systems operational',13,TEXT,{fw:600}));
  el.push(T(56,139,'8/8 feeds live  ·  avg latency 12ms',9,ACC2,{fw:500,mono:true}));

  el.push(T(16,172,'Connected Feeds',12,TEXT,{fw:600}));
  const srcs=[
    {n:'Polygon.io',    tp:'Equities',     st:'LIVE',lat:'8ms', c:ACC2},
    {n:'Coinbase Pro',  tp:'Crypto',       st:'LIVE',lat:'14ms',c:PURP},
    {n:'Bloomberg API', tp:'Indices',      st:'LIVE',lat:'22ms',c:ACC},
    {n:'FRED Database', tp:'Macro',        st:'LIVE',lat:'65ms',c:WARN},
    {n:'NewsAPI',       tp:'News',         st:'LIVE',lat:'31ms',c:TEXT2},
    {n:'DIAL-α Model',  tp:'AI Engine',    st:'LIVE',lat:'3ms', c:PURP},
    {n:'Options Flow',  tp:'Derivatives',  st:'SYNC',lat:'18ms',c:WARN},
    {n:'Dark Pool Feed',tp:'Institutional',st:'LIVE',lat:'44ms',c:BEAR},
  ];
  srcs.forEach((s,i)=>{
    const sy=192+i*62;
    el.push(R(16,sy,W-32,52,CARD,{rx:8,stroke:BORDER,sw:1}));
    const sc=s.st==='LIVE'?ACC2:WARN;
    el.push(C(36,sy+26,6,sc));
    el.push(C(36,sy+26,11,sc,{op:0.2}));
    el.push(T(54,sy+22,s.n,12,TEXT,{fw:600}));
    el.push(T(54,sy+38,s.tp,10,TEXT3,{fw:400}));
    const bw=s.st==='LIVE'?36:40;
    el.push(R(W-24-bw-56,sy+13,bw,18,s.st==='LIVE'?ACC2D:WARND,{rx:9}));
    el.push(T(W-24-bw-56+bw/2,sy+25,s.st,9,sc,{a:'middle',fw:700,ls:0.5}));
    el.push(T(W-24,sy+26,s.lat,10,TEXT2,{fw:500,a:'end',mono:true}));
  });

  // Model card
  el.push(R(16,696,W-32,68,CARD,{rx:10,stroke:BHARD,sw:1}));
  el.push(R(16,696,W-32,68,PURPD,{rx:10,op:0.6}));
  el.push(T(28,716,'DIAL-α Intelligence Model',12,PURP,{fw:700}));
  el.push(T(28,732,'Transformer-based market pattern recognition',10,TEXT2,{fw:400}));
  el.push(T(28,750,'v2.4.1  ·  Trained Apr 2026  ·  94.2% accuracy',9,TEXT3,{fw:400,mono:true}));

  bottomNav(el,0);
  return {name:'Sources',svg:'',elements:el};
}

// ─── ASSEMBLE + WRITE ─────────────────────────────────────────────────────────
const screens=[s1(),s2(),s3(),s4(),s5(),s6()];
const total=screens.reduce((n,s)=>n+s.elements.length,0);

const pen={
  version:'2.8',
  metadata:{
    name:'DIAL — Market Intelligence Terminal',
    author:'RAM',
    date:'2026-04-10',
    theme:'dark',
    heartbeat:40,
    elements:total,
    description:'Bloomberg Terminal × AI glow bento — deep navy + electric cyan real-time market intelligence',
    inspiration:'godly.website (sci-fi terminal aesthetic) + saaspo.com (AI SaaS glow + bento grids) + darkmodedesign.com (parallel dark systems)',
  },
  screens,
};

fs.writeFileSync(path.join(__dirname,`${SLUG}.pen`),JSON.stringify(pen,null,2));
console.log(`DIAL: ${screens.length} screens, ${total} elements`);
console.log(`Written: ${SLUG}.pen`);
