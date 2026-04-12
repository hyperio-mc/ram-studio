// FLOCK — Founder OS for AI-Native Teams
// LIGHT theme — warm parchment, indigo accent, amber agents
// Inspired by: Linear "teams + agents" era (darkmodedesign.com) +
//              Equals GTM AI Analyst (land-book.com) +
//              Dawn calm evidence-based UI (lapa.ninja)

'use strict';
const fs = require('fs');

const SLUG     = 'flock';
const APP_NAME = 'FLOCK';
const TAGLINE  = 'Your team + agents, one view';

const BG        = '#F7F5F1';
const SURFACE   = '#FFFFFF';
const SURFACE2  = '#EEEBE5';
const BORDER    = 'rgba(24,24,27,0.09)';
const TEXT       = '#18181B';
const MUTED      = 'rgba(24,24,27,0.42)';
const ACCENT     = '#5B5EF0';
const ACCENT_DIM = 'rgba(91,94,240,0.10)';
const ACCENT2    = '#F97316';
const ACCENT2_DIM= 'rgba(249,115,22,0.10)';
const SUCCESS    = '#16A34A';
const DANGER     = '#DC2626';

function text(x,y,w,h,content,style={}) {
  return { type:'text', x, y, width:w, height:h, content, style };
}
function rect(x,y,w,h,style={}) {
  return { type:'rectangle', x, y, width:w, height:h, style };
}
function line(x1,y1,x2,y2,color=BORDER,opacity=1) {
  return { type:'line', x1, y1, x2, y2, style:{ stroke:color, strokeWidth:1, opacity } };
}
function pill(x,y,w,h,fill,labelColor,label) {
  return [
    rect(x,y,w,h, { fill, borderRadius:h/2 }),
    text(x,y+(h-12)/2,w,12, label, { fontSize:9, fontWeight:700, color:labelColor, textAlign:'center', letterSpacing:0.4 }),
  ];
}
function bar(x,y,w,pct,fill,bg=SURFACE2) {
  return [
    rect(x,y,w,6, { fill:bg, borderRadius:3 }),
    rect(x,y,Math.round(w*pct/100),6, { fill, borderRadius:3 }),
  ];
}
function screen(id,label,elements) {
  return { id, label, background:BG, elements };
}
function nav(active) {
  const items = [
    { id:'today', icon:'⌂', label:'Today' },
    { id:'agents', icon:'⚡', label:'Agents' },
    { id:'goals', icon:'◎', label:'Goals' },
    { id:'finance', icon:'⬡', label:'Finance' },
    { id:'sprint', icon:'▷', label:'Sprint' },
  ];
  return [
    rect(0,790,390,74,{ fill:SURFACE }),
    line(0,790,390,790),
    ...items.flatMap((item,i)=>{
      const x=14+i*73;
      const on=item.id===active;
      return [
        text(x,800,64,20,item.icon,{ fontSize:16, textAlign:'center', color:on?ACCENT:MUTED }),
        text(x,822,64,14,item.label,{ fontSize:9, fontWeight:on?700:500, color:on?ACCENT:MUTED, textAlign:'center' }),
        ...(on?[rect(x+22,856,20,3,{ fill:ACCENT, borderRadius:2 })]:[]),
      ];
    }),
  ];
}
function topBar(title,sub='') {
  return [
    rect(0,0,390,52,{ fill:SURFACE }),
    line(0,52,390,52),
    text(20,13,200,20,title,{ fontSize:17, fontWeight:800, color:TEXT, letterSpacing:-0.3 }),
    ...(sub?[text(20,34,220,14,sub,{ fontSize:10, fontWeight:500, color:MUTED })]:[]),
    text(330,13,40,26,'⋯',{ fontSize:20, color:MUTED, textAlign:'center' }),
  ];
}

// ── SCREEN 1: TODAY ──────────────────────────────────────────────────────
const s1 = screen('today','Today',[
  ...topBar('Today','SAT 28 MAR · Q1 W13'),

  text(20,64,300,26,'Good morning, Rakis',{ fontSize:20, fontWeight:700, color:TEXT, letterSpacing:-0.5 }),
  text(20,92,300,16,'4 agents + 3 humans have 24 tasks today',{ fontSize:12, color:MUTED }),
  line(20,116,370,116),

  // dual workforce cards
  rect(20,126,166,106,{ fill:SURFACE, borderRadius:14, border:`1px solid ${BORDER}` }),
  ...pill(30,136,64,20,ACCENT_DIM,ACCENT,'HUMANS'),
  text(34,162,100,34,'3',{ fontSize:30, fontWeight:900, color:TEXT }),
  text(74,170,80,18,'active',{ fontSize:11, color:MUTED }),
  text(34,198,60,14,'11 tasks',{ fontSize:11, fontWeight:600, color:ACCENT }),
  text(98,198,78,14,'4 done',{ fontSize:11, color:MUTED }),

  rect(200,126,170,106,{ fill:SURFACE, borderRadius:14, border:`1px solid ${BORDER}` }),
  ...pill(210,136,64,20,ACCENT2_DIM,ACCENT2,'AGENTS'),
  text(214,162,100,34,'4',{ fontSize:30, fontWeight:900, color:TEXT }),
  text(254,170,80,18,'running',{ fontSize:11, color:MUTED }),
  text(214,198,62,14,'13 tasks',{ fontSize:11, fontWeight:600, color:ACCENT2 }),
  text(282,198,78,14,'9 done',{ fontSize:11, color:MUTED }),

  // day progress
  rect(20,244,350,68,{ fill:SURFACE, borderRadius:12, border:`1px solid ${BORDER}` }),
  text(32,254,160,14,'DAY COMPLETION',{ fontSize:9, fontWeight:700, color:MUTED, letterSpacing:2.5 }),
  text(308,254,50,14,'54%',{ fontSize:11, fontWeight:700, color:ACCENT }),
  ...bar(32,274,318,54,ACCENT),
  text(32,288,140,12,'13 / 24 tasks done',{ fontSize:10, color:MUTED }),
  text(242,288,108,12,'4h 20m left',{ fontSize:10, color:MUTED, textAlign:'right' }),

  text(20,326,160,16,'Live Activity',{ fontSize:13, fontWeight:700, color:TEXT }),
  text(280,326,90,16,'View all →',{ fontSize:11, fontWeight:600, color:ACCENT, textAlign:'right' }),

  // feed item 1
  rect(20,350,350,58,{ fill:SURFACE, borderRadius:10, border:`1px solid ${BORDER}` }),
  rect(30,364,28,28,{ fill:ACCENT2_DIM, borderRadius:8 }),
  text(30,364,28,28,'⚡',{ fontSize:14, textAlign:'center', color:ACCENT2 }),
  text(66,354,230,15,'Analyst Agent',{ fontSize:12, fontWeight:700, color:TEXT }),
  text(66,371,230,14,'Q1 revenue analysis complete · 2m ago',{ fontSize:11, color:MUTED }),
  text(306,356,44,14,'Done',{ fontSize:11, fontWeight:600, color:SUCCESS }),

  // feed item 2
  rect(20,416,350,58,{ fill:SURFACE, borderRadius:10, border:`1px solid ${BORDER}` }),
  rect(30,430,28,28,{ fill:ACCENT_DIM, borderRadius:8 }),
  text(30,430,28,28,'◉',{ fontSize:13, textAlign:'center', color:ACCENT }),
  text(66,420,230,15,'Sarah K.',{ fontSize:12, fontWeight:700, color:TEXT }),
  text(66,437,230,14,'Reviewing investor deck · In progress',{ fontSize:11, color:MUTED }),
  ...pill(296,424,54,18,ACCENT_DIM,ACCENT,'Active'),

  // feed item 3
  rect(20,482,350,58,{ fill:SURFACE, borderRadius:10, border:`1px solid ${BORDER}` }),
  rect(30,496,28,28,{ fill:'rgba(220,38,38,0.08)', borderRadius:8 }),
  text(30,496,28,28,'!',{ fontSize:14, fontWeight:800, textAlign:'center', color:DANGER }),
  text(66,486,230,15,'Pricing Agent',{ fontSize:12, fontWeight:700, color:TEXT }),
  text(66,503,280,14,'Needs decision: new tier at $299?',{ fontSize:11, color:MUTED }),
  ...pill(276,490,84,18,'rgba(220,38,38,0.08)',DANGER,'Needs review'),

  // quick actions
  rect(20,556,166,44,{ fill:ACCENT, borderRadius:10 }),
  text(20,568,166,20,'+ New Task',{ fontSize:13, fontWeight:700, color:'#FFFFFF', textAlign:'center' }),
  rect(200,556,170,44,{ fill:SURFACE2, borderRadius:10 }),
  text(200,568,170,20,'▷ Run Agent',{ fontSize:13, fontWeight:700, color:TEXT, textAlign:'center' }),

  ...nav('today'),
]);

// ── SCREEN 2: AGENTS ─────────────────────────────────────────────────────
const s2 = screen('agents','Agents',[
  ...topBar('AI Agents','4 running · 2 idle'),

  rect(20,64,160,64,{ fill:SURFACE, borderRadius:12, border:`1px solid ${BORDER}` }),
  text(32,74,136,12,'TASKS TODAY',{ fontSize:9, fontWeight:700, color:MUTED, letterSpacing:2 }),
  text(32,90,80,28,'22',{ fontSize:24, fontWeight:900, color:TEXT }),
  text(90,98,60,16,'9 done',{ fontSize:11, color:SUCCESS }),

  rect(196,64,174,64,{ fill:SURFACE, borderRadius:12, border:`1px solid ${BORDER}` }),
  text(208,74,150,12,'SAVED HOURS',{ fontSize:9, fontWeight:700, color:MUTED, letterSpacing:2 }),
  text(208,90,80,28,'14.2h',{ fontSize:24, fontWeight:900, color:TEXT }),
  text(296,98,60,16,'↑ 2.1h',{ fontSize:11, color:ACCENT }),

  line(20,140,370,140),
  text(20,150,140,16,'Active Agents',{ fontSize:13, fontWeight:700, color:TEXT }),
  ...pill(154,150,44,18,ACCENT_DIM,ACCENT,'4 live'),

  // Agent 1 — Analyst (done)
  rect(20,176,350,88,{ fill:SURFACE, borderRadius:12, border:`1px solid ${BORDER}` }),
  rect(30,190,36,36,{ fill:ACCENT2_DIM, borderRadius:10 }),
  text(30,190,36,36,'📊',{ fontSize:18, textAlign:'center', color:ACCENT2 }),
  text(74,192,200,16,'Analyst Agent',{ fontSize:13, fontWeight:700, color:TEXT }),
  ...pill(278,192,62,20,'rgba(22,163,74,0.1)',SUCCESS,'● Done'),
  text(74,210,250,14,'Q1 revenue deep-dive · triggered 2h ago',{ fontSize:11, color:MUTED }),
  text(30,240,180,14,'3 tasks · 0 blocked',{ fontSize:11, fontWeight:600, color:MUTED }),
  text(240,240,60,14,'Output →',{ fontSize:11, fontWeight:600, color:ACCENT }),

  // Agent 2 — Pricing (blocked)
  rect(20,274,350,88,{ fill:SURFACE, borderRadius:12, border:`1px solid ${BORDER}` }),
  rect(30,288,36,36,{ fill:'rgba(220,38,38,0.08)', borderRadius:10 }),
  text(30,288,36,36,'💰',{ fontSize:18, textAlign:'center', color:DANGER }),
  text(74,290,200,16,'Pricing Agent',{ fontSize:13, fontWeight:700, color:TEXT }),
  ...pill(264,290,76,20,'rgba(220,38,38,0.08)',DANGER,'⚠ Blocked'),
  text(74,308,260,14,'New tier analysis · awaiting your decision',{ fontSize:11, color:MUTED }),
  text(30,338,200,14,'2 tasks · 1 blocked',{ fontSize:11, fontWeight:600, color:DANGER }),
  text(230,338,60,14,'Unblock →',{ fontSize:11, fontWeight:600, color:ACCENT }),

  // Agent 3 — Outreach (running)
  rect(20,372,350,82,{ fill:SURFACE, borderRadius:12, border:`1px solid ${BORDER}` }),
  rect(30,386,36,36,{ fill:ACCENT_DIM, borderRadius:10 }),
  text(30,386,36,36,'✉',{ fontSize:18, textAlign:'center', color:ACCENT }),
  text(74,388,200,16,'Outreach Agent',{ fontSize:13, fontWeight:700, color:TEXT }),
  ...pill(268,388,72,20,ACCENT_DIM,ACCENT,'● Running'),
  text(74,406,260,14,'Sending 40 follow-ups · 28 sent so far',{ fontSize:11, color:MUTED }),
  ...bar(30,432,322,70,ACCENT),
  text(30,446,80,12,'28 / 40',{ fontSize:10, color:MUTED }),
  text(270,446,72,12,'70% done',{ fontSize:10, color:MUTED, textAlign:'right' }),

  // Agent 4 — Docs (queued)
  rect(20,464,350,80,{ fill:SURFACE, borderRadius:12, border:`1px solid ${BORDER}` }),
  rect(30,478,36,36,{ fill:SURFACE2, borderRadius:10 }),
  text(30,478,36,36,'📄',{ fontSize:18, textAlign:'center', color:MUTED }),
  text(74,480,200,16,'Docs Agent',{ fontSize:13, fontWeight:700, color:TEXT }),
  ...pill(266,480,74,20,SURFACE2,MUTED,'◌ Queued'),
  text(74,498,260,14,'API changelog draft · starts 15:00',{ fontSize:11, color:MUTED }),
  ...bar(30,524,322,0,ACCENT,SURFACE2),
  text(30,538,130,12,'Starts in 32 min',{ fontSize:10, color:MUTED }),

  text(20,558,200,16,'Idle Agents',{ fontSize:13, fontWeight:700, color:TEXT }),
  rect(20,578,350,38,{ fill:SURFACE2, borderRadius:10 }),
  text(32,590,260,16,'SEO Agent  ·  Support Agent',{ fontSize:12, color:MUTED }),
  text(300,590,60,16,'Wake →',{ fontSize:11, fontWeight:600, color:ACCENT, textAlign:'right' }),

  ...nav('agents'),
]);

// ── SCREEN 3: GOALS ──────────────────────────────────────────────────────
const s3 = screen('goals','Goals',[
  ...topBar('Goals','Q1 2025 · 3 days left'),

  rect(20,64,350,84,{ fill:SURFACE, borderRadius:14, border:`1px solid ${BORDER}` }),
  text(32,76,200,12,'Q1 HEALTH SCORE',{ fontSize:9, fontWeight:700, color:MUTED, letterSpacing:2.5 }),
  text(32,94,100,36,'72',{ fontSize:32, fontWeight:900, color:ACCENT }),
  text(100,106,60,16,'/ 100',{ fontSize:14, color:MUTED }),
  ...pill(256,94,74,22,'rgba(249,115,22,0.12)',ACCENT2,'At risk'),
  text(32,132,310,12,'2 of 4 objectives on track · AI forecast: 68 pts EOQ',{ fontSize:10, color:MUTED }),

  line(20,160,370,160),
  text(20,170,140,16,'Objectives',{ fontSize:13, fontWeight:700, color:TEXT }),
  text(310,170,60,16,'Q1 →',{ fontSize:11, fontWeight:600, color:ACCENT, textAlign:'right' }),

  // OKR 1
  rect(20,192,350,84,{ fill:SURFACE, borderRadius:12, border:`1px solid ${BORDER}` }),
  rect(20,192,5,84,{ fill:SUCCESS, borderRadius:3 }),
  text(36,202,200,16,'Reach $500K ARR',{ fontSize:13, fontWeight:700, color:TEXT }),
  ...pill(288,202,62,20,'rgba(22,163,74,0.1)',SUCCESS,'On track'),
  text(36,220,300,14,'Current $424K · 84.8% of target',{ fontSize:11, color:MUTED }),
  ...bar(36,240,316,85,SUCCESS),
  text(36,254,60,12,'85%',{ fontSize:10, fontWeight:700, color:SUCCESS }),
  text(280,254,70,12,'3 KRs ✓ ✓ ✗',{ fontSize:10, color:MUTED }),

  // OKR 2
  rect(20,286,350,84,{ fill:SURFACE, borderRadius:12, border:`1px solid ${BORDER}` }),
  rect(20,286,5,84,{ fill:ACCENT2, borderRadius:3 }),
  text(36,296,200,16,'Launch EU market',{ fontSize:13, fontWeight:700, color:TEXT }),
  ...pill(270,296,80,20,ACCENT2_DIM,ACCENT2,'At risk'),
  text(36,314,300,14,'Legal 80% · Partnership 30% done',{ fontSize:11, color:MUTED }),
  ...bar(36,334,316,55,ACCENT2),
  text(36,348,60,12,'55%',{ fontSize:10, fontWeight:700, color:ACCENT2 }),
  text(256,348,94,12,'3 decisions needed',{ fontSize:10, color:MUTED }),

  // OKR 3
  rect(20,380,350,84,{ fill:SURFACE, borderRadius:12, border:`1px solid ${BORDER}` }),
  rect(20,380,5,84,{ fill:ACCENT, borderRadius:3 }),
  text(36,390,200,16,'Ship AI Agents v2',{ fontSize:13, fontWeight:700, color:TEXT }),
  ...pill(272,390,78,20,ACCENT_DIM,ACCENT,'On track'),
  text(36,408,300,14,'Core runtime shipped · UX in review',{ fontSize:11, color:MUTED }),
  ...bar(36,428,316,78,ACCENT),
  text(36,442,60,12,'78%',{ fontSize:10, fontWeight:700, color:ACCENT }),
  text(248,442,102,12,'14 agent tasks done',{ fontSize:10, color:MUTED }),

  // OKR 4
  rect(20,474,350,84,{ fill:SURFACE, borderRadius:12, border:`1px solid ${BORDER}` }),
  rect(20,474,5,84,{ fill:DANGER, borderRadius:3 }),
  text(36,484,200,16,'NPS above 55',{ fontSize:13, fontWeight:700, color:TEXT }),
  ...pill(276,484,74,20,'rgba(220,38,38,0.08)',DANGER,'Off track'),
  text(36,502,300,14,'Current: 41 · Target: 55 · Gap: 14 pts',{ fontSize:11, color:MUTED }),
  ...bar(36,522,316,36,DANGER),
  text(36,536,60,12,'36%',{ fontSize:10, fontWeight:700, color:DANGER }),
  text(224,536,126,12,'Support Agent assigned',{ fontSize:10, color:MUTED }),

  ...nav('goals'),
]);

// ── SCREEN 4: FINANCE ────────────────────────────────────────────────────
const s4 = screen('finance','Finance',[
  ...topBar('Finance','MAR 2025 · Live'),

  // ARR hero
  rect(20,64,350,96,{ fill:ACCENT, borderRadius:16 }),
  text(36,78,200,12,'ANNUAL RECURRING REVENUE',{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.65)', letterSpacing:2 }),
  text(36,98,200,40,'$424K',{ fontSize:34, fontWeight:900, color:'#FFFFFF' }),
  text(192,110,140,18,'↑ 8.2% MoM',{ fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.8)' }),
  text(36,140,310,12,'Target $500K · 84.8% · 18 mo runway',{ fontSize:10, color:'rgba(255,255,255,0.6)' }),

  // KPI row
  rect(20,172,100,68,{ fill:SURFACE, borderRadius:12, border:`1px solid ${BORDER}` }),
  text(30,182,80,12,'MRR',{ fontSize:9, fontWeight:700, color:MUTED, letterSpacing:2 }),
  text(30,198,80,26,'$35.3K',{ fontSize:20, fontWeight:800, color:TEXT }),
  text(30,228,80,12,'↑ $2.1K',{ fontSize:10, fontWeight:600, color:SUCCESS }),

  rect(134,172,100,68,{ fill:SURFACE, borderRadius:12, border:`1px solid ${BORDER}` }),
  text(144,182,80,12,'BURN/MO',{ fontSize:9, fontWeight:700, color:MUTED, letterSpacing:2 }),
  text(144,198,80,26,'$18.4K',{ fontSize:20, fontWeight:800, color:TEXT }),
  text(144,228,80,12,'/month avg',{ fontSize:10, color:MUTED }),

  rect(248,172,122,68,{ fill:SURFACE, borderRadius:12, border:`1px solid ${BORDER}` }),
  text(258,182,100,12,'RUNWAY',{ fontSize:9, fontWeight:700, color:MUTED, letterSpacing:2 }),
  text(258,198,100,26,'18 mo',{ fontSize:20, fontWeight:800, color:TEXT }),
  text(258,228,100,12,'safe zone',{ fontSize:10, fontWeight:600, color:SUCCESS }),

  // bar chart
  line(20,252,370,252),
  text(20,260,200,16,'Revenue vs Burn · 6 months',{ fontSize:13, fontWeight:700, color:TEXT }),

  ...['Oct','Nov','Dec','Jan','Feb','Mar'].flatMap((m,i)=>{
    const x=26+i*57;
    const rev=[26,28,31,30,33,35][i];
    const burn=[16,17,18,17,18,18][i];
    const revH=Math.round((rev/40)*80);
    const burnH=Math.round((burn/40)*80);
    return [
      rect(x,358-revH,22,revH,{ fill:ACCENT, borderRadius:3, opacity:0.85 }),
      rect(x+24,358-burnH,20,burnH,{ fill:SURFACE2, borderRadius:3 }),
      text(x,364,46,12,m,{ fontSize:9, color:MUTED, textAlign:'center' }),
    ];
  }),
  text(26,382,70,12,'■ Revenue',{ fontSize:9, fontWeight:600, color:ACCENT }),
  text(100,382,60,12,'■ Burn',{ fontSize:9, fontWeight:600, color:MUTED }),

  // top expenses
  line(20,400,370,400),
  text(20,408,200,16,'Top Expenses (Mar)',{ fontSize:13, fontWeight:700, color:TEXT }),

  ...[
    ['Salaries','$8,200',45],
    ['Infrastructure','$4,840',26],
    ['Marketing','$3,440',19],
    ['Agent Credits','$1,920',10],
  ].flatMap(([label,amt,pct],i)=>{
    const y=430+i*46;
    return [
      rect(20,y,350,40,{ fill:SURFACE, borderRadius:8, border:`1px solid ${BORDER}` }),
      text(32,y+12,160,15,label,{ fontSize:12, fontWeight:600, color:TEXT }),
      text(282,y+12,58,15,amt,{ fontSize:12, fontWeight:700, color:TEXT, textAlign:'right' }),
      ...bar(32,y+30,200,pct,ACCENT2,SURFACE2),
      text(238,y+28,36,12,`${pct}%`,{ fontSize:9, color:MUTED }),
    ];
  }),

  ...nav('finance'),
]);

// ── SCREEN 5: SPRINT ─────────────────────────────────────────────────────
const s5 = screen('sprint','Sprint',[
  ...topBar('Sprint 13','Mar 24 – Apr 4 · Day 5/10'),

  rect(20,64,350,76,{ fill:SURFACE, borderRadius:14, border:`1px solid ${BORDER}` }),
  text(32,76,200,12,'SPRINT VELOCITY',{ fontSize:9, fontWeight:700, color:MUTED, letterSpacing:2.5 }),
  text(32,94,80,30,'38',{ fontSize:26, fontWeight:900, color:TEXT }),
  text(90,102,80,16,'/ 64 pts',{ fontSize:13, color:MUTED }),
  ...pill(218,94,74,22,ACCENT_DIM,ACCENT,'59% done'),
  text(300,94,60,22,'On pace',{ fontSize:11, fontWeight:600, color:SUCCESS }),
  ...bar(32,128,318,59,ACCENT),

  text(20,150,200,16,'Workload split',{ fontSize:13, fontWeight:700, color:TEXT }),

  rect(20,172,166,58,{ fill:SURFACE, borderRadius:10, border:`1px solid ${BORDER}` }),
  text(32,182,140,12,'HUMAN TEAM',{ fontSize:9, fontWeight:700, color:MUTED, letterSpacing:2 }),
  text(32,198,60,26,'22 pts',{ fontSize:18, fontWeight:800, color:TEXT }),
  ...bar(32,222,130,58,ACCENT),

  rect(200,172,170,58,{ fill:SURFACE, borderRadius:10, border:`1px solid ${BORDER}` }),
  text(212,182,146,12,'AI AGENTS',{ fontSize:9, fontWeight:700, color:MUTED, letterSpacing:2 }),
  text(212,198,60,26,'16 pts',{ fontSize:18, fontWeight:800, color:TEXT }),
  ...bar(212,222,134,61,ACCENT2),

  line(20,242,370,242),
  text(20,252,140,16,'Active Tasks',{ fontSize:13, fontWeight:700, color:TEXT }),
  text(294,252,76,16,'16 open',{ fontSize:11, color:MUTED, textAlign:'right' }),

  ...[
    ['Pricing page redesign','Sarah',5,'Design','#E879F9',false],
    ['AI agent billing hooks','Analyst ⚡',8,'Eng',ACCENT,true],
    ['EU compliance audit','Legal ⚡',3,'Legal',ACCENT2,false],
    ['Onboarding email flow','Outreach ⚡',5,'Growth',SUCCESS,true],
    ['Q1 board deck','You',3,'Exec',MUTED,false],
  ].flatMap(([label,who,pts,tag,tagColor,done],i)=>{
    const y=274+i*50;
    return [
      rect(20,y,350,44,{ fill:done?SURFACE2:SURFACE, borderRadius:9, border:`1px solid ${BORDER}` }),
      rect(30,y+12,20,20,{ fill:done?SUCCESS:'rgba(91,94,240,0.08)', borderRadius:5 }),
      text(30,y+12,20,20,done?'✓':'○',{ fontSize:11, fontWeight:700, textAlign:'center', color:done?'#FFFFFF':MUTED }),
      text(58,y+7,180,15,label,{ fontSize:12, fontWeight:done?500:600, color:done?MUTED:TEXT }),
      text(58,y+24,100,12,who,{ fontSize:10, color:MUTED }),
      rect(248,y+11,46,20,{ fill:`${tagColor}20`, borderRadius:5 }),
      text(248,y+13,46,14,tag,{ fontSize:9, fontWeight:700, color:tagColor, textAlign:'center' }),
      text(302,y+7,40,15,`${pts}p`,{ fontSize:12, fontWeight:700, color:done?MUTED:TEXT, textAlign:'right' }),
    ];
  }),

  ...nav('sprint'),
]);

// ── Write .pen ────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: APP_NAME,
  tagline: TAGLINE,
  theme: 'light',
  screens: [s1,s2,s3,s4,s5],
};
fs.writeFileSync(`${__dirname}/flock.pen`, JSON.stringify(pen,null,2));
console.log(`✓ flock.pen written — ${pen.screens.length} screens`);
