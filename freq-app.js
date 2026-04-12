'use strict';
// freq-app.js
// FREQ — Podcast Intelligence for Creators
//
// Design Challenge: AI-powered podcast analytics with audio-native UI patterns
//
// Inspiration:
// 1. Format AI Podcasts (darkmodedesign.com, March 31 2026) — "Personalized customer
//    insights in weekly podcasts." Dark, minimal, AI-forward. Turned this into a
//    creator-side analytics dashboard: what if YOUR podcast had an AI analyst?
//
// 2. Neon.com (darkmodedesign.com) — Dark near-black + electric emerald glow,
//    bold split-weight headings where first word is heavy and rest is light,
//    developer tool density with clean whitespace rhythm.
//
// 3. godly.website Atlas Card — Premium concierge feel, each section distinct,
//    luxury dark surfaces with subtle glows and immersive card layouts.
//
// Design Decisions:
// · Waveform bars as the primary data visualization (audio-native metaphor)
// · Electric violet (#7B6EF6) instead of Neon's green — more editorial, less dev-tool
// · Split-weight headings throughout (bold first word / light rest)
//
// Theme: DARK (last run "pace" was LIGHT → rotate to dark)
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:        '#07080F',   // near-black with deep navy cast
  surface:   '#0F1120',   // dark navy surface
  surface2:  '#161828',   // slightly lighter surface
  border:    '#1E2235',   // subtle border
  borderMid: '#2A2F4A',   // mid border
  text:      '#E8EBF7',   // cool near-white
  textMid:   '#9BA3C4',   // mid-tone cool grey
  muted:     '#555C7A',   // muted label text
  accent:    '#7B6EF6',   // electric violet — main accent
  accentLo:  '#3D3580',   // deep violet (bg for accent elements)
  accent2:   '#F59E0B',   // amber — high-engagement indicator
  accent2Lo: '#3D2E08',   // deep amber bg
  green:     '#22C55E',   // positive delta
  greenLo:   '#0A2E18',   // deep green bg
  red:       '#EF4444',   // negative / drop-off
  redLo:     '#2E0A0A',   // deep red bg
  white:     '#FFFFFF',
};

const W = 390, H = 844;

// ── SVG helpers ───────────────────────────────────────────────────────────────
function el(type, attrs = {}, children = []) {
  return { type, attrs, children };
}
function rect(x, y, w, h, fill, extra = {}) {
  return el('rect', { x, y, width: w, height: h, fill, ...extra });
}
function rrect(x, y, w, h, rx, fill, extra = {}) {
  return el('rect', { x, y, width: w, height: h, rx, ry: rx, fill, ...extra });
}
function text(str, x, y, opts = {}) {
  const { size = 14, fill = P.text, weight = '400', anchor = 'start',
    ls = 0, opacity = 1, family = 'Inter' } = opts;
  return el('text', {
    x, y, 'font-size': size, 'font-family': family,
    'font-weight': weight, fill, 'text-anchor': anchor,
    'letter-spacing': ls, opacity,
  }, [{ type: '__text__', value: str }]);
}
function circle(cx, cy, r, fill) {
  return el('circle', { cx, cy, r, fill });
}
function line(x1, y1, x2, y2, stroke, sw = 1, opacity = 1) {
  return el('line', { x1, y1, x2, y2, stroke, 'stroke-width': sw, opacity });
}
function polyline(points, stroke, sw = 1.5, fill = 'none', opacity = 1) {
  return el('polyline', { points, stroke, 'stroke-width': sw, fill, opacity, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
}
function path_(d, fill, stroke = 'none', sw = 1) {
  return el('path', { d, fill, stroke, 'stroke-width': sw });
}

// ── Status bar ────────────────────────────────────────────────────────────────
function statusBar() {
  return [
    rect(0, 0, W, 44, P.bg),
    text('9:41', 20, 29, { size: 13, fill: P.text, weight: '600' }),
    text('●●●●', W - 76, 29, { size: 10, fill: P.text }),
    text('WiFi', W - 48, 29, { size: 10, fill: P.text }),
    text('▮', W - 20, 29, { size: 13, fill: P.text, anchor: 'end' }),
  ];
}

// ── Bottom nav bar ────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { icon: '◉', label: 'Feed' },
  { icon: '◎', label: 'Episode' },
  { icon: '✦', label: 'AI Brief' },
  { icon: '◈', label: 'Audience' },
  { icon: '◆', label: 'Monetize' },
];

function navBar(active) {
  const nodes = [];
  const navH = 80;
  const navY = H - navH;
  nodes.push(rect(0, navY, W, navH, P.surface));
  nodes.push(line(0, navY, W, navY, P.border));
  const tabW = W / NAV_ITEMS.length;
  NAV_ITEMS.forEach((item, i) => {
    const cx = tabW * i + tabW / 2;
    const isActive = i === active;
    const icColor = isActive ? P.accent : P.muted;
    const lblColor = isActive ? P.accent : P.muted;
    if (isActive) {
      // glow dot indicator at top
      nodes.push(rrect(cx - 20, navY + 2, 40, 3, 1.5, P.accent));
    }
    nodes.push(text(item.icon, cx, navY + 36, { size: 18, fill: icColor, anchor: 'middle' }));
    nodes.push(text(item.label, cx, navY + 56, { size: 9, fill: lblColor, anchor: 'middle', weight: isActive ? '600' : '400' }));
  });
  return nodes;
}

// ── Waveform bars helper ──────────────────────────────────────────────────────
// Draws a stylized waveform with color-coded engagement
function waveformBars(x, y, w, h, data, activeColor, mutedColor) {
  const nodes = [];
  const barCount = data.length;
  const barW = Math.floor((w - (barCount - 1) * 2) / barCount);
  const gap = 2;
  data.forEach((val, i) => {
    const barH = Math.max(3, Math.round(h * val));
    const bx = x + i * (barW + gap);
    const by = y + h - barH;
    const fill = val > 0.6 ? activeColor : mutedColor;
    nodes.push(rrect(bx, by, barW, barH, 1.5, fill));
  });
  return nodes;
}

// ── SCREEN 1 — Feed (Recent Episodes) ────────────────────────────────────────
function screen1() {
  const nodes = [];
  nodes.push(rect(0, 0, W, H, P.bg));
  nodes.push(...statusBar());

  // Header — split-weight title (Neon pattern)
  nodes.push(text('FREQ', 20, 78, { size: 22, fill: P.accent, weight: '800', ls: 2 }));
  nodes.push(text('Your podcast, analyzed.', 20, 100, { size: 15, fill: P.text, weight: '400' }));

  // Summary pill row
  const pills = [
    { label: '3 new episodes', color: P.accentLo, textColor: P.accent },
    { label: '↑ +12% reach', color: P.greenLo, textColor: P.green },
    { label: '2 drops to fix', color: P.redLo, textColor: P.red },
  ];
  let pillX = 20;
  pills.forEach(p => {
    const pw = p.label.length * 7 + 20;
    nodes.push(rrect(pillX, 112, pw, 24, 12, p.color));
    nodes.push(text(p.label, pillX + 10, 128, { size: 11, fill: p.textColor, weight: '600' }));
    pillX += pw + 8;
  });

  // Section label
  nodes.push(text('RECENT EPISODES', 20, 162, { size: 9, fill: P.muted, weight: '600', ls: 1.5 }));

  // Episode cards
  const episodes = [
    {
      ep: 'EP 142', title: 'The Future of AI Agents', date: 'Mar 30',
      duration: '58m', plays: '14.2K', retention: 0.72,
      bars: [0.4, 0.6, 0.8, 0.9, 0.85, 0.7, 0.72, 0.65, 0.55, 0.6, 0.68, 0.7, 0.5, 0.3, 0.25],
      tag: '🔥 Top 5%', tagColor: P.accent2Lo, tagText: P.accent2, delta: '+18%', deltaPos: true,
    },
    {
      ep: 'EP 141', title: 'Solo Founder Survival Guide', date: 'Mar 28',
      duration: '44m', plays: '11.8K', retention: 0.61,
      bars: [0.5, 0.7, 0.75, 0.8, 0.72, 0.6, 0.55, 0.5, 0.45, 0.42, 0.38, 0.35, 0.3, 0.28, 0.25],
      tag: '⚠ Drop-off at 38m', tagColor: P.redLo, tagText: P.red, delta: '-4%', deltaPos: false,
    },
    {
      ep: 'EP 140', title: 'Design Systems at Scale', date: 'Mar 25',
      duration: '1h 12m', plays: '9.4K', retention: 0.58,
      bars: [0.45, 0.5, 0.6, 0.65, 0.7, 0.68, 0.6, 0.55, 0.5, 0.48, 0.45, 0.4, 0.38, 0.35, 0.3],
      tag: null, tagColor: null, tagText: null, delta: '-2%', deltaPos: false,
    },
  ];

  episodes.forEach((ep, i) => {
    const ey = 172 + i * 168;
    nodes.push(rrect(20, ey, W - 40, 158, 14, P.surface));

    // Top row
    nodes.push(rrect(32, ey + 14, 48, 18, 9, P.accentLo));
    nodes.push(text(ep.ep, 56, ey + 27, { size: 9, fill: P.accent, weight: '700', anchor: 'middle' }));
    nodes.push(text(ep.title, 90, ey + 27, { size: 14, fill: P.text, weight: '600' }));
    nodes.push(text(ep.date + ' · ' + ep.duration, 32, ey + 48, { size: 11, fill: P.muted }));

    if (ep.tag) {
      nodes.push(rrect(W - 40 - ep.tag.length * 6.5 - 4, ey + 14, ep.tag.length * 6.5 + 12, 18, 9, ep.tagColor));
      nodes.push(text(ep.tag, W - 34, ey + 27, { size: 9, fill: ep.tagText, weight: '600', anchor: 'end' }));
    }

    // Waveform
    nodes.push(text('ENGAGEMENT CURVE', 32, ey + 66, { size: 8, fill: P.muted, weight: '600', ls: 1.2 }));
    nodes.push(...waveformBars(32, ey + 72, W - 84, 36, ep.bars, P.accent, P.borderMid));

    // Stats row
    nodes.push(line(32, ey + 118, W - 32, ey + 118, P.border));
    nodes.push(text('▶ ' + ep.plays + ' plays', 32, ey + 138, { size: 12, fill: P.textMid }));
    nodes.push(text('⟳ ' + Math.round(ep.retention * 100) + '% retained', W / 2 - 10, ey + 138, { size: 12, fill: P.textMid }));
    const dColor = ep.deltaPos ? P.green : P.red;
    nodes.push(text(ep.delta + ' vs avg', W - 32, ey + 138, { size: 12, fill: dColor, weight: '600', anchor: 'end' }));
  });

  nodes.push(...navBar(0));
  return nodes;
}

// ── SCREEN 2 — Episode Deep Dive ──────────────────────────────────────────────
function screen2() {
  const nodes = [];
  nodes.push(rect(0, 0, W, H, P.bg));
  nodes.push(...statusBar());

  // Back nav
  nodes.push(text('← Feed', 20, 70, { size: 13, fill: P.accent }));

  // Episode header
  nodes.push(rrect(20, 82, W - 40, 76, 14, P.surface));
  nodes.push(rrect(30, 96, 6, 48, 3, P.accent));
  nodes.push(text('EP 142', 46, 116, { size: 10, fill: P.accent, weight: '700' }));
  nodes.push(text('The Future of AI Agents', 46, 136, { size: 16, fill: P.text, weight: '700' }));
  nodes.push(text('Mar 30, 2026  ·  58 min  ·  14,218 plays', 46, 152, { size: 10, fill: P.muted }));

  // Key metrics strip
  nodes.push(text('KEY METRICS', 20, 180, { size: 9, fill: P.muted, weight: '600', ls: 1.5 }));
  const metrics = [
    { label: 'Avg Listen', val: '41m', sub: '72% retained', color: P.accent },
    { label: 'Shares', val: '892', sub: '+31% above avg', color: P.green },
    { label: 'Comments', val: '214', sub: 'Mostly positive', color: P.accent2 },
    { label: 'Saves', val: '1.4K', sub: 'High intent', color: '#74B5E4' },
  ];
  const mw = (W - 48) / 4;
  metrics.forEach((m, i) => {
    const mx = 20 + i * (mw + (i < 3 ? 8 : 0));
    nodes.push(rrect(mx, 190, mw, 68, 10, P.surface));
    nodes.push(text(m.val, mx + mw / 2, 224, { size: 20, fill: m.color, weight: '700', anchor: 'middle' }));
    nodes.push(text(m.label, mx + mw / 2, 240, { size: 8, fill: P.muted, anchor: 'middle' }));
    nodes.push(text(m.sub, mx + mw / 2, 253, { size: 7, fill: P.muted, anchor: 'middle' }));
  });

  // Drop-off heatmap
  nodes.push(text('DROP-OFF MAP', 20, 282, { size: 9, fill: P.muted, weight: '600', ls: 1.5 }));
  nodes.push(rrect(20, 292, W - 40, 100, 12, P.surface));

  // Time axis labels
  const timeMarks = ['0m', '10m', '20m', '29m', '39m', '49m', '58m'];
  const axisW = W - 80;
  timeMarks.forEach((t, i) => {
    const tx = 40 + (i / (timeMarks.length - 1)) * axisW;
    nodes.push(text(t, tx, 386, { size: 8, fill: P.muted, anchor: 'middle' }));
  });

  // Waveform visualization (bigger, drop-off colored)
  const dropData = [
    1.0, 0.98, 0.95, 0.94, 0.93, 0.92, 0.9, 0.88, 0.87, 0.86,
    0.85, 0.83, 0.82, 0.80, 0.79, 0.78, 0.77, 0.76, 0.75, 0.74,
    0.73, 0.71, 0.70, 0.68, 0.67, 0.65, 0.63, 0.61, 0.58, 0.55,
    0.52, 0.48, 0.44, 0.40, 0.38, 0.36, 0.35, 0.34, 0.33, 0.32,
  ];
  const ddW = W - 80;
  const ddBarW = Math.floor((ddW - dropData.length + 1) / dropData.length);
  const ddH = 54;
  const ddY = 305;
  dropData.forEach((val, i) => {
    const bh = Math.max(3, Math.round(ddH * val));
    const bx = 40 + i * (ddBarW + 2);
    const by = ddY + ddH - bh;
    const fill = val > 0.75 ? P.accent
      : val > 0.5 ? P.accent2
      : P.red;
    nodes.push(rrect(bx, by, ddBarW, bh, 1.5, fill));
  });

  // Drop-off annotation
  nodes.push(rrect(220, 300, 120, 30, 8, P.redLo));
  nodes.push(text('⚠ Major drop at 38m', 228, 319, { size: 9, fill: P.red, weight: '600' }));

  // AI insight box
  nodes.push(text('AI INSIGHT', 20, 414, { size: 9, fill: P.muted, weight: '600', ls: 1.5 }));
  nodes.push(rrect(20, 424, W - 40, 80, 12, P.surface));
  nodes.push(rrect(20, 424, W - 40, 80, 12, P.accentLo, { opacity: '0.3' }));
  nodes.push(rrect(20, 424, 4, 80, 2, P.accent));
  nodes.push(text('✦ Listeners drop off during your mid-episode', 34, 445, { size: 12, fill: P.text, weight: '600' }));
  nodes.push(text('ad read at 38m. Consider moving to 45m or', 34, 462, { size: 12, fill: P.textMid }));
  nodes.push(text('cutting 90 seconds from the sponsor segment.', 34, 479, { size: 12, fill: P.textMid }));
  nodes.push(text('Avg. revenue impact: -$340/episode', 34, 496, { size: 11, fill: P.accent2, weight: '600' }));

  // Comments sentiment
  nodes.push(text('COMMENT SENTIMENT', 20, 528, { size: 9, fill: P.muted, weight: '600', ls: 1.5 }));
  nodes.push(rrect(20, 538, W - 40, 48, 10, P.surface));
  const sentiments = [
    { label: 'Positive', pct: 68, color: P.green },
    { label: 'Neutral', pct: 21, color: P.muted },
    { label: 'Negative', pct: 11, color: P.red },
  ];
  const sentW = W - 80;
  let sentX = 40;
  sentiments.forEach(s => {
    const sw = Math.round(sentW * s.pct / 100);
    nodes.push(rrect(sentX, 554, sw, 12, 6, s.color));
    sentX += sw + 4;
  });
  sentiments.forEach((s, i) => {
    const lx = 40 + i * 104;
    nodes.push(circle(lx, 576, 4, s.color));
    nodes.push(text(s.label + ' ' + s.pct + '%', lx + 10, 580, { size: 10, fill: P.textMid }));
  });

  // Top comments
  nodes.push(text('TOP COMMENTS', 20, 610, { size: 9, fill: P.muted, weight: '600', ls: 1.5 }));
  const comments = [
    { text: '"This episode changed how I think about agents..."', likes: '142', positive: true },
    { text: '"The ad in the middle broke the flow for me 😅"', likes: '67', positive: false },
    { text: '"Timestamp 22:30 is pure gold. Bookmarked."', likes: '98', positive: true },
  ];
  comments.forEach((c, i) => {
    const cy2 = 620 + i * 52;
    nodes.push(circle(30, cy2 + 16, 10, P.surface2));
    nodes.push(text('◉', 30, cy2 + 21, { size: 10, fill: c.positive ? P.green : P.red, anchor: 'middle' }));
    nodes.push(text(c.text.length > 48 ? c.text.slice(0, 48) + '…' : c.text, 48, cy2 + 20, { size: 11, fill: P.textMid }));
    nodes.push(text('♥ ' + c.likes, W - 32, cy2 + 20, { size: 10, fill: P.muted, anchor: 'end' }));
    nodes.push(line(48, cy2 + 40, W - 20, cy2 + 40, P.border, 1, 0.5));
  });

  nodes.push(...navBar(1));
  return nodes;
}

// ── SCREEN 3 — AI Brief ───────────────────────────────────────────────────────
function screen3() {
  const nodes = [];
  nodes.push(rect(0, 0, W, H, P.bg));
  nodes.push(...statusBar());

  // Header — Format AI inspired weekly digest
  nodes.push(rrect(0, 44, W, 100, 0, P.surface));
  nodes.push(rrect(0, 44, W, 100, 0, P.accentLo, { opacity: '0.25' }));
  nodes.push(text('✦', 28, 86, { size: 22, fill: P.accent }));
  nodes.push(text('AI', 56, 78, { size: 26, fill: P.accent, weight: '800' }));
  nodes.push(text(' Brief', 80, 78, { size: 26, fill: P.text, weight: '300' }));
  nodes.push(text('Week of Mar 24–30, 2026  ·  3 episodes', 28, 100, { size: 12, fill: P.textMid }));
  nodes.push(text('Generated just now', 28, 118, { size: 10, fill: P.muted }));
  nodes.push(rrect(W - 96, 110, 76, 24, 12, P.accentLo));
  nodes.push(text('✦ AI-powered', W - 58, 126, { size: 9, fill: P.accent, anchor: 'middle' }));

  // This week score
  nodes.push(text('YOUR WEEK AT A GLANCE', 20, 168, { size: 9, fill: P.muted, weight: '600', ls: 1.5 }));
  nodes.push(rrect(20, 178, W - 40, 86, 14, P.surface));
  // big score
  nodes.push(text('84', 56, 242, { size: 52, fill: P.accent, weight: '800' }));
  nodes.push(text('/100', 102, 242, { size: 18, fill: P.muted, weight: '400' }));
  nodes.push(text('CREATOR SCORE', 20 + 16, 198, { size: 8, fill: P.muted, weight: '600', ls: 1.2 }));
  nodes.push(text('↑ +7 from last week', 36, 260, { size: 12, fill: P.green, weight: '600' }));
  // mini score bars
  const scoreItems = [
    { label: 'Retention', val: 72, color: P.accent },
    { label: 'Growth',    val: 61, color: P.green },
    { label: 'Virality',  val: 48, color: P.accent2 },
    { label: 'Revenue',   val: 55, color: '#74B5E4' },
  ];
  scoreItems.forEach((s, i) => {
    const sx = 178 + i * 46;
    nodes.push(rrect(sx, 195, 38, 38, 8, P.surface2));
    nodes.push(text(s.val + '', sx + 19, 222, { size: 15, fill: s.color, weight: '700', anchor: 'middle' }));
    nodes.push(text(s.label, sx + 19, 236, { size: 7, fill: P.muted, anchor: 'middle' }));
  });

  // AI insights list
  nodes.push(text('INSIGHTS THIS WEEK', 20, 286, { size: 9, fill: P.muted, weight: '600', ls: 1.5 }));
  const insights = [
    {
      icon: '🔥', color: P.accent2Lo, tcolor: P.accent2,
      head: 'AI Agents episode is your all-time top 5',
      body: '14.2K plays in 24h. Share velocity 3× your average. Push a follow-up.',
    },
    {
      icon: '📉', color: P.redLo, tcolor: P.red,
      head: 'Ad placement cost you ~$1,020 this week',
      body: 'Drop-off during mid-rolls across 2 episodes. Pre-roll converts 2.4× better.',
    },
    {
      icon: '🌍', color: P.greenLo, tcolor: P.green,
      head: 'New audience segment detected: London',
      body: '+340 new listeners from UK this week. Tech founder demographic, 28–35.',
    },
    {
      icon: '🎯', color: P.accentLo, tcolor: P.accent,
      head: 'Best episode length for you: 42–52 minutes',
      body: 'Completion rate drops 18% past 55m. Your sweet spot is confirmed.',
    },
  ];
  insights.forEach((ins, i) => {
    const iy = 296 + i * 88;
    nodes.push(rrect(20, iy, W - 40, 80, 12, P.surface));
    nodes.push(rrect(20, iy, 5, 80, 2.5, ins.tcolor));
    nodes.push(rrect(32, iy + 12, 42, 42, 10, ins.color));
    nodes.push(text(ins.icon, 53, iy + 39, { size: 22, anchor: 'middle' }));
    nodes.push(text(ins.head, 84, iy + 28, { size: 13, fill: P.text, weight: '600' }));
    // wrap body to 2 lines
    const words = ins.body.split(' ');
    let line1 = '', line2 = '';
    let charCount = 0;
    words.forEach(w => {
      if (charCount + w.length < 38) { line1 += (line1 ? ' ' : '') + w; charCount += w.length + 1; }
      else { line2 += (line2 ? ' ' : '') + w; }
    });
    nodes.push(text(line1, 84, iy + 46, { size: 10, fill: P.textMid }));
    if (line2) nodes.push(text(line2, 84, iy + 60, { size: 10, fill: P.textMid }));
    nodes.push(text('→', W - 30, iy + 44, { size: 14, fill: ins.tcolor, anchor: 'end' }));
  });

  // Action prompt
  nodes.push(rrect(20, 648, W - 40, 56, 14, P.accentLo));
  nodes.push(rrect(20, 648, W - 40, 56, 14, P.accent, { opacity: '0.15' }));
  nodes.push(text('✦  Ask FREQ anything about your podcast', 32, 672, { size: 13, fill: P.accent, weight: '600' }));
  nodes.push(text('"Why did EP 141 underperform?"', 32, 690, { size: 11, fill: P.muted }));

  nodes.push(...navBar(2));
  return nodes;
}

// ── SCREEN 4 — Audience ───────────────────────────────────────────────────────
function screen4() {
  const nodes = [];
  nodes.push(rect(0, 0, W, H, P.bg));
  nodes.push(...statusBar());

  nodes.push(text('Audience', 20, 80, { size: 24, fill: P.text, weight: '700' }));
  nodes.push(text('Total listeners: 38,420', 20, 102, { size: 13, fill: P.muted }));

  // Growth sparkline
  nodes.push(text('30-DAY GROWTH', 20, 128, { size: 9, fill: P.muted, weight: '600', ls: 1.5 }));
  nodes.push(rrect(20, 138, W - 40, 72, 12, P.surface));
  // Sparkline data
  const sparkData = [
    22, 23, 22, 24, 26, 25, 27, 28, 27, 29, 31, 30, 32, 34, 33,
    35, 34, 36, 35, 37, 36, 38, 37, 39, 38, 37, 39, 40, 38, 40,
  ];
  const spW = W - 80;
  const spH = 36;
  const spY = 162;
  const spMax = Math.max(...sparkData);
  const spMin = Math.min(...sparkData);
  const spPts = sparkData.map((v, i) => {
    const sx = 40 + (i / (sparkData.length - 1)) * spW;
    const sy = spY + spH - ((v - spMin) / (spMax - spMin)) * spH;
    return `${sx},${sy}`;
  }).join(' ');
  // Fill area
  const fillPts = `40,${spY + spH} ${spPts} ${40 + spW},${spY + spH}`;
  nodes.push(el('polygon', { points: fillPts, fill: P.accent, opacity: '0.12' }));
  nodes.push(polyline(spPts, P.accent, 2));
  // End dot
  const lastPt = sparkData[sparkData.length - 1];
  const dotX = 40 + spW;
  const dotY = spY + spH - ((lastPt - spMin) / (spMax - spMin)) * spH;
  nodes.push(circle(dotX, dotY, 4, P.accent));
  nodes.push(text('38.4K', dotX - 6, dotY - 8, { size: 9, fill: P.accent, weight: '700', anchor: 'end' }));
  nodes.push(text('+74% in 30d', W - 32, dotY + 4, { size: 10, fill: P.green, weight: '600', anchor: 'end' }));

  // Demographics
  nodes.push(text('DEMOGRAPHICS', 20, 234, { size: 9, fill: P.muted, weight: '600', ls: 1.5 }));
  const demoW = (W - 48) / 2;
  // Age breakdown
  nodes.push(rrect(20, 244, demoW, 130, 12, P.surface));
  nodes.push(text('Age Groups', 30, 264, { size: 12, fill: P.text, weight: '600' }));
  const ageGroups = [
    { label: '18–24', pct: 12, color: '#74B5E4' },
    { label: '25–34', pct: 38, color: P.accent },
    { label: '35–44', pct: 31, color: P.accent2 },
    { label: '45–54', pct: 14, color: P.green },
    { label: '55+',   pct:  5, color: P.muted },
  ];
  ageGroups.forEach((a, i) => {
    const ay = 278 + i * 19;
    nodes.push(text(a.label, 30, ay + 11, { size: 9, fill: P.muted }));
    nodes.push(rrect(72, ay, 82, 11, 5.5, P.border));
    nodes.push(rrect(72, ay, Math.round(82 * a.pct / 100), 11, 5.5, a.color));
    nodes.push(text(a.pct + '%', 158, ay + 11, { size: 9, fill: P.text, weight: '600', anchor: 'end' }));
  });

  // Gender breakdown
  nodes.push(rrect(28 + demoW, 244, demoW, 130, 12, P.surface));
  nodes.push(text('Gender Split', 38 + demoW, 264, { size: 12, fill: P.text, weight: '600' }));
  // Donut-like visual using arcs (simplified as arc segments)
  const cx2 = 28 + demoW + demoW / 2;
  const cy2 = 336;
  const r2 = 38;
  nodes.push(circle(cx2, cy2, r2, P.accentLo));
  nodes.push(circle(cx2, cy2, r2 - 14, P.surface));
  // 62% arc for male (using path arc)
  nodes.push(el('path', {
    d: `M ${cx2} ${cy2 - r2} A ${r2} ${r2} 0 1 1 ${cx2 - r2 * Math.sin(2.23)} ${cy2 - r2 * Math.cos(2.23)} L ${cx2} ${cy2} Z`,
    fill: P.accent, opacity: '0.85',
  }));
  nodes.push(el('path', {
    d: `M ${cx2 - r2 * Math.sin(2.23)} ${cy2 - r2 * Math.cos(2.23)} A ${r2} ${r2} 0 0 1 ${cx2} ${cy2 - r2} L ${cx2} ${cy2} Z`,
    fill: P.green, opacity: '0.85',
  }));
  nodes.push(circle(cx2, cy2, r2 - 14, P.surface));
  nodes.push(text('62%', cx2, cy2 + 5, { size: 13, fill: P.text, weight: '700', anchor: 'middle' }));
  // Legend
  nodes.push(circle(28 + demoW + 8, 345, 5, P.accent));
  nodes.push(text('Male', 28 + demoW + 16, 349, { size: 9, fill: P.textMid }));
  nodes.push(circle(28 + demoW + 8, 362, 5, P.green));
  nodes.push(text('Female', 28 + demoW + 16, 366, { size: 9, fill: P.textMid }));

  // Top cities
  nodes.push(text('TOP CITIES', 20, 398, { size: 9, fill: P.muted, weight: '600', ls: 1.5 }));
  const cities = [
    { city: 'New York',   listeners: '5.2K', flag: '🇺🇸', pct: 100 },
    { city: 'London',     listeners: '3.4K', flag: '🇬🇧', pct: 65 },
    { city: 'San Francisco', listeners: '2.9K', flag: '🇺🇸', pct: 56 },
    { city: 'Toronto',    listeners: '2.1K', flag: '🇨🇦', pct: 40 },
    { city: 'Berlin',     listeners: '1.8K', flag: '🇩🇪', pct: 35 },
  ];
  cities.forEach((c, i) => {
    const citY = 408 + i * 50;
    nodes.push(rrect(20, citY, W - 40, 42, 10, P.surface));
    nodes.push(text(c.flag, 34, citY + 26, { size: 16 }));
    nodes.push(text(c.city, 58, citY + 22, { size: 13, fill: P.text, weight: '500' }));
    nodes.push(rrect(58, citY + 28, Math.round((W - 130) * c.pct / 100), 6, 3, P.accent, { opacity: '0.7' }));
    nodes.push(text(c.listeners, W - 30, citY + 26, { size: 13, fill: P.textMid, anchor: 'end', weight: '600' }));
  });

  // Listening platforms
  nodes.push(text('PLATFORMS', 20, 668, { size: 9, fill: P.muted, weight: '600', ls: 1.5 }));
  const platforms = [
    { name: 'Spotify',      pct: 48, color: '#1DB954' },
    { name: 'Apple Podcasts', pct: 31, color: '#B060F8' },
    { name: 'YouTube',      pct: 12, color: '#FF0000' },
    { name: 'Other',        pct:  9, color: P.muted },
  ];
  nodes.push(rrect(20, 678, W - 40, 44, 10, P.surface));
  const platW = W - 80;
  let platX = 40;
  platforms.forEach(p => {
    const pw = Math.round(platW * p.pct / 100);
    nodes.push(rrect(platX, 688, pw - 2, 24, 4, p.color, { opacity: '0.85' }));
    platX += pw;
  });
  platforms.forEach((p, i) => {
    nodes.push(circle(40 + i * 80, 720, 4, p.color));
    nodes.push(text(p.name + ' ' + p.pct + '%', 48 + i * 80, 724, { size: 9, fill: P.textMid }));
  });

  nodes.push(...navBar(3));
  return nodes;
}

// ── SCREEN 5 — Monetize ───────────────────────────────────────────────────────
function screen5() {
  const nodes = [];
  nodes.push(rect(0, 0, W, H, P.bg));
  nodes.push(...statusBar());

  nodes.push(text('Monetize', 20, 80, { size: 24, fill: P.text, weight: '700' }));
  nodes.push(text('March 2026 · 3 active sponsors', 20, 102, { size: 13, fill: P.muted }));

  // Revenue hero
  nodes.push(rrect(20, 114, W - 40, 90, 14, P.surface));
  nodes.push(rrect(20, 114, W - 40, 90, 14, P.accentLo, { opacity: '0.2' }));
  nodes.push(text('MARCH REVENUE', 32, 136, { size: 9, fill: P.muted, weight: '600', ls: 1.5 }));
  nodes.push(text('$', 32, 185, { size: 18, fill: P.textMid, weight: '400' }));
  nodes.push(text('6,840', 50, 185, { size: 38, fill: P.text, weight: '800' }));
  nodes.push(text('↑ +$920 vs Feb', 152, 185, { size: 13, fill: P.green, weight: '600' }));
  nodes.push(text('Projected: $8,200 if you move mid-rolls to pre-roll', 32, 200, { size: 10, fill: P.accent }));

  // Sponsor performance
  nodes.push(text('SPONSOR PERFORMANCE', 20, 228, { size: 9, fill: P.muted, weight: '600', ls: 1.5 }));
  const sponsors = [
    {
      name: 'Notion',
      type: 'Pre-roll  ·  30s',
      reads: 3, rate: '$18 CPM', earned: '$2,560',
      retention: 94, retColor: P.green,
      skipRate: '6%', skipColor: P.green,
      ai: 'Best performer. Listeners rarely skip. Renew at higher rate.',
      aiColor: P.greenLo, aiTColor: P.green,
    },
    {
      name: 'Linear',
      type: 'Mid-roll  ·  60s',
      reads: 3, rate: '$22 CPM', earned: '$3,120',
      retention: 58, retColor: P.accent2,
      skipRate: '42%', skipColor: P.red,
      ai: '⚠ 42% skip rate. Move to pre-roll or shorten to 30s.',
      aiColor: P.redLo, aiTColor: P.red,
    },
    {
      name: 'Raycast',
      type: 'Post-roll  ·  45s',
      reads: 2, rate: '$12 CPM', earned: '$1,160',
      retention: 31, retColor: P.red,
      skipRate: '69%', skipColor: P.red,
      ai: 'Low retention spot. Only 31% reach post-roll. Renegotiate.',
      aiColor: P.redLo, aiTColor: P.red,
    },
  ];

  sponsors.forEach((sp, i) => {
    const sy = 238 + i * 136;
    nodes.push(rrect(20, sy, W - 40, 128, 12, P.surface));

    // Sponsor name row
    nodes.push(rrect(32, sy + 12, 38, 22, 8, P.accentLo));
    nodes.push(text(sp.name[0], 51, sy + 29, { size: 14, fill: P.accent, weight: '700', anchor: 'middle' }));
    nodes.push(text(sp.name, 78, sy + 26, { size: 15, fill: P.text, weight: '700' }));
    nodes.push(text(sp.type, 78, sy + 42, { size: 10, fill: P.muted }));
    nodes.push(text(sp.earned, W - 32, sy + 28, { size: 18, fill: P.text, weight: '700', anchor: 'end' }));
    nodes.push(text(sp.rate, W - 32, sy + 45, { size: 10, fill: P.muted, anchor: 'end' }));

    // Retention bar
    nodes.push(line(32, sy + 58, W - 32, sy + 58, P.border));
    nodes.push(text('Retention: ' + sp.retention + '%', 32, sy + 74, { size: 11, fill: sp.retColor, weight: '600' }));
    nodes.push(rrect(32, sy + 78, W - 72, 6, 3, P.border));
    nodes.push(rrect(32, sy + 78, Math.round((W - 72) * sp.retention / 100), 6, 3, sp.retColor));
    nodes.push(text('Skip: ' + sp.skipRate, W - 32, sy + 74, { size: 11, fill: sp.skipColor, weight: '600', anchor: 'end' }));

    // AI callout
    nodes.push(rrect(32, sy + 94, W - 72, 26, 8, sp.aiColor));
    nodes.push(text('✦ ' + sp.ai, 40, sy + 112, { size: 9.5, fill: sp.aiTColor }));
  });

  nodes.push(...navBar(4));
  return nodes;
}

// ── SVG serializer ────────────────────────────────────────────────────────────
function serialize(node) {
  if (node.type === '__text__') return node.value;
  const attrs = Object.entries(node.attrs || {})
    .map(([k, v]) => `${k}="${String(v).replace(/"/g, '&quot;')}"`)
    .join(' ');
  const children = (node.children || []).map(serialize).join('');
  return `<${node.type}${attrs ? ' ' + attrs : ''}>${children}</${node.type}>`;
}

function toSVG(nodes, w = W, h = H) {
  const inner = nodes.map(serialize).join('\n  ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n  <defs><style>text{font-family:'Inter',system-ui,sans-serif;}</style></defs>\n  ${inner}\n</svg>`;
}

// ── Build + write ─────────────────────────────────────────────────────────────
const screens = [
  { id: 'feed',      label: 'Episode Feed',    nodes: screen1() },
  { id: 'episode',   label: 'Episode Detail',  nodes: screen2() },
  { id: 'aibrief',   label: 'AI Brief',        nodes: screen3() },
  { id: 'audience',  label: 'Audience',        nodes: screen4() },
  { id: 'monetize',  label: 'Monetize',        nodes: screen5() },
];

const pen = {
  version: '2.8',
  meta: {
    name:        'FREQ',
    tagline:     'Podcast intelligence for creators',
    description: 'A DARK-mode AI podcast analytics platform. Inspired by Format AI Podcasts on darkmodedesign.com and Neon.com\'s terminal aesthetic. Electric violet on near-black with waveform-native data visualizations.',
    author:      'RAM Design Heartbeat',
    created:     new Date().toISOString(),
    theme:       'dark',
    platform:    'mobile',
    dimensions:  { width: W, height: H },
    palette: {
      bg:      P.bg,
      surface: P.surface,
      text:    P.text,
      accent:  P.accent,
      accent2: P.accent2,
      muted:   P.muted,
    },
  },
  screens: screens.map(s => ({
    id:    s.id,
    label: s.label,
    svg:   toSVG(s.nodes),
  })),
};

const outPath = path.join(__dirname, 'freq.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log('✓ freq.pen written');
console.log(`  Screens: ${pen.screens.length}`);
console.log(`  Theme: DARK — near-black navy #07080F`);
console.log(`  Accent: electric violet #7B6EF6 + amber #F59E0B`);
console.log(`  Inspired by: Format AI (darkmodedesign.com), Neon.com (darkmodedesign.com), Atlas Card (godly.website)`);
