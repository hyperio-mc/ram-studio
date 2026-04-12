// STROBE — Live Venue Event Analytics
// Inspired by: Saaspo "gamified UI depth" trend (layered panels, glow effects, HUD energy)
// + Dark Mode Design mixed typography (editorial serif italic for big numbers, geometric sans labels)
// Theme: DARK — deep blue-black with hot pink/red accent

const fs = require('fs');

const T = {
  bg:         '#07091180',
  bgSolid:    '#070911',
  surface:    '#0E1322',
  surfaceAlt: '#141929',
  surfaceHi:  '#1A2135',
  border:     'rgba(255,51,102,0.12)',
  borderSub:  'rgba(255,255,255,0.07)',
  text:       '#EEF0FF',
  textMuted:  'rgba(238,240,255,0.42)',
  textDim:    'rgba(238,240,255,0.22)',
  accent:     '#FF3366',
  accentDim:  'rgba(255,51,102,0.14)',
  accentGlow: 'rgba(255,51,102,0.28)',
  purple:     '#8B5CF6',
  purpleDim:  'rgba(139,92,246,0.14)',
  teal:       '#2DD4BF',
  tealDim:    'rgba(45,212,191,0.12)',
  amber:      '#F59E0B',
  amberDim:   'rgba(245,158,11,0.12)',
  green:      '#10B981',
  greenDim:   'rgba(16,185,129,0.12)',
};

function el(type, props) {
  return { type, ...props };
}

function rect(x, y, w, h, fill, opts = {}) {
  return el('rect', {
    position: { x, y },
    size: { width: w, height: h },
    style: { backgroundColor: fill, borderRadius: opts.r || 0, ...opts.style },
  });
}

function text(t, x, y, size, weight, color, opts = {}) {
  return el('text', {
    text: t,
    position: { x, y },
    style: {
      fontSize: size,
      fontWeight: weight,
      color,
      letterSpacing: opts.ls || 0,
      textTransform: opts.tt || 'none',
      lineHeight: opts.lh || 1.2,
      fontStyle: opts.italic ? 'italic' : 'normal',
      opacity: opts.opacity || 1,
      width: opts.width,
    },
  });
}

function statusBar(bg) {
  return el('statusbar', {
    position: { x: 0, y: 0 },
    size: { width: 390, height: 44 },
    style: { backgroundColor: bg, time: '22:41', color: T.text },
  });
}

function tabBar(tabs, activeIdx, y = 780) {
  const tabW = 390 / tabs.length;
  const items = tabs.map((tab, i) => ({
    label: tab.label,
    icon: tab.icon,
    active: i === activeIdx,
  }));
  return el('tabbar', {
    position: { x: 0, y },
    size: { width: 390, height: 64 },
    style: {
      backgroundColor: T.surface,
      borderTop: `1px solid ${T.borderSub}`,
      items,
      activeColor: T.accent,
      inactiveColor: T.textMuted,
      fontSize: 10,
    },
  });
}

const TABS = [
  { label: 'Tonight', icon: 'zap' },
  { label: 'Show', icon: 'play' },
  { label: 'Crowd', icon: 'user' },
  { label: 'Revenue', icon: 'chart' },
  { label: 'History', icon: 'list' },
];

// ——— SCREEN 1: TONIGHT ———
function screenTonight() {
  const elements = [
    statusBar(T.bgSolid),

    // Wordmark
    text('STROBE', 20, 58, 11, 900, T.accent, { ls: 4, tt: 'uppercase' }),
    text('LIVE', 88, 59, 9, 700, T.purple, { ls: 3, tt: 'uppercase', opacity: 0.9 }),
    // Date chip top right
    rect(310, 54, 62, 20, T.surfaceAlt, { r: 10, style: {} }),
    text('MON · MAR 24', 316, 59, 8, 600, T.textMuted, { ls: 0.5 }),

    // Big live indicator
    rect(0, 82, 390, 2, T.accent, { r: 0, style: { opacity: 0.35 } }),

    // Hero card - "NOW PLAYING"
    rect(16, 94, 358, 148, T.surface, { r: 16 }),
    // Left accent bar
    rect(16, 94, 4, 148, T.accent, { r: 2 }),
    text('NOW LIVE', 32, 108, 8, 800, T.accent, { ls: 3, tt: 'uppercase' }),
    // Pulsing dot
    el('circle', { position: { x: 84, y: 112 }, radius: 4, style: { backgroundColor: T.accent } }),
    text('The Observatory · Main Stage', 32, 124, 14, 700, T.text, { lh: 1.3 }),
    text('TAME IMPALA', 32, 142, 20, 900, T.text, { ls: 1.5, tt: 'uppercase' }),
    text('Currents Tour — 2026 Finale', 32, 166, 12, 500, T.textMuted ),
    // Capacity bar
    text('CAPACITY', 32, 188, 9, 700, T.textMuted, { ls: 2, tt: 'uppercase' }),
    text('87%', 340, 186, 12, 700, T.accent ),
    rect(32, 200, 278, 6, T.surfaceAlt, { r: 3 }),
    rect(32, 200, 242, 6, T.accent, { r: 3 }),
    text('2,436 / 2,800', 32, 214, 10, 500, T.textMuted ),
    text('3:24 remaining', 290, 214, 10, 500, T.textMuted ),

    // 3 stat chips row
    rect(16, 256, 107, 70, T.surfaceAlt, { r: 12 }),
    text('DOORS', 29, 269, 8, 700, T.textMuted, { ls: 2, tt: 'uppercase' }),
    text('$18.4K', 24, 283, 16, 800, T.text ),
    text('revenue/hr', 24, 303, 9, 500, T.textMuted ),

    rect(137, 256, 107, 70, T.surfaceAlt, { r: 12 }),
    text('BAR', 150, 269, 8, 700, T.textMuted, { ls: 2, tt: 'uppercase' }),
    text('341', 147, 283, 16, 800, T.purple ),
    text('drinks sold', 147, 303, 9, 500, T.textMuted ),

    rect(258, 256, 116, 70, T.surfaceAlt, { r: 12 }),
    text('MERCH', 271, 269, 8, 700, T.textMuted, { ls: 2, tt: 'uppercase' }),
    text('$6.2K', 265, 283, 16, 800, T.teal ),
    text('tonight so far', 265, 303, 9, 500, T.textMuted ),

    // Upcoming events header
    text('UP NEXT TONIGHT', 16, 344, 9, 800, T.textMuted, { ls: 2.5, tt: 'uppercase' }),

    // Event list items
    ...eventRow(16, 360, '10:30 PM', 'Bonobo DJ Set', 'Club Level', '68%', T.purple),
    ...eventRow(16, 416, '11:45 PM', 'Close Night w/ Sable', 'Rooftop', '41%', T.teal),
    ...eventRow(16, 472, '01:00 AM', 'Afterparty (Members)', 'Vault', '100%', T.amber),

    tabBar(TABS, 0),
  ];
  return { id: 'tonight', label: 'Tonight', backgroundColor: T.bgSolid, elements };
}

function eventRow(x, y, time, name, venue, cap, color) {
  return [
    rect(x, y, 358, 50, T.surface, { r: 12 }),
    rect(x, y, 3, 50, color, { r: 2 }),
    text(time, x + 14, y + 10, 9, 700, T.textMuted, { ls: 0.5 }),
    text(name, x + 14, y + 26, 13, 700, T.text ),
    text(venue, x + 14, y + 42, 10, 500, T.textMuted ),
    text(cap, x + 294, y + 20, 13, 800, color ),
    text('cap', x + 332, y + 23, 9, 500, T.textMuted ),
  ];
}

// ——— SCREEN 2: SHOW ———
function screenShow() {
  const elements = [
    statusBar(T.bgSolid),

    // Back nav
    text('← TONIGHT', 16, 58, 9, 700, T.accent, { ls: 1.5, tt: 'uppercase' }),

    // Hero show info
    rect(0, 78, 390, 180, T.surface, { r: 0 }),
    rect(0, 78, 390, 180, 'linear-gradient(180deg, rgba(255,51,102,0.06) 0%, rgba(7,9,17,0) 100%)', { r: 0 }),
    // Live badge
    rect(16, 92, 56, 20, T.accent, { r: 10 }),
    text('● LIVE', 24, 97, 9, 800, '#FFF', { ls: 1 }),
    // Show title - BIG editorial type (key design decision: oversized serif italic)
    text('Tame', 16, 122, 42, 900, T.text, { italic: true, lh: 1 }),
    text('Impala', 16, 164, 42, 900, T.text, { italic: true, lh: 1 }),
    text('Currents Tour · Main Stage · 8:00 PM', 16, 210, 10, 500, T.textMuted ),
    text('SOLD OUT', 318, 94, 9, 800, T.amber, { ls: 1.5, tt: 'uppercase' }),

    // Attendance arc placeholder / big number
    rect(16, 232, 176, 120, T.surfaceAlt, { r: 16 }),
    text('ATTENDANCE', 28, 248, 8, 700, T.textMuted, { ls: 2, tt: 'uppercase' }),
    text('2,436', 28, 268, 32, 900, T.text ),
    text('of 2,800 capacity', 28, 308, 10, 500, T.textMuted ),
    rect(28, 322, 140, 6, T.surfaceHi, { r: 3 }),
    rect(28, 322, 122, 6, T.accent, { r: 3 }),

    // Duration
    rect(204, 232, 170, 56, T.surfaceAlt, { r: 16 }),
    text('ELAPSED', 220, 248, 8, 700, T.textMuted, { ls: 2, tt: 'uppercase' }),
    text('1h 48m', 220, 268, 20, 900, T.purple ),
    text('of ~2h 15m set', 220, 290, 10, 500, T.textMuted ),

    // Rating
    rect(204, 300, 170, 52, T.surfaceAlt, { r: 16 }),
    text('CROWD ENERGY', 220, 316, 8, 700, T.textMuted, { ls: 2, tt: 'uppercase' }),
    text('9.1', 220, 332, 20, 900, T.teal ),
    text('/ 10 · 841 check-ins', 264, 338, 10, 500, T.textMuted ),

    // Setlist section
    text('SETLIST TRACKER', 16, 374, 9, 800, T.textMuted, { ls: 2.5, tt: 'uppercase' }),
    ...setlistRow(16, 390, 14, 'Let It Happen', '8:02 PM', true, T.accent),
    ...setlistRow(16, 428, 15, 'Nangs', '8:09 PM', true, T.accent),
    ...setlistRow(16, 466, 16, 'The Less I Know the Better', '8:13 PM', true, T.accent),
    ...setlistRow(16, 504, 17, 'Eventually', '8:18 PM', false, T.textDim),
    ...setlistRow(16, 542, 18, 'Yes I\'m Changing', '8:25 PM', false, T.textDim),

    tabBar(TABS, 1),
  ];
  return { id: 'show', label: 'Show', backgroundColor: T.bgSolid, elements };
}

function setlistRow(x, y, num, song, time, played, color) {
  return [
    rect(x, y, 358, 34, played ? T.surface : 'transparent', { r: 8 }),
    text(String(num).padStart(2, '0'), x + 10, y + 10, 10, 700, played ? color : T.textDim ),
    text(song, x + 42, y + 10, 13, played ? 600 : 500, played ? T.text : T.textDim ),
    text(time, x + 310, y + 11, 10, 500, T.textMuted ),
    played ? rect(x + 350, y + 14, 6, 6, color, { r: 3 }) : { type: 'noop' },
  ].filter(e => e.type !== 'noop');
}

// ——— SCREEN 3: CROWD ———
function screenCrowd() {
  const elements = [
    statusBar(T.bgSolid),

    text('CROWD', 20, 58, 22, 900, T.text, { ls: 1 }),
    text(' INTEL', 88, 58, 22, 900, T.accent, { ls: 1 }),

    // Arrivals chart (horizontal bars simulated)
    text('ARRIVALS BY HOUR', 16, 96, 9, 800, T.textMuted, { ls: 2.5, tt: 'uppercase' }),
    rect(16, 114, 358, 180, T.surface, { r: 16 }),
    ...arrivalsChart(28, 120),

    // Entry method split
    text('ENTRY METHODS', 16, 310, 9, 800, T.textMuted, { ls: 2.5, tt: 'uppercase' }),
    rect(16, 326, 170, 80, T.surface, { r: 14 }),
    text('TICKETS', 28, 342, 8, 700, T.textMuted, { ls: 2, tt: 'uppercase' }),
    text('71%', 28, 358, 24, 900, T.accent ),
    text('Mobile · Print', 28, 386, 10, 500, T.textMuted ),

    rect(200, 326, 174, 80, T.surface, { r: 14 }),
    text('WRISTBAND', 212, 342, 8, 700, T.textMuted, { ls: 2, tt: 'uppercase' }),
    text('29%', 212, 358, 24, 900, T.purple ),
    text('VIP · Member', 212, 386, 10, 500, T.textMuted ),

    // Top demographics
    text('AUDIENCE MIX', 16, 424, 9, 800, T.textMuted, { ls: 2.5, tt: 'uppercase' }),
    ...demoBar(16, 440, 'Age 25–34', 44, T.accent),
    ...demoBar(16, 468, 'Age 18–24', 28, T.purple),
    ...demoBar(16, 496, 'Age 35–44', 19, T.teal),
    ...demoBar(16, 524, 'Age 45+',    9, T.amber),

    // Check-ins heat stat
    rect(16, 560, 358, 60, T.surfaceAlt, { r: 14 }),
    text('PEAK CHECK-IN', 32, 576, 9, 700, T.textMuted, { ls: 2, tt: 'uppercase' }),
    text('9:14 PM', 32, 592, 18, 900, T.teal ),
    text('· 342 entries / 5 min', 114, 596, 10, 500, T.textMuted ),
    text('1,041 still in queue', 244, 580, 10, 500, T.accent ),
    text('avg wait: 4m', 288, 596, 10, 500, T.textMuted ),

    tabBar(TABS, 2),
  ];
  return { id: 'crowd', label: 'Crowd', backgroundColor: T.bgSolid, elements };
}

function arrivalsChart(x, y) {
  const bars = [
    { label: '6PM', val: 0.12, col: T.purple },
    { label: '7PM', val: 0.38, col: T.purple },
    { label: '8PM', val: 0.95, col: T.accent },
    { label: '9PM', val: 0.82, col: T.accent },
    { label: '10PM', val: 0.54, col: T.textMuted },
    { label: '11PM', val: 0.31, col: T.textMuted },
    { label: '12AM', val: 0.18, col: T.textMuted },
  ];
  const maxH = 110;
  const barW = 40;
  const gap = 8;
  return bars.flatMap((b, i) => {
    const bh = Math.round(b.val * maxH);
    const bx = x + i * (barW + gap);
    const by = y + 10 + (maxH - bh);
    return [
      rect(bx, y + 10, barW, maxH, T.surfaceHi, { r: 6 }),
      rect(bx, by, barW, bh, b.col, { r: 6, style: { opacity: b.col === T.textMuted ? 0.4 : 0.9 } }),
      text(b.label, bx + 4, y + 130, 9, 500, T.textMuted ),
    ];
  });
}

function demoBar(x, y, label, pct, color) {
  return [
    text(label, x + 10, y + 2, 11, 600, T.text, { width: 100 }),
    text(`${pct}%`, x + 330, y + 2, 11, 700, color ),
    rect(x + 110, y + 6, 210, 6, T.surfaceHi, { r: 3 }),
    rect(x + 110, y + 6, Math.round(210 * pct / 100), 6, color, { r: 3 }),
  ];
}

// ——— SCREEN 4: REVENUE ———
function screenRevenue() {
  const elements = [
    statusBar(T.bgSolid),

    text('REVENUE', 20, 58, 22, 900, T.text ),
    text('LIVE', 20, 80, 9, 800, T.accent, { ls: 3, tt: 'uppercase' }),

    // Big hero number (editorial treatment - key design decision)
    rect(0, 98, 390, 120, T.surface, { r: 0 }),
    text('TONIGHT\'S TOTAL', 20, 112, 9, 700, T.textMuted, { ls: 2.5, tt: 'uppercase' }),
    text('$142,840', 20, 136, 44, 900, T.text, { italic: true }),
    text('+$18.4K / hr', 20, 186, 12, 600, T.green ),
    text('vs avg show: +22%', 160, 188, 11, 500, T.textMuted ),
    el('circle', { position: { x: 152, y: 192 }, radius: 4, style: { backgroundColor: T.green } }),

    // Revenue breakdown
    text('BREAKDOWN', 16, 232, 9, 800, T.textMuted, { ls: 2.5, tt: 'uppercase' }),

    ...revenueRow(16, 250, 'Ticket Sales', '$89,200', 63, T.accent),
    ...revenueRow(16, 310, 'Bar & Beverages', '$31,420', 22, T.purple),
    ...revenueRow(16, 370, 'Merchandise', '$14,100', 10, T.teal),
    ...revenueRow(16, 430, 'VIP Upgrades', '$8,120', 5, T.amber),

    // Projection
    rect(16, 494, 358, 72, T.surfaceAlt, { r: 16 }),
    text('PROJECTED CLOSE', 32, 510, 9, 700, T.textMuted, { ls: 2, tt: 'uppercase' }),
    text('$168K', 32, 530, 22, 900, T.teal ),
    text('at current pace', 100, 538, 10, 500, T.textMuted ),
    text('2h 14m remaining', 210, 510, 10, 500, T.textMuted ),
    text('Top 3% all time', 210, 534, 12, 700, T.green ),

    tabBar(TABS, 3),
  ];
  return { id: 'revenue', label: 'Revenue', backgroundColor: T.bgSolid, elements };
}

function revenueRow(x, y, label, amount, pct, color) {
  return [
    rect(x, y, 358, 56, T.surface, { r: 14 }),
    text(label, x + 14, y + 12, 12, 600, T.textMuted ),
    text(amount, x + 14, y + 30, 18, 800, T.text ),
    text(`${pct}%`, x + 320, y + 20, 13, 700, color ),
    rect(x + 14, y + 48, 280, 4, T.surfaceHi, { r: 2 }),
    rect(x + 14, y + 48, Math.round(280 * pct / 100), 4, color, { r: 2, style: { opacity: 0.85 } }),
  ];
}

// ——— SCREEN 5: HISTORY ———
function screenHistory() {
  const shows = [
    { name: 'Arooj Aftab', date: 'Mar 20', rev: '$94K', att: '98%', score: 9.4, color: T.teal },
    { name: 'Four Tet', date: 'Mar 17', rev: '$128K', att: '100%', score: 9.8, color: T.accent },
    { name: 'Bonobo (Live)', date: 'Mar 14', rev: '$112K', att: '96%', score: 9.2, color: T.purple },
    { name: 'Floating Points', date: 'Mar 10', rev: '$87K', att: '89%', score: 8.7, color: T.amber },
    { name: 'DJ Shadow', date: 'Mar 7', rev: '$76K', att: '83%', score: 8.3, color: T.textMuted },
    { name: 'Nicolas Jaar', date: 'Mar 3', rev: '$102K', att: '93%', score: 9.0, color: T.teal },
  ];
  const elements = [
    statusBar(T.bgSolid),

    text('HISTORY', 20, 58, 22, 900, T.text ),

    // Stats summary bar
    rect(16, 86, 358, 72, T.surface, { r: 14 }),
    text('30 DAY SUMMARY', 32, 100, 8, 700, T.textMuted, { ls: 2, tt: 'uppercase' }),
    text('$824K', 32, 118, 18, 900, T.accent ),
    text('total revenue', 98, 124, 9, 500, T.textMuted ),
    rect(169, 98, 1, 40, T.borderSub, { r: 0 }),
    text('12 shows', 182, 118, 18, 900, T.purple ),
    text('this month', 182, 134, 9, 500, T.textMuted ),
    rect(288, 98, 1, 40, T.borderSub, { r: 0 }),
    text('9.1', 300, 118, 18, 900, T.teal ),
    text('avg score', 300, 134, 9, 500, T.textMuted ),

    text('RECENT SHOWS', 16, 174, 9, 800, T.textMuted, { ls: 2.5, tt: 'uppercase' }),

    ...shows.flatMap((s, i) => historyRow(16, 190 + i * 88, i + 1, s)),

    tabBar(TABS, 4),
  ];
  return { id: 'history', label: 'History', backgroundColor: T.bgSolid, elements };
}

function historyRow(x, y, rank, s) {
  return [
    rect(x, y, 358, 80, T.surface, { r: 14 }),
    rect(x, y, 4, 80, s.color, { r: 2 }),
    text(`#${rank}`, x + 14, y + 14, 10, 900, s.color ),
    text(s.name, x + 14, y + 32, 15, 700, T.text ),
    text(s.date, x + 14, y + 52, 10, 500, T.textMuted ),
    text(s.rev, x + 240, y + 18, 16, 800, T.text ),
    text('revenue', x + 256, y + 36, 9, 500, T.textMuted ),
    text(s.att, x + 310, y + 18, 14, 700, s.color ),
    text('cap', x + 340, y + 20, 9, 500, T.textMuted ),
    // Score badge
    rect(x + 280, y + 50, 62, 20, s.color === T.accent ? T.accentDim : T.surfaceAlt, { r: 10 }),
    text(`★ ${s.score}`, x + 289, y + 55, 10, 700, s.color ),
  ];
}

// ——— ASSEMBLE PEN ———
const pen = {
  name: 'STROBE',
  version: '2.8',
  metadata: {
    description: 'STROBE — Live venue event analytics. 5 screens: Tonight · Show · Crowd · Revenue · History.',
    theme: 'dark',
    palette: `bg ${T.bgSolid}, surface ${T.surface}, text ${T.text}, accent ${T.accent} hot-pink, purple ${T.purple}, teal ${T.teal}`,
    archetype: 'event-analytics',
    created: new Date().toISOString(),
    inspiration: 'Saaspo "gamified UI depth" trend (layered panels, glow, HUD energy) + Dark Mode Design mixed typography (serif italic for hero numbers, tight geometric sans for labels)',
  },
  settings: {
    viewport: { width: 390, height: 844 },
    fontFamily: 'Inter',
    borderRadius: 14,
    theme: T,
  },
  screens: [
    screenTonight(),
    screenShow(),
    screenCrowd(),
    screenRevenue(),
    screenHistory(),
  ],
};

fs.writeFileSync('strobe.pen', JSON.stringify(pen, null, 2));
console.log('✓ strobe.pen written —', pen.screens.length, 'screens');
pen.screens.forEach(s => console.log(`  · ${s.label}: ${s.elements.length} elements`));
