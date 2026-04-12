/**
 * Drift — Market intelligence, without the noise
 * Inspired by: minimal.gallery SAAS (Folk, Adaline, exactly.ai) + land-book's Equals/Cardless
 * Trend: Warm editorial light palettes, data-dense but breathable layouts
 * Theme: LIGHT
 */

const fs = require('fs');

const W = 390, H = 844;
const SLUG = 'drift';

const P = {
  bg:      '#F6F3EE',
  surface: '#FDFCFA',
  card:    '#FFFFFF',
  border:  '#E8E3DA',
  border2: '#D9D2C5',
  text:    '#1B1918',
  muted:   '#8C8278',
  accent:  '#E8623A',
  accent2: '#3B7DD8',
  green:   '#2D9D6E',
  red:     '#D04040',
  yellow:  '#D4933A',
};

let idCounter = 1;
const id = () => `el_${idCounter++}`;

function rect(x, y, w, h, fill, opts = {}) {
  return { id: id(), type: 'rectangle', x, y, width: w, height: h,
    backgroundColor: fill, cornerRadius: opts.r || 0,
    borderColor: opts.border || 'transparent', borderWidth: opts.bw || 0,
    opacity: opts.opacity || 1 };
}

function text(x, y, w, content, size, color, opts = {}) {
  return { id: id(), type: 'text', x, y, width: w, height: opts.h || size * 1.45,
    content, fontSize: size, color,
    fontWeight: opts.weight || 'regular',
    fontFamily: opts.font || 'Inter',
    letterSpacing: opts.ls || 0,
    lineHeight: opts.lh || 1.45,
    align: opts.align || 'left',
    opacity: opts.opacity || 1 };
}

function group(els, opts = {}) {
  return { id: id(), type: 'group', children: els,
    x: opts.x || 0, y: opts.y || 0, width: opts.w || W, height: opts.h || H };
}

function divider(y, color) {
  return rect(0, y, W, 1, color || P.border);
}

function dot(x, y, r, fill) {
  return { id: id(), type: 'ellipse', x: x - r, y: y - r,
    width: r*2, height: r*2, backgroundColor: fill,
    borderColor: 'transparent', borderWidth: 0 };
}

function badge(x, y, label, type) {
  const configs = {
    up:   { bg: '#E8F5EF', color: '#2D9D6E', text: '↑ ' + label },
    down: { bg: '#FDEEEE', color: '#D04040', text: '↓ ' + label },
    flat: { bg: '#F0EDE8', color: '#8C8278', text: '→ ' + label },
    new:  { bg: '#FEF0E8', color: '#E8623A', text: label },
    info: { bg: '#EBF2FD', color: '#3B7DD8', text: label },
  };
  const c = configs[type] || configs.info;
  const lw = Math.max(56, label.length * 6.5 + 16);
  return group([
    rect(0, 0, lw, 20, c.bg, { r: 4 }),
    text(0, 4, lw, c.text, 10, c.color, { weight: 'medium', align: 'center', h: 12 })
  ], { x, y, w: lw, h: 20 });
}

function statusBar() {
  return group([
    text(16, 14, 120, '9:41', 13, P.text, { weight: 'semibold' }),
    text(W - 80, 14, 70, '●●● ▲', 11, P.muted, { align: 'right' }),
  ], { x: 0, y: 0, w: W, h: 44 });
}

function bottomNav(activeIdx) {
  const tabs = [
    { label: 'Home',    icon: '⌂' },
    { label: 'Rivals',  icon: '◈' },
    { label: 'Signals', icon: '◉' },
    { label: 'Trends',  icon: '◬' },
    { label: 'Alerts',  icon: '◯' },
  ];
  const tabW = W / tabs.length;
  const items = tabs.flatMap((t, i) => {
    const cx = i * tabW + tabW / 2;
    const isActive = i === activeIdx;
    return [
      text(i * tabW, 8, tabW, t.icon, 18, isActive ? P.accent : P.muted, { align: 'center', h: 22 }),
      text(i * tabW, 30, tabW, t.label, 9, isActive ? P.accent : P.muted,
        { align: 'center', weight: isActive ? 'medium' : 'regular', h: 12 }),
      ...(isActive ? [dot(cx, 52, 3, P.accent)] : []),
    ];
  });
  return group([
    rect(0, 0, W, 66, P.surface, { border: P.border, bw: 1 }),
    ...items
  ], { x: 0, y: H - 66, w: W, h: 66 });
}

// SCREEN 1 — Dashboard
function screen1() {
  return {
    id: 'screen1', name: 'Overview', backgroundColor: P.bg,
    elements: [
      rect(0, 0, W, H, P.bg),
      statusBar(),
      text(20, 52, 200, 'drift', 22, P.text, { weight: 'bold', font: 'Georgia', ls: -0.5 }),
      text(20, 78, 260, 'Market intelligence', 13, P.muted),
      group([
        rect(0, 0, 110, 26, P.border2, { r: 13 }),
        text(0, 6, 110, 'Mar 31, 2026', 11, P.text, { align: 'center', weight: 'medium' })
      ], { x: W - 130, y: 54, w: 110, h: 26 }),
      divider(108),
      text(20, 118, 200, 'MARKET PULSE', 9, P.muted, { weight: 'semibold', ls: 1.2 }),

      // Pulse cards
      ...['SaaS Index', 'AI Tools', 'DevOps'].flatMap((label, i) => {
        const vals = [
          { v: '+4.2%', color: P.green },
          { v: '+11.7%', color: P.green },
          { v: '-1.3%', color: P.red },
        ][i];
        return [group([
          rect(0, 0, 114, 72, P.card, { r: 10, border: P.border, bw: 1 }),
          text(10, 10, 94, label, 10, P.muted, { weight: 'medium' }),
          text(10, 28, 94, vals.v, 17, vals.color, { weight: 'bold', font: 'Georgia' }),
        ], { x: 16 + i * 122, y: 135, w: 114, h: 72 })];
      }),

      text(20, 222, 200, 'TRACKING', 9, P.muted, { weight: 'semibold', ls: 1.2 }),
      text(W - 70, 222, 60, 'See all →', 11, P.accent, { align: 'right' }),

      ...[
        { name: 'Notion',   sector: 'Productivity',   change: '+3 updates', type: 'up' },
        { name: 'Linear',   sector: 'Dev Tools',       change: 'New pricing', type: 'new' },
        { name: 'Coda',     sector: 'Productivity',    change: '-2.1% share', type: 'down' },
        { name: 'Obsidian', sector: 'Knowledge Mgmt',  change: 'No change',  type: 'flat' },
      ].flatMap((item, i) => {
        const y = 240 + i * 64;
        const initials = item.name.slice(0, 2).toUpperCase();
        return [group([
          rect(0, 9, 36, 36, P.border, { r: 8 }),
          text(0, 18, 36, initials, 12, P.muted, { weight: 'bold', align: 'center' }),
          text(48, 12, 180, item.name, 14, P.text, { weight: 'semibold' }),
          text(48, 30, 180, item.sector, 11, P.muted),
          badge(W - 80, 16, item.change, item.type),
          divider(56, P.border),
        ], { x: 16, y, w: W - 32, h: 58 })];
      }),

      bottomNav(0),
    ]
  };
}

// SCREEN 2 — Competitor Detail
function screen2() {
  return {
    id: 'screen2', name: 'Rival Detail', backgroundColor: P.bg,
    elements: [
      rect(0, 0, W, H, P.bg),
      statusBar(),
      text(16, 54, 40, '←', 18, P.text),
      text(60, 52, 220, 'Linear', 20, P.text, { weight: 'bold', font: 'Georgia' }),
      text(60, 76, 220, 'Dev Tools · Project Management', 11, P.muted),
      group([
        dot(6, 9, 4, P.green),
        text(16, 3, 80, 'Tracking', 11, P.green, { weight: 'medium' })
      ], { x: W - 106, y: 58, w: 96, h: 18 }),
      divider(100),

      ...[
        { label: 'Est. Users', value: '82K', sub: '+12% QoQ' },
        { label: 'Pricing', value: '$8/mo', sub: 'Changed 2d ago' },
        { label: 'NPS Score', value: '71', sub: 'Industry: 42' },
      ].flatMap((m, i) => {
        const colW = (W - 32) / 3;
        return [group([
          text(0, 0, colW, m.label, 9, P.muted, { weight: 'medium', ls: 0.5 }),
          text(0, 16, colW, m.value, 20, P.text, { weight: 'bold', font: 'Georgia' }),
          text(0, 40, colW, m.sub, 10, P.accent2),
        ], { x: 16 + i * colW, y: 112, w: colW, h: 56 })];
      }),

      divider(176),
      text(16, 186, 200, 'RECENT MOVES', 9, P.muted, { weight: 'semibold', ls: 1.2 }),

      ...[
        { date: 'Mar 29', title: 'New pricing tier launched', detail: 'Added "Plus" at $8/seat, targets Jira migration', tag: 'Pricing', type: 'new' },
        { date: 'Mar 25', title: 'GitHub deep integration', detail: 'Auto issue creation from PRs, status sync', tag: 'Feature', type: 'up' },
        { date: 'Mar 18', title: 'Mobile app v3.2 shipped', detail: 'Offline mode, push notifications redesigned', tag: 'Product', type: 'info' },
      ].flatMap((move, i) => {
        const y = 204 + i * 96;
        return [group([
          rect(0, 0, W - 32, 88, P.card, { r: 10, border: P.border, bw: 1 }),
          text(12, 10, 80, move.date, 10, P.muted),
          badge((W - 32) - 76, 8, move.tag, move.type),
          text(12, 28, W - 56, move.title, 13, P.text, { weight: 'semibold' }),
          text(12, 48, W - 56, move.detail, 11, P.muted, { lh: 1.55 }),
        ], { x: 16, y, w: W - 32, h: 88 })];
      }),

      group([
        rect(0, 0, W - 32, 48, P.accent, { r: 10 }),
        text(0, 15, W - 32, 'Generate battle card  →', 13, '#FFFFFF',
          { weight: 'semibold', align: 'center' }),
      ], { x: 16, y: H - 66 - 60, w: W - 32, h: 48 }),

      bottomNav(1),
    ]
  };
}

// SCREEN 3 — Signals Feed
function screen3() {
  const signals = [
    { source: 'TechCrunch', time: '2h', headline: 'Notion acquires Clay CRM for undisclosed sum', tag: 'M&A', urgency: P.red, ubg: '#FDEEEE' },
    { source: 'Product Hunt', time: '4h', headline: 'Linear launches Cycles 2.0 — sprint overhaul', tag: 'Feature', urgency: P.yellow, ubg: '#FDF5E6' },
    { source: 'Hacker News', time: '6h', headline: 'Ask HN: Is Obsidian losing to Notion AI?', tag: 'Community', urgency: P.muted, ubg: P.border },
    { source: 'G2 Reviews', time: '8h', headline: '340 new reviews for Coda — avg 3.9★ (-0.2)', tag: 'Reviews', urgency: P.yellow, ubg: '#FDF5E6' },
    { source: 'GitHub', time: '12h', headline: 'Linear CLI hits 10K stars — fastest growing', tag: 'OSS', urgency: P.muted, ubg: P.border },
  ];

  return {
    id: 'screen3', name: 'Signals', backgroundColor: P.bg,
    elements: [
      rect(0, 0, W, H, P.bg),
      statusBar(),
      text(20, 52, 200, 'Signals', 22, P.text, { weight: 'bold', font: 'Georgia' }),
      text(20, 78, 260, '24 new since yesterday', 12, P.muted),

      ...['All', 'High', 'Pricing', 'Feature', 'Press'].flatMap((f, i) => {
        const ws = [32, 44, 52, 56, 40];
        const xs = [0, 40, 92, 152, 216];
        const isActive = i === 0;
        return [group([
          rect(0, 0, ws[i], 28, isActive ? P.accent : P.card, { r: 14, border: isActive ? 'transparent' : P.border, bw: 1 }),
          text(0, 7, ws[i], f, 11, isActive ? '#FFFFFF' : P.text, { align: 'center', weight: 'medium' })
        ], { x: 16 + xs[i], y: 97, w: ws[i], h: 28 })];
      }),

      divider(136),

      ...signals.flatMap((s, i) => {
        const y = 144 + i * 92;
        const tagW = s.tag.length * 7 + 16;
        return [group([
          rect(0, 12, 3, 56, s.urgency, { r: 2 }),
          text(14, 10, 200, s.source, 10, P.muted, { weight: 'semibold', ls: 0.4 }),
          text(W - 64, 10, 50, s.time + ' ago', 10, P.muted, { align: 'right' }),
          text(14, 26, W - 60, s.headline, 12, P.text, { weight: 'medium', lh: 1.5 }),
          group([
            rect(0, 0, tagW, 18, s.ubg, { r: 4 }),
            text(0, 3, tagW, s.tag, 10, s.urgency, { align: 'center', weight: 'medium' })
          ], { x: 14, y: 64, w: tagW, h: 18 }),
          divider(86, P.border),
        ], { x: 16, y, w: W - 32, h: 86 })];
      }),

      bottomNav(2),
    ]
  };
}

// SCREEN 4 — Trends
function screen4() {
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const data = [
    [42, 48, 51, 58, 63, 74],
    [68, 72, 70, 71, 69, 66],
    [31, 29, 27, 25, 23, 22],
  ];
  const colors = [P.accent2, P.accent, P.border2];
  const chartH = 120, barW = 16, groupW = (W - 40) / months.length;

  return {
    id: 'screen4', name: 'Trends', backgroundColor: P.bg,
    elements: [
      rect(0, 0, W, H, P.bg),
      statusBar(),
      text(20, 52, 200, 'Trends', 22, P.text, { weight: 'bold', font: 'Georgia' }),
      text(20, 78, 260, 'Market share estimates, 6mo', 12, P.muted),

      ...['Linear', 'Notion', 'Coda'].flatMap((name, i) => [
        group([
          rect(0, 5, 10, 10, colors[i], { r: 2 }),
          text(14, 3, 60, name, 11, P.text, { weight: 'medium' })
        ], { x: 20 + i * 80, y: 98, w: 80, h: 16 })
      ]),

      rect(20, 120, W - 40, chartH + 24, P.card, { r: 10, border: P.border, bw: 1 }),

      ...months.flatMap((month, mi) => {
        const gx = 32 + mi * groupW + groupW / 2;
        return [
          ...data.flatMap((series, si) => {
            const bh = (series[mi] / 100) * chartH;
            const bx = gx + (si - 1) * (barW + 2) - barW / 2;
            return [rect(bx, 120 + chartH - bh + 12, barW, bh, colors[si], { r: 3 })];
          }),
          text(gx - 16, 120 + chartH + 13, 32, month, 9, P.muted, { align: 'center' }),
        ];
      }),

      text(20, 262, 200, 'KEY INSIGHT', 9, P.muted, { weight: 'semibold', ls: 1.2 }),
      group([
        rect(0, 0, W - 40, 68, P.card, { r: 10, border: P.border, bw: 1 }),
        rect(0, 0, 4, 68, P.accent2, { r: 2 }),
        text(16, 12, W - 72, 'Linear accelerating fast', 13, P.text, { weight: 'semibold' }),
        text(16, 32, W - 72, 'Linear gained +32pts share in 6mo while Coda declined. AI features driving switch.', 11, P.muted, { lh: 1.55 }),
      ], { x: 20, y: 280, w: W - 40, h: 68 }),

      text(20, 360, 200, 'CATEGORY MOVERS', 9, P.muted, { weight: 'semibold', ls: 1.2 }),

      ...[
        { cat: 'AI Features',      pct: 88, color: P.accent },
        { cat: 'Mobile Apps',      pct: 62, color: P.accent2 },
        { cat: 'Integrations',     pct: 74, color: P.green },
        { cat: 'Enterprise Deals', pct: 45, color: P.yellow },
      ].flatMap((item, i) => {
        const y = 378 + i * 52;
        const bw2 = W - 40 - 110 - 40;
        return [group([
          text(0, 0, 130, item.cat, 12, P.text, { weight: 'medium' }),
          text(W - 80, 0, 44, item.pct + '%', 12, item.color, { weight: 'bold', align: 'right' }),
          rect(0, 20, bw2, 6, P.border, { r: 3 }),
          rect(0, 20, bw2 * item.pct / 100, 6, item.color, { r: 3 }),
        ], { x: 20, y, w: W - 40, h: 36 })];
      }),

      bottomNav(3),
    ]
  };
}

// SCREEN 5 — Alerts
function screen5() {
  const alerts = [
    { icon: '◉', title: 'Pricing change detected', body: 'Linear raised prices 15% on Pro tier', time: '2h ago', color: P.red, bg: '#FFF4F4' },
    { icon: '◈', title: 'New competitor entered', body: 'Felt.app entered Dev Tools on G2', time: '6h ago', color: P.accent, bg: '#FFF6F2' },
    { icon: '◬', title: 'Share threshold crossed', body: 'Notion dropped below 30% — alert triggered', time: '1d ago', color: P.yellow, bg: '#FFFBF0' },
    { icon: '○', title: 'Weekly digest ready', body: '7-day intelligence report compiled', time: '2d ago', color: P.accent2, bg: '#EFF5FF' },
  ];

  return {
    id: 'screen5', name: 'Alerts', backgroundColor: P.bg,
    elements: [
      rect(0, 0, W, H, P.bg),
      statusBar(),
      text(20, 52, 200, 'Alerts', 22, P.text, { weight: 'bold', font: 'Georgia' }),
      text(20, 78, 260, '4 active · 0 snoozed', 12, P.muted),
      group([
        { id: id(), type: 'ellipse', x: 0, y: 0, width: 28, height: 28, backgroundColor: P.red, borderColor: 'transparent', borderWidth: 0 },
        text(0, 7, 28, '4', 12, '#FFFFFF', { weight: 'bold', align: 'center' })
      ], { x: W - 48, y: 56, w: 28, h: 28 }),
      divider(108),

      ...alerts.flatMap((a, i) => {
        const y = 116 + i * 96;
        return [group([
          rect(0, 0, W - 32, 86, a.bg, { r: 10, border: P.border, bw: 1 }),
          text(14, 14, 30, a.icon, 18, a.color, { weight: 'bold' }),
          text(50, 14, W - 120, a.title, 13, P.text, { weight: 'semibold' }),
          text(50, 34, W - 120, a.body, 11, P.muted, { lh: 1.5 }),
          text(W - 82, 14, 50, a.time, 10, P.muted, { align: 'right' }),
          group([
            rect(0, 0, 62, 24, 'transparent', { r: 6, border: P.border, bw: 1 }),
            text(0, 5, 62, 'Snooze', 10, P.muted, { align: 'center', weight: 'medium' })
          ], { x: W - 32 - 74, y: 54, w: 62, h: 24 }),
        ], { x: 16, y, w: W - 32, h: 86 })];
      }),

      group([
        rect(0, 0, W - 32, 44, P.card, { r: 10, border: P.border, bw: 1 }),
        text(0, 14, W - 32, '+ Create new alert', 13, P.accent, { align: 'center', weight: 'medium' })
      ], { x: 16, y: 116 + alerts.length * 96, w: W - 32, h: 44 }),

      bottomNav(4),
    ]
  };
}

// SCREEN 6 — Reports
function screen6() {
  return {
    id: 'screen6', name: 'Reports', backgroundColor: P.bg,
    elements: [
      rect(0, 0, W, H, P.bg),
      statusBar(),
      text(20, 52, 200, 'Reports', 22, P.text, { weight: 'bold', font: 'Georgia' }),
      text(20, 78, 260, 'Generated & shared', 12, P.muted),
      group([
        rect(0, 0, 88, 28, P.surface, { r: 14, border: P.border, bw: 1 }),
        text(0, 7, 88, '↑  Export all', 11, P.text, { align: 'center', weight: 'medium' })
      ], { x: W - 108, y: 56, w: 88, h: 28 }),
      divider(100),

      // Featured card
      group([
        rect(0, 0, W - 32, 120, P.accent, { r: 12 }),
        text(16, 16, W - 100, 'Weekly Digest', 12, 'rgba(255,255,255,0.7)', { weight: 'medium' }),
        text(16, 36, W - 48, 'March 31, 2026', 18, '#FFFFFF', { weight: 'bold', font: 'Georgia' }),
        text(16, 62, W - 48, '5 competitors · 24 signals · 3 alerts', 11, 'rgba(255,255,255,0.8)'),
        group([
          rect(0, 0, 80, 28, '#FFFFFF', { r: 14 }),
          text(0, 8, 80, 'View report', 11, P.accent, { align: 'center', weight: 'semibold' })
        ], { x: W - 32 - 96, y: 84, w: 80, h: 28 }),
      ], { x: 16, y: 110, w: W - 32, h: 120 }),

      text(20, 246, 200, 'PAST REPORTS', 9, P.muted, { weight: 'semibold', ls: 1.2 }),

      ...[
        { icon: '⚔', title: 'Linear Battle Card', date: 'Mar 28', pages: '4 pages' },
        { icon: '◎', title: 'Q1 Market Snapshot', date: 'Mar 25', pages: '28 pages' },
        { icon: '◆', title: 'Pricing Intelligence', date: 'Mar 20', pages: '8 pages' },
      ].flatMap((r, i) => {
        const y = 264 + i * 72;
        return [group([
          rect(0, 0, W - 32, 62, P.card, { r: 10, border: P.border, bw: 1 }),
          text(12, 20, 32, r.icon, 18, P.muted),
          text(50, 10, W - 160, r.title, 13, P.text, { weight: 'semibold' }),
          text(50, 30, 160, r.date + ' · ' + r.pages, 11, P.muted),
          group([
            rect(0, 0, 52, 22, P.border, { r: 11 }),
            text(0, 4, 52, '↓ PDF', 10, P.text, { align: 'center', weight: 'medium' })
          ], { x: W - 32 - 68, y: 18, w: 52, h: 22 }),
        ], { x: 16, y, w: W - 32, h: 62 })];
      }),

      group([
        rect(0, 0, W - 32, 48, P.surface, { r: 10, border: P.border, bw: 1 }),
        text(16, 15, W - 64, '✦  Unlimited reports with Pro', 12, P.text, { weight: 'medium' }),
      ], { x: 16, y: H - 66 - 60, w: W - 32, h: 48 }),

      bottomNav(4),
    ]
  };
}

const pen = {
  version: '2.8',
  meta: {
    name: 'Drift — Market Intelligence',
    description: 'Light editorial SaaS dashboard for competitive intelligence',
    author: 'RAM Design Heartbeat',
    createdAt: new Date().toISOString(),
    theme: 'light',
  },
  canvas: { width: W, height: H },
  screens: [ screen1(), screen2(), screen3(), screen4(), screen5(), screen6() ],
};

fs.writeFileSync('drift.pen', JSON.stringify(pen, null, 2));
console.log('✓ drift.pen —', pen.screens.length, 'screens');
