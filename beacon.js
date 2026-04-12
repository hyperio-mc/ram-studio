#!/usr/bin/env node
// BEACON — Talent Intelligence Platform
// Heartbeat design — Mar 17, 2026
//
// Inspired by:
//   Dribbble popular: Bento grid at 67% of SaaS shots — variable-card hierarchy
//   Land-book dark ambient: #0F0F0F base + single neon accent (cyan #00D4FF)
//   AI presence trend: glowing orb as interactive focal point, sparse chrome
//   Awwwards: kinetic display type as primary visual, tight tracking
//
// Domain: Talent intelligence / AI-powered recruiting
// Concept: BEACON — AI recruiter that maps talent pipelines. One orb = the AI.
// Challenge: Implement true bento grid in pen format using variable-sized frames
//            at absolute positions — size creates hierarchy, not color.
//
// Skeleton: Bento grid (not nav+list, not mission control, not gauge cluster)
// —————————————————————————————————————————————————————————————

'use strict';
const https = require('https');
const fs    = require('fs');
const path  = require('path');

// ── Palette ────────────────────────────────────────────────────────────────────
const P = {
  bg:      '#0C0F17',
  panel:   '#131722',
  panel2:  '#1A1F2E',
  border:  '#1E2434',
  fg:      '#E8EDF5',
  muted:   '#4A5575',
  cyan:    '#00D4FF',   // single neon accent — only on active/AI surfaces
  indigo:  '#7C3AED',
  green:   '#10B981',
  amber:   '#F59E0B',
  red:     '#EF4444',
};

// ── Pen primitives ─────────────────────────────────────────────────────────────
const F = (x,y,w,h,fill,opts={}) => ({
  type:'frame', x,y, width:w, height:h, fill,
  cornerRadius: opts.r||0,
  opacity: opts.opacity!==undefined ? opts.opacity : 1,
  children: opts.ch||[],
  ...(opts.clip ? {clipContent:true} : {}),
});
const T = (text,x,y,w,h,opts={}) => ({
  type:'text', text:String(text), x,y, width:w, height:h,
  fill: opts.fill||P.fg,
  fontSize: opts.size||13,
  fontWeight: opts.weight||400,
  textAlign: opts.align||'left',
  letterSpacing: opts.ls||0,
  lineHeight: opts.lh||undefined,
  opacity: opts.opacity!==undefined ? opts.opacity : 1,
});
const E = (x,y,w,h,fill,opts={}) => ({
  type:'ellipse', x,y, width:w, height:h, fill,
  opacity: opts.opacity!==undefined ? opts.opacity : 1,
});
const Line = (x,y,w,fill) => F(x,y,w,1,fill,{opacity:0.3});

// ── Shared components ──────────────────────────────────────────────────────────

// Bento card container — returns a frame with rounded corners and subtle border
function BentoCard(x,y,w,h,children=[]) {
  return F(x,y,w,h,P.panel,{r:16,ch:[
    // border overlay
    F(0,0,w,h,'#00000000',{r:16,ch:[]}),
    ...children,
  ]});
}

// Glowing AI orb — 3 concentric ellipses to simulate glow
function AIOrb(cx,cy,r) {
  const x = cx-r, y = cy-r, d = r*2;
  return [
    E(x-r*0.6, y-r*0.6, d*2.2, d*2.2, P.cyan, {opacity:0.03}),  // outer glow
    E(x-r*0.2, y-r*0.2, d*1.4, d*1.4, P.cyan, {opacity:0.08}),  // mid glow
    E(x, y, d, d, P.cyan, {opacity:0.18}),                        // core glow
    E(x+r*0.25, y+r*0.25, d*0.5, d*0.5, P.bg,  {opacity:1}),    // inner cutout
    E(cx-4, cy-4, 8, 8, P.fg, {opacity:0.9}),                    // center dot
  ];
}

// Metric pill chip
function Chip(x,y,label,color) {
  return F(x,y,90,24,color+'22',{r:12,ch:[
    T(label,0,5,90,14,{size:10,weight:700,fill:color,align:'center',ls:0.5}),
  ]});
}

// Candidate row for lists
function CandRow(x,y,w,name,role,score,isTop=false) {
  const scoreCol = score>85?P.green:score>70?P.cyan:P.amber;
  return F(x,y,w,48,isTop?P.panel2:'#00000000',{r:8,ch:[
    // Avatar placeholder
    E(12,12,24,24,P.border,{}),
    T(name.slice(0,1),12,13,24,18,{size:12,weight:700,fill:P.muted,align:'center'}),
    T(name,44,10,w-100,16,{size:13,weight:600,fill:P.fg}),
    T(role,44,28,w-100,12,{size:11,fill:P.muted,opacity:0.7}),
    T(score+'%',w-52,10,44,28,{size:14,weight:800,fill:scoreCol,align:'right'}),
  ]});
}

// Stat number block for bento metric cards
function StatBlock(x,y,value,label,sub,color=P.cyan) {
  return [
    T(value,x,y,160,56,{size:48,weight:900,fill:color,ls:-1.5}),
    T(label,x,y+54,160,16,{size:11,weight:700,fill:P.fg,ls:1.5}),
    T(sub,x,y+72,200,14,{size:11,fill:P.muted,opacity:0.7}),
  ];
}

// Pipeline stage bar
function StageBar(x,y,w,label,count,pct,color) {
  const barW = Math.round((w-80)*pct/100);
  return [
    T(label,x,y,100,14,{size:11,fill:P.muted,ls:0.5}),
    F(x+110,y+1,w-120,12,P.border,{r:6}),
    F(x+110,y+1,barW,12,color,{r:6,opacity:0.7}),
    T(count,x+w-60,y,60,14,{size:11,weight:700,fill:color,align:'right'}),
  ];
}

// ── Mobile screens ─────────────────────────────────────────────────────────────
const MW=375, MH=812;

function mDashboard(ox) {
  return F(ox,0,MW,MH,P.bg,{clip:true,ch:[
    // Nav
    F(0,0,MW,88,P.panel,{ch:[
      T('BEACON',20,44,120,20,{size:14,weight:800,fill:P.fg,ls:3}),
      E(MW-52,44,24,24,P.cyan,{opacity:0.2}),
      E(MW-46,50,12,12,P.cyan,{opacity:0.6}),
    ]}),
    // AI status banner
    F(16,104,MW-32,80,P.panel2,{r:16,ch:[
      ...AIOrb(36,40,20),
      T('AI RECRUITER ACTIVE',68,20,200,14,{size:10,weight:700,fill:P.cyan,ls:2}),
      T('Scanning 1,240 profiles',68,38,240,14,{size:13,fill:P.fg,opacity:0.8}),
      F(MW-80,28,52,24,P.cyan+'22',{r:12,ch:[
        T('LIVE',0,6,52,14,{size:10,weight:700,fill:P.cyan,align:'center',ls:1}),
      ]}),
    ]}),
    // Metric strip
    F(16,200,MW-32,72,P.panel,{r:12,ch:[
      ...StatBlock(16,12,'47','ACTIVE','Candidates',P.cyan),
      Line(120,8,1,P.border),
      ...StatBlock(130,12,'89%','ACCEPT','Offer rate',P.green),
      Line(240,8,1,P.border),
      ...StatBlock(248,12,'14d','AVG','Time to hire',P.amber),
    ]}),
    // Roles header
    T('OPEN ROLES',16,288,200,14,{size:10,weight:700,fill:P.muted,ls:2}),
    T('4 active',MW-60,288,60,14,{size:10,fill:P.cyan,align:'right'}),
    // Role cards
    ...[
      {title:'Senior ML Engineer',dept:'Engineering',cands:12,urgent:true},
      {title:'Head of Product',dept:'Product',cands:8,urgent:false},
      {title:'Growth Designer',dept:'Design',cands:19,urgent:false},
    ].map((r,i) => F(16,310+i*88,MW-32,76,P.panel,{r:12,ch:[
      F(16,16,4,44,r.urgent?P.red:P.border,{r:2}),
      T(r.title,28,14,MW-100,18,{size:14,weight:700,fill:P.fg}),
      T(r.dept.toUpperCase(),28,36,120,12,{size:10,fill:P.muted,ls:1.5}),
      T(r.cands+' candidates',28,52,140,12,{size:11,fill:r.urgent?P.amber:P.muted}),
      F(MW-80,20,52,36,P.panel2,{r:8,ch:[
        T(r.cands,0,4,52,20,{size:18,weight:800,fill:P.cyan,align:'center'}),
        T('cands',0,22,52,12,{size:9,fill:P.muted,align:'center'}),
      ]}),
      r.urgent ? F(MW-100,14,60,20,P.red+'22',{r:10,ch:[
        T('URGENT',0,4,60,14,{size:9,weight:700,fill:P.red,align:'center',ls:0.5}),
      ]}) : F(0,0,0,0,'#00000000'),
    ]})),
    // Bottom nav
    F(0,MH-72,MW,72,P.panel,{ch:[
      ...[['⌂','Home'],['◎','Roles'],['◈','Pipeline'],['◉','AI'],['○','Profile']].map(([ic,lb],i) => [
        T(ic,i*(MW/5)+4,10,MW/5-8,24,{size:20,fill:i===0?P.cyan:P.muted,align:'center'}),
        T(lb,i*(MW/5)+4,34,MW/5-8,12,{size:9,fill:i===0?P.cyan:P.muted,align:'center',ls:0.5}),
      ]).flat(),
    ]}),
  ]});
}

function mCandidate(ox) {
  const score = 91;
  const scoreArc = Math.round(score*2.2); // visual pct
  return F(ox,0,MW,MH,P.bg,{clip:true,ch:[
    F(0,0,MW,240,P.panel2,{ch:[
      F(16,52,MW-32,1,P.border,{}),
      T('←  Back',16,60,100,20,{size:13,fill:P.muted}),
      T('AI MATCH ANALYSIS',0,64,MW,14,{size:10,fill:P.cyan,align:'center',ls:2}),
      E(MW/2-36,88,72,72,P.cyan+'33',{}),
      E(MW/2-28,96,56,56,P.panel,{}),
      T('JD',MW/2-28,108,56,36,{size:22,weight:800,fill:P.fg,align:'center'}),
      T('Jordan Davis',0,172,MW,18,{size:17,weight:700,fill:P.fg,align:'center'}),
      T('Principal Engineer · Google',0,194,MW,14,{size:12,fill:P.muted,align:'center'}),
    ]}),
    // Match score
    F(16,252,MW-32,80,P.panel,{r:16,ch:[
      ...AIOrb(44,40,22),
      T('AI MATCH SCORE',76,14,200,12,{size:10,weight:700,fill:P.cyan,ls:2}),
      T(score+'%',76,32,80,28,{size:26,weight:900,fill:P.green}),
      T('Exceptional fit — top 3%',164,40,160,12,{size:11,fill:P.muted}),
    ]}),
    // Skills
    T('MATCHED SKILLS',16,348,200,14,{size:10,weight:700,fill:P.muted,ls:2}),
    ...[['Distributed Systems',P.green],['ML Ops',P.green],['Go',P.cyan],['Kubernetes',P.cyan],['Leadership',P.amber]].map(([sk,c],i) =>
      F(16+(i%3)*((MW-32)/3+4),368+Math.floor(i/3)*36, (MW-48)/3, 28, c+'22',{r:14,ch:[
        T(sk,0,7,(MW-48)/3,14,{size:11,weight:600,fill:c,align:'center'}),
      ]})
    ),
    // Signal cards
    T('AI SIGNALS',16,448,200,14,{size:10,weight:700,fill:P.muted,ls:2}),
    ...[
      {label:'Career Trajectory',val:'↑ Strong',c:P.green},
      {label:'Availability Signal',val:'Passive',c:P.amber},
      {label:'Culture Fit Score',val:'94%',c:P.green},
      {label:'Comp Expectation',val:'$280–320k',c:P.fg},
    ].map((s,i) => [
      T(s.label,16,468+i*36,180,14,{size:12,fill:P.muted}),
      T(s.val,MW-80,468+i*36,76,14,{size:12,weight:700,fill:s.c,align:'right'}),
      Line(16,482+i*36,MW-32,P.border),
    ]).flat(),
    // Actions
    F(16,MH-120,MW-32,44,P.cyan,{r:12,ch:[
      T('Add to Pipeline →',0,12,MW-32,20,{size:14,weight:700,fill:P.bg,align:'center'}),
    ]}),
    F(16,MH-66,MW-32,44,P.panel,{r:12,ch:[
      T('Schedule AI Brief',0,12,MW-32,20,{size:14,fill:P.fg,align:'center'}),
    ]}),
  ]});
}

function mPipeline(ox) {
  const stages = [
    {name:'APPLIED',count:47,col:P.muted},
    {name:'SCREENED',count:23,col:P.cyan},
    {name:'INTERVIEW',count:11,col:P.indigo},
    {name:'OFFER',count:4,col:P.green},
  ];
  return F(ox,0,MW,MH,P.bg,{clip:true,ch:[
    F(0,0,MW,88,P.panel,{ch:[
      T('Pipeline',20,44,180,22,{size:18,weight:800,fill:P.fg}),
      Chip(MW-108,50,'AI Mode',P.cyan),
    ]}),
    // Stage tabs
    F(0,88,MW,48,P.panel2,{ch:[
      ...stages.map((s,i) => F(i*(MW/4),0,MW/4,48,i===1?P.panel:'#00000000',{ch:[
        T(s.name,0,8,MW/4,12,{size:9,weight:700,fill:i===1?P.cyan:P.muted,align:'center',ls:1}),
        T(s.count,0,22,MW/4,18,{size:14,weight:800,fill:i===1?P.cyan:P.muted,align:'center'}),
      ]})),
    ]}),
    // Cards for "Screened" stage
    T('23 CANDIDATES IN REVIEW',16,152,MW-32,12,{size:10,fill:P.muted,ls:1.5}),
    ...[
      {name:'Jordan Davis',role:'Google · Principal Eng',score:91,tag:'TOP MATCH'},
      {name:'Priya Mehta',role:'Meta · Staff Eng',score:87,tag:'AI PICK'},
      {name:'Chen Wei',role:'Stripe · Eng Manager',score:82,tag:null},
      {name:'Sarah K.',role:'Airbnb · Senior Eng',score:79,tag:null},
    ].map((c,i) => F(16,172+i*104,MW-32,92,P.panel,{r:12,ch:[
      CandRow(12,22,MW-64,c.name,c.role,c.score),
      c.tag ? F(12,66,80,20,c.tag==='TOP MATCH'?P.green+'22':P.cyan+'22',{r:10,ch:[
        T(c.tag,0,4,80,14,{size:9,weight:700,fill:c.tag==='TOP MATCH'?P.green:P.cyan,align:'center',ls:0.5}),
      ]}) : F(0,0,0,0,'#00000000'),
      F(MW-72,66,60,20,P.panel2,{r:10,ch:[
        T('AI Brief →',0,4,60,14,{size:10,fill:P.fg,align:'center'}),
      ]}),
    ]})),
    F(0,MH-72,MW,72,P.panel,{ch:[
      ...[['⌂','Home'],['◎','Roles'],['◈','Pipeline'],['◉','AI'],['○','Profile']].map(([ic,lb],i) => [
        T(ic,i*(MW/5)+4,10,MW/5-8,24,{size:20,fill:i===2?P.cyan:P.muted,align:'center'}),
        T(lb,i*(MW/5)+4,34,MW/5-8,12,{size:9,fill:i===2?P.cyan:P.muted,align:'center',ls:0.5}),
      ]).flat(),
    ]}),
  ]});
}

function mAIBrief(ox) {
  return F(ox,0,MW,MH,P.bg,{clip:true,ch:[
    F(0,0,MW,88,P.panel,{ch:[
      T('AI Brief',20,44,180,22,{size:18,weight:800,fill:P.fg}),
      ...AIOrb(MW-44,52,16),
    ]}),
    // Orb + generating state
    F(16,104,MW-32,120,P.panel2,{r:16,ch:[
      ...AIOrb(MW/2-16-60,60,40),
      T('BEACON INTELLIGENCE',0,16,MW-32,12,{size:9,weight:700,fill:P.cyan,align:'center',ls:2}),
      T('Generating brief for',0,100,MW-32,14,{size:12,fill:P.muted,align:'center'}),
      T('Jordan Davis',0,116,MW-32,16,{size:13,weight:700,fill:P.fg,align:'center'}),
    ]}),
    // Brief sections (AI output style — streaming lines)
    ...[
      {head:'EXECUTIVE SUMMARY',body:'Jordan Davis represents a rare combination of deep distributed systems expertise and demonstrated leadership at scale. 8 years at Google with 3 patent filings in ML infrastructure.'},
      {head:'WHY BEACON FLAGS THIS',body:'Passive job signals detected: GitHub activity spike (+340% commits), LinkedIn profile updates, conference speaking submissions. Likely open to conversations in 60–90 days.'},
      {head:'COMPENSATION INTEL',body:'Current estimated TC: $310k at Google L6. Comp expectation to move: $340–380k. Equity cliff in 4 months — optimal outreach window.'},
    ].map((s,i) => F(16,240+i*148,MW-32,136,P.panel,{r:12,ch:[
      T(s.head,16,16,MW-64,12,{size:9,weight:700,fill:P.cyan,ls:2}),
      T(s.body,16,36,MW-64,88,{size:12,fill:P.fg,opacity:0.75,lh:18}),
    ]})),
    F(16,MH-104,MW-32,44,P.cyan,{r:12,ch:[
      T('Send Outreach via AI →',0,12,MW-32,20,{size:14,weight:700,fill:P.bg,align:'center'}),
    ]}),
    F(0,MH-72,MW,72,P.panel,{ch:[
      ...[['⌂','Home'],['◎','Roles'],['◈','Pipeline'],['◉','AI'],['○','Profile']].map(([ic,lb],i) => [
        T(ic,i*(MW/5)+4,10,MW/5-8,24,{size:20,fill:i===3?P.cyan:P.muted,align:'center'}),
        T(lb,i*(MW/5)+4,34,MW/5-8,12,{size:9,fill:i===3?P.cyan:P.muted,align:'center',ls:0.5}),
      ]).flat(),
    ]}),
  ]});
}

function mProfile(ox) {
  return F(ox,0,MW,MH,P.bg,{clip:true,ch:[
    F(0,0,MW,220,P.panel2,{ch:[
      T('Profile',20,52,180,22,{size:18,weight:800,fill:P.fg}),
      E(MW/2-44,84,88,88,P.cyan+'33',{}),
      E(MW/2-36,92,72,72,P.panel,{}),
      T('TC',MW/2-36,116,72,36,{size:22,weight:800,fill:P.fg,align:'center'}),
      T('Taylor Chen',0,182,MW,18,{size:17,weight:700,fill:P.fg,align:'center'}),
      T('Head of Talent · Acme Corp',0,204,MW,14,{size:12,fill:P.muted,align:'center'}),
    ]}),
    // Stats strip
    F(16,236,MW-32,64,P.panel,{r:12,ch:[
      ...[[36,'$4.2M','Pipeline Value'],[130,'12','Hires Made'],[224,'94%','Satisfaction']].map(([x,v,l]) => [
        T(v,x,8,80,24,{size:20,weight:800,fill:P.cyan}),
        T(l,x,32,90,12,{size:9,fill:P.muted,ls:0.5}),
      ]).flat(),
    ]}),
    // Settings list
    T('PREFERENCES',16,316,200,12,{size:10,weight:700,fill:P.muted,ls:2}),
    ...[['AI Sourcing Mode','Aggressive'],['Outreach Tone','Professional'],['Notification Digest','Daily'],['Data Sync','Greenhouse'],['Team Access','Admin']].map((s,i) => [
      T(s[0],16,338+i*52,200,16,{size:13,fill:P.fg}),
      T(s[1],MW-80,338+i*52,72,16,{size:13,fill:P.cyan,align:'right',weight:600}),
      Line(16,354+i*52,MW-32,P.border),
    ]).flat(),
    F(0,MH-72,MW,72,P.panel,{ch:[
      ...[['⌂','Home'],['◎','Roles'],['◈','Pipeline'],['◉','AI'],['○','Profile']].map(([ic,lb],i) => [
        T(ic,i*(MW/5)+4,10,MW/5-8,24,{size:20,fill:i===4?P.cyan:P.muted,align:'center'}),
        T(lb,i*(MW/5)+4,34,MW/5-8,12,{size:9,fill:i===4?P.cyan:P.muted,align:'center',ls:0.5}),
      ]).flat(),
    ]}),
  ]});
}

// ── Desktop screens ────────────────────────────────────────────────────────────
const DW=1280, DH=832;
const SIDE=220, GAP=16, COL=DW-SIDE-GAP*2;

function dSidebar(activeIdx) {
  const items = [['⌂','Dashboard'],['◎','Open Roles'],['◈','Pipeline'],['◉','AI Sourcing'],['◉','Analytics']];
  return F(0,0,SIDE,DH,P.panel,{ch:[
    T('BEACON',24,32,160,20,{size:13,weight:800,fill:P.fg,ls:3}),
    ...AIOrb(SIDE-40,40,12),
    ...items.map(([ic,lb],i) => F(12,80+i*52,SIDE-24,40,i===activeIdx?P.cyan+'18':'#00000000',{r:8,ch:[
      T(ic,12,10,24,20,{size:16,fill:i===activeIdx?P.cyan:P.muted}),
      T(lb,44,11,SIDE-60,18,{size:13,weight:i===activeIdx?700:400,fill:i===activeIdx?P.fg:P.muted}),
    ]})),
    // User at bottom
    Line(12,DH-80,SIDE-24,P.border),
    E(20,DH-56,40,40,P.cyan+'33',{}),
    T('TC',20,DH-44,40,20,{size:12,weight:700,fill:P.fg,align:'center'}),
    T('Taylor Chen',68,DH-52,SIDE-80,14,{size:12,weight:600,fill:P.fg}),
    T('Admin',68,DH-34,SIDE-80,12,{size:11,fill:P.muted}),
  ]});
}

// Desktop 1: BENTO GRID DASHBOARD ─────────────────────────────────────────────
function dDashboard(ox) {
  const X = ox+SIDE+GAP, Y0 = GAP, cw = COL;
  const g = GAP; // gap between bento cards

  // Bento layout:
  // Row 1: [AI Orb large card 56%] [Metric col 44%]
  //         W=690                   W=346
  // Row 2: [Pipeline progress 38%] [Candidates 38%] [Accept rate 22%]
  const W1=Math.round(cw*0.56)-g/2, W2=cw-W1-g;
  const H1=280;
  const W3=Math.round(cw*0.38)-g, W4=W3, W5=cw-W3-W4-g*2;
  const H2=DH-Y0-H1-g*3-48;

  return F(ox,0,DW,DH,P.bg,{clip:true,ch:[
    dSidebar(0),

    // Page header
    T('Good morning, Taylor',X,20,400,22,{size:18,weight:700,fill:P.fg}),
    T("Here's your talent pipeline",X,44,400,14,{size:13,fill:P.muted}),
    F(X+cw-180,16,180,44,P.panel,{r:10,ch:[
      T('Last sync: 2m ago',12,13,170,18,{size:12,fill:P.muted}),
    ]}),

    // ── BENTO ROW 1 ──
    // Card A — AI Recruiter (large, left)
    BentoCard(X,Y0+52,W1,H1,[
      T('AI RECRUITER',20,20,200,12,{size:9,weight:700,fill:P.cyan,ls:2}),
      ...AIOrb(W1/2,H1/2+10,72),
      T('BEACON',W1/2-60,H1/2+88,120,24,{size:16,weight:800,fill:P.fg,align:'center',ls:4}),
      T('1,247 profiles scanned today',W1/2-120,H1/2+112,240,14,{size:12,fill:P.muted,align:'center'}),
      F(W1-112,20,92,28,P.cyan+'22',{r:14,ch:[
        T('● ACTIVE',0,7,92,14,{size:10,weight:700,fill:P.cyan,align:'center',ls:0.5}),
      ]}),
    ]),

    // Card B — Metric stack (right column)
    BentoCard(X+W1+g,Y0+52,W2,Math.round((H1-g)/2)-4,[
      ...StatBlock(20,20,'47','ACTIVE CANDIDATES','↑ 12 this week',P.cyan),
    ]),
    BentoCard(X+W1+g,Y0+52+Math.round((H1-g)/2)+g,W2,Math.floor((H1-g)/2)-8,[
      ...StatBlock(20,20,'89%','OFFER ACCEPTANCE','Industry avg: 71%',P.green),
    ]),

    // ── BENTO ROW 2 ──
    // Card C — Pipeline funnel
    BentoCard(X,Y0+52+H1+g,W3,H2,[
      T('PIPELINE STAGES',20,20,200,12,{size:9,weight:700,fill:P.muted,ls:2}),
      ...[
        {stage:'Applied',n:247,pct:100,col:P.muted},
        {stage:'Screened by AI',n:89,pct:36,col:P.cyan},
        {stage:'Human Review',n:47,pct:19,col:P.indigo},
        {stage:'Interview',n:23,pct:9,col:P.amber},
        {stage:'Offer',n:8,pct:3,col:P.green},
        {stage:'Hired',n:4,pct:2,col:P.green},
      ].map((s,i) => StageBar(20,52+i*44,W3-40,s.stage,s.n,s.pct,s.col)).flat(),
    ]),

    // Card D — Top candidates
    BentoCard(X+W3+g,Y0+52+H1+g,W4,H2,[
      T('TOP AI PICKS TODAY',20,20,200,12,{size:9,weight:700,fill:P.muted,ls:2}),
      T('Ranked by BEACON match score',20,36,W4-40,12,{size:11,fill:P.muted,opacity:0.6}),
      ...[
        {name:'Jordan Davis',role:'Principal Eng · Google',score:91},
        {name:'Priya Mehta',role:'Staff Eng · Meta',score:87},
        {name:'Chen Wei',role:'Eng Manager · Stripe',score:82},
        {name:'Aisha Okonkwo',role:'Principal · Netflix',score:79},
        {name:'Marcus R.',role:'Lead Eng · Figma',score:76},
      ].map((c,i) => CandRow(12,56+i*60,W4-24,c.name,c.role,c.score,i===0)),
    ]),

    // Card E — Time to hire / accept stat
    BentoCard(X+W3+g+W4+g,Y0+52+H1+g,W5,H2,[
      T('TIME TO HIRE',20,20,W5-40,12,{size:9,weight:700,fill:P.muted,ls:2}),
      T('14',20,44,W5-40,64,{size:56,weight:900,fill:P.amber,ls:-2}),
      T('DAYS',20,108,W5-40,16,{size:11,weight:700,fill:P.amber,ls:2}),
      T('avg',20,126,W5-40,14,{size:11,fill:P.muted}),
      Line(20,156,W5-40,P.border),
      T('vs 28d',20,168,W5-40,14,{size:12,fill:P.muted}),
      T('industry',20,186,W5-40,14,{size:12,fill:P.muted}),
      F(20,210,W5-40,28,P.green+'22',{r:8,ch:[
        T('50% faster ↑',0,7,W5-40,14,{size:11,weight:700,fill:P.green,align:'center'}),
      ]}),
    ]),
  ]});
}

// Desktop 2: Candidate Detail ─────────────────────────────────────────────────
function dCandidateDetail(ox) {
  const X = ox+SIDE+GAP, cw = COL;
  const listW = 300, detailW = cw-listW-GAP;

  return F(ox,0,DW,DH,P.bg,{clip:true,ch:[
    dSidebar(2),
    T('Pipeline · Senior ML Engineer',X,28,600,20,{size:14,fill:P.muted}),

    // Left — candidate list
    F(X,52,listW,DH-68,P.panel,{r:16,ch:[
      T('SCREENED',16,20,200,12,{size:9,weight:700,fill:P.muted,ls:2}),
      T('23 candidates',16,36,200,14,{size:12,fill:P.muted}),
      ...[
        {name:'Jordan Davis',role:'Google',score:91,active:true},
        {name:'Priya Mehta',role:'Meta',score:87,active:false},
        {name:'Chen Wei',role:'Stripe',score:82,active:false},
        {name:'Aisha Okonkwo',role:'Netflix',score:79,active:false},
        {name:'Marcus R.',role:'Figma',score:76,active:false},
      ].map((c,i) => F(8,60+i*68,listW-16,60,c.active?P.panel2:'#00000000',{r:10,ch:[
        E(12,10,36,36,P.cyan+(c.active?'44':'22'),{}),
        T(c.name.slice(0,2),12,18,36,20,{size:12,weight:700,fill:P.fg,align:'center'}),
        T(c.name,56,10,listW-120,16,{size:13,weight:c.active?700:400,fill:P.fg}),
        T(c.role,56,30,listW-120,12,{size:11,fill:P.muted}),
        T(c.score+'%',listW-60,18,44,24,{size:16,weight:800,fill:c.score>85?P.green:P.cyan,align:'right'}),
        c.active ? F(56,44,80,14,P.cyan+'22',{r:7,ch:[
          T('VIEWING',0,2,80,12,{size:8,weight:700,fill:P.cyan,align:'center',ls:1}),
        ]}) : F(0,0,0,0,'#00000000'),
      ]})),
    ]}),

    // Right — candidate profile
    F(X+listW+GAP,52,detailW,DH-68,'#00000000',{ch:[
      // Header
      F(0,0,detailW,100,P.panel,{r:16,ch:[
        E(20,20,60,60,P.cyan+'33',{}),
        T('JD',20,36,60,28,{size:18,weight:800,fill:P.fg,align:'center'}),
        T('Jordan Davis',88,20,300,24,{size:20,weight:700,fill:P.fg}),
        T('Principal Engineer · Google · L6',88,48,360,14,{size:13,fill:P.muted}),
        F(detailW-220,20,200,60,'#00000000',{ch:[
          ...StatBlock(0,0,'91%','BEACON MATCH','Top 3% of candidates',P.green),
        ]}),
      ]}),

      // AI brief
      F(0,108,detailW,180,P.panel2,{r:16,ch:[
        ...AIOrb(32,90,20),
        T('AI INTELLIGENCE BRIEF',60,20,300,12,{size:9,weight:700,fill:P.cyan,ls:2}),
        T('Passive signals detected. GitHub commits ↑340%. LinkedIn updated 3 days ago.\nOptimal outreach window: now–60 days. Comp cliff in 4 months.\nStrongly aligned with your distributed systems requirements.',60,40,detailW-80,100,{size:13,fill:P.fg,opacity:0.8,lh:20}),
        F(0,140,detailW,40,P.cyan+'12',{r:0,ch:[
          T('Confidence: 94%  ·  Data freshness: 2h ago  ·  3 signals active',20,12,detailW-40,16,{size:11,fill:P.cyan,opacity:0.8}),
        ]}),
      ]}),

      // Skills + timeline grid
      F(0,296,Math.round(detailW/2)-GAP/2,240,P.panel,{r:16,ch:[
        T('MATCHED SKILLS',16,16,200,12,{size:9,weight:700,fill:P.muted,ls:2}),
        ...[['Distributed Systems',P.green],['ML Infrastructure',P.green],['Go / Rust',P.cyan],['Kubernetes',P.cyan],['Engineering Leadership',P.amber]].map(([sk,c],i) =>
          F(12,36+i*36,180,26,c+'22',{r:13,ch:[
            T(sk,0,6,180,14,{size:11,weight:600,fill:c,align:'center'}),
          ]})
        ),
      ]}),
      F(Math.round(detailW/2)+GAP/2,296,Math.floor(detailW/2)-GAP/2,240,P.panel,{r:16,ch:[
        T('CAREER TIMELINE',16,16,200,12,{size:9,weight:700,fill:P.muted,ls:2}),
        ...[
          {co:'Google',role:'Principal Eng',yr:'2021–',col:P.cyan},
          {co:'Lyft',role:'Staff Eng',yr:'2018–21',col:P.indigo},
          {co:'Palantir',role:'Senior Eng',yr:'2015–18',col:P.muted},
        ].map((e,i) => [
          F(16,36+i*60,4,40,e.col,{r:2}),
          T(e.co,28,36+i*60,200,18,{size:14,weight:700,fill:P.fg}),
          T(e.role,28,56+i*60,200,14,{size:12,fill:P.muted}),
          T(e.yr,Math.floor(detailW/2)-GAP-60,40+i*60,60,14,{size:11,fill:e.col,align:'right'}),
        ]).flat(),
      ]}),

      // Action row
      F(0,544,detailW,60,'#00000000',{ch:[
        F(0,8,Math.round(detailW*0.38),44,P.cyan,{r:12,ch:[
          T('Add to Pipeline →',0,12,Math.round(detailW*0.38),20,{size:13,weight:700,fill:P.bg,align:'center'}),
        ]}),
        F(Math.round(detailW*0.38)+GAP,8,Math.round(detailW*0.3),44,P.panel,{r:12,ch:[
          T('Generate Outreach',0,12,Math.round(detailW*0.3),20,{size:13,fill:P.fg,align:'center'}),
        ]}),
        F(Math.round(detailW*0.68)+GAP*2,8,Math.round(detailW*0.3)-GAP*2,44,P.panel,{r:12,ch:[
          T('Schedule Interview',0,12,Math.round(detailW*0.3)-GAP*2,20,{size:13,fill:P.fg,align:'center'}),
        ]}),
      ]}),
    ]}),
  ]});
}

// Desktop 3: AI Sourcing ───────────────────────────────────────────────────────
function dAISourcing(ox) {
  const X = ox+SIDE+GAP, cw = COL;
  return F(ox,0,DW,DH,P.bg,{clip:true,ch:[
    dSidebar(3),
    T('AI Sourcing',X,28,400,22,{size:18,weight:700,fill:P.fg}),

    // Orb hero — centered, large
    F(X,52,cw,DH-100,'#00000000',{ch:[
      ...AIOrb(cw/2,DH/2-160,120),
      T('BEACON INTELLIGENCE',cw/2-200,DH/2-40,400,16,{size:11,weight:700,fill:P.cyan,align:'center',ls:3}),
      T('Describe who you\'re looking for',cw/2-280,DH/2-16,560,22,{size:18,weight:700,fill:P.fg,align:'center'}),
      // Prompt input
      F(cw/2-280,DH/2+20,560,56,P.panel,{r:16,ch:[
        T('Ex: Senior distributed systems engineer, 8+ years, open to remote...',16,18,480,20,{size:13,fill:P.muted}),
        F(496,8,52,40,P.cyan,{r:10,ch:[
          T('→',0,10,52,20,{size:16,weight:700,fill:P.bg,align:'center'}),
        ]}),
      ]}),
      // Recent searches
      T('RECENT SEARCHES',cw/2-280,DH/2+96,560,12,{size:9,weight:700,fill:P.muted,ls:2}),
      ...[
        'Principal ML Engineer, ex-FAANG, infrastructure focus',
        'Head of Product, B2B SaaS, Series B+ experience',
        'Senior Designer, design systems, Figma expert',
      ].map((s,i) => F(cw/2-280,DH/2+116+i*44,560,36,P.panel,{r:8,ch:[
        T('↺',12,10,24,16,{size:14,fill:P.muted}),
        T(s,40,10,480,16,{size:13,fill:P.fg,opacity:0.6}),
      ]})),
      // Stat strip at bottom
      F(0,DH-160,cw,80,P.panel,{ch:[
        ...[['1.2M+','Profiles in network',P.cyan],['94%','Match accuracy',P.green],['2min','Avg brief time',P.amber],['50%','Faster than manual',P.indigo]].map(([v,l,c],i) => [
          T(v, i*(cw/4)+24, 20, 140,32,{size:26,weight:900,fill:c}),
          T(l, i*(cw/4)+24, 52, 180,14,{size:11,fill:P.muted}),
        ]).flat(),
      ]}),
    ]}),
  ]});
}

// Desktop 4: Pipeline Board ───────────────────────────────────────────────────
function dPipelineBoard(ox) {
  const X = ox+SIDE+GAP, cw = COL;
  const cols = [
    {name:'APPLIED',count:247,col:P.muted,cands:['Elena V.','James T.','Sofia M.']},
    {name:'AI SCREENED',count:89,col:P.cyan,cands:['Jordan D.','Priya M.','Chen W.']},
    {name:'INTERVIEW',count:23,col:P.indigo,cands:['Marcus R.','Aisha O.']},
    {name:'OFFER',count:8,col:P.green,cands:['Sam K.','Nina L.']},
  ];
  const colW = Math.floor((cw-GAP*(cols.length-1))/cols.length);

  return F(ox,0,DW,DH,P.bg,{clip:true,ch:[
    dSidebar(2),
    T('Pipeline Board',X,20,400,20,{size:16,weight:700,fill:P.fg}),
    T('Senior ML Engineer',X,42,400,14,{size:12,fill:P.muted}),
    F(X+cw-160,16,160,36,P.cyan,{r:8,ch:[
      T('+ Add Candidate',0,10,160,16,{size:12,weight:700,fill:P.bg,align:'center'}),
    ]}),

    // Kanban columns
    ...cols.map((col,ci) => {
      const cx = X+ci*(colW+GAP);
      return F(cx,56,colW,DH-72,P.panel,{r:16,ch:[
        F(0,0,colW,48,col.col+'18',{r:16,ch:[
          T(col.name,12,16,colW-60,14,{size:9,weight:700,fill:col.col,ls:2}),
          F(colW-52,12,40,24,col.col+'33',{r:12,ch:[
            T(col.count,0,5,40,14,{size:11,weight:700,fill:col.col,align:'center'}),
          ]}),
        ]}),
        ...col.cands.map((name,i) => F(10,58+i*88,colW-20,76,P.panel2,{r:10,ch:[
          E(12,14,36,36,col.col+'33',{}),
          T(name.slice(0,2),12,22,36,20,{size:11,weight:700,fill:P.fg,align:'center'}),
          T(name,56,12,colW-80,16,{size:13,weight:600,fill:P.fg}),
          T('Senior Eng · Ex-FAANG',56,32,colW-80,12,{size:11,fill:P.muted}),
          F(56,48,colW-120,22,col.col+'22',{r:11,ch:[
            T('View Brief →',0,5,colW-120,12,{size:10,weight:700,fill:col.col,align:'center'}),
          ]}),
        ]})),
      ]})
    }),
  ]});
}

// Desktop 5: Analytics ────────────────────────────────────────────────────────
function dAnalytics(ox) {
  const X = ox+SIDE+GAP, cw = COL;
  const halfW = Math.round((cw-GAP)/2);

  return F(ox,0,DW,DH,P.bg,{clip:true,ch:[
    dSidebar(4),
    T('Analytics',X,28,400,22,{size:18,weight:700,fill:P.fg}),
    Chip(X+200,30,'Last 30 days',P.cyan),

    // KPI strip
    F(X,56,cw,72,P.panel,{r:12,ch:[
      ...[
        {v:'47',l:'Active Cands',c:P.cyan},
        {v:'89%',l:'Offer Acceptance',c:P.green},
        {v:'14d',l:'Time to Hire',c:P.amber},
        {v:'$2.1M',l:'Pipeline Value',c:P.indigo},
        {v:'94%',l:'AI Accuracy',c:P.green},
      ].map(({v,l,c},i) => [
        T(v, 24+i*(cw/5), 12, 100, 28, {size:22,weight:800,fill:c}),
        T(l, 24+i*(cw/5), 40, 140, 14, {size:10,fill:P.muted,ls:0.5}),
        i<4 ? Line(i*(cw/5)+cw/5,8,1,P.border) : F(0,0,0,0,'#00000000'),
      ]).flat(),
    ]}),

    // Pipeline funnel (left)
    F(X,140,halfW,320,P.panel,{r:16,ch:[
      T('PIPELINE FUNNEL',20,20,200,12,{size:9,weight:700,fill:P.muted,ls:2}),
      ...[
        {stage:'Applied',n:247,pct:100,col:P.muted},
        {stage:'AI Screened',n:89,pct:36,col:P.cyan},
        {stage:'Human Review',n:47,pct:19,col:P.indigo},
        {stage:'Interview',n:23,pct:9,col:P.amber},
        {stage:'Offer',n:8,pct:3,col:P.green},
        {stage:'Hired',n:4,pct:2,col:P.green},
      ].map((s,i) => StageBar(20,52+i*44,halfW-40,s.stage,s.n,s.pct,s.col)).flat(),
    ]}),

    // Source breakdown (right)
    F(X+halfW+GAP,140,halfW,320,P.panel,{r:16,ch:[
      T('CANDIDATE SOURCES',20,20,200,12,{size:9,weight:700,fill:P.muted,ls:2}),
      ...[
        {src:'BEACON AI Sourcing',pct:58,col:P.cyan},
        {src:'LinkedIn',pct:22,col:P.indigo},
        {src:'Referrals',pct:12,col:P.green},
        {src:'Job Boards',pct:8,col:P.amber},
      ].map((s,i) => [
        T(s.src,20,48+i*60,halfW-120,14,{size:13,fill:P.fg}),
        F(20,66+i*60,halfW-120,10,P.border,{r:5}),
        F(20,66+i*60,Math.round((halfW-120)*s.pct/100),10,s.col,{r:5,opacity:0.8}),
        T(s.pct+'%',halfW-80,48+i*60,60,14,{size:14,weight:700,fill:s.col,align:'right'}),
      ]).flat(),
    ]}),

    // Time to hire trend (full width bar chart)
    F(X,472,cw,DH-488,P.panel,{r:16,ch:[
      T('TIME-TO-HIRE TREND',20,20,300,12,{size:9,weight:700,fill:P.muted,ls:2}),
      T('14 day avg this month — 50% faster than industry',20,36,500,14,{size:12,fill:P.muted}),
      // Bar chart
      ...[28,24,22,20,18,16,14].map((d,i) => {
        const bh = Math.round((d/30)*160);
        const bx = 20+i*((cw-60)/7);
        const months = ['Oct','Nov','Dec','Jan','Feb','Mar','Now'];
        return [
          F(bx,DH-488-80-bh,40,bh,i===6?P.cyan:P.border,{r:6,opacity:i===6?0.8:0.6}),
          T(d+'d',bx,DH-488-92-bh,40,12,{size:10,fill:i===6?P.cyan:P.muted,align:'center'}),
          T(months[i],bx,DH-488-64,40,12,{size:10,fill:P.muted,align:'center'}),
        ];
      }).flat(),
    ]}),
  ]});
}

// ── Assemble document ──────────────────────────────────────────────────────────
const screens = [
  mDashboard(0),
  mCandidate(MW+20),
  mPipeline((MW+20)*2),
  mAIBrief((MW+20)*3),
  mProfile((MW+20)*4),
  dDashboard((MW+20)*5),
  dCandidateDetail((MW+20)*5+DW+20),
  dAISourcing((MW+20)*5+(DW+20)*2),
  dPipelineBoard((MW+20)*5+(DW+20)*3),
  dAnalytics((MW+20)*5+(DW+20)*4),
];

const pen = { version:'2.8', children: screens };
const penJson = JSON.stringify(pen, null, 2);

fs.writeFileSync(path.join(__dirname,'beacon.pen'), penJson);
console.log('Pen written: beacon.pen');
console.log(`Screens: ${screens.length} (5 mobile + 5 desktop)`);

// ── Build share page ───────────────────────────────────────────────────────────
const penB64 = Buffer.from(penJson).toString('base64');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>BEACON — Talent Intelligence Platform</title>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:#0C0F17;color:#E8EDF5;font-family:'SF Mono','Fira Code',ui-monospace,monospace;min-height:100vh}
  nav{padding:20px 40px;border-bottom:1px solid #1E2434;display:flex;justify-content:space-between;align-items:center}
  .logo{font-size:14px;font-weight:700;letter-spacing:4px;color:#E8EDF5}
  .nav-r{display:flex;align-items:center;gap:12px}
  .btn{padding:10px 20px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:0.3px}
  .btn-p{background:#00D4FF;color:#0C0F17}
  .btn-s{background:transparent;color:#E8EDF5;border:1px solid #1E2434}
  .btn-x{background:#000;color:#fff;border:1px solid #333}
  .hero{padding:80px 40px 40px;max-width:960px}
  .tag{font-size:10px;letter-spacing:3px;color:#00D4FF;margin-bottom:20px}
  h1{font-size:clamp(48px,8vw,96px);font-weight:900;letter-spacing:-2px;line-height:1;margin-bottom:16px}
  .sub{font-size:16px;opacity:.5;max-width:520px;line-height:1.6;margin-bottom:32px}
  .meta{display:flex;gap:32px;margin-bottom:40px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:10px;opacity:.4;letter-spacing:1px;margin-bottom:4px}
  .meta-item strong{color:#00D4FF}
  .actions{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:60px}
  .preview{padding:0 40px 80px}
  .section-label{font-size:10px;letter-spacing:3px;color:#00D4FF;margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid #1E2434}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:8px}
  .thumbs::-webkit-scrollbar{height:4px}.thumbs::-webkit-scrollbar-track{background:transparent}
  .thumbs::-webkit-scrollbar-thumb{background:#00D4FF44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid #1E2434;max-width:960px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .swatches{display:flex;gap:12px;flex-wrap:wrap}
  .tokens-block{background:#131722;border:1px solid #1E2434;border-radius:8px;padding:20px;margin-top:24px;position:relative}
  .tokens-pre{font-size:11px;line-height:1.7;color:#E8EDF5;opacity:.7;white-space:pre;overflow-x:auto;font-family:inherit}
  .copy-btn{position:absolute;top:12px;right:12px;background:#00D4FF22;border:1px solid #00D4FF44;color:#00D4FF;font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700}
  .research{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:0;padding:40px;border-top:1px solid #1E2434;max-width:960px}
  @media(max-width:640px){.research{grid-template-columns:1fr}}
  .r-card{background:#131722;border:1px solid #1E2434;border-radius:10px;padding:20px}
  .r-card h3{font-size:10px;letter-spacing:1.5px;color:#00D4FF;margin-bottom:12px;font-weight:700}
  .r-card p{font-size:12px;color:#E8EDF5;opacity:.6;line-height:1.7}
  footer{padding:28px 40px;border-top:1px solid #1E243422;font-size:11px;opacity:.3;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:#00D4FF;color:#0C0F17;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:6px;transform:translateY(80px);opacity:0;transition:all 0.3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
</style>
</head>
<body>
<div class="toast" id="toast">Copied ✓</div>
<nav>
  <div class="logo">RAM DESIGN STUDIO</div>
  <div class="nav-r">
    <button class="btn btn-p" onclick="openInViewer()">▶ Open in Viewer</button>
    <button class="btn btn-s" onclick="downloadPen()">↓ Download .pen</button>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ Copy Prompt</button>
    <button class="btn btn-x" onclick="shareOnX()">𝕏 Share</button>
  </div>
</nav>

<section class="hero">
  <div class="tag">PRODUCTION DESIGN SYSTEM · TALENT INTELLIGENCE · MARCH 17, 2026</div>
  <h1>BEACON</h1>
  <p class="sub">AI-powered talent intelligence. One orb maps your entire pipeline — from passive signals to offer acceptance.</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>10 (5 MOBILE + 5 DESKTOP)</strong></div>
    <div class="meta-item"><span>LAYOUT</span><strong>BENTO GRID + KANBAN</strong></div>
    <div class="meta-item"><span>BRAND SPEC</span><strong>✓ INCLUDED</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
  </div>
  <div class="actions">
    <button class="btn btn-p" onclick="openInViewer()">▶ Open in Pen Viewer</button>
    <button class="btn btn-s" onclick="downloadPen()">↓ Download .pen</button>
    <button class="btn btn-s" onclick="copyPrompt()">⌘ Copy Prompt</button>
    <button class="btn btn-x" onclick="shareOnX()">𝕏 Share</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREENS · 5 MOBILE + 5 DESKTOP</div>
  <div class="thumbs" id="thumbs-container"></div>
</section>

<section class="brand-section">
  <div class="section-label">BRAND SPEC</div>
  <div class="brand-grid">
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px">COLOR PALETTE</div>
      <div class="swatches">
        ${[
          {hex:'#0C0F17',role:'BACKGROUND'},
          {hex:'#131722',role:'SURFACE'},
          {hex:'#E8EDF5',role:'FOREGROUND'},
          {hex:'#00D4FF',role:'PRIMARY'},
          {hex:'#7C3AED',role:'SECONDARY'},
        ].map(s => `<div style="flex:1;min-width:80px">
          <div style="height:64px;border-radius:8px;background:${s.hex};border:1px solid #1E2434;margin-bottom:10px"></div>
          <div style="font-size:9px;letter-spacing:1.5px;opacity:.5;margin-bottom:4px">${s.role}</div>
          <div style="font-size:12px;font-weight:700;color:#00D4FF">${s.hex}</div>
        </div>`).join('')}
      </div>
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:0">TYPE SCALE</div>
      ${[
        {label:'DISPLAY',size:'48px',weight:'900',sample:'BEACON'},
        {label:'HEADING',size:'24px',weight:'700',sample:'Talent Intelligence Platform'},
        {label:'BODY',size:'14px',weight:'400',sample:'AI-powered recruiting that maps passive signals to pipeline.'},
        {label:'CAPTION',size:'10px',weight:'400',sample:'CANDIDATE · PIPELINE · AI MATCH · 94%'},
      ].map(t => `<div style="padding:16px 0;border-bottom:1px solid #1E2434">
        <div style="font-size:9px;letter-spacing:2px;opacity:.4;margin-bottom:8px">${t.label} · ${t.size} / ${t.weight}</div>
        <div style="font-size:${t.size};font-weight:${t.weight};line-height:1.2;color:#E8EDF5;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.sample}</div>
      </div>`).join('')}
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px">SPACING SYSTEM · 4PX BASE GRID</div>
      ${[4,8,16,24,32,48,64].map(sp => `<div style="display:flex;align-items:center;gap:16px;margin-bottom:10px">
        <div style="font-size:10px;opacity:.4;width:32px;flex-shrink:0">${sp}px</div>
        <div style="height:8px;border-radius:4px;background:#00D4FF;width:${sp*2}px;opacity:0.7"></div>
      </div>`).join('')}
    </div>
    <div>
      <div style="font-size:10px;letter-spacing:2px;opacity:.4;margin-bottom:16px">DESIGN PRINCIPLES</div>
      ${['Single neon accent — cyan applied only to AI surfaces and active states. Nothing else glows.',
         'Bento grid hierarchy — card size communicates importance. No colored headers needed.',
         'The orb is the AI — one recurring visual metaphor across every screen where AI is present.']
        .map((p,i) => `<div style="display:flex;gap:12px;margin-bottom:16px;align-items:flex-start">
          <div style="color:#00D4FF;font-size:10px;font-weight:700;flex-shrink:0;margin-top:2px">${String(i+1).padStart(2,'0')}</div>
          <div style="font-size:13px;opacity:.6;line-height:1.6">${p}</div>
        </div>`).join('')}
    </div>
  </div>
  <div class="tokens-block">
    <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
    <pre class="tokens-pre" id="css-tokens">:root {
  /* Color */
  --color-bg:        #0C0F17;
  --color-surface:   #131722;
  --color-border:    #1E2434;
  --color-fg:        #E8EDF5;
  --color-primary:   #00D4FF;
  --color-secondary: #7C3AED;
  --color-success:   #10B981;
  --color-warning:   #F59E0B;
  --color-error:     #EF4444;

  /* Typography */
  --font-family: 'SF Mono', 'Fira Code', ui-monospace, monospace;
  --font-display:  900 clamp(48px, 8vw, 96px) / 1 var(--font-family);
  --font-heading:  700 24px / 1.3 var(--font-family);
  --font-body:     400 14px / 1.6 var(--font-family);
  --font-caption:  400 10px / 1 var(--font-family);

  /* Spacing (4px base grid) */
  --space-1: 4px;   --space-2: 8px;   --space-3: 16px;
  --space-4: 24px;  --space-5: 32px;  --space-6: 48px;  --space-7: 64px;

  /* Radius */
  --radius-sm: 8px;  --radius-md: 12px;  --radius-lg: 16px;  --radius-full: 9999px;

  /* Bento grid */
  --bento-gap: 16px;
  --bento-radius: 16px;
}</pre>
  </div>
</section>

<section class="research" style="display:block;padding:60px 40px;border-top:1px solid #1E2434;max-width:960px">
  <div class="section-label">DESIGN RATIONALE</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
    <div class="r-card">
      <h3>BENTO GRID — FROM DRIBBBLE RESEARCH</h3>
      <p>Dribbble's popular feed shows bento grid at 67% of trending SaaS shots. Variable card sizes communicate hierarchy through size, not color. Applied here: the AI Recruiter card spans 56% of the dashboard width — its size alone tells you it's the primary surface.</p>
    </div>
    <div class="r-card">
      <h3>SINGLE NEON ACCENT — DARK AMBIENT TREND</h3>
      <p>Land-book and Awwwards nominees share a common formula: near-black base + one neon accent applied only to interactive/AI surfaces. Cyan #00D4FF appears exclusively where the AI is present or active. Everything else uses muted grays. "Controlled energy, not highlighter chaos."</p>
    </div>
    <div class="r-card">
      <h3>THE ORB — AI PRESENCE VISUAL</h3>
      <p>Dribbble's emerging AI-presence category shows sparse interfaces built around a single glowing orb. BEACON's orb appears on the dashboard hero card, the AI brief screen, and AI sourcing — the same concentric ellipse structure used to signal intelligence without explaining it.</p>
    </div>
    <div class="r-card">
      <h3>DOMAIN RESEARCH — TALENT INTELLIGENCE</h3>
      <p>Competitive set: Findem (AI talent mapping), SeekOut (signal-based sourcing), Beamery (talent CRM). Gap found: none unify passive signal detection + pipeline management + AI brief generation in one interface. BEACON's orb symbolizes that unified intelligence layer.</p>
    </div>
  </div>
</section>

<footer>
  <span>RAM Design Studio · Heartbeat · March 17, 2026</span>
  <a href="https://ram.zenbin.org/gallery" style="color:inherit;text-decoration:none">ram.zenbin.org/gallery</a>
</footer>

<script>
const D="${penB64}";
const PROMPT="Design BEACON — an AI-powered talent intelligence platform. Bento grid dashboard with AI recruiter orb. Dark ambient palette with single cyan accent. Pipeline kanban, candidate profiles with AI match scores, and an AI sourcing interface.";
const CSS_TOKENS=document.getElementById('css-tokens').textContent;

function toast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg;t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),2000);
}
function openInViewer(){
  try{
    const jsonStr=atob(D);JSON.parse(jsonStr);
    localStorage.setItem('pv_pending',JSON.stringify({json:jsonStr,name:'beacon.pen'}));
    window.open('https://zenbin.org/p/pen-viewer-3','_blank');
  }catch(e){alert('Error: '+e.message);}
}
function downloadPen(){
  try{
    const blob=new Blob([atob(D)],{type:'application/json'});
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);
    a.download='beacon.pen';a.click();URL.revokeObjectURL(a.href);
  }catch(e){alert('Error: '+e.message);}
}
function copyPrompt(){
  navigator.clipboard.writeText(PROMPT).then(()=>toast('Prompt copied ✓')).catch(()=>{
    const ta=document.createElement('textarea');ta.value=PROMPT;
    document.body.appendChild(ta);ta.select();document.execCommand('copy');
    document.body.removeChild(ta);toast('Prompt copied ✓');
  });
}
function copyTokens(){
  navigator.clipboard.writeText(CSS_TOKENS).then(()=>toast('CSS tokens copied ✓')).catch(()=>{
    const ta=document.createElement('textarea');ta.value=CSS_TOKENS;
    document.body.appendChild(ta);ta.select();document.execCommand('copy');
    document.body.removeChild(ta);toast('CSS tokens copied ✓');
  });
}
function shareOnX(){
  const text=encodeURIComponent('BEACON — AI talent intelligence platform. Bento grid dashboard, AI recruiter orb, pipeline kanban. 10 screens + brand spec + CSS tokens from one prompt. By RAM Design Studio');
  const url=encodeURIComponent(window.location.href);
  window.open('https://x.com/intent/tweet?text='+text+'&url='+url,'_blank');
}

// Render thumbnails from pen data
(function(){
  try {
    const doc = JSON.parse(atob(D));
    const screens = doc.children || [];
    const container = document.getElementById('thumbs-container');
    const THUMB_H = 180;
    const labels = ['M · Dashboard','M · Candidate','M · Pipeline','M · AI Brief','M · Profile','D · Dashboard','D · Candidate','D · AI Sourcing','D · Pipeline','D · Analytics'];
    screens.forEach((s, i) => {
      const tw = Math.round(THUMB_H * (s.width / s.height));
      const svg = renderScreen(s, tw, THUMB_H);
      const div = document.createElement('div');
      div.style.cssText = 'text-align:center;flex-shrink:0';
      div.innerHTML = svg + \`<div style="font-size:9px;opacity:.4;margin-top:8px;letter-spacing:1px;max-width:\${tw}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">\${(labels[i]||'SCREEN '+(i+1)).toUpperCase()}</div>\`;
      container.appendChild(div);
    });
  } catch(e) { console.error('Thumb error:', e); }
})();

function renderEl(el, depth) {
  if (!el || depth > 5) return '';
  const x=el.x||0,y=el.y||0,w=Math.max(0,el.width||0),h=Math.max(0,el.height||0);
  const fill=el.fill||'none';
  const oAttr=(el.opacity!==undefined&&el.opacity<0.99)?\` opacity="\${el.opacity.toFixed(2)}"\`:'';
  const rAttr=el.cornerRadius?\` rx="\${Math.min(el.cornerRadius,w/2,h/2)}"\`:'';
  if(el.type==='frame'){
    const bg=\`<rect x="\${x}" y="\${y}" width="\${w}" height="\${h}" fill="\${fill}"\${rAttr}\${oAttr}/>\`;
    const kids=(el.children||[]).map(c=>renderEl(c,depth+1)).join('');
    if(!kids)return bg;
    return \`\${bg}<g transform="translate(\${x},\${y})">\${kids}</g>\`;
  }
  if(el.type==='ellipse'){
    return \`<ellipse cx="\${x+w/2}" cy="\${y+h/2}" rx="\${w/2}" ry="\${h/2}" fill="\${fill}"\${oAttr}/>\`;
  }
  if(el.type==='text'){
    const fh=Math.max(1,Math.min(h,(el.fontSize||13)*0.7));
    return \`<rect x="\${x}" y="\${y+(h-fh)/2}" width="\${w}" height="\${fh}" fill="\${fill}"\${oAttr} rx="1"/>\`;
  }
  return '';
}
function renderScreen(screen, tw, th) {
  const sw=screen.width,sh=screen.height;
  const kids=(screen.children||[]).map(c=>renderEl(c,0)).join('');
  return \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 \${sw} \${sh}" width="\${tw}" height="\${th}" style="display:block;border-radius:8px;flex-shrink:0"><rect width="\${sw}" height="\${sh}" fill="\${screen.fill||'#111'}"/>\${kids}</svg>\`;
}
</script>
</body>
</html>`;

// ── Publish ────────────────────────────────────────────────────────────────────
const slugs = ['beacon-v2','beacon-ti','beacon-ds','beacon-v3'];

function publishPage(slug, htmlContent) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title: 'BEACON — Talent Intelligence Platform', html: htmlContent });
    const req = https.request({
      hostname:'zenbin.org', port:443, path:`/v1/pages/${slug}`,
      method:'POST', headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)},
    }, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>resolve({status:res.statusCode,body:d})); });
    req.on('error',reject);
    req.write(body);
    req.end();
  });
}

(async()=>{
  for(const slug of slugs){
    const r = await publishPage(slug, html);
    if(r.status===200||r.status===201){
      console.log(`✓ Published: https://zenbin.org/p/${slug}`);
      return;
    }
    if(r.status!==409){console.error(`✗ HTTP ${r.status}: ${r.body.slice(0,200)}`);break;}
    console.log(`  Slug "${slug}" taken, trying next…`);
  }
})();
