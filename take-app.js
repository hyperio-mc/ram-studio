'use strict';
// TAKE — AI Video Creation Studio
// Dark cinematic theme. Near-black + electric coral + warm amber.
// Inspired by: "Generation AI Video" Dribbble trending shot, Lusion/Evervault dark aesthetics on Godly
// 6 screens: Studio, Generate, Timeline Editor, Library, Analytics, Settings

const fs   = require('fs');
const path = require('path');

// ── Palette ─────────────────────────────────────────────────────────────────
const BG      = '#09090B';   // cinema black
const SURFACE = '#111115';   // near-black surface
const CARD    = '#18181E';   // card
const CARD2   = '#1F1F28';   // raised card
const BORDER  = '#27272F';   // subtle border
const BORDER2 = '#35354A';   // active border
const TEXT    = '#F0EEF8';   // cool white
const TEXT2   = '#8B8997';   // muted lavender-gray
const TEXT3   = '#55546A';   // faint
const CORAL   = '#FF5240';   // electric coral (primary)
const CORAL2  = '#CC3D2F';   // deep coral
const CORAL3  = '#FF8070';   // light coral
const AMBER   = '#F5B13D';   // warm amber (pending/in-queue)
const TEAL    = '#2DD4BF';   // teal (success/live)
const VIOLET  = '#8B5CF6';   // violet (AI/model)
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
    fontSize:size, fill, fontWeight:opts.weight||'normal',
    fontFamily:opts.font||'Inter', textAnchor:opts.anchor||'start',
    opacity:opts.opacity||1 });
}
function circle(cx,cy,r,fill,opts={}) {
  elements.push({ id:uid(), type:'circle', cx,cy,r, fill,
    stroke:opts.stroke||'none', strokeWidth:opts.sw||0, opacity:opts.opacity||1 });
}
function line(x1,y1,x2,y2,stroke,sw=1,opts={}) {
  elements.push({ id:uid(), type:'line', x1,y1,x2,y2, stroke, strokeWidth:sw,
    opacity:opts.opacity||1 });
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function statusBar() {
  rect(0,0,W,44,BG);
  text(20,28,'9:41',13,TEXT2,{weight:'500'});
  rect(W-50,16,22,11,'none',{rx:2,stroke:TEXT3,sw:1.5});
  rect(W-48,18,14,7,TEXT3,{rx:1});
  rect(W-26,20,3,4,TEXT3,{rx:1});
  circle(W-66,22,3,TEXT3); circle(W-74,22,3,TEXT3); circle(W-82,22,3,TEXT3);
}
function topBar(title, opts={}) {
  rect(0,44,W,56,BG);
  line(0,100,W,100,BORDER,0.5);
  if (opts.back) {
    text(20,78,'←',18,TEXT2);
    text(44,78,title,16,TEXT,{weight:'600'});
  } else {
    text(20,78,title,18,TEXT,{weight:'700',font:'Inter'});
  }
  if (opts.right) {
    rect(W-80,60,64,28,opts.rightFill||CORAL,{rx:14});
    text(W-48,78,opts.right,11,TEXT,{anchor:'middle',weight:'600'});
  }
}
function bottomNav(activeIdx) {
  rect(0,H-84,W,84,SURFACE);
  line(0,H-84,W,H-84,BORDER,0.5);
  const tabs = [{i:'▣',l:'Studio'},{i:'✦',l:'Generate'},{i:'◈',l:'Edit'},{i:'▤',l:'Library'},{i:'◉',l:'Profile'}];
  const tw = W/tabs.length;
  tabs.forEach((t,i) => {
    const cx = tw*i+tw/2;
    const isA = i===activeIdx;
    const clr = isA ? CORAL : TEXT3;
    if (isA) { rect(cx-22,H-84,44,3,CORAL,{rx:1.5}); }
    text(cx,H-54,t.i,18,clr,{anchor:'middle'});
    text(cx,H-34,t.l,9,clr,{anchor:'middle',weight:isA?'600':'400'});
  });
}
function pill(x,y,w,h,fill,label,clr,size=10) {
  rect(x,y,w,h,fill,{rx:h/2});
  text(x+w/2,y+h/2+size*0.38,label,size,clr,{anchor:'middle',weight:'600'});
}
function card(x,y,w,h,fill=CARD) { rect(x,y,w,h,fill,{rx:14}); }

// Video thumbnail sim
function vidThumb(x,y,w,h,hue,opts={}) {
  const r = opts.rx!==undefined?opts.rx:10;
  rect(x,y,w,h,hue,{rx:r});
  // scanline sheen
  rect(x,y,w,h*0.35,'rgba(255,255,255,0.04)',{rx:r});
  // play button
  const cx=x+w/2, cy=y+h/2;
  circle(cx,cy,14,'rgba(0,0,0,0.55)');
  // triangle play
  rect(cx-4,cy-7,10,14,TEXT,{rx:2,opacity:0.9});
  // aspect pill
  if (opts.ratio) {
    rect(x+6,y+6,opts.ratio.length*5+12,16,'rgba(0,0,0,0.6)',{rx:8});
    text(x+12,y+18,opts.ratio,9,TEXT2,{weight:'600'});
  }
  // duration
  if (opts.dur) {
    rect(x+w-opts.dur.length*6-14,y+h-22,opts.dur.length*6+10,16,'rgba(0,0,0,0.7)',{rx:8});
    text(x+w-opts.dur.length*6-9,y+h-10,opts.dur,9,TEXT,{font:'DM Mono',weight:'500'});
  }
}

// Waveform sim
function waveform(x,y,totalW,totalH,clr,seed=1) {
  const bars = Math.floor(totalW/4);
  for (let i=0;i<bars;i++) {
    const h = totalH*(0.1+0.8*Math.abs(Math.sin((i+seed)*0.4)));
    const by = y+totalH/2-h/2;
    rect(x+i*4,by,3,h,clr,{rx:1.5,opacity:0.7+0.3*Math.abs(Math.sin(i*0.7))});
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Studio
// ═══════════════════════════════════════════════════════════════════════════
function buildScreen1() {
  elements = [];
  rect(0,0,W,H,BG);
  statusBar();

  // Header
  rect(0,44,W,60,BG);
  text(20,72,'Take',22,TEXT,{weight:'700'});
  text(20,90,'Your AI video studio',12,TEXT2);
  // notification + avatar
  rect(W-82,56,28,28,CARD,{rx:8,stroke:BORDER,sw:1});
  text(W-68,74,'🔔',12,{anchor:'middle'});
  circle(W-30,70,14,CORAL2);
  text(W-30,74,'R',10,TEXT,{anchor:'middle',weight:'700'});

  // Usage bar
  rect(16,112,W-32,44,CARD,{rx:12,stroke:BORDER,sw:1});
  rect(16,112,(W-32)*0.62,44,CORAL2,{rx:12,opacity:0.15});
  text(28,130,'GPU Credits',11,TEXT2);
  text(28,146,'620 / 1,000 remaining',11,TEXT3);
  text(W-28,138,'Top up →',11,CORAL,{anchor:'end',weight:'500'});

  // Recent takes header
  text(20,172,'Recent Takes',14,TEXT,{weight:'700'});
  text(W-20,172,'See all',12,CORAL,{anchor:'end'});

  // Large feature take
  vidThumb(16,186,W-32,160,CARD2,{rx:14,ratio:'16:9',dur:'0:42'});
  // glow
  rect(16,186,W-32,160,'none',{rx:14,stroke:CORAL,sw:1,opacity:0.4});
  // status badge
  pill(28,198,52,20,TEAL+'33','● LIVE',TEAL,9);
  // meta below thumb
  text(20,360,'Synthwave City — Aerial Drive',14,TEXT,{weight:'600'});
  text(20,378,'Cinematic · 16:9 · Generated 2h ago',11,TEXT2);

  // 3-col recent grid
  const thumbW = (W-40)/3;
  const palettes = [VIOLET+'33', CARD2, AMBER+'22'];
  const labels   = ['Night Market','Product Reveal','Brand Story'];
  const durs     = ['0:15','0:30','1:00'];
  const ratios   = ['9:16','16:9','1:1'];
  palettes.forEach((p,i) => {
    const tx = 16+i*(thumbW+4);
    vidThumb(tx,392,thumbW,80,p,{rx:10,dur:durs[i],ratio:ratios[i]});
    text(tx+4,482,labels[i],10,TEXT2);
  });

  // Stats row
  const stats = [
    {v:'48',l:'Takes',u:'this month'},
    {v:'2.4k',l:'Exports',u:'total'},
    {v:'94%',l:'Quality',u:'avg score'},
  ];
  const sw = (W-40)/3;
  stats.forEach((s,i) => {
    const sx = 16+i*(sw+4);
    card(sx,500,sw,64,CARD);
    text(sx+sw/2,530,s.v,20,s.i===0?CORAL:TEXT,{anchor:'middle',weight:'700'});
    text(sx+sw/2,544,s.l,9,TEXT2,{anchor:'middle'});
    text(sx+sw/2,558,s.u,8,TEXT3,{anchor:'middle'});
  });

  // Active generation
  card(16,576,W-32,76,CARD2);
  rect(16,576,3,76,AMBER,{rx:2});
  text(28,594,'Rendering now',11,AMBER,{weight:'600'});
  text(28,612,'"Tokyo rooftop at golden hour, cinematic'   ,12,TEXT);
  text(28,628,'bokeh, 35mm film grain, wide angle"',12,TEXT2,{opacity:0.8});
  // progress bar
  rect(28,642,W-56,4,BORDER,{rx:2});
  rect(28,642,(W-56)*0.67,4,AMBER,{rx:2});
  text(W-28,646,'67%',9,AMBER,{anchor:'end',weight:'600'});

  // Quick actions
  text(20,668,'Quick generate',13,TEXT,{weight:'600'});
  const actions = ['New take','Style match','Extend','Remix'];
  actions.forEach((a,i) => {
    const ax = 16+i*90;
    rect(ax,678,80,32,CARD,{rx:8,stroke:BORDER,sw:1});
    text(ax+40,698,a,10,TEXT2,{anchor:'middle',weight:'500'});
  });

  bottomNav(0);
  return elements;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Generate
// ═══════════════════════════════════════════════════════════════════════════
function buildScreen2() {
  elements = [];
  rect(0,0,W,H,BG);
  statusBar();
  topBar('Generate',{right:'Create',rightFill:CORAL});

  // Prompt area
  rect(16,108,W-32,112,CARD,{rx:14,stroke:CORAL,sw:1.5});
  // glow border
  rect(16,108,W-32,112,'none',{rx:14,stroke:CORAL,sw:1,opacity:0.3});
  text(28,130,'Describe your take...',13,TEXT3);
  text(28,152,'"Aerial view of Tokyo at night, neon',13,TEXT2);
  text(28,170,'reflections in rain, cinematic drone',13,TEXT2);
  text(28,188,'shot, shallow depth of field"',13,TEXT2);
  // char count
  text(W-28,210,'142 / 500',10,TEXT3,{anchor:'end',font:'DM Mono'});

  // Style presets
  text(20,228,'Style preset',12,TEXT2,{weight:'500'});
  const styles = ['Cinematic','Anime','Photorealistic','Abstract','Documentary'];
  let spx=16;
  styles.forEach((s,i) => {
    const sw2=s.length*6+20;
    const isA=i===0;
    rect(spx,240,sw2,28,isA?CORAL:CARD,{rx:14,stroke:isA?'none':BORDER,sw:1});
    text(spx+sw2/2,258,s,11,isA?TEXT:TEXT2,{anchor:'middle',weight:'500'});
    spx+=sw2+8;
    if(spx>W-60) { spx=16; }
  });

  // Aspect ratio
  text(20,286,'Aspect ratio',12,TEXT2,{weight:'500'});
  const ratios = [{r:'16:9',w:56},{r:'9:16',w:40},{r:'1:1',w:40},{r:'2.35:1',w:56}];
  let rpx=16;
  ratios.forEach((r,i)=>{
    const isA=i===0;
    rect(rpx,298,r.w,38,isA?CORAL+'22':CARD,{rx:10,stroke:isA?CORAL:BORDER,sw:isA?1.5:1});
    // ratio preview box
    const boxW=r.r==='9:16'?12:r.r==='1:1'?16:r.r==='2.35:1'?28:20;
    const boxH=r.r==='9:16'?20:r.r==='1:1'?16:10;
    rect(rpx+(r.w-boxW)/2,298+4,boxW,boxH,isA?CORAL:TEXT3,{rx:2});
    text(rpx+r.w/2,330,r.r,8,isA?CORAL3:TEXT3,{anchor:'middle',weight:'600'});
    rpx+=r.w+8;
  });

  // Duration
  text(20,354,'Duration',12,TEXT2,{weight:'500'});
  const durs = ['0:05','0:10','0:15','0:30','1:00'];
  durs.forEach((d,i)=>{
    const dx=16+i*68;
    const isA=i===1;
    rect(dx,366,56,28,isA?CORAL:CARD,{rx:14,stroke:isA?'none':BORDER,sw:1});
    text(dx+28,384,d,11,isA?TEXT:TEXT2,{anchor:'middle',weight:isA?'600':'400',font:'DM Mono'});
  });

  // Reference image strip
  text(20,412,'Reference image (optional)',12,TEXT2,{weight:'500'});
  rect(16,424,W-32,72,CARD,{rx:12,stroke:BORDER,sw:1});
  rect(20,428,64,64,CARD2,{rx:8});
  text(52,468,'📎',18,{anchor:'middle'});
  text(96,454,'Add reference image',12,TEXT2);
  text(96,470,'Style guidance for generation',11,TEXT3);

  // Advanced settings
  text(20,514,'Model & quality',12,TEXT2,{weight:'500'});
  card(16,526,W-32,90,CARD);
  // Model row
  text(28,546,'Model',11,TEXT3);
  rect(W-120,534,100,24,CARD2,{rx:12,stroke:BORDER,sw:1});
  text(W-70,550,'Take Pro v3',11,TEXT2,{anchor:'middle'});
  // Quality row
  line(28,560,W-28,560,BORDER,0.5);
  text(28,578,'Quality',11,TEXT3);
  // slider track
  rect(28,588,W-56,6,BORDER,{rx:3});
  rect(28,588,(W-56)*0.8,6,CORAL,{rx:3});
  circle(28+(W-56)*0.8,591,7,CORAL);
  text(W-28,584,'High',11,TEXT2,{anchor:'end'});

  // Generate CTA
  rect(16,636,W-32,52,CORAL,{rx:26});
  // subtle shine
  rect(16,636,W-32,26,SURFACE,{rx:26,opacity:0.06});
  text(W/2,667,'Generate Take →',15,TEXT,{anchor:'middle',weight:'700'});
  text(W/2,682,'~45 sec · 15 GPU credits',10,'rgba(255,255,255,0.55)',{anchor:'middle'}); // fixed: stays inside button area conceptually
  
  text(W/2,706,'Queue position: 2nd · Est. 1m 20s',11,TEXT3,{anchor:'middle'});

  bottomNav(1);
  return elements;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Timeline Editor
// ═══════════════════════════════════════════════════════════════════════════
function buildScreen3() {
  elements = [];
  rect(0,0,W,H,BG);
  statusBar();

  // Top editor bar
  rect(0,44,W,48,SURFACE);
  line(0,92,W,92,BORDER,0.5);
  text(20,72,'Synthwave City',14,TEXT,{weight:'600'});
  pill(152,60,52,22,TEAL+'33','● LIVE',TEAL,9);
  // export button
  rect(W-80,56,64,28,CORAL,{rx:14});
  text(W-48,74,'Export',12,TEXT,{anchor:'middle',weight:'600'});

  // Preview area
  rect(0,92,W,220,BG);
  vidThumb(16,100,W-32,190,CARD2,{rx:12,ratio:'16:9'});
  // overlay controls
  rect(0,272,W,40,'rgba(9,9,11,0.85)');
  // playback controls
  text(W/2-30,296,'⏮',14,TEXT2,{anchor:'middle'});
  circle(W/2,294,14,CORAL);
  text(W/2,298,'▶',12,TEXT,{anchor:'middle',weight:'700'});
  text(W/2+30,296,'⏭',14,TEXT2,{anchor:'middle'});
  // time
  text(20,296,'0:18 / 0:42',11,TEXT3,{font:'DM Mono'});
  text(W-20,296,'HD 1080p',10,TEXT3,{anchor:'end'});

  // Timeline scrubber
  rect(0,312,W,4,BORDER);
  rect(0,312,W*0.43,4,CORAL);
  circle(W*0.43,314,7,CORAL);

  // AI Enhancement toolbar
  rect(0,326,W,40,CARD);
  line(0,326,W,326,BORDER,0.5);
  const etools = ['Upscale','Style','Stabilize','Denoise','✦ AI Fix'];
  const etw = W/etools.length;
  etools.forEach((t,i) => {
    const isA=i===4;
    if(isA) rect(i*etw+4,330,etw-8,32,CORAL+'22',{rx:8});
    text(i*etw+etw/2,350,t,10,isA?CORAL3:TEXT3,{anchor:'middle',weight:isA?'600':'400'});
  });

  // Track lanes
  const trackY = 374;
  // Video track
  rect(0,trackY,56,32,CARD2);
  text(8,trackY+20,'VIDEO',8,TEXT3,{weight:'600'});
  // video clip strips
  rect(56,trackY,W-56,32,BG);
  rect(58,trackY+2,160,28,VIOLET+'44',{rx:4});
  text(66,trackY+18,'Aerial 01',9,VIOLET);
  rect(222,trackY+2,100,28,CORAL+'33',{rx:4});
  text(230,trackY+18,'City Dusk',9,CORAL3);
  rect(326,trackY+2,58,28,TEAL+'22',{rx:4});
  text(334,trackY+18,'Close-up',9,TEAL);

  // Audio track
  rect(0,trackY+34,56,28,CARD2);
  text(8,trackY+52,'AUDIO',8,TEXT3,{weight:'600'});
  rect(56,trackY+34,W-56,28,BG);
  waveform(60,trackY+36,W-64,24,AMBER,3);

  // AI track
  rect(0,trackY+64,56,24,CARD2);
  text(8,trackY+80,'✦ AI',8,CORAL,{weight:'600'});
  rect(56,trackY+64,W-56,24,BG);
  rect(80,trackY+66,80,20,CORAL+'22',{rx:4});
  text(88,trackY+80,'Style Transfer',9,CORAL3);
  rect(200,trackY+66,60,20,VIOLET+'22',{rx:4});
  text(208,trackY+80,'Upscale',9,VIOLET);

  // Clip settings panel
  card(16,494,W-32,144,CARD);
  text(28,514,'Selected: Aerial 01',13,TEXT,{weight:'600'});
  text(W-28,514,'Replace',11,CORAL,{anchor:'end'});

  const clipProps = [
    {l:'Duration',v:'0:12'},
    {l:'Start',v:'0:00'},
    {l:'Speed',v:'1.0×'},
    {l:'Opacity',v:'100%'},
  ];
  clipProps.forEach((p,i) => {
    const px = 16 + (i%2)*(W/2);
    const py = 530 + Math.floor(i/2)*30;
    text(px+12,py,p.l,10,TEXT3);
    rect(px+W/2-80,py-12,64,22,CARD2,{rx:8,stroke:BORDER,sw:1});
    text(px+W/2-48,py+2,p.v,10,TEXT2,{anchor:'middle',weight:'600',font:'DM Mono'});
  });

  line(28,594,W-28,594,BORDER,0.5);
  text(28,612,'AI Enhancement',12,TEXT,{weight:'600'});
  // AI style slider
  text(28,630,'Style strength',10,TEXT3);
  rect(28,636,W-56,6,BORDER,{rx:3});
  rect(28,636,(W-56)*0.6,6,CORAL,{rx:3});
  circle(28+(W-56)*0.6,639,6,CORAL);

  bottomNav(2);
  return elements;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Library
// ═══════════════════════════════════════════════════════════════════════════
function buildScreen4() {
  elements = [];
  rect(0,0,W,H,BG);
  statusBar();
  topBar('Library',{right:'+ Import',rightFill:CARD});

  // Filter row
  const filters = ['All','Generated','Imported','Sounds','Exports'];
  let fpx=16;
  filters.forEach((f,i)=>{
    const fw=f.length*6+20;
    rect(fpx,108,fw,26,i===0?CORAL:CARD,{rx:13,stroke:i===0?'none':BORDER,sw:1});
    text(fpx+fw/2,124,f,10,i===0?TEXT:TEXT2,{anchor:'middle',weight:'500'});
    fpx+=fw+8;
  });

  // Storage bar
  rect(16,144,W-32,32,CARD,{rx:10});
  const usedW=(W-56)*0.58;
  rect(20,150,usedW,20,CORAL,{rx:6,opacity:0.8});
  text(24,164,'14.2 GB used',10,TEXT);
  text(W-28,164,'25 GB total',10,TEXT2,{anchor:'end'});

  // Grid — 2-col video clips
  const gridItems = [
    {pal:VIOLET+'33',label:'Tokyo Aerial',dur:'0:42',ratio:'16:9',badge:'4K'},
    {pal:CORAL+'22',  label:'Night Market',dur:'0:15',ratio:'9:16',badge:'HD'},
    {pal:TEAL+'22',   label:'Rainy Street',dur:'0:30',ratio:'16:9',badge:'4K'},
    {pal:AMBER+'22',  label:'Sunset Bokeh',dur:'0:12',ratio:'1:1', badge:'HD'},
    {pal:VIOLET+'22', label:'City Lights', dur:'1:00',ratio:'16:9',badge:'4K'},
    {pal:CARD2,       label:'Montage 03',  dur:'0:45',ratio:'2:1', badge:'4K'},
  ];

  const gw=(W-40)/2;
  gridItems.forEach((g,i)=>{
    const gx=16+(i%2)*(gw+8);
    const gy=186+Math.floor(i/2)*(gw*0.58+40);
    vidThumb(gx,gy,gw,gw*0.56,g.pal,{rx:10,dur:g.dur,ratio:g.ratio});
    // badge
    rect(gx+gw-28,gy+4,24,14,CARD2,{rx:7});
    text(gx+gw-16,gy+14,g.badge,7,TEXT3,{anchor:'middle',weight:'600'});
    // selection circle
    circle(gx+gw-10,gy+10,6,'none',{stroke:BORDER2,sw:1.5});
    text(gx+4,gy+gw*0.56+14,g.label,11,TEXT,{weight:'500'});
  });

  bottomNav(3);
  return elements;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Analytics
// ═══════════════════════════════════════════════════════════════════════════
function buildScreen5() {
  elements = [];
  rect(0,0,W,H,BG);
  statusBar();
  topBar('Analytics');

  // Period tabs
  const periods = ['7D','30D','90D'];
  periods.forEach((p,i)=>{
    const isA=i===1;
    rect(16+i*72,108,64,26,isA?CORAL:CARD,{rx:13,stroke:isA?'none':BORDER,sw:1});
    text(48+i*72,124,p,11,isA?TEXT:TEXT2,{anchor:'middle',weight:isA?'600':'400'});
  });

  // Hero metric
  card(16,146,W-32,90,CARD);
  rect(16,146,W-32,36,CORAL,{rx:14,opacity:0.12});
  text(30,168,'Total Views',12,TEXT2);
  text(30,196,'284.7k',32,TEXT,{weight:'700'});
  text(126,196,'views',14,TEXT2);
  pill(W-90,154,64,22,TEAL+'22','↑ 34%',TEAL,11);
  text(W-90+4,228,'vs prev period',9,TEXT3);

  // Bar chart — views by day
  text(20,252,'Views by day',13,TEXT,{weight:'600'});
  const views = [18,32,45,28,61,52,74,48,83,91,67,77,88,72];
  const maxV=91, chartH=80, chartY=268, bw=18, bgap=5;
  const chartX=(W-(views.length*(bw+bgap)-bgap))/2;
  views.forEach((v,i)=>{
    const bh=(v/maxV)*chartH;
    const bx=chartX+i*(bw+bgap);
    const isLast=i===views.length-1;
    rect(bx,chartY+chartH-bh,bw,bh,isLast?CORAL:CARD2,{rx:4});
    if(isLast) {
      text(bx+bw/2,chartY+chartH-bh-6,v+'k',8,CORAL,{anchor:'middle',weight:'600'});
    }
  });
  // x-axis labels
  ['Mon','','','Thu','','','Sun','','','Wed','','','Sat',''].forEach((l,i)=>{
    if(l) text(chartX+i*(bw+bgap)+bw/2,chartY+chartH+12,l,8,TEXT3,{anchor:'middle'});
  });

  // Platform breakdown
  text(20,378,'By platform',13,TEXT,{weight:'600'});
  const platforms = [
    {name:'Instagram',pct:0.42,val:'119.6k',clr:CORAL},
    {name:'TikTok',   pct:0.31,val:'88.3k', clr:VIOLET},
    {name:'YouTube',  pct:0.18,val:'51.2k', clr:AMBER},
    {name:'Other',    pct:0.09,val:'25.6k', clr:TEXT3},
  ];
  platforms.forEach((p,i)=>{
    const py=394+i*40;
    circle(30,py+12,5,p.clr);
    text(42,py+17,p.name,12,TEXT);
    text(W-100,py+17,p.val,11,TEXT2,{anchor:'end',weight:'500'});
    rect(W-92,py+8,76,8,CARD2,{rx:4});
    rect(W-92,py+8,Math.max(4,76*p.pct),8,p.clr,{rx:4});
    text(W-10,py+17,Math.round(p.pct*100)+'%',10,TEXT3,{anchor:'end'});
  });

  // Top performing take
  text(20,558,'Top take this period',13,TEXT,{weight:'600'});
  card(16,572,W-32,84,CARD);
  vidThumb(24,578,80,68,VIOLET+'33',{rx:8,dur:'0:42'});
  text(116,594,'Synthwave City',13,TEXT,{weight:'600'});
  text(116,612,'88.3k views · 4.2% CTR',11,TEXT2);
  text(116,630,'Avg watch time 34s',11,TEXT3);
  pill(W-76,580,60,22,TEAL+'22','Top 1%',TEAL,9);

  // Quick stats row
  const qstats=[{l:'Avg CTR',v:'3.8%'},{l:'Completion',v:'61%'},{l:'Shares',v:'4.2k'}];
  qstats.forEach((s,i)=>{
    const qx=16+i*((W-32)/3);
    const qw=(W-32)/3-4;
    card(qx,668,qw,60,CARD);
    text(qx+qw/2,694,s.v,16,CORAL,{anchor:'middle',weight:'700'});
    text(qx+qw/2,710,s.l,9,TEXT2,{anchor:'middle'});
  });

  bottomNav(4);
  return elements;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 6 — Settings / Profile
// ═══════════════════════════════════════════════════════════════════════════
function buildScreen6() {
  elements = [];
  rect(0,0,W,H,BG);
  statusBar();
  topBar('Settings');

  // Profile card
  card(16,108,W-32,96,CARD);
  rect(16,108,W-32,36,CORAL,{rx:14,opacity:0.1});
  circle(44,148,22,CORAL2);
  text(44,153,'R',14,TEXT,{anchor:'middle',weight:'700'});
  text(76,136,'Rakis',16,TEXT,{weight:'700'});
  text(76,154,'Pro Plan · 620 credits remaining',11,TEXT2);
  pill(W-76,118,58,22,CORAL+'22','PRO',CORAL,10);

  // Sections
  const sections=[
    {title:'AI & Models', items:[
      {icon:'✦',label:'Default model',val:'Take Pro v3'},
      {icon:'◈',label:'Quality preset',val:'High'},
      {icon:'▣',label:'Auto-enhance',val:'On'},
    ]},
    {title:'Generation', items:[
      {icon:'⏱',label:'Max duration',val:'1:00'},
      {icon:'◉',label:'Default ratio',val:'16:9'},
      {icon:'▤',label:'Auto-save to library',val:'On'},
    ]},
    {title:'Account', items:[
      {icon:'⊞',label:'Usage this month',val:'48 takes'},
      {icon:'◷',label:'Billing cycle',val:'Apr 30'},
    ]},
  ];

  let sy=222;
  sections.forEach(sec=>{
    text(20,sy,sec.title,11,TEXT3,{weight:'600'});
    sy+=14;
    card(16,sy,W-32,sec.items.length*48+8,CARD);
    sec.items.forEach((item,idx)=>{
      const iy=sy+4+idx*48;
      text(32,iy+28,item.icon,14,CORAL);
      text(54,iy+28,item.label,13,TEXT);
      text(W-28,iy+28,item.val,12,TEXT2,{anchor:'end'});
      text(W-14,iy+28,'›',14,TEXT3,{anchor:'end'});
      if(idx<sec.items.length-1) line(32,iy+48,W-32,iy+48,BORDER,0.5);
    });
    sy+=sec.items.length*48+8+18;
  });

  // Upgrade prompt
  rect(16,sy,W-32,52,CORAL,{rx:14,opacity:0.12});
  rect(16,sy,3,52,CORAL,{rx:2});
  text(28,sy+20,'Upgrade to Studio',13,CORAL,{weight:'700'});
  text(28,sy+36,'Unlimited takes · 4K export · API access',11,TEXT2);
  text(W-28,sy+28,'→',18,CORAL,{anchor:'end'});

  bottomNav(4);
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
      const safe = String(el.content||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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
  {fn:buildScreen1, name:'Studio'},
  {fn:buildScreen2, name:'Generate'},
  {fn:buildScreen3, name:'Timeline Editor'},
  {fn:buildScreen4, name:'Library'},
  {fn:buildScreen5, name:'Analytics'},
  {fn:buildScreen6, name:'Settings'},
];

const pen = {
  version: '2.8',
  metadata: {
    name: 'Take — AI Video Creation Studio',
    description: 'Dark cinematic AI video generation platform. Near-black + electric coral. 6 screens.',
    author: 'RAM',
    created: new Date().toISOString(),
  },
  screens: screenBuilders.map(({fn,name}) => {
    const els = fn();
    return { name, svg:toSvg(els), elements:els };
  }),
};

const total = pen.screens.reduce((a,s)=>a+s.elements.length,0);
console.log(`TAKE: ${pen.screens.length} screens, ${total} elements`);
fs.writeFileSync(path.join(__dirname,'take.pen'), JSON.stringify(pen,null,2));
console.log('Written: take.pen');
