'use strict';
// grove.js — Gen Z personal finance app
// Heartbeat design — March 17, 2026
//
// Inspiration: MoMoney by Jordan Gilroy on Awwwards SOTD
//   → Deep forest green background (not black — SATURATED dark green)
//   → Neon lime high-contrast text
//   → Bold editorial display numerics
// Also: Luma Labs landing (land-book.com) → medium-weight type, clean AI-era visual language
//
// New skills used:
//   → pen-utils.js → linearGradient, dropShadow, GRADIENTS, SHADOWS
//   → GradientCard, GlowOrb helpers

const fs    = require('fs');
const https = require('https');
const U     = require('./pen-utils');

// ── Palette (MoMoney-inspired forest green × neon lime) ───────────────────────
const P = {
  bg:      '#071A0E',  // deepest forest green
  surface: '#0C2416',  // card surface
  raised:  '#112D1D',  // elevated card
  border:  '#1E4A2E',  // subtle border
  muted:   '#3D6B4A',  // muted text/icon
  mid:     '#6B9E78',  // secondary text

  neon:    '#AAFF45',  // neon lime — MoMoney energy
  neonDim: '#78B830',  // dimmer lime for secondary elements
  white:   '#F0FFE8',  // warm white (slightly green-tinted)
  fg:      '#D4F0DC',  // body text

  orange:  '#FF6B35',  // warm contrast accent (spending / alerts)
  red:     '#FF4444',  // danger
  gold:    '#FFD166',  // savings / positive
};

// ── Canvas ────────────────────────────────────────────────────────────────────
const MW = 375, MH = 812;
const DW = 1440, DH = 900;
const SP = 80; // desktop screen padding (offset for multi-screen layout)

// ── Gradient fills ─────────────────────────────────────────────────────────────
const G = {
  hero:    U.linearGradient(180, [[0,'#0A2415'],[1,'#071A0E']]),
  neonBar: U.linearGradient(90,  [[0,'#AAFF45'],[1,'#78E820']]),
  orangeBar: U.linearGradient(90,[[0,'#FF6B35'],[1,'#FF9260']]),
  goldBar: U.linearGradient(90,  [[0,'#FFD166'],[1,'#FFC233']]),
  redBar:  U.linearGradient(90,  [[0,'#FF4444'],[1,'#CC0000']]),
  ring:    U.linearGradient(135, [[0,'#AAFF45'],[0.6,'#78E820'],[1,'#46A010']]),
  surface: U.linearGradient(160, [[0,'#0E2A1A'],[1,'#0A2015']]),
  glow:    U.radialGradient([[0,'rgba(170,255,69,0.15)'],[1,'transparent']]),
  cardShimmer: U.linearGradient(135, [[0,'#0F3020'],[1,'#0C2416']]),
};

// ── Pen helpers ───────────────────────────────────────────────────────────────
function F(x,y,w,h,fill,opts={}) {
  const n = { type:'frame',x,y,width:w,height:h,fill,
    cornerRadius:opts.r||0, opacity:opts.op||1,
    children:opts.ch||[], clipContent:opts.clip||false };
  if (opts.fx) n.effects = opts.fx;
  return n;
}
function T(text,x,y,w,h,opts={}) {
  return { type:'text',x,y,width:w,height:h, content:String(text),
    fontSize:opts.size||14, fontWeight:opts.weight||400,
    fill:opts.fill||P.fg, textAlign:opts.align||'left',
    letterSpacing:opts.ls||0, opacity:opts.op||1 };
}
function E(x,y,w,h,fill,opts={}) {
  const n = { type:'ellipse',x,y,width:w,height:h,fill,opacity:opts.op||1 };
  if (opts.fx) n.effects = opts.fx;
  return n;
}
function L(x,y,w,h,fill) { return F(x,y,w,h,fill,{r:0}); }

// ── Component helpers ──────────────────────────────────────────────────────────

// Gradient stat bar: used in spend breakdown
function StatBar(x,y,w,h,pct,gradFill,label,amount,labelFill) {
  const bw = Math.round(w * pct);
  return [
    // Label
    T(label, x, y, 140, 14, {size:12, weight:500, fill:labelFill||P.mid}),
    T(amount, x+w-80, y, 80, 14, {size:12, weight:600, fill:P.fg, align:'right'}),
    // Track
    F(x, y+20, w, h, P.border, {r:h/2}),
    // Fill
    U.FG(x, y+20, bw, h, gradFill, {r:h/2}),
  ];
}

// Amount display with big neon number
function BigStat(x,y,label,amount,change,positive) {
  return [
    T(label, x, y, 200, 13, {size:11, weight:500, fill:P.muted, ls:1.5}),
    T(amount, x, y+18, 300, 52, {size:46, weight:700, fill:P.neon, ls:-1}),
    T((positive?'+':'')+change, x, y+74, 200, 16,
      {size:13, weight:500, fill: positive ? P.neon : P.orange}),
  ];
}

// Category chip
function Chip(x,y,w,label,active) {
  return F(x,y,w,28, active?P.neon:P.border, {r:14, ch:[
    T(label, 0, 6, w, 16, {size:12, weight:active?700:400,
      fill:active?P.bg:P.mid, align:'center'}),
  ]});
}

// Nav tab icon (simplified)
function NavTab(x,y,icon,label,active) {
  return F(x,y,60,52, 'transparent', {ch:[
    F(x+16,y+4, 28,28, active?P.neon:P.border, {r:8, ch:[
      T(icon, 0, 4, 28, 20, {size:14, align:'center', fill:active?P.bg:P.muted}),
    ]}),
    T(label, x, y+34, 60, 14, {size:9, weight:active?700:400,
      fill:active?P.neon:P.muted, align:'center', ls:0.5}),
  ]});
}

// Spending category row
function SpendRow(x,y,w,icon,name,amount,pct,barFill) {
  return [
    F(x, y, w, 56, G.cardShimmer, {r:12, fx:U.SHADOWS.soft, ch:[
      // Icon
      F(12, 12, 32, 32, P.border, {r:8, ch:[
        T(icon, 0, 6, 32, 20, {size:14, align:'center', fill:P.neon}),
      ]}),
      // Name
      T(name, 54, 10, w-140, 16, {size:13, weight:600, fill:P.fg}),
      // Amount
      T(amount, w-76, 10, 72, 16, {size:13, weight:700, fill:P.white, align:'right'}),
      // Bar
      F(54, 34, w-140, 6, P.border, {r:3}),
      U.FG(54, 34, Math.round((w-140)*pct), 6, barFill, {r:3}),
    ]}),
  ];
}

// Progress ring (arc approximation using ellipse overlaps)
function RingProgress(cx,cy,r,pct,strokeColor) {
  // Outer ring track
  const items = [
    E(cx-r, cy-r, r*2, r*2, P.border),
  ];
  // Fill using stacked small frames to simulate arc
  // (Simple approach: a colored ellipse, clipped to show pct as arc)
  // We simulate with a gradient disc + mask concept (not possible in .pen)
  // Instead: full disc + overlay disc to create arc effect
  if (pct > 0) {
    items.push(E(cx-r, cy-r, r*2, r*2, G.ring, {op: 0.3 + pct*0.7}));
    items.push(E(cx-r+6, cy-r+6, (r-6)*2, (r-6)*2, P.surface));
  }
  return items;
}

// ── SCREEN 1: Mobile Home ─────────────────────────────────────────────────────
function mHome() {
  const x = 0, y = 0;
  return F(x, y, MW, MH, G.hero, {clip:true, ch:[

    // Status bar
    T('9:41', 16, 16, 80, 16, {size:14, weight:600, fill:P.white}),
    T('●●●', MW-56, 16, 48, 16, {size:11, fill:P.muted, align:'right'}),

    // Header
    T('Grove', 16, 56, 120, 28, {size:22, weight:800, fill:P.neon, ls:-0.5}),
    F(MW-52, 48, 36, 36, P.border, {r:18, ch:[
      T('MJ', 0, 8, 36, 20, {size:13, weight:700, fill:P.neon, align:'center'}),
    ]}),

    // Greeting
    T('Good morning, Maya', 16, 104, MW-32, 20, {size:16, weight:500, fill:P.fg}),

    // Balance card
    U.FG(16, 136, MW-32, 160, G.surface, {r:20, fx:U.SHADOWS.medium, ch:[
      T('TOTAL BALANCE', 20, 20, 240, 13, {size:10, weight:700, fill:P.muted, ls:2}),
      T('$12,847', 20, 40, 260, 60, {size:52, weight:700, fill:P.neon, ls:-2}),
      T('+$340 this month', 20, 104, 200, 16, {size:13, weight:500, fill:P.neonDim}),
      // Mini bar chart
      ...([0.3,0.5,0.4,0.7,0.6,0.8,0.9]).map((h,i) =>
        U.FG(MW-32-16 - (6-i)*22, 104+Math.round((1-h)*40), 14, Math.round(h*44), G.neonBar, {r:3})
      ),
    ]}),

    // Quick actions row
    T('QUICK ACTIONS', 16, 316, 200, 13, {size:10, weight:700, fill:P.muted, ls:2}),
    ...[
      {icon:'↑', label:'Send', x:16},
      {icon:'↓', label:'Receive', x:102},
      {icon:'⊕', label:'Add', x:188},
      {icon:'☰', label:'More', x:274},
    ].map(a => F(a.x, 338, 72, 72, P.raised, {r:16, fx:U.SHADOWS.soft, ch:[
      T(a.icon, 0, 14, 72, 24, {size:20, align:'center', fill:P.neon}),
      T(a.label, 0, 42, 72, 16, {size:11, weight:500, fill:P.mid, align:'center'}),
    ]})),

    // Recent transactions
    T('RECENT', 16, 432, 120, 13, {size:10, weight:700, fill:P.muted, ls:2}),
    T('See all', MW-56, 432, 48, 13, {size:11, weight:500, fill:P.neonDim, align:'right'}),

    ...[
      {icon:'☕', name:'Blue Bottle Coffee', cat:'Food', amt:'-$6.80', pos:false},
      {icon:'🚇', name:'MTA — Monthly Pass', cat:'Transport', amt:'-$132', pos:false},
      {icon:'↑', name:'Payroll Deposit', cat:'Income', amt:'+$3,200', pos:true},
    ].flatMap((t,i) => [
      F(16, 456+i*68, MW-32, 56, G.cardShimmer, {r:14, fx:U.SHADOWS.soft, ch:[
        T(t.icon, 12, 14, 28, 28, {size:18, align:'center'}),
        T(t.name, 50, 10, MW-170, 16, {size:13, weight:600, fill:P.fg}),
        T(t.cat,  50, 30, MW-170, 14, {size:11, fill:P.mid}),
        T(t.amt, MW-110, 14, 80, 20, {size:14, weight:700,
          fill:t.pos?P.neon:P.fg, align:'right'}),
      ]}),
    ]),

    // Bottom nav
    F(0, MH-80, MW, 80, P.surface, {ch:[
      L(0,0,MW,1,P.border),
      NavTab(18,  12, '◈', 'HOME',   true),
      NavTab(98,  12, '◉', 'SPEND',  false),
      NavTab(178, 12, '◎', 'GOALS',  false),
      NavTab(258, 12, '◐', 'INVEST', false),
      NavTab(318, 12, '◑', 'CARD',   false),
    ]}),
  ]});
}

// ── SCREEN 2: Mobile Spend ────────────────────────────────────────────────────
function mSpend() {
  const x = MW + 40;
  return F(x, 0, MW, MH, G.hero, {clip:true, ch:[

    T('9:41', 16, 16, 80, 16, {size:14, weight:600, fill:P.white}),
    T('Grove', 16, 56, 120, 28, {size:22, weight:800, fill:P.neon, ls:-0.5}),

    // Period chips
    ...[['Week',true,16],['Month',false,82],['Year',false,154]].map(([l,a,cx]) =>
      Chip(cx, 96, 58, l, a)
    ),

    // Total spend
    ...BigStat(16, 136, 'SPENT THIS WEEK', '$486.40', '$24 from last week', false),

    // Donut area (simplified as stacked colored arcs using overlapping ellipses)
    // Outer border ring
    E(MW/2-64, 230, 128, 128, P.border, {fx:U.SHADOWS.soft}),
    // Segments (overlapping arcs — approximated)
    E(MW/2-62, 232, 124, 124, G.neonBar,   {op:0.9}),
    E(MW/2-52, 242, 104, 104, G.orangeBar, {op:0.7}),
    E(MW/2-42, 252,  84,  84, G.goldBar,   {op:0.6}),
    E(MW/2-36, 258,  72,  72, P.surface),   // center hole
    // Center label
    T('$486', MW/2-40, 280, 80, 30, {size:22, weight:700, fill:P.neon, align:'center'}),
    T('total', MW/2-30, 310, 60, 14, {size:10, fill:P.muted, align:'center', ls:1}),

    // Category breakdown
    T('BREAKDOWN', 16, 376, 200, 13, {size:10, weight:700, fill:P.muted, ls:2}),

    ...SpendRow(16, 400, MW-32, '☕', 'Food & Drink',   '$186', 0.38, G.neonBar),
    ...SpendRow(16, 468, MW-32, '🏠', 'Housing',       '$148', 0.30, G.goldBar),
    ...SpendRow(16, 536, MW-32, '🚇', 'Transport',     '$98',  0.20, G.orangeBar),
    ...SpendRow(16, 604, MW-32, '🛍', 'Shopping',      '$54',  0.12, G.redBar),

    // Bottom nav
    F(0, MH-80, MW, 80, P.surface, {ch:[
      L(0,0,MW,1,P.border),
      NavTab(18,  12, '◈', 'HOME',  false),
      NavTab(98,  12, '◉', 'SPEND', true),
      NavTab(178, 12, '◎', 'GOALS', false),
      NavTab(258, 12, '◐', 'INVEST',false),
      NavTab(318, 12, '◑', 'CARD',  false),
    ]}),
  ]});
}

// ── SCREEN 3: Mobile Goals ────────────────────────────────────────────────────
function mGoals() {
  const x = (MW+40)*2;
  return F(x, 0, MW, MH, G.hero, {clip:true, ch:[

    T('9:41', 16, 16, 80, 16, {size:14, weight:600, fill:P.white}),
    T('Goals', 16, 56, 200, 28, {size:22, weight:800, fill:P.neon, ls:-0.5}),
    F(MW-52, 50, 36, 36, P.neon, {r:8, ch:[
      T('+', 0, 2, 36, 28, {size:22, weight:700, fill:P.bg, align:'center'}),
    ]}),

    T('3 goals on track  ·  1 at risk', 16, 96, MW-32, 16, {size:13, fill:P.mid}),

    // Goal card 1: Japan Trip
    U.FG(16, 124, MW-32, 140, G.cardShimmer, {r:16, fx:U.SHADOWS.medium, ch:[
      T('✈', 16, 16, 28, 28, {size:22}),
      T('Japan Trip 2026', 52, 18, 200, 18, {size:15, weight:700, fill:P.white}),
      T('Tokyo · Kyoto · Osaka', 52, 40, 200, 14, {size:11, fill:P.mid}),
      T('$2,840', 16, 72, 120, 30, {size:26, weight:800, fill:P.neon, ls:-0.5}),
      T('of $4,500', 140, 82, 100, 16, {size:11, fill:P.mid}),
      // Progress bar
      F(16, 108, MW-64, 10, P.border, {r:5}),
      U.FG(16, 108, Math.round((MW-64)*0.63), 10, G.neonBar, {r:5}),
      T('63%', MW-64, 104, 36, 16, {size:11, weight:700, fill:P.neon, align:'right'}),
    ]}),

    // Goal card 2: Emergency Fund
    U.FG(16, 276, MW-32, 140, G.cardShimmer, {r:16, fx:U.SHADOWS.medium, ch:[
      T('🏦', 16, 16, 28, 28, {size:22}),
      T('Emergency Fund', 52, 18, 200, 18, {size:15, weight:700, fill:P.white}),
      T('6 months expenses', 52, 40, 200, 14, {size:11, fill:P.mid}),
      T('$9,200', 16, 72, 140, 30, {size:26, weight:800, fill:P.gold, ls:-0.5}),
      T('of $12,000', 160, 82, 100, 16, {size:11, fill:P.mid}),
      F(16, 108, MW-64, 10, P.border, {r:5}),
      U.FG(16, 108, Math.round((MW-64)*0.77), 10, G.goldBar, {r:5}),
      T('77%', MW-64, 104, 36, 16, {size:11, weight:700, fill:P.gold, align:'right'}),
    ]}),

    // Goal card 3: New Laptop (at risk)
    U.FG(16, 428, MW-32, 140, G.cardShimmer, {r:16,
      fx: U.dropShadow('rgba(255,68,68,0.2)', 20, 0, 8),
      ch:[
      F(0, 0, MW-32, 4, G.redBar, {r:16}),
      T('💻', 16, 20, 28, 28, {size:22}),
      T('M4 MacBook Pro', 52, 22, 200, 18, {size:15, weight:700, fill:P.white}),
      T('AT RISK', 52, 44, 80, 14, {size:9, weight:700, fill:P.red, ls:1.5}),
      T('$640', 16, 76, 100, 30, {size:26, weight:800, fill:P.red, ls:-0.5}),
      T('of $3,200', 120, 86, 100, 16, {size:11, fill:P.mid}),
      F(16, 112, MW-64, 10, P.border, {r:5}),
      U.FG(16, 112, Math.round((MW-64)*0.20), 10, G.redBar, {r:5}),
      T('20%', MW-64, 108, 36, 16, {size:11, weight:700, fill:P.red, align:'right'}),
    ]}),

    // Bottom nav
    F(0, MH-80, MW, 80, P.surface, {ch:[
      L(0,0,MW,1,P.border),
      NavTab(18,  12, '◈', 'HOME',  false),
      NavTab(98,  12, '◉', 'SPEND', false),
      NavTab(178, 12, '◎', 'GOALS', true),
      NavTab(258, 12, '◐', 'INVEST',false),
      NavTab(318, 12, '◑', 'CARD',  false),
    ]}),
  ]});
}

// ── SCREEN 4: Desktop Dashboard ───────────────────────────────────────────────
function dDashboard() {
  const x = 0, y = MH + 60;
  const SB = 240; // sidebar width
  const MAIN = DW - SB;

  return F(x, y, DW, DH, G.hero, {clip:true, ch:[

    // Sidebar
    F(0, 0, SB, DH, P.surface, {ch:[
      // Logo
      T('Grove', 24, 28, 120, 32, {size:24, weight:800, fill:P.neon, ls:-0.5}),
      T('personal finance', 24, 60, 160, 14, {size:10, weight:500, fill:P.muted, ls:1.5}),
      L(0, 84, SB, 1, P.border),

      // Nav
      ...[
        {icon:'◈', label:'Dashboard', active:true,  y:108},
        {icon:'◉', label:'Spending',  active:false, y:148},
        {icon:'◎', label:'Goals',     active:false, y:188},
        {icon:'◐', label:'Investing', active:false, y:228},
        {icon:'◑', label:'Card',      active:false, y:268},
        {icon:'☰', label:'Budgets',   active:false, y:308},
      ].flatMap(n => [
        n.active ? F(12, n.y, SB-24, 36, P.raised, {r:10}) : F(0,0,0,0,'transparent'),
        T(n.icon, 24, n.y+8, 24, 20, {size:16, fill: n.active?P.neon:P.muted}),
        T(n.label, 54, n.y+10, 140, 16, {size:13, weight:n.active?600:400,
          fill:n.active?P.white:P.muted}),
        n.active ? F(SB-6, n.y+8, 4, 20, P.neon, {r:2}) : F(0,0,0,0,'transparent'),
      ]),

      // User
      L(0, DH-80, SB, 1, P.border),
      E(16, DH-62, 36, 36, G.ring),
      T('MJ', 16, DH-62, 36, 36, {size:12, weight:700, fill:P.bg, align:'center'}),
      T('Maya Johnson', 60, DH-58, 140, 16, {size:12, weight:600, fill:P.fg}),
      T('Pro Plan', 60, DH-40, 100, 14, {size:10, fill:P.neonDim}),
    ]}),

    // Main content
    F(SB, 0, MAIN, DH, 'transparent', {ch:[

      // Top bar
      T('Dashboard', 32, 28, 300, 28, {size:22, weight:700, fill:P.white, ls:-0.3}),
      T('March 17, 2026', 32, 60, 200, 14, {size:12, fill:P.muted}),

      // Summary stats (4 cards top row)
      ...([
        {label:'NET WORTH',   value:'$48,204',  change:'+4.2%', pos:true,  x:32},
        {label:'MONTHLY SAVE',value:'$1,240',   change:'+$180', pos:true,  x:32+280+16},
        {label:'SPENT TODAY', value:'$84.20',   change:'-$12',  pos:false, x:32+(280+16)*2},
        {label:'CREDIT SCORE',value:'742',      change:'+8 pts',pos:true,  x:32+(280+16)*3},
      ].map(s => U.FG(s.x, 96, 280, 100, G.cardShimmer, {r:16, fx:U.SHADOWS.soft, ch:[
        T(s.label, 20, 18, 240, 12, {size:9, weight:700, fill:P.muted, ls:2}),
        T(s.value, 20, 36, 240, 36, {size:30, weight:800, fill:P.neon, ls:-0.5}),
        T(s.change, 20, 76, 160, 14, {size:11, weight:500,
          fill:s.pos?P.neonDim:P.orange}),
      ]}))),

      // Chart card
      U.FG(32, 216, MAIN-64, 220, G.cardShimmer, {r:16, fx:U.SHADOWS.medium, ch:[
        T('Spending vs Income', 24, 20, 300, 18, {size:15, weight:700, fill:P.white}),
        T('Last 7 days', 24, 44, 180, 14, {size:11, fill:P.muted}),
        // Income bars
        ...[2800,3100,2400,2900,3200,2600,3400].map((v,i) => {
          const bh = Math.round((v/4000)*130);
          const bx = 24+i*(MAIN-128)/7;
          return U.FG(bx, 60+(130-bh), Math.round((MAIN-128)/7)-8, bh, G.neonBar, {r:4, op:0.7});
        }),
        // Spend bars
        ...[1200,980,1450,1100,860,1300,1040].map((v,i) => {
          const bh = Math.round((v/4000)*130);
          const bx = 24+i*(MAIN-128)/7 + Math.round(((MAIN-128)/7-8)/2)-2;
          return U.FG(bx, 60+(130-bh), Math.round((MAIN-128)/7-8)/2-2, bh, G.orangeBar, {r:3, op:0.8});
        }),
        // X axis labels
        ...['M','T','W','T','F','S','S'].map((d,i) =>
          T(d, 24+i*(MAIN-128)/7, 196, Math.round((MAIN-128)/7), 14,
            {size:10, fill:P.muted, align:'center'})
        ),
        // Legend
        U.FG(MAIN-210, 18, 10, 10, G.neonBar, {r:2}),
        T('Income', MAIN-196, 16, 60, 14, {size:10, fill:P.mid}),
        U.FG(MAIN-130, 18, 10, 10, G.orangeBar, {r:2}),
        T('Spending', MAIN-116, 16, 70, 14, {size:10, fill:P.mid}),
      ]}),

      // Bottom row: Spend breakdown + Goals
      // Spend card
      U.FG(32, 456, (MAIN-80)/2, 200, G.cardShimmer, {r:16, fx:U.SHADOWS.soft, ch:[
        T('Top Categories', 20, 20, 240, 18, {size:14, weight:700, fill:P.white}),
        ...StatBar(20, 52,  (MAIN-80)/2-40, 8, 0.38, G.neonBar,   'Food & Drink', '$186', P.mid),
        ...StatBar(20, 86,  (MAIN-80)/2-40, 8, 0.30, G.goldBar,   'Housing',      '$148', P.mid),
        ...StatBar(20, 120, (MAIN-80)/2-40, 8, 0.20, G.orangeBar, 'Transport',    '$98',  P.mid),
        ...StatBar(20, 154, (MAIN-80)/2-40, 8, 0.12, G.redBar,    'Shopping',     '$54',  P.mid),
      ]}),

      // Goals card
      U.FG(32+(MAIN-80)/2+16, 456, (MAIN-80)/2, 200, G.cardShimmer, {r:16, fx:U.SHADOWS.soft, ch:[
        T('Goals', 20, 20, 240, 18, {size:14, weight:700, fill:P.white}),
        ...[
          {name:'Japan Trip',      pct:0.63, fill:G.neonBar,  color:P.neon},
          {name:'Emergency Fund',  pct:0.77, fill:G.goldBar,  color:P.gold},
          {name:'MacBook Pro',     pct:0.20, fill:G.redBar,   color:P.red},
        ].flatMap((g,i) => [
          T(g.name, 20, 52+i*44, 200, 14, {size:12, weight:500, fill:P.fg}),
          T(Math.round(g.pct*100)+'%', (MAIN-80)/2-60, 52+i*44, 40, 14,
            {size:11, weight:700, fill:g.color, align:'right'}),
          F(20, 70+i*44, (MAIN-80)/2-40, 8, P.border, {r:4}),
          U.FG(20, 70+i*44, Math.round(((MAIN-80)/2-40)*g.pct), 8, g.fill, {r:4}),
        ]),
      ]}),
    ]}),
  ]});
}

// ── SCREEN 5: Desktop Transactions ───────────────────────────────────────────
function dTransactions() {
  const x = DW + 40, y = MH + 60;
  const SB = 240, MAIN = DW - SB;

  const txns = [
    {icon:'☕', name:'Blue Bottle Coffee',  cat:'Food',      date:'Today 8:14am',  amt:'-$6.80',  pos:false},
    {icon:'📱', name:'Spotify Premium',     cat:'Subscriptions',date:'Today 12:00am',amt:'-$11.99',pos:false},
    {icon:'↑',  name:'Payroll Deposit',     cat:'Income',    date:'Mar 15',        amt:'+$3,200', pos:true},
    {icon:'🛒', name:'Whole Foods Market',  cat:'Grocery',   date:'Mar 14',        amt:'-$84.30', pos:false},
    {icon:'🚇', name:'MTA Monthly Pass',    cat:'Transport', date:'Mar 14',        amt:'-$132',   pos:false},
    {icon:'💡', name:'Con Edison',          cat:'Utilities', date:'Mar 13',        amt:'-$94.60', pos:false},
    {icon:'🎬', name:'Netflix',             cat:'Entertainment',date:'Mar 12',     amt:'-$15.99', pos:false},
    {icon:'↑',  name:'Freelance Payment',  cat:'Income',    date:'Mar 11',        amt:'+$800',   pos:true},
  ];

  return F(x, y, DW, DH, G.hero, {clip:true, ch:[

    // Sidebar (same nav)
    F(0, 0, SB, DH, P.surface, {ch:[
      T('Grove', 24, 28, 120, 32, {size:24, weight:800, fill:P.neon, ls:-0.5}),
      T('personal finance', 24, 60, 160, 14, {size:10, weight:500, fill:P.muted, ls:1.5}),
      L(0, 84, SB, 1, P.border),
      ...[
        {icon:'◈', label:'Dashboard', active:false, y:108},
        {icon:'◉', label:'Spending',  active:true,  y:148},
        {icon:'◎', label:'Goals',     active:false, y:188},
        {icon:'◐', label:'Investing', active:false, y:228},
        {icon:'◑', label:'Card',      active:false, y:268},
        {icon:'☰', label:'Budgets',   active:false, y:308},
      ].flatMap(n => [
        n.active ? F(12, n.y, SB-24, 36, P.raised, {r:10}) : F(0,0,0,0,'transparent'),
        T(n.icon, 24, n.y+8, 24, 20, {size:16, fill:n.active?P.neon:P.muted}),
        T(n.label, 54, n.y+10, 140, 16, {size:13, weight:n.active?600:400,
          fill:n.active?P.white:P.muted}),
        n.active ? F(SB-6, n.y+8, 4, 20, P.neon, {r:2}) : F(0,0,0,0,'transparent'),
      ]),
    ]}),

    // Main
    F(SB, 0, MAIN, DH, 'transparent', {ch:[
      T('Spending', 32, 28, 300, 28, {size:22, weight:700, fill:P.white, ls:-0.3}),

      // Filters
      ...[['All',true,32],['Income',false,90],['Food',false,160],['Transport',false,218],['Shopping',false,298]].map(
        ([l,a,cx]) => Chip(cx, 68, l.length*8+16, l, a)
      ),

      // Transaction list header
      F(32, 110, MAIN-64, 36, P.raised, {r:8, ch:[
        T('TRANSACTION', 16, 10, 300, 16, {size:10, weight:700, fill:P.muted, ls:2}),
        T('CATEGORY', MAIN-340, 10, 100, 16, {size:10, weight:700, fill:P.muted, ls:2}),
        T('DATE', MAIN-230, 10, 80, 16, {size:10, weight:700, fill:P.muted, ls:2}),
        T('AMOUNT', MAIN-130, 10, 90, 16, {size:10, weight:700, fill:P.muted, ls:2, align:'right'}),
      ]}),

      // Rows
      ...txns.flatMap((t,i) => [
        F(32, 154+i*52, MAIN-64, 44, i%2===0?G.cardShimmer:P.surface, {r:8, ch:[
          T(t.icon, 14, 10, 24, 24, {size:16}),
          T(t.name, 46, 12, 280, 16, {size:13, weight:500, fill:P.fg}),
          // Category pill
          F(MAIN-350, 12, 90, 20, P.border, {r:10, ch:[
            T(t.cat, 0, 3, 90, 14, {size:10, fill:P.mid, align:'center'}),
          ]}),
          T(t.date, MAIN-242, 14, 100, 14, {size:11, fill:P.muted}),
          T(t.amt, MAIN-138, 12, 90, 20, {size:14, weight:700,
            fill:t.pos?P.neon:P.fg, align:'right'}),
        ]}),
      ]),
    ]}),
  ]});
}

// ── SCREEN 6: Mobile Card ─────────────────────────────────────────────────────
function mCard() {
  const x = (MW+40)*3, y = 0;
  return F(x, y, MW, MH, G.hero, {clip:true, ch:[

    T('9:41', 16, 16, 80, 16, {size:14, weight:600, fill:P.white}),
    T('My Card', 16, 56, 200, 28, {size:22, weight:800, fill:P.neon, ls:-0.5}),

    // Physical card representation
    U.FG(16, 104, MW-32, 180, U.linearGradient(135, [
      [0, '#0E3A1E'], [0.4,'#1A5C30'], [0.8,'#0C2A18'], [1,'#071A0E']
    ]), {r:20, fx: U.dropShadow('rgba(170,255,69,0.25)', 40, 0, 16), ch:[
      // Card glow orb
      E(-20, -20, 120, 120, U.radialGradient([[0,'rgba(170,255,69,0.3)'],[1,'transparent']]), {op:1}),
      // Grove logo
      T('Grove', 20, 20, 120, 24, {size:18, weight:800, fill:P.neon, ls:-0.5}),
      // Contactless icon
      T('))))', MW-68, 20, 40, 20, {size:14, fill:P.neonDim, align:'right'}),
      // Card number
      T('•••• •••• •••• 4821', 20, 80, MW-72, 20, {size:16, weight:500, fill:P.fg, ls:2}),
      // Name and expiry
      T('MAYA JOHNSON', 20, 120, 200, 16, {size:11, weight:700, fill:P.mid, ls:2}),
      T('03/29', MW-80, 120, 60, 16, {size:12, fill:P.mid, align:'right'}),
    ]}),

    // Card stats
    T('AVAILABLE CREDIT', 16, 304, 200, 13, {size:10, weight:700, fill:P.muted, ls:2}),
    T('$4,200', 16, 322, 200, 36, {size:30, weight:800, fill:P.neon, ls:-0.5}),
    T('of $5,000 limit', 16, 362, 200, 14, {size:12, fill:P.mid}),

    // Credit bar
    F(16, 384, MW-32, 10, P.border, {r:5}),
    U.FG(16, 384, Math.round((MW-32)*0.84), 10, G.neonBar, {r:5}),
    T('84% available', MW-110, 380, 90, 14, {size:10, fill:P.neonDim, align:'right'}),

    // Quick actions
    T('CARD CONTROLS', 16, 410, 200, 13, {size:10, weight:700, fill:P.muted, ls:2}),
    ...[
      {icon:'❄', label:'Freeze Card', active:false},
      {icon:'✦', label:'Virtual Card', active:false},
      {icon:'↑', label:'Pay Bill', active:true},
      {icon:'⊕', label:'Limit', active:false},
    ].map((a,i) => U.FG(16+i*86, 432, 78, 78, G.cardShimmer, {r:16, fx:U.SHADOWS.soft, ch:[
      T(a.icon, 0, 12, 78, 28, {size:22, align:'center', fill:a.active?P.neon:P.mid}),
      T(a.label, 0, 44, 78, 28, {size:9, weight:500, fill:a.active?P.neon:P.muted,
        align:'center', ls:0.3}),
    ]})),

    // Recent card transactions
    T('RECENT CARD ACTIVITY', 16, 530, 220, 13, {size:10, weight:700, fill:P.muted, ls:2}),
    ...[
      {icon:'☕', name:'Blue Bottle Coffee', amt:'$6.80'},
      {icon:'🛒', name:'Whole Foods Market', amt:'$84.30'},
      {icon:'🎬', name:'Netflix', amt:'$15.99'},
    ].flatMap((t,i) => [
      F(16, 554+i*64, MW-32, 52, G.cardShimmer, {r:12, ch:[
        T(t.icon, 14, 12, 28, 28, {size:18}),
        T(t.name, 52, 14, MW-160, 16, {size:13, weight:500, fill:P.fg}),
        T('-$'+t.amt.slice(1), MW-90, 14, 72, 16, {size:13, weight:700, fill:P.fg, align:'right'}),
      ]}),
    ]),

    // Bottom nav
    F(0, MH-80, MW, 80, P.surface, {ch:[
      L(0,0,MW,1,P.border),
      NavTab(18,  12, '◈', 'HOME',  false),
      NavTab(98,  12, '◉', 'SPEND', false),
      NavTab(178, 12, '◎', 'GOALS', false),
      NavTab(258, 12, '◐', 'INVEST',false),
      NavTab(318, 12, '◑', 'CARD',  true),
    ]}),
  ]});
}

// ── Assemble + publish ─────────────────────────────────────────────────────────
function buildPen() {
  const screens = [
    mHome(),
    mSpend(),
    mGoals(),
    mCard(),
    dDashboard(),
    dTransactions(),
  ];
  return { version:'2.8', children: screens };
}

async function publish(slug, title, html, subdomain='ram') {
  const body = JSON.stringify({ title, html });
  return new Promise((resolve, reject) => {
    const r = https.request({
      hostname:'zenbin.org', path:`/v1/pages/${slug}`,
      method:'POST',
      headers:{'Content-Type':'application/json','Content-Length':Buffer.byteLength(body),'X-Subdomain':subdomain},
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({status:res.statusCode, body:d}));
    });
    r.on('error', reject);
    r.write(body); r.end();
  });
}

async function main() {
  // Write .pen file
  const pen = buildPen();
  const penPath = __dirname + '/grove.pen';
  fs.writeFileSync(penPath, JSON.stringify(pen, null, 2));
  console.log('✓ grove.pen written');

  // Read viewer template and inject pen data via window.EMBEDDED_PEN
  const viewerHtml = fs.readFileSync(__dirname + '/penviewer-app.html', 'utf8');
  const penJson = JSON.stringify(pen);
  // Inject BEFORE the main <script> block so window.EMBEDDED_PEN is set
  // before the viewer's `if (window.EMBEDDED_PEN)` auto-load check runs
  // loadDoc() calls JSON.parse() internally, so EMBEDDED_PEN must be a JSON string, not an object
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};</script>`;
  const shareHtml = viewerHtml.replace('<script>', injection + '\n<script>');

  // Publish to ram.zenbin.org/grove (updatable via X-Subdomain header)
  const slug = 'grove';
  console.log(`→ Publishing ${slug}...`);
  const r = await publish(slug, 'GROVE — Personal Finance App', shareHtml);
  const ok = r.status === 200 || r.status === 201;
  console.log(`  ${ok ? '✅' : '❌'} HTTP ${r.status}`);
  if (ok) { console.log(`  https://ram.zenbin.org/${slug}`); }
  else { console.log(' ', r.body.slice(0,200)); }
}

main().catch(e => { console.error(e); process.exit(1); });
