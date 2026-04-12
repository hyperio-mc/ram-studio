/**
 * FOLD — Financial clarity for freelancers
 * Inspired by: Equals.com (land-book.com) — editorial warm-white, condensed serif display type,
 * yellow (#FFCC00) + purple (#B074CE) accent pair, mono numerics
 * + Huehaus Agency (minimal.gallery) — PP Mondwest oversized display as graphic element
 *
 * Light theme: warm off-white bg, editorial headline type, mono financial data
 */
const fs = require('fs');

// ─── PALETTE ────────────────────────────────────────────────────────────────
const P = {
  bg:       '#FAF9F5',   // Equals.com warm off-white
  surface:  '#FFFFFF',
  surface2: '#F3F1EB',   // warm card alt
  border:   '#E6E3D7',   // warm divider
  text:     '#1C1917',   // almost-black warm
  textSub:  '#6B6560',   // warm mid-grey
  textMuted:'#A09990',   // muted warm
  yellow:   '#F5C300',   // Equals' #FFCC00 toned slightly
  yellowBg: '#FEF7D5',   // yellow tint bg
  purple:   '#8A5CBF',   // Equals' #B074CE deeper
  purpleBg: '#EFE8F8',   // purple tint bg
  green:    '#2D8A5E',
  greenBg:  '#E5F5EE',
  red:      '#C43B3B',
  redBg:    '#FCEAEA',
  white:    '#FFFFFF',
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const W = 390;
const H = 844;
let idCounter = 1;
const id = () => `node_${idCounter++}`;

function frame(name, x, y, w, h, fill, children = [], extra = {}) {
  return { id: id(), type: 'FRAME', name, x, y, width: w, height: h,
    fill: fill || 'transparent', cornerRadius: 0, children, ...extra };
}

function rect(name, x, y, w, h, fill, extra = {}) {
  return { id: id(), type: 'RECT', name, x, y, width: w, height: h, fill, ...extra };
}

function text(content, x, y, w, h, opts = {}) {
  return {
    id: id(), type: 'TEXT', name: content.slice(0, 30),
    x, y, width: w, height: h,
    content,
    fontSize:    opts.size    || 14,
    fontFamily:  opts.font    || 'Inter',
    fontWeight:  opts.weight  || '400',
    color:       opts.color   || P.text,
    align:       opts.align   || 'left',
    lineHeight:  opts.lh      || 1.4,
    letterSpacing: opts.ls    || 0,
    opacity:     opts.opacity || 1,
  };
}

function pill(label, x, y, bg, color, size = 11) {
  return frame(`pill-${label}`, x, y, 0, 0, bg, [
    text(label, 8, 5, 80, 16, { size, color, weight: '600' })
  ], { cornerRadius: 20, paddingH: 8, paddingV: 5, autoWidth: true });
}

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

function topBar(title, subtitle) {
  return frame('TopBar', 0, 0, W, 88, P.bg, [
    // Status bar
    text('9:41', 16, 14, 60, 16, { size: 13, weight: '600', color: P.text }),
    text('●●●', W-70, 14, 60, 16, { size: 13, color: P.text, align: 'right' }),
    // Title area
    text(title, 20, 44, 260, 28, { size: 22, weight: '700', color: P.text, font: 'Georgia' }),
    subtitle ? text(subtitle, 20, 70, 260, 16, { size: 13, color: P.textSub }) : null,
  ].filter(Boolean));
}

function bottomNav(active) {
  const tabs = [
    { icon: '◫', label: 'Overview', id: 0 },
    { icon: '⊞', label: 'Projects', id: 1 },
    { icon: '◻', label: 'Invoices', id: 2 },
    { icon: '↗', label: 'Reports',  id: 3 },
    { icon: '◎', label: 'Profile',  id: 4 },
  ];
  const tabW = W / tabs.length;
  return frame('BottomNav', 0, H - 82, W, 82, P.white, [
    rect('nav-border', 0, 0, W, 1, P.border),
    ...tabs.map((t, i) => {
      const isActive = i === active;
      return frame(`tab-${t.label}`, i * tabW, 0, tabW, 82, 'transparent', [
        text(t.icon, tabW/2 - 10, 12, 20, 20, { size: 18, color: isActive ? P.purple : P.textMuted, align: 'center' }),
        text(t.label, tabW/2 - 24, 34, 48, 14, { size: 10, weight: isActive ? '600' : '400', color: isActive ? P.purple : P.textMuted, align: 'center' }),
      ]);
    }),
    // active pill
    rect('active-dot', active * tabW + tabW/2 - 14, 72, 28, 4, P.purple, { cornerRadius: 2 }),
  ]);
}

// ─── SCREEN 1: OVERVIEW DASHBOARD ───────────────────────────────────────────
function screenOverview() {
  const children = [
    rect('bg', 0, 0, W, H, P.bg),

    // ── TOP BAR
    topBar('FOLD', 'Mar 2026'),

    // ── HERO: Big editorial number (Equals-style condensed display)
    frame('HeroCard', 20, 96, W-40, 180, P.white, [
      rect('hero-border', 0, 0, W-40, 180, 'transparent', { cornerRadius: 16, borderColor: P.border, borderWidth: 1 }),
      text('Revenue', 20, 20, 200, 16, { size: 12, weight: '600', color: P.textSub, ls: 1.5 }),
      text('March', 20, 38, 200, 16, { size: 12, color: P.textMuted }),
      // Big editorial number — the key design moment
      text('$24,850', 20, 58, 320, 72, { size: 68, weight: '700', font: 'Georgia', color: P.text, ls: -2 }),
      // trend
      rect('trend-bg', 20, 136, 90, 26, P.greenBg, { cornerRadius: 6 }),
      text('↑ 12.4%', 30, 141, 80, 16, { size: 13, weight: '600', color: P.green }),
      text('vs last month', 124, 141, 120, 16, { size: 12, color: P.textSub }),
      // mini sparkline dots
      ...[0,1,2,3,4,5,6,7,8,9,10,11].map((i, idx) => {
        const heights = [30, 45, 35, 55, 50, 60, 48, 70, 58, 68, 80, 75];
        const barH = (heights[idx] / 80) * 28;
        return rect(`bar-${idx}`, W-40-20 - (11-i)*14, 136 + 28 - barH, 8, barH, idx===11 ? P.yellow : P.border, { cornerRadius: 2 });
      }),
    ], { cornerRadius: 16 }),

    // ── SPLIT: Invoiced vs Received
    frame('SplitRow', 20, 288, W-40, 72, 'transparent', [
      // Invoiced
      frame('SplitInvoiced', 0, 0, (W-40)/2 - 6, 72, P.purpleBg, [
        text('Invoiced', 16, 14, 140, 14, { size: 11, weight: '600', color: P.purple, ls: 0.5 }),
        text('$31,200', 16, 32, 180, 28, { size: 26, weight: '700', font: 'Georgia', color: P.text }),
        text('4 pending', 16, 56, 120, 12, { size: 11, color: P.purple }),
      ], { cornerRadius: 12 }),
      // Expenses
      frame('SplitExpenses', (W-40)/2 + 6, 0, (W-40)/2 - 6, 72, P.yellowBg, [
        text('Expenses', 16, 14, 140, 14, { size: 11, weight: '600', color: '#9A7A00', ls: 0.5 }),
        text('$6,350', 16, 32, 180, 28, { size: 26, weight: '700', font: 'Georgia', color: P.text }),
        text('14 items', 16, 56, 120, 12, { size: 11, color: '#9A7A00' }),
      ], { cornerRadius: 12 }),
    ]),

    // ── SECTION HEADER
    text('This week', 20, 376, 160, 18, { size: 16, weight: '700', color: P.text }),
    text('See all →', W - 80, 378, 60, 16, { size: 13, color: P.purple }),

    // ── TRANSACTION LIST
    ...[
      { name: 'Branding project — Stripe', amt: '+$4,200', date: 'Today', color: P.green, bg: P.greenBg, icon: '◈' },
      { name: 'Figma subscription', amt: '-$45', date: 'Yesterday', color: P.red, bg: P.redBg, icon: '◉' },
      { name: 'Logo design — Paypal', amt: '+$1,800', date: 'Mar 24', color: P.green, bg: P.greenBg, icon: '◈' },
      { name: 'Notion subscription', amt: '-$16', date: 'Mar 23', color: P.red, bg: P.redBg, icon: '◉' },
    ].map((t, i) => {
      const y = 404 + i * 60;
      return frame(`tx-${i}`, 20, y, W-40, 52, P.white, [
        rect('tx-border', 0, 0, W-40, 52, 'transparent', { borderColor: P.border, borderWidth: 1, cornerRadius: 12 }),
        rect('icon-bg', 12, 12, 28, 28, t.bg, { cornerRadius: 8 }),
        text(t.icon, 18, 18, 16, 16, { size: 14, color: t.color }),
        text(t.name, 52, 10, 200, 16, { size: 13, weight: '500', color: P.text }),
        text(t.date, 52, 28, 120, 14, { size: 11, color: P.textMuted }),
        text(t.amt, W-40-70, 16, 60, 20, { size: 15, weight: '700', color: t.color, align: 'right', font: 'Courier New' }),
      ], { cornerRadius: 12 });
    }),

    bottomNav(0),
  ];
  return frame('Screen/Overview', 0, 0, W, H, P.bg, children);
}

// ─── SCREEN 2: PROJECTS ───────────────────────────────────────────────────────
function screenProjects() {
  const projects = [
    { name: 'Luminary Brand Identity', client: 'Luminary Inc.', value: '$12,400', pct: 85, status: 'Active', statusBg: P.greenBg, statusColor: P.green },
    { name: 'Equals Dashboard UI', client: 'Equals Co.', value: '$8,750', pct: 60, status: 'Active', statusBg: P.greenBg, statusColor: P.green },
    { name: 'Motion System v2', client: 'Framer', value: '$5,200', pct: 100, status: 'Done', statusBg: P.purpleBg, statusColor: P.purple },
    { name: 'Type Specimen Site', client: 'Kometatype', value: '$2,900', pct: 30, status: 'Draft', statusBg: P.yellowBg, statusColor: '#9A7A00' },
  ];

  return frame('Screen/Projects', 0, 0, W, H, P.bg, [
    rect('bg', 0, 0, W, H, P.bg),
    topBar('Projects', '4 active this quarter'),

    // ── SUMMARY BAR: big editorial total
    frame('TotalBar', 20, 96, W-40, 70, P.text, [
      text('Total pipeline', 16, 12, 200, 14, { size: 11, weight: '600', color: '#A09990', ls: 1 }),
      text('$29,250', 16, 28, 280, 36, { size: 36, weight: '700', font: 'Georgia', color: P.white, ls: -1 }),
      text('Q1 2026', W-40-70, 28, 60, 36, { size: 14, color: P.textMuted, align: 'right' }),
    ], { cornerRadius: 16 }),

    // ── PROJECT CARDS
    ...projects.map((p, i) => {
      const y = 182 + i * 128;
      const barFull = W - 40 - 40;
      const barFill = Math.round(barFull * p.pct / 100);
      return frame(`project-${i}`, 20, y, W-40, 116, P.white, [
        rect('card-border', 0, 0, W-40, 116, 'transparent', { borderColor: P.border, borderWidth: 1, cornerRadius: 14 }),
        // status badge
        rect('status-bg', W-40-80, 16, 68, 22, p.statusBg, { cornerRadius: 6 }),
        text(p.status, W-40-72, 19, 56, 14, { size: 11, weight: '600', color: p.statusColor, align: 'center' }),
        // name + client
        text(p.name, 16, 16, 220, 18, { size: 15, weight: '700', color: P.text }),
        text(p.client, 16, 36, 220, 14, { size: 12, color: P.textSub }),
        // value (mono)
        text(p.value, 16, 58, 100, 22, { size: 20, weight: '700', font: 'Courier New', color: P.text }),
        text(`${p.pct}% complete`, 120, 62, 120, 14, { size: 12, color: P.textSub }),
        // progress bar
        rect('bar-bg', 16, 88, barFull, 8, P.surface2, { cornerRadius: 4 }),
        rect('bar-fill', 16, 88, barFill, 8, p.pct===100 ? P.purple : P.yellow, { cornerRadius: 4 }),
      ], { cornerRadius: 14 });
    }),

    // ── ADD PROJECT FAB
    frame('FAB', W-70, H-140, 52, 52, P.text, [
      text('+', 14, 8, 24, 36, { size: 28, weight: '300', color: P.white, align: 'center' }),
    ], { cornerRadius: 26 }),

    bottomNav(1),
  ]);
}

// ─── SCREEN 3: INVOICES ──────────────────────────────────────────────────────
function screenInvoices() {
  const invoices = [
    { id: 'INV-041', client: 'Luminary Inc.', amt: '$4,200', due: 'Due Mar 28', status: 'Pending', statusBg: P.yellowBg, statusColor: '#9A7A00' },
    { id: 'INV-040', client: 'Framer', amt: '$5,200', due: 'Due Apr 2', status: 'Sent', statusBg: P.purpleBg, statusColor: P.purple },
    { id: 'INV-039', client: 'Equals Co.', amt: '$8,750', due: 'Paid Mar 20', status: 'Paid', statusBg: P.greenBg, statusColor: P.green },
    { id: 'INV-038', client: 'Kometatype', amt: '$1,450', due: 'Paid Mar 14', status: 'Paid', statusBg: P.greenBg, statusColor: P.green },
    { id: 'INV-037', client: 'Huehaus', amt: '$2,100', due: 'Overdue 3d', status: 'Late', statusBg: P.redBg, statusColor: P.red },
  ];

  return frame('Screen/Invoices', 0, 0, W, H, P.bg, [
    rect('bg', 0, 0, W, H, P.bg),
    topBar('Invoices', ''),

    // ── FILTER PILLS
    frame('FilterRow', 20, 92, W-40, 32, 'transparent', [
      rect('pill-all', 0, 0, 44, 28, P.text, { cornerRadius: 14 }),
      text('All', 10, 6, 24, 16, { size: 12, weight: '600', color: P.white }),
      rect('pill-pending', 52, 0, 68, 28, P.surface2, { cornerRadius: 14 }),
      text('Pending', 60, 6, 52, 16, { size: 12, color: P.textSub }),
      rect('pill-paid', 128, 0, 48, 28, P.surface2, { cornerRadius: 14 }),
      text('Paid', 136, 6, 32, 16, { size: 12, color: P.textSub }),
      rect('pill-late', 184, 0, 44, 28, P.redBg, { cornerRadius: 14 }),
      text('Late', 192, 6, 28, 16, { size: 12, color: P.red }),
    ]),

    // ── OVERDUE ALERT BAR
    frame('AlertBar', 20, 136, W-40, 48, P.redBg, [
      text('⚠', 16, 14, 20, 20, { size: 16, color: P.red }),
      text('INV-037 is 3 days overdue — $2,100', 42, 12, 260, 16, { size: 13, weight: '600', color: P.red }),
      text('Remind →', W-40-70, 17, 60, 14, { size: 12, color: P.red }),
    ], { cornerRadius: 12 }),

    // ── INVOICE LIST
    ...invoices.map((inv, i) => {
      const y = 198 + i * 62;
      return frame(`inv-${i}`, 20, y, W-40, 54, P.white, [
        rect('inv-border', 0, 0, W-40, 54, 'transparent', { borderColor: P.border, borderWidth: 1, cornerRadius: 12 }),
        // invoice id (mono, like a code)
        text(inv.id, 14, 8, 72, 14, { size: 11, weight: '600', font: 'Courier New', color: P.textMuted }),
        text(inv.client, 14, 24, 180, 16, { size: 14, weight: '600', color: P.text }),
        text(inv.due, 14, 40, 160, 12, { size: 11, color: P.textMuted }),
        // amount (editorial mono)
        text(inv.amt, W-40-100, 10, 88, 22, { size: 18, weight: '700', font: 'Courier New', color: P.text, align: 'right' }),
        // status badge
        rect('s-bg', W-40-90, 34, 76, 18, inv.statusBg, { cornerRadius: 5 }),
        text(inv.status, W-40-86, 36, 68, 14, { size: 11, weight: '600', color: inv.statusColor, align: 'center' }),
      ], { cornerRadius: 12 });
    }),

    // ── CREATE INVOICE
    frame('CreateBtn', 20, H - 150, W-40, 48, P.text, [
      text('+ Create new invoice', W/2-100, 14, 200, 20, { size: 15, weight: '600', color: P.white, align: 'center' }),
    ], { cornerRadius: 24 }),

    bottomNav(2),
  ]);
}

// ─── SCREEN 4: REPORTS ───────────────────────────────────────────────────────
function screenReports() {
  // Monthly bars for the last 6 months
  const months = [
    { m: 'O', v: 14200, h: 70 },
    { m: 'N', v: 18900, h: 93 },
    { m: 'D', v: 12100, h: 60 },
    { m: 'J', v: 21400, h: 105 },
    { m: 'F', v: 19800, h: 97 },
    { m: 'M', v: 24850, h: 122 },
  ];
  const maxH = 122;
  const barW = 32;
  const barGap = 12;
  const chartStartX = 20 + (W-40 - months.length*(barW+barGap))/2;
  const chartBaseY = 320;

  return frame('Screen/Reports', 0, 0, W, H, P.bg, [
    rect('bg', 0, 0, W, H, P.bg),
    topBar('Reports', 'Year to date'),

    // ── PERIOD SELECTOR
    frame('PeriodRow', 20, 90, W-40, 32, P.surface2, [
      rect('p-sel', 0, 0, (W-40)/3, 32, P.text, { cornerRadius: 10 }),
      text('6M', (W-40)/6 - 8, 8, 24, 16, { size: 13, weight: '600', color: P.white, align: 'center' }),
      text('1Y', (W-40)/2 - 8, 8, 24, 16, { size: 13, color: P.textSub, align: 'center' }),
      text('All', (W-40)*5/6 - 8, 8, 24, 16, { size: 13, color: P.textSub, align: 'center' }),
    ], { cornerRadius: 10 }),

    // ── KEY METRICS ROW
    frame('MetricsRow', 20, 136, W-40, 80, 'transparent', [
      frame('m1', 0, 0, (W-40)/3 - 6, 80, P.white, [
        rect('m1b', 0, 0, (W-40)/3-6, 80, 'transparent', { borderColor: P.border, borderWidth: 1, cornerRadius: 12 }),
        text('Avg/mo', 14, 12, 100, 14, { size: 10, weight: '600', color: P.textMuted, ls: 0.5 }),
        text('$18.5k', 14, 28, 100, 28, { size: 22, weight: '700', font: 'Georgia', color: P.text }),
        text('↑ 8%', 14, 58, 60, 14, { size: 11, color: P.green }),
      ], { cornerRadius: 12 }),
      frame('m2', (W-40)/3 + 3, 0, (W-40)/3 - 6, 80, P.white, [
        rect('m2b', 0, 0, (W-40)/3-6, 80, 'transparent', { borderColor: P.border, borderWidth: 1, cornerRadius: 12 }),
        text('Best mo', 14, 12, 100, 14, { size: 10, weight: '600', color: P.textMuted, ls: 0.5 }),
        text('$24.8k', 14, 28, 100, 28, { size: 22, weight: '700', font: 'Georgia', color: P.text }),
        text('Mar 26', 14, 58, 60, 14, { size: 11, color: P.purple }),
      ], { cornerRadius: 12 }),
      frame('m3', (W-40)*2/3 + 6, 0, (W-40)/3 - 6, 80, P.white, [
        rect('m3b', 0, 0, (W-40)/3-6, 80, 'transparent', { borderColor: P.border, borderWidth: 1, cornerRadius: 12 }),
        text('Rate', 14, 12, 100, 14, { size: 10, weight: '600', color: P.textMuted, ls: 0.5 }),
        text('$185/h', 14, 28, 100, 28, { size: 20, weight: '700', font: 'Georgia', color: P.text }),
        text('avg', 14, 58, 60, 14, { size: 11, color: P.textSub }),
      ], { cornerRadius: 12 }),
    ]),

    // ── BAR CHART SECTION HEADER
    text('Monthly Revenue', 20, 234, 200, 18, { size: 15, weight: '700', color: P.text }),
    text('Oct → Mar', W-90, 236, 70, 16, { size: 12, color: P.textSub }),

    // ── BAR CHART
    frame('BarChart', 20, 260, W-40, 150, P.white, [
      rect('chart-border', 0, 0, W-40, 150, 'transparent', { borderColor: P.border, borderWidth: 1, cornerRadius: 14 }),
      // grid lines
      ...[0.25, 0.5, 0.75].map(f =>
        rect(`grid-${f}`, 14, 16 + (1-f)*(maxH), W-40-28, 1, P.border)
      ),
      // bars
      ...months.map((mo, i) => {
        const bx = 20 + i * (barW + barGap);
        const by = chartBaseY - 110 - mo.h;
        const isLast = i === months.length - 1;
        return frame(`bar-group-${i}`, bx, 20, barW, 120, 'transparent', [
          rect(`bar-${i}`, 0, 120 - mo.h, barW, mo.h,
            isLast ? P.purple : P.yellow, { cornerRadius: 4 }),
          isLast ? rect('bar-top', 0, 120 - mo.h, barW, 4, P.text, { cornerRadius: 2 }) : null,
          text(mo.m, 0, 106, barW, 14, { size: 10, color: isLast ? P.text : P.textMuted, align: 'center', weight: isLast ? '700' : '400' }),
        ].filter(Boolean));
      }),
    ], { cornerRadius: 14 }),

    // ── INCOME BREAKDOWN
    text('Income sources', 20, 424, 200, 18, { size: 15, weight: '700', color: P.text }),
    frame('BreakdownCard', 20, 448, W-40, 100, P.white, [
      rect('bk-border', 0, 0, W-40, 100, 'transparent', { borderColor: P.border, borderWidth: 1, cornerRadius: 14 }),
      ...[
        { label: 'Brand design', pct: 52, color: P.yellow },
        { label: 'UI/UX design', pct: 31, color: P.purple },
        { label: 'Motion', pct: 17, color: P.border },
      ].map((b, i) => {
        const y = 16 + i * 28;
        const barW2 = Math.round((W-40-120) * b.pct / 100);
        return frame(`bk-${i}`, 16, y, W-40-32, 22, 'transparent', [
          text(b.label, 0, 4, 100, 14, { size: 12, color: P.text }),
          rect('bk-bar-bg', 110, 7, W-40-120-16, 8, P.surface2, { cornerRadius: 4 }),
          rect('bk-bar-fill', 110, 7, barW2, 8, b.color, { cornerRadius: 4 }),
          text(`${b.pct}%`, W-40-32-30, 4, 28, 14, { size: 12, weight: '600', color: P.text, align: 'right' }),
        ]);
      }),
    ], { cornerRadius: 14 }),

    bottomNav(3),
  ]);
}

// ─── SCREEN 5: AI INSIGHTS / PROFILE ─────────────────────────────────────────
function screenInsights() {
  return frame('Screen/Insights', 0, 0, W, H, P.bg, [
    rect('bg', 0, 0, W, H, P.bg),

    // top
    rect('top-fill', 0, 0, W, 220, P.text),
    text('9:41', 16, 14, 60, 16, { size: 13, weight: '600', color: P.white }),
    text('●●●', W-70, 14, 60, 16, { size: 13, color: P.white, align: 'right' }),

    // Profile header on dark band
    text('FOLD Intelligence', 20, 40, 280, 24, { size: 20, weight: '700', color: P.white, font: 'Georgia' }),
    text('AI-powered insights for Q1 2026', 20, 68, 300, 16, { size: 13, color: 'rgba(255,255,255,0.6)' }),

    // ── Score ring (simulated)
    rect('ring-bg', W/2 - 48, 92, 96, 96, 'rgba(255,255,255,0.1)', { cornerRadius: 48 }),
    rect('ring-inner', W/2 - 38, 102, 76, 76, P.text, { cornerRadius: 38 }),
    text('87', W/2 - 22, 118, 44, 36, { size: 34, weight: '700', font: 'Georgia', color: P.white, align: 'center' }),
    text('health score', W/2 - 38, 158, 76, 12, { size: 10, color: 'rgba(255,255,255,0.5)', align: 'center' }),

    // AI insights cards
    ...([
      { title: 'On track for best quarter', body: 'March revenue puts you +18% above Q1 target. Consider raising your day rate by Q2.', icon: '✦', bg: P.white, tc: P.text, bc: P.text },
      { title: 'Invoice velocity up', body: 'Average payment time dropped to 9 days vs. 14 last quarter. Automated reminders are working.', icon: '↑', bg: P.purpleBg, tc: P.purple, bc: P.purple },
      { title: 'Expense ratio healthy', body: 'Tools + subscriptions at 4.1% of revenue. Industry average is 6.5%. Save $180 by removing 2 unused tools.', icon: '◎', bg: P.yellowBg, tc: '#9A7A00', bc: '#9A7A00' },
    ].map((ins, i) => {
      const y = 232 + i * 118;
      return frame(`insight-${i}`, 20, y, W-40, 110, ins.bg, [
        rect('ins-border', 0, 0, W-40, 110, 'transparent', { borderColor: P.border, borderWidth: 1, cornerRadius: 16 }),
        rect('ins-icon-bg', 16, 16, 34, 34, ins.bg === P.white ? P.surface2 : 'rgba(255,255,255,0.6)', { cornerRadius: 10 }),
        text(ins.icon, 22, 22, 22, 22, { size: 18, color: ins.tc }),
        text(ins.title, 62, 16, 250, 16, { size: 14, weight: '700', color: P.text }),
        text(ins.body, 16, 56, W-40-32, 48, { size: 12, color: P.textSub, lh: 1.5 }),
      ], { cornerRadius: 16 });
    })),

    bottomNav(3),
  ]);
}

// ─── SCREEN 6: ONBOARDING ────────────────────────────────────────────────────
function screenOnboarding() {
  return frame('Screen/Onboarding', 0, 0, W, H, P.bg, [
    rect('bg', 0, 0, W, H, P.bg),

    // BIG editorial display type — the Equals / Huehaus moment
    // Layered text as texture
    text('FOLD', -8, 60, W + 20, 180, { size: 160, weight: '700', font: 'Georgia',
      color: P.surface2, ls: -8, opacity: 1 }),

    // Actual hero copy over it
    text('Financial\nclarity for\nfreelancers.', 24, 80, W-48, 200, {
      size: 44, weight: '700', font: 'Georgia', color: P.text, lh: 1.15, ls: -1 }),

    // Sub
    text('Track revenue, invoices and\nprojects — all in one place.', 24, 280, W-48, 56, {
      size: 16, color: P.textSub, lh: 1.5 }),

    // Feature dots
    ...[
      ['◈', 'Real-time revenue tracking'],
      ['◻', 'Smart invoicing with reminders'],
      ['↗', 'AI-powered financial insights'],
    ].map(([icon, label], i) => frame(`feat-${i}`, 24, 356 + i*44, W-48, 36, 'transparent', [
      rect('feat-icon', 0, 6, 24, 24, P.surface2, { cornerRadius: 6 }),
      text(icon, 4, 10, 16, 16, { size: 12, color: P.text }),
      text(label, 36, 8, W-96, 18, { size: 14, color: P.text }),
    ])),

    // CTA
    frame('CTA', 24, H-180, W-48, 52, P.text, [
      text('Get started — it\'s free', W/2-100, 16, 200, 20, { size: 16, weight: '600', color: P.white, align: 'center' }),
    ], { cornerRadius: 26 }),

    text('Already have an account?  Sign in', W/2-120, H-116, 240, 20, {
      size: 14, color: P.textSub, align: 'center' }),

    // Bottom indicator dots
    ...([0,1,2].map(i => rect(`dot-${i}`, W/2 - 20 + i*14, H-72, 8, 8,
      i===0 ? P.text : P.border, { cornerRadius: 4 }))),
  ]);
}

// ─── ASSEMBLE PEN ────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'FOLD — Financial clarity for freelancers',
  width: W,
  height: H,
  fill: P.bg,
  children: [
    screenOnboarding(),
    screenOverview(),
    screenProjects(),
    screenInvoices(),
    screenReports(),
    screenInsights(),
  ],
};

fs.writeFileSync('fold.pen', JSON.stringify(pen, null, 2));
console.log('✓ fold.pen written —', pen.children.length, 'screens');
console.log('  Screens:', pen.children.map(s => s.name).join(', '));
