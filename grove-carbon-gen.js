const fs = require('fs');

const SLUG = 'grove-carbon';
const APP_NAME = 'Grove';
const TAGLINE = 'Carbon intelligence for engineering teams';

// ─── PALETTE ────────────────────────────────────────────────────────────────
const P = {
  bg:       '#F4F2EC',   // warm parchment
  surface:  '#FFFFFF',
  surface2: '#EBE9E2',
  text:     '#1A1F2E',
  muted:    '#8A8E9A',
  accent:   '#2D6A4F',   // forest green
  accent2:  '#E8893A',   // warm amber
  green2:   '#6EAF8A',   // sage
  red:      '#C94F3E',
  border:   '#E2DED5',
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const px = n => typeof n === 'number' ? n : n;
const rect = (x,y,w,h,fill,r=0,op=1) => ({ type:'rectangle', x, y, width:w, height:h, fill, cornerRadius:r, opacity:op });
const text = (str,x,y,sz,col,bold=false,align='left',w=300) => ({
  type:'text', content:str, x, y, fontSize:sz, color:col,
  fontWeight: bold ? 700 : 400, textAlign:align, width:w
});
const line = (x1,y1,x2,y2,col,width=1,op=1) => ({ type:'line', x1,y1,x2,y2,stroke:col,strokeWidth:width,opacity:op });
const circle = (cx,cy,r,fill,op=1) => ({ type:'circle', cx,cy,r,fill,opacity:op });

// ─── SCREEN BUILDER ──────────────────────────────────────────────────────────
const W = 390, H = 844;

function statusBar(elements) {
  elements.push(rect(0,0,W,48,P.bg));
  elements.push(text('9:41',16,14,13,P.text,true));
  elements.push(text('●●●',320,14,10,P.text));
}

function bottomNav(elements, active=0) {
  elements.push(rect(0,H-80,W,80,P.surface));
  elements.push(line(0,H-80,W,H-80,P.border));
  const tabs = [
    { label:'Overview', icon:'◈' },
    { label:'Sources',  icon:'⊞'  },
    { label:'Offsets',  icon:'✦'  },
    { label:'Reports',  icon:'≋'  },
    { label:'Team',     icon:'◉'  },
  ];
  tabs.forEach((t,i) => {
    const x = i*(W/5) + (W/10);
    const col = i===active ? P.accent : P.muted;
    elements.push(text(t.icon, x-8, H-68, 18, col, i===active));
    elements.push(text(t.label, x-(t.label.length*3.2), H-44, 9, col, i===active));
  });
}

function ambientBars(elements, x0, y0, bars=16, maxH=80, colors=[P.green2, P.accent]) {
  // Neon-inspired vertical bar visualization (transposed to light)
  const vals = [0.3,0.55,0.7,0.45,0.9,0.6,0.35,0.75,0.5,0.85,0.4,0.65,0.8,0.3,0.6,0.45];
  for(let i=0;i<bars;i++) {
    const h = vals[i] * maxH;
    const col = i % 2 === 0 ? colors[0] : colors[1];
    const opacity = 0.12 + vals[i]*0.22;
    elements.push(rect(x0 + i*12, y0 + (maxH-h), 8, h, col, 2, opacity));
  }
}

// ═══════════════════════════════════════════════════════════════════
// SCREEN 1 — Carbon Dashboard
// ═══════════════════════════════════════════════════════════════════
function screen1() {
  const els = [];
  // bg
  els.push(rect(0,0,W,H,P.bg));

  // Header area with ambient bar texture
  els.push(rect(0,0,W,200,'#E8E5DC'));
  statusBar(els);

  // Ambient bar viz in header (Neon reference)
  ambientBars(els, 0, 60, 33, 120, [P.accent, P.green2]);

  // Header text
  els.push(text('Grove', 20, 56, 22, P.text, true));
  els.push(text('March 2026', 20, 84, 13, P.muted));
  // Score badge
  els.push(rect(W-90, 56, 72, 36, P.accent, 18));
  els.push(text('B+  Score', W-80, 69, 11, '#FFFFFF', true, 'left', 70));

  // Monthly carbon total card
  els.push(rect(16,210,W-32,100,P.surface,12));
  els.push(line(16,210,16,310,P.accent,3));  // green left border
  els.push(text('Monthly Emissions', 30, 224, 11, P.muted));
  els.push(text('142.7', 30, 248, 38, P.text, true));
  els.push(text('tCO₂e', 130, 264, 13, P.muted));
  els.push(text('↓ 8.4% vs last month', 30, 292, 11, P.accent));

  // Mini bar chart — weekly
  els.push(text('This week', 30, 322, 11, P.muted));
  const weekVals = [0.62, 0.78, 0.5, 0.88, 0.42, 0.55, 0.35];
  const days = ['M','T','W','T','F','S','S'];
  weekVals.forEach((v,i) => {
    const bh = v * 48;
    const bx = 30 + i*46;
    els.push(rect(bx, 380+(48-bh), 28, bh, i===4 ? P.accent : P.green2, 4, i===4?1:0.55));
    els.push(text(days[i], bx+10, 338, 9, P.muted));
  });

  // Source breakdown
  els.push(text('Top Sources', 20, 444, 13, P.text, true));
  const sources = [
    { name:'Cloud Compute', pct:48, col:P.accent },
    { name:'Data Transfer', pct:28, col:P.green2 },
    { name:'Storage',       pct:14, col:P.accent2 },
    { name:'CDN / Edge',    pct:10, col:P.muted },
  ];
  sources.forEach((s,i) => {
    const y = 468 + i*44;
    els.push(rect(20, y, W-40, 36, P.surface, 8));
    els.push(text(s.name, 32, y+11, 12, P.text));
    els.push(text(s.pct+'%', W-54, y+11, 12, P.text, true));
    els.push(rect(20, y+30, W-40, 3, P.surface2, 0));
    els.push(rect(20, y+30, (W-40)*(s.pct/100), 3, s.col, 0, 0.7));
  });

  // Quick actions
  els.push(rect(20,658,172,60,P.accent,12));
  els.push(text('+ Add Offset', 56, 683, 13, '#FFFFFF', true));
  els.push(rect(202,658,168,60,P.surface,12));
  els.push(line(202,658,370,658,P.border)); els.push(line(202,718,370,718,P.border));
  els.push(line(202,658,202,718,P.border)); els.push(line(370,658,370,718,P.border));
  els.push(text('View Report', 238, 683, 13, P.text, true));

  bottomNav(els, 0);
  return els;
}

// ═══════════════════════════════════════════════════════════════════
// SCREEN 2 — Infrastructure Sources
// ═══════════════════════════════════════════════════════════════════
function screen2() {
  const els = [];
  els.push(rect(0,0,W,H,P.bg));
  statusBar(els);

  // Header
  els.push(text('Sources', 20, 62, 22, P.text, true));
  els.push(text('7 active integrations', 20, 88, 12, P.muted));

  // Filter pills
  const filters = ['All','AWS','GCP','Azure','Other'];
  filters.forEach((f,i) => {
    const fw = f.length*8 + 20;
    const fx = 20 + filters.slice(0,i).reduce((a,ff)=>a+ff.length*8+28,0);
    const isFirst = i===0;
    els.push(rect(fx, 104, fw, 28, isFirst?P.accent:P.surface, 14));
    els.push(text(f, fx+10, 114, 11, isFirst?'#FFFFFF':P.muted, isFirst));
  });

  // Source cards
  const srcs = [
    { name:'AWS EC2 — us-east-1',   sub:'Compute',       val:'68.3', unit:'tCO₂e', trend:'↑4%', up:true,  icon:'▦', region:'US East' },
    { name:'GCP Cloud Run',          sub:'Serverless',    val:'21.4', unit:'tCO₂e', trend:'↓12%',up:false, icon:'◈', region:'EU West' },
    { name:'Azure Blob Storage',     sub:'Storage',       val:'14.1', unit:'tCO₂e', trend:'↓2%', up:false, icon:'⬡', region:'EU North' },
    { name:'AWS CloudFront',         sub:'CDN',           val:'11.8', unit:'tCO₂e', trend:'↑1%', up:true,  icon:'◉', region:'Global' },
    { name:'GCP BigQuery',           sub:'Analytics',     val:'9.2',  unit:'tCO₂e', trend:'↓6%', up:false, icon:'≋', region:'US Central' },
  ];
  srcs.forEach((s,i) => {
    const y = 148 + i*112;
    els.push(rect(16, y, W-32, 100, P.surface, 12));
    // Icon circle
    els.push(circle(48, y+30, 18, P.bg));
    els.push(text(s.icon, 40, y+22, 14, P.accent));
    // Name + meta
    els.push(text(s.name, 76, y+16, 12, P.text, true, 'left', 220));
    els.push(text(s.sub + '  ·  ' + s.region, 76, y+34, 10, P.muted));
    // Value
    els.push(text(s.val, W-90, y+16, 20, P.text, true));
    els.push(text(s.unit, W-52, y+28, 9, P.muted));
    // Trend pill
    els.push(rect(76, y+58, 52, 20, s.up ? '#FCEAE8' : '#E8F4EE', 10));
    els.push(text(s.trend, 88, y+63, 10, s.up ? P.red : P.accent, true));
    // Mini ambient bars (5 bars, small)
    for(let b=0;b<8;b++){
      const bh = (Math.sin(b*1.4+i)*0.3+0.5)*20;
      els.push(rect(W-100+b*9, y+60+(20-bh), 6, bh, P.green2, 2, 0.3+b*0.05));
    }
  });

  // Connected badge
  els.push(rect(20, 712, W-40, 44, '#EAF4EE', 10));
  els.push(text('✦  All integrations healthy', W/2-80, 728, 12, P.accent));

  bottomNav(els, 1);
  return els;
}

// ═══════════════════════════════════════════════════════════════════
// SCREEN 3 — Offset Projects
// ═══════════════════════════════════════════════════════════════════
function screen3() {
  const els = [];
  els.push(rect(0,0,W,H,P.bg));
  statusBar(els);

  els.push(text('Offsets', 20, 62, 22, P.text, true));

  // Summary banner
  els.push(rect(16, 88, W-32, 72, P.accent, 12));
  ambientBars(els, 16, 88, 30, 60, ['#FFFFFF', '#6EAF8A']);
  els.push(text('Net Committed Offset', 28, 100, 11, 'rgba(255,255,255,0.7)'));
  els.push(text('98.2 tCO₂e', 28, 120, 24, '#FFFFFF', true));
  els.push(text('of 142.7 tCO₂e target', 28, 148, 10, 'rgba(255,255,255,0.65)'));
  // Progress bar on banner
  els.push(rect(W-100, 110, 72, 8, 'rgba(255,255,255,0.25)', 4));
  els.push(rect(W-100, 110, 72*0.69, 8, '#FFFFFF', 4));
  els.push(text('69%', W-100, 128, 9, '#FFFFFF', true));

  // Offset cards
  const projects = [
    { name:'Amazon Reforestation', country:'Brazil', type:'Forest',  total:'40 tCO₂e', pct:100, status:'Active',   col:P.accent },
    { name:'Wind Farm Certificates', country:'Denmark', type:'Renewable', total:'30 tCO₂e', pct:100, status:'Active',   col:P.green2 },
    { name:'Biochar Sequestration', country:'USA', type:'Removal', total:'20 tCO₂e', pct:80,  status:'In progress', col:P.accent2 },
    { name:'Direct Air Capture',   country:'Iceland', type:'Tech',    total:'8.2 tCO₂e', pct:38,  status:'Pending',    col:P.muted },
  ];
  projects.forEach((p,i) => {
    const y = 176 + i*120;
    els.push(rect(16, y, W-32, 108, P.surface, 12));
    // Type tag
    const tagW = p.type.length*7+16;
    els.push(rect(24, y+10, tagW, 20, p.col=== P.muted ? P.surface2 : p.col+'22', 10));
    els.push(text(p.type, 32, y+15, 9, p.col===P.muted ? P.muted : p.col, true));
    // Status
    const sCol = p.status==='Active'?P.accent:p.status==='In progress'?P.accent2:P.muted;
    els.push(rect(W-24-60, y+10, 60, 20, sCol+'18', 10));
    els.push(text(p.status, W-76, y+15, 9, sCol, true));
    // Name
    els.push(text(p.name, 24, y+36, 13, P.text, true, 'left', 250));
    els.push(text(p.country + '  ·  ' + p.total, 24, y+56, 10, P.muted));
    // Progress bar
    els.push(rect(24, y+78, W-64, 8, P.surface2, 4));
    els.push(rect(24, y+78, (W-64)*(p.pct/100), 8, p.col===P.muted?P.muted:p.col, 4, p.col===P.muted?0.4:0.85));
    els.push(text(p.pct+'%', W-40, y+74, 10, p.col===P.muted?P.muted:p.col, true));
  });

  bottomNav(els, 2);
  return els;
}

// ═══════════════════════════════════════════════════════════════════
// SCREEN 4 — Monthly Report / Trend
// ═══════════════════════════════════════════════════════════════════
function screen4() {
  const els = [];
  els.push(rect(0,0,W,H,P.bg));
  statusBar(els);

  els.push(text('Reports', 20, 62, 22, P.text, true));
  els.push(text('Q1 2026  →  Q2 Forecast', 20, 88, 12, P.muted));

  // Large bar chart — quarterly trend
  const months = ['Oct','Nov','Dec','Jan','Feb','Mar'];
  const vals    = [0.9, 0.82, 0.74, 0.68, 0.61, 0.53];
  const chartY = 110, chartH = 160, chartX = 40;

  // Y axis grid lines
  [0, 0.25, 0.5, 0.75, 1].forEach(v => {
    const y = chartY + chartH - v*chartH;
    els.push(line(chartX, y, W-24, y, P.border, 1, v===0?1:0.5));
    if(v>0) els.push(text(Math.round(v*200)+'', chartX-36, y-5, 8, P.muted));
  });

  months.forEach((m,i) => {
    const bw = 30;
    const bh = vals[i] * chartH;
    const bx = chartX + 16 + i*(bw+16);
    const isLast = i===months.length-1;
    // Bar gradient effect via two rects
    els.push(rect(bx, chartY+chartH-bh, bw, bh, isLast?P.accent:P.green2, 4, isLast?1:0.55));
    if(isLast) {
      els.push(rect(bx, chartY+chartH-bh, bw, bh, P.accent, 4, 0.15));
    }
    els.push(text(m, bx+4, chartY+chartH+8, 9, isLast?P.accent:P.muted, isLast));
    if(isLast) {
      els.push(text(Math.round(vals[i]*200)+'t', bx+2, chartY+chartH-bh-16, 9, P.accent, true));
    }
  });

  // Trend stat cards row
  const stats = [
    { label:'Reduction', val:'-41%', sub:'vs. Oct 2025', col:P.accent },
    { label:'Forecast Q2', val:'108t', sub:'est. tCO₂e', col:P.accent2 },
  ];
  stats.forEach((s,i) => {
    const cx = 16 + i*193;
    els.push(rect(cx, 296, 181, 76, P.surface, 12));
    els.push(text(s.label, cx+14, 308, 10, P.muted));
    els.push(text(s.val, cx+14, 328, 26, s.col, true));
    els.push(text(s.sub, cx+14, 360, 10, P.muted));
  });

  // Insights section
  els.push(text('AI Insights', 20, 392, 13, P.text, true));
  const insights = [
    { icon:'⚡', txt:'Cloud Compute costs rose 4% in March — schedule batch jobs overnight to cut emissions by ~12%.', col: P.accent2 },
    { icon:'✦', txt:'Data Transfer from EU is 2× greener than US East — consider migrating EU users to closer region.', col: P.accent },
    { icon:'◈', txt:'Steady 8% monthly reduction — on track to reach net-zero by Q3 if trend holds.', col: P.green2 },
  ];
  insights.forEach((ins,i) => {
    const iy = 412 + i*96;
    els.push(rect(16, iy, W-32, 84, P.surface, 12));
    els.push(circle(44, iy+28, 16, ins.col+'18'));
    els.push(text(ins.icon, 37, iy+20, 13, ins.col));
    els.push(text(ins.txt, 72, iy+12, 11, P.text, false, 'left', W-96));
  });

  bottomNav(els, 3);
  return els;
}

// ═══════════════════════════════════════════════════════════════════
// SCREEN 5 — Team & Settings
// ═══════════════════════════════════════════════════════════════════
function screen5() {
  const els = [];
  els.push(rect(0,0,W,H,P.bg));
  statusBar(els);

  // Profile header
  els.push(rect(0,0,W,220,P.surface));
  // Ambient texture in header
  ambientBars(els, 0, 60, 33, 140, [P.green2, P.accent2]);
  // Avatar
  els.push(circle(W/2, 120, 40, P.accent));
  els.push(text('RK', W/2-14, 110, 18, '#FFFFFF', true));
  els.push(text('Rakis Team', W/2-40, 170, 15, P.text, true, 'left', 80));
  els.push(text('Pro Plan  ·  3 seats', W/2-54, 192, 10, P.muted, false, 'left', 110));

  // Usage card
  els.push(rect(16, 232, W-32, 72, '#EAF4EE', 12));
  els.push(text('Monthly API calls', 28, 244, 10, P.muted));
  els.push(text('24,891', 28, 264, 22, P.accent, true));
  els.push(rect(28, 290, W-72, 6, '#C8E6D8', 3));
  els.push(rect(28, 290, (W-72)*0.83, 6, P.accent, 3));
  els.push(text('83% of 30k limit', W-136, 284, 9, P.muted));

  // Team members
  els.push(text('Team Members', 20, 320, 13, P.text, true));
  const members = [
    { name:'Rakis',   role:'Admin',    initial:'R', col:P.accent },
    { name:'Sara K.', role:'Engineer', initial:'S', col:P.accent2 },
    { name:'Dev M.',  role:'Analyst',  initial:'D', col:P.green2 },
  ];
  members.forEach((m,i) => {
    const my = 344 + i*60;
    els.push(rect(16, my, W-32, 52, P.surface, 10));
    els.push(circle(44, my+26, 18, m.col+'22'));
    els.push(text(m.initial, 38, my+18, 13, m.col, true));
    els.push(text(m.name, 72, my+12, 13, P.text, true));
    els.push(text(m.role, 72, my+30, 10, P.muted));
    els.push(rect(W-70, my+18, 54, 18, P.surface2, 9));
    els.push(text(m.role==='Admin'?'Owner':'Member', W-66, my+23, 8, P.muted));
  });

  // Settings rows
  els.push(text('Account', 20, 536, 13, P.text, true));
  const settings = ['Integrations','Billing & Plan','Notifications','Export Data','API Keys'];
  settings.forEach((s,i) => {
    const sy = 558 + i*46;
    els.push(rect(16, sy, W-32, 38, P.surface, 8));
    els.push(text(s, 30, sy+11, 12, P.text));
    els.push(text('›', W-36, sy+10, 16, P.muted));
  });

  bottomNav(els, 4);
  return els;
}

// ─── ASSEMBLE PEN FILE ───────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  meta: {
    name: APP_NAME,
    slug: SLUG,
    tagline: TAGLINE,
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    theme: 'light',
    palette: P,
    inspiration: 'Neon (neon.tech) on darkmodedesign.com — vertical bar data visualization as ambient texture, transposed to warm parchment light theme',
  },
  screens: [
    { id: 'dashboard',  name: 'Carbon Dashboard',    width: W, height: H, elements: screen1() },
    { id: 'sources',    name: 'Infrastructure Sources', width: W, height: H, elements: screen2() },
    { id: 'offsets',    name: 'Offset Projects',     width: W, height: H, elements: screen3() },
    { id: 'reports',    name: 'Monthly Report',      width: W, height: H, elements: screen4() },
    { id: 'team',       name: 'Team & Settings',     width: W, height: H, elements: screen5() },
  ],
};

const OUT = `grove-carbon.pen`;
fs.writeFileSync(OUT, JSON.stringify(pen, null, 2));
console.log(`✓ wrote ${OUT} — ${pen.screens.length} screens, ${pen.screens.reduce((a,s)=>a+s.elements.length,0)} elements`);
