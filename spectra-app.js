/**
 * SPECTRA — Signal Intelligence for Audio Engineers
 * Trend: Neon vertical-bar data-viz (Neon Postgres on darkmodedesign.com),
 *        extreme negative space precision (Traffic Productions on godly.website)
 * Theme: DARK — near-black, mint/teal glow, warm orange accent
 */
'use strict';
const fs   = require('fs');
const path = require('path');

const W = 393, H = 852;

// Palette
const bg       = '#080B0F';   // near-black
const surface  = '#0E1318';   // dark surface
const surface2 = '#141B22';   // card surface
const surface3 = '#1C2630';   // elevated surface
const text0    = '#EAF0F7';   // near-white
const text1    = '#8FA0B2';   // muted text
const muted    = 'rgba(143,160,178,0.40)';
const divider  = 'rgba(143,160,178,0.10)';
const accent   = '#1DDBA6';   // mint/teal
const accentD  = '#0D6E52';   // dark teal
const accentG  = 'rgba(29,219,166,0.15)';
const orange   = '#FF7B42';   // warm orange
const orangeL  = 'rgba(255,123,66,0.15)';
const yellow   = '#F5D748';   // signal yellow
const red      = '#FF4466';   // clip indicator

const R = (x,y,w,h,fill,r=0,op=1,stroke,sw) =>
  ({type:'rect',x,y,width:w,height:h,fill,cornerRadius:r,opacity:op,stroke,strokeWidth:sw});
const T = (x,y,content,size,color,weight='regular',align='left',ls=0,op=1,ff='Inter') =>
  ({type:'text',x,y,content,fontSize:size,color,fontWeight:weight,textAlign:align,letterSpacing:ls,opacity:op,fontFamily:ff});
const I = (x,y,name,size,color,op=1) =>
  ({type:'icon',x,y,name,size,color,opacity:op});
const E = (x,y,r,fill,op=1,stroke,sw) =>
  ({type:'ellipse',x:x-r,y:y-r,width:r*2,height:r*2,fill,opacity:op,stroke,strokeWidth:sw});
const L = (x1,y1,x2,y2,stroke,sw=1,op=1) =>
  ({type:'line',x1,y1,x2,y2,stroke,strokeWidth:sw,opacity:op});

// ── helpers ──────────────────────────────────────────────
function pill(x,y,w,h,bg2,label,col,sz=10,weight='semibold') {
  return [R(x,y,w,h,bg2,h/2), T(x+w/2,y+h*0.68,label,sz,col,weight,'center',0.8)];
}

function statusBar() {
  return [
    R(0,0,W,44,bg),
    T(20,27,'9:41',14,text0,'semibold'),
    T(W-70,27,'●●●  WiFi  100%',11,text1,'regular','right'),
  ];
}

function bottomNav(active) {
  const tabs=[
    {id:'home',icon:'activity',lbl:'Live'},
    {id:'spectrum',icon:'chart',lbl:'Spectrum'},
    {id:'bands',icon:'layers',lbl:'Bands'},
    {id:'sessions',icon:'list',lbl:'Sessions'},
    {id:'export',icon:'share',lbl:'Export'},
  ];
  const out=[R(0,H-82,W,82,surface),L(0,H-82,W,H-82,divider)];
  const sw=W/tabs.length;
  tabs.forEach((t,i)=>{
    const cx=sw*i+sw/2;
    const isA=t.id===active;
    const col=isA?accent:text1;
    if(isA){
      // glow tab indicator
      out.push(R(sw*i+6,H-82,sw-12,2,accent,1));
      out.push(R(sw*i+6,H-82,sw-12,2,accent,1,0.3)); // blur-like
    }
    out.push(I(cx-11,H-70,t.icon,22,col));
    out.push(T(cx,H-38,t.lbl,10,col,isA?'semibold':'regular','center',0.5));
  });
  return out;
}

// draw a mini waveform
function miniWave(x,y,w,h,color='#1DDBA6',opBase=0.8) {
  const out=[];
  const pts=[0.50,0.30,0.80,0.20,0.95,0.15,0.70,0.40,0.55,0.60,0.35,0.85,0.45,0.75,0.60,0.50,0.40,0.30,0.65,0.20,0.80,0.45];
  pts.forEach((v,i)=>{
    const px=x+Math.round(i*(w/pts.length));
    const barH=Math.round(v*h);
    const py=y+Math.round((h-barH)/2);
    out.push(R(px,py,Math.max(1,Math.round(w/pts.length)-1),barH,color,1,opBase*0.7+(i%3)*0.1));
  });
  return out;
}

// vertical spectrum bars (the hero visual)
function spectrumBars(x,y,w,h,barCount=48,seed=1) {
  const out=[];
  const bw=Math.floor((w-2)/barCount);
  // frequency profile: peaks at lows and low-mids, dip in mids, rise at highs
  const freqProfile=[0.88,0.95,0.99,0.97,0.90,0.80,0.70,0.60,0.55,0.50,0.45,0.48,0.52,0.55,0.50,0.45,0.40,0.42,0.45,0.50,0.55,0.58,0.62,0.65,0.70,0.72,0.68,0.63,0.58,0.52,0.45,0.38,0.32,0.28,0.24,0.20,0.18,0.16,0.14,0.18,0.22,0.19,0.16,0.13,0.10,0.08,0.06,0.05];
  out.push(R(x,y,w,h,bg,0,1)); // base bg
  freqProfile.slice(0,barCount).forEach((v,i)=>{
    const noise=(((i*seed*7+13)%17)/17)*0.12;
    const amp=Math.min(1,v+noise);
    const barH=Math.round(amp*h*0.92);
    const bx=x+i*(bw+1);
    const by=y+h-barH;
    // gradient-like: use multiple opacity layers
    const isHot=i<4&&amp>0.85;
    const col=isHot?red:i<12?orange:accent;
    out.push(R(bx,by,bw,barH,col,1,0.15)); // glow shadow
    out.push(R(bx,by+2,bw,barH-2,col,1,0.70));
    // peak dot
    out.push(R(bx,by,bw,2,col,1,1.0));
  });
  // horizontal grid lines
  [0.25,0.50,0.75].forEach(frac=>{
    out.push(L(x,y+h*frac,x+w,y+h*frac,divider,1,0.5));
  });
  return out;
}

// EQ band node
function eqNode(cx,cy,color,label,db) {
  const out=[];
  out.push(E(cx,cy,18,color,0.15));
  out.push(E(cx,cy,10,color,0.3));
  out.push(E(cx,cy,6,color,1.0));
  out.push(T(cx,cy-22,label,9,text1,'medium','center'));
  out.push(T(cx,cy+30,db,10,color,'semibold','center'));
  return out;
}

// ── Screen 1: LIVE DASHBOARD ────────────────────────────
function s1() {
  const e=[R(0,0,W,H,bg),...statusBar()];

  // header
  e.push(R(0,44,W,60,bg));
  e.push(T(20,68,'SPECTRA',20,text0,'bold','left',3));
  e.push(T(20,88,'Signal Intelligence',12,text1));
  // recording badge
  e.push(...pill(W-90,60,70,22,red+'33','● REC',red,11,'bold'));

  // Level meters — two channels
  e.push(T(20,120,'INPUT LEVELS',10,text1,'semibold','left',1.5));
  const meterW=W-40; const meterH=14; const meterY=134;
  // Channel L
  e.push(T(20,meterY-2,'L',9,text1,'bold'));
  e.push(R(30,meterY,meterW-10,meterH,surface2,4));
  e.push(R(30,meterY,Math.round((meterW-10)*0.82),meterH,accent,4));
  e.push(R(30,meterY,Math.round((meterW-10)*0.82),meterH,accent,4,0.3));
  // Channel R
  e.push(T(20,meterY+22,'R',9,text1,'bold'));
  e.push(R(30,meterY+20,meterW-10,meterH,surface2,4));
  e.push(R(30,meterY+20,Math.round((meterW-10)*0.78),meterH,accent,4));
  e.push(R(30,meterY+20,Math.round((meterW-10)*0.78),meterH,accent,4,0.3));
  // clip markers
  e.push(R(30+Math.round((meterW-10)*0.90),meterY-2,2,meterH*2+4,text1,0,0.3));
  e.push(T(30+Math.round((meterW-10)*0.90)+4,meterY,'-6',8,text1,'regular','left',0,0.5));

  // Waveform display
  e.push(T(20,178,'WAVEFORM',10,text1,'semibold','left',1.5));
  e.push(R(20,192,W-40,80,surface2,10));
  e.push(...miniWave(28,204,W-56,56,accent,0.9));

  // Stats row
  const stats=[
    {label:'SAMPLE RATE',val:'48kHz',unit:''},
    {label:'BIT DEPTH',val:'24',unit:'bit'},
    {label:'LUFS',val:'-14.2',unit:''},
    {label:'PEAK',val:'-1.8',unit:'dBFS'},
  ];
  const sw2=(W-40)/4;
  e.push(R(20,284,W-40,72,surface2,10));
  stats.forEach((s,i)=>{
    const sx=20+i*sw2+sw2/2;
    if(i>0) e.push(L(20+i*sw2,292,20+i*sw2,348,divider));
    e.push(T(sx,300,s.label,8,text1,'semibold','center',1));
    e.push(T(sx,320,s.val,18,text0,'bold','center'));
    e.push(T(sx,342,s.unit||'—',9,text1,'regular','center',0,0.5));
  });

  // Spectrum mini preview
  e.push(T(20,372,'SPECTRUM PREVIEW',10,text1,'semibold','left',1.5));
  e.push(R(20,386,W-40,110,surface2,10));
  e.push(...spectrumBars(26,392,W-52,98,40,3));

  // EQ curve indicator chips
  e.push(T(20,514,'ACTIVE PRESET',10,text1,'semibold','left',1.5));
  e.push(R(20,528,W-40,56,surface2,10));
  e.push(I(36,548,'star',18,accent));
  e.push(T(62,552,'Broadcast Mastering',14,text0,'semibold'));
  e.push(T(62,570,'High Shelf +2dB · Low Cut 60Hz',11,text1));
  e.push(I(W-36,550,'chevron-right',20,text1));

  // Time
  e.push(T(20,606,'SESSION TIME',10,text1,'semibold','left',1.5));
  e.push(T(20,622,'1:24:37',32,text0,'bold','left',-1));
  e.push(T(W-100,630,'Since 08:17',12,text1,'regular','right'));

  // Transport controls
  e.push(R(20,672,W-40,64,surface2,14));
  const btnW=52, btnH=36;
  // Stop
  e.push(R(32,690,btnW,btnH,surface3,10));
  e.push(I(32+btnW/2-10,690+8,'check',20,text1));
  // Pause
  e.push(R(32+btnW+12,690,btnW,btnH,surface3,10));
  e.push(I(32+btnW+12+btnW/2-10,690+8,'play',20,text1));
  // Record — active
  e.push(R(32+(btnW+12)*2,690,btnW+20,btnH,red,12));
  e.push(I(32+(btnW+12)*2+10,690+8,'activity',20,'#FFF'));
  e.push(T(32+(btnW+12)*2+30,690+13,'REC',11,'#FFF','bold'));
  // Monitor toggle
  e.push(R(32+(btnW+12)*2+btnW+20+12,690,btnW+8,btnH,accentG,10,1,accent,1));
  e.push(I(32+(btnW+12)*2+btnW+20+16,690+8,'eye',20,accent));
  e.push(T(32+(btnW+12)*2+btnW+20+28,690+13,'MON',10,accent,'bold'));

  e.push(...bottomNav('home'));
  return {name:'Live Dashboard',elements:e};
}

// ── Screen 2: SPECTRUM ANALYZER ──────────────────────────
function s2() {
  const e=[R(0,0,W,H,bg),...statusBar()];

  // Header
  e.push(R(0,44,W,50,bg));
  e.push(T(20,68,'Spectrum',18,text0,'bold'));
  e.push(T(20,88,'FFT Analysis · Real-Time',11,text1));
  // mode chips
  [['FFT',true],['1/3 Oct',false],['RTA',false]].forEach(([lbl,act],i)=>{
    const bx=W-170+i*54;
    e.push(...pill(bx,62,48,22,act?accentD:surface2,lbl,act?accent:text1,10));
  });

  // Main spectrum — the hero visualization
  e.push(T(20,106,'20Hz',9,text1,'regular','left',0,0.6));
  e.push(T(W/2-16,106,'1kHz',9,text1,'regular','center',0,0.6));
  e.push(T(W-42,106,'20kHz',9,text1,'regular','right',0,0.6));

  e.push(R(20,118,W-40,240,surface,8,1,'rgba(29,219,166,0.08)',1));
  e.push(...spectrumBars(20,118,W-40,240,56,7));

  // dB scale
  [-6,-12,-18,-24,-36,-48].forEach((db,i)=>{
    const ty=118+Math.round((Math.abs(db)/54)*240);
    e.push(L(20,ty,W-20,ty,divider,1,0.4));
    e.push(T(14,ty+3,String(db),8,text1,'regular','right',0,0.5));
  });

  // Frequency info panel
  e.push(R(20,370,W-40,80,surface2,10));
  e.push(T(36,386,'PEAK FREQUENCY',9,text1,'semibold','left',1.5));
  e.push(T(36,405,'82 Hz',28,text0,'bold'));
  e.push(T(36,433,'+3.2 dB from baseline',11,text1));
  e.push(L(W/2,378,W/2,442,divider));
  e.push(T(W/2+16,386,'HARMONIC',9,text1,'semibold','left',1.5));
  e.push(T(W/2+16,405,'164 Hz',28,text0,'bold'));
  e.push(T(W/2+16,433,'2nd · -8.4 dB',11,text1));

  // Frequency band labels
  const bands=[
    {label:'SUB',hz:'20-60',col:orange},
    {label:'BASS',hz:'60-250',col:orange},
    {label:'LOW MID',hz:'250-2k',col:yellow},
    {label:'MID',hz:'2k-6k',col:yellow},
    {label:'HIGH',hz:'6k-20k',col:accent},
  ];
  e.push(T(20,466,'FREQUENCY BANDS',10,text1,'semibold','left',1.5));
  const bw3=(W-40-16)/5;
  bands.forEach((b,i)=>{
    const bx=20+i*(bw3+4);
    e.push(R(bx,480,bw3,52,surface2,8));
    e.push(R(bx,480,bw3,3,b.col,2));
    e.push(T(bx+bw3/2,494,b.label,9,b.col,'bold','center',0.5));
    e.push(T(bx+bw3/2,510,b.hz,8,text1,'regular','center',0,0.7));
  });

  // Averaging control
  e.push(R(20,548,W-40,48,surface2,10));
  e.push(T(32,564,'AVERAGING',10,text1,'semibold','left',1.5));
  e.push(T(32,580,'Fast',11,text0));
  const sliderW=W-220;
  e.push(R(120,570,sliderW,4,surface3,2));
  e.push(R(120,570,Math.round(sliderW*0.3),4,accent,2));
  e.push(E(120+Math.round(sliderW*0.3),572,7,accent));
  e.push(T(W-62,564,'Slow',11,text0,'regular','right'));

  // Freeze toggle
  e.push(R(20,608,W-40,48,surface2,10));
  e.push(I(36,621,'eye',20,accent));
  e.push(T(64,634,'Freeze Analysis',14,text0,'semibold'));
  e.push(R(W-72,616,48,28,accentD,14,1,accent,1));
  e.push(T(W-50,630,'ON',12,accent,'bold','center'));

  e.push(...bottomNav('spectrum'));
  return {name:'Spectrum Analyzer',elements:e};
}

// ── Screen 3: PARAMETRIC EQ ──────────────────────────────
function s3() {
  const e=[R(0,0,W,H,bg),...statusBar()];

  // Header
  e.push(R(0,44,W,50,bg));
  e.push(T(20,68,'Bands',18,text0,'bold'));
  e.push(T(20,88,'Parametric EQ · 5 Band',11,text1));
  e.push(...pill(W-84,60,72,22,surface2,'Reset All',text1,10));

  // EQ display canvas
  e.push(R(20,104,W-40,220,surface,8,1,'rgba(29,219,166,0.06)',1));
  // grid lines — frequency
  [60,250,1000,4000,12000].forEach((freq,i)=>{
    const px=20+Math.round((Math.log10(freq)-Math.log10(20))/(Math.log10(20000)-Math.log10(20))*(W-40));
    e.push(L(px,104,px,324,divider,1,0.5));
    e.push(T(px,106,freq>=1000?`${freq/1000}k`:String(freq),8,text1,'regular','center',0,0.5));
  });
  // zero line
  e.push(L(20,214,W-20,214,divider,1,1.0));
  e.push(T(14,217,'0',8,text1,'regular','right',0,0.7));
  // dB grid
  [-12,-6,6,12].forEach(db=>{
    const py=214-db*5;
    e.push(L(20,py,W-20,py,divider,1,0.3));
    e.push(T(14,py+3,String(db),7,text1,'regular','right',0,0.4));
  });

  // EQ curve — drawn as connected line segments
  const eqCurveY=[214,214,214,200,190,182,198,210,214,208,200,190,185,190,195,200,208,214,218,222,218,214,210,214];
  for(let i=0;i<eqCurveY.length-1;i++){
    const x1=20+i*Math.round((W-40)/(eqCurveY.length-1));
    const x2=20+(i+1)*Math.round((W-40)/(eqCurveY.length-1));
    e.push(L(x1,eqCurveY[i],x2,eqCurveY[i+1],accent,2));
  }
  // fill under curve hint
  e.push(R(20,214,W-40,110,accentG,0,0.5));

  // EQ band nodes
  const nodes=[
    {cx:50,cy:214,col:orange,label:'LCut',db:'60Hz'},
    {cx:100,cy:202,col:orange,label:'LShelf',db:'+3.0'},
    {cx:196,cy:186,col:yellow,label:'Band 1',db:'+4.5'},
    {cx:280,cy:194,col:accent,label:'Band 2',db:'-2.0'},
    {cx:340,cy:218,col:accent,label:'HShelf',db:'-1.5'},
  ];
  nodes.forEach(n=>e.push(...eqNode(n.cx,n.cy,n.col,n.label,n.db)));

  // Band detail cards
  e.push(T(20,340,'BAND DETAIL',10,text1,'semibold','left',1.5));
  const bandCards=[
    {label:'LOW CUT',freq:'60 Hz',q:'0.70',gain:'—',col:orange},
    {label:'BAND 1',freq:'280 Hz',q:'1.20',gain:'+4.5 dB',col:yellow},
    {label:'BAND 2',freq:'3.8 kHz',q:'0.90',gain:'-2.0 dB',col:accent},
  ];
  bandCards.forEach((bc,i)=>{
    const by=354+i*86;
    e.push(R(20,by,W-40,78,surface2,10));
    e.push(R(20,by,4,78,bc.col,2));
    e.push(T(36,by+14,bc.label,10,bc.col,'bold','left',1.5));
    // freq
    e.push(T(36,by+32,'FREQ',8,text1,'semibold','left',1));
    e.push(T(36,by+46,bc.freq,14,text0,'bold'));
    // q
    e.push(T(120,by+32,'Q',8,text1,'semibold','left',1));
    e.push(T(120,by+46,bc.q,14,text0,'bold'));
    // gain
    e.push(T(196,by+32,'GAIN',8,text1,'semibold','left',1));
    e.push(T(196,by+46,bc.gain,14,text0,'bold'));
    // enabled toggle
    e.push(R(W-70,by+24,44,26,bc.col+'33',13,1,bc.col,1));
    e.push(T(W-50,by+37,'ON',11,bc.col,'bold','center'));
  });

  e.push(...bottomNav('bands'));
  return {name:'Parametric EQ Bands',elements:e};
}

// ── Screen 4: SESSION HISTORY ─────────────────────────────
function s4() {
  const e=[R(0,0,W,H,bg),...statusBar()];

  // Header
  e.push(R(0,44,W,50,bg));
  e.push(T(20,68,'Sessions',18,text0,'bold'));
  e.push(T(20,88,'12 recordings this month',11,text1));

  // Summary stats strip
  e.push(R(20,104,W-40,64,surface2,12));
  const ss=[{l:'TOTAL',v:'38h 14m'},{l:'AVG LENGTH',v:'3h 11m'},{l:'PROJECTS',v:'7'}];
  const sw3=(W-40)/3;
  ss.forEach((s,i)=>{
    const sx=20+i*sw3+sw3/2;
    if(i>0) e.push(L(20+i*sw3,112,20+i*sw3,160,divider));
    e.push(T(sx,120,s.l,8,text1,'semibold','center',1.5));
    e.push(T(sx,140,s.v,16,text0,'bold','center'));
  });

  // Session list
  e.push(T(20,186,'RECENT',10,text1,'semibold','left',1.5));
  const sessions=[
    {title:'Broadcast Mix · Final',date:'Today, 09:41',dur:'1:24',lufs:'-14.2',col:red,badge:'REC'},
    {title:'Podcast Ep.47 Edit',date:'Yesterday, 14:30',dur:'2:08',lufs:'-16.0',col:accent,badge:'DONE'},
    {title:'Ambient Session A',date:'Mar 29, 11:05',dur:'0:45',lufs:'-18.3',col:yellow,badge:'DONE'},
    {title:'Interview Cleanup',date:'Mar 28, 16:22',dur:'1:12',lufs:'-15.8',col:accent,badge:'DONE'},
    {title:'Sound Design FX',date:'Mar 27, 10:00',dur:'3:30',lufs:'-20.1',col:orange,badge:'DONE'},
  ];
  sessions.forEach((s,i)=>{
    const sy=200+i*92;
    e.push(R(20,sy,W-40,82,surface2,10));
    // color bar left edge
    e.push(R(20,sy,4,82,s.col,2));
    e.push(...pill(W-76,sy+10,60,20,s.col+'33',s.badge,s.col,9,'bold'));
    e.push(T(36,sy+16,s.title,14,text0,'semibold'));
    e.push(T(36,sy+34,s.date,11,text1));
    // waveform mini
    e.push(...miniWave(36,sy+50,Math.round(W*0.55),22,s.col,0.6));
    // duration
    e.push(T(W-36,sy+44,s.dur,16,text0,'bold','right'));
    e.push(T(W-36,sy+64,s.lufs+' LUFS',10,text1,'regular','right'));
  });

  e.push(...bottomNav('sessions'));
  return {name:'Session History',elements:e};
}

// ── Screen 5: EXPORT & SHARE ──────────────────────────────
function s5() {
  const e=[R(0,0,W,H,bg),...statusBar()];

  // Header
  e.push(R(0,44,W,50,bg));
  e.push(T(20,68,'Export',18,text0,'bold'));
  e.push(T(20,88,'Render & deliver',11,text1));

  // Session summary card
  e.push(R(20,104,W-40,88,surface2,12));
  e.push(R(20,104,W-40,4,accent,2)); // top accent stripe
  e.push(T(36,122,'Broadcast Mix · Final',16,text0,'bold'));
  e.push(T(36,142,'Today · 1 hr 24 min',12,text1));
  e.push(T(36,162,'-14.2 LUFS  ·  -1.8 dBFS peak  ·  48kHz/24bit',10,text1,'regular','left',0,0.8));
  // waveform on right
  e.push(...miniWave(W-106,120,80,44,accent,0.7));

  // Format selection
  e.push(T(20,208,'FORMAT',10,text1,'semibold','left',1.5));
  const fmts=[
    {fmt:'WAV',desc:'Lossless  ·  ~500MB',active:true},
    {fmt:'FLAC',desc:'Compressed  ·  ~280MB',active:false},
    {fmt:'MP3',desc:'Lossy  ·  ~12MB',active:false},
    {fmt:'AAC',desc:'Lossy  ·  ~10MB',active:false},
  ];
  fmts.forEach((f,i)=>{
    const fy=222+i*56;
    e.push(R(20,fy,W-40,48,f.active?surface3:surface2,10,1,f.active?accent:'transparent',f.active?1:0));
    e.push(T(36,fy+14,f.fmt,14,f.active?accent:text0,'bold'));
    e.push(T(36,fy+30,f.desc,11,text1));
    // radio
    e.push(E(W-34,fy+24,9,f.active?accentD:surface3));
    if(f.active) e.push(E(W-34,fy+24,5,accent));
  });

  // Sample rate
  e.push(T(20,452,'SAMPLE RATE',10,text1,'semibold','left',1.5));
  e.push(R(20,466,W-40,44,surface2,10));
  const rates=['44.1kHz','48kHz','88.2kHz','96kHz'];
  const rw=(W-48)/4;
  rates.forEach((r,i)=>{
    const rx=24+i*(rw+2);
    const isA=(r==='48kHz');
    e.push(R(rx,470,rw,36,isA?accentD:surface3,8,1,isA?accent:'transparent',isA?1:0));
    e.push(T(rx+rw/2,488,r,11,isA?accent:text1,'semibold','center',0));
  });

  // Destination
  e.push(T(20,524,'SEND TO',10,text1,'semibold','left',1.5));
  const dests=[
    {icon:'share',label:'Files / Downloads'},
    {icon:'message',label:'Share Link — 7 days'},
  ];
  dests.forEach((d,i)=>{
    const dy=538+i*58;
    e.push(R(20,dy,W-40,50,surface2,10));
    e.push(I(36,dy+15,d.icon,22,accent));
    e.push(T(68,dy+25,d.label,14,text0,'semibold'));
    e.push(I(W-36,dy+16,i===0?'check':'arrow-right',20,i===0?accent:text1));
  });

  // Export CTA
  e.push(R(20,666,W-40,60,accent,16));
  e.push(E(W*0.3,696,40,'rgba(0,0,0,0.12)'));
  e.push(T(W/2,693,'Export Now',18,'#030609','bold','center'));
  e.push(T(W/2,713,'WAV · 48kHz · ~500MB',11,'rgba(3,6,9,0.60)','regular','center'));

  e.push(...bottomNav('export'));
  return {name:'Export & Share',elements:e};
}

// ── Assemble .pen ─────────────────────────────────────────
const screens = [s1(), s2(), s3(), s4(), s5()];

const pen = {
  version: '2.8',
  meta: {
    name: 'Spectra',
    description: 'Signal intelligence for audio engineers. Inspired by Neon Postgres vertical-bar data-viz (darkmodedesign.com) + extreme-space minimalism (Traffic Productions, godly.website). Dark precision instrument UI.',
    theme: 'dark',
    created: new Date().toISOString(),
    author: 'RAM Design Heartbeat',
  },
  canvas: { width: W, height: H, background: bg },
  screens: screens.map((s, i) => ({
    id:       `screen${i+1}`,
    name:     s.name,
    width:    W,
    height:   H,
    background: bg,
    elements: s.elements,
  })),
};

const outPath = path.join(__dirname, 'spectra.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ spectra.pen written — ${screens.length} screens, ${
  screens.reduce((a,s)=>a+s.elements.length,0)
} elements`);
