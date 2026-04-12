// SWAY — Social Proof Intelligence
// Theme: LIGHT (previous 'writ' was DARK — alternating ✓)
//
// Inspired by:
//   • Evervault /customers (godly.website #960) — ultra-minimal case-study grid,
//     "encrypted" redacted-block visual motif as texture, near-black #010314 bg.
//     Challenge: flip this precision-data aesthetic to LIGHT mode with warmth.
//   • Awwwards nominee "Oryzo AI" — AI-layer on business data, confident layout.
//   • Dark Mode Design "Cushion" — freelance financial metrics done beautifully.
//
// Design challenge: Build a SaaS that helps founders build and measure social proof
// (customer case studies). Use Evervault's "redacted blocks" as a locked-content
// metaphor in light mode. Mix editorial serif-weight headers with monospace
// metrics — a visual system no recent run has tried.
//
// Palette: warm parchment #F3EFE8 · ink #17130D · terracotta #C85A28 ·
//          sage #4E7E6C · stone #E2DDD5 · muted warm grey

'use strict';
const fs   = require('fs');
const path = require('path');

const W = 390, H = 844;

// ── Palette ─────────────────────────────────────────────────────────────────
const PARCH   = '#F3EFE8'; // warm parchment bg
const WHITE   = '#FFFFFF'; // surface
const INK     = '#17130D'; // warm near-black
const TERRA   = '#C85A28'; // terracotta accent
const SAGE    = '#4E7E6C'; // sage green accent2
const STONE   = '#E2DDD5'; // dividers / subtle bg
const MUTED   = '#A09280'; // warm muted
const GOLD    = '#B8902A'; // golden highlight
const CORAL   = '#E07060'; // alert / negative
const INKLT   = '#4A3F35'; // lighter ink for secondary text

// ── Primitives ───────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, r = 0) {
  const n = { type: 'rect', x, y, width: w, height: h, fill };
  if (r) n.cornerRadius = r;
  return n;
}
function txt(x, y, str, size, fill, opts = {}) {
  return {
    type: 'text', x, y, text: str, fontSize: size, fill,
    fontFamily: opts.mono ? 'JetBrains Mono' : 'Inter',
    fontWeight: opts.w || 400,
    textAlign: opts.align || 'left',
    ...(opts.italic ? { fontStyle: 'italic' } : {}),
    ...(opts.op ? { opacity: opts.op } : {}),
    ...(opts.ls ? { letterSpacing: opts.ls } : {}),
  };
}
function line(x1, y1, x2, y2, stroke, sw = 1) {
  return { type: 'line', x1, y1, x2, y2, stroke, strokeWidth: sw };
}
function ellipse(cx, cy, r, fill) {
  return { type: 'ellipse', x: cx-r, y: cy-r, width: r*2, height: r*2, fill };
}

// Evervault-inspired encrypted/redacted block
function redact(x, y, w, h = 9, fill = STONE) {
  return rect(x, y, w, h, fill, 3);
}

// Pill badge
function pill(x, y, w, h, fill, r = 12) {
  return rect(x, y, w, h, fill, r);
}

// Status bar
function statusBar(nodes) {
  nodes.push(rect(0, 0, W, 44, WHITE));
  nodes.push(txt(20, 14, '9:41', 14, INK, { w: 600 }));
  nodes.push(txt(334, 14, '◼◼◼', 12, INK));
}

// Bottom nav — 4 tabs
function bottomNav(nodes, active = 0) {
  const tabs = [
    { icon: '◈', label: 'Stories' },
    { icon: '⊞', label: 'Impact' },
    { icon: '◐', label: 'Build' },
    { icon: '⊙', label: 'Share' },
  ];
  nodes.push(rect(0, H-80, W, 80, WHITE));
  nodes.push(line(0, H-80, W, H-80, STONE));
  tabs.forEach((t, i) => {
    const tx = i * (W/4) + W/8;
    const on = i === active;
    if (on) nodes.push(rect(tx-20, H-80, 40, 3, TERRA, 0));
    nodes.push(txt(tx-8, H-62, t.icon, 18, on ? TERRA : MUTED, { align: 'center' }));
    nodes.push(txt(tx-22, H-38, t.label, 10, on ? TERRA : MUTED,
      { align: 'center', w: on ? 600 : 400 }));
  });
}

// ── S1: Stories Dashboard ────────────────────────────────────────────────────
function s1() {
  const N = [];
  N.push(rect(0,0,W,H,PARCH));
  statusBar(N);

  // Header
  N.push(rect(0,44,W,60,WHITE));
  N.push(line(0,104,W,104,STONE));
  N.push(txt(20,65,'Stories',24,INK,{w:700}));
  N.push(txt(20,85,'Your social proof library',12,MUTED));
  N.push(txt(344,72,'+ New',12,TERRA,{w:600}));

  // Stats strip
  N.push(rect(0,104,W,64,WHITE));
  N.push(line(0,168,W,168,STONE));
  const stats = [
    {label:'Stories',val:'24',color:TERRA},
    {label:'Avg Uplift',val:'34%',color:SAGE},
    {label:'Views',val:'18.2K',color:GOLD},
  ];
  stats.forEach((s,i)=>{
    const sx = 28 + i*(W/3);
    N.push(txt(sx,120,s.val,22,s.color,{w:700,mono:true}));
    N.push(txt(sx,142,s.label,10,MUTED,{ls:0.6}));
    if(i<2) N.push(line(sx+W/3-16,112,sx+W/3-16,156,STONE));
  });

  // Filter row
  const chips = ['All','Active','Draft','Archived'];
  let cx = 16;
  N.push(rect(0,168,W,44,PARCH));
  chips.forEach((c,i)=>{
    const cw = c.length*8+20;
    const on = i===0;
    N.push(pill(cx,176,cw,28,on?TERRA:STONE,14));
    N.push(txt(cx+cw/2-c.length*3.5,185,c,11,on?WHITE:INK,{w:on?600:400}));
    cx+=cw+8;
  });

  // Story cards
  const stories = [
    {
      company:'Notion',logo:'N',logoC:INK,logoBg:INK+'18',
      headline:'"SWAY helped us 3× our trial-to-paid rate in 6 weeks"',
      tag:'Product',uplift:'+340%',upC:SAGE,
      metric:'3.4×','mLabel':'conversion lift',
      views:'4.1K',status:'Active',statusC:SAGE,
    },
    {
      company:'Linear',logo:'L',logoC:TERRA,logoBg:TERRA+'18',
      headline:'"Our case study became our #1 sales enablement asset"',
      tag:'Sales',uplift:'+180%',upC:GOLD,
      metric:'$2.1M','mLabel':'influenced ARR',
      views:'6.8K',status:'Active',statusC:SAGE,
    },
    {
      company:'Vercel',logo:'V',logoC:'#4A7EC8',logoBg:'#4A7EC822',
      headline:'"Social proof slashed our objection-handling time by half"',
      tag:'Marketing',uplift:'+92%',upC:TERRA,
      metric:'52%','mLabel':'faster sales cycle',
      views:'2.9K',status:'Draft',statusC:GOLD,
    },
  ];
  stories.forEach((s,i)=>{
    const sy = 220+i*176;
    N.push(rect(16,sy,W-32,162,WHITE,12));
    // Left accent stripe — Evervault cue
    N.push(rect(16,sy,3,162,s.upC,0));
    // Logo
    N.push(rect(28,sy+16,38,38,s.logoBg,8));
    N.push(txt(47,sy+30,s.logo,16,s.logoC,{w:700,align:'center'}));
    // Company + tag
    N.push(txt(76,sy+22,s.company,14,INK,{w:700}));
    N.push(pill(76,sy+38,s.tag.length*7+14,20,s.upC+'22',10));
    N.push(txt(83,sy+43,s.tag,9,s.upC,{w:600,ls:0.5}));
    // Status pill
    N.push(pill(W-72,sy+16,52,20,s.statusC+'22',10));
    N.push(txt(W-48,sy+21,s.status,9,s.statusC,{w:600,align:'center'}));
    // Headline
    N.push(txt(28,sy+68,s.headline,11,INKLT,{italic:true}));
    // Divider
    N.push(line(28,sy+104,W-28,sy+104,STONE));
    // Metrics row
    N.push(txt(28,sy+115,s.metric,20,s.upC,{w:700,mono:true}));
    N.push(txt(28,sy+137,s.mLabel,10,MUTED));
    N.push(txt(W-80,sy+115,s.views,14,INK,{w:600,mono:true}));
    N.push(txt(W-80,sy+133,'views',9,MUTED));
    // Encrypted row (locked detail — Evervault motif)
    N.push(redact(28,sy+148,120));
    N.push(redact(156,sy+148,60));
    N.push(txt(W-48,sy+144,'→',16,TERRA));
  });

  bottomNav(N,0);
  return N;
}

// ── S2: Impact Dashboard ─────────────────────────────────────────────────────
function s2() {
  const N = [];
  N.push(rect(0,0,W,H,PARCH));
  statusBar(N);

  N.push(rect(0,44,W,60,WHITE));
  N.push(line(0,104,W,104,STONE));
  N.push(txt(20,65,'Impact',24,INK,{w:700}));
  N.push(txt(20,85,'Last 30 days',12,MUTED));
  N.push(txt(320,72,'Apr 2026 ▾',12,TERRA,{w:500}));

  // Big KPI card
  N.push(rect(16,112,W-32,110,WHITE,12));
  N.push(rect(16,112,W-32,4,TERRA,0));
  N.push(txt(28,126,'Total Revenue Influenced',11,MUTED,{ls:0.4}));
  N.push(txt(28,145,'$4.8M',38,INK,{w:700,mono:true}));
  N.push(txt(28,186,'+28% vs last month',12,SAGE,{w:500}));
  // Sparkline bars (simplified)
  const bars = [40,55,35,70,60,80,90,65,85,95,70,88];
  bars.forEach((h,i)=>{
    const bx = 200 + i*13;
    N.push(rect(bx, 186-h/3, 8, h/3, i===11?TERRA:STONE, 2));
  });

  // 2-column metrics
  const metrics = [
    {label:'Stories Viewed',val:'18,241',sub:'+12% ↑',color:SAGE},
    {label:'Deals Influenced',val:'47',sub:'+5 this week',color:GOLD},
    {label:'Avg Time on Story',val:'3m 42s',sub:'−8s ↓',color:TERRA},
    {label:'Share Rate',val:'12.4%',sub:'Industry avg 4%',color:SAGE},
  ];
  metrics.forEach((m,i)=>{
    const col = i%2; const row = Math.floor(i/2);
    const mx = 16 + col*(W/2-8);
    const my = 234 + row*96;
    N.push(rect(mx,my,W/2-24,82,WHITE,10));
    N.push(txt(mx+14,my+16,m.label,10,MUTED,{ls:0.4}));
    N.push(txt(mx+14,my+34,m.val,20,INK,{w:700,mono:true}));
    N.push(txt(mx+14,my+58,m.sub,10,m.color,{w:500}));
  });

  // Story performance table header
  N.push(txt(20,440,'Top Performing Stories',13,INK,{w:700}));
  N.push(line(20,458,W-20,458,STONE));
  N.push(txt(20,465,'Story',10,MUTED,{ls:0.6}));
  N.push(txt(200,465,'Views',10,MUTED,{ls:0.6,align:'center'}));
  N.push(txt(W-40,465,'Lift',10,MUTED,{ls:0.6,align:'right'}));

  const rows = [
    {name:'Notion — Trial Conversion',views:'4,120',lift:'+340%',liftC:SAGE},
    {name:'Linear — Sales Cycle Speed',views:'6,841',lift:'+180%',liftC:GOLD},
    {name:'Vercel — Objection Handling',views:'2,903',lift:'+92%',liftC:TERRA},
    {name:'Loom — Demo Requests',views:'1,760',lift:'+64%',liftC:SAGE},
  ];
  rows.forEach((r,i)=>{
    const ry = 480+i*52;
    N.push(rect(16,ry,W-32,44,WHITE,8));
    // Rank
    N.push(txt(28,ry+16,`${i+1}`,13,TERRA,{w:700,mono:true}));
    N.push(txt(48,ry+16,r.name,11,INK));
    N.push(txt(48,ry+30,'↗ ' + r.views + ' views',9,MUTED,{mono:true}));
    N.push(txt(W-28,ry+20,r.lift,12,r.liftC,{w:700,mono:true,align:'right'}));
    // Encrypted detail row
    N.push(redact(48,ry+38,80,7,STONE));
  });

  bottomNav(N,1);
  return N;
}

// ── S3: Story Detail ──────────────────────────────────────────────────────────
function s3() {
  const N = [];
  N.push(rect(0,0,W,H,WHITE));
  statusBar(N);

  N.push(rect(0,44,W,48,WHITE));
  N.push(line(0,92,W,92,STONE));
  N.push(txt(20,66,'←',18,INK));
  N.push(txt(W/2-30,66,'Story',15,INK,{w:600,align:'center'}));
  N.push(txt(346,62,'⤶',18,TERRA));

  // Hero brand block
  N.push(rect(0,92,W,100,PARCH));
  N.push(rect(20,108,48,48,INK+'18',10));
  N.push(txt(44,128,'N',20,INK,{w:700,align:'center'}));
  N.push(txt(80,114,'Notion',18,INK,{w:700}));
  N.push(txt(80,136,'Product — Series C',11,MUTED));
  N.push(txt(80,152,'notionhq.com',10,TERRA));
  // Status
  N.push(pill(W-80,108,60,24,SAGE+'22',12));
  N.push(txt(W-52,115,'Active',10,SAGE,{w:600,align:'center'}));

  N.push(line(0,192,W,192,STONE));

  // Impact headline (the "pull quote")
  N.push(rect(16,200,W-32,90,TERRA+'0C',10));
  N.push(rect(16,200,4,90,TERRA,0));
  N.push(txt(32,214,'"SWAY helped us triple our trial-to-paid\nconversion rate in just six weeks — it\nbecame our single best sales asset."',13,INK,{italic:true}));
  N.push(txt(32,272,'— Maya Chen, Head of Growth at Notion',10,MUTED));

  // Key metrics (3-up)
  N.push(txt(20,308,'Impact Metrics',13,INK,{w:700}));
  const kms = [
    {val:'3.4×',label:'Conversion Lift',color:TERRA},
    {val:'$2.1M',label:'Influenced ARR',color:GOLD},
    {val:'4.1K',label:'Story Views',color:SAGE},
  ];
  kms.forEach((k,i)=>{
    const kx = 16+i*(W/3-4);
    N.push(rect(kx,326,W/3-12,72,PARCH,10));
    N.push(txt(kx+10,340,k.val,22,k.color,{w:700,mono:true}));
    N.push(txt(kx+10,366,k.label,9,MUTED));
  });

  // Timeline
  N.push(txt(20,414,'Story Timeline',13,INK,{w:700}));
  const events = [
    {week:'Week 1',ev:'Kick-off call + discovery',icon:'○'},
    {week:'Week 2',ev:'Draft shared to customer',icon:'○'},
    {week:'Week 4',ev:'Published & distributed',icon:'●'},
    {week:'Week 6',ev:'3× conversion milestone',icon:'★'},
  ];
  events.forEach((e,i)=>{
    const ey = 432+i*52;
    // Timeline line
    if(i<3) N.push(line(32,ey+20,32,ey+52,STONE));
    N.push(ellipse(32,ey+10,8,i===3?TERRA:i===2?SAGE:STONE));
    N.push(txt(32,ey+6,e.icon,8,i===3?WHITE:i===2?WHITE:MUTED,{align:'center'}));
    N.push(txt(50,ey+4,e.week,10,TERRA,{w:600,mono:true}));
    N.push(txt(50,ey+18,e.ev,12,INK));
  });

  // Locked section (Evervault motif)
  N.push(txt(20,648,'Full Transcript',13,INK,{w:700}));
  N.push(redact(20,668,W-40,10,STONE));
  N.push(redact(20,684,W-100,10,STONE));
  N.push(redact(20,700,W-60,10,STONE));
  N.push(redact(20,716,120,10,STONE));
  N.push(txt(20,732,'Unlock with Growth plan →',11,TERRA,{w:500}));

  bottomNav(N,0);
  return N;
}

// ── S4: Story Builder ──────────────────────────────────────────────────────────
function s4() {
  const N = [];
  N.push(rect(0,0,W,H,PARCH));
  statusBar(N);

  N.push(rect(0,44,W,56,WHITE));
  N.push(line(0,100,W,100,STONE));
  N.push(txt(20,65,'Build a Story',20,INK,{w:700}));
  N.push(txt(20,84,'New draft — Loom',12,MUTED));
  N.push(txt(330,68,'Save',13,TERRA,{w:600}));

  // Progress indicator
  const steps=['Customer','Context','Proof','Quote','Publish'];
  N.push(rect(16,108,W-32,48,WHITE,0));
  steps.forEach((s,i)=>{
    const sx = 24+i*((W-32)/5);
    const on=i<=1;
    N.push(ellipse(sx+16,130,i===1?8:6,on?TERRA:STONE));
    if(i<4) N.push(line(sx+24,130,sx+(W-32)/5,130,on&&i<1?TERRA:STONE));
    if(i===1||i===4) N.push(txt(sx+16-s.length*3,146,s,8,on?TERRA:MUTED,{align:'center'}));
  });

  // Form sections
  N.push(rect(16,162,W-32,90,WHITE,10));
  N.push(txt(28,176,'Customer',11,MUTED,{ls:0.6}));
  N.push(line(28,190,W-28,190,STONE));
  N.push(txt(28,202,'Loom',15,INK,{w:600}));
  N.push(txt(28,222,'Yoko Li, Head of Marketing',12,INKLT));
  N.push(txt(28,238,'loom.com · Series B · Video',10,MUTED));
  N.push(txt(W-40,198,'✎',16,TERRA));

  // Context block
  N.push(rect(16,260,W-32,100,WHITE,10));
  N.push(txt(28,274,'Challenge',11,MUTED,{ls:0.6}));
  N.push(line(28,288,W-28,288,STONE));
  N.push(txt(28,302,'Loom struggled to communicate ROI to\nnon-technical buyers during enterprise\nsales cycles.',12,INKLT));
  N.push(txt(W-40,270,'✎',16,TERRA));

  // Proof metric builder
  N.push(rect(16,368,W-32,116,WHITE,10));
  N.push(txt(28,382,'Proof Points',11,MUTED,{ls:0.6}));
  N.push(line(28,396,W-28,396,STONE));
  // Metric inputs (filled-in look)
  N.push(rect(28,404,120,34,PARCH,8));
  N.push(txt(40,417,'+64%',16,TERRA,{w:700,mono:true}));
  N.push(rect(158,404,170,34,PARCH,8));
  N.push(txt(166,417,'Demo request rate',12,INK));
  // Second metric
  N.push(rect(28,446,120,34,PARCH,8));
  N.push(txt(40,459,'3×',16,GOLD,{w:700,mono:true}));
  N.push(rect(158,446,170,34,PARCH,8));
  N.push(txt(166,459,'Sales cycle speed',12,INK));
  N.push(txt(28,488,'+ Add Proof Point',11,TERRA,{w:500}));

  // AI Generate button
  N.push(rect(16,494,W-32,52,TERRA,14));
  N.push(txt(W/2-70,512,'◈  AI Draft Story →',15,WHITE,{w:600,align:'center'}));

  N.push(txt(20,562,'SIFT AI will draft your story from these\nproof points. Review and publish in minutes.',11,MUTED));

  // Redact teaser of AI output
  N.push(rect(16,596,W-32,88,WHITE,10));
  N.push(txt(28,610,'Preview',10,MUTED,{ls:0.6}));
  N.push(line(28,624,W-28,624,STONE));
  N.push(redact(28,632,W-56,10,STONE));
  N.push(redact(28,648,200,10,STONE));
  N.push(redact(28,664,W-80,10,STONE));
  N.push(txt(28,678,'Generate to unlock preview',10,TERRA));

  bottomNav(N,2);
  return N;
}

// ── S5: Distribution / Share ────────────────────────────────────────────────
function s5() {
  const N = [];
  N.push(rect(0,0,W,H,PARCH));
  statusBar(N);

  N.push(rect(0,44,W,56,WHITE));
  N.push(line(0,100,W,100,STONE));
  N.push(txt(20,65,'Distribute',20,INK,{w:700}));
  N.push(txt(20,84,'Get your stories in front of buyers',12,MUTED));

  // Story picker
  N.push(rect(16,108,W-32,48,WHITE,10));
  N.push(txt(28,126,'Notion — Trial Conversion',13,INK,{w:600}));
  N.push(txt(28,142,'Selected story',10,TERRA));
  N.push(txt(W-40,126,'▾',14,MUTED));

  // Channel cards
  const channels = [
    {name:'Sales Deck Embed',icon:'⊞',desc:'Smart widget for your pitch deck',stat:'12 decks',statC:SAGE,on:true},
    {name:'CRM Integration',icon:'◈',desc:'Auto-attach to HubSpot deals',stat:'47 deals',statC:GOLD,on:true},
    {name:'Email Sequence',icon:'◎',desc:'Insert link in outbound cadence',stat:'840 sends',statC:TERRA,on:false},
    {name:'Public Story Page',icon:'⊙',desc:'Branded URL for social sharing',stat:'4.1K views',statC:SAGE,on:true},
  ];
  channels.forEach((c,i)=>{
    const cy = 166+i*98;
    N.push(rect(16,cy,W-32,84,WHITE,12));
    // Toggle
    const togW=40, togH=22;
    N.push(rect(W-60,cy+30,togW,togH,c.on?TERRA:STONE,11));
    N.push(ellipse(c.on?W-28:W-48,cy+41,9,WHITE));
    // Icon
    N.push(rect(28,cy+16,36,36,c.on?TERRA+'18':STONE,8));
    N.push(txt(46,cy+30,c.icon,16,c.on?TERRA:MUTED,{align:'center'}));
    N.push(txt(76,cy+24,c.name,13,INK,{w:600}));
    N.push(txt(76,cy+42,c.desc,10,MUTED));
    // Stat
    N.push(txt(76,cy+60,c.stat,10,c.statC,{mono:true,w:500}));
    // Bottom redacted detail (Evervault motif)
    N.push(redact(28,cy+72,80,7,STONE));
    N.push(redact(116,cy+72,40,7,STONE));
  });

  // Share CTA
  N.push(rect(16,568,W-32,52,TERRA,14));
  N.push(txt(W/2-60,587,'↑  Push to All Channels',15,WHITE,{w:600,align:'center'}));
  N.push(txt(20,636,'Last distributed: Today 9:12 AM · 3 channels active',11,MUTED));

  bottomNav(N,3);
  return N;
}

// ── Assemble .pen ──────────────────────────────────────────────────────────
const screens = [
  { id:'stories', name:'Stories Dashboard', nodes:s1() },
  { id:'impact',  name:'Impact Metrics',    nodes:s2() },
  { id:'detail',  name:'Story Detail',      nodes:s3() },
  { id:'builder', name:'Story Builder',     nodes:s4() },
  { id:'share',   name:'Distribute',        nodes:s5() },
];

const pen = {
  version: '2.8',
  metadata: {
    name: 'SWAY — Social Proof Intelligence',
    description: 'Inspired by Evervault\'s encrypted customer-story grid (godly.website #960) — Evervault\'s redacted-block motif and precise data layout inverted into a warm editorial light theme. A SaaS for founders to build and measure social proof (case studies).',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    theme: 'light',
    palette: { bg: '#F3EFE8', surface: '#FFFFFF', text: '#17130D', accent: '#C85A28', accent2: '#4E7E6C' },
  },
  canvas: { width: W, height: H, background: PARCH },
  screens: screens.map(s => ({
    id: s.id, name: s.name,
    width: W, height: H,
    background: PARCH,
    nodes: s.nodes,
  })),
};

const outPath = path.join(__dirname, 'sway.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
const size = Math.round(fs.statSync(outPath).size / 1024);
console.log(`✓ sway.pen written — ${size}KB`);
console.log(`  Screens: ${screens.map(s=>s.name).join(', ')}`);
