/**
 * LUMIO — freelance financial intelligence
 * Inspired by: Midday.ai (darkmodedesign.com) for unified-ops structure,
 * New Genre Studio (minimal.gallery) for warm minimal aesthetic.
 * Theme: LIGHT — warm cream/ivory, copper accents, generous whitespace.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const W = 393, H = 852;
const bg      = '#F8F4EE';
const surface = '#FFFFFF';
const surface2= '#F2EDE5';
const text0   = '#1E1C18';
const subtle  = '#6B6660';
const muted   = 'rgba(30,28,24,0.38)';
const divider = 'rgba(30,28,24,0.10)';
const accent  = '#B8621A';
const accentL = '#E8A267';
const accentPale = '#FAEBD7';
const green   = '#2D7A4F';
const greenL  = '#D6F0E0';
const amber   = '#C8860A';
const amberL  = '#FDF3D7';
const redL    = '#FDECEA';

const R = (x,y,w,h,fill,r=0,op=1,stroke,sw) => ({type:'rect',x,y,width:w,height:h,fill,cornerRadius:r,opacity:op,stroke,strokeWidth:sw});
const T = (x,y,content,size,color,weight='regular',align='left',ls=0,op=1) => ({type:'text',x,y,content,fontSize:size,color,fontWeight:weight,textAlign:align,letterSpacing:ls,opacity:op,fontFamily:'Inter'});
const I = (x,y,name,size,color,op=1) => ({type:'icon',x,y,name,size,color,opacity:op});
const E = (x,y,r,fill,op=1,stroke,sw) => ({type:'ellipse',x:x-r,y:y-r,width:r*2,height:r*2,fill,opacity:op,stroke,strokeWidth:sw});
const L = (x1,y1,x2,y2,stroke,strokeWidth=1) => ({type:'line',x1,y1,x2,y2,stroke,strokeWidth});

function pill(x,y,w,h,bg2,label,col,sz=11) {
  return [R(x,y,w,h,bg2,h/2), T(x+w/2,y+h*0.67,label,sz,col,'medium','center')];
}
function avatar(cx,cy,r,fill,init) {
  return [E(cx,cy,r,fill), T(cx,cy+r*0.38,init,r*0.9,'#FFF','bold','center')];
}
function statusBar() {
  return [R(0,0,W,44,surface), T(20,27,'9:41',15,text0,'semibold')];
}
function topBar(title, showBack=false, badge) {
  const out = [R(0,0,W,52,surface), L(0,52,W,52,divider)];
  if(showBack) out.push(I(16,14,'arrow-left',22,text0));
  out.push(T(W/2,33,title,17,text0,'semibold','center'));
  if(badge) out.push(...pill(W-56,15,40,22,accentPale,badge,accent,11));
  return out;
}
function bottomNav(active) {
  const tabs=[{id:'home',icon:'home',lbl:'Home'},{id:'work',icon:'layers',lbl:'Work'},{id:'time',icon:'activity',lbl:'Time'},{id:'invoice',icon:'zap',lbl:'Invoice'},{id:'insights',icon:'chart',lbl:'Insights'}];
  const out=[R(0,H-80,W,80,surface),L(0,H-80,W,H-80,divider)];
  const sw=W/tabs.length;
  tabs.forEach((t,i)=>{
    const cx=sw*i+sw/2;
    const isA=t.id===active;
    const col=isA?accent:subtle;
    out.push(I(cx-11,H-68,t.icon,22,col));
    out.push(T(cx,H-36,t.lbl,10,col,isA?'semibold':'regular','center'));
    if(isA) out.push(E(cx,H-75,3,accent));
  });
  return out;
}

// ─── Screen 1: Dashboard ─────────────────────────────────
function s1(){
  const e=[R(0,0,W,H,bg),...statusBar(),R(0,44,W,64,surface),L(0,108,W,108,divider)];
  e.push(T(20,70,'Good morning, Dani',13,subtle));
  e.push(T(20,89,'Tuesday, 1 April',17,text0,'semibold'));
  e.push(...avatar(W-36,76,20,accent,'D'));

  // Hero earnings card
  e.push(R(16,120,W-32,156,accent,20));
  e.push(E(W-30,130,80,'rgba(255,255,255,0.06)'));
  e.push(T(32,150,'EARNED THIS MONTH',10,'rgba(255,255,255,0.65)','semibold','left',1.2));
  e.push(T(32,182,'$14,280',36,'#FFF','bold'));
  e.push(T(32,204,'↑ 18% vs last month',13,'rgba(255,255,255,0.80)'));
  // mini bars
  [0.40,0.62,0.78,1.0,0.70,0.90,0.65].forEach((v,i)=>{
    const bh=Math.round(v*40);
    e.push(R(W-116+i*14,236-bh,10,bh,`rgba(255,255,255,${0.22+v*0.45})`,3));
  });
  e.push(T(W-128,248,'last 7 days',10,'rgba(255,255,255,0.50)','regular','right'));

  // Quick stats
  const hw=(W-40)/2;
  e.push(R(16,288,hw,80,surface,16));
  e.push(R(24+hw,288,hw,80,surface,16));
  e.push(I(30,302,'layers',18,accent)); e.push(T(30,324,'Active Projects',11,subtle)); e.push(T(30,345,'6',22,text0,'bold')); e.push(T(56,345,'/ 2 due',11,amber,'medium'));
  e.push(I(32+hw,302,'activity',18,green)); e.push(T(32+hw,324,'Hours This Week',11,subtle)); e.push(T(32+hw,345,'28.5h',22,text0,'bold'));

  // Upcoming invoices
  e.push(T(20,386,'Due for invoicing',13,subtle,'medium'));
  e.push(T(W-20,386,'View all →',12,accent,'regular','right'));

  const inv=[
    {name:'Lighthouse Media',task:'Web redesign — Phase 2',amt:'$4,800',status:'Due Fri',sc:amberL,tc:amber,ic:accentPale,icn:'zap',icol:accent},
    {name:'Kern & Co.',      task:'Brand identity sprint',  amt:'$2,200',status:'Sent',   sc:greenL, tc:green, ic:greenL,    icn:'check',icol:green},
    {name:'Solaris App',     task:'Monthly retainer',       amt:'$1,500',status:'Apr 15', sc:surface2,tc:subtle,ic:surface2, icn:'calendar',icol:subtle},
  ];
  inv.forEach((v,i)=>{
    const y=402+i*68;
    e.push(R(16,y,W-32,60,surface,14));
    e.push(E(38,y+30,16,v.ic));
    e.push(I(28,y+19,v.icn,22,v.icol));
    e.push(T(62,y+18,v.name,14,text0,'semibold'));
    e.push(T(62,y+36,v.task,12,subtle));
    e.push(T(W-24,y+18,v.amt,14,text0,'bold','right'));
    e.push(...pill(W-78,y+34,62,20,v.sc,v.status,v.tc,10));
  });

  // AI nudge
  e.push(R(16,612,W-32,72,accentPale,16));
  e.push(I(28,626,'zap',18,accent));
  e.push(T(52,626,'Lumio suggests',11,accent,'semibold'));
  e.push(T(52,644,'Invoice Lighthouse now to hit',12,text0));
  e.push(T(52,660,'your April target of $18K.',12,text0));
  e.push(T(W-24,658,'Do it →',12,accent,'semibold','right'));

  e.push(...bottomNav('home'));
  return e;
}

// ─── Screen 2: My Work ───────────────────────────────────
function s2(){
  const e=[R(0,0,W,H,bg),...statusBar(),...topBar('My Work')];
  e.push(...pill(16,62,68,28,accent,'All (6)','#FFF',12));
  e.push(...pill(92,62,68,28,surface,'Active',text0,12));
  e.push(...pill(168,62,80,28,surface,'Complete',subtle,12));
  e.push(T(20,112,'Total contracted',12,subtle));
  e.push(T(20,132,'$20,400',26,text0,'bold'));
  e.push(T(W-20,112,'Avg rate',12,subtle,'regular','right'));
  e.push(T(W-20,132,'$122/hr',20,accent,'bold','right'));
  e.push(L(20,152,W-20,152,divider));

  const projects=[
    {name:'Lighthouse Media',type:'Web Design',     pct:68, earned:'$4,800',total:'$7,200',col:accent,status:'Active'},
    {name:'Kern & Co.',      type:'Brand Identity',  pct:100,earned:'$6,200',total:'$6,200',col:green, status:'Done'},
    {name:'Solaris App',     type:'Product Design',  pct:35, earned:'$1,500',total:'$4,200',col:amber, status:'Active'},
    {name:'Voxel Studio',    type:'UX Audit',         pct:12, earned:'$0',    total:'$2,800',col:subtle,status:'New'},
  ];
  projects.forEach((p,i)=>{
    const y=164+i*122;
    const sbg=p.status==='Done'?greenL:p.status==='New'?surface2:accentPale;
    const scol=p.status==='Done'?green:p.status==='New'?subtle:accent;
    e.push(R(16,y,W-32,112,surface,18));
    e.push(R(16,y,5,112,p.col,3));
    e.push(T(32,y+18,p.name,15,text0,'semibold'));
    e.push(T(32,y+37,p.type,12,subtle));
    e.push(...pill(W-72,y+15,54,22,sbg,p.status,scol,11));
    e.push(T(32,y+62,'Progress',11,subtle));
    e.push(R(32,y+75,W-96,6,surface2,3));
    e.push(R(32,y+75,Math.round((W-96)*p.pct/100),6,p.col,3));
    e.push(T(W-24,y+62,`${p.pct}%`,11,p.col,'semibold','right'));
    e.push(T(32,y+94,`Earned: ${p.earned}`,12,text0,'medium'));
    e.push(T(W-24,y+94,`Contract: ${p.total}`,12,subtle,'regular','right'));
  });

  e.push(R(16,H-138,W-32,44,accent,22));
  e.push(I(W/2-50,H-124,'plus',18,'#FFF'));
  e.push(T(W/2-24,H-116,'New Project',14,'#FFF','semibold'));
  e.push(...bottomNav('work'));
  return e;
}

// ─── Screen 3: Time Tracking ─────────────────────────────
function s3(){
  const e=[R(0,0,W,H,bg),...statusBar(),...topBar('Time',false,'28.5h')];

  // Active timer
  e.push(R(16,64,W-32,148,accent,20));
  e.push(E(W-30,70,70,'rgba(255,255,255,0.05)'));
  e.push(T(32,92,'NOW TRACKING',10,'rgba(255,255,255,0.65)','semibold','left',1.2));
  e.push(T(32,116,'Lighthouse Media',18,'#FFF','bold'));
  e.push(T(32,136,'Web redesign — wireframes',13,'rgba(255,255,255,0.75)'));
  e.push(T(32,174,'2:34:18',38,'#FFF','bold'));
  e.push(E(W-34,92,6,'rgba(255,255,255,0.9)'));
  e.push(R(W-88,162,52,30,'rgba(255,255,255,0.20)',15));
  e.push(I(W-80,168,'pause',18,'#FFF'));
  e.push(T(W-56,178,'Stop',11,'#FFF','medium'));

  // Week bars
  e.push(T(20,234,'This Week',14,text0,'semibold'));
  e.push(T(W-20,234,'28.5 / 40h',12,subtle,'regular','right'));
  const days=['M','T','W','T','F','Sa','Su'];
  const hrs=[6.0,7.5,5.0,4.5,5.5,0,0];
  const maxH=60, slotW=(W-40)/7;
  days.forEach((d,i)=>{
    const bh=Math.round((hrs[i]/8)*maxH);
    const x=20+i*slotW+2, bw=slotW-6;
    const isT=i===1;
    if(bh>0) e.push(R(x,254+maxH-bh,bw,bh,isT?accent:surface2,4));
    e.push(T(x+bw/2,328,d,10,isT?accent:subtle,isT?'semibold':'regular','center'));
    if(hrs[i]>0) e.push(T(x+bw/2,314,`${hrs[i]}`,9,isT?accent:subtle,'regular','center'));
  });
  e.push(L(20,342,W-20,342,divider));
  e.push(T(20,360,"Today's log",13,subtle,'medium'));

  const logs=[
    {proj:'Lighthouse Media',task:'Wireframe review',h:'1h 20m',col:accent},
    {proj:'Kern & Co.',       task:'Final file export', h:'45m',   col:green},
    {proj:'Solaris App',      task:'User flow mapping', h:'28m',   col:amber},
  ];
  logs.forEach((lg,i)=>{
    const y=380+i*68;
    e.push(R(16,y,W-32,56,surface,14));
    e.push(R(16,y,4,56,lg.col,3));
    e.push(T(28,y+16,lg.proj,13,text0,'semibold'));
    e.push(T(28,y+34,lg.task,12,subtle));
    e.push(T(W-24,y+27,lg.h,14,text0,'semibold','right'));
  });

  // AI estimate
  e.push(R(16,590,W-32,72,surface2,16));
  e.push(I(28,604,'zap',18,accent));
  e.push(T(52,604,'AI estimate',11,accent,'semibold'));
  e.push(T(52,622,'At this pace you will hit 38h by Friday.',12,text0));
  e.push(T(52,638,'Log 1.5h tomorrow to meet your 40h goal.',12,subtle));

  e.push(...bottomNav('time'));
  return e;
}

// ─── Screen 4: Invoice Builder ───────────────────────────
function s4(){
  const e=[R(0,0,W,H,bg),...statusBar(),...topBar('New Invoice',true)];

  e.push(T(20,68,'Client',12,subtle,'medium'));
  e.push(R(16,84,W-32,52,surface,14));
  e.push(...avatar(40,110,16,accent,'L'));
  e.push(T(64,103,'Lighthouse Media',14,text0,'semibold'));
  e.push(T(64,121,'mark@lighthousemedia.co',12,subtle));
  e.push(I(W-28,103,'chevron-right',20,subtle));

  e.push(T(20,152,'Line items',12,subtle,'medium'));
  const li=[
    {desc:'Wireframe design — 12hrs @ $95',amt:'$1,140'},
    {desc:'UI design — 20hrs @ $120',      amt:'$2,400'},
    {desc:'Prototype & handoff',            amt:'$800'},
  ];
  li.forEach((l,i)=>{
    const y=168+i*66;
    e.push(R(16,y,W-32,56,surface,12));
    e.push(I(30,y+17,'list',18,subtle));
    e.push(T(54,y+16,l.desc,12,text0));
    e.push(T(54,y+34,'Edit',11,accent));
    e.push(T(W-24,y+26,l.amt,14,text0,'bold','right'));
  });
  e.push(R(16,366,W-32,44,accentPale,12));
  e.push(I(W/2-46,380,'plus',18,accent));
  e.push(T(W/2-20,389,'Add item',13,accent,'medium'));

  e.push(L(20,424,W-20,424,divider));
  e.push(T(20,440,'Subtotal',13,subtle)); e.push(T(W-20,440,'$4,340',13,text0,'regular','right'));
  e.push(T(20,462,'Tax (15%)',13,subtle)); e.push(T(W-20,462,'$651',13,text0,'regular','right'));
  e.push(L(20,480,W-20,480,divider));
  e.push(T(20,498,'Total',15,text0,'bold')); e.push(T(W-20,498,'$4,991',20,accent,'bold','right'));

  e.push(T(20,530,'Due date',12,subtle,'medium'));
  e.push(R(16,546,W-32,44,surface,12));
  e.push(I(28,558,'calendar',18,subtle));
  e.push(T(52,568,'Friday, 4 April 2025',13,text0));
  e.push(T(W-28,558,'7 days',12,subtle,'regular','right'));

  e.push(T(20,606,'Note to client',12,subtle,'medium'));
  e.push(R(16,622,W-32,56,surface,12));
  e.push(T(28,638,'Thank you for your continued partnership!',11,subtle));
  e.push(T(28,654,'Payment via bank transfer or Stripe.',11,subtle));

  e.push(R(16,H-130,W-32,48,accent,24));
  e.push(I(W/2-62,H-116,'zap',18,'#FFF'));
  e.push(T(W/2-36,H-107,'Send Invoice',15,'#FFF','semibold'));

  e.push(...bottomNav('invoice'));
  return e;
}

// ─── Screen 5: AI Insights ───────────────────────────────
function s5(){
  const e=[R(0,0,W,H,bg),...statusBar(),...topBar('Insights')];
  e.push(...pill(16,62,70,28,accent,'April','#FFF',12));
  e.push(...pill(94,62,70,28,surface,'March',subtle,12));
  e.push(...pill(172,62,56,28,surface,'Q1',subtle,12));

  e.push(R(16,104,W-32,120,surface,18));
  e.push(T(28,122,'Monthly revenue',12,subtle));
  e.push(T(28,146,'$14,280',28,text0,'bold'));
  e.push(T(28,168,'↑ 18% vs March ($12,100)',12,green,'medium'));
  const sparkVals=[0.50,0.60,0.45,0.70,0.80,0.65,0.90,0.75,1.0,0.85,0.95,1.0];
  sparkVals.forEach((v,i)=>{
    const sw2=Math.max(4,(W-56)/13);
    const x=24+i*((W-56)/12), h2=Math.round(v*38);
    e.push(R(x,210-h2,sw2,h2,accent,2,0.2+v*0.6));
  });

  e.push(T(20,244,'Top earners',13,subtle,'medium'));
  const earners=[
    {name:'Lighthouse Media',pct:42,amt:'$6,000',col:accent},
    {name:'Kern & Co.',      pct:31,amt:'$4,400',col:green},
    {name:'Solaris App',     pct:16,amt:'$2,280',col:amber},
    {name:'Other',           pct:11,amt:'$1,600',col:subtle},
  ];
  earners.forEach((e2,i)=>{
    const y=264+i*52;
    e.push(T(20,y+2,e2.name,13,text0,'medium'));
    e.push(T(W-20,y+2,e2.amt,13,text0,'semibold','right'));
    e.push(R(20,y+15,W-40,10,surface2,5));
    e.push(R(20,y+15,Math.round((W-40)*e2.pct/100),10,e2.col,5));
    e.push(T(20+Math.round((W-40)*e2.pct/100)+8,y+24,`${e2.pct}%`,10,e2.col,'medium'));
  });

  e.push(L(20,482,W-20,482,divider));
  e.push(T(20,498,'AI highlights',13,subtle,'medium'));

  const hw=(W-40)/2;
  e.push(R(16,516,hw,90,surface,14));
  e.push(I(26,528,'star',16,amber));
  e.push(T(26,546,'Best day',11,subtle)); e.push(T(26,564,'Thursday',15,text0,'bold')); e.push(T(26,580,'5.8h avg',11,subtle));

  e.push(R(24+hw,516,hw,90,surface,14));
  e.push(I(34+hw,528,'heart',16,'#C43A2F'));
  e.push(T(34+hw,546,'Client retention',11,subtle)); e.push(T(34+hw,564,'94%',15,text0,'bold')); e.push(T(34+hw,580,'↑ 8pts MoM',11,green));

  e.push(R(16,622,W-32,80,accentPale,16));
  e.push(I(28,634,'zap',18,accent));
  e.push(T(52,634,'Lumio forecast',11,accent,'semibold'));
  e.push(T(52,652,'On track for $18.2K this month. Close',12,text0));
  e.push(T(52,668,'Voxel Studio to exceed your $20K goal.',12,text0));
  e.push(T(52,686,'View action plan →',12,accent,'semibold'));

  e.push(...bottomNav('insights'));
  return e;
}

// ─── Screen 6: Onboarding ─────────────────────────────────
function s6(){
  const e=[R(0,0,W,H,bg),...statusBar()];
  e.push(T(W/2,160,'LUMIO',52,accent,'bold','center',4));
  e.push(T(W/2,196,'See your work, clearly.',17,subtle,'regular','center'));

  const feats=[
    {icn:'chart',  col:accent, bg2:accentPale,title:'Revenue intelligence',sub:'Know where every dollar comes from'},
    {icn:'activity',col:green,bg2:greenL,     title:'Smart time tracking',  sub:'Capture every billable minute'},
    {icn:'zap',    col:amber,  bg2:amberL,     title:'One-tap invoicing',    sub:'Send polished invoices in seconds'},
  ];
  feats.forEach((f,i)=>{
    const y=228+i*90;
    const indent=i===1?56:40;
    e.push(R(indent,y,W-80,72,surface,16));
    e.push(E(indent+26,y+36,18,f.bg2));
    e.push(I(indent+16,y+25,f.icn,22,f.col));
    e.push(T(indent+52,y+24,f.title,14,text0,'semibold'));
    e.push(T(indent+52,y+44,f.sub,12,subtle));
  });

  [0,1,2,3].forEach(i=>e.push(E(W/2-18+i*12,502,i===0?5:3,i===0?accent:surface2)));

  e.push(R(24,528,W-48,52,accent,26));
  e.push(T(W/2,558,'Get started — it\'s free',16,'#FFF','semibold','center'));
  e.push(T(W/2,610,'Already have an account? Sign in',13,subtle,'regular','center'));
  e.push(T(W/2,660,'✦  No credit card  ·  Cancel anytime  ✦',11,muted,'regular','center'));
  return e;
}

const pen = {
  version: '2.8',
  meta: {
    name: 'LUMIO — Freelance Financial Intelligence',
    description: 'Warm-minimal financial OS for solo creatives. Inspired by Midday.ai (darkmodedesign.com) + New Genre Studio (minimal.gallery). Light theme, copper accents.',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    theme: 'light',
    palette: { bg, surface, text: text0, accent, accent2: accentL, muted },
  },
  canvas: { width: W, height: H },
  screens: [
    { id: 'home',     name: 'Dashboard',      elements: s1() },
    { id: 'work',     name: 'My Work',         elements: s2() },
    { id: 'time',     name: 'Time Tracking',   elements: s3() },
    { id: 'invoice',  name: 'Invoice Builder', elements: s4() },
    { id: 'insights', name: 'AI Insights',     elements: s5() },
    { id: 'onboard',  name: 'Onboarding',      elements: s6() },
  ],
};

const out = path.join(__dirname, 'lumio.pen');
fs.writeFileSync(out, JSON.stringify(pen, null, 2));
const kb = (fs.statSync(out).size/1024).toFixed(1);
console.log(`✓ lumio.pen written — ${kb} KB, ${pen.screens.length} screens`);
pen.screens.forEach(s => console.log(`  · ${s.name}: ${s.elements.length} elements`));
