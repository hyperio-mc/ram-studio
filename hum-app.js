'use strict';
const fs = require('fs'), path = require('path');

const SLUG = 'hum';
const W = 390, H = 844;

// ─── PALETTE — Zune-inspired: warm dark canvas + lime green single accent ────
// Inspired by: r/UI_Design Zune revival thread, awwwards Bricolage Grotesque tag
// "The Zune vibe comes through immediately — dark canvas with accent color hits"
const BASE   = '#111209';  // warm near-black — Zune hardware charcoal, not cold
const SURF   = '#191C11';  // surface 1 — slightly lighter warm
const CARD   = '#20241A';  // card level
const RAIL   = '#282D20';  // active / selected rail
const LIME   = '#A3E635';  // Zune lime — the single hero accent
const LIME_D = '#232E12';  // lime 12% — chip tint
const LIME_B = '#C5F26A';  // lime bright — hover / highlight state
const MAGENTA= '#E535B7';  // secondary accent for energy moments (Zune also had magenta)
const MAG_D  = '#2A1023';  // magenta tint
const TEXT   = '#F0EDE0';  // warm white — cream tint, not harsh pure white
const TEXT2  = '#9A9A82';  // muted warm gray
const TEXT3  = '#4E4E3A';  // very muted

// "Album atmosphere" — each screen has a different album's color bleeding into bg
// Simulated: subtle gradient rects to simulate album art color bloom
const ALBUM_COLORS = [
  ['#7B2D8B', '#D94F3D'],  // purple + red — indie rock
  ['#1A3A7C', '#4AADE8'],  // navy + sky — electronic
  ['#7C4A1A', '#E8A93A'],  // brown + amber — folk/acoustic
  ['#1C6A3C', '#5DD68A'],  // forest + mint — jazz
  ['#6A1C52', '#D65A9A'],  // plum + pink — R&B
  ['#1A5C7C', '#3ABBE8'],  // ocean + cyan — ambient
];

// ─── PRIMITIVES ──────────────────────────────────────────────────────────────
function rect(x,y,w,h,fill,opts={}) {
  return { type:'rect', x,y,w,h,fill,
    rx: opts.rx||0, opacity: opts.opacity||1,
    stroke: opts.stroke||'none', sw: opts.sw||0 };
}
function text(x,y,content,size,fill,opts={}) {
  return { type:'text', x,y,content,size,fill,
    fw: opts.fw||400, font: opts.font||'Inter,sans-serif',
    anchor: opts.anchor||'start', ls: opts.ls||0, opacity: opts.opacity||1 };
}
function circle(cx,cy,r,fill,opts={}) {
  return { type:'circle', cx,cy,r,fill,
    opacity: opts.opacity||1, stroke: opts.stroke||'none', sw: opts.sw||0 };
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  return { type:'line', x1,y1,x2,y2,stroke,
    sw: opts.sw||1, opacity: opts.opacity||1 };
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

function statusBar() {
  return [
    rect(0,0,W,44,BASE),
    text(18,28,'9:41',14,TEXT,{fw:500}),
    text(W-18,28,'●●●',13,TEXT2,{anchor:'end'}),
  ];
}

// Bottom nav — icon-minimal, label-first (Zune's text-dominant approach)
function bottomNav(active) {
  const items = [
    { id:'now',     label:'NOW',      icon:'▶' },
    { id:'library', label:'LIBRARY',  icon:'⊞' },
    { id:'radio',   label:'RADIO',    icon:'◎' },
    { id:'artist',  label:'ARTIST',   icon:'◉' },
    { id:'party',   label:'PARTY',    icon:'◈' },
  ];
  const NAV_Y = H - 68;
  const els = [
    rect(0, NAV_Y, W, 68, SURF),
    line(0, NAV_Y, W, NAV_Y, RAIL, { sw:1 }),
  ];
  const itemW = W / items.length;
  items.forEach((item, i) => {
    const cx = i * itemW + itemW / 2;
    const isActive = item.id === active;
    if (isActive) {
      // Lime underline bar at top of nav
      els.push(rect(i * itemW + 10, NAV_Y, itemW - 20, 2, LIME, { rx:1 }));
    }
    els.push(text(cx, NAV_Y + 28, item.icon, 16, isActive ? LIME : TEXT3, { anchor:'middle' }));
    els.push(text(cx, NAV_Y + 50, item.label, 9, isActive ? LIME : TEXT2, { anchor:'middle', fw:700, ls:0.8 }));
  });
  return els;
}

// Album atmosphere — simulate album color bleeding into card background
function albumAtmo(x, y, w, h, color1, color2) {
  return [
    rect(x, y, w, h, color1, { rx:0, opacity:0.18 }),
    rect(x, y, w/2, h, color2, { rx:0, opacity:0.10 }),
  ];
}

// Big Zune-style track header (the most distinctive Zune element)
function trackHeader(y, artist, track, color) {
  return [
    text(20, y, track.toUpperCase(), 32, TEXT, { fw:800, ls:-0.5, font:'Inter,sans-serif' }),
    text(20, y+40, artist, 14, color, { fw:700, ls:1.5 }),
  ];
}

// Mini album square
function albumSquare(x, y, size, colors, title, artist) {
  const els = [
    rect(x, y, size, size, colors[0], { rx:8 }),
    rect(x, y, size/2, size, colors[1], { rx:4, opacity:0.5 }),
    rect(x, y, size, size, 'none', { rx:8, stroke: RAIL, sw:1 }),
  ];
  if (title) {
    els.push(text(x, y+size+14, title, 12, TEXT, { fw:600 }));
    els.push(text(x, y+size+28, artist, 11, TEXT2));
  }
  return els;
}

// ─── SCREEN 1: NOW PLAYING ────────────────────────────────────────────────────
function screenNow() {
  const els = [];
  const albumC = ALBUM_COLORS[0];

  // Background base
  els.push(rect(0,0,W,H,BASE));

  // Album atmosphere bloom — upper half
  els.push(rect(0,0,W,H/2,albumC[0],{opacity:0.14}));
  els.push(rect(W/2,0,W/2,H/2,albumC[1],{opacity:0.08}));
  // Vignette fade — dark overlay at bottom
  els.push(rect(0,H/2-60,W,H/2+60,BASE,{opacity:0.85}));

  els.push(...statusBar());

  // Back + menu row
  els.push(text(20,56,'‹',24,TEXT2,{fw:300}));
  els.push(text(W/2,56,'NOW PLAYING',11,TEXT2,{anchor:'middle',fw:700,ls:1.5}));
  els.push(text(W-20,56,'⋮',20,TEXT2,{anchor:'end'}));

  // Large album art card
  const artSize = 280;
  const artX = (W-artSize)/2;
  const artY = 76;
  els.push(rect(artX,artY,artSize,artSize,albumC[0],{rx:12}));
  els.push(rect(artX,artY,artSize/2,artSize,albumC[1],{rx:8,opacity:0.5}));
  els.push(rect(artX,artY,artSize,artSize,'none',{rx:12,stroke:RAIL,sw:1}));
  // Vinyl texture hint — small circle detail
  els.push(circle(artX+artSize/2,artY+artSize/2,18,BASE,{opacity:0.4}));
  els.push(circle(artX+artSize/2,artY+artSize/2,5,TEXT3,{opacity:0.6}));

  // Track info — Zune bold type
  const infoY = artY + artSize + 24;
  els.push(text(20,infoY,'MELT INTO YOU',28,TEXT,{fw:800,ls:-0.5}));
  els.push(text(20,infoY+36,'Aroha Ngata  ·  Frequencies',14,albumC[1],{fw:600,ls:0.5}));

  // Heart + add
  els.push(circle(W-52,infoY+10,18,SURF));
  els.push(text(W-52,infoY+16,'♡',14,TEXT2,{anchor:'middle'}));
  els.push(circle(W-18,infoY+10,18,SURF));
  els.push(text(W-18,infoY+16,'+',16,TEXT2,{anchor:'middle'}));

  // Waveform scrubber — Zune's distinctive wide scrubber
  const scrubY = infoY + 60;
  // Waveform bars
  const wBars = 56;
  const bW = (W-40)/wBars - 1;
  for (let i=0; i<wBars; i++) {
    const bH = 4 + Math.sin(i*0.4+1)*10 + Math.sin(i*0.7)*8;
    const played = i < wBars*0.38; // 38% played
    els.push(rect(20+i*(bW+1), scrubY-bH/2+8, bW, Math.max(2,bH), played?LIME:RAIL, {rx:1}));
  }
  // Progress circle dot
  const dotX = 20 + Math.round(wBars*0.38)*(bW+1);
  els.push(circle(dotX, scrubY+8, 6, LIME));
  // Time labels
  els.push(text(20,scrubY+24,'1:42',12,TEXT2));
  els.push(text(W-20,scrubY+24,'4:28',12,TEXT2,{anchor:'end'}));

  // Controls row
  const ctrlY = scrubY + 44;
  // Shuffle
  els.push(text(20,ctrlY+12,'⇄',18,TEXT3,{anchor:'start'}));
  // Prev
  els.push(text(90,ctrlY+12,'⏮',22,TEXT2,{anchor:'middle'}));
  // Play/Pause (Lime accent)
  els.push(circle(W/2,ctrlY+8,34,LIME_D));
  els.push(rect(W/2-2,ctrlY-8,4,32,LIME,{rx:2})); // pause icon bar 1
  els.push(rect(W/2+8,ctrlY-8,4,32,LIME,{rx:2})); // pause icon bar 2
  // Next
  els.push(text(W-90,ctrlY+12,'⏭',22,TEXT2,{anchor:'middle'}));
  // Repeat
  els.push(text(W-20,ctrlY+12,'↺',18,TEXT3,{anchor:'end'}));

  // Volume strip
  const volY = ctrlY+46;
  els.push(text(20,volY+4,'🔈',13,TEXT3));
  els.push(rect(44,volY,W-88,4,RAIL,{rx:2}));
  els.push(rect(44,volY,Math.round((W-88)*0.7),4,LIME,{rx:2}));
  els.push(text(W-18,volY+4,'🔊',13,TEXT3,{anchor:'end'}));

  // Queue preview strip
  const qY = volY + 26;
  els.push(line(0,qY,W,qY,RAIL));
  els.push(text(20,qY+18,'UP NEXT',10,TEXT3,{fw:700,ls:1}));
  els.push(text(20,qY+36,'Slow Burn  ·  Aroha Ngata',13,TEXT,{fw:500}));
  els.push(text(W-20,qY+36,'3:52',12,TEXT2,{anchor:'end'}));

  els.push(...bottomNav('now'));
  return { name:'Now Playing', elements: els };
}

// ─── SCREEN 2: LIBRARY ────────────────────────────────────────────────────────
function screenLibrary() {
  const els = [];
  els.push(rect(0,0,W,H,BASE));
  els.push(...statusBar());

  // Header — Zune big type
  els.push(text(20,72,'your music.',36,TEXT,{fw:800,ls:-1}));
  els.push(text(20,104,'342 albums · 4,891 tracks',14,TEXT2));

  // Filter tabs
  const tabs = ['ALBUMS','ARTISTS','TRACKS','PLAYLISTS'];
  let tx=20;
  tabs.forEach((t,i)=>{
    const tw=t.length*8+20;
    els.push(rect(tx,118,tw,26,i===0?LIME_D:SURF,{rx:13}));
    els.push(text(tx+tw/2,136,t,11,i===0?LIME:TEXT2,{anchor:'middle',fw:700,ls:0.5}));
    tx+=tw+8;
  });

  // Album grid — 3 columns
  const albums = [
    { c:ALBUM_COLORS[0], title:'Frequencies', artist:'Aroha Ngata' },
    { c:ALBUM_COLORS[1], title:'Midnight Code', artist:'Orbital Drift' },
    { c:ALBUM_COLORS[2], title:'Golden Hours', artist:'Sable Creek' },
    { c:ALBUM_COLORS[3], title:'Root System', artist:'Fern & Moss' },
    { c:ALBUM_COLORS[4], title:'Velvet Static', artist:'Coeur de Bois' },
    { c:ALBUM_COLORS[5], title:'Open Water', artist:'Blue Mesa' },
  ];
  const albumSize = (W-40-16)/3;
  albums.forEach((a,i)=>{
    const col = i%3, row = Math.floor(i/3);
    const ax = 20+col*(albumSize+8);
    const ay = 156+row*(albumSize+52);
    els.push(...albumSquare(ax,ay,albumSize,a.c,a.title,a.artist));
  });

  // Recently added section
  const raY = 156 + 2*(albumSize+52) + 8;
  els.push(line(20,raY,W-20,raY,RAIL));
  els.push(text(20,raY+16,'RECENTLY ADDED',10,TEXT3,{fw:700,ls:1}));
  const recent = [
    { c:ALBUM_COLORS[1], title:'Dark Interface EP', artist:'Synthwave Bros', dur:'4:12' },
    { c:ALBUM_COLORS[4], title:'Nostalgic Horizons', artist:'Retrowave', dur:'3:48' },
    { c:ALBUM_COLORS[0], title:'Signal & Noise', artist:'Aroha Ngata', dur:'5:01' },
  ];
  recent.forEach((r,i)=>{
    const ry = raY+28+i*56;
    // Mini album square
    els.push(rect(20,ry,44,44,r.c[0],{rx:6}));
    els.push(rect(20,ry,22,44,r.c[1],{rx:4,opacity:0.5}));
    els.push(text(72,ry+16,r.title,13,TEXT,{fw:600}));
    els.push(text(72,ry+32,r.artist,12,TEXT2));
    els.push(text(W-20,ry+16,r.dur,12,TEXT2,{anchor:'end'}));
    els.push(text(W-20,ry+32,'♡',12,TEXT3,{anchor:'end'}));
    if(i<recent.length-1) els.push(line(72,ry+52,W-20,ry+52,RAIL,{sw:1,opacity:0.5}));
  });

  els.push(...bottomNav('library'));
  return { name:'Library', elements: els };
}

// ─── SCREEN 3: RADIO / DISCOVER ──────────────────────────────────────────────
function screenRadio() {
  const els = [];
  els.push(rect(0,0,W,H,BASE));
  els.push(...statusBar());

  // Header
  els.push(text(20,72,'discover.',36,TEXT,{fw:800,ls:-1}));
  els.push(text(20,104,'Tuned to your frequency',14,TEXT2));

  // Search bar
  els.push(rect(20,116,W-40,40,SURF,{rx:12}));
  els.push(text(38,141,'⌕  search artists, genres, moods…',14,TEXT3));

  // Featured radio station — wide card
  const featC = ALBUM_COLORS[1];
  els.push(rect(20,166,W-40,120,featC[0],{rx:16,opacity:0.90}));
  els.push(rect(20,166,W-40,120,'none',{rx:16,stroke:RAIL,sw:1}));
  els.push(rect(W/2,166,W/2-20,120,featC[1],{rx:8,opacity:0.25}));
  // Live badge
  els.push(rect(32,178,36,18,MAGENTA,{rx:9}));
  els.push(text(50,191,'LIVE',9,'#FFFFFF',{anchor:'middle',fw:800,ls:0.5}));
  els.push(text(32,214,'HUM RADIO',22,'#FFFFFF',{fw:800,ls:0.5}));
  els.push(text(32,236,'Electronic · Ambient · Indie',13,'rgba(255,255,255,0.70)'));
  els.push(text(32,256,'2,847 listening now',12,'rgba(255,255,255,0.55)'));
  // Play button
  els.push(rect(W-72,183,48,48,LIME,{rx:24}));
  els.push(text(W-48,212,'▶',14,BASE,{anchor:'middle',fw:900}));

  // Genre stations
  els.push(text(20,304,'GENRE STATIONS',10,TEXT3,{fw:700,ls:1}));
  const genres = [
    { label:'INDIE FOLK',  c:ALBUM_COLORS[2], count:'1.2k', active:false },
    { label:'ELECTRONIC',  c:ALBUM_COLORS[1], count:'3.4k', active:true  },
    { label:'R&B / SOUL',  c:ALBUM_COLORS[4], count:'2.1k', active:false },
    { label:'JAZZ',        c:ALBUM_COLORS[3], count:'890',  active:false },
  ];
  genres.forEach((g,i)=>{
    const gy = 318+i*68;
    els.push(rect(20,gy,W-40,60,g.active?RAIL:SURF,{rx:14}));
    if(g.active) els.push(rect(20,gy,4,60,LIME,{rx:2}));
    // Color chip
    els.push(rect(32,gy+10,40,40,g.c[0],{rx:10}));
    els.push(rect(32,gy+10,20,40,g.c[1],{rx:6,opacity:0.5}));
    els.push(text(82,gy+26,g.label,14,g.active?TEXT:TEXT,{fw:700,ls:0.3}));
    els.push(text(82,gy+44,g.count+' listening',12,TEXT2));
    if(g.active){
      els.push(rect(W-64,gy+16,36,28,LIME_D,{rx:14}));
      els.push(text(W-46,gy+35,'▶',12,LIME,{anchor:'middle'}));
    } else {
      els.push(text(W-28,gy+32,'›',18,TEXT3,{anchor:'end'}));
    }
  });

  // Mood section
  const moodY = 318 + 4*68 + 8;
  els.push(line(20,moodY,W-20,moodY,RAIL));
  els.push(text(20,moodY+16,'MOOD',10,TEXT3,{fw:700,ls:1}));
  const moods = ['Deep Work','Workout','Wind Down','Commute'];
  let mx=20;
  moods.forEach((m,i)=>{
    const mw=m.length*7.5+24;
    els.push(rect(mx,moodY+26,mw,28,SURF,{rx:14,stroke:RAIL,sw:1}));
    els.push(text(mx+mw/2,moodY+45,m,12,TEXT2,{anchor:'middle',fw:500}));
    mx+=mw+8;
  });

  els.push(...bottomNav('radio'));
  return { name:'Radio', elements: els };
}

// ─── SCREEN 4: ARTIST ────────────────────────────────────────────────────────
function screenArtist() {
  const els = [];
  els.push(rect(0,0,W,H,BASE));
  els.push(...statusBar());

  // Artist atmosphere header
  const artC = ALBUM_COLORS[0];
  els.push(rect(0,0,W,260,artC[0],{opacity:0.30}));
  els.push(rect(0,0,W/2,260,artC[1],{opacity:0.15}));
  // Fade to base
  els.push(rect(0,200,W,100,BASE,{opacity:0.80}));

  // Back
  els.push(text(20,56,'‹',24,TEXT,{fw:300}));
  els.push(text(W-20,56,'⋮',20,TEXT2,{anchor:'end'}));

  // Artist name — giant type (Zune's boldest pattern)
  els.push(text(20,130,'AROHA',52,TEXT,{fw:900,ls:-2}));
  els.push(text(20,182,'NGATA',52,TEXT,{fw:900,ls:-2,opacity:0.50}));
  els.push(text(20,224,'3.4M monthly listeners',13,TEXT2));

  // Follow + shuffle buttons
  els.push(rect(20,238,90,34,SURF,{rx:17,stroke:LIME,sw:1}));
  els.push(text(65,259,'FOLLOW',11,LIME,{anchor:'middle',fw:700,ls:0.5}));
  els.push(rect(120,238,90,34,LIME,{rx:17}));
  els.push(text(165,259,'SHUFFLE',11,BASE,{anchor:'middle',fw:700,ls:0.5}));

  // Popular tracks
  els.push(text(20,290,'POPULAR TRACKS',10,TEXT3,{fw:700,ls:1}));
  const tracks = [
    { n:'1', title:'Melt Into You', album:'Frequencies', plays:'4.2M', dur:'4:28', current:true },
    { n:'2', title:'Signal & Noise', album:'Frequencies', plays:'3.1M', dur:'5:01', current:false },
    { n:'3', title:'Slow Burn', album:'Frequencies', plays:'2.8M', dur:'3:52', current:false },
    { n:'4', title:'Morning Glass', album:'Golden Hours', plays:'2.2M', dur:'4:15', current:false },
    { n:'5', title:'Open Water', album:'Tidal', plays:'1.9M', dur:'6:12', current:false },
  ];
  tracks.forEach((t,i)=>{
    const ty=304+i*60;
    els.push(rect(20,ty,W-40,52,t.current?RAIL:SURF,{rx:12}));
    if(t.current) els.push(rect(20,ty,3,52,LIME,{rx:2}));
    els.push(text(36,ty+18,t.n,13,t.current?LIME:TEXT3,{fw:700}));
    els.push(text(56,ty+18,t.title,14,TEXT,{fw:600}));
    els.push(text(56,ty+36,t.album,12,TEXT2));
    els.push(text(W-36,ty+18,t.plays,12,TEXT3,{anchor:'end'}));
    els.push(text(W-36,ty+36,t.dur,12,TEXT2,{anchor:'end'}));
  });

  // Albums strip
  const albY = 304 + 5*60 + 8;
  els.push(line(20,albY,W-20,albY,RAIL));
  els.push(text(20,albY+16,'DISCOGRAPHY',10,TEXT3,{fw:700,ls:1}));
  ALBUM_COLORS.slice(0,3).forEach((c,i)=>{
    const ax = 20+i*96;
    const ay = albY+28;
    const albumLabels = ['Frequencies','Tidal','Slow Burn'];
    els.push(rect(ax,ay,84,84,c[0],{rx:8}));
    els.push(rect(ax,ay,42,84,c[1],{rx:5,opacity:0.5}));
    els.push(text(ax,ay+98,albumLabels[i],11,TEXT,{fw:600}));
  });

  els.push(...bottomNav('artist'));
  return { name:'Artist', elements: els };
}

// ─── SCREEN 5: PLAYLIST ──────────────────────────────────────────────────────
function screenPlaylist() {
  const els = [];
  els.push(rect(0,0,W,H,BASE));
  els.push(...statusBar());

  // Playlist header atmosphere
  const pc = ALBUM_COLORS[4];
  els.push(rect(0,0,W,200,pc[0],{opacity:0.20}));
  els.push(rect(W/2,0,W/2,200,pc[1],{opacity:0.12}));
  els.push(rect(0,160,W,80,BASE,{opacity:0.85}));

  els.push(text(20,56,'‹',24,TEXT,{fw:300}));
  els.push(text(W-20,56,'⋮',20,TEXT2,{anchor:'end'}));

  // Playlist art (mosaic of 4 mini album art)
  const mosaicY = 70, mosaicX = W-130;
  const mSize = 56;
  ALBUM_COLORS.slice(0,4).forEach((c,i)=>{
    const mx = mosaicX + (i%2)*mSize + (i%2)*2;
    const my = mosaicY + Math.floor(i/2)*mSize + Math.floor(i/2)*2;
    els.push(rect(mx,my,mSize,mSize,c[0],{rx:i===0?8:i===1?8:i===2?8:8}));
    els.push(rect(mx,my,mSize/2,mSize,c[1],{rx:4,opacity:0.4}));
  });
  els.push(rect(mosaicX,mosaicY,2*mSize+2,2*mSize+2,'none',{rx:10,stroke:RAIL,sw:1}));

  // Playlist name — Zune bold left title
  els.push(text(20,100,'Late Night',40,TEXT,{fw:800,ls:-1}));
  els.push(text(20,142,'Session',40,TEXT,{fw:800,ls:-1,opacity:0.40}));
  els.push(text(20,184,'18 tracks · 1h 12m · Curated by you',13,TEXT2));

  // Actions
  els.push(rect(20,196,90,34,LIME,{rx:17}));
  els.push(text(65,217,'▶  PLAY',11,BASE,{anchor:'middle',fw:800,ls:0.5}));
  els.push(rect(120,196,80,34,SURF,{rx:17,stroke:RAIL,sw:1}));
  els.push(text(160,217,'SHUFFLE',11,TEXT2,{anchor:'middle',fw:600,ls:0.5}));

  // Track list
  els.push(line(20,240,W-20,240,RAIL));
  const plTracks = [
    { n:'1', title:'Melt Into You',     artist:'Aroha Ngata',    dur:'4:28', playing:true  },
    { n:'2', title:'Neon Rain',         artist:'Orbital Drift',  dur:'5:12', playing:false },
    { n:'3', title:'Amber Field',       artist:'Sable Creek',    dur:'3:44', playing:false },
    { n:'4', title:'Root & Branch',     artist:'Fern & Moss',    dur:'4:58', playing:false },
    { n:'5', title:'Velvet Underground',artist:'Coeur de Bois',  dur:'6:01', playing:false },
    { n:'6', title:'Open Window',       artist:'Blue Mesa',      dur:'3:28', playing:false },
    { n:'7', title:'Signal & Noise',    artist:'Aroha Ngata',    dur:'5:01', playing:false },
    { n:'8', title:'Pacific Rim',       artist:'Orbital Drift',  dur:'4:17', playing:false },
  ];
  plTracks.forEach((t,i)=>{
    const ty=248+i*58;
    els.push(rect(20,ty,W-40,50,t.playing?RAIL:SURF,{rx:12}));
    if(t.playing) els.push(rect(20,ty,3,50,LIME,{rx:2}));
    els.push(text(36,ty+16,t.n,12,t.playing?LIME:TEXT3,{fw:700}));
    const ac = ALBUM_COLORS[i%ALBUM_COLORS.length];
    els.push(rect(54,ty+5,40,40,ac[0],{rx:6}));
    els.push(rect(54,ty+5,20,40,ac[1],{rx:4,opacity:0.5}));
    els.push(text(102,ty+18,t.title,13,TEXT,{fw:600}));
    els.push(text(102,ty+34,t.artist,12,TEXT2));
    els.push(text(W-28,ty+18,t.dur,12,TEXT2,{anchor:'end'}));
    if(t.playing){
      els.push(text(W-28,ty+34,'▶',10,LIME,{anchor:'end'}));
    } else {
      els.push(text(W-28,ty+34,'⋮',12,TEXT3,{anchor:'end'}));
    }
  });

  els.push(...bottomNav('library'));
  return { name:'Playlist', elements: els };
}

// ─── SCREEN 6: LISTENING PARTY ────────────────────────────────────────────────
function screenParty() {
  const els = [];
  els.push(rect(0,0,W,H,BASE));
  els.push(...statusBar());

  // Party atmosphere — magenta for social energy
  els.push(rect(0,0,W,H/2,MAGENTA,{opacity:0.08}));
  els.push(rect(W/2,0,W/2,H/3,MAGENTA,{opacity:0.05}));

  // Header
  els.push(text(20,72,'listening',36,TEXT,{fw:800,ls:-1}));
  els.push(text(20,108,'party.',36,MAGENTA,{fw:800,ls:-1}));
  els.push(text(20,144,'8 people, one track',14,TEXT2));

  // Magenta live badge
  els.push(rect(20,158,46,20,MAGENTA,{rx:10}));
  els.push(text(43,172,'LIVE',9,'#FFFFFF',{anchor:'middle',fw:800,ls:0.5}));

  // Listener avatars — circle cluster
  const avColors = [ALBUM_COLORS[0][0],ALBUM_COLORS[1][0],ALBUM_COLORS[2][0],ALBUM_COLORS[3][0],ALBUM_COLORS[4][0]];
  const initials = ['AC','OD','SC','FM','CB'];
  avColors.forEach((c,i)=>{
    const ax = W-120+i*20;
    const ay = 164;
    els.push(circle(ax,ay,16,c));
    els.push(text(ax,ay+5,initials[i],9,'rgba(255,255,255,0.85)',{anchor:'middle',fw:700}));
  });
  els.push(text(W-18,172,'+3',10,TEXT2,{anchor:'end'}));

  // Current track card — Zune style
  const trackC = ALBUM_COLORS[0];
  els.push(rect(20,192,W-40,110,SURF,{rx:16}));
  els.push(rect(20,192,W-40,110,'none',{rx:16,stroke:RAIL,sw:1}));
  els.push(rect(20,192,4,110,MAGENTA,{rx:2}));
  // Album thumb
  els.push(rect(32,204,80,80,trackC[0],{rx:8}));
  els.push(rect(32,204,40,80,trackC[1],{rx:5,opacity:0.5}));
  // Track info
  els.push(text(124,222,'Melt Into You',16,TEXT,{fw:700}));
  els.push(text(124,242,'Aroha Ngata  ·  Frequencies',13,TEXT2));
  // Mini scrubber
  els.push(rect(124,260,(W-40-124-20),3,RAIL,{rx:2}));
  els.push(rect(124,260,Math.round((W-40-124-20)*0.38),3,MAGENTA,{rx:2}));
  els.push(text(124,276,'1:42',11,TEXT2));
  els.push(text(W-36,276,'4:28',11,TEXT2,{anchor:'end'}));
  // Like count
  els.push(text(W-36,248,'♡ 6',12,MAGENTA,{anchor:'end'}));

  // Reactions strip
  els.push(text(20,320,'REACTIONS',10,TEXT3,{fw:700,ls:1}));
  const reactions = ['🔥','✨','💚','🎵','⚡'];
  const counts = [5,3,8,2,4];
  reactions.forEach((r,i)=>{
    const rx2=20+i*68;
    els.push(rect(rx2,332,60,36,SURF,{rx:18}));
    els.push(text(rx2+16,356,r,16));
    els.push(text(rx2+36,354,String(counts[i]),12,TEXT2));
  });

  // Chat messages
  els.push(text(20,384,'PARTY CHAT',10,TEXT3,{fw:700,ls:1}));
  const msgs = [
    { user:'Orbital', msg:'this breakdown is 🔥', time:'now', col:ALBUM_COLORS[1][0] },
    { user:'Fern',    msg:'been on repeat for days', time:'1m', col:ALBUM_COLORS[3][0] },
    { user:'Sable',   msg:'turn this up!!!', time:'2m', col:ALBUM_COLORS[2][0] },
    { user:'Coeur',   msg:'Aroha never misses', time:'4m', col:ALBUM_COLORS[4][0] },
  ];
  msgs.forEach((m,i)=>{
    const my=398+i*60;
    els.push(circle(32,my+14,14,m.col));
    els.push(text(32,my+18,m.user.slice(0,2),10,'rgba(255,255,255,0.90)',{anchor:'middle',fw:700}));
    els.push(text(54,my+10,m.user,12,TEXT,{fw:600}));
    els.push(text(54,my+26,m.msg,13,TEXT2));
    els.push(text(W-20,my+10,m.time,11,TEXT3,{anchor:'end'}));
  });

  // Message input
  const inputY = 398 + 4*60 + 4;
  els.push(rect(20,inputY,W-40,40,SURF,{rx:20,stroke:RAIL,sw:1}));
  els.push(text(36,inputY+25,'Say something…',14,TEXT3));
  els.push(circle(W-32,inputY+20,16,MAGENTA));
  els.push(text(W-32,inputY+25,'↑',13,'#FFFFFF',{anchor:'middle',fw:700}));

  els.push(...bottomNav('party'));
  return { name:'Listening Party', elements: els };
}

// ─── ASSEMBLE ─────────────────────────────────────────────────────────────────
const screens = [
  screenNow(),
  screenLibrary(),
  screenRadio(),
  screenArtist(),
  screenPlaylist(),
  screenParty(),
];

const totalElements = screens.reduce((sum,s) => sum + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'HUM — Music for the way you feel',
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'dark',
    heartbeat: 51,
    elements: totalElements,
    palette: { BASE, SURF, CARD, LIME, MAGENTA, TEXT, TEXT2 },
    inspiration: [
      'r/UI_Design — Zune revival thread: dark canvas + single accent + bold typography',
      'awwwards — Bricolage Grotesque tag: bold condensed grotesque for display type',
      'godly.website / reflect.app — chromatic near-black substrate (#111209 warm charcoal)',
      'Dribbble — album art as atmospheric background (color bloom bleeding into card bg)',
    ],
  },
  screens: screens.map(s=>({
    name: s.name,
    svg: `${W}x${H}`,
    elements: s.elements,
  })),
};

fs.writeFileSync(path.join(__dirname,`${SLUG}.pen`), JSON.stringify(pen,null,2));
console.log(`HUM: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
