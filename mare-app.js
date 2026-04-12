// MARE — Sleep Intelligence Platform
// Inspired by: darkmodedesign.com — Cecilia (matte 3D sculptural spheres on pure black +
// oversized centered display type) and Muradov (MEGA display weight headers full-width).
// Challenge: ultra-bold display numbers + deep bioluminescent dark UI + orbital data viz
// Theme: DARK (#06080F midnight base with #00E5A0 bioluminescent accent)

const fs = require('fs');

const BG       = '#06080F';
const SURFACE  = '#0D1120';
const SURFACE2 = '#141828';
const TEXT     = '#DCE8F5';
const MUTED    = '#5A7090';
const ACCENT   = '#00E5A0';  // bioluminescent green
const ACCENT2  = '#6B52FF';  // electric violet
const DIM      = '#1A2235';
const RED      = '#FF4D6A';
const AMBER    = '#F5A623';

function rect(x,y,w,h,fill,opts={}) {
  return { type:'rectangle', x,y,width:w,height:h, fill, opacity:1,
    borderRadius: opts.r||0, ...opts };
}
function txt(x,y,w,h,content,fontSize,fontWeight,color,opts={}) {
  return { type:'text', x,y,width:w,height:h, content, fontSize, fontWeight,
    color, letterSpacing: opts.ls||0, textAlign: opts.align||'left',
    opacity: opts.op||1, ...opts };
}
function line(x,y,w,color,op=0.15) {
  return rect(x,y,w,1,color,{opacity:op});
}
function pill(x,y,w,h,fill,text,tColor,fontSize=10) {
  return [
    rect(x,y,w,h,fill,{r:h/2}),
    txt(x,y,w,h,text,fontSize,'600',tColor,{align:'center'}),
  ];
}

// ─── NAV BAR ───────────────────────────────────────────────────────────────
function navBar(activeIdx) {
  const tabs = [
    {icon:'◎', label:'Score'},
    {icon:'≋', label:'Stages'},
    {icon:'⌇', label:'Trends'},
    {icon:'♡', label:'Recovery'},
    {icon:'◈', label:'Coach'},
  ];
  const els = [
    rect(0, 784, 390, 84, SURFACE2),
    line(0, 784, 390, ACCENT, 0.12),
  ];
  tabs.forEach((t,i) => {
    const x = 9 + i*74;
    const isActive = i === activeIdx;
    els.push(
      txt(x, 793, 68, 14, t.icon, 16, '400', isActive ? ACCENT : MUTED,
        {align:'center', op:isActive?1:0.6}),
      txt(x, 811, 68, 11, t.label, 9, isActive?'600':'400',
        isActive ? ACCENT : MUTED, {align:'center', op:isActive?1:0.5}),
    );
    if (isActive) {
      els.push(rect(x+22, 856, 24, 2, ACCENT, {r:1}));
    }
  });
  return els;
}

// ─── STATUS BAR ─────────────────────────────────────────────────────────────
function statusBar() {
  return [
    rect(0,0,390,44,BG),
    txt(20,14,60,14,'9:41',12,'500',TEXT,{op:0.7}),
    txt(310,14,60,14,'●●● ᵂᶦᶠᶦ  ▮▮▮▮',10,'400',TEXT,{align:'right',op:0.5}),
  ];
}

// ─── SCREEN 1: SLEEP SCORE ──────────────────────────────────────────────────
function scoreScreen() {
  const els = [
    rect(0,0,390,868,BG),
    ...statusBar(),
    // Section label
    txt(20,52,200,14,'SLEEP SCORE',9,'600',ACCENT,{ls:3}),
    txt(20,68,350,22,'Last night',18,'400',TEXT,{op:0.6}),

    // Giant score ring simulation — concentric arcs as rectangles
    // Outer glow circle (large matte orb feel, like Cecilia's 3D spheres)
    { type:'ellipse', x:95, y:105, width:200, height:200,
      fill:'none', stroke:SURFACE2, strokeWidth:18, opacity:1 },
    { type:'ellipse', x:95, y:105, width:200, height:200,
      fill:'none', stroke:ACCENT, strokeWidth:6, opacity:0.15 },
    // Score arc progress (simulated as thinner ring overlay)
    { type:'ellipse', x:105, y:115, width:180, height:180,
      fill:SURFACE, opacity:1 },
    { type:'ellipse', x:118, y:128, width:154, height:154,
      fill:BG, opacity:1 },

    // Big score number — ultra-bold like Muradov's full-width display type
    txt(95, 165, 200, 80, '87', 80, '800', TEXT, {align:'center'}),
    txt(95, 245, 200, 18, 'GOOD', 11, '700', ACCENT, {align:'center', ls:4}),

    // Subtitle
    txt(80, 312, 230, 16, 'Top 18% of your age group', 12, '400', MUTED, {align:'center'}),

    // ── Three metric cards ─────────────────────────────────────────
    // Deep sleep
    rect(16, 340, 110, 80, SURFACE, {r:14}),
    rect(20, 344, 3, 72, ACCENT, {r:2}),
    txt(32, 356, 90, 12, 'DEEP', 8,'600', MUTED, {ls:2}),
    txt(32, 372, 90, 32, '1h 42m', 20,'700', TEXT),
    txt(32, 404, 90, 12, '↑ 14min', 9,'500', ACCENT),

    // REM
    rect(140, 340, 110, 80, SURFACE, {r:14}),
    rect(144, 344, 3, 72, ACCENT2, {r:2}),
    txt(156, 356, 90, 12, 'REM', 8,'600', MUTED, {ls:2}),
    txt(156, 372, 90, 32, '2h 08m', 20,'700', TEXT),
    txt(156, 404, 90, 12, '→ stable', 9,'500', MUTED),

    // Efficiency
    rect(264, 340, 110, 80, SURFACE, {r:14}),
    rect(268, 344, 3, 72, AMBER, {r:2, opacity:0.8}),
    txt(280, 356, 90, 12, 'EFFIC.', 8,'600', MUTED, {ls:2}),
    txt(280, 372, 90, 32, '91%', 20,'700', TEXT),
    txt(280, 404, 90, 12, '↑ 3%', 9,'500', ACCENT),

    // ── Sleep stages mini bar ──────────────────────────────────────
    txt(20, 438, 300, 14, 'STAGE BREAKDOWN', 8,'600', MUTED, {ls:2}),
    // stage bar segments
    rect(20, 458, 56, 8, SURFACE2, {r:4}),   // Awake
    rect(78, 458, 80, 8, ACCENT2, {r:0, opacity:0.7}),  // Light
    rect(160, 458, 95, 8, ACCENT, {r:0, opacity:0.9}),  // Deep
    rect(257, 458, 70, 8, '#9B6EFF', {r:4, opacity:0.8}), // REM
    txt(20, 472, 56, 12, 'Awake', 9,'400', MUTED, {align:'center'}),
    txt(78, 472, 80, 12, 'Light', 9,'400', MUTED, {align:'center'}),
    txt(160, 472, 95, 12, 'Deep', 9,'600', ACCENT, {align:'center'}),
    txt(257, 472, 70, 12, 'REM', 9,'400', MUTED, {align:'center'}),

    // ── Weekly trend strip ─────────────────────────────────────────
    txt(20, 498, 300, 14, 'THIS WEEK', 8,'600', MUTED, {ls:2}),
    ...[
      {d:'Mo', s:82, x:20},
      {d:'Tu', s:74, x:66},
      {d:'We', s:90, x:112},
      {d:'Th', s:78, x:158},
      {d:'Fr', s:85, x:204},
      {d:'Sa', s:88, x:250},
      {d:'Su', s:87, x:296, active:true},
    ].flatMap(({d,s,x,active}) => [
      rect(x, 518 + (100-s)*0.3, 34, s*0.3, active?ACCENT:SURFACE2, {r:4, opacity:active?1:0.7}),
      txt(x, 552, 34, 12, d, 9, active?'600':'400', active?ACCENT:MUTED, {align:'center'}),
      txt(x, 517+(100-s)*0.3-14, 34, 12, String(s), 8, '500', active?ACCENT:MUTED, {align:'center'}),
    ]),

    line(20, 582, 350, TEXT, 0.06),

    // ── Insight card ──────────────────────────────────────────────
    rect(16, 592, 358, 68, SURFACE, {r:16}),
    txt(32, 606, 20, 20, '✦', 14, '400', ACCENT),
    txt(56, 606, 300, 14, 'AI Sleep Insight', 10, '600', ACCENT),
    txt(56, 622, 290, 32, 'Your deep sleep peaks on nights\nyou stop screens before 10pm.', 11, '400', TEXT, {op:0.8}),

    ...navBar(0),
  ];
  return { id:'score', name:'Score', backgroundColor:BG, statusBarStyle:'light', elements:els };
}

// ─── SCREEN 2: SLEEP STAGES ─────────────────────────────────────────────────
function stagesScreen() {
  const stages = [
    {label:'Awake', dur:'18m', pct:6, color:MUTED, y:130},
    {label:'Light', dur:'2h 24m', pct:38, color:ACCENT2, y:188},
    {label:'Deep',  dur:'1h 42m', pct:27, color:ACCENT, y:246},
    {label:'REM',   dur:'2h 08m', pct:34, color:'#9B6EFF', y:304},
  ];

  const els = [
    rect(0,0,390,868,BG),
    ...statusBar(),
    txt(20,52,200,14,'SLEEP STAGES',9,'600',ACCENT,{ls:3}),
    txt(20,68,350,24,'Mar 27 — 11:08pm → 7:16am',16,'400',TEXT,{op:0.55}),

    // Total sleep big number
    txt(20,100,200,54,'7h 32m', 46,'800',TEXT),
    txt(20,156,200,16,'total sleep duration',12,'400',MUTED),

    line(20,182,350,TEXT,0.06),

    // Stage timeline
    txt(20,196,200,12,'BREAKDOWN',8,'600',MUTED,{ls:2}),
    ...stages.flatMap((s,i) => {
      const barW = Math.round(s.pct * 3.1);
      return [
        txt(20, 218+i*52, 80, 14, s.label, 12, '500', s.color),
        txt(20, 234+i*52, 80, 12, s.dur, 10, '400', MUTED),
        rect(110, 222+i*52, 220, 8, DIM, {r:4}),
        rect(110, 222+i*52, barW, 8, s.color, {r:4, opacity:0.85}),
        txt(338, 218+i*52, 36, 14, s.pct+'%', 11, '600', s.color, {align:'right'}),
      ];
    }),

    line(20,436,350,TEXT,0.06),

    // Timeline visualization — sleep hypnogram simplified
    txt(20,450,300,12,'HYPNOGRAM',8,'600',MUTED,{ls:2}),
    // Time axis
    ...['11pm','1am','3am','5am','7am'].map((t,i) =>
      txt(18+i*78, 510, 60, 10, t, 8, '400', MUTED, {op:0.5})
    ),
    // Hypnogram line segments (simulated stages)
    rect(20, 466, 30, 3, MUTED, {r:1, opacity:0.4}),  // short awake
    rect(52, 478, 60, 3, ACCENT2, {r:1, opacity:0.7}), // light 1
    rect(114, 492, 45, 3, ACCENT, {r:1, opacity:0.9}), // deep 1
    rect(161, 486, 30, 3, '#9B6EFF', {r:1, opacity:0.8}), // rem 1
    rect(193, 480, 40, 3, ACCENT2, {r:1, opacity:0.6}), // light 2
    rect(235, 494, 40, 3, ACCENT, {r:1, opacity:0.9}), // deep 2
    rect(277, 487, 45, 3, '#9B6EFF', {r:1, opacity:0.8}), // rem 2
    rect(324, 470, 24, 3, MUTED, {r:1, opacity:0.3}), // wake-up

    line(20,528,350,TEXT,0.06),

    // Sleep onset / efficiency
    rect(16, 540, 172, 70, SURFACE, {r:14}),
    txt(28, 554, 140, 12, 'SLEEP ONSET', 8, '600', MUTED, {ls:2}),
    txt(28, 570, 120, 28, '12 min', 22, '700', TEXT),
    txt(28, 598, 120, 12, '↑ faster than avg', 9, '500', ACCENT),

    rect(202, 540, 172, 70, SURFACE, {r:14}),
    txt(214, 554, 140, 12, 'EFFICIENCY', 8, '600', MUTED, {ls:2}),
    txt(214, 570, 120, 28, '93%', 22, '700', TEXT),
    txt(214, 598, 120, 12, '→ excellent', 9, '500', ACCENT),

    // Consistency note
    rect(16, 624, 358, 52, SURFACE, {r:14}),
    txt(28, 636, 20, 16, '⌘', 12, '400', ACCENT2),
    txt(52, 636, 290, 14, 'Sleep consistency score: 84/100', 11, '600', TEXT),
    txt(52, 652, 290, 14, 'Bedtime varies by only ±18 min this week', 10, '400', MUTED),

    ...navBar(1),
  ];
  return { id:'stages', name:'Stages', backgroundColor:BG, statusBarStyle:'light', elements:els };
}

// ─── SCREEN 3: TRENDS ───────────────────────────────────────────────────────
function trendsScreen() {
  const weeks = [
    {w:'Jan',s:76},{w:'Feb',s:81},{w:'Mar',s:85},
  ];
  const daily = [78,82,71,88,84,90,87,79,83,86,88,85,87,91,87];
  const maxS = Math.max(...daily);

  const els = [
    rect(0,0,390,868,BG),
    ...statusBar(),
    txt(20,52,200,14,'TRENDS',9,'600',ACCENT,{ls:3}),
    txt(20,68,350,24,'30-day sleep analysis',16,'400',TEXT,{op:0.55}),

    // Avg score big number — bold display type ala Muradov
    txt(20,100,180,54,'85.2', 46,'800',TEXT),
    txt(204,130,80,22,'avg', 14,'400',MUTED),
    txt(20,156,250,16,'↑ +4.1 pts vs last month — improving',11,'400',ACCENT),

    line(20,178,350,TEXT,0.06),

    // 15-day chart
    txt(20,190,300,12,'DAILY SCORES — LAST 15 NIGHTS',8,'600',MUTED,{ls:2}),
    rect(20,208,350,80,SURFACE,{r:12}),
    // chart bars
    ...daily.map((s,i) => {
      const bh = Math.round((s/100)*56);
      const x = 30 + i*22;
      const isLast = i === daily.length-1;
      return rect(x, 208+80-8-bh, 14, bh, isLast?ACCENT:ACCENT2, {r:3, opacity:isLast?1:0.45});
    }),
    // value labels for extremes
    txt(30+daily.indexOf(maxS)*22, 208+80-8-Math.round((maxS/100)*56)-14, 14, 12, String(maxS), 8, '700', ACCENT, {align:'center'}),

    line(20,300,350,TEXT,0.06),

    // Monthly summary cards
    txt(20,314,300,12,'MONTHLY AVERAGES',8,'600',MUTED,{ls:2}),
    ...weeks.flatMap(({w,s},i) => [
      rect(16+i*124, 330, 116, 72, SURFACE, {r:14}),
      txt(28+i*124, 344, 90, 12, w.toUpperCase(), 8,'600',MUTED,{ls:2}),
      txt(28+i*124, 360, 90, 32, String(s), 26,'800',i===weeks.length-1?ACCENT:TEXT),
      txt(28+i*124, 392, 90, 12, i===0?'baseline':i===1?'↑ +5':' ↑ +4', 9,'500',
        i===0?MUTED:ACCENT),
    ]),

    line(20,416,350,TEXT,0.06),

    // Pattern insights
    txt(20,430,300,12,'PATTERN INSIGHTS',8,'600',MUTED,{ls:2}),
    ...[
      {icon:'◎', text:'Best sleep: Sun & Wed nights consistently', accent:ACCENT},
      {icon:'⌇', text:'Deep sleep peaked at 2h 04m — top 10%', accent:'#9B6EFF'},
      {icon:'♡', text:'HRV trending up — recovery improving', accent:ACCENT},
    ].flatMap(({icon,text,accent},i) => [
      rect(16, 450+i*58, 358, 48, SURFACE, {r:12}),
      txt(28, 462+i*58, 20, 24, icon, 14,'400',accent),
      txt(52, 462+i*58, 290, 24, text, 11,'400',TEXT,{op:0.85}),
    ]),

    // Sleep debt indicator
    rect(16, 626, 358, 58, DIM, {r:16}),
    txt(28,638,20,16,'⚡',12,'400',AMBER),
    txt(52,638,260,14,'Sleep debt this week: 38 min',11,'600',TEXT),
    txt(52,654,260,14,'Recover with an extra 19 min on weekends',10,'400',MUTED),

    ...navBar(2),
  ];
  return { id:'trends', name:'Trends', backgroundColor:BG, statusBarStyle:'light', elements:els };
}

// ─── SCREEN 4: RECOVERY ─────────────────────────────────────────────────────
function recoveryScreen() {
  const metrics = [
    {label:'HRV', value:'58ms', sub:'↑ +4 vs 30-day avg', accent:ACCENT, pct:72},
    {label:'Resting HR', value:'52 bpm', sub:'↓ lower = better', accent:'#9B6EFF', pct:88},
    {label:'Body Temp', value:'+0.1°', sub:'→ baseline range', accent:AMBER, pct:50},
    {label:'SpO₂', value:'97%', sub:'→ normal', accent:ACCENT, pct:97},
  ];

  const els = [
    rect(0,0,390,868,BG),
    ...statusBar(),
    txt(20,52,200,14,'RECOVERY',9,'600',ACCENT,{ls:3}),
    txt(20,68,350,24,'Readiness for today',16,'400',TEXT,{op:0.55}),

    // Big readiness score — inspired by Cecilia's centered bold type
    txt(20,100,350,72,'82', 72,'800',TEXT),
    txt(20,172,200,20,'readiness score',14,'400',MUTED),
    ...pill(20,196,100,24,SURFACE,'READY TO TRAIN',ACCENT,8),

    line(20,232,350,TEXT,0.06),

    // Metrics grid
    txt(20,244,300,12,'BIOMETRIC SIGNALS',8,'600',MUTED,{ls:2}),
    ...metrics.flatMap(({label,value,sub,accent,pct},i) => {
      const row = Math.floor(i/2);
      const col = i%2;
      const x = col===0 ? 16 : 204;
      const y = 262 + row*96;
      return [
        rect(x, y, 172, 82, SURFACE, {r:14}),
        txt(x+12, y+12, 148, 12, label.toUpperCase(), 8,'600',MUTED,{ls:2}),
        txt(x+12, y+28, 148, 28, value, 20,'700',TEXT),
        txt(x+12, y+56, 148, 12, sub, 9,'500',accent),
        // mini bar
        rect(x+12, y+70, 130, 3, DIM, {r:2}),
        rect(x+12, y+70, Math.round(130*(pct/100)), 3, accent, {r:2, opacity:0.8}),
      ];
    }),

    line(20,462,350,TEXT,0.06),

    // Recommendations
    txt(20,476,300,12,'RECOVERY ACTIONS',8,'600',MUTED,{ls:2}),
    ...[
      {icon:'◎', title:'Hydrate early', desc:'Drink 500ml within 30min of waking', ok:true},
      {icon:'⌇', title:'Light movement', desc:'20-min walk boosts HRV today', ok:true},
      {icon:'✦', title:'Limit caffeine', desc:'Delay first coffee until 10am', ok:false},
    ].flatMap(({icon,title,desc,ok},i) => [
      rect(16, 496+i*68, 358, 58, SURFACE, {r:14}),
      txt(28, 508+i*68, 20, 16, icon, 14,'400', ok?ACCENT:AMBER),
      txt(52, 506+i*68, 240, 14, title, 12,'600',TEXT),
      txt(52, 522+i*68, 260, 14, desc, 10,'400',MUTED),
      ...pill(308, 508+i*68, ok?36:44, 22, ok?ACCENT+'22':AMBER+'22', ok?'✓ Do':'⚠ Note', ok?ACCENT:AMBER, 8),
    ]),

    ...navBar(3),
  ];
  return { id:'recovery', name:'Recovery', backgroundColor:BG, statusBarStyle:'light', elements:els };
}

// ─── SCREEN 5: SLEEP COACH ──────────────────────────────────────────────────
function coachScreen() {
  const steps = [
    {icon:'◎', time:'9:30pm', action:'Dim all lights to warm tones', done:true},
    {icon:'⌘', time:'9:45pm', action:'End screen use — put phone down', done:true},
    {icon:'♡', time:'10:00pm', action:'4-7-8 breathing exercise (3 min)', done:false, active:true},
    {icon:'⌇', time:'10:15pm', action:'Room temp: set to 18–19°C', done:false},
    {icon:'◈', time:'10:30pm', action:'Lights off — target sleep onset', done:false},
  ];

  const els = [
    rect(0,0,390,868,BG),
    ...statusBar(),
    txt(20,52,200,14,'SLEEP COACH',9,'600',ACCENT,{ls:3}),
    txt(20,68,350,24,'Wind-down protocol',16,'400',TEXT,{op:0.55}),

    // Countdown — big bold display type like Muradov's massive headline
    txt(20,100,350,28,'Bedtime in',20,'400',MUTED),
    txt(20,128,350,64,'1h 28m',56,'800',TEXT),

    // Target bedtime pill
    ...pill(20,200,140,28,SURFACE,'⌘ 10:30pm target',TEXT,10),
    ...pill(170,200,130,28,ACCENT+'22','✦ 87 last night',ACCENT,10),

    line(20,240,350,TEXT,0.06),

    txt(20,254,300,12,'TONIGHT\'S PROTOCOL',8,'600',MUTED,{ls:2}),
    ...steps.flatMap(({icon,time,action,done,active},i) => {
      const y = 274+i*72;
      const bg = active ? SURFACE2 : done ? BG : SURFACE;
      const border = active ? ACCENT : 'transparent';
      return [
        rect(16, y, 358, 60, bg, {r:14}),
        active ? rect(16, y, 4, 60, ACCENT, {r:2}) : rect(0,0,0,0,'transparent'),
        txt(28, y+10, 140, 12, time, 9,'600', active?ACCENT:MUTED, {ls:1}),
        txt(28, y+26, 290, 18, action, 12, active?'600':'400', active?TEXT:done?MUTED:TEXT,
          {op:done?0.5:1}),
        done ? txt(340, y+18, 20, 24, '✓', 14,'700',ACCENT, {align:'right', op:0.8}) : rect(0,0,0,0,'transparent'),
        active ? txt(340, y+18, 20, 24, '▶', 12,'600',ACCENT, {align:'right'}) : rect(0,0,0,0,'transparent'),
      ];
    }),

    line(20,646,350,TEXT,0.06),

    // Breathing exercise CTA
    rect(16,658,358,72,SURFACE,{r:18}),
    txt(28,670,20,24,'♡',16,'400',ACCENT),
    txt(52,668,240,14,'4-7-8 Breathing',12,'600',TEXT),
    txt(52,684,240,14,'Start 3-min guided breathing session',10,'400',MUTED),
    ...pill(270,670,84,30,ACCENT,'Start →',BG,11),

    ...navBar(4),
  ];
  return { id:'coach', name:'Coach', backgroundColor:BG, statusBarStyle:'light', elements:els };
}

// ─── ASSEMBLE PEN ────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'MARE',
  description: 'Sleep Intelligence Platform — dark theme, bioluminescent green accent, ultra-bold display typography inspired by darkmodedesign.com (Cecilia + Muradov)',
  settings: {
    fontFamily: 'Inter',
    fontSize: 14,
    deviceFrame: 'iphone15pro',
  },
  screens: [
    scoreScreen(),
    stagesScreen(),
    trendsScreen(),
    recoveryScreen(),
    coachScreen(),
  ],
};

fs.writeFileSync('mare.pen', JSON.stringify(pen, null, 2));
console.log('✓ mare.pen written —', pen.screens.length, 'screens,',
  pen.screens.reduce((a,s)=>a+s.elements.length,0), 'elements total');
