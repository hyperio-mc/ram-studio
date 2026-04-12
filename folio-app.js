/**
 * FOLIO — Your Personal Research Companion
 * RAM Design Heartbeat | 2026-04-08
 *
 * Inspired by The Daily Dispatch on minimal.gallery:
 * editorial warm-cream palette meets AI-powered personal research briefings.
 * LIGHT THEME (previous design Writ was dark)
 */

const fs = require('fs');
const path = require('path');

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  bg:       '#EDE9E2',
  surface:  '#F8F5EE',
  white:    '#FFFFFF',
  text:     '#1C1712',
  textMid:  '#5C5348',
  muted:    'rgba(28,23,18,0.38)',
  accent:   '#C13522',
  accentLt: 'rgba(193,53,34,0.10)',
  green:    '#3D7A5C',
  greenLt:  'rgba(61,122,92,0.12)',
  border:   'rgba(28,23,18,0.10)',
  borderMd: 'rgba(28,23,18,0.18)',
  gold:     '#A07A3A',
  goldLt:   'rgba(160,122,58,0.12)',
};

const SERIF = "'Georgia','Times New Roman',serif";
const SANS  = "'Inter','SF Pro Text',-apple-system,sans-serif";

const W = 390;
const H = 844;

// ─── Primitives ───────────────────────────────────────────────────────────────
function rect(x, y, w, h, opts = {}) {
  const { fill = 'transparent', radius = 0, border = 'none', opacity = 1, shadow } = opts;
  const layer = {
    type: 'rectangle', position: { x, y }, size: { width: w, height: h },
    style: { backgroundColor: fill, borderRadius: radius, border, opacity }
  };
  if (shadow) layer.style.boxShadow = shadow;
  return layer;
}

function text(x, y, str, opts = {}) {
  const { size = 14, weight = '400', color = C.text, font = SANS,
    align = 'left', spacing = 0, transform = 'none', lineH = 1.3, opacity = 1 } = opts;
  return {
    type: 'text', text: str, position: { x, y },
    style: { fontSize: size, fontWeight: weight, color, fontFamily: font,
      textAlign: align, letterSpacing: spacing, textTransform: transform,
      lineHeight: lineH, opacity }
  };
}

function line(x1, y1, x2, y2, opts = {}) {
  const { stroke = C.border, width = 1 } = opts;
  return { type: 'line', points: [{ x: x1, y: y1 }, { x: x2, y: y2 }],
    style: { stroke, strokeWidth: width } };
}

function ellipse(x, y, rx, ry, opts = {}) {
  const { fill = C.accent, stroke = 'none', strokeWidth = 0 } = opts;
  return {
    type: 'ellipse', position: { x, y }, size: { width: rx * 2, height: ry * 2 },
    style: { backgroundColor: fill,
      border: stroke !== 'none' ? strokeWidth + 'px solid ' + stroke : 'none' }
  };
}

// ─── Shared Components ────────────────────────────────────────────────────────
function statusBar() {
  return [
    rect(0, 0, W, 44, { fill: C.bg }),
    text(20, 14, '9:41', { size: 15, weight: '600', color: C.text }),
    text(W - 70, 14, 'lll 100%', { size: 11, weight: '500', color: C.text }),
  ];
}

function navBar(title, subtitle) {
  const layers = [
    rect(0, 44, W, 60, { fill: C.bg }),
    line(0, 104, W, 104, { stroke: C.text, width: 1.5 }),
    line(0, 107, W, 107, { stroke: C.text, width: 0.5 }),
    text(W / 2, 60, 'FOLIO', {
      size: 10, weight: '700', color: C.accent, font: SANS,
      align: 'center', spacing: 3, transform: 'uppercase'
    }),
    text(W / 2, 80, title, {
      size: 20, weight: '700', color: C.text, font: SERIF, align: 'center'
    }),
  ];
  if (subtitle) {
    layers.push(text(W / 2, 100, subtitle, {
      size: 10, weight: '400', color: C.muted, font: SANS, align: 'center'
    }));
  }
  return layers;
}

function tabBar(active) {
  const tabs = ['Brief', 'Threads', 'Sources', 'Map', 'You'];
  const icons = ['@', '=', 'O', 'o', 'u'];
  const tw = W / tabs.length;
  const layers = [
    rect(0, H - 82, W, 82, { fill: C.surface, border: '1px solid ' + C.borderMd,
      shadow: '0 -1px 12px rgba(28,23,18,0.08)' }),
    line(0, H - 82, W, H - 82, { stroke: C.text, width: 0.75 }),
  ];
  tabs.forEach(function(tab, i) {
    const cx = tw * i + tw / 2;
    const isActive = i === active;
    layers.push(text(cx, H - 64, tabs[i], {
      size: 10, weight: isActive ? '700' : '400',
      color: isActive ? C.text : C.muted, font: SANS, align: 'center', spacing: 0.3
    }));
    if (isActive) {
      layers.push(rect(cx - 12, H - 82, 24, 2, { fill: C.accent, radius: 1 }));
    }
  });
  return layers;
}

// ─── SCREEN 1: Today's Brief ──────────────────────────────────────────────────
function screen1() {
  const layers = [
    rect(0, 0, W, H, { fill: C.bg }),
    ...statusBar(),
    ...navBar("Today's Brief"),
  ];

  // Dateline
  layers.push(
    line(0, 108, W, 108, { stroke: C.border }),
    text(20, 119, 'TUESDAY, APRIL 8, 2026  |  VOL. 12  NO. 241', {
      size: 9, weight: '500', color: C.muted, font: SANS, spacing: 0.8
    }),
    line(0, 134, W, 134, { stroke: C.border })
  );

  // Top story card
  layers.push(
    rect(16, 140, W - 32, 150, { fill: C.white, radius: 4,
      border: '1px solid ' + C.border, shadow: '0 2px 8px rgba(28,23,18,0.06)' }),
    rect(24, 152, 58, 18, { fill: C.accentLt, radius: 2 }),
    text(28, 157, 'TOP STORY', { size: 8, weight: '700', color: C.accent, font: SANS, spacing: 0.8 }),
    text(24, 178, 'AI regulation frameworks', { size: 17, weight: '700', color: C.text, font: SERIF, lineH: 1.25 }),
    text(24, 200, 'gain momentum in EU', { size: 17, weight: '700', color: C.text, font: SERIF, lineH: 1.25 }),
    text(24, 222, 'Three new proposals expected this quarter;', {
      size: 12, weight: '400', color: C.textMid, font: SERIF, lineH: 1.4 }),
    text(24, 238, 'experts debate long-term impact on frontier labs.', {
      size: 12, weight: '400', color: C.textMid, font: SERIF, lineH: 1.4 }),
    line(24, 260, W - 48, 260, { stroke: C.border }),
    text(24, 272, '4 sources  |  8 thread matches', { size: 10, weight: '400', color: C.muted, font: SANS }),
    text(W - 28, 272, '2 min', { size: 10, weight: '400', color: C.muted, font: SANS, align: 'right' })
  );

  // Section label
  layers.push(
    text(20, 306, 'FROM YOUR THREADS', { size: 9, weight: '700', color: C.accent, font: SANS, spacing: 1.5 }),
    line(20, 320, W - 20, 320, { stroke: C.border })
  );

  // Story 2
  layers.push(
    rect(16, 326, W - 32, 88, { fill: C.surface, radius: 4, border: '1px solid ' + C.border }),
    rect(24, 336, 52, 16, { fill: C.greenLt, radius: 2 }),
    text(28, 341, 'BIOTECH', { size: 8, weight: '700', color: C.green, font: SANS, spacing: 0.6 }),
    text(24, 361, 'CRISPR trial shows 94% efficacy rate', { size: 14, weight: '600', color: C.text, font: SERIF }),
    text(24, 381, 'Phase III results exceed projected benchmarks', {
      size: 11, weight: '400', color: C.textMid, font: SANS }),
    text(24, 400, '18 min ago', { size: 9, weight: '400', color: C.muted, font: SANS })
  );

  // Story 3
  layers.push(
    rect(16, 424, W - 32, 88, { fill: C.surface, radius: 4, border: '1px solid ' + C.border }),
    rect(24, 434, 52, 16, { fill: C.goldLt, radius: 2 }),
    text(28, 439, 'MARKETS', { size: 8, weight: '700', color: C.gold, font: SANS, spacing: 0.6 }),
    text(24, 459, 'Fed signals cautious rate outlook ahead', { size: 14, weight: '600', color: C.text, font: SERIF }),
    text(24, 479, 'Markets respond mildly; analyst forecasts diverge', {
      size: 11, weight: '400', color: C.textMid, font: SANS }),
    text(24, 498, '1 hr ago', { size: 9, weight: '400', color: C.muted, font: SANS })
  );

  // AI digest strip
  layers.push(
    rect(16, 522, W - 32, 64, { fill: 'rgba(193,53,34,0.06)', radius: 4,
      border: '1px solid rgba(193,53,34,0.15)' }),
    text(24, 534, '+ AI Digest', { size: 11, weight: '700', color: C.accent, font: SANS }),
    text(24, 552, '3 of your topics intersect today. Folio found a', {
      size: 11, weight: '400', color: C.text, font: SANS }),
    text(24, 568, 'pattern across AI Policy, Biotech & Markets.', {
      size: 11, weight: '400', color: C.textMid, font: SANS })
  );

  // Reading time estimate
  layers.push(
    rect(16, 598, W - 32, 36, { fill: C.surface, radius: 4, border: '1px solid ' + C.border }),
    text(24, 613, 'Today\'s brief  |  Est. 12 min read  |  9 articles', {
      size: 11, weight: '400', color: C.muted, font: SANS
    })
  );

  layers.push(...tabBar(0));
  return { id: 'brief', name: "Today's Brief", background: C.bg, layers };
}

// ─── SCREEN 2: Story View ─────────────────────────────────────────────────────
function screen2() {
  const layers = [
    rect(0, 0, W, H, { fill: C.bg }),
    ...statusBar(),
    rect(0, 44, W, 50, { fill: C.bg }),
    text(20, 66, '< Back', { size: 14, weight: '500', color: C.accent, font: SANS }),
    text(W - 24, 66, '[+]', { size: 14, color: C.muted, align: 'right' }),
    line(0, 94, W, 94, { stroke: C.text, width: 1.5 }),
    line(0, 97, W, 97, { stroke: C.text, width: 0.5 }),
  ];

  // Article header
  layers.push(
    text(20, 112, 'ARTIFICIAL INTELLIGENCE  |  REGULATION', {
      size: 8, weight: '600', color: C.accent, font: SANS, spacing: 1 }),
    text(20, 134, 'AI regulation frameworks', {
      size: 24, weight: '700', color: C.text, font: SERIF, lineH: 1.2 }),
    text(20, 164, 'gain momentum in EU', {
      size: 24, weight: '700', color: C.text, font: SERIF, lineH: 1.2 }),
    line(20, 190, W - 20, 190, { stroke: C.border }),
    ellipse(20, 198, 12, 12, { fill: C.accent }),
    text(50, 207, 'Folio AI  |  Synthesized from 4 sources  |  Apr 8', {
      size: 10, weight: '400', color: C.muted, font: SANS }),
    line(20, 222, W - 20, 222, { stroke: C.border })
  );

  // AI summary pull quote
  layers.push(
    rect(16, 230, W - 32, 98, { fill: C.white, radius: 4,
      border: '1px solid ' + C.border, shadow: '0 1px 4px rgba(28,23,18,0.06)' }),
    rect(16, 230, 4, 98, { fill: C.accent, radius: 2 }),
    text(28, 244, '+ AI SUMMARY', { size: 8, weight: '700', color: C.accent, font: SANS, spacing: 1 }),
    text(28, 262, 'Three EU proposals set binding compute thresholds', {
      size: 12, weight: '400', color: C.text, font: SERIF, lineH: 1.5 }),
    text(28, 280, 'and mandatory audits for frontier models.', {
      size: 12, weight: '400', color: C.text, font: SERIF, lineH: 1.5 }),
    text(28, 298, 'Expected Q3 2026 parliamentary vote.', {
      size: 12, weight: '400', color: C.text, font: SERIF, lineH: 1.5 }),
    text(28, 318, 'Confidence: High  |  3 primary sources', {
      size: 9, weight: '500', color: C.muted, font: SANS })
  );

  // Body text with drop cap effect
  layers.push(
    text(20, 342, 'T', { size: 44, weight: '700', color: C.accent, font: SERIF }),
    text(50, 356, 'he European Parliament AI Committee', {
      size: 13, weight: '400', color: C.text, font: SERIF, lineH: 1.55 }),
    text(20, 376, 'published three competing drafts last week, each', {
      size: 13, weight: '400', color: C.text, font: SERIF, lineH: 1.55 }),
    text(20, 396, 'addressing compute governance differently.', {
      size: 13, weight: '400', color: C.text, font: SERIF, lineH: 1.55 }),
    text(20, 424, 'Proponents argue binding thresholds create legal', {
      size: 13, weight: '400', color: C.text, font: SERIF, lineH: 1.55 }),
    text(20, 444, 'certainty for operators. Critics note enforcement', {
      size: 13, weight: '400', color: C.text, font: SERIF, lineH: 1.55 }),
    text(20, 464, 'across member states varies significantly.', {
      size: 13, weight: '400', color: C.text, font: SERIF, lineH: 1.55 })
  );

  // Thread connection chip
  layers.push(
    rect(16, 488, W - 32, 40, { fill: C.greenLt, radius: 20,
      border: '1px solid rgba(61,122,92,0.25)' }),
    text(W / 2, 507, 'Linked to "AI Policy" thread  |  3 connections', {
      size: 11, weight: '500', color: C.green, font: SANS, align: 'center' })
  );

  // Sources
  layers.push(
    text(20, 544, 'SOURCES', { size: 8, weight: '700', color: C.muted, font: SANS, spacing: 1 })
  );
  const srcs = ['Reuters', 'Politico EU', 'TechCrunch', 'Financial Times'];
  srcs.forEach(function(s, i) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = col === 0 ? 16 : W / 2 + 4;
    const y = 558 + row * 36;
    layers.push(
      rect(x, y, W / 2 - 20, 28, { fill: C.surface, radius: 4, border: '1px solid ' + C.border }),
      text(x + 10, y + 9, s, { size: 11, weight: '500', color: C.text, font: SANS })
    );
  });

  layers.push(...tabBar(0));
  return { id: 'story', name: 'Story View', background: C.bg, layers };
}

// ─── SCREEN 3: Threads ────────────────────────────────────────────────────────
function screen3() {
  const layers = [
    rect(0, 0, W, H, { fill: C.bg }),
    ...statusBar(),
    ...navBar('Threads', '5 active topics'),
    rect(W - 56, 52, 36, 36, { fill: C.accent, radius: 18 }),
    text(W - 40, 70, '+', { size: 22, weight: '300', color: '#fff', align: 'center' }),
  ];

  const threads = [
    { name: 'AI Policy & Regulation', count: 24, recent: '2 new today', color: C.accent, bg: C.accentLt },
    { name: 'Biotech & Longevity', count: 18, recent: '1 new today', color: C.green, bg: C.greenLt },
    { name: 'Macro Economics', count: 31, recent: '4 new today', color: C.gold, bg: C.goldLt },
    { name: 'Climate & Energy', count: 12, recent: 'Nothing new', color: C.textMid, bg: C.border },
    { name: 'Space & Deep Tech', count: 9, recent: '1 new today', color: C.green, bg: C.greenLt },
  ];

  threads.forEach(function(t, i) {
    const y = 120 + i * 100;
    layers.push(
      rect(16, y, W - 32, 88, { fill: C.white, radius: 6,
        border: '1px solid ' + C.border, shadow: '0 1px 4px rgba(28,23,18,0.05)' }),
      rect(16, y, 4, 88, { fill: t.color, radius: 2 }),
      rect(28, y + 20, 36, 36, { fill: t.bg, radius: 18 }),
      text(46, y + 38, '#', { size: 18, weight: '700', color: t.color, align: 'center', font: SERIF }),
      text(78, y + 28, t.name, { size: 14, weight: '600', color: C.text, font: SERIF }),
      text(78, y + 48, t.count + ' articles', { size: 11, weight: '400', color: C.muted, font: SANS }),
      text(78 + 76, y + 48, t.recent, {
        size: 11, weight: '500',
        color: t.recent === 'Nothing new' ? C.muted : t.color, font: SANS
      }),
      rect(78, y + 66, W - 122, 4, { fill: C.border, radius: 2 }),
      rect(78, y + 66, Math.round((t.count / 35) * (W - 122)), 4, { fill: t.color, radius: 2 }),
      text(W - 28, y + 44, '>', { size: 18, color: C.muted, align: 'right' })
    );
  });

  layers.push(...tabBar(1));
  return { id: 'threads', name: 'Threads', background: C.bg, layers };
}

// ─── SCREEN 4: Sources Library ────────────────────────────────────────────────
function screen4() {
  const layers = [
    rect(0, 0, W, H, { fill: C.bg }),
    ...statusBar(),
    ...navBar('Sources', '32 publications'),
  ];

  // Search
  layers.push(
    rect(16, 114, W - 32, 38, { fill: C.white, radius: 6, border: '1px solid ' + C.borderMd }),
    text(44, 131, 'Search sources...', { size: 13, weight: '400', color: C.muted, font: SANS }),
    text(28, 131, 'O', { size: 15, color: C.muted })
  );

  // Category pills
  const cats = ['All', 'Science', 'Policy', 'Markets', 'Tech'];
  cats.forEach(function(cat, i) {
    const x = 16 + i * 68;
    const isActive = i === 0;
    layers.push(
      rect(x, 162, 60, 26, { fill: isActive ? C.text : C.white, radius: 13,
        border: '1px solid ' + (isActive ? C.text : C.border) }),
      text(x + 30, 175, cat, {
        size: 11, weight: isActive ? '600' : '400',
        color: isActive ? C.bg : C.textMid, font: SANS, align: 'center'
      })
    );
  });

  layers.push(
    text(20, 204, 'MOST ACTIVE', { size: 8, weight: '700', color: C.muted, font: SANS, spacing: 1.2 }),
    line(20, 218, W - 20, 218, { stroke: C.border })
  );

  const sources = [
    { name: 'Nature', sub: 'Science  |  89 articles', freq: 'Daily', dot: C.green },
    { name: 'Financial Times', sub: 'Markets  |  143 articles', freq: 'Hourly', dot: C.gold },
    { name: 'MIT Tech Review', sub: 'Tech  |  67 articles', freq: 'Weekly', dot: C.accent },
    { name: 'The Atlantic', sub: 'Policy  |  44 articles', freq: 'Daily', dot: C.green },
    { name: 'Reuters', sub: 'News  |  201 articles', freq: 'Live', dot: C.accent },
    { name: 'Quanta Magazine', sub: 'Science  |  28 articles', freq: 'Weekly', dot: C.gold },
  ];

  sources.forEach(function(src, i) {
    const y = 226 + i * 72;
    layers.push(
      rect(16, y, W - 32, 64, { fill: C.surface, radius: 4, border: '1px solid ' + C.border }),
      rect(28, y + 14, 36, 36, { fill: C.text, radius: 4 }),
      text(46, y + 32, src.name[0], {
        size: 16, weight: '700', color: C.bg, font: SERIF, align: 'center' }),
      text(76, y + 24, src.name, { size: 14, weight: '600', color: C.text, font: SERIF }),
      text(76, y + 42, src.sub, { size: 11, weight: '400', color: C.muted, font: SANS }),
      rect(W - 62, y + 24, 44, 20, { fill: C.accentLt, radius: 10 }),
      text(W - 40, y + 33, src.freq, { size: 9, weight: '600', color: C.accent, font: SANS, align: 'center' }),
      ellipse(W - 70, y + 29, 4, 4, { fill: src.dot })
    );
  });

  layers.push(...tabBar(2));
  return { id: 'sources', name: 'Sources', background: C.bg, layers };
}

// ─── SCREEN 5: Insight Map ────────────────────────────────────────────────────
function screen5() {
  const layers = [
    rect(0, 0, W, H, { fill: C.bg }),
    ...statusBar(),
    ...navBar('Insight Map', 'AI-discovered connections'),
    rect(16, 114, W - 32, 48, { fill: C.white, radius: 6, border: '1px solid ' + C.border }),
    text(24, 128, '+ AI found 3 cross-thread patterns this week', {
      size: 11, weight: '600', color: C.text, font: SANS }),
    text(24, 147, 'Tap a node to explore the connection.', {
      size: 11, weight: '400', color: C.muted, font: SANS })
  ];

  const CX = W / 2;
  const CY = 360;
  const R = 108;

  // Center
  layers.push(
    ellipse(CX - 32, CY - 32, 32, 32, { fill: C.text }),
    text(CX, CY + 4, 'YOU', { size: 9, weight: '700', color: C.bg, align: 'center' })
  );

  const nodes = [
    { angle: -90, label: 'AI Policy', color: C.accent, bg: C.accentLt },
    { angle: -10, label: 'Biotech', color: C.green, bg: C.greenLt },
    { angle: 65, label: 'Climate', color: C.green, bg: C.greenLt },
    { angle: 148, label: 'Markets', color: C.gold, bg: C.goldLt },
    { angle: 222, label: 'Space', color: C.textMid, bg: C.border },
  ];

  nodes.forEach(function(n) {
    const rad = (n.angle * Math.PI) / 180;
    const nx = Math.round(CX + R * Math.cos(rad));
    const ny = Math.round(CY + R * Math.sin(rad));
    layers.push(
      line(CX, CY, nx, ny, { stroke: n.color, width: 1 }),
      ellipse(nx - 28, ny - 28, 28, 28, { fill: n.bg, stroke: n.color, strokeWidth: 1.5 }),
      text(nx, ny + 4, n.label, { size: 9, weight: '600', color: n.color, font: SANS, align: 'center' })
    );
  });

  // Cross connection
  const n0rad = (-90 * Math.PI) / 180;
  const n1rad = (-10 * Math.PI) / 180;
  layers.push(line(
    Math.round(CX + R * Math.cos(n0rad)), Math.round(CY + R * Math.sin(n0rad)),
    Math.round(CX + R * Math.cos(n1rad)), Math.round(CY + R * Math.sin(n1rad)),
    { stroke: 'rgba(193,53,34,0.25)', width: 1.5 }
  ));

  // Pattern cards
  layers.push(
    text(20, 516, 'DETECTED PATTERNS', { size: 8, weight: '700', color: C.muted, font: SANS, spacing: 1.2 }),
    line(20, 530, W - 20, 530, { stroke: C.border })
  );

  const patterns = [
    { title: 'Compute governance <> Energy demand', threads: 'AI Policy + Climate', pct: 88 },
    { title: 'Gene editing <> Longevity markets', threads: 'Biotech + Markets', pct: 74 },
  ];

  patterns.forEach(function(p, i) {
    const y = 538 + i * 82;
    layers.push(
      rect(16, y, W - 32, 72, { fill: C.white, radius: 4, border: '1px solid ' + C.border }),
      text(24, y + 18, p.title, { size: 12, weight: '600', color: C.text, font: SERIF }),
      text(24, y + 38, p.threads, { size: 10, weight: '500', color: C.accent, font: SANS }),
      text(24, y + 56, 'Strength:', { size: 9, weight: '400', color: C.muted, font: SANS }),
      rect(84, y + 51, 160, 6, { fill: C.border, radius: 3 }),
      rect(84, y + 51, Math.round((p.pct / 100) * 160), 6, { fill: C.accent, radius: 3 }),
      text(W - 28, y + 56, p.pct + '%', { size: 9, weight: '600', color: C.accent, font: SANS, align: 'right' })
    );
  });

  layers.push(...tabBar(3));
  return { id: 'map', name: 'Insight Map', background: C.bg, layers };
}

// ─── SCREEN 6: Profile ────────────────────────────────────────────────────────
function screen6() {
  const layers = [
    rect(0, 0, W, H, { fill: C.bg }),
    ...statusBar(),
    ...navBar('Your Profile'),
    ellipse(W / 2 - 40, 114, 40, 40, { fill: C.text }),
    text(W / 2, 157, 'J', { size: 30, weight: '700', color: C.bg, align: 'center', font: SERIF }),
    text(W / 2, 176, 'Jordan Ellis', { size: 18, weight: '700', color: C.text, font: SERIF, align: 'center' }),
    text(W / 2, 196, 'Member since January 2025', { size: 11, weight: '400', color: C.muted, font: SANS, align: 'center' }),
  ];

  // Stats row
  layers.push(
    rect(16, 212, W - 32, 60, { fill: C.white, radius: 6, border: '1px solid ' + C.border }),
    line(16 + (W - 32) / 3, 212, 16 + (W - 32) / 3, 272, { stroke: C.border }),
    line(16 + (W - 32) * 2 / 3, 212, 16 + (W - 32) * 2 / 3, 272, { stroke: C.border })
  );

  const stats = [{ val: '94', label: 'Articles' }, { val: '5', label: 'Threads' }, { val: '12', label: 'Insights' }];
  stats.forEach(function(s, i) {
    const cx = 16 + (W - 32) / 6 + i * (W - 32) / 3;
    layers.push(
      text(cx, 234, s.val, { size: 20, weight: '700', color: C.text, font: SERIF, align: 'center' }),
      text(cx, 254, s.label, { size: 10, weight: '400', color: C.muted, font: SANS, align: 'center' })
    );
  });

  layers.push(
    text(20, 288, 'PREFERENCES', { size: 8, weight: '700', color: C.muted, font: SANS, spacing: 1.2 }),
    line(20, 302, W - 20, 302, { stroke: C.border })
  );

  const prefs = [
    { label: 'Brief delivery', val: '6:00 AM daily' },
    { label: 'Language', val: 'English' },
    { label: 'Reading level', val: 'Expert' },
    { label: 'AI summary depth', val: 'Detailed' },
  ];

  prefs.forEach(function(p, i) {
    const y = 310 + i * 54;
    layers.push(
      rect(16, y, W - 32, 46, { fill: C.surface, radius: 4, border: '1px solid ' + C.border }),
      text(28, y + 15, p.label, { size: 13, weight: '500', color: C.text, font: SANS }),
      text(W - 28, y + 15, p.val + '  >', { size: 12, weight: '400', color: C.muted, font: SANS, align: 'right' })
    );
  });

  // Pro banner
  layers.push(
    rect(16, 534, W - 32, 72, { fill: C.text, radius: 6 }),
    text(28, 554, 'Folio Pro', { size: 16, weight: '700', color: C.bg, font: SERIF }),
    text(28, 576, 'Unlimited threads, advanced AI, team sharing', {
      size: 11, weight: '400', color: 'rgba(237,233,226,0.65)', font: SANS }),
    rect(W - 100, 552, 72, 32, { fill: C.accent, radius: 16 }),
    text(W - 64, 567, 'Upgrade', { size: 11, weight: '600', color: '#fff', font: SANS, align: 'center' })
  );

  layers.push(...tabBar(4));
  return { id: 'profile', name: 'Profile', background: C.bg, layers };
}

// ─── Assemble ─────────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'Folio',
  description: 'Your personal research companion — editorial AI briefings',
  width: W,
  height: H,
  background: C.bg,
  screens: [screen1(), screen2(), screen3(), screen4(), screen5(), screen6()],
};

const outPath = path.join(__dirname, 'folio.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log('Folio pen written: ' + outPath);
console.log(pen.screens.length + ' screens, ' + pen.screens.reduce(function(a, s) { return a + s.layers.length; }, 0) + ' layers total');
