'use strict';
// WRIT — Daily Market Intelligence Briefing
// Theme: DARK (previous design 'opal' was LIGHT)
// Inspired by:
//   • "Compound: Membership" (Godly) — clean dark finance app, bold hierarchy
//   • "Linear: Change" (Godly) — editorial changelog / update stream pattern
//   • "The Daily Dispatch" (Minimal Gallery) — big editorial type blocking
//   • Ultra-bold condensed display type trend (Awwwards nominees: Nine to Five, NETWORK card)
//   • Color-blocking over gradient trend (no glassmorphism — solid ink backgrounds)
// 5 screens: Today, Markets, Signal Detail, Watchlist, Profile

const fs   = require('fs');
const path = require('path');

// ── Palette ─────────────────────────────────────────────────────────────────
const BG      = '#090807';   // editorial ink black (warm undertone)
const SURFACE = '#111009';   // warm near-black surface
const CARD    = '#1A1713';   // raised card
const CARD2   = '#231F19';   // deeper card
const BORDER  = '#2A2520';   // warm subtle border
const BORDER2 = '#3E3629';   // active/hover border
const TEXT    = '#F0EAE0';   // warm parchment white
const TEXT2   = '#9A9082';   // warm muted
const TEXT3   = '#5A5248';   // dim warm
const COPPER  = '#D4602A';   // copper / burnt orange (primary accent)
const COPPER2 = '#A84820';   // deep copper
const COPPER3 = '#E8855A';   // light copper
const SAGE    = '#4A8A72';   // sage green (positive)
const STEEL   = '#4A7EA8';   // steel blue (neutral/info)
const CRIMSON = '#9A2E2E';   // crimson (negative)

const W = 390;
const H = 844;

let elements = [];
let eid = 1;
function uid() { return `el-${eid++}`; }
function rect(x,y,w,h,fill,opts={}) {
  elements.push({ id:uid(), type:'rect', x,y, width:w, height:h, fill,
    rx:opts.rx||0, opacity:opts.opacity||1,
    stroke:opts.stroke||'none', strokeWidth:opts.sw||0 });
}
function text(x,y,content,size,fill,opts={}) {
  elements.push({ id:uid(), type:'text', x,y, content:String(content),
    fontSize:size, fill, fontWeight:opts.weight||'normal',
    fontFamily:opts.font||'Inter', textAnchor:opts.anchor||'start',
    opacity:opts.opacity||1 });
}
function circle(cx,cy,r,fill,opts={}) {
  elements.push({ id:uid(), type:'circle', cx,cy,r, fill,
    stroke:opts.stroke||'none', strokeWidth:opts.sw||0, opacity:opts.opacity||1 });
}
function line(x1,y1,x2,y2,stroke,sw=1,opts={}) {
  elements.push({ id:uid(), type:'line', x1,y1,x2,y2, stroke, strokeWidth:sw,
    opacity:opts.opacity||1 });
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function statusBar() {
  rect(0,0,W,44,BG);
  text(20,28,'9:41',13,TEXT2,{weight:'500',font:'DM Mono'});
  rect(W-50,16,22,11,'none',{rx:2,stroke:TEXT3,sw:1.5});
  rect(W-48,18,14,7,TEXT3,{rx:1});
  rect(W-26,20,3,4,TEXT3,{rx:1});
  circle(W-68,22,3,TEXT3); circle(W-76,22,3,TEXT3); circle(W-84,22,3,TEXT3);
}
function bottomNav(activeIdx) {
  rect(0,H-80,W,80,SURFACE);
  line(0,H-80,W,H-80,BORDER,0.5);
  const tabs = [
    {i:'◉', l:'Today'},
    {i:'▣', l:'Markets'},
    {i:'✦', l:'Signals'},
    {i:'◈', l:'Watch'},
    {i:'▤', l:'Profile'},
  ];
  const tw = W/tabs.length;
  tabs.forEach((t,i) => {
    const cx = tw*i+tw/2;
    const isA = i===activeIdx;
    const clr = isA ? COPPER : TEXT3;
    if (isA) { rect(cx-20,H-80,40,2,COPPER,{rx:1}); }
    text(cx,H-50,t.i,17,clr,{anchor:'middle'});
    text(cx,H-32,t.l,9,clr,{anchor:'middle',weight:isA?'600':'400'});
  });
}
function pill(x,y,w,h,fill,label,clr,size=10) {
  rect(x,y,w,h,fill,{rx:h/2});
  text(x+w/2,y+h/2+size*0.38,label,size,clr,{anchor:'middle',weight:'600'});
}
function card(x,y,w,h,fill=CARD) { rect(x,y,w,h,fill,{rx:14}); }
function divider(y) { line(20,y,W-20,y,BORDER,0.5); }

function sparkLine(x,y,totalW,totalH,vals,clr) {
  const max = Math.max(...vals), min = Math.min(...vals);
  const range = max-min || 1;
  const step = totalW/(vals.length-1);
  for(let i=0;i<vals.length-1;i++) {
    const x1=x+i*step;
    const y1=y+totalH-((vals[i]-min)/range)*totalH;
    const x2=x+(i+1)*step;
    const y2=y+totalH-((vals[i+1]-min)/range)*totalH;
    line(x1,y1,x2,y2,clr,1.5);
  }
  const lastX=x+(vals.length-1)*step;
  const lastY=y+totalH-((vals[vals.length-1]-min)/range)*totalH;
  circle(lastX,lastY,3,clr);
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Today (Editorial Briefing Overview)
// ═══════════════════════════════════════════════════════════════════════════
function buildScreen1() {
  elements = [];
  rect(0,0,W,H,BG);
  statusBar();

  // Editorial masthead — "ultra-bold display type" trend, color-blocked header
  rect(0,44,W,90,COPPER2,{opacity:0.15});
  line(0,44,W,44,COPPER,0.5);
  text(20,82,'WRIT',44,TEXT,{weight:'800',font:'Inter'});
  text(20,98,'APR 08  ·  WED  ·  2026',10,TEXT3,{weight:'600',font:'DM Mono'});
  text(W-20,72,'DAILY',10,COPPER3,{anchor:'end',weight:'700',font:'DM Mono'});
  text(W-20,86,'INTELLIGENCE',10,COPPER3,{anchor:'end',weight:'700',font:'DM Mono'});
  circle(W-28,102,6,COPPER);
  line(0,134,W,134,BORDER,0.5);

  // Market open alert
  rect(16,142,W-32,36,COPPER,{rx:8,opacity:0.1});
  rect(16,142,3,36,COPPER,{rx:2});
  text(28,155,'NYSE opens in',10,TEXT2);
  text(28,168,'3h 22m',12,COPPER3,{weight:'700',font:'DM Mono'});
  text(W-20,160,'Live data',10,TEXT3,{anchor:'end'});

  // Lead story
  text(20,196,'LEAD',10,TEXT3,{weight:'700',font:'DM Mono'});
  line(20,204,W-20,204,BORDER,0.5);
  card(16,210,W-32,90,CARD);
  rect(16,210,4,90,COPPER,{rx:2});
  text(28,228,'MACRO',9,COPPER3,{weight:'700'});
  pill(W-76,216,58,20,'rgba(154,46,46,0.3)','● BEAR',CRIMSON,9);
  text(28,246,'Fed signals pause on rate cuts',15,TEXT,{weight:'700'});
  text(28,264,'Powell speech triggers 10Y yield +18bps.',12,TEXT2);
  text(28,280,'Duration-sensitive assets reprice sharply.',12,TEXT2);
  text(28,294,'Reuters · 2h ago',10,TEXT3);
  sparkLine(W-92,218,68,60,[45,48,44,52,50,58,66,70,65],CRIMSON);

  // Two secondary stories
  card(16,308,W-32,68,CARD);
  rect(16,308,4,68,SAGE,{rx:2});
  text(28,324,'EQUITY',9,SAGE,{weight:'700'});
  pill(W-68,314,50,18,'rgba(74,138,114,0.25)','● BULL',SAGE,9);
  text(28,340,'NVDA breaks $1,100 on supply data',13,TEXT,{weight:'600'});
  text(28,356,'Goldman upgrades PT to $1,340.',12,TEXT2);
  text(28,370,'Bloomberg · 45m ago',10,TEXT3);

  card(16,382,W-32,52,CARD);
  rect(16,382,4,52,STEEL,{rx:2});
  text(28,400,'CRYPTO',9,STEEL,{weight:'700'});
  text(28,416,'BTC holds $84k — next resistance $91k',12,TEXT,{weight:'500'});
  text(28,428,'CoinDesk · 1h',10,TEXT3);

  // Market snapshot
  text(20,446,'SNAPSHOT',10,TEXT3,{weight:'700',font:'DM Mono'});
  line(20,454,W-20,454,BORDER,0.5);
  const mkts=[
    {s:'SPX',v:'5,241',c:'-0.8%',bull:false},
    {s:'NDX',v:'18,340',c:'+0.4%',bull:true},
    {s:'BTC',v:'$84k',c:'+1.2%',bull:true},
    {s:'DXY',v:'103.4',c:'-0.2%',bull:false},
  ];
  const mw=(W-32)/4;
  mkts.forEach((m,i)=>{
    const mx=16+i*mw;
    const clr=m.bull?SAGE:CRIMSON;
    text(mx+mw/2,472,m.s,9,TEXT3,{anchor:'middle',weight:'700'});
    text(mx+mw/2,488,m.v,11,TEXT,{anchor:'middle',weight:'600',font:'DM Mono'});
    text(mx+mw/2,502,m.c,10,clr,{anchor:'middle',weight:'600',font:'DM Mono'});
    if(i<3) line(mx+mw,456,mx+mw,508,BORDER,0.5);
  });
  line(20,510,W-20,510,BORDER,0.5);

  // Reading list
  text(20,526,'IN DEPTH',10,TEXT3,{weight:'700',font:'DM Mono'});
  const reads=[
    {n:'01',t:'Why the yield curve inversion matters now',s:'FT · 8 min'},
    {n:'02',t:'AI chip capex: separating signal from noise',s:'Stratechery · 12 min'},
    {n:'03',t:"Private credit's quiet expansion into EM",s:'Economist · 6 min'},
  ];
  reads.forEach((r,i)=>{
    const ry=542+i*52;
    text(20,ry+16,r.n,10,TEXT3,{weight:'700',font:'DM Mono',opacity:0.5});
    text(46,ry+14,r.t,12,TEXT,{weight:'600'});
    text(46,ry+30,r.s,10,TEXT3);
    if(i<reads.length-1) line(20,ry+44,W-20,ry+44,BORDER,0.5);
    text(W-20,ry+16,'→',14,TEXT3,{anchor:'end'});
  });

  circle(W-36,H-100,22,COPPER);
  text(W-36,H-95,'✦',13,TEXT,{anchor:'middle',weight:'700'});
  bottomNav(0);
  return elements;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Markets
// ═══════════════════════════════════════════════════════════════════════════
function buildScreen2() {
  elements = [];
  rect(0,0,W,H,BG);
  statusBar();
  rect(0,44,W,52,BG);
  text(20,76,'Markets',22,TEXT,{weight:'800'});
  text(W-20,60,'APR 08',10,TEXT3,{anchor:'end',font:'DM Mono'});
  text(W-20,76,'● LIVE',9,SAGE,{anchor:'end',weight:'700'});
  line(0,96,W,96,BORDER,0.5);

  // Period tabs
  const periods=['1D','1W','1M','3M','YTD','1Y'];
  let ptx=16;
  periods.forEach((p,i)=>{
    const pw=p.length*8+16;
    const isA=i===0;
    rect(ptx,104,pw,24,isA?COPPER:CARD,{rx:12,stroke:isA?'none':BORDER,sw:1});
    text(ptx+pw/2,120,p,10,isA?TEXT:TEXT2,{anchor:'middle',weight:'600',font:'DM Mono'});
    ptx+=pw+6;
  });

  // Hero chart — S&P 500
  card(16,138,W-32,138,CARD);
  text(28,158,'S&P 500',11,TEXT2,{weight:'500'});
  text(28,186,'5,241.30',28,TEXT,{weight:'800',font:'DM Mono'});
  text(148,186,'-0.82%',15,CRIMSON,{weight:'600',font:'DM Mono'});
  text(28,200,'-43.20 pts today',11,TEXT3);
  sparkLine(28,208,W-72,50,[5310,5290,5270,5285,5255,5260,5242,5248,5238,5241],CRIMSON);
  rect(28,230,W-72,28,'rgba(154,46,46,0.06)');
  ['9:30','11:00','12:30','14:00','16:00'].forEach((t,i)=>{
    text(28+i*((W-72)/4),264,t,8,TEXT3,{font:'DM Mono'});
  });

  // 4 asset mini cards
  const assets=[
    {sym:'NASDAQ',val:'18,340',chg:'+0.4%',vals:[18100,18200,18250,18310,18280,18320,18340],bull:true},
    {sym:'BTC/USD',val:'$84,140',chg:'+1.2%',vals:[82000,83000,83500,84000,83800,84100,84140],bull:true},
    {sym:'EUR/USD',val:'1.0842',chg:'-0.3%',vals:[1.089,1.087,1.086,1.085,1.084,1.0845,1.0842],bull:false},
    {sym:'GOLD',val:'$3,124',chg:'+0.7%',vals:[3090,3095,3100,3110,3115,3120,3124],bull:true},
  ];
  const aw=(W-40)/2;
  assets.forEach((a,i)=>{
    const ax=16+(i%2)*(aw+8);
    const ay=286+Math.floor(i/2)*(92+8);
    const clr=a.bull?SAGE:CRIMSON;
    card(ax,ay,aw,92,CARD);
    text(ax+12,ay+20,a.sym,10,TEXT2,{weight:'600'});
    pill(ax+aw-52,ay+8,44,18,clr+'22',a.chg,clr,9);
    text(ax+12,ay+42,a.val,14,TEXT,{weight:'700',font:'DM Mono'});
    sparkLine(ax+12,ay+54,aw-24,28,a.vals,clr);
  });

  // Sector heatmap
  text(20,492,'SECTOR HEATMAP',10,TEXT3,{weight:'700',font:'DM Mono'});
  line(20,500,W-20,500,BORDER,0.5);
  const sectors=[
    {n:'Tech',v:'+1.4%',w:88,clr:SAGE},
    {n:'Energy',v:'+0.9%',w:66,clr:'rgba(74,138,114,0.7)'},
    {n:'Health',v:'+0.2%',w:66,clr:'rgba(74,138,114,0.35)'},
    {n:'Finance',v:'-0.5%',w:78,clr:'rgba(154,46,46,0.5)'},
    {n:'Utilities',v:'-1.1%',w:58,clr:CRIMSON},
  ];
  let sx=16;
  sectors.forEach(s=>{
    rect(sx,508,s.w,42,s.clr,{rx:8});
    text(sx+s.w/2,522,s.n,9,TEXT,{anchor:'middle',weight:'600'});
    text(sx+s.w/2,534,s.v,9,TEXT,{anchor:'middle',weight:'700',font:'DM Mono'});
    sx+=s.w+4;
  });

  // Fear/Greed strip
  card(16,562,W-32,48,CARD2);
  text(28,582,'Fear & Greed',11,TEXT2);
  text(28,596,'52 — Neutral',14,TEXT,{weight:'700',font:'DM Mono'});
  line(W/2,566,W/2,602,BORDER,0.5);
  text(W/2+12,582,'VIX',11,TEXT2);
  text(W/2+12,596,'22.4',14,COPPER3,{weight:'700',font:'DM Mono'});
  pill(W-80,574,58,18,'rgba(212,96,42,0.2)','↑ 3.1%',COPPER3,9);

  // News ticker
  rect(0,622,W,36,CARD);
  line(0,622,W,622,BORDER,0.5);
  text(16,644,'● LIVE',10,SAGE,{weight:'700'});
  text(58,644,'FOMC minutes due Wed 2pm · JPM earnings Thu · EU CPI Friday',11,TEXT2);

  bottomNav(1);
  return elements;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Signal Detail (Editorial Article)
// ═══════════════════════════════════════════════════════════════════════════
function buildScreen3() {
  elements = [];
  rect(0,0,W,H,BG);
  statusBar();
  rect(0,44,W,48,BG);
  text(20,72,'← Signals',13,TEXT2,{weight:'500'});
  text(W-20,72,'Share',13,COPPER3,{anchor:'end'});
  line(0,92,W,92,BORDER,0.5);

  // Category + timestamp
  text(20,116,'MACRO ANALYSIS',10,COPPER3,{weight:'700',font:'DM Mono'});
  text(W-20,116,'APR 08 · 07:32',10,TEXT3,{anchor:'end',font:'DM Mono'});

  // Big editorial headline — "type occupying 50%+ of composition"
  text(20,150,'Fed Signals',32,TEXT,{weight:'800'});
  text(20,184,'Pause on',32,TEXT,{weight:'800'});
  text(20,218,'Rate Cuts',32,TEXT,{weight:'800'});
  // editorial rule
  rect(20,226,44,3,COPPER,{rx:1.5});
  rect(68,227.5,W-88,1,BORDER);

  // Byline
  circle(20,248,10,CARD2);
  text(20,252,'R',8,TEXT2,{anchor:'middle',weight:'700'});
  text(36,252,'Reuters Wire · Analyzed by Writ AI',11,TEXT3);
  text(20,270,'6 min read',11,TEXT2);
  pill(118,262,60,20,'rgba(154,46,46,0.25)','● BEARISH',CRIMSON,9);

  // Body
  text(20,296,'Federal Reserve Chair Jerome Powell indicated',13,TEXT2);
  text(20,314,'Wednesday that the central bank is in no hurry',13,TEXT2);
  text(20,332,'to resume cutting rates, as inflation data remains',13,TEXT2);
  text(20,350,'above target for a third consecutive quarter.',13,TEXT2);

  // Pull quote — editorial motif (key design decision)
  rect(16,366,W-32,70,COPPER,{rx:10,opacity:0.08});
  rect(16,366,3,70,COPPER,{rx:2});
  text(28,388,'"The economy is strong enough that we',13,COPPER3,{weight:'600'});
  text(28,406,'can afford to be patient."',13,COPPER3,{weight:'600'});
  text(28,428,'— Jerome Powell, April 8 2026',10,TEXT3);

  // Continue body
  text(20,452,'10-year Treasury yields surged 18 basis points',13,TEXT2);
  text(20,470,'following the remarks. Rate-sensitive sectors sold',13,TEXT2);
  text(20,488,'off sharply in after-hours trading.',13,TEXT2);

  // Key data
  text(20,512,'KEY DATA',10,TEXT3,{weight:'700',font:'DM Mono'});
  line(20,520,W-20,520,BORDER,0.5);
  const pts=[
    {l:'10Y Treasury Yield',v:'+18bps',clr:CRIMSON},
    {l:'Fed Funds Target',v:'4.75–5.00%',clr:TEXT2},
    {l:'PCE Inflation (Feb)',v:'+2.7% YoY',clr:COPPER3},
    {l:'Next FOMC Date',v:'May 7–8',clr:TEXT2},
  ];
  pts.forEach((p,i)=>{
    const py=532+i*32;
    text(20,py+12,p.l,11,TEXT2);
    text(W-20,py+12,p.v,11,p.clr,{anchor:'end',weight:'600',font:'DM Mono'});
    if(i<pts.length-1) line(20,py+24,W-20,py+24,BORDER,0.5);
  });

  // Related
  text(20,668,'RELATED',10,TEXT3,{weight:'700',font:'DM Mono'});
  card(16,680,W-32,52,CARD);
  rect(16,680,4,52,STEEL,{rx:2});
  text(28,698,'2Y/10Y Yield Curve narrows to -12bps',12,TEXT,{weight:'500'});
  text(28,714,'Steel · 3h ago',10,TEXT3);
  text(W-20,700,'→',14,TEXT3,{anchor:'end'});

  bottomNav(2);
  return elements;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Watchlist
// ═══════════════════════════════════════════════════════════════════════════
function buildScreen4() {
  elements = [];
  rect(0,0,W,H,BG);
  statusBar();
  rect(0,44,W,52,BG);
  text(20,76,'Watchlist',22,TEXT,{weight:'800'});
  rect(W-72,56,56,28,CARD,{rx:14,stroke:BORDER,sw:1});
  text(W-44,74,'+ Add',11,TEXT2,{anchor:'middle',weight:'500'});
  line(0,96,W,96,BORDER,0.5);

  // Tabs
  const cats=['All','Equities','Crypto','Macro','FX'];
  let ctx=16;
  cats.forEach((c,i)=>{
    const cw=c.length*6+20;
    const isA=i===0;
    rect(ctx,104,cw,24,isA?COPPER:CARD,{rx:12,stroke:isA?'none':BORDER,sw:1});
    text(ctx+cw/2,120,c,10,isA?TEXT:TEXT2,{anchor:'middle',weight:'500'});
    ctx+=cw+8;
  });

  // Watchlist items
  const items=[
    {sym:'NVDA',name:'NVIDIA Corp',val:'$1,082',chg:'+3.4%',bull:true,
     note:'Goldman PT→$1340',vals:[1020,1035,1048,1060,1070,1078,1082]},
    {sym:'AAPL',name:'Apple Inc',val:'$189.40',chg:'-0.9%',bull:false,
     note:'Watch WWDC June',vals:[195,193,191,190,190,189,189]},
    {sym:'BTC',name:'Bitcoin',val:'$84,140',chg:'+1.2%',bull:true,
     note:'Support held at $82k',vals:[82000,82500,83000,83500,83800,84000,84140]},
    {sym:'TLT',name:'20Y+ Treasury',val:'$88.20',chg:'-1.8%',bull:false,
     note:'Yield spike — watch $86',vals:[92,91,90,89.5,89,88.5,88.2]},
    {sym:'DXY',name:'US Dollar Index',val:'103.42',chg:'-0.2%',bull:false,
     note:'Weakening on risk-on',vals:[104.2,104,103.8,103.6,103.5,103.4,103.42]},
  ];

  items.forEach((item,i)=>{
    const iy=138+i*112;
    const clr=item.bull?SAGE:CRIMSON;
    card(16,iy,W-32,104,CARD);

    text(28,iy+20,item.sym,14,TEXT,{weight:'800',font:'DM Mono'});
    text(28,iy+36,item.name,11,TEXT2);
    text(W-28,iy+20,item.val,14,TEXT,{anchor:'end',weight:'700',font:'DM Mono'});
    pill(W-72,iy+30,54,18,clr+'22',item.chg,clr,9);

    line(28,iy+50,W-28,iy+50,BORDER,0.5);

    sparkLine(28,iy+56,100,34,item.vals,clr);
    text(140,iy+64,item.note,10,TEXT3);

    circle(W-28,iy+82,5,COPPER,{stroke:COPPER2,sw:1});
    text(W-28,iy+96,'alert',8,TEXT3,{anchor:'middle'});
  });

  rect(16,H-134,W-32,40,CARD,{rx:12,stroke:BORDER,sw:1});
  text(W/2,H-108,'Search markets to add →',13,TEXT2,{anchor:'middle'});

  bottomNav(3);
  return elements;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Profile
// ═══════════════════════════════════════════════════════════════════════════
function buildScreen5() {
  elements = [];
  rect(0,0,W,H,BG);
  statusBar();
  rect(0,44,W,52,BG);
  text(20,76,'Profile',22,TEXT,{weight:'800'});
  line(0,96,W,96,BORDER,0.5);

  // Profile card with editorial copper accent band
  card(16,108,W-32,80,CARD);
  rect(16,108,W-32,32,COPPER,{rx:14,opacity:0.1});
  circle(48,148,22,COPPER2);
  text(48,153,'R',14,TEXT,{anchor:'middle',weight:'800'});
  text(82,130,'Rakis',18,TEXT,{weight:'800'});
  text(82,148,'Writ Pro · Joined Jan 2025',11,TEXT2);
  pill(W-72,114,56,20,COPPER+'22','PRO',COPPER3,10);

  // Signal score
  card(16,200,W-32,56,CARD2);
  text(28,222,'Signal Score',12,TEXT2);
  text(28,238,'94 / 100',18,COPPER3,{weight:'800',font:'DM Mono'});
  rect(W/2,212,W/2-28,8,BORDER,{rx:4});
  rect(W/2,212,(W/2-28)*0.94,8,COPPER,{rx:4});
  text(W-20,222,'Top 6% globally',10,TEXT3,{anchor:'end'});
  text(W-20,238,'28d streak ●',11,SAGE,{anchor:'end',weight:'600'});

  // Settings sections
  const sections=[
    {title:'BRIEFING', items:[
      {l:'Delivery time',v:'7:00 AM ET'},
      {l:'Frequency',v:'Daily digest'},
      {l:'Format',v:'Digest + alerts'},
    ]},
    {title:'SIGNALS', items:[
      {l:'Focus areas',v:'Equities + Crypto'},
      {l:'Alert threshold',v:'±2.5%'},
      {l:'Min. signal score',v:'70+'},
    ]},
    {title:'ACCOUNT', items:[
      {l:'Plan',v:'Pro · $24/mo'},
      {l:'Next billing',v:'May 1, 2026'},
    ]},
  ];

  let sy=272;
  sections.forEach(sec=>{
    text(20,sy,sec.title,10,TEXT3,{weight:'700',font:'DM Mono'});
    sy+=14;
    card(16,sy,W-32,sec.items.length*44+8,CARD);
    sec.items.forEach((item,idx)=>{
      const iy2=sy+4+idx*44;
      text(28,iy2+26,item.l,12,TEXT);
      text(W-28,iy2+26,item.v,12,TEXT2,{anchor:'end'});
      text(W-14,iy2+26,'›',14,TEXT3,{anchor:'end'});
      if(idx<sec.items.length-1) line(28,iy2+44,W-28,iy2+44,BORDER,0.5);
    });
    sy+=sec.items.length*44+8+16;
  });

  // Upgrade prompt
  rect(16,sy,W-32,48,COPPER,{rx:12,opacity:0.12});
  rect(16,sy,3,48,COPPER,{rx:2});
  text(28,sy+18,'Upgrade to Writ Elite',13,COPPER3,{weight:'700'});
  text(28,sy+34,'Unlimited signals · API access · Custom alerts',11,TEXT2);
  text(W-24,sy+26,'→',18,COPPER3,{anchor:'end'});

  bottomNav(4);
  return elements;
}

// ── SVG renderer ─────────────────────────────────────────────────────────────
function toSvg(els) {
  const parts = els.map(el => {
    if (el.type==='rect') {
      const r  = el.rx ? ` rx="${el.rx}"` : '';
      const st = el.stroke!=='none' ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth}"` : '';
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}"${r}${st} opacity="${el.opacity||1}"/>`;
    }
    if (el.type==='text') {
      const fw = el.fontWeight!=='normal' ? ` font-weight="${el.fontWeight}"` : '';
      const ff = ` font-family="${el.fontFamily||'Inter'}, sans-serif"`;
      const ta = el.textAnchor&&el.textAnchor!=='start' ? ` text-anchor="${el.textAnchor}"` : '';
      const op = el.opacity!==1 ? ` opacity="${el.opacity}"` : '';
      const safe = String(el.content||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}"${fw}${ff}${ta}${op}>${safe}</text>`;
    }
    if (el.type==='circle') {
      const st = el.stroke!=='none' ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth}"` : '';
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}"${st} opacity="${el.opacity||1}"/>`;
    }
    if (el.type==='line') {
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" opacity="${el.opacity||1}" stroke-linecap="round"/>`;
    }
    return '';
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${parts.join('')}</svg>`;
}

const screenBuilders=[
  {fn:buildScreen1, name:'Today'},
  {fn:buildScreen2, name:'Markets'},
  {fn:buildScreen3, name:'Signal Detail'},
  {fn:buildScreen4, name:'Watchlist'},
  {fn:buildScreen5, name:'Profile'},
];

const pen={
  version:'2.8',
  metadata:{
    name:'Writ — Daily Market Intelligence',
    description:'Dark editorial market intelligence briefing. Warm ink black + copper accent. 5 screens. Inspired by Compound: Membership on Godly + ultra-bold editorial typography trend from Minimal Gallery.',
    author:'RAM',
    created:new Date().toISOString(),
  },
  screens:screenBuilders.map(({fn,name})=>{
    const els=fn();
    return {name, svg:toSvg(els), elements:els};
  }),
};

const total=pen.screens.reduce((a,s)=>a+s.elements.length,0);
console.log(`WRIT: ${pen.screens.length} screens, ${total} elements`);
fs.writeFileSync(path.join(__dirname,'writ.pen'), JSON.stringify(pen,null,2));
console.log('Written: writ.pen');
