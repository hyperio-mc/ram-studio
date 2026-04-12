'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG  = 'glare';
const NAME  = 'GLARE';
const W     = 390;
const H     = 844;
const HB    = 474;

// ── Palette (DARK — true black + electric chartreuse, inspired by darkmodedesign.com/Neon) ──
const P = {
  bg:      '#050507',   // near true black
  surf:    '#0C0C11',   // dark surface
  card:    '#141418',   // card bg
  card2:   '#1A1A22',   // raised card
  border:  '#2A2A35',   // subtle divider
  text:    '#FFFFFF',   // primary white
  text2:   'rgba(255,255,255,0.5)', // 50% white (darkmodedesign pattern)
  text3:   'rgba(255,255,255,0.25)', // muted
  acc:     '#CAFF33',   // electric chartreuse / neon yellow-green
  acc2:    '#FF4F6A',   // coral red
  acc3:    '#6366F1',   // indigo
  glow:    'rgba(202,255,51,0.15)', // chartreuse glow
  glow2:   'rgba(202,255,51,0.06)', // faint glow
};

// ── Primitives ──────────────────────────────────────────────────────
const els = [];
function rect(x,y,w,h,fill,opts={}) {
  els.push({ type:'rect', x, y, w, h, fill,
    rx: opts.rx||0, opacity: opts.opacity||1,
    stroke: opts.stroke||'none', sw: opts.sw||0 });
}
function text(x,y,content,size,fill,opts={}) {
  els.push({ type:'text', x, y, content: String(content), size, fill,
    fw: opts.fw||400, font: opts.font||'Inter', anchor: opts.anchor||'start',
    ls: opts.ls||0, opacity: opts.opacity||1 });
}
function circle(cx,cy,r,fill,opts={}) {
  els.push({ type:'circle', cx, cy, r, fill,
    opacity: opts.opacity||1, stroke: opts.stroke||'none', sw: opts.sw||0 });
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  els.push({ type:'line', x1, y1, x2, y2, stroke, sw: opts.sw||1, opacity: opts.opacity||1 });
}

// ── Screens ─────────────────────────────────────────────────────────
const screens = [];
function makeScreen(name, fn) {
  const before = els.length;
  fn();
  screens.push({ name, svg: `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"/>`, elements: els.splice(before) });
}

// Shared UI: status bar
function statusBar() {
  text(20, 52, '9:41', 13, P.text, { fw:600 });
  text(W-20, 52, '●●●', 11, P.text2, { anchor:'end' });
}

// Shared UI: bottom nav
function bottomNav(active) {
  rect(0, H-80, W, 80, P.surf);
  line(0, H-80, W, H-80, P.border);
  const tabs = [
    { id:'dash', label:'Home', icon:'⬡' },
    { id:'reach', label:'Reach', icon:'◎' },
    { id:'revenue', label:'Revenue', icon:'◈' },
    { id:'content', label:'Content', icon:'▤' },
    { id:'profile', label:'Me', icon:'◉' },
  ];
  tabs.forEach((t,i) => {
    const x = 39 + i*78;
    const isActive = t.id === active;
    text(x, H-50, t.icon, 18, isActive ? P.acc : P.text3, { anchor:'middle' });
    text(x, H-28, t.label, 10, isActive ? P.acc : P.text3, { anchor:'middle', fw: isActive?600:400 });
    if (isActive) {
      rect(x-18, H-80, 36, 2, P.acc, { rx:1 });
    }
  });
}

// ── SCREEN 1: COMMAND DASHBOARD ──────────────────────────────────────
makeScreen('Command', () => {
  rect(0, 0, W, H, P.bg);
  statusBar();

  // Header
  text(20, 84, 'GLARE', 22, P.text, { fw:700, ls:4 });
  text(W-20, 84, '↺', 20, P.text2, { anchor:'end' });
  text(20, 106, 'Creator Intelligence', 12, P.text2);

  // Hero glow circle (data viz centrepiece — inspired by Neon's glowing chart)
  // Outer glow rings
  circle(195, 248, 110, P.glow2);
  circle(195, 248, 88, P.glow, { opacity:0.5 });
  circle(195, 248, 66, 'rgba(202,255,51,0.25)');
  // Arc segments representing platform breakdown
  // Platform arcs as colored rings (represented as thick circles)
  circle(195, 248, 74, 'none', { stroke: P.acc, sw:14, opacity:0.9 });
  circle(195, 248, 56, 'none', { stroke: P.acc2, sw:10, opacity:0.7 });
  circle(195, 248, 40, 'none', { stroke: P.acc3, sw:8, opacity:0.5 });
  // Centre value
  circle(195, 248, 28, P.card2);
  text(195, 243, '1.4M', 16, P.text, { fw:700, anchor:'middle' });
  text(195, 258, 'reach', 9, P.text2, { anchor:'middle' });

  // Legend chips
  const chips = [['YouTube','#CAFF33'],['Instagram','#FF4F6A'],['Substack','#6366F1']];
  chips.forEach((c,i) => {
    const x = 48 + i*102;
    rect(x-8, 332, c[0].length*6+24, 22, P.card2, { rx:11 });
    circle(x+4, 343, 4, c[1]);
    text(x+12, 347, c[0], 10, P.text2);
  });

  // KPI strip
  rect(20, 370, W-40, 72, P.card, { rx:12 });
  const kpis = [['12.4K','New fans'],['94%','Retention'],['$8,240','Revenue']];
  kpis.forEach((k,i) => {
    const x = 52 + i*117;
    text(x, 394, k[0], 17, i===0?P.acc:P.text, { fw:700, anchor:'middle' });
    text(x, 410, k[1], 10, P.text2, { anchor:'middle' });
    if (i < 2) line(x+52, 378, x+52, 434, P.border, { opacity:0.5 });
  });

  // Trend sparkline card
  rect(20, 458, W-40, 100, P.card, { rx:12 });
  text(28, 478, 'Weekly Reach Trend', 12, P.text, { fw:600 });
  text(W-28, 478, '+18% vs last week', 10, P.acc, { anchor:'end', fw:600 });

  // Sparkline bars
  const barData = [38,52,45,71,60,83,97,78,90,110,98,124];
  barData.forEach((v,i) => {
    const bh = (v/130)*52;
    const bx = 28 + i*27;
    rect(bx, 540-bh, 18, bh, i===barData.length-1?P.acc:P.glow2, { rx:4 });
    if (i===barData.length-1) rect(bx, 540-bh, 18, bh, P.acc, { rx:4, opacity:0.9 });
  });
  // Glow line under bars
  rect(28, 540, W-56, 1, P.border);

  // Today's highlights
  text(20, 574, 'Today\'s Highlights', 13, P.text, { fw:600 });
  const highlights = [
    { label:'YouTube short hit 280K views', tag:'+180K', col:P.acc },
    { label:'Substack open rate spike — 67%', tag:'↑ 23%', col:P.acc },
    { label:'Instagram Reel reshared 1,200×', tag:'Viral', col:P.acc2 },
  ];
  highlights.forEach((h,i) => {
    const y = 596+i*44;
    rect(20, y, W-40, 36, P.card, { rx:8 });
    circle(37, y+18, 4, h.col);
    text(50, y+21, h.label, 11, P.text2);
    rect(W-70, y+6, 42, 22, h.col==='#FF4F6A'?'rgba(255,79,106,0.15)':'rgba(202,255,51,0.12)', { rx:11 });
    text(W-49, y+21, h.tag, 10, h.col, { fw:700, anchor:'middle' });
  });

  bottomNav('dash');
});

// ── SCREEN 2: REACH ANALYTICS ────────────────────────────────────────
makeScreen('Reach', () => {
  rect(0, 0, W, H, P.bg);
  statusBar();

  text(20, 84, 'Reach', 22, P.text, { fw:700 });
  text(20, 106, 'Audience growth & discovery', 12, P.text2);

  // Period selector
  ['7d','30d','90d','1y'].forEach((p,i) => {
    const x = 20 + i*80;
    const active = i===1;
    rect(x, 124, 68, 28, active?P.card2:P.surf, { rx:8, stroke: active?P.acc:'none', sw:1 });
    text(x+34, 142, p, 12, active?P.acc:P.text2, { anchor:'middle', fw: active?600:400 });
  });

  // Big glowing number
  text(20, 196, '1,412,008', 34, P.text, { fw:800 });
  text(20, 220, 'Total reach this month', 12, P.text2);
  rect(20, 230, 88, 24, 'rgba(202,255,51,0.1)', { rx:12 });
  text(64, 246, '↑ 18.2%', 11, P.acc, { anchor:'middle', fw:700 });

  // Glowing bar chart — the hero viz (Neon-inspired)
  text(20, 274, 'Daily reach', 12, P.text2, { fw:500 });
  const reachData = [82,90,76,110,98,130,114,142,128,155,140,168,152,180,165,192,178,205,190,218,202,230,215,242,228,255,238,260,248,268];
  reachData.forEach((v,i) => {
    if (i >= 30) return;
    const bh = (v/280)*160;
    const bx = 20 + i*12;
    const isRecent = i >= 25;
    // Glow base
    if (isRecent) rect(bx, 440-bh-8, 8, bh+8, P.glow2, { rx:2 });
    rect(bx, 440-bh, 8, bh, isRecent?P.acc:'rgba(202,255,51,0.3)', { rx:2 });
  });
  rect(20, 440, W-40, 1, P.border);
  // X labels
  ['Apr 1','Apr 11','Apr 21','Apr 30'].forEach((l,i) => {
    text(20+i*110, 456, l, 9, P.text3, { anchor:'middle' });
  });

  // Platform breakdown
  text(20, 474, 'By Platform', 13, P.text, { fw:600 });
  const platforms = [
    { name:'YouTube', val:'680K', pct:48, col:P.acc },
    { name:'Instagram', val:'420K', pct:30, col:P.acc2 },
    { name:'Substack', val:'198K', pct:14, col:P.acc3 },
    { name:'Podcast', val:'114K', pct:8, col:'rgba(255,255,255,0.3)' },
  ];
  platforms.forEach((pl,i) => {
    const y = 492+i*48;
    text(20, y+16, pl.name, 13, P.text);
    text(W-20, y+16, pl.val, 13, P.acc, { anchor:'end', fw:700 });
    rect(20, y+24, W-40, 6, P.card, { rx:3 });
    rect(20, y+24, (W-40)*(pl.pct/100), 6, pl.col, { rx:3 });
    text(20, y+42, `${pl.pct}% of total reach`, 10, P.text3);
  });

  // Top source card
  rect(20, 694, W-40, 60, P.card, { rx:12 });
  text(36, 716, 'Top Discovery Source', 11, P.text2);
  text(36, 738, 'YouTube Shorts Algorithm', 14, P.text, { fw:700 });
  text(W-36, 716, '↗', 20, P.acc, { anchor:'end' });
  text(W-36, 738, '68% of new subs', 11, P.acc, { anchor:'end' });

  bottomNav('reach');
});

// ── SCREEN 3: REVENUE INTELLIGENCE ──────────────────────────────────
makeScreen('Revenue', () => {
  rect(0, 0, W, H, P.bg);
  statusBar();

  text(20, 84, 'Revenue', 22, P.text, { fw:700 });
  text(20, 106, 'Earnings breakdown', 12, P.text2);

  // Hero revenue stat
  rect(20, 122, W-40, 100, P.card, { rx:16 });
  // Glow background
  rect(20, 122, W-40, 100, P.glow2, { rx:16 });
  text(195, 162, '$8,240', 38, P.acc, { fw:800, anchor:'middle' });
  text(195, 186, 'April revenue to date', 13, P.text2, { anchor:'middle' });
  text(195, 206, '↑ 32% vs March', 11, P.acc, { anchor:'middle', fw:600 });

  // Revenue streams
  text(20, 242, 'Streams', 13, P.text, { fw:600 });
  const streams = [
    { name:'YouTube AdSense', val:'$3,120', pct:38, col:P.acc },
    { name:'Substack Paid', val:'$2,480', pct:30, col:'rgba(202,255,51,0.6)' },
    { name:'Sponsorships', val:'$1,640', pct:20, col:'rgba(202,255,51,0.35)' },
    { name:'Digital Products', val:'$1,000', pct:12, col:'rgba(202,255,51,0.15)' },
  ];
  streams.forEach((s,i) => {
    const y = 260+i*54;
    rect(20, y, W-40, 46, P.card, { rx:10 });
    // Glow fill
    rect(20, y, (W-40)*(s.pct/100), 46, s.col, { rx:10, opacity:0.3 });
    text(34, y+18, s.name, 13, P.text);
    text(34, y+36, `${s.pct}%`, 10, P.text2);
    text(W-34, y+27, s.val, 15, P.text, { anchor:'end', fw:700 });
  });

  // Monthly sparkline
  rect(20, 484, W-40, 80, P.card, { rx:12 });
  text(32, 502, 'Monthly Trend', 12, P.text, { fw:600 });
  text(W-32, 502, 'Last 6 months', 10, P.text2, { anchor:'end' });
  const months = [['N','5.2K'],['D','6.1K'],['J','5.8K'],['F','6.8K'],['M','6.3K'],['A','8.2K']];
  months.forEach((m,i) => {
    const bx = 40 + i*52;
    const h = (parseFloat(m[1])/9)*40;
    rect(bx-10, 550-h, 20, h, i===5?P.acc:'rgba(202,255,51,0.2)', { rx:4 });
    text(bx, 558, m[0], 10, P.text3, { anchor:'middle' });
    text(bx, 510+8, m[1], 9, i===5?P.acc:P.text3, { anchor:'middle' });
  });

  // Projected
  rect(20, 578, W-40, 54, P.card, { rx:12, stroke: P.acc, sw:1 });
  rect(20, 578, W-40, 54, P.glow2, { rx:12 });
  text(34, 598, '🎯  April Projection', 12, P.acc, { fw:700 });
  text(34, 616, 'On track for $10,800 if growth holds', 11, P.text2);

  // Recent transactions
  text(20, 650, 'Recent', 13, P.text, { fw:600 });
  const txns = [
    { label:'Sponsor — TechFlow', amount:'+$800', date:'Today' },
    { label:'YouTube payout', amount:'+$1,560', date:'Apr 10' },
    { label:'Substack billing', amount:'+$620', date:'Apr 8' },
  ];
  txns.forEach((t,i) => {
    const y = 666+i*48;
    rect(20, y, W-40, 40, P.card, { rx:8 });
    text(34, y+15, t.label, 12, P.text );
    text(34, y+30, t.date, 10, P.text3);
    text(W-34, y+22, t.amount, 13, P.acc, { anchor:'end', fw:700 });
  });

  bottomNav('revenue');
});

// ── SCREEN 4: CONTENT PERFORMANCE ───────────────────────────────────
makeScreen('Content', () => {
  rect(0, 0, W, H, P.bg);
  statusBar();

  text(20, 84, 'Content', 22, P.text, { fw:700 });
  text(20, 106, 'What\'s resonating', 12, P.text2);

  // Filter row
  const filters = ['All','YouTube','Instagram','Substack'];
  filters.forEach((f,i) => {
    const active = i===0;
    rect(20+i*82, 124, 74, 28, active?P.acc:P.card, { rx:14 });
    text(57+i*82, 142, f, 11, active?P.bg:P.text2, { anchor:'middle', fw: active?700:400 });
  });

  // Top performing posts
  text(20, 170, 'Top performing — April', 13, P.text, { fw:600 });
  const posts = [
    { rank:'01', title:'I built an app in 48 hours', platform:'YouTube', views:'280K', eng:'18%', badge:'🔥 Viral' },
    { rank:'02', title:'The creator economy is broken', platform:'Substack', views:'94K', eng:'67%', badge:'★ Best' },
    { rank:'03', title:'Morning routine for makers', platform:'Instagram', views:'142K', eng:'12%', badge:'↗ Rising' },
    { rank:'04', title:'How I made $8K in April', platform:'YouTube', views:'98K', eng:'24%', badge:'💰 Top Rev' },
    { rank:'05', title:'One tool changed everything', platform:'Substack', views:'61K', eng:'55%', badge:'✓ Solid' },
  ];
  posts.forEach((p,i) => {
    const y = 190+i*100;
    rect(20, y, W-40, 92, P.card, { rx:12 });

    // Rank
    text(36, y+28, p.rank, 18, P.acc, { fw:800 });
    // Platform chip
    const chipCol = p.platform==='YouTube'?P.acc:p.platform==='Substack'?P.acc3:P.acc2;
    rect(62, y+14, p.platform.length*6+10, 18, 'none', { rx:9, stroke:chipCol, sw:1 });
    text(67+p.platform.length*3, y+27, p.platform, 9, chipCol, { anchor:'middle' });
    // Title
    text(62, y+46, p.title.length>28?p.title.slice(0,28)+'…':p.title, 13, P.text, { fw:500 });
    // Stats
    text(62, y+66, `${p.views} views`, 11, P.text2);
    text(62+80, y+66, `${p.eng} eng.`, 11, P.text2);
    // Badge
    rect(W-90, y+60, 70, 20, 'rgba(202,255,51,0.08)', { rx:10 });
    text(W-55, y+74, p.badge, 9, P.acc, { anchor:'middle', fw:600 });
  });

  // Summary
  rect(20, 700, W-40, 54, P.card, { rx:12 });
  rect(20, 700, W-40, 54, P.glow2, { rx:12 });
  text(34, 720, 'Upload 2× more Shorts', 12, P.acc, { fw:700 });
  text(34, 738, 'GLARE suggests your best ROI format', 11, P.text2);

  bottomNav('content');
});

// ── SCREEN 5: ALERTS & SIGNALS ───────────────────────────────────────
makeScreen('Signals', () => {
  rect(0, 0, W, H, P.bg);
  statusBar();

  text(20, 84, 'Signals', 22, P.text, { fw:700 });
  text(20, 106, 'Anomalies & opportunities', 12, P.text2);

  // Signal score
  rect(20, 122, W-40, 80, P.card, { rx:16 });
  rect(20, 122, W-40, 80, P.glow2, { rx:16 });
  text(195, 154, '94', 42, P.acc, { fw:800, anchor:'middle' });
  text(195, 178, 'Signal Score — excellent momentum', 11, P.text2, { anchor:'middle' });
  // Score bar
  rect(40, 185, W-80, 6, P.border, { rx:3 });
  rect(40, 185, (W-80)*0.94, 6, P.acc, { rx:3 });

  // Active alerts
  text(20, 220, 'Active Signals', 13, P.text, { fw:600 });
  const signals = [
    { type:'🔥', title:'Viral window open', body:'Your YouTube Short has 15× avg velocity. Post a follow-up now.', urgency:'high' },
    { type:'⚡', title:'Best posting time in 2h', body:'Your audience peaks Sat 11AM. Schedule your Substack now.', urgency:'mid' },
    { type:'📈', title:'Subscriber surge', body:'+1,247 new YouTube subs in 6 hours — above 99th percentile.', urgency:'high' },
    { type:'💡', title:'Format opportunity', body:'Creators in your niche posting 15–30s Shorts see 3× reach.', urgency:'low' },
    { type:'⚠️', title:'Engagement dip on IG', body:'Instagram engagement down 18% — try a carousel this week.', urgency:'mid' },
  ];
  signals.forEach((s,i) => {
    const y = 240+i*100;
    const urgCol = s.urgency==='high'?P.acc:s.urgency==='mid'?P.acc2:P.text2;
    rect(20, y, W-40, 90, P.card, { rx:12, stroke:s.urgency==='high'?P.acc:'none', sw:s.urgency==='high'?1:0 });
    if (s.urgency==='high') rect(20, y, W-40, 90, P.glow2, { rx:12 });
    text(36, y+22, s.type, 18 );
    text(60, y+24, s.title, 13, P.text, { fw:600 });
    // Urgency dot
    circle(W-36, y+22, 5, urgCol);
    text(36, y+46, s.body.length>58?s.body.slice(0,58)+'…':s.body, 11, P.text2);
    text(36, y+68, 'Tap to act →', 10, urgCol, { fw:600 });
    line(36, y+78, W-36, y+78, P.border, { opacity:0.4 });
  });

  bottomNav('dash');
});

// ── SCREEN 6: PROFILE & SETTINGS ────────────────────────────────────
makeScreen('Profile', () => {
  rect(0, 0, W, H, P.bg);
  statusBar();

  // Avatar area
  circle(195, 120, 44, P.card2);
  circle(195, 120, 44, 'none', { stroke:P.acc, sw:2 });
  text(195, 125, 'JA', 22, P.acc, { fw:700, anchor:'middle' });
  text(195, 178, 'James Abara', 16, P.text, { fw:700, anchor:'middle' });
  text(195, 198, '@jamesabara', 12, P.text2, { anchor:'middle' });

  // Tier badge
  rect(155, 210, 80, 24, 'rgba(202,255,51,0.12)', { rx:12, stroke:P.acc, sw:1 });
  text(195, 226, '⚡ Pro Creator', 11, P.acc, { anchor:'middle', fw:600 });

  // All-time stats
  rect(20, 250, W-40, 72, P.card, { rx:14 });
  text(195, 272, 'All-time stats', 11, P.text2, { anchor:'middle' });
  const stats = [['24.8M','Total reach'],['$94K','Earned'],['1,240','Content pieces']];
  stats.forEach((s,i) => {
    const x = 65+i*130;
    text(x, 296, s[0], 15, P.acc, { fw:700, anchor:'middle' });
    text(x, 312, s[1], 9, P.text2, { anchor:'middle' });
    if (i<2) line(x+54, 262, x+54, 318, P.border, { opacity:0.5 });
  });

  // Settings list
  text(20, 344, 'Settings', 13, P.text, { fw:600 });
  const items = [
    { icon:'🔔', label:'Notifications', sub:'Alerts & digests' },
    { icon:'🔗', label:'Connected Platforms', sub:'YouTube, Instagram, Substack' },
    { icon:'💳', label:'Subscription', sub:'Pro — $19/month' },
    { icon:'📤', label:'Export Reports', sub:'CSV, PDF, API' },
    { icon:'🤖', label:'AI Insights', sub:'Powered by GLARE AI' },
    { icon:'🔒', label:'Privacy & Data', sub:'Control your data' },
  ];
  items.forEach((it,i) => {
    const y = 362+i*62;
    rect(20, y, W-40, 54, P.card, { rx:10 });
    text(38, y+22, it.icon, 16);
    text(62, y+22, it.label, 13, P.text, { fw:500 });
    text(62, y+38, it.sub, 11, P.text2);
    text(W-34, y+29, '›', 18, P.text2, { anchor:'end' });
  });

  // Version
  text(195, H-20, 'GLARE v2.4.1', 10, P.text3, { anchor:'middle' });

  bottomNav('profile');
});

// ── Write file ──────────────────────────────────────────────────────
const pen = {
  version:  '2.8',
  metadata: {
    name:      NAME,
    author:    'RAM',
    date:      new Date().toISOString().slice(0,10),
    theme:     'dark',
    heartbeat: HB,
    elements:  screens.reduce((n,s)=>n+s.elements.length,0),
  },
  screens,
};

const total = screens.reduce((n,s)=>n+s.elements.length,0);
console.log(`${NAME}: ${screens.length} screens, ${total} elements`);

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`Written: ${SLUG}.pen`);
