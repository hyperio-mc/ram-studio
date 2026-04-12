'use strict';
// crew-app.js — Heartbeat #12 (DARK)
// CREW — AI Workforce Platform
// "Hire agents. Set goals. Ship work."
// Inspired by: Paperclip (Lapa Ninja) "zero-human companies. Hire AI employees" +
//              Evervault (Godly) deep dark precision security aesthetic +
//              Mixpanel "AI Digital Analytics reimagined for an AI-first world"
// Palette: Deep slate #0D0F14 + electric cyan #06B6D4 + emerald #10B981 + amber #F59E0B

const fs   = require('fs');
const path = require('path');

// ── Pencil.dev v2.8 primitives ─────────────────────────────────────────────
const elements = [];
let eid = 1;
function el(type, props) { elements.push({ id: `e${eid++}`, type, ...props }); }
function rect(x,y,w,h,fill,opts={}) {
  el('rect',{x,y,width:w,height:h,fill,
    rx:opts.rx??0,ry:opts.ry??0,
    opacity:opts.opacity??1,stroke:opts.stroke??'none',
    strokeWidth:opts.sw??0});
}
function text(x,y,content,size,fill,opts={}) {
  el('text',{x,y,content:String(content),fontSize:size,fill,
    fontWeight:opts.fw??400,fontFamily:opts.font??'Inter',
    textAnchor:opts.anchor??'start',opacity:opts.opacity??1,
    letterSpacing:opts.ls??0});
}
function circle(cx,cy,r,fill,opts={}) {
  el('circle',{cx,cy,r,fill,opacity:opts.opacity??1,
    stroke:opts.stroke??'none',strokeWidth:opts.sw??0});
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  el('line',{x1,y1,x2,y2,stroke,strokeWidth:opts.sw??1,opacity:opts.opacity??1});
}

// ── Palette ────────────────────────────────────────────────────────────────
const P = {
  BG:       '#0D0F14',
  SURF:     '#12151D',
  CARD:     '#1A1E2A',
  CARD2:    '#1E2333',
  BORDER:   '#252D40',
  BORDER2:  '#2E3850',
  CYAN:     '#06B6D4',
  CYAN2:    '#0891B2',
  CYAN3:    '#67E8F9',
  EMERALD:  '#10B981',
  EMER2:    '#059669',
  AMBER:    '#F59E0B',
  AMBER2:   '#D97706',
  ROSE:     '#F43F5E',
  VIOLET:   '#8B5CF6',
  TEXT:     '#E2E8F0',
  TEXT2:    '#94A3B8',
  TEXT3:    '#475569',
};

// ── Width / height ──────────────────────────────────────────────────────────
const W = 390, H = 844;

const screens = [];

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 1 — Workforce Dashboard
// ─────────────────────────────────────────────────────────────────────────────
{
  elements.length = 0; eid = 1;

  // BG
  rect(0,0,W,H,P.BG);

  // Status bar
  rect(0,0,W,44,P.SURF);
  text(20,28,'9:41',13,P.TEXT2,{fw:500});
  text(340,28,'●●●',13,P.TEXT2);

  // Nav bar
  rect(0,44,W,52,P.SURF);
  rect(0,95,W,1,P.BORDER);
  text(20,78,'CREW',16,P.CYAN,{fw:700,ls:2});
  // avatar
  circle(355,70,14,P.CARD2);
  circle(355,70,14,'none',{stroke:P.BORDER2,sw:1.5});
  text(349,75,'R',11,P.TEXT2,{fw:600});

  // "Workforce" tab bar
  rect(0,96,W,40,P.SURF);
  rect(0,135,W,1,P.BORDER);
  const tabs = ['Workforce','Tasks','Deliverables','Analytics'];
  const tw = W/tabs.length;
  tabs.forEach((t,i) => {
    if(i===0) {
      rect(i*tw,96,tw,40,P.SURF);
      rect(i*tw+6,132,tw-12,3,P.CYAN,{rx:2});
      text(i*tw+tw/2,121,t,11,P.CYAN,{fw:600,anchor:'middle'});
    } else {
      text(i*tw+tw/2,121,t,11,P.TEXT3,{fw:500,anchor:'middle'});
    }
  });

  // ── Top metrics row ────────────────────────────────────────────────────────
  const metrics = [
    { label:'AGENTS', val:'12', sub:'active', col:P.CYAN },
    { label:'TASKS', val:'47', sub:'running', col:P.EMERALD },
    { label:'QUALITY', val:'94%', sub:'avg score', col:P.AMBER },
    { label:'COST', val:'$128', sub:'/day', col:P.TEXT2 },
  ];
  const mw = (W-40)/4;
  metrics.forEach((m,i) => {
    const x = 20 + i*mw;
    rect(x,148,mw-8,68,P.CARD,{rx:10});
    rect(x,148,mw-8,2,m.col,{rx:1});
    text(x+(mw-8)/2,175,m.val,18,m.col,{fw:700,anchor:'middle'});
    text(x+(mw-8)/2,191,m.label,8,P.TEXT3,{fw:700,anchor:'middle',ls:1.5});
    text(x+(mw-8)/2,205,m.sub,8,P.TEXT3,{anchor:'middle'});
  });

  // ── Agent grid ─────────────────────────────────────────────────────────────
  text(20,238,'Your Team',14,P.TEXT,{fw:600});
  text(W-20,238,'Hire Agent +',11,P.CYAN,{anchor:'end',fw:500});

  const agents = [
    { name:'Alex', role:'Research', model:'claude-3.5', status:'working', task:'Market analysis Q2', util:78, col:P.CYAN },
    { name:'Maya', role:'Writer', model:'gpt-4o', status:'working', task:'Blog post: AI trends', util:92, col:P.EMERALD },
    { name:'Kai', role:'Analyst', model:'claude-3.5', status:'reviewing', task:'Competitor brief', util:45, col:P.AMBER },
    { name:'Sam', role:'Dev', model:'deepseek', status:'idle', task:'—', util:0, col:P.VIOLET },
    { name:'Rae', role:'Email', model:'gpt-4o-mini', status:'working', task:'Outreach seq #4', util:61, col:P.EMERALD },
    { name:'Dex', role:'Research', model:'claude-3-haiku', status:'working', task:'Industry report', util:88, col:P.CYAN },
  ];

  const aw = (W-40-12)/2;
  agents.forEach((a,i) => {
    const col = i%2===0 ? 20 : 20+aw+12;
    const row = Math.floor(i/2);
    const y = 250 + row*118;

    rect(col,y,aw,108,P.CARD,{rx:12});
    rect(col,y,aw,2,a.col,{rx:1}); // accent top line

    // status dot
    const sdot = a.status==='working' ? P.EMERALD : a.status==='reviewing' ? P.AMBER : P.TEXT3;
    circle(col+aw-20,y+20,5,sdot);
    if(a.status==='working') rect(col+aw-20-5,y+15,10,10,'none',{stroke:sdot,sw:1,rx:10,opacity:0.3});

    // avatar circle
    circle(col+24,y+28,14,a.col,{opacity:0.15});
    circle(col+24,y+28,14,'none',{stroke:a.col,sw:1.5});
    text(col+24,y+33,a.name[0],12,a.col,{fw:700,anchor:'middle'});

    text(col+46,y+22,a.name,13,P.TEXT,{fw:600});
    text(col+46,y+37,a.role+' Agent',10,P.TEXT2);

    // model badge
    rect(col+46,y+45,64,16,P.CARD2,{rx:4});
    text(col+78,y+56,a.model,8,P.TEXT3,{anchor:'middle',fw:500});

    // current task
    text(col+12,y+72,a.task.length>22?a.task.slice(0,22)+'…':a.task,9,P.TEXT2);

    // utilization bar
    rect(col+12,y+90,aw-24,4,P.BORDER,{rx:2});
    if(a.util>0) rect(col+12,y+90,Math.round((aw-24)*a.util/100),4,a.col,{rx:2});
    text(col+aw-16,y+95,a.util+'%',8,P.TEXT3,{anchor:'end'});
  });

  // Bottom nav bar
  rect(0,H-56,W,56,P.SURF);
  rect(0,H-57,W,1,P.BORDER);
  const navItems = ['⌂','☰','✦','◈','⚙'];
  const navLabels = ['Home','Tasks','Review','Stats','Config'];
  const nw = W/5;
  navItems.forEach((ic,i) => {
    const nx = i*nw + nw/2;
    text(nx,H-32,ic,18,i===0?P.CYAN:P.TEXT3,{anchor:'middle'});
    text(nx,H-16,navLabels[i],9,i===0?P.CYAN:P.TEXT3,{anchor:'middle',fw:i===0?600:400});
  });

  const svgEls = elements.map(renderEl).join('\n');
  screens.push({ name:'Workforce', svg: makeSVG(svgEls), elements:[...elements] });
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 2 — Agent Profile
// ─────────────────────────────────────────────────────────────────────────────
{
  elements.length = 0; eid = 1;

  rect(0,0,W,H,P.BG);

  // status bar
  rect(0,0,W,44,P.SURF);
  text(20,28,'9:41',13,P.TEXT2,{fw:500});

  // top bar
  rect(0,44,W,52,P.SURF);
  rect(0,95,W,1,P.BORDER);
  text(20,78,'← Agent Profile',13,P.TEXT,{fw:500});
  // status badge
  rect(W-100,58,80,20,P.EMERALD,{rx:10,opacity:0.15});
  rect(W-100,58,80,20,'none',{stroke:P.EMERALD,sw:1,rx:10});
  circle(W-94,68,4,P.EMERALD);
  text(W-86,73,'Working',10,P.EMERALD,{fw:600});

  // ── Hero card ──────────────────────────────────────────────────────────────
  rect(20,108,W-40,116,P.CARD,{rx:16});
  rect(20,108,W-40,3,P.CYAN,{rx:2}); // top accent

  // big avatar
  circle(64,162,28,P.CYAN,{opacity:0.12});
  circle(64,162,28,'none',{stroke:P.CYAN,sw:2});
  text(64,169,'A',18,P.CYAN,{fw:700,anchor:'middle'});

  text(104,138,'Alex-Research-01',15,P.TEXT,{fw:700});
  text(104,156,'Research Analyst',11,P.TEXT2,{fw:400});
  text(104,173,'Hired Feb 14, 2026',10,P.TEXT3);

  // model badge
  rect(104,182,90,18,P.CARD2,{rx:5});
  text(149,194,'claude-3.5-sonnet',9,P.TEXT2,{anchor:'middle',fw:500});

  // ── Stats row ──────────────────────────────────────────────────────────────
  const aStats = [
    { val:'186', label:'Tasks Done' },
    { val:'94%', label:'Quality' },
    { val:'8.2m', label:'Avg Speed' },
    { val:'$0.34', label:'Per Task' },
  ];
  const sw2 = (W-40)/4;
  aStats.forEach((s,i) => {
    const x = 20 + i*sw2;
    rect(x,236,sw2,64,P.SURF,{rx:0});
    if(i>0) line(x,246,x,290,P.BORDER);
    text(x+sw2/2,265,s.val,16,P.TEXT,{fw:700,anchor:'middle'});
    text(x+sw2/2,282,s.label,9,P.TEXT3,{anchor:'middle'});
  });
  rect(20,236,W-40,64,P.CARD2,{rx:12,opacity:0}); // invisible border wrapper
  rect(20,235,W-40,1,P.BORDER);
  rect(20,299,W-40,1,P.BORDER);

  // ── Current Assignment ─────────────────────────────────────────────────────
  text(20,326,'Current Assignment',12,P.TEXT2,{fw:600,ls:0.5});
  rect(20,336,W-40,72,P.CARD,{rx:12});
  rect(20,336,4,72,P.CYAN,{rx:2});
  text(34,356,'Market Analysis Q2 2026',13,P.TEXT,{fw:600});
  text(34,373,'Assigned by Rakis · Due Apr 12 · 78% complete',10,P.TEXT2);
  // progress bar
  rect(34,386,W-74,6,P.BORDER,{rx:3});
  rect(34,386,Math.round((W-74)*0.78),6,P.CYAN,{rx:3});
  text(W-30,391,'78%',9,P.CYAN,{anchor:'end',fw:600});

  // ── Capabilities ───────────────────────────────────────────────────────────
  text(20,430,'Capabilities & Permissions',12,P.TEXT2,{fw:600,ls:0.5});
  const caps = [
    { label:'Web Search', on:true }, { label:'Email', on:false },
    { label:'File Read', on:true }, { label:'Code Exec', on:false },
    { label:'Publish', on:false }, { label:'API Calls', on:true },
  ];
  caps.forEach((c,i) => {
    const cx = 20 + (i%2)*(W/2-4);
    const cy = 440 + Math.floor(i/2)*30;
    circle(cx+8,cy+8,5,c.on?P.EMERALD:P.TEXT3,{opacity:c.on?1:0.4});
    text(cx+20,cy+12,c.label,11,c.on?P.TEXT:P.TEXT3);
    if(c.on) {
      rect(W/2*(i%2)+W-80,cy,28,16,P.EMERALD,{rx:4,opacity:0.1});
      text(W/2*(i%2)+W-80+14,cy+11,'ON',8,P.EMERALD,{anchor:'middle',fw:700});
    }
  });

  // ── 30-day performance sparkline ───────────────────────────────────────────
  text(20,542,'30-Day Performance',12,P.TEXT2,{fw:600,ls:0.5});
  rect(20,554,W-40,80,P.CARD,{rx:12});
  // grid lines
  [0,25,50,75].forEach(pct => {
    const gy = 554+72 - pct*0.55;
    line(30,gy,W-30,gy,P.BORDER,{opacity:0.5});
  });
  // bars (30 days quality scores)
  const qdata = [88,91,85,93,90,94,89,92,96,91,95,88,93,97,94,92,96,98,91,94,96,93,97,92,95,98,94,96,99,94];
  const bw = (W-60)/30;
  qdata.forEach((q,i) => {
    const bh = (q-80)*0.85;
    const bx = 30 + i*bw;
    const by = 554+68-bh;
    rect(bx,by,bw-1,bh,P.CYAN,{rx:1,opacity:0.6+0.4*(q/100)});
  });
  text(30,614,'80',8,P.TEXT3);
  text(30,596,'90',8,P.TEXT3);
  text(30,578,'100',8,P.TEXT3);

  // ── Recent deliverables ────────────────────────────────────────────────────
  text(20,654,'Recent Deliverables',12,P.TEXT2,{fw:600,ls:0.5});
  const recents = [
    { title:'SaaS Market Deep Dive', type:'Analysis', rating:'97', dt:'Apr 7' },
    { title:'Competitor Landscape EU', type:'Report', rating:'93', dt:'Apr 5' },
    { title:'Q1 Research Summary', type:'Doc', rating:'89', dt:'Apr 2' },
  ];
  recents.forEach((r,i) => {
    const ry = 664 + i*52;
    rect(20,ry,W-40,44,P.CARD,{rx:8});
    // type badge
    rect(W-90,ry+12,44,18,P.CYAN,{rx:4,opacity:0.12});
    text(W-68,ry+24,r.type,8,P.CYAN,{anchor:'middle',fw:600});
    text(32,ry+17,r.title,12,P.TEXT,{fw:500});
    text(32,ry+31,r.dt,9,P.TEXT3);
    // rating
    circle(W-116,ry+22,12,P.CARD2);
    text(W-116,ry+27,r.rating,9,P.EMERALD,{anchor:'middle',fw:700});
  });

  // bottom nav
  rect(0,H-56,W,56,P.SURF);
  rect(0,H-57,W,1,P.BORDER);
  const ni2=['⌂','☰','✦','◈','⚙']; const nl2=['Home','Tasks','Review','Stats','Config'];
  const nw2=W/5;
  ni2.forEach((ic,i)=>{const nx=i*nw2+nw2/2;text(nx,H-32,ic,18,P.TEXT3,{anchor:'middle'});text(nx,H-16,nl2[i],9,P.TEXT3,{anchor:'middle'});});

  const svgEls = elements.map(renderEl).join('\n');
  screens.push({ name:'Agent Profile', svg:makeSVG(svgEls), elements:[...elements] });
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 3 — Task Board (Kanban)
// ─────────────────────────────────────────────────────────────────────────────
{
  elements.length = 0; eid = 1;

  rect(0,0,W,H,P.BG);
  rect(0,0,W,44,P.SURF);
  text(20,28,'9:41',13,P.TEXT2,{fw:500});
  rect(0,44,W,52,P.SURF);
  rect(0,95,W,1,P.BORDER);
  text(20,78,'Task Board',16,P.TEXT,{fw:600});
  // new task btn
  rect(W-92,56,72,22,P.CYAN,{rx:11});
  text(W-56,71,'+ New Task',10,'#0D0F14',{anchor:'middle',fw:700});

  // ── Column headers ────────────────────────────────────────────────────────
  const cols = [
    { label:'QUEUED', count:8, col:P.TEXT3 },
    { label:'RUNNING', count:14, col:P.CYAN },
    { label:'REVIEW', count:6, col:P.AMBER },
    { label:'APPROVED', count:19, col:P.EMERALD },
  ];
  const cw = W/4;
  cols.forEach((c,i) => {
    text(i*cw+cw/2,117,c.label,8,c.col,{anchor:'middle',fw:700,ls:1});
    circle(i*cw+cw/2+24,111,8,c.col,{opacity:0.15});
    text(i*cw+cw/2+24,115,c.count,8,c.col,{anchor:'middle',fw:700});
  });

  rect(0,128,W,1,P.BORDER);

  // ── Task cards ─────────────────────────────────────────────────────────────
  const tasks = [
    // col 0 = QUEUED
    { col:0, title:'Social media audit', agent:'Sam', type:'Analysis', priority:'LOW', col2:P.VIOLET },
    { col:0, title:'Privacy policy update', agent:'Maya', type:'Doc', priority:'MED', col2:P.AMBER },
    // col 1 = RUNNING
    { col:1, title:'Market Analysis Q2', agent:'Alex', type:'Research', priority:'HIGH', col2:P.CYAN },
    { col:1, title:'Blog post: AI 2026', agent:'Maya', type:'Writing', priority:'HIGH', col2:P.CYAN },
    { col:1, title:'Outreach seq #4', agent:'Rae', type:'Email', priority:'MED', col2:P.EMERALD },
    // col 2 = REVIEW
    { col:2, title:'Competitor brief', agent:'Kai', type:'Analysis', priority:'HIGH', col2:P.AMBER },
    { col:2, title:'Homepage copy v3', agent:'Maya', type:'Writing', priority:'MED', col2:P.AMBER },
    // col 3 = APPROVED
    { col:3, title:'SaaS Market Deep Dive', agent:'Alex', type:'Research', priority:'HIGH', col2:P.EMERALD },
    { col:3, title:'Q1 Summary Report', agent:'Alex', type:'Report', priority:'MED', col2:P.EMERALD },
  ];
  const colCards = [0,0,0,0];
  tasks.forEach(t => {
    const ci = t.col;
    const cx = ci*cw + 6;
    const cy = 136 + colCards[ci]*80;
    colCards[ci]++;

    rect(cx,cy,cw-12,70,P.CARD,{rx:8});
    rect(cx,cy,3,70,t.col2,{rx:2});

    // priority
    const priCol = t.priority==='HIGH'?P.ROSE:t.priority==='MED'?P.AMBER:P.TEXT3;
    rect(cw*ci+cw-30,cy+8,22,12,priCol,{rx:3,opacity:0.15});
    text(cw*ci+cw-19,cy+17,t.priority,6,priCol,{anchor:'middle',fw:700});

    text(cx+10,cy+17,t.title.length>16?t.title.slice(0,16)+'…':t.title,10,P.TEXT,{fw:600});
    // type chip
    rect(cx+10,cy+26,44,14,P.BORDER,{rx:3});
    text(cx+32,cy+36,t.type,7,P.TEXT2,{anchor:'middle'});
    // agent
    circle(cx+12,cy+52,7,t.col2,{opacity:0.2});
    text(cx+12,cy+56,t.agent[0],7,t.col2,{anchor:'middle',fw:700});
    text(cx+22,cy+56,t.agent,8,P.TEXT2);
  });

  rect(0,H-56,W,56,P.SURF);
  rect(0,H-57,W,1,P.BORDER);
  const ni3=['⌂','☰','✦','◈','⚙']; const nl3=['Home','Tasks','Review','Stats','Config'];
  const nw3=W/5;
  ni3.forEach((ic,i)=>{const nx=i*nw3+nw3/2;text(nx,H-32,ic,18,i===1?P.CYAN:P.TEXT3,{anchor:'middle'});text(nx,H-16,nl3[i],9,i===1?P.CYAN:P.TEXT3,{anchor:'middle',fw:i===1?600:400});});

  const svgEls = elements.map(renderEl).join('\n');
  screens.push({ name:'Task Board', svg:makeSVG(svgEls), elements:[...elements] });
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 4 — Review Deliverable
// ─────────────────────────────────────────────────────────────────────────────
{
  elements.length = 0; eid = 1;

  rect(0,0,W,H,P.BG);
  rect(0,0,W,44,P.SURF);
  text(20,28,'9:41',13,P.TEXT2,{fw:500});
  rect(0,44,W,52,P.SURF);
  rect(0,95,W,1,P.BORDER);
  text(20,78,'← Review',13,P.TEXT,{fw:500});

  // AI confidence
  rect(W-108,56,88,22,P.CARD2,{rx:11});
  circle(W-96,67,5,P.EMERALD);
  text(W-88,72,'AI Score: 94',10,P.EMERALD,{fw:600});

  // ── Task brief ─────────────────────────────────────────────────────────────
  rect(20,108,W-40,86,P.CARD,{rx:12});
  rect(20,108,W-40,3,P.AMBER,{rx:2}); // review = amber
  text(32,130,'Market Analysis Q2 2026',13,P.TEXT,{fw:700});
  text(32,148,'Assigned by Rakis · Alex-Research-01',10,P.TEXT2);
  text(32,164,'Research competitor landscape and market sizing for Q2.',10,P.TEXT2);
  text(32,180,'Sources: 12 web searches · 4 docs analyzed · 1.8h runtime',9,P.TEXT3);

  // agent note
  rect(20,204,W-40,52,P.CARD2,{rx:10});
  circle(34,230,8,P.CYAN,{opacity:0.15});
  text(34,234,'A',8,P.CYAN,{anchor:'middle',fw:700});
  text(48,216,'Alex-Research-01 note:',9,P.CYAN,{fw:600});
  text(48,230,'"Found 3 major competitors not in prior list. EU market',9,P.TEXT2);
  text(48,242,'sizing revised up 23%. High confidence all sources verified."',9,P.TEXT2);

  // ── Deliverable preview ────────────────────────────────────────────────────
  rect(20,268,W-40,320,P.CARD,{rx:12});
  text(32,288,'Market Analysis Q2 2026',13,P.TEXT,{fw:700});
  text(32,304,'Executive Summary',10,P.TEXT2,{fw:600,ls:0.5});
  line(32,312,W-32,312,P.BORDER);

  // doc content simulation
  const docLines = [
    { t:'The enterprise SaaS analytics market grew 34% YoY to reach', col:P.TEXT2 },
    { t:'$8.4B in Q1 2026. Three new entrants pose competitive risk:', col:P.TEXT2 },
    { t:'' },
    { t:'Competitors Identified:', col:P.TEXT, fw:600 },
    { t:'1. DataSphere — Series B, $180M ARR, EU-first approach', col:P.TEXT2 },
    { t:'2. MetricFlow — Open source, 12K GitHub stars, growing fast', col:P.TEXT2 },
    { t:'3. PulseIQ — AI-native, raised $40M, targeting SMB segment', col:P.TEXT2 },
    { t:'' },
    { t:'EU Market Revision:', col:P.TEXT, fw:600 },
    { t:'Previous estimate: €2.1B → Revised: €2.59B (+23%)', col:P.CYAN },
    { t:'Primary driver: GDPR-compliant analytics demand surge.', col:P.TEXT2 },
    { t:'' },
    { t:'Recommendations:', col:P.TEXT, fw:600 },
    { t:'• Prioritize EU compliance certification for Q3 launch', col:P.TEXT2 },
    { t:'• Monitor MetricFlow open source traction weekly', col:P.TEXT2 },
  ];
  docLines.forEach((l,i) => {
    if(l.t) text(32,320+i*14,l.t,8.5,l.col||P.TEXT2,{fw:l.fw||400});
  });

  // Approve/Reject/Revise bar
  rect(0,H-100,W,100,P.SURF);
  rect(0,H-101,W,1,P.BORDER);
  text(20,H-74,'Request revision',12,P.TEXT2,{fw:500});
  text(20,H-58,'Add a note before sending back...',10,P.TEXT3);
  // action buttons
  rect(20,H-40,100,28,P.ROSE,{rx:14,opacity:0.15});
  rect(20,H-40,100,28,'none',{stroke:P.ROSE,sw:1,rx:14});
  text(70,H-23,'✗ Reject',11,P.ROSE,{anchor:'middle',fw:600});
  rect(130,H-40,80,28,P.AMBER,{rx:14,opacity:0.15});
  rect(130,H-40,80,28,'none',{stroke:P.AMBER,sw:1,rx:14});
  text(170,H-23,'Revise',11,P.AMBER,{anchor:'middle',fw:600});
  rect(220,H-40,W-240,28,P.EMERALD,{rx:14});
  text(W/2+60,H-23,'✓ Approve',12,'#0D0F14',{anchor:'middle',fw:700});

  const svgEls = elements.map(renderEl).join('\n');
  screens.push({ name:'Review Deliverable', svg:makeSVG(svgEls), elements:[...elements] });
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 5 — Analytics
// ─────────────────────────────────────────────────────────────────────────────
{
  elements.length = 0; eid = 1;

  rect(0,0,W,H,P.BG);
  rect(0,0,W,44,P.SURF);
  text(20,28,'9:41',13,P.TEXT2,{fw:500});
  rect(0,44,W,52,P.SURF);
  rect(0,95,W,1,P.BORDER);
  text(20,78,'Analytics',16,P.TEXT,{fw:600});

  // Period tabs
  const periods = ['7D','30D','90D','All'];
  const pw = 56;
  periods.forEach((p,i) => {
    if(i===1) {
      rect(W-36-pw*(periods.length-1-i),60,pw-4,24,P.CYAN,{rx:12});
      text(W-36-pw*(periods.length-1-i)+(pw-4)/2,76,p,10,'#0D0F14',{anchor:'middle',fw:700});
    } else {
      text(W-36-pw*(periods.length-1-i)+(pw-4)/2,76,p,10,P.TEXT3,{anchor:'middle'});
    }
  });

  // ── Hero metric ────────────────────────────────────────────────────────────
  rect(20,108,W-40,88,P.CARD,{rx:14});
  text(34,133,'Total Tasks Completed',11,P.TEXT2,{fw:500});
  text(34,163,'1,247',32,P.TEXT,{fw:700});
  text(34,182,'+18.4% vs prior 30D',11,P.EMERALD,{fw:500});
  // mini sparkline in card
  const sparkData = [45,52,49,58,61,55,68,72,65,71,78,82,75,84,88,92,85,91,96,94,89,97,95,98,101,103,99,106,108,112];
  const sw3 = (W-100)/30;
  sparkData.forEach((v,i) => {
    const sh = (v-40)*0.7;
    rect(W-40-30*sw3+i*sw3,188-sh,sw3-1,sh,P.CYAN,{rx:0.5,opacity:0.5+0.5*(v/120)});
  });

  // ── Agent performance table ────────────────────────────────────────────────
  text(20,216,'Agent Performance',13,P.TEXT,{fw:600});
  // header row
  rect(20,228,W-40,24,P.CARD2,{rx:0,opacity:0.5});
  ['Agent','Tasks','Quality','Speed','Cost/Task'].forEach((h,i) => {
    const xs = [32,96,164,228,298];
    text(xs[i],244,h,8,P.TEXT3,{fw:700,ls:0.5});
  });

  const agentPerf = [
    { name:'Alex', role:'Research', tasks:186, quality:94, speed:'8.2m', cost:'$0.34', bar:0.94, col:P.CYAN },
    { name:'Maya', role:'Writer', tasks:204, quality:92, speed:'6.1m', cost:'$0.28', bar:0.92, col:P.EMERALD },
    { name:'Kai', role:'Analyst', tasks:143, quality:89, speed:'11.4m', cost:'$0.41', bar:0.89, col:P.AMBER },
    { name:'Rae', role:'Email', tasks:318, quality:96, speed:'2.3m', cost:'$0.08', bar:0.96, col:P.EMERALD },
    { name:'Dex', role:'Research', tasks:157, quality:91, speed:'9.1m', cost:'$0.36', bar:0.91, col:P.CYAN },
    { name:'Sam', role:'Dev', tasks:89, quality:87, speed:'24.6m', cost:'$1.20', bar:0.87, col:P.VIOLET },
  ];
  agentPerf.forEach((a,i) => {
    const ry = 254 + i*44;
    const isBest = i===3;
    if(isBest) rect(20,ry,W-40,36,P.EMERALD,{rx:0,opacity:0.05});
    rect(20,ry,W-40,1,P.BORDER);

    circle(32,ry+18,7,a.col,{opacity:0.2});
    text(32,ry+22,a.name[0],7,a.col,{anchor:'middle',fw:700});
    text(48,ry+22,a.name,11,P.TEXT,{fw:isBest?600:400});
    text(96,ry+22,a.tasks,10,P.TEXT2,{anchor:'start'});
    // quality bar + number
    rect(164,ry+12,52,8,P.BORDER,{rx:4});
    rect(164,ry+12,Math.round(52*a.bar),8,a.col,{rx:4,opacity:0.8});
    text(164+52+4,ry+20,a.quality+'%',8,a.col,{fw:600});
    text(228,ry+22,a.speed,10,P.TEXT2);
    text(298,ry+22,a.cost,10,P.TEXT2);
    if(isBest) { text(W-28,ry+22,'★',10,P.AMBER,{anchor:'end'}); }
  });

  // ── Cost breakdown ─────────────────────────────────────────────────────────
  const tableBottom = 254 + 6*44;
  text(20,tableBottom+20,'Monthly Cost Breakdown',13,P.TEXT,{fw:600});
  rect(20,tableBottom+32,W-40,80,P.CARD,{rx:12});
  const costItems = [
    { label:'Research (Alex + Dex)', pct:38, val:'$498', col:P.CYAN },
    { label:'Writing + Email (Maya + Rae)', pct:24, val:'$314', col:P.EMERALD },
    { label:'Analysis (Kai)', pct:19, val:'$249', col:P.AMBER },
    { label:'Dev (Sam)', pct:19, val:'$249', col:P.VIOLET },
  ];
  costItems.forEach((c,i) => {
    const cy = tableBottom+48 + i*16;
    text(32,cy,c.label,9,P.TEXT2);
    rect(220,cy-8,W-260,8,P.BORDER,{rx:4});
    rect(220,cy-8,Math.round((W-260)*c.pct/100),8,c.col,{rx:4,opacity:0.7});
    text(W-28,cy,c.val,9,P.TEXT2,{anchor:'end'});
  });

  rect(0,H-56,W,56,P.SURF);
  rect(0,H-57,W,1,P.BORDER);
  const ni5=['⌂','☰','✦','◈','⚙']; const nl5=['Home','Tasks','Review','Stats','Config'];
  const nw5=W/5;
  ni5.forEach((ic,i)=>{const nx=i*nw5+nw5/2;text(nx,H-32,ic,18,i===3?P.CYAN:P.TEXT3,{anchor:'middle'});text(nx,H-16,nl5[i],9,i===3?P.CYAN:P.TEXT3,{anchor:'middle',fw:i===3?600:400});});

  const svgEls = elements.map(renderEl).join('\n');
  screens.push({ name:'Analytics', svg:makeSVG(svgEls), elements:[...elements] });
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 6 — Hire Agent
// ─────────────────────────────────────────────────────────────────────────────
{
  elements.length = 0; eid = 1;

  rect(0,0,W,H,P.BG);
  rect(0,0,W,44,P.SURF);
  text(20,28,'9:41',13,P.TEXT2,{fw:500});
  rect(0,44,W,52,P.SURF);
  rect(0,95,W,1,P.BORDER);
  text(20,78,'← Hire Agent',13,P.TEXT,{fw:500});

  // ── Name & Role ────────────────────────────────────────────────────────────
  text(20,118,'Agent Name',11,P.TEXT2,{fw:500,ls:0.5});
  rect(20,126,W-40,40,P.CARD,{rx:10});
  rect(20,126,W-40,40,'none',{stroke:P.CYAN,sw:1.5,rx:10}); // focused
  text(34,150,'Alex-Research-03',13,P.TEXT);
  // cursor blink sim
  rect(W-60,136,1.5,18,P.CYAN);

  text(20,184,'Role',11,P.TEXT2,{fw:500,ls:0.5});
  const roles = [
    { label:'Researcher', icon:'◎', col:P.CYAN },
    { label:'Writer', icon:'✏', col:P.EMERALD },
    { label:'Analyst', icon:'◈', col:P.AMBER },
    { label:'Developer', icon:'⌥', col:P.VIOLET },
    { label:'Email', icon:'✉', col:P.EMERALD },
    { label:'Custom', icon:'+', col:P.TEXT3 },
  ];
  const rw2 = (W-52)/3;
  roles.forEach((r,i) => {
    const rcol = i%3;
    const rrow = Math.floor(i/3);
    const rx2 = 20 + rcol*(rw2+6);
    const ry2 = 192 + rrow*54;
    const selected = i===0;
    rect(rx2,ry2,rw2,46,selected?P.CYAN:P.CARD,{rx:10,opacity:selected?0.15:1});
    rect(rx2,ry2,rw2,46,'none',{stroke:selected?P.CYAN:P.BORDER,sw:selected?1.5:1,rx:10});
    text(rx2+rw2/2,ry2+20,r.icon,14,selected?P.CYAN:P.TEXT3,{anchor:'middle'});
    text(rx2+rw2/2,ry2+36,r.label,9,selected?P.CYAN:P.TEXT2,{anchor:'middle',fw:selected?600:400});
  });

  // ── Model selector ─────────────────────────────────────────────────────────
  text(20,308,'Base Model',11,P.TEXT2,{fw:500,ls:0.5});
  const models = [
    { name:'claude-3.5-sonnet', label:'Best quality', col:P.CYAN, selected:true },
    { name:'gpt-4o', label:'Balanced', col:P.EMERALD, selected:false },
    { name:'claude-3-haiku', label:'Fast & cheap', col:P.AMBER, selected:false },
  ];
  models.forEach((m,i) => {
    const my = 316 + i*44;
    rect(20,my,W-40,36,m.selected?P.CARD2:P.CARD,{rx:8});
    if(m.selected) rect(20,my,W-40,36,'none',{stroke:P.CYAN,sw:1.5,rx:8});
    circle(36,my+18,m.selected?7:5,m.selected?P.CYAN:P.TEXT3,{opacity:m.selected?1:0.5});
    if(m.selected) circle(36,my+18,3,'#0D0F14');
    text(50,my+14,m.name,11,P.TEXT,{fw:m.selected?600:400});
    text(50,my+28,m.label,9,P.TEXT3);
    if(i===0) {
      rect(W-76,my+10,50,16,P.CYAN,{rx:4,opacity:0.12});
      text(W-51,my+21,'Recommended',7,P.CYAN,{anchor:'middle',fw:600});
    }
  });

  // ── Permissions ────────────────────────────────────────────────────────────
  text(20,454,'Permissions',11,P.TEXT2,{fw:500,ls:0.5});
  const perms = [
    { label:'Web Search', on:true, col:P.CYAN },
    { label:'Send Email', on:false, col:P.EMERALD },
    { label:'Read Files', on:true, col:P.CYAN },
    { label:'Execute Code', on:false, col:P.ROSE },
    { label:'Publish', on:false, col:P.AMBER },
    { label:'Call APIs', on:true, col:P.CYAN },
  ];
  const permW = (W-52)/2;
  perms.forEach((p,i) => {
    const pcol = i%2;
    const prow = Math.floor(i/2);
    const px = 20 + pcol*(permW+12);
    const py = 462 + prow*38;
    rect(px,py,permW,30,P.CARD,{rx:8});
    text(px+12,py+19,p.label,10,P.TEXT2);
    // toggle
    const tc = p.on ? P.CYAN : P.BORDER2;
    rect(px+permW-38,py+9,28,14,tc,{rx:7});
    circle(px+permW-38+(p.on?16:4),py+16,6,p.on?'#0D0F14':P.TEXT3);
  });

  // ── Task limit ─────────────────────────────────────────────────────────────
  text(20,584,'Max Concurrent Tasks',11,P.TEXT2,{fw:500,ls:0.5});
  rect(20,592,W-40,32,P.CARD,{rx:8});
  // slider track
  rect(32,604,W-80,8,P.BORDER,{rx:4});
  rect(32,604,(W-80)*0.4,8,P.CYAN,{rx:4});
  circle(32+(W-80)*0.4,608,10,'#0D0F14');
  circle(32+(W-80)*0.4,608,10,'none',{stroke:P.CYAN,sw:2});
  circle(32+(W-80)*0.4,608,4,P.CYAN);
  text(W-30,609,'3',10,P.CYAN,{anchor:'end',fw:700});

  // ── Deploy CTA ─────────────────────────────────────────────────────────────
  rect(20,H-92,W-40,44,P.CYAN,{rx:22});
  text(W/2,H-64,'⚡  Deploy Agent',16,'#0D0F14',{anchor:'middle',fw:700});
  text(W/2,H-48,'Uses ~80 GPU credits/day at this config',9,P.CARD2,{anchor:'middle'});

  rect(0,H-100,W,1,P.BORDER);
  // no nav on this config screen — full-bleed CTA

  const svgEls = elements.map(renderEl).join('\n');
  screens.push({ name:'Hire Agent', svg:makeSVG(svgEls), elements:[...elements] });
}

// ── SVG render helpers ─────────────────────────────────────────────────────
function renderEl(e) {
  switch(e.type) {
    case 'rect':
      return `<rect x="${e.x}" y="${e.y}" width="${e.width}" height="${e.height}" fill="${e.fill}" rx="${e.rx||0}" ry="${e.ry||0}" opacity="${e.opacity??1}" stroke="${e.stroke||'none'}" stroke-width="${e.strokeWidth||0}"/>`;
    case 'text':
      return `<text x="${e.x}" y="${e.y}" font-size="${e.fontSize}" fill="${e.fill}" font-weight="${e.fontWeight||400}" font-family="${e.fontFamily||'Inter'}" text-anchor="${e.textAnchor||'start'}" opacity="${e.opacity??1}" letter-spacing="${e.letterSpacing||0}">${String(e.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    case 'circle':
      return `<circle cx="${e.cx}" cy="${e.cy}" r="${e.r}" fill="${e.fill}" opacity="${e.opacity??1}" stroke="${e.stroke||'none'}" stroke-width="${e.strokeWidth||0}"/>`;
    case 'line':
      return `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${e.stroke}" stroke-width="${e.strokeWidth||1}" opacity="${e.opacity??1}"/>`;
    default: return '';
  }
}

function makeSVG(inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><style>text{font-family:'Inter',system-ui,sans-serif}</style></defs>
  ${inner}
</svg>`;
}

// ── Assemble .pen file ─────────────────────────────────────────────────────
const totalEls = screens.reduce((a,s) => a + s.elements.length, 0);
const pen = {
  version:  '2.8',
  metadata: {
    name:      'CREW',
    author:    'RAM',
    date:      new Date().toISOString().slice(0,10),
    theme:     'dark',
    heartbeat: 12,
    elements:  totalEls,
  },
  screens: screens.map(s => ({
    name:     s.name,
    svg:      s.svg,
    elements: s.elements,
  })),
};

fs.writeFileSync(
  path.join(__dirname, 'crew.pen'),
  JSON.stringify(pen, null, 2)
);
console.log(`CREW: ${screens.length} screens, ${totalEls} elements`);
console.log(`Written: crew.pen`);
