'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'veld';
const W = 390, H = 844;

// LIGHT palette — warm earthy
const BG     = '#FAF8F3';  // warm cream
const SURF   = '#FFFFFF';  // white
const CARD   = '#F2EDE0';  // sand/parchment
const CARD2  = '#EBF0E5';  // sage-tinted card
const ACC    = '#4E7A43';  // sage green
const ACC2   = '#C07830';  // warm ochre
const ACC3   = '#7A5C8A';  // dusty plum accent
const TEXT   = '#1C1A17';  // near-black warm
const TEXT2  = '#5A5650';  // muted brown-grey
const TEXT3  = '#8A8580';  // light muted
const WHITE  = '#FFFFFF';
const SAGE   = '#8FA87E';  // light sage
const CREAM2 = '#E8E2D0';  // deeper cream line

// Helpers
let elements = [];

function rect(x,y,w,h,fill,opts={}) {
  const el = { type:'rect', x, y, w, h, fill };
  if (opts.rx !== undefined) el.rx = opts.rx;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  if (opts.stroke) { el.stroke = opts.stroke; el.strokeWidth = opts.sw || 1; }
  return el;
}

function text(x,y,content,size,fill,opts={}) {
  const el = { type:'text', x, y, content: String(content), size, fill };
  if (opts.fw) el.fontWeight = opts.fw;
  if (opts.font) el.font = opts.font;
  if (opts.anchor) el.textAnchor = opts.anchor;
  if (opts.ls) el.letterSpacing = opts.ls;
  if (opts.opacity) el.opacity = opts.opacity;
  return el;
}

function circle(cx,cy,r,fill,opts={}) {
  const el = { type:'circle', cx, cy, r, fill };
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  if (opts.stroke) { el.stroke = opts.stroke; el.strokeWidth = opts.sw || 1.5; }
  return el;
}

function line(x1,y1,x2,y2,stroke,opts={}) {
  return { type:'line', x1, y1, x2, y2, stroke, strokeWidth: opts.sw || 1, opacity: opts.opacity || 1 };
}

// Shared status bar
function statusBar(els) {
  els.push(rect(0, 0, W, 44, BG));
  els.push(text(20, 30, '9:41', 13, TEXT, { fw: '600' }));
  els.push(text(370, 30, '●●●', 10, TEXT2, { anchor: 'end' }));
}

// Shared tab bar
function tabBar(els, active) {
  els.push(rect(0, H-80, W, 80, SURF));
  els.push(line(0, H-80, W, H-80, CREAM2, { sw: 1, opacity: 0.6 }));
  const tabs = [
    { icon: '◉', label: 'Home', id: 'home' },
    { icon: '◎', label: 'Track', id: 'track' },
    { icon: '◈', label: 'Goals', id: 'goals' },
    { icon: '◆', label: 'Insights', id: 'insights' },
    { icon: '◯', label: 'Profile', id: 'profile' },
  ];
  tabs.forEach((t, i) => {
    const x = 39 + i * 78;
    const isActive = t.id === active;
    const col = isActive ? ACC : TEXT3;
    els.push(text(x, H-50, t.icon, 18, col, { anchor: 'middle', fw: isActive ? '700' : '400' }));
    els.push(text(x, H-30, t.label, 10, col, { anchor: 'middle', fw: isActive ? '600' : '400' }));
    if (isActive) {
      els.push(rect(x-16, H-82, 32, 3, ACC, { rx: 2 }));
    }
  });
}

// ── SCREEN 1: HOME DASHBOARD ─────────────────────────────────────────────────
function screen1() {
  const els = [];
  statusBar(els);

  // Top bar
  els.push(text(20, 72, 'Good morning, Sam', 13, TEXT2));
  els.push(text(20, 96, 'Your Footprint', 26, TEXT, { fw: '700', font: 'serif', ls: '-0.5' }));
  els.push(circle(360, 82, 22, CARD, { stroke: CREAM2, sw: 1 }));
  els.push(text(360, 88, '⚙', 14, ACC, { anchor: 'middle' }));

  // Hero bento card — primary CO2 metric
  els.push(rect(20, 112, W-40, 140, CARD2, { rx: 16 }));
  els.push(rect(20, 112, W-40, 140, ACC, { rx: 16, opacity: 0.06 }));
  els.push(text(38, 142, 'THIS WEEK', 10, ACC, { fw: '700', ls: '1.5' }));
  els.push(text(38, 188, '4.2', 54, TEXT, { fw: '800', font: 'serif' }));
  els.push(text(110, 188, 'kg CO₂', 18, TEXT2, { fw: '400' }));
  els.push(text(38, 213, '↓ 12% vs last week  ·  Goal: 5.0 kg', 12, ACC, { fw: '600' }));
  // Mini spark bars in card
  const sparkData = [0.55, 0.72, 0.48, 0.63, 0.58, 0.44, 0.38];
  sparkData.forEach((v, i) => {
    const bh = Math.round(v * 50);
    const bx = 240 + i * 16;
    els.push(rect(bx, 245-bh, 10, bh, SAGE, { rx: 3 }));
  });
  els.push(rect(240 + 6*16, 245-Math.round(0.38*50), 10, Math.round(0.38*50), ACC, { rx: 3 }));
  els.push(text(240, 250, 'Mon', 8, TEXT3));
  els.push(text(330, 250, 'Sun', 8, TEXT3));

  // Bento 2-col row
  const bentoY = 268;
  // Travel card
  els.push(rect(20, bentoY, 170, 108, CARD, { rx: 14 }));
  els.push(text(36, bentoY+24, '✈', 20, ACC2));
  els.push(text(36, bentoY+52, 'Travel', 11, TEXT2, { fw: '600' }));
  els.push(text(36, bentoY+72, '1.8 kg', 22, TEXT, { fw: '700', font: 'serif' }));
  els.push(text(36, bentoY+92, '43% of total', 10, TEXT3));
  // Food card
  els.push(rect(200, bentoY, 170, 108, CARD, { rx: 14 }));
  els.push(text(216, bentoY+24, '🌿', 20, TEXT));
  els.push(text(216, bentoY+52, 'Food', 11, TEXT2, { fw: '600' }));
  els.push(text(216, bentoY+72, '1.1 kg', 22, TEXT, { fw: '700', font: 'serif' }));
  els.push(text(216, bentoY+92, '26% of total', 10, TEXT3));

  // Bento 3-col stat row
  const stat3Y = bentoY + 120;
  [
    { label: 'Energy', val: '0.8 kg', col: ACC },
    { label: 'Shopping', val: '0.3 kg', col: ACC2 },
    { label: 'Other', val: '0.2 kg', col: ACC3 },
  ].forEach((s, i) => {
    const sx = 20 + i * 118;
    els.push(rect(sx, stat3Y, 110, 70, SURF, { rx: 12, stroke: CREAM2, sw: 1 }));
    els.push(text(sx+12, stat3Y+22, s.label, 10, TEXT3, { fw: '500' }));
    els.push(text(sx+12, stat3Y+50, s.val, 16, s.col, { fw: '700', font: 'serif' }));
  });

  // Tip strip
  const tipY = stat3Y + 84;
  els.push(rect(20, tipY, W-40, 48, ACC, { rx: 12 }));
  els.push(text(38, tipY+20, '💡', 13, WHITE));
  els.push(text(60, tipY+20, 'Tip of the day', 11, WHITE, { fw: '700', opacity: 0.85 }));
  els.push(text(60, tipY+36, 'Try cycling to work — saves ~0.4 kg CO₂', 11, WHITE, { opacity: 0.75 }));

  // Streak row
  const strY = tipY + 62;
  els.push(text(20, strY+16, '🔥 12-day streak', 13, TEXT, { fw: '600' }));
  els.push(text(370, strY+16, 'View →', 12, ACC, { anchor: 'end', fw: '600' }));
  const days = ['M','T','W','T','F','S','S'];
  days.forEach((d, i) => {
    const dx = 26 + i*50;
    const done = i < 5;
    els.push(circle(dx, strY+44, 14, done ? ACC : CREAM2));
    els.push(text(dx, strY+49, d, 10, done ? WHITE : TEXT3, { anchor: 'middle', fw: '600' }));
  });

  tabBar(els, 'home');
  return els;
}

// ── SCREEN 2: FOOTPRINT BREAKDOWN ────────────────────────────────────────────
function screen2() {
  const els = [];
  statusBar(els);

  // Back nav
  els.push(text(20, 74, '←', 16, TEXT));
  els.push(text(W/2, 74, 'Footprint Detail', 16, TEXT, { anchor: 'middle', fw: '700' }));

  // Period toggle
  const pgY = 88;
  els.push(rect(80, pgY, 230, 32, CARD, { rx: 16 }));
  ['Week','Month','Year'].forEach((p, i) => {
    const px = 104 + i*77;
    if (i === 0) els.push(rect(px-18, pgY+3, 64, 26, SURF, { rx: 13 }));
    els.push(text(px, pgY+20, p, 12, i===0 ? ACC : TEXT2, { anchor: 'middle', fw: i===0?'700':'400' }));
  });

  // Ring chart (simulated with concentric arcs using rects + circles)
  const rCX = W/2, rCY = 280, rR = 88;
  // Background ring
  els.push(circle(rCX, rCY, rR, 'none', { stroke: CREAM2, sw: 18 }));
  // Segments — using colored circles with opacity tricks
  els.push(circle(rCX, rCY, rR, 'none', { stroke: ACC2, sw: 18, opacity: 0.9 }));
  els.push(circle(rCX-20, rCY-20, rR, 'none', { stroke: CARD, sw: 4, opacity: 0.3 }));
  // Inner fill
  els.push(circle(rCX, rCY, rR-24, SURF));
  // Center label
  els.push(text(rCX, rCY-12, '4.2', 34, TEXT, { anchor: 'middle', fw: '800', font: 'serif' }));
  els.push(text(rCX, rCY+12, 'kg CO₂', 12, TEXT2, { anchor: 'middle' }));
  els.push(text(rCX, rCY+28, 'this week', 10, TEXT3, { anchor: 'middle' }));
  // Segment labels around
  els.push(circle(rCX+rR*0.7, rCY-rR*0.7, 6, ACC2));
  els.push(circle(rCX-rR*0.7, rCY-rR*0.5, 6, ACC));
  els.push(circle(rCX, rCY+rR, 6, ACC3));
  els.push(circle(rCX+rR*0.9, rCY+rR*0.2, 6, SAGE));

  // Category breakdown list
  const catY = 390;
  const cats = [
    { label: 'Travel', kg: 1.8, pct: 43, col: ACC2, icon: '✈' },
    { label: 'Food & Drink', kg: 1.1, pct: 26, col: ACC, icon: '🌿' },
    { label: 'Energy', kg: 0.8, pct: 19, col: ACC3, icon: '⚡' },
    { label: 'Shopping', kg: 0.3, pct: 7, col: SAGE, icon: '🛍' },
    { label: 'Other', kg: 0.2, pct: 5, col: TEXT3, icon: '◎' },
  ];
  els.push(text(20, catY-8, 'By Category', 14, TEXT, { fw: '700' }));
  cats.forEach((c, i) => {
    const cy = catY + 16 + i * 62;
    els.push(rect(20, cy, W-40, 54, SURF, { rx: 12 }));
    // Icon circle
    els.push(circle(50, cy+27, 18, c.col, { opacity: 0.12 }));
    els.push(text(50, cy+32, c.icon, 14, c.col, { anchor: 'middle' }));
    // Label + pct
    els.push(text(76, cy+20, c.label, 13, TEXT, { fw: '600' }));
    els.push(text(76, cy+38, `${c.kg} kg CO₂`, 11, TEXT2));
    // Bar
    els.push(rect(76, cy+44, 200, 4, CREAM2, { rx: 2 }));
    els.push(rect(76, cy+44, Math.round(200 * c.pct/100), 4, c.col, { rx: 2 }));
    // Pct
    els.push(text(366, cy+28, `${c.pct}%`, 13, c.col, { anchor: 'end', fw: '700', font: 'serif' }));
  });

  tabBar(els, 'home');
  return els;
}

// ── SCREEN 3: TRACK ACTIVITY ──────────────────────────────────────────────────
function screen3() {
  const els = [];
  statusBar(els);

  els.push(text(W/2, 74, 'Log Activity', 17, TEXT, { anchor: 'middle', fw: '700' }));
  els.push(text(370, 74, '✕', 16, TEXT2, { anchor: 'end' }));

  // Date strip
  const dates = ['7','8','9','10','11','12','13'];
  const dLabels = ['M','T','W','T','F','S','S'];
  els.push(rect(0, 88, W, 72, SURF));
  els.push(line(0, 160, W, 160, CREAM2, { opacity: 0.6 }));
  dates.forEach((d, i) => {
    const dx = 28 + i * 49;
    const isToday = i === 3;
    if (isToday) els.push(rect(dx-16, 94, 32, 58, ACC, { rx: 10 }));
    els.push(text(dx, 112, dLabels[i], 10, isToday ? WHITE : TEXT3, { anchor: 'middle', fw: '600' }));
    els.push(text(dx, 134, d, 16, isToday ? WHITE : TEXT, { anchor: 'middle', fw: isToday ? '700' : '400' }));
    if (!isToday && i < 3) {
      els.push(circle(dx, 148, 3, ACC));
    }
  });

  // Search / input
  els.push(rect(20, 172, W-40, 44, CARD, { rx: 12 }));
  els.push(text(40, 199, '🔍', 14, TEXT3));
  els.push(text(62, 199, 'Search activities...', 13, TEXT3));

  // Recent activities
  els.push(text(20, 232, "Today's Activities", 14, TEXT, { fw: '700' }));
  els.push(text(370, 232, '+ Add', 13, ACC, { anchor: 'end', fw: '600' }));

  const activities = [
    { label: 'Morning commute', sub: 'Bus · 8.2 km', kg: '0.14 kg', icon: '🚌', col: ACC },
    { label: 'Lunch — veggie bowl', sub: 'Food · Plant-based', kg: '0.32 kg', icon: '🥗', col: SAGE },
    { label: 'Grocery shopping', sub: 'Shopping · Local store', kg: '0.08 kg', icon: '🛒', col: ACC2 },
  ];
  activities.forEach((a, i) => {
    const ay = 248 + i * 70;
    els.push(rect(20, ay, W-40, 62, SURF, { rx: 12 }));
    els.push(circle(50, ay+31, 20, a.col, { opacity: 0.1 }));
    els.push(text(50, ay+36, a.icon, 16, a.col, { anchor: 'middle' }));
    els.push(text(76, ay+22, a.label, 13, TEXT, { fw: '600' }));
    els.push(text(76, ay+40, a.sub, 11, TEXT2));
    els.push(text(366, ay+31, a.kg, 13, TEXT2, { anchor: 'end', fw: '500' }));
  });

  // Quick add category grid
  const catGridY = 465;
  els.push(text(20, catGridY, 'Quick Log', 14, TEXT, { fw: '700' }));
  const quickCats = [
    { label: 'Drive', icon: '🚗', col: ACC2 },
    { label: 'Fly', icon: '✈', col: ACC },
    { label: 'Transit', icon: '🚌', col: ACC3 },
    { label: 'Bike', icon: '🚲', col: SAGE },
    { label: 'Meal', icon: '🍽', col: ACC2 },
    { label: 'Shop', icon: '🛍', col: ACC },
    { label: 'Home', icon: '🏠', col: SAGE },
    { label: 'More', icon: '⊕', col: TEXT3 },
  ];
  quickCats.forEach((q, i) => {
    const row = Math.floor(i / 4);
    const col = i % 4;
    const qx = 20 + col * 89;
    const qy = catGridY + 18 + row * 88;
    els.push(rect(qx, qy, 80, 76, CARD, { rx: 14 }));
    els.push(text(qx+40, qy+32, q.icon, 22, q.col, { anchor: 'middle' }));
    els.push(text(qx+40, qy+58, q.label, 11, TEXT, { anchor: 'middle', fw: '500' }));
  });

  // Today total pill
  els.push(rect(20, 660, W-40, 44, ACC, { rx: 22 }));
  els.push(text(W/2, 688, 'Today total: 0.54 kg CO₂', 14, WHITE, { anchor: 'middle', fw: '700' }));

  tabBar(els, 'track');
  return els;
}

// ── SCREEN 4: GOALS ───────────────────────────────────────────────────────────
function screen4() {
  const els = [];
  statusBar(els);

  els.push(text(20, 74, 'Goals', 26, TEXT, { fw: '700', font: 'serif', ls: '-0.3' }));
  els.push(rect(310, 60, 60, 28, CARD2, { rx: 14 }));
  els.push(text(340, 78, '+ New', 12, ACC, { anchor: 'middle', fw: '600' }));

  // Active goal card — hero
  const hY = 96;
  els.push(rect(20, hY, W-40, 148, CARD2, { rx: 18 }));
  els.push(rect(20, hY, W-40, 148, ACC, { rx: 18, opacity: 0.07 }));
  els.push(text(38, hY+26, 'PRIMARY GOAL', 9, ACC, { fw: '700', ls: '2' }));
  els.push(text(38, hY+54, 'Reduce weekly CO₂', 20, TEXT, { fw: '700', font: 'serif' }));
  els.push(text(38, hY+74, 'to under 3.5 kg by June', 20, TEXT, { fw: '400', font: 'serif' }));
  // Progress arc visual
  els.push(text(38, hY+104, 'Progress', 11, TEXT2));
  els.push(rect(38, hY+116, 280, 8, CREAM2, { rx: 4 }));
  els.push(rect(38, hY+116, 168, 8, ACC, { rx: 4 })); // 60% 
  els.push(text(324, hY+124, '60%', 13, ACC, { anchor: 'end', fw: '700' }));
  els.push(text(38, hY+136, '4.2 kg now', 10, TEXT3));
  els.push(text(324, hY+136, '3.5 kg target', 10, TEXT3, { anchor: 'end' }));

  // Milestone timeline
  const mlY = hY + 162;
  els.push(text(20, mlY+8, 'Milestones', 14, TEXT, { fw: '700' }));
  const milestones = [
    { label: 'Track for 7 days', done: true, sub: 'Completed Mar 28' },
    { label: 'Under 5 kg/week', done: true, sub: 'Completed Apr 2' },
    { label: 'Under 4 kg/week', done: false, sub: '0.2 kg to go' },
    { label: 'Under 3.5 kg/week', done: false, sub: 'Your main target' },
  ];
  // Timeline line
  els.push(line(44, mlY+30, 44, mlY+30+milestones.length*62, CREAM2, { sw: 2 }));
  milestones.forEach((m, i) => {
    const my = mlY + 30 + i * 62;
    els.push(circle(44, my+12, 10, m.done ? ACC : SURF, { stroke: m.done ? ACC : CREAM2, sw: 2 }));
    if (m.done) els.push(text(44, my+17, '✓', 10, WHITE, { anchor: 'middle', fw: '700' }));
    els.push(rect(66, my, W-86, 48, m.done ? SURF : CARD, { rx: 10 }));
    els.push(text(80, my+18, m.label, 13, m.done ? TEXT : TEXT2, { fw: m.done ? '600' : '400' }));
    els.push(text(80, my+34, m.sub, 11, m.done ? ACC : TEXT3));
  });

  // Extra goals
  const egY = mlY + 30 + milestones.length * 62 + 10;
  els.push(text(20, egY+8, 'Other Goals', 13, TEXT, { fw: '700' }));
  [{label:'Go vegetarian 3×/wk',pct:67,col:SAGE},{label:'Zero flights this month',pct:100,col:ACC}].forEach((g,i) => {
    const gy = egY + 24 + i * 56;
    els.push(rect(20, gy, W-40, 48, SURF, { rx: 10 }));
    els.push(text(36, gy+20, g.label, 12, TEXT, { fw: '600' }));
    els.push(text(36, gy+36, `${g.pct}% complete`, 11, g.col));
    els.push(rect(200, gy+20, 140, 6, CREAM2, { rx: 3 }));
    els.push(rect(200, gy+20, Math.round(140*g.pct/100), 6, g.col, { rx: 3 }));
  });

  tabBar(els, 'goals');
  return els;
}

// ── SCREEN 5: RECOMMENDATIONS ─────────────────────────────────────────────────
function screen5() {
  const els = [];
  statusBar(els);

  els.push(text(20, 72, 'For You', 26, TEXT, { fw: '700', font: 'serif', ls: '-0.3' }));
  els.push(text(20, 96, 'Personalized actions to reduce your footprint', 13, TEXT2));

  // Filter chips
  const chips = ['All','Travel','Food','Home','Shopping'];
  let chipX = 20;
  chips.forEach((c, i) => {
    const cw = c.length * 9 + 24;
    els.push(rect(chipX, 108, cw, 28, i===0 ? ACC : CARD, { rx: 14 }));
    els.push(text(chipX + cw/2, 126, c, 11, i===0 ? WHITE : TEXT2, { anchor: 'middle', fw: i===0?'600':'400' }));
    chipX += cw + 8;
  });

  // Featured card (wide editorial)
  els.push(rect(20, 148, W-40, 140, CARD2, { rx: 16 }));
  els.push(rect(20, 148, W-40, 140, ACC, { opacity: 0.08, rx: 16 }));
  // Decorative leaf shape
  els.push(circle(W-50, 158, 40, ACC, { opacity: 0.12 }));
  els.push(circle(W-60, 178, 30, ACC, { opacity: 0.1 }));
  els.push(text(38, 178, '🌱', 24, ACC));
  els.push(text(38, 208, 'Switch to green energy', 18, TEXT, { fw: '700', font: 'serif' }));
  els.push(text(38, 228, 'at home', 18, TEXT, { fw: '400', font: 'serif' }));
  els.push(text(38, 252, 'Save up to 1.2 kg CO₂/day', 12, ACC, { fw: '600' }));
  els.push(rect(248, 256, 100, 28, ACC, { rx: 14 }));
  els.push(text(298, 274, 'Learn More', 11, WHITE, { anchor: 'middle', fw: '600' }));

  // Card list
  const recs = [
    { icon: '🚲', title: 'Bike to work', sub: 'Saves 0.42 kg CO₂/day', tag: 'Travel', impact: 'High', col: ACC },
    { icon: '🥦', title: 'Plant-based Monday', sub: 'Saves 0.6 kg CO₂/week', tag: 'Food', impact: 'Medium', col: SAGE },
    { icon: '🛍', title: 'Buy secondhand', sub: 'Saves 0.2 kg CO₂/item', tag: 'Shopping', impact: 'Low', col: ACC2 },
    { icon: '🌡', title: 'Lower thermostat 2°', sub: 'Saves 0.15 kg CO₂/day', tag: 'Home', impact: 'Medium', col: ACC3 },
  ];
  recs.forEach((r, i) => {
    const ry = 302 + i * 76;
    els.push(rect(20, ry, W-40, 68, SURF, { rx: 14 }));
    els.push(circle(50, ry+34, 20, r.col, { opacity: 0.1 }));
    els.push(text(50, ry+39, r.icon, 18, r.col, { anchor: 'middle' }));
    els.push(text(78, ry+22, r.title, 13, TEXT, { fw: '600' }));
    els.push(text(78, ry+40, r.sub, 11, TEXT2));
    // Tag + impact
    const twid = r.tag.length * 7 + 16;
    els.push(rect(366-twid, ry+18, twid, 20, r.col, { rx: 10, opacity: 0.12 }));
    els.push(text(366-twid/2, ry+31, r.tag, 10, r.col, { anchor: 'middle', fw: '600' }));
    els.push(text(366, ry+50, `${r.impact} impact`, 10, TEXT3, { anchor: 'end' }));
  });

  tabBar(els, 'home');
  return els;
}

// ── SCREEN 6: INSIGHTS / COMMUNITY ───────────────────────────────────────────
function screen6() {
  const els = [];
  statusBar(els);

  els.push(text(20, 72, 'Insights', 26, TEXT, { fw: '700', font: 'serif', ls: '-0.3' }));
  els.push(text(20, 96, 'April 2026', 13, TEXT2));

  // Month trend bars
  const barY = 108;
  els.push(text(20, barY+8, 'Monthly Trend', 13, TEXT, { fw: '700' }));
  const months = [
    {m:'Jan',v:6.2},{m:'Feb',v:5.8},{m:'Mar',v:5.1},{m:'Apr',v:4.2}
  ];
  const maxBar = 6.2;
  months.forEach((mb, i) => {
    const bx = 28 + i * 88;
    const bh = Math.round((mb.v / maxBar) * 80);
    const isLatest = i === 3;
    els.push(rect(bx, barY+28+(80-bh), 64, bh, isLatest ? ACC : CREAM2, { rx: 6 }));
    if (isLatest) els.push(text(bx+32, barY+20, `${mb.v}`, 11, ACC, { anchor: 'middle', fw: '700' }));
    els.push(text(bx+32, barY+118, mb.m, 11, TEXT3, { anchor: 'middle' }));
  });
  // Trend note
  els.push(rect(20, barY+128, W-40, 32, CARD2, { rx: 10 }));
  els.push(text(36, barY+148, '↓ 32% reduction since January — you are on track!', 11, ACC, { fw: '600' }));

  // Comparison card
  const cmpY = barY + 176;
  els.push(text(20, cmpY+8, 'How you compare', 13, TEXT, { fw: '700' }));
  const comparisons = [
    { label: 'Your avg', val: 4.2, max: 10, col: ACC },
    { label: 'App avg', val: 5.8, max: 10, col: TEXT3 },
    { label: 'Country avg', val: 8.3, max: 10, col: ACC2 },
    { label: 'Paris target', val: 2.0, max: 10, col: SAGE },
  ];
  comparisons.forEach((c, i) => {
    const cy = cmpY + 28 + i * 44;
    els.push(text(20, cy+14, c.label, 12, TEXT2, { fw: '500' }));
    els.push(text(140, cy+14, `${c.val} kg`, 12, c.col, { fw: '700' }));
    els.push(rect(200, cy+8, 160, 8, CREAM2, { rx: 4 }));
    els.push(rect(200, cy+8, Math.round(160 * c.val / c.max), 8, c.col, { rx: 4 }));
  });

  // Community feed
  const feedY = cmpY + 220;
  els.push(text(20, feedY, 'Community', 13, TEXT, { fw: '700' }));
  const feeds = [
    { name: 'Maya R.', action: 'logged a car-free week 🎉', ago: '2h' },
    { name: 'James K.', action: 'hit their first monthly goal', ago: '5h' },
    { name: 'Priya M.', action: 'reduced food footprint by 40%', ago: '1d' },
  ];
  feeds.forEach((f, i) => {
    const fy = feedY + 18 + i * 56;
    els.push(rect(20, fy, W-40, 48, SURF, { rx: 10 }));
    const avatarColor = [ACC, ACC2, SAGE][i];
    els.push(circle(42, fy+24, 14, avatarColor, { opacity: 0.2 }));
    els.push(text(42, fy+29, f.name[0], 13, avatarColor, { anchor: 'middle', fw: '700' }));
    els.push(text(62, fy+20, f.name, 12, TEXT, { fw: '600' }));
    els.push(text(62, fy+36, f.action, 11, TEXT2));
    els.push(text(366, fy+20, f.ago, 10, TEXT3, { anchor: 'end' }));
  });

  tabBar(els, 'insights');
  return els;
}

// ── BUILD ─────────────────────────────────────────────────────────────────────
const screens = [
  { name: 'Home Dashboard', fn: screen1 },
  { name: 'Footprint Detail', fn: screen2 },
  { name: 'Track Activity', fn: screen3 },
  { name: 'Goals', fn: screen4 },
  { name: 'Recommendations', fn: screen5 },
  { name: 'Insights', fn: screen6 },
];

let totalElements = 0;
const penScreens = screens.map(s => {
  const els = s.fn();
  totalElements += els.length;
  return { name: s.name, svg: `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"><rect width="${W}" height="${H}" fill="${BG}"/></svg>`, elements: els };
});

const pen = {
  version: '2.8',
  metadata: {
    name: 'VELD — Know your footprint',
    author: 'RAM',
    date: new Date().toISOString(),
    theme: 'light',
    heartbeat: 46,
    slug: SLUG,
    palette: { BG, SURF, CARD, ACC, ACC2, TEXT },
    elements: totalElements,
  },
  screens: penScreens,
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`VELD: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
