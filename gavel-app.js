'use strict';
const fs   = require('fs');
const path = require('path');

// ─── GAVEL — AI Legal Co-Pilot ────────────────────────────────────────────
// DARK theme — inspired by saaspo.com's observation that purple/violet is
// the dominant AI SaaS signature color (219+ AI examples), combined with
// darkmodedesign.com's glassmorphism panel patterns: translucent cards with
// rgba fill + backdrop-filter blur creating UI depth without additional color.
// Also pulled the bento-grid feature section pattern from land-book.com.
//
// Challenge: Build a mobile AI legal intelligence tool using deep midnight
// violet bases, glassmorphism card panels, ambient glow effects on CTAs,
// and risk-level color coding across documents/cases.

const SLUG = 'gavel';
const W = 390, H = 844;
const HEARTBEAT = 26;

// ── Palette ─────────────────────────────────────────────────────────────────
const P = {
  bg:        '#08080F',   // near-OLED black, violet-tinted
  surf:      '#0F0F1A',   // elevated surface
  card:      '#141428',   // card background
  glass:     'rgba(139,92,246,0.07)',   // glassmorphism tint
  glassBord: 'rgba(139,92,246,0.22)',   // glass border
  acc:       '#8B5CF6',   // primary violet (AI signature)
  accGlow:   'rgba(139,92,246,0.35)',   // glow for buttons
  acc2:      '#06B6D4',   // cyan secondary
  acc2Lo:    'rgba(6,182,212,0.18)',
  success:   '#10B981',   // green
  successLo: 'rgba(16,185,129,0.18)',
  warn:      '#F59E0B',   // amber
  warnLo:    'rgba(245,158,11,0.18)',
  danger:    '#EF4444',   // red
  dangerLo:  'rgba(239,68,68,0.18)',
  text:      '#E2E0F0',   // primary text (purple-tinted white)
  textMid:   '#9B96B8',   // secondary text
  textLow:   'rgba(155,150,184,0.45)', // tertiary
  border:    'rgba(139,92,246,0.12)',  // subtle border
  borderMid: 'rgba(155,150,184,0.15)',
  navBg:     'rgba(8,8,15,0.88)',      // frosted nav
  white:     '#FFFFFF',
};

// ── Primitive builders ────────────────────────────────────────────────────────
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
    fontFamily: opts.font ?? 'Inter, system-ui, sans-serif',
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

// ── Shared UI components ───────────────────────────────────────────────────────

// Status bar (top)
function statusBar(elements) {
  elements.push(rect(0, 0, W, 44, P.bg));
  elements.push(text(16, 28, '9:41', 13, P.text, { fw: 600 }));
  // Signal dots
  for (let i = 0; i < 3; i++) elements.push(rect(340 + i * 8, 18, 5, 10 - i * 2, P.text, { rx: 1 }));
  elements.push(text(360, 28, '▲', 10, P.text, { opacity: 0.6 }));
  // Battery
  elements.push(rect(370, 18, 18, 10, 'none', { rx: 2, stroke: P.text, sw: 1, opacity: 0.6 }));
  elements.push(rect(371, 19, 13, 8, P.text, { rx: 1, opacity: 0.6 }));
  elements.push(rect(388, 21, 2, 4, P.text, { rx: 1, opacity: 0.4 }));
}

// Bottom navigation (5 items)
function bottomNav(elements, active) {
  const NAV_Y = H - 72;
  elements.push(rect(0, NAV_Y, W, 72, P.navBg));
  elements.push(line(0, NAV_Y, W, NAV_Y, P.border, { sw: 0.5 }));

  const items = [
    { id: 'home',     label: 'Home',   icon: '⌂' },
    { id: 'research', label: 'Search', icon: '⊙' },
    { id: 'docs',     label: 'Docs',   icon: '☷' },
    { id: 'timeline', label: 'Cases',  icon: '◎' },
    { id: 'profile',  label: 'You',    icon: '◉' },
  ];
  const itemW = W / 5;
  items.forEach((item, i) => {
    const cx = itemW * i + itemW / 2;
    const isActive = item.id === active;
    if (isActive) {
      elements.push(rect(cx - 22, NAV_Y + 6, 44, 32, P.glass, { rx: 16 }));
      elements.push(rect(cx - 22, NAV_Y + 6, 44, 32, 'none', { rx: 16, stroke: P.glassBord, sw: 0.5 }));
    }
    elements.push(text(cx, NAV_Y + 27, item.icon, 18, isActive ? P.acc : P.textMid, { anchor: 'middle' }));
    elements.push(text(cx, NAV_Y + 46, item.label, 10, isActive ? P.acc : P.textLow, { anchor: 'middle', fw: isActive ? 600 : 400 }));
    if (isActive) {
      elements.push(circle(cx, NAV_Y + 5, 2, P.acc));
    }
  });
}

// AI badge pill
function aiBadge(elements, x, y, label = 'AI') {
  const w = label.length * 7 + 20;
  elements.push(rect(x, y, w, 20, 'rgba(139,92,246,0.15)', { rx: 10 }));
  elements.push(rect(x, y, w, 20, 'none', { rx: 10, stroke: P.glassBord, sw: 0.5 }));
  elements.push(circle(x + 10, y + 10, 3, P.acc));
  elements.push(text(x + 18, y + 14, label, 9, P.acc, { fw: 600, ls: 0.5 }));
}

// Risk badge
function riskBadge(elements, x, y, level) {
  const cfg = {
    high:   { bg: P.dangerLo,  border: P.danger,   color: P.danger,   label: 'HIGH RISK' },
    medium: { bg: P.warnLo,    border: P.warn,      color: P.warn,     label: 'MEDIUM' },
    low:    { bg: P.successLo, border: P.success,   color: P.success,  label: 'LOW RISK' },
    clear:  { bg: P.acc2Lo,    border: P.acc2,      color: P.acc2,     label: 'CLEAR' },
  }[level] || { bg: P.glass, border: P.glassBord, color: P.textMid, label: 'UNKNOWN' };
  const w = cfg.label.length * 6.5 + 16;
  elements.push(rect(x, y, w, 18, cfg.bg, { rx: 4 }));
  elements.push(rect(x, y, w, 18, 'none', { rx: 4, stroke: cfg.border, sw: 0.5 }));
  elements.push(text(x + 8, y + 13, cfg.label, 8.5, cfg.color, { fw: 700, ls: 0.3 }));
  return w;
}

// Glass card
function glassCard(elements, x, y, w, h, opts = {}) {
  elements.push(rect(x, y, w, h, opts.fill ?? P.glass, { rx: opts.rx ?? 14 }));
  elements.push(rect(x, y, w, h, 'none', { rx: opts.rx ?? 14, stroke: opts.stroke ?? P.glassBord, sw: 0.6 }));
}

// Progress bar
function progressBar(elements, x, y, w, pct, color) {
  elements.push(rect(x, y, w, 4, 'rgba(255,255,255,0.06)', { rx: 2 }));
  elements.push(rect(x, y, w * (pct / 100), 4, color, { rx: 2 }));
}

// Section header
function sectionHeader(elements, y, label, action) {
  elements.push(text(20, y, label, 12, P.textMid, { fw: 600, ls: 0.8 }));
  if (action) elements.push(text(W - 20, y, action, 12, P.acc, { anchor: 'end' }));
}

// ── SCREEN 1: Dashboard ────────────────────────────────────────────────────────
function buildDashboard() {
  const els = [];
  statusBar(els);

  // Header with greeting + notification
  els.push(text(20, 74, 'Good morning,', 14, P.textMid));
  els.push(text(20, 94, 'Sarah Chen', 24, P.text, { fw: 700 }));

  // Notification bell (top right)
  els.push(rect(W - 52, 58, 36, 36, P.glass, { rx: 12 }));
  els.push(rect(W - 52, 58, 36, 36, 'none', { rx: 12, stroke: P.glassBord, sw: 0.5 }));
  els.push(text(W - 34, 80, '🔔', 16, P.text, { anchor: 'middle' }));
  els.push(circle(W - 24, 62, 5, P.danger));
  els.push(text(W - 24, 66, '3', 7, P.white, { anchor: 'middle', fw: 700 }));

  // AI alert banner (glassmorphism)
  glassCard(els, 20, 108, W - 40, 60, { fill: 'rgba(139,92,246,0.1)', rx: 14 });
  els.push(circle(38, 138, 10, 'rgba(139,92,246,0.2)'));
  els.push(text(38, 142, '⚡', 11, P.acc, { anchor: 'middle' }));
  els.push(text(56, 127, 'AI Analysis Ready', 12, P.acc, { fw: 700 }));
  els.push(text(56, 143, 'Meridian Corp contract flagged — 3 risk clauses', 11, P.textMid));
  els.push(text(W - 32, 143, 'View →', 11, P.acc, { anchor: 'end' }));

  // Bento stats grid
  sectionHeader(els, 190, 'ACTIVE CASES');

  // Large metric card
  glassCard(els, 20, 202, 162, 90);
  els.push(text(36, 228, '24', 40, P.text, { fw: 800 }));
  els.push(text(36, 248, 'Active Cases', 11, P.textMid));
  els.push(progressBar(els, 36, 258, 110, 68, P.acc));
  els.push(text(36, 280, '68% on track', 10, P.acc));

  // Small metric cards (right column)
  // Upcoming deadlines
  glassCard(els, 196, 202, 154, 42);
  els.push(text(214, 222, '7', 18, P.warn, { fw: 800 }));
  els.push(text(234, 222, 'Deadlines', 11, P.textMid));
  els.push(text(234, 235, 'this week', 10, P.textLow));

  // Briefs pending
  glassCard(els, 196, 250, 154, 42);
  els.push(text(214, 270, '12', 18, P.acc2, { fw: 800 }));
  els.push(text(240, 270, 'Briefs', 11, P.textMid));
  els.push(text(240, 283, 'pending review', 10, P.textLow));

  // Win rate card (full width)
  glassCard(els, 20, 300, W - 40, 52, { fill: 'rgba(16,185,129,0.08)', rx: 12 });
  els.push(text(36, 322, 'Win Rate', 11, P.textMid));
  els.push(text(36, 340, '78%', 18, P.success, { fw: 700 }));
  els.push(text(118, 340, '↑ 4% from last quarter', 11, P.textMid));
  // Mini bar chart
  const bars = [60, 72, 65, 70, 74, 78];
  bars.forEach((h, i) => {
    const bx = 240 + i * 18;
    els.push(rect(bx, 340 - h * 0.3, 10, h * 0.3, i === bars.length - 1 ? P.success : 'rgba(16,185,129,0.3)', { rx: 2 }));
  });

  // Recent activity
  sectionHeader(els, 373, 'RECENT ACTIVITY', 'See all');

  const activities = [
    { icon: '📄', title: 'Meridian Corp — NDA',       sub: 'Risk analysis complete', time: '2m ago',  color: P.danger },
    { icon: '⚖️', title: 'State v. Torres',            sub: 'Motion filed successfully', time: '1h ago', color: P.success },
    { icon: '🏛️', title: 'Henderson Estate Trust',    sub: 'Deposition scheduled',    time: '3h ago', color: P.warn },
  ];

  activities.forEach((a, i) => {
    const y = 385 + i * 68;
    glassCard(els, 20, y, W - 40, 58);
    // Icon circle
    els.push(circle(46, y + 29, 16, 'rgba(139,92,246,0.12)'));
    els.push(text(46, y + 34, a.icon, 14, P.text, { anchor: 'middle' }));
    // Status dot
    els.push(circle(57, y + 18, 5, a.color));
    // Title + sub
    els.push(text(72, y + 22, a.title, 13, P.text, { fw: 600 }));
    els.push(text(72, y + 37, a.sub, 11, P.textMid));
    // Time
    els.push(text(W - 30, y + 22, a.time, 10, P.textLow, { anchor: 'end' }));
    els.push(text(W - 30, y + 37, '→', 12, P.acc, { anchor: 'end' }));
  });

  bottomNav(els, 'home');
  return els;
}

// ── SCREEN 2: Research ─────────────────────────────────────────────────────────
function buildResearch() {
  const els = [];
  statusBar(els);

  // Header
  els.push(text(20, 74, 'Legal Research', 20, P.text, { fw: 700 }));
  aiBadge(els, 20, 84);

  // Search bar (glassmorphism)
  glassCard(els, 20, 112, W - 40, 46, { fill: P.glass, rx: 23 });
  els.push(text(46, 138, '⌕', 16, P.acc));
  els.push(text(70, 139, 'Search cases, statutes, precedents…', 13, P.textLow));
  els.push(rect(W - 62, 118, 36, 34, P.acc, { rx: 17 }));
  els.push(text(W - 44, 139, '→', 14, P.white, { anchor: 'middle', fw: 700 }));

  // Category chips
  const chips = ['Contract Law', 'IP', 'Employment', 'Torts', 'Criminal'];
  let cx = 20;
  chips.forEach(c => {
    const cw = c.length * 7 + 20;
    const isFirst = c === 'Contract Law';
    els.push(rect(cx, 170, cw, 26, isFirst ? P.acc : P.glass, { rx: 13 }));
    if (!isFirst) els.push(rect(cx, 170, cw, 26, 'none', { rx: 13, stroke: P.glassBord, sw: 0.5 }));
    els.push(text(cx + cw / 2, 187, c, 10.5, isFirst ? P.white : P.textMid, { anchor: 'middle', fw: isFirst ? 600 : 400 }));
    cx += cw + 8;
  });

  // AI Summary card (glassmorphism featured)
  glassCard(els, 20, 210, W - 40, 130, { fill: 'rgba(139,92,246,0.1)', rx: 16 });
  // Top bar of AI card
  els.push(rect(20, 210, W - 40, 32, 'rgba(139,92,246,0.15)', { rx: 16 }));
  els.push(rect(20, 226, W - 40, 16, 'rgba(139,92,246,0.15)')); // square bottom
  aiBadge(els, 32, 220, 'AI SUMMARY');
  els.push(text(W - 32, 230, 'Meridian Corp v. Axis', 10, P.textMid, { anchor: 'end' }));
  els.push(text(32, 261, 'Courts have consistently upheld non-compete clauses in', 11.5, P.text));
  els.push(text(32, 277, 'tech contracts when limited to 12 months and specific', 11.5, P.text));
  els.push(text(32, 293, 'geography. The Meridian clause (24 months, global) is', 11.5, P.text));
  els.push(text(32, 309, 'likely unenforceable under CA Business Code § 16600.', 11.5, P.acc2));
  // Confidence bar
  els.push(text(32, 332, 'Confidence', 10, P.textMid));
  progressBar(els, 100, 328, 120, 87, P.acc);
  els.push(text(W - 32, 332, '87%', 10, P.acc, { anchor: 'end', fw: 600 }));

  // Citations
  sectionHeader(els, 360, 'CITED PRECEDENTS', '4 results');

  const cases = [
    { name: 'Edwards v. Arthur Andersen',    year: '2008', court: 'CA Supreme', rel: 94, color: P.acc },
    { name: 'Dowell v. Biosense Webster',    year: '2009', court: '9th Circuit',  rel: 88, color: P.acc },
    { name: 'Golden v. CalTrans',            year: '2015', court: 'CA App Ct',   rel: 72, color: P.acc2 },
    { name: 'Whyte v. Schlage Lock Co.',     year: '1999', court: 'CA App Ct',   rel: 65, color: P.textMid },
  ];
  cases.forEach((c, i) => {
    const y = 372 + i * 62;
    glassCard(els, 20, y, W - 40, 52);
    els.push(rect(30, y + 10, 3, 32, c.color, { rx: 1.5 }));
    els.push(text(40, y + 22, c.name, 12, P.text, { fw: 600 }));
    els.push(text(40, y + 37, c.court + '  ·  ' + c.year, 10, P.textMid));
    // Relevance
    els.push(text(W - 30, y + 22, c.rel + '%', 12, c.color, { anchor: 'end', fw: 700 }));
    els.push(text(W - 30, y + 36, 'relevant', 9, P.textLow, { anchor: 'end' }));
  });

  bottomNav(els, 'research');
  return els;
}

// ── SCREEN 3: Documents ────────────────────────────────────────────────────────
function buildDocuments() {
  const els = [];
  statusBar(els);

  // Header
  els.push(text(20, 74, 'Documents', 20, P.text, { fw: 700 }));
  els.push(text(20, 93, '34 files across 8 cases', 12, P.textMid));

  // Filter bar
  const filters = ['All', 'Contracts', 'Motions', 'Evidence', 'Briefs'];
  let fx = 20;
  filters.forEach((f, i) => {
    const fw2 = f.length * 7.5 + 18;
    const isFirst = i === 0;
    els.push(rect(fx, 108, fw2, 28, isFirst ? P.acc : P.glass, { rx: 14 }));
    if (!isFirst) els.push(rect(fx, 108, fw2, 28, 'none', { rx: 14, stroke: P.glassBord, sw: 0.5 }));
    els.push(text(fx + fw2 / 2, 126, f, 11, isFirst ? P.white : P.textMid, { anchor: 'middle', fw: isFirst ? 600 : 400 }));
    fx += fw2 + 8;
  });

  // Sort + upload row
  els.push(text(20, 155, 'Sort: Recent', 11, P.textMid));
  els.push(rect(W - 64, 140, 48, 26, P.acc, { rx: 13 }));
  els.push(text(W - 40, 157, '+ Upload', 10, P.white, { anchor: 'middle', fw: 600 }));

  // Document list
  const docs = [
    { name: 'Meridian Corp — Master Services Agreement',   type: 'CONTRACT',  risk: 'high',   pages: 48, updated: '2h ago' },
    { name: 'Henderson Estate — Trust Amendment v3',       type: 'TRUST DOC', risk: 'low',    pages: 12, updated: '1d ago' },
    { name: 'State v. Torres — Defense Motion',            type: 'MOTION',    risk: 'clear',  pages: 8,  updated: '1d ago' },
    { name: 'Axis Technologies — IP Assignment',           type: 'CONTRACT',  risk: 'medium', pages: 22, updated: '3d ago' },
    { name: 'Chen v. Pacific Realty — Deposition',         type: 'EVIDENCE',  risk: 'medium', pages: 35, updated: '5d ago' },
  ];

  docs.forEach((doc, i) => {
    const y = 170 + i * 104;
    if (y + 94 > H - 80) return;
    glassCard(els, 20, y, W - 40, 94);

    // Type badge top-left
    const typeColors = { CONTRACT: P.acc, MOTION: P.acc2, 'TRUST DOC': P.warn, EVIDENCE: P.textMid };
    const tColor = typeColors[doc.type] || P.textMid;
    els.push(rect(32, y + 10, doc.type.length * 6 + 14, 16, 'rgba(0,0,0,0.3)', { rx: 4 }));
    els.push(text(32 + 7, y + 21, doc.type, 8, tColor, { fw: 600, ls: 0.4 }));
    els.push(text(32 + doc.type.length * 6 + 20, y + 21, doc.updated, 8, P.textLow));

    // Document name
    const nameFirst = doc.name.length > 38 ? doc.name.slice(0, 38) + '…' : doc.name;
    els.push(text(32, y + 42, nameFirst, 12.5, P.text, { fw: 600 }));

    // Pages + risk + analysis
    els.push(text(32, y + 58, doc.pages + ' pages', 11, P.textMid));
    els.push(text(90, y + 58, '·', 11, P.textLow));
    riskBadge(els, 98, y + 48, doc.risk);

    // Progress bar (analysis completion)
    const pct = { high: 100, medium: 72, low: 100, clear: 100 }[doc.risk];
    els.push(text(32, y + 72, 'AI Analysis', 9.5, P.textLow));
    progressBar(els, 100, y + 68, 120, pct,
      doc.risk === 'high' ? P.danger : doc.risk === 'medium' ? P.warn : P.success);
    els.push(text(228, y + 72, pct + '%', 9.5, P.textMid));

    // Arrow
    els.push(text(W - 30, y + 57, '›', 16, P.acc, { anchor: 'end', fw: 300 }));
  });

  bottomNav(els, 'docs');
  return els;
}

// ── SCREEN 4: Case Timeline ────────────────────────────────────────────────────
function buildTimeline() {
  const els = [];
  statusBar(els);

  // Header
  els.push(text(20, 74, 'Case Timeline', 20, P.text, { fw: 700 }));

  // Case selector pill
  glassCard(els, 20, 88, W - 40, 34, { rx: 17 });
  els.push(text(36, 109, '⚖', 14, P.acc));
  els.push(text(56, 109, 'State v. Torres — Assault Defense', 12, P.text, { fw: 600 }));
  els.push(text(W - 36, 109, '▾', 12, P.textMid, { anchor: 'end' }));

  // Case status chips
  els.push(rect(20, 132, 70, 22, P.successLo, { rx: 11 }));
  els.push(rect(20, 132, 70, 22, 'none', { rx: 11, stroke: P.success, sw: 0.5 }));
  els.push(text(55, 147, 'In Progress', 9.5, P.success, { anchor: 'middle', fw: 600 }));
  els.push(text(100, 147, 'Trial: Jun 14, 2026', 11, P.textMid));
  // Countdown badge
  els.push(rect(W - 85, 130, 65, 26, P.dangerLo, { rx: 13 }));
  els.push(rect(W - 85, 130, 65, 26, 'none', { rx: 13, stroke: P.danger, sw: 0.5 }));
  els.push(text(W - 52, 147, '63 days', 10, P.danger, { anchor: 'middle', fw: 700 }));

  // Timeline
  const milestones = [
    { date: 'Mar 3',  label: 'Arrest & Arraignment',    sub: 'Not guilty plea entered',          done: true,  type: 'past' },
    { date: 'Mar 18', label: 'Preliminary Hearing',      sub: 'Charges reduced to misdemeanor',   done: true,  type: 'past' },
    { date: 'Apr 2',  label: 'Discovery Deadline',       sub: 'All evidence disclosed',           done: true,  type: 'past' },
    { date: 'Apr 19', label: 'Motion to Suppress',       sub: 'Body-cam footage challenge',       done: false, type: 'now',  urgent: true },
    { date: 'May 7',  label: 'Expert Witness Deposition',sub: 'Dr. Patricia Reeves, forensics',   done: false, type: 'future' },
    { date: 'Jun 14', label: 'Trial Begins',             sub: 'Dept 47 — Judge Nakamura',         done: false, type: 'trial' },
  ];

  const TL_X = 52;   // center of timeline line
  const TL_START = 170;
  const STEP = 96;

  milestones.forEach((m, i) => {
    const y = TL_START + i * STEP;
    if (y + 80 > H - 80) return;

    // Vertical connector line
    if (i < milestones.length - 1) {
      const nextDone = milestones[i + 1].done || milestones[i + 1].type === 'now';
      els.push(line(TL_X, y + 22, TL_X, y + STEP, m.done ? P.acc : P.borderMid, {
        sw: 2, opacity: m.done ? 0.7 : 0.3
      }));
    }

    // Node
    const nodeColor = m.type === 'now' ? P.acc :
                      m.type === 'trial' ? P.warn :
                      m.done ? P.success : P.borderMid;
    if (m.type === 'now') {
      // Pulsing ring (outer glow simulation)
      els.push(circle(TL_X, y + 8, 16, 'rgba(139,92,246,0.12)'));
      els.push(circle(TL_X, y + 8, 10, 'rgba(139,92,246,0.25)'));
    }
    els.push(circle(TL_X, y + 8, m.type === 'trial' ? 12 : 8, nodeColor, { opacity: m.done ? 1 : 0.5 }));
    if (m.done) {
      els.push(text(TL_X, y + 12, '✓', 8, P.white, { anchor: 'middle', fw: 700 }));
    } else if (m.type === 'now') {
      els.push(text(TL_X, y + 12, '●', 6, P.white, { anchor: 'middle' }));
    } else if (m.type === 'trial') {
      els.push(text(TL_X, y + 13, '⚖', 10, P.bg, { anchor: 'middle' }));
    }

    // Date label (left)
    els.push(text(TL_X - 18, y + 10, m.date, 9, m.done ? P.textMid : P.textLow, { anchor: 'end', fw: m.type === 'now' ? 700 : 400 }));

    // Content card (right)
    const cardX = TL_X + 20;
    const isNow = m.type === 'now';
    const cardFill = isNow ? 'rgba(139,92,246,0.12)' :
                     m.type === 'trial' ? 'rgba(245,158,11,0.08)' : P.glass;
    const cardBorder = isNow ? P.glassBord :
                       m.type === 'trial' ? 'rgba(245,158,11,0.3)' : P.border;
    glassCard(els, cardX, y - 8, W - cardX - 20, 72, { fill: cardFill, stroke: cardBorder, rx: 12 });

    if (isNow) aiBadge(els, cardX + 10, y - 2, 'NEXT UP');
    els.push(text(cardX + 10, y + (isNow ? 22 : 12), m.label, 12.5, isNow ? P.acc : P.text, { fw: 700 }));
    els.push(text(cardX + 10, y + (isNow ? 37 : 26), m.sub, 10.5, P.textMid));

    if (m.urgent) {
      els.push(rect(cardX + 10, y + 45, 65, 15, P.dangerLo, { rx: 7 }));
      els.push(text(cardX + 43, y + 56, '⚠ Urgent filing', 8.5, P.danger, { anchor: 'middle', fw: 600 }));
    }
  });

  bottomNav(els, 'timeline');
  return els;
}

// ── SCREEN 5: AI Insights ──────────────────────────────────────────────────────
function buildInsights() {
  const els = [];
  statusBar(els);

  // Ambient glow behind header (simulated)
  els.push(rect(60, 44, 270, 120, 'rgba(139,92,246,0.05)', { rx: 60 }));

  els.push(text(W / 2, 76, 'AI Insights', 20, P.text, { fw: 700, anchor: 'middle' }));
  els.push(text(W / 2, 94, 'Personalized to your active cases', 12, P.textMid, { anchor: 'middle' }));
  aiBadge(els, W / 2 - 35, 102, '12 NEW INSIGHTS');

  // Insight cards (glassmorphism)
  const insights = [
    {
      category: 'CONTRACT RISK',
      cColor: P.danger,
      title: 'Unenforceable Non-Compete Detected',
      body: 'Meridian Corp clause violates CA Bus. Code § 16600. Recommend immediate renegotiation or severability clause insertion before signing.',
      action: 'View Analysis',
      icon: '⚠️',
      bg: 'rgba(239,68,68,0.07)',
      border: 'rgba(239,68,68,0.2)',
      pct: 94,
      pColor: P.danger,
    },
    {
      category: 'PRECEDENT MATCH',
      cColor: P.acc,
      title: 'Strong Suppression Motion Precedent',
      body: 'Edwards v. LAPD (2021) provides near-identical fact pattern for Torres. 91% success rate for comparable body-cam challenges in this jurisdiction.',
      action: 'See Cases',
      icon: '⚖️',
      bg: 'rgba(139,92,246,0.1)',
      border: P.glassBord,
      pct: 91,
      pColor: P.acc,
    },
    {
      category: 'DEADLINE ALERT',
      cColor: P.warn,
      title: 'Henderson Filing Window Closes',
      body: 'Trust amendment objection period expires Apr 25. Beneficiary consent signatures still outstanding from 2 of 5 parties.',
      action: 'Send Reminders',
      icon: '🗓',
      bg: 'rgba(245,158,11,0.07)',
      border: 'rgba(245,158,11,0.2)',
      pct: 40,
      pColor: P.warn,
    },
  ];

  insights.forEach((ins, i) => {
    const y = 132 + i * 200;
    if (y + 186 > H - 80) return;

    glassCard(els, 20, y, W - 40, 186, { fill: ins.bg, stroke: ins.border, rx: 18 });

    // Category + icon row
    els.push(rect(32, y + 14, ins.category.length * 6.5 + 16, 18, ins.bg, { rx: 4 }));
    els.push(rect(32, y + 14, ins.category.length * 6.5 + 16, 18, 'none', { rx: 4, stroke: ins.border, sw: 0.5 }));
    els.push(text(40, y + 26, ins.category, 8.5, ins.cColor, { fw: 700, ls: 0.4 }));
    els.push(text(W - 36, y + 26, ins.icon, 18, P.text, { anchor: 'end' }));

    // Title
    els.push(text(32, y + 54, ins.title, 14, P.text, { fw: 700 }));

    // Body (2 lines)
    const line1 = ins.body.slice(0, 50);
    const line2 = ins.body.slice(50, 100);
    const line3 = ins.body.slice(100, 150);
    els.push(text(32, y + 72, line1, 11, P.textMid));
    if (line2) els.push(text(32, y + 87, line2, 11, P.textMid));
    if (line3) els.push(text(32, y + 102, line3, 11, P.textMid));

    // Confidence / urgency bar
    els.push(text(32, y + 122, 'Confidence', 9.5, P.textLow));
    progressBar(els, 102, y + 118, 110, ins.pct, ins.pColor);
    els.push(text(220, y + 122, ins.pct + '%', 9.5, ins.pColor, { fw: 600 }));

    // Action button
    const btnW = ins.action.length * 8 + 28;
    els.push(rect(32, y + 136, btnW, 30, ins.bg, { rx: 15 }));
    els.push(rect(32, y + 136, btnW, 30, 'none', { rx: 15, stroke: ins.border, sw: 1 }));
    els.push(text(32 + btnW / 2, y + 155, ins.action + ' →', 11, ins.cColor, { anchor: 'middle', fw: 600 }));

    // Dismiss
    els.push(text(W - 32, y + 155, 'Dismiss', 11, P.textLow, { anchor: 'end' }));
  });

  bottomNav(els, 'home');
  return els;
}

// ── SCREEN 6: Profile ──────────────────────────────────────────────────────────
function buildProfile() {
  const els = [];
  statusBar(els);

  // Header
  els.push(text(20, 74, 'Your Profile', 20, P.text, { fw: 700 }));
  els.push(rect(W - 52, 58, 36, 30, P.glass, { rx: 10 }));
  els.push(rect(W - 52, 58, 36, 30, 'none', { rx: 10, stroke: P.glassBord, sw: 0.5 }));
  els.push(text(W - 34, 77, '⚙', 14, P.textMid, { anchor: 'middle' }));

  // Avatar area
  els.push(circle(W / 2, 128, 44, 'rgba(139,92,246,0.15)'));
  els.push(circle(W / 2, 128, 36, P.acc, { opacity: 0.9 }));
  els.push(text(W / 2, 134, 'SC', 16, P.white, { anchor: 'middle', fw: 700 }));
  // Plan badge
  els.push(rect(W / 2 - 26, 160, 52, 17, P.acc, { rx: 8 }));
  els.push(text(W / 2, 172, '✦ PRO PLAN', 8, P.white, { anchor: 'middle', fw: 700, ls: 0.5 }));

  els.push(text(W / 2, 192, 'Sarah Chen', 18, P.text, { fw: 700, anchor: 'middle' }));
  els.push(text(W / 2, 208, 'Partner — Chen & Associates LLP', 12, P.textMid, { anchor: 'middle' }));
  els.push(text(W / 2, 224, 'Bar: CA #234891  ·  Since 2012', 11, P.textLow, { anchor: 'middle' }));

  // Stats bento grid
  const stats = [
    { value: '147', label: 'Cases\nHandled' },
    { value: '78%',  label: 'Win\nRate' },
    { value: '2.4K', label: 'AI\nQueries' },
    { value: '312h', label: 'Time\nSaved' },
  ];
  const statW = (W - 40 - 12) / 4;
  stats.forEach((s, i) => {
    const sx = 20 + i * (statW + 4);
    glassCard(els, sx, 236, statW, 58);
    els.push(text(sx + statW / 2, 258, s.value, 18, i === 1 ? P.success : P.acc, { fw: 700, anchor: 'middle' }));
    els.push(text(sx + statW / 2, 272, s.label.split('\n')[0], 9, P.textMid, { anchor: 'middle' }));
    els.push(text(sx + statW / 2, 284, s.label.split('\n')[1], 9, P.textMid, { anchor: 'middle' }));
  });

  // Settings list
  sectionHeader(els, 316, 'ACCOUNT & SETTINGS');

  const settings = [
    { icon: '🔔', label: 'Notifications',      sub: '7 active alerts',         color: P.acc },
    { icon: '🛡', label: 'Security & Privacy', sub: '2FA enabled',              color: P.success },
    { icon: '💳', label: 'Billing & Plan',      sub: 'Pro · $49/mo',            color: P.warn },
    { icon: '⚖',  label: 'Bar Association',    sub: 'CA Bar connected',         color: P.acc2 },
    { icon: '📂', label: 'Data & Export',       sub: 'Last export: Mar 15',     color: P.textMid },
    { icon: '🌙', label: 'Appearance',          sub: 'Dark Mode (System)',       color: P.textMid },
  ];

  settings.forEach((s, i) => {
    if (i >= 5) return;
    const y = 328 + i * 58;
    if (y + 50 > H - 80) return;
    glassCard(els, 20, y, W - 40, 48);
    // Icon circle
    els.push(circle(42, y + 24, 14, 'rgba(0,0,0,0.3)'));
    els.push(text(42, y + 29, s.icon, 13, s.color, { anchor: 'middle' }));
    // Label + sub
    els.push(text(64, y + 19, s.label, 13, P.text, { fw: 600 }));
    els.push(text(64, y + 34, s.sub, 11, P.textMid));
    // Arrow
    els.push(text(W - 30, y + 27, '›', 16, P.textLow, { anchor: 'end' }));
  });

  // Sign out button
  els.push(rect(20, H - 148, W - 40, 42, P.dangerLo, { rx: 14 }));
  els.push(rect(20, H - 148, W - 40, 42, 'none', { rx: 14, stroke: 'rgba(239,68,68,0.3)', sw: 0.5 }));
  els.push(text(W / 2, H - 123, 'Sign Out', 13, P.danger, { anchor: 'middle', fw: 600 }));

  bottomNav(els, 'profile');
  return els;
}

// ── Assemble ───────────────────────────────────────────────────────────────────
const screens = [
  { name: 'Dashboard',    build: buildDashboard },
  { name: 'Research',     build: buildResearch },
  { name: 'Documents',    build: buildDocuments },
  { name: 'Timeline',     build: buildTimeline },
  { name: 'AI Insights',  build: buildInsights },
  { name: 'Profile',      build: buildProfile },
];

const pen = {
  version: '2.8',
  metadata: {
    name:      'GAVEL — AI Legal Co-Pilot',
    author:    'RAM',
    date:      new Date().toISOString().slice(0, 10),
    theme:     'dark',
    heartbeat: HEARTBEAT,
    elements:  0,
  },
  screens: [],
};

let totalElements = 0;
screens.forEach(s => {
  const elements = s.build();
  totalElements += elements.length;
  pen.screens.push({
    name: s.name,
    svg:  `<rect width="${W}" height="${H}" fill="${P.bg}"/>`,
    elements,
    canvas: { width: W, height: H, background: P.bg },
  });
});
pen.metadata.elements = totalElements;

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`GAVEL: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
