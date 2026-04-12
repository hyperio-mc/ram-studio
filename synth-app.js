'use strict';
const fs = require('fs'), path = require('path');

const SLUG = 'synth';
const W = 390, H = 844;

// ── Palette ─────────────────────────────────────────────────────────────────
const BG     = '#0B0C14';
const SURF   = '#12131F';
const CARD   = '#1A1C2E';
const CARD2  = '#1F2138';
const ACC    = '#7C5CFC';  // AI purple
const ACC2   = '#22D3EE';  // electric cyan
const ACC3   = '#F472B6';  // hot pink accent
const TEXT   = '#E8E5FF';
const MUTED  = '#8B87C4';
const GREEN  = '#34D399';
const AMBER  = '#FBBF24';
const RED    = '#F87171';
const BORDER = '#2A2C45';

let elements = [];
let totalEl = 0;

function rect(x,y,w,h,fill,opts={}) {
  const el = { type:'rect', x, y, width:w, height:h, fill,
    rx: opts.rx||0, opacity: opts.opacity||1,
    stroke: opts.stroke||'none', strokeWidth: opts.sw||0 };
  elements.push(el); totalEl++; return el;
}
function text(x,y,content,size,fill,opts={}) {
  const el = { type:'text', x, y, content: String(content), fontSize: size, fill,
    fontWeight: opts.fw||'400', fontFamily: opts.font||'Inter, system-ui, sans-serif',
    textAnchor: opts.anchor||'start', letterSpacing: opts.ls||'0',
    opacity: opts.opacity||1 };
  elements.push(el); totalEl++; return el;
}
function circle(cx,cy,r,fill,opts={}) {
  const el = { type:'circle', cx, cy, r, fill, opacity: opts.opacity||1,
    stroke: opts.stroke||'none', strokeWidth: opts.sw||0 };
  elements.push(el); totalEl++; return el;
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  const el = { type:'line', x1, y1, x2, y2, stroke, strokeWidth: opts.sw||1,
    opacity: opts.opacity||1 };
  elements.push(el); totalEl++; return el;
}

const screens = [];
function startScreen(name) { elements = []; }
function endScreen(name) {
  screens.push({ name, svg: '', elements: [...elements] });
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function statusDot(x, y, color) {
  circle(x, y, 4, color);
  circle(x, y, 7, color, { opacity: 0.2 });
}

function pill(x, y, w, h, fill, label, labelColor, opts={}) {
  rect(x, y, w, h, fill, { rx: h/2, opacity: opts.opacity||1 });
  text(x + w/2, y + h/2 + 5, label, 10, labelColor, { fw:'600', anchor:'middle' });
}

function waveBar(x, y, w, h, fill, opts={}) {
  rect(x, y - h, w, h, fill, { rx: 2, opacity: opts.opacity||1 });
}

function miniSparkLine(baseX, baseY, vals, color, scaleY=30) {
  const step = 6;
  for (let i = 0; i < vals.length-1; i++) {
    const x1 = baseX + i*step;
    const y1 = baseY - vals[i]*scaleY;
    const x2 = baseX + (i+1)*step;
    const y2 = baseY - vals[i+1]*scaleY;
    line(x1, y1, x2, y2, color, { sw: 1.5 });
  }
}

function progressBar(x, y, totalW, h, pct, fillColor, bg=CARD2) {
  rect(x, y, totalW, h, bg, { rx: h/2 });
  if (pct > 0) rect(x, y, totalW * pct, h, fillColor, { rx: h/2 });
}

function card(x, y, w, h, opts={}) {
  rect(x, y, w, h, CARD, { rx: opts.rx||12, stroke: BORDER, sw: 1, opacity: opts.opacity||1 });
}

function statusBar() {
  rect(0, 0, W, 44, BG);
  text(16, 27, '9:41', 14, TEXT, { fw:'600' });
  // battery
  rect(350, 17, 24, 12, 'none', { rx: 3, stroke: MUTED, sw: 1.5 });
  rect(374, 20, 3, 6, MUTED, { rx: 1.5 });
  rect(351.5, 18.5, 18, 9, MUTED, { rx: 2 });
  // signal dots
  for (let i=0;i<3;i++) circle(325+i*6, 23, 2, MUTED);
  // wifi
  for (let i=0;i<3;i++) rect(338+i*3, 21+(2-i)*3, 2, (i+1)*3, MUTED, { rx:1 });
}

function navBar(activeIdx) {
  rect(0, H-80, W, 80, SURF);
  line(0, H-80, W, H-80, BORDER, { sw:1 });
  const tabs = [
    { label:'Home', icon:'grid' },
    { label:'Calls', icon:'phone' },
    { label:'Insights', icon:'chart' },
    { label:'Profile', icon:'user' },
  ];
  const tw = W/4;
  tabs.forEach((t,i) => {
    const cx = i*tw + tw/2;
    const active = i === activeIdx;
    const col = active ? ACC : MUTED;
    // icon box
    if (active) rect(cx-18, H-72, 36, 28, ACC, { rx:8, opacity:0.15 });
    // simple icon approximation
    if (t.icon==='grid') {
      [[0,0],[1,0],[0,1],[1,1]].forEach(([dx,dy]) =>
        rect(cx-7+dx*9, H-65+dy*9, 7, 7, col, { rx:2 })
      );
    } else if (t.icon==='phone') {
      circle(cx, H-55, 7, col, { opacity:0.8 });
      rect(cx-3, H-50, 6, 5, col, { rx:1 });
    } else if (t.icon==='chart') {
      [8,14,10,6].forEach((h2,j) => rect(cx-14+j*8, H-50-h2/2, 6, h2, col, { rx:2 }));
    } else if (t.icon==='user') {
      circle(cx, H-62, 6, col);
      // arc approximation
      rect(cx-8, H-54, 16, 8, col, { rx:8 });
    }
    text(cx, H-22, t.label, 10, col, { anchor:'middle', fw: active?'600':'400' });
  });
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Dashboard
// ════════════════════════════════════════════════════════════════════════════
startScreen('Dashboard');
rect(0, 0, W, H, BG); // bg
statusBar();

// Header
text(16, 70, 'SYNTH', 22, TEXT, { fw:'700', ls:'3' });
text(16, 90, 'Voice Intelligence', 12, MUTED);
// avatar/icon top right
rect(W-52, 58, 36, 36, CARD2, { rx:18, stroke: ACC, sw:1.5 });
circle(W-34, 71, 6, ACC, { opacity:0.8 });
rect(W-44, 78, 20, 8, ACC, { rx:4, opacity:0.5 });

// AI Health Score — large hero metric
rect(16, 108, W-32, 88, 'none', {});  // spacer
// gradient card effect via layered rects
rect(16, 108, W-32, 88, CARD, { rx:16, stroke: BORDER, sw:1 });
rect(16, 108, 140, 88, ACC, { rx:16, opacity:0.06 });
// AI orb
circle(54, 152, 28, ACC, { opacity:0.12 });
circle(54, 152, 20, ACC, { opacity:0.2 });
circle(54, 152, 12, ACC, { opacity:0.7 });
// sparkle lines
for (let a=0; a<8; a++) {
  const angle = (a/8)*Math.PI*2;
  const r1=15, r2=22;
  line(
    54+Math.cos(angle)*r1, 152+Math.sin(angle)*r1,
    54+Math.cos(angle)*r2, 152+Math.sin(angle)*r2,
    ACC, { sw:1.5, opacity:0.5 }
  );
}
text(100, 138, 'AI Health Score', 11, MUTED);
text(100, 162, '94.2', 32, TEXT, { fw:'700' });
text(100, 180, '/ 100', 12, MUTED);
// trend pill
pill(248, 126, 58, 22, GREEN, '▲ +3.1', BG, { opacity:0.9 });
text(248, 170, 'Excellent', 11, GREEN);

// 3-column mini stats
const stats = [
  { label:'Calls Today', val:'2,847', sub:'+12%', col:ACC2 },
  { label:'Avg Duration', val:'3:42', sub:'−0:08', col:AMBER },
  { label:'Sentiment', val:'78%', sub:'Positive', col:GREEN },
];
stats.forEach((s,i) => {
  const x = 16 + i*(W-32)/3;
  const w2 = (W-32)/3 - 6;
  card(x, 208, w2, 76, { rx:12 });
  text(x+10, 225, s.label, 9, MUTED);
  text(x+10, 250, s.val, 18, TEXT, { fw:'700' });
  text(x+10, 266, s.sub, 10, s.col);
});

// Call Volume chart
card(16, 296, W-32, 140, { rx:14 });
text(28, 316, 'Call Volume', 12, TEXT, { fw:'600' });
text(28, 332, 'Last 7 days', 10, MUTED);
// bars
const volData = [42,68,55,80,73,91,84];
const days = ['M','T','W','T','F','S','S'];
const barW = 28, barMaxH = 70, barBase = 420;
volData.forEach((v,i) => {
  const bx = 28 + i*48;
  const bh = (v/100)*barMaxH;
  const isToday = i===6;
  rect(bx, barBase-bh, barW, bh, isToday ? ACC : CARD2, { rx:6 });
  if (isToday) {
    rect(bx, barBase-bh, barW, bh, ACC, { rx:6, opacity:0.3 });
    rect(bx, barBase-bh, barW, 4, ACC2, { rx:2 });
  }
  text(bx+barW/2, barBase+14, days[i], 9, isToday?ACC2:MUTED, { anchor:'middle' });
});

// Live calls row
card(16, 448, W-32, 72, { rx:12 });
statusDot(36, 480, GREEN);
text(50, 476, 'Live Now', 12, TEXT, { fw:'600' });
text(50, 492, '23 active calls', 10, MUTED);
pill(W-68, 462, 44, 24, ACC, 'Monitor', TEXT);

// Top topics
card(16, 532, W-32, 148, { rx:14 });
text(28, 552, 'Top Topics', 12, TEXT, { fw:'600' });
text(28, 568, 'This hour', 10, MUTED);
const topics = [
  { name:'Billing Questions', pct:0.68, col:ACC },
  { name:'Tech Support', pct:0.52, col:ACC2 },
  { name:'Cancellations', pct:0.31, col:ACC3 },
  { name:'New Features', pct:0.22, col:AMBER },
];
topics.forEach((t,i) => {
  text(28, 590+i*26, t.name, 11, TEXT);
  text(W-40, 590+i*26, Math.round(t.pct*100)+'%', 11, t.col, { anchor:'end', fw:'600' });
  progressBar(28, 596+i*26, W-72, 4, t.pct, t.col);
});

navBar(0);
endScreen('Dashboard');

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Call List
// ════════════════════════════════════════════════════════════════════════════
startScreen('Call List');
rect(0, 0, W, H, BG);
statusBar();

// Header
text(16, 68, 'Recent Calls', 20, TEXT, { fw:'700' });
text(16, 88, 'Today — 2,847 calls', 12, MUTED);
// filter chips
const chips = ['All', 'Flagged', 'Positive', 'Negative'];
chips.forEach((c,i) => {
  const cx = 16 + i*82;
  const active = i===0;
  rect(cx, 100, 74, 26, active ? ACC : CARD, { rx:13, stroke: active?'none':BORDER, sw:1 });
  text(cx+37, 118, c, 11, active?TEXT:MUTED, { anchor:'middle', fw:active?'600':'400' });
});

// Call cards
const calls = [
  { id:'#8842', name:'Sarah Mitchell', dur:'4:23', sentiment:0.91, topic:'Billing', status:'resolved', score:94 },
  { id:'#8841', name:'James Chen', dur:'7:11', sentiment:0.42, topic:'Tech Support', status:'escalated', score:38 },
  { id:'#8840', name:'Maria Santos', dur:'2:56', sentiment:0.83, topic:'New Feature', status:'resolved', score:87 },
  { id:'#8839', name:'David Park', dur:'1:34', sentiment:0.65, topic:'General', status:'callback', score:65 },
  { id:'#8838', name:'Emma Wilson', dur:'5:48', sentiment:0.28, topic:'Cancellation', status:'flagged', score:22 },
];
calls.forEach((c,i) => {
  const y = 140+i*118;
  card(16, y, W-32, 108, { rx:14 });
  // avatar
  circle(50, y+38, 18, CARD2);
  text(50, y+44, c.name.charAt(0), 14, ACC, { anchor:'middle', fw:'700' });
  // name + id
  text(76, y+32, c.name, 13, TEXT, { fw:'600' });
  text(76, y+48, `${c.id} · ${c.dur}`, 10, MUTED);
  // sentiment arc visual
  const sentCol = c.sentiment > 0.7 ? GREEN : c.sentiment > 0.5 ? AMBER : RED;
  const statusLabel = c.status === 'escalated' ? 'Escalated' : c.status === 'flagged' ? 'Flagged' : c.status === 'callback' ? 'Callback' : 'Resolved';
  const statusCol = c.status==='resolved' ? GREEN : c.status==='escalated' ? RED : c.status==='flagged' ? ACC3 : AMBER;
  pill(W-88, y+24, 68, 20, statusCol, statusLabel, BG, { opacity:0.9 });
  // topic tag
  rect(76, y+62, 70, 20, CARD2, { rx:10 });
  text(111, y+76, c.topic, 9, MUTED, { anchor:'middle' });
  // sentiment bar
  text(16+8, y+88, 'Sentiment', 9, MUTED);
  progressBar(76, y+86, 180, 5, c.sentiment, sentCol);
  text(W-28, y+91, Math.round(c.sentiment*100)+'%', 9, sentCol, { anchor:'end', fw:'600' });
  // mini waveform sketch
  for (let b=0; b<20; b++) {
    const bh2 = 3 + Math.sin(b*0.8+c.score)*3 + Math.random()*4;
    // deterministic using score as seed
    const bh3 = 3 + (Math.sin(b*0.8+c.score)*3 + ((b*c.score)%7))*0.8;
    rect(W-48+b*2, y+60-bh3/2, 1.5, bh3, sentCol, { rx:1, opacity:0.5 });
  }
});

navBar(1);
endScreen('Call List');

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Call Detail / Waveform
// ════════════════════════════════════════════════════════════════════════════
startScreen('Call Detail');
rect(0, 0, W, H, BG);
statusBar();

// Back arrow + title
text(16, 68, '←', 18, MUTED);
text(50, 70, 'Call #8842', 16, TEXT, { fw:'700' });
text(50, 88, 'Sarah Mitchell · 4:23', 11, MUTED);
// share icon
rect(W-44, 56, 32, 32, CARD, { rx:10, stroke:BORDER, sw:1 });
text(W-28, 76, '↗', 16, MUTED, { anchor:'middle' });

// Waveform visualization card
card(16, 100, W-32, 130, { rx:16 });
// decorative gradient orbs behind waveform
circle(120, 165, 50, ACC, { opacity:0.07 });
circle(280, 165, 40, ACC2, { opacity:0.07 });
// waveform bars — two-color for agent vs customer
text(28, 120, 'Waveform', 11, MUTED);
text(W-28, 120, '2:14 / 4:23', 11, MUTED, { anchor:'end' });
const wfData = [6,10,18,12,22,28,34,26,30,22,18,12,8,14,24,32,28,20,16,10,14,20,28,24,18,12,16,22,30,26,20,14,10,8,12,18,24,20,14,10,6,10,14,18,22,26,20,16,12,8];
wfData.forEach((v,i) => {
  const isAgent = i%3!==0;
  const played = i < 27;
  rect(28+i*6.5, 162-v/2, 4, v, 
    played ? (isAgent ? ACC : ACC2) : CARD2, 
    { rx:2, opacity: played ? 0.9 : 0.4 }
  );
});
// play controls
circle(W/2, 204, 20, ACC);
text(W/2+1, 211, '▐▐', 12, TEXT, { anchor:'middle' });
text(W/2-50, 211, '◀◀', 14, MUTED, { anchor:'middle' });
text(W/2+50, 211, '▶▶', 14, MUTED, { anchor:'middle' });

// Sentiment timeline
card(16, 242, W-32, 88, { rx:14 });
text(28, 262, 'Sentiment Flow', 12, TEXT, { fw:'600' });
const sentFlow = [0.6,0.65,0.72,0.78,0.82,0.75,0.85,0.91,0.88,0.92,0.89,0.95];
const sfW = (W-80)/sentFlow.length;
sentFlow.forEach((v,i) => {
  const x = 28+i*sfW;
  const y = 310 - v*40;
  const col = v > 0.8 ? GREEN : v > 0.65 ? AMBER : RED;
  if (i>0) line(28+(i-1)*sfW, 310-sentFlow[i-1]*40, x, y, col, { sw:2 });
  circle(x, y, 3, col);
});
text(28, 322, 'Improving', 10, GREEN);
text(W-28, 322, '↗ +31% lift', 10, GREEN, { anchor:'end', fw:'600' });

// AI Transcript
card(16, 342, W-32, 334, { rx:14 });
text(28, 362, 'AI Transcript', 12, TEXT, { fw:'600' });
pill(W-80, 352, 56, 22, GREEN, 'Resolved', BG);

const transcript = [
  { speaker:'Agent', time:'0:04', msg:'Hello, thank you for calling Synth Support. How can I help you today?', col:ACC },
  { speaker:'Sarah', time:'0:12', msg:'Hi, I have a question about my billing statement from last month.', col:TEXT },
  { speaker:'Agent', time:'0:22', msg:'Of course! I can see your account. I notice a one-time charge — let me explain that.', col:ACC },
  { speaker:'Sarah', time:'0:38', msg:'Oh, that makes sense. Can you also check if my plan includes analytics?', col:TEXT },
  { speaker:'Agent', time:'0:52', msg:"Absolutely! Your Pro plan includes full analytics access. I'll enable it now.", col:ACC },
];
transcript.forEach((t,i) => {
  const ty = 382+i*54;
  const isAgent = t.speaker==='Agent';
  if (isAgent) {
    rect(28, ty, 10, 10, ACC, { rx:5 });
    text(44, ty+9, t.speaker, 9, ACC, { fw:'600' });
  } else {
    rect(28, ty, 10, 10, CARD2, { rx:5, stroke:MUTED, sw:1 });
    text(44, ty+9, t.speaker, 9, MUTED, { fw:'600' });
  }
  text(W-28, ty+9, t.time, 9, MUTED, { anchor:'end' });
  // message text (word-wrap simulation)
  const words = t.msg.split(' ');
  let line1 = '', line2 = '';
  words.forEach(w => {
    if ((line1+w).length < 42) line1 += (line1?' ':'')+w;
    else line2 += (line2?' ':'')+w;
  });
  text(28, ty+24, line1, 11, TEXT, { opacity:0.85 });
  if (line2) text(28, ty+38, line2, 11, TEXT, { opacity:0.85 });
});

navBar(1);
endScreen('Call Detail');

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Analytics Bento
// ════════════════════════════════════════════════════════════════════════════
startScreen('Analytics');
rect(0, 0, W, H, BG);
statusBar();

text(16, 68, 'Analytics', 20, TEXT, { fw:'700' });
text(16, 88, 'Last 30 days', 12, MUTED);

// Time range chips
['7d','30d','90d'].forEach((t,i) => {
  const active = i===1;
  rect(W-130+i*40, 58, 34, 24, active?ACC:CARD, { rx:12, stroke:active?'none':BORDER, sw:1 });
  text(W-113+i*40, 75, t, 10, active?TEXT:MUTED, { anchor:'middle', fw:active?'600':'400' });
});

// Bento grid — 4 cells top
// Cell 1: Resolution rate (tall)
card(16, 104, 114, 120, { rx:14 });
text(24, 124, 'Resolution', 10, MUTED);
text(24, 140, 'Rate', 10, MUTED);
text(24, 172, '87%', 28, TEXT, { fw:'700' });
progressBar(24, 185, 90, 6, 0.87, ACC);
text(24, 202, '▲ +4.2%', 10, GREEN);

// Cell 2: Avg Handle Time
card(138, 104, 100, 56, { rx:14 });
text(148, 122, 'Avg Handle', 10, MUTED);
text(148, 142, '3:42', 18, TEXT, { fw:'700' });
text(148, 156, '-0:08 this week', 9, ACC2);

// Cell 3: Escalation Rate
card(246, 104, 128, 56, { rx:14 });
text(256, 122, 'Escalation', 10, MUTED);
text(256, 142, '4.8%', 18, RED, { fw:'700' });
text(256, 156, 'improving', 9, GREEN);

// Cell 4: Customer Effort
card(138, 168, 236, 56, { rx:14 });
text(148, 186, 'Customer Effort Score', 10, MUTED);
text(148, 207, '2.1 / 5', 20, TEXT, { fw:'700' });
progressBar(260, 193, 96, 6, 0.42, AMBER);

// Sentiment trend chart
card(16, 236, W-32, 140, { rx:14 });
text(28, 256, 'Sentiment Trend', 12, TEXT, { fw:'600' });
// Grid lines
for (let g=0; g<4; g++) {
  line(28, 280+g*22, W-28, 280+g*22, BORDER, { sw:1, opacity:0.5 });
}
// Positive line
const posData = [0.72,0.74,0.73,0.76,0.78,0.77,0.80,0.82,0.81,0.83,0.85,0.84,0.87,0.88];
const negData = [0.15,0.14,0.16,0.13,0.12,0.14,0.11,0.10,0.12,0.09,0.08,0.10,0.07,0.08];
const chartW = W-80, chartH = 60, chartBaseY = 348;
posData.forEach((v,i) => {
  if (i===0) return;
  const x1 = 28+(i-1)*chartW/(posData.length-1);
  const y1 = chartBaseY-posData[i-1]*chartH;
  const x2 = 28+i*chartW/(posData.length-1);
  const y2 = chartBaseY-v*chartH;
  line(x1,y1,x2,y2,GREEN,{ sw:2 });
});
negData.forEach((v,i) => {
  if (i===0) return;
  const x1 = 28+(i-1)*chartW/(negData.length-1);
  const y1 = chartBaseY-negData[i-1]*chartH;
  const x2 = 28+i*chartW/(negData.length-1);
  const y2 = chartBaseY-v*chartH;
  line(x1,y1,x2,y2,RED,{ sw:2 });
});
// Legend
circle(28, 370, 4, GREEN);
text(36, 374, 'Positive', 9, GREEN);
circle(88, 370, 4, RED);
text(96, 374, 'Negative', 9, RED);

// Topic distribution
card(16, 388, W-32, 120, { rx:14 });
text(28, 408, 'Topic Distribution', 12, TEXT, { fw:'600' });
const topicDist = [
  { name:'Billing', pct:0.34, col:ACC },
  { name:'Support', pct:0.28, col:ACC2 },
  { name:'Cancels', pct:0.18, col:ACC3 },
  { name:'Features', pct:0.12, col:AMBER },
  { name:'Other', pct:0.08, col:MUTED },
];
let cumX = 28;
topicDist.forEach(t => {
  const bw = t.pct*(W-56);
  rect(cumX, 422, bw-2, 20, t.col, { rx:4 });
  cumX += bw;
});
topicDist.forEach((t,i) => {
  const col2 = i<3 ? t.col : i===3 ? AMBER : MUTED;
  circle(28+i*70, 458, 4, col2);
  text(36+i*70, 462, t.name, 9, MUTED);
  text(36+i*70, 474, Math.round(t.pct*100)+'%', 9, col2, { fw:'600' });
});

// Coach score card
card(16, 520, W-32, 80, { rx:14 });
circle(44, 560, 20, ACC, { opacity:0.15 });
circle(44, 560, 12, ACC, { opacity:0.4 });
text(44, 565, '✦', 12, ACC, { anchor:'middle' });
text(72, 548, 'AI Coach Score', 12, TEXT, { fw:'600' });
text(72, 564, '92 / 100 — Above benchmark', 11, MUTED);
progressBar(72, 572, 248, 5, 0.92, ACC);
pill(W-72, 526, 48, 24, ACC, '▲ Top 8%', TEXT, { opacity:0.9 });

navBar(2);
endScreen('Analytics');

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — AI Insights
// ════════════════════════════════════════════════════════════════════════════
startScreen('AI Insights');
rect(0, 0, W, H, BG);
statusBar();

text(16, 68, 'AI Insights', 20, TEXT, { fw:'700' });
text(16, 88, 'Generated · Apr 11, 2026', 12, MUTED);

// Anomaly alert card
rect(16, 104, W-32, 80, 'none', {});
rect(16, 104, W-32, 80, RED, { rx:14, opacity:0.1 });
rect(16, 104, W-32, 80, 'none', { rx:14, stroke:RED, sw:1 });
circle(40, 144, 14, RED, { opacity:0.2 });
text(40, 149, '⚠', 14, RED, { anchor:'middle' });
text(62, 124, 'Anomaly Detected', 13, RED, { fw:'700' });
text(62, 140, 'Cancellation intent spiked 340%', 11, TEXT);
text(62, 156, 'Tue 14:00–16:00 · 89 affected calls', 10, MUTED);
pill(W-72, 112, 48, 24, RED, 'Review', TEXT, { opacity:0.85 });

// Insight cards
const insights = [
  {
    type:'TREND',
    col: ACC2,
    title:'Billing clarity improving',
    body:'After last month\'s script update, billing call resolution rate rose from 71% to 87%.',
    metric:'87%', metricLabel:'Resolution',
    impact:'High',
  },
  {
    type:'COACHING',
    col: ACC,
    title:'Agent ID 4421 flagged',
    body:'Below-average empathy score across 234 calls. Recommend coaching session on tone.',
    metric:'58%', metricLabel:'Empathy',
    impact:'Medium',
  },
  {
    type:'OPPORTUNITY',
    col: AMBER,
    title:'Upsell signal detected',
    body:'143 customers asked about analytics features — none were offered a plan upgrade.',
    metric:'$4.2K', metricLabel:'Est. Revenue',
    impact:'High',
  },
];
insights.forEach((ins,i) => {
  const y = 196+i*168;
  card(16, y, W-32, 158, { rx:14 });
  // colored left strip
  rect(16, y, 4, 158, ins.col, { rx:2 });
  // type badge
  rect(28, y+14, 60, 18, ins.col, { rx:9, opacity:0.2 });
  text(58, y+27, ins.type, 9, ins.col, { anchor:'middle', fw:'700', ls:'1' });
  // impact
  const impCol = ins.impact==='High' ? RED : AMBER;
  pill(W-76, y+12, 52, 20, impCol, ins.impact, BG, { opacity:0.85 });
  text(28, y+50, ins.title, 13, TEXT, { fw:'600' });
  // body text 2 lines
  const bwords = ins.body.split(' ');
  let l1='', l2='', l3='';
  bwords.forEach(w => {
    if ((l1+w).length<40) l1+=(l1?'':'')+w+(bwords.indexOf(w)<bwords.length-1?' ':'');
    else if ((l2+w).length<40) l2+=(l2?'':'')+w+(bwords.indexOf(w)<bwords.length-1?' ':'');
    else l3+=(l3?'':'')+w+(bwords.indexOf(w)<bwords.length-1?' ':'');
  });
  text(28, y+68, ins.body.substring(0,48), 11, MUTED);
  text(28, y+84, ins.body.substring(48,96), 11, MUTED);
  // Metric
  circle(48, y+118, 22, ins.col, { opacity:0.12 });
  text(48, y+123, ins.metric, 14, ins.col, { anchor:'middle', fw:'700' });
  text(48, y+137, ins.metricLabel, 9, MUTED, { anchor:'middle' });
  // action
  pill(W-96, y+108, 72, 28, ins.col, 'View →', BG, { opacity:0.9 });
  // mini sparkline
  const spk = [0.3,0.5,0.6,0.55,0.7,0.75,0.8,0.78,0.85];
  miniSparkLine(110, y+130, spk, ins.col, 16);
});

navBar(2);
endScreen('AI Insights');

// ════════════════════════════════════════════════════════════════════════════
// SCREEN 6 — Integrations / Settings
// ════════════════════════════════════════════════════════════════════════════
startScreen('Integrations');
rect(0, 0, W, H, BG);
statusBar();

text(16, 68, 'Profile & Setup', 18, TEXT, { fw:'700' });
text(16, 88, 'Workspace: Synth Labs', 12, MUTED);

// Profile card
card(16, 104, W-32, 80, { rx:16 });
// avatar
rect(28, 118, 48, 48, CARD2, { rx:24 });
circle(52, 142, 20, ACC, { opacity:0.3 });
text(52, 148, 'JD', 14, ACC, { anchor:'middle', fw:'700' });
// online indicator
circle(68, 124, 6, GREEN);
text(86, 132, 'Jordan Davis', 14, TEXT, { fw:'600' });
text(86, 148, 'Admin · Pro Plan', 11, MUTED);
pill(W-76, 118, 52, 24, ACC, 'Upgrade', TEXT);

// Integrations
text(16, 200, 'Connected Integrations', 13, TEXT, { fw:'600' });
const integrations = [
  { name:'Salesforce CRM', sub:'2,847 contacts synced', status:'Active', col:ACC2 },
  { name:'Zendesk', sub:'Ticket creation enabled', status:'Active', col:GREEN },
  { name:'Slack', sub:'Alert channel: #synth-alerts', status:'Active', col:AMBER },
  { name:'Webhooks API', sub:'3 active endpoints', status:'Active', col:ACC },
  { name:'Zapier', sub:'12 automations running', status:'Active', col:ACC3 },
];
integrations.forEach((intg,i) => {
  const y = 218+i*68;
  card(16, y, W-32, 58, { rx:12 });
  // icon circle
  circle(44, y+29, 16, intg.col, { opacity:0.2 });
  text(44, y+34, intg.name.charAt(0), 12, intg.col, { anchor:'middle', fw:'700' });
  text(68, y+22, intg.name, 13, TEXT, { fw:'600' });
  text(68, y+38, intg.sub, 10, MUTED);
  statusDot(W-36, y+29, GREEN);
  text(W-24, y+33, intg.status, 10, GREEN, { anchor:'end' });
});

// AI Model settings
card(16, 566, W-32, 96, { rx:14 });
circle(44, 614, 20, ACC, { opacity:0.2 });
text(44, 619, '✦', 16, ACC, { anchor:'middle' });
text(70, 596, 'AI Model', 13, TEXT, { fw:'600' });
text(70, 612, 'Synth GPT-4o Voice · Fine-tuned', 11, MUTED);
// toggle on
rect(W-68, 594, 44, 24, ACC, { rx:12 });
circle(W-32, 606, 9, TEXT);
text(70, 628, 'Auto-coaching enabled', 11, MUTED);
// toggle on
rect(W-68, 620, 44, 24, ACC, { rx:12 });
circle(W-32, 632, 9, TEXT);

// Usage bar
card(16, 674, W-32, 72, { rx:14 });
text(28, 694, 'Monthly Usage', 12, TEXT, { fw:'600' });
text(28, 710, '2,847 / 5,000 calls used', 11, MUTED);
progressBar(28, 718, W-72, 6, 0.57, ACC);
text(W-28, 720, '57%', 10, ACC, { anchor:'end', fw:'600' });

navBar(3);
endScreen('Integrations');

// ════════════════════════════════════════════════════════════════════════════
// Write the .pen file
// ════════════════════════════════════════════════════════════════════════════
const pen = {
  version: '2.8',
  metadata: {
    name: 'SYNTH — Voice Intelligence',
    author: 'RAM',
    date: new Date().toISOString(),
    theme: 'dark',
    heartbeat: 42,
    elements: totalEl,
    palette: { BG, SURF, CARD, ACC, ACC2, ACC3, TEXT, MUTED },
    inspiration: 'Synthflow AI interactive demo playground (Godly.website) + layered dark aesthetic (Dark Mode Design)',
  },
  screens,
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`SYNTH: ${screens.length} screens, ${totalEl} elements`);
console.log(`Written: ${SLUG}.pen`);
