'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG = 'haul';
const HB   = 43;

// ─── Palette ────────────────────────────────────────────────────────────────
const BG      = '#FDF8F3';   // warm cream
const SURF    = '#FFFFFF';   // white cards
const CARD    = '#FFF5E8';   // warm tinted card
const TEXT    = '#111111';   // near-black
const MUTED   = '#666666';
const BORDER  = '#111111';
const ACC     = '#FF5C00';   // bold orange
const ACC2    = '#FFE166';   // bright yellow
const ATXT    = '#FFFFFF';   // text on orange
const W = 390, H = 844;

// ─── Element helpers ─────────────────────────────────────────────────────────
let elems = [];
function rect(x, y, w, h, fill, opts = {}) {
  const e = {
    type: 'rect', x, y, width: w, height: h, fill,
    rx: opts.rx ?? 0,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none',
    strokeWidth: opts.sw ?? 0,
  };
  if (opts.shadow) e.shadow = opts.shadow;
  elems.push(e); return e;
}
function text(x, y, content, size, fill, opts = {}) {
  elems.push({
    type: 'text', x, y, content, fontSize: size, fill,
    fontWeight: opts.fw ?? 400,
    fontFamily: opts.font ?? 'Inter, system-ui, sans-serif',
    textAnchor: opts.anchor ?? 'start',
    letterSpacing: opts.ls ?? 0,
    opacity: opts.opacity ?? 1,
  });
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  elems.push({ type: 'line', x1, y1, x2, y2, stroke, strokeWidth: opts.sw ?? 1, opacity: opts.opacity ?? 1 });
}
function circle(cx, cy, r, fill, opts = {}) {
  elems.push({ type: 'circle', cx, cy, r, fill, opacity: opts.opacity ?? 1, stroke: opts.stroke ?? 'none', strokeWidth: opts.sw ?? 0 });
}

// ─── Shared components ───────────────────────────────────────────────────────
function statusBar() {
  rect(0, 0, W, 44, BG);
  text(20, 28, '9:41', 13, TEXT, { fw: 600 });
  text(370, 28, '●●●', 13, TEXT, { anchor: 'end' });
}

function bottomNav(active) {
  // Neubrutalist nav: thick top border, flat fills
  rect(0, 780, W, 64, SURF);
  rect(0, 780, W, 2, BORDER);
  const tabs = [
    { icon: '⌂', label: 'Home', id: 'home' },
    { icon: '◳', label: 'Projects', id: 'projects' },
    { icon: '◷', label: 'Timer', id: 'timer' },
    { icon: '◈', label: 'Invoices', id: 'invoices' },
    { icon: '◉', label: 'Earn', id: 'earn' },
  ];
  const tw = W / tabs.length;
  tabs.forEach((tab, i) => {
    const cx = tw * i + tw / 2;
    const isActive = tab.id === active;
    if (isActive) {
      rect(tw * i, 780, tw, 64, ACC2);
      rect(tw * i, 780, tw, 2, ACC);
    }
    text(cx, 806, tab.icon, 16, isActive ? TEXT : MUTED, { anchor: 'middle' });
    text(cx, 822, tab.label, 9, isActive ? TEXT : MUTED, { anchor: 'middle', fw: isActive ? 700 : 400, ls: 0.3 });
  });
}

function neuCard(x, y, w, h, fill = SURF, shadowOff = 4) {
  // Offset shadow (neubrutalist characteristic)
  rect(x + shadowOff, y + shadowOff, w, h, BORDER);
  rect(x, y, w, h, fill, { stroke: BORDER, sw: 2 });
}

function badge(x, y, label, bgColor, textColor) {
  const w = label.length * 7 + 16;
  rect(x + 2, y + 2, w, 22, BORDER);
  rect(x, y, w, 22, bgColor, { stroke: BORDER, sw: 1.5 });
  text(x + w / 2, y + 14, label, 10, textColor, { anchor: 'middle', fw: 700, ls: 0.5 });
  return w;
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Dashboard / Home
// ═══════════════════════════════════════════════════════════════════════════
function screen1() {
  elems = [];
  rect(0, 0, W, H, BG);
  statusBar();

  // Header
  text(20, 68, 'HAUL', 24, TEXT, { fw: 900, ls: 2 });
  text(20, 88, 'Apr 2026', 13, MUTED, { fw: 500 });
  // Notification dot
  circle(368, 68, 10, ACC, { stroke: BORDER, sw: 1.5 });
  text(368, 73, '3', 10, ATXT, { anchor: 'middle', fw: 700 });

  // Thick divider
  rect(20, 100, W - 40, 3, BORDER);

  // Monthly Earnings hero card
  neuCard(20, 116, W - 40, 130, CARD);
  text(32, 144, 'THIS MONTH', 9, MUTED, { fw: 700, ls: 1.5 });
  text(32, 182, '$8,450', 48, TEXT, { fw: 900 });
  text(32, 206, '↑ 12% vs last month', 12, '#2D7D2D', { fw: 600 });
  // Inline bar chart
  const bars = [60, 90, 45, 110, 75, 130, 100];
  bars.forEach((bh, i) => {
    const bx = 240 + i * 20;
    const by = 210 - bh * 0.55;
    rect(bx, by, 14, bh * 0.55, i === 6 ? ACC : '#E8DDD0', { rx: 0 });
    rect(bx + 2, by + 2, 14, bh * 0.55, 'none', { stroke: i === 6 ? BORDER : 'none', sw: 1 });
  });
  text(364, 210, 'Apr', 9, ACC, { anchor: 'end', fw: 700 });

  // YTD / Unpaid / Hours row
  const stats = [
    { label: 'YTD', value: '$29,200' },
    { label: 'UNPAID', value: '$3,100' },
    { label: 'HRS', value: '147' },
  ];
  const sw = (W - 40) / 3;
  stats.forEach((s, i) => {
    const sx = 20 + i * sw;
    if (i > 0) line(sx, 265, sx, 315, BORDER, { sw: 2 });
    text(sx + sw / 2, 282, s.label, 9, MUTED, { anchor: 'middle', fw: 700, ls: 1 });
    text(sx + sw / 2, 308, s.value, 18, TEXT, { anchor: 'middle', fw: 800 });
  });
  rect(20, 260, W - 40, 2, BORDER);
  rect(20, 318, W - 40, 2, BORDER);

  // Active Projects section
  text(20, 342, 'ACTIVE PROJECTS', 10, TEXT, { fw: 800, ls: 1.5 });
  text(W - 20, 342, '5 total →', 10, ACC, { anchor: 'end', fw: 700 });

  const projects = [
    { name: 'Meridian Rebrand', client: 'Meridian Co.', status: 'ACTIVE', statusColor: '#D4F7C4', amt: '$2,400' },
    { name: 'Landing Page', client: 'Nova Labs', status: 'REVIEW', statusColor: ACC2, amt: '$900' },
    { name: 'Brand System', client: 'Flux Studio', status: 'ACTIVE', statusColor: '#D4F7C4', amt: '$4,200' },
  ];
  projects.forEach((p, i) => {
    const py = 356 + i * 76;
    neuCard(20, py, W - 40, 64, SURF);
    text(36, py + 20, p.name, 14, TEXT, { fw: 700 });
    text(36, py + 38, p.client, 11, MUTED, { fw: 400 });
    badge(W - 80, py + 10, p.status, p.statusColor, TEXT);
    text(W - 24, py + 50, p.amt, 13, TEXT, { anchor: 'end', fw: 800 });
  });

  // Quick action strip
  rect(20, 590, 158, 46, ACC, { stroke: BORDER, sw: 2 });
  rect(24, 594, 158, 46, BORDER);
  text(99, 618, '+ LOG TIME', 12, ATXT, { anchor: 'middle', fw: 800, ls: 1 });

  rect(212, 590, 158, 46, SURF, { stroke: BORDER, sw: 2 });
  rect(216, 594, 158, 46, BORDER);
  text(291, 618, '+ NEW INVOICE', 12, TEXT, { anchor: 'middle', fw: 800, ls: 1 });

  // Recent activity
  text(20, 656, 'RECENT', 10, TEXT, { fw: 800, ls: 1.5 });
  const activity = [
    { desc: 'Invoice #047 paid', time: '2h ago', positive: true },
    { desc: 'Meridian — 2.5hr logged', time: '5h ago', positive: false },
    { desc: 'Nova Labs invoice sent', time: 'Yesterday', positive: false },
  ];
  activity.forEach((a, i) => {
    const ay = 674 + i * 28;
    circle(30, ay + 6, 5, a.positive ? '#4CAF50' : MUTED);
    text(46, ay + 10, a.desc, 12, TEXT, { fw: 500 });
    text(W - 20, ay + 10, a.time, 10, MUTED, { anchor: 'end' });
  });

  bottomNav('home');

  return { name: 'Dashboard', svg: '', elements: [...elems] };
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Projects
// ═══════════════════════════════════════════════════════════════════════════
function screen2() {
  elems = [];
  rect(0, 0, W, H, BG);
  statusBar();

  text(20, 68, 'PROJECTS', 22, TEXT, { fw: 900, ls: 1.5 });

  // Filter tabs (neubrutalist pill-less, border-based)
  const filters = ['ALL', 'ACTIVE', 'REVIEW', 'DONE'];
  let fx = 20;
  filters.forEach((f, i) => {
    const fw2 = f.length * 8 + 20;
    if (i === 0) {
      rect(fx + 2, 82, fw2, 26, BORDER);
      rect(fx, 80, fw2, 26, ACC, { stroke: BORDER, sw: 2 });
      text(fx + fw2 / 2, 96, f, 10, ATXT, { anchor: 'middle', fw: 800, ls: 0.8 });
    } else {
      rect(fx, 80, fw2, 26, SURF, { stroke: BORDER, sw: 1.5 });
      text(fx + fw2 / 2, 96, f, 10, TEXT, { anchor: 'middle', fw: 600, ls: 0.8 });
    }
    fx += fw2 + 8;
  });

  rect(20, 116, W - 40, 2, BORDER);

  const projects = [
    {
      name: 'Meridian Rebrand', client: 'Meridian Co.',
      status: 'ACTIVE', statusBg: '#D4F7C4',
      budget: '$2,400', used: '$1,800', pct: 75,
      hrs: '18.5h', due: 'Apr 18',
    },
    {
      name: 'Nova Labs Landing', client: 'Nova Labs',
      status: 'REVIEW', statusBg: ACC2,
      budget: '$900', used: '$900', pct: 100,
      hrs: '9h', due: 'Apr 12',
    },
    {
      name: 'Flux Brand System', client: 'Flux Studio',
      status: 'ACTIVE', statusBg: '#D4F7C4',
      budget: '$4,200', used: '$1,050', pct: 25,
      hrs: '7h', due: 'May 3',
    },
    {
      name: 'Parcel Mobile App', client: 'Parcel Inc.',
      status: 'ACTIVE', statusBg: '#D4F7C4',
      budget: '$6,000', used: '$2,400', pct: 40,
      hrs: '24h', due: 'May 20',
    },
    {
      name: 'Ryde Website', client: 'Ryde Corp',
      status: 'DONE', statusBg: '#E0E0E0',
      budget: '$1,200', used: '$1,200', pct: 100,
      hrs: '12h', due: 'Apr 1',
    },
  ];

  projects.forEach((p, i) => {
    const py = 130 + i * 114;
    if (py + 110 > 778) return;
    neuCard(20, py, W - 40, 100, SURF, 3);

    // Top row
    text(36, py + 22, p.name, 14, TEXT, { fw: 800 });
    badge(W - 80, py + 10, p.status, p.statusBg, TEXT);

    text(36, py + 40, p.client, 11, MUTED, { fw: 400 });

    // Budget bar
    const barW = W - 80;
    rect(36, py + 54, barW, 8, '#EEE7DC', { stroke: BORDER, sw: 1 });
    rect(36, py + 54, Math.min(barW * p.pct / 100, barW), 8, p.pct >= 100 ? ACC : '#4CAF50');

    // Stats row
    text(36, py + 80, p.budget, 12, TEXT, { fw: 700 });
    text(36 + 60, py + 80, 'budget', 10, MUTED);
    text(160, py + 80, p.hrs, 12, TEXT, { fw: 700 });
    text(160 + 28, py + 80, 'logged', 10, MUTED);
    text(W - 24, py + 80, `due ${p.due}`, 10, p.status === 'DONE' ? MUTED : ACC, { anchor: 'end', fw: 600 });
  });

  bottomNav('projects');
  return { name: 'Projects', svg: '', elements: [...elems] };
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Timer
// ═══════════════════════════════════════════════════════════════════════════
function screen3() {
  elems = [];
  rect(0, 0, W, H, BG);
  statusBar();

  text(W / 2, 68, 'TIMER', 20, TEXT, { fw: 900, ls: 2, anchor: 'middle' });

  // Currently tracking
  text(W / 2, 102, 'TRACKING', 9, MUTED, { anchor: 'middle', fw: 700, ls: 2 });
  neuCard(20, 112, W - 40, 56, CARD, 4);
  text(36, 136, 'Meridian Rebrand', 15, TEXT, { fw: 800 });
  text(36, 152, 'Meridian Co. · $130/hr', 11, MUTED);
  circle(W - 36, 140, 8, '#4CAF50', { stroke: BORDER, sw: 1.5 });

  // Giant clock display — neubrutalist style
  rect(20, 184, W - 40, 4, BORDER);
  text(W / 2, 300, '02:14:07', 72, TEXT, { fw: 900, anchor: 'middle', ls: -2 });
  rect(20, 316, W - 40, 4, BORDER);

  text(W / 2, 342, 'TODAY  ·  3 SESSIONS  ·  5.25 HRS', 10, MUTED, { anchor: 'middle', fw: 600, ls: 1 });

  // Controls — large neubrutalist buttons
  // STOP button
  rect(22, 362, 154, 60, ACC, { stroke: BORDER, sw: 2 });
  rect(26, 366, 154, 60, BORDER);
  text(99, 396, '■ STOP', 16, ATXT, { anchor: 'middle', fw: 900, ls: 1 });

  // PAUSE button
  rect(214, 362, 154, 60, SURF, { stroke: BORDER, sw: 2 });
  rect(218, 366, 154, 60, BORDER);
  text(291, 396, '⏸ PAUSE', 16, TEXT, { anchor: 'middle', fw: 900, ls: 1 });

  // Today's log
  text(20, 446, "TODAY'S LOG", 10, TEXT, { fw: 800, ls: 1.5 });

  const sessions = [
    { project: 'Meridian Rebrand', time: '9:00 – 11:30 AM', dur: '2h 30m', amt: '$325' },
    { project: 'Flux Brand System', time: '1:00 – 3:15 PM', dur: '2h 15m', amt: '$293' },
    { project: 'Meridian Rebrand', time: '4:30 PM – now', dur: '2h 14m', amt: '$289' },
  ];
  sessions.forEach((s, i) => {
    const sy = 464 + i * 72;
    neuCard(20, sy, W - 40, 60, SURF, 3);
    text(36, sy + 22, s.project, 13, TEXT, { fw: 700 });
    text(36, sy + 40, s.time, 11, MUTED);
    text(W - 24, sy + 22, s.dur, 13, TEXT, { anchor: 'end', fw: 800 });
    text(W - 24, sy + 40, s.amt, 11, ACC, { anchor: 'end', fw: 600 });
  });

  // Daily total bar
  rect(20, 682, W - 40, 2, BORDER);
  text(20, 704, 'TODAY TOTAL', 10, TEXT, { fw: 800, ls: 1 });
  text(W - 20, 704, '5.25h  ·  $682.50', 14, TEXT, { anchor: 'end', fw: 900 });
  rect(20, 712, W - 40, 2, BORDER);

  bottomNav('timer');
  return { name: 'Timer', svg: '', elements: [...elems] };
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Invoices
// ═══════════════════════════════════════════════════════════════════════════
function screen4() {
  elems = [];
  rect(0, 0, W, H, BG);
  statusBar();

  text(20, 68, 'INVOICES', 22, TEXT, { fw: 900, ls: 1.5 });
  // Create button
  rect(W - 122, 52, 102, 32, ACC, { stroke: BORDER, sw: 2 });
  rect(W - 120, 54, 102, 32, BORDER);
  text(W - 71, 72, '+ CREATE', 11, ATXT, { anchor: 'middle', fw: 800, ls: 1 });

  rect(20, 92, W - 40, 2, BORDER);

  // Summary row
  const summStats = [
    { label: 'OUTSTANDING', value: '$3,100', color: ACC },
    { label: 'OVERDUE', value: '$0', color: TEXT },
    { label: 'PAID MTD', value: '$5,350', color: '#2D7D2D' },
  ];
  const ssw = (W - 40) / 3;
  summStats.forEach((s, i) => {
    const sx = 20 + i * ssw;
    if (i > 0) line(sx, 108, sx, 142, BORDER, { sw: 1.5 });
    text(sx + ssw / 2, 116, s.label, 8, MUTED, { anchor: 'middle', fw: 700, ls: 1 });
    text(sx + ssw / 2, 138, s.value, 16, s.color, { anchor: 'middle', fw: 900 });
  });
  rect(20, 148, W - 40, 2, BORDER);

  const invoices = [
    { num: '#047', client: 'Meridian Co.', desc: 'Rebrand — Phase 1', amt: '$1,200', status: 'PAID', statusBg: '#D4F7C4', date: 'Apr 8' },
    { num: '#048', client: 'Nova Labs', desc: 'Landing Page Design', amt: '$900', status: 'SENT', statusBg: ACC2, date: 'Apr 10' },
    { num: '#049', client: 'Flux Studio', desc: 'Brand System — Retainer', amt: '$2,100', status: 'DRAFT', statusBg: '#E0E0E0', date: 'Apr 11' },
    { num: '#046', client: 'Parcel Inc.', desc: 'App UI — Sprint 1', amt: '$1,600', status: 'PAID', statusBg: '#D4F7C4', date: 'Mar 28' },
    { num: '#045', client: 'Ryde Corp', desc: 'Website Redesign', amt: '$1,200', status: 'PAID', statusBg: '#D4F7C4', date: 'Mar 20' },
  ];

  invoices.forEach((inv, i) => {
    const iy = 162 + i * 90;
    if (iy + 86 > 778) return;
    neuCard(20, iy, W - 40, 78, SURF, 3);
    // Left accent bar by status
    const accentCol = inv.status === 'PAID' ? '#4CAF50' : inv.status === 'SENT' ? ACC : MUTED;
    rect(20, iy, 4, 78, accentCol);
    text(36, iy + 22, inv.num, 12, MUTED, { fw: 700 });
    text(36, iy + 42, inv.client, 14, TEXT, { fw: 800 });
    text(36, iy + 60, inv.desc, 11, MUTED);
    text(W - 24, iy + 22, inv.date, 10, MUTED, { anchor: 'end' });
    text(W - 24, iy + 44, inv.amt, 16, TEXT, { anchor: 'end', fw: 900 });
    badge(W - 80, iy + 54, inv.status, inv.statusBg, TEXT);
  });

  bottomNav('invoices');
  return { name: 'Invoices', svg: '', elements: [...elems] };
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Earnings Chart
// ═══════════════════════════════════════════════════════════════════════════
function screen5() {
  elems = [];
  rect(0, 0, W, H, BG);
  statusBar();

  text(20, 68, 'EARNINGS', 22, TEXT, { fw: 900, ls: 1.5 });
  text(W - 20, 68, '2026 ↓', 13, ACC, { anchor: 'end', fw: 700 });

  rect(20, 82, W - 40, 2, BORDER);

  // YTD hero
  neuCard(20, 94, W - 40, 88, CARD, 4);
  text(36, 120, 'YEAR TO DATE', 9, MUTED, { fw: 700, ls: 1.5 });
  text(36, 160, '$29,200', 40, TEXT, { fw: 900 });
  text(220, 160, 'Goal: $80k', 11, MUTED);
  // Progress bar
  const goalPct = 29200 / 80000;
  rect(36, 166, W - 72, 8, '#EEE7DC', { stroke: BORDER, sw: 1 });
  rect(36, 166, (W - 72) * goalPct, 8, ACC);
  text(W - 36, 166, `${Math.round(goalPct * 100)}%`, 9, ACC, { anchor: 'end', fw: 700 });

  // Monthly bar chart
  text(20, 204, 'BY MONTH', 10, TEXT, { fw: 800, ls: 1.5 });

  const months = [
    { m: 'J', v: 6800 }, { m: 'F', v: 7200 }, { m: 'M', v: 6750 }, { m: 'A', v: 8450, current: true },
    { m: 'M', v: 0 }, { m: 'J', v: 0 }, { m: 'J', v: 0 }, { m: 'A', v: 0 },
    { m: 'S', v: 0 }, { m: 'O', v: 0 }, { m: 'N', v: 0 }, { m: 'D', v: 0 },
  ];
  const maxV = 10000;
  const chartH = 180;
  const chartTop = 218;
  const barW2 = (W - 40) / months.length - 2;

  months.forEach((mo, i) => {
    const bx = 20 + i * ((W - 40) / months.length);
    const bh = mo.v ? (mo.v / maxV) * chartH : 0;
    const by = chartTop + chartH - bh;
    if (mo.v > 0) {
      rect(bx + 2, by + 3, barW2, bh, BORDER);
      rect(bx, by, barW2, bh, mo.current ? ACC : '#E8DDD0', { stroke: BORDER, sw: 1.5 });
      if (mo.current) {
        text(bx + barW2 / 2, by - 6, `$${(mo.v / 1000).toFixed(1)}k`, 8, ACC, { anchor: 'middle', fw: 700 });
      }
    } else {
      // Future months — empty outlined
      rect(bx, chartTop + chartH - 24, barW2, 24, '#F5EDE3', { stroke: '#DDD5C8', sw: 1 });
    }
    text(bx + barW2 / 2, chartTop + chartH + 14, mo.m, 9, mo.current ? ACC : MUTED, { anchor: 'middle', fw: mo.current ? 800 : 400 });
  });
  // baseline
  rect(20, chartTop + chartH, W - 40, 2, BORDER);

  // Client breakdown
  text(20, 436, 'BY CLIENT', 10, TEXT, { fw: 800, ls: 1.5 });
  rect(20, 450, W - 40, 2, BORDER);

  const clients = [
    { name: 'Parcel Inc.', amt: 8400, pct: 29 },
    { name: 'Flux Studio', amt: 7200, pct: 25 },
    { name: 'Meridian Co.', amt: 6600, pct: 23 },
    { name: 'Nova Labs', amt: 4800, pct: 16 },
    { name: 'Others', amt: 2200, pct: 7 },
  ];
  const colors = [ACC, '#4CAF50', '#2196F3', ACC2, '#E0E0E0'];
  clients.forEach((c, i) => {
    const cy2 = 462 + i * 46;
    text(20, cy2 + 16, c.name, 13, TEXT, { fw: 700 });
    const barMaxW = W - 140;
    rect(20, cy2 + 24, barMaxW, 10, '#EEE7DC', { stroke: BORDER, sw: 1 });
    rect(20, cy2 + 24, barMaxW * c.pct / 100, 10, colors[i]);
    text(W - 20, cy2 + 16, `$${(c.amt / 1000).toFixed(1)}k`, 13, TEXT, { anchor: 'end', fw: 800 });
    text(W - 20, cy2 + 34, `${c.pct}%`, 10, MUTED, { anchor: 'end' });
  });

  bottomNav('earn');
  return { name: 'Earnings', svg: '', elements: [...elems] };
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN 6 — Profile / Rate Card
// ═══════════════════════════════════════════════════════════════════════════
function screen6() {
  elems = [];
  rect(0, 0, W, H, BG);
  statusBar();

  // Header area with bold identity block
  rect(0, 44, W, 160, ACC);
  rect(0, 44, W, 2, BORDER);
  rect(0, 202, W, 2, BORDER);

  text(20, 90, 'ALEX', 48, ATXT, { fw: 900, ls: -1 });
  text(20, 116, 'MORGAN', 48, ATXT, { fw: 900, ls: -1, opacity: 0.4 });
  text(20, 144, 'Freelance Product Designer', 13, ATXT, { fw: 500 });
  text(20, 162, 'San Francisco, CA', 11, ATXT, { opacity: 0.8 });

  // Rate card
  neuCard(20, 218, W - 40, 110, SURF, 4);
  text(36, 242, 'RATE CARD', 9, MUTED, { fw: 700, ls: 2 });

  const rates = [
    { role: 'Product Design', rate: '$130/hr', type: 'Hourly' },
    { role: 'Brand Identity', rate: '$4,500', type: 'Project' },
    { role: 'Design Systems', rate: '$8k–$15k', type: 'Retainer' },
  ];
  rates.forEach((r, i) => {
    const ry = 254 + i * 24;
    text(36, ry, r.role, 12, TEXT, { fw: 600 });
    text(W - 24, ry, r.rate, 12, TEXT, { anchor: 'end', fw: 800 });
    text(W - 90, ry, r.type, 9, MUTED, { anchor: 'end', fw: 400 });
  });

  // Annual stats
  text(20, 350, '2026 AT A GLANCE', 10, TEXT, { fw: 800, ls: 1.5 });
  rect(20, 362, W - 40, 2, BORDER);

  const glance = [
    ['PROJECTS COMPLETED', '12', '4 this year'],
    ['AVG PROJECT SIZE', '$3,650', 'vs $2,900 last year'],
    ['TOP CLIENT', 'Parcel Inc.', '29% of revenue'],
    ['UTILIZATION', '73%', 'of 160hr/month target'],
  ];
  glance.forEach(([label, value, sub], i) => {
    const gy = 376 + i * 62;
    if (i > 0) rect(20, gy - 6, W - 40, 1, '#DDD5C8');
    text(20, gy + 14, label, 9, MUTED, { fw: 700, ls: 1 });
    text(20, gy + 38, value, 18, TEXT, { fw: 900 });
    text(20 + 120, gy + 38, sub, 11, MUTED);
  });

  // Settings links
  rect(20, 632, W - 40, 2, BORDER);
  const settItems = ['⚙  Account & Billing', '🔔  Notifications', '↗  Export Data'];
  settItems.forEach((s, i) => {
    const sy = 648 + i * 40;
    text(20, sy + 12, s, 13, TEXT, { fw: 500 });
    text(W - 20, sy + 12, '›', 18, MUTED, { anchor: 'end' });
    rect(20, sy + 22, W - 40, 1, '#EEE7DC');
  });

  // Sign out
  rect(20, 772, W - 40, 2, BORDER);
  text(W / 2, 760, 'SIGN OUT', 11, ACC, { anchor: 'middle', fw: 700, ls: 1.5 });

  bottomNav('home');
  return { name: 'Profile', svg: '', elements: [...elems] };
}

// ─── Assemble pen file ───────────────────────────────────────────────────────
const screens = [screen1(), screen2(), screen3(), screen4(), screen5(), screen6()];
const totalElems = screens.reduce((s, sc) => s + sc.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'HAUL — Freelance Tracker',
    author: 'RAM',
    date: new Date().toISOString(),
    theme: 'light',
    heartbeat: HB,
    elements: totalElems,
    palette: { bg: BG, surface: SURF, text: TEXT, accent: ACC, accent2: ACC2, muted: MUTED },
    description: 'Neubrutalist freelance income, time & project tracker. Light theme with bold orange, thick borders, and offset shadows. Inspired by Land-book neubrutalism trend + 2026 orange accent research.',
  },
  screens,
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`HAUL: ${screens.length} screens, ${totalElems} elements`);
console.log(`Written: ${SLUG}.pen`);
