// CLARO — Financial clarity for independent minds
// Inspired by: Midday.ai (featured on darkmodedesign.com) — clean "business stack for modern founders"
//              108 Supply (#111111 dark, editorial "Season Sans" typography reversed to light)
//              Lapa Ninja: JetBrains Air, Ape AI — professional tools with editorial confidence
// Trend: "Editorial Light" — warm cream backgrounds, bold display numerics, editorial type scale
//         Fintech SaaS embracing warmth over cold blue — burnt sienna + sage instead of teal/violet
// Theme: LIGHT (previous HAZE was dark)

'use strict';
const fs = require('fs');

const SLUG = 'claro';
const APP_NAME = 'Claro';
const TAGLINE = 'Financial clarity for independent minds';

const p = {
  bg:        '#F8F5F0',   // warm cream — editorial light ground
  surface:   '#FFFFFF',   // pure white card
  surface2:  '#F2EFE9',   // slightly deeper cream
  surface3:  '#EBE6DE',   // warm neutral for dividers/tags
  text:      '#1A1210',   // near-black, warm tinted
  textMuted: 'rgba(26,18,16,0.45)',
  textDim:   'rgba(26,18,16,0.25)',
  accent:    '#C4622D',   // burnt sienna — financial authority, warmth
  accentSoft:'rgba(196,98,45,0.12)',
  accent2:   '#3D6B57',   // sage forest green — revenue positive
  accent2Soft:'rgba(61,107,87,0.12)',
  accent3:   '#B04A6E',   // dusty rose — overdue/warning
  accent3Soft:'rgba(176,74,110,0.10)',
  border:    'rgba(26,18,16,0.08)',
  borderMed: 'rgba(26,18,16,0.14)',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function statusBar(bgColor = p.bg) {
  return [
    { type: 'rect', x: 0, y: 0, w: 390, h: 48, fill: bgColor },
    { type: 'text', x: 20, y: 17, text: '9:41', fontSize: 13, fontWeight: '600', color: p.text },
    { type: 'text', x: 360, y: 17, text: '▪▪▪', fontSize: 9, color: p.textMuted },
  ];
}

function navBar(active) {
  const items = [
    { id: 'overview',  icon: '⬡', label: 'Overview',  x: 39 },
    { id: 'revenue',   icon: '◈', label: 'Revenue',   x: 117 },
    { id: 'clients',   icon: '◉', label: 'Clients',   x: 195 },
    { id: 'invoices',  icon: '≡', label: 'Invoices',  x: 273 },
    { id: 'insights',  icon: '◎', label: 'Insights',  x: 351 },
  ];
  const els = [
    { type: 'rect', x: 0, y: 791, w: 390, h: 1, fill: p.borderMed },
    { type: 'rect', x: 0, y: 792, w: 390, h: 52, fill: p.surface },
  ];
  items.forEach(item => {
    const isActive = item.id === active;
    const color = isActive ? p.accent : p.textMuted;
    if (isActive) {
      els.push({ type: 'rect', x: item.x - 20, y: 791, w: 40, h: 2, rx: 1, fill: p.accent });
    }
    els.push({ type: 'text', x: item.x, y: 817, text: item.icon, fontSize: 15, color, textAnchor: 'middle', fontWeight: isActive ? '700' : '400' });
    els.push({ type: 'text', x: item.x, y: 834, text: item.label, fontSize: 8, color, textAnchor: 'middle', fontWeight: isActive ? '600' : '400' });
  });
  return els;
}

function card(x, y, w, h, rx = 16, fill = p.surface) {
  return [
    { type: 'rect', x, y, w, h, rx, fill },
    { type: 'rect', x, y, w, h, rx, fill: 'none', stroke: p.border, strokeWidth: 1 },
  ];
}

function pill(x, y, text, bgColor, textColor) {
  const tw = text.length * 6.4 + 12;
  return [
    { type: 'rect', x, y, w: tw, h: 18, rx: 9, fill: bgColor },
    { type: 'text', x: x + tw / 2, y: y + 12, text, fontSize: 9, fontWeight: '600', color: textColor, textAnchor: 'middle' },
  ];
}

function divider(y) {
  return [{ type: 'rect', x: 20, y, w: 350, h: 1, fill: p.border }];
}

function sparkbars(x, y, w, h, values, color) {
  const els = [];
  const max = Math.max(...values);
  const bw = Math.floor(w / values.length) - 2;
  values.forEach((v, i) => {
    const bh = Math.max(3, (v / max) * h);
    const bx = x + i * (bw + 2);
    const by = y + h - bh;
    const alpha = 0.3 + (i / (values.length - 1)) * 0.7;
    els.push({ type: 'rect', x: bx, y: by, w: bw, h: bh, rx: 2, fill: color, opacity: alpha });
  });
  return els;
}

// ─── Screen 1: Overview ─────────────────────────────────────────────────────
function screen1() {
  const els = [
    { type: 'rect', x: 0, y: 0, w: 390, h: 844, fill: p.bg },
    ...statusBar(),
    // Header
    { type: 'text', x: 20, y: 76, text: 'Good morning,', fontSize: 13, color: p.textMuted },
    { type: 'text', x: 20, y: 98, text: 'Jordan.', fontSize: 26, fontWeight: '700', color: p.text },
    { type: 'text', x: 342, y: 80, text: '🔔', fontSize: 20, textAnchor: 'middle' },
    { type: 'text', x: 342, y: 100, text: '3', fontSize: 9, fontWeight: '700', color: p.accent, textAnchor: 'middle' },

    // Hero metric card
    ...card(20, 116, 350, 128, 20, p.surface),
    { type: 'text', x: 36, y: 144, text: 'Total Earned · 2025', fontSize: 11, color: p.textMuted },
    { type: 'text', x: 36, y: 178, text: '$84,320', fontSize: 34, fontWeight: '800', color: p.text },
    { type: 'text', x: 36, y: 200, text: '↑ 22% vs 2024', fontSize: 12, fontWeight: '500', color: p.accent2 },
    ...sparkbars(220, 148, 130, 50, [42, 55, 48, 67, 72, 80, 84], p.accent),
    { type: 'text', x: 285, y: 220, text: 'YTD trend', fontSize: 9, color: p.textMuted, textAnchor: 'middle' },
    { type: 'rect', x: 20, y: 230, w: 350, h: 1, fill: p.border },
    { type: 'text', x: 36, y: 244, text: 'This month', fontSize: 10, color: p.textMuted },
    { type: 'text', x: 36, y: 234, text: '', fontSize: 0 },
    { type: 'text', x: 260, y: 244, text: '$7,240 / $9,000 goal', fontSize: 10, color: p.textMuted, textAnchor: 'end' },
    { type: 'rect', x: 36, y: 233, w: 278, h: 0, fill: 'none' },

    // Monthly goal progress
    ...card(20, 116, 350, 128, 20, p.surface),
    { type: 'rect', x: 36, y: 228, w: 318, h: 6, rx: 3, fill: p.surface3 },
    { type: 'rect', x: 36, y: 228, w: 253, h: 6, rx: 3, fill: p.accent2 },

    // Quick stats row
    ...card(20, 258, 110, 72, 14, p.surface),
    { type: 'text', x: 75, y: 286, text: '12', fontSize: 22, fontWeight: '800', color: p.text, textAnchor: 'middle' },
    { type: 'text', x: 75, y: 302, text: 'Active clients', fontSize: 9, color: p.textMuted, textAnchor: 'middle' },
    { type: 'text', x: 75, y: 318, text: '↑ 3 new', fontSize: 9, fontWeight: '600', color: p.accent2, textAnchor: 'middle' },

    ...card(140, 258, 110, 72, 14, p.surface),
    { type: 'text', x: 195, y: 286, text: '$3.1K', fontSize: 22, fontWeight: '800', color: p.text, textAnchor: 'middle' },
    { type: 'text', x: 195, y: 302, text: 'Outstanding', fontSize: 9, color: p.textMuted, textAnchor: 'middle' },
    { type: 'text', x: 195, y: 318, text: '2 invoices', fontSize: 9, fontWeight: '600', color: p.accent3, textAnchor: 'middle' },

    ...card(260, 258, 110, 72, 14, p.surface),
    { type: 'text', x: 315, y: 286, text: '94%', fontSize: 22, fontWeight: '800', color: p.text, textAnchor: 'middle' },
    { type: 'text', x: 315, y: 302, text: 'On-time pay', fontSize: 9, color: p.textMuted, textAnchor: 'middle' },
    { type: 'text', x: 315, y: 318, text: '↑ vs 89%', fontSize: 9, fontWeight: '600', color: p.accent2, textAnchor: 'middle' },

    // Recent activity
    ...card(20, 344, 350, 200, 16, p.surface),
    { type: 'text', x: 36, y: 368, text: 'Recent activity', fontSize: 13, fontWeight: '700', color: p.text },
    { type: 'text', x: 354, y: 368, text: 'See all →', fontSize: 11, color: p.accent, textAnchor: 'end' },
    ...divider(380),

    // Row 1
    { type: 'rect', x: 36, y: 390, w: 34, h: 34, rx: 10, fill: p.accent2Soft },
    { type: 'text', x: 53, y: 411, text: '◈', fontSize: 14, color: p.accent2, textAnchor: 'middle' },
    { type: 'text', x: 82, y: 404, text: 'Acme Corp', fontSize: 13, fontWeight: '600', color: p.text },
    { type: 'text', x: 82, y: 420, text: 'Invoice paid · Mar 27', fontSize: 10, color: p.textMuted },
    { type: 'text', x: 354, y: 404, text: '+$4,200', fontSize: 13, fontWeight: '700', color: p.accent2, textAnchor: 'end' },
    ...divider(434),

    // Row 2
    { type: 'rect', x: 36, y: 444, w: 34, h: 34, rx: 10, fill: p.accentSoft },
    { type: 'text', x: 53, y: 465, text: '⏱', fontSize: 14, color: p.accent, textAnchor: 'middle' },
    { type: 'text', x: 82, y: 458, text: 'Bloom Studio', fontSize: 13, fontWeight: '600', color: p.text },
    { type: 'text', x: 82, y: 474, text: 'Invoice sent · $1,850', fontSize: 10, color: p.textMuted },
    ...pill(280, 451, 'Pending', p.accentSoft, p.accent),
    ...divider(488),

    // Row 3
    { type: 'rect', x: 36, y: 498, w: 34, h: 34, rx: 10, fill: p.accent3Soft },
    { type: 'text', x: 53, y: 519, text: '!', fontSize: 16, fontWeight: '800', color: p.accent3, textAnchor: 'middle' },
    { type: 'text', x: 82, y: 512, text: 'North Labs', fontSize: 13, fontWeight: '600', color: p.text },
    { type: 'text', x: 82, y: 528, text: 'Overdue 14 days · $1,200', fontSize: 10, color: p.textMuted },
    ...pill(272, 505, 'Overdue', p.accent3Soft, p.accent3),

    // CTA
    { type: 'rect', x: 20, y: 558, w: 350, h: 46, rx: 14, fill: p.accent },
    { type: 'text', x: 195, y: 587, text: 'Create invoice  →', fontSize: 14, fontWeight: '700', color: '#FFFFFF', textAnchor: 'middle' },

    // AI insight strip
    ...card(20, 618, 350, 58, 14, p.surface2),
    { type: 'rect', x: 36, y: 632, w: 26, h: 26, rx: 8, fill: p.accentSoft },
    { type: 'text', x: 49, y: 648, text: '◎', fontSize: 13, color: p.accent, textAnchor: 'middle' },
    { type: 'text', x: 72, y: 643, text: 'Claro Insight', fontSize: 11, fontWeight: '700', color: p.text },
    { type: 'text', x: 72, y: 658, text: 'You earn 34% more in Q1 — book now', fontSize: 10, color: p.textMuted },

    ...navBar('overview'),
  ];
  return els;
}

// ─── Screen 2: Revenue ───────────────────────────────────────────────────────
function screen2() {
  const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];
  const vals = [5.8,6.2,7.9,6.4,7.1,8.3,7.6,8.9,9.2,8.1,7.4,7.2];
  const maxV = 10;
  const chartH = 90, chartY = 190, chartX = 28;
  const bw = 23;

  const barEls = vals.map((v, i) => {
    const bh = (v / maxV) * chartH;
    const by = chartY + chartH - bh;
    const isHighlight = i === 8; // Sep highlight
    return [
      { type: 'rect', x: chartX + i * (bw + 4), y: by, w: bw, h: bh, rx: 5,
        fill: isHighlight ? p.accent : p.surface3 },
      { type: 'text', x: chartX + i * (bw + 4) + bw/2, y: chartY + chartH + 12,
        text: months[i], fontSize: 8, color: i === 8 ? p.accent : p.textMuted, textAnchor: 'middle' },
    ];
  }).flat();

  return [
    { type: 'rect', x: 0, y: 0, w: 390, h: 844, fill: p.bg },
    ...statusBar(),

    // Header
    { type: 'text', x: 20, y: 76, text: 'Revenue', fontSize: 26, fontWeight: '800', color: p.text },
    { type: 'text', x: 20, y: 98, text: 'Full picture of what you earn', fontSize: 13, color: p.textMuted },

    // Filter tabs
    ...['2025','Q1','Q2','Q3','Q4'].map((t, i) => {
      const tx = 20 + i * 66;
      const isA = i === 0;
      return [
        { type: 'rect', x: tx, y: 112, w: 60, h: 22, rx: 11, fill: isA ? p.accent : p.surface3 },
        { type: 'text', x: tx + 30, y: 126, text: t, fontSize: 10, fontWeight: isA ? '700':'400',
          color: isA ? '#FFF' : p.textMuted, textAnchor: 'middle' },
      ];
    }).flat(),

    // Chart card
    ...card(14, 142, 362, 160, 18, p.surface),
    { type: 'text', x: 28, y: 166, text: 'Monthly earnings', fontSize: 11, fontWeight: '600', color: p.textMuted },
    { type: 'text', x: 333, y: 166, text: '$84,320 total', fontSize: 11, fontWeight: '600', color: p.accent2, textAnchor: 'end' },
    ...barEls,

    // Peak callout
    { type: 'rect', x: 218, y: 177, w: 72, h: 22, rx: 8, fill: p.accent },
    { type: 'text', x: 254, y: 191, text: '▲ Peak Sep', fontSize: 9, fontWeight: '700', color: '#FFF', textAnchor: 'middle' },

    // Revenue breakdown
    ...card(14, 316, 362, 178, 18, p.surface),
    { type: 'text', x: 30, y: 342, text: 'Revenue by stream', fontSize: 13, fontWeight: '700', color: p.text },

    ...[
      { label: 'Consulting', pct: 52, val: '$43,846', color: p.accent },
      { label: 'Retainer clients', pct: 28, val: '$23,610', color: p.accent2 },
      { label: 'One-off projects', pct: 13, val: '$10,962', color: '#8B7355' },
      { label: 'Product sales', pct: 7, val: '$5,902',  color: p.accent3 },
    ].map((row, i) => {
      const rowY = 358 + i * 32;
      return [
        { type: 'rect', x: 30, y: rowY + 4, w: 8, h: 8, rx: 2, fill: row.color },
        { type: 'text', x: 46, y: rowY + 12, text: row.label, fontSize: 12, color: p.text },
        { type: 'text', x: 350, y: rowY + 12, text: row.val, fontSize: 12, fontWeight: '600', color: p.text, textAnchor: 'end' },
        { type: 'rect', x: 30, y: rowY + 20, w: 320, h: 5, rx: 2, fill: p.surface3 },
        { type: 'rect', x: 30, y: rowY + 20, w: Math.round(320 * row.pct / 100), h: 5, rx: 2, fill: row.color },
      ];
    }).flat(),

    // Top month stat
    ...card(14, 508, 174, 78, 14, p.surface),
    { type: 'text', x: 30, y: 532, text: 'Best month', fontSize: 11, color: p.textMuted },
    { type: 'text', x: 30, y: 558, text: 'Sep 2025', fontSize: 18, fontWeight: '800', color: p.text },
    { type: 'text', x: 30, y: 576, text: '$9,200', fontSize: 13, color: p.accent2 },

    ...card(202, 508, 174, 78, 14, p.surface),
    { type: 'text', x: 218, y: 532, text: 'Avg monthly', fontSize: 11, color: p.textMuted },
    { type: 'text', x: 218, y: 558, text: '$7,027', fontSize: 18, fontWeight: '800', color: p.text },
    { type: 'text', x: 218, y: 576, text: '↑ vs $5,760 last yr', fontSize: 10, color: p.accent2 },

    ...navBar('revenue'),
  ];
}

// ─── Screen 3: Clients ───────────────────────────────────────────────────────
function screen3() {
  const clients = [
    { name: 'Acme Corp',      initials: 'AC', spent: '$43,200', tag: 'Retainer', color: p.accent2, since: 'Since 2023' },
    { name: 'Bloom Studio',   initials: 'BS', spent: '$18,450', tag: 'Active',   color: p.accent,  since: 'Since 2024' },
    { name: 'North Labs',     initials: 'NL', spent: '$12,800', tag: 'Overdue',  color: p.accent3, since: 'Since 2024' },
    { name: 'Veritas Group',  initials: 'VG', spent: '$9,640',  tag: 'Active',   color: p.accent2, since: 'Since 2025' },
    { name: 'Dune Media',     initials: 'DM', spent: '$6,230',  tag: 'Active',   color: p.accent,  since: 'Since 2025' },
  ];

  const tagColors = {
    Retainer: { bg: p.accent2Soft, text: p.accent2 },
    Active:   { bg: p.accent2Soft, text: p.accent2 },
    Overdue:  { bg: p.accent3Soft, text: p.accent3 },
  };

  const rowEls = clients.map((c, i) => {
    const ry = 180 + i * 60;
    const tc = tagColors[c.tag];
    return [
      { type: 'rect', x: 20, y: ry, w: 350, h: 52, rx: 14, fill: p.surface },
      { type: 'rect', x: 20, y: ry, w: 350, h: 52, rx: 14, fill: 'none', stroke: p.border, strokeWidth: 1 },
      { type: 'rect', x: 34, y: ry + 10, w: 32, h: 32, rx: 10, fill: c.color + '22' },
      { type: 'text', x: 50, y: ry + 30, text: c.initials, fontSize: 10, fontWeight: '800', color: c.color, textAnchor: 'middle' },
      { type: 'text', x: 76, y: ry + 24, text: c.name, fontSize: 13, fontWeight: '600', color: p.text },
      { type: 'text', x: 76, y: ry + 40, text: c.since, fontSize: 10, color: p.textMuted },
      { type: 'text', x: 354, y: ry + 24, text: c.spent, fontSize: 13, fontWeight: '700', color: p.text, textAnchor: 'end' },
      ...pill(288, ry + 34, c.tag, tc.bg, tc.text),
    ];
  }).flat();

  return [
    { type: 'rect', x: 0, y: 0, w: 390, h: 844, fill: p.bg },
    ...statusBar(),

    { type: 'text', x: 20, y: 76, text: 'Clients', fontSize: 26, fontWeight: '800', color: p.text },
    { type: 'text', x: 20, y: 98, text: '12 active · $84,320 lifetime', fontSize: 13, color: p.textMuted },
    { type: 'rect', x: 330, y: 64, w: 40, h: 28, rx: 10, fill: p.accent },
    { type: 'text', x: 350, y: 82, text: '+ Add', fontSize: 10, fontWeight: '700', color: '#FFF', textAnchor: 'middle' },

    // Health pills
    ...card(20, 114, 108, 56, 14, p.surface),
    { type: 'text', x: 74, y: 140, text: '8', fontSize: 20, fontWeight: '800', color: p.accent2, textAnchor: 'middle' },
    { type: 'text', x: 74, y: 158, text: 'On time', fontSize: 9, color: p.textMuted, textAnchor: 'middle' },

    ...card(136, 114, 108, 56, 14, p.surface),
    { type: 'text', x: 190, y: 140, text: '3', fontSize: 20, fontWeight: '800', color: p.accent, textAnchor: 'middle' },
    { type: 'text', x: 190, y: 158, text: 'Invoiced', fontSize: 9, color: p.textMuted, textAnchor: 'middle' },

    ...card(252, 114, 118, 56, 14, p.surface),
    { type: 'text', x: 311, y: 140, text: '1', fontSize: 20, fontWeight: '800', color: p.accent3, textAnchor: 'middle' },
    { type: 'text', x: 311, y: 158, text: 'Overdue', fontSize: 9, color: p.textMuted, textAnchor: 'middle' },

    ...rowEls,

    ...navBar('clients'),
  ];
}

// ─── Screen 4: Invoices ──────────────────────────────────────────────────────
function screen4() {
  const invoices = [
    { num: '#0142', client: 'Bloom Studio',  date: 'Due Apr 10',  amount: '$1,850', status: 'Pending',  statusC: p.accent,  statusBg: p.accentSoft },
    { num: '#0141', client: 'North Labs',    date: 'Due Mar 14',  amount: '$1,200', status: 'Overdue',  statusC: p.accent3, statusBg: p.accent3Soft },
    { num: '#0140', client: 'Acme Corp',     date: 'Paid Mar 27', amount: '$4,200', status: 'Paid',     statusC: p.accent2, statusBg: p.accent2Soft },
    { num: '#0139', client: 'Veritas Group', date: 'Paid Mar 18', amount: '$2,100', status: 'Paid',     statusC: p.accent2, statusBg: p.accent2Soft },
    { num: '#0138', client: 'Dune Media',    date: 'Paid Mar 5',  amount: '$1,640', status: 'Paid',     statusC: p.accent2, statusBg: p.accent2Soft },
  ];

  const rowEls = invoices.map((inv, i) => {
    const ry = 248 + i * 68;
    return [
      ...card(20, ry, 350, 60, 14, p.surface),
      { type: 'text', x: 36, y: ry + 22, text: inv.num, fontSize: 10, fontWeight: '700', color: p.textMuted },
      { type: 'text', x: 36, y: ry + 40, text: inv.client, fontSize: 13, fontWeight: '600', color: p.text },
      { type: 'text', x: 200, y: ry + 22, text: inv.date, fontSize: 10, color: p.textMuted },
      { type: 'text', x: 354, y: ry + 36, text: inv.amount, fontSize: 15, fontWeight: '800', color: p.text, textAnchor: 'end' },
      ...pill(200, ry + 34, inv.status, inv.statusBg, inv.statusC),
    ];
  }).flat();

  return [
    { type: 'rect', x: 0, y: 0, w: 390, h: 844, fill: p.bg },
    ...statusBar(),

    { type: 'text', x: 20, y: 76, text: 'Invoices', fontSize: 26, fontWeight: '800', color: p.text },

    // Summary strip
    ...card(20, 100, 350, 80, 16, p.surface),
    { type: 'text', x: 36, y: 124, text: 'Total outstanding', fontSize: 11, color: p.textMuted },
    { type: 'text', x: 36, y: 150, text: '$3,050', fontSize: 26, fontWeight: '800', color: p.text },
    { type: 'text', x: 354, y: 124, text: '2 invoices', fontSize: 11, color: p.textMuted, textAnchor: 'end' },
    { type: 'text', x: 354, y: 150, text: 'Send reminder →', fontSize: 12, fontWeight: '600', color: p.accent, textAnchor: 'end' },

    // Filter tabs
    ...['All','Pending','Overdue','Paid'].map((t, i) => {
      const tx = 20 + i * 84;
      const isA = i === 0;
      return [
        { type: 'rect', x: tx, y: 194, w: 78, h: 24, rx: 12, fill: isA ? p.accent : p.surface3 },
        { type: 'text', x: tx + 39, y: 210, text: t, fontSize: 10, fontWeight: isA ? '700':'400',
          color: isA ? '#FFF' : p.textMuted, textAnchor: 'middle' },
      ];
    }).flat(),

    ...rowEls,

    // New invoice FAB
    { type: 'rect', x: 20, y: 602, w: 350, h: 48, rx: 14, fill: p.accent },
    { type: 'text', x: 195, y: 631, text: '+ New Invoice', fontSize: 14, fontWeight: '700', color: '#FFF', textAnchor: 'middle' },

    ...navBar('invoices'),
  ];
}

// ─── Screen 5: Insights ──────────────────────────────────────────────────────
function screen5() {
  const insights = [
    {
      icon: '↑',
      title: 'Best earning window',
      body: 'You consistently earn 34% more in Jan–Mar. Consider booking your highest-ticket clients now.',
      color: p.accent2,
    },
    {
      icon: '⚠',
      title: 'Concentration risk',
      body: 'Acme Corp accounts for 51% of revenue. Adding one more retainer would reduce dependence.',
      color: p.accent,
    },
    {
      icon: '◎',
      title: 'Rate opportunity',
      body: 'Your average day rate ($680) is 14% below market for your skill set. Consider raising rates Q2.',
      color: '#8B7355',
    },
  ];

  return [
    { type: 'rect', x: 0, y: 0, w: 390, h: 844, fill: p.bg },
    ...statusBar(),

    { type: 'text', x: 20, y: 76, text: 'Insights', fontSize: 26, fontWeight: '800', color: p.text },
    { type: 'text', x: 20, y: 98, text: 'AI-powered, updated daily', fontSize: 13, color: p.textMuted },

    // Claro score
    ...card(20, 116, 350, 100, 18, p.surface),
    { type: 'text', x: 36, y: 144, text: 'Financial health score', fontSize: 12, color: p.textMuted },
    { type: 'text', x: 36, y: 178, text: '82', fontSize: 40, fontWeight: '900', color: p.accent2 },
    { type: 'text', x: 36, y: 200, text: '/ 100 · Good', fontSize: 14, color: p.textMuted },
    // Score arc (simplified as nested rects to suggest a ring)
    { type: 'rect', x: 264, y: 130, w: 80, h: 80, rx: 40, fill: p.accent2Soft },
    { type: 'rect', x: 274, y: 140, w: 60, h: 60, rx: 30, fill: p.surface },
    { type: 'text', x: 304, y: 178, text: '82', fontSize: 16, fontWeight: '800', color: p.accent2, textAnchor: 'middle' },

    // Trend cards row
    ...card(20, 230, 166, 70, 14, p.surface),
    { type: 'text', x: 36, y: 256, text: 'Runway', fontSize: 11, color: p.textMuted },
    { type: 'text', x: 36, y: 278, text: '4.2 months', fontSize: 16, fontWeight: '700', color: p.text },
    { type: 'text', x: 36, y: 293, text: 'at current burn', fontSize: 9, color: p.textMuted },

    ...card(204, 230, 166, 70, 14, p.surface),
    { type: 'text', x: 220, y: 256, text: 'Proj. Q2 income', fontSize: 11, color: p.textMuted },
    { type: 'text', x: 220, y: 278, text: '$22,800', fontSize: 16, fontWeight: '700', color: p.text },
    { type: 'text', x: 220, y: 293, text: '↑ 8% vs Q1', fontSize: 9, color: p.accent2 },

    // AI insights list
    { type: 'text', x: 20, y: 328, text: 'Claro recommendations', fontSize: 13, fontWeight: '700', color: p.text },
    ...insights.map((ins, i) => {
      const iy = 346 + i * 106;
      return [
        ...card(20, iy, 350, 98, 16, p.surface),
        { type: 'rect', x: 36, y: iy + 14, w: 30, h: 30, rx: 10, fill: ins.color + '22' },
        { type: 'text', x: 51, y: iy + 33, text: ins.icon, fontSize: 14, fontWeight: '800', color: ins.color, textAnchor: 'middle' },
        { type: 'text', x: 76, y: iy + 30, text: ins.title, fontSize: 13, fontWeight: '700', color: p.text },
        { type: 'rect', x: 76, y: iy + 38, w: 278, h: 1, fill: p.border },
        { type: 'text', x: 76, y: iy + 56, text: ins.body.slice(0, 44), fontSize: 11, color: p.textMuted },
        { type: 'text', x: 76, y: iy + 72, text: ins.body.slice(44, 88), fontSize: 11, color: p.textMuted },
      ];
    }).flat(),

    ...navBar('insights'),
  ];
}

// ─── Build .pen file ─────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  meta: {
    name: APP_NAME,
    tagline: TAGLINE,
    slug: SLUG,
    theme: 'light',
    createdAt: new Date().toISOString(),
    author: 'RAM Design Heartbeat',
    inspiration: 'Midday.ai (darkmodedesign.com), 108 Supply (editorial typography), Lapa Ninja SaaS patterns',
  },
  palette: p,
  screens: [
    { id: 'overview',  label: 'Overview',  width: 390, height: 844, elements: screen1() },
    { id: 'revenue',   label: 'Revenue',   width: 390, height: 844, elements: screen2() },
    { id: 'clients',   label: 'Clients',   width: 390, height: 844, elements: screen3() },
    { id: 'invoices',  label: 'Invoices',  width: 390, height: 844, elements: screen4() },
    { id: 'insights',  label: 'Insights',  width: 390, height: 844, elements: screen5() },
  ],
};

fs.writeFileSync('claro.pen', JSON.stringify(pen, null, 2));
console.log('✓ claro.pen written —', pen.screens.length, 'screens');
console.log('  Total elements:', pen.screens.reduce((s, sc) => s + sc.elements.length, 0));
