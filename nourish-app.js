#!/usr/bin/env node
// nourish-app.js — HB#17 NOURISH nutrition & meal tracking app
// Warm oat bg, sage/terracotta/gold palette, rounded organic aesthetic

const fs   = require('fs');
const path = require('path');

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:       '#FAF7F0',  // warm oat
  surface:  '#F2EDE2',  // deeper oat
  card:     '#FFFFFF',
  border:   '#E4DDD0',
  sage:     '#7A9B6A',
  sageMid:  '#9BBB8C',
  sagePale: '#D4E8CA',
  terra:    '#C4796A',
  terraPale:'#F0D5D1',
  gold:     '#C4963A',
  goldPale: '#F0E4C0',
  forest:   '#3D6B4A',
  ink:      '#161410',
  mid:      '#5A5046',
  muted:    '#8A7E72',
  faint:    '#C0B8AE',
};

const W_M = 390, H_M = 844;
const W_D = 1440, H_D = 900;

// ── Primitives ────────────────────────────────────────────────────────────────
let _id = 1;
const uid = () => `n${_id++}`;

const R = (fill, x, y, w, h, r=0, o={}) => ({
  type:'rect', id:uid(), x, y, width:w, height:h, fill, cornerRadius:r, ...o
});

const T = (content, x, y, size, fill, o={}) => ({
  type:'text', id:uid(), x, y,
  content: String(content),
  fontSize: size, fill,
  fontFamily: o.fontFamily || 'Inter',
  fontWeight: o.fontWeight || 400,
  width: o.width || 300,
  height: o.height || Math.ceil(size * 1.4),
  ...o
});

const Circle = (fill, cx, cy, r, o={}) => R(fill, cx-r, cy-r, r*2, r*2, r, o);

const Pill = (fill, x, y, w, h, o={}) => R(fill, x, y, w, h, Math.ceil(h/2), o);

const makeScreen = (id, w, h, fill, children) => ({
  type:'frame', id, x:0, y:0, width:w, height:h, fill, children
});

// ── Reusable components ───────────────────────────────────────────────────────
function statusBar() {
  return [
    R(C.bg, 0, 0, W_M, 44),
    T('9:41', 16, 14, 12, C.ink, {fontWeight:600, width:60}),
    T('●●●', 306, 16, 10, C.ink, {width:68, fontWeight:600}),
  ];
}

function mobileNav(active=0) {
  const tabs = [
    {icon:'⌂', label:'Home'},
    {icon:'＋', label:'Log'},
    {icon:'⊞', label:'Recipes'},
    {icon:'◎', label:'Progress'},
  ];
  const els = [
    R(C.card, 0, H_M-80, W_M, 80, 0),
    R(C.border, 0, H_M-80, W_M, 1),
  ];
  tabs.forEach((tab, i) => {
    const x = 8 + i * 94;
    const isActive = i === active;
    if (isActive) els.push(Pill(C.sagePale, x, H_M-68, 82, 30));
    els.push(T(tab.icon, x+22, H_M-66, 17, isActive ? C.forest : C.muted, {width:38}));
    els.push(T(tab.label, x+8, H_M-45, 10, isActive ? C.forest : C.muted, {
      width:66, fontWeight: isActive ? 600 : 400
    }));
  });
  return els;
}

function macroPill(label, val, unit, color, paleFill, x, y) {
  return [
    R(paleFill, x, y, 108, 58, 16),
    T(label, x+10, y+8, 10, C.muted, {width:88}),
    T(String(val), x+10, y+24, 18, color, {fontWeight:700, width:60}),
    T(unit, x+10+String(val).length*11+2, y+30, 10, C.muted, {width:28}),
  ];
}

function calorieRing(cx, cy, consumed, total) {
  return [
    Circle('#E8E0D4', cx, cy, 58),
    Circle(C.sage,    cx, cy, 50),
    Circle(C.card,    cx, cy, 42),
    T(String(consumed), cx-26, cy-16, 26, C.ink, {fontWeight:700, width:52, textAlign:'center'}),
    T('kcal',          cx-16, cy+12, 10, C.muted, {width:32, textAlign:'center'}),
    T(`of ${total}`,   cx-20, cy+26, 9,  C.faint, {width:40, textAlign:'center'}),
  ];
}

function foodRow(name, calories, macro, macroColor, x, y, w=358) {
  return [
    R(C.card, x, y, w, 60, 14),
    Circle(C.sagePale, x+30, y+30, 18),
    T(name, x+58, y+10, 13, C.ink, {fontWeight:600, width:200}),
    T(macro, x+58, y+30, 11, C.muted, {width:180}),
    T(String(calories), x+w-58, y+14, 15, C.ink, {fontWeight:700, width:40, textAlign:'right'}),
    T('kcal', x+w-34, y+18, 9, C.muted, {width:28}),
    R(macroColor, x+w-10, y+14, 4, 32, 2),
  ];
}

// ── SCREEN 1: mDashboard ──────────────────────────────────────────────────────
function mDashboard() {
  const els = [];
  els.push(...statusBar());

  els.push(T('Good morning,', 20, 52, 13, C.muted, {width:200}));
  els.push(T('Alex 🌿', 20, 68, 22, C.ink, {fontWeight:700, width:180}));
  els.push(Circle(C.sagePale, 355, 72, 26));
  els.push(T('A', 343, 61, 16, C.forest, {fontWeight:700, width:24, textAlign:'center'}));
  els.push(Pill(C.goldPale, 264, 58, 80, 26));
  els.push(T('🔥 12 days', 272, 65, 10, C.gold, {fontWeight:600, width:66}));

  // Daily summary card
  els.push(R(C.card, 16, 106, 358, 158, 20));
  els.push(T("Today's Goal", 32, 122, 12, C.muted, {width:120}));
  els.push(T('1,840 kcal', 32, 140, 20, C.ink, {fontWeight:700, width:160}));
  els.push(...calorieRing(300, 176, 1240, 1840));
  els.push(R(C.border, 32, 198, 200, 7, 4));
  els.push(R(C.sage, 32, 198, 134, 7, 4));
  els.push(T('600 kcal remaining', 32, 212, 11, C.muted, {width:170}));

  // Macro row
  els.push(...macroPill('Carbs',   142, 'g', C.gold,  C.goldPale,  16,  278));
  els.push(...macroPill('Protein',  68, 'g', C.terra, C.terraPale, 130, 278));
  els.push(...macroPill('Fat',      38, 'g', C.sage,  C.sagePale,  244, 278));

  // Today's meals
  els.push(T("Today's Meals", 20, 350, 15, C.ink, {fontWeight:700, width:190}));
  els.push(T('3 logged', 312, 353, 11, C.muted, {width:62}));

  const meals = [
    {name:'Oat Bowl + Berries',    cal:380, macro:'Breakfast · High fiber', color:C.gold},
    {name:'Grilled Chicken Salad', cal:520, macro:'Lunch · High protein',   color:C.terra},
    {name:'Quinoa & Roasted Veg',  cal:340, macro:'Dinner · Balanced',      color:C.sage},
  ];
  meals.forEach((m, i) => els.push(...foodRow(m.name, m.cal, m.macro, m.color, 16, 376+i*70)));

  // Water tracker
  els.push(R(C.surface, 16, 594, 358, 66, 16));
  els.push(T('💧 Hydration', 30, 607, 13, C.ink, {fontWeight:600, width:140}));
  els.push(T('6 / 8 glasses', 30, 626, 10, C.muted, {width:110}));
  for (let g=0; g<8; g++) {
    els.push(Circle(g < 6 ? '#6BAED6' : C.border, 214+g*18, 626, 6));
  }

  els.push(...mobileNav(0));
  return els;
}

// ── SCREEN 2: mLogMeal ────────────────────────────────────────────────────────
function mLogMeal() {
  const els = [];
  els.push(...statusBar());

  els.push(T('← Log Meal', 20, 52, 14, C.forest, {fontWeight:600, width:110}));
  els.push(T('Lunch', 158, 52, 17, C.ink, {fontWeight:700, width:74, textAlign:'center'}));

  // Search bar
  els.push(R(C.surface, 16, 82, 358, 46, 23));
  els.push(T('🔍', 30, 96, 15, C.muted, {width:22}));
  els.push(T('Search foods, meals, recipes...', 54, 98, 13, C.faint, {width:290}));

  // Quick add categories
  els.push(T('Quick Add', 20, 144, 14, C.ink, {fontWeight:700, width:120}));
  const cats = [
    {icon:'🥗', label:'Salad',   color:C.sagePale},
    {icon:'🍗', label:'Protein', color:C.terraPale},
    {icon:'🥣', label:'Grains',  color:C.goldPale},
    {icon:'🍎', label:'Fruit',   color:'#F9D9D9'},
  ];
  cats.forEach((cat, i) => {
    const x = 16 + i*90;
    els.push(R(cat.color, x, 166, 80, 68, 16));
    els.push(T(cat.icon, x+28, 176, 20, C.ink, {width:24}));
    els.push(T(cat.label, x+8, 206, 10, C.mid, {width:64, textAlign:'center'}));
  });

  // Recently logged
  els.push(T('Recently Logged', 20, 250, 14, C.ink, {fontWeight:700, width:200}));
  const recent = [
    {name:'Greek Yogurt',      cal:130, macro:'22g protein · 8g carbs',  color:C.terra},
    {name:'Brown Rice (100g)', cal:112, macro:'2g protein · 24g carbs',  color:C.gold},
    {name:'Mixed Greens',      cal:18,  macro:'1g protein · 3g carbs',   color:C.sage},
    {name:'Olive Oil (1 tbsp)',cal:120, macro:'0g protein · 0g carbs',   color:C.gold},
  ];
  recent.forEach((r, i) => els.push(...foodRow(r.name, r.cal, r.macro, r.color, 16, 274+i*68)));

  // Log button
  els.push(Pill(C.forest, 16, 548, 358, 50));
  els.push(T('Log Meal — 380 kcal', 86, 561, 15, '#FFFFFF', {fontWeight:700, width:220, textAlign:'center'}));

  // Meal total card
  els.push(R(C.card, 16, 608, 358, 78, 20));
  els.push(T('Meal Total', 30, 622, 12, C.muted, {width:100}));
  els.push(T('380 kcal', 30, 638, 18, C.ink, {fontWeight:700, width:100}));
  [{label:'C', val:0.6, color:C.gold}, {label:'P', val:0.75, color:C.terra}, {label:'F', val:0.4, color:C.sage}].forEach((m, i) => {
    const bx = 180 + i*60;
    els.push(T(m.label, bx, 622, 10, C.muted, {width:20}));
    els.push(R(C.border, bx, 638, 44, 8, 4));
    els.push(R(m.color, bx, 638, Math.round(44*m.val), 8, 4));
  });

  els.push(...mobileNav(1));
  return els;
}

// ── SCREEN 3: mMealDetail ─────────────────────────────────────────────────────
function mMealDetail() {
  const els = [];

  els.push(R(C.sagePale, 0, 0, W_M, 250));
  els.push(T('🥗', 150, 88, 72, C.sage, {width:90, textAlign:'center'}));
  els.push(T('← Back', 16, 50, 14, C.forest, {fontWeight:600, width:80}));
  els.push(T('♡', 354, 50, 18, C.forest, {width:22}));
  els.push(Pill(C.card, 126, 214, 138, 26));
  els.push(T('⭐ 4.8  ·  15 min', 138, 222, 11, C.ink, {fontWeight:600, width:118}));

  els.push(T('Grilled Chicken Salad', 20, 268, 21, C.ink, {fontWeight:700, width:320}));
  els.push(T('High-protein · Mediterranean · Lunch', 20, 296, 12, C.muted, {width:310}));

  // Nutrient bar
  const nutrients = [
    {label:'Calories', val:'520', unit:'kcal', color:C.ink},
    {label:'Protein',  val:'48g', unit:'',     color:C.terra},
    {label:'Carbs',    val:'22g', unit:'',     color:C.gold},
    {label:'Fat',      val:'24g', unit:'',     color:C.sage},
  ];
  els.push(R(C.surface, 16, 322, 358, 76, 16));
  nutrients.forEach((n, i) => {
    const x = 28 + i*88;
    els.push(T(n.val+n.unit, x, 338, 15, n.color, {fontWeight:700, width:80}));
    els.push(T(n.label,      x, 360, 10, C.muted, {width:80}));
  });

  // Ingredients
  els.push(T('Ingredients', 20, 414, 15, C.ink, {fontWeight:700, width:160}));
  els.push(T('6 items', 316, 417, 11, C.muted, {width:52}));

  const ings = [
    {name:'Chicken Breast',  amt:'150g',  cal:'247 kcal'},
    {name:'Mixed Greens',    amt:'80g',   cal:'14 kcal'},
    {name:'Cherry Tomatoes', amt:'60g',   cal:'21 kcal'},
    {name:'Cucumber',        amt:'50g',   cal:'8 kcal'},
    {name:'Olive Oil',       amt:'1 tbsp',cal:'119 kcal'},
  ];
  ings.forEach((ing, i) => {
    const y = 438 + i*54;
    els.push(R(C.card, 16, y, 358, 46, 12));
    els.push(Circle(C.sagePale, 44, y+23, 15));
    els.push(T(ing.name, 68, y+8,  13, C.ink, {fontWeight:500, width:170}));
    els.push(T(ing.amt,  68, y+26, 11, C.muted, {width:80}));
    els.push(T(ing.cal, 298, y+13, 11, C.muted, {width:66, textAlign:'right'}));
  });

  els.push(Pill(C.forest, 16, 718, 358, 50));
  els.push(T("Add to Today's Log", 96, 731, 14, '#FFFFFF', {fontWeight:700, width:200, textAlign:'center'}));

  return els;
}

// ── SCREEN 4: mRecipes ────────────────────────────────────────────────────────
function mRecipes() {
  const els = [];
  els.push(...statusBar());

  els.push(T('Recipes', 20, 52, 22, C.ink, {fontWeight:700, width:150}));
  els.push(T('🔍', 350, 54, 15, C.muted, {width:22}));

  // Filter pills
  const filters = ['All', 'High Protein', 'Low Carb', 'Quick', 'Vegan'];
  let fx = 16;
  filters.forEach((f, i) => {
    const w = f.length * 8 + 22;
    const isActive = i === 0;
    els.push(Pill(isActive ? C.forest : C.surface, fx, 84, w, 28));
    els.push(T(f, fx+10, 92, 11, isActive ? '#FFFFFF' : C.mid, {fontWeight:isActive?600:400, width:w-18}));
    fx += w + 8;
  });

  // Featured recipe
  els.push(R(C.sagePale, 16, 124, 358, 176, 20));
  els.push(T('🥘', 152, 162, 58, C.sage, {width:86, textAlign:'center'}));
  els.push(Pill(C.card, 22, 268, 92, 24));
  els.push(T("⭐ Chef's Pick", 30, 275, 10, C.gold, {fontWeight:700, width:82}));
  els.push(T('Mediterranean Bowl', 20, 312, 18, C.ink, {fontWeight:700, width:290}));
  els.push(T('480 kcal  ·  35g protein  ·  25 min', 20, 336, 12, C.muted, {width:300}));
  ['High Protein', 'Gluten-Free'].forEach((tag, i) => {
    els.push(Pill(C.sagePale, 20+i*104, 358, 96, 22));
    els.push(T(tag, 26+i*104, 365, 10, C.forest, {width:84, textAlign:'center'}));
  });

  // Recipe grid (2 col)
  const recipes = [
    {name:'Lemon Herb Salmon',   cal:390, time:'20 min', color:C.terraPale, icon:'🐟'},
    {name:'Quinoa Power Bowl',   cal:420, time:'15 min', color:C.goldPale,  icon:'🍲'},
    {name:'Green Smoothie',      cal:180, time:'5 min',  color:C.sagePale,  icon:'🥤'},
    {name:'Turkey Wrap',         cal:350, time:'10 min', color:C.terraPale, icon:'🌯'},
  ];
  recipes.forEach((r, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const rx = 16 + col*184, ry = 396 + row*168;
    els.push(R(r.color, rx, ry, 172, 96, 16));
    els.push(T(r.icon, rx+62, ry+22, 38, C.ink, {width:48}));
    els.push(T(r.name, rx+8, ry+104, 13, C.ink, {fontWeight:600, width:156}));
    els.push(T(`${r.cal} kcal · ${r.time}`, rx+8, ry+122, 10, C.muted, {width:156}));
  });

  els.push(...mobileNav(2));
  return els;
}

// ── SCREEN 5: mProgress ────────────────────────────────────────────────────────
function mProgress() {
  const els = [];
  els.push(...statusBar());

  els.push(T('Progress', 20, 52, 22, C.ink, {fontWeight:700, width:160}));
  ['Week','Month','3M'].forEach((p, i) => {
    const isActive = i === 0;
    els.push(Pill(isActive ? C.forest : C.surface, 236+i*50, 54, 44, 26));
    els.push(T(p, 246+i*50, 62, 11, isActive ? '#FFFFFF' : C.muted, {width:24, textAlign:'center'}));
  });

  // Stat cards
  [{label:'Avg Calories', val:'1,780', unit:'kcal/day', color:C.ink},
   {label:'Streak',       val:'12',    unit:'days',      color:C.gold}].forEach((s, i) => {
    const sx = 16 + i*186;
    els.push(R(C.card, sx, 92, 174, 78, 16));
    els.push(T(s.val,  sx+14, 108, 22, s.color, {fontWeight:700, width:140}));
    els.push(T(s.unit, sx+14, 134, 10, C.muted, {width:120}));
    els.push(T(s.label,sx+14, 150, 10, C.faint, {width:140}));
  });

  // Weekly bar chart
  els.push(R(C.card, 16, 182, 358, 156, 16));
  els.push(T('Calories This Week', 30, 196, 13, C.ink, {fontWeight:600, width:200}));
  const days = ['M','T','W','T','F','S','S'];
  const cals = [1820,1650,1840,1720,1900,1580,1780];
  days.forEach((d, i) => {
    const bx = 28 + i*46;
    const bh = Math.round((cals[i]/2000)*88);
    const isToday = i === 4;
    els.push(R(isToday ? C.sage : C.sagePale, bx, 308-bh, 34, bh, 6));
    els.push(T(d, bx+10, 314, 10, C.muted, {width:20, textAlign:'center'}));
  });

  // Goal tracking
  els.push(T('Weekly Goals', 20, 354, 15, C.ink, {fontWeight:700, width:160}));
  const goals = [
    {label:'Calorie Target Met',  val:5, total:7, color:C.sage},
    {label:'Protein Goal (100g+)',val:6, total:7, color:C.terra},
    {label:'Logged All Meals',    val:4, total:7, color:C.gold},
  ];
  goals.forEach((g, i) => {
    const gy = 378 + i*70;
    els.push(R(C.card, 16, gy, 358, 58, 14));
    els.push(T(g.label, 28, gy+8,  13, C.ink, {fontWeight:500, width:220}));
    els.push(T(`${g.val}/${g.total}`, 306, gy+8, 13, g.color, {fontWeight:700, width:40}));
    els.push(R(C.border, 28, gy+36, 304, 8, 4));
    els.push(R(g.color,  28, gy+36, Math.round(304*(g.val/g.total)), 8, 4));
  });

  // Macro split bar
  els.push(R(C.card, 16, 592, 358, 80, 16));
  els.push(T('Macro Split (Avg)', 28, 606, 13, C.ink, {fontWeight:600, width:200}));
  els.push(R(C.border, 28, 638, 306, 12, 6));
  els.push(R(C.gold,   28, 638, 138, 12, 6));
  els.push(R(C.terra, 166, 638,  90, 12, 0));
  els.push(R(C.sage,  256, 638,  78, 12, 6));
  [{c:C.gold,label:'Carbs 45%'},{c:C.terra,label:'Protein 30%'},{c:C.sage,label:'Fat 25%'}].forEach((m, i) => {
    els.push(Circle(m.c, 34+i*108, 658, 5));
    els.push(T(m.label, 44+i*108, 652, 10, C.muted, {width:96}));
  });

  els.push(...mobileNav(3));
  return els;
}

// ── SCREEN 6: dDashboard ─────────────────────────────────────────────────────
function dDashboard() {
  const els = [];

  // Sidebar
  els.push(R(C.card, 0, 0, 240, H_D));
  els.push(R(C.border, 240, 0, 1, H_D));
  els.push(T('🌿 nourish', 24, 28, 18, C.forest, {fontWeight:700, width:160}));
  els.push(Circle(C.sagePale, 44, 98, 26));
  els.push(T('A', 32, 86, 18, C.forest, {fontWeight:700, width:24, textAlign:'center'}));
  els.push(T('Alex Morgan',    78, 86, 13, C.ink, {fontWeight:600, width:140}));
  els.push(T('1,840 kcal goal',78, 106, 11, C.muted, {width:140}));

  const navItems = [
    {label:'Dashboard', active:true},
    {label:'Log Meal',  active:false},
    {label:'Recipes',   active:false},
    {label:'Progress',  active:false},
    {label:'Settings',  active:false},
  ];
  navItems.forEach((item, i) => {
    const ny = 146 + i*52;
    if (item.active) els.push(R(C.sagePale, 12, ny-4, 216, 42, 12));
    els.push(T(item.label, 52, ny+6, 13, item.active ? C.forest : C.muted, {
      fontWeight: item.active ? 600 : 400, width:160
    }));
  });
  els.push(Pill(C.goldPale, 18, H_D-80, 204, 44));
  els.push(T('🔥 12-Day Streak', 38, H_D-64, 13, C.gold, {fontWeight:700, width:160}));
  els.push(T('Keep it up!',      38, H_D-46, 11, C.muted, {width:120}));

  // Main content
  const MX = 256;
  els.push(T('Good morning, Alex 🌿', MX, 28, 22, C.ink, {fontWeight:700, width:420}));
  els.push(T('Friday, March 20  ·  1,240 of 1,840 kcal logged', MX, 58, 13, C.muted, {width:440}));
  els.push(R(C.surface, W_D-300, 22, 260, 44, 22));
  els.push(T('🔍  Search foods...', W_D-286, 38, 13, C.faint, {width:220}));

  // Stats row
  const statsData = [
    {label:'Calories', val:'1,240', sub:'of 1,840', color:C.sage,  bg:C.sagePale},
    {label:'Protein',  val:'68g',   sub:'of 100g',  color:C.terra, bg:C.terraPale},
    {label:'Carbs',    val:'142g',  sub:'of 200g',  color:C.gold,  bg:C.goldPale},
    {label:'Fat',      val:'38g',   sub:'of 60g',   color:C.sage,  bg:C.sagePale},
  ];
  const cW = 238;
  statsData.forEach((s, i) => {
    const sx = MX + i*(cW+16);
    els.push(R(C.card, sx, 88, cW, 96, 16));
    els.push(R(s.bg, sx+14, 100, 42, 42, 12));
    els.push(T(s.label.slice(0,1), sx+25, 113, 17, s.color, {fontWeight:700, width:20}));
    els.push(T(s.label, sx+66, 103, 11, C.muted, {width:150}));
    els.push(T(s.val,   sx+66, 121, 19, C.ink,   {fontWeight:700, width:150}));
    els.push(T(s.sub,   sx+66, 146, 10, C.faint, {width:120}));
    els.push(R(C.border, sx+14, 164, cW-28, 6, 3));
    els.push(R(s.color,  sx+14, 164, Math.round((cW-28)*0.68), 6, 3));
  });

  // Meals panel
  const col1X = MX, col1W = 596;
  const col2X = MX+612, col2W = W_D-MX-612-24;

  els.push(R(C.card, col1X, 202, col1W, 360, 16));
  els.push(T("Today's Meals", col1X+18, 220, 15, C.ink, {fontWeight:700, width:200}));
  els.push(Pill(C.forest, col1X+col1W-112, 218, 96, 28));
  els.push(T('+ Log Meal', col1X+col1W-100, 227, 12, '#FFFFFF', {fontWeight:600, width:84}));

  const meals = [
    {time:'7:30 AM',  name:'Oat Bowl + Berries',       cal:380, macro:'Carbs-heavy', color:C.gold},
    {time:'12:15 PM', name:'Grilled Chicken Salad',     cal:520, macro:'High protein',color:C.terra},
    {time:'3:00 PM',  name:'Apple + Almonds',           cal:200, macro:'Snack',       color:C.sage},
    {time:'7:00 PM',  name:'Quinoa Bowl (planned)',     cal:340, macro:'Dinner',       color:C.faint},
  ];
  meals.forEach((m, i) => {
    const my = 258 + i*70;
    const isPast = i < 3;
    els.push(R(isPast ? C.surface : C.bg, col1X+14, my, col1W-28, 60, 12));
    els.push(Circle(isPast ? m.color : C.faint, col1X+34, my+30, 8));
    els.push(T(m.time, col1X+52, my+8, 11, C.muted, {width:80}));
    els.push(T(m.name, col1X+52, my+26, 13, isPast ? C.ink : C.faint, {fontWeight:600, width:340}));
    els.push(T(m.macro, col1X+52, my+44, 10, C.muted, {width:200}));
    els.push(T(`${m.cal} kcal`, col1X+col1W-80, my+24, 13, isPast ? C.ink : C.faint, {fontWeight:700, width:64}));
  });

  // Right panels
  els.push(R(C.card, col2X, 202, col2W, 172, 16));
  els.push(T('Daily Progress', col2X+16, 218, 14, C.ink, {fontWeight:700, width:200}));
  els.push(...calorieRing(col2X+col2W/2, 300, 1240, 1840));

  els.push(R(C.card, col2X, 386, col2W, 76, 16));
  els.push(T('💧 Hydration', col2X+16, 400, 13, C.ink, {fontWeight:600, width:160}));
  els.push(T('6 of 8 glasses', col2X+16, 420, 11, C.muted, {width:120}));
  for (let g=0; g<8; g++) {
    els.push(Circle(g < 6 ? '#6BAED6' : C.border, col2X+16+g*20, 448, 7));
  }

  els.push(R(C.card, col2X, 474, col2W, 70, 16));
  els.push(T('Macro Balance', col2X+16, 488, 13, C.ink, {fontWeight:600, width:160}));
  [{c:C.gold,l:'Carbs 45%'},{c:C.terra,l:'Prot 30%'},{c:C.sage,l:'Fat 25%'}].forEach((m, i) => {
    els.push(Circle(m.c, col2X+18+i*88, 530, 5));
    els.push(T(m.l, col2X+28+i*88, 524, 10, C.muted, {width:78}));
  });

  // Suggested recipes
  els.push(R(C.card, col1X, 574, col1W, 290, 16));
  els.push(T('Suggested Recipes', col1X+18, 592, 15, C.ink, {fontWeight:700, width:200}));
  els.push(T('Based on your goals', col1X+18, 614, 11, C.muted, {width:180}));
  const sugs = [
    {name:'Lemon Herb Salmon',  cal:390, tags:['High Protein','Omega-3'], color:C.terraPale, icon:'🐟'},
    {name:'Spinach Lentil Soup',cal:310, tags:['Iron','Fiber'],           color:C.sagePale,  icon:'🍲'},
  ];
  sugs.forEach((s, i) => {
    const sx = col1X+14+i*294;
    els.push(R(s.color, sx, 632, 278, 100, 16));
    els.push(T(s.icon, sx+10, 650, 30, C.ink, {width:38}));
    els.push(T(s.name, sx+56, 640, 13, C.ink, {fontWeight:600, width:200}));
    els.push(T(`${s.cal} kcal`, sx+56, 660, 11, C.muted, {width:100}));
    s.tags.forEach((tag, ti) => {
      els.push(Pill(C.card, sx+56+ti*90, 680, 84, 22));
      els.push(T(tag, sx+62+ti*90, 687, 10, C.mid, {width:70}));
    });
    els.push(T('View Recipe →', sx+56, 738, 12, C.forest, {fontWeight:600, width:110}));
  });

  // Insight card (right)
  els.push(R(C.sagePale, col2X, 556, col2W, 80, 16));
  els.push(T('💡 Today\'s Tip', col2X+16, 570, 12, C.forest, {fontWeight:700, width:160}));
  els.push(T('Add 32g more protein to hit your daily goal.', col2X+16, 590, 11, C.mid, {width:col2W-32}));
  els.push(T('Try: Greek yogurt or a boiled egg', col2X+16, 610, 11, C.muted, {width:col2W-32}));

  return els;
}

// ── SCREEN 7: dMealLog ────────────────────────────────────────────────────────
function dMealLog() {
  const els = [];

  // Sidebar
  els.push(R(C.card, 0, 0, 240, H_D));
  els.push(R(C.border, 240, 0, 1, H_D));
  els.push(T('🌿 nourish', 24, 28, 18, C.forest, {fontWeight:700, width:160}));
  ['Dashboard','Log Meal','Recipes','Progress','Settings'].forEach((item, i) => {
    const ny = 146 + i*52, isActive = i === 1;
    if (isActive) els.push(R(C.sagePale, 12, ny-4, 216, 42, 12));
    els.push(T(item, 52, ny+6, 13, isActive ? C.forest : C.muted, {fontWeight:isActive?600:400, width:160}));
  });

  const MX = 256;
  els.push(T('Log Meal', MX, 28, 24, C.ink, {fontWeight:700, width:200}));
  els.push(T('Friday, March 20  ·  Lunch', MX, 60, 13, C.muted, {width:280}));

  // Meal type selector
  ['Breakfast','Lunch','Dinner','Snack'].forEach((m, i) => {
    const isActive = i === 1;
    els.push(Pill(isActive ? C.forest : C.surface, MX+i*122, 84, 114, 34));
    els.push(T(m, MX+i*122+18, 93, 13, isActive ? '#FFFFFF' : C.mid, {fontWeight:isActive?600:400, width:78}));
  });

  // Search
  els.push(R(C.surface, MX, 134, 684, 50, 25));
  els.push(T('🔍', MX+14, 150, 17, C.muted, {width:22}));
  els.push(T('Search for a food, meal or recipe...', MX+44, 152, 13, C.faint, {width:420}));
  els.push(Pill(C.forest, MX+604, 140, 80, 38));
  els.push(T('Scan', MX+618, 152, 13, '#FFFFFF', {fontWeight:600, width:52}));

  const leftW = 504, rightX = MX+leftW+20, rightW = W_D-rightX-24;

  els.push(T('Recent & Favorites', MX, 204, 14, C.ink, {fontWeight:700, width:200}));

  const foods = [
    {name:'Greek Yogurt (Low Fat)',  cal:130, macro:'22g P · 8g C · 0g F',  color:C.terra},
    {name:'Oat Groats (100g)',        cal:389, macro:'17g P · 66g C · 7g F', color:C.gold},
    {name:'Avocado (1/2)',            cal:160, macro:'2g P · 9g C · 15g F',  color:C.sage},
    {name:'Banana (Medium)',          cal:105, macro:'1g P · 27g C · 0g F',  color:C.gold},
    {name:'Egg (Large)',              cal:78,  macro:'6g P · 1g C · 5g F',   color:C.terra},
    {name:'Almonds (28g)',            cal:164, macro:'6g P · 6g C · 14g F',  color:C.gold},
  ];
  foods.forEach((f, i) => {
    const fy = 228 + i*68;
    els.push(R(C.card, MX, fy, leftW, 60, 14));
    els.push(Circle(C.sagePale, MX+28, fy+30, 18));
    els.push(T(f.name,  MX+56, fy+10, 13, C.ink, {fontWeight:500, width:300}));
    els.push(T(f.macro, MX+56, fy+30, 11, C.muted, {width:280}));
    els.push(T(String(f.cal), MX+leftW-72, fy+14, 15, C.ink, {fontWeight:700, width:44}));
    els.push(T('kcal', MX+leftW-36, fy+19, 10, C.muted, {width:30}));
    els.push(Pill(C.forest, MX+leftW-30, fy+18, 22, 24));
    els.push(T('+', MX+leftW-23, fy+22, 14, '#FFFFFF', {fontWeight:700, width:14}));
    els.push(R(f.color, MX+leftW-8, fy+12, 4, 36, 2));
  });

  // Right: Meal summary
  els.push(R(C.card, rightX, 88, rightW, H_D-112, 20));
  els.push(T('Meal Summary', rightX+18, 106, 15, C.ink, {fontWeight:700, width:200}));
  els.push(T('Lunch · Adding items', rightX+18, 128, 12, C.muted, {width:200}));

  els.push(R(C.sagePale, rightX+14, 148, rightW-28, 78, 14));
  els.push(T('540', rightX+26, 162, 28, C.forest, {fontWeight:700, width:80}));
  els.push(T('kcal', rightX+26, 194, 11, C.muted, {width:44}));
  [{label:'P',val:0.7,color:C.terra},{label:'C',val:0.5,color:C.gold},{label:'F',val:0.55,color:C.sage}].forEach((m, i) => {
    const bx = rightX+116+i*58;
    els.push(T(m.label, bx, 158, 10, C.muted, {width:14}));
    els.push(R(C.border, bx, 174, 44, 8, 4));
    els.push(R(m.color,  bx, 174, Math.round(44*m.val), 8, 4));
  });

  els.push(T('Added Items', rightX+18, 240, 12, C.muted, {width:100}));
  [{name:'Greek Yogurt', cal:130, grams:'200g'},{name:'Granola',cal:180,grams:'45g'}].forEach((a, i) => {
    const ay = 262 + i*56;
    els.push(R(C.surface, rightX+14, ay, rightW-28, 48, 12));
    els.push(T(a.name,  rightX+26, ay+8,  13, C.ink, {fontWeight:500, width:160}));
    els.push(T(a.grams, rightX+26, ay+28, 11, C.muted, {width:80}));
    els.push(T(`${a.cal} kcal`, rightX+rightW-74, ay+14, 12, C.ink, {fontWeight:600, width:58}));
    els.push(T('✕', rightX+rightW-26, ay+16, 11, C.faint, {width:14}));
  });

  els.push(Pill(C.forest, rightX+14, H_D-68, rightW-28, 46));
  els.push(T('Save Lunch (310 kcal)', rightX+28, H_D-50, 13, '#FFFFFF', {fontWeight:700, width:200}));

  return els;
}

// ── SCREEN 8: dRecipes ────────────────────────────────────────────────────────
function dRecipes() {
  const els = [];

  // Sidebar
  els.push(R(C.card, 0, 0, 240, H_D));
  els.push(R(C.border, 240, 0, 1, H_D));
  els.push(T('🌿 nourish', 24, 28, 18, C.forest, {fontWeight:700, width:160}));
  ['Dashboard','Log Meal','Recipes','Progress','Settings'].forEach((item, i) => {
    const ny = 146 + i*52, isActive = i === 2;
    if (isActive) els.push(R(C.sagePale, 12, ny-4, 216, 42, 12));
    els.push(T(item, 52, ny+6, 13, isActive ? C.forest : C.muted, {fontWeight:isActive?600:400, width:160}));
  });

  const MX = 256;
  els.push(T('Recipe Library', MX, 28, 24, C.ink, {fontWeight:700, width:300}));
  els.push(T('Discover nutritious meals tailored to your goals', MX, 60, 13, C.muted, {width:400}));

  els.push(R(C.surface, MX, 88, 478, 44, 22));
  els.push(T('🔍  Search recipes...', MX+14, 102, 13, C.faint, {width:320}));

  const recipeFilters = ['All','High Protein','Low Carb','Vegetarian','Under 30 min'];
  let rfx = MX+490;
  recipeFilters.forEach((f, i) => {
    const rw = f.length*8+20; const isActive = i === 0;
    els.push(Pill(isActive ? C.forest : C.surface, rfx, 88, rw, 44));
    els.push(T(f, rfx+10, 102, 11, isActive ? '#FFFFFF' : C.mid, {width:rw-18}));
    rfx += rw+8;
  });

  // Featured hero
  els.push(R(C.sagePale, MX, 150, 700, 192, 20));
  els.push(T('🥘', MX+14, 168, 82, C.sage, {width:100, textAlign:'center'}));
  els.push(Pill(C.card, MX+130, 150, 96, 26));
  els.push(T('⭐ Featured', MX+142, 158, 11, C.gold, {fontWeight:700, width:82}));
  els.push(T('Mediterranean Bowl', MX+130, 188, 22, C.ink, {fontWeight:700, width:400}));
  els.push(T('480 kcal  ·  35g protein  ·  25 min  ·  Mediterranean', MX+130, 218, 12, C.muted, {width:400}));
  ['High Protein','Gluten-Free','Meal Prep'].forEach((tag, i) => {
    els.push(Pill(C.sagePale, MX+130+i*112, 244, 104, 24));
    els.push(T(tag, MX+138+i*112, 251, 10, C.forest, {width:88, textAlign:'center'}));
  });
  els.push(T('View Recipe →', MX+130, 278, 13, C.forest, {fontWeight:600, width:120}));

  // Recipe grid (3 col)
  const deskRecipes = [
    {name:'Lemon Herb Salmon',   cal:390, time:'20 min', protein:'42g', color:C.terraPale, icon:'🐟'},
    {name:'Green Smoothie Bowl', cal:180, time:'5 min',  protein:'8g',  color:C.sagePale,  icon:'🥤'},
    {name:'Turkey & Veggie Wrap',cal:350, time:'10 min', protein:'32g', color:C.terraPale, icon:'🌯'},
    {name:'Quinoa Power Bowl',   cal:420, time:'15 min', protein:'18g', color:C.goldPale,  icon:'🍲'},
    {name:'Baked Chicken',       cal:220, time:'35 min', protein:'45g', color:C.terraPale, icon:'🍗'},
    {name:'Avocado Toast',       cal:310, time:'8 min',  protein:'12g', color:C.sagePale,  icon:'🥑'},
  ];
  const cW2 = 222;
  deskRecipes.forEach((r, i) => {
    const col = i%3, row = Math.floor(i/3);
    const rx = MX+col*(cW2+16), ry = 362+row*224;
    els.push(R(r.color, rx, ry, cW2, 128, 16));
    els.push(T(r.icon, rx+cW2/2-18, ry+34, 46, C.ink, {width:44}));
    els.push(R(C.card, rx, ry+128, cW2, 88, 0));
    els.push(T(r.name, rx+10, ry+138, 13, C.ink, {fontWeight:600, width:200}));
    els.push(T(`${r.cal} kcal · ${r.protein} protein`, rx+10, ry+158, 10, C.muted, {width:200}));
    els.push(T(`⏱ ${r.time}`, rx+10, ry+176, 10, C.muted, {width:80}));
    els.push(Pill(C.forest+'28', rx+cW2-74, ry+174, 62, 22));
    els.push(T('View', rx+cW2-60, ry+181, 10, C.forest, {fontWeight:600, width:38}));
  });

  return els;
}

// ── SCREEN 9: dAnalytics ─────────────────────────────────────────────────────
function dAnalytics() {
  const els = [];

  // Sidebar
  els.push(R(C.card, 0, 0, 240, H_D));
  els.push(R(C.border, 240, 0, 1, H_D));
  els.push(T('🌿 nourish', 24, 28, 18, C.forest, {fontWeight:700, width:160}));
  ['Dashboard','Log Meal','Recipes','Progress','Settings'].forEach((item, i) => {
    const ny = 146 + i*52, isActive = i === 3;
    if (isActive) els.push(R(C.sagePale, 12, ny-4, 216, 42, 12));
    els.push(T(item, 52, ny+6, 13, isActive ? C.forest : C.muted, {fontWeight:isActive?600:400, width:160}));
  });

  const MX = 256;
  els.push(T('Progress & Analytics', MX, 28, 24, C.ink, {fontWeight:700, width:320}));
  els.push(T('Your nutrition journey · March 2026', MX, 60, 13, C.muted, {width:300}));

  ['This Week','This Month','3 Months','6 Months','All Time'].forEach((p, i) => {
    const isActive = i === 1;
    els.push(Pill(isActive ? C.forest : C.surface, MX+i*132, 84, 124, 34));
    els.push(T(p, MX+i*132+14, 93, 12, isActive ? '#FFFFFF' : C.mid, {fontWeight:isActive?600:400, width:96}));
  });

  // Stat row
  const statCards = [
    {label:'Avg Daily Calories', val:'1,780',  delta:'+2% vs last month',color:C.sage},
    {label:'Protein Goal Hit',   val:'82%',    delta:'+8% vs last month',color:C.terra},
    {label:'Logging Streak',     val:'12 days',delta:'Personal best!',   color:C.gold},
    {label:'Meals Logged',       val:'87',     delta:'this month',       color:C.forest},
  ];
  statCards.forEach((s, i) => {
    const sx = MX+i*(272+16);
    els.push(R(C.card, sx, 134, 264, 86, 16));
    els.push(T(s.label, sx+14, 148, 11, C.muted, {width:220}));
    els.push(T(s.val,   sx+14, 166, 20, C.ink,   {fontWeight:700, width:200}));
    els.push(Pill(C.sagePale, sx+14, 194, 130, 18));
    els.push(T(`↑ ${s.delta}`, sx+22, 200, 9, C.forest, {fontWeight:600, width:118}));
  });

  // Calorie trend chart
  els.push(R(C.card, MX, 238, 700, 212, 16));
  els.push(T('Calorie Trend — March 2026', MX+18, 254, 14, C.ink, {fontWeight:700, width:280}));
  els.push(T('Daily intake vs 1,840 kcal goal', MX+18, 274, 11, C.muted, {width:240}));

  const chartX=MX+18, chartY=292, chartW=660, chartH=136;
  els.push(R(C.bg, chartX, chartY, chartW, chartH, 8));
  els.push(R(C.faint, chartX, chartY+40, chartW, 1));
  els.push(T('1,840', chartX+chartW+4, chartY+34, 9, C.faint, {width:38}));

  const barCount = 20;
  const bw = Math.floor((chartW-32)/barCount)-2;
  const barCals = [1820,1650,1780,1900,1720,1840,1600,1750,1680,1810,1900,1750,1820,1660,1780,1840,1720,1900,1760,1240];
  for (let d=0; d<barCount; d++) {
    const bh = Math.round((barCals[d]/2100)*chartH);
    const bx = chartX+16+d*(bw+2);
    const isToday = d === 19;
    els.push(R(isToday ? C.forest : C.sage, bx, chartY+chartH-bh, bw, bh, 3));
    if (d%4===0) els.push(T(String(d+1), bx, chartY+chartH+4, 9, C.faint, {width:20}));
  }

  // Bottom two panels
  const b1X=MX, b1W=460, b2X=MX+476, b2W=W_D-MX-476-24, bY=466, bH=400;

  // Macro split
  els.push(R(C.card, b1X, bY, b1W, bH, 16));
  els.push(T('Monthly Macro Split', b1X+18, bY+18, 14, C.ink, {fontWeight:700, width:240}));
  const weeks = ['Week 1','Week 2','Week 3','Week 4'];
  weeks.forEach((wk, i) => {
    const wy = bY+56+i*66;
    els.push(T(wk, b1X+18, wy+4, 11, C.muted, {width:60}));
    const barsX = b1X+90;
    els.push(R(C.gold,  barsX,      wy, 162, 22, 11));
    els.push(R(C.terra, barsX+162,  wy, 108, 22, 0));
    els.push(R(C.sage,  barsX+270,  wy, 90,  22, 11));
    els.push(T('45%', barsX+8,   wy+6, 10, '#FFFFFF', {fontWeight:600, width:30}));
    els.push(T('30%', barsX+170, wy+6, 10, '#FFFFFF', {fontWeight:600, width:30}));
    els.push(T('25%', barsX+278, wy+6, 10, '#FFFFFF', {fontWeight:600, width:30}));
  });
  [{c:C.gold,l:'Carbohydrates'},{c:C.terra,l:'Protein'},{c:C.sage,l:'Fat'}].forEach((m, i) => {
    els.push(Circle(m.c, b1X+28+i*148, bY+bH-28, 6));
    els.push(T(m.l, b1X+40+i*148, bY+bH-36, 11, C.muted, {width:130}));
  });

  // Goal completion
  els.push(R(C.card, b2X, bY, b2W, bH, 16));
  els.push(T('Goal Completion', b2X+18, bY+18, 14, C.ink, {fontWeight:700, width:200}));
  els.push(T('March 2026', b2X+18, bY+40, 12, C.muted, {width:120}));

  const goalItems = [
    {label:'Hit Calorie Target',  pct:65, color:C.sage},
    {label:'Protein ≥ 100g',      pct:82, color:C.terra},
    {label:'Log All Meals',       pct:70, color:C.gold},
    {label:'Under Sodium Limit',  pct:78, color:C.forest},
    {label:'Hydration Goal',      pct:55, color:'#6BAED6'},
  ];
  goalItems.forEach((g, i) => {
    const gy = bY+66+i*58;
    els.push(T(g.label, b2X+18, gy, 13, C.ink, {fontWeight:500, width:200}));
    els.push(T(`${g.pct}%`, b2X+b2W-48, gy, 13, g.color, {fontWeight:700, width:36}));
    els.push(R(C.border, b2X+18, gy+22, b2W-36, 10, 5));
    els.push(R(g.color,  b2X+18, gy+22, Math.round((b2W-36)*(g.pct/100)), 10, 5));
  });

  els.push(R(C.sagePale, b2X+18, bY+bH-70, b2W-36, 52, 12));
  els.push(T('💡 Insight', b2X+32, bY+bH-58, 12, C.forest, {fontWeight:700, width:80}));
  els.push(T('You hit your protein goal on 82% of days — top 15% of users!', b2X+32, bY+bH-40, 11, C.mid, {width:b2W-60}));

  return els;
}

// ── Assemble & write ──────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  children: [
    makeScreen('mDashboard',  W_M, H_M, C.bg, mDashboard()),
    makeScreen('mLogMeal',    W_M, H_M, C.bg, mLogMeal()),
    makeScreen('mMealDetail', W_M, H_M, C.bg, mMealDetail()),
    makeScreen('mRecipes',    W_M, H_M, C.bg, mRecipes()),
    makeScreen('mProgress',   W_M, H_M, C.bg, mProgress()),
    makeScreen('dDashboard',  W_D, H_D, C.bg, dDashboard()),
    makeScreen('dMealLog',    W_D, H_D, C.bg, dMealLog()),
    makeScreen('dRecipes',    W_D, H_D, C.bg, dRecipes()),
    makeScreen('dAnalytics',  W_D, H_D, C.bg, dAnalytics()),
  ],
};

const outPath = path.join(__dirname, 'nourish.pen.json');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
const total = pen.children.reduce((s, sc) => s + sc.children.length, 0);
console.log(`✓ NOURISH pen written — ${pen.children.length} screens, ${total} elements`);
console.log(`  File: ${outPath}`);
