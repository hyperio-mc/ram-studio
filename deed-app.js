'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG = 'deed';
const W = 390, H = 844;

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:      '#F8F6F2',   // warm off-white
  surf:    '#FFFFFF',   // card surface
  card:    '#EEE9E2',   // secondary card
  border:  '#DDD7CE',   // subtle divider
  text:    '#1A1714',   // near-black
  text2:   '#5C5550',   // secondary text
  text3:   '#9B928B',   // muted text
  navy:    '#1D3557',   // deep navy (primary accent)
  navyL:   '#2A4A73',   // lighter navy
  green:   '#2D7D52',   // signed/approved
  greenL:  '#E8F5EE',   // green bg wash
  amber:   '#B45309',   // pending warning
  amberL:  '#FEF3C7',   // amber bg wash
  red:     '#B91C1C',   // expired/overdue
  redL:    '#FEE2E2',   // red bg wash
  accent:  '#1D3557',   // same as navy for consistency
};

// ── Primitive helpers ─────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, width: w, height: h, fill,
    rx: opts.rx || 0, opacity: opts.opacity !== undefined ? opts.opacity : 1,
    stroke: opts.stroke || 'none', strokeWidth: opts.sw || 0,
  };
}
function text(x, y, content, size, fill, opts = {}) {
  return {
    type: 'text', x, y, content, fontSize: size, fill,
    fontWeight: opts.fw || 400,
    fontFamily: opts.font || 'system-ui, -apple-system, sans-serif',
    textAnchor: opts.anchor || 'start',
    letterSpacing: opts.ls || 0,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
  };
}
function circle(cx, cy, r, fill, opts = {}) {
  return {
    type: 'circle', cx, cy, r, fill,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
    stroke: opts.stroke || 'none', strokeWidth: opts.sw || 0,
  };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return { type: 'line', x1, y1, x2, y2, stroke, strokeWidth: opts.sw || 1, opacity: opts.opacity || 1 };
}

// ── Shared components ─────────────────────────────────────────────────────────
function statusBar(els) {
  els.push(rect(0, 0, W, 44, P.bg));
  els.push(text(20, 28, '9:41', 13, P.text, { fw: 600 }));
  // signal dots
  for (let i = 0; i < 3; i++) els.push(rect(316 + i * 9, 16, 6, 12 - i * 3, P.text, { rx: 1 }));
  els.push(rect(344, 16, 18, 12, 'none', { rx: 2, stroke: P.text, sw: 1.5 }));
  els.push(rect(346, 18, 10, 8, P.text, { rx: 1 }));
  els.push(text(365, 28, '●', 11, P.text));
}

function navBar(els, active) {
  const tabs = [
    { id: 'dash', label: 'Home',      icon: 'H' },
    { id: 'docs', label: 'Contracts', icon: 'C' },
    { id: 'sign', label: 'Sign',      icon: 'S' },
    { id: 'anal', label: 'Insights',  icon: 'I' },
    { id: 'tpl',  label: 'Templates', icon: 'T' },
  ];
  els.push(rect(0, H - 80, W, 80, P.surf));
  els.push(line(0, H - 80, W, H - 80, P.border));
  tabs.forEach((tab, i) => {
    const x = 20 + i * 70;
    const isActive = tab.id === active;
    // icon circle
    els.push(circle(x + 15, H - 58, 14, isActive ? P.navy : 'none'));
    els.push(text(x + 9, H - 53, tab.icon, 11, isActive ? '#FFFFFF' : P.text3, { fw: 700 }));
    els.push(text(x - 2, H - 30, tab.label, 9, isActive ? P.navy : P.text3, { fw: isActive ? 600 : 400, ls: 0.2 }));
  });
}

// ── SCREEN 1: Dashboard ───────────────────────────────────────────────────────
function screen1() {
  const els = [];
  statusBar(els);

  // Header area — purposeful asymmetry: left-heavy
  els.push(rect(0, 44, W, 90, P.bg));
  // Serif display headline (Georgia = Instrument Serif substitute)
  els.push(text(20, 80, 'Good morning,', 14, P.text2, { font: 'Georgia, serif' }));
  els.push(text(20, 104, 'Alexandra', 28, P.text, { fw: 700, font: 'Georgia, serif' }));
  // Avatar
  els.push(circle(358, 82, 22, P.navy));
  els.push(text(348, 88, 'AW', 11, '#FFFFFF', { fw: 700, anchor: 'start' }));

  // KPI strip — 3 metrics
  const metrics = [
    { label: 'Active', val: '24', color: P.navy, bg: '#EDF1F7' },
    { label: 'Pending', val: '7', color: P.amber, bg: P.amberL },
    { label: 'Expiring', val: '3', color: P.red, bg: P.redL },
  ];
  metrics.forEach((m, i) => {
    const x = 16 + i * 122;
    els.push(rect(x, 144, 110, 68, m.bg, { rx: 10 }));
    els.push(text(x + 12, 168, m.val, 26, m.color, { fw: 700, font: 'Georgia, serif' }));
    els.push(text(x + 12, 185, m.label, 11, P.text2, { fw: 500 }));
    els.push(rect(x + 12, 200, 30, 3, m.color, { rx: 1, opacity: 0.4 }));
  });

  // Section: "Recently Active"
  els.push(text(20, 238, 'Recently Active', 15, P.text, { fw: 700 }));
  els.push(text(320, 238, 'See all →', 12, P.navy, { fw: 500 }));

  // Contract list items (5)
  const contracts = [
    { name: 'SaaS Master Agreement', party: 'Acorn Tech Inc.', status: 'Signed', statusC: P.green, statusBg: P.greenL, date: 'Apr 9' },
    { name: 'Freelance NDA', party: 'Simone Maretti', status: 'Pending', statusC: P.amber, statusBg: P.amberL, date: 'Apr 7' },
    { name: 'Office Lease Renewal', party: 'Bellview Properties', status: 'Draft', statusC: P.text2, statusBg: P.card, date: 'Apr 6' },
    { name: 'Vendor Services Agreement', party: 'Loop Supply Co.', status: 'Pending', statusC: P.amber, statusBg: P.amberL, date: 'Apr 4' },
    { name: 'Employment Contract', party: 'D. Okonkwo', status: 'Signed', statusC: P.green, statusBg: P.greenL, date: 'Apr 2' },
  ];
  contracts.forEach((c, i) => {
    const y = 252 + i * 82;
    els.push(rect(16, y, W - 32, 72, P.surf, { rx: 10, stroke: P.border, sw: 1 }));
    // doc icon
    els.push(rect(28, y + 14, 28, 34, P.card, { rx: 5 }));
    els.push(line(33, y + 24, 50, y + 24, P.border, { sw: 1.5 }));
    els.push(line(33, y + 30, 50, y + 30, P.border, { sw: 1.5 }));
    els.push(line(33, y + 36, 45, y + 36, P.border, { sw: 1.5 }));
    // text
    els.push(text(68, y + 26, c.name, 13, P.text, { fw: 600 }));
    els.push(text(68, y + 44, c.party, 11, P.text2));
    // status badge
    const bw = c.status.length * 7 + 12;
    els.push(rect(W - 32 - bw, y + 14, bw, 20, c.statusBg, { rx: 10 }));
    els.push(text(W - 32 - bw + 6, y + 28, c.status, 10, c.statusC, { fw: 600 }));
    // date
    els.push(text(W - 30, y + 55, c.date, 10, P.text3, { anchor: 'end' }));
  });

  navBar(els, 'dash');

  return { name: 'Dashboard', elements: els };
}

// ── SCREEN 2: Contracts List ──────────────────────────────────────────────────
function screen2() {
  const els = [];
  statusBar(els);

  // Header
  els.push(rect(0, 44, W, 56, P.bg));
  els.push(text(20, 78, 'Contracts', 24, P.text, { fw: 700, font: 'Georgia, serif' }));
  // new button
  els.push(rect(322, 56, 52, 30, P.navy, { rx: 15 }));
  els.push(text(334, 76, '+ New', 11, '#FFFFFF', { fw: 600 }));

  // Filter chips
  const filters = ['All (31)', 'Signed', 'Pending', 'Draft', 'Expired'];
  let fx = 16;
  filters.forEach((f, i) => {
    const fw = f.length * 6.5 + 16;
    els.push(rect(fx, 108, fw, 28, i === 0 ? P.navy : P.surf, { rx: 14, stroke: i === 0 ? 'none' : P.border, sw: 1 }));
    els.push(text(fx + 8, 126, f, 11, i === 0 ? '#FFFFFF' : P.text2, { fw: i === 0 ? 600 : 400 }));
    fx += fw + 8;
  });

  // Search bar
  els.push(rect(16, 146, W - 32, 38, P.surf, { rx: 10, stroke: P.border, sw: 1 }));
  els.push(text(40, 170, 'Search contracts...', 13, P.text3));
  // search icon (circle+line)
  els.push(circle(29, 165, 7, 'none', { stroke: P.text3, sw: 1.5 }));
  els.push(line(34, 170, 38, 174, P.text3, { sw: 1.5 }));

  // Contract rows with category grouping
  const groups = [
    {
      label: 'April 2025',
      items: [
        { name: 'SaaS Master Agreement', party: 'Acorn Tech Inc.', pages: '14 pages', status: 'Signed', statusC: P.green, statusBg: P.greenL },
        { name: 'Freelance NDA', party: 'Simone Maretti', pages: '3 pages', status: 'Pending', statusC: P.amber, statusBg: P.amberL },
        { name: 'Office Lease Renewal', party: 'Bellview Properties', pages: '22 pages', status: 'Draft', statusC: P.text2, statusBg: P.card },
      ]
    },
    {
      label: 'March 2025',
      items: [
        { name: 'Vendor Services Agreement', party: 'Loop Supply Co.', pages: '9 pages', status: 'Signed', statusC: P.green, statusBg: P.greenL },
        { name: 'Employment Contract', party: 'D. Okonkwo', pages: '6 pages', status: 'Signed', statusC: P.green, statusBg: P.greenL },
      ]
    }
  ];

  let gy = 196;
  groups.forEach(group => {
    els.push(text(20, gy + 14, group.label, 11, P.text3, { fw: 600, ls: 0.8 }));
    gy += 28;
    group.items.forEach(c => {
      els.push(rect(16, gy, W - 32, 62, P.surf, { rx: 8, stroke: P.border, sw: 1 }));
      // doc type indicator — left stripe
      els.push(rect(16, gy, 4, 62, c.statusC, { rx: 2 }));
      els.push(text(30, gy + 22, c.name, 13, P.text, { fw: 600 }));
      els.push(text(30, gy + 40, c.party + ' · ' + c.pages, 11, P.text2));
      // badge
      const bw = c.status.length * 7 + 14;
      els.push(rect(W - 36 - bw, gy + 16, bw, 20, c.statusBg, { rx: 10 }));
      els.push(text(W - 36 - bw + 7, gy + 30, c.status, 10, c.statusC, { fw: 600 }));
      gy += 70;
    });
    gy += 8;
  });

  navBar(els, 'docs');
  return { name: 'Contracts', elements: els };
}

// ── SCREEN 3: Contract Detail ─────────────────────────────────────────────────
function screen3() {
  const els = [];
  statusBar(els);

  // Back nav
  els.push(rect(0, 44, W, 50, P.bg));
  els.push(text(16, 74, '← Back', 13, P.navy, { fw: 500 }));
  // context menu
  els.push(rect(W - 46, 56, 30, 26, P.surf, { rx: 8, stroke: P.border, sw: 1 }));
  els.push(text(W - 40, 73, '•••', 12, P.text2));

  // Contract title area — editorial serif
  els.push(rect(0, 94, W, 80, P.surf));
  els.push(text(20, 122, 'SaaS Master Agreement', 18, P.text, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(20, 143, 'Acorn Tech Inc.  ·  14 pages  ·  Signed Apr 9', 11, P.text2));
  // signed badge
  els.push(rect(20, 153, 62, 16, P.greenL, { rx: 8 }));
  els.push(text(26, 165, '✓ Signed', 10, P.green, { fw: 600 }));

  // Divider
  els.push(line(0, 172, W, 172, P.border));

  // Tab bar: Overview / Document / Parties / Audit
  const tabs2 = ['Overview', 'Document', 'Parties', 'Audit'];
  tabs2.forEach((t, i) => {
    const x = 16 + i * 90;
    const active = i === 1;
    els.push(text(x, 194, t, 13, active ? P.navy : P.text2, { fw: active ? 700 : 400 }));
    if (active) els.push(rect(x - 2, 198, t.length * 7 + 4, 2, P.navy, { rx: 1 }));
  });

  // Document preview panel
  els.push(rect(16, 208, W - 32, 330, P.surf, { rx: 10, stroke: P.border, sw: 1 }));

  // Document text lines (simulated)
  const docLines = [
    { w: 0.9, bold: true, size: 14 },  // title
    { w: 0.0, bold: false, size: 0 },  // spacer
    { w: 0.85, bold: false, size: 11 },
    { w: 0.78, bold: false, size: 11 },
    { w: 0.82, bold: false, size: 11 },
    { w: 0.60, bold: false, size: 11 },
    { w: 0.0, bold: false, size: 0 },
    { w: 0.75, bold: true, size: 12 },
    { w: 0.88, bold: false, size: 11 },
    { w: 0.80, bold: false, size: 11 },
    { w: 0.76, bold: false, size: 11 },
    { w: 0.91, bold: false, size: 11 },
    { w: 0.55, bold: false, size: 11 },
  ];
  let dy = 228;
  docLines.forEach(dl => {
    if (dl.w > 0) {
      els.push(rect(32, dy, (W - 64) * dl.w, dl.bold ? 9 : 7, P.border, { rx: 2, opacity: dl.bold ? 1 : 0.6 }));
    }
    dy += dl.size > 11 ? 22 : (dl.size === 0 ? 14 : 18);
  });

  // Annotation sidebar marker
  els.push(rect(W - 56, 260, 34, 56, '#FFF9E6', { rx: 6, stroke: '#E8D48B', sw: 1 }));
  els.push(text(W - 50, 278, '💬', 14));
  els.push(text(W - 50, 300, '2', 11, P.amber, { fw: 700 }));

  // Section highlight (highlighted clause)
  els.push(rect(32, 320, (W - 64) * 0.91, 7, '#FFF3C4', { rx: 2 }));
  els.push(rect(32, 338, (W - 64) * 0.80, 7, '#FFF3C4', { rx: 2 }));

  // Signature strip at bottom of doc
  els.push(rect(32, 498, (W - 64), 30, P.greenL, { rx: 6 }));
  els.push(text(40, 518, '✓  Signed by Alexandra Wren  ·  Apr 9, 2025', 10, P.green, { fw: 600 }));

  // Comment thread below
  els.push(text(20, 556, 'Comments (2)', 13, P.text, { fw: 700 }));
  els.push(rect(16, 568, W - 32, 60, P.surf, { rx: 8, stroke: P.border, sw: 1 }));
  els.push(circle(30, 584, 10, P.navy));
  els.push(text(25, 589, 'MW', 8, '#FFF', { fw: 700 }));
  els.push(text(46, 580, 'Marcus W. · Legal', 11, P.text, { fw: 600 }));
  els.push(text(46, 596, 'Section 4.2 needs review before final sign-off.', 11, P.text2));
  els.push(text(46, 616, 'Apr 8 · 2:14 pm', 10, P.text3));

  navBar(els, 'docs');
  return { name: 'Contract Detail', elements: els };
}

// ── SCREEN 4: Signing Flow ────────────────────────────────────────────────────
function screen4() {
  const els = [];
  statusBar(els);

  // Header
  els.push(rect(0, 44, W, 56, P.bg));
  els.push(text(20, 78, 'Sign Document', 20, P.text, { fw: 700, font: 'Georgia, serif' }));

  // Progress steps
  const steps = ['Review', 'Identity', 'Sign', 'Confirm'];
  els.push(rect(16, 108, W - 32, 50, P.bg));
  // connector line
  els.push(line(40, 130, W - 40, 130, P.border, { sw: 2 }));
  // active fill to step 3
  els.push(line(40, 130, (W - 40) * 0.62 + 40, 130, P.navy, { sw: 2 }));
  steps.forEach((s, i) => {
    const sx = 40 + i * ((W - 80) / 3);
    const done = i < 2;
    const active = i === 2;
    els.push(circle(sx, 130, 12, done ? P.green : (active ? P.navy : P.surf),
      done || active ? {} : { stroke: P.border, sw: 1.5 }));
    els.push(text(sx - 3, 135, done ? '✓' : String(i + 1), 9, done || active ? '#FFF' : P.text3, { fw: 700 }));
    els.push(text(sx - (s.length * 3), 152, s, 9, active ? P.navy : (done ? P.green : P.text3), { fw: active ? 700 : 400 }));
  });

  // Document preview (small)
  els.push(rect(16, 168, W - 32, 120, P.surf, { rx: 10, stroke: P.border, sw: 1 }));
  els.push(text(28, 192, 'Freelance NDA', 14, P.text, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(28, 210, 'Simone Maretti  ·  3 pages', 11, P.text2));
  // mini lines
  for (let i = 0; i < 4; i++) {
    els.push(rect(28, 222 + i * 14, (W - 72) * (0.7 + Math.random() * 0.25), 6, P.border, { rx: 2, opacity: 0.5 }));
  }
  // page indicator
  els.push(text(W - 40, 276, 'p.3', 10, P.text3, { anchor: 'end' }));

  // Signature field
  els.push(rect(16, 300, W - 32, 130, P.surf, { rx: 12, stroke: P.navy, sw: 1.5 }));
  els.push(text(28, 322, 'Signature', 11, P.text3, { fw: 500, ls: 0.5 }));
  // "written" signature curve (stylized)
  els.push(rect(28, 340, 200, 50, '#F5F3FF', { rx: 6 }));
  els.push(text(35, 374, 'Alexandra Wren', 22, P.navy, { fw: 400, font: 'Georgia, serif', opacity: 0.85 }));
  els.push(line(28, 395, 228, 395, P.navy, { sw: 1, opacity: 0.3 }));
  els.push(text(28, 415, 'Tap to change  ·  Draw instead', 11, P.navy, { fw: 500 }));

  // Identity verified chip
  els.push(rect(16, 442, 200, 28, P.greenL, { rx: 14 }));
  els.push(text(24, 460, '✓  Identity verified via Passkey', 11, P.green, { fw: 600 }));

  // Parties strip
  els.push(rect(16, 482, W - 32, 72, P.surf, { rx: 10, stroke: P.border, sw: 1 }));
  els.push(text(28, 503, 'Signers', 11, P.text3, { fw: 600, ls: 0.5 }));
  const signers = [
    { init: 'AW', name: 'Alexandra Wren (you)', done: true },
    { init: 'SM', name: 'Simone Maretti', done: false },
  ];
  signers.forEach((s, i) => {
    const sy = 516 + i * 24;
    els.push(circle(28, sy + 8, 10, s.done ? P.green : P.card));
    els.push(text(23, sy + 13, s.init, 7, s.done ? '#FFF' : P.text2, { fw: 700 }));
    els.push(text(44, sy + 13, s.name, 11, P.text));
    els.push(text(W - 32, sy + 13, s.done ? '✓ Signed' : 'Awaiting', 10, s.done ? P.green : P.amber, { anchor: 'end', fw: 600 }));
  });

  // CTA
  els.push(rect(16, 572, W - 32, 50, P.navy, { rx: 14 }));
  els.push(text(W / 2, 603, 'Confirm & Sign', 15, '#FFFFFF', { fw: 700, anchor: 'middle' }));

  // Disclaimer
  els.push(text(W / 2, 636, 'By signing, you agree to our terms and e-signature policy', 10, P.text3, { anchor: 'middle' }));

  navBar(els, 'sign');
  return { name: 'Signing Flow', elements: els };
}

// ── SCREEN 5: Analytics / Audit Trail ────────────────────────────────────────
function screen5() {
  const els = [];
  statusBar(els);

  // Header
  els.push(rect(0, 44, W, 56, P.bg));
  els.push(text(20, 78, 'Insights', 24, P.text, { fw: 700, font: 'Georgia, serif' }));
  // period toggle
  els.push(rect(268, 56, 106, 30, P.surf, { rx: 15, stroke: P.border, sw: 1 }));
  els.push(text(278, 75, '30d', 11, P.text2));
  els.push(line(306, 61, 306, 81, P.border, { sw: 1 }));
  els.push(text(312, 75, '90d', 11, P.navy, { fw: 600 }));
  els.push(line(336, 61, 336, 81, P.border, { sw: 1 }));
  els.push(text(342, 75, '1y', 11, P.text2));

  // Summary row
  const kpis = [
    { val: '31', lbl: 'Total', color: P.text },
    { val: '22', lbl: 'Completed', color: P.green },
    { val: '7', lbl: 'Pending', color: P.amber },
    { val: '2', lbl: 'Expired', color: P.red },
  ];
  kpis.forEach((k, i) => {
    const x = 14 + i * 92;
    els.push(rect(x, 108, 84, 54, P.surf, { rx: 8, stroke: P.border, sw: 1 }));
    els.push(text(x + 10, 135, k.val, 22, k.color, { fw: 700, font: 'Georgia, serif' }));
    els.push(text(x + 10, 150, k.lbl, 10, P.text2));
  });

  // Bar chart
  els.push(text(20, 186, 'Contracts signed per month', 12, P.text, { fw: 600 }));
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const vals   = [3, 5, 4, 7, 6, 8];
  const maxV   = 10;
  const chartH = 90, chartY = 240;
  months.forEach((m, i) => {
    const bh = (vals[i] / maxV) * chartH;
    const bx = 24 + i * 58;
    // background bar
    els.push(rect(bx + 8, chartY - chartH, 26, chartH, P.card, { rx: 4 }));
    // value bar
    els.push(rect(bx + 8, chartY - bh, 26, bh, i === 5 ? P.navy : P.navyL, { rx: 4, opacity: i === 5 ? 1 : 0.5 }));
    els.push(text(bx + 21, chartY - bh - 8, String(vals[i]), 9, P.text2, { anchor: 'middle', fw: 600 }));
    els.push(text(bx + 21, chartY + 14, m, 9, P.text3, { anchor: 'middle' }));
  });

  // Divider
  els.push(line(16, 270, W - 16, 270, P.border));

  // Avg turnaround stat
  els.push(rect(16, 278, W - 32, 54, P.surf, { rx: 10, stroke: P.border, sw: 1 }));
  els.push(text(28, 298, 'Avg. signing time', 12, P.text2));
  els.push(text(28, 318, '2.4 days', 18, P.navy, { fw: 700, font: 'Georgia, serif' }));
  els.push(text(W - 32, 318, '↓ 0.6d vs last period', 11, P.green, { anchor: 'end', fw: 500 }));

  // Audit trail
  els.push(text(20, 352, 'Recent Audit Activity', 13, P.text, { fw: 700 }));
  const events = [
    { icon: '✓', label: 'Alexandra signed NDA', time: 'Apr 9, 2:48pm', color: P.green },
    { icon: '👁', label: 'Simone opened Lease Renewal', time: 'Apr 8, 11:23am', color: P.navy },
    { icon: '✉', label: 'Reminder sent to M. Ritter', time: 'Apr 8, 9:00am', color: P.amber },
    { icon: '📝', label: 'Draft uploaded: Vendor SLA', time: 'Apr 7, 5:15pm', color: P.text2 },
    { icon: '✓', label: 'D. Okonkwo signed Employment Contract', time: 'Apr 6, 3:02pm', color: P.green },
    { icon: '🔒', label: 'NDA executed — legally binding', time: 'Apr 5, 10:44am', color: P.navy },
  ];
  events.forEach((ev, i) => {
    const y = 368 + i * 56;
    // timeline dot + line
    els.push(circle(32, y + 16, 8, ev.color, { opacity: 0.15 }));
    els.push(text(27, y + 21, ev.icon, 10));
    if (i < events.length - 1) els.push(line(32, y + 26, 32, y + 56, P.border, { sw: 1 }));
    els.push(text(48, y + 18, ev.label, 12, P.text, { fw: 500 }));
    els.push(text(48, y + 34, ev.time, 10, P.text3));
  });

  navBar(els, 'anal');
  return { name: 'Analytics', elements: els };
}

// ── SCREEN 6: Templates ───────────────────────────────────────────────────────
function screen6() {
  const els = [];
  statusBar(els);

  // Header
  els.push(rect(0, 44, W, 56, P.bg));
  els.push(text(20, 78, 'Templates', 24, P.text, { fw: 700, font: 'Georgia, serif' }));
  // new template btn
  els.push(rect(316, 56, 58, 30, P.navy, { rx: 15 }));
  els.push(text(325, 76, '+ New', 11, '#FFFFFF', { fw: 600 }));

  // Search
  els.push(rect(16, 108, W - 32, 38, P.surf, { rx: 10, stroke: P.border, sw: 1 }));
  els.push(text(40, 132, 'Search templates...', 13, P.text3));
  els.push(circle(29, 127, 7, 'none', { stroke: P.text3, sw: 1.5 }));
  els.push(line(34, 132, 38, 136, P.text3, { sw: 1.5 }));

  // Category chips
  const cats = ['All', 'Legal', 'HR', 'Finance', 'Real Estate'];
  let cx = 16;
  cats.forEach((c, i) => {
    const cw = c.length * 7 + 16;
    els.push(rect(cx, 156, cw, 28, i === 0 ? P.navy : P.surf, { rx: 14, stroke: i === 0 ? 'none' : P.border, sw: 1 }));
    els.push(text(cx + 8, 174, c, 11, i === 0 ? '#FFFFFF' : P.text2, { fw: i === 0 ? 600 : 400 }));
    cx += cw + 8;
  });

  // Template grid — 2-column bento style (inspired by bento grid trend from Saaspo)
  const templates = [
    { name: 'NDA Standard', cat: 'Legal', pages: '3p', uses: 84, accent: P.navy },
    { name: 'Employment\nContract', cat: 'HR', pages: '6p', uses: 62, accent: '#5B21B6' },
    { name: 'SaaS Subscription\nAgreement', cat: 'Legal', pages: '14p', uses: 47, accent: P.navy, wide: true },
    { name: 'Consulting\nAgreement', cat: 'Legal', pages: '8p', uses: 39, accent: P.navy },
    { name: 'Lease\nRenewal', cat: 'Real Estate', pages: '22p', uses: 31, accent: '#0369A1' },
    { name: 'Independent\nContractor', cat: 'HR', pages: '5p', uses: 27, accent: '#5B21B6' },
  ];

  const colW = (W - 40) / 2;
  let row = 0;
  let col = 0;
  let baseY = 198;

  templates.forEach((t, i) => {
    if (t.wide) {
      const ty = baseY + row * 116;
      els.push(rect(16, ty, W - 32, 104, P.surf, { rx: 10, stroke: P.border, sw: 1 }));
      // left accent bar
      els.push(rect(16, ty, 4, 104, t.accent, { rx: 2 }));
      els.push(text(30, ty + 28, t.name.replace('\n', ' '), 14, P.text, { fw: 700 }));
      els.push(text(30, ty + 48, t.cat + '  ·  ' + t.pages, 11, P.text2));
      els.push(text(30, ty + 66, 'Used ' + t.uses + ' times', 10, P.text3));
      // use btn
      els.push(rect(W - 100, ty + 36, 70, 28, t.accent, { rx: 14 }));
      els.push(text(W - 72, ty + 54, 'Use', 12, '#FFFFFF', { fw: 600, anchor: 'middle' }));
      row++;
      col = 0;
    } else {
      const tx = 16 + col * (colW + 8);
      const ty = baseY + row * 116;
      els.push(rect(tx, ty, colW, 104, P.surf, { rx: 10, stroke: P.border, sw: 1 }));
      els.push(rect(tx, ty, colW, 104, t.accent, { rx: 10, opacity: 0.04 }));
      // doc icon placeholder
      els.push(rect(tx + 12, ty + 14, 26, 32, P.card, { rx: 4 }));
      els.push(line(tx + 17, ty + 24, tx + 32, ty + 24, P.border, { sw: 1.5 }));
      els.push(line(tx + 17, ty + 30, tx + 32, ty + 30, P.border, { sw: 1.5 }));
      els.push(line(tx + 17, ty + 36, tx + 28, ty + 36, P.border, { sw: 1.5 }));
      const lines = t.name.split('\n');
      els.push(text(tx + 12, ty + 64, lines[0], 12, P.text, { fw: 700 }));
      if (lines[1]) els.push(text(tx + 12, ty + 78, lines[1], 12, P.text, { fw: 700 }));
      els.push(text(tx + 12, ty + 94, t.uses + ' uses', 9, P.text3));
      col++;
      if (col >= 2) { col = 0; row++; }
    }
  });

  // Pro upgrade banner
  const bannerY = 600;
  els.push(rect(16, bannerY, W - 32, 60, P.navy, { rx: 12 }));
  els.push(text(28, bannerY + 22, 'DEED Pro', 11, '#93C5FD', { fw: 700, ls: 0.5 }));
  els.push(text(28, bannerY + 40, 'Unlock 50+ premium templates', 13, '#FFFFFF', { fw: 500 }));
  els.push(rect(W - 110, bannerY + 18, 86, 28, '#FFFFFF', { rx: 14 }));
  els.push(text(W - 68, bannerY + 37, 'Upgrade', 12, P.navy, { fw: 700, anchor: 'middle' }));

  navBar(els, 'tpl');
  return { name: 'Templates', elements: els };
}

// ── Assemble ──────────────────────────────────────────────────────────────────
const screens = [screen1(), screen2(), screen3(), screen4(), screen5(), screen6()];

// Fix SVG data for each screen
screens.forEach(scr => {
  const svgEls = scr.elements.map(el => {
    if (el.type === 'rect') {
      return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${el.rx||0}" opacity="${el.opacity!==undefined?el.opacity:1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
    } else if (el.type === 'text') {
      const ff = el.fontFamily || 'system-ui, -apple-system, sans-serif';
      return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${el.fontWeight||400}" font-family="${ff}" text-anchor="${el.textAnchor||'start'}" letter-spacing="${el.letterSpacing||0}" opacity="${el.opacity!==undefined?el.opacity:1}">${String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    } else if (el.type === 'circle') {
      return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity!==undefined?el.opacity:1}" stroke="${el.stroke||'none'}" stroke-width="${el.strokeWidth||0}"/>`;
    } else if (el.type === 'line') {
      return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth||1}" opacity="${el.opacity||1}"/>`;
    }
    return '';
  }).join('\n    ');

  scr.svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">\n    <rect width="${W}" height="${H}" fill="${P.bg}"/>\n    ${svgEls}\n  </svg>`;
});

const totalEls = screens.reduce((s, sc) => s + sc.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: 'DEED — Contract Intelligence',
    author: 'RAM',
    date: new Date().toISOString().split('T')[0],
    theme: 'light',
    heartbeat: 18,
    elements: totalEls,
    palette: {
      bg: P.bg, surface: P.surf, text: P.text,
      accent: P.navy, accent2: P.green, muted: 'rgba(26,23,20,0.45)',
    },
    inspiration: 'Land-Book Stripe-style SaaS + Lapa Ninja serif renaissance + Minimal Gallery purposeful asymmetry',
    slug: SLUG,
  },
  screens: screens.map(s => ({
    name: s.name,
    svg: s.svg,
    elements: s.elements,
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`DEED: ${screens.length} screens, ${totalEls} elements`);
console.log(`Written: ${SLUG}.pen`);
