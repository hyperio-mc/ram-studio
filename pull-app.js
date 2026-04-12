'use strict';
// PULL — AI-Powered Code Review Dashboard
// Heartbeat #100 | Theme: DARK
// Inspired by: darkmodedesign.com (Linear's dark + elevation via shade steps)
//              saaspo.com (bento grid layouts, AI SaaS aurora gradient aesthetic)

const fs   = require('fs');
const path = require('path');

const SLUG    = 'pull';
const NAME    = 'PULL';
const TAGLINE = 'AI code review, at team velocity';
const THEME   = 'dark';
const HB      = 100;

// Palette — Deep slate, electric blue + violet accents
const C = {
  bg:      '#0B0D12',
  surface: '#111520',
  card:    '#181D2C',
  card2:   '#1E2436',
  acc:     '#4F9EFF',
  acc2:    '#8B5CF6',
  acc3:    '#34D399',
  text:    '#E2E8F8',
  textDim: '#8899BB',
  muted:   'rgba(226,232,248,0.35)',
  border:  'rgba(226,232,248,0.08)',
  red:     '#F87171',
  orange:  '#FB923C',
  W: 390,
  H: 844,
};

// ── Primitives ────────────────────────────────────────────────────────────────

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
    type: 'text', x, y, content, fontSize: size, fill,
    fontWeight: opts.fw ?? 400,
    fontFamily: opts.font ?? 'Inter, system-ui, sans-serif',
    textAnchor: opts.anchor ?? 'start',
    letterSpacing: opts.ls ?? '-0.01em',
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

// ── SVG Renderer ──────────────────────────────────────────────────────────────

function toSVG(els, w = 390, h = 844) {
  const toEl = e => {
    switch (e.type) {
      case 'rect':
        return `<rect x="${e.x}" y="${e.y}" width="${e.width}" height="${e.height}" fill="${e.fill}" rx="${e.rx}" opacity="${e.opacity}" stroke="${e.stroke}" stroke-width="${e.strokeWidth}"/>`;
      case 'text':
        return `<text x="${e.x}" y="${e.y}" font-size="${e.fontSize}" fill="${e.fill}" font-weight="${e.fontWeight}" font-family="${e.fontFamily}" text-anchor="${e.textAnchor}" letter-spacing="${e.letterSpacing}" opacity="${e.opacity}">${e.content}</text>`;
      case 'circle':
        return `<circle cx="${e.cx}" cy="${e.cy}" r="${e.r}" fill="${e.fill}" opacity="${e.opacity}" stroke="${e.stroke}" stroke-width="${e.strokeWidth}"/>`;
      case 'line':
        return `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${e.stroke}" stroke-width="${e.strokeWidth}" opacity="${e.opacity}"/>`;
      default: return '';
    }
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n${els.map(toEl).join('\n')}\n</svg>`;
}

// ── Shared Components ─────────────────────────────────────────────────────────

function statusBar(els) {
  els.push(rect(0, 0, C.W, 44, C.bg));
  els.push(text(20, 28, '9:41', 13, C.text, { fw: 500 }));
  els.push(text(370, 28, '●●●', 11, C.textDim, { anchor: 'end' }));
}

function topNav(els, title, showBack = false) {
  els.push(rect(0, 44, C.W, 52, C.bg));
  if (showBack) {
    els.push(text(20, 76, '‹', 22, C.acc, { fw: 300 }));
    els.push(text(44, 77, title, 16, C.text, { fw: 600, ls: '-0.02em' }));
  } else {
    els.push(text(20, 78, title, 17, C.text, { fw: 700, ls: '-0.03em' }));
  }
  // aurora glow behind nav
  els.push(circle(195, 70, 100, C.acc2, { opacity: 0.04 }));
}

function bottomNav(els, active = 0) {
  const items = [
    { label: 'Home', icon: '⌘' },
    { label: 'PRs', icon: '⇄' },
    { label: 'Reviews', icon: '◈' },
    { label: 'Team', icon: '◎' },
  ];
  els.push(rect(0, 788, C.W, 56, C.surface));
  els.push(line(0, 788, C.W, 788, C.border, { sw: 1 }));
  items.forEach((item, i) => {
    const x = 48 + i * 74;
    const isActive = i === active;
    els.push(text(x, 810, item.icon, 18, isActive ? C.acc : C.textDim, { anchor: 'middle', fw: isActive ? 600 : 400 }));
    els.push(text(x, 828, item.label, 9, isActive ? C.acc : C.textDim, { anchor: 'middle', ls: '0.03em' }));
    if (isActive) {
      els.push(rect(x - 16, 786, 32, 2, C.acc, { rx: 1 }));
    }
  });
  els.push(rect(160, 838, 70, 4, C.textDim, { rx: 2, opacity: 0.3 }));
}

function divider(els, y) {
  els.push(line(20, y, C.W - 20, y, C.border, { sw: 1 }));
}

// ── Screen 1: Dashboard ───────────────────────────────────────────────────────
// Bento grid layout inspired by saaspo.com feature sections

function screen1() {
  const els = [];
  els.push(rect(0, 0, C.W, C.H, C.bg));

  // Aurora glow — top right
  els.push(circle(320, 160, 180, C.acc2, { opacity: 0.06 }));
  els.push(circle(80, 300, 120, C.acc, { opacity: 0.04 }));

  statusBar(els);
  topNav(els, 'PULL');

  // Repo selector pill
  els.push(rect(20, 104, 180, 28, C.card2, { rx: 14 }));
  els.push(text(32, 122, '◈  hyperio-mc / core', 11, C.textDim, { fw: 500 }));
  els.push(text(200, 122, '⌄', 12, C.acc, { fw: 500 }));

  // AI scan badge
  els.push(rect(220, 104, 150, 28, C.acc, { rx: 14, opacity: 0.15 }));
  els.push(text(310, 122, 'AI Active ◉', 10, C.acc, { fw: 600, anchor: 'middle' }));

  // ── BENTO GRID ─────────────────────────────
  // Row 1: Two wide stat cards
  // Open PRs card
  els.push(rect(20, 144, 170, 110, C.card, { rx: 12 }));
  els.push(rect(20, 144, 170, 110, C.acc, { rx: 12, opacity: 0.06 }));
  els.push(text(36, 170, 'Open PRs', 11, C.textDim, { fw: 500, ls: '0.02em' }));
  els.push(text(36, 208, '23', 38, C.text, { fw: 700, ls: '-0.03em' }));
  els.push(text(75, 208, '+4', 14, C.acc3, { fw: 600 }));
  els.push(text(36, 234, '↑ 3 since yesterday', 10, C.acc3, { fw: 500 }));
  // Sparkline
  const sparkOpen = [100, 85, 110, 95, 115, 90, 108, 120, 105, 115, 98, 108, 115, 110, 108, 112];
  sparkOpen.forEach((v, i) => {
    if (i > 0) {
      const x1 = 36 + (i-1) * 8;
      const y1 = 250 - ((sparkOpen[i-1] - 80) / 40) * 12;
      const x2 = 36 + i * 8;
      const y2 = 250 - ((v - 80) / 40) * 12;
      els.push(line(x1, y1, x2, y2, C.acc, { sw: 1.5, opacity: 0.6 }));
    }
  });

  // Review Coverage card
  els.push(rect(200, 144, 170, 110, C.card, { rx: 12 }));
  els.push(rect(200, 144, 170, 110, C.acc2, { rx: 12, opacity: 0.06 }));
  els.push(text(216, 170, 'Review Coverage', 11, C.textDim, { fw: 500, ls: '0.02em' }));
  els.push(text(216, 208, '87', 38, C.text, { fw: 700, ls: '-0.03em' }));
  els.push(text(255, 208, '%', 16, C.acc2, { fw: 600 }));
  // Radial arc  coverage
  els.push(circle(285, 230, 20, 'none', { stroke: C.border, sw: 4, opacity: 1 }));
  els.push(circle(285, 230, 20, 'none', { stroke: C.acc2, sw: 4 }));
  els.push(text(285, 234, '87%', 8, C.acc2, { fw: 600, anchor: 'middle' }));

  // Row 2: AI Review Queue (wide, tall)
  els.push(rect(20, 266, 350, 160, C.card, { rx: 12 }));
  els.push(text(36, 290, 'AI REVIEW QUEUE', 10, C.textDim, { fw: 600, ls: '0.08em' }));
  els.push(text(C.W - 20, 290, 'See all →', 10, C.acc, { fw: 500, anchor: 'end' }));

  const prs = [
    { title: 'feat: add payment gateway', author: 'sarah.k', state: 'pending', lines: '+142', time: '2m' },
    { title: 'fix: race condition in auth', author: 'dev.li', state: 'approved', lines: '+18', time: '8m' },
    { title: 'refactor: db connection pool', author: 'r.cohen', state: 'changes', lines: '+96', time: '15m' },
  ];

  prs.forEach((pr, i) => {
    const y = 306 + i * 38;
    const stateColor = pr.state === 'approved' ? C.acc3 : pr.state === 'changes' ? C.orange : C.acc;
    const stateDot = pr.state === 'approved' ? '✓' : pr.state === 'changes' ? '!' : '○';
    els.push(rect(36, y + 4, 12, 12, stateColor, { rx: 3, opacity: 0.2 }));
    els.push(text(43, y + 14, stateDot, 8, stateColor, { fw: 700, anchor: 'middle' }));
    els.push(text(56, y + 14, pr.title, 12, C.text, { fw: 500 }));
    els.push(text(56, y + 26, pr.author + ' · ' + pr.lines, 10, C.textDim));
    els.push(text(354, y + 14, pr.time + ' ago', 10, C.textDim, { anchor: 'end' }));
    if (i < prs.length - 1) divider(els, y + 36);
  });

  // Row 3: 3-cell bento
  // Cycle Time
  els.push(rect(20, 438, 108, 90, C.card, { rx: 12 }));
  els.push(rect(20, 438, 108, 90, C.orange, { rx: 12, opacity: 0.05 }));
  els.push(text(36, 460, 'Cycle Time', 10, C.textDim, { fw: 500 }));
  els.push(text(36, 492, '4.2h', 22, C.text, { fw: 700, ls: '-0.02em' }));
  els.push(text(36, 512, '↓ 0.8h', 9, C.acc3, { fw: 600 }));

  // AI Score
  els.push(rect(138, 438, 108, 90, C.card, { rx: 12 }));
  els.push(rect(138, 438, 108, 90, C.acc2, { rx: 12, opacity: 0.05 }));
  els.push(text(154, 460, 'AI Score', 10, C.textDim, { fw: 500 }));
  els.push(text(154, 492, '9.1', 22, C.text, { fw: 700, ls: '-0.02em' }));
  els.push(text(154, 512, '/10 quality', 9, C.acc2, { fw: 500 }));

  // Merged Today
  els.push(rect(256, 438, 114, 90, C.card, { rx: 12 }));
  els.push(rect(256, 438, 114, 90, C.acc3, { rx: 12, opacity: 0.05 }));
  els.push(text(272, 460, 'Merged Today', 10, C.textDim, { fw: 500 }));
  els.push(text(272, 492, '11', 22, C.text, { fw: 700, ls: '-0.02em' }));
  els.push(text(272, 512, '↑ 2 avg', 9, C.acc3, { fw: 600 }));

  // Row 4: Team Activity
  els.push(rect(20, 540, 350, 100, C.card, { rx: 12 }));
  els.push(text(36, 562, 'TEAM ACTIVITY', 10, C.textDim, { fw: 600, ls: '0.08em' }));

  const days = ['M','T','W','T','F','S','S'];
  const vals  = [6, 8, 5, 10, 9, 4, 3];
  days.forEach((d, i) => {
    const x = 36 + i * 44;
    const h2 = vals[i] * 5;
    const isToday = i === 4;
    els.push(rect(x, 620 - h2, 28, h2, isToday ? C.acc : C.card2, { rx: 4, opacity: isToday ? 1 : 0.7 }));
    els.push(text(x + 14, 630, d, 9, isToday ? C.acc : C.textDim, { anchor: 'middle', fw: isToday ? 600 : 400 }));
  });

  // Row 5: Flare alert
  els.push(rect(20, 652, 350, 50, C.red, { rx: 12, opacity: 0.1 }));
  els.push(rect(20, 652, 4, 50, C.red, { rx: 2 }));
  els.push(text(36, 676, '⚠  2 PRs stale for 3+ days — needs attention', 12, C.red, { fw: 500 }));
  els.push(text(362, 676, '→', 14, C.red, { anchor: 'end' }));

  bottomNav(els, 0);
  return { name: 'Dashboard', elements: els, svg: toSVG(els) };
}

// ── Screen 2: PR Queue ────────────────────────────────────────────────────────

function screen2() {
  const els = [];
  els.push(rect(0, 0, C.W, C.H, C.bg));
  els.push(circle(350, 200, 160, C.acc, { opacity: 0.04 }));

  statusBar(els);
  topNav(els, 'Pull Requests');

  // Filter bar
  const filters = ['All (23)', 'Yours (5)', 'Waiting (8)', 'Merged (10)'];
  let fx = 20;
  filters.forEach((f, i) => {
    const w = f.length * 7.2 + 20;
    els.push(rect(fx, 106, w, 26, i === 0 ? C.acc : C.card2, { rx: 13 }));
    els.push(text(fx + w/2, 122, f, 10, i === 0 ? '#0B0D12' : C.textDim, { fw: i === 0 ? 700 : 400, anchor: 'middle' }));
    fx += w + 8;
  });

  // Sort / search
  els.push(rect(20, 142, 310, 32, C.card, { rx: 8 }));
  els.push(text(36, 162, '⌕  Search pull requests...', 12, C.textDim, { opacity: 0.6 }));
  els.push(rect(340, 142, 30, 32, C.card2, { rx: 8 }));
  els.push(text(355, 162, '⇅', 14, C.acc, { anchor: 'middle' }));

  // PR items
  const prs = [
    { id: '#284', title: 'feat: add Stripe payment gateway', author: 'sarah.kim', branch: 'feat/payments', lines: '+142 -8', reviews: 0, state: 'pending', age: '2m', files: 7, ai: '8.4' },
    { id: '#283', title: 'fix: race condition in auth flow', author: 'dev.li', branch: 'fix/auth-race', lines: '+18 -3', reviews: 2, state: 'approved', age: '1h', files: 2, ai: '9.6' },
    { id: '#282', title: 'refactor: db connection pooling', author: 'r.cohen', branch: 'refactor/db', lines: '+96 -44', reviews: 1, state: 'changes', age: '3h', files: 6, ai: '7.2' },
    { id: '#281', title: 'docs: update API reference', author: 'e.santos', branch: 'docs/api-ref', lines: '+210 -40', reviews: 3, state: 'approved', age: '4h', files: 12, ai: '9.1' },
    { id: '#280', title: 'chore: bump dep versions', author: 'ci-bot', branch: 'chore/deps', lines: '+55 -55', reviews: 1, state: 'pending', age: '6h', files: 1, ai: '9.9' },
    { id: '#279', title: 'feat: dark mode for dashboard', author: 'ana.t', branch: 'feat/darkmode', lines: '+380 -12', reviews: 0, state: 'pending', age: '18h', files: 14, ai: '7.8' },
    { id: '#276', title: 'fix: memory leak in WebSocket handler', author: 'dev.li', branch: 'fix/ws-leak', lines: '+22 -18', reviews: 0, state: 'stale', age: '3d', files: 3, ai: '8.9' },
  ];

  prs.forEach((pr, i) => {
    const y = 186 + i * 76;
    if (y + 72 > 780) return;
    const stateColor = pr.state === 'approved' ? C.acc3 : pr.state === 'changes' ? C.orange : pr.state === 'stale' ? C.red : C.textDim;
    const bgOpacity = pr.state === 'stale' ? 0.06 : 0.0;

    els.push(rect(20, y, 350, 68, C.card, { rx: 10 }));
    if (pr.state === 'stale') els.push(rect(20, y, 350, 68, C.red, { rx: 10, opacity: 0.05 }));

    // PR ID + state dot
    els.push(circle(36, y + 16, 5, stateColor, { opacity: 0.9 }));
    els.push(text(46, y + 20, pr.id, 10, stateColor, { fw: 600 }));

    // Title
    const title = pr.title.length > 38 ? pr.title.slice(0, 38) + '…' : pr.title;
    els.push(text(46, y + 36, title, 12, C.text, { fw: 500 }));

    // Author + branch + age
    els.push(text(46, y + 52, pr.author + ' · ' + pr.branch, 10, C.textDim));
    els.push(text(C.W - 24, y + 20, pr.age, 10, C.textDim, { anchor: 'end' }));

    // Bottom row: files, lines, AI score, review count
    els.push(text(C.W - 24, y + 52, `AI ${pr.ai}  ·  ${pr.files}f  ·  ${pr.lines}`, 10, C.textDim, { anchor: 'end' }));
    if (pr.reviews > 0) {
      els.push(rect(36, y + 44, 32, 14, C.acc3, { rx: 7, opacity: 0.15 }));
      els.push(text(52, y + 54, `✓ ${pr.reviews}`, 9, C.acc3, { fw: 600, anchor: 'middle' }));
    }
    if (i < 6) divider(els, y + 70);
  });

  bottomNav(els, 1);
  return { name: 'PR Queue', elements: els, svg: toSVG(els) };
}

// ── Screen 3: PR Detail + AI Review ──────────────────────────────────────────

function screen3() {
  const els = [];
  els.push(rect(0, 0, C.W, C.H, C.bg));
  els.push(circle(300, 250, 140, C.acc2, { opacity: 0.05 }));

  statusBar(els);
  topNav(els, '#284  feat: add payments', true);

  // Status strip
  els.push(rect(20, 104, 350, 36, C.card2, { rx: 8 }));
  els.push(circle(36, 122, 5, C.orange, {}));
  els.push(text(48, 126, 'Changes requested', 11, C.orange, { fw: 600 }));
  els.push(text(C.W - 24, 126, 'sarah.kim · 2m ago', 10, C.textDim, { anchor: 'end' }));

  // AI Analysis block
  els.push(rect(20, 150, 350, 148, C.card, { rx: 12 }));
  els.push(rect(20, 150, 350, 148, C.acc2, { rx: 12, opacity: 0.05 }));

  // AI header with glow
  els.push(rect(20, 150, 350, 36, C.acc2, { rx: 12, opacity: 0.15 }));
  els.push(text(36, 172, '◈  AI ANALYSIS', 10, C.acc2, { fw: 700, ls: '0.08em' }));
  els.push(text(C.W - 24, 172, 'Score: 8.4 / 10', 10, C.acc2, { fw: 600, anchor: 'end' }));

  // Analysis text
  const aiLines = [
    { icon: '●', color: C.acc3, text: 'Good separation of concerns across files' },
    { icon: '●', color: C.acc3, text: 'Stripe webhook validation is robust' },
    { icon: '●', color: C.orange, text: 'Missing error handling in payment retry' },
    { icon: '●', color: C.red, text: 'API key exposed in test fixtures — critical' },
  ];
  aiLines.forEach((line2, i) => {
    els.push(text(32, 204 + i * 22, line2.icon, 8, line2.color, { fw: 700 }));
    els.push(text(44, 204 + i * 22, line2.text, 11, C.text, { fw: 400 }));
  });

  // Quick actions
  els.push(text(36, 288, 'Jump to issue', 10, C.acc, { fw: 500 }));
  els.push(text(160, 288, 'Auto-fix suggestion', 10, C.acc, { fw: 500 }));
  els.push(text(306, 288, 'Dismiss', 10, C.textDim, { fw: 500 }));

  // Code diff
  els.push(text(20, 316, 'DIFF', 10, C.textDim, { fw: 700, ls: '0.08em' }));
  els.push(text(56, 316, '  src/payments/stripe.ts', 10, C.textDim));
  els.push(text(C.W - 24, 316, '+142  -8', 10, C.acc3, { anchor: 'end' }));

  const diffLines = [
    { kind: 'meta', text: '@@ -45,7 +45,12 @@ export class StripeService {' },
    { kind: 'ctx',  text: '   async createIntent(amount: number) {' },
    { kind: 'add',  text: '+    const idempotency = uuid();' },
    { kind: 'add',  text: '+    await validateWebhook(payload);' },
    { kind: 'add',  text: '+    if (!this.client) throw new Error();' },
    { kind: 'ctx',  text: '     const intent = await stripe.create({' },
    { kind: 'del',  text: '-      apiKey: "sk_test_abc123xyz"' },
    { kind: 'add',  text: '+      apiKey: process.env.STRIPE_KEY' },
    { kind: 'ctx',  text: '     });' },
    { kind: 'ctx',  text: '     return intent.client_secret;' },
  ];

  const diffColors = { meta: C.textDim, ctx: C.text, add: C.acc3, del: C.red };
  const diffBg = { meta: 'none', ctx: 'none', add: C.acc3, del: C.red };

  els.push(rect(20, 328, 350, diffLines.length * 22 + 8, C.card, { rx: 8 }));
  diffLines.forEach((dl, i) => {
    const dy = 340 + i * 22;
    if (dl.kind === 'add') els.push(rect(20, dy - 14, 350, 22, C.acc3, { opacity: 0.08 }));
    if (dl.kind === 'del') els.push(rect(20, dy - 14, 350, 22, C.red, { opacity: 0.08 }));
    els.push(text(30, dy, dl.text, 10, diffColors[dl.kind] ?? C.text, { fw: dl.kind === 'meta' ? 400 : 400, font: 'JetBrains Mono, monospace', ls: '0em' }));
  });

  const diffBottom = 340 + diffLines.length * 22 + 8;

  // Leave comment
  els.push(rect(20, diffBottom + 8, 350, 40, C.card2, { rx: 8 }));
  els.push(text(36, diffBottom + 31, 'Add a comment…', 12, C.textDim, { opacity: 0.5 }));
  els.push(text(C.W - 28, diffBottom + 31, '↑', 16, C.acc, { anchor: 'end', fw: 600 }));

  // Approve / Request Changes buttons
  const btnY = diffBottom + 60;
  if (btnY + 36 < 785) {
    els.push(rect(20, btnY, 164, 36, C.acc3, { rx: 8, opacity: 0.15 }));
    els.push(text(102, btnY + 22, 'Approve', 13, C.acc3, { fw: 600, anchor: 'middle' }));
    els.push(rect(196, btnY, 174, 36, C.orange, { rx: 8, opacity: 0.12 }));
    els.push(text(283, btnY + 22, 'Request Changes', 12, C.orange, { fw: 600, anchor: 'middle' }));
  }

  bottomNav(els, 1);
  return { name: 'PR Detail', elements: els, svg: toSVG(els) };
}

// ── Screen 4: Review Feed ─────────────────────────────────────────────────────

function screen4() {
  const els = [];
  els.push(rect(0, 0, C.W, C.H, C.bg));
  els.push(circle(60, 400, 130, C.acc, { opacity: 0.04 }));

  statusBar(els);
  topNav(els, 'Review Feed');

  // Live indicator
  els.push(rect(20, 104, 100, 24, C.acc3, { rx: 12, opacity: 0.12 }));
  els.push(circle(31, 116, 4, C.acc3, {}));
  els.push(text(39, 120, 'LIVE  ·  now', 10, C.acc3, { fw: 600 }));

  const events = [
    { time: 'just now', who: 'sarah.kim', action: 'approved', pr: '#283', icon: '✓', color: C.acc3 },
    { time: '3m', who: 'AI', action: 'flagged critical issue in', pr: '#284', icon: '◈', color: C.acc2 },
    { time: '8m', who: 'r.cohen', action: 'requested changes on', pr: '#282', icon: '!', color: C.orange },
    { time: '12m', who: 'dev.li', action: 'opened', pr: '#283', icon: '⊕', color: C.acc },
    { time: '18m', who: 'e.santos', action: 'approved', pr: '#281', icon: '✓', color: C.acc3 },
    { time: '45m', who: 'AI', action: 'auto-approved (score 9.9)', pr: '#280', icon: '◈', color: C.acc2 },
    { time: '1h', who: 'ana.t', action: 'opened', pr: '#279', icon: '⊕', color: C.acc },
    { time: '1h', who: 'dev.li', action: 'commented on', pr: '#279', icon: '○', color: C.textDim },
    { time: '2h', who: 'r.cohen', action: 'merged', pr: '#278', icon: '⇒', color: C.acc3 },
  ];

  events.forEach((ev, i) => {
    const y = 140 + i * 68;
    if (y + 64 > 780) return;
    // avatar circle
    const initials = ev.who === 'AI' ? 'AI' : ev.who.slice(0,2).toUpperCase();
    els.push(circle(36, y + 22, 18, ev.who === 'AI' ? C.acc2 : C.card2, { opacity: ev.who === 'AI' ? 0.25 : 1 }));
    els.push(text(36, y + 27, initials, 10, ev.who === 'AI' ? C.acc2 : C.text, { anchor: 'middle', fw: 600 }));

    // state icon badge
    els.push(circle(49, y + 35, 8, C.bg, {}));
    els.push(circle(49, y + 35, 7, ev.color, { opacity: 0.25 }));
    els.push(text(49, y + 39, ev.icon, 8, ev.color, { anchor: 'middle', fw: 700 }));

    // text
    els.push(text(62, y + 18, ev.who, 12, C.text, { fw: 600 }));
    els.push(text(62, y + 34, ev.action + ' ' + ev.pr, 11, C.textDim));
    els.push(text(C.W - 24, y + 18, ev.time, 10, C.textDim, { anchor: 'end' }));

    // micro pill for AI events
    if (ev.who === 'AI') {
      els.push(rect(62, y + 42, 52, 14, C.acc2, { rx: 7, opacity: 0.15 }));
      els.push(text(88, y + 52, 'AI', 8, C.acc2, { anchor: 'middle', fw: 700 }));
    }

    if (i < events.length - 1) divider(els, y + 64);
  });

  bottomNav(els, 2);
  return { name: 'Review Feed', elements: els, svg: toSVG(els) };
}

// ── Screen 5: Team Stats ──────────────────────────────────────────────────────

function screen5() {
  const els = [];
  els.push(rect(0, 0, C.W, C.H, C.bg));
  els.push(circle(300, 300, 160, C.acc2, { opacity: 0.05 }));
  els.push(circle(80, 600, 120, C.acc, { opacity: 0.04 }));

  statusBar(els);
  topNav(els, 'Team');

  // Period selector
  ['Day', 'Week', 'Month'].forEach((p, i) => {
    const w = 60;
    const x = 20 + i * 68;
    els.push(rect(x, 104, w, 26, i === 1 ? C.acc : C.card2, { rx: 13 }));
    els.push(text(x + 30, 121, p, 11, i === 1 ? '#0B0D12' : C.textDim, { anchor: 'middle', fw: i === 1 ? 700 : 400 }));
  });

  // Summary metrics row
  const metrics = [
    { label: 'PRs Merged', val: '47', sub: 'this week', color: C.acc3 },
    { label: 'Avg Review', val: '3.1h', sub: 'turnaround', color: C.acc },
    { label: 'AI Saves', val: '12', sub: 'issues caught', color: C.acc2 },
  ];
  metrics.forEach((m, i) => {
    const x = 20 + i * 118;
    els.push(rect(x, 140, 108, 72, C.card, { rx: 10 }));
    els.push(text(x + 54, 162, m.label, 9, C.textDim, { anchor: 'middle', fw: 500 }));
    els.push(text(x + 54, 188, m.val, 20, m.color, { anchor: 'middle', fw: 700, ls: '-0.02em' }));
    els.push(text(x + 54, 202, m.sub, 9, C.textDim, { anchor: 'middle' }));
  });

  // Leaderboard
  els.push(text(20, 234, 'CONTRIBUTORS', 10, C.textDim, { fw: 600, ls: '0.08em' }));
  els.push(text(C.W - 20, 234, 'by merges', 10, C.textDim, { anchor: 'end' }));

  const team = [
    { name: 'sarah.kim',  merges: 14, reviews: 22, score: '9.2', rank: 1 },
    { name: 'dev.li',     merges: 11, reviews: 18, score: '9.0', rank: 2 },
    { name: 'r.cohen',    merges: 9,  reviews: 14, score: '8.7', rank: 3 },
    { name: 'ana.t',      merges: 7,  reviews: 11, score: '8.4', rank: 4 },
    { name: 'e.santos',   merges: 6,  reviews: 9,  score: '8.1', rank: 5 },
  ];

  team.forEach((m, i) => {
    const y = 248 + i * 66;
    const barW = (m.merges / 14) * 190;
    const rankColor = m.rank === 1 ? '#FBBF24' : m.rank === 2 ? '#94A3B8' : m.rank === 3 ? '#D97706' : C.textDim;

    els.push(rect(20, y, 350, 58, C.card, { rx: 10 }));

    // Rank badge
    els.push(rect(20, y, 28, 58, rankColor, { rx: 10, opacity: 0.1 }));
    els.push(text(34, y + 32, `${m.rank}`, 13, rankColor, { anchor: 'middle', fw: 700 }));

    // Avatar
    const initials = m.name.slice(0,2).toUpperCase();
    els.push(circle(72, y + 20, 14, C.card2, {}));
    els.push(text(72, y + 25, initials, 10, C.text, { anchor: 'middle', fw: 600 }));

    // Name + bar
    els.push(text(92, y + 20, m.name, 12, C.text, { fw: 600 }));
    els.push(rect(92, y + 30, 190, 6, C.card2, { rx: 3 }));
    els.push(rect(92, y + 30, barW, 6, m.rank === 1 ? C.acc : C.acc2, { rx: 3, opacity: 0.8 }));
    els.push(text(92, y + 50, `${m.merges} merges  ·  ${m.reviews} reviews`, 10, C.textDim));

    // AI score
    els.push(text(C.W - 24, y + 32, m.score, 16, m.rank <= 2 ? C.acc : C.textDim, { anchor: 'end', fw: 700 }));
  });

  bottomNav(els, 3);
  return { name: 'Team Stats', elements: els, svg: toSVG(els) };
}

// ── Screen 6: Integrations ────────────────────────────────────────────────────

function screen6() {
  const els = [];
  els.push(rect(0, 0, C.W, C.H, C.bg));
  els.push(circle(200, 160, 200, C.acc, { opacity: 0.04 }));

  statusBar(els);
  topNav(els, 'Integrations');

  // Repository context
  els.push(rect(20, 104, 350, 56, C.card, { rx: 12 }));
  els.push(text(36, 126, 'hyperio-mc / core', 14, C.text, { fw: 600 }));
  els.push(text(36, 146, 'github.com · 4 active integrations', 11, C.textDim));
  els.push(text(C.W - 24, 130, '●  Connected', 11, C.acc3, { anchor: 'end', fw: 600 }));

  // Integration cards
  const integrations = [
    { name: 'GitHub', desc: 'PR webhooks · push events · status checks', on: true, color: C.text },
    { name: 'Slack', desc: 'Review notifications in #dev-team', on: true, color: '#4A154B' },
    { name: 'Linear', desc: 'Link PRs to issues automatically', on: true, color: C.acc2 },
    { name: 'Jira', desc: 'Sync PR status to Jira tickets', on: false, color: '#0052CC' },
    { name: 'Datadog', desc: 'Track deploy impact on metrics', on: false, color: '#7B61FF' },
  ];

  els.push(text(20, 176, 'CONNECTED', 10, C.textDim, { fw: 600, ls: '0.08em' }));
  integrations.forEach((itg, i) => {
    const y = 190 + i * 72;
    els.push(rect(20, y, 350, 62, C.card, { rx: 10 }));

    // Icon placeholder
    els.push(circle(52, y + 31, 18, itg.on ? itg.color : C.card2, { opacity: itg.on ? 0.15 : 1 }));
    els.push(text(52, y + 36, itg.name.slice(0,2), 11, itg.on ? C.text : C.textDim, { anchor: 'middle', fw: 700 }));

    els.push(text(80, y + 26, itg.name, 13, C.text, { fw: 600 }));
    els.push(text(80, y + 44, itg.desc, 10, C.textDim));

    // Toggle
    const tx = C.W - 52;
    els.push(rect(tx, y + 22, 38, 20, itg.on ? C.acc : C.card2, { rx: 10 }));
    const dotX = itg.on ? tx + 22 : tx + 8;
    els.push(circle(dotX, y + 32, 7, itg.on ? '#FFF' : C.textDim, {}));
  });

  // AI Config section
  els.push(rect(20, 560, 350, 80, C.card, { rx: 12 }));
  els.push(rect(20, 560, 350, 80, C.acc2, { rx: 12, opacity: 0.05 }));
  els.push(text(36, 582, '◈  AI CONFIGURATION', 10, C.acc2, { fw: 700, ls: '0.08em' }));
  els.push(text(36, 600, 'Model: GPT-4o · Auto-approve threshold: 9.5', 11, C.textDim));
  els.push(text(36, 616, 'Security scan: ON · Style lint: ON · Test req: OFF', 11, C.textDim));
  els.push(text(C.W - 24, 598, 'Configure →', 11, C.acc, { anchor: 'end', fw: 500 }));

  // Version
  els.push(text(C.W / 2, 660, 'PULL v1.0.0 — Heartbeat #100', 10, C.textDim, { anchor: 'middle', opacity: 0.5 }));

  bottomNav(els, 3);
  return { name: 'Integrations', elements: els, svg: toSVG(els) };
}

// ── Assemble + Write ──────────────────────────────────────────────────────────

const screens = [
  screen1(),
  screen2(),
  screen3(),
  screen4(),
  screen5(),
  screen6(),
];

const totalEls = screens.reduce((a, s) => a + s.elements.length, 0);

const pen = {
  version: '2.8',
  metadata: {
    name: NAME,
    tagline: TAGLINE,
    author: 'RAM',
    date: new Date().toISOString(),
    theme: THEME,
    heartbeat: HB,
    elements: totalEls,
    archetype: 'developer-productivity',
    palette: { bg: C.bg, surface: C.surface, accent: C.acc, accent2: C.acc2, text: C.text, muted: C.muted },
  },
  screens: screens.map(s => ({ name: s.name, svg: s.svg, elements: s.elements })),
};

fs.writeFileSync(path.join(__dirname, `${SLUG}.pen`), JSON.stringify(pen, null, 2));
console.log(`${NAME}: ${screens.length} screens, ${totalEls} elements`);
console.log(`Written: ${SLUG}.pen`);
