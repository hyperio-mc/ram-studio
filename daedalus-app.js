'use strict';
// daedalus-app.js
// DAEDALUS — Visual AI Pipeline Architect
// Design Heartbeat — March 19, 2026
//
// Inspired by:
//   1. Superset.sh (darkmodedesign.com) — dark terminal AI agent orchestration,
//      "The Code Editor for AI Agents", near-black with monospace agent streams
//   2. Runlayer "Enterprise MCPs, Skills & Agents" (land-book.com) — clean
//      enterprise SaaS landing, agent/pipeline visual metaphors
//   3. Linear (darkmodedesign.com) — sidebar + content pane dark UI, precision
//      spacing, micro-typography
//
// Challenge: Design a dark-mode visual AI pipeline builder where nodes represent
// AI agents connected by glowing dataflow edges — like Figma meets n8n meets
// Linear. Deep-space backgrounds with neon connection lines, a bento grid
// pipeline gallery, and live execution monitoring.
//
// Screens (5 total):
//   1. Dashboard — pipeline gallery bento grid, usage stats, recent activity
//   2. Pipeline Canvas — node graph with AI agent nodes + glowing edges
//   3. Node Config — right-panel agent config drawer with model picker
//   4. Run Monitor — live execution log streams + progress tracking
//   5. Team Hub — shared workspaces, team members, pipeline collections

const fs    = require('fs');
const path  = require('path');
const https = require('https');

// ── Config ─────────────────────────────────────────────────────────────────────
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'community-config.json'), 'utf8'));
const GITHUB_TOKEN = config.GITHUB_TOKEN || '';
const GITHUB_REPO  = config.GITHUB_REPO  || '';
const SLUG         = 'daedalus-pipeline-builder';
const APP_NAME     = 'DAEDALUS';
const TAGLINE      = 'Visual AI pipeline architect for orchestrating multi-agent workflows.';
const DATE_STR     = 'March 19, 2026';

const PROMPT = `Design a dark-mode visual AI pipeline builder called DAEDALUS — inspired by Superset.sh's terminal AI agent aesthetic (darkmodedesign.com) and Runlayer's Enterprise MCPs/Agents SaaS landing (land-book.com). Features a deep-space near-black background (#07080F), electric blue pipeline edges that glow between agent nodes, a bento grid pipeline gallery dashboard, node-graph canvas builder, live execution log monitor, and a team collaboration hub. 5 screens: Dashboard gallery, Pipeline Canvas, Node Config drawer, Run Monitor, Team Hub.`;

// ── Deep-Space Palette ─────────────────────────────────────────────────────────
const P = {
  // Backgrounds
  bg:       '#07080F',   // deepest space
  surface:  '#0C0E1A',   // elevated surface
  card:     '#111422',   // card background
  panel:    '#141729',   // panel / drawer
  hover:    '#191D30',   // hover state

  // Borders
  border:   '#1C2036',   // subtle divider
  border2:  '#262B48',   // stronger border
  glow:     '#5B7FFF40', // glowing border (alpha)

  // Accent: Electric Blueprint Blue (pipeline edges / AI flow)
  blue:     '#5B7FFF',   // primary accent
  blueLt:   '#8BA4FF',   // light blue
  blueDim:  '#141B40',   // dim blue bg

  // Accent 2: Agent Purple (node identifiers)
  purple:   '#9F5FFF',   // agent node color
  purpleLt: '#C49BFF',   // light purple
  purpleDim:'#1C1240',   // dim purple bg

  // Status
  green:    '#00CF8A',   // running / connected / success
  greenDim: '#0A2B1E',   // running bg
  amber:    '#F5A42B',   // pending / queued
  amberDim: '#2A1B08',   // pending bg
  red:      '#FF5555',   // error / failed
  redDim:   '#2B0E0E',   // error bg
  teal:     '#00D4CC',   // data stream / output

  // Text
  fg:       '#DFE5FF',   // primary text
  fg2:      '#6D78A8',   // secondary text
  fg3:      '#3A4060',   // muted / disabled
  code:     '#A0AFFF',   // code/mono text

  // Node types
  nodeInput:  '#5B7FFF', // input node (blue)
  nodeLLM:    '#9F5FFF', // LLM node (purple)
  nodeTool:   '#00CF8A', // tool/function node (green)
  nodeOutput: '#F5A42B', // output node (amber)
  nodeCode:   '#00D4CC', // code node (teal)
};

// ── pen.dev helpers ────────────────────────────────────────────────────────────
let _id = 0;
const uid = () => `da${++_id}`;

const F = (x, y, w, h, fill = P.bg, opts = {}) => ({
  id: uid(), type: 'frame', x, y, width: w, height: h, fill,
  clip: opts.clip !== undefined ? opts.clip : false,
  ...(opts.r  !== undefined ? { cornerRadius: opts.r }  : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  children: opts.ch || [],
});

const T = (content, x, y, w, h, opts = {}) => ({
  id: uid(), type: 'text', content, x, y, width: w, height: h,
  textGrowth: 'fixed-width-height',
  fontSize:   opts.size   || 12,
  fontWeight: String(opts.weight || 400),
  fill:       opts.fill   || P.fg,
  textAlign:  opts.align  || 'left',
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls }   : {}),
  ...(opts.lh !== undefined ? { lineHeight: opts.lh }      : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  ...(opts.mono ? { fontFamily: "'JetBrains Mono', 'Fira Code', monospace" } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
});

const HR = (x, y, w, fill = P.border) => F(x, y, w, 1, fill);
const VR = (x, y, h, fill = P.border) => F(x, y, 1, h, fill);

// Badge helper
const Badge = (x, y, label, fg, bg, opts = {}) => {
  const px = opts.px !== undefined ? opts.px : 8;
  const w  = label.length * 6.2 + px * 2;
  return F(x, y, w, 18, bg, {
    r: opts.r !== undefined ? opts.r : 9,
    ch: [T(label, px, 2, w - px * 2, 14, { size: 8.5, fill: fg, weight: 700, ls: 0.6 })],
    ...(opts.stroke ? { stroke: opts.stroke, sw: 1 } : {}),
  });
};

// Dot indicator
const Dot = (x, y, fill) => E(x, y, 7, 7, fill);

// Pipeline connection line (horizontal segment)
const ConnLine = (x, y, w, fill = P.blue) => F(x, y, w, 2, fill, { opacity: 0.7 });

// ── Sidebar builder ───────────────────────────────────────────────────────────
function buildSidebar(H, active = 0) {
  const W = 220;
  const navItems = [
    { icon: '⬡', label: 'Pipelines',  active: active === 0 },
    { icon: '▷',  label: 'Run History', active: active === 1 },
    { icon: '⊞',  label: 'Templates',  active: active === 2 },
    { icon: '◎',  label: 'Agents',     active: active === 3 },
    { icon: '◈',  label: 'Team',       active: active === 4 },
  ];

  const items = navItems.map((item, i) => {
    const bg  = item.active ? P.blueDim : 'transparent';
    const fg  = item.active ? P.blue : P.fg2;
    const row = F(12, 72 + i * 40, W - 24, 34, bg, {
      r: 6,
      ch: [
        T(item.icon, 10, 7, 20, 20, { size: 14, fill: fg }),
        T(item.label, 38, 8, 120, 16, { size: 12, fill: fg, weight: item.active ? 600 : 400 }),
        ...(item.active ? [F(W - 36, 11, 3, 12, P.blue, { r: 2 })] : []),
      ],
    });
    return row;
  });

  // Logo
  const logo = F(16, 16, 160, 36, 'transparent', { ch: [
    F(0, 4, 28, 28, P.blue, { r: 7, ch: [
      T('◈', 5, 4, 18, 20, { size: 14, fill: '#fff', align: 'center' }),
    ]}),
    T('DAEDALUS', 38, 7, 110, 18, { size: 13, fill: P.fg, weight: 800, ls: 2 }),
  ]});

  // Bottom: version + settings
  const bottom = F(12, H - 60, W - 24, 48, P.surface, { r: 8, ch: [
    E(12, 14, 20, 20, P.green + '30', { stroke: P.green, sw: 1 }),
    Dot(17, 19, P.green),
    T('v0.9.4  ·  beta', 44, 15, 120, 14, { size: 10, fill: P.fg3, weight: 500 }),
    T('Settings', 44, 29, 80, 12, { size: 9.5, fill: P.fg3 }),
  ]});

  return F(0, 0, W, H, P.surface, {
    ch: [logo, ...items, HR(0, H - 70, W), bottom],
  });
}

// ── Topbar builder ─────────────────────────────────────────────────────────────
function buildTopbar(startX, W, title, subtitle, badges = []) {
  const tbH = 54;
  return F(startX, 0, W, tbH, P.bg, {
    ch: [
      HR(0, tbH - 1, W, P.border),
      T(title, 20, 12, 240, 18, { size: 15, fill: P.fg, weight: 700 }),
      T(subtitle, 20, 31, 300, 12, { size: 10, fill: P.fg3, ls: 0.3 }),
      ...badges.map((b, i) => Badge(280 + i * (b.label.length * 6.5 + 20), 18, b.label, b.fg, b.bg)),
      // Right side: run button
      F(W - 130, 12, 110, 30, P.blue, { r: 7, ch: [
        T('▷  New Pipeline', 14, 7, 90, 14, { size: 10.5, fill: '#fff', weight: 700 }),
      ]}),
    ],
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 1 — Dashboard (Pipeline Gallery Bento Grid)
// ─────────────────────────────────────────────────────────────────────────────
function buildScreen1() {
  const W = 1280, H = 820;
  const SB = 220;
  const CX = SB + 1;
  const CW = W - SB - 1;

  const sidebar = buildSidebar(H, 0);
  const divider = VR(SB, 0, H, P.border);
  const topbar  = buildTopbar(CX, CW, 'Pipelines', '12 active · 3 running · last run 2m ago', [
    { label: 'ALL', fg: P.blue, bg: P.blueDim },
    { label: 'RUNNING', fg: P.green, bg: P.greenDim },
  ]);
  const tbH = 54;

  // Stats strip
  const statsY = tbH + 20;
  const stats = [
    { label: 'TOTAL RUNS', val: '2,847', delta: '+12% ↑', dc: P.green },
    { label: 'AVG DURATION', val: '4.2s', delta: '-8% ↓', dc: P.green },
    { label: 'SUCCESS RATE', val: '98.3%', delta: '+0.4%', dc: P.green },
    { label: 'AGENT CALLS', val: '41,203', delta: '+23% ↑', dc: P.blue },
  ];
  const statCards = stats.map((s, i) => F(CX + 20 + i * 185, statsY, 170, 80, P.card, { r: 10, stroke: P.border, sw: 1, ch: [
    T(s.label, 14, 12, 130, 11, { size: 8.5, fill: P.fg3, ls: 1.5, weight: 600 }),
    T(s.val, 14, 27, 120, 28, { size: 22, fill: P.fg, weight: 800 }),
    T(s.delta, 14, 58, 100, 12, { size: 10, fill: s.dc, weight: 600 }),
  ]}));

  // Pipeline cards (bento grid)
  const gridY = statsY + 100;
  const pipelines = [
    { name: 'Content Generator', nodes: 5, status: 'RUNNING', statusC: P.green, statusBg: P.greenDim,
      desc: 'GPT-4o → fact-check → SEO → publish', lastRun: '2m ago', runs: 847 },
    { name: 'Code Review Bot', nodes: 4, status: 'IDLE', statusC: P.fg3, statusBg: P.surface,
      desc: 'PR trigger → analyzer → claude-3.5 → comment', lastRun: '18m ago', runs: 2104 },
    { name: 'Data Pipeline ETL', nodes: 7, status: 'RUNNING', statusC: P.green, statusBg: P.greenDim,
      desc: 'fetch → transform → validate → store', lastRun: '5s ago', runs: 4211 },
    { name: 'Customer Triage', nodes: 6, status: 'ERROR', statusC: P.red, statusBg: P.redDim,
      desc: 'webhook → classify → route → respond', lastRun: '1h ago', runs: 391 },
    { name: 'Research Digest', nodes: 8, status: 'QUEUED', statusC: P.amber, statusBg: P.amberDim,
      desc: 'scrape → summarize → cluster → email', lastRun: 'never', runs: 0 },
    { name: 'Image Processor', nodes: 3, status: 'IDLE', statusC: P.fg3, statusBg: P.surface,
      desc: 'upload → vision → label → store', lastRun: '3h ago', runs: 1029 },
  ];
  const colW = (CW - 60) / 3;
  const pipeCards = pipelines.map((p, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const cx = CX + 20 + col * (colW + 10);
    const cy = gridY + row * (140 + 10);
    // Mini node viz (simplified pipeline dots)
    const dotColors = [P.nodeInput, P.nodeLLM, P.nodeTool, P.nodeOutput, P.nodeCode];
    const nodeDots = Array.from({length: p.nodes}, (_, ni) =>
      E(ni * 28, 4, 16, 16, dotColors[ni % dotColors.length] + '30', { stroke: dotColors[ni % dotColors.length], sw: 1 })
    );
    const connLines = Array.from({length: p.nodes - 1}, (_, ni) =>
      F(16 + ni * 28, 11, 12, 2, dotColors[ni % dotColors.length], { opacity: 0.4 })
    );
    return F(cx, cy, colW, 130, P.card, { r: 12, stroke: P.border, sw: 1, ch: [
      // Status badge
      Badge(colW - p.status.length * 6.2 - 22, 14, p.status, p.statusC, p.statusBg, { r: 5 }),
      T(p.name, 14, 14, colW - 100, 16, { size: 13.5, fill: P.fg, weight: 700 }),
      T(p.desc, 14, 35, colW - 28, 22, { size: 10, fill: P.fg3, lh: 14 }),
      // Node viz strip
      F(14, 64, p.nodes * 28, 24, 'transparent', { ch: [...nodeDots, ...connLines] }),
      HR(14, 98, colW - 28, P.border),
      T(p.runs + ' runs', 14, 106, 70, 12, { size: 10, fill: P.fg3 }),
      T(p.lastRun, colW - 70, 106, 56, 12, { size: 10, fill: P.fg3, align: 'right' }),
    ]});
  });

  // Activity feed (right column)
  const feedX = CX + 20 + 3 * (colW + 10) - 10; // overflow — removed, keep 3 cols only

  // Section label
  const sectionLabel = T('PIPELINES', CX + 20, gridY - 20, 120, 13, { size: 9, fill: P.fg3, weight: 700, ls: 2 });
  const statsLabel   = T('THIS WEEK', CX + 20, statsY - 18, 100, 13, { size: 9, fill: P.fg3, weight: 700, ls: 2 });

  return {
    id: uid(), name: 'S1 — Dashboard', type: 'frame',
    x: 0, y: 0, width: W, height: H,
    fill: P.bg, clip: true,
    children: [sidebar, divider, topbar, statsLabel, ...statCards, sectionLabel, ...pipeCards],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 2 — Pipeline Canvas (Node Graph Builder)
// ─────────────────────────────────────────────────────────────────────────────
function buildScreen2() {
  const W = 1280, H = 820;
  const SB = 220;
  const CX = SB + 1;

  const sidebar = buildSidebar(H, 0);
  const divider = VR(SB, 0, H, P.border);

  // Top toolbar (canvas-specific)
  const toolbar = F(CX, 0, W - SB - 1, 48, P.surface, { ch: [
    HR(0, 47, W - SB - 1, P.border),
    T('Content Generator', CX - SB + 14, 14, 200, 16, { size: 13, fill: P.fg, weight: 700 }),
    T('v1.2.0  ·  autosaved 3s ago', CX - SB + 14, 31, 200, 12, { size: 9.5, fill: P.fg3 }),
    // Canvas tools
    ...['◻','⊕','⊗','◈','⌖'].map((icon, i) => F(CX - SB + 300 + i * 36, 10, 30, 28, P.card, { r: 6, stroke: i === 0 ? P.blue : P.border, sw: 1, ch: [T(icon, 8, 5, 14, 18, { size: 13, fill: i === 0 ? P.blue : P.fg2 })] })),
    // Zoom
    T('100%', W - SB - 150, 16, 50, 16, { size: 11, fill: P.fg3, align: 'center' }),
    F(W - SB - 130, 10, 80, 28, P.card, { r: 6, stroke: P.border, sw: 1, ch: [T('▷  Run', 16, 7, 48, 14, { size: 10, fill: P.green, weight: 700 })] }),
    F(W - SB - 40, 10, 30, 28, P.blueDim, { r: 6, stroke: P.blue, sw: 1, ch: [T('⟳', 8, 5, 14, 18, { size: 13, fill: P.blue })] }),
  ]});

  // Canvas area (dot grid)
  const canvasY = 48;
  const canvasH = H - canvasY;
  const canvasW = W - SB - 280 - 1; // leave room for right panel
  const PANELX  = SB + 1 + canvasW;

  // Grid dots pattern (simplified with thin lines)
  const gridDots = [];
  for (let gx = 0; gx < canvasW; gx += 30) {
    for (let gy = 0; gy < canvasH; gy += 30) {
      gridDots.push(E(CX + gx, canvasY + gy, 1.5, 1.5, P.border));
    }
  }

  // Canvas frame
  const canvas = F(CX, canvasY, canvasW, canvasH, P.bg);

  // Nodes on canvas
  const nodeData = [
    { x: 60,  y: 80,  type: 'INPUT',  label: 'Webhook Trigger', sub: 'on: HTTP POST /generate', color: P.nodeInput,  icon: '↓' },
    { x: 280, y: 60,  type: 'LLM',    label: 'Topic Extractor', sub: 'claude-3.5-sonnet', color: P.nodeLLM,   icon: '⬡' },
    { x: 280, y: 200, type: 'LLM',    label: 'Research Agent', sub: 'gpt-4o + web-search', color: P.nodeLLM,   icon: '⬡' },
    { x: 520, y: 130, type: 'TOOL',   label: 'Fact Checker',   sub: 'fn: verify_claims()', color: P.nodeTool,  icon: '◎' },
    { x: 740, y: 80,  type: 'LLM',    label: 'Content Writer', sub: 'claude-3.5-sonnet', color: P.nodeLLM,   icon: '⬡' },
    { x: 740, y: 230, type: 'CODE',   label: 'SEO Optimizer',  sub: 'python: seo_score()', color: P.nodeCode,  icon: '◈' },
    { x: 960, y: 155, type: 'OUTPUT', label: 'Publish CMS',    sub: 'POST → wordpress API', color: P.nodeOutput, icon: '↑' },
  ];

  function agentNode(nd) {
    const nW = 180, nH = 90;
    const isSelected = nd.type === 'LLM' && nd.label === 'Content Writer';
    return F(CX + nd.x, canvasY + nd.y, nW, nH, P.card, {
      r: 12,
      stroke: isSelected ? nd.color : P.border2,
      sw: isSelected ? 2 : 1,
      ch: [
        // Glow effect for selected
        ...(isSelected ? [F(-4, -4, nW + 8, nH + 8, nd.color + '15', { r: 16 })] : []),
        // Type indicator
        F(14, 12, 44, 18, nd.color + '20', { r: 5, stroke: nd.color + '60', sw: 1, ch: [
          T(nd.type, 6, 3, 32, 12, { size: 7.5, fill: nd.color, weight: 700, ls: 0.8 }),
        ]}),
        // Icon circle
        E(nW - 32, 10, 22, 22, nd.color + '25', { stroke: nd.color + '50', sw: 1 }),
        T(nd.icon, nW - 28, 13, 14, 16, { size: 12, fill: nd.color, align: 'center' }),
        // Labels
        T(nd.label, 14, 36, nW - 28, 18, { size: 12, fill: P.fg, weight: 700 }),
        T(nd.sub,   14, 56, nW - 28, 26, { size: 9.5, fill: P.fg3, lh: 13, mono: true }),
        // Connect handles
        E(0 - 5, nH / 2 - 5, 10, 10, P.bg, { stroke: P.border2, sw: 1 }),
        E(nW - 5, nH / 2 - 5, 10, 10, nd.color, { stroke: nd.color + '80', sw: 1 }),
      ],
    });
  }

  // Connection lines between nodes (simplified as colored rects)
  const connections = [
    { x1: 240, y1: 125, x2: 280, y2: 105,  c: P.nodeInput },
    { x1: 240, y1: 125, x2: 280, y2: 245,  c: P.nodeInput },
    { x1: 460, y1: 105, x2: 520, y2: 175,  c: P.nodeLLM },
    { x1: 460, y1: 245, x2: 520, y2: 175,  c: P.nodeLLM },
    { x1: 700, y1: 175, x2: 740, y2: 125,  c: P.nodeTool },
    { x1: 700, y1: 175, x2: 740, y2: 275,  c: P.nodeTool },
    { x1: 920, y1: 125, x2: 960, y2: 200,  c: P.nodeLLM },
    { x1: 920, y1: 275, x2: 960, y2: 200,  c: P.nodeCode },
  ];

  const connPaths = connections.map(c => {
    const dx = c.x2 - c.x1, dy = c.y2 - c.y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    return F(CX + c.x1, canvasY + c.y1, len, 2, c.c, { opacity: 0.45 });
  });

  const nodes = nodeData.map(nd => agentNode(nd));

  // Right config panel
  const panelW = 280;
  const configPanel = F(PANELX, canvasY, panelW, canvasH, P.panel, { ch: [
    VR(0, 0, canvasH, P.border),
    T('NODE CONFIG', 20, 20, 200, 12, { size: 9, fill: P.fg3, weight: 700, ls: 2 }),
    T('Content Writer', 20, 38, 200, 18, { size: 14, fill: P.fg, weight: 800 }),
    Badge(20, 62, 'LLM', P.purpleLt, P.purpleDim),
    HR(0, 90, panelW, P.border),
    // Model picker
    T('MODEL', 20, 104, 100, 11, { size: 8.5, fill: P.fg3, ls: 1.5, weight: 600 }),
    F(20, 118, panelW - 40, 36, P.card, { r: 8, stroke: P.border2, sw: 1, ch: [
      T('claude-3.5-sonnet', 12, 10, 170, 16, { size: 12, fill: P.fg }),
      T('▾', panelW - 62, 10, 14, 16, { size: 12, fill: P.fg3 }),
    ]}),
    // System prompt
    T('SYSTEM PROMPT', 20, 166, 160, 11, { size: 8.5, fill: P.fg3, ls: 1.5, weight: 600 }),
    F(20, 180, panelW - 40, 80, P.card, { r: 8, stroke: P.border2, sw: 1, ch: [
      T('You are an expert content writer. Generate detailed, accurate, SEO-optimized content based on the research provided.', 10, 8, panelW - 62, 64, { size: 10, fill: P.fg2, lh: 15 }),
    ]}),
    // Params
    T('TEMPERATURE', 20, 272, 140, 11, { size: 8.5, fill: P.fg3, ls: 1.5, weight: 600 }),
    F(20, 286, panelW - 40, 30, P.card, { r: 6, stroke: P.border2, sw: 1, ch: [
      T('0.7', 12, 7, 40, 16, { size: 12, fill: P.blue }),
      F(60, 11, (panelW - 40 - 80) * 0.7, 8, P.blue + '60', { r: 4 }),
      F(60, 11, panelW - 40 - 80, 8, P.border2, { r: 4 }),
    ]}),
    T('MAX TOKENS', 20, 326, 120, 11, { size: 8.5, fill: P.fg3, ls: 1.5, weight: 600 }),
    F(20, 340, panelW - 40, 30, P.card, { r: 6, stroke: P.border2, sw: 1, ch: [
      T('4096', 12, 7, 50, 16, { size: 12, fill: P.blue }),
    ]}),
    HR(0, 382, panelW, P.border),
    // Connections info
    T('CONNECTIONS', 20, 394, 160, 11, { size: 8.5, fill: P.fg3, ls: 1.5, weight: 600 }),
    T('Input from:  Fact Checker', 20, 410, panelW - 40, 14, { size: 10.5, fill: P.fg2 }),
    T('Output to:   SEO Optimizer, Publish CMS', 20, 428, panelW - 40, 14, { size: 10.5, fill: P.fg2 }),
    HR(0, 452, panelW, P.border),
    // Delete / duplicate buttons
    F(20, 464, (panelW - 50) / 2, 34, P.redDim, { r: 7, stroke: P.red + '40', sw: 1, ch: [
      T('⊗ Delete', 14, 9, 90, 16, { size: 11, fill: P.red, weight: 600 }),
    ]}),
    F(20 + (panelW - 50) / 2 + 10, 464, (panelW - 50) / 2, 34, P.card, { r: 7, stroke: P.border2, sw: 1, ch: [
      T('⊕ Clone', 14, 9, 90, 16, { size: 11, fill: P.fg2, weight: 600 }),
    ]}),
  ]});

  return {
    id: uid(), name: 'S2 — Pipeline Canvas', type: 'frame',
    x: 1340, y: 0, width: W, height: H,
    fill: P.bg, clip: true,
    children: [sidebar, divider, canvas, toolbar, ...gridDots.slice(0, 60), ...connPaths, ...nodes, configPanel],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 3 — Node Config Drawer (full-screen with modal overlay)
// ─────────────────────────────────────────────────────────────────────────────
function buildScreen3() {
  const W = 1280, H = 820;
  const SB = 220;
  const CX = SB + 1;

  const sidebar = buildSidebar(H, 0);
  const divider = VR(SB, 0, H, P.border);
  const topbar  = F(CX, 0, W - SB, 48, P.surface, { ch: [
    HR(0, 47, W - SB, P.border),
    T('Pipeline Canvas  /  Add Node', CX - SB + 14, 15, 280, 16, { size: 13, fill: P.fg }),
    T('Research Digest', CX - SB + 14, 32, 200, 12, { size: 9.5, fill: P.fg3 }),
  ]});

  // Dimmed canvas BG
  const overlay = F(CX, 48, W - SB, H - 48, P.bg, { opacity: 0.6 });

  // Centered add-node modal
  const modalW = 680, modalH = 500;
  const modalX = CX + (W - SB - modalW) / 2;
  const modalY = 48 + (H - 48 - modalH) / 2;

  // Node type cards
  const nodeTypes = [
    { type: 'INPUT',    label: 'Trigger',       sub: 'HTTP, webhook, schedule, event', color: P.nodeInput,  icon: '↓' },
    { type: 'LLM',      label: 'LLM Agent',     sub: 'Claude, GPT-4, Gemini, Llama',  color: P.nodeLLM,    icon: '⬡' },
    { type: 'TOOL',     label: 'Tool / Fn',     sub: 'Python fn, API call, DB query', color: P.nodeTool,   icon: '◎' },
    { type: 'CODE',     label: 'Code Block',    sub: 'Custom JS / Python / bash',     color: P.nodeCode,   icon: '◈' },
    { type: 'OUTPUT',   label: 'Output / Sink', sub: 'Webhook, CMS, Slack, email',    color: P.nodeOutput, icon: '↑' },
    { type: 'BRANCH',   label: 'Branch / If',   sub: 'Conditional routing logic',     color: P.blue,       icon: '⊕' },
  ];
  const ncards = nodeTypes.map((nt, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const ncW = (modalW - 48 - 20) / 3;
    const ncH = 100;
    return F(16 + col * (ncW + 10), 120 + row * (ncH + 10), ncW, ncH, P.card, { r: 10, stroke: P.border2, sw: 1, ch: [
      E(14, 16, 32, 32, nt.color + '20', { stroke: nt.color + '60', sw: 1 }),
      T(nt.icon, 21, 21, 18, 22, { size: 18, fill: nt.color, align: 'center' }),
      T(nt.label, 56, 18, ncW - 70, 16, { size: 12.5, fill: P.fg, weight: 700 }),
      T(nt.sub, 56, 38, ncW - 70, 26, { size: 9.5, fill: P.fg3, lh: 13 }),
      F(ncW - 28, ncH - 26, 16, 16, nt.color + '25', { r: 8, ch: [T('+', 3, 1, 10, 14, { size: 11, fill: nt.color, weight: 700 })] }),
    ]});
  });

  const modal = F(modalX, modalY, modalW, modalH, P.panel, { r: 16, stroke: P.border2, sw: 1, ch: [
    T('Add Node', 24, 24, 200, 20, { size: 16, fill: P.fg, weight: 800 }),
    T('Choose a node type to add to your pipeline', 24, 48, 400, 14, { size: 11, fill: P.fg3 }),
    HR(0, 76, modalW, P.border),
    // Search
    F(16, 88, modalW - 32, 34, P.card, { r: 8, stroke: P.border2, sw: 1, ch: [
      T('⌕', 10, 7, 18, 20, { size: 15, fill: P.fg3 }),
      T('Search node types…', 34, 10, 300, 14, { size: 11, fill: P.fg3 }),
    ]}),
    ...ncards,
    // Cancel button
    F(modalW - 110, modalH - 56, 90, 34, P.card, { r: 8, stroke: P.border2, sw: 1, ch: [
      T('Cancel', 20, 9, 50, 16, { size: 11.5, fill: P.fg2, weight: 600 }),
    ]}),
  ]});

  return {
    id: uid(), name: 'S3 — Add Node Modal', type: 'frame',
    x: 2680, y: 0, width: W, height: H,
    fill: P.bg, clip: true,
    children: [sidebar, divider, topbar, overlay, modal],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 4 — Run Monitor (Live Execution Logs)
// ─────────────────────────────────────────────────────────────────────────────
function buildScreen4() {
  const W = 1280, H = 820;
  const SB = 220;
  const CX = SB + 1;

  const sidebar = buildSidebar(H, 1);
  const divider = VR(SB, 0, H, P.border);
  const topbar  = F(CX, 0, W - SB, 48, P.surface, { ch: [
    HR(0, 47, W - SB, P.border),
    T('Run Monitor', CX - SB + 14, 14, 200, 16, { size: 13, fill: P.fg, weight: 700 }),
    T('Content Generator · Run #848 · Started 12s ago', CX - SB + 14, 31, 340, 12, { size: 9.5, fill: P.fg3 }),
    Badge(CX - SB + 365, 16, 'RUNNING', P.green, P.greenDim),
    F(W - SB - 110, 10, 90, 28, P.redDim, { r: 7, stroke: P.red + '40', sw: 1, ch: [
      T('⊗  Abort', 14, 7, 62, 14, { size: 10, fill: P.red, weight: 700 }),
    ]}),
  ]});
  const tbH = 48;

  // Timeline left (node execution steps)
  const tlW = 320;
  const steps = [
    { name: 'Webhook Trigger', type: 'INPUT',  status: 'done',    dur: '12ms', color: P.nodeInput },
    { name: 'Topic Extractor', type: 'LLM',    status: 'done',    dur: '1.2s', color: P.nodeLLM },
    { name: 'Research Agent',  type: 'LLM',    status: 'running', dur: '…',    color: P.nodeLLM },
    { name: 'Fact Checker',    type: 'TOOL',   status: 'pending', dur: '—',    color: P.nodeTool },
    { name: 'Content Writer',  type: 'LLM',    status: 'pending', dur: '—',    color: P.nodeLLM },
    { name: 'SEO Optimizer',   type: 'CODE',   status: 'pending', dur: '—',    color: P.nodeCode },
    { name: 'Publish CMS',     type: 'OUTPUT', status: 'pending', dur: '—',    color: P.nodeOutput },
  ];

  const stepItems = steps.map((s, i) => {
    const sy = tbH + 20 + i * 72;
    const isRunning = s.status === 'running';
    const isDone    = s.status === 'done';
    const ic = isDone ? P.green : isRunning ? s.color : P.fg3;
    const bg = isRunning ? s.color + '15' : isDone ? P.greenDim : 'transparent';
    return F(CX + 16, sy, tlW - 32, 62, bg, { r: 10, stroke: isRunning ? s.color + '40' : P.border, sw: 1, ch: [
      E(14, 18, 26, 26, ic + '20', { stroke: ic, sw: 1 }),
      T(isDone ? '✓' : isRunning ? '●' : '○', 18, 21, 18, 18, { size: 11, fill: ic, align: 'center' }),
      T(s.name, 50, 14, 170, 16, { size: 12, fill: isRunning ? P.fg : isDone ? P.fg : P.fg3, weight: isRunning ? 700 : 500 }),
      T(s.type, 50, 32, 80, 12, { size: 9.5, fill: ic }),
      T(s.dur, tlW - 75, 14, 50, 16, { size: 12, fill: ic, weight: 700, align: 'right' }),
      ...(isRunning ? [F(50, 44, 180 * 0.4, 3, s.color, { r: 2 }), F(50, 44, 180, 3, s.color + '25', { r: 2 })] : []),
    ]});
  });

  // Divider between steps and logs
  const splitX = CX + tlW;
  const splitLine = VR(splitX, tbH, H - tbH, P.border);

  // Log panel (right)
  const logX  = splitX + 1;
  const logW  = W - splitX - 1;
  const logBg = F(logX, tbH, logW, H - tbH, '#050709');

  const logLines = [
    { t: '12:34:01.021', node: 'WEBHOOK',  msg: 'POST /generate received · payload 2.1KB', color: P.nodeInput },
    { t: '12:34:01.033', node: 'WEBHOOK',  msg: 'Extracted: topic="AI agent orchestration" lang=en', color: P.nodeInput },
    { t: '12:34:01.045', node: 'EXTRACTOR',msg: 'Calling claude-3.5-sonnet · tokens: 342 in', color: P.nodeLLM },
    { t: '12:34:02.210', node: 'EXTRACTOR',msg: 'Response 891ms · tokens: 156 out · 3 topics extracted', color: P.nodeLLM },
    { t: '12:34:02.215', node: 'EXTRACTOR',msg: '  [0] AI pipeline architecture patterns', color: P.fg3 },
    { t: '12:34:02.216', node: 'EXTRACTOR',msg: '  [1] Multi-agent orchestration best practices', color: P.fg3 },
    { t: '12:34:02.217', node: 'EXTRACTOR',msg: '  [2] LLM routing strategies 2026', color: P.fg3 },
    { t: '12:34:02.220', node: 'RESEARCH',  msg: 'Starting Research Agent · model=gpt-4o + web-search', color: P.nodeLLM },
    { t: '12:34:02.221', node: 'RESEARCH',  msg: 'Tool call: web_search("AI pipeline architecture 2026")', color: P.teal },
    { t: '12:34:03.800', node: 'RESEARCH',  msg: 'web_search returned 12 results · processing…', color: P.teal },
    { t: '12:34:04.100', node: 'RESEARCH',  msg: '▸ running · elapsed 1.88s · streaming…', color: P.nodeLLM },
    { t: '12:34:04.101', node: 'RESEARCH',  msg: '  Daedalus has identified 4 primary architectural patterns…', color: P.fg2 },
  ];

  const logRows = logLines.map((l, i) => F(logX + 16, tbH + 16 + i * 40, logW - 32, 36, 'transparent', { ch: [
    T(l.t, 0, 4, 90, 14, { size: 9.5, fill: P.fg3, mono: true }),
    Badge(98, 1, l.node, l.color, l.color + '18', { r: 3, px: 5 }),
    T(l.msg, 160, 4, logW - 180, 22, { size: 10, fill: l.color !== P.fg3 && l.color !== P.fg2 ? P.fg : l.color, mono: true, lh: 14 }),
    HR(0, 34, logW - 32, P.border + '80'),
  ]}));

  // Cursor blink (latest line)
  const cursor = F(logX + 316, tbH + 16 + logLines.length * 40, 8, 16, P.green + '80', { r: 1 });

  // Log header
  const logHeader = F(logX, tbH, logW, 38, P.surface, { ch: [
    HR(0, 37, logW, P.border),
    T('EXECUTION LOG', logX - splitX + 16, 12, 150, 13, { size: 9, fill: P.fg3, weight: 700, ls: 2 }),
    Badge(logX - splitX + 160, 10, 'LIVE', P.green, P.greenDim),
    T('12 lines', logW - 80, 12, 64, 13, { size: 9.5, fill: P.fg3, align: 'right' }),
  ]});

  return {
    id: uid(), name: 'S4 — Run Monitor', type: 'frame',
    x: 4020, y: 0, width: W, height: H,
    fill: P.bg, clip: true,
    children: [sidebar, divider, topbar, ...stepItems, splitLine, logBg, logHeader, ...logRows, cursor],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN 5 — Team Hub
// ─────────────────────────────────────────────────────────────────────────────
function buildScreen5() {
  const W = 1280, H = 820;
  const SB = 220;
  const CX = SB + 1;

  const sidebar = buildSidebar(H, 4);
  const divider = VR(SB, 0, H, P.border);
  const topbar  = buildTopbar(CX, W - SB, 'Team Hub', '4 members · 3 shared workspaces', []);

  const tbH = 54;

  // Team members
  const memberY = tbH + 20;
  const members = [
    { name: 'Maya Chen',     role: 'Pipeline Engineer', avatar: 'MC', active: true,  pipes: 8, runs: 1204 },
    { name: 'Alex Reyes',    role: 'ML Engineer',        avatar: 'AR', active: true,  pipes: 5, runs: 847 },
    { name: 'Jordan Kim',    role: 'Product Designer',   avatar: 'JK', active: false, pipes: 3, runs: 312 },
    { name: 'Sam Okafor',    role: 'Backend Eng',        avatar: 'SO', active: false, pipes: 6, runs: 692 },
  ];

  const memberLabel = T('TEAM MEMBERS', CX + 20, memberY, 160, 12, { size: 9, fill: P.fg3, weight: 700, ls: 2 });
  const memberCards = members.map((m, i) => F(CX + 20 + i * 240, memberY + 22, 220, 80, P.card, { r: 10, stroke: P.border, sw: 1, ch: [
    // Avatar circle
    E(14, 18, 44, 44, m.active ? P.blue + '30' : P.surface, { stroke: m.active ? P.blue : P.border2, sw: 2 }),
    T(m.avatar, 14, 22, 44, 30, { size: 13, fill: m.active ? P.blue : P.fg3, weight: 800, align: 'center' }),
    ...(m.active ? [E(50, 50, 10, 10, P.green, { stroke: P.card, sw: 2 })] : []),
    T(m.name, 68, 16, 140, 15, { size: 12, fill: P.fg, weight: 700 }),
    T(m.role, 68, 34, 140, 12, { size: 10, fill: P.fg3 }),
    T(m.pipes + ' pipelines', 68, 52, 80, 12, { size: 10, fill: P.fg2 }),
    T(m.runs + ' runs', 68 + 88, 52, 60, 12, { size: 10, fill: P.fg2 }),
  ]}));

  // Shared workspaces
  const wsY = memberY + 130;
  const wsLabel = T('SHARED WORKSPACES', CX + 20, wsY, 200, 12, { size: 9, fill: P.fg3, weight: 700, ls: 2 });
  const workspaces = [
    { name: 'Content Automation', pipes: 6, members: 4, lastUpdate: '2h ago', color: P.blue },
    { name: 'ML Experiments', pipes: 12, members: 2, lastUpdate: '1d ago', color: P.purple },
    { name: 'Customer Flows', pipes: 4, members: 3, lastUpdate: '5h ago', color: P.green },
  ];
  const wsCards = workspaces.map((ws, i) => F(CX + 20 + i * 320, wsY + 22, 300, 90, P.card, { r: 10, stroke: P.border, sw: 1, ch: [
    F(0, 0, 300, 4, ws.color, { r: 10 }),
    T(ws.name, 16, 18, 220, 18, { size: 14, fill: P.fg, weight: 700 }),
    T(ws.pipes + ' pipelines  ·  ' + ws.members + ' members', 16, 40, 240, 14, { size: 10.5, fill: P.fg3 }),
    T('Updated ' + ws.lastUpdate, 16, 58, 180, 12, { size: 10, fill: P.fg3 }),
    F(260, 30, 26, 26, ws.color + '20', { r: 8, stroke: ws.color + '40', sw: 1, ch: [
      T('→', 7, 5, 12, 16, { size: 11, fill: ws.color }),
    ]}),
  ]}));

  // Recent activity feed
  const feedY = wsY + 140;
  const feedLabel = T('RECENT ACTIVITY', CX + 20, feedY, 180, 12, { size: 9, fill: P.fg3, weight: 700, ls: 2 });
  const activities = [
    { who: 'MC', action: 'deployed', what: 'Content Generator v1.2', time: '2m ago', c: P.blue },
    { who: 'AR', action: 'added node', what: 'GPT-4o Vision to Image Pipeline', time: '28m ago', c: P.purple },
    { who: 'MC', action: 'fixed error', what: 'Customer Triage · webhook timeout', time: '1h ago', c: P.red },
    { who: 'SO', action: 'shared', what: 'ML Experiments workspace', time: '3h ago', c: P.green },
    { who: 'JK', action: 'created', what: 'Research Digest pipeline', time: '1d ago', c: P.amber },
  ];
  const feedItems = activities.map((a, i) => F(CX + 20, feedY + 22 + i * 42, W - SB - 60, 36, 'transparent', { ch: [
    E(0, 8, 22, 22, P.card, { stroke: P.border2, sw: 1 }),
    T(a.who, 0, 11, 22, 14, { size: 9, fill: P.blue, weight: 700, align: 'center' }),
    T(a.who + ' ' + a.action + ' ', 28, 8, 120, 14, { size: 11, fill: P.fg3 }),
    T(a.what, 148, 8, 500, 14, { size: 11, fill: P.fg, weight: 600 }),
    T(a.time, W - SB - 80, 8, 60, 14, { size: 10, fill: P.fg3, align: 'right' }),
    HR(0, 34, W - SB - 60, P.border),
  ]}));

  return {
    id: uid(), name: 'S5 — Team Hub', type: 'frame',
    x: 5360, y: 0, width: W, height: H,
    fill: P.bg, clip: true,
    children: [sidebar, divider, topbar, memberLabel, ...memberCards, wsLabel, ...wsCards, feedLabel, ...feedItems],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Assemble .pen file
// ─────────────────────────────────────────────────────────────────────────────
const pen = {
  version: '2.8',
  name: APP_NAME,
  children: [
    buildScreen1(),
    buildScreen2(),
    buildScreen3(),
    buildScreen4(),
    buildScreen5(),
  ],
};

const penPath = path.join(__dirname, 'daedalus-app.pen');
fs.writeFileSync(penPath, JSON.stringify(pen, null, 2));
console.log('✓ daedalus-app.pen written');

// ─────────────────────────────────────────────────────────────────────────────
// SVG renderer (for thumbnails in hero page)
// ─────────────────────────────────────────────────────────────────────────────
function sc(c) {
  if (!c || c === 'none') return 'none';
  if (c === '#00000000') return 'none';
  if (c.length === 9) {
    const a = parseInt(c.slice(7, 9), 16) / 255;
    return `rgba(${parseInt(c.slice(1,3),16)},${parseInt(c.slice(3,5),16)},${parseInt(c.slice(5,7),16)},${a.toFixed(2)})`;
  }
  if (c.length === 7) return c;
  if (c.length > 7 && c.startsWith('#')) {
    // handle 6-char + 2 alpha at end
    if (c.length === 9) {
      const a = parseInt(c.slice(7,9), 16) / 255;
      return `rgba(${parseInt(c.slice(1,3),16)},${parseInt(c.slice(3,5),16)},${parseInt(c.slice(5,7),16)},${a.toFixed(2)})`;
    }
    return c.slice(0, 7); // strip alpha suffix
  }
  return c;
}

function rn(n, ox, oy, depth = 0, maxDepth = 8) {
  if (!n || typeof n !== 'object') return '';
  if (depth > maxDepth) return '';
  const nx = (n.x || 0) + ox, ny = (n.y || 0) + oy;
  const w = n.width || 0, h = n.height || 0;
  const op = n.opacity !== undefined ? n.opacity : 1;
  const r  = n.cornerRadius || 0;
  let out  = '';

  if (n.type === 'frame' || n.type === 'group') {
    let sa = '';
    if (n.stroke) sa = `stroke="${sc(n.stroke.fill)}" stroke-width="${n.stroke.thickness || 1}"`;
    const cid = n.clip ? 'cl' + n.id : '';
    if (cid) out += `<defs><clipPath id="${cid}"><rect x="${nx}" y="${ny}" width="${w}" height="${h}" rx="${r}"/></clipPath></defs>`;
    const fill = sc(n.fill || 'transparent');
    if (fill !== 'none' && fill !== 'transparent') {
      out += `<rect x="${nx}" y="${ny}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${sa} opacity="${op}"/>`;
    }
    const inner = (n.children || []).map(c => rn(c, nx, ny, depth + 1, maxDepth)).join('');
    out += cid ? `<g clip-path="url(#${cid})">${inner}</g>` : inner;
  } else if (n.type === 'rectangle') {
    let sa = '';
    if (n.stroke) sa = `stroke="${sc(n.stroke.fill)}" stroke-width="${n.stroke.thickness || 1}"`;
    out += `<rect x="${nx}" y="${ny}" width="${w}" height="${h}" rx="${r}" fill="${sc(n.fill)}" ${sa} opacity="${op}"/>`;
  } else if (n.type === 'ellipse') {
    let sa = '';
    if (n.stroke) sa = `stroke="${sc(n.stroke.fill)}" stroke-width="${n.stroke.thickness || 1}"`;
    out += `<ellipse cx="${nx+w/2}" cy="${ny+h/2}" rx="${w/2}" ry="${h/2}" fill="${sc(n.fill)}" ${sa} opacity="${op}"/>`;
  } else if (n.type === 'text') {
    const fs = n.fontSize || 12, fw = n.fontWeight || '400';
    const ta = n.textAlign || 'left';
    const family = n.fontFamily ? n.fontFamily : "'Inter','SF Pro',sans-serif";
    let ax = nx;
    if (ta === 'center') ax = nx + w / 2;
    else if (ta === 'right') ax = nx + w;
    const anchor = ta === 'center' ? 'middle' : ta === 'right' ? 'end' : 'start';
    const lh = n.lineHeight || (fs * 1.3);
    const ls = n.letterSpacing ? `letter-spacing="${n.letterSpacing}"` : '';
    (n.content || '').split('\n').forEach((line, li) => {
      if (!line.trim()) return;
      out += `<text x="${ax}" y="${ny + fs + li * lh}" font-size="${fs}" font-weight="${fw}" font-family="${family}" fill="${sc(n.fill || P.fg)}" text-anchor="${anchor}" ${ls} opacity="${op}">${line.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text>`;
    });
  }
  return out;
}

function screenSVG(screen, thumbW, thumbH, maxD = 8) {
  const sw = screen.width || 1280, sh = screen.height || 820;
  const sx = screen.x || 0;
  const content = (screen.children || []).map(c => rn(c, -sx, 0, 0, maxD)).join('');
  const bg = sc(screen.fill || P.bg);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${thumbW}" height="${thumbH}" viewBox="0 0 ${sw} ${sh}" style="display:block;border-radius:10px;overflow:hidden"><rect width="${sw}" height="${sh}" fill="${bg}"/>${content}</svg>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hero HTML
// ─────────────────────────────────────────────────────────────────────────────
const SCREEN_NAMES = ['Dashboard', 'Pipeline Canvas', 'Add Node Modal', 'Run Monitor', 'Team Hub'];
const THUMB_W = 240, THUMB_H = 154;

const penJson    = fs.readFileSync(penPath, 'utf8');
const penData    = JSON.parse(penJson);
const screens    = penData.children || [];

// Limit render depth for thumbnails to keep hero size under 512KB
const THUMB_DEPTH = 5;

const thumbsHTML = screens.map((s, i) =>
  `<div style="text-align:center;flex-shrink:0">
    ${screenSVG(s, THUMB_W, THUMB_H, 4)}
    <div style="font-size:8px;color:${P.fg3};margin-top:8px;letter-spacing:2px;font-weight:700">${(SCREEN_NAMES[i] || 'SCREEN ' + (i+1)).toUpperCase()}</div>
  </div>`
).join('');

const surface = P.card;
const border  = P.border;

const cssTokens = `:root {
  /* DAEDALUS — Design Tokens */

  /* Backgrounds */
  --bg:          ${P.bg};
  --surface:     ${P.surface};
  --card:        ${P.card};
  --panel:       ${P.panel};

  /* Borders */
  --border:      ${P.border};
  --border-2:    ${P.border2};

  /* Primary accent: Electric Blueprint Blue */
  --blue:        ${P.blue};
  --blue-lt:     ${P.blueLt};
  --blue-dim:    ${P.blueDim};

  /* Secondary accent: Agent Purple */
  --purple:      ${P.purple};
  --purple-lt:   ${P.purpleLt};
  --purple-dim:  ${P.purpleDim};

  /* Node type colors */
  --node-input:  ${P.nodeInput};
  --node-llm:    ${P.nodeLLM};
  --node-tool:   ${P.nodeTool};
  --node-output: ${P.nodeOutput};
  --node-code:   ${P.nodeCode};

  /* Status */
  --green:       ${P.green};
  --green-dim:   ${P.greenDim};
  --amber:       ${P.amber};
  --amber-dim:   ${P.amberDim};
  --red:         ${P.red};
  --red-dim:     ${P.redDim};
  --teal:        ${P.teal};

  /* Text */
  --fg:          ${P.fg};
  --fg-2:        ${P.fg2};
  --fg-3:        ${P.fg3};
  --code:        ${P.code};

  /* Typography */
  --font-ui:      'Inter', 'SF Pro Display', -apple-system, sans-serif;
  --font-mono:    'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
  --font-display: 900 clamp(48px,9vw,96px)/0.95 var(--font-ui);
  --font-heading: 700 15px/1 var(--font-ui);
  --font-body:    400 12px/1.6 var(--font-ui);
  --font-caption: 700 9px/1 var(--font-ui);
  --font-code:    400 11px/1.6 var(--font-mono);

  /* Spacing (8px base) */
  --s-1: 4px;  --s-2: 8px;  --s-3: 12px;  --s-4: 16px;
  --s-5: 24px; --s-6: 32px; --s-7: 48px;  --s-8: 64px;

  /* Radius */
  --r-sm: 4px; --r-md: 8px; --r-lg: 12px; --r-xl: 16px; --r-full: 9999px;
}`;

const shareText = encodeURIComponent(
  `DAEDALUS — visual AI pipeline architect. 5-screen dark desktop app by RAM Design Studio. Build multi-agent workflows like a canvas.`
);

const prd = `
<h3>OVERVIEW</h3>
<p>DAEDALUS is a dark-mode visual AI pipeline builder for orchestrating multi-agent workflows. Inspired by Superset.sh's terminal aesthetic and Runlayer's enterprise agent SaaS, it lets teams drag-connect AI agent nodes into composable pipelines, monitor live execution, and collaborate in shared workspaces — all from a canvas that feels as precise as code but as expressive as design.</p>

<h3>TARGET USERS</h3>
<ul>
<li><strong>AI engineers</strong> building production LLM pipelines who want visibility without code</li>
<li><strong>ML teams</strong> experimenting with multi-agent chains across Claude, GPT-4o, and open-source models</li>
<li><strong>Platform teams</strong> deploying AI automation for content, customer support, and data processing</li>
</ul>

<h3>CORE FEATURES</h3>
<ul>
<li><strong>Pipeline Canvas</strong> — node-graph builder where AI agents connect via glowing dataflow edges</li>
<li><strong>Bento Dashboard</strong> — gallery of all pipelines with live status, run counts, node previews</li>
<li><strong>Run Monitor</strong> — real-time execution log with timestamped node output streams</li>
<li><strong>Node Config Drawer</strong> — model picker, system prompt, temp/token controls per agent node</li>
<li><strong>Team Hub</strong> — shared workspaces, member activity, pipeline permissions</li>
</ul>

<h3>DESIGN LANGUAGE</h3>
<ul>
<li><strong>Deep-space black (#07080F)</strong> — near-void bg inspired by Superset.sh terminal aesthetic</li>
<li><strong>Blueprint blue (#5B7FFF)</strong> — primary accent; pipeline edges glow with "electrical" dataflow energy</li>
<li><strong>Node color system</strong> — 5 semantic colors (input/LLM/tool/code/output) for instant visual parsing</li>
<li><strong>Inter + JetBrains Mono</strong> — UI clarity meets terminal authenticity</li>
<li><strong>Sparse density</strong> — breathing room in cards, no decoration, every element functional</li>
</ul>

<h3>SCREEN ARCHITECTURE</h3>
<ul>
<li><strong>S1 — Dashboard:</strong> bento grid pipeline gallery, weekly stats strip, status indicators</li>
<li><strong>S2 — Pipeline Canvas:</strong> node graph with connected agent nodes, right-panel config drawer</li>
<li><strong>S3 — Add Node Modal:</strong> 6 node-type cards with description, overlay on dimmed canvas</li>
<li><strong>S4 — Run Monitor:</strong> step timeline left, live log stream right with color-coded output</li>
<li><strong>S5 — Team Hub:</strong> member cards, shared workspaces, recent activity feed</li>
</ul>
`;

const heroHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>DAEDALUS — Visual AI Pipeline Architect · RAM Design Studio</title>
<meta name="description" content="Visual AI pipeline builder for multi-agent orchestration. Dark desktop app design, 5 screens, brand spec &amp; CSS tokens.">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:${P.bg};color:${P.fg};font-family:'Inter','SF Pro Display',-apple-system,sans-serif;min-height:100vh}
  a{color:inherit;text-decoration:none}
  nav{padding:18px 40px;border-bottom:1px solid ${border};display:flex;justify-content:space-between;align-items:center;position:sticky;top:0;background:${P.bg}f0;backdrop-filter:blur(16px);z-index:100}
  .logo{font-size:13px;font-weight:800;letter-spacing:4px;color:${P.fg}}
  .logo span{color:${P.blue}}
  .nav-tag{font-size:9.5px;color:${P.fg3};letter-spacing:1.5px;font-weight:600;border:1px solid ${border};padding:4px 10px;border-radius:4px}
  .hero{padding:80px 40px 48px;max-width:980px}
  .hero-tag{font-size:9px;letter-spacing:3px;color:${P.blue};margin-bottom:20px;font-weight:700}
  h1{font-size:clamp(60px,10vw,108px);font-weight:900;letter-spacing:-4px;line-height:0.9;margin-bottom:28px;color:${P.fg}}
  h1 em{color:${P.blue};font-style:normal}
  .sub{font-size:17px;color:${P.fg2};max-width:520px;line-height:1.7;margin-bottom:44px}
  .meta{display:flex;gap:40px;margin-bottom:52px;flex-wrap:wrap}
  .meta-item span{display:block;font-size:8.5px;color:${P.fg3};letter-spacing:1.5px;margin-bottom:5px;font-weight:700}
  .meta-item strong{color:${P.fg};font-size:13px;font-weight:700}
  .actions{display:flex;gap:10px;margin-bottom:72px;flex-wrap:wrap}
  .btn{padding:11px 22px;border-radius:8px;font-size:11.5px;font-weight:700;cursor:pointer;border:none;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:6px;letter-spacing:0.3px;transition:opacity .15s}
  .btn-p{background:${P.blue};color:#fff}
  .btn-p:hover{opacity:.85}
  .btn-s{background:transparent;color:${P.fg};border:1px solid ${border}}
  .btn-s:hover{border-color:${P.blue}66;color:${P.blue}}
  .btn-x{background:#000;color:#fff;border:1px solid #222}
  .preview{padding:0 40px 80px}
  .section-label{font-size:9px;letter-spacing:3px;color:${P.fg3};margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid ${border};font-weight:700}
  .thumbs{display:flex;gap:16px;overflow-x:auto;padding-bottom:12px}
  .thumbs::-webkit-scrollbar{height:4px}
  .thumbs::-webkit-scrollbar-thumb{background:${P.blue}44;border-radius:2px}
  .brand-section{padding:60px 40px;border-top:1px solid ${border};max-width:920px}
  .brand-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px}
  @media(max-width:640px){.brand-grid{grid-template-columns:1fr}}
  .bg-label{font-size:9px;letter-spacing:2px;color:${P.fg3};margin-bottom:16px;font-weight:700}
  .swatches{display:flex;gap:8px;flex-wrap:wrap}
  .swatch{flex:1;min-width:65px}
  .swatch-box{height:56px;border-radius:8px;border:1px solid ${border};margin-bottom:8px}
  .swatch-role{font-size:8px;letter-spacing:1.5px;color:${P.fg3};margin-bottom:3px;font-weight:700}
  .swatch-hex{font-size:11px;font-weight:700;color:${P.fg}}
  .type-row{padding:12px 0;border-bottom:1px solid ${border};display:flex;align-items:baseline;gap:16px}
  .type-sample{flex:1}
  .type-spec{font-size:9.5px;color:${P.fg3};font-family:'JetBrains Mono','Fira Code',monospace}
  .tokens-block{background:${P.surface};border:1px solid ${border};border-radius:10px;padding:20px;margin-top:20px;position:relative}
  .tokens-pre{font-size:9.5px;line-height:1.7;color:${P.code};white-space:pre;overflow-x:auto;font-family:'JetBrains Mono','Fira Code',monospace}
  .copy-btn{position:absolute;top:12px;right:12px;background:${P.blueDim};border:1px solid ${P.blue}44;color:${P.blue};font-family:inherit;font-size:10px;letter-spacing:1px;padding:5px 12px;border-radius:4px;cursor:pointer;font-weight:700}
  .copy-btn:hover{background:${P.blue}30}
  .prompt-section{padding:40px;border-top:1px solid ${border}}
  .p-label{font-size:9px;letter-spacing:2px;color:${P.blue};margin-bottom:12px;font-weight:700}
  .p-text{font-size:19px;color:${P.fg2};font-style:italic;max-width:640px;line-height:1.6;margin-bottom:20px}
  .prd-section{padding:40px;border-top:1px solid ${border};max-width:760px}
  .prd-section h3{font-size:9px;letter-spacing:2px;color:${P.blue};margin:28px 0 10px;font-weight:700}
  .prd-section h3:first-child{margin-top:0}
  .prd-section p,.prd-section li{font-size:13px;color:${P.fg2};line-height:1.72;max-width:680px}
  .prd-section ul{padding-left:18px;margin:6px 0}
  .prd-section li{margin-bottom:5px}
  .prd-section strong{color:${P.fg};font-weight:600}
  footer{padding:28px 40px;border-top:1px solid ${border};font-size:11px;color:${P.fg3};display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px}
  .toast{position:fixed;bottom:24px;right:24px;background:${P.blue};color:#fff;font-family:inherit;font-size:11px;font-weight:700;letter-spacing:1px;padding:10px 20px;border-radius:6px;transform:translateY(80px);opacity:0;transition:all .3s;z-index:999}
  .toast.show{transform:translateY(0);opacity:1}
  /* Node type color strip */
  .node-strip{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap}
  .node-tag{padding:5px 12px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:0.5px}
  /* Canvas glitch intro */
  .canvas-preview{border:1px solid ${border};border-radius:12px;overflow:hidden;margin-bottom:24px;position:relative}
  .canvas-preview::before{content:'PIPELINE CANVAS · LIVE';position:absolute;top:12px;left:16px;font-size:8.5px;letter-spacing:2px;color:${P.blue};font-weight:700;background:${P.bg}cc;padding:4px 10px;border-radius:4px;border:1px solid ${P.border2}}
</style>
</head>
<body>
<div class="toast" id="toast">Tokens copied ✓</div>

<nav>
  <div class="logo">RAM<span>.</span>DS</div>
  <span class="nav-tag">DESIGN HEARTBEAT · ${DATE_STR.toUpperCase()}</span>
</nav>

<section class="hero">
  <div class="hero-tag">VISUAL AI PIPELINE ARCHITECT · DARK DESKTOP APP · 5 SCREENS</div>
  <h1>DAE<em>DAL</em>US</h1>
  <p class="sub">${TAGLINE}<br><br>Build multi-agent AI workflows on a canvas. Connect, configure, monitor.</p>
  <div class="meta">
    <div class="meta-item"><span>SCREENS</span><strong>5 DESKTOP</strong></div>
    <div class="meta-item"><span>CANVAS SIZE</span><strong>1280 × 820</strong></div>
    <div class="meta-item"><span>CSS TOKENS</span><strong>✓ COPY-READY</strong></div>
    <div class="meta-item"><span>INSPIRED BY</span><strong>SUPERSET · RUNLAYER · LINEAR</strong></div>
    <div class="meta-item"><span>PALETTE</span><strong>DEEP SPACE BLUE</strong></div>
  </div>
  <div class="actions">
    <a class="btn btn-p" href="https://ram.zenbin.org/${SLUG}-viewer" target="_blank">▷ Open in Viewer</a>
    <a class="btn btn-s" id="dlBtn" href="#">⤓ Download .pen</a>
    <button class="btn btn-s" id="cpBtn">⊕ Copy Prompt</button>
    <a class="btn btn-x" href="https://twitter.com/intent/tweet?text=${shareText}" target="_blank">𝕏 Share</a>
    <a class="btn btn-s" href="https://ram.zenbin.org/gallery" target="_blank">◎ Gallery</a>
  </div>
</section>

<section class="preview">
  <div class="section-label">SCREEN PREVIEWS</div>
  <div class="thumbs">${thumbsHTML}</div>
</section>

<section class="brand-section">
  <div class="brand-grid">
    <div>
      <div class="bg-label">COLOR SYSTEM</div>

      <div class="bg-label" style="margin-top:16px;color:${P.fg3}">BACKGROUNDS</div>
      <div class="swatches">
        ${[
          { role: 'BG', hex: P.bg },
          { role: 'SURFACE', hex: P.surface },
          { role: 'CARD', hex: P.card },
          { role: 'PANEL', hex: P.panel },
        ].map(s => `<div class="swatch"><div class="swatch-box" style="background:${s.hex};border-color:${border}"></div><div class="swatch-role">${s.role}</div><div class="swatch-hex">${s.hex}</div></div>`).join('')}
      </div>

      <div class="bg-label" style="margin-top:20px;color:${P.fg3}">ACCENTS</div>
      <div class="swatches">
        ${[
          { role: 'BLUE', hex: P.blue },
          { role: 'PURPLE', hex: P.purple },
          { role: 'GREEN', hex: P.green },
          { role: 'AMBER', hex: P.amber },
          { role: 'TEAL', hex: P.teal },
        ].map(s => `<div class="swatch"><div class="swatch-box" style="background:${s.hex}"></div><div class="swatch-role">${s.role}</div><div class="swatch-hex">${s.hex}</div></div>`).join('')}
      </div>

      <div class="bg-label" style="margin-top:20px;color:${P.fg3}">NODE TYPE COLORS</div>
      <div class="node-strip">
        ${[
          { label: 'INPUT', c: P.nodeInput },
          { label: 'LLM', c: P.nodeLLM },
          { label: 'TOOL', c: P.nodeTool },
          { label: 'CODE', c: P.nodeCode },
          { label: 'OUTPUT', c: P.nodeOutput },
        ].map(n => `<div class="node-tag" style="background:${n.c}20;color:${n.c};border:1px solid ${n.c}50">${n.label}</div>`).join('')}
      </div>
    </div>

    <div>
      <div class="bg-label">TYPE SCALE</div>
      <div class="type-row">
        <div class="type-sample" style="font-size:40px;font-weight:900;line-height:1;letter-spacing:-2px">Display</div>
        <div class="type-spec">900 · 40px · tracking -2px</div>
      </div>
      <div class="type-row">
        <div class="type-sample" style="font-size:16px;font-weight:700;color:${P.fg}">Heading / Label</div>
        <div class="type-spec">700 · 15px · Inter</div>
      </div>
      <div class="type-row">
        <div class="type-sample" style="font-size:13px;color:${P.fg2}">Body text copy here</div>
        <div class="type-spec">400 · 13px · 1.6lh</div>
      </div>
      <div class="type-row">
        <div class="type-sample" style="font-size:9px;letter-spacing:2px;font-weight:700;color:${P.fg3}">SECTION CAPTION</div>
        <div class="type-spec">700 · 9px · ls 2</div>
      </div>
      <div class="type-row">
        <div class="type-sample" style="font-size:11px;font-family:'JetBrains Mono','Fira Code',monospace;color:${P.code}">node.execute(payload)</div>
        <div class="type-spec">Mono · 11px · JetBrains</div>
      </div>

      <div class="bg-label" style="margin-top:28px">SPACING (8px grid)</div>
      ${[4,8,12,16,24,32,48,64].map(s => `
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
          <div style="font-size:9px;color:${P.fg3};font-family:monospace;width:30px">${s}px</div>
          <div style="width:${s}px;height:8px;background:${P.blue}60;border-radius:2px"></div>
        </div>`).join('')}
    </div>
  </div>

  <div class="bg-label" style="margin-top:40px">DESIGN PRINCIPLES</div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:12px">
    ${[
      { t: 'Sparse Density', d: 'Every element earns its space. No decorative chrome — only functional signal.' },
      { t: 'Semantic Color', d: '5 node-type colors form a visual grammar agents can parse without reading.' },
      { t: 'Terminal Trust', d: 'Monospace logs build confidence: you always know what happened and when.' },
    ].map(p => `<div style="padding:20px;background:${P.card};border-radius:10px;border:1px solid ${border}"><div style="font-size:11px;font-weight:700;margin-bottom:8px;color:${P.fg}">${p.t}</div><div style="font-size:11px;color:${P.fg3};line-height:1.6">${p.d}</div></div>`).join('')}
  </div>

  <div class="tokens-block" style="margin-top:32px">
    <div class="bg-label">CSS DESIGN TOKENS</div>
    <pre class="tokens-pre">${cssTokens.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</pre>
    <button class="copy-btn" onclick="copyTokens()">COPY TOKENS</button>
  </div>
</section>

<section class="prompt-section">
  <div class="p-label">ORIGINAL PROMPT</div>
  <div class="p-text">"${PROMPT}"</div>
</section>

<section class="prd-section">
  <div class="p-label">PRODUCT BRIEF / PRD</div>
  ${prd}
</section>

<footer>
  <span>DAEDALUS · RAM Design Studio · ${DATE_STR}</span>
  <span>Inspired by Superset.sh · Runlayer · Linear</span>
</footer>

<script>
function copyTokens(){
  const txt=${JSON.stringify(cssTokens)};
  navigator.clipboard.writeText(txt).then(()=>{
    const t=document.getElementById('toast');
    t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'),2400);
  });
}
function copyPrompt(){
  navigator.clipboard.writeText(${JSON.stringify(PROMPT)}).then(()=>{
    const t=document.getElementById('toast');t.innerHTML='Prompt copied ✓';
    t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400);
  });
}
document.getElementById('cpBtn').addEventListener('click',copyPrompt);
document.getElementById('dlBtn').addEventListener('click',e=>{
  e.preventDefault();
  window.open('https://ram.zenbin.org/${SLUG}-viewer','_blank');
});
</script>
</body>
</html>`;

// ─────────────────────────────────────────────────────────────────────────────
// Build viewer HTML
// ─────────────────────────────────────────────────────────────────────────────
function buildViewerHTML() {
  const viewerTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>DAEDALUS — Viewer · RAM Design Studio</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#07080F;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;min-height:100vh;font-family:'Inter',-apple-system,sans-serif;padding:24px 16px}
  header{width:100%;max-width:1320px;display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #1C2036}
  .vlogo{font-size:13px;font-weight:800;letter-spacing:3px;color:#DFE5FF}.vlogo span{color:#5B7FFF}
  .back{font-size:11px;color:#3A4060;text-decoration:none;letter-spacing:0.5px}.back:hover{color:#5B7FFF}
  .screens-wrap{width:100%;max-width:1320px;display:flex;flex-direction:column;gap:32px}
  .screen-item{width:100%;border-radius:12px;overflow:hidden;border:1px solid #1C2036;position:relative}
  .screen-label{position:absolute;top:12px;left:16px;font-size:8px;letter-spacing:2px;font-weight:700;color:#3A4060;background:#07080Fcc;padding:4px 10px;border-radius:4px}
  svg{display:block;width:100%;height:auto}
</style>
</head>
<body>
<header>
  <div class="vlogo">DAE<span>DAL</span>US</div>
  <a class="back" href="https://ram.zenbin.org/${SLUG}">← Hero Page</a>
</header>
<div class="screens-wrap">
  ${screens.map((s, i) => `<div class="screen-item">
    <div class="screen-label">${(SCREEN_NAMES[i] || 'SCREEN ' + (i+1)).toUpperCase()}</div>
    ${screenSVG(s, 1280, 820)}
  </div>`).join('')}
</div>
</body>
</html>`;
  return viewerTemplate;
}

// ─────────────────────────────────────────────────────────────────────────────
// HTTP helpers
// ─────────────────────────────────────────────────────────────────────────────
function post(slug, title, html, subdomain) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ title, html });
    const opts = {
      hostname: 'zenbin.org',
      path: '/v1/pages/' + slug,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...(subdomain ? { 'X-Subdomain': subdomain } : {}),
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.write(body);
    req.end();
  });
}

async function getQueueSha() {
  const r = await new Promise((resolve) => {
    const opts = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/contents/queue.json`,
      method: 'GET',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'design-studio-agent/1.0',
        'Accept': 'application/vnd.github.v3+json',
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.end();
  });
  if (r.status !== 200) throw new Error('Cannot get SHA: ' + r.status);
  return JSON.parse(r.body).sha;
}

async function pushGalleryEntry(entry) {
  let queue;
  try {
    const raw = await new Promise((resolve) => {
      const opts = {
        hostname: 'raw.githubusercontent.com',
        path: `/${GITHUB_REPO}/main/queue.json`,
        method: 'GET',
        headers: { 'User-Agent': 'design-studio-agent/1.0' },
      };
      const req = https.request(opts, res => {
        let d = '';
        res.on('data', c => d += c);
        res.on('end', () => resolve(d));
      });
      req.on('error', () => resolve('{"submissions":[]}'));
      req.end();
    });
    queue = JSON.parse(raw);
  } catch { queue = { submissions: [] }; }
  queue.submissions.push(entry);
  const sha = await getQueueSha();
  const content = Buffer.from(JSON.stringify(queue, null, 2)).toString('base64');
  const body = JSON.stringify({
    message: `add: daedalus-heartbeat — visual AI pipeline builder`,
    content,
    sha,
  });
  return new Promise((resolve) => {
    const opts = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}/contents/queue.json`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'design-studio-agent/1.0',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Accept': 'application/vnd.github.v3+json',
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', e => resolve({ status: 0, error: e.message }));
    req.write(body);
    req.end();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main publish
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Publishing DAEDALUS to ZenBin…');

  // 1. Hero page
  console.log('  → Hero page:', SLUG);
  const heroR = await post(SLUG, 'DAEDALUS — Visual AI Pipeline Architect · RAM Design Studio', heroHTML, 'ram');
  console.log('    status:', heroR.status, heroR.status === 200 ? '✓' : heroR.body.slice(0, 120));

  // 2. Viewer page (with embedded pen)
  const viewerSlug = SLUG + '-viewer';
  let viewerHTML = buildViewerHTML();
  const injection = `<script>window.EMBEDDED_PEN = ${JSON.stringify(penJson)};<\/script>`;
  viewerHTML = viewerHTML.replace('<script>', injection + '\n<script>');
  console.log('  → Viewer:', viewerSlug);
  const viewerR = await post(viewerSlug, 'DAEDALUS Viewer · RAM Design Studio', viewerHTML, 'ram');
  console.log('    status:', viewerR.status, viewerR.status === 200 ? '✓' : viewerR.body.slice(0, 120));

  // 3. Gallery queue
  console.log('  → Gallery queue push');
  try {
    const gR = await pushGalleryEntry({
      id: SLUG,
      title: APP_NAME,
      subtitle: TAGLINE,
      design_url: `https://ram.zenbin.org/${SLUG}`,
      viewer_url: `https://ram.zenbin.org/${viewerSlug}`,
      thumbnail_url: `https://ram.zenbin.org/${SLUG}`,
      tags: ['dark-mode', 'ai', 'pipeline', 'dashboard', 'desktop', 'bento-grid', 'node-graph'],
      created_at: new Date().toISOString(),
      status: 'published',
    });
    console.log('    status:', gR.status, gR.status === 200 ? '✓' : gR.body.slice(0, 120));
  } catch (e) {
    console.log('    gallery push failed:', e.message);
  }

  console.log('\n✓ DAEDALUS published!');
  console.log('  Hero:   https://ram.zenbin.org/' + SLUG);
  console.log('  Viewer: https://ram.zenbin.org/' + viewerSlug);
}

main().catch(e => { console.error(e); process.exit(1); });
