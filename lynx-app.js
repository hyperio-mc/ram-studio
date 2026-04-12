// LYNX — AI Code Intelligence
// Inspired by: Factory.ai (lapa.ninja AI section) — numbered agent sequence UI,
//              Geist font, agent-native terminal aesthetic
//              108.supply (darkmodedesign.com) — #111 charcoal dark, cream text,
//              digit-counter typographic style
//              Evervault (godly.website) — deep blue-black #010314, lavender-ish text
// Dark theme: #060A17 bg, #818CF8 indigo accent, lavender-cream text
// New pattern: file tree explorer with AI health overlays per path
// Pencil.dev v2.8

const fs   = require('fs');
const path = require('path');

const BG       = '#060A17';   // deep blue-black (Evervault-inspired)
const SURFACE  = '#0D1424';   // card surface
const SURFACE2 = '#141C35';   // elevated card
const TEXT     = '#E2E6F8';   // lavender-cream (108.supply-inspired)
const MUTED    = 'rgba(226,230,248,0.45)';
const DIM      = 'rgba(226,230,248,0.10)';
const ACCENT   = '#818CF8';   // soft indigo — vibrant on deep dark
const ACCENT2  = '#34D399';   // emerald — healthy/green status
const WARN     = '#FBBF24';   // amber — warnings
const ERROR    = '#F87171';   // red — critical issues
const BORDER   = 'rgba(226,230,248,0.08)';

function rect(x, y, w, h, fill, opts = {}) {
  return { type: 'rect', x, y, width: w, height: h, fill,
    radius: opts.radius ?? 0, opacity: opts.opacity ?? 1 };
}
function text(content, x, y, opts = {}) {
  return {
    type: 'text', content, x, y,
    fontSize: opts.size ?? 13,
    fontWeight: opts.weight ?? 'regular',
    color: opts.color ?? TEXT,
    align: opts.align ?? 'left',
    fontFamily: opts.font ?? 'Inter',
    opacity: opts.opacity ?? 1,
  };
}
function line(x1, y1, x2, y2, color = DIM, width = 1) {
  return { type: 'line', x1, y1, x2, y2, stroke: color, strokeWidth: width };
}
function circle(cx, cy, r, fill, opts = {}) {
  return { type: 'circle', cx, cy, r, fill, opacity: opts.opacity ?? 1 };
}
function pill(x, y, w, h, fill, opts = {}) {
  return rect(x, y, w, h, fill, { ...opts, radius: opts.radius ?? h / 2 });
}

// ─── STATUS BAR + NAV HELPERS ────────────────────────────────────────────────
function statusBar(els, W) {
  els.push(text('9:41', 20, 16, { size: 12, weight: 'semibold', color: TEXT }));
  els.push(text('● ●  ◈  🔋', W - 80, 16, { size: 10, color: MUTED }));
}

function bottomNav(els, W, H, active) {
  els.push(rect(0, H - 72, W, 72, SURFACE, { opacity: 0.95 }));
  els.push(line(0, H - 72, W, H - 72, BORDER));
  const tabs = [
    { id: 'scan',    icon: '◎', label: 'Scan' },
    { id: 'explore', icon: '⊟', label: 'Files' },
    { id: 'agents',  icon: '⚡', label: 'Agents' },
    { id: 'issues',  icon: '⚠', label: 'Issues' },
    { id: 'commits', icon: '↑', label: 'History' },
  ];
  const tabW = W / tabs.length;
  tabs.forEach((t, i) => {
    const cx = tabW * i + tabW / 2;
    const isActive = t.id === active;
    const col = isActive ? ACCENT : MUTED;
    if (isActive) els.push(rect(cx - 22, H - 72, 44, 2, ACCENT, { radius: 1 }));
    els.push(text(t.icon, cx, H - 51, { size: 18, color: col, align: 'center' }));
    els.push(text(t.label, cx, H - 27, { size: 10, color: col, align: 'center', weight: isActive ? 'semibold' : 'regular' }));
  });
}

// ─── SCREEN 1: SCAN (Repository Health Overview) ─────────────────────────────
function screenScan() {
  const els = [];
  const W = 390, H = 844;
  els.push(rect(0, 0, W, H, BG));

  // Subtle gradient glow behind score ring
  els.push({ type: 'ellipse', cx: 195, cy: 280, rx: 160, ry: 140, fill: ACCENT, opacity: 0.06 });

  statusBar(els, W);

  // Header
  els.push(text('LYNX', 20, 50, { size: 22, weight: 'bold', color: TEXT, font: 'Inter' }));
  els.push(text('main  ·  last scan 2m ago', 20, 72, { size: 11, color: MUTED }));
  // Live badge
  els.push(pill(W - 72, 44, 56, 20, 'rgba(52,211,153,0.15)', { radius: 4 }));
  els.push(text('● LIVE', W - 58, 57, { size: 10, color: ACCENT2, weight: 'semibold' }));

  // Separator
  els.push(line(20, 88, W - 20, 88, BORDER));

  // ── Score Ring ──
  // Outer ring (track)
  const ringCX = 195, ringCY = 200, ringR = 80;
  els.push(circle(ringCX, ringCY, ringR + 12, DIM));
  els.push(circle(ringCX, ringCY, ringR + 12, 'none'));
  // Simulate arc with partial fill using layered circles
  // We'll use ellipse segments — approximate with overlapping circles for arc effect
  for (let i = 0; i < 36; i++) {
    const angle = (i / 36) * Math.PI * 1.85 - Math.PI * 0.92;
    const health = 87; // score
    const active = i < Math.round((health / 100) * 36);
    const cx = ringCX + (ringR + 4) * Math.cos(angle);
    const cy = ringCY + (ringR + 4) * Math.sin(angle);
    els.push(circle(cx, cy, 5.5, active ? ACCENT : DIM, { opacity: active ? 1 : 0.5 }));
  }
  // Glow center
  els.push(circle(ringCX, ringCY, ringR - 10, SURFACE, { opacity: 0.9 }));
  // Score text
  els.push(text('87', ringCX, ringCY - 8, { size: 38, weight: 'bold', color: TEXT, align: 'center' }));
  els.push(text('health score', ringCX, ringCY + 18, { size: 10, color: MUTED, align: 'center' }));

  // Branch tag under ring
  els.push(pill(ringCX - 38, ringCY + 36, 76, 20, 'rgba(129,140,248,0.15)', { radius: 4 }));
  els.push(text('⬡ github/acme', ringCX, ringCY + 48, { size: 9, color: ACCENT, align: 'center', weight: 'semibold' }));

  // ── Counter row (108.supply digit-counter style) ──
  const counters = [
    { value: '1,247', label: 'FILES', color: TEXT },
    { value: '74%',   label: 'COVERAGE', color: ACCENT2 },
    { value: '38',    label: 'ISSUES', color: WARN },
    { value: '3',     label: 'AGENTS', color: ACCENT },
  ];
  const cW = (W - 40) / 4;
  els.push(rect(20, 320, W - 40, 72, SURFACE, { radius: 10 }));
  counters.forEach((c, i) => {
    const cx = 20 + cW * i + cW / 2;
    if (i > 0) els.push(line(20 + cW * i, 330, 20 + cW * i, 382, BORDER));
    els.push(text(c.value, cx, 351, { size: 17, weight: 'bold', color: c.color, align: 'center' }));
    els.push(text(c.label, cx, 369, { size: 9, color: MUTED, align: 'center', weight: 'semibold' }));
  });

  // ── Language breakdown ──
  els.push(text('LANGUAGE BREAKDOWN', 20, 410, { size: 10, color: MUTED, weight: 'semibold' }));
  const langs = [
    { name: 'TypeScript', pct: 58, color: ACCENT },
    { name: 'Python',     pct: 22, color: ACCENT2 },
    { name: 'CSS',        pct: 12, color: WARN },
    { name: 'Other',      pct: 8,  color: DIM },
  ];
  const barY = 424;
  const barW = W - 40;
  let bx = 20;
  langs.forEach(l => {
    const w = Math.round(barW * l.pct / 100);
    els.push(rect(bx, barY, w - 2, 6, l.color, { radius: 3 }));
    bx += w;
  });
  // Legend
  langs.forEach((l, i) => {
    const lx = 20 + i * 90;
    els.push(circle(lx + 6, 443, 4, l.color));
    els.push(text(`${l.name}  ${l.pct}%`, lx + 14, 447, { size: 10, color: MUTED }));
  });

  // ── Recent insight card ──
  els.push(rect(20, 462, W - 40, 70, SURFACE, { radius: 10 }));
  els.push(rect(20, 462, 3, 70, ACCENT2, { radius: 2 }));
  els.push(text('AI Insight', 34, 476, { size: 10, color: ACCENT2, weight: 'semibold' }));
  els.push(text('Coverage up 4% since last sprint. Auth module', 34, 494, { size: 12, color: TEXT }));
  els.push(text('needs attention — 12 uncovered branches found.', 34, 510, { size: 12, color: TEXT }));
  els.push(text('View details →', 34, 524, { size: 11, color: ACCENT }));

  // ── Activity mini-chart ──
  els.push(text('SCAN HISTORY — 14 DAYS', 20, 550, { size: 10, color: MUTED, weight: 'semibold' }));
  const chartH = 50, chartY = 565, chartBarW = 14;
  const bars = [72, 75, 74, 78, 80, 78, 79, 82, 81, 84, 83, 86, 85, 87];
  bars.forEach((v, i) => {
    const bh = Math.round(((v - 68) / 20) * chartH);
    const bx2 = 20 + i * (chartBarW + 5);
    const isLast = i === bars.length - 1;
    els.push(rect(bx2, chartY + chartH - bh, chartBarW, bh, isLast ? ACCENT : DIM, { radius: 2 }));
  });
  els.push(text('72', 20, 620, { size: 9, color: MUTED }));
  els.push(text('87', W - 30, 620, { size: 9, color: ACCENT, weight: 'semibold' }));

  bottomNav(els, W, H, 'scan');

  return { id: 'scan', label: 'Scan', width: W, height: H, elements: els };
}

// ─── SCREEN 2: EXPLORER (File Tree with AI Health Overlays) ──────────────────
function screenExplorer() {
  const els = [];
  const W = 390, H = 844;
  els.push(rect(0, 0, W, H, BG));

  statusBar(els, W);

  // Header
  els.push(text('FILES', 20, 50, { size: 22, weight: 'bold', color: TEXT }));
  els.push(text('1,247 files · 38 issues', 20, 72, { size: 11, color: MUTED }));

  // Search bar
  els.push(rect(20, 88, W - 40, 36, SURFACE, { radius: 8 }));
  els.push(text('🔍  Search files...', 36, 110, { size: 12, color: MUTED }));
  els.push(pill(W - 70, 94, 44, 24, 'rgba(129,140,248,0.15)', { radius: 6 }));
  els.push(text('Filter', W - 62, 110, { size: 10, color: ACCENT }));

  els.push(line(20, 136, W - 20, 136, BORDER));

  // Sort tabs
  ['All', 'Issues', 'Low Cover', 'Modified'].forEach((t, i) => {
    const tx = 20 + i * 84;
    const isA = i === 0;
    if (isA) els.push(pill(tx, 142, 52, 22, 'rgba(129,140,248,0.18)', { radius: 6 }));
    els.push(text(t, tx + 6, 157, { size: 11, color: isA ? ACCENT : MUTED, weight: isA ? 'semibold' : 'regular' }));
  });

  // File tree entries — the key new interaction pattern
  const treeItems = [
    { depth: 0, name: 'src/',         type: 'dir',  health: 85, coverage: '78%', issues: 14, color: ACCENT2 },
    { depth: 1, name: 'components/',  type: 'dir',  health: 92, coverage: '88%', issues: 3,  color: ACCENT2 },
    { depth: 2, name: 'Button.tsx',   type: 'file', health: 98, coverage: '100%',issues: 0,  color: ACCENT2 },
    { depth: 2, name: 'Modal.tsx',    type: 'file', health: 71, coverage: '62%', issues: 4,  color: WARN },
    { depth: 2, name: 'Table.tsx',    type: 'file', health: 55, coverage: '41%', issues: 7,  color: ERROR },
    { depth: 1, name: 'lib/',         type: 'dir',  health: 79, coverage: '73%', issues: 8,  color: WARN },
    { depth: 2, name: 'auth.ts',      type: 'file', health: 61, coverage: '48%', issues: 5,  color: ERROR },
    { depth: 2, name: 'utils.ts',     type: 'file', health: 88, coverage: '85%', issues: 1,  color: ACCENT2 },
    { depth: 1, name: 'pages/',       type: 'dir',  health: 82, coverage: '76%', issues: 3,  color: ACCENT2 },
    { depth: 2, name: 'index.tsx',    type: 'file', health: 90, coverage: '91%', issues: 0,  color: ACCENT2 },
    { depth: 2, name: 'settings.tsx', type: 'file', health: 67, coverage: '55%', issues: 3,  color: WARN },
    { depth: 0, name: 'tests/',       type: 'dir',  health: 94, coverage: '—',   issues: 0,  color: ACCENT2 },
    { depth: 0, name: 'scripts/',     type: 'dir',  health: 72, coverage: '60%', issues: 2,  color: WARN },
  ];

  const rowH = 42, startY = 176;
  treeItems.forEach((item, i) => {
    const y = startY + i * rowH;
    if (y > H - 100) return;
    const indent = 20 + item.depth * 20;
    const isDir = item.type === 'dir';

    // Row bg
    if (i % 2 === 0) els.push(rect(0, y, W, rowH, SURFACE, { opacity: 0.3 }));

    // Tree connector lines
    if (item.depth > 0) {
      els.push(line(indent - 10, y + rowH / 2, indent + 4, y + rowH / 2, BORDER, 1));
    }
    // Icon
    const icon = isDir ? '▸' : '·';
    els.push(text(icon, indent, y + 24, { size: isDir ? 12 : 16, color: MUTED, weight: isDir ? 'bold' : 'regular' }));
    // Name
    els.push(text(item.name, indent + 16, y + 24, {
      size: 12, weight: isDir ? 'semibold' : 'regular',
      color: isDir ? TEXT : 'rgba(226,230,248,0.8)'
    }));

    // Right side: health bar + metrics
    const barX = W - 140, barY2 = y + 18, barW = 60, barH2 = 4;
    const filled = Math.round(barW * item.health / 100);
    els.push(rect(barX, barY2, barW, barH2, DIM, { radius: 2 }));
    els.push(rect(barX, barY2, filled, barH2, item.color, { radius: 2 }));

    // Score
    els.push(text(`${item.health}`, barX - 28, y + 24, { size: 11, color: item.color, weight: 'semibold', align: 'right' }));

    // Issues badge
    if (item.issues > 0) {
      els.push(pill(W - 46, y + 12, 26, 18, item.color === ERROR ? 'rgba(248,113,113,0.18)' : 'rgba(251,191,36,0.15)', { radius: 5 }));
      els.push(text(`${item.issues}`, W - 33, y + 24, { size: 10, color: item.color, align: 'center', weight: 'semibold' }));
    }
  });

  bottomNav(els, W, H, 'explore');

  return { id: 'explorer', label: 'Files', width: W, height: H, elements: els };
}

// ─── SCREEN 3: AGENTS (Factory.ai inspired numbered agent list) ───────────────
function screenAgents() {
  const els = [];
  const W = 390, H = 844;
  els.push(rect(0, 0, W, H, BG));

  // Accent glow
  els.push({ type: 'ellipse', cx: 195, cy: 200, rx: 180, ry: 100, fill: ACCENT, opacity: 0.04 });

  statusBar(els, W);

  els.push(text('AGENTS', 20, 50, { size: 22, weight: 'bold', color: TEXT }));
  els.push(text('3 active  ·  12 tasks completed today', 20, 72, { size: 11, color: MUTED }));

  // Tabs
  els.push(line(20, 90, W - 20, 90, BORDER));
  ['Active', 'Queued', 'History'].forEach((t, i) => {
    const tx = 20 + i * 100;
    const isA = i === 0;
    els.push(text(t, tx, 108, { size: 13, color: isA ? ACCENT : MUTED, weight: isA ? 'semibold' : 'regular' }));
    if (isA) els.push(line(tx, 116, tx + 52, 116, ACCENT, 2));
  });

  // Factory.ai inspired: numbered agent cards
  const agents = [
    {
      num: '01', name: 'REFACTOR-α',
      task: 'Extracting auth logic into composable hooks',
      file: 'src/lib/auth.ts  →  src/hooks/useAuth.ts',
      status: 'RUNNING', statusColor: ACCENT2,
      lines: '+142  −88', time: '14m running',
      progress: 68,
    },
    {
      num: '02', name: 'COVER-β',
      task: 'Writing unit tests for Table component',
      file: 'src/components/Table.tsx  ·  coverage: 41%→?',
      status: 'RUNNING', statusColor: ACCENT2,
      lines: '+210  −0', time: '9m running',
      progress: 44,
    },
    {
      num: '03', name: 'AUDIT-γ',
      task: 'Scanning for XSS vulnerabilities in forms',
      file: 'src/pages/settings.tsx  ·  3 suspects found',
      status: 'PAUSED', statusColor: WARN,
      lines: '+0  −0', time: 'awaiting review',
      progress: 100,
    },
  ];

  let cardY = 132;
  agents.forEach(a => {
    const cardH = 138;
    els.push(rect(20, cardY, W - 40, cardH, SURFACE, { radius: 12 }));

    // Left accent strip
    const stripColor = a.status === 'RUNNING' ? ACCENT : WARN;
    els.push(rect(20, cardY, 3, cardH, stripColor, { radius: 2 }));

    // Numbered badge (Factory.ai style)
    els.push(text(a.num, 36, cardY + 18, { size: 11, weight: 'bold', color: ACCENT, font: 'Inter' }));
    els.push(line(52, cardY + 8, 52, cardY + 26, BORDER));

    // Agent name + status
    els.push(text(a.name, 62, cardY + 18, { size: 13, weight: 'bold', color: TEXT }));
    const statusW = a.status === 'RUNNING' ? 60 : 54;
    els.push(pill(W - 40 - statusW, cardY + 8, statusW, 20, a.statusColor === ACCENT2 ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)', { radius: 5 }));
    els.push(text(a.status, W - 40 - statusW + 8, cardY + 20, { size: 9, weight: 'bold', color: a.statusColor }));

    // Task description
    els.push(text(a.task, 36, cardY + 40, { size: 12, color: TEXT }));
    els.push(text(a.file, 36, cardY + 57, { size: 10, color: MUTED }));

    // Progress bar
    if (a.status === 'RUNNING') {
      els.push(rect(36, cardY + 73, W - 76, 4, DIM, { radius: 2 }));
      els.push(rect(36, cardY + 73, Math.round((W - 76) * a.progress / 100), 4, stripColor, { radius: 2 }));
      els.push(text(`${a.progress}%`, W - 42, cardY + 78, { size: 10, color: MUTED, align: 'right' }));
    }

    // Footer metrics
    els.push(line(36, cardY + 90, W - 40, cardY + 90, BORDER));
    els.push(text('⌥  ' + a.lines, 36, cardY + 108, { size: 11, color: TEXT }));
    els.push(text('⏱  ' + a.time, W - 40, cardY + 108, { size: 11, color: MUTED, align: 'right' }));

    // Stop/Review button
    const btnLabel = a.status === 'PAUSED' ? 'Review →' : 'Stop';
    const btnColor = a.status === 'PAUSED' ? ACCENT : ERROR;
    els.push(text(btnLabel, W - 42, cardY + 126, { size: 11, color: btnColor, align: 'right', weight: 'semibold' }));

    cardY += cardH + 12;
  });

  // Queue callout
  els.push(rect(20, cardY, W - 40, 52, 'rgba(129,140,248,0.08)', { radius: 10 }));
  els.push(line(20, cardY, W - 20, cardY, BORDER));
  els.push(text('+ 2 agents queued', 36, cardY + 20, { size: 12, color: MUTED }));
  els.push(text('Start next →', W - 40, cardY + 20, { size: 12, color: ACCENT, align: 'right', weight: 'semibold' }));
  els.push(text('COVER-δ  ·  LINT-ε', 36, cardY + 38, { size: 10, color: MUTED }));

  bottomNav(els, W, H, 'agents');

  return { id: 'agents', label: 'Agents', width: W, height: H, elements: els };
}

// ─── SCREEN 4: ISSUES (Technical Debt Board) ─────────────────────────────────
function screenIssues() {
  const els = [];
  const W = 390, H = 844;
  els.push(rect(0, 0, W, H, BG));

  statusBar(els, W);

  els.push(text('ISSUES', 20, 50, { size: 22, weight: 'bold', color: TEXT }));
  els.push(text('38 open  ·  12 resolved this week', 20, 72, { size: 11, color: MUTED }));

  // Severity distribution bar
  const sevY = 90, sevW = W - 40;
  const segs = [
    { label: 'Critical', count: 3,  pct: 8,  color: ERROR },
    { label: 'High',     count: 9,  pct: 24, color: WARN },
    { label: 'Medium',   count: 14, pct: 37, color: ACCENT },
    { label: 'Low',      count: 12, pct: 31, color: DIM },
  ];
  let sx = 20;
  segs.forEach(s => {
    const w = Math.round(sevW * s.pct / 100) - 2;
    els.push(rect(sx, sevY, w, 6, s.color, { radius: 3, opacity: s.color === DIM ? 0.5 : 1 }));
    sx += w + 2;
  });
  segs.forEach((s, i) => {
    const lx = 20 + i * 86;
    els.push(circle(lx + 5, 113, 4, s.color, { opacity: s.color === DIM ? 0.5 : 1 }));
    els.push(text(`${s.count} ${s.label}`, lx + 12, 117, { size: 9, color: MUTED }));
  });

  // Filter chips
  const chips = ['All', 'Critical', 'High', 'Auth'];
  chips.forEach((c, i) => {
    const chipX = 20 + i * 72;
    const isA = i === 0;
    els.push(pill(chipX, 128, 62, 22, isA ? 'rgba(129,140,248,0.2)' : SURFACE, { radius: 6 }));
    els.push(text(c, chipX + 10, 143, { size: 11, color: isA ? ACCENT : MUTED, weight: isA ? 'semibold' : 'regular' }));
  });

  // Issue cards
  const issues = [
    {
      id: 'LX-041', severity: 'CRITICAL', color: ERROR,
      title: 'SQL injection vector in search query builder',
      file: 'src/lib/db.ts:142', effort: '2h',
      tags: ['security', 'sql'],
      agent: 'Needs agent',
    },
    {
      id: 'LX-038', severity: 'CRITICAL', color: ERROR,
      title: 'Unvalidated user input passed to eval()',
      file: 'src/pages/script-runner.tsx:89', effort: '1h',
      tags: ['security', 'xss'],
      agent: 'AUDIT-γ reviewing',
    },
    {
      id: 'LX-035', severity: 'HIGH', color: WARN,
      title: 'No rate limiting on /api/export endpoint',
      file: 'src/pages/api/export.ts:15', effort: '3h',
      tags: ['api', 'perf'],
      agent: 'Unassigned',
    },
    {
      id: 'LX-029', severity: 'HIGH', color: WARN,
      title: 'Memory leak in WebSocket connection manager',
      file: 'src/lib/ws.ts:220', effort: '4h',
      tags: ['memory', 'ws'],
      agent: 'Unassigned',
    },
    {
      id: 'LX-022', severity: 'MEDIUM', color: ACCENT,
      title: 'Modal.tsx missing keyboard trap for accessibility',
      file: 'src/components/Modal.tsx:67', effort: '1.5h',
      tags: ['a11y', 'ui'],
      agent: 'Unassigned',
    },
  ];

  let issueY = 162;
  issues.forEach(iss => {
    if (issueY > H - 90) return;
    const cardH = 102;
    els.push(rect(20, issueY, W - 40, cardH, SURFACE, { radius: 10 }));
    els.push(rect(20, issueY, 3, cardH, iss.color, { radius: 2 }));

    // ID + severity
    els.push(text(iss.id, 34, issueY + 16, { size: 10, color: MUTED, weight: 'semibold' }));
    els.push(pill(W - 96, issueY + 7, 70, 18, iss.color === ERROR ? 'rgba(248,113,113,0.15)' : 'rgba(251,191,36,0.12)', { radius: 4 }));
    els.push(text(iss.severity, W - 92, issueY + 18, { size: 9, weight: 'bold', color: iss.color }));

    // Title
    els.push(text(iss.title, 34, issueY + 34, { size: 12, color: TEXT }));

    // File
    els.push(text('⊟  ' + iss.file, 34, issueY + 50, { size: 10, color: MUTED }));

    // Tags
    iss.tags.forEach((tag, ti) => {
      const tagX = 34 + ti * 64;
      els.push(pill(tagX, issueY + 62, 54, 16, DIM, { radius: 4 }));
      els.push(text(tag, tagX + 8, issueY + 73, { size: 9, color: MUTED }));
    });

    // Agent + effort
    els.push(text('⏱ ' + iss.effort, W - 60, issueY + 50, { size: 10, color: MUTED, align: 'right' }));
    els.push(text(iss.agent, W - 40, issueY + 73, { size: 10, color: iss.agent.startsWith('AUDIT') ? ACCENT : MUTED, align: 'right' }));

    issueY += cardH + 10;
  });

  bottomNav(els, W, H, 'issues');

  return { id: 'issues', label: 'Issues', width: W, height: H, elements: els };
}

// ─── SCREEN 5: COMMITS (Git Timeline with AI Annotations) ────────────────────
function screenCommits() {
  const els = [];
  const W = 390, H = 844;
  els.push(rect(0, 0, W, H, BG));

  statusBar(els, W);

  els.push(text('HISTORY', 20, 50, { size: 22, weight: 'bold', color: TEXT }));
  els.push(text('main  ·  142 commits this month', 20, 72, { size: 11, color: MUTED }));

  // Timeline line
  const tlX = 44;
  els.push(line(tlX, 90, tlX, H - 80, BORDER, 1));

  const commits = [
    {
      hash: 'a7f3c2d', time: '2m ago',
      author: 'AI · REFACTOR-α',
      msg: 'Extract auth hooks from lib/auth.ts',
      insight: 'Agent commit · +142 −88',
      insightColor: ACCENT,
      dot: ACCENT,
    },
    {
      hash: 'b9e14ab', time: '1h ago',
      author: 'Elena M.',
      msg: 'Add pagination to /api/export endpoint',
      insight: 'Addresses LX-035 partially',
      insightColor: WARN,
      dot: TEXT,
    },
    {
      hash: 'c2d8f7e', time: '3h ago',
      author: 'James T.',
      msg: 'feat: modal keyboard trap implementation',
      insight: 'Fixes LX-022 · coverage +6%',
      insightColor: ACCENT2,
      dot: TEXT,
    },
    {
      hash: 'de1c9b3', time: '5h ago',
      author: 'AI · COVER-β',
      msg: 'Add test suite for Table component (WIP)',
      insight: 'Agent commit · 34 tests added',
      insightColor: ACCENT,
      dot: ACCENT,
    },
    {
      hash: 'ea7f2d1', time: '1d ago',
      author: 'Elena M.',
      msg: 'refactor: clean up deprecated API calls',
      insight: '↓ bundle size 4.2 KB',
      insightColor: ACCENT2,
      dot: TEXT,
    },
    {
      hash: 'f03b8c6', time: '1d ago',
      author: 'Rakis Dev',
      msg: 'chore: update dependencies to latest',
      insight: '3 minor vulns resolved',
      insightColor: ACCENT2,
      dot: TEXT,
    },
    {
      hash: 'g8f1e04', time: '2d ago',
      author: 'James T.',
      msg: 'fix: WebSocket reconnection logic',
      insight: 'Related to LX-029',
      insightColor: WARN,
      dot: TEXT,
    },
  ];

  let cy = 98;
  commits.forEach(c => {
    if (cy > H - 90) return;
    const cardH = 80;

    // Timeline dot
    const isAgent = c.author.startsWith('AI');
    if (isAgent) {
      els.push(rect(tlX - 8, cy + 8, 16, 16, SURFACE2, { radius: 4 }));
      els.push(text('⚡', tlX, cy + 17, { size: 10, color: ACCENT, align: 'center' }));
    } else {
      els.push(circle(tlX, cy + 14, 6, SURFACE));
      els.push(circle(tlX, cy + 14, 4, c.dot));
    }

    // Time
    els.push(text(c.time, 66, cy + 12, { size: 10, color: MUTED }));
    // Hash
    els.push(pill(W - 72, cy + 4, 56, 18, DIM, { radius: 4 }));
    els.push(text(c.hash.slice(0, 7), W - 68, cy + 15, { size: 9, color: MUTED, weight: 'semibold' }));

    // Author
    els.push(text(c.author, 66, cy + 29, { size: 11, weight: 'semibold', color: isAgent ? ACCENT : TEXT }));

    // Message
    els.push(text(c.msg, 66, cy + 46, { size: 12, color: TEXT }));

    // AI insight chip
    els.push(text('◈ ' + c.insight, 66, cy + 63, { size: 10, color: c.insightColor }));

    els.push(line(66, cy + cardH - 4, W - 20, cy + cardH - 4, BORDER));

    cy += cardH;
  });

  bottomNav(els, W, H, 'commits');

  return { id: 'commits', label: 'History', width: W, height: H, elements: els };
}

// ─── ASSEMBLE + WRITE ─────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  id: 'lynx-code-intel-' + Date.now(),
  name: 'LYNX — AI Code Intelligence',
  description: 'Dark AI code intelligence platform. Inspired by Factory.ai numbered agent UI (lapa.ninja), 108.supply charcoal+cream aesthetic (darkmodedesign.com), and Evervault deep blue-black (godly.website). New pattern: file tree explorer with per-path AI health overlays.',
  theme: 'dark',
  palette: { bg: BG, surface: SURFACE, text: TEXT, accent: ACCENT, accent2: ACCENT2, muted: MUTED },
  screens: [
    screenScan(),
    screenExplorer(),
    screenAgents(),
    screenIssues(),
    screenCommits(),
  ],
};

const outPath = path.join(__dirname, 'lynx.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ lynx.pen written (${(fs.statSync(outPath).size / 1024).toFixed(1)} KB)`);
console.log(`  Screens: ${pen.screens.map(s => s.label).join(', ')}`);
