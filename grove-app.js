'use strict';
const fs = require('fs');
const path = require('path');

const W = 390, H = 844;
const SLUG = 'grove';

// PALETTE
const P = {
  bg:      '#FAF8F4',
  surface: '#FFFFFF',
  card:    '#F2EFE9',
  accent:  '#4A7C59',
  accent2: '#D4856A',
  text:    '#1C1A16',
  muted:   '#8B8780',
  border:  '#E8E4DC',
  white:   '#FFFFFF',
  accentLight: '#E8F2EC',
  accent2Light: '#FAF0EB',
};

function rect(x,y,w,h,fill,opts={}) {
  return { type:'rect', x, y, width:w, height:h, fill,
    rx: opts.rx||0, opacity: opts.opacity||1,
    stroke: opts.stroke||'none', strokeWidth: opts.sw||1 };
}
function text(x,y,content,size,fill,opts={}) {
  return { type:'text', x, y, content, fontSize:size, fill,
    fontWeight: opts.fw||400, fontFamily: opts.font||'Inter',
    textAnchor: opts.anchor||'start', letterSpacing: opts.ls||0,
    opacity: opts.opacity||1 };
}
function circle(cx,cy,r,fill,opts={}) {
  return { type:'circle', cx, cy, r, fill,
    opacity: opts.opacity||1, stroke: opts.stroke||'none', strokeWidth: opts.sw||1 };
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  return { type:'line', x1, y1, x2, y2, stroke,
    strokeWidth: opts.sw||1, opacity: opts.opacity||1 };
}

// Bottom Nav helper
function bottomNav(activeIdx) {
  const navY = H - 80;
  const labels = ['Home','Insights','Journal','Goals','Profile'];
  const icons  = ['⌂','◈','✎','◎','◉'];
  const xs     = [39, 117, 195, 273, 351];
  const els = [];
  els.push(rect(0, navY, W, 80, P.surface, { rx:0 }));
  els.push(line(0, navY, W, navY, P.border, { sw:1 }));
  xs.forEach((x, i) => {
    const isActive = i === activeIdx;
    const col = isActive ? P.accent : P.muted;
    els.push(text(x, navY+28, icons[i], 20, col, { anchor:'middle', fw: isActive ? 700 : 400 }));
    els.push(text(x, navY+48, labels[i], 10, col, { anchor:'middle', fw: isActive ? 600 : 400 }));
    if (isActive) {
      els.push(rect(x-18, navY+2, 36, 3, P.accent, { rx:2 }));
    }
  });
  return els;
}

// Status Bar helper
function statusBar() {
  return [
    rect(0, 0, W, 44, P.bg),
    text(20, 28, '9:41', 15, P.text, { fw:600 }),
    text(330, 28, 'LTE ▲ 100%', 11, P.muted, { anchor:'start' }),
    circle(360, 22, 6, P.accent, { opacity:0.5 }),
    circle(372, 22, 6, P.accent, { opacity:0.3 }),
  ];
}

// ── SCREEN 1: Today ───────────────────────────────────────────────────────────
function screen1() {
  const els = [];

  // Background
  els.push(rect(0, 0, W, H, P.bg));

  // Status bar
  statusBar().forEach(e => els.push(e));

  // Greeting
  els.push(text(20, 68, 'Good morning, Alex', 22, P.muted, { fw:300 }));
  els.push(text(20, 90, 'Sunday, April 12', 13, P.muted, { fw:400 }));
  els.push(circle(W-24, 68, 18, P.card, { stroke: P.border, sw:1 }));
  els.push(text(W-24, 73, 'A', 14, P.accent, { anchor:'middle', fw:700 }));

  // Hero streak card
  els.push(rect(16, 104, W-32, 148, P.surface, { rx:16, stroke: P.border, sw:1 }));
  els.push(rect(16, 104, 4, 148, P.accent, { rx:2 }));

  els.push(text(40, 130, 'Current Streak', 12, P.muted, { fw:500, ls:0.5 }));
  els.push(text(40, 188, '47', 60, P.accent, { fw:700 }));
  els.push(text(108, 188, 'days', 22, P.accent, { fw:300 }));
  els.push(text(40, 210, 'day streak', 14, P.muted, { fw:400 }));
  els.push(text(40, 228, 'Keep going — best run ever!', 12, P.muted, { fw:400 }));

  // "Your longest run yet" terracotta pill
  els.push(rect(200, 120, 170, 28, P.accent2Light, { rx:14 }));
  els.push(rect(200, 120, 4, 28, P.accent2, { rx:2 }));
  els.push(text(290, 138, 'Your longest run yet', 11, P.accent2, { anchor:'middle', fw:600 }));

  // Progress ring hint
  els.push(circle(316, 186, 40, 'none', { stroke: P.border, sw:4 }));
  els.push(circle(316, 186, 40, 'none', { stroke: P.accentLight, sw:4, opacity:0.8 }));
  els.push(circle(316, 186, 40, 'none', { stroke: P.accent, sw:4, opacity:0.6 }));
  els.push(circle(316, 186, 28, P.accentLight, {}));
  els.push(text(316, 191, '67%', 13, P.accent, { anchor:'middle', fw:700 }));
  els.push(text(316, 238, 'today', 10, P.muted, { anchor:'middle' }));

  // Divider
  els.push(line(16, 265, W-16, 265, P.border, { sw:1, opacity:0.6 }));

  // Section header
  els.push(text(20, 290, "TODAY'S HABITS", 12, P.muted, { fw:600, ls:1.5 }));
  els.push(text(W-20, 290, '8 of 12', 12, P.muted, { anchor:'end', fw:500 }));

  // Habit rows
  const habits = [
    { name:'Morning Meditation', sub:'10 min',  streak:'47', checked:true },
    { name:'Read',               sub:'20 pages',streak:'31', checked:true },
    { name:'Journal',            sub:'5 min',   streak:'12', checked:false },
    { name:'Exercise',           sub:'30 min',  streak:'8',  checked:false },
    { name:'Evening Walk',       sub:'15 min',  streak:'5',  checked:false },
  ];

  habits.forEach((h, i) => {
    const cardY = 304 + i * 66;
    els.push(rect(16, cardY, W-32, 56, P.surface, { rx:12, stroke: P.border, sw:1 }));
    els.push(rect(16, cardY, 4, 56, h.checked ? P.accent : P.border, { rx:2 }));
    els.push(text(34, cardY+20, h.name, 15, P.text, { fw:500 }));
    els.push(text(34, cardY+38, h.sub, 12, P.muted, { fw:400 }));
    els.push(text(W-74, cardY+32, '🔥 '+h.streak, 12, P.accent2, { fw:500, anchor:'end' }));
    if (h.checked) {
      els.push(circle(W-30, cardY+28, 12, P.accent, {}));
      els.push(text(W-30, cardY+33, '✓', 13, P.white, { anchor:'middle', fw:700 }));
    } else {
      els.push(circle(W-30, cardY+28, 12, 'none', { stroke: P.border, sw:2 }));
    }
  });

  // Add habit hint
  els.push(rect(16, 638, W-32, 42, P.accentLight, { rx:10, stroke: P.accent, sw:1, opacity:0.6 }));
  els.push(text(W/2, 663, '+ Add a habit for today', 13, P.accent, { anchor:'middle', fw:500 }));

  // Quote / motivational strip
  els.push(rect(16, 690, W-32, 36, P.card, { rx:10 }));
  els.push(text(W/2, 712, '"Small steps, compounded." · Day 47', 12, P.muted, { anchor:'middle', fw:400 }));

  bottomNav(0).forEach(e => els.push(e));
  return els;
}

// ── SCREEN 2: Session ─────────────────────────────────────────────────────────
function screen2() {
  const els = [];

  els.push(rect(0, 0, W, H, P.bg));
  statusBar().forEach(e => els.push(e));

  // Back arrow + header
  els.push(text(20, 72, '←', 20, P.text, { fw:400 }));
  els.push(text(W/2, 72, 'Focus Session', 17, P.text, { anchor:'middle', fw:600 }));
  els.push(text(W-20, 72, '···', 20, P.muted, { anchor:'end' }));

  // Decorative header line
  els.push(line(20, 84, W-20, 84, P.border, { sw:1 }));

  // Habit label above circle
  els.push(text(W/2, 116, 'Morning Meditation', 15, P.muted, { anchor:'middle', fw:400 }));

  // Large breathing circle cluster
  const cx = W/2, cy = 284;
  // Outermost glow rings
  els.push(circle(cx, cy, 118, P.accentLight, { opacity:0.3 }));
  els.push(circle(cx, cy, 118, 'none', { stroke: P.accent, sw:1, opacity:0.12 }));
  // Middle ring
  els.push(circle(cx, cy, 96, P.accentLight, { opacity:0.55 }));
  els.push(circle(cx, cy, 96, 'none', { stroke: P.accent, sw:1.5, opacity:0.28 }));
  // Inner ring
  els.push(circle(cx, cy, 74, P.accentLight, { opacity:0.85 }));
  els.push(circle(cx, cy, 74, 'none', { stroke: P.accent, sw:2, opacity:0.55 }));
  // Core
  els.push(circle(cx, cy, 52, P.accent, { opacity:0.12 }));
  // Countdown text
  els.push(text(cx, cy-8, '08:32', 38, P.accent, { anchor:'middle', fw:300 }));
  els.push(text(cx, cy+18, 'Breathe out', 13, P.muted, { anchor:'middle', fw:400 }));
  // Phase dots
  [-22, 0, 22].forEach((dx, pi) => {
    els.push(circle(cx+dx, cy+52, 4, pi===1 ? P.accent : P.border, {}));
  });

  // Session name + badge
  els.push(text(W/2, 368, 'Morning Meditation', 18, P.text, { anchor:'middle', fw:600 }));
  els.push(rect(W/2-40, 378, 80, 26, P.accent2Light, { rx:13 }));
  els.push(text(W/2, 395, 'Day 47', 12, P.accent2, { anchor:'middle', fw:600 }));

  // Progress bar
  els.push(text(20, 424, '42% complete', 12, P.muted, { fw:400 }));
  els.push(text(W-20, 424, '10:00 total', 12, P.muted, { anchor:'end', fw:400 }));
  els.push(rect(20, 432, W-40, 7, P.border, { rx:3.5 }));
  els.push(rect(20, 432, (W-40)*0.42, 7, P.accent, { rx:3.5 }));
  // Progress marker dot
  els.push(circle(20+(W-40)*0.42, 435, 7, P.accent, {}));

  // Session stats row
  const statY = 458;
  els.push(rect(16, statY, W-32, 64, P.surface, { rx:12, stroke: P.border, sw:1 }));
  els.push(line(16+((W-32)/3), statY+10, 16+((W-32)/3), statY+54, P.border, { sw:1 }));
  els.push(line(16+2*((W-32)/3), statY+10, 16+2*((W-32)/3), statY+54, P.border, { sw:1 }));
  const stats = [
    { label:'Elapsed',   val:'1:28' },
    { label:'Remaining', val:'8:32' },
    { label:'Round',     val:'2 / 3' },
  ];
  stats.forEach((s, i) => {
    const sx = 16 + (W-32)*(i/3) + (W-32)/6;
    els.push(text(sx, statY+30, s.val, 18, P.text, { anchor:'middle', fw:700 }));
    els.push(text(sx, statY+50, s.label, 11, P.muted, { anchor:'middle' }));
  });

  // Pause button
  els.push(rect(20, 540, W-40, 52, P.accent, { rx:14 }));
  els.push(text(W/2, 570, 'Pause', 16, P.white, { anchor:'middle', fw:600 }));

  // End Session ghost button
  els.push(rect(20, 602, W-40, 44, 'none', { rx:12, stroke: P.border, sw:1.5 }));
  els.push(text(W/2, 628, 'End Session', 14, P.muted, { anchor:'middle', fw:500 }));

  // Recent sessions list
  els.push(text(20, 660, 'RECENT SESSIONS', 12, P.muted, { fw:600, ls:1.5 }));
  const recentSessions = [
    { name:'Yesterday · Meditation', dur:'10:00', done:true },
    { name:'Apr 10 · Box Breathing',  dur:'5:00',  done:true },
    { name:'Apr 9 · Evening Walk',    dur:'15:00', done:true },
  ];
  recentSessions.forEach((r, i) => {
    const ry = 676 + i*28;
    if (ry < H-90) {
      els.push(rect(16, ry-14, W-32, 24, P.card, { rx:6 }));
      els.push(circle(30, ry-2, 5, P.accent, { opacity:0.5 }));
      els.push(text(44, ry+2, r.name, 12, P.text, { fw:400 }));
      els.push(text(W-24, ry+2, r.dur, 12, P.muted, { anchor:'end' }));
    }
  });

  bottomNav(0).forEach(e => els.push(e));
  return els;
}

// ── SCREEN 3: Insights ────────────────────────────────────────────────────────
function screen3() {
  const els = [];

  els.push(rect(0, 0, W, H, P.bg));
  statusBar().forEach(e => els.push(e));

  // Header
  els.push(text(20, 72, 'Insights', 22, P.text, { fw:700 }));
  els.push(rect(210, 54, 160, 32, P.surface, { rx:16, stroke: P.border, sw:1 }));
  els.push(text(290, 74, 'Apr 7 – 13  ›', 12, P.muted, { anchor:'middle' }));

  // Hero metric row
  const metricY = 98;
  const metricW = (W-48)/3;
  const metrics = [
    { val:'87%', label:'Completion', col: P.accent },
    { val:'23',  label:'Active',     col: P.text },
    { val:'47',  label:'Day Streak', col: P.accent2 },
  ];
  metrics.forEach((m, i) => {
    const mx = 16 + i*(metricW+8);
    els.push(rect(mx, metricY, metricW, 74, P.surface, { rx:12, stroke: P.border, sw:1 }));
    els.push(text(mx+metricW/2, metricY+34, m.val, 24, m.col, { anchor:'middle', fw:700 }));
    els.push(text(mx+metricW/2, metricY+54, m.label, 11, P.muted, { anchor:'middle' }));
    // Sparkline hint
    els.push(rect(mx+12, metricY+62, metricW-24, 3, m.col, { rx:1.5, opacity:0.2 }));
    els.push(rect(mx+12, metricY+62, (metricW-24)*0.72, 3, m.col, { rx:1.5, opacity:0.6 }));
  });

  // Weekly progress bar chart
  els.push(text(20, 192, 'WEEKLY PROGRESS', 12, P.muted, { fw:600, ls:1.5 }));
  const days   = ['M','T','W','T','F','S','S'];
  const values = [72, 85, 90, 68, 95, 60, 87];
  const todayIdx = 6;
  const barChartY = 208;
  const barMaxH   = 88;
  const barW      = 34;
  const barSpacing = (W-40) / 7;

  days.forEach((d, i) => {
    const bx = 20 + i*barSpacing + barSpacing/2;
    const bh = (values[i]/100)*barMaxH;
    const by = barChartY + barMaxH - bh;
    const isToday = i === todayIdx;
    const fillCol  = isToday ? P.accent : P.accentLight;
    const textCol  = isToday ? P.accent : P.muted;
    els.push(rect(bx-barW/2, by, barW, bh, fillCol, { rx:5 }));
    els.push(text(bx, by-7, values[i]+'%', 9, textCol, { anchor:'middle', fw: isToday?700:400 }));
    els.push(text(bx, barChartY+barMaxH+16, d, 12, isToday?P.accent:P.muted, { anchor:'middle', fw: isToday?700:400 }));
  });
  els.push(line(20, barChartY+barMaxH, W-20, barChartY+barMaxH, P.border, { sw:1 }));

  // Mood Trend section
  const moodSectionY = 332;
  els.push(text(20, moodSectionY, 'MOOD TREND', 12, P.muted, { fw:600, ls:1.5 }));
  els.push(rect(16, moodSectionY+10, W-32, 76, P.surface, { rx:12, stroke: P.border, sw:1 }));

  // Y axis guides
  els.push(line(38, moodSectionY+22, 38, moodSectionY+74, P.border, { sw:1, opacity:0.5 }));
  ['H','M','L'].forEach((label, li) => {
    els.push(text(26, moodSectionY+28+li*22, label, 9, P.muted, { anchor:'middle' }));
    els.push(line(38, moodSectionY+24+li*22, W-20, moodSectionY+24+li*22, P.border, { sw:0.5, opacity:0.3 }));
  });

  // Mood line (wavy path via segments)
  const moodPts = [
    [48, moodSectionY+58],
    [96, moodSectionY+36],
    [144, moodSectionY+44],
    [192, moodSectionY+24],
    [240, moodSectionY+30],
    [288, moodSectionY+52],
    [W-22, moodSectionY+22],
  ];
  for (let i=0; i<moodPts.length-1; i++) {
    const [x1,y1] = moodPts[i], [x2,y2] = moodPts[i+1];
    els.push(line(x1,y1,x2,y2, P.accent2, { sw:2.5, opacity:0.85 }));
    // Shadow
    els.push(line(x1,y1+6,x2,y2+6, P.accent2, { sw:1, opacity:0.15 }));
  }
  moodPts.forEach(([x,y]) => {
    els.push(circle(x, y, 3.5, P.accent2, {}));
  });

  // Category breakdown
  const catY = 430;
  els.push(text(20, catY, 'CATEGORY BREAKDOWN', 12, P.muted, { fw:600, ls:1.5 }));
  const cats = [
    { name:'Mindfulness', pct:92, col: P.accent },
    { name:'Physical',    pct:78, col: P.accent2 },
    { name:'Learning',    pct:65, col: P.muted },
  ];
  cats.forEach((c, i) => {
    const cy = catY+18 + i*56;
    els.push(rect(16, cy, W-32, 48, P.surface, { rx:10, stroke: P.border, sw:1 }));
    els.push(text(30, cy+18, c.name, 13, P.text, { fw:500 }));
    els.push(text(W-28, cy+18, c.pct+'%', 13, c.col, { anchor:'end', fw:600 }));
    els.push(rect(30, cy+28, W-60, 7, P.border, { rx:3.5 }));
    els.push(rect(30, cy+28, (W-60)*(c.pct/100), 7, c.col, { rx:3.5 }));
    // Sub label
    els.push(text(30, cy+42, ['3 habits tracked','4 habits tracked','2 habits tracked'][i], 10, P.muted, {}));
  });

  bottomNav(1).forEach(e => els.push(e));
  return els;
}

// ── SCREEN 4: Journal ─────────────────────────────────────────────────────────
function screen4() {
  const els = [];

  els.push(rect(0, 0, W, H, P.bg));
  statusBar().forEach(e => els.push(e));

  // Date header row
  els.push(text(20, 70, 'Sunday, April 12', 13, P.muted, { fw:400 }));
  els.push(text(W-20, 70, 'Entry #128', 13, P.muted, { anchor:'end' }));
  els.push(line(20, 82, W-20, 82, P.border, { sw:1 }));

  // Editorial serif-style display prompt
  els.push(text(20, 116, 'What are you', 27, P.text, { fw:700, ls:-0.3 }));
  els.push(text(20, 148, 'grateful for today?', 27, P.text, { fw:700, ls:-0.3 }));
  // Accent underline
  els.push(rect(20, 156, 140, 3, P.accent2, { rx:1.5 }));
  // Editorial accent dot
  els.push(circle(W-28, 116, 10, P.accentLight, {}));
  els.push(circle(W-28, 116, 6, P.accent, { opacity:0.4 }));

  // Mood picker row
  els.push(text(20, 180, 'Today\'s mood:', 12, P.muted, { fw:400 }));
  ['😌','😊','😐','😔','😤'].forEach((emoji, mi) => {
    const ex = 112 + mi*34;
    els.push(circle(ex, 176, 14, mi===1 ? P.accentLight : 'none', { stroke: mi===1 ? P.accent : P.border, sw:1 }));
    els.push(text(ex, 181, emoji, 14, P.text, { anchor:'middle' }));
  });

  // Large ruled writing card
  els.push(rect(16, 196, W-32, 318, P.surface, { rx:16, stroke: P.border, sw:1 }));

  // Ruled lines
  for (let i=0; i<13; i++) {
    const ly = 220 + i*22;
    if (ly < 492) {
      els.push(line(34, ly, W-34, ly, P.border, { sw:0.75, opacity:0.55 }));
    }
  }

  // Left margin line (editorial touch)
  els.push(line(56, 200, 56, 510, P.accent2Light, { sw:1.5, opacity:0.7 }));

  // Sample journal text
  const journalLines = [
    "I'm grateful for the quiet morning before",
    "the day began — the smell of coffee, soft",
    "light through my window. Small things,",
    "but they anchor me completely.",
  ];
  journalLines.forEach((jl, ji) => {
    els.push(text(62, 218+ji*22, jl, 13, P.text, { fw:400 }));
  });

  // Cursor
  els.push(rect(62, 310, 1.5, 18, P.accent, { opacity:0.85 }));

  // Character count
  els.push(text(34, 520, '142 words · 3 min read', 11, P.muted, { fw:400 }));
  els.push(rect(W-120, 508, 100, 22, P.accentLight, { rx:11 }));
  els.push(text(W-70, 522, 'Personal ✎', 11, P.accent, { anchor:'middle', fw:500 }));

  // Writing prompt cards
  els.push(text(20, 546, 'WRITING PROMPTS', 12, P.muted, { fw:600, ls:1.5 }));
  const prompts = [
    ['One thing','I learned'],
    ["Tomorrow's",'intention'],
    ['A moment','of joy'],
  ];
  const promptCardW = (W-48) / 3;
  prompts.forEach((p, i) => {
    const px = 16 + i*(promptCardW+8);
    els.push(rect(px, 558, promptCardW, 66, P.accent2Light, { rx:10, stroke: P.accent2, sw:1, opacity:0.65 }));
    els.push(rect(px, 558, promptCardW, 4, P.accent2, { rx:2 }));
    els.push(text(px+promptCardW/2, 578, p[0], 11, P.accent2, { anchor:'middle', fw:600 }));
    els.push(text(px+promptCardW/2, 594, p[1], 11, P.accent2, { anchor:'middle', fw:600 }));
    els.push(text(px+promptCardW/2, 614, '→', 12, P.accent2, { anchor:'middle', fw:400 }));
  });

  // Save button
  els.push(rect(16, 634, W-32, 52, P.accent, { rx:14 }));
  els.push(text(W/2, 664, 'Save Entry', 16, P.white, { anchor:'middle', fw:600 }));

  // Discard link
  els.push(text(W/2, 700, 'Discard changes', 13, P.muted, { anchor:'middle', fw:400 }));

  bottomNav(2).forEach(e => els.push(e));
  return els;
}

// ── SCREEN 5: Goals ───────────────────────────────────────────────────────────
function screen5() {
  const els = [];

  els.push(rect(0, 0, W, H, P.bg));
  statusBar().forEach(e => els.push(e));

  // Header
  els.push(text(20, 72, 'Goals', 22, P.text, { fw:700 }));
  els.push(rect(W-88, 56, 68, 32, P.accent, { rx:10 }));
  els.push(text(W-54, 76, '+ Add', 13, P.white, { anchor:'middle', fw:600 }));

  els.push(text(20, 106, 'ACTIVE GOALS', 12, P.muted, { fw:600, ls:1.5 }));

  const goals = [
    {
      title: 'Read 24 Books',
      sub:   '4 of 24 complete',
      pct:   17,
      col:   P.accent2,
      colLight: P.accent2Light,
      badge: '84 days left',
      milestones: [true, false, false, false, false],
      next: '6 books',
    },
    {
      title: 'Daily Meditation',
      sub:   '47/90 day streak',
      pct:   52,
      col:   P.accent,
      colLight: P.accentLight,
      badge: '43 days left',
      milestones: [true, true, false, false, false],
      next: '60 days',
    },
    {
      title: '5K Under 25 min',
      sub:   'Current best: 27:14',
      pct:   65,
      col:   P.muted,
      colLight: P.card,
      badge: '30 days left',
      milestones: [true, true, true, false, false],
      next: 'Sub 26:00',
    },
  ];

  goals.forEach((g, i) => {
    const cardY = 120 + i*158;
    els.push(rect(16, cardY, W-32, 148, P.surface, { rx:14, stroke: P.border, sw:1 }));
    els.push(rect(16, cardY, 4, 148, g.col, { rx:2 }));
    els.push(text(32, cardY+26, g.title, 17, P.text, { fw:700 }));
    els.push(text(32, cardY+46, g.sub, 13, P.muted, { fw:400 }));

    // Days badge
    els.push(rect(W-100, cardY+14, 82, 24, g.colLight, { rx:12 }));
    els.push(text(W-59, cardY+30, g.badge, 11, g.col, { anchor:'middle', fw:600 }));

    // Progress bar
    els.push(rect(32, cardY+62, W-64, 8, P.border, { rx:4 }));
    els.push(rect(32, cardY+62, (W-64)*(g.pct/100), 8, g.col, { rx:4 }));
    // Pct label above bar end
    els.push(text(32+(W-64)*(g.pct/100), cardY+56, g.pct+'%', 10, g.col, { anchor:'middle', fw:700 }));

    // Milestone dots
    const dotSpacing = (W-64)/4;
    els.push(line(32, cardY+90, 32+(g.milestones.length-1)*dotSpacing, cardY+90, P.border, { sw:1 }));
    g.milestones.forEach((done, mi) => {
      const dx = 32 + mi*dotSpacing;
      els.push(circle(dx, cardY+90, 7, done ? g.col : P.surface, { stroke: done ? g.col : P.border, sw:1.5 }));
      if (done) els.push(text(dx, cardY+94, '✓', 8, P.white, { anchor:'middle', fw:700 }));
    });

    // Next milestone label
    els.push(text(32, cardY+112, 'Next →', 11, P.muted, { fw:400 }));
    els.push(text(72, cardY+112, g.next, 11, g.col, { fw:600 }));

    // Mini streak/progress indicator
    els.push(text(W-28, cardY+112, '↑ on track', 10, P.accent, { anchor:'end', fw:500 }));
  });

  // Completed Goals section
  const compY = 120 + goals.length*158 + 4;
  if (compY < H - 120) {
    els.push(text(20, compY, 'COMPLETED GOALS', 12, P.muted, { fw:600, ls:1.5 }));
    const completed = [
      { name:'30 Days No Sugar', date:'Mar 15' },
      { name:'Learn 500 Words',  date:'Feb 28' },
    ];
    completed.forEach((c, i) => {
      const cy2 = compY+18 + i*44;
      if (cy2 < H-90) {
        els.push(rect(16, cy2, W-32, 36, P.card, { rx:10, stroke: P.border, sw:1 }));
        els.push(circle(34, cy2+18, 9, P.accent, { opacity:0.35 }));
        els.push(text(34, cy2+22, '✓', 10, P.accent, { anchor:'middle', fw:700 }));
        els.push(text(52, cy2+22, c.name, 13, P.muted, { fw:400 }));
        els.push(text(W-28, cy2+22, c.date, 11, P.muted, { anchor:'end' }));
      }
    });
  }

  bottomNav(3).forEach(e => els.push(e));
  return els;
}

// ── SCREEN 6: Explore ─────────────────────────────────────────────────────────
function screen6() {
  const els = [];

  els.push(rect(0, 0, W, H, P.bg));
  statusBar().forEach(e => els.push(e));

  // Header
  els.push(text(20, 72, 'Explore', 22, P.text, { fw:700 }));
  els.push(circle(W-32, 68, 18, P.surface, { stroke: P.border, sw:1 }));
  els.push(text(W-32, 74, '⌕', 16, P.muted, { anchor:'middle' }));

  // Editorial hero display type
  els.push(text(20, 112, 'Build habits', 34, P.accent, { fw:700, ls:-0.5 }));
  els.push(text(20, 150, 'that stick.', 34, P.accent, { fw:700, ls:-0.5 }));
  // Accent decorations
  els.push(circle(W-30, 112, 10, P.accent2, {}));
  els.push(circle(W-44, 128, 5, P.accent2, { opacity:0.4 }));

  // Subtitle
  els.push(text(20, 174, 'Curated routines from 10,000+ growers', 14, P.muted, { fw:400 }));
  els.push(line(20, 186, W-20, 186, P.border, { sw:1 }));

  // Filter pills
  const filters = ['All','Mindfulness','Physical','Creative','Learning','Sleep'];
  let pillX = 20;
  filters.forEach((f, i) => {
    const pw = f.length*7 + 22;
    const isActive = i === 0;
    els.push(rect(pillX, 194, pw, 30, isActive ? P.accent : P.surface, { rx:15, stroke: isActive ? P.accent : P.border, sw:1 }));
    els.push(text(pillX+pw/2, 213, f, 12, isActive ? P.white : P.muted, { anchor:'middle', fw: isActive?600:400 }));
    pillX += pw + 8;
  });

  // Editorial habit cards
  const cards = [
    { title:'Morning Pages',  sub:'15 min · 89% stick rate', tag:'Creative',    accentCol: P.accent2, stickPct:89 },
    { title:'Box Breathing',  sub:'5 min · 94% stick rate',  tag:'Mindfulness', accentCol: P.accent,  stickPct:94 },
    { title:'Cold Shower',    sub:'5 min · 71% stick rate',  tag:'Physical',    accentCol: P.muted,   stickPct:71 },
    { title:'Digital Sunset', sub:'60 min before bed · 82%', tag:'Sleep',       accentCol: P.accent2, stickPct:82 },
  ];

  const cardStartY = 240;
  const cardH = 100;
  const cardGap = 10;

  cards.forEach((c, i) => {
    const cy = cardStartY + i*(cardH+cardGap);
    if (cy+cardH > H-90) return;

    els.push(rect(16, cy, W-32, cardH, P.surface, { rx:14, stroke: P.border, sw:1 }));
    els.push(rect(16, cy, 5, cardH, c.accentCol, { rx:2 }));

    // Editorial ordinal number
    els.push(text(30, cy+38, String(i+1).padStart(2,'0'), 30, P.border, { fw:700, ls:-1 }));

    // Title + sub
    els.push(text(72, cy+30, c.title, 17, P.text, { fw:700 }));
    els.push(text(72, cy+50, c.sub, 12, P.muted, { fw:400 }));

    // Tag pill
    const tagW = c.tag.length*7+18;
    const tagBg = c.accentCol === P.accent ? P.accentLight : P.accent2Light;
    els.push(rect(72, cy+60, tagW, 22, tagBg, { rx:11 }));
    els.push(text(72+tagW/2, cy+74, c.tag, 11, c.accentCol, { anchor:'middle', fw:600 }));

    // Add button
    els.push(circle(W-36, cy+cardH/2, 17, P.bg, { stroke: c.accentCol, sw:1.5 }));
    els.push(text(W-36, cy+cardH/2+6, '+', 20, c.accentCol, { anchor:'middle', fw:300 }));

    // Stick rate mini bar
    els.push(rect(W-82, cy+cardH-20, 42, 4, P.border, { rx:2 }));
    els.push(rect(W-82, cy+cardH-20, 42*(c.stickPct/100), 4, c.accentCol, { rx:2, opacity:0.65 }));
    els.push(text(W-82, cy+cardH-26, c.stickPct+'%', 9, c.accentCol, { fw:600 }));
  });

  // Load more
  const loadMoreY = cardStartY + cards.length*(cardH+cardGap);
  if (loadMoreY < H-90) {
    els.push(rect(16, loadMoreY, W-32, 38, P.card, { rx:10, stroke: P.border, sw:1 }));
    els.push(text(W/2, loadMoreY+23, 'Load more habits ↓', 13, P.muted, { anchor:'middle' }));
  }

  bottomNav(0).forEach(e => els.push(e));
  return els;
}

// ── Assemble & write ──────────────────────────────────────────────────────────
const screens = [
  { name:'Today',    slug:'today',    elements: screen1() },
  { name:'Session',  slug:'session',  elements: screen2() },
  { name:'Insights', slug:'insights', elements: screen3() },
  { name:'Journal',  slug:'journal',  elements: screen4() },
  { name:'Goals',    slug:'goals',    elements: screen5() },
  { name:'Explore',  slug:'explore',  elements: screen6() },
];

const totalElements = screens.reduce((s,sc) => s+sc.elements.length, 0);

const pen = {
  version: '2.8',
  meta: {
    name:      'GROVE',
    tagline:   'grow with intention',
    slug:      SLUG,
    theme:     'light',
    heartbeat: 100,
    archetype: 'wellness-productivity',
    palette:   P,
    canvas:    { width: W, height: H },
    totalElements,
    inspiration: 'Lapa Ninja editorial serif trend (Instrument Serif rising — 14 sites) + Landbook warm off-white background pattern (#F7F6F5) + DarkModeDesign single-accent strategy adapted for light mode',
    generated:   new Date().toISOString(),
  },
  screens,
};

const outPath = path.join(__dirname, 'grove.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2), 'utf8');

console.log(`GROVE: 6 screens, ${totalElements} elements`);
console.log(`Written: grove.pen`);
