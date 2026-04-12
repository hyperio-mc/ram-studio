#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────
// WAVE — Podcast discovery & player, retro-terminal dark aesthetic
// Inspired by: "Format Podcasts" on darkmodedesign.com — curated
//   dark podcast UI with careful typographic hierarchy; "Chus Retro
//   OS Portfolio" on minimal.gallery — retro terminal/window chrome
//   aesthetic; Awwwards "Fluid Glass" winner — soft glass morphism
//   surfaces applied to now-playing card.
// Theme: DARK — near-black #0A0A0F, violet #A78BFA, phosphor #34D399
// ─────────────────────────────────────────────────────────────────

'use strict';
const fs   = require('fs');
const path = require('path');

const W = 390, H = 844;

// ── Palette ──────────────────────────────────────────────────────
const BG       = '#0A0A0F';   // near-black void
const SURFACE  = '#141420';   // deep navy card
const SURFACE2 = '#1E1E2E';   // lifted surface
const SURFACE3 = '#262638';   // hover/highlight
const TEXT     = '#F0EEF5';   // off-white
const MUTED    = 'rgba(240,238,245,0.45)';
const ACCENT   = '#A78BFA';   // violet — signal frequency
const ACCENT2  = '#34D399';   // phosphor green — terminal
const WARN     = '#FB923C';   // amber warm
const BORDER   = 'rgba(167,139,250,0.15)';
const GLOW     = 'rgba(167,139,250,0.12)';
const GREEN_BG = 'rgba(52,211,153,0.1)';
const VIO_BG   = 'rgba(167,139,250,0.12)';

// ── Primitives ───────────────────────────────────────────────────
const rect = (x,y,w,h,fill,radius=0,stroke,strokeW=1) => {
  const o = { type:'rect', x, y, w, h, fill, radius };
  if (stroke) { o.stroke=stroke; o.strokeWidth=strokeW; }
  return o;
};
const text = (x,y,w,h,content,size,color,weight=400,align='left') =>
  ({ type:'text', x, y, w, h, content, fontSize:size, color, fontWeight:weight, textAlign:align });
const line = (x1,y1,x2,y2,color=BORDER,w=1) =>
  ({ type:'line', x1, y1, x2, y2, stroke:color, strokeWidth:w });
const circle = (cx,cy,r,fill,stroke,strokeW=1) => {
  const o = { type:'ellipse', cx, cy, rx:r, ry:r, fill };
  if (stroke) { o.stroke=stroke; o.strokeWidth=strokeW; }
  return o;
};

const bg = () => rect(0,0,W,H,BG);

// ── Status bar ───────────────────────────────────────────────────
function statusBar() {
  return [
    rect(0,0,W,44,BG),
    text(20,13,80,16,'9:41',13,TEXT,600,'left'),
    text(W-80,13,60,16,'▲▲▲ ◼',11,TEXT,400,'right'),
  ];
}

// ── Bottom nav ───────────────────────────────────────────────────
function bottomNav(active) {
  const items = [
    { label:'Discover', icon:'◈', id:'discover' },
    { label:'Search',   icon:'⌕', id:'search'   },
    { label:'Library',  icon:'▤', id:'library'  },
    { label:'Profile',  icon:'◎', id:'profile'  },
  ];
  const els = [
    rect(0,H-80,W,80,SURFACE),
    line(0,H-80,W,H-80,BORDER,1),
  ];
  items.forEach((it,i) => {
    const x = 8 + i*94;
    const isActive = it.id === active;
    if (isActive) els.push(rect(x+8,H-72,76,56,VIO_BG,12));
    els.push(text(x+8,H-68,76,24,it.icon,22,isActive?ACCENT:MUTED,400,'center'));
    els.push(text(x+8,H-44,76,14,it.label,10,isActive?ACCENT:MUTED,isActive?600:400,'center'));
  });
  return els;
}

// ── Mini player bar (persistent) ─────────────────────────────────
function miniPlayer() {
  return [
    rect(12,H-148,W-24,56,SURFACE2,14,BORDER,1),
    // art
    rect(20,H-142,42,42,ACCENT,8),
    text(20,H-135,42,28,'◈',18,BG,400,'center'),
    // info
    text(72,H-140,180,16,'Design Therapy · Ep.48',12,TEXT,600,'left'),
    text(72,H-124,180,14,'The Figma Variable Problem',10,MUTED,400,'left'),
    // progress bar
    rect(72,H-114,200,3,SURFACE3,2),
    rect(72,H-114,130,3,ACCENT,2),
    // controls
    text(282,H-140,32,16,'⏮',14,MUTED,400,'center'),
    text(314,H-140,32,20,'⏸',16,ACCENT,400,'center'),
    text(346,H-140,28,16,'⏭',14,MUTED,400,'center'),
  ];
}

// ── Screen 1 · Discover ──────────────────────────────────────────
function screen1() {
  const els = [bg(), ...statusBar()];

  // Header
  els.push(text(20,52,200,28,'WAVE',22,ACCENT,700,'left'));
  els.push(text(74,57,80,18,'FM',12,ACCENT2,700,'left'));
  els.push(text(20,80,W-80,20,'Your signal in the noise.',14,MUTED,400,'left'));

  // Trending pill row
  const tags = ['🎧 All','🧠 Design','💻 Tech','🌱 Health','💸 Finance'];
  tags.forEach((t,i) => {
    const tw = t.length*7+20;
    const x = 20 + [0,52,114,160,214][i];
    const active = i===1;
    els.push(rect(x,110,tw,28,active?VIO_BG:SURFACE2,14,active?BORDER:SURFACE3,1));
    els.push(text(x,115,tw,18,t,11,active?ACCENT:MUTED,active?600:400,'center'));
  });

  // Featured hero card
  els.push(rect(20,152,W-40,160,SURFACE,16,BORDER,1));
  // art bg gradient simulation
  els.push(rect(20,152,W-40,100,SURFACE2,16));
  els.push(rect(20,152,W-40,40,'rgba(167,139,250,0.06)',0));
  // Album art
  els.push(rect(28,162,72,72,ACCENT,10));
  els.push(text(28,174,72,48,'◉',30,BG,400,'center'));
  // Meta
  els.push(text(112,162,220,16,'FEATURED',10,ACCENT2,700,'left'));
  els.push(text(112,180,220,20,'Design Therapy',16,TEXT,700,'left'));
  els.push(text(112,200,220,16,'with Sarah Chen',12,MUTED,400,'left'));
  els.push(text(112,218,180,14,'The Figma Variable Problem',11,TEXT,500,'left'));
  // Stats row
  els.push(line(20,248,W-20,248,BORDER,1));
  els.push(text(28,256,100,16,'Ep.48 · 52 min',11,MUTED,400,'left'));
  els.push(rect(W-96,252,76,24,VIO_BG,12));
  els.push(text(W-94,255,72,18,'▶ Play now',11,ACCENT,600,'center'));

  // Hot episodes heading
  els.push(text(20,328,200,18,'Trending Now',14,TEXT,700,'left'));
  els.push(text(238,328,110,18,'View all →',12,ACCENT,500,'right'));

  // Trending rows
  const trending = [
    { num:'01', show:'Rework', ep:'Hiring is Guessing', dur:'34 min', acc:ACCENT2 },
    { num:'02', show:'WIRED', ep:'The AI Act Explained', dur:'41 min', acc:ACCENT  },
    { num:'03', show:'99% Invisible', ep:'Font Wars', dur:'28 min', acc:WARN      },
  ];
  trending.forEach((t,i) => {
    const y = 358 + i*60;
    els.push(rect(20,y,W-40,52,SURFACE,12,BORDER,1));
    // rank
    els.push(text(28,y+17,28,18,t.num,13,ACCENT,700,'left'));
    // art dot
    els.push(circle(72,y+26,16,t.acc+'22'));
    els.push(circle(72,y+26,16,'none',t.acc,1.5));
    // info
    els.push(text(98,y+12,180,16,t.show,12,MUTED,400,'left'));
    els.push(text(98,y+28,200,16,t.ep,13,TEXT,600,'left'));
    // dur + play
    els.push(text(W-88,y+16,68,14,t.dur,11,MUTED,400,'right'));
    els.push(text(W-44,y+14,28,24,'▶',14,ACCENT,400,'center'));
    if (i<2) els.push(line(20,y+52,W-20,y+52,BORDER,0.5));
  });

  els.push(...miniPlayer());
  els.push(...bottomNav('discover'));
  return els;
}

// ── Screen 2 · Now Playing (immersive) ──────────────────────────
function screen2() {
  const els = [bg(), ...statusBar()];

  // Back + more
  els.push(text(20,52,30,24,'←',16,MUTED,400,'center'));
  els.push(text(20,50,W-40,24,'NOW PLAYING',11,MUTED,500,'center'));
  els.push(text(W-44,52,24,24,'⋯',18,MUTED,400,'center'));

  // Large album art — retro "terminal window" chrome style
  const AX=40, AY=86, AW=W-80, AH=AW;
  // Window chrome border (retro OS style)
  els.push(rect(AX,AY,AW,AH,SURFACE,16,BORDER,1.5));
  // Inner art
  els.push(rect(AX+2,AY+2,AW-4,AH-4,'rgba(167,139,250,0.08)',14));
  // Window title bar — retro terminal chrome
  els.push(rect(AX+2,AY+2,AW-4,28,SURFACE2,0));
  els.push(rect(AX+2,AY+2,AW-4,28,'rgba(0,0,0,0)',14)); // round corners top only
  els.push(circle(AX+16,AY+16,5,'#FF5F57'));
  els.push(circle(AX+30,AY+16,5,'#FEBC2E'));
  els.push(circle(AX+44,AY+16,5,ACCENT2));
  els.push(text(AX,AY+10,AW,14,'WAVE.FM  —  EP_048_DESIGN_THERAPY',10,MUTED,400,'center'));
  // Art content: stylized waveform bars
  const bars = [18,28,38,52,44,60,70,80,72,88,76,84,60,68,52,44,38,30,44,56,64,72,60,48];
  bars.forEach((h,i) => {
    const bx = AX+16 + i*(( AW-32)/bars.length);
    const by = AY+AH/2 - h/2 + 18;
    const played = i < 14;
    els.push(rect(bx,by,6,h,played?ACCENT:SURFACE3,3));
  });
  // Playhead dot
  const phX = AX+16 + 13*((AW-32)/bars.length)+3;
  els.push(circle(phX,AY+AH/2+18,5,ACCENT));

  // Show + episode info
  els.push(text(20,AY+AH+16,W-40,20,'Design Therapy',12,MUTED,400,'center'));
  els.push(text(20,AY+AH+34,W-40,24,'The Figma Variable Problem',16,TEXT,700,'center'));
  els.push(text(20,AY+AH+56,W-40,16,'Episode 48  ·  52 min',11,MUTED,400,'center'));

  // Progress bar
  const PY = AY+AH+82;
  els.push(rect(20,PY,W-40,4,SURFACE2,2));
  els.push(rect(20,PY,(W-40)*0.52,4,ACCENT,2));
  els.push(circle(20+(W-40)*0.52,PY+2,7,ACCENT));
  els.push(text(20,PY+10,60,14,'27:04',10,MUTED,400,'left'));
  els.push(text(W-80,PY+10,60,14,'52:00',10,MUTED,400,'right'));

  // Controls
  const CY = PY+40;
  els.push(text(28,CY,32,32,'⟨⟨',16,MUTED,400,'center'));
  els.push(text(90,CY,32,32,'−15s',10,MUTED,400,'center'));
  // Play button — glassy center
  els.push(circle(W/2,CY+16,28,VIO_BG,'',0));
  els.push(circle(W/2,CY+16,28,'none',ACCENT,1.5));
  els.push(text(W/2-14,CY+4,28,24,'⏸',20,ACCENT,400,'center'));
  els.push(text(W-122,CY,32,32,'+30s',10,MUTED,400,'center'));
  els.push(text(W-56,CY,32,32,'⟩⟩',16,MUTED,400,'center'));

  // Action row
  const AcY = CY+56;
  els.push(text(28,AcY,30,24,'♡',16,MUTED,400,'center'));
  els.push(text(W/2-15,AcY,30,24,'↓',16,MUTED,400,'center'));
  els.push(text(W-58,AcY,30,24,'⋯',16,MUTED,400,'center'));
  // Speed badge
  els.push(rect(W/2-22,AcY,44,24,SURFACE2,12,BORDER,1));
  els.push(text(W/2-22,AcY+5,44,14,'1.25×',11,ACCENT2,600,'center'));

  return els;
}

// ── Screen 3 · Episode List ──────────────────────────────────────
function screen3() {
  const els = [bg(), ...statusBar()];

  // Back + title
  els.push(text(20,52,30,24,'←',16,MUTED,400,'left'));
  els.push(text(20,50,W-40,24,'Design Therapy',13,TEXT,600,'center'));
  els.push(text(W-44,52,24,24,'⋯',18,MUTED,400,'center'));

  // Podcast header card
  els.push(rect(20,82,W-40,110,SURFACE,14,BORDER,1));
  // Art
  els.push(rect(28,92,72,72,ACCENT,10));
  els.push(text(28,104,72,48,'◉',30,BG,400,'center'));
  // Info
  els.push(text(112,92,220,20,'Design Therapy',15,TEXT,700,'left'));
  els.push(text(112,112,220,16,'Sarah Chen · 48 episodes',12,MUTED,400,'left'));
  // Subscribe btn
  els.push(rect(112,132,96,28,ACCENT,14));
  els.push(text(112,138,96,16,'◉ Subscribe',11,BG,700,'center'));
  // Stats
  els.push(text(218,132,160,14,'12K followers',11,MUTED,400,'right'));
  els.push(text(218,146,160,12,'Weekly · design',10,MUTED,400,'right'));

  // Filter tabs
  const tabs = ['All','Newest','Downloaded','Played'];
  tabs.forEach((t,i) => {
    const x = 20 + i*88;
    const active = i===0;
    els.push(rect(x,206,80,28,active?VIO_BG:SURFACE2,14,active?BORDER:SURFACE2,1));
    els.push(text(x,212,80,16,t,11,active?ACCENT:MUTED,active?600:400,'center'));
  });

  // Episode rows
  const eps = [
    { num:'Ep 48', title:'The Figma Variable Problem', dur:'52 min', new:true,  dl:true  },
    { num:'Ep 47', title:'Designing for Gen Z Attention', dur:'44 min', new:true,  dl:false },
    { num:'Ep 46', title:'The Death of the Portfolio',   dur:'38 min', new:false, dl:true  },
    { num:'Ep 45', title:'AI Won\'t Replace You, Yet',   dur:'61 min', new:false, dl:false },
    { num:'Ep 44', title:'Dark Mode Economics',          dur:'29 min', new:false, dl:false },
  ];

  eps.forEach((ep,i) => {
    const y = 248 + i*82;
    els.push(rect(20,y,W-40,74,SURFACE,12,BORDER,1));
    // Episode number badge
    els.push(rect(28,y+10,42,20,VIO_BG,10));
    els.push(text(28,y+13,42,14,ep.num,9,ACCENT,600,'center'));
    if (ep.new) {
      els.push(rect(76,y+10,30,20,GREEN_BG,10));
      els.push(text(76,y+13,30,14,'NEW',9,ACCENT2,700,'center'));
    }
    // Title
    els.push(text(28,y+34,W-100,18,ep.title,13,TEXT,600,'left'));
    // Duration + controls
    els.push(text(28,y+54,100,14,ep.dur,11,MUTED,400,'left'));
    if (ep.dl) els.push(text(120,y+53,16,16,'↓',12,ACCENT2,400,'center'));
    // Play
    els.push(circle(W-36,y+37,16,VIO_BG,'',0));
    els.push(text(W-52,y+27,30,20,'▶',12,ACCENT,400,'center'));
    if (i<4) els.push(line(20,y+74,W-20,y+74,BORDER,0.5));
  });

  els.push(...miniPlayer());
  els.push(...bottomNav('discover'));
  return els;
}

// ── Screen 4 · Queue / Up Next ───────────────────────────────────
function screen4() {
  const els = [bg(), ...statusBar()];

  els.push(text(20,52,W-40,24,'Up Next',18,TEXT,700,'center'));
  els.push(text(20,76,W-40,16,'7 episodes queued  ·  4h 23m',12,MUTED,400,'center'));

  // Now playing mini banner
  els.push(rect(20,106,W-40,60,SURFACE2,14,BORDER,1));
  els.push(rect(20,106,4,60,ACCENT,14));
  els.push(text(34,112,200,14,'NOW PLAYING',9,ACCENT,700,'left'));
  els.push(text(34,126,280,18,'The Figma Variable Problem',13,TEXT,600,'left'));
  els.push(text(34,144,200,14,'Design Therapy  ·  27:04 / 52:00',11,MUTED,400,'left'));
  els.push(text(W-56,116,32,32,'⏸',18,ACCENT,400,'center'));

  // Queue list
  const queue = [
    { num:'2', title:'Designing for Gen Z Attention',   show:'Design Therapy',     dur:'44m' },
    { num:'3', title:'The AI Act Explained',             show:'WIRED',              dur:'41m' },
    { num:'4', title:'Font Wars',                        show:'99% Invisible',      dur:'28m' },
    { num:'5', title:'Hiring is Guessing',               show:'Rework',             dur:'34m' },
    { num:'6', title:'Dark Mode Economics',              show:'Design Therapy',     dur:'29m' },
    { num:'7', title:'The Python Effect',                show:'Changelog',          dur:'67m' },
  ];

  els.push(text(20,180,200,16,'In Queue',13,TEXT,700,'left'));
  els.push(text(W-100,180,80,16,'Clear all',12,WARN,400,'right'));

  queue.forEach((q,i) => {
    const y = 204 + i*82;
    if (y > H-180) return;
    els.push(rect(20,y,W-40,74,SURFACE,12,BORDER,1));
    // drag handle dots
    els.push(text(24,y+26,18,22,'⋮⋮',10,SURFACE3,400,'center'));
    // number
    els.push(circle(52,y+37,14,VIO_BG));
    els.push(text(38,y+29,28,16,q.num,11,ACCENT,700,'center'));
    // info
    els.push(text(76,y+16,220,16,q.show,10,MUTED,400,'left'));
    els.push(text(76,y+32,240,18,q.title,12,TEXT,600,'left'));
    els.push(text(76,y+50,80,14,q.dur,10,MUTED,400,'left'));
    // remove
    els.push(text(W-44,y+26,22,22,'×',16,MUTED,400,'center'));
    if (i<5) els.push(line(20,y+74,W-20,y+74,BORDER,0.5));
  });

  els.push(...miniPlayer());
  els.push(...bottomNav('discover'));
  return els;
}

// ── Screen 5 · Library ───────────────────────────────────────────
function screen5() {
  const els = [bg(), ...statusBar()];

  // Header
  els.push(text(20,52,200,28,'Library',20,TEXT,700,'left'));
  els.push(rect(W-52,52,32,32,SURFACE2,16));
  els.push(text(W-52,58,32,20,'+',16,ACCENT,400,'center'));

  // Tabs
  const tabs = ['Podcasts','Downloads','History'];
  tabs.forEach((t,i) => {
    const x = 20 + i*112;
    const active = i===0;
    els.push(rect(x,94,104,32,active?VIO_BG:SURFACE,16,active?ACCENT:BORDER,active?1.5:1));
    els.push(text(x,100,104,20,t,11,active?ACCENT:MUTED,active?700:400,'center'));
  });

  // Subscribed podcasts — 2-col grid
  const shows = [
    { name:'Design Therapy',  host:'Sarah Chen',    eps:'48', col:ACCENT  },
    { name:'99% Invisible',   host:'Roman Mars',    eps:'602', col:WARN   },
    { name:'WIRED',           host:'WIRED Editors', eps:'88', col:ACCENT2 },
    { name:'Rework',          host:'Basecamp',      eps:'116', col:'#60A5FA' },
    { name:'Changelog',       host:'Adam Stacoviak',eps:'591', col:'#F472B6' },
    { name:'Lex Fridman',     host:'Lex Fridman',   eps:'430', col:'#FBBF24' },
  ];

  shows.forEach((s,i) => {
    const col = i%2===0 ? 20 : W/2+4;
    const row = Math.floor(i/2);
    const y = 144 + row*130;
    els.push(rect(col,y,W/2-14,120,SURFACE,14,BORDER,1));
    // art
    els.push(rect(col+12,y+12,56,56,s.col+'22',12,s.col+'66',1));
    els.push(circle(col+40,y+40,16,s.col+'44'));
    els.push(text(col+24,y+24,32,32,'◉',20,s.col,400,'center'));
    // info
    els.push(text(col+12,y+74,W/2-38,18,s.name,12,TEXT,700,'left'));
    els.push(text(col+12,y+90,W/2-38,14,s.host,10,MUTED,400,'left'));
    // eps badge
    els.push(rect(col+12,y+104,50,16,s.col+'22',8));
    els.push(text(col+12,y+106,50,12,s.eps+' eps',9,s.col,600,'center'));
  });

  // Listening stats bar
  els.push(rect(20,H-170,W-40,60,SURFACE2,14,BORDER,1));
  els.push(text(32,H-162,200,16,'This week',12,MUTED,400,'left'));
  els.push(text(32,H-144,160,20,'6h 18m listened',15,TEXT,700,'left'));
  // Mini bar chart
  const wkBars = [30,54,22,68,80,40,36];
  wkBars.forEach((h,i) => {
    const bx = W-100+i*12;
    els.push(rect(bx,H-146,8,h/2,i===4?ACCENT:SURFACE3,2));
  });

  els.push(...miniPlayer());
  els.push(...bottomNav('library'));
  return els;
}

// ── Build .pen ───────────────────────────────────────────────────
const pen = {
  version: '2.8',
  meta: {
    name: 'WAVE',
    description: 'Podcast discovery & player — retro-terminal dark aesthetic',
    created: new Date().toISOString(),
  },
  screens: [
    { id:'discover',     name:'Discover',    elements: screen1() },
    { id:'now-playing',  name:'Now Playing', elements: screen2() },
    { id:'episodes',     name:'Episodes',    elements: screen3() },
    { id:'queue',        name:'Queue',       elements: screen4() },
    { id:'library',      name:'Library',     elements: screen5() },
  ],
};

const outPath = path.join(__dirname, 'wave.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ wave.pen written — ${pen.screens.length} screens, ${pen.screens.reduce((a,s)=>a+s.elements.length,0)} elements total`);
console.log(`  File size: ${(fs.statSync(outPath).size/1024).toFixed(1)} KB`);
