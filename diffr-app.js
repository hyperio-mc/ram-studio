'use strict';
const fs = require('fs'), path = require('path');

const SLUG = 'diffr';
const NAME = 'DIFFR';
const TAGLINE = 'AI code review at terminal speed';
const HEARTBEAT = 393;

// Palette — pure black terminal + electric chartreuse, inspired by Overrrides on Godly.website
const BG    = '#030303';
const SURF  = '#0A0A0A';
const CARD  = '#101010';
const CARD2 = '#161616';
const ACC   = '#C8FF00';   // electric chartreuse / neon lime
const ACC2  = '#00FF94';   // neon mint
const ACC3  = '#FF3621';   // error red (from Neon.com)
const TEXT  = '#E8E8E8';
const TEXT2 = '#909090';
const TEXT3 = '#555555';
const BORD  = '#1E1E1E';
const W = 390, H = 844;

let elCount = 0;
function rect(x,y,w,h,fill,opts={}) {
  elCount++;
  return { type:'rect', x, y, width:w, height:h, fill, ...opts };
}
function text(x,y,content,size,fill,opts={}) {
  elCount++;
  return {
    type:'text', x, y, content, fontSize:size, fill,
    fontFamily: opts.font || 'monospace',
    fontWeight: opts.fw || 400,
    textAnchor: opts.anchor || 'start',
    letterSpacing: opts.ls !== undefined ? opts.ls : 0.5,
    opacity: opts.opacity || 1,
    ...opts
  };
}
function circle(cx,cy,r,fill,opts={}) {
  elCount++;
  return { type:'circle', cx, cy, r, fill, ...opts };
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  elCount++;
  return { type:'line', x1, y1, x2, y2, stroke, strokeWidth: opts.sw || 1, opacity: opts.opacity || 1 };
}

const screens = [];

// ─────────────────────────────────────────────
// SCREEN 1: DASHBOARD
// ─────────────────────────────────────────────
(function buildDashboard() {
  const el = [];
  // BG
  el.push(rect(0,0,W,H,BG));

  // Top bar — terminal prompt style
  el.push(rect(0,0,W,52,SURF));
  el.push(line(0,52,W,52,BORD,{sw:1}));
  // Prompt cursor
  el.push(text(16,32,'~/diffr',11,ACC,{fw:700,ls:1}));
  el.push(text(80,32,'main',11,TEXT3,{ls:0.5}));
  // status dots
  el.push(circle(W-48,26,5,ACC3,{opacity:0.9}));
  el.push(circle(W-32,26,5,'#F59E0B',{opacity:0.9}));
  el.push(circle(W-16,26,5,ACC2,{opacity:0.9}));

  // Hero stat block
  el.push(rect(0,52,W,130,SURF));
  el.push(text(16,90,'REVIEWS_PENDING',9,TEXT3,{ls:2}));
  el.push(text(16,128,'24',52,ACC,{fw:700,ls:-1,font:'monospace'}));
  el.push(text(85,128,' / 61',22,TEXT3,{fw:400,ls:0}));
  el.push(text(W-16,90,'↑ 12%',11,ACC2,{anchor:'end',fw:700}));
  el.push(text(W-16,110,'vs last week',9,TEXT3,{anchor:'end'}));
  // mini bar chart in corner
  const barData = [0.4,0.6,0.5,0.8,0.7,0.9,1.0];
  barData.forEach((v,i) => {
    const bh = Math.round(v*28);
    el.push(rect(W-80+(i*10),165-bh,7,bh, i===6 ? ACC : CARD2));
  });
  el.push(line(0,182,W,182,BORD,{sw:1}));

  // 3-stat row
  const stats = [
    { label:'MERGED', val:'37', sub:'this week', color:ACC2 },
    { label:'BLOCKED', val:'8',  sub:'needs action', color:ACC3 },
    { label:'AVG_TIME', val:'1.4h', sub:'to review', color:TEXT2 },
  ];
  stats.forEach((s,i) => {
    const sx = 13 + i*(W/3);
    el.push(text(sx, 206, s.label, 8, TEXT3, {ls:1.5}));
    el.push(text(sx, 228, s.val,  20, s.color, {fw:700}));
    el.push(text(sx, 244, s.sub,   9, TEXT3));
    if (i < 2) el.push(line(sx + (W/3)-16, 192, sx + (W/3)-16, 255, BORD,{sw:1}));
  });
  el.push(line(0,255,W,255,BORD,{sw:1}));

  // PR Queue header
  el.push(text(16,278,'OPEN_REVIEWS',9,TEXT3,{ls:2}));
  el.push(text(W-16,278,'view all →',9,ACC,{anchor:'end',ls:0.5}));

  // PR items
  const prs = [
    { id:'#2847', title:'feat: streaming response handler', author:'@kira',  time:'14m', status:'AI_READY',  statusColor:ACC  },
    { id:'#2846', title:'fix: race condition in queue pool',  author:'@tom',   time:'1h',  status:'REVIEWING', statusColor:ACC2 },
    { id:'#2845', title:'refactor: auth middleware cleanup',  author:'@priya', time:'3h',  status:'BLOCKED',   statusColor:ACC3 },
    { id:'#2844', title:'chore: update dep lockfile',         author:'@dev',   time:'6h',  status:'APPROVED',  statusColor:TEXT3 },
  ];
  prs.forEach((pr,i) => {
    const py = 296 + i*84;
    el.push(rect(0,py,W,80,i%2===0 ? CARD : SURF));
    el.push(line(0,py,W,py,BORD,{sw:1}));
    // left accent bar
    el.push(rect(0,py,3,80,pr.statusColor,{opacity:pr.status==='BLOCKED'?1:0.6}));
    // PR id + author
    el.push(text(14,py+20,pr.id,10,pr.statusColor,{fw:700,ls:0.5}));
    el.push(text(14,py+36,pr.title,11,TEXT,{fw:400}));
    el.push(text(14,py+54,pr.author,9,TEXT3));
    el.push(text(14+50,py+54,pr.time,9,TEXT3));
    // status badge
    el.push(rect(W-90,py+18,80,20,CARD2,{rx:2}));
    el.push(text(W-50,py+32,pr.status,8,pr.statusColor,{anchor:'middle',fw:700,ls:1}));
  });
  el.push(line(0,632,W,632,BORD,{sw:1}));

  // Nav bar
  el.push(rect(0,H-80,W,80,SURF));
  el.push(line(0,H-80,W,H-80,BORD,{sw:1}));
  const navItems = [
    {label:'DASH', icon:'▪', active:true},
    {label:'REVIEWS', icon:'◈', active:false},
    {label:'DIFF', icon:'≡', active:false},
    {label:'FEED', icon:'◉', active:false},
  ];
  navItems.forEach((n,i) => {
    const nx = (W/4)*i + W/8;
    el.push(text(nx, H-50, n.icon, 18, n.active ? ACC : TEXT3, {anchor:'middle',ls:0}));
    el.push(text(nx, H-26, n.label, 8, n.active ? ACC : TEXT3, {anchor:'middle',ls:1.5}));
    if (n.active) el.push(rect(nx-16,H-80,32,2,ACC));
  });

  screens.push({ name:'Dashboard', svg:'', elements:el });
})();

// ─────────────────────────────────────────────
// SCREEN 2: DIFF VIEW
// ─────────────────────────────────────────────
(function buildDiff() {
  const el = [];
  el.push(rect(0,0,W,H,BG));

  // Header
  el.push(rect(0,0,W,52,SURF));
  el.push(line(0,52,W,52,BORD,{sw:1}));
  el.push(text(16,32,'← #2847',11,TEXT2,{ls:0.5}));
  el.push(text(W/2,32,'DIFF_VIEW',11,ACC,{anchor:'middle',fw:700,ls:2}));
  el.push(rect(W-58,14,44,24,CARD2,{rx:2}));
  el.push(text(W-36,30,'FILES',8,ACC2,{anchor:'middle',fw:700,ls:1}));

  // PR title section
  el.push(rect(0,52,W,74,SURF));
  el.push(text(16,78,'feat: streaming response handler',12,TEXT,{fw:700}));
  el.push(text(16,98,'@kira → main',10,TEXT3,{ls:0.5}));
  el.push(rect(W-100,65,86,22,CARD,{rx:2}));
  el.push(text(W-57,80,'AI_READY',9,ACC,{anchor:'middle',fw:700,ls:1}));
  el.push(line(0,126,W,126,BORD,{sw:1}));

  // File tabs
  el.push(rect(0,126,W,36,CARD));
  el.push(text(16,150,'handler.ts',10,ACC,{fw:700}));
  el.push(rect(8,162,72,2,ACC));
  el.push(text(100,150,'queue.ts',10,TEXT3));
  el.push(text(174,150,'types.ts',10,TEXT3));
  el.push(text(W-16,150,'+3 more',9,TEXT3,{anchor:'end'}));
  el.push(line(0,164,W,164,BORD,{sw:1}));

  // Diff header line numbers
  el.push(rect(0,164,32,H-244,TEXT3,{opacity:0.05}));
  el.push(line(32,164,32,H-80,BORD,{sw:1}));

  // Code diff lines — alternating additions/removals/context
  const codeLines = [
    { num:'42', type:'ctx', code:'async function handleStream(opts: StreamOpts) {' },
    { num:'43', type:'ctx', code:'  const { endpoint, timeout = 5000 } = opts;' },
    { num:'-',  type:'del', code:'-  const resp = await fetch(endpoint);' },
    { num:'-',  type:'del', code:'-  return resp.json();' },
    { num:'+',  type:'add', code:'+  const ctrl = new AbortController();' },
    { num:'+',  type:'add', code:'+  const timer = setTimeout(() => ctrl.abort(), timeout);' },
    { num:'+',  type:'add', code:'+  try {' },
    { num:'+',  type:'add', code:'+    const resp = await fetch(endpoint, {' },
    { num:'+',  type:'add', code:'+      signal: ctrl.signal,' },
    { num:'+',  type:'add', code:'+    });' },
    { num:'+',  type:'add', code:'+    clearTimeout(timer);' },
    { num:'+',  type:'add', code:'+    for await (const chunk of resp.body) {' },
    { num:'+',  type:'add', code:'+      yield chunk;' },
    { num:'+',  type:'add', code:'+    }' },
    { num:'56', type:'ctx', code:'  } catch(e) { throw new StreamError(e); }' },
    { num:'57', type:'ctx', code:'}' },
  ];

  codeLines.forEach((l,i) => {
    const ly = 168 + i*32;
    const lineBg = l.type==='add' ? '#0A1F0A' : l.type==='del' ? '#1F0A0A' : BG;
    el.push(rect(0,ly,W,30,lineBg));
    // line number
    el.push(text(4,ly+20,l.num,8,TEXT3,{ls:0,font:'monospace'}));
    // color bar
    if (l.type==='add') el.push(rect(32,ly,3,30,ACC2,{opacity:0.8}));
    if (l.type==='del') el.push(rect(32,ly,3,30,ACC3,{opacity:0.8}));
    // code text (truncated to fit)
    const code = l.code.length > 38 ? l.code.slice(0,36)+'…' : l.code;
    const codeColor = l.type==='add' ? ACC2 : l.type==='del' ? '#FF8070' : TEXT;
    el.push(text(38,ly+20,code,9.5,codeColor,{font:'monospace',ls:0,opacity:l.type==='ctx'?0.7:1}));
  });

  // AI comment bubble at line 48
  el.push(rect(8,388,W-16,64,CARD2,{rx:3}));
  el.push(rect(8,388,3,64,ACC,{rx:2}));
  el.push(text(20,404,'AI',8,ACC,{fw:700,ls:1}));
  el.push(text(40,404,'Consider adding error recovery for partial streams',9,TEXT));
  el.push(text(20,420,'Timeout handling looks solid — add a retry limit',9,TEXT2,{ls:0}));
  el.push(text(20,438,'and the abort pattern will be production-ready.',9,TEXT2,{ls:0}));
  el.push(text(W-20,450,'✓ Apply fix',9,ACC,{anchor:'end',fw:700}));

  // Bottom nav
  el.push(rect(0,H-80,W,80,SURF));
  el.push(line(0,H-80,W,H-80,BORD,{sw:1}));
  const navItems2 = [
    {label:'DASH', icon:'▪', active:false},
    {label:'REVIEWS', icon:'◈', active:false},
    {label:'DIFF', icon:'≡', active:true},
    {label:'FEED', icon:'◉', active:false},
  ];
  navItems2.forEach((n,i) => {
    const nx = (W/4)*i + W/8;
    el.push(text(nx, H-50, n.icon, 18, n.active ? ACC : TEXT3, {anchor:'middle',ls:0}));
    el.push(text(nx, H-26, n.label, 8, n.active ? ACC : TEXT3, {anchor:'middle',ls:1.5}));
    if (n.active) el.push(rect(nx-16,H-80,32,2,ACC));
  });

  screens.push({ name:'Diff View', svg:'', elements:el });
})();

// ─────────────────────────────────────────────
// SCREEN 3: AI INSIGHTS
// ─────────────────────────────────────────────
(function buildInsights() {
  const el = [];
  el.push(rect(0,0,W,H,BG));

  // Header
  el.push(rect(0,0,W,52,SURF));
  el.push(line(0,52,W,52,BORD,{sw:1}));
  el.push(text(16,32,'← #2847',11,TEXT2,{ls:0.5}));
  el.push(text(W/2,32,'AI_INSIGHTS',11,ACC,{anchor:'middle',fw:700,ls:2}));
  el.push(rect(W-64,14,50,24,CARD2,{rx:2}));
  el.push(text(W-39,30,'EXPORT',8,TEXT2,{anchor:'middle',fw:700,ls:1}));

  // AI confidence score
  el.push(rect(0,52,W,120,SURF));
  el.push(text(16,78,'CONFIDENCE_SCORE',9,TEXT3,{ls:2}));
  el.push(text(16,116,'94',44,ACC,{fw:700}));
  el.push(text(62,116,'%',22,ACC2,{fw:700}));
  el.push(text(16,136,'High confidence — safe to merge',11,TEXT2));
  // score ring visualization (simplified arc segments)
  const cx=W-70, cy=100, r=36;
  el.push(circle(cx,cy,r,CARD,{stroke:BORD,strokeWidth:2}));
  // filled arc approximation: stacked thin rects forming a ring
  for(let a=0;a<340;a+=5){
    const rad = (a-90)*Math.PI/180;
    const x1 = cx + (r-6)*Math.cos(rad);
    const y1 = cy + (r-6)*Math.sin(rad);
    el.push(circle(x1,y1,2, a<316 ? ACC : CARD2, {opacity: a<316?0.9:0.3}));
  }
  el.push(text(cx,cy+4,'94%',10,ACC,{anchor:'middle',fw:700}));
  el.push(line(0,172,W,172,BORD,{sw:1}));

  // Issue breakdown
  el.push(text(16,194,'ISSUE_BREAKDOWN',9,TEXT3,{ls:2}));
  const issues = [
    { label:'Critical',   count:0, bar:0,   color:ACC3 },
    { label:'Warning',    count:2, bar:0.25, color:'#F59E0B' },
    { label:'Suggestion', count:7, bar:0.7,  color:ACC  },
    { label:'Info',       count:3, bar:0.3,  color:ACC2 },
  ];
  issues.forEach((iss,i) => {
    const iy = 210 + i*46;
    el.push(rect(16,iy,280,8,CARD,{rx:4}));
    if(iss.bar>0) el.push(rect(16,iy,Math.round(280*iss.bar),8,iss.color,{rx:4,opacity:0.85}));
    el.push(text(16,iy-4,iss.label,9,TEXT2));
    el.push(text(W-16,iy-4,String(iss.count),9,iss.color,{anchor:'end',fw:700}));
  });
  el.push(line(0,408,W,408,BORD,{sw:1}));

  // Top AI suggestions
  el.push(text(16,428,'TOP_SUGGESTIONS',9,TEXT3,{ls:2}));
  const suggs = [
    { tag:'PERF',   text:'Add memoization to getStreamChunks()',    severity: ACC  },
    { tag:'STYLE',  text:'Prefer named exports for tree-shaking',    severity: TEXT2},
    { tag:'SEC',    text:'Validate origin before echoing back',       severity:'#F59E0B'},
    { tag:'LOGIC',  text:'Edge case: empty stream returns undefined', severity:ACC  },
  ];
  suggs.forEach((s,i) => {
    const sy = 448 + i*68;
    el.push(rect(16,sy,W-32,60,CARD,{rx:3}));
    el.push(rect(16,sy,3,60,s.severity,{rx:2}));
    el.push(rect(24,sy+10,38,16,CARD2,{rx:2}));
    el.push(text(43,sy+22,s.tag,7,s.severity,{anchor:'middle',fw:700,ls:1}));
    el.push(text(72,sy+22,s.text,9.5,TEXT,{fw:400}));
    el.push(text(24,sy+42,'View in diff →',9,s.severity,{ls:0.5}));
  });

  // Bottom nav
  el.push(rect(0,H-80,W,80,SURF));
  el.push(line(0,H-80,W,H-80,BORD,{sw:1}));
  [
    {label:'DASH', icon:'▪', active:false},
    {label:'REVIEWS', icon:'◈', active:true},
    {label:'DIFF', icon:'≡', active:false},
    {label:'FEED', icon:'◉', active:false},
  ].forEach((n,i) => {
    const nx = (W/4)*i + W/8;
    el.push(text(nx, H-50, n.icon, 18, n.active ? ACC : TEXT3, {anchor:'middle',ls:0}));
    el.push(text(nx, H-26, n.label, 8, n.active ? ACC : TEXT3, {anchor:'middle',ls:1.5}));
    if (n.active) el.push(rect(nx-16,H-80,32,2,ACC));
  });

  screens.push({ name:'AI Insights', svg:'', elements:el });
})();

// ─────────────────────────────────────────────
// SCREEN 4: REVIEW QUEUE
// ─────────────────────────────────────────────
(function buildQueue() {
  const el = [];
  el.push(rect(0,0,W,H,BG));

  // Header
  el.push(rect(0,0,W,52,SURF));
  el.push(line(0,52,W,52,BORD,{sw:1}));
  el.push(text(W/2,32,'REVIEW_QUEUE',11,ACC,{anchor:'middle',fw:700,ls:2}));
  el.push(rect(W-42,14,30,24,CARD2,{rx:2}));
  el.push(text(W-27,30,'24',11,ACC3,{anchor:'middle',fw:700}));

  // Filter tabs
  el.push(rect(0,52,W,40,CARD));
  const filters = ['ALL','MINE','AI_READY','BLOCKED'];
  filters.forEach((f,i) => {
    const fx = 8 + i*92;
    el.push(rect(fx,58,84,28, i===0 ? CARD2 : 'transparent',{rx:2}));
    el.push(text(fx+42,77,f,8,i===0?ACC:TEXT3,{anchor:'middle',fw:i===0?700:400,ls:1}));
  });
  el.push(line(0,92,W,92,BORD,{sw:1}));

  // Sort/search row
  el.push(rect(0,92,W,40,SURF));
  el.push(rect(12,100,200,24,CARD,{rx:2}));
  el.push(text(20,116,'_',10,ACC,{fw:700}));  // cursor blink
  el.push(text(28,116,'search reviews...',10,TEXT3));
  el.push(rect(W-70,100,56,24,CARD,{rx:2}));
  el.push(text(W-42,116,'SORT ↑',8,TEXT2,{anchor:'middle',fw:700,ls:1}));
  el.push(line(0,132,W,132,BORD,{sw:1}));

  // PR list items
  const queue = [
    { id:'#2847', repo:'api-core',   title:'feat: streaming response handler',    author:'kira',  age:'14m', files:7,  adds:143, dels:12, status:'AI_READY',  sc:ACC,  priority:'HIGH' },
    { id:'#2846', repo:'api-core',   title:'fix: race condition in queue pool',    author:'tom',   age:'1h',  files:3,  adds:28,  dels:45, status:'REVIEWING', sc:ACC2, priority:'CRIT' },
    { id:'#2845', repo:'auth-svc',   title:'refactor: auth middleware cleanup',    author:'priya', age:'3h',  files:12, adds:290, dels:187,status:'BLOCKED',   sc:ACC3, priority:'MED'  },
    { id:'#2843', repo:'dashboard',  title:'chore: dependency lockfile update',    author:'bot',   age:'8h',  files:1,  adds:12,  dels:12, status:'APPROVED',  sc:TEXT3,priority:'LOW'  },
    { id:'#2841', repo:'infra',      title:'feat: auto-scaling policy for prod',   author:'ops',   age:'1d',  files:5,  adds:67,  dels:23, status:'AI_READY',  sc:ACC,  priority:'HIGH' },
  ];
  queue.forEach((pr,i) => {
    const qy = 136 + i*94;
    el.push(rect(0,qy,W,90,i%2===0?CARD:SURF));
    el.push(line(0,qy,W,qy,BORD,{sw:1}));
    // priority left stripe
    const priColor = pr.priority==='CRIT'?ACC3:pr.priority==='HIGH'?'#F59E0B':pr.priority==='MED'?ACC2:TEXT3;
    el.push(rect(0,qy,3,90,priColor,{opacity:0.9}));
    // top row
    el.push(text(14,qy+20,pr.id,10,pr.sc,{fw:700,ls:0.5}));
    el.push(text(60,qy+20,pr.repo,10,TEXT3,{ls:0.5}));
    el.push(text(W-14,qy+20,pr.age,9,TEXT3,{anchor:'end'}));
    // title
    const t = pr.title.length>40?pr.title.slice(0,38)+'…':pr.title;
    el.push(text(14,qy+38,t,10.5,TEXT,{fw:400}));
    // meta row
    el.push(text(14,qy+56,'@'+pr.author,9,TEXT3));
    el.push(text(72,qy+56,pr.files+' files',9,TEXT3));
    el.push(text(118,qy+56,'+'+pr.adds,9,ACC2,{fw:700}));
    el.push(text(148,qy+56,'-'+pr.dels,9,ACC3,{fw:700}));
    // status pill
    el.push(rect(W-90,qy+42,78,20,CARD2,{rx:2}));
    el.push(text(W-51,qy+55,pr.status,7,pr.sc,{anchor:'middle',fw:700,ls:1}));
  });

  // Bottom nav
  el.push(rect(0,H-80,W,80,SURF));
  el.push(line(0,H-80,W,H-80,BORD,{sw:1}));
  [
    {label:'DASH', icon:'▪', active:false},
    {label:'REVIEWS', icon:'◈', active:true},
    {label:'DIFF', icon:'≡', active:false},
    {label:'FEED', icon:'◉', active:false},
  ].forEach((n,i) => {
    const nx = (W/4)*i + W/8;
    el.push(text(nx, H-50, n.icon, 18, n.active ? ACC : TEXT3, {anchor:'middle',ls:0}));
    el.push(text(nx, H-26, n.label, 8, n.active ? ACC : TEXT3, {anchor:'middle',ls:1.5}));
    if (n.active) el.push(rect(nx-16,H-80,32,2,ACC));
  });

  screens.push({ name:'Review Queue', svg:'', elements:el });
})();

// ─────────────────────────────────────────────
// SCREEN 5: TEAM FEED
// ─────────────────────────────────────────────
(function buildFeed() {
  const el = [];
  el.push(rect(0,0,W,H,BG));

  // Header
  el.push(rect(0,0,W,52,SURF));
  el.push(line(0,52,W,52,BORD,{sw:1}));
  el.push(text(W/2,32,'TEAM_FEED',11,ACC,{anchor:'middle',fw:700,ls:2}));
  el.push(circle(W-22,26,7,ACC3));
  el.push(text(W-22,30,'3',8,'#000',{anchor:'middle',fw:700}));

  // Velocity header card
  el.push(rect(0,52,W,100,SURF));
  el.push(text(16,78,'TEAM_VELOCITY',9,TEXT3,{ls:2}));
  const vBars = [0.5,0.65,0.4,0.8,0.7,0.6,0.9,0.85,1.0,0.75,0.8,0.95];
  vBars.forEach((v,i) => {
    const bh=Math.round(v*44);
    const bx=16+i*28;
    el.push(rect(bx,136-bh,22,bh, i===11?ACC:CARD2));
    if(i===11) el.push(text(bx+11,130-bh+bh>30?130-bh:124,'↑',8,ACC,{anchor:'middle'}));
  });
  el.push(text(16,150,'12-week sprint',9,TEXT3));
  el.push(text(W-16,150,'↑ 19% velocity',9,ACC2,{anchor:'end',fw:700}));
  el.push(line(0,156,W,156,BORD,{sw:1}));

  // Feed header
  el.push(text(16,176,'ACTIVITY',9,TEXT3,{ls:2}));
  el.push(line(0,190,W,190,BORD,{sw:1}));

  // Feed events
  const events = [
    { who:'kira',  action:'opened',  target:'#2847 streaming handler',     time:'14m', icon:'◈', icolor:ACC  },
    { who:'AI',    action:'analyzed', target:'#2847 → 94% confidence, 7 issues',   time:'13m', icon:'▲', icolor:ACC  },
    { who:'tom',   action:'approved',  target:'#2840 auth token refresh',            time:'32m', icon:'✓', icolor:ACC2 },
    { who:'priya', action:'blocked',   target:'#2845 needs security review',         time:'1h',  icon:'⚑', icolor:ACC3 },
    { who:'ops',   action:'opened',    target:'#2841 auto-scaling policy',           time:'2h',  icon:'◈', icolor:ACC  },
    { who:'AI',    action:'suggested', target:'3 optimizations in #2841',            time:'2h',  icon:'▲', icolor:ACC  },
    { who:'tom',   action:'commented', target:'#2839 edge case in error handler',    time:'3h',  icon:'◉', icolor:TEXT2},
    { who:'kira',  action:'merged',    target:'#2838 to production',                 time:'4h',  icon:'⬆', icolor:ACC2 },
  ];
  events.forEach((ev,i) => {
    const ey = 196 + i*70;
    el.push(rect(0,ey,W,66, i%2===0?CARD:SURF));
    el.push(line(0,ey,W,ey,BORD,{sw:1}));
    // icon dot
    el.push(circle(26,ey+22,10,CARD2,{stroke:ev.icolor,strokeWidth:1.5}));
    el.push(text(26,ey+27,ev.icon,9,ev.icolor,{anchor:'middle',ls:0}));
    // timeline line
    if(i<events.length-1) el.push(line(26,ey+32,26,ey+66,TEXT3,{sw:1,opacity:0.2}));
    // text
    el.push(text(46,ey+18,'@'+ev.who,10,TEXT,{fw:700}));
    el.push(text(46+ev.who.length*7+8,ey+18,ev.action,10,TEXT2));
    el.push(text(W-14,ey+18,ev.time,9,TEXT3,{anchor:'end'}));
    const targ = ev.target.length>36?ev.target.slice(0,34)+'…':ev.target;
    el.push(text(46,ey+38,targ,10,TEXT3));
  });

  // Bottom nav
  el.push(rect(0,H-80,W,80,SURF));
  el.push(line(0,H-80,W,H-80,BORD,{sw:1}));
  [
    {label:'DASH', icon:'▪', active:false},
    {label:'REVIEWS', icon:'◈', active:false},
    {label:'DIFF', icon:'≡', active:false},
    {label:'FEED', icon:'◉', active:true},
  ].forEach((n,i) => {
    const nx = (W/4)*i + W/8;
    el.push(text(nx, H-50, n.icon, 18, n.active ? ACC : TEXT3, {anchor:'middle',ls:0}));
    el.push(text(nx, H-26, n.label, 8, n.active ? ACC : TEXT3, {anchor:'middle',ls:1.5}));
    if (n.active) el.push(rect(nx-16,H-80,32,2,ACC));
  });

  screens.push({ name:'Team Feed', svg:'', elements:el });
})();

// ─────────────────────────────────────────────
// SCREEN 6: SETTINGS / CONFIG
// ─────────────────────────────────────────────
(function buildSettings() {
  const el = [];
  el.push(rect(0,0,W,H,BG));

  // Header
  el.push(rect(0,0,W,52,SURF));
  el.push(line(0,52,W,52,BORD,{sw:1}));
  el.push(text(W/2,32,'CONFIG',11,ACC,{anchor:'middle',fw:700,ls:2}));

  // Profile block
  el.push(rect(0,52,W,100,SURF));
  el.push(circle(50,102,30,CARD2,{stroke:ACC,strokeWidth:1.5}));
  el.push(text(50,107,'KV',14,ACC,{anchor:'middle',fw:700,ls:1}));
  el.push(text(96,90,'kira@diffr.dev',13,TEXT,{fw:700}));
  el.push(text(96,110,'Senior Engineer · Team Lead',10,TEXT3));
  el.push(rect(96,122,80,20,CARD2,{rx:2}));
  el.push(text(136,136,'PRO_PLAN',8,ACC,{anchor:'middle',fw:700,ls:1}));
  el.push(line(0,152,W,152,BORD,{sw:1}));

  // Config sections
  const sections = [
    { heading: 'AI_BEHAVIOR', items:[
      { label:'Auto-analyze on push',   val:'ON',     color:ACC2  },
      { label:'Confidence threshold',   val:'80%',    color:TEXT  },
      { label:'AI model',               val:'GPT-4o', color:TEXT  },
      { label:'Suggest fixes inline',   val:'ON',     color:ACC2  },
    ]},
    { heading: 'NOTIFICATIONS', items:[
      { label:'PR ready for review',    val:'PUSH',   color:ACC   },
      { label:'AI analysis done',       val:'PUSH',   color:ACC   },
      { label:'Blocked PRs',            val:'ALL',    color:ACC3  },
      { label:'Team activity',          val:'DIGEST', color:TEXT2 },
    ]},
  ];

  let sy = 160;
  sections.forEach(sec => {
    el.push(text(16,sy+16,sec.heading,9,TEXT3,{ls:2}));
    sy += 28;
    sec.items.forEach(item => {
      el.push(rect(0,sy,W,42,CARD));
      el.push(line(0,sy,W,sy,BORD,{sw:1}));
      el.push(text(16,sy+26,item.label,11,TEXT));
      el.push(text(W-16,sy+26,item.val,11,item.color,{anchor:'end',fw:700,ls:0.5}));
      sy+=42;
    });
    el.push(line(0,sy,W,sy,BORD,{sw:1}));
    sy+=16;
  });

  // Version / danger zone
  el.push(text(16,sy+16,'SYSTEM',9,TEXT3,{ls:2}));
  sy+=28;
  el.push(rect(0,sy,W,42,CARD));
  el.push(line(0,sy,W,sy,BORD,{sw:1}));
  el.push(text(16,sy+26,'Version',11,TEXT));
  el.push(text(W-16,sy+26,'v3.14.2',11,TEXT2,{anchor:'end',ls:0.5}));
  sy+=42;
  el.push(rect(0,sy,W,42,CARD));
  el.push(line(0,sy,W,sy,BORD,{sw:1}));
  el.push(text(16,sy+26,'Reset workspace',11,ACC3));
  el.push(text(W-16,sy+26,'→',11,ACC3,{anchor:'end'}));

  // Bottom nav
  el.push(rect(0,H-80,W,80,SURF));
  el.push(line(0,H-80,W,H-80,BORD,{sw:1}));
  [
    {label:'DASH', icon:'▪', active:false},
    {label:'REVIEWS', icon:'◈', active:false},
    {label:'DIFF', icon:'≡', active:false},
    {label:'FEED', icon:'◉', active:false},
  ].forEach((n,i) => {
    const nx = (W/4)*i + W/8;
    el.push(text(nx, H-50, n.icon, 18, n.active ? ACC : TEXT3, {anchor:'middle',ls:0}));
    el.push(text(nx, H-26, n.label, 8, n.active ? ACC : TEXT3, {anchor:'middle',ls:1.5}));
  });
  // Settings indicator (middle)
  el.push(text(W/2,H-50,'⚙',18,ACC,{anchor:'middle',ls:0}));
  el.push(text(W/2,H-26,'CONFIG',8,ACC,{anchor:'middle',ls:1.5}));
  el.push(rect(W/2-16,H-80,32,2,ACC));

  screens.push({ name:'Config', svg:'', elements:el });
})();

// ─────────────────────────────────────────────
// BUILD PEN FILE
// ─────────────────────────────────────────────
const totalElements = screens.reduce((acc,s) => acc + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    tagline: TAGLINE,
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'dark',
    heartbeat: HEARTBEAT,
    palette: { bg:BG, surface:SURF, card:CARD, accent:ACC, accent2:ACC2, text:TEXT },
    inspiration: 'Terminal/hacker aesthetic from Overrrides on Godly.website + single-accent philosophy from Neon.com on DarkModeDesign.com',
    elements: totalElements,
  },
  screens: screens.map(s => ({
    name: s.name,
    width: W,
    height: H,
    background: BG,
    elements: s.elements,
  })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
