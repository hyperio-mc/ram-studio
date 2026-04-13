'use strict';
/**
 * BRAE — Local Harvest Companion
 * Heartbeat: Light theme
 * Inspired by: warm earth/nature palettes from Land-book 2025,
 * bento grid feature layouts from Saaspo, editorial serif typography
 * from Minimal Gallery.
 *
 * Palette:
 *   BG:      #FAF7F0  warm parchment
 *   SURF:    #FFFFFF  card white
 *   CARD:    #F3EDE0  warm tan
 *   TXT:     #1C2B1C  deep forest text
 *   MUTED:   #6B7C6B  sage grey
 *   ACC:     #3D6B44  forest green
 *   ACC2:    #C17A42  clay/terracotta
 *   LINE:    #D8CEBA  warm divider
 */

const fs   = require('fs');
const path = require('path');

const SLUG    = 'brae';
const W = 390, H = 844;

// ── palette ──────────────────────────────────────────────────────────────────
const BG    = '#FAF7F0';
const SURF  = '#FFFFFF';
const CARD  = '#F3EDE0';
const TXT   = '#1C2B1C';
const MUTED = '#6B7C6B';
const ACC   = '#3D6B44';
const ACC2  = '#C17A42';
const LINE  = '#D8CEBA';
const ACC_L = '#EBF3EC';  // light tint of ACC
const ACC2_L= '#FAF0E6';  // light tint of ACC2
const WHITE = '#FFFFFF';
const TAG_BG= '#EDF4EE';
const RED   = '#C94F4F';

// ── helpers ───────────────────────────────────────────────────────────────────
function rect(x,y,w,h,fill,opts={}) {
  return { type:'rect', x,y,w,h, fill,
    rx: opts.rx||0, opacity: opts.opacity!==undefined?opts.opacity:1,
    stroke: opts.stroke||'none', strokeWidth: opts.sw||0 };
}
function text(x,y,content,size,fill,opts={}) {
  return { type:'text', x,y, content, fontSize:size, fill,
    fontWeight: opts.fw||'normal',
    fontFamily: opts.font||'Georgia, serif',
    textAnchor: opts.anchor||'start',
    letterSpacing: opts.ls||'0',
    opacity: opts.opacity!==undefined?opts.opacity:1 };
}
function circle(cx,cy,r,fill,opts={}) {
  return { type:'circle', cx,cy,r, fill,
    opacity: opts.opacity!==undefined?opts.opacity:1,
    stroke: opts.stroke||'none', strokeWidth: opts.sw||0 };
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  return { type:'line', x1,y1,x2,y2, stroke,
    strokeWidth: opts.sw||1, opacity: opts.opacity!==undefined?opts.opacity:1 };
}
// pill / tag
function pill(x,y,w,h,fill,label,labelColor,size=10) {
  return [
    rect(x,y,w,h,fill,{rx:h/2}),
    text(x+w/2, y+h/2+size*0.36, label, size, labelColor, {fw:'600', anchor:'middle', font:'Inter, sans-serif'})
  ];
}
// rounded card
function card(x,y,w,h,fill,opts={}) {
  return rect(x,y,w,h,fill,{rx:opts.rx||12, opacity:opts.opacity||1, stroke:opts.stroke||'none', sw:opts.sw||0});
}
// icon glyph (simple SVG path strings embedded as text via Unicode approximations)
// We'll use emoji-style single chars as icon proxies
function icon(x,y,glyph,size,fill) {
  return text(x,y,glyph,size,fill,{fw:'normal',font:'Arial, sans-serif',anchor:'middle'});
}
// horizontal rule
function hr(y) { return line(20,y,370,y,LINE,{sw:1,opacity:0.6}); }
// section label
function sectionLabel(y,label) {
  return text(20,y,label.toUpperCase(),9,MUTED,{fw:'700',font:'Inter, sans-serif',ls:'0.08em'});
}
// bento card
function bentoCard(x,y,w,h,fill,opts={}) {
  return rect(x,y,w,h,fill,{rx:opts.rx||14, stroke:opts.stroke||LINE, sw:opts.sw||1});
}

// ── STATUS BAR ────────────────────────────────────────────────────────────────
function statusBar() {
  return [
    rect(0,0,W,44,BG),
    text(20, 30, '9:41', 13, TXT, {fw:'600', font:'Inter, sans-serif'}),
    text(370, 30, '●●● ▲ 🔋', 11, TXT, {fw:'400', font:'Inter, sans-serif', anchor:'end'}),
  ];
}

// ── NAV BAR ───────────────────────────────────────────────────────────────────
function navBar(active) {
  const items = [
    { id:'home',   glyph:'⌂', label:'Harvest' },
    { id:'farms',  glyph:'◈', label:'Farms' },
    { id:'box',    glyph:'▣', label:'Box' },
    { id:'recipes',glyph:'✦', label:'Recipes' },
    { id:'profile',glyph:'◉', label:'Me' },
  ];
  const els = [
    rect(0, H-80, W, 80, SURF, {rx:0, stroke:LINE, sw:0.5}),
  ];
  items.forEach((it, i) => {
    const x = 39 + i*62;
    const col = it.id===active ? ACC : MUTED;
    const fw  = it.id===active ? '700' : '400';
    els.push(text(x, H-50, it.glyph, 18, col, {anchor:'middle', font:'Arial, sans-serif', fw}));
    els.push(text(x, H-30, it.label, 9,  col, {anchor:'middle', font:'Inter, sans-serif', fw}));
    if (it.id===active) {
      els.push(rect(x-14,H-79,28,3,ACC,{rx:1.5}));
    }
  });
  return els;
}

// ── SCREEN 1: HOME / HARVEST DASHBOARD ───────────────────────────────────────
function screen1() {
  const els = [];

  // bg
  els.push(rect(0,0,W,H,BG));
  els.push(...statusBar());

  // header
  els.push(text(20, 72, 'Brae', 26, TXT, {fw:'700', font:'Georgia, serif'}));
  els.push(text(20, 90, 'Your local harvest, this week', 12, MUTED, {fw:'400', font:'Inter, sans-serif'}));
  // avatar
  els.push(circle(358, 74, 18, ACC_L));
  els.push(text(358, 79, '🌿', 13, ACC, {anchor:'middle', font:'Arial'}));

  // ── hero bento card — week summary ─────────────────────────────────────────
  els.push(card(16, 102, W-32, 130, CARD, {rx:18}));
  // farm tag
  els.push(...pill(28, 114, 90, 22, ACC_L, '🌾 Week 18', ACC, 10));
  // big number
  els.push(text(28, 158, '7', 52, TXT, {fw:'700', font:'Georgia, serif'}));
  els.push(text(62, 158, 'items', 16, MUTED, {fw:'400', font:'Inter, sans-serif'}));
  // detail line
  els.push(text(28, 175, 'from 2 farms · delivery Thursday', 11, MUTED, {fw:'400', font:'Inter, sans-serif'}));
  // progress bar
  els.push(rect(28, 188, 220, 6, LINE, {rx:3}));
  els.push(rect(28, 188, 155, 6, ACC,  {rx:3}));
  els.push(text(258, 194, '5 of 7 confirmed', 10, MUTED, {fw:'400', font:'Inter, sans-serif'}));
  // pickup tag
  els.push(...pill(W-32-80, 114, 78, 22, ACC2_L, '⏱ 3 days', ACC2, 10));

  // ── bento 2-col row ────────────────────────────────────────────────────────
  const B2Y = 242;
  // left bento: farm count
  els.push(bentoCard(16, B2Y, 116, 96, SURF, {rx:14}));
  els.push(text(28, B2Y+22, '◈', 18, ACC, {anchor:'start', font:'Arial'}));
  els.push(text(28, B2Y+52, '2', 28, TXT, {fw:'700', font:'Georgia, serif'}));
  els.push(text(28, B2Y+68, 'Active farms', 10, MUTED, {font:'Inter, sans-serif'}));

  // mid bento: seasonal score
  els.push(bentoCard(140, B2Y, 116, 96, SURF, {rx:14}));
  els.push(text(152, B2Y+22, '✦', 18, ACC2, {anchor:'start', font:'Arial'}));
  els.push(text(152, B2Y+52, '94%', 24, TXT, {fw:'700', font:'Georgia, serif'}));
  els.push(text(152, B2Y+68, 'Seasonal match', 10, MUTED, {font:'Inter, sans-serif'}));

  // right bento: carbon saved
  els.push(bentoCard(264, B2Y, 110, 96, ACC, {rx:14, stroke:'none'}));
  els.push(text(276, B2Y+22, '🌍', 16, WHITE, {anchor:'start', font:'Arial'}));
  els.push(text(276, B2Y+52, '1.2kg', 22, WHITE, {fw:'700', font:'Georgia, serif'}));
  els.push(text(276, B2Y+68, 'CO₂ saved', 10, 'rgba(255,255,255,0.75)', {font:'Inter, sans-serif'}));

  // ── This week's highlights ──────────────────────────────────────────────────
  els.push(sectionLabel(358, "This week's box"));
  const produce = [
    { name:'Rainbow Chard', farm:'Foxhollow Farm', icon:'🥬', tag:'Greens' },
    { name:'Celeriac',      farm:'Stonebury Hill', icon:'🫚', tag:'Root veg' },
    { name:'Beef Tomatoes', farm:'Foxhollow Farm', icon:'🍅', tag:'Nightshade' },
  ];
  produce.forEach((p, i) => {
    const py = 372 + i*76;
    els.push(card(16, py, W-32, 66, SURF, {rx:12}));
    els.push(circle(52, py+33, 20, CARD));
    els.push(text(52, py+38, p.icon, 16, TXT, {anchor:'middle', font:'Arial'}));
    els.push(text(82, py+22, p.name, 14, TXT, {fw:'600', font:'Inter, sans-serif'}));
    els.push(text(82, py+38, p.farm, 10, MUTED, {fw:'400', font:'Inter, sans-serif'}));
    els.push(...pill(W-32-52, py+12, 48, 18, TAG_BG, p.tag, ACC, 9));
  });

  els.push(...navBar('home'));
  return els;
}

// ── SCREEN 2: MY FARMS ────────────────────────────────────────────────────────
function screen2() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  els.push(...statusBar());

  // header
  els.push(text(20, 72, 'My Farms', 24, TXT, {fw:'700', font:'Georgia, serif'}));
  els.push(text(20, 90, 'Subscriptions & deliveries', 12, MUTED, {fw:'400', font:'Inter, sans-serif'}));

  const farms = [
    {
      name: 'Foxhollow Farm',
      loc:  'Somerset, 12 miles',
      sub:  'Weekly veg box · £18/wk',
      since:'Member since 2023',
      acc:  true,
      icon: '🌾',
      items: ['Chard','Courgette','Tomatoes','Parsnip','Lettuce'],
      rating: 4.9,
      del: 'Thu',
    },
    {
      name: 'Stonebury Hill',
      loc:  'Devon, 34 miles',
      sub:  'Biweekly roots · £12/box',
      since:'Member since 2024',
      acc:  false,
      icon: '🥕',
      items: ['Celeriac','Beetroot','Swede','Turnip'],
      rating: 4.7,
      del: 'Alt. Mon',
    },
  ];

  farms.forEach((farm, i) => {
    const fy = 108 + i*230;
    // large card
    els.push(bentoCard(16, fy, W-32, 220, SURF, {rx:18, stroke:LINE, sw:1}));
    // header stripe
    els.push(rect(16, fy, W-32, 52, farm.acc ? ACC : CARD, {rx:0}));
    els.push(rect(16, fy, W-32, 52, farm.acc ? ACC : CARD, {rx:18}));
    els.push(rect(16, fy+38, W-32, 14, farm.acc ? ACC : CARD)); // flatten bottom of header
    // farm icon
    els.push(circle(48, fy+26, 18, farm.acc ? 'rgba(255,255,255,0.2)' : LINE));
    els.push(text(48, fy+31, farm.icon, 16, farm.acc ? WHITE : TXT, {anchor:'middle', font:'Arial'}));
    // name
    els.push(text(74, fy+20, farm.name, 14, farm.acc ? WHITE : TXT, {fw:'700', font:'Inter, sans-serif'}));
    els.push(text(74, fy+36, farm.loc, 10, farm.acc ? 'rgba(255,255,255,0.75)' : MUTED, {font:'Inter, sans-serif'}));
    // active badge
    els.push(...pill(W-32-62, fy+14, 58, 20, farm.acc ? 'rgba(255,255,255,0.2)' : TAG_BG,
      farm.acc ? '✓ Active' : '◌ Paused', farm.acc ? WHITE : ACC, 9));

    // body
    els.push(text(28, fy+72, farm.sub,   12, TXT,   {fw:'600', font:'Inter, sans-serif'}));
    els.push(text(28, fy+88, farm.since, 10, MUTED, {fw:'400', font:'Inter, sans-serif'}));
    // divider
    els.push(hr(fy+100));
    // produce tags row
    els.push(text(28, fy+118, 'This season:', 9, MUTED, {font:'Inter, sans-serif', fw:'500'}));
    farm.items.forEach((item, j) => {
      els.push(...pill(28 + j*62, fy+128, 56, 18, TAG_BG, item, ACC, 8));
    });
    // stats row
    els.push(hr(fy+156));
    // delivery day
    els.push(text(28,  fy+174, '🚛', 13, TXT, {font:'Arial', anchor:'start'}));
    els.push(text(48,  fy+174, `Delivery: ${farm.del}`, 11, TXT, {fw:'500', font:'Inter, sans-serif'}));
    // rating
    els.push(text(220, fy+174, '★', 12, ACC2, {font:'Arial', anchor:'start'}));
    els.push(text(234, fy+174, `${farm.rating}`, 11, TXT, {fw:'600', font:'Inter, sans-serif'}));
    els.push(text(252, fy+174, '/ 5.0', 10, MUTED, {font:'Inter, sans-serif'}));
    // CTA
    els.push(rect(28, fy+186, W-72, 26, farm.acc ? ACC_L : CARD, {rx:8}));
    els.push(text(W/2, fy+203, farm.acc ? 'Manage subscription →' : 'Resume deliveries', 11,
      farm.acc ? ACC : MUTED, {fw:'600', anchor:'middle', font:'Inter, sans-serif'}));
  });

  els.push(...navBar('farms'));
  return els;
}

// ── SCREEN 3: THIS WEEK'S BOX ─────────────────────────────────────────────────
function screen3() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  els.push(...statusBar());

  // header
  els.push(text(20, 72, "This Week's Box", 22, TXT, {fw:'700', font:'Georgia, serif'}));
  els.push(text(20, 90, 'Week 18 · 7 items · arriving Thursday', 11, MUTED, {font:'Inter, sans-serif'}));

  // progress / freshness strip
  els.push(card(16, 100, W-32, 52, CARD, {rx:12}));
  const steps = ['Picked','Packed','Transit','Delivering'];
  const stepW = (W-52) / steps.length;
  steps.forEach((s, i) => {
    const sx = 28 + i * stepW + stepW/2;
    const done = i < 3;
    els.push(circle(sx, 118, 7, done ? ACC : LINE));
    if (i < steps.length-1) {
      els.push(line(sx+7, 118, sx+stepW-7, 118, done ? ACC : LINE, {sw:2}));
    }
    els.push(text(sx, 138, s, 8, done ? ACC : MUTED, {anchor:'middle', font:'Inter, sans-serif', fw: done?'600':'400'}));
  });

  // produce list
  const items = [
    { name:'Rainbow Chard',    farm:'Foxhollow', qty:'1 bunch',  note:'Wilt quickly — use first', icon:'🥬', fresh:true  },
    { name:'Beef Tomatoes',    farm:'Foxhollow', qty:'500g',     note:'Vine ripened on farm',      icon:'🍅', fresh:true  },
    { name:'Celeriac',         farm:'Stonebury', qty:'1 large',  note:'Keeps 2–3 weeks',           icon:'🫚', fresh:false },
    { name:'Kale',             farm:'Foxhollow', qty:'200g',     note:'Massaged salads or sauté',  icon:'🌿', fresh:true  },
    { name:'Butternut Squash', farm:'Stonebury', qty:'1 whole',  note:'Roast at 200°C 40 min',    icon:'🎃', fresh:false },
    { name:'Charlotte Pots',   farm:'Foxhollow', qty:'750g',     note:'Waxy — best boiled',        icon:'🥔', fresh:false },
    { name:'Leek',             farm:'Foxhollow', qty:'2 stalks', note:'Good in soups & gratins',   icon:'🫛', fresh:false },
  ];

  items.forEach((it, i) => {
    const iy = 162 + i*74;
    if (iy + 74 > H-82) return;
    els.push(card(16, iy, W-32, 66, SURF, {rx:12}));
    // icon circle
    els.push(circle(48, iy+33, 20, it.fresh ? ACC_L : CARD));
    els.push(text(48, iy+39, it.icon, 15, TXT, {anchor:'middle', font:'Arial'}));
    // use-soon indicator
    if (it.fresh) {
      els.push(circle(62, iy+16, 5, ACC2));
    }
    // name + farm
    els.push(text(80, iy+22, it.name, 13, TXT, {fw:'600', font:'Inter, sans-serif'}));
    els.push(text(80, iy+36, it.farm + ' · ' + it.qty, 10, MUTED, {font:'Inter, sans-serif'}));
    // note
    els.push(text(80, iy+50, it.note, 10, MUTED, {font:'Inter, sans-serif', opacity:0.8}));
    // recipe arrow
    els.push(text(W-28, iy+33, '→', 14, ACC, {anchor:'end', font:'Georgia, serif', fw:'700'}));
  });

  // bottom note
  els.push(text(W/2, H-92, '+ 2 more items below', 10, MUTED, {anchor:'middle', font:'Inter, sans-serif'}));

  els.push(...navBar('box'));
  return els;
}

// ── SCREEN 4: SEASONAL RECIPES ────────────────────────────────────────────────
function screen4() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  els.push(...statusBar());

  // header
  els.push(text(20, 72, 'Recipes', 24, TXT, {fw:'700', font:'Georgia, serif'}));
  els.push(text(20, 90, 'Made for your box · Week 18', 12, MUTED, {font:'Inter, sans-serif'}));

  // filter pills row
  const filters = ['All', 'Quick', 'Veggie', 'Batch cook'];
  filters.forEach((f, i) => {
    const fw = i === 0 ? 340 : 80;
    const fx = 16 + [0,78,144,220][i];
    const active = i===0;
    els.push(...pill(fx, 104, [54,58,54,88][i], 26, active?ACC:CARD, f, active?WHITE:MUTED, 10));
  });

  // featured recipe
  els.push(bentoCard(16, 140, W-32, 162, CARD, {rx:16, stroke:'none'}));
  // decorative block
  els.push(rect(16, 140, W-32, 90, ACC, {rx:16}));
  els.push(rect(16, 210, W-32, 20, ACC));  // flatten bottom edge
  els.push(text(W/2, 172, '🍅', 34, WHITE, {anchor:'middle', font:'Arial'}));
  els.push(text(W/2, 206, 'Featured', 9, 'rgba(255,255,255,0.7)', {anchor:'middle', font:'Inter, sans-serif', fw:'600', ls:'0.06em'}));
  els.push(text(28, 234, 'Roasted Tomato & Chard Tart', 15, TXT, {fw:'700', font:'Georgia, serif'}));
  els.push(text(28, 250, 'Uses: Beef Tomatoes, Rainbow Chard, Leek', 10, MUTED, {font:'Inter, sans-serif'}));
  // stats
  els.push(text(28, 272, '⏱ 45 min', 10, ACC2, {font:'Inter, sans-serif', fw:'600'}));
  els.push(text(96, 272, '·  Easy  ·', 10, MUTED, {font:'Inter, sans-serif'}));
  els.push(text(130, 272, '4 servings', 10, MUTED, {font:'Inter, sans-serif'}));
  els.push(text(W-28, 272, 'View recipe →', 10, ACC, {anchor:'end', font:'Inter, sans-serif', fw:'600'}));

  // recipe card list
  const recipes = [
    { name:'Celeriac Remoulade',       time:'15 min', uses:['Celeriac'],      diff:'Easy',   icon:'🫚' },
    { name:'Kale & Potato Soup',       time:'35 min', uses:['Kale','Pots'],   diff:'Easy',   icon:'🌿' },
    { name:'Butternut & Sage Risotto', time:'50 min', uses:['Squash'],        diff:'Medium', icon:'🎃' },
  ];

  recipes.forEach((r, i) => {
    const ry = 314 + i*84;
    els.push(card(16, ry, W-32, 74, SURF, {rx:12}));
    els.push(circle(48, ry+37, 22, CARD));
    els.push(text(48, ry+43, r.icon, 17, TXT, {anchor:'middle', font:'Arial'}));
    els.push(text(80, ry+26, r.name, 13, TXT, {fw:'600', font:'Inter, sans-serif'}));
    els.push(text(80, ry+42, 'Uses: ' + r.uses.join(', '), 10, ACC, {font:'Inter, sans-serif', fw:'500'}));
    els.push(text(80, ry+56, `⏱ ${r.time}  ·  ${r.diff}`, 9, MUTED, {font:'Inter, sans-serif'}));
    els.push(text(W-28, ry+37, '→', 14, ACC, {anchor:'end', font:'Georgia, serif', fw:'700'}));
  });

  els.push(...navBar('recipes'));
  return els;
}

// ── SCREEN 5: DELIVERY SCHEDULE ───────────────────────────────────────────────
function screen5() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  els.push(...statusBar());

  els.push(text(20, 72, 'Schedule', 22, TXT, {fw:'700', font:'Georgia, serif'}));
  els.push(text(20, 90, 'April 2026 · Upcoming deliveries', 12, MUTED, {font:'Inter, sans-serif'}));

  // month header
  els.push(card(16, 100, W-32, 40, CARD, {rx:10}));
  els.push(text(28, 126, '← March', 11, MUTED, {font:'Inter, sans-serif', fw:'500'}));
  els.push(text(W/2, 126, 'April 2026', 13, TXT, {anchor:'middle', font:'Georgia, serif', fw:'700'}));
  els.push(text(W-28, 126, 'May →', 11, MUTED, {anchor:'end', font:'Inter, sans-serif', fw:'500'}));

  // calendar grid (day labels)
  const days = ['M','T','W','T','F','S','S'];
  const cellW = (W-32) / 7;
  days.forEach((d, i) => {
    els.push(text(28 + i*cellW + cellW/2, 158, d, 10, MUTED, {anchor:'middle', font:'Inter, sans-serif', fw:'600'}));
  });
  // grid lines
  els.push(hr(162));

  // April 2026 starts Wednesday (day index 2)
  const deliveryDays = [17, 24, 13]; // Thu 16 = week18, Mon 20 = stonebury, Thu 23 = week19
  const deliveries = {
    17: {farm:'Foxhollow', type:'veg', icon:'🌾'},
    13: {farm:'Stonebury', type:'roots', icon:'🥕'},
    24: {farm:'Foxhollow', type:'veg', icon:'🌾'},
  };

  let startOffset = 2; // April 1 is Wednesday
  for (let d = 1; d <= 30; d++) {
    const pos = d + startOffset - 1;
    const row = Math.floor(pos / 7);
    const col = pos % 7;
    const cx = 28 + col*cellW + cellW/2;
    const cy = 178 + row*46 + 14;

    const hasDel = deliveries[d];
    const isToday = d === 12;

    if (isToday) {
      els.push(circle(cx, cy, 14, ACC));
      els.push(text(cx, cy+5, `${d}`, 11, WHITE, {anchor:'middle', fw:'700', font:'Inter, sans-serif'}));
    } else if (hasDel) {
      els.push(circle(cx, cy, 14, ACC_L));
      els.push(text(cx, cy+5, `${d}`, 11, ACC, {anchor:'middle', fw:'700', font:'Inter, sans-serif'}));
      els.push(text(cx, cy+22, hasDel.icon, 9, TXT, {anchor:'middle', font:'Arial'}));
    } else {
      els.push(text(cx, cy+5, `${d}`, 11, TXT, {anchor:'middle', fw:'400', font:'Inter, sans-serif'}));
    }
  }

  // upcoming delivery cards
  const upcomingY = 180 + 5*46 + 12;
  els.push(sectionLabel(upcomingY + 14, 'Upcoming'));

  const upcoming = [
    {date:'Thu 17 Apr', farm:'Foxhollow Farm', items:'Chard, Tomatoes + 5', icon:'🌾'},
    {date:'Mon 20 Apr', farm:'Stonebury Hill', items:'Celeriac, Beetroot + 2', icon:'🥕'},
    {date:'Thu 24 Apr', farm:'Foxhollow Farm', items:'Spring greens box',   icon:'🌾'},
  ];
  upcoming.forEach((u,i)=>{
    const uy = upcomingY + 28 + i*66;
    if (uy + 58 > H-82) return;
    els.push(card(16, uy, W-32, 58, SURF, {rx:10}));
    els.push(circle(42, uy+29, 16, ACC_L));
    els.push(text(42, uy+34, u.icon, 12, ACC, {anchor:'middle', font:'Arial'}));
    els.push(text(70, uy+20, u.date, 12, TXT, {fw:'600', font:'Inter, sans-serif'}));
    els.push(text(70, uy+35, u.farm, 10, ACC, {fw:'500', font:'Inter, sans-serif'}));
    els.push(text(70, uy+49, u.items, 9, MUTED, {font:'Inter, sans-serif'}));
  });

  els.push(...navBar('home'));
  return els;
}

// ── SCREEN 6: PROFILE & IMPACT ────────────────────────────────────────────────
function screen6() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  els.push(...statusBar());

  // header
  els.push(text(20, 72, 'My Impact', 24, TXT, {fw:'700', font:'Georgia, serif'}));
  els.push(text(20, 90, 'How your choices are shaping food systems', 11, MUTED, {font:'Inter, sans-serif'}));

  // avatar card
  els.push(bentoCard(16, 102, W-32, 90, SURF, {rx:16, stroke:LINE, sw:1}));
  els.push(circle(56, 147, 30, ACC_L));
  els.push(text(56, 154, '🌿', 22, ACC, {anchor:'middle', font:'Arial'}));
  els.push(text(100, 133, 'Clara M.', 16, TXT, {fw:'700', font:'Georgia, serif'}));
  els.push(text(100, 151, 'Member since January 2023', 10, MUTED, {font:'Inter, sans-serif'}));
  els.push(text(100, 167, '3 yrs · 2 active farms', 10, ACC, {fw:'500', font:'Inter, sans-serif'}));
  els.push(...pill(W-32-70, 117, 66, 22, ACC_L, '🌟 Harvester', ACC, 9));

  // impact stats bento
  els.push(sectionLabel(208, 'Your 2026 impact'));
  const stats = [
    {label:'CO₂ saved',     val:'14.2kg',  icon:'🌍', col:ACC,  bg:ACC_L,  big:true},
    {label:'Local spend',   val:'£312',    icon:'◉',  col:ACC2, bg:ACC2_L, big:false},
    {label:'Farms backed',  val:'4',       icon:'◈',  col:ACC,  bg:ACC_L,  big:false},
    {label:'Recipes made',  val:'38',      icon:'✦',  col:ACC2, bg:ACC2_L, big:false},
  ];

  // big card left
  const s0 = stats[0];
  els.push(bentoCard(16, 224, 168, 104, s0.bg, {rx:14, stroke:'none'}));
  els.push(text(28, 246, s0.icon, 18, s0.col, {font:'Arial'}));
  els.push(text(28, 290, s0.val, 32, TXT, {fw:'700', font:'Georgia, serif'}));
  els.push(text(28, 308, s0.label, 10, s0.col, {fw:'600', font:'Inter, sans-serif'}));

  // 3 small cards right
  const smalls = stats.slice(1);
  smalls.forEach((s, i) => {
    const sx = 192, sy = 224 + i*36;
    els.push(bentoCard(sx, sy, 182, 30, s.bg, {rx:8, stroke:'none'}));
    els.push(text(sx+12, sy+19, s.icon, 11, s.col, {font:'Arial'}));
    els.push(text(sx+30, sy+19, s.val, 13, TXT, {fw:'700', font:'Inter, sans-serif'}));
    els.push(text(sx+70, sy+19, s.label, 9, MUTED, {font:'Inter, sans-serif'}));
  });

  // seasonal eating score
  els.push(sectionLabel(342, 'Seasonal eating score'));
  els.push(card(16, 356, W-32, 78, SURF, {rx:14}));
  const score = 78;
  const barW = W-32-80;
  els.push(rect(52, 378, barW, 10, LINE, {rx:5}));
  els.push(rect(52, 378, barW*(score/100), 10, ACC, {rx:5}));
  els.push(text(52+barW+10, 386, `${score}%`, 12, TXT, {fw:'700', font:'Inter, sans-serif'}));
  els.push(text(52, 406, 'You eat 78% in-season — top 15% of Brae members', 10, MUTED, {font:'Inter, sans-serif'}));
  els.push(text(52, 420, 'Swap 1 tropical fruit for a local berry to reach 85%', 10, ACC, {fw:'500', font:'Inter, sans-serif'}));

  // settings list
  els.push(sectionLabel(450, 'Account'));
  const settings = ['Delivery preferences', 'Dietary filters', 'Payment method', 'Notifications'];
  settings.forEach((s, i) => {
    const sy = 464 + i*52;
    if (sy+44 > H-82) return;
    els.push(hr(sy-2));
    els.push(text(20, sy+24, s, 13, TXT, {fw:'500', font:'Inter, sans-serif'}));
    els.push(text(W-20, sy+24, '›', 18, MUTED, {anchor:'end', font:'Georgia, serif'}));
  });

  els.push(...navBar('profile'));
  return els;
}

// ── SCREEN EXTRAS: decorative grain/texture dots for each screen ──────────────
function grainDots(seed) {
  const els = [];
  // subtle background texture — small circles scattered
  const positions = [
    [340,120],[30,210],[360,300],[15,400],[350,500],[20,600],[365,700],
    [320,160],[50,260],[380,360],[10,460],[370,560],[25,660],[355,750],
    [300,140],[70,240],[340,340],[45,440],[360,620],[80,720],
  ];
  positions.forEach(([x,y]) => {
    els.push(circle(x, y, 2, LINE, {opacity:0.35}));
  });
  return els;
}

// ── ASSEMBLE ──────────────────────────────────────────────────────────────────
const screens = [
  { name:'Harvest Dashboard', fn: screen1 },
  { name:'My Farms',           fn: screen2 },
  { name:"This Week's Box",    fn: screen3 },
  { name:'Recipes',            fn: screen4 },
  { name:'Delivery Schedule',  fn: screen5 },
  { name:'Profile & Impact',   fn: screen6 },
];

const pen = {
  version: '2.8',
  metadata: {
    name: 'BRAE — Local Harvest Companion',
    author: 'RAM',
    date: new Date().toISOString().slice(0,10),
    theme: 'light',
    heartbeat: 22,
    palette: { BG, SURF, CARD, TXT, MUTED, ACC, ACC2, LINE },
    inspiration: 'Land-book warm earth tones + Saaspo bento grid patterns + Minimal Gallery editorial type',
    elements: 0,
  },
  screens: screens.map((s, idx) => {
    const elements = [...grainDots(idx), ...s.fn()];
    return { name: s.name, svg: `390x844`, elements };
  }),
};

let total = pen.screens.reduce((a,s) => a + s.elements.length, 0);
pen.metadata.elements = total;

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`BRAE: ${pen.screens.length} screens, ${total} elements`);
console.log(`Written: ${SLUG}.pen`);
