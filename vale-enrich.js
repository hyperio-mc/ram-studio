'use strict';
const fs   = require('fs');
const path = require('path');

// Load existing pen and enrich each screen with more elements
const penPath = path.join(__dirname, 'vale.pen');
const pen = JSON.parse(fs.readFileSync(penPath, 'utf8'));

const W = 390;
const C = {
  bg: '#FAF8F3', surf: '#FFFFFF', card: '#F2EDE4', card2: '#EAE3D8',
  ink: '#1C1510', ink2: '#6B5A4E', muted: '#B5A898', accent: '#4A3728',
  accentL: '#7A5C45', sage: '#7B9B6B', sageL: '#A8C99A', sand: '#D4C4B0',
  line: '#E6DDD1', red: '#C0392B', gold: '#B8860B',
};

function r(x,y,w,h,fill,rx,op) {
  const e = {type:'rect',x,y,width:w,height:h,fill};
  if (rx !== undefined) e.rx = rx;
  if (op !== undefined) e.opacity = op;
  return e;
}
function t(x,y,content,size,fill,fw,anchor,ls) {
  const e = {type:'text',x,y,content:String(content),fontSize:size,fill};
  if (fw) e.fontWeight = fw;
  if (anchor) e.textAnchor = anchor;
  if (ls !== undefined) e.letterSpacing = ls;
  return e;
}
function c(cx,cy,radius,fill,op) {
  const e = {type:'circle',cx,cy,r:radius,fill};
  if (op !== undefined) e.opacity = op;
  return e;
}
function l(x1,y1,x2,y2,stroke,sw,op) {
  const e = {type:'line',x1,y1,x2,y2,stroke,strokeWidth:sw||0.5};
  if (op !== undefined) e.opacity = op;
  return e;
}

// ── Enrich Screen 1 (Today) — add weekly sparkline + category pills ────────────
const s1 = pen.screens[0];
// Weekly spending mini sparkline area
const wkVals = [42, 18, 95, 0, 31, 84, 22];
const spY = 730; const spH = 30; const spW = (W - 64) / 6;
wkVals.forEach((v, i) => {
  const bh = (v / 100) * spH;
  s1.elements.push(r(32 + i * spW, spY + spH - bh, spW - 3, bh, i === 5 ? C.accent : C.sand, 2, 0.7));
});
['M','T','W','T','F','S','S'].forEach((d, i) => {
  s1.elements.push(t(32 + i * spW + spW/2, spY + spH + 14, d, 9, C.muted, 500, 'middle'));
});
s1.elements.push(t(32, spY - 14, 'This week', 10, C.muted, 600, null, 1));
// Add more tick marks + horizontal guide lines to the status area
for (let i = 0; i < 12; i++) {
  s1.elements.push(l(32 + i * 27, 170, 32 + i * 27, 174, C.line, 0.5, 0.3));
}
// Quick stats row at top
s1.elements.push(r(32, 302, 80, 24, C.card, 8));
s1.elements.push(t(72, 318, '7 entries', 10, C.ink2, 400, 'middle'));
s1.elements.push(r(120, 302, 80, 24, C.card, 8));
s1.elements.push(t(160, 318, '$101 spent', 10, C.red, 500, 'middle'));
s1.elements.push(r(208, 302, 80, 24, C.card, 8));
s1.elements.push(t(248, 318, '+$3,200', 10, C.sage, 500, 'middle'));
// Add decorative micro lines between entries
for (let i = 0; i < 20; i++) {
  s1.elements.push(l(32, 400 + i * 20, 32 + Math.random() * 10, 400 + i * 20, C.line, 0.3, 0.15));
}

// ── Enrich Screen 2 (Journal) — add word count, calendar strip ────────────────
const s2 = pen.screens[1];
// Calendar day strip
const days = [7,8,9,10,11,12,13];
days.forEach((d, i) => {
  const dx = 32 + i * 46;
  const isToday = d === 10;
  s2.elements.push(r(dx, 776 - 720, 38, 44, isToday ? C.accent : C.card, 8));
  s2.elements.push(t(dx + 19, 776 - 720 + 14, ['M','T','W','T','F','S','S'][i], 8, isToday ? C.surf : C.muted, 500, 'middle'));
  s2.elements.push(t(dx + 19, 776 - 720 + 30, String(d), 13, isToday ? C.surf : C.ink, 600, 'middle'));
  if (d < 10 && d > 7) s2.elements.push(c(dx + 19 + 8, 776 - 720 + 36, 3, C.sage, 0.8));
});
// Word count note
s2.elements.push(t(W - 32, 294, '142 words', 10, C.muted, 400, 'end'));
// Mood history dots under summary
for (let i = 0; i < 7; i++) {
  const colors = [C.muted, C.sage, C.accentL, C.accent, C.sage, C.red, C.sage];
  s2.elements.push(c(32 + i * 16, 714, 5, colors[i], 0.7));
}
s2.elements.push(t(32, 728, '7-day mood', 9, C.muted, 400));
// Add paragraph indent markers
for (let i = 0; i < 4; i++) {
  s2.elements.push(r(28, 322 + i * 23, 2, 16, C.sand, 1, 0.5));
}
// Decorative serif quote mark
s2.elements.push(t(16, 136, '"', 48, C.card2, 300, null, -2));

// ── Enrich Screen 3 (Spending Bento) — sparklines in cards ───────────────────
const s3 = pen.screens[2];
// Mini sparklines in housing card
const hVals = [520, 680, 720, 776, 742, 776];
hVals.forEach((v, i) => {
  if (i > 0) {
    s3.elements.push(l(
      50 + (i-1) * 28, 410 + 118 - 10 - (hVals[i-1] - 500) / 350 * 20,
      50 + i * 28,     410 + 118 - 10 - (v - 500) / 350 * 20,
      C.accentL, 1.2, 0.6
    ));
  }
  s3.elements.push(c(50 + i * 28, 410 + 118 - 10 - (v - 500) / 350 * 20, 2, C.accent));
});
// Monthly comparison bar at top of bento
s3.elements.push(t(32, 354, 'vs last month', 10, C.muted, 400));
s3.elements.push(r(32, 358, 120, 4, C.line, 2));
s3.elements.push(r(32, 358, 120 * 0.83, 4, C.sage, 2));
s3.elements.push(t(158, 362, '-17% overall', 10, C.sage, 600));
// Category color legend dots (add more visual points)
cats_extra();
function cats_extra() {
  const data = [[42, C.accent], [22, C.accentL], [14, C.sand], [9, C.sageL], [13, C.line]];
  data.forEach(([pct, col], i) => {
    s3.elements.push(c(32 + i * 12, 240, 3, col));
  });
}

// ── Enrich Screen 4 (Insights) — more chart ticks + recommendation cards ─────
const s4 = pen.screens[3];
// More x-axis tick marks on chart
for (let i = 0; i < 6; i++) {
  s4.elements.push(l(32 + i * 54 + 18, 270, 32 + i * 54 + 18, 275, C.muted, 0.5, 0.4));
}
// Recommendation pill
s4.elements.push(r(32, 698, W - 64, 52, C.card, 14));
s4.elements.push(c(56, 724, 14, C.accent, 0.15));
s4.elements.push(t(56, 728, '$', 16, C.accent, 700, 'middle'));
s4.elements.push(t(78, 716, 'Save $80 more/mo to hit', 12, C.ink, 500));
s4.elements.push(t(78, 732, 'your Q2 goal by July', 12, C.ink2, 400));
s4.elements.push(t(W - 52, 724, 'Act >', 11, C.accent, 600, 'end'));
// Add secondary Y-axis labels
[0.25, 0.75].forEach(f => {
  s4.elements.push(t(28, 270 - f * 120 + 4, Math.round(f * 380) + '', 8, C.muted, 400, 'end'));
  s4.elements.push(l(32, 270 - f * 120, W - 32, 270 - f * 120, C.line, 0.5, 0.3));
});

// ── Enrich Screen 5 (Goals) — add milestone markers on emergency bar ─────────
const s5 = pen.screens[4];
// Milestone ticks on hero progress bar
[0.25, 0.5, 0.75].forEach(f => {
  const bx = 52 + (W - 104) * f;
  s5.elements.push(l(bx, 255, bx, 275, C.card2, 1));
});
// "Monthly contribution" trend mini bars
const contribs = [380, 420, 390, 420, 445, 420];
contribs.forEach((v, i) => {
  const bh = (v - 360) / 100 * 20;
  s5.elements.push(r(52 + i * 26, 335 - bh, 20, bh, i === contribs.length - 1 ? C.sage : C.sageL, 3, 0.8));
});
s5.elements.push(t(52, 344, 'Monthly contributions', 9, C.muted, 400));
// Stars / milestone badges
s5.elements.push(c(W - 62, 170, 12, C.sageL, 0.3));
s5.elements.push(t(W - 62, 175, '*', 14, C.sage, 700, 'middle'));
s5.elements.push(t(W - 62, 188, 'On track', 8, C.sage, 600, 'middle'));

// ── Enrich Screen 6 (Profile) — add account summary cards ────────────────────
const s6 = pen.screens[5];
// Linked accounts strip
s6.elements.push(l(32, 186, W - 32, 186, C.line, 0.5, 0.3));
// Activity log micro-entries
const recentActs = [
  { label: 'Exported CSV', time: '2d ago', y: 750 },
  { label: 'Updated budget', time: '5d ago', y: 764 },
];
recentActs.forEach(a => {
  s6.elements.push(t(32, a.y, a.label, 10, C.muted, 400));
  s6.elements.push(t(W - 32, a.y, a.time, 10, C.muted, 400, 'end'));
});
// Connected account pills
['Chase',  'Venmo', 'AMEX'].forEach((bank, i) => {
  s6.elements.push(r(32 + i * 80, 174, 72, 18, C.card, 9));
  s6.elements.push(t(68 + i * 80, 186, bank, 9, C.ink2, 500, 'middle'));
});
// Grid of tiny squares (texture)
for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 6; col++) {
    s6.elements.push(r(270 + col * 14, 80 + row * 14, 10, 10, C.card, 3, 0.3));
  }
}

// ── Save enriched pen ─────────────────────────────────────────────────────────
const totalEl = pen.screens.reduce((s, sc) => s + sc.elements.length, 0);
pen.metadata.elements = totalEl;
fs.writeFileSync(penPath, JSON.stringify(pen, null, 2));
console.log('VALE enriched: ' + pen.screens.length + ' screens, ' + totalEl + ' elements');
