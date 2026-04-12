'use strict';
/**
 * WEAVE — "Pipeline for the creative solo"
 * A project pipeline tracker for independent creative makers.
 *
 * Trend inspiration:
 *  - minimal.gallery: "Huehaus Studio" + "KOMETA Typefaces" — editorial-meets-craft,
 *    clean white space, confident serif headings, studio-grade UI
 *  - lapa.ninja color palette: vibrant indigo-violet (#688BF9) + warm amber (#ECA600)
 *    punching through minimalist light surfaces
 *  - Midday.ai: "For the new wave of one-person companies" — solo-founder tooling
 *    with real financial clarity and project structure
 *
 * Theme: LIGHT — cool pearl white + electric violet + warm amber
 * Screens: 6 × 390×844
 */

const fs = require('fs');

const P = {
  bg:          '#F4F3F8',
  surface:     '#FFFFFF',
  surface2:    '#EEECF5',
  surface3:    '#E4E2F0',
  border:      '#E0DEEE',
  text:        '#1A1830',
  textDim:     '#6B6890',
  muted:       'rgba(26,24,48,0.36)',
  violet:      '#5C52E8',
  violetLt:    '#7B73F2',
  violetDk:    '#3E36C4',
  violetBg:    '#EDECFB',
  violetBg2:   '#F2F1FC',
  amber:       '#ECA600',
  amberLt:     '#F5BE40',
  amberDk:     '#C48800',
  amberBg:     '#FFF6DC',
  amberBg2:    '#FFFAEE',
  coral:       '#F25C54',
  coralBg:     '#FFF0EF',
  jade:        '#1DB87A',
  jadeBg:      '#E6F9F0',
  jadeDk:      '#0E8A58',
  sky:         '#3BA6F5',
  skyBg:       '#E8F4FE',
  white:       '#FFFFFF',
};

let _id = 0;
const uid = () => `w${++_id}`;

function rect(x, y, w, h, fill, opts = {}) {
  return {
    id: uid(), type: 'rectangle', x, y, width: w, height: h, fill,
    ...(opts.r  ? { cornerRadius: opts.r } : {}),
    ...(opts.op ? { opacity: opts.op }     : {}),
  };
}

function text(content, x, y, w, h, size, weight, fill, align = 'left', opts = {}) {
  return {
    id: uid(), type: 'text', content, x, y, width: w, height: h,
    textGrowth: 'fixed-width-height',
    fontSize: size, fontWeight: String(weight), fill,
    textAlign: align,
    letterSpacing: opts.ls ?? 0,
    fontFamily: opts.ff ?? 'Inter',
    ...(opts.op ? { opacity: opts.op } : {}),
  };
}

function frame(id, x, y, w, h, fill, children, opts = {}) {
  return { id, type: 'frame', x, y, width: w, height: h, fill, clip: false, children,
    ...(opts.r ? { cornerRadius: opts.r } : {}) };
}

function statusBar() {
  return frame(uid(), 0, 0, 390, 44, P.bg, [
    rect(0, 0, 390, 44, P.bg),
    text('9:41', 18, 13, 60, 18, 14, '600', P.text, 'left'),
    text('●●●', 300, 14, 72, 16, 11, '400', '#C0BEDC', 'right', { ls: 2 }),
  ]);
}

function navbar(active) {
  const tabs = [
    { id: 'projects', icon: '⊞', label: 'Work'     },
    { id: 'timeline', icon: '▬', label: 'Timeline' },
    { id: 'clients',  icon: '◎', label: 'Clients'  },
    { id: 'revenue',  icon: '◈', label: 'Revenue'  },
    { id: 'profile',  icon: '◷', label: 'You'      },
  ];
  const slotW = 78;
  const children = [
    rect(0, 0, 390, 72, P.surface),
    rect(0, 0, 390, 1, P.border),
  ];
  tabs.forEach((t, i) => {
    const x = i * slotW;
    const isActive = t.id === active;
    const col = isActive ? P.violet : P.textDim;
    children.push(
      text(t.icon, x, 10, slotW, 20, 16, '400', col, 'center'),
      text(t.label, x, 33, slotW, 14, 10, isActive ? '700' : '400', col, 'center', { ls: 0.2 }),
    );
    if (isActive) children.push(rect(x + slotW / 2 - 16, 1, 32, 2, P.violet, { r: 1 }));
  });
  return frame(uid(), 0, 772, 390, 72, P.surface, children);
}

// ─── Screen 1: Projects Dashboard ───────────────────────────────────────────
function screenProjects() {
  const projects = [
    { name: 'Horizon Rebrand',   client: 'Horizon Labs',  type: 'Brand Identity', due: 'Apr 12', daysLeft: 19, pct: 65, statusLabel: 'On track',  statusCol: P.jade,  statusBg: P.jadeBg,  accentCol: P.violet, accentBg: P.violetBg },
    { name: 'Maeve Site Launch', client: 'Maeve Studio',  type: 'Web Design',     due: 'Mar 30', daysLeft: 6,  pct: 88, statusLabel: 'At risk',   statusCol: P.amber, statusBg: P.amberBg, accentCol: P.amber,  accentBg: P.amberBg  },
    { name: 'Cartex Pitch Deck', client: 'Cartex Inc.',   type: 'Presentation',   due: 'Apr 5',  daysLeft: 12, pct: 30, statusLabel: 'New',       statusCol: P.sky,   statusBg: P.skyBg,   accentCol: P.sky,    accentBg: P.skyBg    },
  ];

  const cards = [];
  let y = 164;
  projects.forEach((p) => {
    cards.push(
      rect(20, y, 350, 112, P.surface, { r: 14 }),
      rect(20, y, 3, 112, p.accentCol, { r: 2 }),
      text(p.name, 36, y + 14, 210, 17, 14, '700', P.text, 'left'),
      rect(286, y + 12, 76, 20, p.statusBg, { r: 10 }),
      text(p.statusLabel, 286, y + 15, 76, 14, 10, '600', p.statusCol, 'center'),
      text(p.client, 36, y + 34, 140, 13, 11, '500', P.textDim, 'left'),
      text('· ' + p.type, 170, y + 34, 120, 13, 11, '400', P.muted, 'left'),
      rect(36, y + 58, 252, 6, P.surface2, { r: 3 }),
      rect(36, y + 58, Math.round(252 * p.pct / 100), 6, p.accentCol, { r: 3 }),
      text(p.pct + '%', 294, y + 53, 46, 14, 11, '700', p.accentCol, 'right'),
      text('Due ' + p.due, 36, y + 78, 100, 13, 10, '500', P.textDim, 'left'),
      rect(140, y + 80, 1, 10, P.border),
      text(p.daysLeft + 'd left', 148, y + 78, 60, 13, 10, '400',
           p.daysLeft < 10 ? P.coral : P.textDim, 'left'),
    );
    y += 124;
  });

  cards.push(
    rect(20, y, 350, 44, P.violetBg2, { r: 12 }),
    text('+ New project', 20, y + 13, 350, 18, 13, '600', P.violet, 'center'),
  );

  return {
    id: 'screen-projects', type: 'frame', x: 0, y: 0, width: 390, height: 844,
    name: 'Projects', fill: P.bg,
    children: [
      rect(0, 0, 390, 844, P.bg),
      statusBar(),
      frame(uid(), 0, 44, 390, 76, P.bg, [
        rect(0, 0, 390, 76, P.bg),
        text('WEAVE', 20, 12, 150, 24, 18, '800', P.violet, 'left', { ls: 4, ff: 'Georgia' }),
        text('3 active projects', 20, 38, 200, 14, 12, '400', P.textDim, 'left'),
        rect(334, 14, 36, 36, P.surface, { r: 10 }),
        text('+', 334, 16, 36, 32, 20, '300', P.violet, 'center'),
      ]),
      frame(uid(), 20, 120, 350, 36, 'transparent', [
        rect(0, 0, 108, 36, P.violetBg, { r: 8 }),
        text('◈ $12,400', 0, 10, 108, 16, 11, '700', P.violet, 'center'),
        text('pending', 0, 26, 108, 12, 9, '400', P.violetLt, 'center'),
        rect(116, 0, 108, 36, P.jadeBg, { r: 8 }),
        text('✓  2 done', 116, 10, 108, 16, 11, '700', P.jade, 'center'),
        text('this month', 116, 26, 108, 12, 9, '400', P.jadeDk, 'center'),
        rect(232, 0, 118, 36, P.amberBg, { r: 8 }),
        text('⊙ 1 at risk', 232, 10, 118, 16, 11, '700', P.amber, 'center'),
        text('needs review', 232, 26, 118, 12, 9, '400', P.amberDk, 'center'),
      ]),
      ...cards,
      navbar('projects'),
    ],
  };
}

// ─── Screen 2: Timeline ──────────────────────────────────────────────────────
function screenTimeline() {
  const months = ['Mar', 'Apr', 'May'];
  const colW = 116;
  const headerChildren = [
    rect(0, 0, 390, 30, P.surface2),
    rect(0, 29, 390, 1, P.border),
    text('Project', 8, 8, 90, 14, 10, '600', P.textDim, 'left', { ls: 0.5 }),
  ];
  months.forEach((m, i) => {
    const x = 98 + i * colW;
    headerChildren.push(
      text(m, x, 8, colW, 14, 10, '600', P.textDim, 'center', { ls: 0.5 }),
      rect(x + colW - 1, 0, 1, 30, P.border),
    );
  });

  const rows = [
    { name: 'Horizon Rebrand',    sub: 'Brand',    start: 0,   end: 200, col: P.violet },
    { name: 'Maeve Site Launch',  sub: 'Web',      start: 0,   end: 72,  col: P.amber  },
    { name: 'Cartex Deck',        sub: 'Slides',   start: 30,  end: 150, col: P.sky    },
    { name: 'Rosewood Copy',      sub: 'Writing',  start: 80,  end: 245, col: P.jade   },
    { name: 'Self Portfolio',     sub: 'Personal', start: 130, end: 270, col: '#B88CE8' },
  ];

  const rowH = 52;
  const todayX = 98 + 23;
  const ganttItems = [];

  rows.forEach((r, i) => {
    const y = i * rowH;
    const barX = 98 + r.start * (292 / 270);
    const barW = Math.max(18, (r.end - r.start) * (292 / 270));
    ganttItems.push(
      rect(0, y, 390, rowH, i % 2 === 0 ? P.surface : P.bg),
      rect(0, y + rowH - 1, 390, 1, P.border),
      text(r.name, 6, y + 8, 92, 14, 10, '600', P.text, 'left'),
      text(r.sub, 6, y + 24, 92, 12, 9, '400', P.textDim, 'left'),
      rect(barX, y + 12, barW, 20, r.col + '28', { r: 6 }),
      rect(barX, y + 16, 18, 12, r.col, { r: 3 }),
      rect(barX + barW - 8, y + 16, 8, 12, r.col, { r: 3 }),
    );
  });

  ganttItems.push(
    rect(todayX, 0, 2, rows.length * rowH, P.coral + 'BB'),
    rect(todayX - 20, -12, 42, 18, P.coral, { r: 4 }),
    text('today', todayX - 20, -9, 42, 14, 9, '700', P.white, 'center'),
  );

  return {
    id: 'screen-timeline', type: 'frame', x: 0, y: 0, width: 390, height: 844,
    name: 'Timeline', fill: P.bg,
    children: [
      rect(0, 0, 390, 844, P.bg),
      statusBar(),
      frame(uid(), 0, 44, 390, 58, P.bg, [
        rect(0, 0, 390, 58, P.bg),
        text('Timeline', 20, 10, 200, 28, 22, '800', P.text, 'left', { ff: 'Georgia' }),
        text('Q1 · Q2 2026', 20, 40, 200, 14, 12, '400', P.textDim, 'left'),
        rect(316, 16, 58, 26, P.violetBg, { r: 13 }),
        text('Month ▾', 316, 21, 58, 16, 10, '600', P.violet, 'center'),
      ]),
      frame(uid(), 0, 102, 390, 30, P.surface2, headerChildren),
      frame(uid(), 0, 132, 390, rows.length * rowH, P.surface, ganttItems),
      frame(uid(), 20, 132 + rows.length * rowH + 14, 350, 50, P.surface, [
        rect(0, 0, 350, 50, P.surface, { r: 10 }),
        rect(0, 0, 350, 1, P.border),
        text('KEY', 16, 17, 40, 14, 9, '700', P.textDim, 'left', { ls: 1 }),
        rect(60, 20, 10, 10, P.violet, { r: 3 }),
        text('Brand', 74, 17, 46, 14, 9, '500', P.textDim, 'left'),
        rect(122, 20, 10, 10, P.amber, { r: 3 }),
        text('Web', 136, 17, 36, 14, 9, '500', P.textDim, 'left'),
        rect(176, 20, 10, 10, P.sky, { r: 3 }),
        text('Slides', 190, 17, 48, 14, 9, '500', P.textDim, 'left'),
        rect(242, 20, 10, 10, P.jade, { r: 3 }),
        text('Copy', 256, 17, 40, 14, 9, '500', P.textDim, 'left'),
        rect(298, 20, 10, 10, '#B88CE8', { r: 3 }),
        text('Own', 312, 17, 36, 14, 9, '500', P.textDim, 'left'),
      ]),
      navbar('timeline'),
    ],
  };
}

// ─── Screen 3: Client Profile ────────────────────────────────────────────────
function screenClient() {
  const invoices = [
    { id: '#1024', desc: 'Brand Phase 1',     amount: '$4,200', date: 'Mar 1',  statusLabel: 'Paid',    col: P.jade,   bg: P.jadeBg  },
    { id: '#1031', desc: 'Brand Phase 2 50%', amount: '$3,100', date: 'Mar 20', statusLabel: 'Pending', col: P.amber,  bg: P.amberBg },
    { id: '#1035', desc: 'Brand Phase 3',     amount: '$3,100', date: 'Apr 12', statusLabel: 'Draft',   col: P.textDim, bg: P.surface2 },
  ];

  const invRows = [];
  let y = 450;
  invoices.forEach((inv) => {
    invRows.push(
      rect(20, y, 350, 52, P.surface, { r: 10 }),
      rect(20, y, 3, 52, inv.col, { r: 2 }),
      text(inv.id, 32, y + 8, 60, 13, 10, '700', P.textDim, 'left'),
      text(inv.desc, 32, y + 24, 180, 13, 11, '500', P.text, 'left'),
      text(inv.amount, 232, y + 8, 90, 14, 13, '700', P.text, 'right'),
      rect(285, y + 28, 70, 16, inv.bg, { r: 8 }),
      text(inv.statusLabel, 285, y + 31, 70, 12, 10, '600', inv.col, 'center'),
      text(inv.date, 232, y + 28, 50, 13, 10, '400', P.textDim, 'right'),
    );
    y += 62;
  });

  return {
    id: 'screen-client', type: 'frame', x: 0, y: 0, width: 390, height: 844,
    name: 'Client', fill: P.bg,
    children: [
      rect(0, 0, 390, 844, P.bg),
      statusBar(),
      frame(uid(), 0, 44, 390, 52, P.bg, [
        rect(0, 0, 390, 52, P.bg),
        text('← Clients', 16, 14, 90, 18, 13, '500', P.textDim, 'left'),
        text('Client Profile', 0, 10, 390, 18, 14, '600', P.text, 'center'),
        rect(348, 14, 26, 26, P.surface, { r: 8 }),
        text('…', 348, 16, 26, 22, 16, '400', P.textDim, 'center'),
      ]),
      frame(uid(), 20, 106, 350, 116, P.surface, [
        rect(0, 0, 350, 116, P.surface, { r: 16 }),
        rect(0, 0, 350, 4, P.violet, { r: 2 }),
        rect(20, 22, 52, 52, P.violetBg, { r: 26 }),
        text('HL', 20, 36, 52, 24, 14, '800', P.violet, 'center'),
        text('Horizon Labs', 84, 22, 200, 18, 16, '700', P.text, 'left'),
        text('horizon-labs.co · San Francisco', 84, 42, 230, 14, 11, '400', P.textDim, 'left'),
        text('Client since Jan 2025', 84, 58, 180, 14, 11, '400', P.muted, 'left'),
        rect(20, 86, 100, 22, P.violetBg, { r: 6 }),
        text('1 active project', 20, 90, 100, 14, 9, '600', P.violet, 'center'),
        rect(128, 86, 84, 22, P.jadeBg, { r: 6 }),
        text('$10,400 total', 128, 90, 84, 14, 9, '600', P.jade, 'center'),
        rect(220, 86, 72, 22, P.amberBg, { r: 6 }),
        text('⊙ 1 pending', 220, 90, 72, 14, 9, '600', P.amber, 'center'),
      ]),
      text('ACTIVE PROJECT', 20, 238, 200, 14, 9, '700', P.textDim, 'left', { ls: 1.5 }),
      frame(uid(), 20, 258, 350, 80, P.surface, [
        rect(0, 0, 350, 80, P.surface, { r: 12 }),
        rect(0, 0, 3, 80, P.violet, { r: 2 }),
        text('Horizon Rebrand', 20, 12, 220, 16, 14, '700', P.text, 'left'),
        text('Brand Identity · Due Apr 12', 20, 30, 240, 13, 11, '400', P.textDim, 'left'),
        rect(20, 54, 252, 6, P.surface2, { r: 3 }),
        rect(20, 54, 164, 6, P.violet, { r: 3 }),
        text('65%', 278, 50, 58, 14, 11, '700', P.violet, 'right'),
        rect(278, 12, 56, 22, P.jadeBg, { r: 8 }),
        text('On track', 278, 16, 56, 14, 9, '600', P.jade, 'center'),
      ]),
      frame(uid(), 20, 352, 350, 64, P.amberBg2, [
        rect(0, 0, 350, 64, P.amberBg2, { r: 10 }),
        rect(0, 0, 4, 64, P.amber, { r: 2 }),
        text('⚑ Client note', 18, 10, 200, 14, 10, '700', P.amber, 'left'),
        text('"Feedback via Loom videos preferred.', 18, 26, 300, 14, 11, '400', P.text, 'left', { ff: 'Georgia' }),
        text('Revision window: Mondays only."', 18, 42, 300, 14, 11, '400', P.textDim, 'left', { ff: 'Georgia' }),
      ]),
      text('INVOICES', 20, 428, 120, 14, 9, '700', P.textDim, 'left', { ls: 1.5 }),
      text('+ Draft new', 310, 424, 80, 18, 11, '600', P.violet, 'right'),
      ...invRows,
      navbar('clients'),
    ],
  };
}

// ─── Screen 4: Revenue Overview ─────────────────────────────────────────────
function screenRevenue() {
  const months = ['J', 'F', 'M', 'A', 'M', 'J'];
  const values = [3200, 4800, 7400, 5100, 0, 0];
  const maxV = 8000;
  const chartH = 100;
  const barW = 34;
  const gap = 18;
  const chartX = 20 + (350 - (months.length * (barW + gap) - gap)) / 2;

  const bars = [];
  months.forEach((m, i) => {
    const x = chartX + i * (barW + gap);
    const barH = values[i] ? Math.round(chartH * values[i] / maxV) : 6;
    const isCurrent = i === 2;
    const isEmpty = values[i] === 0;
    const col = isEmpty ? P.surface2 : isCurrent ? P.violet : P.violetBg;
    bars.push(rect(x, 266 + chartH - barH, barW, barH, col, { r: 4 }));
    bars.push(text(m, x, 376, barW, 14, 10, '500', isEmpty ? P.muted : P.textDim, 'center'));
    if (values[i]) bars.push(
      text('$' + (values[i] / 1000).toFixed(1) + 'k', x - 4, 266 + chartH - barH - 18,
           barW + 8, 14, 9, '700', isCurrent ? P.violet : P.textDim, 'center'),
    );
  });

  const pending = [
    { client: 'Horizon Labs',  amount: '$3,100', due: 'Mar 30', col: P.amber  },
    { client: 'Maeve Studio',  amount: '$2,800', due: 'Apr 5',  col: P.coral  },
    { client: 'Cartex Inc.',   amount: '$1,600', due: 'Apr 12', col: P.violet },
  ];
  const pendingRows = [];
  let y = 546;
  pending.forEach((p) => {
    pendingRows.push(
      rect(20, y, 350, 48, P.surface, { r: 10 }),
      rect(20, y, 3, 48, p.col, { r: 2 }),
      text(p.client, 32, y + 8, 200, 14, 13, '600', P.text, 'left'),
      text('Due ' + p.due, 32, y + 26, 140, 12, 10, '400', P.textDim, 'left'),
      text(p.amount, 290, y + 14, 70, 18, 13, '700', P.text, 'right'),
    );
    y += 58;
  });

  return {
    id: 'screen-revenue', type: 'frame', x: 0, y: 0, width: 390, height: 844,
    name: 'Revenue', fill: P.bg,
    children: [
      rect(0, 0, 390, 844, P.bg),
      statusBar(),
      frame(uid(), 0, 44, 390, 60, P.bg, [
        rect(0, 0, 390, 60, P.bg),
        text('Revenue', 20, 10, 200, 28, 22, '800', P.text, 'left', { ff: 'Georgia' }),
        text('2026 · YTD', 20, 40, 180, 14, 12, '400', P.textDim, 'left'),
        rect(306, 16, 64, 26, P.violetBg, { r: 13 }),
        text('Year ▾', 306, 21, 64, 16, 10, '600', P.violet, 'center'),
      ]),
      frame(uid(), 20, 114, 168, 84, P.violet, [
        rect(0, 0, 168, 84, P.violet, { r: 14 }),
        text('EARNED', 16, 12, 140, 12, 9, '700', 'rgba(255,255,255,0.6)', 'left', { ls: 1.5 }),
        text('$15,400', 16, 28, 140, 36, 28, '800', P.white, 'left', { ls: -1 }),
        text('YTD Jan–Mar', 16, 68, 140, 14, 10, '500', 'rgba(255,255,255,0.55)', 'left'),
      ]),
      frame(uid(), 202, 114, 168, 84, P.surface, [
        rect(0, 0, 168, 84, P.surface, { r: 14 }),
        text('PENDING', 16, 12, 140, 12, 9, '700', P.textDim, 'left', { ls: 1.5 }),
        text('$7,500', 16, 28, 140, 36, 28, '800', P.amber, 'left', { ls: -1 }),
        text('3 open invoices', 16, 68, 140, 14, 10, '400', P.textDim, 'left'),
      ]),
      text('MONTHLY', 20, 212, 140, 14, 9, '700', P.textDim, 'left', { ls: 1.5 }),
      text('Mar record ✦', 296, 212, 94, 14, 10, '600', P.violet, 'right'),
      frame(uid(), 20, 230, 350, 160, P.surface, [
        rect(0, 0, 350, 160, P.surface, { r: 14 }),
        ...bars,
      ]),
      text('PENDING INVOICES', 20, 518, 200, 14, 9, '700', P.textDim, 'left', { ls: 1.5 }),
      ...pendingRows,
      navbar('revenue'),
    ],
  };
}

// ─── Screen 5: Project Detail ───────────────────────────────────────────────
function screenDetail() {
  const tasks = [
    { label: 'Discovery workshop',    done: true,  active: false },
    { label: 'Moodboard & direction', done: true,  active: false },
    { label: 'Logo concepts (×3)',    done: true,  active: false },
    { label: 'Client review round 1', done: false, active: true  },
    { label: 'Refined direction',     done: false, active: false },
    { label: 'Full brand system',     done: false, active: false },
    { label: 'Handoff & assets',      done: false, active: false },
  ];

  const taskRows = [];
  let y = 430;
  tasks.forEach((t) => {
    taskRows.push(
      rect(20, y, 350, 38, t.active ? P.amberBg2 : P.surface, { r: 8 }),
    );
    if (t.active) taskRows.push(rect(20, y, 3, 38, P.amber, { r: 2 }));
    taskRows.push(
      rect(36, y + 12, 14, 14,
           t.done ? P.jade : t.active ? P.amber : P.surface2, { r: 7 }),
    );
    if (t.done) taskRows.push(text('✓', 36, y + 13, 14, 12, 10, '700', P.white, 'center'));
    taskRows.push(
      text(t.label, 60, y + 11, 240, 16, 12,
           t.done ? '400' : t.active ? '600' : '400',
           t.done ? P.textDim : P.text, 'left'),
    );
    if (t.active) taskRows.push(text('→ In review', 296, y + 12, 74, 14, 9, '600', P.amber, 'right'));
    taskRows.push(rect(20, y + 37, 350, 1, P.border));
    y += 38;
  });

  return {
    id: 'screen-detail', type: 'frame', x: 0, y: 0, width: 390, height: 844,
    name: 'Detail', fill: P.bg,
    children: [
      rect(0, 0, 390, 844, P.bg),
      statusBar(),
      frame(uid(), 0, 44, 390, 52, P.bg, [
        rect(0, 0, 390, 52, P.bg),
        text('← Work', 16, 14, 80, 18, 13, '500', P.textDim, 'left'),
        rect(336, 16, 38, 22, P.violetBg, { r: 8 }),
        text('Edit', 336, 19, 38, 16, 11, '600', P.violet, 'center'),
      ]),
      frame(uid(), 20, 106, 350, 104, P.violet, [
        rect(0, 0, 350, 104, P.violet, { r: 16 }),
        rect(0, 60, 350, 44, 'rgba(0,0,0,0.10)', { r: 16 }),
        text('Horizon Rebrand', 20, 14, 290, 24, 18, '800', P.white, 'left'),
        text('Brand Identity', 20, 40, 200, 14, 12, '500', 'rgba(255,255,255,0.7)', 'left'),
        rect(236, 16, 98, 22, 'rgba(255,255,255,0.18)', { r: 8 }),
        text('On track ✓', 236, 19, 98, 16, 10, '600', P.white, 'center'),
        text('65% complete', 20, 72, 140, 16, 11, '500', 'rgba(255,255,255,0.8)', 'left'),
        text('Apr 12, 2026', 200, 72, 130, 16, 11, '400', 'rgba(255,255,255,0.6)', 'right'),
      ]),
      frame(uid(), 20, 222, 350, 44, P.surface, [
        rect(0, 0, 350, 44, P.surface, { r: 10 }),
        text('$7,400', 0, 12, 117, 14, 13, '700', P.violet, 'center'),
        text('Budget', 0, 28, 117, 12, 9, '400', P.textDim, 'center'),
        rect(117, 8, 1, 28, P.border),
        text('Horizon Labs', 117, 12, 116, 14, 13, '600', P.text, 'center'),
        text('Client', 117, 28, 116, 12, 9, '400', P.textDim, 'center'),
        rect(233, 8, 1, 28, P.border),
        text('19 days', 233, 12, 117, 14, 13, '700', P.jade, 'center'),
        text('Until due', 233, 28, 117, 12, 9, '400', P.textDim, 'center'),
      ]),
      text('FILES', 20, 282, 80, 14, 9, '700', P.textDim, 'left', { ls: 1.5 }),
      frame(uid(), 20, 302, 350, 76, 'transparent', [
        rect(0, 0, 76, 76, P.violetBg, { r: 10 }),
        text('▣', 0, 20, 76, 30, 20, '400', P.violet, 'center'),
        text('Moodboard', 0, 54, 76, 14, 9, '500', P.textDim, 'center'),
        rect(84, 0, 76, 76, P.violetBg, { r: 10 }),
        text('◫', 84, 20, 76, 30, 20, '400', P.violet, 'center'),
        text('Logo v3.fig', 84, 54, 76, 14, 9, '500', P.textDim, 'center'),
        rect(168, 0, 76, 76, P.amberBg, { r: 10 }),
        text('◳', 168, 20, 76, 30, 20, '400', P.amber, 'center'),
        text('Feedback.mp4', 168, 54, 76, 14, 9, '500', P.textDim, 'center'),
        rect(252, 0, 76, 76, P.surface2, { r: 10 }),
        text('+', 252, 18, 76, 30, 24, '300', P.textDim, 'center'),
        text('Add file', 252, 54, 76, 14, 9, '500', P.textDim, 'center'),
      ]),
      text('TASKS · 3 of 7 done', 20, 396, 200, 14, 9, '700', P.textDim, 'left', { ls: 1.5 }),
      text('+ Add', 328, 396, 50, 14, 11, '600', P.violet, 'right'),
      ...taskRows,
      navbar('projects'),
    ],
  };
}

// ─── Screen 6: Profile ───────────────────────────────────────────────────────
function screenProfile() {
  const stats = [
    { val: '$22,900', label: 'YTD earned',  col: P.violet },
    { val: '8',       label: 'Projects',    col: P.jade   },
    { val: '5',       label: 'Clients',     col: P.amber  },
    { val: '4.9★',   label: 'Avg rating',  col: P.sky    },
  ];

  const statCells = [];
  stats.forEach((s, i) => {
    const x = (i % 2) * 179;
    const y = Math.floor(i / 2) * 70;
    statCells.push(
      rect(x, y, 170, 62, P.surface, { r: 10 }),
      text(s.val, x + 16, y + 10, 140, 24, 18, '800', s.col, 'left', { ls: -0.5 }),
      text(s.label, x + 16, y + 36, 140, 14, 10, '400', P.textDim, 'left'),
    );
  });

  const menuItems = [
    { icon: '◈', label: 'Billing & Invoicing',  badge: null     },
    { icon: '◎', label: 'Client Permissions',    badge: null     },
    { icon: '⊞', label: 'Integrations',          badge: '3 apps' },
    { icon: '◷', label: 'Working Hours',         badge: null     },
    { icon: '⊙', label: 'Notifications',         badge: 'On'     },
  ];

  const menuRows = [];
  let y = 504;
  menuItems.forEach((item) => {
    menuRows.push(
      rect(20, y, 350, 46, P.surface, { r: 10 }),
      rect(32, y + 14, 18, 18, P.violetBg, { r: 9 }),
      text(item.icon, 32, y + 14, 18, 18, 11, '400', P.violet, 'center'),
      text(item.label, 60, y + 14, 210, 18, 13, '500', P.text, 'left'),
    );
    if (item.badge) {
      menuRows.push(
        rect(262, y + 14, 72, 18, P.violetBg, { r: 9 }),
        text(item.badge, 262, y + 17, 72, 12, 9, '600', P.violet, 'center'),
      );
    }
    menuRows.push(
      text('›', 344, y + 13, 16, 20, 18, '300', P.textDim, 'right'),
      rect(20, y + 45, 350, 1, P.border),
    );
    y += 46;
  });

  return {
    id: 'screen-profile', type: 'frame', x: 0, y: 0, width: 390, height: 844,
    name: 'Profile', fill: P.bg,
    children: [
      rect(0, 0, 390, 844, P.bg),
      statusBar(),
      frame(uid(), 0, 44, 390, 120, P.bg, [
        rect(0, 0, 390, 120, P.bg),
        rect(20, 18, 60, 60, P.violetBg, { r: 30 }),
        text('JA', 20, 35, 60, 26, 15, '800', P.violet, 'center'),
        rect(68, 64, 12, 12, P.jade, { r: 6 }),
        text('Jamie Alves', 96, 20, 240, 22, 18, '700', P.text, 'left'),
        text('Independent Creative Director', 96, 44, 240, 14, 12, '400', P.textDim, 'left'),
        text('San Francisco · Est. 2019', 96, 62, 240, 14, 11, '400', P.muted, 'left'),
        rect(96, 84, 102, 22, P.violetBg, { r: 6 }),
        text('Pro Plan ✦', 96, 88, 102, 14, 10, '600', P.violet, 'center'),
      ]),
      frame(uid(), 20, 174, 350, 140, 'transparent', statCells),
      text('AVAILABILITY', 20, 330, 200, 14, 9, '700', P.textDim, 'left', { ls: 1.5 }),
      frame(uid(), 20, 350, 350, 56, P.surface, [
        rect(0, 0, 350, 56, P.surface, { r: 12 }),
        rect(0, 0, 4, 56, P.jade, { r: 2 }),
        text('Open to new work', 20, 12, 200, 16, 13, '600', P.text, 'left'),
        text('Next opening: April 15', 20, 30, 200, 14, 11, '400', P.textDim, 'left'),
        rect(256, 18, 80, 20, P.jadeBg, { r: 6 }),
        text('Taking work', 256, 21, 80, 14, 9, '700', P.jade, 'center'),
      ]),
      text('SETTINGS', 20, 420, 100, 14, 9, '700', P.textDim, 'left', { ls: 1.5 }),
      ...menuRows,
      navbar('profile'),
    ],
  };
}

// ─── Assemble & write ────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  fileName: 'weave.pen',
  screens: [
    screenProjects(),
    screenTimeline(),
    screenClient(),
    screenRevenue(),
    screenDetail(),
    screenProfile(),
  ],
  metadata: {
    appName: 'WEAVE',
    tagline: 'Pipeline for the creative solo',
    created: new Date().toISOString(),
    theme: 'light',
    palette: { bg: P.bg, surface: P.surface, text: P.text, accent: P.violet, accent2: P.amber },
  },
};

fs.writeFileSync('weave.pen', JSON.stringify(pen, null, 2));
console.log('weave.pen written —', pen.screens.length, 'screens,',
  JSON.stringify(pen).length.toLocaleString(), 'bytes');
