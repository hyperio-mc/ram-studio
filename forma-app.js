'use strict';
const fs = require('fs'), path = require('path');

const SLUG = 'forma';
const W = 390, H = 844;

// ── Light Palette: Warm Ink ──────────────────────────────────────────────
const BG    = '#FAF8F5';  // warm off-white
const SURF  = '#FFFFFF';
const CARD  = '#F2EFE9';  // warm cream
const INK   = '#1A1714';  // near-black warm
const MUTED = '#9A9590';  // warm gray
const ACC   = '#C8441A';  // terracotta / rust
const ACC2  = '#4B6A8D';  // slate blue
const LINE  = '#E5E0D8';  // warm divider
const GREEN = '#2A8C5E';  // success green

function rect(x,y,w,h,fill,opts={}) {
  return { type:'rect', x, y, width:w, height:h, fill,
    rx: opts.rx||0, opacity: opts.opacity!==undefined?opts.opacity:1,
    stroke: opts.stroke||'none', strokeWidth: opts.sw||0 };
}
function text(x,y,content,size,fill,opts={}) {
  return { type:'text', x, y, content: String(content), fontSize:size, fill,
    fontWeight: opts.fw||400, fontFamily: opts.font||'Inter',
    textAnchor: opts.anchor||'start', letterSpacing: opts.ls||0,
    opacity: opts.opacity!==undefined?opts.opacity:1 };
}
function circle(cx,cy,r,fill,opts={}) {
  return { type:'circle', cx, cy, r, fill,
    opacity: opts.opacity!==undefined?opts.opacity:1,
    stroke: opts.stroke||'none', strokeWidth: opts.sw||0 };
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  return { type:'line', x1,y1,x2,y2,stroke,
    strokeWidth: opts.sw||1, opacity: opts.opacity!==undefined?opts.opacity:1 };
}

const screens = [];

// ─── SCREEN 1: FEATURED ─────────────────────────────────────────────────
{
  const el = [];
  el.push(rect(0,0,W,H,BG));

  // Status bar
  el.push(text(20,18,'9:41',12,INK,{fw:700}));
  el.push(rect(340,10,30,12,INK,{rx:3,opacity:0.15}));
  el.push(rect(342,11,18,10,INK,{rx:2,opacity:0.35}));
  el.push(text(318,20,'●●●',9,INK,{opacity:0.4}));

  // Top nav
  el.push(rect(0,28,W,46,SURF));
  el.push(line(0,74,W,74,LINE));
  el.push(text(20,56,'FORMA',13,INK,{fw:700,ls:4,font:'monospace'}));
  el.push(text(195,56,'Catalog',13,MUTED,{anchor:'middle',fw:400}));
  el.push(text(280,56,'Studio',13,MUTED,{anchor:'middle',fw:400}));
  el.push(circle(355,55,14,CARD));
  el.push(text(355,59,'M',11,INK,{fw:700,anchor:'middle'}));

  // Tag chip
  el.push(rect(20,86,138,24,CARD,{rx:12}));
  el.push(circle(32,98,4,ACC));
  el.push(text(42,103,'FEATURED FACE',9,ACC,{fw:700,ls:1.5,font:'monospace'}));

  // Large display — weight contrast demo
  el.push(text(20,175,'Haas',78,INK,{fw:800,ls:-4,opacity:0.95}));
  el.push(text(20,255,'Grotesk',68,INK,{fw:200,ls:-2,opacity:0.85}));

  // Weight strip
  el.push(line(20,268,370,268,LINE));
  const wghts = [100,200,300,400,500,600,700,800,900];
  wghts.forEach((w,i) => {
    const x = 20 + i*40;
    el.push(text(x,285,'Aa',14,INK,{fw:w,opacity:0.15+i*0.1}));
  });
  el.push(line(20,295,370,295,LINE));

  // Meta row
  el.push(text(20,318,'Foundry',10,MUTED,{fw:600,ls:0.8}));
  el.push(text(20,334,'Linotype · 1961 · 2023 revival',12,INK));
  el.push(line(155,312,155,342,LINE,{opacity:0.5}));
  el.push(text(168,318,'Styles',10,MUTED,{fw:600,ls:0.8}));
  el.push(text(168,334,'18 weights',12,INK));
  el.push(line(265,312,265,342,LINE,{opacity:0.5}));
  el.push(text(278,318,'Lang',10,MUTED,{fw:600,ls:0.8}));
  el.push(text(278,334,'240+',12,INK));

  // Specimen card
  el.push(rect(20,352,350,110,CARD,{rx:10}));
  el.push(rect(20,352,350,26,LINE,{rx:10,opacity:0.5}));
  el.push(rect(20,364,350,14,LINE,{opacity:0.5})); // flatten top-rounded look
  el.push(text(36,368,'Specimen · 28px · Regular',9,MUTED,{font:'monospace'}));
  el.push(text(36,396,'The quick brown fox jumps',16,INK,{fw:400}));
  el.push(text(36,416,'over the lazy dog.',16,INK,{fw:400}));
  el.push(text(36,442,'ABCDEFGHIJKLM 0123456789',11,MUTED,{font:'monospace'}));

  // CTAs
  el.push(rect(20,478,168,50,INK,{rx:9}));
  el.push(text(104,507,'Try Free',15,SURF,{fw:600,anchor:'middle'}));
  el.push(rect(202,478,168,50,CARD,{rx:9,stroke:LINE,sw:1}));
  el.push(text(286,507,'Buy License',14,INK,{fw:500,anchor:'middle'}));

  // Price note
  el.push(text(20,546,'from',11,MUTED));
  el.push(text(50,546,'$49',12,INK,{fw:700}));
  el.push(text(72,546,'per style',11,MUTED));
  el.push(circle(170,541,9,CARD));
  el.push(text(170,545,'♥',10,ACC,{anchor:'middle'}));
  el.push(text(185,546,'Saved by 1.2K',11,MUTED));

  // Divider + label
  el.push(line(20,566,370,566,LINE));
  el.push(text(20,586,'NEW RELEASES',9,MUTED,{fw:700,ls:2,font:'monospace'}));
  el.push(text(350,586,'View all →',11,ACC,{anchor:'end',fw:500}));

  // 3 mini type cards
  const miniTypes = [
    {name:'Suisse Int\'l',  cat:'Sans',  ch:'Su', price:'$79'},
    {name:'Canela Deck',    cat:'Serif', ch:'Ca', price:'$89'},
    {name:'Aktiv Grotesk',  cat:'Sans',  ch:'Ak', price:'$99'},
  ];
  miniTypes.forEach((t,i) => {
    const x = 20 + i*122;
    el.push(rect(x,600,112,106,SURF,{rx:8,stroke:LINE,sw:1}));
    el.push(rect(x,600,112,62,CARD,{rx:8}));
    el.push(rect(x,648,112,14,CARD)); // flatten bottom of card
    el.push(text(x+56,644,t.ch,30,INK,{fw:700,anchor:'middle'}));
    el.push(text(x+8,672,t.name,9,INK,{fw:600}));
    el.push(text(x+8,686,t.cat,9,MUTED));
    el.push(text(x+104,686,t.price,9,INK,{fw:700,anchor:'end'}));
    el.push(circle(x+96,660,10,CARD));
    el.push(text(x+96,664,'→',9,INK,{anchor:'middle'}));
  });

  // Bottom nav
  el.push(rect(0,760,W,84,SURF));
  el.push(line(0,760,W,760,LINE));
  const navItems = [{label:'Featured',x:49},{label:'Catalog',x:146},{label:'Studio',x:244},{label:'Library',x:342}];
  navItems.forEach((n,i) => {
    const active = i===0;
    el.push(text(n.x,800,n.label,11,active?ACC:MUTED,{anchor:'middle',fw:active?600:400}));
    if(active) el.push(rect(n.x-22,760,44,2,ACC));
  });

  screens.push({name:'Featured', svg:'', elements:el});
}

// ─── SCREEN 2: CATALOG ──────────────────────────────────────────────────
{
  const el = [];
  el.push(rect(0,0,W,H,BG));

  // Status
  el.push(text(20,18,'9:41',12,INK,{fw:700}));
  el.push(rect(340,10,30,12,INK,{rx:3,opacity:0.15}));

  // Top bar
  el.push(rect(0,28,W,46,SURF));
  el.push(line(0,74,W,74,LINE));
  el.push(text(20,56,'FORMA',13,INK,{fw:700,ls:4,font:'monospace'}));
  el.push(circle(355,55,14,CARD));
  el.push(text(355,59,'M',11,INK,{fw:700,anchor:'middle'}));

  // Heading + search
  el.push(text(20,96,'Catalog',30,INK,{fw:700,ls:-1}));
  el.push(rect(20,110,350,36,CARD,{rx:18}));
  el.push(circle(40,128,7,MUTED,{opacity:0.4}));
  el.push(line(38,128,42,132,MUTED,{sw:1.5,opacity:0.4}));
  el.push(text(54,132,'Search 1,247 typefaces...',12,MUTED));

  // Filter pills
  const filters = ['All','Sans','Serif','Mono','Display','Script','Slab'];
  let fx = 20;
  filters.forEach((f,i) => {
    const active = i===0;
    const pw = f.length*7+20;
    el.push(rect(fx,156,pw,26,active?INK:CARD,{rx:13}));
    el.push(text(fx+pw/2,173,f,11,active?SURF:INK,{anchor:'middle',fw:active?600:400}));
    fx += pw+6;
  });

  // Sort bar
  el.push(line(20,192,370,192,LINE));
  el.push(text(20,210,'Sort by',11,MUTED));
  el.push(text(73,210,'Most Popular ▾',11,INK,{fw:500}));
  el.push(text(350,210,'Filter ≡',11,ACC,{fw:600,anchor:'end'}));
  el.push(text(195,210,'1,247 results',11,MUTED,{anchor:'middle'}));

  // 2-col grid
  const types = [
    {name:'Inter',          cat:'Sans-serif',  styles:'14',  price:'Free', ch:'In'},
    {name:'Canela',         cat:'Serif',        styles:'12',  price:'$89',  ch:'Ca'},
    {name:'Geist Mono',     cat:'Monospace',    styles:'9',   price:'Free', ch:'Ge'},
    {name:'Söhne',          cat:'Sans-serif',   styles:'16',  price:'$120', ch:'Sö'},
    {name:'Fraunces',       cat:'Serif',        styles:'18',  price:'$69',  ch:'Fr'},
    {name:'Fragment',       cat:'Monospace',    styles:'6',   price:'$49',  ch:'Fm'},
  ];
  types.forEach((t,i) => {
    const col = i%2, row = Math.floor(i/2);
    const x = col===0?20:202, y = 222+row*178;
    el.push(rect(x,y,168,168,SURF,{rx:10,stroke:LINE,sw:1}));
    el.push(rect(x,y,168,96,CARD,{rx:10}));
    el.push(rect(x,y+80,168,16,CARD));
    el.push(text(x+84,y+62,t.ch,38,INK,{fw:700,anchor:'middle',opacity:0.85}));
    el.push(text(x+12,y+110,t.name,12,INK,{fw:600}));
    el.push(text(x+12,y+128,t.cat,10,MUTED));
    el.push(text(x+12,y+146,t.styles+' styles',9,MUTED,{font:'monospace'}));
    const priceColor = t.price==='Free'?GREEN:INK;
    el.push(text(x+156,y+110,t.price,11,priceColor,{fw:700,anchor:'end'}));
    el.push(circle(x+144,y+138,12,CARD));
    el.push(text(x+144,y+142,'+',13,INK,{anchor:'middle',fw:300}));
  });

  // Bottom nav
  el.push(rect(0,760,W,84,SURF));
  el.push(line(0,760,W,760,LINE));
  ['Featured','Catalog','Studio','Library'].forEach((lbl,i) => {
    const x=[49,146,244,342][i], active=i===1;
    el.push(text(x,800,lbl,11,active?ACC:MUTED,{anchor:'middle',fw:active?600:400}));
    if(active) el.push(rect(x-22,760,44,2,ACC));
  });

  screens.push({name:'Catalog', svg:'', elements:el});
}

// ─── SCREEN 3: SPECIMEN / TYPE TESTER ───────────────────────────────────
{
  const el = [];
  el.push(rect(0,0,W,H,BG));

  // Status
  el.push(text(20,18,'9:41',12,INK,{fw:700}));
  el.push(rect(340,10,30,12,INK,{rx:3,opacity:0.15}));

  // Nav
  el.push(rect(0,28,W,46,SURF));
  el.push(line(0,74,W,74,LINE));
  el.push(text(20,56,'← Back',13,INK));
  el.push(text(195,56,'Specimen',13,INK,{fw:600,anchor:'middle'}));
  el.push(text(370,56,'Buy →',13,ACC,{fw:700,anchor:'end'}));

  // Font hero
  el.push(text(20,100,'Söhne',34,INK,{fw:800,ls:-2}));
  el.push(circle(148,86,10,CARD));
  el.push(text(148,90,'♥',11,ACC,{anchor:'middle'}));
  el.push(text(168,100,'by Klim Type Foundry',12,MUTED));
  el.push(text(20,118,'Sans-serif · Variable · 16 styles · $120',11,MUTED,{font:'monospace'}));

  // Tester card
  el.push(rect(20,130,350,148,CARD,{rx:10}));
  el.push(rect(20,130,350,28,INK,{rx:10,opacity:0.06}));
  el.push(rect(20,144,350,14,INK,{opacity:0.06})); // flatten top
  el.push(text(36,147,'Type something to test · 28px Regular',9,MUTED,{font:'monospace'}));
  el.push(text(195,185,'Typography',34,INK,{fw:700,ls:-2,anchor:'middle'}));
  el.push(text(195,216,'is the art of',28,INK,{fw:300,ls:-1,anchor:'middle'}));
  el.push(text(195,248,'making words.',28,INK,{fw:600,ls:-1,anchor:'middle'}));

  // Sliders
  el.push(rect(20,290,350,160,SURF,{rx:10,stroke:LINE,sw:1}));
  el.push(text(36,314,'Weight',11,MUTED,{fw:600,ls:0.8}));
  el.push(text(354,314,'700',11,INK,{fw:700,anchor:'end',font:'monospace'}));
  el.push(rect(36,322,298,4,LINE,{rx:2}));
  el.push(rect(36,322,208,4,INK,{rx:2}));
  el.push(circle(244,324,7,SURF,{stroke:INK,sw:2}));

  el.push(line(36,344,354,344,LINE,{opacity:0.5}));

  el.push(text(36,364,'Size',11,MUTED,{fw:600,ls:0.8}));
  el.push(text(354,364,'28px',11,INK,{fw:700,anchor:'end',font:'monospace'}));
  el.push(rect(36,372,298,4,LINE,{rx:2}));
  el.push(rect(36,372,148,4,INK,{rx:2}));
  el.push(circle(184,374,7,SURF,{stroke:INK,sw:2}));

  el.push(line(36,394,354,394,LINE,{opacity:0.5}));

  el.push(text(36,414,'Tracking',11,MUTED,{fw:600,ls:0.8}));
  el.push(text(354,414,'-1',11,INK,{fw:700,anchor:'end',font:'monospace'}));
  el.push(rect(36,422,298,4,LINE,{rx:2}));
  el.push(rect(36,422,120,4,INK,{rx:2}));
  el.push(circle(156,424,7,SURF,{stroke:INK,sw:2}));

  el.push(line(36,444,354,444,LINE,{opacity:0.5}));

  // Styles grid
  el.push(text(20,468,'Styles',13,INK,{fw:600}));
  el.push(text(350,468,'16 styles',11,MUTED,{anchor:'end',font:'monospace'}));

  const styles = ['Thin','ExtraLight','Light','Regular','Medium','SemiBold','Bold','ExtraBold'];
  styles.forEach((s,i) => {
    const col=i%2, row=Math.floor(i/2);
    const x=col===0?20:204, y=484+row*38;
    const active = s==='Bold';
    el.push(rect(x,y,166,30,active?INK:CARD,{rx:6}));
    el.push(text(x+12,y+19,s,12,active?SURF:INK,{fw:active?700:400}));
    el.push(text(x+154,y+19,'Aa',12,active?SURF:MUTED,{fw:active?800:300,anchor:'end'}));
  });

  // Bottom nav
  el.push(rect(0,760,W,84,SURF));
  el.push(line(0,760,W,760,LINE));
  ['Featured','Catalog','Studio','Library'].forEach((lbl,i) => {
    const x=[49,146,244,342][i], active=i===2;
    el.push(text(x,800,lbl,11,active?ACC:MUTED,{anchor:'middle',fw:active?600:400}));
    if(active) el.push(rect(x-22,760,44,2,ACC));
  });

  screens.push({name:'Specimen', svg:'', elements:el});
}

// ─── SCREEN 4: VARIABLE AXIS EXPLORER ───────────────────────────────────
{
  const el = [];
  el.push(rect(0,0,W,H,BG));

  // Status
  el.push(text(20,18,'9:41',12,INK,{fw:700}));
  el.push(rect(340,10,30,12,INK,{rx:3,opacity:0.15}));

  // Nav
  el.push(rect(0,28,W,46,SURF));
  el.push(line(0,74,W,74,LINE));
  el.push(text(20,56,'← Specimen',13,INK));
  el.push(text(195,56,'Variable Axes',13,INK,{fw:600,anchor:'middle'}));

  // Variable font hero — stacked "A" at different weights showing axis
  el.push(rect(20,84,350,210,CARD,{rx:12}));
  el.push(text(195,104,'VARIABLE FONT EXPLORER',9,ACC,{fw:700,ls:2,anchor:'middle',font:'monospace'}));

  // The weight progression — overlapping As
  const weightVis = [100,200,300,400,500,600,700,800,900];
  weightVis.forEach((w,i) => {
    const x = 34 + i*36;
    const opacity = 0.08 + i*0.1;
    el.push(text(x,195,'A',70,INK,{fw:w,opacity}));
  });

  el.push(line(36,208,354,208,LINE,{opacity:0.4}));
  el.push(text(36,222,'wght',10,MUTED,{font:'monospace'}));
  el.push(text(195,222,'100 ─────────────────── 900',9,MUTED,{anchor:'middle',opacity:0.6}));
  el.push(text(354,222,'Thin → Black',10,MUTED,{anchor:'end'}));

  // Width axis demo
  el.push(text(195,255,'Condensed → Extended',11,MUTED,{anchor:'middle',opacity:0.5}));
  el.push(text(82,272,'Width',36,INK,{fw:600,anchor:'middle',opacity:0.4,ls:-2}));
  el.push(text(195,272,'Width',36,INK,{fw:600,anchor:'middle',opacity:0.65}));
  el.push(text(308,272,'Width',36,INK,{fw:600,anchor:'middle',opacity:0.9,ls:2}));
  el.push(text(195,285,'wdth: 75 ─── 100 ─── 125',9,MUTED,{anchor:'middle',font:'monospace'}));

  // Axis control cards
  el.push(text(20,308,'Adjust Axes',13,INK,{fw:600}));
  el.push(text(350,308,'Reset',11,ACC,{anchor:'end',fw:500}));

  const axes = [
    {tag:'wght',name:'Weight',       lo:'100',hi:'900', pct:0.70, val:'700'},
    {tag:'wdth',name:'Width',        lo:'75', hi:'125', pct:0.50, val:'100'},
    {tag:'ital',name:'Italic Angle', lo:'0',  hi:'1',   pct:0.00, val:'0'},
    {tag:'opsz',name:'Optical Size', lo:'6',  hi:'144', pct:0.19, val:'28'},
  ];
  axes.forEach((ax,i) => {
    const y = 326+i*88;
    el.push(rect(20,y,350,80,SURF,{rx:8,stroke:LINE,sw:1}));
    el.push(rect(20,y,350,80,ACC,{rx:8,opacity:0.03}));

    el.push(text(36,y+22,ax.tag,10,ACC,{fw:700,font:'monospace',ls:1.5}));
    el.push(text(36,y+40,ax.name,13,INK,{fw:600}));
    el.push(text(350,y+22,ax.lo+'–'+ax.hi,9,MUTED,{anchor:'end',font:'monospace'}));
    el.push(text(350,y+40,ax.val,13,INK,{fw:700,anchor:'end',font:'monospace'}));

    // Slider
    const sw=278, sx=36;
    el.push(rect(sx,y+56,sw,4,LINE,{rx:2}));
    el.push(rect(sx,y+56,sw*ax.pct,4,INK,{rx:2}));
    el.push(circle(sx+sw*ax.pct,y+58,6,SURF,{stroke:INK,sw:2}));
  });

  // Bottom nav
  el.push(rect(0,760,W,84,SURF));
  el.push(line(0,760,W,760,LINE));
  ['Featured','Catalog','Studio','Library'].forEach((lbl,i) => {
    const x=[49,146,244,342][i];
    el.push(text(x,800,lbl,11,MUTED,{anchor:'middle'}));
  });

  screens.push({name:'Variable Axes', svg:'', elements:el});
}

// ─── SCREEN 5: LICENSE / PRICING ────────────────────────────────────────
{
  const el = [];
  el.push(rect(0,0,W,H,BG));

  // Status
  el.push(text(20,18,'9:41',12,INK,{fw:700}));
  el.push(rect(340,10,30,12,INK,{rx:3,opacity:0.15}));

  // Nav
  el.push(rect(0,28,W,46,SURF));
  el.push(line(0,74,W,74,LINE));
  el.push(text(20,56,'← Specimen',13,INK));
  el.push(text(195,56,'License',13,INK,{fw:600,anchor:'middle'}));

  // Header
  el.push(text(20,92,'Söhne',28,INK,{fw:800,ls:-1}));
  el.push(text(20,114,'Choose a license type',14,MUTED));
  el.push(line(20,130,370,130,LINE));

  // License cards
  const licenses = [
    {
      name:'Personal', price:'$49', per:'/style', accent:false,
      desc:'Non-commercial · 1 user · 5 projects',
      features:['Web embedding (10k pv/mo)','Print & editorial','E-book & PDF','Unlimited revisions'],
    },
    {
      name:'Studio', price:'$149', per:'/style', accent:true,
      desc:'Commercial · 5 users · Unlimited projects',
      features:['Web embedding (500k pv/mo)','App & software embedding','Broadcast rights','Priority support'],
    },
    {
      name:'Enterprise', price:'Custom', per:'', accent:false,
      desc:'Unlimited · Custom terms · SLA support',
      features:['Unlimited users & devices','All embedding types','Custom audit rights','Dedicated account mgr'],
    },
  ];

  licenses.forEach((l,i) => {
    const y = 144 + i*192;
    const bg = l.accent ? INK : SURF;
    const fg = l.accent ? SURF : INK;
    const fgM = l.accent ? 'rgba(250,248,245,0.5)' : MUTED;
    const border = l.accent ? 'none' : LINE;

    el.push(rect(20,y,350,182,bg,{rx:12,stroke:border,sw:1}));

    if(l.accent) {
      // Popular badge
      el.push(rect(272,y+14,78,22,ACC,{rx:11}));
      el.push(text(311,y+28,'⭑ Popular',9,SURF,{fw:700,anchor:'middle'}));
    }

    el.push(text(36,y+30,l.name,16,fg,{fw:700}));
    el.push(text(36,y+50,l.desc,11,fgM));
    el.push(line(36,y+66,334,y+66,l.accent?'rgba(255,255,255,0.1)':LINE));

    // Price
    el.push(text(36,y+98,l.price,30,fg,{fw:800,ls:-1}));
    if(l.per) el.push(text(36+l.price.length*16,y+96,l.per,12,fgM));

    // Features
    l.features.slice(0,3).forEach((f,fi) => {
      el.push(text(36,y+116+fi*16,'·',10,ACC,{fw:700}));
      el.push(text(50,y+116+fi*16,f,11,fg));
    });

    // CTA
    const btnBg = l.accent ? ACC : INK;
    el.push(rect(255,y+150,80,24,btnBg,{rx:7}));
    el.push(text(295,y+165,'Select →',10,SURF,{fw:600,anchor:'middle'}));
  });

  // Bottom nav
  el.push(rect(0,760,W,84,SURF));
  el.push(line(0,760,W,760,LINE));
  ['Featured','Catalog','Studio','Library'].forEach((lbl,i) => {
    const x=[49,146,244,342][i];
    el.push(text(x,800,lbl,11,MUTED,{anchor:'middle'}));
  });

  screens.push({name:'License', svg:'', elements:el});
}

// ─── SCREEN 6: LIBRARY ──────────────────────────────────────────────────
{
  const el = [];
  el.push(rect(0,0,W,H,BG));

  // Status
  el.push(text(20,18,'9:41',12,INK,{fw:700}));
  el.push(rect(340,10,30,12,INK,{rx:3,opacity:0.15}));

  // Nav
  el.push(rect(0,28,W,46,SURF));
  el.push(line(0,74,W,74,LINE));
  el.push(text(20,56,'FORMA',13,INK,{fw:700,ls:4,font:'monospace'}));
  el.push(text(370,56,'⊕',18,ACC,{anchor:'end'}));

  // Header
  el.push(text(20,92,'Library',30,INK,{fw:700,ls:-1}));
  el.push(text(20,114,'4 typefaces · 22 styles owned',13,MUTED));

  // Stats card
  el.push(rect(20,126,350,62,CARD,{rx:10}));
  const stats = [
    {label:'Owned',     val:'4'},
    {label:'Styles',    val:'22'},
    {label:'Projects',  val:'7'},
    {label:'Licenses',  val:'2 act.'},
  ];
  stats.forEach((s,i) => {
    const x = 44+i*88;
    el.push(text(x,152,s.val,16,INK,{fw:700,anchor:'middle'}));
    el.push(text(x,167,s.label,9,MUTED,{anchor:'middle'}));
    if(i<3) el.push(line(x+44,136,x+44,176,LINE,{opacity:0.5}));
  });

  // Section label
  el.push(text(20,210,'My Typefaces',13,INK,{fw:600}));
  el.push(text(350,210,'Manage →',11,ACC,{anchor:'end',fw:500}));

  // Font rows
  const ownedFonts = [
    {name:'Inter',         cat:'Sans-serif',  styles:'14 styles', tag:'Free',     tagColor:GREEN,   ch:'In'},
    {name:'Söhne',         cat:'Sans-serif',  styles:'5 styles',  tag:'Studio',   tagColor:ACC,     ch:'Sö'},
    {name:'Canela Deck',   cat:'Serif',       styles:'2 styles',  tag:'Personal', tagColor:ACC2,    ch:'Ca'},
    {name:'Fragment Mono', cat:'Monospace',   styles:'1 style',   tag:'Free',     tagColor:GREEN,   ch:'Fm'},
  ];
  ownedFonts.forEach((f,i) => {
    const y = 224+i*118;
    el.push(rect(20,y,350,108,SURF,{rx:10,stroke:LINE,sw:1}));

    // Specimen block (left)
    el.push(rect(20,y,112,108,CARD,{rx:10}));
    el.push(rect(108,y,24,108,CARD)); // flatten right edge
    el.push(text(68,y+66,f.ch,40,INK,{fw:700,anchor:'middle',opacity:0.85}));

    // Info
    el.push(text(148,y+26,f.name,14,INK,{fw:700}));
    el.push(text(148,y+44,f.cat,11,MUTED));
    el.push(text(148,y+62,f.styles,10,MUTED,{font:'monospace'}));

    // License tag
    el.push(rect(252,y+22,80,22,BG,{rx:11,stroke:LINE,sw:1}));
    el.push(text(292,y+36,f.tag,9,f.tagColor,{fw:700,anchor:'middle'}));

    // Download
    el.push(rect(252,y+54,80,28,INK,{rx:7}));
    el.push(text(292,y+71,'Download',10,SURF,{fw:600,anchor:'middle'}));

    // More options
    el.push(text(345,y+38,'···',12,MUTED,{fw:700,anchor:'middle'}));
  });

  // Upgrade nudge
  el.push(rect(20,706,350,44,CARD,{rx:10}));
  el.push(circle(44,728,10,ACC,{opacity:0.12}));
  el.push(text(44,732,'⬆',10,ACC,{anchor:'middle'}));
  el.push(text(62,724,'Upgrade Söhne to Enterprise',12,INK,{fw:600}));
  el.push(text(62,739,'Unlock broadcast & app rights',11,MUTED));
  el.push(text(350,732,'→',12,ACC,{anchor:'end',fw:700}));

  // Bottom nav
  el.push(rect(0,760,W,84,SURF));
  el.push(line(0,760,W,760,LINE));
  ['Featured','Catalog','Studio','Library'].forEach((lbl,i) => {
    const x=[49,146,244,342][i], active=i===3;
    el.push(text(x,800,lbl,11,active?ACC:MUTED,{anchor:'middle',fw:active?600:400}));
    if(active) el.push(rect(x-22,760,44,2,ACC));
  });

  screens.push({name:'Library', svg:'', elements:el});
}

// ─── Write output ────────────────────────────────────────────────────────
const totalElements = screens.reduce((sum,s)=>sum+s.elements.length,0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'FORMA — Variable Type Studio',
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'light',
    heartbeat: 15,
    description: 'A variable font discovery and licensing platform. Warm editorial light theme inspired by KOMETA Typefaces (Minimal Gallery) and Superhuman\'s custom variable font system (Lapa Ninja). Showcases the trend of custom type as brand infrastructure.',
    elements: totalElements,
  },
  screens,
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`FORMA: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
