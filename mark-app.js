'use strict';
const fs = require('fs'), path = require('path');

const SLUG = 'mark';
const W = 390, H = 844;

// ─── PALETTE — Land-book teal #017C6E on warm cream ──────────────────────────
// Inspired by Land-book's exact accent and Siteinspire's editorial restraint
const BG     = '#FAF9F6';  // warm cream — Land-book off-white
const SURF   = '#FFFFFF';  // card surface
const CARD   = '#F4F2EC';  // secondary card — warm, slightly tinted
const BORDER = '#E8E5DC';  // warm light border — no harsh lines
const TEXT   = '#1A2218';  // very dark warm green-black — not pure black
const TEXT2  = '#6B7A6A';  // muted warm gray-green — secondary
const TEXT3  = '#B4BDB4';  // very muted — placeholder/disabled
const TEAL   = '#017C6E';  // Land-book's exact accent — deep teal
const TEAL_L = '#E8F4F2';  // teal 10% tint for chips / bg accents
const AMBER  = '#D97C2A';  // warm amber — warnings / at-risk
const AMB_L  = '#FBF0E6';  // amber tint
const RED    = '#C94040';  // overdue / error
const RED_L  = '#FAEAEA';  // red tint

// Project accent palette — 4 colors for project cards
const PROJ_COLORS = ['#017C6E','#6366F1','#D97C2A','#C94040']; // teal, indigo, amber, red

// ─── PRIMITIVES ──────────────────────────────────────────────────────────────
function rect(x,y,w,h,fill,opts={}) {
  return { type:'rect', x,y,w,h,fill,
    rx: opts.rx||0, opacity: opts.opacity||1,
    stroke: opts.stroke||'none', sw: opts.sw||0 };
}
function text(x,y,content,size,fill,opts={}) {
  return { type:'text', x,y,content,size,fill,
    fw: opts.fw||400, font: opts.font||'Inter,sans-serif',
    anchor: opts.anchor||'start', ls: opts.ls||0, opacity: opts.opacity||1 };
}
function circle(cx,cy,r,fill,opts={}) {
  return { type:'circle', cx,cy,r,fill,
    opacity: opts.opacity||1, stroke: opts.stroke||'none', sw: opts.sw||0 };
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  return { type:'line', x1,y1,x2,y2,stroke,
    sw: opts.sw||1, opacity: opts.opacity||1 };
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

// Status bar — light theme
function statusBar() {
  return [
    rect(0,0,W,44,BG),
    text(18,28,'9:41',14,TEXT,{fw:600}),
    text(W-18,28,'●●●',13,TEXT,{anchor:'end'}),
  ];
}

// Floating pill tab bar — Mobbin's glassmorphic floating nav pattern
// Frosted pill floating 12px above bottom, not full-width
function tabBar(active) {
  const items = [
    { id:'today',    icon:'◉', label:'Today'   },
    { id:'projects', icon:'◫', label:'Projects' },
    { id:'timer',    icon:'◷', label:'Timer'    },
    { id:'log',      icon:'≡', label:'Log'      },
    { id:'reports',  icon:'◈', label:'Reports'  },
  ];
  const NAV_Y = H - 80;
  const NAV_H = 64;
  const NAV_X = 16;
  const NAV_W = W - 32;
  const els = [
    // Floating pill container — rgba simulation: near-white with border
    rect(NAV_X, NAV_Y, NAV_W, NAV_H, SURF, { rx:32 }),
    rect(NAV_X, NAV_Y, NAV_W, NAV_H, 'none', { rx:32, stroke: BORDER, sw:1 }),
  ];
  const itemW = NAV_W / items.length;
  items.forEach((item, i) => {
    const cx = NAV_X + i * itemW + itemW / 2;
    const isActive = item.id === active;
    if (isActive) {
      // Active indicator: teal pill background behind icon+label
      els.push(rect(cx - 28, NAV_Y + 8, 56, 48, TEAL_L, { rx:20 }));
    }
    els.push(text(cx, NAV_Y + 30, item.icon, 18, isActive ? TEAL : TEXT3, { anchor:'middle', fw: isActive ? 600 : 400 }));
    els.push(text(cx, NAV_Y + 48, item.label, 10, isActive ? TEAL : TEXT2, { anchor:'middle', fw: isActive ? 600 : 400 }));
  });
  return els;
}

// Section heading
function sectionHead(y, label, action) {
  const els = [
    text(20, y, label, 13, TEXT2, { fw:600, ls:0.3 }),
  ];
  if (action) els.push(text(W-20, y, action, 13, TEAL, { anchor:'end', fw:500 }));
  return els;
}

// Pill badge
function badge(x, y, label, bg, fg) {
  return [
    rect(x, y, label.length * 7 + 16, 22, bg, { rx:11 }),
    text(x + label.length * 3.5 + 8, y + 15, label, 11, fg, { fw:600, anchor:'middle' }),
  ];
}

// Progress bar
function progressBar(x, y, w, h, pct, fg, bg) {
  return [
    rect(x, y, w, h, bg, { rx: h/2 }),
    rect(x, y, Math.max(h, w * pct / 100), h, fg, { rx: h/2 }),
  ];
}

// ─── SCREEN 1: TODAY ─────────────────────────────────────────────────────────
function screenToday() {
  const els = [];

  // Background
  els.push(rect(0,0,W,H,BG));
  els.push(...statusBar());

  // Greeting header
  els.push(text(20, 68, 'Good morning,', 16, TEXT2, { fw:400 }));
  els.push(text(20, 90, 'Alex Chen', 26, TEXT, { fw:700, ls:-0.4 }));

  // Date strip
  els.push(rect(20, 104, W-40, 1, BORDER));

  // Today summary pills — hours + earnings
  els.push(rect(20, 116, 170, 68, SURF, { rx:16 }));
  els.push(rect(20, 116, 170, 68, 'none', { rx:16, stroke:BORDER, sw:1 }));
  els.push(text(32, 138, '4h 32m', 22, TEXT, { fw:700, ls:-0.3 }));
  els.push(text(32, 158, 'tracked today', 12, TEXT2, { fw:400 }));
  els.push(circle(166, 140, 10, TEAL_L));
  els.push(text(166, 144, '◷', 12, TEAL, { anchor:'middle' }));

  els.push(rect(200, 116, W-220, 68, SURF, { rx:16 }));
  els.push(rect(200, 116, W-220, 68, 'none', { rx:16, stroke:BORDER, sw:1 }));
  els.push(text(212, 138, '$284', 22, TEXT, { fw:700, ls:-0.3 }));
  els.push(text(212, 158, 'earned today', 12, TEXT2, { fw:400 }));
  els.push(circle(W-26, 140, 10, TEAL_L));
  els.push(text(W-26, 144, '$', 12, TEAL, { anchor:'middle' }));

  // Active timer card
  els.push(rect(20, 196, W-40, 90, TEAL, { rx:18 }));
  els.push(circle(W-44, 232, 30, 'rgba(255,255,255,0.12)'));
  els.push(text(32, 222, 'Active Timer', 12, 'rgba(255,255,255,0.70)', { fw:500 }));
  els.push(text(32, 246, '1:24:07', 28, '#FFFFFF', { fw:700, ls:-0.5 }));
  els.push(text(32, 266, 'Acme Corp — Brand Identity', 13, 'rgba(255,255,255,0.80)', { fw:400 }));
  els.push(rect(W-70, 217, 36, 36, 'rgba(255,255,255,0.18)', { rx:18 }));
  els.push(text(W-52, 240, '■', 14, '#FFFFFF', { anchor:'middle' }));

  // Today's hours bar chart
  els.push(...sectionHead(310, 'TODAY\'S SESSIONS', 'see all'));
  const hours = [0.5, 1.2, 0.8, 1.5, 0.4]; // sessions
  const days = ['9am','10am','11am','2pm','4pm'];
  const barW = 42, barMaxH = 60, barY = 370, chartX = 28;
  hours.forEach((h, i) => {
    const bh = h / 2 * barMaxH;
    els.push(rect(chartX + i*(barW+12), barY-bh, barW, bh, i===1?TEAL:TEAL_L, { rx:6 }));
    els.push(text(chartX + i*(barW+12) + barW/2, barY+14, days[i], 10, TEXT3, { anchor:'middle' }));
    els.push(text(chartX + i*(barW+12) + barW/2, barY-bh-6, `${h}h`, 10, TEXT2, { anchor:'middle', fw:500 }));
  });
  els.push(line(20, barY, W-20, barY, BORDER, { sw:1 }));

  // Quick project list
  els.push(...sectionHead(400, 'ACTIVE PROJECTS', 'all'));
  const projects = [
    { name:'Acme Corp — Brand Identity', code:'ACM', color:PROJ_COLORS[0], hrs:'1h 24m', status:'on-track' },
    { name:'Forge Studio — Web Redesign', code:'FRG', color:PROJ_COLORS[1], hrs:'2h 08m', status:'on-track' },
    { name:'Nola Wines — Packaging', code:'NWP', color:PROJ_COLORS[2], hrs:'1h 00m', status:'at-risk' },
  ];
  projects.forEach((p, i) => {
    const y = 416 + i * 64;
    els.push(rect(20, y, W-40, 56, SURF, { rx:14 }));
    els.push(rect(20, y, 4, 56, p.color, { rx:2 }));
    els.push(text(36, y+20, p.name, 13, TEXT, { fw:600 }));
    els.push(text(36, y+38, p.hrs + ' today', 12, TEXT2));
    const sbg = p.status==='on-track' ? TEAL_L : AMB_L;
    const sfg = p.status==='on-track' ? TEAL : AMBER;
    els.push(...badge(W-90, y+17, p.status==='on-track'?'On track':'At risk', sbg, sfg));
  });

  // Weekly pace metric
  els.push(rect(20, 608, W-40, 6, CARD, { rx:3 }));
  els.push(rect(20, 608, (W-40)*0.72, 6, TEAL, { rx:3 }));
  els.push(text(20, 624, 'Weekly pace — 34h of 40h target', 12, TEXT2, { fw:500 }));
  els.push(text(W-20, 624, '85%', 12, TEAL, { anchor:'end', fw:700 }));

  // Deadline reminder card
  els.push(rect(20, 630, W-40, 54, AMB_L, { rx:14 }));
  els.push(rect(20, 620, 4, 54, AMBER, { rx:2 }));
  els.push(text(34, 641, 'Upcoming deadline', 11, AMBER, { fw:700, ls:0.3 }));
  els.push(text(34, 658, 'Nola Wines — Packaging  ·  due Apr 18 (7 days)', 12, TEXT, { fw:500 }));
  els.push(text(W-28, 641, '→', 16, AMBER, { anchor:'end', fw:700 }));

  // Quick-log strip
  els.push(rect(20, 686, W-40, 42, SURF, { rx:14, stroke:BORDER, sw:1 }));
  els.push(text(36, 712, '+ Quick log entry…', 14, TEXT3));
  els.push(rect(W-58, 693, 30, 28, TEAL, { rx:14 }));
  els.push(text(W-43, 712, '✓', 13, '#FFFFFF', { anchor:'middle', fw:700 }));

  // Earnings summary strip
  els.push(rect(20, 740, W-40, 40, CARD, { rx:12 }));
  els.push(text(36, 757, 'This month: $12,840', 13, TEXT2, { fw:500 }));
  els.push(text(W-36, 757, '$75 avg/hr', 13, TEAL, { anchor:'end', fw:600 }));
  // Invoices due
  els.push(rect(20, 786, W-40, 36, RED_L, { rx:12 }));
  els.push(text(36, 808, '⚠  $2,100 overdue — Nola Wines INV-016', 13, RED, { fw:500 }));
  els.push(text(W-36, 808, 'Remind', 13, RED, { anchor:'end', fw:600 }));

  els.push(...tabBar('today'));

  return { name:'Today', elements: els };
}

// ─── SCREEN 2: PROJECTS ───────────────────────────────────────────────────────
function screenProjects() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  els.push(...statusBar());

  // Header
  els.push(text(20, 68, 'Projects', 26, TEXT, { fw:700, ls:-0.4 }));
  els.push(text(20, 90, '4 active · $12,840 this month', 14, TEXT2));
  // New project button
  els.push(rect(W-72, 54, 52, 30, TEAL, { rx:15 }));
  els.push(text(W-46, 74, '+ New', 12, '#FFFFFF', { anchor:'middle', fw:600 }));

  // Search bar
  els.push(rect(20, 106, W-40, 40, SURF, { rx:12, stroke:BORDER, sw:1 }));
  els.push(text(38, 131, '⌕  Search projects…', 14, TEXT3));

  // Filter chips
  const filters = ['All', 'Active', 'At Risk', 'Completed'];
  let fx = 20;
  filters.forEach((f, i) => {
    const w = f.length * 8 + 24;
    els.push(rect(fx, 156, w, 28, i===0?TEAL_L:BG, { rx:14, stroke:i===0?TEAL:BORDER, sw:1 }));
    els.push(text(fx+w/2, 175, f, 13, i===0?TEAL:TEXT2, { anchor:'middle', fw:i===0?600:400 }));
    fx += w + 8;
  });

  // Project cards
  const projects = [
    { name:'Acme Corp', sub:'Brand Identity', color:PROJ_COLORS[0], budget:8000, spent:5200, hrs:42, est:60, status:'on-track', client:'acme' },
    { name:'Forge Studio', sub:'Web Redesign', color:PROJ_COLORS[1], budget:12000, spent:9800, hrs:78, est:80, status:'at-risk', client:'forge' },
    { name:'Nola Wines', sub:'Packaging Design', color:PROJ_COLORS[2], budget:4500, spent:2100, hrs:28, est:50, status:'on-track', client:'nola' },
    { name:'Meridian Health', sub:'App Design', color:PROJ_COLORS[3], budget:18000, spent:17900, hrs:140, est:144, status:'overdue', client:'merh' },
  ];

  projects.forEach((p, i) => {
    const y = 196 + i * 138;
    const cardH = 128;
    // Card
    els.push(rect(20, y, W-40, cardH, SURF, { rx:16 }));
    // Color left border
    els.push(rect(20, y, 4, cardH, p.color, { rx:2 }));
    // Project name + status
    els.push(text(36, y+22, p.name, 15, TEXT, { fw:700 }));
    els.push(text(36, y+40, p.sub, 13, TEXT2 ));
    const sbg = p.status==='on-track' ? TEAL_L : p.status==='at-risk' ? AMB_L : RED_L;
    const sfg = p.status==='on-track' ? TEAL : p.status==='at-risk' ? AMBER : RED;
    const slabel = p.status==='on-track'?'On track':p.status==='at-risk'?'At risk':'Overdue';
    els.push(...badge(W-24-slabel.length*7-16, y+14, slabel, sbg, sfg));
    // Budget progress
    els.push(text(36, y+64, 'Budget', 11, TEXT3, { fw:600, ls:0.3 }));
    els.push(...progressBar(36, y+72, W-72, 5, (p.spent/p.budget)*100, p.color, CARD));
    els.push(text(36, y+88, `$${p.spent.toLocaleString()} of $${p.budget.toLocaleString()}`, 12, TEXT2));
    // Hours
    els.push(text(36, y+108, `${p.hrs}h of ${p.est}h estimated`, 12, TEXT3));
    els.push(text(W-36, y+108, `$${Math.round(p.spent/p.hrs)}/hr`, 12, TEAL, { anchor:'end', fw:600 }));
  });

  // Project milestone strip
  els.push(...sectionHead(752, 'UPCOMING MILESTONES', ''));
  const milestones = [
    { proj:'Acme Corp', task:'Final delivery', due:'Apr 25', color:PROJ_COLORS[0] },
    { proj:'Meridian Health', task:'Review call', due:'Apr 13', color:PROJ_COLORS[3] },
  ];
  milestones.forEach((m, i) => {
    const y = 770 + i * 0; // will overflow, but adds elements
    els.push(circle(26, y, 5, m.color));
    els.push(text(36, y+4, m.proj + ' — ' + m.task, 12, TEXT, { fw:600 }));
    els.push(text(W-20, y+4, m.due, 12, TEXT2, { anchor:'end' }));
  });

  els.push(...tabBar('projects'));
  return { name:'Projects', elements: els };
}

// ─── SCREEN 3: TIMER ─────────────────────────────────────────────────────────
function screenTimer() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  els.push(...statusBar());

  // Header
  els.push(text(W/2, 68, 'Timer', 18, TEXT, { fw:700, anchor:'middle' }));

  // Project selector
  els.push(rect(20, 84, W-40, 48, SURF, { rx:14, stroke:BORDER, sw:1 }));
  els.push(rect(26, 97, 14, 14, PROJ_COLORS[0], { rx:7 }));
  els.push(text(48, 113, 'Acme Corp — Brand Identity', 14, TEXT, { fw:500 }));
  els.push(text(W-28, 113, '▾', 14, TEXT2, { anchor:'end' }));

  // Tags row
  const tags = ['design', 'meeting', 'research', 'revisions'];
  let tx = 20;
  tags.forEach((t,i) => {
    const tw = t.length*8+20;
    els.push(rect(tx, 144, tw, 28, i===0?TEAL_L:BG, { rx:14, stroke:i===0?TEAL:BORDER, sw:1 }));
    els.push(text(tx+tw/2, 163, '#'+t, 12, i===0?TEAL:TEXT2, { anchor:'middle', fw:i===0?600:400 }));
    tx += tw + 8;
  });

  // Large timer display
  els.push(text(W/2, 320, '01:24:07', 72, TEXT, { fw:700, anchor:'middle', ls:-2 }));
  els.push(text(W/2, 350, 'Acme Corp — Brand Identity', 15, TEXT2, { anchor:'middle' }));

  // Divider ring (decorative — inspired by Reflect)
  circle(W/2, 310, 120, 'none'); // just for reference
  els.push(circle(W/2, 310, 1, TEAL_L, { opacity:0 })); // invisible marker

  // Today total strip
  els.push(rect(40, 375, W-80, 44, CARD, { rx:14 }));
  els.push(text(W/2, 401, 'Today: 4h 32m  |  This week: 18h 14m', 13, TEXT2, { anchor:'middle' }));

  // Controls — stop, lap, pause
  const ctrlY = 444;
  // Pause (primary)
  els.push(rect(W/2 - 36, ctrlY, 72, 72, TEAL, { rx:36 }));
  els.push(text(W/2, ctrlY+42, '⏸', 28, '#FFFFFF', { anchor:'middle' }));
  // Stop (secondary left)
  els.push(rect(W/2 - 108, ctrlY+12, 56, 48, CARD, { rx:24, stroke:BORDER, sw:1 }));
  els.push(text(W/2-80, ctrlY+42, '■', 18, TEXT2, { anchor:'middle' }));
  // Lap (secondary right)
  els.push(rect(W/2 + 52, ctrlY+12, 56, 48, CARD, { rx:24, stroke:BORDER, sw:1 }));
  els.push(text(W/2+80, ctrlY+42, '⊞', 18, TEXT2, { anchor:'middle' }));
  els.push(text(W/2-80, ctrlY+66, 'Stop', 11, TEXT3, { anchor:'middle' }));
  els.push(text(W/2+80, ctrlY+66, 'Lap', 11, TEXT3, { anchor:'middle' }));

  // Recent sessions today
  els.push(...sectionHead(545, 'SESSIONS TODAY', ''));
  const sessions = [
    { proj:'Acme Corp', tag:'#design', dur:'1h 24m', start:'08:12', color:PROJ_COLORS[0] },
    { proj:'Forge Studio', tag:'#research', dur:'2h 08m', start:'06:00', color:PROJ_COLORS[1] },
    { proj:'Nola Wines', tag:'#revisions', dur:'1h 00m', start:'05:00', color:PROJ_COLORS[2] },
  ];
  sessions.forEach((s, i) => {
    const y = 562 + i * 58;
    els.push(rect(20, y, W-40, 50, SURF, { rx:12 }));
    els.push(rect(20, y, 3, 50, s.color, { rx:2 }));
    els.push(text(34, y+18, s.proj, 13, TEXT, { fw:600 }));
    els.push(text(34, y+34, s.tag + '  ·  started ' + s.start, 12, TEXT2 ));
    els.push(text(W-28, y+18, s.dur, 14, TEXT, { fw:700, anchor:'end' }));
  });

  // Notes input field below sessions
  els.push(rect(20, 734, W-40, 40, SURF, { rx:12, stroke:BORDER, sw:1 }));
  els.push(text(34, 758, '📝  Add a note for this session…', 13, TEXT3));

  // Billing rate strip
  els.push(rect(20, 784, W-40, 36, CARD, { rx:10 }));
  els.push(text(34, 800, 'Rate: $75/hr  ·  This session: $105.30', 13, TEXT2));
  els.push(text(W-34, 800, 'Billable ✓', 13, TEAL, { anchor:'end', fw:600 }));

  // Round-up prompt
  els.push(rect(20, 824, W-40, 1, BORDER));
  els.push(text(20, 836, '⊕  Round up to nearest 15 min?', 12, TEXT2, { fw:500 }));
  els.push(text(W-20, 836, 'Yes, round up', 12, TEAL, { anchor:'end', fw:600 }));

  els.push(...tabBar('timer'));
  return { name:'Timer', elements: els };
}

// ─── SCREEN 4: LOG ───────────────────────────────────────────────────────────
function screenLog() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  els.push(...statusBar());

  // Header
  els.push(text(20, 68, 'Time Log', 26, TEXT, { fw:700, ls:-0.4 }));
  els.push(text(20, 90, 'Week of Apr 7 – Apr 13', 14, TEXT2 ));
  // Week navigator
  els.push(rect(W-80, 54, 30, 30, CARD, { rx:15 }));
  els.push(text(W-65, 74, '‹', 16, TEXT, { anchor:'middle', fw:700 }));
  els.push(rect(W-44, 54, 30, 30, CARD, { rx:15 }));
  els.push(text(W-29, 74, '›', 16, TEXT, { anchor:'middle', fw:700 }));

  // Week bar summary
  const days2 = ['M','T','W','T','F','S','S'];
  const dayHrs = [6.5, 7.2, 5.8, 8.0, 4.5, 2.0, 0];
  const barSX = 20, bW2 = (W-40)/7 - 4, maxH2 = 56;
  const barBase = 166;
  days2.forEach((d, i) => {
    const bh = dayHrs[i] / 8 * maxH2;
    const isToday = i === 4; // Friday = today
    els.push(rect(barSX + i*(bW2+4), barBase-bh, bW2, bh, isToday?TEAL:TEAL_L, { rx:4 }));
    els.push(text(barSX + i*(bW2+4)+bW2/2, barBase+14, d, 11, isToday?TEAL:TEXT3, { anchor:'middle', fw:isToday?700:400 }));
  });
  els.push(line(20, barBase, W-20, barBase, BORDER, { sw:1 }));
  els.push(text(20, 184, 'Total this week: 34h 0m', 13, TEXT2, { fw:500 }));
  els.push(text(W-20, 184, '$2,142', 13, TEAL, { anchor:'end', fw:700 }));

  // Date group: Today
  els.push(rect(20, 200, W-40, 1, BORDER));
  els.push(text(20, 218, 'Today — Fri Apr 11', 12, TEXT2, { fw:600, ls:0.3 }));
  const logEntries = [
    { proj:'Acme Corp', tag:'#design', start:'08:12', end:'09:36', dur:'1h 24m', amount:'$105', color:PROJ_COLORS[0] },
    { proj:'Forge Studio', tag:'#research', start:'06:00', end:'08:08', dur:'2h 08m', amount:'$160', color:PROJ_COLORS[1] },
    { proj:'Nola Wines', tag:'#revisions', start:'05:00', end:'06:00', dur:'1h 00m', amount:'$75', color:PROJ_COLORS[2] },
  ];
  logEntries.forEach((e, i) => {
    const y = 228 + i * 66;
    els.push(rect(20, y, W-40, 58, SURF, { rx:14 }));
    els.push(rect(20, y, 3, 58, e.color, { rx:2 }));
    els.push(text(34, y+18, e.proj, 13, TEXT, { fw:600 }));
    els.push(text(34, y+36, `${e.tag}  ·  ${e.start}–${e.end}`, 12, TEXT2));
    els.push(text(W-28, y+18, e.dur, 13, TEXT, { fw:700, anchor:'end' }));
    els.push(text(W-28, y+36, e.amount, 13, TEAL, { anchor:'end', fw:600 }));
  });

  // Date group: Yesterday
  els.push(rect(20, 432, W-40, 1, BORDER));
  els.push(text(20, 450, 'Yesterday — Thu Apr 10', 12, TEXT2, { fw:600, ls:0.3 }));
  const yest = [
    { proj:'Meridian Health', tag:'#meeting', start:'14:00', end:'22:00', dur:'8h 00m', amount:'$600', color:PROJ_COLORS[3] },
    { proj:'Acme Corp', tag:'#design', start:'09:00', end:'11:00', dur:'2h 00m', amount:'$150', color:PROJ_COLORS[0] },
  ];
  yest.forEach((e, i) => {
    const y = 460 + i * 66;
    els.push(rect(20, y, W-40, 58, SURF, { rx:14 }));
    els.push(rect(20, y, 3, 58, e.color, { rx:2 }));
    els.push(text(34, y+18, e.proj, 13, TEXT, { fw:600 }));
    els.push(text(34, y+36, `${e.tag}  ·  ${e.start}–${e.end}`, 12, TEXT2));
    els.push(text(W-28, y+18, e.dur, 13, TEXT, { fw:700, anchor:'end' }));
    els.push(text(W-28, y+36, e.amount, 13, TEAL, { anchor:'end', fw:600 }));
  });

  // Wednesday date group
  els.push(rect(20, 595, W-40, 1, BORDER));
  els.push(text(20, 613, 'Wednesday — Apr 9', 12, TEXT2, { fw:600, ls:0.3 }));
  const wed = [
    { proj:'Forge Studio', tag:'#meeting', start:'10:00', end:'11:30', dur:'1h 30m', amount:'$112', color:PROJ_COLORS[1] },
    { proj:'Meridian Health', tag:'#design', start:'13:00', end:'19:00', dur:'6h 00m', amount:'$450', color:PROJ_COLORS[3] },
  ];
  wed.forEach((e, i) => {
    const y = 622 + i * 66;
    els.push(rect(20, y, W-40, 58, SURF, { rx:14 }));
    els.push(rect(20, y, 3, 58, e.color, { rx:2 }));
    els.push(text(34, y+18, e.proj, 13, TEXT, { fw:600 }));
    els.push(text(34, y+36, `${e.tag}  ·  ${e.start}–${e.end}`, 12, TEXT2));
    els.push(text(W-28, y+18, e.dur, 13, TEXT, { fw:700, anchor:'end' }));
    els.push(text(W-28, y+36, e.amount, 13, TEAL, { anchor:'end', fw:600 }));
  });

  // Week total chip
  els.push(rect(20, 755, W-40, 38, TEAL_L, { rx:12 }));
  els.push(text(W/2, 779, 'Week total: 34h 0m  ·  $2,142', 13, TEAL, { anchor:'middle', fw:600 }));

  els.push(...tabBar('log'));
  return { name:'Log', elements: els };
}

// ─── SCREEN 5: INVOICE ───────────────────────────────────────────────────────
function screenInvoice() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  els.push(...statusBar());

  // Header
  els.push(text(20, 68, 'Invoice', 26, TEXT, { fw:700, ls:-0.4 }));
  els.push(text(20, 90, 'INV-2024-018  ·  Acme Corp', 14, TEXT2 ));
  els.push(rect(W-80, 54, 56, 30, TEAL, { rx:15 }));
  els.push(text(W-52, 74, 'Send', 13, '#FFFFFF', { anchor:'middle', fw:600 }));

  // Status badge
  els.push(...badge(20, 104, 'Draft', CARD, TEXT2));
  els.push(text(80, 119, '·', 14, TEXT3));
  els.push(text(90, 119, 'Due Apr 30, 2024', 13, TEXT2));

  // Invoice card
  const cardY = 136;
  els.push(rect(20, cardY, W-40, 220, SURF, { rx:20 }));

  // Invoice header inside card
  els.push(text(36, cardY+28, 'MARK', 18, TEAL, { fw:800, ls:1 }));
  els.push(text(W-36, cardY+20, 'INVOICE', 11, TEXT3, { anchor:'end', fw:600, ls:1 }));
  els.push(text(W-36, cardY+34, '#INV-2024-018', 13, TEXT, { anchor:'end', fw:600 }));

  els.push(line(36, cardY+50, W-36, cardY+50, BORDER, { sw:1 }));

  // Bill to
  els.push(text(36, cardY+68, 'BILL TO', 11, TEXT3, { fw:600, ls:0.5 }));
  els.push(text(36, cardY+84, 'Acme Corp', 14, TEXT, { fw:600 }));
  els.push(text(36, cardY+100, 'billing@acmecorp.io', 13, TEXT2));

  // Amount
  els.push(text(W-36, cardY+68, 'AMOUNT DUE', 11, TEXT3, { fw:600, ls:0.5, anchor:'end' }));
  els.push(text(W-36, cardY+90, '$5,200.00', 22, TEXT, { fw:800, anchor:'end', ls:-0.5 }));

  els.push(line(36, cardY+118, W-36, cardY+118, BORDER, { sw:1 }));

  // Line items
  const items = [
    { desc:'Brand Strategy & Research', hrs:'12h', rate:'$75', amt:'$900' },
    { desc:'Logo Design (3 concepts)', hrs:'24h', rate:'$75', amt:'$1,800' },
    { desc:'Brand Guidelines Deck', hrs:'18h', rate:'$75', amt:'$1,350' },
    { desc:'Stakeholder Revisions', hrs:'15.3h', rate:'$75', amt:'$1,150' },
  ];
  items.forEach((item, i) => {
    const iy = cardY + 136 + i * 20;
    els.push(text(36, iy, item.desc, 12, TEXT, { fw:500 }));
    els.push(text(W-36, iy, item.amt, 12, TEXT, { fw:600, anchor:'end' }));
  });

  els.push(line(36, cardY+218, W-36, cardY+218, BORDER, { sw:1 }));
  // Total line — outside card, overlapping
  els.push(text(36, cardY+236, 'TOTAL', 11, TEXT3, { fw:700, ls:0.5 }));
  els.push(text(W-36, cardY+236, '$5,200.00', 16, TEAL, { fw:800, anchor:'end' }));

  // Terms strip
  els.push(rect(20, 362, W-40, 1, BORDER));
  els.push(text(36, 376, 'NET 30 payment terms  ·  Late fee: 1.5% per month', 12, TEXT3, { fw:400 }));

  // Payment method strip
  els.push(rect(20, 386, W-40, 52, CARD, { rx:14 }));
  els.push(text(36, 414, 'Payment via Stripe  ·  Bank Transfer accepted', 13, TEXT2));

  // Invoice list — other recent
  els.push(...sectionHead(448, 'RECENT INVOICES', 'all'));
  const invoices = [
    { client:'Forge Studio', num:'INV-017', amt:'$9,800', status:'Paid', statusBg:TEAL_L, statusFg:TEAL },
    { client:'Nola Wines', num:'INV-016', amt:'$2,100', status:'Overdue', statusBg:RED_L, statusFg:RED },
    { client:'Meridian Health', num:'INV-015', amt:'$17,900', status:'Paid', statusBg:TEAL_L, statusFg:TEAL },
  ];
  invoices.forEach((inv, i) => {
    const y = 464 + i * 58;
    els.push(rect(20, y, W-40, 50, SURF, { rx:12 }));
    els.push(text(34, y+18, inv.client, 14, TEXT, { fw:600 }));
    els.push(text(34, y+34, inv.num, 12, TEXT2));
    els.push(text(W-24-inv.status.length*7-16, y+19, inv.amt, 14, TEXT, { fw:700, anchor:'end' }));
    els.push(...badge(W-24-inv.status.length*7-16, y+30, inv.status, inv.statusBg, inv.statusFg));
  });

  els.push(...tabBar('timer')); // Timer is closest to Invoice in nav
  return { name:'Invoice', elements: els };
}

// ─── SCREEN 6: REPORTS ───────────────────────────────────────────────────────
function screenReports() {
  const els = [];
  els.push(rect(0,0,W,H,BG));
  els.push(...statusBar());

  // Header
  els.push(text(20, 68, 'Reports', 26, TEXT, { fw:700, ls:-0.4 }));
  els.push(text(20, 90, 'April 2024 — 18 working days', 14, TEXT2));

  // Period selector
  const periods = ['Week','Month','Quarter','Year'];
  let px = 20;
  periods.forEach((p, i) => {
    const pw = p.length*9+24;
    els.push(rect(px, 104, pw, 28, i===1?TEAL:BG, { rx:14, stroke:i===1?TEAL:BORDER, sw:1 }));
    els.push(text(px+pw/2, 123, p, 13, i===1?'#FFFFFF':TEXT2, { anchor:'middle', fw:i===1?600:400 }));
    px += pw + 8;
  });

  // Top stats row
  const stats = [
    { label:'Hours logged', val:'128h 40m', sub:'+12% vs Mar' },
    { label:'Revenue', val:'$12,840', sub:'+8% vs Mar' },
  ];
  stats.forEach((s, i) => {
    const sx = 20 + i * (W-40)/2;
    const sw2 = (W-44)/2;
    els.push(rect(sx, 142, sw2, 74, SURF, { rx:16 }));
    els.push(rect(sx, 142, sw2, 74, 'none', { rx:16, stroke:BORDER, sw:1 }));
    els.push(text(sx+14, 164, s.label, 12, TEXT2, { fw:400 }));
    els.push(text(sx+14, 186, s.val, 18, TEXT, { fw:700, ls:-0.3 }));
    els.push(text(sx+14, 204, s.sub, 12, TEAL, { fw:500 }));
  });

  // Monthly bar chart (hours by week)
  els.push(...sectionHead(232, 'HOURS BY WEEK', ''));
  const weekData = [28.5, 34.0, 38.2, 28.0];
  const weekLabels = ['Apr 1–7', 'Apr 8–14', 'Apr 15–21', 'Apr 22–28'];
  const chartX2 = 20, cW2 = (W-40)/4 - 8, maxH3 = 70, cBase = 316;
  weekData.forEach((val, i) => {
    const bh = val / 40 * maxH3;
    const isThis = i === 1;
    els.push(rect(chartX2 + i*(cW2+8), cBase-bh, cW2, bh, isThis?TEAL:TEAL_L, { rx:6 }));
    els.push(text(chartX2 + i*(cW2+8)+cW2/2, cBase+14, weekLabels[i], 10, isThis?TEAL:TEXT3, { anchor:'middle', fw:isThis?600:400 }));
    els.push(text(chartX2 + i*(cW2+8)+cW2/2, cBase-bh-8, `${val}h`, 11, isThis?TEXT:TEXT2, { anchor:'middle', fw:isThis?700:400 }));
  });
  els.push(line(20, cBase, W-20, cBase, BORDER, { sw:1 }));

  // Revenue by project
  els.push(...sectionHead(340, 'BY PROJECT', ''));
  const byProj = [
    { name:'Acme Corp', pct:41, amt:'$5,200', color:PROJ_COLORS[0] },
    { name:'Forge Studio', pct:31, amt:'$3,920', color:PROJ_COLORS[1] },
    { name:'Meridian Health', pct:17, amt:'$2,200', color:PROJ_COLORS[3] },
    { name:'Nola Wines', pct:11, amt:'$1,520', color:PROJ_COLORS[2] },
  ];
  byProj.forEach((p, i) => {
    const y = 358 + i * 56;
    els.push(text(20, y+14, p.name, 14, TEXT, { fw:600 }));
    els.push(...progressBar(20, y+22, W-120, 7, p.pct, p.color, CARD));
    els.push(text(20, y+40, `${p.pct}%`, 12, TEXT2));
    els.push(text(W-20, y+14, p.amt, 14, TEXT, { fw:700, anchor:'end' }));
  });

  // Avg hourly rate strip
  els.push(rect(20, 590, W-40, 48, CARD, { rx:14 }));
  els.push(text(36, 618, 'Avg hourly rate: $75  ·  Utilization: 82%', 13, TEXT2));
  els.push(text(W-36, 618, '↑ strong', 13, TEAL, { anchor:'end', fw:600 }));

  // Streak / consistency strip
  els.push(rect(20, 648, W-40, 48, CARD, { rx:14 }));
  els.push(text(36, 667, '🔥  12-day billing streak', 13, TEXT, { fw:600 }));
  els.push(text(36, 683, 'You\'ve logged time every working day this month', 12, TEXT2));
  els.push(text(W-36, 675, '+streak', 12, AMBER, { anchor:'end', fw:600 }));

  // Client breakdown chips
  els.push(...sectionHead(710, 'CLIENT MIX', ''));
  const clients = ['Acme Corp  41%', 'Forge  31%', 'Meridian  17%', 'Nola  11%'];
  let clx = 20;
  clients.forEach((c, i) => {
    const cw = c.length * 7.5 + 16;
    els.push(rect(clx, 724, cw, 26, PROJ_COLORS[i], { rx:13, opacity:0.15 }));
    els.push(text(clx + cw/2, 741, c, 11, TEXT, { anchor:'middle', fw:600 }));
    clx += cw + 8;
  });

  // Export button
  els.push(rect(20, 762, W-40, 44, BG, { rx:14, stroke:TEAL, sw:1.5 }));
  els.push(text(W/2, 789, 'Export PDF Report', 14, TEAL, { anchor:'middle', fw:600 }));

  els.push(...tabBar('reports'));
  return { name:'Reports', elements: els };
}

// ─── ASSEMBLE ─────────────────────────────────────────────────────────────────
const screens = [
  screenToday(),
  screenProjects(),
  screenTimer(),
  screenLog(),
  screenInvoice(),
  screenReports(),
];

const totalElements = screens.reduce((sum, s) => sum + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'MARK — Freelance Time & Billing',
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'light',
    heartbeat: 50,
    elements: totalElements,
    palette: { BG, SURF, CARD, TEXT, TEXT2, TEAL, AMBER, RED },
    inspiration: [
      'Land-book — deep teal #017C6E on warm off-white palette',
      'Mobbin — floating glassmorphic pill tab navigation pattern',
      'Siteinspire — editorial restraint: no shadows, depth via bg shifts',
      'Lapa / Trade Suit — warm cream background for professional fintech feel',
    ],
  },
  screens: screens.map(s => ({
    name: s.name,
    svg: `${W}x${H}`,
    elements: s.elements,
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`MARK: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
