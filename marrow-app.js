'use strict';
// MARROW — Heartbeat #469 — Light theme
// Inspired by: minimal.gallery counter-movement
// Function Health + Studio Yoke: "type as structure, negative space as design element"
// Editorial minimal nutrition intelligence — warm cream palette, oversized display type

const fs   = require('fs');
const path = require('path');

const SLUG = 'marrow';
const W = 390, H = 844;

// Palette — warm cream light editorial
const C = {
  bg:      '#F8F5EF',   // warm cream
  surface: '#FFFFFF',
  card:    '#F2EDE3',   // slightly deeper cream
  text:    '#1A1510',   // near-black warm
  muted:   '#8A7E72',   // warm gray
  faint:   '#D8D0C4',   // very light warm gray
  accent:  '#4A7A46',   // forest green
  accent2: '#B87A3A',   // warm amber
  danger:  '#C4503A',   // terracotta
  white:   '#FFFFFF',
};

let elCount = 0;
function rect(x,y,w,h,fill,opts={}) {
  elCount++;
  return { type:'rect', x, y, w, h, fill,
    rx: opts.rx||0, opacity: opts.opacity!==undefined?opts.opacity:1,
    stroke: opts.stroke||'none', sw: opts.sw||0 };
}
function text(x,y,content,size,fill,opts={}) {
  elCount++;
  return { type:'text', x, y, content, size, fill,
    fw: opts.fw||400, font: opts.font||'Inter',
    anchor: opts.anchor||'start', ls: opts.ls||0,
    opacity: opts.opacity!==undefined?opts.opacity:1 };
}
function circle(cx,cy,r,fill,opts={}) {
  elCount++;
  return { type:'circle', cx, cy, r, fill,
    opacity: opts.opacity!==undefined?opts.opacity:1,
    stroke: opts.stroke||'none', sw: opts.sw||0 };
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  elCount++;
  return { type:'line', x1, y1, x2, y2, stroke,
    sw: opts.sw||1, opacity: opts.opacity!==undefined?opts.opacity:1 };
}
function arc(cx, cy, r, startDeg, endDeg, stroke, sw, opts={}) {
  // Approximated as polyline segments
  const segs = [];
  const steps = Math.max(8, Math.round(Math.abs(endDeg-startDeg)/6));
  const toRad = d => d * Math.PI / 180;
  for (let i = 0; i < steps; i++) {
    const a1 = toRad(startDeg + (endDeg-startDeg)*(i/steps));
    const a2 = toRad(startDeg + (endDeg-startDeg)*((i+1)/steps));
    segs.push(line(
      cx + r*Math.cos(a1), cy + r*Math.sin(a1),
      cx + r*Math.cos(a2), cy + r*Math.sin(a2),
      stroke, { sw, opacity: opts.opacity||1 }
    ));
  }
  return segs;
}

// ── STATUS BAR ──
function statusBar(y=0) {
  return [
    rect(0, y, W, 44, 'none'),
    text(20, y+28, '9:41', 13, C.text, { fw:600 }),
    text(W-20, y+28, '◼◼◼  ⬤', 12, C.muted, { anchor:'end' }),
  ];
}

// ── BOTTOM NAV ──
function bottomNav(activeIdx=0) {
  const items = [
    { icon:'◎', label:'Today' },
    { icon:'＋', label:'Log' },
    { icon:'◈', label:'Nutrients' },
    { icon:'◉', label:'Habits' },
    { icon:'◐', label:'Profile' },
  ];
  const y = H - 80;
  const els = [
    rect(0, y, W, 80, C.surface),
    line(0, y, W, y, C.faint, { sw:1 }),
  ];
  items.forEach((item, i) => {
    const x = (i+0.5) * (W/items.length);
    const isActive = i === activeIdx;
    els.push(text(x, y+26, item.icon, 18, isActive ? C.accent : C.muted, { anchor:'middle', fw: isActive?600:400 }));
    els.push(text(x, y+46, item.label, 9, isActive ? C.accent : C.muted, { anchor:'middle', fw: isActive?600:400 }));
    if (isActive) {
      els.push(rect(x-16, y+55, 32, 2, C.accent, { rx:1 }));
    }
  });
  return els;
}

// ═══════════════════════════════════════════════════════
// SCREEN 1: TODAY
// ═══════════════════════════════════════════════════════
function screen1() {
  const els = [];

  // Background
  els.push(rect(0, 0, W, H, C.bg));
  els.push(...statusBar(0));

  // Header
  els.push(text(20, 76, 'marrow', 16, C.text, { fw:300, ls:6 }));
  els.push(text(W-20, 76, 'Friday, Apr 11', 11, C.muted, { anchor:'end' }));

  // Divider
  els.push(line(20, 88, W-20, 88, C.faint, { sw:1 }));

  // HERO CALORIE DISPLAY — editorial oversized
  const cy = 190;
  els.push(text(W/2, cy-30, 'calories today', 11, C.muted, { anchor:'middle', ls:2 }));
  // Giant display number
  els.push(text(W/2, cy+50, '1,247', 76, C.text, { anchor:'middle', fw:200, font:'Inter' }));
  els.push(text(W/2, cy+80, '/ 1,800', 18, C.muted, { anchor:'middle', fw:300 }));

  // Progress arc background (track)
  const arcEls = arc(W/2, cy+30, 68, -100, 280, C.faint, 3);
  els.push(...arcEls);
  // Progress arc fill (~69% = 248 degrees of 380)
  const fillEls = arc(W/2, cy+30, 68, -100, 173, C.accent, 3, { opacity:1 });
  els.push(...fillEls);

  // Percentage label at end of arc
  els.push(circle(W/2 + 68*Math.cos(173*Math.PI/180), cy+30 + 68*Math.sin(173*Math.PI/180), 5, C.accent));

  // Macro pills row
  const macroY = cy + 110;
  const macros = [
    { label:'Protein', value:'82g', pct:68, color:C.accent },
    { label:'Carbs',   value:'145g',pct:72, color:C.accent2 },
    { label:'Fat',     value:'38g', pct:48, color:C.muted },
  ];
  macros.forEach((m, i) => {
    const px = 20 + i * 118;
    els.push(rect(px, macroY, 108, 52, C.surface, { rx:8 }));
    els.push(text(px+10, macroY+18, m.label, 9, C.muted, { ls:1 }));
    els.push(text(px+10, macroY+36, m.value, 18, C.text, { fw:500 }));
    // mini progress bar
    els.push(rect(px+8, macroY+44, 92, 3, C.faint, { rx:1 }));
    els.push(rect(px+8, macroY+44, 92*(m.pct/100), 3, m.color, { rx:1 }));
  });

  // Meals section
  const mealsY = macroY + 70;
  els.push(text(20, mealsY, 'today\'s meals', 10, C.muted, { ls:2 }));
  els.push(text(W-20, mealsY, 'see all', 10, C.accent, { anchor:'end' }));
  els.push(line(20, mealsY+8, W-20, mealsY+8, C.faint, { sw:1 }));

  const meals = [
    { time:'8:30 am', name:'Overnight oats + berries', cal:'312', icon:'○' },
    { time:'12:15 pm', name:'Grain bowl with tahini', cal:'580', icon:'◇' },
    { time:'3:40 pm', name:'Apple + almond butter', cal:'210', icon:'△' },
    { time:'—', name:'Dinner not logged', cal:'', icon:'·', muted:true },
  ];
  meals.forEach((meal, i) => {
    const my = mealsY + 18 + i*58;
    els.push(rect(0, my, W, 54, i%2===0?C.bg:C.bg, { opacity:1 }));
    // Icon badge
    els.push(rect(20, my+12, 30, 30, meal.muted?C.faint:C.card, { rx:6 }));
    els.push(text(35, my+32, meal.icon, 14, meal.muted?C.muted:C.accent2, { anchor:'middle' }));
    // Text
    els.push(text(62, my+22, meal.name, 13, meal.muted?C.muted:C.text, { fw:meal.muted?300:400 }));
    els.push(text(62, my+38, meal.time, 10, C.muted));
    if (meal.cal) {
      els.push(text(W-20, my+26, meal.cal, 13, C.text, { anchor:'end', fw:500 }));
      els.push(text(W-20, my+40, 'kcal', 9, C.muted, { anchor:'end' }));
    } else {
      els.push(text(W-20, my+32, '+', 16, C.faint, { anchor:'end', fw:300 }));
    }
    els.push(line(62, my+54, W-20, my+54, C.faint, { sw:0.5, opacity:0.6 }));
  });

  // Log CTA
  const btnY = H - 140;
  els.push(rect(20, btnY, W-40, 44, C.accent, { rx:22 }));
  els.push(text(W/2, btnY+28, 'Log food or meal', 13, C.white, { anchor:'middle', fw:500 }));

  els.push(...bottomNav(0));
  return els;
}

// ═══════════════════════════════════════════════════════
// SCREEN 2: LOG / FOOD SEARCH
// ═══════════════════════════════════════════════════════
function screen2() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  els.push(...statusBar(0));

  // Header
  els.push(text(20, 76, '←', 18, C.text, { fw:300 }));
  els.push(text(W/2, 76, 'Log Food', 16, C.text, { anchor:'middle', fw:500 }));

  // Meal time selector tabs
  const tabs = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];
  const tabY = 96;
  tabs.forEach((tab, i) => {
    const tx = 16 + i*92;
    const isActive = i === 1;
    els.push(rect(tx, tabY, 82, 28, isActive?C.accent:C.surface, { rx:14 }));
    els.push(text(tx+41, tabY+19, tab, 11, isActive?C.white:C.muted, { anchor:'middle', fw:isActive?600:400 }));
  });

  // Search bar
  const searchY = 140;
  els.push(rect(20, searchY, W-40, 44, C.surface, { rx:22, stroke:C.faint, sw:1 }));
  els.push(text(50, searchY+28, '⌕  Search foods, brands…', 13, C.muted));

  // Quick add labels
  els.push(text(20, 208, 'recent', 10, C.muted, { ls:2 }));

  // Recent foods list
  const foods = [
    { name:'Overnight oats (100g)',       cal:'356', prot:'12g', carbs:'58g', fat:'6g' },
    { name:'Oat milk, unsweetened (240ml)',cal:'90',  prot:'3g',  carbs:'16g', fat:'1.5g' },
    { name:'Banana, medium',              cal:'89',  prot:'1g',  carbs:'23g', fat:'0.3g' },
    { name:'Greek yogurt, plain (200g)',  cal:'140', prot:'20g', carbs:'8g',  fat:'3g' },
    { name:'Almond butter (2 tbsp)',      cal:'196', prot:'7g',  carbs:'6g',  fat:'18g' },
    { name:'Brown rice (150g cooked)',    cal:'216', prot:'5g',  carbs:'45g', fat:'1.6g' },
  ];
  foods.forEach((food, i) => {
    const fy = 222 + i*70;
    els.push(rect(20, fy, W-40, 62, C.surface, { rx:10 }));
    els.push(text(36, fy+22, food.name, 13, C.text, { fw:400 }));
    // Macro chips
    const chips = [
      { label: food.cal+'  kcal', color: C.muted },
      { label: 'P: '+food.prot, color: C.accent },
      { label: 'C: '+food.carbs, color: C.accent2 },
      { label: 'F: '+food.fat, color: C.muted },
    ];
    chips.forEach((chip, ci) => {
      els.push(text(36+ci*80, fy+40, chip.label, 10, chip.color));
    });
    // Add button
    els.push(circle(W-40, fy+32, 14, C.card));
    els.push(text(W-40, fy+37, '+', 18, C.accent, { anchor:'middle', fw:300 }));
    els.push(line(36, fy+62, W-36, fy+62, C.faint, { sw:0.5 }));
  });

  // Barcode scan button at bottom
  els.push(rect(20, H-130, W-40, 44, C.card, { rx:22, stroke:C.faint, sw:1 }));
  els.push(text(W/2, H-102, '⊞  Scan barcode', 13, C.text, { anchor:'middle' }));

  els.push(...bottomNav(1));
  return els;
}

// ═══════════════════════════════════════════════════════
// SCREEN 3: NUTRIENTS DETAIL
// ═══════════════════════════════════════════════════════
function screen3() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  els.push(...statusBar(0));

  // Header
  els.push(text(20, 76, 'nutrients', 16, C.text, { fw:300, ls:4 }));
  els.push(text(W-20, 76, 'Today ↓', 11, C.accent, { anchor:'end' }));

  // Score badge
  els.push(rect(20, 94, W-40, 72, C.surface, { rx:12 }));
  els.push(text(36, 120, 'nutrient score', 10, C.muted, { ls:1 }));
  els.push(text(36, 152, '73', 36, C.text, { fw:200 }));
  els.push(text(94, 152, '/ 100', 14, C.muted, { fw:300 }));
  // Score bar
  els.push(rect(180, 125, 170, 6, C.faint, { rx:3 }));
  els.push(rect(180, 125, 170*0.73, 6, C.accent, { rx:3 }));
  els.push(text(180, 118, 'Good', 10, C.muted));
  els.push(text(180, 145, 'Protein, fibre on track', 10, C.muted));
  els.push(text(180, 157, 'Low in Vitamin D, Iron', 10, C.danger));

  // Macros section
  els.push(text(20, 184, 'macronutrients', 10, C.muted, { ls:2 }));
  els.push(line(20, 192, W-20, 192, C.faint, { sw:1 }));

  const macros = [
    { name:'Protein',  current:82,  goal:120, unit:'g', color:C.accent },
    { name:'Carbs',    current:145, goal:200, unit:'g', color:C.accent2 },
    { name:'Fat',      current:38,  goal:65,  unit:'g', color:'#8A6A50' },
    { name:'Fibre',    current:18,  goal:25,  unit:'g', color:'#5A7A8A' },
    { name:'Calories', current:1247,goal:1800,unit:'kcal', color:C.text },
  ];
  macros.forEach((m, i) => {
    const my = 202 + i*62;
    els.push(text(20, my+18, m.name, 13, C.text, { fw:400 }));
    els.push(text(20, my+34, m.current+' '+m.unit, 11, C.muted));
    // goal
    els.push(text(W-20, my+18, m.goal+' '+m.unit+' goal', 10, C.muted, { anchor:'end' }));
    // bar
    const pct = Math.min(1, m.current/m.goal);
    els.push(rect(20, my+42, W-40, 5, C.faint, { rx:2 }));
    els.push(rect(20, my+42, (W-40)*pct, 5, m.color, { rx:2 }));
    els.push(line(20, my+54, W-20, my+54, C.faint, { sw:0.5, opacity:0.5 }));
  });

  // Vitamins & minerals
  const vitY = 202 + 5*62 + 12;
  els.push(text(20, vitY, 'vitamins & minerals', 10, C.muted, { ls:2 }));
  els.push(line(20, vitY+8, W-20, vitY+8, C.faint, { sw:1 }));

  const vits = [
    { name:'Vitamin C', pct:94 }, { name:'Iron', pct:42 },
    { name:'Vitamin D', pct:28 }, { name:'Calcium', pct:68 },
    { name:'Magnesium', pct:57 }, { name:'B12', pct:82 },
  ];
  vits.forEach((v, i) => {
    const row = Math.floor(i/2);
    const col = i%2;
    const vx = 20 + col*180;
    const vy = vitY+18 + row*42;
    const color = v.pct >= 70 ? C.accent : v.pct >= 50 ? C.accent2 : C.danger;
    els.push(text(vx, vy+12, v.name, 11, C.text));
    els.push(text(vx+130, vy+12, v.pct+'%', 11, color, { anchor:'end', fw:500 }));
    els.push(rect(vx, vy+18, 150, 4, C.faint, { rx:2 }));
    els.push(rect(vx, vy+18, 150*(v.pct/100), 4, color, { rx:2 }));
  });

  els.push(...bottomNav(2));
  return els;
}

// ═══════════════════════════════════════════════════════
// SCREEN 4: HABITS
// ═══════════════════════════════════════════════════════
function screen4() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  els.push(...statusBar(0));

  // Header
  els.push(text(20, 76, 'habits', 16, C.text, { fw:300, ls:4 }));
  els.push(text(W-20, 76, 'Apr 11', 11, C.muted, { anchor:'end' }));
  els.push(line(20, 88, W-20, 88, C.faint, { sw:1 }));

  // Water tracker
  els.push(rect(20, 100, W-40, 110, C.surface, { rx:12 }));
  els.push(text(36, 122, 'hydration', 10, C.muted, { ls:2 }));
  els.push(text(36, 148, '1.6 L', 28, C.text, { fw:200 }));
  els.push(text(36, 166, '/ 2.5 L goal', 11, C.muted));
  // Water cup icons row
  const cups = 8;
  const filled = 5; // ~62% of goal
  for (let i = 0; i < cups; i++) {
    const cx = 196 + i*22;
    const isFilled = i < filled;
    els.push(rect(cx, 118, 16, 20, isFilled?'#5A9AD4':'#E8E2D8', { rx:3 }));
    if (isFilled) els.push(rect(cx, 130, 16, 8, '#3A7AC4', { rx:2 }));
    els.push(text(cx+8, 152, isFilled?'◆':'◇', 7, isFilled?'#5A9AD4':C.faint, { anchor:'middle' }));
  }
  els.push(rect(196, 160, 180, 4, C.faint, { rx:2 }));
  els.push(rect(196, 160, 180*(1.6/2.5), 4, '#5A9AD4', { rx:2 }));
  els.push(text(36, 194, '+ Add glass', 11, '#5A9AD4'));

  // Movement
  els.push(rect(20, 222, W-40, 86, C.surface, { rx:12 }));
  els.push(text(36, 244, 'movement', 10, C.muted, { ls:2 }));
  els.push(text(36, 270, '4,280', 24, C.text, { fw:200 }));
  els.push(text(120, 270, 'steps', 11, C.muted));
  els.push(text(W-36, 244, '10k goal', 10, C.muted, { anchor:'end' }));
  // Steps bar
  els.push(rect(36, 278, W-72, 8, C.faint, { rx:4 }));
  els.push(rect(36, 278, (W-72)*0.428, 8, C.accent2, { rx:4 }));
  els.push(text(36, 298, '42% of daily goal · 0.8 km active walk logged', 10, C.muted));

  // Sleep quality
  els.push(rect(20, 320, W-40, 82, C.surface, { rx:12 }));
  els.push(text(36, 342, 'sleep last night', 10, C.muted, { ls:2 }));
  els.push(text(36, 370, '7h 14m', 24, C.text, { fw:200 }));
  els.push(text(W-36, 342, 'Quality: Good', 10, C.accent, { anchor:'end' }));
  const sleepBands = [
    { label:'Awake', w:12, color:'#D4C8B8' },
    { label:'Light', w:80, color:'#9ABCD4' },
    { label:'Deep',  w:55, color:'#4A7A8A' },
    { label:'REM',   w:62, color:'#6A5A9A' },
    { label:'Light', w:64, color:'#9ABCD4' },
    { label:'REM',   w:40, color:'#6A5A9A' },
  ];
  let bx = 36;
  sleepBands.forEach(b => {
    els.push(rect(bx, 374, b.w, 14, b.color, { rx:2 }));
    bx += b.w + 2;
  });
  els.push(text(36, 395, '10:45 pm                                  6:00 am', 8, C.muted));

  // Consistency grid title
  els.push(text(20, 418, 'this month', 10, C.muted, { ls:2 }));
  els.push(line(20, 426, W-20, 426, C.faint, { sw:1 }));

  // Habit rows
  const habits = ['Logged meals', 'Hit water goal', '8k+ steps', 'Slept 7h+'];
  const days = 11; // April days so far
  habits.forEach((habit, hi) => {
    const hy = 434 + hi*52;
    els.push(text(20, hy+16, habit, 12, C.text, { fw:400 }));
    // Dot matrix for days
    for (let d = 0; d < days; d++) {
      const dx = 20 + d*32;
      const hasHit = Math.random() > 0.3;
      // deterministic pseudo-random
      const hit = ((hi*7 + d*3 + 17) % 10) > 2;
      els.push(rect(dx, hy+22, 24, 18, hit?C.accent:'#E8E2D8', { rx:4, opacity:hit?0.9:1 }));
      els.push(text(dx+12, hy+35, hit?'✓':'·', 8, hit?C.white:C.faint, { anchor:'middle' }));
    }
  });

  // Streak badge
  const streakY = 434 + 4*52 + 10;
  els.push(rect(20, streakY, W-40, 48, C.card, { rx:10 }));
  els.push(text(36, streakY+22, '🔥', 18));
  els.push(text(64, streakY+22, '8-day logging streak', 13, C.text, { fw:500 }));
  els.push(text(64, streakY+38, 'Best: 21 days · Keep going!', 10, C.muted));

  els.push(...bottomNav(3));
  return els;
}

// ═══════════════════════════════════════════════════════
// SCREEN 5: INSIGHTS
// ═══════════════════════════════════════════════════════
function screen5() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  els.push(...statusBar(0));

  // Header — editorial, big
  els.push(text(20, 78, 'insights', 16, C.text, { fw:300, ls:4 }));
  els.push(text(W-20, 78, 'This week', 11, C.accent, { anchor:'end' }));
  els.push(line(20, 90, W-20, 90, C.faint, { sw:1 }));

  // Editorial headline insight
  els.push(rect(20, 100, W-40, 90, C.surface, { rx:12 }));
  els.push(text(36, 124, 'this week\'s story', 9, C.muted, { ls:2 }));
  // Big editorial number
  els.push(text(36, 162, '+23%', 38, C.accent, { fw:200 }));
  els.push(text(140, 162, 'more protein', 18, C.text, { fw:300 }));
  els.push(text(140, 182, 'than last week. Excellent.', 13, C.muted));

  // Calorie trend chart
  els.push(text(20, 210, 'calorie trend', 10, C.muted, { ls:2 }));
  const chartY = 222, chartH = 80, chartW = W-40;
  const days = ['M','T','W','T','F','S','S'];
  const cals = [1680, 1920, 1540, 1820, 1450, 1620, 1247];
  const maxC = 2200, minC = 1200;
  const barW = (chartW/7) - 6;

  // Goal line
  const goalPct = (1800-minC)/(maxC-minC);
  const goalY = chartY + chartH - (goalPct * chartH);
  els.push(line(20, goalY, W-20, goalY, C.muted, { sw:1, opacity:0.3 }));
  els.push(text(W-20, goalY-4, 'goal', 8, C.muted, { anchor:'end', opacity:0.6 }));

  cals.forEach((cal, i) => {
    const pct = (cal-minC)/(maxC-minC);
    const bh = pct * chartH;
    const bx = 20 + i*(chartW/7) + 3;
    const by = chartY + chartH - bh;
    const isToday = i === 6;
    const overGoal = cal > 1800;
    const color = isToday ? C.accent : overGoal ? C.accent2 : C.faint;
    els.push(rect(bx, by, barW, bh, color, { rx:3, opacity: isToday?1:0.7 }));
    els.push(text(bx+barW/2, chartY+chartH+14, days[i], 9, isToday?C.text:C.muted, { anchor:'middle', fw:isToday?600:400 }));
    // Value above bar for today
    if (isToday) els.push(text(bx+barW/2, by-4, cal+'', 8, C.accent, { anchor:'middle', fw:600 }));
  });
  els.push(rect(20, chartY+chartH, chartW, 1, C.faint));

  // Stats cards row
  const statsY = chartY + chartH + 30;
  const stats = [
    { label:'Avg daily', value:'1,642', unit:'kcal', color:C.text },
    { label:'Best day',  value:'Tue',   unit:'nutrients', color:C.accent },
    { label:'Deficit',   value:'158',   unit:'kcal avg', color:C.accent2 },
  ];
  stats.forEach((s, i) => {
    const sx = 20 + i*118;
    els.push(rect(sx, statsY, 108, 60, C.surface, { rx:8 }));
    els.push(text(sx+10, statsY+18, s.label, 9, C.muted));
    els.push(text(sx+10, statsY+42, s.value, 22, s.color, { fw:300 }));
    els.push(text(sx+10, statsY+56, s.unit, 9, C.muted));
  });

  // Nutrient gaps section
  const gapY = statsY + 74;
  els.push(text(20, gapY, 'nutrient gaps to watch', 10, C.muted, { ls:2 }));
  els.push(line(20, gapY+8, W-20, gapY+8, C.faint, { sw:1 }));

  const gaps = [
    { name:'Vitamin D', gap:'Very low', msg:'Try: oily fish, eggs, sunlight', color:C.danger },
    { name:'Iron', gap:'Below goal', msg:'Try: legumes, leafy greens, seeds', color:C.accent2 },
    { name:'Omega-3', gap:'Low', msg:'Try: walnuts, flaxseed, salmon', color:'#5A7A8A' },
  ];
  gaps.forEach((g, i) => {
    const gy = gapY+18 + i*68;
    els.push(rect(20, gy, W-40, 60, C.surface, { rx:10 }));
    els.push(rect(20, gy, 4, 60, g.color, { rx:2 }));
    els.push(text(34, gy+20, g.name, 13, C.text, { fw:500 }));
    els.push(rect(W-80, gy+6, 56, 20, g.color+'22', { rx:10 }));
    els.push(text(W-52, gy+20, g.gap, 9, g.color, { anchor:'middle', fw:600 }));
    els.push(text(34, gy+38, g.msg, 11, C.muted));
  });

  els.push(...bottomNav(4));
  return els;
}

// ═══════════════════════════════════════════════════════
// SCREEN 6: PROFILE
// ═══════════════════════════════════════════════════════
function screen6() {
  const els = [];
  els.push(rect(0, 0, W, H, C.bg));
  els.push(...statusBar(0));

  // Header
  els.push(text(20, 76, 'profile', 16, C.text, { fw:300, ls:4 }));
  els.push(text(W-20, 76, '⚙', 18, C.muted, { anchor:'end' }));
  els.push(line(20, 88, W-20, 88, C.faint, { sw:1 }));

  // Avatar + name
  circle(W/2, 148, 44, C.card);
  els.push(circle(W/2, 148, 44, C.card));
  els.push(text(W/2, 154, '◑', 38, C.accent, { anchor:'middle' }));
  els.push(text(W/2, 214, 'Alex Mercer', 18, C.text, { anchor:'middle', fw:400 }));
  els.push(text(W/2, 232, 'Maintaining · 1,800 kcal / day', 11, C.muted, { anchor:'middle' }));

  // Stats row
  const sY = 252;
  const pStats = [
    { label:'Logged', value:'38', unit:'days' },
    { label:'Streak', value:'8', unit:'days' },
    { label:'Avg score', value:'71', unit:'/ 100' },
  ];
  pStats.forEach((s, i) => {
    const sx = 20 + i*120;
    els.push(rect(sx, sY, 110, 64, C.surface, { rx:10 }));
    els.push(text(sx+55, sY+32, s.value, 26, C.text, { anchor:'middle', fw:200 }));
    els.push(text(sx+55, sY+48, s.unit, 9, C.muted, { anchor:'middle' }));
    els.push(text(sx+55, sY+60, s.label, 9, C.muted, { anchor:'middle' }));
  });

  // Goals section
  const goalsY = sY + 80;
  els.push(text(20, goalsY, 'my goals', 10, C.muted, { ls:2 }));
  els.push(line(20, goalsY+8, W-20, goalsY+8, C.faint, { sw:1 }));

  const goals = [
    { icon:'◎', label:'Daily calories', value:'1,800 kcal' },
    { icon:'◆', label:'Protein target', value:'120g / day' },
    { icon:'◈', label:'Water intake', value:'2.5 L / day' },
    { icon:'◉', label:'Daily steps', value:'10,000 steps' },
  ];
  goals.forEach((g, i) => {
    const gy = goalsY+18 + i*54;
    els.push(rect(20, gy+2, W-40, 46, C.surface, { rx:8 }));
    els.push(text(36, gy+28, g.icon, 14, C.accent, { anchor:'middle' }));
    els.push(text(54, gy+24, g.label, 13, C.text));
    els.push(text(W-20, gy+24, g.value, 12, C.muted, { anchor:'end' }));
    els.push(text(W-20, gy+38, 'edit ›', 9, C.accent, { anchor:'end' }));
    els.push(line(54, gy+48, W-36, gy+48, C.faint, { sw:0.5, opacity:0.5 }));
  });

  // Settings items
  const setY = goalsY+18 + 4*54 + 12;
  els.push(text(20, setY, 'account', 10, C.muted, { ls:2 }));
  els.push(line(20, setY+8, W-20, setY+8, C.faint, { sw:1 }));
  const settingsItems = ['Connected apps', 'Notifications', 'Data & privacy', 'Log out'];
  settingsItems.forEach((s, i) => {
    const sy = setY+18 + i*46;
    els.push(text(20, sy+16, s, 13, i===3?C.danger:C.text));
    els.push(text(W-20, sy+16, i<3?'›':'', 14, C.muted, { anchor:'end' }));
    if (i<3) els.push(line(20, sy+28, W-20, sy+28, C.faint, { sw:0.5, opacity:0.5 }));
  });

  els.push(...bottomNav(4));
  return els;
}

// ── BUILD PEN ──
const screens = [
  { name:'Today',     els: screen1() },
  { name:'Log Food',  els: screen2() },
  { name:'Nutrients', els: screen3() },
  { name:'Habits',    els: screen4() },
  { name:'Insights',  els: screen5() },
  { name:'Profile',   els: screen6() },
];

// Flatten arcs (arrays within arrays)
screens.forEach(s => {
  s.els = s.els.flat(Infinity);
});

const totalEls = screens.reduce((n,s)=>n+s.els.length,0);

// Generate SVG for each screen
function toSvg(elements, w, h, bg) {
  let shapes = '';
  elements.forEach(el => {
    if (!el || !el.type) return;
    const op = el.opacity !== undefined ? el.opacity : 1;
    if (el.type === 'rect') {
      shapes += `<rect x="${el.x.toFixed(1)}" y="${el.y.toFixed(1)}" width="${el.w.toFixed(1)}" height="${el.h.toFixed(1)}" fill="${el.fill}" rx="${el.rx||0}" opacity="${op}"${el.stroke&&el.stroke!=='none'?` stroke="${el.stroke}" stroke-width="${el.sw||1}"`:''}/>`;
    } else if (el.type === 'text') {
      const anchor = el.anchor||'start';
      shapes += `<text x="${el.x.toFixed(1)}" y="${el.y.toFixed(1)}" font-size="${el.size}" fill="${el.fill}" font-weight="${el.fw||400}" font-family="${el.font||'Inter,sans-serif'}" text-anchor="${anchor}" opacity="${op}" letter-spacing="${el.ls||0}">${el.content}</text>`;
    } else if (el.type === 'circle') {
      shapes += `<circle cx="${el.cx.toFixed(1)}" cy="${el.cy.toFixed(1)}" r="${el.r}" fill="${el.fill}" opacity="${op}"${el.stroke&&el.stroke!=='none'?` stroke="${el.stroke}" stroke-width="${el.sw||1}"`:''}/>`;
    } else if (el.type === 'line') {
      shapes += `<line x1="${el.x1.toFixed(1)}" y1="${el.y1.toFixed(1)}" x2="${el.x2.toFixed(1)}" y2="${el.y2.toFixed(1)}" stroke="${el.stroke}" stroke-width="${el.sw||1}" opacity="${op}"/>`;
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="${bg}"/>${shapes}</svg>`;
}

const pen = {
  version: '2.8',
  metadata: {
    name: 'MARROW',
    tagline: 'nourish from within',
    author: 'RAM',
    date: new Date().toISOString().slice(0,10),
    theme: 'light',
    heartbeat: 469,
    archetype: 'wellness-nutrition',
    elements: totalEls,
    inspiration: 'minimal.gallery — Function Health, Studio Yoke editorial counter-movement',
    palette: {
      bg: C.bg, surface: C.surface, text: C.text,
      accent: C.accent, accent2: C.accent2, muted: C.muted,
    },
  },
  screens: screens.map(s => ({
    name: s.name,
    svg:  toSvg(s.els, W, H, C.bg),
    elements: s.els,
  })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`MARROW: ${screens.length} screens, ${totalEls} elements`);
console.log(`Written: ${SLUG}.pen`);
