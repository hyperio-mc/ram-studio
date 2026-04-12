// APEX — Code Quality Intelligence
// "Peak code quality, every sprint."
// Inspired by: land-book.com — Codegen "The OS for Code Agents" trend (dark AI dev tooling)
//   Meridian is the light-mode counter. APEX inverts the dark AI aesthetic with a clean,
//   editorial paper-white UI using Console-inspired warm orange accents.
// Also inspired by minimal.gallery — bold expressive type, high info density.
// Theme: LIGHT (thread + forge were dark → rotate)
// Slug: apex

const fs = require('fs');

const W = 390, H = 844;
let idCtr = 1;
const id = () => `a${idCtr++}`;

const p = {
  bg:       '#F7F5F0',   // warm cream paper
  surface:  '#FFFFFF',
  surfaceB: '#F0EDE5',
  border:   '#E6E2D8',
  text:     '#1A1814',
  textMid:  '#7B7568',
  accent:   '#D9600A',   // burnt orange — Console-inspired
  green:    '#1B7A4A',   // forest green — passing
  blue:     '#2056C0',   // electric blue — info
  rose:     '#C43B3B',   // critical / error
  gold:     '#B8870A',   // warning
};

function rect(x,y,w,h,fill,extra={}) {
  return {id:id(),type:'RECTANGLE',x,y,width:w,height:h,fill,...extra};
}
function text(x,y,w,h,content,fontSize,fill,extra={}) {
  return {id:id(),type:'TEXT',x,y,width:w,height:h,content,fontSize,fill,
    fontWeight:extra.fontWeight||400,fontFamily:extra.fontFamily||'Inter',
    textAlign:extra.textAlign||'left',...extra};
}
function frame(x,y,w,h,fill,children,extra={}) {
  return {id:id(),type:'FRAME',x,y,width:w,height:h,fill,children,clip:true,...extra};
}
function card(x,y,w,h,children,fill=p.surface,radius=10) {
  return frame(x,y,w,h,fill,children,{cornerRadius:radius,
    shadowColor:'rgba(26,24,20,0.07)',shadowX:0,shadowY:2,shadowBlur:12});
}

function navBar(active) {
  const items = [
    {label:'Overview',icon:'◎'},
    {label:'Issues',icon:'⚑'},
    {label:'Coverage',icon:'◈'},
    {label:'Insights',icon:'✦'},
    {label:'Trends',icon:'↗'},
  ];
  const navH = 72;
  return [
    rect(0,H-navH,W,navH,p.surface),
    rect(0,H-navH,W,1,p.border),
    ...items.flatMap((item,i)=>{
      const ix = i*(W/5), col = i===active ? p.accent : p.textMid;
      return [
        text(ix,H-navH+10,W/5,20,item.icon,18,col,{textAlign:'center'}),
        text(ix,H-navH+33,W/5,12,item.label,7,col,{textAlign:'center',fontWeight:i===active?600:400}),
      ];
    }),
    rect(active*(W/5)+4,H-navH+2,W/5-8,2,p.accent,{cornerRadius:1}),
  ];
}

function statusBar(title,sub,score,scoreColor) {
  const sc = scoreColor || p.accent;
  return [
    rect(0,0,W,62,p.bg),
    text(20,15,230,18,title,16,p.text,{fontWeight:700}),
    sub ? text(20,36,240,12,sub,9,p.textMid,{fontWeight:500}) : null,
    score !== undefined ? rect(W-66,12,52,36,p.surface,{cornerRadius:8,
      shadowColor:'rgba(26,24,20,0.08)',shadowBlur:8}) : null,
    score !== undefined ? text(W-66,16,52,16,`${score}`,14,sc,{fontWeight:700,textAlign:'center'}) : null,
    score !== undefined ? text(W-66,33,52,10,'score',8,p.textMid,{textAlign:'center'}) : null,
  ].filter(Boolean);
}

// ── SCREEN 1: Overview ───────────────────────────────────────────────────────
function screenOverview() {
  const children = [
    rect(0,0,W,H,p.bg),
    ...statusBar('APEX','WED · 25 MAR 2026',92,p.green),
    rect(20,62,W-40,1,p.border),

    // Hero quality band (burnt orange → score callout)
    rect(0,70,W,88,p.accent),
    text(20,82,W-100,14,'CODE QUALITY SCORE',9,'rgba(255,255,255,0.6)',{fontWeight:700,letterSpacing:0.07}),
    text(20,98,160,38,'92',34,'#FFFFFF',{fontWeight:800}),
    text(68,114,70,16,'/100',14,'rgba(255,255,255,0.58)'),
    text(W-96,86,76,14,'↑ +4 pts',11,'rgba(255,255,255,0.85)',{fontWeight:600,textAlign:'right'}),
    text(W-96,102,76,10,'vs last week',8,'rgba(255,255,255,0.55)',{textAlign:'right'}),

    // Metric row
    ...[[' 17','Issues',p.rose],['84%','Coverage',p.gold],['3.2ms','P95 Build',p.blue]].flatMap(([val,label,col],i)=>{
      const x=20+i*118, y=168;
      return [
        rect(x,y,106,52,p.surface,{cornerRadius:8,
          shadowColor:'rgba(26,24,20,0.06)',shadowBlur:8}),
        text(x,y+8,106,18,val,18,col,{fontWeight:700,textAlign:'center'}),
        text(x,y+29,106,12,label,8,p.textMid,{textAlign:'center',fontWeight:500}),
      ];
    }),

    // Recent PRs section
    text(20,234,200,14,'RECENT PULL REQUESTS',9,p.textMid,{fontWeight:700,letterSpacing:0.06}),

    ...[
      {title:'feat: add vector search index',score:94,delta:'+2',col:p.green},
      {title:'fix: memory leak in parser loop',score:88,delta:'-1',col:p.gold},
      {title:'refactor: auth middleware split',score:71,delta:'-6',col:p.rose},
    ].flatMap(({title,score,delta,col},i)=>{
      const y = 252+i*70;
      return [
        rect(20,y,W-40,62,p.surface,{cornerRadius:8,
          shadowColor:'rgba(26,24,20,0.05)',shadowBlur:6}),
        rect(20,y,3,62,col),
        text(30,y+8,W-88,14,title,11,p.text,{fontWeight:600}),
        text(30,y+27,W-88,10,'→ main',8,p.textMid),
        rect(W-70,y+10,50,18,col+'18',{cornerRadius:4}),
        text(W-70,y+13,50,12,`${score}`,10,col,{fontWeight:700,textAlign:'center'}),
        text(W-70,y+36,50,10,delta,8,col,{textAlign:'center',fontWeight:600}),
      ];
    }),

    // Divider + quick actions
    rect(20,464,W-40,1,p.border),
    text(20,474,200,12,'QUICK ACTIONS',9,p.textMid,{fontWeight:700,letterSpacing:0.06}),

    ...['Run scan now','View top issues','Export report','Config rules'].flatMap((act,i)=>{
      const x = i%2===0 ? 20 : W/2+8;
      const y = 494+Math.floor(i/2)*50;
      const isPrimary = i===0;
      return [
        rect(x,y,W/2-28,40,isPrimary?p.accent:p.surface,{cornerRadius:8}),
        text(x,y+12,W/2-28,18,act,11,isPrimary?'#FFFFFF':p.text,{fontWeight:600,textAlign:'center'}),
      ];
    }),

    // Footer
    text(20,600,W-40,12,'3 repos · 24 contributors · Last scan 2 min ago',9,p.textMid,{textAlign:'center'}),

    ...navBar(0),
  ];
  return {id:id(),type:'FRAME',name:'Overview',x:0,y:0,width:W,height:H,fill:p.bg,clip:true,children};
}

// ── SCREEN 2: Issues ─────────────────────────────────────────────────────────
function screenIssues() {
  const issues = [
    {sev:'CRIT',col:p.rose,title:'Unsanitised SQL input in auth/login.ts',file:'auth/login.ts:47',tag:'Security'},
    {sev:'HIGH',col:p.gold,title:'useEffect missing dependency array',file:'components/Feed.tsx:112',tag:'React'},
    {sev:'HIGH',col:p.gold,title:'Blocking sync call in async handler',file:'api/handler.ts:28',tag:'Perf'},
    {sev:'MED',col:p.blue,title:'Function exceeds 80-line threshold',file:'utils/parser.ts:5',tag:'Complexity'},
    {sev:'MED',col:p.blue,title:'Duplicate string literals (×8)',file:'constants/index.ts:31',tag:'DRY'},
    {sev:'LOW',col:p.textMid,title:'Missing JSDoc on exported functions',file:'lib/helpers.ts:1',tag:'Docs'},
  ];
  const children = [
    rect(0,0,W,H,p.bg),
    ...statusBar('Issues','17 open across 3 repos'),
    rect(20,62,W-40,1,p.border),

    // Filter chips
    ...['All (17)','Critical','High','Med','Low'].flatMap((f,i)=>{
      const x = 20+i*66, isActive = i===0;
      return [
        rect(x,70,58,24,isActive?p.accent:p.surface,{cornerRadius:12}),
        text(x,74,58,16,f,8,isActive?'#FFF':p.textMid,{textAlign:'center',fontWeight:isActive?600:400}),
      ];
    }),
    rect(20,100,W-40,1,p.border),

    ...issues.flatMap(({sev,col,title,file,tag},i)=>{
      const y = 110+i*92;
      return [
        rect(20,y,W-40,84,p.surface,{cornerRadius:8,
          shadowColor:'rgba(26,24,20,0.05)',shadowBlur:6}),
        rect(20,y,3,84,col),
        rect(30,y+10,36,16,col,{cornerRadius:3}),
        text(30,y+12,36,12,sev,7.5,'#FFF',{fontWeight:700,textAlign:'center'}),
        rect(72,y+10,44,16,'rgba(26,24,20,0.07)',{cornerRadius:3}),
        text(72,y+12,44,12,tag,7.5,p.textMid,{textAlign:'center',fontWeight:500}),
        text(30,y+32,W-68,14,title,11,p.text,{fontWeight:600}),
        text(30,y+50,W-78,10,file,8.5,p.textMid),
        text(W-34,y+28,20,26,'›',20,p.textMid,{textAlign:'right'}),
      ];
    }),

    ...navBar(1),
  ];
  return {id:id(),type:'FRAME',name:'Issues',x:0,y:0,width:W,height:H,fill:p.bg,clip:true,children};
}

// ── SCREEN 3: Coverage ───────────────────────────────────────────────────────
function screenCoverage() {
  const modules = [
    {name:'Authentication',pct:96,files:12,col:p.green},
    {name:'API Layer',pct:88,files:24,col:p.green},
    {name:'UI Components',pct:74,files:38,col:p.gold},
    {name:'State Management',pct:61,files:9,col:p.gold},
    {name:'Data Parsing',pct:43,files:6,col:p.rose},
  ];
  const children = [
    rect(0,0,W,H,p.bg),
    ...statusBar('Coverage','Test coverage by module',84,p.gold),
    rect(20,62,W-40,1,p.border),

    // Overall ring (simplified as concentric rects)
    rect(20,70,W-40,88,p.surface,{cornerRadius:10,
      shadowColor:'rgba(26,24,20,0.06)',shadowBlur:8}),
    text(20,82,W-40,14,'OVERALL COVERAGE',9,p.textMid,{fontWeight:700,textAlign:'center',letterSpacing:0.06}),
    text(20,98,W-40,28,'84%',26,p.gold,{fontWeight:800,textAlign:'center'}),
    text(20,128,W-40,14,'Target 85%  ·  Δ +3% this week',9,p.textMid,{textAlign:'center'}),

    text(20,170,200,14,'MODULE BREAKDOWN',9,p.textMid,{fontWeight:700,letterSpacing:0.06}),

    ...modules.flatMap(({name,pct,files,col},i)=>{
      const y = 190+i*86;
      const barW = W-60-40;
      const filled = Math.round(barW*pct/100);
      return [
        rect(20,y,W-40,78,p.surface,{cornerRadius:8,
          shadowColor:'rgba(26,24,20,0.04)',shadowBlur:6}),
        text(30,y+10,W-110,14,name,11,p.text,{fontWeight:600}),
        text(30,y+27,W-120,10,`${files} files`,8.5,p.textMid),
        text(W-62,y+10,48,18,`${pct}%`,14,col,{fontWeight:700,textAlign:'right'}),
        // Bar track
        rect(30,y+52,barW,6,p.border,{cornerRadius:3}),
        rect(30,y+52,filled,6,col,{cornerRadius:3}),
      ];
    }),

    ...navBar(2),
  ];
  return {id:id(),type:'FRAME',name:'Coverage',x:0,y:0,width:W,height:H,fill:p.bg,clip:true,children};
}

// ── SCREEN 4: AI Insights ────────────────────────────────────────────────────
function screenInsights() {
  const insights = [
    {
      tag:'Security',priority:'P0',col:p.rose,
      title:'SQL injection in 3 endpoints',
      body:'auth/login.ts, api/search.ts and admin/query.ts pass raw user input to query builders. Switch to parameterised queries or ORM methods throughout.',
      cta:'Auto-fix →',
    },
    {
      tag:'Performance',priority:'P1',col:p.gold,
      title:'Sync I/O blocking event loop',
      body:'api/handler.ts:28 calls fs.readFileSync inside an async route. Replace with fs.promises.readFile to avoid blocking the Node.js event loop under load.',
      cta:'View diff →',
    },
    {
      tag:'Coverage',priority:'P2',col:p.blue,
      title:'Data Parsing module under-tested',
      body:'utils/parser.ts has only 43% coverage. Meridian found 6 edge-case branches with no test path. Adding ~18 tests would bring this module to 90%.',
      cta:'Generate tests →',
    },
  ];
  const children = [
    rect(0,0,W,H,p.bg),
    ...statusBar('AI Insights','3 actionable suggestions today'),
    rect(20,62,W-40,1,p.border),

    // AI pill
    rect(20,70,W-40,28,'rgba(217,96,10,0.08)',{cornerRadius:8}),
    text(20,77,W-40,14,'✦  Meridian Intelligence · updated 4 min ago',8.5,p.accent,{textAlign:'center',fontWeight:500}),
    rect(20,104,W-40,1,p.border),

    ...insights.flatMap(({tag,priority,col,title,body,cta},i)=>{
      const y = 114+i*214;
      return [
        rect(20,y,W-40,206,p.surface,{cornerRadius:10,
          shadowColor:'rgba(26,24,20,0.06)',shadowBlur:8}),
        rect(20,y,W-40,4,col,{cornerRadius:{tl:10,tr:10,bl:0,br:0}}),

        rect(30,y+14,40,15,col,{cornerRadius:3}),
        text(30,y+16,40,12,tag,7.5,'#FFF',{fontWeight:700,textAlign:'center'}),
        rect(76,y+14,30,15,'rgba(26,24,20,0.07)',{cornerRadius:3}),
        text(76,y+16,30,12,priority,7.5,p.textMid,{textAlign:'center',fontWeight:600}),

        text(30,y+36,W-60,18,title,12,p.text,{fontWeight:700}),
        text(30,y+60,W-66,76,body,9.5,p.textMid),

        rect(30,y+150,96,28,p.accent,{cornerRadius:6}),
        text(30,y+157,96,16,cta,9,'#FFF',{fontWeight:600,textAlign:'center'}),
        text(136,y+157,W-160,16,'Dismiss',9.5,p.textMid),
      ];
    }),

    ...navBar(3),
  ];
  return {id:id(),type:'FRAME',name:'Insights',x:0,y:0,width:W,height:H,fill:p.bg,clip:true,children};
}

// ── SCREEN 5: Trends ─────────────────────────────────────────────────────────
function screenTrends() {
  const weeks = ['W10','W11','W12','W13','W14','W15'];
  const scores = [78,81,80,85,88,92];
  const chartX=30, chartY=190, chartW=W-64, chartH=90;
  const minS=70, maxS=100;

  const dots = scores.map((s,i)=>({
    x: chartX + (i/(scores.length-1))*chartW,
    y: chartY + chartH - ((s-minS)/(maxS-minS))*chartH,
    s, w:weeks[i],
  }));

  const dotEls = dots.flatMap(({x,y,s,w},i)=>[
    rect(x-3,y-3,6,6,i===scores.length-1?p.accent:p.green,{cornerRadius:3}),
    text(x-16,y-18,32,12,`${s}`,8,i===scores.length-1?p.accent:p.textMid,
      {textAlign:'center',fontWeight:i===scores.length-1?700:400}),
    text(x-14,chartY+chartH+8,28,10,w,7.5,p.textMid,{textAlign:'center'}),
  ]);

  const children = [
    rect(0,0,W,H,p.bg),
    ...statusBar('Trends','6-week quality timeline',92,p.green),
    rect(20,62,W-40,1,p.border),

    // Period selector chips
    ...['1W','2W','1M','3M','6M'].flatMap((period,i)=>{
      const x = 20+i*64, isActive = i===2;
      return [
        rect(x,70,56,22,isActive?p.accent:p.surface,{cornerRadius:11}),
        text(x,73,56,16,period,9,isActive?'#FFF':p.textMid,{textAlign:'center',fontWeight:isActive?600:400}),
      ];
    }),

    // Chart card
    rect(20,102,W-40,138,p.surface,{cornerRadius:10,
      shadowColor:'rgba(26,24,20,0.06)',shadowBlur:8}),
    rect(chartX,chartY,chartW,chartH,p.bg,{cornerRadius:4}),
    // grid lines
    ...[0,0.5,1].map(t=>rect(chartX,chartY+t*chartH,chartW,1,p.border)),
    // labels
    text(chartX,chartY-14,40,12,'100',8,p.textMid,{textAlign:'right'}),
    text(chartX,chartY+chartH/2-6,40,12,'85',8,p.textMid,{textAlign:'right'}),
    text(chartX,chartY+chartH-6,40,12,'70',8,p.textMid,{textAlign:'right'}),
    ...dotEls,
    text(20,248,W-40,12,'Quality score · 6 weeks · All repos',8.5,p.textMid,{textAlign:'center'}),
    rect(20,262,W-40,1,p.border),

    // Weekly deltas
    text(20,270,200,14,'WEEKLY CHANGES',9,p.textMid,{fontWeight:700,letterSpacing:0.06}),

    ...['Issues closed','Tests added','Coverage Δ','Complexity Δ'].map((lb,i)=>{
      const vals=['+14','+32','+3%','-0.4'];
      const cols=[p.green,p.blue,p.gold,p.green];
      const y=290+i*48;
      return [
        rect(20,y,W-40,40,p.surface,{cornerRadius:8}),
        text(30,y+12,W-110,14,lb,11,p.text,{fontWeight:500}),
        text(W-66,y+12,52,14,vals[i],13,cols[i],{fontWeight:700,textAlign:'right'}),
        rect(20,y+39,W-40,1,p.border),
      ];
    }).flat(),

    // Repo health
    text(20,490,200,14,'REPO HEALTH',9,p.textMid,{fontWeight:700,letterSpacing:0.06}),
    ...['core-api','web-client','infra-sdk'].map((name,i)=>{
      const scores2=[94,88,81], cols=[p.green,p.green,p.gold];
      const y=510+i*52;
      return [
        rect(20,y,W-40,44,p.surface,{cornerRadius:8}),
        rect(20,y,3,44,cols[i]),
        text(30,y+13,W-120,14,name,11,p.text,{fontWeight:600}),
        text(W-66,y+13,52,14,`${scores2[i]}/100`,10,cols[i],{fontWeight:700,textAlign:'right'}),
        rect(20,y+43,W-40,1,p.border),
      ];
    }).flat(),

    ...navBar(4),
  ];
  return {id:id(),type:'FRAME',name:'Trends',x:0,y:0,width:W,height:H,fill:p.bg,clip:true,children};
}

// ── Assemble ─────────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'APEX — Code Quality Intelligence',
  width: W*5+80,
  height: H,
  fill: '#EAE7DF',
  children: [
    screenOverview(),
    {...screenIssues(),   x: W+20},
    {...screenCoverage(), x: (W+20)*2},
    {...screenInsights(), x: (W+20)*3},
    {...screenTrends(),   x: (W+20)*4},
  ],
};

fs.writeFileSync('apex.pen', JSON.stringify(pen, null, 2));
console.log('✓ apex.pen written');
console.log(`  Screens: ${pen.children.length}`);
console.log(`  Elements: ~${JSON.stringify(pen).split('"type"').length-1}`);
console.log(`  Size: ${Math.round(JSON.stringify(pen).length/1024)}KB`);
