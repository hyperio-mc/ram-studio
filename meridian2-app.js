'use strict';
// meridian2-app.js
// MERIDIAN — AI-Native Code Review Intelligence
//
// Challenge: Design a dark-mode AI code review & PR intelligence dashboard
// inspired by:
//
// 1. Linear.app (darkmodedesign.com showcase, March 2026) — ultra-dark #08090A
//    background, indigo #5E6AD2 accent, dense data hierarchies, triage labels,
//    "The product development system for teams and agents." AI-native workflows
//    with agents reviewing, labeling, routing PRs.
//
// 2. Superset.sh (godly.website featured via Dark Mode Design) — parallel agent
//    orchestration UI, terminal-style code diffs, multi-agent workstream panels.
//    "Orchestrate swarms of Claude Code, Codex, etc. in parallel."
//
// 3. Midday.ai (darkmodedesign.com) — clean transactional dark data UI, subtle
//    surface layering, every pixel earns its place.
//
// Palette: near-void black (#08090A) + indigo (#5E6AD2) + subtle layered surfaces
// Screens: 5 mobile (390×844)

const fs   = require('fs');
const path = require('path');

// ── Palette ───────────────────────────────────────────────────────────────────
const P = {
  bg:       '#08090A',   // Linear's signature near-void black
  surface:  '#111214',   // elevated surface
  surface2: '#181A1E',   // card/panel surface
  surface3: '#1E2128',   // inner card
  border:   '#23262D',   // subtle border
  border2:  '#2C3040',   // slightly more visible
  muted:    '#52576B',   // muted dim text
  muted2:   '#7A8099',   // slightly brighter muted
  fg:       '#E2E4E9',   // near-white primary text
  fg2:      '#C4C7D2',   // secondary text
  accent:   '#5E6AD2',   // Linear indigo — exact match
  accentLt: '#8B94E8',   // lighter indigo
  accentBg: '#5E6AD215', // very subtle indigo tint
  green:    '#26C281',   // success / approved
  red:      '#E5484D',   // error / changes requested
  amber:    '#F5A623',   // warning / needs review
  violet:   '#9B59B6',   // AI agent activity
  dim:      '#0D0F12',   // darkest fill
};

let _id = 0;
const uid = () => `m${++_id}`;

// ── Primitives ────────────────────────────────────────────────────────────────
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
  fontSize: opts.size || 13,
  fontWeight: String(opts.weight || 400),
  fill: opts.fill || P.fg,
  textAlign: opts.align || 'left',
  ...(opts.ls !== undefined ? { letterSpacing: opts.ls } : {}),
  ...(opts.lh !== undefined ? { lineHeight: opts.lh } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const E = (x, y, w, h, fill, opts = {}) => ({
  id: uid(), type: 'ellipse', x, y, width: w, height: h, fill,
  ...(opts.stroke ? { stroke: { align: 'inside', thickness: opts.sw || 1, fill: opts.stroke } } : {}),
  ...(opts.opacity !== undefined ? { opacity: opts.opacity } : {}),
});

const Line  = (x, y, w, fill = P.border) => F(x, y, w, 1, fill, {});
const VLine = (x, y, h, fill = P.border) => F(x, y, 1, h, fill, {});

// ── Pill labels (Linear-style) ─────────────────────────────────────────────────
const Pill = (x, y, label, color, opts = {}) => {
  const w = opts.w || (label.length * 6.5 + 18);
  return F(x, y, w, 20, color + '1F', {
    r: 4,
    stroke: color + '3A',
    sw: 1,
    ch: [
      T(label, 0, 3, w, 14, { size: 9, fill: color, weight: 600, ls: 0.4, align: 'center' }),
    ],
  });
};

// ── Status dot ────────────────────────────────────────────────────────────────
const Dot = (x, y, color) => E(x, y, 7, 7, color);

// ── Glow ──────────────────────────────────────────────────────────────────────
const Glow = (cx, cy, r, color) => [
  E(cx - r*2.2, cy - r*2.2, r*4.4, r*4.4, color + '05'),
  E(cx - r*1.5, cy - r*1.5, r*3.0, r*3.0, color + '0C'),
  E(cx - r,     cy - r,     r*2,   r*2,   color + '18'),
  E(cx - r*0.5, cy - r*0.5, r,     r,     color + '28'),
];

// ── Code diff line ─────────────────────────────────────────────────────────────
const DiffLine = (x, y, lineNum, code, type) => {
  const bgMap = { add: P.green + '14', remove: P.red + '14', neutral: 'transparent' };
  const fgMap = { add: P.green, remove: P.red, neutral: P.muted };
  const prefixMap = { add: '+', remove: '-', neutral: ' ' };
  return F(x, y, 350, 20, bgMap[type], {
    ch: [
      T(String(lineNum).padStart(3, ' '), 0, 3, 28, 14, { size: 9, fill: P.muted, align: 'right' }),
      T(prefixMap[type], 30, 3, 12, 14, { size: 9, fill: fgMap[type] }),
      T(code, 44, 3, 296, 14, { size: 9, fill: type === 'neutral' ? P.fg2 : fgMap[type] }),
    ],
  });
};

// ── PR Row item ────────────────────────────────────────────────────────────────
const PRRow = (x, y, num, title, author, status, labels, aiTag, timeAgo) => {
  const statusColor = { open: P.green, draft: P.muted2, review: P.amber, approved: P.accentLt }[status] || P.muted;
  const statusLabel = { open: '● Open', draft: '○ Draft', review: '◐ Review', approved: '✓ Approved' }[status];
  const statusW = { open: 52, draft: 56, review: 60, approved: 72 }[status] || 52;

  const labelPills = labels.map((l, i) => Pill(14 + i * (l.length * 6.5 + 24), 46, l, P.accent));

  return F(x, y, 360, 74, P.surface2, {
    r: 8, stroke: P.border, sw: 1,
    ch: [
      T('#' + num, 14, 10, 36, 14, { size: 10, fill: P.muted2, weight: 500 }),
      T(title, 52, 10, 210, 14, { size: 11, fill: P.fg, weight: 500 }),
      Pill(280, 8, statusLabel, statusColor, { w: statusW }),
      Dot(14, 52, aiTag ? P.violet : P.muted),
      T(aiTag ? 'AI' : author, 26, 46, 80, 14, { size: 9, fill: aiTag ? P.violet : P.muted2 }),
      ...labelPills,
      T(timeAgo, 302, 46, 50, 14, { size: 9, fill: P.muted, align: 'right' }),
    ],
  });
};

// ── Agent task row ─────────────────────────────────────────────────────────────
const AgentRow = (x, y, agentName, task, status, progress) => {
  const statusColor = { running: P.violet, complete: P.green, queued: P.amber }[status] || P.muted;
  const statusLabel = { running: 'Running', complete: 'Done', queued: 'Queued' }[status];

  return F(x, y, 350, 72, P.surface2, {
    r: 8, stroke: P.border, sw: 1,
    ch: [
      F(0, 0, 3, 72, statusColor, { r: 2, opacity: 0.7 }),
      T(agentName, 14, 10, 200, 14, { size: 10, fill: statusColor, weight: 700 }),
      Pill(260, 8, statusLabel, statusColor, { w: 72 }),
      T(task, 14, 28, 310, 14, { size: 9, fill: P.fg2 }),
      F(14, 52, 322, 4, P.surface3, { r: 2 }),
      F(14, 52, Math.max(3, Math.round(322 * progress / 100)), 4, statusColor, { r: 2, opacity: 0.8 }),
      T(progress + '%', 288, 44, 44, 12, { size: 8, fill: P.muted, align: 'right' }),
    ],
  });
};

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 1 — PR QUEUE
// ══════════════════════════════════════════════════════════════════════════════
function screenPRQueue(ox) {
  return F(ox, 0, 390, 844, P.bg, { ch: [
    T('9:41', 20, 16, 60, 16, { size: 12, weight: 600, fill: P.fg }),
    T('main', 296, 14, 74, 18, { size: 10, fill: P.muted2, align: 'right' }),

    T('MERIDIAN', 20, 48, 200, 24, { size: 18, weight: 800, fill: P.fg, ls: 2 }),
    T('Code Review Intelligence', 20, 76, 220, 14, { size: 10, fill: P.muted }),

    // filter tabs
    ...['All PRs', 'AI Triage', 'Needs Review', 'Mine'].map((tab, i) => {
      const isActive = i === 0;
      const tw = tab.length * 6.8 + 20;
      const offsets = [0, 66, 142, 238];
      return F(20 + offsets[i], 100, tw, 26, isActive ? P.accent + '22' : 'transparent', {
        r: 6, stroke: isActive ? P.accent + '55' : P.border, sw: 1,
        ch: [T(tab, 0, 5, tw, 16, { size: 9, fill: isActive ? P.accentLt : P.muted2, weight: isActive ? 600 : 400, align: 'center' })],
      });
    }),

    // stats strip
    F(20, 138, 350, 48, P.surface, { r: 8, stroke: P.border, sw: 1, ch: [
      VLine(86, 10, 28, P.border),
      VLine(173, 10, 28, P.border),
      VLine(260, 10, 28, P.border),
      T('14', 8, 10, 70, 22, { size: 18, weight: 800, fill: P.fg, align: 'center' }),
      T('Open', 8, 34, 70, 10, { size: 7, fill: P.muted, align: 'center', ls: 0.5 }),
      T('5', 95, 10, 70, 22, { size: 18, weight: 800, fill: P.amber, align: 'center' }),
      T('Needs Review', 95, 34, 70, 10, { size: 7, fill: P.muted, align: 'center', ls: 0.5 }),
      T('3', 182, 10, 70, 22, { size: 18, weight: 800, fill: P.violet, align: 'center' }),
      T('AI Active', 182, 34, 70, 10, { size: 7, fill: P.muted, align: 'center', ls: 0.5 }),
      T('7', 269, 10, 72, 22, { size: 18, weight: 800, fill: P.green, align: 'center' }),
      T('Approved', 269, 34, 72, 10, { size: 7, fill: P.muted, align: 'center', ls: 0.5 }),
    ]}),

    T('PULL REQUESTS', 20, 200, 250, 12, { size: 8, fill: P.muted, ls: 1.5, weight: 600 }),
    T('Priority', 296, 198, 64, 14, { size: 9, fill: P.accent, align: 'right' }),

    PRRow(15, 220, '847', 'feat: streaming response chunks via WS', 'kai', 'review', ['perf', 'backend'], true, '12m'),
    PRRow(15, 302, '846', 'fix: auth token refresh race condition', 'sam', 'open', ['bug', 'auth'], false, '1h'),
    PRRow(15, 384, '845', 'chore: upgrade react-query to v5', 'priya', 'open', ['deps'], false, '2h'),
    PRRow(15, 466, '844', 'feat: bento grid dashboard layout v2', 'alex', 'approved', ['ui'], true, '4h'),
    PRRow(15, 548, '843', 'refactor: consolidate API middleware', 'jordan', 'draft', ['refactor'], false, '6h'),

    F(20, 640, 350, 40, P.violet + '0F', { r: 8, stroke: P.violet + '2A', sw: 1, ch: [
      T('AI triaged 3 PRs in the last hour', 14, 11, 240, 18, { size: 9, fill: P.violet }),
      T('View', 306, 11, 30, 18, { size: 9, fill: P.violet, align: 'right' }),
    ]}),

    F(0, 764, 390, 80, P.surface, { ch: [
      Line(0, 0, 390, P.border),
      ...[['Q', 'Queue', 0], ['D', 'Diff', 1], ['A', 'Agents', 2], ['I', 'Insights', 3], ['S', 'Settings', 4]].map(([ic, lb, j]) => {
        const nx = 8 + j * 75;
        const isActive = j === 0;
        return [
          isActive ? F(nx + 14, 6, 46, 46, P.accent + '1A', { r: 23 }) : null,
          T(ic, nx + 16, 12, 42, 22, { size: 14, weight: 700, fill: isActive ? P.accentLt : P.muted, align: 'center' }),
          T(lb, nx + 4, 38, 60, 12, { size: 7, fill: isActive ? P.accentLt : P.muted, weight: isActive ? 600 : 400, align: 'center', ls: 0.3 }),
        ].filter(Boolean);
      }).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 2 — DIFF VIEWER
// ══════════════════════════════════════════════════════════════════════════════
function screenDiffViewer(ox) {
  return F(ox, 0, 390, 844, P.bg, { ch: [
    T('9:41', 20, 16, 60, 16, { size: 12, weight: 600, fill: P.fg }),

    T('Queue', 20, 48, 60, 18, { size: 11, fill: P.muted2 }),
    T('PR #847', 90, 48, 200, 18, { size: 11, fill: P.fg, weight: 600 }),
    Pill(294, 44, 'Review', P.amber, { w: 60 }),

    T('feat: streaming response chunks', 20, 76, 320, 14, { size: 11, fill: P.fg, weight: 500 }),
    T('via WebSocket', 20, 94, 320, 14, { size: 11, fill: P.fg2 }),

    Dot(20, 120, P.violet),
    T('AI-reviewed  +184 / -23  3 files', 32, 116, 290, 14, { size: 9, fill: P.muted2 }),

    // file tabs
    F(20, 138, 350, 28, P.surface, { r: 6, stroke: P.border, sw: 1, ch: [
      F(2, 2, 110, 24, P.accent + '22', { r: 5, stroke: P.accent + '44', sw: 1, ch: [
        T('ws-handler.ts', 8, 5, 100, 14, { size: 9, fill: P.accentLt }),
      ]}),
      T('api/stream.ts', 118, 7, 100, 14, { size: 9, fill: P.muted }),
      T('+1 more', 234, 7, 60, 14, { size: 9, fill: P.muted }),
    ]}),

    // diff block
    F(20, 176, 350, 300, P.dim, { r: 8, stroke: P.border2, sw: 1, clip: true, ch: [
      F(0, 0, 350, 24, P.surface, { ch: [
        T('ws-handler.ts', 12, 5, 200, 14, { size: 9, fill: P.fg2 }),
        T('+42 / -8', 280, 5, 60, 14, { size: 9, fill: P.muted, align: 'right' }),
      ]}),
      Line(0, 24, 350, P.border),
      DiffLine(0, 26,  41, "import { WebSocket } from 'ws'", 'neutral'),
      DiffLine(0, 46,  42, "import { StreamBuffer } from './lib'", 'neutral'),
      DiffLine(0, 66,  43, '', 'neutral'),
      DiffLine(0, 86,  44, 'export async function handleStream(', 'neutral'),
      DiffLine(0, 106, 45, '  socket: WebSocket, req: Request', 'neutral'),
      DiffLine(0, 126, 46, ') {', 'neutral'),
      DiffLine(0, 146, 47, '-  const data = await req.json()', 'remove'),
      DiffLine(0, 166, 48, '-  socket.send(JSON.stringify(data))', 'remove'),
      DiffLine(0, 186, 49, '+  const buf = new StreamBuffer()', 'add'),
      DiffLine(0, 206, 50, '+  for await (const chunk of req.body) {', 'add'),
      DiffLine(0, 226, 51, '+    buf.append(chunk)', 'add'),
      DiffLine(0, 246, 52, '+    socket.send(buf.flush())', 'add'),
      DiffLine(0, 266, 53, '+  }', 'add'),
      DiffLine(0, 286, 54, '}', 'neutral'),
    ]}),

    // AI comment
    F(20, 484, 350, 78, P.violet + '0D', { r: 8, stroke: P.violet + '2A', sw: 1, ch: [
      T('AI Review — Line 50', 14, 12, 200, 14, { size: 9, fill: P.violet, weight: 700 }),
      Pill(256, 10, 'Suggestion', P.violet, { w: 80 }),
      T('Consider error handling for malformed chunks. Wrap loop body in try/catch to prevent socket crashes.', 14, 34, 320, 32, { size: 9, fill: P.fg2, lh: 1.5 }),
    ]}),

    // action buttons
    F(20, 572, 110, 36, P.red + '18', { r: 8, stroke: P.red + '33', sw: 1, ch: [
      T('Request Changes', 0, 9, 110, 18, { size: 9, fill: P.red, align: 'center', weight: 600 }),
    ]}),
    F(138, 572, 90, 36, P.amber + '18', { r: 8, stroke: P.amber + '33', sw: 1, ch: [
      T('Comment', 0, 9, 90, 18, { size: 9, fill: P.amber, align: 'center', weight: 600 }),
    ]}),
    F(236, 572, 134, 36, P.green + '18', { r: 8, stroke: P.green + '33', sw: 1, ch: [
      T('Approve PR', 0, 9, 134, 18, { size: 9, fill: P.green, align: 'center', weight: 600 }),
    ]}),

    F(0, 764, 390, 80, P.surface, { ch: [
      Line(0, 0, 390, P.border),
      ...[['Q', 'Queue', 0], ['D', 'Diff', 1], ['A', 'Agents', 2], ['I', 'Insights', 3], ['S', 'Settings', 4]].map(([ic, lb, j]) => {
        const nx = 8 + j * 75;
        const isActive = j === 1;
        return [
          isActive ? F(nx + 14, 6, 46, 46, P.accent + '1A', { r: 23 }) : null,
          T(ic, nx + 16, 12, 42, 22, { size: 14, weight: 700, fill: isActive ? P.accentLt : P.muted, align: 'center' }),
          T(lb, nx + 4, 38, 60, 12, { size: 7, fill: isActive ? P.accentLt : P.muted, weight: isActive ? 600 : 400, align: 'center', ls: 0.3 }),
        ].filter(Boolean);
      }).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 3 — AGENT ACTIVITY
// ══════════════════════════════════════════════════════════════════════════════
function screenAgentActivity(ox) {
  return F(ox, 0, 390, 844, P.bg, { ch: [
    T('9:41', 20, 16, 60, 16, { size: 12, weight: 600, fill: P.fg }),
    ...Glow(195, 100, 80, P.violet),

    T('AI AGENTS', 20, 48, 250, 28, { size: 22, weight: 800, fill: P.fg, ls: 2 }),
    T('3 agents active  12 tasks this session', 20, 80, 300, 14, { size: 10, fill: P.muted }),

    Dot(316, 52, P.violet),
    T('LIVE', 328, 48, 40, 18, { size: 9, fill: P.violet, weight: 700, ls: 1 }),

    F(20, 106, 350, 48, P.surface, { r: 8, stroke: P.border, sw: 1, ch: [
      VLine(117, 10, 28, P.border),
      VLine(233, 10, 28, P.border),
      T('3', 8, 10, 101, 22, { size: 18, weight: 800, fill: P.violet, align: 'center' }),
      T('Running', 8, 34, 101, 10, { size: 7, fill: P.muted, align: 'center', ls: 0.5 }),
      T('9', 125, 10, 100, 22, { size: 18, weight: 800, fill: P.green, align: 'center' }),
      T('Completed', 125, 34, 100, 10, { size: 7, fill: P.muted, align: 'center', ls: 0.5 }),
      T('2', 241, 10, 100, 22, { size: 18, weight: 800, fill: P.amber, align: 'center' }),
      T('Queued', 241, 34, 100, 10, { size: 7, fill: P.muted, align: 'center', ls: 0.5 }),
    ]}),

    T('ACTIVE', 20, 170, 250, 12, { size: 8, fill: P.muted, ls: 1.5, weight: 600 }),

    AgentRow(20, 190, 'Reviewer-1', 'Analyzing PR #847 ws-handler.ts semantic review', 'running', 72),
    AgentRow(20, 270, 'Reviewer-2', 'Security scan PR #846 auth token refresh flow', 'running', 45),
    AgentRow(20, 350, 'Triager-1',  'Auto-labeling 4 incoming PRs from main queue', 'running', 88),
    AgentRow(20, 430, 'Reviewer-3', 'Deps analysis PR #845 react-query v5 compat', 'queued', 0),
    AgentRow(20, 510, 'Summarizer', 'Weekly sprint summary 7 merged PRs', 'queued', 0),

    T('COMPLETED', 20, 598, 250, 12, { size: 8, fill: P.muted, ls: 1.5, weight: 600 }),
    ...[
      ['PR #844', 'Approved: bento grid layout, no issues found', '4m'],
      ['PR #841', 'Changes: 3 security issues in JWT logic', '22m'],
      ['PR #839', 'Approved: logging middleware refactor', '41m'],
    ].map(([num, msg, ago], i) =>
      F(20, 618 + i * 44, 350, 36, P.surface2, {
        r: 6, stroke: P.border, sw: 1,
        ch: [
          F(0, 0, 3, 36, P.green, { r: 2, opacity: 0.5 }),
          T(num, 12, 8, 50, 12, { size: 8, fill: P.green, weight: 600 }),
          T(msg, 64, 8, 240, 12, { size: 8, fill: P.fg2 }),
          T(ago, 302, 8, 40, 12, { size: 8, fill: P.muted, align: 'right' }),
        ],
      })
    ),

    F(0, 764, 390, 80, P.surface, { ch: [
      Line(0, 0, 390, P.border),
      ...[['Q', 'Queue', 0], ['D', 'Diff', 1], ['A', 'Agents', 2], ['I', 'Insights', 3], ['S', 'Settings', 4]].map(([ic, lb, j]) => {
        const nx = 8 + j * 75;
        const isActive = j === 2;
        return [
          isActive ? F(nx + 14, 6, 46, 46, P.accent + '1A', { r: 23 }) : null,
          T(ic, nx + 16, 12, 42, 22, { size: 14, weight: 700, fill: isActive ? P.accentLt : P.muted, align: 'center' }),
          T(lb, nx + 4, 38, 60, 12, { size: 7, fill: isActive ? P.accentLt : P.muted, weight: isActive ? 600 : 400, align: 'center', ls: 0.3 }),
        ].filter(Boolean);
      }).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 4 — INSIGHTS (bento grid)
// ══════════════════════════════════════════════════════════════════════════════
function screenInsights(ox) {
  const SparkBar = (x, y, vals, color) => {
    const barW = Math.floor(180 / vals.length) - 2;
    return vals.map((v, i) => {
      const h = Math.round(v * 0.28 + 4);
      return F(x + i * (barW + 2), y + (28 - h), barW, h, color + '80', { r: 1 });
    });
  };

  const cycleVals  = [40, 55, 38, 72, 62, 81, 68, 90, 75, 88, 95, 82];
  const mergeVals  = [3, 5, 4, 7, 6, 9, 8, 12, 10, 11, 14, 12];

  return F(ox, 0, 390, 844, P.bg, { ch: [
    T('9:41', 20, 16, 60, 16, { size: 12, weight: 600, fill: P.fg }),

    T('INSIGHTS', 20, 48, 250, 28, { size: 22, weight: 800, fill: P.fg, ls: 2 }),
    T('Sprint 44  March 17-28 2026', 20, 80, 280, 14, { size: 10, fill: P.muted }),

    // bento row 1
    F(20, 106, 167, 88, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      T('CYCLE TIME', 12, 10, 140, 11, { size: 7, fill: P.muted, ls: 1.5, weight: 600 }),
      T('4.2h', 12, 26, 100, 38, { size: 32, weight: 900, fill: P.accent }),
      T('18% improvement', 12, 68, 150, 12, { size: 8, fill: P.green }),
    ]}),
    F(203, 106, 167, 88, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      T('REVIEW LAG', 12, 10, 140, 11, { size: 7, fill: P.muted, ls: 1.5, weight: 600 }),
      T('1.8h', 12, 26, 100, 38, { size: 32, weight: 900, fill: P.accentLt }),
      T('31% via AI assist', 12, 68, 150, 12, { size: 8, fill: P.green }),
    ]}),

    // merge rate full-width
    F(20, 202, 350, 72, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      T('MERGE RATE', 12, 10, 120, 11, { size: 7, fill: P.muted, ls: 1.5, weight: 600 }),
      T('87%', 12, 26, 80, 32, { size: 26, weight: 900, fill: P.green }),
      T('52 PRs merged this sprint', 100, 26, 200, 14, { size: 9, fill: P.fg2 }),
      T('+12% from last sprint', 100, 44, 200, 14, { size: 9, fill: P.green }),
      ...SparkBar(190, 30, mergeVals, P.green),
    ]}),

    // trend card
    F(20, 282, 350, 72, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      T('CYCLE TIME TREND - 12 SPRINTS', 12, 10, 200, 11, { size: 7, fill: P.muted, ls: 1.2, weight: 600 }),
      T('Consistently improving', 12, 26, 180, 14, { size: 9, fill: P.fg2 }),
      T('All time best this sprint', 12, 44, 180, 14, { size: 9, fill: P.green }),
      ...SparkBar(194, 30, cycleVals, P.accent),
    ]}),

    // AI impact
    F(20, 362, 350, 80, P.violet + '10', { r: 10, stroke: P.violet + '2A', sw: 1, ch: [
      T('AI IMPACT', 12, 10, 200, 12, { size: 8, fill: P.violet, weight: 700, ls: 1 }),
      VLine(138, 26, 38, P.violet + '30'),
      VLine(254, 26, 38, P.violet + '30'),
      T('47', 12, 22, 118, 24, { size: 20, weight: 900, fill: P.violet, align: 'center' }),
      T('Auto-reviews', 12, 50, 118, 12, { size: 7, fill: P.muted, align: 'center', ls: 0.5 }),
      T('94%', 146, 22, 100, 24, { size: 20, weight: 900, fill: P.violet, align: 'center' }),
      T('Accuracy', 146, 50, 100, 12, { size: 7, fill: P.muted, align: 'center', ls: 0.5 }),
      T('3.1h', 262, 22, 80, 24, { size: 20, weight: 900, fill: P.violet, align: 'center' }),
      T('Time saved', 262, 50, 80, 12, { size: 7, fill: P.muted, align: 'center', ls: 0.5 }),
    ]}),

    T('TOP REVIEWERS', 20, 458, 250, 12, { size: 8, fill: P.muted, ls: 1.5, weight: 600 }),
    ...[['kai', 18, P.accentLt], ['priya', 15, P.green], ['sam', 12, P.amber], ['alex', 11, P.fg2]].map(([name, count, color], i) =>
      F(20, 478 + i * 42, 350, 34, P.surface, {
        r: 8, stroke: P.border, sw: 1,
        ch: [
          E(12, 8, 18, 18, color + '22', { stroke: color + '44', sw: 1 }),
          T(name[0].toUpperCase(), 12, 9, 18, 14, { size: 9, fill: color, weight: 700, align: 'center' }),
          T(name, 38, 8, 120, 18, { size: 10, fill: P.fg, weight: 500 }),
          F(168, 13, 100, 6, P.surface3, { r: 3 }),
          F(168, 13, Math.round(100 * count / 18), 6, color, { r: 3, opacity: 0.8 }),
          T(count + ' reviews', 278, 8, 64, 18, { size: 9, fill: color, align: 'right', weight: 600 }),
        ],
      })
    ),

    F(0, 764, 390, 80, P.surface, { ch: [
      Line(0, 0, 390, P.border),
      ...[['Q', 'Queue', 0], ['D', 'Diff', 1], ['A', 'Agents', 2], ['I', 'Insights', 3], ['S', 'Settings', 4]].map(([ic, lb, j]) => {
        const nx = 8 + j * 75;
        const isActive = j === 3;
        return [
          isActive ? F(nx + 14, 6, 46, 46, P.accent + '1A', { r: 23 }) : null,
          T(ic, nx + 16, 12, 42, 22, { size: 14, weight: 700, fill: isActive ? P.accentLt : P.muted, align: 'center' }),
          T(lb, nx + 4, 38, 60, 12, { size: 7, fill: isActive ? P.accentLt : P.muted, weight: isActive ? 600 : 400, align: 'center', ls: 0.3 }),
        ].filter(Boolean);
      }).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// SCREEN 5 — SETTINGS
// ══════════════════════════════════════════════════════════════════════════════
function screenSettings(ox) {
  const Toggle = (x, y, on) => F(x, y, 40, 22, on ? P.accent : P.surface3, {
    r: 11, stroke: on ? P.accent + '55' : P.border, sw: 1,
    ch: [ E(on ? 21 : 3, 3, 16, 16, on ? P.bg : P.muted2) ],
  });

  const Row = (x, y, label, value, hasToggle, toggleOn) => F(x, y, 350, 42, 'transparent', {
    ch: [
      Line(0, 42, 350, P.border),
      T(label, 0, 12, 220, 18, { size: 11, fill: P.fg }),
      ...(hasToggle
        ? [Toggle(308, 10, toggleOn)]
        : [T(value || 'More', 220, 12, 130, 18, { size: 11, fill: P.muted2, align: 'right' })]
      ),
    ],
  });

  return F(ox, 0, 390, 844, P.bg, { ch: [
    T('9:41', 20, 16, 60, 16, { size: 12, weight: 600, fill: P.fg }),

    T('SETTINGS', 20, 48, 250, 28, { size: 22, weight: 800, fill: P.fg, ls: 2 }),
    T('Workspace: acme-corp', 20, 80, 280, 14, { size: 10, fill: P.muted }),

    // user badge
    F(20, 106, 350, 56, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      E(14, 14, 28, 28, P.accent + '22', { stroke: P.accent + '44', sw: 1 }),
      T('KV', 14, 18, 28, 18, { size: 10, weight: 800, fill: P.accentLt, align: 'center' }),
      T('Kai Vasquez', 52, 10, 200, 16, { size: 12, fill: P.fg, weight: 600 }),
      T('kai@acme.corp   Admin', 52, 30, 200, 14, { size: 9, fill: P.muted }),
      Pill(284, 18, 'Admin', P.accent, { w: 52 }),
    ]}),

    T('AI AGENTS', 20, 178, 250, 12, { size: 8, fill: P.muted, ls: 1.5, weight: 600 }),
    F(20, 196, 350, 178, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      Row(14, 0,   'Auto-triage new PRs',   '', true, true),
      Row(14, 42,  'AI code review',        '', true, true),
      Row(14, 84,  'Security scanning',     '', true, false),
      Row(14, 126, 'Model',                 'Claude Opus 4', false, false),
    ]}),

    T('INTEGRATIONS', 20, 390, 250, 12, { size: 8, fill: P.muted, ls: 1.5, weight: 600 }),
    F(20, 408, 350, 134, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      Row(14, 0,   'GitHub',   'Connected', false, false),
      Row(14, 42,  'Slack',    'Connected', false, false),
      Row(14, 84,  'Linear',   'Connect',   false, false),
    ]}),

    T('NOTIFICATIONS', 20, 558, 250, 12, { size: 8, fill: P.muted, ls: 1.5, weight: 600 }),
    F(20, 576, 350, 92, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      Row(14, 0,  'Push notifications', '', true, true),
      Row(14, 42, 'Slack digest',       '', true, true),
    ]}),

    F(20, 682, 350, 40, P.surface, { r: 10, stroke: P.border, sw: 1, ch: [
      T('Sign out', 0, 11, 350, 18, { size: 11, fill: P.red, align: 'center' }),
    ]}),

    T('MERIDIAN v1.0.0   2026', 0, 736, 390, 14, { size: 8, fill: P.muted, align: 'center', ls: 0.5 }),

    F(0, 764, 390, 80, P.surface, { ch: [
      Line(0, 0, 390, P.border),
      ...[['Q', 'Queue', 0], ['D', 'Diff', 1], ['A', 'Agents', 2], ['I', 'Insights', 3], ['S', 'Settings', 4]].map(([ic, lb, j]) => {
        const nx = 8 + j * 75;
        const isActive = j === 4;
        return [
          isActive ? F(nx + 14, 6, 46, 46, P.accent + '1A', { r: 23 }) : null,
          T(ic, nx + 16, 12, 42, 22, { size: 14, weight: 700, fill: isActive ? P.accentLt : P.muted, align: 'center' }),
          T(lb, nx + 4, 38, 60, 12, { size: 7, fill: isActive ? P.accentLt : P.muted, weight: isActive ? 600 : 400, align: 'center', ls: 0.3 }),
        ].filter(Boolean);
      }).flat(),
    ]}),
  ]});
}

// ══════════════════════════════════════════════════════════════════════════════
// ASSEMBLE & SAVE
// ══════════════════════════════════════════════════════════════════════════════
const SCREEN_W = 390;
const GAP      = 80;

const doc = {
  version: '2.8',
  name: 'MERIDIAN — AI-Native Code Review Intelligence',
  width:  5 * SCREEN_W + 6 * GAP,
  height: 844,
  fill:   '#05060A',
  children: [
    screenPRQueue      (GAP),
    screenDiffViewer   (GAP + (SCREEN_W + GAP)),
    screenAgentActivity(GAP + (SCREEN_W + GAP) * 2),
    screenInsights     (GAP + (SCREEN_W + GAP) * 3),
    screenSettings     (GAP + (SCREEN_W + GAP) * 4),
  ],
};

const outPath = path.join(__dirname, 'meridian2.pen');
fs.writeFileSync(outPath, JSON.stringify(doc, null, 2));
console.log('✓ meridian2.pen written -', Math.round(fs.statSync(outPath).size / 1024) + 'KB');
console.log('  5 screens: PR Queue / Diff Viewer / Agent Activity / Insights / Settings');
console.log('  Palette: near-void #08090A / Linear indigo #5E6AD2 / AI violet #9B59B6');
