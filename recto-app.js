// RECTO — Personal Reading Library & Progress Tracker
// Dark theme: void purple-black #09080C + warm amber #C8A97E + glass morphism
// Inspired by:
//   1. "Fluid Glass" (Awwwards SOTD Apr 2026) — glass morphism depth + layered surfaces
//   2. "Litbix" book UI on Minimal Gallery — spatial shelf layout, book stack metaphor
//   3. Midday.ai dark product UI (darkmodedesign.com) — ambient glow, clean dark chrome

const fs = require('fs');

const W = 390, H = 844;
const BG      = '#09080C';
const GLASS   = 'rgba(255,255,255,0.07)';
const GLASS2  = 'rgba(255,255,255,0.11)';
const TEXT    = '#F2EDE8';
const TMID    = 'rgba(242,237,232,0.58)';
const TDIM    = 'rgba(242,237,232,0.32)';
const AMBER   = '#C8A97E';   // candlelight gold
const VIOLET  = '#7C6DF0';   // deep violet
const TEAL    = '#5EC4A8';   // sage teal
const BORDER  = 'rgba(255,255,255,0.08)';

let _id = 0;
const uid = () => `r${++_id}`;

// ── helpers ──────────────────────────────────────────────────────────────────

const bg = (fill=BG) => ({ id:uid(), type:'rect', x:0, y:0, width:W, height:H, fill, radius:0, opacity:1 });

const glow = (x,y,w,h,color) => ({ id:uid(), type:'ellipse', x, y, width:w, height:h, fill:color, radius:0, opacity:1 });

const rect = (x,y,w,h,fill,r=0,stroke=null,sw=0) => ({
  id:uid(), type:'rect', x, y, width:w, height:h, fill, radius:r, opacity:1,
  ...(stroke ? {stroke,strokeWidth:sw} : {})
});

const ellipse = (x,y,w,h,fill,stroke=null,sw=0) => ({
  id:uid(), type:'ellipse', x, y, width:w, height:h, fill, radius:0, opacity:1,
  ...(stroke ? {stroke,strokeWidth:sw} : {})
});

const txt = (x,y,content,size,weight,fill,align='left',family='Inter',spacing=0,ww=0) => ({
  id:uid(), type:'text', x, y, width:ww, height:0, content, fontSize:size,
  fontWeight:String(weight), fill, align, fontFamily:family, opacity:1, letterSpacing:spacing
});

const card = (x,y,w,h,r=16,fill=GLASS,stroke=BORDER,sw=0.5) =>
  rect(x,y,w,h,fill,r,stroke,sw);

const statusBar = () => [
  txt(20,14,'9:41',13,'600',TEXT),
  txt(316,15,'▲▲▲',7,'normal',TDIM,'left','Inter',1),
  txt(352,13,'⬡',14,'normal',TMID),
  txt(368,13,'■',14,'normal',TMID),
];

const nav = (active=0) => {
  const tabs = [
    {icon:'⊞',label:'Library', x:28},
    {icon:'◈',label:'Discover',x:90},
    {icon:'◎',label:'Session', x:164},
    {icon:'◷',label:'Stats',   x:238},
    {icon:'⊙',label:'Profile', x:308},
  ];
  const out = [
    rect(0,H-80,W,80,'rgba(10,8,14,0.97)'),
    rect(0,H-80,W,0.5,BORDER),
    rect(128,H-8,134,4,'rgba(242,237,232,0.28)',2),
  ];
  tabs.forEach(({icon,label,x},i) => {
    const on = i===active;
    const col = on ? AMBER : TDIM;
    if(on) out.push(rect(x+11,H-71,18,2,AMBER,1));
    out.push(txt(x,H-66,icon,18,'normal',col,'left','Inter',0,40));
    out.push(txt(x-5,H-44,label,9,on?'600':'400',col,'center','Inter',0.3,50));
  });
  return out;
};

// ── SCREEN 1 — Library ───────────────────────────────────────────────────────
function s1() {
  const els = [bg()];

  // lamp glow behind hero
  els.push(glow(50,105,290,155,'rgba(200,169,126,0.08)'));
  els.push(glow(100,120,195,110,'rgba(200,169,126,0.05)'));

  els.push(...statusBar());

  // header
  els.push(txt(20,56,'RECTO',11,'700',AMBER,'left','Inter',3));
  els.push(txt(20,74,'Your Reading Library',22,'300',TEXT,'left','Georgia',-0.3));
  // avatar btn
  els.push(ellipse(346,60,36,36,GLASS,BORDER,0.5));
  els.push(txt(352,73,'E',16,'300',AMBER,'left','Georgia'));

  // ── Currently Reading hero card ──
  els.push(card(20,110,350,150,20,GLASS2,BORDER,0.5));
  // left amber accent bar
  els.push(rect(20,110,4,150,AMBER,2));

  // book cover
  els.push(rect(36,122,74,112,VIOLET+'30',10,BORDER,0.5));
  els.push(rect(38,124,26,52,'rgba(255,255,255,0.05)',7));
  els.push(txt(60,167,'◈',32,'normal',VIOLET,'center','Inter',0,54));

  // book meta
  els.push(txt(122,126,'CURRENTLY READING',8,'600',AMBER,'left','Inter',2.5));
  els.push(txt(122,141,'The Buried Giant',17,'400',TEXT,'left','Georgia',-0.3,220));
  els.push(txt(122,161,'Kazuo Ishiguro',12,'400',TMID,'left','Inter',0,180));
  // progress
  els.push(txt(122,183,'Chapter 14 of 23',10,'400',TDIM,'left','Inter',0));
  els.push(rect(122,197,230,5,BORDER,2.5));
  els.push(rect(122,197,140,5,AMBER,2.5));       // 61%
  els.push(txt(318,193,'61%',10,'600',AMBER));
  // streak badge
  els.push(rect(122,214,92,22,'rgba(200,169,126,0.11)',11,AMBER+'30',0.5));
  els.push(txt(133,221,'🔥 12-day streak',9,'500',AMBER));

  // ── Up Next ──
  els.push(txt(20,276,'Up Next',16,'300',TEXT,'left','Georgia'));
  els.push(txt(314,277,'See all →',11,'400',TDIM));

  const queue = [
    {title:'Piranesi',      author:'Clarke',   color:'#3A5A6E'},
    {title:'Klara & the\nSun', author:'Ishiguro',color:'#4A3A5E'},
    {title:'Tomorrow,\nTomorrow',author:'Reid',color:'#3D5A4A'},
  ];
  queue.forEach((b,i) => {
    const cx = 20+i*122;
    els.push(rect(cx,295,112,155,b.color+'44',12,BORDER,0.5));
    els.push(rect(cx,295,4,155,b.color+'AA',2));
    els.push(txt(cx+12,320,b.title,13,'400',TEXT,'left','Georgia',-0.2,92));
    els.push(txt(cx+12,350,b.author,10,'400',TDIM,'left','Inter',0,92));
    const genres=['Literary','Fantasy','Drama'];
    els.push(rect(cx+12,425,58,16,'rgba(255,255,255,0.06)',8));
    els.push(txt(cx+18,430,genres[i],8,'400',TMID,'left','Inter',0.4));
  });

  // ── This Year ──
  els.push(txt(20,464,'Read This Year',16,'300',TEXT,'left','Georgia'));
  els.push(txt(294,465,'14 books →',11,'400',TDIM));

  const spines = [VIOLET,AMBER,TEAL,'#E07B6A','#A8C87E','#6BAED6','#D4A8D4'];
  spines.forEach((c,i) => {
    const sx = 20+i*50;
    els.push(rect(sx,484,42,66,c+'28',6,c+'40',0.5));
    els.push(rect(sx,484,3,66,c+'80',1));
  });

  els.push(...nav(0));
  return {id:'s1',label:'Library',width:W,height:H,elements:els};
}

// ── SCREEN 2 — Book Detail ────────────────────────────────────────────────────
function s2() {
  const els = [bg()];

  els.push(glow(40,75,310,210,'rgba(124,109,240,0.08)'));

  els.push(...statusBar());
  els.push(txt(20,56,'← Library',13,'400',TMID));

  // Large cover
  els.push(rect(20,80,112,158,VIOLET+'28',14,VIOLET+'30',0.5));
  els.push(rect(24,84,30,60,'rgba(255,255,255,0.05)',8));
  els.push(txt(52,150,'◈',38,'normal',VIOLET,'center','Inter',0,60));

  // Meta
  els.push(txt(144,84,'The Buried Giant',20,'400',TEXT,'left','Georgia',-0.3,225));
  els.push(txt(144,110,'Kazuo Ishiguro',13,'400',TMID,'left','Inter',0,180));
  els.push(txt(144,128,'2015  ·  347 pages  ·  Literary Fiction',10,'400',TDIM,'left','Inter',0,225));
  // Stars
  ['★','★','★','★','☆'].forEach((s,i) =>
    els.push(txt(144+i*20,148,s,15,'normal',i<4?AMBER:'rgba(200,169,126,0.25)')));
  // Tags
  ['Literary','Arthurian','Memory','Grief'].forEach((t,i) => {
    const tx=144+(i%2)*82, ty=172+Math.floor(i/2)*22;
    els.push(rect(tx,ty,74,18,GLASS,9,BORDER,0.5));
    els.push(txt(tx+7,ty+5,t,9,'400',TMID,'left','Inter',0.4));
  });

  // Progress card
  els.push(card(20,250,350,92,16));
  els.push(txt(36,265,'Reading Progress',11,'500',TMID,'left','Inter',0.5));
  els.push(txt(296,265,'61%',14,'700',AMBER));
  els.push(rect(36,284,318,6,BORDER,3));
  els.push(rect(36,284,194,6,AMBER,3));
  els.push(txt(36,300,'Chapter 14',10,'400',TDIM));
  els.push(txt(165,300,'Page 210 / 347',10,'400',TDIM,'center','Inter',0,80));
  els.push(txt(316,300,'of 23',10,'400',TDIM));

  // Session chart
  els.push(txt(20,360,'Reading Sessions',16,'300',TEXT,'left','Georgia'));
  els.push(txt(284,361,'Last 7 days',11,'400',TDIM));
  els.push(card(20,380,350,120,16));

  const sessions=[22,0,45,38,0,55,30];
  const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  sessions.forEach((m,i) => {
    const bx=38+i*46, bh=(m/60)*60, by=380+20+60-bh;
    if(m>0){
      els.push(rect(bx,by,30,bh,AMBER,4));
      els.push(txt(bx,by-13,m+'m',8,'500',AMBER,'center','Inter',0,30));
    } else {
      els.push(rect(bx,380+20,30,60,BORDER,4));
    }
    els.push(txt(bx,380+90,days[i],8,'400',TDIM,'center','Inter',0,30));
  });

  // CTA buttons
  els.push(rect(20,522,222,48,AMBER,24));
  els.push(txt(55,542,'◎  Continue Reading',14,'600','#09080C'));
  els.push(rect(254,522,116,48,GLASS,24,BORDER,0.5));
  els.push(txt(278,542,'◷ Notes',14,'400',TMID));

  // Last note card
  els.push(card(20,584,350,80,16));
  els.push(txt(36,600,'✎  Last Note',10,'500',TMID,'left','Inter',0.5));
  els.push(txt(36,618,'"The fog as metaphor for collective forgetting — how communities suppress painful memories."',11,'300',TEXT,'left','Georgia',0,310));

  els.push(...nav(0));
  return {id:'s2',label:'Book Detail',width:W,height:H,elements:els};
}

// ── SCREEN 3 — Reading Session ────────────────────────────────────────────────
function s3() {
  const els = [bg()];

  // Reading lamp glow (centred)
  els.push(glow(80,180,230,230,'rgba(200,169,126,0.09)'));
  els.push(glow(130,220,130,130,'rgba(200,169,126,0.06)'));

  els.push(...statusBar());
  els.push(txt(20,56,'✕',18,'300',TMID));
  els.push(txt(20,80,'Reading Session',11,'600',TDIM,'center','Inter',3,W-40));

  // Book context pill
  els.push(card(60,100,270,40,20));
  els.push(txt(90,116,'◈  The Buried Giant  ·  Ch. 14',11,'400',TMID,'center','Inter',0,210));

  // Circular timer ring
  els.push(ellipse(72,160,246,246,`rgba(200,169,126,0.04)`,BORDER,2));
  els.push(ellipse(76,164,238,238,'transparent',AMBER,3));

  // Timer
  els.push(txt(20,258,'24:17',56,'200',TEXT,'center','Georgia',-2,W));
  els.push(txt(20,320,'minutes elapsed',11,'400',TDIM,'center','Inter',1,W));
  els.push(txt(20,356,'Page  210',16,'300',TMID,'center','Inter',0,W));

  // Stats strip
  const stats=[{label:'Focus',val:'92%'},{label:'Pace',val:'42 pp/h'},{label:'Total Today',val:'67 min'}];
  stats.forEach((s,i) => {
    const sx=20+i*120;
    els.push(card(sx,426,112,68,14));
    els.push(txt(sx+8,444,s.val,20,'300',TEXT,'center','Georgia',-0.5,96));
    els.push(txt(sx+8,466,s.label,9,'500',TDIM,'center','Inter',0.8,96));
  });

  // Pause btn
  els.push(ellipse(150,520,90,90,GLASS2,BORDER,0.5));
  els.push(txt(166,556,'⏸',28,'normal',TEXT,'center','Inter',0,58));

  // End session
  els.push(rect(80,634,230,44,'rgba(200,169,126,0.13)',22,AMBER+'40',0.5));
  els.push(txt(80,651,'End Session & Save',13,'500',AMBER,'center','Inter',0,230));

  // Focus note
  els.push(txt(20,698,'◎  Focus mode active · Notifications paused',10,'400',TDIM,'center','Inter',0,W));

  els.push(...nav(2));
  return {id:'s3',label:'Session',width:W,height:H,elements:els};
}

// ── SCREEN 4 — Stats ─────────────────────────────────────────────────────────
function s4() {
  const els = [bg()];

  els.push(glow(160,70,240,150,'rgba(94,196,168,0.07)'));

  els.push(...statusBar());
  els.push(txt(20,56,'STATS',11,'700',TEAL,'left','Inter',3));
  els.push(txt(20,74,'2025 Reading Year',22,'300',TEXT,'left','Georgia',-0.3));

  // Annual challenge
  els.push(card(20,106,350,100,18,GLASS2,BORDER,0.5));
  els.push(txt(36,122,'Annual Challenge',11,'500',TMID,'left','Inter',0.5));
  els.push(txt(36,140,'14',36,'200',TEXT,'left','Georgia',-1));
  els.push(txt(82,160,'/ 24 books',13,'300',TMID,'left','Georgia'));

  // Segment tiles (14/24 filled)
  for(let i=0;i<24;i++){
    const gx=180+(i%12)*13, gy=(i<12?122:138);
    els.push(rect(gx,gy,10,10,i<14?TEAL:BORDER,2));
  }
  els.push(txt(180,168,'58% of goal · 10 remaining',9,'400',TDIM,'left','Inter',0,168));

  // Metric row
  const metrics=[{label:'Total Hours',val:'146',sub:'this year'},{label:'Daily Avg',val:'28m',sub:'per session'},{label:'Best Streak',val:'21',sub:'days'}];
  metrics.forEach((m,i) => {
    const mx=20+i*118;
    els.push(card(mx,220,110,75,14));
    els.push(txt(mx+8,238,m.val,24,'200',TEXT,'center','Georgia',-0.5,94));
    els.push(txt(mx+8,261,m.label,9,'500',TDIM,'center','Inter',0.5,94));
    els.push(txt(mx+8,275,m.sub,8,'400',TDIM,'center','Inter',0,94));
  });

  // Genre breakdown
  els.push(txt(20,312,'By Genre',16,'300',TEXT,'left','Georgia'));
  els.push(card(20,332,350,142,16));

  const genres=[
    {name:'Literary Fiction',pct:42,color:VIOLET},
    {name:'Science Fiction',pct:28,color:AMBER},
    {name:'Non-Fiction',pct:18,color:TEAL},
    {name:'Other',pct:12,color:TDIM},
  ];
  genres.forEach((g,i) => {
    const gy=348+i*28;
    els.push(txt(36,gy,g.name,11,'400',TEXT,'left','Inter',0,150));
    els.push(rect(190,gy-3,130,8,BORDER,4));
    els.push(rect(190,gy-3,Math.round(130*g.pct/100),8,g.color,4,null,0));
    els.push(txt(326,gy,g.pct+'%',10,'600',g.color,'right','Inter',0,36));
  });

  // Streak calendar
  els.push(txt(20,490,'This Month',16,'300',TEXT,'left','Georgia'));
  els.push(card(20,510,350,102,16));

  const cal=[1,0,1,1,0,1,1,0,0,1,1,1,0,1,1,1,0,1,0,1,1,1,1,0,1,1,0,1,1,1];
  cal.forEach((on,i) => {
    const dx=36+(i%10)*30, dy=524+Math.floor(i/10)*30;
    els.push(ellipse(dx,dy,20,20,on?AMBER:BORDER));
    els.push(txt(dx,dy+4,String(i+1),7,on?'600':'400',on?'#09080C':TDIM,'center','Inter',0,20));
  });

  // Monthly bars
  els.push(txt(20,628,'Books per Month',16,'300',TEXT,'left','Georgia'));
  els.push(card(20,648,350,78,16));

  const monthly=[1,2,1,3,2,1,2,1,2,2,0,0];
  const mlabs=['J','F','M','A','M','J','J','A','S','O','N','D'];
  monthly.forEach((n,i) => {
    const bx=36+i*27, bh=n*16;
    if(n>0) els.push(rect(bx,708-bh,18,bh,AMBER,3));
    els.push(txt(bx,714,mlabs[i],7,'400',TDIM,'center','Inter',0,18));
  });

  els.push(...nav(3));
  return {id:'s4',label:'Stats',width:W,height:H,elements:els};
}

// ── SCREEN 5 — Discover ───────────────────────────────────────────────────────
function s5() {
  const els = [bg()];

  els.push(glow(-30,90,220,190,'rgba(124,109,240,0.07)'));
  els.push(glow(210,130,230,170,'rgba(200,169,126,0.07)'));

  els.push(...statusBar());
  els.push(txt(20,56,'DISCOVER',11,'700',VIOLET,'left','Inter',3));
  els.push(txt(20,74,'Curated for You',22,'300',TEXT,'left','Georgia',-0.3));

  // Search bar
  els.push(card(20,104,350,40,20));
  els.push(txt(42,120,'⊞',13,'normal',TDIM));
  els.push(txt(62,120,'Search books, authors, genres…',12,'300',TDIM));

  // Category chips
  const cats=['For You','Fiction','Sci-Fi','History','Classics'];
  cats.forEach((c,i) => {
    const cx=20+i*72+(i>0?i*0:0);
    const on=i===0;
    els.push(rect(cx,156,66,26,on?AMBER:GLASS,13,on?'transparent':BORDER,0.5));
    els.push(txt(cx+4,165,c,10,on?'600':'400',on?'#09080C':TMID,'center','Inter',0,58));
  });

  // AI Pick
  els.push(txt(20,196,'◈  AI Pick for Today',12,'500',VIOLET,'left','Inter',0.5));
  els.push(rect(20,216,350,132,'rgba(124,109,240,0.09)',18,VIOLET+'30',0.5));

  // Featured cover
  els.push(rect(30,226,80,110,VIOLET+'30',10,VIOLET+'20',0.5));
  els.push(rect(32,228,24,50,'rgba(255,255,255,0.06)',6));
  els.push(txt(52,272,'◈',30,'normal',VIOLET,'center','Inter',0,56));

  els.push(txt(122,232,'98% MATCH',8,'700',VIOLET,'left','Inter',2));
  els.push(txt(122,246,'Never Let Me Go',18,'400',TEXT,'left','Georgia',-0.2,228));
  els.push(txt(122,267,'Kazuo Ishiguro',11,'400',TMID));
  els.push(txt(122,284,'"Because you love Ishiguro\'s exploration of memory and loss"',10,'300',TDIM,'left','Georgia',0,228));
  els.push(rect(122,308,90,24,VIOLET,12));
  els.push(txt(133,318,'+ Add to Queue',9,'600',TEXT));

  // Curated lists
  els.push(txt(20,364,'Curated Lists',16,'300',TEXT,'left','Georgia'));

  const lists=[
    {name:'Booker Prize\nWinners',count:'12 books',color:'#4A3A5E'},
    {name:'Mind-Bending\nSci-Fi',count:'18 books',color:'#1A3A3A'},
    {name:'Japanese\nMasters',count:'9 books',color:'#3A2A1A'},
    {name:'Short Story\nCollections',count:'7 books',color:'#1A2A3A'},
  ];
  lists.forEach((l,i) => {
    const lx=20+(i%2)*178, ly=388+Math.floor(i/2)*114;
    els.push(rect(lx,ly,168,102,l.color+'55',14,BORDER,0.5));
    [0,1,2].forEach(j =>
      els.push(rect(lx+12+j*20,ly+12,32,46,l.color+'90',4,null,0)));
    els.push(txt(lx+10,ly+66,l.name,12,'400',TEXT,'left','Georgia',-0.2,148));
    els.push(txt(lx+10,ly+86,l.count,9,'400',TDIM));
  });

  els.push(...nav(1));
  return {id:'s5',label:'Discover',width:W,height:H,elements:els};
}

// ── SCREEN 6 — Profile ────────────────────────────────────────────────────────
function s6() {
  const els = [bg()];

  els.push(glow(60,50,270,210,'rgba(200,169,126,0.07)'));

  els.push(...statusBar());

  // Avatar
  els.push(ellipse(155,56,80,80,'rgba(200,169,126,0.18)',AMBER,1.5));
  els.push(txt(155,86,'E',36,'200',AMBER,'center','Georgia',0,80));

  els.push(txt(20,150,'Eleanor Marsh',22,'300',TEXT,'center','Georgia',-0.3,W));
  els.push(txt(20,174,'Literary Explorer  ·  14 books in 2025',12,'400',TDIM,'center','Inter',0,W));

  // Archetype badge
  els.push(rect(130,190,130,26,'rgba(200,169,126,0.13)',13,AMBER+'40',0.5));
  els.push(txt(140,200,'◈  The Contemplative',10,'500',AMBER,'center','Inter',0.5,110));

  // Identity stats
  els.push(card(20,228,350,62,16));
  [{label:'Books',val:'87'},{label:'Pages',val:'27.4K'},{label:'Authors',val:'52'},{label:'Countries',val:'18'}].forEach((s,i) => {
    const sx=36+i*84;
    els.push(txt(sx,246,s.val,18,'300',TEXT,'center','Georgia',-0.3,72));
    els.push(txt(sx,266,s.label,8,'400',TDIM,'center','Inter',0.5,72));
  });

  // Achievements
  els.push(txt(20,306,'Achievements',16,'300',TEXT,'left','Georgia'));

  const badges=[
    {icon:'🔥',label:'21-Day',sub:'Streak'},
    {icon:'📚',label:'Decade',sub:'10 books'},
    {icon:'🌍',label:'Globe',sub:'10 countries'},
    {icon:'◈', label:'Completist',sub:'Ishiguro'},
    {icon:'★', label:'Reviewer',sub:'25 rated'},
    {icon:'◷', label:'Night Owl',sub:'10pm reads'},
  ];
  badges.forEach((b,i) => {
    const bx=20+(i%3)*118, by=326+Math.floor(i/3)*86;
    els.push(card(bx,by,110,74,14));
    els.push(txt(bx,by+14,b.icon,22,'normal',AMBER,'center','Inter',0,110));
    els.push(txt(bx,by+42,b.label,10,'600',TEXT,'center','Inter',0,110));
    els.push(txt(bx,by+56,b.sub,8,'400',TDIM,'center','Inter',0,110));
  });

  // Collections
  els.push(txt(20,506,'Collections',16,'300',TEXT,'left','Georgia'));

  [{name:'Favourites',count:23,color:AMBER},{name:'Want to Read',count:41,color:VIOLET},{name:'5-Star Reads',count:8,color:TEAL}].forEach((c,i) => {
    const cy=526+i*46;
    els.push(card(20,cy,350,38,12));
    els.push(rect(20,cy,4,38,c.color,2));
    els.push(txt(36,cy+13,c.name,13,'400',TEXT));
    els.push(txt(318,cy+13,c.count+' →',11,'400',TDIM,'right','Inter',0,34));
  });

  // Settings
  els.push(card(20,670,350,40,12));
  els.push(txt(36,687,'⚙  Settings & Preferences',13,'400',TMID));
  els.push(txt(350,687,'→',13,'400',TDIM,'right','Inter',0));

  els.push(...nav(4));
  return {id:'s6',label:'Profile',width:W,height:H,elements:els};
}

// ── Assemble ──────────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'RECTO',
  description: 'Personal Reading Library & Progress Tracker — Dark: void purple-black #09080C, warm amber #C8A97E (candlelight), deep violet #7C6DF0, sage teal #5EC4A8. Glass morphism card surfaces (rgba 7-11%) inspired by "Fluid Glass" SOTD on Awwwards; spatial book shelf layout from "Litbix" on Minimal Gallery; ambient glow atmosphere from Midday.ai (darkmodedesign.com). 6 screens: Library (currently-reading hero + queue shelf + year spine grid), Book Detail (large cover + session bar chart + note preview), Reading Session (large circular timer + focus stats + pause control), Stats (annual challenge tiles + genre bars + streak calendar + monthly chart), Discover (AI pick + category chips + curated lists with book stack), Profile (reader identity + achievement badges + collections).',
  screens: [s1(), s2(), s3(), s4(), s5(), s6()]
};

fs.writeFileSync('/workspace/group/design-studio/recto.pen', JSON.stringify(pen, null, 2));
console.log('✓ recto.pen written —', pen.screens.length, 'screens');
pen.screens.forEach(s => console.log(' ', s.label, `(${s.elements.length} elements)`));
