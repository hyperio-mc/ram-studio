'use strict';
const fs   = require('fs');
const path = require('path');

const SLUG    = 'kira';
const NAME    = 'KIRA';
const TAGLINE = 'creator intelligence, amplified';
const DATE    = '2026-04-09';
const HB      = 18;

// ── Palette ─────────────────────────────────────────────────────────────────
const P = {
  bg:     '#0C1120',   // deep navy void
  surf:   '#111827',   // slightly raised surface
  card:   '#1A2035',   // card bg
  card2:  '#1E2845',   // elevated card
  acc:    '#3A82FF',   // electric blue
  acc2:   '#A855F7',   // purple accent
  acc3:   '#10B981',   // emerald green (positive)
  red:    '#F43F5E',   // alert/negative
  text:   '#F8FAFC',   // primary text
  sub:    '#94A3B8',   // secondary text
  muted:  'rgba(148,163,184,0.35)',
  border: 'rgba(58,130,255,0.18)',
  glow:   'rgba(58,130,255,0.12)',
};

// ── Primitives ───────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, width: w, height: h, fill,
    rx: opts.rx ?? 0,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none',
    strokeWidth: opts.sw ?? 0,
  };
}
function text(x, y, content, size, fill, opts = {}) {
  return {
    type: 'text', x, y, content: String(content), fontSize: size, fill,
    fontWeight: opts.fw ?? 400,
    fontFamily: opts.font ?? 'Inter, sans-serif',
    textAnchor: opts.anchor ?? 'start',
    letterSpacing: opts.ls ?? 0,
    opacity: opts.opacity ?? 1,
  };
}
function circle(cx, cy, r, fill, opts = {}) {
  return {
    type: 'circle', cx, cy, r, fill,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none',
    strokeWidth: opts.sw ?? 0,
  };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return {
    type: 'line', x1, y1, x2, y2, stroke,
    strokeWidth: opts.sw ?? 1,
    opacity: opts.opacity ?? 1,
  };
}

const W = 390, H = 844;
let totalElements = 0;
const screens = [];

// ── Helper: Status bar ───────────────────────────────────────────────────────
function statusBar(els) {
  els.push(rect(0, 0, W, 44, P.bg));
  els.push(text(16, 28, '9:41', 13, P.text, { fw: 600 }));
  els.push(text(345, 28, '●●●', 11, P.text, { opacity: 0.7 }));
  return 4;
}

// ── Helper: Nav bar ──────────────────────────────────────────────────────────
function navBar(els, active) {
  const tabs = [
    { label: 'Home',    icon: '⌂',  id: 0 },
    { label: 'Content', icon: '▶',  id: 1 },
    { label: 'Audience',icon: '◎',  id: 2 },
    { label: 'Revenue', icon: '$',  id: 3 },
    { label: 'Insights',icon: '✦',  id: 4 },
  ];
  const navY = H - 72;
  els.push(rect(0, navY, W, 72, P.surf));
  els.push(line(0, navY, W, navY, P.border, { sw: 1, opacity: 0.6 }));
  let c = 2;
  tabs.forEach((t, i) => {
    const x = 39 + i * 78;
    const isActive = i === active;
    const col = isActive ? P.acc : P.sub;
    if (isActive) {
      els.push(rect(x - 22, navY + 6, 44, 4, P.acc, { rx: 2 }));
      c++;
    }
    els.push(text(x, navY + 26, t.icon, 18, col, { anchor: 'middle', fw: isActive ? 700 : 400 }));
    els.push(text(x, navY + 46, t.label, 10, col, { anchor: 'middle', fw: isActive ? 600 : 400 }));
    c += 2;
  });
  return c;
}

// ── Helper: Ambient glow blob ────────────────────────────────────────────────
function ambientGlow(els, cx, cy, r, color) {
  // Simulate radial gradient glow with layered circles
  els.push(circle(cx, cy, r, color, { opacity: 0.07 }));
  els.push(circle(cx, cy, r * 0.6, color, { opacity: 0.08 }));
  els.push(circle(cx, cy, r * 0.3, color, { opacity: 0.10 }));
  return 3;
}

// ── Helper: Glassmorphism card ───────────────────────────────────────────────
function glassCard(els, x, y, w, h, opts = {}) {
  els.push(rect(x, y, w, h, opts.fill ?? P.card, { rx: opts.rx ?? 14, stroke: P.border, sw: 1 }));
  // top-edge highlight
  els.push(rect(x + 1, y + 1, w - 2, 1, 'rgba(255,255,255,0.08)', { rx: 14 }));
  return 2;
}

// ── Helper: Mini sparkline ───────────────────────────────────────────────────
function sparkline(els, x, y, w, h, data, color) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = w / (data.length - 1);
  let c = 0;
  for (let i = 0; i < data.length - 1; i++) {
    const x1 = x + i * stepX;
    const y1 = y + h - ((data[i] - min) / range) * h;
    const x2 = x + (i + 1) * stepX;
    const y2 = y + h - ((data[i + 1] - min) / range) * h;
    els.push(line(x1, y1, x2, y2, color, { sw: 2, opacity: 0.85 }));
    c++;
  }
  // dot at end
  const lx = x + (data.length - 1) * stepX;
  const ly = y + h - ((data[data.length - 1] - min) / range) * h;
  els.push(circle(lx, ly, 3, color));
  return c + 1;
}

// ── Helper: Progress bar ─────────────────────────────────────────────────────
function progressBar(els, x, y, w, pct, color) {
  els.push(rect(x, y, w, 4, 'rgba(255,255,255,0.08)', { rx: 2 }));
  els.push(rect(x, y, Math.max(4, w * pct / 100), 4, color, { rx: 2 }));
  return 2;
}

// ── Helper: Avatar ───────────────────────────────────────────────────────────
function avatar(els, cx, cy, r, initials) {
  els.push(circle(cx, cy, r, P.acc2, { opacity: 0.85 }));
  els.push(text(cx, cy + 5, initials, r * 0.7, P.text, { anchor: 'middle', fw: 700 }));
  return 2;
}

// ────────────────────────────────────────────────────────────────────────────
// SCREEN 1 — Dashboard
// ────────────────────────────────────────────────────────────────────────────
(function buildDashboard() {
  const els = [];
  let ec = 0;

  // BG + ambient glows
  els.push(rect(0, 0, W, H, P.bg));
  ec += ambientGlow(els, 300, 160, 140, P.acc);
  ec += ambientGlow(els, 80,  580, 100, P.acc2);
  ec++;

  ec += statusBar(els);

  // Header
  ec += avatar(els, 32, 70, 18, 'MK');
  els.push(text(58, 63, 'Good morning,', 11, P.sub));
  els.push(text(58, 78, 'Maya Kim', 15, P.text, { fw: 700 }));
  // notification bell
  els.push(circle(358, 68, 18, P.card, { stroke: P.border, sw: 1 }));
  els.push(text(358, 74, '🔔', 14, P.text, { anchor: 'middle' }));
  els.push(circle(370, 56, 6, P.red));
  ec += 5;

  // Period selector
  ['7D', '30D', '90D', '1Y'].forEach((lbl, i) => {
    const sel = i === 1;
    els.push(rect(16 + i * 72, 102, 62, 26, sel ? P.acc : 'transparent', { rx: 8, stroke: sel ? 'none' : P.border, sw: sel ? 0 : 1 }));
    els.push(text(47 + i * 72, 119, lbl, 12, sel ? P.text : P.sub, { anchor: 'middle', fw: sel ? 700 : 400 }));
    ec += 2;
  });

  // ── Hero stat card (wide) ────────────────────────────────────────────────
  ec += glassCard(els, 16, 142, W - 32, 110, { rx: 16 });
  els.push(text(28, 163, 'Total Views', 11, P.sub));
  els.push(text(28, 193, '4.28M', 36, P.text, { fw: 800 }));
  els.push(text(28, 215, '↑ 23.4%  vs last period', 11, P.acc3));
  // sparkline on right
  const viewData = [120, 145, 130, 170, 195, 185, 220, 240, 215, 280, 265, 310];
  ec += sparkline(els, 230, 158, 130, 50, viewData, P.acc);
  ec += 3;

  // ── 2-col bento grid ────────────────────────────────────────────────────
  const cards = [
    { label: 'Subscribers',  val: '284K',  chg: '+1.2K',  pct: 72, color: P.acc2 },
    { label: 'Watch Time',   val: '1.9M h',chg: '+18.3%', pct: 61, color: P.acc  },
    { label: 'Revenue',      val: '$12,480',chg: '+$892',  pct: 84, color: P.acc3 },
    { label: 'Engagement',   val: '8.7%',  chg: '+0.4%',  pct: 55, color: '#F59E0B' },
  ];
  cards.forEach((c, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = 16 + col * 187;
    const cy = 268 + row * 110;
    ec += glassCard(els, cx, cy, 179, 100, { rx: 14 });
    els.push(text(cx + 14, cy + 20, c.label, 10, P.sub));
    els.push(text(cx + 14, cy + 46, c.val, 18, P.text, { fw: 800 }));
    els.push(text(cx + 14, cy + 64, c.chg, 11, P.acc3));
    ec += progressBar(els, cx + 14, cy + 80, 151, c.pct, c.color);
    ec += 3;
  });

  // ── Trending content row ─────────────────────────────────────────────────
  els.push(text(16, 508, 'Trending Now', 13, P.text, { fw: 700 }));
  els.push(text(W - 16, 508, 'See all →', 11, P.acc, { anchor: 'end' }));
  ec += 2;

  const trending = [
    { title: 'How I built a $10K side hustle',  views: '142K', badge: '🔥' },
    { title: 'Creator toolkit 2026: must-have',  views: '89K',  badge: '📈' },
  ];
  trending.forEach((t, i) => {
    const ty = 526 + i * 68;
    ec += glassCard(els, 16, ty, W - 32, 58, { rx: 12 });
    // thumbnail
    els.push(rect(28, ty + 8, 42, 40, P.acc2, { rx: 8, opacity: 0.35 }));
    els.push(text(49, ty + 32, t.badge, 16, P.text, { anchor: 'middle' }));
    // info
    els.push(text(82, ty + 24, t.title, 12, P.text, { fw: 600 }));
    els.push(text(82, ty + 42, t.views + ' views', 11, P.sub));
    // acc
    els.push(text(W - 28, ty + 35, '▶', 16, P.acc, { anchor: 'end' }));
    ec += 5;
  });

  ec += navBar(els, 0);

  totalElements += els.length;
  screens.push({ name: 'Dashboard', svg: '', elements: els });
})();

// ────────────────────────────────────────────────────────────────────────────
// SCREEN 2 — Content Performance
// ────────────────────────────────────────────────────────────────────────────
(function buildContent() {
  const els = [];
  let ec = 0;

  els.push(rect(0, 0, W, H, P.bg));
  ec += ambientGlow(els, 350, 200, 120, P.acc2);
  ec++;

  ec += statusBar(els);

  // Header
  els.push(text(16, 72, 'Content', 22, P.text, { fw: 800 }));
  els.push(text(16, 94, 'Performance', 22, P.acc, { fw: 800 }));
  ec += 2;

  // Filter chips
  const chips = ['All', 'Video', 'Short', 'Live', 'Podcast'];
  chips.forEach((c, i) => {
    const sel = i === 0;
    const chipW = [36, 54, 54, 38, 68][i];
    const chipX = [16, 62, 126, 190, 238][i];
    els.push(rect(chipX, 108, chipW, 26, sel ? P.acc : P.card, { rx: 13, stroke: sel ? 'none' : P.border, sw: 1 }));
    els.push(text(chipX + chipW / 2, 124, c, 11, sel ? P.text : P.sub, { anchor: 'middle', fw: sel ? 700 : 400 }));
    ec += 2;
  });

  // Stats row
  [
    { label: 'Total Posts', val: '247' },
    { label: 'Avg Views',   val: '17.3K' },
    { label: 'Top CTR',     val: '12.8%' },
  ].forEach((s, i) => {
    const sx = 16 + i * 122;
    ec += glassCard(els, sx, 148, 114, 60, { rx: 12 });
    els.push(text(sx + 57, 171, s.val, 16, P.text, { fw: 800, anchor: 'middle' }));
    els.push(text(sx + 57, 188, s.label, 9, P.sub, { anchor: 'middle' }));
    ec += 2;
  });

  // Content list
  const posts = [
    { title: 'How I built a $10K side hustle', type: 'Video',   views: '142K', ctr: '14.2%', dur: '18:24', trend: P.acc3 },
    { title: 'Creator toolkit 2026',           type: 'Video',   views: '89K',  ctr: '11.8%', dur: '12:07', trend: P.acc3 },
    { title: 'Morning productivity routine',   type: 'Short',   views: '67K',  ctr: '9.4%',  dur: '0:58',  trend: P.red },
    { title: 'Live Q&A — growth hacks',        type: 'Live',    views: '31K',  ctr: '6.1%',  dur: '1:14:00',trend: P.acc3 },
    { title: 'My 2026 content strategy',       type: 'Podcast', views: '24K',  ctr: '7.3%',  dur: '41:30', trend: P.acc3 },
    { title: 'Behind the scenes: studio tour', type: 'Short',   views: '18K',  ctr: '5.9%',  dur: '0:42',  trend: P.red },
  ];

  els.push(text(16, 234, 'Recent Posts', 12, P.sub, { fw: 600 }));
  els.push(text(220, 234, 'Views', 10, P.sub, { anchor: 'middle' }));
  els.push(text(310, 234, 'CTR', 10, P.sub, { anchor: 'middle' }));
  ec += 3;

  posts.forEach((p, i) => {
    const py = 248 + i * 75;
    ec += glassCard(els, 16, py, W - 32, 66, { rx: 12 });
    // thumb
    const typeColor = p.type === 'Video' ? P.acc : p.type === 'Short' ? P.acc2 : p.type === 'Live' ? P.red : '#F59E0B';
    els.push(rect(28, py + 8, 46, 50, typeColor, { rx: 8, opacity: 0.25 }));
    els.push(text(51, py + 35, p.type === 'Short' ? '⚡' : p.type === 'Live' ? '🔴' : p.type === 'Podcast' ? '🎙' : '▶', 16, typeColor, { anchor: 'middle' }));
    els.push(text(51, py + 53, p.dur, 8, P.sub, { anchor: 'middle' }));
    // title
    const titleWidth = 130;
    const truncTitle = p.title.length > 28 ? p.title.slice(0, 27) + '…' : p.title;
    els.push(text(82, py + 26, truncTitle, 12, P.text, { fw: 600 }));
    els.push(rect(82, py + 36, titleWidth, 1, P.border, { opacity: 0.4 }));
    // type badge
    els.push(rect(82, py + 44, 38, 14, typeColor, { rx: 4, opacity: 0.2 }));
    els.push(text(101, py + 54, p.type, 8, typeColor, { anchor: 'middle' }));
    // metrics
    els.push(text(220, py + 36, p.views, 13, P.text, { fw: 700, anchor: 'middle' }));
    els.push(text(310, py + 36, p.ctr, 13, p.trend === P.acc3 ? P.acc3 : P.red, { fw: 700, anchor: 'middle' }));
    ec += 9;
  });

  ec += navBar(els, 1);

  totalElements += els.length;
  screens.push({ name: 'Content', svg: '', elements: els });
})();

// ────────────────────────────────────────────────────────────────────────────
// SCREEN 3 — Audience
// ────────────────────────────────────────────────────────────────────────────
(function buildAudience() {
  const els = [];

  els.push(rect(0, 0, W, H, P.bg));
  ambientGlow(els, 200, 300, 200, P.acc);
  ambientGlow(els, 50,  600, 100, P.acc2);

  statusBar(els);

  els.push(text(16, 72, 'Audience', 22, P.text, { fw: 800 }));
  els.push(text(16, 94, '284,127 subscribers', 12, P.acc, { fw: 600 }));

  // Growth chart area
  glassCard(els, 16, 112, W - 32, 160, { rx: 16 });
  els.push(text(28, 133, 'Subscriber Growth', 11, P.sub));
  els.push(text(28, 152, '+1,247 this month', 13, P.acc3, { fw: 700 }));
  // Chart grid lines
  [0, 40, 80].forEach(offset => {
    els.push(line(28, 173 + offset, W - 28, 173 + offset, P.border, { sw: 1 }));
  });
  // Chart bars
  const growthData = [820, 1050, 940, 1180, 1340, 1120, 1480, 1247];
  const maxG = Math.max(...growthData);
  const barW = 28;
  const chartH = 72;
  growthData.forEach((val, i) => {
    const bx = 36 + i * 40;
    const bh = (val / maxG) * chartH;
    const by = 252 - bh;
    const isLast = i === growthData.length - 1;
    els.push(rect(bx, by, barW, bh, isLast ? P.acc : P.acc, { rx: 4, opacity: isLast ? 1 : 0.4 }));
  });
  // Month labels
  const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  months.forEach((m, i) => {
    els.push(text(50 + i * 40, 268, m, 8, P.sub, { anchor: 'middle' }));
  });

  // Demographics section
  els.push(text(16, 294, 'Demographics', 13, P.text, { fw: 700 }));

  // Age donut (simulated with arcs/circles)
  const demoX = 195, demoY = 380, demoR = 56;
  els.push(circle(demoX, demoY, demoR, P.card, { stroke: P.acc, sw: 12, opacity: 0.9 }));
  els.push(circle(demoX, demoY, demoR, 'transparent', { stroke: P.acc2, sw: 12, opacity: 0.55 }));
  els.push(circle(demoX, demoY, demoR, 'transparent', { stroke: P.acc3, sw: 12, opacity: 0.3 }));
  els.push(text(demoX, demoY - 8, '18-34', 12, P.text, { anchor: 'middle', fw: 700 }));
  els.push(text(demoX, demoY + 8, '62%', 15, P.acc, { anchor: 'middle', fw: 800 }));

  // Legend
  const ageGroups = [
    { label: '18–24', pct: '31%', color: P.acc3 },
    { label: '25–34', pct: '31%', color: P.acc },
    { label: '35–44', pct: '22%', color: P.acc2 },
    { label: '45+',   pct: '16%', color: '#F59E0B' },
  ];
  ageGroups.forEach((ag, i) => {
    const ly = 322 + i * 30;
    els.push(circle(24, ly + 5, 6, ag.color));
    els.push(text(36, ly + 10, ag.label, 11, P.text));
    els.push(text(95, ly + 10, ag.pct, 11, P.sub));
    progressBar(els, 16, ly + 20, 155, parseInt(ag.pct), ag.color);
  });

  // Top regions
  els.push(text(16, 462, 'Top Regions', 13, P.text, { fw: 700 }));
  const regions = [
    { name: 'United States', pct: 42, flag: '🇺🇸' },
    { name: 'United Kingdom', pct: 18, flag: '🇬🇧' },
    { name: 'Canada',         pct: 12, flag: '🇨🇦' },
    { name: 'Australia',      pct: 8,  flag: '🇦🇺' },
  ];
  regions.forEach((r, i) => {
    const ry = 482 + i * 50;
    glassCard(els, 16, ry, W - 32, 42, { rx: 10 });
    els.push(text(32, ry + 26, r.flag + '  ' + r.name, 12, P.text));
    els.push(text(W - 28, ry + 26, r.pct + '%', 12, P.acc, { anchor: 'end', fw: 700 }));
    progressBar(els, W - 100, ry + 23, 80, r.pct, P.acc);
  });

  navBar(els, 2);

  totalElements += els.length;
  screens.push({ name: 'Audience', svg: '', elements: els });
})();

// ────────────────────────────────────────────────────────────────────────────
// SCREEN 4 — Revenue
// ────────────────────────────────────────────────────────────────────────────
(function buildRevenue() {
  const els = [];

  els.push(rect(0, 0, W, H, P.bg));
  ambientGlow(els, 100, 250, 140, P.acc3);
  ambientGlow(els, 320, 500, 100, P.acc);

  statusBar(els);
  els.push(text(16, 72, 'Revenue', 22, P.text, { fw: 800 }));

  // Big revenue number
  glassCard(els, 16, 92, W - 32, 120, { rx: 16 });
  els.push(text(28, 116, 'Monthly Earnings', 11, P.sub));
  els.push(text(28, 154, '$12,480', 40, P.text, { fw: 800 }));
  els.push(text(28, 176, '↑ $892  vs last month', 12, P.acc3));
  // Trend dots
  const revDots = [65, 72, 68, 80, 88, 92, 100];
  revDots.forEach((v, i) => {
    const dx = 250 + i * 17;
    const dy = 140 - v * 0.4;
    if (i > 0) {
      const prevDy = 140 - revDots[i - 1] * 0.4;
      els.push(line(250 + (i - 1) * 17, prevDy, dx, dy, P.acc3, { sw: 2 }));
    }
    if (i === revDots.length - 1) els.push(circle(dx, dy, 4, P.acc3));
  });

  // Revenue breakdown
  els.push(text(16, 238, 'Revenue Streams', 13, P.text, { fw: 700 }));
  const streams = [
    { label: 'AdSense',        val: '$5,240',  pct: 42, color: P.acc  },
    { label: 'Sponsorships',   val: '$4,800',  pct: 38, color: P.acc2 },
    { label: 'Memberships',    val: '$1,680',  pct: 13, color: P.acc3 },
    { label: 'Merch',          val: '$760',    pct: 7,  color: '#F59E0B' },
  ];
  streams.forEach((s, i) => {
    const sy = 258 + i * 70;
    glassCard(els, 16, sy, W - 32, 62, { rx: 12 });
    // color stripe
    els.push(rect(16, sy, 4, 62, s.color, { rx: 2 }));
    els.push(text(30, sy + 22, s.label, 13, P.text, { fw: 600 }));
    els.push(text(30, sy + 42, s.pct + '% of total', 10, P.sub));
    els.push(text(W - 28, sy + 22, s.val, 15, P.text, { fw: 800, anchor: 'end' }));
    progressBar(els, 30, sy + 50, W - 60, s.pct, s.color);
  });

  // Payout status
  els.push(text(16, 560, 'Next Payout', 13, P.text, { fw: 700 }));
  glassCard(els, 16, 578, W - 32, 78, { rx: 14 });
  els.push(circle(40, 617, 20, P.acc3, { opacity: 0.2 }));
  els.push(text(40, 622, '💸', 16, P.text, { anchor: 'middle' }));
  els.push(text(72, 607, 'Apr 15, 2026', 11, P.sub));
  els.push(text(72, 626, '$4,120 pending', 15, P.text, { fw: 700 }));
  els.push(text(72, 644, 'AdSense + Sponsorships', 10, P.sub));
  progressBar(els, 72, 648, W - 90, 68, P.acc3);

  navBar(els, 3);

  totalElements += els.length;
  screens.push({ name: 'Revenue', svg: '', elements: els });
})();

// ────────────────────────────────────────────────────────────────────────────
// SCREEN 5 — AI Insights
// ────────────────────────────────────────────────────────────────────────────
(function buildInsights() {
  const els = [];

  els.push(rect(0, 0, W, H, P.bg));
  ambientGlow(els, 195, 200, 180, P.acc2);
  ambientGlow(els, 195, 600, 130, P.acc);

  statusBar(els);

  // Header
  els.push(rect(16, 56, W - 32, 52, P.card, { rx: 14, stroke: P.border, sw: 1 }));
  els.push(text(40, 77, '✦', 16, P.acc2));
  els.push(text(62, 72, 'KIRA Intelligence', 12, P.text, { fw: 700 }));
  els.push(text(62, 88, 'Powered by real-time analytics', 10, P.sub));
  els.push(text(W - 28, 80, '●  Live', 11, P.acc3, { anchor: 'end' }));

  // Weekly score
  glassCard(els, 16, 122, W - 32, 100, { rx: 16 });
  els.push(text(28, 144, 'Creator Score', 11, P.sub));
  els.push(text(28, 178, '87', 48, P.acc, { fw: 900 }));
  els.push(text(80, 178, '/100', 18, P.sub, { fw: 400 }));
  els.push(text(28, 200, '↑ 4 pts from last week', 11, P.acc3));
  // Score rings
  [80, 65, 50].forEach((r, i) => {
    els.push(circle(310, 172, r, 'transparent', { stroke: [P.acc, P.acc2, P.card][i], sw: [12, 8, 4][i], opacity: [0.3, 0.2, 0.15][i] }));
  });
  els.push(circle(310, 172, 30, P.acc, { opacity: 0.15 }));
  els.push(text(310, 177, '87', 16, P.acc, { anchor: 'middle', fw: 800 }));

  // Insight cards
  els.push(text(16, 248, 'AI Recommendations', 13, P.text, { fw: 700 }));

  const insights = [
    {
      icon: '🚀',
      title: 'Post between 6–8 PM EST',
      body: 'Your audience is 2.4× more active on weekday evenings. Your last 3 peak-performing videos posted in this window.',
      tag: 'Timing',
      color: P.acc,
    },
    {
      icon: '🎯',
      title: 'Add chapters to long videos',
      body: 'Videos with chapters see 34% higher watch time on your channel. 6 of your videos are missing this.',
      tag: 'Retention',
      color: P.acc2,
    },
    {
      icon: '📸',
      title: 'Thumbnail refresh opportunity',
      body: '3 videos in your top 20 have CTR below 5%. Testing new thumbnails could unlock 12K+ more monthly views.',
      tag: 'Discovery',
      color: P.acc3,
    },
    {
      icon: '💬',
      title: 'Reply rate below benchmark',
      body: 'You\'re replying to 12% of comments. Channels with >25% reply rate grow subs 1.8× faster.',
      tag: 'Community',
      color: '#F59E0B',
    },
  ];

  insights.forEach((ins, i) => {
    const iy = 268 + i * 114;
    if (iy + 106 > H - 72) return; // skip if off screen
    glassCard(els, 16, iy, W - 32, 106, { rx: 14 });
    // accent side bar
    els.push(rect(16, iy, 4, 106, ins.color, { rx: 2 }));
    // icon circle
    els.push(circle(44, iy + 28, 18, ins.color, { opacity: 0.15 }));
    els.push(text(44, iy + 33, ins.icon, 14, P.text, { anchor: 'middle' }));
    // tag
    els.push(rect(68, iy + 12, 58, 16, ins.color, { rx: 4, opacity: 0.2 }));
    els.push(text(97, iy + 23, ins.tag, 9, ins.color, { anchor: 'middle', fw: 600 }));
    // title
    els.push(text(68, iy + 42, ins.title, 12, P.text, { fw: 700 }));
    // body
    const shortBody = ins.body.length > 70 ? ins.body.slice(0, 69) + '…' : ins.body;
    els.push(text(68, iy + 60, shortBody.slice(0, 40), 10, P.sub));
    els.push(text(68, iy + 74, shortBody.slice(40), 10, P.sub));
    // CTA
    els.push(text(W - 28, iy + 88, 'Apply →', 11, ins.color, { anchor: 'end', fw: 600 }));
  });

  navBar(els, 4);

  totalElements += els.length;
  screens.push({ name: 'Insights', svg: '', elements: els });
})();

// ────────────────────────────────────────────────────────────────────────────
// SCREEN 6 — Profile / Settings
// ────────────────────────────────────────────────────────────────────────────
(function buildProfile() {
  const els = [];

  els.push(rect(0, 0, W, H, P.bg));
  ambientGlow(els, 195, 180, 160, P.acc2);

  statusBar(els);

  // Profile hero card
  glassCard(els, 16, 56, W - 32, 160, { rx: 16 });
  // Banner area
  els.push(rect(16, 56, W - 32, 80, P.acc2, { rx: 16, opacity: 0.15 }));
  // Decorative lines
  for (let li = 0; li < 5; li++) {
    els.push(line(16 + li * 70, 56, 16 + li * 70 + 100, 136, 'rgba(168,85,247,0.1)', { sw: 1 }));
  }
  // Avatar
  els.push(circle(195, 124, 38, P.card, { stroke: P.acc2, sw: 3 }));
  avatar(els, 195, 124, 30, 'MK');
  // Verified badge
  els.push(circle(224, 150, 10, P.acc3));
  els.push(text(224, 154, '✓', 9, P.text, { anchor: 'middle', fw: 700 }));
  // Name/handle
  els.push(text(195, 176, 'Maya Kim', 16, P.text, { anchor: 'middle', fw: 800 }));
  els.push(text(195, 194, '@mayakimcreates', 11, P.sub, { anchor: 'middle' }));

  // Stats row
  [
    { label: 'Videos', val: '247' },
    { label: 'Subscribers', val: '284K' },
    { label: 'Total Views', val: '4.28M' },
  ].forEach((s, i) => {
    const sx = 60 + i * 110;
    els.push(text(sx, 226, s.val, 14, P.text, { anchor: 'middle', fw: 800 }));
    els.push(text(sx, 242, s.label, 9, P.sub, { anchor: 'middle' }));
  });

  // Connected platforms
  els.push(text(16, 268, 'Connected Platforms', 12, P.sub, { fw: 600 }));
  const platforms = [
    { name: 'YouTube', icon: '▶', color: '#FF0000', status: 'Connected' },
    { name: 'Instagram', icon: '◈', color: '#E1306C', status: 'Connected' },
    { name: 'TikTok',    icon: '♪', color: P.text,   status: 'Connected' },
    { name: 'Podcast',   icon: '🎙', color: '#8B5CF6', status: 'Connect' },
  ];
  platforms.forEach((p, i) => {
    const py = 286 + i * 58;
    glassCard(els, 16, py, W - 32, 50, { rx: 12 });
    els.push(circle(42, py + 25, 16, p.color, { opacity: 0.18 }));
    els.push(text(42, py + 29, p.icon, 13, p.color, { anchor: 'middle', fw: 700 }));
    els.push(text(68, py + 29, p.name, 13, P.text, { fw: 600 }));
    const isConn = p.status === 'Connected';
    els.push(rect(W - 110, py + 16, 90, 22, isConn ? P.acc3 : P.acc, { rx: 11, opacity: isConn ? 0.15 : 1 }));
    els.push(text(W - 65, py + 30, p.status, 10, isConn ? P.acc3 : P.text, { anchor: 'middle', fw: 600 }));
  });

  // Settings section
  els.push(text(16, 524, 'Settings', 12, P.sub, { fw: 600 }));
  const settings = [
    { icon: '🔔', label: 'Notifications' },
    { icon: '🔒', label: 'Privacy & Security' },
    { icon: '💳', label: 'Subscription Plan' },
    { icon: '❓', label: 'Help & Support' },
  ];
  settings.forEach((s, i) => {
    const sy = 542 + i * 48;
    glassCard(els, 16, sy, W - 32, 40, { rx: 10 });
    els.push(text(34, sy + 24, s.icon, 14, P.text));
    els.push(text(56, sy + 24, s.label, 12, P.text));
    els.push(text(W - 28, sy + 24, '›', 16, P.sub, { anchor: 'end' }));
  });

  navBar(els, 0);

  totalElements += els.length;
  screens.push({ name: 'Profile', svg: '', elements: els });
})();

// ── Assemble .pen file ────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    tagline: TAGLINE,
    author: 'RAM',
    date: DATE,
    theme: 'dark',
    heartbeat: HB,
    palette: {
      bg: P.bg, surface: P.surf, card: P.card,
      accent: P.acc, accent2: P.acc2, accent3: P.acc3,
      text: P.text, subtle: P.sub,
    },
    elements: totalElements,
    slug: SLUG,
  },
  screens: screens.map(s => ({
    name: s.name,
    width: W,
    height: H,
    svg: s.svg,
    elements: s.elements,
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
