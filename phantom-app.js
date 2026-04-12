'use strict';
// phantom-app.js
// PHANTOM — AI Coding Agent Orchestrator
//
// Inspired by:
// - Superset.sh (darkmodedesign.com) — parallel coding agents, split-panel
//   terminal UI, the "orchestrate swarms" paradigm with dark IDE aesthetic
// - Linear.app (darkmodedesign.com) — ultra-clean dark SaaS, structured
//   panels, semantic color for status states
// - Lusion.co (godly.website) — avant-garde kinetic digital presence,
//   letterform animation approach informing the hero typography
// - Atlas / Haptic (godly.website #988, #965) — the "terminal-native product
//   UI as the hero element" pattern — showing the actual tool in action
//
// Challenge: Design a dark-mode AI pair-programmer dashboard called PHANTOM —
// a personal coding agent orchestrator — capturing the Superset.sh split-panel
// terminal aesthetic from darkmodedesign.com, where developers spin up
// parallel Claude/Codex/Gemini agents across git worktrees and review their
// diffs in a bento-grid command center.

const fs   = require('fs');
const path = require('path');
const https = require('https');

const config       = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN || '';
const GITHUB_REPO  = config.GITHUB_REPO  || '';

const SLUG   = 'phantom-ai-coder';
const PROMPT = `Design PHANTOM — a dark-mode AI coding agent orchestrator dashboard inspired by Superset.sh's parallel terminal split-panel aesthetic (featured on darkmodedesign.com) and the avant-garde digital presence of Lusion.co (godly.website). PHANTOM lets developers spawn, monitor, and review multiple AI coding agents (Claude, Codex, Gemini) running in parallel git worktrees. 3 mobile screens (Agent Swarm, Terminal Feed, Diff Review) + 3 desktop screens (Command Center, Workspace Dashboard, Agent Deep Dive). Ultra-dark terminal palette with violet accent, cyan code output, emerald success states.`;

// ── Palette ────────────────────────────────────────────────────────────────────
const P = {
  bg:       '#07090D',   // near-void base
  panel:    '#0D1117',   // panel surface (GitHub dark inspired)
  panel2:   '#161B22',   // elevated card
  panel3:   '#1C2333',   // top elevation
  border:   '#21262D',   // subtle border
  border2:  '#30363D',   // strong border
  fg:       '#E6EDF3',   // primary text
  fg2:      '#8B949E',   // secondary text
  fg3:      '#6E7681',   // muted text
  violet:   '#7C3AED',   // primary accent — agent active
  violetLt: '#A78BFA',   // light violet — highlight
  violetDim:'#1E1035',   // dim violet — agent bg
  cyan:     '#22D3EE',   // terminal output / code
  cyanDim:  '#0A2030',   // terminal bg
  green:    '#3FB950',   // success / approved
  greenDim: '#0F2B1B',   // success bg
  orange:   '#F97316',   // warning / in-progress
  orangeDim:'#2D1500',   // warning bg
  red:      '#F85149',   // error / delete
  redDim:   '#2C0A0A',   // error bg
  amber:    '#D29922',   // pending / branch
  amberDim: '#2B1F00',   // pending bg
  line:     '#21262D',   // divider
};

// ── CSS Design Tokens ──────────────────────────────────────────────────────────
const CSS_TOKENS = `:root {
  /* Base */
  --ph-bg:         ${P.bg};
  --ph-panel:      ${P.panel};
  --ph-panel-2:    ${P.panel2};
  --ph-panel-3:    ${P.panel3};
  --ph-border:     ${P.border};
  --ph-border-2:   ${P.border2};

  /* Text */
  --ph-fg:         ${P.fg};
  --ph-fg-2:       ${P.fg2};
  --ph-fg-3:       ${P.fg3};

  /* Violet — Agent Active */
  --ph-violet:     ${P.violet};
  --ph-violet-lt:  ${P.violetLt};
  --ph-violet-dim: ${P.violetDim};

  /* Cyan — Terminal/Code */
  --ph-cyan:       ${P.cyan};
  --ph-cyan-dim:   ${P.cyanDim};

  /* Green — Success */
  --ph-green:      ${P.green};
  --ph-green-dim:  ${P.greenDim};

  /* Orange — Warning */
  --ph-orange:     ${P.orange};
  --ph-orange-dim: ${P.orangeDim};

  /* Red — Error */
  --ph-red:        ${P.red};
  --ph-red-dim:    ${P.redDim};

  /* Amber — Pending */
  --ph-amber:      ${P.amber};
  --ph-amber-dim:  ${P.amberDim};

  /* Typography */
  --font-ui:       'Inter', system-ui, sans-serif;
  --font-mono:     'JetBrains Mono', 'Fira Code', monospace;

  /* Radii */
  --r-sm:  4px;
  --r-md:  8px;
  --r-lg:  12px;
  --r-xl:  16px;

  /* Spacing */
  --sp-xs: 4px;
  --sp-sm: 8px;
  --sp-md: 16px;
  --sp-lg: 24px;
  --sp-xl: 40px;
}`;

// ── ID factory ────────────────────────────────────────────────────────────────
let _id = 0;
const uid = () => `ph${++_id}`;

// ── Primitives ─────────────────────────────────────────────────────────────────
const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h,
  fill: fill || P.bg,
  clip: opts.clip !== undefined ? opts.clip : false,
  ...(opts.r !== undefined ? { cornerRadius: opts.r } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.ch || [],
});

const T = (content, x, y, w, h, opts = {}) => ({
  id: uid(), type: 'text', content, x, y, width: w, height: h,
  textGrowth: 'fixed-width-height',
  fontSize: opts.size || 12,
  fontWeight: String(opts.weight || 400),
  fill: opts.fill || P.fg,
  textAlign: opts.align || 'left',
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh !== undefined ? { lineHeight: opts.lh } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  fontFamily: opts.mono ? 'JetBrains Mono' : undefined,
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const HR = (x, y, w, fill = P.border) => F(x, y, w, 1, fill);
const VR = (x, y, h, fill = P.border) => F(x, y, 1, h, fill);

// ── Shared components ──────────────────────────────────────────────────────────

const Badge = (x, y, label, fg, bg, opts = {}) => {
  const w = label.length * 6.2 + 16;
  return F(x, y, w, 18, bg, {
    r: 9, ch: [T(label, 8, 3, w - 16, 12, { size: 8.5, fill: fg, weight: 700, ls: 0.6 })],
    ...opts,
  });
};

const AgentDot = (x, y, color) => E(x, y, 7, 7, color);

// Status pill (green/violet/orange/red)
const StatusPill = (x, y, status) => {
  const map = {
    running:  [P.violet,   P.violetDim, '● RUNNING'],
    done:     [P.green,    P.greenDim,  '✓ DONE'],
    pending:  [P.amber,    P.amberDim,  '◎ QUEUED'],
    error:    [P.red,      P.redDim,    '✗ ERROR'],
    thinking: [P.cyan,     P.cyanDim,   '⠦ THINKING'],
  };
  const [fg, bg, label] = map[status] || map.pending;
  return Badge(x, y, label, fg, bg);
};

// Terminal line (monospace, cyan)
const TermLine = (x, y, w, prompt, cmd, comment = '') =>
  F(x, y, w, 15, 'transparent', {
    ch: [
      T(prompt,  0,  1, prompt.length * 6.8,  13, { size: 9, fill: P.green,   weight: 600, mono: true }),
      T(cmd,     prompt.length * 6.8 + 4, 1, w - prompt.length * 6.8 - 60, 13,
        { size: 9, fill: P.cyan, mono: true }),
      ...(comment ? [T(comment, w - 140, 1, 136, 13, { size: 8, fill: P.fg3, mono: true })] : []),
    ],
  });

// Diff line
const DiffLine = (x, y, w, type, lineno, code) => {
  const bg = type === '+' ? P.greenDim : type === '-' ? P.redDim : P.panel;
  const fc = type === '+' ? P.green    : type === '-' ? P.red    : P.fg2;
  return F(x, y, w, 15, bg, {
    ch: [
      T(String(lineno).padStart(3), 4, 1, 24, 13, { size: 8, fill: P.fg3, align: 'right', mono: true }),
      T(type || ' ', 32, 1, 10, 13, { size: 9, fill: fc, weight: 700, mono: true }),
      T(code,        44, 1, w - 50, 13, { size: 8.5, fill: fc, mono: true }),
    ],
  });
};

// Agent card for mobile swarm view
const AgentCard = (x, y, w, h, name, model, branch, status, linesAdded, linesRemoved, timeElapsed) => {
  const [dotColor] = {
    running:  [P.violet],
    done:     [P.green],
    pending:  [P.amber],
    error:    [P.red],
    thinking: [P.cyan],
  }[status] || [P.fg3];
  return F(x, y, w, h, P.panel2, {
    r: 10,
    stroke: status === 'running' ? P.violet + '55' : P.border,
    sw: 1,
    ch: [
      // header row
      E(14, 14, 8, 8, dotColor, {}),
      T(name,  28, 10, w - 90, 14, { size: 11, fill: P.fg, weight: 700 }),
      StatusPill(w - 76, 10, status),
      // model badge
      Badge(14, 30, model, P.violetLt, P.violetDim),
      // branch
      T('⎇ ' + branch, 14, 52, w - 28, 11, { size: 8.5, fill: P.amber, mono: true }),
      HR(14, 66, w - 28, P.border),
      // stats row
      T(`+${linesAdded}`, 14, 74, 40, 12, { size: 10, fill: P.green, weight: 700, mono: true }),
      T(`-${linesRemoved}`, 58, 74, 40, 12, { size: 10, fill: P.red,   weight: 700, mono: true }),
      T(timeElapsed, w - 50, 74, 40, 12, { size: 9, fill: P.fg3, align: 'right', mono: true }),
    ],
  });
};

// Bento metric tile
const MetricTile = (x, y, w, h, label, value, sub, accent, opts = {}) =>
  F(x, y, w, h, P.panel2, {
    r: 8, stroke: P.border, sw: 1,
    ch: [
      T(label,  14, 14, w - 28, 11, { size: 8.5, fill: P.fg3, ls: 0.7, weight: 600 }),
      T(value,  14, 30, w - 28, 28, { size: 20, fill: accent || P.fg, weight: 800, ls: -0.5 }),
      T(sub,    14, h - 20, w - 28, 11, { size: 8, fill: P.fg3 }),
      ...(opts.ch || []),
    ],
    ...opts,
  });

// ┌────────────────────────────────────────────────────────────────────────────┐
// │  MOBILE SCREEN 1 — Agent Swarm Overview                                   │
// └────────────────────────────────────────────────────────────────────────────┘
function buildMobile1() {
  const W = 390, H = 844;
  const ch = [];

  // BG
  ch.push(F(0, 0, W, H, P.bg));

  // Status bar
  ch.push(T('9:41', 16, 14, 50, 14, { size: 12, fill: P.fg, weight: 600 }));
  ch.push(T('◉ ◉ ◉', W - 60, 14, 50, 14, { size: 10, fill: P.fg2, align: 'right' }));

  // Header
  ch.push(T('phantom', 20, 46, 120, 22, { size: 18, fill: P.violetLt, weight: 800, ls: -0.5 }));
  ch.push(Badge(W - 100, 50, '4 ACTIVE', P.violet, P.violetDim));

  // Subtitle
  ch.push(T('Parallel agent swarm', 20, 72, 200, 13, { size: 10, fill: P.fg3 }));

  // Ambient glow under header
  ch.push(F(0, 44, W, 52, P.violet, { opacity: 0.04 }));

  // Summary strip
  const strip = F(16, 98, W - 32, 50, P.panel, { r: 8, stroke: P.border, sw: 1, ch: [
    T('12', 20, 10, 40, 20, { size: 16, fill: P.green,  weight: 800, mono: true }),
    T('files changed', 20, 30, 80, 10, { size: 7.5, fill: P.fg3 }),
    VR(80, 8, 34, P.border2),
    T('+847', 96, 10, 50, 20, { size: 16, fill: P.green,  weight: 800, mono: true }),
    T('lines added', 96, 30, 60, 10, { size: 7.5, fill: P.fg3 }),
    VR(166, 8, 34, P.border2),
    T('-231', 182, 10, 50, 20, { size: 16, fill: P.red,   weight: 800, mono: true }),
    T('lines removed', 182, 30, 80, 10, { size: 7.5, fill: P.fg3 }),
    VR(278, 8, 34, P.border2),
    T('3m', 294, 10, 50, 20, { size: 16, fill: P.amber, weight: 800, mono: true }),
    T('avg. runtime', 294, 30, 60, 10, { size: 7.5, fill: P.fg3 }),
  ]});
  ch.push(strip);

  // Section label
  ch.push(T('AGENTS', 20, 162, 80, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.2 }));

  // Agent cards 2×2
  ch.push(AgentCard(16,  180, 174, 100, 'claude-1', 'CLAUDE', 'feat/auth', 'running', 312, 44, '2m 18s'));
  ch.push(AgentCard(200, 180, 174, 100, 'codex-2',  'CODEX',  'fix/types', 'done',    189, 12, '4m 02s'));
  ch.push(AgentCard(16,  288, 174, 100, 'gemini-3', 'GEMINI', 'refactor/db','thinking',  0,  0, '0m 41s'));
  ch.push(AgentCard(200, 288, 174, 100, 'claude-4', 'CLAUDE', 'test/api',  'pending',   0,  0, 'queued'));

  // Active terminal preview
  ch.push(T('LIVE OUTPUT', 20, 402, 120, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.2 }));
  const term = F(16, 418, W - 32, 120, P.panel, { r: 8, stroke: P.cyan + '22', sw: 1, clip: true, ch: [
    // Terminal header
    F(0, 0, W - 32, 24, P.panel3, { ch: [
      E(12, 8, 8, 8, P.red,    {}),
      E(26, 8, 8, 8, P.orange, {}),
      E(40, 8, 8, 8, P.green,  {}),
      T('claude-1 · feat/auth · ~/phantom/worktrees/w1', 60, 7, 240, 11, { size: 8, fill: P.fg3, mono: true }),
    ]}),
    TermLine(12, 32, 338, '❯', 'cd /app/src/middleware', ''),
    TermLine(12, 49, 338, '❯', 'cat auth.ts | llm review', ''),
    T('Analyzing token refresh flow...', 12, 66, 320, 11, { size: 8.5, fill: P.cyan, mono: true }),
    T('Found 3 issues: race condition on line 47,', 12, 80, 320, 11, { size: 8.5, fill: P.fg2, mono: true }),
    T('missing error boundary, stale JWT check.', 12, 93, 320, 11, { size: 8.5, fill: P.fg2, mono: true }),
    T('Patching...', 12, 107, 200, 11, { size: 8.5, fill: P.green, mono: true }),
    E(88, 109, 6, 6, P.green, { opacity: 0.8 }),
  ]});
  ch.push(term);

  // Model distribution mini chart
  ch.push(T('AGENT BREAKDOWN', 20, 554, 160, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1.2 }));
  const models = [
    { label: 'Claude', pct: 50, color: P.violet },
    { label: 'Codex',  pct: 25, color: P.cyan },
    { label: 'Gemini', pct: 25, color: P.green },
  ];
  let barX = 16;
  models.forEach(m => {
    const barW = Math.round((W - 32) * m.pct / 100) - 2;
    ch.push(F(barX, 570, barW, 14, m.color, { r: 3, opacity: 0.85 }));
    barX += barW + 2;
  });
  models.forEach((m, i) => {
    ch.push(E(16 + i * 90, 594, 7, 7, m.color, {}));
    ch.push(T(m.label + ' ' + m.pct + '%', 28 + i * 90, 591, 70, 12, { size: 9, fill: P.fg2 }));
  });

  // Bottom nav
  ch.push(F(0, H - 82, W, 82, P.panel, { stroke: P.border, sw: 1, ch: [
    ...[['Swarm', true], ['Terminal', false], ['Diff', false], ['Settings', false]].map(([label, active], i) => F(i * 98, 0, 98, 82, 'transparent', { ch: [
      F(30 + i * 98, 16, 36, 24, active ? P.violetDim : 'transparent', { r: 6, ch: [] }),
      T(active ? '▦' : ['⌨', '⎌', '⚙'][i - 1] || '▦', 41 + i * 98, 17, 14, 16, { size: 12, fill: active ? P.violetLt : P.fg3, align: 'center' }),
      T(label, 8 + i * 98, 44, 80, 12, { size: 8.5, fill: active ? P.violetLt : P.fg3, align: 'center' }),
    ]})),
    F(W / 2 - 60, 72, 120, 5, P.fg, { r: 3, opacity: 0.2 }),
  ]}));

  return { id: uid(), type: 'frame', x: 0, y: 0, width: W, height: H, fill: P.bg, clip: true, children: ch };
}

// ┌────────────────────────────────────────────────────────────────────────────┐
// │  MOBILE SCREEN 2 — Terminal Feed (Agent Detail)                           │
// └────────────────────────────────────────────────────────────────────────────┘
function buildMobile2() {
  const W = 390, H = 844;
  const ch = [];

  ch.push(F(0, 0, W, H, P.bg));

  // Status bar
  ch.push(T('9:41', 16, 14, 50, 14, { size: 12, fill: P.fg, weight: 600 }));

  // Back nav
  ch.push(T('← phantom', 16, 46, 100, 14, { size: 11, fill: P.violet, weight: 600 }));
  ch.push(T('claude-1', 20, 68, 180, 18, { size: 16, fill: P.fg, weight: 800 }));
  ch.push(StatusPill(W - 90, 70, 'running'));
  ch.push(T('⎇ feat/auth  ·  ~/phantom/worktrees/w1', 20, 90, W - 40, 11, { size: 8.5, fill: P.amber, mono: true }));

  // Tabs
  const tabs = [['Output', true], ['Files', false], ['Diff', false]];
  tabs.forEach(([label, active], i) => {
    ch.push(F(16 + i * 90, 112, 80, 30, 'transparent', { ch: [
      T(label, 4, 7, 72, 14, { size: 11, fill: active ? P.fg : P.fg3, weight: active ? 700 : 400, align: 'center' }),
      ...(active ? [F(24, 28, 32, 2, P.violet, { r: 1 })] : []),
    ]}));
  });
  ch.push(HR(16, 142, W - 32, P.border));

  // Terminal window
  const termH = 480;
  const term = F(16, 152, W - 32, termH, P.panel, { r: 10, stroke: P.cyan + '33', sw: 1, clip: true, ch: [
    // Mac-style chrome
    F(0, 0, W - 32, 28, P.panel3, { ch: [
      E(12, 10, 8, 8, P.red,    {}),
      E(26, 10, 8, 8, P.orange, {}),
      E(40, 10, 8, 8, P.green,  {}),
      T('PHANTOM  //  claude-1', 56, 8, 200, 12, { size: 8.5, fill: P.fg3, mono: true }),
    ]}),
    // Terminal content
    TermLine(10, 38, 338, '$', 'phantom agent start --model claude --branch feat/auth', ''),
    T('↳ Creating worktree at ~/phantom/worktrees/w1', 10, 55, 338, 11, { size: 8.5, fill: P.fg2, mono: true }),
    T('↳ Installing dependencies... done', 10, 69, 338, 11, { size: 8.5, fill: P.green, mono: true }),
    T('↳ Agent ready', 10, 83, 338, 11, { size: 8.5, fill: P.green, mono: true }),
    T('', 10, 97, 10, 11, { size: 8.5, mono: true }),
    TermLine(10, 111, 338, '$', 'phantom run "fix auth token refresh"', ''),
    T('⠦ Reading codebase context...', 10, 128, 338, 11, { size: 8.5, fill: P.cyan, mono: true }),
    T('⠦ Scanning src/middleware/ (14 files)', 10, 142, 338, 11, { size: 8.5, fill: P.cyan, mono: true }),
    T('⠿ Identified: auth.ts, token.ts, session.ts', 10, 156, 338, 11, { size: 8.5, fill: P.fg2, mono: true }),
    T('', 10, 170, 10, 11, { size: 8.5, mono: true }),
    T('[claude] Analyzing auth.ts...', 10, 184, 338, 11, { size: 8.5, fill: P.violetLt, mono: true }),
    T('[claude] Race condition at line 47: token', 10, 198, 338, 11, { size: 8.5, fill: P.orange, mono: true }),
    T('         refreshes can overlap on concurrent', 10, 212, 338, 11, { size: 8.5, fill: P.orange, mono: true }),
    T('         requests. Adding mutex lock.', 10, 226, 338, 11, { size: 8.5, fill: P.orange, mono: true }),
    T('[claude] Patching src/middleware/auth.ts', 10, 240, 338, 11, { size: 8.5, fill: P.violetLt, mono: true }),
    T('[claude] Writing fix...', 10, 254, 338, 11, { size: 8.5, fill: P.cyan, mono: true }),
    T('', 10, 268, 10, 11, { size: 8.5, mono: true }),
    T('diff --git a/src/middleware/auth.ts', 10, 282, 338, 11, { size: 8.5, fill: P.fg3, mono: true }),
    DiffLine(0, 295, W - 32, '-', 47, 'const token = await refreshToken(user);'),
    DiffLine(0, 310, W - 32, '+', 47, 'const token = await mutex.run(refreshToken, user);'),
    T('', 10, 325, 10, 11, { size: 8.5, mono: true }),
    T('[claude] Running tests...', 10, 339, 338, 11, { size: 8.5, fill: P.violetLt, mono: true }),
    T('✓ auth.test.ts  (12 tests passed)', 10, 353, 338, 11, { size: 8.5, fill: P.green, mono: true }),
    T('✓ token.test.ts (8 tests passed)', 10, 367, 338, 11, { size: 8.5, fill: P.green, mono: true }),
    T('', 10, 381, 10, 11, { size: 8.5, mono: true }),
    T('[claude] Creating commit...', 10, 395, 338, 11, { size: 8.5, fill: P.violetLt, mono: true }),
    T('✓ fix(auth): add mutex lock for token refresh', 10, 409, 338, 11, { size: 8.5, fill: P.green, mono: true }),
    T('✓ Pushed to origin/feat/auth', 10, 423, 338, 11, { size: 8.5, fill: P.green, mono: true }),
    T('', 10, 437, 10, 11, { size: 8.5, mono: true }),
    T('❯ _', 10, 451, 338, 11, { size: 8.5, fill: P.green, mono: true }),
  ]});
  ch.push(term);

  // Input bar
  const inputY = 152 + termH + 12;
  ch.push(F(16, inputY, W - 32, 40, P.panel2, { r: 8, stroke: P.violet + '44', sw: 1, ch: [
    T('Send instruction...', 16, 13, W - 100, 14, { size: 11, fill: P.fg3 }),
    F(W - 70, 8, 46, 24, P.violet, { r: 6, ch: [
      T('Send', 6, 6, 36, 14, { size: 10, fill: P.fg, weight: 700, align: 'center' }),
    ]}),
  ]}));

  // Bottom nav
  ch.push(F(0, H - 82, W, 82, P.panel, { stroke: P.border, sw: 1, ch: [
    ...[['Swarm', false], ['Terminal', true], ['Diff', false], ['Settings', false]].map(([label, active], i) => F(i * 98, 0, 98, 82, 'transparent', { ch: [
      F(30 + i * 98 - i * 98, 16, 36, 24, active ? P.violetDim : 'transparent', { r: 6, ch: [] }),
      T(active ? '⌨' : ['▦', '⎌', '⚙'][i === 0 ? 0 : i === 2 ? 1 : 2], 41, 17, 14, 16, { size: 12, fill: active ? P.violetLt : P.fg3, align: 'center' }),
      T(label, 8, 44, 80, 12, { size: 8.5, fill: active ? P.violetLt : P.fg3, align: 'center' }),
    ]})),
    F(W / 2 - 60, 72, 120, 5, P.fg, { r: 3, opacity: 0.2 }),
  ]}));

  return { id: uid(), type: 'frame', x: 0, y: 0, width: W, height: H, fill: P.bg, clip: true, children: ch };
}

// ┌────────────────────────────────────────────────────────────────────────────┐
// │  MOBILE SCREEN 3 — Diff Review                                            │
// └────────────────────────────────────────────────────────────────────────────┘
function buildMobile3() {
  const W = 390, H = 844;
  const ch = [];

  ch.push(F(0, 0, W, H, P.bg));
  ch.push(T('9:41', 16, 14, 50, 14, { size: 12, fill: P.fg, weight: 600 }));
  ch.push(T('← claude-1', 16, 46, 110, 14, { size: 11, fill: P.violet, weight: 600 }));
  ch.push(T('Diff Review', 20, 68, 200, 18, { size: 16, fill: P.fg, weight: 800 }));
  ch.push(Badge(W - 100, 70, '3 FILES', P.fg3, P.panel2));

  // File picker tabs
  const files = ['auth.ts', 'token.ts', 'session.ts'];
  files.forEach((f, i) => {
    const active = i === 0;
    const fw = f.length * 7.5 + 20;
    ch.push(F(16 + i * 110, 98, fw, 28, active ? P.panel3 : P.panel, {
      r: 6,
      stroke: active ? P.violet + '44' : P.border,
      ch: [
        T(f, 10, 7, fw - 20, 14, { size: 9.5, fill: active ? P.fg : P.fg3, mono: true }),
      ],
    }));
  });
  ch.push(HR(16, 130, W - 32));

  // Diff header
  ch.push(F(16, 140, W - 32, 28, P.panel3, { r: 6, ch: [
    T('src/middleware/auth.ts', 12, 8, 200, 12, { size: 9, fill: P.amber, mono: true }),
    T('+12 / -3', W - 86, 8, 60, 12, { size: 9, fill: P.fg3, mono: true }),
  ]}));

  // Diff viewer
  const diffLines = [
    [' ', 40, 'import { mutex } from \'./utils/mutex\';'],
    [' ', 41, ''],
    [' ', 42, 'export async function refreshHandler('],
    [' ', 43, '  req: Request, res: Response'],
    [' ', 44, ') {'],
    [' ', 45, '  const { userId } = req.session;'],
    [' ', 46, '  try {'],
    ['-', 47, '    const token = await refreshToken(userId);'],
    ['+', 47, '    const token = await mutex.run('],
    ['+', 48, '      refreshToken, userId'],
    ['+', 49, '    );'],
    [' ', 50, '    if (!token) throw new TokenError();'],
    [' ', 51, '    res.json({ token });'],
    [' ', 52, '  } catch (err) {'],
    [' ', 53, '    res.status(401).json({ error: err });'],
    [' ', 54, '  }'],
    [' ', 55, '}'],
  ];
  const diffContainer = F(16, 174, W - 32, diffLines.length * 15 + 8, P.panel, { r: 8, stroke: P.border, clip: true, ch: [
    ...diffLines.map(([ t, n, c], i) => DiffLine(0, i * 15 + 4, W - 32, t, n, c)),
  ]});
  ch.push(diffContainer);

  // AI annotation
  const annY = 174 + diffLines.length * 15 + 16;
  ch.push(F(16, annY, W - 32, 80, P.violetDim, { r: 8, stroke: P.violet + '44', sw: 1, ch: [
    T('✦ Phantom AI', 12, 10, 100, 12, { size: 9, fill: P.violetLt, weight: 700 }),
    Badge(W - 80, 8, 'CONFIDENCE 97%', P.violetLt, P.violetDim + 'aa'),
    T('Adding a mutex lock prevents concurrent token refresh', 12, 28, W - 68, 11, { size: 8.5, fill: P.fg2 }),
    T('calls from creating race conditions. This is the', 12, 42, W - 68, 11, { size: 8.5, fill: P.fg2 }),
    T('correct fix for the described auth vulnerability.', 12, 56, W - 68, 11, { size: 8.5, fill: P.fg2 }),
  ]}));

  // Review action bar
  const actY = annY + 88;
  ch.push(F(16, actY, W - 32, 48, P.panel, { r: 8, stroke: P.border, ch: [
    F(12, 10, (W - 56) / 2, 28, P.greenDim, { r: 6, stroke: P.green + '44', ch: [
      T('✓ Approve', 0, 8, (W - 56) / 2, 14, { size: 11, fill: P.green, weight: 700, align: 'center' }),
    ]}),
    F(12 + (W - 56) / 2 + 8, 10, (W - 56) / 2, 28, P.panel2, { r: 6, stroke: P.border, ch: [
      T('✕ Request Changes', 0, 8, (W - 56) / 2, 14, { size: 11, fill: P.fg3, weight: 600, align: 'center' }),
    ]}),
  ]}));

  // Bottom nav
  ch.push(F(0, H - 82, W, 82, P.panel, { stroke: P.border, sw: 1, ch: [
    ...[['Swarm', false], ['Terminal', false], ['Diff', true], ['Settings', false]].map(([label, active], i) => F(i * 98, 0, 98, 82, 'transparent', { ch: [
      F(30, 16, 36, 24, active ? P.violetDim : 'transparent', { r: 6, ch: [] }),
      T(active ? '⎌' : ['▦', '⌨', '⚙'][i === 0 ? 0 : i === 1 ? 1 : 2], 41, 17, 14, 16, { size: 12, fill: active ? P.violetLt : P.fg3, align: 'center' }),
      T(label, 8, 44, 80, 12, { size: 8.5, fill: active ? P.violetLt : P.fg3, align: 'center' }),
    ]})),
    F(W / 2 - 60, 72, 120, 5, P.fg, { r: 3, opacity: 0.2 }),
  ]}));

  return { id: uid(), type: 'frame', x: 0, y: 0, width: W, height: H, fill: P.bg, clip: true, children: ch };
}

// ┌────────────────────────────────────────────────────────────────────────────┐
// │  DESKTOP SCREEN 1 — Command Center (Split-Pane)                           │
// └────────────────────────────────────────────────────────────────────────────┘
function buildDesktop1() {
  const W = 1440, H = 900;
  const ch = [];

  ch.push(F(0, 0, W, H, P.bg));

  // ── Left sidebar (240px) ────────────────────────────────────────────────────
  const SB_W = 240;
  ch.push(F(0, 0, SB_W, H, P.panel, { stroke: P.border, sw: 1, ch: [] }));
  ch.push(VR(SB_W, 0, H, P.border));

  // Logo
  ch.push(T('⬡ phantom', 20, 20, 140, 22, { size: 14, fill: P.violetLt, weight: 800, ls: -0.3 }));
  ch.push(T('v2.1.0', 20, 44, 60, 12, { size: 9, fill: P.fg3 }));
  ch.push(HR(16, 60, SB_W - 32));

  // Nav items
  const navItems = [
    ['▦  Swarm', true],
    ['⌨  Terminals', false],
    ['⎌  Diffs', false],
    ['⊞  Workspaces', false],
    ['↗  Deploy', false],
  ];
  navItems.forEach(([label, active], i) => {
    ch.push(F(8, 70 + i * 36, SB_W - 16, 30, active ? P.violetDim : 'transparent', {
      r: 6,
      ch: [T(label, 12, 8, SB_W - 40, 14, { size: 11, fill: active ? P.violetLt : P.fg2, weight: active ? 700 : 400 })],
    }));
  });
  ch.push(HR(16, 252, SB_W - 32));

  // Agent list in sidebar
  ch.push(T('AGENTS', 20, 262, 80, 12, { size: 8.5, fill: P.fg3, weight: 700, ls: 1.2 }));
  const agents = [
    { name: 'claude-1', branch: 'feat/auth', status: 'running' },
    { name: 'codex-2',  branch: 'fix/types', status: 'done' },
    { name: 'gemini-3', branch: 'refactor/db', status: 'thinking' },
    { name: 'claude-4', branch: 'test/api',  status: 'pending' },
  ];
  const statusColors = { running: P.violet, done: P.green, thinking: P.cyan, pending: P.amber };
  agents.forEach((a, i) => {
    const isActive = i === 0;
    ch.push(F(8, 282 + i * 52, SB_W - 16, 44, isActive ? P.panel3 : 'transparent', {
      r: 6,
      stroke: isActive ? P.violet + '44' : 'transparent',
      ch: [
        E(14, 18, 8, 8, statusColors[a.status], {}),
        T(a.name, 28, 10, 120, 14, { size: 11, fill: isActive ? P.fg : P.fg2, weight: 700 }),
        T('⎇ ' + a.branch, 28, 26, 140, 11, { size: 8.5, fill: P.amber, mono: true }),
        Badge(SB_W - 70, 14, a.status.toUpperCase(), statusColors[a.status], statusColors[a.status] + '22'),
      ],
    }));
  });

  // Spawn button
  ch.push(F(16, 498, SB_W - 32, 36, P.violet, { r: 8, ch: [
    T('+ Spawn New Agent', 0, 10, SB_W - 32, 16, { size: 11, fill: P.fg, weight: 700, align: 'center' }),
  ]}));

  ch.push(HR(16, 548, SB_W - 32));
  ch.push(T('STATUS', 20, 558, 80, 12, { size: 8.5, fill: P.fg3, weight: 700, ls: 1.2 }));
  ch.push(T('4 agents  ·  12 files changed', 20, 574, 180, 11, { size: 9, fill: P.fg2 }));
  ch.push(T('+847 / -231 net diff', 20, 589, 160, 11, { size: 9, fill: P.green }));

  // ── Main panel: Terminal (700px wide) ──────────────────────────────────────
  const TERM_X = SB_W, TERM_W = 700;
  ch.push(F(TERM_X, 0, TERM_W, H, P.bg, { ch: [] }));

  // Header bar
  ch.push(F(TERM_X, 0, TERM_W, 48, P.panel, { stroke: P.border, sw: 1, ch: [
    T('claude-1  ·  feat/auth  ·  RUNNING', 20, 16, 400, 14, { size: 11, fill: P.fg, weight: 600 }),
    StatusPill(TERM_W - 100, 15, 'running'),
  ]}));

  // Terminal content area
  const termLines = [
    ['$', 'phantom agent start --model claude-opus-4 --branch feat/auth --worktree ~/ph/w1'],
    ['', '↳ Worktree created at ~/ph/w1'],
    ['', '↳ Context loaded: 1,247 tokens from src/'],
    ['', ''],
    ['$', 'phantom run "fix the auth token refresh race condition"'],
    ['', ''],
    ['[A]', 'Reading src/middleware/auth.ts...'],
    ['[A]', 'Reading src/utils/token.ts...'],
    ['[A]', 'Reading src/types/session.ts...'],
    ['', ''],
    ['[A]', 'Identified race condition: concurrent refreshToken() calls'],
    ['[A]', 'at line 47 in auth.ts. Solution: mutex lock pattern.'],
    ['', ''],
    ['[A]', 'Patching auth.ts...'],
    ['[A]', 'Patching token.ts (import addition)...'],
    ['[A]', 'Updating tests...'],
    ['', ''],
    ['$', 'cd ~/ph/w1 && npm test'],
    ['', ''],
    ['✓', 'PASS  src/middleware/auth.test.ts (12 tests, 1.2s)'],
    ['✓', 'PASS  src/utils/token.test.ts (8 tests, 0.8s)'],
    ['✓', 'PASS  src/types/session.test.ts (5 tests, 0.4s)'],
    ['', ''],
    ['$', 'git add -p && git commit -m "fix(auth): add mutex lock for token refresh"'],
    ['', '✓ [feat/auth abc1234] fix(auth): add mutex lock for token refresh'],
    ['', '  2 files changed, 12 insertions(+), 3 deletions(-)'],
    ['', ''],
    ['$', '_'],
  ];
  termLines.forEach(([type, line], i) => {
    const y = 60 + i * 18;
    if (y > H - 20) return;
    const fg = type === '$' ? P.green : type === '[A]' ? P.violetLt : type === '✓' ? P.green : P.fg2;
    const prefix = type === '$' ? '❯ ' : type === '[A]' ? 'A  ' : type === '✓' ? '✓  ' : '   ';
    ch.push(T(prefix + line, TERM_X + 20, y, TERM_W - 40, 14, { size: 9.5, fill: fg, mono: true }));
  });

  // ── Right panel: Diff + AI (500px wide) ────────────────────────────────────
  const DIFF_X = TERM_X + TERM_W;
  const DIFF_W = W - DIFF_X;
  ch.push(VR(DIFF_X, 0, H, P.border));
  ch.push(F(DIFF_X, 0, DIFF_W, H, P.panel, { ch: [] }));

  // Panel header
  ch.push(F(DIFF_X, 0, DIFF_W, 48, P.panel2, { stroke: P.border, ch: [
    T('Diff  ·  auth.ts', DIFF_X + 16, 16, 200, 14, { size: 11, fill: P.fg, weight: 700 }),
    Badge(DIFF_X + DIFF_W - 90, 14, '+12 / -3', P.fg3, P.panel3),
  ]}));

  // Diff content
  const diffs = [
    [' ', 40, 'import { mutex } from \'./utils/mutex\';'],
    [' ', 41, ''],
    [' ', 44, '  const { userId } = req.session;'],
    [' ', 45, '  try {'],
    ['-', 46, '    const tok = await refreshToken(userId);'],
    ['+', 46, '    const tok = await mutex.run(refreshToken,'],
    ['+', 47, '      userId'],
    ['+', 48, '    );'],
    [' ', 49, '    if (!tok) throw new TokenError();'],
    [' ', 50, '    res.json({ token: tok });'],
    [' ', 51, '  }'],
  ];
  diffs.forEach(([ t, n, c], i) => {
    ch.push(DiffLine(DIFF_X, 52 + i * 15, DIFF_W, t, n, c));
  });

  // AI panel
  const aiPanelY = 52 + diffs.length * 15 + 10;
  ch.push(F(DIFF_X, aiPanelY, DIFF_W, H - aiPanelY, P.violetDim, { stroke: P.violet + '33', sw: 1, ch: [
    T('✦ PHANTOM AI · ANALYSIS', DIFF_X + 16, aiPanelY + 14, 260, 12, { size: 9, fill: P.violetLt, weight: 700, ls: 0.8 }),
    Badge(DIFF_X + DIFF_W - 110, aiPanelY + 12, 'CONFIDENCE 97%', P.violetLt, P.violetDim + 'aa'),
    HR(DIFF_X + 16, aiPanelY + 34, DIFF_W - 32, P.violet + '33'),
    T('Root cause: refreshToken() is not atomic. Concurrent', DIFF_X + 16, aiPanelY + 44, DIFF_W - 32, 12, { size: 9, fill: P.fg2 }),
    T('requests can each trigger a refresh, creating race', DIFF_X + 16, aiPanelY + 58, DIFF_W - 32, 12, { size: 9, fill: P.fg2 }),
    T('conditions with stale/overlapping JWT states.', DIFF_X + 16, aiPanelY + 72, DIFF_W - 32, 12, { size: 9, fill: P.fg2 }),
    T('Fix: mutex.run() ensures serial execution. Tests pass.', DIFF_X + 16, aiPanelY + 90, DIFF_W - 32, 12, { size: 9, fill: P.green }),
    HR(DIFF_X + 16, aiPanelY + 108, DIFF_W - 32, P.violet + '33'),
    T('Related: See token.ts:89 for similar pattern opportunity.', DIFF_X + 16, aiPanelY + 118, DIFF_W - 32, 12, { size: 9, fill: P.amber }),
  ]}));

  return { id: uid(), type: 'frame', x: 0, y: 0, width: W, height: H, fill: P.bg, clip: true, children: ch };
}

// ┌────────────────────────────────────────────────────────────────────────────┐
// │  DESKTOP SCREEN 2 — Workspace Dashboard (Bento Grid)                      │
// └────────────────────────────────────────────────────────────────────────────┘
function buildDesktop2() {
  const W = 1440, H = 900;
  const ch = [];
  ch.push(F(0, 0, W, H, P.bg));

  // Top bar
  ch.push(F(0, 0, W, 52, P.panel, { stroke: P.border, sw: 1, ch: [
    T('⬡ phantom', 24, 16, 120, 20, { size: 14, fill: P.violetLt, weight: 800 }),
    T('Workspace Dashboard', W / 2 - 100, 18, 200, 16, { size: 12, fill: P.fg, weight: 600, align: 'center' }),
    StatusPill(W - 140, 17, 'running'),
    T('4 agents active', W - 230, 19, 90, 12, { size: 9, fill: P.fg3 }),
  ]}));

  const BX = 24, BY = 68, BG = 12; // bento grid origin and gap

  // ── Row 1: 4 stat tiles ────────────────────────────────────────────────────
  const TW = (W - 2 * BX - 3 * BG) / 4;
  const TH = 110;
  ch.push(MetricTile(BX,               BY, TW, TH, 'ACTIVE AGENTS', '4', '2 Claude · 1 Codex · 1 Gemini', P.violet));
  ch.push(MetricTile(BX + TW + BG,     BY, TW, TH, 'FILES CHANGED', '12', '+847 / −231 net lines', P.cyan));
  ch.push(MetricTile(BX + (TW + BG)*2, BY, TW, TH, 'TESTS PASSING', '97%', '48 of 49 suites green', P.green));
  ch.push(MetricTile(BX + (TW + BG)*3, BY, TW, TH, 'AVG. RUNTIME', '3m 12s', 'Last 4 runs: 2m / 4m / 3m / 4m', P.amber));

  // ── Row 2: Agent cards (4 cols, 190px tall) ────────────────────────────────
  const R2Y = BY + TH + BG;
  const R2H = 190;
  const agentsList = [
    { name: 'claude-1', branch: 'feat/auth', status: 'running' },
    { name: 'codex-2',  branch: 'fix/types', status: 'done' },
    { name: 'gemini-3', branch: 'refactor/db', status: 'thinking' },
    { name: 'claude-4', branch: 'test/api',  status: 'pending' },
  ];
  agentsList.forEach((a, i) => {
    const sc = { running: P.violet, done: P.green, thinking: P.cyan, pending: P.amber };
    const stats = [
      { added: 312, removed: 44 },
      { added: 189, removed: 12 },
      { added:   0, removed:  0 },
      { added:   0, removed:  0 },
    ][i];
    const cardW = TW;
    ch.push(F(BX + i * (TW + BG), R2Y, cardW, R2H, P.panel2, {
      r: 8, stroke: i === 0 ? P.violet + '44' : P.border, sw: 1,
      ch: [
        // header
        E(14, 16, 10, 10, sc[a.status], {}),
        T(a.name, 30, 12, cardW - 100, 16, { size: 13, fill: P.fg, weight: 800 }),
        StatusPill(cardW - 90, 14, a.status),
        T('⎇ ' + a.branch, 14, 32, cardW - 28, 12, { size: 9, fill: P.amber, mono: true }),
        HR(14, 50, cardW - 28),
        // mini terminal preview
        F(14, 58, cardW - 28, 72, P.panel, { r: 6, stroke: P.border, clip: true, ch: [
          T('$ phantom run', 8, 8, 200, 11, { size: 8, fill: P.green, mono: true }),
          T(a.status === 'done' ? '✓ Completed' : a.status === 'running' ? '⠦ Working...' : a.status === 'thinking' ? '⠦ Analyzing...' : 'Queued',
            8, 22, 200, 11, { size: 8, fill: a.status === 'done' ? P.green : a.status === 'pending' ? P.fg3 : P.cyan, mono: true }),
          T(a.status !== 'pending' ? `${stats.added > 0 ? '+' + stats.added : '---'} / ${stats.removed > 0 ? '-' + stats.removed : '---'} lines` : 'Waiting...',
            8, 36, 200, 11, { size: 8, fill: P.fg3, mono: true }),
          T(a.status !== 'pending' ? '20 tests passing' : '',
            8, 50, 200, 11, { size: 8, fill: P.green, mono: true }),
        ]}),
        // footer
        F(cardW - 50, R2H - 28, 36, 20, P.violetDim, { r: 6, ch: [
          T('Open', 0, 5, 36, 12, { size: 9, fill: P.violetLt, weight: 700, align: 'center' }),
        ]}),
      ],
    }));
  });

  // ── Row 3: Activity chart + PR queue ──────────────────────────────────────
  const R3Y = R2Y + R2H + BG;
  const R3H = H - R3Y - 24;
  const CHART_W = (W - 2 * BX - BG) * 0.55;
  const QUEUE_W = W - 2 * BX - BG - CHART_W;

  // Activity chart
  ch.push(F(BX, R3Y, CHART_W, R3H, P.panel2, { r: 8, stroke: P.border, sw: 1, ch: [
    T('AGENT ACTIVITY', 16, 14, 200, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1 }),
    T('Last 24 hours', CHART_W - 100, 14, 80, 12, { size: 9, fill: P.fg3 }),
    HR(16, 34, CHART_W - 32),
  ]}));
  // Bar chart bars
  const chartData = [3,1,0,2,4,6,8,5,3,7,12,9,6,4,8,11,10,7,5,9,6,4,8,12];
  const barAreaW = CHART_W - 64;
  const barW2 = barAreaW / chartData.length - 3;
  const maxVal = Math.max(...chartData);
  const barAreaH = R3H - 60;
  chartData.forEach((v, i) => {
    const bh = v === 0 ? 2 : (v / maxVal) * (barAreaH - 20);
    const color = i >= 20 ? P.violet : P.violet + '55';
    ch.push(F(BX + 32 + i * (barW2 + 3), R3Y + R3H - 20 - bh, barW2, bh, color, { r: 2 }));
  });
  // X labels
  ['0h', '6h', '12h', '18h', '24h'].forEach((l, i) => {
    ch.push(T(l, BX + 28 + i * (barAreaW / 4), R3Y + R3H - 16, 30, 11, { size: 8, fill: P.fg3 }));
  });

  // PR Queue
  const prEntries = [
    { num: '827', title: 'fix(auth): token refresh mutex', agent: 'claude-1', status: 'running' },
    { num: '826', title: 'fix(types): null checks on User model', agent: 'codex-2',  status: 'done' },
    { num: '825', title: 'refactor(db): extract query builder', agent: 'gemini-3', status: 'thinking' },
    { num: '824', title: 'test(api): integration suite', agent: 'claude-4', status: 'pending' },
  ];
  ch.push(F(BX + CHART_W + BG, R3Y, QUEUE_W, R3H, P.panel2, { r: 8, stroke: P.border, sw: 1, ch: [
    T('PR QUEUE', 16, 14, 120, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1 }),
    HR(16, 34, QUEUE_W - 32),
    ...prEntries.map((pr, i) => F(12, 42 + i * 52, QUEUE_W - 24, 44, i === 0 ? P.panel3 : P.panel, {
      r: 6,
      stroke: i === 0 ? P.violet + '33' : P.border,
      ch: [
        T('#' + pr.num, 12, 12, 36, 12, { size: 9, fill: P.fg3, weight: 600, mono: true }),
        T(pr.title, 52, 12, QUEUE_W - 140, 12, { size: 10, fill: P.fg, weight: 600 }),
        T(pr.agent, 12, 28, 80, 11, { size: 8.5, fill: P.fg3 }),
        StatusPill(QUEUE_W - 100, 22, pr.status),
      ],
    })),
  ]}));

  return { id: uid(), type: 'frame', x: 0, y: 0, width: W, height: H, fill: P.bg, clip: true, children: ch };
}

// ┌────────────────────────────────────────────────────────────────────────────┐
// │  DESKTOP SCREEN 3 — Agent Deep Dive (Reasoning Tree)                      │
// └────────────────────────────────────────────────────────────────────────────┘
function buildDesktop3() {
  const W = 1440, H = 900;
  const ch = [];
  ch.push(F(0, 0, W, H, P.bg));

  // Top bar
  ch.push(F(0, 0, W, 52, P.panel, { stroke: P.border, sw: 1, ch: [
    T('⬡ phantom', 24, 16, 120, 20, { size: 14, fill: P.violetLt, weight: 800 }),
    T('claude-1 · Deep Dive', 160, 18, 240, 16, { size: 12, fill: P.fg, weight: 700 }),
    StatusPill(W - 140, 17, 'running'),
  ]}));

  // 3-panel layout: reasoning tree | file changes | test output
  const P1W = 420, P2W = 560, P3W = W - P1W - P2W;

  // ── Panel 1: Reasoning tree ────────────────────────────────────────────────
  ch.push(VR(P1W, 52, H - 52, P.border));
  ch.push(F(0, 52, P1W, H - 52, P.panel, { ch: [] }));
  ch.push(T('REASONING TREE', 20, 70, 200, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1 }));
  ch.push(HR(20, 90, P1W - 40));

  const reasonSteps = [
    { step: '01', type: 'observe', text: 'Read auth.ts (287 lines)', detail: 'Token refresh in refreshHandler()' },
    { step: '02', type: 'analyze', text: 'Identified race condition', detail: 'Line 47: concurrent calls overlap' },
    { step: '03', type: 'plan',    text: 'Solution: mutex lock', detail: 'Mutex ensures serial execution' },
    { step: '04', type: 'act',     text: 'Patch auth.ts', detail: 'Import mutex, wrap refreshToken' },
    { step: '05', type: 'act',     text: 'Update token.ts', detail: 'Add mutex util import' },
    { step: '06', type: 'verify',  text: 'Run test suite', detail: '25/25 tests passing' },
    { step: '07', type: 'commit',  text: 'Create commit', detail: 'fix(auth): mutex lock for refresh' },
  ];
  const stepColors = { observe: P.cyan, analyze: P.orange, plan: P.amber, act: P.violet, verify: P.green, commit: P.green };
  reasonSteps.forEach((s, i) => {
    const y = 106 + i * 66;
    const active = i <= 6;
    ch.push(F(20, y, P1W - 40, 56, active ? P.panel2 : P.panel, {
      r: 8,
      stroke: active ? stepColors[s.type] + '44' : P.border,
      ch: [
        E(16, 20, 10, 10, stepColors[s.type], { opacity: active ? 1 : 0.3 }),
        T(s.step, 32, 6, 24, 12, { size: 8.5, fill: P.fg3, weight: 700, mono: true }),
        Badge(56, 6, s.type.toUpperCase(), stepColors[s.type], stepColors[s.type] + '22'),
        T(s.text, 16, 26, P1W - 72, 14, { size: 11, fill: active ? P.fg : P.fg3, weight: 600 }),
        T(s.detail, 16, 42, P1W - 72, 11, { size: 8.5, fill: P.fg3 }),
      ],
    }));
    // Connector line
    if (i < reasonSteps.length - 1) {
      ch.push(F(24, y + 56, 2, 10, stepColors[s.type], { opacity: 0.4 }));
    }
  });

  // ── Panel 2: File changes ──────────────────────────────────────────────────
  ch.push(F(P1W, 52, P2W, H - 52, P.bg, { ch: [] }));
  ch.push(VR(P1W + P2W, 52, H - 52, P.border));
  ch.push(T('FILE CHANGES', P1W + 20, 70, 200, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1 }));
  ch.push(HR(P1W + 20, 90, P2W - 40));

  // File tabs
  const fileNames = ['auth.ts', 'token.ts', 'mutex.ts (new)'];
  fileNames.forEach((f, i) => {
    const active = i === 0;
    ch.push(F(P1W + 20 + i * 140, 96, 128, 26, active ? P.panel3 : P.panel2, {
      r: 5,
      stroke: active ? P.violet + '44' : P.border,
      ch: [T(f, 10, 7, 108, 12, { size: 9, fill: active ? P.fg : P.fg2, mono: true })],
    }));
  });
  ch.push(HR(P1W, 122, P2W));

  const diff2 = [
    [' ', 1, 'import { Request, Response } from \'express\';'],
    ['+', 2, 'import { mutex } from \'../utils/mutex\';'],
    [' ', 3, 'import { TokenService } from \'../services\';'],
    [' ', 4, ''],
    [' ', 5, 'export async function refreshHandler('],
    [' ', 6, '  req: Request, res: Response'],
    [' ', 7, ') {'],
    [' ', 8, '  const { userId } = req.session;'],
    [' ', 9, '  try {'],
    ['-',10, '    const token = await refreshToken(userId);'],
    ['-',11, '    const expiry = Date.now() + 3600000;'],
    ['+',10, '    const [token, expiry] = await mutex.run(async () => {'],
    ['+',11, '      const tok = await refreshToken(userId);'],
    ['+',12, '      return [tok, Date.now() + 3600000];'],
    ['+',13, '    });'],
    [' ',14, '    if (!token) throw new TokenError(\'empty\');'],
    [' ',15, '    await session.update({ token, expiry });'],
    [' ',16, '    res.json({ token, expiry });'],
    [' ',17, '  } catch (err) {'],
    [' ',18, '    logger.error(\'refresh failed\', err);'],
    [' ',19, '    res.status(401).json({ error: err.message });'],
    [' ',20, '  }'],
    [' ',21, '}'],
  ];
  diff2.forEach(([t, n, c], i) => {
    const y = 126 + i * 15;
    if (y > H - 20) return;
    ch.push(DiffLine(P1W, y, P2W, t, n, c));
  });

  // ── Panel 3: Test output ────────────────────────────────────────────────────
  ch.push(F(P1W + P2W, 52, P3W, H - 52, P.panel, { ch: [] }));
  ch.push(T('TEST OUTPUT', P1W + P2W + 20, 70, 200, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1 }));
  ch.push(Badge(P1W + P2W + P3W - 80, 66, '25 PASSING', P.green, P.greenDim));
  ch.push(HR(P1W + P2W + 20, 90, P3W - 40));

  const testLines = [
    ['h', 'PASS  src/middleware/auth.test.ts'],
    ['l', '  ✓ handles valid token (12ms)'],
    ['l', '  ✓ rejects expired token (8ms)'],
    ['l', '  ✓ mutex prevents race condition (34ms)'],
    ['l', '  ✓ refreshes token atomically (28ms)'],
    ['h', 'PASS  src/utils/token.test.ts'],
    ['l', '  ✓ generates valid JWT (5ms)'],
    ['l', '  ✓ validates signature (4ms)'],
    ['l', '  ✓ rejects tampered token (6ms)'],
    ['h', 'PASS  src/types/session.test.ts'],
    ['l', '  ✓ session persists across requests (18ms)'],
    ['l', '  ✓ session expires correctly (11ms)'],
    ['d', ''],
    ['s', 'Test Suites: 3 passed, 3 total'],
    ['s', 'Tests:       25 passed, 25 total'],
    ['s', 'Snapshots:   0 total'],
    ['s', 'Time:        2.47s'],
    ['d', ''],
    ['g', 'All tests passed ✓'],
  ];
  testLines.forEach(([ t, l], i) => {
    const y = 106 + i * 18;
    if (y > H - 20) return;
    const fc = t === 'h' ? P.fg : t === 'l' ? P.green : t === 's' ? P.fg2 : t === 'g' ? P.green : P.fg3;
    const weight = t === 'h' ? 700 : 400;
    ch.push(T(l, P1W + P2W + 20, y, P3W - 40, 14, { size: 9.5, fill: fc, weight, mono: true }));
  });

  // Coverage bar
  ch.push(HR(P1W + P2W + 20, H - 90, P3W - 40));
  ch.push(T('CODE COVERAGE', P1W + P2W + 20, H - 78, 120, 12, { size: 9, fill: P.fg3, weight: 700, ls: 1 }));
  ch.push(T('94.2%', P1W + P2W + P3W - 60, H - 80, 50, 14, { size: 12, fill: P.green, weight: 800, mono: true }));
  ch.push(F(P1W + P2W + 20, H - 58, P3W - 40, 10, P.panel3, { r: 5, ch: [
    F(0, 0, Math.round((P3W - 40) * 0.942), 10, P.green, { r: 5, opacity: 0.8 }),
  ]}));

  return { id: uid(), type: 'frame', x: 0, y: 0, width: W, height: H, fill: P.bg, clip: true, children: ch };
}

// ── Assemble .pen file ─────────────────────────────────────────────────────────
const screens = [
  buildMobile1(),
  buildMobile2(),
  buildMobile3(),
  buildDesktop1(),
  buildDesktop2(),
  buildDesktop3(),
];

const pen = {
  version: '2.8',
  title: 'PHANTOM — AI Coding Agent Orchestrator',
  screens,
};

fs.writeFileSync(path.join(__dirname, 'phantom-app.pen'), JSON.stringify(pen));
const penJson = fs.readFileSync(path.join(__dirname, 'phantom-app.pen'), 'utf8');
console.log(`✓ phantom-app.pen written (${(penJson.length / 1024).toFixed(1)} KB, ${screens.length} screens)`);

// ── Thumbnail helpers ──────────────────────────────────────────────────────────
const thumbScale = 0.14;
function screenToSvgThumb(screen) {
  const sw = screen.width * thumbScale;
  const sh = screen.height * thumbScale;
  const sc = thumbScale;
  function nodeToSvg(n) {
    if (!n) return '';
    const x = (n.x || 0) * sc;
    const y = (n.y || 0) * sc;
    const w = (n.width || 0) * sc;
    const h = (n.height || 0) * sc;
    const fill = n.fill && n.fill !== 'transparent' ? n.fill : 'none';
    const op = n.opacity !== undefined ? ` opacity="${n.opacity}"` : '';
    const r = n.cornerRadius ? ` rx="${n.cornerRadius * sc}"` : '';
    const stroke = n.stroke ? ` stroke="${n.stroke.fill || n.stroke}" stroke-width="${(n.stroke.thickness || 1) * sc}"` : '';
    let inner = (n.children || []).map(nodeToSvg).join('');
    if (n.type === 'ellipse') {
      const cx = x + w / 2, cy = y + h / 2;
      return `<ellipse cx="${cx}" cy="${cy}" rx="${w/2}" ry="${h/2}" fill="${fill}"${op}${stroke}/>${inner}`;
    }
    if (n.type === 'text') {
      const sz = Math.max(3, (n.fontSize || 12) * sc);
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${n.fill || '#888'}"${op} rx="1"/>`;
    }
    const clip = n.clip ? ` clip-path="url(#c${n.id})"` : '';
    let defs = '';
    if (n.clip) {
      defs = `<defs><clipPath id="c${n.id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"${r}/></clipPath></defs>`;
    }
    return `${defs}<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${r}${op}${stroke}${clip}/>${inner}`;
  }
  const body = screen.children.map(nodeToSvg).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${sw}" height="${sh}" viewBox="0 0 ${sw} ${sh}" style="border-radius:8px;overflow:hidden">${body}</svg>`;
}

function buildHeroHTML() {
  const thumbsHTML = screens.map((s, i) => {
    const label = ['Mobile · Swarm', 'Mobile · Terminal', 'Mobile · Diff Review',
                   'Desktop · Command', 'Desktop · Dashboard', 'Desktop · Deep Dive'][i];
    const svg = screenToSvgThumb(s);
    return `<div class="thumb"><div class="thumb-img">${svg}</div><div class="thumb-label">${label}</div></div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>PHANTOM — AI Coding Agent Orchestrator · RAM Design Studio</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:${P.bg};--panel:${P.panel};--panel2:${P.panel2};
  --violet:${P.violet};--violet-lt:${P.violetLt};--violet-dim:${P.violetDim};
  --cyan:${P.cyan};--green:${P.green};--orange:${P.orange};--red:${P.red};--amber:${P.amber};
  --fg:${P.fg};--fg2:${P.fg2};--fg3:${P.fg3};--border:${P.border};
  --mono:'JetBrains Mono','Fira Code',monospace;
}
body{background:var(--bg);color:var(--fg);font-family:'Inter',system-ui,sans-serif;line-height:1.6}

/* NAV */
nav{display:flex;justify-content:space-between;align-items:center;padding:16px 48px;border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--bg);z-index:100}
.logo{font-size:18px;font-weight:900;color:var(--violet-lt);letter-spacing:-0.5px;font-family:var(--mono)}
.nav-links{display:flex;gap:24px;font-size:12px;color:var(--fg3)}
.nav-links a{color:var(--fg3);text-decoration:none}
.nav-links a:hover{color:var(--fg)}

/* HERO */
.hero{padding:80px 48px 60px;max-width:1100px;margin:0 auto}
.tag{font-family:var(--mono);font-size:10px;color:var(--violet);letter-spacing:2px;font-weight:700;margin-bottom:24px;opacity:.8}
h1{font-size:clamp(56px,8vw,88px);font-weight:900;line-height:1.0;letter-spacing:-3px;margin-bottom:32px}
h1 .v{color:var(--violet-lt)}
h1 .c{color:var(--cyan)}
h1 .w{color:var(--fg);opacity:.5}
.prompt{font-size:16px;color:var(--fg2);max-width:680px;margin-bottom:32px;font-style:italic;line-height:1.7;border-left:3px solid var(--violet);padding-left:20px}
.pills{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:40px}
.pill{padding:6px 14px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:.8px;font-family:var(--mono)}
.pv{background:var(--violet-dim);color:var(--violet-lt);border:1px solid ${P.violet}44}
.pc{background:var(--cyan-dim,${P.cyanDim});color:var(--cyan);border:1px solid ${P.cyan}44}
.pg{background:${P.greenDim};color:var(--green);border:1px solid ${P.green}44}
.pm{background:var(--panel2);color:var(--fg2);border:1px solid var(--border)}
.actions{display:flex;flex-wrap:wrap;gap:10px}
.btn{padding:10px 20px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;border:none;text-decoration:none;display:inline-flex;align-items:center;gap:8px;letter-spacing:.3px}
.btn-p{background:var(--violet);color:#fff}
.btn-p:hover{background:${P.violetLt};color:var(--bg)}
.btn-s{background:var(--panel2);color:var(--fg2);border:1px solid var(--border)}
.btn-s:hover{background:var(--panel);color:var(--fg)}

/* PREVIEW */
.preview{padding:60px 48px;border-top:1px solid var(--border)}
.preview-label{font-family:var(--mono);font-size:10px;color:var(--fg3);letter-spacing:1.5px;font-weight:700;margin-bottom:24px}
.thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:16px}
.thumb{flex-shrink:0;text-align:center}
.thumb-img{border-radius:10px;overflow:hidden;border:1px solid var(--border);background:var(--panel)}
.thumb-label{font-size:10px;color:var(--fg3);margin-top:8px;font-family:var(--mono)}

/* BRAND */
.brand{padding:60px 48px;border-top:1px solid var(--border);display:grid;grid-template-columns:1fr 1fr;gap:48px;max-width:1200px;margin:0 auto}
.brand-label{font-family:var(--mono);font-size:10px;color:var(--fg3);letter-spacing:1.5px;font-weight:700;margin-bottom:20px}
.swatches{display:flex;flex-wrap:wrap;gap:12px}
.swatch{width:48px;height:48px;border-radius:8px;border:1px solid var(--border)}
.swatch-label{font-size:8px;color:var(--fg3);margin-top:4px;font-family:var(--mono);line-height:1.4}
.principles{display:grid;gap:16px}
.principle{background:var(--panel);border-radius:8px;padding:16px;border:1px solid var(--border)}
.p-num{font-family:var(--mono);font-size:10px;color:var(--violet);font-weight:700;margin-bottom:6px}
.p-title{font-size:12px;font-weight:800;color:var(--fg);letter-spacing:.5px;margin-bottom:6px}
.p-desc{font-size:12px;color:var(--fg3);line-height:1.6}
.type-scale{display:flex;flex-direction:column;gap:10px}
.ts-row{display:flex;align-items:baseline;gap:16px;border-bottom:1px solid var(--border);padding-bottom:8px}
.ts-label{font-family:var(--mono);font-size:9px;color:var(--fg3);min-width:160px}
.tokens{background:var(--panel);border-radius:8px;padding:20px;border:1px solid var(--border);position:relative}
.copy-btn{position:absolute;top:12px;right:12px;background:var(--violet);color:#fff;border:none;padding:6px 12px;border-radius:6px;font-size:10px;font-weight:700;cursor:pointer;font-family:var(--mono)}
.tokens pre{font-size:10px;line-height:1.6;white-space:pre-wrap;font-family:var(--mono)}

/* PRD */
.prd{padding:60px 48px;border-top:1px solid var(--border);max-width:900px;margin:0 auto}
.prd h2{font-size:28px;font-weight:800;margin-bottom:32px;color:var(--violet-lt)}
.prd h3{font-size:12px;font-weight:800;letter-spacing:1.5px;color:var(--fg3);margin:28px 0 10px;font-family:var(--mono)}
.prd p{font-size:14px;color:var(--fg2);margin-bottom:12px;line-height:1.7}
.prd ul{padding-left:20px;margin-bottom:12px}
.prd li{font-size:14px;color:var(--fg2);margin-bottom:8px;line-height:1.6}
.prd strong{color:var(--fg)}

/* REFLECTION */
.reflection{padding:60px 48px;border-top:1px solid var(--border);max-width:900px;margin:0 auto}
.r-label{font-family:var(--mono);font-size:10px;color:var(--fg3);letter-spacing:1.5px;font-weight:700;margin-bottom:24px}
.r-text p{font-size:14px;color:var(--fg2);margin-bottom:20px;line-height:1.8}
.r-text strong{color:var(--fg)}

/* FOOTER */
footer{padding:32px 48px;border-top:1px solid var(--border);display:flex;justify-content:space-between;font-size:11px;color:var(--fg3);font-family:var(--mono)}
footer a{color:var(--fg3);text-decoration:none;opacity:.5}

/* TOAST */
.toast{position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:var(--violet);color:#fff;padding:10px 24px;border-radius:8px;font-size:12px;font-weight:700;opacity:0;transition:opacity .3s;pointer-events:none;font-family:var(--mono)}
.toast.show{opacity:1}
</style>
</head>
<body>
<nav>
  <div class="logo">⬡ phantom</div>
  <div class="nav-links">
    <a href="https://ram.zenbin.org/gallery">Gallery</a>
    <a href="https://ram.zenbin.org/${SLUG}-viewer">Viewer</a>
    <a href="#brand">Tokens</a>
    <a href="#prd">Brief</a>
  </div>
</nav>

<section class="hero">
  <div class="tag">HEARTBEAT · AI CODING AGENT ORCHESTRATOR · 6 SCREENS · MARCH 2026</div>
  <h1>
    <span class="v">Phantom</span><br>
    <span class="c">Terminal.</span><br>
    <span class="w">Parallel.</span>
  </h1>
  <p class="prompt">${PROMPT}</p>
  <div class="pills">
    <span class="pill pv">VIOLET · AGENT ACTIVE</span>
    <span class="pill pc">CYAN · TERMINAL OUTPUT</span>
    <span class="pill pg">EMERALD · TESTS PASSING</span>
    <span class="pill pm">VOID DARK BASE</span>
    <span class="pill pv">SPLIT-PANE COMMAND CENTER</span>
    <span class="pill pc">BENTO DASHBOARD</span>
    <span class="pill pg">REASONING TREE</span>
    <span class="pill pm">PARALLEL AGENT SWARM</span>
  </div>
  <div class="actions">
    <button class="btn btn-p" onclick="openViewer()">▶  Open in Viewer</button>
    <button class="btn btn-s" onclick="downloadPen()">↓  Download .pen</button>
    <button class="btn btn-s" onclick="copyPrompt()">⎘  Copy Prompt</button>
    <button class="btn btn-s" onclick="shareOnX()">𝕏  Share</button>
    <a class="btn btn-s" href="https://ram.zenbin.org/${SLUG}-viewer">☰  Viewer Only</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery">← Gallery</a>
  </div>
</section>

<section class="preview">
  <div class="preview-label">SCREEN PREVIEW · 3 MOBILE + 3 DESKTOP</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand" id="brand">
  <div>
    <div class="brand-label">COLOR PALETTE</div>
    <div class="swatches">
      ${[
        [P.bg,        'BG'],
        [P.panel,     'PANEL'],
        [P.panel2,    'PANEL-2'],
        [P.panel3,    'PANEL-3'],
        [P.border,    'BORDER'],
        [P.violet,    'VIOLET'],
        [P.violetLt,  'VIOLET-LT'],
        [P.violetDim, 'VIOLET-DIM'],
        [P.cyan,      'CYAN'],
        [P.cyanDim,   'CYAN-DIM'],
        [P.green,     'GREEN'],
        [P.greenDim,  'GREEN-DIM'],
        [P.orange,    'ORANGE'],
        [P.red,       'RED'],
        [P.amber,     'AMBER'],
        [P.fg,        'FG'],
        [P.fg2,       'FG-2'],
        [P.fg3,       'FG-3'],
      ].map(([c, l]) => `<div><div class="swatch" style="background:${c}"></div><div class="swatch-label">${l}<br><span style="opacity:.6">${c}</span></div></div>`).join('')}
    </div>
  </div>
  <div>
    <div class="brand-label">DESIGN PRINCIPLES</div>
    <div class="principles">
      <div class="principle">
        <div class="p-num">01</div>
        <div class="p-title">TERMINAL AS TRUTH</div>
        <div class="p-desc">The terminal is the primary interface — not a secondary console. All key interactions happen in monospace, making the tool feel native to developers' existing mental models.</div>
      </div>
      <div class="principle">
        <div class="p-num">02</div>
        <div class="p-title">SEMANTIC STATUS COLORS</div>
        <div class="p-desc">Violet = agent active. Cyan = terminal output. Green = passing/done. Orange = in-progress. Red = error. Every color carries unambiguous meaning, never decorative.</div>
      </div>
      <div class="principle">
        <div class="p-num">03</div>
        <div class="p-title">BENTO DENSITY</div>
        <div class="p-desc">The desktop dashboard uses a bento grid to pack maximum information at a glance — 4 stat tiles, 4 agent cards, activity chart, PR queue — without clutter.</div>
      </div>
      <div class="principle">
        <div class="p-num">04</div>
        <div class="p-title">REASONING VISIBILITY</div>
        <div class="p-desc">Agents' decision trees are first-class UI elements. Every "observe → analyze → plan → act → verify → commit" step is surfaced, making AI behavior auditable and trustworthy.</div>
      </div>
    </div>
  </div>
  <div>
    <div class="brand-label">TYPE SCALE</div>
    <div class="type-scale">
      ${[
        ['display',  '88px / 900', 'Phantom'],
        ['title',    '16px / 800', 'Command Center'],
        ['heading',  '13px / 700', 'claude-1 · Running'],
        ['body',     '11px / 400', 'feat/auth: fix token refresh'],
        ['mono-lg',  '9.5px / 400 JetBrains', '$ phantom run'],
        ['mono-sm',  '8.5px / 400 JetBrains', '+312 / -44 lines changed'],
        ['label',    '9px / 700',  'ACTIVE AGENTS · REASONING TREE'],
      ].map(([n, spec, ex]) => `<div class="ts-row"><span class="ts-label">${n} · ${spec}</span><span style="font-size:${spec.split('/')[0].trim()};font-weight:${spec.split('/')[1].split(' ')[0].trim()};color:${P.fg};opacity:.8;${n.startsWith('mono') ? 'font-family:\'JetBrains Mono\',monospace' : ''}">${ex}</span></div>`).join('')}
    </div>
  </div>
  <div>
    <div class="brand-label">CSS DESIGN TOKENS</div>
    <div class="tokens" id="tokens">
      <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
      <pre style="color:${P.fg2}">${CSS_TOKENS.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    </div>
  </div>
</section>

<section class="prd" id="prd">
  <h2>Product Brief</h2>
  <h3>OVERVIEW</h3>
  <p>PHANTOM is a dark-mode AI coding agent orchestrator — a command center for developers who want to run multiple Claude, Codex, and Gemini coding agents in parallel across isolated git worktrees. Each agent gets its own terminal, file system sandbox, and test runner. PHANTOM visualizes all agents simultaneously in a bento-grid dashboard, lets you inspect individual agent reasoning trees, review generated diffs, and merge approved changes with a single action.</p>
  <p>The design is directly inspired by <strong>Superset.sh</strong> (featured on darkmodedesign.com) — the breakout 2026 tool for orchestrating swarms of Claude Code/Codex/Gemini agents. Superset showed the world that "the product UI IS the hero" — the actual terminal, diff viewer, and PR panel are the homepage.</p>
  <h3>TARGET USERS</h3>
  <ul>
    <li><strong>Power developers</strong> who run AI agents daily and need a professional orchestration interface</li>
    <li><strong>Engineering leads</strong> who want to assign different agents to different tickets in parallel</li>
    <li><strong>OSS maintainers</strong> using AI agents to triage, fix, and test issues at scale</li>
  </ul>
  <h3>CORE FEATURES</h3>
  <ul>
    <li><strong>Agent Swarm View</strong> — 2×2 card grid showing all active agents with status, branch, live output</li>
    <li><strong>Terminal Feed</strong> — Full monospace terminal session for any agent, with instruction input bar</li>
    <li><strong>Diff Review</strong> — Code diff viewer with AI annotations, inline confidence scores, approve/request actions</li>
    <li><strong>Command Center</strong> — Desktop split-pane: agent sidebar + main terminal + diff/AI panel</li>
    <li><strong>Workspace Dashboard</strong> — Bento grid: 4 stat tiles, 4 agent cards, 24h activity chart, PR queue</li>
    <li><strong>Agent Deep Dive</strong> — Reasoning tree visualization, full file diff, test output + coverage</li>
  </ul>
  <h3>DESIGN LANGUAGE</h3>
  <p><strong>Terminal-first:</strong> Monospace everywhere code or output appears. JetBrains Mono for terminal content. The interface looks and feels like a VS Code extension that grew into a full product.</p>
  <p><strong>Void-dark palette:</strong> #07090D base — darker than GitHub dark, closer to a void. Panels lift from this base in 3 steps. The darkest environment makes colored status indicators maximally legible.</p>
  <p><strong>Bento density:</strong> Inspired by the bento grid trend on Godly.website — information is arranged in tight, rectangular cells. No wasted space, no breathing room — every pixel communicates state.</p>
  <h3>SCREEN ARCHITECTURE</h3>
  <ul>
    <li><strong>Mobile 1 — Agent Swarm:</strong> 2×2 agent cards, summary strip, live terminal preview, model distribution chart</li>
    <li><strong>Mobile 2 — Terminal Feed:</strong> Full-height terminal with macOS-style chrome, scrollback, instruction input bar</li>
    <li><strong>Mobile 3 — Diff Review:</strong> File tabs, diff viewer, AI annotation card, approve/request actions</li>
    <li><strong>Desktop 1 — Command Center:</strong> Sidebar (agent list) + terminal (700px) + diff+AI panel (500px)</li>
    <li><strong>Desktop 2 — Dashboard:</strong> 4 stat tiles + 4 agent cards + 24h bar chart + PR queue bento</li>
    <li><strong>Desktop 3 — Deep Dive:</strong> Reasoning tree (7 steps) + full diff viewer + test output + coverage bar</li>
  </ul>
</section>

<section class="reflection">
  <div class="r-label">DESIGN REFLECTION</div>
  <div class="r-text">
    <p><strong>What I found:</strong> Browsing <a href="https://godly.website" style="color:var(--violet)">godly.website</a> and <a href="https://www.darkmodedesign.com" style="color:var(--violet)">darkmodedesign.com</a> this week, one site stopped the scroll completely: <a href="https://superset.sh" style="color:var(--violet)">Superset.sh</a>. It's a tool for orchestrating parallel Claude Code / Codex / Gemini agents — and instead of showing a polished marketing surface, the hero IS the product: a split-panel showing an actual terminal, PR review diff, and branching workspace list. It's the clearest example yet of "show the tool, not the promise." Also strong: <a href="https://midday.ai" style="color:var(--violet)">Midday.ai</a> and <a href="https://linear.app" style="color:var(--violet)">Linear.app</a> (both on darkmodedesign.com) for their ultra-dark void-black palette and structured information density. From Godly: <strong>Atlas</strong> (fintech bento) and <strong>Haptic</strong> (clean dark mobile) reinforced the trend of "functional density over visual decoration."</p>
    <p><strong>Challenge:</strong> Design PHANTOM — a dark terminal-aesthetic AI coding agent orchestrator — directly absorbing Superset.sh's split-panel paradigm and void-dark palette while extending it to 6 screens covering the full agent lifecycle: spawn → monitor → inspect → review → approve.</p>
    <p><strong>Key decisions:</strong> (1) <strong>JetBrains Mono for all terminal content</strong> — every line of output, diff, and filename is monospace. This collapses the cognitive gap between the tool and the developer's existing IDE environment. The UI doesn't look like a designed app — it looks like home. (2) <strong>The reasoning tree as first-class UI</strong> on Desktop 3 — agents display their observe→analyze→plan→act→verify→commit steps in a vertical card stack with connector lines and semantic color per step type. Inspired by how Superset shows "agent thinking" but pushed further into an auditable decision ledger. (3) <strong>The void-dark palette (#07090D)</strong> — darker than GitHub dark, darker than Linear. This creates the highest possible contrast for the colored status indicators (violet/cyan/green/orange/red), making agent state instantly legible across a 1440px command center even in peripheral vision.</p>
    <p><strong>What I'd do differently:</strong> The bento dashboard (Desktop 2) agent cards are too uniform — each card looks nearly identical despite different agent states. A stronger design would use the card background and border to more aggressively signal state: a running agent gets a violet glow, a done agent fades to near-silence, a failing agent pulses red. The static thumbnail can't capture animation, but even in static form the differentiation should be more immediate. Next time I'd also push the activity bar chart to show per-agent colored stacks rather than a monochrome violet — you'd see at a glance which agent was most active at each hour.</p>
  </div>
</section>

<footer>
  <span>RAM Design Studio · heartbeat · March 18, 2026</span>
  <a href="https://ram.zenbin.org/gallery">ram.zenbin.org/gallery</a>
</footer>

<div class="toast" id="toast"></div>

<script>
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2200);}
function openViewer(){window.open('https://ram.zenbin.org/${SLUG}-viewer','_blank');}
function downloadPen(){toast('Opening viewer — save .pen from there');window.open('https://ram.zenbin.org/${SLUG}-viewer','_blank');}
function copyPrompt(){navigator.clipboard.writeText(${JSON.stringify(PROMPT)}).then(()=>toast('Prompt copied ✓')).catch(()=>toast('Copy failed'));}
function copyTokens(){navigator.clipboard.writeText(${JSON.stringify(CSS_TOKENS)}).then(()=>toast('CSS tokens copied ✓')).catch(()=>toast('Copy failed'));}
function shareOnX(){const t=encodeURIComponent('PHANTOM — dark terminal AI coding agent orchestrator. 6 screens, void-dark palette, parallel agent bento grid. Built by RAM Design Studio ⚡🤖');const u=encodeURIComponent('https://ram.zenbin.org/${SLUG}');window.open('https://x.com/intent/tweet?text='+t+'&url='+u,'_blank');}
<\/script>
</body>
</html>`;
}

// ── HTTP publish ───────────────────────────────────────────────────────────────
function publish(slug, title, html, subdomain = 'ram') {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ title, html });
    const req  = https.request({
      hostname: 'zenbin.org',
      path:     `/v1/pages/${slug}`,
      method:   'POST',
      headers: {
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Subdomain':    subdomain,
      },
    }, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── GitHub gallery ─────────────────────────────────────────────────────────────
function githubReq(opts, body) {
  return new Promise((resolve, reject) => {
    const r = https.request(opts, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    r.on('error', reject);
    if (body) r.write(body);
    r.end();
  });
}

async function pushToGallery(heroUrl) {
  if (!GITHUB_TOKEN || !GITHUB_REPO) { console.log('  ⚠ No GitHub token'); return; }
  try {
    const raw = await githubReq({
      hostname: 'raw.githubusercontent.com',
      path: `/${GITHUB_REPO}/main/queue.json`,
      method: 'GET', headers: { 'User-Agent': 'RAM-Design-Bot' },
    });
    if (raw.status !== 200) { console.log('  ⚠ Could not read queue.json'); return; }
    const queue = JSON.parse(raw.body);

    const shaRes = await githubReq({
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/contents/queue.json`,
      method: 'GET',
      headers: { 'User-Agent': 'RAM-Design-Bot', 'Authorization': `token ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' },
    });
    const sha = JSON.parse(shaRes.body).sha;

    const entry = {
      id:           `hb-phantom-${Date.now()}`,
      prompt:       PROMPT.slice(0, 200),
      app_name:     'PHANTOM',
      archetype:    'developer-tools',
      credit:       'RAM Studio Heartbeat',
      submitted_at: new Date().toISOString(),
      status:       'done',
      design_url:   heroUrl,
      published_at: new Date().toISOString(),
    };
    queue.submissions = queue.submissions || [];
    queue.submissions.push(entry);

    const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
    const updateRes = await githubReq({
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/contents/queue.json`,
      method: 'PUT',
      headers: {
        'User-Agent': 'RAM-Design-Bot',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
      },
    }, JSON.stringify({ message: 'heartbeat: PHANTOM design published', content, sha }));

    if (updateRes.status === 200 || updateRes.status === 201) {
      console.log('  ✓ Gallery queue updated');
    } else {
      console.log(`  ⚠ Gallery update HTTP ${updateRes.status}`);
    }
  } catch (e) {
    console.log(`  ⚠ Gallery push failed: ${e.message}`);
  }
}

// ── Main ───────────────────────────────────────────────────────────────────────
(async () => {
  console.log('\n🎨 PHANTOM — Design Discovery Pipeline');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const heroHtml = buildHeroHTML();
  console.log(`  Hero HTML: ${(heroHtml.length / 1024).toFixed(1)} KB`);

  // Viewer injection
  const viewerPath = path.join(__dirname, 'penviewer-app.html');
  let viewerHtml = fs.readFileSync(viewerPath, 'utf8');
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  viewerHtml = viewerHtml.replace('<script>', injection + '\n<script>');

  console.log('\n  📤 Publishing hero   → ram.zenbin.org/' + SLUG + ' ...');
  const r1 = await publish(SLUG, 'PHANTOM — AI Coding Agent Orchestrator · RAM Design Studio', heroHtml);
  const heroOk = r1.status === 200 || r1.status === 201;
  console.log(`  ${heroOk ? '✓' : '✗'} Hero: HTTP ${r1.status}`);

  console.log('  📤 Publishing viewer → ram.zenbin.org/' + SLUG + '-viewer ...');
  const r2 = await publish(SLUG + '-viewer', 'PHANTOM — Viewer · RAM Design Studio', viewerHtml);
  const viewerOk = r2.status === 200 || r2.status === 201;
  console.log(`  ${viewerOk ? '✓' : '✗'} Viewer: HTTP ${r2.status}`);

  const heroUrl = `https://ram.zenbin.org/${SLUG}`;
  console.log('\n  📋 Pushing to gallery queue...');
  await pushToGallery(heroUrl);

  console.log('\n🔗 Live URLs:');
  console.log(`   Hero:   ${heroUrl}`);
  console.log(`   Viewer: https://ram.zenbin.org/${SLUG}-viewer`);
  console.log(`\n✅ Pipeline complete`);
})();
