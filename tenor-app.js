'use strict';
/**
 * TENOR — Deal intelligence for independent consultants
 *
 * Inspired by:
 * 1. Interfere.ai (lapa.ninja) — numbered workflow steps (01/02/03) woven
 *    directly into hero prose as structural UI; changelog/updates as proof of momentum
 * 2. The Footprint Firm (siteinspire) — ultra-clean advisory/investment platform,
 *    ADVISORY / INVESTMENT sectioning, warm white with precise minimal nav
 * 3. Cardless.com (land-book) — "Build credit in your world" — warm cream/white
 *    fintech, video in hero, editorial layout with numbered sections
 *
 * Theme: LIGHT — warm parchment (#F4F1ED), deep navy accent
 * Challenge: numbered pipeline stages as primary navigation metaphor
 */

const fs = require('fs');

// ─── TOKENS ──────────────────────────────────────────────────────────────────
const T = {
  bg:        '#F4F1ED',  // warm parchment (Cardless warmth)
  surface:   '#FFFFFF',
  surface2:  '#EDE9E2',  // medium cream
  surface3:  '#E5E0D8',  // deep cream
  text:      '#1A1818',
  textMid:   '#5C5450',
  textMute:  'rgba(26,24,24,0.42)',
  navy:      '#1E3A5F',  // professional consulting depth
  navyMid:   '#2D5080',  // hover/active
  navyLt:    '#D4DEF0',  // light navy fill
  amber:     '#C96B2A',  // warm copper accent
  amberLt:   '#F5E3D4',
  green:     '#256645',  // positive/growth
  greenLt:   '#D5EDDF',
  border:    '#DDD9D2',
  borderLt:  '#EDE9E2',
  shadow:    'rgba(26,24,24,0.07)',
};

const W = 375, H = 812, GAP = 80;
let _id = 0;
const uid = () => `t${++_id}`;

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return {
    id: uid(), type: 'rectangle',
    x, y, width: w, height: h,
    fill: fill || 'transparent',
    cornerRadius: opts.r ?? 0,
    opacity: opts.opacity ?? 1,
    ...(opts.shadow ? { shadow: { x: 0, y: 2, blur: 12, color: T.shadow } } : {}),
    ...(opts.border ? { border: { color: opts.border, width: opts.bw ?? 1 } } : {}),
  };
}

function text(x, y, w, content, opts = {}) {
  return {
    id: uid(), type: 'text',
    x, y, width: w, content,
    fontSize:    opts.size ?? 14,
    fontFamily:  opts.mono ? '"JetBrains Mono", monospace' : opts.serif ? '"Playfair Display", Georgia, serif' : '"Inter", "Helvetica Neue", sans-serif',
    fontWeight:  opts.bold ? '700' : opts.semi ? '600' : opts.medium ? '500' : opts.light ? '300' : '400',
    color:       opts.color ?? T.text,
    textAlign:   opts.center ? 'center' : opts.right ? 'right' : 'left',
    lineHeight:  opts.lh ?? (opts.size >= 24 ? 1.2 : opts.size >= 16 ? 1.35 : 1.5),
    letterSpacing: opts.ls ?? (opts.size >= 20 ? -0.3 : opts.caps ? 0.8 : 0),
    opacity:     opts.opacity ?? 1,
    ...(opts.caps ? { textTransform: 'uppercase' } : {}),
  };
}

function frame(x, y, w, h, children, opts = {}) {
  return {
    id: uid(), type: 'frame',
    x, y, width: w, height: h,
    fill: opts.fill ?? 'transparent',
    cornerRadius: opts.r ?? 0,
    children: children.filter(Boolean),
    ...(opts.border ? { border: { color: opts.border, width: 1 } } : {}),
    ...(opts.shadow ? { shadow: { x: 0, y: 4, blur: 20, color: T.shadow } } : {}),
    ...(opts.clip ? { clipContent: true } : {}),
  };
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

// Stage badge pill: "01 SOURCED"
function stageBadge(x, y, num, label, active = false) {
  const bg = active ? T.navy : T.surface2;
  const fg = active ? '#FFFFFF' : T.textMid;
  const numFg = active ? 'rgba(255,255,255,0.7)' : T.textMute;
  const W2 = 80, H2 = 24;
  return frame(x, y, W2, H2, [
    rect(0, 0, W2, H2, bg, { r: 4 }),
    text(8, 4, 22, num, { size: 11, bold: true, mono: true, color: numFg, lh: 1.3 }),
    text(30, 4, W2 - 34, label, { size: 10, semi: true, color: fg, caps: true, ls: 0.5, lh: 1.3 }),
  ]);
}

// Deal card
function dealCard(x, y, deal) {
  const W2 = W - 32, H2 = 88;
  const stageColors = ['#C96B2A', '#2D6B9F', '#8B5CF6', '#256645', '#C96B2A'];
  const stageIdx = deal.stageNum - 1;
  const stageAccent = stageColors[stageIdx % stageColors.length];
  return frame(x, y, W2, H2, [
    rect(0, 0, W2, H2, T.surface, { r: 10, shadow: true }),
    // Left stage indicator bar
    rect(0, 0, 3, H2, stageAccent, { r: 0 }),
    // Stage number
    text(14, 10, 32, `0${deal.stageNum}`, { size: 11, bold: true, mono: true, color: T.textMute }),
    // Client name
    text(14, 26, W2 - 90, deal.client, { size: 15, semi: true, lh: 1.2 }),
    // Deal name / description
    text(14, 46, W2 - 90, deal.name, { size: 12, color: T.textMid, lh: 1.4 }),
    // Stage label (right)
    text(W2 - 82, 10, 76, deal.stage, { size: 10, caps: true, ls: 0.5, color: stageAccent, semi: true, right: true }),
    // Value
    text(W2 - 82, 28, 76, deal.value, { size: 18, bold: true, right: true }),
    // Days label
    text(W2 - 82, 52, 76, deal.days, { size: 11, color: T.textMute, right: true }),
    // Progress dots
    ...([1,2,3,4,5]).map((s, i) => rect(14 + i * 10, H2 - 12, 6, 6, s <= deal.stageNum ? stageAccent : T.surface3, { r: 3 })),
  ]);
}

// Metric tile
function metricTile(x, y, label, value, sub, color) {
  const W2 = 102, H2 = 72;
  return frame(x, y, W2, H2, [
    rect(0, 0, W2, H2, T.surface, { r: 10, shadow: true }),
    text(10, 10, W2 - 20, label, { size: 10, caps: true, ls: 0.6, color: T.textMute }),
    text(10, 28, W2 - 20, value, { size: 20, bold: true, color: color || T.text }),
    text(10, 56, W2 - 20, sub, { size: 10, color: T.textMute }),
  ]);
}

// Section label
function sectionLabel(x, y, label, action) {
  return frame(x, y, W - 32, 20, [
    text(0, 0, 160, label, { size: 12, semi: true, caps: true, ls: 0.7, color: T.textMid }),
    action ? text(W - 32 - 60, 0, 60, action, { size: 12, color: T.navy, right: true }) : null,
  ]);
}

// Status bar
function statusBar(x, y) {
  return frame(x, y, W, 44, [
    rect(0, 0, W, 44, T.bg),
    text(20, 14, 60, '9:41', { size: 15, semi: true }),
    text(W - 80, 14, 60, '●●● ◼', { size: 11, color: T.textMid, right: true }),
  ]);
}

// Bottom nav bar
function bottomNav(y, active) {
  const items = [
    { id: 'home',     icon: '◉', label: 'Home'     },
    { id: 'pipeline', icon: '◫', label: 'Pipeline' },
    { id: 'clients',  icon: '◎', label: 'Clients'  },
    { id: 'revenue',  icon: '◈', label: 'Revenue'  },
  ];
  const IW = W / items.length;
  return frame(0, y, W, 82, [
    rect(0, 0, W, 1, T.border),
    rect(0, 1, W, 81, T.bg),
    ...items.flatMap((item, i) => {
      const isActive = item.id === active;
      const cx = i * IW + IW / 2;
      return [
        text(cx - 12, 10, 24, item.icon, { size: 22, color: isActive ? T.navy : T.textMute, center: true }),
        text(cx - 24, 36, 48, item.label, { size: 10, color: isActive ? T.navy : T.textMute, center: true, semi: isActive }),
      ];
    }),
    // Active indicator dot
    rect(items.findIndex(i => i.id === active) * IW + IW/2 - 2, 56, 4, 4, T.navy, { r: 2 }),
  ]);
}

// ─── SCREEN 1: DASHBOARD ─────────────────────────────────────────────────────
function screenDashboard() {
  const nodes = [];
  let sy = 0;

  // Background
  nodes.push(rect(0, 0, W, H, T.bg));
  nodes.push(statusBar(0, 0)); sy = 44;

  // Header
  nodes.push(text(20, sy + 12, W - 100, 'Good morning,', { size: 14, color: T.textMid }));
  nodes.push(text(20, sy + 30, W - 100, 'Jordan Klein', { size: 22, bold: true }));
  // Avatar placeholder
  nodes.push(rect(W - 56, sy + 12, 40, 40, T.navyLt, { r: 20 }));
  nodes.push(text(W - 50, sy + 22, 28, 'JK', { size: 13, bold: true, color: T.navy, center: true }));
  sy += 80;

  // 3 Metric tiles
  nodes.push(metricTile(16, sy, 'This Month', '$28.4K', '+12% vs last mo', T.green));
  nodes.push(metricTile(127, sy, 'Active Deals', '7', '3 stages ahead'));
  nodes.push(metricTile(238, sy, 'Win Rate', '68%', 'trailing 6 mo'));
  sy += 88;

  // Active pipeline label
  nodes.push(sectionLabel(16, sy, 'Active Pipeline', 'See all'));
  sy += 28;

  // 3 deal cards
  const deals = [
    { stageNum: 3, client: 'Northmoor Capital', name: 'M&A Strategy Advisory', value: '$18K', stage: 'Negotiating', days: '14 days in stage' },
    { stageNum: 4, client: 'Vestal Group', name: 'Operating Model Redesign', value: '$24K', stage: 'Active', days: '22 days remaining' },
    { stageNum: 2, client: 'Clearfield Ventures', name: 'Go-to-Market Assessment', value: '$9K', stage: 'Proposal', days: '5 days to respond' },
  ];
  deals.forEach(d => {
    nodes.push(dealCard(16, sy, d));
    sy += 96;
  });

  // Upcoming label
  nodes.push(sectionLabel(16, sy, 'Upcoming This Week', null));
  sy += 26;
  const upcoming = [
    { label: 'Northmoor — Contract call', time: 'Today 2:00 PM', dot: T.amber },
    { label: 'Clearfield proposal deadline', time: 'Wed Mar 29', dot: T.navy },
  ];
  upcoming.forEach(ev => {
    nodes.push(rect(16, sy, W - 32, 44, T.surface, { r: 8 }));
    nodes.push(rect(16, sy, 3, 44, ev.dot, { r: 0 }));
    nodes.push(text(26, sy + 7, W - 100, ev.label, { size: 13, semi: true }));
    nodes.push(text(26, sy + 26, 160, ev.time, { size: 11, color: T.textMute }));
    sy += 52;
  });

  nodes.push(bottomNav(H - 82, 'home'));
  return { name: 'Dashboard', width: W, height: H, nodes };
}

// ─── SCREEN 2: PIPELINE ──────────────────────────────────────────────────────
function screenPipeline() {
  const nodes = [];
  let sy = 0;

  nodes.push(rect(0, 0, W, H, T.bg));
  nodes.push(statusBar(0, 0)); sy = 44;

  // Header
  nodes.push(text(20, sy + 12, 200, 'Pipeline', { size: 22, bold: true }));
  nodes.push(text(20, sy + 38, 300, '7 active deals · $87K total', { size: 13, color: T.textMid }));
  // Filter button
  nodes.push(rect(W - 56, sy + 10, 40, 28, T.surface, { r: 8, border: T.border }));
  nodes.push(text(W - 52, sy + 16, 32, '⊟ 2', { size: 12, color: T.navy, center: true }));
  sy += 68;

  // Stage filter pills
  const stages = [
    { num: '01', label: 'Sourced',  count: 2, active: false },
    { num: '02', label: 'Proposal', count: 1, active: false },
    { num: '03', label: 'Negot.',   count: 2, active: true  },
    { num: '04', label: 'Active',   count: 2, active: false },
  ];
  let px = 16;
  stages.forEach(s => {
    const PW = 78;
    const bg = s.active ? T.navy : T.surface;
    const fg = s.active ? '#FFFFFF' : T.textMid;
    nodes.push(rect(px, sy, PW, 30, bg, { r: 15, border: s.active ? null : T.border }));
    nodes.push(text(px + 8, sy + 6, 24, s.num, { size: 11, mono: true, bold: true, color: s.active ? 'rgba(255,255,255,0.6)' : T.textMute }));
    nodes.push(text(px + 28, sy + 7, PW - 36, s.label, { size: 11, color: fg, semi: true }));
    px += PW + 4;
  });
  sy += 42;

  // Stage header
  nodes.push(rect(16, sy, W - 32, 32, T.surface2, { r: 8 }));
  nodes.push(text(24, sy + 8, 60, '03', { size: 13, bold: true, mono: true, color: T.navy }));
  nodes.push(text(50, sy + 9, 120, 'NEGOTIATING', { size: 11, caps: true, ls: 0.7, semi: true, color: T.navy }));
  nodes.push(text(W - 80, sy + 9, 56, '2 deals · $42K', { size: 11, color: T.textMid, right: true }));
  sy += 40;

  // Deals in this stage
  const negDeals = [
    { stageNum: 3, client: 'Northmoor Capital', name: 'M&A Strategy Advisory', value: '$18K', stage: 'Negotiating', days: '14 days in stage' },
    { stageNum: 3, client: 'Alderton & Co.', name: 'Digital Transformation Lead', value: '$24K', stage: 'Negotiating', days: '6 days in stage' },
  ];
  negDeals.forEach(d => {
    nodes.push(dealCard(16, sy, d));
    sy += 96;
  });

  // Stage header 2
  nodes.push(rect(16, sy, W - 32, 32, T.surface2, { r: 8 }));
  nodes.push(text(24, sy + 8, 60, '02', { size: 13, bold: true, mono: true, color: T.textMid }));
  nodes.push(text(50, sy + 9, 120, 'PROPOSAL', { size: 11, caps: true, ls: 0.7, semi: true, color: T.textMid }));
  nodes.push(text(W - 80, sy + 9, 56, '1 deal · $9K', { size: 11, color: T.textMute, right: true }));
  sy += 40;

  const propDeals = [
    { stageNum: 2, client: 'Clearfield Ventures', name: 'Go-to-Market Assessment', value: '$9K', stage: 'Proposal', days: '5 days to respond' },
  ];
  propDeals.forEach(d => {
    nodes.push(dealCard(16, sy, d));
    sy += 96;
  });

  nodes.push(bottomNav(H - 82, 'pipeline'));
  return { name: 'Pipeline', width: W, height: H, nodes };
}

// ─── SCREEN 3: DEAL DETAIL ───────────────────────────────────────────────────
function screenDealDetail() {
  const nodes = [];
  let sy = 0;

  nodes.push(rect(0, 0, W, H, T.bg));
  nodes.push(statusBar(0, 0)); sy = 44;

  // Back nav
  nodes.push(text(16, sy + 12, 120, '← Northmoor Capital', { size: 13, color: T.navy }));
  nodes.push(rect(W - 48, sy + 8, 32, 32, T.surface, { r: 16 }));
  nodes.push(text(W - 40, sy + 14, 24, '···', { size: 16, color: T.textMid, center: true }));
  sy += 48;

  // Deal header card
  nodes.push(rect(16, sy, W - 32, 96, T.surface, { r: 12, shadow: true }));
  nodes.push(rect(16, sy, 3, 96, T.amber, { r: 0 }));
  nodes.push(text(26, sy + 12, 200, 'M&A Strategy Advisory', { size: 17, bold: true }));
  nodes.push(text(26, sy + 35, 200, 'Northmoor Capital', { size: 13, color: T.textMid }));
  // Value
  nodes.push(text(26, sy + 58, 100, '$18,000', { size: 22, bold: true, color: T.amber }));
  nodes.push(text(W - 80, sy + 14, 64, '03', { size: 28, bold: true, mono: true, color: T.navyLt, right: true }));
  nodes.push(text(W - 80, sy + 46, 64, 'NEGOTIATING', { size: 9, caps: true, ls: 0.6, color: T.textMute, right: true }));
  sy += 112;

  // Stage timeline — the 01→05 numbered milestone track
  nodes.push(sectionLabel(16, sy, 'Stage Progress', null)); sy += 26;

  const stages2 = [
    { n: '01', label: 'Sourced',        done: true,  date: 'Feb 14' },
    { n: '02', label: 'Proposal Sent',  done: true,  date: 'Feb 28' },
    { n: '03', label: 'Negotiating',    active: true, date: 'Mar 13–' },
    { n: '04', label: 'Active',         done: false, date: '—' },
    { n: '05', label: 'Invoiced',       done: false, date: '—' },
  ];

  // Track line
  nodes.push(rect(34, sy + 14, 3, stages2.length * 44 - 20, T.border));

  stages2.forEach((s, i) => {
    const y2 = sy + i * 44;
    const fg = s.done ? T.green : s.active ? T.navy : T.textMute;
    const bg = s.done ? T.greenLt : s.active ? T.navyLt : T.surface2;
    // Node circle
    nodes.push(rect(22, y2 + 6, 24, 24, bg, { r: 12, border: s.active ? T.navy : null }));
    nodes.push(text(22, y2 + 10, 24, s.n, { size: 10, bold: true, mono: true, color: fg, center: true }));
    // Label
    nodes.push(text(56, y2 + 8, 180, s.label, { size: 14, color: fg, semi: s.active }));
    // Date
    nodes.push(text(W - 80, y2 + 8, 64, s.date, { size: 12, color: T.textMute, right: true }));
    // Check mark for done
    if (s.done) nodes.push(text(22, y2 + 10, 24, '✓', { size: 10, bold: true, color: T.green, center: true }));
  });
  sy += stages2.length * 44 + 8;

  // Key details section
  nodes.push(sectionLabel(16, sy, 'Contract Details', 'Edit')); sy += 26;

  const details = [
    { label: 'Start Date',  value: 'Mar 13, 2026' },
    { label: 'End Date',    value: 'Jun 13, 2026' },
    { label: 'Hourly Rate', value: '$220 / hr'    },
    { label: 'Est. Hours',  value: '80 hrs'       },
  ];
  nodes.push(rect(16, sy, W - 32, details.length * 36 + 8, T.surface, { r: 10 }));
  details.forEach((d, i) => {
    const y2 = sy + 12 + i * 36;
    nodes.push(text(24, y2, 140, d.label, { size: 13, color: T.textMid }));
    nodes.push(text(W - 80, y2, 56, d.value, { size: 13, semi: true, right: true }));
    if (i < details.length - 1) nodes.push(rect(24, y2 + 28, W - 64, 1, T.borderLt));
  });
  sy += details.length * 36 + 20;

  // Action button
  nodes.push(rect(16, sy, W - 32, 48, T.navy, { r: 12 }));
  nodes.push(text(16, sy + 14, W - 32, '→ Move to Active (04)', { size: 14, semi: true, color: '#FFFFFF', center: true }));

  nodes.push(bottomNav(H - 82, 'pipeline'));
  return { name: 'Deal Detail', width: W, height: H, nodes };
}

// ─── SCREEN 4: CLIENTS ────────────────────────────────────────────────────────
function screenClients() {
  const nodes = [];
  let sy = 0;

  nodes.push(rect(0, 0, W, H, T.bg));
  nodes.push(statusBar(0, 0)); sy = 44;

  // Header
  nodes.push(text(20, sy + 12, 200, 'Clients', { size: 22, bold: true }));
  nodes.push(text(20, sy + 38, 300, '12 clients · $142K lifetime', { size: 13, color: T.textMid }));
  // Search bar
  nodes.push(rect(16, sy + 60, W - 32, 38, T.surface, { r: 10, border: T.border }));
  nodes.push(text(40, sy + 71, W - 80, 'Search clients…', { size: 13, color: T.textMute }));
  nodes.push(text(22, sy + 71, 18, '⌕', { size: 14, color: T.textMute }));
  sy += 108;

  // Active clients label
  nodes.push(sectionLabel(16, sy, 'Active Engagements', null)); sy += 28;

  const clients = [
    { initials: 'NC', name: 'Northmoor Capital', type: 'M&A Strategy', deals: 1, value: '$18K', stage: '03', stageLabel: 'Negotiating', color: T.amber },
    { initials: 'VG', name: 'Vestal Group', type: 'Operations', deals: 1, value: '$24K', stage: '04', stageLabel: 'Active', color: T.green },
    { initials: 'CF', name: 'Clearfield Ventures', type: 'GTM Strategy', deals: 1, value: '$9K', stage: '02', stageLabel: 'Proposal', color: T.navyMid },
  ];

  clients.forEach(c => {
    const CH = 68;
    nodes.push(rect(16, sy, W - 32, CH, T.surface, { r: 10, shadow: true }));
    // Avatar
    nodes.push(rect(20, sy + 14, 40, 40, c.color + '22', { r: 20 }));
    nodes.push(text(20, sy + 24, 40, c.initials, { size: 13, bold: true, color: c.color, center: true }));
    // Client info
    nodes.push(text(70, sy + 12, 180, c.name, { size: 14, semi: true }));
    nodes.push(text(70, sy + 32, 180, c.type, { size: 12, color: T.textMid }));
    nodes.push(text(70, sy + 50, 100, `${c.deals} active deal`, { size: 11, color: T.textMute }));
    // Stage badge right
    nodes.push(rect(W - 88, sy + 12, 66, 22, c.color + '18', { r: 4 }));
    nodes.push(text(W - 88, sy + 16, 66, `${c.stage} ${c.stageLabel}`, { size: 10, semi: true, color: c.color, center: true }));
    // Value
    nodes.push(text(W - 80, sy + 40, 64, c.value, { size: 16, bold: true, right: true }));
    sy += 76;
  });

  // Past clients label
  nodes.push(sectionLabel(16, sy, 'Past Clients', 'View all')); sy += 28;

  const past = [
    { initials: 'AC', name: 'Alderton & Co.', type: 'Digital Transformation', value: '$64K', color: T.navyMid },
    { initials: 'PR', name: 'Praxis Research', type: 'Innovation Strategy', value: '$31K', color: '#8B5CF6' },
  ];

  past.forEach(c => {
    const CH = 56;
    nodes.push(rect(16, sy, W - 32, CH, T.surface, { r: 10 }));
    nodes.push(rect(20, sy + 10, 36, 36, c.color + '18', { r: 18 }));
    nodes.push(text(20, sy + 18, 36, c.initials, { size: 12, bold: true, color: c.color, center: true }));
    nodes.push(text(64, sy + 10, 200, c.name, { size: 13, semi: true }));
    nodes.push(text(64, sy + 30, 200, c.type, { size: 11, color: T.textMute }));
    nodes.push(text(W - 68, sy + 14, 52, c.value, { size: 15, semi: true, color: T.textMid, right: true }));
    sy += 64;
  });

  nodes.push(bottomNav(H - 82, 'clients'));
  return { name: 'Clients', width: W, height: H, nodes };
}

// ─── SCREEN 5: REVENUE ────────────────────────────────────────────────────────
function screenRevenue() {
  const nodes = [];
  let sy = 0;

  nodes.push(rect(0, 0, W, H, T.bg));
  nodes.push(statusBar(0, 0)); sy = 44;

  // Header
  nodes.push(text(20, sy + 12, 200, 'Revenue', { size: 22, bold: true }));
  // Period toggle
  nodes.push(rect(W - 120, sy + 10, 104, 28, T.surface, { r: 8, border: T.border }));
  nodes.push(text(W - 116, sy + 16, 44, '6 Mo', { size: 12, semi: true, color: T.navy, center: true }));
  nodes.push(rect(W - 72, sy + 12, 1, 20, T.border));
  nodes.push(text(W - 68, sy + 16, 44, '1 Yr', { size: 12, color: T.textMute, center: true }));
  sy += 52;

  // Big revenue number
  nodes.push(text(20, sy, W - 40, '$142,400', { size: 36, bold: true, ls: -1.5 }));
  nodes.push(text(20, sy + 44, 200, '↑ $23.6K vs prior period', { size: 13, color: T.green }));
  sy += 66;

  // Mini bar chart — 6 months
  const months = [
    { mo: 'Oct', v: 18, pct: 0.50 },
    { mo: 'Nov', v: 22, pct: 0.61 },
    { mo: 'Dec', v: 14, pct: 0.39 },
    { mo: 'Jan', v: 26, pct: 0.72 },
    { mo: 'Feb', v: 34, pct: 0.94 },
    { mo: 'Mar', v: 28, pct: 0.78, current: true },
  ];
  const CHART_W = W - 32;
  const CHART_H = 100;
  const barW = 36;
  const barGap = (CHART_W - months.length * barW) / (months.length + 1);
  nodes.push(rect(16, sy, CHART_W, CHART_H + 28, T.surface, { r: 12, shadow: true }));
  months.forEach((m, i) => {
    const bx = 16 + barGap + i * (barW + barGap);
    const barH = Math.max(8, CHART_H * m.pct * 0.8);
    const by = sy + 8 + CHART_H * 0.8 - barH;
    nodes.push(rect(bx, by, barW, barH, m.current ? T.navy : T.navyLt, { r: 4 }));
    nodes.push(text(bx, sy + CHART_H + 6, barW, m.mo, { size: 10, color: m.current ? T.navy : T.textMute, center: true, semi: m.current }));
  });
  sy += CHART_H + 44;

  // Invoices due
  nodes.push(sectionLabel(16, sy, 'Upcoming Invoices', 'Add new')); sy += 28;

  const invoices = [
    { client: 'Northmoor Capital', desc: 'Advisory — March Retainer', due: 'Due Apr 1', amount: '$6,000', status: 'Scheduled' },
    { client: 'Vestal Group', desc: 'Monthly Operations — March', due: 'Due Apr 5', amount: '$8,000', status: 'Scheduled' },
    { client: 'Clearfield Ventures', desc: 'GTM Assessment — Milestone 1', due: 'Due Apr 15', amount: '$4,500', status: 'Draft' },
  ];

  invoices.forEach((inv, i) => {
    nodes.push(rect(16, sy, W - 32, 60, T.surface, { r: 10 }));
    nodes.push(text(20, sy + 8, W - 120, inv.client, { size: 13, semi: true }));
    nodes.push(text(20, sy + 27, W - 120, inv.desc, { size: 11, color: T.textMid }));
    nodes.push(text(20, sy + 44, 100, inv.due, { size: 11, color: T.textMute }));
    nodes.push(text(W - 78, sy + 8, 62, inv.amount, { size: 15, bold: true, right: true }));
    const badgeColor = inv.status === 'Draft' ? T.amber : T.green;
    nodes.push(rect(W - 72, sy + 32, 56, 18, badgeColor + '1A', { r: 4 }));
    nodes.push(text(W - 72, sy + 35, 56, inv.status, { size: 10, semi: true, color: badgeColor, center: true }));
    if (i < invoices.length - 1) nodes.push(rect(20, sy + 58, W - 52, 1, T.borderLt));
    sy += 62;
  });

  nodes.push(bottomNav(H - 82, 'revenue'));
  return { name: 'Revenue', width: W, height: H, nodes };
}

// ─── ASSEMBLE .PEN ────────────────────────────────────────────────────────────
const screens = [
  screenDashboard(),
  screenPipeline(),
  screenDealDetail(),
  screenClients(),
  screenRevenue(),
];

// Lay screens out horizontally
const pen = {
  version: '2.8',
  name: 'TENOR',
  width:  screens.length * (W + GAP) - GAP,
  height: H,
  fill:   '#E8E5E1',
  children: screens.map((sc, i) => ({
    id:       uid(),
    type:     'frame',
    name:     sc.name,
    x:        i * (W + GAP),
    y:        0,
    width:    W,
    height:   H,
    fill:     T.bg,
    children: sc.nodes,
  })),
};

fs.writeFileSync(
  '/workspace/group/design-studio/tenor.pen',
  JSON.stringify(pen, null, 2)
);
console.log('✓ tenor.pen written —', screens.length, 'screens,',
  JSON.stringify(pen).length.toLocaleString(), 'bytes');
