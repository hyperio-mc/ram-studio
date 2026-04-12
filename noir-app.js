// NOIR — Revenue intelligence for creative studios
// Dark editorial aesthetic: near-black + parchment + electric chartreuse
// Inspired by: DARKROOM (darkmodedesign.com) — massive condensed type on pure black
//              Neon DB (darkmodedesign.com)  — dense data on deep dark bg
// Theme: DARK

'use strict';
const fs = require('fs');

const W = 390, H = 844;

// Palette
const BG       = '#080808';
const SURFACE  = '#111111';
const SURFACE2 = '#1A1A1A';
const TEXT      = '#EDE8DC';
const TEXT2     = '#8A8480';
const ACCENT    = '#D4FF47';   // electric chartreuse
const ACCENT2   = '#FF5533';   // ember orange
const ACCENT3   = '#4DFFCE';   // mint teal
const BORDER    = '#242424';

// ── Primitives ────────────────────────────────────────────────────────────────
function rect(x,y,w,h,fill,radius=0,stroke=null,sw=1){
  const o={type:'rect',x,y,w,h,fill,radius};
  if(stroke){o.stroke=stroke;o.strokeWidth=sw;}
  return o;
}
function text(x,y,w,h,content,size,fill,align='left',bold=false){
  return{type:'text',x,y,w,h,content,fontSize:size,fill,align,fontWeight:bold?700:400,fontStyle:'normal'};
}
function line(x1,y1,x2,y2,stroke,sw=1){
  return{type:'line',x1,y1,x2,y2,stroke,strokeWidth:sw};
}
function circle(cx,cy,r,fill,stroke=null,sw=1){
  const o={type:'ellipse',cx,cy,rx:r,ry:r,fill};
  if(stroke){o.stroke=stroke;o.strokeWidth=sw;}
  return o;
}

// ── Status pill ──────────────────────────────────────────────────────────────
function pill(x,y,label,type='active'){
  const C={
    active:  {bg:ACCENT,  text:'#080808'},
    review:  {bg:'#2A2000',text:ACCENT  },
    hold:    {bg:'#1A1A1A',text:TEXT2   },
    done:    {bg:'#0A1F18',text:ACCENT3 },
    overdue: {bg:'#2A0E08',text:ACCENT2 },
  };
  const c=C[type]||C.active;
  const pw=label.length*6.5+14;
  return[
    rect(x,y,pw,20,c.bg,10),
    text(x,y+4,pw,12,label,9,c.text,'center',true),
  ];
}

// ── Nav bar ──────────────────────────────────────────────────────────────────
function nav(active){
  const items=[
    {label:'Dash',icon:'▣'},{label:'Pipeline',icon:'⊞'},
    {label:'Project',icon:'◈'},{label:'Clients',icon:'◎'},
    {label:'Invoices',icon:'⊟'},
  ];
  const els=[
    rect(0,H-72,W,72,'#0C0C0C',0),
    line(0,H-72,W,H-72,BORDER,0.5),
  ];
  items.forEach((item,i)=>{
    const x=(W/5)*i, iw=W/5, a=i===active;
    if(a) els.push(rect(x+iw*0.25,H-72,iw*0.5,2,ACCENT,1));
    els.push(text(x,H-50,iw,18,item.icon,15,a?ACCENT:TEXT2,'center'));
    els.push(text(x,H-31,iw,14,item.label,9,a?TEXT:TEXT2,'center'));
  });
  return els;
}

// ── Top bar ──────────────────────────────────────────────────────────────────
function topBar(title,sub=null,back=false){
  const els=[rect(0,0,W,100,BG)];
  if(back){
    els.push(text(20,55,30,22,'←',16,TEXT2,'left'));
    els.push(text(56,57,W-80,20,title,15,TEXT,'left',true));
  } else {
    // Large wordmark — editorial style
    els.push(text(20,48,160,32,'NOIR',28,TEXT,'left',true));
    if(sub) els.push(text(20,80,250,14,sub,10,TEXT2,'left'));
    // Avatar
    els.push(circle(W-34,64,14,SURFACE2,BORDER,1));
    els.push(text(W-48,56,28,16,'KW',9,TEXT2,'center',true));
    // Chartreuse dot
    els.push(circle(W-22,52,4,ACCENT));
  }
  return els;
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 1 — Dashboard
// ─────────────────────────────────────────────────────────────────────────────
function s1(){
  const ch=[];
  ch.push(rect(0,0,W,H,BG));
  ch.push(...topBar('NOIR','April 2026'));

  // ── Editorial hero number ──
  ch.push(text(20,98,W-40,14,'STUDIO REVENUE · APR 2026',10,TEXT2,'left',true));
  // Giant condensed revenue figure — the DARKROOM editorial moment
  ch.push(text(16,112,W-32,78,'$84,200',68,TEXT,'left',true));
  ch.push(rect(20,188,56,2,ACCENT));
  ch.push(text(20,194,180,14,'+18.4% vs Mar',11,ACCENT,'left'));
  ch.push(text(210,194,140,14,'3 active · 7 total',11,TEXT2,'left'));

  // ── Sparkline card ──
  ch.push(rect(20,216,W-40,60,SURFACE,8));
  const pts=[28,42,35,55,48,62,58,74,68,84,77,90];
  const sW=(W-80)/(pts.length-1), sH=38, sY=220;
  for(let i=0;i<pts.length-1;i++){
    const x1=28+i*sW, x2=28+(i+1)*sW;
    const y1=sY+sH-(pts[i]/100)*sH, y2=sY+sH-(pts[i+1]/100)*sH;
    ch.push(line(x1,y1,x2,y2,ACCENT,1.5));
    ch.push(circle(x1,y1,2,ACCENT));
  }
  const lx=28+(pts.length-1)*sW, ly=sY+sH-(pts[pts.length-1]/100)*sH;
  ch.push(circle(lx,ly,4,ACCENT));
  ch.push(circle(lx,ly,8,'transparent',ACCENT,0.5));
  ch.push(text(22,272,80,10,'Jan',9,TEXT2,'left'));
  ch.push(text(W-62,272,50,10,'Apr',9,TEXT2,'right'));

  // ── KPI chips row ──
  const kpiY=290;
  [
    {label:'PROJECTS',value:'12',sub:'active'},
    {label:'INVOICED',value:'$47K',sub:'pending'},
    {label:'UTILISATION',value:'87%',sub:'this week'},
  ].forEach((k,i)=>{
    const kx=20+i*((W-56)/3+8), kw=(W-56)/3;
    ch.push(rect(kx,kpiY,kw,68,SURFACE,8));
    ch.push(text(kx+10,kpiY+10,kw-20,10,k.label,8,TEXT2,'left',true));
    ch.push(text(kx+10,kpiY+24,kw-20,26,k.value,20,TEXT,'left',true));
    ch.push(text(kx+10,kpiY+52,kw-20,12,k.sub,9,TEXT2,'left'));
  });

  // ── Active projects ──
  ch.push(text(20,372,200,14,'ACTIVE PROJECTS',10,TEXT2,'left',true));
  ch.push(text(W-64,372,50,14,'all →',10,ACCENT,'right'));

  const projs=[
    {name:'Brand Identity',client:'Kestrel Labs',pct:75,status:'active',value:'$12,400'},
    {name:'Website Redesign',client:'Solera & Co',pct:40,status:'review',value:'$8,800'},
    {name:'Print Campaign',client:'Moth Studio',pct:90,status:'active',value:'$6,200'},
  ];
  const ac=(s)=>s==='review'?ACCENT2:ACCENT;
  projs.forEach((p,i)=>{
    const py=394+i*84;
    ch.push(rect(20,py,W-40,76,SURFACE,8));
    ch.push(rect(20,py+10,3,56,ac(p.status),2));
    ch.push(text(34,py+12,W-120,16,p.name,13,TEXT,'left',true));
    ch.push(text(34,py+30,180,12,p.client,10,TEXT2,'left'));
    ch.push(text(W-84,py+12,64,16,p.value,13,ACCENT,'right',true));
    // Progress
    ch.push(rect(34,py+52,W-84,4,SURFACE2,2));
    ch.push(rect(34,py+52,Math.round((W-84)*p.pct/100),4,ac(p.status),2));
    ch.push(text(34,py+60,60,10,`${p.pct}%`,9,TEXT2,'left'));
    ch.push(...pill(W-96,py+10,p.status.toUpperCase(),p.status));
  });

  ch.push(...nav(0));
  return ch;
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 2 — Pipeline
// ─────────────────────────────────────────────────────────────────────────────
function s2(){
  const ch=[];
  ch.push(rect(0,0,W,H,BG));
  ch.push(...topBar('Pipeline'));

  // Filter tabs
  let tx=20;
  ['All','Active','Review','Hold','Done'].forEach((t,i)=>{
    const tw=t.length*8+18, a=i===0;
    ch.push(rect(tx,96,tw,28,a?ACCENT:SURFACE,14));
    ch.push(text(tx,96+7,tw,14,t,10,a?'#080808':TEXT2,'center',a));
    tx+=tw+8;
  });

  const ac=(s)=>({active:ACCENT,review:ACCENT2,hold:TEXT2,done:ACCENT3,overdue:ACCENT2})[s]||TEXT2;
  const items=[
    {name:'Brand Identity',  client:'Kestrel Labs',  value:'$12,400',due:'Apr 18',status:'active', pct:75},
    {name:'Website Redesign',client:'Solera & Co',   value:'$8,800', due:'Apr 22',status:'review', pct:40},
    {name:'Print Campaign',  client:'Moth Studio',   value:'$6,200', due:'Apr 28',status:'active', pct:90},
    {name:'Logo Suite',      client:'Arc Ventures',  value:'$4,500', due:'May 5', status:'hold',   pct:20},
    {name:'Packaging Design',client:'Bloom Foods',   value:'$9,100', due:'May 12',status:'active', pct:55},
    {name:'Annual Report',   client:'Fenwick Cap.',  value:'$14,800',due:'Mar 30',status:'overdue',pct:65},
    {name:'UX Audit',        client:'Luma Health',   value:'$7,200', due:'Apr 10',status:'done',   pct:100},
  ];

  items.forEach((item,i)=>{
    const iy=136+i*86;
    if(iy+80>H-76) return;
    ch.push(rect(20,iy,W-40,78,SURFACE,8));
    ch.push(rect(20,iy+8,3,62,ac(item.status),2));
    ch.push(text(34,iy+10,W-130,16,item.name,13,TEXT,'left',true));
    ch.push(text(34,iy+28,180,12,item.client,10,TEXT2,'left'));
    ch.push(text(W-84,iy+10,64,16,item.value,13,TEXT,'right',true));
    ch.push(text(W-84,iy+28,64,12,`Due ${item.due}`,10,item.status==='overdue'?ACCENT2:TEXT2,'right'));
    ch.push(rect(34,iy+54,W-72,3,SURFACE2,2));
    ch.push(rect(34,iy+54,Math.round((W-72)*item.pct/100),3,ac(item.status),2));
    ch.push(text(34,iy+62,80,10,`${item.pct}% done`,9,TEXT2,'left'));
    ch.push(...pill(W-96,iy+50,item.status.toUpperCase(),item.status));
  });

  ch.push(...nav(1));
  return ch;
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 3 — Project Detail
// ─────────────────────────────────────────────────────────────────────────────
function s3(){
  const ch=[];
  ch.push(rect(0,0,W,H,BG));
  ch.push(...topBar('Brand Identity',null,true));

  ch.push(text(20,96,200,16,'Kestrel Labs',14,TEXT,'left',true));
  ch.push(...pill(W-92,93,'ACTIVE','active'));
  ch.push(text(20,114,W-40,12,'Started Mar 4 · Due Apr 18, 2026',10,TEXT2,'left'));

  // Hero value card — big editorial number
  ch.push(rect(20,136,W-40,90,SURFACE,8));
  ch.push(rect(20,136,3,90,ACCENT,8));
  ch.push(text(34,148,200,12,'CONTRACT VALUE',9,TEXT2,'left',true));
  ch.push(text(34,162,200,48,'$12,400',42,TEXT,'left',true));
  ch.push(rect(34,204,W-56,4,SURFACE2,2));
  ch.push(rect(34,204,Math.round((W-56)*0.75),4,ACCENT,2));
  ch.push(text(34,212,120,10,'75% complete',9,ACCENT,'left'));
  ch.push(text(34,212,W-60,10,'$9,300 earned',9,TEXT2,'right'));

  // Deliverables
  ch.push(text(20,238,200,14,'DELIVERABLES',10,TEXT2,'left',true));
  ch.push(text(W-64,238,50,14,'5 of 7',10,ACCENT,'right'));

  const delivs=[
    {name:'Brand Strategy Document',  done:true, date:'Mar 14'},
    {name:'Mood Board & Direction',    done:true, date:'Mar 21'},
    {name:'Logo Suite (3 concepts)',   done:true, date:'Mar 28'},
    {name:'Colour & Type System',      done:true, date:'Apr 4'},
    {name:'Brand Guidelines PDF',      done:true, date:'Apr 8'},
    {name:'Asset Library Export',      done:false,date:'Apr 14'},
    {name:'Final Handoff Package',     done:false,date:'Apr 18'},
  ];

  delivs.forEach((d,i)=>{
    const dy=258+i*44;
    if(dy+38>H-80) return;
    ch.push(rect(20,dy,W-40,36,SURFACE,6));
    if(d.done){
      ch.push(rect(32,dy+10,16,16,ACCENT,4));
      ch.push(text(32,dy+10,16,16,'✓',10,'#080808','center',true));
    } else {
      ch.push(rect(32,dy+10,16,16,SURFACE2,4,BORDER,1));
    }
    ch.push(text(56,dy+10,W-120,16,d.name,12,d.done?TEXT2:TEXT,'left'));
    ch.push(text(W-72,dy+10,60,16,d.date,10,TEXT2,'right'));
  });

  // Time row
  const ty=258+delivs.length*44+6;
  if(ty+54<H-76){
    ch.push(rect(20,ty,W-40,54,SURFACE2,8));
    ch.push(text(34,ty+10,120,12,'TIME LOGGED',9,TEXT2,'left',true));
    ch.push(text(34,ty+26,120,20,'42.5 hrs',16,TEXT,'left',true));
    ch.push(text(W-136,ty+10,110,12,'RATE',9,TEXT2,'left',true));
    ch.push(text(W-136,ty+26,110,20,'$150 / hr',16,ACCENT,'left',true));
  }

  ch.push(...nav(2));
  return ch;
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 4 — Clients
// ─────────────────────────────────────────────────────────────────────────────
function s4(){
  const ch=[];
  ch.push(rect(0,0,W,H,BG));
  ch.push(...topBar('Clients'));

  // Search
  ch.push(rect(20,96,W-40,36,SURFACE,18,BORDER,0.5));
  ch.push(text(42,107,W-80,14,'⌕  Search clients…',12,TEXT2,'left'));

  // Sort chips
  let sx=20;
  ['All','Top Revenue','Active'].forEach((s,i)=>{
    const sw=s.length*7.5+18, a=i===0;
    ch.push(rect(sx,144,sw,24,a?SURFACE2:'transparent',12,a?ACCENT:'transparent',a?0.5:0));
    ch.push(text(sx,144+5,sw,14,s,10,a?TEXT:TEXT2,'center'));
    sx+=sw+8;
  });

  const clients=[
    {name:'Kestrel Labs',    init:'KL',revenue:'$24,800',projs:3,status:'active',  color:ACCENT },
    {name:'Solera & Co',     init:'SC',revenue:'$18,400',projs:2,status:'active',  color:ACCENT3},
    {name:'Moth Studio',     init:'MS',revenue:'$14,200',projs:4,status:'active',  color:ACCENT2},
    {name:'Arc Ventures',    init:'AV',revenue:'$9,600', projs:1,status:'hold',    color:TEXT2  },
    {name:'Fenwick Capital', init:'FC',revenue:'$29,800',projs:5,status:'active',  color:ACCENT },
    {name:'Bloom Foods',     init:'BF',revenue:'$11,200',projs:2,status:'active',  color:ACCENT3},
  ];

  clients.forEach((c,i)=>{
    const cy=178+i*86;
    if(cy+80>H-76) return;
    ch.push(rect(20,cy,W-40,78,SURFACE,8));
    ch.push(circle(53,cy+39,21,SURFACE2,c.color,1.5));
    ch.push(text(32,cy+29,42,20,c.init,13,c.color,'center',true));
    ch.push(text(84,cy+14,W-180,18,c.name,14,TEXT,'left',true));
    ch.push(text(84,cy+34,180,12,`${c.projs} project${c.projs>1?'s':''} · ${c.status}`,10,TEXT2,'left'));
    ch.push(text(84,cy+50,W-120,18,c.revenue,13,c.color,'left',true));
    ch.push(text(W-50,cy+31,30,14,'→',13,TEXT2,'right'));
  });

  ch.push(...nav(3));
  return ch;
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 5 — Invoices
// ─────────────────────────────────────────────────────────────────────────────
function s5(){
  const ch=[];
  ch.push(rect(0,0,W,H,BG));
  ch.push(...topBar('Invoices'));

  // Summary strip
  ch.push(rect(20,96,W-40,72,SURFACE,8));
  [
    {label:'TOTAL OUT',value:'$47,200',color:TEXT},
    {label:'OVERDUE',  value:'$8,400', color:ACCENT2},
    {label:'PAID MTD', value:'$36,800',color:ACCENT3},
  ].forEach((s,i)=>{
    const sx=20+i*((W-40)/3), sw=(W-40)/3;
    if(i>0) ch.push(line(sx,108,sx,156,BORDER,0.5));
    ch.push(text(sx,108,sw,12,s.label,8,TEXT2,'center',true));
    ch.push(text(sx,124,sw,28,s.value,18,s.color,'center',true));
  });

  ch.push(text(20,182,200,14,'RECENT INVOICES',10,TEXT2,'left',true));
  ch.push(text(W-64,182,50,14,'New +',10,ACCENT,'right'));

  const ac=(s)=>({active:ACCENT,done:ACCENT3,overdue:ACCENT2,hold:TEXT2})[s]||TEXT2;
  [
    {id:'INV-0042',client:'Kestrel Labs',   amount:'$6,200', due:'Apr 15',status:'overdue'},
    {id:'INV-0041',client:'Fenwick Capital',amount:'$14,800',due:'Apr 18',status:'active' },
    {id:'INV-0040',client:'Moth Studio',    amount:'$3,100', due:'Apr 22',status:'active' },
    {id:'INV-0039',client:'Solera & Co',    amount:'$8,800', due:'Apr 28',status:'active' },
    {id:'INV-0038',client:'Bloom Foods',    amount:'$4,500', due:'Mar 28',status:'done'   },
    {id:'INV-0037',client:'Arc Ventures',   amount:'$9,800', due:'Mar 20',status:'done'   },
  ].forEach((inv,i)=>{
    const iy=202+i*88;
    if(iy+82>H-76) return;
    ch.push(rect(20,iy,W-40,80,SURFACE,8));
    ch.push(rect(20,iy+8,3,64,ac(inv.status),2));
    ch.push(text(36,iy+12,120,13,inv.id,11,TEXT2,'left',true));
    ch.push(...pill(W-96,iy+10,inv.status.toUpperCase(),inv.status));
    ch.push(text(36,iy+28,W-90,18,inv.client,14,TEXT,'left',true));
    ch.push(text(36,iy+48,120,12,`Due ${inv.due}`,10,inv.status==='overdue'?ACCENT2:TEXT2,'left'));
    ch.push(text(W-84,iy+28,64,24,inv.amount,18,TEXT,'right',true));
  });

  ch.push(...nav(4));
  return ch;
}

// ─────────────────────────────────────────────────────────────────────────────
// Assemble
// ─────────────────────────────────────────────────────────────────────────────
const screens=[
  {id:'dashboard', label:'Dashboard',     children:s1()},
  {id:'pipeline',  label:'Pipeline',      children:s2()},
  {id:'project',   label:'Project Detail',children:s3()},
  {id:'clients',   label:'Clients',       children:s4()},
  {id:'invoices',  label:'Invoices',      children:s5()},
];

const pen={
  version:'2.8',
  name:'NOIR — Revenue Intelligence',
  description:"Dark editorial studio dashboard. Near-black + parchment cream + electric chartreuse. Inspired by DARKROOM's massive condensed type treatment and Neon DB's data-dense dark UI.",
  width:W,height:H,screens,
};

fs.writeFileSync('noir.pen',JSON.stringify(pen,null,2));
console.log('✓ noir.pen written —',screens.length,'screens');
screens.forEach(s=>console.log('  ·',s.label,`(${s.children.length} elements)`));
