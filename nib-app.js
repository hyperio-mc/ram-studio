'use strict';
/**
 * NIB — Rare Manuscript & Rare Books Catalogue
 * Heartbeat #498 | Theme: LIGHT (warm archival paper)
 * Inspired by: minimal.gallery Archival Index Aesthetic +
 *              Land-book Spaceship Manual annotation style
 */
const fs   = require('fs');
const path = require('path');

const SLUG = 'nib';
const NAME = 'NIB';
const W = 390, H = 844;

// ── Palette (warm archival paper / leather) ────────────────────────────────
const C = {
  bg:      '#FAF7F1',   // warm ivory
  surf:    '#FFFFFF',
  card:    '#F3EFE6',   // cream card
  card2:   '#EDE7D9',   // darker card
  text:    '#1C1915',   // near-black warm
  text2:   '#5A4F42',   // mid warm brown
  muted:   '#9C8E7E',   // muted warm
  acc:     '#4A3728',   // deep leather brown
  acc2:    '#B05C2E',   // terracotta annotation
  red:     '#C1440E',   // alert / annotation
  border:  '#D9D1C2',   // subtle border
  rule:    '#C8BEB0',   // hairline rule
  serif:   'Georgia, serif',
  sans:    '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  mono:    '"Courier New", Courier, monospace',
};

// ── Primitives ─────────────────────────────────────────────────────────────
function rect(x,y,w,h,fill,opts={}) {
  return { type:'rect', x, y, w, h, fill,
    rx: opts.rx||0, opacity: opts.opacity??1,
    stroke: opts.stroke||'none', strokeWidth: opts.sw||0 };
}
function text(x,y,content,size,fill,opts={}) {
  return { type:'text', x, y, content, fontSize: size, fill,
    fontWeight: opts.fw||400, fontFamily: opts.font||C.sans,
    textAnchor: opts.anchor||'start', letterSpacing: opts.ls||0,
    opacity: opts.opacity??1 };
}
function circle(cx,cy,r,fill,opts={}) {
  return { type:'circle', cx, cy, r, fill,
    opacity: opts.opacity??1, stroke: opts.stroke||'none', strokeWidth: opts.sw||0 };
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  return { type:'line', x1, y1, x2, y2, stroke,
    strokeWidth: opts.sw||1, opacity: opts.opacity??1,
    strokeDasharray: opts.dash||'' };
}

// ── Shared Components ──────────────────────────────────────────────────────
function statusBar(els) {
  els.push(rect(0,0,W,44,C.bg));
  els.push(text(20,28,'9:41',13,C.text2,{fw:600,font:C.sans}));
  els.push(text(370,28,'●●●',13,C.text2,{anchor:'end'}));
}

function navBar(els, active) {
  const tabs = [
    {id:'home',  label:'Home',     icon:'⌂'},
    {id:'browse',label:'Browse',   icon:'◫'},
    {id:'add',   label:'Acquire',  icon:'+'},
    {id:'map',   label:'Origins',  icon:'◉'},
    {id:'me',    label:'Profile',  icon:'◎'},
  ];
  els.push(rect(0,H-80,W,80,C.surf));
  els.push(line(0,H-80,W,H-80,C.border,{sw:0.5}));
  tabs.forEach((t,i) => {
    const x = 39 + i*62;
    const isActive = t.id === active;
    els.push(text(x,H-50,t.icon,18,isActive?C.acc:C.muted,{anchor:'middle',fw:400}));
    els.push(text(x,H-30,t.label,9,isActive?C.acc:C.muted,{anchor:'middle',fw:isActive?600:400}));
    if (isActive) {
      els.push(rect(x-18,H-80,36,2,C.acc,{rx:1}));
    }
  });
}

// ── Annotation pointer line helper ─────────────────────────────────────────
// Draws a Spaceship Manual style pointer: dot → L-shaped line → label
function annotationLine(els, fromX,fromY, toX,toY, label, side='right') {
  // connector dot at origin
  els.push(circle(fromX,fromY,2.5,C.acc2,{opacity:0.9}));
  // L-shaped path via elbow
  const elbowY = fromY;
  els.push(line(fromX,fromY, toX,elbowY, C.acc2,{sw:0.5,opacity:0.7}));
  els.push(line(toX,elbowY, toX,toY, C.acc2,{sw:0.5,opacity:0.7}));
  // end tick
  const tickDir = side==='right' ? 10 : -10;
  els.push(line(toX,toY, toX+tickDir,toY, C.acc2,{sw:0.5,opacity:0.7}));
  // label
  const lx = side==='right' ? toX+14 : toX-14;
  const anchor = side==='right' ? 'start' : 'end';
  els.push(text(lx,toY+4,label,8,C.acc2,{anchor,font:C.mono,opacity:0.85}));
}

// ── SCREEN 1 — Collection Index ────────────────────────────────────────────
function screenHome() {
  const els = [];
  statusBar(els);

  // Header bar
  els.push(rect(0,44,W,56,C.bg));
  els.push(line(0,99,W,99,C.border,{sw:0.5}));
  els.push(text(20,80,'NIB',22,C.acc,{fw:700,font:C.serif,ls:-0.5}));
  els.push(text(72,80,'— Manuscript Catalogue',11,C.text2,{fw:400,font:C.serif,opacity:0.75}));
  // search icon
  els.push(circle(355,72,13,C.card,{stroke:C.border,sw:1}));
  els.push(text(355,77,'⌕',14,C.text2,{anchor:'middle'}));

  // Section header — "Your Collection"
  els.push(text(20,124,'YOUR COLLECTION',9,C.muted,{fw:600,ls:2,font:C.mono}));
  els.push(text(340,124,'48 items',9,C.muted,{anchor:'end',font:C.mono}));
  els.push(line(20,133,370,133,C.rule,{sw:0.3}));

  // ── Bento grid of manuscripts (4 cards, varying sizes) ──────────────────
  // Large card (2×1 span) — featured manuscript
  els.push(rect(20,142,235,155,C.card,{rx:6,stroke:C.border,sw:0.5}));
  // Label strip top
  els.push(rect(20,142,235,20,C.card2,{rx:6}));
  els.push(rect(20,152,235,10,C.card2,{})); // square off bottom of top strip
  els.push(text(30,156,'LOT 001 — FEATURED',7,C.muted,{fw:600,ls:1.5,font:C.mono}));
  // Manuscript "texture" — horizontal lines suggesting text
  for(let i=0;i<7;i++){
    els.push(rect(32,170+i*11,172-i%3*8,2.5,C.rule,{rx:1.2,opacity:0.5+i*0.04}));
  }
  els.push(rect(32,249,68,2.5,C.acc2,{rx:1.2,opacity:0.35})); // annotation underline
  // Metadata
  els.push(text(30,279,'Gutenberg Bible Fragment',10,C.text,{fw:700,font:C.serif}));
  els.push(text(30,293,'c. 1455 · Mainz, Germany',9,C.text2,{font:C.mono}));

  // Small card top-right
  els.push(rect(265,142,105,70,C.card,{rx:6,stroke:C.border,sw:0.5}));
  els.push(rect(265,142,105,18,C.card2,{rx:6}));
  els.push(rect(265,150,105,10,C.card2,{}));
  els.push(text(273,155,'LOT 014',7,C.muted,{fw:600,ls:1,font:C.mono}));
  for(let i=0;i<3;i++) els.push(rect(275,163+i*9,75-i%2*10,2,C.rule,{rx:1,opacity:0.5}));
  els.push(text(273,203,'Papal Bull',9,C.text,{fw:600,font:C.serif}));
  els.push(text(273,215,'c. 1302',8,C.text2,{font:C.mono}));

  // Small card bottom-right
  els.push(rect(265,222,105,75,C.card,{rx:6,stroke:C.border,sw:0.5}));
  els.push(rect(265,222,105,18,C.card2,{rx:6}));
  els.push(rect(265,230,105,10,C.card2,{}));
  els.push(text(273,235,'LOT 027',7,C.muted,{fw:600,ls:1,font:C.mono}));
  for(let i=0;i<3;i++) els.push(rect(275,245+i*9,65-i%2*12,2,C.rule,{rx:1,opacity:0.5}));
  els.push(text(273,289,'Persian Poem',9,C.text,{fw:600,font:C.serif}));
  els.push(text(273,300,'14th cent.',8,C.text2,{font:C.mono}));

  // ── Index table — archival style ─────────────────────────────────────────
  els.push(text(20,320,'RECENT ACQUISITIONS',9,C.muted,{fw:600,ls:2,font:C.mono}));
  els.push(line(20,329,370,329,C.rule,{sw:0.3}));

  // Column headers
  els.push(text(20,346,'LOT',8,C.muted,{fw:600,ls:1.5,font:C.mono}));
  els.push(text(65,346,'TITLE',8,C.muted,{fw:600,ls:1.5,font:C.mono}));
  els.push(text(250,346,'DATE',8,C.muted,{fw:600,ls:1.5,font:C.mono}));
  els.push(text(310,346,'COND.',8,C.muted,{fw:600,ls:1.5,font:C.mono}));
  els.push(text(360,346,'VAL.',8,C.muted,{fw:600,ls:1.5,font:C.mono,anchor:'end'}));
  els.push(line(20,353,370,353,C.rule,{sw:0.3}));

  const rows = [
    {lot:'003',title:'Herbal Manuscript',date:'c.1430',cond:'Fine',val:'$24k'},
    {lot:'008',title:'Map of Jerusalem',date:'1482',cond:'Good',val:'$18k'},
    {lot:'011',title:'Book of Hours',date:'c.1450',cond:'V.Good',val:'$31k'},
    {lot:'019',title:'Arabic Astrolabe Manual',date:'c.1200',cond:'Fair',val:'$9k'},
    {lot:'023',title:'Illuminated Psalter',date:'c.1310',cond:'Fine',val:'$47k'},
  ];
  rows.forEach((r,i) => {
    const y = 368 + i*28;
    if(i%2===0) els.push(rect(20,y-11,350,24,C.card,{rx:3,opacity:0.5}));
    els.push(text(20,y,r.lot,9,C.muted,{font:C.mono}));
    els.push(text(65,y,r.title,9,C.text,{fw:i===0?600:400}));
    els.push(text(250,y,r.date,9,C.text2,{font:C.mono}));
    els.push(text(315,y,r.cond,9,r.cond==='Fine'||r.cond==='V.Good'?C.acc:C.text2,{font:C.mono}));
    els.push(text(360,y,r.val,9,C.text,{anchor:'end',fw:600,font:C.mono}));
    els.push(line(20,y+10,370,y+10,C.rule,{sw:0.2,opacity:0.5}));
  });

  navBar(els,'home');
  return { name:'Collection Index', elements: els };
}

// ── SCREEN 2 — Item Detail with Annotation Pointer Lines ──────────────────
function screenDetail() {
  const els = [];
  statusBar(els);

  // header
  els.push(rect(0,44,W,50,C.bg));
  els.push(line(0,93,W,93,C.border,{sw:0.5}));
  els.push(text(20,76,'‹ Back',12,C.acc,{fw:400}));
  els.push(text(195,76,'LOT 001',11,C.muted,{fw:600,ls:2,anchor:'middle',font:C.mono}));
  els.push(text(370,76,'⋯',18,C.acc,{anchor:'end'}));

  // Main title
  els.push(text(20,118,'Gutenberg Bible',20,C.text,{fw:700,font:C.serif,ls:-0.3}));
  els.push(text(20,136,'Fragment, Leaf 142',16,C.text2,{fw:400,font:C.serif}));

  // Manuscript render area — the "specimen" card
  const MX=20, MY=148, MW=270, MH=200;
  els.push(rect(MX,MY,MW,MH,C.card,{rx:8,stroke:C.border,sw:0.8}));
  // Aged paper texture — horizontal text lines
  for(let i=0;i<11;i++){
    const lineW = 200+Math.sin(i*1.3)*12;
    els.push(rect(MX+30,MY+22+i*15,lineW,2.5,C.rule,{rx:1.5,opacity:0.35+i*0.02}));
  }
  // Two column layout lines (like Bible pages)
  els.push(line(MX+148,MY+18,MX+148,MY+MH-18,C.rule,{sw:0.4,opacity:0.4}));
  for(let i=0;i<11;i++){
    els.push(rect(MX+162,MY+22+i*15,82,2.5,C.rule,{rx:1.5,opacity:0.3+i*0.02}));
  }
  // Rubrication — red initial letter block
  els.push(rect(MX+30,MY+22,22,30,C.acc2,{rx:2,opacity:0.25}));
  els.push(text(MX+34,MY+44,'B',16,C.acc2,{fw:700,font:C.serif,opacity:0.7}));
  // Page fold corner
  els.push(rect(MX+MW-22,MY+MH-22,22,22,C.card2,{rx:0}));
  els.push(line(MX+MW-22,MY+MH-22,MX+MW,MY+MH,C.border,{sw:0.5}));

  // ── Spaceship Manual annotation lines ─────────────────────────────────────
  // Annotation 1 — Rubrication (pointing to red letter area)
  annotationLine(els, MX+41,MY+36, 315,130, 'RUBRICATION', 'right');
  // Annotation 2 — Column separator
  annotationLine(els, MX+148,MY+100, 315,160, 'BICOLUMNAR', 'right');
  // Annotation 3 — Text line block
  annotationLine(els, MX+120,MY+50, 315,190, 'GOTHIC TEXTURA', 'right');
  // Annotation 4 — Page fold
  annotationLine(els, MX+MW-10,MY+MH-10, 315,220, 'VELLUM LEAF', 'right');

  // Vertical annotation ruler on left
  els.push(line(8,MY,8,MY+MH,C.rule,{sw:0.5,opacity:0.5}));
  for(let i=0;i<=4;i++){
    els.push(line(5,MY+i*(MH/4),11,MY+i*(MH/4),C.rule,{sw:0.5,opacity:0.5}));
    els.push(text(12,MY+i*(MH/4)+3,(i*(MH/4)).toFixed(0)+'px',6,C.muted,{font:C.mono,opacity:0.6}));
  }

  // Metadata grid below specimen
  const MBY = MY+MH+16;
  const specs = [
    {k:'Origin',    v:'Mainz, Germany'},
    {k:'Date',      v:'c. 1455'},
    {k:'Script',    v:'Textura Quadrata'},
    {k:'Material',  v:'Vellum'},
    {k:'Language',  v:'Latin'},
    {k:'Condition', v:'Fine / 9.2'},
    {k:'Provenance',v:'Eton College Library'},
    {k:'Value',     v:'$24,000 — $28,000'},
  ];
  specs.forEach((s,i) => {
    const col = i%2;
    const row = Math.floor(i/2);
    const x = col===0 ? 20 : 200;
    const y = MBY + row*28;
    els.push(text(x,y,s.k.toUpperCase(),7,C.muted,{fw:600,ls:1.5,font:C.mono}));
    els.push(text(x,y+13,s.v,10,C.text,{fw:col===3?700:400,font:s.k==='Value'?C.mono:C.sans}));
    if(i<6) els.push(line(x,y+19,x+160,y+19,C.rule,{sw:0.2,opacity:0.5}));
  });

  navBar(els,'home');
  return { name:'Item Detail', elements: els };
}

// ── SCREEN 3 — Browse / Filter ─────────────────────────────────────────────
function screenBrowse() {
  const els = [];
  statusBar(els);

  els.push(rect(0,44,W,50,C.bg));
  els.push(line(0,93,W,93,C.border,{sw:0.5}));
  els.push(text(20,75,'BROWSE ARCHIVE',14,C.acc,{fw:700,font:C.serif}));
  els.push(text(370,75,'⌥',17,C.text2,{anchor:'end'}));

  // Search bar
  els.push(rect(20,103,350,38,C.surf,{rx:6,stroke:C.border,sw:1}));
  els.push(text(44,127,'Search manuscripts, maps, codices…',12,C.muted,{opacity:0.7}));
  els.push(text(38,126,'⌕',14,C.text2));

  // Filter chips row
  const chips = ['All','Medieval','Islamic','Byzantine','Illuminated','Maps'];
  let cx=20;
  chips.forEach((c,i) => {
    const w = c.length*7+20;
    const isActive = i===0;
    els.push(rect(cx,150,w,26,isActive?C.acc:C.card,{rx:13,stroke:isActive?'none':C.border,sw:0.5}));
    els.push(text(cx+w/2,167,c,10,isActive?C.surf:C.text2,{anchor:'middle',fw:isActive?600:400}));
    cx+=w+8;
  });

  // Section header
  els.push(text(20,195,'BY ERA',9,C.muted,{fw:600,ls:2,font:C.mono}));
  els.push(line(20,203,370,203,C.rule,{sw:0.3}));

  // Era grid — 2×2 large cards
  const eras = [
    {name:'Early Medieval',range:'500–1000 CE',count:'312 items',color:'#EAE3D5'},
    {name:'High Medieval', range:'1000–1300 CE',count:'507 items',color:'#E5E0D4'},
    {name:'Late Medieval', range:'1300–1500 CE',count:'743 items',color:'#DEDAD0'},
    {name:'Renaissance',   range:'1500–1600 CE',count:'419 items',color:'#E8E2D6'},
  ];
  eras.forEach((e,i) => {
    const col=i%2, row=Math.floor(i/2);
    const ex=20+col*185, ey=213+row*100;
    els.push(rect(ex,ey,175,90,e.color,{rx:8,stroke:C.border,sw:0.5}));
    // texture lines
    for(let j=0;j<3;j++) els.push(rect(ex+14,ey+16+j*12,120-j*20,2,C.rule,{rx:1,opacity:0.5}));
    els.push(text(ex+14,ey+64,e.name,11,C.text,{fw:700,font:C.serif}));
    els.push(text(ex+14,ey+76,e.range,8,C.text2,{font:C.mono}));
    els.push(text(ex+161,ey+76,e.count,8,C.muted,{anchor:'end',font:C.mono}));
  });

  // By Script type — list
  els.push(text(20,420,'BY SCRIPT TYPE',9,C.muted,{fw:600,ls:2,font:C.mono}));
  els.push(line(20,428,370,428,C.rule,{sw:0.3}));

  const scripts = [
    {name:'Carolingian Minuscule',n:'284',bar:0.72},
    {name:'Gothic Textura',       n:'617',bar:0.95},
    {name:'Humanist Italic',      n:'311',bar:0.55},
    {name:'Insular Script',       n:'148',bar:0.33},
    {name:'Nashī (Arabic)',        n:'203',bar:0.44},
  ];
  scripts.forEach((s,i) => {
    const y=446+i*38;
    els.push(text(20,y+4,s.name,11,C.text,{fw:400}));
    els.push(text(360,y+4,s.n,9,C.muted,{anchor:'end',font:C.mono}));
    // bar background
    els.push(rect(20,y+10,270,4,C.card2,{rx:2}));
    // bar fill
    els.push(rect(20,y+10,270*s.bar,4,C.acc,{rx:2,opacity:0.7}));
    if(i<4) els.push(line(20,y+22,370,y+22,C.rule,{sw:0.2,opacity:0.4}));
  });

  navBar(els,'browse');
  return { name:'Browse Archive', elements: els };
}

// ── SCREEN 4 — Acquire / Add Item ─────────────────────────────────────────
function screenAcquire() {
  const els = [];
  statusBar(els);

  els.push(rect(0,44,W,50,C.bg));
  els.push(line(0,93,W,93,C.border,{sw:0.5}));
  els.push(text(20,76,'‹ Cancel',12,C.acc,{fw:400}));
  els.push(text(195,76,'NEW ACQUISITION',11,C.muted,{fw:600,ls:2,anchor:'middle',font:C.mono}));
  els.push(text(370,76,'Save',12,C.acc,{anchor:'end',fw:600}));

  // Upload zone
  els.push(rect(20,103,350,130,C.card,{rx:8,stroke:C.border,sw:1}));
  els.push(line(20,103,370,103,C.rule,{sw:0,dash:'4,4'})); // hidden dash guide
  // Dashed border overlay
  for(let i=0;i<8;i++){
    const seg=44;
    els.push(line(20+i*seg,103,20+i*seg+seg*0.6,103,C.rule,{sw:1,opacity:0.5,dash:'3,3'}));
    els.push(line(20+i*seg,233,20+i*seg+seg*0.6,233,C.rule,{sw:1,opacity:0.5,dash:'3,3'}));
  }
  for(let i=0;i<5;i++){
    const seg=32;
    els.push(line(20,103+i*seg,20,103+i*seg+seg*0.6,C.rule,{sw:1,opacity:0.5,dash:'3,3'}));
    els.push(line(370,103+i*seg,370,103+i*seg+seg*0.6,C.rule,{sw:1,opacity:0.5,dash:'3,3'}));
  }
  // icon + text
  els.push(circle(195,158,24,C.card2,{stroke:C.border,sw:1}));
  els.push(text(195,163,'↑',16,C.acc,{anchor:'middle',fw:600}));
  els.push(text(195,197,'Photograph or scan item',12,C.text2,{anchor:'middle'}));
  els.push(text(195,211,'Tap to upload — JPG, TIFF, PDF',10,C.muted,{anchor:'middle',font:C.mono}));

  // Form fields — archival labelling style
  const fields = [
    {label:'TITLE / INCIPIT',    val:'',     ph:'e.g. "Incipit liber…"'},
    {label:'DATE (CIRCA)',       val:'',     ph:'e.g. c. 1450 or 1482'},
    {label:'ORIGIN / SCRIPTORIA',val:'',    ph:'e.g. Mainz, Germany'},
    {label:'SCRIPT TYPE',        val:'',    ph:'Select script…'},
    {label:'MATERIAL SUPPORT',   val:'Vellum',ph:''},
    {label:'CONDITION GRADE',    val:'Fine (9.2)',ph:''},
    {label:'ESTIMATED VALUE',    val:'',    ph:'$ USD'},
    {label:'PROVENANCE CHAIN',   val:'',    ph:'List previous owners…'},
  ];
  fields.forEach((f,i) => {
    const y = 248+i*59;
    if(y>H-90) return;
    els.push(text(20,y,f.label,8,C.muted,{fw:600,ls:1.5,font:C.mono}));
    els.push(rect(20,y+8,350,32,C.surf,{rx:5,stroke:f.val?C.acc:C.border,sw:f.val?1.5:1}));
    if(f.val){
      els.push(text(32,y+28,f.val,12,C.text));
    } else {
      els.push(text(32,y+28,f.ph,12,C.muted,{opacity:0.5}));
    }
  });

  navBar(els,'add');
  return { name:'New Acquisition', elements: els };
}

// ── SCREEN 5 — Provenance Map / Origins ────────────────────────────────────
function screenOrigins() {
  const els = [];
  statusBar(els);

  els.push(rect(0,44,W,50,C.bg));
  els.push(line(0,93,W,93,C.border,{sw:0.5}));
  els.push(text(20,76,'PROVENANCE ORIGINS',14,C.acc,{fw:700,font:C.serif}));

  // Map — stylized parchment-toned geographic sketch
  els.push(rect(0,94,W,320,C.card,{}));
  // Grid lines (cartographic)
  for(let i=0;i<=6;i++){
    els.push(line(0,94+i*53,W,94+i*53,C.rule,{sw:0.3,opacity:0.4}));
    els.push(line(i*65,94,i*65,414,C.rule,{sw:0.3,opacity:0.4}));
  }
  // European coastline silhouette — simplified geometric shapes
  // Iberian peninsula
  els.push(rect(88,170,65,80,C.card2,{rx:12,opacity:0.7}));
  // France
  els.push(rect(148,140,90,100,C.card2,{rx:10,opacity:0.65}));
  // Italy boot shape
  els.push(rect(195,160,40,130,C.card2,{rx:8,opacity:0.6}));
  els.push(rect(215,265,28,50,C.card2,{rx:6,opacity:0.55}));
  // Germany/Rhineland
  els.push(rect(175,110,80,80,C.card2,{rx:8,opacity:0.7}));
  // British Isles
  els.push(rect(118,115,42,55,C.card2,{rx:10,opacity:0.55}));
  // Low countries
  els.push(rect(158,122,38,32,C.card2,{rx:6,opacity:0.6}));
  // Mediterranean sea texture
  els.push(rect(80,240,300,80,C.surf,{rx:0,opacity:0.25}));
  // North Africa
  els.push(rect(60,310,310,80,C.card2,{rx:0,opacity:0.5}));

  // Origin dots with counts — provenance locations
  const origins = [
    {x:210,y:155,city:'Mainz',    n:14,primary:true},  // Germany — Gutenberg
    {x:168,y:200,city:'Paris',    n:9},
    {x:148,y:165,city:'London',   n:7},
    {x:200,y:185,city:'Cologne',  n:6},
    {x:226,y:220,city:'Florence', n:8},
    {x:240,y:295,city:'Naples',   n:3},
    {x:105,y:200,city:'Toledo',   n:4},   // Islamic manuscripts
    {x:300,y:270,city:'Ctph.',    n:5},   // Constantinople
  ];
  origins.forEach(o => {
    const r = o.primary ? 12 : 7+o.n*0.4;
    // halo
    els.push(circle(o.x,o.y,r+4,C.acc,{opacity:o.primary?0.18:0.10}));
    els.push(circle(o.x,o.y,r,C.acc,{opacity:o.primary?0.85:0.6,stroke:C.surf,sw:1.5}));
    els.push(text(o.x,o.y+(o.primary?5:4),o.n.toString(),o.primary?9:8,C.surf,{anchor:'middle',fw:700,font:C.mono}));
    // city label
    els.push(text(o.x+r+4,o.y+3,o.city,8,C.text,{fw:o.primary?700:400,font:C.mono}));
  });

  // Compass rose — bottom right
  const CX=355,CY=385;
  els.push(circle(CX,CY,14,C.bg,{stroke:C.border,sw:0.8}));
  els.push(text(CX,CY-3,'N',7,C.acc,{anchor:'middle',fw:700,font:C.mono}));
  els.push(line(CX,CY+1,CX,CY+9,C.acc,{sw:0.5}));

  // Legend
  els.push(line(20,418,370,418,C.border,{sw:0.5}));
  els.push(text(20,433,'ORIGIN DISTRIBUTION',9,C.muted,{fw:600,ls:2,font:C.mono}));

  const regionData = [
    {region:'German-speaking',count:28,pct:0.58,color:C.acc},
    {region:'Italian',        count:12,pct:0.25,color:C.acc2},
    {region:'Islamic',        count:5, pct:0.10,color:'#7B9E6F'},
    {region:'British',        count:3, pct:0.06,color:'#9E8B6F'},
  ];
  regionData.forEach((r,i) => {
    const y=452+i*42;
    els.push(rect(20,y-10,r.pct*220,22,r.color,{rx:3,opacity:0.15}));
    els.push(rect(20,y-10,r.pct*220,22,r.color,{rx:3,stroke:r.color,sw:0.5,opacity:0.2}));
    els.push(circle(32,y+1,4,r.color,{}));
    els.push(text(44,y+5,r.region,11,C.text,{}));
    els.push(text(360,y+5,r.count+' items',10,C.text2,{anchor:'end',font:C.mono}));
  });

  navBar(els,'map');
  return { name:'Provenance Origins', elements: els };
}

// ── SCREEN 6 — Collector Profile ───────────────────────────────────────────
function screenProfile() {
  const els = [];
  statusBar(els);

  els.push(rect(0,44,W,56,C.bg));
  els.push(line(0,99,W,99,C.border,{sw:0.5}));
  els.push(text(20,80,'COLLECTOR PROFILE',14,C.acc,{fw:700,font:C.serif}));
  els.push(text(370,80,'⚙',16,C.text2,{anchor:'end'}));

  // Avatar + name
  els.push(circle(62,145,40,C.card2,{stroke:C.border,sw:1}));
  // Monogram
  els.push(text(62,151,'MR',17,C.acc,{anchor:'middle',fw:700,font:C.serif}));
  // Verification badge
  els.push(circle(90,118,9,C.acc,{stroke:C.bg,sw:2}));
  els.push(text(90,122,'✓',8,C.surf,{anchor:'middle',fw:700}));

  els.push(text(118,134,'Margaret Roebling',16,C.text,{fw:700,font:C.serif}));
  els.push(text(118,150,'Fellow, Society of Antiquaries',10,C.text2,{font:C.mono}));
  els.push(text(118,163,'London · Member since 2019',9,C.muted,{font:C.mono}));

  // Stat row
  els.push(line(20,180,370,180,C.border,{sw:0.5}));
  const stats = [
    {v:'48',   l:'Items'},
    {v:'£1.2M',l:'Portfolio'},
    {v:'23',   l:'Acquired'},
    {v:'8',    l:'Sold'},
  ];
  stats.forEach((s,i) => {
    const sx=45+i*85;
    els.push(text(sx,206,s.v,18,C.text,{anchor:'middle',fw:700,font:C.serif}));
    els.push(text(sx,220,s.l,9,C.muted,{anchor:'middle',font:C.mono}));
    if(i<3) els.push(line(sx+42,185,sx+42,228,C.rule,{sw:0.3}));
  });
  els.push(line(20,232,370,232,C.border,{sw:0.5}));

  // Recent activity
  els.push(text(20,252,'RECENT ACTIVITY',9,C.muted,{fw:600,ls:2,font:C.mono}));
  els.push(line(20,261,370,261,C.rule,{sw:0.3}));

  const activity = [
    {icon:'↑',label:'Acquired Gutenberg Fragment',    date:'2 Apr 2026',color:C.acc},
    {icon:'◎',label:'Added provenance to Herbal MS',  date:'28 Mar 2026',color:C.acc2},
    {icon:'✓',label:'Condition report: Papal Bull',   date:'21 Mar 2026',color:'#7B9E6F'},
    {icon:'⊕',label:'Shared Persian Poem with IRG',   date:'14 Mar 2026',color:C.acc},
    {icon:'↓',label:'Sold Flemish Tapestry design',   date:'5 Mar 2026', color:'#C1440E'},
  ];
  activity.forEach((a,i) => {
    const y=280+i*48;
    els.push(rect(20,y-2,350,40,i%2===0?C.card:C.bg,{rx:6,opacity:0.6}));
    els.push(circle(38,y+18,12,a.color,{opacity:0.15}));
    els.push(text(38,y+22,a.icon,12,a.color,{anchor:'middle',fw:700}));
    els.push(text(58,y+15,a.label,11,C.text,{fw:400}));
    els.push(text(58,y+28,a.date,9,C.muted,{font:C.mono}));
    els.push(text(360,y+22,'›',14,C.muted,{anchor:'end'}));
  });

  // Specialisations tags
  els.push(text(20,532,'SPECIALISATIONS',9,C.muted,{fw:600,ls:2,font:C.mono}));
  els.push(line(20,540,370,540,C.rule,{sw:0.3}));
  const tags=['Early Printing','Illuminated MSS','Maps & Atlases','Biblical','Germanic'];
  let tx=20, ty=558;
  tags.forEach(t => {
    const tw=t.length*6.8+18;
    if(tx+tw>370){tx=20;ty+=30;}
    els.push(rect(tx,ty,tw,22,C.card2,{rx:11,stroke:C.border,sw:0.5}));
    els.push(text(tx+tw/2,ty+15,t,9,C.text2,{anchor:'middle',fw:400}));
    tx+=tw+7;
  });

  navBar(els,'me');
  return { name:'Collector Profile', elements: els };
}

// ── Assemble ───────────────────────────────────────────────────────────────
const screens = [
  screenHome(),
  screenDetail(),
  screenBrowse(),
  screenAcquire(),
  screenOrigins(),
  screenProfile(),
];

const totalElements = screens.reduce((s,sc)=>s+sc.elements.length,0);

// Build SVG for each screen
function buildSVG(sc) {
  const parts = [];
  parts.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'">');
  parts.push('<rect width="'+W+'" height="'+H+'" fill="'+C.bg+'"/>');
  sc.elements.forEach(function(el) {
    if(el.type==='rect'){
      parts.push('<rect x="'+el.x+'" y="'+el.y+'" width="'+el.w+'" height="'+el.h+'" fill="'+el.fill+'" '+
        'rx="'+(el.rx||0)+'" opacity="'+(el.opacity!=null?el.opacity:1)+'" '+
        'stroke="'+(el.stroke||'none')+'" stroke-width="'+(el.strokeWidth||0)+'"/>');
    } else if(el.type==='text'){
      const safe = el.content.toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      parts.push('<text x="'+el.x+'" y="'+el.y+'" font-size="'+el.fontSize+'" fill="'+el.fill+'" '+
        'font-weight="'+(el.fontWeight||400)+'" font-family="'+(el.fontFamily||C.sans)+'" '+
        'text-anchor="'+(el.textAnchor||'start')+'" letter-spacing="'+(el.letterSpacing||0)+'" '+
        'opacity="'+(el.opacity!=null?el.opacity:1)+'">'+safe+'</text>');
    } else if(el.type==='circle'){
      parts.push('<circle cx="'+el.cx+'" cy="'+el.cy+'" r="'+el.r+'" fill="'+el.fill+'" '+
        'opacity="'+(el.opacity!=null?el.opacity:1)+'" stroke="'+(el.stroke||'none')+'" stroke-width="'+(el.strokeWidth||0)+'"/>');
    } else if(el.type==='line'){
      const dash = el.strokeDasharray ? ' stroke-dasharray="'+el.strokeDasharray+'"' : '';
      parts.push('<line x1="'+el.x1+'" y1="'+el.y1+'" x2="'+el.x2+'" y2="'+el.y2+'" '+
        'stroke="'+el.stroke+'" stroke-width="'+(el.strokeWidth||1)+'" opacity="'+(el.opacity!=null?el.opacity:1)+'"'+dash+'/>');
    }
  });
  parts.push('</svg>');
  return parts.join('');
}

const pen = {
  version: '2.8',
  metadata: {
    name:      'NIB — Manuscript Catalogue',
    author:    'RAM',
    date:      new Date().toISOString().slice(0,10),
    theme:     'light',
    heartbeat: 498,
    slug:      SLUG,
    appName:   NAME,
    tagline:   'Rare manuscript catalogue for serious collectors',
    archetype: 'collector-catalogue',
    palette:   C,
    elements:  totalElements,
    screens:   screens.length,
  },
  screens: screens.map(sc => ({
    name: sc.name,
    svg:  buildSVG(sc),
    elements: sc.elements,
  })),
};

fs.writeFileSync(path.join(__dirname,`${SLUG}.pen`), JSON.stringify(pen,null,2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
