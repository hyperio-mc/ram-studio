'use strict';
const fs = require('fs'), path = require('path');

const SLUG = 'prose';
const W = 390, H = 844;

// ─── PALETTE — Cloud Dancer warm off-white + sienna editorial ────────────────
const BG     = '#FAF6F0';   // Pantone Cloud Dancer inspired warm off-white
const SURF   = '#FFFFFF';
const CARD   = '#F3EDE3';   // warm parchment
const TEXT   = '#1E1812';   // warm near-black
const SIENNA = '#B85A2A';   // burnt sienna / clementine — primary accent
const SAGE   = '#4E7A56';   // secondary sage green
const PEACH  = '#E8A882';   // soft peach highlight
const SAND   = '#C9A87C';   // sand/tan for muted accents
const MUTED  = 'rgba(30,24,18,0.45)';
const DIM    = 'rgba(30,24,18,0.22)';
const SERIF  = 'Georgia,serif';  // Piazzolla-inspired serif display

// ─── PRIMITIVES ──────────────────────────────────────────────────────────────
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
function serif(x,y,content,size,fill,opts={}) {
  return text(x,y,content,size,fill,{...opts,font:SERIF});
}

// ─── STATUS BAR ──────────────────────────────────────────────────────────────
function statusBar() {
  return [
    rect(0,0,W,44,BG),
    text(18,28,'9:41',13,TEXT,{fw:600}),
    text(W-18,28,'●●●',11,TEXT,{anchor:'end'}),
  ];
}

// ─── BOTTOM NAV ──────────────────────────────────────────────────────────────
function bottomNav(active) {
  const items = [
    { id:'library',    icon:'◉', label:'Library'   },
    { id:'reading',    icon:'◈', label:'Reading'   },
    { id:'highlights', icon:'⊟', label:'Notes'     },
    { id:'discover',   icon:'◇', label:'Discover'  },
    { id:'profile',    icon:'◎', label:'You'       },
  ];
  const els = [
    rect(0,H-82,W,82,SURF,{stroke:'rgba(30,24,18,0.08)',sw:1}),
    line(0,H-82,W,H-82,'rgba(30,24,18,0.08)'),
  ];
  items.forEach((it,i) => {
    const x = 39 + i*78;
    const isActive = it.id===active;
    els.push(
      text(x,H-50,it.icon,22,isActive?SIENNA:MUTED,{anchor:'middle',fw:isActive?700:400}),
      text(x,H-28,it.label,10,isActive?SIENNA:MUTED,{anchor:'middle',fw:isActive?600:400}),
    );
    if (isActive) els.push(rect(x-14,H-82,28,3,SIENNA,{rx:2}));
  });
  return els;
}

// ─── SCREEN 1: LIBRARY ───────────────────────────────────────────────────────
function screenLibrary() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  statusBar().forEach(e=>els.push(e));

  // Header
  serif(24,76,'prose',24,SIENNA,{fw:700,ls:-1});
  els.push(serif(24,76,'prose',24,SIENNA,{fw:700,ls:-1}));
  els.push(text(W-24,76,'⊕ Add',12,SIENNA,{anchor:'end',fw:500}));
  els.push(line(24,86,W-24,86,'rgba(30,24,18,0.1)'));

  // Greeting strip
  els.push(rect(16,96,W-32,36,SURF,{rx:10}));
  els.push(text(28,118,'Good morning, Anna. You read 44 pages yesterday.',12,TEXT));
  circle(W-30,114,6,SIENNA,{opacity:0.7});
  els.push(circle(W-30,114,6,SIENNA,{opacity:0.7}));

  // Currently reading hero
  els.push(serif(24,148,'Currently Reading',16,TEXT,{fw:700}));
  els.push(rect(16,126,W-32,108,SURF,{rx:14}));
  // Book spine colour block (cover stand-in)
  els.push(rect(24,134,64,92,SIENNA,{rx:8}));
  // Cover title on spine
  els.push(text(56,178,'W',10,SURF,{anchor:'middle',fw:700,opacity:0.7}));
  // Book info
  els.push(serif(100,150,'The Women',16,TEXT,{fw:700}));
  els.push(text(100,168,'Kristin Hannah',12,MUTED));
  // Progress bar
  els.push(rect(100,178,W-32-100-16,8,CARD,{rx:4}));
  els.push(rect(100,178,(W-32-100-16)*0.63,8,SIENNA,{rx:4}));
  els.push(text(100,202,'p. 315 of 498',10,MUTED));
  els.push(text(W-28,202,'63%',10,SIENNA,{anchor:'end',fw:600}));
  // Time left estimate
  els.push(text(W-28,190,'~4h left',10,MUTED,{anchor:'end'}));

  // Tab row
  const tabs = ['All','Reading','Read','Want'];
  tabs.forEach((t,i) => {
    const tx = 24+i*82;
    const isActive = i===0;
    if(isActive) {
      els.push(rect(tx,248,62,26,SIENNA,{rx:13}));
      els.push(text(tx+31,265,t,11,SURF,{anchor:'middle',fw:600}));
    } else {
      els.push(text(tx,265,t,11,MUTED,{fw:400}));
    }
  });
  els.push(line(16,280,W-16,280,'rgba(30,24,18,0.08)'));

  // Book grid — 2 columns
  const books = [
    {title:'Tomorrow, Tomorrow',  author:'Gabrielle Zevin',       pct:100, col:'#3D5A80', status:'read'},
    {title:'Intermezzo',          author:'Sally Rooney',          pct:0,   col:'#C97B5A', status:'want'},
    {title:'James',               author:'Percival Everett',      pct:100, col:'#4A6741', status:'read'},
    {title:'Orbital',             author:'Samantha Harvey',       pct:0,   col:'#7A5C8C', status:'want'},
    {title:'The God of Small',    author:'Arundhati Roy',         pct:52,  col:'#8B5E3C', status:'reading'},
    {title:'All Fours',           author:'Miranda July',          pct:0,   col:'#C44B1E', status:'want'},
  ];

  books.forEach((b,i) => {
    const col = i%2===0 ? 16 : W/2+4;
    const row = Math.floor(i/2);
    const y = 294+row*120;
    els.push(rect(col,y,W/2-20,110,SURF,{rx:12}));
    // Cover block
    els.push(rect(col+8,y+8,52,78,b.col,{rx:6}));
    const initial = b.title.charAt(0);
    els.push(text(col+34,y+52,initial,16,SURF,{anchor:'middle',fw:700,opacity:0.6}));
    // Info
    els.push(serif(col+68,y+22,b.title.length>14?b.title.slice(0,13)+'…':b.title,11,TEXT,{fw:700}));
    els.push(text(col+68,y+36,b.author.split(' ').pop(),10,MUTED));
    // Status
    if(b.status==='read') {
      els.push(rect(col+68,y+46,36,14,SAGE,{rx:7,opacity:0.15}));
      els.push(text(col+86,y+56,'Read',9,SAGE,{anchor:'middle',fw:600}));
    } else if(b.status==='reading') {
      els.push(rect(col+8,y+92,W/2-36,8,CARD,{rx:4}));
      els.push(rect(col+8,y+92,(W/2-36)*(b.pct/100),8,SIENNA,{rx:4}));
    } else {
      els.push(rect(col+68,y+46,36,14,PEACH,{rx:7,opacity:0.3}));
      els.push(text(col+86,y+56,'Want',9,SAND,{anchor:'middle',fw:600}));
    }
  });

  bottomNav('library').forEach(e=>els.push(e));
  return { name:'Library', svg:'', elements: els };
}

// ─── SCREEN 2: BOOK DETAIL ───────────────────────────────────────────────────
function screenBookDetail() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  statusBar().forEach(e=>els.push(e));

  // Back
  els.push(text(24,72,'← Library',12,SIENNA,{fw:500}));

  // Hero cover + info
  els.push(rect(0,78,W,170,SIENNA,{rx:0}));
  // Cover
  els.push(rect(W/2-44,92,88,126,SURF,{rx:8,opacity:0.15}));
  els.push(rect(W/2-44,92,88,126,'rgba(255,255,255,0.08)',{rx:8,stroke:'rgba(255,255,255,0.2)',sw:1}));
  els.push(serif(W/2,155,'W',32,SURF,{anchor:'middle',fw:700,opacity:0.4}));
  els.push(serif(W/2,220,'The Women',20,SURF,{anchor:'middle',fw:700}));
  els.push(text(W/2,240,'Kristin Hannah · 2024',12,SURF,{anchor:'middle',opacity:0.75}));

  // Stats band
  els.push(rect(16,258,W-32,52,SURF,{rx:12}));
  const dStats = [
    {label:'Pages',   value:'498'},
    {label:'Progress',value:'63%'},
    {label:'Sessions',value:'14'},
    {label:'Days',    value:'22'},
  ];
  dStats.forEach((s,i) => {
    const x = 44+i*82;
    els.push(text(x,278,s.value,15,SIENNA,{fw:700,anchor:'middle'}));
    els.push(text(x,292,s.label,9,MUTED,{anchor:'middle'}));
    if(i<3) els.push(line(x+41,264,x+41,302,'rgba(30,24,18,0.08)'));
  });

  // Progress strip
  els.push(rect(16,320,W-32,8,CARD,{rx:4}));
  els.push(rect(16,320,(W-32)*0.63,8,SIENNA,{rx:4}));
  els.push(text(24,342,'Page 315 of 498',11,MUTED));
  els.push(text(W-24,342,'~4h 20m remaining',11,MUTED,{anchor:'end'}));

  // Tabs
  ['Notes','Highlights','Sessions','Details'].forEach((t,i) => {
    const isActive = i===0;
    const tx = 24+i*86;
    els.push(text(tx,366,t,12,isActive?TEXT:MUTED,{fw:isActive?600:400}));
    if(isActive) els.push(rect(tx,373,t.length*7,2,SIENNA,{rx:1}));
  });
  els.push(line(16,378,W-16,378,'rgba(30,24,18,0.08)'));

  // Notes
  const notes = [
    {page:142, note:'"She had always been brave. She just hadn\'t known it until now." — the central reveal. Note the shift from passive to active voice across Ch. 8.'},
    {page:89,  note:'The Vietnam sequences feel authentic — the sensory detail (red clay, heat, the smell of napalm) is doing more work than the dialogue.'},
    {page:34,  note:'Frankie\'s relationship with her father establishes the whole arc — worth rereading the opening after finishing.'},
  ];
  notes.forEach((n,i) => {
    const y = 390+i*106;
    els.push(rect(16,y,W-32,98,SURF,{rx:10}));
    els.push(rect(16,y,3,98,PEACH,{rx:2}));
    els.push(text(28,y+14,'p.'+n.page,10,SAND,{fw:600}));
    const words = n.note.split(' ');
    const line1 = words.slice(0,9).join(' ');
    const line2 = words.slice(9,18).join(' ');
    const line3 = words.slice(18).join(' ');
    els.push(serif(28,y+30,line1,11,TEXT));
    if(line2) els.push(serif(28,y+44,line2,11,TEXT));
    if(line3) els.push(serif(28,y+58,line3.slice(0,42)+(line3.length>42?'…':''),11,MUTED));
    els.push(text(W-24,y+14,'Edit',9,SIENNA,{anchor:'end',fw:500}));
  });

  // Log session CTA
  els.push(rect(16,704,W-32,44,SIENNA,{rx:22}));
  els.push(text(W/2,731,'▶ Log Reading Session',14,SURF,{anchor:'middle',fw:600}));

  bottomNav('library').forEach(e=>els.push(e));
  return { name:'Book Detail', svg:'', elements: els };
}

// ─── SCREEN 3: READING SESSION ───────────────────────────────────────────────
function screenSession() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  statusBar().forEach(e=>els.push(e));

  // Back + cancel
  els.push(text(24,72,'← The Women',12,SIENNA,{fw:500}));
  els.push(text(W-24,72,'Cancel',12,MUTED,{anchor:'end'}));

  // Session timer — big serif display
  els.push(serif(W/2,180,'32:14',56,TEXT,{anchor:'middle',fw:700,ls:-2}));
  els.push(text(W/2,204,'session time',12,MUTED,{anchor:'middle'}));

  // Ambient ring progress
  circle(W/2,160,88,CARD,{stroke:CARD,sw:12});
  els.push(circle(W/2,160,88,'none',{stroke:CARD,sw:12,opacity:0.3}));
  els.push(circle(W/2,160,88,'none',{stroke:SIENNA,sw:3,opacity:0.6}));
  // Decorative ring arcs (progress indicator)
  [0,45,90,135,180,225].forEach((deg,i) => {
    const rad = (deg-90) * Math.PI/180;
    const r = 88;
    const cx = W/2 + r*Math.cos(rad);
    const cy = 160 + r*Math.sin(rad);
    const opacity = i<4 ? 0.8 : 0.2;
    els.push(circle(cx,cy,3,SIENNA,{opacity}));
  });

  // Page entry
  els.push(rect(16,250,W-32,64,SURF,{rx:14}));
  els.push(serif(W/2,270,'Currently on page',12,MUTED,{anchor:'middle'}));
  els.push(serif(W/2,295,'315',28,TEXT,{anchor:'middle',fw:700}));
  // Page increment buttons
  els.push(rect(24,266,40,32,CARD,{rx:8}));
  els.push(text(44,287,'−',16,SIENNA,{anchor:'middle',fw:600}));
  els.push(rect(W-64,266,40,32,CARD,{rx:8}));
  els.push(text(W-44,287,'+',16,SIENNA,{anchor:'middle',fw:600}));

  // Today's progress
  els.push(rect(16,330,W-32,56,SURF,{rx:12}));
  const pStats = [
    {label:'Pages this session', value:'28'},
    {label:'Reading speed',       value:'32 p/h'},
    {label:'Total today',         value:'44 p'},
  ];
  pStats.forEach((s,i) => {
    const x = 52+i*110;
    els.push(text(x,352,s.value,13,SIENNA,{fw:700,anchor:'middle'}));
    els.push(text(x,368,s.label,9,MUTED,{anchor:'middle'}));
    if(i<2) els.push(line(x+55,336,x+55,378,'rgba(30,24,18,0.08)'));
  });

  // Mood / focus picker
  els.push(text(24,404,'How\'s the reading?',13,TEXT,{fw:600}));
  const moods = ['🔥 In flow','📖 Steady','😴 Tired','🤔 Distracted'];
  moods.forEach((m,i) => {
    const mx = i<2 ? 16+i*176 : 16+(i-2)*176;
    const my = i<2 ? 420 : 454;
    const isActive = i===0;
    els.push(rect(mx,my,164,28,isActive?SIENNA:SURF,{rx:14,stroke:isActive?'none':'rgba(30,24,18,0.1)',sw:1}));
    els.push(text(mx+82,my+18,m,11,isActive?SURF:MUTED,{anchor:'middle',fw:isActive?600:400}));
  });

  // Note field
  els.push(rect(16,492,W-32,80,SURF,{rx:12,stroke:'rgba(30,24,18,0.1)',sw:1}));
  els.push(serif(28,516,'Jot a note…',12,DIM));

  // End session
  els.push(rect(16,588,W-32,48,SIENNA,{rx:24}));
  els.push(text(W/2,617,'End Session',15,SURF,{anchor:'middle',fw:600}));
  els.push(text(W/2,648,'Started reading this at 8:43am',11,MUTED,{anchor:'middle'}));

  // Streak
  els.push(rect(16,660,W-32,36,CARD,{rx:10}));
  els.push(text(W/2,682,'🔥 14-day streak · keep it going',12,TEXT,{anchor:'middle',fw:500}));

  bottomNav('reading').forEach(e=>els.push(e));
  return { name:'Session', svg:'', elements: els };
}

// ─── SCREEN 4: HIGHLIGHTS & NOTES ────────────────────────────────────────────
function screenHighlights() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  statusBar().forEach(e=>els.push(e));

  // Header
  els.push(serif(24,76,'Notes & Highlights',20,TEXT,{fw:700}));
  els.push(text(W-24,76,'Export',12,SIENNA,{anchor:'end',fw:500}));
  els.push(line(24,86,W-24,86,'rgba(30,24,18,0.08)'));

  // Filter chips
  const chips = ['All','Quotes','My Notes','Ideas'];
  let cx2 = 16;
  chips.forEach((c,i) => {
    const cw = c.length*7+20;
    const isActive = i===0;
    els.push(rect(cx2,92,cw,26,isActive?SIENNA:CARD,{rx:13}));
    els.push(text(cx2+cw/2,109,c,11,isActive?SURF:MUTED,{anchor:'middle',fw:isActive?600:400}));
    cx2 += cw+8;
  });

  // Highlights — pull-quote style with serif
  const highlights = [
    {
      book:'The Women',
      page:142,
      type:'quote',
      col:PEACH,
      text:'"She had always been brave. She just hadn\'t known it until now."',
    },
    {
      book:'Tomorrow × Tomorrow',
      page:87,
      type:'note',
      col:SAGE,
      text:'The game-within-a-game structure mirrors the protagonist\'s dissociation — the author uses the game mechanics as a form of emotional armor.',
    },
    {
      book:'James',
      page:211,
      type:'quote',
      col:SIENNA,
      text:'"Freedom ain\'t free, and it ain\'t just about running. It\'s about knowing where you\'re running to."',
    },
    {
      book:'The Women',
      page:89,
      type:'note',
      col:PEACH,
      text:'Sensory anchoring (red clay, heat, napalm) in the Vietnam sequences. More visceral than anything in the dialogue — the environment is doing the characterization.',
    },
    {
      book:'Tomorrow × Tomorrow',
      page:34,
      type:'idea',
      col:SAND,
      text:'The "immersion paradox" — the more realistic the game world, the more players lose track of their real-world selves. Worth exploring in an essay.',
    },
  ];

  highlights.forEach((h,i) => {
    const y = 128+i*116;
    const isQuote = h.type==='quote';
    els.push(rect(16,y,W-32,108,SURF,{rx:12}));
    els.push(rect(16,y,4,108,h.col,{rx:2}));
    // Book + page label
    els.push(text(30,y+16,h.book,10,MUTED,{fw:500}));
    els.push(text(W-24,y+16,'p.'+h.page,10,MUTED,{anchor:'end'}));
    // Type badge
    const badgeCol = h.type==='quote'?PEACH:h.type==='note'?SAGE:SAND;
    els.push(rect(30,y+26,52,14,badgeCol,{rx:7,opacity:0.2}));
    els.push(text(56,y+36,h.type.charAt(0).toUpperCase()+h.type.slice(1),9,badgeCol,{anchor:'middle',fw:600}));
    // Text — serif for quotes
    const textFont = isQuote ? SERIF : 'Inter,sans-serif';
    const snippet = h.text.slice(0,90)+(h.text.length>90?'…':'');
    els.push(text(30,y+54,snippet,11,TEXT,{font:textFont,fw:isQuote?400:400}));
    if(h.text.length>50) els.push(text(30,y+68,h.text.slice(50,90)+(h.text.length>90?'…':''),11,TEXT,{font:textFont,opacity:0.7}));
    els.push(text(30,y+86,'Share · Edit · Delete',10,DIM));
  });

  bottomNav('highlights').forEach(e=>els.push(e));
  return { name:'Notes', svg:'', elements: els };
}

// ─── SCREEN 5: DISCOVER ──────────────────────────────────────────────────────
function screenDiscover() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  statusBar().forEach(e=>els.push(e));

  // Header
  els.push(serif(24,76,'Discover',20,TEXT,{fw:700}));
  els.push(text(W-24,76,'⊕ Wishlist',12,SIENNA,{anchor:'end',fw:500}));
  els.push(line(24,86,W-24,86,'rgba(30,24,18,0.08)'));

  // Search
  els.push(rect(16,92,W-32,38,SURF,{rx:19,stroke:'rgba(30,24,18,0.1)',sw:1}));
  els.push(text(44,116,'⊕ Search books, authors, genres…',13,MUTED));

  // Curated shelf — horizontal cards
  els.push(serif(24,148,'Because you read Kristin Hannah',13,TEXT,{fw:600}));
  const recBooks = [
    {title:'Demon Copperhead', author:'Kingsolver', col:'#7A5C8C'},
    {title:'The Covenant of Water', author:'Verghese', col:'#3D5A80'},
    {title:'Lessons in Chemistry',  author:'Garmus',  col:'#C44B1E'},
    {title:'Birnam Wood',           author:'Catton',  col:'#4A6741'},
  ];
  recBooks.forEach((b,i) => {
    const x = 16+i*100;
    els.push(rect(x,162,88,120,SURF,{rx:10}));
    els.push(rect(x+6,168,52,74,b.col,{rx:6}));
    els.push(text(x+32,210,b.title.charAt(0),18,SURF,{anchor:'middle',fw:700,opacity:0.5}));
    const titleWords = b.title.split(' ');
    els.push(text(x+8,250,titleWords[0],10,TEXT,{fw:600}));
    if(titleWords[1]) els.push(text(x+8,262,titleWords[1],10,MUTED));
    els.push(text(x+8,274,b.author,9,MUTED));
  });

  // Genre strip
  els.push(text(24,300,'Browse by genre',13,TEXT,{fw:600}));
  const genres = ['Fiction','Non-fiction','Biography','Poetry','History','Science'];
  genres.forEach((g,i) => {
    const gx = i<3 ? 16+i*120 : 16+(i-3)*120;
    const gy = i<3 ? 318 : 354;
    const gCol = [SIENNA,SAGE,PEACH,SAND,'#7A5C8C','#3D5A80'][i];
    els.push(rect(gx,gy,112,28,gCol,{rx:14,opacity:0.12}));
    els.push(text(gx+56,gy+18,g,11,gCol,{anchor:'middle',fw:600}));
  });

  // Trending now
  els.push(text(24,400,'Trending in Literary Fiction',13,TEXT,{fw:600}));
  const trending = [
    {rank:1, title:'James',          author:'Percival Everett',  col:'#4A6741'},
    {rank:2, title:'Intermezzo',     author:'Sally Rooney',      col:'#C97B5A'},
    {rank:3, title:'Orbital',        author:'Samantha Harvey',   col:'#7A5C8C'},
    {rank:4, title:'All Fours',      author:'Miranda July',      col:'#C44B1E'},
    {rank:5, title:'The Familiar',   author:'Leigh Bardugo',     col:'#3D5A80'},
  ];
  trending.forEach((b,i) => {
    const y = 418+i*60;
    els.push(rect(16,y,W-32,52,SURF,{rx:10}));
    els.push(text(30,y+28,b.rank.toString(),18,MUTED,{fw:700,opacity:0.3}));
    els.push(rect(54,y+8,38,36,b.col,{rx:6}));
    els.push(text(73,y+30,b.title.charAt(0),12,SURF,{anchor:'middle',fw:700,opacity:0.6}));
    els.push(serif(102,y+22,b.title,13,TEXT,{fw:700}));
    els.push(text(102,y+36,b.author,10,MUTED));
    els.push(text(W-24,y+28,'+ Want',10,SIENNA,{anchor:'end',fw:500}));
  });

  bottomNav('discover').forEach(e=>els.push(e));
  return { name:'Discover', svg:'', elements: els };
}

// ─── SCREEN 6: PROFILE ───────────────────────────────────────────────────────
function screenProfile() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  statusBar().forEach(e=>els.push(e));

  // Header
  els.push(serif(24,76,'Your Reading Life',20,TEXT,{fw:700}));
  els.push(text(W-24,76,'2026',12,MUTED,{anchor:'end'}));
  els.push(line(24,86,W-24,86,'rgba(30,24,18,0.08)'));

  // Avatar + name
  els.push(circle(W/2,134,36,SIENNA,{opacity:0.12}));
  els.push(serif(W/2,130,'A',20,SIENNA,{anchor:'middle',fw:700}));
  els.push(serif(W/2,156,'Anna Kimura',16,TEXT,{anchor:'middle',fw:700}));
  els.push(text(W/2,174,'Reading since January 2024',11,MUTED,{anchor:'middle'}));

  // Year stats — serif-accented
  els.push(rect(16,188,W-32,64,SURF,{rx:14}));
  const yStats = [
    {label:'Books read', value:'24'},
    {label:'Pages',      value:'7,240'},
    {label:'Hours',      value:'148'},
    {label:'Streak',     value:'14d'},
  ];
  yStats.forEach((s,i) => {
    const x = 44+i*82;
    const col = i===0?SIENNA:i===3?SAGE:TEXT;
    els.push(serif(x,212,s.value,16,col,{fw:700,anchor:'middle'}));
    els.push(text(x,228,s.label,9,MUTED,{anchor:'middle'}));
    if(i<3) els.push(line(x+41,194,x+41,246,'rgba(30,24,18,0.07)'));
  });

  // Reading streak calendar — month grid
  els.push(serif(24,272,'April 2026',14,TEXT,{fw:700}));
  els.push(text(W-24,272,'Longest: 22 days',11,MUTED,{anchor:'end'}));
  // Mini calendar dots
  const streakDays = [true,true,true,false,true,true,true,true,false,true];
  streakDays.forEach((active,i) => {
    const row = Math.floor(i/7);
    const col2 = i%7;
    const dx = 24+col2*50;
    const dy = 288+row*36;
    els.push(circle(dx,dy,14,active?SIENNA:CARD,{opacity:active?0.8:1}));
    els.push(text(dx,dy+5,(i+1).toString(),10,active?SURF:MUTED,{anchor:'middle',fw:active?600:400}));
  });

  // Goal progress
  els.push(serif(24,370,'2026 Reading Goal',14,TEXT,{fw:700}));
  els.push(rect(16,386,W-32,52,SURF,{rx:12}));
  const goalPct = 0.6; // 24 of 40
  els.push(rect(28,402,W-32-24,14,CARD,{rx:7}));
  els.push(rect(28,402,(W-32-24)*goalPct,14,SIENNA,{rx:7}));
  els.push(text(28,430,'24 of 40 books',11,MUTED));
  els.push(text(W-24,430,'60% · on track',11,SAGE,{anchor:'end',fw:500}));

  // Monthly reading habit chart — mini bars
  els.push(serif(24,458,'Reading Habit — This Month',14,TEXT,{fw:700}));
  els.push(rect(16,474,W-32,52,SURF,{rx:12}));
  // 10 day mini bar chart
  const dayPages = [32,0,44,28,36,0,52,41,44,28];
  const maxPages = Math.max(...dayPages);
  dayPages.forEach((pg,i) => {
    const bx = 28+i*32;
    const bh = pg>0?(pg/maxPages)*34:4;
    els.push(rect(bx,516-bh,22,bh,pg>0?SIENNA:CARD,{rx:3,opacity:pg>0?0.7:0.5}));
    els.push(text(bx+11,522,(i+1).toString(),8,MUTED,{anchor:'middle'}));
  });

  // Favourite genres
  els.push(serif(24,540,'Top Genres',14,TEXT,{fw:700}));
  const genres = [
    {name:'Literary Fiction', pct:55, col:SIENNA},
    {name:'History',          pct:25, col:SAGE  },
    {name:'Biography',        pct:12, col:PEACH },
    {name:'Other',            pct:8,  col:SAND  },
  ];
  genres.forEach((g,i) => {
    const y = 558+i*42;
    els.push(serif(24,y+14,g.name,12,TEXT));
    const barW = W-32-80;
    els.push(rect(130,y+4,barW,14,CARD,{rx:7}));
    els.push(rect(130,y+4,barW*(g.pct/100),14,g.col,{rx:7,opacity:0.7}));
    els.push(text(130+barW+8,y+14,g.pct+'%',10,MUTED,{fw:500}));
    els.push(line(24,y+36,W-24,y+36,'rgba(30,24,18,0.06)'));
  });

  // Best books this year
  els.push(serif(24,730,'Favourites This Year',14,TEXT,{fw:700}));
  const faves = ['Tomorrow × Tomorrow', 'James', 'The Women'];
  faves.forEach((f,i) => {
    const fx = 20+i*118;
    els.push(rect(fx,748,106,50,SURF,{rx:8}));
    els.push(text(fx+8,768,f.slice(0,12)+(f.length>12?'…':''),10,TEXT,{fw:500}));
    els.push(circle(fx+96,758,8,SIENNA,{opacity:0.7}));
    els.push(text(fx+96,762,'★',8,SURF,{anchor:'middle'}));
  });

  bottomNav('profile').forEach(e=>els.push(e));
  return { name:'Profile', svg:'', elements: els };
}

// ─── ASSEMBLE ─────────────────────────────────────────────────────────────────
const screens = [
  screenLibrary(),
  screenBookDetail(),
  screenSession(),
  screenHighlights(),
  screenDiscover(),
  screenProfile(),
];

let total = 0;
screens.forEach(s => { total += s.elements.length; });

const pen = {
  version: '2.8',
  metadata: {
    name: 'PROSE',
    author: 'RAM',
    date: '2026-04-10',
    theme: 'light',
    heartbeat: 48,
    elements: total,
  },
  screens,
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`PROSE: ${screens.length} screens, ${total} elements`);
console.log(`Written: ${SLUG}.pen`);
