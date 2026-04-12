/**
 * SOLE — "Your whole business, one view"
 * A light-themed business OS for one-person companies.
 *
 * Trend inspiration:
 *  - Midday.ai (darkmodedesign.com) — "For the new wave of one-person companies"
 *    Clean financial OS, unified transactions, beautifully typeset data
 *  - Locomotive (godly.website) — editorial grid, strong typographic hierarchy,
 *    numbers as typographic elements
 *  - Lapa.ninja trending: Overlay, Paperclip — desktop utility apps with warm off-white surfaces
 *
 * Theme: LIGHT — warm parchment + terracotta + sage
 * Screens: 6 × 390×844
 */

const fs = require('fs');

const P = {
  bg:       '#F5F0E8',
  surface:  '#FFFFFF',
  surface2: '#EDE8DE',
  text:     '#1C1A16',
  textMid:  '#5A5650',
  muted:    '#9A9590',
  border:   '#E0DAD0',
  border2:  '#CFC9BE',
  accent:   '#C25234',
  accentLt: '#F0E5DF',
  accentDk: '#8C3420',
  sage:     '#4A7256',
  sageLt:   '#DFF0E6',
  amber:    '#C07020',
  amberLt:  '#F5E8CE',
};

let idCounter = 10;
const uid = () => 's' + (idCounter++);

const rect = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'rectangle', x, y, width: w, height: h, fill, ...opts
});

const text = (content, x, y, w, h, opts = {}) => ({
  id: uid(), type: 'text', content: String(content), x, y, width: w, height: h,
  textGrowth: 'fixed-width-height',
  fontSize: opts.size || 13,
  fontWeight: opts.weight || '400',
  fill: opts.fill || P.text,
  textAlign: opts.align || 'left',
  letterSpacing: opts.ls || 0,
  fontFamily: opts.font || 'Inter',
});

const frame = (x, y, w, h, fill, children, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h, fill,
  clip: false, children: children.filter(Boolean), ...opts
});

function navBar(title, subtitle) {
  return frame(0, 0, 390, 56, P.bg, [
    rect(0, 0, 390, 56, P.bg),
    rect(0, 55, 390, 1, P.border),
    text(title, 18, 14, 220, 16, { size: 16, weight: '700', fill: P.text }),
    text(subtitle, 18, 33, 260, 12, { size: 11, fill: P.muted, ls: 0.3 }),
    rect(348, 14, 26, 26, P.accent, { cornerRadius: 13 }),
    text('JK', 348, 19, 26, 16, { size: 10, weight: '700', fill: '#FFF', align: 'center' }),
  ]);
}

function tabBar(activeIdx) {
  const tabs = [
    { label: 'Today', icon: '◈' },
    { label: 'Money', icon: '◉' },
    { label: 'Clients', icon: '◫' },
    { label: 'Work', icon: '◧' },
    { label: 'You', icon: '◌' },
  ];
  const tabW = 78;
  const children = [
    rect(0, 0, 390, 72, P.surface),
    rect(0, 0, 390, 1, P.border),
  ];
  tabs.forEach((tab, i) => {
    const x = i * tabW;
    const isActive = i === activeIdx;
    if (isActive) children.push(rect(x + 19, 0, 40, 2, P.accent));
    children.push(text(tab.icon, x + 29, 12, 20, 18, { size: 16, fill: isActive ? P.accent : P.muted, align: 'center' }));
    children.push(text(tab.label, x + 6, 32, 66, 12, { size: 10, weight: isActive ? '600' : '400', fill: isActive ? P.accent : P.muted, align: 'center' }));
  });
  return frame(0, 772, 390, 72, P.surface, children);
}

function statCard(x, y, w, label, value, sub, accentColor) {
  return frame(x, y, w, 76, P.surface, [
    rect(0, 0, w, 76, P.surface, { cornerRadius: 8 }),
    rect(0, 0, 3, 76, accentColor),
    text(label, 14, 10, w - 20, 11, { size: 10, weight: '600', fill: P.muted, ls: 0.4 }),
    text(value, 14, 26, w - 20, 26, { size: 22, weight: '800', fill: P.text }),
    text(sub, 14, 58, w - 20, 11, { size: 10, fill: P.muted }),
  ], { cornerRadius: 8 });
}

function sectionLabel(label, x, y) {
  return text(label, x, y, 250, 11, { size: 10, weight: '600', fill: P.muted, ls: 0.8 });
}

// ── Screen 1: Today ───────────────────────────────────────────────────────────
function screenToday() {
  const taskItems = [
    { label: 'Send proposal — Aria Studios', tag: 'PROPOSAL', done: false, tagColor: P.accent, tagBg: P.accentLt },
    { label: 'Review Northfield invoice draft', tag: 'INVOICE', done: true, tagColor: P.sage, tagBg: P.sageLt },
    { label: 'Client call — TwoRoads (2pm)', tag: 'CALL', done: false, tagColor: P.amber, tagBg: P.amberLt },
  ];
  const bars = [52, 65, 48, 72, 60, 85];
  const barLabels = ['O', 'N', 'D', 'J', 'F', 'M'];

  return {
    id: 'screen-today', type: 'frame', x: 0, y: 0, width: 390, height: 844,
    name: 'Today', fill: P.bg,
    children: [
      rect(0, 0, 390, 844, P.bg),
      navBar('SOLE', 'Tuesday, 24 March 2026'),
      tabBar(0),
      // Date hero
      text('24', 18, 72, 100, 58, { size: 56, weight: '800', fill: P.text, ls: -2 }),
      text('MAR', 118, 74, 80, 26, { size: 22, weight: '700', fill: P.accent }),
      text('2026', 118, 102, 80, 18, { size: 14, weight: '400', fill: P.muted }),
      rect(18, 138, 354, 1, P.border2),
      // Revenue
      sectionLabel('REVENUE THIS MONTH', 18, 150),
      text('18,400', 18, 166, 230, 32, { size: 30, weight: '800', fill: P.text, ls: -1, font: 'Inter' }),
      text('GBP', 254, 178, 40, 18, { size: 13, weight: '600', fill: P.muted }),
      text('+12% vs Feb', 290, 174, 90, 14, { size: 11, weight: '600', fill: P.sage, align: 'right' }),
      // Mini bar chart
      ...bars.flatMap((pct, i) => {
        const h = Math.round(32 * pct / 100);
        const x = 18 + i * 27;
        return [
          rect(x, 248 - h, 20, h, i === 5 ? P.accent : P.surface2, { cornerRadius: 3 }),
          text(barLabels[i], x + 3, 252, 14, 10, { size: 9, fill: P.muted }),
        ];
      }),
      rect(18, 272, 354, 1, P.border),
      // Tasks
      sectionLabel("TODAY'S FOCUS", 18, 284),
      ...taskItems.flatMap((task, i) => {
        const y = 302 + i * 52;
        return [
          rect(18, y, 354, 42, P.surface, { cornerRadius: 8 }),
          rect(26, y + 14, 14, 14, task.done ? P.sage : P.border2, { cornerRadius: 4 }),
          task.done ? text('✓', 27, y + 15, 12, 12, { size: 9, weight: '700', fill: '#FFF', align: 'center' }) : null,
          text(task.label, 50, y + 14, 218, 14, { size: 12, weight: task.done ? '400' : '500', fill: task.done ? P.muted : P.text }),
          rect(278, y + 12, 76, 18, task.tagBg, { cornerRadius: 4 }),
          text(task.tag, 281, y + 15, 70, 12, { size: 8, weight: '700', fill: task.tagColor, align: 'center', ls: 0.3 }),
        ];
      }),
      rect(18, 462, 354, 1, P.border),
      // Active clients
      sectionLabel('ACTIVE CLIENTS', 18, 474),
      ...[
        { name: 'Aria Studios', status: 'Active retainer', mrr: '£2,400/mo', color: P.sage },
        { name: 'Northfield Co.', status: 'Invoice outstanding', mrr: '£3,800', color: P.amber },
        { name: 'TwoRoads Ltd', status: 'Proposal sent', mrr: '£5,000', color: P.accent },
      ].flatMap((c, i) => {
        const y = 492 + i * 50;
        return [
          rect(18, y, 354, 42, P.surface, { cornerRadius: 8 }),
          rect(18, y, 3, 42, c.color),
          text(c.name, 30, y + 8, 180, 14, { size: 13, weight: '600', fill: P.text }),
          text(c.status, 30, y + 25, 180, 11, { size: 10, fill: P.muted }),
          text(c.mrr, 300, y + 14, 68, 14, { size: 12, weight: '700', fill: P.text, align: 'right' }),
        ];
      }),
    ].filter(Boolean)
  };
}

// ── Screen 2: Money ───────────────────────────────────────────────────────────
function screenMoney() {
  const monthData = [
    { m: 'O', inc: 14200, exp: 3800 }, { m: 'N', inc: 16500, exp: 4100 },
    { m: 'D', inc: 12000, exp: 5200 }, { m: 'J', inc: 18100, exp: 3900 },
    { m: 'F', inc: 15600, exp: 4300 }, { m: 'M', inc: 18400, exp: 4210 },
  ];
  const maxVal = 20000;
  const maxH = 56;
  const txns = [
    { name: 'Aria Studios — Retainer', date: '22 Mar', amount: '+£2,400', inc: true },
    { name: 'Adobe CC', date: '20 Mar', amount: '– £58', inc: false },
    { name: 'Northfield invoice #0041', date: '18 Mar', amount: '+£3,800', inc: true },
    { name: 'Notion Pro', date: '15 Mar', amount: '– £16', inc: false },
    { name: 'TwoRoads deposit', date: '12 Mar', amount: '+£2,500', inc: true },
    { name: 'Co-working March', date: '01 Mar', amount: '– £220', inc: false },
  ];

  return {
    id: 'screen-money', type: 'frame', x: 430, y: 0, width: 390, height: 844,
    name: 'Money', fill: P.bg,
    children: [
      rect(0, 0, 390, 844, P.bg),
      navBar('Money', 'March 2026 — P&L'),
      tabBar(1),
      sectionLabel('P&L OVERVIEW', 18, 68),
      text('Revenue', 18, 86, 140, 14, { size: 12, fill: P.muted }),
      text('£18,400', 210, 82, 162, 20, { size: 18, weight: '800', fill: P.text, align: 'right', ls: -0.5 }),
      rect(18, 108, 354, 1, P.border),
      text('Expenses', 18, 118, 140, 14, { size: 12, fill: P.muted }),
      text('– £4,210', 210, 114, 162, 20, { size: 18, weight: '800', fill: P.accent, align: 'right', ls: -0.5 }),
      rect(18, 140, 354, 1, P.border2),
      text('NET PROFIT', 18, 150, 120, 12, { size: 10, weight: '700', fill: P.muted, ls: 0.8 }),
      text('£14,190', 18, 166, 354, 38, { size: 34, weight: '800', fill: P.sage, ls: -1 }),
      text('Est. tax: £3,547', 270, 182, 100, 14, { size: 11, fill: P.muted, align: 'right' }),
      rect(18, 214, 354, 1, P.border),
      sectionLabel('CASHFLOW — LAST 6 MONTHS', 18, 226),
      // Side-by-side bars
      ...monthData.flatMap((d, i) => {
        const incH = Math.round(d.inc / maxVal * maxH);
        const expH = Math.round(d.exp / maxVal * maxH);
        const x = 24 + i * 56;
        const baseY = 324;
        return [
          rect(x, baseY - incH, 22, incH, P.sage, { cornerRadius: 3 }),
          rect(x + 26, baseY - expH, 16, expH, P.accentLt, { cornerRadius: 3 }),
          text(d.m, x + 6, baseY + 4, 20, 10, { size: 9, fill: P.muted }),
        ];
      }),
      // Legend
      rect(18, 346, 8, 8, P.sage, { cornerRadius: 2 }),
      text('Income', 30, 344, 60, 11, { size: 10, fill: P.muted }),
      rect(100, 346, 8, 8, P.accentLt, { cornerRadius: 2 }),
      text('Expenses', 112, 344, 70, 11, { size: 10, fill: P.muted }),
      rect(18, 362, 354, 1, P.border),
      sectionLabel('RECENT TRANSACTIONS', 18, 374),
      ...txns.flatMap((tx, i) => {
        const y = 392 + i * 46;
        return [
          rect(18, y, 354, 38, P.surface, { cornerRadius: 6 }),
          rect(18, y, 3, 38, tx.inc ? P.sage : P.accent),
          text(tx.name, 30, y + 6, 230, 13, { size: 12, weight: '500', fill: P.text }),
          text(tx.date, 30, y + 22, 100, 10, { size: 10, fill: P.muted }),
          text(tx.amount, 300, y + 12, 66, 14, { size: 13, weight: '700', fill: tx.inc ? P.sage : P.accent, align: 'right' }),
        ];
      }),
    ].filter(Boolean)
  };
}

// ── Screen 3: Clients ─────────────────────────────────────────────────────────
function screenClients() {
  const clients = [
    { name: 'Aria Studios', contact: 'Priya Nair', value: '£2,400/mo', status: 'Active', tag: 'RETAINER', tagColor: P.sage, tagBg: P.sageLt, ini: 'AS', dotColor: P.sage },
    { name: 'Northfield Co.', contact: 'James Beckett', value: '£3,800', status: 'Invoice out', tag: 'AWAITING', tagColor: P.amber, tagBg: P.amberLt, ini: 'NC', dotColor: P.amber },
    { name: 'TwoRoads Ltd', contact: 'Sofia Morin', value: '£5,000', status: 'Proposal sent', tag: 'PROPOSAL', tagColor: P.accent, tagBg: P.accentLt, ini: 'TR', dotColor: P.accent },
    { name: 'Clearpath Ventures', contact: 'Marcus Osei', value: '£1,200', status: 'Onboarding', tag: 'NEW', tagColor: P.sage, tagBg: P.sageLt, ini: 'CV', dotColor: P.sage },
    { name: 'Modo Collective', contact: 'Ana Kovac', value: '–', status: 'Inactive', tag: 'PAUSED', tagColor: P.muted, tagBg: P.surface2, ini: 'MC', dotColor: P.border2 },
  ];

  return {
    id: 'screen-clients', type: 'frame', x: 860, y: 0, width: 390, height: 844,
    name: 'Clients', fill: P.bg,
    children: [
      rect(0, 0, 390, 844, P.bg),
      navBar('Clients', '5 relationships'),
      tabBar(2),
      // Portfolio bar
      rect(18, 64, 354, 6, P.surface2, { cornerRadius: 3 }),
      rect(18, 64, 177, 6, P.sage, { cornerRadius: 3 }),
      rect(195, 64, 75, 6, P.amber, { cornerRadius: 3 }),
      rect(270, 64, 58, 6, P.accent, { cornerRadius: 3 }),
      text('Active', 18, 76, 70, 10, { size: 9, fill: P.sage }),
      text('Invoiced', 100, 76, 70, 10, { size: 9, fill: P.amber }),
      text('Proposal', 200, 76, 70, 10, { size: 9, fill: P.accent }),
      sectionLabel('ALL CLIENTS', 18, 96),
      ...clients.flatMap((c, i) => {
        const y = 114 + i * 114;
        return [
          rect(18, y, 354, 102, P.surface, { cornerRadius: 10 }),
          rect(18, y, 3, 102, c.dotColor),
          rect(30, y + 12, 34, 34, P.surface2, { cornerRadius: 17 }),
          text(c.ini, 30, y + 19, 34, 20, { size: 11, weight: '700', fill: c.dotColor, align: 'center' }),
          text(c.name, 74, y + 12, 200, 15, { size: 13, weight: '700', fill: P.text }),
          text(c.contact, 74, y + 30, 200, 12, { size: 11, fill: P.muted }),
          rect(74, y + 52, 60, 18, c.tagBg, { cornerRadius: 4 }),
          text(c.tag, 77, y + 55, 54, 12, { size: 8, weight: '700', fill: c.tagColor, align: 'center', ls: 0.3 }),
          text(c.status, 142, y + 55, 120, 11, { size: 10, fill: P.muted }),
          text(c.value, 290, y + 18, 68, 16, { size: 14, weight: '700', fill: P.text, align: 'right' }),
          text('›', 366, y + 18, 10, 16, { size: 16, fill: P.border2, align: 'right' }),
          rect(30, y + 78, 330, 1, P.border),
          text('Last activity 2 days ago', 30, y + 84, 200, 11, { size: 10, fill: P.muted }),
          text('View →', 296, y + 84, 56, 11, { size: 10, weight: '600', fill: P.accent, align: 'right' }),
        ];
      }),
      rect(18, 686, 354, 44, P.accentLt, { cornerRadius: 10 }),
      text('+ Add new client', 100, 700, 190, 18, { size: 14, weight: '600', fill: P.accent, align: 'center' }),
    ].filter(Boolean)
  };
}

// ── Screen 4: Work ────────────────────────────────────────────────────────────
function screenWork() {
  const projects = [
    { name: 'Brand Identity System', client: 'Aria Studios', pct: 75, time: '32h logged', due: '28 Mar', status: 'In progress', color: P.sage },
    { name: 'Q2 Campaign Design', client: 'Northfield Co.', pct: 100, time: '48h logged', due: 'Done', status: 'Delivered', color: P.border2 },
    { name: 'Website Redesign', client: 'TwoRoads Ltd', pct: 15, time: '8h logged', due: '14 Apr', status: 'Just started', color: P.accent },
    { name: 'Pitch Deck', client: 'Clearpath Ventures', pct: 40, time: '12h logged', due: '01 Apr', status: 'In progress', color: P.amber },
  ];

  return {
    id: 'screen-work', type: 'frame', x: 1290, y: 0, width: 390, height: 844,
    name: 'Work', fill: P.bg,
    children: [
      rect(0, 0, 390, 844, P.bg),
      navBar('Work', '4 active projects'),
      tabBar(3),
      text('THIS WEEK', 18, 68, 100, 11, { size: 10, weight: '600', fill: P.muted, ls: 0.8 }),
      text('22h', 18, 82, 80, 28, { size: 26, weight: '800', fill: P.text }),
      text('logged', 100, 94, 60, 13, { size: 11, fill: P.muted }),
      text('55% capacity', 240, 88, 120, 14, { size: 11, weight: '600', fill: P.muted, align: 'right' }),
      rect(18, 120, 354, 7, P.surface2, { cornerRadius: 4 }),
      rect(18, 120, 195, 7, P.accent, { cornerRadius: 4 }),
      text('22 of 40 hours this week', 18, 134, 240, 11, { size: 10, fill: P.muted }),
      rect(18, 150, 354, 1, P.border),
      sectionLabel('ACTIVE PROJECTS', 18, 162),
      ...projects.flatMap((proj, i) => {
        const y = 180 + i * 148;
        const barW = Math.max(Math.round(314 * proj.pct / 100), 6);
        const isDone = proj.status === 'Delivered';
        return [
          rect(18, y, 354, 132, P.surface, { cornerRadius: 10 }),
          rect(18, y, 3, 132, proj.color),
          text(proj.name, 30, y + 12, 240, 16, { size: 13, weight: '700', fill: P.text }),
          text(proj.client, 30, y + 31, 200, 12, { size: 11, fill: P.muted }),
          rect(276, y + 12, 76, 18, isDone ? P.sageLt : P.accentLt, { cornerRadius: 4 }),
          text(isDone ? 'DONE' : 'IN PROGRESS', 279, y + 15, 70, 12, {
            size: 8, weight: '700', fill: isDone ? P.sage : P.accent, align: 'center', ls: 0.3
          }),
          rect(30, y + 56, 314, 6, P.surface2, { cornerRadius: 3 }),
          rect(30, y + 56, barW, 6, proj.color, { cornerRadius: 3 }),
          text(proj.pct + '%', 30, y + 68, 50, 11, { size: 10, weight: '700', fill: proj.color }),
          text('complete', 84, y + 68, 80, 11, { size: 9, fill: P.muted }),
          text('Due: ' + proj.due, 290, y + 68, 70, 11, { size: 10, fill: P.muted, align: 'right' }),
          rect(30, y + 88, 310, 1, P.border),
          text(proj.time, 30, y + 100, 150, 12, { size: 11, fill: P.muted }),
          rect(252, y + 96, 92, 24, P.accentLt, { cornerRadius: 5 }),
          text('+ Log time', 257, y + 101, 82, 14, { size: 11, weight: '600', fill: P.accent, align: 'center' }),
        ];
      }),
    ].filter(Boolean)
  };
}

// ── Screen 5: Invoices ────────────────────────────────────────────────────────
function screenInvoices() {
  const invoices = [
    { num: '#0044', client: 'TwoRoads Ltd', amount: '£5,000', due: '31 Mar', status: 'DRAFT', color: P.muted, bg: P.surface2 },
    { num: '#0043', client: 'Northfield Co.', amount: '£3,800', due: '25 Mar', status: 'SENT', color: P.amber, bg: P.amberLt },
    { num: '#0042', client: 'Aria Studios', amount: '£2,400', due: '20 Mar', status: 'PAID', color: P.sage, bg: P.sageLt },
    { num: '#0041', client: 'Clearpath Ventures', amount: '£1,200', due: '14 Mar', status: 'PAID', color: P.sage, bg: P.sageLt },
    { num: '#0040', client: 'Modo Collective', amount: '£850', due: '01 Mar', status: 'OVERDUE', color: P.accent, bg: P.accentLt },
  ];

  return {
    id: 'screen-invoices', type: 'frame', x: 1720, y: 0, width: 390, height: 844,
    name: 'Invoices', fill: P.bg,
    children: [
      rect(0, 0, 390, 844, P.bg),
      navBar('Invoices', 'March 2026'),
      tabBar(1),
      // Summary strip
      rect(18, 64, 354, 72, P.surface, { cornerRadius: 10 }),
      text('OUTSTANDING', 30, 74, 130, 11, { size: 9, weight: '600', fill: P.muted, ls: 0.5 }),
      text('£8,800', 30, 88, 130, 26, { size: 22, weight: '800', fill: P.amber }),
      text('2 invoices', 30, 116, 130, 11, { size: 10, fill: P.muted }),
      rect(183, 76, 1, 50, P.border),
      text('PAID THIS MONTH', 196, 74, 150, 11, { size: 9, weight: '600', fill: P.muted, ls: 0.5 }),
      text('£9,600', 196, 88, 150, 26, { size: 22, weight: '800', fill: P.sage }),
      text('3 invoices', 196, 116, 150, 11, { size: 10, fill: P.muted }),
      sectionLabel('ALL INVOICES', 18, 148),
      ...invoices.flatMap((inv, i) => {
        const y = 166 + i * 96;
        return [
          rect(18, y, 354, 82, P.surface, { cornerRadius: 10 }),
          rect(18, y, 3, 82, inv.color),
          text(inv.num, 30, y + 10, 80, 14, { size: 12, weight: '700', fill: P.text }),
          text(inv.client, 30, y + 28, 200, 13, { size: 12, fill: P.textMid }),
          text(inv.amount, 286, y + 10, 80, 20, { size: 18, weight: '800', fill: P.text, align: 'right' }),
          rect(30, y + 52, 60, 18, inv.bg, { cornerRadius: 4 }),
          text(inv.status, 33, y + 55, 54, 12, { size: 9, weight: '700', fill: inv.color, align: 'center', ls: 0.3 }),
          text('Due ' + inv.due, 100, y + 55, 130, 11, { size: 10, fill: P.muted }),
          inv.status === 'DRAFT' ? text('Finalize →', 296, y + 55, 68, 11, { size: 10, weight: '600', fill: P.accent, align: 'right' }) : null,
          inv.status === 'SENT' ? text('Send reminder →', 248, y + 55, 116, 11, { size: 10, weight: '600', fill: P.amber, align: 'right' }) : null,
          inv.status === 'OVERDUE' ? text('Chase now →', 270, y + 55, 94, 11, { size: 10, weight: '700', fill: P.accent, align: 'right' }) : null,
        ];
      }),
      rect(18, 660, 354, 48, P.accent, { cornerRadius: 10 }),
      text('Create new invoice', 100, 676, 190, 18, { size: 14, weight: '700', fill: '#FFF', align: 'center' }),
    ].filter(Boolean)
  };
}

// ── Screen 6: You ─────────────────────────────────────────────────────────────
function screenYou() {
  const healthItems = [
    { label: 'Revenue growth (3mo)', pct: 78, color: P.sage },
    { label: 'Invoice collection rate', pct: 92, color: P.sage },
    { label: 'Client diversity score', pct: 55, color: P.amber },
    { label: 'Capacity utilisation', pct: 63, color: P.accent },
  ];

  return {
    id: 'screen-you', type: 'frame', x: 2150, y: 0, width: 390, height: 844,
    name: 'You', fill: P.bg,
    children: [
      rect(0, 0, 390, 844, P.bg),
      navBar('You', 'Jordan Kim — March 2026'),
      tabBar(4),
      // Profile hero
      rect(18, 64, 354, 90, P.surface, { cornerRadius: 12 }),
      rect(28, 76, 52, 52, P.accentLt, { cornerRadius: 26 }),
      text('JK', 28, 92, 52, 20, { size: 18, weight: '800', fill: P.accent, align: 'center' }),
      text('Jordan Kim', 92, 78, 200, 18, { size: 16, weight: '700', fill: P.text }),
      text('Freelance Creative Director', 92, 100, 210, 14, { size: 12, fill: P.muted }),
      text('London, UK', 92, 118, 150, 12, { size: 11, fill: P.muted }),
      rect(300, 78, 60, 26, P.accentLt, { cornerRadius: 6 }),
      text('Edit', 306, 84, 48, 14, { size: 12, weight: '600', fill: P.accent, align: 'center' }),
      rect(18, 166, 354, 1, P.border),
      sectionLabel('MARCH REPORT CARD', 18, 178),
      // 2x2 stat grid
      ...[
        { label: 'REVENUE', val: '£18,400', sub: 'Best month ever', color: P.sage, x: 18 },
        { label: 'EXPENSES', val: '£4,210', sub: '23% of revenue', color: P.accent, x: 206 },
      ].flatMap(s => [
        rect(s.x, 196, 168, 76, P.surface, { cornerRadius: 8 }),
        rect(s.x, 196, 3, 76, s.color),
        text(s.label, s.x + 12, 206, 150, 11, { size: 10, weight: '600', fill: P.muted, ls: 0.4 }),
        text(s.val, s.x + 12, 222, 150, 26, { size: 20, weight: '800', fill: P.text }),
        text(s.sub, s.x + 12, 254, 150, 11, { size: 10, fill: P.muted }),
      ]),
      ...[
        { label: 'HOURS LOGGED', val: '88h', sub: '22h avg per week', color: P.amber, x: 18 },
        { label: 'EFFECTIVE RATE', val: '£209/h', sub: 'Up £24 vs Feb', color: P.sage, x: 206 },
      ].flatMap(s => [
        rect(s.x, 284, 168, 76, P.surface, { cornerRadius: 8 }),
        rect(s.x, 284, 3, 76, s.color),
        text(s.label, s.x + 12, 294, 150, 11, { size: 10, weight: '600', fill: P.muted, ls: 0.4 }),
        text(s.val, s.x + 12, 310, 150, 26, { size: 20, weight: '800', fill: P.text }),
        text(s.sub, s.x + 12, 342, 150, 11, { size: 10, fill: P.muted }),
      ]),
      rect(18, 372, 354, 1, P.border),
      sectionLabel('YOUR RATES', 18, 384),
      rect(18, 400, 354, 78, P.surface, { cornerRadius: 10 }),
      text('Day rate', 30, 412, 150, 14, { size: 12, fill: P.textMid }),
      text('£850', 258, 408, 106, 20, { size: 18, weight: '800', fill: P.text, align: 'right' }),
      rect(30, 432, 310, 1, P.border),
      text('Hourly rate', 30, 444, 150, 14, { size: 12, fill: P.textMid }),
      text('£160', 258, 440, 106, 20, { size: 18, weight: '800', fill: P.text, align: 'right' }),
      rect(18, 490, 354, 1, P.border),
      sectionLabel('BUSINESS HEALTH', 18, 502),
      ...healthItems.flatMap((item, i) => {
        const y = 520 + i * 44;
        const barW = Math.round(354 * item.pct / 100);
        return [
          text(item.label, 18, y, 270, 13, { size: 11, fill: P.textMid }),
          text(item.pct + '%', 330, y, 46, 13, { size: 11, weight: '700', fill: item.color, align: 'right' }),
          rect(18, y + 16, 354, 6, P.surface2, { cornerRadius: 3 }),
          rect(18, y + 16, barW, 6, item.color, { cornerRadius: 3 }),
        ];
      }),
      rect(18, 720, 354, 44, P.surface2, { cornerRadius: 10 }),
      text('Settings & billing', 30, 734, 250, 18, { size: 13, weight: '500', fill: P.textMid }),
      text('›', 350, 734, 18, 18, { size: 18, fill: P.border2, align: 'right' }),
    ].filter(Boolean)
  };
}

// ── Assemble ──────────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  fileName: 'sole.pen',
  screens: [
    screenToday(),
    screenMoney(),
    screenClients(),
    screenWork(),
    screenInvoices(),
    screenYou(),
  ],
  metadata: {
    createdAt: new Date().toISOString(),
    author: 'RAM Design Heartbeat',
    theme: 'light',
    palette: { bg: P.bg, surface: P.surface, text: P.text, accent: P.accent, accent2: P.sage, muted: P.muted },
    inspiration: 'Midday.ai (darkmodedesign.com) — one-person company financial OS. Locomotive editorial grid (godly.website).',
  }
};

fs.writeFileSync('sole.pen', JSON.stringify(pen, null, 2));
console.log('✓ sole.pen written —', pen.screens.length, 'screens');
pen.screens.forEach(s => {
  const count = JSON.stringify(s).match(/"id"/g)?.length || 0;
  console.log(' ', s.name, '—', count, 'elements');
});
