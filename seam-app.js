// SEAM — Client-to-cash, seamlessly
// Inspired by: SUTÉRA (Awwwards SOTD Mar 28 2026) multi-reality switching +
// midday.ai's clean founder-finance SaaS tab navigation (via darkmodedesign.com)
// Theme: LIGHT — warm paper whites with indigo + emerald accents

const fs = require('fs');

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const C = {
  bg:       '#F5F3EF',   // warm paper
  surface:  '#FFFFFF',
  surface2: '#F0EDE8',   // slightly warmer card
  border:   '#E4E0D8',
  text:     '#1C1917',
  textSub:  '#78716C',
  textMut:  '#A8A29E',
  indigo:   '#4F46E5',
  indigoL:  '#EEF2FF',
  emerald:  '#059669',
  emeraldL: '#ECFDF5',
  amber:    '#D97706',
  amberL:   '#FFFBEB',
  rose:     '#E11D48',
  roseL:    '#FFF1F2',
  sky:      '#0284C7',
  skyL:     '#F0F9FF',
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
let elId = 1;
const id = () => `el_${elId++}`;

function rect(x, y, w, h, fill, opts = {}) {
  return {
    id: id(), type: 'RECTANGLE',
    x, y, width: w, height: h,
    fill: fill || 'transparent',
    cornerRadius: opts.r || 0,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
    stroke: opts.stroke || null,
    strokeWidth: opts.strokeWidth || 0,
  };
}

function text(x, y, content, size, color, opts = {}) {
  return {
    id: id(), type: 'TEXT',
    x, y,
    content: String(content),
    fontSize: size,
    fontWeight: opts.bold ? 700 : opts.medium ? 500 : opts.semibold ? 600 : 400,
    color: color,
    letterSpacing: opts.ls || 0,
    lineHeight: opts.lh || (size * 1.4),
    textAlign: opts.align || 'left',
    width: opts.w || 300,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
    fontFamily: opts.font || 'Inter',
  };
}

function group(children, opts = {}) {
  return {
    id: id(), type: 'GROUP',
    x: opts.x || 0, y: opts.y || 0,
    children,
    opacity: opts.opacity !== undefined ? opts.opacity : 1,
  };
}

// Status pill
function pill(x, y, label, bg, textColor, opts = {}) {
  const pw = opts.w || (label.length * 7 + 16);
  return group([
    rect(0, 0, pw, 20, bg, { r: 10 }),
    text(8, 3, label, 10, textColor, { medium: true, w: pw - 16 }),
  ], { x, y });
}

// Card container
function card(x, y, w, h, opts = {}) {
  return rect(x, y, w, h, opts.fill || C.surface, {
    r: opts.r || 12,
    stroke: opts.stroke || C.border,
    strokeWidth: opts.strokeWidth || 1,
  });
}

// Icon placeholder (small colored square)
function icon(x, y, color, size = 16) {
  return rect(x, y, size, size, color, { r: 4 });
}

// Mini bar chart
function miniBar(x, y, values, maxH, color) {
  const barW = 8, gap = 4;
  const maxVal = Math.max(...values);
  return group(values.map((v, i) => {
    const bh = Math.max(2, (v / maxVal) * maxH);
    return rect(i * (barW + gap), maxH - bh, barW, bh, color, { r: 2 });
  }), { x, y });
}

// Progress bar
function progressBar(x, y, w, pct, trackColor, fillColor, h = 4) {
  return group([
    rect(0, 0, w, h, trackColor, { r: h / 2 }),
    rect(0, 0, Math.round(w * pct), h, fillColor, { r: h / 2 }),
  ], { x, y });
}

// ─── STATUS BAR ──────────────────────────────────────────────────────────────
function statusBar(y = 0) {
  return group([
    rect(0, 0, 390, 48, C.bg),
    text(20, 15, '9:41', 15, C.text, { bold: true, w: 60 }),
    text(320, 15, '●●● ▲ 🔋', 12, C.text, { w: 70, align: 'right' }),
  ], { x: 0, y });
}

// ─── TOP NAV ──────────────────────────────────────────────────────────────────
function topNav(y, title, hasBack = false, actionLabel = '') {
  return group([
    rect(0, 0, 390, 52, C.bg),
    hasBack ? text(20, 16, '← Back', 13, C.indigo, { w: 60 }) : rect(0, 0, 0, 0, 'transparent'),
    text(hasBack ? 120 : 20, 16, title, 17, C.text, { bold: true, w: hasBack ? 150 : 260, align: hasBack ? 'center' : 'left' }),
    actionLabel ? text(300, 16, actionLabel, 13, C.indigo, { medium: true, w: 80, align: 'right' }) : rect(0,0,0,0,'transparent'),
  ], { x: 0, y });
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
function bottomNav(activeIdx) {
  const items = [
    { label: 'Overview', icon: '⬡' },
    { label: 'Contracts', icon: '⬡' },
    { label: 'Invoices', icon: '⬡' },
    { label: 'Cash', icon: '⬡' },
    { label: 'Clients', icon: '⬡' },
  ];
  const itemW = 78;
  return group([
    rect(0, 0, 390, 82, C.surface, { stroke: C.border, strokeWidth: 1 }),
    ...items.map((item, i) => {
      const x = i * itemW;
      const isActive = i === activeIdx;
      return group([
        rect(x + 24, 6, 30, 30, isActive ? C.indigoL : 'transparent', { r: 8 }),
        rect(x + 30, 11, 18, 18, isActive ? C.indigo : C.textMut, { r: 4 }),
        text(x + 0, 40, item.label, 9, isActive ? C.indigo : C.textMut, {
          medium: true, w: itemW, align: 'center',
        }),
      ]);
    }),
    // home indicator
    rect(145, 68, 100, 4, C.textMut, { r: 2, opacity: 0.3 }),
  ], { x: 0, y: 762 });
}

// ─── SCREEN 1: OVERVIEW DASHBOARD ────────────────────────────────────────────
function screen1() {
  const els = [];
  els.push(rect(0, 0, 390, 844, C.bg));

  // Status bar + nav
  els.push(statusBar(0));
  els.push(topNav(48, 'SEAM', false, '+ New'));

  // Greeting
  els.push(text(20, 112, 'Good morning, Alex', 22, C.text, { bold: true, w: 280 }));
  els.push(text(20, 138, 'March 28, 2026 · 3 actions need attention', 13, C.textSub, { w: 300 }));

  // Hero metric row
  const metrics = [
    { label: 'Active Contracts', value: '12', delta: '+2 this month', color: C.indigo },
    { label: 'Unpaid Invoices', value: '$18.4k', delta: '4 overdue', color: C.emerald },
    { label: '30-day Revenue', value: '$52k', delta: '↑ 14%', color: C.sky },
  ];
  metrics.forEach((m, i) => {
    const x = i === 0 ? 16 : i === 1 ? 147 : 278;
    const w = i === 0 ? 119 : i === 1 ? 119 : 96;
    els.push(card(x, 162, w, 88, { r: 14 }));
    els.push(rect(x + 10, 172, 6, 24, m.color, { r: 3 }));
    els.push(text(x + 22, 172, m.value, 18, C.text, { bold: true, w: w - 32 }));
    els.push(text(x + 10, 198, m.label, 9, C.textSub, { w: w - 20, lh: 12 }));
    els.push(text(x + 10, 216, m.delta, 9, m.color, { medium: true, w: w - 20 }));
  });

  // AI Insight banner
  els.push(card(16, 264, 358, 64, { r: 14 }));
  els.push(rect(16, 264, 358, 64, C.indigoL, { r: 14 }));
  els.push(rect(28, 276, 40, 40, C.indigo, { r: 10, opacity: 0.15 }));
  els.push(rect(36, 284, 24, 24, C.indigo, { r: 6 }));
  els.push(text(80, 275, 'AI Insight', 10, C.indigo, { bold: true, ls: 0.5, w: 260 }));
  els.push(text(80, 290, 'Horizon Creative is 14 days late — send a reminder?', 13, C.text, { w: 260, lh: 17 }));

  // Active projects header
  els.push(text(20, 345, 'Active Projects', 15, C.text, { bold: true, w: 200 }));
  els.push(text(300, 347, 'See all →', 12, C.indigo, { w: 80, align: 'right' }));

  // Project cards
  const projects = [
    { name: 'Brand Refresh', client: 'Horizon Creative', stage: 'Contract Signed', stageColor: C.emerald, stageBg: C.emeraldL, pct: 0.65, amount: '$8,400', due: 'Apr 5' },
    { name: 'Website Redesign', client: 'Volta Systems', stage: 'In Progress', stageColor: C.sky, stageBg: C.skyL, pct: 0.30, amount: '$14,200', due: 'Apr 22' },
    { name: 'Q2 Campaign', client: 'Maison Studio', stage: 'Proposal Sent', stageColor: C.amber, stageBg: C.amberL, pct: 0.10, amount: '$6,000', due: 'TBD' },
  ];
  projects.forEach((p, i) => {
    const cy = 368 + i * 108;
    els.push(card(16, cy, 358, 96, { r: 14 }));
    els.push(text(20, cy + 14, p.name, 15, C.text, { bold: true, w: 200 }));
    els.push(text(20, cy + 33, p.client, 12, C.textSub, { w: 160 }));
    // Stage pill
    const pillW = p.stage.length * 7 + 16;
    els.push(rect(20, cy + 52, pillW, 18, p.stageBg, { r: 9 }));
    els.push(text(28, cy + 55, p.stage, 9, p.stageColor, { medium: true, w: pillW - 16 }));
    // Amount + due
    els.push(text(290, cy + 14, p.amount, 15, C.text, { bold: true, w: 80, align: 'right' }));
    els.push(text(290, cy + 33, `Due ${p.due}`, 11, C.textMut, { w: 80, align: 'right' }));
    // Progress
    els.push(progressBar(20, cy + 78, 280, p.pct, C.surface2, p.stageColor, 3));
    els.push(text(308, cy + 73, `${Math.round(p.pct * 100)}%`, 10, C.textSub, { w: 40 }));
  });

  els.push(bottomNav(0));
  return { name: 'Overview', elements: els };
}

// ─── SCREEN 2: CONTRACTS PIPELINE ────────────────────────────────────────────
function screen2() {
  const els = [];
  els.push(rect(0, 0, 390, 844, C.bg));
  els.push(statusBar(0));
  els.push(topNav(48, 'Contracts', false, '+ Draft'));

  // Tab pills
  const tabs = ['All', 'Proposals', 'Active', 'Completed'];
  tabs.forEach((t, i) => {
    const tw = t.length * 9 + 16;
    const tx = 20 + [0, 32, 100, 158, 238][i];
    const isActive = i === 0;
    els.push(rect(tx, 108, tw, 28, isActive ? C.indigo : C.surface2, { r: 14 }));
    els.push(text(tx + 8, 115, t, 12, isActive ? '#FFF' : C.textSub, { medium: true, w: tw - 16 }));
  });

  // Summary strip
  els.push(card(16, 150, 358, 56, { r: 14 }));
  const summaryItems = [
    { label: '3 Proposals', color: C.amber },
    { label: '7 Active', color: C.emerald },
    { label: '2 Expiring', color: C.rose },
  ];
  summaryItems.forEach((s, i) => {
    const sx = 28 + i * 118;
    els.push(rect(sx, 164, 8, 8, s.color, { r: 4 }));
    els.push(text(sx + 14, 161, s.label, 12, C.textSub, { medium: true, w: 100 }));
  });

  // Contract list
  const contracts = [
    {
      name: 'Brand Identity System',
      client: 'Horizon Creative',
      value: '$8,400',
      status: 'Active',
      statusColor: C.emerald,
      statusBg: C.emeraldL,
      expiry: 'Ends Jun 30',
      signed: 'Mar 1, 2026',
    },
    {
      name: 'Full-Stack Build',
      client: 'Volta Systems',
      value: '$24,000',
      status: 'Active',
      statusColor: C.sky,
      statusBg: C.skyL,
      expiry: 'Ends Sep 15',
      signed: 'Feb 14, 2026',
    },
    {
      name: 'Q2 Campaign Suite',
      client: 'Maison Studio',
      value: '$6,000',
      status: 'Proposal',
      statusColor: C.amber,
      statusBg: C.amberL,
      expiry: 'Expires Apr 10',
      signed: 'Pending',
    },
    {
      name: 'Annual Retainer',
      client: 'Pellucid Labs',
      value: '$36,000',
      status: 'Expiring',
      statusColor: C.rose,
      statusBg: C.roseL,
      expiry: 'Expires Apr 5',
      signed: 'Apr 2025',
    },
    {
      name: 'UX Audit',
      client: 'Nexa Health',
      value: '$4,800',
      status: 'Proposal',
      statusColor: C.amber,
      statusBg: C.amberL,
      expiry: 'Draft',
      signed: 'Pending',
    },
  ];
  contracts.forEach((c, i) => {
    const cy = 222 + i * 100;
    if (cy > 720) return;
    els.push(card(16, cy, 358, 88, { r: 14 }));
    // Left accent line
    els.push(rect(16, cy, 4, 88, c.statusColor, { r: 2 }));
    els.push(text(28, cy + 12, c.name, 14, C.text, { bold: true, w: 220 }));
    els.push(text(28, cy + 30, c.client, 12, C.textSub, { w: 180 }));
    // Status pill
    const pillW = c.status.length * 7.5 + 14;
    els.push(rect(28, cy + 52, pillW, 18, c.statusBg, { r: 9 }));
    els.push(text(35, cy + 55, c.status, 9, c.statusColor, { medium: true, w: pillW - 14 }));
    els.push(text(90, cy + 55, c.expiry, 10, C.textMut, { w: 150 }));
    // Value
    els.push(text(290, cy + 12, c.value, 15, C.text, { bold: true, w: 80, align: 'right' }));
    els.push(text(290, cy + 30, c.signed, 10, C.textMut, { w: 80, align: 'right' }));
  });

  els.push(bottomNav(1));
  return { name: 'Contracts', elements: els };
}

// ─── SCREEN 3: INVOICE STUDIO ─────────────────────────────────────────────────
function screen3() {
  const els = [];
  els.push(rect(0, 0, 390, 844, C.bg));
  els.push(statusBar(0));
  els.push(topNav(48, 'Invoices', false, '+ Create'));

  // Quick stats
  const stats = [
    { label: 'Awaiting', value: '$18.4k', color: C.indigo },
    { label: 'Overdue', value: '$3.2k', color: C.rose },
    { label: 'This month', value: '$21.6k', color: C.emerald },
  ];
  stats.forEach((s, i) => {
    const sx = 16 + i * 124;
    els.push(card(sx, 108, 112, 64, { r: 14 }));
    els.push(text(sx + 12, 118, s.value, 16, C.text, { bold: true, w: 90 }));
    els.push(rect(sx + 12, 138, 8, 8, s.color, { r: 4 }));
    els.push(text(sx + 24, 136, s.label, 10, C.textSub, { w: 80 }));
  });

  // Filter row
  const filters = ['All', 'Pending', 'Overdue', 'Paid'];
  filters.forEach((f, i) => {
    const fw = f.length * 8.5 + 16;
    const fx = 20 + [0, 34, 94, 156][i];
    const isA = i === 0;
    els.push(rect(fx, 186, fw, 26, isA ? C.indigo : C.surface2, { r: 13 }));
    els.push(text(fx + 8, 193, f, 11, isA ? '#FFF' : C.textSub, { medium: true, w: fw - 16 }));
  });

  // Invoice list
  const invoices = [
    { num: 'INV-082', client: 'Horizon Creative', desc: 'Brand Refresh — Phase 2', amount: '$3,200', due: 'Due Apr 2', status: 'Overdue', sc: C.rose, sb: C.roseL },
    { num: 'INV-081', client: 'Volta Systems', desc: 'Website Build — Milestone 1', amount: '$7,000', due: 'Due Apr 10', status: 'Pending', sc: C.amber, sb: C.amberL },
    { num: 'INV-080', client: 'Maison Studio', desc: 'Strategy Workshop', amount: '$2,400', due: 'Due Apr 15', status: 'Pending', sc: C.amber, sb: C.amberL },
    { num: 'INV-079', client: 'Pellucid Labs', desc: 'Monthly Retainer — March', amount: '$3,000', due: 'Paid Mar 28', status: 'Paid', sc: C.emerald, sb: C.emeraldL },
    { num: 'INV-078', client: 'Nexa Health', desc: 'UX Audit — Deliverables', amount: '$2,800', due: 'Paid Mar 20', status: 'Paid', sc: C.emerald, sb: C.emeraldL },
  ];
  invoices.forEach((inv, i) => {
    const iy = 226 + i * 102;
    if (iy > 720) return;
    els.push(card(16, iy, 358, 90, { r: 14 }));
    els.push(text(20, iy + 12, inv.num, 10, C.textMut, { medium: true, ls: 0.5, w: 100 }));
    els.push(text(20, iy + 27, inv.client, 14, C.text, { bold: true, w: 200 }));
    els.push(text(20, iy + 45, inv.desc, 11, C.textSub, { w: 230 }));
    // Status
    const pillW = inv.status.length * 7 + 14;
    els.push(rect(20, iy + 64, pillW, 16, inv.sb, { r: 8 }));
    els.push(text(27, iy + 67, inv.status, 9, inv.sc, { medium: true, w: pillW }));
    els.push(text(20 + pillW + 8, iy + 67, inv.due, 9, C.textMut, { w: 120 }));
    // Amount
    els.push(text(295, iy + 27, inv.amount, 15, C.text, { bold: true, w: 80, align: 'right' }));
    // Arrow
    els.push(text(360, iy + 38, '›', 18, C.textMut, { w: 14 }));
  });

  els.push(bottomNav(2));
  return { name: 'Invoices', elements: els };
}

// ─── SCREEN 4: CASHFLOW TIMELINE ─────────────────────────────────────────────
function screen4() {
  const els = [];
  els.push(rect(0, 0, 390, 844, C.bg));
  els.push(statusBar(0));
  els.push(topNav(48, 'Cash Flow', false, 'Export'));

  // Month tabs
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  months.forEach((m, i) => {
    const isActive = i === 2;
    const mx = 16 + i * 58;
    els.push(rect(mx, 108, 52, 28, isActive ? C.indigo : 'transparent', { r: 14 }));
    els.push(text(mx, 115, m, 12, isActive ? '#FFF' : C.textMut, { medium: true, w: 52, align: 'center' }));
  });

  // Hero metric
  els.push(card(16, 150, 358, 80, { r: 16 }));
  els.push(text(28, 164, 'March Revenue', 12, C.textSub, { w: 200 }));
  els.push(text(28, 182, '$52,000', 26, C.text, { bold: true, w: 200 }));
  els.push(text(28, 212, '↑ 14% vs February', 12, C.emerald, { medium: true, w: 200 }));
  els.push(text(260, 164, 'Runway', 11, C.textSub, { w: 80, align: 'right' }));
  els.push(text(260, 182, '4.2 mo', 18, C.indigo, { bold: true, w: 80, align: 'right' }));

  // Bar chart
  els.push(card(16, 244, 358, 160, { r: 16 }));
  els.push(text(28, 256, 'Monthly Overview', 13, C.text, { bold: true, w: 200 }));

  const barData = [28, 34, 41, 38, 52, 45];
  const maxBar = 52;
  const barH = 90;
  barData.forEach((v, i) => {
    const bw = 24;
    const bx = 28 + i * 52;
    const bh = (v / maxBar) * barH;
    // Background bar
    els.push(rect(bx, 256 + (barH - bh) + 14, bw, bh, i === 4 ? C.indigo : C.surface2, { r: 4 }));
    if (i === 4) {
      // Value label on active bar
      els.push(text(bx - 6, 254 + (barH - bh) + 8, `$${v}k`, 9, C.indigo, { bold: true, w: 40 }));
    }
    els.push(text(bx - 4, 360, months[i], 9, i === 2 ? C.text : C.textMut, { w: 32, align: 'center' }));
  });

  // Cash in/out breakdown
  els.push(text(20, 420, 'This Month', 15, C.text, { bold: true, w: 200 }));

  const cashItems = [
    { label: 'Invoice payments received', amount: '+$21,600', color: C.emerald },
    { label: 'Retainer — Pellucid Labs', amount: '+$3,000', color: C.emerald },
    { label: 'Stripe payout — Volta', amount: '+$7,000', color: C.emerald },
    { label: 'SaaS subscriptions', amount: '−$840', color: C.rose },
    { label: 'Payroll — Contract staff', amount: '−$4,200', color: C.rose },
    { label: 'Tools & Software', amount: '−$320', color: C.rose },
  ];
  cashItems.forEach((item, i) => {
    const cy = 444 + i * 46;
    if (cy > 720) return;
    els.push(rect(16, cy, 358, 40, i % 2 === 0 ? C.surface : C.bg, { r: 8 }));
    els.push(rect(24, cy + 12, 4, 16, item.amount.startsWith('+') ? C.emerald : C.rose, { r: 2 }));
    els.push(text(36, cy + 11, item.label, 12, C.text, { w: 240 }));
    els.push(text(290, cy + 11, item.amount, 13, item.color, { bold: true, w: 80, align: 'right' }));
  });

  // Projected income
  els.push(card(16, 726, 358, 22, { r: 8 }));
  els.push(text(20, 729, 'Projected April income', 12, C.textSub, { w: 200 }));
  els.push(text(290, 729, '$48,000', 12, C.indigo, { bold: true, w: 80, align: 'right' }));

  els.push(bottomNav(3));
  return { name: 'Cash Flow', elements: els };
}

// ─── SCREEN 5: CLIENT HUB ────────────────────────────────────────────────────
function screen5() {
  const els = [];
  els.push(rect(0, 0, 390, 844, C.bg));
  els.push(statusBar(0));
  els.push(topNav(48, 'Clients', false, 'Add'));

  // Search bar
  els.push(rect(16, 108, 358, 40, C.surface, { r: 20, stroke: C.border, strokeWidth: 1 }));
  els.push(rect(32, 120, 16, 16, C.textMut, { r: 4 }));
  els.push(text(56, 118, 'Search clients…', 13, C.textMut, { w: 280 }));

  // Relationship health header
  els.push(text(20, 164, '5 clients · avg health 84%', 12, C.textSub, { w: 280 }));
  els.push(text(280, 164, 'Sort: Revenue ▾', 12, C.indigo, { w: 100, align: 'right' }));

  // Client cards
  const clients = [
    {
      name: 'Volta Systems',
      type: 'Product Startup',
      revenue: '$38,200',
      health: 0.94,
      healthLabel: 'Excellent',
      healthColor: C.emerald,
      healthBg: C.emeraldL,
      contracts: 2,
      invoices: 3,
      since: 'Since Feb 2025',
      initials: 'VS',
      avatarBg: C.indigoL,
      avatarText: C.indigo,
    },
    {
      name: 'Horizon Creative',
      type: 'Agency',
      revenue: '$14,600',
      health: 0.62,
      healthLabel: 'At Risk',
      healthColor: C.rose,
      healthBg: C.roseL,
      contracts: 1,
      invoices: 2,
      since: 'Since Jan 2024',
      initials: 'HC',
      avatarBg: '#FEF9C3',
      avatarText: C.amber,
    },
    {
      name: 'Pellucid Labs',
      type: 'Enterprise · Retainer',
      revenue: '$36,000',
      health: 0.88,
      healthLabel: 'Good',
      healthColor: C.sky,
      healthBg: C.skyL,
      contracts: 1,
      invoices: 12,
      since: 'Since Apr 2024',
      initials: 'PL',
      avatarBg: '#E0F2FE',
      avatarText: C.sky,
    },
    {
      name: 'Maison Studio',
      type: 'Creative Agency',
      revenue: '$6,000',
      health: 0.71,
      healthLabel: 'Stable',
      healthColor: C.amber,
      healthBg: C.amberL,
      contracts: 1,
      invoices: 1,
      since: 'Since Mar 2026',
      initials: 'MS',
      avatarBg: '#FEF3C7',
      avatarText: C.amber,
    },
  ];

  clients.forEach((c, i) => {
    const cy = 188 + i * 134;
    if (cy > 720) return;
    els.push(card(16, cy, 358, 120, { r: 16 }));

    // Avatar
    els.push(rect(20, cy + 16, 44, 44, c.avatarBg, { r: 12 }));
    els.push(text(20, cy + 27, c.initials, 16, c.avatarText, { bold: true, w: 44, align: 'center' }));

    // Info
    els.push(text(74, cy + 16, c.name, 15, C.text, { bold: true, w: 180 }));
    els.push(text(74, cy + 34, c.type, 11, C.textSub, { w: 160 }));
    els.push(text(74, cy + 50, c.since, 10, C.textMut, { w: 160 }));

    // Revenue
    els.push(text(280, cy + 16, c.revenue, 15, C.text, { bold: true, w: 84, align: 'right' }));
    els.push(text(280, cy + 34, 'LTM Revenue', 9, C.textMut, { w: 84, align: 'right' }));

    // Health bar
    els.push(text(20, cy + 76, 'Relationship health', 10, C.textSub, { w: 180 }));
    els.push(progressBar(20, cy + 91, 220, c.health, C.surface2, c.healthColor, 5));
    const pillW = c.healthLabel.length * 7 + 14;
    els.push(rect(250, cy + 84, pillW, 18, c.healthBg, { r: 9 }));
    els.push(text(257, cy + 87, c.healthLabel, 9, c.healthColor, { medium: true, w: pillW - 14 }));

    // Meta
    els.push(text(20, cy + 104, `${c.contracts} contract${c.contracts > 1 ? 's' : ''} · ${c.invoices} invoice${c.invoices > 1 ? 's' : ''}`, 10, C.textMut, { w: 200 }));
  });

  els.push(bottomNav(4));
  return { name: 'Clients', elements: els };
}

// ─── SCREEN 6: NEW INVOICE ─────────────────────────────────────────────────
function screen6() {
  const els = [];
  els.push(rect(0, 0, 390, 844, C.bg));
  els.push(statusBar(0));
  els.push(topNav(48, 'New Invoice', true, 'Preview'));

  // AI suggestion banner
  els.push(rect(16, 108, 358, 52, C.indigoL, { r: 14 }));
  els.push(rect(24, 120, 28, 28, C.indigo, { r: 8, opacity: 0.2 }));
  els.push(rect(30, 126, 16, 16, C.indigo, { r: 4 }));
  els.push(text(62, 116, 'AI pre-filled from Volta Systems contract', 11, C.indigo, { bold: true, w: 280 }));
  els.push(text(62, 131, 'Milestone 2 · $7,000 · NET 14 terms applied', 11, C.indigo, { w: 280 }));

  // Form fields
  const fields = [
    { label: 'Client', value: 'Volta Systems', accent: true },
    { label: 'Invoice number', value: 'INV-083' },
    { label: 'Issue date', value: 'March 28, 2026' },
    { label: 'Due date', value: 'April 11, 2026' },
  ];
  fields.forEach((f, i) => {
    const fy = 176 + i * 68;
    els.push(text(20, fy, f.label, 11, C.textSub, { w: 200 }));
    els.push(rect(16, fy + 18, 358, 40, C.surface, { r: 12, stroke: f.accent ? C.indigo : C.border, strokeWidth: f.accent ? 2 : 1 }));
    els.push(text(28, fy + 28, f.value, 14, C.text, { w: 300 }));
  });

  // Line items section
  els.push(text(20, 454, 'Line Items', 14, C.text, { bold: true, w: 200 }));
  els.push(text(296, 456, '+ Add item', 12, C.indigo, { w: 80, align: 'right' }));

  const lineItems = [
    { desc: 'Website Build — Milestone 2', qty: 1, rate: '$7,000', total: '$7,000' },
    { desc: 'Hosting setup & DNS config', qty: 1, rate: '$400', total: '$400' },
  ];
  lineItems.forEach((li, i) => {
    const ly = 476 + i * 68;
    els.push(card(16, ly, 358, 58, { r: 12 }));
    els.push(text(24, ly + 10, li.desc, 13, C.text, { w: 240 }));
    els.push(text(24, ly + 29, `Qty ${li.qty} · Rate ${li.rate}`, 11, C.textSub, { w: 200 }));
    els.push(text(305, ly + 18, li.total, 14, C.text, { bold: true, w: 60, align: 'right' }));
  });

  // Total
  els.push(rect(16, 618, 358, 1, C.border));
  els.push(text(20, 628, 'Subtotal', 13, C.textSub, { w: 200 }));
  els.push(text(290, 628, '$7,400', 13, C.text, { w: 80, align: 'right' }));
  els.push(text(20, 648, 'Tax (0%)', 13, C.textSub, { w: 200 }));
  els.push(text(290, 648, '$0', 13, C.text, { w: 80, align: 'right' }));
  els.push(text(20, 672, 'Total Due', 16, C.text, { bold: true, w: 200 }));
  els.push(text(285, 672, '$7,400', 16, C.indigo, { bold: true, w: 85, align: 'right' }));

  // CTA
  els.push(rect(16, 706, 358, 48, C.indigo, { r: 24 }));
  els.push(text(16, 720, 'Send Invoice to Volta Systems', 15, '#FFFFFF', { bold: true, w: 358, align: 'center' }));

  els.push(bottomNav(2));
  return { name: 'New Invoice', elements: els };
}

// ─── ASSEMBLE PEN FILE ────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'SEAM — Client-to-cash, seamlessly',
  description: 'Light-theme freelance ops platform. Inspired by SUTÉRA multi-reality UI (Awwwards SOTD Mar 28 2026) + midday.ai finance SaaS structure. Warm paper palette, indigo/emerald accents, AI-assisted invoice creation.',
  screens: [
    screen1(),
    screen2(),
    screen3(),
    screen4(),
    screen5(),
    screen6(),
  ].map((s, i) => ({
    name: s.name,
    width: 390,
    height: 844,
    elements: s.elements,
  })),
};

fs.writeFileSync('seam.pen', JSON.stringify(pen, null, 2));
console.log('✓ seam.pen written —', pen.screens.length, 'screens');
pen.screens.forEach(s => console.log(' ', s.name, '·', s.elements.length, 'elements'));
