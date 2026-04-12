// BALM — Calm clarity for creative freelancers
// Pen generator — direct SVG per screen
// Inspired by:
//   Cushion App (darkmodedesign.com) — peace-of-mind freelancer finance, chart-forward calm UI
//   Awwwards nominees — editorial large typography as visual anchors ("07" as hero date)
//   Opal Camera (Godly.website) — breathing room, minimal product-first hierarchy
// Theme: LIGHT — warm earthy cream palette

'use strict';
const fs   = require('fs');
const path = require('path');

const W = 390, H = 844;

// ── Palette ──────────────────────────────────────────────────────────────────
const BG        = '#F7F3EE';   // warm cream
const SURFACE   = '#FFFFFF';
const SURFACE2  = '#F0EDE8';
const BORDER    = '#E2DDD6';
const TEXT      = '#1C1917';   // warm near-black
const MUTED     = '#9B918A';
const ACCENT    = '#C85A2A';   // terracotta
const ACCENTLT  = '#F5C4AD';
const GREEN     = '#4A7B6F';   // sage
const GREENLT   = '#C8DDD9';
const AMBER     = '#B07828';
const AMBERLT   = '#F0DFB0';
const SANS      = 'Georgia,Times New Roman,serif';
const SANSUI    = 'system-ui,-apple-system,Helvetica Neue,Arial,sans-serif';
const MONO      = 'Courier New,Courier,monospace';

// ── SVG helpers ──────────────────────────────────────────────────────────────
const esc = (s) => String(s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;')
  .replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function rect(x,y,w,h,fill,opts={}) {
  const r   = opts.r  !== undefined ? ` rx="${opts.r}"` : '';
  const op  = opts.op !== undefined ? ` opacity="${opts.op}"` : '';
  const str = opts.stroke ? ` stroke="${opts.stroke}" stroke-width="${opts.sw||1}" fill="${fill}"` : `fill="${fill}"`;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" ${str}${r}${op}/>`;
}

function line(x1,y1,x2,y2,color=BORDER,op=1,sw=1) {
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${sw}" opacity="${op}"/>`;
}

function circle(cx,cy,r,fill,op=1,stroke='',sw=1) {
  const s = stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : '';
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${op}"${s}/>`;
}

function txt(x,y,content,size,color,opts={}) {
  const fw  = opts.bold?'700':opts.semi?'600':opts.med?'500':'400';
  const ff  = opts.serif ? SANS : opts.mono ? MONO : SANSUI;
  const op  = opts.op !== undefined ? ` opacity="${opts.op}"` : '';
  const ls  = opts.ls ? ` letter-spacing="${opts.ls}"` : '';
  const anchor = opts.align==='center'?'middle':opts.align==='right'?'end':'start';
  const tx  = opts.align==='center' ? x+(opts.w||0)/2 : opts.align==='right' ? x+(opts.w||0) : x;
  const dec = opts.italic ? ' font-style="italic"' : '';
  return `<text x="${tx}" y="${y+size}" font-family="${ff}" font-size="${size}" font-weight="${fw}" fill="${color}" text-anchor="${anchor}"${ls}${op}${dec}>${esc(content)}</text>`;
}

// Editorial big ghost number behind content
function ghostNum(x,y,val,size=120,color=BORDER) {
  return `<text x="${x}" y="${y+size}" font-family="${SANS}" font-size="${size}" font-weight="700" fill="${color}" opacity="0.4">${esc(val)}</text>`;
}

// Pill badge
function badge(x,y,label,fill,textColor,opts={}) {
  const h = opts.h || 22;
  const pad = opts.pad || 12;
  const fs = opts.fs || 10;
  const measured = label.length * (fs * 0.62) + pad * 2;
  const w = opts.w || measured;
  const r = h / 2;
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>
    <text x="${x+w/2}" y="${y+h*0.72}" font-family="${SANSUI}" font-size="${fs}" font-weight="600" fill="${textColor}" text-anchor="middle" letter-spacing="0.5">${esc(label)}</text>
  `;
}

// Progress bar
function progBar(x,y,w,h,pct,color,bg=SURFACE2) {
  const filled = Math.round(w * pct / 100);
  return `
    ${rect(x,y,w,h,bg,{r:h/2})}
    ${rect(x,y,filled,h,color,{r:h/2})}
  `;
}

// Bar chart
function barChart(x,y,w,h,data,activeColor,muted) {
  const n = data.length;
  const barW = Math.floor((w - (n-1)*6) / n);
  const maxVal = Math.max(...data.map(d=>d.v));
  return data.map((d,i) => {
    const bh = Math.round((d.v / maxVal) * (h - 30));
    const bx = x + i * (barW + 6);
    const by = y + h - 30 - bh;
    const isActive = d.active;
    return `
      ${rect(bx, by, barW, bh, isActive ? activeColor : muted, {r:3})}
      ${txt(bx + barW/2, y+h-20, d.l, 9, MUTED, {align:'center', w:0})}
    `;
  }).join('');
}

// ── Nav bar ──────────────────────────────────────────────────────────────────
function navBar(activeIdx) {
  const tabs = [
    {l:'Today',   i:'◉'},
    {l:'Projects',i:'⊞'},
    {l:'Invoices',i:'◫'},
    {l:'Earnings',i:'◴'},
    {l:'Focus',   i:'◎'},
  ];
  const tw = W / tabs.length;
  const items = tabs.map((t,i) => {
    const cx = tw*i + tw/2;
    const isA = i === activeIdx;
    return `
      ${isA ? rect(cx - tw/2 + 10, H-72, tw-20, 2, ACCENT, {r:1}) : ''}
      ${txt(cx, H-65, t.i, 18, isA ? ACCENT : MUTED, {align:'center', w:0})}
      ${txt(cx, H-42, t.l, 9, isA ? TEXT : MUTED, {align:'center', w:0, med:isA})}
    `;
  }).join('');
  return `
    ${rect(0, H-78, W, 78, SURFACE)}
    ${line(0, H-78, W, H-78, BORDER)}
    ${items}
  `;
}

// ── Status bar ────────────────────────────────────────────────────────────────
function statusBar() {
  return `
    ${rect(0,0,W,44,BG)}
    ${txt(20, 12, '9:41', 14, TEXT, {bold:true})}
    ${txt(W-20, 12, '⚡ 87%', 13, MUTED, {align:'right', w:0})}
  `;
}

// ── Screen 1: Today ────────────────────────────────────────────────────────────
function screen1() {
  const tasks = [
    {done:true,  label:'Finalize Orbi brandbook cover',    tag:'Branding'},
    {done:true,  label:'Client call — Neon Labs',          tag:'Meeting'},
    {done:false, label:'Revise homepage wireframes',       tag:'Web'},
    {done:false, label:'Send invoice INV-026 to Frames Co',tag:'Finance'},
  ];

  const taskItems = tasks.map((t,i) => {
    const ty = 344 + i * 58;
    const checkFill = t.done ? ACCENT : SURFACE;
    const checkStroke = t.done ? ACCENT : BORDER;
    return `
      ${rect(20, ty, W-40, 50, SURFACE, {r:10, stroke:BORDER, sw:1})}
      ${circle(44, ty+25, 10, checkFill, 1, checkStroke, 1.5)}
      ${t.done ? txt(40, ty+17, '✓', 12, SURFACE, {bold:true, align:'center', w:8}) : ''}
      ${txt(62, ty+12, t.label, 13, t.done ? MUTED : TEXT, {op: t.done ? 0.7 : 1})}
      ${badge(62, ty+29, t.tag, t.done ? SURFACE2 : ACCENTLT, t.done ? MUTED : ACCENT, {h:16, fs:9, pad:8})}
    `;
  }).join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      ${rect(0,0,W,H,BG)}
      ${statusBar()}

      <!-- Ghost editorial date anchor -->
      ${ghostNum(14, 52, '07', 130, '#D9D0C5')}

      <!-- Day / month labels -->
      ${txt(20, 56, 'APRIL', 11, ACCENT, {bold:true, ls:3})}
      ${txt(20, 74, 'Tuesday', 14, MUTED)}

      <!-- Greeting -->
      ${txt(20, 186, 'Good morning,', 16, MUTED, {italic:true, serif:true})}
      ${txt(20, 208, 'Mia.', 34, TEXT, {bold:true, serif:true})}

      <!-- Quick stats row -->
      ${rect(20, 264, 105, 64, SURFACE, {r:10, stroke:BORDER, sw:1})}
      ${txt(32, 272, '4', 28, ACCENT, {bold:true, serif:true})}
      ${txt(32, 300, 'tasks today', 10, MUTED)}

      ${rect(135, 264, 105, 64, SURFACE, {r:10, stroke:BORDER, sw:1})}
      ${txt(147, 272, '3h', 28, GREEN, {bold:true, serif:true})}
      ${txt(147, 300, 'focus logged', 10, MUTED)}

      ${rect(250, 264, 120, 64, SURFACE, {r:10, stroke:BORDER, sw:1})}
      ${txt(262, 272, '$840', 24, TEXT, {bold:true})}
      ${txt(262, 296, 'earned today', 10, MUTED)}

      <!-- Tasks header -->
      ${txt(20, 344, 'TODAY', 10, MUTED, {bold:true, ls:2})}
      ${txt(W-20, 344, '4 tasks', 10, MUTED, {align:'right', w:0})}

      ${taskItems}

      ${navBar(0)}
    </svg>
  `;
}

// ── Screen 2: Projects ─────────────────────────────────────────────────────────
function screen2() {
  const projects = [
    {name:'Orbi Brandbook',    client:'Orbi Studio',  due:'Apr 15',color:ACCENT,  pct:72, val:'$3,200', tag:'Branding'},
    {name:'Neon Web Redesign', client:'Neon Labs',    due:'Apr 22',color:GREEN,   pct:41, val:'$4,800', tag:'Web'},
    {name:'Illustration Pack', client:'Frames Co',    due:'May 3', color:AMBER,   pct:18, val:'$1,600', tag:'Illustration'},
  ];

  const cards = projects.map((p,i) => {
    const cy = 200 + i * 168;
    return `
      ${rect(20, cy, W-40, 150, SURFACE, {r:12, stroke:BORDER, sw:1})}
      ${rect(20, cy, 4, 150, p.color, {r:2})}

      ${badge(36, cy+14, p.tag, p.color+'22', p.color, {h:20, fs:9, pad:10})}
      ${txt(W-32, cy+14, p.val, 14, TEXT, {bold:true, align:'right', w:0})}

      ${txt(36, cy+42, p.name, 17, TEXT, {bold:true, serif:true})}
      ${txt(36, cy+64, p.client, 12, MUTED)}

      ${txt(36, cy+88, 'Progress', 10, MUTED, {ls:1})}
      ${txt(W-32, cy+88, p.pct+'%', 10, p.color, {bold:true, align:'right', w:0})}
      ${progBar(36, cy+104, W-72, 6, p.pct, p.color)}

      ${rect(36, cy+118, 80, 22, SURFACE2, {r:4})}
      ${txt(76, cy+120, 'Due '+p.due, 10, MUTED, {align:'center', w:0})}
    `;
  }).join('');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      ${rect(0,0,W,H,BG)}
      ${statusBar()}

      <!-- Ghost editorial number -->
      ${ghostNum(W-90, 44, '3', 110, '#D9D0C5')}

      ${txt(20, 56, 'PROJECTS', 11, MUTED, {bold:true, ls:2})}
      ${txt(20, 74, '3 active', 30, TEXT, {bold:true, serif:true})}
      ${txt(20, 108, 'In progress this month', 13, MUTED, {italic:true, serif:true})}

      <!-- Filter pills -->
      ${badge(20, 136, 'All', ACCENT, SURFACE, {h:28, fs:11, pad:16, w:56})}
      ${badge(84, 136, 'Active', SURFACE, MUTED, {h:28, fs:11, pad:16, w:64})}
      ${badge(156, 136, 'Completed', SURFACE, MUTED, {h:28, fs:11, pad:16, w:82})}

      ${cards}

      ${navBar(1)}
    </svg>
  `;
}

// ── Screen 3: Invoices ─────────────────────────────────────────────────────────
function screen3() {
  const invoices = [
    {id:'INV-024', client:'Orbi Studio',  amt:'$3,200', status:'PAID',    sc:GREEN,   sf:GREENLT},
    {id:'INV-025', client:'Neon Labs',    amt:'$4,800', status:'PENDING', sc:AMBER,   sf:AMBERLT},
    {id:'INV-026', client:'Frames Co',   amt:'$1,600', status:'DRAFT',   sc:MUTED,   sf:SURFACE2},
    {id:'INV-023', client:'Salt & Bits', amt:'$2,400', status:'PAID',    sc:GREEN,   sf:GREENLT},
  ];

  const rows = invoices.map((inv,i) => {
    const iy = 236 + i * 80;
    return `
      ${rect(20, iy, W-40, 66, SURFACE, {r:10, stroke:BORDER, sw:1})}
      ${txt(36, iy+12, inv.id, 11, MUTED, {mono:true})}
      ${txt(36, iy+30, inv.client, 15, TEXT, {bold:true})}
      ${txt(W-32, iy+14, inv.amt, 18, TEXT, {bold:true, align:'right', w:0})}
      ${badge(W-32 - (inv.status.length * 6.5 + 24), iy+38, inv.status, inv.sf, inv.sc, {h:18, fs:9, pad:10})}
    `;
  }).join('');

  const totalPaid = '$5,600';
  const totalOut  = '$4,800';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      ${rect(0,0,W,H,BG)}
      ${statusBar()}

      ${ghostNum(W-100, 44, '↗', 90, '#D9D0C5')}

      ${txt(20, 56, 'INVOICES', 11, MUTED, {bold:true, ls:2})}
      ${txt(20, 74, 'April', 30, TEXT, {bold:true, serif:true})}

      <!-- Summary row -->
      ${rect(20, 120, (W-52)/2, 64, SURFACE, {r:10, stroke:GREENLT, sw:1.5})}
      ${txt(32, 128, 'COLLECTED', 9, GREEN, {bold:true, ls:1.5})}
      ${txt(32, 148, totalPaid, 22, GREEN, {bold:true})}

      ${rect(20+(W-52)/2+12, 120, (W-52)/2, 64, SURFACE, {r:10, stroke:AMBERLT, sw:1.5})}
      ${txt(32+(W-52)/2+12, 128, 'OUTSTANDING', 9, AMBER, {bold:true, ls:1.5})}
      ${txt(32+(W-52)/2+12, 148, totalOut, 22, AMBER, {bold:true})}

      <!-- Filter -->
      ${badge(20, 202, 'All', ACCENT, SURFACE, {h:26, fs:10, pad:14, w:46})}
      ${badge(74, 202, 'Pending', SURFACE, MUTED, {h:26, fs:10, pad:14, w:68})}
      ${badge(150, 202, 'Paid', SURFACE, MUTED, {h:26, fs:10, pad:14, w:52})}
      ${badge(210, 202, 'Draft', SURFACE, MUTED, {h:26, fs:10, pad:14, w:52})}

      ${rows}

      ${navBar(2)}
    </svg>
  `;
}

// ── Screen 4: Earnings ─────────────────────────────────────────────────────────
function screen4() {
  const months = [
    {l:'Oct',v:8400},
    {l:'Nov',v:11200},
    {l:'Dec',v:6800},
    {l:'Jan',v:9600},
    {l:'Feb',v:13800},
    {l:'Mar',v:10400},
    {l:'Apr',v:12400,active:true},
  ];

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      ${rect(0,0,W,H,BG)}
      ${statusBar()}

      ${txt(20, 56, 'EARNINGS', 11, MUTED, {bold:true, ls:2})}
      ${txt(20, 74, 'Apr 2026', 30, TEXT, {bold:true, serif:true})}

      <!-- Hero earnings -->
      ${txt(20, 124, '$12,400', 48, TEXT, {bold:true, serif:true})}
      ${txt(20, 178, 'earned this month', 13, MUTED, {italic:true, serif:true})}

      <!-- Goal progress -->
      ${rect(20, 204, W-40, 60, SURFACE, {r:10, stroke:BORDER, sw:1})}
      ${txt(34, 212, 'Monthly Goal', 11, MUTED)}
      ${txt(W-34, 212, '78%', 11, ACCENT, {bold:true, align:'right', w:0})}
      ${progBar(34, 232, W-68, 8, 78, ACCENT)}
      ${txt(34, 248, '$12,400 of $16,000', 10, MUTED)}

      <!-- Bar chart -->
      ${rect(20, 278, W-40, 200, SURFACE, {r:12, stroke:BORDER, sw:1})}
      ${txt(34, 286, 'Monthly overview', 12, TEXT, {bold:true})}
      ${barChart(34, 296, W-68, 170, months, ACCENT, SURFACE2)}

      <!-- Breakdown -->
      ${rect(20, 490, (W-52)/2, 84, SURFACE, {r:10, stroke:BORDER, sw:1})}
      ${txt(34, 500, 'Client Work', 10, MUTED, {ls:1})}
      ${txt(34, 522, '$9,600', 22, TEXT, {bold:true})}
      ${txt(34, 550, '78% of total', 10, MUTED)}

      ${rect(20+(W-52)/2+12, 490, (W-52)/2, 84, SURFACE, {r:10, stroke:BORDER, sw:1})}
      ${txt(34+(W-52)/2+12, 500, 'Licensing', 10, MUTED, {ls:1})}
      ${txt(34+(W-52)/2+12, 522, '$2,800', 22, TEXT, {bold:true})}
      ${txt(34+(W-52)/2+12, 550, '22% of total', 10, MUTED)}

      ${navBar(3)}
    </svg>
  `;
}

// ── Screen 5: Focus ────────────────────────────────────────────────────────────
function screen5() {
  const ARC_CX = W/2, ARC_CY = 330, ARC_R = 120;
  const pct = 0.68; // 68% remaining = 24:35 of 36 min
  const angle = pct * 2 * Math.PI;
  const startX = ARC_CX;
  const startY = ARC_CY - ARC_R;
  const endX   = ARC_CX + ARC_R * Math.sin(angle);
  const endY   = ARC_CY - ARC_R * Math.cos(angle);
  const large  = pct > 0.5 ? 1 : 0;

  const trackPath   = `M ${startX},${startY} A ${ARC_R},${ARC_R} 0 1 1 ${startX-0.01},${startY}`;
  const arcPath     = `M ${startX},${startY} A ${ARC_R},${ARC_R} 0 ${large} 1 ${endX.toFixed(2)},${endY.toFixed(2)}`;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      ${rect(0,0,W,H,BG)}
      ${statusBar()}

      ${txt(20, 56, 'FOCUS', 11, MUTED, {bold:true, ls:2})}
      ${txt(20, 74, 'Deep work', 30, TEXT, {bold:true, serif:true})}

      <!-- Session pills -->
      ${badge(20, 126, '✓ Session 1', GREENLT, GREEN, {h:26, fs:10, pad:12, w:90})}
      ${badge(118, 126, '✓ Session 2', GREENLT, GREEN, {h:26, fs:10, pad:12, w:90})}
      ${badge(216, 126, '● Running', ACCENTLT, ACCENT, {h:26, fs:10, pad:12, w:80})}

      <!-- Current project card -->
      ${rect(20, 168, W-40, 54, SURFACE, {r:10, stroke:BORDER, sw:1})}
      ${txt(36, 176, 'NOW WORKING ON', 9, MUTED, {bold:true, ls:2})}
      ${txt(36, 196, 'Neon Web Redesign', 15, TEXT, {bold:true})}
      ${badge(W-40, 182, 'Web', SURFACE2, MUTED, {h:18, fs:9, pad:8, w:40})}

      <!-- Big circular timer -->
      <path d="${trackPath}" fill="none" stroke="${SURFACE2}" stroke-width="12"/>
      <path d="${arcPath}" fill="none" stroke="${ACCENT}" stroke-width="12" stroke-linecap="round"/>

      ${txt(W/2, ARC_CY-28, '24:35', 52, TEXT, {bold:true, serif:true, align:'center', w:0})}
      ${txt(W/2, ARC_CY+4, 'remaining', 12, MUTED, {italic:true, serif:true, align:'center', w:0})}
      ${txt(W/2, ARC_CY+24, 'of 36 min', 11, MUTED, {align:'center', w:0})}

      <!-- Controls -->
      ${circle(W/2 - 56, 488, 30, SURFACE, 1, BORDER, 1.5)}
      ${txt(W/2 - 56, 477, '↺', 22, MUTED, {align:'center', w:0})}

      ${circle(W/2, 488, 38, ACCENT)}
      ${txt(W/2, 474, '⏸', 22, SURFACE, {align:'center', w:0})}

      ${circle(W/2 + 56, 488, 30, SURFACE, 1, BORDER, 1.5)}
      ${txt(W/2 + 56, 477, '⏭', 20, MUTED, {align:'center', w:0})}

      <!-- Stats -->
      ${rect(20, 548, (W-52)/2, 60, SURFACE, {r:10, stroke:BORDER, sw:1})}
      ${txt(34, 558, 'FOCUS TODAY', 9, MUTED, {bold:true, ls:1.5})}
      ${txt(34, 578, '3h 15m', 18, TEXT, {bold:true})}

      ${rect(20+(W-52)/2+12, 548, (W-52)/2, 60, SURFACE, {r:10, stroke:BORDER, sw:1})}
      ${txt(34+(W-52)/2+12, 558, 'SESSIONS', 9, MUTED, {bold:true, ls:1.5})}
      ${txt(34+(W-52)/2+12, 578, '3 total', 18, TEXT, {bold:true})}

      ${navBar(4)}
    </svg>
  `;
}

// ── Assemble pen file ─────────────────────────────────────────────────────────
const screens = [
  { id: 's1', name: 'Today',    svg: screen1() },
  { id: 's2', name: 'Projects', svg: screen2() },
  { id: 's3', name: 'Invoices', svg: screen3() },
  { id: 's4', name: 'Earnings', svg: screen4() },
  { id: 's5', name: 'Focus',    svg: screen5() },
];

const pen = {
  version: '2.8',
  meta: {
    title:       'BALM — Calm clarity for creative freelancers',
    description: 'A warm, light-themed freelance studio OS. Editorial date anchors, earthy terracotta/sage palette, and calm financial clarity. Inspired by Cushion App (darkmodedesign.com) and Awwwards editorial typography trend.',
    author:      'RAM Design Heartbeat',
    created:     new Date().toISOString(),
    theme:       'light',
    palette: {
      background: BG,
      surface:    SURFACE,
      text:       TEXT,
      accent:     ACCENT,
      accent2:    GREEN,
      muted:      MUTED,
    },
  },
  artboards: screens.map(s => ({
    id:     s.id,
    name:   s.name,
    width:  W,
    height: H,
    layers: [{
      id:      s.id + '_layer',
      name:    'Design',
      visible: true,
      locked:  false,
      type:    'svg',
      content: s.svg,
    }],
  })),
};

const outPath = path.join(__dirname, 'balm.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2), 'utf8');
console.log(`✓ balm.pen written (${(fs.statSync(outPath).size/1024).toFixed(1)} KB)`);
console.log(`  Screens: ${screens.map(s=>s.name).join(', ')}`);
