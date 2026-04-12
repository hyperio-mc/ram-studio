/**
 * GLYPH — Daily rhythm tracker for makers
 * "Shape your day. Own your output."
 *
 * Inspired by:
 *   - Dawn mental wellness AI (Lapa Ninja): "Evidence-based, science-backed, judgment-free"
 *     personal daily support — applying wellness-app emotional intelligence to productivity
 *   - PW Magazine (Siteinspire Typographic top list): Neue Haas Unica / Georgia serifs,
 *     all-caps section labels, generous whitespace, stark typographic hierarchy
 *   - Evervault customers page (Godly): clean editorial card layout, bold left-border
 *     color accents, large narrative text blocks
 *
 * Theme: LIGHT (Spire was dark — alternating)
 * Palette: warm parchment #F8F5F0 + electric blue #1D3AF5 + ember #E8510A
 * 5 screens: Today · Focus · Patterns · Reflect · Library
 */

'use strict';
const fs   = require('fs');
const path = require('path');

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const C = {
  bg:      '#F8F5F0',
  surf:    '#FFFFFF',
  surf2:   '#F0EDE8',
  surf3:   '#E8E3DA',
  border:  'rgba(20,18,16,0.09)',
  border2: 'rgba(20,18,16,0.05)',
  text:    '#141210',
  text2:   'rgba(20,18,16,0.55)',
  text3:   'rgba(20,18,16,0.35)',
  accent:  '#1D3AF5',
  accent2: '#E8510A',
  green:   '#1A9E6A',
  red:     '#D93526',
  W: 390,
  H: 844,
};

// ─── ELEMENT BUILDERS ────────────────────────────────────────────────────────
let _id = 1;
const uid = () => `e${_id++}`;

const R = (x,y,w,h,fill,{r=0,op=1,stroke,sw=1}={}) => ({
  id:uid(), type:'rect', x,y,width:w,height:h, fill,
  radius:r, opacity:op,
  ...(stroke?{stroke,strokeWidth:sw}:{}),
});

const T = (x,y,content,fontSize,fontWeight,fill,{align='left',ff='Inter',op=1,ls=0,w=0,h=0}={}) => ({
  id:uid(), type:'text', x,y, width:w,height:h,
  content:String(content), fontSize, fontWeight:String(fontWeight),
  fill, align, fontFamily:ff, opacity:op, letterSpacing:ls,
});

const E = (cx,cy,r,fill,{op=1,stroke,sw=1}={}) => ({
  id:uid(), type:'ellipse',
  x:cx-r, y:cy-r, width:r*2, height:r*2,
  fill, opacity:op,
  ...(stroke?{stroke,strokeWidth:sw}:{}),
});

const bar = (x,y,w,h,pct,fg,{bg}={}) => [
  R(x,y,w,h,bg??C.surf3,{r:h/2}),
  R(x,y,Math.max(4,Math.round(w*pct/100)),h,fg,{r:h/2}),
];

const pill = (x,y,label,bg,fg,{w,h=20}={}) => {
  const pw = w ?? (label.length*7+16);
  return [
    R(x,y,pw,h,bg,{r:h/2}),
    T(x+pw/2,y+h/2-5,label,10,'600',fg,{align:'center'}),
  ];
};

const card = (x,y,w,h,{fill,r=12,stroke}={}) =>
  R(x,y,w,h,fill??C.surf,{r,stroke:stroke??C.border,sw:1});

const statusBar = () => [
  R(0,0,C.W,44,C.bg),
  T(16,14,'9:41',15,'600',C.text),
  T(316,15,'▲▲▲',9,'normal',C.text3,{ls:1}),
  T(354,13,'⬡',18,'normal',C.text2),
];

const bottomNav = (active) => {
  const items = [
    {icon:'◷',label:'Today',    n:0},
    {icon:'◎',label:'Focus',    n:1},
    {icon:'◈',label:'Patterns', n:2},
    {icon:'◉',label:'Reflect',  n:3},
    {icon:'⊟',label:'Library',  n:4},
  ];
  const els = [R(0,C.H-82,C.W,82,C.surf,{stroke:C.border,sw:1})];
  items.forEach((item,i) => {
    const cx = Math.round(C.W*(i+0.5)/items.length);
    const isA = item.n === active;
    if(isA) els.push(R(cx-16,C.H-82,32,2,C.accent,{r:1}));
    els.push(
      T(cx,C.H-66,item.icon,20,isA?'600':'400',isA?C.accent:C.text3,{align:'center'}),
      T(cx,C.H-40,item.label,9,isA?'600':'400',isA?C.text:C.text3,{align:'center',w:50}),
    );
  });
  return els;
};

// ─── SCREEN 1: TODAY ─────────────────────────────────────────────────────────
function s1() {
  const e = [];
  e.push(R(0,0,C.W,C.H,C.bg));
  e.push(...statusBar());

  // Header — editorial all-caps + serif heading (PW Magazine style)
  e.push(
    T(20,52,'GLYPH',9,'700',C.text3,{ls:3}),
    T(20,68,'Today',32,'700',C.text,{ff:'Georgia'}),
    T(20,106,'Sunday, April 5',13,'400',C.text3),
  );

  // KPI row
  const metrics = [
    {label:'FOCUS',  value:'3h 12m',sub:'↑ 18% vs avg'},
    {label:'STREAK', value:'14',    sub:'days running'},
    {label:'SCORE',  value:'82',    sub:'Good rhythm'},
  ];
  const mW=114;
  metrics.forEach((m,i) => {
    const mx = 14 + i*(mW+9);
    e.push(
      card(mx,132,mW,76,{r:10}),
      T(mx+12,144,m.label,8,'700',C.text3,{ls:2}),
      T(mx+12,160,m.value,18,'700',C.text),
      T(mx+12,184,m.sub,9,'400',C.text3),
    );
  });

  // Editorial rhythm bar
  e.push(
    T(20,228,'TODAY\'S RHYTHM',9,'700',C.text3,{ls:2}),
    R(20,242,350,1,C.border),
  );

  const blocks = [
    {label:'Deep Work',  start:0.00,end:0.30,color:C.accent},
    {label:'Comms',      start:0.31,end:0.44,color:C.accent2},
    {label:'Flow Block', start:0.45,end:0.72,color:C.accent},
    {label:'Admin',      start:0.73,end:0.83,color:C.surf3},
    {label:'Evening',    start:0.84,end:1.00,color:C.green},
  ];
  const BX=20,BW=350,BY=252;
  e.push(R(BX,BY,BW,32,C.surf3,{r:6}));
  blocks.forEach(b => {
    const bx = BX+Math.round(BW*b.start);
    const bw = Math.round(BW*(b.end-b.start));
    e.push(R(bx+1,BY+2,bw-2,28,b.color,{r:4}));
  });
  ['6AM','9AM','12PM','3PM','6PM','9PM'].forEach((l,i) => {
    e.push(T(BX+Math.round(BW*i/5),BY+38,l,8,'400',C.text3,{align:'center'}));
  });
  const nowX = BX+Math.round(BW*0.52);
  e.push(
    R(nowX,BY-4,1,44,C.text2),
    T(nowX-10,BY-14,'NOW',7,'700',C.text2,{ls:1}),
  );

  // Active block card
  e.push(
    card(20,318,350,72,{r:10}),
    R(20,318,3,72,C.accent,{r:0}),
    T(34,330,'ACTIVE BLOCK',8,'700',C.accent,{ls:2}),
    T(34,346,'Flow Block — Main project',15,'600',C.text),
    T(34,366,'1h 22m elapsed · 48m remaining',11,'400',C.text2),
    ...bar(34,384,316,4,74,C.accent,{bg:C.surf2}),
  );

  // Task list
  e.push(
    T(20,410,'TODAY\'S TASKS',9,'700',C.text3,{ls:2}),
    R(20,424,350,1,C.border),
  );
  const tasks = [
    {label:'Finish design prototype v2',done:true, tag:'Design'},
    {label:'Weekly review writeup',     done:true, tag:'Writing'},
    {label:'Review PR comments',        done:false,tag:'Code'},
    {label:'Prep tomorrow\'s standup',  done:false,tag:'Comms'},
    {label:'Read 20 pages',             done:false,tag:'Learn'},
  ];
  tasks.forEach((t,i) => {
    const ty = 432+i*46;
    e.push(
      card(20,ty,350,38,{r:8}),
      R(20,ty,3,38,t.done?C.green:C.surf3,{r:0}),
      E(40,ty+19,8,t.done?C.accent:C.surf3,{stroke:C.border,sw:1}),
      t.done ? T(36,ty+15,'✓',11,'700','#fff',{align:'center'}) : null,
      T(56,ty+11,t.label,13,t.done?'400':'500',t.done?C.text3:C.text,{op:t.done?0.6:1}),
      ...pill(310,ty+10,t.tag,C.surf2,C.text3,{h:18}),
    );
  });

  e.push(
    T(20,668,'DAILY PROGRESS',9,'700',C.text3,{ls:2}),
    ...bar(20,682,350,8,82,C.accent,{bg:C.surf3}),
    T(20,698,'Morning: 92% · Afternoon: 74% · Evening: —',11,'400',C.text3),
    T(336,682,'82%',11,'700',C.accent,{align:'right'}),
  );

  e.push(...bottomNav(0));
  return e.flat().filter(Boolean);
}

// ─── SCREEN 2: FOCUS ─────────────────────────────────────────────────────────
function s2() {
  const e = [];
  e.push(R(0,0,C.W,C.H,C.bg));
  e.push(...statusBar());
  e.push(
    T(20,52,'GLYPH',9,'700',C.text3,{ls:3}),
    T(20,68,'Focus',32,'700',C.text,{ff:'Georgia'}),
    T(20,106,'Session in progress',13,'400',C.text3),
  );

  // Large timer card
  e.push(
    card(20,130,350,200,{r:16,stroke:C.border}),
    T(195,158,'SESSION',8,'700',C.text3,{align:'center',ls:3}),
    T(195,205,'25:38',52,'700',C.text,{align:'center',ff:'Georgia'}),
    T(195,264,'of 45 minutes',12,'400',C.text3,{align:'center'}),
    ...bar(50,282,290,4,57,C.accent,{bg:C.surf2}),
    T(195,296,'57% complete',10,'400',C.text3,{align:'center'}),
  );

  // Controls
  e.push(
    card(20,348,108,48,{r:24,stroke:C.border}),
    T(74,366,'⏸ Pause',12,'500',C.text3,{align:'center'}),
    card(141,348,108,48,{r:24,stroke:C.border}),
    T(195,366,'⏮ Reset',12,'500',C.text3,{align:'center'}),
    R(262,348,108,48,C.accent,{r:24}),
    T(316,366,'✓ Done',12,'600','#fff',{align:'center'}),
  );

  // Session stats
  e.push(
    T(20,420,'THIS SESSION',9,'700',C.text3,{ls:2}),
    R(20,434,350,1,C.border),
  );
  const stats = [
    {label:'Words Written',value:'843',   icon:'✎'},
    {label:'Distractions', value:'2',     icon:'◎'},
    {label:'Flow Score',   value:'94/100',icon:'◈'},
  ];
  stats.forEach((s,i) => {
    const sy = 442+i*54;
    e.push(
      card(20,sy,350,46,{r:8}),
      T(38,sy+13,s.icon,16,'400',C.accent2),
      T(64,sy+8,s.label,10,'600',C.text3),
      T(64,sy+22,s.value,14,'700',C.text),
    );
  });

  // Streak section
  e.push(
    T(20,618,'STREAK',9,'700',C.text3,{ls:2}),
    R(20,632,350,1,C.border),
    T(20,640,'14-day streak — personal best',14,'600',C.text),
    T(20,660,'1 session remaining today to keep it alive.',11,'400',C.text2),
  );
  const days = ['M','T','W','T','F','S','S'];
  const done = [1,1,1,1,1,1,0];
  days.forEach((d,i) => {
    const dx = 24+i*50;
    e.push(
      E(dx+12,702,14,done[i]?C.accent:C.surf3,{stroke:C.border,sw:1}),
      done[i] ? T(dx+8,696,'✓',10,'700','#fff') : null,
      T(dx+12,722,d,9,'400',C.text3,{align:'center'}),
    );
  });

  e.push(...bottomNav(1));
  return e.flat().filter(Boolean);
}

// ─── SCREEN 3: PATTERNS ──────────────────────────────────────────────────────
function s3() {
  const e = [];
  e.push(R(0,0,C.W,C.H,C.bg));
  e.push(...statusBar());
  e.push(
    T(20,52,'GLYPH',9,'700',C.text3,{ls:3}),
    T(20,68,'Patterns',32,'700',C.text,{ff:'Georgia'}),
    T(20,106,'Last 4 weeks',13,'400',C.text3),
  );

  // Period tabs
  ['Week','Month','Quarter','Year'].forEach((p,i) => {
    const tx = 20+i*84;
    const isA = i===1;
    e.push(
      R(tx,128,76,28,isA?C.text:C.surf2,{r:14}),
      T(tx+38,136,p,11,isA?'600':'400',isA?'#fff':C.text3,{align:'center'}),
    );
  });

  // Focus hours bars
  e.push(
    T(20,176,'FOCUS HOURS / WEEK',9,'700',C.text3,{ls:2}),
    R(20,190,350,1,C.border),
  );
  const weeks = [
    {label:'Mar 10',hours:18,pct:60},
    {label:'Mar 17',hours:22,pct:73},
    {label:'Mar 24',hours:16,pct:53},
    {label:'Apr 1', hours:26,pct:87},
  ];
  weeks.forEach((w,i) => {
    const wy = 198+i*42;
    e.push(
      T(20,wy+6,w.label,10,'400',C.text3,{w:44}),
      R(70,wy,Math.round(244*w.pct/100),28,C.surf2,{r:4}),
      R(70,wy,Math.round(244*w.pct/100),28,C.accent,{r:4,op:0.15}),
      R(70,wy,4,28,w.pct>80?C.accent2:C.accent,{r:2}),
      T(82,wy+8,`${w.hours}h focus`,13,'600',C.text),
      T(316,wy+8,`${w.pct}%`,11,'700',w.pct>80?C.accent2:C.accent,{align:'right'}),
    );
  });

  // Habit grid
  e.push(
    T(20,374,'HABIT CONSISTENCY',9,'700',C.text3,{ls:2}),
    R(20,388,350,1,C.border),
  );
  const habits = [
    {label:'Deep Work',      pcts:[1,1,1,0,1,1,1,1,0,1,1,0,1,1],color:C.accent},
    {label:'Morning Routine',pcts:[1,1,1,1,1,1,1,1,1,1,0,1,1,1],color:C.green},
    {label:'Reading',        pcts:[1,0,1,1,0,1,1,0,1,1,1,0,1,1],color:C.accent2},
    {label:'Exercise',       pcts:[0,1,1,0,1,1,0,1,1,0,1,1,0,1],color:'#9D5CF5'},
  ];
  habits.forEach((h,hi) => {
    const hy = 396+hi*54;
    e.push(T(20,hy+6,h.label,11,'600',C.text,{w:100}));
    h.pcts.forEach((p,pi) => {
      e.push(R(128+pi*15,hy,12,24,p?h.color:C.surf3,{r:3,op:p?0.9:1}));
    });
    const cnt = h.pcts.filter(Boolean).length;
    e.push(T(342,hy+6,`${cnt}/${h.pcts.length}`,10,'600',C.text3,{align:'right'}));
  });

  // Insight card
  e.push(
    card(20,622,350,76,{r:10,stroke:C.border}),
    R(20,622,3,76,C.accent2,{r:0}),
    T(34,634,'TOP INSIGHT',8,'700',C.accent2,{ls:2}),
    T(34,650,'Best focus days: Tues and Thurs mornings.',14,'600',C.text),
    T(34,668,'→  Schedule deep work on these days.',11,'400',C.text2),
  );

  e.push(...bottomNav(2));
  return e.flat();
}

// ─── SCREEN 4: REFLECT ───────────────────────────────────────────────────────
function s4() {
  const e = [];
  e.push(R(0,0,C.W,C.H,C.bg));
  e.push(...statusBar());
  e.push(
    T(20,52,'GLYPH',9,'700',C.text3,{ls:3}),
    T(20,68,'Reflect',32,'700',C.text,{ff:'Georgia'}),
    T(20,106,'AI insights — week of Apr 5',13,'400',C.text3),
  );

  // Editorial pull-quote header (PW Magazine style)
  e.push(
    R(20,128,350,2,C.text3),
    T(20,142,'WEEK OF MARCH 31 – APRIL 5',9,'700',C.text3,{ls:2}),
    T(20,160,'Your rhythm is',28,'300',C.text,{ff:'Georgia'}),
    T(20,192,'getting stronger.',28,'700',C.accent,{ff:'Georgia'}),
    R(20,228,350,1,C.text3),
  );

  // Three insight cards (Evervault editorial card pattern — left border + text)
  const insights = [
    {tag:'FOCUS',    headline:'Deep work windows grew 34% this week.',      body:'Longest streak: 2h 41m on Thursday. Peak flow begins around 8:30 AM.',color:C.accent, icon:'◎'},
    {tag:'ENERGY',   headline:'Maintained flow despite 3 interruptions.',   body:'Average re-entry time after distraction dropped to 8 minutes.',     color:C.accent2,icon:'◈'},
    {tag:'GROWTH',   headline:'14-day streak is a personal best.',           body:'Consistent mornings correlate with your top-scoring focus sessions.',color:C.green,  icon:'↑'},
  ];
  insights.forEach((ins,i) => {
    const iy = 244+i*150;
    e.push(
      card(20,iy,350,138,{r:12,stroke:C.border}),
      R(20,iy,3,138,ins.color,{r:0}),
      T(34,iy+14,ins.tag,8,'700',ins.color,{ls:2}),
      T(34,iy+30,ins.headline,14,'600',C.text,{w:310}),
      T(34,iy+70,ins.body,11,'400',C.text2,{w:310}),
      T(345,iy+14,ins.icon,18,'400',ins.color,{align:'right',op:0.3}),
    );
  });

  // Reflection CTA
  e.push(
    card(20,694,350,56,{r:10,stroke:C.accent,fill:C.surf}),
    T(195,715,'Write your weekly reflection →',12,'500',C.accent,{align:'center'}),
    T(195,731,'3 min · guided prompts',9,'400',C.text3,{align:'center'}),
  );

  e.push(...bottomNav(3));
  return e.flat();
}

// ─── SCREEN 5: LIBRARY ───────────────────────────────────────────────────────
function s5() {
  const e = [];
  e.push(R(0,0,C.W,C.H,C.bg));
  e.push(...statusBar());
  e.push(
    T(20,52,'GLYPH',9,'700',C.text3,{ls:3}),
    T(20,68,'Library',32,'700',C.text,{ff:'Georgia'}),
    T(20,106,'What you consumed this week',13,'400',C.text3),
  );

  // Reading stats strip
  const lstats = [
    {label:'BOOKS',   value:'1.4',sub:'chapters'},
    {label:'ARTICLES',value:'12', sub:'read'},
    {label:'MINUTES', value:'94', sub:'avg/day'},
    {label:'STREAK',  value:'9',  sub:'days'},
  ];
  lstats.forEach((ls,i) => {
    const lx = 12+i*94;
    e.push(
      card(lx,128,86,66,{r:8}),
      T(lx+10,138,ls.label,7,'700',C.text3,{ls:2}),
      T(lx+10,152,ls.value,20,'700',C.text),
      T(lx+10,176,ls.sub,8,'400',C.text3),
    );
  });

  // Currently reading
  e.push(
    T(20,214,'CURRENTLY READING',9,'700',C.text3,{ls:2}),
    R(20,228,350,1,C.border),
    card(20,236,350,92,{r:10,stroke:C.border}),
    R(20,236,3,92,C.accent,{r:0}),
    T(34,248,'BOOK · 62% COMPLETE',8,'700',C.text3,{ls:2}),
    T(34,264,'Deep Work',18,'700',C.text),
    T(34,286,'Cal Newport',11,'400',C.text3),
    ...bar(34,302,296,4,62,C.accent,{bg:C.surf2}),
    T(316,296,'62%',9,'600',C.accent,{align:'right'}),
  );

  // Recent articles
  e.push(
    T(20,348,'RECENT ARTICLES',9,'700',C.text3,{ls:2}),
    R(20,362,350,1,C.border),
  );
  const articles = [
    {title:'The Craft of Consistent Output',    source:'Ness Labs',      mins:6,tag:'Creativity'},
    {title:'On Attention Residue',              source:'Maggie Appleton', mins:9,tag:'Deep Work'},
    {title:'Evidence-Based Rest Cycles',        source:'Dawn Research',   mins:4,tag:'Wellness'},
    {title:'Typography as Emotional Interface', source:'PW Magazine',     mins:7,tag:'Design'},
  ];
  articles.forEach((a,i) => {
    const ay = 370+i*58;
    e.push(
      card(20,ay,350,50,{r:8,stroke:C.border}),
      T(34,ay+8,a.tag,7,'700',C.accent2,{ls:2}),
      T(34,ay+22,a.title,12,'600',C.text,{w:248}),
      T(34,ay+36,a.source,9,'400',C.text3),
      T(338,ay+22,`${a.mins}m`,10,'600',C.text3,{align:'right'}),
    );
  });

  // Add CTA
  e.push(
    card(20,604,350,48,{r:24,stroke:C.border}),
    T(195,624,'+ Add something you read',12,'500',C.text3,{align:'center'}),
  );

  e.push(...bottomNav(4));
  return e.flat();
}

// ─── WRITE PEN FILE ──────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'GLYPH',
  description:
    'Daily rhythm tracker for makers — Light editorial theme. Warm parchment #F8F5F0 bg, ' +
    'electric blue #1D3AF5 + ember #E8510A accents, Georgia serif headings. ' +
    'Inspired by Dawn mental wellness AI (Lapa Ninja: "evidence-based, science-backed"), ' +
    'PW Magazine typography (Siteinspire Typographic: Neue Haas Unica, all-caps, generous whitespace), ' +
    'and Evervault customer-story cards (Godly: bold left-border accents, large editorial type). ' +
    '5 screens: Today overview, Focus session timer, Patterns analytics, AI Reflections, Library tracker.',
  screens: [
    {id:'s1',label:'Today',    width:390,height:844,elements:s1()},
    {id:'s2',label:'Focus',    width:390,height:844,elements:s2()},
    {id:'s3',label:'Patterns', width:390,height:844,elements:s3()},
    {id:'s4',label:'Reflect',  width:390,height:844,elements:s4()},
    {id:'s5',label:'Library',  width:390,height:844,elements:s5()},
  ],
};

const OUT = path.join(__dirname,'glyph.pen');
fs.writeFileSync(OUT, JSON.stringify(pen,null,2));
const bytes = JSON.stringify(pen).length;
console.log(`✓ glyph.pen written — ${bytes.toLocaleString()} bytes`);
pen.screens.forEach(s => console.log(`  ${s.label}: ${s.elements.length} elements`));
