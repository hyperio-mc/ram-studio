'use strict';
// Heartbeat #468 — Dark theme
// KLARA — surface what you know
// Developer knowledge base with surveillance/HUD terminal aesthetic
// Inspired by: surveillance/HUD aesthetic (godly.website) + developer tool dashboards (darkmodedesign.com)
// Neon green + cyan, corner brackets, tracking reticles, monospace metadata, grid overlay

const fs = require('fs');
const path = require('path');

const SLUG = 'klara';
const W = 390, H = 844;

const BG    = '#080A0D';
const SURF  = '#0D1117';
const CARD  = '#131921';
const CARD2 = '#1A2332';
const ACC   = '#39FF14';
const ACC2  = '#00C8FF';
const TXT   = '#E0E6ED';
const TXT2  = '#8B95A1';
const BORDER  = 'rgba(57,255,20,0.15)';
const BORDER2 = 'rgba(0,200,255,0.12)';

function rect(x,y,w,h,fill,opts={}) {
  return { type:'rect', x, y, width:w, height:h, fill,
    ...(opts.rx!==undefined&&{rx:opts.rx}),
    ...(opts.opacity!==undefined&&{opacity:opts.opacity}),
    ...(opts.stroke&&{stroke:opts.stroke,strokeWidth:opts.sw||1}) };
}
function text(x,y,content,size,fill,opts={}) {
  return { type:'text', x, y, content, fontSize:size, fill,
    ...(opts.fw&&{fontWeight:opts.fw}),
    ...(opts.font&&{fontFamily:opts.font}),
    ...(opts.anchor&&{textAnchor:opts.anchor}),
    ...(opts.ls!==undefined&&{letterSpacing:opts.ls}),
    ...(opts.opacity!==undefined&&{opacity:opts.opacity}) };
}
function circle(cx,cy,r,fill,opts={}) {
  return { type:'circle', cx, cy, r, fill,
    ...(opts.opacity!==undefined&&{opacity:opts.opacity}),
    ...(opts.stroke&&{stroke:opts.stroke,strokeWidth:opts.sw||1}) };
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  return { type:'line', x1, y1, x2, y2, stroke, strokeWidth:opts.sw||1,
    ...(opts.opacity!==undefined&&{opacity:opts.opacity}),
    ...(opts.dash&&{strokeDasharray:opts.dash}) };
}

function cornerBrackets(x,y,w,h,color,size=12) {
  const sw=1.5, op=0.65;
  const arm=size;
  return [
    line(x,y,x+arm,y,color,{sw,opacity:op}), line(x,y,x,y+arm,color,{sw,opacity:op}),
    line(x+w,y,x+w-arm,y,color,{sw,opacity:op}), line(x+w,y,x+w,y+arm,color,{sw,opacity:op}),
    line(x,y+h,x+arm,y+h,color,{sw,opacity:op}), line(x,y+h,x,y+h-arm,color,{sw,opacity:op}),
    line(x+w,y+h,x+w-arm,y+h,color,{sw,opacity:op}), line(x+w,y+h,x+w,y+h-arm,color,{sw,opacity:op}),
  ];
}

function reticle(cx,cy,r,color) {
  return [
    circle(cx,cy,r,'none',{stroke:color,sw:1,opacity:0.4}),
    circle(cx,cy,Math.max(1,r*0.3),color,{opacity:0.7}),
    line(cx-r-5,cy,cx-r+5,cy,color,{sw:0.8,opacity:0.5}),
    line(cx+r-5,cy,cx+r+5,cy,color,{sw:0.8,opacity:0.5}),
    line(cx,cy-r-5,cx,cy-r+5,color,{sw:0.8,opacity:0.5}),
    line(cx,cy+r-5,cx,cy+r+5,color,{sw:0.8,opacity:0.5}),
  ];
}

function grid(x,y,w,h,cols,rows,color) {
  const els=[], cw=w/cols, rh=h/rows;
  for(let i=1;i<cols;i++) els.push(line(x+i*cw,y,x+i*cw,y+h,color,{sw:0.5,opacity:0.25}));
  for(let j=1;j<rows;j++) els.push(line(x,y+j*rh,x+w,y+j*rh,color,{sw:0.5,opacity:0.25}));
  return els;
}

function statusDot(x,y,color,r=4) {
  return [circle(x,y,r+3,color,{opacity:0.12}), circle(x,y,r,color)];
}

function progressBar(x,y,w,h,pct,fill,bg='rgba(255,255,255,0.06)') {
  const fw=Math.max(h,Math.round(w*pct/100));
  return [rect(x,y,w,h,bg,{rx:h/2}), rect(x,y,fw,h,fill,{rx:h/2})];
}

function bracketCard(x,y,w,h,fill,color) {
  return [rect(x,y,w,h,fill,{rx:4,stroke:'rgba(57,255,20,0.12)',sw:0.8}), ...cornerBrackets(x+2,y+2,w-4,h-4,color,10)];
}

function sparkBars(x,y,w,h,vals,color) {
  const els=[], bw=(w-(vals.length-1)*2)/vals.length, mx=Math.max(...vals);
  vals.forEach((v,i)=>{
    const bh=Math.max(2,Math.round(v/mx*h)), bx=x+i*(bw+2), by=y+h-bh;
    els.push(rect(bx,by,bw,bh,color,{rx:1,opacity:0.5+i/vals.length*0.5}));
  });
  return els;
}

function statusBar(idx) {
  return [
    rect(0,0,W,44,BG),
    text(16,28,'09:41',13,TXT,{fw:'600',font:'monospace'}),
    text(W/2,28,'KLARA',11,ACC,{fw:'700',font:'monospace',anchor:'middle',ls:3}),
    rect(W-55,16,22,11,'none',{rx:2,stroke:TXT2,sw:1,opacity:0.5}),
    rect(W-33,20,3,5,TXT2,{rx:1,opacity:0.4}),
    rect(W-52,18,16,7,TXT,{rx:1,opacity:0.75}),
    text(W-18,28,`${idx}/6`,9,TXT2,{font:'monospace',anchor:'end',opacity:0.45}),
  ];
}

function navBar(active) {
  const tabs=[{l:'HOME',ic:'⌂'},{l:'SEARCH',ic:'⊞'},{l:'NEW',ic:'+'},{l:'GRAPH',ic:'◈'},{l:'TEAM',ic:'◎'}];
  const tw=W/tabs.length;
  const els=[rect(0,H-76,W,76,SURF,{stroke:BORDER,sw:0.5})];
  tabs.forEach(({l,ic},i)=>{
    const cx=i*tw+tw/2, on=i===active;
    if(on) els.push(rect(i*tw+10,H-76,tw-20,2,ACC,{rx:1}));
    els.push(text(cx,H-46,ic,on?20:17,on?ACC:TXT2,{anchor:'middle',opacity:on?1:0.45}));
    els.push(text(cx,H-26,l,8,on?ACC:TXT2,{fw:on?'700':'400',font:'monospace',anchor:'middle',ls:0.8,opacity:on?0.9:0.35}));
  });
  return els;
}

// ── SCREEN 1: DASHBOARD ──────────────────────────────────────────────────────
function s1() {
  const els=[];
  els.push(rect(0,0,W,H,BG));
  els.push(...grid(0,44,W,H-120,8,14,'rgba(57,255,20,0.035)'));
  els.push(circle(320,150,100,ACC,{opacity:0.04}));
  els.push(circle(60,620,80,ACC2,{opacity:0.04}));
  els.push(...statusBar(1));

  els.push(text(16,72,'KNOWLEDGE BASE',9,ACC,{fw:'700',font:'monospace',ls:2.5,opacity:0.8}));
  els.push(text(16,94,'Dashboard',22,TXT,{fw:'700'}));
  els.push(...reticle(356,80,18,ACC2));

  // system status bar
  els.push(rect(16,108,W-32,26,'rgba(57,255,20,0.06)',{rx:3,stroke:BORDER,sw:0.5}));
  els.push(...statusDot(28,121,ACC,3));
  els.push(text(38,125,'SYSTEM NOMINAL  ·  INDEX LIVE  ·  SYNC CURRENT',8,ACC,{fw:'600',font:'monospace',ls:0.5,opacity:0.7}));

  // stats cards
  const stats=[{l:'ENTRIES',v:'2,847',s:'+12 today'},{l:'LINKS',v:'9,203',s:'+47 today'},{l:'TOPICS',v:'184',s:'6 new'}];
  const sw2=(W-32-16)/3;
  stats.forEach((st,i)=>{
    const sx=16+i*(sw2+8);
    els.push(...bracketCard(sx,144,sw2,82,CARD,ACC));
    els.push(text(sx+sw2/2,170,st.v,22,TXT,{fw:'800',anchor:'middle'}));
    els.push(text(sx+sw2/2,187,st.l,8,ACC,{fw:'700',font:'monospace',anchor:'middle',ls:1.5}));
    els.push(text(sx+sw2/2,203,st.s,9,TXT2,{anchor:'middle',opacity:0.55}));
  });

  // recent entries
  els.push(text(16,244,'RECENT ENTRIES',9,ACC2,{fw:'700',font:'monospace',ls:2}));
  els.push(line(16,249,W-16,249,BORDER2,{sw:0.5}));
  const entries=[
    {t:'Diffusion models — cross-attention mechanics',tags:['ML','THEORY'],age:'2m',sc:92},
    {t:'React Server Components — caching patterns',tags:['REACT','PERF'],age:'18m',sc:87},
    {t:'Temporal API — timezone edge cases',tags:['JS','DATE'],age:'1h',sc:75},
    {t:'PostgreSQL partial indexes',tags:['DB','PERF'],age:'3h',sc:81},
  ];
  entries.forEach((e,i)=>{
    const ey=257+i*60;
    const first=i===0;
    els.push(rect(16,ey,W-32,54,CARD,{rx:4,stroke:first?'rgba(57,255,20,0.28)':BORDER,sw:first?1:0.5}));
    if(first) els.push(rect(16,ey,3,54,ACC,{rx:1.5}));
    els.push(text(28,ey+17,e.t,11,TXT,{fw:'500'}));
    let tx=28;
    e.tags.forEach(tag=>{
      const tw2=tag.length*6.5+12;
      els.push(rect(tx,ey+24,tw2,14,'rgba(57,255,20,0.07)',{rx:2}));
      els.push(text(tx+tw2/2,ey+34,tag,8,ACC,{fw:'600',font:'monospace',anchor:'middle',ls:0.3}));
      tx+=tw2+5;
    });
    els.push(text(W-22,ey+17,e.age+'ago',9,TXT2,{anchor:'end',opacity:0.45}));
    els.push(...progressBar(W-52,ey+32,34,3,e.sc,ACC2,'rgba(0,200,255,0.08)'));
    els.push(text(W-14,ey+40,`${e.sc}`,8,ACC2,{anchor:'end',opacity:0.65}));
  });

  // topics
  els.push(text(16,505,'TOP TOPICS',9,ACC2,{fw:'700',font:'monospace',ls:2}));
  const topics=[
    {n:'Machine Learning',p:34,c:967},
    {n:'Systems Design',p:22,c:626},
    {n:'JavaScript / TS',p:18,c:512},
    {n:'Databases',p:14,c:398},
  ];
  topics.forEach((t,i)=>{
    const ty=518+i*34;
    els.push(text(16,ty+12,t.n,11,TXT,{fw:'500'}));
    els.push(text(W-20,ty+12,`${t.c}`,9,TXT2,{anchor:'end',opacity:0.45}));
    els.push(...progressBar(16,ty+18,W-32,4,t.p,i===0?ACC:ACC2,'rgba(255,255,255,0.05)'));
  });

  // activity spark
  els.push(text(16,660,'7-DAY ACTIVITY',9,TXT2,{fw:'600',font:'monospace',ls:1.5,opacity:0.5}));
  els.push(...sparkBars(16,670,W-32,28,[18,24,12,31,28,19,36],ACC));

  els.push(...navBar(0));
  return els;
}

// ── SCREEN 2: SEARCH ─────────────────────────────────────────────────────────
function s2() {
  const els=[];
  els.push(rect(0,0,W,H,BG));
  els.push(...grid(0,44,W,H-120,8,12,'rgba(57,255,20,0.03)'));
  els.push(circle(300,300,120,ACC2,{opacity:0.04}));
  els.push(...statusBar(2));

  els.push(text(16,72,'KNOWLEDGE RETRIEVAL',9,ACC2,{fw:'700',font:'monospace',ls:2}));
  els.push(text(16,93,'Search',22,TXT,{fw:'700'}));

  // search box
  els.push(...bracketCard(16,106,W-32,44,SURF,ACC));
  els.push(...reticle(38,128,12,ACC));
  els.push(text(56,132,'diffusion attention layers',13,TXT,{opacity:0.9}));
  els.push(rect(W-58,113,36,30,'rgba(57,255,20,0.1)',{rx:3,stroke:BORDER,sw:0.8}));
  els.push(text(W-40,131,'FIND',9,ACC,{fw:'700',font:'monospace',anchor:'middle',ls:0.8}));

  // filter chips
  const filters=['ALL','ML','SYSTEMS','JS','DB','PAPERS'];
  let fx=16;
  filters.forEach((f,i)=>{
    const fw2=f.length*8+18, on=i===1;
    els.push(rect(fx,158,fw2,24,on?'rgba(57,255,20,0.1)':'rgba(255,255,255,0.04)',{rx:3,stroke:on?'rgba(57,255,20,0.4)':'rgba(255,255,255,0.08)',sw:0.7}));
    els.push(text(fx+fw2/2,174,f,9,on?ACC:TXT2,{fw:on?'700':'400',font:'monospace',anchor:'middle',opacity:on?1:0.55}));
    fx+=fw2+5;
  });

  els.push(text(16,200,'47 RESULTS — "diffusion attention layers"',9,TXT2,{font:'monospace',opacity:0.45}));
  els.push(line(16,205,W-16,205,'rgba(57,255,20,0.1)',{sw:0.5}));

  const results=[
    {t:'Cross-attention in diffusion models — Q/K/V',rel:97,type:'NOTE',age:'2d',x:'Cross-attention layers let the model attend to text...'},
    {t:'Self-attention vs cross-attention complexity',rel:91,type:'PAPER',age:'1w',x:'A breakdown of O(n²) scaling and flash-attention...'},
    {t:'Stable Diffusion architecture — layer by layer',rel:88,type:'NOTE',age:'3d',x:'The UNet backbone processes latent space...'},
    {t:'DDPM vs DDIM sampling — explained',rel:82,type:'SUMMARY',age:'5d',x:'Denoising diffusion probabilistic models use...'},
    {t:'LoRA fine-tuning — attention weight injection',rel:79,type:'NOTE',age:'1w',x:'Low-rank adaptation modifies attention matrices...'},
  ];
  results.forEach((r,i)=>{
    const ry=215+i*86, top=i===0;
    const relColor=r.rel>90?ACC:r.rel>84?ACC2:TXT2;
    els.push(rect(16,ry,W-32,80,CARD,{rx:4,stroke:top?'rgba(57,255,20,0.25)':BORDER,sw:top?1:0.5}));
    if(top) els.push(rect(16,ry,3,80,ACC,{rx:1.5}));
    circle(W-30,ry+22,14,'none',{stroke:relColor,sw:1});
    els.push(circle(W-30,ry+22,14,'rgba(57,255,20,0.05)',{stroke:relColor,sw:1}));
    els.push(text(W-30,ry+27,`${r.rel}`,9,relColor,{fw:'700',font:'monospace',anchor:'middle'}));
    const tw3=r.type.length*6.5+12;
    els.push(rect(28,ry+10,tw3,14,r.type==='PAPER'?'rgba(0,200,255,0.1)':'rgba(57,255,20,0.08)',{rx:2}));
    els.push(text(28+tw3/2,ry+20,r.type,8,r.type==='PAPER'?ACC2:ACC,{fw:'700',font:'monospace',anchor:'middle'}));
    els.push(text(28+tw3+6,ry+20,r.age+' ago',8,TXT2,{opacity:0.4}));
    els.push(text(28,ry+36,r.t,11,TXT,{fw:'600'}));
    els.push(text(28,ry+52,r.x,10,TXT2,{opacity:0.5}));
    for(let c=0;c<4;c++) els.push(circle(28+c*12,ry+68,3,c<3?ACC2:'rgba(255,255,255,0.1)',{opacity:c<3?0.5:1}));
    els.push(text(82,ry+70,'12 connections',8,TXT2,{opacity:0.35}));
  });

  els.push(...navBar(1));
  return els;
}

// ── SCREEN 3: CAPTURE ────────────────────────────────────────────────────────
function s3() {
  const els=[];
  els.push(rect(0,0,W,H,BG));
  els.push(...grid(0,44,W,H-120,6,10,'rgba(57,255,20,0.025)'));
  els.push(circle(195,400,140,ACC,{opacity:0.03}));
  els.push(...statusBar(3));

  els.push(text(16,72,'KNOWLEDGE INTAKE',9,ACC,{fw:'700',font:'monospace',ls:2}));
  els.push(text(16,93,'Capture',22,TXT,{fw:'700'}));
  els.push(...reticle(W-28,80,16,ACC));

  // type selector
  els.push(text(16,118,'SOURCE TYPE',8,TXT2,{fw:'600',font:'monospace',ls:1.5,opacity:0.45}));
  const types=['NOTE','PAPER','URL','CODE','IDEA'];
  let tx=16;
  types.forEach((t,i)=>{
    const tw4=t.length*8+20, on=i===0;
    els.push(rect(tx,126,tw4,26,on?'rgba(57,255,20,0.12)':'rgba(255,255,255,0.04)',{rx:3,stroke:on?'rgba(57,255,20,0.5)':'rgba(255,255,255,0.07)',sw:on?1:0.5}));
    els.push(text(tx+tw4/2,143,t,10,on?ACC:TXT2,{fw:on?'700':'400',font:'monospace',anchor:'middle',ls:0.5}));
    tx+=tw4+6;
  });

  // title field
  els.push(text(16,172,'TITLE',8,TXT2,{fw:'600',font:'monospace',ls:1.5,opacity:0.45}));
  els.push(...bracketCard(16,180,W-32,42,SURF,ACC));
  els.push(text(28,205,'Attention mechanism — cross vs self',12,TXT,{fw:'500'}));
  els.push(rect(280,195,2,14,ACC,{opacity:0.8}));

  // body field
  els.push(text(16,235,'CONTENT',8,TXT2,{fw:'600',font:'monospace',ls:1.5,opacity:0.45}));
  els.push(...bracketCard(16,243,W-32,182,SURF,ACC));
  const body=['Cross-attention allows a model to attend to','information from a different sequence. In','diffusion models, Q comes from the image','latent while K/V come from text encoding.','','Key insight: cross-attention is what creates','the conditioning signal between modalities.'];
  body.forEach((l,i)=>{ if(l) els.push(text(28,263+i*18,l,11,TXT,{opacity:0.78})); });

  // AI assist
  els.push(rect(16,434,W-32,30,'rgba(57,255,20,0.06)',{rx:3,stroke:BORDER,sw:0.8}));
  els.push(...reticle(30,449,8,ACC));
  els.push(text(46,453,'AI: Suggest related entries to link?',10,ACC,{opacity:0.65}));
  els.push(text(W-22,453,'YES',10,ACC,{fw:'700',font:'monospace',anchor:'end'}));

  // topics
  els.push(text(16,478,'TOPICS',8,TXT2,{fw:'600',font:'monospace',ls:1.5,opacity:0.45}));
  const tagsList=['ML','ATTENTION','TRANSFORMERS','+ ADD'];
  let ttx=16;
  tagsList.forEach((t,i)=>{
    const add=t==='+ ADD', tw5=t.length*7.5+16;
    els.push(rect(ttx,486,tw5,22,add?'rgba(255,255,255,0.03)':'rgba(57,255,20,0.08)',{rx:3,stroke:add?'rgba(255,255,255,0.1)':BORDER,sw:0.8}));
    els.push(text(ttx+tw5/2,501,t,9,add?TXT2:ACC,{fw:add?'400':'600',font:'monospace',anchor:'middle',ls:0.3}));
    ttx+=tw5+6;
  });

  // links
  els.push(text(16,524,'LINKED ENTRIES',8,TXT2,{fw:'600',font:'monospace',ls:1.5,opacity:0.45}));
  const links=['Diffusion models overview','Transformer architecture','+ Link entry'];
  links.forEach((l,i)=>{
    const add=l.startsWith('+');
    els.push(rect(16,533+i*30,W-32,24,add?'rgba(255,255,255,0.02)':'rgba(0,200,255,0.05)',{rx:3,stroke:add?'rgba(255,255,255,0.06)':BORDER2,sw:0.5}));
    els.push(text(28,549+i*30,add?'⊕  '+l.slice(2):'◈  '+l,10,add?TXT2:ACC2,{opacity:add?0.4:0.8}));
  });

  // save button
  els.push(rect(16,636,W-32,46,ACC,{rx:4}));
  els.push(...cornerBrackets(18,638,W-36,44,BG,10));
  els.push(text(W/2,666,'COMMIT TO INDEX',13,BG,{fw:'800',font:'monospace',anchor:'middle',ls:2}));

  els.push(...navBar(2));
  return els;
}

// ── SCREEN 4: ENTRY DETAIL ───────────────────────────────────────────────────
function s4() {
  const els=[];
  els.push(rect(0,0,W,H,BG));
  els.push(...grid(0,44,W,H-120,8,14,'rgba(57,255,20,0.025)'));
  els.push(circle(50,200,90,ACC,{opacity:0.04}));
  els.push(...statusBar(4));

  els.push(text(16,73,'← BACK',9,ACC2,{fw:'600',font:'monospace',ls:0.5}));

  // header card
  els.push(...bracketCard(16,82,W-32,96,CARD,ACC));
  const tw6=44;
  els.push(rect(28,92,tw6,16,'rgba(57,255,20,0.1)',{rx:2}));
  els.push(text(28+tw6/2,103,'NOTE',8,ACC,{fw:'700',font:'monospace',anchor:'middle'}));
  els.push(text(28+tw6+6,103,'11 APR 2026 · 09:24',8,TXT2,{font:'monospace',opacity:0.45}));
  els.push(text(28,124,'Diffusion models — cross-attention',15,TXT,{fw:'700'}));
  els.push(text(28,143,'mechanics in UNet conditioning',15,TXT,{fw:'600',opacity:0.78}));
  els.push(circle(W-36,125,20,'rgba(57,255,20,0.07)',{stroke:ACC,sw:1}));
  els.push(text(W-36,121,'92',14,ACC,{fw:'800',anchor:'middle'}));
  els.push(text(W-36,133,'SCORE',6,ACC,{fw:'600',font:'monospace',anchor:'middle',ls:0.3}));

  // tags
  const etags=['ML','DIFFUSION','ATTENTION','UNet'];
  let etx=16;
  etags.forEach(t=>{
    const tw7=t.length*7+16;
    els.push(rect(etx,185,tw7,20,'rgba(57,255,20,0.07)',{rx:3,stroke:BORDER,sw:0.7}));
    els.push(text(etx+tw7/2,198,t,9,ACC,{fw:'600',font:'monospace',anchor:'middle',ls:0.3}));
    etx+=tw7+5;
  });

  // content
  els.push(text(16,222,'CONTENT',8,TXT2,{fw:'600',font:'monospace',ls:1.5,opacity:0.45}));
  els.push(line(16,226,W-16,226,BORDER,{sw:0.5}));
  const clines=[
    {t:'Cross-attention is the mechanism that allows',b:false},
    {t:'diffusion models to condition on text prompts.',b:false},
    {t:'In the UNet architecture:',b:false},
    {t:''},
    {t:'  Q  ←  from image latent representation',b:true},
    {t:'  K, V  ←  from text encoder (CLIP / T5)',b:true},
    {t:''},
    {t:'The attention output routes text meaning into',b:false},
    {t:'spatial feature maps — controlling what appears',b:false},
    {t:'where in the output image.',b:false},
    {t:''},
    {t:'Self-attention (image→image) handles spatial',b:false},
    {t:'coherence separately from conditioning.',b:false},
  ];
  clines.forEach((cl,i)=>{
    if(cl.t) els.push(text(16,242+i*17,cl.t,11,cl.b?ACC:TXT,{fw:cl.b?'600':'400',font:cl.b?'monospace':undefined,opacity:cl.b?0.9:0.72}));
  });

  // connections
  els.push(text(16,476,'CONNECTIONS  (12)',8,ACC2,{fw:'700',font:'monospace',ls:1.5}));
  els.push(line(16,480,W-16,480,BORDER2,{sw:0.5}));
  const conns=[
    {t:'Transformer architecture',s:94,type:'FOUNDATIONAL'},
    {t:'Stable Diffusion UNet layers',s:89,type:'RELATED'},
    {t:'CLIP text encoder internals',s:83,type:'RELATED'},
  ];
  conns.forEach((c,i)=>{
    const cy2=490+i*44;
    els.push(rect(16,cy2,W-32,38,CARD2,{rx:3,stroke:BORDER2,sw:0.5}));
    els.push(rect(16,cy2,Math.round(c.s/100*(W-32)),2,ACC2,{opacity:0.3}));
    els.push(text(28,cy2+16,c.t,11,TXT,{fw:'500',opacity:0.82}));
    const tw8=c.type.length*6+10;
    els.push(rect(28,cy2+22,tw8,12,'rgba(0,200,255,0.07)',{rx:2}));
    els.push(text(28+tw8/2,cy2+31,c.type,7,ACC2,{fw:'600',font:'monospace',anchor:'middle'}));
    els.push(text(W-22,cy2+26,`${c.s}%`,9,ACC2,{anchor:'end',opacity:0.6}));
  });

  els.push(...navBar(1));
  return els;
}

// ── SCREEN 5: GRAPH ───────────────────────────────────────────────────────────
function s5() {
  const els=[];
  els.push(rect(0,0,W,H,'#050709'));
  els.push(...grid(0,44,W,H-120,10,16,'rgba(57,255,20,0.03)'));
  els.push(...statusBar(5));

  els.push(text(16,72,'KNOWLEDGE TOPOLOGY',9,ACC,{fw:'700',font:'monospace',ls:2}));
  els.push(text(16,93,'Graph',22,TXT,{fw:'700'}));

  const ctrls=['ALL NODES','ML CLUSTER','SYSTEMS','RECENT'];
  let cx=16;
  ctrls.forEach((c,i)=>{
    const cw=c.length*7+18, on=i===1;
    els.push(rect(cx,104,cw,22,on?'rgba(57,255,20,0.1)':'rgba(255,255,255,0.04)',{rx:3,stroke:on?'rgba(57,255,20,0.4)':'rgba(255,255,255,0.07)',sw:0.7}));
    els.push(text(cx+cw/2,118,c,8,on?ACC:TXT2,{fw:on?'700':'400',font:'monospace',anchor:'middle',ls:0.3,opacity:on?1:0.45}));
    cx+=cw+5;
  });

  // graph canvas
  const GX=16,GY=136,GW=W-32,GH=370;
  els.push(rect(GX,GY,GW,GH,'rgba(13,17,23,0.8)',{rx:4,stroke:BORDER,sw:0.8}));

  const nodes=[
    {x:195,y:295,r:24,l:'Diffusion\nModels',c:ACC,main:true},
    {x:110,y:210,r:16,l:'Cross\nAttention',c:ACC},
    {x:290,y:200,r:18,l:'UNet\nArch',c:ACC},
    {x:70,y:330,r:14,l:'DDPM',c:ACC2},
    {x:320,y:340,r:14,l:'CLIP',c:ACC2},
    {x:195,y:185,r:15,l:'Latent\nSpace',c:ACC2},
    {x:145,y:385,r:12,l:'LoRA',c:TXT2},
    {x:260,y:390,r:12,l:'Sampling',c:TXT2},
    {x:340,y:255,r:11,l:'T5\nEnc',c:TXT2},
    {x:60,y:250,r:11,l:'Flash\nAttn',c:TXT2},
  ];
  const edges=[[0,1],[0,2],[0,3],[0,4],[0,5],[1,5],[1,9],[2,4],[2,8],[3,6],[4,7],[5,1]];

  edges.forEach(([a,b])=>{
    const na=nodes[a],nb=nodes[b],main=a===0||b===0;
    els.push(line(GX+na.x,GY+na.y,GX+nb.x,GY+nb.y,
      main?'rgba(57,255,20,0.2)':'rgba(0,200,255,0.12)',
      {sw:main?1:0.6}));
  });

  nodes.forEach(n=>{
    const nx=GX+n.x,ny=GY+n.y;
    els.push(circle(nx,ny,n.r+8,n.c,{opacity:n.main?0.09:0.04}));
    els.push(circle(nx,ny,n.r+3,n.c,{opacity:n.main?0.14:0.06}));
    els.push(circle(nx,ny,n.r,CARD,{stroke:n.c,sw:n.main?2:1}));
    const ls2=n.l.split('\n');
    ls2.forEach((ll,li)=>{
      els.push(text(nx,ny+(li-(ls2.length-1)/2)*11+4,ll,n.main?9:7,n.c,
        {fw:n.main?'700':'500',font:'monospace',anchor:'middle',ls:0.2}));
    });
    if(n.main) {
      const s=n.r+10;
      els.push(...cornerBrackets(nx-s,ny-s,s*2,s*2,ACC,12));
    }
  });

  // selected info
  els.push(...bracketCard(16,516,W-32,70,CARD,ACC));
  els.push(text(28,536,'Cross Attention',13,TXT,{fw:'700'}));
  els.push(text(28,553,'12 connections  ·  43 entries  ·  ML cluster',10,TXT2,{opacity:0.5}));
  els.push(rect(28,562,80,3,ACC,{rx:1.5,opacity:0.6}));
  els.push(rect(114,562,50,3,ACC2,{rx:1.5,opacity:0.4}));

  // legend
  const lg=[{c:ACC,l:'Core'},{c:ACC2,l:'Support'},{c:TXT2,l:'Related'}];
  lg.forEach((l,i)=>{
    const lx=16+i*80;
    els.push(...statusDot(lx+6,600,l.c,4));
    els.push(text(lx+16,604,l.l,9,TXT2,{opacity:0.45}));
  });

  // depth slider
  els.push(text(16,626,'DEPTH',8,TXT2,{fw:'600',font:'monospace',ls:1.5,opacity:0.4}));
  els.push(...progressBar(16,635,W-32,4,60,ACC,'rgba(57,255,20,0.07)'));
  els.push(circle(16+(W-32)*0.6,637,7,CARD,{stroke:ACC,sw:1.5}));

  els.push(...navBar(3));
  return els;
}

// ── SCREEN 6: TEAM ────────────────────────────────────────────────────────────
function s6() {
  const els=[];
  els.push(rect(0,0,W,H,BG));
  els.push(...grid(0,44,W,H-120,8,14,'rgba(57,255,20,0.03)'));
  els.push(circle(350,500,110,ACC2,{opacity:0.04}));
  els.push(...statusBar(6));

  els.push(text(16,72,'COLLECTIVE INTELLIGENCE',9,ACC2,{fw:'700',font:'monospace',ls:2}));
  els.push(text(16,93,'Team',22,TXT,{fw:'700'}));

  // workspace card
  els.push(...bracketCard(16,106,W-32,72,CARD,ACC2));
  els.push(...reticle(40,130,14,ACC2));
  els.push(text(62,126,'ML Research Team',14,TXT,{fw:'700'}));
  els.push(text(62,143,'4 members  ·  2,847 shared entries  ·  PRIVATE',10,TXT2,{opacity:0.48}));
  els.push(...statusDot(W-30,124,ACC,5));
  els.push(text(W-20,128,'LIVE',8,ACC,{fw:'700',font:'monospace',anchor:'end',opacity:0.75}));

  // members
  els.push(text(16,193,'TEAM MEMBERS',8,TXT2,{fw:'600',font:'monospace',ls:1.5,opacity:0.45}));
  const members=[
    {n:'Alex Chen',r:'LEAD',e:987,on:true,c:'#FF5240'},
    {n:'Sam Rivera',r:'RESEARCHER',e:634,on:true,c:'#06B6D4'},
    {n:'Morgan Liu',r:'ENGINEER',e:743,on:false,c:'#A78BFA'},
    {n:'Jordan Park',r:'ANALYST',e:483,on:false,c:'#F59E0B'},
  ];
  members.forEach((m,i)=>{
    const my=203+i*48;
    els.push(rect(16,my,W-32,42,CARD,{rx:3,stroke:m.on?BORDER:'rgba(255,255,255,0.04)',sw:m.on?0.8:0.4}));
    els.push(circle(38,my+21,14,m.c,{opacity:0.18}));
    els.push(circle(38,my+21,10,m.c,{opacity:0.55}));
    els.push(text(38,my+26,m.n.split(' ').map(x=>x[0]).join(''),9,m.c,{fw:'800',anchor:'middle'}));
    els.push(text(60,my+17,m.n,12,TXT,{fw:'600'}));
    const rw=m.r.length*6+10;
    els.push(rect(60,my+24,rw,12,m.on?'rgba(57,255,20,0.08)':'rgba(255,255,255,0.04)',{rx:2}));
    els.push(text(60+rw/2,my+33,m.r,7,m.on?ACC:TXT2,{fw:'600',font:'monospace',anchor:'middle',opacity:m.on?0.8:0.4}));
    els.push(text(W-22,my+17,`${m.e}`,12,TXT,{fw:'700',anchor:'end'}));
    els.push(text(W-22,my+33,'entries',8,TXT2,{anchor:'end',opacity:0.38}));
    if(m.on) els.push(...statusDot(W-24,my+43,ACC,3));
  });

  // activity
  els.push(text(16,398,'RECENT ACTIVITY',8,TXT2,{fw:'600',font:'monospace',ls:1.5,opacity:0.45}));
  els.push(line(16,403,W-16,403,BORDER,{sw:0.5}));
  const acts=[
    {who:'AC',a:'added note',t:'RLHF — reward model design',age:'4m',c:'#FF5240'},
    {who:'SR',a:'linked 3 entries',t:'Attention survey paper',age:'12m',c:'#06B6D4'},
    {who:'ML',a:'added note',t:'Flash Attention v3 analysis',age:'38m',c:'#A78BFA'},
    {who:'AC',a:'created topic',t:'Alignment Research cluster',age:'1h',c:'#FF5240'},
    {who:'JP',a:'added summary',t:'DPO vs RLHF comparison',age:'2h',c:'#F59E0B'},
  ];
  acts.forEach((a,i)=>{
    const ay=412+i*44;
    els.push(rect(16,ay,W-32,38,CARD,{rx:3,stroke:BORDER,sw:0.4}));
    els.push(circle(30,ay+19,10,a.c,{opacity:0.18}));
    els.push(circle(30,ay+19,7,a.c,{opacity:0.5}));
    els.push(text(30,ay+24,a.who,7,a.c,{fw:'800',anchor:'middle'}));
    els.push(text(46,ay+16,`${a.a}:`,9,TXT2,{opacity:0.45}));
    els.push(text(46,ay+30,a.t,10,TXT,{fw:'500',opacity:0.78}));
    els.push(text(W-18,ay+20,a.age,8,TXT2,{anchor:'end',opacity:0.38}));
  });

  // health bars
  els.push(text(16,634,'INDEX HEALTH',8,TXT2,{fw:'600',font:'monospace',ls:1.5,opacity:0.45}));
  [{l:'Link density',p:78,c:ACC},{l:'Topic coverage',p:64,c:ACC2}].forEach((h,i)=>{
    const hy=646+i*22;
    els.push(text(16,hy+10,h.l,9,TXT2,{opacity:0.5}));
    els.push(...progressBar(122,hy+4,196,5,h.p,h.c,'rgba(255,255,255,0.05)'));
    els.push(text(326,hy+12,`${h.p}%`,9,h.c,{fw:'600',opacity:0.65}));
  });

  els.push(...navBar(4));
  return els;
}

// ── ASSEMBLE ─────────────────────────────────────────────────────────────────
const screens=[
  {name:'Dashboard',fn:s1},{name:'Search',fn:s2},{name:'Capture',fn:s3},
  {name:'Detail',fn:s4},{name:'Graph',fn:s5},{name:'Team',fn:s6},
];

const pen={
  version:'2.8',
  metadata:{
    name:'KLARA — surface what you know',
    author:'RAM',
    date:new Date().toISOString().slice(0,10),
    theme:'dark',
    heartbeat:468,
    description:'Developer knowledge base with surveillance/HUD terminal aesthetic. Neon green + cyan, corner brackets, tracking reticles, monospace metadata, grid overlay. Inspired by Godly.website surveillance aesthetic + darkmodedesign.com developer tool dashboards.',
    palette:{bg:BG,surface:SURF,card:CARD,accent:ACC,accent2:ACC2,text:TXT},
    elements:0,
  },
  screens:screens.map(s=>{const elements=s.fn();return{name:s.name,svg:`${W}x${H}`,elements};}),
};

let total=0;
pen.screens.forEach(s=>total+=s.elements.length);
pen.metadata.elements=total;

fs.writeFileSync(path.join(__dirname,`${SLUG}.pen`),JSON.stringify(pen,null,2));
console.log(`KLARA: ${pen.screens.length} screens, ${total} elements`);
console.log(`Written: ${SLUG}.pen`);
