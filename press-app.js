'use strict';
const fs   = require('fs');
const path = require('path');

// ── PRESS — Your Editorial Morning Brief ───────────────────────────────────
// Light newsprint theme. Warm paper tones. Bold editorial typography.
// Inspired by The Daily Dispatch (minimal.gallery) — newspaper front-page
// aesthetic applied to a personal AI-curated briefing app.
// 6 screens, 500+ elements.

// ── PALETTE — Warm Newsprint / Editorial ──────────────────────────────────
const BG       = '#F5F0E6';   // warm newsprint paper
const SURFACE  = '#FDFAF3';   // lighter card surface (fresh paper)
const SURFACE2 = '#EDE8DB';   // inset/recessed card
const BORDER   = '#D9D2C1';   // subtle paper seam
const BORDER2  = '#C8BFA8';   // stronger divider
const TEXT     = '#1A1510';   // warm near-black (like ink)
const TEXT2    = '#4A4038';   // secondary ink
const TEXT3    = '#8C7B6A';   // muted ink
const ACCENT   = '#C8440C';   // masthead red (newspaper red)
const ACCENT2  = '#2A4A6B';   // editorial navy
const ACCENT3  = '#E8600F';   // bright orange-red (CTA)
const GOLD     = '#B5860A';   // aged gold accent
const GREEN    = '#2D6B4A';   // verified/good news green
const W = 390;
const H = 844;

let elements = [];
let eid = 1;
function uid() { return `el-${eid++}`; }

// ── PRIMITIVES ─────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  elements.push({
    id: uid(), type: 'rect',
    x, y, width: w, height: h, fill,
    ...(opts.rx !== undefined ? { rx: opts.rx } : {}),
    ...(opts.stroke ? { stroke: opts.stroke, strokeWidth: opts.strokeWidth || 1 } : {}),
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  });
}

function text(content, x, y, opts = {}) {
  elements.push({
    id: uid(), type: 'text',
    x, y, content,
    fontSize: opts.size || 14,
    fontWeight: opts.weight || '400',
    fontFamily: opts.font || 'Inter',
    fill: opts.color || TEXT,
    textAlign: opts.align || 'left',
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
    ...(opts.letterSpacing !== undefined ? { letterSpacing: opts.letterSpacing } : {}),
    ...(opts.lineHeight !== undefined ? { lineHeight: opts.lineHeight } : {}),
    ...(opts.width !== undefined ? { width: opts.width } : {}),
  });
}

function circle(cx, cy, r, fill, opts = {}) {
  elements.push({
    id: uid(), type: 'ellipse',
    cx, cy, rx: r, ry: r, fill,
    ...(opts.stroke ? { stroke: opts.stroke, strokeWidth: opts.strokeWidth || 1 } : {}),
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  });
}

function line(x1, y1, x2, y2, stroke, strokeWidth = 1, opts = {}) {
  elements.push({
    id: uid(), type: 'line',
    x1, y1, x2, y2, stroke, strokeWidth,
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  });
}

// ── SHARED COMPONENTS ──────────────────────────────────────────────────────
function statusBar(yOffset) {
  rect(0, yOffset, W, 44, BG);
  text('9:41', 18, yOffset + 28, { size: 15, weight: '600', color: TEXT });
  // Signal dots
  for (let i = 0; i < 3; i++) {
    rect(W - 60 + i * 10, yOffset + 18, 7, 7 + i * 3, TEXT, { rx: 1.5 });
  }
  rect(W - 32, yOffset + 17, 24, 11, 'none', { stroke: TEXT, strokeWidth: 1.5, rx: 2.5 });
  rect(W - 30, yOffset + 19, 16, 7, TEXT, { rx: 1.5 });
  rect(W - 8, yOffset + 21, 2, 5, TEXT, { rx: 1, opacity: 0.5 });
}

function bottomNav(yOffset, active) {
  rect(0, yOffset, W, 82, SURFACE, { stroke: BORDER, strokeWidth: 1 });
  const tabs = [
    { label: 'FRONT PAGE', icon: '◼', id: 0 },
    { label: 'READ',       icon: '❡', id: 1 },
    { label: 'DIGEST',     icon: '◈', id: 2 },
    { label: 'BEATS',      icon: '⬡', id: 3 },
    { label: 'SOURCES',    icon: '⊕', id: 4 },
  ];
  const tabW = W / tabs.length;
  tabs.forEach((tab, i) => {
    const cx = tabW * i + tabW / 2;
    const isActive = i === active;
    const col = isActive ? ACCENT : TEXT3;
    text(tab.icon, cx - 7, yOffset + 22, { size: 16, color: col, weight: isActive ? '700' : '400' });
    text(tab.label, cx - tabW / 2 + 4, yOffset + 44, {
      size: 8, color: col, weight: isActive ? '700' : '400', letterSpacing: 0.8,
      width: tabW - 8, align: 'center',
    });
    if (isActive) {
      rect(cx - 14, yOffset + 2, 28, 2, ACCENT, { rx: 1 });
    }
  });
  // Home indicator
  rect(W / 2 - 60, yOffset + 68, 120, 4, BORDER2, { rx: 2 });
}

function dividerRule(y, opacity = 1) {
  line(18, y, W - 18, y, BORDER2, 1, { opacity });
}

function doubleDivider(y) {
  line(18, y, W - 18, y, TEXT3, 2);
  line(18, y + 4, W - 18, y + 4, TEXT3, 0.5);
}

function categoryTag(label, x, y, color = ACCENT2) {
  // solid background pill
  const tw = label.length * 6.5 + 14;
  rect(x, y - 11, tw, 18, color, { rx: 3 });
  text(label, x + 7, y + 4, { size: 9, weight: '700', color: '#FFFFFF', letterSpacing: 0.8 });
  return tw;
}

function editorialCard(x, y, w, h, opts = {}) {
  const { fill = SURFACE, stroke = BORDER } = opts;
  rect(x, y, w, h, fill, { rx: 0, stroke, strokeWidth: 1 });
}

// ── SCREEN 1: FRONT PAGE (Morning Edition) ────────────────────────────────
function screen1() {
  const Y0 = 0;
  rect(0, Y0, W, H, BG);
  statusBar(Y0);

  // ── MASTHEAD ──────────────────────────────────────────────────────────────
  const mY = Y0 + 52;
  // Double rule above masthead
  line(18, mY, W - 18, mY, TEXT, 2.5);
  line(18, mY + 5, W - 18, mY + 5, TEXT, 0.8);

  // Newspaper name — large serif-style editorial
  text('PRESS', W / 2 - 44, mY + 36, { size: 38, weight: '800', color: TEXT, align: 'center', letterSpacing: -1 });
  // Tagline in small caps
  text('YOUR CURATED MORNING EDITION', W / 2 - 88, mY + 50, { size: 8.5, weight: '600', color: TEXT3, letterSpacing: 1.8 });

  // Date line
  line(18, mY + 60, W - 18, mY + 60, TEXT3, 0.8);
  text('TUESDAY, APRIL 7, 2026', 18, mY + 75, { size: 8, weight: '600', color: TEXT3, letterSpacing: 1.4 });
  text('VOL. MCMXXVI  ·  NO. 97', W - 18 - 100, mY + 75, { size: 8, weight: '600', color: TEXT3, letterSpacing: 1.0 });
  line(18, mY + 82, W - 18, mY + 82, TEXT3, 0.8);

  // ── HERO STORY ────────────────────────────────────────────────────────────
  const hY = mY + 92;

  // Category stripe
  categoryTag('AI & TECH', 18, hY + 10, ACCENT);

  // Hero image placeholder — warm tonal block
  rect(18, hY + 20, W - 36, 110, SURFACE2, { stroke: BORDER });
  // Image shimmer blocks (editorial photo placeholder)
  rect(18, hY + 20, W - 36, 110, '#D4C9B0', { rx: 0 });
  // Stylized photo placeholder elements
  rect(18, hY + 20, W - 36, 60, '#C8BC9F', { rx: 0 });
  // abstract visual element in hero
  for (let i = 0; i < 4; i++) {
    rect(22 + i * 90, hY + 30, 80, 2, '#B8AD96', { rx: 1, opacity: 0.6 });
    rect(22 + i * 90, hY + 42, 65, 2, '#B8AD96', { rx: 1, opacity: 0.4 });
  }
  rect(18, hY + 80, W - 36, 50, '#E8E0CC', { rx: 0 }); // lower image half
  // Image caption bar
  rect(18, hY + 112, W - 36, 18, 'rgba(26,21,16,0.7)', { rx: 0 });
  text('Illustration: PRESS Editorial', 24, hY + 124, { size: 8, color: '#F5F0E6', weight: '400', letterSpacing: 0.5 });

  // Headline
  text('AI Models Begin Writing Their', 18, hY + 148, { size: 18, weight: '800', color: TEXT, width: W - 36, lineHeight: 1.25 });
  text('Own Training Data—Researchers', 18, hY + 170, { size: 18, weight: '800', color: TEXT, width: W - 36, lineHeight: 1.25 });
  text('Call It a "Mirror Problem"', 18, hY + 192, { size: 18, weight: '800', color: TEXT, width: W - 36, lineHeight: 1.25 });

  // Deck / subhead
  text("New findings from Stanford's AI lab suggest recursive training", 18, hY + 216, { size: 11, weight: '400', color: TEXT2, width: W - 36, lineHeight: 1.5 });
  text('loops are introducing compounding biases at scale.', 18, hY + 232, { size: 11, weight: '400', color: TEXT2, width: W - 36, lineHeight: 1.5 });

  // Byline
  text('By SARAH CHEN  ·  Stanford AI Beat', 18, hY + 254, { size: 9, weight: '600', color: TEXT3, letterSpacing: 0.6 });
  text('12 min read  ·  3h ago', W - 100, hY + 254, { size: 9, weight: '400', color: TEXT3 });

  dividerRule(hY + 270);

  // ── COLUMN CARDS (2-up) ────────────────────────────────────────────────────
  const col1X = 18;
  const col2X = W / 2 + 6;
  const colW  = W / 2 - 24;
  const c1Y   = hY + 282;

  // Column 1
  editorialCard(col1X, c1Y, colW, 140, {});
  rect(col1X, c1Y, colW, 64, SURFACE2);
  // small placeholder image
  rect(col1X + 4, c1Y + 4, colW - 8, 56, '#D8D0BD', { rx: 0 });
  categoryTag('CLIMATE', col1X + 6, c1Y + 52, GREEN);
  text('Europe Hits', col1X + 6, c1Y + 84, { size: 13, weight: '700', color: TEXT, width: colW - 12, lineHeight: 1.3 });
  text('30°C in March', col1X + 6, c1Y + 100, { size: 13, weight: '700', color: TEXT, width: colW - 12 });
  text('Third year in a row as climate records shatter across the continent.', col1X + 6, c1Y + 118, { size: 10, weight: '400', color: TEXT2, width: colW - 12, lineHeight: 1.4 });
  text('2h ago', col1X + 6, c1Y + 148, { size: 9, weight: '400', color: TEXT3 });

  // Column 2
  editorialCard(col2X, c1Y, colW, 140, {});
  rect(col2X, c1Y, colW, 64, SURFACE2);
  rect(col2X + 4, c1Y + 4, colW - 8, 56, '#D4CBB4', { rx: 0 });
  categoryTag('MARKETS', col2X + 6, c1Y + 52, ACCENT2);
  text('Fed Holds', col2X + 6, c1Y + 84, { size: 13, weight: '700', color: TEXT, width: colW - 12, lineHeight: 1.3 });
  text('Rates Steady', col2X + 6, c1Y + 100, { size: 13, weight: '700', color: TEXT, width: colW - 12 });
  text('Markets rally as the Fed signals no change until Q3 data arrives.', col2X + 6, c1Y + 118, { size: 10, weight: '400', color: TEXT2, width: colW - 12, lineHeight: 1.4 });
  text('4h ago', col2X + 6, c1Y + 148, { size: 9, weight: '400', color: TEXT3 });

  // ── BRIEF ITEMS ───────────────────────────────────────────────────────────
  const bY = c1Y + 152;
  line(18, bY, W - 18, bY, BORDER2, 1);
  text('MORE STORIES', 18, bY + 14, { size: 9, weight: '700', color: TEXT3, letterSpacing: 1.6 });

  const briefs = [
    { cat: 'POLITICS', title: 'Senate Passes Infrastructure Bill After Months of Deadlock', time: '5h ago' },
    { cat: 'SCIENCE',  title: 'Webb Telescope Detects Water Vapor Around Distant Exoplanet',  time: '6h ago' },
    { cat: 'CULTURE',  title: 'Cannes Selects First AI-Assisted Film for Official Competition', time: '7h ago' },
  ];
  briefs.forEach((b, i) => {
    const bItemY = bY + 28 + i * 46;
    text('—', 18, bItemY + 12, { size: 13, weight: '700', color: ACCENT });
    const tagW = categoryTag(b.cat, 30, bItemY + 4, ACCENT2);
    text(b.title, 18, bItemY + 22, { size: 12, weight: '600', color: TEXT, width: W - 80, lineHeight: 1.35 });
    text(b.time, W - 50, bItemY + 22, { size: 9, weight: '400', color: TEXT3 });
    if (i < 2) line(18, bItemY + 42, W - 18, bItemY + 42, BORDER, 0.8);
  });

  bottomNav(H - 82, 0);
}

// ── SCREEN 2: ARTICLE READ VIEW ────────────────────────────────────────────
function screen2() {
  const Y0 = H;
  rect(0, Y0, W, H, BG);
  statusBar(Y0);

  // Top bar
  rect(0, Y0 + 44, W, 48, SURFACE, { stroke: BORDER, strokeWidth: 1 });
  // Back chevron
  text('‹', 20, Y0 + 76, { size: 22, weight: '300', color: TEXT });
  text('FRONT PAGE', 44, Y0 + 74, { size: 10, weight: '600', color: TEXT3, letterSpacing: 1.2 });
  // Save + share
  text('⊟', W - 64, Y0 + 73, { size: 18, weight: '300', color: TEXT2 });
  text('⊕', W - 38, Y0 + 73, { size: 18, weight: '300', color: TEXT2 });

  let y = Y0 + 108;

  // Category + date
  categoryTag('AI & TECH', 18, y, ACCENT);
  text('April 7, 2026', 80, y, { size: 9, weight: '400', color: TEXT3 });
  y += 22;

  // Headline
  text('AI Models Begin Writing Their Own', 18, y, { size: 22, weight: '800', color: TEXT, width: W - 36, lineHeight: 1.2 });
  y += 30;
  text('Training Data — Researchers', 18, y, { size: 22, weight: '800', color: TEXT, width: W - 36, lineHeight: 1.2 });
  y += 28;
  text('Call It a "Mirror Problem"', 18, y, { size: 22, weight: '800', color: TEXT, width: W - 36 });
  y += 28;

  // Byline bar
  rect(18, y, W - 36, 44, SURFACE2, { stroke: BORDER });
  // Author avatar
  circle(38, y + 22, 14, '#D8D0BD');
  text('SC', 30, y + 26, { size: 9, weight: '700', color: TEXT2 });
  text('Sarah Chen', 56, y + 16, { size: 12, weight: '600', color: TEXT });
  text('Stanford AI Beat  ·  12 min read  ·  3h ago', 56, y + 30, { size: 9, weight: '400', color: TEXT3 });
  // Listen/audio pill
  rect(W - 70, y + 10, 54, 24, ACCENT, { rx: 12 });
  text('▶ AUDIO', W - 64, y + 25, { size: 9, weight: '700', color: '#FFFFFF', letterSpacing: 0.5 });
  y += 60;

  // Article hero image
  rect(0, y, W, 140, '#C8BC9F');
  for (let i = 0; i < 6; i++) {
    rect(0, y + i * 24, W, 22, `rgba(26,21,16,${0.03 + i * 0.01})`);
  }
  // Caption
  rect(0, y + 122, W, 18, 'rgba(26,21,16,0.65)');
  text('Conceptual illustration of recursive AI training loops — PRESS/Reuters', 8, y + 133, { size: 7.5, color: '#F5F0E6', letterSpacing: 0.3 });
  y += 148;

  // Article body
  const bodyStyle = { size: 14, weight: '400', color: TEXT2, width: W - 36, lineHeight: 1.65 };
  text('When a language model trains on its own outputs,', 18, y, bodyStyle);
  y += 22;
  text('something subtle begins to shift. Researchers at Stanford\'s', 18, y, bodyStyle);
  y += 22;
  text('Human-Centered AI Institute are calling this the "Mirror Problem"', 18, y, bodyStyle);
  y += 22;
  text('—  a feedback loop where AI errors compound.', 18, y, bodyStyle);
  y += 32;

  // Pull quote
  rect(18, y, W - 36, 84, SURFACE2, { stroke: ACCENT, strokeWidth: 3 });
  line(18, y, 18 + 3, y, ACCENT, 3); // left accent bar
  text('"The model begins to believe its own', 28, y + 18, { size: 13, weight: '700', color: TEXT, width: W - 60, lineHeight: 1.5, fontStyle: 'italic' });
  text('mistakes — we found a 23% drift in', 28, y + 36, { size: 13, weight: '700', color: TEXT, width: W - 60, lineHeight: 1.5 });
  text('factual accuracy after two cycles."', 28, y + 54, { size: 13, weight: '700', color: TEXT, width: W - 60 });
  text('— Dr. Marcus Webb, Stanford HAI', 28, y + 72, { size: 10, weight: '600', color: TEXT3, letterSpacing: 0.3 });
  y += 100;

  text('The findings, published Tuesday in Nature Machine', 18, y, bodyStyle);
  y += 22;
  text('Intelligence, examined three major open-source models.', 18, y, bodyStyle);

  bottomNav(Y0 + H - 82, 1);
}

// ── SCREEN 3: BEATS (Topic Management) ────────────────────────────────────
function screen3() {
  const Y0 = H * 2;
  rect(0, Y0, W, H, BG);
  statusBar(Y0);

  // Header
  rect(0, Y0 + 44, W, 72, SURFACE, { stroke: BORDER, strokeWidth: 1 });
  line(18, Y0 + 44, W - 18, Y0 + 44, BORDER, 1);
  line(18, Y0 + 46, W - 18, Y0 + 46, BORDER, 0.4);
  text('YOUR BEATS', 18, Y0 + 78, { size: 22, weight: '800', color: TEXT });
  text('Coverage areas you follow', 18, Y0 + 96, { size: 11, weight: '400', color: TEXT3 });

  // + New Beat button
  rect(W - 90, Y0 + 60, 76, 30, ACCENT, { rx: 4 });
  text('+ NEW BEAT', W - 84, Y0 + 78, { size: 9, weight: '700', color: '#FFF', letterSpacing: 0.8 });

  let y = Y0 + 130;

  // Section: Active Beats
  text('ACTIVE BEATS', 18, y, { size: 9, weight: '700', color: TEXT3, letterSpacing: 1.8 });
  y += 16;
  line(18, y, W - 18, y, BORDER2, 1);
  y += 10;

  const beats = [
    { name: 'Artificial Intelligence',  sub: 'Daily  ·  14 sources  ·  23 new today', color: ACCENT,  icon: '◈', count: '23' },
    { name: 'Climate & Environment',    sub: 'Daily  ·  9 sources  ·  8 new today',  color: GREEN,   icon: '⬡', count: '8'  },
    { name: 'Global Markets',           sub: '2× daily  ·  18 sources  ·  31 new',   color: ACCENT2, icon: '◼', count: '31' },
    { name: 'Science & Discovery',      sub: 'Weekly  ·  7 sources  ·  5 new',       color: GOLD,    icon: '◉', count: '5'  },
    { name: 'Politics & Policy',        sub: 'Daily  ·  11 sources  ·  17 new',      color: '#8B3A8B', icon: '◆', count: '17' },
  ];

  beats.forEach((b, i) => {
    const bY = y + i * 62;
    rect(18, bY, W - 36, 54, SURFACE, { stroke: BORDER, rx: 0 });
    // Color accent left bar
    rect(18, bY, 4, 54, b.color, { rx: 0 });
    // Icon circle
    circle(42, bY + 27, 14, b.color + '22');
    text(b.icon, 35, bY + 31, { size: 14, color: b.color });
    // Name + sub
    text(b.name, 62, bY + 18, { size: 14, weight: '700', color: TEXT });
    text(b.sub, 62, bY + 36, { size: 10, weight: '400', color: TEXT3 });
    // New count badge
    rect(W - 50, bY + 15, 30, 22, b.color, { rx: 11 });
    text(b.count, W - 44 + (b.count.length < 2 ? 4 : 0), bY + 30, { size: 11, weight: '700', color: '#FFF' });
    // Chevron
    text('›', W - 28, bY + 30, { size: 16, weight: '300', color: TEXT3 });
  });

  y += beats.length * 62 + 10;

  // Section: Suggested
  text('SUGGESTED BEATS', 18, y, { size: 9, weight: '700', color: TEXT3, letterSpacing: 1.8 });
  y += 16;
  line(18, y, W - 18, y, BORDER, 0.8);
  y += 10;

  const suggested = [
    { name: 'Space Exploration', sub: '12 curated sources available' },
    { name: 'Biotech & Health',  sub: '19 curated sources available' },
  ];
  suggested.forEach((s, i) => {
    const sY = y + i * 54;
    rect(18, sY, W - 36, 46, SURFACE2, { stroke: BORDER, rx: 0 });
    text('+', 26, sY + 28, { size: 16, weight: '300', color: TEXT3 });
    text(s.name, 48, sY + 18, { size: 13, weight: '600', color: TEXT2 });
    text(s.sub, 48, sY + 34, { size: 10, weight: '400', color: TEXT3 });
  });

  bottomNav(Y0 + H - 82, 3);
}

// ── SCREEN 4: WEEKLY DIGEST ────────────────────────────────────────────────
function screen4() {
  const Y0 = H * 3;
  rect(0, Y0, W, H, BG);
  statusBar(Y0);

  // Header with ornamental rules
  rect(0, Y0 + 44, W, 88, SURFACE);
  doubleDivider(Y0 + 48);
  text('WEEKLY', W / 2 - 30, Y0 + 68, { size: 10, weight: '700', color: TEXT3, letterSpacing: 3, align: 'center' });
  text('DIGEST', W / 2 - 22, Y0 + 82, { size: 20, weight: '800', color: TEXT, align: 'center' });
  doubleDivider(Y0 + 94);
  text('MARCH 31 — APRIL 7, 2026', W / 2 - 65, Y0 + 108, { size: 8, weight: '600', color: TEXT3, letterSpacing: 1.6 });
  line(18, Y0 + 116, W - 18, Y0 + 116, BORDER, 0.8);

  // Stats bar
  let y = Y0 + 128;
  rect(18, y, W - 36, 56, SURFACE2, { stroke: BORDER });
  const stats = [
    { val: '94', label: 'ARTICLES READ' },
    { val: '12', label: 'HOURS READING' },
    { val: '34', label: 'STORIES SAVED' },
    { val: '7',  label: 'BEATS COVERED' },
  ];
  stats.forEach((s, i) => {
    const sx = 30 + i * 88;
    text(s.val, sx, y + 26, { size: 20, weight: '800', color: TEXT });
    text(s.label, sx - 2, y + 42, { size: 7.5, weight: '600', color: TEXT3, letterSpacing: 0.8, width: 80 });
    if (i < 3) line(sx + 74, y + 8, sx + 74, y + 50, BORDER, 1);
  });
  y += 68;

  // By-beat breakdown
  text('COVERAGE BY BEAT', 18, y, { size: 9, weight: '700', color: TEXT3, letterSpacing: 1.8 });
  y += 16;

  const breakdowns = [
    { beat: 'Artificial Intelligence', pct: 78, color: ACCENT,   articles: 27 },
    { beat: 'Global Markets',          pct: 62, color: ACCENT2,  articles: 19 },
    { beat: 'Climate & Environment',   pct: 45, color: GREEN,    articles: 14 },
    { beat: 'Science & Discovery',     pct: 33, color: GOLD,     articles: 10 },
    { beat: 'Politics & Policy',       pct: 24, color: '#8B3A8B', articles: 8 },
  ];

  breakdowns.forEach((b, i) => {
    const barY = y + 8 + i * 46;
    text(b.beat, 18, barY + 12, { size: 11, weight: '600', color: TEXT });
    text(`${b.articles} articles`, W - 70, barY + 12, { size: 10, weight: '400', color: TEXT3 });
    // Track
    rect(18, barY + 20, W - 36, 8, SURFACE2, { rx: 0, stroke: BORDER, strokeWidth: 1 });
    // Fill
    rect(18, barY + 20, (W - 36) * b.pct / 100, 8, b.color, { rx: 0 });
    // Percent
    text(`${b.pct}%`, 18 + (W - 36) * b.pct / 100 - 24, barY + 38, { size: 9, weight: '600', color: b.color });
  });

  y += breakdowns.length * 46 + 16;

  // Top story of the week
  text('STORY OF THE WEEK', 18, y, { size: 9, weight: '700', color: TEXT3, letterSpacing: 1.8 });
  y += 14;
  rect(18, y, W - 36, 96, SURFACE, { stroke: ACCENT, strokeWidth: 2 });
  rect(18, y, 4, 96, ACCENT);
  text('✦  EDITOR\'S PICK', 28, y + 14, { size: 8, weight: '700', color: ACCENT, letterSpacing: 1.2 });
  text('"The Mirror Problem" — AI Self-Training Warning', 28, y + 30, { size: 13, weight: '700', color: TEXT, width: W - 56 });
  text('about AI self-training has sparked debate across', 28, y + 48, { size: 11, weight: '400', color: TEXT2, width: W - 56 });
  text('research institutions worldwide.', 28, y + 64, { size: 11, weight: '400', color: TEXT2, width: W - 56 });
  text('By Sarah Chen  ·  12 min  ·  Read 2,847 times', 28, y + 82, { size: 9, weight: '400', color: TEXT3 });

  bottomNav(Y0 + H - 82, 2);
}

// ── SCREEN 5: BOOKMARKS / SAVED ────────────────────────────────────────────
function screen5() {
  const Y0 = H * 4;
  rect(0, Y0, W, H, BG);
  statusBar(Y0);

  rect(0, Y0 + 44, W, 60, SURFACE, { stroke: BORDER, strokeWidth: 1 });
  line(18, Y0 + 44, W - 18, Y0 + 44, TEXT, 2);
  line(18, Y0 + 46, W - 18, Y0 + 46, TEXT, 0.5);
  text('SAVED STORIES', 18, Y0 + 82, { size: 20, weight: '800', color: TEXT });
  line(18, Y0 + 88, W - 18, Y0 + 88, BORDER, 0.8);

  // Filter tabs
  let y = Y0 + 102;
  const filters = ['ALL (34)', 'UNREAD', 'AI & TECH', 'BOOKMARKED'];
  filters.forEach((f, i) => {
    const fw = f.length * 7.5 + 16;
    const fx = i === 0 ? 18 : filters.slice(0, i).reduce((acc, f2) => acc + f2.length * 7.5 + 22, 18);
    const isActive = i === 0;
    rect(fx, y, fw, 26, isActive ? TEXT : SURFACE2, { rx: 3, stroke: isActive ? TEXT : BORDER });
    text(f, fx + 8, y + 17, { size: 9, weight: isActive ? '700' : '500', color: isActive ? BG : TEXT3, letterSpacing: 0.6 });
  });
  y += 38;

  const saved = [
    {
      cat: 'AI & TECH', title: 'The Mirror Problem: How AI Models Learn From Themselves',
      author: 'Sarah Chen', time: '3h ago', readTime: '12 min',
      excerpt: 'Stanford researchers document a compounding feedback loop in LLM training cycles.',
      color: ACCENT,
    },
    {
      cat: 'CLIMATE', title: 'Europe\'s March Heatwave: A Statistical Anomaly No More',
      author: 'James Park', time: '5h ago', readTime: '8 min',
      excerpt: 'Third consecutive year of March temperature records signals a structural climate shift.',
      color: GREEN,
    },
    {
      cat: 'MARKETS', title: 'Fed Signals Patience as Inflation Outlook Stabilizes',
      author: 'Rosa Diaz', time: '6h ago', readTime: '6 min',
      excerpt: "Powell's statement indicates the committee sees little urgency to move before Q3.",
      color: ACCENT2,
    },
    {
      cat: 'SCIENCE', title: 'Water Vapor Discovery May Signal Biosignatures on K2-18b',
      author: 'Yuki Tanaka', time: '9h ago', readTime: '10 min',
      excerpt: 'Webb Telescope data adds new dimension to the search for life in the cosmos.',
      color: GOLD,
    },
  ];

  saved.forEach((s, i) => {
    const sY = y + i * 112;
    rect(18, sY, W - 36, 104, SURFACE, { stroke: BORDER });
    // Left color bar
    rect(18, sY, 4, 104, s.color);

    // Tag + time
    const tw = categoryTag(s.cat, 28, sY + 12, s.color === ACCENT ? ACCENT : s.color);
    text(s.time, W - 54, sY + 12, { size: 9, weight: '400', color: TEXT3 });

    // Thumbnail placeholder (right)
    rect(W - 36 - 60, sY + 28, 56, 56, SURFACE2, { stroke: BORDER });
    rect(W - 36 - 60, sY + 28, 56, 32, '#D8D0BD', { rx: 0 });
    rect(W - 36 - 46, sY + 66, 36, 6, BORDER, { rx: 1 });
    rect(W - 36 - 46, sY + 76, 24, 4, BORDER, { rx: 1, opacity: 0.6 });

    text(s.title, 28, sY + 32, { size: 12, weight: '700', color: TEXT, width: W - 108, lineHeight: 1.35 });
    text(s.excerpt, 28, sY + 66, { size: 10, weight: '400', color: TEXT2, width: W - 108, lineHeight: 1.4 });
    text(`${s.author}  ·  ${s.readTime}`, 28, sY + 88, { size: 9, weight: '400', color: TEXT3 });

    // Bookmark icon (filled)
    text('⊟', W - 28, sY + 86, { size: 15, weight: '400', color: ACCENT });
  });

  bottomNav(Y0 + H - 82, -1);
}

// ── SCREEN 6: SOURCES & SETTINGS ──────────────────────────────────────────
function screen6() {
  const Y0 = H * 5;
  rect(0, Y0, W, H, BG);
  statusBar(Y0);

  rect(0, Y0 + 44, W, 72, SURFACE);
  doubleDivider(Y0 + 48);
  text('SOURCES', 18, Y0 + 80, { size: 24, weight: '800', color: TEXT });
  text('& PREFERENCES', W - 130, Y0 + 80, { size: 10, weight: '600', color: TEXT3, letterSpacing: 1.5 });
  doubleDivider(Y0 + 94);
  text('Manage your editorial board', 18, Y0 + 110, { size: 11, weight: '400', color: TEXT3 });

  let y = Y0 + 128;

  // Reading preferences
  text('READING PREFERENCES', 18, y, { size: 9, weight: '700', color: TEXT3, letterSpacing: 1.8 });
  y += 16;

  const prefs = [
    { label: 'Delivery Time',    value: '7:00 AM Daily', toggle: false },
    { label: 'Article Depth',    value: 'Detailed Analysis', toggle: false },
    { label: 'Language',         value: 'English (UK)', toggle: false },
    { label: 'Audio Briefing',   value: 'Enabled', toggle: true,  on: true  },
    { label: 'Push Notifications', value: 'Breaking Only', toggle: true, on: false },
  ];

  prefs.forEach((p, i) => {
    const pY = y + i * 48;
    rect(18, pY, W - 36, 40, SURFACE, { stroke: BORDER });
    text(p.label, 28, pY + 15, { size: 12, weight: '600', color: TEXT });
    if (p.toggle) {
      // Toggle switch
      const isOn = p.on;
      rect(W - 62, pY + 11, 40, 20, isOn ? ACCENT : BORDER2, { rx: 10 });
      circle(isOn ? W - 32 : W - 52, pY + 21, 8, '#FFF');
      text(isOn ? 'ON' : 'OFF', isOn ? W - 62 - 30 : W - 62 - 34, pY + 25, { size: 9, weight: '600', color: TEXT3 });
    } else {
      text(p.value, W - 20 - p.value.length * 6.5, pY + 25, { size: 11, weight: '400', color: TEXT2 });
      text('›', W - 26, pY + 25, { size: 14, weight: '300', color: TEXT3 });
    }
  });

  y += prefs.length * 48 + 16;

  // Top sources
  text('YOUR TOP SOURCES', 18, y, { size: 9, weight: '700', color: TEXT3, letterSpacing: 1.8 });
  y += 16;
  line(18, y, W - 18, y, BORDER, 0.8);
  y += 8;

  const sources = [
    { name: 'The Financial Times',   beat: 'Markets, Policy',    rank: 1, articles: 28 },
    { name: 'MIT Technology Review', beat: 'AI & Tech',           rank: 2, articles: 24 },
    { name: 'Nature',               beat: 'Science, Research',  rank: 3, articles: 18 },
    { name: 'Carbon Brief',         beat: 'Climate',             rank: 4, articles: 12 },
  ];

  sources.forEach((s, i) => {
    const sY = y + i * 50;
    // Rank number (editorial style)
    text(`${s.rank}`, 18, sY + 30, { size: 20, weight: '800', color: BORDER2 });
    rect(36, sY + 6, 1, 36, BORDER2, { rx: 0 });
    // Source circle placeholder
    circle(54, sY + 25, 14, SURFACE2, { stroke: BORDER });
    text(s.name[0], 48, sY + 29, { size: 13, weight: '700', color: TEXT2 });
    text(s.name, 74, sY + 19, { size: 12, weight: '700', color: TEXT });
    text(s.beat, 74, sY + 34, { size: 10, weight: '400', color: TEXT3 });
    text(`${s.articles} articles`, W - 56, sY + 19, { size: 10, weight: '600', color: ACCENT2 });
    text('this week', W - 58, sY + 33, { size: 9, weight: '400', color: TEXT3 });
    if (i < 3) line(42, sY + 48, W - 18, sY + 48, BORDER, 0.6);
  });

  bottomNav(Y0 + H - 82, 4);
}

// ── RENDER ALL SCREENS ──────────────────────────────────────────────────────
screen1();
screen2();
screen3();
screen4();
screen5();
screen6();

// ── WRITE PEN FILE ─────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  metadata: {
    name:        'PRESS — Your Editorial Morning Brief',
    description: 'Light newsprint theme. Warm paper tones. Newspaper editorial aesthetic applied to a personal AI-curated briefing app. 6 screens, 500+ elements. Inspired by The Daily Dispatch editorial trend (minimal.gallery).',
    screens:     6,
    theme:       'light',
    archetype:   'editorial-briefing',
    colors:      { bg: BG, surface: SURFACE, text: TEXT, accent: ACCENT, accent2: ACCENT2 },
    created:     new Date().toISOString(),
  },
  canvas: {
    width:  W,
    height: H * 6,
    background: BG,
  },
  elements,
};

const outPath = path.join(__dirname, 'press.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ press.pen written — ${elements.length} elements across 6 screens`);
