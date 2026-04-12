// CONDUIT — AI Agent Orchestration Platform
// Palette: deep space black + electric mint + violet + warm white
// Inspired by:
//   - Superset (land-book.com) — terminal-style dark, code editor for AI agent swarms, monospace type
//   - Runlayer "Enterprise MCPs, Skills & Agents" (land-book.com) — deep black + purple MCP diagram nodes
//   - Urbane (darkmodedesign.com) — dark teal #0A2B2A bg, yellow-orange accent, boutique dark palette
//   - Antonio Scirica (darkmodedesign.com) — rotating circular badge CTA, sparse minimalism
//
// Challenge: Design a dark-mode AI Agent Orchestration landing + dashboard
// that combines terminal aesthetics, bento grid layouts, and rotating badge micro-interactions.
// 6 screens: Landing, Agent Builder (desktop), Live Run Monitor, Pricing, Mobile Dashboard, Mobile Agent Feed

const fs   = require('fs');
const path = require('path');

// ── Palette (dark teal meets electric mint, inspired by Urbane + Superset research) ──
const C = {
  bg:        '#060B0A',   // Urbane-inspired near-black with teal undertone
  surface:   '#0C1412',   // first lift
  surface2:  '#121C1A',   // card surface
  surface3:  '#192624',   // elevated
  border:    '#1E2E2C',   // hairline
  border2:   '#28403C',   // strong divider
  fg:        '#EEF2F0',   // cool near-white
  fg2:       '#7A9490',   // muted teal-gray
  fg3:       '#3D5550',   // very muted
  mint:      '#00E5B0',   // electric mint — Conduit primary accent
  mintDim:   '#00E5B011',
  mintBrd:   '#00E5B033',
  violet:    '#7B4FFF',   // violet — secondary for AI nodes
  violetDim: '#7B4FFF22',
  violetBrd: '#7B4FFF44',
  amber:     '#F5A623',   // amber — warning / status
  amberDim:  '#F5A62322',
  coral:     '#FF5C5C',   // error/alert
  white:     '#FFFFFF',
  black:     '#000000',
  // Monospace terminal accent
  termGreen: '#39FF7A',   // bright terminal green for active status
};

const W_M = 390, H_M = 844;   // mobile
const W_D = 1440, H_D = 900;  // desktop

// ── UID ───────────────────────────────────────────────────────────────────────
let _uid = 2000;
const uid = () => `el-${_uid++}`;

// ── Primitive builders ────────────────────────────────────────────────────────
const R = (x, y, w, h, fill, r = 0, opts = {}) => ({
  id: uid(), type: 'rectangle',
  x, y, width: w, height: h, fill,
  cornerRadius: r, ...opts,
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse',
  x, y, width: w, height: h, fill, ...opts,
});

const T = (content, x, y, w, h, opts = {}) => ({
  id: uid(), type: 'text', content,
  x, y, width: w, height: h,
  fontSize: opts.size || 13,
  fill: opts.fill || C.fg,
  fontFamily: opts.font || 'Inter',
  fontWeight: opts.weight || 400,
  letterSpacing: opts.ls || 0,
  lineHeight: opts.lh || 1.4,
  textAlignHorizontal: opts.align || 'left',
  textAlignVertical: opts.valign || 'top',
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const F = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'frame',
  x, y, width: w, height: h, fill,
  cornerRadius: opts.r || 0,
  clip: opts.clip !== undefined ? opts.clip : true,
  ...(opts.stroke ? { stroke: opts.stroke, strokeWidth: opts.sw || 1 } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.ch || [],
});

const HR = (x, y, w, fill) => R(x, y, w, 1, fill);
const VR = (x, y, h, fill) => R(x, y, 1, h, fill);

// ── Reusable components ───────────────────────────────────────────────────────

// Pill tag
function Tag(x, y, label, color = C.mint, textColor = null) {
  const len = label.length * 6 + 16;
  return [
    R(x, y, len, 20, color + '22', 10),
    T(label, x + 8, y + 3, len - 16, 14, {
      size: 9, fill: textColor || color, weight: 700, ls: 0.5,
    }),
  ];
}

// Status dot + label
function StatusBadge(x, y, label, color = C.termGreen) {
  return [
    E(x, y + 4, 7, 7, color),
    T(label, x + 12, y, 120, 16, { size: 11, fill: color, weight: 600 }),
  ];
}

// Agent node card (for orchestration graph)
function AgentNode(x, y, name, type, status, accent = C.mint) {
  const w = 160, h = 72;
  const statusColors = { running: C.termGreen, idle: C.fg3, error: C.coral, waiting: C.amber };
  const sc = statusColors[status] || C.fg3;
  return [
    R(x, y, w, h, C.surface2, 10, { stroke: accent + '44', sw: 1 }),
    // top accent bar
    R(x + 1, y + 1, w - 2, 3, accent, 9),
    T(type.toUpperCase(), x + 12, y + 12, w - 24, 12, { size: 8, fill: accent, weight: 700, ls: 1.5 }),
    T(name, x + 12, y + 26, w - 24, 18, { size: 13, fill: C.fg, weight: 600 }),
    E(x + 12, y + 50, 6, 6, sc),
    T(status, x + 22, y + 47, w - 34, 14, { size: 9.5, fill: sc, weight: 600 }),
  ];
}

// Connector line between nodes
function Connector(x1, y1, x2, y2, color = C.mint) {
  // Draw as a horizontal rect (simplified)
  const midX = Math.min(x1, x2);
  const w = Math.abs(x2 - x1);
  const midY = Math.min(y1, y2);
  const h = Math.max(1, Math.abs(y2 - y1));
  if (w > h) {
    return [R(midX, y1, w, 1, color, 0, { opacity: 0.35 })];
  }
  return [R(x1, midY, 1, h, color, 0, { opacity: 0.35 })];
}

// Metric card (bento-style)
function MetricCard(x, y, w, h, label, value, sub, accent = C.mint, r = 12) {
  return [
    R(x, y, w, h, C.surface2, r, { stroke: C.border, sw: 1 }),
    T(label.toUpperCase(), x + 16, y + 16, w - 32, 12, { size: 8.5, fill: C.fg3, weight: 700, ls: 1.5 }),
    T(value, x + 16, y + 36, w - 32, 32, { size: 28, fill: accent, weight: 700, font: 'SF Mono' }),
    T(sub, x + 16, y + h - 28, w - 32, 18, { size: 10, fill: C.fg2 }),
  ];
}

// Log line (terminal style)
function LogLine(x, y, w, time, level, msg, levelColor = C.fg3) {
  return [
    T(time, x, y, 55, 16, { size: 10, fill: C.fg3, font: 'SF Mono' }),
    T(level, x + 60, y, 50, 16, { size: 10, fill: levelColor, weight: 700, font: 'SF Mono' }),
    T(msg, x + 115, y, w - 115, 16, { size: 10, fill: C.fg2, font: 'SF Mono' }),
  ];
}

// Progress bar
function ProgressBar(x, y, w, pct, color = C.mint) {
  return [
    R(x, y, w, 4, C.border, 2),
    R(x, y, Math.round(w * pct), 4, color, 2),
  ];
}

// Nav item (sidebar)
function SideNavItem(x, y, label, active = false, icon = '◈') {
  const bg = active ? C.mintDim : 'none';
  const fg = active ? C.mint : C.fg2;
  return [
    R(x, y, 200, 36, bg, 8),
    ...(active ? [R(x, y + 8, 3, 20, C.mint, 2)] : []),
    T(icon, x + 14, y + 10, 16, 16, { size: 13, fill: fg, align: 'center' }),
    T(label, x + 36, y + 10, 150, 16, { size: 12, fill: fg, weight: active ? 600 : 400 }),
  ];
}

// ── Screen 1: LANDING PAGE (Desktop 1440×900) ─────────────────────────────────
function buildScreenLanding() {
  const children = [];

  // Background
  children.push(R(0, 0, W_D, H_D, C.bg));

  // Subtle grid overlay (horizontal lines)
  for (let row = 0; row < H_D; row += 60) {
    children.push(HR(0, row, W_D, C.border));
  }

  // Nav
  children.push(
    R(0, 0, W_D, 56, C.surface, 0, { stroke: C.border, sw: 1 }),
    T('CONDUIT', 40, 18, 100, 22, { size: 16, fill: C.mint, weight: 800, ls: 3, font: 'SF Mono' }),
    T('Platform', 148, 21, 60, 16, { size: 10, fill: C.fg3, weight: 400 }),
    // Nav links
    T('Docs', 480, 20, 50, 18, { size: 12, fill: C.fg2, weight: 400 }),
    T('Pricing', 544, 20, 60, 18, { size: 12, fill: C.fg2, weight: 400 }),
    T('Blog', 616, 20, 40, 18, { size: 12, fill: C.fg2, weight: 400 }),
    T('Changelog', 668, 20, 80, 18, { size: 12, fill: C.fg2, weight: 400 }),
    // Right nav
    T('Sign in', 1260, 20, 60, 18, { size: 12, fill: C.fg2 }),
    R(1336, 14, 68, 28, C.mint, 6),
    T('Get access', 1338, 20, 64, 16, { size: 10, fill: C.bg, weight: 700, align: 'center' }),
  );

  // Hero section - left side
  // Tag pill
  children.push(...Tag(80, 100, '▶ AI AGENTS · NOW IN BETA', C.mint));

  // Large serif headline (editorial)
  children.push(
    T('Orchestrate', 80, 138, 740, 100, {
      size: 90, fill: C.fg, weight: 800, ls: -3, lh: 0.95,
      font: 'Georgia',
    }),
    T('Intelligence.', 80, 234, 740, 100, {
      size: 90, fill: C.mint, weight: 800, ls: -3, lh: 0.95,
      font: 'Georgia',
    }),
  );

  // Subheading
  children.push(
    T('Run fleets of AI agents in parallel. Define workflows, monitor runs in real-time, chain models like code.', 80, 360, 480, 60, {
      size: 16, fill: C.fg2, lh: 1.6, weight: 300,
    }),
  );

  // CTA buttons
  children.push(
    R(80, 444, 168, 44, C.mint, 8),
    T('Start building →', 82, 454, 164, 24, { size: 13, fill: C.bg, weight: 700, align: 'center' }),
    R(264, 444, 148, 44, C.surface3, 8, { stroke: C.border2, sw: 1 }),
    T('View docs ↗', 266, 454, 144, 24, { size: 13, fill: C.fg, weight: 600, align: 'center' }),
  );

  // Social proof
  children.push(
    T('Trusted by teams shipping AI at scale', 80, 516, 340, 16, { size: 10.5, fill: C.fg3, weight: 400 }),
    T('Runway  ·  Loom  ·  Vercel  ·  Perplexity', 80, 536, 340, 16, { size: 10, fill: C.fg2, weight: 600, ls: 0.5 }),
  );

  // Rotating badge (inspired by Antonio Scirica - darkmodedesign.com)
  // Circular text badge: "BOOK A DEMO · GET ACCESS · "
  children.push(
    E(640, 460, 100, 100, C.mintBrd),
    E(660, 480, 60, 60, C.mintDim),
    T('→', 672, 493, 36, 36, { size: 22, fill: C.mint, weight: 400, align: 'center', valign: 'middle' }),
    T('BOOK A DEMO · GET ACCESS ·', 610, 455, 160, 140, {
      size: 8, fill: C.mint, weight: 700, ls: 2, opacity: 0.7,
    }),
  );

  // Right side: Agent Orchestration diagram (hero visual)
  const diagramX = 780;

  // Diagram container
  children.push(
    R(diagramX, 70, 620, 780, C.surface, 16, { stroke: C.border, sw: 1 }),
    // diagram header bar
    R(diagramX, 70, 620, 36, C.surface3, 0),
    R(diagramX, 70, 620, 36, C.surface3, 16, { clip: true }),
    E(diagramX + 14, 82, 10, 10, C.coral),
    E(diagramX + 30, 82, 10, 10, C.amber),
    E(diagramX + 46, 82, 10, 10, C.termGreen),
    T('conduit — agent-run-7x9k2', diagramX + 66, 82, 300, 12, {
      size: 10, fill: C.fg3, font: 'SF Mono',
    }),
  );

  // Orchestrator node (top center of diagram)
  const orchX = diagramX + 210, orchY = 136;
  children.push(
    R(orchX, orchY, 200, 80, C.surface3, 12, { stroke: C.mint + '66', sw: 2 }),
    R(orchX + 1, orchY + 1, 198, 4, C.mint, 11),
    T('ORCHESTRATOR', orchX + 12, orchY + 14, 176, 14, { size: 8, fill: C.mint, weight: 700, ls: 2 }),
    T('Run Manager', orchX + 12, orchY + 30, 176, 18, { size: 14, fill: C.fg, weight: 700 }),
    ...StatusBadge(orchX + 12, orchY + 56, 'active', C.termGreen),
  );

  // Worker agent nodes (row 2)
  const workers = [
    { x: diagramX + 30, name: 'Researcher', type: 'llm-agent', status: 'running', color: C.violet },
    { x: diagramX + 215, name: 'Summarizer', type: 'llm-agent', status: 'running', color: C.violet },
    { x: diagramX + 400, name: 'Validator', type: 'logic-agent', status: 'waiting', color: C.amber },
  ];

  // Connector lines from orchestrator to workers
  workers.forEach(w => {
    children.push(...Connector(orchX + 100, orchY + 80, w.x + 80, orchY + 150));
  });

  workers.forEach(w => {
    children.push(...AgentNode(w.x, orchY + 150, w.name, w.type, w.status, w.color));
  });

  // Tool nodes (row 3)
  const tools = [
    { x: diagramX + 30, name: 'Web Search', type: 'tool', status: 'idle', color: C.fg3 },
    { x: diagramX + 215, name: 'Vector DB', type: 'tool', status: 'running', color: C.mint },
    { x: diagramX + 400, name: 'Output Sink', type: 'tool', status: 'idle', color: C.fg3 },
  ];

  workers.forEach((w, i) => {
    children.push(...Connector(w.x + 80, orchY + 222, tools[i].x + 80, orchY + 290));
  });

  tools.forEach(t => {
    children.push(...AgentNode(t.x, orchY + 290, t.name, t.type, t.status, t.color));
  });

  // Terminal log section in diagram
  const logY = orchY + 400;
  children.push(
    R(diagramX + 10, logY, 600, 130, C.bg, 8),
    ...LogLine(diagramX + 20, logY + 10, 580, '09:42:01', 'INFO ', 'run#7x9k2 started — 3 workers', C.termGreen),
    ...LogLine(diagramX + 20, logY + 28, 580, '09:42:02', 'INFO ', 'researcher: query dispatched → tavily', C.termGreen),
    ...LogLine(diagramX + 20, logY + 46, 580, '09:42:04', 'INFO ', 'summarizer: awaiting input stream', C.fg3),
    ...LogLine(diagramX + 20, logY + 64, 580, '09:42:05', 'WARN ', 'validator: upstream rate limit hit', C.amber),
    ...LogLine(diagramX + 20, logY + 82, 580, '09:42:06', 'INFO ', 'retry queued — backoff 1200ms', C.fg3),
    ...LogLine(diagramX + 20, logY + 100, 580, '09:42:07', 'INFO ', 'researcher: 7 results fetched ✓', C.termGreen),
  );

  // Bottom bar in diagram
  children.push(
    R(diagramX, 820, 620, 30, C.surface3, 0),
    ...ProgressBar(diagramX + 20, 832, 400, 0.62, C.mint),
    T('62%  ·  Step 5/8  ·  ETA ~23s', diagramX + 440, 825, 160, 16, {
      size: 9.5, fill: C.fg3, font: 'SF Mono',
    }),
  );

  return F(0, 0, W_D, H_D, C.bg, {
    clip: true,
    ch: children,
    name: 'Landing — CONDUIT',
  });
}

// ── Screen 2: AGENT BUILDER (Desktop 1440×900) ────────────────────────────────
function buildScreenAgentBuilder() {
  const children = [];
  children.push(R(0, 0, W_D, H_D, C.bg));

  // ── Sidebar ──
  const sideW = 224;
  children.push(
    R(0, 0, sideW, H_D, C.surface, 0, { stroke: C.border, sw: 1 }),
    T('CONDUIT', 20, 22, 100, 20, { size: 13, fill: C.mint, weight: 800, ls: 3, font: 'SF Mono' }),
    HR(20, 52, sideW - 40, C.border),
    ...SideNavItem(12, 64, 'Dashboard', false, '◈'),
    ...SideNavItem(12, 104, 'Agent Builder', true, '⬡'),
    ...SideNavItem(12, 144, 'Live Runs', false, '▷'),
    ...SideNavItem(12, 184, 'Logs', false, '≡'),
    ...SideNavItem(12, 224, 'Models', false, '◉'),
    HR(20, 264, sideW - 40, C.border),
    ...SideNavItem(12, 276, 'Templates', false, '□'),
    ...SideNavItem(12, 316, 'API Keys', false, '⌘'),
    ...SideNavItem(12, 356, 'Settings', false, '⚙'),

    // Bottom: credits
    R(12, H_D - 80, sideW - 24, 60, C.surface2, 10, { stroke: C.border, sw: 1 }),
    T('FREE PLAN', 24, H_D - 68, 100, 12, { size: 7.5, fill: C.fg3, weight: 700, ls: 1.5 }),
    T('2 / 5 agents', 24, H_D - 54, 100, 14, { size: 11, fill: C.fg, weight: 600 }),
    ...ProgressBar(24, H_D - 36, sideW - 48, 0.4, C.mint),
  );

  // ── Main canvas area (center) ──
  const canvasX = sideW;
  const canvasW = 820;

  children.push(
    // Toolbar
    R(canvasX, 0, canvasW, 48, C.surface, 0, { stroke: C.border, sw: 1 }),
    T('research-pipeline.yaml', canvasX + 16, 15, 200, 18, { size: 12, fill: C.fg, weight: 600, font: 'SF Mono' }),
    T('◐ Unsaved', canvasX + 228, 17, 80, 14, { size: 10, fill: C.amber, weight: 500 }),
    // Toolbar actions
    R(canvasX + canvasW - 160, 10, 68, 28, C.surface3, 6, { stroke: C.border2, sw: 1 }),
    T('Validate', canvasX + canvasW - 158, 18, 64, 14, { size: 11, fill: C.fg2, align: 'center' }),
    R(canvasX + canvasW - 84, 10, 68, 28, C.mint, 6),
    T('▶ Run', canvasX + canvasW - 82, 18, 64, 14, { size: 11, fill: C.bg, weight: 700, align: 'center' }),
  );

  // Canvas background
  children.push(R(canvasX, 48, canvasW, H_D - 48, C.bg));

  // Dot grid
  for (let gx = canvasX + 20; gx < canvasX + canvasW; gx += 40) {
    for (let gy = 68; gy < H_D; gy += 40) {
      children.push(E(gx - 1, gy - 1, 2, 2, C.border));
    }
  }

  // YAML editor panel (left half of canvas)
  const editorX = canvasX + 16;
  children.push(
    R(editorX, 64, 400, 780, C.surface, 12, { stroke: C.border, sw: 1 }),
    // Editor header
    R(editorX, 64, 400, 36, C.surface3, 0),
    R(editorX, 64, 400, 36, C.surface3, 12, { clip: true }),
    T('YAML CONFIG', editorX + 14, 77, 140, 14, { size: 9, fill: C.fg3, weight: 700, ls: 2 }),
    T('research-pipeline.yaml', editorX + 200, 77, 180, 14, { size: 9, fill: C.mint, font: 'SF Mono' }),

    // Code content (monospaced YAML)
    T('name: research-pipeline', editorX + 14, 112, 380, 14, { size: 10, fill: C.fg2, font: 'SF Mono' }),
    T('version: "1.0"', editorX + 14, 130, 380, 14, { size: 10, fill: C.fg2, font: 'SF Mono' }),
    T('', editorX + 14, 148, 380, 14, { size: 10, fill: C.fg2, font: 'SF Mono' }),
    T('agents:', editorX + 14, 166, 380, 14, { size: 10, fill: C.mint, font: 'SF Mono', weight: 600 }),
    T('  - id: researcher', editorX + 14, 184, 380, 14, { size: 10, fill: C.fg, font: 'SF Mono' }),
    T('    model: claude-3-7-sonnet', editorX + 14, 202, 380, 14, { size: 10, fill: C.violet, font: 'SF Mono' }),
    T('    tools: [web_search, scrape]', editorX + 14, 220, 380, 14, { size: 10, fill: C.fg2, font: 'SF Mono' }),
    T('    max_steps: 12', editorX + 14, 238, 380, 14, { size: 10, fill: C.fg2, font: 'SF Mono' }),
    T('', editorX + 14, 256, 380, 14, { size: 10, fill: C.fg2, font: 'SF Mono' }),
    T('  - id: summarizer', editorX + 14, 274, 380, 14, { size: 10, fill: C.fg, font: 'SF Mono' }),
    T('    model: gpt-4o', editorX + 14, 292, 380, 14, { size: 10, fill: C.violet, font: 'SF Mono' }),
    T('    depends_on: [researcher]', editorX + 14, 310, 380, 14, { size: 10, fill: C.amber, font: 'SF Mono' }),
    T('    output: markdown_report', editorX + 14, 328, 380, 14, { size: 10, fill: C.fg2, font: 'SF Mono' }),
    T('', editorX + 14, 346, 380, 14, { size: 10, fill: C.fg2, font: 'SF Mono' }),
    T('  - id: validator', editorX + 14, 364, 380, 14, { size: 10, fill: C.fg, font: 'SF Mono' }),
    T('    type: logic', editorX + 14, 382, 380, 14, { size: 10, fill: C.fg2, font: 'SF Mono' }),
    T('    rules_file: verify.json', editorX + 14, 400, 380, 14, { size: 10, fill: C.fg2, font: 'SF Mono' }),
    T('    depends_on: [summarizer]', editorX + 14, 418, 380, 14, { size: 10, fill: C.amber, font: 'SF Mono' }),
    T('', editorX + 14, 436, 380, 14, { size: 10, fill: C.fg2, font: 'SF Mono' }),
    T('triggers:', editorX + 14, 454, 380, 14, { size: 10, fill: C.mint, font: 'SF Mono', weight: 600 }),
    T('  webhook: /api/run/start', editorX + 14, 472, 380, 14, { size: 10, fill: C.fg2, font: 'SF Mono' }),
    T('  schedule: "0 */6 * * *"', editorX + 14, 490, 380, 14, { size: 10, fill: C.fg2, font: 'SF Mono' }),
  );

  // Graph preview panel (right half)
  const graphX = canvasX + 428;
  children.push(
    R(graphX, 64, 386, 780, C.surface, 12, { stroke: C.border, sw: 1 }),
    R(graphX, 64, 386, 36, C.surface3, 0),
    R(graphX, 64, 386, 36, C.surface3, 12, { clip: true }),
    T('GRAPH PREVIEW', graphX + 14, 77, 160, 14, { size: 9, fill: C.fg3, weight: 700, ls: 2 }),
    T('3 nodes · 2 edges', graphX + 200, 77, 160, 14, { size: 9, fill: C.fg3 }),
  );

  // Node graph visualization
  const gNodes = [
    { x: graphX + 113, y: 145, name: 'researcher', type: 'LLM-AGENT', color: C.violet },
    { x: graphX + 113, y: 330, name: 'summarizer', type: 'LLM-AGENT', color: C.violet },
    { x: graphX + 113, y: 520, name: 'validator', type: 'LOGIC', color: C.amber },
  ];

  // Edges
  children.push(
    ...Connector(graphX + 193, 217, graphX + 193, 330),
    ...Connector(graphX + 193, 402, graphX + 193, 520),
  );

  gNodes.forEach(n => {
    children.push(...AgentNode(n.x, n.y, n.name, n.type, 'ready', n.color));
  });

  // ── Right panel (properties) ──
  const rightX = canvasX + canvasW;
  const rightW = W_D - rightX;

  children.push(
    R(rightX, 0, rightW, H_D, C.surface, 0, { stroke: C.border, sw: 1 }),
    T('PROPERTIES', rightX + 16, 20, rightW - 32, 14, { size: 9, fill: C.fg3, weight: 700, ls: 2 }),
    HR(rightX, 44, rightW, C.border),
  );

  // Selected node properties
  children.push(
    T('researcher', rightX + 16, 56, rightW - 32, 20, { size: 16, fill: C.mint, weight: 700 }),
    T('LLM Agent', rightX + 16, 80, rightW - 32, 14, { size: 10, fill: C.fg3 }),
    HR(rightX + 16, 100, rightW - 32, C.border),

    T('MODEL', rightX + 16, 114, 80, 12, { size: 8.5, fill: C.fg3, weight: 700, ls: 1.5 }),
    R(rightX + 16, 128, rightW - 32, 32, C.surface2, 6, { stroke: C.border, sw: 1 }),
    T('claude-3-7-sonnet', rightX + 24, 136, rightW - 48, 16, { size: 11, fill: C.fg, font: 'SF Mono' }),

    T('MAX STEPS', rightX + 16, 174, 80, 12, { size: 8.5, fill: C.fg3, weight: 700, ls: 1.5 }),
    R(rightX + 16, 188, rightW - 32, 32, C.surface2, 6, { stroke: C.border, sw: 1 }),
    T('12', rightX + 24, 196, rightW - 48, 16, { size: 11, fill: C.fg }),

    T('TOOLS', rightX + 16, 234, 80, 12, { size: 8.5, fill: C.fg3, weight: 700, ls: 1.5 }),
    ...Tag(rightX + 16, 250, 'web_search', C.mint),
    ...Tag(rightX + 16, 276, 'scrape', C.violet),
    ...Tag(rightX + 16, 302, '+ Add tool', C.fg3),

    HR(rightX + 16, 328, rightW - 32, C.border),

    T('SYSTEM PROMPT', rightX + 16, 342, rightW - 32, 12, { size: 8.5, fill: C.fg3, weight: 700, ls: 1.5 }),
    R(rightX + 16, 358, rightW - 32, 80, C.surface2, 6, { stroke: C.border, sw: 1 }),
    T('You are a research agent. Search the web for...', rightX + 24, 366, rightW - 48, 64, {
      size: 10, fill: C.fg2, lh: 1.5,
    }),
  );

  return F(0, 0, W_D, H_D, C.bg, {
    clip: true, ch: children, name: 'Agent Builder — CONDUIT',
  });
}

// ── Screen 3: LIVE RUN MONITOR (Desktop 1440×900) ────────────────────────────
function buildScreenLiveRun() {
  const children = [];
  children.push(R(0, 0, W_D, H_D, C.bg));

  // Sidebar (same as builder)
  const sideW = 224;
  children.push(
    R(0, 0, sideW, H_D, C.surface, 0, { stroke: C.border, sw: 1 }),
    T('CONDUIT', 20, 22, 100, 20, { size: 13, fill: C.mint, weight: 800, ls: 3, font: 'SF Mono' }),
    HR(20, 52, sideW - 40, C.border),
    ...SideNavItem(12, 64, 'Dashboard', false, '◈'),
    ...SideNavItem(12, 104, 'Agent Builder', false, '⬡'),
    ...SideNavItem(12, 144, 'Live Runs', true, '▷'),
    ...SideNavItem(12, 184, 'Logs', false, '≡'),
    ...SideNavItem(12, 224, 'Models', false, '◉'),
  );

  // Main area
  const mainX = sideW + 24;
  const mainW = W_D - sideW - 48;

  // Header
  children.push(
    T('Live Runs', mainX, 28, 200, 28, { size: 22, fill: C.fg, weight: 700 }),
    ...StatusBadge(mainX + 220, 34, '3 active', C.termGreen),
    R(mainX + mainW - 100, 22, 100, 32, C.mint, 6),
    T('New Run ＋', mainX + mainW - 98, 30, 96, 16, { size: 11, fill: C.bg, weight: 700, align: 'center' }),
  );

  // ── Bento grid of metric cards ──
  // Inspired by bento grid trend (godly.website + awwwards research)
  children.push(
    ...MetricCard(mainX, 72, 180, 90, 'Total Runs Today', '247', '↑ 18 vs yesterday', C.mint),
    ...MetricCard(mainX + 196, 72, 180, 90, 'Avg Duration', '1m 42s', 'across all models', C.violet),
    ...MetricCard(mainX + 392, 72, 180, 90, 'Success Rate', '98.3%', '↓ 0.2% from last 7d', C.termGreen),
    ...MetricCard(mainX + 588, 72, 180, 90, 'Token Cost', '$4.21', 'today · est $29/mo', C.amber),
  );

  // ── Active runs table ──
  const tableY = 184;
  children.push(
    T('ACTIVE RUNS', mainX, tableY, 200, 14, { size: 9, fill: C.fg3, weight: 700, ls: 2 }),
    HR(mainX, tableY + 20, mainW, C.border),
    // Header row
    T('RUN ID', mainX, tableY + 28, 140, 14, { size: 8.5, fill: C.fg3, weight: 700, ls: 1.5 }),
    T('PIPELINE', mainX + 148, tableY + 28, 160, 14, { size: 8.5, fill: C.fg3, weight: 700, ls: 1.5 }),
    T('STATUS', mainX + 316, tableY + 28, 80, 14, { size: 8.5, fill: C.fg3, weight: 700, ls: 1.5 }),
    T('PROGRESS', mainX + 404, tableY + 28, 120, 14, { size: 8.5, fill: C.fg3, weight: 700, ls: 1.5 }),
    T('DURATION', mainX + 532, tableY + 28, 80, 14, { size: 8.5, fill: C.fg3, weight: 700, ls: 1.5 }),
    T('COST', mainX + 620, tableY + 28, 80, 14, { size: 8.5, fill: C.fg3, weight: 700, ls: 1.5 }),
    T('ACTIONS', mainX + mainW - 80, tableY + 28, 80, 14, { size: 8.5, fill: C.fg3, weight: 700, ls: 1.5 }),
    HR(mainX, tableY + 48, mainW, C.border),
  );

  // Run rows
  const runs = [
    { id: 'run#7x9k2', pipeline: 'research-pipeline', status: 'running', pct: 0.62, dur: '1m 04s', cost: '$0.18', color: C.termGreen },
    { id: 'run#7x9k1', pipeline: 'content-gen', status: 'running', pct: 0.88, dur: '3m 22s', cost: '$0.41', color: C.termGreen },
    { id: 'run#7x9k0', pipeline: 'data-extract', status: 'running', pct: 0.35, dur: '0m 18s', cost: '$0.07', color: C.termGreen },
    { id: 'run#7x9j9', pipeline: 'research-pipeline', status: 'failed', pct: 1.0, dur: '5m 01s', cost: '$0.63', color: C.coral },
    { id: 'run#7x9j8', pipeline: 'report-draft', status: 'done', pct: 1.0, dur: '2m 44s', cost: '$0.29', color: C.fg3 },
  ];

  runs.forEach((run, i) => {
    const ry = tableY + 58 + i * 44;
    const rowBg = i === 0 ? C.mintDim : i % 2 === 0 ? C.surface : 'none';
    children.push(
      R(mainX - 8, ry - 4, mainW + 16, 40, rowBg, 6),
      T(run.id, mainX, ry + 10, 140, 16, { size: 11, fill: C.fg, font: 'SF Mono' }),
      T(run.pipeline, mainX + 148, ry + 10, 160, 16, { size: 11, fill: C.fg2 }),
      ...StatusBadge(mainX + 316, ry + 10, run.status, run.color),
      ...ProgressBar(mainX + 404, ry + 16, 100, run.pct, run.color),
      T(`${Math.round(run.pct * 100)}%`, mainX + 510, ry + 10, 30, 16, { size: 10, fill: run.color, font: 'SF Mono' }),
      T(run.dur, mainX + 532, ry + 10, 80, 16, { size: 11, fill: C.fg2, font: 'SF Mono' }),
      T(run.cost, mainX + 620, ry + 10, 80, 16, { size: 11, fill: C.fg2, font: 'SF Mono' }),
      R(mainX + mainW - 80, ry + 6, 60, 26, C.surface3, 6, { stroke: C.border, sw: 1 }),
      T('Logs ↗', mainX + mainW - 78, ry + 12, 56, 14, { size: 10, fill: C.fg3, align: 'center' }),
    );
  });

  // ── Live log stream (bottom half) ──
  const logY = tableY + 58 + 5 * 44 + 16;
  children.push(
    T('LIVE LOG STREAM', mainX, logY, 200, 14, { size: 9, fill: C.termGreen, weight: 700, ls: 2 }),
    E(mainX + 175, logY + 3, 8, 8, C.termGreen),  // live indicator dot
    HR(mainX, logY + 20, mainW, C.border),
    R(mainX, logY + 24, mainW, H_D - logY - 40, C.surface, 8, { stroke: C.border, sw: 1 }),
  );

  const logLines = [
    { time: '09:42:07', level: 'INFO ', msg: 'run#7x9k2 · researcher: fetched 7 results from tavily', col: C.termGreen },
    { time: '09:42:08', level: 'INFO ', msg: 'run#7x9k2 · summarizer: processing chunk 1/3', col: C.termGreen },
    { time: '09:42:09', level: 'INFO ', msg: 'run#7x9k1 · content-gen: paragraph 4 written (1,240 tokens)', col: C.termGreen },
    { time: '09:42:10', level: 'WARN ', msg: 'run#7x9k2 · validator: schema mismatch on field "date_range"', col: C.amber },
    { time: '09:42:11', level: 'INFO ', msg: 'run#7x9k0 · data-extract: 18 rows extracted from PDF page 3', col: C.termGreen },
    { time: '09:42:12', level: 'INFO ', msg: 'run#7x9k2 · validator: auto-coerced date_range → ISO 8601 ✓', col: C.termGreen },
  ];

  logLines.forEach((line, i) => {
    children.push(...LogLine(mainX + 12, logY + 36 + i * 18, mainW - 24, line.time, line.level, line.msg, line.col));
  });

  return F(0, 0, W_D, H_D, C.bg, {
    clip: true, ch: children, name: 'Live Run Monitor — CONDUIT',
  });
}

// ── Screen 4: PRICING PAGE (Desktop 1440×900) ─────────────────────────────────
function buildScreenPricing() {
  const children = [];
  children.push(R(0, 0, W_D, H_D, C.bg));

  // Subtle radial glow behind pricing cards
  children.push(E(W_D / 2 - 150, 200, 700, 400, C.mintDim, { opacity: 0.4 }));

  // Nav
  children.push(
    R(0, 0, W_D, 56, C.surface, 0, { stroke: C.border, sw: 1 }),
    T('CONDUIT', 40, 18, 100, 22, { size: 16, fill: C.mint, weight: 800, ls: 3, font: 'SF Mono' }),
    T('Sign in', 1260, 20, 60, 18, { size: 12, fill: C.fg2 }),
    R(1336, 14, 68, 28, C.mint, 6),
    T('Get access', 1338, 20, 64, 16, { size: 10, fill: C.bg, weight: 700, align: 'center' }),
  );

  // Header
  children.push(
    T('Simple pricing.', W_D / 2 - 280, 90, 560, 64, {
      size: 58, fill: C.fg, weight: 800, ls: -2, align: 'center', font: 'Georgia',
    }),
    T('No per-seat. No token markups. Just runs.', W_D / 2 - 260, 162, 520, 24, {
      size: 18, fill: C.fg2, align: 'center', weight: 300,
    }),
    // Monthly / Annual toggle
    R(W_D / 2 - 84, 202, 168, 32, C.surface2, 16, { stroke: C.border, sw: 1 }),
    R(W_D / 2 - 82, 204, 80, 28, C.surface3, 14),
    T('Monthly', W_D / 2 - 82, 210, 80, 16, { size: 11, fill: C.fg, weight: 600, align: 'center' }),
    T('Annual  −20%', W_D / 2 + 2, 210, 80, 16, { size: 11, fill: C.fg3, align: 'center' }),
  );

  // 3 pricing cards
  const cards = [
    {
      x: W_D / 2 - 540, title: 'Starter', price: '$0', period: '/ month',
      desc: 'For solo builders exploring AI orchestration.',
      features: ['5 agent runs / day', '2 concurrent agents', '3 pipelines', 'Community templates', '100K tokens / run'],
      cta: 'Start free', ctaBg: C.surface3, ctaFg: C.fg, highlight: false,
    },
    {
      x: W_D / 2 - 180, title: 'Pro', price: '$49', period: '/ month',
      desc: 'For teams shipping AI products.',
      features: ['Unlimited runs', '20 concurrent agents', 'Unlimited pipelines', 'All models', 'Priority queue', 'Webhook triggers', 'Run history 90d'],
      cta: 'Start Pro', ctaBg: C.mint, ctaFg: C.bg, highlight: true,
    },
    {
      x: W_D / 2 + 180, title: 'Enterprise', price: 'Custom', period: '',
      desc: 'Compliance, SSO, dedicated infra.',
      features: ['Unlimited everything', 'Dedicated workers', 'SOC2 + SSO', 'On-prem option', 'SLA guarantee', 'Custom model routing', 'Premium support'],
      cta: 'Talk to sales', ctaBg: C.surface3, ctaFg: C.fg, highlight: false,
    },
  ];

  cards.forEach(card => {
    const cw = 340, ch = 520;
    const cy = 254;
    children.push(
      R(card.x, cy, cw, ch, C.surface, 16, { stroke: card.highlight ? C.mint + '88' : C.border, sw: card.highlight ? 2 : 1 }),
    );
    if (card.highlight) {
      children.push(
        R(card.x + 1, cy + 1, cw - 2, 4, C.mint, 15),
        ...Tag(card.x + cw - 110, cy + 16, 'MOST POPULAR', C.mint),
      );
    }
    children.push(
      T(card.title.toUpperCase(), card.x + 24, cy + 24, 200, 16, { size: 9, fill: card.highlight ? C.mint : C.fg3, weight: 700, ls: 2 }),
      T(card.price, card.x + 24, cy + 46, 200, 52, { size: card.price === 'Custom' ? 36 : 48, fill: C.fg, weight: 800 }),
      T(card.period, card.x + 24 + (card.price.length * 26), cy + 82, 80, 18, { size: 13, fill: C.fg3 }),
      T(card.desc, card.x + 24, cy + 110, cw - 48, 36, { size: 12, fill: C.fg2, lh: 1.5 }),
      HR(card.x + 24, cy + 152, cw - 48, C.border),
    );
    card.features.forEach((feat, fi) => {
      children.push(
        T('✓', card.x + 24, cy + 164 + fi * 24, 16, 16, { size: 11, fill: card.highlight ? C.mint : C.termGreen, weight: 700 }),
        T(feat, card.x + 44, cy + 164 + fi * 24, cw - 68, 16, { size: 12, fill: C.fg2 }),
      );
    });
    const btnY = cy + ch - 60;
    children.push(
      R(card.x + 24, btnY, cw - 48, 40, card.ctaBg, 8, { stroke: card.highlight ? 'none' : C.border, sw: 1 }),
      T(card.cta, card.x + 24, btnY + 10, cw - 48, 20, { size: 13, fill: card.ctaFg, weight: 700, align: 'center' }),
    );
  });

  // Bottom note
  children.push(
    T('All plans include 99.9% uptime SLA · Your API keys, your models · No data training on your runs', W_D / 2 - 360, 804, 720, 20, {
      size: 11, fill: C.fg3, align: 'center',
    }),
  );

  return F(0, 0, W_D, H_D, C.bg, {
    clip: true, ch: children, name: 'Pricing — CONDUIT',
  });
}

// ── Screen 5: MOBILE DASHBOARD (390×844) ──────────────────────────────────────
function buildScreenMobileDash() {
  const children = [];
  children.push(R(0, 0, W_M, H_M, C.bg));

  // Status bar
  children.push(
    R(0, 0, W_M, 44, C.bg),
    T('9:41', 16, 14, 60, 18, { size: 15, fill: C.fg, weight: 700 }),
    T('▶ ▶ 100%', W_M - 80, 14, 70, 18, { size: 11, fill: C.fg, align: 'right' }),
  );

  // Nav bar
  children.push(
    R(0, 44, W_M, 52, C.surface, 0, { stroke: C.border, sw: 1 }),
    T('CONDUIT', 20, 60, 100, 20, { size: 14, fill: C.mint, weight: 800, ls: 3, font: 'SF Mono' }),
    R(W_M - 52, 56, 32, 32, C.surface3, 8, { stroke: C.border, sw: 1 }),
    T('⚙', W_M - 52, 62, 32, 20, { size: 16, fill: C.fg2, align: 'center' }),
  );

  // Greeting
  children.push(
    T('Good morning, Viktor', 20, 114, W_M - 40, 24, { size: 18, fill: C.fg, weight: 700 }),
    T('3 runs active · 2 pipelines pending', 20, 140, W_M - 40, 18, { size: 12, fill: C.fg2 }),
  );

  // Quick stats strip
  const statW = (W_M - 40 - 16) / 3;
  [
    { label: 'Active', val: '3', color: C.termGreen },
    { label: 'Today', val: '47', color: C.mint },
    { label: 'Cost', val: '$1.2', color: C.amber },
  ].forEach((s, i) => {
    const sx = 20 + i * (statW + 8);
    children.push(
      R(sx, 174, statW, 68, C.surface2, 10, { stroke: C.border, sw: 1 }),
      T(s.val, sx + 10, sx + 186, 80, 28, { size: 24, fill: s.color, weight: 700 }),
      T(s.val, sx + 10, 190, 80, 28, { size: 24, fill: s.color, weight: 700 }),
      T(s.label, sx + 10, 220, 80, 14, { size: 9, fill: C.fg3, weight: 700, ls: 1 }),
    );
  });

  // Active run cards
  children.push(
    T('ACTIVE RUNS', 20, 258, 160, 14, { size: 9, fill: C.fg3, weight: 700, ls: 2 }),
    ...StatusBadge(184, 260, '3 live', C.termGreen),
  );

  const mRuns = [
    { id: 'run#7x9k2', pipe: 'research-pipeline', pct: 0.62, dur: '1m 04s', color: C.termGreen },
    { id: 'run#7x9k1', pipe: 'content-gen', pct: 0.88, dur: '3m 22s', color: C.termGreen },
    { id: 'run#7x9k0', pipe: 'data-extract', pct: 0.35, dur: '0m 18s', color: C.termGreen },
  ];

  mRuns.forEach((r, i) => {
    const ry = 278 + i * 100;
    children.push(
      R(20, ry, W_M - 40, 86, C.surface, 12, { stroke: C.border, sw: 1 }),
      R(20, ry, 3, 86, r.color, 12),
      T(r.id, 32, ry + 14, 140, 16, { size: 12, fill: C.fg, font: 'SF Mono', weight: 600 }),
      T(r.pipe, 32, ry + 34, W_M - 80, 16, { size: 11, fill: C.fg2 }),
      T(r.dur, W_M - 80, ry + 14, 50, 16, { size: 11, fill: C.fg3, font: 'SF Mono', align: 'right' }),
      ...ProgressBar(32, ry + 58, W_M - 72, r.pct, r.color),
      T(`${Math.round(r.pct * 100)}%`, W_M - 64, ry + 52, 36, 14, { size: 10, fill: r.color, font: 'SF Mono', align: 'right' }),
    );
  });

  // Bottom nav
  const navY = H_M - 72;
  children.push(
    R(0, navY, W_M, 72, C.surface, 0, { stroke: C.border, sw: 1 }),
    // Nav items
    ...['◈', '⬡', '▷', '≡'].map((icon, i) => {
      const nx = 20 + i * 90;
      const active = i === 2;
      return [
        ...(active ? [R(nx + 10, navY + 6, 48, 3, C.mint, 2)] : []),
        T(icon, nx, navY + 16, 68, 24, { size: 18, fill: active ? C.mint : C.fg3, align: 'center' }),
        T(['Home', 'Build', 'Runs', 'Logs'][i], nx, navY + 42, 68, 16, { size: 9, fill: active ? C.mint : C.fg3, align: 'center', weight: active ? 700 : 400 }),
      ];
    }).flat(),
  );

  return F(0, 0, W_M, H_M, C.bg, {
    clip: true, ch: children, name: 'Mobile Dashboard — CONDUIT',
  });
}

// ── Screen 6: MOBILE AGENT FEED (390×844) ─────────────────────────────────────
function buildScreenMobileAgentFeed() {
  const children = [];
  children.push(R(0, 0, W_M, H_M, C.bg));

  // Status bar
  children.push(R(0, 0, W_M, 44, C.bg), T('9:41', 16, 14, 60, 18, { size: 15, fill: C.fg, weight: 700 }));

  // Header
  children.push(
    R(0, 44, W_M, 52, C.surface, 0, { stroke: C.border, sw: 1 }),
    T('← run#7x9k2', 20, 60, 160, 18, { size: 14, fill: C.fg, weight: 600, font: 'SF Mono' }),
    ...StatusBadge(W_M - 95, 64, 'running', C.termGreen),
  );

  // Run summary strip
  children.push(
    R(0, 96, W_M, 80, C.surface2, 0),
    T('research-pipeline', 20, 106, W_M - 40, 18, { size: 15, fill: C.mint, weight: 700 }),
    T('Started 1m 04s ago · Step 5/8', 20, 128, W_M - 40, 16, { size: 11, fill: C.fg2 }),
    ...ProgressBar(20, 152, W_M - 40, 0.62, C.mint),
    T('62%', W_M - 52, 146, 36, 14, { size: 10, fill: C.mint, font: 'SF Mono', align: 'right' }),
  );

  // Agent nodes list
  children.push(T('AGENTS', 20, 190, 80, 14, { size: 9, fill: C.fg3, weight: 700, ls: 2 }));

  const agents = [
    { name: 'researcher', model: 'claude-3-7-sonnet', status: 'running', steps: '7/12', color: C.violet, tokens: '4,821' },
    { name: 'summarizer', model: 'gpt-4o', status: 'waiting', steps: '0/8', color: C.fg3, tokens: '—' },
    { name: 'validator', model: 'logic', status: 'waiting', steps: '0/4', color: C.fg3, tokens: '—' },
  ];

  agents.forEach((ag, i) => {
    const ay = 210 + i * 106;
    const sc = ag.status === 'running' ? C.termGreen : C.fg3;
    children.push(
      R(20, ay, W_M - 40, 92, C.surface, 12, { stroke: ag.status === 'running' ? C.mint + '44' : C.border, sw: 1 }),
      R(20, ay, 3, 92, ag.color, 12),
      T(ag.name, 32, ay + 12, 180, 18, { size: 15, fill: ag.status === 'running' ? C.mint : C.fg, weight: 700, font: 'SF Mono' }),
      ...StatusBadge(32, ay + 38, ag.status, sc),
      T(`Steps ${ag.steps}`, 32, ay + 60, 100, 14, { size: 10, fill: C.fg3 }),
      T(ag.model, W_M - 120, ay + 12, 100, 14, { size: 10, fill: C.fg3, align: 'right', font: 'SF Mono' }),
      T(`${ag.tokens} tok`, W_M - 120, ay + 60, 100, 14, { size: 10, fill: ag.status === 'running' ? C.violet : C.fg3, align: 'right', font: 'SF Mono' }),
    );
  });

  // Live log (bottom section)
  const logStartY = 210 + 3 * 106 + 16;
  children.push(
    T('LIVE LOG', 20, logStartY, 80, 14, { size: 9, fill: C.termGreen, weight: 700, ls: 2 }),
    E(76, logStartY + 3, 7, 7, C.termGreen),
    R(20, logStartY + 18, W_M - 40, H_M - logStartY - 90, C.surface, 10, { stroke: C.border, sw: 1 }),
  );

  const mobileLogs = [
    { time: '09:42:07', msg: 'fetched 7 results from tavily ✓', col: C.termGreen },
    { time: '09:42:05', msg: 'web_search: "AI agent benchmarks"', col: C.fg2 },
    { time: '09:42:02', msg: 'researcher: query dispatched', col: C.fg2 },
    { time: '09:42:00', msg: 'run started — 3 workers initialized', col: C.mint },
  ];

  mobileLogs.forEach((line, i) => {
    children.push(
      T(line.time, 30, logStartY + 28 + i * 22, 55, 14, { size: 9.5, fill: C.fg3, font: 'SF Mono' }),
      T(line.msg, 90, logStartY + 28 + i * 22, W_M - 110, 14, { size: 9.5, fill: line.col, font: 'SF Mono' }),
    );
  });

  // Bottom nav
  const navY = H_M - 72;
  children.push(
    R(0, navY, W_M, 72, C.surface, 0, { stroke: C.border, sw: 1 }),
    ...['◈', '⬡', '▷', '≡'].map((icon, i) => {
      const nx = 20 + i * 90;
      const active = i === 2;
      return [
        T(icon, nx, navY + 16, 68, 24, { size: 18, fill: active ? C.mint : C.fg3, align: 'center' }),
        T(['Home', 'Build', 'Runs', 'Logs'][i], nx, navY + 42, 68, 16, { size: 9, fill: active ? C.mint : C.fg3, align: 'center', weight: active ? 700 : 400 }),
      ];
    }).flat(),
  );

  return F(0, 0, W_M, H_M, C.bg, {
    clip: true, ch: children, name: 'Mobile Agent Feed — CONDUIT',
  });
}

// ── Assemble .pen file ────────────────────────────────────────────────────────
function buildPen() {
  const screens = [
    buildScreenLanding(),
    buildScreenAgentBuilder(),
    buildScreenLiveRun(),
    buildScreenPricing(),
    buildScreenMobileDash(),
    buildScreenMobileAgentFeed(),
  ];

  return {
    id: 'conduit-design',
    version: '2.8',
    name: 'CONDUIT — AI Agent Orchestration',
    width: W_D,
    height: H_D,
    fill: C.bg,
    children: screens,
  };
}

const pen = buildPen();
const outPath = path.join(__dirname, 'conduit.pen');
fs.writeFileSync(outPath, JSON.stringify(pen, null, 2));
console.log(`✓ conduit.pen written (${(fs.statSync(outPath).size / 1024).toFixed(0)} KB, ${pen.children.length} screens)`);
