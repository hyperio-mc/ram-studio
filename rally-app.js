// Rally — AI Agent + Human Team Coordination Dashboard
// Inspired by: Linear's "teams and agents" positioning seen on godly.website
// Theme: LIGHT (warm off-white, soft indigo/violet accent)
// Format: Pencil.dev v2.8

const fs = require('fs');
const path = require('path');

const W = 390, H = 844;
const SLUG = 'rally';

// ─── PALETTE (Light) ────────────────────────────────────────────────
const C = {
  bg:       '#F4F3EF',   // warm parchment off-white
  surface:  '#FFFFFF',
  surface2: '#F0EEE9',   // slightly warm for cards
  border:   '#E8E6E0',
  text:     '#1A1918',   // warm near-black
  textSub:  '#6B6760',   // warm medium gray
  accent:   '#6D4AFF',   // vivid indigo/violet
  accentSoft:'#EDE8FF',  // light violet tint
  green:    '#1EA97C',   // success / active
  greenSoft:'#E3F6EF',
  amber:    '#F59E0B',   // pending / review
  amberSoft:'#FEF3C7',
  red:      '#EF4444',
  redSoft:  '#FEE2E2',
  badge:    '#5B21B6',   // deeper violet for badges
  white:    '#FFFFFF',
};

// ─── PRIMITIVES ──────────────────────────────────────────────────────
const el = (type, props = {}) => ({ type, ...props });
const frame = (name, children, props = {}) =>
  el('FRAME', { name, width: W, height: H, x: 0, y: 0, fills: [solid(C.bg)], children, ...props });

function solid(hex, a = 1) {
  const r = parseInt(hex.slice(1,3),16)/255;
  const g = parseInt(hex.slice(3,5),16)/255;
  const b = parseInt(hex.slice(5,7),16)/255;
  return { type:'SOLID', color:{ r, g, b }, opacity: a };
}
function rect(x,y,w,h,fill,props={}) {
  return el('RECTANGLE',{ x, y, width:w, height:h, fills:[typeof fill==='string'?solid(fill):fill], cornerRadius: props.r||0, ...props });
}
function txt(str, x, y, size, color, props={}) {
  return el('TEXT',{
    x, y, characters: String(str),
    fontSize: size,
    fills: [solid(color)],
    fontName: { family: props.family||'Inter', style: props.weight||'Regular' },
    textAlignHorizontal: props.align||'LEFT',
    width: props.w||300,
    height: props.h||size*1.4,
    letterSpacing: props.ls||0,
    lineHeight: props.lh ? { value: props.lh, unit:'PIXELS' } : undefined,
    ...props
  });
}
function pill(label, x, y, bg, color, props={}) {
  const pw = props.w || (label.length * 7.5 + 20);
  return el('FRAME',{
    x, y, width: pw, height: props.h||24, fills:[solid(bg)],
    cornerRadius: props.r||(props.h||24)/2,
    children:[
      txt(label, pw/2, (props.h||24)/2 - 7, props.size||11, color,
        { align:'CENTER', weight:'Medium', w:pw-4 })
    ]
  });
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────
function statusBar() {
  return el('FRAME',{
    x:0, y:0, width:W, height:52, fills:[solid(C.bg)],
    children:[
      txt('9:41', 16, 16, 14, C.text, { weight:'SemiBold', w:60 }),
      // battery / signal icons (simplified)
      rect(W-70, 20, 22, 11, C.text, { r:2, opacity:0.6 }),
      rect(W-44, 20, 16, 11, C.text, { r:2, opacity:0.5 }),
      rect(W-24, 20, 14, 11, C.text, { r:2, opacity:0.5 }),
    ]
  });
}

function navBar(active) {
  const tabs = [
    { id:'home',    icon:'⌂', label:'Home' },
    { id:'agents',  icon:'⟁', label:'Agents' },
    { id:'queue',   icon:'≡', label:'Queue' },
    { id:'review',  icon:'◎', label:'Review' },
    { id:'insights',icon:'↗', label:'Insights' },
  ];
  const TW = W / tabs.length;
  return el('FRAME',{
    x:0, y:H-78, width:W, height:78,
    fills:[solid(C.surface)],
    effects:[{ type:'DROP_SHADOW', color:{ r:0,g:0,b:0, a:0.06 }, x:0, y:-1, blur:12, spread:0 }],
    children: tabs.map((t,i) => el('FRAME',{
      x: i*TW, y:0, width:TW, height:78,
      fills:[{ type:'SOLID', color:{ r:0,g:0,b:0 }, opacity:0 }],
      children:[
        rect(TW/2-16, 8, 32, 32, t.id===active ? C.accentSoft : 'rgba(0,0,0,0)', { r:10 }),
        txt(t.icon, TW/2, 14, 16, t.id===active ? C.accent : C.textSub,
          { align:'CENTER', w:32 }),
        txt(t.label, TW/2-16, 44, 10,
          t.id===active ? C.accent : C.textSub,
          { align:'CENTER', weight: t.id===active?'SemiBold':'Regular', w:32 }),
      ]
    }))
  });
}

function agentAvatarSmall(x, y, initial, status) {
  const statusColor = status==='active' ? C.green : status==='review' ? C.amber : C.textSub;
  return el('FRAME',{ x, y, width:36, height:36, fills:[{ type:'SOLID', color:{ r:0,g:0,b:0 }, opacity:0 }], children:[
    rect(0, 0, 36, 36, C.accentSoft, { r:10 }),
    txt(initial, 18, 10, 14, C.accent, { align:'CENTER', weight:'Bold', w:36 }),
    rect(24, 24, 10, 10, statusColor, { r:5 }),
    rect(25, 25, 8, 8, C.surface, { r:4 }),
    rect(27, 27, 4, 4, statusColor, { r:2 }),
  ]});
}

// ─── SCREEN 1: HOME ──────────────────────────────────────────────────
function homeScreen() {
  const children = [];
  children.push(rect(0,0,W,H, C.bg));
  children.push(statusBar());

  // Header
  children.push(txt('Good morning, Kai', 20, 60, 22, C.text, { weight:'SemiBold', w:280 }));
  children.push(txt('Tuesday, March 25', 20, 88, 14, C.textSub, { w:200 }));

  // Avatar + notification
  children.push(rect(W-56, 58, 40, 40, C.accentSoft, { r:20 }));
  children.push(txt('K', W-36, 70, 16, C.accent, { align:'CENTER', weight:'Bold', w:40 }));
  children.push(rect(W-26, 54, 16, 16, C.accent, { r:8 }));
  children.push(txt('3', W-18, 57, 9, C.white, { align:'CENTER', weight:'Bold', w:16 }));

  // Metric row
  const metrics = [
    { label:'Agents Active', val:'5', color:C.green, bg:C.greenSoft },
    { label:'Pending Review', val:'12', color:C.amber, bg:C.amberSoft },
    { label:'Done Today', val:'47', color:C.accent, bg:C.accentSoft },
  ];
  const MW = (W-48)/3;
  metrics.forEach((m,i) => {
    const mx = 20 + i*(MW+4);
    children.push(rect(mx, 144, MW, 88, m.bg, { r:16 }));
    children.push(txt(m.val, mx+MW/2, 164, 30, m.color, { align:'CENTER', weight:'Bold', w:MW }));
    children.push(txt(m.label, mx+8, 200, 10, m.color, { align:'CENTER', weight:'Medium', w:MW-16 }));
  });

  // Section: Your Agents
  children.push(txt('Your Agents', 20, 254, 16, C.text, { weight:'SemiBold', w:200 }));
  children.push(txt('5 running', W-70, 256, 13, C.textSub, { w:60, align:'RIGHT' }));

  // Agent cards
  const agents = [
    { name:'Aria', task:'Drafting Q1 release notes', pct:73, status:'active' },
    { name:'Rex', task:'Triaging 18 support tickets', pct:51, status:'active' },
    { name:'Nova', task:'Reviewing PR #1047', pct:100, status:'review' },
  ];
  agents.forEach((a, i) => {
    const ay = 280 + i * 82;
    children.push(rect(20, ay, W-40, 74, C.surface, { r:14 }));
    children.push(agentAvatarSmall(32, ay+19, a.name[0], a.status));
    children.push(txt(a.name, 76, ay+20, 14, C.text, { weight:'SemiBold', w:180 }));
    if(a.status==='active')  children.push(pill('● Active', 76+a.name.length*8+8, ay+19, C.greenSoft, C.green, { h:20, size:10 }));
    if(a.status==='review')  children.push(pill('● Review', 76+a.name.length*8+8, ay+19, C.amberSoft, C.amber, { h:20, size:10 }));
    children.push(txt(a.task, 76, ay+38, 12, C.textSub, { w:W-120 }));
    // progress bar
    children.push(rect(76, ay+56, W-116, 4, C.surface2, { r:2 }));
    children.push(rect(76, ay+56, Math.round((W-116)*a.pct/100), 4, a.status==='review'?C.amber:C.accent, { r:2 }));
    children.push(txt(a.pct+'%', W-54, ay+52, 11, C.textSub, { w:36, align:'RIGHT' }));
  });

  // Section: Ready to review
  children.push(txt('Ready to Review', 20, 544, 16, C.text, { weight:'SemiBold', w:200 }));
  children.push(rect(20, 568, W-40, 60, C.amberSoft, { r:14 }));
  children.push(txt('◎', 36, 584, 20, C.amber, { w:24 }));
  children.push(txt('Nova completed: PR #1047 Review', 64, 578, 13, C.text, { weight:'Medium', w:240 }));
  children.push(txt('Confidence 94% · 3 min ago', 64, 596, 11, C.textSub, { w:240 }));
  children.push(pill('Open', W-60, 580, C.amber, C.white, { h:26, size:11, w:44 }));

  // Today's timeline bar
  children.push(txt("Today's Velocity", 20, 648, 14, C.text, { weight:'SemiBold', w:200 }));
  const bars = [8,14,22,31,47];
  const maxB = 47;
  bars.forEach((b,i) => {
    const bx = 20 + i*62;
    const bh = Math.round(b/maxB * 50);
    children.push(rect(bx, 700-bh, 44, bh, i===4?C.accent:C.accentSoft, { r:6 }));
    children.push(txt(['Mon','Tue','Wed','Thu','Fri'][i], bx+22, 704, 10, C.textSub, { align:'CENTER', w:44 }));
    children.push(txt(String(b), bx+22, 688-bh, 10, i===4?C.accent:C.textSub, { align:'CENTER', w:44, weight:'Medium' }));
  });

  children.push(navBar('home'));
  return frame('Home', children);
}

// ─── SCREEN 2: AGENTS ────────────────────────────────────────────────
function agentsScreen() {
  const children = [];
  children.push(rect(0,0,W,H, C.bg));
  children.push(statusBar());
  children.push(txt('Agents', 20, 60, 22, C.text, { weight:'SemiBold', w:200 }));
  children.push(txt('Fleet of 7', W-80, 64, 13, C.textSub, { w:70, align:'RIGHT' }));

  // Tabs
  const tabs = ['All','Active','Review','Idle'];
  tabs.forEach((t,i) => {
    const tw = t==='All'?48:t==='Review'?62:54;
    const tx = 20 + [0,52,110,176][i];
    children.push(rect(tx, 90, tw, 30, t==='All'?C.accent:C.surface, { r:8 }));
    children.push(txt(t, tx+tw/2, 98, 12, t==='All'?C.white:C.textSub, { align:'CENTER', weight:t==='All'?'Medium':'Regular', w:tw }));
  });

  // Agent list
  const agentList = [
    { name:'Aria',  role:'Content Agent',    task:'Drafting Q1 release notes',     pct:73, status:'active',  model:'GPT-4o',   tasks:142 },
    { name:'Rex',   role:'Support Agent',    task:'Triaging 18 support tickets',   pct:51, status:'active',  model:'Claude 3', tasks:318 },
    { name:'Nova',  role:'Code Review Agent',task:'Reviewing PR #1047',            pct:100,status:'review',  model:'Gemini 2', tasks:87  },
    { name:'Dex',   role:'Data Agent',       task:'Building conversion report',    pct:38, status:'active',  model:'GPT-4o',   tasks:204 },
    { name:'Sage',  role:'Research Agent',   task:'Standby — no tasks assigned',  pct:0,  status:'idle',    model:'Claude 3', tasks:61  },
  ];
  agentList.forEach((a,i) => {
    const ay = 138 + i * 108;
    children.push(rect(20, ay, W-40, 100, C.surface, { r:16 }));

    // avatar
    const sc = a.status==='active' ? C.green : a.status==='review' ? C.amber : C.textSub;
    children.push(rect(32, ay+16, 44, 44, C.accentSoft, { r:14 }));
    children.push(txt(a.name[0], 54, ay+28, 18, C.accent, { align:'CENTER', weight:'Bold', w:44 }));
    // status dot
    children.push(rect(62, ay+50, 12, 12, sc, { r:6 }));
    children.push(rect(63, ay+51, 10, 10, C.surface, { r:5 }));
    children.push(rect(65, ay+53, 6, 6, sc, { r:3 }));

    // Info
    children.push(txt(a.name, 86, ay+18, 15, C.text, { weight:'SemiBold', w:180 }));
    children.push(txt(a.role, 86, ay+36, 11, C.textSub, { w:200 }));
    children.push(txt(a.task, 86, ay+52, 11, C.text, { w:W-150 }));

    // Progress
    if(a.pct>0) {
      children.push(rect(86, ay+70, W-130, 4, C.surface2, { r:2 }));
      children.push(rect(86, ay+70, Math.round((W-130)*a.pct/100), 4, a.status==='review'?C.amber:C.accent, { r:2 }));
    }

    // Badges
    children.push(pill(a.model, W-100, ay+16, C.surface2, C.textSub, { h:22, size:10 }));
    children.push(txt(a.tasks+' tasks', W-96, ay+42, 10, C.textSub, { w:80, align:'RIGHT' }));
    if(a.status==='review') children.push(pill('● Needs review', 86, ay+78, C.amberSoft, C.amber, { h:18, size:9, w:98 }));
    if(a.status==='idle') {
      children.push(txt('No task assigned', 86, ay+68, 11, C.textSub, { w:180 }));
      children.push(pill('Assign task →', W-116, ay+72, C.accentSoft, C.accent, { h:24, size:10, w:92 }));
    }
  });

  children.push(navBar('agents'));
  return frame('Agents', children);
}

// ─── SCREEN 3: QUEUE ─────────────────────────────────────────────────
function queueScreen() {
  const children = [];
  children.push(rect(0,0,W,H, C.bg));
  children.push(statusBar());
  children.push(txt('Queue', 20, 60, 22, C.text, { weight:'SemiBold', w:200 }));
  children.push(txt('24 open', W-80, 64, 13, C.textSub, { w:70, align:'RIGHT' }));

  // Filters
  children.push(rect(20, 92, 88, 30, C.accent, { r:8 }));
  children.push(txt('All tasks', 64, 100, 12, C.white, { align:'CENTER', weight:'Medium', w:88 }));
  children.push(rect(112, 92, 80, 30, C.surface, { r:8 }));
  children.push(txt('AI assigned', 152, 100, 12, C.textSub, { align:'CENTER', w:80 }));
  children.push(rect(196, 92, 66, 30, C.surface, { r:8 }));
  children.push(txt('Human', 229, 100, 12, C.textSub, { align:'CENTER', w:66 }));
  children.push(rect(266, 92, 66, 30, C.surface, { r:8 }));
  children.push(txt('Blocked', 299, 100, 12, C.textSub, { align:'CENTER', w:66 }));

  // Label
  children.push(txt('HIGH PRIORITY', 20, 140, 10, C.textSub, { weight:'SemiBold', ls:1, w:180 }));

  const tasks = [
    { title:'Fix auth token expiry bug',    agent:'Rex',  type:'AI',    priority:'high',  age:'2h',  conf:88 },
    { title:'Write onboarding email copy',  agent:'Aria', type:'AI',    priority:'high',  age:'4h',  conf:92 },
    { title:'Review Q1 OKR doc',            agent:'—',    type:'Human', priority:'high',  age:'1d',  conf:0  },
    { title:'Migrate legacy DB endpoints',  agent:'Dex',  type:'AI',    priority:'med',   age:'6h',  conf:76 },
    { title:'Design audit — landing page',  agent:'—',    type:'Human', priority:'med',   age:'2d',  conf:0  },
    { title:'Generate weekly metrics PDF',  agent:'Nova', type:'AI',    priority:'med',   age:'12h', conf:94 },
  ];
  let yOff = 158;
  tasks.forEach((t, i) => {
    if(i===2) { yOff += 12; children.push(txt('NORMAL PRIORITY', 20, yOff, 10, C.textSub, { weight:'SemiBold', ls:1, w:180 })); yOff += 20; }
    const bg = t.type==='AI' ? C.surface : C.surface;
    children.push(rect(20, yOff, W-40, 68, bg, { r:14 }));

    // Left accent stripe for priority
    children.push(rect(20, yOff, 3, 68, t.priority==='high'?C.accent:C.border, { r:2 }));

    // Assignee indicator
    if(t.type==='AI') {
      children.push(rect(32, yOff+16, 32, 32, C.accentSoft, { r:10 }));
      children.push(txt(t.agent[0], 48, yOff+24, 13, C.accent, { align:'CENTER', weight:'Bold', w:32 }));
    } else {
      children.push(rect(32, yOff+16, 32, 32, C.surface2, { r:10 }));
      children.push(txt('👤', 48, yOff+24, 13, C.textSub, { align:'CENTER', w:32 }));
    }

    children.push(txt(t.title, 72, yOff+16, 13, C.text, { weight:'Medium', w:W-150 }));
    if(t.type==='AI') {
      children.push(txt(`${t.agent} · ${t.conf}% conf · ${t.age}`, 72, yOff+36, 11, C.textSub, { w:W-100 }));
    } else {
      children.push(txt(`Unassigned · ${t.age} old`, 72, yOff+36, 11, C.textSub, { w:W-100 }));
    }

    // Type pill
    const pcolor = t.type==='AI' ? C.accentSoft : C.surface2;
    const tcolor = t.type==='AI' ? C.accent : C.textSub;
    children.push(pill(t.type, W-60, yOff+22, pcolor, tcolor, { h:22, size:10, w:40 }));

    yOff += 76;
  });

  children.push(navBar('queue'));
  return frame('Queue', children);
}

// ─── SCREEN 4: REVIEW ────────────────────────────────────────────────
function reviewScreen() {
  const children = [];
  children.push(rect(0,0,W,H, C.bg));
  children.push(statusBar());
  children.push(txt('Review', 20, 60, 22, C.text, { weight:'SemiBold', w:200 }));
  children.push(txt('12 pending', W-90, 64, 13, C.amber, { w:80, align:'RIGHT', weight:'Medium' }));

  // Info banner
  children.push(rect(20, 92, W-40, 52, C.amberSoft, { r:14 }));
  children.push(txt('◎', 36, 107, 18, C.amber, { w:20 }));
  children.push(txt('3 agents are waiting on your approval to proceed', 60, 101, 12, C.text, { w:280 }));
  children.push(txt('Reviewing these unlocks 8 downstream tasks', 60, 117, 11, C.textSub, { w:280 }));

  // Review items
  const reviews = [
    {
      agent:'Nova', role:'Code Review Agent',
      title:'PR #1047 — Auth Token Refresh Logic',
      summary:'Reviewed 284 lines across 6 files. Found 2 minor issues, 1 suggestion. No blocking errors.',
      conf:94, time:'3 min ago', files:6, lines:284,
    },
    {
      agent:'Aria', role:'Content Agent',
      title:'Q1 Release Notes Draft',
      summary:'Drafted 1,200 words across 5 sections. Tone matches brand guidelines. Ready for final edit.',
      conf:91, time:'28 min ago', files:1, lines:0,
    },
    {
      agent:'Rex', role:'Support Agent',
      title:'Ticket Triage — Batch #18',
      summary:'Categorised 18 tickets: 11 bugs, 5 feature requests, 2 duplicates. Priority scores assigned.',
      conf:88, time:'1 hr ago', files:0, lines:0,
    },
  ];
  reviews.forEach((r, i) => {
    const ry = 164 + i*208;
    children.push(rect(20, ry, W-40, 196, C.surface, { r:16 }));

    // Top row
    children.push(rect(32, ry+16, 36, 36, C.accentSoft, { r:11 }));
    children.push(txt(r.agent[0], 50, ry+26, 15, C.accent, { align:'CENTER', weight:'Bold', w:36 }));
    children.push(txt(r.agent, 76, ry+18, 14, C.text, { weight:'SemiBold', w:200 }));
    children.push(txt(r.role, 76, ry+36, 11, C.textSub, { w:200 }));
    children.push(txt(r.time, W-80, ry+20, 11, C.textSub, { w:68, align:'RIGHT' }));

    // Divider
    children.push(rect(32, ry+60, W-64, 1, C.border));

    // Title + summary
    children.push(txt(r.title, 32, ry+72, 13, C.text, { weight:'SemiBold', w:W-64 }));
    children.push(txt(r.summary, 32, ry+92, 12, C.textSub, { w:W-64, lh:18 }));

    // Confidence bar
    children.push(txt('Confidence', 32, ry+140, 11, C.textSub, { w:90 }));
    children.push(txt(r.conf+'%', W-56, ry+138, 12, r.conf>90?C.green:C.amber, { w:40, align:'RIGHT', weight:'SemiBold' }));
    children.push(rect(32, ry+155, W-64, 5, C.surface2, { r:2.5 }));
    children.push(rect(32, ry+155, Math.round((W-64)*r.conf/100), 5, r.conf>90?C.green:C.amber, { r:2.5 }));

    // Action buttons
    children.push(rect(32, ry+170, (W-76)/2, 18, C.greenSoft, { r:8 }));
    children.push(txt('✓ Approve', 32+(W-76)/4, ry+174, 11, C.green, { align:'CENTER', weight:'SemiBold', w:(W-76)/2 }));
    children.push(rect(32+(W-76)/2+12, ry+170, (W-76)/2, 18, C.surface2, { r:8 }));
    children.push(txt('Request changes', 32+(W-76)/2+12+(W-76)/4, ry+174, 11, C.textSub, { align:'CENTER', weight:'Regular', w:(W-76)/2 }));
  });

  children.push(navBar('review'));
  return frame('Review', children);
}

// ─── SCREEN 5: INSIGHTS ──────────────────────────────────────────────
function insightsScreen() {
  const children = [];
  children.push(rect(0,0,W,H, C.bg));
  children.push(statusBar());
  children.push(txt('Insights', 20, 60, 22, C.text, { weight:'SemiBold', w:200 }));
  children.push(txt('Last 30 days', W-100, 64, 13, C.textSub, { w:90, align:'RIGHT' }));

  // Hero metric
  children.push(rect(20, 92, W-40, 110, C.accent, { r:20 }));
  children.push(txt('127', W/2, 118, 52, C.white, { align:'CENTER', weight:'Bold', w:W-40 }));
  children.push(txt('hours saved by AI agents', W/2, 176, 14, 'rgba(255,255,255,0.8)', { align:'CENTER', weight:'Regular', w:W-40 }));
  // small badge
  children.push(rect(W/2-50, 192, 100, 4, 'rgba(255,255,255,0.3)', { r:2 }));

  // Sub metrics
  const mets = [
    { l:'Completion Rate', v:'94%', d:'+6% vs prev' },
    { l:'Avg Confidence', v:'89%', d:'↑ improving' },
    { l:'Human Reviews', v:'147', d:'31% fewer' },
    { l:'Tasks / Agent / Day', v:'12.4', d:'↑ from 9.1' },
  ];
  mets.forEach((m,i) => {
    const mx = 20 + (i%2)*(W/2-10);
    const my = 216 + Math.floor(i/2)*80;
    children.push(rect(mx, my, W/2-30, 72, C.surface, { r:14 }));
    children.push(txt(m.v, mx+16, my+14, 24, C.text, { weight:'Bold', w:120 }));
    children.push(txt(m.l, mx+16, my+42, 11, C.textSub, { w:140 }));
    children.push(txt(m.d, mx+16, my+56, 11, C.green, { w:140, weight:'Medium' }));
  });

  // Agent leaderboard
  children.push(txt('Agent Performance', 20, 386, 15, C.text, { weight:'SemiBold', w:220 }));
  const leaders = [
    { name:'Rex',  score:9.4, tasks:318, bar:0.94 },
    { name:'Aria', score:9.1, tasks:142, bar:0.91 },
    { name:'Dex',  score:8.7, tasks:204, bar:0.87 },
    { name:'Nova', score:8.2, tasks:87,  bar:0.82 },
  ];
  leaders.forEach((l,i) => {
    const ly = 410 + i*72;
    children.push(rect(20, ly, W-40, 64, C.surface, { r:12 }));
    // rank badge
    children.push(rect(32, ly+22, 24, 24, i===0?C.accentSoft:C.surface2, { r:8 }));
    children.push(txt(String(i+1), 44, ly+28, 12, i===0?C.accent:C.textSub, { align:'CENTER', weight:'Bold', w:24 }));
    children.push(txt(l.name, 64, ly+18, 14, C.text, { weight:'SemiBold', w:120 }));
    children.push(txt(l.tasks+' tasks', 64, ly+36, 11, C.textSub, { w:100 }));
    // score
    children.push(txt(String(l.score), W-64, ly+20, 18, C.text, { align:'RIGHT', weight:'Bold', w:50 }));
    children.push(txt('/10', W-36, ly+26, 11, C.textSub, { w:30 }));
    // bar
    children.push(rect(64, ly+52, W-100, 4, C.surface2, { r:2 }));
    children.push(rect(64, ly+52, Math.round((W-100)*l.bar), 4, C.accent, { r:2 }));
  });

  children.push(navBar('insights'));
  return frame('Insights', children);
}

// ─── BUILD PEN FILE ──────────────────────────────────────────────────
const pen = {
  meta: {
    name: 'Rally',
    version: '2.8',
    slug: SLUG,
    tagline: 'Your humans and agents, in sync',
    description: "AI agent + human team coordination dashboard. Inspired by Linear's teams and agents paradigm.",
    archetype: 'productivity-ai',
    theme: 'light',
    createdAt: new Date().toISOString(),
  },
  canvas: {
    width: W * 6,
    height: H,
    background: C.bg,
  },
  screens: [
    { ...homeScreen(),     x: 0 },
    { ...agentsScreen(),   x: W },
    { ...queueScreen(),    x: W*2 },
    { ...reviewScreen(),   x: W*3 },
    { ...insightsScreen(), x: W*4 },
  ],
};

const out = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(out, JSON.stringify(pen, null, 2));
console.log(`✓ Written: ${out} (${(fs.statSync(out).size/1024).toFixed(1)} KB)`);
