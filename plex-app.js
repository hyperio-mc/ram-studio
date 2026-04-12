'use strict';
const fs   = require('fs');
const path = require('path');

// ── Meta ──────────────────────────────────────────────────────────────────────
const SLUG  = 'plex';
const NAME  = 'PLEX';
const THEME = 'dark';
const W = 390, H = 844;

// ── Palette (Dark — Deep Space Navy + Electric Cyan) ─────────────────────────
// Inspired by: DarkModeDesign.com B2B SaaS/Developer palette + Saaspo bento grid layouts
const P = {
  bg:     '#07090F',   // near-black deep space
  surf:   '#0D1220',   // deep navy surface
  card:   '#111827',   // card background
  card2:  '#0F1829',   // alt card
  glass:  '#1A2540',   // glassmorphism card (lighter navy)
  border: '#1E2D4A',   // subtle border
  acc:    '#22D3EE',   // electric cyan (primary)
  acc2:   '#6366F1',   // indigo (secondary)
  acc3:   '#F59E0B',   // amber (warning)
  acc4:   '#10B981',   // emerald (success)
  acc5:   '#EF4444',   // red (danger)
  text:   '#E2E8F0',   // cool white
  sub:    '#94A3B8',   // slate grey
  muted:  '#475569',   // dark muted
  mono:   '#22D3EE',   // monospace text (same as acc)
};

// ── Primitives ─────────────────────────────────────────────────────────────────
function rect(x,y,w,h,fill,opts={}) {
  return { type:'rect', x,y,w,h,fill,
    rx:     opts.rx      ?? 0,
    opacity:opts.opacity ?? 1,
    stroke: opts.stroke  ?? 'none',
    sw:     opts.sw      ?? 0 };
}
function text(x,y,content,size,fill,opts={}) {
  return { type:'text', x,y,content:String(content),size,fill,
    fw:     opts.fw     ?? 400,
    font:   opts.font   ?? 'Inter',
    anchor: opts.anchor ?? 'start',
    ls:     opts.ls     ?? 0,
    opacity:opts.opacity?? 1 };
}
function circle(cx,cy,r,fill,opts={}) {
  return { type:'circle', cx,cy,r,fill,
    opacity:opts.opacity?? 1,
    stroke: opts.stroke ?? 'none',
    sw:     opts.sw     ?? 0 };
}
function line(x1,y1,x2,y2,stroke,opts={}) {
  return { type:'line', x1,y1,x2,y2,stroke,
    sw:     opts.sw     ?? 1,
    opacity:opts.opacity?? 1 };
}

// ── Layout helpers ─────────────────────────────────────────────────────────────
function pill(x, y, w, fill, label, textFill) {
  return [
    rect(x, y, w, 22, fill, { rx: 11, opacity: 0.2 }),
    text(x + w/2, y + 15, label, 10, textFill, { anchor: 'middle', fw: 600 }),
  ];
}

function statusDot(x, y, color) {
  return [
    circle(x, y, 4, color, { opacity: 0.3 }),
    circle(x, y, 2.5, color),
  ];
}

function glowRect(x, y, w, h, fill, glowColor, opts = {}) {
  const el = [];
  // Glow layer
  el.push(rect(x-4, y-4, w+8, h+8, glowColor, { rx: (opts.rx ?? 14) + 4, opacity: 0.06 }));
  el.push(rect(x-2, y-2, w+4, h+4, glowColor, { rx: (opts.rx ?? 14) + 2, opacity: 0.08 }));
  // Card
  el.push(rect(x, y, w, h, fill, { rx: opts.rx ?? 14, stroke: opts.stroke ?? glowColor, sw: opts.sw ?? 0.5, opacity: opts.opacity ?? 1 }));
  return el;
}

function progressBar(x, y, w, pct, color, bgColor = P.glass) {
  return [
    rect(x, y, w, 5, bgColor, { rx: 2.5 }),
    rect(x, y, Math.round(w * pct), 5, color, { rx: 2.5 }),
  ];
}

function sparkLine(x, y, values, color, h = 30) {
  const el = [];
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = 50 / (values.length - 1);
  // Fill area
  values.forEach((v, i) => {
    if (i === 0) return;
    const x1 = x + (i - 1) * step;
    const y1 = y + h - Math.round(((values[i-1] - min) / range) * h);
    const x2 = x + i * step;
    const y2 = y + h - Math.round(((v - min) / range) * h);
    el.push(line(x1, y1, x2, y2, color, { sw: 1.5 }));
  });
  return el;
}

// ── Navigation bar ─────────────────────────────────────────────────────────────
function navBar(el, active = 0) {
  el.push(rect(0, H - 80, W, 80, P.surf, { opacity: 0.95, stroke: P.border, sw: 0.5 }));
  // Nav items
  const items = [
    { label: 'Home',    icon: '⬛' },
    { label: 'Code',    icon: '⬛' },
    { label: 'Team',    icon: '⬛' },
    { label: 'Deploy',  icon: '⬛' },
    { label: 'You',     icon: '⬛' },
  ];
  items.forEach((item, i) => {
    const nx = 39 + i * 78;
    const isAct = i === active;
    if (isAct) {
      el.push(rect(nx - 28, H - 74, 56, 36, P.acc, { rx: 18, opacity: 0.12 }));
    }
    // Icon placeholder (square icon)
    el.push(rect(nx - 9, H - 64, 18, 18, isAct ? P.acc : P.muted, { rx: 4, opacity: isAct ? 0.9 : 0.5 }));
    el.push(rect(nx - 6, H - 61, 5, 5, P.surf, { rx: 1 }));
    el.push(rect(nx + 1, H - 61, 5, 5, P.surf, { rx: 1 }));
    el.push(rect(nx - 6, H - 54, 12, 5, P.surf, { rx: 1 }));
    el.push(text(nx, H - 40, item.label, 9, isAct ? P.acc : P.muted, { anchor: 'middle', fw: isAct ? 600 : 400 }));
  });
}

// ── Status bar ─────────────────────────────────────────────────────────────────
function statusBar(el) {
  el.push(rect(0, 0, W, 44, P.bg));
  el.push(text(16, 29, '9:41', 14, P.text, { fw: 600 }));
  // Signal bars
  [3,5,7,9].forEach((h,i) => {
    el.push(rect(330 + i*8, 24 - h, 5, h, i < 3 ? P.acc : P.muted, { rx: 1.5, opacity: i < 3 ? 0.9 : 0.4 }));
  });
  el.push(rect(360, 18, 20, 10, P.muted, { rx: 2.5, opacity: 0.4 }));
  el.push(rect(362, 20, 12, 6, P.acc, { rx: 1.5, opacity: 0.7 }));
  el.push(rect(380, 21, 2, 4, P.muted, { rx: 1, opacity: 0.4 }));
}

// ── Bento card helper ──────────────────────────────────────────────────────────
function bentoCard(el, x, y, w, h, accent, content) {
  // Outer glow
  el.push(rect(x-3, y-3, w+6, h+6, accent, { rx: 17, opacity: 0.05 }));
  // Card background
  el.push(rect(x, y, w, h, P.glass, { rx: 14, stroke: P.border, sw: 0.5 }));
  // Top accent line
  el.push(rect(x + 12, y, 32, 2.5, accent, { rx: 1.25, opacity: 0.8 }));
  // Content callback
  content(el, x, y, w, h);
}

// ════════════════════════════════════════════════════════════════════
// SCREEN 1 — Dashboard (Bento Grid)
// ════════════════════════════════════════════════════════════════════
function screen1() {
  const el = [];
  el.push(rect(0, 0, W, H, P.bg));

  // Ambient glow behind main metric
  el.push(circle(195, 200, 120, P.acc, { opacity: 0.04 }));
  el.push(circle(195, 200, 80, P.acc, { opacity: 0.04 }));

  statusBar(el);

  // Header
  el.push(text(16, 66, 'Good morning,', 13, P.sub, { fw: 400 }));
  el.push(text(16, 84, 'Alex', 22, P.text, { fw: 700 }));
  // PLEX logo (top right)
  el.push(rect(344, 54, 30, 30, P.acc, { rx: 8, opacity: 0.12 }));
  el.push(text(350, 74, 'PX', 13, P.acc, { fw: 800, ls: -0.5 }));

  // ── Bento Row 1: Big metric card (full width) ──────────────────────
  bentoCard(el, 16, 98, 358, 100, P.acc, (el, x, y) => {
    el.push(text(x+14, y+22, 'Deployment Health', 11, P.sub, { fw: 500 }));
    // Big number
    el.push(text(x+14, y+62, '98.4%', 36, P.acc, { fw: 800, font: 'monospace' }));
    el.push(text(x+14, y+82, 'uptime this week', 11, P.sub));
    // Sparkline on right
    const vals = [72,85,79,91,88,95,98];
    sparkLine(x + 258, y + 52, vals, P.acc).forEach(e => el.push(e));
    // Status pill
    pill(x + 258, y + 16, 84, P.acc4, '● All systems go', P.acc4).forEach(e => el.push(e));
  });

  // ── Bento Row 2: Two half-width cards ─────────────────────────────
  // Card A — PRs
  bentoCard(el, 16, 210, 170, 110, P.acc2, (el, x, y) => {
    el.push(text(x+12, y+22, 'Open PRs', 10, P.sub, { fw: 500 }));
    el.push(text(x+12, y+58, '23', 32, P.text, { fw: 800, font: 'monospace' }));
    el.push(text(x+12, y+76, 'pull requests', 9, P.muted));
    // Pie-like arc indicator
    el.push(circle(x+132, y+52, 22, P.card2));
    el.push(circle(x+132, y+52, 22, P.acc2, { opacity: 0.2 }));
    el.push(text(x+132, y+57, '23', 11, P.acc2, { anchor: 'middle', fw: 700 }));
    // Small status row
    el.push(rect(x+12, y+86, 8, 8, P.acc4, { rx: 2, opacity: 0.8 }));
    el.push(text(x+24, y+94, '14 ready', 9, P.sub));
    el.push(rect(x+80, y+86, 8, 8, P.acc3, { rx: 2, opacity: 0.8 }));
    el.push(text(x+92, y+94, '9 review', 9, P.sub));
  });

  // Card B — CI/CD
  bentoCard(el, 200, 210, 174, 110, P.acc3, (el, x, y) => {
    el.push(text(x+12, y+22, 'CI/CD Runs', 10, P.sub, { fw: 500 }));
    el.push(text(x+12, y+58, '142', 32, P.text, { fw: 800, font: 'monospace' }));
    el.push(text(x+12, y+76, 'runs today', 9, P.muted));
    // Mini bar chart
    const bars = [40, 70, 55, 90, 45, 85, 65, 95];
    bars.forEach((h, i) => {
      const bh = Math.round(h * 0.28);
      el.push(rect(x + 12 + i * 18, y + 96 - bh, 10, bh, i === 7 ? P.acc3 : P.acc3, { rx: 2, opacity: i === 7 ? 0.9 : 0.35 }));
    });
  });

  // ── Bento Row 3: Team + Code Quality ──────────────────────────────
  // Card C — Team online
  bentoCard(el, 16, 332, 170, 96, P.acc4, (el, x, y) => {
    el.push(text(x+12, y+22, 'Team Online', 10, P.sub, { fw: 500 }));
    // Avatar stack
    const cols = [P.acc, P.acc2, P.acc3, P.acc4, P.muted];
    const initials = ['AK','BL','CC','DM','+3'];
    cols.forEach((c, i) => {
      const ax = x + 12 + i * 26;
      el.push(circle(ax, y+56, 14, P.card2));
      el.push(circle(ax, y+56, 13, c, { opacity: 0.25 }));
      el.push(text(ax, y+60, initials[i], 8, c, { anchor: 'middle', fw: 700 }));
    });
    el.push(text(x+12, y+80, '5 of 12 active', 9, P.sub));
    [...statusDot(x+100, y+82, P.acc4)].forEach(e => el.push(e));
  });

  // Card D — Code Quality
  bentoCard(el, 200, 332, 174, 96, P.acc, (el, x, y) => {
    el.push(text(x+12, y+22, 'Code Quality', 10, P.sub, { fw: 500 }));
    // Quality ring (simulated with concentric circles)
    el.push(circle(x+126, y+56, 28, P.card2));
    el.push(circle(x+126, y+56, 28, P.acc, { opacity: 0.15, stroke: P.acc, sw: 3 }));
    el.push(text(x+126, y+53, 'A+', 16, P.acc, { anchor: 'middle', fw: 800 }));
    el.push(text(x+126, y+66, 'score', 8, P.sub, { anchor: 'middle' }));
    // Mini metrics left
    el.push(text(x+12, y+46, '3.2%', 16, P.acc4, { fw: 700 }));
    el.push(text(x+12, y+60, 'coverage △', 9, P.sub));
    el.push(text(x+12, y+78, '0 critical', 11, P.text, { fw: 600 }));
  });

  // ── Bento Row 4: Activity feed preview (tall card) ───────────────
  bentoCard(el, 16, 440, 358, 100, P.acc2, (el, x, y) => {
    el.push(text(x+14, y+22, 'Recent Activity', 10, P.sub, { fw: 500 }));
    const events = [
      { col: P.acc4, label: 'merge', text: 'feat/auth-v2 → main', who: 'blee', time: '2m' },
      { col: P.acc3, label: 'build', text: 'api-gateway pipeline running', who: 'CI', time: '5m' },
      { col: P.acc5, label: 'alert', text: 'CPU spike on prod-02', who: 'Mon', time: '8m' },
    ];
    events.forEach((ev, i) => {
      const ey = y + 38 + i * 22;
      [...statusDot(x+16, ey+3, ev.col)].forEach(e => el.push(e));
      el.push(text(x+28, ey+7, ev.text, 10, P.text, { fw: 400 }));
      el.push(text(x+286, ey+7, ev.time, 9, P.sub, { anchor: 'end' }));
    });
  });

  navBar(el, 0);
  return el;
}

// ════════════════════════════════════════════════════════════════════
// SCREEN 2 — Pull Requests
// ════════════════════════════════════════════════════════════════════
function screen2() {
  const el = [];
  el.push(rect(0, 0, W, H, P.bg));
  el.push(circle(80, 350, 200, P.acc2, { opacity: 0.03 }));

  statusBar(el);

  // Header
  el.push(text(16, 68, 'Pull Requests', 20, P.text, { fw: 700 }));
  el.push(text(16, 85, '23 open · 4 need your review', 11, P.sub));

  // Filter tabs
  const tabs = ['All', 'Yours', 'Review', 'Draft'];
  tabs.forEach((t, i) => {
    const tx = 16 + i * 88;
    const active = i === 0;
    el.push(rect(tx, 96, 80, 26, active ? P.acc : P.glass, { rx: 13, opacity: active ? 0.15 : 1 }));
    el.push(text(tx + 40, 113, t, 11, active ? P.acc : P.sub, { anchor: 'middle', fw: active ? 600 : 400 }));
  });

  // PR list items
  const prs = [
    { title: 'feat: OAuth2 refresh token flow', branch: 'feat/auth-v2', who: 'AK', status: 'ready', checks: 'pass', comments: 3, additions: 284, deletions: 12, col: P.acc4 },
    { title: 'fix: race condition in job queue', branch: 'fix/queue-race', who: 'BL', status: 'review', checks: 'pass', comments: 7, additions: 45, deletions: 38, col: P.acc2 },
    { title: 'refactor: migrate to Bun runtime', branch: 'refactor/bun', who: 'CC', status: 'draft', checks: 'run', comments: 1, additions: 1240, deletions: 980, col: P.muted },
    { title: 'chore: update deps & security patch', branch: 'chore/deps', who: 'Bot', status: 'ready', checks: 'pass', comments: 0, additions: 18, deletions: 5, col: P.acc3 },
    { title: 'feat: real-time bento dashboard v2', branch: 'feat/dashboard', who: 'DM', status: 'review', checks: 'fail', comments: 12, additions: 892, deletions: 234, col: P.acc },
  ];

  prs.forEach((pr, i) => {
    const py = 136 + i * 108;
    // Card
    el.push(rect(16, py, 358, 100, P.glass, { rx: 14, stroke: P.border, sw: 0.5 }));
    el.push(rect(16, py, 3, 100, pr.col, { rx: 1.5, opacity: 0.7 }));

    // Title
    el.push(text(30, py+18, pr.title, 12, P.text, { fw: 600 }));
    // Branch (monospace)
    el.push(text(30, py+34, pr.branch, 10, P.sub, { font: 'monospace' }));

    // Author avatar
    el.push(circle(342, py+22, 14, P.card2));
    el.push(circle(342, py+22, 13, pr.col, { opacity: 0.2 }));
    el.push(text(342, py+26, pr.who, 8, pr.col, { anchor: 'middle', fw: 700 }));

    // Status badges
    const statusColors = { ready: P.acc4, review: P.acc2, draft: P.muted };
    const checkColors = { pass: P.acc4, run: P.acc3, fail: P.acc5 };
    const sc = statusColors[pr.status] || P.muted;
    const cc = checkColors[pr.checks] || P.muted;

    pill(30, py+46, 60, sc, pr.status, sc).forEach(e => el.push(e));
    pill(96, py+46, 50, cc, pr.checks, cc).forEach(e => el.push(e));

    // Stats
    el.push(text(30, py+82, `+${pr.additions}`, 10, P.acc4, { fw: 600, font: 'monospace' }));
    el.push(text(70, py+82, `-${pr.deletions}`, 10, P.acc5, { fw: 600, font: 'monospace' }));
    el.push(text(115, py+82, `💬 ${pr.comments}`, 10, P.sub));

    // Merge button (if ready)
    if (pr.status === 'ready') {
      el.push(rect(266, py+68, 80, 24, P.acc, { rx: 12, opacity: 0.15 }));
      el.push(text(306, py+83, 'Merge ↑', 10, P.acc, { anchor: 'middle', fw: 600 }));
    }
  });

  navBar(el, 1);
  return el;
}

// ════════════════════════════════════════════════════════════════════
// SCREEN 3 — Team Activity
// ════════════════════════════════════════════════════════════════════
function screen3() {
  const el = [];
  el.push(rect(0, 0, W, H, P.bg));
  el.push(circle(320, 180, 160, P.acc2, { opacity: 0.04 }));

  statusBar(el);

  // Header
  el.push(text(16, 68, 'Team', 20, P.text, { fw: 700 }));
  el.push(text(16, 85, '5 active · 7 offline', 11, P.sub));

  // Search bar
  el.push(rect(16, 96, 282, 36, P.glass, { rx: 18, stroke: P.border, sw: 0.5 }));
  el.push(text(36, 118, '🔍  Search teammates...', 12, P.muted));
  el.push(rect(306, 96, 68, 36, P.acc, { rx: 18, opacity: 0.12 }));
  el.push(text(340, 118, 'Filter', 11, P.acc, { anchor: 'middle', fw: 600 }));

  // Team members with presence + activity bars
  const members = [
    { name: 'Alex Kim', role: 'Lead Eng', status: 'online', col: P.acc, tasks: 4, prs: 2, commits: 12, active: true },
    { name: 'Bea Lee', role: 'Backend', status: 'online', col: P.acc2, tasks: 3, prs: 3, commits: 8, active: true },
    { name: 'Carlos Cruz', role: 'Frontend', status: 'online', col: P.acc3, tasks: 6, prs: 1, commits: 5, active: true },
    { name: 'Dana Moon', role: 'DevOps', status: 'online', col: P.acc4, tasks: 2, prs: 0, commits: 18, active: true },
    { name: 'Erik Sato', role: 'Security', status: 'online', col: P.acc5, tasks: 1, prs: 2, commits: 3, active: true },
    { name: 'Fiona Ramos', role: 'QA', status: 'away', col: P.muted, tasks: 5, prs: 0, commits: 0, active: false },
    { name: 'Gus Werner', role: 'Full Stack', status: 'offline', col: P.muted, tasks: 2, prs: 1, commits: 2, active: false },
  ];

  members.forEach((m, i) => {
    if (i >= 6) return; // fit in screen
    const my = 146 + i * 98;
    // Member card
    el.push(rect(16, my, 358, 86, P.glass, { rx: 12, stroke: P.border, sw: 0.5 }));

    // Avatar
    el.push(circle(46, my+28, 20, P.card2));
    el.push(circle(46, my+28, 19, m.col, { opacity: 0.2 }));
    el.push(text(46, my+33, m.name.split(' ').map(n=>n[0]).join(''), 12, m.col, { anchor: 'middle', fw: 700 }));

    // Presence dot
    el.push(circle(59, my+43, 6, P.bg));
    el.push(circle(59, my+43, 4.5, m.active ? P.acc4 : m.status === 'away' ? P.acc3 : P.muted));

    // Name + role
    el.push(text(76, my+23, m.name, 13, P.text, { fw: 600 }));
    el.push(text(76, my+37, m.role, 10, P.sub));

    // Status badge
    pill(76, my+44, 55, m.active ? P.acc4 : P.muted, '● ' + m.status, m.active ? P.acc4 : P.muted).forEach(e => el.push(e));

    // Metrics row
    const metrics = [
      { label: 'Tasks', val: m.tasks },
      { label: 'PRs', val: m.prs },
      { label: 'Commits', val: m.commits },
    ];
    metrics.forEach((met, j) => {
      const mx = 200 + j * 58;
      el.push(text(mx, my+26, String(met.val), 16, m.col, { anchor: 'middle', fw: 700, font: 'monospace' }));
      el.push(text(mx, my+40, met.label, 9, P.sub, { anchor: 'middle' }));
    });

    // Activity bar (commit frequency visualization)
    const actW = 140;
    el.push(rect(200, my+54, actW, 4, P.card2, { rx: 2 }));
    el.push(rect(200, my+54, Math.round(actW * (m.commits / 20)), 4, m.col, { rx: 2, opacity: 0.7 }));
  });

  navBar(el, 2);
  return el;
}

// ════════════════════════════════════════════════════════════════════
// SCREEN 4 — Code Quality Dashboard
// ════════════════════════════════════════════════════════════════════
function screen4() {
  const el = [];
  el.push(rect(0, 0, W, H, P.bg));
  el.push(circle(195, 300, 220, P.acc, { opacity: 0.03 }));

  statusBar(el);

  // Header
  el.push(text(16, 68, 'Code Quality', 20, P.text, { fw: 700 }));
  el.push(text(16, 85, 'main · last analyzed 4m ago', 11, P.sub, { font: 'monospace' }));

  // Big quality score card
  el.push(...glowRect(16, 98, 358, 130, P.glass, P.acc));
  el.push(text(44, 128, 'Overall Score', 12, P.sub, { fw: 500 }));
  el.push(text(44, 172, 'A+', 52, P.acc, { fw: 900, font: 'monospace' }));
  el.push(text(44, 194, '94 / 100 quality index', 11, P.sub));
  // Trend arrow
  el.push(text(310, 140, '↑', 28, P.acc4, { anchor: 'middle', fw: 700 }));
  el.push(text(310, 160, '+2.4', 14, P.acc4, { anchor: 'middle', fw: 600 }));
  el.push(text(310, 176, 'vs last wk', 9, P.sub, { anchor: 'middle' }));
  // Sparkline
  sparkLine(195, 170, [78,82,79,85,88,91,94], P.acc).forEach(e => el.push(e));

  // Category scores
  const cats = [
    { name: 'Test Coverage', pct: 0.87, val: '87%', col: P.acc4 },
    { name: 'Maintainability', pct: 0.91, val: '91%', col: P.acc },
    { name: 'Security Score', pct: 0.96, val: '96%', col: P.acc2 },
    { name: 'Performance', pct: 0.78, val: '78%', col: P.acc3 },
    { name: 'Duplication', pct: 0.94, val: '94%', col: P.acc },
  ];

  cats.forEach((c, i) => {
    const cy = 248 + i * 68;
    el.push(rect(16, cy, 358, 56, P.glass, { rx: 12, stroke: P.border, sw: 0.5 }));
    el.push(text(30, cy+18, c.name, 12, P.text, { fw: 500 }));
    el.push(text(340, cy+18, c.val, 13, c.col, { anchor: 'end', fw: 700, font: 'monospace' }));
    progressBar(30, cy+30, 298, c.pct, c.col).forEach(e => el.push(e));
    // Threshold marker at 80%
    el.push(line(30 + 238, cy+26, 30 + 238, cy+40, P.muted, { sw: 1, opacity: 0.5 }));
  });

  // Issues summary
  el.push(rect(16, 598, 358, 64, P.glass, { rx: 12, stroke: P.border, sw: 0.5 }));
  el.push(text(30, 620, 'Open Issues', 11, P.sub, { fw: 500 }));
  const issues = [
    { col: P.acc5, label: 'Critical', val: '0' },
    { col: P.acc3, label: 'Major', val: '3' },
    { col: P.acc2, label: 'Minor', val: '12' },
    { col: P.muted, label: 'Info', val: '47' },
  ];
  issues.forEach((iss, i) => {
    const ix = 30 + i * 84;
    el.push(rect(ix, 630, 70, 26, iss.col, { rx: 8, opacity: 0.1 }));
    el.push(text(ix + 10, 647, iss.val, 13, iss.col, { fw: 800, font: 'monospace' }));
    el.push(text(ix + 28, 647, iss.label, 9, iss.col, { fw: 500 }));
  });

  navBar(el, 1);
  return el;
}

// ════════════════════════════════════════════════════════════════════
// SCREEN 5 — Deployments
// ════════════════════════════════════════════════════════════════════
function screen5() {
  const el = [];
  el.push(rect(0, 0, W, H, P.bg));
  el.push(circle(340, 500, 180, P.acc4, { opacity: 0.03 }));

  statusBar(el);

  // Header
  el.push(text(16, 68, 'Deployments', 20, P.text, { fw: 700 }));
  el.push(text(16, 85, 'prod · staging · preview', 11, P.sub, { font: 'monospace' }));

  // Environment tabs
  const envs = ['Production', 'Staging', 'Preview'];
  envs.forEach((e, i) => {
    const ex = 16 + i * 122;
    const active = i === 0;
    el.push(rect(ex, 96, 116, 28, active ? P.acc : P.glass, { rx: 14, opacity: active ? 0.15 : 1 }));
    el.push(text(ex + 58, 113, e, 11, active ? P.acc : P.sub, { anchor: 'middle', fw: active ? 600 : 400 }));
  });

  // Active deployment banner
  el.push(...glowRect(16, 136, 358, 80, P.glass, P.acc4));
  el.push(text(30, 158, '🟢  Production · v2.14.3', 13, P.acc4, { fw: 600, font: 'monospace' }));
  el.push(text(30, 176, 'Deployed 2 hours ago by Alex Kim', 11, P.sub));
  el.push(text(30, 196, '100% traffic · p99 42ms · 0 errors', 11, P.text, { font: 'monospace', fw: 500 }));
  pill(284, 140, 72, P.acc4, '● Live', P.acc4).forEach(e => el.push(e));

  // Deploy history
  el.push(text(16, 234, 'History', 12, P.sub, { fw: 600 }));

  const deploys = [
    { ver: 'v2.14.3', env: 'prod', who: 'AK', time: '2h ago', status: 'live', dur: '3m12s', col: P.acc4 },
    { ver: 'v2.14.2', env: 'prod', who: 'BL', time: '1d ago', status: 'rolled back', dur: '—', col: P.acc5 },
    { ver: 'v2.14.1', env: 'prod', who: 'CC', time: '2d ago', status: 'success', dur: '2m58s', col: P.acc4 },
    { ver: 'v2.14.0', env: 'prod', who: 'DM', time: '4d ago', status: 'success', dur: '3m04s', col: P.acc4 },
    { ver: 'v2.13.9', env: 'prod', who: 'AK', time: '5d ago', status: 'success', dur: '3m21s', col: P.acc4 },
  ];

  // Timeline line
  el.push(line(36, 254, 36, 620, P.border, { sw: 1.5 }));

  deploys.forEach((d, i) => {
    const dy = 254 + i * 76;
    // Timeline node
    el.push(circle(36, dy + 20, 7, P.bg));
    el.push(circle(36, dy + 20, 6, d.col, { opacity: 0.3 }));
    el.push(circle(36, dy + 20, 3.5, d.col));

    // Deploy card
    el.push(rect(56, dy, 318, 64, P.glass, { rx: 12, stroke: P.border, sw: 0.5 }));
    el.push(text(70, dy+18, d.ver, 13, P.text, { fw: 700, font: 'monospace' }));
    pill(70, dy+26, 70, d.col, d.status, d.col).forEach(e => el.push(e));
    el.push(text(348, dy+18, d.time, 10, P.sub, { anchor: 'end' }));
    el.push(text(70, dy+52, `by ${d.who}  ·  ⏱ ${d.dur}`, 10, P.sub, { font: 'monospace' }));
    // Rollback/diff link
    if (d.status !== 'live') {
      el.push(text(336, dy+52, 'diff →', 10, P.acc, { anchor: 'end', fw: 500 }));
    }
  });

  navBar(el, 3);
  return el;
}

// ════════════════════════════════════════════════════════════════════
// SCREEN 6 — Settings / Profile
// ════════════════════════════════════════════════════════════════════
function screen6() {
  const el = [];
  el.push(rect(0, 0, W, H, P.bg));

  statusBar(el);

  // Profile card
  el.push(...glowRect(16, 58, 358, 110, P.glass, P.acc));
  // Avatar
  el.push(circle(66, 113, 34, P.card2));
  el.push(circle(66, 113, 32, P.acc, { opacity: 0.2 }));
  el.push(text(66, 119, 'AK', 18, P.acc, { anchor: 'middle', fw: 800 }));
  // Online indicator
  el.push(circle(84, 133, 7, P.bg));
  el.push(circle(84, 133, 5.5, P.acc4));

  el.push(text(114, 94, 'Alex Kim', 18, P.text, { fw: 700 }));
  el.push(text(114, 110, 'Lead Engineer', 12, P.sub));
  el.push(text(114, 126, '@alexkim · github.com/alexkim', 10, P.sub, { font: 'monospace' }));
  el.push(text(114, 148, 'hyperio.team', 10, P.acc, { font: 'monospace' }));

  // Stats row
  el.push(rect(16, 180, 358, 58, P.glass, { rx: 12, stroke: P.border, sw: 0.5 }));
  const stats = [
    { val: '284', label: 'Commits' },
    { val: '47', label: 'PRs merged' },
    { val: '12', label: 'Repos' },
    { val: '98d', label: 'Streak' },
  ];
  stats.forEach((s, i) => {
    const sx = 44 + i * 84;
    el.push(text(sx, 202, s.val, 18, P.text, { anchor: 'middle', fw: 700, font: 'monospace' }));
    el.push(text(sx, 218, s.label, 9, P.sub, { anchor: 'middle' }));
    if (i < 3) el.push(line(sx + 42, 192, sx + 42, 228, P.border, { sw: 0.5 }));
  });

  // Settings sections
  const sections = [
    {
      title: 'Workspace',
      items: [
        { label: 'Notifications', val: 'Slack + Email', col: P.acc2 },
        { label: 'Default branch', val: 'main', col: P.acc },
        { label: 'Review mode', val: 'Required 2', col: P.acc3 },
      ],
    },
    {
      title: 'Integrations',
      items: [
        { label: 'GitHub', val: '● Connected', col: P.acc4 },
        { label: 'Linear', val: '● Connected', col: P.acc4 },
        { label: 'Sentry', val: '○ Disconnected', col: P.muted },
      ],
    },
    {
      title: 'Theme & Display',
      items: [
        { label: 'Color scheme', val: 'Deep Space (Dark)', col: P.acc },
        { label: 'Accent color', val: 'Cyan #22D3EE', col: P.acc },
      ],
    },
  ];

  let sy = 250;
  sections.forEach(sec => {
    el.push(text(16, sy, sec.title, 11, P.sub, { fw: 600, ls: 0.5 }));
    sy += 14;
    el.push(rect(16, sy, 358, sec.items.length * 46 + 4, P.glass, { rx: 12, stroke: P.border, sw: 0.5 }));
    sec.items.forEach((item, j) => {
      const iy = sy + 14 + j * 46;
      el.push(text(30, iy + 8, item.label, 13, P.text, { fw: 500 }));
      el.push(text(350, iy + 8, item.val, 11, item.col, { anchor: 'end', font: 'monospace' }));
      el.push(rect(30, iy + 18, 310, 5, item.col, { rx: 2.5, opacity: 0.06 }));
      if (j < sec.items.length - 1) {
        el.push(line(30, iy + 22, 360, iy + 22, P.border, { sw: 0.5 }));
      }
    });
    sy += sec.items.length * 46 + 20;
  });

  navBar(el, 4);
  return el;
}

// ── Assemble pen ───────────────────────────────────────────────────────────────
const screens = [
  { name: 'Dashboard',    elements: screen1() },
  { name: 'Pull Requests',elements: screen2() },
  { name: 'Team',         elements: screen3() },
  { name: 'Code Quality', elements: screen4() },
  { name: 'Deployments',  elements: screen5() },
  { name: 'Settings',     elements: screen6() },
];

const totalElements = screens.reduce((s, sc) => s + sc.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name:       NAME,
    author:     'RAM',
    date:       new Date().toISOString().split('T')[0],
    theme:      THEME,
    heartbeat:  true,
    tagline:    'Developer team intelligence',
    archetype:  'developer-tooling',
    elements:   totalElements,
    inspiration:'DarkModeDesign.com (B2B SaaS palette: Deep Navy + Cyan) × Saaspo bento grid layouts',
  },
  screens: screens.map(sc => ({
    name:     sc.name,
    svg:      `<!-- ${sc.name} screen — ${sc.elements.length} elements -->`,
    elements: sc.elements,
  })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalElements} elements`);
console.log(`Written: ${SLUG}.pen`);
