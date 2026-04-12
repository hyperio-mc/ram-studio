/**
 * HAVEN — Your city, curated
 * A premium urban lifestyle & concierge app
 *
 * Inspired by:
 *   - Godly.website: Atlas Card — editorial horizontal carousels for dining,
 *     hotels, experiences; luxury concierge-via-text UX; warm cream + gold palette
 *   - Awwwards SOTD Apr 2026: IYO (1-color palette, ultra-minimal) &
 *     Utopia Tokyo (view switch grid↔list, hero slider pattern)
 *   - Lapa.ninja: Dawn (evidence-based AI for everyday challenges)
 *   - Minimal.gallery: KOMETA Typefaces (typographic hierarchy, generous whitespace)
 *
 * Theme: LIGHT — warm cream (#F8F5EF), forest green (#2C5F3A), aged gold (#B8922E)
 * NEW pattern: Horizontal scrolling editorial carousels + full-bleed image cards
 * 5 screens: Today, Discover, Reserve, Concierge, Profile
 */

const fs = require('fs');

const W = 390, H = 844;

const C = {
  bg:        '#F8F5EF',
  surface:   '#FFFFFF',
  surface2:  '#F2EEE8',
  surface3:  '#EAE5DC',
  border:    'rgba(30,23,14,0.07)',
  border2:   'rgba(30,23,14,0.13)',
  text:      '#1A1410',
  textMid:   'rgba(26,20,16,0.54)',
  textDim:   'rgba(26,20,16,0.28)',
  forest:    '#2C5F3A',
  forestSft: '#4A8B5A',
  forestDim: 'rgba(44,95,58,0.10)',
  gold:      '#B8922E',
  goldSft:   '#D4AA48',
  goldDim:   'rgba(184,146,46,0.12)',
  terra:     '#C4714A',
  terraDim:  'rgba(196,113,74,0.10)',
  imgA:      '#8AA898',
  imgB:      '#B8A07C',
  imgC:      '#9AACBA',
  imgD:      '#C4987A',
  imgE:      '#7A9E8A',
};

let _id = 0;
const uid = p => `${p||'e'}-${(++_id).toString(36).padStart(4,'0')}`;

const r  = (x,y,w,h,fill,rr,stroke,sw,op) =>
  ({type:'rect',id:uid('r'),x,y,width:w,height:h,fill,
    cornerRadius:rr||0,stroke:stroke||null,strokeWidth:sw||0,opacity:op||1});

const t  = (x,y,w,h,content,fs,fw,c,ta,ls) =>
  ({type:'text',id:uid('t'),x,y,width:w,height:h,text:content,
    fontFamily:'Georgia,serif',fontSize:fs||13,fontWeight:fw||400,
    color:c||C.text,letterSpacing:ls||0,lineHeight:1.4,align:ta||'left'});

const ts = (x,y,w,h,content,fs,fw,c,ta,ls) =>
  ({type:'text',id:uid('t'),x,y,width:w,height:h,text:content,
    fontFamily:'Inter,system-ui,sans-serif',fontSize:fs||13,fontWeight:fw||400,
    color:c||C.text,letterSpacing:ls||0,lineHeight:1.4,align:ta||'left'});

const g  = (children,opts) => {
  opts = opts || {};
  return {type:'group',id:uid('g'),children,
    x:opts.x||0,y:opts.y||0,width:opts.w||W,height:opts.h||H,clip:opts.clip||false};
};

const el = (cx,cy,ra,fill) =>
  ({type:'ellipse',id:uid('el'),x:cx-ra,y:cy-ra,width:ra*2,height:ra*2,fill:fill||C.surface2,
    stroke:null,strokeWidth:0});

// Photo simulation
function photo(x,y,w,h,tone,rr,label) {
  const lt = tone==='sage' ? C.imgA : tone==='warm' ? C.imgB :
             tone==='cool' ? C.imgC : tone==='amber' ? C.imgD : C.imgE;
  const kids = [
    r(x,y,w,h,lt,rr||0),
    r(x,y,w*0.45,h,lt.replace(/[89a-c]/gi,'7'),rr||0),
    r(x,y+h*0.65,w,h*0.35,'rgba(0,0,0,0.22)',rr||0),
  ];
  if (label) kids.push(ts(x+10,y+h-22,w-20,16,label,9,600,'rgba(255,255,255,0.88)','left',0.04));
  return g(kids);
}

function statusBar() {
  return g([
    r(0,0,W,50,C.bg),
    ts(16,17,60,16,'9:41',12,600,C.text),
    ts(W-70,17,60,16,'◈ ◈ ◈',10,500,C.textDim,'right'),
  ]);
}

function chip(x,y,label,active) {
  const w = label.length * 7.5 + 24;
  return g([
    r(x,y,w,28,active ? C.forest : C.surface,14,active ? null : C.border2,active?0:1),
    ts(x,y,w,28,label,11,active?600:400,active?'#FFFFFF':C.textMid,'center',0.02),
  ]);
}

function navBar(active) {
  active = active || 0;
  const items = [
    {ic:'⌂',lb:'Today'},
    {ic:'⊞',lb:'Discover'},
    {ic:'◫',lb:'Reserve'},
    {ic:'⌭',lb:'Concierge'},
    {ic:'◯',lb:'Profile'},
  ];
  const iw = W/5;
  const ch = [
    r(0,0,W,1,C.border2),
    r(0,0,W,72,C.surface),
  ];
  items.forEach(function(item,i) {
    const x = i * iw;
    const act = i === active;
    ch.push(ts(x,10,iw,20,item.ic,16,act?600:400,act?C.forest:C.textDim,'center'));
    ch.push(ts(x,30,iw,14,item.lb,9,act?700:400,act?C.forest:C.textDim,'center',0.03));
    if (act) ch.push(r(x+iw/2-16,62,32,2,C.forest,1));
  });
  return g(ch, {y:H-72, h:72});
}

function hCard(x,y,w,h,tone,name,sub,badge) {
  const kids = [
    photo(x,y,w,h,tone,12),
    r(x,y,w,32,'rgba(0,0,0,0.10)',12),
  ];
  if (badge) {
    kids.push(r(x+10,y+10,badge.length*6+16,20,'rgba(255,255,255,0.92)',10));
    kids.push(ts(x+10,y+10,badge.length*6+16,20,badge,9,700,C.text,'center',0.05));
  }
  kids.push(ts(x+10,y+h-38,w-20,16,name,13,700,'rgba(255,255,255,0.97)','left'));
  kids.push(ts(x+10,y+h-22,w-20,14,sub,10,400,'rgba(255,255,255,0.72)','left',0.01));
  return g(kids);
}

// ─── Screen 1: TODAY ───────────────────────────────────────────────────────
function screenToday() {
  return {
    id: 'today', label: 'Today', width: W, height: H, background: C.bg,
    elements: [
      r(0,0,W,H,C.bg),
      statusBar(),

      ts(20,56,220,16,'Good morning, James.',11,400,C.textDim,'left',0.01),
      t(20,72,W-100,30,'Friday, April 3',20,400,C.text),

      // Weather pill
      r(W-106,74,86,26,C.surface2,13),
      ts(W-106,74,86,26,'☀  72°  Clear',10,500,C.textMid,'center'),

      // Feature card
      photo(20,112,W-40,170,'warm',14),
      r(20,112,60,20,C.gold,10),
      ts(20,112,60,20,'DINING',8,700,'#FFFFFF','center',0.08),
      ts(30,254,W-70,16,'Eleven Madison Park',13,700,'rgba(255,255,255,0.96)'),
      ts(30,270,W-70,14,'Michelin ★★★  ·  Flatiron',10,400,'rgba(255,255,255,0.72)'),
      r(W-110,262,82,24,C.gold,12),
      ts(W-110,262,82,24,'Reserve →',10,600,'#FFFFFF','center',0.02),

      // Section label
      ts(20,300,200,12,'CURATED FOR YOU',9,700,C.textDim,'left',0.1),

      // Carousel cards
      hCard(20,318,158,118,'sage','Sommelier Bar','Wine & Jazz · SoHo','TONIGHT'),
      hCard(188,318,158,118,'cool','The Aviary','Craft Cocktails · West Loop','★ 4.9'),
      hCard(356,318,140,118,'amber','Casa Dani','Tapas · Hudson Yards','NEW'),

      // Quick access label
      ts(20,452,140,12,'QUICK ACCESS',9,700,C.textDim,'left',0.1),

      // 4 quick buttons
      r(20,470,82,62,C.forestDim,12), ts(20,470,82,22,'🍽',20,400,C.text,'center'), ts(20,494,82,14,'Dining',9,600,C.forest,'center',0.03),
      r(110,470,82,62,C.goldDim,12),  ts(110,470,82,22,'🏨',20,400,C.text,'center'), ts(110,494,82,14,'Hotels',9,600,C.gold,'center',0.03),
      r(200,470,82,62,C.terraDim,12), ts(200,470,82,22,'🎭',20,400,C.text,'center'), ts(200,494,82,14,'Events',9,600,C.terra,'center',0.03),
      r(290,470,82,62,C.surface2,12), ts(290,470,82,22,'💆',20,400,C.text,'center'), ts(290,494,82,14,'Wellness',9,600,C.textMid,'center',0.03),

      // Upcoming res
      r(20,550,W-40,70,C.surface,12,C.border,1),
      r(20,550,4,70,C.forest,2),
      ts(32,558,W-90,12,'TONIGHT · 8:00 PM',9,700,C.gold,'left',0.08),
      t(32,570,W-110,20,'Atomix',13,600,C.text),
      ts(32,590,W-110,14,'Korean Fine Dining · 2 guests · Table 7',10,400,C.textDim),
      r(W-92,562,68,24,C.forestDim,12),
      ts(W-92,562,68,24,'View →',10,600,C.forest,'center'),

      navBar(0),
    ]
  };
}

// ─── Screen 2: DISCOVER ────────────────────────────────────────────────────
function screenDiscover() {
  return {
    id: 'discover', label: 'Discover', width: W, height: H, background: C.bg,
    elements: [
      r(0,0,W,H,C.bg),
      statusBar(),

      t(20,56,W-80,30,'Discover',22,400,C.text),

      // Search bar
      r(20,92,W-40,40,C.surface,12,C.border,1),
      ts(34,92,30,40,'⌕',14,400,C.textDim),
      ts(56,92,W-110,40,'Restaurants, bars, events…',12,400,C.textDim),

      // Category chips
      chip(20,148,'All',true),
      chip(78,148,'Dining',false),
      chip(132,148,'Cocktail Bars',false),
      chip(240,148,'Experiences',false),
      chip(356,148,'Wellness',false),

      // Tonight's picks header
      ts(20,192,'TONIGHT\'S PICKS',160,9,9,700,C.textDim,'left',0.1),
      ts(W-54,192,34,12,'See all',11,600,C.forest,'right'),

      // Main large card
      hCard(20,212,W-40,196,'warm','Bâtard','French-American · Tribeca · ★★','OPEN NOW'),

      // Two smaller cards
      hCard(20,422,172,118,'sage','Lore Wine Bar','Intimate · West Village','◎ QUIET'),
      hCard(202,422,168,118,'cool','Double Chicken Please','Creative Cocktails','TRENDING'),

      // Experiences header
      ts(20,556,'EXPERIENCES',140,9,9,700,C.textDim,'left',0.1),
      ts(W-54,556,34,12,'See all',11,600,C.forest,'right'),

      // Experience cards
      hCard(20,576,146,98,'amber','Jazz at Lincoln Center','Tonight 8pm','LIMITED'),
      hCard(176,576,146,98,'forest','Brooklyn Roof Garden','Sat Morning','NEW'),
      hCard(332,576,130,98,'warm','Private Chef Dinner','Sat Evening','SOLD OUT'),

      // View toggle
      r(W-82,688,64,28,C.surface,10,C.border,1),
      r(W-82,688,32,28,C.text,10),
      ts(W-82,688,32,28,'⊞',13,400,'#FFFFFF','center'),
      ts(W-50,688,32,28,'≡',14,400,C.textDim,'center'),
      r(W-50,688,1,28,C.border),

      navBar(1),
    ]
  };
}

// ─── Screen 3: RESERVE ─────────────────────────────────────────────────────
function screenReserve() {
  const res = [
    {date:'TODAY',time:'8:00 PM',venue:'Atomix',detail:'Korean Fine Dining · 2 guests',status:'Confirmed',tone:'warm',y:152},
    {date:'SAT APR 5',time:'7:30 PM',venue:'Don Angie',detail:'Italian · 4 guests · Birthday',status:'Confirmed',tone:'sage',y:282},
    {date:'SUN APR 6',time:'11:00 AM',venue:'Sunday at Maison',detail:'French Brunch · 2 guests',status:'Requested',tone:'cool',y:412},
    {date:'THU APR 10',time:'9:00 PM',venue:'The Aviary NYC',detail:'Cocktail Experience · 2 guests',status:'Waitlisted',tone:'amber',y:542},
  ];

  const kids = [
    r(0,0,W,H,C.bg),
    statusBar(),
    t(20,56,220,30,'Reservations',22,400,C.text),
    // Tabs
    r(20,94,W-40,36,C.surface,10,C.border,1),
    r(20,94,(W-40)/2,36,C.text,10),
    ts(20,94,(W-40)/2,36,'Upcoming',11,600,'#FFFFFF','center'),
    ts(20+(W-40)/2,94,(W-40)/2,36,'Past',11,400,C.textMid,'center'),
    // Timeline line
    r(34,152,2,res.length*130,'rgba(30,23,14,0.10)',1),
  ];

  res.forEach(function(rv) {
    const isToday = rv.status === 'Confirmed' && rv.date === 'TODAY';
    const stCol = rv.status==='Confirmed' ? C.forest : rv.status==='Requested' ? C.gold : C.terra;
    const stDim = rv.status==='Confirmed' ? C.forestDim : rv.status==='Requested' ? C.goldDim : C.terraDim;
    kids.push(r(20,rv.y,W-40,114,C.surface,12,isToday?C.forest:C.border,isToday?1.5:1));
    // Photo strip
    kids.push(photo(20,rv.y,88,114,rv.tone,12));
    // Date/venue
    kids.push(ts(118,rv.y+12,W-160,12,rv.date,8,700,C.textDim,'left',0.08));
    kids.push(t(118,rv.y+24,W-160,20,rv.venue,14,isToday?700:600,C.text));
    kids.push(ts(118,rv.y+46,W-160,14,rv.detail,10,400,C.textMid));
    // Status
    kids.push(r(118,rv.y+66,rv.status.length*6+18,20,stDim,10));
    kids.push(ts(118,rv.y+66,rv.status.length*6+18,20,rv.status,8,700,stCol,'center',0.04));
    // Time
    kids.push(r(W-78,rv.y+12,54,20,C.surface2,10));
    kids.push(ts(W-78,rv.y+12,54,20,rv.time,9,600,C.text,'center'));
    // Arrow
    kids.push(ts(W-38,rv.y+44,18,20,'›',16,300,C.textDim,'center'));
  });

  kids.push(r(20,690,W-40,46,C.forest,12));
  kids.push(ts(20,690,W-40,46,'+ Book a new reservation',13,600,'#FFFFFF','center'));
  kids.push(navBar(2));

  return { id:'reserve', label:'Reserve', width:W, height:H, background:C.bg, elements:kids };
}

// ─── Screen 4: CONCIERGE ───────────────────────────────────────────────────
function screenConcierge() {
  const msgs = [
    {from:'user',text:'Can you get me a table for two at Atomix this Saturday? Preferably 7:30.',y:148,h:56},
    {from:'haven',text:'On it, James. Atomix has availability at 7:30 PM for 2 guests this Saturday. Would you like me to confirm?',y:220,h:66},
    {from:'user',text:'Yes, please confirm. It\'s a birthday dinner.',y:304,h:46},
    {from:'haven',text:'Done ✓  Atomix for Saturday April 5 at 7:30 PM is confirmed. I\'ve noted the birthday. Anything else for the evening?',y:366,h:66},
    {from:'user',text:'Can you recommend a good jazz spot nearby for after?',y:450,h:46},
    {from:'haven',text:'Great choice — Jazz at Lincoln Center is a short cab away and has seats tonight. Want me to book two?',y:512,h:66},
  ];

  const kids = [
    r(0,0,W,H,C.bg),
    statusBar(),
    t(20,56,W-100,28,'Concierge',22,400,C.text),
    ts(20,84,W-40,14,'AI-powered · Always available',11,400,C.textDim),
    el(W-56,68,6,C.forest),
    ts(W-44,62,44,16,'LIVE',9,600,C.forest,'left',0.06),
    r(0,108,W,1,C.border2),
  ];

  msgs.forEach(function(msg) {
    if (msg.from === 'user') {
      kids.push(r(W-260,msg.y,240,msg.h,C.forest,14));
      kids.push(ts(W-246,msg.y+10,212,msg.h-20,msg.text,11,400,'rgba(255,255,255,0.92)','left',0,1.5));
    } else {
      kids.push(el(32,msg.y+msg.h/2,14,C.surface2));
      kids.push(ts(18,msg.y+msg.h/2-8,28,16,'⌭',12,400,C.forest,'center'));
      kids.push(r(54,msg.y,240,msg.h,C.surface,14,C.border,1));
      kids.push(ts(68,msg.y+10,212,msg.h-20,msg.text,11,400,C.textMid,'left',0,1.5));
    }
  });

  // Typing indicator
  kids.push(el(32,636,14,C.surface2));
  kids.push(ts(18,628,28,16,'⌭',12,400,C.forest,'center'));
  kids.push(r(54,622,72,28,C.surface,14,C.border,1));
  kids.push(el(74,636,4,'rgba(26,20,16,0.25)'));
  kids.push(el(90,636,4,'rgba(26,20,16,0.25)'));
  kids.push(el(106,636,4,'rgba(26,20,16,0.25)'));

  // Input bar
  kids.push(r(0,H-152,W,1,C.border2));
  kids.push(r(0,H-152,W,80,C.surface));
  kids.push(r(16,H-128,W-72,44,C.surface2,22,C.border,1));
  kids.push(ts(30,H-128,W-116,44,'Message HAVEN…',12,400,C.textDim));
  kids.push(r(W-56,H-128,44,44,C.forest,22));
  kids.push(ts(W-56,H-128,44,44,'↑',16,600,'#FFFFFF','center'));

  kids.push(navBar(3));

  return { id:'concierge', label:'Concierge', width:W, height:H, background:C.bg, elements:kids };
}

// ─── Screen 5: PROFILE ─────────────────────────────────────────────────────
function screenProfile() {
  const menuItems = [
    {ic:'⊞',lb:'Preferences',sb:'Cuisines, dietary, neighborhoods',y:406},
    {ic:'◈',lb:'Saved Places',sb:'47 venues in your collection',y:460},
    {ic:'◫',lb:'Reservation History',sb:'32 past bookings',y:514},
    {ic:'⌭',lb:'Concierge History',sb:'View past requests & notes',y:568},
    {ic:'◯',lb:'Account & Settings',sb:'Privacy, notifications, billing',y:622},
  ];

  const kids = [
    r(0,0,W,H,C.bg),
    statusBar(),
    t(20,56,W-40,28,'Profile',22,400,C.text),

    // Membership card
    r(20,94,W-40,160,C.forest,18),
    r(20,94,W-40,80,'rgba(255,255,255,0.05)',18),
    r(W-130,94,120,160,'rgba(0,0,0,0.07)',18),
    el(W-60,144,70,'rgba(255,255,255,0.06)'),
    el(W-60,144,45,'rgba(255,255,255,0.04)'),
    t(32,110,120,22,'HAVEN',15,400,'rgba(255,255,255,0.9)','left',-0.02),
    r(32,136,62,18,'rgba(184,146,46,0.35)',9),
    ts(32,136,62,18,'OBSIDIAN',7,700,C.goldSft,'center',0.10),
    t(32,162,W-80,22,'James Whitfield',14,400,'rgba(255,255,255,0.95)'),
    ts(32,186,W-80,14,'Member since 2021 · Concierge Access',9,400,'rgba(255,255,255,0.5)','left',0.02),
    t(32,206,100,22,'4,720',16,400,C.goldSft),
    ts(32,228,100,14,'Haven Points',9,400,'rgba(255,255,255,0.5)','left',0.03),
    ts(W-112,226,88,14,'◉◉◉◉  8821',10,400,'rgba(255,255,255,0.45)','right',0.10),

    // Stats row
    r(20,268,W-40,60,C.surface,12,C.border,1),
  ];

  [['32','Reservations'],['47','Saved'],['12','Experiences']].forEach(function(pair,i) {
    const x = 20 + i*(W-40)/3;
    if (i>0) kids.push(r(x,278,1,40,C.border));
    kids.push(t(x,272,(W-40)/3,22,pair[0],16,400,C.text,'center'));
    kids.push(ts(x,294,(W-40)/3,14,pair[1],9,400,C.textDim,'center',0.03));
  });

  // Neighborhood chips
  kids.push(ts(20,346,'YOUR NEIGHBORHOODS',180,9,9,700,C.textDim,'left',0.1));
  [{lb:'Manhattan',cl:C.forestDim,tc:C.forest,x:20},{lb:'Brooklyn',cl:C.goldDim,tc:C.gold,x:116},{lb:'West Village',cl:C.surface2,tc:C.textMid,x:206}].forEach(function(n) {
    kids.push(r(n.x,366,n.lb.length*7+18,26,n.cl,13));
    kids.push(ts(n.x,366,n.lb.length*7+18,26,n.lb,10,500,n.tc,'center',0.02));
  });

  menuItems.forEach(function(item) {
    kids.push(r(20,item.y,W-40,46,C.surface,0,C.border,0));
    kids.push(r(20,item.y+45,W-40,1,C.border));
    kids.push(r(20,item.y+7,32,32,C.surface2,8));
    kids.push(ts(20,item.y+7,32,32,item.ic,14,400,C.forest,'center'));
    kids.push(ts(60,item.y+6,W-110,16,item.lb,13,500,C.text));
    kids.push(ts(60,item.y+24,W-110,14,item.sb,10,400,C.textDim));
    kids.push(ts(W-46,item.y+13,16,20,'›',16,300,C.textDim,'center'));
  });

  kids.push(navBar(4));

  return { id:'profile', label:'Profile', width:W, height:H, background:C.bg, elements:kids };
}

// ─── ASSEMBLE ──────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  metadata: {
    name: 'HAVEN',
    slug: 'haven',
    description: 'Premium urban lifestyle concierge — curated dining, hotels, experiences, AI assistance',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    theme: 'light',
    palette: 'warm cream / forest green / aged gold',
    inspiration: 'Atlas Card (Godly.website) — editorial horizontal carousels, luxury concierge UX; Awwwards IYO & Utopia Tokyo — minimal palette + view switch',
  },
  canvasWidth: W,
  canvasHeight: H,
  screens: [
    screenToday(),
    screenDiscover(),
    screenReserve(),
    screenConcierge(),
    screenProfile(),
  ],
};

fs.writeFileSync('/workspace/group/design-studio/haven.pen', JSON.stringify(pen, null, 2));
console.log('✓ haven.pen written —', pen.screens.length, 'screens');
pen.screens.forEach(function(s) {
  const n = (JSON.stringify(s).match(/"type"/g) || []).length;
  console.log('  · ' + s.label + ': ~' + n + ' elements');
});
