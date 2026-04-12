'use strict';
/**
 * SILO — Pantry intelligence & meal planning
 * Heartbeat design — LIGHT theme
 * Inspired by: OWO's per-word pill typography (lapa.ninja) + Overlay's warm editorial light palette (lapa.ninja)
 * The "word-as-object" pattern applied to ingredient tags, dietary labels & cuisine categories
 */
const fs = require('fs');
const path = require('path');

const SLUG = 'silo';
const W = 390, H = 844;

// ─── Palette ────────────────────────────────────────────────────────────────
const P = {
  bg:      '#FAF6F0',   // warm cream
  surface: '#FFFFFF',
  card:    '#F5EDE0',   // toasted card
  border:  '#E8DDD0',
  text:    '#1A1410',   // deep warm black
  text2:   '#6B5C4E',   // muted brown
  text3:   '#A0907E',   // placeholder
  acc:     '#C4622A',   // terracotta
  acc2:    '#4A7A57',   // forest green
  acc3:    '#2E6B9A',   // deep sky
  acc4:    '#9B4F9E',   // plum
  acc5:    '#B89B2A',   // golden
  nav:     '#FFFFFF',
  navBrd:  '#E8DDD0',
};

// Pill background colors (OWO-inspired word-as-object treatment)
const PILL = {
  grain:   '#FDE8C8',  // warm amber fill
  veggie:  '#D4ECD8',  // sage green fill
  dairy:   '#D0E4F5',  // sky blue fill
  protein: '#F5D0D0',  // blush pink fill
  pantry:  '#EDE0F5',  // lavender fill
  fruit:   '#FDDDD0',  // peach fill
  spice:   '#FAF0C8',  // pale yellow fill
};
const PILLTEXT = {
  grain:   '#8B4A10',
  veggie:  '#1E5C2A',
  dairy:   '#1A4E7A',
  protein: '#7A1E1E',
  pantry:  '#4E1E7A',
  fruit:   '#8B3A18',
  spice:   '#7A6010',
};

// ─── Primitives ──────────────────────────────────────────────────────────────
function rect(x,y,w,h,fill,opts={}) {
  return { type:'rect', x,y,width:w,height:h, fill, rx:opts.rx||0,
    opacity:opts.opacity||1, stroke:opts.stroke||'none', strokeWidth:opts.sw||0 };
}
function text(x,y,content,size,fill,opts={}) {
  return { type:'text', x,y, content, fontSize:size, fill, fontWeight:opts.fw||400,
    fontFamily:opts.font||'Inter, sans-serif', textAnchor:opts.anchor||'start',
    letterSpacing:opts.ls||0, opacity:opts.opacity||1 };
}
function circle(cx,cy,r,fill,opts={}) {
  return { type:'circle', cx,cy,r, fill, opacity:opts.opacity||1,
    stroke:opts.stroke||'none', strokeWidth:opts.sw||0 };
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  return { type:'line', x1,y1,x2,y2, stroke, strokeWidth:opts.sw||1, opacity:opts.opacity||1 };
}

// ─── Helper: pill tag (OWO-style word-as-object) ─────────────────────────────
// Returns [bgRect, textEl] for a pill
function pill(x, y, label, pillFill, textFill, opts={}) {
  const padX = opts.padX || 10;
  const padY = opts.padY || 5;
  const size = opts.size || 11;
  const rx   = opts.rx || 12;
  // Approx width: ~6.5px per char + 2*padX
  const w = Math.max(label.length * 6.5 + padX * 2, 40);
  const h = size + padY * 2;
  return [
    rect(x, y, w, h, pillFill, { rx }),
    text(x + padX, y + padY + size - 2, label, size, textFill, { fw: 600, font: 'Inter, sans-serif', anchor: 'start' }),
  ];
}

// ─── Helper: status bar ───────────────────────────────────────────────────────
function statusBar() {
  return [
    rect(0,0,W,44,P.bg),
    text(20,28,'9:41',13,P.text,{fw:600}),
    text(W-20,28,'●●●',11,P.text,{anchor:'end'}),
  ];
}

// ─── Helper: bottom nav ───────────────────────────────────────────────────────
function bottomNav(active) {
  const tabs = [
    { id:'home',  label:'Home',    icon:'⌂' },
    { id:'pantry',label:'Pantry',  icon:'□' },
    { id:'plan',  label:'Meals',   icon:'◫' },
    { id:'shop',  label:'Shop',    icon:'↙' },
    { id:'more',  label:'Explore', icon:'◈' },
  ];
  const els = [
    rect(0,H-80,W,80,P.nav),
    line(0,H-80,W,H-80,P.navBrd,{sw:1}),
  ];
  tabs.forEach((tab,i) => {
    const x = (W/tabs.length)*i + (W/tabs.length)/2;
    const isActive = tab.id === active;
    const col = isActive ? P.acc : P.text3;
    els.push(
      text(x, H-54, tab.icon, 18, col, {anchor:'middle', fw: isActive?700:400}),
      text(x, H-36, tab.label, 10, col, {anchor:'middle', fw: isActive?600:400}),
    );
    if (isActive) {
      els.push(rect(x-12, H-78, 24, 3, P.acc, {rx:2}));
    }
  });
  return els;
}

// ─── Helper: section header ───────────────────────────────────────────────────
function sectionHeader(x, y, title, sub) {
  const els = [
    text(x, y, title, 14, P.text, {fw:700}),
  ];
  if (sub) els.push(text(W-x, y, sub, 12, P.acc, {anchor:'end', fw:600}));
  return els;
}

// ─── SCREEN 1: Home / Dashboard ───────────────────────────────────────────────
function screenHome() {
  const els = [];
  // BG
  els.push(rect(0,0,W,H,P.bg));
  // Status bar
  els.push(...statusBar());

  // Greeting header area
  els.push(rect(0,44,W,120,'#F5EDE0'));
  // Small greeting
  els.push(text(20,68,'Good morning, Lena', 12, P.text2, {fw:500}));
  // Big editorial serif headline with word-pill accent
  els.push(text(20,96, 'Your kitchen,', 26, P.text, {fw:700, font:'Georgia, serif'}));
  els.push(text(20,126,'organised.', 26, P.acc, {fw:700, font:'Georgia, serif'}));

  // Avatar + small stats row
  els.push(circle(W-44, 88, 24, P.border));
  els.push(text(W-44, 93, '🌿', 14, P.text, {anchor:'middle'}));

  // Quick stats row
  els.push(rect(0,164,W,64,P.surface));
  const stats = [
    {label:'In Pantry', val:'47', color:P.acc},
    {label:'Expiring', val:'3',  color:'#C44040'},
    {label:'Planned',  val:'5',  color:P.acc2},
    {label:'Shopping', val:'12', color:P.acc3},
  ];
  stats.forEach((s,i) => {
    const x = 20 + i*90;
    els.push(text(x, 185, s.val, 20, s.color, {fw:700}));
    els.push(text(x, 200, s.label, 10, P.text2));
    if (i < 3) els.push(line(x+72,174,x+72,220,P.border,{sw:1}));
  });
  els.push(line(0,228,W,228,P.border,{sw:1}));

  // OWO-style pill row: "What's in your pantry today?"
  els.push(text(20, 252, 'Browse by category', 13, P.text, {fw:700}));
  const cats = [
    {label:'Grains',    fill:PILL.grain,   tf:PILLTEXT.grain},
    {label:'Veggies',   fill:PILL.veggie,  tf:PILLTEXT.veggie},
    {label:'Dairy',     fill:PILL.dairy,   tf:PILLTEXT.dairy},
    {label:'Protein',   fill:PILL.protein, tf:PILLTEXT.protein},
    {label:'Pantry',    fill:PILL.pantry,  tf:PILLTEXT.pantry},
    {label:'Fruit',     fill:PILL.fruit,   tf:PILLTEXT.fruit},
  ];
  let cx = 20;
  cats.forEach(c => {
    const [bg, tx] = pill(cx, 262, c.label, c.fill, c.tf, {rx:14, size:12, padX:12, padY:6});
    els.push(bg, tx);
    cx += bg.width + 8;
  });

  // Expiring soon alert card
  els.push(rect(20,302,350,70,'#FFF0E8',{rx:12, stroke:P.acc, sw:1}));
  els.push(text(36,326,'⚠', 14, P.acc));
  els.push(text(56,326,'Expiring soon', 13, P.text, {fw:700}));
  els.push(text(W-36,326,'View all', 11, P.acc, {anchor:'end', fw:600}));
  const expItems = ['Eggs · 2 days','Yoghurt · 3 days','Cheddar · 4 days'];
  expItems.forEach((item,i) => {
    els.push(text(56, 344+i*16, item, 11, P.text2));
  });

  // Meal suggestion card — Editorial serif
  els.push(...sectionHeader(20, 392, 'Suggested tonight', 'See all'));
  els.push(rect(20,404,350,120,P.surface,{rx:14, stroke:P.border, sw:1}));
  // Gradient-ish accent bar
  els.push(rect(20,404,6,120,P.acc,{rx:3}));
  els.push(text(38,426,'Pasta Primavera', 18, P.text, {fw:700, font:'Georgia, serif'}));
  els.push(text(38,446,'with garden herbs', 14, P.text2, {fw:400, font:'Georgia, serif'}));
  // Ingredient pills inline — OWO treatment
  const mealPills = [
    {label:'Pasta',    fill:PILL.grain,  tf:PILLTEXT.grain},
    {label:'Tomato',   fill:PILL.veggie, tf:PILLTEXT.veggie},
    {label:'Basil',    fill:PILL.spice,  tf:PILLTEXT.spice},
    {label:'Cream',    fill:PILL.dairy,  tf:PILLTEXT.dairy},
  ];
  let px2 = 38;
  mealPills.forEach(p2 => {
    const [bg2, tx2] = pill(px2, 460, p2.label, p2.fill, p2.tf, {rx:12, size:11, padX:9, padY:4});
    els.push(bg2, tx2);
    px2 += bg2.width + 6;
  });
  els.push(text(38, 500, '25 min  ·  2 servings  ·  480 kcal', 11, P.text3));
  // CTA button
  els.push(rect(310,462,46,26,P.acc,{rx:13}));
  els.push(text(333,480,'Cook', 11,'#FFFFFF',{anchor:'middle',fw:600}));

  // Recent activity
  els.push(...sectionHeader(20, 542, 'Recent activity', ''));
  const activities = [
    {icon:'↑', col:P.acc2, msg:'Added 6 items from Whole Foods',    time:'2h ago'},
    {icon:'✓', col:P.acc,  msg:'Cooked Shakshuka · used 5 items',   time:'Yesterday'},
    {icon:'↓', col:P.acc3, msg:'3 items expired — removed',         time:'2 days ago'},
  ];
  activities.forEach((a,i) => {
    const ay = 558+i*52;
    els.push(rect(20,ay,350,44,P.surface,{rx:10, stroke:P.border, sw:1}));
    els.push(circle(42,ay+22,12,a.col,{opacity:0.15}));
    els.push(text(42,ay+26,a.icon,11,a.col,{anchor:'middle',fw:700}));
    els.push(text(60,ay+17,a.msg,12,P.text,{fw:500}));
    els.push(text(60,ay+32,a.time,10,P.text3));
  });

  // Bottom nav
  els.push(...bottomNav('home'));
  return { name:'Home', elements:els };
}

// ─── SCREEN 2: Pantry ─────────────────────────────────────────────────────────
function screenPantry() {
  const els = [];
  els.push(rect(0,0,W,H,P.bg));
  els.push(...statusBar());

  // Header
  els.push(rect(0,44,W,56,P.surface));
  els.push(text(20,80,'Pantry', 22, P.text, {fw:700, font:'Georgia, serif'}));
  els.push(text(W-20,80,'47 items', 12, P.text2, {anchor:'end'}));
  // Search bar
  els.push(rect(20,110,310,38,P.card,{rx:12}));
  els.push(text(44,133,'🔍', 13, P.text3));
  els.push(text(62,133,'Search pantry…', 13, P.text3));
  // Add button
  els.push(rect(340,110,32,38,P.acc,{rx:12}));
  els.push(text(356,133,'+', 18,'#FFFFFF',{anchor:'middle',fw:400}));

  // Filter pills — OWO row
  const filters = [
    {label:'All (47)',   fill:P.acc,  tf:'#FFFFFF', active:true},
    {label:'Veggies',   fill:PILL.veggie, tf:PILLTEXT.veggie},
    {label:'Dairy',     fill:PILL.dairy,  tf:PILLTEXT.dairy},
    {label:'Grains',    fill:PILL.grain,  tf:PILLTEXT.grain},
    {label:'Protein',   fill:PILL.protein,tf:PILLTEXT.protein},
  ];
  let fx = 20;
  filters.forEach(f => {
    const fill = f.fill;
    const [bg,tx] = pill(fx, 158, f.label, fill, f.tf, {rx:16, size:12, padX:12, padY:7});
    els.push(bg,tx);
    fx += bg.width + 8;
  });

  // Section: Expiring soon
  els.push(...sectionHeader(20, 198, '⚠ Expiring soon', '3 items'));
  const expiring = [
    {name:'Free-range Eggs',  qty:'6 left',  days:'2 days', fill:PILL.protein, tf:PILLTEXT.protein, type:'Protein'},
    {name:'Greek Yoghurt',    qty:'400g',    days:'3 days', fill:PILL.dairy,   tf:PILLTEXT.dairy,   type:'Dairy'},
    {name:'Mature Cheddar',   qty:'250g',    days:'4 days', fill:PILL.dairy,   tf:PILLTEXT.dairy,   type:'Dairy'},
  ];
  expiring.forEach((item,i) => {
    const iy = 212+i*62;
    els.push(rect(20,iy,350,54,P.surface,{rx:12, stroke:'#FDDDD0', sw:1}));
    // Category pill
    const [pbg,ptx] = pill(32,iy+8, item.type, item.fill, item.tf, {rx:10, size:10, padX:8, padY:3});
    els.push(pbg,ptx);
    els.push(text(32, iy+36, item.name, 13, P.text, {fw:600}));
    els.push(text(32, iy+50, item.qty, 11, P.text3));
    els.push(rect(W-72,iy+18,52,22,'#FDDDD0',{rx:11}));
    els.push(text(W-46,iy+33, item.days, 11,'#8B3A18',{anchor:'middle',fw:600}));
  });

  // All pantry items (condensed list)
  els.push(...sectionHeader(20, 404, 'All items', 'Sort ↕'));
  const pantryItems = [
    {name:'Sourdough Bread',  cat:'Grains',    fill:PILL.grain,   tf:PILLTEXT.grain},
    {name:'Cherry Tomatoes',  cat:'Veggies',   fill:PILL.veggie,  tf:PILLTEXT.veggie},
    {name:'Arborio Rice',     cat:'Grains',    fill:PILL.grain,   tf:PILLTEXT.grain},
    {name:'Olive Oil',        cat:'Pantry',    fill:PILL.pantry,  tf:PILLTEXT.pantry},
    {name:'Parmesan',         cat:'Dairy',     fill:PILL.dairy,   tf:PILLTEXT.dairy},
  ];
  pantryItems.forEach((item,i) => {
    const iy = 420+i*52;
    els.push(rect(20,iy,350,44,P.surface,{rx:10, stroke:P.border, sw:1}));
    // Word-pill category tag
    const [pbg,ptx] = pill(32,iy+8, item.cat, item.fill, item.tf, {rx:9, size:10, padX:7, padY:3});
    els.push(pbg,ptx);
    els.push(text(32, iy+33, item.name, 13, P.text, {fw:500}));
    els.push(circle(W-36, iy+22, 8, P.border));
    els.push(text(W-36, iy+26, '›', 11, P.text3, {anchor:'middle'}));
  });

  els.push(...bottomNav('pantry'));
  return { name:'Pantry', elements:els };
}

// ─── SCREEN 3: Meal Planner ───────────────────────────────────────────────────
function screenMealPlan() {
  const els = [];
  els.push(rect(0,0,W,H,P.bg));
  els.push(...statusBar());

  // Header
  els.push(rect(0,44,W,56,P.surface));
  els.push(text(20,80,'Meal Plan', 22, P.text, {fw:700, font:'Georgia, serif'}));
  els.push(text(W-20,80,'April 2026', 12, P.acc, {anchor:'end', fw:600}));

  // Week strip
  els.push(rect(0,100,W,72,P.surface, {stroke:P.border, sw:0}));
  els.push(line(0,100,W,100,P.border,{sw:1}));
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const dates = [7,8,9,10,11,12,13];
  days.forEach((d,i) => {
    const dx = 20+i*52;
    const isToday = d==='Fri';
    if(isToday) {
      els.push(rect(dx-2,106,44,58,P.acc,{rx:12}));
    }
    els.push(text(dx+20,124, d, 10, isToday?'#FFFFFF':P.text3, {anchor:'middle',fw:isToday?700:400}));
    els.push(text(dx+20,146, String(dates[i]), 14, isToday?'#FFFFFF':P.text, {anchor:'middle',fw:isToday?700:500}));
    if(!isToday) {
      // Meal dot indicator
      const hasMeal = [0,2,3,4,5].includes(i);
      if(hasMeal) els.push(circle(dx+20,158,3,P.acc));
    }
  });

  // Today's meals
  els.push(text(20,196,'Friday 11 April', 14, P.text, {fw:700}));
  els.push(text(20,214,'3 meals planned', 11, P.text3));

  const meals = [
    {
      time:'Breakfast',
      name:'Avocado Toast',
      sub:'with poached eggs',
      kcal:'380 kcal',
      pills:[
        {label:'Bread',   fill:PILL.grain,  tf:PILLTEXT.grain},
        {label:'Avocado', fill:PILL.veggie, tf:PILLTEXT.veggie},
        {label:'Eggs',    fill:PILL.protein,tf:PILLTEXT.protein},
      ],
      ready:true,
    },
    {
      time:'Lunch',
      name:'Greek Salad',
      sub:'with feta & olives',
      kcal:'290 kcal',
      pills:[
        {label:'Tomato',  fill:PILL.veggie, tf:PILLTEXT.veggie},
        {label:'Feta',    fill:PILL.dairy,  tf:PILLTEXT.dairy},
        {label:'Olive',   fill:PILL.pantry, tf:PILLTEXT.pantry},
      ],
      ready:true,
    },
    {
      time:'Dinner',
      name:'Pasta Primavera',
      sub:'with garden herbs & cream',
      kcal:'480 kcal',
      pills:[
        {label:'Pasta',   fill:PILL.grain,  tf:PILLTEXT.grain},
        {label:'Cream',   fill:PILL.dairy,  tf:PILLTEXT.dairy},
        {label:'Basil',   fill:PILL.spice,  tf:PILLTEXT.spice},
      ],
      ready:false,
    },
  ];

  meals.forEach((meal,i) => {
    const my = 230+i*170;
    els.push(text(20,my,meal.time, 11, P.text3, {fw:600}));
    els.push(rect(20,my+8,350,150,P.surface,{rx:14, stroke:P.border, sw:1}));
    // Colored left border
    const lColors=[P.acc5,P.acc2,P.acc];
    els.push(rect(20,my+8,6,150,lColors[i],{rx:3}));
    // Meal name — editorial serif
    els.push(text(36,my+34,meal.name,16,P.text,{fw:700,font:'Georgia, serif'}));
    els.push(text(36,my+52,meal.sub,12,P.text2,{fw:400,font:'Georgia, serif'}));
    // Ingredient pills
    let ppx=36;
    meal.pills.forEach(p3 => {
      const [pbg,ptx] = pill(ppx,my+62,p3.label,p3.fill,p3.tf,{rx:11,size:11,padX:9,padY:4});
      els.push(pbg,ptx);
      ppx+=pbg.width+6;
    });
    els.push(text(36,my+102,meal.kcal,11,P.text3));
    // Status / action
    if(meal.ready) {
      els.push(rect(W-80,my+22,60,24,P.acc2+22,{rx:12}));
      els.push(text(W-50,my+38,'✓ Ready',11,P.acc2,{anchor:'middle',fw:600}));
    } else {
      els.push(rect(W-80,my+22,60,24,P.card,{rx:12, stroke:P.acc, sw:1}));
      els.push(text(W-50,my+38,'Shop →',11,P.acc,{anchor:'middle',fw:600}));
    }
    // Calorie bar
    const pct=[0.62,0.45,0.78][i];
    els.push(rect(36,my+116,300,4,P.card,{rx:2}));
    els.push(rect(36,my+116,300*pct,4,lColors[i],{rx:2}));
    els.push(text(36,my+138,'Cook · 25 min',11,P.text3));
  });

  els.push(...bottomNav('plan'));
  return { name:'Meal Plan', elements:els };
}

// ─── SCREEN 4: Recipe Detail ───────────────────────────────────────────────────
function screenRecipe() {
  const els = [];
  els.push(rect(0,0,W,H,P.bg));
  els.push(...statusBar());

  // Hero area with warm gradient
  els.push(rect(0,44,W,200,P.card));
  // Subtle diagonal lines for texture
  for(let i=0;i<8;i++) {
    els.push(line(i*55-20,44,i*55+180,244,'#E8DDD0',{sw:1,opacity:0.5}));
  }
  // Large food emoji placeholder
  els.push(text(W/2,154,'🍝',52,P.text,{anchor:'middle'}));
  // Back button
  els.push(circle(32,66,16,P.surface,{opacity:0.9}));
  els.push(text(32,71,'←',14,P.text,{anchor:'middle'}));
  // Bookmark
  els.push(circle(W-32,66,16,P.surface,{opacity:0.9}));
  els.push(text(W-32,71,'♡',13,P.acc,{anchor:'middle'}));

  // Recipe info card
  els.push(rect(0,230,W,H-230,P.surface));
  // Editorial serif recipe name
  els.push(text(20,268,'Pasta Primavera', 24, P.text, {fw:700, font:'Georgia, serif'}));
  els.push(text(20,290,'with garden herbs & cream', 14, P.text2, {fw:400, font:'Georgia, serif'}));

  // Meta row
  const meta=[{icon:'⏱',val:'25 min'},{icon:'👤',val:'2 servings'},{icon:'🔥',val:'480 kcal'},{icon:'★',val:'4.8'}];
  meta.forEach((m,i)=>{
    const mx=20+i*90;
    els.push(text(mx,316,m.icon,13,P.text2));
    els.push(text(mx+18,316,m.val,12,P.text2,{fw:500}));
  });
  els.push(line(20,328,W-20,328,P.border,{sw:1}));

  // Cuisine + diet pills — OWO style, colorful row
  els.push(text(20,352,'Tags', 12, P.text3, {fw:600}));
  const recipeTags=[
    {label:'Italian',   fill:'#FDE8C8', tf:'#8B4A10'},
    {label:'Vegetarian',fill:'#D4ECD8', tf:'#1E5C2A'},
    {label:'Quick',     fill:'#D0E4F5', tf:'#1A4E7A'},
    {label:'Spring',    fill:'#FDDDD0', tf:'#8B3A18'},
    {label:'Low Cal',   fill:'#EDE0F5', tf:'#4E1E7A'},
  ];
  let rtx=20;
  recipeTags.forEach(t=>{
    const [tbg,ttx]=pill(rtx,362,t.label,t.fill,t.tf,{rx:14,size:12,padX:11,padY:5});
    els.push(tbg,ttx); rtx+=tbg.width+7;
  });

  // Ingredients
  els.push(text(20,406,'Ingredients', 14, P.text, {fw:700}));
  const ingreds=[
    {name:'Rigatoni pasta',   qty:'200g',  cat:'Grains', fill:PILL.grain, tf:PILLTEXT.grain},
    {name:'Double cream',     qty:'150ml', cat:'Dairy',  fill:PILL.dairy, tf:PILLTEXT.dairy},
    {name:'Cherry tomatoes',  qty:'150g',  cat:'Veggies',fill:PILL.veggie,tf:PILLTEXT.veggie},
    {name:'Fresh basil',      qty:'handful',cat:'Spice', fill:PILL.spice, tf:PILLTEXT.spice},
    {name:'Parmesan',         qty:'40g',   cat:'Dairy',  fill:PILL.dairy, tf:PILLTEXT.dairy},
    {name:'Garlic cloves',    qty:'2',     cat:'Veggies',fill:PILL.veggie,tf:PILLTEXT.veggie},
  ];
  ingreds.forEach((ing,i)=>{
    const iy=424+i*44;
    // Row
    els.push(line(20,iy,W-20,iy,P.border,{sw:1}));
    const [ibg,itx]=pill(20,iy+8,ing.cat,ing.fill,ing.tf,{rx:9,size:10,padX:7,padY:3});
    els.push(ibg,itx);
    els.push(text(20+ibg.width+10,iy+22,ing.name,13,P.text,{fw:500}));
    els.push(text(W-20,iy+22,ing.qty,12,P.text3,{anchor:'end'}));
    // In pantry check
    const inPantry=[true,true,true,false,true,true][i];
    els.push(circle(W-50,iy+22,8,inPantry?P.acc2:'transparent',{stroke:inPantry?P.acc2:P.text3,sw:1}));
    if(inPantry) els.push(text(W-50,iy+26,'✓',10,'#FFFFFF',{anchor:'middle',fw:700}));
  });

  // CTA button
  els.push(rect(20,H-104,350,44,P.acc,{rx:14}));
  els.push(text(W/2,H-77,'Start Cooking →',14,'#FFFFFF',{anchor:'middle',fw:700}));

  els.push(...bottomNav('plan'));
  return { name:'Recipe', elements:els };
}

// ─── SCREEN 5: Shopping List ───────────────────────────────────────────────────
function screenShopping() {
  const els = [];
  els.push(rect(0,0,W,H,P.bg));
  els.push(...statusBar());

  // Header
  els.push(rect(0,44,W,56,P.surface));
  els.push(text(20,80,'Shopping', 22, P.text, {fw:700, font:'Georgia, serif'}));
  els.push(text(W-20,80,'12 items', 12, P.acc, {anchor:'end', fw:600}));

  // Store picker pills
  els.push(text(20,116,'Shop at', 12, P.text3, {fw:600}));
  const stores=[
    {label:'Whole Foods',  fill:P.acc,  tf:'#FFFFFF', active:true},
    {label:'Trader Joe\'s',fill:P.card, tf:P.text2},
    {label:'Local Market', fill:P.card, tf:P.text2},
  ];
  let sx=20;
  stores.forEach(s=>{
    const [sbg,stx]=pill(sx,126,s.label,s.fill,s.tf,{rx:16,size:12,padX:14,padY:7});
    els.push(sbg,stx); sx+=sbg.width+8;
  });

  // Sections
  const sections=[
    {
      name:'Produce',
      color:PILLTEXT.veggie,
      pillFill:PILL.veggie,
      icon:'🥬',
      items:[
        {name:'Fresh basil',    note:'for Pasta Primavera',    checked:false},
        {name:'Spinach leaves', note:'weekly staple',          checked:false},
        {name:'Lemon × 2',     note:'low stock',              checked:false},
      ]
    },
    {
      name:'Bakery',
      color:PILLTEXT.grain,
      pillFill:PILL.grain,
      icon:'🍞',
      items:[
        {name:'Sourdough loaf',    note:'expiring today',      checked:true},
        {name:'Rye crackers',      note:'snacks',              checked:false},
      ]
    },
    {
      name:'Dairy & Eggs',
      color:PILLTEXT.dairy,
      pillFill:PILL.dairy,
      icon:'🥛',
      items:[
        {name:'Oat milk 1L',  note:'running low',            checked:false},
        {name:'Butter 250g',  note:'weekly staple',          checked:true},
        {name:'Mozzarella',   note:'pizza night',            checked:false},
      ]
    },
  ];

  let sy2=162;
  sections.forEach((sec)=>{
    // Section header pill
    const [shbg,shtx]=pill(20,sy2,sec.name,sec.pillFill,sec.color,{rx:12,size:12,padX:12,padY:5,fw:700});
    els.push(shbg,shtx);
    els.push(text(20+shbg.width+8,sy2+14,sec.icon,14,P.text));
    sy2+=30;

    sec.items.forEach(item=>{
      els.push(rect(20,sy2,350,48,item.checked?P.card:P.surface,{rx:10,stroke:P.border,sw:1}));
      // Checkbox
      els.push(rect(32,sy2+14,20,20,item.checked?P.acc2:'transparent',{rx:5,stroke:item.checked?P.acc2:P.border,sw:2}));
      if(item.checked) els.push(text(42,sy2+27,'✓',11,'#FFFFFF',{anchor:'middle',fw:700}));
      els.push(text(62,sy2+23,item.name,13,item.checked?P.text3:P.text,{fw:item.checked?400:500}));
      els.push(text(62,sy2+36,item.note,10,P.text3));
      sy2+=56;
    });
    sy2+=8;
  });

  // Bottom total
  els.push(rect(20,H-104,350,44,P.acc,{rx:14}));
  els.push(text(W/2,H-77,'Checkout · 12 items',14,'#FFFFFF',{anchor:'middle',fw:700}));

  els.push(...bottomNav('shop'));
  return { name:'Shopping', elements:els };
}

// ─── SCREEN 6: Discover / Explore ────────────────────────────────────────────
function screenDiscover() {
  const els = [];
  els.push(rect(0,0,W,H,P.bg));
  els.push(...statusBar());

  // Header
  els.push(rect(0,44,W,56,P.surface));
  els.push(text(20,80,'Explore', 22, P.text, {fw:700, font:'Georgia, serif'}));
  // Search
  els.push(rect(20,108,310,36,P.card,{rx:12}));
  els.push(text(44,130,'🔍', 12, P.text3));
  els.push(text(62,130,'Search recipes…', 12, P.text3));

  // OWO cuisine pill row — full colorful treatment
  els.push(text(20,164,'Cuisine', 13, P.text, {fw:700}));
  const cuisines=[
    {label:'Italian',    fill:'#FDE8C8', tf:'#8B4A10'},
    {label:'Japanese',   fill:'#F5D0D0', tf:'#7A1E1E'},
    {label:'Mexican',    fill:'#D4ECD8', tf:'#1E5C2A'},
    {label:'Indian',     fill:'#FAF0C8', tf:'#7A6010'},
    {label:'French',     fill:'#EDE0F5', tf:'#4E1E7A'},
    {label:'Thai',       fill:'#D0E4F5', tf:'#1A4E7A'},
  ];
  let ccx=20;
  cuisines.forEach(c=>{
    const [cbg,ctx2]=pill(ccx,174,c.label,c.fill,c.tf,{rx:16,size:12,padX:12,padY:6});
    els.push(cbg,ctx2); ccx+=cbg.width+8;
    if(ccx>W-60){ccx=20;}
  });

  // Season pills row
  els.push(text(20,218,'Dietary', 13, P.text, {fw:700}));
  const diets=[
    {label:'Vegetarian', fill:PILL.veggie, tf:PILLTEXT.veggie},
    {label:'Vegan',      fill:PILL.veggie, tf:PILLTEXT.veggie},
    {label:'Gluten-free',fill:PILL.grain,  tf:PILLTEXT.grain},
    {label:'Dairy-free', fill:PILL.dairy,  tf:PILLTEXT.dairy},
  ];
  let ddx=20;
  diets.forEach(d=>{
    const [dbg,dtx]=pill(ddx,228,d.label,d.fill,d.tf,{rx:16,size:12,padX:12,padY:6});
    els.push(dbg,dtx); ddx+=dbg.width+8;
  });

  // Featured cards — 2 tall editorial cards side by side
  els.push(text(20,270,'Trending this week', 13, P.text, {fw:700}));

  const features=[
    {name:'Shakshuka',         sub:'Middle Eastern',  emoji:'🍳', kcal:'320',  time:'20 min', bg:'#FDDDD0', border:'#F5B8A0'},
    {name:'Miso Ramen',        sub:'Japanese',        emoji:'🍜', kcal:'510',  time:'35 min', bg:'#D0E4F5', border:'#A0C4E8'},
    {name:'Tacos al Pastor',   sub:'Mexican',         emoji:'🌮', kcal:'440',  time:'30 min', bg:'#D4ECD8', border:'#A8D4B0'},
    {name:'Crêpes Suzette',    sub:'French',          emoji:'🥞', kcal:'390',  time:'25 min', bg:'#EDE0F5', border:'#C8A8E8'},
  ];

  features.forEach((f,i)=>{
    const col = i%2===0?20:205;
    const row = Math.floor(i/2);
    const fy = 286+row*188;
    els.push(rect(col,fy,165,170,f.bg,{rx:14,stroke:f.border,sw:1}));
    // Emoji
    els.push(text(col+82,fy+56,f.emoji,32,P.text,{anchor:'middle'}));
    // Name — editorial serif
    els.push(text(col+12,fy+88,f.name,14,P.text,{fw:700,font:'Georgia, serif'}));
    els.push(text(col+12,fy+104,f.sub,11,P.text2,{fw:400}));
    // Mini pills
    els.push(text(col+12,fy+125,f.time,10,P.text3));
    els.push(text(col+12,fy+140,f.kcal+' kcal',10,P.text3));
    // Rating
    els.push(text(col+145,fy+18,'♡',13,P.text3,{anchor:'middle'}));
  });

  els.push(...bottomNav('more'));
  return { name:'Discover', elements:els };
}

// ─── Assemble ────────────────────────────────────────────────────────────────
const screens = [
  screenHome(),
  screenPantry(),
  screenMealPlan(),
  screenRecipe(),
  screenShopping(),
  screenDiscover(),
];

// Build SVG for each screen
function buildSVG(screen) {
  function elToSvg(el) {
    if (el.type === 'rect') {
      let s = `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${el.rx||0}"`;
      if (el.opacity !== 1) s += ` opacity="${el.opacity}"`;
      if (el.stroke && el.stroke !== 'none') s += ` stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}"`;
      return s + '/>';
    }
    if (el.type === 'circle') {
      let s = `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}"`;
      if (el.opacity !== 1) s += ` opacity="${el.opacity}"`;
      if (el.stroke && el.stroke !== 'none') s += ` stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}"`;
      return s + '/>';
    }
    if (el.type === 'text') {
      const anchor = el.textAnchor || 'start';
      const ls = el.letterSpacing || 0;
      let s = `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${el.fontWeight||400}" font-family="${el.fontFamily||'Inter, sans-serif'}" text-anchor="${anchor}"`;
      if (el.opacity !== 1) s += ` opacity="${el.opacity}"`;
      if (ls) s += ` letter-spacing="${ls}"`;
      return s + `>${el.content}</text>`;
    }
    if (el.type === 'line') {
      let s = `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}"`;
      if (el.opacity !== 1) s += ` opacity="${el.opacity}"`;
      return s + '/>';
    }
    return '';
  }

  const svgEls = screen.elements.map(elToSvg).filter(Boolean).join('\n  ');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">\n  ${svgEls}\n</svg>`;
}

const pen = {
  version: '2.8',
  metadata: {
    name: 'SILO',
    tagline: 'Pantry intelligence. Meals made effortless.',
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'light',
    heartbeat: 471,
    elements: screens.reduce((a,s)=>a+s.elements.length,0),
    inspiration: 'OWO word-as-pill typography (lapa.ninja) + Overlay warm editorial light palette (lapa.ninja)',
    palette: P,
  },
  screens: screens.map(s => ({
    name: s.name,
    svg: buildSVG(s),
    elements: s.elements,
  })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));

const total = pen.metadata.elements;
console.log(`SILO: ${screens.length} screens, ${total} elements`);
console.log(`Written: ${SLUG}.pen`);
