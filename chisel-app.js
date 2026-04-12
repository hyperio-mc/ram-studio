'use strict';
// CHISEL — AI Pull-Request Analytics Dashboard
// Heartbeat design — DARK theme
// Inspired by:
//   - Godly.website: "Technical Mono / Code Brutalism" (Vercel, Factory AI, PlayerZero)
//   - DarkModeDesign.com: Raycast's electric single-accent system, 4-level layered dark surfaces
//   - Saaspo.com: Bento grid feature layouts for developer tools
// Palette: 4-level depth navy-black + electric amber accent + blue secondary

const fs = require('fs');
const path = require('path');
const SLUG = 'chisel';

// ── Canvas ──────────────────────────────────────────────────────────────────
const W = 390, H = 844;

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg:      '#080A0D',   // Level 0: page bg
  surf:    '#0F1218',   // Level 1: card bg
  raised:  '#161B24',   // Level 2: elevated card
  modal:   '#1E2530',   // Level 3: modal / hover state
  border:  'rgba(255,255,255,0.07)',
  amber:   '#F59E0B',   // Primary accent
  amberD:  '#D97706',   // Amber dim
  amberG:  'rgba(245,158,11,0.15)', // Amber glow bg
  blue:    '#3B82F6',   // Secondary accent
  blueD:   '#2563EB',
  green:   '#10B981',   // Success/merged
  red:     '#EF4444',   // Error/conflicts
  purple:  '#8B5CF6',   // Review requested
  text:    '#E2E8F0',   // Primary text
  textM:   '#94A3B8',   // Muted text
  textD:   '#64748B',   // Dimmer text
  mono:    'JetBrains Mono',
  sans:    'Inter',
};

// ── Primitives ───────────────────────────────────────────────────────────────
let els = [];
function rect(x,y,w,h,fill,opts={}) {
  const el = { type:'rect',x,y,width:w,height:h,fill };
  if(opts.rx)      el.rx = opts.rx;
  if(opts.opacity !== undefined) el.opacity = opts.opacity;
  if(opts.stroke)  el.stroke = opts.stroke;
  if(opts.sw)      el.strokeWidth = opts.sw;
  els.push(el); return el;
}
function text(x,y,content,size,fill,opts={}) {
  const el = { type:'text',x,y,content:String(content),fontSize:size,fill };
  if(opts.fw)     el.fontWeight = opts.fw;
  if(opts.font)   el.fontFamily = opts.font;
  if(opts.anchor) el.textAnchor = opts.anchor;
  if(opts.ls)     el.letterSpacing = opts.ls;
  if(opts.opacity !== undefined) el.opacity = opts.opacity;
  if(opts.td)     el.textDecoration = opts.td;
  els.push(el); return el;
}
function circle(cx,cy,r,fill,opts={}) {
  const el = { type:'circle',cx,cy,r,fill };
  if(opts.opacity !== undefined) el.opacity = opts.opacity;
  if(opts.stroke) el.stroke = opts.stroke;
  if(opts.sw)     el.strokeWidth = opts.sw;
  els.push(el); return el;
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  const el = { type:'line',x1,y1,x2,y2,stroke };
  if(opts.sw !== undefined) el.strokeWidth = opts.sw;
  if(opts.opacity !== undefined) el.opacity = opts.opacity;
  els.push(el); return el;
}
function poly(points,fill,opts={}) {
  const el = { type:'polygon', points };
  el.fill = fill;
  if(opts.opacity !== undefined) el.opacity = opts.opacity;
  els.push(el); return el;
}

// ── Reusable Components ───────────────────────────────────────────────────────

// Status pill
function statusPill(x, y, label, color, w=70) {
  rect(x, y-11, w, 20, color, { rx:10, opacity:0.18 });
  text(x+w/2, y+1, label, 9, color, { anchor:'middle', font:C.mono, ls:0.5, fw:'600' });
}

// Metric card (bento unit)
function metricCard(x, y, w, h, label, value, sub, accentColor) {
  rect(x, y, w, h, C.surf, { rx:10 });
  rect(x, y, w, h, C.border, { rx:10, fill:'none', stroke:C.border, sw:1 });
  text(x+14, y+20, label, 10, C.textM, { font:C.sans, ls:0.3, fw:'500' });
  text(x+14, y+46, value, 26, accentColor||C.text, { font:C.mono, fw:'700' });
  if(sub) text(x+14, y+64, sub, 10, C.textD, { font:C.sans });
}

// Mini sparkline (zigzag path simulation using rectangles as bars)
function sparkline(x, y, w, h, data, color) {
  const barW = Math.floor(w / data.length) - 2;
  const maxV = Math.max(...data);
  data.forEach((v, i) => {
    const bh = Math.max(2, (v / maxV) * h);
    const bx = x + i * (barW + 2);
    const by = y + h - bh;
    rect(bx, by, barW, bh, color, { rx:1, opacity: i === data.length-1 ? 1 : 0.45 });
  });
}

// PR row
function prRow(x, y, w, num, title, author, status, size, age, checks) {
  rect(x, y, w, 58, C.surf, { rx:8 });
  rect(x, y, w, 58, C.border, { rx:8, fill:'none', stroke:C.border, sw:1 });
  // PR number
  text(x+12, y+18, num, 10, C.amber, { font:C.mono, fw:'600' });
  // Title
  text(x+12, y+34, title, 12, C.text, { font:C.sans, fw:'500' });
  // Author + age
  text(x+12, y+50, author, 10, C.textM, { font:C.mono });
  text(x+12+author.length*6.5, y+50, `· ${age}`, 10, C.textD, { font:C.sans });
  // Status pill
  const sc = status==='Open'?C.blue: status==='Review'?C.purple: status==='Merged'?C.green: C.red;
  statusPill(x+w-90, y+14, status, sc, 62);
  // Size badge
  const sc2 = size==='S'?C.green: size==='M'?C.amber: C.red;
  rect(x+w-24, y+38, 16, 14, sc2, { rx:3, opacity:0.2 });
  text(x+w-16, y+48, size, 9, sc2, { font:C.mono, anchor:'middle', fw:'700' });
  // Checks
  if(checks) text(x+w-110, y+50, checks, 9, C.green, { font:C.mono });
}

// Code line (diff view)
function diffLine(x, y, w, type, content, lineNum) {
  const bg = type==='+'?'rgba(16,185,129,0.08)': type==='-'?'rgba(239,68,68,0.08)': 'transparent';
  const tc = type==='+'?C.green: type==='-'?C.red: C.textM;
  const prefix = type==='+'?'+': type==='-'?'-': ' ';
  if(bg!=='transparent') rect(x, y, w, 16, bg);
  text(x+6, y+12, String(lineNum), 9, C.textD, { font:C.mono });
  text(x+30, y+12, prefix, 9, tc, { font:C.mono, fw:'700' });
  text(x+40, y+12, content, 9, type==='neutral'?C.textM:tc, { font:C.mono, opacity:type==='neutral'?0.65:1 });
}

// Progress bar
function progressBar(x, y, w, pct, color, label, value) {
  text(x, y, label, 10, C.textM, { font:C.sans, fw:'500' });
  text(x+w, y, value, 10, color, { font:C.mono, anchor:'end', fw:'600' });
  rect(x, y+6, w, 5, C.modal, { rx:2 });
  rect(x, y+6, Math.round(w*(pct/100)), 5, color, { rx:2 });
}

// Avatar circle
function avatar(cx, cy, r, initials, color) {
  circle(cx, cy, r, color, { opacity:0.2 });
  circle(cx, cy, r, 'none', { stroke:color, sw:1.5, opacity:0.5 });
  text(cx, cy+4, initials, r*0.7, color, { anchor:'middle', font:C.mono, fw:'700' });
}

// ── Status Bar ────────────────────────────────────────────────────────────────
function statusBar() {
  rect(0, 0, W, 44, C.bg);
  text(16, 30, '9:41', 14, C.text, { font:C.mono, fw:'600' });
  text(W-16, 30, '●●● ▲ 100%', 10, C.textM, { font:C.sans, anchor:'end' });
}

// ── Bottom Nav ────────────────────────────────────────────────────────────────
function bottomNav(activeIdx) {
  rect(0, H-80, W, 80, C.surf);
  line(0, H-80, W, H-80, C.border, { sw:1 });
  const items = [
    { icon:'◈', label:'Board' },
    { icon:'⌥', label:'Queue' },
    { icon:'⊕', label:'' },
    { icon:'∿', label:'Velocity' },
    { icon:'⊙', label:'Insights' },
  ];
  const spacing = W / items.length;
  items.forEach((item, i) => {
    const cx = spacing * i + spacing / 2;
    const isActive = i === activeIdx;
    const color = isActive ? C.amber : C.textD;
    if(i === 2) {
      // Plus button
      rect(cx-20, H-68, 40, 40, C.amber, { rx:12 });
      text(cx, H-42, '+', 22, C.bg, { anchor:'middle', fw:'700', font:C.sans });
    } else {
      text(cx, H-52, item.icon, 18, color, { anchor:'middle', font:C.sans });
      if(item.label) text(cx, H-36, item.label, 9, color, { anchor:'middle', font:C.sans, ls:0.3 });
      if(isActive) circle(cx, H-76, 2, C.amber);
    }
  });
}

// ── Top Header ────────────────────────────────────────────────────────────────
function topHeader(title, subtitle, showBack=false) {
  rect(0, 44, W, 56, C.bg);
  line(0, 100, W, 100, C.border, { sw:1 });
  if(showBack) {
    text(18, 78, '←', 16, C.amber, { font:C.sans, fw:'500' });
    text(34, 80, title, 15, C.text, { font:C.sans, fw:'600' });
  } else {
    text(18, 72, title, 18, C.text, { font:C.sans, fw:'700' });
    if(subtitle) text(18, 90, subtitle, 11, C.textM, { font:C.mono });
  }
  // Notification bell
  rect(W-46, 56, 32, 28, C.raised, { rx:8 });
  text(W-30, 75, '◻', 14, C.textM, { anchor:'middle', font:C.sans });
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 1: Dashboard — PR Overview + Bento Stats
// ─────────────────────────────────────────────────────────────────────────────
function screen1() {
  els = [];
  rect(0, 0, W, H, C.bg);
  statusBar();
  topHeader('chisel/', 'main  ·  47 open PRs');

  const sy = 108;

  // Repo selector pill
  rect(18, sy, 140, 28, C.raised, { rx:14 });
  text(28, sy+18, '◈ hyperio-mc/core', 10, C.amber, { font:C.mono, fw:'600' });
  rect(W-60, sy, 42, 28, C.raised, { rx:14 });
  text(W-39, sy+18, '⟳ sync', 10, C.textM, { font:C.mono, anchor:'middle' });

  // ── Bento grid row 1: 2 large + 1 tall ──
  const row1y = sy + 42;

  // Card A: Open PRs (large)
  metricCard(18, row1y, 168, 100, 'OPEN PRs', '47', '+3 since yesterday', C.amber);
  // Sparkline inside card A
  sparkline(18+14, row1y+72, 80, 16, [12,18,22,15,28,35,47], C.amber);
  text(18+100, row1y+83, '▲ +6.8%', 9, C.green, { font:C.mono });

  // Card B: Avg Review Time (large)
  metricCard(196, row1y, 176, 100, 'AVG REVIEW', '18h', '↓ 2h vs last week', C.blue);
  sparkline(196+14, row1y+72, 80, 16, [28,25,24,22,20,19,18], C.blue);
  text(196+100, row1y+83, '▼ 10%', 9, C.green, { font:C.mono });

  // ── Row 2: 3 small bento cards ──
  const row2y = row1y + 110;
  const bw = (W - 36 - 16) / 3; // 3 cards with 8px gaps
  [
    { label:'MERGED', value:'124', color:C.green },
    { label:'BLOCKED', value:'8', color:C.red },
    { label:'STALE', value:'12', color:C.textD },
  ].forEach((m, i) => {
    const bx = 18 + i * (bw + 8);
    rect(bx, row2y, bw, 70, C.surf, { rx:10 });
    rect(bx, row2y, bw, 70, C.border, { rx:10, fill:'none', stroke:C.border, sw:1 });
    text(bx + bw/2, row2y+20, m.label, 8, m.color, { anchor:'middle', font:C.mono, ls:0.5, fw:'600' });
    text(bx + bw/2, row2y+46, m.value, 24, m.color, { anchor:'middle', font:C.mono, fw:'700' });
    text(bx + bw/2, row2y+62, 'this week', 8, C.textD, { anchor:'middle', font:C.sans });
  });

  // ── Needs your review ──
  const sec1y = row2y + 84;
  text(18, sec1y, 'NEEDS YOUR REVIEW', 10, C.textD, { font:C.mono, ls:1, fw:'600' });
  line(18, sec1y+10, W-18, sec1y+10, C.border, { sw:1 });

  const prs = [
    { num:'#2341', title:'feat: async pipeline v2 refactor', author:'@jana', status:'Review', size:'L', age:'3h ago', checks:'✓ 12' },
    { num:'#2338', title:'fix: race condition in auth flow', author:'@devraj', status:'Review', size:'S', age:'5h ago', checks:'✓ 8' },
    { num:'#2335', title:'chore: update deps to Q2 versions', author:'@theo', status:'Open', size:'M', age:'1d ago', checks:'✗ 1' },
  ];
  prs.forEach((pr, i) => {
    prRow(18, sec1y+18+i*66, W-36, pr.num, pr.title, pr.author, pr.status, pr.size, pr.age, pr.checks);
  });

  // ── AI Summary bar ──
  const aiY = sec1y + 18 + prs.length*66 + 8;
  rect(18, aiY, W-36, 48, C.amberG, { rx:10 });
  rect(18, aiY, W-36, 48, C.amber, { rx:10, fill:'none', stroke:C.amber, sw:1, opacity:0.25 });
  text(28, aiY+16, '⚡ AI DIGEST', 9, C.amber, { font:C.mono, fw:'700', ls:0.5 });
  text(28, aiY+32, '3 PRs need attention · auth module has high churn · 2 merge conflicts', 9, C.textM, { font:C.mono });

  bottomNav(0);

  return { name:'Dashboard', elements: els.length, svg: '', els:[...els] };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 2: Review Queue
// ─────────────────────────────────────────────────────────────────────────────
function screen2() {
  els = [];
  rect(0, 0, W, H, C.bg);
  statusBar();
  topHeader('Review Queue', '47 open  ·  8 assigned to you');

  const sy = 108;

  // Filter tabs
  const tabs = ['All', 'Mine', 'Stale', 'Blocked', 'Ready'];
  const tabW = 62;
  rect(18, sy, tabs.length * tabW + 8, 32, C.surf, { rx:16 });
  tabs.forEach((t, i) => {
    const tx = 18 + 4 + i * tabW;
    if(i === 0) rect(tx, sy+4, tabW, 24, C.amber, { rx:12 });
    text(tx + tabW/2, sy+20, t, 10, i===0?C.bg:C.textM, { font:C.sans, anchor:'middle', fw: i===0?'700':'400' });
  });

  // Sort row
  text(18, sy+48, 'SORT BY', 9, C.textD, { font:C.mono, ls:0.5 });
  const sorts = ['Age ↓', 'Size', 'Author'];
  sorts.forEach((s, i) => {
    const sx = 78 + i * 70;
    rect(sx, sy+36, 58, 20, i===0?C.raised:C.surf, { rx:10 });
    text(sx+29, sy+50, s, 9, i===0?C.amber:C.textM, { font:C.mono, anchor:'middle' });
  });

  const listY = sy + 64;
  const fullPrs = [
    { num:'#2341', title:'feat: async pipeline v2', author:'@jana.m', status:'Review', size:'L', age:'3h', checks:'✓ 12' },
    { num:'#2338', title:'fix: auth race condition', author:'@devraj', status:'Review', size:'S', age:'5h', checks:'✓ 8' },
    { num:'#2335', title:'chore: dep update Q2', author:'@theo.p', status:'Open', size:'M', age:'1d', checks:'✗ 1' },
    { num:'#2330', title:'refactor: logging module', author:'@yuki', status:'Open', size:'M', age:'2d', checks:'✓ 6' },
    { num:'#2318', title:'feat: webhooks v3 spec', author:'@ami.r', status:'Open', size:'L', age:'4d', checks:'✓ 14' },
    { num:'#2299', title:'fix: memory leak worker', author:'@ben.k', status:'Open', size:'S', age:'6d', checks:'✓ 5' },
    { num:'#2287', title:'docs: API reference update', author:'@priya', status:'Open', size:'S', age:'8d', checks:'✓ 3' },
  ];
  fullPrs.forEach((pr, i) => {
    if(i < 7) prRow(18, listY + i*66, W-36, pr.num, pr.title, pr.author, pr.status, pr.size, pr.age, pr.checks);
  });

  bottomNav(1);
  return { name:'Review Queue', elements:els.length, svg:'', els:[...els] };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 3: PR Detail — Diff View
// ─────────────────────────────────────────────────────────────────────────────
function screen3() {
  els = [];
  rect(0, 0, W, H, C.bg);
  statusBar();

  // Header
  rect(0, 44, W, 56, C.bg);
  line(0, 100, W, 100, C.border, { sw:1 });
  text(18, 70, '←', 16, C.amber, { font:C.sans, fw:'500' });
  text(36, 70, '#2341', 13, C.amber, { font:C.mono, fw:'700' });
  text(36+50, 70, 'feat: async pipeline v2', 13, C.text, { font:C.sans, fw:'500' });
  text(W-18, 70, '⊕ Review', 11, C.bg, { anchor:'end', font:C.sans });
  rect(W-88, 56, 70, 28, C.amber, { rx:8 });
  text(W-53, 74, '⊕ Review', 11, C.bg, { anchor:'middle', font:C.sans, fw:'600' });

  const sy = 108;

  // PR meta row
  statusPill(18, sy+10, 'Open', C.blue, 50);
  text(76, sy+11, '@jana.m', 10, C.textM, { font:C.mono });
  text(140, sy+11, '·  3h ago', 10, C.textD, { font:C.sans });
  text(W-18, sy+11, '+142  −38', 10, C.green, { font:C.mono, anchor:'end' });

  // Changed files
  text(18, sy+30, 'FILES CHANGED (6)', 9, C.textD, { font:C.mono, ls:0.5, fw:'600' });
  const files = [
    { name:'src/pipeline/async.ts', add:'+82', del:'-12', active:true },
    { name:'src/pipeline/types.ts', add:'+24', del:'-8', active:false },
    { name:'tests/pipeline.test.ts', add:'+36', del:'-18', active:false },
  ];
  files.forEach((f, i) => {
    const fy = sy+44 + i*26;
    if(f.active) rect(18, fy-12, W-36, 24, C.raised, { rx:6 });
    const dotColor = f.active ? C.amber : C.textD;
    circle(26, fy+0, 3, dotColor);
    text(36, fy+4, f.name, 10, f.active?C.text:C.textM, { font:C.mono });
    text(W-18, fy+4, `${f.add}  ${f.del}`, 9, C.textD, { font:C.mono, anchor:'end' });
  });

  // Diff code view
  const diffY = sy+126;
  rect(18, diffY, W-36, 230, C.surf, { rx:10 });
  rect(18, diffY, W-36, 230, C.border, { rx:10, fill:'none', stroke:C.border, sw:1 });

  // File header
  rect(18, diffY, W-36, 28, C.raised, { rx:10 });
  text(30, diffY+18, 'src/pipeline/async.ts', 10, C.textM, { font:C.mono });
  text(W-30, diffY+18, '@@ -42,8 +42,14 @@', 9, C.textD, { font:C.mono, anchor:'end' });

  const codeLines = [
    { t:'neutral', c:'export async function runPipeline(', n:42 },
    { t:'neutral', c:'  opts: PipelineOptions', n:43 },
    { t:'neutral', c:') {', n:44 },
    { t:'-',       c:'  const queue = new Queue(opts)', n:45 },
    { t:'-',       c:'  await queue.init()', n:46 },
    { t:'+',       c:'  const queue = await Queue.create(opts, {', n:45 },
    { t:'+',       c:'    concurrency: opts.workers ?? 4,', n:46 },
    { t:'+',       c:'    timeout: opts.timeout ?? 30_000,', n:47 },
    { t:'+',       c:'  })', n:48 },
    { t:'neutral', c:'  const results = []', n:49 },
    { t:'neutral', c:'  for await (const job of queue) {', n:50 },
    { t:'+',       c:'    await job.validate()', n:51 },
    { t:'neutral', c:'    results.push(await job.run())', n:52 },
  ];
  codeLines.forEach((l, i) => {
    diffLine(18, diffY+30+i*16, W-36, l.t, l.c, l.n);
  });

  // Reviewers + checks
  const revY = diffY + 238;
  text(18, revY, 'REVIEWERS', 9, C.textD, { font:C.mono, ls:0.5, fw:'600' });
  const reviewers = [
    { init:'JM', color:C.blue, status:'✓', name:'jana.m', state:'approved' },
    { init:'DR', color:C.purple, status:'◎', name:'devraj', state:'pending' },
    { init:'TP', color:C.amber, status:'◎', name:'theo.p', state:'pending' },
  ];
  reviewers.forEach((r, i) => {
    avatar(28 + i*64, revY+28, 14, r.init, r.color);
    text(28 + i*64, revY+46, r.status, 9, r.state==='approved'?C.green:C.textD, { anchor:'middle', font:C.mono });
  });

  // Checks summary
  text(18, revY+60, 'CI CHECKS', 9, C.textD, { font:C.mono, ls:0.5, fw:'600' });
  const checks = [
    { name:'test:unit (48/48)', pass:true },
    { name:'lint:typescript', pass:true },
    { name:'build:docker', pass:false },
  ];
  checks.forEach((c, i) => {
    const cy2 = revY+74 + i*22;
    text(18, cy2, c.pass?'✓':'✗', 10, c.pass?C.green:C.red, { font:C.mono, fw:'700' });
    text(30, cy2, c.name, 10, c.pass?C.textM:C.red, { font:C.mono });
  });

  bottomNav(1);
  return { name:'PR Detail', elements:els.length, svg:'', els:[...els] };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 4: Team Velocity
// ─────────────────────────────────────────────────────────────────────────────
function screen4() {
  els = [];
  rect(0, 0, W, H, C.bg);
  statusBar();
  topHeader('Velocity', 'Sprint 24  ·  Apr 1–14, 2026');

  const sy = 108;

  // Sprint progress
  rect(18, sy, W-36, 80, C.surf, { rx:10 });
  rect(18, sy, W-36, 80, C.border, { rx:10, fill:'none', stroke:C.border, sw:1 });
  text(30, sy+20, 'SPRINT 24 BURNDOWN', 9, C.textD, { font:C.mono, ls:0.5, fw:'600' });
  text(W-26, sy+20, 'Day 8 of 14', 9, C.textM, { font:C.mono, anchor:'end' });
  // Progress bar
  rect(30, sy+30, W-60, 8, C.raised, { rx:4 });
  rect(30, sy+30, Math.round((W-60)*0.57), 8, C.amber, { rx:4 });
  circle(30+Math.round((W-60)*0.57), sy+34, 5, C.amber);
  text(30, sy+52, '28 pts done', 10, C.text, { font:C.mono, fw:'600' });
  text(W/2, sy+52, '21 pts left', 10, C.textM, { font:C.mono, anchor:'middle' });
  text(W-26, sy+52, '48 pts ideal', 10, C.textD, { font:C.mono, anchor:'end' });
  text(30, sy+68, '57% complete · slightly behind ideal', 10, C.textD, { font:C.sans });

  // Contributor stats
  const contY = sy + 92;
  text(18, contY, 'CONTRIBUTORS', 9, C.textD, { font:C.mono, ls:0.5, fw:'600' });
  line(18, contY+10, W-18, contY+10, C.border, { sw:1 });

  const contributors = [
    { init:'JM', name:'jana.m', prs:8, reviews:12, lines:'+1.2k', color:C.blue },
    { init:'DR', name:'devraj', prs:6, reviews:18, lines:'+840', color:C.purple },
    { init:'TP', name:'theo.p', prs:4, reviews:9, lines:'+380', color:C.amber },
    { init:'YK', name:'yuki', prs:5, reviews:7, lines:'+620', color:C.green },
    { init:'AR', name:'ami.r', prs:3, reviews:14, lines:'+290', color:C.red },
  ];
  contributors.forEach((c, i) => {
    const cy = contY+18 + i*56;
    rect(18, cy, W-36, 50, C.surf, { rx:8 });
    rect(18, cy, W-36, 50, C.border, { rx:8, fill:'none', stroke:C.border, sw:1 });
    avatar(42, cy+25, 16, c.init, c.color);
    text(68, cy+18, c.name, 12, C.text, { font:C.mono, fw:'600' });
    text(68, cy+34, `${c.prs} PRs  ·  ${c.reviews} reviews`, 10, C.textM, { font:C.mono });
    // Mini bar showing PR count relative to max (8)
    const barMax = 8;
    rect(W-110, cy+18, 90, 6, C.raised, { rx:3 });
    rect(W-110, cy+18, Math.round(90*(c.prs/barMax)), 6, c.color, { rx:3 });
    text(W-18, cy+34, c.lines, 10, c.color, { font:C.mono, anchor:'end', fw:'600' });
  });

  bottomNav(3);
  return { name:'Team Velocity', elements:els.length, svg:'', els:[...els] };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 5: AI Insights
// ─────────────────────────────────────────────────────────────────────────────
function screen5() {
  els = [];
  rect(0, 0, W, H, C.bg);
  statusBar();
  topHeader('AI Insights', 'Last analyzed 4 min ago');

  const sy = 108;

  // AI summary card (amber glow)
  rect(18, sy, W-36, 72, C.amberG, { rx:10 });
  rect(18, sy, W-36, 72, C.amber, { rx:10, fill:'none', stroke:C.amber, sw:1, opacity:0.3 });
  // AI icon
  rect(28, sy+14, 28, 28, C.amber, { rx:8, opacity:0.2 });
  text(42, sy+32, '⚡', 16, C.amber, { anchor:'middle' });
  text(66, sy+26, 'CHISEL AI', 9, C.amber, { font:C.mono, fw:'700', ls:0.5 });
  text(66, sy+42, 'High PR churn detected in auth module.', 11, C.text, { font:C.sans });
  text(66, sy+56, '3 files modified in 8 of last 12 PRs', 10, C.textM, { font:C.mono });

  // Risk areas
  const riskY = sy + 82;
  text(18, riskY, 'RISK AREAS', 9, C.textD, { font:C.mono, ls:0.5, fw:'600' });
  line(18, riskY+10, W-18, riskY+10, C.border, { sw:1 });
  const risks = [
    { file:'src/auth/session.ts', risk:88, label:'HIGH', color:C.red },
    { file:'src/pipeline/queue.ts', risk:62, label:'MED', color:C.amber },
    { file:'src/api/routes.ts', risk:44, label:'MED', color:C.amber },
    { file:'src/utils/cache.ts', risk:21, label:'LOW', color:C.green },
  ];
  risks.forEach((r, i) => {
    const ry = riskY+18 + i*44;
    rect(18, ry, W-36, 38, C.surf, { rx:8 });
    rect(18, ry, W-36, 38, C.border, { rx:8, fill:'none', stroke:C.border, sw:1 });
    text(28, ry+14, r.file, 10, C.text, { font:C.mono });
    statusPill(W-70, ry+6, r.label, r.color, 46);
    rect(28, ry+24, W-80, 5, C.raised, { rx:2 });
    rect(28, ry+24, Math.round((W-80)*(r.risk/100)), 5, r.color, { rx:2 });
    text(W-18, ry+28, `${r.risk}%`, 9, r.color, { font:C.mono, anchor:'end', fw:'700' });
  });

  // Recommendations
  const recY = riskY + 18 + risks.length*44 + 8;
  text(18, recY, 'RECOMMENDATIONS', 9, C.textD, { font:C.mono, ls:0.5, fw:'600' });
  line(18, recY+10, W-18, recY+10, C.border, { sw:1 });
  const recs = [
    { icon:'◈', text:'Split auth/session.ts — exceeds 400 LOC complexity threshold', color:C.red },
    { icon:'⌥', text:'Add integration tests for pipeline queue edge cases', color:C.amber },
    { icon:'⊙', text:'Enable required reviews for /src/auth/* path', color:C.blue },
  ];
  recs.forEach((r, i) => {
    const ry2 = recY+18 + i*52;
    rect(18, ry2, W-36, 46, C.surf, { rx:8 });
    rect(18, ry2, W-36, 46, C.border, { rx:8, fill:'none', stroke:C.border, sw:1 });
    rect(28, ry2+13, 20, 20, r.color, { rx:6, opacity:0.15 });
    text(38, ry2+27, r.icon, 11, r.color, { anchor:'middle' });
    text(56, ry2+26, r.text, 10, C.textM, { font:C.sans }, {maxW: W-90});
  });

  bottomNav(4);
  return { name:'AI Insights', elements:els.length, svg:'', els:[...els] };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 6: Settings / Integrations
// ─────────────────────────────────────────────────────────────────────────────
function screen6() {
  els = [];
  rect(0, 0, W, H, C.bg);
  statusBar();
  topHeader('Settings', 'hyperio-mc/core');

  const sy = 108;

  // Profile card
  rect(18, sy, W-36, 76, C.surf, { rx:10 });
  rect(18, sy, W-36, 76, C.border, { rx:10, fill:'none', stroke:C.border, sw:1 });
  avatar(50, sy+38, 20, 'JM', C.amber);
  text(82, sy+32, 'Jana Müller', 14, C.text, { font:C.sans, fw:'700' });
  text(82, sy+50, '@jana.m · Team Lead', 11, C.textM, { font:C.mono });
  rect(W-68, sy+24, 50, 24, C.amber, { rx:8, opacity:0.15 });
  text(W-43, sy+40, 'Pro ⚡', 10, C.amber, { font:C.mono, anchor:'middle', fw:'700' });

  // Integration section
  const intY = sy + 86;
  text(18, intY, 'INTEGRATIONS', 9, C.textD, { font:C.mono, ls:0.5, fw:'600' });
  line(18, intY+10, W-18, intY+10, C.border, { sw:1 });

  const integrations = [
    { name:'GitHub', sub:'hyperio-mc  ·  3 repos', icon:'◈', connected:true },
    { name:'Slack', sub:'#eng-prs  ·  digest enabled', icon:'⊞', connected:true },
    { name:'Linear', sub:'SP-24 linked', icon:'◫', connected:true },
    { name:'Jira', sub:'Not connected', icon:'⊕', connected:false },
    { name:'Datadog', sub:'Not connected', icon:'∿', connected:false },
  ];
  integrations.forEach((int, i) => {
    const iy = intY+18 + i*58;
    rect(18, iy, W-36, 52, C.surf, { rx:8 });
    rect(18, iy, W-36, 52, C.border, { rx:8, fill:'none', stroke:C.border, sw:1 });
    // Icon bg
    rect(28, iy+12, 28, 28, int.connected ? C.amberG : C.raised, { rx:8 });
    text(42, iy+30, int.icon, 14, int.connected ? C.amber : C.textD, { anchor:'middle' });
    text(66, iy+24, int.name, 12, C.text, { font:C.sans, fw:'600' });
    text(66, iy+40, int.sub, 10, C.textM, { font:C.mono });
    if(int.connected) {
      rect(W-56, iy+16, 38, 20, C.green, { rx:10, opacity:0.15 });
      text(W-37, iy+30, '● on', 9, C.green, { font:C.mono, anchor:'middle', fw:'700' });
    } else {
      rect(W-64, iy+16, 46, 20, C.raised, { rx:10 });
      text(W-41, iy+30, '+ connect', 9, C.textD, { font:C.mono, anchor:'middle' });
    }
  });

  // Danger zone
  const dzY = intY + 18 + integrations.length*58 + 4;
  text(18, dzY, 'DANGER ZONE', 9, C.red, { font:C.mono, ls:0.5, fw:'600', opacity:0.7 });
  line(18, dzY+10, W-18, dzY+10, C.red, { sw:1, opacity:0.15 });
  rect(18, dzY+18, W-36, 36, C.surf, { rx:8 });
  rect(18, dzY+18, W-36, 36, C.red, { rx:8, fill:'none', stroke:C.red, sw:1, opacity:0.2 });
  text(28, dzY+40, 'Remove repository access', 12, C.red, { font:C.sans, fw:'500', opacity:0.7 });
  text(W-20, dzY+40, '→', 14, C.red, { anchor:'end', opacity:0.5 });

  bottomNav(-1);
  return { name:'Settings', elements:els.length, svg:'', els:[...els] };
}

// ─────────────────────────────────────────────────────────────────────────────
// ASSEMBLE PEN
// ─────────────────────────────────────────────────────────────────────────────
const screens = [screen1(), screen2(), screen3(), screen4(), screen5(), screen6()];

const pen = {
  version: '2.8',
  metadata: {
    name: 'CHISEL — AI Pull-Request Analytics',
    author: 'RAM',
    date: new Date().toISOString().slice(0,10),
    theme: 'dark',
    heartbeat: 1,
    slug: SLUG,
    palette: {
      bg: C.bg, surface: C.surf, raised: C.raised,
      accent: C.amber, accent2: C.blue,
      text: C.text, muted: C.textM,
    },
    elements: screens.reduce((sum, s) => sum + s.elements, 0),
  },
  screens: screens.map(s => ({
    name: s.name,
    width: W,
    height: H,
    elements: s.els,
  })),
};

const totalEls = pen.metadata.elements;
fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`CHISEL: ${screens.length} screens, ${totalEls} elements`);
console.log(`Written: ${SLUG}.pen`);
screens.forEach((s, i) => console.log(`  Screen ${i+1}: ${s.name} — ${s.elements} elements`));
