// opal-app.js — OPAL: Creative Vitals for Makers
// Theme: LIGHT (previous design 'zeal' was DARK)
//
// Inspired by:
//   Superpower health app (godly.website) — dominant warm amber/orange (#D4600A)
//     full-bleed editorial background, humanist serif headline "A new era of personal health",
//     cinematic editorial feel, wellness UX patterns for personal tracking
//   SaaSpo bento grid trend — modular cards of varying sizes for SaaS dashboard sections
//   Studio Herrstrom (darkmodedesign.com) — bold editorial case study layouts,
//     strong typographic hierarchy
//
// Design challenge: Apply wellness/health app UX patterns to creative professional tracking.
//   Push: bento grid dashboard, warm earthy light palette (counter to cool tech blues),
//         editorial serif-influenced hierarchy, real data over abstract 3D

'use strict';
const fs = require('fs');
const path = require('path');

const W = 390, H = 844;

// LIGHT palette — warm cream/ivory + terracotta amber + deep cobalt
const BG      = '#F8F4EE';   // warm ivory/cream (Superpower amber lineage)
const SURFACE = '#FFFFFF';
const SURF2   = '#F2EDE4';   // warm secondary surface
const TEXT    = '#1C1714';   // near-black warm
const TEXT2   = '#7A6F68';   // warm muted brown-grey
const ACCENT  = '#C85A0A';   // deep terracotta amber
const ACCENT2 = '#2A4BAB';   // deep cobalt blue (data)
const ACCENTL = '#F4DFD0';   // amber tint
const ACCENT2L= '#D6E0F7';   // cobalt tint
const GREENL  = '#D5EDDF';
const GREEN   = '#2E7D57';
const RED     = '#C02B2B';
const REDL    = '#FADADD';
const BORDER  = 'rgba(28,23,20,0.08)';
const BORD2   = 'rgba(28,23,20,0.14)';

let _id = 1;
const uid = () => `el_${_id++}`;

const rect  = (x,y,w,h,fill,r=0) => ({id:uid(),type:'rect',x,y,width:w,height:h,fill,cornerRadius:r,stroke:'none',strokeWidth:0});
const bRect = (x,y,w,h,r,stroke=BORDER,sw=1,fill='none') => ({id:uid(),type:'rect',x,y,width:w,height:h,fill,cornerRadius:r,stroke,strokeWidth:sw});
const line  = (x1,y1,x2,y2,stroke=BORDER,sw=0.5) => ({id:uid(),type:'line',x1,y1,x2,y2,stroke,strokeWidth:sw});
const txt   = (content,x,y,size,fill,weight='regular',align='left',width=0) => ({id:uid(),type:'text',content,x,y,fontSize:size,fill,fontWeight:weight,textAlign:align,...(width>0?{width}:{})});
const circ  = (cx,cy,r,fill) => ({id:uid(),type:'ellipse',x:cx-r,y:cy-r,width:r*2,height:r*2,fill,stroke:'none',strokeWidth:0});
const pill  = (x,y,w,h,fill,r=999,stroke='none',sw=0) => ({id:uid(),type:'rect',x,y,width:w,height:h,fill,cornerRadius:r,stroke,strokeWidth:sw});

function statusBar(sx) {
  return [
    rect(sx,0,W,44,'transparent'),
    txt('9:41',sx+16,13,13,TEXT,'semibold'),
    txt('◉ ▲ ◈',sx+W-56,13,11,TEXT2),
  ];
}

function nav(sx, active) {
  const navY = H-82;
  const items = [{icon:'◈',label:'Vitals'},{icon:'◎',label:'Output'},{icon:'⬡',label:'Projects'},{icon:'▲',label:'Streaks'},{icon:'✦',label:'Insight'}];
  const els = [rect(sx,navY,W,82,SURFACE), line(sx,navY,sx+W,navY,BORD2,1)];
  const cw = W/items.length;
  items.forEach(({icon,label},i) => {
    const cx = sx+cw*i+cw/2;
    const on = i===active;
    const col = on ? ACCENT : TEXT2;
    if (on) els.push(pill(cx-16,navY+4,32,3,ACCENT,999));
    els.push(txt(icon,cx-8,navY+14,17,col,on?'bold':'regular'));
    els.push(txt(label,cx-cw/2+2,navY+38,9,col,on?'semibold':'regular','center',cw-4));
  });
  return els;
}

// ── Screen 0: Vitals Dashboard (bento grid) ──────────────────────────────────
function screenDashboard(sx) {
  const els = [rect(sx,0,W,H,BG), ...statusBar(sx)];
  // Header
  els.push(txt('OPAL',sx+20,52,11,ACCENT,'bold'));
  els.push(txt('Mon, 7 Apr',sx+W-88,54,11,TEXT2));
  els.push(txt('Good morning,',sx+20,72,18,TEXT2,'regular','left',200));
  els.push(txt('Zara.',sx+20,94,28,TEXT,'bold'));

  // ── Bento row 1: large score card + small streak card
  const r1y = 132, padL = 20, gap = 10;
  const card1w = 218, card1h = 128;

  // Big card: Creative Score (amber filled)
  els.push(rect(sx+padL,r1y,card1w,card1h,ACCENT,14));
  els.push(txt('Creative Score',sx+padL+14,r1y+14,10,'rgba(255,255,255,0.7)','semibold'));
  els.push(txt('84',sx+padL+14,r1y+28,48,'#FFFFFF','bold'));
  els.push(txt('/100',sx+padL+72,r1y+56,14,'rgba(255,255,255,0.6)'));
  // Decorative circles
  els.push(circ(sx+padL+card1w-40,r1y+card1h/2,32,'rgba(255,255,255,0.10)'));
  els.push(circ(sx+padL+card1w-40,r1y+card1h/2,20,'rgba(255,255,255,0.13)'));
  els.push(txt('↑ 6 pts this week',sx+padL+14,r1y+card1h-20,9.5,'rgba(255,255,255,0.75)'));

  // Small streak card
  const c2x = sx+padL+card1w+gap;
  const c2w = W-padL-card1w-gap-padL;
  els.push(rect(c2x,r1y,c2w,card1h,SURF2,14));
  els.push(txt('▲',c2x+c2w/2-9,r1y+18,20,ACCENT,'bold'));
  els.push(txt('12',c2x+4,r1y+44,30,TEXT,'bold','center',c2w));
  els.push(txt('day\nstreak',c2x+4,r1y+80,10,TEXT2,'regular','center',c2w));

  // ── Bento row 2: three mini metric cards
  const r2y = r1y+card1h+gap;
  const cw3 = (W-padL*2-gap*2)/3;
  [
    {label:'Words',value:'1,840',sub:'↑ 12%',bg:ACCENTL,tc:ACCENT},
    {label:'Focus',value:'3.5h',sub:'of 4h goal',bg:GREENL,tc:GREEN},
    {label:'Designs',value:'7',sub:'today',bg:ACCENT2L,tc:ACCENT2},
  ].forEach(({label,value,sub,bg,tc},i) => {
    const mx = sx+padL+i*(cw3+gap);
    els.push(rect(mx,r2y,cw3,82,bg,12));
    els.push(txt(label,mx+10,r2y+12,9.5,TEXT2));
    els.push(txt(value,mx+10,r2y+28,20,TEXT,'bold'));
    els.push(txt(sub,mx+10,r2y+55,9,tc,'semibold'));
  });

  // ── Bento row 3: activity bar chart
  const r3y = r2y+82+gap;
  els.push(rect(sx+padL,r3y,W-padL*2,92,SURFACE,14));
  els.push(bRect(sx+padL,r3y,W-padL*2,92,14,BORDER,1,'none'));
  els.push(txt("Today's activity",sx+padL+14,r3y+12,10,TEXT2,'semibold'));
  const hours = [0.15,0.4,0.85,0.6,0.25,0.7,1.0,0.8,0.4,0.55,0.5,0.65];
  const bw=15, bg=5, chH=42, baseY=r3y+60, csx=sx+padL+14;
  hours.forEach((v,i) => {
    const bh = Math.round(v*chH);
    els.push(rect(csx+i*(bw+bg),baseY-bh,bw,bh,i===7?ACCENT:'rgba(200,90,10,0.18)',3));
  });
  els.push(txt('6am',csx,r3y+74,8,TEXT2));
  els.push(txt('Now',csx+7*(bw+bg),r3y+74,8,ACCENT,'semibold'));

  // ── Bento row 4: insight teaser
  const r4y = r3y+92+gap;
  els.push(rect(sx+padL,r4y,W-padL*2,60,SURF2,14));
  els.push(txt('✦  Weekly insight',sx+padL+14,r4y+12,10,ACCENT,'semibold'));
  els.push(txt('Peak creative window: 9–11am · 60% of your best work happens then.',sx+padL+14,r4y+30,11,TEXT,'regular','left',W-padL*2-28));
  els.push(txt('See full insight →',sx+padL+14,r4y+46,9.5,ACCENT2,'semibold'));

  els.push(...nav(sx,0));
  return els;
}

// ── Screen 1: Output ─────────────────────────────────────────────────────────
function screenOutput(sx) {
  const els = [rect(sx,0,W,H,BG), ...statusBar(sx)];
  els.push(txt("Today's Output",sx+20,52,22,TEXT,'bold'));
  els.push(txt('Tuesday · track your disciplines',sx+20,80,11,TEXT2,'regular','left',W-40));
  els.push(line(sx,100,sx+W,100,BORDER,0.5));

  // Day selector
  'MTWTFSS'.split('').forEach((d,i) => {
    const dx = sx+20+i*48, on = i===1;
    els.push(pill(dx,110,36,36,on?ACCENT:SURFACE,8,on?'none':BORDER,on?0:1));
    els.push(txt(d,dx+14,121,11,on?'#FFF':TEXT2,on?'bold':'regular'));
  });

  const disciplines = [
    {label:'Writing',value:'1,840 words',pct:73,target:'2,500 goal',col:ACCENT},
    {label:'Design',value:'7 frames',pct:88,target:'8 target',col:ACCENT2},
    {label:'Code',value:'142 lines',pct:47,target:'300 goal',col:GREEN},
    {label:'Reading',value:'28 pages',pct:56,target:'50 goal',col:'#7C3AED'},
    {label:'Deep focus',value:'3.5 hours',pct:87,target:'4h goal',col:ACCENT},
  ];
  disciplines.forEach(({label,value,pct,target,col},i) => {
    const iy = 162+i*86;
    els.push(rect(sx+20,iy,W-40,74,SURFACE,12));
    els.push(bRect(sx+20,iy,W-40,74,12,BORDER,1,'none'));
    els.push(txt(label,sx+34,iy+13,12,TEXT,'semibold'));
    els.push(txt(value,sx+34,iy+30,18,TEXT,'bold'));
    els.push(txt(target,sx+W-60,iy+13,9.5,TEXT2));
    els.push(txt(pct+'%',sx+W-50,iy+30,13,col,'bold'));
    // progress track
    els.push(rect(sx+34,iy+57,W-80,5,'rgba(28,23,20,0.10)',999));
    els.push(rect(sx+34,iy+57,Math.round((W-80)*(pct/100)),5,col,999));
  });

  els.push(...nav(sx,1));
  return els;
}

// ── Screen 2: Projects ────────────────────────────────────────────────────────
function screenProjects(sx) {
  const els = [rect(sx,0,W,H,BG), ...statusBar(sx)];
  els.push(txt('Projects',sx+20,52,22,TEXT,'bold'));
  els.push(txt('5 active · 2 on track · 1 at risk',sx+20,80,11,TEXT2));
  els.push(line(sx,100,sx+W,100,BORDER,0.5));

  let fx = sx+20;
  ['All','Writing','Design','Code'].forEach((f,i) => {
    const fw = f.length*7.5+20;
    els.push(pill(fx,110,fw,28,i===0?ACCENT:SURFACE,999,i===0?'none':BORDER,i===0?0:1));
    els.push(txt(f,fx+fw/2-f.length*3.5,118,10.5,i===0?'#FFF':TEXT2,i===0?'semibold':'regular'));
    fx += fw+8;
  });

  const projects = [
    {name:'Essay: On Creative Burnout',cat:'Writing',pct:72,days:4,risk:false,tag:'Due Apr 11'},
    {name:'Brand Identity — Studio K',cat:'Design',pct:88,days:2,risk:false,tag:'Due Apr 9'},
    {name:'Short Story: The Cartographer',cat:'Writing',pct:31,days:8,risk:true,tag:'Due Apr 15'},
    {name:'Personal Site Redesign',cat:'Code',pct:55,days:12,risk:false,tag:'Due Apr 19'},
    {name:'Photography Zine, Vol.3',cat:'Design',pct:64,days:6,risk:false,tag:'Due Apr 13'},
  ];
  const catBg = {Writing:ACCENTL,Design:ACCENT2L,Code:GREENL};
  const catTx = {Writing:ACCENT,Design:ACCENT2,Code:GREEN};
  projects.forEach(({name,cat,pct,risk,tag},i) => {
    const py = 152+i*94;
    els.push(rect(sx+20,py,W-40,80,SURFACE,12));
    els.push(bRect(sx+20,py,W-40,80,12,risk?'rgba(192,43,43,0.25)':BORDER,1,'none'));
    els.push(pill(sx+34,py+12,cat.length*7+14,20,catBg[cat]||SURF2,999));
    els.push(txt(cat,sx+41,py+16,9,catTx[cat]||TEXT2,'semibold'));
    els.push(circ(sx+W-40-12,py+22,5,risk?RED:GREEN));
    els.push(txt(name,sx+34,py+38,12,TEXT,'semibold','left',W-80));
    const tw = W-80;
    els.push(rect(sx+34,py+62,tw,4,'rgba(28,23,20,0.10)',999));
    els.push(rect(sx+34,py+62,Math.round(tw*(pct/100)),4,risk?RED:ACCENT2,999));
    els.push(txt(pct+'%',sx+34,py+70,8.5,TEXT2));
    els.push(txt(tag,sx+W-40-52,py+70,8.5,risk?RED:TEXT2));
  });

  els.push(...nav(sx,2));
  return els;
}

// ── Screen 3: Streaks ─────────────────────────────────────────────────────────
function screenStreaks(sx) {
  const els = [rect(sx,0,W,H,BG), ...statusBar(sx)];
  els.push(txt('Creative Rituals',sx+20,52,22,TEXT,'bold'));
  els.push(txt('Build the habits that build your work',sx+20,80,11,TEXT2));
  els.push(line(sx,100,sx+W,100,BORDER,0.5));

  // Hero streak banner
  els.push(rect(sx+20,112,W-40,86,ACCENT,14));
  els.push(txt('12',sx+36,118,44,'#FFFFFF','bold'));
  els.push(txt('day streak',sx+88,136,13,'rgba(255,255,255,0.8)'));
  els.push(txt('🔥 Personal best: 21 days',sx+36,172,10,'rgba(255,255,255,0.65)'));
  els.push(circ(sx+W-40-28,118+43,38,'rgba(255,255,255,0.08)'));
  els.push(circ(sx+W-40-28,118+43,24,'rgba(255,255,255,0.12)'));

  const habits = [
    {name:'Morning write',time:'6:30am',streak:12,days:[1,1,1,1,1,1,1]},
    {name:'Design review',time:'11am',streak:5,days:[0,1,1,0,1,1,1]},
    {name:'Evening read',time:'9pm',streak:9,days:[1,1,0,1,1,1,1]},
    {name:'Deep work block',time:'2pm',streak:3,days:[0,0,1,1,0,1,1]},
  ];
  const dayL = 'MTWTFSS'.split('');
  habits.forEach(({name,time,streak,days},i) => {
    const hy = 212+i*86;
    els.push(rect(sx+20,hy,W-40,74,SURFACE,12));
    els.push(bRect(sx+20,hy,W-40,74,12,BORDER,1,'none'));
    els.push(txt(name,sx+34,hy+12,12,TEXT,'semibold'));
    els.push(txt(time,sx+34,hy+30,9.5,TEXT2));
    els.push(txt(streak+'d',sx+W-40-30,hy+12,13,ACCENT,'bold'));
    const dotR=9, dotG=5, dsx=sx+34;
    days.forEach((done,j) => {
      const dx = dsx+j*(dotR*2+dotG);
      els.push(circ(dx+dotR,hy+56,dotR,done?ACCENTL:'rgba(28,23,20,0.07)'));
      if(done) els.push(circ(dx+dotR,hy+56,4,ACCENT));
      els.push(txt(dayL[j],dx+dotR-4,hy+51,7,done?ACCENT:TEXT2));
    });
  });

  els.push(...nav(sx,3));
  return els;
}

// ── Screen 4: Weekly Insight ─────────────────────────────────────────────────
function screenInsight(sx) {
  const els = [rect(sx,0,W,H,BG), ...statusBar(sx)];
  els.push(txt('Weekly Insight',sx+20,52,22,TEXT,'bold'));
  els.push(txt('Mar 31 – Apr 6',sx+20,80,11,TEXT2));
  els.push(line(sx,100,sx+W,100,BORDER,0.5));

  // Narrative card
  els.push(rect(sx+20,112,W-40,110,SURF2,14));
  els.push(txt('✦  AI Reflection',sx+34,124,10,ACCENT,'semibold'));
  els.push(txt('You wrote 9,200 words this week — your highest since February. Focus blocks averaged 2.1h. Design dipped mid-week but recovered Friday.',sx+34,140,11.5,TEXT,'regular','left',W-68));

  // Comparison table
  const m0y = 236;
  els.push(txt('This week',sx+W-40-112,m0y-14,9,TEXT2,'semibold'));
  els.push(txt('vs last',sx+W-40-50,m0y-14,9,TEXT2));
  [
    {label:'Total words',tw:'9,200',lw:'7,840',up:true},
    {label:'Focus hours',tw:'17.5h',lw:'14.2h',up:true},
    {label:'Designs made',tw:'18',lw:'21',up:false},
    {label:'Projects',tw:'4',lw:'3',up:true},
  ].forEach(({label,tw,lw,up},i) => {
    const my = m0y+i*43;
    els.push(line(sx+20,my,sx+W-20,my,BORDER,0.5));
    els.push(txt(label,sx+34,my+12,11,TEXT));
    els.push(txt(tw,sx+W-40-108,my+12,13,TEXT,'bold'));
    els.push(txt(up?'↑':'↓',sx+W-40-50,my+12,11,up?GREEN:RED));
    els.push(txt(lw,sx+W-40-34,my+12,11,TEXT2));
  });
  els.push(line(sx+20,m0y+4*43,sx+W-20,m0y+4*43,BORDER,0.5));

  // Advice card
  const advy = m0y+4*43+14;
  els.push(rect(sx+20,advy,W-40,78,ACCENT2L,14));
  els.push(txt('💡  Next week\'s focus',sx+34,advy+14,10,ACCENT2,'semibold'));
  els.push(txt('Protect your 9–11am window. Try a no-meetings rule on Tuesday and Thursday — that\'s when your deep work peaks.',sx+34,advy+30,11.5,TEXT,'regular','left',W-68));

  els.push(...nav(sx,4));
  return els;
}

// ── Assemble ──────────────────────────────────────────────────────────────────
const screens = [
  {id:'vitals',   name:'Vitals Dashboard', elements:screenDashboard(0)},
  {id:'output',   name:"Today's Output",   elements:screenOutput(W+30)},
  {id:'projects', name:'Projects',         elements:screenProjects((W+30)*2)},
  {id:'streaks',  name:'Streaks',          elements:screenStreaks((W+30)*3)},
  {id:'insight',  name:'Weekly Insight',   elements:screenInsight((W+30)*4)},
];

const pen = {
  version:'2.8', name:'OPAL',
  description:'Creative vitals tracker for makers. Light theme: warm ivory (#F8F4EE) meets terracotta amber (#C85A0A) and deep cobalt (#2A4BAB). Inspired by Superpower health app editorial aesthetic (godly.website) + SaaSpo bento grid trends. 5 screens: Vitals Dashboard, Output Tracker, Projects, Streaks, Weekly Insight.',
  width:W, height:H, background:BG, screens,
};

const outPath = path.join(__dirname,'opal.pen');
fs.writeFileSync(outPath, JSON.stringify(pen,null,2));
console.log(`✓ opal.pen written (${(fs.statSync(outPath).size/1024).toFixed(1)} KB, ${screens.length} screens)`);
screens.forEach(s => console.log(`  · ${s.name}: ${s.elements.length} elements`));
