/**
 * CADENCE — Map Your Peak Hours
 * A personal cognitive rhythm & focus tracker
 *
 * Inspired by:
 * - NEON on darkmodedesign.com: data-visualization-as-hero (glowing bar grids)
 * - Litbix on minimal.gallery: floating spatial card UI components
 * - Superpower on godly.website: warm editorial warmth + human data
 *
 * Light theme, warm cream palette with amber accents
 */

const fs = require('fs');
const path = require('path');

const SLUG = 'cadence';
const APP_NAME = 'CADENCE';
const TAGLINE = 'Map your peak hours';
const VERSION = '2.8';

// ─── Palette ────────────────────────────────────────────────────────────────
const P = {
  cream:    '#F6F3ED',
  white:    '#FFFFFF',
  ink:      '#1C1A16',
  inkFaded: 'rgba(28,26,22,0.45)',
  amber:    '#D4830A',
  amberSoft:'#F0A830',
  indigo:   '#3B4EDF',
  surface:  '#FFFFFF',
  border:   'rgba(28,26,22,0.10)',
  low:      '#E8F5E1',   // low intensity
  mid:      '#FDE8A0',   // mid intensity
  high:     '#FBBF4A',   // high intensity
  peak:     '#D4830A',   // peak intensity
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const rect = (x,y,w,h,fill,opts={}) => ({
  type:'rect', x,y,w,h, fill,
  rx: opts.rx ?? 0,
  ry: opts.ry ?? 0,
  opacity: opts.opacity ?? 1,
  shadow: opts.shadow ?? false,
});

const text = (x,y,content,opts={}) => ({
  type:'text', x,y,
  text: content,
  fontSize: opts.size ?? 14,
  fontWeight: opts.weight ?? 400,
  fontFamily: opts.family ?? 'Inter',
  fill: opts.fill ?? P.ink,
  align: opts.align ?? 'left',
  opacity: opts.opacity ?? 1,
});

const circle = (cx,cy,r,fill,opts={}) => ({
  type:'circle', cx,cy,r, fill,
  opacity: opts.opacity ?? 1,
  stroke: opts.stroke,
  strokeWidth: opts.sw ?? 0,
});

const line = (x1,y1,x2,y2,stroke,sw=1,opts={}) => ({
  type:'line', x1,y1,x2,y2, stroke,
  strokeWidth: sw,
  opacity: opts.opacity ?? 1,
  dashArray: opts.dash,
});

// ─── Shared UI components ────────────────────────────────────────────────────

function navbar(label) {
  return [
    // Nav background
    rect(0,0,390,56, P.cream),
    // Status bar dots
    text(20, 17, '9:41', { size:12, weight:600 }),
    text(360, 17, '●●●', { size:10, fill: P.inkFaded }),
    // App name
    text(20, 40, 'CADENCE', { size:13, weight:700, fill: P.amber }),
    // Screen label right
    text(390-20, 40, label, { size:12, fill: P.inkFaded, align:'right' }),
    // Bottom border
    line(0,56,390,56, P.border, 1),
  ];
}

function bottomNav(activeIdx) {
  const tabs = [
    { icon:'◎', label:'Today' },
    { icon:'⏱', label:'Focus' },
    { icon:'▦', label:'Patterns' },
    { icon:'✦', label:'Insights' },
  ];
  const els = [
    rect(0,780,390,68, P.white),
    line(0,780,390,780, P.border, 1),
  ];
  tabs.forEach((tab, i) => {
    const x = 48 + i * 74;
    const isActive = i === activeIdx;
    els.push(
      text(x, 808, tab.icon, { size:18, fill: isActive ? P.amber : P.inkFaded, align:'center' }),
      text(x, 826, tab.label, { size:10, weight: isActive ? 600 : 400, fill: isActive ? P.amber : P.inkFaded, align:'center' })
    );
  });
  return els;
}

// ─── Screen 1: TODAY ─────────────────────────────────────────────────────────
function screenToday() {
  const els = [
    rect(0, 0, 390, 848, P.cream),
    ...navbar('Today'),

    // Greeting header
    text(24, 80, 'Monday, March 30', { size:12, fill: P.inkFaded }),
    text(24, 103, 'Your rhythm today', { size:22, weight:700 }),

    // Score pill
    rect(24, 120, 86, 28, P.amber, { rx:14 }),
    text(67, 139, '84 / 100', { size:12, weight:700, fill: P.white, align:'center' }),

    // Hourly rhythm grid — the hero visualization
    // Inspired by NEON on darkmodedesign.com
    text(24, 168, 'Focus rhythm — last 12 hours', { size:11, fill: P.inkFaded }),
  ];

  // Hourly bars (6am to 5pm — 12 bars)
  const hours = ['6','7','8','9','10','11','12','1','2','3','4','5'];
  const intensities = [0.15, 0.25, 0.75, 0.95, 0.90, 0.85, 0.35, 0.55, 0.88, 0.92, 0.60, 0.20];
  const barColors = intensities.map(v => {
    if (v < 0.3) return P.low;
    if (v < 0.6) return P.mid;
    if (v < 0.85) return P.high;
    return P.peak;
  });
  const barW = 24;
  const barGap = 8;
  const maxH = 80;
  const barBaseY = 275;

  hours.forEach((h, i) => {
    const bh = Math.max(6, Math.round(intensities[i] * maxH));
    const bx = 24 + i * (barW + barGap);
    const by = barBaseY - bh;
    els.push(
      rect(bx, by, barW, bh, barColors[i], { rx:5 }),
      text(bx + barW/2, barBaseY + 13, h, { size:9, fill: P.inkFaded, align:'center' }),
    );
  });

  // Legend
  els.push(
    rect(24,  293, 10, 10, P.low,  { rx:2 }), text(38,  302, 'Rest',   { size:9, fill: P.inkFaded }),
    rect(74,  293, 10, 10, P.mid,  { rx:2 }), text(88,  302, 'Warm',   { size:9, fill: P.inkFaded }),
    rect(124, 293, 10, 10, P.high, { rx:2 }), text(138, 302, 'Flow',   { size:9, fill: P.inkFaded }),
    rect(174, 293, 10, 10, P.peak, { rx:2 }), text(188, 302, 'Peak',   { size:9, fill: P.inkFaded }),
  );

  // Current status card — floating card inspired by Litbix
  els.push(
    rect(24, 316, 342, 80, P.white, { rx:16, shadow:true }),
    circle(52, 356, 16, P.amberSoft, { opacity:0.2 }),
    text(52, 360, '⏱', { size:16, align:'center' }),
    text(80, 345, 'Currently in Flow', { size:14, weight:600 }),
    text(80, 366, '2h 14m this session · 5 sessions today', { size:11, fill: P.inkFaded }),
    // Small end session button
    rect(272, 343, 78, 26, P.ink, { rx:13 }),
    text(311, 361, 'End session', { size:10, weight:600, fill: P.white, align:'center' }),
  );

  // Today's stats — 3 metric cards
  const stats = [
    { label:'Deep Focus', val:'4.2h', sub:'+18%' },
    { label:'Sessions', val:'5', sub:'avg 50m' },
    { label:'Peak Hour', val:'3pm', sub:'89/100' },
  ];
  const cardW = 105;
  stats.forEach((s, i) => {
    const cx = 24 + i * (cardW + 9);
    els.push(
      rect(cx, 412, cardW, 80, P.white, { rx:14, shadow:true }),
      text(cx + cardW/2, 444, s.val, { size:22, weight:700, align:'center', fill: P.ink }),
      text(cx + cardW/2, 465, s.label, { size:10, fill: P.inkFaded, align:'center' }),
      text(cx + cardW/2, 480, s.sub, { size:10, weight:600, align:'center', fill: P.amber }),
    );
  });

  // Recent sessions list
  els.push(
    text(24, 514, 'Recent sessions', { size:13, weight:600 }),
  );
  const sessions = [
    { name:'Deep Work', dur:'1h 22m', score:92, tag:'Peak' },
    { name:'Code Review', dur:'48m', score:71, tag:'Flow' },
    { name:'Design', dur:'55m', score:88, tag:'Peak' },
  ];
  sessions.forEach((s, i) => {
    const sy = 532 + i * 56;
    const tagColor = s.tag === 'Peak' ? P.peak : P.high;
    els.push(
      rect(24, sy, 342, 48, P.white, { rx:12, shadow:true }),
      text(24+14, sy+16, s.name, { size:13, weight:600 }),
      text(24+14, sy+33, s.dur, { size:11, fill: P.inkFaded }),
      // Score badge
      rect(310, sy+12, 44, 22, tagColor, { rx:11 }),
      text(332, sy+27, s.score + '', { size:11, weight:700, fill:P.white, align:'center' }),
    );
  });

  els.push(...bottomNav(0));
  return els;
}

// ─── Screen 2: FOCUS SESSION ──────────────────────────────────────────────────
function screenFocus() {
  const els = [
    rect(0, 0, 390, 848, P.cream),
    ...navbar('Focus'),

    text(24, 80, 'Start a focus session', { size:22, weight:700 }),
    text(24, 108, 'Choose your intensity target', { size:13, fill: P.inkFaded }),
  ];

  // Big timer ring
  const cx = 195, cy = 280, r = 90;
  els.push(
    circle(cx, cy, r+8, P.border.replace('0.10','0.06')),
    circle(cx, cy, r, '#FDF8EE'),
    // Ring arc (simulate with thick stroke circle — encoded as arc placeholder)
    { type:'arc', cx, cy, r, startAngle:0, endAngle: 270, stroke: P.amber, strokeWidth:8, fill:'none' },
    text(cx, cy-8, '25:00', { size:36, weight:700, align:'center', fill: P.ink }),
    text(cx, cy+20, 'FOCUS', { size:12, weight:600, align:'center', fill: P.inkFaded }),
  );

  // Intensity selector
  els.push(
    text(24, 398, 'Intensity', { size:13, weight:600 }),
  );
  const levels = [
    { label:'Light', desc:'Emails, admin', color: P.low },
    { label:'Flow', desc:'Creative work', color: P.high },
    { label:'Deep', desc:'Complex thinking', color: P.peak },
  ];
  levels.forEach((lv, i) => {
    const lx = 24 + i * 118;
    const isActive = i === 1;
    els.push(
      rect(lx, 416, 108, 72, isActive ? lv.color : P.white, { rx:14, shadow:true }),
      text(lx + 54, 440, lv.label, { size:13, weight:700, align:'center', fill: isActive ? P.ink : P.inkFaded }),
      text(lx + 54, 460, lv.desc, { size:10, align:'center', fill: isActive ? P.ink : P.inkFaded, opacity: isActive ? 0.8 : 0.55 }),
    );
    if (isActive) {
      els.push(
        circle(lx+54, 480, 4, P.amber),
      );
    }
  });

  // Duration selector
  els.push(
    text(24, 510, 'Duration', { size:13, weight:600 }),
  );
  const durations = ['15m','25m','45m','90m'];
  durations.forEach((d, i) => {
    const dx = 24 + i * 84;
    const isActive = i === 1;
    els.push(
      rect(dx, 528, 72, 36, isActive ? P.ink : P.white, { rx:18, shadow:!isActive }),
      text(dx+36, 551, d, { size:13, weight:600, align:'center', fill: isActive ? P.white : P.inkFaded }),
    );
  });

  // Environment tags
  els.push(
    text(24, 588, 'Environment', { size:13, weight:600 }),
  );
  const envs = ['Quiet','Music','Café','Nature'];
  let ex = 24;
  envs.forEach((e, i) => {
    const isActive = i === 0;
    const tw = e.length * 7 + 24;
    els.push(
      rect(ex, 606, tw, 30, isActive ? P.amber : P.white, { rx:15, shadow:!isActive }),
      text(ex + tw/2, 626, e, { size:11, weight:600, align:'center', fill: isActive ? P.white : P.inkFaded }),
    );
    ex += tw + 10;
  });

  // Start button
  els.push(
    rect(24, 660, 342, 56, P.ink, { rx:28 }),
    text(195, 694, 'Start Session', { size:16, weight:700, fill: P.white, align:'center' }),
  );

  // Insight chip
  els.push(
    rect(24, 732, 342, 36, P.amberSoft, { rx:18, opacity:0.2 }),
    text(195, 754, '✦ You typically peak around 3pm — optimal time now', { size:11, fill: P.amber, align:'center' }),
  );

  els.push(...bottomNav(1));
  return els;
}

// ─── Screen 3: PATTERNS (HEATMAP) ────────────────────────────────────────────
function screenPatterns() {
  const els = [
    rect(0, 0, 390, 848, P.cream),
    ...navbar('Patterns'),

    text(24, 80, 'Weekly patterns', { size:22, weight:700 }),
    text(24, 108, 'Your focus rhythm over 7 days', { size:13, fill: P.inkFaded }),
  ];

  // Week selector
  const weeks = ['This week','Last week','Last 30d'];
  let wx = 24;
  weeks.forEach((w, i) => {
    const isActive = i === 0;
    const tw = w.length * 7 + 24;
    els.push(
      rect(wx, 126, tw, 28, isActive ? P.ink : P.white, { rx:14 }),
      text(wx + tw/2, 145, w, { size:11, weight:600, align:'center', fill: isActive ? P.white : P.inkFaded }),
    );
    wx += tw + 8;
  });

  // Heatmap grid — 7 days × 12 hours
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  // hour labels
  const hourLabels = ['6','8','10','12','2','4','6'];
  const heatData = [
    [0.1,0.2,0.8,0.9,0.85,0.7,0.3,0.5,0.88,0.92,0.6,0.2],
    [0.1,0.3,0.7,0.88,0.9,0.75,0.4,0.6,0.85,0.88,0.5,0.15],
    [0.05,0.1,0.6,0.85,0.8,0.65,0.2,0.45,0.75,0.82,0.4,0.1],
    [0.1,0.25,0.78,0.92,0.88,0.72,0.38,0.58,0.90,0.95,0.62,0.18],
    [0.1,0.2,0.72,0.82,0.78,0.65,0.35,0.52,0.80,0.88,0.55,0.2],
    [0.05,0.05,0.2,0.35,0.3,0.25,0.15,0.2,0.3,0.28,0.15,0.1],
    [0.05,0.05,0.1,0.15,0.12,0.1,0.08,0.1,0.12,0.1,0.08,0.05],
  ];
  const cellW = 26, cellH = 26, gap = 3;
  const gridX = 56, gridY = 175;

  // Day labels (left)
  days.forEach((d, i) => {
    els.push(text(gridX - 8, gridY + i*(cellH+gap) + 18, d, { size:9, fill: P.inkFaded, align:'right' }));
  });

  // Hour labels (top)
  hourLabels.forEach((h, i) => {
    els.push(text(gridX + i*2*(cellW+gap) + cellW/2, gridY - 6, h, { size:9, fill: P.inkFaded, align:'center' }));
  });

  heatData.forEach((row, di) => {
    row.forEach((v, hi) => {
      const cx = gridX + hi * (cellW+gap);
      const cy = gridY + di * (cellH+gap);
      let fill = P.low;
      if (v < 0.1) fill = P.border;
      else if (v < 0.35) fill = P.low;
      else if (v < 0.65) fill = P.mid;
      else if (v < 0.85) fill = P.high;
      else fill = P.peak;
      els.push(rect(cx, cy, cellW, cellH, fill, { rx:5 }));
    });
  });

  // Insight card below heatmap
  const gridBottom = gridY + 7*(cellH+gap) + 16;
  els.push(
    rect(24, gridBottom, 342, 76, P.white, { rx:16, shadow:true }),
    text(24+14, gridBottom+16, '✦ Pattern detected', { size:12, weight:600, fill: P.amber }),
    text(24+14, gridBottom+36, 'You enter deep flow 9–11am & 3–4pm daily.', { size:12, fill: P.ink }),
    text(24+14, gridBottom+55, 'Tues/Thurs are your strongest days.', { size:12, fill: P.inkFaded }),
  );

  // Summary stats row
  const statsY = gridBottom + 96;
  const statItems = [
    { label:'Peak day', val:'Thursday' },
    { label:'Best hour', val:'3pm' },
    { label:'Avg score', val:'86.4' },
  ];
  statItems.forEach((s, i) => {
    const sx = 24 + i * 118;
    els.push(
      rect(sx, statsY, 108, 64, P.white, { rx:14, shadow:true }),
      text(sx+54, statsY+28, s.val, { size:16, weight:700, align:'center' }),
      text(sx+54, statsY+48, s.label, { size:10, fill: P.inkFaded, align:'center' }),
    );
  });

  els.push(...bottomNav(2));
  return els;
}

// ─── Screen 4: INSIGHTS ───────────────────────────────────────────────────────
function screenInsights() {
  const els = [
    rect(0, 0, 390, 848, P.cream),
    ...navbar('Insights'),

    text(24, 80, 'Your insights', { size:22, weight:700 }),
    text(24, 108, 'Patterns from your last 30 days', { size:13, fill: P.inkFaded }),
  ];

  const insights = [
    {
      icon:'⚡',
      iconBg: P.amberSoft,
      title:'Peak window identified',
      body:'3–5pm is your highest-focus window, averaging 91/100. Schedule your hardest problems here.',
      tag:'Timing',
    },
    {
      icon:'📈',
      iconBg: '#D4F4E0',
      title:'Momentum trend',
      body:'Your focus scores have improved 14% this month. Your sessions are also 8 minutes longer on average.',
      tag:'Progress',
    },
    {
      icon:'⚠',
      iconBg: '#FDE8A0',
      title:'Mid-day dip',
      body:'12–2pm consistently scores under 40. Consider short breaks or light tasks in this window.',
      tag:'Warning',
    },
    {
      icon:'🔁',
      iconBg: '#E8EAF6',
      title:'Rhythm consistency',
      body:'You start strong Mon–Thurs but Friday scores drop 22%. Protecting your energy mid-week pays off.',
      tag:'Pattern',
    },
  ];

  insights.forEach((ins, i) => {
    const iy = 132 + i * 148;
    els.push(
      rect(24, iy, 342, 132, P.white, { rx:16, shadow:true }),
      // Icon
      rect(24+14, iy+14, 40, 40, ins.iconBg, { rx:12 }),
      text(44, iy+40, ins.icon, { size:18, align:'center' }),
      // Tag pill
      rect(310, iy+14, 44, 22, P.ink, { rx:11 }),
      text(332, iy+29, ins.tag, { size:9, weight:600, fill: P.white, align:'center' }),
      // Title
      text(24+66, iy+28, ins.title, { size:13, weight:700 }),
      // Body
      text(24+14, iy+72, ins.body, { size:11, fill: P.inkFaded }),
    );
  });

  els.push(...bottomNav(3));
  return els;
}

// ─── Screen 5: PROFILE / STREAK ──────────────────────────────────────────────
function screenProfile() {
  const els = [
    rect(0, 0, 390, 848, P.cream),
    ...navbar('Profile'),
  ];

  // Avatar area
  els.push(
    circle(195, 108, 44, P.white),
    circle(195, 108, 44, P.amber, { opacity: 0.15 }),
    text(195, 116, 'AK', { size:22, weight:700, align:'center', fill: P.amber }),
    text(195, 168, 'Alex Kim', { size:18, weight:700, align:'center' }),
    text(195, 190, '87 day streak  🔥', { size:13, align:'center', fill: P.amber }),
  );

  // Lifetime stats
  const lifetimeStats = [
    { label:'Total Focus', val:'312h' },
    { label:'Sessions', val:'486' },
    { label:'Peak Score', val:'98' },
    { label:'Best Streak', val:'31d' },
  ];
  lifetimeStats.forEach((s, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const sx = 24 + col * 175;
    const sy = 210 + row * 84;
    els.push(
      rect(sx, sy, 162, 72, P.white, { rx:14, shadow:true }),
      text(sx+81, sy+32, s.val, { size:22, weight:700, align:'center' }),
      text(sx+81, sy+54, s.label, { size:10, fill: P.inkFaded, align:'center' }),
    );
  });

  // Badges
  els.push(
    text(24, 386, 'Badges earned', { size:13, weight:600 }),
  );
  const badges = ['🏆','⚡','🔥','🌊','🧠','⭐'];
  badges.forEach((b, i) => {
    const bx = 24 + i * 58;
    els.push(
      rect(bx, 404, 48, 48, P.white, { rx:14, shadow:true }),
      text(bx+24, 434, b, { size:22, align:'center' }),
    );
  });

  // Settings options
  els.push(
    text(24, 472, 'Settings', { size:13, weight:600 }),
  );
  const settings = [
    { label:'Notifications', sub:'Daily rhythm report at 6am' },
    { label:'Focus goals', sub:'4h deep work · 6 sessions' },
    { label:'Integrations', sub:'Calendar · Spotify connected' },
    { label:'Theme', sub:'Light mode active' },
  ];
  settings.forEach((s, i) => {
    const sy = 492 + i * 60;
    els.push(
      rect(24, sy, 342, 52, P.white, { rx:14, shadow:true }),
      text(24+14, sy+18, s.label, { size:13, weight:600 }),
      text(24+14, sy+35, s.sub, { size:11, fill: P.inkFaded }),
      text(366, sy+30, '›', { size:18, fill: P.inkFaded, align:'right' }),
    );
  });

  els.push(...bottomNav(-1));
  return els;
}

// ─── Assemble .pen file ───────────────────────────────────────────────────────
const screens = [
  { id:'today',    label:'Today',    bg: P.cream, elements: screenToday() },
  { id:'focus',    label:'Focus',    bg: P.cream, elements: screenFocus() },
  { id:'patterns', label:'Patterns', bg: P.cream, elements: screenPatterns() },
  { id:'insights', label:'Insights', bg: P.cream, elements: screenInsights() },
  { id:'profile',  label:'Profile',  bg: P.cream, elements: screenProfile() },
];

const pen = {
  version: VERSION,
  meta: {
    name: APP_NAME,
    tagline: TAGLINE,
    slug: SLUG,
    theme: 'light',
    palette: {
      primary:    P.amber,
      secondary:  P.indigo,
      background: P.cream,
      surface:    P.white,
      text:       P.ink,
    },
    createdAt: new Date().toISOString(),
    author: 'RAM Design Heartbeat',
  },
  artboards: screens.map((s, idx) => ({
    id:     s.id,
    name:   s.label,
    width:  390,
    height: 848,
    index:  idx,
    background: s.bg,
    elements: s.elements,
  })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ ${APP_NAME} .pen saved → ${outPath}`);
console.log(`  Screens: ${screens.length}`);
console.log(`  Elements total: ${screens.reduce((t,s)=>t+s.elements.length,0)}`);
