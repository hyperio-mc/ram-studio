// GILT — The card that opens every door
// Inspired by: Atlas Card (godly.website) + Cardless (land-book.com)
// Trend: luxury concierge fintech — warm ivory palette, editorial typography
// Theme: LIGHT (previous 'shade' was dark)

const fs = require('fs');

const W = 390, H = 844;

const bg       = '#FAF8F4';
const surface  = '#FFFFFF';
const surface2 = '#F3EFE7';
const text      = '#1A1614';
const textMid   = '#6B5D55';
const textMute  = '#9C8D84';
const gold      = '#B8965A';
const goldDark  = '#8B6914';
const goldLight = '#E8D5A3';
const divider   = 'rgba(26,22,20,0.10)';
const shadow    = 'rgba(26,22,20,0.08)';
const white     = '#FAF8F4';

function r(x,y,w,h,fill,opts={}) {
  return { type:'rectangle', x, y, width:w, height:h, fill,
    radius: opts.radius||0, border:opts.border, shadow:opts.shadow, opacity:opts.opacity };
}
function t(x,y,content,size,color,opts={}) {
  return { type:'text', x, y, content, fontSize:size, color,
    fontWeight:opts.weight||400, fontFamily:opts.family||'Georgia',
    textAlign:opts.align||'left', letterSpacing:opts.ls||0,
    width:opts.width||300, lineHeight:opts.lh||1.3 };
}
function s(x,y,content,size,color,opts={}) {
  return t(x,y,content,size,color,{...opts,family:'Inter'});
}
function sr(x,y,content,size,color,opts={}) {
  return t(x,y,content,size,color,{...opts,family:'Georgia'});
}
function ln(x1,y1,x2,y2,color,opts={}) {
  return { type:'line', x1,y1,x2,y2, color, width:opts.width||1 };
}
function c(x,y,rad,fill,opts={}) {
  return { type:'ellipse', x:x-rad, y:y-rad, width:rad*2, height:rad*2, fill, border:opts.border };
}
function ic(x,y,iconType,color,size=20) {
  return { type:'icon', x, y, icon:iconType, color, size };
}

function statusBar(bgColor) {
  bgColor = bgColor || bg;
  return [
    r(0,0,W,50,bgColor),
    s(20,16,'9:41',15,text,{weight:600}),
    s(W-70,16,'●●●',13,text,{align:'right',width:60}),
  ];
}

function bottomNav(active) {
  active = active || 0;
  var items = [
    {label:'Home',icon:'home'},
    {label:'Venues',icon:'map'},
    {label:'Concierge',icon:'message'},
    {label:'Card',icon:'layers'},
    {label:'Insights',icon:'chart'},
  ];
  var els = [
    r(0,H-90,W,90,surface),
    ln(0,H-90,W,H-90,divider),
  ];
  items.forEach(function(item,i){
    var x = 20 + i*72;
    var isActive = i===active;
    els.push(ic(x+16,H-72,item.icon,isActive?gold:textMute,22));
    els.push(s(x,H-44,item.label,9,isActive?gold:textMute,{align:'center',width:56,weight:isActive?600:400}));
    if(isActive) els.push(r(x+18,H-78,20,3,gold,{radius:2}));
  });
  return els;
}

// ── SCREEN 1: HOME / DASHBOARD ──────────────────────────────────────────────
function makeScreen1() {
  var els = [];
  els = els.concat(statusBar());
  // Header
  els.push(r(0,50,W,80,bg));
  els.push(sr(20,62,'GILT',22,text,{weight:700,ls:6}));
  els.push(s(W-80,64,'Good morning',12,textMute,{width:72,align:'right'}));
  els.push(s(W-80,80,'Alex',15,text,{weight:600,width:72,align:'right'}));
  els.push(c(W-28,80,20,surface2));
  els.push(s(W-36,72,'AW',12,gold,{weight:700,width:16}));

  // Balance card
  els.push(r(20,140,W-40,180,text,{radius:16,shadow:'0 8px 32px rgba(26,22,20,0.20)'}));
  els.push(s(36,168,'• • • •   • • • •   • • • •   4821',12,'rgba(250,248,244,0.4)',{width:280,ls:2,family:'Inter'}));
  els.push(sr(36,196,'$24,810',38,white,{weight:700}));
  els.push(s(36,244,'Available balance',11,'rgba(250,248,244,0.45)',{ls:1,width:200,family:'Inter'}));
  // Gold chip
  els.push(r(W-80,168,38,30,gold,{radius:5}));
  els.push(r(W-76,173,28,8,goldDark,{radius:3}));
  els.push(r(W-76,185,28,8,goldDark,{radius:3}));
  // Network circles
  els.push(c(W-50,302,16,'rgba(250,248,244,0.15)'));
  els.push(c(W-36,302,16,'rgba(250,248,244,0.10)'));
  // Gold accent line
  els.push(r(20,140,4,180,gold,{radius:2}));

  // Quick stats
  var sw = (W-52)/2;
  els.push(r(20,336,sw,72,surface,{radius:12,shadow:'0 2px 12px rgba(26,22,20,0.06)'}));
  els.push(r(20+sw+12,336,sw,72,surface,{radius:12,shadow:'0 2px 12px rgba(26,22,20,0.06)'}));
  els.push(s(34,350,'This Month',10,textMute,{width:120}));
  els.push(sr(34,368,'$3,240',20,text,{weight:700}));
  els.push(s(34,394,'↓ 12% vs last',10,textMute,{width:120}));
  var x2 = 20+sw+24;
  els.push(s(x2,350,'Points',10,textMute,{width:120}));
  els.push(sr(x2,368,'48,200',20,gold,{weight:700}));
  els.push(s(x2,394,'↑ 2,100 today',10,textMute,{width:120}));

  // Today's Opportunity
  els.push(s(20,428,"TODAY'S OPPORTUNITY",10,gold,{weight:600,ls:2,width:300,family:'Inter'}));
  els.push(r(20,446,W-40,130,surface,{radius:14,shadow:'0 2px 16px rgba(26,22,20,0.06)'}));
  // Image block
  els.push(r(20,446,100,130,goldLight,{radius:14}));
  els.push(r(20,446,100,130,'rgba(184,150,90,0.15)',{radius:14}));
  els.push(s(35,498,'🍽',32,text,{family:'Inter'}));
  els.push(sr(136,462,'Carbone, NYC',15,text,{weight:700,width:200}));
  els.push(s(136,482,'Table for 2 · 8:30 PM',12,textMid,{width:200}));
  els.push(s(136,498,'Friday, March 28',12,textMute,{width:200}));
  els.push(r(136,518,90,28,gold,{radius:14}));
  els.push(s(136,525,'Reserve Now',10,white,{weight:600,width:90,align:'center',family:'Inter'}));
  els.push(s(240,518,'Included with GILT',9,textMute,{width:110,lh:1.4}));

  // Recent transactions
  els.push(s(20,590,'RECENT',10,gold,{weight:600,ls:2,width:200,family:'Inter'}));
  els.push(ln(20,612,W-20,612,divider));
  els.push(s(20,618,'Nobu Downtown',13,text,{weight:500,width:180}));
  els.push(s(20,636,'Dining · Yesterday',11,textMute,{width:180}));
  els.push(s(W-20,622,'-$320',14,text,{weight:600,align:'right',width:70}));
  els.push(ln(20,658,W-20,658,divider));
  els.push(s(20,664,'The Connaught, London',13,text,{weight:500,width:220}));
  els.push(s(20,682,'Hotels · 2 days ago',11,textMute,{width:180}));
  els.push(s(W-20,668,'-$1,840',14,text,{weight:600,align:'right',width:80}));
  els.push(ln(20,704,W-20,704,divider));

  els = els.concat(bottomNav(0));
  return { id:'home', label:'Home — Dashboard', elements:els };
}

// ── SCREEN 2: VENUES ────────────────────────────────────────────────────────
function makeScreen2() {
  var els = [];
  els = els.concat(statusBar());
  els.push(r(0,50,W,H-90,bg));
  els.push(s(20,64,'VENUES',13,textMute,{weight:600,ls:3,width:200,family:'Inter'}));
  els.push(sr(20,84,'Curated for you',26,text,{weight:700}));
  els.push(s(20,116,'Experiences GILT members love',13,textMid,{width:260}));

  // Filter pills
  var pills = ['All','Dining','Hotels','Events'];
  pills.forEach(function(p,i){
    var px = 20+i*88;
    var active = i===0;
    els.push(r(px,140,80,30,active?gold:surface2,{radius:15}));
    els.push(s(px,149,p,11,active?white:textMid,{align:'center',width:80,weight:active?600:400}));
  });

  // Featured venue card
  els.push(r(20,184,W-40,200,surface,{radius:16,shadow:'0 4px 20px rgba(26,22,20,0.08)'}));
  els.push(r(20,184,W-40,120,goldLight,{radius:16}));
  els.push(r(20,244,W-40,60,'rgba(26,22,20,0.35)',{radius:0}));
  els.push(s(36,298,'★ 4.9  ·  Michelin ⭐⭐⭐',10,white,{weight:500,width:220}));
  els.push(sr(36,318,'Le Bernardin',18,text,{weight:700}));
  els.push(s(36,342,'West 51st St, New York',12,textMute,{width:200}));
  els.push(s(36,358,'Fine Dining · Seafood',11,textMute,{width:200}));
  els.push(r(W-90,322,72,28,surface2,{radius:14}));
  els.push(s(W-90,329,'Book Table',10,gold,{weight:600,width:72,align:'center'}));
  els.push(r(W-90,188,72,22,gold,{radius:11}));
  els.push(s(W-90,194,'GILT ACCESS',8,white,{weight:700,ls:1,width:72,align:'center'}));

  // Venue list
  var venues = [
    {name:'Aman New York',cat:'Hotels · 5th Ave',stars:'4.8',emoji:'🏨'},
    {name:'Carbone',cat:'Italian Dining · Greenwich Village',stars:'4.7',emoji:'🍝'},
    {name:'The Ned NYC',cat:'Members Club · Financial District',stars:'4.9',emoji:'🎭'},
  ];
  venues.forEach(function(v,i){
    var vy = 402+i*76;
    els.push(r(20,vy,W-40,66,surface,{radius:12,shadow:'0 2px 10px rgba(26,22,20,0.05)'}));
    els.push(r(20,vy,64,66,surface2,{radius:12}));
    els.push(t(36,vy+17,v.emoji,26,text,{family:'Inter'}));
    els.push(sr(96,vy+14,v.name,14,text,{weight:700,width:190}));
    els.push(s(96,vy+32,v.cat,10,textMute,{width:190}));
    els.push(s(96,vy+48,'★ '+v.stars,10,gold,{weight:600,width:60}));
    els.push(r(W-72,vy+18,54,28,bg,{radius:14}));
    els.push(s(W-72,vy+25,'Reserve',10,gold,{weight:600,width:54,align:'center'}));
  });

  els = els.concat(bottomNav(1));
  return { id:'venues', label:'Venues — Curated Discover', elements:els };
}

// ── SCREEN 3: CONCIERGE ─────────────────────────────────────────────────────
function makeScreen3() {
  var els = [];
  els = els.concat(statusBar());
  els.push(r(0,50,W,H-90,bg));
  // Header
  els.push(r(0,50,W,70,surface));
  els.push(ln(0,120,W,120,divider));
  els.push(sr(20,68,'Your Concierge',20,text,{weight:700}));
  els.push(s(20,92,'Available 24/7 · Avg response 90 sec',11,textMute,{width:260}));
  els.push(c(W-30,84,6,'#22C55E'));
  els.push(s(W-60,88,'Online',10,'#22C55E',{weight:600,width:50,align:'right'}));

  // Quick actions bar
  els.push(r(0,120,W,68,surface2));
  els.push(s(20,132,'Quick requests:',11,textMute,{width:140}));
  var qas = ['Table for 2','Jet charter','Spa booking','Airport VIP'];
  qas.forEach(function(q,i){
    var qx = 20+i*90;
    if(qx+82<=W-4){
      els.push(r(qx,150,82,26,surface,{radius:13,shadow:'0 1px 4px rgba(26,22,20,0.06)'}));
      els.push(s(qx,157,q,9,textMid,{align:'center',width:82,weight:500}));
    }
  });

  // Chat timestamp
  els.push(s(W/2-80,204,'Today · 2:34 PM',10,textMute,{align:'center',width:160}));

  // Concierge message bubble
  els.push(r(20,224,268,76,surface,{radius:16,shadow:'0 2px 8px rgba(26,22,20,0.06)'}));
  els.push(s(36,236,'Good afternoon, Alex. I\'ve',12,text,{width:240,lh:1.5}));
  els.push(s(36,254,'arranged your Friday table',12,text,{width:240,lh:1.5}));
  els.push(s(36,272,'at Nobu. Anything else?',12,text,{width:240,lh:1.5}));
  els.push(c(28,232,8,goldLight));
  els.push(s(24,226,'G',9,gold,{weight:700,width:8}));

  // User message
  els.push(r(100,316,260,54,text,{radius:16}));
  els.push(s(114,326,'Can you arrange airport',12,white,{width:232,lh:1.5}));
  els.push(s(114,344,'pickup for 6 AM Sunday?',12,white,{width:232,lh:1.5}));

  // Concierge reply card
  els.push(r(20,386,270,138,surface,{radius:16,shadow:'0 2px 8px rgba(26,22,20,0.06)'}));
  els.push(s(36,400,'Arranged! Driver details:',12,text,{width:244,weight:600}));
  els.push(ln(36,420,274,420,divider));
  els.push(s(36,428,'🚗  Mercedes S-Class · Black',12,text,{width:240}));
  els.push(s(36,448,'👤  James – +1 212 555 0142',12,text,{width:240}));
  els.push(s(36,466,'⏰  Sunday 6:00 AM · JFK T4',12,text,{width:240}));
  els.push(r(36,488,104,28,gold,{radius:14}));
  els.push(s(36,495,'View Details',10,white,{weight:600,width:104,align:'center'}));
  els.push(c(28,394,8,goldLight));
  els.push(s(24,388,'G',9,gold,{weight:700,width:8}));

  // Input bar
  els.push(r(0,H-178,W,88,surface));
  els.push(ln(0,H-178,W,H-178,divider));
  els.push(r(20,H-158,W-60,42,bg,{radius:21,border:'1px solid rgba(26,22,20,0.12)'}));
  els.push(s(36,H-140,'Message your concierge...',12,textMute,{width:240}));
  els.push(c(W-28,H-137,18,gold));
  els.push(s(W-36,H-144,'↑',16,white,{weight:700,width:16,align:'center'}));

  els = els.concat(bottomNav(2));
  return { id:'concierge', label:'Concierge — Chat Interface', elements:els };
}

// ── SCREEN 4: CARD ──────────────────────────────────────────────────────────
function makeScreen4() {
  var els = [];
  els = els.concat(statusBar());
  els.push(r(0,50,W,H-90,bg));
  els.push(s(20,64,'YOUR CARD',13,textMute,{weight:600,ls:3,width:200,family:'Inter'}));
  els.push(sr(20,84,'GILT Obsidian',26,text,{weight:700}));

  // Virtual card
  els.push(r(20,120,W-40,200,text,{radius:20,shadow:'0 12px 40px rgba(26,22,20,0.22)'}));
  els.push(s(36,144,'• • • •   • • • •   • • • •   4821',13,'rgba(250,248,244,0.35)',{width:300,ls:2,family:'Inter'}));
  els.push(sr(36,186,'24,810',40,white,{weight:700}));
  els.push(s(36,236,'AVAILABLE BALANCE',9,'rgba(250,248,244,0.45)',{ls:2,width:200,family:'Inter'}));
  els.push(s(36,266,'ALEX WINTERS',12,'rgba(250,248,244,0.65)',{ls:2,weight:600,width:200}));
  els.push(s(36,284,'VALID THRU  09/28',10,'rgba(250,248,244,0.45)',{ls:1,width:200}));
  // Chip
  els.push(r(W-84,142,42,34,gold,{radius:6}));
  els.push(r(W-80,147,34,10,goldDark,{radius:3}));
  els.push(r(W-80,161,34,10,goldDark,{radius:3}));
  // Network
  els.push(c(W-52,290,18,'rgba(250,248,244,0.18)'));
  els.push(c(W-36,290,18,'rgba(250,248,244,0.10)'));
  els.push(r(20,120,5,200,gold,{radius:3}));

  // Card actions
  var actions = [
    {icon:'eye',label:'Show CVV'},
    {icon:'lock',label:'Freeze'},
    {icon:'share',label:'To Wallet'},
    {icon:'settings',label:'Manage'},
  ];
  actions.forEach(function(a,i){
    var ax = 16+i*92;
    els.push(r(ax,336,80,72,surface,{radius:14,shadow:'0 2px 10px rgba(26,22,20,0.06)'}));
    els.push(ic(ax+18,352,a.icon,gold,22));
    els.push(s(ax,384,a.label,9,textMid,{align:'center',width:80}));
  });

  // Rewards
  els.push(s(20,424,'GILT REWARDS',10,gold,{weight:600,ls:2,width:200,family:'Inter'}));
  els.push(r(20,444,W-40,106,surface,{radius:14,shadow:'0 2px 10px rgba(26,22,20,0.06)'}));
  els.push(sr(36,460,'48,200',28,gold,{weight:700}));
  els.push(s(160,470,'Gold Points',12,textMute,{width:180}));
  els.push(s(36,496,'To Platinum: 1,800 pts away',10,textMute,{width:220}));
  els.push(r(36,512,W-112,6,surface2,{radius:3}));
  els.push(r(36,512,Math.round((W-112)*0.96),6,gold,{radius:3}));
  els.push(r(W-116,454,96,34,goldLight,{radius:17}));
  els.push(s(W-116,465,'Redeem',12,goldDark,{weight:600,width:96,align:'center'}));

  // Tier upgrade card
  els.push(r(20,566,W-40,100,text,{radius:14}));
  els.push(s(36,580,'GILT GOLD MEMBER',10,'rgba(250,248,244,0.45)',{ls:2,weight:600,width:200}));
  els.push(sr(36,600,'Upgrade to Platinum',17,goldLight,{weight:700,width:240}));
  els.push(s(36,626,'1,800 points or $500 spend needed',11,'rgba(250,248,244,0.45)',{width:240}));
  els.push(r(36,646,114,28,gold,{radius:14}));
  els.push(s(36,654,'View Benefits',10,text,{weight:600,width:114,align:'center'}));
  els.push(r(20,566,5,100,gold,{radius:3}));

  els = els.concat(bottomNav(3));
  return { id:'card', label:'Card — Virtual + Rewards', elements:els };
}

// ── SCREEN 5: INSIGHTS ──────────────────────────────────────────────────────
function makeScreen5() {
  var els = [];
  els = els.concat(statusBar());
  els.push(r(0,50,W,H-90,bg));
  els.push(s(20,64,'INSIGHTS',13,textMute,{weight:600,ls:3,width:200,family:'Inter'}));
  els.push(sr(20,84,'March 2026',26,text,{weight:700}));
  els.push(s(20,116,'Your spending, beautifully organized',13,textMid,{width:280}));

  // Summary card
  els.push(r(20,140,W-40,110,text,{radius:16,shadow:'0 8px 24px rgba(26,22,20,0.14)'}));
  els.push(r(20,140,5,110,gold,{radius:3}));
  els.push(s(36,158,'TOTAL SPEND',9,'rgba(250,248,244,0.4)',{ls:2,weight:600,width:200}));
  els.push(sr(36,174,'$3,240',34,white,{weight:700}));
  els.push(s(36,218,'↓ 12% vs February',12,'rgba(250,248,244,0.5)',{width:200}));
  els.push(s(W-108,172,'▁▃▅▃▇▅▄▆',18,gold,{width:88,align:'right'}));
  els.push(s(W-108,196,'This month',9,'rgba(250,248,244,0.35)',{width:88,align:'right'}));

  // Categories
  els.push(s(20,268,'BY CATEGORY',10,gold,{weight:600,ls:2,width:200,family:'Inter'}));
  var cats = [
    {name:'Dining',pct:45,amt:'$1,458',color:gold},
    {name:'Hotels',pct:30,amt:'$972',color:goldDark},
    {name:'Transport',pct:15,amt:'$486',color:textMid},
    {name:'Experiences',pct:10,amt:'$324',color:textMute},
  ];
  cats.forEach(function(cat,i){
    var cy = 290+i*64;
    els.push(r(20,cy,W-40,54,surface,{radius:10,shadow:'0 1px 6px rgba(26,22,20,0.05)'}));
    els.push(c(42,cy+27,9,cat.color));
    els.push(s(58,cy+14,cat.name,13,text,{weight:500,width:100}));
    els.push(s(58,cy+32,cat.pct+'% of spend',10,textMute,{width:120}));
    els.push(r(162,cy+21,142,6,surface2,{radius:3}));
    els.push(r(162,cy+21,Math.round(142*cat.pct/100),6,cat.color,{radius:3}));
    els.push(s(W-24,cy+16,cat.amt,13,text,{weight:600,align:'right',width:70}));
  });

  // Weekly pattern
  els.push(s(20,554,'WEEKLY PATTERN',10,gold,{weight:600,ls:2,width:200,family:'Inter'}));
  els.push(r(20,574,W-40,98,surface,{radius:12,shadow:'0 2px 10px rgba(26,22,20,0.05)'}));
  var days = ['M','T','W','T','F','S','S'];
  var heights = [30,18,22,40,60,80,45];
  days.forEach(function(d,i){
    var bx = 36+i*46;
    var bh = heights[i];
    var isActive = i===5;
    els.push(r(bx,574+80-bh,28,bh,isActive?gold:surface2,{radius:4}));
    els.push(s(bx,660,d,10,isActive?gold:textMute,{align:'center',width:28,weight:isActive?700:400}));
  });
  els.push(s(20,672,'Saturdays are your highest spend day',11,textMute,{width:W-40}));

  // Score
  els.push(r(20,696,W-40,56,surface,{radius:12,shadow:'0 1px 6px rgba(26,22,20,0.05)'}));
  els.push(s(36,710,'Spending Health Score',12,text,{weight:500,width:200}));
  els.push(sr(36,728,'Excellent',12,gold,{weight:700,width:100}));
  els.push(r(W-120,714,96,6,surface2,{radius:3}));
  els.push(r(W-120,714,88,6,gold,{radius:3}));

  els = els.concat(bottomNav(4));
  return { id:'insights', label:'Insights — Spending Analytics', elements:els };
}

// ── ASSEMBLE ─────────────────────────────────────────────────────────────────
var pen = {
  version: '2.8',
  meta: {
    name: 'GILT — The Card That Opens Every Door',
    description: 'Luxury concierge credit card app. Warm ivory palette, editorial serif typography, curated venue discovery, personal concierge chat, and beautiful spending insights. Inspired by Atlas Card (godly.website) and Cardless (land-book.com).',
    author: 'RAM',
    created: new Date().toISOString(),
    theme: 'light',
    palette: {
      primary: bg,
      accent: gold,
      text: text,
    },
  },
  canvas: { width: W, height: H, background: bg },
  screens: [
    makeScreen1(),
    makeScreen2(),
    makeScreen3(),
    makeScreen4(),
    makeScreen5(),
  ],
  transitions: [
    { from:'home', to:'venues', type:'slide-left', duration:300 },
    { from:'venues', to:'concierge', type:'slide-left', duration:300 },
    { from:'concierge', to:'card', type:'slide-left', duration:300 },
    { from:'card', to:'insights', type:'slide-left', duration:300 },
  ],
};

fs.writeFileSync('gilt.pen', JSON.stringify(pen, null, 2));
var sz = Math.round(fs.statSync('gilt.pen').size / 1024);
console.log('✓ gilt.pen written (' + sz + ' KB, ' + pen.screens.length + ' screens)');
