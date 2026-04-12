// SHELF — Reading Tracker
// Light theme: warm parchment, terracotta accent, ink text
// Inspired by Dribbble mobile trending — Artspire data viz (183 likes),
// Ramotion card hierarchy (208 likes). Editorial progress tracking.
// 5 screens: Reading Now, Library, Session, Stats, Discover

const screens = [];
const bg='#FAF7F2',surface='#FFFFFF',surface2='#F3EFE8',ink='#1A1712';
const inkMid='rgba(26,23,18,0.50)',inkFaint='rgba(26,23,18,0.12)';
const terra='#C8522A',terraSoft='#FAEEE9',sage='#4E7D5B',sageSoft='#E6F0EA';
const gold='#C49A2A';
const W=390,H=844;

const nav=(active)=>{
  const items=[
    {icon:'◉',label:'Now',x:20,a:active===0},
    {icon:'⊞',label:'Library',x:98,a:active===1},
    {icon:'◷',label:'Session',x:176,a:active===2},
    {icon:'◑',label:'Stats',x:254,a:active===3},
    {icon:'✦',label:'Discover',x:332,a:active===4},
  ];
  const ch=[];
  ch.push(`F(0,764,${W},80,'${surface}');`);
  ch.push(`F(0,764,${W},1,'${inkFaint}');`);
  items.forEach(n=>{
    const c=n.a?ink:inkMid;
    const sz=n.a?20:18;
    ch.push(`T('${n.icon}',${n.x+15},776,36,${sz},{font:'mono',size:${sz},color:'${c}'});`);
    ch.push(`T('${n.label}',${n.x},800,58,12,{font:'mono',size:9,color:'${c}',caps:true,tracking:1});`);
    if(n.a) ch.push(`F(${n.x+22},768,12,3,'${terra}',{r:1});`);
  });
  return ch;
};

// ── SCREEN 1 — READING NOW ────────────────
{
  const ch=[];
  ch.push(`F(0,0,${W},${H},'${bg}');`);
  ch.push(`T('Good morning, Mia.',16,52,280,22,{font:'sans',size:18,color:'${ink}',bold:true});`);
  ch.push(`T('Wednesday · April 1',16,78,200,16,{font:'mono',size:11,color:'${inkMid}'});`);

  // Current book card
  ch.push(`F(16,104,${W-32},220,'${surface}',{r:16});`);
  ch.push(`F(16,104,72,220,'${terra}',{r:16});`);
  ch.push(`F(72,104,8,220,'${terra}');`);
  ch.push(`T('DEMO',28,168,56,16,{font:'mono',size:9,color:'rgba(255,255,255,0.50)',caps:true,tracking:2});`);
  ch.push(`T('The Demon-',98,116,240,28,{font:'display',size:22,color:'${ink}',bold:true});`);
  ch.push(`T('Haunted World',98,142,240,28,{font:'display',size:22,color:'${ink}',bold:true});`);
  ch.push(`T('Carl Sagan',98,172,200,16,{font:'sans',size:13,color:'${inkMid}'});`);
  ch.push(`F(98,198,${W-130},6,'${inkFaint}',{r:3});`);
  ch.push(`F(98,198,${Math.round((W-130)*0.62)},6,'${terra}',{r:3});`);
  ch.push(`T('62% · p. 217 of 352',98,210,200,14,{font:'mono',size:11,color:'${terra}'});`);
  ch.push(`F(98,232,${W-130},1,'${inkFaint}');`);
  [{val:'28',lbl:'pages today',x:98},{val:'4.2h',lbl:'this week',x:210},{val:'12🔥',lbl:'day streak',x:310}].forEach(s=>{
    ch.push(`T('${s.val}',${s.x},244,90,18,{font:'mono',size:14,color:'${ink}',bold:true});`);
    ch.push(`T('${s.lbl}',${s.x},264,90,14,{font:'mono',size:9,color:'${inkMid}'});`);
  });

  // Daily goal ring
  ch.push(`F(${W-80},110,64,64,'${terraSoft}',{r:32});`);
  ch.push(`T('28',${W-66},124,42,22,{font:'mono',size:16,color:'${terra}',bold:true});`);
  ch.push(`T('/40',${W-62},146,36,14,{font:'mono',size:10,color:'${inkMid}'});`);

  ch.push(`F(16,336,${W-32},48,'${terra}',{r:12});`);
  ch.push(`T('Continue Reading →',${W/2-78},350,156,22,{font:'sans',size:15,color:'${bg}',bold:true});`);

  ch.push(`T('UP NEXT',16,402,200,14,{font:'mono',size:10,color:'${inkMid}',caps:true,tracking:2});`);
  [
    {title:'Piranesi',author:'Susanna Clarke',color:sage},
    {title:'Babel',author:'R.F. Kuang',color:gold},
    {title:'Klara and the Sun',author:'Kazuo Ishiguro',color:terra},
  ].forEach((b,i)=>{
    const y=422+i*78;
    ch.push(`F(16,${y},${W-32},70,'${surface}',{r:12});`);
    ch.push(`F(16,${y},6,70,'${b.color}',{r:12});`);
    ch.push(`T('${b.title}',30,${y+10},220,20,{font:'sans',size:15,color:'${ink}',bold:true});`);
    ch.push(`T('${b.author}',30,${y+34},220,16,{font:'sans',size:12,color:'${inkMid}'});`);
    ch.push(`T('Queue',${W-64},${y+24},48,16,{font:'mono',size:11,color:'${b.color}'});`);
  });

  ch.push(...nav(0));
  screens.push({name:'Reading Now',children:ch});
}

// ── SCREEN 2 — LIBRARY ────────────────────
{
  const ch=[];
  ch.push(`F(0,0,${W},${H},'${bg}');`);
  ch.push(`T('Library',16,52,200,28,{font:'display',size:24,color:'${ink}',bold:true});`);
  ch.push(`T('18 books in 2026',16,84,220,16,{font:'mono',size:11,color:'${inkMid}'});`);
  ['All','Fiction','Non-Fiction','Essays'].forEach((f,i)=>{
    const a=i===0;
    ch.push(`F(${16+i*82},110,74,28,'${a?terra:surface}',{r:14});`);
    ch.push(`T('${f}',${24+i*82},116,60,18,{font:'mono',size:10,color:'${a?bg:inkMid}',caps:true,tracking:1});`);
  });
  // Goal banner
  ch.push(`F(16,150,${W-32},52,'${terraSoft}',{r:12});`);
  ch.push(`F(16,150,${Math.round((W-32)*0.60)},52,'rgba(200,82,42,0.10)',{r:12});`);
  ch.push(`T('2026 goal: 30 books',24,162,220,18,{font:'sans',size:13,color:'${terra}',bold:true});`);
  ch.push(`T('18 read · 60%',24,182,160,16,{font:'mono',size:10,color:'${terra}'});`);
  ch.push(`T('60%',${W-56},162,42,22,{font:'mono',size:17,color:'${terra}',bold:true});`);

  // Book grid 3 cols
  const books=[
    {title:'The Demon-\nHaunted',color:terra},{title:'Thinking\nFast & Slow',color:sage},
    {title:'Dune',color:gold},{title:'Klara & the\nSun',color:terra},
    {title:'Project\nHail Mary',color:sage},{title:'Poor\nThings',color:gold},
    {title:'Piranesi',color:terra},{title:'Babel',color:sage},{title:'Normal\nPeople',color:gold},
  ];
  const bw=Math.floor((W-32-24)/3);
  books.forEach((b,i)=>{
    const col=i%3,row=Math.floor(i/3);
    const x=16+col*(bw+12),y=216+row*(130+12);
    ch.push(`F(${x},${y},${bw},130,'${surface}',{r:12});`);
    ch.push(`F(${x},${y},${bw},40,'${b.color}',{r:12});`);
    ch.push(`F(${x},${y+28},${bw},12,'${b.color}');`);
    b.title.split('\n').forEach((l,li)=>ch.push(`T('${l}',${x+8},${y+50+li*18},${bw-16},16,{font:'sans',size:12,color:'${ink}',bold:true});`));
    ch.push(`T('★★★★',${x+8},${y+108},${bw-16},14,{font:'mono',size:9,color:'${b.color}'});`);
  });

  ch.push(...nav(1));
  screens.push({name:'Library',children:ch});
}

// ── SCREEN 3 — SESSION ────────────────────
{
  const ch=[];
  ch.push(`F(0,0,${W},${H},'${bg}');`);
  ch.push(`T('← Reading Now',16,52,180,16,{font:'mono',size:11,color:'${inkMid}',caps:true,tracking:1});`);

  ch.push(`F(16,76,${W-32},180,'${surface}',{r:16});`);
  ch.push(`T('SESSION',${Math.round(W/2)-40},90,80,14,{font:'mono',size:10,color:'${inkMid}',caps:true,tracking:3});`);
  ch.push(`T('01:24:08',${Math.round(W/2)-90},108,180,60,{font:'mono',size:48,color:'${ink}',bold:true});`);
  ch.push(`T('The Demon-Haunted World',${Math.round(W/2)-108},172,216,18,{font:'sans',size:13,color:'${inkMid}'});`);
  ch.push(`T('p. 189 — 217',${Math.round(W/2)-50},192,100,14,{font:'mono',size:11,color:'${terra}'});`);

  ch.push(`F(16,268,${W-32},56,'${surface}',{r:12});`);
  ch.push(`T('28 pages this session',24,282,220,18,{font:'sans',size:14,color:'${ink}',bold:true});`);
  ch.push(`T('+28 pages',${W-80},278,68,24,{font:'mono',size:16,color:'${sage}',bold:true});`);

  // Quote capture
  ch.push(`F(16,336,${W-32},116,'${surface}',{r:12});`);
  ch.push(`T('CAPTURE QUOTE',24,348,180,14,{font:'mono',size:10,color:'${inkMid}',caps:true,tracking:2});`);
  ch.push(`F(24,366,${W-48},70,'${surface2}',{r:8});`);
  ch.push(`T('"We are star stuff which has taken',30,372,${W-60},18,{font:'sans',size:13,color:'${ink}'});`);
  ch.push(`T('its destiny into its own hands."',30,392,${W-60},18,{font:'sans',size:13,color:'${ink}'});`);
  ch.push(`T('— p. 196',30,412,${W-60},14,{font:'mono',size:10,color:'${terra}'});`);

  // Controls
  ch.push(`F(16,464,${Math.round((W-40)/2)},52,'${surface}',{r:12});`);
  ch.push(`T('⏸  Pause',36,480,120,18,{font:'sans',size:14,color:'${ink}'});`);
  ch.push(`F(${16+Math.round((W-40)/2)+8},464,${Math.round((W-40)/2)},52,'${terra}',{r:12});`);
  ch.push(`T('Finish Session',${16+Math.round((W-40)/2)+16},480,160,18,{font:'sans',size:14,color:'${bg}',bold:true});`);

  // Ambience
  ch.push(`T('AMBIENCE',16,530,200,14,{font:'mono',size:10,color:'${inkMid}',caps:true,tracking:2});`);
  ['☁ Rain','♪ Lo-fi','🌿 Forest','∅ Silence'].forEach((a,i)=>{
    const act=i===1;
    ch.push(`F(${16+i*90},548,82,34,'${act?terra:surface}',{r:10});`);
    ch.push(`T('${a}',${22+i*90},558,72,20,{font:'sans',size:12,color:'${act?bg:inkMid}'});`);
  });

  ch.push(...nav(2));
  screens.push({name:'Session',children:ch});
}

// ── SCREEN 4 — STATS ──────────────────────
{
  const ch=[];
  ch.push(`F(0,0,${W},${H},'${bg}');`);
  ch.push(`T('Stats',16,52,200,28,{font:'display',size:24,color:'${ink}',bold:true});`);
  ['Week','Month','Year','All'].forEach((p,i)=>{
    const a=i===2;
    ch.push(`F(${16+i*80},82,72,26,'${a?ink:surface}',{r:13});`);
    ch.push(`T('${p}',${24+i*80},87,56,18,{font:'mono',size:11,color:'${a?bg:inkMid}',caps:true,tracking:1});`);
  });

  // Hero stat
  ch.push(`F(16,118,${W-32},84,'${surface}',{r:14});`);
  ch.push(`T('3,241',24,126,200,52,{font:'mono',size:44,color:'${ink}',bold:true});`);
  ch.push(`T('pages in 2026',${W-200},138,184,18,{font:'sans',size:13,color:'${inkMid}'});`);
  ch.push(`T('↑ 18% vs 2025',${W-200},160,184,16,{font:'mono',size:11,color:'${sage}'});`);

  // Bar chart
  ch.push(`F(16,214,${W-32},158,'${surface}',{r:14});`);
  ch.push(`T('PAGES / DAY — THIS MONTH',24,226,280,14,{font:'mono',size:10,color:'${inkMid}',caps:true,tracking:2});`);
  [28,0,45,32,18,55,40,22,0,38,62,44,31].forEach((p,i)=>{
    const bx=24+i*27,maxP=62,barH=80;
    const bh=p>0?Math.round((p/maxP)*barH):2;
    const by=214+140-bh;
    const isToday=i===12;
    ch.push(`F(${bx},${by},20,${bh},'${isToday?terra:(p===0?inkFaint:surface2)}',{r:3});`);
    if(isToday) ch.push(`T('31',${bx-2},${by-16},24,14,{font:'mono',size:9,color:'${terra}'});`);
  });

  // Speed + streak cards
  const hw=Math.round((W-40)/2);
  ch.push(`F(16,384,${hw},72,'${surface}',{r:12});`);
  ch.push(`T('SPEED',24,396,80,14,{font:'mono',size:10,color:'${inkMid}',caps:true,tracking:2});`);
  ch.push(`T('34 p/hr',24,414,120,24,{font:'mono',size:20,color:'${ink}',bold:true});`);
  ch.push(`F(${16+hw+8},384,${hw},72,'${surface}',{r:12});`);
  const sx=16+hw+8;
  ch.push(`T('STREAK',${sx+8},396,80,14,{font:'mono',size:10,color:'${inkMid}',caps:true,tracking:2});`);
  ch.push(`T('12 days 🔥',${sx+8},414,120,24,{font:'mono',size:16,color:'${ink}',bold:true});`);

  // Genre bars
  ch.push(`T('BY GENRE',16,470,200,14,{font:'mono',size:10,color:'${inkMid}',caps:true,tracking:2});`);
  [{label:'Science',pct:38,color:terra},{label:'Fiction',pct:34,color:sage},
   {label:'History',pct:18,color:gold},{label:'Essays',pct:10,color:inkMid}].forEach((g,i)=>{
    const y=490+i*56;
    ch.push(`F(16,${y},${W-32},48,'${surface}',{r:10});`);
    ch.push(`T('${g.label}',24,${y+8},120,18,{font:'sans',size:14,color:'${ink}',bold:true});`);
    ch.push(`F(24,${y+30},${W-48},5,'${inkFaint}',{r:2});`);
    ch.push(`F(24,${y+30},${Math.round((W-48)*g.pct/100)},5,'${g.color}',{r:2});`);
    ch.push(`T('${g.pct}%',${W-52},${y+12},40,18,{font:'mono',size:13,color:'${g.color}',bold:true});`);
  });

  ch.push(...nav(3));
  screens.push({name:'Stats',children:ch});
}

// ── SCREEN 5 — DISCOVER ───────────────────
{
  const ch=[];
  ch.push(`F(0,0,${W},${H},'${bg}');`);
  ch.push(`T('Discover',16,52,200,28,{font:'display',size:24,color:'${ink}',bold:true});`);
  ch.push(`T('Based on your reading',16,82,240,16,{font:'sans',size:13,color:'${inkMid}'});`);
  ch.push(`F(16,106,${W-32},44,'${surface}',{r:12});`);
  ch.push(`T('⌕  Search books, authors...',24,118,${W-48},22,{font:'sans',size:14,color:'${inkMid}'});`);

  ch.push(`T('BECAUSE YOU READ SAGAN',16,164,${W-32},14,{font:'mono',size:10,color:'${inkMid}',caps:true,tracking:2});`);
  [
    {title:'A Brief History of Time',author:'Stephen Hawking',color:terra,tag:'SCIENCE'},
    {title:'Cosmos',author:'Carl Sagan',color:sage,tag:'CLASSIC'},
    {title:'The Elegant Universe',author:'Brian Greene',color:gold,tag:'PHYSICS'},
  ].forEach((r,i)=>{
    const y=184+i*100;
    ch.push(`F(16,${y},${W-32},92,'${surface}',{r:12});`);
    ch.push(`F(16,${y},56,92,'${r.color}',{r:12});`);
    ch.push(`F(56,${y},4,92,'${r.color}');`);
    ch.push(`T('${r.title}',76,${y+12},${W-96},20,{font:'sans',size:15,color:'${ink}',bold:true});`);
    ch.push(`T('${r.author}',76,${y+36},${W-96},16,{font:'sans',size:12,color:'${inkMid}'});`);
    const tagBg=r.color===terra?terraSoft:r.color===sage?sageSoft:'rgba(196,154,42,0.12)';
    ch.push(`F(76,${y+58},${r.tag.length*7+16},22,'${tagBg}',{r:11});`);
    ch.push(`T('${r.tag}',82,${y+62},${r.tag.length*7+4},16,{font:'mono',size:9,color:'${r.color}',caps:true,tracking:2});`);
    ch.push(`T('+ Add',${W-56},${y+32},44,24,{font:'mono',size:12,color:'${terra}',bold:true});`);
  });

  ch.push(`T('TRENDING IN SCIENCE',16,486,${W-32},14,{font:'mono',size:10,color:'${inkMid}',caps:true,tracking:2});`);
  [
    {title:'The Whole Earth',author:'Dr Sarah Stewart',num:'01'},
    {title:'Entangled Life',author:'Merlin Sheldrake',num:'02'},
    {title:'Other Minds',author:'Peter Godfrey-Smith',num:'03'},
  ].forEach((t,i)=>{
    const y=508+i*72;
    ch.push(`F(16,${y},${W-32},64,'${surface}',{r:12});`);
    ch.push(`T('${t.num}',24,${y+18},36,28,{font:'mono',size:20,color:'${inkFaint}',bold:true});`);
    ch.push(`T('${t.title}',62,${y+10},${W-96},20,{font:'sans',size:14,color:'${ink}',bold:true});`);
    ch.push(`T('${t.author}',62,${y+32},${W-96},16,{font:'sans',size:12,color:'${inkMid}'});`);
    ch.push(`T('→',${W-36},${y+20},24,24,{font:'mono',size:16,color:'${terra}'});`);
  });

  ch.push(...nav(4));
  screens.push({name:'Discover',children:ch});
}

// ── RENDER ────────────────────────────────
const pen={
  version:'2.8',
  meta:{name:'SHELF',tagline:'Read more. Track every page.',archetype:'reading-tracker-light',theme:'light',
    palette:{bg,surface,ink,accent:terra,accent2:sage},
    inspiration:'Dribbble mobile — Artspire data viz (183 likes), Ramotion card hierarchy (208 likes)'},
  screens:screens.map(s=>({name:s.name,width:W,height:H,children:s.children})),
};

const fs=await import('fs');
fs.writeFileSync('./shelf.pen',JSON.stringify(pen,null,2));
console.log(`✓ shelf.pen — ${screens.length} screens`);
console.log(`  Size: ${(fs.statSync('./shelf.pen').size/1024).toFixed(1)} KB`);
screens.forEach((s,i)=>console.log(`  Screen ${i+1}: ${s.name} (${s.children.length} elements)`));
