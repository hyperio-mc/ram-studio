'use strict';
const fs = require('fs');
const path = require('path');

// ORB — AI Media Intelligence Dashboard
// Heartbeat #499 | Dark theme
// Inspired by: darkmodedesign.com Analytics SaaS palette (#14181e, #e4b999, #4bada9)
//              saaspo.com bento grid layouts in AI-native SaaS tools
// Palette: near-black + warm amber + teal, glassmorphism cards, ambient gradient orbs

const SLUG = 'orb';
const W = 390, H = 844;

// Palette
const BG      = '#0D1117';
const SURF    = '#141920';
const CARD    = '#1A2130';
const CARD2   = '#1E2840';
const ACC     = '#E8B999'; // warm amber
const ACC2    = '#4BADA9'; // teal
const ACC3    = '#A78BFA'; // violet (glow)
const TEXT    = '#E8EDF5';
const MUTED   = 'rgba(232,237,245,0.45)';
const MUTED2  = 'rgba(232,237,245,0.25)';
const DIMMED  = 'rgba(232,237,245,0.12)';
const AMBER_G = 'rgba(232,185,153,0.18)';
const TEAL_G  = 'rgba(75,173,169,0.14)';
const VIOL_G  = 'rgba(167,139,250,0.12)';

let totalElements = 0;
function mkid() { return `el_${++totalElements}`; }

function rect(x,y,w,h,fill,opts={}) {
  const e = { id:mkid(), type:'rect', x,y,w,h,fill };
  if (opts.rx)      e.rx = opts.rx;
  if (opts.ry)      e.ry = opts.ry;
  if (opts.opacity !== undefined) e.opacity = opts.opacity;
  if (opts.stroke)  e.stroke = opts.stroke;
  if (opts.sw)      e.strokeWidth = opts.sw;
  return e;
}

function text(x,y,content,size,fill,opts={}) {
  const e = { id:mkid(), type:'text', x,y,content,fontSize:size,fill };
  if (opts.fw)     e.fontWeight = opts.fw;
  if (opts.font)   e.fontFamily = opts.font;
  if (opts.anchor) e.textAnchor = opts.anchor;
  if (opts.ls)     e.letterSpacing = opts.ls;
  if (opts.opacity !== undefined) e.opacity = opts.opacity;
  if (opts.td)     e.textDecoration = opts.td;
  return e;
}

function circle(cx,cy,r,fill,opts={}) {
  const e = { id:mkid(), type:'circle', cx,cy,r,fill };
  if (opts.opacity !== undefined) e.opacity = opts.opacity;
  if (opts.stroke)  e.stroke = opts.stroke;
  if (opts.sw)      e.strokeWidth = opts.sw;
  return e;
}

function line(x1,y1,x2,y2,stroke,opts={}) {
  const e = { id:mkid(), type:'line', x1,y1,x2,y2,stroke };
  if (opts.sw)      e.strokeWidth = opts.sw;
  if (opts.opacity !== undefined) e.opacity = opts.opacity;
  return e;
}

// ─── Shared components ─────────────────────────────────────────────────────

function statusBar(els) {
  els.push(rect(0,0,W,44,BG));
  els.push(text(16,27,'9:41',13,TEXT,{fw:'600'}));
  els.push(text(374,27,'●●●',11,TEXT,{anchor:'end',opacity:0.6}));
}

function navBar(els, activeIdx) {
  const labels = ['Home','Content','Audience','Signals','Publish'];
  const icons  = ['◉','▦','◎','⚡','↗'];
  els.push(rect(0,794,W,50,SURF));
  els.push(line(0,794,W,794,DIMMED,{sw:1}));
  const tw = W / labels.length;
  labels.forEach((lbl, i) => {
    const cx = tw*i + tw/2;
    const isActive = i === activeIdx;
    if (isActive) {
      els.push(rect(cx-20, 796, 40, 3, ACC, {rx:2}));
    }
    els.push(text(cx, 815, icons[i], 14, isActive ? ACC : MUTED, {anchor:'middle'}));
    els.push(text(cx, 831, lbl, 9, isActive ? ACC : MUTED, {anchor:'middle', fw: isActive ? '600':'400'}));
  });
}

function sectionHeader(els, x, y, title, sub) {
  els.push(text(x, y, title, 17, TEXT, {fw:'700'}));
  if (sub) els.push(text(x, y+18, sub, 11, MUTED, {}));
}

// Ambient gradient orb (simulated with layered soft circles)
function ambientOrb(els, cx, cy, r, color, opacity=0.18) {
  els.push(circle(cx, cy, r,    color, {opacity}));
  els.push(circle(cx, cy, r*0.6, color, {opacity: opacity*0.8}));
  els.push(circle(cx, cy, r*0.3, color, {opacity: opacity*0.6}));
}

// Glassmorphism-style card
function glassCard(els, x, y, w, h, opts={}) {
  const col = opts.color || CARD;
  const rx   = opts.rx !== undefined ? opts.rx : 14;
  const op   = opts.opacity !== undefined ? opts.opacity : 1;
  els.push(rect(x, y, w, h, col, {rx, opacity: op}));
  els.push(rect(x, y, w, h, 'none', {rx, stroke: 'rgba(255,255,255,0.08)', sw:1}));
}

// Mini sparkline
function sparkline(els, x, y, w, h, data, color) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  for (let i = 0; i < data.length - 1; i++) {
    const x1 = x + i * step;
    const y1 = y + h - ((data[i]-min)/range)*h;
    const x2 = x + (i+1)*step;
    const y2 = y + h - ((data[i+1]-min)/range)*h;
    els.push(line(x1,y1,x2,y2,color,{sw:1.5}));
  }
  // dots at last point
  const lx = x + w;
  const ly = y + h - ((data[data.length-1]-min)/range)*h;
  els.push(circle(lx, ly, 3, color, {}));
}

// Bar chart
function miniBarChart(els, x, y, w, h, data, color) {
  const barW = (w / data.length) - 2;
  const max = Math.max(...data);
  data.forEach((val, i) => {
    const bh = (val/max)*h;
    const bx = x + i*(barW+2);
    const by = y + h - bh;
    const rx = 2;
    const op = i === data.length-1 ? 1 : 0.55;
    els.push(rect(bx, by, barW, bh, color, {rx, opacity:op}));
  });
}

// Tag pill
function tag(els, x, y, label, bgColor, textColor) {
  const tw = label.length * 6 + 16;
  els.push(rect(x, y, tw, 20, bgColor, {rx:10}));
  els.push(text(x + tw/2, y+14, label, 9, textColor, {anchor:'middle', fw:'600'}));
  return tw;
}

// Avatar circle
function avatar(els, cx, cy, r, initial, bg) {
  els.push(circle(cx, cy, r, bg, {}));
  els.push(text(cx, cy+5, initial, r*0.8, TEXT, {anchor:'middle', fw:'700'}));
}

// Metric card (bento cell)
function metricCard(els, x, y, w, h, label, value, change, changeUp, sparkData) {
  glassCard(els, x, y, w, h);
  els.push(text(x+14, y+18, label, 9, MUTED, {fw:'500', ls:0.5}));
  els.push(text(x+14, y+40, value, 22, TEXT, {fw:'700'}));
  const chColor = changeUp ? '#4ADE80' : '#F87171';
  const arrow = changeUp ? '▲' : '▼';
  els.push(text(x+14, y+56, `${arrow} ${change}`, 9, chColor, {fw:'600'}));
  if (sparkData) {
    sparkline(els, x+14, y+62, w-28, 26, sparkData, changeUp ? ACC2 : ACC);
  }
}

// ─── Screen 1: Dashboard (Bento Grid) ──────────────────────────────────────

function screen1() {
  const els = [];
  // Background + ambient orbs
  els.push(rect(0,0,W,H,BG));
  ambientOrb(els, 320, 180, 140, ACC, 0.12);
  ambientOrb(els, 60,  380, 110, ACC2, 0.10);
  ambientOrb(els, 200, 600, 100, ACC3, 0.09);

  statusBar(els);

  // App header
  els.push(text(16, 68, 'ORB', 20, ACC, {fw:'800', ls:3}));
  els.push(text(58, 68, '· Intelligence', 13, MUTED, {}));
  // Notification dot
  els.push(circle(364, 62, 16, CARD, {}));
  els.push(rect(364-16, 62-16, 32, 32, CARD, {rx:16, stroke:DIMMED, sw:1}));
  els.push(text(364, 67, '🔔', 12, TEXT, {anchor:'middle'}));
  els.push(circle(374, 52, 5, '#F87171', {}));

  // Date + period selector
  els.push(text(16, 90, 'Apr 12, 2026', 11, MUTED, {}));
  els.push(rect(W-80, 78, 70, 20, CARD2, {rx:10}));
  els.push(text(W-45, 92, 'Last 30d  ▾', 9, ACC, {anchor:'middle', fw:'600'}));

  // Bento row 1: 2 wide metric cards
  metricCard(els, 16, 104, 171, 100, 'TOTAL REACH', '2.4M', '+12.3%', true, [28,32,29,35,38,34,40,44,42,48]);
  metricCard(els, 203, 104, 171, 100, 'ENGAGEMENT', '8.7%', '+1.2pp', true, [6.1,6.8,7.2,6.9,7.5,8.1,7.8,8.4,8.6,8.7]);

  // Bento row 2: 1 tall card + 2 small stacked
  // Tall performance chart card
  glassCard(els, 16, 214, 220, 160);
  els.push(text(30, 232, 'Content Performance', 10, MUTED, {fw:'600', ls:0.3}));
  miniBarChart(els, 30, 242, 192, 80, [45,62,58,71,55,80,75,90,84,95], ACC);
  els.push(line(30,332,208,332,DIMMED,{sw:1}));
  els.push(text(30,345,'Articles','',MUTED));
  const wLabels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun','Mon','Tue','Wed'];
  wLabels.forEach((l,i) => els.push(text(30+i*21,346,l,7,MUTED,{opacity:0.5})));

  // Two small stacked cards
  glassCard(els, 250, 214, 124, 74);
  els.push(text(264, 231, 'TOP CHANNEL', 8, MUTED, {ls:0.5}));
  els.push(text(264, 249, 'Newsletter', 14, TEXT, {fw:'700'}));
  sparkline(els, 264, 253, 96, 24, [20,28,24,35,40,36,44], ACC);
  els.push(text(264, 283, '↑ 18% vs prior period', 8, '#4ADE80', {}));

  glassCard(els, 250, 296, 124, 78);
  els.push(text(264, 313, 'AVG READ TIME', 8, MUTED, {ls:0.5}));
  els.push(text(264, 333, '4m 12s', 16, TEXT, {fw:'700'}));
  els.push(text(264, 349, 'vs 3m 44s prev', 9, MUTED, {}));
  els.push(text(264, 363, '▲ +12%', 9, '#4ADE80', {fw:'600'}));

  // Bento row 3: AI Signals teaser (wide)
  glassCard(els, 16, 384, 358, 88, {color: CARD2});
  els.push(circle(36, 428, 16, 'rgba(167,139,250,0.2)', {}));
  els.push(text(36, 432, '⚡', 12, ACC3, {anchor:'middle'}));
  els.push(text(60, 400, 'AI Signal Detected', 11, ACC3, {fw:'700'}));
  els.push(text(60, 415, '"Remote work content is trending +240%\namong your 25-34 audience this week."', 10, TEXT, {opacity:0.8}));
  els.push(rect(300, 452, 60, 20, 'rgba(167,139,250,0.18)', {rx:10}));
  els.push(text(330, 466, 'Explore →', 9, ACC3, {anchor:'middle', fw:'600'}));

  // Bento row 4: 3 micro stats
  const microItems = [
    {label:'Videos',value:'47',color:ACC},
    {label:'Podcasts',value:'12',color:ACC2},
    {label:'Articles',value:'89',color:'#A78BFA'},
  ];
  microItems.forEach((item, i) => {
    const mx = 16 + i*122;
    glassCard(els, mx, 482, 112, 58);
    els.push(circle(mx+22, 511, 12, `rgba(${item.color==='#E8B999'?'232,185,153':item.color==='#4BADA9'?'75,173,169':'167,139,250'},0.2)`, {}));
    els.push(text(mx+22, 515, '●', 8, item.color, {anchor:'middle'}));
    els.push(text(mx+44, 502, item.value, 18, TEXT, {fw:'700'}));
    els.push(text(mx+44, 517, item.label, 9, MUTED, {}));
  });

  // Bento row 5: Top stories list
  glassCard(els, 16, 550, 358, 110);
  els.push(text(30, 568, 'Top Content Today', 11, TEXT, {fw:'700'}));
  const stories = [
    {title:'"The AI Workspace Revolution"',ch:'Newsletter',reach:'124K',delta:'+8%'},
    {title:'"Q1 Productivity Report"',ch:'Blog',reach:'89K',delta:'+3%'},
    {title:'"Remote First in 2026"',ch:'Video',reach:'72K',delta:'+21%'},
  ];
  stories.forEach((s,i) => {
    const sy = 583 + i*23;
    els.push(text(30, sy, s.title, 9, TEXT, {opacity:0.9}));
    tag(els, 200, sy-11, s.ch, DIMMED, MUTED);
    els.push(text(350, sy, s.reach, 9, ACC, {anchor:'end', fw:'600'}));
    els.push(text(W-16, sy, s.delta, 9, '#4ADE80', {anchor:'end', fw:'600'}));
  });

  navBar(els, 0);

  return { name:'Dashboard', elements: els };
}

// ─── Screen 2: Content Feed ─────────────────────────────────────────────────

function screen2() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  ambientOrb(els, 350, 150, 120, ACC, 0.10);
  ambientOrb(els, 40, 500, 90, ACC2, 0.09);

  statusBar(els);

  // Header
  els.push(text(16, 68, 'Content', 22, TEXT, {fw:'800'}));
  els.push(rect(W-70, 56, 60, 24, CARD2, {rx:12}));
  els.push(text(W-40, 72, '+ New', 10, ACC, {anchor:'middle', fw:'600'}));

  // Filter tabs
  const filters = ['All','Articles','Videos','Podcasts'];
  let fx = 16;
  filters.forEach((f,i) => {
    const active = i===0;
    const tw = f.length*7+20;
    els.push(rect(fx, 84, tw, 22, active ? ACC : CARD, {rx:11}));
    els.push(text(fx+tw/2, 99, f, 9, active ? BG : MUTED, {anchor:'middle', fw: active?'700':'400'}));
    fx += tw+8;
  });

  // Sort bar
  els.push(text(16, 120, 'Sorted by performance  ▾', 10, MUTED, {}));
  els.push(text(W-16, 120, '⊞  ≡', 12, MUTED, {anchor:'end'}));

  // Content cards
  const articles = [
    {title:'The AI Workspace Revolution',  sub:'Published 2h ago · Newsletter', reach:'124,200', eng:'9.2%', time:'5m 40s', status:'Trending', statusColor:'#4ADE80', sparkC:ACC},
    {title:'Q1 Productivity Report 2026',   sub:'Published 1d ago · Blog',       reach:'89,400',  eng:'7.8%', time:'4m 12s', status:'Growing',  statusColor:ACC2,       sparkC:ACC2},
    {title:'Remote First in 2026 (Video)',  sub:'Published 3d ago · YouTube',    reach:'72,100',  eng:'11.4%',time:'8m 33s', status:'Viral',    statusColor:ACC3,       sparkC:ACC3},
    {title:'5 Tools Every Remote Team Needs',sub:'Published 5d ago · Blog',      reach:'48,600',  eng:'6.1%', time:'3m 52s', status:'Stable',   statusColor:MUTED,      sparkC:ACC},
  ];

  let cy = 134;
  articles.forEach(art => {
    glassCard(els, 16, cy, 358, 120);
    // Thumbnail placeholder
    els.push(rect(26, cy+10, 72, 50, CARD2, {rx:8}));
    els.push(circle(62, cy+35, 16, DIMMED, {}));
    els.push(text(62, cy+39, '▶', 10, MUTED2, {anchor:'middle'}));
    // Content
    els.push(text(110, cy+23, art.title, 12, TEXT, {fw:'700'}));
    els.push(text(110, cy+38, art.sub, 9, MUTED, {}));
    // Status tag
    const sw = art.status.length*6+14;
    els.push(rect(110, cy+46, sw, 16, `rgba(${art.statusColor==='#4ADE80'?'74,222,128':art.statusColor===ACC2?'75,173,169':art.statusColor===ACC3?'167,139,250':'232,237,245'},0.15)`, {rx:8}));
    els.push(text(110+sw/2, cy+58, art.status, 8, art.statusColor, {anchor:'middle', fw:'600'}));
    // Metrics row
    els.push(line(26, cy+72, 340, cy+72, DIMMED, {sw:1}));
    els.push(text(26, cy+86, '👁 '+art.reach, 9, MUTED, {}));
    els.push(text(130, cy+86, '💬 '+art.eng, 9, MUTED, {}));
    els.push(text(220, cy+86, '⏱ '+art.time, 9, MUTED, {}));
    // Sparkline
    sparkline(els, 26, cy+93, 200, 20, [20,25,22,35,40,36,44,48,45,52], art.sparkC);
    cy += 130;
  });

  navBar(els, 1);
  return { name:'Content', elements: els };
}

// ─── Screen 3: Audience Intelligence ───────────────────────────────────────

function screen3() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  ambientOrb(els, 300, 200, 150, ACC2, 0.11);
  ambientOrb(els, 80, 600, 120, ACC, 0.09);

  statusBar(els);

  els.push(text(16, 68, 'Audience', 22, TEXT, {fw:'800'}));
  els.push(text(16, 84, '47,820 unique readers this month', 11, MUTED, {}));

  // Key audience stats (bento row)
  const audStats = [
    {label:'Returning',value:'68%',color:ACC},
    {label:'Subscribed',value:'12.4K',color:ACC2},
    {label:'New',value:'6,200',color:ACC3},
  ];
  audStats.forEach((s, i) => {
    const ax = 16 + i*122;
    glassCard(els, ax, 96, 112, 66);
    els.push(text(ax+56, ax-ax+116, s.value, 20, TEXT, {anchor:'middle', fw:'800'}));
    els.push(text(ax+56, ax-ax+132, s.label, 9, s.color, {anchor:'middle', fw:'600'}));
    els.push(rect(ax+18, 148, 76, 4, DIMMED, {rx:2}));
    const barW = i===0?52:i===1?40:28;
    els.push(rect(ax+18, 148, barW, 4, s.color, {rx:2}));
  });

  // Age demographic chart
  glassCard(els, 16, 174, 358, 130);
  els.push(text(30, 193, 'Age Distribution', 11, TEXT, {fw:'700'}));
  const ages = ['18–24','25–34','35–44','45–54','55+'];
  const vals = [18,38,27,12,5];
  ages.forEach((age,i) => {
    const ay = 206 + i*20;
    els.push(text(30, ay+12, age, 9, MUTED, {}));
    els.push(rect(78, ay, 230, 12, DIMMED, {rx:6}));
    const bw = (vals[i]/38)*230;
    const barColor = i===1 ? ACC : i===2 ? ACC2 : MUTED2;
    els.push(rect(78, ay, bw, 12, barColor, {rx:6}));
    els.push(text(315, ay+11, `${vals[i]}%`, 9, i===1?ACC:MUTED, {fw:i===1?'700':'400'}));
  });

  // Top locations
  glassCard(els, 16, 314, 171, 130);
  els.push(text(30, 332, 'Top Locations', 10, TEXT, {fw:'700'}));
  const locs = [
    {name:'United States',pct:42},
    {name:'United Kingdom',pct:18},
    {name:'Canada',pct:11},
    {name:'Australia',pct:8},
  ];
  locs.forEach((loc,i) => {
    const ly = 348 + i*22;
    els.push(text(30, ly, loc.name, 9, TEXT, {}));
    els.push(text(173, ly, `${loc.pct}%`, 9, i===0?ACC:MUTED, {anchor:'end', fw:i===0?'600':'400'}));
    els.push(rect(30, ly+4, 133, 3, DIMMED, {rx:2}));
    els.push(rect(30, ly+4, (loc.pct/42)*133, 3, i===0?ACC:ACC2, {rx:2}));
  });

  // Device split
  glassCard(els, 203, 314, 171, 130);
  els.push(text(217, 332, 'Devices', 10, TEXT, {fw:'700'}));
  // Donut (concentric arcs via circles)
  const dx = 289, dy = 385;
  els.push(circle(dx, dy, 36, DIMMED, {}));
  // Arc segments (simplified as colored circles)
  els.push(circle(dx, dy, 36, 'none', {stroke: ACC, sw:10, opacity:0.9}));
  els.push(circle(dx, dy, 36, 'none', {stroke: ACC2, sw:10, opacity:0.5}));
  els.push(text(dx, dy-4, '61%', 11, TEXT, {anchor:'middle', fw:'700'}));
  els.push(text(dx, dy+9, 'Mobile', 8, MUTED, {anchor:'middle'}));
  els.push(text(217, 400, '📱 Mobile  61%', 9, TEXT, {}));
  els.push(text(217, 414, '💻 Desktop 32%', 9, MUTED, {}));
  els.push(text(217, 428, '📟 Tablet   7%', 9, MUTED, {}));

  // Reading patterns heatmap-style
  glassCard(els, 16, 454, 358, 80);
  els.push(text(30, 472, 'Peak Reading Times', 10, TEXT, {fw:'700'}));
  els.push(text(30, 485, 'Mon–Fri, 8–10am and 12–1pm consistently highest', 9, MUTED, {}));
  // Mini heatmap cells
  const hours = ['6am','8am','10am','12pm','2pm','4pm','6pm','8pm'];
  const heatVals = [0.1,0.8,0.9,0.85,0.5,0.4,0.3,0.6];
  hours.forEach((h,i) => {
    const hx = 30 + i*40;
    const hv = heatVals[i];
    const cellColor = hv > 0.7 ? ACC : hv > 0.4 ? ACC2 : DIMMED;
    els.push(rect(hx, 494, 34, 28, cellColor, {rx:4, opacity:hv}));
    els.push(text(hx+17, 515, h, 7, TEXT, {anchor:'middle', opacity:0.6}));
  });

  // Interests
  glassCard(els, 16, 544, 358, 72);
  els.push(text(30, 562, 'Reader Interests', 10, TEXT, {fw:'700'}));
  const interests = ['Remote Work','AI Tools','Productivity','Leadership','Finance','Tech News'];
  let ix = 30;
  interests.forEach(int => {
    const tw = int.length*6+16;
    els.push(rect(ix, 572, tw, 20, DIMMED, {rx:10}));
    els.push(text(ix+tw/2, 585, int, 8, TEXT, {anchor:'middle', opacity:0.8}));
    ix += tw+8;
    if (ix > 330) ix = 30;
  });

  navBar(els, 2);
  return { name:'Audience', elements: els };
}

// ─── Screen 4: AI Signals ───────────────────────────────────────────────────

function screen4() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  ambientOrb(els, 250, 150, 160, ACC3, 0.12);
  ambientOrb(els, 100, 450, 100, ACC, 0.09);

  statusBar(els);

  // Header
  els.push(text(16, 66, '⚡', 16, ACC3, {}));
  els.push(text(38, 68, 'AI Signals', 22, TEXT, {fw:'800'}));
  els.push(text(16, 84, 'Opportunities detected by ORB Intelligence', 10, MUTED, {}));

  // Alert banner
  els.push(rect(16, 96, 358, 44, 'rgba(167,139,250,0.12)', {rx:12, stroke:'rgba(167,139,250,0.3)',sw:1}));
  els.push(text(30, 112, '⚡ 3 new signals since yesterday', 11, ACC3, {fw:'600'}));
  els.push(text(30, 127, 'Your audience is responding differently to AI content this week', 9, TEXT, {opacity:0.8}));

  // Signal cards
  const signals = [
    {
      icon:'🔥', tag:'TRENDING', tagColor:'#F87171',
      title:'Remote work content +240%',
      body:'Your 25–34 cohort is 3x more likely to engage with remote work articles this week vs last month. Consider creating a series.',
      action:'Create Content',
      confidence:'94%', confColor:ACC,
    },
    {
      icon:'📉', tag:'RISK', tagColor:'#FBBF24',
      title:'Newsletter open rate declining',
      body:'Open rates dropped 8% over 14 days, correlating with Monday sends. Experiment suggests Thursday 9am may outperform.',
      action:'A/B Test',
      confidence:'87%', confColor:'#FBBF24',
    },
    {
      icon:'🎯', tag:'OPPORTUNITY', tagColor:ACC2,
      title:'Video > Article for finance topics',
      body:'Finance articles avg 3.2min read. Equivalent videos avg 9.1min watch. Repurpose your Q1 Report as a short-form series.',
      action:'View Analysis',
      confidence:'91%', confColor:ACC2,
    },
    {
      icon:'📊', tag:'INSIGHT', tagColor:'#A78BFA',
      title:'Optimal article length is shifting',
      body:'Content between 800–1,200 words outperforms longer deep-dives by 34% in shares. Your current avg is 2,400 words.',
      action:'See Data',
      confidence:'78%', confColor:ACC3,
    },
  ];

  let sy = 150;
  signals.forEach(sig => {
    const cardH = 120;
    glassCard(els, 16, sy, 358, cardH, {color: CARD2});
    // Icon + tag
    els.push(text(30, sy+22, sig.icon, 16, TEXT, {}));
    const tagW = sig.tag.length*6+14;
    els.push(rect(52, sy+10, tagW, 16, `rgba(${sig.tagColor==='#F87171'?'248,113,113':sig.tagColor==='#FBBF24'?'251,191,36':sig.tagColor===ACC2?'75,173,169':'167,139,250'},0.2)`, {rx:8}));
    els.push(text(52+tagW/2, sy+22, sig.tag, 8, sig.tagColor, {anchor:'middle', fw:'700'}));
    // Confidence
    els.push(text(370, sy+22, `${sig.confidence} conf.`, 8, sig.confColor, {anchor:'end', fw:'600'}));
    // Title + body
    els.push(text(30, sy+40, sig.title, 12, TEXT, {fw:'700'}));
    els.push(text(30, sy+55, sig.body.slice(0,60)+'…', 9, MUTED, {}));
    // Action button
    const aw = sig.action.length*7+20;
    els.push(rect(30, sy+70, aw, 22, 'rgba(255,255,255,0.06)', {rx:11, stroke:'rgba(255,255,255,0.1)',sw:1}));
    els.push(text(30+aw/2, sy+85, sig.action+' →', 9, TEXT, {anchor:'middle', fw:'600'}));
    // Separator line (mini divider)
    els.push(line(30, sy+98, 360, sy+98, DIMMED, {sw:1}));
    // Confidence bar
    els.push(rect(30, sy+103, 300, 3, DIMMED, {rx:2}));
    els.push(rect(30, sy+103, (parseFloat(sig.confidence)/100)*300, 3, sig.confColor, {rx:2, opacity:0.7}));
    sy += cardH+10;
  });

  navBar(els, 3);
  return { name:'Signals', elements: els };
}

// ─── Screen 5: Publish / Distribution ──────────────────────────────────────

function screen5() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  ambientOrb(els, 350, 250, 130, ACC, 0.10);
  ambientOrb(els, 50, 600, 100, ACC3, 0.08);

  statusBar(els);

  els.push(text(16, 68, 'Distribute', 22, TEXT, {fw:'800'}));
  els.push(text(16, 84, 'Schedule · Publish · Track', 10, MUTED, {}));

  // Week calendar strip
  els.push(text(16, 104, '← April 2026 →', 11, MUTED, {fw:'500'}));
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const dates = ['6','7','8','9','10','11','12'];
  const hasEvent = [true, false, true, true, false, false, true];
  days.forEach((d,i) => {
    const dx = 16 + i*53;
    const isToday = i===6;
    els.push(rect(dx, 113, 44, 48, isToday ? 'rgba(232,185,153,0.15)' : CARD, {rx:10, stroke: isToday?ACC:'transparent', sw:isToday?1.5:0}));
    els.push(text(dx+22, 128, d, 8, MUTED, {anchor:'middle'}));
    els.push(text(dx+22, 145, dates[i], 14, isToday?ACC:TEXT, {anchor:'middle', fw:isToday?'800':'400'}));
    if (hasEvent[i]) {
      els.push(circle(dx+22, 157, 3, isToday?ACC:ACC2, {}));
    }
  });

  // Scheduled items
  els.push(text(16, 178, "Today's Schedule", 13, TEXT, {fw:'700'}));
  const schedItems = [
    {time:'8:00am',  title:'Morning Briefing Email', ch:'📧 Newsletter', status:'Sending', color:ACC},
    {time:'12:00pm', title:'AI Tools Round-up Article', ch:'🖊 Blog', status:'Scheduled', color:ACC2},
    {time:'3:00pm',  title:'Remote Work Podcast Ep.14', ch:'🎙 Podcast', status:'Draft', color:MUTED},
    {time:'6:00pm',  title:'Q1 Recap Video (Short)', ch:'▶ YouTube', status:'Scheduled', color:ACC2},
  ];
  let scy = 192;
  schedItems.forEach(item => {
    glassCard(els, 16, scy, 358, 66);
    els.push(text(30, scy+18, item.time, 9, MUTED, {fw:'500'}));
    els.push(line(80, scy+8, 80, scy+58, DIMMED, {sw:1}));
    els.push(text(92, scy+22, item.title, 12, TEXT, {fw:'600'}));
    els.push(text(92, scy+37, item.ch, 9, MUTED, {}));
    // Status chip
    const sw = item.status.length*6+14;
    const sc = item.status === 'Sending' ? '#FBBF24' : item.status === 'Scheduled' ? '#4ADE80' : MUTED;
    els.push(rect(W-sw-22, scy+14, sw, 18, `rgba(${sc==='#FBBF24'?'251,191,36':sc==='#4ADE80'?'74,222,128':'200,200,200'},0.15)`, {rx:9}));
    els.push(text(W-sw/2-22, scy+27, item.status, 8, sc, {anchor:'middle', fw:'600'}));
    // Progress bar for sending
    if (item.status === 'Sending') {
      els.push(rect(92, scy+46, 200, 3, DIMMED, {rx:2}));
      els.push(rect(92, scy+46, 140, 3, ACC, {rx:2}));
      els.push(text(298, scy+50, '70% sent', 7, ACC, {}));
    }
    scy += 76;
  });

  // Channel health
  glassCard(els, 16, scy+4, 358, 94);
  els.push(text(30, scy+22, 'Channel Health', 11, TEXT, {fw:'700'}));
  const channels = [
    {name:'Newsletter',score:94,color:ACC},
    {name:'Blog',score:87,color:ACC2},
    {name:'YouTube',score:72,color:ACC3},
    {name:'Podcast',score:61,color:MUTED2},
  ];
  channels.forEach((ch,i) => {
    const cx = 30 + i*86;
    els.push(text(cx, scy+38, `${ch.score}`, 16, TEXT, {fw:'700'}));
    els.push(text(cx, scy+52, ch.name, 8, MUTED, {}));
    els.push(rect(cx, scy+58, 60, 4, DIMMED, {rx:2}));
    els.push(rect(cx, scy+58, (ch.score/100)*60, 4, ch.color, {rx:2}));
  });

  navBar(els, 4);
  return { name:'Distribute', elements: els };
}

// ─── Screen 6: Settings / Team ──────────────────────────────────────────────

function screen6() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  ambientOrb(els, 300, 300, 140, ACC2, 0.08);

  statusBar(els);

  // Profile header
  els.push(text(16, 68, 'Settings', 22, TEXT, {fw:'800'}));

  // User card
  glassCard(els, 16, 84, 358, 80, {color: CARD2});
  avatar(els, 56, 124, 28, 'R', ACC);
  els.push(text(96, 115, 'Rakis', 15, TEXT, {fw:'700'}));
  els.push(text(96, 131, 'rakis@orbintelligence.io', 10, MUTED, {}));
  els.push(text(96, 145, 'Pro Plan  ·  14 days left', 9, ACC, {fw:'600'}));
  els.push(rect(W-70, 104, 58, 22, ACC, {rx:11}));
  els.push(text(W-41, 119, 'Upgrade', 9, BG, {anchor:'middle', fw:'700'}));

  // Integrations
  els.push(text(16, 182, 'Connected Channels', 12, TEXT, {fw:'700'}));
  const integrations = [
    {name:'Mailchimp Newsletter', icon:'📧', status:'Connected', color:'#4ADE80'},
    {name:'WordPress Blog',       icon:'🖊', status:'Connected', color:'#4ADE80'},
    {name:'YouTube Channel',      icon:'▶', status:'Connected', color:'#4ADE80'},
    {name:'Spotify Podcasts',     icon:'🎙', status:'Connect →', color:MUTED},
    {name:'X / Twitter',          icon:'✗', status:'Connect →', color:MUTED},
  ];
  let iy = 196;
  integrations.forEach(intg => {
    glassCard(els, 16, iy, 358, 46);
    els.push(text(32, iy+27, intg.icon, 14, TEXT, {}));
    els.push(text(56, iy+22, intg.name, 11, TEXT, {fw:'500'}));
    els.push(text(W-20, iy+22, intg.status, 9, intg.color, {anchor:'end', fw:'600'}));
    iy += 54;
  });

  // Preferences section
  els.push(text(16, iy+4, 'Preferences', 12, TEXT, {fw:'700'}));
  const prefs = [
    {label:'AI Signal notifications', on:true},
    {label:'Weekly digest email',      on:true},
    {label:'Real-time alerts',         on:false},
  ];
  prefs.forEach(p => {
    iy += 14;
    glassCard(els, 16, iy, 358, 38);
    els.push(text(30, iy+23, p.label, 11, TEXT, {}));
    // Toggle
    els.push(rect(W-54, iy+11, 40, 18, p.on ? ACC : DIMMED, {rx:9}));
    els.push(circle(p.on ? W-22 : W-42, iy+20, 7, p.on ? BG : MUTED2, {}));
    iy += 46;
  });

  navBar(els, 0);
  return { name:'Settings', elements: els };
}

// ─── Assemble ───────────────────────────────────────────────────────────────

const screens = [screen1(), screen2(), screen3(), screen4(), screen5(), screen6()];

screens.forEach(s => {
  s.svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"></svg>`;
});

const pen = {
  version: '2.8',
  metadata: {
    name:      'ORB — AI Media Intelligence',
    author:    'RAM',
    date:      new Date().toISOString().split('T')[0],
    theme:     'dark',
    heartbeat: 499,
    elements:  totalElements,
    palette: {
      bg:      BG,
      surface: SURF,
      card:    CARD,
      accent:  ACC,
      accent2: ACC2,
      accent3: ACC3,
      text:    TEXT,
    },
    inspiration: [
      'darkmodedesign.com — Analytics SaaS palette (#14181e, #e4b999, #4bada9)',
      'saaspo.com — Bento grid layouts in AI-native SaaS (219 AI SaaS examples)',
    ],
    challenge: 'AI media intelligence dashboard with bento grid, glassmorphism cards, ambient gradient orbs, and warm amber/teal palette on near-black — pushing the bento layout pattern and glassmorphism in a mobile-first design.',
  },
  screens: screens.map(s => ({
    name:     s.name,
    svg:      s.svg,
    elements: s.elements,
  })),
};

fs.writeFileSync(path.join(__dirname, 'orb.pen'), JSON.stringify(pen, null, 2));
console.log(`ORB — AI Media Intelligence: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: orb.pen`);
