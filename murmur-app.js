// MURMUR — AI audio intelligence briefings
// Inspired by: Format Podcasts (useformat.ai/podcasts) trend seen on darkmodedesign.com
// + editorial layouts from Awwwards iyO SOTD + warm parchment UX from Darkroom.au
// Theme: LIGHT (warm parchment / editorial)

const fs = require('fs');

// ── Palette ──────────────────────────────────────────────────────────────────
const P = {
  bg:       '#F7F4EE',   // warm parchment
  surface:  '#FFFFFF',
  border:   '#E8E2D8',
  text:     '#1C1A18',
  sub:      '#7A7168',
  accent:   '#D4522A',   // warm terracotta
  accent2:  '#8B6F47',   // warm tan
  muted:    'rgba(28,26,24,0.12)',
  wave:     '#D4522A',
  green:    '#2E7D52',
  blue:     '#2B5DA0',
  amber:    '#C4830A',
};

// ── Typography ────────────────────────────────────────────────────────────────
function text(content, opts = {}) {
  return {
    type: 'text',
    content,
    size: opts.size || 14,
    weight: opts.weight || 400,
    color: opts.color || P.text,
    align: opts.align || 'left',
    italic: opts.italic || false,
    opacity: opts.opacity || 1,
  };
}

// ── Shape ─────────────────────────────────────────────────────────────────────
function rect(x, y, w, h, opts = {}) {
  return {
    type: 'rect',
    x, y, width: w, height: h,
    fill: opts.fill || 'transparent',
    stroke: opts.stroke || 'transparent',
    strokeWidth: opts.strokeWidth || 1,
    radius: opts.radius || 0,
    opacity: opts.opacity || 1,
  };
}

function circle(x, y, r, opts = {}) {
  return {
    type: 'ellipse',
    x: x - r, y: y - r,
    width: r * 2, height: r * 2,
    fill: opts.fill || P.accent,
    stroke: opts.stroke || 'transparent',
    strokeWidth: opts.strokeWidth || 0,
    opacity: opts.opacity || 1,
  };
}

function line(x1, y1, x2, y2, opts = {}) {
  return {
    type: 'line',
    x1, y1, x2, y2,
    stroke: opts.stroke || P.border,
    strokeWidth: opts.strokeWidth || 1,
    opacity: opts.opacity || 1,
  };
}

// ── Waveform bars ─────────────────────────────────────────────────────────────
function waveform(x, y, w, h, progress, color, bgColor) {
  const elements = [];
  const barCount = 40;
  const barW = Math.floor(w / (barCount * 1.5));
  const gap = Math.floor(w / barCount) - barW;
  const heights = [
    0.3,0.5,0.7,0.4,0.8,0.6,0.9,0.5,0.4,0.7,
    0.6,0.8,0.5,0.3,0.6,0.9,0.7,0.4,0.5,0.8,
    0.6,0.4,0.7,0.9,0.5,0.3,0.8,0.6,0.4,0.7,
    0.5,0.9,0.6,0.3,0.7,0.5,0.8,0.4,0.6,0.5,
  ];
  const played = Math.floor(progress * barCount);
  for (let i = 0; i < barCount; i++) {
    const bh = Math.round(heights[i] * h);
    const bx = x + i * (barW + gap);
    const by = y + (h - bh) / 2;
    const isPlayed = i < played;
    elements.push(rect(bx, by, barW, bh, {
      fill: isPlayed ? color : bgColor,
      radius: Math.floor(barW / 2),
    }));
  }
  return elements;
}

// ── Play icon (triangle) ──────────────────────────────────────────────────────
function playIcon(cx, cy, size, color) {
  // approximate play triangle as a polygon
  return {
    type: 'polygon',
    points: [
      { x: cx - size * 0.35, y: cy - size * 0.5 },
      { x: cx + size * 0.5,  y: cy },
      { x: cx - size * 0.35, y: cy + size * 0.5 },
    ],
    fill: color,
    stroke: 'transparent',
    strokeWidth: 0,
  };
}

// ── Mic icon ──────────────────────────────────────────────────────────────────
function micBadge(x, y, color) {
  const els = [];
  // mic body
  els.push(rect(x + 3, y, 6, 10, { fill: color, radius: 3 }));
  // arc base (simulate with rect)
  els.push(rect(x, y + 8, 12, 2, { fill: 'transparent', stroke: color, strokeWidth: 1.5, radius: 1 }));
  // stand line
  els.push(rect(x + 5, y + 10, 2, 3, { fill: color }));
  // base
  els.push(rect(x + 2, y + 13, 8, 1.5, { fill: color, radius: 0.5 }));
  return els;
}

// ── Tag pill ──────────────────────────────────────────────────────────────────
function tag(x, y, label, color, textColor) {
  const w = label.length * 6.5 + 16;
  return [
    rect(x, y, w, 20, { fill: color, radius: 10 }),
    { ...text(label, { size: 11, color: textColor || P.text, weight: 500 }), x: x + 8, y: y + 4 },
  ];
}

// ── Divider ───────────────────────────────────────────────────────────────────
function divider(y) {
  return line(16, y, 359, y, { stroke: P.border, strokeWidth: 1 });
}

// ── Status dot ────────────────────────────────────────────────────────────────
function dot(x, y, color) {
  return circle(x, y, 4, { fill: color });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — Today's Briefing (hero player)
// ═══════════════════════════════════════════════════════════════════════════════
function screen1() {
  const els = [];
  const W = 375, BG = P.bg;

  // Background
  els.push(rect(0, 0, W, 812, { fill: BG }));

  // Status bar
  els.push({ ...text('9:41', { size: 13, weight: 600, color: P.text }), x: 20, y: 14 });
  els.push({ ...text('●●●  ▌▌  ⬛', { size: 10, color: P.text }), x: 290, y: 16 });

  // Header
  els.push({ ...text('MURMUR', { size: 12, weight: 700, color: P.accent, italic: false }), x: 20, y: 56 });
  els.push({ ...text('Thursday, April 3', { size: 12, color: P.sub }), x: 20, y: 72 });
  // avatar placeholder
  els.push(circle(355, 60, 18, { fill: P.muted, stroke: P.border, strokeWidth: 1 }));
  els.push({ ...text('RK', { size: 11, weight: 600, color: P.sub }), x: 347, y: 55 });

  // "DAILY BRIEFING" label
  els.push({ ...text('DAILY BRIEFING', { size: 10, weight: 700, color: P.sub }), x: 20, y: 108 });
  els.push(line(20, 120, 356, 120, { stroke: P.border }));

  // Episode card — large hero
  els.push(rect(16, 132, 343, 220, { fill: P.surface, radius: 16, stroke: P.border, strokeWidth: 1 }));

  // Gradient band (simulated with layered rects, warm terracotta)
  els.push(rect(16, 132, 343, 80, { fill: P.accent, radius: 16, opacity: 0.9 }));
  els.push(rect(16, 192, 343, 20, { fill: P.accent, opacity: 0.4 }));

  // Episode number badge
  els.push(rect(28, 143, 64, 20, { fill: 'rgba(255,255,255,0.2)', radius: 10 }));
  els.push({ ...text('EP. 147', { size: 10, weight: 700, color: '#FFFFFF' }), x: 40, y: 147 });

  // Duration badge
  els.push({ ...text('12:34', { size: 10, weight: 600, color: 'rgba(255,255,255,0.8)' }), x: 313, y: 147 });

  // Title on card
  els.push({ ...text('This week in product', { size: 18, weight: 700, color: '#FFFFFF' }), x: 28, y: 175 });
  els.push({ ...text('3 critical signals from support + NPS dip', { size: 12, color: 'rgba(255,255,255,0.85)' }), x: 28, y: 196 });

  // Waveform section inside card
  const waveEls = waveform(28, 228, 260, 32, 0.38, P.accent, '#E8D8D0');
  waveEls.forEach(e => els.push(e));

  // Time labels
  els.push({ ...text('4:43', { size: 10, color: P.sub }), x: 28, y: 265 });
  els.push({ ...text('12:34', { size: 10, color: P.sub }), x: 322, y: 265 });

  // Playback controls
  const ctrlY = 295;
  // skip back 15
  els.push({ ...text('↺15', { size: 16, color: P.sub }), x: 260, y: ctrlY - 8 });
  // play button
  els.push(circle(187, ctrlY, 24, { fill: P.accent }));
  els.push(playIcon(187, ctrlY, 16, '#FFFFFF'));
  // skip fwd 30
  els.push({ ...text('30↻', { size: 16, color: P.sub }), x: 216, y: ctrlY - 8 });
  // 1x speed
  els.push(rect(280, ctrlY - 12, 40, 24, { fill: P.muted, radius: 12 }));
  els.push({ ...text('1.0×', { size: 11, weight: 600, color: P.sub }), x: 289, y: ctrlY - 4 });

  // Divider after card
  els.push(divider(368));

  // "IN THIS EPISODE" section
  els.push({ ...text('IN THIS EPISODE', { size: 10, weight: 700, color: P.sub }), x: 20, y: 384 });

  const chapters = [
    { time: '0:00', title: 'Intro — weekly signal summary', color: P.green },
    { time: '2:14', title: 'Support ticket surge: checkout friction', color: P.amber },
    { time: '5:48', title: 'NPS trend: -4 pts vs last month', color: P.accent },
    { time: '9:22', title: 'Feature request clusters (top 3)', color: P.blue },
  ];

  chapters.forEach((ch, i) => {
    const cy = 406 + i * 54;
    els.push(dot(28, cy + 10, ch.color));
    els.push({ ...text(ch.time, { size: 11, weight: 700, color: ch.color }), x: 44, y: cy + 4 });
    els.push({ ...text(ch.title, { size: 13, weight: 400, color: P.text }), x: 44, y: cy + 18 });
    if (i < chapters.length - 1) {
      els.push(line(28, cy + 40, 356, cy + 40, { stroke: P.border }));
    }
  });

  // Bottom nav
  els.push(rect(0, 730, 375, 82, { fill: P.surface, stroke: P.border, strokeWidth: 1 }));

  const navItems = [
    { label: 'Briefing', icon: '◎', active: true },
    { label: 'Library', icon: '⊞', active: false },
    { label: 'Insights', icon: '◈', active: false },
    { label: 'Sources', icon: '⊕', active: false },
  ];
  navItems.forEach((n, i) => {
    const nx = 28 + i * 82;
    const col = n.active ? P.accent : P.sub;
    els.push({ ...text(n.icon, { size: 20, color: col }), x: nx, y: 742 });
    els.push({ ...text(n.label, { size: 10, weight: n.active ? 600 : 400, color: col }), x: nx - 4, y: 766 });
  });

  return {
    id: 'briefing',
    label: 'Today\'s Briefing',
    width: 375,
    height: 812,
    background: BG,
    elements: els,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — Library (episode list)
// ═══════════════════════════════════════════════════════════════════════════════
function screen2() {
  const els = [];
  const W = 375;

  els.push(rect(0, 0, W, 812, { fill: P.bg }));

  // Status bar
  els.push({ ...text('9:41', { size: 13, weight: 600, color: P.text }), x: 20, y: 14 });
  els.push({ ...text('●●●  ▌▌  ⬛', { size: 10, color: P.text }), x: 290, y: 16 });

  // Header
  els.push({ ...text('Library', { size: 24, weight: 700, color: P.text }), x: 20, y: 56 });
  els.push({ ...text('147 episodes', { size: 12, color: P.sub }), x: 20, y: 80 });

  // Filter tabs
  const tabs = ['All', 'Unplayed', 'Downloaded', 'Starred'];
  let tx = 20;
  tabs.forEach((t, i) => {
    const tw = t.length * 7 + 20;
    els.push(rect(tx, 96, tw, 28, {
      fill: i === 0 ? P.accent : P.muted,
      radius: 14,
    }));
    els.push({ ...text(t, { size: 12, weight: i === 0 ? 600 : 400, color: i === 0 ? '#FFFFFF' : P.sub }), x: tx + 10, y: 104 });
    tx += tw + 8;
  });

  // Episode list
  const episodes = [
    { ep: 147, title: 'This week in product', date: 'Today', dur: '12:34', tag: 'New', tagColor: P.green, progress: 0.38 },
    { ep: 146, title: 'Onboarding drop-off analysis', date: 'Last Thursday', dur: '9:12', tag: 'Playing', tagColor: P.accent, progress: 0.38 },
    { ep: 145, title: 'Feature velocity & churn signals', date: '2 weeks ago', dur: '14:05', tag: null, progress: 1 },
    { ep: 144, title: 'Q1 retro: wins and misses', date: '3 weeks ago', dur: '18:22', tag: null, progress: 1 },
    { ep: 143, title: 'Support storm: what we learned', date: 'Mar 13', dur: '11:48', tag: '★', tagColor: P.amber, progress: 1 },
  ];

  episodes.forEach((ep, i) => {
    const ey = 144 + i * 104;

    // Card
    els.push(rect(16, ey, 343, 94, { fill: P.surface, radius: 12, stroke: P.border, strokeWidth: 1 }));

    // Accent band on left
    els.push(rect(16, ey, 4, 94, { fill: ep.progress === 1 ? P.muted : P.accent, radius: 2 }));

    // Episode number
    els.push({ ...text(`EP.${ep.ep}`, { size: 10, weight: 700, color: P.sub }), x: 28, y: ey + 10 });

    // Tag
    if (ep.tag) {
      const tagEls = tag(280, ey + 6, ep.tag, ep.tagColor + '20', ep.tagColor);
      tagEls.forEach(e => els.push(e));
    }

    // Title
    els.push({ ...text(ep.title, { size: 14, weight: 600, color: P.text }), x: 28, y: ey + 24 });

    // Date + duration
    els.push({ ...text(`${ep.date}  ·  ${ep.dur}`, { size: 11, color: P.sub }), x: 28, y: ey + 42 });

    // Mini waveform
    const waveEls = waveform(28, ey + 60, 220, 20, ep.progress, P.accent, '#E5DDD4');
    waveEls.forEach(e => els.push(e));

    // Mini play button
    els.push(circle(330, ey + 47, 18, { fill: ep.progress === 1 ? P.muted : P.accent + '20', stroke: ep.progress === 1 ? P.border : P.accent, strokeWidth: 1.5 }));
    els.push(playIcon(330, ey + 47, 10, ep.progress === 1 ? P.sub : P.accent));
  });

  // Bottom nav
  els.push(rect(0, 730, 375, 82, { fill: P.surface, stroke: P.border, strokeWidth: 1 }));
  const navItems = [
    { label: 'Briefing', icon: '◎', active: false },
    { label: 'Library', icon: '⊞', active: true },
    { label: 'Insights', icon: '◈', active: false },
    { label: 'Sources', icon: '⊕', active: false },
  ];
  navItems.forEach((n, i) => {
    const nx = 28 + i * 82;
    const col = n.active ? P.accent : P.sub;
    els.push({ ...text(n.icon, { size: 20, color: col }), x: nx, y: 742 });
    els.push({ ...text(n.label, { size: 10, weight: n.active ? 600 : 400, color: col }), x: nx - 4, y: 766 });
  });

  return {
    id: 'library',
    label: 'Library',
    width: 375,
    height: 812,
    background: P.bg,
    elements: els,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — Insights (extracted intelligence feed)
// ═══════════════════════════════════════════════════════════════════════════════
function screen3() {
  const els = [];

  els.push(rect(0, 0, 375, 812, { fill: P.bg }));

  // Status bar
  els.push({ ...text('9:41', { size: 13, weight: 600, color: P.text }), x: 20, y: 14 });
  els.push({ ...text('●●●  ▌▌  ⬛', { size: 10, color: P.text }), x: 290, y: 16 });

  // Header
  els.push({ ...text('Insights', { size: 24, weight: 700, color: P.text }), x: 20, y: 56 });
  els.push({ ...text('Extracted from 147 episodes · 2.4k signals', { size: 12, color: P.sub }), x: 20, y: 80 });

  // Search bar
  els.push(rect(16, 96, 343, 40, { fill: P.surface, radius: 20, stroke: P.border, strokeWidth: 1 }));
  els.push({ ...text('🔍  Search insights...', { size: 13, color: P.sub }), x: 32, y: 108 });

  // Stats row
  const stats = [
    { label: 'Signals', value: '2,401', color: P.text },
    { label: 'Critical', value: '38', color: P.accent },
    { label: 'This week', value: '+127', color: P.green },
  ];
  stats.forEach((s, i) => {
    const sx = 16 + i * 118;
    els.push(rect(sx, 148, 110, 60, { fill: P.surface, radius: 10, stroke: P.border, strokeWidth: 1 }));
    els.push({ ...text(s.value, { size: 22, weight: 700, color: s.color }), x: sx + 12, y: sx === 16 ? 160 : 160 });
    els.push({ ...text(s.value, { size: 22, weight: 700, color: s.color }), x: sx + 12, y: 163 });
    els.push({ ...text(s.label, { size: 11, color: P.sub }), x: sx + 12, y: 185 });
  });

  // Insight cards
  const insights = [
    {
      category: 'FRICTION', catColor: P.accent,
      title: 'Checkout flow causes drop-off at step 3',
      source: 'EP.147 · 2:14', sources: 34,
      severity: 'high',
      tags: ['checkout', 'ux', 'revenue'],
    },
    {
      category: 'SENTIMENT', catColor: P.amber,
      title: 'NPS trending down — pricing sensitivity',
      source: 'EP.147 · 5:48', sources: 18,
      severity: 'medium',
      tags: ['nps', 'pricing', 'retention'],
    },
    {
      category: 'FEATURE REQ', catColor: P.blue,
      title: 'Bulk export requested by 23% of power users',
      source: 'EP.147 · 9:22', sources: 61,
      severity: 'medium',
      tags: ['export', 'power-users'],
    },
    {
      category: 'WIN', catColor: P.green,
      title: 'New search feature getting strong positive signal',
      source: 'EP.146 · 3:05', sources: 12,
      severity: 'low',
      tags: ['search', 'delight'],
    },
  ];

  insights.forEach((ins, i) => {
    const iy = 224 + i * 116;

    els.push(rect(16, iy, 343, 106, { fill: P.surface, radius: 12, stroke: P.border, strokeWidth: 1 }));
    // left accent
    els.push(rect(16, iy, 4, 106, { fill: ins.catColor, radius: 2 }));

    // Category
    els.push(rect(28, iy + 10, ins.category.length * 6.5 + 12, 18, { fill: ins.catColor + '18', radius: 9 }));
    els.push({ ...text(ins.category, { size: 10, weight: 700, color: ins.catColor }), x: 34, y: iy + 13 });

    // Severity dot
    const sevColor = { high: P.accent, medium: P.amber, low: P.green }[ins.severity];
    els.push(dot(340, iy + 16, sevColor));

    // Title
    els.push({ ...text(ins.title, { size: 13, weight: 600, color: P.text }), x: 28, y: iy + 33 });

    // Source + count
    els.push({ ...text(ins.source, { size: 11, color: P.sub }), x: 28, y: iy + 51 });
    els.push({ ...text(`${ins.sources} mentions`, { size: 11, color: P.sub }), x: 290, y: iy + 51 });

    // Tags
    let tx = 28;
    ins.tags.forEach(t => {
      const tw = t.length * 6 + 12;
      els.push(rect(tx, iy + 68, tw, 20, { fill: P.muted, radius: 10 }));
      els.push({ ...text(t, { size: 10, color: P.sub }), x: tx + 6, y: iy + 72 });
      tx += tw + 6;
    });

    // Listen CTA
    els.push({ ...text('▶ Listen', { size: 11, weight: 600, color: P.accent }), x: 300, y: iy + 72 });
  });

  // Bottom nav
  els.push(rect(0, 730, 375, 82, { fill: P.surface, stroke: P.border, strokeWidth: 1 }));
  const navItems = [
    { label: 'Briefing', icon: '◎', active: false },
    { label: 'Library', icon: '⊞', active: false },
    { label: 'Insights', icon: '◈', active: true },
    { label: 'Sources', icon: '⊕', active: false },
  ];
  navItems.forEach((n, i) => {
    const nx = 28 + i * 82;
    const col = n.active ? P.accent : P.sub;
    els.push({ ...text(n.icon, { size: 20, color: col }), x: nx, y: 742 });
    els.push({ ...text(n.label, { size: 10, weight: n.active ? 600 : 400, color: col }), x: nx - 4, y: 766 });
  });

  return {
    id: 'insights',
    label: 'Insights Feed',
    width: 375,
    height: 812,
    background: P.bg,
    elements: els,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — Sources (connected data pipelines)
// ═══════════════════════════════════════════════════════════════════════════════
function screen4() {
  const els = [];

  els.push(rect(0, 0, 375, 812, { fill: P.bg }));

  // Status bar
  els.push({ ...text('9:41', { size: 13, weight: 600, color: P.text }), x: 20, y: 14 });
  els.push({ ...text('●●●  ▌▌  ⬛', { size: 10, color: P.text }), x: 290, y: 16 });

  // Header
  els.push({ ...text('Sources', { size: 24, weight: 700, color: P.text }), x: 20, y: 56 });
  els.push({ ...text('6 connected · last synced 2h ago', { size: 12, color: P.sub }), x: 20, y: 80 });

  // "Add Source" button
  els.push(rect(270, 52, 89, 32, { fill: P.accent, radius: 16 }));
  els.push({ ...text('+ Add Source', { size: 12, weight: 600, color: '#FFFFFF' }), x: 278, y: 60 });

  // Connected sources
  const sources = [
    { name: 'Intercom', icon: '💬', type: 'Support tickets', records: '1,204', lastSync: '2h ago', color: P.blue, health: 'good' },
    { name: 'Delighted', icon: '⭐', type: 'NPS surveys', records: '380', lastSync: '2h ago', color: P.green, health: 'good' },
    { name: 'Notion', icon: '📋', type: 'Meeting notes', records: '94', lastSync: '6h ago', color: P.text, health: 'good' },
    { name: 'Typeform', icon: '📝', type: 'User research', records: '211', lastSync: '1d ago', color: P.amber, health: 'warn' },
    { name: 'Slack #feedback', icon: '💙', type: 'Team signals', records: '876', lastSync: '2h ago', color: P.blue, health: 'good' },
    { name: 'G2 Reviews', icon: '⭐', type: 'Public reviews', records: '63', lastSync: 'Error', color: P.accent, health: 'error' },
  ];

  sources.forEach((src, i) => {
    const sy = 108 + i * 100;
    els.push(rect(16, sy, 343, 88, { fill: P.surface, radius: 12, stroke: P.border, strokeWidth: 1 }));

    // Icon circle
    els.push(circle(46, sy + 44, 20, { fill: src.color + '15', stroke: src.color + '30', strokeWidth: 1.5 }));
    els.push({ ...text(src.icon, { size: 16 }), x: 37, y: sy + 36 });

    // Name + type
    els.push({ ...text(src.name, { size: 15, weight: 600, color: P.text }), x: 76, y: sy + 20 });
    els.push({ ...text(src.type, { size: 12, color: P.sub }), x: 76, y: sy + 38 });

    // Records
    els.push({ ...text(src.records + ' records', { size: 12, color: P.sub }), x: 76, y: sy + 56 });

    // Health indicator
    const healthColor = { good: P.green, warn: P.amber, error: P.accent }[src.health];
    els.push(dot(340, sy + 20, healthColor));

    // Sync time
    els.push({ ...text(src.lastSync, { size: 11, color: src.health === 'error' ? P.accent : P.sub, weight: src.health === 'error' ? 600 : 400 }), x: 270, y: sy + 38 });

    // Progress bar (data freshness)
    els.push(rect(76, sy + 70, 252, 6, { fill: P.muted, radius: 3 }));
    const freshnessP = src.health === 'error' ? 0.05 : src.health === 'warn' ? 0.5 : Math.random() * 0.3 + 0.7;
    const freshW = Math.round(freshnessP * 252);
    els.push(rect(76, sy + 70, freshW, 6, { fill: healthColor, radius: 3 }));
  });

  // Bottom nav
  els.push(rect(0, 730, 375, 82, { fill: P.surface, stroke: P.border, strokeWidth: 1 }));
  const navItems = [
    { label: 'Briefing', icon: '◎', active: false },
    { label: 'Library', icon: '⊞', active: false },
    { label: 'Insights', icon: '◈', active: false },
    { label: 'Sources', icon: '⊕', active: true },
  ];
  navItems.forEach((n, i) => {
    const nx = 28 + i * 82;
    const col = n.active ? P.accent : P.sub;
    els.push({ ...text(n.icon, { size: 20, color: col }), x: nx, y: 742 });
    els.push({ ...text(n.label, { size: 10, weight: n.active ? 600 : 400, color: col }), x: nx - 4, y: 766 });
  });

  return {
    id: 'sources',
    label: 'Sources',
    width: 375,
    height: 812,
    background: P.bg,
    elements: els,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — Voice & Delivery settings
// ═══════════════════════════════════════════════════════════════════════════════
function screen5() {
  const els = [];

  els.push(rect(0, 0, 375, 812, { fill: P.bg }));

  // Status bar
  els.push({ ...text('9:41', { size: 13, weight: 600, color: P.text }), x: 20, y: 14 });
  els.push({ ...text('●●●  ▌▌  ⬛', { size: 10, color: P.text }), x: 290, y: 16 });

  // Header
  els.push({ ...text('Voice & Delivery', { size: 24, weight: 700, color: P.text }), x: 20, y: 56 });
  els.push({ ...text('Customise how MURMUR sounds and arrives', { size: 12, color: P.sub }), x: 20, y: 80 });

  // VOICE SECTION
  els.push({ ...text('NARRATOR VOICE', { size: 10, weight: 700, color: P.sub }), x: 20, y: 108 });
  els.push(line(20, 120, 356, 120, { stroke: P.border }));

  const voices = [
    { name: 'Sage', desc: 'Calm, authoritative', selected: true },
    { name: 'Harper', desc: 'Warm, conversational', selected: false },
    { name: 'Atlas', desc: 'Crisp, professional', selected: false },
  ];
  voices.forEach((v, i) => {
    const vy = 130 + i * 68;
    els.push(rect(16, vy, 343, 58, { fill: v.selected ? P.accent + '08' : P.surface, radius: 12, stroke: v.selected ? P.accent : P.border, strokeWidth: v.selected ? 1.5 : 1 }));

    // Voice avatar circle with waveform
    els.push(circle(46, vy + 29, 20, { fill: v.selected ? P.accent : P.muted, stroke: 'transparent' }));

    // Mini static waveform in circle
    [4,7,3,8,5,9,4,6].forEach((h, wi) => {
      const bh = Math.round(h / 10 * 24);
      els.push(rect(33 + wi * 4, vy + 29 - bh / 2, 2, bh, { fill: v.selected ? '#FFFFFF' : P.sub, radius: 1, opacity: 0.8 }));
    });

    els.push({ ...text(v.name, { size: 14, weight: 600, color: v.selected ? P.accent : P.text }), x: 76, y: vy + 18 });
    els.push({ ...text(v.desc, { size: 12, color: P.sub }), x: 76, y: vy + 34 });

    // Selected checkmark or play
    if (v.selected) {
      els.push(circle(344, vy + 29, 12, { fill: P.accent }));
      els.push({ ...text('✓', { size: 12, weight: 700, color: '#FFFFFF' }), x: 338, y: vy + 23 });
    } else {
      els.push(circle(344, vy + 29, 12, { fill: 'transparent', stroke: P.border, strokeWidth: 1.5 }));
      els.push(playIcon(344, vy + 29, 8, P.sub));
    }
  });

  // SPEED SECTION
  els.push({ ...text('PLAYBACK SPEED', { size: 10, weight: 700, color: P.sub }), x: 20, y: 344 });
  els.push(line(20, 356, 356, 356, { stroke: P.border }));
  els.push(rect(16, 364, 343, 60, { fill: P.surface, radius: 12, stroke: P.border, strokeWidth: 1 }));
  const speeds = ['0.75×', '1.0×', '1.25×', '1.5×', '2.0×'];
  speeds.forEach((s, i) => {
    const sx = 32 + i * 60;
    const active = i === 2;
    els.push(rect(sx - 8, 374, 52, 30, { fill: active ? P.accent : P.muted, radius: 15 }));
    els.push({ ...text(s, { size: 12, weight: active ? 700 : 400, color: active ? '#FFFFFF' : P.sub }), x: sx, y: 383 });
  });

  // DELIVERY SECTION
  els.push({ ...text('DELIVERY SCHEDULE', { size: 10, weight: 700, color: P.sub }), x: 20, y: 440 });
  els.push(line(20, 452, 356, 452, { stroke: P.border }));

  const schedSettings = [
    { label: 'Publish day', value: 'Thursday' },
    { label: 'Notify at', value: '8:30 AM' },
    { label: 'Episode length', value: '10–15 min' },
  ];
  schedSettings.forEach((s, i) => {
    const sy = 460 + i * 56;
    els.push(rect(16, sy, 343, 46, { fill: P.surface, radius: 10, stroke: P.border, strokeWidth: 1 }));
    els.push({ ...text(s.label, { size: 13, color: P.text }), x: 28, y: sy + 15 });
    els.push({ ...text(s.value, { size: 13, weight: 600, color: P.accent }), x: 300, y: sy + 15 });
    els.push({ ...text('›', { size: 18, color: P.sub }), x: 343, y: sy + 11 });
  });

  // AI FOCUS SECTION
  els.push({ ...text('AI FOCUS AREAS', { size: 10, weight: 700, color: P.sub }), x: 20, y: 636 });
  els.push(line(20, 648, 356, 648, { stroke: P.border }));
  els.push(rect(16, 656, 343, 60, { fill: P.surface, radius: 12, stroke: P.border, strokeWidth: 1 }));

  const focuses = ['Churn risk', 'Feature gaps', 'Friction', 'Wins'];
  let fx = 28;
  focuses.forEach((f, i) => {
    const fw = f.length * 7 + 16;
    els.push(rect(fx, 670, fw, 26, { fill: P.accent + '15', radius: 13, stroke: P.accent + '40', strokeWidth: 1 }));
    els.push({ ...text(f, { size: 12, color: P.accent, weight: 500 }), x: fx + 8, y: 677 });
    fx += fw + 8;
  });
  // + add button
  els.push(rect(fx, 670, 36, 26, { fill: P.muted, radius: 13, stroke: P.border, strokeWidth: 1 }));
  els.push({ ...text('+ add', { size: 11, color: P.sub }), x: fx + 4, y: 677 });

  // Bottom nav
  els.push(rect(0, 730, 375, 82, { fill: P.surface, stroke: P.border, strokeWidth: 1 }));
  const navItems = [
    { label: 'Briefing', icon: '◎', active: false },
    { label: 'Library', icon: '⊞', active: false },
    { label: 'Insights', icon: '◈', active: false },
    { label: 'Sources', icon: '⊕', active: false },
  ];
  navItems.forEach((n, i) => {
    const nx = 28 + i * 82;
    const col = P.sub;
    els.push({ ...text(n.icon, { size: 20, color: col }), x: nx, y: 742 });
    els.push({ ...text(n.label, { size: 10, weight: 400, color: col }), x: nx - 4, y: 766 });
  });

  return {
    id: 'voice',
    label: 'Voice & Delivery',
    width: 375,
    height: 812,
    background: P.bg,
    elements: els,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ASSEMBLE PEN FILE
// ═══════════════════════════════════════════════════════════════════════════════
const pen = {
  version: '2.8',
  meta: {
    name: 'MURMUR',
    tagline: 'Your product intelligence, spoken weekly',
    description: 'AI audio briefings that convert customer signals into a weekly personalized podcast. Inspired by Format Podcasts trend on darkmodedesign.com — the idea that product data should be listenable, not just readable.',
    author: 'RAM Design Heartbeat',
    created: new Date().toISOString(),
    archetype: 'audio-intelligence',
    theme: 'light',
    palette: {
      bg: P.bg,
      surface: P.surface,
      accent: P.accent,
      accent2: P.accent2,
      text: P.text,
      muted: P.muted,
    },
  },
  screens: [
    screen1(),
    screen2(),
    screen3(),
    screen4(),
    screen5(),
  ],
};

// Serialize elements properly
function cleanEl(el) {
  if (!el || typeof el !== 'object') return el;
  // Convert text elements to pen format
  if (el.type === 'text') {
    return {
      type: 'text',
      x: el.x || 0,
      y: el.y || 0,
      content: el.content || '',
      fontSize: el.size || 14,
      fontWeight: el.weight || 400,
      fill: el.color || '#000000',
      textAlign: el.align || 'left',
      fontStyle: el.italic ? 'italic' : 'normal',
      opacity: el.opacity || 1,
    };
  }
  if (el.type === 'rect') {
    return {
      type: 'rect',
      x: el.x || 0,
      y: el.y || 0,
      width: el.width || 0,
      height: el.height || 0,
      fill: el.fill || 'transparent',
      stroke: el.stroke || 'transparent',
      strokeWidth: el.strokeWidth || 0,
      rx: el.radius || 0,
      opacity: el.opacity !== undefined ? el.opacity : 1,
    };
  }
  if (el.type === 'ellipse') {
    return {
      type: 'ellipse',
      x: el.x || 0,
      y: el.y || 0,
      width: el.width || 0,
      height: el.height || 0,
      fill: el.fill || 'transparent',
      stroke: el.stroke || 'transparent',
      strokeWidth: el.strokeWidth || 0,
      opacity: el.opacity !== undefined ? el.opacity : 1,
    };
  }
  if (el.type === 'line') {
    return {
      type: 'line',
      x1: el.x1 || 0,
      y1: el.y1 || 0,
      x2: el.x2 || 0,
      y2: el.y2 || 0,
      stroke: el.stroke || '#000000',
      strokeWidth: el.strokeWidth || 1,
      opacity: el.opacity !== undefined ? el.opacity : 1,
    };
  }
  if (el.type === 'polygon') {
    return {
      type: 'polygon',
      points: el.points || [],
      fill: el.fill || 'transparent',
      stroke: el.stroke || 'transparent',
      strokeWidth: el.strokeWidth || 0,
      opacity: el.opacity !== undefined ? el.opacity : 1,
    };
  }
  return el;
}

pen.screens = pen.screens.map(scr => ({
  ...scr,
  elements: scr.elements.map(cleanEl).filter(Boolean),
}));

fs.writeFileSync('murmur.pen', JSON.stringify(pen, null, 2));
console.log('✓ murmur.pen written', JSON.stringify(pen).length, 'chars,', pen.screens.length, 'screens');
pen.screens.forEach(s => console.log(`  ${s.id}: ${s.elements.length} elements`));
