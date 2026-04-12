'use strict';
// KAIRO — AI Codebase Intelligence · Heartbeat #401 · Dark theme
// Inspired by: DarkModeDesign.com (deep navy dev tools) + Saaspo (Linear/Vercel calm UX)
// Challenge: Bento grid layout + command palette overlay + invisible AI infrastructure
const fs = require('fs');
const path = require('path');

const SLUG = 'kairo';
const W = 390, H = 844;

// Palette — Deep Cosmic Navy (dev tool canonical)
const BG     = '#080C18';
const SURF   = '#0C1220';
const CARD   = '#101828';
const CARD2  = '#131F30';
const ACC    = '#3D8EFF';  // electric blue
const ACC2   = '#22D3EE';  // cyan
const GREEN  = '#10B981';  // status green
const AMBER  = '#F59E0B';  // warning amber
const RED    = '#EF4444';  // alert red
const TEXT   = '#E2E8F0';  // near-white
const TEXT2  = '#94A3B8';  // muted slate
const TEXT3  = '#4B5563';  // dim
const BORDER = 'rgba(61,142,255,0.12)';
const GLOW   = 'rgba(61,142,255,0.18)';

let elements = [];
let screens = [];

// ─── Primitives ───────────────────────────────────────────────────────────────
function rect(x,y,w,h,fill,opts={}) {
  return { type:'rect', x, y, width:w, height:h, fill,
    rx: opts.rx||0, opacity: opts.opacity??1,
    stroke: opts.stroke||'none', strokeWidth: opts.sw||0 };
}
function text(x,y,content,size,fill,opts={}) {
  return { type:'text', x, y, content, fontSize:size, fill,
    fontWeight: opts.fw||400, fontFamily: opts.font||'Inter',
    textAnchor: opts.anchor||'start', letterSpacing: opts.ls||0,
    opacity: opts.opacity??1 };
}
function circle(cx,cy,r,fill,opts={}) {
  return { type:'circle', cx, cy, r, fill,
    opacity: opts.opacity??1, stroke: opts.stroke||'none', strokeWidth: opts.sw||0 };
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  return { type:'line', x1,y1,x2,y2, stroke, strokeWidth: opts.sw||1, opacity: opts.opacity??1 };
}
function poly(points,fill,opts={}) {
  return { type:'polyline', points, fill:'none', stroke: fill,
    strokeWidth: opts.sw||1.5, opacity: opts.opacity??1 };
}

// ─── Shared Components ───────────────────────────────────────────────────────
function statusBar(els) {
  els.push(rect(0,0,W,44,SURF));
  els.push(text(16,28,'KAIRO',13,ACC,{fw:700,ls:3}));
  els.push(text(W/2,28,'◈  kairo.dev',12,TEXT2,{anchor:'middle'}));
  // battery + time
  els.push(text(W-60,28,'9:41',12,TEXT2,{anchor:'start'}));
  els.push(rect(W-28,18,22,10,TEXT3,{rx:2}));
  els.push(rect(W-27,19,15,8,TEXT,{rx:1}));
}

function bottomNav(els, activeIdx) {
  els.push(rect(0,H-60,W,60,SURF));
  els.push(line(0,H-60,W,H-60,BORDER,{sw:0.5}));
  const tabs = [
    {label:'Dashboard',icon:'⬡'},
    {label:'Repos',icon:'◧'},
    {label:'Review',icon:'◈'},
    {label:'Alerts',icon:'◎'},
    {label:'Me',icon:'◉'},
  ];
  const tw = W/5;
  tabs.forEach((t,i) => {
    const cx = tw*i + tw/2;
    const active = i === activeIdx;
    const col = active ? ACC : TEXT3;
    if (active) {
      els.push(rect(tw*i+tw/2-18, H-58, 36, 3, ACC, {rx:1.5}));
    }
    els.push(text(cx,H-36,t.icon,18,col,{anchor:'middle',fw:active?700:400}));
    els.push(text(cx,H-16,t.label,9,col,{anchor:'middle',fw:active?600:400}));
  });
}

function cardBg(els, x,y,w,h,opts={}) {
  els.push(rect(x,y,w,h,CARD,{rx:opts.rx||10,
    stroke:opts.border?BORDER:'none', sw: opts.border?0.5:0}));
  if (opts.glow) {
    els.push(rect(x,y,w,h,'none',{rx:opts.rx||10, stroke:ACC, sw:0.5, opacity:0.15}));
  }
}

// ─── Screen 1: Dashboard ──────────────────────────────────────────────────────
function buildDashboard() {
  const els = [];
  elements = [];

  // BG
  els.push(rect(0,0,W,H,BG));
  // Subtle gradient overlay top
  els.push(rect(0,0,W,200,'rgba(61,142,255,0.04)',{rx:0}));

  statusBar(els);

  // Header
  els.push(text(16,72,'Good morning, Rakis',14,TEXT2,{fw:400}));
  els.push(text(16,94,'Codebase Intelligence',24,TEXT,{fw:700}));

  // Cmd+K prompt bar
  els.push(rect(16,106,W-32,36,CARD,{rx:8,stroke:BORDER,sw:0.5}));
  els.push(text(24,129,'⌘K  Search or ask anything...',12,TEXT3,{fw:400}));
  els.push(rect(W-62,110,44,28,CARD2,{rx:6,stroke:BORDER,sw:0.5}));
  els.push(text(W-40,129,'⌘K',10,ACC,{anchor:'middle',fw:600}));

  // ─ Bento Grid ─
  // Row 1: big health card (left) + AI signal (right)
  // Health Score card — big
  cardBg(els, 16, 152, 220, 100, {rx:10, glow:true});
  els.push(text(26,172,'Repo Health',10,TEXT2,{fw:500,ls:1}));
  els.push(text(26,208,'94',38,TEXT,{fw:800}));
  els.push(text(72,208,'/100',16,TEXT2,{fw:400}));
  els.push(text(26,228,'↑ 3pts this week',10,GREEN,{fw:500}));
  // mini sparkline
  const hpts = [[130,220],[145,210],[160,215],[175,205],[195,208],[214,200]];
  for(let i=0;i<hpts.length-1;i++) {
    els.push(line(hpts[i][0],hpts[i][1],hpts[i+1][0],hpts[i+1][1],ACC,{sw:1.5}));
  }
  hpts.forEach(p => els.push(circle(p[0],p[1],2,ACC)));

  // AI Signal card — small right
  cardBg(els, 244, 152, W-260, 48, {rx:10});
  els.push(text(254,167,'AI Signal',9,TEXT2,{fw:500,ls:1}));
  els.push(circle(265,187,5,GREEN,{opacity:0.9}));
  els.push(text(274,191,'Active',10,GREEN,{fw:600}));

  // Open PRs card — small right bottom
  cardBg(els, 244, 204, W-260, 48, {rx:10});
  els.push(text(254,219,'Open PRs',9,TEXT2,{fw:500,ls:1}));
  els.push(text(254,241,'7',20,TEXT,{fw:800}));
  els.push(text(274,241,' PRs',11,TEXT2,{fw:400}));

  // Row 2: 3 mini metrics
  const metrics = [
    {label:'Coverage',val:'87%',col:GREEN},
    {label:'Debt',val:'2.4h',col:AMBER},
    {label:'Velocity',val:'↑12%',col:ACC},
  ];
  const mw = (W-40)/3 - 4;
  metrics.forEach((m,i) => {
    const mx = 16 + i*(mw+6);
    cardBg(els, mx, 260, mw, 52, {rx:8});
    els.push(text(mx+8,276,m.label,9,TEXT2,{fw:500}));
    els.push(text(mx+8,300,m.val,16,m.col,{fw:700}));
  });

  // AI Insights section
  els.push(text(16,328,'AI Insights',11,TEXT2,{fw:600,ls:1}));
  els.push(rect(W-80,320,70,18,CARD2,{rx:9}));
  els.push(text(W-45,333,'View all →',9,ACC,{anchor:'middle',fw:500}));

  const insights = [
    {icon:'◈',col:ACC, text:'3 functions approaching complexity threshold in auth/'},
    {icon:'◉',col:AMBER, text:'Unused exports detected in 5 modules — potential dead code'},
    {icon:'◎',col:GREEN, text:'Test coverage increased 4% after last 2 PRs'},
  ];
  insights.forEach((ins,i) => {
    const iy = 348 + i*56;
    cardBg(els, 16, iy, W-32, 48, {rx:8, border:true});
    els.push(text(26, iy+16, ins.icon, 12, ins.col, {fw:700}));
    // text wrap simulation
    els.push(text(44, iy+16, ins.text.slice(0,42), 10, TEXT, {fw:400}));
    if (ins.text.length > 42) els.push(text(44, iy+30, ins.text.slice(42), 10, TEXT2, {fw:400}));
    els.push(circle(W-30, iy+24, 3, ins.col, {opacity:0.7}));
  });

  // Recent activity header
  els.push(text(16,526,'Recent Activity',11,TEXT2,{fw:600,ls:1}));

  const activities = [
    {user:'RS',col:'#8B5CF6',action:'Merged PR #241 — auth refactor',time:'2m'},
    {user:'DK',col:ACC,action:'Opened PR #242 — cache layer',time:'18m'},
    {user:'ML',col:GREEN,action:'Pushed 4 commits to main',time:'1h'},
  ];
  activities.forEach((a,i) => {
    const ay = 545 + i*48;
    els.push(line(16,ay+44,W-16,ay+44,BORDER,{sw:0.3}));
    // avatar
    els.push(circle(32,ay+14,12,a.col,{opacity:0.9}));
    els.push(text(32,ay+18,a.user,8,TEXT,{anchor:'middle',fw:700}));
    els.push(text(52,ay+10,a.action.slice(0,36),11,TEXT,{fw:400}));
    if (a.action.length>36) els.push(text(52,ay+24,a.action.slice(36),11,TEXT2,{fw:400}));
    els.push(text(W-16,ay+10,a.time,10,TEXT3,{anchor:'end',fw:400}));
  });

  bottomNav(els, 0);
  return els;
}

// ─── Screen 2: Repos ─────────────────────────────────────────────────────────
function buildRepos() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  statusBar(els);

  els.push(text(16,72,'Repositories',11,TEXT2,{fw:500,ls:2}));
  els.push(text(16,94,'6 repos · 3 active',22,TEXT,{fw:700}));

  // Search
  els.push(rect(16,108,W-32,34,CARD,{rx:8,stroke:BORDER,sw:0.5}));
  els.push(text(28,130,'⌕  Filter repos...',12,TEXT3,{fw:400}));

  // Sort tabs
  const tabs = ['All','Active','Needs Review','Archived'];
  let tx = 16;
  tabs.forEach((t,i) => {
    const tw2 = t.length*7.5+16;
    els.push(rect(tx,148,tw2,24,i===0?ACC:CARD,{rx:6}));
    els.push(text(tx+tw2/2,164,t,10,i===0?BG:TEXT2,{anchor:'middle',fw:i===0?700:400}));
    tx += tw2+6;
  });

  // Repos list
  const repos = [
    {name:'hyperio-core',lang:'TypeScript',stars:842,health:94,col:ACC,activity:[3,5,2,7,4,6,5,8]},
    {name:'design-studio',lang:'JavaScript',stars:318,health:88,col:'#8B5CF6',activity:[2,4,6,3,5,7,4,5]},
    {name:'ram-sdk',lang:'Rust',stars:1204,health:96,col:AMBER,activity:[6,8,5,9,7,8,6,9]},
    {name:'api-gateway',lang:'Go',stars:567,health:71,col:GREEN,activity:[1,3,2,4,2,3,1,2]},
  ];

  repos.forEach((r,i) => {
    const ry = 182+i*128;
    cardBg(els, 16, ry, W-32, 118, {rx:10, border:true});
    // top: name + health
    els.push(circle(28,ry+22,8,r.col,{opacity:0.9}));
    els.push(text(42,ry+27,r.name,13,TEXT,{fw:700}));
    // health badge
    const hcol = r.health>=90?GREEN:r.health>=80?ACC:AMBER;
    els.push(rect(W-60,ry+12,46,20,CARD2,{rx:6}));
    els.push(text(W-37,ry+26,`${r.health}%`,11,hcol,{anchor:'middle',fw:700}));
    // language + stars
    els.push(text(42,ry+44,r.lang,10,TEXT2,{fw:400}));
    els.push(text(100,ry+44,'·',10,TEXT3));
    els.push(text(108,ry+44,`★ ${r.stars}`,10,TEXT2,{fw:400}));
    // activity sparkline
    els.push(text(26,ry+64,'Activity',9,TEXT3,{fw:400,ls:1}));
    const barH = 28, barW = 8, gap = 5;
    const bx0 = 26;
    r.activity.forEach((v,bi) => {
      const bh = (v/9)*barH;
      const bx = bx0 + bi*(barW+gap);
      els.push(rect(bx,ry+92-bh,barW,bh,bi===7?ACC:CARD2,{rx:2}));
    });
    // last commit
    els.push(text(26,ry+108,'Last push: 2h ago',9,TEXT3,{fw:400}));
    els.push(rect(W-80,ry+98,66,18,CARD2,{rx:6}));
    els.push(text(W-47,ry+111,'Open PRs →',9,ACC,{anchor:'middle',fw:600}));
  });

  bottomNav(els, 1);
  return els;
}

// ─── Screen 3: Code Review (PR #241) ─────────────────────────────────────────
function buildReview() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  statusBar(els);

  // Header
  els.push(rect(16,50,32,32,'#8B5CF6',{rx:16}));
  els.push(text(32,71,'RS',10,TEXT,{anchor:'middle',fw:700}));
  els.push(text(56,64,'PR #241',13,TEXT,{fw:700}));
  els.push(text(56,80,'auth/session refactor',11,TEXT2,{fw:400}));
  // status
  els.push(rect(W-80,56,66,20,GREEN+'22',{rx:6,stroke:GREEN,sw:0.5}));
  els.push(text(W-47,70,'✓ Ready',10,GREEN,{anchor:'middle',fw:600}));

  // AI review banner
  els.push(rect(16,90,W-32,36,'rgba(61,142,255,0.08)',{rx:8,stroke:ACC,sw:0.5}));
  els.push(text(26,104,'◈',12,ACC));
  els.push(text(42,104,'AI Review complete — 1 suggestion, 0 issues',10,TEXT,{fw:500}));
  els.push(text(42,118,'Low risk · Approved to merge',10,GREEN,{fw:400}));

  // Stats row
  const stats = [{l:'+247',c:GREEN},{l:'-83',c:RED},{l:'12 files',c:TEXT2},{l:'3 commits',c:TEXT2}];
  stats.forEach((s,i) => {
    const sw = (W-32)/4;
    els.push(text(16+i*sw + sw/2, 142, s.l, 11, s.c, {anchor:'middle',fw:600}));
  });
  els.push(line(16,150,W-16,150,BORDER,{sw:0.5}));

  // Diff viewer
  els.push(text(16,165,'auth/session.ts',10,TEXT2,{fw:600}));
  els.push(text(W-16,165,'Collapse',9,TEXT3,{anchor:'end'}));

  const diffLines = [
    {t:'context', ln:'  12', code:'import { Session } from \'./types\';'},
    {t:'context', ln:'  13', code:'import { validateToken } from \'../auth\';'},
    {t:'remove',  ln:'-  14', code:'export async function getSession(req) {'},
    {t:'remove',  ln:'-  15', code:'  const token = req.headers.auth;'},
    {t:'add',     ln:'+  14', code:'export async function getSession('},
    {t:'add',     ln:'+  15', code:'  req: Request, opts: SessionOpts = {}'},
    {t:'add',     ln:'+  16', code:') {'},
    {t:'add',     ln:'+  17', code:'  const token = extractToken(req, opts);'},
    {t:'context', ln:'  18', code:'  if (!token) throw new AuthError();'},
    {t:'context', ln:'  19', code:'  return validateToken(token);'},
  ];

  diffLines.forEach((dl,i) => {
    const dy = 175 + i*30;
    const bg = dl.t==='remove'?'rgba(239,68,68,0.10)':dl.t==='add'?'rgba(16,185,129,0.10)':'transparent';
    const lc = dl.t==='remove'?RED:dl.t==='add'?GREEN:TEXT3;
    els.push(rect(16,dy,W-32,26,bg,{rx:0}));
    els.push(text(20,dy+17,dl.ln,8,lc,{fw:500,font:'monospace'}));
    els.push(text(58,dy+17,dl.code.slice(0,46),9,dl.t==='context'?TEXT2:dl.t==='remove'?RED:GREEN,{fw:400,font:'monospace'}));
  });

  // AI suggestion
  const sugY = 480;
  els.push(rect(16,sugY,W-32,68,'rgba(61,142,255,0.06)',{rx:8,stroke:ACC,sw:0.5}));
  els.push(text(26,sugY+16,'◈  AI Suggestion',10,ACC,{fw:600}));
  els.push(text(26,sugY+32,'Consider memoizing extractToken — called in hot',9,TEXT,{fw:400}));
  els.push(text(26,sugY+44,'path. Could reduce latency by ~12ms at p95.',9,TEXT,{fw:400}));
  els.push(rect(26,sugY+52,56,14,ACC+'22',{rx:4}));
  els.push(text(54,sugY+62,'Apply fix',8,ACC,{anchor:'middle',fw:600}));
  els.push(rect(88,sugY+52,42,14,CARD2,{rx:4}));
  els.push(text(109,sugY+62,'Dismiss',8,TEXT3,{anchor:'middle',fw:400}));

  // Action buttons
  els.push(rect(16,560,W-32-90,44,ACC,{rx:10}));
  els.push(text((W-32-90)/2+16,587,'Approve & Merge',13,TEXT,{anchor:'middle',fw:700}));
  els.push(rect(W-96,560,80,44,CARD2,{rx:10,stroke:BORDER,sw:0.5}));
  els.push(text(W-56,587,'Request →',11,TEXT2,{anchor:'middle',fw:500}));

  // File list
  els.push(text(16,622,'Changed Files',10,TEXT2,{fw:600,ls:1}));
  const files = ['auth/session.ts','auth/types.ts','tests/session.test.ts'];
  files.forEach((f,i) => {
    els.push(text(16,642+i*22,'◧  '+f,10,TEXT2,{fw:400}));
    els.push(text(W-16,642+i*22,i===0?'+12':i===1?'+3':'+8',10,GREEN,{anchor:'end',fw:500}));
  });

  bottomNav(els, 2);
  return els;
}

// ─── Screen 4: Analytics ──────────────────────────────────────────────────────
function buildAnalytics() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  statusBar(els);

  els.push(text(16,72,'Analytics',11,TEXT2,{fw:500,ls:2}));
  els.push(text(16,94,'Code Velocity & Quality',22,TEXT,{fw:700}));

  // Period tabs
  const periods = ['7D','30D','90D','1Y'];
  periods.forEach((p,i) => {
    els.push(rect(16+i*54,108,46,22,i===1?ACC:CARD,{rx:6}));
    els.push(text(39+i*54,123,p,10,i===1?BG:TEXT2,{anchor:'middle',fw:i===1?700:400}));
  });

  // Main chart — velocity
  cardBg(els, 16, 140, W-32, 150, {rx:10, border:true});
  els.push(text(26,158,'Commit Velocity',10,TEXT2,{fw:500,ls:1}));
  els.push(text(W-26,158,'↑ 18%',10,GREEN,{anchor:'end',fw:600}));

  // Chart grid
  for(let g=0;g<4;g++) {
    const gy = 170+g*28;
    els.push(line(30,gy,W-30,gy,BORDER,{sw:0.3}));
    els.push(text(24,gy+4,String(24-g*8),8,TEXT3,{anchor:'end'}));
  }

  // Area chart (approximated with poly)
  const chartPts = [
    [35,250],[65,230],[95,240],[125,215],[155,220],[185,200],[215,205],[245,188],[275,192],[305,175],[335,180],[355,168]
  ];
  // Fill area
  for(let i=0;i<chartPts.length-1;i++) {
    const p = chartPts[i], n = chartPts[i+1];
    els.push({type:'polygon',points:`${p[0]},${p[1]} ${n[0]},${n[1]} ${n[0]},255 ${p[0]},255`,
      fill:`rgba(61,142,255,0.08)`, stroke:'none'});
  }
  // Line
  for(let i=0;i<chartPts.length-1;i++) {
    els.push(line(chartPts[i][0],chartPts[i][1],chartPts[i+1][0],chartPts[i+1][1],ACC,{sw:2}));
  }
  chartPts.forEach((p,i) => i%3===0 && els.push(circle(p[0],p[1],3,ACC)));

  // X labels
  ['Apr 1','Apr 8','Apr 15','Apr 22','Apr 29'].forEach((l,i) => {
    els.push(text(40+i*72, 270, l, 8, TEXT3, {anchor:'middle'}));
  });

  // Metric grid — 2x2 bento
  const mData = [
    {title:'Test Coverage',val:'87.3%',sub:'↑ 4.1% this month',col:GREEN},
    {title:'Tech Debt',val:'2.4h',sub:'↓ 0.8h resolved',col:AMBER},
    {title:'Bug Rate',val:'0.12',sub:'per 100 commits',col:ACC2},
    {title:'Avg PR Size',val:'+148',sub:'lines (↓ 12%)',col:ACC},
  ];
  const gw = (W-40)/2;
  mData.forEach((m,i) => {
    const mx = 16 + (i%2)*(gw+8);
    const my = 302 + Math.floor(i/2)*76;
    cardBg(els, mx, my, gw, 68, {rx:8, border:true});
    els.push(text(mx+10, my+18, m.title, 9, TEXT2, {fw:500}));
    els.push(text(mx+10, my+44, m.val, 22, m.col, {fw:800}));
    els.push(text(mx+10, my+60, m.sub, 9, TEXT3, {fw:400}));
  });

  // Contributors
  els.push(text(16,462,'Top Contributors',10,TEXT2,{fw:600,ls:1}));
  const contribs = [
    {name:'Rakis S.',commits:47,pct:38,col:'#8B5CF6'},
    {name:'Dana K.',commits:31,pct:25,col:ACC},
    {name:'Marcus L.',commits:28,pct:23,col:GREEN},
  ];
  contribs.forEach((c,i) => {
    const cy = 480+i*56;
    els.push(circle(28,cy+12,12,c.col,{opacity:0.85}));
    els.push(text(28,cy+16,c.name.slice(0,2),8,TEXT,{anchor:'middle',fw:700}));
    els.push(text(48,cy+8,c.name,11,TEXT,{fw:600}));
    els.push(text(48,cy+22,`${c.commits} commits`,9,TEXT3,{fw:400}));
    // progress bar
    els.push(rect(48,cy+30,W-80,5,CARD2,{rx:2}));
    els.push(rect(48,cy+30,(W-80)*(c.pct/100),5,c.col,{rx:2}));
    els.push(text(W-24,cy+8,`${c.pct}%`,10,c.col,{anchor:'end',fw:600}));
  });

  bottomNav(els, 0);
  return els;
}

// ─── Screen 5: Command Palette Overlay ───────────────────────────────────────
function buildCommandPalette() {
  const els = [];
  // Dimmed background (shows dashboard behind)
  els.push(rect(0,0,W,H,BG));
  // Dashboard behind (faint)
  els.push(rect(0,0,W,H,'rgba(8,12,24,0.85)'));

  statusBar(els);

  // Overlay card
  els.push(rect(12,60,W-24,H-160,'rgba(12,18,32,0.96)',{rx:16,stroke:ACC,sw:0.5}));

  // Search input
  els.push(rect(24,76,W-48,42,CARD2,{rx:10,stroke:BORDER,sw:0.5}));
  els.push(text(36,102,'⌘K',11,ACC,{fw:700}));
  els.push(text(60,102,'ask kairo anything...',12,TEXT2,{fw:400}));
  els.push(text(W-30,102,'ESC',10,TEXT3,{anchor:'end',fw:500}));

  // Recent / suggested
  els.push(text(28,134,'RECENT',9,TEXT3,{fw:600,ls:2}));

  const recent = [
    {icon:'◈',col:ACC,title:'What caused velocity drop Mar 15–22?',sub:'AI Answer'},
    {icon:'◧',col:'#8B5CF6',title:'hyperio-core coverage report',sub:'Analytics'},
    {icon:'◎',col:AMBER,title:'Open PRs needing review',sub:'3 PRs'},
  ];
  recent.forEach((r,i) => {
    const ry = 150+i*52;
    cardBg(els, 24, ry, W-48, 44, {rx:8,border:true});
    els.push(text(36,ry+17,r.icon,14,r.col,{fw:700}));
    els.push(text(56,ry+17,r.title.slice(0,38),11,TEXT,{fw:500}));
    if(r.title.length>38) els.push(text(56,ry+31,r.title.slice(38),11,TEXT2,{fw:400}));
    else els.push(text(56,ry+31,r.sub,9,TEXT3,{fw:400}));
    els.push(text(W-34,ry+26,'→',12,TEXT3,{anchor:'end'}));
  });

  // Suggestions
  els.push(text(28,316,'SUGGESTIONS',9,TEXT3,{fw:600,ls:2}));

  const suggests = [
    {icon:'◈',col:ACC2, title:'Summarize last sprint'},
    {icon:'◉',col:GREEN, title:'Show repos with declining health'},
    {icon:'⬡',col:'#8B5CF6', title:'Compare PR velocity: this month vs last'},
    {icon:'◎',col:AMBER, title:'Alert me when coverage drops below 80%'},
  ];
  suggests.forEach((s,i) => {
    const sy = 332+i*44;
    els.push(rect(24,sy,W-48,36,i===0?CARD2:'transparent',{rx:8}));
    if(i===0) els.push(rect(24,sy,3,36,ACC,{rx:2}));
    els.push(text(36,sy+22,s.icon,13,s.col,{fw:600}));
    els.push(text(56,sy+22,s.title,11,i===0?TEXT:TEXT2,{fw:i===0?600:400}));
    els.push(text(W-32,sy+22,'⏎',11,i===0?ACC:TEXT3,{anchor:'end'}));
  });

  // Keyboard shortcuts footer
  els.push(line(24,520,W-24,520,BORDER,{sw:0.5}));
  els.push(text(28,537,'↑↓ navigate',9,TEXT3,{fw:400}));
  els.push(text(W/2,537,'⏎ select',9,TEXT3,{anchor:'middle',fw:400}));
  els.push(text(W-24,537,'esc close',9,TEXT3,{anchor:'end',fw:400}));

  // Active AI typing indicator
  const aiY = 546;
  els.push(rect(24,aiY,W-48,60,'rgba(61,142,255,0.06)',{rx:10,stroke:ACC,sw:0.5}));
  els.push(text(34,aiY+16,'◈',13,ACC,{fw:700}));
  els.push(text(50,aiY+16,'Kairo is ready to answer...',11,TEXT2,{fw:400}));
  // blinking cursor simulation
  els.push(text(50,aiY+38,'How can I help you understand your codebase?',10,TEXT3,{fw:400}));
  els.push(rect(50,aiY+44,4,2,ACC,{rx:1})); // cursor

  bottomNav(els, 0);
  return els;
}

// ─── Screen 6: Alerts ─────────────────────────────────────────────────────────
function buildAlerts() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  statusBar(els);

  els.push(text(16,72,'Alerts',11,TEXT2,{fw:500,ls:2}));
  els.push(text(16,94,'Code Intelligence Signals',22,TEXT,{fw:700}));

  // Alert summary row
  const sumData = [{val:'2',label:'Critical',col:RED},{val:'5',label:'Warnings',col:AMBER},{val:'3',label:'Info',col:ACC}];
  const sw2 = (W-40)/3;
  sumData.forEach((s,i) => {
    const sx = 16 + i*(sw2+8);
    cardBg(els, sx, 108, sw2, 52, {rx:8, glow: i===0});
    els.push(text(sx+sw2/2,128,s.val,22,s.col,{anchor:'middle',fw:800}));
    els.push(text(sx+sw2/2,144,s.label,9,TEXT3,{anchor:'middle',fw:500}));
  });

  // Filter tabs
  els.push(rect(16,170,W-32,28,CARD,{rx:8}));
  ['All','Critical','Warnings','Info'].forEach((t,i) => {
    els.push(rect(19+i*88,172,84,24,i===0?SURF:'transparent',{rx:6}));
    els.push(text(19+i*88+42,188,t,9,i===0?TEXT:TEXT3,{anchor:'middle',fw:i===0?600:400}));
  });

  // Alerts list
  const alerts = [
    {
      sev:'CRITICAL', icon:'◎', col:RED, bg:'rgba(239,68,68,0.08)',
      title:'Security: Exposed API key pattern',
      body:'Found in ram-sdk/src/config.ts line 47 — matches AWS key pattern',
      repo:'ram-sdk', time:'5m ago', action:'View →',
    },
    {
      sev:'CRITICAL', icon:'◎', col:RED, bg:'rgba(239,68,68,0.08)',
      title:'Dependency: lodash 4.17.19 critical CVE',
      body:'CVE-2024-8371 severity 9.8 — update to 4.17.22 immediately',
      repo:'hyperio-core', time:'1h ago', action:'Fix →',
    },
    {
      sev:'WARNING', icon:'◈', col:AMBER, bg:'rgba(245,158,11,0.06)',
      title:'Complexity spike: auth/middleware.ts',
      body:'Cyclomatic complexity 34 (threshold 20) — refactor recommended',
      repo:'hyperio-core', time:'2h ago', action:'Review →',
    },
    {
      sev:'WARNING', icon:'◈', col:AMBER, bg:'rgba(245,158,11,0.06)',
      title:'Dead code: 12 unused exports detected',
      body:'Modules: utils/legacy.ts, helpers/deprecated.ts +10 more',
      repo:'api-gateway', time:'4h ago', action:'View →',
    },
    {
      sev:'INFO', icon:'◉', col:ACC, bg:'rgba(61,142,255,0.05)',
      title:'Coverage milestone reached: 87%',
      body:'Up from 83% last month — test quality improving',
      repo:'design-studio', time:'6h ago', action:'Details',
    },
  ];

  alerts.forEach((a,i) => {
    const ay = 210 + i*110;
    if (ay > H-70) return;
    els.push(rect(16, ay, W-32, 100, a.bg, {rx:10, stroke:a.col, sw:0.5, opacity:1}));
    // sev badge
    els.push(rect(26,ay+10,a.sev.length*6+10,16,a.col+'22',{rx:4}));
    els.push(text(26+5,ay+22,a.sev,8,a.col,{fw:700,ls:1}));
    // time
    els.push(text(W-24,ay+22,a.time,9,TEXT3,{anchor:'end',fw:400}));
    // title
    els.push(text(26,ay+42,a.title.slice(0,42),11,TEXT,{fw:700}));
    if(a.title.length>42) els.push(text(26,ay+56,a.title.slice(42),11,TEXT,{fw:700}));
    // body
    els.push(text(26,ay+70,a.body.slice(0,48),9,TEXT2,{fw:400}));
    if(a.body.length>48) els.push(text(26,ay+82,a.body.slice(48),9,TEXT3,{fw:400}));
    // repo + action
    els.push(text(26,ay+94,`repo: ${a.repo}`,9,TEXT3,{fw:400}));
    els.push(rect(W-66,ay+82,52,16,CARD2,{rx:5}));
    els.push(text(W-40,ay+94,a.action,9,a.col,{anchor:'middle',fw:600}));
  });

  bottomNav(els, 3);
  return els;
}

// ─── Assemble ─────────────────────────────────────────────────────────────────
function countEls(els) {
  return els.filter(e => e !== null && e !== undefined).length;
}

const screen1Els = buildDashboard();
const screen2Els = buildRepos();
const screen3Els = buildReview();
const screen4Els = buildAnalytics();
const screen5Els = buildCommandPalette();
const screen6Els = buildAlerts();

const totalEls =
  countEls(screen1Els)+countEls(screen2Els)+countEls(screen3Els)+
  countEls(screen4Els)+countEls(screen5Els)+countEls(screen6Els);

const pen = {
  version: '2.8',
  metadata: {
    name: 'KAIRO — AI Codebase Intelligence',
    author: 'RAM',
    date: new Date().toISOString(),
    theme: 'dark',
    heartbeat: 401,
    elements: totalEls,
    palette: { bg:BG, surf:SURF, card:CARD, acc:ACC, acc2:ACC2, text:TEXT, muted:TEXT2 },
    inspiration: 'DarkModeDesign.com dev tool aesthetics (#0C1120 navy + blue) + Saaspo calm/spotlight UX (Linear/Vercel philosophy) + bento grid patterns',
    challenge: 'Dark AI developer tool with bento grid, command palette overlay, invisible AI infrastructure',
  },
  screens: [
    { name:'Dashboard', svg:`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">`, elements: screen1Els },
    { name:'Repositories', svg:`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">`, elements: screen2Els },
    { name:'Code Review', svg:`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">`, elements: screen3Els },
    { name:'Analytics', svg:`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">`, elements: screen4Els },
    { name:'Command Palette', svg:`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">`, elements: screen5Els },
    { name:'Alerts', svg:`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">`, elements: screen6Els },
  ],
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));

console.log(`KAIRO: 6 screens, ${totalEls} elements`);
console.log(`Written: ${SLUG}.pen`);
