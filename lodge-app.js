'use strict';
// LODGE — Boutique Nature Retreats
// Light editorial theme. Warm cream + bark brown + sage green.
// Inspired by: Moke Valley Cabin (Siteinspire), Kinn Collective editorial aesthetic
// 6 screens: Discover, Property, Book, Guest Details/Cancel Policy, Confirmation, My Trips

const fs   = require('fs');
const path = require('path');

// ── Palette ─────────────────────────────────────────────────────────────────
const BG       = '#FAF7F2';   // warm cream
const SURFACE  = '#FFFFFF';
const CARD     = '#F5F1EB';
const CARD2    = '#EDE9E1';
const BORDER   = '#DDD8CE';
const BORDER2  = '#C8C0B4';
const TEXT     = '#2A2018';   // dark espresso
const TEXT2    = '#7A6E62';   // warm muted
const TEXT3    = '#A89E94';   // faint warm gray
const BARK     = '#4A3728';   // bark brown (primary accent)
const BARK2    = '#6B4E38';   // medium bark
const SAGE     = '#7B9B6B';   // sage green
const SAGE2    = '#5C7A4E';   // deep sage
const GOLD     = '#C4973C';   // warm gold
const CREAM2   = '#F0EBE0';   // slightly deeper cream
const ROSE     = '#B85C4A';   // warm terracotta (alert/cancel)
const W = 390;
const H = 844;

let elements = [];
let eid = 1;
function uid()  { return `el-${eid++}`; }

function rect(x,y,w,h,fill,opts={}) {
  elements.push({ id:uid(), type:'rect', x,y, width:w, height:h, fill,
    rx:opts.rx||0, opacity:opts.opacity||1,
    stroke:opts.stroke||'none', strokeWidth:opts.sw||0 });
}
function text(x,y,content,size,fill,opts={}) {
  elements.push({ id:uid(), type:'text', x,y, content:String(content),
    fontSize:size, fill,
    fontWeight:opts.weight||'normal',
    fontFamily:opts.font||'Inter',
    textAnchor:opts.anchor||'start',
    opacity:opts.opacity||1 });
}
function circle(cx,cy,r,fill,opts={}) {
  elements.push({ id:uid(), type:'circle', cx,cy,r, fill,
    stroke:opts.stroke||'none', strokeWidth:opts.sw||0,
    opacity:opts.opacity||1 });
}
function line(x1,y1,x2,y2,stroke,sw=1,opts={}) {
  elements.push({ id:uid(), type:'line', x1,y1,x2,y2, stroke, strokeWidth:sw,
    opacity:opts.opacity||1 });
}

// ── Shared helpers ──────────────────────────────────────────────────────────
function statusBar() {
  rect(0,0,W,44,BG);
  text(20,28,'9:41',13,TEXT2,{weight:'500'});
  rect(W-50,16,22,11,'none',{rx:2,stroke:TEXT3,sw:1.5});
  rect(W-48,18,14,7,TEXT3,{rx:1});
  rect(W-26,20,3,4,TEXT3,{rx:1});
  circle(W-66,22,3,TEXT3);
  circle(W-74,22,3,TEXT3);
  circle(W-82,22,3,TEXT3);
}

function topNav(label, opts={}) {
  rect(0,44,W,56,BG);
  line(0,100,W,100,BORDER,0.5);
  if (opts.back) {
    text(20,78,'←',18,TEXT2);
    text(44,78,label,16,TEXT,{weight:'600'});
  } else {
    text(W/2,78,label,16,TEXT,{weight:'700',font:'Playfair Display',anchor:'middle'});
  }
  if (opts.right) {
    text(W-20,78,opts.right,13,BARK,{anchor:'end',weight:'500'});
  }
}

function bottomNav(activeIdx) {
  rect(0,H-84,W,84,SURFACE);
  line(0,H-84,W,H-84,BORDER,0.5);
  const tabs = [{icon:'⌂',label:'Discover'},{icon:'♡',label:'Saved'},{icon:'◷',label:'Trips'},{icon:'◉',label:'Profile'}];
  const tw = W / tabs.length;
  tabs.forEach((t,i) => {
    const cx = tw*i + tw/2;
    const isA = i===activeIdx;
    const clr = isA ? BARK : TEXT3;
    if (isA) { rect(cx-18,H-84,36,3,BARK,{rx:1.5}); }
    text(cx,H-53,t.icon,18,clr,{anchor:'middle'});
    text(cx,H-34,t.label,9,clr,{anchor:'middle',weight:isA?'600':'400'});
  });
}

function pill(x,y,w,h,fill,label,clr,size=10) {
  rect(x,y,w,h,fill,{rx:h/2});
  text(x+w/2,y+h/2+size*0.38,label,size,clr,{anchor:'middle',weight:'600'});
}

function card(x,y,w,h,fill=CARD) {
  rect(x,y,w,h,fill,{rx:16});
}

// ── Nature photo sim: layered abstract rects ─────────────────────────────
function photoSim(x,y,w,h,palette,opts={}) {
  const r = opts.rx !== undefined ? opts.rx : 0;
  rect(x,y,w,h,palette[0],{rx:r});
  // Sky band
  rect(x,y,w,h*0.45,palette[1],{rx:r});
  // Tree silhouettes
  const treeCount = 5;
  for (let i=0; i<treeCount; i++) {
    const tx = x + (w/(treeCount+1))*(i+1) - 6;
    const th = h*0.35 + i%2*h*0.08;
    rect(tx,y+h*0.2,12,th,palette[2],{rx:3});
    // canopy
    circle(tx+6, y+h*0.2, 14+i%3*4, palette[2],{opacity:0.8});
  }
  // Ground/meadow
  rect(x, y+h*0.65, w, h*0.35, palette[3], {rx:r});
}

const FOREST_PALETTE = ['#8FA884','#C8D8B8','#3D5C35','#6B8A58'];
const LAKE_PALETTE   = ['#7A9BB5','#B8CEE0','#2A4A6A','#5A7E9A'];
const DESERT_PALETTE = ['#C8A87A','#E8D4B0','#8B6A3A','#A88A58'];
const CABIN_PALETTE  = ['#9B7B5A','#D4B89A','#4A3020','#7A5A38'];

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Discover
// ═══════════════════════════════════════════════════════════════════════════
function buildScreen1() {
  elements = [];
  rect(0,0,W,H,BG);
  statusBar();

  // Header
  rect(0,44,W,60,BG);
  text(20,72,'Lodge',22,TEXT,{weight:'700',font:'Playfair Display'});
  text(20,90,'Find your perfect escape',12,TEXT2);
  // map icon
  rect(W-48,54,32,32,CARD,{rx:10,stroke:BORDER,sw:1});
  text(W-32,74,'◉',14,BARK,{anchor:'middle'});

  // Search bar
  rect(16,112,W-32,44,SURFACE,{rx:22,stroke:BORDER,sw:1.5});
  text(44,138,'🔍',14);
  text(60,138,'Where are you escaping to?',13,TEXT3);
  rect(W-60,118,44,32,BARK,{rx:16});
  text(W-38,138,'⊞',13,SURFACE,{anchor:'middle'});

  // Category pills
  const cats = ['All','Cabins','Lakeside','Forest','Desert','Mountain'];
  let cpx = 16;
  cats.forEach((c,i) => {
    const cw = c.length*7+22;
    rect(cpx,164,cw,28,i===0?BARK:CREAM2,{rx:14,stroke:i===0?'none':BORDER,sw:1});
    text(cpx+cw/2,182,c,11,i===0?SURFACE:TEXT2,{anchor:'middle',weight:'500'});
    cpx += cw+8;
  });

  // Section title
  text(20,208,'Featured Retreats',14,TEXT,{weight:'700',font:'Playfair Display'});
  text(W-20,208,'See all',12,BARK,{anchor:'end'});

  // Hero feature card (large)
  card(16,222,W-32,200,SURFACE);
  photoSim(16,222,W-32,130,FOREST_PALETTE,{rx:12});
  // price badge on photo
  pill(W-88,232,66,24,'rgba(250,247,242,0.92)','From $280',BARK,10);
  // rating on photo
  rect(26,234,56,22,'rgba(250,247,242,0.88)',{rx:11});
  text(36,249,'★ 4.9',11,GOLD,{weight:'700'});
  // card body
  text(30,362,'Tall Pines Retreat',15,TEXT,{weight:'700',font:'Playfair Display'});
  text(30,380,'Olympic Peninsula, WA',12,TEXT2);
  // amenities row
  const amens = ['🌲 Forest','🛁 Hot tub','🔥 Fireplace'];
  amens.forEach((a,i) => {
    text(30+i*116,396,a,10,TEXT3);
  });

  // 2-column small cards
  text(20,434,'More Nearby',14,TEXT,{weight:'700',font:'Playfair Display'});

  const smCards = [
    {title:'Lakehouse Studio',loc:'Hood River, OR',price:'$190',pal:LAKE_PALETTE},
    {title:'Desert Clay Dome',loc:'Joshua Tree, CA',price:'$240',pal:DESERT_PALETTE},
  ];
  smCards.forEach((sc,i) => {
    const sx = 16 + i*((W-40)/2+4);
    const sw = (W-40)/2;
    card(sx,448,sw,140,SURFACE);
    photoSim(sx,448,sw,80,sc.pal,{rx:10});
    text(sx+10,538,sc.title,12,TEXT,{weight:'600'});
    text(sx+10,554,sc.loc,10,TEXT2);
    text(sx+10,570,sc.price+'/night',11,BARK,{weight:'600'});
  });

  // Map preview strip
  rect(0,606,W,74,CARD2);
  line(0,606,W,606,BORDER,0.5);
  rect(16,616,W-32,54,CREAM2,{rx:10,stroke:BORDER,sw:1});
  // minimal map dots
  circle(100,643,4,SAGE);
  circle(180,635,4,SAGE);
  circle(250,650,5,BARK);
  circle(310,638,4,SAGE);
  text(W/2,647,'View map',12,TEXT2,{anchor:'middle'});

  bottomNav(0);
  return elements;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Property Detail
// ═══════════════════════════════════════════════════════════════════════════
function buildScreen2() {
  elements = [];
  rect(0,0,W,H,BG);
  statusBar();

  // Full photo header
  photoSim(0,44,W,280,CABIN_PALETTE,{rx:0});
  // Back button
  circle(30,68,16,'rgba(250,247,242,0.88)');
  text(30,72,'←',14,TEXT,{anchor:'middle'});
  // Heart
  circle(W-30,68,16,'rgba(250,247,242,0.88)');
  text(W-30,72,'♡',14,TEXT,{anchor:'middle'});
  // Photo count
  pill(W-72,288,'54px'?0:0,0,'','','');  // skip
  rect(W-72,290,54,22,'rgba(0,0,0,0.45)',{rx:11});
  text(W-45,305,'1 / 8',10,SURFACE,{anchor:'middle'});

  // Main content area
  rect(0,324,W,H-324,BG);
  rect(0,324,W,12,BG,{rx:0});

  // Title + rating
  text(20,348,'Tall Pines Retreat',22,TEXT,{weight:'700',font:'Playfair Display'});
  text(20,372,'Olympic Peninsula, Washington',13,TEXT2);
  // stars
  text(W-20,354,'★ 4.9',14,GOLD,{anchor:'end',weight:'700'});
  text(W-20,372,'84 reviews',11,TEXT3,{anchor:'end'});

  line(20,386,W-20,386,BORDER,0.5);

  // Host row
  circle(36,410,16,BARK2);
  text(36,414,'J',11,SURFACE,{anchor:'middle',weight:'700'});
  text(58,404,'Hosted by James',13,TEXT,{weight:'600'});
  text(58,420,'Superhost · 4 years hosting',11,TEXT2);

  line(20,436,W-20,436,BORDER,0.5);

  // Stats row
  const stats = [{v:'2',l:'Bedrooms'},{v:'1',l:'Bathroom'},{v:'4',l:'Guests'},{v:'3ac',l:'Property'}];
  const sw4 = (W-40)/4;
  stats.forEach((s,i) => {
    const sx = 20+i*sw4;
    text(sx+sw4/2,460,s.v,18,BARK,{anchor:'middle',weight:'700',font:'Playfair Display'});
    text(sx+sw4/2,476,s.l,9,TEXT3,{anchor:'middle'});
    if (i<3) line(sx+sw4,448,sx+sw4,480,BORDER,0.5);
  });

  line(20,490,W-20,490,BORDER,0.5);

  // Description
  text(20,510,'About this space',14,TEXT,{weight:'700'});
  const descLines = [
    'A handcrafted cabin nestled among old-growth',
    'Douglas fir on 3 private acres. Floor-to-ceiling',
    'windows frame forest views from every room.',
    'The wood-fired hot tub is lit at dusk.',
  ];
  descLines.forEach((l,i) => text(20,530+i*18,l,12,TEXT2));

  // Amenities
  text(20,610,'Amenities',14,TEXT,{weight:'700'});
  const amens = [
    ['🌲','Forest trails'],['🛁','Hot tub'],['🔥','Fireplace'],
    ['☕','Espresso bar'],['🌐','Wi-Fi'],['🚗','Free parking'],
  ];
  amens.forEach((a,i) => {
    const ax = i%2===0 ? 20 : W/2;
    const ay = 630 + Math.floor(i/2)*26;
    text(ax,ay,a[0],13,{});
    text(ax+22,ay,a[1],12,TEXT2);
  });

  // CTA strip
  rect(0,H-84,W,84,SURFACE);
  line(0,H-84,W,H-84,BORDER,0.5);
  text(20,H-55,'$280',20,BARK,{weight:'700',font:'Playfair Display'});
  text(74,H-55,'/night',13,TEXT2);
  text(20,H-36,'5 nights · $1,400 total',11,TEXT3);
  rect(W-144,H-74,128,44,BARK,{rx:22});
  text(W-80,H-47,'Reserve →',14,SURFACE,{anchor:'middle',weight:'600'});

  return elements;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Book / Date Picker
// ═══════════════════════════════════════════════════════════════════════════
function buildScreen3() {
  elements = [];
  rect(0,0,W,H,BG);
  statusBar();
  topNav('Select dates',{back:true});

  // Month title
  text(W/2,124,'April 2026',16,TEXT,{weight:'700',font:'Playfair Display',anchor:'middle'});
  // Nav arrows
  text(24,124,'‹',20,TEXT2);
  text(W-24,124,'›',20,TEXT2,{anchor:'end'});

  // Day headers
  const days = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  days.forEach((d,i) => text(24+i*52,148,d,11,TEXT3,{anchor:'middle'}));

  // Calendar grid (April 2026: starts Tue=col 2)
  line(16,156,W-16,156,BORDER,0.5);
  const startCol = 2; // Tuesday
  for (let d=1; d<=30; d++) {
    const idx  = d - 1 + startCol;
    const col  = idx % 7;
    const row  = Math.floor(idx / 7);
    const cx   = 24 + col*52;
    const cy   = 176 + row*52;
    const inRange  = d>=12 && d<=17;
    const isStart  = d===12;
    const isEnd    = d===17;
    const isPast   = d<7;
    if (isStart || isEnd) {
      circle(cx,cy,18,BARK);
      text(cx,cy+5,d,13,SURFACE,{anchor:'middle',weight:'700'});
    } else if (inRange) {
      rect(cx-18,cy-18,36,36,CREAM2);
      text(cx,cy+5,d,13,BARK,{anchor:'middle',weight:'600'});
    } else if (isPast) {
      text(cx,cy+5,d,13,TEXT3,{anchor:'middle',opacity:0.4});
    } else {
      text(cx,cy+5,d,13,TEXT,{anchor:'middle'});
    }
  }

  // Legend
  const legendY = 460;
  circle(34,legendY,6,BARK);
  text(46,legendY+4,'Check-in',11,TEXT2);
  circle(W/2+10,legendY,6,BARK);
  text(W/2+22,legendY+4,'Check-out',11,TEXT2);

  line(16,476,W-16,476,BORDER,0.5);

  // Booking summary
  text(20,500,'Your stay',14,TEXT,{weight:'700'});
  const summary = [
    {label:'Check-in',  val:'Sat, Apr 12'},
    {label:'Check-out', val:'Thu, Apr 17'},
    {label:'Duration',  val:'5 nights'},
    {label:'Guests',    val:'2 adults'},
  ];
  summary.forEach((s,i) => {
    const sy = 522+i*36;
    text(20,sy,s.label,12,TEXT2);
    text(W-20,sy,s.val,12,TEXT,{anchor:'end',weight:'500'});
    if (i<3) line(20,sy+12,W-20,sy+12,BORDER,0.3,{opacity:0.5});
  });

  line(16,672,W-16,672,BORDER,0.5);

  // Price breakdown
  text(20,692,'$280 × 5 nights',13,TEXT2);
  text(W-20,692,'$1,400',13,TEXT,{anchor:'end',weight:'600'});
  text(20,714,'Cleaning fee',13,TEXT2);
  text(W-20,714,'$85',13,TEXT,{anchor:'end',weight:'600'});

  // CTA
  rect(16,H-68,W-32,48,BARK,{rx:24});
  text(W/2,H-39,'Continue →',15,SURFACE,{anchor:'middle',weight:'600'});

  return elements;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Guest Details + Cancellation Policy (the destructive-adjacent moment)
// ═══════════════════════════════════════════════════════════════════════════
function buildScreen4() {
  elements = [];
  rect(0,0,W,H,BG);
  statusBar();
  topNav('Guest details',{back:true});

  // Progress steps
  const steps = ['Dates','Details','Review','Pay'];
  const sw4   = (W-32)/4;
  steps.forEach((s,i) => {
    const sx = 16 + i*sw4;
    const isDone   = i<1;
    const isActive = i===1;
    rect(sx,108,sw4-4,3,isDone||isActive?BARK:BORDER,{rx:1.5});
    text(sx+sw4/2,120,s,9,isActive?BARK:TEXT3,{anchor:'middle',weight:isActive?'600':'400'});
  });

  // Guest form
  const fields = [
    {label:'First name',    val:'Sarah'},
    {label:'Last name',     val:'Chen'},
    {label:'Email',         val:'sarah.chen@gmail.com'},
    {label:'Mobile',        val:'+1 (415) 555-0192'},
  ];
  let fy = 138;
  fields.forEach(f => {
    text(20,fy,f.label,11,TEXT3);
    rect(16,fy+8,W-32,40,SURFACE,{rx:10,stroke:BORDER,sw:1.5});
    text(28,fy+32,f.val,13,TEXT);
    fy += 56;
  });

  // Special requests
  text(20,fy+4,'Special requests (optional)',11,TEXT3);
  rect(16,fy+12,W-32,64,SURFACE,{rx:10,stroke:BORDER,sw:1.5});
  text(28,fy+38,'Early check-in if possible',13,TEXT2);

  // Cancellation policy — the key screen
  const cpY = fy+90;
  rect(16,cpY,W-32,148,CREAM2,{rx:14,stroke:BORDER,sw:1});
  rect(16,cpY,3,148,ROSE,{rx:2});

  text(28,cpY+22,'Cancellation policy',13,TEXT,{weight:'700'});
  text(W-24,cpY+22,'Moderate',12,ROSE,{anchor:'end',weight:'600'});

  const policy = [
    {icon:'✓',color:SAGE2, text:'Free cancellation until Apr 5'},
    {icon:'◑',color:GOLD,  text:'50% refund Apr 5–10'},
    {icon:'✕',color:ROSE,  text:'No refund after Apr 10'},
  ];
  policy.forEach((p,i) => {
    const py = cpY+44+i*32;
    circle(28,py+8,8,p.color+'22');
    text(28,py+12,p.icon,9,p.color,{anchor:'middle',weight:'700'});
    text(44,py+12,p.text,12,TEXT2);
  });

  text(28,cpY+144,'Dates cannot be modified within 72hrs of check-in.',10,TEXT3);

  // Terms checkbox
  const tY = cpY+162;
  rect(20,tY,18,18,BARK,{rx:4});
  text(27,tY+13,'✓',10,SURFACE,{anchor:'middle',weight:'700'});
  text(46,tY+13,'I agree to the House Rules and Cancellation Policy',10,TEXT2);

  // CTA
  rect(16,H-68,W-32,48,BARK,{rx:24});
  text(W/2,H-39,'Review booking →',15,SURFACE,{anchor:'middle',weight:'600'});

  return elements;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Confirmation
// ═══════════════════════════════════════════════════════════════════════════
function buildScreen5() {
  elements = [];
  rect(0,0,W,H,BG);
  statusBar();

  // Confirmation hero
  rect(0,44,W,200,BARK);
  // subtle texture
  for (let i=0; i<12; i++) {
    rect(i*36,44+i*12,120,2,BARK2,{opacity:0.3});
  }
  // success icon
  circle(W/2,116,32,'rgba(255,255,255,0.15)');
  circle(W/2,116,22,SURFACE);
  text(W/2,120,'✓',16,SAGE2,{anchor:'middle',weight:'700'});
  text(W/2,158,'Booking Confirmed',18,SURFACE,{anchor:'middle',weight:'700',font:'Playfair Display'});
  text(W/2,178,'You\'re going to the Olympic Peninsula',13,'rgba(255,255,255,0.75)',{anchor:'middle'});
  text(W/2,196,'Confirmation #LDG-8471',11,'rgba(255,255,255,0.55)',{anchor:'middle',font:'SF Mono'});

  // Summary card
  card(16,260,W-32,200,SURFACE);
  // mini photo
  photoSim(24,268,80,60,CABIN_PALETTE,{rx:8});
  text(116,280,'Tall Pines Retreat',14,TEXT,{weight:'700'});
  text(116,298,'Olympic Peninsula, WA',11,TEXT2);
  text(116,314,'★ 4.9 · Superhost',11,GOLD,{weight:'600'});

  line(28,336,W-28,336,BORDER,0.5);

  const confDetails = [
    {l:'Check-in',  v:'Sat, Apr 12 · 3pm'},
    {l:'Check-out', v:'Thu, Apr 17 · 11am'},
    {l:'Guests',    v:'2 adults'},
    {l:'Total',     v:'$1,575'},
  ];
  confDetails.forEach((d,i) => {
    text(28,356+i*24,d.l,11,TEXT2);
    text(W-28,356+i*24,d.v,11,TEXT,{anchor:'end',weight:'500'});
  });

  line(28,452,W-28,452,BORDER,0.5);
  text(28,472,'Total charged',12,TEXT2);
  text(W-28,472,'$1,575',16,BARK,{anchor:'end',weight:'700',font:'Playfair Display'});

  // Host message
  card(16,490,W-32,80,CREAM2);
  circle(36,522,16,BARK2);
  text(36,526,'J',11,SURFACE,{anchor:'middle',weight:'700'});
  text(60,508,'James says:',11,TEXT3);
  text(60,524,'"Looking forward to hosting you.',12,TEXT2);
  text(60,540,'Firewood will be ready on arrival."',12,TEXT2);

  // Action buttons
  rect(16,588,W-32,44,BARK,{rx:22});
  text(W/2,615,'View trip details',14,SURFACE,{anchor:'middle',weight:'600'});

  rect(16,640,W-32,44,'none',{rx:22,stroke:BARK,sw:1.5});
  text(W/2,667,'Message James',14,BARK,{anchor:'middle',weight:'600'});

  // Map teaser
  card(16,696,W-32,56,CREAM2);
  text(36,722,'📍',14);
  text(56,718,'Get directions to the retreat',13,TEXT);
  text(56,734,'Olympic Peninsula · 3h 20m from Seattle',11,TEXT2);
  text(W-28,722,'→',16,BARK,{anchor:'end'});

  bottomNav(2);
  return elements;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 6 — My Trips
// ═══════════════════════════════════════════════════════════════════════════
function buildScreen6() {
  elements = [];
  rect(0,0,W,H,BG);
  statusBar();
  topNav('My Trips',{right:'Archive'});

  // Upcoming section
  text(20,118,'Upcoming',14,TEXT,{weight:'700',font:'Playfair Display'});

  // Active trip card
  card(16,134,W-32,160,SURFACE);
  photoSim(16,134,100,160,CABIN_PALETTE,{rx:12});
  // right side
  pill(124,142,76,20,SAGE2+'22','UPCOMING',SAGE2,8);
  text(124,176,'Tall Pines Retreat',14,TEXT,{weight:'700'});
  text(124,194,'Apr 12–17 · 5 nights',11,TEXT2);
  text(124,210,'Olympic Peninsula, WA',11,TEXT3);
  line(124,224,W-28,224,BORDER,0.3);
  text(124,242,'3 days away',11,SAGE2,{weight:'600'});
  text(W-28,242,'View →',11,BARK,{anchor:'end'});

  // Past trips
  text(20,314,'Past Trips',14,TEXT,{weight:'700',font:'Playfair Display'});

  const past = [
    {title:'Lakehouse Studio',  loc:'Hood River, OR',  dates:'Mar 1–4',  rating:'5.0', pal:LAKE_PALETTE},
    {title:'Desert Clay Dome',  loc:'Joshua Tree, CA', dates:'Jan 18–22',rating:'4.8', pal:DESERT_PALETTE},
    {title:'Forest Micro-cabin',loc:'Ashland, OR',     dates:'Dec 8–11', rating:'4.9', pal:FOREST_PALETTE},
  ];

  past.forEach((p,i) => {
    const py = 330+i*130;
    card(16,py,W-32,118,SURFACE);
    photoSim(16,py,72,118,p.pal,{rx:10});
    pill(96,py+10,68,20,CARD,'COMPLETED',TEXT3,8);
    text(96,py+44,p.title,13,TEXT,{weight:'600'});
    text(96,py+62,p.loc,11,TEXT2);
    text(96,py+78,p.dates,11,TEXT3);
    text(96,py+96,'★ '+p.rating,11,GOLD,{weight:'700'});
    text(W-28,py+96,'Review →',11,BARK,{anchor:'end'});
  });

  bottomNav(2);
  return elements;
}

// ── SVG renderer ────────────────────────────────────────────────────────────
function toSvg(els) {
  const parts = els.map(el => {
    if (el.type==='rect') {
      const r  = el.rx  ? ` rx="${el.rx}"` : '';
      const st = el.stroke!=='none' ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth}"` : '';
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}"${r}${st} opacity="${el.opacity||1}"/>`;
    }
    if (el.type==='text') {
      const fw = el.fontWeight!=='normal' ? ` font-weight="${el.fontWeight}"` : '';
      const ff = ` font-family="${el.fontFamily||'Inter'}, sans-serif"`;
      const ta = el.textAnchor&&el.textAnchor!=='start' ? ` text-anchor="${el.textAnchor}"` : '';
      const op = el.opacity!==1 ? ` opacity="${el.opacity}"` : '';
      const safe = String(el.content||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
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

const screenBuilders = [
  {fn:buildScreen1, name:'Discover'},
  {fn:buildScreen2, name:'Property Detail'},
  {fn:buildScreen3, name:'Book / Date Picker'},
  {fn:buildScreen4, name:'Guest Details & Policy'},
  {fn:buildScreen5, name:'Confirmation'},
  {fn:buildScreen6, name:'My Trips'},
];

const pen = {
  version: '2.8',
  metadata: {
    name: 'Lodge — Boutique Nature Retreats',
    description: 'Light editorial booking app for boutique cabin stays. Warm cream, bark brown, sage green. 6 screens.',
    author: 'RAM',
    created: new Date().toISOString(),
  },
  screens: screenBuilders.map(({fn,name}) => {
    const els = fn();
    return { name, svg: toSvg(els), elements: els };
  }),
};

const total = pen.screens.reduce((a,s)=>a+s.elements.length,0);
console.log(`LODGE: ${pen.screens.length} screens, ${total} elements`);
fs.writeFileSync(path.join(__dirname,'lodge.pen'), JSON.stringify(pen,null,2));
console.log('Written: lodge.pen');
