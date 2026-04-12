/**
 * LUX — Creative Portfolio Studio
 * LIGHT glassmorphism theme
 *
 * Inspired by:
 *  · "Fluid Glass" nominee on Awwwards.com — frosted glass depth, translucency, depth layering
 *  · minimal.gallery — airy whitespace-driven minimal design, "For the love of beautiful & functional"
 *  · Land-book's Athleats — editorial typography pairings over warm light backgrounds
 *
 * Challenge: First light-mode glassmorphism in this series.
 *  Frosted glass cards over warm cream, prismatic accent glows, editorial heading type.
 */

const fs = require('fs');
const W = 390, H = 844;

const P = {
  bg:          '#F3F0EA',
  bg2:         '#EAE6DF',
  surface:     'rgba(255,255,255,0.82)',
  border:      'rgba(24,20,32,0.09)',
  text:        '#17131D',
  textMid:     '#6A5F79',
  textDim:     '#B0A8BC',
  violet:      '#6B5CE7',
  violetHi:    '#8B7DF0',
  violetLo:    'rgba(107,92,231,0.13)',
  pink:        '#E74C85',
  pinkLo:      'rgba(231,76,133,0.12)',
  teal:        '#2ABFA3',
  tealLo:      'rgba(42,191,163,0.12)',
  gold:        '#D4A947',
  goldLo:      'rgba(212,169,71,0.12)',
  white:       '#FFFFFF',
};

function el(type, x, y, w, h, props = {}) {
  return { type, x, y, width: w, height: h,
    fill: 'transparent', stroke: 'transparent', strokeWidth: 0,
    radius: 0, opacity: 1, ...props };
}
function tx(text, x, y, w, h, props = {}) {
  return { type: 'text', x, y, width: w, height: h, text,
    fontSize: 14, fontWeight: '400', fontFamily: 'Inter',
    color: P.text, align: 'left', opacity: 1, lineHeight: 1.4, letterSpacing: 0, ...props };
}

function statusBar(y = 0) {
  return [
    el('rect', 0, y, W, 44, { fill: 'transparent' }),
    tx('9:41', 20, y + 14, 50, 16, { fontSize: 13, fontWeight: '600', color: P.text }),
    el('rect', W - 68, y + 16, 20, 10, { fill: 'transparent', stroke: P.text, strokeWidth: 1, radius: 2, opacity: 0.4 }),
    el('rect', W - 67, y + 17, 14, 8,  { fill: P.text, radius: 1, opacity: 0.4 }),
    el('rect', W - 46, y + 14, 12, 14, { fill: P.text, radius: 2, opacity: 0.3 }),
    el('rect', W - 32, y + 13, 12, 16, { fill: P.text, radius: 2, opacity: 0.5 }),
    el('rect', W - 18, y + 12, 12, 18, { fill: P.text, radius: 2, opacity: 0.65 }),
  ];
}

function bottomNav(activeIdx = 0) {
  const items = [];
  const navY = H - 68;
  const tabs = [
    { icon: '⌂', label: 'Home' },
    { icon: '⊞', label: 'Work' },
    { icon: '⊕', label: 'Add' },
    { icon: '◌', label: 'Explore' },
    { icon: '◉', label: 'Profile' },
  ];
  items.push(
    el('rect', 0, navY, W, 68, { fill: P.surface, stroke: P.border, strokeWidth: 1 }),
  );
  tabs.forEach((t, i) => {
    const tx2 = 20 + i * 70;
    const active = i === activeIdx;
    items.push(
      el('rect', tx2 + 10, navY + 7, 48, 36, {
        fill: active ? P.violetLo : 'transparent', radius: 12,
      }),
      tx(t.icon, tx2 + 15, navY + 11, 38, 20, {
        fontSize: 16, align: 'center',
        color: active ? P.violet : P.textDim,
        fontWeight: active ? '700' : '400',
      }),
      tx(t.label, tx2, navY + 34, 68, 13, {
        fontSize: 9, align: 'center',
        color: active ? P.violet : P.textDim,
        fontWeight: active ? '700' : '400', letterSpacing: 0.3,
      }),
    );
  });
  return items;
}

function glassCard(x, y, w, h, r = 18, accentColor = null) {
  const els = [el('rect', x, y, w, h, { fill: P.surface, radius: r, stroke: P.border, strokeWidth: 1 })];
  if (accentColor) {
    els.push(el('rect', x + 1, y + 1, w - 2, 3, { fill: accentColor, radius: 2, opacity: 0.45 }));
  }
  return els;
}

function orb(x, y, size, color, opacity = 0.12) {
  return el('ellipse', x - size / 2, y - size * 0.3, size, size * 0.6,
    { fill: color, opacity, radius: 999 });
}

function pBar(x, y, w, pct, color) {
  return [
    el('rect', x, y, w, 4, { fill: P.border, radius: 2, opacity: 0.4 }),
    el('rect', x, y, Math.round(w * pct), 4, { fill: color, radius: 2 }),
  ];
}

// ── SCREEN 1: Home ────────────────────────────────────────────────────────────

function screen1() {
  const els = [];
  els.push(el('rect', 0, 0, W, H, { fill: P.bg }));
  els.push(orb(320, 80, 280, P.violet, 0.10));
  els.push(orb(60, 320, 200, P.pink, 0.08));
  els.push(orb(240, 620, 180, P.teal, 0.07));
  els.push(...statusBar(0));

  // Header
  els.push(
    tx('LUX', 20, 54, 100, 22, { fontSize: 13, fontWeight: '800', letterSpacing: 4, color: P.violet }),
    el('rect', W - 52, 54, 32, 32, { fill: P.surface, stroke: P.border, strokeWidth: 1, radius: 12 }),
    tx('☰', W - 43, 63, 16, 16, { fontSize: 13, color: P.textMid }),
  );

  // Greeting
  els.push(
    tx('Good morning,', 20, 96, 280, 18, { fontSize: 13, color: P.textMid }),
    tx('Zara.', 20, 112, 280, 36, { fontSize: 32, fontWeight: '800', letterSpacing: -1.2, color: P.text }),
  );

  // Featured project card — full-bleed glass
  els.push(...glassCard(20, 158, W - 40, 182, 24, P.violet));
  // thumbnail
  els.push(
    el('rect', 20, 158, W - 40, 120, { fill: P.bg2, radius: 24, opacity: 0.7 }),
    el('rect', 44, 174, 138, 90, { fill: P.violetLo, radius: 12 }),
    el('rect', 194, 174, 84, 44, { fill: P.pinkLo, radius: 10 }),
    el('rect', 194, 226, 84, 38, { fill: P.tealLo, radius: 10 }),
    el('rect', 286, 174, 50, 42, { fill: P.goldLo, radius: 10 }),
    el('rect', 286, 224, 50, 40, { fill: P.violetLo, radius: 10 }),
  );
  // card info row
  els.push(
    el('rect', 20, 254, W - 40, 86, { fill: P.surface, radius: 24 }),
    tx('Brand Identity · 2025', 32, 262, 220, 14, { fontSize: 10, fontWeight: '700', letterSpacing: 2, color: P.violet }),
    tx('Nova Health Rebrand', 32, 277, 250, 20, { fontSize: 17, fontWeight: '800', letterSpacing: -0.5, color: P.text }),
    el('rect', W - 82, 262, 52, 22, { fill: P.violet, radius: 8 }),
    tx('View →', W - 76, 266, 42, 14, { fontSize: 9, fontWeight: '700', color: P.white, align: 'center' }),
    tx('14 assets · 3 revisions', 32, 302, 200, 13, { fontSize: 10, color: P.textMid }),
    el('ellipse', W - 72, 312, 8, 8, { fill: P.teal, radius: 99 }),
    tx('Active', W - 62, 308, 62, 14, { fontSize: 10, color: P.teal, fontWeight: '600' }),
  );

  // Recent Work section
  els.push(
    tx('Recent Work', 20, 358, 200, 18, { fontSize: 14, fontWeight: '700', color: P.text }),
    tx('See all →', W - 78, 360, 66, 16, { fontSize: 11, fontWeight: '600', color: P.violet, align: 'right' }),
  );

  const cards = [
    { label: 'UI Design', title: 'Pulse App',  bg: P.pinkLo,   accent: P.pink,   views: '2.4K' },
    { label: 'Motion',    title: '3D Titles',  bg: P.tealLo,   accent: P.teal,   views: '1.8K' },
    { label: 'Branding',  title: 'Bloom Co.',  bg: P.goldLo,   accent: P.gold,   views: '4.1K' },
    { label: 'Web',       title: 'Folio v3',   bg: P.violetLo, accent: P.violet, views: '5.7K' },
  ];
  cards.forEach((c, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const cx = 20 + col * 188, cy = 384 + row * 122;
    els.push(...glassCard(cx, cy, 178, 112, 16));
    els.push(
      el('rect', cx + 12, cy + 12, 154, 52, { fill: c.bg, radius: 10 }),
      el('ellipse', cx + 154, cy + 14, 12, 12, { fill: c.accent, radius: 99, opacity: 0.8 }),
      tx(c.label, cx + 12, cy + 72, 100, 14, { fontSize: 9, fontWeight: '700', letterSpacing: 1.5, color: c.accent }),
      tx(c.title, cx + 12, cy + 85, 154, 16, { fontSize: 13, fontWeight: '700', color: P.text }),
      tx(c.views + ' views', cx + 12, cy + 98, 100, 12, { fontSize: 9, color: P.textMid }),
    );
  });

  els.push(...bottomNav(0));
  return { id: 'screen-home', label: 'Home', width: W, height: H, backgroundColor: P.bg, elements: els };
}

// ── SCREEN 2: Project Detail ───────────────────────────────────────────────────

function screen2() {
  const els = [];
  els.push(el('rect', 0, 0, W, H, { fill: P.bg }));
  els.push(orb(300, 130, 300, P.pink, 0.09));
  els.push(orb(80, 520, 200, P.violet, 0.07));
  els.push(...statusBar(0));

  // Nav bar
  els.push(
    el('rect', 20, 54, 36, 36, { fill: P.surface, stroke: P.border, strokeWidth: 1, radius: 12 }),
    tx('←', 27, 63, 20, 18, { fontSize: 15, color: P.textMid }),
    tx('Project Detail', 68, 62, 200, 18, { fontSize: 14, fontWeight: '600', color: P.text }),
    el('rect', W - 56, 54, 36, 36, { fill: P.violetLo, stroke: 'transparent', radius: 12 }),
    tx('⋯', W - 46, 64, 20, 16, { fontSize: 13, color: P.violet }),
  );

  // Hero image block
  els.push(
    el('rect', 0, 100, W, 200, { fill: P.bg2 }),
    el('rect', 56, 126, 126, 88, { fill: P.pinkLo, radius: 20 }),
    el('rect', 196, 116, 148, 108, { fill: P.violetLo, radius: 20 }),
    el('rect', 132, 196, 50, 50, { fill: P.tealLo, radius: 12 }),
    tx('NOVA', 100, 175, 190, 50, { fontSize: 48, fontWeight: '900', letterSpacing: -2, color: P.text, align: 'center', opacity: 0.07 }),
    tx('1 of 14 assets', 150, 284, 90, 14, { fontSize: 9, color: P.textDim, align: 'center' }),
  );

  // Info card
  els.push(...glassCard(20, 310, W - 40, 160, 20, P.pink));
  els.push(
    tx('Brand Identity · Nova Health', 32, 320, 280, 14, { fontSize: 10, fontWeight: '700', letterSpacing: 2, color: P.pink }),
    tx('Nova Health\nRebrand', 32, 336, 280, 48, { fontSize: 24, fontWeight: '800', letterSpacing: -0.8, color: P.text, lineHeight: 1.2 }),
    tx('Complete visual identity overhaul — logo, UI kit, motion system, brand guidelines.', 32, 388, W - 64, 44, { fontSize: 11, color: P.textMid, lineHeight: 1.6 }),
    tx('Q1 2025 · 3 months', 32, 438, 160, 14, { fontSize: 10, color: P.textDim }),
    el('rect', W - 72, 434, 40, 18, { fill: P.teal, radius: 6 }),
    tx('Active', W - 67, 438, 32, 12, { fontSize: 9, fontWeight: '700', color: P.white, align: 'center' }),
  );

  // Metric pills
  const metrics = [
    { val: '14', lbl: 'Assets', color: P.violet },
    { val: '3', lbl: 'Revisions', color: P.pink },
    { val: '2.4K', lbl: 'Views', color: P.teal },
  ];
  metrics.forEach((m, i) => {
    const mx = 20 + i * 120, my = 482;
    els.push(...glassCard(mx, my, 108, 74, 16));
    els.push(
      tx(m.val, mx + 12, my + 12, 86, 28, { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, color: m.color }),
      tx(m.lbl, mx + 12, my + 48, 86, 14, { fontSize: 10, fontWeight: '600', color: P.textMid }),
    );
  });

  // Progress section
  els.push(
    tx('Project Progress', 20, 572, 200, 18, { fontSize: 12, fontWeight: '700', color: P.text }),
    tx('78%', W - 52, 572, 42, 18, { fontSize: 12, fontWeight: '700', color: P.violet, align: 'right' }),
    ...pBar(20, 596, W - 40, 0.78, P.violet),
  );

  const phases = [
    { label: 'Research', pct: 1.0, c: P.teal },
    { label: 'Identity', pct: 0.9, c: P.violet },
    { label: 'UI Kit',   pct: 0.7, c: P.pink },
    { label: 'Motion',   pct: 0.4, c: P.gold },
  ];
  phases.forEach((ph, i) => {
    const py = 612 + i * 30;
    els.push(
      tx(ph.label, 20, py, 80, 14, { fontSize: 10, color: P.textMid }),
      ...pBar(108, py + 3, 206, ph.pct, ph.c),
      tx(Math.round(ph.pct * 100) + '%', 324, py, 48, 14, { fontSize: 10, fontWeight: '600', color: ph.c, align: 'right' }),
    );
  });

  els.push(...bottomNav(1));
  return { id: 'screen-project', label: 'Project Detail', width: W, height: H, backgroundColor: P.bg, elements: els };
}

// ── SCREEN 3: Share & Publish ─────────────────────────────────────────────────

function screen3() {
  const els = [];
  els.push(el('rect', 0, 0, W, H, { fill: P.bg }));
  els.push(orb(200, 100, 320, P.teal, 0.09));
  els.push(orb(340, 500, 200, P.gold, 0.08));
  els.push(...statusBar(0));

  els.push(tx('Share Work', 20, 54, 220, 26, { fontSize: 20, fontWeight: '800', letterSpacing: -0.6, color: P.text }));

  // Preview card
  els.push(...glassCard(20, 90, W - 40, 138, 22));
  els.push(
    el('rect', 32, 102, 108, 78, { fill: P.pinkLo, radius: 14 }),
    el('rect', 152, 102, 82, 38, { fill: P.violetLo, radius: 10 }),
    el('rect', 152, 148, 82, 32, { fill: P.tealLo, radius: 10 }),
    el('rect', 246, 102, 100, 78, { fill: P.goldLo, radius: 14 }),
    tx('Nova Health Rebrand', 32, 190, W - 64, 18, { fontSize: 13, fontWeight: '700', color: P.text }),
    tx('Brand Identity · 14 assets', 32, 210, 220, 14, { fontSize: 10, color: P.textMid }),
  );

  // Share link
  els.push(tx('Share Link', 20, 244, 200, 16, { fontSize: 12, fontWeight: '700', letterSpacing: 1, color: P.text }));
  els.push(...glassCard(20, 264, W - 40, 50, 14));
  els.push(
    tx('lux.io/z/nXb94a2', 36, 279, 242, 18, { fontSize: 13, fontWeight: '500', color: P.violet }),
    el('rect', W - 68, 272, 38, 34, { fill: P.violet, radius: 10 }),
    tx('Copy', W - 62, 282, 28, 14, { fontSize: 9, fontWeight: '700', color: P.white, align: 'center' }),
  );

  // Platform share buttons
  els.push(tx('Share Via', 20, 330, 200, 16, { fontSize: 12, fontWeight: '700', letterSpacing: 1, color: P.text }));
  const platforms = [
    { name: 'Dribbble', color: '#EA4C89', icon: '◉' },
    { name: 'Behance',  color: '#053EFF', icon: '◈' },
    { name: 'X / Twitter', color: '#14171A', icon: '✕' },
    { name: 'LinkedIn', color: '#0A66C2', icon: '▣' },
  ];
  platforms.forEach((p, i) => {
    const px = 20 + (i % 2) * 180, py = 352 + Math.floor(i / 2) * 68;
    els.push(...glassCard(px, py, 168, 56, 14));
    els.push(
      el('ellipse', px + 18, py + 16, 24, 24, { fill: p.color, radius: 99, opacity: 0.14 }),
      tx(p.icon, px + 14, py + 18, 24, 20, { fontSize: 14, color: p.color, align: 'center' }),
      tx(p.name, px + 50, py + 20, 110, 16, { fontSize: 12, fontWeight: '600', color: P.text }),
    );
  });

  // Visibility toggle
  els.push(tx('Visibility', 20, 502, 200, 16, { fontSize: 12, fontWeight: '700', letterSpacing: 1, color: P.text }));
  els.push(...glassCard(20, 522, W - 40, 54, 16));
  els.push(
    tx('Public — anyone with link can view', 36, 541, 270, 16, { fontSize: 12, color: P.textMid }),
    el('rect', W - 68, 534, 44, 24, { fill: P.violet, radius: 12 }),
    el('ellipse', W - 28, 546, 18, 18, { fill: P.white, radius: 99 }),
  );

  // CTA
  els.push(
    el('rect', 20, 592, W - 40, 50, { fill: P.violet, radius: 16 }),
    tx('Publish to Portfolio', 20, 606, W - 40, 22, { fontSize: 14, fontWeight: '700', color: P.white, align: 'center' }),
    el('rect', 20, 652, W - 40, 46, { fill: 'transparent', stroke: P.border, strokeWidth: 1, radius: 16 }),
    tx('Save as Draft', 20, 665, W - 40, 18, { fontSize: 13, fontWeight: '600', color: P.textMid, align: 'center' }),
  );

  els.push(...bottomNav(2));
  return { id: 'screen-share', label: 'Share & Publish', width: W, height: H, backgroundColor: P.bg, elements: els };
}

// ── SCREEN 4: Explore ─────────────────────────────────────────────────────────

function screen4() {
  const els = [];
  els.push(el('rect', 0, 0, W, H, { fill: P.bg }));
  els.push(orb(350, 80, 260, P.gold, 0.09));
  els.push(orb(50, 420, 200, P.teal, 0.07));
  els.push(...statusBar(0));

  els.push(tx('Explore', 20, 54, 200, 26, { fontSize: 20, fontWeight: '800', letterSpacing: -0.6, color: P.text }));

  // Search
  els.push(...glassCard(20, 90, W - 40, 44, 14));
  els.push(
    tx('⌕', 36, 102, 24, 22, { fontSize: 14, color: P.textDim }),
    tx('Search creators, projects…', 62, 103, 240, 18, { fontSize: 13, color: P.textDim }),
  );

  // Filter chips
  ['Trending', 'UI/UX', 'Motion', 'Branding', 'Web'].forEach((chip, i) => {
    const cx = 20 + i * 68;
    if (cx + 62 > W) return;
    const active = i === 0;
    els.push(
      el('rect', cx, 146, 62, 26, {
        fill: active ? P.violet : P.surface,
        stroke: active ? 'transparent' : P.border, strokeWidth: 1, radius: 13,
      }),
      tx(chip, cx, 152, 62, 16, {
        fontSize: 10, align: 'center',
        color: active ? P.white : P.textMid,
        fontWeight: active ? '700' : '500',
      }),
    );
  });

  // Creator of the week
  els.push(...glassCard(20, 184, W - 40, 108, 20, P.gold));
  els.push(
    el('ellipse', 52, 218, 52, 52, { fill: P.goldLo, radius: 99, stroke: P.gold, strokeWidth: 2, opacity: 0.85 }),
    tx('MR', 38, 210, 52, 48, { fontSize: 18, fontWeight: '800', color: P.gold, align: 'center' }),
    tx('Creator of the Week', 116, 194, 210, 14, { fontSize: 9, fontWeight: '700', letterSpacing: 2, color: P.gold }),
    tx('Maya Rivera', 116, 208, 200, 18, { fontSize: 15, fontWeight: '800', color: P.text }),
    tx('Visual Director · São Paulo', 116, 226, 200, 14, { fontSize: 10, color: P.textMid }),
    el('rect', 116, 248, 80, 26, { fill: P.gold, radius: 10 }),
    tx('Follow', 116, 255, 80, 14, { fontSize: 11, fontWeight: '700', color: P.white, align: 'center' }),
    tx('12.4K followers', W - 102, 254, 82, 14, { fontSize: 10, color: P.textMid, align: 'right' }),
  );

  // Trending works
  els.push(tx('Trending Now', 20, 304, 200, 18, { fontSize: 14, fontWeight: '700', color: P.text }));

  const works = [
    { title: 'Organic UI System',   creator: 'J. Park',  bg: P.pinkLo,   accent: P.pink,   likes: '892' },
    { title: 'Type in Motion',      creator: 'A. Reyes', bg: P.tealLo,   accent: P.teal,   likes: '1.2K' },
    { title: 'Glassmorphism Kit',   creator: 'S. Chen',  bg: P.violetLo, accent: P.violet, likes: '3.4K' },
  ];
  works.forEach((w, i) => {
    const wy = 328 + i * 104;
    els.push(...glassCard(20, wy, W - 40, 94, 16));
    els.push(
      el('rect', 32, wy + 11, 70, 70, { fill: w.bg, radius: 13 }),
      el('rect', 46, wy + 24, 42, 42, { fill: w.accent, radius: 8, opacity: 0.25 }),
      tx(w.title, 116, wy + 15, 180, 18, { fontSize: 14, fontWeight: '700', color: P.text }),
      tx(w.creator, 116, wy + 34, 180, 14, { fontSize: 11, color: P.textMid }),
      tx('♡ ' + w.likes, 116, wy + 66, 100, 14, { fontSize: 11, color: P.textDim }),
      el('rect', W - 72, wy + 60, 42, 22, { fill: 'transparent', stroke: w.accent, strokeWidth: 1, radius: 8 }),
      tx('Save', W - 66, wy + 64, 32, 14, { fontSize: 9, fontWeight: '700', color: w.accent, align: 'center' }),
    );
  });

  els.push(...bottomNav(3));
  return { id: 'screen-explore', label: 'Explore', width: W, height: H, backgroundColor: P.bg, elements: els };
}

// ── SCREEN 5: Profile ─────────────────────────────────────────────────────────

function screen5() {
  const els = [];
  els.push(el('rect', 0, 0, W, H, { fill: P.bg }));
  els.push(orb(195, 170, 360, P.violet, 0.10));
  els.push(orb(340, 520, 180, P.pink, 0.07));
  els.push(...statusBar(0));

  els.push(
    tx('Profile', 20, 54, 200, 26, { fontSize: 20, fontWeight: '800', letterSpacing: -0.6, color: P.text }),
    el('rect', W - 56, 54, 36, 36, { fill: P.surface, stroke: P.border, strokeWidth: 1, radius: 12 }),
    tx('✎', W - 44, 63, 16, 16, { fontSize: 13, color: P.textMid }),
  );

  // Avatar
  els.push(
    el('ellipse', W / 2 - 44, 98, 88, 88, { fill: P.violetLo, radius: 99, stroke: P.border, strokeWidth: 2 }),
    el('ellipse', W / 2 - 46, 96, 92, 92, { fill: 'transparent', stroke: P.violet, strokeWidth: 2, radius: 99, opacity: 0.3 }),
    tx('ZK', W / 2 - 44, 118, 88, 48, { fontSize: 28, fontWeight: '800', color: P.violet, align: 'center' }),
    tx('Zara Kim', 0, 196, W, 22, { fontSize: 18, fontWeight: '800', letterSpacing: -0.4, color: P.text, align: 'center' }),
    tx('Visual Designer · Seoul', 0, 218, W, 16, { fontSize: 11, color: P.textMid, align: 'center' }),
  );

  // Stats
  const stats = [{ val: '48', lbl: 'Projects' }, { val: '12.4K', lbl: 'Followers' }, { val: '3.2K', lbl: 'Following' }];
  stats.forEach((s, i) => {
    const sx = 40 + i * 108;
    els.push(...glassCard(sx, 244, 100, 58, 14));
    els.push(
      tx(s.val, sx, 254, 100, 24, { fontSize: 20, fontWeight: '800', letterSpacing: -0.5, color: P.violet, align: 'center' }),
      tx(s.lbl, sx, 278, 100, 14, { fontSize: 9, fontWeight: '600', color: P.textMid, align: 'center', letterSpacing: 0.5 }),
    );
  });

  // Portfolio grid
  els.push(tx('Portfolio', 20, 318, 200, 18, { fontSize: 14, fontWeight: '700', color: P.text }));

  const gridPalette = [P.pinkLo, P.violetLo, P.tealLo, P.goldLo, P.tealLo, P.pinkLo];
  const gridAccent  = [P.pink,   P.violet,   P.teal,   P.gold,   P.teal,   P.pink  ];
  const gridNames   = ['Nova', 'Pulse', 'Bloom', 'Folio', 'Arc', 'Glow'];
  const gridSubs    = ['2025', 'UI', 'Brand', 'Web', 'Motion', '3D'];
  for (let i = 0; i < 6; i++) {
    const col = i % 3, row = Math.floor(i / 3);
    const gx = 20 + col * 118, gy = 342 + row * 108;
    els.push(
      el('rect', gx, gy, 110, 100, { fill: gridPalette[i], radius: 14 }),
      el('rect', gx + 10, gy + 10, 90, 52, { fill: gridAccent[i], radius: 8, opacity: 0.18 }),
      el('ellipse', gx + 96, gy + 10, 10, 10, { fill: gridAccent[i], radius: 99, opacity: 0.7 }),
      tx(gridNames[i], gx + 10, gy + 72, 90, 14, { fontSize: 11, fontWeight: '700', color: P.text }),
      tx(gridSubs[i],  gx + 10, gy + 86, 70, 12, { fontSize: 9, color: P.textMid }),
    );
  }

  // Edit CTA
  els.push(
    el('rect', 20, 564, W - 40, 48, { fill: P.violet, radius: 16 }),
    tx('Edit Profile', 20, 578, W - 40, 22, { fontSize: 13, fontWeight: '700', color: P.white, align: 'center' }),
  );

  els.push(...bottomNav(4));
  return { id: 'screen-profile', label: 'Profile', width: W, height: H, backgroundColor: P.bg, elements: els };
}

// ── ASSEMBLE PEN ──────────────────────────────────────────────────────────────

const screens = [screen1(), screen2(), screen3(), screen4(), screen5()];

const penFile = {
  version: '2.8',
  meta: {
    name: 'LUX — Creative Portfolio Studio',
    description: 'Light glassmorphism portfolio app for visual creators. Frosted glass cards over warm cream, prismatic accent glows (violet, pink, teal, gold), editorial typography. Inspired by Fluid Glass (Awwwards) + minimal.gallery airy aesthetics.',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    theme: 'light',
    archetype: 'portfolio-studio',
  },
  screens,
};

const out = '/workspace/group/design-studio/lux.pen';
fs.writeFileSync(out, JSON.stringify(penFile, null, 2));
console.log(`✓ lux.pen written — ${(fs.statSync(out).size / 1024).toFixed(1)} KB, ${screens.length} screens`);
