// PYRE — Brand Analytics Intelligence
// Inspired by: Format Podcasts (DarkModeDesign.com) — warm amber photography
// on near-black #0E0202 with light-weight serif headlines at 72px.
// Also: Cardless asymmetric layouts, Neon's electric signal aesthetic.
// Theme: DARK — cinematic editorial warm-black + ember amber
// 6 screens: Pulse, Signals, Creative, Channels, Insights, Report

const fs = require('fs');

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:      '#080204',   // deep warm near-black (Format Podcasts #0E0202 style)
  surf:    '#130A0E',   // slightly lifted dark surface
  surf2:   '#1C1016',   // mid-dark card
  amber:   '#D4871C',   // ember amber
  amber2:  '#E8A030',   // lighter amber highlight
  copper:  '#7B4A2A',   // burnt copper
  red:     '#E84B3A',   // alert red
  green:   '#2DB882',   // positive green
  text:    '#F0E6D3',   // warm off-white (like aged paper)
  sub:     '#A08070',   // warm muted brown-grey
  dim:     '#5A4A42',   // very dim warm text
  white:   '#FFFFFF',
};

let idCounter = 0;
const newId = () => `p${++idCounter}`;

// ─── Layer helpers ─────────────────────────────────────────────────────────────
const rect   = (x,y,w,h,fill,cr=0,stroke=0,strokeColor='transparent') =>
  ({ id:newId(), type:'rectangle', x,y,width:w,height:h,fill,cornerRadius:cr,strokeWidth:stroke,strokeColor });
const text   = (x,y,w,h,content,fontSize,fontWeight,color,align='left',italic=false) =>
  ({ id:newId(), type:'text', x,y,width:w,height:h,content,fontSize,fontWeight,color,textAlign:align,strokeWidth:0 });
const ellipse= (x,y,w,h,fill,stroke=0,strokeColor='transparent') =>
  ({ id:newId(), type:'ellipse', x,y,width:w,height:h,fill,strokeColor,strokeWidth:stroke });
const line   = (x1,y1,x2,y2,strokeColor,strokeWidth=1) => ({
  id:newId(), type:'line', x:x1,y:y1,
  width:Math.abs(x2-x1)||1, height:Math.abs(y2-y1)||1,
  strokeColor, strokeWidth, fill:'transparent',
  points:[{x:0,y:0},{x:x2-x1,y:y2-y1}]
});

// Status bar
const statusBar = (textColor) => [
  text(20,14, 80,16, '9:41', 12,600,textColor,'left'),
  text(310,14, 70,16, '●●● ▲',10,400,textColor,'right'),
];

// Bottom nav helper
const bottomNav = (active) => {
  const items = [
    { label:'Pulse',    icon:'◉' },
    { label:'Signals',  icon:'◎' },
    { label:'Creative', icon:'▦' },
    { label:'Channels', icon:'≋' },
    { label:'Insights', icon:'✦' },
  ];
  const navBg = rect(0,784,390,60,C.surf,0);
  const divider = rect(0,784,390,1,C.dim,0);
  const layers = [navBg,divider];
  const slotW = 78;
  items.forEach((item,i) => {
    const cx = i*slotW + slotW/2;
    const isActive = item.label === active;
    const col = isActive ? C.amber : C.dim;
    layers.push(text(cx-30,793, 60,18, item.icon, 14, isActive?600:400, col, 'center'));
    layers.push(text(cx-30,812, 60,12, item.label.toUpperCase(), 7, isActive?700:400, col, 'center'));
    if (isActive) {
      layers.push(rect(cx-12,782,24,2,C.amber,1));
    }
  });
  return layers;
};

// ─── Screen 1: PULSE ──────────────────────────────────────────────────────────
const screen1 = {
  id: newId(), name:'Pulse', width:390, height:844, backgroundColor:C.bg,
  children: [
    ...statusBar(C.sub),

    // App wordmark — light editorial serif feel
    text(20,40, 120,42, 'PYRE', 32,200,C.text,'left'),
    text(20,82, 200,14, 'BRAND INTELLIGENCE', 8,600,C.amber,'left'),

    // Notification + settings
    text(345,50, 30,30,'🔔',16,400,C.sub,'center'),

    // Divider
    rect(20,100, 350,0.5, C.dim,0),

    // Hero metric: Brand Health Score — large circular focal point
    ellipse(95,130, 200,200, 'transparent',2,C.copper),
    ellipse(105,140, 180,180, 'transparent',1.5,`${C.amber}40`),
    // Inner glow ring
    ellipse(118,153, 154,154, `${C.amber}12`,0),
    // Score
    text(130,188, 130,60, '87', 56,200,C.amber,'center'),
    text(140,248, 110,14, 'BRAND HEALTH', 7,700,C.sub,'center'),
    text(148,264, 94,12, '↑ 4 pts this week', 8,400,C.green,'center'),

    // 3 metric pills below circle
    // Reach pill
    rect(16,350, 110,52, C.surf,8),
    text(24,358, 94,12, 'REACH', 7,600,C.sub,'left'),
    text(24,372, 60,22, '12.4M', 16,300,C.text,'left'),
    text(82,380, 40,14, '↑12%', 9,600,C.green,'left'),

    // Sentiment pill
    rect(140,350, 110,52, C.surf,8),
    text(148,358, 94,12, 'SENTIMENT', 7,600,C.sub,'left'),
    text(148,372, 60,22, '8.3', 16,300,C.text,'left'),
    text(206,380, 40,14, '↑8%', 9,600,C.green,'left'),

    // Velocity pill
    rect(264,350, 110,52, C.surf,8),
    text(272,358, 94,12, 'VELOCITY', 7,600,C.sub,'left'),
    text(272,372, 60,22, '×3.1', 16,300,C.text,'left'),
    text(322,380, 40,14, '↑31%', 9,600,C.amber,'left'),

    // Section: Weekly Signals
    text(20,420, 200,14, 'WEEKLY SIGNALS', 8,700,C.sub,'left'),
    text(300,420, 80,14, 'See all →', 8,400,C.amber,'right'),

    // Signal item 1
    rect(20,440, 350,58, C.surf,8),
    rect(20,440, 4,58,  C.amber,2),   // amber left border
    text(34,449, 240,14, 'The Origin Story — Video Drop', 11,400,C.text,'left'),
    text(34,465, 140,12, 'instagram · tiktok · youtube', 8,400,C.sub,'left'),
    text(34,479, 60,12, '2.4M reach', 8,600,C.amber,'left'),
    text(300,459, 62,14, '+184%', 11,600,C.green,'right'),

    // Signal item 2
    rect(20,504, 350,58, C.surf,8),
    rect(20,504, 4,58,  C.copper,2),
    text(34,513, 240,14, 'Founder Q&A — Live Replay', 11,400,C.text,'left'),
    text(34,529, 140,12, 'youtube · x.com', 8,400,C.sub,'left'),
    text(34,543, 60,12, '847K reach', 8,600,C.sub,'left'),
    text(300,523, 62,14, '+62%', 11,600,C.green,'right'),

    // Signal item 3
    rect(20,568, 350,58, C.surf,8),
    rect(20,568, 4,58,  C.dim,2),
    text(34,577, 240,14, 'Product Comparison — Carousel', 11,400,C.text,'left'),
    text(34,593, 140,12, 'instagram', 8,400,C.sub,'left'),
    text(34,607, 60,12, '312K reach', 8,600,C.sub,'left'),
    text(300,587, 62,14, '−3%', 11,600,C.red,'right'),

    // AI insight banner
    rect(20,638, 350,50, `${C.amber}18`,10),
    rect(20,638, 350,1, C.amber,0),
    text(32,648, 18,18, '✦', 13,400,C.amber,'left'),
    text(54,651, 298,14, 'Product reveal format outperforming\nstandard content by 3.2× this week', 9,400,C.text,'left'),

    // Ticker strip at bottom (just above nav)
    rect(0,760, 390,24, `${C.amber}15`,0),
    text(20,766, 900,14, 'REACH ↑12%  ·  SAVES ↑44%  ·  COMMENTS ↑28%  ·  SHARES ↑19%  ·  IMPRESSIONS ↑31%', 7,600,C.amber,'left'),

    ...bottomNav('Pulse'),
  ]
};

// ─── Screen 2: SIGNALS ────────────────────────────────────────────────────────
const screen2 = {
  id:newId(), name:'Signals', width:390, height:844, backgroundColor:C.bg,
  children:[
    ...statusBar(C.sub),

    text(20,40, 280,42, 'What\'s\nResonating', 26,200,C.text,'left'),
    text(330,50, 44,32, '↻', 22,300,C.sub,'center'),

    rect(20,96, 350,0.5, C.dim,0),

    // Top-performing asset hero card
    rect(20,110, 350,160, C.surf2,10),
    rect(20,110, 350,160, `${C.amber}08`,10), // subtle amber tint
    // Amber top border accent
    rect(20,110, 350,3, C.amber,0),
    text(32,120, 60,10, 'VIDEO · #1', 7,700,C.amber,'left'),
    text(32,134, 290,20, 'The Origin Story', 17,300,C.text,'left'),
    text(32,156, 200,12, 'Full-brand reveal drop — Apr 1', 9,400,C.sub,'left'),

    // Sparkline / engagement wave (abstract lines)
    ...Array.from({length:18},(_,i)=>{
      const x = 32 + i*17;
      const heights = [8,14,10,22,18,12,30,44,38,52,46,38,56,62,48,54,60,58];
      const h = heights[i];
      const col = h > 40 ? C.amber : `${C.amber}60`;
      return rect(x,238-h, 10,h, col,2);
    }),

    text(32,248, 120,12, '2.4M reach', 9,600,C.text,'left'),
    text(280,248, 82,12, '↑ 184% avg', 9,600,C.green,'right'),

    // Section header
    text(20,284, 200,14, 'TOP PERFORMERS', 8,700,C.sub,'left'),
    text(290,284, 80,14, 'This week', 8,400,C.dim,'right'),

    // Performer rows
    ...[
      {rank:'01', title:'Founder Q&A Live', type:'VIDEO', reach:'847K', delta:'+62%', col:C.green, y:304},
      {rank:'02', title:'Behind the Build', type:'STORY', reach:'612K', delta:'+45%', col:C.green, y:364},
      {rank:'03', title:'Process Timelapse', type:'REEL', reach:'389K', delta:'+28%', col:C.amber, y:424},
      {rank:'04', title:'Community Spotlight', type:'CAROUSEL', reach:'241K', delta:'+11%', col:C.sub, y:484},
    ].flatMap(p=>[
      rect(20,p.y, 350,54, C.surf,8),
      text(32,p.y+8, 28,16, p.rank, 12,200,C.amber,'left'),
      text(66,p.y+8, 190,16, p.title, 11,400,C.text,'left'),
      text(66,p.y+26, 60,12, p.type, 7,700,C.copper,'left'),
      text(260,p.y+8, 60,14, p.reach, 11,300,C.text,'right'),
      text(260,p.y+26, 60,12, p.delta, 9,600,p.col,'right'),
      // mini bar
      rect(32,p.y+46,318,2,C.dim,0),
      rect(32,p.y+46,Math.round(318*(0.9-[0,0.2,0.35,0.55][
        [{rank:'01'},{rank:'02'},{rank:'03'},{rank:'04'}].findIndex(x=>x.rank===p.rank)
      ])),2,C.amber,0),
    ]),

    // Drop-off note
    rect(20,550, 350,36, `${C.red}15`,8),
    text(32,558, 320,16, '⚠  Product Comparison carousel saw –3% — review format', 8,400,`${C.red}CC`,'left'),

    // Insight CTA
    rect(20,600, 350,60, C.surf,10),
    rect(20,600, 4,60, C.amber,2),
    text(34,609, 300,14, '✦  AI WEEKLY INSIGHT', 8,700,C.amber,'left'),
    text(34,625, 308,28, 'Short-form product reveals under 60s\nare your highest-converting format this month.', 8,400,C.text,'left'),

    ...bottomNav('Signals'),
  ]
};

// ─── Screen 3: CREATIVE ───────────────────────────────────────────────────────
const screen3 = {
  id:newId(), name:'Creative', width:390, height:844, backgroundColor:C.bg,
  children:[
    ...statusBar(C.sub),

    text(20,40, 200,20, 'CREATIVE', 14,200,C.text,'left'),
    text(20,62, 200,14, 'Asset Performance', 9,400,C.sub,'left'),

    // Filter row
    ...['All','Video','Story','Carousel','Reel'].map((label,i)=>{
      const isActive = i===0;
      const w = [28,44,36,62,28][i];
      const x = [20,56,108,152,222][i];
      return [
        rect(x,86, w+16,22, isActive?C.amber:C.surf,11),
        text(x+4,90, w+8,14, label, 8, isActive?700:400, isActive?C.bg:C.sub,'center'),
      ];
    }).flat(),

    rect(20,116, 350,0.5, C.dim,0),

    // 2×3 asset grid
    ...[
      {x:20,  y:126, fill:`${C.amber}30`, type:'VIDEO',    title:'Origin Story',   views:'2.4M',ctr:'8.2%',saves:'44K',  top:true},
      {x:202, y:126, fill:`${C.copper}40`,type:'STORY',    title:'Founder Q&A',    views:'847K',ctr:'6.1%',saves:'18K',  top:false},
      {x:20,  y:280, fill:`${C.amber}20`, type:'REEL',     title:'Build Process',  views:'612K',ctr:'5.4%',saves:'12K',  top:false},
      {x:202, y:280, fill:`${C.amber}15`, type:'CAROUSEL', title:'Product Compare', views:'389K',ctr:'3.8%',saves:'6K',  top:false},
      {x:20,  y:434, fill:'#1A1016',      type:'LIVE',     title:'Community AMA',  views:'241K',ctr:'4.2%',saves:'9K',  top:false},
      {x:202, y:434, fill:'#0F0A14',      type:'REEL',     title:'BTS Timelapse',  views:'182K',ctr:'2.9%',saves:'4K',  top:false},
    ].flatMap(c=>[
      rect(c.x,c.y, 168,148, c.fill,10),
      c.top ? rect(c.x,c.y, 168,2, C.amber,0) : null,
      // Type badge
      rect(c.x+8,c.y+8, 48,14, `${C.bg}CC`,5),
      text(c.x+12,c.y+10, 44,12, c.type, 6,700,C.amber,'left'),
      // Title
      text(c.x+8,c.y+84, 152,24, c.title, 10,300,C.text,'left'),
      // Stats row
      text(c.x+8,c.y+112, 60,12, c.views, 8,600,C.text,'left'),
      text(c.x+8,c.y+126, 60,10, 'views', 7,400,C.sub,'left'),
      text(c.x+64,c.y+112, 50,12, c.ctr, 8,600,C.text,'left'),
      text(c.x+64,c.y+126, 50,10, 'CTR', 7,400,C.sub,'left'),
      text(c.x+116,c.y+112, 44,12, c.saves, 8,600,c.top?C.amber:C.text,'left'),
      text(c.x+116,c.y+126, 44,10, 'saves', 7,400,C.sub,'left'),
    ].filter(Boolean)),

    // Upload FAB
    ellipse(330,608, 48,48, C.amber,0),
    text(330,616, 48,30, '+', 24,200,C.bg,'center'),

    // Insight bar
    rect(20,668, 350,50, `${C.amber}18`,10),
    text(32,678, 310,28, '✦  Video content generates 4.1× more saves\nthan carousel posts this quarter.', 8,400,C.text,'left'),

    ...bottomNav('Creative'),
  ]
};

// ─── Screen 4: CHANNELS ───────────────────────────────────────────────────────
const screen4 = {
  id:newId(), name:'Channels', width:390, height:844, backgroundColor:C.bg,
  children:[
    ...statusBar(C.sub),

    text(20,40, 200,14, 'CHANNELS', 8,700,C.sub,'left'),
    text(20,56, 250,42, 'Platform\nBreakdown', 28,200,C.text,'left'),

    // Asymmetric large stat — total reach (inspired by Cardless's left-half focus)
    text(20,106, 220,54, '4.8M', 48,200,C.amber,'left'),
    text(20,158, 220,14, 'TOTAL REACH · THIS WEEK', 8,600,C.sub,'left'),
    text(20,174, 220,14, '↑ 18% vs last week', 9,400,C.green,'left'),
    // Right column contrast
    text(240,118, 130,18, '31 assets', 12,300,C.text,'right'),
    text(240,138, 130,14, 'published', 8,400,C.sub,'right'),
    text(240,158, 130,18, '6 platforms', 12,300,C.text,'right'),
    text(240,178, 130,14, 'active', 8,400,C.sub,'right'),

    rect(20,198, 350,0.5, C.dim,0),

    // Platform breakdown bars
    ...[
      {label:'Instagram', sub:'IG Stories + Reels', reach:'1.9M', pct:0.79, icon:'▨'},
      {label:'TikTok',    sub:'Short-form video',   reach:'1.4M', pct:0.58, icon:'▩'},
      {label:'YouTube',   sub:'Shorts + Long-form', reach:'892K', pct:0.37, icon:'▦'},
      {label:'X',         sub:'Posts + Threads',    reach:'541K', pct:0.23, icon:'✕'},
    ].flatMap((p,i)=>{
      const y = 218 + i*100;
      const barW = Math.round(350 * p.pct);
      return [
        text(20,y+4, 24,20, p.icon, 14,400,C.amber,'left'),
        text(48,y+2, 200,16, p.label, 12,300,C.text,'left'),
        text(48,y+20, 200,12, p.sub, 8,400,C.sub,'left'),
        text(300,y+2, 62,16, p.reach, 12,300,C.text,'right'),
        // bar track
        rect(48,y+38, 302,6, C.surf2,3),
        // bar fill
        rect(48,y+38, barW,6, i===0?C.amber:i===1?C.amber2:`${C.amber}80`,3),
        // separator
        i<3 ? rect(20,y+54,350,0.5,C.dim,0) : null,
      ].filter(Boolean);
    }),

    // Audience overlap Venn-style
    text(20,628, 200,14, 'CROSS-PLATFORM OVERLAP', 8,700,C.sub,'left'),
    ellipse(90,652, 100,60, `${C.amber}20`,1.5,C.amber),
    ellipse(140,652, 100,60, `${C.copper}20`,1.5,C.copper),
    ellipse(190,652, 100,60, `${C.amber}15`,1,`${C.amber}60`),
    text(98,673, 84,14, '28%', 11,300,C.text,'center'),
    text(148,673, 84,14, '17%', 11,300,C.text,'center'),
    text(198,673, 84,14, '9%', 11,300,C.text,'center'),
    text(82,722, 100,12, 'IG × TT', 8,400,C.sub,'center'),
    text(182,722, 100,12, 'TT × YT', 8,400,C.sub,'center'),

    ...bottomNav('Channels'),
  ]
};

// ─── Screen 5: INSIGHTS ───────────────────────────────────────────────────────
const screen5 = {
  id:newId(), name:'Insights', width:390, height:844, backgroundColor:C.bg,
  children:[
    ...statusBar(C.sub),

    text(20,40, 280,20, 'AI INSIGHTS', 14,200,C.text,'left'),
    text(20,62, 300,14, '3 key observations · Week 13', 9,400,C.sub,'left'),
    text(330,44, 44,32, '✦', 18,300,C.amber,'center'),

    rect(20,84, 350,0.5, C.dim,0),

    // Insight cards
    ...[
      {
        y:96, border:C.amber,
        label:'FORMAT INSIGHT', icon:'▶',
        title:'Short-form video is your breakout format',
        body:'Videos under 60s are generating 4.1× the engagement rate of your next-best format. Your audience\'s completion rate (78%) is 2.3× the platform average.',
        action:'View format analysis →',
      },
      {
        y:248, border:C.green,
        label:'AUDIENCE INSIGHT', icon:'◎',
        title:'New audience cohort emerging in 25–34 age group',
        body:'Follower acquisition up 44% in this segment since Mar 15. Driven by your founder-led narrative content — 3 posts, 112K new follows.',
        action:'Explore audience →',
      },
      {
        y:400, border:C.copper,
        label:'TIMING INSIGHT', icon:'◷',
        title:'Tuesday 7–9pm outperforms all other windows',
        body:'Posts published in this window average 3.2× more reach. Your current schedule hits this window only 18% of the time — significant opportunity.',
        action:'Adjust schedule →',
      },
    ].flatMap(c=>[
      rect(20,c.y, 350,140, C.surf,8),
      rect(20,c.y, 4,140, c.border,2),
      text(34,c.y+10, 220,12, c.icon+'  '+c.label, 7,700,c.border,'left'),
      text(34,c.y+26, 308,28, c.title, 11,300,C.text,'left'),
      text(34,c.y+58, 308,56, c.body, 8,400,C.sub,'left'),
      text(34,c.y+122, 200,14, c.action, 8,600,c.border,'left'),
    ]),

    // Recommended action card
    rect(20,554, 350,68, `${C.amber}20`,10),
    rect(20,554, 350,2, C.amber,0),
    text(32,563, 300,14, 'RECOMMENDED ACTION', 7,700,C.amber,'left'),
    text(32,579, 308,28, 'Shift 3 of your weekly posts to Tue 7–9pm\nformat window for projected +68% reach lift.', 9,400,C.text,'left'),
    text(32,613, 120,14, 'Apply to schedule', 9,600,C.amber,'left'),
    text(260,613, 100,14, 'Dismiss', 9,400,C.dim,'right'),

    // Confidence indicator
    text(20,636, 200,14, 'MODEL CONFIDENCE', 7,600,C.dim,'left'),
    rect(20,652, 280,4, C.surf2,2),
    rect(20,652, 238,4, C.amber,2),
    text(310,648, 60,12, '85%', 9,600,C.amber,'right'),

    ...bottomNav('Insights'),
  ]
};

// ─── Screen 6: REPORT ─────────────────────────────────────────────────────────
const screen6 = {
  id:newId(), name:'Report', width:390, height:844, backgroundColor:C.bg,
  children:[
    ...statusBar(C.sub),

    text(20,40, 250,14, 'WEEK 13 REPORT', 10,700,C.amber,'left'),
    text(20,56, 280,16, 'Apr 1 – Apr 7, 2026', 22,200,C.text,'left'),
    text(20,80, 250,14, 'Generated by PYRE AI', 8,400,C.sub,'left'),

    rect(20,98, 350,0.5, C.dim,0),

    // Summary stat row
    ...[
      {label:'TOTAL REACH', value:'4.8M', delta:'↑18%', col:C.green, x:20},
      {label:'NEW FOLLOWERS', value:'28.4K', delta:'↑44%', col:C.green, x:150},
      {label:'BRAND SCORE', value:'87', delta:'↑4pts', col:C.amber, x:278},
    ].flatMap(s=>[
      rect(s.x,108, 118,60, C.surf,8),
      text(s.x+8,116, 102,10, s.label, 6,700,C.sub,'left'),
      text(s.x+8,128, 70,20, s.value, 15,300,C.text,'left'),
      text(s.x+8,150, 70,14, s.delta, 8,600,s.col,'left'),
    ]),

    // AI summary
    text(20,184, 200,14, 'AI SUMMARY', 8,700,C.sub,'left'),
    rect(20,200, 350,140, C.surf,8),
    rect(20,200, 4,140, C.amber,2),
    text(32,210, 320,118, 'Week 13 marks your strongest organic performance on record. The Origin Story video drove outsized reach — 2.4M in 5 days — largely due to format novelty and optimal Tuesday 7pm publish timing.\n\nMomentum is building in the 25–34 audience segment. Recommend doubling down on founder-led video content in the next 2 weeks while this format window is open.', 8,400,C.sub,'left'),

    // Performance chart header
    text(20,356, 200,14, 'DAILY REACH', 8,700,C.sub,'left'),
    // Simple bar chart — Mon-Sun
    ...['M','T','W','T','F','S','S'].map((d,i)=>{
      const vals = [0.28,0.62,0.44,0.85,1.0,0.72,0.91];
      const h = Math.round(vals[i]*80);
      const x = 20 + i*50;
      return [
        rect(x,450-h, 32,h, i===4?C.amber:`${C.amber}60`,2),
        text(x,454, 32,10, d, 7,400,C.dim,'center'),
      ];
    }).flat(),

    // Top assets mini table
    text(20,476, 200,14, 'TOP 3 ASSETS', 8,700,C.sub,'left'),
    ...[
      {title:'The Origin Story', type:'VIDEO', reach:'2.4M', y:492},
      {title:'Founder Q&A Live', type:'VIDEO', reach:'847K', y:520},
      {title:'Behind the Build', type:'STORY', reach:'612K', y:548},
    ].flatMap(a=>[
      rect(20,a.y, 350,22, C.surf,4),
      text(28,a.y+5, 200,14, a.title, 9,300,C.text,'left'),
      text(230,a.y+5, 60,14, a.type, 7,600,C.copper,'right'),
      text(300,a.y+5, 62,14, a.reach, 9,300,C.amber,'right'),
    ]),

    // Export buttons
    rect(20,586, 168,48, C.amber,10),
    text(20,600, 168,20, 'SHARE LINK', 10,600,C.bg,'center'),
    rect(202,586, 168,48, C.surf,10),
    rect(202,586, 168,48, 'transparent',10,1,C.dim),
    text(202,600, 168,20, 'DOWNLOAD PDF', 10,600,C.sub,'center'),

    // Next report note
    text(20,648, 350,14, 'Next report: Apr 8 at 9:00 AM', 8,400,C.dim,'center'),

    // Powered by badge
    text(20,668, 350,14, '✦ PYRE BRAND INTELLIGENCE', 7,600,C.amber,'center'),

    ...bottomNav('Insights'),
  ]
};

// ─── Assemble & Write ─────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'PYRE — Brand Intelligence',
  screens: [screen1, screen2, screen3, screen4, screen5, screen6],
};

fs.writeFileSync('pyre.pen', JSON.stringify(pen, null, 2));
console.log('✓ pyre.pen written');
console.log('  Screens:', pen.screens.length);
pen.screens.forEach(s =>
  console.log(`  • ${s.name}: ${s.children.length} layers`)
);
