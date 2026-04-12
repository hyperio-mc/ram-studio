#!/usr/bin/env node
// SOLEIL — AI clarity dashboard for freelance creatives
// Light theme · Inspired by Cushion (darkmodedesign.com) + NNGroup "Outcome-Oriented Design" + minimal.gallery editorial layouts

const fs = require('fs');

// ─── Palette (warm cream light theme) ───────────────────────────────────────
const P = {
  cream:      '#F7F3EE',
  white:      '#FFFFFF',
  ink:        '#1C1917',
  inkMuted:   '#78716C',
  terra:      '#D4622A',
  terraLight: '#FDEEE6',
  sage:       '#2A7A5A',
  sageLight:  '#E5F4EE',
  gold:       '#B87333',
  goldLight:  '#FEF5E7',
  border:     '#E8E0D8',
  cardShadow: 'rgba(28,25,23,0.07)',
};

let wid = 1000;
const W = () => wid++;

function widget(type, x, y, w, h, props = {}) {
  return { id: `w${W()}`, type, x, y, width: w, height: h, ...props };
}

function rect(x, y, w, h, fill, rx = 0, props = {}) {
  return widget('rectangle', x, y, w, h, { fill, cornerRadius: rx, strokeWidth: 0, ...props });
}

function txt(x, y, w, h, text, size, color, weight = 400, align = 'left') {
  return widget('text', x, y, w, h, {
    text, fontSize: size, fill: color,
    fontWeight: weight, textAlign: align,
    fontFamily: 'Inter',
  });
}

function circle(x, y, r, fill) {
  return widget('ellipse', x - r, y - r, r * 2, r * 2, { fill });
}

const SW = 390, SH = 844;

function navBar(activeIdx) {
  const ws = [];
  ws.push(rect(0, SH - 80, SW, 80, P.white));
  ws.push(rect(0, SH - 80, SW, 1, P.border));
  const navItems = [
    { icon: '⊙', label: 'Home' },
    { icon: '◫', label: 'Projects' },
    { icon: '◈', label: 'Finance' },
    { icon: '✦', label: 'Insights' },
  ];
  navItems.forEach((n, i) => {
    const x = 20 + i * 88;
    const isActive = i === activeIdx;
    const col = isActive ? P.terra : P.inkMuted;
    ws.push(txt(x, SH - 64, 70, 22, n.icon, 18, col, 400, 'center'));
    ws.push(txt(x, SH - 44, 70, 14, n.label, 10, col, isActive ? 600 : 400, 'center'));
    if (isActive) ws.push(rect(x + 25, SH - 78, 20, 3, P.terra, 2));
  });
  return ws;
}

// SCREEN 1 — Home
function screen1() {
  const ws = [];
  ws.push(rect(0, 0, SW, SH, P.cream));
  ws.push(txt(20, 16, 200, 20, '9:41', 13, P.ink, 600));
  ws.push(txt(290, 16, 80, 20, '● ▲', 11, P.ink, 400, 'right'));
  ws.push(txt(20, 52, 200, 22, 'Good morning,', 15, P.inkMuted, 400));
  ws.push(txt(20, 72, 240, 38, 'Maya.', 30, P.ink, 700));
  ws.push(circle(358, 80, 22, P.terraLight));
  ws.push(txt(347, 69, 22, 22, 'M', 13, P.terra, 700, 'center'));
  ws.push(rect(20, 120, 350, 1, P.border));

  // Clarity Score card
  ws.push(rect(20, 134, 350, 148, P.white, 20));
  ws.push(circle(80, 212, 44, P.terraLight));
  ws.push(circle(80, 212, 34, P.white));
  ws.push(txt(57, 200, 46, 20, '82', 20, P.terra, 700, 'center'));
  ws.push(txt(57, 218, 46, 12, '/100', 9, P.inkMuted, 400, 'center'));
  ws.push(txt(140, 150, 220, 16, 'Clarity Score', 11, P.inkMuted, 500));
  ws.push(txt(140, 166, 220, 26, "You're on track.", 17, P.ink, 700));
  ws.push(txt(140, 192, 220, 14, 'Cash flow healthy · 2 active projects', 11, P.inkMuted, 400));
  ws.push(txt(140, 205, 220, 14, 'Next payment in 4 days', 11, P.inkMuted, 400));
  ws.push(rect(140, 224, 200, 26, P.sageLight, 8));
  ws.push(txt(150, 230, 190, 16, '✦  AI: Buffer week available Apr 18', 11, P.sage, 500));

  // This week stats
  ws.push(txt(20, 298, 180, 20, 'This week', 14, P.ink, 600));
  ws.push(txt(270, 298, 100, 20, 'Apr 7–13', 11, P.inkMuted, 400, 'right'));
  const stats = [
    { label: 'Billed', val: '$4,200', sub: '+12%', col: P.terra, bg: P.terraLight },
    { label: 'Hours', val: '27h', sub: '68% util', col: P.sage, bg: P.sageLight },
    { label: 'Tasks', val: '14 / 18', sub: 'done', col: P.gold, bg: P.goldLight },
  ];
  stats.forEach((s, i) => {
    const x = 20 + i * 118;
    ws.push(rect(x, 324, 108, 74, s.bg, 14));
    ws.push(txt(x + 10, 336, 88, 14, s.label, 10, s.col, 500));
    ws.push(txt(x + 10, 350, 88, 22, s.val, 15, P.ink, 700));
    ws.push(txt(x + 10, 372, 88, 14, s.sub, 10, P.inkMuted, 400));
  });

  // Active projects
  ws.push(txt(20, 414, 180, 20, 'Active projects', 14, P.ink, 600));
  ws.push(txt(280, 414, 90, 20, 'See all →', 12, P.terra, 500, 'right'));
  const projects = [
    { name: 'Helio Rebrand', client: 'Helio Studio', pct: 72, due: 'Apr 14', col: P.terra },
    { name: 'Vega Web Design', client: 'Vega Corp', pct: 45, due: 'Apr 28', col: P.sage },
  ];
  projects.forEach((p, i) => {
    const y = 442 + i * 76;
    ws.push(rect(20, y, 350, 66, P.white, 16));
    ws.push(txt(36, y + 10, 220, 18, p.name, 14, P.ink, 600));
    ws.push(txt(36, y + 28, 200, 14, p.client, 11, P.inkMuted, 400));
    ws.push(txt(298, y + 10, 54, 18, p.due, 10, P.inkMuted, 400, 'right'));
    ws.push(rect(36, y + 46, 282, 6, P.cream, 3));
    ws.push(rect(36, y + 46, Math.round(282 * p.pct / 100), 6, p.col, 3));
    ws.push(txt(316, y + 42, 32, 14, `${p.pct}%`, 9, p.col, 600, 'right'));
  });

  ws.push(...navBar(0));
  return { id: 's1', label: 'Home', backgroundColor: P.cream, widgets: ws };
}

// SCREEN 2 — Projects / Timeline
function screen2() {
  const ws = [];
  ws.push(rect(0, 0, SW, SH, P.cream));
  ws.push(txt(20, 16, 200, 20, '9:41', 13, P.ink, 600));
  ws.push(txt(20, 52, 240, 34, 'Projects', 26, P.ink, 700));
  ws.push(rect(296, 56, 74, 28, P.terraLight, 10));
  ws.push(txt(296, 56, 74, 28, '+ New', 12, P.terra, 600, 'center'));

  const tabs = ['All', 'Active', 'Paused', 'Done'];
  tabs.forEach((t, i) => {
    const active = i === 1;
    ws.push(rect(20 + i * 84, 98, 76, 28, active ? P.terra : P.white, 8));
    ws.push(txt(20 + i * 84, 98, 76, 28, t, 12, active ? P.white : P.inkMuted, active ? 600 : 400, 'center'));
  });

  ws.push(rect(0, 136, SW, 1, P.border));
  ws.push(txt(20, 146, 350, 18, '← April 2026 →', 12, P.inkMuted, 400, 'center'));

  const weekLabels = ['Apr 7', 'Apr 14', 'Apr 21', 'Apr 28'];
  weekLabels.forEach((w, i) => {
    ws.push(txt(54 + i * 76, 168, 70, 12, w, 8, P.inkMuted, 400, 'center'));
  });

  const tps = [
    { name: 'Helio Rebrand', client: 'Helio Studio', s: 0, ww: 0.52, col: P.terra, phase: 'Design' },
    { name: 'Vega Web', client: 'Vega Corp', s: 0.18, ww: 0.60, col: P.sage, phase: 'Build' },
    { name: 'Orion Pitch', client: 'Orion Media', s: 0.52, ww: 0.35, col: P.gold, phase: 'Strategy' },
    { name: 'Lunar Brand', client: 'Lunar Co.', s: 0.68, ww: 0.30, col: '#9B7BB5', phase: 'Kickoff' },
  ];
  const TX = 58, TW = 288;
  tps.forEach((p, i) => {
    const y = 190 + i * 72;
    ws.push(txt(20, y + 2, TX - 8, 14, p.name.slice(0,12), 10, P.ink, 600));
    ws.push(txt(20, y + 16, TX - 8, 12, p.client.slice(0,11), 8, P.inkMuted, 400));
    ws.push(rect(TX, y + 4, TW, 26, P.white, 6));
    const bx = TX + Math.round(TW * p.s);
    const bw = Math.round(TW * p.ww);
    ws.push(rect(bx, y + 4, bw, 26, p.col + '30', 6));
    ws.push(rect(bx, y + 4, 3, 26, p.col, 3));
    ws.push(txt(bx + 6, y + 10, bw - 10, 14, p.phase, 9, p.col, 600));
    if (i < 3) ws.push(rect(20, y + 46, 350, 1, P.border));
  });

  // Summary
  ws.push(rect(20, 490, 350, 88, P.white, 18));
  ws.push(txt(36, 504, 200, 16, 'April summary', 11, P.inkMuted, 500));
  const ss = [{ label: 'Contracted', val: '$21,700' }, { label: 'On track', val: '3 / 4' }, { label: 'Buffer days', val: '8 days' }];
  ss.forEach((s, i) => {
    ws.push(txt(36 + i * 110, 524, 100, 22, s.val, 15, P.ink, 700));
    ws.push(txt(36 + i * 110, 545, 100, 14, s.label, 9, P.inkMuted, 400));
  });

  ws.push(rect(20, 592, 350, 40, P.terraLight, 12));
  ws.push(txt(36, 602, 314, 18, '✦  AI: Orion overlaps Vega — push 3 days?', 11, P.terra, 500));

  ws.push(...navBar(1));
  return { id: 's2', label: 'Projects', backgroundColor: P.cream, widgets: ws };
}

// SCREEN 3 — Finance
function screen3() {
  const ws = [];
  ws.push(rect(0, 0, SW, SH, P.cream));
  ws.push(txt(20, 16, 200, 20, '9:41', 13, P.ink, 600));
  ws.push(txt(20, 52, 240, 34, 'Finance', 26, P.ink, 700));
  ws.push(rect(20, 98, 200, 30, P.white, 10));
  ws.push(rect(20, 98, 100, 30, P.terra, 10));
  ws.push(txt(20, 98, 100, 30, 'Monthly', 12, P.white, 600, 'center'));
  ws.push(txt(120, 98, 100, 30, 'Quarterly', 12, P.inkMuted, 400, 'center'));

  ws.push(rect(20, 142, 350, 160, P.white, 20));
  ws.push(txt(36, 158, 200, 14, 'April revenue', 10, P.inkMuted, 500));
  ws.push(txt(36, 174, 240, 38, '$14,200', 30, P.ink, 700));
  ws.push(rect(36, 212, 60, 20, P.sageLight, 6));
  ws.push(txt(36, 212, 60, 20, '↑ 18.3%', 10, P.sage, 600, 'center'));
  ws.push(txt(104, 212, 120, 20, 'vs March', 10, P.inkMuted, 400));

  // Bar chart
  const months = [
    { m: 'N', v: 8200 }, { m: 'D', v: 6100 }, { m: 'J', v: 9400 },
    { m: 'F', v: 11800 }, { m: 'M', v: 12000 }, { m: 'A', v: 14200 },
  ];
  const maxV = 15000, chartH = 64, chartY = 238;
  months.forEach((mo, i) => {
    const x = 36 + i * 46;
    const bh = Math.round((mo.v / maxV) * chartH);
    ws.push(rect(x, chartY + chartH - bh, 28, bh, i === 5 ? P.terra : P.terra + '55', 4));
    ws.push(txt(x, chartY + chartH + 4, 28, 12, mo.m, 9, P.inkMuted, 400, 'center'));
  });

  // Invoices
  ws.push(txt(20, 322, 200, 20, 'Invoices', 14, P.ink, 600));
  ws.push(txt(280, 322, 90, 20, 'View all →', 12, P.terra, 500, 'right'));
  const invoices = [
    { name: 'Helio Studio', amount: '$3,000', status: 'Due Apr 14', col: P.terra },
    { name: 'Vega Corp', amount: '$4,750', status: 'Paid Apr 3', col: P.sage },
    { name: 'Orion Media', amount: '$2,200', status: 'Draft', col: P.inkMuted },
  ];
  invoices.forEach((inv, i) => {
    const y = 350 + i * 66;
    ws.push(rect(20, y, 350, 56, P.white, 14));
    ws.push(circle(40, y + 28, 5, inv.col));
    ws.push(txt(54, y + 10, 200, 18, inv.name, 14, P.ink, 600));
    ws.push(txt(54, y + 28, 180, 14, inv.status, 11, inv.col, 500));
    ws.push(txt(280, y + 16, 74, 20, inv.amount, 15, P.ink, 700, 'right'));
  });

  ws.push(rect(20, 552, 350, 68, P.goldLight, 18));
  ws.push(txt(36, 566, 200, 16, 'May forecast', 11, P.gold, 600));
  ws.push(txt(36, 582, 280, 24, '$15,800 projected', 17, P.ink, 700));
  ws.push(txt(36, 604, 300, 14, 'Based on 2 confirmed + 1 lead', 11, P.inkMuted, 400));

  ws.push(...navBar(2));
  return { id: 's3', label: 'Finance', backgroundColor: P.cream, widgets: ws };
}

// SCREEN 4 — Time / Utilization
function screen4() {
  const ws = [];
  ws.push(rect(0, 0, SW, SH, P.cream));
  ws.push(txt(20, 16, 200, 20, '9:41', 13, P.ink, 600));
  ws.push(txt(20, 52, 240, 34, 'Time', 26, P.ink, 700));
  ws.push(txt(20, 98, 350, 16, '← Week of Apr 7, 2026 →', 12, P.inkMuted, 400, 'center'));

  // Utilization card
  ws.push(rect(20, 124, 350, 136, P.white, 20));
  ws.push(circle(98, 196, 48, P.sageLight));
  ws.push(circle(98, 196, 35, P.white));
  ws.push(txt(75, 184, 46, 20, '68%', 16, P.sage, 700, 'center'));
  ws.push(txt(75, 202, 46, 12, 'util.', 9, P.inkMuted, 400, 'center'));
  ws.push(txt(168, 138, 180, 14, 'This week', 10, P.inkMuted, 500));
  ws.push(txt(168, 154, 180, 26, '27h 40m', 20, P.ink, 700));
  ws.push(txt(168, 180, 180, 14, 'Target: 40h · 12h 20m left', 11, P.inkMuted, 400));
  ws.push(rect(168, 198, 150, 5, P.cream, 3));
  ws.push(rect(168, 198, 102, 5, P.sage, 3));
  ws.push(txt(168, 210, 100, 14, 'On pace ✓', 10, P.sage, 500));

  // Daily bars
  ws.push(txt(20, 276, 200, 20, 'Daily breakdown', 14, P.ink, 600));
  const days = [
    { d: 'Mon', h: 7.5, col: P.terra }, { d: 'Tue', h: 6.0, col: P.sage },
    { d: 'Wed', h: 5.5, col: P.gold }, { d: 'Thu', h: 8.0, col: P.terra },
    { d: 'Fri', h: 0.7, col: P.inkMuted }, { d: 'Sat', h: 0, col: P.border },
    { d: 'Sun', h: 0, col: P.border },
  ];
  const maxH = 8, barAreaH = 78;
  days.forEach((d, i) => {
    const x = 20 + i * 50;
    const bh = Math.round((d.h / maxH) * barAreaH);
    ws.push(rect(x + 8, 300, 34, barAreaH, P.cream, 4));
    if (bh > 0) ws.push(rect(x + 8, 300 + barAreaH - bh, 34, bh, d.col + (d.h < 1 ? '66' : 'CC'), 4));
    ws.push(txt(x + 8, 382, 34, 12, d.d, 9, P.inkMuted, 400, 'center'));
    ws.push(txt(x + 8, 394, 34, 12, d.h > 0 ? `${d.h}h` : '', 8, P.ink, 600, 'center'));
  });

  // Time entries
  ws.push(txt(20, 422, 200, 20, "Today's entries", 14, P.ink, 600));
  ws.push(rect(294, 424, 76, 24, P.terraLight, 8));
  ws.push(txt(294, 424, 76, 24, '+ Log time', 10, P.terra, 600, 'center'));

  const entries = [
    { task: 'Helio — Brand exploration', time: '9:00–11:30', dur: '2h 30m', col: P.terra },
    { task: 'Client call — Vega Corp', time: '13:00–14:00', dur: '1h 0m', col: P.sage },
  ];
  entries.forEach((e, i) => {
    const y = 455 + i * 62;
    ws.push(rect(20, y, 350, 52, P.white, 14));
    ws.push(rect(20, y, 4, 52, e.col, 2));
    ws.push(txt(32, y + 8, 240, 16, e.task, 13, P.ink, 600));
    ws.push(txt(32, y + 26, 160, 14, e.time, 11, P.inkMuted, 400));
    ws.push(txt(292, y + 8, 64, 16, e.dur, 12, e.col, 600, 'right'));
  });

  ws.push(rect(20, 592, 350, 38, P.sageLight, 12));
  ws.push(txt(36, 602, 314, 18, '✦  AI: You work best 9–12am — protect it.', 11, P.sage, 500));

  ws.push(...navBar(3));
  return { id: 's4', label: 'Time', backgroundColor: P.cream, widgets: ws };
}

// SCREEN 5 — AI Insights
function screen5() {
  const ws = [];
  ws.push(rect(0, 0, SW, SH, P.cream));
  ws.push(txt(20, 16, 200, 20, '9:41', 13, P.ink, 600));
  ws.push(rect(0, 44, SW, 96, P.terraLight));
  ws.push(txt(20, 56, 300, 28, '✦  Soleil Insights', 22, P.terra, 700));
  ws.push(txt(20, 82, 320, 18, 'Your AI clarity companion — weekly digest', 13, P.terra + 'AA', 400));

  ws.push(rect(20, 112, 350, 40, P.white, 12));
  ws.push(txt(36, 112, 200, 40, 'Clarity score · 82 / 100', 13, P.ink, 600));
  ws.push(rect(280, 122, 70, 20, P.sageLight, 6));
  ws.push(txt(280, 122, 70, 20, '↑ +6 pts', 10, P.sage, 600, 'center'));

  const insights = [
    { icon: '◎', title: 'Peak focus window', body: "You're most productive 9–12am. You complete 60% of deep work in that window. Block it every weekday.", cta: 'Block in calendar', col: P.terra, bg: P.terraLight },
    { icon: '◈', title: 'Cash flow: healthy', body: 'You have 18 days of runway. Helio invoice ($3,000) due Apr 14 — consider sending a reminder now.', cta: 'Send reminder', col: P.sage, bg: P.sageLight },
    { icon: '◉', title: 'Availability gap', body: 'Apr 18–20 is buffer. You can take a short project or rest — both are valid outcomes for your pace.', cta: 'Explore leads', col: P.gold, bg: P.goldLight },
  ];
  insights.forEach((ins, i) => {
    const y = 166 + i * 154;
    ws.push(rect(20, y, 350, 142, P.white, 18));
    ws.push(rect(20, y, 350, 5, ins.col, 0));
    ws.push(txt(36, y + 16, 38, 36, ins.icon, 24, ins.col, 400));
    ws.push(txt(76, y + 18, 258, 20, ins.title, 15, P.ink, 700));
    ws.push(txt(36, y + 50, 312, 40, ins.body, 12, P.inkMuted, 400));
    ws.push(rect(36, y + 104, 196, 26, ins.bg, 8));
    ws.push(txt(36, y + 104, 196, 26, ins.cta + ' →', 12, ins.col, 600, 'center'));
  });

  ws.push(...navBar(3));
  return { id: 's5', label: 'Insights', backgroundColor: P.cream, widgets: ws };
}

// SCREEN 6 — Onboarding
function screen6() {
  const ws = [];
  ws.push(rect(0, 0, SW, SH, P.white));
  ws.push(rect(0, 0, SW, SH * 0.45, P.cream));
  ws.push(circle(195, 194, 56, P.terraLight));
  ws.push(circle(195, 194, 40, P.terra + '40'));
  ws.push(txt(162, 172, 66, 44, '☀', 40, P.terra, 400, 'center'));
  ws.push(txt(0, 264, SW, 44, 'SOLEIL', 36, P.ink, 800, 'center'));
  ws.push(txt(0, 306, SW, 22, 'Clarity for freelancers', 15, P.inkMuted, 400, 'center'));

  const props = [
    { icon: '◎', text: 'Your clarity score — every day' },
    { icon: '◫', text: 'Projects & timeline in one view' },
    { icon: '✦', text: 'AI insights about your work life' },
  ];
  props.forEach((p, i) => {
    const y = 364 + i * 46;
    ws.push(rect(58, y, 274, 36, P.cream, 10));
    ws.push(txt(78, y, 34, 36, p.icon, 16, P.terra, 400));
    ws.push(txt(114, y, 202, 36, p.text, 13, P.ink, 500));
  });

  ws.push(rect(40, 536, 310, 52, P.terra, 16));
  ws.push(txt(40, 536, 310, 52, 'Get started free', 16, P.white, 700, 'center'));
  ws.push(txt(0, 598, SW, 20, 'Sign in with existing account', 13, P.terra, 500, 'center'));
  ws.push(txt(0, 642, SW, 16, 'No credit card · Cancel anytime', 11, P.inkMuted, 400, 'center'));

  [0, 1, 2].forEach((d, i) => {
    ws.push(circle(176 + i * 20, 692, i === 0 ? 5 : 3, i === 0 ? P.terra : P.border));
  });

  return { id: 's6', label: 'Onboarding', backgroundColor: P.white, widgets: ws };
}

// Assemble
const pen = {
  version: '2.8',
  meta: {
    name: 'SOLEIL',
    description: 'AI clarity dashboard for freelance creatives · Light theme',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    tags: ['freelance', 'productivity', 'ai', 'dashboard', 'light', 'warm'],
  },
  canvas: { width: SW, height: SH, deviceFrame: 'iphone14', zoom: 1 },
  screens: [screen1(), screen2(), screen3(), screen4(), screen5(), screen6()],
};

fs.writeFileSync('/workspace/group/design-studio/soleil.pen', JSON.stringify(pen, null, 2));
const total = pen.screens.reduce((a, s) => a + s.widgets.length, 0);
console.log(`✓ soleil.pen — ${pen.screens.length} screens, ${total} widgets`);
