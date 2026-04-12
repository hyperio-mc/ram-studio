'use strict';
const fs   = require('fs');
const path = require('path');

// ── NOVA — AI Writing Intelligence ─────────────────────────────────────────
// Dark ink theme. Electric lavender accents. 6 screens, 500+ elements.

const BG       = '#0C0D10';
const SURFACE  = '#14151A';
const CARD     = '#1A1B22';
const CARD2    = '#20222C';
const BORDER   = '#2A2D3A';
const BORDER2  = '#343748';
const TEXT     = '#EEEEF2';
const TEXT2    = '#9899A8';
const TEXT3    = '#60627A';
const ACCENT   = '#A78BFA';   // electric lavender
const ACCENT2  = '#7C3AED';   // deep violet
const ACCENT3  = '#C4B5FD';   // light lavender
const EMERALD  = '#34D399';   // success/streak
const AMBER    = '#FBBF24';   // warning/gold
const ROSE     = '#F87171';   // error/alert
const BLUE     = '#60A5FA';   // info/link
const W = 390;
const H = 844;

let elements = [];
let eid = 1;
function uid() { return `el-${eid++}`; }

function rect(x,y,w,h,fill,opts={}) {
  elements.push({ id:uid(), type:'rect', x, y, width:w, height:h, fill,
    rx: opts.rx||0, opacity: opts.opacity||1,
    stroke: opts.stroke||'none', strokeWidth: opts.sw||0 });
}
function text(x,y,content,size,fill,opts={}) {
  elements.push({ id:uid(), type:'text', x, y, content, fontSize:size, fill,
    fontWeight: opts.weight||'normal',
    fontFamily: opts.font||'Inter',
    textAnchor: opts.anchor||'start',
    opacity: opts.opacity||1 });
}
function circle(cx,cy,r,fill,opts={}) {
  elements.push({ id:uid(), type:'circle', cx, cy, r, fill,
    stroke: opts.stroke||'none', strokeWidth: opts.sw||0,
    opacity: opts.opacity||1 });
}
function line(x1,y1,x2,y2,stroke,sw=1,opts={}) {
  elements.push({ id:uid(), type:'line', x1, y1, x2, y2, stroke, strokeWidth:sw,
    opacity: opts.opacity||1 });
}

// ── Shared components ──────────────────────────────────────────────────────
function statusBar(yOffset=0) {
  rect(0, yOffset, W, 44, BG);
  text(20, yOffset+28, '9:41', 13, TEXT2, {weight:'500'});
  // battery + wifi
  rect(W-50, yOffset+16, 22, 11, 'none', {rx:2, stroke:TEXT3, sw:1.5});
  rect(W-48, yOffset+18, 14, 7, TEXT3, {rx:1});
  rect(W-26, yOffset+20, 3, 4, TEXT3, {rx:1});
  circle(W-66, yOffset+22, 3, TEXT3);
  circle(W-74, yOffset+22, 3, TEXT3);
  circle(W-82, yOffset+22, 3, TEXT3);
}

function bottomNav(yOffset, activeIdx) {
  rect(0, yOffset, W, 84, SURFACE);
  line(0, yOffset, W, yOffset, BORDER, 1);
  const tabs = [
    { icon:'⊞', label:'Home' },
    { icon:'✎', label:'Write' },
    { icon:'◈', label:'AI' },
    { icon:'◉', label:'Projects' },
    { icon:'◎', label:'Stats' },
  ];
  const tw = W / tabs.length;
  tabs.forEach((tab, i) => {
    const cx = tw * i + tw/2;
    const isActive = i === activeIdx;
    const clr = isActive ? ACCENT : TEXT3;
    if (isActive) rect(cx-20, yOffset+6, 40, 3, ACCENT, {rx:1.5});
    text(cx, yOffset+34, tab.icon, 18, clr, {anchor:'middle', weight: isActive?'600':'400'});
    text(cx, yOffset+54, tab.label, 9, clr, {anchor:'middle', weight: isActive?'600':'400'});
  });
}

function topBar(yOffset, title, opts={}) {
  rect(0, yOffset, W, 56, BG);
  line(0, yOffset+56, W, yOffset+56, BORDER, 0.5);
  if (opts.back) {
    text(20, yOffset+32, '←', 18, TEXT2);
    text(44, yOffset+32, title, 16, TEXT, {weight:'600'});
  } else {
    text(20, yOffset+34, title, 17, TEXT, {weight:'700', font:'Playfair Display'});
  }
  if (opts.action) {
    rect(W-80, yOffset+14, 60, 28, ACCENT2, {rx:14});
    text(W-50, yOffset+31, opts.action, 11, TEXT, {weight:'600', anchor:'middle'});
  }
  if (opts.dots) {
    circle(W-20, yOffset+28, 2.5, TEXT3);
    circle(W-28, yOffset+28, 2.5, TEXT3);
    circle(W-36, yOffset+28, 2.5, TEXT3);
  }
}

function pill(x, y, w, h, fill, label, textColor, textSize=10) {
  rect(x, y, w, h, fill, {rx: h/2});
  text(x + w/2, y + h/2 + textSize*0.35, label, textSize, textColor, {anchor:'middle', weight:'600'});
}

function progressBar(x, y, totalW, h, pct, fillColor, bgColor=BORDER) {
  rect(x, y, totalW, h, bgColor, {rx: h/2});
  rect(x, y, Math.max(4, totalW * pct), h, fillColor, {rx: h/2});
}

function card(x, y, w, h, fill=CARD) {
  rect(x, y, w, h, fill, {rx:16});
}

// ══════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Home Dashboard
// ══════════════════════════════════════════════════════════════════════════
function buildScreen1() {
  elements = [];
  rect(0, 0, W, H, BG);
  statusBar(0);

  // top bar
  rect(0, 44, W, 60, BG);
  text(20, 72, 'Good evening, Ram', 16, TEXT, {weight:'600'});
  text(20, 90, 'Your writing momentum is strong', 11, EMERALD);
  // avatar
  circle(W-34, 72, 18, ACCENT2);
  text(W-34, 77, 'R', 14, TEXT, {anchor:'middle', weight:'700'});

  // streak card
  card(16, 116, W-32, 90, CARD);
  rect(16, 116, W-32, 90, 'none', {rx:16, stroke:ACCENT2, sw:1});
  // streak glow
  rect(16, 116, W-32, 30, ACCENT2, {rx:16, opacity:0.15});
  text(32, 143, '🔥', 18);
  text(58, 143, '24-day streak', 14, TEXT, {weight:'700'});
  pill(W-76, 126, 56, 22, ACCENT2+'44', 'WRITING', ACCENT3, 9);
  text(32, 164, 'You\'ve written every day for 3 weeks 4 days', 11, TEXT2);
  // spark line
  const sparkY = 186;
  const sparkData = [0.3,0.5,0.4,0.7,0.6,0.8,0.9,0.7,1.0,0.8,0.9,0.95,1.0];
  for (let i=0; i<sparkData.length-1; i++) {
    const x1 = 32 + i*22, x2 = 32 + (i+1)*22;
    const y1 = sparkY - sparkData[i]*20, y2 = sparkY - sparkData[i+1]*20;
    line(x1,y1,x2,y2,ACCENT,2);
    circle(x2,y2,2.5,ACCENT);
  }
  text(W-52, sparkY-12, '+18%', 10, EMERALD, {weight:'600'});

  // stats row
  const stats = [
    { label:'Words Today', val:'2,847', unit:'', color:ACCENT },
    { label:'Clarity Score', val:'87', unit:'/100', color:EMERALD },
    { label:'Focus Time', val:'3.2', unit:'h', color:AMBER },
  ];
  const sw3 = (W-32-16) / 3;
  stats.forEach((s, i) => {
    const sx = 16 + i * (sw3 + 8);
    card(sx, 222, sw3, 72, CARD);
    text(sx + sw3/2, 248, s.val, 22, s.color, {weight:'700', anchor:'middle'});
    text(sx + sw3/2, 262, s.unit, 11, TEXT3, {anchor:'middle'});
    text(sx + sw3/2, 280, s.label, 9, TEXT2, {anchor:'middle'});
  });

  // Today's projects section
  text(20, 316, 'Active Projects', 13, TEXT, {weight:'700'});
  text(W-60, 316, 'See all →', 11, ACCENT);

  const projects = [
    { name:'The Signal Newsletter', words:'4.2k / 5k', pct:0.84, tag:'In Progress', tagColor:AMBER },
    { name:'Product Case Study', words:'1.8k / 8k', pct:0.22, tag:'Draft', tagColor:BLUE },
    { name:'Agency Pitch Deck', words:'890 / 2k', pct:0.44, tag:'Review', tagColor:EMERALD },
  ];
  projects.forEach((p, i) => {
    const py = 328 + i * 76;
    card(16, py, W-32, 66, CARD);
    text(30, py+22, p.name, 13, TEXT, {weight:'600'});
    pill(W-80, py+10, 58, 18, p.tagColor+'22', p.tag, p.tagColor, 9);
    text(30, py+40, p.words + ' words', 11, TEXT2);
    progressBar(30, py+52, W-72, 6, p.pct, ACCENT);
    text(W-34, py+57, Math.round(p.pct*100)+'%', 9, TEXT3, {anchor:'end'});
  });

  // AI Insight card
  card(16, 560, W-32, 80, CARD2);
  rect(16, 560, 3, 80, ACCENT, {rx:2});
  text(30, 582, '✦ AI Insight', 11, ACCENT, {weight:'600'});
  text(30, 600, 'Your clarity score peaks between 9–11am.', 12, TEXT);
  text(30, 618, 'Schedule deep writing sessions in that window.', 12, TEXT2);
  text(W-40, 598, '→', 20, ACCENT3);

  // Quick start
  text(20, 658, 'Quick Start', 13, TEXT, {weight:'700'});
  const quickBtns = ['New Draft', 'Continue', 'Brainstorm', 'Outline'];
  quickBtns.forEach((b, i) => {
    const bx = 16 + i * 89;
    rect(bx, 668, 78, 32, CARD, {rx:8, stroke:BORDER2, sw:1});
    text(bx+39, 688, b, 10, TEXT2, {anchor:'middle', weight:'500'});
  });

  bottomNav(H-84, 0);
  return elements;
}

// ══════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Editor View
// ══════════════════════════════════════════════════════════════════════════
function buildScreen2() {
  elements = [];
  rect(0, 0, W, H, BG);
  statusBar(0);

  // Toolbar
  rect(0, 44, W, 48, SURFACE);
  line(0, 92, W, 92, BORDER, 0.5);
  const tools = ['B','I','U','≡','⊞','✦'];
  tools.forEach((t,i) => {
    const isActive = i === 0;
    if (isActive) rect(10 + i*40, 52, 32, 32, ACCENT2, {rx:8});
    text(26 + i*40, 73, t, 14, isActive ? TEXT : TEXT3, {anchor:'middle', weight:'600'});
    if (i < tools.length-1) line(46+i*40, 60, 46+i*40, 76, BORDER, 1, {opacity:0.5});
  });
  // right tools
  rect(W-80, 52, 64, 32, CARD, {rx:16, stroke:BORDER, sw:1});
  circle(W-66, 68, 6, ACCENT2);
  text(W-55, 72, '2847', 11, TEXT2);

  // Document title area
  rect(0, 92, W, 72, BG);
  pill(20, 102, 78, 18, AMBER+'22', 'IN PROGRESS', AMBER, 8);
  text(20, 138, 'The Signal Newsletter', 20, TEXT, {weight:'700', font:'Playfair Display'});

  // Word count bar
  rect(0, 164, W, 28, CARD);
  progressBar(16, 170, W-32, 8, 0.84, ACCENT);
  text(16, 198, '4,214 words', 9, TEXT3);
  text(W-16, 198, '5,000 goal', 9, TEXT3, {anchor:'end'});

  // Document body - lines of text
  const bodyY = 200;
  const bodyLines = [
    { txt:'The infrastructure of attention', size:15, fill:TEXT, weight:'700', y:bodyY+20 },
    { txt:'Last week I noticed something strange:', size:13, fill:TEXT2, weight:'400', y:bodyY+44 },
    { txt:'every app I opened was competing', size:13, fill:TEXT2, weight:'400', y:bodyY+62 },
    { txt:'for the same 30-minute window.', size:13, fill:TEXT2, weight:'400', y:bodyY+80 },
    { txt:'', size:13, fill:TEXT2, weight:'400', y:bodyY+98 },
    { txt:'The real question isn\'t which app', size:13, fill:TEXT2, weight:'400', y:bodyY+116 },
    { txt:'wins — it\'s what the competition', size:13, fill:TEXT2, weight:'400', y:bodyY+134 },
    { txt:'costs us as creators.', size:13, fill:TEXT2, weight:'400', y:bodyY+152 },
    { txt:'', size:13, fill:TEXT2, weight:'400', y:bodyY+170 },
    { txt:'Three signals stood out:', size:13, fill:TEXT, weight:'600', y:bodyY+188 },
  ];
  bodyLines.forEach(l => text(20, l.y, l.txt, l.size, l.fill, {weight:l.weight}));

  // AI inline suggestion
  rect(16, bodyY+200, W-32, 48, ACCENT2+'18', {rx:10, stroke:ACCENT2+'44', sw:1});
  text(28, bodyY+218, '✦', 12, ACCENT3);
  text(44, bodyY+218, 'AI Suggestion', 10, ACCENT3, {weight:'600'});
  text(28, bodyY+236, '"Signal fatigue is the hidden tax on creator productivity"', 11, ACCENT3, {font:'Inter'});

  // accept/decline buttons
  pill(28, bodyY+252, 60, 22, ACCENT2, 'Accept', TEXT, 10);
  pill(96, bodyY+252, 58, 22, CARD, 'Skip', TEXT3, 10);

  // cursor blink indicator
  rect(20, bodyY+274, 2, 16, ACCENT, {rx:1, opacity:0.9});

  // more lines
  for (let i=0; i<3; i++) {
    rect(20, bodyY+298+i*20, [W-80, W-120, W-160][i], 10, BORDER, {rx:5, opacity:0.6});
  }

  // Bottom writing bar
  rect(0, H-116, W, 32, CARD);
  line(0, H-116, W, H-116, BORDER, 0.5);
  const wstats = ['4,214 words','267 lines','18 min read','87 clarity'];
  wstats.forEach((ws,i) => {
    text(20 + i*93, H-96, ws, 9, TEXT3);
    if (i<3) text(20 + i*93 + 72, H-96, '·', 9, TEXT3);
  });

  bottomNav(H-84, 1);
  return elements;
}

// ══════════════════════════════════════════════════════════════════════════
// SCREEN 3 — AI Chat Assistant
// ══════════════════════════════════════════════════════════════════════════
function buildScreen3() {
  elements = [];
  rect(0, 0, W, H, BG);
  statusBar(0);
  topBar(44, 'Nova AI', {dots:true});

  // Model badge
  rect(0, 100, W, 36, CARD);
  line(0, 136, W, 136, BORDER, 0.5);
  circle(24, 118, 8, ACCENT2);
  text(24, 122, '✦', 9, TEXT, {anchor:'middle'});
  text(38, 122, 'Nova Pro · GPT-4 class · Context-aware', 11, TEXT2);
  pill(W-70, 108, 54, 20, EMERALD+'22', 'ONLINE', EMERALD, 9);

  // Chat messages
  const msgY = 148;

  // User message
  rect(80, msgY, W-96, 50, ACCENT2, {rx:16});
  rect(80, msgY, 24, 50, ACCENT2, {rx:0});
  rect(80, msgY, W-96, 50, 'none', {rx:16, stroke:'none'});
  // redraw properly
  rect(80, msgY, W-96, 50, ACCENT2, {rx:12});
  text(94, msgY+18, 'Help me sharpen the opening', 12, TEXT);
  text(94, msgY+36, 'section of The Signal Newsletter', 12, TEXT);
  circle(W-24, msgY+10, 10, ACCENT2+'88');
  text(W-24, msgY+14, 'R', 9, TEXT, {anchor:'middle', weight:'700'});

  // AI response
  rect(16, msgY+64, W-80, 140, CARD, {rx:12});
  circle(24, msgY+74, 10, ACCENT2);
  text(24, msgY+78, '✦', 8, TEXT, {anchor:'middle'});
  text(36, msgY+78, 'Nova', 10, ACCENT3, {weight:'600'});

  const aiMsg = [
    'The opening is strong but buries the',
    'hook. Consider leading with the',
    '"infrastructure of attention" metaphor',
    '— it\'s your most original insight.',
    '',
    'Revised opening:',
    '"Attention has infrastructure now."',
    '"And most of us are paying rent."',
  ];
  aiMsg.forEach((ln, i) => {
    const isQuote = i >= 6;
    text(28, msgY+96+i*16, ln, 11, isQuote ? ACCENT3 : TEXT2);
  });

  // Source cards
  text(28, msgY+228, '3 sources cited', 10, TEXT3);
  const sources = ['Writings', 'Newsletter vol.3', 'Style Guide'];
  sources.forEach((s, i) => {
    rect(28 + i*108, msgY+242, 100, 28, CARD2, {rx:8, stroke:BORDER, sw:1});
    text(44 + i*108, msgY+260, s, 9, TEXT2);
    text(32 + i*108, msgY+260, '◈', 9, ACCENT3);
  });

  // Another user message
  rect(80, msgY+284, W-96, 30, ACCENT2, {rx:12});
  text(94, msgY+303, 'What\'s my avg clarity this week?', 12, TEXT);

  // AI response with chart
  rect(16, msgY+328, W-80, 90, CARD, {rx:12});
  text(28, msgY+348, 'Your clarity this week:', 11, TEXT2);
  text(28, msgY+364, '87 avg', 20, EMERALD, {weight:'700'});
  text(78, msgY+364, '↑12% vs last week', 11, EMERALD);
  // mini bar chart
  const bars = [72, 79, 85, 83, 88, 91, 87];
  bars.forEach((v, i) => {
    const bw = 24, bx = 28 + i*30;
    const bh = (v/100)*32;
    rect(bx, msgY+406-bh, bw, bh, ACCENT+(i===6?'':'66'), {rx:3});
    text(bx+12, msgY+416, ['M','T','W','T','F','S','S'][i], 7, TEXT3, {anchor:'middle'});
  });

  // Input bar
  rect(0, H-116, W, 32, BG);
  line(0, H-116, W, H-116, BORDER, 0.5);
  rect(16, H-110, W-80, 26, CARD, {rx:13, stroke:BORDER2, sw:1});
  text(32, H-93, 'Ask Nova anything about your writing...', 11, TEXT3);
  rect(W-58, H-112, 40, 30, ACCENT2, {rx:15});
  text(W-38, H-93, '↑', 14, TEXT, {anchor:'middle', weight:'700'});

  bottomNav(H-84, 2);
  return elements;
}

// ══════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Projects Overview
// ══════════════════════════════════════════════════════════════════════════
function buildScreen4() {
  elements = [];
  rect(0, 0, W, H, BG);
  statusBar(0);
  topBar(44, 'Projects', {action:'+ New'});

  // Filter pills
  rect(0, 100, W, 40, BG);
  const filters = ['All (8)', 'Writing', 'Research', 'Drafts'];
  let fpx = 16;
  filters.forEach((f, i) => {
    const fw = f.length * 7 + 24;
    rect(fpx, 108, fw, 24, i===0 ? ACCENT2 : CARD, {rx:12, stroke: i===0?'none':BORDER, sw:1});
    text(fpx + fw/2, 124, f, 10, i===0 ? TEXT : TEXT3, {anchor:'middle', weight:'500'});
    fpx += fw + 8;
  });

  // Project cards
  const projects = [
    { name:'The Signal Newsletter', tag:'In Progress', tagColor:AMBER, words:'4,214', goal:'5,000', pct:0.84, due:'Apr 12', collab:3 },
    { name:'Product Case Study', tag:'Draft', tagColor:BLUE, words:'1,847', goal:'8,000', pct:0.23, due:'Apr 28', collab:1 },
    { name:'Agency Pitch Deck', tag:'Review', tagColor:EMERALD, words:'890', goal:'2,000', pct:0.44, due:'Apr 10', collab:2 },
    { name:'Research: AI Writing Tools', tag:'Research', tagColor:ACCENT, words:'6,102', goal:'6,000', pct:1.0, due:'Done', collab:1 },
  ];

  projects.forEach((p, i) => {
    const py = 152 + i * 130;
    card(16, py, W-32, 118, CARD);
    // accent left bar
    rect(16, py, 3, 118, p.tagColor, {rx:2});

    // header
    pill(30, py+12, p.tag.length*7+16, 20, p.tagColor+'22', p.tag, p.tagColor, 9);
    if (p.pct >= 1.0) pill(W-70, py+12, 52, 20, EMERALD+'22', '✓ DONE', EMERALD, 9);

    text(30, py+46, p.name, 14, TEXT, {weight:'600'});

    // word count
    text(30, py+64, p.words + ' / ' + p.goal + ' words', 11, TEXT2);
    progressBar(30, py+76, W-72, 6, Math.min(p.pct, 1.0), p.tagColor);

    // due date + collaborators
    text(30, py+98, '📅 Due ' + p.due, 10, TEXT3);

    // collab avatars
    for (let c=0; c<Math.min(p.collab,3); c++) {
      const cx = W-40 - c*22;
      circle(cx, py+96, 9, ACCENT2+'77');
      text(cx, py+100, String.fromCharCode(65+c+i), 8, TEXT, {anchor:'middle', weight:'600'});
    }

    // word count %
    text(W-30, py+80, Math.round(Math.min(p.pct,1)*100)+'%', 9, p.tagColor, {anchor:'end', weight:'600'});
  });

  // Create new project card
  const newPy = 152 + 4*130;
  rect(16, newPy, W-32, 56, 'none', {rx:16, stroke:BORDER2, sw:1});
  text(W/2, newPy+32, '+ Start a new project', 13, TEXT3, {anchor:'middle'});

  bottomNav(H-84, 3);
  return elements;
}

// ══════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Writing Analytics
// ══════════════════════════════════════════════════════════════════════════
function buildScreen5() {
  elements = [];
  rect(0, 0, W, H, BG);
  statusBar(0);
  topBar(44, 'Analytics', {dots:true});

  // Period selector
  rect(0, 100, W, 36, BG);
  const periods = ['7D','30D','90D','Year'];
  const pw = 64;
  periods.forEach((p, i) => {
    const isActive = i===0;
    rect(16 + i*(pw+6), 104, pw, 24, isActive ? ACCENT2 : CARD, {rx:12});
    text(16 + i*(pw+6) + pw/2, 120, p, 11, isActive ? TEXT : TEXT3, {anchor:'middle', weight:'500'});
  });

  // Big metric
  rect(16, 148, W-32, 100, CARD, {rx:16});
  rect(16, 148, W-32, 40, ACCENT2, {rx:16, opacity:0.2});
  text(30, 173, 'Total Words Written', 11, TEXT2);
  text(30, 210, '47,821', 36, TEXT, {weight:'700', font:'Playfair Display'});
  text(154, 210, 'words', 14, TEXT2);
  pill(W-90, 156, 64, 22, EMERALD+'22', '↑ 23%', EMERALD, 11);
  text(W-90+6, 232, 'vs prev week', 9, TEXT3);

  // Weekly bar chart
  text(20, 264, 'Daily Words', 13, TEXT, {weight:'600'});
  const wkData = [1200,2100,1800,2847,2200,1600,900];
  const wkLabels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const maxW = 2847;
  const chartH = 100, chartY = 280, barW = 34, gap = 10;
  const chartX = (W - 7*(barW+gap) + gap) / 2;
  wkData.forEach((v, i) => {
    const bx = chartX + i*(barW+gap);
    const bh = (v/maxW)*chartH;
    const isToday = i===3;
    const barFill = isToday ? ACCENT : CARD2;
    rect(bx, chartY+chartH-bh, barW, bh, barFill, {rx:6});
    if (isToday) {
      rect(bx, chartY+chartH-bh, barW, bh, ACCENT2, {rx:6, opacity:0.3});
      text(bx+barW/2, chartY+chartH-bh-8, '2.8k', 8, ACCENT3, {anchor:'middle', weight:'600'});
    }
    text(bx+barW/2, chartY+chartH+14, wkLabels[i], 9, TEXT3, {anchor:'middle'});
  });

  // Clarity score trend
  text(20, 406, 'Clarity Score', 13, TEXT, {weight:'600'});
  const clarityData = [71, 76, 78, 82, 80, 85, 87];
  const cChartX = 16, cChartW = W-32, cChartH = 60, cChartY = 420;
  rect(cChartX, cChartY, cChartW, cChartH+20, CARD, {rx:12});
  clarityData.forEach((v, i) => {
    if (i < clarityData.length-1) {
      const x1 = cChartX + 20 + i*((cChartW-40)/6);
      const x2 = cChartX + 20 + (i+1)*((cChartW-40)/6);
      const y1 = cChartY+cChartH - (v/100)*cChartH+10;
      const y2 = cChartY+cChartH - (clarityData[i+1]/100)*cChartH+10;
      line(x1,y1,x2,y2,ACCENT,2);
      circle(x1,y1,3,ACCENT);
      if (i===clarityData.length-2) circle(x2,y2,5,ACCENT);
    }
  });
  text(cChartX+cChartW-16, cChartY+12, '87', 12, ACCENT, {anchor:'end', weight:'700'});
  text(cChartX+16, cChartY+cChartH+10, '71', 9, TEXT3);

  // Writing time heatmap
  text(20, 508, 'Peak Writing Hours', 13, TEXT, {weight:'600'});
  const heatY = 524;
  for (let row=0; row<3; row++) {
    for (let col=0; col<8; col++) {
      const intensity = Math.random();
      const isHot = (row===1 && col>=2 && col<=4);
      const fill = isHot ? ACCENT : CARD;
      const opacity = isHot ? 0.7+col*0.05 : 0.3+intensity*0.2;
      rect(16 + col*44, heatY+row*20, 40, 16, fill, {rx:4, opacity:opacity});
    }
  }
  const hours = ['6am','8am','10am','12pm','2pm','4pm','6pm','8pm'];
  hours.forEach((h,i) => text(36 + i*44, heatY+76, h, 7, TEXT3, {anchor:'middle'}));
  // day labels
  ['Mon','Wed','Fri'].forEach((d,i) => text(W-40, heatY+i*20+12, d, 7, TEXT3));

  // Bottom quick stats
  const qstats = [
    {label:'Avg session', val:'47 min'},
    {label:'Best day', val:'Thursday'},
    {label:'Longest streak', val:'38 days'},
  ];
  qstats.forEach((s,i) => {
    const qx = 16 + i * ((W-32)/3);
    const qw = (W-32)/3 - 4;
    card(qx, heatY+90, qw, 50, CARD);
    text(qx + qw/2, heatY+114, s.val, 13, ACCENT, {anchor:'middle', weight:'700'});
    text(qx + qw/2, heatY+128, s.label, 9, TEXT2, {anchor:'middle'});
  });

  bottomNav(H-84, 4);
  return elements;
}

// ══════════════════════════════════════════════════════════════════════════
// SCREEN 6 — Settings & Profile
// ══════════════════════════════════════════════════════════════════════════
function buildScreen6() {
  elements = [];
  rect(0, 0, W, H, BG);
  statusBar(0);
  topBar(44, 'Profile', {dots:true});

  // Profile header
  rect(0, 100, W, 120, SURFACE);
  line(0, 220, W, 220, BORDER, 0.5);

  // Avatar ring
  circle(W/2, 148, 36, ACCENT2+'44');
  circle(W/2, 148, 30, ACCENT2);
  text(W/2, 154, 'R', 22, TEXT, {anchor:'middle', weight:'700'});
  // ring arc decoration
  rect(W/2-34, 150, 68, 4, ACCENT2, {rx:2, opacity:0.4});

  text(W/2, 196, 'Ram Narasimhan', 16, TEXT, {anchor:'middle', weight:'700'});
  text(W/2, 212, 'Writer & Product Designer · Joined Jan 2026', 11, TEXT2, {anchor:'middle'});

  // Stats row
  const pstats = [{label:'Designs', val:'262'},{label:'Streak', val:'24d'},{label:'Words', val:'47.8k'}];
  pstats.forEach((s,i) => {
    const px = 16 + i * ((W-32)/3);
    const pw = (W-32)/3;
    text(px + pw/2, 248, s.val, 18, ACCENT, {anchor:'middle', weight:'700'});
    text(px + pw/2, 264, s.label, 10, TEXT2, {anchor:'middle'});
    if (i < 2) line(px+pw, 238, px+pw, 268, BORDER, 1);
  });

  // Settings sections
  const sections = [
    { title:'Writing Preferences', items:[
      { icon:'✎', label:'Default word goal', val:'5,000' },
      { icon:'⏱', label:'Focus session length', val:'45 min' },
      { icon:'✦', label:'AI suggestion frequency', val:'Medium' },
    ]},
    { title:'Nova AI', items:[
      { icon:'◈', label:'Model', val:'Nova Pro' },
      { icon:'◉', label:'Writing style', val:'Analytical' },
      { icon:'⊞', label:'Context memory', val:'Extended' },
    ]},
    { title:'Notifications', items:[
      { icon:'◷', label:'Daily writing reminder', val:'9:00 AM' },
      { icon:'🔥', label:'Streak alerts', val:'On' },
    ]},
  ];

  let sy = 284;
  sections.forEach(sec => {
    text(20, sy, sec.title, 11, TEXT3, {weight:'600'});
    sy += 14;
    card(16, sy, W-32, sec.items.length*48+8, CARD);
    sec.items.forEach((item, idx) => {
      const iy = sy + 4 + idx*48;
      text(32, iy+28, item.icon, 16, ACCENT);
      text(58, iy+28, item.label, 13, TEXT);
      text(W-28, iy+28, item.val, 12, TEXT3, {anchor:'end'});
      text(W-18, iy+28, '›', 14, TEXT3, {anchor:'end'});
      if (idx < sec.items.length-1) line(32, iy+48, W-32, iy+48, BORDER, 0.5);
    });
    sy += sec.items.length*48 + 8 + 20;
  });

  // Sign out
  rect(16, sy, W-32, 44, ROSE+'18', {rx:12, stroke:ROSE+'33', sw:1});
  text(W/2, sy+26, 'Sign out', 13, ROSE, {anchor:'middle', weight:'600'});

  bottomNav(H-84, 0);
  return elements;
}

// ── Pencil renderer ────────────────────────────────────────────────────────
function toSvg(els) {
  const items = els.map(el => {
    if (el.type==='rect') {
      const r = el.rx ? ` rx="${el.rx}"` : '';
      const s = el.stroke!=='none' ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth}"` : '';
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}"${r}${s} opacity="${el.opacity||1}"/>`;
    }
    if (el.type==='text') {
      const fw = el.fontWeight!=='normal' ? ` font-weight="${el.fontWeight}"` : '';
      const ff = el.fontFamily ? ` font-family="${el.fontFamily}, sans-serif"` : '';
      const ta = el.textAnchor && el.textAnchor!=='start' ? ` text-anchor="${el.textAnchor}"` : '';
      const op = el.opacity!==1 ? ` opacity="${el.opacity}"` : '';
      return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}"${fw}${ff}${ta}${op}>${el.content}</text>`;
    }
    if (el.type==='circle') {
      const s = el.stroke!=='none' ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth}"` : '';
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}"${s} opacity="${el.opacity||1}"/>`;
    }
    if (el.type==='line') {
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" opacity="${el.opacity||1}"/>`;
    }
    return '';
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${items.join('')}</svg>`;
}

const screenBuilders = [
  { fn: buildScreen1, name: 'Home Dashboard' },
  { fn: buildScreen2, name: 'Editor' },
  { fn: buildScreen3, name: 'AI Chat' },
  { fn: buildScreen4, name: 'Projects' },
  { fn: buildScreen5, name: 'Analytics' },
  { fn: buildScreen6, name: 'Profile' },
];

const pen = {
  version: '2.8',
  metadata: {
    name: 'Nova — AI Writing Intelligence',
    description: 'Dark AI writing workspace. 6 screens, electric lavender accents.',
    author: 'RAM',
    created: new Date().toISOString(),
  },
  screens: screenBuilders.map(({ fn, name }) => {
    const els = fn();
    return { name, svg: toSvg(els), elements: els };
  }),
};

const total = pen.screens.reduce((a,s) => a + s.elements.length, 0);
console.log(`NOVA: ${pen.screens.length} screens, ${total} elements`);

fs.writeFileSync(
  path.join(__dirname, 'nova.pen'),
  JSON.stringify(pen, null, 2)
);
console.log('Written: nova.pen');
