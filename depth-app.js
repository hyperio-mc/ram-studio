'use strict';
const fs = require('fs');
const path = require('path');

const SLUG = 'depth';
const NAME = 'DEPTH';
const TAGLINE = 'AI organizational memory for engineering teams';
const HEARTBEAT = 331;
const DATE = '2026-04-08';

// ─── Palette (Dark — indigo-lavender AI SaaS aesthetic) ───────────────────────
const C = {
  bg:      '#080A12',
  surf:    '#0F1120',
  card:    '#161828',
  card2:   '#1E2035',
  accent:  '#818CF8',   // indigo-lavender (dominant in AI SaaS per Saaspo)
  accent2: '#34D399',   // emerald
  accent3: '#F472B6',   // pink for warning/memory tags
  text:    '#E0E2F4',
  textMid: '#9EA3C0',
  textDim: '#5A5F7E',
  line:    '#1E2035',
  glow:    '#818CF8',
};

// ─── Primitives ───────────────────────────────────────────────────────────────
function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, width: w, height: h, fill,
    rx: opts.rx ?? 0, opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none', strokeWidth: opts.sw ?? 0,
  };
}
function text(x, y, content, size, fill, opts = {}) {
  return {
    type: 'text', x, y, content: String(content), fontSize: size, fill,
    fontWeight: opts.fw ?? 400, fontFamily: opts.font ?? 'Inter',
    textAnchor: opts.anchor ?? 'start', letterSpacing: opts.ls ?? 0,
    opacity: opts.opacity ?? 1,
  };
}
function circle(cx, cy, r, fill, opts = {}) {
  return {
    type: 'circle', cx, cy, r, fill,
    opacity: opts.opacity ?? 1,
    stroke: opts.stroke ?? 'none', strokeWidth: opts.sw ?? 0,
  };
}
function line(x1, y1, x2, y2, stroke, opts = {}) {
  return {
    type: 'line', x1, y1, x2, y2, stroke,
    strokeWidth: opts.sw ?? 1, opacity: opts.opacity ?? 1,
  };
}
function pill(x, y, w, h, fill, opts = {}) {
  return rect(x, y, w, h, fill, { rx: h / 2, ...opts });
}

// ─── Shared Components ─────────────────────────────────────────────────────────
function statusBar(elements) {
  elements.push(rect(0, 0, 390, 44, C.bg));
  elements.push(text(20, 28, '9:41', 13, C.textMid, { fw: 600 }));
  elements.push(text(350, 28, '●●●', 10, C.textMid, { anchor: 'end' }));
}

function navBar(elements, active = 0) {
  const icons = ['⌂', '⊕', '◈', '⊞'];
  const labels = ['Home', 'Capture', 'Graph', 'Pulse'];
  elements.push(rect(0, 790, 390, 54, C.surf));
  elements.push(line(0, 790, 390, 790, C.line, { sw: 1 }));
  icons.forEach((icon, i) => {
    const x = 48 + i * 74;
    const isActive = i === active;
    elements.push(text(x, 818, icon, 20, isActive ? C.accent : C.textDim, { anchor: 'middle' }));
    elements.push(text(x, 834, labels[i], 9, isActive ? C.accent : C.textDim, { anchor: 'middle', fw: isActive ? 600 : 400 }));
    if (isActive) {
      elements.push(rect(x - 16, 792, 32, 2, C.accent, { rx: 1 }));
    }
  });
}

function topBar(elements, title) {
  elements.push(rect(0, 44, 390, 56, C.bg));
  elements.push(text(20, 82, title, 22, C.text, { fw: 700 }));
  elements.push(circle(355, 68, 18, C.card, { stroke: C.line, sw: 1 }));
  elements.push(text(355, 73, '✦', 13, C.accent, { anchor: 'middle' }));
}

function card(elements, x, y, w, h, opts = {}) {
  elements.push(rect(x, y, w, h, opts.fill ?? C.card, {
    rx: opts.rx ?? 12,
    stroke: opts.stroke ?? C.line,
    sw: opts.sw ?? 1,
    opacity: opts.opacity ?? 1,
  }));
}

function tag(elements, x, y, label, color) {
  const w = label.length * 6.5 + 14;
  elements.push(pill(x, y, w, 20, color + '22', { opacity: 1 }));
  elements.push(text(x + 7, y + 13.5, label, 9.5, color, { fw: 600 }));
  return w + 6;
}

function progressBar(elements, x, y, w, pct, color) {
  elements.push(rect(x, y, w, 4, C.surf, { rx: 2 }));
  elements.push(rect(x, y, Math.round(w * pct), 4, color, { rx: 2 }));
}

// ─── Screen 1: Command Home ────────────────────────────────────────────────────
function screen1() {
  const els = [];
  elements.push(rect(0, 0, 390, 844, C.bg));

  // ambient glow behind logo area
  elements.push(circle(195, 120, 80, C.accent, { opacity: 0.06 }));

  statusBar(els);
  topBar(els, 'DEPTH');

  // AI search bar
  card(els, 20, 108, 350, 44, { rx: 22, stroke: C.accent, sw: 1 });
  els.push(text(44, 134, '✦', 13, C.accent));
  els.push(text(66, 134, 'Ask anything about your team\'s decisions...', 11, C.textDim));
  els.push(circle(352, 130, 14, C.accent, { opacity: 0.15 }));
  els.push(text(352, 135, '→', 13, C.accent, { anchor: 'middle' }));

  // Section label
  els.push(text(20, 172, 'SURFACED FOR YOU', 10, C.textDim, { fw: 700, ls: 1.5 }));
  els.push(text(340, 172, 'See all →', 10, C.accent, { anchor: 'end' }));

  // Bento grid — top large card
  card(els, 20, 184, 350, 120, { rx: 14, stroke: C.accent + '44', sw: 1 });
  els.push(circle(38, 206, 10, C.accent, { opacity: 0.2 }));
  els.push(text(38, 211, '✦', 10, C.accent, { anchor: 'middle' }));
  tag(els, 54, 200, 'DECISION', C.accent);
  tag(els, 54 + 78, 200, '2h ago', C.textDim);
  els.push(text(38, 230, 'Migrate auth to Clerk SDK', 14, C.text, { fw: 700 }));
  els.push(text(38, 248, 'Session from #backend-team — 12 messages captured', 11, C.textMid));
  els.push(text(38, 264, 'Related: JWT deprecation · Session cookies · OAuth scope', 10, C.textDim));
  els.push(line(38, 276, 330, 276, C.line, { sw: 1 }));
  els.push(text(38, 292, '↗ 3 related runbooks', 10, C.accent2));
  els.push(text(200, 292, '↗ 7 similar past decisions', 10, C.accent, { anchor: 'middle' }));

  // Bento — 2 small cards
  card(els, 20, 312, 166, 90, { rx: 12 });
  els.push(text(34, 334, '🧠', 16));
  tag(els, 34, 344, 'RECALL', C.accent3);
  els.push(text(34, 374, 'Redis TTL decision', 11, C.text, { fw: 600 }));
  els.push(text(34, 388, 'from last sprint', 10, C.textDim));

  card(els, 194, 312, 176, 90, { rx: 12 });
  els.push(text(208, 334, '📋', 16));
  tag(els, 208, 344, 'RUNBOOK', C.accent2);
  els.push(text(208, 374, 'DB backup auto-doc', 11, C.text, { fw: 600 }));
  els.push(text(208, 388, 'generated 3h ago', 10, C.textDim));

  // Bento — medium card
  card(els, 20, 410, 350, 80, { rx: 12 });
  els.push(text(34, 432, 'SIGNAL', 9, C.accent, { fw: 700, ls: 1.5 }));
  els.push(text(34, 450, 'Your team is discussing API rate limits heavily today', 13, C.text, { fw: 600 }));
  els.push(text(34, 468, '18 mentions across 4 channels · 6 engineers involved', 10, C.textDim));
  progressBar(els, 34, 474, 200, 0.72, C.accent);

  // Recent activity section
  els.push(text(20, 508, 'RECENT CAPTURES', 10, C.textDim, { fw: 700, ls: 1.5 }));

  const captures = [
    { icon: '💬', label: '#infra', title: 'Kubernetes node scaling strategy', time: '14m', type: 'DISCUSSION' },
    { icon: '📝', label: 'PR #847', title: 'Remove legacy feature flags', time: '1h', type: 'CODE' },
    { icon: '🔗', label: '#product', title: 'v2.1 launch scope finalized', time: '2h', type: 'DECISION' },
  ];
  captures.forEach((c, i) => {
    const y = 522 + i * 66;
    card(els, 20, y, 350, 58, { rx: 10 });
    els.push(text(36, y + 22, c.icon, 14));
    const tc = c.type === 'DECISION' ? C.accent : c.type === 'CODE' ? C.accent2 : C.textDim;
    tag(els, 56, y + 14, c.type, tc);
    els.push(text(56 + (c.type.length * 6.5 + 20), y + 25, c.label, 9.5, C.textDim));
    els.push(text(36, y + 42, c.title, 12, C.text, { fw: 600 }));
    els.push(text(356, y + 42, c.time, 10, C.textDim, { anchor: 'end' }));
  });

  navBar(els, 0);

  return { name: 'Command Home', elements: els };

  function elements() {} // dummy
}

// ─── Screen 2: Knowledge Feed ──────────────────────────────────────────────────
function buildScreen1() {
  const els = [];
  els.push(rect(0, 0, 390, 844, C.bg));
  els.push(circle(195, 120, 80, C.accent, { opacity: 0.06 }));
  statusBar(els);
  topBar(els, 'DEPTH');

  // AI search bar
  card(els, 20, 108, 350, 44, { rx: 22, stroke: C.accent, sw: 1 });
  els.push(text(44, 134, '✦', 13, C.accent));
  els.push(text(66, 134, 'Ask anything about your team\'s decisions...', 11, C.textDim));
  els.push(circle(352, 130, 14, C.accent, { opacity: 0.15 }));
  els.push(text(352, 135, '→', 13, C.accent, { anchor: 'middle' }));

  els.push(text(20, 172, 'SURFACED FOR YOU', 10, C.textDim, { fw: 700, ls: 1.5 }));
  els.push(text(340, 172, 'See all →', 10, C.accent, { anchor: 'end' }));

  card(els, 20, 184, 350, 120, { rx: 14, stroke: C.accent + '44', sw: 1 });
  els.push(circle(38, 206, 10, C.accent, { opacity: 0.2 }));
  els.push(text(38, 211, '✦', 10, C.accent, { anchor: 'middle' }));
  tag(els, 54, 200, 'DECISION', C.accent);
  tag(els, 136, 200, '2h ago', C.textDim);
  els.push(text(38, 230, 'Migrate auth to Clerk SDK', 14, C.text, { fw: 700 }));
  els.push(text(38, 248, 'Session from #backend-team — 12 messages captured', 11, C.textMid));
  els.push(text(38, 264, 'Related: JWT deprecation · Session cookies · OAuth', 10, C.textDim));
  els.push(line(38, 276, 330, 276, C.line, { sw: 1 }));
  els.push(text(38, 292, '↗ 3 runbooks', 10, C.accent2));
  els.push(text(165, 292, '↗ 7 similar decisions', 10, C.accent));

  card(els, 20, 312, 166, 90, { rx: 12 });
  els.push(text(34, 336, '🧠', 16));
  tag(els, 34, 348, 'RECALL', C.accent3);
  els.push(text(34, 374, 'Redis TTL strategy', 11, C.text, { fw: 600 }));
  els.push(text(34, 388, 'from last sprint', 10, C.textDim));

  card(els, 194, 312, 176, 90, { rx: 12 });
  els.push(text(208, 336, '📋', 16));
  tag(els, 208, 348, 'RUNBOOK', C.accent2);
  els.push(text(208, 374, 'DB backup auto-doc', 11, C.text, { fw: 600 }));
  els.push(text(208, 388, 'generated 3h ago', 10, C.textDim));

  card(els, 20, 410, 350, 80, { rx: 12 });
  els.push(text(34, 430, 'SIGNAL', 9, C.accent, { fw: 700, ls: 1.5 }));
  els.push(text(34, 448, 'Team discussing API rate limits heavily today', 13, C.text, { fw: 600 }));
  els.push(text(34, 466, '18 mentions · 4 channels · 6 engineers', 10, C.textDim));
  progressBar(els, 34, 472, 200, 0.72, C.accent);

  els.push(text(20, 508, 'RECENT CAPTURES', 10, C.textDim, { fw: 700, ls: 1.5 }));

  const captures = [
    { icon: '💬', label: '#infra', title: 'Kubernetes node scaling strategy', time: '14m', type: 'DISCUSSION', tc: C.textDim },
    { icon: '📝', label: 'PR #847', title: 'Remove legacy feature flags', time: '1h', type: 'CODE', tc: C.accent2 },
    { icon: '🔗', label: '#product', title: 'v2.1 launch scope finalized', time: '2h', type: 'DECISION', tc: C.accent },
  ];
  captures.forEach((c, i) => {
    const y = 522 + i * 66;
    card(els, 20, y, 350, 58, { rx: 10 });
    els.push(text(36, y + 22, c.icon, 14));
    tag(els, 56, y + 14, c.type, c.tc);
    const tw = c.type.length * 6.5 + 20;
    els.push(text(56 + tw, y + 25, c.label, 9.5, C.textDim));
    els.push(text(36, y + 42, c.title, 12, C.text, { fw: 600 }));
    els.push(text(356, y + 42, c.time, 10, C.textDim, { anchor: 'end' }));
  });

  navBar(els, 0);
  return { name: 'Command Home', elements: els };
}

function buildScreen2() {
  const els = [];
  els.push(rect(0, 0, 390, 844, C.bg));
  statusBar(els);

  // Back nav
  els.push(rect(0, 44, 390, 50, C.bg));
  els.push(text(20, 78, '← Back', 13, C.accent));
  els.push(text(195, 78, 'Decision Detail', 15, C.text, { fw: 700, anchor: 'middle' }));

  // Hero card
  card(els, 0, 100, 390, 220, { rx: 0, fill: C.surf, stroke: 'none' });
  els.push(circle(30, 128, 14, C.accent, { opacity: 0.15 }));
  els.push(text(30, 133, '✦', 13, C.accent, { anchor: 'middle' }));
  tag(els, 50, 120, 'DECISION', C.accent);
  tag(els, 136, 120, 'VERIFIED', C.accent2);
  tag(els, 214, 120, 'Apr 8', C.textDim);

  els.push(text(20, 160, 'Migrate auth to Clerk SDK', 22, C.text, { fw: 800 }));
  els.push(text(20, 180, 'and deprecate our JWT infrastructure', 22, C.textMid, { fw: 400 }));

  els.push(text(20, 210, 'Participants', 10, C.textDim, { fw: 700, ls: 1 }));
  ['JL', 'MK', 'AR', 'PW', 'SA'].forEach((initials, i) => {
    const cx = 20 + i * 28 + 14;
    const colors = [C.accent, C.accent2, C.accent3, '#FB923C', '#60A5FA'];
    els.push(circle(cx, 238, 12, colors[i], { opacity: 0.85 }));
    els.push(text(cx, 242, initials, 8, C.bg, { anchor: 'middle', fw: 700 }));
  });
  els.push(text(170, 242, '+ 7 more', 10, C.textDim));

  els.push(text(20, 268, '#backend-team · 12 messages · Slack + GitHub', 11, C.textDim));
  els.push(line(0, 286, 390, 286, C.line, { sw: 1 }));
  els.push(text(20, 306, '⏱ 47 min discussion', 11, C.textMid));
  els.push(text(195, 306, '🔗 3 PRs linked', 11, C.textMid));
  els.push(text(330, 306, '📋 2 docs', 11, C.textMid));

  // AI Summary
  card(els, 20, 326, 350, 110, { rx: 12, stroke: C.accent + '33', sw: 1 });
  els.push(circle(36, 342, 8, C.accent, { opacity: 0.2 }));
  els.push(text(36, 346, '✦', 9, C.accent, { anchor: 'middle' }));
  els.push(text(50, 346, 'DEPTH SUMMARY', 9, C.accent, { fw: 700, ls: 1 }));
  els.push(text(34, 364, 'Team agreed to replace home-grown JWT with Clerk,', 11, C.textMid));
  els.push(text(34, 378, 'citing maintenance burden and MFA requirements.', 11, C.textMid));
  els.push(text(34, 392, 'Migration phased over 3 sprints; rollback plan required', 11, C.textMid));
  els.push(text(34, 406, 'before cutting over production traffic.', 11, C.textMid));
  els.push(text(34, 422, 'Confidence: High · 3 dissenting voices logged', 10, C.textDim));

  // Key reasons
  els.push(text(20, 448, 'WHY THIS WAS DECIDED', 10, C.textDim, { fw: 700, ls: 1.5 }));
  const reasons = [
    { n: '01', text: 'JWT refresh logic causing 3 production bugs per month' },
    { n: '02', text: 'Clerk MFA meets SOC 2 requirements without custom code' },
    { n: '03', text: 'Team velocity gain estimated at +20% auth-related tasks' },
  ];
  reasons.forEach((r, i) => {
    const y = 464 + i * 52;
    card(els, 20, y, 350, 44, { rx: 8 });
    els.push(text(36, y + 15, r.n, 10, C.accent, { fw: 800 }));
    els.push(line(50, y + 8, 50, y + 36, C.line, { sw: 1 }));
    els.push(text(62, y + 26, r.text, 11, C.text, { fw: 500 }));
  });

  // Related section
  els.push(text(20, 620, 'RELATED', 10, C.textDim, { fw: 700, ls: 1.5 }));
  const related = ['↗ JWT deprecation plan (2023)', '↗ Session cookie migration', '↗ OAuth scope audit'];
  related.forEach((r, i) => {
    els.push(text(20, 640 + i * 20, r, 11, C.accent));
  });

  // Action buttons
  card(els, 20, 702, 164, 44, { rx: 22, fill: C.accent });
  els.push(text(102, 729, 'View Runbook', 12, C.bg, { fw: 700, anchor: 'middle' }));
  card(els, 196, 702, 174, 44, { rx: 22, stroke: C.accent, sw: 1, fill: 'transparent' });
  els.push(text(283, 729, 'Share Decision', 12, C.accent, { fw: 600, anchor: 'middle' }));

  navBar(els, 0);
  return { name: 'Decision Detail', elements: els };
}

function buildScreen3() {
  const els = [];
  els.push(rect(0, 0, 390, 844, C.bg));
  statusBar(els);
  topBar(els, 'Capture');
  els.push(text(20, 102, 'Auto-capturing from connected sources', 11, C.textDim));

  // Live capture indicator
  card(els, 20, 118, 350, 48, { rx: 12, stroke: C.accent2 + '66', sw: 1 });
  els.push(circle(38, 142, 6, C.accent2, { opacity: 0.9 }));
  els.push(circle(38, 142, 10, C.accent2, { opacity: 0.2 }));
  els.push(text(54, 139, 'LIVE — capturing from Slack, Linear, GitHub', 11, C.text, { fw: 600 }));
  els.push(text(54, 153, '4 sources active · last capture 23s ago', 10, C.textDim));

  // Connected sources
  els.push(text(20, 184, 'CONNECTED SOURCES', 10, C.textDim, { fw: 700, ls: 1.5 }));

  const sources = [
    { icon: '💬', name: 'Slack', detail: '#eng · #backend · #product', count: '247 captures', active: true },
    { icon: '⚡', name: 'Linear', detail: 'Workspace: Engineering', count: '84 captures', active: true },
    { icon: '⬡', name: 'GitHub', detail: 'hyperio-mc/api · hyperio-mc/web', count: '156 captures', active: true },
    { icon: '📄', name: 'Notion', detail: 'Engineering wiki', count: '31 captures', active: false },
    { icon: '🎙', name: 'Meetings', detail: 'Google Meet · Zoom', count: 'Connect →', active: false },
  ];

  sources.forEach((s, i) => {
    const y = 200 + i * 64;
    card(els, 20, y, 350, 56, { rx: 12 });
    els.push(text(40, y + 24, s.icon, 18));
    els.push(text(66, y + 22, s.name, 13, C.text, { fw: 700 }));
    const dotC = s.active ? C.accent2 : C.textDim;
    const dotLabel = s.active ? 'Active' : 'Inactive';
    els.push(circle(320, y + 20, 4, dotC));
    els.push(text(330, y + 23, dotLabel, 9, dotC, { fw: 600 }));
    els.push(text(66, y + 38, s.detail, 10, C.textDim));
    els.push(text(356, y + 38, s.count, 10, s.active ? C.accent : C.accent, { anchor: 'end' }));
    if (i < sources.length - 1) {
      els.push(line(36, y + 56, 354, y + 56, C.line, { sw: 1 }));
    }
  });

  // Today's capture stats
  els.push(text(20, 530, 'TODAY\'S SNAPSHOT', 10, C.textDim, { fw: 700, ls: 1.5 }));
  card(els, 20, 546, 350, 86, { rx: 12 });

  const stats = [
    { label: 'Captures', value: '518' },
    { label: 'Decisions', value: '12' },
    { label: 'Runbooks', value: '3' },
    { label: 'Signals', value: '27' },
  ];
  stats.forEach((s, i) => {
    const x = 50 + i * 78;
    els.push(text(x, 584, s.value, 22, C.accent, { fw: 800, anchor: 'middle' }));
    els.push(text(x, 602, s.label, 10, C.textDim, { anchor: 'middle' }));
  });
  // mini bar charts
  stats.forEach((s, i) => {
    const x = 50 + i * 78;
    const h = [18, 10, 8, 14][i];
    els.push(rect(x - 14, 618, 28, 4, C.line, { rx: 2 }));
    els.push(rect(x - 14, 618, 28, 4, C.accent, { rx: 2, opacity: 0.3 }));
    els.push(rect(x - 14, 618, Math.round(28 * [0.8, 0.6, 0.4, 0.7][i]), 4, C.accent, { rx: 2 }));
  });

  // Knowledge quality
  els.push(text(20, 650, 'KNOWLEDGE QUALITY', 10, C.textDim, { fw: 700, ls: 1.5 }));
  card(els, 20, 666, 350, 100, { rx: 12 });
  const quality = [
    { label: 'Decision coverage', pct: 0.82 },
    { label: 'Runbook completeness', pct: 0.67 },
    { label: 'Context freshness', pct: 0.91 },
  ];
  quality.forEach((q, i) => {
    const y = 684 + i * 26;
    els.push(text(36, y + 10, q.label, 11, C.textMid));
    els.push(text(340, y + 10, `${Math.round(q.pct * 100)}%`, 11, C.accent, { fw: 600, anchor: 'end' }));
    progressBar(els, 36, y + 14, 270, q.pct, i === 2 ? C.accent2 : C.accent);
  });

  navBar(els, 1);
  return { name: 'Capture Sources', elements: els };
}

function buildScreen4() {
  const els = [];
  els.push(rect(0, 0, 390, 844, C.bg));
  statusBar(els);
  topBar(els, 'Graph');
  els.push(text(20, 102, 'Knowledge connection map', 11, C.textDim));

  // Graph visualization area
  card(els, 20, 118, 350, 310, { rx: 14 });

  // Background grid lines
  for (let i = 0; i < 6; i++) {
    els.push(line(20, 170 + i * 44, 370, 170 + i * 44, C.line, { sw: 1, opacity: 0.4 }));
  }
  for (let i = 0; i < 8; i++) {
    els.push(line(20 + i * 50, 118, 20 + i * 50, 428, C.line, { sw: 1, opacity: 0.4 }));
  }

  // Connection lines between nodes
  const nodes = [
    { cx: 195, cy: 268, r: 24, color: C.accent, label: 'Auth\nMigration', main: true },
    { cx: 105, cy: 200, r: 16, color: C.accent2, label: 'Clerk\nSDK', main: false },
    { cx: 285, cy: 195, r: 16, color: C.accent, label: 'JWT\nDeprecation', main: false },
    { cx: 100, cy: 335, r: 14, color: C.accent3, label: 'Session\nCookies', main: false },
    { cx: 290, cy: 340, r: 14, color: C.accent2, label: 'SOC 2\nCompliance', main: false },
    { cx: 195, cy: 398, r: 12, color: C.textDim, label: 'Legacy\nTokens', main: false },
    { cx: 310, cy: 268, r: 10, color: C.accent3, label: 'MFA', main: false },
    { cx: 75, cy: 268, r: 10, color: '#FB923C', label: 'PR\n#847', main: false },
  ];

  // Draw edges first
  const edges = [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[1,3],[2,4],[2,6]];
  edges.forEach(([a, b]) => {
    els.push(line(nodes[a].cx, nodes[a].cy, nodes[b].cx, nodes[b].cy, C.line, { sw: 1.5, opacity: 0.7 }));
  });

  // Glow rings on main node
  els.push(circle(195, 268, 36, C.accent, { opacity: 0.08 }));
  els.push(circle(195, 268, 28, C.accent, { opacity: 0.12 }));

  // Draw nodes
  nodes.forEach(n => {
    els.push(circle(n.cx, n.cy, n.r, n.color, { opacity: n.main ? 0.9 : 0.75 }));
    const labelLines = n.label.split('\n');
    labelLines.forEach((ln, li) => {
      els.push(text(n.cx, n.cy + (li - (labelLines.length - 1) / 2) * 10 + (n.r < 14 ? -n.r - 6 : 3), ln, n.main ? 8 : 7, n.main ? C.bg : C.text, { anchor: 'middle', fw: 700 }));
    });
  });

  // Cluster legend
  els.push(text(34, 440, 'CLUSTERS', 10, C.textDim, { fw: 700, ls: 1.5 }));
  const clusters = [
    { color: C.accent, label: 'Decisions (12)' },
    { color: C.accent2, label: 'Runbooks (8)' },
    { color: C.accent3, label: 'Discussions (27)' },
    { color: '#FB923C', label: 'PRs (14)' },
  ];
  clusters.forEach((c, i) => {
    const x = i < 2 ? 36 : 200;
    const y = 456 + (i % 2) * 22;
    els.push(circle(x + 5, y + 4, 5, c.color));
    els.push(text(x + 16, y + 9, c.label, 10, C.textMid));
  });

  // Top signals in graph
  els.push(text(20, 504, 'MOST CONNECTED', 10, C.textDim, { fw: 700, ls: 1.5 }));
  const connected = [
    { name: 'Auth Migration', links: 8, type: 'DECISION' },
    { name: 'Clerk SDK setup', links: 5, type: 'RUNBOOK' },
    { name: 'JWT Deprecation', links: 5, type: 'DECISION' },
    { name: '#backend-team', links: 4, type: 'SOURCE' },
  ];
  connected.forEach((c, i) => {
    const y = 520 + i * 56;
    card(els, 20, y, 350, 48, { rx: 10 });
    const rank = ['①', '②', '③', '④'][i];
    els.push(text(36, y + 28, rank, 16, C.accent));
    const tc = c.type === 'DECISION' ? C.accent : c.type === 'RUNBOOK' ? C.accent2 : C.textDim;
    tag(els, 60, y + 14, c.type, tc);
    els.push(text(60, y + 38, c.name, 12, C.text, { fw: 600 }));
    els.push(text(356, y + 24, `${c.links} links`, 10, C.textDim, { anchor: 'end' }));
  });

  navBar(els, 2);
  return { name: 'Knowledge Graph', elements: els };
}

function buildScreen5() {
  const els = [];
  els.push(rect(0, 0, 390, 844, C.bg));
  statusBar(els);
  topBar(els, 'Pulse');
  els.push(text(20, 102, 'Team knowledge health', 11, C.textDim));

  // Overall health score
  card(els, 20, 118, 350, 140, { rx: 14, stroke: C.accent + '33', sw: 1 });
  els.push(circle(195, 178, 44, C.surf, { stroke: C.accent + '44', sw: 3 }));
  // Score arc approximation
  for (let i = 0; i < 15; i++) {
    const angle = -Math.PI / 2 + (i / 18) * Math.PI * 2 * 0.78;
    const cx = 195 + Math.cos(angle) * 44;
    const cy = 178 + Math.sin(angle) * 44;
    els.push(circle(cx, cy, 2.5, i < 12 ? C.accent : C.line, { opacity: i < 12 ? 0.9 : 0.3 }));
  }
  els.push(text(195, 172, '84', 26, C.text, { fw: 800, anchor: 'middle' }));
  els.push(text(195, 188, 'Health Score', 9, C.textDim, { anchor: 'middle' }));
  els.push(text(34, 215, 'Knowledge quality up 6% this week', 11, C.accent2));
  els.push(text(34, 231, 'Main gap: API documentation coverage at 43%', 11, C.textDim));

  // Team activity
  els.push(text(20, 272, 'TEAM CONTRIBUTORS', 10, C.textDim, { fw: 700, ls: 1.5 }));
  const team = [
    { name: 'Jordan L.', role: 'Backend', captures: 87, color: C.accent },
    { name: 'Maya K.', role: 'Frontend', captures: 64, color: C.accent2 },
    { name: 'Arjun R.', role: 'Infra', captures: 52, color: C.accent3 },
    { name: 'Priya W.', role: 'Product', captures: 41, color: '#FB923C' },
    { name: 'Sam A.', role: 'Backend', captures: 38, color: '#60A5FA' },
  ];
  team.forEach((m, i) => {
    const y = 288 + i * 52;
    card(els, 20, y, 350, 44, { rx: 10 });
    els.push(circle(44, y + 22, 14, m.color, { opacity: 0.8 }));
    els.push(text(44, y + 26, m.name.split(' ').map(w => w[0]).join(''), 10, C.bg, { anchor: 'middle', fw: 800 }));
    els.push(text(66, y + 18, m.name, 13, C.text, { fw: 600 }));
    els.push(text(66, y + 34, m.role, 10, C.textDim));
    progressBar(els, 140, y + 18, 160, m.captures / 100, m.color);
    els.push(text(356, y + 24, `${m.captures}`, 12, m.color, { fw: 700, anchor: 'end' }));
  });

  // Topic clusters this week
  els.push(text(20, 556, 'HOT TOPICS THIS WEEK', 10, C.textDim, { fw: 700, ls: 1.5 }));
  card(els, 20, 572, 350, 120, { rx: 12 });
  const topics = [
    { label: 'Authentication', pct: 0.88, n: 87 },
    { label: 'API Rate Limits', pct: 0.72, n: 64 },
    { label: 'DB Optimization', pct: 0.61, n: 48 },
    { label: 'CI/CD Pipeline', pct: 0.44, n: 31 },
  ];
  topics.forEach((t, i) => {
    const y = 588 + i * 24;
    els.push(text(36, y + 9, t.label, 11, C.textMid));
    els.push(text(320, y + 9, `${t.n}`, 10, C.accent, { fw: 600, anchor: 'end' }));
    progressBar(els, 36, y + 12, 240, t.pct, i === 0 ? C.accent : i === 1 ? C.accent2 : C.accent + '88');
  });

  // Recent decisions timeline
  els.push(text(20, 704, 'DECISION TIMELINE', 10, C.textDim, { fw: 700, ls: 1.5 }));
  card(els, 20, 720, 350, 56, { rx: 12 });
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const vals = [3, 7, 2, 12, 5, 1, 4];
  const maxV = Math.max(...vals);
  days.forEach((d, i) => {
    const x = 46 + i * 44;
    const barH = Math.round((vals[i] / maxV) * 32);
    els.push(rect(x - 8, 762 - barH, 16, barH, i === 3 ? C.accent : C.accent + '44', { rx: 3 }));
    els.push(text(x, 772, d, 9, i === 3 ? C.accent : C.textDim, { anchor: 'middle' }));
  });

  navBar(els, 3);
  return { name: 'Team Pulse', elements: els };
}

function buildScreen6() {
  const els = [];
  els.push(rect(0, 0, 390, 844, C.bg));
  statusBar(els);
  els.push(rect(0, 44, 390, 56, C.bg));
  els.push(text(195, 78, 'AI Query', 18, C.text, { fw: 700, anchor: 'middle' }));

  // Large search input
  card(els, 20, 108, 350, 52, { rx: 14, stroke: C.accent, sw: 1.5 });
  els.push(text(40, 139, '✦', 14, C.accent));
  els.push(text(62, 138, 'Why did we choose Clerk over Auth0?', 12, C.text));
  els.push(circle(352, 134, 16, C.accent, { opacity: 0.9 }));
  els.push(text(352, 139, '↑', 13, C.bg, { anchor: 'middle', fw: 700 }));

  // AI response card
  card(els, 20, 170, 350, 190, { rx: 14, stroke: C.accent + '33', sw: 1 });
  els.push(circle(36, 190, 8, C.accent, { opacity: 0.2 }));
  els.push(text(36, 194, '✦', 9, C.accent, { anchor: 'middle' }));
  els.push(text(50, 194, 'DEPTH ANSWER', 9, C.accent, { fw: 700, ls: 1 }));
  els.push(text(34, 212, 'Based on 3 decision records and 8 messages', 10, C.textDim));
  els.push(line(34, 222, 356, 222, C.line, { sw: 1 }));

  const answerLines = [
    'Your team chose Clerk over Auth0 primarily for',
    'three reasons captured in the Apr 8 decision:',
    '',
    '1. Clerk\'s built-in MFA meets your SOC 2 Type II',
    '   requirements without additional code.',
    '2. Auth0 pricing would increase ~3× at your scale.',
    '3. Clerk\'s SDK has native Next.js integration,',
    '   reducing migration complexity.',
  ];
  answerLines.forEach((l, i) => {
    if (l) els.push(text(34, 234 + i * 14, l, 11, i < 2 ? C.textMid : C.text));
  });

  // Source citations
  els.push(text(34, 346, 'Sources cited:', 9, C.textDim, { fw: 700 }));
  els.push(text(34, 358, '↗ Auth migration decision (Apr 8)', 9, C.accent));
  els.push(text(34, 370, '↗ #backend-team messages (12)', 9, C.accent));
  els.push(text(200, 358, '↗ Vendor evaluation doc', 9, C.accent));

  // Suggested follow-ups
  els.push(text(20, 378, 'FOLLOW-UP QUESTIONS', 10, C.textDim, { fw: 700, ls: 1.5 }));
  const followups = [
    'What\'s the rollback plan if Clerk fails?',
    'How long is the migration expected to take?',
    'Which engineers are leading this?',
  ];
  followups.forEach((q, i) => {
    card(els, 20, 394 + i * 52, 350, 44, { rx: 10, stroke: C.accent + '22', sw: 1 });
    els.push(text(36, 394 + i * 52 + 26, q, 11, C.text));
    els.push(text(356, 394 + i * 52 + 26, '→', 12, C.accent, { anchor: 'end' }));
  });

  // Recent queries
  els.push(text(20, 554, 'RECENT QUERIES', 10, C.textDim, { fw: 700, ls: 1.5 }));
  const recent = [
    'What did we decide about Redis caching?',
    'Why are we migrating to Kubernetes?',
    'Who owns the payments service?',
  ];
  recent.forEach((q, i) => {
    const y = 570 + i * 50;
    card(els, 20, y, 350, 42, { rx: 10 });
    els.push(text(36, y + 14, '⟳', 12, C.textDim));
    els.push(text(54, y + 25, q, 11, C.textMid));
  });

  // Quick stats
  card(els, 20, 724, 350, 52, { rx: 12 });
  const qstats = [
    { label: 'Total answers', val: '1.2K' },
    { label: 'Avg. confidence', val: '87%' },
    { label: 'Sources cited', val: '4.8' },
  ];
  qstats.forEach((s, i) => {
    const x = 68 + i * 104;
    els.push(text(x, 746, s.val, 18, C.accent, { fw: 800, anchor: 'middle' }));
    els.push(text(x, 762, s.label, 9, C.textDim, { anchor: 'middle' }));
  });

  navBar(els, 0);
  return { name: 'AI Query', elements: els };
}

// ─── Build Pen File ────────────────────────────────────────────────────────────
const screens = [
  buildScreen1(),
  buildScreen2(),
  buildScreen3(),
  buildScreen4(),
  buildScreen5(),
  buildScreen6(),
];

const totalElements = screens.reduce((s, sc) => s + sc.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    tagline: TAGLINE,
    author: 'RAM',
    date: DATE,
    theme: 'dark',
    heartbeat: HEARTBEAT,
    slug: SLUG,
    elements: totalElements,
    palette: C,
  },
  screens: screens.map(sc => ({
    name: sc.name,
    width: 390,
    height: 844,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 844" width="390" height="844">${
      sc.elements.map(el => {
        if (el.type === 'rect') {
          return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${el.rx || 0}" opacity="${el.opacity ?? 1}"${el.stroke && el.stroke !== 'none' ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth}"` : ''}/>`;
        } else if (el.type === 'text') {
          return `<text x="${el.x}" y="${el.y}" font-size="${el.fontSize}" fill="${el.fill}" font-weight="${el.fontWeight}" font-family="${el.fontFamily}" text-anchor="${el.textAnchor}" letter-spacing="${el.letterSpacing}" opacity="${el.opacity ?? 1}">${String(el.content).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}</text>`;
        } else if (el.type === 'circle') {
          return `<circle cx="${el.cx}" cy="${el.cy}" r="${el.r}" fill="${el.fill}" opacity="${el.opacity ?? 1}"${el.stroke && el.stroke !== 'none' ? ` stroke="${el.stroke}" stroke-width="${el.strokeWidth}"` : ''}/>`;
        } else if (el.type === 'line') {
          return `<line x1="${el.x1}" y1="${el.y1}" x2="${el.x2}" y2="${el.y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" opacity="${el.opacity ?? 1}"/>`;
        }
        return '';
      }).join('')
    }</svg>`,
    elements: sc.elements,
  })),
};

const outPath = path.join(__dirname, `${SLUG}.pen`);
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
