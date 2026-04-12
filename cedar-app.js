'use strict';
const fs   = require('fs');
const path = require('path');

// ── CEDAR — Slow-living daily journal & life tracker ──
// Heartbeat #: light theme
// Inspired by: minimal.gallery (Aesop editorial warmth — ivory, earth tones, single accent)
//              lapa.ninja (earthy wellness, serif contrast, museum breathing room)
// Theme: LIGHT — warm ivory + forest green

const SLUG = 'cedar';
const W = 390, H = 844;

// ── Palette (LIGHT — warm ivory + forest green) ──
const P = {
  bg:      '#FAF8F3',   // warm ivory
  bg2:     '#F3F0E8',   // slightly darker ivory for cards
  bg3:     '#EAE6D9',   // bento card fills
  surf:    '#FFFFFF',   // pure white surfaces
  text:    '#2B2620',   // warm near-black
  text2:   '#7A6E62',   // warm mid-tone
  text3:   '#B0A899',   // muted warm gray
  acc:     '#3D6B4F',   // forest green (single accent)
  acc2:    '#7FA882',   // muted sage green
  acc3:    '#D4E8D9',   // pale green tint
  warm:    '#C8A882',   // warm taupe accent
  warm2:   '#F0E8D8',   // pale warm
  err:     '#B85C40',   // terracotta (used sparingly)
  line:    '#E0DAD0',   // warm divider
};

// ── Primitives ──
function rect(x,y,w,h,fill,opts={}) {
  const rx    = opts.rx    ?? 0;
  const op    = opts.opacity ?? 1;
  const str   = opts.stroke  ?? 'none';
  const sw    = opts.sw    ?? 1;
  return { type:'rect', x, y, width:w, height:h, fill, rx, opacity:op, stroke:str, strokeWidth:sw };
}
function text(x,y,content,size,fill,opts={}) {
  const fw    = opts.fw     ?? 400;
  const font  = opts.font   ?? 'Georgia, serif';
  const anchor= opts.anchor ?? 'start';
  const ls    = opts.ls     ?? '0';
  const op    = opts.opacity ?? 1;
  return { type:'text', x, y, content: String(content), fontSize:size, fill, fontWeight:fw, fontFamily:font, textAnchor:anchor, letterSpacing:ls, opacity:op };
}
function circle(cx,cy,r,fill,opts={}) {
  return { type:'circle', cx, cy, r, fill, opacity: opts.opacity ?? 1, stroke: opts.stroke ?? 'none', strokeWidth: opts.sw ?? 1 };
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  return { type:'line', x1, y1, x2, y2, stroke, strokeWidth: opts.sw ?? 1, opacity: opts.opacity ?? 1 };
}

// ── Reusable components ──
function statusBar(els) {
  els.push(rect(0,0,W,44,P.bg));
  els.push(text(20,28,'9:41',12,P.text2,{fw:500,font:'Georgia, serif'}));
  els.push(text(W-20,28,'●●●●',10,P.text3,{anchor:'end'}));
}

function navBar(els, active) {
  // bottom nav: Journal, Today, Reflect, Profile
  els.push(rect(0,H-80,W,80,P.surf));
  els.push(line(0,H-80,W,H-80,P.line,{sw:1}));
  const tabs = [
    { label:'Journal', icon:'📖', id:'journal' },
    { label:'Today',   icon:'◐',  id:'today'   },
    { label:'Reflect', icon:'◎',  id:'reflect'  },
    { label:'Profile', icon:'○',  id:'profile'  },
  ];
  const tw = W / tabs.length;
  tabs.forEach((t,i) => {
    const cx = tw*i + tw/2;
    const isActive = t.id === active;
    const col = isActive ? P.acc : P.text3;
    els.push(text(cx,H-50,t.icon,18,col,{anchor:'middle'}));
    els.push(text(cx,H-26,t.label,10,col,{anchor:'middle',fw:isActive?600:400,font:'Georgia, serif'}));
    if (isActive) {
      els.push(rect(cx-16,H-80,32,2,P.acc,{rx:1}));
    }
  });
}

function sectionLabel(els, x, y, label) {
  els.push(text(x,y,label,10,P.text3,{fw:600,font:'Georgia, serif',ls:'0.12em'}));
}

// ── Screen 1: Home / Today Overview ──
function screenToday() {
  const els = [];
  // bg
  els.push(rect(0,0,W,H,P.bg));
  statusBar(els);

  // Header — asymmetric (offset from typical center)
  els.push(text(20,76,'Sunday',28,P.acc,{fw:400,font:'Georgia, serif'}));
  els.push(text(20,104,'April 12',44,P.text,{fw:300,font:'Georgia, serif',ls:'-0.02em'}));
  els.push(text(W-24,80,'2026',13,P.text3,{anchor:'end',font:'Georgia, serif'}));

  // Morning intention card — asymmetric position (60% width as per minimal.gallery insight)
  els.push(rect(20,120,W-40,72,P.surf,{rx:14}));
  els.push(rect(20,120,4,72,P.acc,{rx:2}));
  els.push(text(36,142,'"Begin with intention."',13,P.text,{fw:400,font:'Georgia, serif',ls:'0.01em'}));
  els.push(text(36,162,'Morning note',10,P.text3,{fw:500,font:'Georgia, serif'}));
  els.push(text(36,182,'Added 7:14 AM',10,P.text3,{font:'Georgia, serif'}));

  // Bento grid — daily metrics (asymmetric sizing)
  // Large left card: Energy
  els.push(rect(20,208,160,120,P.bg3,{rx:14}));
  els.push(text(32,233,'Energy',10,P.text3,{fw:600,font:'Georgia, serif',ls:'0.1em'}));
  els.push(text(32,275,'7.2',38,P.acc,{fw:300,font:'Georgia, serif'}));
  els.push(text(32,299,'out of 10',11,P.text2,{font:'Georgia, serif'}));
  // progress bar inside energy card
  els.push(rect(32,312,120,4,P.acc3,{rx:2}));
  els.push(rect(32,312,86,4,P.acc,{rx:2}));

  // Smaller top-right: Focus
  els.push(rect(192,208,W-212,56,P.acc,{rx:14}));
  els.push(text(204,231,'Focus',10,'rgba(255,255,255,0.7)',{fw:600,font:'Georgia, serif',ls:'0.1em'}));
  els.push(text(204,251,'Deep',20,P.surf,{fw:400,font:'Georgia, serif'}));

  // Smaller bottom-right: Mood
  els.push(rect(192,272,W-212,56,P.bg3,{rx:14}));
  els.push(text(204,295,'Mood',10,P.text3,{fw:600,font:'Georgia, serif',ls:'0.1em'}));
  els.push(text(204,315,'Calm ◎',16,P.text,{fw:400,font:'Georgia, serif'}));

  // Divider
  els.push(line(20,344,W-20,344,P.line,{sw:1,opacity:0.5}));

  // Section: Today's log
  sectionLabel(els,20,366,'TODAY\'S LOG');
  const entries = [
    { time:'7:14 AM', title:'Morning pages', tag:'Writing', dot:P.acc },
    { time:'9:30 AM', title:'Called mum', tag:'Connect', dot:P.warm },
    { time:'11:00 AM', title:'Deep work block', tag:'Focus', dot:P.acc2 },
    { time:'2:15 PM', title:'Walk in the park', tag:'Nature', dot:P.acc },
  ];
  entries.forEach((e,i) => {
    const y = 382 + i*60;
    els.push(rect(20,y,W-40,52,P.surf,{rx:10}));
    els.push(circle(36,y+26,5,e.dot));
    els.push(text(48,y+20,e.title,14,P.text,{fw:500,font:'Georgia, serif'}));
    els.push(text(48,y+36,e.time,11,P.text3,{font:'Georgia, serif'}));
    els.push(rect(W-70,y+16,50,20,P.bg3,{rx:10}));
    els.push(text(W-45,y+30,e.tag,9,P.text2,{anchor:'middle',fw:500,font:'Georgia, serif',ls:'0.05em'}));
  });

  // Habit row
  sectionLabel(els,20,598,'TODAY\'S HABITS');
  const habits = [
    { label:'Morning pages', done:true },
    { label:'Walk', done:true },
    { label:'Read', done:false },
    { label:'Meditate', done:false },
  ];
  habits.forEach((h,i) => {
    const hx = 20 + i*88;
    els.push(rect(hx,612,78,48,P.surf,{rx:10}));
    els.push(circle(hx+39,630,10,h.done?P.acc:P.bg3,{stroke:h.done?'none':P.line,sw:1}));
    els.push(text(hx+39,634,h.done?'✓':'',9,P.surf,{anchor:'middle',font:'Georgia, serif'}));
    els.push(text(hx+39,652,h.label,8,P.text3,{anchor:'middle',font:'Georgia, serif'}));
  });

  // + Log button
  els.push(rect(20,672,W-40,48,P.acc,{rx:24}));
  els.push(text(W/2,701,'+ Log a moment',14,P.surf,{anchor:'middle',fw:500,font:'Georgia, serif'}));

  // Bottom label
  els.push(text(W/2,730,'2 of 4 habits done · Keep going',10,P.text3,{anchor:'middle',font:'Georgia, serif',opacity:0.6}));

  navBar(els,'today');
  return els;
}

// ── Screen 2: Journal (list of entries) ──
function screenJournal() {
  const els = [];
  els.push(rect(0,0,W,H,P.bg));
  statusBar(els);

  els.push(text(20,80,'Journal',32,P.text,{fw:300,font:'Georgia, serif',ls:'-0.01em'}));
  els.push(text(W-20,74,'Search',12,P.acc,{anchor:'end',fw:500,font:'Georgia, serif'}));

  // Search bar
  els.push(rect(20,92,W-40,36,P.bg3,{rx:18}));
  els.push(text(44,115,'Search your journal…',12,P.text3,{font:'Georgia, serif'}));
  els.push(text(W-36,115,'⌕',14,P.text3,{anchor:'middle',font:'Georgia, serif'}));

  // Month tabs
  const months = ['Feb','Mar','Apr'];
  months.forEach((m,i) => {
    const isActive = m === 'Apr';
    els.push(rect(20+i*68,94,58,26,isActive?P.acc:P.bg3,{rx:13}));
    els.push(text(20+i*68+29,111,m,11,isActive?P.surf:P.text2,{anchor:'middle',fw:isActive?600:400,font:'Georgia, serif'}));
  });

  // Stats strip
  els.push(rect(20,135,W-40,36,P.surf,{rx:10}));
  const jstats = [
    {label:'7 entries', icon:'◎'},
    {label:'1,840 words', icon:'○'},
    {label:'12 day streak', icon:'◑'},
  ];
  jstats.forEach((js,i) => {
    const jsx=44+i*118;
    els.push(text(jsx,157,js.icon+' '+js.label,10,P.text2,{font:'Georgia, serif'}));
    if(i<2) els.push(line(jsx+88,143,jsx+88,165,P.line,{sw:0.5,opacity:0.5}));
  });

  // Journal entries
  const journals = [
    { date:'Apr 12', day:'Sunday', title:'On beginning again', preview:'There is something sacred about the first light of a new week…', words:'248 words', mood:'◎ Calm' },
    { date:'Apr 11', day:'Saturday', title:'Walking without destination', preview:'I let my feet decide today. The park was quieter than expected…', words:'312 words', mood:'◑ Peaceful' },
    { date:'Apr 10', day:'Friday', title:'The cost of busyness', preview:'I noticed today how I use busyness as armour against…', words:'195 words', mood:'○ Reflective' },
    { date:'Apr 8', day:'Wednesday', title:'Small joys, catalogued', preview:'A list of things that made me smile this week, in no particular…', words:'140 words', mood:'◎ Grateful' },
  ];

  journals.forEach((j,i) => {
    const y = 138+i*154;
    // Card
    els.push(rect(20,y,W-40,142,P.surf,{rx:14}));
    // Date badge — left column
    els.push(rect(28,y+14,44,44,P.acc3,{rx:10}));
    els.push(text(50,y+34,j.date.split(' ')[1],18,P.acc,{anchor:'middle',fw:400,font:'Georgia, serif'}));
    els.push(text(50,y+48,j.date.split(' ')[0].toUpperCase(),8,P.acc2,{anchor:'middle',fw:600,ls:'0.08em',font:'Georgia, serif'}));
    // Content
    els.push(text(84,y+30,j.title,15,P.text,{fw:500,font:'Georgia, serif'}));
    els.push(text(84,y+46,j.day,10,P.text3,{font:'Georgia, serif'}));
    // Preview text
    els.push(text(28,y+72,j.preview,11,P.text2,{font:'Georgia, serif'}));
    els.push(text(28,y+88,j.preview.slice(40),11,P.text2,{font:'Georgia, serif',opacity:0.6}));
    // Footer
    els.push(line(28,y+108,W-48,y+108,P.line,{sw:0.5,opacity:0.6}));
    els.push(text(28,y+124,j.words,10,P.text3,{font:'Georgia, serif'}));
    els.push(text(W-48,y+124,j.mood,10,P.acc2,{anchor:'end',font:'Georgia, serif'}));
  });

  navBar(els,'journal');
  return els;
}

// ── Screen 3: New Entry ──
function screenNewEntry() {
  const els = [];
  els.push(rect(0,0,W,H,P.bg));
  statusBar(els);

  // Minimal header
  els.push(text(20,76,'←',16,P.text2,{font:'Georgia, serif'}));
  els.push(text(W-20,76,'Save',14,P.acc,{anchor:'end',fw:600,font:'Georgia, serif'}));

  // Date label — asymmetric
  els.push(text(20,112,'Sunday, April 12',13,P.text3,{font:'Georgia, serif',fw:400,ls:'0.03em'}));
  els.push(rect(20,120,120,1,P.line));

  // Title input
  els.push(text(20,160,'On beginning again',26,P.text,{fw:300,font:'Georgia, serif',ls:'-0.01em'}));
  els.push(text(20,185,'Tap to edit title',11,P.text3,{font:'Georgia, serif',opacity:0.5}));

  // Writing area
  const bodyLines = [
    'There is something sacred about the first',
    'light of a new week. Sunday mornings carry',
    'a particular kind of quiet — not the silence',
    'of absence, but of potential.',
    '',
    'I woke before my alarm. The apartment was',
    'still, and I made coffee slowly, on purpose.',
    'No phone. No notifications. Just the kettle',
    'and the light coming through the window.',
    '',
    'I have been thinking about what it means to',
    'begin again — not from the start, but from',
    'exactly where I am…',
  ];
  bodyLines.forEach((l,i) => {
    els.push(text(20,215+i*18,l || ' ',12,l ? P.text : P.bg,{font:'Georgia, serif'}));
  });

  // Cursor
  els.push(rect(20,455,2,16,P.acc,{rx:1}));

  // Formatting toolbar
  els.push(rect(0,H-130,W,50,P.surf));
  els.push(line(0,H-130,W,H-130,P.line,{sw:1}));
  const tools = ['◎ Mood','# Tag','📎 Attach','◑ Weather'];
  tools.forEach((t,i) => {
    els.push(text(20+i*88,H-100,t,11,P.text3,{font:'Georgia, serif'}));
    els.push(rect(20+i*88-4,H-114,t.length*7+8,20,'transparent',{stroke:P.line,sw:0.5,rx:6}));
  });

  // Side margin marks (editorial detail)
  [0,1,2,3,4,5,6].forEach(i => {
    els.push(rect(10,215+i*18,6,1,P.line,{rx:0.5,opacity:0.5}));
  });

  // Paragraph break indicators
  els.push(rect(10,267,6,1,P.acc,{rx:0.5,opacity:0.4}));
  els.push(rect(10,303,6,1,P.acc,{rx:0.5,opacity:0.4}));

  // Word count
  els.push(text(W-20,H-148,'248 words · 4 min read',10,P.text3,{anchor:'end',font:'Georgia, serif',opacity:0.6}));

  // Progress ring (writing goal)
  els.push(circle(24,H-156,10,P.bg3,{stroke:P.acc3,sw:2}));
  els.push(text(24,H-152,'◕',12,P.acc,{anchor:'middle',font:'Georgia, serif',opacity:0.7}));

  navBar(els,'journal');
  return els;
}

// ── Screen 4: Reflect — Weekly patterns ──
function screenReflect() {
  const els = [];
  els.push(rect(0,0,W,H,P.bg));
  statusBar(els);

  els.push(text(20,78,'Reflect',32,P.text,{fw:300,font:'Georgia, serif',ls:'-0.01em'}));
  els.push(text(20,100,'Week of April 7–13',12,P.text3,{font:'Georgia, serif'}));

  // Period selector
  const periods = ['Week','Month','Quarter','Year'];
  periods.forEach((p,i) => {
    const isA = p==='Week';
    els.push(rect(20+i*86,100,76,26,isA?P.acc:P.bg3,{rx:13}));
    els.push(text(20+i*86+38,117,p,10,isA?P.surf:P.text2,{anchor:'middle',fw:isA?600:400,font:'Georgia, serif'}));
  });

  // Weekly mood arc — bento large
  els.push(rect(20,140,W-40,120,P.surf,{rx:14}));
  els.push(text(34,161,'Mood arc',10,P.text3,{fw:600,ls:'0.1em',font:'Georgia, serif'}));
  els.push(text(W-34,161,'Avg 7.1',10,P.acc2,{anchor:'end',font:'Georgia, serif'}));
  // Day bars
  const days = ['M','T','W','T','F','S','S'];
  const moods = [6,7,5,8,9,7,8]; // out of 10
  days.forEach((d,i) => {
    const bx = 34 + i*44;
    const bh = moods[i] * 6;
    const by = 240 - bh;
    const col = moods[i] >= 8 ? P.acc : moods[i] >= 6 ? P.acc2 : P.warm;
    // Background bar
    els.push(rect(bx,240-60,28,60,P.bg3,{rx:4,opacity:0.5}));
    els.push(rect(bx,by,28,bh,col,{rx:4,opacity:0.85}));
    els.push(text(bx+14,252,d,9,P.text3,{anchor:'middle',font:'Georgia, serif'}));
    // Value dot on hover state (today = last bar)
    if(i===6) {
      els.push(circle(bx+14,by-4,3,P.acc));
      els.push(text(bx+14,by-12,'8',8,P.acc,{anchor:'middle',font:'Georgia, serif'}));
    }
  });

  // Bento grid 2x2
  // Top-left: streak
  els.push(rect(20,280,140,104,P.acc,{rx:14}));
  els.push(text(32,304,'Streak',10,'rgba(255,255,255,0.6)',{fw:600,ls:'0.1em',font:'Georgia, serif'}));
  els.push(text(32,348,'12',46,P.surf,{fw:300,font:'Georgia, serif'}));
  els.push(text(32,368,'days',12,'rgba(255,255,255,0.7)',{font:'Georgia, serif'}));
  // Flame icons
  [0,1,2,3,4].forEach(i => {
    els.push(text(32+i*20,384,'◎',8,'rgba(255,255,255,0.4)',{font:'Georgia, serif'}));
  });

  // Top-right: words
  els.push(rect(172,280,W-192,104,P.bg3,{rx:14}));
  els.push(text(184,304,'Words',10,P.text3,{fw:600,ls:'0.1em',font:'Georgia, serif'}));
  els.push(text(184,348,'2,840',28,P.text,{fw:300,font:'Georgia, serif'}));
  els.push(text(184,368,'this week',11,P.text2,{font:'Georgia, serif'}));
  // Mini sparkline
  const sparkPts=[0,12,8,18,22,15,20];
  sparkPts.forEach((p,i) => {
    if(i<sparkPts.length-1){
      els.push(line(184+i*22,384-p*0.8,184+(i+1)*22,384-sparkPts[i+1]*0.8,P.acc2,{sw:1.5,opacity:0.6}));
    }
    els.push(circle(184+i*22,384-p*0.8,2,P.acc2,{opacity:0.6}));
  });

  // Bottom-left: moments
  els.push(rect(20,392,140,80,P.bg3,{rx:14}));
  els.push(text(32,412,'Moments',10,P.text3,{fw:600,ls:'0.1em',font:'Georgia, serif'}));
  els.push(text(32,446,'28',32,P.acc,{fw:300,font:'Georgia, serif'}));
  els.push(text(32,462,'logged',10,P.text2,{font:'Georgia, serif'}));

  // Bottom-right: avg energy
  els.push(rect(172,392,W-192,80,P.bg3,{rx:14}));
  els.push(text(184,412,'Avg energy',10,P.text3,{fw:600,ls:'0.1em',font:'Georgia, serif'}));
  els.push(text(184,446,'7.4',32,P.acc2,{fw:300,font:'Georgia, serif'}));
  els.push(text(184,462,'/ 10',10,P.text2,{font:'Georgia, serif'}));

  // Weekly insight card
  sectionLabel(els,20,488,'WEEKLY INSIGHT');
  els.push(rect(20,502,W-40,88,P.warm2,{rx:14}));
  els.push(rect(20,502,4,88,P.warm,{rx:2}));
  els.push(text(36,524,'Your best days started early.',13,P.text,{fw:500,font:'Georgia, serif'}));
  els.push(text(36,542,'On mornings you wrote before 8am,',11,P.text2,{font:'Georgia, serif'}));
  els.push(text(36,558,'energy averaged 8.5 — 18% higher',11,P.text2,{font:'Georgia, serif'}));
  els.push(text(36,574,'than late starts.',11,P.text2,{font:'Georgia, serif'}));

  // Top tags
  sectionLabel(els,20,608,'TOP THEMES');
  const tags = ['slowness','nature','connection','focus','gratitude','reading'];
  let tx = 20; let ty = 622;
  tags.forEach(tag => {
    const tw = tag.length*7+20;
    if(tx+tw>W-20){tx=20;ty+=32;}
    els.push(rect(tx,ty,tw,24,P.acc3,{rx:12}));
    els.push(text(tx+tw/2,ty+16,tag,10,P.acc,{anchor:'middle',fw:500,font:'Georgia, serif'}));
    tx += tw + 8;
  });

  navBar(els,'reflect');
  return els;
}

// ── Screen 5: Profile / Settings ──
function screenProfile() {
  const els = [];
  els.push(rect(0,0,W,H,P.bg));
  statusBar(els);

  // Profile header — editorial
  els.push(rect(20,54,W-40,140,P.surf,{rx:16}));
  els.push(circle(60,110,28,P.acc3));
  els.push(text(60,116,'SL',16,P.acc,{anchor:'middle',fw:600,font:'Georgia, serif'}));
  els.push(text(106,90,'Sarah Lowe',20,P.text,{fw:400,font:'Georgia, serif'}));
  els.push(text(106,110,'Joined January 2026',11,P.text3,{font:'Georgia, serif'}));
  els.push(text(106,130,'12 day streak ◎',12,P.acc,{fw:500,font:'Georgia, serif'}));

  // Lifetime stats
  sectionLabel(els,20,216,'SINCE JANUARY');
  els.push(rect(20,228,W-40,72,P.bg3,{rx:14}));
  const stats = [
    { label:'Entries', value:'84' },
    { label:'Words', value:'18.2K' },
    { label:'Moments', value:'312' },
  ];
  stats.forEach((s,i) => {
    const sx = 40 + i*110;
    els.push(text(sx,258,s.value,22,P.acc,{fw:300,font:'Georgia, serif'}));
    els.push(text(sx,278,s.label,10,P.text3,{font:'Georgia, serif',ls:'0.05em'}));
    if (i < 2) els.push(line(sx+88,238,sx+88,286,P.line,{sw:1,opacity:0.5}));
  });

  // Settings rows
  sectionLabel(els,20,322,'PREFERENCES');
  const settings = [
    { label:'Daily reminder', val:'7:00 AM', icon:'◎' },
    { label:'Writing prompt', val:'On', icon:'◐' },
    { label:'Export journal', val:'PDF, Markdown', icon:'○' },
    { label:'Privacy lock', val:'Face ID', icon:'●' },
    { label:'Theme', val:'Warm ivory', icon:'◑' },
  ];
  settings.forEach((s,i) => {
    const y = 336+i*54;
    els.push(rect(20,y,W-40,46,P.surf,{rx:12}));
    els.push(text(36,y+17,s.icon,14,P.acc,{font:'Georgia, serif'}));
    els.push(text(56,y+17,s.label,13,P.text,{fw:400,font:'Georgia, serif'}));
    els.push(text(W-36,y+17,s.val,11,P.text3,{anchor:'end',font:'Georgia, serif'}));
    els.push(text(W-24,y+17,'›',14,P.text3,{anchor:'end',font:'Georgia, serif'}));
    if (i<settings.length-1) els.push(line(36,y+46,W-36,y+46,P.line,{sw:0.5,opacity:0.4}));
  });

  // Export + community
  sectionLabel(els,20,610,'COMMUNITY');
  const comm = [
    { label:'Cedar Community', sub:'2,400 quiet writers', icon:'○' },
    { label:'Share a snippet', sub:'Post to your profile', icon:'◎' },
    { label:'What\'s new', sub:'v1.0 changelog', icon:'◑' },
  ];
  comm.forEach((c,i) => {
    const y2 = 624+i*50;
    els.push(rect(20,y2,W-40,42,P.surf,{rx:10}));
    els.push(text(36,y2+15,c.icon,14,P.acc,{font:'Georgia, serif'}));
    els.push(text(56,y2+15,c.label,13,P.text,{fw:400,font:'Georgia, serif'}));
    els.push(text(56,y2+30,c.sub,10,P.text3,{font:'Georgia, serif'}));
    els.push(text(W-36,y2+22,'›',14,P.text3,{anchor:'end',font:'Georgia, serif'}));
    if(i<comm.length-1) els.push(line(36,y2+42,W-36,y2+42,P.line,{sw:0.5,opacity:0.4}));
  });

  // Version
  els.push(text(W/2,H-92,'Cedar 1.0 · a place for slow reflection',10,P.text3,{anchor:'middle',font:'Georgia, serif',ls:'0.02em',opacity:0.6}));

  navBar(els,'profile');
  return els;
}

// ── Screen 5b: Log a Moment modal ──
function screenLogMoment() {
  const els = [];
  els.push(rect(0,0,W,H,P.bg));
  statusBar(els);

  // Dim overlay at top
  els.push(rect(0,0,W,60,'rgba(0,0,0,0.02)'));
  els.push(text(20,76,'←',16,P.text2,{font:'Georgia, serif'}));
  els.push(text(W/2,76,'Log a moment',16,P.text,{anchor:'middle',fw:400,font:'Georgia, serif'}));

  // Time chip
  els.push(rect(W/2-44,90,88,26,P.acc3,{rx:13}));
  els.push(text(W/2,107,'Now · 2:48 PM',10,P.acc,{anchor:'middle',fw:500,font:'Georgia, serif'}));

  // What happened input
  els.push(rect(20,128,W-40,72,P.surf,{rx:14}));
  els.push(text(36,152,'What happened?',13,P.text,{fw:500,font:'Georgia, serif'}));
  els.push(text(36,172,'Describe the moment in a few words…',11,P.text3,{font:'Georgia, serif'}));

  // Tags row
  sectionLabel(els,20,218,'CATEGORY');
  const cats = ['Nature','Focus','Connect','Rest','Create','Move','Eat','Read'];
  let cx2=20, cy2=232;
  cats.forEach((c,i) => {
    const cw2 = c.length*7+22;
    if(cx2+cw2>W-20){cx2=20;cy2+=32;}
    const isActive = c==='Nature';
    els.push(rect(cx2,cy2,cw2,26,isActive?P.acc:P.bg3,{rx:13}));
    els.push(text(cx2+cw2/2,cy2+17,c,10,isActive?P.surf:P.text2,{anchor:'middle',fw:isActive?600:400,font:'Georgia, serif'}));
    cx2+=cw2+8;
  });

  // Mood & energy
  sectionLabel(els,20,300,'HOW ARE YOU FEELING?');
  const moods2 = ['😔','😐','🙂','😊','😄'];
  moods2.forEach((m,i)=>{
    const mx=44+i*64;
    els.push(circle(mx,336,20,i===3?P.acc3:'transparent',{stroke:i===3?P.acc:'transparent',sw:1.5}));
    els.push(text(mx,342,m,18,P.text,{anchor:'middle'}));
  });

  sectionLabel(els,20,372,'ENERGY LEVEL');
  els.push(rect(20,386,W-40,8,P.bg3,{rx:4}));
  els.push(rect(20,386,220,8,P.acc,{rx:4}));
  els.push(circle(240,390,12,P.surf,{stroke:P.acc,sw:2}));
  els.push(text(20,408,'Low',9,P.text3,{font:'Georgia, serif'}));
  els.push(text(W-20,408,'High',9,P.text3,{anchor:'end',font:'Georgia, serif'}));

  // Note optional
  sectionLabel(els,20,428,'ADD A NOTE (OPTIONAL)');
  els.push(rect(20,442,W-40,64,P.surf,{rx:14}));
  els.push(text(36,466,'A quiet walk — surprised how still the',11,P.text2,{font:'Georgia, serif'}));
  els.push(text(36,482,'park felt for a Saturday afternoon.',11,P.text2,{font:'Georgia, serif'}));

  // Tags
  sectionLabel(els,20,522,'TAGS');
  ['#walk','#saturday','#nature','#peace'].forEach((t,i)=>{
    els.push(rect(20+i*72,536,64,24,P.acc3,{rx:12}));
    els.push(text(20+i*72+32,552,t,9,P.acc,{anchor:'middle',font:'Georgia, serif'}));
  });
  els.push(rect(20+4*72,536,28,24,P.bg3,{rx:12}));
  els.push(text(20+4*72+14,552,'+',12,P.text3,{anchor:'middle',font:'Georgia, serif'}));

  // Save
  els.push(rect(20,580,W-40,52,P.acc,{rx:26}));
  els.push(text(W/2,611,'Save moment',15,P.surf,{anchor:'middle',fw:500,font:'Georgia, serif'}));

  // Quick save
  els.push(text(W/2,648,'Quick save without details',11,P.text3,{anchor:'middle',font:'Georgia, serif'}));

  navBar(els,'today');
  return els;
}

// ── Screen 6: Onboarding ──
function screenOnboarding() {
  const els = [];
  els.push(rect(0,0,W,H,P.bg));

  // Lush background detail
  els.push(rect(0,0,W,H/2+80,P.acc3,{opacity:0.35}));
  // Decorative arc (simulated with rects)
  for(let i=0;i<6;i++){
    els.push(rect(-20+i*10,H/2-20+i*8,W+40,8,P.acc,{opacity:0.04+i*0.01,rx:4}));
  }

  // Logo mark
  els.push(rect(W/2-28,90,56,56,P.acc,{rx:16}));
  els.push(text(W/2,127,'⊕',24,P.surf,{anchor:'middle',font:'Georgia, serif'}));
  els.push(text(W/2,162,'Cedar',30,P.text,{anchor:'middle',fw:300,font:'Georgia, serif',ls:'0.08em'}));
  els.push(text(W/2,182,'a place for slow reflection',13,P.text3,{anchor:'middle',font:'Georgia, serif',ls:'0.02em'}));

  // Editorial illustration area (gestural lines)
  els.push(rect(60,210,270,180,P.surf,{rx:20,opacity:0.7}));
  // Gestural text lines
  [0,1,2,3,4,5,6,7].forEach(i => {
    const w2 = [220,180,200,160,210,140,190,100][i];
    const op = [0.15,0.12,0.18,0.1,0.16,0.1,0.13,0.08][i];
    els.push(rect(80,230+i*20,w2,6,P.text,{rx:3,opacity:op}));
  });
  els.push(text(W/2,318,'Journal · Reflect · Grow',11,P.text2,{anchor:'middle',font:'Georgia, serif',ls:'0.04em'}));

  // Benefits
  const benefits = [
    '◎  Write freely, every day',
    '◐  Track energy and mood over time',
    '○  Discover patterns in your weeks',
  ];
  benefits.forEach((b,i) => {
    els.push(text(W/2,420+i*28,b,13,P.text,{anchor:'middle',font:'Georgia, serif'}));
  });

  // CTA
  els.push(rect(20,600,W-40,52,P.acc,{rx:26}));
  els.push(text(W/2,631,'Begin your journal',15,P.surf,{anchor:'middle',fw:500,font:'Georgia, serif',ls:'0.02em'}));

  // Secondary
  els.push(text(W/2,668,'I already have an account',12,P.text3,{anchor:'middle',font:'Georgia, serif'}));

  // Fine print
  els.push(text(W/2,720,'Free forever · No ads · Your words, private',10,P.text3,{anchor:'middle',font:'Georgia, serif',opacity:0.5,ls:'0.02em'}));

  // Decorative dots pattern (subtle)
  for(let i=0;i<5;i++){
    for(let j=0;j<3;j++){
      els.push(circle(60+j*60,760+i*14,1.5,P.acc,{opacity:0.12+i*0.03}));
    }
  }

  // Page dots indicator
  [0,1,2].forEach(i => {
    els.push(circle(W/2-16+i*16,790,i===0?4:3,i===0?P.acc:P.bg3));
  });

  return els;
}

// ── Build pen file ──
const screens = [
  { name: 'Onboarding',               fn: screenOnboarding },
  { name: 'Today — Daily Overview',   fn: screenToday      },
  { name: 'Journal — Entry List',     fn: screenJournal    },
  { name: 'Journal — Write Entry',    fn: screenNewEntry   },
  { name: 'Log a Moment',             fn: screenLogMoment  },
  { name: 'Reflect — Weekly Patterns',fn: screenReflect    },
  { name: 'Profile & Settings',       fn: screenProfile    },
];

const penScreens = screens.map(s => {
  const elements = s.fn();
  return { name: s.name, svg: '', elements };
});

const totalElements = penScreens.reduce((a,s) => a + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name:      'Cedar — Slow-living journal & life tracker',
    author:    'RAM',
    date:      new Date().toISOString(),
    theme:     'light',
    heartbeat: 'cedar',
    elements:  totalElements,
    palette: {
      bg:    P.bg,
      surf:  P.surf,
      text:  P.text,
      acc:   P.acc,
      acc2:  P.acc2,
    },
  },
  screens: penScreens,
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`Cedar: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
