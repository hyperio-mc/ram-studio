// crate.js — Neo-brutalist vinyl record collection app
// Heartbeat design — March 17, 2026
// Inspired by: godly.website brutalist category + lapa.ninja polished brutalism
// Trend: counter-reaction to bento grid fatigue — hard edges, flat shadows, editorial weight-900 type
// Pattern: light mode, cream bg, single acid-yellow accent, offset shadow cards
'use strict';
const fs   = require('fs');
const path = require('path');
const https = require('https');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:    '#FAFAF0',  // warm off-white cream
  paper: '#F5F500',  // acid yellow — used as active/highlight blocks
  black: '#0D0D0D',  // near-black
  fg:    '#0D0D0D',
  muted: '#5A5A5A',
  white: '#FFFFFF',
  red:   '#E8271E',  // record label red
  blue:  '#003CFF',  // electric blue
  gray:  '#E5E5DC',  // light warm gray for alternating rows / inactive
};

// ── Canvas constants ───────────────────────────────────────────────────────────
const MW = 375, MH = 812;   // mobile
const DW = 1440, DH = 900;  // desktop
const GAP = 24;

// ── Pen format helpers ─────────────────────────────────────────────────────────
function F(x,y,w,h,fill,opts={}) {
  return {
    type:'frame', x, y, width:w, height:h, fill,
    cornerRadius: opts.r||0,
    opacity: opts.op||1,
    children: opts.ch||[],
    clipContent: opts.clip||false,
  };
}
function T(text,x,y,w,h,opts={}) {
  return {
    type:'text', x, y, width:w, height:h,
    content: String(text),
    fontSize: opts.size||14,
    fontWeight: opts.weight||400,
    fill: opts.fill||P.fg,
    textAlign: opts.align||'left',
    letterSpacing: opts.ls||0,
    opacity: opts.op||1,
    fontStyle: opts.style||'normal',
  };
}
function E(x,y,w,h,fill,opts={}) {
  return {type:'ellipse', x, y, width:w, height:h, fill, opacity:opts.op||1};
}
// Thin line (1-2px tall frame)
function L(x,y,w,h,fill) { return F(x,y,w,h,fill,{r:0}); }

// ── Brutalist helpers ──────────────────────────────────────────────────────────
// Shadow card: renders as two siblings — shadow behind, card on top
// Returns [shadowFrame, cardFrame] — spread into parent ch array
function ShadowCard(x,y,w,h,fill,children=[],offset=4) {
  return [
    F(x+offset, y+offset, w, h, P.black, {r:0}),   // flat shadow
    F(x, y, w, h, fill, {r:0, ch:children}),         // card
  ];
}
// Outlined button (thick black border simulated with outer black frame)
function BrutalBtn(x,y,w,h,fill,label,textFill,opts={}) {
  const bw = opts.bw||2;
  return F(x, y, w, h, P.black, {r:0, ch:[
    F(bw, bw, w-bw*2, h-bw*2, fill, {r:0, ch:[
      T(label, 0, (h-bw*2-16)/2, w-bw*2, 16, {
        size:opts.sz||11, weight:900, fill:textFill,
        align:'center', ls:opts.ls||1,
      }),
    ]}),
  ]});
}
// Yellow tag / genre pill
function Tag(x,y,w,label) {
  return F(x,y,w,24,P.paper,{r:0,ch:[
    T(label,6,4,w-12,16,{size:9,weight:900,fill:P.black,ls:2}),
  ]});
}
// Vinyl record graphic (concentric circles approximated with ellipses)
function VinylGraphic(cx,cy,r,labelColor) {
  // Outermost groove ring then label circle then hole
  return [
    E(cx-r,     cy-r,     r*2,   r*2,   P.black, {}),
    E(cx-r+6,   cy-r+6,   r*2-12, r*2-12, '#1a1a1a', {}),
    E(cx-r+14,  cy-r+14,  r*2-28, r*2-28, '#111', {}),
    E(cx-r+22,  cy-r+22,  r*2-44, r*2-44, labelColor, {}),  // label
    E(cx-8,     cy-8,     16,   16,   P.black, {}),          // hole
  ];
}

// ── Mobile bottom nav ──────────────────────────────────────────────────────────
function MobileNav(activeIndex) {
  const items = ['HOME','SEARCH','CRATES','PROFILE'];
  return [
    L(0, MH-64, MW, 2, P.black),
    F(0, MH-62, MW, 62, P.bg, {r:0, ch:[
      ...items.map((label,i) => {
        const isActive = i === activeIndex;
        return isActive
          ? F(i*(MW/4), 0, MW/4, 62, P.paper, {r:0, ch:[
              T(label, 0, 22, MW/4, 14, {size:9,weight:900,fill:P.black,align:'center',ls:1}),
            ]})
          : T(label, i*(MW/4), 24, MW/4, 14, {size:9,weight:400,fill:P.muted,align:'center',ls:1});
      }),
    ]}),
  ];
}
// ── Mobile status bar ──────────────────────────────────────────────────────────
function StatusBar() {
  return F(0,0,MW,44,P.bg,{r:0,ch:[
    T('9:41',16,14,80,16,{size:15,weight:700,fill:P.fg}),
    T('●●●',MW-80,14,64,16,{size:12,fill:P.fg,align:'right'}),
  ]});
}
// ── Desktop sidebar ────────────────────────────────────────────────────────────
const SB = 240;
function Sidebar(activeIndex) {
  const items = ['HOME','MY CRATES','SEARCH','DISCOVER','PROFILE'];
  return F(0,0,SB,DH,P.bg,{r:0,ch:[
    L(SB-2,0,2,DH,P.black),
    T('CRATE',24,28,160,32,{size:26,weight:900,fill:P.fg,ls:6}),
    L(0,72,SB,2,P.black),
    ...items.flatMap((item,i) => {
      const isActive = i === activeIndex;
      const y = 88+i*56;
      if(isActive) return [
        F(0,y,SB-2,48,P.paper,{r:0,ch:[
          T(item,24,14,SB-48,20,{size:11,weight:900,fill:P.black,ls:2}),
          L(SB-6,0,4,48,P.black),
        ]}),
      ];
      return [T(item,24,y+14,SB-48,20,{size:11,weight:400,fill:P.muted,ls:2})];
    }),
    L(0,368,SB,2,P.black),
    T('COLLECTION',24,384,SB-48,12,{size:9,weight:900,fill:P.muted,ls:3}),
    T('266',24,402,SB-48,28,{size:24,weight:900,fill:P.fg}),
    T('records',24,430,SB-48,14,{size:11,fill:P.muted}),
    T('12 crates',24,450,SB-48,14,{size:11,fill:P.muted}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 0 — Mobile: Home
// ══════════════════════════════════════════════════════════════════════════════
function mHome(ox) {
  const cvSz = MW-48;  // album cover size
  const cvY  = 110;

  return F(ox,0,MW,MH,P.bg,{clip:true,ch:[
    StatusBar(),
    // App header
    L(0,44,MW,2,P.black),
    F(0,46,MW,52,P.bg,{r:0,ch:[
      T('CRATE',16,14,120,28,{size:22,weight:900,fill:P.fg,ls:4}),
      L(MW-48,20,24,2,P.black),
      L(MW-48,27,24,2,P.black),
      L(MW-48,34,24,2,P.black),
    ]}),
    L(0,98,MW,2,P.black),

    // "Featured" label on yellow block
    F(16,cvY-28,160,24,P.paper,{r:0,ch:[
      T('FEATURED TODAY',6,5,148,14,{size:9,weight:900,fill:P.black,ls:2}),
    ]}),

    // Album cover with flat shadow
    ...ShadowCard(24,cvY,cvSz,cvSz,P.black,[
      ...VinylGraphic(cvSz/2,cvSz/2,cvSz/2-8,P.red),
      T('MIDNIGHT',16,cvSz-68,cvSz-32,22,{size:17,weight:900,fill:P.white,ls:2}),
      T('ELECTRIC PULSAR',16,cvSz-44,cvSz-32,14,{size:10,fill:P.white,ls:1,op:0.7}),
    ]),

    // Album meta
    T('ELECTRIC PULSAR',24,cvY+cvSz+16,MW-48,20,{size:15,weight:900,fill:P.fg,ls:2}),
    T('Midnight · 2024 · Jazz Fusion',24,cvY+cvSz+38,MW-48,14,{size:12,fill:P.muted}),

    // Yellow stats row
    F(24,cvY+cvSz+60,84,32,P.paper,{r:0,ch:[T('★ 8.9',8,8,68,16,{size:13,weight:900,fill:P.black})]}),
    F(116,cvY+cvSz+60,80,32,P.gray,{r:0,ch:[T('JAZZ',8,8,64,16,{size:11,weight:900,fill:P.black,ls:2})]}),
    F(204,cvY+cvSz+60,80,32,P.gray,{r:0,ch:[T('2024',8,8,64,16,{size:11,weight:700,fill:P.muted})]}),

    // Action buttons
    L(0,cvY+cvSz+104,MW,2,P.black),
    F(0,cvY+cvSz+106,MW,56,P.gray,{r:0,ch:[
      ...ShadowCard(12,12,100,32,P.red,[T('+ CRATE',0,8,100,16,{size:11,weight:900,fill:P.white,align:'center',ls:1})],2),
      ...ShadowCard(120,12,100,32,P.white,[T('DETAILS',0,8,100,16,{size:11,weight:700,fill:P.black,align:'center',ls:1})],2),
      ...ShadowCard(228,12,100,32,P.black,[T('▶  PLAY',0,8,100,16,{size:11,weight:700,fill:P.white,align:'center',ls:1})],2),
    ]}),
    L(0,cvY+cvSz+162,MW,2,P.black),

    // Recent additions
    T('RECENTLY ADDED',24,cvY+cvSz+174,MW-48,12,{size:9,weight:900,fill:P.muted,ls:3}),
    ...[
      {title:'Kind of Blue',artist:'Miles Davis',year:'1959',col:P.blue},
      {title:'Thriller',artist:'Michael Jackson',year:'1982',col:P.red},
    ].flatMap(({title,artist,year,col},i) => {
      const ry = cvY+cvSz+194+i*58;
      return [
        L(0,ry,MW,1,P.black),
        F(16,ry+8,44,44,col,{r:0}),
        T(String(i+1).padStart(2,'0'),70,ry+14,28,16,{size:11,weight:900,fill:P.muted}),
        T(title,100,ry+10,MW-148,18,{size:13,weight:700,fill:P.fg}),
        T(artist+' · '+year,100,ry+30,MW-148,14,{size:11,fill:P.muted}),
        T('→',MW-36,ry+16,24,18,{size:15,weight:700,fill:P.fg}),
      ];
    }),

    ...MobileNav(0),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Mobile: Album Detail
// ══════════════════════════════════════════════════════════════════════════════
function mAlbum(ox) {
  const cvSz = MW-48;
  const cvY  = 96;

  const trackData = [
    {n:'01',t:'So What',d:'9:22',play:true},
    {n:'02',t:'Freddie Freeloader',d:'9:46',play:false},
    {n:'03',t:'Blue in Green',d:'5:37',play:false},
    {n:'04',t:'All Blues',d:'11:33',play:false},
    {n:'05',t:'Flamenco Sketches',d:'9:26',play:false},
  ];

  return F(ox,0,MW,MH,P.bg,{clip:true,ch:[
    StatusBar(),
    L(0,44,MW,2,P.black),
    F(0,46,MW,44,P.bg,{r:0,ch:[
      T('← BACK',16,12,80,20,{size:12,weight:900,fill:P.red,ls:1}),
      T('ALBUM',0,14,MW,16,{size:10,weight:900,fill:P.muted,ls:3,align:'center'}),
    ]}),
    L(0,90,MW,2,P.black),

    // Cover art with offset shadow
    ...ShadowCard(24,cvY,cvSz,cvSz,P.black,[
      ...VinylGraphic(cvSz/2,cvSz/2,cvSz/2-8,P.blue),
      T('KIND OF BLUE',14,cvSz-58,cvSz-28,18,{size:14,weight:900,fill:P.white,ls:2}),
      T('MILES DAVIS',14,cvSz-36,cvSz-28,14,{size:10,fill:P.white,ls:1,op:0.6}),
    ]),

    // Album title + meta
    T('Kind of Blue',24,cvY+cvSz+16,MW-48,22,{size:18,weight:900,fill:P.fg}),
    T('Miles Davis · Columbia Records',24,cvY+cvSz+40,MW-48,16,{size:12,fill:P.muted}),
    F(24,cvY+cvSz+62,60,24,P.paper,{r:0,ch:[T('1959',6,4,48,16,{size:11,weight:900,fill:P.black})]}),
    F(90,cvY+cvSz+62,60,24,P.paper,{r:0,ch:[T('JAZZ',6,4,48,16,{size:11,weight:900,fill:P.black})]}),
    F(156,cvY+cvSz+62,72,24,P.blue,{r:0,ch:[T('★ 9.4',6,4,60,16,{size:11,weight:900,fill:P.white})]}),

    L(0,cvY+cvSz+96,MW,2,P.black),
    T('TRACKLIST',24,cvY+cvSz+106,MW-48,12,{size:9,weight:900,fill:P.muted,ls:3}),

    // Track rows
    ...trackData.flatMap(({n,t,d,play},i) => {
      const ty = cvY+cvSz+126+i*46;
      return [
        L(0,ty,MW,1,P.black),
        F(0,ty+1,MW,45,play?P.paper:P.bg,{r:0,ch:[
          T(n,16,14,28,17,{size:11,weight:900,fill:play?P.black:P.muted}),
          T(t,50,12,MW-130,21,{size:14,weight:play?700:400,fill:play?P.black:P.fg}),
          T(d,MW-60,16,52,14,{size:11,fill:play?P.black:P.muted,align:'right'}),
          play ? F(MW-84,11,24,24,P.red,{r:0,ch:[T('▶',4,4,16,16,{size:10,fill:P.white})]}) : T('',0,0,0,0,{}),
        ]}),
      ];
    }),

    ...MobileNav(0),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Mobile: My Crates
// ══════════════════════════════════════════════════════════════════════════════
function mCrates(ox) {
  const crates = [
    {name:'JAZZ ESSENTIALS',count:47,color:P.blue},
    {name:'90s HIP-HOP',count:23,color:P.red},
    {name:'AMBIENT',count:31,color:P.black},
    {name:'SOUL & FUNK',count:58,color:P.paper},
    {name:'ELECTRONIC',count:19,color:P.gray},
    {name:'CLASSICS',count:88,color:P.black},
  ];
  const cardW = Math.floor((MW-48)/2);

  return F(ox,0,MW,MH,P.bg,{clip:true,ch:[
    StatusBar(),
    L(0,44,MW,2,P.black),
    F(0,46,MW,52,P.bg,{r:0,ch:[
      T('MY CRATES',16,14,200,28,{size:22,weight:900,fill:P.fg,ls:4}),
      ...ShadowCard(MW-84,14,68,28,P.red,[T('+ NEW',0,6,68,16,{size:10,weight:900,fill:P.white,align:'center',ls:1})],2),
    ]}),
    L(0,98,MW,2,P.black),
    T(`${crates.length} crates · ${crates.reduce((a,c)=>a+c.count,0)} records`,16,108,MW-32,14,{size:11,fill:P.muted}),

    // 2-column crate grid
    ...crates.flatMap(({name,count,color},i) => {
      const col  = i%2;
      const row  = Math.floor(i/2);
      const cx   = 16+col*(cardW+16);
      const cy   = 130+row*(120+12);
      const isDark  = color===P.blue||color===P.red||color===P.black;
      const textCol = isDark ? P.white : P.black;
      return [
        ...ShadowCard(cx,cy,cardW,108,color,[
          // 3 stacked squares to suggest record sleeves
          F(cardW-48,10,36,36,'rgba(0,0,0,0.25)',{r:0}),
          F(cardW-44,14,28,28,'rgba(0,0,0,0.25)',{r:0}),
          F(cardW-40,18,20,20,'rgba(0,0,0,0.35)',{r:0}),
          T(name,10,68,cardW-20,18,{size:10,weight:900,fill:textCol,ls:1}),
          T(`${count} records`,10,88,cardW-20,14,{size:10,fill:textCol,op:0.6}),
        ],3),
      ];
    }),

    ...MobileNav(2),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Desktop: Home
// ══════════════════════════════════════════════════════════════════════════════
function dHome(ox) {
  const CW = DW-SB;  // content width

  const recentAlbums = [
    {title:'Bitches Brew',artist:'Miles Davis',year:'1970',col:P.blue},
    {title:'Abbey Road',artist:'The Beatles',year:'1969',col:P.red},
    {title:'Purple Rain',artist:'Prince',year:'1984',col:P.blue},
    {title:'Nevermind',artist:'Nirvana',year:'1991',col:P.red},
  ];

  return F(ox,0,DW,DH,P.bg,{clip:true,ch:[
    Sidebar(0),

    // Main content area
    // Header bar
    L(SB,0,CW,2,P.black),
    F(SB,2,CW,70,P.bg,{r:0,ch:[
      T('RECORD OF THE DAY',24,26,280,14,{size:10,weight:900,fill:P.muted,ls:3}),
      ...ShadowCard(CW-160,18,136,36,P.black,[T('+ ADD RECORD',8,10,120,16,{size:11,weight:900,fill:P.white,ls:1})],3),
    ]}),
    L(SB,72,CW,2,P.black),

    // Hero featured album — full-width black panel
    F(SB,74,CW,DH/2-20,P.black,{r:0,clip:true,ch:[
      // Vinyl graphic (large, left side)
      ...VinylGraphic(200,DH/4-30,180,P.red),

      // Text right side
      T('RECORD',410,40,600,14,{size:10,weight:900,fill:'#555',ls:5}),
      T('OF THE DAY',410,58,600,14,{size:10,weight:900,fill:'#555',ls:5}),
      T('KIND OF',410,90,600,64,{size:60,weight:900,fill:P.white,ls:-2}),
      T('BLUE',410,158,600,64,{size:60,weight:900,fill:P.white,ls:-2}),
      T('MILES DAVIS',410,228,500,28,{size:22,weight:400,fill:'#888',ls:4}),
      T('COLUMBIA RECORDS · 1959 · MODAL JAZZ',410,264,600,14,{size:11,fill:'#555',ls:2}),

      // Yellow stats tiles
      F(410,292,100,56,P.paper,{r:0,ch:[
        T('9.4',12,8,76,28,{size:24,weight:900,fill:P.black}),
        T('RATING',12,38,76,12,{size:9,weight:900,fill:P.black,ls:2}),
      ]}),
      F(518,292,100,56,P.white,{r:0,ch:[
        T('5',12,8,76,28,{size:24,weight:900,fill:P.black}),
        T('TRACKS',12,38,76,12,{size:9,weight:900,fill:P.muted,ls:2}),
      ]}),
      F(626,292,120,56,P.white,{r:0,ch:[
        T('46:32',12,8,96,28,{size:24,weight:900,fill:P.black}),
        T('RUNTIME',12,38,96,12,{size:9,weight:900,fill:P.muted,ls:2}),
      ]}),

      // Add to crate button
      ...ShadowCard(410,356,160,40,P.red,[T('+ ADD TO CRATE',0,12,160,16,{size:11,weight:900,fill:P.white,align:'center',ls:1})],4),
    ]}),

    // Recently added section
    L(SB,74+DH/2-20,CW,2,P.black),
    F(SB,76+DH/2-20,CW,34,P.gray,{r:0,ch:[
      T('RECENTLY ADDED',24,10,300,14,{size:10,weight:900,fill:P.muted,ls:3}),
    ]}),
    L(SB,110+DH/2-20,CW,2,P.black),

    // Recent records rows
    ...recentAlbums.flatMap(({title,artist,year,col},i) => {
      const ry = 112+DH/2-20+i*52;
      return [
        F(SB,ry,CW,50,i%2===0?P.bg:P.gray,{r:0,ch:[
          F(16,9,32,32,col,{r:0}),
          T(String(i+1).padStart(2,'0'),58,16,32,18,{size:11,weight:900,fill:P.muted}),
          T(title,98,12,280,22,{size:15,weight:700,fill:P.fg}),
          T(artist+' · '+year,98,34,280,14,{size:11,fill:P.muted}),
          T('→',CW-48,16,32,18,{size:16,weight:700,fill:P.fg}),
        ]}),
        L(SB,ry+50,CW,1,P.black),
      ];
    }).flat(),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Desktop: Discover
// ══════════════════════════════════════════════════════════════════════════════
function dDiscover(ox) {
  const CW = DW-SB;
  const colW = Math.floor((CW-80)/3);

  const albums = [
    {title:'A Love Supreme',artist:'John Coltrane',year:'1964',genre:'JAZZ',color:P.blue},
    {title:'Dark Side of the Moon',artist:'Pink Floyd',year:'1973',genre:'ROCK',color:P.black},
    {title:'Illmatic',artist:'Nas',year:'1994',genre:'HIP-HOP',color:P.red},
    {title:'OK Computer',artist:'Radiohead',year:'1997',genre:'ALT ROCK',color:P.gray},
    {title:'Blue',artist:'Joni Mitchell',year:'1971',genre:'FOLK',color:P.paper},
    {title:'Purple Rain',artist:'Prince',year:'1984',genre:'FUNK',color:P.blue},
  ];

  return F(ox,0,DW,DH,P.bg,{clip:true,ch:[
    Sidebar(3),

    L(SB,0,CW,2,P.black),
    F(SB,2,CW,70,P.bg,{r:0,ch:[
      T('DISCOVER',24,20,300,28,{size:22,weight:900,fill:P.fg,ls:4}),
      // Filter pills
      ...[['ALL GENRES',true],['JAZZ',false],['HIP-HOP',false],['ROCK',false],['ELECTRONIC',false]].map(([label,active],i) =>
        F(CW-560+i*108,20,96,32,active?P.black:P.gray,{r:0,ch:[
          T(label,0,9,96,14,{size:9,weight:900,fill:active?P.white:P.muted,ls:1,align:'center'}),
        ]})
      ),
    ]}),
    L(SB,72,CW,2,P.black),

    // 3-column album grid
    ...albums.flatMap(({title,artist,year,genre,color},i) => {
      const col    = i%3;
      const row    = Math.floor(i/3);
      const cx     = SB+24+col*(colW+16);
      const cy     = 88+row*(240+16);
      const isDark = color===P.blue||color===P.red||color===P.black;
      const textC  = isDark ? P.white : P.black;
      const vinylLabel = isDark ? P.red : P.blue;
      return [
        ...ShadowCard(cx,cy,colW,228,color,[
          // Vinyl cover top section
          F(0,0,colW,140,P.black,{r:0,ch:[
            ...VinylGraphic(colW/2,70,56,vinylLabel),
          ]}),
          L(0,140,colW,2,P.black),
          T(title,12,150,colW-24,20,{size:13,weight:900,fill:textC}),
          T(artist+' · '+year,12,172,colW-24,16,{size:11,fill:textC,op:0.65}),
          Tag(12,194,60,genre),
          T('→',colW-36,196,28,20,{size:16,weight:700,fill:textC}),
        ],4),
      ];
    }).flat(),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Desktop: Crate Detail (Jazz Essentials)
// ══════════════════════════════════════════════════════════════════════════════
function dCrateDetail(ox) {
  const CW = DW-SB;

  const tracks = [
    {n:'01',t:'So What',artist:'Miles Davis',d:'9:22',yr:'1959',key:'Dm',bpm:136,play:true},
    {n:'02',t:'Freddie Freeloader',artist:'Miles Davis',d:'9:46',yr:'1959',key:'Bb',bpm:128,play:false},
    {n:'03',t:'A Love Supreme Pt.1',artist:'John Coltrane',d:'7:02',yr:'1964',key:'F',bpm:98,play:false},
    {n:'04',t:'Flamenco Sketches',artist:'Miles Davis',d:'9:26',yr:'1959',key:'Eb',bpm:112,play:false},
    {n:'05',t:'All Blues',artist:'Miles Davis',d:'11:33',yr:'1959',key:'G',bpm:144,play:false},
    {n:'06',t:'Naima',artist:'John Coltrane',d:'4:22',yr:'1959',key:'Eb',bpm:70,play:false},
    {n:'07',t:'Pursuance',artist:'John Coltrane',d:'7:52',yr:'1964',key:'Cm',bpm:160,play:false},
    {n:'08',t:'Resolution',artist:'John Coltrane',d:'7:22',yr:'1964',key:'F',bpm:112,play:false},
    {n:'09',t:'In a Silent Way',artist:'Miles Davis',d:'18:19',yr:'1969',key:'Bb',bpm:82,play:false},
    {n:'10',t:'Round Midnight',artist:'Thelonious Monk',d:'5:32',yr:'1957',key:'Eb',bpm:100,play:false},
  ];

  return F(ox,0,DW,DH,P.bg,{clip:true,ch:[
    Sidebar(1),

    // Crate header panel (blue)
    F(SB,0,CW,100,P.blue,{r:0,ch:[
      T('← MY CRATES',24,16,140,14,{size:10,weight:900,fill:P.white,ls:2,op:0.7}),
      T('JAZZ ESSENTIALS',24,38,600,40,{size:32,weight:900,fill:P.white,ls:2}),
      T('47 records · Last updated 3 days ago',24,82,400,14,{size:11,fill:P.white,op:0.6}),
      ...ShadowCard(CW-200,34,76,32,P.paper,[T('EDIT',0,8,76,16,{size:11,weight:900,fill:P.black,align:'center',ls:2})],3),
      ...ShadowCard(CW-116,34,76,32,P.black,[T('SHARE',0,8,76,16,{size:11,weight:900,fill:P.white,align:'center',ls:1})],3),
    ]}),
    L(SB,100,CW,2,P.black),

    // Column header row
    F(SB,102,CW,38,P.gray,{r:0,ch:[
      T('#',16,11,32,16,{size:9,weight:900,fill:P.muted,ls:2}),
      T('TITLE',56,11,220,16,{size:9,weight:900,fill:P.muted,ls:2}),
      T('ARTIST',292,11,180,16,{size:9,weight:900,fill:P.muted,ls:2}),
      T('YEAR',488,11,52,16,{size:9,weight:900,fill:P.muted,ls:2}),
      T('KEY',556,11,44,16,{size:9,weight:900,fill:P.muted,ls:2}),
      T('BPM',614,11,44,16,{size:9,weight:900,fill:P.muted,ls:2}),
      T('TIME',CW-72,11,56,16,{size:9,weight:900,fill:P.muted,ls:2}),
    ]}),
    L(SB,140,CW,2,P.black),

    // Track rows
    ...tracks.flatMap(({n,t,artist,d,yr,key,bpm,play},i) => {
      const ry = 142+i*52;
      return [
        F(SB,ry,CW,50,play?P.paper:i%2===0?P.bg:P.gray,{r:0,ch:[
          T(n,16,16,32,18,{size:11,weight:900,fill:play?P.red:P.muted}),
          T(t,56,14,220,22,{size:14,weight:play?700:400,fill:P.fg}),
          T(artist,292,16,180,18,{size:12,fill:P.muted}),
          T(yr,488,16,52,18,{size:12,fill:P.muted}),
          F(556,12,40,26,play?P.red:P.black,{r:0,ch:[T(key,0,5,40,16,{size:10,weight:900,fill:P.white,align:'center',ls:1})]}),
          T(String(bpm),614,16,44,18,{size:12,fill:P.muted}),
          T(d,CW-72,16,56,18,{size:12,fill:P.muted}),
          play ? F(CW-132,14,22,22,P.red,{r:0,ch:[T('▶',3,4,16,14,{size:9,fill:P.white})]}) : T('',0,0,0,0,{}),
        ]}),
        L(SB,ry+50,CW,1,P.black),
      ];
    }).flat(),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// Assemble document
// ══════════════════════════════════════════════════════════════════════════════
const screens = [
  mHome(0),
  mAlbum(MW+GAP),
  mCrates((MW+GAP)*2),
  dHome((MW+GAP)*3),
  dDiscover((MW+GAP)*3+DW+GAP),
  dCrateDetail((MW+GAP)*3+(DW+GAP)*2),
];

// Flat pen format (no document wrapper — confirmed by checking fortis.pen)
const pen     = { version:'2.8', children: screens };
const penJson = JSON.stringify(pen, null, 2);

fs.writeFileSync(path.join(__dirname,'crate.pen'), penJson);
console.log('Pen written: crate.pen');
console.log(`Screens: ${screens.length} (3 mobile + 3 desktop)`);

// ══════════════════════════════════════════════════════════════════════════════
// Share page HTML
// ══════════════════════════════════════════════════════════════════════════════
const penB64 = Buffer.from(penJson).toString('base64');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>CRATE — Neo-Brutalist Vinyl Collection App</title>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:#FAFAF0;color:#0D0D0D;font-family:'SF Mono','Fira Code',ui-monospace,monospace;min-height:100vh}
  nav{padding:16px 40px;border-bottom:2px solid #0D0D0D;display:flex;justify-content:space-between;align-items:center;background:#FAFAF0}
  .logo{font-size:13px;font-weight:900;letter-spacing:4px;color:#0D0D0D}
  .nav-r{display:flex;align-items:center;gap:10px}
  .btn{padding:10px 18px;font-size:11px;font-weight:900;cursor:pointer;border:2px solid #0D0D0D;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:1px;box-shadow:3px 3px 0 #0D0D0D;transition:box-shadow 0.1s,transform 0.1s}
  .btn:hover{box-shadow:1px 1px 0 #0D0D0D;transform:translate(2px,2px)}
  .btn-p{background:#E8271E;color:#fff;border-color:#0D0D0D}
  .btn-s{background:#FAFAF0;color:#0D0D0D}
  .btn-y{background:#F5F500;color:#0D0D0D}
  .btn-x{background:#0D0D0D;color:#fff}
  .hero{padding:64px 40px 40px;max-width:980px}
  .tag{font-size:9px;letter-spacing:3px;color:#5A5A5A;margin-bottom:16px;font-weight:700}
  h1{font-size:clamp(64px,10vw,120px);font-weight:900;letter-spacing:-3px;line-height:1;margin-bottom:16px;color:#0D0D0D}
  .sub{font-size:16px;color:#5A5A5A;max-width:520px;line-height:1.6;margin-bottom:24px}
  .meta{display:flex;gap:0;margin-bottom:40px;flex-wrap:wrap;border:2px solid #0D0D0D}
  .meta-item{padding:16px 24px;border-right:2px solid #0D0D0D;flex:1;min-width:140px}
  .meta-item:last-child{border-right:none}
  .meta-item span{display:block;font-size:9px;letter-spacing:2px;color:#5A5A5A;margin-bottom:6px;font-weight:700}
  .meta-item strong{font-size:14px;font-weight:900;color:#0D0D0D}
  .meta-item strong.accent{color:#E8271E}
  .actions{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:60px}
  .preview{padding:0 40px 60px}
  .section-label{font-size:9px;letter-spacing:3px;color:#5A5A5A;margin-bottom:20px;padding-bottom:12px;border-bottom:2px solid #0D0D0D;font-weight:900}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-track{background:#E5E5DC}
  .thumbs::-webkit-scrollbar-thumb{background:#0D0D0D44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:2px solid #0D0D0D;max-width:980px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:8px;flex-wrap:wrap}
  .tokens-block{background:#F5F500;border:2px solid #0D0D0D;padding:20px;margin-top:24px;position:relative;box-shadow:4px 4px 0 #0D0D0D}
  .tokens-pre{font-size:11px;line-height:1.7;color:#0D0D0D;opacity:.8;white-space:pre;overflow-x:auto;font-family:inherit}
  .copy-btn{position:absolute;top:12px;right:12px;background:#0D0D0D;border:none;color:#F5F500;font-family:inherit;font-size:9px;letter-spacing:2px;padding:6px 14px;cursor:pointer;font-weight:900}
  .r-card{background:#F5F500;border:2px solid #0D0D0D;padding:20px;box-shadow:4px 4px 0 #0D0D0D}
  .r-card h3{font-size:9px;letter-spacing:2px;color:#0D0D0D;margin-bottom:12px;font-weight:900}
  .r-card p{font-size:12px;color:#0D0D0D;opacity:.7;line-height:1.7}
  footer{padding:24px 40px;border-top:2px solid #0D0D0D;font-size:11px;color:#5A5A5A;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;font-weight:700;letter-spacing:1px}
  .toast{position:fixed;bottom:24px;right:24px;background:#0D0D0D;color:#F5F500;font-family:inherit;font-size:11px;font-weight:900;letter-spacing:2px;padding:10px 20px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-r">
    <button class="btn btn-p" onclick="openInViewer()">▶ Open in Viewer</button>
    <button class="btn btn-s" onclick="downloadPen()">↓ Download .pen</button>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ Copy Prompt</button>
    <button class="btn btn-x" onclick="shareOnX()">𝕏 Share</button>
  </div>
</nav>

<section class="hero">
  <div class="tag">PRODUCTION DESIGN SYSTEM · NEO-BRUTALIST · MARCH 17, 2026</div>
  <h1>CRATE</h1>
  <p class="sub">A vinyl record collection app built with brutal honesty — hard edges, flat shadows, acid yellow, zero gradients.</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>6 (3 MOBILE + 3 DESKTOP)</strong></div>
    <div class="meta-item"><span>STYLE</span><strong class="accent">NEO-BRUTALIST</strong></div>
    <div class="meta-item"><span>BRAND SPEC</span><strong>✓ INCLUDED</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
  </div>
  <div class="actions">
    <button class="btn btn-p" onclick="openInViewer()">▶ Open in Pen Viewer</button>
    <button class="btn btn-s" onclick="downloadPen()">↓ Download .pen</button>
    <button class="btn btn-y" onclick="copyPrompt()">⌘ Copy Prompt</button>
    <button class="btn btn-x" onclick="shareOnX()">𝕏 Share</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREENS · 3 MOBILE + 3 DESKTOP</div>
  <div class="thumbs" id="thumbs-container"></div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">
    <div>
      <div style="font-size:9px;letter-spacing:2px;color:#5A5A5A;margin-bottom:16px;font-weight:700">COLOR PALETTE</div>
      <div class="swatches">
        ${[
          {hex:'#FAFAF0',role:'BACKGROUND',dark:false},
          {hex:'#0D0D0D',role:'FOREGROUND',dark:true},
          {hex:'#F5F500',role:'ACCENT (YELLOW)',dark:false},
          {hex:'#E8271E',role:'ACCENT (RED)',dark:true},
          {hex:'#003CFF',role:'ACCENT (BLUE)',dark:true},
        ].map(s => `<div style="flex:1;min-width:80px">
          <div style="height:64px;background:${s.hex};border:2px solid #0D0D0D;margin-bottom:10px;box-shadow:3px 3px 0 #0D0D0D"></div>
          <div style="font-size:9px;letter-spacing:1px;color:#5A5A5A;margin-bottom:4px;font-weight:700">${s.role}</div>
          <div style="font-size:12px;font-weight:900;color:#0D0D0D">${s.hex}</div>
        </div>`).join('')}
      </div>
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;color:#5A5A5A;margin-bottom:0;font-weight:700">TYPE SCALE</div>
      ${[
        {label:'DISPLAY',size:'80px',weight:'900',sample:'CRATE'},
        {label:'HEADING',size:'22px',weight:'900',sample:'JAZZ ESSENTIALS'},
        {label:'BODY',size:'14px',weight:'400',sample:'Kind of Blue · Miles Davis · Columbia Records · 1959'},
        {label:'LABEL',size:'9px',weight:'900',sample:'RECENTLY ADDED · 47 RECORDS · JAZZ FUSION'},
      ].map(t => `<div style="padding:14px 0;border-bottom:2px solid #0D0D0D">
        <div style="font-size:9px;letter-spacing:2px;color:#5A5A5A;margin-bottom:8px;font-weight:700">${t.label} · ${t.size} / ${t.weight}</div>
        <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.1;color:#0D0D0D;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
      </div>`).join('')}
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;color:#5A5A5A;margin-bottom:16px;font-weight:700">SPACING — 8PX BASE GRID</div>
      ${[8,16,24,32,48,64,96].map(sp => `<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
        <div style="font-size:10px;color:#5A5A5A;width:36px;flex-shrink:0;font-weight:700">${sp}px</div>
        <div style="height:8px;background:#0D0D0D;width:${sp*1.5}px"></div>
      </div>`).join('')}
    </div>
    <div>
      <div style="font-size:9px;letter-spacing:2px;color:#5A5A5A;margin-bottom:16px;font-weight:700">DESIGN PRINCIPLES</div>
      ${['No gradients, no rounded corners, no drop shadows — brutalism means structural honesty. The flat offset shadow (4px solid black) is the only depth cue.',
         'Yellow is reserved for active state and featured content only. One record gets the yellow treatment per screen. Scarcity creates hierarchy.',
         'Weight-900 all-caps labels as layout elements — they define regions without needing color or lines. The grid shows itself through type.']
        .map((p,i) => `<div style="display:flex;gap:12px;margin-bottom:16px;align-items:flex-start;padding:12px;border:2px solid #0D0D0D">
          <div style="background:#F5F500;color:#0D0D0D;font-size:9px;font-weight:900;flex-shrink:0;width:20px;height:20px;display:flex;align-items:center;justify-content:center">${i+1}</div>
          <div style="font-size:12px;color:#5A5A5A;line-height:1.6">${p}</div>
        </div>`).join('')}
    </div>
  </div>
  <div class="tokens-block">
    <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
    <pre class="tokens-pre" id="css-tokens">:root {
  /* Color */
  --color-bg:        #FAFAF0;
  --color-fg:        #0D0D0D;
  --color-gray:      #E5E5DC;
  --color-muted:     #5A5A5A;
  --color-yellow:    #F5F500;
  --color-red:       #E8271E;
  --color-blue:      #003CFF;
  --color-white:     #FFFFFF;

  /* Typography — monospace display */
  --font-family: 'SF Mono', 'Fira Code', ui-monospace, monospace;
  --font-display: 900 clamp(64px, 10vw, 120px) / 1 var(--font-family);
  --font-heading: 900 22px / 1.1 var(--font-family);
  --font-body:    400 14px / 1.6 var(--font-family);
  --font-label:   900 9px / 1 var(--font-family);

  /* Spacing (8px base grid) */
  --space-1: 8px;   --space-2: 16px;  --space-3: 24px;
  --space-4: 32px;  --space-5: 48px;  --space-6: 64px;  --space-7: 96px;

  /* Radius — none (brutalist) */
  --radius: 0;

  /* Shadow (flat offset, no blur) */
  --shadow-sm:  3px 3px 0 #0D0D0D;
  --shadow-md:  4px 4px 0 #0D0D0D;
  --shadow-lg:  6px 6px 0 #0D0D0D;

  /* Borders */
  --border: 2px solid #0D0D0D;
  --border-thin: 1px solid #0D0D0D;
}</pre>
  </div>
</section>

<section style="padding:60px 40px;border-top:2px solid #0D0D0D;max-width:980px">
  <div class="section-label">DESIGN RATIONALE</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
    <div class="r-card">
      <h3>NEO-BRUTALISM — FROM GODLY.WEBSITE</h3>
      <p>Godly's brutalist category (16 curated sites) showed a clear counter-trend: hard edges, offset shadows, monochrome with one acid accent. The community is deliberately rejecting the smooth gradient-and-rounded-corner SaaS aesthetic after years of saturation.</p>
    </div>
    <div class="r-card">
      <h3>BENTO GRID FATIGUE — FROM REDDIT/UI_DESIGN</h3>
      <p>Top posts this week explicitly called bento grids "generic." The counter-push is toward editorial column layouts and structural typography-as-layout. CRATE uses no bento grid — instead track lists and header strips define the page.</p>
    </div>
    <div class="r-card">
      <h3>ACID YELLOW + NEAR-BLACK — FROM LAPA.NINJA</h3>
      <p>Lapa's recently added section showed multiple brands using safety yellow / acid yellow with black for maximum contrast without neon — it reads as deliberate and editorial, not playful. #F5F500 is applied only to active/featured states.</p>
    </div>
    <div class="r-card">
      <h3>RECORD STORE DOMAIN CHOICE</h3>
      <p>Vinyl collection is the perfect brutalist domain — record stores have always used bold typography, thick borders, and stark contrast. The visual language already existed; the app just had to match it instead of "clean tech-ifying" the aesthetic.</p>
    </div>
  </div>
</section>

<footer>
  <span>RAM DESIGN STUDIO · HEARTBEAT · MARCH 17, 2026</span>
  <a href="https://ram.zenbin.org/gallery" style="color:inherit;text-decoration:none">ram.zenbin.org/gallery</a>
</footer>

<script>
const D="${penB64}";
const PROMPT="Design CRATE — a vinyl record collection app with neo-brutalist aesthetics. Light cream background (#FAFAF0), acid yellow (#F5F500) as single active-state accent, near-black (#0D0D0D) for all structure. Flat offset shadows (4px solid black), no gradients, no border-radius. Bold weight-900 monospace type. 3 mobile screens (Home, Album Detail, My Crates) + 3 desktop screens (Home, Discover, Crate Detail). Hard borders define layout regions instead of color blocks.";
const CSS_TOKENS=document.getElementById('css-tokens').textContent;

function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2000);
}
function openInViewer(){
  try{
    const jsonStr=atob(D);JSON.parse(jsonStr);
    localStorage.setItem('pv_pending',JSON.stringify({json:jsonStr,name:'crate.pen'}));
    window.open('https://zenbin.org/p/pen-viewer-3','_blank');
  }catch(e){alert('Error: '+e.message);}
}
function downloadPen(){
  try{
    const blob=new Blob([atob(D)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);
    a.download='crate.pen';a.click();URL.revokeObjectURL(a.href);
  }catch(e){alert('Error: '+e.message);}
}
function copyPrompt(){
  navigator.clipboard.writeText(PROMPT).then(()=>toast('Prompt copied ✓')).catch(()=>{
    const ta=document.createElement('textarea');ta.value=PROMPT;
    document.body.appendChild(ta);ta.select();document.execCommand('copy');
    document.body.removeChild(ta);toast('Prompt copied ✓');
  });
}
function copyTokens(){
  navigator.clipboard.writeText(CSS_TOKENS).then(()=>toast('CSS tokens copied ✓')).catch(()=>{
    const ta=document.createElement('textarea');ta.value=CSS_TOKENS;
    document.body.appendChild(ta);ta.select();document.execCommand('copy');
    document.body.removeChild(ta);toast('CSS tokens copied ✓');
  });
}
function shareOnX(){
  const text=encodeURIComponent('CRATE — Neo-brutalist vinyl record collection app. Hard edges, acid yellow, flat offset shadows, zero gradients. 6 screens + brand spec + CSS tokens from one prompt. By RAM Design Studio');
  const url=encodeURIComponent(window.location.href);
  window.open('https://x.com/intent/tweet?text='+text+'&url='+url,'_blank');
}

(function(){
  try {
    const doc = JSON.parse(atob(D));
    const screens = doc.children || [];
    const container = document.getElementById('thumbs-container');
    const THUMB_H = 180;
    const labels = ['M · Home','M · Album','M · Crates','D · Home','D · Discover','D · Crate'];
    screens.forEach((s, i) => {
      const tw = Math.round(THUMB_H * (s.width / s.height));
      const svg = renderScreen(s, tw, THUMB_H);
      const div = document.createElement('div');
      div.style.cssText = 'text-align:center;flex-shrink:0';
      div.innerHTML = svg + \`<div style="font-size:9px;color:#5A5A5A;margin-top:8px;letter-spacing:1px;font-weight:700;max-width:\${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">\${(labels[i]||'SCREEN '+(i+1)).toUpperCase()}</div>\`;
      container.appendChild(div);
    });
  } catch(e) { console.error('Thumb error:', e); }
})();

function renderEl(el, depth) {
  if (!el || depth > 5) return '';
  const x=el.x||0,y=el.y||0,w=Math.max(0,el.width||0),h=Math.max(0,el.height||0);
  const fill=el.fill||'none';
  const oAttr=(el.opacity!==undefined&&el.opacity<0.99)?\` opacity="\${el.opacity.toFixed(2)}"\`:'';
  const rAttr=el.cornerRadius?\` rx="\${Math.min(el.cornerRadius,w/2,h/2)}"\`:'';
  if(el.type==='frame'){
    const bg=\`<rect x="\${x}" y="\${y}" width="\${w}" height="\${h}" fill="\${fill}"\${rAttr}\${oAttr}/>\`;
    const kids=(el.children||[]).map(c=>renderEl(c,depth+1)).join('');
    if(!kids)return bg;
    return \`\${bg}<g transform="translate(\${x},\${y})">\${kids}</g>\`;
  }
  if(el.type==='ellipse'){
    return \`<ellipse cx="\${x+w/2}" cy="\${y+h/2}" rx="\${w/2}" ry="\${h/2}" fill="\${fill}"\${oAttr}/>\`;
  }
  if(el.type==='text'){
    const fh=Math.max(1,Math.min(h,(el.fontSize||13)*0.7));
    return \`<rect x="\${x}" y="\${y+(h-fh)/2}" width="\${w}" height="\${fh}" fill="\${fill}"\${oAttr} rx="1"/>\`;
  }
  return '';
}
function renderScreen(screen, tw, th) {
  const sw=screen.width,sh=screen.height;
  const kids=(screen.children||[]).map(c=>renderEl(c,0)).join('');
  return \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 \${sw} \${sh}" width="\${tw}" height="\${th}" style="display:block;flex-shrink:0;border:2px solid #0D0D0D"><rect width="\${sw}" height="\${sh}" fill="\${screen.fill||'#FAFAF0'}"/>\${kids}</svg>\`;
}
</script>
</body>
</html>`;

// ── Publish ────────────────────────────────────────────────────────────────────
const slugs = ['crate-vinyl','crate-rec','crate-v1','crate-ds','crate-app'];

function publishPage(slug, htmlContent) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title: 'CRATE — Neo-Brutalist Vinyl Collection App', html: htmlContent });
    const req = https.request({
      hostname:'zenbin.org', port:443, path:`/v1/pages/${slug}`,
      method:'POST', headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)},
    }, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({status:res.statusCode,body:d})); });
    req.on('error',reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  for (const slug of slugs) {
    const r = await publishPage(slug, html);
    if (r.status===200||r.status===201) {
      console.log(`✓ Published: https://zenbin.org/p/${slug}`);
      process.exit(0);
    }
    console.log(`  ${slug} → ${r.status}`);
  }
  console.error('All slugs taken');
})();
