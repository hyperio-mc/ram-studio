// DISPATCH — AI Agent Orchestration Dashboard
// Inspired by: NaughtyDuk© (godly.website) live clock + bold agency availability display
//              JetBrains Air "Multitask with agents, stay in control" (lapa.ninja)
// Dark terminal-teal theme: deep navy-black, #00D4AA teal, #5B8AF0 electric blue
// Pencil.dev v2.8 format

const fs = require('fs');
const path = require('path');

const BG       = '#080B0F';
const SURFACE  = '#111720';
const SURFACE2 = '#1A2030';
const TEXT     = '#E4ECF5';
const MUTED    = '#6B7D8E';
const ACCENT   = '#00D4AA';  // terminal teal
const ACCENT2  = '#5B8AF0';  // electric blue
const WARN     = '#F5A623';  // amber
const ERR      = '#F04B4B';  // red
const DIM      = '#1E2A38';
const SUCCESS  = '#00D4AA';

function rect(x, y, w, h, fill, opts = {}) {
  return { type: 'rect', x, y, width: w, height: h, fill, radius: opts.radius ?? 0, opacity: opts.opacity ?? 1 };
}
function text(content, x, y, opts = {}) {
  return {
    type: 'text', content, x, y,
    fontSize: opts.size ?? 14,
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

// ─── SCREEN 1: COMMAND CENTER ────────────────────────────────────────────────
function screenCommandCenter() {
  const els = [];
  const W = 390, H = 844;

  els.push(rect(0, 0, W, H, BG));
  // Subtle ambient glow top-right
  els.push({ type: 'ellipse', cx: 360, cy: 60, rx: 180, ry: 120, fill: ACCENT2, opacity: 0.05 });
  els.push({ type: 'ellipse', cx: 40,  cy: 400, rx: 140, ry: 100, fill: ACCENT,  opacity: 0.04 });

  // Status bar
  els.push(text('9:41', 20, 16, { size: 13, weight: 'semibold', color: TEXT }));
  els.push(text('●●●  WiFi  🔋', 280, 16, { size: 11, color: MUTED }));

  // App header — monospace agency-style
  els.push(text('DISPATCH', 20, 52, { size: 20, weight: 'bold', color: TEXT, font: 'JetBrains Mono' }));
  els.push(text('v2.4.1', 150, 52, { size: 11, color: MUTED }));
  // Live clock (inspired by NaughtyDuk)
  els.push(text('UTC  16:17:35', 224, 52, { size: 11, color: ACCENT, font: 'JetBrains Mono' }));
  // Agent fleet status pill
  els.push(rect(20, 64, 140, 20, 'rgba(0,212,170,0.1)', { radius: 4 }));
  els.push(text('● 5 agents online', 28, 77, { size: 10, color: ACCENT }));
  els.push(rect(168, 64, 110, 20, 'rgba(91,138,240,0.1)', { radius: 4 }));
  els.push(text('▶ 3 tasks running', 176, 77, { size: 10, color: ACCENT2 }));

  // Live execution timeline
  els.push(text('LIVE TIMELINE', 20, 104, { size: 10, weight: 'bold', color: MUTED }));
  els.push(rect(20, 118, 350, 110, SURFACE, { radius: 12 }));

  // Timeline entries
  const timeline = [
    { time: '16:17', agent: 'Analyst-3', task: 'Compiling Q4 report sections', status: 'running', pct: 72 },
    { time: '16:14', agent: 'Coder-1',   task: 'Refactoring auth module tests',  status: 'done',    pct: 100 },
    { time: '16:09', agent: 'Writer-2',  task: 'Draft blog post: AI in 2026',   status: 'running', pct: 41 },
  ];

  timeline.forEach((t, i) => {
    const ty = 128 + i * 34;
    const statusColor = t.status === 'done' ? ACCENT : t.status === 'running' ? ACCENT2 : WARN;
    els.push(text(t.time, 32, ty + 12, { size: 9, color: MUTED, font: 'JetBrains Mono' }));
    els.push(circle(72, ty + 8, 3, statusColor));
    els.push(text(t.agent, 80, ty + 12, { size: 10, weight: 'semibold', color: statusColor }));
    els.push(text(t.task, 148, ty + 12, { size: 10, color: TEXT, opacity: 0.85 }));
    if (t.status === 'running') {
      els.push(rect(316, ty + 5, 40, 6, DIM, { radius: 3 }));
      els.push(rect(316, ty + 5, 40 * t.pct / 100, 6, ACCENT2, { radius: 3 }));
    } else {
      els.push(text('✓', 350, ty + 12, { size: 10, color: ACCENT }));
    }
    if (i < timeline.length - 1) els.push(line(32, ty + 22, 358, ty + 22, 'rgba(30,42,56,0.8)'));
  });

  // System metrics row
  els.push(text('SYSTEM', 20, 248, { size: 10, weight: 'bold', color: MUTED }));
  const metrics = [
    { label: 'TASKS TODAY', val: '47', sub: '+12 vs yest.' },
    { label: 'SUCCESS RATE', val: '94%', sub: '44/47 done' },
    { label: 'AVG DURATION', val: '2.3m', sub: '-18s vs avg' },
  ];
  metrics.forEach((m, i) => {
    const mx = 20 + i * 122;
    els.push(rect(mx, 262, 114, 72, SURFACE, { radius: 10 }));
    els.push(text(m.label, mx + 10, 276, { size: 8, weight: 'bold', color: MUTED }));
    els.push(text(m.val, mx + 10, 302, { size: 22, weight: 'bold', color: TEXT, font: 'JetBrains Mono' }));
    els.push(text(m.sub, mx + 10, 322, { size: 9, color: ACCENT }));
  });

  // Active agents section
  els.push(text('ACTIVE AGENTS', 20, 354, { size: 10, weight: 'bold', color: MUTED }));
  const agents = [
    { name: 'Analyst-3', model: 'claude-3.7', task: 'Q4 report compilation', pct: 72,  status: 'running' },
    { name: 'Writer-2',  model: 'gpt-4o',     task: 'Blog draft: AI 2026',   pct: 41,  status: 'running' },
    { name: 'Coder-1',   model: 'claude-3.7', task: 'Auth module refactor',  pct: 100, status: 'done' },
    { name: 'Search-4',  model: 'perplexity',  task: 'Market intel: fintech', pct: 18,  status: 'queued' },
  ];

  agents.forEach((a, i) => {
    const ay = 370 + i * 68;
    const statusColor = a.status === 'done' ? ACCENT : a.status === 'running' ? ACCENT2 : MUTED;
    els.push(rect(20, ay, 350, 58, SURFACE, { radius: 10 }));
    // Status dot
    els.push(circle(38, ay + 18, 5, statusColor));
    if (a.status === 'running') els.push(circle(38, ay + 18, 9, statusColor, { opacity: 0.2 }));
    // Name + model
    els.push(text(a.name, 52, ay + 16, { size: 12, weight: 'bold', color: TEXT }));
    els.push(rect(52 + a.name.length * 7.5, ay + 8, a.model.length * 6 + 12, 16, 'rgba(91,138,240,0.12)', { radius: 3 }));
    els.push(text(a.model, 58 + a.name.length * 7.5, ay + 19, { size: 9, color: ACCENT2 }));
    els.push(text(a.task, 52, ay + 34, { size: 11, color: MUTED }));
    // Progress bar
    els.push(rect(200, ay + 28, 130, 5, DIM, { radius: 2 }));
    const barColor = a.status === 'done' ? ACCENT : a.status === 'queued' ? MUTED : ACCENT2;
    els.push(rect(200, ay + 28, 130 * a.pct / 100, 5, barColor, { radius: 2 }));
    els.push(text(`${a.pct}%`, 340, ay + 46, { size: 9, color: barColor, align: 'right', font: 'JetBrains Mono' }));
    if (i < agents.length - 1) els.push(line(20, ay + 58, 370, ay + 58, 'rgba(30,42,56,0.6)'));
  });

  // Quick dispatch button
  els.push(rect(20, 648, 350, 46, ACCENT, { radius: 10 }));
  els.push(text('+ Dispatch New Task', 195, 675, { size: 14, weight: 'bold', color: BG, align: 'center' }));

  // Bottom nav
  els.push(rect(0, 756, W, 88, SURFACE));
  els.push(line(0, 756, W, 756, DIM));
  const navItems = ['⬡ Hub', '▶ Agents', '≡ Queue', '◷ History', '⊙ Config'];
  navItems.forEach((item, i) => {
    const nx = 39 + i * 78;
    const isActive = i === 0;
    els.push(text(item, nx, 800, { size: 11, weight: isActive ? 'semibold' : 'regular', color: isActive ? ACCENT : MUTED, align: 'center' }));
    if (isActive) els.push(rect(nx - 22, 756, 44, 2, ACCENT));
  });
  els.push(rect(155, 833, 80, 4, 'rgba(228,236,245,0.2)', { radius: 2 }));

  return { id: 'screen-1', name: 'Command Center', width: W, height: H, backgroundColor: BG, elements: els };
}

// ─── SCREEN 2: AGENT FLEET ───────────────────────────────────────────────────
function screenAgentFleet() {
  const els = [];
  const W = 390, H = 844;

  els.push(rect(0, 0, W, H, BG));
  els.push({ type: 'ellipse', cx: 195, cy: 160, rx: 220, ry: 130, fill: ACCENT2, opacity: 0.04 });

  els.push(text('9:41', 20, 16, { size: 13, weight: 'semibold', color: TEXT }));
  els.push(text('Agent Fleet', 195, 56, { size: 18, weight: 'bold', color: TEXT, align: 'center' }));
  // Live count
  els.push(rect(312, 44, 58, 22, 'rgba(0,212,170,0.12)', { radius: 6 }));
  els.push(text('5 online', 341, 58, { size: 10, weight: 'bold', color: ACCENT, align: 'center' }));

  // Agent capacity bar
  els.push(rect(20, 76, 350, 50, SURFACE, { radius: 10 }));
  els.push(text('FLEET CAPACITY', 34, 92, { size: 9, weight: 'bold', color: MUTED }));
  els.push(rect(34, 102, 290, 8, DIM, { radius: 4 }));
  // 3 running, 1 queued, 1 idle
  els.push(rect(34, 102, 174, 8, ACCENT2, { radius: 4 })); // running 60%
  els.push(rect(208, 102, 58, 8, ACCENT, { opacity: 0.4, radius: 0 }));  // queued 20%
  els.push(text('3 running', 34, 120, { size: 9, color: ACCENT2 }));
  els.push(text('1 queued', 100, 120, { size: 9, color: MUTED }));
  els.push(text('1 idle', 156, 120, { size: 9, color: MUTED }));
  els.push(text('60%', 334, 108, { size: 10, weight: 'bold', color: ACCENT2, align: 'right', font: 'JetBrains Mono' }));

  // Agent cards
  const fleet = [
    {
      name: 'Analyst-3', model: 'claude-opus-4.5', status: 'running', color: ACCENT2,
      specialty: 'Research · Reports · Data synthesis',
      task: 'Q4 financial report — section 3',
      pct: 72, tokens: '14.2k', cost: '$0.28', eta: '4 min',
    },
    {
      name: 'Writer-2',  model: 'gpt-4o', status: 'running', color: ACCENT2,
      specialty: 'Content · Copywriting · Editing',
      task: 'Blog draft: The Future of AI in 2026',
      pct: 41, tokens: '8.1k', cost: '$0.09', eta: '9 min',
    },
    {
      name: 'Coder-1',   model: 'claude-opus-4.5', status: 'idle', color: ACCENT,
      specialty: 'Code · Tests · Debugging · PRs',
      task: 'Last: Auth refactor — completed 16:14',
      pct: 100, tokens: '22.4k', cost: '$0.44', eta: 'available',
    },
    {
      name: 'Search-4',  model: 'perplexity-pro', status: 'queued', color: MUTED,
      specialty: 'Web research · News · Market intel',
      task: 'Queued: Fintech market analysis 2026',
      pct: 0, tokens: '—', cost: '—', eta: 'waiting',
    },
    {
      name: 'Vision-5',  model: 'gemini-2.0', status: 'idle', color: ACCENT,
      specialty: 'Image analysis · OCR · Visual QA',
      task: 'Last: Brand audit screenshots — 15:52',
      pct: 100, tokens: '5.6k', cost: '$0.06', eta: 'available',
    },
  ];

  fleet.forEach((a, i) => {
    const ay = 140 + i * 116;
    els.push(rect(20, ay, 350, 106, SURFACE, { radius: 12 }));
    // Left status stripe
    const statusColor = a.status === 'running' ? ACCENT2 : a.status === 'idle' ? ACCENT : MUTED;
    els.push(rect(20, ay, 3, 106, statusColor, { radius: 2 }));
    // Header row
    els.push(circle(46, ay + 22, 14, statusColor, { opacity: 0.15 }));
    els.push(text(a.name[0], 46, ay + 26, { size: 13, weight: 'bold', color: statusColor, align: 'center' }));
    els.push(text(a.name, 66, ay + 18, { size: 13, weight: 'bold', color: TEXT }));
    const statusLabel = a.status === 'running' ? '▶ Running' : a.status === 'idle' ? '● Idle' : '⧖ Queued';
    els.push(rect(66 + a.name.length * 7.5, ay + 10, statusLabel.length * 7 + 10, 16, `rgba(${statusColor === ACCENT2 ? '91,138,240' : statusColor === ACCENT ? '0,212,170' : '107,125,142'},0.15)`, { radius: 4 }));
    els.push(text(statusLabel, 72 + a.name.length * 7.5, ay + 21, { size: 9, weight: 'semibold', color: statusColor }));
    // Model badge
    els.push(rect(290, ay + 10, a.model.length * 6 + 10, 16, DIM, { radius: 4 }));
    els.push(text(a.model, 295, ay + 21, { size: 9, color: MUTED }));
    // Specialty
    els.push(text(a.specialty, 66, ay + 36, { size: 10, color: MUTED }));
    // Current task
    els.push(text(a.task, 30, ay + 56, { size: 11, color: a.status === 'running' ? TEXT : MUTED }));
    // Progress bar (only if running)
    if (a.status === 'running') {
      els.push(rect(30, ay + 70, 220, 5, DIM, { radius: 2 }));
      els.push(rect(30, ay + 70, 220 * a.pct / 100, 5, ACCENT2, { radius: 2 }));
      els.push(text(`${a.pct}%`, 256, ay + 76, { size: 9, color: ACCENT2, font: 'JetBrains Mono' }));
    }
    // Stats row
    els.push(text(`Tokens: ${a.tokens}`, 30, ay + 90, { size: 9, color: MUTED }));
    els.push(text(`Cost: ${a.cost}`, 130, ay + 90, { size: 9, color: MUTED }));
    els.push(text(`ETA: ${a.eta}`, 210, ay + 90, { size: 9, color: a.status === 'running' ? WARN : MUTED }));
    els.push(text('→', 354, ay + 90, { size: 12, color: DIM, align: 'right' }));
  });

  // Bottom nav
  els.push(rect(0, 756, W, 88, SURFACE));
  els.push(line(0, 756, W, 756, DIM));
  ['⬡ Hub', '▶ Agents', '≡ Queue', '◷ History', '⊙ Config'].forEach((item, i) => {
    const nx = 39 + i * 78;
    const isActive = i === 1;
    els.push(text(item, nx, 800, { size: 11, weight: isActive ? 'semibold' : 'regular', color: isActive ? ACCENT : MUTED, align: 'center' }));
    if (isActive) els.push(rect(nx - 22, 756, 44, 2, ACCENT));
  });
  els.push(rect(155, 833, 80, 4, 'rgba(228,236,245,0.2)', { radius: 2 }));

  return { id: 'screen-2', name: 'Agent Fleet', width: W, height: H, backgroundColor: BG, elements: els };
}

// ─── SCREEN 3: DISPATCH (new task) ──────────────────────────────────────────
function screenDispatch() {
  const els = [];
  const W = 390, H = 844;

  els.push(rect(0, 0, W, H, BG));

  els.push(text('9:41', 20, 16, { size: 13, weight: 'semibold', color: TEXT }));
  els.push(text('←', 20, 56, { size: 18, color: TEXT }));
  els.push(text('New Task', 195, 56, { size: 18, weight: 'bold', color: TEXT, align: 'center' }));

  // Task input area
  els.push(text('TASK DESCRIPTION', 20, 86, { size: 10, weight: 'bold', color: MUTED }));
  els.push(rect(20, 100, 350, 110, SURFACE, { radius: 10 }));
  els.push(rect(20, 100, 350, 2, ACCENT2, { radius: 2 }));
  els.push(text('Write a competitive analysis of three', 32, 120, { size: 13, color: TEXT }));
  els.push(text('fintech payment apps: Stripe, Adyen, and', 32, 140, { size: 13, color: TEXT }));
  els.push(text('Checkout.com. Focus on pricing models,', 32, 160, { size: 13, color: TEXT }));
  els.push(text('developer experience, and latency benchmarks.', 32, 180, { size: 13, color: TEXT }));
  els.push(text('|', 32, 198, { size: 13, color: ACCENT2 }));

  // AI routing suggestion
  els.push(rect(20, 222, 350, 48, 'rgba(91,138,240,0.08)', { radius: 8 }));
  els.push(text('◉  SMART ROUTE', 32, 238, { size: 9, weight: 'bold', color: ACCENT2 }));
  els.push(text('Analyst-3 + Search-4 → best match for research tasks', 32, 256, { size: 11, color: TEXT }));

  // Agent selection
  els.push(text('ASSIGN TO', 20, 286, { size: 10, weight: 'bold', color: MUTED }));
  const agentOpts = ['Analyst-3', 'Writer-2', 'Coder-1', 'Search-4'];
  agentOpts.forEach((a, i) => {
    const ax = 20 + (i % 2) * 180;
    const ay = 302 + Math.floor(i / 2) * 48;
    const isSelected = i === 0 || i === 3;
    els.push(rect(ax, ay, 168, 38, isSelected ? 'rgba(91,138,240,0.12)' : SURFACE, { radius: 8 }));
    if (isSelected) els.push(rect(ax, ay, 168, 2, ACCENT2, { radius: 2 }));
    els.push(circle(ax + 16, ay + 19, 5, isSelected ? ACCENT2 : MUTED));
    els.push(text(a, ax + 28, ay + 23, { size: 12, weight: isSelected ? 'semibold' : 'regular', color: isSelected ? TEXT : MUTED }));
    if (isSelected) els.push(text('✓', ax + 148, ay + 23, { size: 11, color: ACCENT2, align: 'right' }));
  });

  // Priority
  els.push(text('PRIORITY', 20, 404, { size: 10, weight: 'bold', color: MUTED }));
  const priorities = ['Low', 'Normal', 'High', 'Critical'];
  priorities.forEach((p, i) => {
    const px = 20 + i * 88;
    const isActive = i === 1;
    const color = isActive ? ACCENT2 : MUTED;
    els.push(rect(px, 418, 80, 30, isActive ? 'rgba(91,138,240,0.15)' : SURFACE, { radius: 6 }));
    if (isActive) els.push(rect(px, 418, 80, 2, ACCENT2, { radius: 2 }));
    els.push(text(p, px + 40, 437, { size: 11, weight: isActive ? 'semibold' : 'regular', color, align: 'center' }));
  });

  // Options
  els.push(text('OPTIONS', 20, 466, { size: 10, weight: 'bold', color: MUTED }));
  const options = [
    { label: 'Stream output in real-time', on: true },
    { label: 'Notify on completion', on: true },
    { label: 'Save to history', on: true },
    { label: 'Retry on failure (3x)', on: false },
  ];
  options.forEach((o, i) => {
    const oy = 480 + i * 44;
    els.push(rect(20, oy, 350, 36, SURFACE, { radius: 8 }));
    els.push(text(o.label, 36, oy + 22, { size: 12, color: TEXT }));
    // Toggle
    els.push(rect(316, oy + 10, 36, 18, o.on ? ACCENT : DIM, { radius: 9 }));
    els.push(circle(o.on ? 343 : 325, oy + 19, 7, '#FFFFFF'));
  });

  // Cost estimate
  els.push(rect(20, 662, 350, 44, SURFACE2, { radius: 8 }));
  els.push(text('Estimated cost:', 32, 688, { size: 11, color: MUTED }));
  els.push(text('~$0.18 – $0.35', 160, 688, { size: 12, weight: 'semibold', color: TEXT, font: 'JetBrains Mono' }));
  els.push(text('~6 min', 290, 688, { size: 11, color: WARN }));

  // Dispatch button
  els.push(rect(20, 718, 350, 48, ACCENT, { radius: 10 }));
  els.push(text('▶  Dispatch Task', 195, 747, { size: 15, weight: 'bold', color: BG, align: 'center' }));

  // Bottom nav
  els.push(rect(0, 780, W, 64, SURFACE));
  els.push(line(0, 780, W, 780, DIM));
  ['⬡ Hub', '▶ Agents', '≡ Queue', '◷ History', '⊙ Config'].forEach((item, i) => {
    const nx = 39 + i * 78;
    els.push(text(item, nx, 815, { size: 11, color: MUTED, align: 'center' }));
  });
  els.push(rect(155, 833, 80, 4, 'rgba(228,236,245,0.2)', { radius: 2 }));

  return { id: 'screen-3', name: 'Dispatch Task', width: W, height: H, backgroundColor: BG, elements: els };
}

// ─── SCREEN 4: LIVE RUN (streaming output) ──────────────────────────────────
function screenLiveRun() {
  const els = [];
  const W = 390, H = 844;

  els.push(rect(0, 0, W, H, BG));

  els.push(text('9:41', 20, 16, { size: 13, weight: 'semibold', color: TEXT }));
  els.push(text('←', 20, 56, { size: 18, color: TEXT }));
  els.push(text('Live Run', 195, 56, { size: 18, weight: 'bold', color: TEXT, align: 'center' }));
  // Pulsing live indicator
  els.push(circle(338, 52, 5, ERR));
  els.push(circle(338, 52, 9, ERR, { opacity: 0.2 }));
  els.push(text('LIVE', 350, 55, { size: 10, weight: 'bold', color: ERR }));

  // Task info card
  els.push(rect(20, 76, 350, 64, SURFACE, { radius: 10 }));
  els.push(rect(20, 76, 3, 64, ACCENT2, { radius: 2 }));
  els.push(text('Analyst-3', 34, 92, { size: 11, weight: 'bold', color: ACCENT2 }));
  els.push(text('claude-opus-4.5', 108, 92, { size: 10, color: MUTED }));
  els.push(text('Fintech competitive analysis: Stripe, Adyen, Checkout.com', 34, 112, { size: 11, color: TEXT }));
  els.push(text('Started 16:17 · 2:14 elapsed', 34, 128, { size: 10, color: MUTED }));
  // Live progress
  els.push(rect(240, 92, 118, 6, DIM, { radius: 3 }));
  els.push(rect(240, 92, 85, 6, ACCENT2, { radius: 3 }));
  els.push(text('72%', 312, 108, { size: 10, weight: 'bold', color: ACCENT2, align: 'right', font: 'JetBrains Mono' }));

  // Action trace
  els.push(text('ACTION TRACE', 20, 158, { size: 10, weight: 'bold', color: MUTED }));
  els.push(rect(20, 172, 350, 210, SURFACE, { radius: 10 }));

  const trace = [
    { t: '16:17:01', action: 'search',   detail: 'Query: "Stripe pricing model 2026"',     done: true },
    { t: '16:17:08', action: 'read',     detail: 'Read: stripe.com/docs/billing',            done: true },
    { t: '16:17:22', action: 'search',   detail: 'Query: "Adyen vs Stripe developer API"',   done: true },
    { t: '16:17:41', action: 'read',     detail: 'Read: adyen.com/knowledge-hub/...',         done: true },
    { t: '16:18:12', action: 'analyze',  detail: 'Synthesizing pricing comparison table',     done: true },
    { t: '16:19:02', action: 'write',    detail: 'Writing Section 3: DX benchmarks...',       done: false },
  ];

  trace.forEach((tr, i) => {
    const ty = 180 + i * 32;
    const actionColor = tr.action === 'search' ? ACCENT2 : tr.action === 'read' ? ACCENT : tr.action === 'write' ? WARN : TEXT;
    els.push(text(tr.t, 30, ty + 12, { size: 8, color: MUTED, font: 'JetBrains Mono' }));
    els.push(rect(85, ty + 4, tr.action.length * 7 + 10, 16, `rgba(${actionColor === ACCENT2 ? '91,138,240' : actionColor === ACCENT ? '0,212,170' : actionColor === WARN ? '245,166,35' : '228,236,245'},0.12)`, { radius: 3 }));
    els.push(text(tr.action, 90, ty + 15, { size: 9, weight: 'bold', color: actionColor }));
    els.push(text(tr.detail, 86 + tr.action.length * 7 + 14, ty + 12, { size: 10, color: tr.done ? TEXT : ACCENT2 }));
    if (!tr.done) {
      // Animated cursor
      els.push(text('▋', 354, ty + 12, { size: 10, color: ACCENT2, align: 'right' }));
    }
    if (i < trace.length - 1) els.push(line(30, ty + 24, 358, ty + 24, 'rgba(30,42,56,0.7)'));
  });

  // Streaming output terminal
  els.push(text('STREAM OUTPUT', 20, 396, { size: 10, weight: 'bold', color: MUTED }));
  els.push(rect(20, 410, 350, 220, '#0D1117', { radius: 10 }));
  els.push(rect(20, 410, 350, 24, '#161B22', { radius: 10 }));
  els.push(text('● ● ●', 32, 425, { size: 10, color: MUTED }));
  els.push(text('analyst-3 · output.md', 130, 425, { size: 10, color: MUTED }));

  const outputLines = [
    { txt: '# Fintech Payment API Comparison 2026', color: ACCENT2 },
    { txt: '' },
    { txt: '## 1. Stripe', color: TEXT },
    { txt: '- Pricing: 2.9% + $0.30 per transaction', color: ACCENT },
    { txt: '- API v3: REST, webhooks, SDK for 12 langs', color: TEXT },
    { txt: '- Latency (p99): 180ms avg across US regions', color: MUTED },
    { txt: '' },
    { txt: '## 2. Adyen', color: TEXT },
    { txt: '- Interchange++ model (enterprise only)', color: ACCENT },
    { txt: '- Unified commerce: online + POS + mobile ▋', color: ACCENT2 },
  ];
  outputLines.forEach((l, i) => {
    if (l.txt) {
      els.push(text(l.txt, 30, 448 + i * 18, { size: 10, color: l.color || TEXT, font: 'JetBrains Mono' }));
    }
  });

  // Stop + copy buttons
  els.push(rect(20, 644, 168, 38, 'rgba(240,75,75,0.12)', { radius: 8 }));
  els.push(rect(20, 644, 168, 2, ERR, { radius: 2 }));
  els.push(text('■  Stop Agent', 104, 667, { size: 12, weight: 'semibold', color: ERR, align: 'center' }));
  els.push(rect(202, 644, 168, 38, SURFACE, { radius: 8 }));
  els.push(text('⎘  Copy Output', 286, 667, { size: 12, color: TEXT, align: 'center' }));

  // Bottom nav
  els.push(rect(0, 756, W, 88, SURFACE));
  els.push(line(0, 756, W, 756, DIM));
  ['⬡ Hub', '▶ Agents', '≡ Queue', '◷ History', '⊙ Config'].forEach((item, i) => {
    const nx = 39 + i * 78;
    els.push(text(item, nx, 800, { size: 11, color: MUTED, align: 'center' }));
  });
  els.push(rect(155, 833, 80, 4, 'rgba(228,236,245,0.2)', { radius: 2 }));

  return { id: 'screen-4', name: 'Live Run', width: W, height: H, backgroundColor: BG, elements: els };
}

// ─── SCREEN 5: RUN HISTORY ───────────────────────────────────────────────────
function screenHistory() {
  const els = [];
  const W = 390, H = 844;

  els.push(rect(0, 0, W, H, BG));

  els.push(text('9:41', 20, 16, { size: 13, weight: 'semibold', color: TEXT }));
  els.push(text('Run History', 195, 56, { size: 18, weight: 'bold', color: TEXT, align: 'center' }));
  els.push(text('Filter ▾', 334, 56, { size: 12, color: MUTED }));

  // Today summary chips
  els.push(rect(20, 74, 350, 36, SURFACE, { radius: 8 }));
  els.push(text('Today', 32, 95, { size: 10, weight: 'bold', color: TEXT }));
  els.push(text('47 runs', 80, 95, { size: 10, color: MUTED }));
  const chips = [
    { label: '44 done', color: ACCENT }, { label: '2 failed', color: ERR }, { label: '1 running', color: ACCENT2 },
  ];
  chips.forEach((c, i) => {
    const cx = 140 + i * 74;
    els.push(rect(cx, 80, 66, 18, `rgba(${c.color === ACCENT ? '0,212,170' : c.color === ERR ? '240,75,75' : '91,138,240'},0.12)`, { radius: 4 }));
    els.push(text(c.label, cx + 33, 92, { size: 9, weight: 'bold', color: c.color, align: 'center' }));
  });

  // Date section
  els.push(text('TODAY — APR 3, 2026', 20, 126, { size: 10, weight: 'bold', color: MUTED }));
  els.push(line(20, 134, 370, 134, DIM));

  const runs = [
    { time: '16:17', agent: 'Analyst-3', task: 'Fintech competitive analysis',    status: 'running', dur: '2:14+', cost: '$0.28' },
    { time: '16:14', agent: 'Coder-1',   task: 'Auth module test refactor',        status: 'done',    dur: '3:22',  cost: '$0.44' },
    { time: '15:52', agent: 'Vision-5',  task: 'Brand audit screenshot analysis',  status: 'done',    dur: '1:08',  cost: '$0.06' },
    { time: '15:40', agent: 'Writer-2',  task: 'LinkedIn post: Q1 review',         status: 'done',    dur: '2:55',  cost: '$0.11' },
    { time: '15:22', agent: 'Search-4',  task: 'Competitor pricing intel',         status: 'failed',  dur: '0:45',  cost: '$0.03' },
    { time: '15:08', agent: 'Analyst-3', task: 'Weekly metrics digest',            status: 'done',    dur: '4:12',  cost: '$0.36' },
  ];

  runs.forEach((r, i) => {
    const ry = 144 + i * 78;
    const statusColor = r.status === 'done' ? ACCENT : r.status === 'running' ? ACCENT2 : ERR;
    els.push(rect(20, ry, 350, 68, SURFACE, { radius: 10 }));
    // Status indicator
    els.push(rect(20, ry, 3, 68, statusColor, { radius: 2 }));
    // Time + agent
    els.push(text(r.time, 30, ry + 16, { size: 10, color: MUTED, font: 'JetBrains Mono' }));
    els.push(text(r.agent, 72, ry + 16, { size: 11, weight: 'bold', color: statusColor }));
    // Status pill
    const statusLabel = r.status === 'done' ? '✓ Done' : r.status === 'running' ? '▶ Live' : '✗ Failed';
    els.push(rect(270, ry + 8, 68, 18, `rgba(${statusColor === ACCENT ? '0,212,170' : statusColor === ACCENT2 ? '91,138,240' : '240,75,75'},0.12)`, { radius: 4 }));
    els.push(text(statusLabel, 304, ry + 20, { size: 9, weight: 'bold', color: statusColor, align: 'center' }));
    // Task
    els.push(text(r.task, 30, ry + 36, { size: 12, color: TEXT }));
    // Duration + cost
    els.push(text(`⏱ ${r.dur}`, 30, ry + 55, { size: 10, color: MUTED }));
    els.push(text(`💰 ${r.cost}`, 100, ry + 55, { size: 10, color: MUTED }));
    if (r.status === 'failed') {
      els.push(rect(180, ry + 46, 80, 18, 'rgba(240,75,75,0.1)', { radius: 4 }));
      els.push(text('↻ Retry', 220, ry + 58, { size: 10, color: ERR, align: 'center' }));
    }
    els.push(text('→', 354, ry + 36, { size: 13, color: DIM, align: 'right' }));
    if (i < runs.length - 1) els.push(line(20, ry + 68, 370, ry + 68, 'rgba(30,42,56,0.5)'));
  });

  // Bottom nav
  els.push(rect(0, 756, W, 88, SURFACE));
  els.push(line(0, 756, W, 756, DIM));
  ['⬡ Hub', '▶ Agents', '≡ Queue', '◷ History', '⊙ Config'].forEach((item, i) => {
    const nx = 39 + i * 78;
    const isActive = i === 3;
    els.push(text(item, nx, 800, { size: 11, weight: isActive ? 'semibold' : 'regular', color: isActive ? ACCENT : MUTED, align: 'center' }));
    if (isActive) els.push(rect(nx - 22, 756, 44, 2, ACCENT));
  });
  els.push(rect(155, 833, 80, 4, 'rgba(228,236,245,0.2)', { radius: 2 }));

  return { id: 'screen-5', name: 'Run History', width: W, height: H, backgroundColor: BG, elements: els };
}

// ─── ASSEMBLE & WRITE ────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  metadata: {
    name: 'DISPATCH — AI Agent Orchestration Dashboard',
    description: 'Dark terminal-teal AI agent runner. Command center, fleet management, task dispatch form, live streaming run, and run history. Inspired by NaughtyDuk live clock display (godly.website) and JetBrains Air multi-agent concept (lapa.ninja).',
    author: 'RAM Design AI',
    created: new Date().toISOString(),
    theme: 'dark',
    tags: ['dark', 'ai', 'agents', 'terminal', 'dashboard', 'developer', 'monospace'],
  },
  screens: [
    screenCommandCenter(),
    screenAgentFleet(),
    screenDispatch(),
    screenLiveRun(),
    screenHistory(),
  ],
};

fs.writeFileSync(path.join(__dirname, 'dispatch.pen'), JSON.stringify(pen, null, 2));
console.log('✓ dispatch.pen written —', pen.screens.length, 'screens');
