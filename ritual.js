// RITUAL — where drops meet discipline
// Inspired by: Deon Libra (land-book.com) drop culture wellness brand aesthetic
// + The Lookback SOTD (awwwards.com) bold condensed editorial typography
// Dark theme: near-black + warm amber + blood orange + off-white
// v2.8 pen generator

const fs = require('fs');

const W = 390, H = 844;
let id = 1;
const nid = () => `n${id++}`;

function rect(x, y, w, h, fill, opts = {}) {
  return { id: nid(), type: 'rect', x, y, w, h, fill, radius: opts.radius || 0, opacity: opts.opacity || 1, children: [] };
}
function text(x, y, value, fontSize, color, opts = {}) {
  return { id: nid(), type: 'text', x, y, value, fontSize, color,
    fontWeight: opts.weight || 400, fontFamily: opts.family || 'Inter',
    letterSpacing: opts.ls || 0, lineHeight: opts.lh || 1.2, align: opts.align || 'left' };
}
function group(x, y, children) {
  return { id: nid(), type: 'group', x, y, children };
}
function circle(cx, cy, r, fill, opts = {}) {
  return { id: nid(), type: 'circle', cx, cy, r, fill, opacity: opts.opacity || 1 };
}
function line(x1, y1, x2, y2, color, opts = {}) {
  return { id: nid(), type: 'line', x1, y1, x2, y2, color, width: opts.width || 1, opacity: opts.opacity || 1 };
}

// PALETTE — dark editorial drop culture
const C = {
  bg: '#0C0A08',
  surface: '#141210',
  panel: '#1A1714',
  amber: '#E8843A',
  coral: '#FF4D2E',
  gold: '#C9963A',
  white: '#F0EBE3',
  muted: 'rgba(240,235,227,0.45)',
  dim: 'rgba(240,235,227,0.18)',
  rule: 'rgba(240,235,227,0.10)',
  tag: '#2A2420',
};

// ─── SCREEN 1: TODAY'S DROP ───────────────────────────────────────────────────
function screenTodayDrop() {
  const children = [];

  // bg
  children.push(rect(0, 0, W, H, C.bg));

  // top status bar
  children.push(text(20, 16, '9:41', 12, C.muted, { weight: 500 }));
  children.push(text(340, 16, '●●●', 12, C.muted));

  // nav label
  children.push(text(20, 52, 'TODAY', 10, C.amber, { weight: 700, ls: 3 }));
  // notification dot
  children.push(circle(359, 57, 4, C.coral));

  // HERO — big drop headline
  // amber accent bar
  children.push(rect(20, 74, 4, 72, C.amber));
  children.push(text(34, 74, 'DROP\nNO.031', 52, C.white, { weight: 900, family: 'Inter', lh: 0.92 }));
  children.push(text(34, 152, 'OPENS IN 2H 14M', 11, C.amber, { weight: 700, ls: 2 }));

  // drop card — full bleed editorial
  children.push(rect(20, 176, W - 40, 200, C.panel, { radius: 4 }));
  // large product visual placeholder (dark textured rect)
  children.push(rect(20, 176, W - 40, 140, '#1E1916', { radius: 4 }));
  // product label overlay
  children.push(rect(20, 176, 90, 22, C.coral));
  children.push(text(27, 181, 'EXCLUSIVE', 9, C.white, { weight: 800, ls: 2 }));
  // product name big
  children.push(text(28, 200, 'OBSIDIAN\nRUNNER', 32, C.white, { weight: 900, lh: 0.9 }));
  children.push(text(28, 264, 'MIDNIGHT COLORWAY', 9, C.amber, { weight: 700, ls: 2 }));
  // price + cta row
  children.push(text(28, 290, '$185', 20, C.white, { weight: 800 }));
  children.push(rect(W - 40 - 90, 284, 90, 32, C.amber, { radius: 2 }));
  children.push(text(W - 40 - 78, 295, 'NOTIFY ME', 9, C.bg, { weight: 800, ls: 1 }));

  // ritual check-ins section
  children.push(text(20, 392, 'YOUR RITUALS TODAY', 10, C.muted, { weight: 700, ls: 2 }));
  children.push(line(20, 407, W - 20, 407, C.rule));

  const rituals = [
    { label: 'Morning Run', status: 'done', detail: '5.2km · 28min' },
    { label: 'Cold Plunge', status: 'done', detail: '3 min' },
    { label: 'Breathwork', status: 'open', detail: '10 min session' },
    { label: 'Strength', status: 'open', detail: '45 min' },
  ];
  rituals.forEach((r, i) => {
    const y = 416 + i * 52;
    const done = r.status === 'done';
    children.push(rect(20, y, W - 40, 44, done ? '#16140F' : C.surface, { radius: 4 }));
    // check indicator
    children.push(circle(40, y + 22, 8, done ? C.amber : C.tag));
    if (done) children.push(text(36, y + 17, '✓', 10, C.bg, { weight: 900 }));
    children.push(text(58, y + 11, r.label, 14, done ? C.white : C.muted, { weight: done ? 700 : 400 }));
    children.push(text(58, y + 27, r.detail, 11, C.muted));
    if (!done) {
      children.push(rect(W - 60, y + 12, 42, 20, C.tag, { radius: 10 }));
      children.push(text(W - 54, y + 18, 'START', 8, C.amber, { weight: 700, ls: 1 }));
    }
  });

  // streak badge
  children.push(rect(20, 632, W - 40, 48, C.panel, { radius: 4 }));
  children.push(text(28, 644, '🔥', 18));
  children.push(text(54, 644, '14-DAY STREAK', 12, C.white, { weight: 800 }));
  children.push(text(54, 660, 'Keep it going — rituals build empires', 10, C.muted));
  children.push(rect(W - 60, 648, 38, 20, C.amber, { radius: 2 }));
  children.push(text(W - 54, 654, 'SHARE', 8, C.bg, { weight: 800, ls: 1 }));

  // bottom nav
  children.push(rect(0, H - 72, W, 72, C.surface));
  children.push(line(0, H - 72, W, H - 72, C.rule));
  const navItems = ['DROP', 'RITUALS', 'CALENDAR', 'PROFILE'];
  const navIcons = ['●', '◇', '▦', '○'];
  navItems.forEach((label, i) => {
    const nx = 20 + i * 88;
    const active = i === 0;
    children.push(text(nx + 12, H - 58, navIcons[i], 14, active ? C.amber : C.dim));
    children.push(text(nx + 4, H - 38, label, 8, active ? C.amber : C.muted, { weight: active ? 700 : 400, ls: 1 }));
    if (active) children.push(rect(nx, H - 4, 44, 2, C.amber));
  });

  return { id: nid(), type: 'frame', x: 0, y: 0, w: W, h: H, fill: C.bg, name: "Today's Drop", children };
}

// ─── SCREEN 2: MY RITUALS ─────────────────────────────────────────────────────
function screenRituals() {
  const children = [];
  children.push(rect(0, 0, W, H, C.bg));
  children.push(text(20, 16, '9:41', 12, C.muted, { weight: 500 }));

  // Header
  children.push(rect(20, 74, 4, 42, C.coral));
  children.push(text(34, 74, 'MY\nRITUALS', 34, C.white, { weight: 900, lh: 0.9 }));
  children.push(text(34, 122, '7 ACTIVE · 2 SUSPENDED', 10, C.muted, { weight: 600, ls: 2 }));

  // streak metrics row
  children.push(rect(20, 144, W - 40, 68, C.panel, { radius: 4 }));
  const metrics = [
    { v: '14', l: 'STREAK\nDAYS' },
    { v: '92%', l: 'COMPLETION\nRATE' },
    { v: '189', l: 'TOTAL\nSESSIONS' },
  ];
  metrics.forEach((m, i) => {
    const mx = 32 + i * 116;
    children.push(text(mx, 156, m.v, 24, i === 1 ? C.amber : C.white, { weight: 900 }));
    children.push(text(mx, 186, m.l, 8, C.muted, { weight: 600, ls: 1, lh: 1.3 }));
    if (i < 2) children.push(line(mx + 90, 158, mx + 90, 198, C.rule));
  });

  // ritual stack
  children.push(text(20, 228, 'MORNING STACK', 10, C.amber, { weight: 700, ls: 2 }));
  children.push(line(20, 242, W - 20, 242, C.rule));

  const ritualCards = [
    { name: 'Cold Plunge', days: 'MON WED FRI SUN', streak: 14, color: C.amber, pct: 92 },
    { name: 'Morning Run', days: 'DAILY', streak: 14, color: C.coral, pct: 87 },
    { name: 'Breathwork', days: 'MON–FRI', streak: 6, color: '#7B9EFF', pct: 65 },
  ];
  ritualCards.forEach((rc, i) => {
    const y = 250 + i * 96;
    children.push(rect(20, y, W - 40, 84, C.surface, { radius: 4 }));
    children.push(rect(20, y, 3, 84, rc.color, { radius: 4 }));
    children.push(text(34, y + 12, rc.name, 15, C.white, { weight: 700 }));
    children.push(text(34, y + 32, rc.days, 9, C.muted, { weight: 600, ls: 1.5 }));
    // progress bar
    children.push(rect(34, y + 52, W - 80, 4, C.tag, { radius: 2 }));
    children.push(rect(34, y + 52, Math.round((W - 80) * rc.pct / 100), 4, rc.color, { radius: 2 }));
    children.push(text(W - 52, y + 46, `${rc.pct}%`, 10, rc.color, { weight: 700 }));
    // streak badge
    children.push(rect(W - 72, y + 10, 52, 18, C.tag, { radius: 9 }));
    children.push(text(W - 66, y + 16, `🔥 ${rc.streak}d`, 9, C.amber, { weight: 700 }));
  });

  // evening stack
  children.push(text(20, 544, 'EVENING STACK', 10, C.amber, { weight: 700, ls: 2 }));
  children.push(line(20, 558, W - 20, 558, C.rule));
  const eveningRituals = [
    { name: 'Strength Training', detail: '3×/week · 45min', pct: 78 },
    { name: 'Gratitude Journal', detail: 'Daily · 5min', pct: 95 },
    { name: 'Screen Cutoff', detail: 'Daily · 10PM', pct: 60 },
  ];
  eveningRituals.forEach((er, i) => {
    const y = 564 + i * 48;
    children.push(rect(20, y, W - 40, 40, C.panel, { radius: 4 }));
    children.push(text(30, y + 10, er.name, 13, C.white, { weight: 600 }));
    children.push(text(30, y + 25, er.detail, 9, C.muted));
    children.push(text(W - 50, y + 13, `${er.pct}%`, 11, er.pct > 80 ? C.amber : C.muted, { weight: 700 }));
  });

  // bottom nav
  children.push(rect(0, H - 72, W, 72, C.surface));
  children.push(line(0, H - 72, W, H - 72, C.rule));
  const navItems = ['DROP', 'RITUALS', 'CALENDAR', 'PROFILE'];
  const navIcons = ['●', '◇', '▦', '○'];
  navItems.forEach((label, i) => {
    const nx = 20 + i * 88;
    const active = i === 1;
    children.push(text(nx + 12, H - 58, navIcons[i], 14, active ? C.amber : C.dim));
    children.push(text(nx + 4, H - 38, label, 8, active ? C.amber : C.muted, { weight: active ? 700 : 400, ls: 1 }));
    if (active) children.push(rect(nx, H - 4, 44, 2, C.amber));
  });

  return { id: nid(), type: 'frame', x: W + 40, y: 0, w: W, h: H, fill: C.bg, name: 'My Rituals', children };
}

// ─── SCREEN 3: DROP CALENDAR ──────────────────────────────────────────────────
function screenCalendar() {
  const children = [];
  children.push(rect(0, 0, W, H, C.bg));
  children.push(text(20, 16, '9:41', 12, C.muted, { weight: 500 }));

  children.push(rect(20, 74, 4, 42, C.gold));
  children.push(text(34, 74, 'DROP\nCAL', 34, C.white, { weight: 900, lh: 0.9 }));
  children.push(text(34, 122, 'MARCH 2026', 10, C.muted, { weight: 700, ls: 3 }));

  // Calendar grid header
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  days.forEach((d, i) => {
    children.push(text(24 + i * 50, 148, d, 11, C.muted, { weight: 700 }));
  });
  children.push(line(20, 164, W - 20, 164, C.rule));

  // Calendar grid — 5 rows × 7 days
  const dropDays = [3, 10, 17, 22, 27, 31]; // days with drops
  const todayDay = 27;
  let dayNum = 1;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 7; col++) {
      if (dayNum > 31) break;
      const cx = 28 + col * 50;
      const cy = 174 + row * 44;
      const hasDrop = dropDays.includes(dayNum);
      const isToday = dayNum === todayDay;
      if (isToday) {
        children.push(rect(cx - 12, cy - 10, 28, 28, C.amber, { radius: 14 }));
        children.push(text(cx, cy + 2, String(dayNum), 12, C.bg, { weight: 900, align: 'center' }));
      } else if (hasDrop) {
        children.push(text(cx, cy + 2, String(dayNum), 12, C.coral, { weight: 700 }));
        children.push(circle(cx + 6, cy + 18, 2, C.coral));
      } else {
        children.push(text(cx, cy + 2, String(dayNum), 12, C.muted));
      }
      dayNum++;
    }
  }

  // upcoming drops list
  children.push(line(20, 394, W - 20, 394, C.rule));
  children.push(text(20, 402, 'UPCOMING DROPS', 10, C.amber, { weight: 700, ls: 2 }));

  const upcomingDrops = [
    { date: 'MAR 31', name: 'PHANTOM SLIDE', brand: 'RITUAL COLLAB', time: '10:00 AM EST', limited: true },
    { date: 'APR 03', name: 'VOID RUNNER II', brand: 'DARKROOM × RITUAL', time: '12:00 PM EST', limited: false },
    { date: 'APR 10', name: 'EMBER JACKET', brand: 'RITUAL APPAREL', time: '9:00 AM EST', limited: true },
  ];
  upcomingDrops.forEach((drop, i) => {
    const y = 420 + i * 88;
    children.push(rect(20, y, W - 40, 76, C.surface, { radius: 4 }));
    // date tag
    children.push(rect(20, y, 58, 20, C.coral));
    children.push(text(26, y + 5, drop.date, 9, C.white, { weight: 800, ls: 1 }));
    // drop name
    children.push(text(28, y + 26, drop.name, 16, C.white, { weight: 900 }));
    children.push(text(28, y + 46, drop.brand, 9, C.muted, { weight: 600, ls: 1 }));
    children.push(text(28, y + 60, drop.time, 9, C.amber, { weight: 600 }));
    if (drop.limited) {
      children.push(rect(W - 80, y + 8, 58, 18, C.tag, { radius: 9 }));
      children.push(text(W - 74, y + 13, 'LIMITED', 8, C.amber, { weight: 700, ls: 1 }));
    }
    // notify toggle
    children.push(rect(W - 52, y + 46, 32, 18, C.amber, { radius: 9 }));
    children.push(circle(W - 26, y + 55, 7, C.bg));
    children.push(text(W - 74, y + 50, 'ALERT', 7, C.muted, { weight: 600, ls: 1 }));
  });

  // bottom nav
  children.push(rect(0, H - 72, W, 72, C.surface));
  children.push(line(0, H - 72, W, H - 72, C.rule));
  const navItems = ['DROP', 'RITUALS', 'CALENDAR', 'PROFILE'];
  const navIcons = ['●', '◇', '▦', '○'];
  navItems.forEach((label, i) => {
    const nx = 20 + i * 88;
    const active = i === 2;
    children.push(text(nx + 12, H - 58, navIcons[i], 14, active ? C.amber : C.dim));
    children.push(text(nx + 4, H - 38, label, 8, active ? C.amber : C.muted, { weight: active ? 700 : 400, ls: 1 }));
    if (active) children.push(rect(nx, H - 4, 44, 2, C.amber));
  });

  return { id: nid(), type: 'frame', x: (W + 40) * 2, y: 0, w: W, h: H, fill: C.bg, name: 'Drop Calendar', children };
}

// ─── SCREEN 4: PROFILE ────────────────────────────────────────────────────────
function screenProfile() {
  const children = [];
  children.push(rect(0, 0, W, H, C.bg));
  children.push(text(20, 16, '9:41', 12, C.muted, { weight: 500 }));

  // banner — editorial tone strip
  children.push(rect(0, 48, W, 180, '#131008'));
  children.push(rect(0, 48, W, 4, C.amber));

  // Avatar circle
  children.push(circle(W / 2, 148, 44, C.panel));
  children.push(circle(W / 2, 148, 44, 'rgba(232,132,58,0.15)'));
  children.push(text(W / 2 - 14, 136, 'MK', 22, C.amber, { weight: 900 }));

  // name + handle
  children.push(text(W / 2 - 44, 206, 'MARCUS KIM', 18, C.white, { weight: 900 }));
  children.push(text(W / 2 - 28, 230, '@marcusk', 12, C.muted));

  // level badge
  children.push(rect(W / 2 - 40, 250, 80, 22, C.amber, { radius: 11 }));
  children.push(text(W / 2 - 28, 257, 'OBSIDIAN TIER', 9, C.bg, { weight: 800, ls: 1 }));

  // stats row
  children.push(rect(20, 288, W - 40, 64, C.surface, { radius: 4 }));
  const stats = [
    { v: '14', l: 'STREAK' },
    { v: '189', l: 'SESSIONS' },
    { v: '12', l: 'DROPS WON' },
    { v: '#34', l: 'RANKING' },
  ];
  stats.forEach((s, i) => {
    const sx = 32 + i * 86;
    children.push(text(sx, 302, s.v, 20, i === 2 ? C.coral : C.white, { weight: 900 }));
    children.push(text(sx, 324, s.l, 8, C.muted, { weight: 600, ls: 1 }));
    if (i < 3) children.push(line(sx + 60, 298, sx + 60, 342, C.rule));
  });

  // achievements
  children.push(text(20, 368, 'ACHIEVEMENTS', 10, C.amber, { weight: 700, ls: 2 }));
  children.push(line(20, 382, W - 20, 382, C.rule));
  const badges = [
    { icon: '🔥', name: 'IRON WILL', sub: '14 day streak' },
    { icon: '❄️', name: 'COLD MASTER', sub: '30 cold plunges' },
    { icon: '👟', name: 'DROP HUNTER', sub: '10 wins' },
    { icon: '⚡', name: 'FIRST MOVER', sub: 'Early access unlocked' },
  ];
  badges.forEach((b, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const bx = 20 + col * 180;
    const by = 390 + row * 84;
    children.push(rect(bx, by, 160, 72, C.panel, { radius: 4 }));
    children.push(text(bx + 12, by + 16, b.icon, 20));
    children.push(text(bx + 12, by + 42, b.name, 11, C.white, { weight: 800, ls: 1 }));
    children.push(text(bx + 12, by + 57, b.sub, 9, C.muted));
  });

  // my collection section  
  children.push(text(20, 572, 'MY COLLECTION', 10, C.amber, { weight: 700, ls: 2 }));
  children.push(line(20, 586, W - 20, 586, C.rule));
  children.push(rect(20, 594, 60, 60, '#1A1714', { radius: 4 }));
  children.push(text(32, 616, '👟', 20));
  children.push(rect(88, 594, 60, 60, '#1A1714', { radius: 4 }));
  children.push(text(100, 616, '🧥', 20));
  children.push(rect(156, 594, 60, 60, '#1A1714', { radius: 4 }));
  children.push(text(168, 616, '🩱', 20));
  children.push(rect(224, 594, 60, 60, C.tag, { radius: 4 }));
  children.push(text(242, 616, '+12', 12, C.muted, { weight: 700 }));

  // bottom nav
  children.push(rect(0, H - 72, W, 72, C.surface));
  children.push(line(0, H - 72, W, H - 72, C.rule));
  const navItems = ['DROP', 'RITUALS', 'CALENDAR', 'PROFILE'];
  const navIcons = ['●', '◇', '▦', '○'];
  navItems.forEach((label, i) => {
    const nx = 20 + i * 88;
    const active = i === 3;
    children.push(text(nx + 12, H - 58, navIcons[i], 14, active ? C.amber : C.dim));
    children.push(text(nx + 4, H - 38, label, 8, active ? C.amber : C.muted, { weight: active ? 700 : 400, ls: 1 }));
    if (active) children.push(rect(nx, H - 4, 44, 2, C.amber));
  });

  return { id: nid(), type: 'frame', x: (W + 40) * 3, y: 0, w: W, h: H, fill: C.bg, name: 'Profile', children };
}

// ─── SCREEN 5: DROP DETAIL ────────────────────────────────────────────────────
function screenDropDetail() {
  const children = [];
  children.push(rect(0, 0, W, H, C.bg));

  // Dark hero
  children.push(rect(0, 0, W, 340, '#100E0B'));
  children.push(rect(0, 0, W, 3, C.coral));

  // back + share bar
  children.push(text(20, 58, '← BACK', 11, C.muted, { weight: 700, ls: 1 }));
  children.push(text(W - 58, 58, 'SHARE ↗', 11, C.amber, { weight: 700, ls: 1 }));

  // product visual area — grid of 3 stacked rects = deconstructed shoe
  children.push(rect(60, 88, 270, 180, '#1A1612', { radius: 4 }));
  // shadow/highlight details
  children.push(rect(80, 108, 80, 8, 'rgba(232,132,58,0.3)', { radius: 4 }));
  children.push(rect(80, 124, 120, 6, 'rgba(255,77,46,0.2)', { radius: 4 }));
  children.push(text(W / 2 - 40, 168, '👟', 64));

  // product name
  children.push(text(20, 290, 'OBSIDIAN\nRUNNER', 44, C.white, { weight: 900, lh: 0.88 }));
  children.push(rect(20, 290, 3, 92, C.coral));

  // release info bar
  children.push(rect(0, 390, W, 44, C.coral));
  children.push(text(20, 400, '⏱ DROPS IN 2H 14M', 13, C.white, { weight: 800 }));
  children.push(text(W - 70, 400, 'SET ALERT', 11, 'rgba(255,255,255,0.7)', { weight: 700 }));

  // details section
  children.push(rect(20, 448, W - 40, 2, C.rule));
  children.push(text(20, 458, 'PRODUCT DETAILS', 10, C.muted, { weight: 700, ls: 2 }));

  const details = [
    ['SKU', 'OBR-031-MID'],
    ['COLORWAY', 'Midnight / Ember'],
    ['MATERIAL', 'Primeknit · Carbon'],
    ['RETAIL', '$185 USD'],
    ['SIZES', 'US 6–14'],
    ['CATEGORY', 'Lifestyle Running'],
  ];
  details.forEach((d, i) => {
    const dy = 476 + i * 30;
    children.push(text(20, dy, d[0], 9, C.muted, { weight: 700, ls: 1 }));
    children.push(text(120, dy, d[1], 9, C.white, { weight: 500 }));
    if (i < details.length - 1) children.push(line(20, dy + 16, W - 20, dy + 16, C.rule));
  });

  // my ritual qualifier
  children.push(rect(20, 660, W - 40, 44, '#1A1408', { radius: 4 }));
  children.push(rect(20, 660, 3, 44, C.amber, { radius: 4 }));
  children.push(text(34, 671, 'RITUAL QUALIFIER: UNLOCKED', 10, C.amber, { weight: 800, ls: 1 }));
  children.push(text(34, 687, '14-day streak grants early access', 10, C.muted));

  // CTA
  children.push(rect(20, 716, W - 40, 48, C.amber, { radius: 4 }));
  children.push(text(W / 2 - 48, 735, 'ENTER RAFFLE →', 13, C.bg, { weight: 900, ls: 2 }));

  return { id: nid(), type: 'frame', x: (W + 40) * 4, y: 0, w: W, h: H, fill: C.bg, name: 'Drop Detail', children };
}

// ─── ASSEMBLE PEN ─────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'RITUAL — where drops meet discipline',
  description: 'Dark drop-culture wellness app. Near-black + amber + coral. Editorial bold type. Inspired by Deon Libra (land-book) + The Lookback (awwwards SOTD).',
  screens: [
    screenTodayDrop(),
    screenRituals(),
    screenCalendar(),
    screenProfile(),
    screenDropDetail(),
  ],
};

fs.writeFileSync('/workspace/group/design-studio/ritual.pen', JSON.stringify(pen, null, 2));
console.log('✓ ritual.pen written —', pen.screens.length, 'screens');
