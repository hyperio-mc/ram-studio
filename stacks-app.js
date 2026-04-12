'use strict';
const fs = require('fs'), path = require('path');

const SLUG = 'stacks';
const W = 390, H = 844;

// ─── PALETTE — Warm Editorial Light ─────────────────────────────────────────
// Inspired by: KOMETA Typefaces + Litbix (minimal.gallery)
// Clean warm cream, terracotta accent, serif-forward editorial feel
const CREAM  = '#FAF7F0';   // page background — warm parchment
const WHITE  = '#FFFFFF';   // card surface
const TINT   = '#F4EDE0';   // subtle tinted card/section bg
const RULE   = '#E8DFD0';   // hairline rules / borders
const INK    = '#1E1A14';   // near-black ink
const INK2   = 'rgba(30,26,20,0.55)';  // secondary text
const INK3   = 'rgba(30,26,20,0.32)';  // tertiary / muted
const TERRA  = '#C45D2A';   // terracotta accent — reading progress/active
const TERRA2 = '#E8855A';   // lighter terracotta
const SAGE   = '#5A8A7A';   // sage green — secondary accent (completed)
const AMBER  = '#F0A500';   // amber — streak/highlight
const SERIF  = 'Georgia,serif';
const SANS   = 'Inter,sans-serif';

// ─── PRIMITIVES ──────────────────────────────────────────────────────────────
function rect(x,y,w,h,fill,opts={}) {
  return { type:'rect', x, y, w, h, fill,
    rx: opts.rx||0, opacity: opts.opacity||1,
    stroke: opts.stroke||'none', sw: opts.sw||1 };
}
function text(x,y,content,size,fill,opts={}) {
  return { type:'text', x, y, content, size, fill,
    fw: opts.fw||400, font: opts.font||SANS,
    anchor: opts.anchor||'start', ls: opts.ls||0, opacity: opts.opacity||1 };
}
function circle(cx,cy,r,fill,opts={}) {
  return { type:'circle', cx, cy, r, fill,
    opacity: opts.opacity||1, stroke: opts.stroke||'none', sw: opts.sw||1 };
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  return { type:'line', x1, y1, x2, y2, stroke, sw: opts.sw||1, opacity: opts.opacity||1 };
}

// ─── STATUS BAR ──────────────────────────────────────────────────────────────
function statusBar(bg) {
  return [
    rect(0,0,W,44,bg||CREAM),
    text(18,28,'9:41',13,INK,{fw:600}),
    text(W-18,28,'● ▲ ▮',10,INK2,{anchor:'end'}),
  ];
}

// ─── BOTTOM NAV ──────────────────────────────────────────────────────────────
function bottomNav(active) {
  const items = [
    { id:'today',    icon:'◎', label:'Today'    },
    { id:'stacks',   icon:'≡', label:'Stacks'   },
    { id:'reading',  icon:'◉', label:'Reading'  },
    { id:'discover', icon:'◈', label:'Discover' },
    { id:'notes',    icon:'✦', label:'Notes'    },
  ];
  const els = [];
  // Nav bar background
  els.push(rect(0,H-80,W,80,WHITE,{opacity:1}));
  els.push(line(0,H-80,W,H-80,RULE,{sw:0.5}));

  const step = W/items.length;
  items.forEach((it,i) => {
    const cx = step*i + step/2;
    const isActive = it.id === active;
    if (isActive) {
      els.push(rect(cx-28, H-74, 56, 28, TINT, {rx:14}));
    }
    els.push(text(cx,H-52,it.icon,14, isActive ? TERRA : INK3,
      {anchor:'middle', fw: isActive?700:400}));
    els.push(text(cx,H-36,it.label,9, isActive ? TERRA : INK3,
      {anchor:'middle', fw: isActive?600:400}));
  });
  return els;
}

// ─── SCREEN 1: TODAY ─────────────────────────────────────────────────────────
function screenToday() {
  const els = [];
  els.push(...statusBar());
  els.push(rect(0,0,W,H,CREAM));  // page bg
  els.push(...statusBar());

  // Header
  els.push(text(24,74,'Good morning, Mara.',15,INK2,{fw:400}));
  els.push(text(24,100,'Today in Books',26,INK,{fw:700,font:SERIF}));

  // Streak pill
  els.push(rect(W-80,60,68,28,AMBER,{rx:14,opacity:0.15}));
  els.push(text(W-46,79,'🔥 21d',11,AMBER,{fw:700,anchor:'middle'}));

  // Current book card — large editorial
  els.push(rect(24,118,W-48,178,WHITE,{rx:12,opacity:1,stroke:RULE,sw:1}));

  // Book cover (abstract colored block)
  els.push(rect(36,130,80,154,TINT,{rx:8}));
  // cover stripes to suggest pages
  els.push(rect(36,130,80,154,'none',{rx:8,stroke:RULE,sw:0.5}));
  for(let i=1;i<8;i++) {
    els.push(line(36,130+i*19.2,116,130+i*19.2,RULE,{sw:0.3,opacity:0.6}));
  }
  els.push(rect(44,150,64,8,TERRA,{rx:4,opacity:0.7}));
  els.push(text(78,176,'S',32,TERRA,{fw:800,font:SERIF,anchor:'middle',opacity:0.4}));

  // Book info
  els.push(text(130,144,'Currently Reading',9,INK3,{fw:500,ls:0.5}));
  els.push(text(130,162,'Sapiens',18,INK,{fw:700,font:SERIF}));
  els.push(text(130,180,'Yuval Noah Harari',12,INK2,{fw:400}));
  els.push(text(130,200,'Non-fiction · History',10,INK3,{fw:400}));

  // Progress bar
  els.push(rect(130,214,W-155,6,TINT,{rx:3}));
  els.push(rect(130,214,(W-155)*0.62,6,TERRA,{rx:3}));
  els.push(text(130,230,'62% complete',9,TERRA,{fw:600}));
  els.push(text(W-35,230,'ch.14/23',9,INK3,{fw:400,anchor:'end'}));

  // Reading goal section
  els.push(text(24,316,'Daily goal',13,INK,{fw:600}));
  els.push(text(W-24,316,'30 min',13,TERRA,{fw:700,anchor:'end'}));
  els.push(line(24,326,W-24,326,RULE,{sw:0.5}));

  // Goal progress row
  const slots = 6;
  const slotW = (W-48)/slots;
  ['Mon','Tue','Wed','Thu','Fri','Sat'].forEach((day,i) => {
    const x = 24 + i*slotW + slotW/2;
    const done = i < 4;
    const today = i === 3;
    els.push(circle(x, 358, today?14:11,
      done ? TERRA : TINT, done?{}:{stroke:RULE,sw:1}));
    if(done) els.push(text(x,362,'✓',today?10:8,WHITE,{anchor:'middle',fw:700}));
    els.push(text(x,381,day,8,today?TERRA:INK3,{anchor:'middle',fw:today?700:400}));
  });

  // Today session
  els.push(rect(24,396,W-48,72,TINT,{rx:10}));
  els.push(text(38,418,'Today\'s session',11,INK2,{fw:500}));
  els.push(text(38,440,'18 min read so far',22,INK,{fw:700,font:SERIF}));
  els.push(text(38,456,'12 min left to hit goal',10,INK3,{fw:400}));
  els.push(rect(W-90,410,62,32,TERRA,{rx:16}));
  els.push(text(W-59,431,'Resume',10,WHITE,{fw:700,anchor:'middle'}));

  // Horizontal divider section
  els.push(line(24,480,W-24,480,RULE,{sw:0.5}));
  els.push(text(24,498,'Up next in your stack',12,INK,{fw:600}));

  // Mini book queue
  [
    {title:'The Aleph',author:'Borges',color:'#8FA8C8'},
    {title:'Piranesi',author:'Clarke',color:'#B8A0C8'},
    {title:'Pachinko',author:'Lee Min-jin',color:'#A0C4A8'},
  ].forEach((book, i) => {
    const y = 510 + i*52;
    els.push(rect(24,y,W-48,44,WHITE,{rx:8,stroke:RULE,sw:0.5}));
    // mini cover
    els.push(rect(34,y+8,28,28,book.color,{rx:4,opacity:0.85}));
    els.push(text(24+22,y+26,book.title.slice(0,1),14,WHITE,{fw:800,font:SERIF,anchor:'middle',opacity:0.7}));
    // info
    els.push(text(74,y+19,book.title,13,INK,{fw:600}));
    els.push(text(74,y+34,book.author,10,INK3,{fw:400}));
    // queue number
    els.push(text(W-32,y+26,`#${i+2}`,10,INK3,{fw:500,anchor:'end'}));
  });

  els.push(...bottomNav('today'));
  return els;
}

// ─── SCREEN 2: MY STACKS (LIBRARY) ──────────────────────────────────────────
function screenStacks() {
  const els = [];
  els.push(rect(0,0,W,H,CREAM));
  els.push(...statusBar());

  els.push(text(24,74,'My Stacks',26,INK,{fw:700,font:SERIF}));
  els.push(text(24,98,'47 books across 4 stacks',12,INK2));

  // Stack filter tabs
  const tabs = ['All','Reading','Want to Read','Done'];
  let tx = 24;
  tabs.forEach((tab,i) => {
    const tw = tab.length*7.2 + 18;
    const active = i===0;
    els.push(rect(tx,112,tw,28,active?INK:TINT,{rx:14}));
    els.push(text(tx+tw/2,130,tab,10,active?WHITE:INK2,{anchor:'middle',fw:active?700:400}));
    tx += tw + 8;
  });

  // Grid of books — 3 columns
  const books = [
    {t:'Sapiens',   c:TERRA,  s:'Reading',  pct:62},
    {t:'The Aleph', c:'#8FA8C8',s:'Queue',   pct:0},
    {t:'Piranesi',  c:'#B8A0C8',s:'Queue',   pct:0},
    {t:'Pachinko',  c:'#A0C4A8',s:'Done',    pct:100},
    {t:'Stoner',    c:'#C8B48A',s:'Done',    pct:100},
    {t:'NW',        c:'#D4A0A0',s:'Reading', pct:31},
    {t:'Gilead',    c:'#A8C0D4',s:'Queue',   pct:0},
    {t:'Lonesome',  c:'#C4A8D4',s:'Queue',   pct:0},
    {t:'Interior',  c:'#B4CCA8',s:'Queue',   pct:0},
  ];
  const cols = 3;
  const bw = (W-48-16)/cols;
  const bh = 130;
  books.forEach((book, i) => {
    const col = i%cols;
    const row = Math.floor(i/cols);
    const bx = 24 + col*(bw+8);
    const by = 150 + row*(bh+10);
    els.push(rect(bx,by,bw,bh,book.c,{rx:8,opacity:0.85}));
    // Page lines
    for(let p=1;p<5;p++) {
      els.push(line(bx+8,by+p*18,bx+bw-8,by+p*18,'rgba(255,255,255,0.2)',{sw:0.5}));
    }
    els.push(text(bx+bw/2,by+bh/2-10,book.t.slice(0,2),28,WHITE,
      {fw:800,font:SERIF,anchor:'middle',opacity:0.55}));
    els.push(text(bx+bw/2,by+bh-16,book.t,9,WHITE,
      {fw:600,anchor:'middle',opacity:0.9}));
    if(book.pct>0&&book.pct<100) {
      els.push(rect(bx+8,by+bh-8,bw-16,3,WHITE,{rx:2,opacity:0.2}));
      els.push(rect(bx+8,by+bh-8,(bw-16)*book.pct/100,3,WHITE,{rx:2,opacity:0.85}));
    }
    if(book.s==='Done') {
      els.push(circle(bx+bw-12,by+10,8,SAGE));
      els.push(text(bx+bw-12,by+14,'✓',8,WHITE,{anchor:'middle',fw:700}));
    }
  });

  els.push(...bottomNav('stacks'));
  return els;
}

// ─── SCREEN 3: CURRENTLY READING ────────────────────────────────────────────
function screenReading() {
  const els = [];
  els.push(rect(0,0,W,H,WHITE));
  els.push(...statusBar(WHITE));

  // Back nav
  els.push(text(24,72,'← Stacks',12,INK2,{fw:500}));
  els.push(text(W-24,72,'⊕ Note',12,TERRA,{fw:600,anchor:'end'}));

  // Large book cover area
  els.push(rect(0,84,W,220,TINT));
  els.push(rect(W/2-56,100,112,188,TERRA,{rx:8,opacity:0.9}));
  // page lines on cover
  for(let i=1;i<9;i++) {
    els.push(line(W/2-50,100+i*20,W/2+50,100+i*20,'rgba(255,255,255,0.15)',{sw:0.5}));
  }
  els.push(text(W/2,180,'S',52,WHITE,{fw:900,font:SERIF,anchor:'middle',opacity:0.35}));
  els.push(text(W/2,218,'SAPIENS',11,WHITE,{fw:700,anchor:'middle',ls:2}));
  els.push(text(W/2,234,'YUVAL NOAH HARARI',9,WHITE,{fw:400,anchor:'middle',ls:1,opacity:0.75}));

  // Reading position overlay
  const arcR = 28;
  els.push(circle(W-56, 95, arcR, WHITE, {opacity:0.92}));
  els.push(text(W-56,91,'62',16,TERRA,{fw:800,anchor:'middle'}));
  els.push(text(W-56,104,'%',9,INK3,{anchor:'middle'}));

  // Chapter progress
  els.push(rect(24,316,W-48,2,RULE));
  els.push(rect(24,316,(W-48)*0.62,2,TERRA));

  // Book metadata
  els.push(text(24,338,'CHAPTER 14 OF 23',9,INK3,{fw:600,ls:0.8}));
  els.push(text(24,360,'The Arrow of History',20,INK,{fw:700,font:SERIF}));
  els.push(text(24,380,'Started Jan 3 · Est. 4h 12m left',11,INK2));

  els.push(line(24,396,W-24,396,RULE,{sw:0.5}));

  // Reading stats row
  const stats = [{v:'18 min',l:'Today'},{v:'ch.14',l:'Position'},{v:'p.312',l:'Page'}];
  stats.forEach((s,i) => {
    const x = 24 + i*(W-48)/3 + (W-48)/6;
    els.push(text(x,416,s.v,16,INK,{fw:700,anchor:'middle'}));
    els.push(text(x,432,s.l,9,INK3,{anchor:'middle'}));
    if(i<2) els.push(line(24+(i+1)*(W-48)/3,406,24+(i+1)*(W-48)/3,436,RULE,{sw:0.5}));
  });

  els.push(line(24,444,W-24,444,RULE,{sw:0.5}));

  // Latest note
  els.push(text(24,464,'Your last highlight',11,INK2,{fw:500}));
  els.push(rect(24,476,W-48,68,TINT,{rx:10}));
  els.push(rect(28,476,3,68,TERRA,{rx:2}));
  els.push(text(40,494,'"History is something that very few',10,INK,{fw:400,font:SERIF}));
  els.push(text(40,508,' people have been doing while everyone',10,INK,{fw:400,font:SERIF}));
  els.push(text(40,522,' else was ploughing fields…"',10,INK,{fw:400,font:SERIF}));
  els.push(text(40,536,'p.308 · 2 days ago',9,INK3));

  // CTA
  els.push(rect(24,558,W-48,48,TERRA,{rx:24}));
  els.push(text(W/2,587,'Continue Reading',14,WHITE,{fw:700,anchor:'middle'}));

  els.push(...bottomNav('reading'));
  return els;
}

// ─── SCREEN 4: DISCOVER ─────────────────────────────────────────────────────
function screenDiscover() {
  const els = [];
  els.push(rect(0,0,W,H,CREAM));
  els.push(...statusBar());

  els.push(text(24,74,'Discover',26,INK,{fw:700,font:SERIF}));
  els.push(text(24,98,'Curated for your taste',12,INK2));

  // Search bar
  els.push(rect(24,112,W-48,40,WHITE,{rx:20,stroke:RULE,sw:1}));
  els.push(text(48,136,'⌕  Search books, authors…',13,INK3));

  // Featured picks label
  els.push(text(24,172,'Editor\'s picks this week',12,INK,{fw:600}));

  // Large horizontal featured card
  const feat = {t:'The Remains of the Day',a:'Kazuo Ishiguro',c:'#8A9CB8',
    genre:'Literary Fiction · Booker Prize'};
  els.push(rect(24,186,W-48,120,feat.c,{rx:12,opacity:0.85}));
  for(let i=1;i<6;i++) {
    els.push(line(24,186+i*20,W-24,186+i*20,'rgba(255,255,255,0.1)',{sw:0.5}));
  }
  els.push(text(44,220,'R',44,WHITE,{fw:900,font:SERIF,opacity:0.3}));
  els.push(rect(44,238,5,40,WHITE,{rx:3,opacity:0.7})); // bookmark
  els.push(text(W-32,208,'EDITOR\'S',8,WHITE,{fw:700,anchor:'end',ls:1.5,opacity:0.8}));
  els.push(text(W-32,220,'PICK',8,WHITE,{fw:700,anchor:'end',ls:1.5,opacity:0.8}));
  els.push(text(44,272,feat.t,16,WHITE,{fw:700,font:SERIF,opacity:0.95}));
  els.push(text(44,290,feat.a,11,WHITE,{opacity:0.75}));
  els.push(text(44,304,feat.genre,9,WHITE,{opacity:0.55}));

  // Horizontal scroll shelf
  els.push(text(24,326,'Because you liked Sapiens',12,INK,{fw:600}));
  els.push(text(W-24,326,'See all →',10,TERRA,{fw:600,anchor:'end'}));

  const recs = [
    {t:'Homo Deus',c:TERRA,opacity:0.85},
    {t:'21 Lessons',c:'#B4A882',opacity:0.85},
    {t:'Guns, Germs',c:'#82A89C',opacity:0.85},
    {t:'The Selfish Gene',c:'#A882A8',opacity:0.85},
  ];
  recs.forEach((b,i) => {
    const bx = 24+i*90;
    if(bx+80>W+60) return;
    els.push(rect(bx,338,72,102,b.c,{rx:8,opacity:b.opacity}));
    for(let p=1;p<5;p++) {
      els.push(line(bx+6,338+p*18,bx+66,338+p*18,'rgba(255,255,255,0.15)',{sw:0.4}));
    }
    els.push(text(bx+36,384,b.t.slice(0,2),22,WHITE,{fw:900,font:SERIF,anchor:'middle',opacity:0.4}));
    els.push(text(bx+36,432,b.t.split(' ')[0],8,INK2,{anchor:'middle'}));
  });

  // Genres row
  els.push(line(24,452,W-24,452,RULE,{sw:0.5}));
  els.push(text(24,470,'Browse by genre',12,INK,{fw:600}));

  const genres = [
    {label:'Fiction',color:TERRA},
    {label:'History',color:SAGE},
    {label:'Sci-Fi',color:'#6A8FB8'},
    {label:'Philosophy',color:'#B8956A'},
    {label:'Memoir',color:'#8FA882'},
    {label:'Science',color:'#A88FA8'},
  ];
  let gx = 24;
  genres.forEach((g,i) => {
    const gw = g.label.length*7.5+20;
    els.push(rect(gx,482,gw,28,g.color,{rx:14,opacity:0.15}));
    els.push(text(gx+gw/2,500,g.label,10,g.color,{fw:600,anchor:'middle'}));
    gx += gw+8;
    if(gx>W-60&&i===2) { gx=24; }
  });

  // Popular this week
  els.push(line(24,522,W-24,522,RULE,{sw:0.5}));
  els.push(text(24,540,'Popular this week',12,INK,{fw:600}));

  const pop = [
    {rank:1,t:'Prophet Song',a:'Paul Lynch',c:'#C8A882'},
    {rank:2,t:'James',a:'Percival Everett',c:'#A8C4A8'},
  ];
  pop.forEach((b,i) => {
    const by = 552 + i*58;
    els.push(rect(24,by,W-48,50,WHITE,{rx:10,stroke:RULE,sw:0.5}));
    // rank
    els.push(text(44,by+30,`${b.rank}`,18,RULE,{fw:800,font:SERIF}));
    // mini cover
    els.push(rect(64,by+8,34,34,b.c,{rx:5,opacity:0.85}));
    els.push(text(81,by+32,b.t.slice(0,1),16,WHITE,{fw:800,font:SERIF,anchor:'middle',opacity:0.6}));
    els.push(text(108,by+22,b.t,13,INK,{fw:600}));
    els.push(text(108,by+38,b.a,10,INK3));
    els.push(text(W-32,by+28,'+ Add',10,TERRA,{fw:700,anchor:'end'}));
  });

  els.push(...bottomNav('discover'));
  return els;
}

// ─── SCREEN 5: NOTES & HIGHLIGHTS ───────────────────────────────────────────
function screenNotes() {
  const els = [];
  els.push(rect(0,0,W,H,CREAM));
  els.push(...statusBar());

  els.push(text(24,74,'Notes',26,INK,{fw:700,font:SERIF}));
  els.push(text(24,98,'32 highlights · 12 notes',12,INK2));

  // Filter tabs
  const tabs = ['All','Highlights','Notes','Quotes'];
  let tx = 24;
  tabs.forEach((tab,i) => {
    const tw = tab.length*7+18;
    const active = i===0;
    els.push(rect(tx,112,tw,26,active?TERRA:'transparent',{rx:13,stroke:active?TERRA:RULE,sw:1}));
    els.push(text(tx+tw/2,129,tab,9,active?WHITE:INK2,{anchor:'middle',fw:active?700:400}));
    tx += tw+6;
  });

  // Book section header
  els.push(text(24,152,'Sapiens',14,INK,{fw:700,font:SERIF}));
  els.push(text(24,170,'Yuval Noah Harari · 18 notes',10,INK3));
  els.push(line(24,180,W-24,180,RULE,{sw:0.5}));

  // Note cards
  const notes = [
    {type:'highlight',text:'"The real difference between us and chimpanzees is the mythical glue that binds together large numbers of individuals, families and groups."',page:'p.28',chapter:'Ch.2',date:'Mar 12'},
    {type:'note',text:'Connects to Dunbar\'s number — the social brain hypothesis. Why do humans need narrative to scale cooperation?',page:'p.28',chapter:'Ch.2',date:'Mar 12'},
    {type:'highlight',text:'"Money is the most universal and most efficient system of mutual trust ever devised."',page:'p.180',chapter:'Ch.10',date:'Mar 28'},
  ];

  let ny = 192;
  notes.forEach(note => {
    const isHighlight = note.type==='highlight';
    const cardH = Math.ceil(note.text.length/44)*14 + 52;
    els.push(rect(24,ny,W-48,cardH,WHITE,{rx:10,stroke:RULE,sw:0.5}));
    // left accent bar
    els.push(rect(24,ny,3,cardH,isHighlight?AMBER:SAGE,{rx:0}));
    els.push(rect(24,ny,3,cardH,isHighlight?AMBER:SAGE,{rx:1}));
    // type label
    els.push(text(38,ny+14, isHighlight?'highlight':'note',8,
      isHighlight?AMBER:SAGE,{fw:600,ls:0.5}));
    els.push(text(W-32,ny+14,note.date,8,INK3,{anchor:'end'}));

    // text content — wrap manually
    const words = note.text.split(' ');
    let line1='',line2='',line3='',lineN=0;
    let curLine='';
    words.forEach(w => {
      if((curLine+w).length<45) { curLine+=w+' '; }
      else {
        lineN++;
        if(lineN===1) line1=curLine;
        else if(lineN===2) line2=curLine;
        else if(lineN===3) line3=curLine;
        curLine=w+' ';
      }
    });
    lineN++; if(lineN===1) line1=curLine; else if(lineN===2) line2=curLine; else if(lineN===3) line3=curLine;

    const textY = ny+26;
    if(line1) els.push(text(38,textY,line1.trim(),10,isHighlight?INK:INK2,{fw:400,font:isHighlight?SERIF:SANS}));
    if(line2) els.push(text(38,textY+14,line2.trim(),10,isHighlight?INK:INK2,{fw:400,font:isHighlight?SERIF:SANS}));
    if(line3) els.push(text(38,textY+28,line3.trim(),10,isHighlight?INK:INK2,{fw:400,font:isHighlight?SERIF:SANS}));

    els.push(text(38,ny+cardH-12,`${note.chapter} · ${note.page}`,8,INK3));
    ny += cardH + 8;
  });

  els.push(...bottomNav('notes'));
  return els;
}

// ─── SCREEN 6: YEAR IN READING (STATS) ──────────────────────────────────────
function screenStats() {
  const els = [];
  els.push(rect(0,0,W,H,INK));  // dark reverse for contrast
  els.push(...statusBar(INK));
  // override status bar text color
  els.push(text(18,28,'9:41',13,'rgba(255,255,255,0.8)',{fw:600}));

  // Headline — editorial big type
  els.push(text(24,80,'2025',44,CREAM,{fw:800,font:SERIF,opacity:0.12}));
  els.push(text(24,80,'2025',44,CREAM,{fw:800,font:SERIF})); // double for weight effect
  els.push(text(24,110,'In Reading',18,CREAM,{fw:700,font:SERIF,opacity:0.85}));
  els.push(text(24,130,'Your year with books',12,'rgba(250,247,240,0.45)'));

  // Hero stat
  els.push(text(24,172,'31',64,CREAM,{fw:900,font:SERIF}));
  els.push(text(24+52,172,'books',14,'rgba(250,247,240,0.5)',{fw:400}));
  els.push(text(24,198,'this year',11,'rgba(250,247,240,0.45)'));

  // Stats grid 2×2
  const stats = [
    {v:'8,412',l:'pages read',c:TERRA},
    {v:'127h',l:'time reading',c:AMBER},
    {v:'32',l:'highlights',c:SAGE},
    {v:'4.2',l:'avg rating',c:'#8FA8C8'},
  ];
  els.push(rect(24,212,W-48,110,TINT,{rx:14,opacity:0.06}));
  stats.forEach((s,i) => {
    const col = i%2;
    const row = Math.floor(i/2);
    const sx = 44 + col*((W-48)/2);
    const sy = 230 + row*46;
    els.push(text(sx,sy,s.v,22,s.c,{fw:800,font:SERIF}));
    els.push(text(sx,sy+16,s.l,9,'rgba(250,247,240,0.45)',{fw:400}));
    if(col===0) els.push(line(sx+(W-48)/2-8,sy-8,sx+(W-48)/2-8,sy+20,'rgba(250,247,240,0.1)',{sw:0.5}));
  });

  // Reading month chart
  els.push(line(24,334,W-24,334,'rgba(250,247,240,0.1)',{sw:0.5}));
  els.push(text(24,350,'Books per month',11,'rgba(250,247,240,0.5)',{fw:500}));

  const months = [2,3,4,2,3,5,4,3,4,3,1,3];
  const mLabels=['J','F','M','A','M','J','J','A','S','O','N','D'];
  const maxM = 5;
  const barW = (W-48)/12 - 4;
  months.forEach((m,i) => {
    const bx = 24 + i*((W-48)/12);
    const bh = (m/maxM)*50;
    const by = 402-bh;
    const isHighest = m===maxM;
    els.push(rect(bx+2,by,barW,bh,isHighest?TERRA:'rgba(250,247,240,0.2)',{rx:3}));
    els.push(text(bx+barW/2+2,416,mLabels[i],7,'rgba(250,247,240,0.35)',{anchor:'middle'}));
  });

  // Top genres
  els.push(line(24,428,W-24,428,'rgba(250,247,240,0.1)',{sw:0.5}));
  els.push(text(24,444,'Top genres',11,'rgba(250,247,240,0.5)',{fw:500}));

  const genres2 = [
    {label:'Literary Fiction',pct:42,c:TERRA},
    {label:'Non-fiction',pct:28,c:AMBER},
    {label:'History',pct:18,c:SAGE},
    {label:'Science',pct:12,c:'#8FA8C8'},
  ];
  genres2.forEach((g,i) => {
    const y = 458 + i*34;
    els.push(text(24,y+8,g.label,10,'rgba(250,247,240,0.7)',{fw:500}));
    els.push(text(W-24,y+8,`${g.pct}%`,10,g.c,{fw:700,anchor:'end'}));
    els.push(rect(24,y+14,W-48,5,TINT,{rx:3,opacity:0.08}));
    els.push(rect(24,y+14,(W-48)*g.pct/100,5,g.c,{rx:3,opacity:0.85}));
  });

  // Most read author
  els.push(line(24,598,W-24,598,'rgba(250,247,240,0.1)',{sw:0.5}));
  els.push(rect(24,610,W-48,56,TINT,{rx:10,opacity:0.08}));
  els.push(text(38,630,'Top Author',9,'rgba(250,247,240,0.35)',{fw:600,ls:0.5}));
  els.push(text(38,650,'Kazuo Ishiguro',16,CREAM,{fw:700,font:SERIF}));
  els.push(text(W-32,650,'3 books',10,'rgba(250,247,240,0.45)',{anchor:'end'}));

  // Nav (reversed colors for dark screen)
  const items = [{id:'today',icon:'◎',label:'Today'},{id:'stacks',icon:'≡',label:'Stacks'},
    {id:'reading',icon:'◉',label:'Reading'},{id:'discover',icon:'◈',label:'Discover'},
    {id:'notes',icon:'✦',label:'Notes'}];
  els.push(rect(0,H-80,W,80,INK));
  els.push(line(0,H-80,W,H-80,'rgba(250,247,240,0.08)',{sw:0.5}));
  const step = W/items.length;
  items.forEach((it,i) => {
    const cx = step*i + step/2;
    els.push(text(cx,H-52,it.icon,14,'rgba(250,247,240,0.3)',{anchor:'middle'}));
    els.push(text(cx,H-36,it.label,9,'rgba(250,247,240,0.3)',{anchor:'middle'}));
  });
  // stats = Today in this context, let's make it stand out differently
  // Actually stats is a 6th screen without nav match, just dim all

  return els;
}

// ─── ASSEMBLE PEN FILE ───────────────────────────────────────────────────────
const screens = [
  { name:'Today',            elements: screenToday()    },
  { name:'My Stacks',        elements: screenStacks()   },
  { name:'Currently Reading',elements: screenReading()  },
  { name:'Discover',         elements: screenDiscover() },
  { name:'Notes',            elements: screenNotes()    },
  { name:'Year in Reading',  elements: screenStats()    },
];

const totalElements = screens.reduce((acc,s)=>acc+s.elements.length,0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'STACKS',
    author: 'RAM',
    date: new Date().toISOString().slice(0,10),
    theme: 'light',
    heartbeat: 39,
    description: 'Personal reading stack & book intelligence — warm editorial light, serif-forward',
    elements: totalElements,
  },
  screens: screens.map(s => ({
    name: s.name,
    width: W,
    height: H,
    svg: `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"/>`,
    elements: s.elements,
  })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`STACKS: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
