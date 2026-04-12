'use strict';
const fs = require('fs'), path = require('path');

const SLUG = 'campo';
const W = 390, H = 844;

// Palette — warm earth, light theme
const BG     = '#F6F2EB';
const SURF   = '#FFFFFF';
const CARD   = '#F0EBE0';
const TEXT   = '#1C160C';
const EARTH  = '#8B5E3C';
const SAGE   = '#4D7A56';
const SAND   = '#C9A87A';
const MUTED  = 'rgba(28,22,12,0.45)';
const AMBER  = '#D97C2A';
const BLUSH  = '#C97B5A';

function rect(x,y,w,h,fill,opts={}) {
  return { type:'rect', x, y, w, h, fill,
    rx: opts.rx||0, opacity: opts.opacity||1,
    stroke: opts.stroke||'none', sw: opts.sw||1 };
}
function text(x,y,content,size,fill,opts={}) {
  return { type:'text', x, y, content, size, fill,
    fw: opts.fw||400, font: opts.font||'Inter,sans-serif',
    anchor: opts.anchor||'start', ls: opts.ls||0, opacity: opts.opacity||1 };
}
function circle(cx,cy,r,fill,opts={}) {
  return { type:'circle', cx, cy, r, fill,
    opacity: opts.opacity||1, stroke: opts.stroke||'none', sw: opts.sw||1 };
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  return { type:'line', x1, y1, x2, y2, stroke, sw: opts.sw||1, opacity: opts.opacity||1 };
}

// ─── STATUS BAR ───────────────────────────────────────────────────────────────
function statusBar(theme='light') {
  const bg = theme==='dark' ? '#0A0A0A' : BG;
  const fg = theme==='dark' ? '#F5F5F5' : TEXT;
  return [
    rect(0,0,W,44,bg),
    text(18,28,'9:41',13,fg,{fw:600}),
    text(W-18,28,'●●●',11,fg,{anchor:'end'}),
  ];
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
function bottomNav(active) {
  const items = [
    { id:'today',   icon:'◉', label:'Today'  },
    { id:'markets', icon:'⊟', label:'Markets'},
    { id:'season',  icon:'◈', label:'Season' },
    { id:'pantry',  icon:'◇', label:'Pantry' },
    { id:'profile', icon:'◎', label:'You'    },
  ];
  const els = [
    rect(0,H-82,W,82,SURF,{stroke:'rgba(28,22,12,0.08)',sw:1}),
    line(0,H-82,W,H-82,'rgba(28,22,12,0.08)'),
  ];
  items.forEach((it,i) => {
    const x = 39 + i*78;
    const isActive = it.id===active;
    els.push(
      text(x,H-50,it.icon,22,isActive?EARTH:MUTED,{anchor:'middle',fw:isActive?700:400}),
      text(x,H-28,it.label,10,isActive?EARTH:MUTED,{anchor:'middle',fw:isActive?600:400}),
    );
    if (isActive) {
      els.push(rect(x-16,H-82,32,3,EARTH,{rx:2}));
    }
  });
  return els;
}

// ─── SCREEN 1: TODAY ──────────────────────────────────────────────────────────
function screenToday() {
  const els = [];
  // BG
  els.push(rect(0,0,W,H,BG));
  // Status
  statusBar().forEach(e=>els.push(e));

  // Header
  els.push(text(24,74,'CAMPO',22,EARTH,{fw:700,ls:3}));
  els.push(text(W-24,74,'Apr 9',13,MUTED,{anchor:'end'}));
  els.push(line(24,84,W-24,84,'rgba(28,22,12,0.1)'));

  // Hero seasonal banner
  els.push(rect(16,96,W-32,96,EARTH,{rx:14}));
  // Organic blob accent
  els.push(circle(W-40,96+20,48,AMBER,{opacity:0.25}));
  els.push(circle(W-20,96+60,32,SAGE,{opacity:0.2}));
  els.push(text(32,128,'Spring is here',11,SURF,{fw:500,opacity:0.8}));
  els.push(text(32,152,'18 foods in season',22,SURF,{fw:700}));
  els.push(text(32,172,'Near Chamonix · 45 km',11,SURF,{opacity:0.7}));
  // CTA pill
  els.push(rect(32,182,120,22,AMBER,{rx:11}));
  els.push(text(92,197,'Explore Season',11,SURF,{fw:600,anchor:'middle'}));

  // Nearby markets today
  els.push(text(24,216,'Markets Open Today',14,TEXT,{fw:700}));
  const markets = [
    { name:'Chamonix Saturday Market', time:'8am–1pm', dist:'0.4km', items:'68 stalls' },
    { name:'Les Houches Farm Stand',    time:'9am–12pm',dist:'4.2km', items:'12 vendors'},
  ];
  markets.forEach((m,i) => {
    const y = 232 + i*72;
    els.push(rect(16,y,W-32,64,SURF,{rx:12}));
    els.push(rect(16,y,4,64,SAGE,{rx:2}));
    els.push(text(32,y+20,m.name,13,TEXT,{fw:600}));
    els.push(text(32,y+36,m.time,11,MUTED));
    els.push(text(W-24,y+20,m.dist,11,EARTH,{anchor:'end',fw:600}));
    els.push(text(W-24,y+36,m.items,10,MUTED,{anchor:'end'}));
    // direction arrow
    els.push(text(W-24,y+52,'→ Directions',10,SAGE,{anchor:'end',fw:500}));
  });

  // What's freshest section
  els.push(text(24,388,'Freshest Right Now',14,TEXT,{fw:700}));
  const produce = [
    { name:'Asparagus',  farm:'Ferme du Lac', tag:'Local' ,col:SAGE  },
    { name:'Ramps',      farm:'Alpine Roots', tag:'Wild'  ,col:EARTH },
    { name:'Snap Peas',  farm:'Vallée Verte', tag:'Organic',col:AMBER},
    { name:'Spinach',    farm:'La Bergerie',  tag:'Biod.' ,col:SAGE  },
  ];
  produce.forEach((p,i) => {
    const col = i%2===0 ? 16 : W/2+4;
    const y   = 406 + Math.floor(i/2)*68;
    els.push(rect(col,y,W/2-20,60,SURF,{rx:10}));
    els.push(circle(col+14,y+16,8,p.col,{opacity:0.7}));
    els.push(text(col+28,y+20,p.name,12,TEXT,{fw:600}));
    els.push(text(col+10,y+36,p.farm,10,MUTED));
    els.push(rect(col+10,y+46,52,14,p.col,{rx:7,opacity:0.15}));
    els.push(text(col+36,y+56,p.tag,9,p.col,{anchor:'middle',fw:600}));
  });

  // Weekly stats strip
  els.push(rect(16,556,W-32,56,CARD,{rx:12}));
  const stats = [
    { label:'Visits',   value:'3'  },
    { label:'Local $',  value:'$84'},
    { label:'Farms',    value:'5'  },
    { label:'CO₂ saved',value:'2.1kg'},
  ];
  stats.forEach((s,i) => {
    const x = 52 + i*84;
    els.push(text(x,580,s.value,14,EARTH,{fw:700,anchor:'middle'}));
    els.push(text(x,594,s.label,9,MUTED,{anchor:'middle'}));
    if (i<3) els.push(line(x+42,566,x+42,602,'rgba(28,22,12,0.1)'));
  });

  // Tips carousel strip
  els.push(rect(16,626,W-32,44,AMBER,{rx:12,opacity:0.12}));
  els.push(circle(32,648,10,AMBER,{opacity:0.4}));
  els.push(text(48,644,'Tip',10,AMBER,{fw:700}));
  els.push(text(48,658,'Asparagus is best before 9am — peak freshness at Ferme du Lac',10,TEXT,{opacity:0.7}));

  // Organic decorative blobs (background ambience)
  els.push(circle(-20,400,60,SAGE,{opacity:0.04}));
  els.push(circle(W+10,300,50,AMBER,{opacity:0.04}));

  // Recent activity row
  els.push(text(24,688,'Recent Purchases',13,TEXT,{fw:700}));
  const recent = [
    {item:'Carrots',    day:'Mon',col:EARTH},
    {item:'Eggs',       day:'Wed',col:AMBER},
    {item:'Spinach',    day:'Thu',col:SAGE },
    {item:'Cheese',     day:'Fri',col:BLUSH},
  ];
  recent.forEach((r,i)=>{
    const x = 24+i*84;
    els.push(rect(x,702,72,36,SURF,{rx:8}));
    els.push(circle(x+14,718,6,r.col,{opacity:0.7}));
    els.push(text(x+24,720,r.item,10,TEXT,{fw:500}));
    els.push(text(x+24,732,r.day,9,MUTED));
  });

  // Nav
  bottomNav('today').forEach(e=>els.push(e));

  return { name:'Today', svg:'', elements: els };
}

// ─── SCREEN 2: MARKETS ────────────────────────────────────────────────────────
function screenMarkets() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  statusBar().forEach(e=>els.push(e));

  // Header
  els.push(text(24,74,'MARKETS',22,TEXT,{fw:700,ls:3}));
  els.push(text(W-24,74,'Near you',12,MUTED,{anchor:'end'}));
  els.push(line(24,84,W-24,84,'rgba(28,22,12,0.1)'));

  // Search bar
  els.push(rect(16,92,W-32,38,SURF,{rx:19,stroke:'rgba(28,22,12,0.1)',sw:1}));
  els.push(text(44,116,'⊕ Search markets, farms…',13,MUTED));

  // Filter pills
  const filters = ['All','Open Now','Organic','Year-round','Weekend'];
  let fx = 16;
  filters.forEach((f,i) => {
    const w = f.length*7+20;
    const isActive = i===0;
    els.push(rect(fx,138,w,26,isActive?EARTH:SURF,{rx:13,stroke:isActive?'none':'rgba(28,22,12,0.15)',sw:1}));
    els.push(text(fx+w/2,155,f,11,isActive?SURF:TEXT,{anchor:'middle',fw:isActive?600:400}));
    fx += w+8;
  });

  // Market list
  const mktList = [
    { name:'Chamonix Saturday Market',  days:'Sat · Sun',   dist:'0.4km',  stalls:'68', rating:'4.9', status:'Open' },
    { name:'Les Houches Farm Stand',     days:'Tue · Fri',   dist:'4.2km',  stalls:'12', rating:'4.8', status:'Closed'},
    { name:'Servoz Harvest Market',      days:'Thu',         dist:'8.7km',  stalls:'24', rating:'4.7', status:'Closed'},
    { name:'Argentière Alpine Growers',  days:'Sat',         dist:'12.3km', stalls:'31', rating:'4.9', status:'Closed'},
    { name:'Sallanches Bio Market',      days:'Wed · Sat',   dist:'18.1km', stalls:'45', rating:'4.6', status:'Open' },
  ];
  mktList.forEach((m,i) => {
    const y = 178 + i*96;
    els.push(rect(16,y,W-32,88,SURF,{rx:12}));
    // Organic blob accent bg
    els.push(circle(W-40,y+44,36,SAGE,{opacity:0.06}));
    // Status badge
    const stColor = m.status==='Open' ? SAGE : MUTED;
    els.push(rect(W-80,y+12,58,18,m.status==='Open'?'rgba(77,122,86,0.12)':'rgba(28,22,12,0.06)',{rx:9}));
    els.push(text(W-51,y+24,m.status,10,stColor,{anchor:'middle',fw:600}));
    // Name
    els.push(text(28,y+26,m.name,13,TEXT,{fw:600}));
    els.push(text(28,y+42,m.days,11,MUTED));
    // Stats row
    els.push(text(28,y+62,'📍 '+m.dist,11,EARTH,{fw:500}));
    els.push(text(120,y+62,m.stalls+' stalls',11,MUTED));
    els.push(text(W-80,y+62,'★ '+m.rating,11,AMBER,{fw:600}));
    els.push(line(28,y+88,W-28,y+88,'rgba(28,22,12,0.05)'));
  });

  bottomNav('markets').forEach(e=>els.push(e));
  return { name:'Markets', svg:'', elements: els };
}

// ─── SCREEN 3: FARM DETAIL ────────────────────────────────────────────────────
function screenFarm() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  statusBar().forEach(e=>els.push(e));

  // Back nav
  els.push(text(24,72,'← Markets',12,EARTH,{fw:500}));

  // Farm hero banner
  els.push(rect(0,82,W,140,EARTH,{rx:0}));
  els.push(circle(60,82+50,56,AMBER,{opacity:0.2}));
  els.push(circle(W-40,82+90,40,SAGE,{opacity:0.15}));
  els.push(text(24,136,'Ferme du Lac',24,SURF,{fw:700}));
  els.push(text(24,158,'Chamonix-Mont-Blanc · Est. 1987',12,SURF,{opacity:0.75}));
  els.push(text(24,178,'★ 4.9 · 214 reviews',12,SURF,{opacity:0.8,fw:500}));
  // Badges
  ['Certified Organic','Biodynamic'].forEach((b,i) => {
    els.push(rect(24+i*110,184,100,20,SURF,{rx:10,opacity:0.2}));
    els.push(text(74+i*110,198,b,9,SURF,{anchor:'middle',fw:600}));
  });

  // Stats strip
  els.push(rect(16,232,W-32,52,SURF,{rx:12}));
  const farmStats = [
    {label:'Hectares',value:'14'},
    {label:'Products', value:'38'},
    {label:'Since',    value:'\'87'},
    {label:'At market',value:'Sat'},
  ];
  farmStats.forEach((s,i) => {
    const x = 48+i*84;
    els.push(text(x,254,s.value,15,EARTH,{fw:700,anchor:'middle'}));
    els.push(text(x,268,s.label,9,MUTED,{anchor:'middle'}));
    if(i<3) els.push(line(x+42,238,x+42,276,'rgba(28,22,12,0.08)'));
  });

  // Products in season
  els.push(text(24,304,'In Season Now',14,TEXT,{fw:700}));
  const farmProd = [
    {name:'Asparagus',  price:'€3.50/bunch', freshness:'Picked yesterday'},
    {name:'Wild Ramps',  price:'€5.00/bag',  freshness:'Picked this morning'},
    {name:'Fiddleheads', price:'€4.00/100g', freshness:'Picked today'},
    {name:'Baby Spinach',price:'€2.80/bag',  freshness:'Picked yesterday'},
  ];
  farmProd.forEach((p,i) => {
    const y = 322+i*62;
    els.push(rect(16,y,W-32,54,SURF,{rx:10}));
    els.push(rect(16,y,4,54,SAGE,{rx:2}));
    els.push(text(30,y+20,p.name,13,TEXT,{fw:600}));
    els.push(text(30,y+36,p.freshness,10,SAGE,{fw:500}));
    els.push(text(W-24,y+20,p.price,13,EARTH,{anchor:'end',fw:600}));
    els.push(text(W-24,y+36,'Add to list →',10,AMBER,{anchor:'end',fw:500}));
  });

  // Reviews strip
  els.push(text(24,568,'Recent Reviews',13,TEXT,{fw:700}));
  const reviews = [
    {text:'"Best asparagus in the valley — absolute must-buy"', stars:5},
    {text:'"Wild ramps sold out fast, arrive before 9am"',      stars:5},
  ];
  reviews.forEach((rv,i)=>{
    const y = 584+i*48;
    els.push(rect(16,y,W-32,42,CARD,{rx:8}));
    els.push(text(28,y+14,'★'.repeat(rv.stars),10,AMBER));
    els.push(text(28,y+28,rv.text,10,MUTED,{opacity:0.85}));
  });

  // About blurb
  els.push(rect(16,684,W-32,46,CARD,{rx:10}));
  els.push(text(28,702,'Family-run alpine farm since 1987. Specialising in',11,TEXT));
  els.push(text(28,718,'heritage vegetables and wild-foraged spring produce.',11,MUTED));

  // CTA
  els.push(rect(16,736,W-32,44,EARTH,{rx:22}));
  els.push(text(W/2,763,'Save Farm · Get Alerts',14,SURF,{anchor:'middle',fw:600}));

  bottomNav('markets').forEach(e=>els.push(e));
  return { name:'Farm Detail', svg:'', elements: els };
}

// ─── SCREEN 4: SEASON CALENDAR ────────────────────────────────────────────────
function screenSeason() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  statusBar().forEach(e=>els.push(e));

  // Header
  els.push(text(24,74,'SEASON',22,TEXT,{fw:700,ls:3}));
  els.push(text(W-24,74,'Chamonix region',12,MUTED,{anchor:'end'}));
  els.push(line(24,84,W-24,84,'rgba(28,22,12,0.1)'));

  // Month selector
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const activeMonth = 3; // April (0-indexed)
  els.push(rect(16,92,W-32,36,SURF,{rx:18}));
  months.forEach((m,i) => {
    const mx = 30 + i*30;
    const isActive = i===activeMonth;
    if(isActive) {
      els.push(rect(mx-8,94,28,32,EARTH,{rx:14}));
    }
    els.push(text(mx+6,114,m,9,isActive?SURF:MUTED,{anchor:'middle',fw:isActive?700:400}));
  });

  // Seasonal chart — horizontal bar style
  els.push(text(24,148,'What\'s In Season · April',14,TEXT,{fw:700}));

  // Color legend
  const legend = [{label:'Peak',col:SAGE},{label:'Available',col:AMBER},{label:'End of season',col:SAND}];
  legend.forEach((l,i)=>{
    els.push(rect(24+i*100,158,10,10,l.col,{rx:5}));
    els.push(text(38+i*100,167,l.label,10,MUTED));
  });

  const seasonData = [
    {name:'Asparagus',   status:'peak',  pct:90},
    {name:'Wild Ramps',  status:'peak',  pct:85},
    {name:'Spinach',     status:'peak',  pct:95},
    {name:'Radishes',    status:'avail', pct:70},
    {name:'Fiddleheads', status:'peak',  pct:75},
    {name:'Snap Peas',   status:'avail', pct:55},
    {name:'Watercress',  status:'end',   pct:30},
    {name:'Leeks',       status:'end',   pct:25},
  ];
  const colMap = {peak:SAGE,avail:AMBER,end:SAND};
  seasonData.forEach((s,i) => {
    const y = 182+i*54;
    els.push(text(24,y+14,s.name,12,TEXT,{fw:500}));
    // Track
    const bw = W-32-100-24;
    els.push(rect(130,y+2,bw,14,CARD,{rx:7}));
    // Fill
    els.push(rect(130,y+2,bw*(s.pct/100),14,colMap[s.status],{rx:7,opacity:0.8}));
    els.push(text(130+bw+8,y+14,s.pct+'%',10,MUTED,{fw:500}));
    els.push(line(24,y+40,W-24,y+40,'rgba(28,22,12,0.06)'));
  });

  // Best combos
  els.push(rect(16,626,W-32,52,CARD,{rx:12}));
  els.push(text(28,645,'April pairing',11,EARTH,{fw:600}));
  els.push(text(28,661,'Asparagus + ramps + poached eggs — all at peak together',10,MUTED));

  bottomNav('season').forEach(e=>els.push(e));
  return { name:'Season', svg:'', elements: els };
}

// ─── SCREEN 5: PANTRY ────────────────────────────────────────────────────────
function screenPantry() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  statusBar().forEach(e=>els.push(e));

  // Header
  els.push(text(24,74,'PANTRY',22,TEXT,{fw:700,ls:3}));
  els.push(text(W-24,74,'+ Add item',12,EARTH,{anchor:'end',fw:500}));
  els.push(line(24,84,W-24,84,'rgba(28,22,12,0.1)'));

  // Summary strip
  els.push(rect(16,92,W-32,60,SURF,{rx:12}));
  const pStats = [
    {label:'In stock',  value:'24'},
    {label:'Shopping list',value:'7'},
    {label:'This week',  value:'€62'},
    {label:'% Local',    value:'78%'},
  ];
  pStats.forEach((s,i)=>{
    const x = 44+i*84;
    els.push(text(x,114,s.value,15,EARTH,{fw:700,anchor:'middle'}));
    els.push(text(x,128,s.label,9,MUTED,{anchor:'middle'}));
    if(i<3) els.push(line(x+40,98,x+40,146,'rgba(28,22,12,0.08)'));
  });

  // Shopping list section
  els.push(text(24,172,'Shopping List',14,TEXT,{fw:700}));
  const shopping = [
    {name:'Asparagus',    from:'Ferme du Lac',    qty:'2 bunches', urgent:true  },
    {name:'Free-range eggs',from:'Poulet Alpin',  qty:'1 dozen',   urgent:true  },
    {name:'Wild garlic',  from:'Any forager stall',qty:'1 bag',    urgent:false },
    {name:'Alpine cheese',from:'Fromagerie Cham.',qty:'200g',      urgent:false },
    {name:'Honey',        from:'Ruche du Mont',   qty:'1 jar',     urgent:false },
  ];
  shopping.forEach((it,i) => {
    const y = 190+i*54;
    els.push(rect(16,y,W-32,46,SURF,{rx:10}));
    // Checkbox
    els.push(rect(28,y+15,16,16,it.urgent?EARTH:'rgba(28,22,12,0.12)',{rx:8}));
    if(it.urgent) els.push(text(36,y+26,'✓',9,SURF,{anchor:'middle',fw:700}));
    els.push(text(54,y+20,it.name,13,TEXT,{fw:600}));
    els.push(text(54,y+34,it.from,10,MUTED));
    els.push(text(W-24,y+20,it.qty,11,MUTED,{anchor:'end'}));
    if(it.urgent) {
      els.push(rect(W-80,y+30,52,12,AMBER,{rx:6,opacity:0.15}));
      els.push(text(W-54,y+39,'Get today',9,AMBER,{anchor:'middle',fw:500}));
    }
  });

  // In stock section
  els.push(text(24,476,'In Stock',14,TEXT,{fw:700}));
  const inStock = [
    {name:'Carrots',     farm:'Ferme du Lac',  added:'2 days ago', qty:'1 bunch'  },
    {name:'Kale',        farm:'Vallée Verte',  added:'Today',      qty:'1 bag'    },
    {name:'New potatoes',farm:'Alpine Roots',  added:'3 days ago', qty:'500g'     },
  ];
  inStock.forEach((it,i)=>{
    const y = 494+i*60;
    els.push(rect(16,y,W-32,52,CARD,{rx:10}));
    els.push(circle(30,y+26,8,SAGE,{opacity:0.6}));
    els.push(text(46,y+20,it.name,13,TEXT,{fw:600}));
    els.push(text(46,y+34,it.farm+' · '+it.added,10,MUTED));
    els.push(text(W-24,y+27,it.qty,11,MUTED,{anchor:'end'}));
  });

  bottomNav('pantry').forEach(e=>els.push(e));
  return { name:'Pantry', svg:'', elements: els };
}

// ─── SCREEN 6: PROFILE / YOU ──────────────────────────────────────────────────
function screenProfile() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  statusBar().forEach(e=>els.push(e));

  // Header
  els.push(text(24,74,'YOU',22,TEXT,{fw:700,ls:3}));
  els.push(text(W-24,74,'Settings',12,MUTED,{anchor:'end'}));
  els.push(line(24,84,W-24,84,'rgba(28,22,12,0.1)'));

  // Avatar + name
  els.push(circle(W/2,134,40,EARTH,{opacity:0.15}));
  els.push(circle(W/2,134,40,EARTH,{stroke:EARTH,sw:2,opacity:0})); // ring
  els.push(text(W/2,130,'MV',20,EARTH,{anchor:'middle',fw:700}));
  els.push(text(W/2,150,'Sophie Muller',16,TEXT,{anchor:'middle',fw:700}));
  els.push(text(W/2,168,'Chamonix-Mont-Blanc · Member since Jan 2024',11,MUTED,{anchor:'middle'}));

  // Impact stats
  els.push(text(24,200,'Your Local Food Impact',14,TEXT,{fw:700}));
  els.push(rect(16,216,W-32,72,SURF,{rx:14}));
  const impact = [
    {label:'Markets visited',  value:'47'},
    {label:'Farms supported',  value:'12'},
    {label:'Local spend',      value:'€840'},
    {label:'CO₂ saved',        value:'18kg'},
  ];
  impact.forEach((s,i)=>{
    const x = 44+i*84;
    els.push(text(x,242,s.value,16,SAGE,{fw:700,anchor:'middle'}));
    els.push(text(x,258,s.label,9,MUTED,{anchor:'middle'}));
    if(i<3) els.push(line(x+40,222,x+40,282,'rgba(28,22,12,0.08)'));
  });

  // Favourite farms
  els.push(text(24,308,'Saved Farms',14,TEXT,{fw:700}));
  const faves = [
    {name:'Ferme du Lac',      tag:'Organic · Vegetables'},
    {name:'Alpine Roots',      tag:'Biodynamic · Mixed'},
    {name:'Ruche du Mont',     tag:'Artisan · Honey'},
  ];
  faves.forEach((f,i)=>{
    const y = 326+i*56;
    els.push(rect(16,y,W-32,48,SURF,{rx:10}));
    els.push(circle(34,y+24,10,EARTH,{opacity:0.15}));
    els.push(text(34,y+27,'⊕',10,EARTH,{anchor:'middle'}));
    els.push(text(54,y+20,f.name,13,TEXT,{fw:600}));
    els.push(text(54,y+34,f.tag,10,MUTED));
    els.push(text(W-24,y+24,'→',14,MUTED,{anchor:'end'}));
    els.push(line(54,y+48,W-24,y+48,'rgba(28,22,12,0.06)'));
  });

  // Badges
  els.push(text(24,500,'Badges Earned',14,TEXT,{fw:700}));
  const badges = [
    {icon:'◉',label:'Early Spring',     col:SAGE  },
    {icon:'⊟',label:'Market Regular',   col:EARTH },
    {icon:'◈',label:'5 Farms Saved',    col:AMBER },
    {icon:'◇',label:'Zero Waste Week',  col:SAGE  },
    {icon:'◎',label:'Local Champion',   col:BLUSH },
    {icon:'⊕',label:'Wild Forager',     col:EARTH },
  ];
  badges.forEach((b,i)=>{
    const col = i%3===0?16:i%3===1?W/2-55:W-90;
    const y   = 518+Math.floor(i/3)*64;
    els.push(rect(col,y,80,56,SURF,{rx:10}));
    els.push(text(col+40,y+24,b.icon,18,b.col,{anchor:'middle'}));
    els.push(text(col+40,y+42,b.label,9,MUTED,{anchor:'middle'}));
  });

  // Food values
  els.push(rect(16,658,W-32,42,CARD,{rx:10}));
  els.push(text(28,676,'Your values: ',11,MUTED));
  els.push(text(104,676,'Organic · Biodynamic · Local · Seasonal',11,EARTH,{fw:500}));

  bottomNav('profile').forEach(e=>els.push(e));
  return { name:'Profile', svg:'', elements: els };
}

// ─── ASSEMBLE ─────────────────────────────────────────────────────────────────
const screens = [
  screenToday(),
  screenMarkets(),
  screenFarm(),
  screenSeason(),
  screenPantry(),
  screenProfile(),
];

let total = 0;
screens.forEach(s => { total += s.elements.length; });

const pen = {
  version: '2.8',
  metadata: {
    name: 'CAMPO',
    author: 'RAM',
    date: '2026-04-09',
    theme: 'light',
    heartbeat: 46,
    elements: total,
  },
  screens,
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`CAMPO: ${screens.length} screens, ${total} elements`);
console.log(`Written: ${SLUG}.pen`);
