// TEMPO — AI Business Intelligence Radio
// Inspired by: useformat.ai/podcasts (dark audio intelligence) + Skarlo editorial dark UI
// Dark theme: deep midnight navy + vivid purple + coral

const fs = require('fs');

const W = 390, H = 844;

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

// ── palette ──────────────────────────────────────────────
const BG       = '#090A10';
const SURFACE  = '#111520';
const SURF2    = '#181D2E';
const SURF3    = '#1F2540';
const TEXT     = '#EDE9FF';
const TEXT2    = 'rgba(237,233,255,0.58)';
const ACCENT   = '#8660FF';
const ACCENT2  = '#FF6B6B';
const ACCENT3  = '#38BDF8';
const MUTED    = 'rgba(237,233,255,0.22)';
const GREEN    = '#34D399';
const AMBER    = '#FBBF24';

// ── helpers ───────────────────────────────────────────────
const rect = (x,y,w,h,fill,opts={}) => ({
  id: makeId(), type:'RECTANGLE', x, y, width:w, height:h, fill,
  cornerRadius: opts.r||0, opacity: opts.opacity||1, clip: false, children:[]
});

const text = (x,y,w,str,size,color,opts={}) => ({
  id: makeId(), type:'TEXT', x, y, width:w, height: opts.h||size*1.4,
  text: str, fontSize: size, fill: color,
  fontWeight: opts.weight||400,
  fontFamily: opts.font||'Inter',
  letterSpacing: opts.ls||0,
  lineHeight: opts.lh||(size*1.4),
  textAlign: opts.align||'left',
  clip: false, children:[]
});

const group = (x,y,w,h,children,opts={}) => ({
  id: makeId(), type:'GROUP', x, y, width:w, height:h,
  fill: opts.fill||'transparent', clip: opts.clip||false,
  cornerRadius: opts.r||0, children
});

// Status bar
const statusBar = () => group(0,0,W,44,[
  rect(0,0,W,44,'transparent'),
  text(16,14,60,'9:41',15,TEXT2,{weight:500}),
  text(W-80,14,80,'● ● ●',13,TEXT2,{align:'right'})
]);

// Bottom nav
const navBar = (active) => {
  const items = [
    { icon:'⌂', label:'Today',   id:'today' },
    { icon:'▶', label:'Playing', id:'player' },
    { icon:'◈', label:'Signals', id:'signals' },
    { icon:'≡', label:'Weekly',  id:'weekly' },
    { icon:'○', label:'Library', id:'library' },
  ];
  const children = [rect(0,0,W,82,SURFACE,{r:0}), rect(0,0,W,1,MUTED)];
  items.forEach((it, i) => {
    const cx = 39 + i*(W/5);
    const isActive = it.id === active;
    children.push(rect(cx-22,8,44,44, isActive ? 'rgba(134,96,255,0.14)':'transparent', {r:12}));
    children.push(text(cx-10,12,20, it.icon, 20, isActive?ACCENT:TEXT2, {align:'center'}));
    children.push(text(cx-20,34,40, it.label, 10, isActive?ACCENT:TEXT2, {align:'center',weight: isActive?600:400}));
  });
  return group(0, H-82, W, 82, children);
};

// Waveform bars  
const waveform = (x, y, w, h, progress=0.35) => {
  const bars = 40;
  const barW = (w - bars*2) / bars;
  const children = [];
  for (let i=0; i<bars; i++) {
    const barH = Math.random()*h*0.7 + h*0.15;
    const bx = x + i*(barW+2);
    const by = y + (h-barH)/2;
    const played = i/bars < progress;
    children.push(rect(bx,by,barW,barH, played?ACCENT:MUTED, {r:barW/2}));
  }
  // Progress dot
  const dotX = x + w*progress;
  children.push(rect(dotX-4, y+h/2-4, 8, 8, TEXT, {r:4}));
  return group(0,0,W,h, children);
};

// Category pill
const pill = (x,y,label,color,textColor=TEXT) => {
  const w = label.length*7+20;
  return group(x,y,w,24,[
    rect(0,0,w,24,color,{r:12}),
    text(10,4,w-20,label,11,textColor,{weight:600})
  ]);
};

// Signal card
const signalCard = (x,y,w, icon,title,value,change,color,category) => {
  const h = 88;
  return group(x,y,w,h,[
    rect(0,0,w,h,SURFACE,{r:16}),
    rect(0,0,4,h,color,{r:4}),
    text(14,14,w-80,title,12,TEXT2,{weight:500}),
    text(14,32,w-30,value,28,TEXT,{weight:700,font:'Inter',ls:-0.5}),
    text(14,62,120,category,11,TEXT2),
    pill(w-70,14, change, change.startsWith('+')?'rgba(52,211,153,0.15)':'rgba(255,107,107,0.15)',
         change.startsWith('+')?GREEN:ACCENT2),
  ]);
};

// ─────────────────────────────────────────────────────────
// SCREEN 1 — TODAY
// ─────────────────────────────────────────────────────────
const screen1 = () => {
  const ch = [
    rect(0,0,W,H,BG),
    statusBar(),

    // Header
    text(20,52,200,'Good morning,',14,TEXT2,{weight:400}),
    text(20,70,250,'Your Intelligence Brief',22,TEXT,{weight:700,ls:-0.3}),

    // Live badge
    group(W-80,56,64,24,[
      rect(0,0,64,24,'rgba(255,107,107,0.18)',{r:12}),
      rect(10,9,6,6,ACCENT2,{r:3}),
      text(20,5,44,'LIVE',11,ACCENT2,{weight:700,ls:1})
    ]),

    // ── Hero audio card ──────────────────────────────────
    group(16,108,W-32,172,[
      rect(0,0,W-32,172,SURF2,{r:24}),
      // gradient overlay top
      rect(0,0,W-32,60,'rgba(134,96,255,0.08)',{r:24}),

      text(16,16,200,'NOW PLAYING',10,TEXT2,{weight:600,ls:1.5}),
      text(16,34,W-64,'Product Weekly #47',18,TEXT,{weight:700,ls:-0.3}),
      text(16,56,W-64,'AI-generated from 284 signals · Apr 7',12,TEXT2),

      // waveform  
      ...waveform(16,84,W-64,40,0.38).children,

      // Time
      text(16,132,50,'5:42',12,TEXT2),
      text(W-80,132,50,'16:00',12,TEXT2,{align:'right'}),

      // Controls
      group(W/2-64,138,128,28,[
        rect(0,2,24,24,'transparent'),
        text(0,0,24,'⏮',18,TEXT2,{align:'center'}),
        rect(40,0,48,28,ACCENT,{r:14}),
        text(40,5,48,'▶',16,TEXT,{align:'center'}),
        rect(96,2,24,24,'transparent'),
        text(96,0,24,'⏭',18,TEXT2,{align:'center'}),
      ]),
    ]),

    // ── Metrics row ──────────────────────────────────────
    text(20,298,'KEY SIGNALS TODAY',11,TEXT2,{weight:600,ls:1.2}),

    // 3 metric cards
    signalCard(16,316, 110, '↑','NPS Score','72','+4', ACCENT, 'vs last week'),
    signalCard(138,316,110, '●','Churn Risk','3.2%','-0.8%',GREEN, 'accounts'),
    signalCard(260,316,110, '▲','Activation','68%','+12%',ACCENT3,'new users'),

    // ── Today's briefings list ───────────────────────────
    text(20,422,'BRIEF TOPICS',11,TEXT2,{weight:600,ls:1.2}),

    ...[
      {title:'Feature Adoption Deep Dive', dur:'4:12', tag:'Product', color:ACCENT},
      {title:'Q1 Churn Analysis',           dur:'6:30', tag:'Growth', color:GREEN},
      {title:'Leadership Alignment Brief',  dur:'3:50', tag:'Leaders', color:AMBER},
    ].map((item, i) => group(16, 440+i*76, W-32, 68,[
      rect(0,0,W-32,68,SURFACE,{r:16}),
      rect(0,20,4,28,item.color,{r:4}),
      text(16,12,W-120,item.title,14,TEXT,{weight:600}),
      text(16,34,200,item.dur+' · AI Summary',12,TEXT2),
      group(W-100,20,80,26,[
        rect(0,0,80,26,'rgba(134,96,255,0.12)',{r:13}),
        text(8,5,64,item.tag,11,ACCENT,{weight:600})
      ]),
      text(W-36,22,20,'›',20,TEXT2,{align:'center'}),
    ])),

    navBar('today'),
  ];
  return { id: makeId(), name:'Today', root: group(0,0,W,H,ch,{fill:BG}) };
};

// ─────────────────────────────────────────────────────────
// SCREEN 2 — BRIEFING PLAYER
// ─────────────────────────────────────────────────────────
const screen2 = () => {
  const ch = [
    rect(0,0,W,H,BG),
    // Large ambient glow
    rect(W/2-120,80,240,240,'rgba(134,96,255,0.12)',{r:120}),
    statusBar(),

    // Back + title
    text(20,52,40,'‹',22,TEXT2),
    text(W/2-80,54,160,'Now Playing',16,TEXT,{weight:600,align:'center'}),

    // Category badge
    group(W/2-32,80,64,22,[
      rect(0,0,64,22,'rgba(134,96,255,0.2)',{r:11}),
      text(8,3,48,'PRODUCT',10,ACCENT,{weight:700,ls:1})
    ]),

    // Album art  
    group(W/2-80,112,160,160,[
      rect(0,0,160,160,SURF2,{r:32}),
      rect(0,0,160,160,'rgba(134,96,255,0.08)',{r:32}),
      text(60,50,40,'◈',48,ACCENT,{align:'center'}),
      text(20,108,120,'TEMPO',18,TEXT2,{weight:700,ls:3,align:'center'}),
      text(20,128,120,'BRIEF',10,TEXT2,{weight:400,ls:5,align:'center'}),
    ]),

    text(W/2-120,284,240,'Product Weekly #47',20,TEXT,{weight:700,ls:-0.3,align:'center'}),
    text(W/2-140,308,280,'Generated from 284 signals across 3 sources',13,TEXT2,{align:'center'}),

    // Source chips
    group(W/2-100,330,80,22,[
      rect(0,0,80,22,'rgba(56,189,248,0.15)',{r:11}),
      text(8,3,64,'Mixpanel',11,ACCENT3,{weight:600})
    ]),
    group(W/2-10,330,72,22,[
      rect(0,0,72,22,'rgba(52,211,153,0.15)',{r:11}),
      text(8,3,56,'Zendesk',11,GREEN,{weight:600})
    ]),
    group(W/2+72,330,60,22,[
      rect(0,0,60,22,'rgba(134,96,255,0.15)',{r:11}),
      text(8,3,44,'Slack',11,ACCENT,{weight:600})
    ]),

    // Waveform (full)
    ...waveform(20,368,W-40,52,0.38).children,

    // Timestamps
    text(20,428,50,'5:42',12,TEXT2),
    text(W-60,428,50,'16:00',12,TEXT2,{align:'right'}),

    // Controls
    group(W/2-90,448,180,60,[
      text(0,10,40,'⏮',28,TEXT2,{align:'center'}),
      rect(55,0,60,60,ACCENT,{r:30}),
      text(55,14,60,'▶',28,TEXT,{align:'center'}),
      text(140,10,40,'⏭',28,TEXT2,{align:'center'}),
    ]),

    // Speed / bookmark
    group(30,522,80,28,[
      rect(0,0,80,28,SURF3,{r:14}),
      text(10,6,60,'1.2×',13,TEXT,{weight:600,align:'center'})
    ]),
    group(W-110,522,80,28,[
      rect(0,0,80,28,SURF3,{r:14}),
      text(10,6,60,'⤓ Save',12,TEXT,{weight:500,align:'center'})
    ]),

    // Topics in this brief
    text(20,566,'IN THIS BRIEF',11,TEXT2,{weight:600,ls:1.2}),

    ...[
      {t:'Feature adoption by cohort', time:'0:00'},
      {t:'Support ticket spike analysis',  time:'5:20'},
      {t:'Competitor movement signals', time:'10:44'},
    ].map((item,i) => group(16, 584+i*56,[
      rect(0,0,W-32,48,SURFACE,{r:12}),
      rect(16,15,8,18,ACCENT,{r:4}),
      text(32,10,W-120,item.t,13,TEXT,{weight:500}),
      text(W-68,14,50,item.time,12,TEXT2,{align:'right'}),
    ].filter(Boolean), W-32, 48)),

    navBar('player'),
  ];
  return { id: makeId(), name:'Briefing Player', root: group(0,0,W,H,ch,{fill:BG}) };
};

// ─────────────────────────────────────────────────────────
// SCREEN 3 — SIGNALS FEED
// ─────────────────────────────────────────────────────────
const screen3 = () => {
  const signals = [
    {icon:'↑', title:'NPS spike: Segment "Enterprise"', body:'NPS jumped +11 pts after last Tuesday\'s release. 3 promoters left detailed feedback.', tag:'Growth', color:GREEN, time:'2h ago'},
    {icon:'⚠', title:'Churn risk: 4 accounts flagged', body:'Usage dropped >40% in 7 days. Accounts: Acme, Brex, Notion, Linear.', tag:'Retention', color:ACCENT2, time:'4h ago'},
    {icon:'◈', title:'Feature adoption inflection', body:'Bulk export hit 12% DAU penetration — threshold for "sticky" classification.', tag:'Product', color:ACCENT, time:'6h ago'},
    {icon:'▲', title:'Activation rate: new high', body:'Week 3 activation reached 68% — highest in 6 months. Onboarding changes working.', tag:'Growth', color:ACCENT3, time:'9h ago'},
    {icon:'●', title:'Support volume: -22% WoW', body:'Ticket volume down 22% since docs revamp. Top deflected topic: API auth.', tag:'CX', color:AMBER, time:'12h ago'},
  ];

  const ch = [
    rect(0,0,W,H,BG),
    statusBar(),
    text(20,52,200,'Intelligence',26,TEXT,{weight:700,ls:-0.5}),
    text(20,80,200,'Signals',26,ACCENT,{weight:700,ls:-0.5}),

    // Filter chips
    ...[['All',true],['Growth',false],['Product',false],['Risk',false]].map(([label,active],i) => {
      const x = 20 + i*74;
      return group(x,112,70,28,[
        rect(0,0,70,28, active?ACCENT:'rgba(237,233,255,0.08)',{r:14}),
        text(0,7,70,label,12, active?'#090A10':TEXT2, {weight:600,align:'center'})
      ]);
    }),

    // Signal cards
    ...signals.map((sig, i) => group(16, 152+i*124, W-32, 116,[
      rect(0,0,W-32,116,SURFACE,{r:20}),
      rect(0,0,4,116,sig.color,{r:4}),
      // icon circle
      group(14,16,36,36,[
        rect(0,0,36,36,'rgba(134,96,255,0.12)',{r:18}),
        text(0,6,36,sig.icon,18,sig.color,{align:'center'})
      ]),
      text(58,16,W-130,sig.title,14,TEXT,{weight:600,lh:20}),
      text(W-72,14,52,sig.time,11,TEXT2,{align:'right'}),
      text(14,62,W-32-14-16,sig.body,12,TEXT2,{lh:17}),
      group(14,90,100,22,[
        rect(0,0,100,22,`rgba(134,96,255,0.12)`,{r:11}),
        text(8,3,84,sig.tag,11,ACCENT,{weight:600})
      ]),
      text(W-40,86,24,'›',20,TEXT2,{align:'center'}),
    ])),

    navBar('signals'),
  ];
  return { id: makeId(), name:'Signals Feed', root: group(0,0,W,H,ch,{fill:BG}) };
};

// ─────────────────────────────────────────────────────────
// SCREEN 4 — WEEKLY DIGEST
// ─────────────────────────────────────────────────────────
const screen4 = () => {
  const categories = [
    {label:'Product',   color:ACCENT,  count:4, dur:'16 min', desc:'Feature velocity, adoption curves, roadmap health'},
    {label:'Growth',    color:GREEN,   count:6, dur:'22 min', desc:'Funnel analysis, churn signals, expansion opps'},
    {label:'Leadership',color:AMBER,   count:3, dur:'10 min', desc:'Executive digest, OKR progress, team morale index'},
    {label:'CX',        color:ACCENT3, count:5, dur:'18 min', desc:'Support trends, CSAT, escalation patterns'},
  ];

  const ch = [
    rect(0,0,W,H,BG),
    statusBar(),

    text(20,52,200,'Week of',13,TEXT2),
    text(20,68,300,'Apr 7 — Apr 13',26,TEXT,{weight:700,ls:-0.5}),

    // Week progress bar
    group(20,108,W-40,6,[
      rect(0,0,W-40,6,MUTED,{r:3}),
      rect(0,0,(W-40)*0.14,6,ACCENT,{r:3}),
    ]),
    text(20,120,60,'MON',11,ACCENT,{weight:600}),
    text(W-60,120,60,'SUN',11,TEXT2,{align:'right'}),

    // Summary stat
    group(16,142,W-32,70,[
      rect(0,0,W-32,70,SURF2,{r:20}),
      text(16,14,80,'284',32,ACCENT,{weight:800,ls:-1}),
      text(16,48,120,'signals ingested',12,TEXT2),
      text(W/2,14,100,'12',32,TEXT,{weight:800,ls:-1}),
      text(W/2,48,100,'briefs generated',12,TEXT2),
      text(W/2+(W-32)/4,14,80,'4.8★',32,GREEN,{weight:800,ls:-0.5}),
      text(W/2+(W-32)/4,48,80,'signal quality',12,TEXT2),
    ]),

    text(20,228,'BRIEFING CHANNELS',11,TEXT2,{weight:600,ls:1.2}),

    ...categories.map((cat, i) => group(16, 248+i*110, W-32, 100,[
      rect(0,0,W-32,100,SURFACE,{r:20}),
      // Color band
      rect(0,0,W-32,4,cat.color,{r:[20,20,0,0]}),
      group(16,16,40,40,[
        rect(0,0,40,40,`rgba(${cat.color==='#8660FF'?'134,96,255':cat.color==='#34D399'?'52,211,153':cat.color==='#FBBF24'?'251,191,36':'56,189,248'},0.15)`,{r:12}),
        text(0,10,40,'◈',20,cat.color,{align:'center'})
      ]),
      text(64,14,W-180,cat.label+' Weekly',15,TEXT,{weight:700}),
      text(64,34,W-180,cat.desc,12,TEXT2,{lh:16}),
      text(64,56,120,`${cat.count} briefs · ${cat.dur}`,12,TEXT2),
      group(W-100,22,76,28,[
        rect(0,0,76,28,ACCENT,{r:14}),
        text(0,7,76,'Listen',13,'#090A10',{weight:700,align:'center'})
      ]),
    ])),

    navBar('weekly'),
  ];
  return { id: makeId(), name:'Weekly Digest', root: group(0,0,W,H,ch,{fill:BG}) };
};

// ─────────────────────────────────────────────────────────
// SCREEN 5 — LIBRARY
// ─────────────────────────────────────────────────────────
const screen5 = () => {
  const briefs = [
    {title:'Product Weekly #47', date:'Apr 7',  dur:'16:00', signals:284, tag:'Product',  color:ACCENT},
    {title:'Growth Deep Dive',   date:'Apr 5',  dur:'22:14', signals:198, tag:'Growth',   color:GREEN},
    {title:'Exec Brief — Q1 Close', date:'Apr 3', dur:'11:30', signals:156, tag:'Leaders', color:AMBER},
    {title:'CX Trend Report',    date:'Apr 1',  dur:'18:42', signals:210, tag:'CX',        color:ACCENT3},
    {title:'Product Weekly #46', date:'Mar 31', dur:'14:20', signals:267, tag:'Product',  color:ACCENT},
    {title:'Retention Analysis', date:'Mar 28', dur:'19:55', signals:183, tag:'Growth',   color:GREEN},
  ];

  const ch = [
    rect(0,0,W,H,BG),
    statusBar(),

    text(20,52,200,'Library',26,TEXT,{weight:700,ls:-0.5}),

    // Search bar
    group(16,88,W-32,42,[
      rect(0,0,W-32,42,SURFACE,{r:21}),
      text(16,12,24,'🔍',16,TEXT2),
      text(48,13,W-100,'Search briefings...',15,TEXT2),
    ]),

    text(20,146,'RECENT BRIEFS',11,TEXT2,{weight:600,ls:1.2}),

    ...briefs.map((b, i) => group(16, 164+i*78, W-32, 70,[
      rect(0,0,W-32,70,SURFACE,{r:16}),
      // Played indicator (first 2 fully played)
      rect(0,0,4,70,b.color,{r:[4,0,0,4]}),
      // Play button
      group(14,13,44,44,[
        rect(0,0,44,44, i<2?'rgba(134,96,255,0.12)':'rgba(237,233,255,0.06)',{r:22}),
        text(0,10,44, i<2?'✓':'▶',20, i<2?ACCENT:TEXT2, {align:'center'})
      ]),
      text(66,12,W-180,b.title,14,TEXT,{weight:600}),
      text(66,32,W-180,`${b.date} · ${b.dur} · ${b.signals} signals`,12,TEXT2),
      group(66,52,100,18,[
        rect(0,0,100,18,`rgba(134,96,255,0.1)`,{r:9}),
        text(8,1,84,b.tag,10,ACCENT,{weight:600})
      ]),
      text(W-40,22,24,'⋯',20,TEXT2,{align:'center'}),
    ])),

    navBar('library'),
  ];
  return { id: makeId(), name:'Library', root: group(0,0,W,H,ch,{fill:BG}) };
};

// ─────────────────────────────────────────────────────────
// ASSEMBLE PEN FILE
// ─────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'TEMPO — AI Business Intelligence Radio',
  width: W,
  height: H,
  screens: [
    screen1(),
    screen2(),
    screen3(),
    screen4(),
    screen5(),
  ]
};

fs.writeFileSync('/workspace/group/design-studio/tempo.pen', JSON.stringify(pen, null, 2));
console.log('✓ tempo.pen written');
console.log('  Screens:', pen.screens.map(s => s.name).join(', '));
