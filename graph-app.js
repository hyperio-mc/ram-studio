'use strict';
const fs = require('fs'), path = require('path');

const SLUG = 'graph';
const NAME = 'GRAPH';
const TAGLINE = 'knowledge graph intelligence for developers';
const HEARTBEAT = 46;

// ── Palette: deep navy / electric cyan / blueprint aesthetic ──────────────────
const P = {
  bg:     '#080C16',
  surf:   '#0D1425',
  card:   '#121C36',
  card2:  '#0F1830',
  acc:    '#22D3EE',   // electric cyan — blueprint lines
  acc2:   '#818CF8',   // indigo violet
  acc3:   '#34D399',   // emerald
  warn:   '#F59E0B',   // amber
  pink:   '#F472B6',
  text:   '#E2E8F0',
  muted:  '#64748B',
  faint:  '#1E2D4A',
  border: '#1B2B4A',
  mono:   'JetBrains Mono',
};

const W = 390, H = 844;

// ── Primitives ────────────────────────────────────────────────────────────────
function rect(x,y,w,h,fill,opts={}) {
  return { type:'rect', x, y, width:w, height:h, fill,
    rx:opts.rx||0, opacity:opts.opacity!==undefined?opts.opacity:1,
    stroke:opts.stroke||'none', strokeWidth:opts.sw||0 };
}
function text(x,y,content,size,fill,opts={}) {
  return { type:'text', x, y, content:String(content), fontSize:size, fill,
    fontWeight:opts.fw||400, fontFamily:opts.font||'Inter',
    textAnchor:opts.anchor||'start', letterSpacing:opts.ls||0,
    opacity:opts.opacity!==undefined?opts.opacity:1 };
}
function circle(cx,cy,r,fill,opts={}) {
  return { type:'circle', cx, cy, r, fill,
    opacity:opts.opacity!==undefined?opts.opacity:1,
    stroke:opts.stroke||'none', strokeWidth:opts.sw||0 };
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  return { type:'line', x1, y1, x2, y2, stroke,
    strokeWidth:opts.sw||1, opacity:opts.opacity!==undefined?opts.opacity:1 };
}

// ── Shared nav helper ─────────────────────────────────────────────────────────
function nav(els, active) {
  els.push(rect(0,780,W,64,P.surf));
  els.push(line(0,780,W,780,P.border,{sw:0.5}));
  const items = [
    {icon:'◈',label:'Home'},
    {icon:'◎',label:'Explore'},
    {icon:'▣',label:'Query'},
    {icon:'◆',label:'Schema'},
    {icon:'⊙',label:'API'},
  ];
  items.forEach((n,i) => {
    const x = 39 + i * 78;
    const on = i === active;
    els.push(text(x,808,n.icon,16,on?P.acc:P.muted,{anchor:'middle'}));
    els.push(text(x,824,n.label,8,on?P.acc:P.muted,
      {anchor:'middle',fw:on?600:400,font:P.mono}));
    if (on) els.push(line(x-22,780,x+22,780,P.acc,{sw:2}));
  });
}

// ── Status bar helper ─────────────────────────────────────────────────────────
function statusBar(els) {
  els.push(rect(0,0,W,44,P.bg));
  els.push(text(20,28,'9:41',12,P.text,{fw:600,font:P.mono}));
  els.push(text(355,28,'●●●',10,P.muted,{anchor:'end'}));
}

// ── Blueprint corner marks ────────────────────────────────────────────────────
function bpCorners(els, opacity=0.3) {
  const L = 18;
  const op = opacity;
  els.push(line(0,0,0,L,P.acc,{sw:1.5,opacity:op}));
  els.push(line(0,0,L,0,P.acc,{sw:1.5,opacity:op}));
  els.push(line(W,0,W,L,P.acc,{sw:1.5,opacity:op}));
  els.push(line(W-L,0,W,0,P.acc,{sw:1.5,opacity:op}));
}

const screens = [];

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — DASHBOARD
// ══════════════════════════════════════════════════════════════════════════════
{
  const els = [];
  els.push(rect(0,0,W,H,P.bg));
  statusBar(els);
  bpCorners(els);

  // Header
  els.push(text(20,68,'GRAPH',18,P.acc,{fw:700,font:P.mono,ls:3}));
  els.push(text(20,88,'knowledge graph platform',10,P.muted,{font:P.mono}));
  els.push(circle(358,64,16,P.faint));
  els.push(text(358,68,'◉',11,P.acc,{anchor:'middle'}));
  // annotation
  els.push(line(100,68,220,68,P.acc,{sw:0.4,opacity:0.25}));
  els.push(circle(220,68,2,P.acc,{opacity:0.4}));

  els.push(line(20,100,370,100,P.border,{sw:0.5}));

  // ── Overview metrics ───────────────────────────────────
  els.push(text(20,120,'GRAPH OVERVIEW',8,P.acc,{fw:600,font:P.mono,ls:2}));

  const metrics = [
    {label:'NODES',val:'1.4M',sub:'+2.3K today'},
    {label:'EDGES',val:'8.7M',sub:'+14K today'},
    {label:'GRAPHS',val:'23',sub:'3 active'},
  ];
  metrics.forEach((m,i) => {
    const cx = 20 + i * 120, cy = 132;
    els.push(rect(cx,cy,110,68,P.card,{rx:8}));
    els.push(rect(cx,cy,110,2,P.acc,{rx:1,opacity:0.7}));
    els.push(text(cx+10,cy+18,m.label,7,P.acc,{fw:600,font:P.mono,ls:1}));
    els.push(text(cx+10,cy+40,m.val,20,P.text,{fw:700}));
    els.push(text(cx+10,cy+58,m.sub,8,P.muted));
  });
  // blueprint annotation on edges card
  els.push(line(75,134,75,124,P.acc,{sw:0.5,opacity:0.35}));
  els.push(line(75,124,136,124,P.acc,{sw:0.5,opacity:0.35}));
  els.push(text(138,127,'total relationships',7,P.acc,{opacity:0.55,font:P.mono}));

  // ── Recent graphs ──────────────────────────────────────
  els.push(text(20,218,'RECENT GRAPHS',8,P.acc,{fw:600,font:P.mono,ls:2}));
  els.push(text(355,218,'all →',8,P.muted,{anchor:'end',font:P.mono}));

  const graphs = [
    {name:'product-catalog',n:'245K',e:'1.2M',status:'active',col:P.acc3},
    {name:'user-relationships',n:'88K',e:'3.4M',status:'active',col:P.acc3},
    {name:'supply-chain-v2',n:'12K',e:'67K',status:'building',col:P.warn},
  ];
  graphs.forEach((g,i) => {
    const y = 230 + i * 72;
    els.push(rect(20,y,350,64,P.card,{rx:8}));
    els.push(rect(20,y,3,64,g.col,{rx:1,opacity:0.6}));
    els.push(circle(42,y+20,5,g.col));
    els.push(text(55,y+24,g.name,13,P.text,{fw:500,font:P.mono}));
    els.push(text(55,y+42,`${g.n} nodes · ${g.e} edges`,9,P.muted));
    els.push(rect(292,y+17,54,18,P.faint,{rx:9}));
    els.push(text(319,y+29,g.status,7,g.col,
      {anchor:'middle',fw:600,font:P.mono}));
  });

  // ── Query quick-access bar ─────────────────────────────
  els.push(rect(20,446,350,40,P.card2,{rx:8,stroke:P.border,sw:1}));
  els.push(text(36,470,'MATCH (n) WHERE n.type = "Product" ...',10,P.muted,{font:P.mono}));
  els.push(rect(320,453,40,22,P.acc,{rx:6}));
  els.push(text(340,468,'RUN',7,P.bg,{anchor:'middle',fw:700,font:P.mono}));
  // annotation
  els.push(line(320,440,350,434,P.acc,{sw:0.5,opacity:0.4}));
  els.push(text(260,432,'cypher query bar',7,P.acc,{opacity:0.5,font:P.mono}));

  // ── Activity feed ──────────────────────────────────────
  els.push(text(20,502,'ACTIVITY',8,P.acc,{fw:600,font:P.mono,ls:2}));
  els.push(line(20,512,370,512,P.border,{sw:0.3}));

  const acts = [
    {icon:'◈',msg:'Indexed 2,341 new nodes',time:'2m ago',col:P.acc},
    {icon:'◎',msg:'Query executed · 847ms',time:'5m ago',col:P.acc2},
    {icon:'◆',msg:'Schema updated: +3 edge types',time:'12m ago',col:P.acc3},
    {icon:'●',msg:'Webhook delivered · 200 OK',time:'18m ago',col:P.warn},
  ];
  acts.forEach((a,i) => {
    const y = 516 + i * 42;
    els.push(text(20,y+15,a.icon,11,a.col));
    els.push(text(40,y+15,a.msg,10,P.text));
    els.push(text(360,y+15,a.time,8,P.muted,{anchor:'end'}));
    els.push(line(20,y+28,360,y+28,P.border,{sw:0.3}));
  });

  // ── Connectivity mini-ring visualization ───────────────
  els.push(text(20,688,'CLUSTER DENSITY',8,P.acc,{fw:600,font:P.mono,ls:2}));
  els.push(rect(20,700,350,60,P.card,{rx:8}));
  const clusters = [
    {label:'Products',pct:78,col:P.acc},
    {label:'Users',pct:64,col:P.acc2},
    {label:'Supply',pct:43,col:P.acc3},
  ];
  clusters.forEach((c,i) => {
    const cx = 20 + i * 118;
    els.push(text(cx+10,716,c.label,7,P.muted,{font:P.mono}));
    els.push(rect(cx+10,722,94,6,P.faint,{rx:3}));
    els.push(rect(cx+10,722,94*c.pct/100,6,c.col,{rx:3}));
    els.push(text(cx+10,744,`${c.pct}%`,10,c.col,{fw:700,font:P.mono}));
  });

  nav(els, 0);
  screens.push({name:'Dashboard', elements:els});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — GRAPH EXPLORER (blueprint visualization)
// ══════════════════════════════════════════════════════════════════════════════
{
  const els = [];
  els.push(rect(0,0,W,H,P.bg));
  statusBar(els);
  bpCorners(els);

  // Header
  els.push(text(20,68,'EXPLORE',16,P.text,{fw:700}));
  els.push(rect(238,52,130,26,P.card,{rx:6,stroke:P.border,sw:1}));
  els.push(text(246,68,'product-catalog',8,P.acc,{font:P.mono}));
  els.push(line(368,52,376,44,P.acc,{sw:0.5,opacity:0.4}));
  els.push(text(308,42,'active graph',7,P.acc,{opacity:0.5,font:P.mono,anchor:'middle'}));

  // Search bar
  els.push(rect(20,80,350,34,P.card2,{rx:6,stroke:P.border,sw:1}));
  els.push(text(38,101,'search nodes and relationships...',10,P.muted,{font:P.mono}));

  // ── Blueprint grid canvas ──────────────────────────────
  els.push(rect(0,122,W,390,P.bg,{stroke:P.border,sw:0.5}));
  for (let gx = 0; gx <= W; gx += 32) {
    els.push(line(gx,122,gx,512,P.faint,{sw:0.25,opacity:0.45}));
  }
  for (let gy = 122; gy <= 512; gy += 32) {
    els.push(line(0,gy,W,gy,P.faint,{sw:0.25,opacity:0.45}));
  }
  // Axis labels (blueprint-style)
  [0,96,192,288,390].forEach((x,i) => {
    els.push(text(x+2,132,x.toString(),5,P.acc,{opacity:0.3,font:P.mono}));
  });
  [122,210,310,420,510].forEach((y,i) => {
    els.push(text(3,y,y.toString(),5,P.acc,{opacity:0.3,font:P.mono}));
  });

  // ── Nodes + edges ──────────────────────────────────────
  const nodes = [
    {cx:195,cy:308,r:26,label:'PROD',type:'Product',col:P.acc},
    {cx:100,cy:218,r:18,label:'CAT',type:'Category',col:P.acc2},
    {cx:288,cy:200,r:16,label:'BRD',type:'Brand',col:P.acc3},
    {cx:80, cy:380,r:14,label:'USR',type:'User',col:P.warn},
    {cx:310,cy:372,r:14,label:'REV',type:'Review',col:P.pink},
    {cx:194,cy:178,r:12,label:'TAG',type:'Tag',col:P.muted},
    {cx:120,cy:458,r:12,label:'USR',type:'User',col:P.warn},
    {cx:268,cy:452,r:12,label:'ORD',type:'Order',col:P.acc3},
  ];
  const edges = [
    [0,1,'IN_CATEGORY'],[0,2,'MADE_BY'],[0,3,'VIEWED_BY'],
    [0,4,'HAS_REVIEW'],[0,5,'TAGGED_AS'],[0,6,'PURCHASED_BY'],
    [0,7,'FULFILLS'],[1,2,'STOCKED_BY'],[3,6,'SAME_USER'],
  ];
  edges.forEach(([a,b,rel]) => {
    const na=nodes[a], nb=nodes[b];
    els.push(line(na.cx,na.cy,nb.cx,nb.cy,P.acc,{sw:0.7,opacity:0.22}));
    if (rel==='IN_CATEGORY'||rel==='MADE_BY') {
      const mx=(na.cx+nb.cx)/2, my=(na.cy+nb.cy)/2;
      els.push(text(mx,my-3,rel,5,P.acc,{opacity:0.55,anchor:'middle',font:P.mono}));
    }
  });
  nodes.forEach(n => {
    els.push(circle(n.cx,n.cy,n.r+5,n.col,{opacity:0.07}));
    els.push(circle(n.cx,n.cy,n.r,P.card,{stroke:n.col,sw:1.5}));
    els.push(text(n.cx,n.cy+4,n.label,7,n.col,{anchor:'middle',fw:700,font:P.mono}));
  });

  // Blueprint annotation for focused node
  els.push(line(195+26,308,285,265,P.acc,{sw:0.7,opacity:0.75}));
  els.push(circle(285,265,2,P.acc));
  els.push(rect(287,252,98,30,P.card,{rx:4,stroke:P.acc,sw:0.8}));
  els.push(text(293,264,'Product #A124',7,P.acc,{font:P.mono}));
  els.push(text(293,276,'Sony 65" BRAVIA 4K',7,P.text,{opacity:0.8}));

  // annotation for category node
  els.push(line(100,218-18,48,183,P.acc2,{sw:0.5,opacity:0.6}));
  els.push(circle(48,183,2,P.acc2));
  els.push(rect(8,170,80,26,P.card,{rx:4,stroke:P.acc2,sw:0.5}));
  els.push(text(12,180,'Category',6,P.acc2,{font:P.mono}));
  els.push(text(12,192,'Electronics',6,P.text,{opacity:0.7}));

  // Degree indicator ring blueprint lines
  els.push(line(195-26,308,155,340,P.acc,{sw:0.4,opacity:0.4}));
  els.push(text(128,348,'deg: 7',6,P.acc,{font:P.mono,opacity:0.5}));

  // ── Node detail panel ──────────────────────────────────
  els.push(rect(20,520,350,106,P.card,{rx:10}));
  els.push(rect(20,520,350,2,P.acc,{rx:1}));
  els.push(circle(44,546,14,P.acc,{opacity:0.12}));
  els.push(text(44,550,'P',10,P.acc,{anchor:'middle',fw:700,font:P.mono}));
  els.push(text(66,542,'Product',8,P.acc,{fw:600,font:P.mono}));
  els.push(text(66,558,'Sony 65" BRAVIA 4K TV',13,P.text,{fw:600}));
  els.push(text(66,572,'ID: prod-A124 · 7 relationships',9,P.muted,{font:P.mono}));

  const nStats = [{v:'7',l:'EDGES'},{v:'3',l:'IN'},{v:'4',l:'OUT'},{v:'3',l:'HOPS'}];
  nStats.forEach((s,i) => {
    const x = 30 + i * 80;
    els.push(text(x+18,600,s.v,14,P.text,{fw:700,anchor:'middle'}));
    els.push(text(x+18,612,s.l,6,P.acc,{anchor:'middle',font:P.mono}));
    if(i<3) els.push(line(x+58,588,x+58,614,P.border,{sw:0.5}));
  });
  els.push(rect(278,580,82,20,P.acc,{rx:10}));
  els.push(text(319,594,'EXPAND →',7,P.bg,{anchor:'middle',fw:700,font:P.mono}));

  // depth toggle buttons
  const depths = ['1','2','3','ALL'];
  depths.forEach((d,i) => {
    const x = 20 + i * 86;
    const on = d === '2';
    els.push(rect(x,626,80,20,on?P.acc:P.faint,{rx:10}));
    els.push(text(x+40,640,`depth ${d}`,7,on?P.bg:P.muted,{anchor:'middle',font:P.mono,fw:on?700:400}));
  });

  nav(els, 1);
  screens.push({name:'Explore', elements:els});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — QUERY EDITOR
// ══════════════════════════════════════════════════════════════════════════════
{
  const els = [];
  els.push(rect(0,0,W,H,P.bg));
  statusBar(els);
  bpCorners(els);

  // Header
  els.push(text(20,68,'QUERY',16,P.text,{fw:700}));
  els.push(rect(280,53,82,26,P.acc3,{rx:6}));
  els.push(text(321,70,'▶  RUN',9,P.bg,{anchor:'middle',fw:700,font:P.mono}));

  // Language tabs
  ['cypher','gremlin','sparql'].forEach((t,i) => {
    const cx = 20 + i * 90;
    const on = i===0;
    els.push(rect(cx,80,84,26,on?P.card:P.bg,{rx:6}));
    if(on) els.push(rect(cx,80,84,2,P.acc,{rx:1}));
    els.push(text(cx+42,96,t,8,on?P.acc:P.muted,
      {anchor:'middle',font:P.mono,fw:on?600:400}));
  });

  // Code editor
  els.push(rect(0,114,W,296,P.card2));
  els.push(rect(0,114,3,296,P.acc,{opacity:0.6}));
  // line numbers
  for (let l=0;l<12;l++) {
    els.push(text(13,134+l*22,(l+1).toString().padStart(2,'0'),8,P.muted,
      {font:P.mono,opacity:0.45}));
  }

  // syntax-highlighted cypher
  const code = [
    [{t:'MATCH',c:P.acc2},{t:' (',c:P.text},{t:'p',c:P.acc},{t:':',c:P.text},{t:'Product',c:P.acc3},{t:')',c:P.text}],
    [{t:'-[r:',c:P.text},{t:'IN_CATEGORY',c:P.acc},{t:']->(c:',c:P.text},{t:'Category',c:P.acc3},{t:')',c:P.text}],
    [{t:'WHERE',c:P.acc2},{t:' p.price > ',c:P.text},{t:'500',c:P.warn}],
    [{t:'  AND',c:P.acc2},{t:' c.name = ',c:P.text},{t:'"Electronics"',c:P.acc3}],
    [{t:'WITH',c:P.acc2},{t:' p, c, r',c:P.text}],
    [{t:'RETURN',c:P.acc2},{t:' p.name,',c:P.text}],
    [{t:'       p.price,',c:P.text}],
    [{t:'       c.name',c:P.text}],
    [{t:'ORDER BY',c:P.acc2},{t:' p.price ',c:P.text},{t:'DESC',c:P.acc2}],
    [{t:'LIMIT',c:P.acc2},{t:' ',c:P.text},{t:'50',c:P.warn}],
  ];
  code.forEach((row,li) => {
    let xOff = 30;
    row.forEach(seg => {
      els.push(text(xOff,134+li*22,seg.t,8,seg.c,{font:P.mono}));
      xOff += seg.t.length * 5.2;
    });
  });
  // cursor
  els.push(rect(30+2*5.2,122+9*22-10,1.5,12,P.acc));

  // blueprint annotation
  els.push(line(360,200,376,192,P.acc,{sw:0.5,opacity:0.4}));
  els.push(text(300,190,'last: 847ms',7,P.acc,{font:P.mono,opacity:0.5}));

  // blueprint corner marks on editor
  els.push(line(W-16,114,W,114,P.acc,{sw:0.5,opacity:0.25}));
  els.push(line(W,114,W,130,P.acc,{sw:0.5,opacity:0.25}));

  // Results header
  els.push(rect(0,410,W,30,P.surf));
  els.push(line(0,410,W,410,P.border,{sw:0.5}));
  els.push(text(20,430,'RESULTS',8,P.acc,{fw:600,font:P.mono,ls:2}));
  els.push(text(196,430,'2,341 rows',8,P.muted,{font:P.mono,anchor:'middle'}));
  els.push(rect(298,418,60,14,P.acc3,{rx:7,opacity:0.15}));
  els.push(text(328,430,'SUCCESS',6,P.acc3,{anchor:'middle',fw:600,font:P.mono}));
  els.push(text(368,430,'↓ CSV',7,P.muted,{anchor:'end',font:P.mono}));

  // Table header
  els.push(rect(0,440,W,22,P.card));
  const cols = ['p.name','p.price','c.name'];
  cols.forEach((c,i) => {
    const cx = 20 + i * 120;
    els.push(text(cx,455,c,7,P.acc,{fw:600,font:P.mono}));
    if(i<2) els.push(line(cx+110,440,cx+110,462,P.border,{sw:0.5}));
  });

  // Results rows
  const rows = [
    ['Sony BRAVIA 65"','$1,299','Electronics'],
    ['LG OLED 55"','$999','Electronics'],
    ['Samsung 75" Neo','$1,799','Electronics'],
    ['Apple MacBook Pro','$2,499','Electronics'],
    ['Sony WH-1000XM5','$349','Electronics'],
    ['Bose QC45','$279','Electronics'],
  ];
  rows.forEach((row,ri) => {
    const ry = 462 + ri * 34;
    els.push(rect(0,ry,W,34,ri%2===0?P.bg:P.card2));
    row.forEach((cell,ci) => {
      const cx = 20 + ci * 120;
      els.push(text(cx,ry+20,cell,8,ci===1?P.acc3:P.text,
        {font:P.mono,fw:ci===1?600:400}));
    });
    els.push(line(0,ry+34,W,ry+34,P.border,{sw:0.25}));
  });

  // blueprint foot annotation
  els.push(line(20,666,10,674,P.acc,{sw:0.5,opacity:0.25}));

  nav(els, 2);
  screens.push({name:'Query', elements:els});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — SCHEMA BUILDER (blueprint annotation for type defs)
// ══════════════════════════════════════════════════════════════════════════════
{
  const els = [];
  els.push(rect(0,0,W,H,P.bg));
  statusBar(els);
  bpCorners(els);

  // Header
  els.push(text(20,68,'SCHEMA',16,P.text,{fw:700}));
  els.push(rect(298,52,70,26,P.faint,{rx:6,stroke:P.border,sw:1}));
  els.push(text(333,68,'+ NODE',8,P.acc,{anchor:'middle',fw:600,font:P.mono}));
  // annotation underline
  els.push(line(20,76,195,76,P.acc,{sw:0.3,opacity:0.25}));

  // Node types
  els.push(text(20,96,'NODE TYPES',8,P.acc,{fw:600,font:P.mono,ls:2}));
  els.push(text(360,96,'7 defined',8,P.muted,{anchor:'end',font:P.mono}));

  const nodeTypes = [
    {name:'Product',props:['id: UUID','name: String','price: Float','sku: String'],count:'245K',col:P.acc},
    {name:'Category',props:['id: UUID','name: String','parent: String'],count:'1.2K',col:P.acc2},
    {name:'User',props:['id: UUID','email: String','tier: Enum'],count:'88K',col:P.warn},
  ];
  nodeTypes.forEach((nt,i) => {
    const y = 108 + i * 112;
    els.push(rect(20,y,350,104,P.card,{rx:8}));
    els.push(rect(20,y,3,104,nt.col,{rx:1}));
    // node badge
    els.push(rect(32,y+8,nt.name.length*7+18,20,nt.col,{rx:10,opacity:0.14}));
    els.push(text(40,y+21,nt.name,10,nt.col,{fw:700,font:P.mono}));
    els.push(text(360,y+21,nt.count+' inst.',7,P.muted,{anchor:'end',font:P.mono}));
    // properties with blueprint annotation lines
    nt.props.forEach((prop,pi) => {
      const py = y + 38 + pi * 16;
      els.push(line(30,py+3,44,py+3,nt.col,{sw:0.5,opacity:0.4}));
      els.push(circle(44,py+3,2,nt.col,{opacity:0.6}));
      els.push(text(52,py+7,prop,8,P.muted,{font:P.mono}));
    });
  });

  // Divider
  els.push(line(20,444,370,444,P.border,{sw:0.5}));

  // Edge types
  els.push(text(20,460,'RELATIONSHIP TYPES',8,P.acc,{fw:600,font:P.mono,ls:2}));
  els.push(text(360,460,'12 defined',8,P.muted,{anchor:'end',font:P.mono}));

  const edgeTypes = [
    {from:'Prod',rel:'IN_CATEGORY',to:'Cat',count:'245K',col:P.acc},
    {from:'Prod',rel:'MADE_BY',to:'Brand',count:'245K',col:P.acc3},
    {from:'User',rel:'PURCHASED',to:'Prod',count:'1.4M',col:P.warn},
    {from:'User',rel:'REVIEWED',to:'Prod',count:'88K',col:P.pink},
    {from:'Prod',rel:'TAGGED_AS',to:'Tag',count:'890K',col:P.acc2},
  ];
  edgeTypes.forEach((e,i) => {
    const y = 472 + i * 44;
    els.push(rect(20,y,350,36,P.card2,{rx:6}));
    // from node
    els.push(rect(28,y+9,44,18,P.faint,{rx:9}));
    els.push(text(50,y+21,e.from,7,P.acc,{anchor:'middle',font:P.mono}));
    // edge line
    els.push(line(72,y+18,94,y+18,e.col,{sw:0.8}));
    els.push(text(193,y+21,e.rel,7,e.col,{anchor:'middle',font:P.mono,fw:600}));
    els.push(line(254,y+18,276,y+18,e.col,{sw:0.8}));
    // arrowhead
    els.push(line(270,y+14,276,y+18,e.col,{sw:0.8}));
    els.push(line(270,y+22,276,y+18,e.col,{sw:0.8}));
    // to node
    els.push(rect(278,y+9,46,18,P.faint,{rx:9}));
    els.push(text(301,y+21,e.to,7,P.acc2,{anchor:'middle',font:P.mono}));
    els.push(text(358,y+21,e.count,7,P.muted,{anchor:'end',font:P.mono}));
  });

  nav(els, 3);
  screens.push({name:'Schema', elements:els});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — INSIGHTS
// ══════════════════════════════════════════════════════════════════════════════
{
  const els = [];
  els.push(rect(0,0,W,H,P.bg));
  statusBar(els);
  bpCorners(els);

  // Header
  els.push(text(20,68,'INSIGHTS',16,P.text,{fw:700}));
  els.push(rect(290,52,78,26,P.faint,{rx:6,stroke:P.border,sw:1}));
  els.push(text(329,68,'7 days ▾',8,P.muted,{anchor:'middle',font:P.mono}));

  // Health score card
  els.push(text(20,100,'GRAPH HEALTH',8,P.acc,{fw:600,font:P.mono,ls:2}));
  els.push(rect(20,112,350,76,P.card,{rx:10}));
  els.push(rect(20,112,350,2,P.acc3,{rx:1,opacity:0.7}));
  els.push(text(36,142,'Health Score',10,P.muted));
  els.push(text(36,166,'94',30,P.acc3,{fw:700}));
  els.push(text(72,166,'/100',13,P.muted));
  // bar
  els.push(rect(118,148,200,6,P.faint,{rx:3}));
  els.push(rect(118,148,188,6,P.acc3,{rx:3}));
  // tick marks
  [0,50,94,100].forEach(pct => {
    const x = 118 + pct * 2;
    els.push(line(x,146,x,156,P.acc,{sw:0.5,opacity:0.3}));
    els.push(text(x,168,pct.toString(),5,P.muted,{anchor:'middle',font:P.mono}));
  });
  els.push(text(194,178,'connectivity optimal',8,P.muted,{anchor:'middle'}));
  // annotation
  els.push(line(306,148,318,140,P.acc3,{sw:0.5,opacity:0.5}));
  els.push(text(320,138,'94%',7,P.acc3,{font:P.mono}));

  // Patterns
  els.push(text(20,202,'PATTERNS DISCOVERED',8,P.acc,{fw:600,font:P.mono,ls:2}));

  const patterns = [
    {icon:'◈',title:'Clustered Communities',desc:'3 distinct user clusters',rel:'2.3K nodes',col:P.acc,badge:'NEW'},
    {icon:'◆',title:'Hub Nodes Detected',desc:'12 high-connectivity products',rel:'245K edges',col:P.acc2,badge:''},
    {icon:'●',title:'Orphan Nodes',desc:'44 disconnected items found',rel:'44 nodes',col:P.warn,badge:'ACTION'},
    {icon:'◎',title:'Cycle Detected',desc:'Chain: Product→Brand→Product',rel:'3 nodes',col:P.pink,badge:'WARN'},
  ];
  patterns.forEach((p,i) => {
    const y = 216 + i * 70;
    els.push(rect(20,y,350,62,P.card,{rx:8}));
    els.push(rect(20,y,3,62,p.col,{rx:1}));
    els.push(circle(42,y+20,11,p.col,{opacity:0.12}));
    els.push(text(42,y+24,p.icon,9,p.col,{anchor:'middle'}));
    els.push(text(60,y+20,p.title,12,P.text,{fw:600}));
    els.push(text(60,y+36,p.desc,9,P.muted));
    els.push(text(60,y+50,p.rel,7,p.col,{font:P.mono}));
    if(p.badge) {
      els.push(rect(290,y+12,58,16,p.col,{rx:8,opacity:0.14}));
      els.push(text(319,y+23,p.badge,6,p.col,{anchor:'middle',fw:600,font:P.mono}));
    }
  });

  // Edge growth chart
  els.push(line(20,500,370,500,P.border,{sw:0.5}));
  els.push(text(20,516,'EDGE GROWTH — 7 DAY',8,P.acc,{fw:600,font:P.mono,ls:2}));
  els.push(rect(20,528,350,70,P.card,{rx:8}));

  const bars = [42,55,48,63,71,59,82];
  const days = ['M','T','W','T','F','S','S'];
  const maxB = 82;
  bars.forEach((v,i) => {
    const bh = (v/maxB)*46;
    const bx = 34 + i * 46;
    els.push(rect(bx,566-bh,32,bh,P.acc,{rx:3,opacity:0.25}));
    els.push(rect(bx,562-bh,32,4,P.acc,{rx:2}));
    els.push(text(bx+16,590,days[i],6,P.muted,{anchor:'middle',font:P.mono}));
    // blueprint annotation on last bar
    if(i===6) {
      els.push(line(bx+16,562-bh,bx+16,536,P.acc,{sw:0.5,opacity:0.5}));
      els.push(text(bx+20,534,'+23%',7,P.acc3,{font:P.mono}));
    }
  });
  els.push(text(356,540,'↑ 23%',8,P.acc3,{anchor:'end',fw:700}));

  // Recommendation footer
  els.push(rect(20,608,350,50,P.faint,{rx:8,stroke:P.border,sw:1}));
  els.push(text(36,630,'◈  Recommendation',10,P.acc,{fw:600}));
  els.push(text(36,648,'Reindex orphan nodes to improve query speed',9,P.muted));
  els.push(rect(300,620,58,18,P.acc,{rx:9}));
  els.push(text(329,632,'FIX →',7,P.bg,{anchor:'middle',fw:700,font:P.mono}));

  nav(els, 1);  // no specific Insights nav item → closest is Explore
  screens.push({name:'Insights', elements:els});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 6 — API ACCESS
// ══════════════════════════════════════════════════════════════════════════════
{
  const els = [];
  els.push(rect(0,0,W,H,P.bg));
  statusBar(els);
  bpCorners(els);

  // Header
  els.push(text(20,68,'API ACCESS',16,P.text,{fw:700}));
  els.push(rect(294,52,76,26,P.faint,{rx:6,stroke:P.border,sw:1}));
  els.push(text(332,68,'DOCS ↗',8,P.acc,{anchor:'middle',fw:600,font:P.mono}));
  els.push(line(20,76,175,76,P.acc,{sw:0.3,opacity:0.22}));

  // Plan banner
  els.push(rect(20,82,350,42,P.acc,{rx:8,opacity:0.09}));
  els.push(rect(20,82,3,42,P.acc,{rx:1}));
  els.push(text(32,100,'Pro Plan',9,P.acc,{fw:700}));
  els.push(text(32,114,'10M queries/mo · Unlimited graphs',8,P.muted));
  els.push(text(360,100,'Upgrade →',8,P.acc2,{anchor:'end',fw:600}));

  // Usage bars
  els.push(text(20,140,'THIS MONTH',8,P.acc,{fw:600,font:P.mono,ls:2}));
  const usage = [
    {label:'QUERIES',used:'7.2M',of:'10M',pct:72},
    {label:'BANDWIDTH',used:'148 GB',of:'500 GB',pct:30},
    {label:'STORAGE',used:'2.4 TB',of:'10 TB',pct:24},
  ];
  usage.forEach((u,i) => {
    const y = 154 + i * 56;
    els.push(text(20,y+13,u.label,7,P.muted,{font:P.mono}));
    els.push(text(368,y+13,`${u.used} / ${u.of}`,8,P.text,{anchor:'end',font:P.mono}));
    els.push(rect(20,y+20,350,5,P.faint,{rx:2}));
    const bc = u.pct > 65 ? P.warn : P.acc;
    els.push(rect(20,y+20,350*u.pct/100,5,bc,{rx:2}));
    // tick annotation
    const tx = 20+350*u.pct/100;
    els.push(line(tx,y+16,tx,y+28,bc,{sw:0.8}));
    els.push(text(tx,y+38,`${u.pct}%`,6,bc,{anchor:'middle',font:P.mono}));
  });

  // API keys
  els.push(line(20,328,370,328,P.border,{sw:0.5}));
  els.push(text(20,344,'API KEYS',8,P.acc,{fw:600,font:P.mono,ls:2}));
  els.push(rect(306,334,52,20,P.faint,{rx:10,stroke:P.border,sw:1}));
  els.push(text(332,347,'+ NEW',7,P.acc,{anchor:'middle',font:P.mono}));

  const keys = [
    {name:'production',key:'gph_sk_••••••••••••4f2a',perms:'read/write',active:true},
    {name:'staging',key:'gph_sk_••••••••••••9c1b',perms:'read only',active:true},
    {name:'ci-pipeline',key:'gph_sk_••••••••••••7e3d',perms:'read only',active:false},
  ];
  keys.forEach((k,i) => {
    const y = 360 + i * 76;
    els.push(rect(20,y,350,68,P.card,{rx:8}));
    els.push(circle(36,y+20,7,k.active?P.acc3:P.muted,{opacity:0.25}));
    els.push(circle(36,y+20,3.5,k.active?P.acc3:P.muted));
    els.push(text(50,y+24,k.name,12,P.text,{fw:500}));
    els.push(rect(298,y+10,52,17,k.active?P.acc3:P.muted,{rx:8,opacity:0.14}));
    els.push(text(324,y+22,k.active?'active':'inactive',6,k.active?P.acc3:P.muted,
      {anchor:'middle',font:P.mono}));
    els.push(rect(28,y+36,222,18,P.card2,{rx:3}));
    els.push(text(36,y+48,k.key,8,P.muted,{font:P.mono}));
    els.push(rect(256,y+36,50,18,P.faint,{rx:3}));
    els.push(text(281,y+48,'COPY',6,P.acc,{anchor:'middle',font:P.mono,fw:600}));
    els.push(text(360,y+48,k.perms,7,P.acc2,{anchor:'end',font:P.mono}));
  });

  // Webhook row
  els.push(line(20,592,370,592,P.border,{sw:0.5}));
  els.push(text(20,606,'WEBHOOK',8,P.acc,{fw:600,font:P.mono,ls:2}));
  els.push(rect(20,616,350,52,P.card,{rx:8}));
  els.push(text(36,638,'https://api.yourapp.com/graph-hooks',9,P.muted,{font:P.mono}));
  els.push(text(36,654,'events: node.created · edge.created',7,P.muted,{font:P.mono}));
  els.push(circle(354,638,7,P.acc3,{opacity:0.2}));
  els.push(circle(354,638,3.5,P.acc3));

  // blueprint foot corners
  els.push(line(0,H-64,0,H-80,P.acc,{sw:0.5,opacity:0.25}));
  els.push(line(0,H-64,14,H-64,P.acc,{sw:0.5,opacity:0.25}));
  els.push(line(W,H-64,W,H-80,P.acc,{sw:0.5,opacity:0.25}));
  els.push(line(W-14,H-64,W,H-64,P.acc,{sw:0.5,opacity:0.25}));

  nav(els, 4);
  screens.push({name:'API', elements:els});
}

// ── Write pen file ─────────────────────────────────────────────────────────────
const totalElements = screens.reduce((s,sc) => s + sc.elements.length, 0);
const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    author: 'RAM',
    date: new Date().toISOString(),
    theme: 'dark',
    heartbeat: HEARTBEAT,
    elements: totalElements,
    tagline: TAGLINE,
    slug: SLUG,
  },
  screens: screens.map(s => ({name:s.name, svg:'', elements:s.elements})),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
