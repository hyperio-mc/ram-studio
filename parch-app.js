'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'parch';
const W = 390, H = 844;

// Warm parchment light palette
const BG     = '#FAF7F0';
const SURF   = '#FFFFFF';
const CARD   = '#F2EBD9';
const TEXT   = '#1A1208';
const ACC    = '#5B2D8E';  // deep grape
const ACC2   = '#C46E2E';  // warm amber
const MUTED  = 'rgba(26,18,8,0.42)';
const BORDER = 'rgba(26,18,8,0.10)';
const SPINE  = '#E8DFC8';  // book spine tone

function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function rect(x,y,w,h,fill,opts={}) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${opts.rx?` rx="${opts.rx}"`:''}${opts.opacity?` opacity="${opts.opacity}"`:''}${opts.stroke?` stroke="${opts.stroke}" stroke-width="${opts.sw||1}"`:''}/>`;
}
function text(x,y,content,size,fill,opts={}) {
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-family="${opts.font||'Georgia, serif'}" font-weight="${opts.fw||'400'}" text-anchor="${opts.anchor||'start'}"${opts.ls?` letter-spacing="${opts.ls}"`:''}${opts.opacity?` opacity="${opts.opacity}"`:''}${opts.style?` style="${opts.style}"`:''} xml:space="preserve">${esc(content)}</text>`;
}
function circle(cx,cy,r,fill,opts={}) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"${opts.opacity?` opacity="${opts.opacity}"`:''}${opts.stroke?` stroke="${opts.stroke}" stroke-width="${opts.sw||1}"`:''}/>`;
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${opts.sw||1}"${opts.opacity?` opacity="${opts.opacity}"`:''}/>`;
}

// ──────────────────────────────────────────────
// SCREEN 1: LIBRARY — Book spine collection view
// ──────────────────────────────────────────────
function screen1() {
  const els = [];
  let n = 0;

  // BG
  els.push(rect(0,0,W,H,BG)); n++;

  // Status bar
  els.push(text(20,22,'9:41',12,TEXT,{fw:'600',font:'system-ui,sans-serif'})); n++;
  els.push(text(370,22,'●●●',12,TEXT,{anchor:'end',font:'system-ui,sans-serif',opacity:'0.5'})); n++;

  // Header
  els.push(text(20,62,'My Library',28,TEXT,{fw:'700',font:'Georgia,serif'})); n++;
  els.push(text(20,82,'143 books  ·  29 read this year',12,MUTED,{font:'system-ui,sans-serif'})); n++;

  // Search bar
  els.push(rect(20,96,350,38,SURF,{rx:10,stroke:BORDER,sw:1})); n++;
  els.push(text(50,120,'Search your library…',14,MUTED,{font:'system-ui,sans-serif'})); n++;
  // Search icon
  els.push(circle(36,115,8,BORDER,{})); n++;
  els.push(line(42,121,47,126,MUTED,{sw:2})); n++;

  // Filter tabs
  const tabs = ['All','Reading','Finished','Want to'];
  tabs.forEach((t,i) => {
    const x = 20 + i*82;
    const active = i===0;
    els.push(rect(x,145, 75, 26, active?ACC:SURF, {rx:13, stroke:active?'none':BORDER, sw:1})); n++;
    els.push(text(x+37, 163, t, 11, active?'#FFF':TEXT, {anchor:'middle',fw:'500',font:'system-ui,sans-serif'})); n++;
  });

  // Book spine cards — tall vertical cards like actual book spines on a shelf
  const books = [
    {title:'The Making of',author:'Caro',color:'#7B4F2E',acc:'#E8C97A',pages:832,pct:68,status:'Reading'},
    {title:'Piranesi',author:'Clarke',color:'#2E5C7B',acc:'#A8D4F5',pages:272,pct:100,status:'Done'},
    {title:'Orbital',author:'Harvey',color:'#4A7B2E',acc:'#C5E8A0',pages:136,pct:100,status:'Done'},
    {title:'Poor Things',author:'Gray',color:'#7B2E5C',acc:'#F5A8D4',pages:328,pct:42,status:'Reading'},
    {title:'Demon',author:'Tanaka',color:'#2E4A7B',acc:'#A0C5F5',pages:888,pct:12,status:'Reading'},
  ];

  // Shelf row 1
  els.push(rect(0,187,W,12,SPINE,{})); n++; // shelf board
  books.forEach((b,i) => {
    const x = 16 + i*73;
    const spH = 128 + Math.floor(Math.random()*0)*0 + [14,0,22,8,18][i];
    const y = 187 - spH;
    // Spine
    els.push(rect(x, y, 60, spH, b.color, {rx:3})); n++;
    // Spine title (rotated via transform)
    els.push(`<text transform="rotate(-90,${x+30},${y+spH/2})" x="${x+30}" y="${y+spH/2+5}" font-size="9" fill="${b.acc}" font-family="Georgia,serif" font-weight="600" text-anchor="middle">${esc(b.title)}</text>`); n++;
    // Progress dot at bottom
    if (b.status === 'Reading') {
      els.push(circle(x+50, y+spH-8, 5, ACC2, {})); n++;
    } else {
      els.push(circle(x+50, y+spH-8, 5, '#5BC47B', {})); n++;
    }
  });

  // Shelf row 2 — smaller books
  const y2base = 345;
  els.push(rect(0,y2base,W,12,SPINE,{})); n++;
  const books2 = [
    {title:'Matrix',color:'#8B6914',pages:336,pct:100},
    {title:'Bewil.',color:'#1A5C44',pages:288,pct:0},
    {title:'Shuggie',color:'#5C1A1A',pages:448,pct:100},
    {title:'Interms.',color:'#1A3C5C',pages:384,pct:55},
    {title:'Trust',color:'#4A1A5C',pages:416,pct:0},
  ];
  books2.forEach((b,i) => {
    const x = 16 + i*73;
    const spH = 98 + [0,12,6,18,4][i];
    const y = y2base - spH;
    els.push(rect(x,y,60,spH,b.color,{rx:3})); n++;
    els.push(`<text transform="rotate(-90,${x+30},${y+spH/2})" x="${x+30}" y="${y+spH/2+5}" font-size="8" fill="rgba(255,255,255,0.85)" font-family="Georgia,serif" text-anchor="middle">${esc(b.title)}</text>`); n++;
  });

  // Currently reading section
  els.push(text(20,382,'Currently Reading',11,MUTED,{fw:'600',font:'system-ui,sans-serif',ls:'0.8'})); n++;

  // Active book card
  els.push(rect(20,398,350,108,SURF,{rx:14,stroke:BORDER,sw:1})); n++;
  // Book cover mini
  els.push(rect(32,410,60,84,ACC,{rx:4})); n++;
  els.push(text(62,446,'P',28,SURF,{anchor:'middle',fw:'700',font:'Georgia,serif'})); n++;
  // Book info
  els.push(text(106,420,'The Making of the',14,TEXT,{fw:'700',font:'Georgia,serif'})); n++;
  els.push(text(106,436,'President, 1960',14,TEXT,{fw:'700',font:'Georgia,serif'})); n++;
  els.push(text(106,452,'Theodore H. White',12,MUTED,{font:'system-ui,sans-serif'})); n++;
  // Progress bar
  els.push(rect(106,462,252,5,BORDER,{rx:3})); n++;
  els.push(rect(106,462,171,5,ACC,{rx:3})); n++; // 68%
  els.push(text(106,480,'p. 565 of 832',11,MUTED,{font:'system-ui,sans-serif'})); n++;
  els.push(text(352,480,'68%',11,ACC,{anchor:'end',fw:'600',font:'system-ui,sans-serif'})); n++;

  // Quick actions row
  const actions = ['+ Note','📑 Highlight','▶ Continue'];
  actions.forEach((a,i) => {
    const x = 20 + i*118;
    els.push(rect(x, 518, 110, 32, i===2?ACC:SURF, {rx:10, stroke:i===2?'none':BORDER, sw:1})); n++;
    els.push(text(x+55, 539, a, 12, i===2?'#FFF':TEXT, {anchor:'middle',fw:i===2?'600':'400',font:'system-ui,sans-serif'})); n++;
  });

  // Want to Read row
  els.push(text(20,574,'Want to Read',11,MUTED,{fw:'600',font:'system-ui,sans-serif',ls:'0.8'})); n++;
  const want = ['Tomorrow, Tomorrow','The Vaster Wilds','James'];
  want.forEach((w,i) => {
    const y = 588+i*44;
    els.push(rect(20,y,350,38,SURF,{rx:10,stroke:BORDER,sw:1})); n++;
    els.push(rect(30,y+8,20,22,CARD,{rx:3})); n++;
    els.push(text(40,y+24,'📖',9,TEXT,{anchor:'middle'})); n++;
    els.push(text(60,y+24,w,13,TEXT,{fw:'500',font:'Georgia,serif'})); n++;
    els.push(text(365,y+24,'›',16,MUTED,{anchor:'end',font:'system-ui,sans-serif'})); n++;
  });

  // Bottom nav
  els.push(rect(0,796,W,H-796,BG,{})); n++;
  els.push(line(0,796,W,796,BORDER,{sw:1})); n++;
  const navItems = [['📚','Library'],['📝','Notes'],['✦','Discover'],['📊','Stats'],['👤','Profile']];
  navItems.forEach(([ic,lb],i) => {
    const x = 39 + i*78;
    const active = i===0;
    els.push(text(x,824,ic,20,active?ACC:MUTED,{anchor:'middle',font:'system-ui,sans-serif'})); n++;
    els.push(text(x,842,lb,9,active?ACC:MUTED,{anchor:'middle',font:'system-ui,sans-serif'})); n++;
    if (active) { els.push(rect(x-16,793,32,3,ACC,{rx:2})); n++; }
  });

  return { name:'Library', svg:`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${els.join('')}</svg>`, elements:els };
}

// ──────────────────────────────────────────────
// SCREEN 2: READING NOW — Immersive current book
// ──────────────────────────────────────────────
function screen2() {
  const els = [];
  let n = 0;

  els.push(rect(0,0,W,H,BG)); n++;
  els.push(text(20,22,'9:41',12,TEXT,{fw:'600',font:'system-ui,sans-serif'})); n++;

  // Large book cover area with warm gradient feel
  els.push(rect(0,36,W,320,ACC,{})); n++;
  // Texture overlay suggestion
  els.push(rect(0,36,W,320,'rgba(0,0,0,0.15)',{})); n++;
  // Book cover art — abstract
  els.push(circle(195,180,90,'rgba(255,255,255,0.08)',{})); n++;
  els.push(circle(195,180,60,'rgba(255,255,255,0.08)',{})); n++;
  els.push(text(195,160,'P',72,'rgba(255,255,255,0.9)',{anchor:'middle',fw:'700',font:'Georgia,serif'})); n++;
  els.push(text(195,190,'PARCH',12,'rgba(255,255,255,0.5)',{anchor:'middle',fw:'600',font:'system-ui,sans-serif',ls:'4'})); n++;

  // Book title overlay at bottom of cover
  els.push(rect(0,290,W,66,'rgba(0,0,0,0.4)',{})); n++;
  els.push(text(20,318,'The Making of the President, 1960',15,'#FFFFFF',{fw:'700',font:'Georgia,serif'})); n++;
  els.push(text(20,338,'Theodore H. White  ·  1961',12,'rgba(255,255,255,0.7)',{font:'system-ui,sans-serif'})); n++;

  // Back button on cover
  els.push(text(20,60,'‹',22,'rgba(255,255,255,0.8)',{font:'system-ui,sans-serif'})); n++;
  els.push(text(365,60,'⋯',20,'rgba(255,255,255,0.8)',{anchor:'end',font:'system-ui,sans-serif'})); n++;

  // Reading session card
  els.push(rect(20,368,350,120,SURF,{rx:16,stroke:BORDER,sw:1})); n++;
  els.push(text(36,392,'Reading Session',11,MUTED,{fw:'600',font:'system-ui,sans-serif',ls:'0.8'})); n++;

  // Session stats
  const sStats = [['Pages Today','47'],['Time','1h 23m'],['Pace','32 p/h']];
  sStats.forEach(([l,v],i) => {
    const x = 36 + i*110;
    els.push(text(x,428,v,24,TEXT,{fw:'700',font:'Georgia,serif'})); n++;
    els.push(text(x,446,l,11,MUTED,{font:'system-ui,sans-serif'})); n++;
  });

  // Thin divider
  els.push(line(36,456,354,456,BORDER,{sw:1})); n++;
  els.push(text(36,476,'Reading streak',12,TEXT,{font:'system-ui,sans-serif'})); n++;

  // Streak dots
  const days = ['M','T','W','T','F','S','S'];
  days.forEach((d,i) => {
    const x = 200 + i*22;
    const done = i < 5;
    els.push(circle(x,468,7,done?ACC:BORDER,{})); n++;
    els.push(text(x,470,done?'✓':d,7,done?'#FFF':MUTED,{anchor:'middle',font:'system-ui,sans-serif'})); n++;
  });
  els.push(text(354,476,'5 days',12,ACC,{anchor:'end',fw:'600',font:'system-ui,sans-serif'})); n++;

  // Book progress
  els.push(rect(20,500,350,54,CARD,{rx:12})); n++;
  els.push(text(36,522,'Progress',12,MUTED,{font:'system-ui,sans-serif'})); n++;
  els.push(text(354,522,'p. 565 / 832',12,TEXT,{anchor:'end',font:'system-ui,sans-serif'})); n++;
  els.push(rect(36,530,318,8,BORDER,{rx:4})); n++;
  els.push(rect(36,530,216,8,ACC,{rx:4})); n++;
  els.push(text(36,548,'68%',10,ACC,{fw:'600',font:'system-ui,sans-serif'})); n++;
  els.push(text(354,548,'~5h left',10,MUTED,{anchor:'end',font:'system-ui,sans-serif'})); n++;

  // Featured quote section
  els.push(text(20,574,'Recent Highlight',11,MUTED,{fw:'600',font:'system-ui,sans-serif',ls:'0.8'})); n++;
  els.push(rect(20,590,350,120,SURF,{rx:14,stroke:BORDER,sw:1})); n++;
  // Quote mark
  els.push(text(34,618,'"',36,ACC,{fw:'700',font:'Georgia,serif',opacity:'0.3'})); n++;
  els.push(text(36,626,'"Politics is not the art of the',13,TEXT,{font:'Georgia,serif'})); n++;
  els.push(text(36,644,'possible. It consists in choosing',13,TEXT,{font:'Georgia,serif'})); n++;
  els.push(text(36,662,'between the disastrous and',13,TEXT,{font:'Georgia,serif'})); n++;
  els.push(text(36,680,'the unpalatable."',13,TEXT,{font:'Georgia,serif',fw:'600'})); n++;
  els.push(text(36,700,'p. 534',11,MUTED,{font:'system-ui,sans-serif'})); n++;
  els.push(text(354,700,'Share',11,ACC,{anchor:'end',fw:'600',font:'system-ui,sans-serif'})); n++;

  // Bottom nav
  els.push(rect(0,796,W,H-796,BG,{})); n++;
  els.push(line(0,796,W,796,BORDER,{sw:1})); n++;
  const navItems = [['📚','Library'],['📝','Notes'],['✦','Discover'],['📊','Stats'],['👤','Profile']];
  navItems.forEach(([ic,lb],i) => {
    const x = 39+i*78;
    const active = i===0;
    els.push(text(x,824,ic,20,active?ACC:MUTED,{anchor:'middle',font:'system-ui,sans-serif'})); n++;
    els.push(text(x,842,lb,9,active?ACC:MUTED,{anchor:'middle',font:'system-ui,sans-serif'})); n++;
  });

  return { name:'Reading Now', svg:`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${els.join('')}</svg>`, elements:els };
}

// ──────────────────────────────────────────────
// SCREEN 3: HIGHLIGHTS — Saved passages library
// ──────────────────────────────────────────────
function screen3() {
  const els = [];
  let n = 0;

  els.push(rect(0,0,W,H,BG)); n++;
  els.push(text(20,22,'9:41',12,TEXT,{fw:'600',font:'system-ui,sans-serif'})); n++;

  els.push(text(20,62,'Highlights',28,TEXT,{fw:'700',font:'Georgia,serif'})); n++;
  els.push(text(20,82,'184 saved passages',12,MUTED,{font:'system-ui,sans-serif'})); n++;

  // Sort/filter row
  const filters = ['Recent','By Book','Favorites'];
  filters.forEach((f,i) => {
    const x = 20+i*108;
    const active = i===0;
    els.push(rect(x,95,100,28,active?ACC:SURF,{rx:14,stroke:active?'none':BORDER,sw:1})); n++;
    els.push(text(x+50,114,f,12,active?'#FFF':TEXT,{anchor:'middle',fw:'500',font:'system-ui,sans-serif'})); n++;
  });

  // Quote cards
  const quotes = [
    { book:'The Making of the President', quote:'"Politics is not the art of the possible. It consists in choosing between the disastrous and the unpalatable."', page:'p. 534', color:ACC, fav:true },
    { book:'Piranesi', quote:'"The World is very beautiful. I am very fortunate to live in it."', page:'p. 12', color:'#2E5C7B', fav:false },
    { book:'Orbital', quote:'"The planet doesn\'t know it\'s being watched. The planet doesn\'t know anything."', page:'p. 89', color:'#4A7B2E', fav:true },
    { book:'Poor Things', quote:'"I am not a slave to past identity. I make myself what I am."', page:'p. 214', color:'#7B2E5C', fav:false },
  ];

  quotes.forEach((q,i) => {
    const y = 138+i*160;
    if (y+145 > 790) return;
    els.push(rect(20,y,350,145,SURF,{rx:14,stroke:BORDER,sw:1})); n++;
    // Left accent stripe
    els.push(rect(20,y,4,145,q.color,{rx:2})); n++;
    // Book name
    els.push(text(36,y+22,q.book,10,MUTED,{fw:'600',font:'system-ui,sans-serif',ls:'0.5'})); n++;
    // Quote text
    const words = q.quote;
    const line1 = words.slice(0,40);
    const line2 = words.slice(40,80);
    const line3 = words.slice(80,120);
    els.push(text(36,y+46,line1,13,TEXT,{font:'Georgia,serif',fw:'400'})); n++;
    if (line2) { els.push(text(36,y+64,line2,13,TEXT,{font:'Georgia,serif',fw:'400'})); n++; }
    if (line3) { els.push(text(36,y+82,line3,13,TEXT,{font:'Georgia,serif',fw:'400'})); n++; }
    // Page + actions
    els.push(text(36,y+115,q.page,11,MUTED,{font:'system-ui,sans-serif'})); n++;
    els.push(text(354,y+115,q.fav?'♥':'♡',14,q.fav?ACC2:MUTED,{anchor:'end',font:'system-ui,sans-serif'})); n++;
    els.push(text(330,y+115,'Share',11,MUTED,{anchor:'end',font:'system-ui,sans-serif'})); n++;
    // Tag pill
    els.push(rect(36,y+124,60,16,q.color+'22',{rx:8})); n++;
    els.push(text(66,y+136,['Politics','Wonder','Space','Identity'][i],10,q.color,{anchor:'middle',fw:'600',font:'system-ui,sans-serif'})); n++;
  });

  // Bottom nav
  els.push(rect(0,796,W,H-796,BG,{})); n++;
  els.push(line(0,796,W,796,BORDER,{sw:1})); n++;
  const navItems = [['📚','Library'],['📝','Notes'],['✦','Discover'],['📊','Stats'],['👤','Profile']];
  navItems.forEach(([ic,lb],i) => {
    const x = 39+i*78;
    const active = i===1;
    els.push(text(x,824,ic,20,active?ACC:MUTED,{anchor:'middle',font:'system-ui,sans-serif'})); n++;
    els.push(text(x,842,lb,9,active?ACC:MUTED,{anchor:'middle',font:'system-ui,sans-serif'})); n++;
    if (active) { els.push(rect(x-16,793,32,3,ACC,{rx:2})); n++; }
  });

  return { name:'Highlights', svg:`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${els.join('')}</svg>`, elements:els };
}

// ──────────────────────────────────────────────
// SCREEN 4: DISCOVER — Curated reading lists
// ──────────────────────────────────────────────
function screen4() {
  const els = [];
  let n = 0;

  els.push(rect(0,0,W,H,BG)); n++;
  els.push(text(20,22,'9:41',12,TEXT,{fw:'600',font:'system-ui,sans-serif'})); n++;

  els.push(text(20,58,'Discover',28,TEXT,{fw:'700',font:'Georgia,serif'})); n++;
  els.push(text(20,78,'Curated lists for curious readers',13,MUTED,{font:'Georgia,serif'})); n++;

  // Featured list — large editorial card
  els.push(rect(20,94,350,180,ACC,{rx:16})); n++;
  // Decorative circles
  els.push(circle(310,130,60,'rgba(255,255,255,0.08)',{})); n++;
  els.push(circle(340,170,40,'rgba(255,255,255,0.06)',{})); n++;
  els.push(rect(28,102,80,20,'rgba(255,255,255,0.2)',{rx:10})); n++;
  els.push(text(68,116,'EDITORS PICK',8,'#FFF',{anchor:'middle',fw:'700',font:'system-ui,sans-serif',ls:'1.5'})); n++;
  els.push(text(36,146,'Books That Changed',20,'#FFF',{fw:'700',font:'Georgia,serif'})); n++;
  els.push(text(36,168,'How We Think',20,'#FFF',{fw:'700',font:'Georgia,serif'})); n++;
  els.push(text(36,192,'12 books · Curated by the Parch team',11,'rgba(255,255,255,0.65)',{font:'system-ui,sans-serif'})); n++;
  // Mini book spines in card
  ['#E8C97A','#A8D4F5','#C5E8A0','#F5A8D4'].forEach((c,i) => {
    els.push(rect(200+i*26, 224, 20, 40, c, {rx:3})); n++;
  });
  els.push(text(200,240,'· · ·',12,'rgba(255,255,255,0.5)',{font:'system-ui,sans-serif'})); n++;
  els.push(rect(316,240,48,22,SURF,{rx:11})); n++;
  els.push(text(340,256,'View',12,ACC,{anchor:'middle',fw:'700',font:'system-ui,sans-serif'})); n++;

  // List grid
  els.push(text(20,292,'Popular Lists',13,TEXT,{fw:'600',font:'system-ui,sans-serif',ls:'0.3'})); n++;

  const lists = [
    {title:'Nobel Winners of the 2000s',n:'8 books',color:'#7B4F2E'},
    {title:'Climate & Future Earth',n:'14 books',color:'#2E7B4F'},
    {title:'Short & Brilliant',n:'10 books',color:'#4F2E7B'},
    {title:'Women Writing War',n:'9 books',color:'#7B2E4F'},
    {title:'Magical Realism 101',n:'11 books',color:'#2E4F7B'},
    {title:'The New Economics',n:'7 books',color:'#7B6A2E'},
  ];

  lists.forEach((l,i) => {
    const col = i%2, row = Math.floor(i/2);
    const x = col===0 ? 20 : 196;
    const y = 310 + row*142;
    els.push(rect(x,y,166,128,SURF,{rx:14,stroke:BORDER,sw:1})); n++;
    // Color swatch top
    els.push(rect(x,y,166,48,l.color+'22',{rx:14})); n++;
    els.push(rect(x,y+28,166,20,l.color+'22',{})); n++;
    // Decorative book spines
    els.push(rect(x+14,y+8,10,34,l.color,{rx:2})); n++;
    els.push(rect(x+28,y+12,10,30,l.color+'CC',{rx:2})); n++;
    els.push(rect(x+42,y+10,10,32,l.color+'99',{rx:2})); n++;
    els.push(text(x+12,y+72,l.title,12,TEXT,{fw:'600',font:'Georgia,serif'})); n++;
    // wrap second line
    if (l.title.length > 18) {
      const w1 = l.title.slice(0,18), w2 = l.title.slice(18);
      els.pop(); n--;
      els.push(text(x+12,y+70,w1,12,TEXT,{fw:'600',font:'Georgia,serif'})); n++;
      els.push(text(x+12,y+86,w2,12,TEXT,{fw:'600',font:'Georgia,serif'})); n++;
    }
    els.push(text(x+12,y+102,l.n,11,MUTED,{font:'system-ui,sans-serif'})); n++;
    els.push(text(x+152,y+102,'›',14,MUTED,{anchor:'end',font:'system-ui,sans-serif'})); n++;
  });

  // Bottom nav
  els.push(rect(0,796,W,H-796,BG,{})); n++;
  els.push(line(0,796,W,796,BORDER,{sw:1})); n++;
  const navItems = [['📚','Library'],['📝','Notes'],['✦','Discover'],['📊','Stats'],['👤','Profile']];
  navItems.forEach(([ic,lb],i) => {
    const x = 39+i*78;
    const active = i===2;
    els.push(text(x,824,ic,20,active?ACC:MUTED,{anchor:'middle',font:'system-ui,sans-serif'})); n++;
    els.push(text(x,842,lb,9,active?ACC:MUTED,{anchor:'middle',font:'system-ui,sans-serif'})); n++;
    if (active) { els.push(rect(x-16,793,32,3,ACC,{rx:2})); n++; }
  });

  return { name:'Discover', svg:`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${els.join('')}</svg>`, elements:els };
}

// ──────────────────────────────────────────────
// SCREEN 5: STATS — Year in Books (wrapped style)
// ──────────────────────────────────────────────
function screen5() {
  const els = [];
  let n = 0;

  els.push(rect(0,0,W,H,BG)); n++;
  els.push(text(20,22,'9:41',12,TEXT,{fw:'600',font:'system-ui,sans-serif'})); n++;

  els.push(text(20,60,'2025',40,ACC,{fw:'700',font:'Georgia,serif'})); n++;
  els.push(text(20,80,'in Books',20,TEXT,{fw:'400',font:'Georgia,serif'})); n++;

  // Hero stat — large editorial number
  els.push(rect(20,100,350,130,ACC,{rx:20})); n++;
  els.push(circle(320,140,60,'rgba(255,255,255,0.08)',{})); n++;
  els.push(text(195,160,'29',72,'#FFF',{anchor:'middle',fw:'700',font:'Georgia,serif'})); n++;
  els.push(text(195,188,'books read',14,'rgba(255,255,255,0.7)',{anchor:'middle',font:'system-ui,sans-serif'})); n++;
  els.push(text(195,208,'↑ 8 more than last year',11,'rgba(255,255,255,0.55)',{anchor:'middle',font:'system-ui,sans-serif'})); n++;

  // Stats row
  const stats = [['9,847','pages'],['184','highlights'],['27','notes']];
  stats.forEach(([v,l],i) => {
    const x = 20+i*118;
    els.push(rect(x,242,110,72,SURF,{rx:14,stroke:BORDER,sw:1})); n++;
    els.push(text(x+55,272,v,20,TEXT,{anchor:'middle',fw:'700',font:'Georgia,serif'})); n++;
    els.push(text(x+55,290,l,11,MUTED,{anchor:'middle',font:'system-ui,sans-serif'})); n++;
  });

  // Monthly bars chart
  els.push(text(20,336,'Books per month',11,MUTED,{fw:'600',font:'system-ui,sans-serif',ls:'0.8'})); n++;
  const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];
  const vals = [2,1,3,2,4,2,1,3,5,2,3,1];
  const maxV = 5;
  const barW = 22, gap = 6, bx0 = 24;
  months.forEach((m,i) => {
    const x = bx0 + i*(barW+gap);
    const bh = Math.round((vals[i]/maxV)*80);
    const y = 428 - bh;
    const isMax = vals[i]===maxV;
    els.push(rect(x,y,barW,bh,isMax?ACC:CARD,{rx:4})); n++;
    if (isMax) els.push(text(x+11,y-6,vals[i].toString(),10,ACC,{anchor:'middle',fw:'700',font:'system-ui,sans-serif'})); n++;
    els.push(text(x+11,444,m,9,MUTED,{anchor:'middle',font:'system-ui,sans-serif'})); n++;
  });

  // Genre breakdown
  els.push(text(20,466,'Genres',11,MUTED,{fw:'600',font:'system-ui,sans-serif',ls:'0.8'})); n++;
  const genres = [['Fiction','#5B2D8E',40],['History','#2E5C7B',28],['Essays','#4A7B2E',18],['Other','#AAAAAA',14]];
  genres.forEach(([g,c,pct],i) => {
    const y = 480+i*42;
    els.push(text(20,y+18,g,13,TEXT,{fw:'500',font:'system-ui,sans-serif'})); n++;
    els.push(text(354,y+18,pct+'%',13,TEXT,{anchor:'end',fw:'700',font:'Georgia,serif'})); n++;
    els.push(rect(20,y+24,318,6,BORDER,{rx:3})); n++;
    els.push(rect(20,y+24,Math.round(318*pct/100),6,c,{rx:3})); n++;
  });

  // Fav book of year
  els.push(rect(20,660,350,68,CARD,{rx:14})); n++;
  els.push(text(36,680,'Top Read of 2025',10,MUTED,{fw:'600',font:'system-ui,sans-serif',ls:'0.8'})); n++;
  els.push(text(36,702,'Orbital',18,TEXT,{fw:'700',font:'Georgia,serif'})); n++;
  els.push(text(36,718,'Samantha Harvey  ·  2024 Booker Prize',12,MUTED,{font:'system-ui,sans-serif'})); n++;
  els.push(text(354,700,'★ 5.0',14,ACC2,{anchor:'end',fw:'700',font:'system-ui,sans-serif'})); n++;

  // Bottom nav
  els.push(rect(0,796,W,H-796,BG,{})); n++;
  els.push(line(0,796,W,796,BORDER,{sw:1})); n++;
  const navItems = [['📚','Library'],['📝','Notes'],['✦','Discover'],['📊','Stats'],['👤','Profile']];
  navItems.forEach(([ic,lb],i) => {
    const x = 39+i*78;
    const active = i===3;
    els.push(text(x,824,ic,20,active?ACC:MUTED,{anchor:'middle',font:'system-ui,sans-serif'})); n++;
    els.push(text(x,842,lb,9,active?ACC:MUTED,{anchor:'middle',font:'system-ui,sans-serif'})); n++;
    if (active) { els.push(rect(x-16,793,32,3,ACC,{rx:2})); n++; }
  });

  return { name:'Stats', svg:`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${els.join('')}</svg>`, elements:els };
}

// ──────────────────────────────────────────────
// SCREEN 6: PROFILE — Reader identity & settings
// ──────────────────────────────────────────────
function screen6() {
  const els = [];
  let n = 0;

  els.push(rect(0,0,W,H,BG)); n++;
  els.push(text(20,22,'9:41',12,TEXT,{fw:'600',font:'system-ui,sans-serif'})); n++;
  els.push(text(370,22,'⚙',16,MUTED,{anchor:'end',font:'system-ui,sans-serif'})); n++;

  // Avatar section
  els.push(circle(195,96,44,ACC,{})); n++;
  els.push(text(195,104,'EL',20,'#FFF',{anchor:'middle',fw:'700',font:'Georgia,serif'})); n++;
  els.push(text(195,156,'Elena Lockwood',18,TEXT,{anchor:'middle',fw:'700',font:'Georgia,serif'})); n++;
  els.push(text(195,174,'@elenabooks · Reader since 2019',12,MUTED,{anchor:'middle',font:'system-ui,sans-serif'})); n++;

  // Edit button
  els.push(rect(152,184,86,28,SURF,{rx:14,stroke:BORDER,sw:1})); n++;
  els.push(text(195,203,'Edit Profile',12,TEXT,{anchor:'middle',fw:'500',font:'system-ui,sans-serif'})); n++;

  // Key stats row
  const pStats = [['143','Books'],['29','This year'],['5','Day streak']];
  pStats.forEach(([v,l],i) => {
    const x = 28+i*118;
    els.push(rect(x,224,108,64,SURF,{rx:12,stroke:BORDER,sw:1})); n++;
    els.push(text(x+54,254,v,22,TEXT,{anchor:'middle',fw:'700',font:'Georgia,serif'})); n++;
    els.push(text(x+54,270,l,11,MUTED,{anchor:'middle',font:'system-ui,sans-serif'})); n++;
  });

  // Badge section
  els.push(text(20,310,'Badges',13,TEXT,{fw:'600',font:'system-ui,sans-serif',ls:'0.3'})); n++;
  const badges = [['🏆','50 Books','Gold'],['🔥','7-Day','Streak'],['📚','10+ Highlights','Scholar'],['🌍','5 Countries','Explorer']];
  badges.forEach((b,i) => {
    const x = 20+i*88;
    els.push(rect(x,322,80,74,SURF,{rx:12,stroke:BORDER,sw:1})); n++;
    els.push(text(x+40,348,b[0],20,TEXT,{anchor:'middle',font:'system-ui,sans-serif'})); n++;
    els.push(text(x+40,364,b[1],9,TEXT,{anchor:'middle',fw:'600',font:'system-ui,sans-serif'})); n++;
    els.push(text(x+40,378,b[2],8,MUTED,{anchor:'middle',font:'system-ui,sans-serif'})); n++;
  });

  // Reading preferences
  els.push(text(20,418,'Reading Preferences',13,TEXT,{fw:'600',font:'system-ui,sans-serif',ls:'0.3'})); n++;
  const prefs = [
    {label:'Favourite genres',val:'Fiction, History, Essays'},
    {label:'Reading goal',val:'30 books in 2025'},
    {label:'Preferred format',val:'Physical + Digital'},
  ];
  prefs.forEach((p,i) => {
    const y = 432+i*58;
    els.push(rect(20,y,350,50,SURF,{rx:12,stroke:BORDER,sw:1})); n++;
    els.push(text(36,y+22,p.label,11,MUTED,{fw:'600',font:'system-ui,sans-serif'})); n++;
    els.push(text(36,y+38,p.val,13,TEXT,{fw:'500',font:'system-ui,sans-serif'})); n++;
    els.push(text(355,y+30,'›',16,MUTED,{anchor:'end',font:'system-ui,sans-serif'})); n++;
  });

  // Share / export
  els.push(rect(20,614,350,52,ACC,{rx:16})); n++;
  els.push(text(195,645,'Share My Reading Year',14,'#FFF',{anchor:'middle',fw:'600',font:'system-ui,sans-serif'})); n++;

  // Sign out
  els.push(text(195,692,'Sign out',13,MUTED,{anchor:'middle',font:'system-ui,sans-serif'})); n++;
  els.push(line(172,697,218,697,MUTED,{sw:1,opacity:'0.4'})); n++;

  // Bottom nav
  els.push(rect(0,796,W,H-796,BG,{})); n++;
  els.push(line(0,796,W,796,BORDER,{sw:1})); n++;
  const navItems = [['📚','Library'],['📝','Notes'],['✦','Discover'],['📊','Stats'],['👤','Profile']];
  navItems.forEach(([ic,lb],i) => {
    const x = 39+i*78;
    const active = i===4;
    els.push(text(x,824,ic,20,active?ACC:MUTED,{anchor:'middle',font:'system-ui,sans-serif'})); n++;
    els.push(text(x,842,lb,9,active?ACC:MUTED,{anchor:'middle',font:'system-ui,sans-serif'})); n++;
    if (active) { els.push(rect(x-16,793,32,3,ACC,{rx:2})); n++; }
  });

  return { name:'Profile', svg:`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${els.join('')}</svg>`, elements:els };
}

// Assemble
const screens = [screen1(), screen2(), screen3(), screen4(), screen5(), screen6()];
const totalElements = screens.reduce((s,sc)=>s+sc.elements.length,0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'PARCH',
    author: 'RAM',
    date: new Date().toISOString().slice(0,10),
    theme: 'light',
    heartbeat: 48,
    elements: totalElements,
    description: 'A warm parchment reading tracker & personal library companion — book spines, highlights, reading stats and curated lists.',
  },
  screens: screens.map(sc => ({
    name: sc.name,
    svg: sc.svg,
    elements: sc.elements,
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`PARCH: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
