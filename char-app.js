// char-app.js — CHAR: Code analytics, distilled
//
// Inspiration:
//   1. Corentin Bernadou Portfolio — Awwwards SOTD Mar 25 2026.
//      Ultra-minimal 2-color palette: #FF4401 (burnt orange) + #070304 (near-black).
//      The tension of a single hot accent on absolute darkness creates extreme
//      visual clarity — borrowed directly as the accent strategy for CHAR.
//   2. Midday.ai (from darkmodedesign.com) — editorial "Morning Viktor" approach
//      to financial data: personalized greeting, card-grid overview, AI natural-
//      language prompts embedded in the product. Transposed to code analytics.
//   3. land-book.com "Codegen | OS for Code Agents" — AI-native dev tool landing,
//      dark precision, terminal-influenced type hierarchy.
//
// Challenge: Design a code analytics dashboard for solo devs / small teams that
//   treats the codebase like a living organism — give it vitals, a pulse, a weekly
//   digest. Style push: use ONLY typography weight & size contrast + a single
//   accent color to create all visual hierarchy (no colored backgrounds, no
//   gradients, no decorative shapes).
//
// Theme: DARK — near-black #0C0D0D + burnt orange #FF4401 + warm white #F2EDE6
// Screens: 5 — Pulse, Commits, Reviews, Debt, Insight

'use strict';
const fs = require('fs');
const W = 390, H = 844;
let idC = 1;
const uid = () => `c${idC++}`;

// ── Palette ───────────────────────────────────────────────────────────────────
const p = {
  bg:        '#0C0D0D',   // near-black (from Awwwards SOTD)
  surface:   '#161818',   // card surface
  raised:    '#1F2121',   // elevated elements, input fields
  border:    'rgba(242,237,230,0.06)',
  borderMid: 'rgba(242,237,230,0.12)',
  text:      '#F2EDE6',   // warm white
  textMuted: 'rgba(242,237,230,0.42)',
  textDim:   'rgba(242,237,230,0.22)',
  accent:    '#FF4401',   // burnt orange — the single spark
  accentDim: 'rgba(255,68,1,0.14)',
  accentDim2:'rgba(255,68,1,0.07)',
  green:     '#3DCC8A',   // positive delta
  greenDim:  'rgba(61,204,138,0.12)',
  red:       '#FF5448',   // risk / regression
  redDim:    'rgba(255,84,72,0.12)',
  yellow:    '#FFAD33',   // warning
  yellowDim: 'rgba(255,173,51,0.12)',
};

// ── Primitives ────────────────────────────────────────────────────────────────
function makeScreen(id, label, bg, elements) {
  return { id, label, backgroundColor: bg, elements };
}
function rect(x, y, w, h, fill, opts = {}) {
  return {
    type: 'rect', x, y, width: w, height: h, fill,
    borderRadius: opts.radius || 0,
    ...(opts.shadow ? { shadow: opts.shadow } : {}),
    ...(opts.stroke ? { stroke: opts.stroke, strokeWidth: opts.strokeWidth || 1 } : {}),
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  };
}
function text(x, y, w, h, content, opts = {}) {
  return {
    type: 'text', x, y, width: w, height: h,
    content,
    fontSize:   opts.size   || 14,
    fontWeight: opts.weight || 400,
    color:      opts.color  || p.text,
    textAlign:  opts.align  || 'left',
    fontFamily: opts.font   || 'Inter',
    lineHeight: opts.leading || 1.45,
    ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  };
}
function circle(x, y, r, fill, opts = {}) {
  return rect(x - r, y - r, r * 2, r * 2, fill, { ...opts, radius: r });
}

// ── Shared components ─────────────────────────────────────────────────────────
function statusBar(dark = true) {
  return [
    rect(0, 0, W, 44, 'transparent'),
    text(16, 14, 60, 16, '9:41', { size: 15, weight: 600, color: dark ? p.text : p.text }),
    text(W - 76, 14, 60, 16, '●●● ◀ ▮', { size: 11, color: dark ? p.textMuted : p.textMuted, align: 'right' }),
  ];
}

function bottomNav(active) {
  const items = [
    { id: 'pulse',   icon: '⬡', label: 'Pulse' },
    { id: 'commits', icon: '↑', label: 'Commits' },
    { id: 'reviews', icon: '◈', label: 'Reviews' },
    { id: 'debt',    icon: '◎', label: 'Debt' },
    { id: 'insight', icon: '✦', label: 'Insight' },
  ];
  const navBg = rect(0, H - 82, W, 82, p.surface);
  const topLine = rect(0, H - 82, W, 1, p.border);
  const els = [navBg, topLine];
  const slotW = W / items.length;
  items.forEach((item, i) => {
    const isActive = item.id === active;
    const cx = slotW * i + slotW / 2;
    const cy = H - 82 + 20;
    // icon
    els.push(text(cx - 12, cy, 24, 22, item.icon, {
      size: 18, weight: isActive ? 700 : 400,
      color: isActive ? p.accent : p.textDim,
      align: 'center',
    }));
    // label
    els.push(text(cx - 20, cy + 24, 40, 14, item.label, {
      size: 9, weight: isActive ? 600 : 400,
      color: isActive ? p.accent : p.textDim,
      align: 'center',
    }));
    // active dot
    if (isActive) {
      els.push(circle(cx, H - 82 + 5, 2, p.accent));
    }
  });
  return els;
}

// ── Screen 1: Pulse (Home Dashboard) ─────────────────────────────────────────
function makePulseScreen() {
  const els = [rect(0, 0, W, H, p.bg)];
  els.push(...statusBar());

  // Header greeting — editorial serif style (like Midday's "Morning Viktor")
  els.push(text(20, 52, 260, 28, 'Morning, Ryo.', {
    size: 26, weight: 700, color: p.text,
  }));
  els.push(text(20, 82, 280, 16, "Here's your codebase this week.", {
    size: 13, color: p.textMuted,
  }));

  // Weekly summary card (top, full-width) — inspired by Midday
  els.push(rect(16, 108, W - 32, 84, p.surface, { radius: 12, stroke: p.border, strokeWidth: 1 }));
  els.push(rect(16, 108, 3, 84, p.accent, { radius: 2 })); // left accent bar
  els.push(text(28, 120, 220, 14, 'Weekly Digest', { size: 10, weight: 700, color: p.textMuted }));
  els.push(text(28, 136, 330, 36, '287 commits · 14 PRs merged · zero regressions.', {
    size: 13, weight: 500, color: p.text, leading: 1.5,
  }));
  els.push(text(28, 176, 200, 14, 'Strong week — velocity up 18%', {
    size: 11, color: p.green, weight: 500,
  }));

  // 2×2 metric grid
  const cards = [
    { label: 'Commit Velocity', value: '41', unit: '/wk', delta: '+18%', deltaDir: 'up' },
    { label: 'Review Cycle',    value: '4.2', unit: 'hrs', delta: '-12%', deltaDir: 'up' },
    { label: 'Test Coverage',   value: '78', unit: '%',   delta: '+3%',  deltaDir: 'up' },
    { label: 'Debt Score',      value: '24', unit: '',    delta: '+2',   deltaDir: 'down' },
  ];
  const cardW = (W - 32 - 8) / 2;
  const cardH = 88;
  cards.forEach((card, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const cx = 16 + col * (cardW + 8);
    const cy = 204 + row * (cardH + 8);
    els.push(rect(cx, cy, cardW, cardH, p.surface, { radius: 12, stroke: p.border, strokeWidth: 1 }));
    els.push(text(cx + 14, cy + 14, cardW - 28, 12, card.label, { size: 10, weight: 600, color: p.textMuted }));
    // Big number
    els.push(text(cx + 14, cy + 32, cardW - 28, 32, card.value, { size: 28, weight: 700, color: p.text }));
    els.push(text(cx + 14 + card.value.length * 16, cy + 44, 30, 14, card.unit, { size: 12, color: p.textMuted }));
    // Delta badge
    const deltaColor = card.deltaDir === 'up' ? p.green : p.red;
    els.push(text(cx + cardW - 44, cy + 14, 36, 14, card.delta, {
      size: 10, weight: 700, color: deltaColor, align: 'right',
    }));
  });

  // AI Insight row
  const aiY = 204 + 2 * (cardH + 8) + 8;
  els.push(rect(16, aiY, W - 32, 56, p.accentDim2, { radius: 12, stroke: p.accentDim, strokeWidth: 1 }));
  els.push(text(28, aiY + 10, 20, 20, '✦', { size: 16, color: p.accent }));
  els.push(text(52, aiY + 12, W - 80, 14, 'Why did review time drop last Tuesday?', {
    size: 13, color: p.textMuted, weight: 400,
  }));
  els.push(text(W - 36, aiY + 12, 20, 20, '→', { size: 16, color: p.accent, align: 'center' }));
  els.push(text(52, aiY + 30, W - 80, 12, 'Ask anything about your repo...', {
    size: 11, color: p.textDim,
  }));

  // Recent activity mini-list
  const listY = aiY + 72;
  els.push(text(20, listY, 150, 14, 'RECENT COMMITS', { size: 10, weight: 700, color: p.textMuted }));
  const commits = [
    { hash: 'a3f92b', msg: 'feat: add webhook retry logic', time: '2h ago', author: 'R' },
    { hash: 'c81e44', msg: 'fix: race condition in auth flow', time: '5h ago', author: 'K' },
    { hash: '9d2f17', msg: 'chore: update deps to latest',    time: '8h ago', author: 'R' },
  ];
  commits.forEach((c, i) => {
    const rowY = listY + 20 + i * 40;
    els.push(rect(16, rowY, W - 32, 36, 'transparent', { stroke: p.border, strokeWidth: 1, radius: 8 }));
    // avatar
    els.push(circle(34, rowY + 18, 10, p.accentDim, { radius: 10 }));
    els.push(text(29, rowY + 12, 20, 14, c.author, { size: 10, weight: 700, color: p.accent, align: 'center' }));
    // hash + msg
    els.push(text(52, rowY + 8, 200, 10, c.hash, { size: 9, color: p.textDim, weight: 600 }));
    els.push(text(52, rowY + 20, 220, 12, c.msg, { size: 11, color: p.text, weight: 500 }));
    els.push(text(W - 60, rowY + 14, 44, 10, c.time, { size: 9, color: p.textMuted, align: 'right' }));
  });

  els.push(...bottomNav('pulse'));
  return makeScreen('pulse', 'Pulse', p.bg, els);
}

// ── Screen 2: Commits ─────────────────────────────────────────────────────────
function makeCommitsScreen() {
  const els = [rect(0, 0, W, H, p.bg)];
  els.push(...statusBar());

  els.push(text(20, 52, 200, 24, 'Commits', { size: 22, weight: 700 }));
  els.push(text(20, 78, 240, 14, '287 this week · 1,204 this month', { size: 12, color: p.textMuted }));

  // Heatmap calendar — 7 weeks × 7 days
  const heatY = 108;
  els.push(text(20, heatY, 150, 12, 'CONTRIBUTION HEATMAP', { size: 9, weight: 700, color: p.textMuted }));
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  days.forEach((d, i) => {
    els.push(text(20, heatY + 16 + i * 14, 12, 12, d, { size: 8, color: p.textDim }));
  });
  const heatData = [
    [0,1,3,4,2,0,0],
    [1,3,5,4,3,1,0],
    [2,4,5,5,4,2,1],
    [1,3,4,5,3,1,0],
    [0,2,3,3,2,0,0],
    [1,3,4,4,4,2,0],
    [2,4,5,4,3,1,0],
  ];
  for (let week = 0; week < 7; week++) {
    for (let day = 0; day < 7; day++) {
      const val = heatData[week][day];
      const opacity = val === 0 ? 0.08 : val / 5 * 0.85 + 0.15;
      const fill = val === 0 ? p.surface : p.accent;
      els.push(rect(38 + week * 46, heatY + 14 + day * 14, 40, 12, fill, {
        radius: 3, opacity,
      }));
    }
  }

  // Daily breakdown bar chart
  const barY = heatY + 16 + 7 * 14 + 16;
  els.push(rect(16, barY, W - 32, 120, p.surface, { radius: 12, stroke: p.border, strokeWidth: 1 }));
  els.push(text(28, barY + 14, 200, 12, 'DAILY VELOCITY', { size: 9, weight: 700, color: p.textMuted }));
  const barData = [
    { day: 'Mon', val: 52 }, { day: 'Tue', val: 38 }, { day: 'Wed', val: 67 },
    { day: 'Thu', val: 71 }, { day: 'Fri', val: 45 }, { day: 'Sat', val: 14 },
  ];
  const maxBar = Math.max(...barData.map(d => d.val));
  const barSlotW = (W - 64) / barData.length;
  barData.forEach((bar, i) => {
    const bx = 28 + i * barSlotW + 4;
    const barMaxH = 64;
    const barH = Math.round((bar.val / maxBar) * barMaxH);
    const bTop = barY + 36 + barMaxH - barH;
    const isToday = i === 3;
    els.push(rect(bx, bTop, barSlotW - 8, barH, isToday ? p.accent : p.raised, { radius: 3 }));
    els.push(text(bx, barY + 36 + barMaxH + 6, barSlotW - 8, 10, bar.day, {
      size: 8, color: p.textMuted, align: 'center',
    }));
    if (isToday) {
      els.push(text(bx, bTop - 16, barSlotW - 8, 12, `${bar.val}`, {
        size: 9, weight: 700, color: p.accent, align: 'center',
      }));
    }
  });

  // File activity list
  const fileY = barY + 136;
  els.push(text(20, fileY, 200, 12, 'MOST CHANGED FILES', { size: 9, weight: 700, color: p.textMuted }));
  const files = [
    { name: 'src/auth/middleware.ts',    changes: 34, type: 'fix' },
    { name: 'src/api/webhooks.ts',       changes: 28, type: 'feat' },
    { name: 'src/components/Table.tsx',  changes: 19, type: 'refactor' },
    { name: 'tests/integration/auth.spec.ts', changes: 16, type: 'test' },
  ];
  const typeColors = { feat: p.accent, fix: p.yellow, refactor: '#7C9CF5', test: p.green };
  files.forEach((f, i) => {
    const fy = fileY + 18 + i * 44;
    els.push(rect(16, fy, W - 32, 38, p.surface, { radius: 8, stroke: p.border, strokeWidth: 1 }));
    // type badge
    const tc = typeColors[f.type] || p.textMuted;
    els.push(rect(28, fy + 12, f.type.length * 6 + 12, 16, `${tc}20`, { radius: 4 }));
    els.push(text(34, fy + 13, f.type.length * 8, 12, f.type, { size: 8, weight: 700, color: tc }));
    const badgeW = f.type.length * 6 + 16;
    // file name
    els.push(text(28 + badgeW, fy + 12, W - 100 - badgeW, 14, f.name, {
      size: 10, color: p.textMuted, weight: 400,
    }));
    // change count
    els.push(text(W - 56, fy + 12, 40, 14, `${f.changes} Δ`, { size: 11, weight: 700, color: p.text, align: 'right' }));
    // change bar
    els.push(rect(16, fy + 30, (W - 32) * (f.changes / 40), 4, p.accentDim, { radius: 2 }));
    els.push(rect(16 + (W - 32) * (f.changes / 40) - 6, fy + 28, 6, 8, p.accent, { radius: 2 }));
  });

  els.push(...bottomNav('commits'));
  return makeScreen('commits', 'Commits', p.bg, els);
}

// ── Screen 3: Reviews ─────────────────────────────────────────────────────────
function makeReviewsScreen() {
  const els = [rect(0, 0, W, H, p.bg)];
  els.push(...statusBar());

  els.push(text(20, 52, 200, 24, 'Reviews', { size: 22, weight: 700 }));
  els.push(text(20, 78, 280, 14, '14 merged · 3 open · 0 blocked', { size: 12, color: p.textMuted }));

  // Status pills
  const pills = [
    { label: 'Open', count: 3, color: p.yellow },
    { label: 'In Review', count: 5, color: p.accent },
    { label: 'Merged', count: 14, color: p.green },
    { label: 'Blocked', count: 0, color: p.red },
  ];
  let pillX = 20;
  pills.forEach(pill => {
    const pw = pill.label.length * 7 + 36;
    els.push(rect(pillX, 100, pw, 26, `${pill.color}18`, { radius: 13 }));
    els.push(circle(pillX + 14, 113, 4, pill.color));
    els.push(text(pillX + 22, 106, pw - 28, 14, `${pill.label} ${pill.count}`, {
      size: 10, weight: 600, color: pill.color,
    }));
    pillX += pw + 8;
  });

  // Cycle time trend chart
  const trendY = 138;
  els.push(rect(16, trendY, W - 32, 100, p.surface, { radius: 12, stroke: p.border, strokeWidth: 1 }));
  els.push(text(28, trendY + 12, 200, 12, 'CYCLE TIME TREND', { size: 9, weight: 700, color: p.textMuted }));
  els.push(text(28, trendY + 26, 120, 24, '4.2 hrs', { size: 20, weight: 700, color: p.text }));
  els.push(text(152, trendY + 34, 80, 14, '↓ 12% vs last wk', { size: 10, color: p.green }));
  // Sparkline points
  const sparkPoints = [8.1, 6.4, 7.2, 5.8, 4.9, 5.3, 4.2];
  const sMaxY = trendY + 90, sMinY = trendY + 56;
  const sW = W - 64;
  const maxVal = Math.max(...sparkPoints), minVal = Math.min(...sparkPoints);
  const range = maxVal - minVal || 1;
  sparkPoints.forEach((val, i) => {
    if (i === 0) return;
    const x1 = 28 + ((i - 1) / (sparkPoints.length - 1)) * sW;
    const x2 = 28 + (i / (sparkPoints.length - 1)) * sW;
    const y1 = sMinY + ((maxVal - sparkPoints[i-1]) / range) * (sMaxY - sMinY);
    const y2 = sMinY + ((maxVal - val) / range) * (sMaxY - sMinY);
    // Approximate line with a narrow rect (not perfect but works for pen format)
    const lineW = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
    const angle = Math.atan2(y2-y1, x2-x1);
    els.push({
      type: 'line', x1, y1, x2, y2,
      stroke: i === sparkPoints.length - 1 ? p.accent : p.textMuted,
      strokeWidth: i === sparkPoints.length - 1 ? 2.5 : 1.5,
    });
    if (i === sparkPoints.length - 1) {
      els.push(circle(x2, y2, 4, p.accent));
    }
  });

  // PR list
  const prY = trendY + 116;
  els.push(text(20, prY, 150, 12, 'OPEN PULL REQUESTS', { size: 9, weight: 700, color: p.textMuted }));
  const prs = [
    { title: 'feat: add real-time dashboard updates', age: '6h', reviewer: 'K', state: 'review', lines: '+142/-18' },
    { title: 'fix: memory leak in WebSocket handler',  age: '1d', reviewer: 'L', state: 'open',   lines: '+23/-67' },
    { title: 'refactor: unify error boundary pattern', age: '2d', reviewer: '—', state: 'draft',  lines: '+88/-32' },
  ];
  const stateColors = { review: p.accent, open: p.yellow, draft: p.textMuted };
  prs.forEach((pr, i) => {
    const prItemY = prY + 18 + i * 70;
    els.push(rect(16, prItemY, W - 32, 62, p.surface, { radius: 10, stroke: p.border, strokeWidth: 1 }));
    // state dot
    const sc = stateColors[pr.state] || p.textMuted;
    els.push(circle(30, prItemY + 14, 4, sc));
    els.push(text(42, prItemY + 8, W - 80, 16, pr.title, { size: 11, weight: 600, color: p.text, leading: 1.3 }));
    // meta row
    els.push(text(42, prItemY + 38, 60, 12, pr.age, { size: 10, color: p.textMuted }));
    els.push(text(104, prItemY + 38, 70, 12, pr.lines, { size: 10, color: p.green }));
    // reviewer avatar
    els.push(circle(W - 36, prItemY + 24, 14, p.raised));
    els.push(text(W - 43, prItemY + 18, 28, 14, pr.reviewer, { size: 10, weight: 700, color: p.text, align: 'center' }));
    els.push(text(W - 80, prItemY + 50, 60, 10, `→ ${pr.reviewer}`, { size: 9, color: p.textMuted, align: 'right' }));
  });

  els.push(...bottomNav('reviews'));
  return makeScreen('reviews', 'Reviews', p.bg, els);
}

// ── Screen 4: Debt ────────────────────────────────────────────────────────────
function makeDebtScreen() {
  const els = [rect(0, 0, W, H, p.bg)];
  els.push(...statusBar());

  els.push(text(20, 52, 240, 24, 'Tech Debt', { size: 22, weight: 700 }));
  els.push(text(20, 78, 260, 14, 'Score 24 / 100 · Manageable', { size: 12, color: p.textMuted }));

  // Debt score ring (simulated with concentric arcs)
  const ringCX = W / 2, ringCY = 178, ringR = 60;
  // Outer track
  els.push(circle(ringCX, ringCY, ringR + 8, p.surface));
  els.push(circle(ringCX, ringCY, ringR - 8, p.bg));
  // Score fill (24% = about a quarter of the ring — approximate with rect segments)
  // We'll use a thin arc approximation
  els.push(circle(ringCX, ringCY, ringR + 4, p.accentDim2));
  els.push(circle(ringCX, ringCY, ringR - 4, p.bg));
  // Score text
  els.push(text(ringCX - 30, ringCY - 22, 60, 36, '24', {
    size: 36, weight: 800, color: p.text, align: 'center',
  }));
  els.push(text(ringCX - 30, ringCY + 16, 60, 14, '/ 100', { size: 11, color: p.textMuted, align: 'center' }));
  els.push(text(ringCX - 40, ringCY + 30, 80, 12, 'MANAGEABLE', { size: 9, weight: 700, color: p.green, align: 'center' }));

  // Debt breakdown bars
  const debtY = 250;
  els.push(text(20, debtY, 200, 12, 'BREAKDOWN', { size: 9, weight: 700, color: p.textMuted }));
  const debtItems = [
    { label: 'Code Smells',    score: 8, max: 30, color: p.yellow },
    { label: 'Complexity',     score: 7, max: 30, color: p.accent },
    { label: 'Coverage Gaps',  score: 5, max: 20, color: p.red },
    { label: 'Duplication',    score: 4, max: 20, color: '#7C9CF5' },
  ];
  debtItems.forEach((item, i) => {
    const dy = debtY + 18 + i * 34;
    els.push(text(20, dy + 2, 140, 12, item.label, { size: 11, color: p.text }));
    els.push(text(W - 50, dy + 2, 36, 12, `${item.score}/${item.max}`, { size: 10, color: p.textMuted, align: 'right' }));
    // bar track
    const trackW = W - 40;
    els.push(rect(20, dy + 18, trackW, 6, p.surface, { radius: 3 }));
    els.push(rect(20, dy + 18, Math.round(trackW * item.score / item.max), 6, item.color, { radius: 3 }));
  });

  // Hotspot file list
  const hotY = debtY + 18 + debtItems.length * 34 + 16;
  els.push(text(20, hotY, 200, 12, 'HOTSPOT FILES', { size: 9, weight: 700, color: p.textMuted }));
  const hotFiles = [
    { name: 'src/store/globalState.ts', issues: 7, heat: 0.9 },
    { name: 'src/utils/formatters.ts',  issues: 4, heat: 0.6 },
    { name: 'src/api/legacy/v1.ts',     issues: 3, heat: 0.45 },
  ];
  hotFiles.forEach((f, i) => {
    const hy = hotY + 18 + i * 44;
    els.push(rect(16, hy, W - 32, 38, p.surface, { radius: 8, stroke: p.border, strokeWidth: 1 }));
    // heat indicator
    const heatColor = f.heat > 0.7 ? p.red : f.heat > 0.5 ? p.yellow : p.green;
    els.push(rect(16, hy, 4, 38, heatColor, { radius: 2 }));
    els.push(text(28, hy + 8, W - 80, 14, f.name, { size: 10, color: p.text }));
    els.push(text(28, hy + 24, 120, 12, `${f.issues} issue${f.issues !== 1 ? 's' : ''}`, { size: 10, color: p.textMuted }));
    // heat pct
    els.push(text(W - 56, hy + 12, 40, 16, `${Math.round(f.heat * 100)}°`, {
      size: 14, weight: 700, color: heatColor, align: 'right',
    }));
  });

  els.push(...bottomNav('debt'));
  return makeScreen('debt', 'Debt', p.bg, els);
}

// ── Screen 5: AI Insight ──────────────────────────────────────────────────────
function makeInsightScreen() {
  const els = [rect(0, 0, W, H, p.bg)];
  els.push(...statusBar());

  // AI weekly digest header — editorial, large typography
  els.push(text(20, 52, 280, 14, 'WEEKLY INSIGHT — WK 13', { size: 10, weight: 700, color: p.accent }));
  els.push(text(20, 70, W - 40, 52, 'Your best week in six months.', {
    size: 24, weight: 800, color: p.text, leading: 1.3,
  }));
  els.push(text(20, 130, W - 40, 36, 'Authentication shipped clean. One debt hotspot needs attention before Sprint 14.',
    { size: 12, color: p.textMuted, leading: 1.6 }
  ));

  // Divider
  els.push(rect(20, 174, W - 40, 1, p.border));

  // Key signal cards
  const signals = [
    {
      icon: '↑',
      label: 'Velocity Spike',
      body: 'Commit rate +18% vs last week. Cluster around auth module — all passing tests.',
      color: p.green,
    },
    {
      icon: '◎',
      label: 'Debt Alert',
      body: 'globalState.ts accumulated 7 new smells. Refactor recommended before new feature work.',
      color: p.yellow,
    },
    {
      icon: '◈',
      label: 'Review Health',
      body: 'Cycle time down 12% to 4.2 hrs. Ryo and Kaz are reviewing within 2h on average.',
      color: p.accent,
    },
  ];
  signals.forEach((s, i) => {
    const sy = 190 + i * 84;
    els.push(rect(16, sy, W - 32, 74, p.surface, { radius: 12, stroke: p.border, strokeWidth: 1 }));
    // icon circle
    els.push(circle(42, sy + 28, 18, `${s.color}18`));
    els.push(text(34, sy + 21, 24, 24, s.icon, { size: 18, color: s.color, align: 'center' }));
    els.push(text(68, sy + 10, W - 100, 14, s.label, { size: 12, weight: 700, color: p.text }));
    els.push(text(68, sy + 28, W - 100, 34, s.body, { size: 10, color: p.textMuted, leading: 1.5 }));
  });

  // Next sprint recommendation
  const recY = 190 + 3 * 84 + 8;
  els.push(rect(16, recY, W - 32, 68, p.accentDim2, { radius: 12, stroke: p.accentDim, strokeWidth: 1 }));
  els.push(text(28, recY + 10, W - 56, 12, 'SPRINT 14 RECOMMENDATION', { size: 9, weight: 700, color: p.accent }));
  els.push(text(28, recY + 26, W - 56, 36,
    'Refactor globalState.ts before adding new state. Estimated 2 hrs. Unlocks clean Sprint 15 delivery.',
    { size: 11, color: p.textMuted, leading: 1.55 }
  ));

  // Ask AI
  els.push(rect(16, recY + 84, W - 32, 40, p.raised, { radius: 10, stroke: p.border, strokeWidth: 1 }));
  els.push(text(28, recY + 98, 22, 18, '✦', { size: 16, color: p.accent }));
  els.push(text(52, recY + 102, W - 90, 14, 'Ask about this week...', { size: 12, color: p.textDim }));
  els.push(text(W - 44, recY + 98, 28, 18, '→', { size: 16, color: p.accent, align: 'center' }));

  els.push(...bottomNav('insight'));
  return makeScreen('insight', 'Insight', p.bg, els);
}

// ── Assemble & Write ──────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: 'CHAR — Code Analytics, Distilled',
  screens: [
    makePulseScreen(),
    makeCommitsScreen(),
    makeReviewsScreen(),
    makeDebtScreen(),
    makeInsightScreen(),
  ],
};

fs.writeFileSync('char.pen', JSON.stringify(pen, null, 2));
console.log('✓ char.pen written —', pen.screens.length, 'screens');
pen.screens.forEach(s => console.log(`  · ${s.label} (${s.elements.length} elements)`));
