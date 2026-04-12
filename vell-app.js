'use strict';
// VELL — Personal finance, annotated
// Theme: LIGHT  Heartbeat: ongoing
// Inspired by:
//   - Minimal Gallery: warm off-white "big claim" hero, type-only hierarchy
//   - Land-Book: annotation-style hand-drawn underlines on key numbers (Ellipsus)
//   - Lapa Ninja: persimmon accent on clean backgrounds, "warm tech" positioning

const fs = require('fs');
const path = require('path');

const SLUG = 'vell';
const W = 390, H = 844;

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:      '#FAF8F4',   // warm vellum
  surf:    '#FFFFFF',
  card:    '#F3EFE9',
  card2:   '#EDE8E0',
  text:    '#1C1814',
  textSub: '#6B6258',
  muted:   '#A89E94',
  accent:  '#C05A2E',   // persimmon / terracotta
  accent2: '#4A7C59',   // sage green
  accentL: '#F2E0D8',   // persimmon light tint
  accent2L:'#D8EADC',   // sage light tint
  line:    '#E4DED6',
  white:   '#FFFFFF',
  danger:  '#D64535',
};

// ── Primitives ────────────────────────────────────────────────────────────────
function rect(x,y,w,h,fill,opts={}) {
  return { type:'rect', x,y,w,h, fill, rx:opts.rx||0,
    opacity:opts.opacity!==undefined?opts.opacity:1,
    stroke:opts.stroke||'none', strokeWidth:opts.sw||0 };
}
function text(x,y,content,size,fill,opts={}) {
  return { type:'text', x,y,content,size,fill,
    fontWeight:opts.fw||400, fontFamily:opts.font||'Inter,sans-serif',
    textAnchor:opts.anchor||'start', letterSpacing:opts.ls||0,
    opacity:opts.opacity!==undefined?opts.opacity:1 };
}
function circle(cx,cy,r,fill,opts={}) {
  return { type:'circle', cx,cy,r,fill,
    opacity:opts.opacity!==undefined?opts.opacity:1,
    stroke:opts.stroke||'none', strokeWidth:opts.sw||0 };
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  return { type:'line', x1,y1,x2,y2,stroke,
    strokeWidth:opts.sw||1, opacity:opts.opacity!==undefined?opts.opacity:1 };
}
// Annotation underline — wavy path rendered as a series of line segments
function annotationUnderline(x,y,w,color) {
  const els = [];
  const amp = 2.2, freq = 12;
  for (let i = 0; i < w - freq; i += freq) {
    const x1 = x + i,   y1 = y + Math.sin(i/freq * Math.PI) * amp;
    const x2 = x + i + freq/2, y2 = y - amp;
    const x3 = x + i + freq, y3 = y + Math.sin((i+freq)/freq * Math.PI) * amp;
    els.push(line(x1,y1,x2,y2,color,{sw:1.5,opacity:0.7}));
    els.push(line(x2,y2,x3,y3,color,{sw:1.5,opacity:0.7}));
  }
  return els;
}
// Annotation circle — approximated with arcs using line segments
function annotationCircle(cx,cy,rx,ry,color) {
  const els = [];
  const steps = 24;
  for (let i = 0; i < steps; i++) {
    const a1 = (i/steps)*Math.PI*2, a2 = ((i+1)/steps)*Math.PI*2;
    // slight wobble
    const wobble = 2;
    const x1 = cx + (rx+Math.sin(a1*3)*wobble)*Math.cos(a1);
    const y1 = cy + (ry+Math.cos(a1*2)*wobble)*Math.sin(a1);
    const x2 = cx + (rx+Math.sin(a2*3)*wobble)*Math.cos(a2);
    const y2 = cy + (ry+Math.cos(a2*2)*wobble)*Math.sin(a2);
    els.push(line(x1,y1,x2,y2,color,{sw:1.5,opacity:0.65}));
  }
  return els;
}

// ── SVG renderer ──────────────────────────────────────────────────────────────
function renderSVG(elements) {
  const tags = elements.map(e => {
    if (e.type === 'rect') {
      return `<rect x="${e.x}" y="${e.y}" width="${e.w}" height="${e.h}" rx="${e.rx}" fill="${e.fill}" opacity="${e.opacity}" stroke="${e.stroke}" stroke-width="${e.strokeWidth}"/>`;
    } else if (e.type === 'text') {
      return `<text x="${e.x}" y="${e.y}" font-size="${e.size}" fill="${e.fill}" font-weight="${e.fontWeight}" font-family="${e.fontFamily}" text-anchor="${e.textAnchor}" letter-spacing="${e.letterSpacing}" opacity="${e.opacity}">${e.content}</text>`;
    } else if (e.type === 'circle') {
      return `<circle cx="${e.cx}" cy="${e.cy}" r="${e.r}" fill="${e.fill}" opacity="${e.opacity}" stroke="${e.stroke}" stroke-width="${e.strokeWidth}"/>`;
    } else if (e.type === 'line') {
      return `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${e.stroke}" stroke-width="${e.strokeWidth}" opacity="${e.opacity}" stroke-linecap="round"/>`;
    }
    return '';
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${tags.join('')}</svg>`;
}

// ── Shared Components ─────────────────────────────────────────────────────────
function statusBar(theme='light') {
  return [
    rect(0,0,W,44,C.bg),
    text(20,28,'9:41',13,C.text,{fw:600}),
    text(W-20,28,'●●● ✦',12,C.text,{anchor:'end',opacity:0.5}),
  ];
}

function navBar(active) {
  const items = [
    {id:'home',  label:'Home',    icon:'⌂', x:39},
    {id:'spend', label:'Spend',   icon:'◎', x:117},
    {id:'budget',label:'Budget',  icon:'▦', x:195},
    {id:'goals', label:'Goals',   icon:'◈', x:273},
    {id:'you',   label:'You',     icon:'○', x:351},
  ];
  const els = [
    rect(0,H-82,W,82,C.surf),
    line(0,H-82,W,H-82,C.line,{sw:1}),
  ];
  items.forEach(item => {
    const isActive = item.id === active;
    const iconColor = isActive ? C.accent : C.muted;
    const labelColor = isActive ? C.accent : C.muted;
    els.push(text(item.x,H-52,item.icon,18,iconColor,{anchor:'middle',fw:isActive?600:400}));
    els.push(text(item.x,H-32,item.label,9,labelColor,{anchor:'middle',fw:isActive?600:400}));
    if (isActive) {
      els.push(rect(item.x-18,H-82,36,3,C.accent,{rx:2}));
    }
  });
  return els;
}

// ── Screen 1: Dashboard ───────────────────────────────────────────────────────
function screenDashboard() {
  const els = [];

  // Background
  els.push(rect(0,0,W,H,C.bg));
  els.push(...statusBar());

  // Header
  els.push(text(20,76,'Good morning,',13,C.textSub,{fw:400}));
  els.push(text(20,100,'Sarah.',28,C.text,{fw:700,font:'Georgia,serif'}));

  // Avatar
  els.push(circle(358,82,22,C.accentL));
  els.push(text(358,87,'S',14,C.accent,{anchor:'middle',fw:700}));

  // NET WORTH CARD — the hero number
  els.push(rect(16,116,W-32,148,C.surf,{rx:16,stroke:C.line,sw:1}));
  // Annotation label in margin
  els.push(text(32,146,'net worth',11,C.muted,{fw:400,ls:0.5}));
  // Big annotated number
  els.push(text(32,195,'$42,850',38,C.text,{fw:700,font:'Georgia,serif'}));
  // Annotation underline on the number
  els.push(...annotationUnderline(32,200,148,C.accent));
  // Month-over-month
  els.push(rect(32,214,80,22,C.accent2L,{rx:11}));
  els.push(text(72,229,'+$1,240',11,C.accent2,{anchor:'middle',fw:600}));
  els.push(text(120,229,'vs last month',11,C.muted,{fw:400}));

  // Mini sparkline
  const sparkY = [245,240,248,235,228,232,220,225,215,210,218,208];
  const sparkX0 = 32, sparkYBase = 250, sparkW = 310;
  for (let i = 0; i < sparkY.length-1; i++) {
    const sx = sparkX0 + i*(sparkW/(sparkY.length-1));
    const sx2 = sparkX0 + (i+1)*(sparkW/(sparkY.length-1));
    const sy = sparkYBase - (250-sparkY[i])*0.9;
    const sy2 = sparkYBase - (250-sparkY[i+1])*0.9;
    els.push(line(sx,sy,sx2,sy2,C.accent,{sw:1.5,opacity:0.6}));
  }
  // sparkline end dot
  const lastX = sparkX0 + sparkW;
  const lastY = sparkYBase - (250-sparkY[sparkY.length-1])*0.9;
  els.push(circle(lastX,lastY,3.5,C.accent));

  // Quick stats row
  const stats = [
    {label:'Savings',value:'$8,420',color:C.accent2},
    {label:'Expenses',value:'$2,310',color:C.danger},
    {label:'Invested',value:'$18,600',color:C.accent},
  ];
  stats.forEach((s,i) => {
    const sx = 16 + i*(W-32)/3;
    const sw2 = (W-32)/3;
    els.push(rect(sx,278,sw2-8,76,i===1?C.surf:C.card,{rx:12,stroke:C.line,sw:1}));
    els.push(text(sx+14,300,s.label,10,C.muted,{fw:500}));
    els.push(text(sx+14,324,s.value,16,s.color,{fw:700}));
    // annotation underline on each stat
    els.push(...annotationUnderline(sx+14,329,70,s.color));
  });

  // Spending this week
  els.push(text(20,376,'This week',13,C.text,{fw:600}));
  els.push(text(W-20,376,'see all →',11,C.accent,{anchor:'end'}));

  const txns = [
    {name:'Whole Foods Market',cat:'Groceries',amt:'-$67.40',icon:'◎'},
    {name:'Netflix',cat:'Entertainment',amt:'-$15.99',icon:'▶'},
    {name:'Salary Deposit',cat:'Income',amt:'+$3,200',icon:'↓',positive:true},
  ];
  txns.forEach((t,i) => {
    const ty = 392 + i*68;
    els.push(rect(16,ty,W-32,60,C.surf,{rx:12,stroke:C.line,sw:1}));
    // icon circle
    els.push(circle(46,ty+30,18,t.positive?C.accent2L:C.accentL));
    els.push(text(46,ty+35,t.icon,12,t.positive?C.accent2:C.accent,{anchor:'middle'}));
    els.push(text(72,ty+24,t.name,13,C.text,{fw:500}));
    els.push(text(72,ty+40,t.cat,11,C.muted,{fw:400}));
    els.push(text(W-32,ty+24,t.amt,14,t.positive?C.accent2:C.text,{anchor:'end',fw:600}));
    // annotation underline on positive amounts
    if (t.positive) {
      const amtW = 70;
      els.push(...annotationUnderline(W-32-amtW,ty+27,amtW,C.accent2));
    }
  });

  els.push(...navBar('home'));
  return { name: 'Dashboard', elements: els };
}

// ── Screen 2: Spending ────────────────────────────────────────────────────────
function screenSpending() {
  const els = [];
  els.push(rect(0,0,W,H,C.bg));
  els.push(...statusBar());

  // Header
  els.push(text(20,76,'Spending',24,C.text,{fw:700,font:'Georgia,serif'}));
  els.push(text(20,100,'April 2026',13,C.muted,{fw:400}));

  // Month toggle tabs
  const tabs = ['Feb','Mar','Apr'];
  tabs.forEach((tab,i) => {
    const tx = 20 + i*68;
    const isActive = i===2;
    els.push(rect(tx,110,56,26,isActive?C.accent:C.card,{rx:13}));
    els.push(text(tx+28,127,tab,11,isActive?C.white:C.textSub,{anchor:'middle',fw:isActive?600:400}));
  });

  // Big donut stand-in — concentric partial arcs via line segments
  const cx = W/2, cy = 238, r = 72;
  // Background ring
  for (let i = 0; i < 60; i++) {
    const a1 = (i/60)*Math.PI*2 - Math.PI/2;
    const a2 = ((i+1)/60)*Math.PI*2 - Math.PI/2;
    els.push(line(
      cx+r*Math.cos(a1), cy+r*Math.sin(a1),
      cx+r*Math.cos(a2), cy+r*Math.sin(a2),
      C.card2,{sw:18,opacity:0.8}
    ));
  }
  // Colored segments — Housing 35%, Food 25%, Transport 18%, Other 22%
  const segments = [
    {pct:0.35,color:C.accent},
    {pct:0.25,color:C.accent2},
    {pct:0.18,color:'#7B9FD4'},
    {pct:0.22,color:C.card2},
  ];
  let startAngle = -Math.PI/2;
  segments.forEach(seg => {
    const endAngle = startAngle + seg.pct * Math.PI * 2;
    const steps = Math.round(seg.pct * 60);
    for (let i = 0; i < steps; i++) {
      const a1 = startAngle + (i/steps)*(endAngle-startAngle);
      const a2 = startAngle + ((i+1)/steps)*(endAngle-startAngle);
      els.push(line(
        cx+r*Math.cos(a1), cy+r*Math.sin(a1),
        cx+r*Math.cos(a2), cy+r*Math.sin(a2),
        seg.color, {sw:18}
      ));
    }
    startAngle = endAngle;
  });
  // Center hole + label
  els.push(circle(cx,cy,46,C.bg));
  els.push(text(cx,cy-8,'$2,310',16,C.text,{anchor:'middle',fw:700}));
  els.push(text(cx,cy+10,'this month',10,C.muted,{anchor:'middle'}));
  // Annotation circle around center
  els.push(...annotationCircle(cx,cy,52,50,C.accent));

  // Category legend
  const cats = [
    {label:'Housing',pct:'35%',color:C.accent,amt:'$808'},
    {label:'Food & Dining',pct:'25%',color:C.accent2,amt:'$578'},
    {label:'Transport',pct:'18%',color:'#7B9FD4',amt:'$416'},
    {label:'Other',pct:'22%',color:C.card2,amt:'$508'},
  ];
  cats.forEach((cat,i) => {
    const cx2 = i < 2 ? 20 : W/2;
    const cy2 = 316 + (i%2)*40;
    els.push(circle(cx2+8,cy2+8,6,cat.color));
    els.push(text(cx2+20,cy2+6,cat.label,12,C.text,{fw:500}));
    els.push(text(cx2+20,cy2+20,cat.amt,11,C.muted));
    els.push(text(cx2+(W/2-44),cy2+6,cat.pct,12,C.textSub,{anchor:'end',fw:600}));
  });

  // Transactions
  els.push(line(20,404,W-20,404,C.line,{sw:1}));
  els.push(text(20,424,'Transactions',13,C.text,{fw:600}));

  const txns2 = [
    {name:'Whole Foods',amt:'-$67.40',cat:'Food',d:'Apr 8'},
    {name:'Uber',amt:'-$12.50',cat:'Transport',d:'Apr 7'},
    {name:'Rent',amt:'-$1,200',cat:'Housing',d:'Apr 1'},
    {name:'Spotify',amt:'-$9.99',cat:'Entertainment',d:'Apr 1'},
    {name:'Gym',amt:'-$45.00',cat:'Health',d:'Mar 31'},
  ];
  txns2.forEach((t,i) => {
    const ty = 436 + i*56;
    els.push(text(20,ty+16,t.name,13,C.text,{fw:500}));
    els.push(text(20,ty+30,t.d+' · '+t.cat,11,C.muted));
    els.push(text(W-20,ty+16,t.amt,13,C.text,{anchor:'end',fw:500}));
    if (i < txns2.length-1) els.push(line(20,ty+46,W-20,ty+46,C.line,{sw:0.7,opacity:0.5}));
  });

  els.push(...navBar('spend'));
  return { name: 'Spending', elements: els };
}

// ── Screen 3: Budget ──────────────────────────────────────────────────────────
function screenBudget() {
  const els = [];
  els.push(rect(0,0,W,H,C.bg));
  els.push(...statusBar());

  els.push(text(20,76,'Budget',24,C.text,{fw:700,font:'Georgia,serif'}));
  els.push(text(20,100,'April — 22 days left',13,C.muted));

  // Overall status card
  els.push(rect(16,112,W-32,88,C.surf,{rx:16,stroke:C.line,sw:1}));
  els.push(text(32,140,'Monthly budget',11,C.muted,{fw:500}));
  els.push(text(32,166,'$3,500',22,C.text,{fw:700}));
  els.push(...annotationUnderline(32,170,80,C.accent));
  els.push(text(140,166,'used $2,310',13,C.textSub,{fw:400}));
  // overall progress bar
  els.push(rect(32,178,W-64,8,C.card2,{rx:4}));
  els.push(rect(32,178,(W-64)*0.66,8,C.accent,{rx:4}));
  els.push(text(W-32,184,'66%',10,C.accent,{anchor:'end',fw:600}));

  // Budget categories
  els.push(text(20,222,'Categories',13,C.text,{fw:600}));

  const budgets = [
    {cat:'Housing',    icon:'⌂', budget:1200, spent:1200, over:false},
    {cat:'Food & Dining',icon:'◎',budget:600, spent:578, over:false},
    {cat:'Transport',  icon:'⬡', budget:300, spent:416, over:true},
    {cat:'Entertainment',icon:'▶',budget:150, spent:97,  over:false},
    {cat:'Shopping',   icon:'◇', budget:200, spent:183, over:false},
    {cat:'Health',     icon:'◉', budget:100, spent:45,  over:false},
  ];
  budgets.forEach((b,i) => {
    const ty = 238 + i*82;
    els.push(rect(16,ty,W-32,74,C.surf,{rx:12,stroke:b.over?C.danger:C.line,sw:b.over?1.5:1}));
    // icon
    els.push(circle(46,ty+24,16,b.over?'#FAE8E6':C.card));
    els.push(text(46,ty+29,b.icon,11,b.over?C.danger:C.accent,{anchor:'middle'}));
    els.push(text(68,ty+20,b.cat,13,C.text,{fw:500}));
    const pct = Math.min(b.spent/b.budget,1);
    const barW = W-32-32-52;
    els.push(rect(68,ty+32,barW,5,C.card2,{rx:3}));
    els.push(rect(68,ty+32,barW*pct,5,b.over?C.danger:C.accent2,{rx:3}));
    els.push(text(W-32,ty+20,`$${b.spent}/${b.budget}`,11,b.over?C.danger:C.muted,{anchor:'end',fw:b.over?600:400}));
    // annotation underline on over-budget
    if (b.over) {
      els.push(...annotationUnderline(68,ty+18,80,C.danger));
      els.push(text(W-32,ty+50,'over budget!',10,C.danger,{anchor:'end',fw:600}));
    } else {
      const remain = b.budget - b.spent;
      els.push(text(W-32,ty+50,`$${remain} left`,10,C.muted,{anchor:'end'}));
    }
  });

  els.push(...navBar('budget'));
  return { name: 'Budget', elements: els };
}

// ── Screen 4: Goals ───────────────────────────────────────────────────────────
function screenGoals() {
  const els = [];
  els.push(rect(0,0,W,H,C.bg));
  els.push(...statusBar());

  els.push(text(20,76,'Goals',24,C.text,{fw:700,font:'Georgia,serif'}));
  els.push(text(20,100,'Track what matters',13,C.muted));

  // Add goal button
  els.push(rect(W-76,64,60,28,C.accent,{rx:14}));
  els.push(text(W-46,81,'+ New',11,C.white,{anchor:'middle',fw:600}));

  // Goal cards
  const goals = [
    {
      name:'Emergency Fund',emoji:'◈',
      target:10000, saved:7200,
      deadline:'Jun 2026', color:C.accent2, colorL:C.accent2L,
    },
    {
      name:'Japan Trip',emoji:'◎',
      target:4500, saved:1800,
      deadline:'Oct 2026', color:'#7B9FD4', colorL:'#DCE8F5',
    },
    {
      name:'New Laptop',emoji:'⬡',
      target:2200, saved:2200,
      deadline:'Reached!', color:C.accent, colorL:C.accentL, done:true,
    },
  ];

  goals.forEach((g,i) => {
    const ty = 118 + i*184;
    const pct = Math.min(g.saved/g.target,1);

    els.push(rect(16,ty,W-32,172,C.surf,{rx:16,stroke:g.done?g.color:C.line,sw:g.done?2:1}));

    // Emoji / icon circle
    els.push(circle(46,ty+36,24,g.colorL));
    els.push(text(46,ty+42,g.emoji,16,g.color,{anchor:'middle'}));

    // Name + deadline
    els.push(text(78,ty+28,g.name,16,C.text,{fw:700}));
    els.push(text(78,ty+46,g.deadline,11,g.done?g.color:C.muted,{fw:g.done?600:400}));

    if (g.done) {
      // Annotation circle around "Reached!"
      els.push(...annotationCircle(128,ty+46,38,12,g.color));
    }

    // Big annotation-style amount
    els.push(text(32,ty+88,`$${g.saved.toLocaleString()}`,28,C.text,{fw:700,font:'Georgia,serif'}));
    els.push(...annotationUnderline(32,ty+93,pct>=1?88:70,g.color));
    els.push(text(32+90,ty+88,` / $${g.target.toLocaleString()}`,15,C.muted,{fw:400}));

    // Progress bar
    const barW = W-32-32;
    els.push(rect(32,ty+108,barW,10,C.card2,{rx:5}));
    els.push(rect(32,ty+108,barW*pct,10,g.color,{rx:5}));

    // Percentage + monthly savings note
    els.push(text(32,ty+134,`${Math.round(pct*100)}% funded`,12,g.color,{fw:600}));
    if (!g.done) {
      els.push(text(W-32,ty+134,`~$${Math.round((g.target-g.saved)/6)}/mo`,12,C.muted,{anchor:'end'}));
    }
  });

  els.push(...navBar('goals'));
  return { name: 'Goals', elements: els };
}

// ── Screen 5: Insights ────────────────────────────────────────────────────────
function screenInsights() {
  const els = [];
  els.push(rect(0,0,W,H,C.bg));
  els.push(...statusBar());

  els.push(text(20,76,'Insights',24,C.text,{fw:700,font:'Georgia,serif'}));
  els.push(text(20,100,'AI-powered observations',13,C.muted));

  // Insight cards — annotation-style editorial feel
  const insights = [
    {
      tag:'PATTERN',tagColor:C.accent,
      headline:'Coffee spend up 34%',
      body:'You\'ve spent $187 on coffee shops this month — $47 more than your 3-month average.',
      annotate:true,
    },
    {
      tag:'WIN',tagColor:C.accent2,
      headline:'Groceries under budget',
      body:'$578 vs $600 budget. Consistency here saved you $264 over 6 months.',
    },
    {
      tag:'TIP',tagColor:'#7B9FD4',
      headline:'Cancel unused subscriptions',
      body:'3 subscriptions haven\'t been used in 60+ days, totalling $43/month.',
    },
    {
      tag:'FORECAST',tagColor:'#B07FC5',
      headline:'End-of-month projection',
      body:'At current pace you\'ll have $890 left after bills — $120 above April target.',
    },
  ];

  insights.forEach((ins,i) => {
    const ty = 116 + i*158;
    const cardH = 140;
    els.push(rect(16,ty,W-32,cardH,C.surf,{rx:14,stroke:C.line,sw:1}));

    // Tag chip
    const tagW = ins.tag.length*7+16;
    els.push(rect(32,ty+18,tagW,20,ins.tagColor,{rx:10,opacity:0.15}));
    els.push(text(32+tagW/2,ty+32,ins.tag,9,ins.tagColor,{anchor:'middle',fw:700,ls:0.5}));

    // Headline
    els.push(text(32,ty+54,ins.headline,16,C.text,{fw:700}));
    if (ins.annotate) {
      els.push(...annotationUnderline(32,ty+58,140,ins.tagColor));
    }

    // Body text (wrapped to ~45 chars)
    const words = ins.body.split(' ');
    let line1 = '', line2 = '';
    words.forEach(w => {
      if ((line1+w).length < 44) line1 += (line1?` `:'')+w;
      else line2 += (line2?` `:'')+w;
    });
    els.push(text(32,ty+76,line1,12,C.textSub,{fw:400}));
    if (line2) els.push(text(32,ty+92,line2,12,C.textSub,{fw:400}));

    // Margin annotation mark (decorative)
    els.push(text(W-36,ty+54,'↗',14,ins.tagColor,{anchor:'end',opacity:0.6}));
  });

  els.push(...navBar('home'));
  return { name: 'Insights', elements: els };
}

// ── Screen 6: Profile ─────────────────────────────────────────────────────────
function screenProfile() {
  const els = [];
  els.push(rect(0,0,W,H,C.bg));
  els.push(...statusBar());

  // Header card
  els.push(rect(0,44,W,160,C.surf,{stroke:C.line,sw:0}));
  els.push(line(0,204,W,204,C.line,{sw:1}));

  // Avatar
  els.push(circle(W/2,106,44,C.accentL));
  els.push(text(W/2,112,'S',24,C.accent,{anchor:'middle',fw:700,font:'Georgia,serif'}));

  // Name + email with annotation underline
  els.push(text(W/2,164,'Sarah Chen',18,C.text,{anchor:'middle',fw:700}));
  els.push(...annotationUnderline(W/2-50,168,100,C.accent));
  els.push(text(W/2,184,'sarah@vell.app',12,C.muted,{anchor:'middle'}));

  // Stats ribbon
  const stats2 = [
    {label:'Member since',val:'Jan 2024'},
    {label:'Net worth',val:'$42.8k'},
    {label:'Goals',val:'3 active'},
  ];
  stats2.forEach((s,i) => {
    const sx = 20 + i*(W-40)/3;
    els.push(text(sx+(W-40)/6,230,s.val,14,C.text,{anchor:'middle',fw:700}));
    els.push(text(sx+(W-40)/6,248,s.label,10,C.muted,{anchor:'middle'}));
    if (i < 2) els.push(line(sx+(W-40)/3,220,sx+(W-40)/3,256,C.line,{sw:1}));
  });

  // Settings sections
  const sections = [
    {title:'Account', items:['Personal details','Linked accounts','Notifications']},
    {title:'Finance', items:['Currency & region','Budget periods','Data export']},
    {title:'App', items:['Appearance','Privacy','Help & support']},
  ];
  let sy = 272;
  sections.forEach(sec => {
    els.push(text(20,sy,sec.title,11,C.muted,{fw:600,ls:0.5}));
    sy += 18;
    els.push(rect(16,sy,W-32,sec.items.length*48+4,C.surf,{rx:12,stroke:C.line,sw:1}));
    sec.items.forEach((item,i) => {
      els.push(text(32,sy+22+i*48,item,14,C.text,{fw:400}));
      els.push(text(W-32,sy+22+i*48,'›',16,C.muted,{anchor:'end'}));
      if (i < sec.items.length-1) {
        els.push(line(32,sy+4+i*48+44,W-32,sy+4+i*48+44,C.line,{sw:0.7,opacity:0.5}));
      }
    });
    sy += sec.items.length*48+4+16;
  });

  // Sign out
  els.push(text(W/2,sy+20,'Sign out',14,C.danger,{anchor:'middle',fw:500}));

  els.push(...navBar('you'));
  return { name: 'Profile', elements: els };
}

// ── Assemble ──────────────────────────────────────────────────────────────────
const screens = [
  screenDashboard(),
  screenSpending(),
  screenBudget(),
  screenGoals(),
  screenInsights(),
  screenProfile(),
];

let totalElements = 0;
const penScreens = screens.map(s => {
  totalElements += s.elements.length;
  return { name: s.name, svg: renderSVG(s.elements), elements: s.elements };
});

const pen = {
  version: '2.8',
  metadata: {
    name:      'VELL',
    author:    'RAM',
    date:      new Date().toISOString().split('T')[0],
    theme:     'light',
    heartbeat: 'ongoing',
    elements:  totalElements,
    palette: {
      bg:      C.bg,
      surf:    C.surf,
      text:    C.text,
      accent:  C.accent,
      accent2: C.accent2,
      muted:   C.muted,
    },
  },
  screens: penScreens,
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`VELL: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
