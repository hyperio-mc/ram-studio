'use strict';
// LOOP — AI-powered user behavior analytics
// Heartbeat #503 | Dark theme
// Inspired by: godly.website "Spaceship Instruction Manual" aesthetic (hairlines, monospace precision)
//              darkmodedesign.com zinc bento grids + glassmorphism
//              saaspo.com AI SaaS category dominance

const fs = require('fs');
const path = require('path');

const SLUG = 'loop';
const NAME = 'LOOP';
const TAGLINE = 'close the feedback loop';
const HB = 503;

// Palette — zinc-dark + orange + violet
const C = {
  bg:      '#09090B',
  surf:    '#111113',
  card:    '#19191F',
  card2:   '#1F1F27',
  border:  '#2A2A35',
  text:    '#F4F4F5',
  muted:   '#71717A',
  dim:     '#3F3F46',
  acc:     '#F97316', // orange — rising trend (godly research)
  acc2:    '#8B5CF6', // violet — tech differentiation
  acc3:    '#06B6D4', // cyan — data
  pos:     '#22C55E', // green — positive
  neg:     '#EF4444', // red — negative/alert
  white:   '#FFFFFF',
};

const W = 390;
const H = 844;
let elCount = 0;

// ─── Element primitives ───────────────────────────────────────────────────────

function rect(x, y, w, h, fill, opts = {}) {
  elCount++;
  const el = { type: 'rect', x, y, width: w, height: h, fill };
  if (opts.rx !== undefined) el.rx = opts.rx;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  if (opts.stroke) { el.stroke = opts.stroke; el.strokeWidth = opts.sw || 1; }
  return el;
}

function text(x, y, content, size, fill, opts = {}) {
  elCount++;
  const el = { type: 'text', x, y, content, fontSize: size, fill };
  if (opts.fw) el.fontWeight = opts.fw;
  if (opts.font) el.fontFamily = opts.font;
  if (opts.anchor) el.textAnchor = opts.anchor;
  if (opts.ls !== undefined) el.letterSpacing = opts.ls;
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  return el;
}

function circle(cx, cy, r, fill, opts = {}) {
  elCount++;
  const el = { type: 'circle', cx, cy, r, fill };
  if (opts.opacity !== undefined) el.opacity = opts.opacity;
  if (opts.stroke) { el.stroke = opts.stroke; el.strokeWidth = opts.sw || 1; }
  return el;
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  elCount++;
  return { type: 'line', x1, y1, x2, y2, stroke, strokeWidth: opts.sw || 1, opacity: opts.opacity || 1 };
}

function poly(points, fill, opts = {}) {
  elCount++;
  const el = { type: 'polygon', points, fill };
  if (opts.opacity) el.opacity = opts.opacity;
  if (opts.stroke) { el.stroke = opts.stroke; el.strokeWidth = opts.sw || 1; }
  return el;
}

// ─── Shared components ────────────────────────────────────────────────────────

function mkBg() {
  return [rect(0, 0, W, H, C.bg)];
}

// Status bar (monospace annotation style — "Spaceship Instruction Manual")
function mkStatusBar(screenLabel) {
  return [
    rect(0, 0, W, 48, C.surf),
    line(0, 48, W, 48, C.border, { sw: 0.5 }),
    // Logo mark — orange square dot
    rect(20, 17, 10, 10, C.acc, { rx: 2 }),
    text(36, 30, 'LOOP', 11, C.text, { fw: 700, font: 'monospace', ls: 3 }),
    // Screen label — dim monospace
    text(W - 20, 30, screenLabel.toUpperCase(), 9, C.muted, { fw: 400, font: 'monospace', anchor: 'end', ls: 1.5 }),
    // Hairline measurement tick
    line(W / 2, 44, W / 2, 48, C.dim, { sw: 0.5 }),
  ];
}

// Bottom nav
function mkNav(active) {
  const items = [
    { id: 0, label: 'OVERVIEW', icon: 'grid' },
    { id: 1, label: 'SESSIONS', icon: 'eye' },
    { id: 2, label: 'FUNNELS',  icon: 'filter' },
    { id: 3, label: 'INSIGHTS', icon: 'zap' },
    { id: 4, label: 'REPORTS',  icon: 'share' },
  ];
  const els = [
    rect(0, H - 80, W, 80, C.surf),
    line(0, H - 80, W, H - 80, C.border, { sw: 0.5 }),
  ];
  items.forEach((item, i) => {
    const x = 20 + i * 70;
    const isActive = i === active;
    const col = isActive ? C.acc : C.muted;
    // Icon placeholder — square with corners snipped for active
    els.push(rect(x + 12, H - 66, 22, 22, 'none', { rx: 4, stroke: col, sw: isActive ? 1.5 : 1 }));
    if (isActive) {
      els.push(rect(x + 17, H - 61, 12, 12, C.acc, { rx: 2, opacity: 0.7 }));
    }
    els.push(text(x + 23, H - 36, item.label, 7, col, { fw: isActive ? 600 : 400, font: 'monospace', anchor: 'middle', ls: 0.5 }));
    if (isActive) els.push(rect(x + 12, H - 80, 22, 2, C.acc, { rx: 1 }));
  });
  return els;
}

// Metric chip — monospace value + label
function mkMetric(x, y, w, h, value, label, sub, opts = {}) {
  const els = [
    rect(x, y, w, h, opts.fill || C.card, { rx: 8, stroke: C.border, sw: 0.5 }),
  ];
  // Monospace annotation in top-right corner
  if (opts.tag) {
    els.push(rect(x + w - 52, y + 8, 44, 16, opts.tagColor || C.acc + '22', { rx: 4 }));
    els.push(text(x + w - 30, y + 19, opts.tag, 8, opts.tagColor || C.acc, { fw: 500, font: 'monospace', anchor: 'middle', ls: 0.5 }));
  }
  els.push(text(x + 16, y + h - 36, value, opts.vsize || 26, C.text, { fw: 700 }));
  els.push(text(x + 16, y + h - 16, label, 10, C.muted, { fw: 400, font: 'monospace', ls: 0.5 }));
  if (sub) {
    const col = sub.startsWith('+') ? C.pos : sub.startsWith('-') ? C.neg : C.muted;
    els.push(text(x + 16, y + 28, sub, 10, col, { fw: 500, font: 'monospace' }));
  }
  return els;
}

// Mini sparkline
function mkSparkline(x, y, w, h, data, color) {
  const els = [];
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  // Area fill
  const pts = data.map((v, i) => `${x + i * step},${y + h - ((v - min) / range) * h}`);
  const areaPoints = pts.join(' ') + ` ${x + w},${y + h} ${x},${y + h}`;
  els.push(poly(areaPoints, color, { opacity: 0.15 }));
  // Line
  for (let i = 0; i < data.length - 1; i++) {
    const x1 = x + i * step;
    const y1_ = y + h - ((data[i] - min) / range) * h;
    const x2 = x + (i + 1) * step;
    const y2_ = y + h - ((data[i + 1] - min) / range) * h;
    els.push(line(x1, y1_, x2, y2_, color, { sw: 1.5 }));
  }
  // Dot on last
  const lastX = x + (data.length - 1) * step;
  const lastY = y + h - ((data[data.length - 1] - min) / range) * h;
  els.push(circle(lastX, lastY, 3, color));
  return els;
}

// Horizontal rule with label — "Spaceship" precision annotation
function mkRuler(x, y, w, label) {
  return [
    line(x, y, x + w, y, C.dim, { sw: 0.5 }),
    line(x, y - 3, x, y + 3, C.dim, { sw: 0.5 }),
    line(x + w, y - 3, x + w, y + 3, C.dim, { sw: 0.5 }),
    text(x + w / 2, y - 5, label, 7, C.dim, { font: 'monospace', anchor: 'middle', ls: 0.5 }),
  ];
}

// Progress bar
function mkBar(x, y, w, pct, color, bg) {
  return [
    rect(x, y, w, 4, bg || C.border, { rx: 2 }),
    rect(x, y, Math.round(w * pct / 100), 4, color, { rx: 2 }),
  ];
}

// ─── Screen 1: Overview (Bento Grid) ─────────────────────────────────────────

function screen1() {
  const els = [...mkBg(), ...mkStatusBar('// overview')];

  // Page heading
  els.push(text(20, 80, 'Dashboard', 22, C.text, { fw: 700 }));
  els.push(text(20, 98, 'Last 7 days  ·  All sources', 11, C.muted, { font: 'monospace' }));

  // Bento row 1: 2 wide metrics
  els.push(...mkMetric(20, 112, 164, 88, '24,891', 'TOTAL SESSIONS', '+12.4%', { tag: 'LIVE', tagColor: C.pos }));
  els.push(...mkMetric(196, 112, 174, 88, '68.3%', 'COMPLETION RATE', '-2.1%', { tag: 'FUNNEL' }));

  // Sparkline on first card
  els.push(...mkSparkline(28, 136, 110, 32, [45, 52, 48, 67, 71, 63, 78, 82, 79, 91], C.acc));

  // Bento row 2: wide chart card
  els.push(rect(20, 212, 350, 140, C.card, { rx: 8, stroke: C.border, sw: 0.5 }));
  els.push(text(36, 234, 'SESSION VOLUME', 9, C.muted, { fw: 500, font: 'monospace', ls: 1.5 }));
  els.push(text(36, 252, '24,891', 18, C.text, { fw: 700 }));
  els.push(text(90, 252, 'sessions this week', 10, C.muted, { fw: 400 }));

  // Chart bars
  const barData = [42, 58, 51, 77, 65, 83, 91];
  const days    = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const barW    = 30, barGap = 17, chartX = 30, chartY = 330, maxH = 72;
  barData.forEach((v, i) => {
    const bx = chartX + i * (barW + barGap);
    const bh = Math.round((v / 100) * maxH);
    const isLast = i === barData.length - 1;
    els.push(rect(bx, chartY - bh, barW, bh, isLast ? C.acc : C.card2, { rx: 4 }));
    if (isLast) els.push(rect(bx, chartY - bh, barW, bh, C.acc, { rx: 4, opacity: 0.85 }));
    els.push(text(bx + 15, chartY + 12, days[i], 9, i === barData.length - 1 ? C.acc : C.muted, { anchor: 'middle', font: 'monospace' }));
  });
  // Hairline y-axis annotations
  els.push(...mkRuler(20, 262, 8, ''));
  els.push(line(20, 262, 370, 262, C.border, { sw: 0.5, opacity: 0.5 }));
  els.push(text(20, 260, '100', 7, C.dim, { font: 'monospace', anchor: 'end' }));
  els.push(line(20, 296, 370, 296, C.border, { sw: 0.5, opacity: 0.5 }));
  els.push(text(20, 294, '50', 7, C.dim, { font: 'monospace', anchor: 'end' }));

  // Bento row 3: 2 metric cards
  els.push(...mkMetric(20, 364, 110, 80, '3m 42s', 'AVG DURATION', null, { fill: C.card2 }));
  els.push(...mkMetric(142, 364, 108, 80, '8.4%', 'RAGE CLICKS', '+1.2%', { fill: C.card2 }));
  els.push(...mkMetric(262, 364, 108, 80, '94', 'NPS SCORE', '+3', { fill: C.card2, tagColor: C.pos, tag: 'UP' }));

  // Section: Top Pages
  els.push(text(20, 462, 'TOP PAGES', 9, C.muted, { fw: 500, font: 'monospace', ls: 1.5 }));
  const pages = [
    { path: '/dashboard', sessions: 8241, pct: 100 },
    { path: '/settings',  sessions: 4102, pct: 50 },
    { path: '/reports',   sessions: 2880, pct: 35 },
    { path: '/onboard',   sessions: 1940, pct: 24 },
  ];
  pages.forEach((p, i) => {
    const py = 478 + i * 42;
    els.push(rect(20, py, 350, 36, C.card, { rx: 6, stroke: C.border, sw: 0.5 }));
    els.push(text(32, py + 22, p.path, 11, C.text, { fw: 400, font: 'monospace' }));
    els.push(text(W - 28, py + 14, p.sessions.toLocaleString(), 10, C.acc, { fw: 600, anchor: 'end', font: 'monospace' }));
    els.push(text(W - 28, py + 28, 'sessions', 8, C.muted, { anchor: 'end', font: 'monospace' }));
    els.push(...mkBar(32, py + 32, 180, p.pct, C.acc + 'AA', C.border));
  });

  els.push(...mkNav(0));
  return { name: 'Overview', elements: els };
}

// ─── Screen 2: Sessions ───────────────────────────────────────────────────────

function screen2() {
  const els = [...mkBg(), ...mkStatusBar('// sessions')];

  els.push(text(20, 80, 'Sessions', 22, C.text, { fw: 700 }));
  els.push(text(20, 98, 'Live replay + AI digest', 11, C.muted, { font: 'monospace' }));

  // Filter chips
  const chips = ['All', 'Rage Clicks', 'Dead Ends', 'Churned'];
  chips.forEach((c, i) => {
    const cx = 20 + i * 82;
    const isActive = i === 0;
    els.push(rect(cx, 112, 76, 26, isActive ? C.acc + '33' : C.card, { rx: 13, stroke: isActive ? C.acc : C.border, sw: isActive ? 1 : 0.5 }));
    els.push(text(cx + 38, 129, c, 10, isActive ? C.acc : C.muted, { anchor: 'middle', fw: isActive ? 600 : 400, font: 'monospace' }));
  });

  // Session cards
  const sessions = [
    { id: 'S-7821', user: 'user@acme.com', dur: '6m 14s', pages: 12, flags: ['rage-click', 'exit'], score: 42 },
    { id: 'S-7820', user: 'Anonymous',     dur: '1m 08s', pages: 3,  flags: ['dead-end'],              score: 78 },
    { id: 'S-7819', user: 'dev@loop.ai',   dur: '12m 33s',pages: 28, flags: [],                        score: 91 },
    { id: 'S-7818', user: 'hello@co.io',   dur: '3m 55s', pages: 7,  flags: ['rage-click'],            score: 61 },
    { id: 'S-7817', user: 'Anonymous',     dur: '0m 42s', pages: 2,  flags: ['bounced'],               score: 18 },
    { id: 'S-7816', user: 'cto@startup.vc',dur: '9m 22s', pages: 19, flags: [],                        score: 88 },
  ];

  sessions.forEach((s, i) => {
    const sy = 150 + i * 96;
    const scoreColor = s.score > 75 ? C.pos : s.score > 40 ? C.acc : C.neg;
    els.push(rect(20, sy, 350, 88, C.card, { rx: 8, stroke: C.border, sw: 0.5 }));
    // Score ring left
    els.push(circle(52, sy + 44, 22, 'none', { stroke: C.border, sw: 2 }));
    els.push(circle(52, sy + 44, 22, 'none', { stroke: scoreColor, sw: 2, opacity: 0.8 }));
    els.push(text(52, sy + 49, String(s.score), 12, scoreColor, { fw: 700, anchor: 'middle' }));
    // Session info
    els.push(text(84, sy + 22, s.id, 10, C.text, { fw: 600, font: 'monospace' }));
    els.push(text(84, sy + 38, s.user, 10, C.muted, { font: 'monospace' }));
    els.push(text(84, sy + 56, s.dur + '  ·  ' + s.pages + ' pages', 9, C.dim, { font: 'monospace' }));
    // Flags
    s.flags.forEach((f, fi) => {
      const fc = f === 'rage-click' ? C.neg : f === 'bounced' ? C.acc : C.muted;
      els.push(rect(84 + fi * 80, sy + 66, 74, 14, fc + '22', { rx: 7 }));
      els.push(text(84 + fi * 80 + 37, sy + 76, f, 7, fc, { anchor: 'middle', font: 'monospace' }));
    });
    // Play button
    els.push(circle(344, sy + 44, 16, C.acc + '22', { stroke: C.acc, sw: 1 }));
    els.push(poly(
      `${338},${sy + 38} ${352},${sy + 44} ${338},${sy + 50}`,
      C.acc
    ));
  });

  els.push(...mkNav(1));
  return { name: 'Sessions', elements: els };
}

// ─── Screen 3: Funnels ────────────────────────────────────────────────────────

function screen3() {
  const els = [...mkBg(), ...mkStatusBar('// funnels')];

  els.push(text(20, 80, 'Funnels', 22, C.text, { fw: 700 }));
  els.push(text(20, 98, 'Conversion analysis  ·  AI drop-off tags', 11, C.muted, { font: 'monospace' }));

  // Funnel name + stats
  els.push(rect(20, 116, 350, 48, C.card, { rx: 8, stroke: C.border, sw: 0.5 }));
  els.push(text(36, 136, 'Signup → Activation', 13, C.text, { fw: 600 }));
  els.push(text(36, 152, '68.3% overall  ·  1,824 entered', 9, C.muted, { font: 'monospace' }));
  els.push(rect(W - 60, 128, 44, 24, C.acc + '22', { rx: 12 }));
  els.push(text(W - 38, 144, 'EDIT', 8, C.acc, { anchor: 'middle', font: 'monospace', fw: 600 }));

  // Funnel steps
  const steps = [
    { name: 'Visit signup page',   n: 1824, pct: 100, drop: 0    },
    { name: 'Enter email',         n: 1521, pct: 83,  drop: 16.6 },
    { name: 'Verify email',        n: 1102, pct: 60,  drop: 27.5 },
    { name: 'Complete profile',    n: 876,  pct: 48,  drop: 20.5 },
    { name: 'First action',        n: 612,  pct: 34,  drop: 30.1 },
    { name: 'Activate feature',    n: 489,  pct: 27,  drop: 20.1 },
  ];

  const funnelX = 24;
  const funnelY = 178;
  const maxW = 310;

  steps.forEach((step, i) => {
    const sy = funnelY + i * 92;
    const barW = Math.round((step.pct / 100) * maxW);
    const isWorst = step.drop > 25;

    // Bar
    els.push(rect(funnelX, sy, maxW, 44, C.card2, { rx: 6 }));
    els.push(rect(funnelX, sy, barW, 44, isWorst ? C.neg + '33' : C.acc + '22', { rx: 6 }));
    els.push(rect(funnelX, sy, barW, 44, 'none', { rx: 6, stroke: isWorst ? C.neg : C.acc, sw: 1 }));

    // Step info
    els.push(text(funnelX + 12, sy + 17, `${i + 1}. ${step.name}`, 11, C.text, { fw: 500 }));
    els.push(text(funnelX + 12, sy + 33, `${step.n.toLocaleString()} users  ·  ${step.pct}%`, 9, C.muted, { font: 'monospace' }));

    // Drop indicator
    if (i > 0 && step.drop > 0) {
      const col = step.drop > 25 ? C.neg : C.muted;
      els.push(text(funnelX + maxW + 8, sy + 24, `-${step.drop.toFixed(0)}%`, 10, col, { fw: 600, font: 'monospace' }));
    }

    // Connector arrow
    if (i < steps.length - 1) {
      els.push(line(funnelX + 20, sy + 44, funnelX + 20, sy + 92, C.dim, { sw: 1, opacity: 0.5 }));
      // Arrow head
      els.push(poly(`${funnelX + 15},${sy + 86} ${funnelX + 25},${sy + 86} ${funnelX + 20},${sy + 92}`, C.dim, { opacity: 0.5 }));
    }

    // AI tag on worst drop
    if (isWorst) {
      els.push(rect(funnelX + maxW - 80, sy + 6, 78, 16, C.acc2 + '33', { rx: 8 }));
      els.push(text(funnelX + maxW - 41, sy + 17, '⚡ AI INSIGHT', 7, C.acc2, { anchor: 'middle', font: 'monospace' }));
    }
  });

  els.push(...mkNav(2));
  return { name: 'Funnels', elements: els };
}

// ─── Screen 4: AI Insights ────────────────────────────────────────────────────

function screen4() {
  const els = [...mkBg(), ...mkStatusBar('// insights')];

  els.push(text(20, 80, 'AI Insights', 22, C.text, { fw: 700 }));
  els.push(text(20, 98, 'Synthesized from 24,891 sessions', 11, C.muted, { font: 'monospace' }));

  // Insight cards
  const insights = [
    {
      type: 'CRITICAL',
      icon: '⚠',
      color: C.neg,
      title: 'Email verify step losing 28% of users',
      body: 'Users drop between email entry and verification. AI detected 3x higher rage-click rate on the resend button. Suggest: reduce verification wait time or offer phone auth.',
      impact: 'HIGH',
      affected: 419,
    },
    {
      type: 'OPPORTUNITY',
      icon: '◈',
      color: C.acc,
      title: 'Power users reach "Activate" 4× faster',
      body: 'Users who complete profile in <90s have 4× better retention at 30 days. Consider pre-filling profile data from OAuth providers to accelerate this step.',
      impact: 'MED',
      affected: 612,
    },
    {
      type: 'PATTERN',
      icon: '◎',
      color: C.acc2,
      title: 'Mobile rage-clicks on nav hamburger',
      body: '8.4% of mobile sessions include rage-clicks on the top-left menu icon. Menu may be opening too slowly or gesture target is too small on smaller devices.',
      impact: 'MED',
      affected: 2093,
    },
    {
      type: 'TREND',
      icon: '↗',
      color: C.pos,
      title: 'Sunday traffic shows highest NPS',
      body: 'Sessions starting on Sundays score NPS 94 vs 81 weekday average. Sunday cohort is likely a power-user / developer segment exploring at their own pace.',
      impact: 'LOW',
      affected: 1204,
    },
  ];

  insights.forEach((ins, i) => {
    const iy = 116 + i * 154;
    els.push(rect(20, iy, 350, 146, C.card, { rx: 8, stroke: ins.color + '55', sw: 1 }));
    // Left accent bar
    els.push(rect(20, iy, 3, 146, ins.color, { rx: 2 }));
    // Type badge
    els.push(rect(32, iy + 12, 70, 18, ins.color + '22', { rx: 9 }));
    els.push(text(67, iy + 24, `${ins.icon} ${ins.type}`, 8, ins.color, { anchor: 'middle', font: 'monospace', fw: 600 }));
    // Impact + affected
    els.push(text(W - 28, iy + 24, `${ins.impact} IMPACT`, 8, ins.color, { anchor: 'end', font: 'monospace' }));
    // Title
    els.push(text(32, iy + 48, ins.title, 12, C.text, { fw: 600 }));
    // Body — wrap manually in 2 lines
    const words = ins.body.split(' ');
    let line1 = '', line2 = '', line3 = '';
    let cur = 0;
    for (const w of words) {
      if (cur === 0 && (line1 + w).length < 52) line1 += w + ' ';
      else if (cur === 0) { cur = 1; line2 += w + ' '; }
      else if (cur === 1 && (line2 + w).length < 52) line2 += w + ' ';
      else if (cur === 1) { cur = 2; line3 += w + ' '; }
      else line3 += w + ' ';
    }
    els.push(text(32, iy + 66, line1.trim(), 10, C.muted, {}));
    els.push(text(32, iy + 81, line2.trim(), 10, C.muted, {}));
    if (line3.trim()) els.push(text(32, iy + 96, line3.trim(), 10, C.muted, {}));
    // Users affected
    els.push(text(32, iy + 118, `${ins.affected.toLocaleString()} users affected`, 9, C.dim, { font: 'monospace' }));
    // CTA
    els.push(rect(W - 110, iy + 108, 88, 26, ins.color + '22', { rx: 13, stroke: ins.color + '55', sw: 1 }));
    els.push(text(W - 66, iy + 124, 'View sessions →', 9, ins.color, { anchor: 'middle', font: 'monospace' }));
  });

  els.push(...mkNav(3));
  return { name: 'Insights', elements: els };
}

// ─── Screen 5: Reports ────────────────────────────────────────────────────────

function screen5() {
  const els = [...mkBg(), ...mkStatusBar('// reports')];

  els.push(text(20, 80, 'Reports', 22, C.text, { fw: 700 }));
  els.push(text(20, 98, 'Share · Schedule · Export', 11, C.muted, { font: 'monospace' }));

  // Quick stats row
  const qstats = [
    { v: '6', l: 'ACTIVE' },
    { v: '12', l: 'SHARED' },
    { v: '3', l: 'SCHEDULED' },
  ];
  qstats.forEach((q, i) => {
    const qx = 20 + i * 118;
    els.push(rect(qx, 116, 112, 56, C.card, { rx: 8, stroke: C.border, sw: 0.5 }));
    els.push(text(qx + 56, q.l === 'ACTIVE' ? 144 : 146, q.v, 22, C.text, { fw: 700, anchor: 'middle' }));
    els.push(text(qx + 56, 160, q.l, 8, C.muted, { anchor: 'middle', font: 'monospace', ls: 1 }));
  });

  // Report list
  const reports = [
    { name: 'Weekly Funnel Summary',     freq: 'Weekly · Mon 09:00',  recipients: 4,  status: 'sent',    color: C.pos  },
    { name: 'AI Insights Digest',        freq: 'Daily · 08:00',       recipients: 8,  status: 'pending', color: C.acc  },
    { name: 'Rage Click Alert',          freq: 'Realtime trigger',     recipients: 2,  status: 'active',  color: C.neg  },
    { name: 'Quarterly Deep Dive',       freq: 'Manual · Last: Apr 1',recipients: 12, status: 'draft',   color: C.muted},
    { name: 'Cohort Retention Analysis', freq: 'Monthly · 1st',       recipients: 6,  status: 'sent',    color: C.pos  },
  ];

  els.push(text(20, 186, 'ALL REPORTS', 9, C.muted, { fw: 500, font: 'monospace', ls: 1.5 }));

  reports.forEach((r, i) => {
    const ry = 202 + i * 94;
    els.push(rect(20, ry, 350, 86, C.card, { rx: 8, stroke: C.border, sw: 0.5 }));
    // Status dot
    els.push(circle(38, ry + 22, 5, r.color));
    els.push(text(52, ry + 27, r.name, 12, C.text, { fw: 600 }));
    els.push(text(52, ry + 44, r.freq, 9, C.muted, { font: 'monospace' }));
    // Recipients
    els.push(text(52, ry + 60, `${r.recipients} recipient${r.recipients > 1 ? 's' : ''}`, 9, C.dim, { font: 'monospace' }));
    // Status badge
    const sLabel = r.status.toUpperCase();
    els.push(rect(W - 78, ry + 12, 60, 20, r.color + '22', { rx: 10 }));
    els.push(text(W - 48, ry + 26, sLabel, 8, r.color, { anchor: 'middle', font: 'monospace', fw: 600 }));
    // Share icon area
    els.push(text(W - 28, ry + 60, '↑ share', 9, C.muted, { anchor: 'end', font: 'monospace' }));
  });

  els.push(...mkNav(4));
  return { name: 'Reports', elements: els };
}

// ─── Screen 6: Session Detail ────────────────────────────────────────────────

function screen6() {
  const els = [...mkBg(), ...mkStatusBar('// S-7821 · detail')];

  // Back nav
  els.push(text(20, 75, '← SESSIONS', 9, C.muted, { font: 'monospace', ls: 0.5 }));
  els.push(text(20, 92, 'Session S-7821', 20, C.text, { fw: 700 }));
  els.push(text(20, 110, 'user@acme.com  ·  6m 14s  ·  12 pages', 10, C.muted, { font: 'monospace' }));

  // Score + flags
  els.push(rect(20, 124, 350, 60, C.card, { rx: 8, stroke: C.border, sw: 0.5 }));
  els.push(text(36, 148, 'HEALTH SCORE', 8, C.muted, { font: 'monospace', ls: 1 }));
  els.push(text(36, 168, '42', 22, C.neg, { fw: 700, font: 'monospace' }));
  els.push(text(72, 168, '/ 100', 12, C.dim, { font: 'monospace' }));
  // Flag pills
  const flags = ['rage-click ×3', 'dead-end ×1', 'exit intent'];
  flags.forEach((f, i) => {
    const col = f.includes('rage') ? C.neg : f.includes('exit') ? C.acc : C.muted;
    els.push(rect(200 + i * 0, 134, 72 + i * 0, 16, col + '22', { rx: 8 }));
    const flagXs = [205, 282, 205];
    const flagYs = [134, 134, 158];
    const flagWs = [70, 64, 72];
    els.push(rect(flagXs[i], flagYs[i], flagWs[i], 16, col + '22', { rx: 8 }));
    els.push(text(flagXs[i] + flagWs[i] / 2, flagYs[i] + 11, f, 7, col, { anchor: 'middle', font: 'monospace' }));
  });

  // Timeline — "Spaceship" hairline track
  els.push(text(20, 204, 'SESSION TIMELINE', 9, C.muted, { fw: 500, font: 'monospace', ls: 1.5 }));
  els.push(line(36, 218, 36, 560, C.border, { sw: 1 }));

  const events = [
    { t: '0:00', label: 'Landed on /signup',       type: 'page',    color: C.muted },
    { t: '0:22', label: 'Typed in email field',     type: 'action',  color: C.acc3  },
    { t: '0:45', label: 'Clicked "Continue" ×1',   type: 'click',   color: C.acc   },
    { t: '1:02', label: '⚠ Rage-clicked resend ×3', type: 'rage',    color: C.neg   },
    { t: '2:18', label: 'Navigated to /help',       type: 'page',    color: C.muted },
    { t: '3:44', label: 'Dead-end: no results',     type: 'dead',    color: C.acc   },
    { t: '4:55', label: 'Returned to /signup',      type: 'page',    color: C.muted },
    { t: '5:30', label: 'Rage-clicked nav icon ×1', type: 'rage',    color: C.neg   },
    { t: '6:14', label: 'Session ended (exit)',      type: 'exit',    color: C.dim   },
  ];

  events.forEach((ev, i) => {
    const ey = 218 + i * 38;
    // Node on timeline
    els.push(circle(36, ey, 5, ev.color));
    // Hairline from node
    els.push(line(36, ey, 56, ey, C.border, { sw: 0.5 }));
    // Time
    els.push(text(62, ey + 4, ev.t, 9, C.dim, { font: 'monospace' }));
    els.push(text(100, ey + 4, ev.label, 11, ev.type === 'rage' ? C.neg : ev.type === 'dead' ? C.acc : C.text, { fw: ev.type === 'rage' ? 600 : 400 }));
  });

  // AI summary panel
  els.push(rect(20, 570, 350, 76, C.acc2 + '15', { rx: 8, stroke: C.acc2 + '55', sw: 1 }));
  els.push(text(36, 590, '⚡ AI SUMMARY', 9, C.acc2, { fw: 600, font: 'monospace', ls: 1 }));
  els.push(text(36, 608, 'User likely confused by email verify step.', 11, C.text, {}));
  els.push(text(36, 623, 'Recommend: shorter re-send wait + clearer CTA.', 11, C.muted, {}));
  els.push(text(36, 638, 'Similar pattern in 418 other sessions this week.', 10, C.dim, { font: 'monospace' }));

  els.push(...mkNav(1));
  return { name: 'Session Detail', elements: els };
}

// ─── Assemble & write ─────────────────────────────────────────────────────────

const screens = [screen1(), screen2(), screen3(), screen4(), screen5(), screen6()];

const pen = {
  version: '2.8',
  metadata: {
    name:       NAME,
    tagline:    TAGLINE,
    author:     'RAM',
    date:       new Date().toISOString().split('T')[0],
    theme:      'dark',
    heartbeat:  HB,
    elements:   elCount,
    palette: {
      bg: C.bg, surface: C.surf, card: C.card,
      accent: C.acc, accent2: C.acc2, text: C.text,
    },
  },
  screens: screens.map(s => ({
    name:     s.name,
    width:    W,
    height:   H,
    elements: s.elements,
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${elCount} elements`);
console.log(`Written: ${SLUG}.pen`);
