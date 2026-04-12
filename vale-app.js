'use strict';
const fs   = require('fs');
const path = require('path');

// ─── VALE — Personal Finance Journal ────────────────────────────────────────
// Heartbeat #22 | Theme: LIGHT
// Inspired by: minimal.gallery editorial whitespace + land-book warm-neutral
// serif renaissance. "Barely there UI" — negative space is the structure.
// ─────────────────────────────────────────────────────────────────────────────

const SLUG = 'vale';
const W    = 390;
const H    = 844;

// Palette — warm cream editorial
const C = {
  bg:      '#FAF8F3',
  surf:    '#FFFFFF',
  card:    '#F2EDE4',
  card2:   '#EAE3D8',
  ink:     '#1C1510',
  ink2:    '#6B5A4E',
  muted:   '#B5A898',
  accent:  '#4A3728',
  accentL: '#7A5C45',
  sage:    '#7B9B6B',
  sageL:   '#A8C99A',
  sand:    '#D4C4B0',
  line:    '#E6DDD1',
  red:     '#C0392B',
  gold:    '#B8860B',
};

let elements = [];

function rect(x, y, w, h, fill, opts = {}) {
  const el = { type: 'rect', x, y, width: w, height: h, fill };
  if (opts.rx !== undefined) el.rx = opts.rx;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  if (opts.stroke)  el.stroke = opts.stroke;
  if (opts.sw)      el.strokeWidth = opts.sw;
  elements.push(el); return el;
}
function text(x, y, content, size, fill, opts = {}) {
  const el = { type: 'text', x, y, content: String(content), fontSize: size, fill };
  if (opts.fw)     el.fontWeight    = opts.fw;
  if (opts.font)   el.fontFamily    = opts.font;
  if (opts.anchor) el.textAnchor    = opts.anchor;
  if (opts.ls !== undefined) el.letterSpacing = opts.ls;
  if (opts.opacity !== undefined) el.opacity  = opts.opacity;
  elements.push(el); return el;
}
function circle(cx, cy, r, fill, opts = {}) {
  const el = { type: 'circle', cx, cy, r, fill };
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  if (opts.stroke)  el.stroke = opts.stroke;
  if (opts.sw)      el.strokeWidth = opts.sw;
  elements.push(el); return el;
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  const el = { type: 'line', x1, y1, x2, y2, stroke };
  if (opts.sw)  el.strokeWidth = opts.sw;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  elements.push(el); return el;
}

function statusBar(y0) {
  rect(0, y0, W, 44, C.bg);
  text(20, y0 + 28, '9:41', 12, C.ink2, { fw: 500, ls: 0.5 });
  rect(340, y0 + 16, 28, 13, 'none', { stroke: C.ink2, sw: 1.2, rx: 3 });
  rect(368, y0 + 20, 3, 6, C.ink2, { rx: 1 });
  rect(342, y0 + 18, 20, 9, C.ink2, { rx: 2 });
  circle(316, y0 + 22, 3, 'none', { stroke: C.ink2, sw: 1.2 });
  circle(321, y0 + 22, 3, 'none', { stroke: C.ink2, sw: 1.2, opacity: 0.5 });
  circle(326, y0 + 22, 3, 'none', { stroke: C.ink2, sw: 1.2, opacity: 0.25 });
}
function navBar(y0) {
  rect(0, y0, W, 58, C.surf);
  line(0, y0, W, y0, C.line, { sw: 0.5 });
  const tabs = [
    { label: 'Today',   icon: 'O',  x: 49  },
    { label: 'Journal', icon: '=',  x: 137 },
    { label: '+',       icon: '+',  x: 195 },
    { label: 'Trends',  icon: '~',  x: 253 },
    { label: 'Goals',   icon: 'o',  x: 341 },
  ];
  tabs.forEach(t => {
    if (t.label === '+') {
      circle(t.x, y0 + 22, 18, C.accent);
      text(t.x, y0 + 28, t.icon, 18, C.surf, { anchor: 'middle', fw: 300 });
    } else {
      const active = t.label === 'Today';
      text(t.x, y0 + 18, t.icon, 16, active ? C.accent : C.muted, { anchor: 'middle' });
      text(t.x, y0 + 34, t.label, 9, active ? C.accent : C.muted, { anchor: 'middle', fw: 500, ls: 0.3 });
      if (active) rect(t.x - 12, y0, 24, 2, C.accent, { rx: 1 });
    }
  });
}
function divider(y, opacity) {
  opacity = opacity !== undefined ? opacity : 1;
  line(32, y, W - 32, y, C.line, { sw: 0.5, opacity });
}

// ── SCREEN 1: TODAY ──────────────────────────────────────────────────────────
function screen1() {
  elements = [];
  rect(0, 0, W, H, C.bg);
  statusBar(0);

  text(32, 82, 'Thursday, April 10', 11, C.muted, { fw: 500, ls: 1.2 });
  text(32, 114, 'Good morning,', 22, C.ink2, { font: 'Georgia, serif', fw: 400 });
  text(32, 150, 'Matias.', 36, C.ink, { font: 'Georgia, serif', fw: 700, ls: -0.5 });

  divider(172);

  text(32, 204, 'Available today', 11, C.muted, { fw: 500, ls: 1 });
  text(32, 268, '$4,812', 64, C.ink, { fw: 300, font: 'Georgia, serif', ls: -1.5 });

  rect(32, 286, 98, 28, C.card, { rx: 14 });
  circle(50, 300, 6, C.sage);
  text(64, 304, 'On track', 11, C.ink2, { fw: 500, ls: 0.3 });

  divider(330);

  text(32, 358, 'Today', 11, C.muted, { fw: 600, ls: 1.5 });

  const entries = [
    { name: 'Blue Bottle Coffee', cat: 'Food & Drink',   amt: '-$6.50',    color: C.red,  y: 386 },
    { name: 'Spotify',            cat: 'Subscriptions',  amt: '-$10.99',   color: C.ink2, y: 436 },
    { name: 'Salary deposit',     cat: 'Income',         amt: '+$3,200',   color: C.sage, y: 486 },
    { name: 'Whole Foods',        cat: 'Groceries',      amt: '-$84.22',   color: C.red,  y: 536 },
  ];
  entries.forEach(e => {
    text(32, e.y, e.name, 14, C.ink, { fw: 500 });
    text(32, e.y + 18, e.cat, 11, C.muted, { fw: 400 });
    text(W - 32, e.y + 4, e.amt, 15, e.color, { anchor: 'end', fw: 500, font: 'Georgia, serif' });
    divider(e.y + 34, 0.5);
  });

  text(W / 2, 616, '+ Add entry', 12, C.accentL, { anchor: 'middle', fw: 500, ls: 0.3 });

  text(32, 658, 'Mood', 11, C.muted, { fw: 600, ls: 1.5 });
  [':(', ':-|', ':)', ':D', ':*)'].forEach((m, i) => {
    const cx = 44 + i * 52;
    if (i === 2) {
      rect(cx - 18, 672, 36, 36, C.card2, { rx: 18 });
    }
    text(cx, 698, m, 16, i === 2 ? C.accent : C.muted, { anchor: 'middle', fw: i === 2 ? 700 : 400 });
  });

  navBar(786);
  return { name: 'Today', elements: [...elements] };
}

// ── SCREEN 2: JOURNAL ────────────────────────────────────────────────────────
function screen2() {
  elements = [];
  rect(0, 0, W, H, C.bg);
  statusBar(0);

  text(32, 76, '<', 16, C.ink2);
  text(W / 2, 76, 'April 10', 13, C.ink2, { anchor: 'middle', fw: 500 });

  text(32, 124, '"A quiet day in', 18, C.ink, { font: 'Georgia, serif', fw: 400 });
  text(32, 150, 'financial terms."', 18, C.ink, { font: 'Georgia, serif', fw: 400 });

  divider(174);

  text(32, 208, 'Financial wellbeing', 11, C.muted, { fw: 600, ls: 1 });
  [C.sand, C.sand, C.sand, C.sand, C.line].forEach((sc, i) => {
    rect(32 + i * 42, 222, 34, 8, sc, { rx: 4, opacity: 0.6 });
  });
  rect(32, 222, 130, 8, C.accent, { rx: 4 });
  text(32, 248, 'Score: 71/100', 12, C.ink2, { fw: 500 });

  divider(266);

  text(32, 294, 'Reflection', 11, C.muted, { fw: 600, ls: 1.5 });
  [
    'Kept grocery spending within budget.',
    'Spotify auto-renewed — should review',
    'subscriptions next month. Income arrived',
    'early which was a pleasant surprise.',
    '',
    'Feeling cautiously optimistic about',
    'the saving target for this quarter.',
  ].forEach((l, i) => {
    if (l) text(32, 322 + i * 23, l, 14, i < 4 ? C.ink : C.ink2, { font: 'Georgia, serif', fw: 400 });
  });

  divider(494);

  text(32, 520, 'Tags', 11, C.muted, { fw: 600, ls: 1.5 });
  let tx = 32;
  ['on-track', 'subscriptions', 'income'].forEach(tag => {
    const tw = tag.length * 7 + 24;
    rect(tx, 534, tw, 26, C.card, { rx: 13 });
    text(tx + tw / 2, 551, tag, 11, C.ink2, { anchor: 'middle', fw: 500 });
    tx += tw + 8;
  });

  divider(576);

  text(32, 602, 'Summary', 11, C.muted, { fw: 600, ls: 1.5 });
  [
    { label: 'Income',   val: '+$3,200',    color: C.sage },
    { label: 'Expenses', val: '-$101.71',   color: C.red },
    { label: 'Net',      val: '+$3,098.29', color: C.accent },
  ].forEach((s, i) => {
    text(32, 628 + i * 28, s.label, 13, C.ink2, { fw: 400 });
    text(W - 32, 628 + i * 28, s.val, 13, s.color, { anchor: 'end', fw: 500, font: 'Georgia, serif' });
  });

  navBar(786);
  return { name: 'Journal', elements: [...elements] };
}

// ── SCREEN 3: SPENDING BENTO ─────────────────────────────────────────────────
function screen3() {
  elements = [];
  rect(0, 0, W, H, C.bg);
  statusBar(0);

  text(32, 78, 'April 2026', 11, C.muted, { fw: 600, ls: 1.5 });
  text(32, 108, 'Spending', 32, C.ink, { fw: 700, ls: -0.5 });
  text(32, 138, 'breakdown', 30, C.ink2, { font: 'Georgia, serif', fw: 400, ls: -0.5 });

  divider(158);

  text(32, 190, 'Total spent', 11, C.muted, { fw: 500, ls: 1 });
  text(32, 232, '$1,847', 44, C.ink, { font: 'Georgia, serif', fw: 300, ls: -1 });

  // Stacked bar
  const barW = W - 64;
  const cats = [
    { pct: 42, color: C.accent },
    { pct: 22, color: C.accentL },
    { pct: 14, color: C.sand },
    { pct:  9, color: C.sageL },
    { pct: 13, color: C.line },
  ];
  let bx = 32;
  cats.forEach(c => {
    const w = barW * c.pct / 100;
    rect(bx, 250, w - 2, 14, c.color, { rx: 3 });
    bx += w;
  });

  const catLabels = ['Housing 42%', 'Food 22%', 'Transport 14%', 'Subs 9%', 'Other 13%'];
  catLabels.forEach((l, i) => {
    const col = i % 2; const row = Math.floor(i / 2);
    rect(32 + col * 180, 278 + row * 26, 10, 10, cats[i].color, { rx: 2 });
    text(48 + col * 180, 287 + row * 26, l, 11, C.ink2, { fw: 400 });
  });

  divider(366);

  text(32, 392, 'Top categories', 11, C.muted, { fw: 600, ls: 1.5 });

  // Large card
  rect(32, 410, 214, 118, C.card, { rx: 12 });
  text(50, 436, 'Housing', 11, C.ink2, { fw: 600, ls: 0.5 });
  text(50, 474, '$776', 32, C.ink, { fw: 300, font: 'Georgia, serif' });
  text(50, 498, '42% of budget', 11, C.muted, { fw: 400 });
  rect(50, 514, 174, 4, C.line, { rx: 2 });
  rect(50, 514, 174 * 0.42, 4, C.accent, { rx: 2 });

  // Small right cards
  rect(256, 410, 102, 54, C.card, { rx: 12 });
  text(272, 432, 'Food', 10, C.ink2, { fw: 600, ls: 0.5 });
  text(272, 452, '$406', 20, C.ink, { fw: 400, font: 'Georgia, serif' });
  rect(256, 474, 102, 54, C.card, { rx: 12 });
  text(272, 496, 'Transport', 10, C.ink2, { fw: 600, ls: 0.5 });
  text(272, 516, '$258', 20, C.ink, { fw: 400, font: 'Georgia, serif' });

  // Bottom cards
  rect(32, 538, 156, 72, C.card, { rx: 12 });
  text(50, 558, 'Subscriptions', 10, C.ink2, { fw: 600, ls: 0.5 });
  text(50, 586, '$166', 26, C.ink, { fw: 300, font: 'Georgia, serif' });
  text(50, 604, 'Down 12% vs last mo', 9, C.sage, { fw: 500 });
  rect(196, 538, 162, 72, C.card, { rx: 12 });
  text(214, 558, 'Other', 10, C.ink2, { fw: 600, ls: 0.5 });
  text(214, 586, '$240', 26, C.ink, { fw: 300, font: 'Georgia, serif' });
  text(214, 604, 'Up 3% vs last mo', 9, C.muted, { fw: 500 });

  // Budget progress
  text(32, 638, 'Monthly budget  $2,400', 11, C.muted, { fw: 400, ls: 0.3 });
  rect(32, 652, barW, 6, C.line, { rx: 3 });
  rect(32, 652, barW * 0.77, 6, C.sage, { rx: 3 });
  text(32, 674, '77% used  -  $553 remaining', 11, C.ink2, { fw: 500 });

  navBar(786);
  return { name: 'Spending', elements: [...elements] };
}

// ── SCREEN 4: INSIGHTS ───────────────────────────────────────────────────────
function screen4() {
  elements = [];
  rect(0, 0, W, H, C.bg);
  statusBar(0);

  text(32, 78, 'Insights', 32, C.ink, { fw: 700, ls: -0.5 });
  text(32, 108, 'Last 6 months', 13, C.muted, { fw: 400 });

  divider(126);

  const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const vals   = [240, 180, 310, 190, 280, 340];
  const maxV   = 380;
  const chartH = 120;
  const chartY = 270;
  const cW     = W - 64;
  const bw     = 36;
  const gp     = (cW - months.length * bw) / (months.length - 1);

  // Grid
  [0, 0.5, 1].forEach(f => {
    const gy = chartY - f * chartH;
    line(32, gy, W - 32, gy, C.line, { sw: 0.5, opacity: 0.7 });
    text(28, gy + 4, Math.round(f * maxV) + '', 9, C.muted, { anchor: 'end' });
  });

  months.forEach((m, i) => {
    const bx = 32 + i * (bw + gp);
    const bh = (vals[i] / maxV) * chartH;
    const last = i === months.length - 1;
    rect(bx, chartY - bh, bw, bh, last ? C.accent : C.sand, { rx: 4, opacity: last ? 1 : 0.75 });
    text(bx + bw / 2, chartY + 16, m, 10, C.muted, { anchor: 'middle', fw: 400 });
    if (last) text(bx + bw / 2, chartY - bh - 10, '$' + vals[i], 10, C.accent, { anchor: 'middle', fw: 600 });
  });

  text(32, 310, 'Avg monthly savings', 11, C.muted, { fw: 600, ls: 1 });
  text(32, 340, '$257', 36, C.ink, { font: 'Georgia, serif', fw: 300 });
  text(32, 362, 'Up 18% vs previous period', 12, C.sage, { fw: 500 });

  divider(382);

  text(32, 408, 'Notable patterns', 11, C.muted, { fw: 600, ls: 1.5 });

  [
    { icon: 'v', title: 'Subscriptions down',     body: 'Cut $32/mo in recurring costs',       color: C.sage, y: 436 },
    { icon: '^', title: 'Food spending rising',   body: 'Up 8% over 3 months — review?',       color: C.red,  y: 506 },
    { icon: 'o', title: 'Savings target on pace', body: 'Q2 goal: $1,500  Saved: $920',         color: C.accent,  y: 576 },
    { icon: '!', title: 'Unused subscriptions',   body: 'LinkedIn Premium — last used 40d ago', color: C.gold, y: 646 },
  ].forEach(ins => {
    circle(50, ins.y + 16, 16, C.card);
    text(50, ins.y + 21, ins.icon, 14, ins.color, { anchor: 'middle', fw: 700 });
    text(74, ins.y + 12, ins.title, 14, C.ink, { fw: 600 });
    text(74, ins.y + 30, ins.body, 12, C.ink2, { fw: 400 });
    divider(ins.y + 50, 0.5);
  });

  navBar(786);
  return { name: 'Insights', elements: [...elements] };
}

// ── SCREEN 5: GOALS ──────────────────────────────────────────────────────────
function screen5() {
  elements = [];
  rect(0, 0, W, H, C.bg);
  statusBar(0);

  text(32, 78, 'Goals', 32, C.ink, { fw: 700, ls: -0.5 });
  text(32, 108, 'What you are working toward', 13, C.muted, { fw: 400 });

  divider(126);

  // Hero goal card
  rect(32, 148, W - 64, 178, C.card, { rx: 16 });
  text(52, 180, 'EMERGENCY FUND', 10, C.accent, { fw: 700, ls: 2 });
  text(52, 218, '$8,240', 44, C.ink, { font: 'Georgia, serif', fw: 300, ls: -1 });
  text(52, 244, 'of $12,000 goal', 13, C.ink2, { fw: 400 });
  rect(52, 262, W - 104, 6, C.line, { rx: 3 });
  rect(52, 262, (W - 104) * 0.687, 6, C.accent, { rx: 3 });
  text(52, 284, '68.7%  -  $3,760 to go', 11, C.ink2, { fw: 500 });
  text(W - 52, 284, '~4 months', 11, C.muted, { anchor: 'end', fw: 400 });
  line(52, 300, W - 52, 300, C.line, { sw: 0.5 });
  text(52, 318, '+ $420/mo to stay on track', 12, C.sage, { fw: 500 });

  // Secondary goals
  text(32, 358, 'Other goals', 11, C.muted, { fw: 600, ls: 1.5 });

  [
    { name: 'Japan trip',    target: '$4,000', current: '$1,200', pct: 0.30, deadline: 'Sep 2026', color: C.accentL },
    { name: 'New laptop',   target: '$1,800', current: '$900',   pct: 0.50, deadline: 'Jun 2026', color: C.sage },
    { name: 'Pay off card', target: '$3,200', current: '$2,640', pct: 0.825, deadline: 'May 2026', color: C.gold },
  ].forEach((g, i) => {
    const gy = 384 + i * 116;
    rect(32, gy, W - 64, 104, C.surf, { rx: 12 });
    text(52, gy + 26, g.name, 15, C.ink, { fw: 600 });
    text(52, gy + 46, g.current + ' of ' + g.target, 12, C.ink2, { fw: 400 });
    text(W - 52, gy + 26, g.deadline, 11, C.muted, { anchor: 'end', fw: 400 });
    rect(52, gy + 64, W - 104, 4, C.line, { rx: 2 });
    rect(52, gy + 64, (W - 104) * g.pct, 4, g.color, { rx: 2 });
    text(52, gy + 84, Math.round(g.pct * 100) + '% complete', 11, C.muted, { fw: 400 });
  });

  navBar(786);
  return { name: 'Goals', elements: [...elements] };
}

// ── SCREEN 6: PROFILE ────────────────────────────────────────────────────────
function screen6() {
  elements = [];
  rect(0, 0, W, H, C.bg);
  statusBar(0);

  text(32, 78, 'Profile', 32, C.ink, { fw: 700, ls: -0.5 });

  circle(64, 152, 36, C.card2);
  text(64, 162, 'MR', 18, C.accent, { anchor: 'middle', fw: 600, ls: 1 });
  text(116, 140, 'Matias Rios', 18, C.ink, { fw: 600 });
  text(116, 162, 'matias@hey.com', 12, C.muted, { fw: 400 });

  divider(196);

  text(32, 222, 'Preferences', 11, C.muted, { fw: 600, ls: 1.5 });
  [
    { label: 'Currency',      val: 'USD $',        y: 248 },
    { label: 'Timezone',      val: 'America / NY', y: 290 },
    { label: 'Week starts',   val: 'Monday',       y: 332 },
    { label: 'Budget period', val: 'Monthly',      y: 374 },
  ].forEach(p => {
    text(32, p.y, p.label, 14, C.ink2, { fw: 400 });
    text(W - 32, p.y, p.val, 14, C.ink, { anchor: 'end', fw: 500 });
    divider(p.y + 18, 0.5);
  });

  text(32, 418, 'Notifications', 11, C.muted, { fw: 600, ls: 1.5 });
  [
    { label: 'Daily summary',   on: true,  y: 444 },
    { label: 'Budget warnings', on: true,  y: 484 },
    { label: 'Weekly insights', on: false, y: 524 },
  ].forEach(n => {
    text(32, n.y, n.label, 14, C.ink2, { fw: 400 });
    rect(W - 64, n.y - 14, 44, 24, n.on ? C.accent : C.line, { rx: 12 });
    circle(n.on ? W - 30 : W - 50, n.y - 2, 10, C.surf);
    divider(n.y + 18, 0.5);
  });

  text(32, 568, 'Data', 11, C.muted, { fw: 600, ls: 1.5 });
  ['Export to CSV', 'Privacy & data', 'About Vale'].forEach((item, i) => {
    text(32, 594 + i * 42, item, 14, C.ink2, { fw: 400 });
    text(W - 32, 594 + i * 42, '>', 14, C.muted, { anchor: 'end' });
    divider(594 + i * 42 + 18, 0.5);
  });

  text(W / 2, 744, 'Vale 1.0  -  Built with intention', 11, C.muted, { anchor: 'middle', fw: 400 });

  navBar(786);
  return { name: 'Profile', elements: [...elements] };
}

// ── Assemble ──────────────────────────────────────────────────────────────────
const screens = [screen1(), screen2(), screen3(), screen4(), screen5(), screen6()];
const totalEl = screens.reduce((s, sc) => s + sc.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name:        'VALE — Personal Finance Journal',
    author:      'RAM',
    date:        new Date().toISOString(),
    theme:       'light',
    heartbeat:   22,
    elements:    totalEl,
    palette:     { bg: C.bg, surf: C.surf, accent: C.accent, accent2: C.sage },
    inspiration: 'minimal.gallery editorial whitespace + land-book warm-neutral serif renaissance',
  },
  screens,
};

fs.writeFileSync(path.join(__dirname, SLUG + '.pen'), JSON.stringify(pen, null, 2));
console.log('VALE: ' + screens.length + ' screens, ' + totalEl + ' elements');
console.log('Written: ' + SLUG + '.pen');

// This was already run — re-running will overwrite with same content.
