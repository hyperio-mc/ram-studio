'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG      = 'mote';
const NAME      = 'MOTE';
const TAGLINE   = 'moments, distilled';
const THEME     = 'light';
const HEARTBEAT = 421;
const DATE      = new Date().toISOString().split('T')[0];

const W = 390, H = 844;

// ── Warm cream editorial palette ─────────────────────────────────────────────
const BG    = '#FAF8F4';   // warm cream
const SURF  = '#FFFFFF';   // pure white surface
const CARD  = '#F4F0E8';   // warm beige card
const TEXT  = '#1C1917';   // warm near-black
const TEXT2 = '#78716C';   // warm stone mid
const TEXT3 = '#A8A29E';   // light stone muted
const ACC   = '#C2410C';   // terracotta rust (primary accent)
const ACC_L = '#FFF1EC';   // accent light tint
const ACC2  = '#4D7C5C';   // sage green (secondary)
const ACC2L = '#EEF5F1';   // sage light tint
const BORD  = '#E7E1D8';   // warm border
const MOOD1 = '#E57373';   // rough – warm red
const MOOD2 = '#FFAB76';   // low – warm orange
const MOOD3 = '#F4CC72';   // okay – amber
const MOOD4 = '#81C784';   // good – soft green
const MOOD5 = '#4D7C5C';   // great – sage (= ACC2)

// ── Primitives ────────────────────────────────────────────────────────────────
const SAR = 'Georgia, "Times New Roman", serif';
const SAN = '"Helvetica Neue", Arial, system-ui, sans-serif';

function rect(x,y,w,h,fill,opts={}) {
  return {type:'rect',x,y,w,h,fill,rx:opts.rx??0,opacity:opts.opacity??1,stroke:opts.stroke??'none',sw:opts.sw??0};
}
function text(x,y,content,size,fill,opts={}) {
  return {type:'text',x,y,content,size,fill,fw:opts.fw??'400',font:opts.font??SAN,anchor:opts.anchor??'start',ls:opts.ls??'0',opacity:opts.opacity??1};
}
function circle(cx,cy,r,fill,opts={}) {
  return {type:'circle',cx,cy,r,fill,opacity:opts.opacity??1,stroke:opts.stroke??'none',sw:opts.sw??0};
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  return {type:'line',x1,y1,x2,y2,stroke,sw:opts.sw??1,opacity:opts.opacity??1};
}

function toSvgString(elements) {
  return elements.map(el => {
    if (el.type === 'rect')
      return `<rect x="${el.x}" y="${el.y}" width="${el.w}" height="${el.h}" fill="${el.fill}" rx="${el.rx}" opacity="${el.opacity}" stroke="${el.stroke}" stroke-width="${el.sw}"/>`;
    if (el.type === 'text')
      return `<text x="${el.x}" y="${el.y}" font-size="${el.size}" fill="${el.fill}" font-weight="${el.fw}" font-family="${el.font}" text-anchor="${el.anchor}" letter-spacing="${el.ls}" opacity="${el.opacity}">${el.content}</text>`;
    if (el.type === 'circle')
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity}" stroke="${el.stroke}" stroke-width="${el.sw}"/>`;
    if (el.type === 'line')
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.sw}" opacity="${el.opacity}"/>`;
    return '';
  }).join('\n    ');
}

function makeSvg(elements) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">\n    ${toSvgString(elements)}\n</svg>`;
}

// ── Shared components ─────────────────────────────────────────────────────────
function statusBar(els) {
  els.push(rect(0, 0, W, 44, SURF));
  els.push(text(20, 28, '9:41', 14, TEXT, {fw:'600', font:SAN}));
  els.push(rect(335, 18, 32, 12, TEXT, {rx:3}));
  els.push(rect(336, 19, 28, 10, SURF, {rx:2}));
  els.push(rect(337, 20, 18, 8, TEXT, {rx:1}));
  els.push(rect(367, 21, 3, 6, TEXT, {rx:1}));
  els.push(circle(320, 24, 5, 'none', {stroke:TEXT, sw:1.5}));
  els.push(circle(320, 24, 3, TEXT));
  els.push(circle(306, 24, 5, 'none', {stroke:TEXT, sw:1.5}));
  els.push(circle(306, 24, 2, TEXT));
}

function navBar(els, active = 'home') {
  const NY = H - 80;
  els.push(rect(0, NY, W, 80, SURF));
  els.push(line(0, NY, W, NY, BORD, {sw:1}));
  const tabs = [
    {id:'home',    label:'today',   x:58},
    {id:'capture', label:'add',     x:147},
    {id:'archive', label:'archive', x:243},
    {id:'profile', label:'you',     x:336},
  ];
  tabs.forEach(tab => {
    const on = tab.id === active;
    // nav icon – small geometric shape
    if (tab.id === 'home') {
      els.push(rect(tab.x-10, NY+12, 20, 16, 'none', {stroke:on?ACC:TEXT3, sw:1.5, rx:2}));
      els.push(rect(tab.x-5,  NY+20, 10, 8,  on?ACC:TEXT3, {rx:1}));
    } else if (tab.id === 'capture') {
      els.push(circle(tab.x, NY+20, 10, 'none', {stroke:on?ACC:TEXT3, sw:1.5}));
      els.push(line(tab.x, NY+12, tab.x, NY+28, on?ACC:TEXT3, {sw:1.5}));
      els.push(line(tab.x-8, NY+20, tab.x+8, NY+20, on?ACC:TEXT3, {sw:1.5}));
    } else if (tab.id === 'archive') {
      els.push(rect(tab.x-9, NY+13, 18, 15, 'none', {stroke:on?ACC:TEXT3, sw:1.5, rx:2}));
      els.push(line(tab.x-6, NY+11, tab.x-6, NY+15, on?ACC:TEXT3, {sw:1.5}));
      els.push(line(tab.x+6, NY+11, tab.x+6, NY+15, on?ACC:TEXT3, {sw:1.5}));
      els.push(line(tab.x-6, NY+20, tab.x+6, NY+20, on?ACC:TEXT3, {sw:1}));
      els.push(line(tab.x-6, NY+24, tab.x+4, NY+24, on?ACC:TEXT3, {sw:1}));
    } else {
      els.push(circle(tab.x, NY+16, 7, 'none', {stroke:on?ACC:TEXT3, sw:1.5}));
      els.push(rect(tab.x-11, NY+25, 22, 7, 'none', {stroke:on?ACC:TEXT3, sw:1.5, rx:3}));
    }
    els.push(text(tab.x, NY+54, tab.label, 10, on?ACC:TEXT3, {
      fw: on?'600':'400', anchor:'middle', font:SAN, ls:'0.04em'
    }));
  });
}

// ── SCREEN 1: Today ───────────────────────────────────────────────────────────
function screen1() {
  const els = [];
  // Background
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  // App header
  els.push(rect(0, 44, W, 60, BG));
  els.push(text(24, 76, 'mote', 28, TEXT, {fw:'700', font:SAR}));
  els.push(text(24, 96, 'Thursday, April 10', 12, TEXT3, {font:SAN, ls:'0.02em'}));
  // Avatar
  els.push(circle(356, 72, 22, CARD));
  els.push(circle(356, 72, 22, 'none', {stroke:BORD, sw:1}));
  els.push(text(356, 78, 'RK', 13, TEXT2, {fw:'600', anchor:'middle', font:SAN}));

  // Mood hero card (bento: full-width, tall)
  const MX = 20, MY = 112, MW = 350, MH = 148;
  els.push(rect(MX, MY, MW, MH, SURF, {rx:14, stroke:BORD, sw:1}));
  // accent top-left corner bar
  els.push(rect(MX, MY, 3, MH, ACC, {rx:2}));
  els.push(text(MX+18, MY+26, 'HOW ARE YOU FEELING?', 10, TEXT3, {font:SAN, ls:'0.1em'}));
  // 5 mood circles
  const moods = [
    {x:MX+40,  c:MOOD1, label:'rough',  sel:false},
    {x:MX+88,  c:MOOD2, label:'low',    sel:false},
    {x:MX+136, c:MOOD3, label:'okay',   sel:false},
    {x:MX+184, c:MOOD4, label:'good',   sel:true},
    {x:MX+236, c:MOOD5, label:'great',  sel:false},
  ];
  moods.forEach(m => {
    const Y = MY + 76;
    if (m.sel) {
      els.push(circle(m.x, Y, 26, m.c, {opacity:0.15}));
      els.push(circle(m.x, Y, 20, m.c));
      els.push(circle(m.x, Y, 20, 'none', {stroke:m.c, sw:2}));
    } else {
      els.push(circle(m.x, Y, 20, m.c, {opacity:0.25}));
    }
    els.push(text(m.x, Y+36, m.label, 9, m.sel ? m.c : TEXT3, {
      anchor:'middle', font:SAN, fw: m.sel?'600':'400'
    }));
  });
  // last updated
  els.push(text(MX+18, MY+MH-14, 'last checked 2 min ago', 10, TEXT3, {font:SAN}));

  // Bento stats row (two cards)
  const S1X=20, S1Y=272, S1W=165, S1H=84;
  els.push(rect(S1X, S1Y, S1W, S1H, SURF, {rx:14, stroke:BORD, sw:1}));
  els.push(text(S1X+16, S1Y+22, 'STREAK', 9, TEXT3, {font:SAN, ls:'0.1em'}));
  els.push(text(S1X+16, S1Y+57, '21', 38, ACC, {fw:'700', font:SAR}));
  els.push(text(S1X+16, S1Y+74, 'days in a row', 10, TEXT2, {font:SAN}));

  const S2X=197, S2Y=272, S2W=173, S2H=84;
  els.push(rect(S2X, S2Y, S2W, S2H, ACC2L, {rx:14, stroke:BORD, sw:1}));
  els.push(text(S2X+16, S2Y+22, 'TODAY', 9, TEXT3, {font:SAN, ls:'0.1em'}));
  els.push(text(S2X+16, S2Y+57, '3', 38, ACC2, {fw:'700', font:SAR}));
  els.push(text(S2X+16, S2Y+74, 'moments captured', 10, TEXT2, {font:SAN}));

  // Section header
  els.push(line(20, 368, 370, 368, BORD));
  els.push(text(20, 385, 'RECENT MOMENTS', 9, TEXT3, {font:SAN, ls:'0.12em'}));

  // Moment entries ×3
  const entries = [
    {time:'8:42 AM', mood:MOOD4, moodName:'good', text1:'Finally finished the Murakami novel.', text2:'A quiet sense of completion, like setting down weight.', tag:'books'},
    {time:'12:15 PM', mood:MOOD3, moodName:'okay', text1:'Lunch alone with the window open.', text2:'Street sounds, coffee cooling. Ordinary and enough.', tag:'stillness'},
    {time:'3:30 PM', mood:MOOD5, moodName:'great', text1:'Call with Mia — laughed properly for the first time this week.', text2:'Connection feels different when it surprises you.', tag:'people'},
  ];

  entries.forEach((en, i) => {
    const EY = 396 + i * 110;
    const EH = 96;
    els.push(rect(20, EY, 350, EH, SURF, {rx:12, stroke:BORD, sw:1}));
    // left mood accent bar
    els.push(rect(20, EY, 3, EH, en.mood, {rx:1.5}));
    // time
    els.push(text(36, EY+18, en.time, 10, TEXT3, {font:SAN}));
    // mood dot
    els.push(circle(356, EY+16, 5, en.mood));
    // main text lines
    els.push(text(36, EY+36, en.text1, 13, TEXT, {fw:'500', font:SAR}));
    els.push(text(36, EY+54, en.text2, 12, TEXT2, {font:SAN}));
    // tag chip
    els.push(rect(36, EY+66, 6+en.tag.length*6, 18, CARD, {rx:9}));
    els.push(text(39+en.tag.length*3, EY+78, en.tag, 9, TEXT2, {anchor:'middle', font:SAN}));
  });

  navBar(els, 'home');
  return { name:'Today', svg:makeSvg(els), elements:els };
}

// ── SCREEN 2: Capture ─────────────────────────────────────────────────────────
function screen2() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  // Header
  els.push(rect(0, 44, W, 56, BG));
  // Back arrow
  els.push(line(28, 72, 20, 72, TEXT, {sw:2}));
  els.push(line(20, 72, 26, 66, TEXT, {sw:2}));
  els.push(line(20, 72, 26, 78, TEXT, {sw:2}));
  els.push(text(44, 77, 'new moment', 18, TEXT, {fw:'600', font:SAR}));
  els.push(text(24, 93, 'Thursday, 3:47 PM', 11, TEXT3, {font:SAN}));

  // Writing area card
  const WX=20, WY=112, WW=350, WH=220;
  els.push(rect(WX, WY, WW, WH, SURF, {rx:14, stroke:ACC, sw:1.5}));
  // Cursor blink
  els.push(rect(WX+20, WY+26, 2, 18, ACC));
  // Placeholder text lines (simulated draft)
  els.push(text(WX+24, WY+40, 'The afternoon light came through', 15, TEXT, {font:SAR, opacity:0.9}));
  els.push(text(WX+24, WY+60, 'sideways, turning the dust gold. I', 15, TEXT, {font:SAR, opacity:0.9}));
  els.push(text(WX+24, WY+80, 'noticed it for once instead of', 15, TEXT, {font:SAR, opacity:0.9}));
  els.push(text(WX+24, WY+100, 'walking through it.', 15, TEXT, {font:SAR, opacity:0.9}));
  // Guide lines
  for (let i=0; i<5; i++) {
    els.push(line(WX+16, WY+116+i*26, WX+WW-16, WY+116+i*26, BORD, {sw:0.5, opacity:0.5}));
  }
  // char count
  els.push(text(WX+WW-16, WY+WH-12, '143', 10, TEXT3, {anchor:'end', font:SAN}));
  els.push(text(WX+16, WY+WH-12, 'tap to continue writing...', 10, TEXT3, {font:SAN}));

  // Mood selector
  els.push(text(20, 350, 'MOOD', 9, TEXT3, {font:SAN, ls:'0.1em'}));
  const moodOpts = [
    {x:56, c:MOOD1, label:'rough'},
    {x:110, c:MOOD2, label:'low'},
    {x:164, c:MOOD3, label:'okay'},
    {x:218, c:MOOD4, label:'good', sel:true},
    {x:272, c:MOOD5, label:'great'},
  ];
  moodOpts.forEach(m => {
    if (m.sel) {
      els.push(circle(m.x, 376, 18, m.c));
      els.push(circle(m.x, 376, 22, 'none', {stroke:m.c, sw:1.5, opacity:0.4}));
    } else {
      els.push(circle(m.x, 376, 18, m.c, {opacity:0.3}));
    }
    els.push(text(m.x, 403, m.label, 9, m.sel?m.c:TEXT3, {anchor:'middle', font:SAN}));
  });

  // Tags section
  els.push(line(20, 422, 370, 422, BORD));
  els.push(text(20, 440, 'TAGS', 9, TEXT3, {font:SAN, ls:'0.1em'}));
  const tags = ['light', 'attention', 'home', '+ add'];
  let tagX = 20;
  tags.forEach(tag => {
    const tw = tag.length * 7 + 16;
    const isAdd = tag === '+ add';
    els.push(rect(tagX, 448, tw, 24, isAdd?'none':CARD, {rx:12, stroke:isAdd?BORD:'none', sw:isAdd?1:0}));
    els.push(text(tagX+tw/2, 464, tag, 11, isAdd?TEXT3:TEXT2, {anchor:'middle', font:SAN}));
    tagX += tw + 8;
  });

  // Prompt suggestion
  els.push(rect(20, 482, 350, 52, CARD, {rx:12}));
  els.push(text(36, 503, '✦ prompt', 9, ACC, {font:SAN, ls:'0.06em', fw:'600'}));
  els.push(text(36, 522, 'What did you notice today that you almost missed?', 13, TEXT2, {font:SAR}));

  // Save button
  els.push(rect(20, 548, 350, 52, ACC, {rx:14}));
  els.push(text(195, 580, 'save this moment', 15, SURF, {anchor:'middle', font:SAN, fw:'600'}));

  // Discard link
  els.push(text(195, 620, 'discard', 13, TEXT3, {anchor:'middle', font:SAN}));
  els.push(line(170, 622, 220, 622, TEXT3, {sw:0.5}));

  navBar(els, 'capture');
  return { name:'Capture', svg:makeSvg(els), elements:els };
}

// ── SCREEN 3: Archive ─────────────────────────────────────────────────────────
function screen3() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  // Header
  els.push(rect(0, 44, W, 56, BG));
  els.push(text(24, 78, 'archive', 26, TEXT, {fw:'700', font:SAR}));
  // Month nav
  els.push(text(24, 96, '← March', 11, TEXT3, {font:SAN}));
  els.push(text(195, 96, 'April 2026', 11, TEXT2, {anchor:'middle', font:SAN, fw:'500'}));
  els.push(text(366, 96, 'May →', 11, TEXT3, {font:SAN, anchor:'end'}));

  // Calendar
  const CX=20, CY=112, CW=350, CDAY=50;
  els.push(rect(CX, CY, CW, 320, SURF, {rx:14, stroke:BORD, sw:1}));

  const daysOfWeek = ['S','M','T','W','T','F','S'];
  daysOfWeek.forEach((d, i) => {
    els.push(text(CX+25+i*50, CY+22, d, 10, TEXT3, {anchor:'middle', font:SAN, fw:'600', ls:'0.06em'}));
  });
  els.push(line(CX+12, CY+30, CX+CW-12, CY+30, BORD, {sw:0.5}));

  // April 2026 starts on Wednesday (index=4, 0=Sun)
  // Day data: which days have moments
  const momentDays = new Set([1,2,3,5,6,7,8,9,10,12,14,15,16,17,18,19,21,22,24,25,27,28,29,30]);
  const moodDayColors = {1:MOOD4,2:MOOD5,3:MOOD3,5:MOOD4,6:MOOD5,7:MOOD4,8:MOOD3,9:MOOD4,10:MOOD5,12:MOOD3,14:MOOD4,15:MOOD5,16:MOOD4,17:MOOD3,18:MOOD5,19:MOOD4,21:MOOD3,22:MOOD4,24:MOOD5,25:MOOD4,27:MOOD3,28:MOOD4,29:MOOD5,30:MOOD4};

  let dayNum = 1;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 7; col++) {
      // April 2026 starts at col=4 (Wednesday, 0=Sun... actually let me use Wed=4)
      // April 1 = Wednesday = col index 3 (Mon-based) or col 4 (Sun-based)
      const cellIndex = row * 7 + col;
      const startOffset = 3; // April 1 = Wednesday = index 3 (0=Sun)
      const dayIndex = cellIndex - startOffset;
      if (dayIndex < 0 || dayIndex >= 30) {
        // empty cell – faded prev/next month day
        const fakeDay = dayIndex < 0 ? 31 + dayIndex : dayIndex - 29;
        els.push(text(CX+25+col*50, CY+56+row*52, fakeDay.toString(), 13, TEXT3, {anchor:'middle', font:SAN, opacity:0.3}));
        continue;
      }
      const d = dayIndex + 1;
      const DX = CX+25+col*50;
      const DY = CY+56+row*52;
      const isToday = d === 10;
      const hasMoment = momentDays.has(d);
      const mColor = moodDayColors[d] || MOOD3;

      if (isToday) {
        els.push(circle(DX, DY-6, 16, ACC));
        els.push(text(DX, DY, d.toString(), 13, SURF, {anchor:'middle', font:SAN, fw:'600'}));
      } else {
        els.push(text(DX, DY, d.toString(), 13, TEXT, {anchor:'middle', font:SAN, fw:hasMoment?'500':'300'}));
      }
      if (hasMoment && !isToday) {
        els.push(circle(DX, DY+10, 3, mColor));
      }
    }
  }

  // Recent entries section below calendar
  els.push(line(20, 442, 370, 442, BORD));
  els.push(text(20, 458, 'APRIL 10 — 3 MOMENTS', 9, TEXT3, {font:SAN, ls:'0.1em'}));

  const recentE = [
    {time:'8:42 AM', c:MOOD4, preview:'Finally finished the Murakami novel. A quiet…'},
    {time:'12:15 PM', c:MOOD3, preview:'Lunch alone with the window open. Street sounds…'},
    {time:'3:30 PM', c:MOOD5, preview:'Call with Mia — laughed properly for the first…'},
  ];
  recentE.forEach((e, i) => {
    const EY = 468 + i * 82;
    els.push(rect(20, EY, 350, 70, SURF, {rx:12, stroke:BORD, sw:1}));
    els.push(circle(40, EY+22, 6, e.c));
    els.push(text(54, EY+26, e.time, 10, TEXT3, {font:SAN}));
    els.push(text(36, EY+48, e.preview, 12, TEXT2, {font:SAR}));
    // arrow
    els.push(line(350, EY+34, 360, EY+34, TEXT3, {sw:1.5}));
    els.push(line(354, EY+30, 360, EY+34, TEXT3, {sw:1.5}));
    els.push(line(354, EY+38, 360, EY+34, TEXT3, {sw:1.5}));
  });

  navBar(els, 'archive');
  return { name:'Archive', svg:makeSvg(els), elements:els };
}

// ── SCREEN 4: Insights ────────────────────────────────────────────────────────
function screen4() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  // Header
  els.push(rect(0, 44, W, 56, BG));
  els.push(text(24, 78, 'insights', 26, TEXT, {fw:'700', font:SAR}));
  els.push(text(24, 96, '30 days', 11, TEXT3, {font:SAN}));

  // Period tabs
  ['7 days','30 days','all time'].forEach((t,i) => {
    const TX = 24 + i*86;
    const on = i===1;
    els.push(rect(TX, 108, 74, 26, on?ACC:CARD, {rx:13}));
    els.push(text(TX+37, 126, t, 11, on?SURF:TEXT2, {anchor:'middle', font:SAN, fw:on?'600':'400'}));
  });

  // Big stat bento: streak
  els.push(rect(20, 146, 350, 88, SURF, {rx:14, stroke:BORD, sw:1}));
  els.push(rect(20, 146, 3, 88, ACC, {rx:1.5}));
  els.push(text(36, 172, 'WRITING STREAK', 9, TEXT3, {font:SAN, ls:'0.1em'}));
  els.push(text(36, 216, '21', 50, ACC, {fw:'700', font:SAR}));
  els.push(text(90, 208, 'days', 14, TEXT2, {font:SAN}));
  els.push(text(90, 226, 'personal best: 34 days', 10, TEXT3, {font:SAN}));
  // mini bar showing progress toward 34
  els.push(rect(200, 175, 150, 6, CARD, {rx:3}));
  els.push(rect(200, 175, Math.round(150*21/34), 6, ACC, {rx:3}));
  els.push(text(200, 192, '21 / 34 days to beat your best', 9, TEXT3, {font:SAN}));

  // Mood trend – bar chart (7 days)
  els.push(rect(20, 246, 350, 160, SURF, {rx:14, stroke:BORD, sw:1}));
  els.push(text(36, 268, 'MOOD THIS WEEK', 9, TEXT3, {font:SAN, ls:'0.1em'}));

  const weekDays = ['M','T','W','T','F','S','S'];
  const moodVals = [3, 4, 3, 5, 4, 3, 5]; // 1-5 scale
  const moodClrs = [MOOD3,MOOD4,MOOD3,MOOD5,MOOD4,MOOD3,MOOD5];
  const CHART_X = 36, CHART_Y = 390, CHART_H = 80, CHART_W = 310;
  const barW = 32;
  const barSpacing = CHART_W / 7;

  weekDays.forEach((d, i) => {
    const bx = CHART_X + i*barSpacing + barSpacing/2 - barW/2;
    const bh = (moodVals[i]/5) * CHART_H;
    const by = CHART_Y - bh;
    const isLast = i===6;
    els.push(rect(bx, by, barW, bh, isLast?moodClrs[i]:moodClrs[i], {rx:6, opacity: isLast?1:0.6}));
    els.push(text(bx+barW/2, CHART_Y+16, d, 10, TEXT3, {anchor:'middle', font:SAN}));
    if (isLast) {
      // highlight today
      els.push(rect(bx-2, by-2, barW+4, bh+4, 'none', {stroke:moodClrs[i], sw:1.5, rx:7}));
    }
  });
  els.push(line(CHART_X, CHART_Y, CHART_X+CHART_W, CHART_Y, BORD, {sw:1}));

  // Top themes bento (2 side-by-side small cards)
  els.push(rect(20, 418, 165, 100, SURF, {rx:14, stroke:BORD, sw:1}));
  els.push(text(36, 438, 'TOP THEME', 9, TEXT3, {font:SAN, ls:'0.1em'}));
  els.push(text(36, 468, 'stillness', 22, TEXT, {fw:'500', font:SAR}));
  els.push(text(36, 488, '12 appearances', 10, TEXT3, {font:SAN}));
  els.push(rect(36, 499, 70, 7, CARD, {rx:3}));
  els.push(rect(36, 499, 52, 7, ACC2, {rx:3, opacity:0.6}));

  els.push(rect(205, 418, 165, 100, ACC2L, {rx:14, stroke:BORD, sw:1}));
  els.push(text(221, 438, 'MOST WRITTEN', 9, TEXT3, {font:SAN, ls:'0.1em'}));
  els.push(text(221, 468, 'light', 22, ACC2, {fw:'500', font:SAR}));
  els.push(text(221, 488, '8 mentions this month', 10, TEXT3, {font:SAN}));

  // Total moments
  els.push(rect(20, 530, 350, 72, SURF, {rx:14, stroke:BORD, sw:1}));
  els.push(text(36, 553, 'TOTAL THIS MONTH', 9, TEXT3, {font:SAN, ls:'0.1em'}));
  els.push(text(36, 588, '47', 40, TEXT, {fw:'700', font:SAR}));
  els.push(text(80, 580, 'moments', 13, TEXT2, {font:SAN}));
  els.push(text(80, 596, '↑ 12 more than March', 10, ACC2, {font:SAN, fw:'500'}));
  // mini sparkline
  const spVals = [38,42,35,44,47];
  const spX = 240, spY = 590, spW = 100;
  spVals.forEach((v,i) => {
    const sx = spX + i*(spW/4);
    const sy = spY - (v-30)*1.2;
    els.push(circle(sx, sy, 3, ACC2, {opacity:0.7}));
    if (i > 0) {
      const px = spX + (i-1)*(spW/4);
      const py = spY - (spVals[i-1]-30)*1.2;
      els.push(line(px, py, sx, sy, ACC2, {sw:1.5, opacity:0.5}));
    }
  });

  // Avg words per entry
  els.push(rect(20, 614, 350, 52, CARD, {rx:12}));
  els.push(text(36, 636, 'Average length: 68 words', 13, TEXT, {font:SAN}));
  els.push(text(36, 654, 'You write more on weekday mornings', 11, TEXT3, {font:SAN}));

  navBar(els, 'archive');
  return { name:'Insights', svg:makeSvg(els), elements:els };
}

// ── SCREEN 5: Moment Detail ───────────────────────────────────────────────────
function screen5() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  // Header with back
  els.push(rect(0, 44, W, 56, BG));
  els.push(line(28, 72, 20, 72, TEXT, {sw:1.5}));
  els.push(line(20, 72, 26, 66, TEXT, {sw:1.5}));
  els.push(line(20, 72, 26, 78, TEXT, {sw:1.5}));
  els.push(text(44, 77, 'April 10', 16, TEXT, {fw:'600', font:SAN}));
  // share icon
  els.push(circle(362, 70, 14, CARD));
  els.push(text(362, 75, '↗', 13, TEXT2, {anchor:'middle', font:SAN}));

  // Big date display
  els.push(rect(20, 108, 350, 72, SURF, {rx:14, stroke:BORD, sw:1}));
  els.push(text(36, 132, 'Thursday', 11, TEXT3, {font:SAN, ls:'0.04em'}));
  els.push(text(36, 162, '3:30 PM', 28, TEXT, {fw:'700', font:SAR}));
  // Mood badge
  els.push(rect(258, 126, 92, 26, ACC2L, {rx:13}));
  els.push(circle(274, 139, 6, MOOD5));
  els.push(text(316, 143, 'great', 12, ACC2, {anchor:'middle', font:SAN, fw:'500'}));

  // Moment text card
  els.push(rect(20, 192, 350, 200, SURF, {rx:14, stroke:BORD, sw:1}));
  els.push(rect(20, 192, 3, 200, MOOD5, {rx:1.5}));
  els.push(text(36, 220, '"Call with Mia — laughed properly', 16, TEXT, {fw:'400', font:SAR}));
  els.push(text(36, 242, 'for the first time this week.', 16, TEXT, {fw:'400', font:SAR}));
  els.push(text(36, 278, 'Connection feels different when', 16, TEXT2, {fw:'400', font:SAR}));
  els.push(text(36, 300, 'it surprises you. We talked for', 16, TEXT2, {fw:'400', font:SAR}));
  els.push(text(36, 322, 'two hours without noticing."', 16, TEXT2, {fw:'400', font:SAR}));
  els.push(text(36, 376, '— 72 words', 10, TEXT3, {font:SAN}));

  // Tags
  els.push(line(20, 404, 370, 404, BORD));
  els.push(text(20, 420, 'TAGS', 9, TEXT3, {font:SAN, ls:'0.1em'}));
  const dtags = ['people', 'connection', 'joy'];
  let dtx = 20;
  dtags.forEach(tag => {
    const tw = tag.length * 7 + 20;
    els.push(rect(dtx, 428, tw, 24, CARD, {rx:12}));
    els.push(text(dtx+tw/2, 444, tag, 11, TEXT2, {anchor:'middle', font:SAN}));
    dtx += tw + 8;
  });

  // Context row
  els.push(line(20, 462, 370, 462, BORD));
  els.push(rect(20, 470, 165, 52, SURF, {rx:12, stroke:BORD, sw:1}));
  els.push(text(36, 490, 'location', 9, TEXT3, {font:SAN, ls:'0.06em'}));
  els.push(text(36, 510, 'home office', 13, TEXT2, {font:SAN}));
  els.push(rect(197, 470, 173, 52, SURF, {rx:12, stroke:BORD, sw:1}));
  els.push(text(213, 490, 'weather', 9, TEXT3, {font:SAN, ls:'0.06em'}));
  els.push(text(213, 510, '19°C, partly cloudy', 13, TEXT2, {font:SAN}));

  // Related moments
  els.push(line(20, 534, 370, 534, BORD));
  els.push(text(20, 550, 'RELATED MOMENTS', 9, TEXT3, {font:SAN, ls:'0.1em'}));
  const related = [
    {date:'Mar 22', preview:'Long catch-up call with Mia, both of us…', c:MOOD4},
    {date:'Feb 15', preview:'Feeling lonely today. Wished I\'d called…', c:MOOD2},
  ];
  related.forEach((r,i) => {
    const RY = 558 + i*82;
    els.push(rect(20, RY, 350, 70, SURF, {rx:12, stroke:BORD, sw:1}));
    els.push(circle(36, RY+22, 5, r.c));
    els.push(text(48, RY+26, r.date, 10, TEXT3, {font:SAN}));
    els.push(text(36, RY+48, r.preview, 12, TEXT2, {font:SAR}));
  });

  navBar(els, 'home');
  return { name:'Moment Detail', svg:makeSvg(els), elements:els };
}

// ── SCREEN 6: Profile ─────────────────────────────────────────────────────────
function screen6() {
  const els = [];
  els.push(rect(0, 0, W, H, BG));
  statusBar(els);

  // Header
  els.push(rect(0, 44, W, 56, BG));
  els.push(text(24, 78, 'you', 26, TEXT, {fw:'700', font:SAR}));

  // Avatar + name
  els.push(rect(20, 108, 350, 100, SURF, {rx:14, stroke:BORD, sw:1}));
  els.push(circle(64, 158, 32, CARD));
  els.push(circle(64, 158, 32, 'none', {stroke:BORD, sw:1}));
  els.push(text(64, 164, 'RK', 18, TEXT2, {fw:'600', anchor:'middle', font:SAN}));
  els.push(text(112, 148, 'Rakis', 18, TEXT, {fw:'600', font:SAR}));
  els.push(text(112, 168, 'writing since February 2026', 12, TEXT3, {font:SAN}));
  // edit button
  els.push(rect(300, 143, 54, 28, CARD, {rx:14}));
  els.push(text(327, 161, 'edit', 12, TEXT2, {anchor:'middle', font:SAN}));

  // Stats bento row (3 cards)
  const statCards = [
    {label:'MOMENTS', value:'214', sub:'total'},
    {label:'STREAK',  value:'21',  sub:'days'},
    {label:'WORDS',   value:'14k', sub:'written'},
  ];
  statCards.forEach((sc, i) => {
    const SX = 20 + i*115, SY=220, SW=105, SH=78;
    els.push(rect(SX, SY, SW, SH, i===1?ACC_L:SURF, {rx:12, stroke:i===1?'none':BORD, sw:1}));
    els.push(text(SX+14, SY+18, sc.label, 8, TEXT3, {font:SAN, ls:'0.1em'}));
    els.push(text(SX+14, SY+52, sc.value, 28, i===1?ACC:TEXT, {fw:'700', font:SAR}));
    els.push(text(SX+14, SY+68, sc.sub, 10, TEXT3, {font:SAN}));
  });

  // Settings list
  els.push(line(20, 310, 370, 310, BORD));
  els.push(text(20, 328, 'PREFERENCES', 9, TEXT3, {font:SAN, ls:'0.1em'}));

  const settings = [
    {label:'Daily reminder', sub:'8:00 AM', toggle:true, on:true},
    {label:'Mood check-in prompt', sub:'nudge at 6 PM', toggle:true, on:false},
    {label:'Writing font', sub:'Georgia (serif)', toggle:false},
    {label:'Theme', sub:'System default', toggle:false},
    {label:'Notification style', sub:'Gentle', toggle:false},
  ];
  settings.forEach((s, i) => {
    const SY = 336 + i*62;
    els.push(rect(20, SY, 350, 54, SURF, {rx:12, stroke:BORD, sw:1}));
    els.push(text(36, SY+22, s.label, 14, TEXT, {font:SAN, fw:'400'}));
    els.push(text(36, SY+40, s.sub, 11, TEXT3, {font:SAN}));
    if (s.toggle) {
      const tx = 330, ty = SY+27;
      els.push(rect(tx-20, ty-9, 36, 18, s.on?ACC2:CARD, {rx:9}));
      els.push(circle(s.on?tx-4:tx-16, ty, 8, SURF));
    } else {
      els.push(line(350, SY+27, 360, SY+27, TEXT3, {sw:1.5}));
      els.push(line(354, SY+23, 360, SY+27, TEXT3, {sw:1.5}));
      els.push(line(354, SY+31, 360, SY+27, TEXT3, {sw:1.5}));
    }
  });

  // Export + sign out
  els.push(rect(20, 654, 350, 44, CARD, {rx:12}));
  els.push(text(195, 681, 'export all moments (.txt)', 13, TEXT2, {anchor:'middle', font:SAN}));
  els.push(text(195, 726, 'sign out', 13, TEXT3, {anchor:'middle', font:SAN}));
  els.push(line(168, 728, 222, 728, TEXT3, {sw:0.5}));

  navBar(els, 'profile');
  return { name:'Profile', svg:makeSvg(els), elements:els };
}

// ── ASSEMBLE ──────────────────────────────────────────────────────────────────
const screens = [screen1(), screen2(), screen3(), screen4(), screen5(), screen6()];
const totalElements = screens.reduce((a, s) => a + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name:      NAME,
    tagline:   TAGLINE,
    author:    'RAM',
    date:      DATE,
    theme:     THEME,
    heartbeat: HEARTBEAT,
    slug:      SLUG,
    elements:  totalElements,
    palette: {
      bg:      BG,
      surface: SURF,
      card:    CARD,
      text:    TEXT,
      accent:  ACC,
      accent2: ACC2,
    },
    inspiration: [
      'minimal.gallery — Bajgart Office (Swiss-grid editorial restraint, barely-there UI)',
      'minimal.gallery — Robinhood Market (financial minimalism, warm cream palette)',
      'lapa.ninja — Bento Grid collection (hierarchy through card size variation)',
    ],
  },
  screens: screens.map(s => ({ name: s.name, svg: s.svg, elements: s.elements })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
