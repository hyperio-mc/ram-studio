// CAST — AI-powered podcast analytics platform
// Inspired by:
//   • Neon.com (darkmodedesign.com) — pure black background, phosphor teal accent,
//     data-dense developer-grade metrics UI, "fast & scalable" technical aesthetic
//   • Format Podcasts (darkmodedesign.com / useformat.ai) — podcast AI tooling trend
//   • AuthKit (godly.website) — deep dark navy cards (#05060F), glassmorphism-lite,
//     premium developer polish
//   • Folk.app (minimal.gallery SaaS) — AI assistant cards grid showing automated tasks
//
// Theme: DARK — pure near-black + electric phosphor teal
// Pencil.dev format v2.8

'use strict';
const fs = require('fs');

const P = {
  bg:         '#060609',
  surface:    '#0D0D12',
  surfaceAlt: '#13131A',
  border:     'rgba(0,224,160,0.12)',
  borderSub:  'rgba(255,255,255,0.06)',
  text:       '#E8EBF4',
  textSub:    'rgba(232,235,244,0.55)',
  textMuted:  'rgba(232,235,244,0.28)',
  accent:     '#00E0A0',
  accentDim:  'rgba(0,224,160,0.10)',
  accentBdr:  'rgba(0,224,160,0.22)',
  accentGlow: 'rgba(0,224,160,0.06)',
  jade:       '#00C87A',
  purple:     '#8B5CF6',
  purpleDim:  'rgba(139,92,246,0.12)',
  amber:      '#F59E0B',
  amberDim:   'rgba(245,158,11,0.10)',
  red:        '#F43F5E',
  redDim:     'rgba(244,63,94,0.10)',
  blue:       '#3B82F6',
  blueDim:    'rgba(59,130,246,0.10)',
  white:      '#FFFFFF',
};

const t = (text, x, y, size, weight, color, opts = {}) => ({
  type: 'text', text,
  position: { x, y },
  style: {
    fontSize: size, fontWeight: weight, color,
    letterSpacing: opts.ls ?? 0,
    textTransform: opts.tt ?? 'none',
    lineHeight: opts.lh ?? 1.3,
    fontFamily: opts.mono
      ? "'SF Mono','Fira Code','Courier New',monospace"
      : "'Inter','SF Pro Display',-apple-system,sans-serif",
    opacity: opts.opacity ?? 1,
  },
});

const rect = (x, y, w, h, fill, radius = 0, opts = {}) => ({
  type: 'rectangle',
  position: { x, y },
  size: { width: w, height: h },
  style: {
    backgroundColor: fill,
    borderRadius: radius,
    border: opts.border ?? 'none',
    opacity: opts.opacity ?? 1,
  },
});

const card = (x, y, w, h, opts = {}) => rect(
  x, y, w, h,
  opts.bg ?? P.surface,
  opts.radius ?? 14,
  { border: opts.border ?? `1px solid ${P.borderSub}`, opacity: opts.opacity ?? 1 }
);

const pill = (x, y, w, h, fill, radius = 99) => rect(x, y, w, h, fill, radius);

const dot = (x, y, r, fill) => ({
  type: 'ellipse',
  position: { x: x - r, y: y - r },
  size: { width: r * 2, height: r * 2 },
  style: { backgroundColor: fill },
});

const ln = (x1, y1, x2, y2, color, width = 1) => ({
  type: 'line',
  points: [{ x: x1, y: y1 }, { x: x2, y: y2 }],
  style: { stroke: color, strokeWidth: width },
});

function waveformBars(x, y, barCount, maxH, color, dimColor, activePct, barW, gap) {
  barW = barW ?? 2; gap = gap ?? 2; activePct = activePct ?? 0.38;
  const pattern = [0.3,0.5,0.8,0.6,0.9,0.7,0.4,0.6,0.85,0.5,0.3,0.7,0.95,0.6,0.4,0.8,0.55,0.7,0.45,0.9,
                   0.6,0.35,0.75,0.5,0.8,0.65,0.4,0.9,0.55,0.7,0.3,0.85,0.6,0.45,0.8,0.5,0.7,0.35,0.9,0.6];
  const layers = [];
  const activeEnd = Math.floor(barCount * activePct);
  for (let i = 0; i < barCount; i++) {
    const h = Math.max(3, Math.round(pattern[i % pattern.length] * maxH));
    const bx = x + i * (barW + gap);
    const by = y + maxH - h;
    layers.push(rect(bx, by, barW, h, i < activeEnd ? color : dimColor, 1));
  }
  return layers;
}

function sparkline(points, x, y, w, h, color, opts) {
  opts = opts ?? {};
  const layers = [];
  const n = points.length;
  const minV = Math.min(...points);
  const maxV = Math.max(...points);
  const range = maxV - minV || 1;
  const coords = points.map((v, i) => ({
    x: x + (i / (n - 1)) * w,
    y: y + h - ((v - minV) / range) * h,
  }));
  for (let i = 0; i < coords.length - 1; i++) {
    layers.push(ln(coords[i].x, coords[i].y, coords[i+1].x, coords[i+1].y, color, opts.strokeWidth ?? 1.5));
  }
  if (opts.showDot !== false) {
    const last = coords[coords.length - 1];
    layers.push(dot(last.x, last.y, 3, color));
  }
  return layers;
}

function barChart(x, y, w, h, data, maxV, barColor, opts) {
  opts = opts ?? {};
  const n = data.length;
  const barW = opts.barW ?? Math.floor(w / n) - 2;
  return data.map((v, i) => {
    const barH = Math.max(2, Math.round((v / maxV) * h));
    return rect(x + i * (w / n), y + h - barH, barW, barH, barColor, opts.radius ?? 2);
  });
}

function donutSegment(cx, cy, r, startDeg, endDeg, color, strokeW) {
  strokeW = strokeW ?? 12;
  const toRad = d => (d - 90) * Math.PI / 180;
  const x1 = cx + r * Math.cos(toRad(startDeg));
  const y1 = cy + r * Math.sin(toRad(startDeg));
  const x2 = cx + r * Math.cos(toRad(endDeg));
  const y2 = cy + r * Math.sin(toRad(endDeg));
  const large = (endDeg - startDeg) > 180 ? 1 : 0;
  return {
    type: 'path',
    d: `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`,
    style: { stroke: color, strokeWidth: strokeW, fill: 'none', strokeLinecap: 'round' },
  };
}

const W = 390, H = 844;
const NAV_H = 58, HEADER_H = 56, STATUS_H = 44;
const PAD = 20;

function buildNav(active) {
  const items = [
    { icon: '◈', label: 'Home',     id: 0 },
    { icon: '◉', label: 'Episodes', id: 1 },
    { icon: '⟁', label: 'Audience', id: 2 },
    { icon: '✦', label: 'AI',       id: 3 },
    { icon: '⊙', label: 'More',     id: 4 },
  ];
  const layers = [
    rect(0, H - NAV_H, W, NAV_H, P.surface, 0, { border: `1px solid ${P.borderSub}` }),
  ];
  items.forEach(({ icon, label, id }) => {
    const bx = PAD + id * ((W - PAD * 2) / items.length);
    const isActive = id === active;
    layers.push(
      t(icon, bx + 14, H - NAV_H + 10, isActive ? 18 : 16, '400', isActive ? P.accent : P.textMuted),
      t(label, bx + (isActive ? 6 : 7), H - NAV_H + 32, 9.5, isActive ? '600' : '400',
        isActive ? P.accent : P.textMuted),
    );
    if (isActive) layers.push(rect(bx + 8, H - NAV_H - 1, 36, 2, P.accent, 2));
  });
  return layers;
}

function buildHeader(title, sub) {
  return [
    rect(0, STATUS_H, W, HEADER_H, P.bg),
    t('CAST', PAD, STATUS_H + 16, 13, '700', P.accent, { ls: 2, tt: 'uppercase' }),
    t(title, PAD, STATUS_H + 36, 17, '700', P.text),
    sub ? t(sub, W - PAD - 2, STATUS_H + 26, 11, '400', P.textMuted) : null,
    ln(0, STATUS_H + HEADER_H, W, STATUS_H + HEADER_H, P.borderSub),
  ].filter(Boolean);
}

// ── Screen 1: Overview ────────────────────────────────────────────────────────
function buildOverview() {
  const layers = [
    rect(0, 0, W, H, P.bg),
    ...buildHeader('Overview', 'Apr 2026'),
    ...buildNav(0),
  ];
  const TOP = STATUS_H + HEADER_H + 16;
  layers.push(
    t('Good morning, Zara \uD83D\uDC4B', PAD, TOP, 15, '600', P.text),
    t('Your podcast is growing 12% faster than last month', PAD, TOP + 20, 11.5, '400', P.textSub),
  );
  const mY = TOP + 52;
  const mW = (W - PAD * 2 - 12) / 2;
  // Card 1: listens
  layers.push(
    card(PAD, mY, mW, 90, { border: `1px solid ${P.accentBdr}`, bg: P.accentGlow }),
    t('TOTAL LISTENS', PAD + 14, mY + 14, 9, '600', P.textSub, { ls: 0.5 }),
    t('1.24M', PAD + 14, mY + 30, 26, '700', P.accent),
    t('+18.4% vs last month', PAD + 14, mY + 62, 10, '400', P.accent, { opacity: 0.7 }),
    ...sparkline([920, 1020, 980, 1100, 1050, 1180, 1240], PAD + mW - 58, mY + 16, 48, 28, P.accent),
  );
  // Card 2: subscribers
  layers.push(
    card(PAD + mW + 12, mY, mW, 90),
    t('SUBSCRIBERS', PAD + mW + 26, mY + 14, 9, '600', P.textSub, { ls: 0.5 }),
    t('28.6K', PAD + mW + 26, mY + 30, 26, '700', P.text),
    t('+4.2K this month', PAD + mW + 26, mY + 62, 10, '400', P.jade, { opacity: 0.85 }),
    ...sparkline([22, 23.5, 24, 25, 25.8, 27, 28.6], PAD + W - 58, mY + 16, 48, 28, P.jade),
  );
  // Weekly bar chart
  const chartY = mY + 106;
  layers.push(
    card(PAD, chartY, W - PAD * 2, 110),
    t('WEEKLY LISTENS', PAD + 14, chartY + 14, 9, '600', P.textSub, { ls: 0.5 }),
    t('Last 8 weeks', W - PAD - 64, chartY + 14, 10, '400', P.textMuted),
    ...barChart(PAD + 14, chartY + 32, W - PAD * 2 - 28, 60,
      [280, 310, 290, 340, 380, 310, 420, 460], 460, P.surfaceAlt, { barW: 28, radius: 4 }),
    ...barChart(PAD + 14, chartY + 32, W - PAD * 2 - 28, 60,
      [280, 310, 290, 340, 380, 310, 420, 460], 460, P.accentDim, { barW: 28, radius: 4 }),
    ...barChart(PAD + 14 + 7 * (W - PAD * 2 - 28) / 8, chartY + 32, (W - PAD * 2 - 28) / 8, 60,
      [460], 460, P.accent, { barW: 28, radius: 4 }),
  );
  ['W1','W2','W3','W4','W5','W6','W7','W8'].forEach((l, i) => {
    layers.push(t(l, PAD + 14 + i * ((W - PAD * 2 - 28) / 8) + 4, chartY + 97, 9, '400', P.textMuted));
  });
  // Top episode
  const epY = chartY + 126;
  layers.push(
    card(PAD, epY, W - PAD * 2, 80),
    t('TOP EPISODE THIS WEEK', PAD + 14, epY + 14, 9, '500', P.textMuted, { ls: 0.5 }),
    rect(PAD + 14, epY + 30, 38, 38, P.purpleDim, 10, { border: `1px solid ${P.purple}22` }),
    t('▶', PAD + 26, epY + 44, 14, '400', P.purple),
    t('#47 — The AI Systems Podcast', PAD + 62, epY + 34, 12, '600', P.text),
    t('84.2K listens · 38 min avg listen time', PAD + 62, epY + 52, 10, '400', P.textSub),
    ...waveformBars(W - PAD - 80, epY + 40, 24, 24, P.accent, P.borderSub, 0.6, 2, 2),
  );
  // AI nudge
  const nudgeY = epY + 96;
  layers.push(
    rect(PAD, nudgeY, W - PAD * 2, 48, P.accentDim, 12, { border: `1px solid ${P.accentBdr}` }),
    t('✦', PAD + 14, nudgeY + 16, 14, '400', P.accent),
    t('AI INSIGHT', PAD + 32, nudgeY + 12, 9, '600', P.accent, { ls: 0.5 }),
    t('Tue 6–8 PM releases get 23% more first-day listens', PAD + 32, nudgeY + 28, 10.5, '400', P.textSub),
  );
  return layers;
}

// ── Screen 2: Episodes ────────────────────────────────────────────────────────
function buildEpisodes() {
  const layers = [
    rect(0, 0, W, H, P.bg),
    ...buildHeader('Episodes', '48 episodes'),
    ...buildNav(1),
  ];
  const TOP = STATUS_H + HEADER_H + 8;
  layers.push(
    rect(PAD, TOP + 4, 62, 26, P.accentDim, 99, { border: `1px solid ${P.accentBdr}` }),
    t('All', PAD + 18, TOP + 12, 10.5, '600', P.accent),
    rect(PAD + 70, TOP + 4, 58, 26, P.surfaceAlt, 99, { border: `1px solid ${P.borderSub}` }),
    t('Recent', PAD + 78, TOP + 12, 10.5, '500', P.textSub),
    rect(PAD + 136, TOP + 4, 52, 26, P.surfaceAlt, 99, { border: `1px solid ${P.borderSub}` }),
    t('Top', PAD + 152, TOP + 12, 10.5, '500', P.textSub),
    rect(W - PAD - 100, TOP + 4, 100, 26, P.accent, 99),
    t('+ New Episode', W - PAD - 96, TOP + 12, 10, '600', P.bg),
  );
  const episodes = [
    { num: '#48', title: 'Building AI Systems at Scale', listens: '12.4K', dur: '52 min', badge: 'NEW', badgeC: P.accent },
    { num: '#47', title: 'The AI Systems Podcast', listens: '84.2K', dur: '38 min', badge: 'TOP', badgeC: P.purple },
    { num: '#46', title: 'Open Source LLM Deep Dive', listens: '41.8K', dur: '61 min', badge: null, badgeC: null },
    { num: '#45', title: 'Prompt Engineering in 2026', listens: '38.1K', dur: '44 min', badge: null, badgeC: null },
    { num: '#44', title: 'Vector DBs Explained', listens: '29.7K', dur: '55 min', badge: null, badgeC: null },
  ];
  episodes.forEach(({ num, title, listens, dur, badge, badgeC }, i) => {
    const ey = TOP + 46 + i * 96;
    layers.push(
      card(PAD, ey, W - PAD * 2, 88, {
        bg: i === 0 ? '#0D0D14' : P.surface,
        border: i === 0 ? `1px solid ${P.accentBdr}` : `1px solid ${P.borderSub}`,
      }),
      rect(PAD + 12, ey + 16, 52, 52, P.surfaceAlt, 10),
      t(num, PAD + 18, ey + 38, 9, '700', P.textMuted, { mono: true }),
      ...waveformBars(PAD + 18, ey + 52, 14, 14, P.accent, P.borderSub, i === 0 ? 0.42 : 0, 2, 2),
      t(title, PAD + 74, ey + 20, 12.5, '600', P.text),
      t(`${listens} listens`, PAD + 74, ey + 40, 10.5, '400', P.textSub),
      t(`${dur} avg`, PAD + 74, ey + 56, 10.5, '400', P.textMuted),
    );
    if (badge && badgeC) {
      layers.push(
        rect(W - PAD - 48, ey + 14, 36, 18, badgeC + '18', 99),
        t(badge, W - PAD - 42, ey + 19, 8.5, '700', badgeC, { ls: 0.5 }),
      );
    }
    layers.push(...sparkline(
      [20, 35, 28, 42, 38, 55, 48].map(v => v + i * 5),
      W - PAD - 58, ey + 50, 48, 22, i === 0 ? P.accent : P.textMuted, { strokeWidth: 1.5 }
    ));
  });
  return layers;
}

// ── Screen 3: Audience Analytics ─────────────────────────────────────────────
function buildAudience() {
  const layers = [
    rect(0, 0, W, H, P.bg),
    ...buildHeader('Audience', '28.6K subscribers'),
    ...buildNav(2),
  ];
  const TOP = STATUS_H + HEADER_H + 12;
  // Retention curve
  layers.push(
    card(PAD, TOP, W - PAD * 2, 130),
    t('LISTENER RETENTION', PAD + 14, TOP + 14, 9, '600', P.textSub, { ls: 0.5 }),
    t('% listening at each minute', PAD + 14, TOP + 28, 9.5, '400', P.textMuted),
  );
  [0.25, 0.5, 0.75, 1].forEach(frac => {
    const gy = TOP + 42 + (1 - frac) * 70;
    layers.push(
      ln(PAD + 30, gy, W - PAD - 14, gy, P.borderSub, 0.5),
      t(`${Math.round(frac * 100)}%`, PAD + 14, gy - 5, 8.5, '400', P.textMuted),
    );
  });
  layers.push(...sparkline(
    [100, 94, 88, 82, 75, 68, 62, 58, 55, 53, 51, 50],
    PAD + 30, TOP + 42, W - PAD * 2 - 44, 70, P.accent, { strokeWidth: 2 }
  ));
  ['0m','5m','10m','15m','20m','25m','30m+'].forEach((l, i) => {
    layers.push(t(l, PAD + 30 + i * ((W - PAD * 2 - 44) / 6) - 4, TOP + 118, 8.5, '400', P.textMuted));
  });
  // Platform donut
  const donutY = TOP + 146;
  const cx = 90, cy = donutY + 68, r = 52;
  layers.push(
    card(PAD, donutY, W - PAD * 2, 148),
    t('PLATFORM BREAKDOWN', PAD + 14, donutY + 14, 9, '600', P.textSub, { ls: 0.5 }),
    donutSegment(cx, cy, r, 0, 158, P.accent, 14),
    donutSegment(cx, cy, r, 162, 270, P.purple, 14),
    donutSegment(cx, cy, r, 274, 334, P.blue, 14),
    donutSegment(cx, cy, r, 338, 358, P.amber, 14),
    t('44%', cx - 12, cy - 10, 18, '700', P.accent),
    t('Spotify', cx - 18, cy + 10, 10, '500', P.textSub),
  );
  [
    { label: 'Spotify', pct: '44%', color: P.accent },
    { label: 'Apple', pct: '30%', color: P.purple },
    { label: 'Google', pct: '17%', color: P.blue },
    { label: 'Other', pct: '9%', color: P.amber },
  ].forEach(({ label, pct, color }, i) => {
    const lx = PAD + 160, ly = donutY + 30 + i * 28;
    layers.push(
      dot(lx + 6, ly + 5, 4, color),
      t(label, lx + 16, ly - 1, 11, '500', P.text),
      t(pct, W - PAD - 34, ly - 1, 11, '600', color),
    );
  });
  // Geo top cities
  const geoY = donutY + 164;
  layers.push(
    card(PAD, geoY, W - PAD * 2, 132),
    t('TOP CITIES', PAD + 14, geoY + 14, 9, '600', P.textSub, { ls: 0.5 }),
  );
  [
    { city: 'New York', listens: '182K', pct: 85 },
    { city: 'London', listens: '134K', pct: 62 },
    { city: 'San Francisco', listens: '98K', pct: 46 },
    { city: 'Berlin', listens: '61K', pct: 28 },
  ].forEach(({ city, listens, pct }, i) => {
    const ry = geoY + 36 + i * 26;
    layers.push(
      t(city, PAD + 14, ry, 11, '500', P.text),
      t(listens, W - PAD - 40, ry, 11, '600', P.textSub),
      rect(PAD + 14, ry + 14, W - PAD * 2 - 28, 4, P.surfaceAlt, 2),
      rect(PAD + 14, ry + 14, Math.round((W - PAD * 2 - 28) * pct / 100), 4, P.accent + '60', 2),
    );
  });
  return layers;
}

// ── Screen 4: AI Insights ─────────────────────────────────────────────────────
function buildAI() {
  const layers = [
    rect(0, 0, W, H, P.bg),
    ...buildHeader('AI Insights', 'Cast AI'),
    ...buildNav(3),
  ];
  const TOP = STATUS_H + HEADER_H + 12;
  // Score banner
  layers.push(
    rect(PAD, TOP, W - PAD * 2, 72, P.accentDim, 14, { border: `1px solid ${P.accentBdr}` }),
    t('✦', PAD + 14, TOP + 22, 20, '300', P.accent),
    t('GROWTH SCORE', PAD + 42, TOP + 16, 9, '600', P.accent, { ls: 0.5 }),
    t('87', PAD + 42, TOP + 32, 28, '700', P.accent),
    t('/ 100', PAD + 72, TOP + 50, 12, '400', P.textMuted),
    t('Top 8% of podcasts in your category', PAD + 42, TOP + 58, 10, '400', P.textSub),
    donutSegment(W - PAD - 40, TOP + 36, 28, 0, 313, P.accent, 6),
    donutSegment(W - PAD - 40, TOP + 36, 28, 317, 360, P.surfaceAlt, 6),
  );
  // AI cards (folk.app-inspired grid)
  const insights = [
    { icon: '⚡', title: 'Release Timing', body: 'Tue 7PM releases get 23% more first-day listens.', action: 'Schedule →', color: P.accent },
    { icon: '◉', title: 'Title Optimizer', body: 'Numbers in titles get 31% more clicks on day one.', action: 'Rename ep →', color: P.purple },
    { icon: '▲', title: 'Clip Suggestion', body: '2:14–2:48 in ep #47 has peak engagement — clip it.', action: 'Generate →', color: P.amber },
    { icon: '✿', title: 'Guest Matcher', body: 'Fans of #46 also follow Latent Space — reach out.', action: 'See matches →', color: P.blue },
  ];
  insights.forEach(({ icon, title, body, action, color }, i) => {
    const row = Math.floor(i / 2), col = i % 2;
    const cW = (W - PAD * 2 - 12) / 2;
    const cX = PAD + col * (cW + 12);
    const cY = TOP + 90 + row * 118;
    layers.push(
      card(cX, cY, cW, 108, { border: `1px solid ${color}25` }),
      t(icon, cX + 12, cY + 14, 18, '400', color),
      t(title, cX + 12, cY + 40, 11.5, '700', P.text),
      t(body, cX + 12, cY + 58, 9.5, '400', P.textSub, { lh: 1.4 }),
      t(action, cX + 12, cY + 92, 9.5, '600', color),
    );
  });
  // Trending topics
  const trendsY = TOP + 90 + 2 * 118 + 10;
  layers.push(
    card(PAD, trendsY, W - PAD * 2, 80),
    t('TRENDING TOPICS', PAD + 14, trendsY + 14, 9, '600', P.textSub, { ls: 0.5 }),
  );
  ['#llms','#agents','#rag','#fine-tuning','#open-weights','#multimodal'].forEach((tag, i) => {
    const tW = 54 + tag.length * 5;
    const row = Math.floor(i / 3), col = i % 3;
    layers.push(
      pill(PAD + 14 + col * 110, trendsY + 36 + row * 24, tW, 18, P.surfaceAlt),
      t(tag, PAD + 22 + col * 110, trendsY + 40 + row * 24, 9.5, '500', P.textSub),
    );
  });
  return layers;
}

// ── Screen 5: Episode Detail + Waveform ───────────────────────────────────────
function buildEpisodeDetail() {
  const layers = [
    rect(0, 0, W, H, P.bg),
    rect(0, STATUS_H, W, HEADER_H, P.bg),
    t('← Episodes', PAD, STATUS_H + 18, 11, '500', P.textSub),
    t('#47 — The AI Systems Podcast', PAD, STATUS_H + 36, 14, '700', P.text),
    ln(0, STATUS_H + HEADER_H, W, STATUS_H + HEADER_H, P.borderSub),
    ...buildNav(1),
  ];
  const TOP = STATUS_H + HEADER_H + 12;
  // Episode hero
  layers.push(
    rect(PAD, TOP, W - PAD * 2, 110, P.surfaceAlt, 16),
    rect(PAD + 14, TOP + 14, 72, 72, P.accentDim, 12, { border: `1px solid ${P.accentBdr}` }),
    t('\uD83C\uDF99', PAD + 36, TOP + 38, 28, '400', P.accent),
    t('#47', PAD + 96, TOP + 18, 10, '700', P.textMuted, { mono: true }),
    t('The AI Systems Podcast', PAD + 96, TOP + 34, 13.5, '700', P.text),
    t('Apr 1, 2026 · 54:22', PAD + 96, TOP + 56, 10, '400', P.textMuted),
    t('84.2K listens', PAD + 96, TOP + 72, 11, '600', P.accent),
  );
  // Full waveform visualization — KEY design motif
  const waveY = TOP + 128;
  const playedBars = 48;
  layers.push(
    card(PAD, waveY, W - PAD * 2, 72),
    t('38m avg listen time', PAD + 14, waveY + 12, 9, '500', P.textMuted, { ls: 0.5 }),
    ...waveformBars(PAD + 14, waveY + 28, 68, 32, P.accent, P.surfaceAlt, 0.7, 3, 2),
    rect(PAD + 14 + playedBars * 5, waveY + 22, 2, 44, P.white, 1, { opacity: 0.5 }),
    t('0:00', PAD + 14, waveY + 62, 8.5, '400', P.textMuted),
    t('38:14', PAD + 14 + playedBars * 5 - 8, waveY + 62, 8.5, '600', P.text),
    t('54:22', W - PAD - 34, waveY + 62, 8.5, '400', P.textMuted),
  );
  // Stats row
  const statsY = waveY + 88;
  [
    { label: 'Listens', val: '84.2K' },
    { label: 'Completion', val: '61%' },
    { label: 'Shares', val: '3.4K' },
  ].forEach(({ label, val }, i) => {
    const statsW = (W - PAD * 2) / 3;
    const sx = PAD + i * statsW;
    layers.push(
      card(sx, statsY, statsW - 8, 60, { radius: 12 }),
      t(label, sx + 10, statsY + 12, 9, '500', P.textMuted, { ls: 0.3 }),
      t(val, sx + 10, statsY + 30, 18, '700', i === 0 ? P.accent : P.text),
    );
  });
  // Retention curve for this episode
  const retY = statsY + 76;
  layers.push(
    card(PAD, retY, W - PAD * 2, 110),
    t('RETENTION CURVE', PAD + 14, retY + 14, 9, '600', P.textSub, { ls: 0.5 }),
    t('vs. avg episode', W - PAD - 72, retY + 14, 10, '400', P.textMuted),
    ...sparkline([100,96,91,85,79,72,68,65,63,61,60,61], PAD + 14, retY + 36, W - PAD * 2 - 28, 58, P.accent, { strokeWidth: 2 }),
    ...sparkline([100,93,86,79,71,64,59,56,54,52,51,50], PAD + 14, retY + 36, W - PAD * 2 - 28, 58, P.textMuted, { strokeWidth: 1, showDot: false }),
    dot(W - PAD - 80, retY + 96, 4, P.accent),
    t('This ep', W - PAD - 72, retY + 93, 9, '500', P.textSub),
    dot(W - PAD - 30, retY + 96, 4, P.textMuted),
    t('Avg', W - PAD - 22, retY + 93, 9, '400', P.textMuted),
  );
  // Chapters
  const chapY = retY + 128;
  layers.push(t('Chapters', PAD, chapY, 13, '700', P.text));
  [
    { time: '0:00', title: 'Intro', active: false },
    { time: '3:15', title: 'What are AI Systems?', active: true },
    { time: '18:40', title: 'Production Challenges', active: false },
  ].forEach(({ time, title, active }, i) => {
    const cy2 = chapY + 22 + i * 40;
    layers.push(
      rect(PAD, cy2, W - PAD * 2, 34, active ? P.accentGlow : P.surfaceAlt, 10,
        { border: `1px solid ${active ? P.accentBdr : P.borderSub}` }),
      t(time, PAD + 12, cy2 + 10, 9.5, '600', active ? P.accent : P.textMuted, { mono: true }),
      t(title, PAD + 58, cy2 + 10, 11.5, active ? '600' : '400', active ? P.text : P.textSub),
    );
    if (active) layers.push(dot(W - PAD - 12, cy2 + 17, 4, P.accent));
  });
  return layers;
}

// ── Screen 6: Distribution ────────────────────────────────────────────────────
function buildDistribution() {
  const layers = [
    rect(0, 0, W, H, P.bg),
    ...buildHeader('Distribution', 'All platforms'),
    ...buildNav(2),
  ];
  const TOP = STATUS_H + HEADER_H + 12;
  const platforms = [
    { name: 'Spotify', subs: '12.6K', growth: '+8.4%', icon: '\u266B', color: P.accent },
    { name: 'Apple Podcasts', subs: '8.6K', growth: '+3.1%', icon: '\u25C9', color: P.purple },
    { name: 'Google Podcasts', subs: '4.9K', growth: '+6.7%', icon: '\u25C8', color: P.blue },
    { name: 'Overcast', subs: '1.8K', growth: '+1.2%', icon: '\u2601', color: P.amber },
    { name: 'Pocket Casts', subs: '0.7K', growth: '+4.8%', icon: '\u25B7', color: P.jade },
  ];
  platforms.forEach(({ name, subs, growth, icon, color }, i) => {
    const py = TOP + i * 86;
    layers.push(
      card(PAD, py, W - PAD * 2, 78),
      rect(PAD + 12, py + 16, 44, 44, color + '15', 12, { border: `1px solid ${color}30` }),
      t(icon, PAD + 24, py + 30, 18, '400', color),
      t(name, PAD + 66, py + 22, 12.5, '600', P.text),
      t(`${subs} subscribers`, PAD + 66, py + 40, 10.5, '400', P.textSub),
      rect(W - PAD - 56, py + 18, 44, 18, color + '18', 99),
      t(growth, W - PAD - 50, py + 23, 10, '700', color),
      ...sparkline([60,68,65,74,78,85,94].map(v => v + i * 10), W - PAD - 60, py + 44, 48, 20, color, { strokeWidth: 1.5 }),
    );
  });
  const tipY = TOP + platforms.length * 86 + 4;
  layers.push(
    rect(PAD, tipY, W - PAD * 2, 48, P.accentDim, 12, { border: `1px solid ${P.accentBdr}` }),
    t('✦', PAD + 14, tipY + 16, 14, '400', P.accent),
    t('TIP', PAD + 32, tipY + 12, 9, '600', P.accent, { ls: 0.5 }),
    t('Submit to Pocket Casts Featured for +40% visibility', PAD + 32, tipY + 28, 10.5, '400', P.textSub),
  );
  return layers;
}

// ── Build & write ─────────────────────────────────────────────────────────────
const screens = [
  { id: 'overview', name: 'Overview',     layers: buildOverview() },
  { id: 'episodes', name: 'Episodes',     layers: buildEpisodes() },
  { id: 'audience', name: 'Audience',     layers: buildAudience() },
  { id: 'ai',       name: 'AI Insights',  layers: buildAI() },
  { id: 'detail',   name: 'Ep Detail',    layers: buildEpisodeDetail() },
  { id: 'distrib',  name: 'Distribution', layers: buildDistribution() },
];

const pen = {
  version: '2.8',
  name: 'CAST',
  description: 'AI-powered podcast analytics platform. Dark theme: pure near-black (#060609) + phosphor teal accent (#00E0A0). Inspired by Neon.com on darkmodedesign.com (pure black + electric green/teal aesthetic for developer tools) and Format Podcasts from useformat.ai (AI podcast tooling trend). Key visual motif: audio waveform bars used as interactive navigation element throughout.',
  width: W,
  height: H,
  background: P.bg,
  screens: screens.map(s => ({
    id: s.id,
    name: s.name,
    background: P.bg,
    layers: s.layers.filter(Boolean),
  })),
};

fs.writeFileSync('cast.pen', JSON.stringify(pen, null, 2));
console.log('cast.pen written —', screens.length, 'screens');
console.log('Screens:', screens.map(s => s.name).join(', '));
