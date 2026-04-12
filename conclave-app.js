// CONCLAVE — Private travel intelligence
// Inspired by: Atlas Card (godly.website) — luxury concierge dark UI
//              Maker (darkmodedesign.com) — exclusive membership editorial dark
// Trend: "Luxury Editorial Dark" — near-black, warm gold accents, full-bleed
//        imagery panels, bold display type, section-per-feature reveal
// Theme: DARK (previous CLARO was light)

const fs = require('fs');

const p = {
  bg:        '#0D0D0F',   // near-black warm — obsidian
  surface:   '#161618',   // dark card surface
  surface2:  '#1E1E22',   // elevated surface
  surface3:  '#252529',   // chip / tag background
  text:      '#F0EDE6',   // warm ivory — premium
  textMuted: 'rgba(240,237,230,0.45)',
  textDim:   'rgba(240,237,230,0.25)',
  accent:    '#C8A96E',   // warm gold — luxury signal
  accent2:   '#6B8F8C',   // slate teal
  accent3:   '#9B7BAE',   // dusty violet
  accentRed: '#C46B5A',   // terracotta
  green:     '#4CAF7D',   // confirmation green
};

function statusBar(bg) {
  return [
    { type: 'rect', x: 0, y: 0, w: 390, h: 48, fill: bg || p.bg },
    { type: 'text', x: 20, y: 17, text: '9:41', fontSize: 13, fontWeight: '600', color: p.text },
    { type: 'text', x: 340, y: 17, text: '▪▪▪', fontSize: 9, color: p.textMuted },
    { type: 'text', x: 374, y: 16, text: '⬛', fontSize: 10, color: p.textMuted },
  ];
}

function bottomNav(active) {
  const items = [
    { icon: '◈', label: 'Home',      x: 48  },
    { icon: '✦', label: 'Discover',  x: 126 },
    { icon: '◷', label: 'Trips',     x: 204 },
    { icon: '✉', label: 'Concierge', x: 282 },
    { icon: '◉', label: 'Profile',   x: 360 },
  ];
  const els = [
    { type: 'rect', x: 0, y: 794, w: 390, h: 50, fill: p.surface2 },
    { type: 'rect', x: 0, y: 794, w: 390, h: 1,  fill: 'rgba(200,169,110,0.15)' },
    { type: 'rect', x: 155, y: 836, w: 80, h: 3, rx: 1.5, fill: 'rgba(240,237,230,0.25)' },
  ];
  items.forEach((item, i) => {
    const isActive = i === active;
    const c = isActive ? p.accent : p.textMuted;
    els.push({ type: 'text', x: item.x, y: 814, text: item.icon, fontSize: 16, color: c, textAnchor: 'middle', fontWeight: isActive ? '700' : '400' });
    els.push({ type: 'text', x: item.x, y: 829, text: item.label, fontSize: 7, color: c, textAnchor: 'middle', fontWeight: isActive ? '600' : '400', letterSpacing: 0.5 });
    if (isActive) {
      els.push({ type: 'rect', x: item.x - 16, y: 795, w: 32, h: 2, rx: 1, fill: p.accent });
    }
  });
  return els;
}

function rule(x, y, w) {
  return { type: 'rect', x, y, w, h: 1, fill: 'rgba(200,169,110,0.2)' };
}

function pill(x, y, text, bg, fg, fs) {
  fs = fs || 9;
  const tw = text.length * (fs * 0.6) + 18;
  return [
    { type: 'rect', x, y, w: tw, h: 18, rx: 9, fill: bg },
    { type: 'text', x: x + tw/2, y: y + 12, text, fontSize: fs, fontWeight: '600', color: fg, textAnchor: 'middle', letterSpacing: 0.6 },
  ];
}

// ─── SCREEN 1: HOME ───────────────────────────────────────────────────────────
function screen1() {
  const els = [
    { type: 'rect', x: 0, y: 0, w: 390, h: 844, fill: p.bg },
    ...statusBar(),
  ];

  // Wordmark + greeting
  els.push({ type: 'text', x: 20, y: 72, text: 'CONCLAVE', fontSize: 11, fontWeight: '700', color: p.accent, letterSpacing: 4 });
  els.push({ type: 'text', x: 20, y: 94, text: 'Good evening, James.', fontSize: 22, fontWeight: '700', color: p.text });
  // Notification dot
  els.push({ type: 'text', x: 356, y: 76, text: '🔔', fontSize: 17, color: p.textMuted });
  els.push({ type: 'rect', x: 364, y: 68, w: 8, h: 8, rx: 4, fill: p.accent });
  // Tier chip
  els.push(...pill(20, 104, '✦ OBSIDIAN TIER', 'rgba(200,169,110,0.12)', p.accent, 8));
  els.push(rule(20, 130, 350));

  // ── Hero destination card
  // Deep teal seascape simulation
  els.push({ type: 'rect', x: 20, y: 140, w: 350, h: 200, rx: 16, fill: '#0A1E25' });
  els.push({ type: 'rect', x: 20, y: 140, w: 350, h: 80,  rx: 16, fill: '#0D2B35' });
  els.push({ type: 'rect', x: 20, y: 210, w: 350, h: 70,  rx: 0,  fill: '#143540', opacity: 0.8 });
  els.push({ type: 'rect', x: 20, y: 270, w: 350, h: 70,  rx: 16, fill: '#091820' });
  // Shimmer band (horizon light)
  els.push({ type: 'rect', x: 20, y: 218, w: 350, h: 8,   rx: 0,  fill: p.accent2, opacity: 0.15 });
  // Dark overlay for text
  els.push({ type: 'rect', x: 20, y: 272, w: 350, h: 68, rx: 16, fill: 'rgba(9,18,24,0.9)' });
  // Badge
  els.push(...pill(34, 153, 'CURATED TODAY', p.accent, '#0D0D0F', 8));
  // Hero text
  els.push({ type: 'text', x: 34, y: 296, text: 'Amalfi Coast', fontSize: 20, fontWeight: '800', color: p.text });
  els.push({ type: 'text', x: 34, y: 316, text: 'Private villa access · Oct 12–19', fontSize: 11, color: p.textMuted });
  // Request button
  els.push({ type: 'rect', x: 290, y: 286, w: 68, h: 28, rx: 14, fill: p.accent });
  els.push({ type: 'text', x: 324, y: 304, text: 'Request', fontSize: 10, fontWeight: '700', color: '#0D0D0F', textAnchor: 'middle' });

  // ── Quick access
  els.push({ type: 'text', x: 20, y: 362, text: 'QUICK ACCESS', fontSize: 9, fontWeight: '700', color: p.accent, letterSpacing: 2.5 });
  const services = [
    { icon: '✈', label: 'Flights',  bg: '#0E1828' },
    { icon: '⛵', label: 'Yachts',   bg: '#0A1E1E' },
    { icon: '🏛', label: 'Villas',   bg: '#1A1020' },
    { icon: '🚘', label: 'Ground',   bg: '#1A1208' },
  ];
  services.forEach((s, i) => {
    const sx = 20 + i * 88;
    els.push({ type: 'rect', x: sx, y: 374, w: 76, h: 76, rx: 14, fill: s.bg });
    els.push({ type: 'rect', x: sx, y: 374, w: 76, h: 76, rx: 14, fill: 'rgba(200,169,110,0.05)' });
    els.push({ type: 'text', x: sx + 38, y: 415, text: s.icon, fontSize: 20, textAnchor: 'middle' });
    els.push({ type: 'text', x: sx + 38, y: 440, text: s.label, fontSize: 9, color: p.textMuted, textAnchor: 'middle', fontWeight: '500' });
  });

  // ── Active trip card
  els.push({ type: 'text', x: 20, y: 476, text: 'ACTIVE TRIP', fontSize: 9, fontWeight: '700', color: p.accent, letterSpacing: 2.5 });
  els.push({ type: 'rect', x: 20, y: 490, w: 350, h: 90, rx: 14, fill: p.surface });
  els.push({ type: 'rect', x: 20, y: 490, w: 4,   h: 90, rx: 2,  fill: p.accent });
  els.push({ type: 'text', x: 36, y: 511, text: 'Tokyo · Kyoto · Osaka', fontSize: 15, fontWeight: '700', color: p.text });
  els.push({ type: 'text', x: 36, y: 529, text: 'Nov 3 → Nov 14  ·  12 nights', fontSize: 11, color: p.textMuted });
  els.push({ type: 'rect', x: 36, y: 542, w: 220, h: 3, rx: 1.5, fill: 'rgba(200,169,110,0.15)' });
  els.push({ type: 'rect', x: 36, y: 542, w: 66,  h: 3, rx: 1.5, fill: p.accent });
  els.push({ type: 'text', x: 36, y: 558, text: '3 of 11 items confirmed', fontSize: 10, color: p.textDim });
  // Countdown
  els.push({ type: 'rect', x: 300, y: 508, w: 54, h: 50, rx: 10, fill: 'rgba(200,169,110,0.1)' });
  els.push({ type: 'text', x: 327, y: 531, text: '38', fontSize: 20, fontWeight: '800', color: p.accent, textAnchor: 'middle' });
  els.push({ type: 'text', x: 327, y: 548, text: 'days',  fontSize: 9,  color: p.textMuted, textAnchor: 'middle' });

  // ── Concierge last message
  els.push({ type: 'text', x: 20, y: 604, text: 'CONCIERGE', fontSize: 9, fontWeight: '700', color: p.accent, letterSpacing: 2.5 });
  els.push({ type: 'rect', x: 20, y: 618, w: 350, h: 62, rx: 14, fill: p.surface });
  els.push({ type: 'rect', x: 34, y: 630, w: 38, h: 38, rx: 19, fill: '#2A1E38' });
  els.push({ type: 'text', x: 53, y: 654, text: 'S', fontSize: 16, fontWeight: '700', color: p.accent, textAnchor: 'middle' });
  els.push({ type: 'rect', x: 63, y: 660, w: 9, h: 9, rx: 4.5, fill: p.green });
  els.push({ type: 'text', x: 84, y: 643, text: 'Sophie · Your Concierge', fontSize: 11, fontWeight: '600', color: p.text });
  els.push({ type: 'text', x: 84, y: 661, text: '"Your Nobu reservation is confirmed for Nov 4"', fontSize: 10, color: p.textMuted });
  els.push({ type: 'text', x: 360, y: 643, text: '2m', fontSize: 9, color: p.textDim, textAnchor: 'end' });

  els.push(...bottomNav(0));
  return { name: 'Home', elements: els };
}

// ─── SCREEN 2: DISCOVER ───────────────────────────────────────────────────────
function screen2() {
  const els = [
    { type: 'rect', x: 0, y: 0, w: 390, h: 844, fill: p.bg },
    ...statusBar(),
  ];

  els.push({ type: 'text', x: 20, y: 72, text: 'DISCOVER', fontSize: 11, fontWeight: '700', color: p.accent, letterSpacing: 4 });
  els.push({ type: 'text', x: 20, y: 94, text: 'Curated for you', fontSize: 22, fontWeight: '700', color: p.text });

  // Filter chips
  const filters = ['All', 'Europe', 'Asia', 'Americas', 'Islands'];
  let fx = 20;
  filters.forEach((f, i) => {
    const isActive = i === 0;
    const fw = f.length * 7.2 + 22;
    els.push({ type: 'rect', x: fx, y: 106, w: fw, h: 26, rx: 13, fill: isActive ? p.accent : p.surface3 });
    els.push({ type: 'text', x: fx + fw/2, y: 123, text: f, fontSize: 10, fontWeight: isActive ? '700' : '500', color: isActive ? '#0D0D0F' : p.textMuted, textAnchor: 'middle' });
    fx += fw + 8;
  });

  // ── Wide editorial card
  els.push({ type: 'rect', x: 20, y: 144, w: 350, h: 165, rx: 16, fill: '#0D1420' });
  // Night sky bands
  els.push({ type: 'rect', x: 20, y: 144, w: 350, h: 80, rx: 16, fill: '#0A1030' });
  for (let i = 0; i < 14; i++) {
    const lx = 30 + i * 24 + (i % 3) * 6;
    const ly = 152 + (i % 5) * 18;
    els.push({ type: 'rect', x: lx, y: ly, w: 3, h: 3, rx: 1.5, fill: p.accent, opacity: 0.15 + (i % 4) * 0.1 });
  }
  els.push({ type: 'rect', x: 20, y: 220, w: 350, h: 89, rx: 16, fill: 'rgba(10,14,24,0.88)' });
  els.push(...pill(34, 157, 'MEMBERS ONLY', 'rgba(155,123,174,0.25)', p.accent3, 8));
  els.push({ type: 'text', x: 34, y: 236, text: 'Kyoto by Night', fontSize: 19, fontWeight: '800', color: p.text });
  els.push({ type: 'text', x: 34, y: 255, text: 'Exclusive ryokan access · 8 villas remaining', fontSize: 10, color: p.textMuted });
  els.push({ type: 'text', x: 356, y: 250, text: 'From $4,200', fontSize: 11, fontWeight: '700', color: p.accent, textAnchor: 'end' });
  els.push({ type: 'text', x: 356, y: 265, text: '/ night', fontSize: 9, color: p.textDim, textAnchor: 'end' });

  // ── Two column cards
  const cards = [
    { title: 'Santorini', sub: 'Greece · Cave Suites', bg: '#200F15', topBg: '#3A1822', midBg: '#C46B5A', badge: 'HOT', badgeColor: p.accentRed },
    { title: 'Maldives', sub: 'Overwater · All-Inc', bg: '#081820', topBg: '#0A2535', midBg: '#1A6B7A', badge: 'NEW', badgeColor: p.accent2 },
  ];
  cards.forEach((d, i) => {
    const cx = 20 + i * 180;
    els.push({ type: 'rect', x: cx, y: 322, w: 165, h: 188, rx: 14, fill: d.bg });
    els.push({ type: 'rect', x: cx, y: 322, w: 165, h: 95,  rx: 14, fill: d.topBg });
    els.push({ type: 'rect', x: cx, y: 370, w: 165, h: 47,  rx: 0,  fill: d.midBg, opacity: 0.28 });
    els.push({ type: 'rect', x: cx, y: 390, w: 165, h: 120, rx: 14, fill: 'rgba(10,10,14,0.82)' });
    els.push(...pill(cx + 12, 332, d.badge, d.badgeColor + '28', d.badgeColor, 8));
    els.push({ type: 'text', x: cx + 12, y: 408, text: d.title, fontSize: 15, fontWeight: '800', color: p.text });
    els.push({ type: 'text', x: cx + 12, y: 426, text: d.sub,   fontSize: 9,  color: p.textMuted });
    els.push({ type: 'text', x: cx + 12, y: 444, text: '★★★★★', fontSize: 9, color: p.accent });
    els.push({ type: 'text', x: cx + 12, y: 460, text: '4.9 · 340 stays', fontSize: 9, color: p.textDim });
    els.push({ type: 'rect', x: cx + 12, y: 468, w: 141, h: 26, rx: 13, fill: 'rgba(200,169,110,0.1)', stroke: p.accent, strokeWidth: 0.4 });
    els.push({ type: 'text', x: cx + 82, y: 485, text: 'Explore →', fontSize: 10, fontWeight: '600', color: p.accent, textAnchor: 'middle' });
  });

  // ── Trending experiences
  els.push({ type: 'text', x: 20, y: 530, text: 'TRENDING EXPERIENCES', fontSize: 9, fontWeight: '700', color: p.accent, letterSpacing: 2.5 });
  const exp = [
    { icon: '🎭', name: 'Private Opera, Vienna',  price: 'From $1,890', bg: '#160F20' },
    { icon: '🏔', name: 'Heli-Ski, Chamonix',     price: 'From $3,200', bg: '#0A1420' },
    { icon: '🍾', name: 'Vineyard, Burgundy',      price: 'From $940',   bg: '#180C08' },
    { icon: '🎯', name: 'F1 Paddock, Monaco',      price: 'From $5,500', bg: '#1A1008' },
  ];
  exp.forEach((e, i) => {
    const ey = 542 + i * 64;
    els.push({ type: 'rect', x: 20, y: ey, w: 350, h: 56, rx: 12, fill: p.surface });
    els.push({ type: 'rect', x: 20, y: ey, w: 52,  h: 56, rx: 12, fill: e.bg });
    els.push({ type: 'text', x: 46, y: ey + 34, text: e.icon, fontSize: 20, textAnchor: 'middle' });
    els.push({ type: 'text', x: 82, y: ey + 22, text: e.name,  fontSize: 13, fontWeight: '600', color: p.text });
    els.push({ type: 'text', x: 82, y: ey + 40, text: e.price + '  ·  Members save 22%', fontSize: 10, color: p.textMuted });
    els.push({ type: 'text', x: 360, y: ey + 32, text: '›', fontSize: 18, color: p.accent, textAnchor: 'end' });
  });

  els.push(...bottomNav(1));
  return { name: 'Discover', elements: els };
}

// ─── SCREEN 3: TRIP PLANNER ───────────────────────────────────────────────────
function screen3() {
  const els = [
    { type: 'rect', x: 0, y: 0, w: 390, h: 844, fill: p.bg },
    ...statusBar(),
  ];

  els.push({ type: 'text', x: 20, y: 72, text: 'ACTIVE TRIP', fontSize: 11, fontWeight: '700', color: p.accent, letterSpacing: 4 });
  els.push({ type: 'text', x: 20, y: 94, text: 'Japan · Nov 3–14', fontSize: 22, fontWeight: '700', color: p.text });

  // Progress bar
  els.push({ type: 'rect', x: 20, y: 108, w: 350, h: 4, rx: 2, fill: p.surface3 });
  els.push({ type: 'rect', x: 20, y: 108, w: 105, h: 4, rx: 2, fill: p.accent });
  els.push({ type: 'text', x: 20,  y: 124, text: '3 confirmed', fontSize: 10, color: p.accent });
  els.push({ type: 'text', x: 195, y: 124, text: '8 pending',   fontSize: 10, color: p.textMuted, textAnchor: 'middle' });
  els.push({ type: 'text', x: 370, y: 124, text: '11 total',    fontSize: 10, color: p.textDim,   textAnchor: 'end' });

  const timeline = [
    { day: 'Nov 3',  icon: '✈', title: 'Heathrow → Narita',           sub: 'BA006 · 13:45 dep · Business Suite', status: 'confirmed', col: p.accent2 },
    { day: 'Nov 3',  icon: '🏨', title: 'The Ritz-Carlton, Tokyo',     sub: 'Club Level Suite · 4 nights',        status: 'confirmed', col: p.accent },
    { day: 'Nov 4',  icon: '🍱', title: 'Narisawa (dinner)',           sub: 'Tasting menu · 8:00pm · 2 guests',   status: 'confirmed', col: p.accent3 },
    { day: 'Nov 7',  icon: '🚄', title: 'Shinkansen → Kyoto',         sub: 'Gran Class · 10:00am',               status: 'pending',   col: p.textMuted },
    { day: 'Nov 7',  icon: '🏯', title: 'Nishiyama Onsen Keiunkan',   sub: 'Historic ryokan · 3 nights',         status: 'pending',   col: p.textMuted },
    { day: 'Nov 10', icon: '🎎', title: 'Tea Ceremony (private)',      sub: 'Urasenke school · English guide',    status: 'pending',   col: p.textMuted },
  ];

  timeline.forEach((item, i) => {
    const ty = 140 + i * 96;
    if (ty > 755) return;
    const confirmed = item.status === 'confirmed';
    const lineCol = confirmed ? item.col : 'rgba(200,169,110,0.2)';

    // Vertical connector
    if (i < timeline.length - 1 && ty + 96 <= 755) {
      els.push({ type: 'rect', x: 47, y: ty + 40, w: 2, h: 56, rx: 1, fill: lineCol, opacity: 0.35 });
    }

    // Date label
    els.push({ type: 'text', x: 20, y: ty + 22, text: item.day, fontSize: 9, color: p.textDim, fontWeight: '600', letterSpacing: 0.5 });

    // Node circle
    els.push({ type: 'rect', x: 33, y: ty + 8, w: 28, h: 28, rx: 14, fill: confirmed ? lineCol + '22' : p.surface3 });
    els.push({ type: 'text', x: 47, y: ty + 27, text: item.icon, fontSize: 13, textAnchor: 'middle' });

    // Card
    els.push({ type: 'rect', x: 72, y: ty + 4, w: 298, h: 80, rx: 12, fill: p.surface });
    if (confirmed) {
      els.push({ type: 'rect', x: 72, y: ty + 4, w: 3, h: 80, rx: 1.5, fill: lineCol });
    }
    els.push({ type: 'text', x: 86, y: ty + 22, text: item.title, fontSize: 13, fontWeight: '700', color: p.text });
    els.push({ type: 'text', x: 86, y: ty + 40, text: item.sub,   fontSize: 10, color: p.textMuted });

    if (confirmed) {
      els.push(...pill(86, ty + 52, '✓  CONFIRMED', 'rgba(76,175,125,0.14)', p.green, 8));
    } else {
      els.push(...pill(86, ty + 52, 'PENDING', p.surface3, p.textMuted, 8));
    }
    els.push({ type: 'text', x: 362, y: ty + 24, text: '›', fontSize: 16, color: p.textMuted, textAnchor: 'end' });
  });

  els.push(...bottomNav(2));
  return { name: 'Trip Planner', elements: els };
}

// ─── SCREEN 4: CONCIERGE ──────────────────────────────────────────────────────
function screen4() {
  const els = [
    { type: 'rect', x: 0, y: 0, w: 390, h: 844, fill: p.bg },
    ...statusBar(p.surface),
    { type: 'rect', x: 0, y: 48, w: 390, h: 102, fill: p.surface },
    { type: 'rect', x: 0, y: 150, w: 390, h: 1, fill: 'rgba(200,169,110,0.15)' },
  ];

  // Concierge header
  els.push({ type: 'rect', x: 20, y: 60, w: 62, h: 62, rx: 31, fill: '#281C34' });
  els.push({ type: 'text', x: 51, y: 98, text: 'S', fontSize: 24, fontWeight: '800', color: p.accent, textAnchor: 'middle' });
  // Online ring
  els.push({ type: 'rect', x: 68, y: 108, w: 14, h: 14, rx: 7, fill: 'rgba(76,175,125,0.22)' });
  els.push({ type: 'rect', x: 70, y: 110, w: 10, h: 10, rx: 5, fill: p.green });

  els.push({ type: 'text', x: 94, y: 82, text: 'Sophie', fontSize: 17, fontWeight: '700', color: p.text });
  els.push({ type: 'text', x: 94, y: 100, text: 'Personal Concierge', fontSize: 11, color: p.textMuted });
  els.push({ type: 'text', x: 94, y: 118, text: '● Online now', fontSize: 10, color: p.green });

  // Action buttons
  els.push({ type: 'rect', x: 270, y: 68, w: 44, h: 44, rx: 22, fill: p.surface3 });
  els.push({ type: 'text', x: 292, y: 95, text: '📞', fontSize: 17, textAnchor: 'middle' });
  els.push({ type: 'rect', x: 326, y: 68, w: 44, h: 44, rx: 22, fill: p.surface3 });
  els.push({ type: 'text', x: 348, y: 95, text: '✉', fontSize: 17, color: p.text, textAnchor: 'middle' });

  // Chat area bg
  els.push({ type: 'rect', x: 0, y: 151, w: 390, h: 559, fill: p.bg });

  const msgs = [
    { from: 'sophie', text: 'Good evening, James! Your Narita\narrival transfer is confirmed.\nDriver: Kenji +81 90-1234-5678', time: '5:30 PM' },
    { from: 'user',   text: 'Perfect. Can you book dinner at\nSukiyabashi Jiro for Nov 5th?', time: '5:32 PM' },
    { from: 'sophie', text: "On it! They're notoriously difficult\nbut I have a contact. Confirming\nwithin 2 hours.", time: '5:33 PM' },
    { from: 'user',   text: 'Thank you 🙏', time: '5:34 PM' },
    { from: 'sophie', text: 'Confirmed! Sukiyabashi Jiro, Nov 5th,\n7:30pm · 2 omakase seats\nTotal: ¥66,000 pp', time: '7:18 PM' },
  ];

  let by = 162;
  msgs.forEach(m => {
    const isUser = m.from === 'user';
    const lines  = m.text.split('\n');
    const maxLen = Math.max(...lines.map(l => l.length));
    const bw = Math.min(maxLen * 7 + 28, 255);
    const bh = lines.length * 17 + 22;
    const bx = isUser ? 390 - bw - 20 : 20;

    els.push({ type: 'rect', x: bx, y: by, w: bw, h: bh, rx: 16, fill: isUser ? 'rgba(200,169,110,0.16)' : p.surface });
    if (isUser) {
      els.push({ type: 'rect', x: bx, y: by, w: bw, h: bh, rx: 16, fill: 'rgba(0,0,0,0)', stroke: p.accent, strokeWidth: 0.5 });
    }
    lines.forEach((line, li) => {
      els.push({ type: 'text', x: bx + 14, y: by + 17 + li * 17, text: line, fontSize: 11, color: p.text });
    });
    els.push({ type: 'text', x: isUser ? bx + bw : bx, y: by + bh + 11,
      text: m.time, fontSize: 9, color: p.textDim, textAnchor: isUser ? 'end' : 'start' });
    by += bh + 20;
  });

  // Quick chips + input bar
  els.push({ type: 'rect', x: 0, y: 710, w: 390, h: 1,  fill: 'rgba(200,169,110,0.15)' });
  els.push({ type: 'text', x: 20, y: 726, text: 'QUICK REQUESTS', fontSize: 8, color: p.textDim, fontWeight: '600', letterSpacing: 2 });

  const quick = ['Book restaurant', 'Transport', 'Event tickets', 'Hotel upgrade'];
  let qx = 20;
  quick.forEach(q => {
    const qw = q.length * 6.5 + 20;
    if (qx + qw < 382) {
      els.push({ type: 'rect', x: qx, y: 732, w: qw, h: 22, rx: 11, fill: p.surface3 });
      els.push({ type: 'text', x: qx + qw/2, y: 747, text: q, fontSize: 9, color: p.textMuted, textAnchor: 'middle' });
      qx += qw + 8;
    }
  });

  els.push({ type: 'rect', x: 0,  y: 758, w: 390, h: 50, fill: p.surface2 });
  els.push({ type: 'rect', x: 14, y: 764, w: 308, h: 36, rx: 18, fill: p.surface3 });
  els.push({ type: 'text', x: 34, y: 787, text: 'Message Sophie…', fontSize: 12, color: p.textDim });
  els.push({ type: 'rect', x: 330, y: 764, w: 44, h: 36, rx: 18, fill: p.accent });
  els.push({ type: 'text', x: 352, y: 787, text: '↑', fontSize: 18, fontWeight: '700', color: '#0D0D0F', textAnchor: 'middle' });

  els.push(...bottomNav(3));
  return { name: 'Concierge', elements: els };
}

// ─── SCREEN 5: MEMBER PROFILE ─────────────────────────────────────────────────
function screen5() {
  const els = [
    { type: 'rect', x: 0, y: 0, w: 390, h: 844, fill: p.bg },
    ...statusBar(p.surface),
    { type: 'rect', x: 0, y: 48, w: 390, h: 264, fill: p.surface },
  ];

  // Fine grid texture
  for (let gx = 0; gx < 390; gx += 22) {
    els.push({ type: 'rect', x: gx, y: 48, w: 1, h: 264, fill: 'rgba(200,169,110,0.04)' });
  }
  for (let gy = 48; gy < 312; gy += 22) {
    els.push({ type: 'rect', x: 0, y: gy, w: 390, h: 1, fill: 'rgba(200,169,110,0.04)' });
  }
  // Fade bottom of header
  els.push({ type: 'rect', x: 0, y: 262, w: 390, h: 50, fill: 'rgba(22,22,24,0.96)' });

  // Avatar with gold ring
  els.push({ type: 'rect', x: 153, y: 62, w: 84, h: 84, rx: 42, fill: '#241630' });
  els.push({ type: 'rect', x: 149, y: 58, w: 92, h: 92, rx: 46, fill: 'rgba(0,0,0,0)', stroke: p.accent, strokeWidth: 1.5 });
  els.push({ type: 'text', x: 195, y: 114, text: 'JR', fontSize: 28, fontWeight: '800', color: p.accent, textAnchor: 'middle' });

  els.push({ type: 'text', x: 195, y: 168, text: 'James Richardson', fontSize: 20, fontWeight: '700', color: p.text, textAnchor: 'middle' });
  els.push({ type: 'text', x: 195, y: 187, text: 'Member since 2022', fontSize: 11, color: p.textMuted, textAnchor: 'middle' });
  els.push({ type: 'rect', x: 152, y: 196, w: 86, h: 22, rx: 11, fill: 'rgba(200,169,110,0.18)' });
  els.push({ type: 'text', x: 195, y: 211, text: '✦  OBSIDIAN', fontSize: 9, fontWeight: '700', color: p.accent, textAnchor: 'middle', letterSpacing: 1.5 });

  // Stats row
  els.push({ type: 'rect', x: 20, y: 228, w: 350, h: 70, rx: 14, fill: 'rgba(200,169,110,0.07)' });
  const stats = [{ v: '47', l: 'Trips' }, { v: '312', l: 'Nights' }, { v: '29', l: 'Countries' }];
  stats.forEach((s, i) => {
    const sx = 75 + i * 115;
    els.push({ type: 'text', x: sx, y: 256, text: s.v, fontSize: 22, fontWeight: '800', color: p.accent, textAnchor: 'middle' });
    els.push({ type: 'text', x: sx, y: 274, text: s.l, fontSize: 9,  color: p.textMuted, textAnchor: 'middle', letterSpacing: 1 });
    if (i < 2) els.push({ type: 'rect', x: sx + 52, y: 246, w: 1, h: 32, fill: 'rgba(200,169,110,0.2)' });
  });

  // Benefits
  els.push({ type: 'text', x: 20, y: 320, text: 'OBSIDIAN BENEFITS', fontSize: 9, fontWeight: '700', color: p.accent, letterSpacing: 2.5 });
  const benefits = [
    { icon: '✈', l: 'Airport Suite Access', d: '1,200+ lounges globally',      active: true  },
    { icon: '🏨', l: 'Hotel Elite Status',   d: '250+ preferred properties',    active: true  },
    { icon: '🚘', l: 'Ground Priority',       d: 'Dedicated driver network',     active: true  },
    { icon: '🎟', l: 'Exclusive Events',      d: 'Opera, racing & private dinners', active: false },
  ];
  benefits.forEach((b, i) => {
    const by = 332 + i * 66;
    els.push({ type: 'rect', x: 20, y: by, w: 350, h: 58, rx: 12, fill: p.surface });
    els.push({ type: 'rect', x: 20, y: by, w: 46,  h: 58, rx: 12, fill: b.active ? 'rgba(200,169,110,0.08)' : p.surface3 });
    els.push({ type: 'text', x: 43, y: by + 35, text: b.icon, fontSize: 18, textAnchor: 'middle' });
    els.push({ type: 'text', x: 76, y: by + 22, text: b.l, fontSize: 13, fontWeight: '600', color: b.active ? p.text : p.textMuted });
    els.push({ type: 'text', x: 76, y: by + 39, text: b.d, fontSize: 10, color: p.textDim });
    if (b.active) {
      els.push({ type: 'rect', x: 340, y: by + 19, w: 22, h: 22, rx: 11, fill: 'rgba(76,175,125,0.14)' });
      els.push({ type: 'text', x: 351, y: by + 34, text: '✓', fontSize: 11, color: p.green, textAnchor: 'middle' });
    } else {
      els.push({ type: 'rect', x: 340, y: by + 19, w: 22, h: 22, rx: 11, fill: p.surface3 });
      els.push({ type: 'text', x: 351, y: by + 35, text: '+', fontSize: 14, color: p.textMuted, textAnchor: 'middle' });
    }
  });

  // CTA
  els.push({ type: 'rect', x: 20, y: 600, w: 350, h: 52, rx: 14, fill: p.accent });
  els.push({ type: 'text', x: 195, y: 620, text: 'Manage Membership', fontSize: 14, fontWeight: '700', color: '#0D0D0F', textAnchor: 'middle' });
  els.push({ type: 'text', x: 195, y: 640, text: 'Annual renewal · Dec 2026', fontSize: 10, color: 'rgba(13,13,15,0.6)', textAnchor: 'middle' });

  // Settings links
  const links = ['Preferences', 'Payment Methods', 'Security', 'Help & Support'];
  links.forEach((l, i) => {
    const ly = 674 + i * 28;
    els.push({ type: 'text', x: 20,  y: ly, text: l, fontSize: 13, color: p.textMuted });
    els.push({ type: 'text', x: 370, y: ly, text: '›', fontSize: 16, color: p.textDim, textAnchor: 'end' });
    if (i < links.length - 1) els.push(rule(20, ly + 8, 350));
  });

  els.push(...bottomNav(4));
  return { name: 'Profile', elements: els };
}

// ─── ASSEMBLE ─────────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'CONCLAVE — Private Travel Intelligence',
  description: 'Luxury members-only travel concierge app. Dark editorial aesthetic inspired by Atlas Card (godly.website) and Maker (darkmodedesign.com). Near-black obsidian backgrounds, warm gold accents, imagery panels, section-per-feature layout.',
  screens: [ screen1(), screen2(), screen3(), screen4(), screen5() ],
};

fs.writeFileSync('/workspace/group/design-studio/conclave.pen', JSON.stringify(pen, null, 2));
console.log('✓ conclave.pen written —', pen.screens.length, 'screens');
pen.screens.forEach((s, i) =>
  console.log(`  Screen ${i+1}: ${s.name} (${s.elements.length} elements)`));
