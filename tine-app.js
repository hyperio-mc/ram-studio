'use strict';
const fs   = require('fs');
const path = require('path');

// ─── TINE — Freelance Time Tracking & Invoicing ───────────────────────────
// Heartbeat design — light theme
// Inspired by:
//   • minimal.gallery — "warm minimalism" (Molo, The Daily Dispatch): off-white
//     paper tones, typographic hierarchy as the primary visual language
//   • Awwwards SOTD "Nine To Five": zig-zag modular layout, fluid type scaling,
//     systematic whitespace over decoration
// Challenge: typography-first light UI with serif-style numerals as hero elements,
//   warm paper palette (#FAF8F4), and single restrained green accent.
// ──────────────────────────────────────────────────────────────────────────

const SLUG  = 'tine';
const NAME  = 'TINE';
const W     = 390;
const H     = 844;

// ── Palette ──────────────────────────────────────────────────────────────
const BG      = '#FAF8F4';   // warm parchment — minimal.gallery warm minimalism
const SURF    = '#FFFFFF';   // clean card surface
const CARD    = '#F3EFE9';   // warm off-white card
const RULE    = '#E8E2D8';   // hairline separator
const TEXT    = '#1C1916';   // near-black, warm undertone
const TEXT2   = '#5C5650';   // secondary label
const TEXT3   = '#9C948A';   // tertiary / muted
const ACC     = '#2B5C3A';   // forest green accent — restrained, single accent
const ACC2    = '#8C6515';   // warm amber accent2 — invoice highlight
const ACCL    = '#EBF3EE';   // accent light bg tint
const AMBER_L = '#FBF3E3';   // amber tint bg

// ── Primitives ────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, w, h, fill,
    rx:      opts.rx      ?? 0,
    opacity: opts.opacity ?? 1,
    stroke:  opts.stroke  ?? 'none',
    sw:      opts.sw      ?? 0,
  };
}
function text(x, y, content, size, fill, opts = {}) {
  return {
    type: 'text', x, y, content, size, fill,
    fw:      opts.fw     ?? 400,
    font:    opts.font   ?? 'Inter',
    anchor:  opts.anchor ?? 'start',
    ls:      opts.ls     ?? 0,
    opacity: opts.opacity ?? 1,
  };
}
function circle(cx, cy, r, fill, opts = {}) {
  return {
    type: 'circle', cx, cy, r, fill,
    opacity: opts.opacity ?? 1,
    stroke:  opts.stroke  ?? 'none',
    sw:      opts.sw      ?? 0,
  };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return {
    type: 'line', x1, y1, x2, y2, stroke,
    sw:      opts.sw      ?? 1,
    opacity: opts.opacity ?? 1,
  };
}

// ── Component helpers ────────────────────────────────────────────────────

function statusBar(els) {
  els.push(rect(0, 0, W, 44, BG));
  els.push(text(16, 30, '9:41', 13, TEXT, { fw: 600 }));
  els.push(text(W - 16, 30, '●●● ◀ 87%', 11, TEXT3, { anchor: 'end' }));
}

function navBar(els, activeIndex) {
  // 5 tabs: Today, Projects, Log, Clients, Reports
  const tabs = [
    { label: 'Today',    icon: '◎' },
    { label: 'Projects', icon: '▦' },
    { label: 'Log',      icon: '≡' },
    { label: 'Clients',  icon: '◑' },
    { label: 'Reports',  icon: '▲' },
  ];
  els.push(rect(0, H - 80, W, 80, SURF, { stroke: RULE, sw: 1 }));
  const tw = W / tabs.length;
  tabs.forEach((t, i) => {
    const cx = tw * i + tw / 2;
    const isActive = i === activeIndex;
    const col = isActive ? ACC : TEXT3;
    els.push(text(cx, H - 52, t.icon, 16, col, { anchor: 'middle' }));
    els.push(text(cx, H - 32, t.label, 10, col, { anchor: 'middle', fw: isActive ? 600 : 400 }));
    if (isActive) {
      els.push(rect(cx - 14, H - 78, 28, 2, ACC, { rx: 1 }));
    }
  });
}

function screenHeader(els, title, sub) {
  els.push(rect(0, 44, W, 56, BG));
  els.push(text(16, 74, title, 22, TEXT, { fw: 700, font: 'Inter' }));
  if (sub) els.push(text(16, 91, sub, 12, TEXT3, { fw: 400 }));
}

function sectionLabel(els, y, label) {
  els.push(text(16, y, label.toUpperCase(), 9, TEXT3, { fw: 600, ls: 1.4 }));
}

function hairline(els, y) {
  els.push(line(16, y, W - 16, y, RULE, { sw: 1 }));
}

// ── Screen 1: TODAY ───────────────────────────────────────────────────────
function buildToday() {
  const els = [];
  statusBar(els);

  // Header zone
  els.push(rect(0, 44, W, 48, BG));
  els.push(text(16, 70, 'Today', 24, TEXT, { fw: 700 }));
  els.push(text(W - 16, 70, 'Apr 12', 13, TEXT3, { anchor: 'end' }));

  // ── Hero timer card — the centrepiece ──────────────────────────────────
  // Inspired by The Daily Dispatch typographic hierarchy: big number leads
  els.push(rect(16, 102, W - 32, 154, SURF, { rx: 12, stroke: RULE, sw: 1 }));

  // Active project chip
  els.push(rect(24, 112, 140, 22, ACCL, { rx: 11 }));
  els.push(circle(34, 123, 5, ACC));
  els.push(text(44, 127, 'Oramund — Brand Identity', 11, ACC, { fw: 600 }));

  // The big serif-style timer — typography as hero
  els.push(text(W / 2, 190, '02:47:33', 52, TEXT, { fw: 300, anchor: 'middle', font: 'Inter', ls: -2 }));
  els.push(text(W / 2, 210, 'running', 11, TEXT3, { anchor: 'middle', ls: 2 }));

  // Stop / pause controls
  const btnY = 226;
  els.push(rect(W / 2 - 60, btnY, 50, 22, CARD, { rx: 11 }));
  els.push(text(W / 2 - 35, btnY + 15, '⏸ Pause', 11, TEXT2, { anchor: 'middle' }));
  els.push(rect(W / 2 + 10, btnY, 50, 22, ACC, { rx: 11 }));
  els.push(text(W / 2 + 35, btnY + 15, '■ Stop', 11, SURF, { anchor: 'middle', fw: 600 }));

  // ── Daily summary bar ─────────────────────────────────────────────────
  const sumY = 272;
  els.push(rect(16, sumY, W - 32, 72, CARD, { rx: 10 }));

  const cols = [
    { label: 'Billable', value: '4h 12m', sub: '£ 336', cx: 16 + (W - 32) / 6 },
    { label: 'Non-bill', value: '1h 08m', sub: '—',   cx: 16 + (W - 32) / 2 },
    { label: 'Earnings', value: '£ 672',  sub: 'today', cx: 16 + (W - 32) * 5 / 6 },
  ];
  cols.forEach(c => {
    els.push(text(c.cx, sumY + 18, c.label, 9, TEXT3, { anchor: 'middle', ls: 1 }));
    els.push(text(c.cx, sumY + 40, c.value, 17, TEXT, { anchor: 'middle', fw: 600 }));
    els.push(text(c.cx, sumY + 56, c.sub,   10, TEXT3, { anchor: 'middle' }));
  });
  // dividers between cols
  els.push(line(16 + (W - 32) / 3, sumY + 12, 16 + (W - 32) / 3, sumY + 60, RULE));
  els.push(line(16 + (W - 32) * 2 / 3, sumY + 12, 16 + (W - 32) * 2 / 3, sumY + 60, RULE));

  // ── Log entries for today ─────────────────────────────────────────────
  sectionLabel(els, 366, 'Earlier today');

  const entries = [
    { project: 'Oramund', task: 'Wireframes review',      dur: '1h 32m', bill: '£ 184', col: ACC },
    { project: 'Vellum Press', task: 'Type spec doc',     dur: '48m',    bill: '£ 72',  col: ACC2 },
    { project: 'Oramund', task: 'Client call',            dur: '52m',    bill: '—',     col: ACC },
    { project: 'Vellum Press', task: 'Asset export',      dur: '1h 00m', bill: '£ 120', col: ACC2 },
  ];

  let ey = 380;
  entries.forEach((e, i) => {
    els.push(rect(16, ey, W - 32, 52, SURF, { rx: 8, stroke: RULE, sw: 1 }));
    // colour stripe
    els.push(rect(16, ey, 3, 52, e.col, { rx: 0 }));
    els.push(text(28, ey + 18, e.project, 11, TEXT2, { fw: 600 }));
    els.push(text(28, ey + 34, e.task,    12, TEXT,  { fw: 400 }));
    els.push(text(W - 24, ey + 18, e.dur,  11, TEXT3, { anchor: 'end' }));
    els.push(text(W - 24, ey + 34, e.bill, 13, e.bill === '—' ? TEXT3 : TEXT, { anchor: 'end', fw: 600 }));
    ey += 58;
  });

    // ── Weekly sparkline hint ─────────────────────────────────────────────
  const sparkY = ey + 8;
  sectionLabel(els, sparkY + 2, 'This week');
  const sparkDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const sparkHrs  = [7.2, 6.8, 8.1, 5.5, 9.0, 4.2, 0];
  const sparkW    = (W - 48) / 7;
  const sparkMaxH = 32;
  const sparkBaseY = sparkY + 42;
  sparkDays.forEach((day, i) => {
    const bh  = (sparkHrs[i] / 10) * sparkMaxH;
    const bx  = 16 + i * sparkW + sparkW * 0.15;
    const bwi = sparkW * 0.7;
    const isToday = i === 5;
    els.push(rect(bx, sparkBaseY - bh, bwi, bh, isToday ? ACC : CARD, { rx: 3, opacity: isToday ? 1 : 0.9 }));
    els.push(text(bx + bwi / 2, sparkBaseY + 12, day, 8, isToday ? ACC : TEXT3, { anchor: 'middle', fw: isToday ? 700 : 400 }));
    if (sparkHrs[i] > 0) {
      els.push(text(bx + bwi / 2, sparkBaseY - bh - 4, `${sparkHrs[i]}`, 8, TEXT3, { anchor: 'middle' }));
    }
  });

  // ── Total week summary ─────────────────────────────────────────────────
  const weekTotalY = sparkBaseY + 22;
  els.push(text(16, weekTotalY, 'Weekly total', 11, TEXT2));
  els.push(text(W - 16, weekTotalY, '40h 48m  ·  £ 4,032', 12, TEXT, { anchor: 'end', fw: 600 }));

  // ── Upcoming due ──────────────────────────────────────────────────────
  const dueY = weekTotalY + 18;
  sectionLabel(els, dueY + 2, 'Invoice due soon');
  els.push(rect(16, dueY + 14, W - 32, 40, AMBER_L, { rx: 8 }));
  els.push(text(24, dueY + 30, '⚠', 12, ACC2));
  els.push(text(40, dueY + 30, 'Vellum Press — INV-0040', 12, TEXT, { fw: 500 }));
  els.push(text(40, dueY + 44, 'Due Apr 15  ·  £ 1,680', 10, ACC2));
  els.push(text(W - 24, dueY + 38, 'Review →', 11, ACC2, { anchor: 'end', fw: 600 }));

  // ── Start new timer FAB ────────────────────────────────────────────────
  els.push(circle(W - 32, H - 100, 24, ACC));
  els.push(text(W - 32, H - 94, '+', 22, SURF, { anchor: 'middle', fw: 300 }));

  navBar(els, 0);
  return els;
}

// ── Screen 2: PROJECTS ────────────────────────────────────────────────────
function buildProjects() {
  const els = [];
  statusBar(els);
  screenHeader(els, 'Projects', '6 active  ·  £ 12,440 tracked');

  // Sort / filter row
  els.push(rect(0, 100, W, 40, BG));
  const filters = ['All', 'Active', 'Invoiced', 'Archived'];
  let fx = 16;
  filters.forEach((f, i) => {
    const w = f.length * 8 + 20;
    const active = i === 0;
    els.push(rect(fx, 108, w, 24, active ? ACC : CARD, { rx: 12 }));
    els.push(text(fx + w / 2, 124, f, 11, active ? SURF : TEXT2, { anchor: 'middle', fw: active ? 600 : 400 }));
    fx += w + 8;
  });

  // Project cards — each with progress bar
  const projects = [
    { name: 'Oramund Brand Identity', client: 'Oramund Ltd',     hrs: 28, budget: 40, earned: '£ 3,360', status: 'Active',   col: ACC },
    { name: 'Vellum Press Type System', client: 'Vellum Press', hrs: 14, budget: 20, earned: '£ 1,680', status: 'Active',   col: ACC2 },
    { name: 'Tidewater App UI',         client: 'Tidewater Co', hrs: 52, budget: 60, earned: '£ 6,240', status: 'Active',   col: '#5B6FA3' },
    { name: 'Kessler Annual Report',    client: 'Kessler AG',   hrs: 8,  budget: 8,  earned: '£ 960',   status: 'Invoiced', col: TEXT3 },
  ];

  let py = 152;
  projects.forEach(p => {
    const pct = Math.min(p.hrs / p.budget, 1);
    els.push(rect(16, py, W - 32, 92, SURF, { rx: 10, stroke: RULE, sw: 1 }));

    // Status badge
    const badgeW = p.status.length * 7 + 14;
    const badgeCol = p.status === 'Active' ? ACCL : CARD;
    const badgeText = p.status === 'Active' ? ACC : TEXT3;
    els.push(rect(W - 16 - badgeW, py + 12, badgeW, 18, badgeCol, { rx: 9 }));
    els.push(text(W - 16 - badgeW / 2, py + 24, p.status, 9, badgeText, { anchor: 'middle', fw: 600 }));

    // Project name
    els.push(text(24, py + 22, p.name, 14, TEXT, { fw: 600 }));
    els.push(text(24, py + 38, p.client, 11, TEXT3, { fw: 400 }));

    // Hours / earnings
    els.push(text(24, py + 56, `${p.hrs}h / ${p.budget}h`, 11, TEXT2));
    els.push(text(W - 24, py + 56, p.earned, 13, TEXT, { anchor: 'end', fw: 600 }));

    // Progress bar
    const barY = py + 70;
    els.push(rect(24, barY, W - 48, 6, CARD, { rx: 3 }));
    els.push(rect(24, barY, (W - 48) * pct, 6, p.col, { rx: 3 }));

    py += 98;
  });

  // ── Monthly earnings strip ────────────────────────────────────────────
  sectionLabel(els, py + 4, 'This month');
  const mstrpY = py + 18;
  els.push(rect(16, mstrpY, W - 32, 52, CARD, { rx: 10 }));
  const mItems = [
    { label: 'Hours logged', val: '48h 22m' },
    { label: 'Billable earned', val: '£ 5,040' },
    { label: 'Invoices sent', val: '2' },
  ];
  mItems.forEach((m, i) => {
    const cx = 16 + (W - 32) * (i + 0.5) / mItems.length;
    els.push(text(cx, mstrpY + 16, m.label, 8, TEXT3, { anchor: 'middle', ls: 0.5 }));
    els.push(text(cx, mstrpY + 38, m.val,   13, TEXT,  { anchor: 'middle', fw: 600 }));
  });
  for (let d = 1; d < mItems.length; d++) {
    const dx = 16 + (W - 32) * d / mItems.length;
    els.push(line(dx, mstrpY + 6, dx, mstrpY + 46, RULE));
  }

  // New project CTA
  const newProjY = mstrpY + 62;
  els.push(rect(16, newProjY, W - 32, 44, CARD, { rx: 10, stroke: ACC, sw: 1 }));
  els.push(text(W / 2, newProjY + 26, '+ New project', 13, ACC, { anchor: 'middle', fw: 600 }));

  navBar(els, 1);
  return els;
}

// ── Screen 3: LOG ─────────────────────────────────────────────────────────
function buildLog() {
  const els = [];
  statusBar(els);
  screenHeader(els, 'Time Log', 'Oramund Brand Identity');

  // Back breadcrumb
  els.push(text(16, 58, '‹ Projects', 12, ACC, { fw: 500 }));

  // Project summary card
  els.push(rect(16, 102, W - 32, 80, ACCL, { rx: 10 }));
  els.push(text(24, 122, 'Oramund Brand Identity', 14, ACC, { fw: 700 }));
  els.push(text(24, 140, 'Oramund Ltd  ·  £ 120 / hr', 11, TEXT2));

  // Three stats row
  const stats = [
    { label: 'Total', val: '28h 14m' },
    { label: 'Billable', val: '22h 40m' },
    { label: 'Earned', val: '£ 2,720' },
  ];
  stats.forEach((s, i) => {
    const cx = 24 + i * ((W - 32) / 3);
    els.push(text(cx, 162, s.label, 9,  TEXT3, { ls: 1 }));
    els.push(text(cx, 176, s.val,   13, TEXT,  { fw: 600 }));
  });

  // Date group header
  sectionLabel(els, 200, 'This week');
  hairline(els, 208);

  // Log entries grouped by day
  const days = [
    {
      date: 'Sat Apr 12', total: '3h 19m',
      entries: [
        { task: 'Wireframe review call',    start: '10:00', end: '11:32', dur: '1h 32m', bill: true },
        { task: 'Revision notes doc',        start: '14:15', end: '15:57', dur: '1h 42m', bill: false },
      ],
    },
    {
      date: 'Fri Apr 11', total: '4h 52m',
      entries: [
        { task: 'Logo concepts v3',          start: '09:00', end: '12:00', dur: '3h 00m', bill: true },
        { task: 'Client email responses',    start: '13:30', end: '14:34', dur: '1h 04m', bill: false },
        { task: 'Spec sheet export',         start: '16:00', end: '16:48', dur: '48m',    bill: true },
      ],
    },
  ];

  let ly = 214;
  days.forEach(d => {
    // Day header
    els.push(rect(16, ly, W - 32, 28, CARD, { rx: 6 }));
    els.push(text(24, ly + 18, d.date, 11, TEXT2, { fw: 600 }));
    els.push(text(W - 24, ly + 18, d.total, 11, TEXT2, { anchor: 'end', fw: 600 }));
    ly += 32;

    d.entries.forEach(e => {
      els.push(rect(16, ly, W - 32, 46, SURF, { rx: 0, stroke: RULE, sw: 1 }));
      els.push(text(24, ly + 16, e.task, 12, TEXT, { fw: 500 }));
      els.push(text(24, ly + 32, `${e.start} – ${e.end}`, 10, TEXT3));
      // Bill indicator
      if (e.bill) {
        els.push(rect(W - 24 - 30, ly + 10, 30, 15, ACCL, { rx: 7 }));
        els.push(text(W - 24 - 15, ly + 21, '£', 10, ACC, { anchor: 'middle', fw: 700 }));
      }
      els.push(text(W - 24, ly + 32, e.dur, 11, TEXT, { anchor: 'end', fw: 600 }));
      ly += 50;
    });
    ly += 6;
  });

  // ── Totals for this project in log view ───────────────────────────────
  const logTotY = ly + 2;
  els.push(rect(16, logTotY - 2, W - 32, 1, RULE));
  els.push(text(16, logTotY + 14, 'Week total', 10, TEXT3, { fw: 500 }));
  els.push(text(W - 16, logTotY + 14, '8h 11m  ·  £ 748', 12, TEXT, { anchor: 'end', fw: 600 }));
  ly += 22;

  // ── Log action row ─────────────────────────────────────────────────────
  const laY = ly + 4;
  els.push(rect(16, laY, (W - 40) / 2, 36, ACCL, { rx: 8, stroke: ACC, sw: 1 }));
  els.push(text(16 + (W - 40) / 4, laY + 22, '+ Log time', 12, ACC, { anchor: 'middle', fw: 600 }));
  els.push(rect(24 + (W - 40) / 2, laY, (W - 40) / 2, 36, CARD, { rx: 8 }));
  els.push(text(24 + (W - 40) * 3 / 4, laY + 22, 'Generate invoice', 12, TEXT2, { anchor: 'middle' }));

  // ── Time breakdown small donut-alt ──────────────────────────────────
  const tbY = laY + 48;
  sectionLabel(els, tbY, 'Time breakdown');
  const tbRows = [
    { label: 'Design work', pct: 61, col: ACC },
    { label: 'Client comms', pct: 22, col: ACC2 },
    { label: 'Admin',        pct: 17, col: TEXT3 },
  ];
  tbRows.forEach((r, i) => {
    const rowY = tbY + 14 + i * 22;
    els.push(text(16, rowY, r.label, 11, TEXT2));
    els.push(text(W - 16, rowY, `${r.pct}%`, 11, TEXT3, { anchor: 'end' }));
    els.push(rect(16, rowY + 4, W - 32, 7, CARD, { rx: 3 }));
    els.push(rect(16, rowY + 4, (W - 32) * r.pct / 100, 7, r.col, { rx: 3, opacity: 0.8 }));
  });

  navBar(els, 2);
  return els;
}

// ── Screen 4: INVOICE ─────────────────────────────────────────────────────
function buildInvoice() {
  const els = [];
  statusBar(els);

  // Header
  els.push(rect(0, 44, W, 56, BG));
  els.push(text(16, 74, 'Invoice', 22, TEXT, { fw: 700 }));
  els.push(text(W - 16, 74, '#INV-0041', 13, TEXT3, { anchor: 'end' }));

  // Invoice document card — paper feel
  const docY = 108;
  els.push(rect(16, docY, W - 32, 520, SURF, { rx: 12, stroke: RULE, sw: 1 }));

  // FROM / TO
  els.push(text(28, docY + 20, 'FROM', 8, TEXT3, { ls: 2 }));
  els.push(text(28, docY + 36, 'Sam Aldrich',     13, TEXT, { fw: 700 }));
  els.push(text(28, docY + 52, 'Freelance Designer', 11, TEXT3 ));
  els.push(text(28, docY + 66, 'sam@aldrich.design', 11, TEXT3 ));

  els.push(text(W / 2, docY + 20, 'TO', 8, TEXT3, { ls: 2 }));
  els.push(text(W / 2, docY + 36, 'Oramund Ltd',     13, TEXT, { fw: 700 }));
  els.push(text(W / 2, docY + 52, 'finance@oramund.com', 11, TEXT3 ));
  els.push(text(W / 2, docY + 66, 'Due Apr 26 2026',    11, ACC2, { fw: 600 } ));

  hairline(els, docY + 82);

  // Invoice lines header
  const lhY = docY + 90;
  els.push(text(28, lhY, 'Description',  9, TEXT3, { ls: 1 }));
  els.push(text(W / 2 + 10, lhY, 'Hrs',  9, TEXT3, { ls: 1, anchor: 'middle' }));
  els.push(text(W - 28, lhY, 'Amount',   9, TEXT3, { ls: 1, anchor: 'end' }));

  hairline(els, docY + 96);

  const lineItems = [
    { desc: 'Logo Concepts v1-v3', hrs: '12h', amt: '£ 1,440' },
    { desc: 'Brand Guidelines',    hrs: '8h',  amt: '£ 960' },
    { desc: 'Wireframe Reviews',   hrs: '4h',  amt: '£ 480' },
    { desc: 'Export & Handoff',    hrs: '2h',  amt: '£ 240' },
  ];
  let ily = docY + 108;
  lineItems.forEach((item, i) => {
    const bg = i % 2 === 1 ? CARD : SURF;
    els.push(rect(28, ily - 4, W - 56, 24, bg, { rx: 4 }));
    els.push(text(32, ily + 12, item.desc, 11, TEXT));
    els.push(text(W / 2 + 10, ily + 12, item.hrs, 11, TEXT2, { anchor: 'middle' }));
    els.push(text(W - 32, ily + 12, item.amt,  12, TEXT, { anchor: 'end', fw: 500 }));
    ily += 28;
  });

  hairline(els, ily + 4);

  // Subtotal / VAT / Total
  const totY = ily + 14;
  [
    { label: 'Subtotal', val: '£ 3,120', bold: false },
    { label: 'VAT 20%',  val: '£ 624',   bold: false },
  ].forEach((r, i) => {
    els.push(text(28, totY + i * 20, r.label, 11, TEXT2));
    els.push(text(W - 28, totY + i * 20, r.val, 11, TEXT2, { anchor: 'end' }));
  });

  hairline(els, totY + 46);

  // TOTAL — big typography moment
  els.push(text(28, totY + 68, 'TOTAL DUE', 10, TEXT3, { ls: 2 }));
  els.push(text(W - 28, totY + 72, '£ 3,744', 28, TEXT, { anchor: 'end', fw: 700 }));

  // Terms note
  els.push(text(28, totY + 80, 'Payment terms: 14 days. Late payments: 2% per month.', 8, TEXT3));

  // Payment note
  els.push(rect(28, totY + 90, W - 56, 28, AMBER_L, { rx: 6 }));
  els.push(text(36, totY + 101, '⚡', 9, ACC2));
  els.push(text(48, totY + 106, 'Bank: NatWest  ·  Sort 60-40-12  ·  Acc 88223344', 9, ACC2));

  // Action buttons
  const btnY = docY + 480;
  els.push(rect(28, btnY, (W - 64) / 2, 36, ACC, { rx: 8 }));
  els.push(text(28 + (W - 64) / 4, btnY + 22, 'Send Invoice', 12, SURF, { anchor: 'middle', fw: 600 }));
  els.push(rect(28 + (W - 64) / 2 + 8, btnY, (W - 64) / 2, 36, CARD, { rx: 8, stroke: RULE, sw: 1 }));
  els.push(text(28 + (W - 64) * 3 / 4 + 8, btnY + 22, 'Preview PDF', 12, TEXT2, { anchor: 'middle' }));

  navBar(els, 2);
  return els;
}

// ── Screen 5: CLIENTS ─────────────────────────────────────────────────────
function buildClients() {
  const els = [];
  statusBar(els);
  screenHeader(els, 'Clients', '4 active  ·  £ 48,200 lifetime');

  // Search field
  els.push(rect(16, 104, W - 32, 36, CARD, { rx: 10, stroke: RULE, sw: 1 }));
  els.push(text(36, 126, 'Search clients…', 12, TEXT3));
  els.push(text(24, 127, '🔍', 12, TEXT3));

  const clients = [
    {
      name: 'Oramund Ltd',
      sector: 'Branding & Identity',
      rate: '£ 120/hr',
      total: '£ 14,400',
      status: 'Active',
      initial: 'O',
      col: ACC,
    },
    {
      name: 'Vellum Press',
      sector: 'Editorial Design',
      rate: '£ 90/hr',
      total: '£ 7,200',
      status: 'Active',
      initial: 'V',
      col: ACC2,
    },
    {
      name: 'Tidewater Co',
      sector: 'UI / Product Design',
      rate: '£ 130/hr',
      total: '£ 19,500',
      status: 'Active',
      initial: 'T',
      col: '#5B6FA3',
    },
    {
      name: 'Kessler AG',
      sector: 'Print & Publication',
      rate: '£ 100/hr',
      total: '£ 7,100',
      status: 'Paused',
      initial: 'K',
      col: TEXT3,
    },
  ];

  let cy = 154;
  clients.forEach(c => {
    els.push(rect(16, cy, W - 32, 76, SURF, { rx: 10, stroke: RULE, sw: 1 }));

    // Avatar circle
    els.push(circle(48, cy + 38, 22, c.col, { opacity: 0.12 }));
    els.push(circle(48, cy + 38, 22, c.col, { stroke: c.col, sw: 1, opacity: 0 }));
    els.push(text(48, cy + 44, c.initial, 18, c.col, { anchor: 'middle', fw: 700 }));

    // Text info
    els.push(text(78, cy + 22, c.name, 14, TEXT, { fw: 600 }));
    els.push(text(78, cy + 38, c.sector, 11, TEXT3));
    els.push(text(78, cy + 54, `${c.rate}  ·  ${c.total} total`, 11, TEXT2));

    // Status badge
    const badgeW = c.status.length * 7 + 14;
    const badgeCol = c.status === 'Active' ? ACCL : CARD;
    const badgeTxt = c.status === 'Active' ? ACC : TEXT3;
    els.push(rect(W - 24 - badgeW, cy + 12, badgeW, 18, badgeCol, { rx: 9 }));
    els.push(text(W - 24 - badgeW / 2, cy + 24, c.status, 9, badgeTxt, { anchor: 'middle', fw: 600 }));

    cy += 82;
  });

  // ── Lifetime stats strip ──────────────────────────────────────────────
  sectionLabel(els, cy + 4, 'Lifetime');
  const lifetimeY = cy + 18;
  els.push(rect(16, lifetimeY, W - 32, 56, CARD, { rx: 10 }));
  const lstats = [
    { label: 'Projects', val: '24' },
    { label: 'Hours',    val: '847h' },
    { label: 'Earnings', val: '£ 48.2K' },
    { label: 'Invoices', val: '41' },
  ];
  lstats.forEach((s, i) => {
    const cx = 16 + (W - 32) * (i + 0.5) / lstats.length;
    els.push(text(cx, lifetimeY + 20, s.label, 9, TEXT3, { anchor: 'middle', ls: 1 }));
    els.push(text(cx, lifetimeY + 42, s.val,   14, TEXT, { anchor: 'middle', fw: 600 }));
  });
  for (let d = 1; d < lstats.length; d++) {
    const dx = 16 + (W - 32) * d / lstats.length;
    els.push(line(dx, lifetimeY + 8, dx, lifetimeY + 48, RULE));
  }

  // Add client
  const addY = lifetimeY + 66;
  els.push(rect(16, addY, W - 32, 44, CARD, { rx: 10, stroke: ACC, sw: 1 }));
  els.push(text(W / 2, addY + 26, '+ Add client', 13, ACC, { anchor: 'middle', fw: 600 }));

  navBar(els, 3);
  return els;
}

// ── Screen 6: REPORTS ────────────────────────────────────────────────────
function buildReports() {
  const els = [];
  statusBar(els);
  screenHeader(els, 'Reports', 'March 2026 — Final');

  // Period toggle
  const periods = ['Week', 'Month', 'Quarter', 'Year'];
  let px = 16;
  periods.forEach((p, i) => {
    const w = p.length * 9 + 20;
    const active = i === 1;
    els.push(rect(px, 104, w, 26, active ? TEXT : CARD, { rx: 13 }));
    els.push(text(px + w / 2, 121, p, 11, active ? SURF : TEXT2, { anchor: 'middle', fw: active ? 600 : 400 }));
    px += w + 6;
  });

  // Month summary strip
  const msY = 144;
  els.push(rect(16, msY, W - 32, 68, CARD, { rx: 10 }));
  const mstats = [
    { label: 'Hours',    val: '82h' },
    { label: 'Billable', val: '£ 8,760' },
    { label: 'Invoiced', val: '£ 6,240' },
    { label: 'Pending',  val: '£ 2,520' },
  ];
  mstats.forEach((s, i) => {
    const cx = 16 + (W - 32) * (i + 0.5) / mstats.length;
    els.push(text(cx, msY + 20, s.label, 9, TEXT3, { anchor: 'middle', ls: 1 }));
    els.push(text(cx, msY + 46, s.val,   14, TEXT, { anchor: 'middle', fw: 600 }));
  });
  // dividers
  for (let d = 1; d < mstats.length; d++) {
    const dx = 16 + (W - 32) * d / mstats.length;
    els.push(line(dx, msY + 10, dx, msY + 58, RULE));
  }

  // ── Bar chart — hours by project ──────────────────────────────────────
  sectionLabel(els, 230, 'Hours by project');

  const bars = [
    { label: 'Oramund',  hrs: 38, col: ACC },
    { label: 'Tidewater',hrs: 28, col: '#5B6FA3' },
    { label: 'Vellum',   hrs: 12, col: ACC2 },
    { label: 'Kessler',  hrs: 4,  col: TEXT3 },
  ];
  const maxHrs = 38;
  const chartH = 80;
  const chartY = 242;
  const barW = 38;
  const barGap = (W - 32 - bars.length * barW) / (bars.length + 1);

  // chart bg
  els.push(rect(16, chartY, W - 32, chartH + 32, SURF, { rx: 10, stroke: RULE, sw: 1 }));

  // Gridlines
  [0, 0.25, 0.5, 0.75, 1].forEach(t => {
    const gy = chartY + 8 + chartH - t * chartH;
    els.push(line(24, gy, W - 24, gy, RULE, { sw: 1, opacity: 0.6 }));
    if (t > 0) {
      els.push(text(20, gy + 4, `${Math.round(t * maxHrs)}`, 8, TEXT3, { anchor: 'end' }));
    }
  });

  bars.forEach((b, i) => {
    const bh = (b.hrs / maxHrs) * chartH;
    const bx = 16 + barGap * (i + 1) + barW * i;
    const by = chartY + 8 + chartH - bh;
    els.push(rect(bx, by, barW, bh, b.col, { rx: 3, opacity: 0.9 }));
    els.push(text(bx + barW / 2, by - 4,      `${b.hrs}h`, 9, TEXT2, { anchor: 'middle', fw: 600 }));
    els.push(text(bx + barW / 2, chartY + 8 + chartH + 16, b.label, 9, TEXT3, { anchor: 'middle' }));
  });

  // ── Earnings breakdown donut-style ring ────────────────────────────────
  sectionLabel(els, 390, 'Billing summary');

  // Simple visual: stacked horizontal bars
  const bsY = 404;
  els.push(rect(16, bsY, W - 32, 52, SURF, { rx: 10, stroke: RULE, sw: 1 }));

  const totalBill = 8760;
  const billedPct = 6240 / totalBill;
  const pendingPct = 2520 / totalBill;
  const barTotalW = W - 64;

  els.push(rect(24, bsY + 12, barTotalW, 14, CARD, { rx: 7 }));
  els.push(rect(24, bsY + 12, barTotalW * billedPct, 14, ACC, { rx: 7 }));
  els.push(rect(24 + barTotalW * billedPct, bsY + 12, barTotalW * pendingPct, 14, ACC2, { rx: 0 }));

  els.push(circle(30, bsY + 40, 5, ACC));
  els.push(text(38, bsY + 44, 'Invoiced  £ 6,240', 10, TEXT2));
  els.push(circle(130, bsY + 40, 5, ACC2));
  els.push(text(138, bsY + 44, 'Pending  £ 2,520', 10, TEXT2));

  // ── Top entry types ────────────────────────────────────────────────────
  sectionLabel(els, 474, 'Top task categories');

  const categories = [
    { label: 'Design & Concepting', pct: 48, hrs: '39h' },
    { label: 'Client Communication', pct: 22, hrs: '18h' },
    { label: 'Documentation',        pct: 19, hrs: '15h' },
    { label: 'Handoff & Export',     pct: 11, hrs: '10h' },
  ];
  let catY = 488;
  categories.forEach(cat => {
    els.push(text(16, catY, cat.label, 11, TEXT2, { fw: 500 }));
    els.push(text(W - 16, catY, cat.hrs, 11, TEXT3, { anchor: 'end' }));
    catY += 4;
    els.push(rect(16, catY, W - 32, 8, CARD, { rx: 4 }));
    els.push(rect(16, catY, (W - 32) * cat.pct / 100, 8, ACC, { rx: 4, opacity: 0.75 }));
    catY += 20;
  });

  // ── Rate trend mini-sparkline ──────────────────────────────────────────
  const trendY = catY + 10;
  sectionLabel(els, trendY, 'Effective rate trend');
  const trendBaseY = trendY + 48;
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const rates   = [88, 92, 96, 100, 108, 112]; // effective rate per month
  const trendW  = (W - 48) / months.length;
  const trendMaxH = 36;
  months.forEach((m, i) => {
    const bh  = ((rates[i] - 80) / 40) * trendMaxH;
    const bx  = 16 + i * trendW + trendW * 0.1;
    const bwi = trendW * 0.8;
    const isLast = i === months.length - 1;
    els.push(rect(bx, trendBaseY - bh, bwi, bh, isLast ? ACC : CARD, { rx: 3 }));
    els.push(text(bx + bwi / 2, trendBaseY + 12, m,           8, TEXT3, { anchor: 'middle' }));
    els.push(text(bx + bwi / 2, trendBaseY - bh - 4, `£${rates[i]}`, 8, isLast ? ACC : TEXT3, { anchor: 'middle', fw: isLast ? 700 : 400 }));
  });
  els.push(text(16, trendBaseY + 24, '↑ Effective rate up 27% over 6 months', 10, ACC, { fw: 500 }));

  // Export button
  const expY = trendBaseY + 38;
  els.push(rect(16, expY, W - 32, 40, ACC, { rx: 10 }));
  els.push(text(W / 2, expY + 24, 'Export Report  →', 13, SURF, { anchor: 'middle', fw: 600 }));

  navBar(els, 4);
  return els;
}

// ── Assemble pen file ─────────────────────────────────────────────────────
const screenDefs = [
  { name: 'Today',    build: buildToday },
  { name: 'Projects', build: buildProjects },
  { name: 'Log',      build: buildLog },
  { name: 'Invoice',  build: buildInvoice },
  { name: 'Clients',  build: buildClients },
  { name: 'Reports',  build: buildReports },
];

const screens = screenDefs.map(s => {
  const elements = s.build();
  return { name: s.name, svg: '', elements };
});

const totalEls = screens.reduce((sum, s) => sum + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    author: 'RAM',
    date: new Date().toISOString().slice(0, 10),
    theme: 'light',
    description: 'Freelance time tracking & invoicing. Warm minimalism inspired by minimal.gallery (Molo, The Daily Dispatch) and Awwwards SOTD "Nine To Five" systematic whitespace.',
    palette: {
      bg:      BG,
      surface: SURF,
      card:    CARD,
      text:    TEXT,
      accent:  ACC,
      accent2: ACC2,
    },
    heartbeat: 'tine',
    elements: totalEls,
  },
  screens,
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalEls} elements`);
console.log(`Written: ${SLUG}.pen`);
