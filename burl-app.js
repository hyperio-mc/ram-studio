'use strict';
// BURL — Heartbeat #50 | Theme: LIGHT | Warm Cream Editorial palette
// Inspired by: warm neutral counter-trend on Land-book & minimal.gallery
// Bold serif typography + bento grid dashboard + gamified milestones
// Freelance revenue & time tracker for independent makers

const fs   = require('fs');
const path = require('path');

const SLUG = 'burl';
const NAME = 'BURL';
const W = 390, H = 844;

// Palette — Light / Warm Cream Editorial
const P = {
  bg:      '#FAF7F2',
  surf:    '#FFFFFF',
  card:    '#F2EDE5',
  card2:   '#EDE7DD',
  text:    '#1C1410',
  textMid: '#4A3F36',
  muted:   '#9C8F85',
  accent:  '#4A7C59',   // forest green
  accent2: '#C4714A',   // warm terracotta
  accent3: '#8B6FAE',   // lavender (milestone)
  green:   '#6BA882',
  cream:   '#F7F2EA',
  line:    '#E0D8CE',
};

// ── primitives ────────────────────────────────────────────────────────────────

function rect(x, y, w, h, fill, opts = {}) {
  const el = { type: 'rect', x, y, w, h, fill };
  if (opts.rx)      el.rx      = opts.rx;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  if (opts.stroke)  el.stroke  = opts.stroke;
  if (opts.sw)      el.sw      = opts.sw;
  return el;
}

function text(x, y, content, size, fill, opts = {}) {
  const el = { type: 'text', x, y, content, size, fill };
  if (opts.fw)     el.fw     = opts.fw;
  if (opts.font)   el.font   = opts.font;
  if (opts.anchor) el.anchor = opts.anchor;
  if (opts.ls)     el.ls     = opts.ls;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  return el;
}

function circle(cx, cy, r, fill, opts = {}) {
  const el = { type: 'circle', cx, cy, r, fill };
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  if (opts.stroke)  el.stroke  = opts.stroke;
  if (opts.sw)      el.sw      = opts.sw;
  return el;
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  const el = { type: 'line', x1, y1, x2, y2, stroke };
  if (opts.sw)      el.sw      = opts.sw;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  return el;
}

// ── shared components ─────────────────────────────────────────────────────────

function statusBar(els) {
  els.push(rect(0, 0, W, 44, P.bg));
  els.push(text(20, 28, '9:41', 12, P.text, { fw: 600 }));
  els.push(text(370, 28, '●●● WiFi 100%', 10, P.textMid, { anchor: 'end' }));
}

function bottomNav(els, active) {
  els.push(rect(0, H - 80, W, 80, P.surf));
  els.push(line(0, H - 80, W, H - 80, P.line, { sw: 1 }));
  const tabs = [
    { icon: '⌂', label: 'Home', id: 0 },
    { icon: '◷', label: 'Time', id: 1 },
    { icon: '◈', label: 'Projects', id: 2 },
    { icon: '◎', label: 'Revenue', id: 3 },
    { icon: '○', label: 'Goals', id: 4 },
  ];
  tabs.forEach((t, i) => {
    const x = 39 + i * 78;
    const isActive = i === active;
    const col = isActive ? P.accent : P.muted;
    els.push(text(x, H - 52, t.icon, 20, col, { anchor: 'middle' }));
    els.push(text(x, H - 28, t.label, 9, col, { anchor: 'middle', fw: isActive ? 700 : 400 }));
    if (isActive) {
      els.push(rect(x - 12, H - 78, 24, 3, P.accent, { rx: 2 }));
    }
  });
}

function sectionLabel(els, x, y, label) {
  els.push(text(x, y, label.toUpperCase(), 9, P.muted, { ls: 1.5, fw: 600 }));
}

// ── Screen 1 — Dashboard (bento grid) ────────────────────────────────────────
function screenDashboard() {
  const els = [];
  statusBar(els);

  // Top header
  els.push(rect(0, 44, W, 72, P.bg));
  els.push(text(20, 78, 'Good morning, Sam.', 18, P.text, { fw: 700, font: 'serif' }));
  els.push(circle(355, 62, 18, P.card2));
  els.push(text(355, 67, 'S', 14, P.accent, { anchor: 'middle', fw: 700 }));

  // ── Bento grid: 3-cell row A ─────
  // Cell A1 — Monthly Revenue (large)
  els.push(rect(16, 124, 220, 140, P.accent, { rx: 16 }));
  els.push(text(32, 152, 'MONTHLY REVENUE', 8, 'rgba(255,255,255,0.65)', { ls: 1.5, fw: 600 }));
  els.push(text(32, 200, '$14,280', 36, '#FFFFFF', { fw: 800, font: 'serif' }));
  els.push(text(32, 222, '↑ 18% vs last month', 11, 'rgba(255,255,255,0.75)', { fw: 500 }));
  // green dot glow overlay
  els.push(circle(196, 124, 60, 'rgba(255,255,255,0.08)', { opacity: 1 }));

  // Cell A2 — Hours Logged
  els.push(rect(244, 124, 130, 65, P.card2, { rx: 16 }));
  els.push(text(259, 148, 'HOURS LOGGED', 8, P.muted, { ls: 1.2, fw: 600 }));
  els.push(text(259, 174, '124h', 24, P.text, { fw: 800 }));

  // Cell A3 — Active Projects
  els.push(rect(244, 197, 130, 67, P.card, { rx: 16 }));
  els.push(text(259, 221, 'PROJECTS', 8, P.muted, { ls: 1.2, fw: 600 }));
  els.push(text(259, 248, '6', 28, P.accent2, { fw: 800 }));
  els.push(text(284, 248, 'active', 12, P.textMid, { fw: 400 }));

  // ── Bento grid: Row B ──
  // Cell B1 — Invoices Due
  els.push(rect(16, 272, 130, 90, P.card, { rx: 16 }));
  els.push(text(31, 296, 'INVOICES', 8, P.muted, { ls: 1.2, fw: 600 }));
  els.push(text(31, 330, '3', 32, P.accent3, { fw: 800 }));
  els.push(text(52, 330, 'due', 12, P.textMid));
  els.push(text(31, 350, '$6,400 pending', 10, P.muted));

  // Cell B2 — Top Client
  els.push(rect(154, 272, 220, 90, P.surf, { rx: 16, stroke: P.line, sw: 1 }));
  els.push(text(169, 296, 'TOP CLIENT', 8, P.muted, { ls: 1.2, fw: 600 }));
  els.push(text(169, 326, 'Meridian Studio', 14, P.text, { fw: 700 }));
  els.push(text(169, 344, '$4,200 this month', 11, P.muted));
  // small bar
  els.push(rect(169, 354, 180, 4, P.line, { rx: 2 }));
  els.push(rect(169, 354, 126, 4, P.accent, { rx: 2 })); // 70% of max

  // ── Section: Recent Activity ─────
  sectionLabel(els, 20, 388, 'Recent Activity');

  const activities = [
    { label: 'Invoice #047 sent', sub: 'Meridian Studio', amt: '+$2,100', col: P.accent },
    { label: '6h logged', sub: 'Apex Rebranding', amt: 'Brand project', col: P.textMid },
    { label: 'Invoice #046 paid', sub: 'Verde Co.', amt: '+$1,800', col: P.accent },
  ];
  activities.forEach((a, i) => {
    const y = 402 + i * 58;
    els.push(rect(16, y, W - 32, 50, P.surf, { rx: 12, stroke: P.line, sw: 1 }));
    // dot indicator
    els.push(circle(38, y + 25, 6, a.col));
    els.push(text(54, y + 18, a.label, 13, P.text, { fw: 600 }));
    els.push(text(54, y + 35, a.sub, 11, P.muted));
    els.push(text(W - 28, y + 25, a.amt, 12, a.col, { anchor: 'end', fw: 700 }));
  });

  // Upcoming section
  sectionLabel(els, 20, 580, 'Upcoming');
  const upcoming = [
    { task: 'Client call — Meridian', time: 'Today 3:00 PM', icon: '◎' },
    { task: 'Invoice #047 due',       time: 'Apr 14',        icon: '◈' },
  ];
  upcoming.forEach((u, i) => {
    const y = 596 + i * 52;
    els.push(rect(16, y, W - 32, 44, P.surf, { rx: 10, stroke: P.line, sw: 1 }));
    els.push(rect(24, y + 12, 20, 20, P.card2, { rx: 6 }));
    els.push(text(34, y + 26, u.icon, 10, P.accent, { anchor: 'middle' }));
    els.push(text(54, y + 20, u.task, 12, P.text, { fw: 600 }));
    els.push(text(54, y + 36, u.time, 10, P.muted));
    els.push(text(W - 24, y + 28, '›', 16, P.muted, { anchor: 'end' }));
  });

  // Quick add button
  els.push(rect(16, 704, W - 32, 44, P.accent, { rx: 22 }));
  els.push(text(W / 2, 731, '+ Log Time', 13, '#FFF', { anchor: 'middle', fw: 700 }));

  bottomNav(els, 0);
  return els;
}

// ── Screen 2 — Time Log ───────────────────────────────────────────────────────
function screenTimeLog() {
  const els = [];
  statusBar(els);

  els.push(rect(0, 44, W, H - 44, P.bg));
  els.push(text(20, 82, 'Time Log', 24, P.text, { fw: 800, font: 'serif' }));
  els.push(text(20, 102, 'Week of Apr 7–13', 12, P.muted));

  // Weekly bar chart
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const hours = [8, 6.5, 9, 7, 5, 3, 0];
  const maxH = 9;
  const barW = 36, gap = 18;
  const chartTop = 190, chartH = 90;

  els.push(rect(16, 118, W - 32, 130, P.surf, { rx: 16, stroke: P.line, sw: 1 }));
  els.push(text(W / 2, 140, 'Weekly Hours — 38.5h', 11, P.text, { anchor: 'middle', fw: 600 }));

  days.forEach((d, i) => {
    const x = 28 + i * (barW + gap);
    const h  = (hours[i] / maxH) * chartH;
    const isToday = i === 4;
    els.push(rect(x, chartTop + chartH - h, barW, h, isToday ? P.accent : P.card2, { rx: 6 }));
    if (h > 10) els.push(text(x + barW / 2, chartTop + chartH - h - 6, `${hours[i]}`, 9, isToday ? P.accent : P.textMid, { anchor: 'middle', fw: 600 }));
    els.push(text(x + barW / 2, chartTop + chartH + 14, d, 10, isToday ? P.accent : P.muted, { anchor: 'middle', fw: isToday ? 700 : 400 }));
  });

  // Today's breakdown
  sectionLabel(els, 20, 270, "Today's Sessions");

  const sessions = [
    { proj: 'Meridian Studio', task: 'Brand guidelines doc', dur: '2h 15m', start: '9:00 AM' },
    { proj: 'Apex Rebranding', task: 'Logo iterations',      dur: '1h 45m', start: '11:30 AM' },
    { proj: 'Personal',        task: 'Admin & invoicing',    dur: '45m',    start: '2:00 PM' },
  ];

  sessions.forEach((s, i) => {
    const y = 285 + i * 72;
    els.push(rect(16, y, W - 32, 64, P.surf, { rx: 12, stroke: P.line, sw: 1 }));
    // left accent strip
    els.push(rect(16, y, 4, 64, i === 0 ? P.accent : i === 1 ? P.accent2 : P.accent3, { rx: 0 }));
    els.push(rect(16, y, 4, 64, i === 0 ? P.accent : i === 1 ? P.accent2 : P.accent3, { rx: 2 }));
    els.push(text(32, y + 22, s.proj, 13, P.text, { fw: 700 }));
    els.push(text(32, y + 40, s.task, 11, P.muted));
    els.push(text(W - 28, y + 22, s.dur, 13, P.text, { anchor: 'end', fw: 700 }));
    els.push(text(W - 28, y + 40, s.start, 10, P.muted, { anchor: 'end' }));
  });

  // Active timer
  els.push(rect(16, 506, W - 32, 64, P.accent, { rx: 16 }));
  els.push(circle(42, 538, 12, 'rgba(255,255,255,0.2)'));
  els.push(text(42, 543, '▶', 10, '#FFF', { anchor: 'middle' }));
  els.push(text(64, 526, 'Verde Co. — UX review', 13, '#FFF', { fw: 700 }));
  els.push(text(64, 544, 'Running: 0h 23m', 11, 'rgba(255,255,255,0.75)'));
  els.push(rect(W - 60, 521, 40, 34, 'rgba(255,255,255,0.2)', { rx: 10 }));
  els.push(text(W - 40, 542, '■', 14, '#FFF', { anchor: 'middle' }));

  // Weekly goal progress
  els.push(rect(16, 584, W - 32, 60, P.card, { rx: 12 }));
  els.push(text(32, 606, 'Weekly goal: 40h', 12, P.text, { fw: 600 }));
  els.push(text(W - 28, 606, '38.5 / 40h', 12, P.accent, { anchor: 'end', fw: 700 }));
  els.push(rect(32, 618, W - 64, 8, P.line, { rx: 4 }));
  els.push(rect(32, 618, (38.5 / 40) * (W - 64), 8, P.accent, { rx: 4 }));
  els.push(text(32, 640, '96% complete — almost there!', 10, P.muted, { fw: 500 }));

  // Rate card
  els.push(rect(16, 656, W - 32, 56, P.card, { rx: 12 }));
  els.push(text(32, 678, 'Avg hourly rate', 12, P.text, { fw: 600 }));
  els.push(text(32, 696, 'Based on 38.5h / $14,280 earned', 10, P.muted));
  els.push(text(W - 28, 678, '$371 / hr', 16, P.accent, { anchor: 'end', fw: 800 }));
  // calendar icon row
  ['M','T','W','T','F','S','S'].forEach((d, i) => {
    const cx = 30 + i * 46;
    const logged = [true,true,true,true,true,true,false][i];
    els.push(circle(cx, 730, 14, logged ? P.accent : P.card2));
    els.push(text(cx, 735, d, 9, logged ? '#FFF' : P.muted, { anchor: 'middle', fw: 600 }));
  });
  els.push(text(W - 20, 730, 'This week', 10, P.muted, { anchor: 'end' }));

  bottomNav(els, 1);
  return els;
}

// ── Screen 3 — Projects ───────────────────────────────────────────────────────
function screenProjects() {
  const els = [];
  statusBar(els);

  els.push(rect(0, 44, W, H - 44, P.bg));
  els.push(text(20, 82, 'Projects', 24, P.text, { fw: 800, font: 'serif' }));

  // Filter tabs
  const tabs = ['All', 'Active', 'Pending', 'Done'];
  tabs.forEach((t, i) => {
    const tw = 60, tx = 16 + i * (tw + 8);
    const isActive = i === 1;
    els.push(rect(tx, 94, tw, 28, isActive ? P.accent : P.surf, { rx: 14, stroke: P.line, sw: isActive ? 0 : 1 }));
    els.push(text(tx + tw / 2, 113, t, 11, isActive ? '#FFF' : P.textMid, { anchor: 'middle', fw: isActive ? 700 : 400 }));
  });

  const projects = [
    { name: 'Meridian Studio', type: 'Brand Identity', status: 'Active',  pct: 65, earned: '$4,200', budget: '$7,000', col: P.accent },
    { name: 'Apex Rebranding', type: 'Logo Design',    status: 'Active',  pct: 40, earned: '$1,600', budget: '$4,000', col: P.accent2 },
    { name: 'Verde Co.',       type: 'UX Strategy',    status: 'Active',  pct: 85, earned: '$3,400', budget: '$4,000', col: P.accent3 },
    { name: 'Lakewood Foods',  type: 'Packaging',      status: 'Active',  pct: 20, earned: '$800',   budget: '$5,000', col: P.green },
    { name: 'Crest Media',     type: 'Motion',         status: 'Active',  pct: 55, earned: '$2,800', budget: '$5,500', col: P.accent2 },
  ];

  projects.forEach((p, i) => {
    const y = 132 + i * 100;
    els.push(rect(16, y, W - 32, 90, P.surf, { rx: 14, stroke: P.line, sw: 1 }));
    // Color dot
    els.push(circle(36, y + 24, 8, p.col));
    els.push(text(52, y + 28, p.name, 14, P.text, { fw: 700 }));
    els.push(text(52, y + 46, p.type, 11, P.muted));
    // Earned / budget
    els.push(text(W - 28, y + 28, p.earned, 13, P.text, { anchor: 'end', fw: 700 }));
    els.push(text(W - 28, y + 46, `of ${p.budget}`, 10, P.muted, { anchor: 'end' }));
    // Progress bar
    els.push(rect(24, y + 64, W - 56, 6, P.line, { rx: 3 }));
    els.push(rect(24, y + 64, (p.pct / 100) * (W - 56), 6, p.col, { rx: 3 }));
    els.push(text(24, y + 82, `${p.pct}% complete`, 9, P.muted));
    els.push(text(W - 28, y + 82, p.status, 9, p.col, { anchor: 'end', fw: 600 }));
  });

  bottomNav(els, 2);
  return els;
}

// ── Screen 4 — Revenue Breakdown ─────────────────────────────────────────────
function screenRevenue() {
  const els = [];
  statusBar(els);

  els.push(rect(0, 44, W, H - 44, P.bg));
  els.push(text(20, 82, 'Revenue', 24, P.text, { fw: 800, font: 'serif' }));
  els.push(text(20, 102, 'April 2026', 12, P.muted));

  // Large revenue card
  els.push(rect(16, 116, W - 32, 110, P.accent, { rx: 20 }));
  els.push(circle(330, 146, 55, 'rgba(255,255,255,0.07)'));
  els.push(text(32, 148, 'TOTAL EARNED', 9, 'rgba(255,255,255,0.65)', { ls: 1.5, fw: 600 }));
  els.push(text(32, 192, '$14,280', 42, '#FFFFFF', { fw: 900, font: 'serif' }));
  els.push(text(32, 214, 'vs last month  $12,100  ↑ 18%', 11, 'rgba(255,255,255,0.7)'));

  // By category
  sectionLabel(els, 20, 244, 'By Category');

  const cats = [
    { name: 'Brand Identity',  amt: '$5,800', pct: 40, col: P.accent },
    { name: 'UX / Strategy',   amt: '$3,400', pct: 24, col: P.accent3 },
    { name: 'Motion Design',   amt: '$2,800', pct: 20, col: P.accent2 },
    { name: 'Packaging',       amt: '$1,480', pct: 10, col: P.green },
    { name: 'Consulting',      amt: '$800',   pct: 6,  col: P.card2 },
  ];

  cats.forEach((c, i) => {
    const y = 260 + i * 52;
    els.push(text(20, y + 16, c.name, 13, P.text, { fw: 600 }));
    els.push(text(20, y + 32, `${c.pct}% of total`, 10, P.muted));
    els.push(text(W - 20, y + 16, c.amt, 13, P.text, { anchor: 'end', fw: 700 }));
    els.push(rect(20, y + 38, W - 40, 5, P.line, { rx: 2.5 }));
    els.push(rect(20, y + 38, (c.pct / 100) * (W - 40), 5, c.col, { rx: 2.5 }));
  });

  // Monthly trend mini-chart
  sectionLabel(els, 20, 530, '6-Month Trend');
  const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const vals   = [8200, 11400, 9600, 10800, 12100, 14280];
  const maxV   = 15000;
  const bw2 = 40, bh2 = 80, gap2 = 18;

  els.push(rect(16, 544, W - 32, 110, P.surf, { rx: 14, stroke: P.line, sw: 1 }));
  months.forEach((m, i) => {
    const x = 30 + i * (bw2 + gap2);
    const h = (vals[i] / maxV) * bh2;
    const isLast = i === 5;
    els.push(rect(x, 544 + 10 + bh2 - h, bw2, h, isLast ? P.accent : P.card2, { rx: 4 }));
    els.push(text(x + bw2 / 2, 544 + 104, m, 8, isLast ? P.accent : P.muted, { anchor: 'middle', fw: isLast ? 700 : 400 }));
  });

  // YTD total
  els.push(rect(16, 664, W - 32, 48, P.card, { rx: 12 }));
  els.push(text(32, 682, 'Year-to-date total', 12, P.text, { fw: 600 }));
  els.push(text(32, 700, 'Jan – Apr 2026', 10, P.muted));
  els.push(text(W - 28, 682, '$68,200', 18, P.accent, { anchor: 'end', fw: 800 }));
  // small sparkline
  const spx = [260,280,300,320,340,360];
  const spy = [718,714,716,710,708,700];
  spx.forEach((x, i) => {
    if (i < spx.length - 1) {
      els.push(line(x, spy[i], spx[i+1], spy[i+1], P.accent, { sw: 2 }));
    }
    els.push(circle(x, spy[i], 3, P.accent));
  });

  bottomNav(els, 3);
  return els;
}

// ── Screen 5 — Invoices ───────────────────────────────────────────────────────
function screenInvoices() {
  const els = [];
  statusBar(els);

  els.push(rect(0, 44, W, H - 44, P.bg));
  els.push(text(20, 82, 'Invoices', 24, P.text, { fw: 800, font: 'serif' }));

  // Summary row
  const sumCards = [
    { label: 'Pending', val: '$6,400', col: P.accent2 },
    { label: 'Paid',    val: '$7,880', col: P.accent  },
    { label: 'Draft',   val: '$2,000', col: P.muted   },
  ];
  sumCards.forEach((s, i) => {
    const x = 16 + i * 122;
    els.push(rect(x, 96, 114, 56, P.surf, { rx: 12, stroke: P.line, sw: 1 }));
    els.push(text(x + 57, 122, s.val, 16, s.col, { anchor: 'middle', fw: 800 }));
    els.push(text(x + 57, 140, s.label, 9, P.muted, { anchor: 'middle', ls: 1.2, fw: 600 }));
  });

  sectionLabel(els, 20, 168, 'All Invoices');

  const invoices = [
    { num: '#047', client: 'Meridian Studio', desc: 'Brand guidelines',   amt: '$2,100', status: 'Sent',    scol: P.accent2 },
    { num: '#046', client: 'Verde Co.',       desc: 'UX Strategy Phase 1',amt: '$1,800', status: 'Paid',    scol: P.accent  },
    { num: '#045', client: 'Apex Rebranding', desc: 'Logo concepts',      amt: '$1,600', status: 'Pending', scol: P.accent2 },
    { num: '#044', client: 'Lakewood Foods',  desc: 'Packaging Round 1',  amt: '$2,000', status: 'Draft',   scol: P.muted   },
    { num: '#043', client: 'Crest Media',     desc: 'Motion reel edit',   amt: '$2,800', status: 'Paid',    scol: P.accent  },
    { num: '#042', client: 'Meridian Studio', desc: 'Discovery session',  amt: '$900',   status: 'Paid',    scol: P.accent  },
  ];

  invoices.forEach((inv, i) => {
    const y = 182 + i * 76;
    els.push(rect(16, y, W - 32, 68, P.surf, { rx: 12, stroke: P.line, sw: 1 }));
    // Invoice number badge
    els.push(rect(24, y + 10, 40, 20, P.card2, { rx: 6 }));
    els.push(text(44, y + 24, inv.num, 9, P.textMid, { anchor: 'middle', fw: 700 }));
    els.push(text(74, y + 24, inv.client, 13, P.text, { fw: 700 }));
    els.push(text(74, y + 42, inv.desc, 10, P.muted));
    // Amount
    els.push(text(W - 28, y + 24, inv.amt, 13, P.text, { anchor: 'end', fw: 700 }));
    // Status badge
    els.push(rect(W - 28 - 56, y + 46, 56, 16, 'transparent', { rx: 8, stroke: inv.scol, sw: 1 }));
    els.push(text(W - 28 - 28, y + 58, inv.status, 8, inv.scol, { anchor: 'middle', fw: 600 }));
  });

  bottomNav(els, 2);
  return els;
}

// ── Screen 6 — Goals & Milestones ────────────────────────────────────────────
function screenGoals() {
  const els = [];
  statusBar(els);

  els.push(rect(0, 44, W, H - 44, P.bg));
  els.push(text(20, 82, 'Goals', 24, P.text, { fw: 800, font: 'serif' }));
  els.push(text(20, 102, 'Your milestones', 12, P.muted));

  // Annual goal ring card
  els.push(rect(16, 116, W - 32, 150, P.surf, { rx: 20, stroke: P.line, sw: 1 }));
  // Ring (simulated with concentric circles)
  const cx2 = 95, cy2 = 196;
  els.push(circle(cx2, cy2, 50, P.card2));
  els.push(circle(cx2, cy2, 50, 'transparent', { stroke: P.line, sw: 12 }));
  els.push(circle(cx2, cy2, 50, 'transparent', { stroke: P.accent, sw: 12, opacity: 0.9 }));
  // "57%" text inside
  els.push(text(cx2, cy2 - 6, '57%', 18, P.text, { anchor: 'middle', fw: 800 }));
  els.push(text(cx2, cy2 + 12, 'annual', 9, P.muted, { anchor: 'middle' }));
  // Right side
  els.push(text(178, 148, 'Annual Revenue Goal', 13, P.text, { fw: 700 }));
  els.push(text(178, 166, '$120,000 target', 11, P.muted));
  els.push(text(178, 196, '$68,200', 24, P.accent, { fw: 800 }));
  els.push(text(178, 218, 'earned so far', 11, P.muted));
  els.push(text(178, 238, '$51,800 remaining', 10, P.textMid, { fw: 500 }));

  // Milestone badges
  sectionLabel(els, 20, 282, 'Milestones');

  const milestones = [
    { title: 'First $10K Month',  date: 'Feb 2026', done: true,  icon: '★' },
    { title: '100 Hours Tracked', date: 'Mar 2026', done: true,  icon: '◷' },
    { title: 'First Retainer',    date: 'Mar 2026', done: true,  icon: '◈' },
    { title: '$50K Annual',       date: 'On track', done: false, icon: '◎' },
    { title: 'First $15K Month',  date: 'Set goal', done: false, icon: '△' },
  ];

  milestones.forEach((m, i) => {
    const y = 298 + i * 60;
    const col = m.done ? P.accent : P.muted;
    els.push(rect(16, y, W - 32, 52, m.done ? P.cream : P.surf, { rx: 12, stroke: m.done ? P.line : P.line, sw: 1 }));
    // icon badge
    els.push(rect(28, y + 12, 28, 28, m.done ? P.accent : P.card2, { rx: 8 }));
    els.push(text(42, y + 30, m.icon, 12, m.done ? '#FFF' : P.muted, { anchor: 'middle' }));
    els.push(text(66, y + 24, m.title, 13, P.text, { fw: m.done ? 700 : 500 }));
    els.push(text(66, y + 40, m.date, 10, col));
    if (m.done) {
      els.push(rect(W - 68, y + 14, 44, 22, P.accent, { rx: 11 }));
      els.push(text(W - 46, y + 29, '✓ Done', 9, '#FFF', { anchor: 'middle', fw: 700 }));
    } else {
      els.push(rect(W - 68, y + 14, 44, 22, P.card2, { rx: 11 }));
      els.push(text(W - 46, y + 29, 'Soon', 9, P.muted, { anchor: 'middle', fw: 600 }));
    }
  });

  bottomNav(els, 4);
  return els;
}

// ── Assemble pen ──────────────────────────────────────────────────────────────

const screens = [
  { name: 'Dashboard',  fn: screenDashboard },
  { name: 'Time Log',   fn: screenTimeLog   },
  { name: 'Projects',   fn: screenProjects  },
  { name: 'Revenue',    fn: screenRevenue   },
  { name: 'Invoices',   fn: screenInvoices  },
  { name: 'Goals',      fn: screenGoals     },
];

let totalEls = 0;
const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'light',
    heartbeat: 50,
    elements: 0,
    palette: {
      bg: P.bg, surface: P.surf, text: P.text,
      accent: P.accent, accent2: P.accent2,
    },
  },
  screens: screens.map(s => {
    const elements = s.fn();
    totalEls += elements.length;
    return { name: s.name, svg: `${W}x${H}`, elements };
  }),
};
pen.metadata.elements = totalEls;

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${pen.screens.length} screens, ${totalEls} elements`);
console.log(`Written: ${SLUG}.pen`);
