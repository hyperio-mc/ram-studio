'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG = 'lode';
const W = 390, H = 844;

// ── Palette: Warm Parchment × Terracotta ("Spaceship Manual" light) ──────────
const BG     = '#F5F0E8';   // warm parchment
const SURF   = '#EDE8DF';   // deeper cream
const CARD   = '#E5DED3';   // card surface
const RULE   = '#C4BAA8';   // hairline rule
const TEXT   = '#1A1818';   // near-black
const MUTED  = '#7A7268';   // muted warm gray
const ACC    = '#B85C38';   // terracotta accent
const ACC2   = '#4A7C6F';   // sage green
const BADGE_ERR   = '#C0392B'; // error red
const BADGE_WARN  = '#D97706'; // amber
const BADGE_INFO  = '#4A7C6F'; // sage

let elCount = 0;

// ── Primitives ────────────────────────────────────────────────────────────────
function rect(x,y,w,h,fill,opts={}) {
  elCount++;
  const rx     = opts.rx     ?? 0;
  const op     = opts.opacity ?? 1;
  const stroke = opts.stroke  ? `stroke="${opts.stroke}" stroke-width="${opts.sw??1}"` : '';
  const dash   = opts.dash    ? `stroke-dasharray="${opts.dash}"` : '';
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" rx="${rx}" opacity="${op}" ${stroke} ${dash}/>`;
}

function text(x,y,content,size,fill,opts={}) {
  elCount++;
  const fw     = opts.fw     ?? 400;
  const font   = opts.font   ?? 'system-ui, sans-serif';
  const anchor = opts.anchor ?? 'start';
  const ls     = opts.ls     ? `letter-spacing="${opts.ls}"` : '';
  const op     = opts.opacity ?? 1;
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${fw}" font-family="${font}" text-anchor="${anchor}" ${ls} opacity="${op}">${content}</text>`;
}

function circle(cx,cy,r,fill,opts={}) {
  elCount++;
  const op     = opts.opacity ?? 1;
  const stroke = opts.stroke  ? `stroke="${opts.stroke}" stroke-width="${opts.sw??1}"` : '';
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${op}" ${stroke}/>`;
}

function line(x1,y1,x2,y2,stroke,opts={}) {
  elCount++;
  const sw   = opts.sw   ?? 1;
  const op   = opts.opacity ?? 1;
  const dash = opts.dash  ? `stroke-dasharray="${opts.dash}"` : '';
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" opacity="${op}" ${dash}/>`;
}

function pill(x,y,w,h,fill,label,textFill,size=9) {
  elCount += 2;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" rx="${h/2}" opacity="0.15"/>
          <text x="${x+w/2}" y="${y+h/2+3.5}" font-size="${size}" fill="${textFill}" font-weight="600" font-family="monospace" text-anchor="middle">${label}</text>`;
}

function pillSolid(x,y,w,h,fill,label,textFill,size=9) {
  elCount += 2;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" rx="${h/2}"/>
          <text x="${x+w/2}" y="${y+h/2+3.5}" font-size="${size}" fill="${textFill}" font-weight="700" font-family="monospace" text-anchor="middle">${label}</text>`;
}

// Monospace annotation label (01, 02 etc.)
function callout(x,y,num,label) {
  elCount += 3;
  return `
    <text x="${x}" y="${y}" font-size="8" fill="${MUTED}" font-weight="600" font-family="monospace" letter-spacing="1">${num}</text>
    <text x="${x+18}" y="${y}" font-size="8" fill="${MUTED}" font-family="monospace" opacity="0.7">${label}</text>`;
}

// Horizontal hairline rule
function rule(y, x1=20, x2=370) {
  return line(x1, y, x2, y, RULE, { sw: 0.75, opacity: 0.8 });
}

// Small status dot
function dot(x,y,fill,r=3.5) { return circle(x,y,r,fill); }

// Sparkline mini-chart
function sparkline(x,y,w,h,values,color) {
  elCount++;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v,i) => {
    const px = x + (i/(values.length-1))*w;
    const py = y + h - ((v-min)/range)*h;
    return `${px.toFixed(1)},${py.toFixed(1)}`;
  }).join(' ');
  return `<polyline points="${pts}" stroke="${color}" stroke-width="1.5" fill="none" opacity="0.9"/>`;
}

// Bar chart bar
function bar(x,y,w,h,fill,op=1) {
  elCount++;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" rx="1.5" opacity="${op}"/>`;
}

// ── Status Bar ────────────────────────────────────────────────────────────────
function statusBar() {
  return `
    ${rect(0,0,W,44,BG)}
    ${text(20,28,'9:41',12,TEXT,{fw:600,font:'monospace'})}
    ${text(370,28,'100%',10,MUTED,{anchor:'end',font:'monospace'})}
    ${text(345,28,'▮▮▮',10,TEXT,{anchor:'end'})}`;
}

// ── Navigation Bar ────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon:'◉', label:'Dashboard', id:0 },
  { icon:'⚠', label:'Issues',    id:1 },
  { icon:'◈', label:'Deps',      id:2 },
  { icon:'▦', label:'Map',       id:3 },
  { icon:'◷', label:'Reports',   id:4 },
];

function navBar(active=0) {
  const NAV_Y = H - 80;
  const items = NAV_ITEMS;
  const IW = W / items.length;
  let els = `
    ${rect(0,NAV_Y,W,80,BG)}
    ${line(0,NAV_Y,W,NAV_Y,RULE,{sw:1})}`;
  items.forEach((item,i) => {
    const cx = IW*i + IW/2;
    const isActive = i === active;
    const col = isActive ? ACC : MUTED;
    els += `
      ${text(cx,NAV_Y+28,item.icon,18,col,{anchor:'middle',fw: isActive ? 700 : 400})}
      ${text(cx,NAV_Y+46,item.label,8,col,{anchor:'middle',fw: isActive ? 600 : 400, font:'monospace'})}`;
    if (isActive) {
      els += rect(cx-16, NAV_Y-2, 32, 3, ACC, {rx:1.5});
    }
  });
  return els;
}

// ── Top Header ────────────────────────────────────────────────────────────────
function topHeader(title, sub='') {
  return `
    ${rule(60)}
    ${text(20,52,title,13,TEXT,{fw:700,font:'monospace',ls:'1.5'})}
    ${sub ? text(W-20,52,sub,9,MUTED,{anchor:'end',font:'monospace'}) : ''}
    ${rule(62)}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 1 — Dashboard
// ─────────────────────────────────────────────────────────────────────────────
function screen1() {
  elCount = 0;
  const els = [];

  // BG
  els.push(rect(0,0,W,H,BG));
  els.push(statusBar());

  // Header
  els.push(rule(62));
  els.push(text(20,52,'LODE',14,TEXT,{fw:800,font:'monospace',ls:'4'}));
  els.push(text(W-20,52,'v2.4.1',9,MUTED,{anchor:'end',font:'monospace'}));
  els.push(rule(64));

  // Repo context line
  els.push(text(20,80,'acme-corp/platform-api',10,MUTED,{font:'monospace'}));
  els.push(dot(W-28,76,ACC2));
  els.push(text(W-20,80,'HEALTHY',9,ACC2,{anchor:'end',fw:600,font:'monospace'}));

  // ── Main debt score dial ──────────────────────────────────────────────────
  // Big number hero
  els.push(text(W/2,148,'74',52,TEXT,{fw:800,anchor:'middle',font:'monospace'}));
  els.push(text(W/2,168,'/100',11,MUTED,{anchor:'middle',font:'monospace'}));
  els.push(text(W/2,188,'DEBT SCORE',8,MUTED,{anchor:'middle',fw:600,font:'monospace',ls:'2'}));

  // Arc indicator (simplified as arcs using lines)
  for (let i=0; i<24; i++) {
    const angle = (i/24)*Math.PI;
    const r = 58;
    const cx = W/2, cy = 148;
    const x = cx + r*Math.cos(Math.PI + angle);
    const y = cy + r*Math.sin(Math.PI + angle)*0.6;
    const filled = i < Math.round((74/100)*24);
    els.push(circle(x,y, 3, filled ? ACC : RULE, {opacity: filled ? 0.9 : 0.5}));
  }

  // Rule
  els.push(rule(206));

  // ── 3-metric row ─────────────────────────────────────────────────────────
  const metrics = [
    { label:'COVERAGE', value:'87%',  trend:'+2.1', up:true },
    { label:'VELOCITY', value:'4.2x', trend:'+0.3', up:true },
    { label:'ISSUES',   value:'23',   trend:'+5',   up:false },
  ];
  metrics.forEach((m,i) => {
    const x = 20 + i*(W-40)/3 + (W-40)/6;
    els.push(text(x,228,m.label,7,MUTED,{anchor:'middle',fw:600,font:'monospace',ls:'1'}));
    els.push(text(x,250,m.value,18,TEXT,{anchor:'middle',fw:700,font:'monospace'}));
    const trendCol = m.up ? ACC2 : BADGE_ERR;
    els.push(text(x,264,m.trend,8,trendCol,{anchor:'middle',fw:600,font:'monospace'}));
    if (i < 2) els.push(line(20+(i+1)*(W-40)/3+20, 216, 20+(i+1)*(W-40)/3+20, 272, RULE, {sw:0.75}));
  });

  els.push(rule(276));

  // ── Trend chart ───────────────────────────────────────────────────────────
  els.push(callout(20, 298, '01', 'DEBT TREND — LAST 30 DAYS'));
  els.push(rule(302));

  // Chart area
  els.push(rect(20,310,350,100,SURF,{rx:4,opacity:0.7}));

  // Grid lines
  for (let i=0; i<=4; i++) {
    const gy = 310 + i*25;
    els.push(line(20,gy,370,gy,RULE,{sw:0.5,opacity:0.5}));
    const val = 100 - i*25;
    els.push(text(24,gy-2,val+'',6,MUTED,{font:'monospace',opacity:0.7}));
  }

  // Debt score line (historical: was 88, improved to 74)
  const debtHistory = [88,85,84,82,81,80,79,77,76,75,74,74,73,75,76,74,74,74,75,73,72,74,74,73,74,74,74,74,74,74];
  els.push(sparkline(40, 312, 310, 95, debtHistory, ACC));

  // Coverage line
  const covHistory = [78,79,79,80,81,82,82,83,83,84,84,84,85,85,85,86,86,86,86,87,87,87,87,87,87,87,87,87,87,87];
  els.push(sparkline(40, 312, 310, 95, covHistory, ACC2));

  // Legend
  els.push(dot(26,428,ACC,3)); els.push(text(33,431,'Debt',7,MUTED,{font:'monospace'}));
  els.push(dot(70,428,ACC2,3)); els.push(text(77,431,'Coverage',7,MUTED,{font:'monospace'}));

  // ── Top issues preview ────────────────────────────────────────────────────
  els.push(rule(438));
  els.push(callout(20, 458, '02', 'CRITICAL ISSUES'));
  els.push(rule(462));

  const issues = [
    { sev:'ERR', file:'auth/session.ts',   line:'L142', msg:'Unhandled promise rejection', color:BADGE_ERR },
    { sev:'WRN', file:'api/routes/user.ts', line:'L89',  msg:'SQL injection risk — param unsanitized', color:BADGE_WARN },
    { sev:'ERR', file:'core/queue.ts',      line:'L231', msg:'Memory leak in EventEmitter', color:BADGE_ERR },
  ];

  issues.forEach((iss, i) => {
    const y = 472 + i*50;
    els.push(rect(20,y,350,44,SURF,{rx:6,opacity:0.8}));
    els.push(pillSolid(28,y+8,28,16,iss.color,iss.sev,'#FFF',7));
    els.push(text(64,y+19,iss.file,9,TEXT,{fw:600,font:'monospace'}));
    els.push(text(W-28,y+19,iss.line,8,MUTED,{anchor:'end',font:'monospace'}));
    els.push(text(28,y+34,iss.msg,8,MUTED,{font:'monospace'}));
  });

  // Nav
  els.push(navBar(0));

  return { name:'Dashboard', svg:`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${els.join('')}</svg>`, elements: elCount };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 2 — Issues
// ─────────────────────────────────────────────────────────────────────────────
function screen2() {
  elCount = 0;
  const els = [];

  els.push(rect(0,0,W,H,BG));
  els.push(statusBar());
  els.push(topHeader('ISSUES','23 OPEN'));

  // Filter pills
  const filters = ['ALL','ERROR','WARNING','INFO','RESOLVED'];
  let fx = 20;
  filters.forEach((f,i) => {
    const fw = f.length*6+14;
    if (i===0) {
      els.push(pillSolid(fx,72,fw,22,ACC,f,'#FFF',8));
    } else {
      els.push(pill(fx,72,fw,22,TEXT,f,TEXT,8));
    }
    fx += fw + 8;
  });

  els.push(rule(100));

  // Issue list
  const issueList = [
    { sev:'ERR', file:'auth/session.ts',      line:'142',  msg:'Unhandled promise rejection on token refresh',  age:'2h',  color:BADGE_ERR,  impact:'HIGH' },
    { sev:'ERR', file:'core/queue.ts',         line:'231',  msg:'EventEmitter memory leak — no removeListener', age:'4h',  color:BADGE_ERR,  impact:'HIGH' },
    { sev:'WRN', file:'api/routes/user.ts',    line:'89',   msg:'SQL injection risk — param unsanitized',       age:'6h',  color:BADGE_WARN, impact:'MED'  },
    { sev:'WRN', file:'services/billing.ts',   line:'310',  msg:'Deprecated Stripe API method',                 age:'1d',  color:BADGE_WARN, impact:'MED'  },
    { sev:'WRN', file:'db/migrations/045.sql', line:'22',   msg:'Missing index on users.email',                 age:'1d',  color:BADGE_WARN, impact:'LOW'  },
    { sev:'INFO',file:'utils/logger.ts',        line:'14',   msg:'Console.log left in production path',          age:'2d',  color:BADGE_INFO, impact:'LOW'  },
    { sev:'INFO',file:'components/Table.tsx',   line:'88',   msg:'Re-renders on every parent state change',      age:'3d',  color:BADGE_INFO, impact:'LOW'  },
    { sev:'WRN', file:'api/middleware/rate.ts', line:'67',   msg:'Rate limit bypass via header spoofing',        age:'3d',  color:BADGE_WARN, impact:'HIGH' },
    { sev:'ERR', file:'workers/report.ts',      line:'178',  msg:'Uncaught division by zero in stats calc',      age:'4d',  color:BADGE_ERR,  impact:'MED'  },
  ];

  issueList.slice(0,7).forEach((iss, i) => {
    const y = 106 + i*82;
    if (y + 78 > H - 84) return;

    // Card
    els.push(rect(20,y,350,76,SURF,{rx:6,opacity:0.85}));

    // Severity pill
    els.push(pillSolid(28,y+8,28,16,iss.color,iss.sev,'#FFF',7));

    // Impact badge
    const impCol = iss.impact==='HIGH' ? BADGE_ERR : iss.impact==='MED' ? BADGE_WARN : BADGE_INFO;
    els.push(pill(W-50,y+8,38,16,impCol,iss.impact,impCol,7));

    // File + line
    els.push(text(62,y+20,iss.file,9,TEXT,{fw:700,font:'monospace'}));
    els.push(text(W-26,y+20,'L'+iss.line,8,MUTED,{anchor:'end',font:'monospace'}));

    // Message
    const shortMsg = iss.msg.length > 46 ? iss.msg.slice(0,43)+'...' : iss.msg;
    els.push(text(28,y+36,shortMsg,8,MUTED,{font:'monospace'}));

    // Callout line with age
    els.push(line(28,y+50,100,y+50,RULE,{sw:0.5,dash:'3,3'}));
    els.push(text(28,y+64,'DETECTED',7,MUTED,{font:'monospace',ls:'0.5',opacity:0.7}));
    els.push(text(100,y+64,iss.age+' ago',7,MUTED,{font:'monospace'}));
    els.push(text(W-24,y+64,'→ VIEW',8,ACC,{anchor:'end',fw:600,font:'monospace'}));
  });

  els.push(navBar(1));
  return { name:'Issues', svg:`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${els.join('')}</svg>`, elements: elCount };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 3 — Dependencies
// ─────────────────────────────────────────────────────────────────────────────
function screen3() {
  elCount = 0;
  const els = [];

  els.push(rect(0,0,W,H,BG));
  els.push(statusBar());
  els.push(topHeader('DEPENDENCIES','42 PACKAGES'));

  // Summary row
  els.push(rect(20,72,350,52,SURF,{rx:6,opacity:0.8}));
  const depsummary = [
    { label:'UP TO DATE', val:'31', col:ACC2 },
    { label:'OUTDATED',   val:'8',  col:BADGE_WARN },
    { label:'CRITICAL',   val:'3',  col:BADGE_ERR },
  ];
  depsummary.forEach((d,i) => {
    const x = 20 + i*(350/3) + (350/3)/2;
    els.push(text(x,94,d.val,18,d.col,{anchor:'middle',fw:800,font:'monospace'}));
    els.push(text(x,108,d.label,6,MUTED,{anchor:'middle',fw:600,font:'monospace',ls:'0.5'}));
    if (i < 2) els.push(line(20+(i+1)*(350/3)+20,78,20+(i+1)*(350/3)+20,118,RULE,{sw:0.75}));
  });

  els.push(rule(130));
  els.push(callout(20,148,'01','CRITICAL — IMMEDIATE ACTION'));
  els.push(rule(152));

  // Critical deps
  const critDeps = [
    { name:'lodash',         ver:'4.17.11', latest:'4.17.21', type:'Prototype pollution CVE-2019-10744' },
    { name:'node-fetch',     ver:'2.6.1',   latest:'3.3.2',   type:'ReDoS vulnerability in parsing' },
    { name:'json-web-token', ver:'8.5.1',   latest:'9.0.0',   type:'Algorithm confusion attack vector' },
  ];

  critDeps.forEach((dep,i) => {
    const y = 158 + i*66;
    els.push(rect(20,y,350,60,SURF,{rx:6,opacity:0.85}));
    // Severity dot
    els.push(dot(33,y+14,BADGE_ERR,5));
    els.push(text(44,y+18,dep.name,11,TEXT,{fw:700,font:'monospace'}));
    // Version arrow
    els.push(text(W-24,y+18,dep.latest,9,ACC2,{anchor:'end',fw:600,font:'monospace'}));
    els.push(text(W-60,y+18,'→',9,MUTED,{anchor:'end'}));
    els.push(text(W-68,y+18,dep.ver,9,BADGE_ERR,{anchor:'end',font:'monospace',fw:500}));
    els.push(text(28,y+34,dep.type,8,MUTED,{font:'monospace'}));
    // Fix CTA
    els.push(rect(W-74,y+42,54,14,ACC,{rx:7}));
    els.push(text(W-47,y+52,'npm update',6,'#FFF',{anchor:'middle',font:'monospace',fw:600}));
  });

  els.push(rule(360));
  els.push(callout(20,378,'02','OUTDATED PACKAGES'));
  els.push(rule(382));

  // Outdated deps list
  const outdated = [
    { name:'axios',          cur:'1.4.0',  new:'1.7.2',  days:90  },
    { name:'typescript',     cur:'5.0.4',  new:'5.4.3',  days:45  },
    { name:'react',          cur:'18.2.0', new:'18.3.1', days:30  },
    { name:'prisma',         cur:'5.1.0',  new:'5.13.0', days:120 },
    { name:'zod',            cur:'3.21.0', new:'3.23.0', days:20  },
  ];

  outdated.forEach((dep,i) => {
    const y = 388 + i*46;
    if (y + 42 > H - 84) return;
    els.push(rect(20,y,350,40,SURF,{rx:4,opacity:0.6}));
    els.push(dot(33,y+14,BADGE_WARN,4));
    els.push(text(44,y+18,dep.name,9,TEXT,{fw:600,font:'monospace'}));
    els.push(text(44,y+32,dep.days+'d behind',7,MUTED,{font:'monospace'}));
    els.push(text(W-24,y+18,dep.new,9,ACC2,{anchor:'end',fw:600,font:'monospace'}));
    els.push(text(W-68,y+18,dep.cur,9,MUTED,{anchor:'end',font:'monospace'}));
  });

  els.push(navBar(2));
  return { name:'Dependencies', svg:`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${els.join('')}</svg>`, elements: elCount };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 4 — Codebase Map
// ─────────────────────────────────────────────────────────────────────────────
function screen4() {
  elCount = 0;
  const els = [];

  els.push(rect(0,0,W,H,BG));
  els.push(statusBar());
  els.push(topHeader('CODEBASE MAP','HEAT VIEW'));

  els.push(text(20,80,'Relative file health by debt density',9,MUTED,{font:'monospace'}));

  // Treemap-style heat grid
  const modules = [
    // Big cards
    { label:'api/routes',      w:160, h:100, debt:82, col:BADGE_ERR,  files:24 },
    { label:'services',        w:165, h:100, debt:71, col:BADGE_WARN, files:18 },
    // Medium
    { label:'core',            w:110, h:88,  debt:63, col:BADGE_WARN, files:12 },
    { label:'auth',            w:110, h:88,  debt:90, col:BADGE_ERR,  files:8  },
    { label:'db',              w:105, h:88,  debt:45, col:ACC2,       files:15 },
    // Small
    { label:'utils',           w:80,  h:70,  debt:30, col:ACC2,       files:22 },
    { label:'workers',         w:80,  h:70,  debt:58, col:BADGE_WARN, files:7  },
    { label:'components',      w:80,  h:70,  debt:28, col:ACC2,       files:31 },
    { label:'config',          w:80,  h:70,  debt:15, col:ACC2,       files:9  },
  ];

  // Layout the treemap manually
  const positions = [
    { x:20,  y:92  },
    { x:185, y:92  },
    { x:20,  y:196 },
    { x:134, y:196 },
    { x:248, y:196 },
    { x:20,  y:288 },
    { x:104, y:288 },
    { x:188, y:288 },
    { x:272, y:288 },
  ];

  modules.forEach((m,i) => {
    const pos = positions[i];
    if (!pos) return;
    const op = 0.12 + (m.debt/100)*0.25;
    // Fill rect with opacity based on debt
    els.push(rect(pos.x, pos.y, m.w-4, m.h-4, m.col, {rx:6, opacity:op}));
    // Border
    els.push(rect(pos.x, pos.y, m.w-4, m.h-4, m.col, {rx:6, opacity:0.6, stroke:m.col, sw:0.75}));
    // Label
    els.push(text(pos.x+8, pos.y+18, m.label, 8, TEXT, {fw:700,font:'monospace'}));
    els.push(text(pos.x+8, pos.y+32, m.files+' files', 7, MUTED, {font:'monospace'}));
    // Debt score
    els.push(text(pos.x+8, pos.y+m.h-12, m.debt, 16, m.col, {fw:800,font:'monospace',opacity:0.9}));
  });

  // Legend
  const ly = 368;
  els.push(rule(ly));
  els.push(callout(20, ly+18, '01', 'DEBT DENSITY SCALE'));
  els.push(rule(ly+22));

  const scale = [
    { label:'CRITICAL 80+', col:BADGE_ERR  },
    { label:'WARN 50–79',   col:BADGE_WARN },
    { label:'HEALTHY <50',  col:ACC2       },
  ];
  scale.forEach((s,i) => {
    const sx = 20 + i*116;
    els.push(dot(sx+4, ly+38, s.col, 5));
    els.push(text(sx+14, ly+42, s.label, 7, MUTED, {font:'monospace',fw:500}));
  });

  els.push(rule(ly+54));

  // Module detail table
  els.push(callout(20, ly+70, '02', 'WORST MODULES'));
  const worst = [
    { mod:'auth/session.ts',    score:90, delta:'+3' },
    { mod:'api/routes/user.ts', score:82, delta:'-1' },
    { mod:'api/routes/auth.ts', score:79, delta:'+2' },
  ];

  worst.forEach((w,i) => {
    const wy = ly+76+i*42;
    els.push(rect(20,wy,350,36,SURF,{rx:4,opacity:0.7}));
    els.push(dot(32,wy+14,BADGE_ERR,4));
    els.push(text(44,wy+18,w.mod,9,TEXT,{fw:600,font:'monospace'}));
    els.push(text(W-60,wy+18,w.score,14,BADGE_ERR,{fw:800,font:'monospace',anchor:'end'}));
    const dCol = w.delta.startsWith('+') ? BADGE_ERR : ACC2;
    els.push(text(W-24,wy+18,w.delta,9,dCol,{anchor:'end',fw:600,font:'monospace'}));
  });

  els.push(navBar(3));
  return { name:'Codebase Map', svg:`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${els.join('')}</svg>`, elements: elCount };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 5 — Reports
// ─────────────────────────────────────────────────────────────────────────────
function screen5() {
  elCount = 0;
  const els = [];

  els.push(rect(0,0,W,H,BG));
  els.push(statusBar());
  els.push(topHeader('REPORTS','SPRINT 24'));

  // Sprint summary
  els.push(rect(20,72,350,80,SURF,{rx:8,opacity:0.85}));
  els.push(text(28,90,'SPRINT 24 RETROSPECTIVE',8,MUTED,{fw:600,font:'monospace',ls:'1'}));
  els.push(rule(94));
  const sprintMetrics = [
    { label:'ISSUES CLOSED',  val:'17' },
    { label:'DEBT REDUCED',   val:'−9' },
    { label:'COVERAGE GAIN',  val:'+4%' },
    { label:'NEW DEPS',       val:'3'  },
  ];
  sprintMetrics.forEach((m,i) => {
    const sx = 28 + i*88;
    els.push(text(sx, 110, m.val, 14, TEXT, {fw:800,font:'monospace'}));
    els.push(text(sx, 124, m.label, 6, MUTED, {font:'monospace',ls:'0.3'}));
  });
  els.push(text(W-28,142,'Apr 1–10 2026',8,MUTED,{anchor:'end',font:'monospace'}));

  els.push(rule(160));
  els.push(callout(20,178,'01','DEBT BY CATEGORY'));
  els.push(rule(182));

  // Bar chart - debt by category
  const cats = [
    { label:'Security',   val:38, col:BADGE_ERR  },
    { label:'Perf',       val:24, col:BADGE_WARN },
    { label:'Complexity', val:20, col:ACC        },
    { label:'Style',      val:12, col:BADGE_INFO },
    { label:'Docs',       val:6,  col:MUTED      },
  ];
  const BAR_X = 20, BAR_W = 350;
  cats.forEach((cat,i) => {
    const by = 192 + i*40;
    const bw = (cat.val/38)*220;
    els.push(text(BAR_X, by+16, cat.label, 8, TEXT, {fw:600, font:'monospace'}));
    els.push(rect(BAR_X+74, by+4, 220, 16, RULE, {rx:3, opacity:0.4}));
    els.push(rect(BAR_X+74, by+4, bw,  16, cat.col, {rx:3, opacity:0.75}));
    els.push(text(BAR_X+74+bw+6, by+16, cat.val+'%', 8, cat.col, {fw:700,font:'monospace'}));
  });

  els.push(rule(406));
  els.push(callout(20,424,'02','WEEKLY TREND'));
  els.push(rule(428));

  // Weekly bars - 6 weeks
  const weeks = [
    { label:'W19', issues:12, closed:9  },
    { label:'W20', issues:14, closed:11 },
    { label:'W21', issues:18, closed:12 },
    { label:'W22', issues:22, closed:15 },
    { label:'W23', issues:20, closed:17 },
    { label:'W24', issues:23, closed:17 },
  ];
  const WBX = 30, WBW = 48, WBH = 80;
  weeks.forEach((w,i) => {
    const wx = WBX + i*54;
    const wy = 510;
    // Opened bar
    const oh = (w.issues/23)*WBH;
    els.push(bar(wx, wy-oh, WBW*0.45, oh, MUTED, 0.5));
    // Closed bar
    const ch = (w.closed/23)*WBH;
    els.push(bar(wx+WBW*0.5, wy-ch, WBW*0.45, ch, ACC2, 0.85));
    els.push(text(wx+WBW/2, wy+12, w.label, 7, MUTED, {anchor:'middle',font:'monospace'}));
    els.push(text(wx+WBW/2, wy-WBH-6, w.issues+'', 8, TEXT, {anchor:'middle',font:'monospace',fw:600}));
  });

  // Legend
  els.push(dot(30,530,MUTED,4)); els.push(text(38,534,'Opened',7,MUTED,{font:'monospace'}));
  els.push(dot(85,530,ACC2,4));  els.push(text(93,534,'Closed',7,MUTED,{font:'monospace'}));

  els.push(rule(552));

  // Contributor table
  els.push(callout(20,570,'03','TOP CONTRIBUTORS'));
  const contribs = [
    { name:'@alex',   fixes:8, score:'+12' },
    { name:'@morgan', fixes:5, score:'+8'  },
    { name:'@dev',    fixes:4, score:'+6'  },
  ];
  contribs.forEach((c,i) => {
    const cy = 578+i*34;
    els.push(text(20,cy+14,`${String(i+1).padStart(2,'0')}`,9,MUTED,{font:'monospace',fw:600,opacity:0.7}));
    els.push(text(40,cy+14,c.name,9,TEXT,{fw:700,font:'monospace'}));
    els.push(text(W-80,cy+14,c.fixes+' fixes',8,MUTED,{anchor:'end',font:'monospace'}));
    els.push(text(W-24,cy+14,c.score,9,ACC2,{anchor:'end',fw:700,font:'monospace'}));
    if (i < 2) els.push(rule(cy+22, 40, 370));
  });

  els.push(navBar(4));
  return { name:'Reports', svg:`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${els.join('')}</svg>`, elements: elCount };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 6 — Issue Detail (drilldown)
// ─────────────────────────────────────────────────────────────────────────────
function screen6() {
  elCount = 0;
  const els = [];

  els.push(rect(0,0,W,H,BG));
  els.push(statusBar());

  // Back header
  els.push(rule(62));
  els.push(text(20,52,'← ISSUES',9,ACC,{fw:600,font:'monospace'}));
  els.push(text(W/2,52,'ISSUE DETAIL',11,TEXT,{fw:700,anchor:'middle',font:'monospace',ls:'1'}));
  els.push(rule(64));

  // Severity + ID header card
  els.push(rect(20,72,350,72,SURF,{rx:8,opacity:0.9}));
  els.push(pillSolid(28,80,32,18,BADGE_ERR,'ERR','#FFF',8));
  els.push(pill(66,80,54,18,TEXT,'SECURITY',TEXT,7));
  els.push(text(W-28,88,'ISS-0142',9,MUTED,{anchor:'end',font:'monospace'}));
  els.push(text(28,110,'Unhandled promise rejection on token refresh',9,TEXT,{fw:700,font:'monospace'}));
  els.push(text(28,126,'auth/session.ts · Line 142',8,MUTED,{font:'monospace'}));
  els.push(text(W-28,126,'OPEN',8,BADGE_ERR,{anchor:'end',fw:600,font:'monospace'}));

  els.push(rule(152));

  // Code snippet
  els.push(callout(20,170,'01','AFFECTED CODE'));
  els.push(rect(20,176,350,108,CARD,{rx:6,opacity:1}));
  // Line numbers + code
  const codeLines = [
    { n:'140', code:'  const token = await getToken(userId);', dim:true },
    { n:'141', code:'  const session = await db.sessions.create({', dim:true },
    { n:'142', code:'    token,', dim:false, highlight:true },
    { n:'143', code:'    refreshToken: generateRefresh(),', dim:false, highlight:true },
    { n:'144', code:'  });', dim:true },
    { n:'145', code:'  return session;', dim:true },
  ];
  codeLines.forEach((cl,i) => {
    const cy = 192 + i*16;
    els.push(text(28, cy, cl.n, 8, MUTED, {font:'monospace',opacity:0.6}));
    if (cl.highlight) {
      els.push(rect(50,cy-11,310,14,BADGE_ERR,{rx:2,opacity:0.08}));
      els.push(dot(48,cy-4,BADGE_ERR,2.5));
    }
    els.push(text(54, cy, cl.code, 8, cl.dim ? MUTED : TEXT, {font:'monospace', fw: cl.highlight ? 600 : 400}));
  });

  els.push(rule(292));

  // Impact analysis
  els.push(callout(20,310,'02','IMPACT ANALYSIS'));
  const impacts = [
    { label:'SEVERITY',    val:'HIGH',              col:BADGE_ERR  },
    { label:'CVSS SCORE',  val:'8.2',               col:BADGE_ERR  },
    { label:'EXPOSED',     val:'All auth endpoints', col:TEXT       },
    { label:'FIRST SEEN',  val:'Apr 8, 2026',       col:MUTED      },
    { label:'OCCURRENCES', val:'3 call sites',      col:MUTED      },
  ];
  impacts.forEach((imp,i) => {
    const iy = 316 + i*36;
    els.push(rule(iy, 20, 370));
    els.push(text(24,iy+20,imp.label,7,MUTED,{font:'monospace',fw:600,ls:'0.5'}));
    els.push(text(W-24,iy+20,imp.val,9,imp.col,{anchor:'end',font:'monospace',fw: imp.col===TEXT?400:700}));
  });

  els.push(rule(496));

  // Suggested fix
  els.push(callout(20,514,'03','SUGGESTED FIX'));
  els.push(rect(20,520,350,80,CARD,{rx:6}));
  const fix = [
    'try {',
    '  const token = await getToken(userId);',
    '  const session = await db.sessions.create({',
    "    token, refreshToken: generateRefresh(),",
    '  }); return session;',
    "} catch(e) { throw new AuthError(e); }",
  ];
  fix.forEach((l,i) => {
    els.push(text(28, 536+i*12, l, 7, ACC2, {font:'monospace'}));
  });

  // Action buttons
  els.push(rect(20,612,165,40,ACC,{rx:8}));
  els.push(text(102,636,'APPLY FIX',10,'#FFF',{anchor:'middle',fw:700,font:'monospace'}));

  els.push(rect(195,612,175,40,SURF,{rx:8,opacity:0.9}));
  els.push(text(283,636,'ASSIGN TO ME',9,TEXT,{anchor:'middle',fw:600,font:'monospace'}));

  // Dismiss link
  els.push(text(W/2,668,'Mark as false positive',9,MUTED,{anchor:'middle',font:'monospace'}));
  els.push(line(W/2-54,670,W/2+54,670,RULE,{sw:0.75}));

  els.push(navBar(1));
  return { name:'Issue Detail', svg:`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${els.join('')}</svg>`, elements: elCount };
}

// ─────────────────────────────────────────────────────────────────────────────
// Assemble
// ─────────────────────────────────────────────────────────────────────────────
const screens = [screen1(), screen2(), screen3(), screen4(), screen5(), screen6()];
const totalEls = screens.reduce((a,s) => a + s.elements, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'LODE — Codebase Intelligence',
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'light',
    heartbeat: 43,
    elements: totalEls,
    slug: SLUG,
    palette: { bg: BG, surface: SURF, text: TEXT, accent: ACC, accent2: ACC2 },
    inspiration: 'Spaceship Manual aesthetic from Godly.website; warm parchment anti-purple challenger to AI herd',
  },
  screens: screens.map(s => ({
    name: s.name,
    svg: s.svg,
    elements: s.elements,
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`LODE: ${screens.length} screens, ${totalEls} elements`);
console.log(`Written: ${SLUG}.pen`);
